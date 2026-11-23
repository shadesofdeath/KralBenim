// wc_g_objects — watercolour props and hero objects for WC.G (arms and armour, vessels, instruments, writing,
// treasure, tools). Each one is painted the way a watercolourist builds an object: a light local-colour wash,
// form strokes with dry-brush flying white, a shadow wash on the side away from the light (upper-left), a darker
// core shadow with reflected light beyond it, highlights lifted back to paper, then loose broken ink edges and the
// small dark accents. A soft cast-shadow wash sits under every object (o.shadow: false removes it).
//
// Contract (wc__lib.js): WC.G.name(sc, o) -> {S, parts, live?, top?}. Origin = base centre where it rests, y up is
// negative. sc 1 ≈ the object's long side at ~300 px (a hero subject at sc 1–2.5, a prop at ~0.3). Long things
// (swords, spears, guns, keys, telescopes...) lie on the ground, pointing right. `parts` names points of the object
// (local px at that sc) that wc_specimen notes can point at ({part: "tip"}); every object also has the generic
// top / bottom / left / right / center (added by wc_specimen from its bounds).
//
// Generators (o options; colour options take a token name: "red", "cloth", "clothB", "gold", ...; every object also
// takes shadow: false). Metal options: 'gold'|'silver'|'bronze'|'brass'|'steel'|'iron'|'copper'.
//   sword        style 'kilij' (Ottoman, flared yelman)|'scimitar'|'gladius'|'longsword'|'katana', upright (point down,
//                stuck in the ground)            parts: tip blade edge spine guard grip pommel (+ yelman for kilij)
//   shield       style 'round' (Viking planks, painted quarters, boss)|'kite' (Norman)|'scutum' (Roman)|'ottoman'
//                (kalkan: cane spiral wrapped in silk, iron boss), color      parts: boss rim face (+ cross, bolt)
//   helmet       style 'corinthian' (crest: false removes the horsehair crest, color)|'roman'|'viking' (spectacle
//                guard, mail)|'knight' (great helm)|'ottoman' (spiked turban helmet, gilt band, nasal, mail)
//                parts: dome eye nasal rim crest cheek neck band mail spike breath (whichever the style has)
//   crown        style 'royal' (arches, velvet cap: color, monde and cross)|'circlet'    parts: band gem points cross
//   coin         metal, motif 'head' (laureate profile)|'tughra'|'star'                   parts: face motif rim edge
//   scroll       open (sheet between two rollers, lines of writing), color (ribbon), seal (closed)   parts: roll text seal end initial
//   book         open, color (cover)                parts: cover pages spine clasp text
//   letter       folded letter with a wax seal, color (seal)        parts: seal fold text
//   quill        quill feather in an ink pot, color (feather)       parts: feather nib pot ink
//   hourglass    fill 0..1 (sand left in the top bulb), wood; live: the falling sand     parts: sand bulb neck frame plate top
//   candle       holder true|false; live: flame + glow              parts: flame wick wax drip holder
//   oil_lamp     Roman clay lamp; live: flame                       parts: flame nozzle body handle hole
//   lantern      color 'brass'|'iron'; live: candle flame + glow    parts: glow cap ring frame base
//   key          metal                              parts: bow shank bit
//   chest        domed treasure chest, color (wood) parts: lid lock band front
//   amphora      style 'transport'|'greek' (black-figure bands)     parts: mouth neck handle body foot motif
//   vase         style 'iznik' (tulips, saz leaves on white)|'greek' (palmettes, meander)|'plain' (color)   parts: body neck mouth motif
//   jar          lid true|false (cloth tied over the mouth), color (cloth)   parts: body mouth lid
//   cup          style 'goblet' (metal, set with gems)|'tulip' (Turkish tea glass on a saucer)   parts: bowl stem foot gem | tea glass saucer
//   bread        style 'loaf'|'simit'               parts: crust score | crust sesame
//   skull        human skull, front view            parts: cranium eye nose teeth jaw
//   bone         a femur lying                      parts: head neck shaft end
//   cannon       style 'field' (spoked carriage)|'bombard' (great bronze gun on a timber bed), metal   parts: muzzle barrel breech wheel carriage
//   cannonball   pile true (a pyramid of six)       parts: ball
//   musket       flintlock musket, wood             parts: muzzle barrel lock stock butt
//   pistol       flintlock pistol, wood             parts: muzzle barrel lock grip
//   bow          style 'recurve' (Ottoman composite, strung)|'long'     parts: grip limb tip string
//   arrow        color (fletching)                  parts: head shaft fletching
//   spear        upright (point up)                 parts: head socket shaft butt
//   flag         color (default red), emblem 'none'|'crescent' (with star; crescent finial)|'cross'; live: the cloth
//                waves (and paints itself in when the shot passes item.reveal)    parts: cloth pole finial
//   compass      brass mariner's compass, 16-point rose          parts: north needle rose case hinge
//   telescope    brass draw tubes, color (leather barrel)        parts: lens eyepiece tube draw
//   astrolabe    rule (alidade angle, radians, default -.45)     parts: ring throne rete rule limb plate centre
//   clock        style 'bracket' (table clock, color: case wood)|'face' (big dial, color: rim), h, m (time shown)   parts: dial hands case handle
//   pocket_watch metal, chain true|false, h, m; live: the seconds hand ticks   parts: dial hands crown case chain
//   map_scroll   an unrolled sea chart: coasts, rhumb lines, a dotted route   parts: land sea route rose roll cross
//   anchor       admiralty anchor, stock (token)    parts: ring stock shank fluke crown
//   bell         bronze bell with canons and an inscription band     parts: crown waist band lip clapper
//   tablet       style 'clay' (cuneiform, chipped corner)|'stone' (stele with carved runes; dir 'rows'|'cols')   parts: marks corner edge crack
//   statue       marble bust on a plinth (head in profile), color   parts: head face hair chest plinth
//   shard        painted pottery fragment           parts: band edge face
//   gold_bar     stack true (six bars)              parts: top stamp
//   gem          cut gemstone, color (default red); live: glints      parts: table facet girdle culet
//   medal        metal, motif 'star'|'cross', color (ribbon)          parts: disc ribbon star
//   rope         a coil with a frayed loose end     parts: coil end
//   barrel       color                              parts: hoop stave lid
//   wheel        spoked cart wheel, spokes, color   parts: hub spoke rim
//   crate        color                              parts: lid plank brace
//   bottle       style 'wine' (label)|'onion'|'flask', color (glass)  parts: neck cork body liquid
//   apple        color (default red)                parts: stem leaf skin
//   egg          speckled true|false, color         parts: shell top
//   feather      color                              parts: quill vane tip
//   mask         style 'gold' (funerary, hammered gold)|'theatre'     parts: eye mouth brow (+ beard ear)
//   ring         metal, color (gem)                 parts: band gem
'use strict';

(() => {
  const C = WC.C, { rnd, pick, mk, qcurve, qctrl, along, washShape, mixc, clamp } = WC;
  const PI = Math.PI, TAU = PI * 2, LX = -.6, LY = -.8;           // light from the upper left

  // ------------------------------------------------------------ colour
  const lite = (c, k = .4) => mixc(c, C.paperLight, k);
  const dark = (c, k = .35) => mixc(c, mixc(C.ink, C.night, .3), k);     // shadows lean cool, like mixed pigment
  const tok = (v, fb) => (v ? WC.col(v) : fb);
  const METAL = {
    steel: () => mixc(C.far, C.inkSoft, .3), iron: () => mixc(C.stoneDark, C.ink, .28), gold: () => mixc(C.gold, C.clothC, .45),
    brass: () => mixc(C.clothC, C.gold, .35), bronze: () => mixc(C.clothC, C.wood, .42), silver: () => mixc(C.far, C.paperLight, .3),
    copper: () => mixc(C.roof, C.clothC, .35),
  };
  const metal = n => (METAL[n] || METAL.steel)();
  const SHC = () => mixc(C.stoneDark, C.night, .3);
  const clay = () => mixc(C.roof, C.ground, .42);

  // ------------------------------------------------------------ geometry
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  function spline(P, closed = false, per = 6) {               // Catmull-Rom through control points
    const n = P.length, out = [], g = i => closed ? P[((i % n) + n) % n] : P[Math.max(0, Math.min(n - 1, i))];
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(closed ? out[0].slice() : P[n - 1].slice());
    return out;
  }
  const mirror = half => half.concat(half.slice().reverse().map(([x, y]) => [-x, y]));   // right half top->bottom => closed outline
  const normals = P => P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; });
  const offset = (P, d) => { const N = normals(P); return P.map((p, i) => [p[0] + N[i][0] * (typeof d === 'number' ? d : d[i]), p[1] + N[i][1] * (typeof d === 'number' ? d : d[i])]); };
  const lerpP = (A, B, f) => A.map((p, i) => [p[0] + (B[i][0] - p[0]) * f, p[1] + (B[i][1] - p[1]) * f]);
  const rr = (x0, y0, x1, y1, r, n = 6) => [].concat(ell(x1 - r, y0 + r, r, r, -PI / 2, 0, n), ell(x1 - r, y1 - r, r, r, 0, PI / 2, n), ell(x0 + r, y1 - r, r, r, PI / 2, PI, n), ell(x0 + r, y0 + r, r, r, PI, PI * 1.5, n));
  const wobble = (P, amp, f = .05) => { const ph = rnd(0, 50); return P.map(([x, y], i) => [x + (WC.vnoise(ph + i * f * 9) - .5) * amp, y + (WC.vnoise(ph + 31 + i * f * 9) - .5) * amp]); };
  // the x of a right-half outline (listed top -> bottom) at height y
  const halfAt = (half, y) => { for (let j = 1; j < half.length; j++) { const [x0, y0] = half[j - 1], [x1, y1] = half[j]; if ((y - y0) * (y - y1) <= 0) return x0 + (x1 - x0) * (y - y0) / ((y1 - y0) || 1); } return 0; };
  const polyLen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };

  // move / rotate a finished list (and its named parts): points, stroke normals, wash rings
  function xform(S, a, dx, dy, parts) {
    const c = Math.cos(a), s = Math.sin(a), R = ([x, y]) => [x * c - y * s + dx, x * s + y * c + dy];
    for (const q of S) {
      if (q.poly) { q.poly = q.poly.map(r => r.map(R)); q.pts = q.pts.map(R); continue; }
      q.pts = q.pts.map(R);
      if (a) { const nx = q.nx.map((v, i) => v * c - q.ny[i] * s), ny = q.nx.map((v, i) => v * s + q.ny[i] * c); q.nx = nx; q.ny = ny; }
    }
    if (parts) for (const k in parts) parts[k] = R(parts[k]);
  }
  function seat(S, parts, sink = 0) {           // centre in x, lowest point to y = 0
    const b = WC.bbox(S, 0); xform(S, 0, -(b[0] + b[2]) / 2, -b[3] + sink, parts);
  }
  // scale a list built at sc 1; fine ink lines thicken less than washes and body strokes
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

  // ------------------------------------------------------------ painting recipes
  const add = (S, s) => (S.push(s), s);
  const wsh = (S, pts, c, a = .5, passes = 3, jit = 1.2) => add(S, washShape(pts, c, a, passes, jit));
  const brush = (S, pts, w, c, o = {}) => add(S, mk(pts, w, c, o));
  // a loose ink line along pts, broken in a place or two (o: a, col, gaps, raw (keep the points), prof)
  function ink(S, pts, w = 2.2, o = {}) {
    const L = polyLen(pts); if (L < 2) return;
    const n = o.raw ? pts.length - 1 : Math.max(3, Math.min(70, Math.round(L / 6))), P = o.raw ? pts : along(pts, n);
    const gaps = o.gaps ?? (L > 170 ? (rnd() < .5 ? 1 : 2) : L > 80 && rnd() < .45 ? 1 : 0);
    const cuts = []; for (let g = 0; g < gaps; g++) cuts.push(Math.floor(rnd(.2, .8) * n));
    cuts.sort((a, b) => a - b); cuts.push(n);
    let st = 0;
    for (const e of cuts) {
      if (e - st >= 2) { const s = mk(P.slice(st, e + 1), w * rnd(.85, 1.15), o.col || C.ink, { prof: o.prof || 'even', nb: 0, a: o.a ?? .85, rough: .32 }); s.fine = true; S.push(s); }
      st = e + 1;
    }
  }
  const inkC = (S, pts, w, o) => ink(S, pts.concat([pts[0]]), w, o);
  // the wet edge: pigment that pooled and dried along the border of a wash
  function pool(S, P, c, w = 3.2, a = .24) { const L = polyLen(P); if (L < 10) return; S.push(mk(along(P, Math.max(6, Math.min(60, Math.round(L / 9)))), w, c, { prof: 'even', nb: 0, a, rough: .55 })); }
  const inside = (P, x, y) => { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi) r = !r; } return r; };
  // a few soft irregular patches inside a shape (uneven pigment, a dried back-run)
  function patches(S, P, c, n = 3, a = .12, rk = .18) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const R = Math.min(x1 - x0, y1 - y0) * rk;
    for (let k = 0, tries = 0; k < n && tries < 40; tries++) {
      const x = rnd(x0, x1), y = rnd(y0, y1); if (!inside(P, x, y)) continue;
      const B = WC.blobPts(x, y, R * rnd(.6, 1.2), R * rnd(.4, .8), 18, .25); if (!B.every(([u, v]) => inside(P, u, v))) continue;
      k++; wsh(S, B, c, a, 2, R * .04);
    }
  }
  // granulation: tiny dabs of pigment settled in the paper grain
  function grain(S, P, c, n = 30, a = .3, r = 1.6) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let k = 0, t = 0; k < n && t < n * 4; t++) { const x = rnd(x0, x1), y = rnd(y0, y1); if (!inside(P, x, y)) continue; k++; const s = mk([[x - r, y], [x + r * rnd(.3, 1), y + rnd(-r, r) * .4]], r * rnd(1, 1.8), c, { prof: 'leaf', nb: 0, a: a * rnd(.5, 1) }); S.push(s); }
  }
  const dot = (S, x, y, r, c = C.ink, a = .85) => { const s = mk([[x - r * .5, y], [x, y - r * .1], [x + r * .5, y]], r * 1.8, c, { prof: 'leaf', nb: 0, a, rough: .2 }); s.fine = true; S.push(s); return s; };
  // texture a polygon with parallel brush rows (o: ang, gap | n, a, nb, wk, inset, prof); c = colour or array
  function rows(S, poly, c, o = {}) {
    const ang = o.ang || 0, ca = Math.cos(-ang), sa = Math.sin(-ang), cb = Math.cos(ang), sb = Math.sin(ang);
    const R = poly.map(([x, y]) => [x * ca - y * sa, x * sa + y * ca]), back = ([x, y]) => [x * cb - y * sb, x * sb + y * cb];
    let y0 = 1e9, y1 = -1e9; for (const p of R) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const n = o.n || Math.max(2, Math.round((y1 - y0) / (o.gap || 14))), h = (y1 - y0) / n;
    for (let k = 0; k < n; k++) {
      const y = y0 + (k + .5) * h + rnd(-.15, .15) * h, xs = [];
      for (let i = 0; i < R.length; i++) { const [ax, ay] = R[i], [bx, by] = R[(i + 1) % R.length]; if ((ay <= y && by > y) || (by <= y && ay > y)) xs.push(ax + (y - ay) / (by - ay) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let j = 0; j + 1 < xs.length; j += 2) {
        const ins = o.inset ?? h * .25, xa = xs[j] + ins, xb = xs[j + 1] - ins; if (xb - xa < 4) continue;
        const pts = qcurve(xa, y, xb, y + rnd(-.2, .2) * h, rnd(-.25, .25) * h, Math.max(4, Math.round((xb - xa) / 12))).map(back);
        S.push(mk(pts, h * (o.wk ?? 1.3), Array.isArray(c) ? pick(c) : c, { prof: o.prof || 'even', nb: o.nb ?? 4, a: o.a ?? .35, rough: .2 }));
      }
    }
  }
  // a round form along a centreline (a grip, a barrel, a spindle, a handle): wash, form strokes, shadow side,
  // core shadow, lifted light, ink edges. R: number or radius per point. o: a, strokes, dk, lift, la, ink, iw, tex
  function tube(S, Cp, R, base, o = {}) {
    const n = Cp.length, Rs = typeof R === 'number' ? Cp.map(() => R) : R, Rm = Math.max(...Rs), N = normals(Cp);
    const m = N[n >> 1], sg = (m[0] * LX + m[1] * LY) > 0 ? -1 : 1;
    const off = v => Cp.map((p, i) => [p[0] + N[i][0] * Rs[i] * v * sg, p[1] + N[i][1] * Rs[i] * v * sg]);
    const band = (v0, v1) => off(v0).concat(off(v1).reverse());
    const wv = s => { s.ws = s.ws.map((w, i) => w * Math.max(.15, Rs[i] / Rm)); return s; };
    const dk = o.dk ?? .28;
    wsh(S, band(-1, 1), base, o.a ?? .5, 3, o.jit ?? Math.min(1.6, Rm * .12));
    if (o.tex !== false && Rm > 3) for (let k = 0, nk = (o.strokes ?? (Rm > 14 ? 3 : 2)) + 1; k < nk; k++) {
      const v = -.7 + 1.4 * (k + rnd(.3, .7)) / nk, i0 = Math.floor(rnd(0, .25) * n), i1 = Math.ceil(rnd(.72, 1) * (n - 1));
      if (i1 - i0 < 2) continue;
      const s = wv(mk(off(v), Rm * 2.2 / nk, mixc(base, v > 0 ? C.ink : C.paperLight, Math.abs(v) * .32), { prof: 'leaf', nb: Rm > 6 ? 4 : 0, a: .34, rough: .2 }));
      s.pts = s.pts.slice(i0, i1 + 1); s.ws = s.ws.slice(i0, i1 + 1); s.nx = s.nx.slice(i0, i1 + 1); s.ny = s.ny.slice(i0, i1 + 1);
      S.push(s);
    }
    if (Rm > 8) pool(S, off(.95), dark(base, .2), Math.min(4, Rm * .2), .22);
    wsh(S, band(.1, 1), dark(base, dk), .42, 2, .6);
    wsh(S, band(.48, .86), dark(base, dk + .2), .3, 2, .4);
    if (o.lift !== false && Rm > 2.5) S.push(wv(mk(off(-.52), Math.max(1.4, Rm * .3), C.paperLight, { prof: 'leaf', nb: 0, a: o.la ?? .5 })));
    if (o.ink !== false) { ink(S, off(1), o.iw ?? Math.min(2.4, .8 + Rm * .12)); ink(S, off(-1), (o.iw ?? Math.min(2.4, .8 + Rm * .12)) * .6, { a: .5 }); }
    return { off, band };
  }
  // a turned (round) body standing upright, seen a little from above: prof [[y, r], ...] bottom (y 0) -> top.
  // o: x (axis), tilt, a, mouth (open top: dark inside), glass (transparent recipe), strokes, dk, ink
  function lathe(S, prof, base, o = {}) {
    const t = o.tilt ?? .18, cx = o.x || 0, rb = prof[0][1], dy = -rb * t;
    const P = prof.map(([y, r]) => [y + dy, Math.max(.5, r)]), n = P.length, Rm = Math.max(...P.map(p => p[1]));
    const col = v => P.map(([y, r]) => [cx + v * r, y + r * t * Math.sqrt(Math.max(0, 1 - v * v))]);
    const band = (v0, v1) => col(v0).concat(col(v1).reverse());
    const rAt = y => { const yy = y + dy; if (yy >= P[0][0]) return P[0][1]; for (let i = 1; i < n; i++) if (yy >= P[i][0]) { const f = (yy - P[i - 1][0]) / ((P[i][0] - P[i - 1][0]) || 1); return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f; } return P[n - 1][1]; };
    const arc = (y, r, v0, v1, back = false, k = 18) => { const out = []; for (let i = 0; i <= k; i++) { const v = v0 + (v1 - v0) * i / k; out.push([cx + v * r, y + (back ? -1 : 1) * r * t * Math.sqrt(Math.max(0, 1 - v * v))]); } return out; };
    const ring = (y, v0 = -1, v1 = 1, back = false) => arc(y + dy, rAt(y), v0, v1, back);
    const yb = P[0][0], yt = P[n - 1][0], rt = P[n - 1][1];
    const sil = col(-1).reverse().concat(arc(yb, rb, -1, 1), col(1), arc(yt, rt, 1, -1, true));
    const wv = s => { s.ws = s.ws.map((w, i) => w * Math.max(.12, P[Math.min(n - 1, i)][1] / Rm)); return s; };
    const dk = o.dk ?? .28;
    if (o.glass) {
      wsh(S, sil, base, o.a ?? .16, 3, .8);
      wsh(S, band(.72, 1), dark(base, .25), .28, 2, .4);
      wsh(S, band(-1, -.82), dark(base, .15), .2, 2, .4);
      const mid = s => { const a = Math.floor(n * .15), b = Math.ceil(n * .8); s.pts = s.pts.slice(a, b); s.ws = s.ws.slice(a, b); s.nx = s.nx.slice(a, b); s.ny = s.ny.slice(a, b); return s; };
      S.push(mid(wv(mk(col(-.5), Rm * .14, C.paperLight, { prof: 'leaf', nb: 0, a: .85 }))));
      S.push(mid(wv(mk(col(.45), Rm * .06, C.paperLight, { prof: 'leaf', nb: 0, a: .6 }))));
      ink(S, col(1), o.iw ?? 1.8, { a: .7 }); ink(S, col(-1), (o.iw ?? 1.8) * .7, { a: .5 });
    } else {
      wsh(S, sil, base, o.a ?? .48, 3, Math.min(2.2, Rm * .03 + .8));
      if (o.patches !== false && Rm > 25) patches(S, sil, dark(base, .12), 3, .12);
      if (o.tex === 'ring') for (let k = 0, nk = o.nstrokes ?? Math.round(n / 3); k < nk; k++) {
        // wheel-thrown pottery: strokes round the form, a little lighter on the lit side
        const i = Math.floor(rnd(.05, .95) * (n - 1)), [y, r] = P[i], v0 = rnd(-.98, -.6), v1 = rnd(.5, .98);
        S.push(mk(arc(y, r, v0, v1, false, 12), Math.max(3, (Math.abs(P[0][0] - P[n - 1][0]) / n) * rnd(1.6, 2.6)), mixc(base, C.ink, rnd(0, .12)), { prof: 'leaf', nb: 4, a: .2, rough: .2 }));
      }
      else if (o.tex !== false) for (let k = 0, nk = o.nstrokes ?? (Rm > 30 ? 8 : 5); k < nk; k++) {
        // brush strokes that follow the form, each over part of the height
        const v = -.85 + 1.7 * (k + rnd(.2, .8)) / nk, i0 = Math.floor(rnd(0, .3) * n), i1 = Math.ceil(rnd(.65, 1) * (n - 1));
        if (i1 - i0 < 2) continue;
        const s = wv(mk(col(v), Rm * rnd(.28, .42), mixc(base, v > 0 ? C.ink : C.paperLight, Math.abs(v) * .3), { prof: 'leaf', nb: 5, a: .26, rough: .2 }));
        s.pts = s.pts.slice(i0, i1 + 1); s.ws = s.ws.slice(i0, i1 + 1); s.nx = s.nx.slice(i0, i1 + 1); s.ny = s.ny.slice(i0, i1 + 1);
        S.push(s);
      }
      pool(S, col(.96), dark(base, .22), Math.max(2, Rm * .05), .24);
      wsh(S, band(.12, 1), dark(base, dk), .42, 2, .6);
      wsh(S, band(.5, .88), dark(base, dk + .2), .3, 2, .5);
      if (o.lift !== false) S.push(wv(mk(col(-.5), Rm * .2, C.paperLight, { prof: 'leaf', nb: 2, a: o.la ?? .5 })));
      if (o.ink !== false) { ink(S, col(1), o.iw ?? 2.4); ink(S, col(-1), (o.iw ?? 2.4) * .6, { a: .55 }); ink(S, arc(yb, rb, -.9, .95), (o.iw ?? 2.4) * .8, { a: .7, gaps: 0 }); }
    }
    if (o.mouth) {
      wsh(S, ell(cx, yt, rt, rt * t, 0, TAU, 28), dark(base, .55), .7, 2, .4);
      wsh(S, ell(cx, yt, rt * .86, rt * t * .7, PI, TAU, 16).concat(ell(cx, yt - rt * t * .2, rt * .86, rt * t * .3, 0, PI, 10)), lite(base, .2), .3, 2, .3);
      ink(S, arc(yt, rt, -1, 1), 2, { a: .8, gaps: 0 }); ink(S, arc(yt, rt, 1, -1, true), 1.3, { a: .55 });
    }
    return { col, band, ring, rAt, sil, yt, yb, rt, rb, dy, t, Rm };
  }
  // a sphere (or ellipsoid with o.ry): wash, shadow crescent, core shadow, lifted highlight, ink on the dark side
  function ball(S, cx, cy, r, base, o = {}) {
    const ry = o.ry ?? r, A = .93, cA = Math.cos(A), sA = Math.sin(A), nn = Math.max(12, Math.min(56, Math.round(r * .9)));
    const P2 = (u, v) => [cx + u * cA - v * sA, cy + (u * sA + v * cA) * ry / r];
    const cres = (k0, k1, a0 = -PI / 2, a1 = PI / 2, m = 18) => { const out = []; for (let i = 0; i <= m; i++) { const q = a0 + (a1 - a0) * i / m; out.push(P2(r * k1 * Math.cos(q), r * Math.sin(q))); } for (let i = m; i >= 0; i--) { const q = a0 + (a1 - a0) * i / m; out.push(P2(r * k0 * Math.cos(q), r * Math.sin(q))); } return out; };
    wsh(S, ell(cx, cy, r, ry, 0, TAU, nn), base, o.a ?? .55, 3, Math.min(1.2, r * .05));
    if (r > 10 && o.tex !== false) brush(S, cres(.55, .55, -1.25, 1.25, 10).slice(0, 11), r * .32, base, { prof: 'leaf', nb: 3, a: .28 });
    wsh(S, cres(.05, 1), dark(base, o.dk ?? .28), .42, 2, .5);
    if (r > 5) wsh(S, cres(.48, .86), dark(base, (o.dk ?? .28) + .2), .3, 2, .4);
    if (o.lift !== false) wsh(S, ell(cx - r * .38, cy - ry * .4, r * .2, ry * .14, 0, TAU, 12).map(([x, y]) => [x, y]), C.paperLight, .6, 2, .3);
    if (o.ink !== false) { ink(S, cres(1, 1, -PI / 2, PI / 2, 20).slice(0, 21), o.iw ?? Math.min(2.2, .8 + r * .06), { gaps: r > 40 ? 1 : 0 }); if (r > 12) ink(S, cres(1, 1, PI / 2, PI * 1.5, 16).slice(0, 17), (o.iw ?? 1.6) * .6, { a: .45 }); }
    return { P2, cres };
  }
  // a box seen from the front, a little from the right and above: front face w×h, bottom-left at (x, y), depth d
  function box(S, x, y, w, h, d, base, o = {}) {
    const dx = d * (o.kx ?? .6), dy = -d * (o.ky ?? .45);
    const F = [[x, y], [x + w, y], [x + w, y - h], [x, y - h]];
    const T = [[x, y - h], [x + w, y - h], [x + w + dx, y - h + dy], [x + dx, y - h + dy]];
    const R = [[x + w, y], [x + w + dx, y + dy], [x + w + dx, y - h + dy], [x + w, y - h]];
    wsh(S, T, lite(base, o.lt ?? .25), o.a ?? .5, 3, 1); wsh(S, F, base, o.a ?? .55, 3, 1); wsh(S, R, dark(base, o.dk ?? .3), (o.a ?? .55) + .05, 3, 1);
    if (o.grain) { rows(S, F, shades(base), { gap: o.grain, a: .22, nb: 4 }); rows(S, R, dark(base, .35), { gap: o.grain, a: .2, nb: 3, ang: Math.atan2(dy, dx) }); }
    if (o.ink !== false) {
      const iw = o.iw ?? 2;
      ink(S, [F[0], F[1], R[1], R[2], T[3], T[0], F[0]], iw);
      ink(S, [F[3], F[2], R[2]], iw * .6, { a: .55 }); ink(S, [F[1], F[2]], iw * .7, { a: .6 });
    }
    return { F, T, R, dx, dy };
  }
  const shades = (c, k = .1) => WC.shades(c, k);
  // a flat disc seen a little from above (plates, dishes, coins lying, bases): top face centre (cx, cy), thickness th
  function disc(S, cx, cy, rx, ry, th, base, o = {}) {
    wsh(S, ell(cx, cy, rx, ry, 0, PI, 20).concat(ell(cx, cy + th, rx, ry, PI, 0, 20)), dark(base, o.dk ?? .22), o.a ?? .55, 3, .6);
    wsh(S, ell(cx, cy, rx, ry, 0, TAU, 36), lite(base, o.lt ?? .15), o.a ?? .5, 3, .6);
    wsh(S, ell(cx, cy + th, rx, ry, 0, PI * .45, 10).concat(ell(cx, cy, rx, ry, PI * .45, 0, 10)), dark(base, .4), .3, 2, .4);
    if (o.lift !== false) brush(S, ell(cx, cy, rx * .7, ry * .6, PI * 1.1, PI * 1.45, 6), Math.max(2, ry * .25), C.paperLight, { prof: 'leaf', nb: 0, a: .45 });
    ink(S, ell(cx, cy + th, rx, ry, 0, PI, 24), o.iw ?? 2); ink(S, ell(cx, cy, rx, ry, PI, TAU, 24), (o.iw ?? 2) * .6, { a: .5 });
    if (th > 3) { ink(S, [[cx - rx, cy], [cx - rx, cy + th]], 1.4, { a: .6, gaps: 0 }); ink(S, [[cx + rx, cy], [cx + rx, cy + th]], 1.8, { a: .7, gaps: 0 }); }
  }
  // the WC.G registration: build at sc 1, add the cast shadow, scale everything (parts, live drawing) to sc
  function def(name, fn) {
    WC.G[name] = (sc = 1, o = {}) => {
      const r = fn(o) || {}, S = r.S || [];
      // rest exactly on y = 0: the lowest painted point (not the padded bounds) touches the ground
      let yb = -1e9;
      for (const q of S) { if (q.poly) { for (const p of q.pts) yb = Math.max(yb, p[1]); } else for (let i = 0; i < q.pts.length; i++) yb = Math.max(yb, q.pts[i][1] + q.ws[i] * .4); }
      const lift = yb > -1e8 && Math.abs(yb) > .5 ? -yb : 0;
      if (lift) { xform(S, 0, 0, lift, r.parts); if (r.top) r.top = [r.top[0], r.top[1] + lift]; }
      let pre = [];
      if (o.shadow !== false && r.sh !== false && S.length) {
        const b = WC.bbox(S, 0), w = b[2] - b[0];
        const [cx, rx, ry] = r.sh || [(b[0] + b[2]) / 2 + w * .05, w * .5, Math.max(5, Math.min(16, w * .055))];
        const sc_ = SHC();
        pre = [washShape(WC.blobPts(cx, -1, rx * 1.1, ry * 1.5, 30, .1), sc_, .12, 3, 3), washShape(WC.blobPts(cx + rx * .05, -1, rx * .8, ry * .7, 26, .08), sc_, .2, 3, 2)];
      }
      const all = pre.concat(S);
      scaleList(all, sc);
      const sp = p => p && [p[0] * sc, p[1] * sc];
      const out = { S: all, sway: r.sway, top: sp(r.top), parts: {} };
      if (r.parts) for (const k in r.parts) out.parts[k] = sp(r.parts[k]);
      if (r.live) { const L = r.live; out.live = (c, lt, it) => { c.save(); c.scale(sc, sc); if (lift) c.translate(0, lift); L(c, lt, it || {}); c.restore(); }; }
      return out;
    };
  }
  // reveal factor for live elements that belong to the picture (a flag's cloth): wc_specimen passes item.reveal
  const revealOf = (it, lt) => (it && it.reveal != null ? it.reveal : WC.ss(WC.seg(lt, .8, 2)));

  // ================================================================ arms and armour
  const SWORD = {
    kilij: { L: 232, H: 80, bend: 30, w: 15, guard: 'brass', fuller: .55 },
    scimitar: { L: 222, H: 74, bend: 46, w: 14, guard: 'brass' },
    gladius: { L: 172, H: 78, bend: 0, w: 25, guard: 'bronze', dbl: true },
    longsword: { L: 258, H: 100, bend: 0, w: 21, guard: 'steel', dbl: true, fuller: .7 },
    katana: { L: 236, H: 96, bend: 13, w: 13, guard: 'iron' },
  };
  const BLADE = {
    kilij: (s, w) => { const t = s > .9 ? Math.sqrt(Math.max(0, 1 - ((s - .9) / .1) ** 2)) : 1, yel = s > .6 ? Math.pow(Math.sin(clamp((s - .6) / .4) * PI), .8) * w * .45 : 0; return [yel, w * (1 - .16 * s) * t]; },
    scimitar: (s, w) => { const t = s > .86 ? Math.sqrt(Math.max(0, 1 - ((s - .86) / .14) ** 2)) : 1; return [0, w * (.72 + .6 * s) * t]; },
    gladius: (s, w) => { const h = w / 2 * (1 - .1 * Math.sin(PI * Math.min(1, s / .82))) * (s > .8 ? (1 - s) / .2 : 1); return [h, h]; },
    longsword: (s, w) => { const h = w / 2 * (1 - .5 * s) * (s > .9 ? (1 - s) / .1 : 1); return [h, h]; },
    katana: (s, w) => { const t = s > .93 ? Math.sqrt(Math.max(0, 1 - ((s - .93) / .07) ** 2)) : 1; return [0, w * (1 - .22 * s) * t]; },
  };
  def('sword', o => {
    const st = SWORD[o.style] ? o.style : 'kilij', cf = SWORD[st], S = [], parts = {};
    const L = cf.L, w = cf.w, steel = metal('steel'), gm = metal(cf.guard), N = 44;
    const sp = qctrl(0, 0, L * .55, -cf.bend * .06, L, -cf.bend, N), nr = normals(sp);
    const top = [], bot = [];
    sp.forEach(([x, y], i) => { const [a, b] = BLADE[st](i / N, w), [nx, ny] = nr[i]; top.push([x - nx * a, y - ny * a]); bot.push([x + nx * b, y + ny * b]); });
    const mid = f => lerpP(cf.dbl ? top : sp, bot, f);
    const gy = cf.dbl ? 0 : w * .45;
    // ---- hilt (behind the blade's root)
    const grip = (P, R, c, o2) => tube(S, P, R, c, o2);
    if (st === 'kilij' || st === 'scimitar') {
      const q = st === 'kilij' ? 28 : 36;
      tube(S, qcurve(-3, gy - q, -3, gy + q, st === 'kilij' ? 0 : -4, 10), 4.5, gm, { strokes: 1 });
      ball(S, -3, gy - q - 3, 6, gm); ball(S, -3, gy + q + 3, 6, gm);
      const g = qctrl(-7, gy, -40, gy + 4, -70, gy + 13, 14), horn = dark(C.wood, .38);
      grip(g, g.map((_, i) => 8 + Math.sin(i / 14 * PI) * 1.4), horn, { strokes: 2 });
      if (st === 'kilij') { const pm = qctrl(-67, gy + 11, -82, gy + 14, -84, gy + 32, 8); grip(pm, pm.map((_, i) => 9 - i * .3), horn, { strokes: 1 }); parts.pommel = [-84, gy + 30]; }
      else { ball(S, -76, gy + 15, 9, gm, { ry: 7 }); parts.pommel = [-78, gy + 15]; }
      ball(S, -26, gy + 3, 2.4, gm, { ink: false }); ball(S, -50, gy + 7, 2.4, gm, { ink: false });
      wsh(S, [[-1, gy - 7], [17, gy - 3], [17, gy + 4], [-1, gy + 8]], gm, .6, 2, .4); ink(S, [[-1, gy - 7], [17, gy - 3], [17, gy + 4], [-1, gy + 8]], 1.2, { a: .7 });
      parts.grip = [-38, gy + 4]; parts.guard = [-3, gy - q];
    } else if (st === 'gladius') {
      ball(S, -9, 0, 9, mixc(C.paperLight, C.clothC, .4), { ry: 30 });
      const g = qcurve(-17, 0, -62, 0, 0, 12), ivory = mixc(C.paperLight, C.clothC, .35);
      grip(g, g.map((_, i) => 8.5 + 1.8 * Math.abs(Math.sin(i / 12 * PI * 4))), ivory, { strokes: 2 });
      ball(S, -78, 0, 16, mixc(C.wood, C.clothC, .3));
      parts.grip = [-40, 0]; parts.guard = [-9, -28]; parts.pommel = [-80, 0];
    } else if (st === 'longsword') {
      tube(S, qcurve(-4, -56, -4, 56, -7, 14), 4.5, gm, { strokes: 1 });
      ball(S, -6, -58, 5.5, gm); ball(S, -6, 58, 5.5, gm);
      const g = qcurve(-9, 0, -84, 0, 0, 14), lea = dark(C.cloth, .35);
      grip(g, 8, lea, { strokes: 2 });
      for (let k = 0; k < 7; k++) { const x = -14 - k * 10; ink(S, [[x, -8], [x - 7, 8]], 1.1, { a: .5, gaps: 0 }); }
      ball(S, -95, 0, 11, gm, { ry: 17 }); ball(S, -96, 0, 4.5, lite(gm, .2));
      parts.grip = [-46, 0]; parts.guard = [-4, -50]; parts.pommel = [-96, 0];
    } else {   // katana
      const g = qctrl(-9, gy, -50, gy + 2, -96, gy + 8, 14), same = mixc(C.paperLight, C.clothC, .25), ito = mixc(C.clothB, C.ink, .3);
      grip(g, 10, same, { strokes: 2, dk: .15 });
      const gn = normals(g);
      for (let k = 1; k < 7; k++) {
        const i = Math.min(13, Math.round(k * 2)), [x, y] = g[i], [nx, ny] = gn[i];
        brush(S, [[x - 6 - nx * 10, y - ny * 10], [x, y], [x - 6 + nx * 10, y + ny * 10]], 4.5, ito, { prof: 'even', nb: 0, a: .85 });
        brush(S, [[x - 13 + nx * 10, y + ny * 10], [x - 7, y + 1], [x - 13 - nx * 10, y - ny * 10]], 4.5, ito, { prof: 'even', nb: 0, a: .7 });
      }
      ball(S, -98, gy + 8, 8, metal('iron'), { ry: 10 });
      ball(S, -3, gy, 6, metal('iron'), { ry: 30 });
      wsh(S, [[1, gy - 8], [14, gy - 8], [14, gy + 9], [1, gy + 9]], metal('brass'), .6, 2, .4);
      parts.grip = [-50, gy + 2]; parts.guard = [-3, gy - 26]; parts.pommel = [-98, gy + 8];
    }
    // ---- blade
    const blade = top.concat(bot.slice().reverse());
    wsh(S, blade, lite(steel, .3), .55, 3, .7);
    wsh(S, top.concat(mid(cf.dbl ? .5 : .55).reverse()), steel, .45, 2, .5);
    if (cf.dbl) wsh(S, mid(.5).concat(mid(.82).reverse()), dark(steel, .18), .25, 2, .4);
    brush(S, mid(cf.dbl ? .28 : .3).slice(2, -5), w * .3, dark(steel, .12), { prof: 'leaf', nb: 3, a: .35 });
    brush(S, mid(cf.dbl ? .66 : .74).slice(4, -6), Math.max(2, w * .16), C.paperLight, { prof: 'leaf', nb: 0, a: .8 });
    if (cf.fuller) { const f = mid(cf.dbl ? .5 : .24).slice(1, Math.round(N * cf.fuller)); ink(S, f, 1.6, { a: .55, gaps: 0 }); brush(S, f.map(([x, y]) => [x + .5, y + 2.4]), 1.8, C.paperLight, { prof: 'even', nb: 0, a: .7 }); }
    if (st === 'katana') {
      const hm = mid(.62).map(([x, y], i) => [x, y + Math.sin(i * 1.3) * 1.6]).slice(1, -3);
      wsh(S, hm.concat(mid(.97).slice(1, -3).reverse()), C.paperLight, .5, 2, .4);
      ink(S, hm, 1, { a: .35, gaps: 0 });
    }
    if (st === 'kilij') for (let k = 0; k < 4; k++) { const [x, y] = mid(.42)[3 + k * 2]; brush(S, WC.polar(x, y, -1.2 + k * .5, 6, 3, 4), 2.2, metal('gold'), { prof: 'tip', nb: 0, a: .85 }); }
    ink(S, top, 2.2); ink(S, bot, 1.5, { a: .7 });
    Object.assign(parts, { tip: sp[N], blade: mid(.5)[N >> 1], edge: bot[Math.round(N * .45)], spine: top[Math.round(N * .55)] });
    if (st === 'kilij') parts.yelman = top[Math.round(N * .8)];
    if (o.upright) { xform(S, PI / 2, 0, 0, parts); const b = WC.bbox(S, 0); xform(S, 0, -parts.tip[0], -parts.tip[1] + 6, parts); return { S, parts, sh: [0, 26, 7] }; }
    seat(S, parts);
    return { S, parts };
  });

  // ================================================================ instruments and time
  def('hourglass', o => {
    const S = [], parts = {}, wood = tok(o.wood, C.wood), sand = mixc(C.ground, C.clothC, .5), glass = mixc(C.sky, C.paperLight, .15);
    const fill = clamp(o.fill ?? .4), pr = 86, ry = 15, th = 17, Y0 = -th, Y1 = -268;
    // bottom plate, the two back posts
    disc(S, 0, Y0, pr, ry, th, wood);
    rows(S, ell(0, Y0, pr * .9, ry * .7, 0, TAU, 24), dark(wood, .2), { gap: 6, a: .18, nb: 2 });
    const spin = (x, y0, y1, c) => { const P = qcurve(x, y0, x, y1, 0, 24); tube(S, P, P.map((_, i) => { const s = i / 24; return 4.4 + 3.2 * Math.pow(Math.abs(Math.sin(s * PI * 4)), 4) + (s < .07 || s > .93 ? 3.2 : 0); }), c, { strokes: 1 }); };
    spin(-pr * .7, Y0 - ry * .55, Y1 - ry * .55, lite(wood, .15)); spin(pr * .7, Y0 - ry * .55, Y1 - ry * .55, lite(wood, .15));
    // glass
    const gp = spline([[0, 22], [-14, 44], [-44, 56], [-82, 44], [-112, 14], [-125, 5], [-138, 14], [-168, 44], [-206, 56], [-236, 44], [-250, 22]], false, 4).map(([y, r]) => [y, r]);
    const G = lathe(S, gp.map(([y, r]) => [y + Y0 + 2, r]), glass, { glass: true, tilt: .12 });
    const neckY = Y0 + 2 - 125 + G.dy;
    // sand: the heap in the bottom bulb, the rest in the top bulb
    const lvl = Y0 - 6 - (1 - fill) * 58, peak = lvl - 10 - (1 - fill) * 12;
    const wall = (ya, yb, k) => { const L = [], R = []; for (let i = 0; i <= 8; i++) { const y = ya + (yb - ya) * i / 8, r = G.rAt(y - Y0 - 2) * k; L.push([-r, y]); R.push([r, y]); } return [L, R]; };
    {
      const [L, R] = wall(Y0 - 4, lvl, .9);
      const surf = qcurve(L[8][0], lvl, 0, peak, 6, 6).concat(qcurve(0, peak, R[8][0], lvl, 6, 6).slice(1));
      const heap = L.concat(surf, R.slice().reverse());
      wsh(S, heap, sand, .7, 3, .8); wsh(S, R.slice(2).concat(qcurve(R[8][0], lvl, 0, peak, 6, 6).reverse(), [[R[0][0] * .3, Y0 - 4]]), dark(sand, .25), .35, 2, .5);
      ink(S, surf, 1.2, { a: .5, gaps: 0 });
      parts.sand = [0, (lvl + Y0) / 2];
    }
    if (fill > .03) {
      const top = neckY - 6 - Math.pow(fill, .55) * 96, [L, R] = wall(neckY - 4, top, .9);
      const surf = qcurve(L[8][0], top, 0, top + 9, -4, 6).concat(qcurve(0, top + 9, R[8][0], top, -4, 6).slice(1));
      wsh(S, L.concat(surf, R.slice().reverse()), sand, .7, 3, .8);
      wsh(S, R.concat([[0, neckY - 2]]), dark(sand, .25), .3, 2, .4);
      parts.bulb = [-20, top + 20];
    } else parts.bulb = [-20, neckY - 60];
    // front spindles, top plate
    spin(-pr * .8, Y0 + ry * .45, Y1 + ry * .45, wood); spin(pr * .8, Y0 + ry * .45, Y1 + ry * .45, wood);
    disc(S, 0, Y1 - th + ry * .2, pr, ry, th, wood);
    rows(S, ell(0, Y1 - th + ry * .2, pr * .9, ry * .7, 0, TAU, 24), dark(wood, .2), { gap: 6, a: .18, nb: 2 });
    Object.assign(parts, { neck: [0, neckY], frame: [pr * .8, (Y0 + Y1) / 2], plate: [-pr * .7, Y1], top: [0, Y1 - th - ry] });
    seat(S, parts);
    const ny = parts.neck[1], sy = parts.sand[1];
    const live = (c, lt, it) => {
      if (fill <= .03) return;
      const y0 = ny + 2, y1 = sy - (lvl - peak) * .4 - 8;
      c.strokeStyle = WC.rgba(sand, .8); c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, y0); c.lineTo(0, y1); c.stroke();
      c.fillStyle = WC.rgba(dark(sand, .2), .8);
      for (let k = 0; k < 7; k++) { const f = ((lt * 1.7 + k / 7) % 1), y = y0 + (y1 - y0) * f; c.beginPath(); c.arc(Math.sin(k * 7.1 + lt * 9) * 1.2, y, 1.3, 0, 7); c.fill(); }
    };
    return { S, parts, live };
  });

  def('astrolabe', o => {
    const S = [], parts = {}, br = metal('brass'), rete = mixc(br, C.gold, .3), R = 122, cy = -R;
    // the ring and throne (behind the disc)
    const ringY = cy - R - 62;
    tube(S, ell(0, ringY, 19, 19, PI / 2, PI / 2 + TAU, 30), 4, br, { strokes: 1 });
    const th = spline([[-44, cy - R + 26], [-36, cy - R - 6], [-24, cy - R - 12], [-20, cy - R - 26], [-9, cy - R - 30], [-7, cy - R - 42], [0, cy - R - 46]], false, 4);
    const thr = mirror(th.slice().reverse());
    wsh(S, thr, br, .6, 3, .8); wsh(S, thr.filter(([x]) => x >= -2), dark(br, .3), .35, 2, .5);
    ball(S, 0, cy - R - 34, 5, dark(br, .2)); inkC(S, thr, 1.6, { a: .75 });
    // mater + limb
    wsh(S, ell(0, cy, R, R, 0, TAU, 64), br, .55, 3, .8);
    brush(S, ell(0, cy, R * .93, R * .93, -PI / 2, PI * 1.5, 64), R * .13, dark(br, .1), { prof: 'even', nb: 6, a: .4, rough: .08 });
    // plate: tropics, almucantars, azimuths (fine engraved lines)
    wsh(S, ell(0, cy, R * .8, R * .8, 0, TAU, 56), lite(br, .3), .3, 2, .5);
    for (const k of [.8, .52, .33]) ink(S, ell(0, cy, R * k, R * k, 0, TAU, 48), .9, { a: .4, gaps: 0 });
    for (let k = 0; k < 8; k++) { const c0 = cy - R * .05 - R * .26 * k / 8, r0 = R * .6 * (1 - k / 9); ink(S, ell(0, c0, r0, r0 * .92, 0, TAU, 40), .8, { a: .35, gaps: 0 }); }
    const zen = [0, cy - R * .32];
    for (let k = -3; k <= 3; k++) if (k) { const a = PI / 2 + k * .38; ink(S, qcurve(zen[0], zen[1], Math.cos(a) * R * .6, cy - R * .05 + Math.sin(a) * R * .55, k * 8, 10), .8, { a: .3, gaps: 0 }); }
    ink(S, [[-R * .8, cy], [R * .8, cy]], .9, { a: .4, gaps: 0 }); ink(S, [[0, cy - R * .8], [0, cy + R * .8]], .9, { a: .4, gaps: 0 });
    // rete: its shadow on the plate, then the openwork
    const ecl = [0, cy - R * .25], er = R * .54;
    const reteSt = [];
    reteSt.push([ell(ecl[0], ecl[1], er, er, 0, TAU, 56), 9]);
    reteSt.push([ell(0, cy, R * .8, R * .8, 0, TAU, 60), 5]);
    reteSt.push([qcurve(-R * .8, cy + 4, R * .8, cy + 4, 6, 18), 4]);
    reteSt.push([qcurve(0, cy - R * .8, 0, cy + R * .8, -5, 18), 4]);
    const ptr = [];
    for (let k = 0; k < 12; k++) {
      const a = k / 12 * TAU + .3, onE = k % 2 === 0, rr_ = onE ? er : R * .8, cx0 = onE ? ecl[0] : 0, cy0 = onE ? ecl[1] : cy;
      const x = cx0 + Math.cos(a) * rr_, y = cy0 + Math.sin(a) * rr_, ang = a + (onE ? (k % 4 ? 2.2 : -2.2) : PI + (k % 3 - 1) * .5);
      if (Math.hypot(x, y - cy) > R * .82) continue;
      ptr.push(WC.polar(x, y, ang, 22, 7 * (k % 2 ? 1 : -1), 6));
    }
    for (const [P, w] of reteSt) brush(S, P.map(([x, y]) => [x + 3, y + 4]), w, dark(br, .45), { prof: 'even', nb: 0, a: .28 });
    for (const P of ptr) brush(S, P.map(([x, y]) => [x + 3, y + 4]), 6, dark(br, .45), { prof: 'tip', nb: 0, a: .28 });
    for (const [P, w] of reteSt) { brush(S, P, w, rete, { prof: 'even', nb: w > 6 ? 4 : 0, a: .85, rough: .1 }); }
    for (const P of ptr) { brush(S, P, 6.5, rete, { prof: 'tip', nb: 0, a: .9 }); ink(S, P, 1, { a: .6, gaps: 0 }); }
    ink(S, ell(ecl[0], ecl[1], er + 4.5, er + 4.5, 0, TAU, 56), 1, { a: .6 }); ink(S, ell(ecl[0], ecl[1], er - 4.5, er - 4.5, 0, TAU, 56), 1, { a: .5 });
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ink(S, [[ecl[0] + Math.cos(a) * (er - 4), ecl[1] + Math.sin(a) * (er - 4)], [ecl[0] + Math.cos(a) * (er + 4), ecl[1] + Math.sin(a) * (er + 4)]], .9, { a: .6, gaps: 0 }); }
    // the rule (alidade) across the centre
    const ra = o.rule ?? -.45, ca = Math.cos(ra), sa = Math.sin(ra), RL = R * .9;
    const rule = [[-RL, 0], [-RL * .6, -7], [RL * .6, -7], [RL, 0], [RL * .6, 7], [-RL * .6, 7]].map(([x, y]) => [x * ca - y * sa, cy + x * sa + y * ca]);
    wsh(S, rule.map(([x, y]) => [x + 3, y + 5]), dark(br, .5), .25, 2, .5);
    wsh(S, rule, dark(br, .15), .75, 3, .5); wsh(S, rule.slice(3).concat([rule[0]]), dark(br, .4), .4, 2, .3);
    brush(S, [[-RL * .7 * ca, cy - RL * .7 * sa - 2], [RL * .7 * ca, cy + RL * .7 * sa - 2]], 2.2, C.paperLight, { prof: 'leaf', nb: 0, a: .6 });
    inkC(S, rule, 1.5, { a: .8 });
    ball(S, 0, cy, 8, dark(br, .1));
    // the scale on the limb: 5° ticks, longer every 30°
    for (let k = 0; k < 72; k++) { const a = k / 72 * TAU, r0 = k % 6 ? R * .875 : R * .84; const s = mk([[Math.cos(a) * r0, cy + Math.sin(a) * r0], [Math.cos(a) * R * .965, cy + Math.sin(a) * R * .965]], k % 6 ? .9 : 1.4, C.ink, { prof: 'even', nb: 0, a: .65 }); s.fine = true; S.push(s); }
    ink(S, ell(0, cy, R * .82, R * .82, 0, TAU, 60), 1.1, { a: .55 });
    // light and shade over the whole disc
    const sh = [];
    for (let i = 0; i <= 24; i++) { const a = -.6 + i / 24 * PI; sh.push([Math.cos(a) * R, cy + Math.sin(a) * R]); }
    for (let i = 24; i >= 0; i--) { const a = -.6 + i / 24 * PI; sh.push([Math.cos(a) * R * .9, cy + Math.sin(a) * R * .9]); }
    wsh(S, sh, dark(br, .45), .35, 2, .5);
    brush(S, ell(0, cy, R * .955, R * .955, PI * 1.05, PI * 1.45, 10), 5, C.paperLight, { prof: 'leaf', nb: 0, a: .6 });
    ink(S, ell(0, cy, R, R, -.7, PI + .2, 40), 2.6); ink(S, ell(0, cy, R, R, PI + .2, TAU - .7, 24), 1.4, { a: .55 });
    Object.assign(parts, { ring: [0, ringY - 19], throne: [0, cy - R - 24], rete: [ecl[0] - er * .7, ecl[1] - er * .7], rule: [RL * .75 * ca, cy + RL * .75 * sa], limb: [R * .9 * Math.cos(.35), cy + R * .9 * Math.sin(.35)], plate: [-R * .35, cy + R * .45], centre: [0, cy] });
    return { S, parts };
  });

  // ================================================================ writing
  def('tablet', o => {
    const S = [], parts = {};
    if (o.style === 'stone') {
      const st = mixc(C.stone, C.stoneDark, .15), w = 200, h = 300, x0 = -w / 2, x1 = w / 2, yt = -h + 60;
      const face = wobble([[x0, 0]].concat(ell(0, yt, w / 2, 60, PI, TAU, 16), [[x1, 0]]), 4);
      wsh(S, face.map(([x, y]) => [x + 13, y - 6]), dark(st, .35), .6, 3, 1.5);
      wsh(S, face, st, .6, 3, 1.5);
      rows(S, face, shades(st, .12), { gap: 22, a: .2, nb: 5, ang: -.05 });
      wsh(S, face.filter(([x]) => x > 30).concat([[30, 0]]), dark(st, .25), .3, 2, 1);
      brush(S, ell(0, yt, w / 2 - 8, 52, PI * 1.05, PI * 1.5, 8), 7, C.paperLight, { prof: 'leaf', nb: 2, a: .4 });
      // carved runes: dark cut, light lower edge
      const cols = o.dir === 'cols', glyph = (x, y, s) => {
        const L = [], kind = Math.floor(rnd(0, 7));
        if (kind < 5) L.push([[x, y - s], [x, y + s]]);
        if (kind === 0) L.push([[x, y - s * .4], [x + s * .6, y - s * .9]]);
        if (kind === 1) L.push([[x, y - s * .9], [x + s * .6, y - s * .3]], [[x, y], [x + s * .6, y + s * .5]]);
        if (kind === 2) L.push([[x - s * .5, y - s * .7], [x, y - s * .2], [x + s * .5, y - s * .7]]);
        if (kind === 3) L.push([[x, y - s * .2], [x + s * .55, y + s * .3]], [[x, y - s * .2], [x - s * .55, y + s * .3]]);
        if (kind === 4) L.push([[x + s * .5, y - s], [x + s * .5, y + s]], [[x, y - s * .3], [x + s * .5, y + s * .3]]);
        if (kind === 5) L.push([[x - s * .5, y - s], [x + s * .5, y + s]], [[x + s * .5, y - s], [x - s * .5, y + s]]);
        if (kind === 6) L.push([[x + s * .4, y - s], [x - s * .3, y], [x + s * .4, y + s]]);
        for (const l of L) { brush(S, l.map(([a, b]) => [a + 1.4, b + 1.6]), 2.4, C.paperLight, { prof: 'even', nb: 0, a: .55 }); const s2 = mk(l, 3.6, dark(st, .6), { prof: 'even', nb: 0, a: .85, rough: .3 }); s2.fine = true; S.push(s2); }
      };
      if (cols) { for (let cx = x1 - 34; cx > x0 + 22; cx -= 30) { ink(S, [[cx + 15, yt - 30], [cx + 15, -20]], .8, { a: .3 }); for (let y = yt - 22; y < -30; y += 30) if (rnd() < .9) glyph(cx, y, 10); } }
      else for (let y = yt - 18; y < -26; y += 34) { const half = Math.sqrt(Math.max(0, 1 - Math.pow(Math.min(0, y - yt) / 60, 2))) * (w / 2 - 22); ink(S, [[-half, y + 17], [half, y + 17]], .8, { a: .3 }); for (let x = -half + 8; x < half - 6; x += 24) if (rnd() < .88) glyph(x, y, 10); }
      for (let k = 0; k < 9; k++) { const x = rnd(x0 + 10, x1 - 10), y = rnd(-h + 30, -10); if (Math.abs(x) < w / 2 - 30 && y > yt - 30 && y < -30) continue; brush(S, WC.polar(x, y, rnd(0, 6), rnd(6, 12), 2, 4), rnd(5, 9), mixc(C.clothC, C.leaf, .5), { prof: 'leaf', nb: 0, a: .45 }); }
      ink(S, qcurve(x1 - 30, 0, x1 - 52, -70, 10, 10), 1.2, { a: .6 });
      inkC(S, face, 2.2);
      Object.assign(parts, { marks: [0, -h * .45], edge: [x1 + 8, -h * .4], corner: [x0 + 20, yt - 40], crack: [x1 - 44, -40] });
      return { S, parts };
    }
    const cl = mixc(C.stone, C.roof, .3), w = 214, h = 272, x0 = -w / 2, y0 = -h, x1 = w / 2;
    // a pillow-shaped tablet: rounded corners, bulging sides, a chipped top-right corner
    let face = rr(x0, y0, x1, 0, 36, 8).map(([x, y]) => [x + Math.sin(clamp((y - y0) / h) * PI) * 6 * Math.sign(x), y + Math.sin(clamp((x - x0) / w) * PI) * 5 * Math.sign(y + h / 2)]);
    face = face.filter(([x, y]) => !(x > x1 - 48 && y < y0 + 46));
    const chip = [[x1 - 48, y0 - 3], [x1 - 38, y0 + 12], [x1 - 24, y0 + 9], [x1 - 13, y0 + 26], [x1 + 3, y0 + 46]];
    face = wobble(chip.concat(face), 3.5);
    wsh(S, face.map(([x, y]) => [x + 11, y + 7]), dark(cl, .4), .7, 3, 1.4);
    wsh(S, face, cl, .6, 3, 2);
    patches(S, face, dark(cl, .14), 4, .14, .22); patches(S, face, lite(cl, .25), 2, .16, .2);
    rows(S, face, shades(cl, .1), { gap: 22, a: .16, nb: 6, ang: -.04 });
    pool(S, face, dark(cl, .3), 3.5, .25);
    brush(S, qcurve(x1 - 2, y0 + 50, x1 - 4, -16, -5, 10), 22, dark(cl, .24), { prof: 'leaf', nb: 5, a: .34 });
    brush(S, qcurve(x0 + 16, -4, x1 - 18, -6, 5, 10), 18, dark(cl, .22), { prof: 'leaf', nb: 5, a: .3 });
    brush(S, qcurve(x0 + 8, y0 + 40, x0 + 9, -36, 3, 8), 8, C.paperLight, { prof: 'leaf', nb: 2, a: .42 });
    brush(S, qcurve(x0 + 36, y0 + 8, x1 - 60, y0 + 10, -3, 8), 7, C.paperLight, { prof: 'leaf', nb: 2, a: .4 });
    // cuneiform: signs of 1-3 wedge impressions (a triangular head, a thin tail) in ruled lines
    const wd = dark(cl, .58), hiC = lite(cl, .45);
    const wedge = (x, y, ang, len, hw = 4.4) => {
      const c = Math.cos(ang), s = Math.sin(ang), px = -s * hw, py = c * hw, hl = len * .42;
      const A = [x + px, y + py], B = [x - px, y - py], Q = [x + c * hl, y + s * hl];
      wsh(S, [A, B, Q], wd, .85, 1, .15);
      const t = mk([[x + c * hl * .55, y + s * hl * .55], [x + c * len, y + s * len]], 1.7, wd, { prof: 'tip', nb: 0, a: .8 }); t.fine = true; S.push(t);
      if (rnd() < .5) brush(S, [A, Q], 1.1, hiC, { prof: 'even', nb: 0, a: .55 });
    };
    const SIGNS = [
      [18, x => [[x, 0, 0, 16]]], [16, x => [[x, -5, 0, 13], [x, 5, 0, 13]]], [9, x => [[x + 4, -9, PI / 2, 15]]],
      [15, x => [[x + 3, -9, PI / 2, 14], [x + 10, -9, PI / 2, 14]]], [21, x => [[x + 3, -9, PI / 2, 14], [x + 10, -9, PI / 2, 14], [x + 17, -9, PI / 2, 14]]],
      [12, x => [[x + 10, 0, PI, 7, 5]]], [26, x => [[x, 0, 0, 14], [x + 20, -9, PI / 2, 15]]], [22, x => [[x + 10, -2, PI, 7, 5], [x + 14, 0, 0, 10]]],
    ];
    for (let y = y0 + 38; y < -26; y += 28) {
      ink(S, [[x0 + 18, y + 14], [x1 - 18, y + 14]], .8, { a: .28 });
      for (let x = x0 + 22; ;) {
        const [wdth, fn] = pick(SIGNS);
        if (x + wdth > x1 - 20) break;
        if (!(x > x1 - 60 && y < y0 + 52)) for (const q of fn(x)) wedge(q[0], y + q[1], q[2] + rnd(-.06, .06), q[3], q[4]);
        x += wdth + rnd(5, 11);
      }
    }
    // the broken corner shows paler clay; a hairline crack
    wsh(S, chip.concat([[x1 - 20, y0 + 34], [x1 - 40, y0 + 20]]), lite(cl, .3), .45, 2, 1);
    ink(S, chip, 1.4, { a: .75, gaps: 0 });
    const crack = qcurve(-30, 2, -14, -80, 14, 10).concat(qcurve(-14, -80, -26, -120, -6, 6).slice(1));
    brush(S, crack.map(([x, y]) => [x + 2, y + 1]), 1.6, hiC, { prof: 'even', nb: 0, a: .5 });
    ink(S, crack, 1.3, { a: .75, gaps: 0 });
    ink(S, face.slice(chip.length - 1), 2.2);
    Object.assign(parts, { marks: [-24, y0 + h * .45], corner: [x1 - 22, y0 + 18], edge: [x1 + 9, -h * .5], crack: [-17, -74] });
    return { S, parts };
  });

  // ================================================================ vessels
  def('amphora', o => {
    const S = [], parts = {}, cl = clay(), greek = o.style === 'greek';
    const ctrl = greek
      ? [[0, 38], [-10, 40], [-16, 30], [-30, 34], [-70, 76], [-120, 92], [-165, 84], [-200, 58], [-216, 40], [-230, 34], [-262, 33], [-274, 46], [-284, 46]]
      : [[0, 5], [-12, 8], [-26, 14], [-60, 50], [-110, 72], [-160, 74], [-196, 60], [-214, 34], [-228, 22], [-268, 21], [-276, 27], [-286, 26]];
    const prof = spline(ctrl, false, 4);
    // the far handle first
    const hY = greek ? [-258, -196] : [-262, -206], hx = greek ? [36, 82] : [22, 64];
    const handle = s => {
      const P = spline([[s * hx[0], hY[0] + 4], [s * (hx[0] + 12), hY[0] - 9], [s * (hx[1] - 14), hY[0] - 15], [s * (hx[1] - 1), hY[0] - 4], [s * (hx[1] + 2), hY[0] + 22], [s * (hx[1] - 3), (hY[0] + hY[1]) / 2 + 14], [s * (hx[1] - 10), hY[1] + 6]], false, 5);
      tube(S, P, P.map((_, i) => 6.8 - Math.sin(i / (P.length - 1) * PI) * 1.2), cl, { strokes: 1 }); return P;
    };
    const hl = handle(-1);
    const L = lathe(S, prof, cl, { mouth: true, tex: 'ring' });
    if (greek) {
      const blk = mixc(C.ink, cl, .12);
      const band = (ya, yb, a = .82) => { const A = L.ring(ya), B = L.ring(yb); wsh(S, A.concat(B.reverse()), blk, a, 3, .6); };
      band(-16, -40); band(-230, -270);
      for (let k = 0; k < 12; k++) { const v = -1 + (k + .5) / 6; if (Math.abs(v) > .95) continue; const [x, y] = L.ring(-42, v, v)[0]; wsh(S, [[x - 7, y], [x + 7, y], [x, y - 26]], blk, .8, 2, .3); }
      band(-104, -168, .75);
      // figures in reserve: a running frieze of meander and two silhouettes as negative shapes
      const mk_ = L.ring(-112, -.8, .8);
      for (let k = 0; k < 7; k++) { const i = Math.round(k * 18 / 7) ; const [x, y] = mk_[Math.min(18, i)]; ink(S, [[x, y + 6], [x, y], [x + 8, y], [x + 8, y + 4], [x + 4, y + 4]], 1.6, { col: lite(cl, .2), a: .9, raw: true, gaps: 0 }); }
      for (const v of [-.42, .3]) { const [x, y] = L.ring(-160, v, v)[0]; wsh(S, spline([[x - 10, y], [x - 6, y - 30], [x - 12, y - 38], [x, y - 44], [x + 10, y - 36], [x + 6, y - 28], [x + 12, y]], true, 3), lite(cl, .1), .7, 2, .4); }
      parts.motif = L.ring(-140, -.3, -.3)[0];
    } else {
      for (const y of [-120, -90, -60]) brush(S, L.ring(y, -.9, rnd(.3, .9)), 1.6, dark(cl, .25), { prof: 'leaf', nb: 0, a: .22 });
      brush(S, L.ring(-226, -.95, .95), 2.4, dark(cl, .4), { prof: 'leaf', nb: 0, a: .35 });
      grain(S, L.sil, dark(cl, .3), 40, .25, 1.4);
    }
    const hr = handle(1);
    Object.assign(parts, { mouth: [0, -286 + L.dy], neck: [0, -246 + L.dy], handle: hr[6], body: [-30, -130], foot: [0, -6] });
    seat(S, parts);
    return { S, parts };
  });

  // ================================================================ treasure
  function coinFace(S, cx, cy, R, m, motif) {
    const relief = dark(m, .45), hi = C.paperLight;
    if (motif === 'tughra') {
      const P = [[cx + R * .18, cy + R * .32], [cx + R * .22, cy - R * .5]], P2 = [[cx + R * .02, cy + R * .32], [cx + R * .05, cy - R * .56]], P3 = [[cx - R * .14, cy + R * .32], [cx - R * .1, cy - R * .46]];
      for (const p of [P, P2, P3]) { brush(S, p.map(([x, y]) => [x + 1.5, y + 1.5]), R * .06, relief, { prof: 'tip', nb: 0, a: .7 }); brush(S, p, R * .05, hi, { prof: 'tip', nb: 0, a: .55 }); }
      for (const k of [1, .62]) { const e = ell(cx - R * .26 * k - R * .04, cy + R * .2, R * .3 * k, R * .2 * k, -.4, TAU - .9, 24); brush(S, e.map(([x, y]) => [x + 1.5, y + 1.5]), R * .045, relief, { prof: 'even', nb: 0, a: .65 }); brush(S, e, R * .04, hi, { prof: 'even', nb: 0, a: .5 }); }
      const base = qcurve(cx - R * .5, cy + R * .36, cx + R * .55, cy + R * .3, -R * .12, 12);
      brush(S, base.map(([x, y]) => [x + 1.5, y + 1.5]), R * .05, relief, { prof: 'brush', nb: 0, a: .65 }); brush(S, base, R * .04, hi, { prof: 'brush', nb: 0, a: .5 });
    } else if (motif === 'star') {
      const pts = []; for (let k = 0; k < 16; k++) { const a = -PI / 2 + k * PI / 8, r = k % 2 ? R * .2 : R * .48; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      wsh(S, pts.map(([x, y]) => [x + 2, y + 2]), relief, .45, 2, .4); wsh(S, pts, lite(m, .25), .55, 2, .4); inkC(S, pts, 1, { a: .5 });
    } else {   // a laureate profile head in low relief, facing right
      const s = R / 100, P = [[-30, 52], [-36, 18], [-34, -14], [-22, -40], [0, -52], [22, -46], [32, -30], [34, -14], [42, -2], [36, 4], [38, 14], [34, 20], [34, 30], [22, 36], [18, 52]].map(([x, y]) => [cx + x * s, cy + y * s]);
      const head = spline(P, false, 3);
      wsh(S, head.map(([x, y]) => [x + 2.5 * s, y + 3 * s]).concat([[cx + 18 * s, cy + 60 * s], [cx - 30 * s, cy + 60 * s]]), relief, .45, 2, .4);
      wsh(S, head.concat([[cx + 18 * s, cy + 58 * s], [cx - 30 * s, cy + 58 * s]]), lite(m, .2), .45, 2, .4);
      brush(S, head.slice(2, 14), 3 * s, hi, { prof: 'leaf', nb: 0, a: .55 });
      ink(S, head.slice(14), 1.2, { a: .6 });
      for (let k = 0; k < 7; k++) { const a = PI * 1.15 + k * .17, x = cx - 4 * s + Math.cos(a) * 34 * s, y = cy - 10 * s + Math.sin(a) * 34 * s; brush(S, WC.polar(x, y, a + 1.9, 11 * s, 2, 4), 6 * s, relief, { prof: 'leaf', nb: 0, a: .6 }); }
      ink(S, [[cx + 8 * s, cy - 6 * s], [cx + 16 * s, cy - 4 * s]], 1, { a: .6, gaps: 0 });
    }
  }
  def('coin', o => {
    const S = [], m = metal(o.metal || 'gold'), R = 112, cy = -R, e = 13;
    // the edge (thickness) seen on the right
    const edge = ell(0, cy, R, R, -PI / 2, PI / 2, 30).concat(ell(e, cy, R * .985, R, PI / 2, -PI / 2, 30));
    wsh(S, edge, dark(m, .3), .65, 3, .5);
    for (let k = 0; k < 24; k++) { const a = -PI / 2 + (k + .5) / 24 * PI, x = Math.cos(a) * R, y = cy + Math.sin(a) * R; ink(S, [[x + 2, y], [x + e * .9, y]], .8, { a: .45, gaps: 0 }); }
    wsh(S, ell(0, cy, R, R, 0, TAU, 60), m, .6, 3, .6);
    brush(S, ell(0, cy, R * .58, R * .58, PI * .9, PI * 1.6, 12), R * .3, lite(m, .2), { prof: 'leaf', nb: 4, a: .3 });
    brush(S, ell(0, cy, R * .93, R * .93, 0, TAU, 60), R * .12, dark(m, .12), { prof: 'even', nb: 5, a: .3, rough: .06 });
    for (let k = 0; k < 64; k++) { const a = k / 64 * TAU; dot(S, Math.cos(a) * R * .83, cy + Math.sin(a) * R * .83, 1.6, dark(m, .45), .7); }
    // legend round the rim
    for (const [a0, a1] of [[PI * .62, PI * 1.38], [-PI * .38, PI * .38]]) for (let k = 0; k < 11; k++) { const a = a0 + (a1 - a0) * k / 10, x = Math.cos(a) * R * .72, y = cy + Math.sin(a) * R * .72; brush(S, WC.polar(x, y, a + PI / 2 + rnd(-.3, .3), rnd(5, 8), rnd(-2, 2), 3), 1.8, dark(m, .5), { prof: 'even', nb: 0, a: .6 }); }
    coinFace(S, 0, cy, R * .6, m, o.motif || 'head');
    const P2 = (u, v) => [u, cy + v];
    const sh = ell(0, cy, R, R, -.5, PI * .9, 24).concat(ell(R * .12, cy + R * .1, R * .86, R * .86, PI * .9, -.5, 24));
    wsh(S, sh, dark(m, .4), .3, 2, .5);
    brush(S, ell(0, cy, R * .9, R * .9, PI * 1.1, PI * 1.45, 8), 5, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
    ink(S, ell(0, cy, R, R, -.6, PI * .8, 30), 2.2); ink(S, ell(0, cy, R, R, PI * .8, TAU - .6, 24), 1.3, { a: .5 });
    ink(S, ell(e, cy, R * .985, R, -PI / 2, PI / 2, 30), 2.2);
    return { S, parts: { face: [-R * .3, cy - R * .35], motif: [R * .05, cy], rim: [-R * .9, cy + R * .3], edge: [R + e * .6, cy + R * .2] } };
  });

  // ================================================================ armour
  def('helmet', o => {
    const st = o.style || 'corinthian', S = [], parts = {};
    if (st === 'corinthian') {
      const bz = metal('bronze');
      if (o.crest !== false) {
        const red = tok(o.color, C.cloth);
        brush(S, qcurve(0, -250, 0, -292, 0, 4), 10, dark(bz, .2), { prof: 'even', nb: 0, a: .8 });
        for (let k = 0; k < 34; k++) { const x = rnd(-26, 26), a = -PI / 2 + x / 60 + rnd(-.15, .15); brush(S, WC.polar(x * .4, -286, a, rnd(70, 110), x * .6, 8), rnd(6, 10), pick([red, dark(red, .2), lite(red, .15)]), { prof: 'tip', nb: 2, a: rnd(.55, .8) }); }
        parts.crest = [0, -340];
      }
      const half = spline([[0, -270], [46, -262], [80, -236], [98, -196], [102, -150], [98, -104], [104, -56], [110, -16], [86, -2], [52, 2], [22, -2], [12, -8]], false, 4);
      const sil = mirror(half);
      wsh(S, sil, bz, .58, 3, 1.2);
      rows(S, sil, shades(bz, .1), { gap: 26, a: .18, nb: 5, ang: .1 });
      wsh(S, half.concat([[0, -2], [0, -268]]), dark(bz, .25), .35, 2, 1);
      wsh(S, spline([[30, -250], [74, -228], [92, -190], [94, -150], [84, -120], [92, -60], [96, -20], [70, -8]], false, 4).concat([[60, -60], [66, -130], [58, -200]]), dark(bz, .45), .3, 2, .8);
      // the opening: two almond eyes joined to the slit between the cheek pieces
      const eye = s => spline([[s * 10, -146], [s * 30, -164], [s * 62, -162], [s * 84, -146], [s * 60, -132], [s * 26, -132]], true, 4);
      const voidC = mixc(C.ink, bz, .2);
      wsh(S, eye(-1), voidC, .85, 3, .6); wsh(S, eye(1), voidC, .85, 3, .6);
      wsh(S, [[-10, -136], [10, -136], [16, -4], [-16, -4]], voidC, .85, 3, .5);
      // the nasal and the brow
      brush(S, qcurve(-48, -178, 48, -178, -12, 12), 12, dark(bz, .3), { prof: 'leaf', nb: 4, a: .4 });
      brush(S, qcurve(-60, -230, -86, -150, 12, 8), 9, C.paperLight, { prof: 'leaf', nb: 2, a: .55 });
      brush(S, qcurve(-36, -256, 10, -266, 6, 6), 7, C.paperLight, { prof: 'leaf', nb: 0, a: .5 });
      ink(S, offset(half.slice(28), 9), 1, { a: .5 }); ink(S, offset(mirror(half).slice(half.length, half.length + 18), -9), 1, { a: .4 });
      inkC(S, eye(-1), 1.5, { a: .8 }); inkC(S, eye(1), 1.5, { a: .8 });
      ink(S, [[-10, -136], [-16, -4]], 1.4); ink(S, [[10, -136], [16, -4]], 1.4);
      ink(S, half, 2.4); ink(S, mirror(half).slice(half.length), 1.6, { a: .6 });
      Object.assign(parts, { dome: [-40, -230], eye: [-48, -148], nasal: [0, -150], cheek: [-70, -50], rim: [96, -12] });
      parts.crest = parts.crest || [0, -268];
      return { S, parts };
    }
    if (st === 'roman') {
      const ir = metal('iron'), bz = metal('bronze');
      // neck guard and bowl (side view, facing left)
      const bowl = spline([[-100, -104], [-98, -156], [-66, -200], [-6, -218], [54, -204], [92, -164], [102, -122], [124, -96], [146, -72], [144, -60], [118, -70], [94, -88], [40, -98], [-40, -100]], true, 4);
      wsh(S, bowl, ir, .58, 3, 1.2);
      rows(S, bowl, shades(ir, .1), { gap: 22, a: .2, nb: 5, ang: -.1 });
      wsh(S, spline([[-30, -102], [40, -102], [92, -124], [102, -122], [124, -96], [146, -72], [144, -60], [118, -70], [94, -88], [40, -98]], false, 4), dark(ir, .35), .4, 2, .8);
      for (const k of [0, 1, 2]) ink(S, qcurve(98 + k * 3, -118 + k * 9, 140 - k * 5, -70 + k * 4, -4, 8), 1, { a: .45, gaps: 0 });
      wsh(S, [[-60, -100], [96, -92], [100, -82], [-58, -92]], mixc(C.ink, ir, .3), .3, 2, .6);
      brush(S, spline([[-70, -180], [-20, -206], [40, -196]], false, 5), 12, C.paperLight, { prof: 'leaf', nb: 3, a: .5 });
      // brow guard, embossed eyebrows, crest knob, rivets
      tube(S, qcurve(-110, -112, -40, -128, -10, 12), 5, bz, { strokes: 1 });
      for (const x of [-92, -64]) brush(S, ell(x, -146, 14, 8, PI * 1.05, PI * 1.95, 8), 3.5, lite(bz, .1), { prof: 'tip', nb: 0, a: .8 });
      ball(S, 0, -220, 10, bz, { ry: 7 }); tube(S, [[0, -226], [0, -240]], 4, bz, { strokes: 1 });
      for (const [x, y] of [[-40, -96], [10, -97], [60, -90], [110, -70], [140, -62]]) ball(S, x, y, 4, bz, { ink: false });
      // the cheek piece hanging from the rim
      const ch = spline([[-74, -96], [-30, -96], [-26, -60], [-36, -20], [-56, 0], [-70, -8], [-64, -40], [-80, -70]], true, 4);
      wsh(S, ch, ir, .65, 3, .8); wsh(S, ch.filter(([x]) => x > -50), dark(ir, .3), .35, 2, .5);
      ink(S, offset(ch.slice(0, 20), -6), .9, { a: .4 }); inkC(S, ch, 2);
      ball(S, -46, -56, 5, bz);
      ink(S, bowl.slice(0, 28), 1.4, { a: .6 }); ink(S, bowl.slice(28), 2.4);
      Object.assign(parts, { dome: [-10, -200], neck: [150, -66], cheek: [-50, -40], crest: [0, -236], rim: [-100, -110], band: [-60, -122] });
      seat(S, parts);
      return { S, parts };
    }
    if (st === 'viking') {
      const ir = metal('iron');
      // mail aventail behind
      const mail = [];
      for (let r = 0; r < 9; r++) { const y = -96 + r * 11, half = 104 + r * 1.5, P = []; for (let x = -half; x <= half; x += 6) P.push([x, y + (Math.floor(x / 6) % 2 ? 3 : 0) + Math.abs(x) * .05]); mail.push(P); }
      const mailO = spline([[-100, -100], [-110, -50], [-118, -4], [-60, 6], [0, 2], [60, 6], [118, -4], [110, -50], [100, -100]], false, 5);
      wsh(S, mailO, mixc(ir, C.paper, .3), .5, 3, 2);
      wsh(S, spline([[-46, -96], [-52, -40], [-40, 0], [0, 4], [40, 0], [52, -40], [46, -96]], false, 4), mixc(ir, C.paper, .1), .28, 3, 1.5);
      for (const P of mail) ink(S, P.filter(([x, y]) => Math.abs(x) < 104 + (y + 100) * .15), 1, { raw: true, a: .45, col: dark(ir, .2), gaps: 0 });
      pool(S, mailO.slice(6, -6), dark(ir, .2), 3, .3);
      const half = spline([[0, -258], [34, -250], [72, -214], [94, -160], [100, -110], [96, -96]], false, 5);
      const dome = mirror(half);
      wsh(S, dome, ir, .6, 3, 1.2);
      rows(S, dome, shades(ir, .1), { gap: 22, a: .2, nb: 5, ang: .2 });
      wsh(S, half.concat([[0, -96]]), dark(ir, .3), .4, 2, .8);
      brush(S, qcurve(-60, -210, -88, -130, 10, 8), 12, C.paperLight, { prof: 'leaf', nb: 2, a: .5 });
      // bands: rim, the crossing band, ridge
      tube(S, qcurve(-100, -104, 100, -104, -16, 18), 7, dark(ir, .1), { strokes: 1 });
      tube(S, qcurve(0, -256, 0, -108, 0, 14), 6, dark(ir, .1), { strokes: 1 });
      for (const [x, y] of [[-70, -100], [-30, -95], [30, -95], [70, -100], [0, -180]]) ball(S, x, y, 3.6, ir, { ink: false });
      // spectacle guard: two rings round the eyes and a nasal
      const sg = mixc(ir, C.ink, .15);
      for (const s of [-1, 1]) { const E = ell(s * 30, -82, 27, 19, 0, TAU, 28); wsh(S, ell(s * 30, -80, 21, 13, 0, TAU, 20), mixc(C.ink, ir, .25), .8, 2, .4); brush(S, E, 7, sg, { prof: 'even', nb: 3, a: .85, rough: .1 }); ink(S, E.slice(0, 15), 1.4, { a: .7 }); }
      tube(S, qcurve(0, -104, 0, -40, 0, 8), 6, sg, { strokes: 1 });
      ink(S, half, 2.4); ink(S, mirror(half).slice(half.length), 1.5, { a: .6 });
      Object.assign(parts, { dome: [-40, -200], eye: [-30, -82], nasal: [0, -50], mail: [-80, -30], band: [0, -150], rim: [80, -104] });
      return { S, parts };
    }
    if (st === 'knight') {
      const sl = metal('steel'), w0 = 92, w1 = 84, H = 262;
      const sil = spline([[-w0, 0], [-w0 - 4, -120], [-w1, -230], [-w1 + 6, -H], [w1 - 6, -H], [w1, -230], [w0 + 4, -120], [w0, 0], [40, 8], [0, 10], [-40, 8]], true, 4);
      wsh(S, sil, sl, .58, 3, 1);
      rows(S, sil, shades(sl, .1), { gap: 20, a: .18, nb: 5, ang: PI / 2 });
      wsh(S, [[30, 10], [w0, 0], [w0 + 4, -120], [w1, -230], [w1 - 6, -H], [34, -H], [44, -130]], dark(sl, .3), .45, 2, .8);
      wsh(S, ell(0, -H, w1 - 6, 12, PI, TAU, 18).concat(ell(0, -H, w1 - 6, 12, 0, PI, 18)), lite(sl, .3), .5, 2, .5);
      brush(S, qcurve(-62, -236, -70, -40, 8, 10), 13, C.paperLight, { prof: 'leaf', nb: 3, a: .5 });
      // eye slits, the reinforcing cross, breathing holes, rivets
      const voidC = mixc(C.ink, sl, .2);
      for (const s of [-1, 1]) wsh(S, [[s * 12, -168], [s * 80, -170], [s * 80, -160], [s * 12, -158]], voidC, .9, 2, .3);
      tube(S, [[-88, -180], [0, -184], [88, -180]], 5, dark(sl, .12), { strokes: 1 });
      tube(S, [[-88, -146], [0, -150], [88, -146]], 5, dark(sl, .12), { strokes: 1 });
      tube(S, qcurve(0, -256, 0, 6, 0, 16), 8, dark(sl, .1), { strokes: 1 });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const x = 34 + c * 14 + (r % 2) * 7, y = -110 + r * 16; wsh(S, ell(x, y, 3.2, 3.6, 0, TAU, 8), voidC, .85, 1, .1); }
      for (const [x, y] of [[-70, -184], [-34, -186], [34, -186], [70, -184], [0, -230], [0, -60], [0, -100]]) ball(S, x, y, 3.4, sl, { ink: false });
      ink(S, sil.slice(0, 30), 1.6, { a: .6 }); ink(S, sil.slice(28), 2.4);
      Object.assign(parts, { eye: [-48, -164], dome: [-30, -H], band: [0, -60], nasal: [0, -120], rim: [60, 4], breath: [48, -90] });
      return { S, parts };
    }
    // ottoman turban helmet (sarık başlık): a broad fluted bowl swelling from the brow up to a gilt spike, a gilded
    // band with an inscription and a scalloped border, a sliding nasal, a mail curtain over the neck
    const sl = metal('steel'), gd = metal('gold'), ir = metal('iron'), rimY = -92;
    const mailO = spline([[-104, rimY + 2], [-114, -46], [-124, -2], [-64, 8], [0, 4], [64, 8], [124, -2], [114, -46], [104, rimY + 2]], false, 5);
    wsh(S, mailO, mixc(ir, C.paper, .3), .5, 3, 2);
    const hole = spline([[-50, rimY + 4], [-56, -36], [-44, 2], [0, 6], [44, 2], [56, -36], [50, rimY + 4]], false, 4);
    wsh(S, hole, mixc(ir, C.paper, .1), .3, 3, 1.5);
    for (let r = 0; r < 9; r++) {
      const y = rimY + 10 + r * 10.5, hw = 106 + r * 2.1, P = [];
      for (let x = -hw, k = 0; x <= hw; x += 6, k++) P.push([x, y + (k % 2 ? 3 : 0) + Math.abs(x) * .03]);
      ink(S, P, 1, { raw: true, a: .42, col: dark(ir, .15), gaps: 0 });
    }
    pool(S, mailO.slice(8, -8), dark(ir, .2), 3, .3);
    const half = spline([[0, -266], [18, -258], [50, -236], [82, -202], [104, -162], [114, -124], [110, rimY - 6], [104, rimY]], false, 5);
    const bowl = mirror(half), sc_ = f => half.map(([x, y]) => [x * f, y]);
    wsh(S, bowl, sl, .55, 3, 1.8);
    patches(S, bowl, dark(sl, .1), 3, .1);
    for (let k = -6; k <= 6; k++) {   // twisted flutes, like the folds of a turban
      const v = k / 6.6, P = [];
      for (let i = 0; i <= 14; i++) { const f = i / 14, y = rimY - 4 - f * 160; P.push([clamp(Math.sin(Math.asin(clamp(v, -1, 1)) + f * .55), -1, 1) * halfAt(half, y) * .97, y]); }
      brush(S, P, 10, k > 0 ? dark(sl, .22) : lite(sl, .25), { prof: 'leaf', nb: 3, a: .36 });
      ink(S, P, .9, { a: .32, gaps: 0 });
    }
    wsh(S, sc_(1).concat(sc_(.35).reverse()), dark(sl, .3), .35, 2, 1);
    wsh(S, sc_(.92).concat(sc_(.62).reverse()), dark(sl, .45), .22, 2, .8);
    brush(S, qcurve(-56, -214, -100, -128, 16, 10), 14, C.paperLight, { prof: 'leaf', nb: 3, a: .5 });
    // the scalloped gold border above the band
    for (let k = 0; k < 9; k++) { const xa = -100 + k * 22.2, ya = rimY - 34 + Math.abs(xa + 11) * .02; const A = ell(xa + 11, ya, 11, 12, PI, TAU, 8); brush(S, A, 3.4, gd, { prof: 'even', nb: 0, a: .85 }); }
    const bandT = qcurve(-112, rimY - 32, 112, rimY - 32, 12, 22), bandB = qcurve(-105, rimY, 105, rimY, 12, 22);
    wsh(S, bandT.concat(bandB.slice().reverse()), gd, .72, 3, .5);
    wsh(S, bandT.slice(12).concat(bandB.slice(12).reverse()), dark(gd, .3), .35, 2, .3);
    brush(S, lerpP(bandT, bandB, .3).slice(2, 10), 4, C.paperLight, { prof: 'leaf', nb: 0, a: .5 });
    const mid = lerpP(bandT, bandB, .55), ic = dark(gd, .6);
    for (let i = 1; i < 21; i++) {        // an inscription in the band: tall strokes, bowls and swashes
      const [x, y] = mid[i], kind = (i * 7) % 5;
      if (kind === 0) brush(S, [[x, y + 6], [x + 1, y - 9]], 1.6, ic, { prof: 'tip', nb: 0, a: .85 });
      else if (kind === 1) brush(S, ell(x, y + 1, 5, 4, -.2, PI + .4, 6), 1.5, ic, { prof: 'even', nb: 0, a: .8 });
      else if (kind === 2) brush(S, [[x - 6, y + 5], [x, y + 6], [x + 6, y + 2], [x + 4, y - 4]], 1.5, ic, { prof: 'even', nb: 0, a: .8 });
      else if (kind === 3) { brush(S, [[x - 2, y + 5], [x - 1, y - 7]], 1.5, ic, { prof: 'tip', nb: 0, a: .85 }); dot(S, x + 4, y - 6, 1.3, ic); }
      else brush(S, qcurve(x - 7, y + 4, x + 7, y + 4, 4, 5), 1.4, ic, { prof: 'leaf', nb: 0, a: .8 });
    }
    ink(S, bandT, 1.3, { a: .75 }); ink(S, bandB, 1.7);
    // spike / finial
    ball(S, 0, -270, 10, gd, { ry: 7 });
    tube(S, qcurve(0, -274, 0, -326, 0, 8), [6.5, 6, 5.2, 4.5, 3.8, 3, 2.3, 1.6, 1], gd, { strokes: 1 });
    ball(S, 0, -292, 6.5, gd, { ry: 4.5 });
    // nasal bar through its bracket, ending in a leaf below the brow
    tube(S, qcurve(0, -150, 0, -14, 0, 10), 5.2, sl, { strokes: 1 });
    const leaf = spline([[0, -32], [11, -18], [0, 4], [-11, -18]], true, 4);
    wsh(S, leaf, sl, .75, 2, .4); wsh(S, leaf.filter(([x]) => x >= 0), dark(sl, .3), .3, 1, .2); ink(S, leaf, 1.4);
    const br_ = [[-13, -160], [13, -160], [13, -132], [-13, -132]];
    wsh(S, br_, gd, .78, 2, .3); ink(S, br_.concat([br_[0]]), 1.2);
    ink(S, half, 2.4); ink(S, mirror(half).slice(half.length), 1.5, { a: .6 });
    Object.assign(parts, { spike: [0, -318], dome: [-50, -196], band: [-60, rimY - 14], nasal: [0, -60], mail: [-96, -30], rim: [100, rimY] });
    return { S, parts };
  });

  // ================================================================ light
  function glow(c, x, y, r, a, lt, i = 0) {
    const k = a * (.88 + .12 * Math.sin(lt * 5.3 + i) * Math.sin(lt * 2.1 + i * 2));
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, WC.rgba(C.gold, .45 * k)); g.addColorStop(.35, WC.rgba(C.gold, .18 * k)); g.addColorStop(1, WC.rgba(C.gold, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  }
  def('candle', o => {
    const S = [], parts = {}, wax = mixc(C.paperLight, C.clothC, .28), br = metal('brass');
    const hold = o.holder !== false, y0 = hold ? -20 : 0, h = 172, r = 21;
    if (hold) {
      tube(S, ell(86, -24, 18, 14, PI * .55, PI * 2.45, 24), 4, br, { strokes: 1 });
      disc(S, 0, -16, 78, 14, 9, br);
      lathe(S, [[-18, 30], [-26, 28], [-34, 26]].map(([y, rr_]) => [y, rr_]), br, { tilt: .2, strokes: 1, vs: [-.4, .4] });
    }
    const L = lathe(S, [[y0 - 14, r], [y0 - 60, r], [y0 - 120, r - .5], [y0 - h, r - 1]], wax, { tilt: .2, mouth: false, dk: .18, vs: [-.5, 0, .5] });
    const ty = y0 - h + L.dy;
    wsh(S, ell(0, ty, r - 1, (r - 1) * .2, 0, TAU, 20), lite(wax, .25), .5, 2, .3);
    wsh(S, ell(2, ty + 1, r * .55, r * .1, 0, TAU, 14), dark(wax, .2), .35, 1, .2);
    for (const [x, len] of [[-r + 3, 50], [r * .4, 26], [r - 4, 72]]) { const P = qcurve(x, ty + 2, x + rnd(-2, 2), ty + len, rnd(-3, 3), 6); brush(S, P, 6, lite(wax, .1), { prof: 'tip', nb: 0, a: .7 }); ink(S, offset(P, 3), .8, { a: .4, gaps: 0 }); }
    brush(S, qcurve(0, ty, 1, ty - 10, 1, 4), 2.4, C.ink, { prof: 'tip', nb: 0, a: .9 });
    Object.assign(parts, { wick: [0, ty - 10], flame: [0, ty - 34], wax: [-r * .5, ty + 60], drip: [r - 4, ty + 50], holder: [60, -18] });
    const live = (c, lt) => { glow(c, 0, ty - 26, 150, 1, lt); WC.flame(c, 0, ty - 6, 44 * (.92 + .08 * Math.sin(lt * 7)), lt, 1); };
    return { S, parts, live, sh: [8, 90, 12] };
  });

  // ================================================================ shields
  def('shield', o => {
    const st = o.style || 'round', S = [], parts = {};
    if (st === 'round' || st === 'ottoman') {
      const R = 142, cy = -R, wood = mixc(C.wood, C.ground, .35);
      if (st === 'round') {
        const paint = tok(o.color, C.cloth), cream = mixc(C.paperLight, C.clothC, .3);
        wsh(S, ell(0, cy, R, R, 0, TAU, 72), wood, .55, 3, 1.5);
        // painted quarters over the planks, worn in places
        for (let q = 0; q < 4; q++) { const a0 = q * PI / 2 - PI / 4, P = [[0, cy]].concat(ell(0, cy, R * .97, R * .97, a0, a0 + PI / 2, 16)); wsh(S, P, q % 2 ? cream : paint, q % 2 ? .5 : .62, 3, 1.2); rows(S, P, q % 2 ? cream : dark(paint, .1), { gap: 26, a: .2, nb: 5, ang: PI / 2 }); }
        patches(S, ell(0, cy, R * .9, R * .9, 0, TAU, 40), lite(wood, .3), 4, .18, .12);
        for (let k = -3; k <= 3; k++) { const x = k * 38 + rnd(-4, 4), h = Math.sqrt(Math.max(0, R * R - x * x)) * .97; ink(S, [[x, cy - h], [x, cy + h]], .9, { a: .4 }); }
        brush(S, ell(0, cy, R - 5, R - 5, 0, TAU, 72), 11, dark(C.wood, .3), { prof: 'even', nb: 5, a: .6, rough: .1 });
      } else {
        // kalkan: cane spiral wrapped in coloured silk, in a rosette of sectors
        const cols = [tok(o.color, C.red), metal('gold'), mixc(C.paperLight, C.clothC, .3), C.clothB];
        wsh(S, ell(0, cy, R, R, 0, TAU, 72), mixc(C.clothC, C.paper, .3), .5, 3, 1.5);
        for (let ring = 0; ring < 11; ring++) {
          const r = 44 + ring * 9.2, nseg = 16;
          for (let k = 0; k < nseg; k++) {
            const a0 = k / nseg * TAU + ring * .11, a1 = a0 + TAU / nseg + .02;
            const c = ring < 2 ? cols[1] : ring === 2 || ring === 10 ? cols[0] : ring === 9 ? cols[3] : (k % 2 ? cols[0] : cols[2]);
            brush(S, ell(0, cy, r, r, a0, a1, 5), 9.5, c, { prof: 'even', nb: 2, a: .66, rough: .12 });
          }
          ink(S, ell(0, cy, r + 4.6, r + 4.6, 0, TAU, 48), .7, { a: .28, gaps: 0 });
        }
        brush(S, ell(0, cy, R - 4, R - 4, 0, TAU, 72), 10, dark(tok(o.color, C.red), .35), { prof: 'even', nb: 4, a: .75, rough: .1 });
      }
      // boss
      const bm = st === 'ottoman' ? metal('steel') : metal('iron');
      if (st === 'ottoman') { const lob = []; for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU, rr_ = 40 + 4 * Math.cos(a * 8); lob.push([Math.cos(a) * rr_, cy + Math.sin(a) * rr_]); } wsh(S, lob, metal('gold'), .7, 2, .4); inkC(S, lob, 1.2, { a: .7 }); }
      else { wsh(S, ell(0, cy, 44, 44, 0, TAU, 40), bm, .5, 2, .5); ink(S, ell(0, cy, 44, 44, -.5, PI, 30), 1.4, { a: .7 }); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + .3; ball(S, Math.cos(a) * 38, cy + Math.sin(a) * 38, 3.4, bm, { ink: false }); } }
      ball(S, 0, cy, 32, bm);
      // light and shade over the face
      wsh(S, ell(0, cy, R, R, -.6, PI * .9, 30).concat(ell(R * .08, cy + R * .06, R * .88, R * .88, PI * .9, -.6, 30)), dark(C.stoneDark, .2), .22, 2, .6);
      ink(S, ell(0, cy, R, R, -.7, PI + .1, 50), 2.6); ink(S, ell(0, cy, R, R, PI + .1, TAU - .7, 30), 1.5, { a: .55 });
      Object.assign(parts, { boss: [0, cy], rim: [R * .7, cy + R * .7], face: [-R * .5, cy - R * .4] });
      return { S, parts };
    }
    if (st === 'kite') {
      const paint = tok(o.color, C.clothB), half = spline([[0, -336], [56, -328], [92, -298], [100, -250], [88, -170], [58, -90], [24, -26], [0, 0]], false, 6);
      const sil = mirror(half.slice().reverse().reverse());
      wsh(S, sil, paint, .6, 3, 1.5);
      rows(S, sil, shades(paint, .1), { gap: 24, a: .2, nb: 5, ang: PI / 2 });
      patches(S, sil, lite(paint, .3), 3, .16, .14);
      // curvature: the sides turn away
      wsh(S, half.concat(half.map(([x, y]) => [x * .45, y]).reverse()), dark(paint, .3), .35, 2, .8);
      wsh(S, mirror(half).slice(half.length).concat(mirror(half).slice(half.length).map(([x, y]) => [x * .7, y]).reverse()), dark(paint, .15), .25, 2, .8);
      brush(S, qcurve(-30, -320, -20, -60, 10, 10), 16, C.paperLight, { prof: 'leaf', nb: 3, a: .35 });
      // a gold cross with roundels, the rim, a small boss
      const gd = metal('gold');
      brush(S, qcurve(0, -318, 0, -40, 0, 12), 16, gd, { prof: 'even', nb: 4, a: .75 });
      brush(S, qcurve(-82, -236, 82, -236, -8, 12), 16, gd, { prof: 'even', nb: 4, a: .75 });
      for (const [x, y] of [[-44, -284], [44, -284], [-40, -180], [40, -180], [0, -110]]) ball(S, x, y, 8, gd);
      brush(S, offset(sil, 5).slice(0, -1), 7, dark(C.wood, .2), { prof: 'even', nb: 3, a: .55, rough: .1 });
      ball(S, 0, -236, 16, metal('iron'));
      ink(S, half, 2.4); ink(S, mirror(half).slice(half.length), 1.5, { a: .6 });
      Object.assign(parts, { boss: [0, -236], rim: [70, -160], face: [-40, -150], cross: [0, -160] });
      return { S, parts };
    }
    // scutum: a curved rectangle, red with gold thunderbolts and wings, bronze edging and a central boss
    const red = tok(o.color, C.red), gd = metal('gold'), w = 94, h = 300, cy = -h / 2;
    const sil = spline([[-w, -h + 18], [-w + 14, -h], [w - 14, -h], [w, -h + 18], [w + 4, cy], [w, -18], [w - 14, 0], [-w + 14, 0], [-w, -18], [-w - 4, cy]], true, 4);
    wsh(S, sil, red, .62, 3, 1.5);
    rows(S, sil, shades(red, .08), { gap: 26, a: .2, nb: 5, ang: PI / 2 });
    patches(S, sil, dark(red, .15), 3, .14, .15);
    wsh(S, [[w * .45, -h + 2], [w + 2, -h + 14], [w + 5, cy], [w + 2, -14], [w * .45, -2]], dark(red, .35), .4, 2, 1);
    wsh(S, [[-w * .6, -h + 2], [-w - 2, -h + 14], [-w - 5, cy], [-w - 2, -14], [-w * .6, -2]], dark(red, .15), .25, 2, 1);
    brush(S, qcurve(-34, -h + 20, -30, -20, 6, 10), 18, C.paperLight, { prof: 'leaf', nb: 3, a: .3 });
    const bolt = (x, y, sx, sy) => { const P = [[x, y], [x + sx * 22, y + sy * 26], [x + sx * 12, y + sy * 30], [x + sx * 38, y + sy * 70], [x + sx * 20, y + sy * 64], [x + sx * 36, y + sy * 110]]; brush(S, P, 6, gd, { prof: 'tip', nb: 0, a: .85 }); ink(S, P, 1, { a: .5, raw: true, gaps: 0 }); };
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) bolt(sx * 30, cy + sy * 30, sx, sy);
    for (const sx of [-1, 1]) for (let k = 0; k < 5; k++) brush(S, WC.polar(sx * 34, cy - 6, sx > 0 ? -.2 - k * .22 : PI + .2 + k * .22, 46 - k * 4, sx * -6, 6), 8, gd, { prof: 'leaf', nb: 0, a: .75 });
    // boss plate and dome
    wsh(S, [[-36, cy - 26], [36, cy - 26], [36, cy + 26], [-36, cy + 26]], metal('bronze'), .7, 2, .5); ink(S, [[-36, cy - 26], [36, cy - 26], [36, cy + 26], [-36, cy + 26], [-36, cy - 26]], 1.4);
    ball(S, 0, cy, 24, metal('bronze'));
    brush(S, offset(sil, 4).slice(0, -1), 7, metal('bronze'), { prof: 'even', nb: 3, a: .75, rough: .1 });
    inkC(S, sil, 2.2);
    Object.assign(parts, { boss: [0, cy], rim: [w, -40], face: [-50, -230], bolt: [50, cy + 70] });
    return { S, parts };
  });

  // ================================================================ regalia
  def('crown', o => {
    const S = [], parts = {}, gd = metal('gold'), royal = o.style !== 'circlet', bw = 104, bt = .26;
    const front = (y, r = bw) => ell(0, y, r, r * bt, 0, PI, 30), back = (y, r = bw) => ell(0, y, r, r * bt, PI, TAU, 30);
    if (royal) {
      // velvet cap inside, the arches over it, monde and cross
      const vel = tok(o.color, C.cloth), cap = spline([[-96, -70], [-90, -130], [-56, -176], [0, -190], [56, -176], [90, -130], [96, -70]], false, 5);
      wsh(S, cap.concat(back(-70, 96).slice().reverse()), vel, .7, 3, 1.5);
      rows(S, cap.concat(back(-70, 96).slice().reverse()), dark(vel, .15), { gap: 18, a: .22, nb: 4, ang: .8 });
      wsh(S, cap.slice(Math.floor(cap.length / 2)).concat([[30, -80]]), dark(vel, .35), .35, 2, 1);
      ink(S, cap, 1.2, { a: .5 });
      for (const s of [-1, 1]) { const A = ell(0, -66, 98, 140, s < 0 ? PI : 0, s < 0 ? PI * 1.5 : -PI / 2, 16); tube(S, A, 6.5, gd, { strokes: 1 }); for (let i = 2; i < A.length - 1; i += 2) ball(S, A[i][0] - s * 5, A[i][1] - 5, 3.6, C.paperLight, { ink: false, dk: .15 }); }
      const A2 = spline([[0, -70], [0, -150], [0, -206]], false, 6); tube(S, A2, 6, gd, { strokes: 1 });
      ball(S, 0, -218, 15, gd);
      tube(S, [[0, -232], [0, -270]], 4.5, gd, { strokes: 1 }); tube(S, [[-14, -256], [14, -256]], 4.5, gd, { strokes: 1 });
      parts.cross = [0, -262];
    }
    // the band (front half), its back edge first
    ink(S, back(-62), 1.2, { a: .5 });
    const bandPoly = front(-62).concat(front(0).slice().reverse());
    // points: fleurs / crosses (royal) or tall triangles with pearls (circlet)
    const npts = royal ? 5 : 7;
    for (let k = 0; k < npts; k++) {
      const v = -.9 + 1.8 * k / (npts - 1), x = v * bw, yb = -62 + bw * bt * Math.sqrt(1 - v * v), s = Math.sqrt(1 - v * v) * .5 + .5;
      if (royal && k % 2 === 0) { const P = [[x - 16 * s, yb], [x - 6 * s, yb - 22], [x - 14 * s, yb - 36], [x, yb - 54], [x + 14 * s, yb - 36], [x + 6 * s, yb - 22], [x + 16 * s, yb]]; wsh(S, P, gd, .75, 2, .4); ink(S, P, 1.2, { raw: true, a: .75, gaps: 0 }); ball(S, x, yb - 56, 4, C.paperLight, { ink: false }); }
      else { const ht = royal ? 30 : 48 * s; const P = [[x - 14 * s, yb], [x, yb - ht], [x + 14 * s, yb]]; wsh(S, P, gd, .75, 2, .4); ink(S, P, 1.2, { raw: true, a: .7, gaps: 0 }); ball(S, x, yb - ht - 5, 5, mixc(C.paperLight, C.clothC, .15)); }
    }
    wsh(S, bandPoly, gd, .7, 3, .6);
    rows(S, bandPoly, shades(gd, .1), { gap: 14, a: .25, nb: 4 });
    wsh(S, ell(0, -62, bw, bw * bt, 0, PI * .5, 16).concat(ell(0, 0, bw, bw * bt, PI * .5, 0, 16)), dark(gd, .35), .38, 2, .4);
    brush(S, ell(0, -40, bw * .96, bw * bt, PI * .6, PI * .95, 8), 8, C.paperLight, { prof: 'leaf', nb: 0, a: .5 });
    // jewels on the band
    const gems = [C.red, C.clothB, C.green, C.red, C.clothB];
    for (let k = 0; k < 5; k++) { const v = -.72 + 1.44 * k / 4, x = v * bw, y = -31 + bw * bt * Math.sqrt(1 - v * v), s = Math.sqrt(1 - v * v); ball(S, x, y, 10 * s + 3, gems[k], { ry: 12, dk: .4 }); }
    for (let k = 0; k < 10; k++) { const v = -.9 + 1.8 * (k + .5) / 10, x = v * bw, y = -31 + bw * bt * Math.sqrt(1 - v * v); if (k % 2) dot(S, x, y - 14, 2.6, C.paperLight, .9); }
    ink(S, front(-62), 1.5); ink(S, front(0), 2.4);
    ink(S, [[-bw, -62], [-bw, 0]], 1.4, { gaps: 0, a: .7 }); ink(S, [[bw, -62], [bw, 0]], 2, { gaps: 0 });
    Object.assign(parts, { band: [-60, -30], gem: [0, -10], points: [-50, -100] });
    seat(S, parts);
    return { S, parts };
  });

  // ================================================================ writing
  const PARCH = () => mixc(C.paperLight, C.clothC, .3);
  function scribble(S, x0, x1, y, o = {}) {        // a line of hand-writing: small joined loops and strokes
    const P = []; let x = x0;
    while (x < x1) { const w = rnd(3, 6); P.push([x, y + rnd(-1, 1)], [x + w * .4, y - rnd(3, 7) * (o.h || 1)], [x + w, y + rnd(0, 2)]); x += w + (rnd() < .18 ? rnd(5, 9) : 0); }
    for (let i = 0; i < P.length; i += 18) { const seg_ = P.slice(i, i + 19); if (seg_.length > 2) { const s = mk(seg_, o.w || 1.2, o.col || C.inkSoft, { prof: 'even', nb: 0, a: o.a ?? .75, rough: .3 }); s.fine = true; S.push(s); } }
  }
  def('scroll', o => {
    const S = [], parts = {}, pa = PARCH(), wood = C.wood;
    if (o.open) {
      const w = 210, top = -300, bot = -26;
      const sheet = [[-w / 2, top + 8], [w / 2, top + 8], [w / 2 + 4, (top + bot) / 2], [w / 2, bot - 8], [-w / 2, bot - 8], [-w / 2 - 4, (top + bot) / 2]];
      wsh(S, sheet, pa, .6, 3, 1.5);
      patches(S, sheet, dark(pa, .1), 4, .12, .2); grain(S, sheet, C.stain, 25, .25, 2);
      wsh(S, [[w / 2 - 30, top + 8], [w / 2, top + 8], [w / 2 + 4, (top + bot) / 2], [w / 2, bot - 8], [w / 2 - 26, bot - 8]], dark(pa, .15), .3, 2, 1);
      wsh(S, [[-w / 2, top + 8], [w / 2, top + 8], [w / 2, top + 26], [-w / 2, top + 26]], dark(pa, .2), .3, 2, .6);
      wsh(S, [[-w / 2, bot - 8], [w / 2, bot - 8], [w / 2, bot - 24], [-w / 2, bot - 24]], dark(pa, .2), .3, 2, .6);
      // a red initial and the lines of text
      wsh(S, [[-80, top + 42], [-54, top + 42], [-54, top + 72], [-80, top + 72]], C.red, .55, 2, .8);
      for (let y = top + 48, i = 0; y < bot - 34; y += 15, i++) scribble(S, i < 2 ? -46 : -82, rnd(60, 84), y);
      ink(S, sheet.slice(1, 4), 1.5, { a: .6 }); ink(S, [sheet[4], sheet[5], sheet[0]], 1.2, { a: .5, raw: true });
      for (const y of [top, bot]) {
        tube(S, [[-w / 2 - 6, y], [w / 2 + 6, y]], 15, lite(pa, .1), { strokes: 2 });
        for (const s of [-1, 1]) { tube(S, [[s * (w / 2 + 6), y], [s * (w / 2 + 24), y]], 7, wood, { strokes: 1 }); ball(S, s * (w / 2 + 28), y, 8, wood); }
      }
      Object.assign(parts, { text: [10, -170], roll: [60, top], initial: [-67, top + 57] });
      seat(S, parts);
      return { S, parts };
    }
    const L = 250, R = 28, cy = -R;
    tube(S, [[-L / 2, cy], [L / 2, cy]], R, pa, { strokes: 3, dk: .2 });
    // the spiral end of the roll
    wsh(S, ell(L / 2, cy, R * .38, R, 0, TAU, 24), lite(pa, .1), .6, 2, .4);
    const sp = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU * 3, r = R * (1 - i / 46); sp.push([L / 2 + Math.cos(a) * r * .36, cy + Math.sin(a) * r]); }
    ink(S, sp, 1, { a: .6, gaps: 0 }); ink(S, ell(L / 2, cy, R * .38, R, -PI / 2, PI / 2, 20), 1.6);
    // ribbon and wax seal
    const rib = tok(o.color, C.red);
    brush(S, [[-10, cy - R - 2], [-6, cy], [-10, cy + R + 2]], 12, rib, { prof: 'even', nb: 3, a: .8 });
    brush(S, qcurve(-10, cy + R, -26, cy + R + 44, 8, 8), 8, rib, { prof: 'tip', nb: 2, a: .75 });
    brush(S, qcurve(-6, cy + R, 6, cy + R + 52, -8, 8), 8, rib, { prof: 'tip', nb: 2, a: .75 });
    if (o.seal !== false) { ball(S, -2, cy + R + 50, 20, mixc(C.red, C.ink, .15), { dk: .35 }); ink(S, ell(-2, cy + R + 50, 11, 11, 0, TAU, 16), 1.1, { col: dark(C.red, .5), a: .7, gaps: 0 }); parts.seal = [-2, cy + R + 50]; }
    Object.assign(parts, { roll: [-70, cy], text: [40, cy], end: [L / 2, cy] });
    seat(S, parts);
    return { S, parts };
  });

  def('book', o => {
    const S = [], parts = {}, cov = tok(o.color, mixc(C.cloth, C.wood, .3)), pa = PARCH(), gd = metal('gold');
    if (o.open) {
      // two pages bending up from the gutter, the block of pages and the cover underneath
      const W2 = 150, top = -200, ky = 18;
      wsh(S, [[-W2 - 12, top + 30], [0, top + 44], [W2 + 12, top + 30], [W2 + 18, -2], [0, 8], [-W2 - 18, -2]], dark(cov, .1), .7, 3, 1);
      for (const s of [-1, 1]) {
        const edge = qcurve(s * 2, top + 34, s * W2, top + ky, -s * 26, 12), low = qcurve(s * 2, -2, s * W2, -14, s * 18, 12);
        const pg = edge.concat([[s * (W2 + 6), (top + ky - 14) / 2], ...low.slice().reverse()]);
        for (let k = 3; k > 0; k--) ink(S, pg.slice(edge.length - 1, edge.length + 2).map(([x, y]) => [x + s * k * 3, y + k * 2]), .8, { a: .4, raw: true, gaps: 0 });
        wsh(S, pg, pa, .62, 3, 1);
        patches(S, pg, dark(pa, .08), 2, .1, .2);
        wsh(S, [[s * 2, top + 34], [s * 26, top + 32], [s * 22, -4], [s * 2, -2]], dark(pa, .2), .35, 2, .6);
        for (let i = 0; i < 9; i++) { const f = (i + 1.5) / 11, a = lerpP(edge, low, f); scribble(S, Math.min(a[2][0], a[11][0]) + (s < 0 ? 4 : 10), Math.max(a[2][0], a[11][0]) - (s < 0 ? 10 : 4), a[6][1] + (i < 0 ? 0 : 0)); }
        ink(S, pg, 1.4, { a: .7 });
      }
      wsh(S, [[-54, top + 62], [-28, top + 62], [-28, top + 90], [-54, top + 90]], C.red, .5, 2, .6);
      ink(S, [[0, top + 40], [0, 4]], 1.6, { gaps: 0 });
      Object.assign(parts, { pages: [70, -100], text: [-80, -110], spine: [0, -60], cover: [W2 + 14, -6] });
      seat(S, parts);
      return { S, parts };
    }
    const B = box(S, -110, 0, 220, 34, 160, cov, { lt: .15, a: .62 });
    // page edges on the front and the right
    const pf = [[-104, -5], [104, -5], [104, -29], [-104, -29]], pr_ = [[110, -4], [110 + B.dx - 6, -4 + B.dy + 4], [110 + B.dx - 6, -28 + B.dy + 4], [110, -28]];
    wsh(S, pf, pa, .75, 2, .5); wsh(S, pr_, dark(pa, .12), .75, 2, .5);
    for (let k = 1; k < 6; k++) { ink(S, [[-100, -5 - k * 4], [100, -5 - k * 4]], .6, { a: .35, gaps: 0 }); ink(S, [[112, -5 - k * 4], [110 + B.dx - 8, -5 - k * 4 + B.dy + 4]], .6, { a: .3, gaps: 0 }); }
    // tooled cover: an inset frame, a centre lozenge, gilt corners, a clasp
    const T = B.T, inset = (f) => T.map(([x, y]) => [x + (T[0][0] + T[2][0]) / 2 * 0 + ((T[0][0] + T[1][0] + T[2][0] + T[3][0]) / 4 - x) * f, y + ((T[0][1] + T[1][1] + T[2][1] + T[3][1]) / 4 - y) * f]);
    rows(S, T, shades(cov, .08), { gap: 16, a: .22, nb: 5, ang: Math.atan2(B.dy, B.dx) });
    inkC(S, inset(.12), 1, { col: gd, a: .9 }); inkC(S, inset(.18), .8, { col: gd, a: .7 });
    const c0 = inset(1)[0], lz = [[c0[0] - 34, c0[1]], [c0[0], c0[1] - 26], [c0[0] + 34, c0[1]], [c0[0], c0[1] + 26]];
    wsh(S, lz, gd, .6, 2, .5); inkC(S, lz, 1, { a: .6 });
    for (const p of inset(.1)) wsh(S, ell(p[0], p[1], 9, 6, 0, TAU, 10), gd, .8, 1, .2);
    wsh(S, [[100, -12], [126, -12], [126, -26], [100, -26]], gd, .8, 2, .3); ink(S, [[100, -12], [126, -12], [126, -26], [100, -26], [100, -12]], 1.1);
    Object.assign(parts, { cover: c0, pages: [0, -17], spine: [-110, -17], clasp: [113, -19] });
    seat(S, parts);
    return { S, parts };
  });

  def('letter', o => {
    const S = [], pa = PARCH(), w = 250, h = 170, x0 = -w / 2, y0 = -h;
    const sheet = [[x0, y0], [-x0, y0 + 4], [-x0 + 2, 0], [x0 + 2, -3]];
    wsh(S, sheet, pa, .65, 3, 1.4);
    patches(S, sheet, dark(pa, .08), 3, .12, .2); grain(S, sheet, C.stain, 20, .22, 2);
    // the folded flaps: the top flap's shadow and its fold lines
    const tip = [6, y0 + h * .62];
    wsh(S, [[x0 + 2, y0 + 4], tip, [-x0 - 2, y0 + 6], [-x0 - 2, y0 + 16], tip.map((v, i) => v + (i ? 8 : 0)), [x0 + 2, y0 + 14]], dark(pa, .2), .25, 2, .5);
    ink(S, [[x0, y0 + 2], tip, [-x0, y0 + 5]], 1.3, { a: .7 });
    ink(S, [[x0 + 2, -3], [-8, y0 + h * .42], [-x0 + 2, 0]], .9, { a: .4 });
    wsh(S, [[x0, y0], [-x0, y0 + 4], [-x0, y0 + 12], [x0, y0 + 8]], dark(pa, .15), .3, 2, .4);
    scribble(S, x0 + 30, x0 + 120, -40, { col: C.ink, w: 1.4 }); scribble(S, x0 + 44, x0 + 140, -22, { col: C.ink, w: 1.4 });
    // wax seal with a stamped mark
    const sealC = tok(o.color, C.red), [sx, sy] = tip;
    wsh(S, spline([[sx - 26, sy - 4], [sx - 18, sy - 22], [sx + 4, sy - 28], [sx + 24, sy - 14], [sx + 26, sy + 10], [sx + 8, sy + 26], [sx - 16, sy + 22], [sx - 28, sy + 10]], true, 3), sealC, .85, 3, 1);
    wsh(S, ell(sx + 3, sy + 3, 17, 17, -.5, PI * .8, 12).concat(ell(sx, sy, 15, 15, PI * .8, -.5, 12)), dark(sealC, .35), .4, 2, .3);
    inkC(S, ell(sx, sy, 15, 15, 0, TAU, 20), 1, { col: dark(sealC, .55), a: .7 });
    brush(S, ell(sx, sy, 8, 8, 0, PI * 1.6, 10), 1.6, dark(sealC, .55), { prof: 'even', nb: 0, a: .7 });
    dot(S, sx - 9, sy - 12, 3, C.paperLight, .6);
    inkC(S, sheet, 1.8, { a: .8 });
    return { S, parts: { seal: [sx, sy], fold: [x0 + 50, y0 + 30], text: [x0 + 80, -32] } };
  });

  function featherS(S, P, w, c, o = {}) {      // a feather along the rachis P: vane barbs on both sides
    const N = normals(P), n = P.length;
    for (const side of [-1, 1]) {
      const vane = [];
      for (let i = 1; i < n; i++) { const f = i / (n - 1), ww = w * Math.pow(Math.sin(PI * Math.min(1, f * 1.08)), .7) * (side > 0 ? 1 : .8); vane.push([P[i][0] + N[i][0] * ww * side, P[i][1] + N[i][1] * ww * side]); }
      const poly = P.slice(1).concat(vane.slice().reverse());
      wsh(S, poly, c, .45, 2, .8);
      for (let i = 2; i < n - 1; i += 1) {
        const f = i / (n - 1), ww = w * Math.pow(Math.sin(PI * Math.min(1, f * 1.08)), .7) * (side > 0 ? 1 : .8);
        const a = Math.atan2(N[i][1] * side, N[i][0] * side) + side * .0 - .45 * Math.sign(1), [x, y] = P[i];
        const d = [P[Math.max(0, i - 1)][0] - P[i][0], P[Math.max(0, i - 1)][1] - P[i][1]], dl = Math.hypot(...d) || 1;
        const ex = x + N[i][0] * ww * side - d[0] / dl * ww * .5, ey = y + N[i][1] * ww * side - d[1] / dl * ww * .5;
        brush(S, qcurve(x, y, ex, ey, side * 2, 4), 1.6, i % 3 ? c : dark(c, .25), { prof: 'tip', nb: 0, a: .55 });
      }
      if (o.split !== false) { const i = Math.floor(n * rnd(.45, .7)), [x, y] = P[i]; brush(S, qcurve(x, y, x + N[i][0] * w * side, y + N[i][1] * w * side, 0, 3), 2.2, C.paperLight, { prof: 'even', nb: 0, a: .7 }); }
    }
    if (o.bars) for (let i = 4; i < n - 2; i += 3) { const [x, y] = P[i]; brush(S, [[x - N[i][0] * w * .8, y - N[i][1] * w * .8], [x + N[i][0] * w, y + N[i][1] * w]], 3, dark(c, .35), { prof: 'leaf', nb: 0, a: .35 }); }
    if (o.edge) for (const side of [-1, 1]) { const E = []; for (let i = 1; i < n; i++) { const f = i / (n - 1), ww = w * Math.pow(Math.sin(PI * Math.min(1, f * 1.08)), .7) * (side > 0 ? 1 : .8); E.push([P[i][0] + N[i][0] * ww * side, P[i][1] + N[i][1] * ww * side]); } ink(S, E, 1, { a: .45 }); }
    const r = mk(P, 3, lite(c, .5), { prof: 'tip', nb: 0, a: .9 }); S.push(r); ink(S, P, .9, { a: .5, gaps: 0 });
  }
  def('quill', o => {
    const S = [], parts = {}, glass = mixc(C.night, C.clothB, .35);
    const L = lathe(S, [[0, 62], [-10, 66], [-46, 66], [-66, 56], [-76, 30], [-84, 22], [-96, 23], [-102, 27]], glass, { mouth: true, dk: .35 });
    brush(S, L.col(-.55).slice(2, -3), 6, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
    const mouth = [0, -102 + L.dy];
    const P = spline([[mouth[0] + 2, mouth[1] + 8], [26, -168], [58, -236], [86, -300], [100, -334]], false, 6);
    featherS(S, P.slice(3), 30, tok(o.color, mixc(C.paperLight, C.far, .5)), { bars: false, edge: true });
    brush(S, P.slice(0, 5), 3.2, lite(C.clothC, .3), { prof: 'even', nb: 0, a: .9 });
    Object.assign(parts, { feather: P[Math.floor(P.length * .6)], nib: mouth, pot: [-30, -40], ink: [0, mouth[1]] });
    return { S, parts };
  });

  // ================================================================ light
  def('oil_lamp', o => {
    const S = [], parts = {}, cl = clay(), cy = -40;
    tube(S, ell(-104, cy - 10, 20, 16, PI * .3, PI * 1.7, 18), 6, cl, { strokes: 1 });
    // nozzle (top face and side), then the round body over it
    const noz = [[60, cy - 22], [150, cy - 14], [158, cy + 2], [150, cy + 18], [60, cy + 26]];
    wsh(S, noz, cl, .65, 3, 1); wsh(S, [[60, cy + 4], [154, cy + 4], [150, cy + 18], [60, cy + 26]], dark(cl, .3), .4, 2, .6);
    wsh(S, ell(146, cy - 4, 12, 7, 0, TAU, 14), mixc(C.ink, cl, .3), .8, 2, .3); inkC(S, noz, 1.6, { a: .8 });
    disc(S, 0, cy - 8, 100, 34, 34, cl);
    grain(S, ell(0, cy, 96, 50, 0, TAU, 30), dark(cl, .3), 30, .22, 1.4);
    // the sunken discus with its filling hole, ribs on the shoulder
    wsh(S, ell(-4, cy - 8, 56, 18, 0, TAU, 28), dark(cl, .22), .45, 2, .4);
    wsh(S, ell(-4, cy - 4, 52, 14, PI, TAU, 16).concat(ell(-4, cy - 8, 52, 14, 0, PI, 16)), lite(cl, .25), .3, 2, .3);
    wsh(S, ell(4, cy - 6, 8, 4, 0, TAU, 12), mixc(C.ink, cl, .25), .85, 1, .2);
    inkC(S, ell(-4, cy - 8, 56, 18, 0, TAU, 28), 1.1, { a: .6 });
    for (let k = 0; k < 14; k++) { const a = PI * .05 + k / 13 * PI * .9, x = Math.cos(a) * 80, y = cy - 8 + Math.sin(a) * 27; ink(S, [[x * .8, y - 2], [x * .97, y + 2]], .9, { a: .45, gaps: 0 }); }
    Object.assign(parts, { flame: [150, cy - 40], nozzle: [150, cy + 4], body: [-50, cy + 14], handle: [-118, cy - 10], hole: [4, cy - 6] });
    seat(S, parts);
    const fx = parts.nozzle[0] - 4, fy = parts.nozzle[1] - 10;
    const live = (c, lt) => { glow(c, fx, fy - 20, 120, .9, lt, 2); WC.flame(c, fx, fy, 40 * (.9 + .1 * Math.sin(lt * 6.3)), lt, 2); };
    return { S, parts, live };
  });

  def('lantern', o => {
    const S = [], parts = {}, fm = metal(o.color || 'brass'), glass = mixc(C.gold, C.paperLight, .55), R = 70, y0 = -22, y1 = -230;
    // the warm inside, the candle seen through the glass
    wsh(S, [[-R, y0], [R, y0], [R, y1], [-R, y1]], glass, .3, 2, 1);
    lathe(S, [[y0 - 6, 14], [y0 - 70, 14]], mixc(C.paperLight, C.clothC, .3), { tilt: .2, nstrokes: 3 });
    // panes: the front one and the two foreshortened sides, catching light
    for (const [xa, xb, a] of [[-R, -R / 2, .3], [-R / 2, R / 2, .16], [R / 2, R, .34]]) {
      wsh(S, [[xa, y0], [xb, y0], [xb, y1], [xa, y1]], dark(glass, .15), a, 2, .6);
      brush(S, [[xa + (xb - xa) * .3, y1 + 10], [xa + (xb - xa) * .22, y0 - 14]], (xb - xa) * .14, C.paperLight, { prof: 'leaf', nb: 0, a: .55 });
    }
    // posts, the base, the pierced cap and its ring
    for (const x of [-R, -R / 2, R / 2, R]) tube(S, [[x, y0], [x, y1]], Math.abs(x) === R ? 4 : 5, fm, { strokes: 1 });
    disc(S, 0, y0 - 4, R + 10, 13, 16, fm);
    for (const x of [-R + 4, R - 4]) ball(S, x, -2, 7, fm, { ry: 5 });
    const cap = [[-R - 8, y1], [R + 8, y1], [R - 6, y1 - 30], [28, y1 - 62], [-28, y1 - 62], [-R + 6, y1 - 30]];
    wsh(S, cap, fm, .65, 3, .8); wsh(S, [[0, y1], [R + 8, y1], [R - 6, y1 - 30], [28, y1 - 62], [0, y1 - 62]], dark(fm, .3), .35, 2, .5);
    for (let k = 0; k < 7; k++) { const x = -48 + k * 16, y = y1 - 18 - (k % 2) * 14; wsh(S, ell(x, y, 3, 3, 0, TAU, 8), mixc(C.gold, C.paperLight, .3), .9, 1, .1); ink(S, ell(x, y, 3.4, 3.4, 0, TAU, 8), .7, { a: .6, gaps: 0 }); }
    inkC(S, cap, 1.8);
    disc(S, 0, y1 - 66, 30, 6, 8, fm);
    ball(S, 0, y1 - 80, 9, fm);
    tube(S, ell(0, y1 - 106, 18, 16, PI * .7, PI * 2.3, 20), 3.6, fm, { strokes: 1 });
    ink(S, [[-R - 4, y0], [-R - 4, y1]], 1.6, { gaps: 0, a: .7 }); ink(S, [[R + 4, y0], [R + 4, y1]], 2.2, { gaps: 0 });
    Object.assign(parts, { glow: [0, y0 - 90], cap: [-40, y1 - 30], ring: [0, y1 - 122], frame: [R, -120], base: [-60, y0] });
    const live = (c, lt) => { glow(c, 0, y0 - 92, 200, 1.1, lt, 3); WC.flame(c, 0, y0 - 74, 30 * (.9 + .1 * Math.sin(lt * 7.7)), lt, 3); };
    return { S, parts, live };
  });

  // ================================================================ tools and treasure
  def('key', o => {
    const S = [], ir = metal(o.metal || 'iron');
    tube(S, ell(-96, 0, 36, 32, 0, TAU, 40), 7, ir, { strokes: 1 });
    for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + PI / 4; tube(S, ell(-96 + Math.cos(a) * 14, Math.sin(a) * 13, 11, 10, a + PI * .6, a + PI * 1.4, 10), 3.4, ir, { strokes: 1 }); }
    ball(S, -56, 0, 9, ir, { ry: 11 });
    tube(S, [[-50, 0], [0, 0], [118, 0]], 7, ir, { strokes: 2 });
    for (const x of [-30, 80]) ball(S, x, 0, 6, ir, { ry: 9 });
    const bit = [[86, 4], [128, 4], [128, 44], [118, 44], [118, 30], [108, 30], [108, 44], [96, 44], [96, 22], [86, 22]];
    wsh(S, bit, ir, .72, 3, .5); wsh(S, bit.slice(4), dark(ir, .3), .35, 2, .3); ink(S, bit.concat([bit[0]]), 1.6, { raw: true, gaps: 0 });
    ball(S, 122, 0, 7, ir);
    const parts = { bow: [-96, -32], shank: [30, 0], bit: [112, 36] };
    seat(S, parts);
    return { S, parts };
  });

  def('chest', o => {
    const S = [], parts = {}, wood = tok(o.color, C.wood), ir = metal('iron'), w = 240, h = 108, d = 124;
    const B = box(S, -w / 2, 0, w, h, d, wood, { grain: 18 });
    // the domed lid: a half-round end on each side, its curved top running across the width
    const Hl = 62, dx = B.dx, dy = B.dy, arch = (x, u) => [x + dx * u, -h + dy * u - Hl * Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2))];
    let us = 0, ym = 1e9; for (let i = 0; i <= 40; i++) { const u = i / 40, y = arch(0, u)[1]; if (y < ym) { ym = y; us = u; } }
    const US = Array.from({ length: 17 }, (_, i) => us * i / 16), UE = Array.from({ length: 25 }, (_, i) => i / 24);
    const lidF = [[-w / 2, -h], [w / 2, -h]].concat(US.map(u => arch(w / 2, u)), US.slice().reverse().map(u => arch(-w / 2, u)));
    wsh(S, lidF, lite(wood, .1), .6, 3, 1); rows(S, lidF, shades(wood, .1), { gap: 15, a: .22, nb: 4 });
    wsh(S, lidF.filter(([, y]) => y > -h - Hl * .55).concat([[w / 2, -h]]), dark(wood, .15), .2, 2, .6);
    const endR = UE.map(u => arch(w / 2, u)).concat([[w / 2 + dx, -h + dy], [w / 2, -h]]);
    wsh(S, endR, dark(wood, .28), .62, 3, 1); rows(S, endR, dark(wood, .38), { gap: 12, a: .2, nb: 3, ang: Math.atan2(dy, dx) });
    // iron straps over box and lid, the lid's lower edge band, corner nails
    for (const x of [-w / 2 + 34, w / 2 - 34]) {
      brush(S, [[x, 0], [x, -h]], 14, ir, { prof: 'even', nb: 3, a: .8 });
      brush(S, US.map(u => arch(x, u)), 13, ir, { prof: 'even', nb: 3, a: .78 });
      for (let k = 0; k < 4; k++) ball(S, x, -14 - k * 27, 2.8, lite(ir, .2), { ink: false });
      for (const u of [us * .3, us * .7]) { const [px, py] = arch(x, u); ball(S, px, py, 2.6, lite(ir, .2), { ink: false }); }
    }
    brush(S, UE.map(u => arch(w / 2, u)), 7, ir, { prof: 'even', nb: 0, a: .7 });
    brush(S, [[-w / 2, -h], [w / 2, -h]], 10, ir, { prof: 'even', nb: 3, a: .85 });
    const lp = [[-24, -h + 6], [24, -h + 6], [24, -h + 56], [0, -h + 68], [-24, -h + 56]], brs = metal('brass');
    wsh(S, lp, brs, .8, 2, .4); wsh(S, lp.slice(1, 4).concat([[0, -h + 6]]), dark(brs, .3), .35, 1, .2); ink(S, lp.concat([lp[0]]), 1.4, { raw: true, gaps: 0 });
    wsh(S, [[-4, -h + 24], [4, -h + 24], [3, -h + 46], [-3, -h + 46]], C.ink, .85, 1, .1); ball(S, 0, -h + 24, 5, C.ink, { lift: false, ink: false });
    tube(S, ell(w / 2 + dx * .5, -h * .5 + dy * .5, 16, 10, 0, PI, 10), 3.5, ir, { strokes: 1 });
    ink(S, US.map(u => arch(-w / 2, u)).concat([arch(w / 2, us)]), 2.2); ink(S, UE.map(u => arch(w / 2, u)), 1.8);
    Object.assign(parts, { lid: [-30, -h - Hl * .6], lock: [0, -h + 40], band: [-w / 2 + 34, -50], front: [60, -40] });
    return { S, parts };
  });

  // ================================================================ vessels
  def('vase', o => {
    const S = [], parts = {}, st = o.style || 'iznik';
    const prof = spline([[0, 44], [-8, 46], [-16, 38], [-34, 58], [-84, 84], [-134, 80], [-172, 56], [-198, 32], [-216, 25], [-242, 30], [-258, 40], [-264, 41]], false, 4);
    if (st === 'iznik') {
      const wht = lite(C.paper, .35), bl = C.clothB, rd = C.red, gr = C.green;
      const L = lathe(S, prof, wht, { mouth: true, tex: 'ring', a: .4, dk: .12 });
      const band = (ya, yb, c, a = .7) => wsh(S, L.ring(ya).concat(L.ring(yb).reverse()), c, a, 2, .5);
      band(-8, -22, bl); band(-246, -262, bl); band(-196, -206, bl, .5);
      // saz leaves, tulips and carnations painted round the body (front half, foreshortened at the sides)
      const at = (v, y) => { const r = L.rAt(y); return [v * r, y + L.dy + r * L.t * Math.sqrt(Math.max(0, 1 - v * v))]; };
      for (const v of [-.62, 0, .62]) {
        const s = Math.sqrt(1 - v * v), [bx, by] = at(v, -34);
        const stem = spline([[bx, by], [bx + 8 * s, by - 50], [bx - 4 * s, by - 100], at(v + .05, -170)], false, 4);
        brush(S, stem, 3, gr, { prof: 'even', nb: 0, a: .8 });
        const [tx, ty] = stem[stem.length - 1];
        for (const k of [-1, 0, 1]) brush(S, WC.polar(tx + k * 9 * s, ty + 6, -PI / 2 + k * .32, 30, k * 3, 5), 13 * s, rd, { prof: 'leaf', nb: 0, a: .8 });
        for (const side of [-1, 1]) { const p = stem[Math.floor(stem.length * .45)]; brush(S, qcurve(p[0], p[1], p[0] + side * 46 * s, p[1] - 30, side * 14, 8), 11 * s, bl, { prof: 'leaf', nb: 0, a: .75 }); }
      }
      for (const v of [-.32, .32]) { const [x, y] = at(v, -120); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; brush(S, WC.polar(x, y, a, 11, 2, 3), 7, k % 2 ? bl : C.blue, { prof: 'leaf', nb: 0, a: .75 }); } dot(S, x, y, 3.5, rd); }
      for (let k = 0; k < 14; k++) { const v = -.85 + 1.7 * k / 13, [x, y] = at(v, -230); dot(S, x, y, 2.8, bl, .8); }
      parts.motif = at(0, -150);
      // the glaze shines
      brush(S, L.col(-.48).slice(6, -10), 7, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
      Object.assign(parts, { body: at(-.4, -100), neck: [0, -224], mouth: [0, -264 + L.dy] });
    } else if (st === 'greek') {
      const cl = clay(), blk = mixc(C.ink, cl, .12);
      const L = lathe(S, prof, cl, { mouth: true, tex: 'ring' });
      const band = (ya, yb, c, a = .82) => wsh(S, L.ring(ya).concat(L.ring(yb).reverse()), c, a, 3, .5);
      band(-4, -60, blk); band(-150, -262, blk);
      const at = (v, y) => { const r = L.rAt(y); return [v * r, y + L.dy + r * L.t * Math.sqrt(Math.max(0, 1 - v * v))]; };
      for (let k = 0; k < 11; k++) { const v = -.9 + 1.8 * k / 10, [x, y] = at(v, -76); ink(S, [[x - 6, y + 4], [x - 6, y - 6], [x + 4, y - 6], [x + 4, y], [x - 1, y]], 1.6, { raw: true, gaps: 0, col: blk }); }
      for (const v of [-.42, .38]) { const [x, y] = at(v, -96), sv = Math.sqrt(1 - v * v); for (let k = -3; k <= 3; k++) brush(S, WC.polar(x, y - 4, -PI / 2 + k * .3, 36 - Math.abs(k) * 4, k * 2, 5), 8 * sv, blk, { prof: 'leaf', nb: 0, a: .85 }); for (const sd of [-1, 1]) brush(S, ell(x + sd * 12 * sv, y + 4, 8 * sv, 6, sd > 0 ? PI : 0, sd > 0 ? PI * 2.6 : -PI * 1.6, 10), 2.2, blk, { prof: 'even', nb: 0, a: .85 }); }
      parts.motif = at(0, -110);
      Object.assign(parts, { body: at(-.5, -110), neck: [0, -224], mouth: [0, -264 + L.dy] });
    } else {
      const g = tok(o.color, C.clothB), L = lathe(S, prof, g, { mouth: true, tex: 'ring' });
      brush(S, L.col(-.48).slice(6, -10), 7, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
      Object.assign(parts, { body: [-40, -110], neck: [0, -224], mouth: [0, -264 + L.dy], motif: [0, -120] });
    }
    return { S, parts };
  });

  def('jar', o => {
    const S = [], parts = {}, cl = clay();
    const L = lathe(S, spline([[0, 52], [-10, 58], [-50, 80], [-100, 78], [-138, 58], [-154, 44], [-164, 48], [-172, 48]], false, 4), cl, { mouth: o.lid === false, tex: 'ring' });
    grain(S, L.sil, dark(cl, .3), 40, .22, 1.5);
    for (const y of [-120, -128]) brush(S, L.ring(y, -.95, .95), 2.2, dark(cl, .3), { prof: 'leaf', nb: 0, a: .45 });
    if (o.lid !== false) {
      const cloth = tok(o.color, mixc(C.paperLight, C.clothC, .35)), top = -172 + L.dy;
      const cv = spline([[-56, top + 16], [-52, top - 10], [-24, top - 24], [10, top - 26], [44, top - 16], [58, top + 10], [62, top + 36], [48, top + 30], [40, top + 46], [20, top + 26], [-10, top + 34], [-30, top + 24], [-50, top + 40], [-58, top + 30]], true, 4);
      wsh(S, cv, cloth, .7, 3, 1); rows(S, cv, shades(cloth, .1), { gap: 10, a: .25, nb: 3, ang: .3 });
      wsh(S, cv.filter(([x]) => x > 12), dark(cloth, .25), .35, 2, .6);
      for (const x of [-30, 0, 30]) ink(S, qcurve(x, top - 18, x + 6, top + 24, 6, 6), .9, { a: .45, gaps: 0 });
      brush(S, L.ring(-166, -1, 1).map(([x, y]) => [x * 1.06, y - 2]), 4, dark(C.wood, .2), { prof: 'even', nb: 0, a: .85 });
      inkC(S, cv, 1.6);
      parts.lid = [0, top - 20];
    }
    Object.assign(parts, { body: [-50, -100], mouth: [0, -172 + L.dy] });
    return { S, parts };
  });

  def('cup', o => {
    const S = [], parts = {};
    if (o.style === 'tulip') {
      disc(S, 0, -12, 92, 22, 12, lite(C.paper, .3));
      brush(S, ell(0, -12, 70, 16, 0, TAU, 30), 3, C.red, { prof: 'even', nb: 0, a: .7 });
      const gp = spline([[-14, 34], [-30, 40], [-60, 30], [-92, 26], [-130, 34], [-168, 42], [-178, 43]], false, 4);
      const tea = mixc(C.roof, C.cloth, .45);
      lathe(S, gp.filter(([y]) => y > -150).map(([y, r]) => [y, r * .9]), tea, { a: .65, tex: false, ink: false, lift: false });
      const L = lathe(S, gp, mixc(C.sky, C.paperLight, .3), { glass: true, mouth: false });
      wsh(S, ell(0, -150 + L.dy, L.rAt(-150) * .9, L.rAt(-150) * .9 * L.t, 0, TAU, 20), lite(tea, .15), .6, 2, .3);
      ink(S, ell(0, -178 + L.dy, 43, 43 * L.t, 0, TAU, 28), 1.2, { a: .6 });
      Object.assign(parts, { tea: [0, -100], glass: [-30, -150], saucer: [-70, -10] });
      return { S, parts };
    }
    const m = metal(o.metal || 'gold');
    const L = lathe(S, spline([[0, 64], [-8, 62], [-16, 30], [-40, 12], [-58, 10], [-68, 18], [-78, 11], [-98, 10], [-116, 30], [-150, 60], [-192, 72], [-204, 72]], false, 4), m, { mouth: true });
    for (const y of [-128, -186]) brush(S, L.ring(y, -.95, .95), 3, dark(m, .3), { prof: 'even', nb: 0, a: .5 });
    for (const v of [-.5, 0, .5]) { const r = L.rAt(-157), x = v * r, y = -157 + L.dy + r * L.t * Math.sqrt(1 - v * v); ball(S, x, y, 9 * Math.sqrt(1 - v * v) + 3, [C.red, C.clothB, C.green][Math.round(v * 2 + 1)], { ry: 10 }); }
    Object.assign(parts, { bowl: [-40, -160], stem: [0, -60], foot: [-50, -6], gem: [0, -150] });
    return { S, parts };
  });

  def('bread', o => {
    const S = [], parts = {}, crust = mixc(mixc(C.clothC, C.roof, .3), C.wood, .32), crumb = mixc(C.paperLight, C.clothC, .3);
    if (o.style === 'simit') {
      const R = 118, r = 38, t = .48, cy = -R * t - 12;
      const outer = ell(0, cy, R, R * t, 0, TAU, 64), inner = ell(0, cy - 4, R - 2 * r, (R - 2 * r) * t, 0, TAU, 40);
      wsh(S, outer, crust, .7, 3, 1.4);
      wsh(S, inner, C.paper, .92, 2, .5);
      for (let k = 0; k < 26; k++) {          // the twist of the two strands
        const a = k / 26 * TAU, c = [Math.cos(a) * (R - r), cy + Math.sin(a) * (R - r) * t], n = [Math.cos(a), Math.sin(a) * t], tg = [-Math.sin(a), Math.cos(a) * t];
        const P = [[c[0] - n[0] * r * .85 - tg[0] * 22, c[1] - n[1] * r * .85 - tg[1] * 22], [c[0] - n[0] * r * .2 - tg[0] * 2, c[1] - n[1] * r * .2 - tg[1] * 2], [c[0] + n[0] * r * .3 + tg[0] * 8, c[1] + n[1] * r * .3 + tg[1] * 8], [c[0] + n[0] * r * .85 + tg[0] * 22, c[1] + n[1] * r * .85 + tg[1] * 22]];
        brush(S, spline(P, false, 3), 3.4, dark(crust, .4), { prof: 'leaf', nb: 0, a: .55 });
        brush(S, spline(P, false, 3).map(([x, y]) => [x - tg[0] * 5, y - tg[1] * 5 - 2]), 5, lite(crust, .25), { prof: 'leaf', nb: 0, a: .4 });
      }
      wsh(S, ell(0, cy, R, R * t, -.3, PI * .9, 24).concat(ell(0, cy + 6, R - 10, R * t - 6, PI * .9, -.3, 24)), dark(crust, .35), .35, 2, .6);
      brush(S, ell(0, cy - 4, R - r, (R - r) * t, PI * 1.1, PI * 1.7, 12), 12, lite(crust, .3), { prof: 'leaf', nb: 3, a: .35 });
      for (let k = 0; k < 90; k++) { const a = rnd(0, TAU), rr_ = rnd(R - 2 * r + 8, R - 6), x = Math.cos(a) * rr_, y = cy + Math.sin(a) * rr_ * t; dot(S, x, y, 2.3, crumb, .85); }
      ink(S, ell(0, cy, R, R * t, -.4, PI + .3, 40), 2); inkC(S, inner, 1.2, { a: .6 });
      return { S, parts: { crust: [-80, cy + 10], sesame: [40, cy + 30] } };
    }
    const half = spline([[0, -128], [60, -120], [104, -90], [124, -50], [126, -24], [116, -6], [94, 0]], false, 6), sil = mirror(half);
    wsh(S, sil, crust, .62, 3, 1.5);
    patches(S, sil, dark(crust, .2), 4, .16, .2);
    wsh(S, half.concat(half.map(([x, y]) => [x * .35, y]).reverse()), dark(crust, .3), .35, 2, 1);
    wsh(S, sil.filter(([, y]) => y < -70), dark(crust, .2), .25, 2, 1);
    for (const [x0, x1, y] of [[-80, -10, -96], [-30, 50, -110], [20, 96, -88]]) {
      const cut = qcurve(x0, y + 14, x1, y - 6, -14, 10), lip = offset(cut, 8);
      wsh(S, cut.concat(lip.slice().reverse()), crumb, .7, 2, .6); ink(S, cut, 1.4, { a: .7 }); brush(S, lip, 3, dark(crust, .35), { prof: 'leaf', nb: 0, a: .5 });
    }
    for (let k = 0; k < 40; k++) { const x = rnd(-90, 90), y = rnd(-118, -60); if (inside(sil, x, y)) dot(S, x, y, rnd(2, 4), C.paperLight, .6); }
    ink(S, half, 2.4); ink(S, mirror(half).slice(half.length), 1.5, { a: .6 }); ink(S, [[-94, 0], [94, 0]], 1.4, { a: .6 });
    return { S, parts: { crust: [-90, -60], score: [10, -105] } };
  });

  // ================================================================ bones
  def('skull', o => {
    const S = [], parts = {}, bone = mixc(C.paperLight, C.clothC, .3), sh = mixc(C.stoneDark, C.night, .25), bd = k => mixc(bone, sh, k);
    const halfU = spline([[0, -264], [50, -257], [86, -232], [102, -194], [103, -156], [95, -128], [90, -114], [96, -100], [92, -88], [78, -80], [68, -66], [60, -50], [46, -40], [24, -36]], false, 5);
    const up = halfU.concat(halfU.slice().reverse().map(([x, y]) => [-x, y])), lh = halfU.map(([x, y]) => [-x, y]);
    const jaw = spline([[-54, -62], [-56, -34], [-46, -10], [-24, 6], [0, 10], [24, 6], [46, -10], [56, -34], [54, -62], [44, -40], [24, -30], [0, -28], [-24, -30], [-44, -40]], true, 4);
    wsh(S, jaw, bone, .6, 3, 1); wsh(S, jaw.filter(([x]) => x > 8), bd(.4), .35, 2, .5); wsh(S, jaw.filter(([, y]) => y > -8), bd(.3), .3, 2, .5);
    wsh(S, up, bone, .6, 3, 1.4);
    rows(S, up, shades(bone, .06), { gap: 22, a: .14, nb: 5, ang: .2 });
    patches(S, up, bd(.15), 3, .12, .14);
    // form: the side away from the light, in two soft steps; the temples; the hollows under the cheekbones
    wsh(S, halfU.concat(halfU.map(([x, y]) => [x * .62, y]).reverse()), bd(.45), .32, 2, 1);
    wsh(S, halfU.slice(0, -3).map(([x, y]) => [x * .62, y]).concat(halfU.slice(0, -3).map(([x, y]) => [x * .34, y]).reverse()), bd(.3), .16, 2, 1);
    for (const sd of [-1, 1]) {
      wsh(S, spline([[sd * 99, -170], [sd * 86, -158], [sd * 82, -128], [sd * 90, -112], [sd * 97, -128]], true, 3), bd(.5), sd > 0 ? .4 : .22, 2, .6);
      wsh(S, spline([[sd * 74, -78], [sd * 64, -86], [sd * 52, -70], [sd * 58, -52], [sd * 68, -62]], true, 3), bd(.5), sd > 0 ? .45 : .25, 2, .5);
    }
    brush(S, qcurve(-88, -98, -60, -92, 4, 6), 7, C.paperLight, { prof: 'leaf', nb: 0, a: .5 });
    // the orbits: dark, darkest high and inside, with the brow ridge catching the light above
    for (const sd of [-1, 1]) {
      const E = spline([[sd * 14, -152], [sd * 26, -167], [sd * 50, -170], [sd * 72, -160], [sd * 79, -138], [sd * 70, -116], [sd * 46, -108], [sd * 24, -114], [sd * 14, -130]], true, 4);
      const cx = sd * 46, cy = -140, sub = (f, dx, dy) => E.map(([x, y]) => [cx + (x - cx) * f + dx, cy + (y - cy) * f + dy]);
      wsh(S, E, bd(.62), .62, 3, .8);
      wsh(S, sub(.72, -sd * 3, -6), mixc(sh, C.ink, .45), .55, 2, .6);
      wsh(S, sub(.42, -sd * 6, -12), C.ink, .45, 2, .4);
      brush(S, qcurve(sd * 12, -176, sd * 78, -168, -sd * 6, 8), 9, C.paperLight, { prof: 'leaf', nb: 0, a: sd < 0 ? .55 : .3 });
      ink(S, E.slice(0, Math.floor(E.length * .62)), 1.7); ink(S, E.slice(Math.floor(E.length * .6)), 1, { a: .5 });
    }
    // nasal aperture, the nasal bones above it
    const nose = spline([[0, -118], [9, -106], [15, -88], [13, -74], [5, -70], [0, -76], [-5, -70], [-13, -74], [-15, -88], [-9, -106]], true, 4);
    wsh(S, nose, bd(.6), .7, 2, .4); wsh(S, nose.map(([x, y]) => [x * .6 + 2, y * .96 - 4]), C.ink, .5, 2, .3); ink(S, nose, 1.4);
    brush(S, [[-4, -134], [0, -118]], 4, bd(.35), { prof: 'leaf', nb: 0, a: .4 });
    // teeth on a curve, the upper row over the lower
    wsh(S, [[-46, -46], [46, -46], [44, -30], [-44, -30]], bd(.65), .5, 1, .4);
    for (let k = -4.5; k <= 4.5; k += 1) {
      const x = k * 9, f = Math.abs(k) / 4.5, yu = -54 + f * f * 7, hu = 14 - f * 5, yl = -33 + f * f * 4, hl = 11 - f * 4;
      wsh(S, rr(x - 4, yu, x + 4, yu + hu, 2.5, 2), lite(bone, .25), .75, 1, .2); ink(S, [[x + 4.3, yu + 1], [x + 4, yu + hu]], .8, { a: .55, gaps: 0 });
      wsh(S, rr(x - 3.8, yl, x + 3.8, yl + hl, 2.4, 2), lite(bone, .15), .7, 1, .2); ink(S, [[x + 4.1, yl], [x + 3.8, yl + hl - 1]], .8, { a: .45, gaps: 0 });
    }
    // the coronal suture over the vault, light on the dome
    const su = []; for (let i = 0; i <= 30; i++) { const x = -78 + i * 5.2; su.push([x, -238 + Math.pow(Math.abs(x) / 78, 2) * 26 + (i % 2 ? 3 : -2)]); }
    ink(S, su, .9, { a: .45, raw: true });
    brush(S, qcurve(-62, -240, -96, -160, 16, 8), 16, C.paperLight, { prof: 'leaf', nb: 3, a: .45 });
    ink(S, halfU, 2.4); ink(S, lh, 1.5, { a: .6 }); ink(S, jaw.slice(0, Math.floor(jaw.length * .62)), 1.8, { a: .8 });
    Object.assign(parts, { cranium: [-30, -232], eye: [-46, -142], nose: [0, -92], teeth: [-18, -44], jaw: [36, -4] });
    return { S, parts };
  });

  def('bone', o => {
    const S = [], bone = mixc(C.paperLight, C.clothC, .32), bd = k => mixc(bone, mixc(C.stoneDark, C.night, .25), k);
    // a femur: two rounded condyles at one end, the ball of the head on its neck at the other
    const F = spline([[-150, 16], [-162, 2], [-160, -16], [-146, -26], [-130, -20], [-114, -10], [-40, -12], [60, -14], [96, -16], [110, -28], [124, -32], [136, -40], [140, -56], [154, -68], [170, -60], [174, -44], [166, -30], [150, -26], [138, -18], [124, -4], [104, 4], [40, 2], [-60, 4], [-116, 8], [-128, 20], [-140, 26]], true, 5);
    wsh(S, F, bone, .62, 3, 1);
    patches(S, F, bd(.12), 2, .14, .3);
    brush(S, qcurve(-114, -2, 98, -4, -6, 16), 14, bd(.12), { prof: 'leaf', nb: 4, a: .3 });
    wsh(S, qcurve(-118, 8, 104, 4, -4, 16).concat(qcurve(104, -2, -118, 1, 4, 16)), bd(.4), .4, 2, .5);
    brush(S, qcurve(-108, -9, 92, -12, -6, 14), 4, C.paperLight, { prof: 'leaf', nb: 0, a: .55 });
    wsh(S, spline([[-150, 16], [-140, 26], [-128, 20], [-132, 8], [-146, 4]], true, 3), bd(.45), .45, 2, .4);
    wsh(S, spline([[-158, -10], [-146, -24], [-134, -18], [-140, -8]], true, 3), C.paperLight, .3, 1, .3);
    ink(S, [[-134, 4], [-140, -2]], 1, { a: .6, gaps: 0 });
    ball(S, 157, -46, 19, bone, { ink: false });
    wsh(S, spline([[108, -26], [122, -34], [128, -20], [114, -12]], true, 3), bd(.25), .4, 1, .3);
    ink(S, F.slice(0, Math.floor(F.length * .55)), 1.4, { a: .6 }); ink(S, F.slice(Math.floor(F.length * .55)).concat([F[0]]), 2.2);
    const parts = { head: [157, -60], shaft: [0, -4], end: [-150, 6], neck: [134, -30] };
    seat(S, parts);
    return { S, parts };
  });

  // ================================================================ guns
  function wheelS(S, cx, cy, R, wood, ir, n = 12) {
    const fel = ell(cx, cy, R - 1, R - 1, 0, TAU, 60).concat(ell(cx, cy, R - 15, R - 15, TAU, 0, 60));
    wsh(S, fel, wood, .85, 3, .6);
    for (let k = 0; k < 6; k++) brush(S, ell(cx, cy, R - 8, R - 8, k * 1.05 + .2, k * 1.05 + 1.1, 8), 6, dark(wood, .2), { prof: 'leaf', nb: 2, a: .35 });
    wsh(S, ell(cx, cy, R - 1, R - 1, -.4, PI * .85, 24).concat(ell(cx, cy, R - 15, R - 15, PI * .85, -.4, 24)), dark(wood, .35), .4, 2, .4);
    for (let k = 0; k < n; k++) { const a = k / n * TAU + .13; tube(S, [[cx + Math.cos(a) * 14, cy + Math.sin(a) * 14], [cx + Math.cos(a) * (R - 12), cy + Math.sin(a) * (R - 12)]], 4, wood, { strokes: 1, iw: 1.2 }); }
    ball(S, cx, cy, 16, dark(wood, .1)); ball(S, cx, cy, 6, ir);
    brush(S, ell(cx, cy, R, R, 0, TAU, 60), 5, ir, { prof: 'even', nb: 0, a: .9, rough: .1 });
    ink(S, ell(cx, cy, R + 2.5, R + 2.5, -.6, PI + .4, 40), 1.8); ink(S, ell(cx, cy, R - 15, R - 15, 0, TAU, 40), 1, { a: .5 });
  }
  def('cannon', o => {
    const S = [], parts = {}, m = metal(o.metal || 'bronze'), wood = C.wood, ir = metal('iron');
    if (o.style === 'bombard') {
      // a great bronze bombard in two screwed parts, on a timber bed
      box(S, -180, 0, 340, 34, 44, wood, { grain: 12 });
      box(S, -150, -34, 40, 26, 30, dark(wood, .1)); box(S, 80, -34, 40, 26, 30, dark(wood, .1));
      const cy = -104;
      tube(S, [[-190, cy + 6], [-40, cy + 2]], 40, m, { strokes: 3 });
      tube(S, [[-40, cy], [170, cy - 6]], 62, m, { strokes: 4 });
      for (const x of [-36, -18]) brush(S, [[x, cy - 62], [x, cy + 62]], 10, dark(m, .15), { prof: 'even', nb: 3, a: .55 });
      for (let k = 0; k < 8; k++) { const x = -32 + k * 4; ink(S, [[x, cy - 60], [x, cy + 60]], .6, { a: .25, gaps: 0 }); }
      for (const x of [30, 110]) { brush(S, [[x, cy - 64], [x, cy + 64]], 12, lite(m, .1), { prof: 'even', nb: 3, a: .5 }); ink(S, [[x + 6, cy - 63], [x + 6, cy + 63]], 1, { a: .5 }); }
      for (let k = 0; k < 9; k++) scribble(S, 44 + k * 7, 50 + k * 7, cy - 30 + (k % 3) * 18, { col: dark(m, .5), w: 1.2 });
      wsh(S, ell(170, cy - 6, 14, 62, 0, TAU, 30), dark(m, .2), .6, 2, .5); wsh(S, ell(172, cy - 6, 9, 46, 0, TAU, 24), mixc(C.ink, m, .2), .85, 2, .4);
      ink(S, ell(170, cy - 6, 14, 62, -PI / 2, PI / 2, 20), 1.8);
      wsh(S, ell(-190, cy + 6, 9, 40, 0, TAU, 20), dark(m, .25), .6, 2, .4);
      Object.assign(parts, { muzzle: [172, cy - 6], barrel: [60, cy - 40], breech: [-170, cy], carriage: [-60, -18] });
      seat(S, parts);
      return { S, parts };
    }
    // field gun: trail and cheek, the barrel on its trunnions, the near wheel
    const R = 74, wcx = 10, wcy = -R;
    const cheek = [[-220, 0], [-196, -4], [-20, -112], [36, -118], [44, -92], [-10, -74], [-200, 10]];
    wsh(S, cheek.map(([x, y]) => [x + 12, y - 8]), dark(wood, .3), .55, 2, 1);
    wsh(S, cheek, wood, .62, 3, 1); rows(S, cheek, shades(wood, .1), { gap: 10, a: .25, nb: 3, ang: -.52 });
    ink(S, cheek.concat([cheek[0]]), 1.8, { raw: true });
    const ang = -.08, bx = Math.cos(ang), by = Math.sin(ang), at = (s, d = 0) => [-110 * bx + s * bx - d * by + 30, -118 + (-110 * by + s * by + d * bx)];
    const B = [], Rb = []; for (let i = 0; i <= 24; i++) { const s = i / 24 * 300; B.push(at(s)); Rb.push(23 - s / 300 * 8 + (s > 285 ? 3 : 0)); }
    tube(S, B, Rb, m, { strokes: 3 });
    for (const s of [30, 92, 200, 290]) { const [x, y] = at(s), r = 23 - s / 300 * 8 + 3; brush(S, [[x + by * r, y - bx * r], [x - by * r, y + bx * r]], 8, dark(m, .12), { prof: 'even', nb: 2, a: .6 }); }
    tube(S, [at(-12), at(1)], 7, m, { strokes: 1 }); ball(S, ...at(-15), 11, m); ball(S, ...at(110, 0), 9, ir);
    wsh(S, ell(...at(300), 6, 17, 0, TAU, 16), mixc(C.ink, m, .2), .85, 2, .3);
    wheelS(S, wcx, wcy, R, wood, ir);
    Object.assign(parts, { muzzle: at(300), barrel: at(180, -18), breech: at(-10), wheel: [wcx, wcy - R + 8], carriage: [-150, -24] });
    seat(S, parts);
    return { S, parts };
  });

  def('cannonball', o => {
    const S = [], ir = metal('iron');
    if (o.pile) {
      const r = 46, pos = [[-2 * r, -r], [0, -r], [2 * r, -r], [-r, -r - r * 1.7], [r, -r - r * 1.7], [0, -r - r * 3.4]];
      for (const [x, y] of pos) { ball(S, x, y, r, ir); grain(S, ell(x, y, r * .8, r * .8, 0, TAU, 16), dark(ir, .3), 8, .3, 1.5); }
      return { S, parts: { ball: [0, -r * 4.4] } };
    }
    ball(S, 0, -70, 70, ir); grain(S, ell(0, -70, 60, 60, 0, TAU, 20), dark(ir, .3), 18, .3, 1.8);
    return { S, parts: { ball: [-30, -100] } };
  });

  def('musket', o => {
    const S = [], parts = {}, wood = tok(o.wood, C.wood), ir = metal('steel'), br = metal('brass');
    const stock = spline([[-170, -6], [-168, -62], [-150, -64], [-96, -40], [-70, -34], [60, -30], [86, -26], [86, -16], [-60, -18], [-84, -14], [-110, -2], [-150, 10]], true, 4);
    wsh(S, stock, wood, .62, 3, 1); rows(S, stock, shades(wood, .1), { gap: 8, a: .25, nb: 3, ang: -.08 });
    wsh(S, stock.filter(([, y]) => y > -26), dark(wood, .25), .35, 2, .6);
    brush(S, qcurve(-160, -54, -100, -36, -4, 8), 6, C.paperLight, { prof: 'leaf', nb: 0, a: .4 });
    inkC(S, stock, 1.8);
    wsh(S, [[-172, -62], [-164, -64], [-150, 10], [-158, 12]], br, .8, 2, .3);
    tube(S, [[-80, -38], [190, -36]], 5.5, ir, { strokes: 1 });
    tube(S, [[-40, -21], [150, -24]], 2.2, dark(wood, .2), { strokes: 1, lift: false });
    for (const x of [0, 60]) brush(S, [[x, -44], [x, -16]], 5, br, { prof: 'even', nb: 0, a: .85 });
    // the lock: plate, cock with its flint, frizzen; the trigger guard
    const lp = [[-104, -40], [-58, -38], [-58, -26], [-104, -28]];
    wsh(S, lp, ir, .75, 2, .3); inkC(S, lp, 1.2);
    tube(S, spline([[-98, -40], [-104, -52], [-96, -62], [-86, -58]], false, 4), 3, ir, { strokes: 1 });
    wsh(S, [[-90, -62], [-80, -62], [-80, -56], [-90, -56]], C.stone, .8, 1, .2);
    tube(S, [[-74, -40], [-72, -56]], 3, ir, { strokes: 1 });
    tube(S, ell(-74, -16, 16, 10, 0, PI, 12), 2.4, br, { strokes: 1 });
    brush(S, qcurve(-76, -18, -80, -8, 2, 4), 2.4, ir, { prof: 'tip', nb: 0, a: .9 });
    Object.assign(parts, { muzzle: [190, -36], barrel: [100, -40], lock: [-84, -44], stock: [-30, -24], butt: [-160, -30] });
    seat(S, parts);
    return { S, parts };
  });

  def('pistol', o => {
    const S = [], parts = {}, wood = tok(o.wood, C.wood), ir = metal('steel'), br = metal('brass');
    const body = spline([[-104, 70], [-120, 50], [-104, 10], [-60, -22], [100, -26], [104, -14], [-40, -8], [-70, 20], [-80, 60], [-90, 74]], true, 4);
    wsh(S, body, wood, .65, 3, 1); rows(S, body, shades(wood, .1), { gap: 9, a: .25, nb: 3, ang: -.6 });
    wsh(S, body.filter(([x, y]) => y > 0 || x > 40 && y > -16), dark(wood, .25), .3, 2, .5);
    inkC(S, body, 1.8);
    ball(S, -106, 66, 16, br, { ry: 13 });
    tube(S, [[-50, -24], [134, -26]], 7, ir, { strokes: 1 });
    ball(S, 136, -26, 7.5, ir, { ry: 8 });
    const lp = [[-64, -28], [-24, -26], [-26, -12], [-62, -14]];
    wsh(S, lp, ir, .75, 2, .3); inkC(S, lp, 1.2);
    tube(S, spline([[-58, -28], [-64, -40], [-56, -50], [-46, -46]], false, 4), 3, ir, { strokes: 1 });
    tube(S, [[-36, -28], [-34, -44]], 3, ir, { strokes: 1 });
    tube(S, ell(-34, -2, 18, 14, 0, PI, 12), 2.4, br, { strokes: 1 });
    brush(S, qcurve(-36, -6, -40, 6, 2, 4), 2.4, ir, { prof: 'tip', nb: 0, a: .9 });
    Object.assign(parts, { muzzle: [136, -26], barrel: [60, -32], lock: [-46, -36], grip: [-92, 40] });
    seat(S, parts);
    return { S, parts };
  });

  // ================================================================ bows, arrows, spears, flags
  def('bow', o => {
    const S = [], parts = {};
    if (o.style === 'long') {
      const P = spline([[0, -326], [30, -250], [46, -163], [30, -76], [0, 0]], false, 8);
      ink(S, [[2, -322], [2, -4]], 1.2, { gaps: 0, a: .8 });
      tube(S, P, P.map((_, i) => 3 + 5 * Math.sin(i / (P.length - 1) * PI)), mixc(C.wood, C.ground, .4), { strokes: 2 });
      tube(S, P.slice(Math.floor(P.length * .45), Math.ceil(P.length * .56)), 9, dark(C.cloth, .3), { strokes: 1 });
      Object.assign(parts, { grip: [46, -163], limb: [36, -240], tip: [0, -326], string: [2, -120] });
      return { S, parts };
    }
    // Ottoman composite bow, strung: lacquered limbs, recurved bone-tipped ears, a wrapped grip
    const lac = mixc(C.cloth, C.wood, .35), gd = metal('gold');
    const half = [[36, -150], [34, -186], [22, -226], [12, -256], [16, -276], [30, -292], [46, -302]];
    const P = spline(half.slice().reverse().concat(half.slice(1).map(([x, y]) => [x, -300 - y])), false, 6);
    const n = P.length, mid = Math.floor(n / 2);
    const knee = P.findIndex(([, y]) => y > -262), knee2 = n - 1 - knee;
    ink(S, [P[0], P[2], P[knee], [P[knee][0], -300 - P[knee][1]], P[n - 3], P[n - 1]], 1.1, { raw: true, gaps: 0, a: .85 });
    tube(S, P, P.map((_, i) => { const f = Math.abs(i - mid) / mid; return 7 - f * 3.4; }), lac, { strokes: 2 });
    for (const [a, b] of [[0, knee - 1], [knee2 + 1, n - 1]]) tube(S, P.slice(a, b + 1), 4.2, mixc(C.paperLight, C.clothC, .3), { strokes: 1 });
    for (let i = 6; i < n - 6; i += 4) if (Math.abs(i - mid) > 5) { const [x, y] = P[i]; dot(S, x - 1, y, 2.4, gd, .85); }
    tube(S, P.slice(mid - 5, mid + 6), 9.5, dark(C.clothB, .2), { strokes: 1 });
    for (let k = -4; k <= 4; k += 2) ink(S, [[P[mid + k][0] - 9, P[mid + k][1] - 3], [P[mid + k][0] + 9, P[mid + k][1] + 3]], .8, { a: .5, gaps: 0 });
    Object.assign(parts, { grip: P[mid], limb: P[Math.floor(mid * .5)], tip: P[0], string: [P[knee][0], -150] });
    seat(S, parts);
    return { S, parts };
  });

  def('arrow', o => {
    const S = [], parts = {}, f = tok(o.color, C.cloth), shaft = mixc(C.wood, C.ground, .45);
    for (const side of [-1, 1]) {
      const P = [[-150, 0], [-146, side * 18], [-100, side * 16], [-84, 0]];
      wsh(S, spline(P, false, 4), side < 0 ? f : lite(f, .4), .65, 2, .5);
      for (let x = -144; x < -88; x += 4) brush(S, [[x, 0], [x - 6, side * (x < -100 ? 15 : (x + 84) / -16 * 15)]], 1.2, dark(f, .2), { prof: 'tip', nb: 0, a: .45 });
      ink(S, spline(P, false, 4), 1, { a: .7, gaps: 0 });
    }
    tube(S, [[-158, 0], [112, 0]], 3.4, shaft, { strokes: 1 });
    wsh(S, [[-160, -4], [-152, -4], [-152, 4], [-160, 4]], dark(f, .2), .8, 1, .2);
    const head = [[108, -4], [124, -10], [158, 0], [124, 10], [108, 4]];
    wsh(S, head, metal('steel'), .75, 2, .4); wsh(S, head.slice(2), dark(metal('steel'), .3), .4, 1, .2);
    brush(S, [[112, -1], [150, 0]], 1.6, C.paperLight, { prof: 'leaf', nb: 0, a: .6 }); ink(S, head, 1.4, { raw: true, gaps: 0 });
    brush(S, [[104, -4], [104, 4]], 3, C.ink, { prof: 'even', nb: 0, a: .7 });
    Object.assign(parts, { head: [150, 0], shaft: [20, 0], fletching: [-120, -14] });
    seat(S, parts);
    return { S, parts };
  });

  def('spear', o => {
    const S = [], parts = {}, ir = metal('steel');
    tube(S, [[-160, 0], [126, 0]], 6, mixc(C.wood, C.ground, .3), { strokes: 2 });
    tube(S, [[-176, 0], [-158, 0]], [2, 5, 7], metal('iron'), { strokes: 1 });
    tube(S, [[118, 0], [152, 0]], [7.5, 6.5, 5.5], metal('iron'), { strokes: 1 });
    const head = spline([[150, 0], [168, -15], [200, -17], [244, 0], [200, 17], [168, 15]], true, 4);
    wsh(S, head, ir, .7, 3, .6); wsh(S, head.filter(([, y]) => y >= 0).concat([[244, 0]]), dark(ir, .3), .4, 2, .4);
    ink(S, [[152, 0], [236, 0]], 1, { a: .6, gaps: 0 }); brush(S, [[160, -5], [220, -4]], 2.4, C.paperLight, { prof: 'leaf', nb: 0, a: .6 });
    ink(S, head, 1.6);
    Object.assign(parts, { head: [214, -6], socket: [136, 0], shaft: [0, 0], butt: [-172, 0] });
    if (o.upright) { xform(S, -PI / 2, 0, 0, parts); seat(S, parts); return { S, parts, sh: [0, 24, 6] }; }
    seat(S, parts);
    return { S, parts };
  });

  def('flag', o => {
    const S = [], parts = {}, cl = tok(o.color, C.red), H = 330, fw = 196, fh = 128, ft = -H + 12;
    tube(S, [[0, 0], [0, -H]], 5, mixc(C.wood, C.ground, .2), { strokes: 1 });
    if (o.emblem === 'crescent') { ball(S, 0, -H - 8, 7, metal('gold')); brush(S, ell(0, -H - 32, 15, 15, PI * .25, PI * 1.75, 12), 5, metal('gold'), { prof: 'leaf', nb: 0, a: .9 }); }
    else ball(S, 0, -H - 10, 10, metal('gold'));
    for (const y of [ft + 6, ft + fh - 8]) brush(S, [[-7, y], [7, y + 3]], 3, C.ink, { prof: 'even', nb: 0, a: .7 });
    Object.assign(parts, { cloth: [fw * .55, ft + fh * .45], pole: [0, -H * .45], finial: [0, -H - 14] });
    const emb = o.emblem || 'none';
    const live = (c, lt, it) => {
      const k = revealOf(it, lt); if (k <= 0) return;
      const wave = (x, y) => { const f = x / fw; return [x - f * f * 10 * (1 + Math.sin(lt * 1.7)), y + Math.sin(f * 4.2 - lt * 3.1) * 11 * f + Math.sin(f * 7 - lt * 4.3) * 3 * f + f * f * 10]; };
      const N = 24, top = [], bot = [];
      for (let i = 0; i <= N; i++) { const x = fw * i / N; top.push(wave(x, ft)); bot.push(wave(x, ft + fh)); }
      c.save(); c.beginPath(); c.rect(-2, ft - 60, (fw + 40) * WC.eio(k), fh + 140); c.clip();
      c.beginPath(); top.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); for (let i = N; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath();
      c.fillStyle = WC.rgba(cl, .78); c.fill();
      for (let i = 0; i < N; i++) {        // folds: darker where the cloth turns away
        const sl = (top[i + 1][1] - top[i][1]) / (fw / N), a = clamp(sl * .5, -.3, .35);
        c.beginPath(); c.moveTo(top[i][0], top[i][1]); c.lineTo(top[i + 1][0], top[i + 1][1]); c.lineTo(bot[i + 1][0], bot[i + 1][1]); c.lineTo(bot[i][0], bot[i][1]); c.closePath();
        c.fillStyle = a > 0 ? WC.rgba(dark(cl, .45), a) : WC.rgba(C.paperLight, -a * .6); c.fill();
      }
      for (let r = 1; r < 6; r++) { c.beginPath(); for (let i = 0; i <= N; i++) { const p = lerpP([top[i]], [bot[i]], r / 6)[0]; i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.strokeStyle = WC.rgba(dark(cl, .2), .12); c.lineWidth = 7; c.stroke(); }
      if (emb !== 'none') {
        const ex = fw * .42, ey = ft + fh / 2, E = (px, py) => wave(ex + px, ey + py);
        c.beginPath();
        if (emb === 'crescent') {
          for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, p = E(Math.cos(a) * 32, Math.sin(a) * 32); i ? c.lineTo(...p) : c.moveTo(...p); }
          for (let i = 0; i <= 28; i++) { const a = -i / 28 * TAU, p = E(9 + Math.cos(a) * 26, Math.sin(a) * 26); i ? c.lineTo(...p) : c.moveTo(...p); }
          c.fillStyle = WC.rgba(C.paperLight, .92); c.fill('evenodd');
          c.beginPath(); for (let i = 0; i <= 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 6.5 : 16, p = E(48 + Math.cos(a) * r, Math.sin(a) * r); i ? c.lineTo(...p) : c.moveTo(...p); }
          c.fill();
        } else if (emb === 'cross') {
          for (const [x0, y0, x1, y1] of [[-60, -10, 110, 10], [-14, -64, 6, 64]]) { const q = [E(x0, y0), E(x1, y0), E(x1, y1), E(x0, y1)]; c.moveTo(...q[0]); q.slice(1).forEach(p => c.lineTo(...p)); c.closePath(); }
          c.fillStyle = WC.rgba(C.paperLight, .9); c.fill();
        }
      }
      c.beginPath(); top.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); for (let i = N; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]);
      c.strokeStyle = WC.rgba(C.ink, .55); c.lineWidth = 1.8; c.lineJoin = 'round'; c.stroke();
      c.restore();
    };
    return { S, parts, live, sh: [0, 30, 7] };
  });

  // ================================================================ instruments
  // Roman numerals painted round a dial (each upright toward the centre); k squashes y for a tilted dial
  const GLYPH = { I: [[[0, 0], [0, 1]]], V: [[[-.3, 0], [0, 1]], [[0, 1], [.3, 0]]], X: [[[-.3, 0], [.3, 1]], [[.3, 0], [-.3, 1]]] };
  const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  function numerals(S, cx, cy, R, h, c = C.ink, k = 1, w = 1.4) {
    ROMAN.forEach((txt, n) => {
      const a = -PI / 2 + n / 12 * TAU, adv = ch => ch === 'I' ? .32 : .72;
      let tw = 0; for (const ch of txt) tw += adv(ch); tw -= .12;
      let u = -tw / 2;
      for (const ch of txt) {
        const ox = u + (ch === 'I' ? .1 : .36);
        for (const seg_ of GLYPH[ch]) {
          const P = seg_.map(([gx, gy]) => { const lx = (ox + gx) * h, ly = (gy - .5) * h, ra = a + PI / 2; return [cx + Math.cos(a) * R + lx * Math.cos(ra) - ly * Math.sin(ra), cy + (Math.sin(a) * R + lx * Math.sin(ra) + ly * Math.cos(ra)) * k]; });
          const s = mk(P, w, c, { prof: 'even', nb: 0, a: .85, rough: .2 }); s.fine = true; S.push(s);
        }
        u += adv(ch);
      }
    });
  }
  function hands(S, cx, cy, R, hh, mm, k = 1, c = C.ink) {
    const at = (a, r) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r * k];
    const ha = -PI / 2 + (hh % 12 + mm / 60) / 12 * TAU, ma = -PI / 2 + mm / 60 * TAU;
    const spade = (a, L, wd) => { const P = [at(a + PI, L * .14), at(a - .09, L * .55), at(a - .2, L * .68), at(a, L * .84), at(a + .2, L * .68), at(a + .09, L * .55)]; wsh(S, P, c, .85, 2, .2); brush(S, [at(a + PI, L * .1), at(a, L)], wd, c, { prof: 'tip', nb: 0, a: .9 }); };
    spade(ha, R * .55, 2.8); spade(ma, R * .82, 2.2);
    ball(S, cx, cy, 4.5, c, { lift: false, ink: false });
  }
  def('compass', o => {
    const S = [], parts = {}, br = metal('brass'), rx = 128, ry = 98, cy = -40 - ry, k = ry / rx, card = lite(C.paper, .3);
    disc(S, 0, cy, rx, ry, 34, br);
    brush(S, ell(0, cy, rx * .94, ry * .94, 0, TAU, 60), 10, dark(br, .15), { prof: 'even', nb: 4, a: .5, rough: .08 });
    wsh(S, ell(0, cy, rx * .86, ry * .86, 0, TAU, 56), card, .75, 3, .8);
    wsh(S, ell(0, cy, rx * .86, ry * .86, PI, TAU, 28).concat(ell(0, cy + 6, rx * .82, ry * .8, 0, -PI, 28)), dark(card, .2), .3, 2, .5);
    // degree ring and the 16-point rose
    for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, r0 = i % 2 ? .8 : .76; const s = mk([[Math.cos(a) * rx * r0, cy + Math.sin(a) * rx * r0 * k], [Math.cos(a) * rx * .84, cy + Math.sin(a) * rx * .84 * k]], .9, C.ink, { prof: 'even', nb: 0, a: .6 }); s.fine = true; S.push(s); }
    ink(S, ell(0, cy, rx * .74, ry * .74, 0, TAU, 50), .9, { a: .5, gaps: 0 });
    const P = (a, r) => [Math.cos(a) * r, cy + Math.sin(a) * r * k];
    for (const [n, L, wd] of [[16, .42, .05], [8, .58, .08], [4, .72, .12]]) for (let i = 0; i < n; i++) {
      if (n === 16 && i % 2 === 0) continue; if (n === 8 && i % 2 === 0) continue;
      const a = -PI / 2 + i / n * TAU, tip = P(a, rx * L), l = P(a - PI / 2, rx * wd), r = P(a + PI / 2, rx * wd), c0 = [0, cy];
      const north = n === 4 && i === 0;
      wsh(S, [c0, l, tip], north ? C.red : n === 4 ? C.clothB : n === 8 ? dark(card, .45) : dark(card, .3), .8, 1, .2);
      wsh(S, [c0, tip, r], north ? dark(C.red, .2) : n === 4 ? lite(C.clothB, .45) : lite(card, .1), .8, 1, .2);
      ink(S, [l, tip, r], .8, { a: .6, raw: true, gaps: 0 });
    }
    // N mark, pivot, glass shine, the lid's hinge
    const nP = P(-PI / 2, rx * .66);
    brush(S, [[nP[0] - 5, nP[1] + 5], [nP[0] - 5, nP[1] - 5], [nP[0] + 5, nP[1] + 5], [nP[0] + 5, nP[1] - 5]], 1.6, C.ink, { prof: 'even', nb: 0, a: .85 });
    ball(S, 0, cy, 7, br);
    brush(S, ell(0, cy, rx * .62, ry * .62, PI * 1.1, PI * 1.45, 10), 14, C.paperLight, { prof: 'leaf', nb: 0, a: .55 });
    brush(S, ell(0, cy, rx * .5, ry * .5, PI * 1.15, PI * 1.35, 6), 5, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
    tube(S, [[-24, cy - ry - 2], [24, cy - ry - 2]], 6, br, { strokes: 1 });
    Object.assign(parts, { north: nP, needle: P(-PI / 2, rx * .45), rose: [0, cy], case: [rx * .9, cy + ry * .5], hinge: [0, cy - ry] });
    seat(S, parts);
    return { S, parts };
  });

  def('telescope', o => {
    const S = [], parts = {}, br = metal('brass'), lea = tok(o.color, mixc(C.wood, C.cloth, .3)), a = -.1, ca = Math.cos(a), sa = Math.sin(a);
    const at = x => [x * ca, -60 + x * sa];
    tube(S, [at(-196), at(-184)], 7, br, { strokes: 1 });
    tube(S, [at(-186), at(-120)], 12, br, { strokes: 1 });
    tube(S, [at(-124), at(-40)], 16, br, { strokes: 2 });
    tube(S, [at(-44), at(128)], 22, lea, { strokes: 3 });
    for (let x = -30; x < 120; x += 12) { const [px, py] = at(x); ink(S, [[px - 4, py - 20], [px + 4, py + 20]], .8, { a: .3, gaps: 0 }); }
    for (const [x, r] of [[-122, 14], [-42, 19], [-30, 24], [118, 25], [134, 26]]) { const [px, py] = at(x); tube(S, [[px - 4, py], [px + 4, py]].map(([u, v]) => [u, v]), r, br, { strokes: 1, ink: false }); ink(S, [[px + 4 * sa + r * -sa * 0, py - r], [px, py + r]], 1.1, { a: .6, gaps: 0 }); }
    const [lx, ly] = at(138);
    wsh(S, ell(lx, ly, 9, 25, 0, TAU, 24), dark(br, .2), .7, 2, .4);
    wsh(S, ell(lx + 1, ly, 6, 19, 0, TAU, 20), mixc(C.night, C.sky, .4), .85, 2, .3);
    brush(S, ell(lx + 1, ly - 4, 3, 10, PI * .9, PI * 1.4, 4), 2.4, C.paperLight, { prof: 'leaf', nb: 0, a: .8 });
    ink(S, ell(lx, ly, 9, 25, -PI / 2, PI / 2, 16), 1.6);
    Object.assign(parts, { lens: [lx, ly], eyepiece: at(-192), tube: at(40), draw: at(-80) });
    seat(S, parts);
    return { S, parts };
  });

  def('clock', o => {
    const S = [], parts = {}, br = metal('brass'), dialC = lite(C.paper, .25);
    if (o.style === 'face') {
      const R = 145, cy = -R;
      wsh(S, ell(0, cy, R, R, 0, TAU, 72), tok(o.color, C.stone), .6, 3, 1.4);
      rows(S, ell(0, cy, R * .98, R * .98, 0, TAU, 40), shades(tok(o.color, C.stone), .1), { gap: 20, a: .2, nb: 5 });
      wsh(S, ell(0, cy, R * .86, R * .86, 0, TAU, 64), dialC, .75, 3, .8);
      brush(S, ell(0, cy, R * .74, R * .74, 0, TAU, 64), R * .2, lite(C.paper, .15), { prof: 'even', nb: 4, a: .3, rough: .05 });
      for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = i % 5 ? .8 : .76; const s = mk([[Math.cos(a) * R * r0, cy + Math.sin(a) * R * r0], [Math.cos(a) * R * .84, cy + Math.sin(a) * R * .84]], i % 5 ? .9 : 1.6, C.ink, { prof: 'even', nb: 0, a: .7 }); s.fine = true; S.push(s); }
      numerals(S, 0, cy, R * .64, R * .14, C.ink, 1, 1.8);
      hands(S, 0, cy, R * .78, o.h ?? 10, o.m ?? 8);
      wsh(S, ell(0, cy, R, R, -.5, PI * .9, 30).concat(ell(R * .06, cy + R * .06, R * .9, R * .9, PI * .9, -.5, 30)), dark(C.stone, .3), .3, 2, .6);
      ink(S, ell(0, cy, R, R, -.6, PI + .2, 50), 2.6); ink(S, ell(0, cy, R * .86, R * .86, 0, TAU, 50), 1.2, { a: .6 });
      Object.assign(parts, { dial: [-R * .4, cy - R * .3], hands: [0, cy - R * .4], case: [R * .92, cy + R * .3] });
      return { S, parts };
    }
    const wood = tok(o.color, mixc(C.wood, C.ink, .15)), w = 180, h = 220, d = 90;
    const B = box(S, -w / 2, -10, w, h, d, wood, { grain: 14 });
    const top = ell(B.dx * .5, -10 - h + B.dy * .5, w / 2 - 20, 52, PI, TAU, 24);
    wsh(S, top.concat([[w / 2 - 20 + B.dx * .5, -10 - h + B.dy * .5]]), wood, .65, 3, 1); rows(S, top, shades(wood, .1), { gap: 12, a: .2, nb: 3 });
    wsh(S, top.slice(12), dark(wood, .3), .3, 2, .5);
    ink(S, top, 1.8); brush(S, ell(B.dx * .5, -10 - h + B.dy * .5 - 60, 28, 14, PI, TAU, 12), 5, br, { prof: 'even', nb: 0, a: .9 });
    for (const sx of [-1, 1]) ball(S, B.dx * .5 + sx * 28, -10 - h + B.dy * .5 - 58, 4, br, { ink: false });
    for (const x of [-w / 2 + 10, w / 2 - 10, -w / 2 + 10 + B.dx, w / 2 - 10 + B.dx]) ball(S, x, x > w / 2 ? -4 + B.dy : -4, 9, br, { ry: 7 });
    const cy = -10 - h * .55, R = 68;
    wsh(S, [[-w / 2 + 14, cy - R - 12], [w / 2 - 14, cy - R - 12], [w / 2 - 14, cy + R + 12], [-w / 2 + 14, cy + R + 12]], br, .75, 3, .6);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) for (let k = 0; k < 3; k++) brush(S, WC.polar(sx * (w / 2 - 26), cy + sy * (R + 2), PI * (sx > 0 ? (sy > 0 ? .25 : 1.75) : (sy > 0 ? .75 : 1.25)) + (k - 1) * .5, 14, 4, 4), 4, dark(br, .3), { prof: 'leaf', nb: 0, a: .7 });
    wsh(S, ell(0, cy, R, R, 0, TAU, 50), dialC, .85, 3, .6);
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; const s = mk([[Math.cos(a) * R * .86, cy + Math.sin(a) * R * .86], [Math.cos(a) * R * .93, cy + Math.sin(a) * R * .93]], i % 5 ? .7 : 1.3, C.ink, { prof: 'even', nb: 0, a: .7 }); s.fine = true; S.push(s); }
    numerals(S, 0, cy, R * .7, R * .17, C.ink, 1, 1.3);
    hands(S, 0, cy, R * .8, o.h ?? 10, o.m ?? 8);
    ink(S, ell(0, cy, R, R, 0, TAU, 40), 1.4);
    brush(S, ell(0, cy, R * .8, R * .8, PI * 1.1, PI * 1.4, 6), 8, C.paperLight, { prof: 'leaf', nb: 0, a: .5 });
    Object.assign(parts, { dial: [-R * .5, cy - R * .4], hands: [0, cy - R * .4], case: [w / 2 + 10, -80], handle: [B.dx * .5, -10 - h + B.dy * .5 - 70] });
    seat(S, parts);
    return { S, parts };
  });

  def('pocket_watch', o => {
    const S = [], parts = {}, gd = metal(o.metal || 'gold'), R = 104, cy = -R;
    if (o.chain !== false) {
      const P = spline([[0, cy - R - 52], [60, cy - R - 70], [130, cy - R - 20], [150, cy + 10], [180, -8]], false, 8);
      for (let i = 0; i < P.length - 1; i++) {
        const [x0, y0] = P[i], [x1, y1] = P[i + 1], a = Math.atan2(y1 - y0, x1 - x0), ca = Math.cos(a), sa = Math.sin(a), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        const E = ell(0, 0, 8.5, i % 2 ? 2.2 : 5.2, 0, TAU, 12).map(([x, y]) => [mx + x * ca - y * sa, my + x * sa + y * ca]);
        brush(S, E, 2.6, gd, { prof: 'even', nb: 0, a: .9 }); ink(S, E.slice(0, 7), .8, { a: .6, gaps: 0 });
      }
      parts.chain = P[20];
    }
    tube(S, ell(0, cy - R - 40, 22, 20, PI * .65, PI * 2.35, 22), 4.5, gd, { strokes: 1 });
    tube(S, [[0, cy - R + 4], [0, cy - R - 16]], 7, gd, { strokes: 1 });
    ball(S, 0, cy - R - 20, 11, gd, { ry: 9 });
    for (let k = -3; k <= 3; k++) ink(S, [[k * 3, cy - R - 28], [k * 3, cy - R - 12]], .7, { a: .5, gaps: 0 });
    wsh(S, ell(0, cy, R, R, 0, TAU, 64), gd, .65, 3, .8);
    brush(S, ell(0, cy, R * .93, R * .93, 0, TAU, 64), R * .11, dark(gd, .1), { prof: 'even', nb: 5, a: .35, rough: .06 });
    wsh(S, ell(0, cy, R * .82, R * .82, 0, TAU, 56), lite(C.paper, .45), .85, 3, .6);
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; const s = mk([[Math.cos(a) * R * .74, cy + Math.sin(a) * R * .74], [Math.cos(a) * R * .79, cy + Math.sin(a) * R * .79]], i % 5 ? .6 : 1.2, C.ink, { prof: 'even', nb: 0, a: .7 }); s.fine = true; S.push(s); }
    numerals(S, 0, cy, R * .6, R * .15, C.ink, 1, 1.2);
    inkC(S, ell(0, cy + R * .36, R * .15, R * .15, 0, TAU, 20), .8, { a: .6 });
    hands(S, 0, cy, R * .74, o.h ?? 10, o.m ?? 10);
    wsh(S, ell(0, cy, R, R, -.5, PI * .9, 30).concat(ell(R * .05, cy + R * .06, R * .92, R * .92, PI * .9, -.5, 30)), dark(gd, .35), .35, 2, .5);
    brush(S, ell(0, cy, R * .7, R * .7, PI * 1.1, PI * 1.45, 8), 10, C.paperLight, { prof: 'leaf', nb: 0, a: .45 });
    ink(S, ell(0, cy, R, R, -.6, PI + .2, 50), 2.4); ink(S, ell(0, cy, R * .82, R * .82, 0, TAU, 50), 1.1, { a: .6 });
    Object.assign(parts, { dial: [-R * .45, cy - R * .2], crown: [0, cy - R - 22], case: [R * .9, cy + R * .3], hands: [0, cy - R * .35] });
    const sx = 0, sy = cy + R * .36, sr = R * .13;
    const live = (c, lt) => { const a = -PI / 2 + Math.floor(lt) / 60 * TAU; c.strokeStyle = WC.rgba(C.ink, .85); c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + Math.cos(a) * sr, sy + Math.sin(a) * sr); c.stroke(); };
    return { S, parts, live };
  });

  def('map_scroll', o => {
    const S = [], parts = {}, pa = PARCH(), w = 300, h = 210, x0 = -w / 2, y0 = -h - 14;
    const sheet = [[x0, y0], [-x0, y0 + 6], [-x0 + 2, -10], [x0 - 2, -14]];
    wsh(S, sheet, pa, .65, 3, 1.2); grain(S, sheet, C.stain, 20, .22, 2);
    const sea = [[x0 + 10, y0 + 12], [-x0 - 10, y0 + 18], [-x0 - 8, -24], [x0 + 8, -26]];
    wsh(S, sea, lite(C.water, .35), .55, 3, 1); rows(S, sea, lite(C.water, .2), { gap: 18, a: .2, nb: 5 });
    // land: two coasts and an island, hatched offshore, mountains as little peaks
    const blob = (cx, cy_, rx, ry, n = 30) => { const ph = [rnd(0, 6), rnd(0, 6), rnd(0, 6)], out = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, kk = 1 + .22 * Math.sin(3 * a + ph[0]) + .12 * Math.sin(5 * a + ph[1]) + .06 * Math.sin(9 * a + ph[2]); out.push([cx + Math.cos(a) * rx * kk, cy_ + Math.sin(a) * ry * kk]); } return out; };
    const lands = [blob(x0 + 40, y0 + 60, 70, 56), blob(70, -56, 88, 46), blob(-6, y0 + 120, 30, 16, 20)];
    for (const L of lands) {
      for (let i = 0; i < L.length; i += 1) { const [x, y] = L[i], [x2, y2] = L[(i + 1) % L.length], nx = -(y2 - y), ny = x2 - x, nl = Math.hypot(nx, ny) || 1; ink(S, [[x - nx / nl * 3, y - ny / nl * 3], [x - nx / nl * 8, y - ny / nl * 8]], .7, { a: .35, gaps: 0 }); }
      wsh(S, L, mixc(C.ground, C.leaf, .3), .6, 3, .6); patches(S, L, mixc(C.leaf, C.ground, .3), 2, .2, .2); inkC(S, L, 1.3);
    }
    const sea_ = lands.slice(0, 2).map(L => L.reduce((a, [x, y]) => [a[0] + x / L.length, a[1] + y / L.length], [0, 0]));
    for (const [mx, my] of [[sea_[0][0] - 10, sea_[0][1] - 6], [sea_[0][0] + 14, sea_[0][1] + 4], [sea_[1][0] + 20, sea_[1][1] - 4], [sea_[1][0] - 16, sea_[1][1]]]) { ink(S, [[mx - 8, my + 5], [mx, my - 6], [mx + 8, my + 5]], 1.1, { raw: true, gaps: 0 }); brush(S, [[mx, my - 5], [mx + 6, my + 4]], 3, dark(C.ground, .3), { prof: 'leaf', nb: 0, a: .45 }); }
    // rose, rhumb lines, the dotted route
    const rc = [x0 + 64, -60];
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ink(S, [rc, [rc[0] + Math.cos(a) * 150, rc[1] + Math.sin(a) * 110]], .6, { a: .25, gaps: 0, col: i % 2 ? C.ink : C.red }); }
    for (let i = 0; i < 8; i++) { const a = -PI / 2 + i / 8 * TAU, L = i % 2 ? 12 : 26; wsh(S, [rc, [rc[0] + Math.cos(a - .25) * 6, rc[1] + Math.sin(a - .25) * 6], [rc[0] + Math.cos(a) * L, rc[1] + Math.sin(a) * L], [rc[0] + Math.cos(a + .25) * 6, rc[1] + Math.sin(a + .25) * 6]], i === 0 ? C.red : i % 2 ? C.inkSoft : C.ink, .85, 1, .1); }
    const route = qcurve(sea_[0][0] + 50, sea_[0][1] + 20, sea_[1][0] - 60, sea_[1][1] - 10, 40, 24);
    for (let i = 0; i < route.length - 1; i += 2) brush(S, [route[i], route[i + 1]], 2.2, C.red, { prof: 'even', nb: 0, a: .85 });
    const [ex, ey] = route[route.length - 1]; ink(S, [[ex - 6, ey - 6], [ex + 6, ey + 6]], 1.6, { col: C.red, gaps: 0 }); ink(S, [[ex + 6, ey - 6], [ex - 6, ey + 6]], 1.6, { col: C.red, gaps: 0 });
    scribble(S, x0 + 20, x0 + 90, y0 + 22, { col: C.ink, w: 1.3 });
    inkC(S, sheet, 1.4, { a: .7 });
    for (const x of [x0 - 4, -x0 + 4]) { tube(S, [[x, y0 - 8], [x, -6]], 14, lite(pa, .05), { strokes: 2 }); ball(S, x, y0 - 12, 7, C.wood); ball(S, x, -2, 7, C.wood); }
    Object.assign(parts, { land: sea_[0], sea: [20, y0 + 50], route: route[12], rose: rc, roll: [-x0 + 4, -110], cross: [ex, ey] });
    seat(S, parts);
    return { S, parts };
  });

  // ================================================================ ship's and church iron
  def('anchor', o => {
    const S = [], parts = {}, ir = metal('iron');
    tube(S, ell(0, -304, 24, 24, PI / 2, PI / 2 + TAU, 30), 6, ir, { strokes: 1 });
    tube(S, [[0, -282], [0, -40]], [12, 11, 10, 10, 11, 12, 14], ir, { strokes: 2 });
    const arm = s => spline([[0, -26], [s * 44, -36], [s * 84, -66], [s * 104, -108]], false, 6);
    for (const s of [-1, 1]) {
      const A = arm(s); tube(S, A, A.map((_, i) => 11 - i * .25), ir, { strokes: 1 });
      const [tx, ty] = A[A.length - 1], fl = [[tx - s * 8, ty + 30], [tx + s * 22, ty + 8], [tx + s * 6, ty - 20], [tx - s * 4, ty - 4]];
      wsh(S, fl, ir, .75, 2, .5); wsh(S, fl.slice(1, 3).concat([[tx, ty]]), dark(ir, .3), .35, 1, .3); ink(S, fl.concat([fl[0]]), 1.4, { raw: true, gaps: 0 });
    }
    ball(S, 0, -22, 16, ir);
    const stock = tok(o.stock, C.wood);
    tube(S, [[-114, -258], [114, -258]], [6, 9, 11, 11, 9, 6], stock, { strokes: 2 });
    for (const x of [-22, 22]) brush(S, [[x, -270], [x, -246]], 5, ir, { prof: 'even', nb: 0, a: .9 });
    Object.assign(parts, { ring: [0, -328], stock: [-90, -258], shank: [0, -160], fluke: [-104, -108], crown: [0, -10] });
    seat(S, parts);
    return { S, parts };
  });

  def('bell', o => {
    const S = [], parts = {}, bz = metal('bronze');
    ball(S, 0, 10, 16, dark(bz, .2));
    tube(S, [[0, -8], [0, 6]], 4, dark(bz, .2), { strokes: 1 });
    const L = lathe(S, spline([[0, 108], [-10, 104], [-24, 92], [-60, 78], [-120, 70], [-168, 64], [-198, 56], [-214, 40], [-220, 22]], false, 4), bz, { tilt: .2 });
    for (const [y, w] of [[-22, 4], [-30, 2.4], [-160, 3], [-170, 2]]) brush(S, L.ring(y, -.97, .97), w, dark(bz, .3), { prof: 'even', nb: 0, a: .6 });
    const r1 = L.ring(-180, -.7, .7); for (let i = 0; i < r1.length - 2; i += 2) scribble(S, r1[i][0], r1[i + 1][0], r1[i][1] + 4, { col: dark(bz, .5), w: 1.1, h: .7 });
    for (const s of [-1, 0, 1]) tube(S, ell(s * 22, -232, 14, 18, PI, TAU, 12), 5, bz, { strokes: 1 });
    Object.assign(parts, { crown: [0, -246], lip: [80, -14], clapper: [0, 10], band: [-40, -170], waist: [-50, -120] });
    seat(S, parts);
    return { S, parts };
  });

  // ================================================================ antiquities
  def('statue', o => {
    const S = [], parts = {}, mar = lite(tok(o.color, C.stone), .45), sh = mixc(C.far, C.stoneDark, .5), shade = k => mixc(mar, sh, k);
    // plinth and socle
    box(S, -80, 0, 160, 58, 70, shade(.15), { grain: 16 });
    lathe(S, [[-58, 48], [-66, 44], [-80, 34], [-92, 30], [-96, 36]].map(([y, r]) => [y + 0, r]), mar, { tilt: .2, nstrokes: 4 });
    // the bust: shoulders cut in a curve, a cloak over one shoulder
    const bust = spline([[-24, -234], [-32, -216], [-78, -204], [-110, -184], [-118, -160], [-96, -134], [-56, -108], [-30, -96], [0, -94], [30, -96], [56, -108], [96, -134], [118, -160], [110, -184], [78, -204], [32, -216], [24, -234]], false, 4);
    wsh(S, bust, mar, .6, 3, 1.2);
    wsh(S, bust.filter(([x]) => x > 20).concat([[30, -100]]), shade(.35), .35, 2, .8);
    for (let k = 0; k < 6; k++) { const P = qcurve(-96 + k * 26, -186 + k * 4, -40 + k * 30, -104 - k * 1, 14, 8); brush(S, P, 9, shade(.3), { prof: 'leaf', nb: 2, a: .3 }); ink(S, P, .8, { a: .3, gaps: 0 }); }
    ink(S, bust, 2);
    // neck and head in profile, turned to the left
    const hx = 0, hy = -310, H = (x, y) => [hx + x, hy + y];
    const neck = [H(-22, 60), H(-24, 84), H(-28, 96), H(28, 96), H(30, 70), H(32, 44)];
    wsh(S, neck, mar, .65, 2, .6); wsh(S, [H(10, 50), H(30, 46), H(30, 96), H(8, 96)], shade(.35), .4, 2, .4);
    const head = spline([[6, -72], [50, -50], [60, -10], [54, 18], [36, 42], [10, 48], [-22, 44], [-38, 36], [-44, 24], [-47, 19], [-46, 13], [-44, 6], [-57, -2], [-48, -22], [-46, -32], [-44, -48], [-30, -64]].map(([x, y]) => H(x, y)), true, 4);
    wsh(S, head, mar, .65, 3, 1);
    wsh(S, [H(0, -60), H(40, -50), H(58, -10), H(52, 18), H(34, 42), H(10, 46), H(16, 10)], shade(.3), .4, 2, .6);
    // features as shadow: eye under the brow, nostril, mouth, under the chin, the ear
    wsh(S, spline([H(-40, -26), H(-30, -30), H(-22, -24), H(-30, -18)], true, 3), shade(.5), .6, 2, .3);
    brush(S, [H(-40, -22), H(-30, -20), H(-24, -22)], 1.6, shade(.7), { prof: 'leaf', nb: 0, a: .7 });
    wsh(S, [H(-50, 2), H(-44, 6), H(-40, 2)], shade(.6), .55, 1, .2);
    brush(S, [H(-46, 14), H(-38, 15), H(-34, 13)], 1.8, shade(.7), { prof: 'leaf', nb: 0, a: .75 });
    wsh(S, [H(-40, 22), H(-30, 26), H(-38, 30)], shade(.45), .4, 1, .2);
    wsh(S, [H(-30, 44), H(20, 46), H(30, 56), H(-20, 58)], shade(.5), .45, 2, .4);
    const ear = spline([H(10, -14), H(20, -18), H(24, -4), H(18, 10), H(10, 6)], false, 3);
    wsh(S, ear.concat([H(12, -2)]), shade(.3), .5, 2, .3); ink(S, ear, 1.2, { a: .7 });
    // curls over the crown and the back of the head
    const hair = spline([[-30, -64], [6, -76], [50, -54], [62, -10], [56, 20], [40, 34], [22, 12], [24, -18], [4, -34], [-22, -44]].map(([x, y]) => H(x, y)), true, 4);
    wsh(S, hair, shade(.22), .45, 2, .8);
    for (let k = 0; k < 44; k++) {
      const x = rnd(hx - 30, hx + 62), y = rnd(hy - 78, hy + 36); if (!inside(hair, x, y)) continue;
      brush(S, ell(x, y, 6.5, 5.5, rnd(0, 6), rnd(0, 6) + 4.3, 8), 3, shade(rnd(.3, .55)), { prof: 'tip', nb: 0, a: .7 });
    }
    brush(S, qcurve(...H(-40, -50), ...H(-46, -24), 4, 6), 5, C.paperLight, { prof: 'leaf', nb: 0, a: .55 });
    ink(S, head.slice(Math.floor(head.length * .55)), 1.9); ink(S, head.slice(0, Math.floor(head.length * .56)), 1.3, { a: .6 });
    Object.assign(parts, { head: H(10, -50), face: H(-50, -10), hair: H(30, -50), chest: [-50, -150], plinth: [-40, -30] });
    seat(S, parts);
    return { S, parts };
  });

  def('shard', o => {
    const S = [], cl = clay(), blk = mixc(C.ink, cl, .12);
    const P = wobble([[-110, -40], [-60, -96], [10, -118], [50, -92], [96, -104], [118, -50], [84, -20], [100, 6], [20, 10], [-40, 0], [-96, -6]], 2);
    wsh(S, P.map(([x, y]) => [x + 6, y + 8]), lite(cl, .3), .7, 2, .6);
    wsh(S, P, cl, .65, 3, 1);
    // a fragment of a painted band and meander
    const bandT = qcurve(-120, -70, 120, -80, 10, 16), bandB = qcurve(-120, -40, 120, -50, 10, 16), inP = q => inside(P, q[0], q[1]);
    const band = bandT.concat(bandB.slice().reverse()).filter(inP);
    if (band.length > 4) wsh(S, band, blk, .8, 2, .4);
    for (let x = -80; x < 90; x += 18) { const y = -16 + x * -.04, m = [[x, y], [x, y - 12], [x + 12, y - 12], [x + 12, y - 4], [x + 5, y - 4]]; if (m.every(inP)) ink(S, m, 1.8, { raw: true, gaps: 0, col: blk }); }
    patches(S, P, lite(cl, .25), 2, .2, .2); grain(S, P, dark(cl, .3), 30, .25, 1.4);
    inkC(S, P, 1.8);
    return { S, parts: { band: [-10, -60], edge: [100, -2], face: [40, -90] } };
  });

  def('gold_bar', o => {
    const S = [], gd = metal('gold');
    const bar = (x, y) => {
      const w = 150, h = 34, d = 60, t = 14, dx = d * .6, dy = -d * .45;
      const F = [[x, y], [x + w, y], [x + w - t, y - h], [x + t, y - h]];
      const T = [[x + t, y - h], [x + w - t, y - h], [x + w - t + dx - t * .6, y - h + dy + t * .45], [x + t + dx - t * .6, y - h + dy + t * .45]];
      const R = [[x + w, y], [x + w + dx, y + dy], [x + w - t + dx - t * .6, y - h + dy + t * .45], [x + w - t, y - h]];
      wsh(S, F, gd, .7, 3, .5); wsh(S, T, lite(gd, .3), .65, 3, .5); wsh(S, R, dark(gd, .3), .7, 3, .5);
      brush(S, [[x + t + 10, y - h + 4], [x + w - t - 10, y - h + 4]], 3, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
      const c = T.reduce((a, [u, v]) => [a[0] + u / 4, a[1] + v / 4], [0, 0]);
      wsh(S, [[c[0] - 28, c[1] - 6], [c[0] + 28, c[1] - 6], [c[0] + 28, c[1] + 6], [c[0] - 28, c[1] + 6]], dark(gd, .2), .5, 1, .2);
      scribble(S, c[0] - 22, c[0] + 22, c[1] + 2, { col: dark(gd, .5), w: 1, h: .5 });
      ink(S, F.concat([R[1], R[2], T[3], T[0]]), 1.6, { raw: true }); ink(S, [F[2], T[2]], 1, { a: .5, raw: true, gaps: 0 }); ink(S, [F[1], F[2]], 1, { a: .5, raw: true, gaps: 0 });
      return c;
    };
    if (o.stack) { for (const [x, y] of [[-200, 0], [-40, 0], [120, 0], [-120, -34], [40, -34], [-40, -68]]) bar(x, y); const parts = { top: [40, -110], stamp: [40, -110] }; seat(S, parts); return { S, parts }; }
    const c = bar(-75, 0);
    return { S, parts: { top: c, stamp: c } };
  });

  def('gem', o => {
    const S = [], g = tok(o.color, C.red), gw = 92, tw = 50, ch = 36, ph = 96, y0 = -ph;
    const girdle = [[-gw, y0], [gw, y0]], table = [[-tw, y0 - ch], [tw, y0 - ch]], cul = [0, 0];
    const facet = (P, k) => wsh(S, P, k > 0 ? lite(g, k) : dark(g, -k), .82, 1, .2);
    facet([[-tw, y0 - ch], [tw, y0 - ch], [tw * .6, y0 - ch + 8], [-tw * .6, y0 - ch + 8]], .45);
    const cr = [[-gw, y0], [-tw - 14, y0 - ch * .55], [-tw, y0 - ch], [-tw * .3, y0 - ch * .3], [0, y0 - ch], [tw * .3, y0 - ch * .3], [tw, y0 - ch], [tw + 14, y0 - ch * .55], [gw, y0]];
    for (let i = 0; i < cr.length - 1; i++) facet([cr[i], cr[i + 1], [cr[i][0] * .5 + cr[i + 1][0] * .5, y0]], [.3, -.1, .5, .1, -.2, .35, -.3, .1][i]);
    const pav = [-gw, -gw * .55, -gw * .15, gw * .25, gw * .62, gw];
    for (let i = 0; i < pav.length - 1; i++) facet([[pav[i], y0], [pav[i + 1], y0], cul], [-.1, .25, -.35, .05, -.45][i]);
    for (const x of [-gw * .35, gw * .05, gw * .45]) ink(S, [[x, y0], cul], .7, { a: .4, gaps: 0 });
    brush(S, [[-tw * .7, y0 - ch + 3], [tw * .2, y0 - ch + 3]], 3, C.paperLight, { prof: 'leaf', nb: 0, a: .85 });
    ink(S, [[-gw, y0], [-tw, y0 - ch], [tw, y0 - ch], [gw, y0], cul, [-gw, y0]], 1.8, { raw: true });
    ink(S, [[-gw, y0], [gw, y0]], 1, { a: .6, gaps: 0 });
    const live = (c, lt) => {
      for (const [x, y, ph_] of [[-tw * .5, y0 - ch + 4, 0], [gw * .4, y0 - 10, 2.1], [-gw * .2, y0 + 30, 4]]) {
        const k = Math.pow(Math.max(0, Math.sin(lt * 1.3 + ph_)), 6); if (k < .02) continue;
        c.strokeStyle = WC.rgba(C.paperLight, .9 * k); c.lineWidth = 2; c.lineCap = 'round'; const r = 12 * k + 4;
        c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke();
      }
    };
    return { S, parts: { table: [0, y0 - ch], facet: [gw * .4, y0 - 30], girdle: [gw, y0], culet: cul }, live, sh: [0, 50, 8] };
  });

  def('medal', o => {
    const S = [], m = metal(o.metal || 'gold'), cl = tok(o.color, C.red), R = 78, cy = -R;
    const rib = [[-36, -330], [36, -330], [36, -204], [0, -186], [-36, -204]];
    wsh(S, rib, cl, .75, 3, .6);
    for (const x of [-20, -12, 12, 20]) brush(S, [[x, -328], [x, -196 + Math.abs(x) * .4]], 5, Math.abs(x) > 15 ? C.paperLight : metal('gold'), { prof: 'even', nb: 0, a: .8 });
    wsh(S, [[0, -330], [36, -330], [36, -204], [0, -186]], dark(cl, .3), .3, 2, .4);
    ink(S, rib.concat([rib[0]]), 1.4, { raw: true });
    tube(S, [[-40, -334], [40, -334]], 6, m, { strokes: 1 });
    tube(S, ell(0, -176, 12, 12, 0, TAU, 18), 3.5, m, { strokes: 1 });
    wsh(S, ell(0, cy, R, R, 0, TAU, 56), m, .65, 3, .6);
    brush(S, ell(0, cy, R * .92, R * .92, 0, TAU, 56), R * .12, dark(m, .12), { prof: 'even', nb: 4, a: .35, rough: .06 });
    if (o.motif === 'cross') { for (const [x0, y0, x1, y1] of [[-8, -50, 8, 50], [-50, -8, 50, 8]]) { const P = [[x0, cy + y0], [x1, cy + y0], [x1, cy + y1], [x0, cy + y1]]; wsh(S, P.map(([x, y]) => [x + 2, y + 3]), dark(m, .45), .45, 1, .2); wsh(S, P, lite(m, .25), .7, 2, .2); } }
    else { const pts = []; for (let k = 0; k < 10; k++) { const a = -PI / 2 + k * PI / 5, r = k % 2 ? R * .26 : R * .62; pts.push([Math.cos(a) * r, cy + Math.sin(a) * r]); } wsh(S, pts.map(([x, y]) => [x + 2.5, y + 3]), dark(m, .45), .45, 2, .3); wsh(S, pts, lite(m, .25), .7, 2, .3); for (let k = 0; k < 10; k += 2) wsh(S, [[0, cy], pts[k], pts[(k + 1) % 10]], dark(m, .2), .4, 1, .1); inkC(S, pts, 1, { a: .6 }); }
    wsh(S, ell(0, cy, R, R, -.5, PI * .9, 24).concat(ell(R * .06, cy + R * .06, R * .9, R * .9, PI * .9, -.5, 24)), dark(m, .35), .35, 2, .4);
    brush(S, ell(0, cy, R * .82, R * .82, PI * 1.1, PI * 1.45, 8), 6, C.paperLight, { prof: 'leaf', nb: 0, a: .6 });
    ink(S, ell(0, cy, R, R, -.6, PI + .2, 40), 2.2); ink(S, ell(0, cy, R, R, PI + .2, TAU - .6, 20), 1.2, { a: .5 });
    return { S, parts: { disc: [-R * .4, cy - R * .3], ribbon: [0, -280], star: [0, cy] } };
  });

  // ================================================================ cargo and craft
  def('rope', o => {
    const S = [], hemp = mixc(C.clothC, C.ground, .4), rx = 112, ry = 34, R = 9;
    const twist = P => { const N = normals(P); for (let i = 1; i < P.length - 1; i += 1) { const [x, y] = P[i], [nx, ny] = N[i], d = [P[i + 1][0] - x, P[i + 1][1] - y], dl = Math.hypot(...d) || 1; brush(S, [[x - nx * R * .8 - d[0] / dl * 3, y - ny * R * .8 - d[1] / dl * 3], [x + nx * R * .8 + d[0] / dl * 3, y + ny * R * .8 + d[1] / dl * 3]], 1.6, dark(hemp, .35), { prof: 'leaf', nb: 0, a: .45 }); } };
    for (let k = 0; k < 5; k++) { const y = -R - k * 15, P = ell(0, y - ry, rx - k * 3, ry - k, 0, TAU, 44); tube(S, P, R, hemp, { strokes: 1 }); if (k > 2) twist(P.slice(0, 23)); }
    twist(ell(0, -R - ry, rx, ry, 0, PI, 22));
    const end = spline([[rx - 6, -R - ry], [rx + 30, -20], [rx + 70, -10], [rx + 110, -12]], false, 8);
    tube(S, end, R, hemp, { strokes: 1 }); twist(end);
    const [fx, fy] = end[end.length - 1]; for (let k = 0; k < 7; k++) brush(S, WC.polar(fx, fy, rnd(-.5, .5), rnd(10, 18), rnd(-3, 3), 4), 1.8, hemp, { prof: 'tip', nb: 0, a: .8 });
    return { S, parts: { coil: [-60, -60], end: [fx, fy] } };
  });

  def('barrel', o => {
    const S = [], wood = tok(o.color, mixc(C.wood, C.ground, .25)), ir = metal('iron');
    const L = lathe(S, spline([[0, 70], [-46, 84], [-100, 90], [-154, 84], [-200, 70]], false, 6), wood, { tilt: .24, nstrokes: 6 });
    for (let k = -4; k <= 4; k++) ink(S, L.col(k / 4.6), .9, { a: .4, gaps: 0 });
    const yt = -200 + L.dy, rt = 70;
    wsh(S, ell(0, yt, rt, rt * .24, 0, TAU, 40), lite(wood, .15), .7, 2, .4);
    for (let k = -3; k <= 3; k++) { const x = k * 20, hh = Math.sqrt(Math.max(0, rt * rt - x * x)) * .24; ink(S, [[x, yt - hh], [x, yt + hh]], .7, { a: .4, gaps: 0 }); }
    for (const [y, w] of [[-16, 9], [-36, 7], [-164, 7], [-186, 9]]) { brush(S, L.ring(y, -1, 1), w, ir, { prof: 'even', nb: 3, a: .8 }); ink(S, L.ring(y, -1, 1).map(([x, y_]) => [x, y_ + w / 2]), .9, { a: .5, gaps: 0 }); }
    inkC(S, ell(0, yt, rt, rt * .24, 0, TAU, 40), 1.6);
    return { S, parts: { hoop: [-60, -36], stave: [20, -110], lid: [0, yt] } };
  });

  def('wheel', o => {
    const S = [], R = 146;
    wheelS(S, 0, -R, R, tok(o.color, C.wood), metal('iron'), o.spokes || 12);
    return { S, parts: { hub: [0, -R], spoke: [R * .5 * Math.cos(-1), -R + R * .5 * Math.sin(-1)], rim: [-R * .95, -R * .7] }, sh: [0, R * .6, 12] };
  });

  def('crate', o => {
    const S = [], wood = tok(o.color, mixc(C.wood, C.ground, .45)), w = 200, h = 160, d = 120;
    const B = box(S, -w / 2, 0, w, h, d, wood, { grain: 26 });
    for (let k = 1; k < 4; k++) { ink(S, [[-w / 2, -k * h / 4], [w / 2, -k * h / 4]], .9, { a: .5 }); ink(S, [[w / 2, -k * h / 4], [w / 2 + B.dx, -k * h / 4 + B.dy]], .8, { a: .45 }); }
    const dkw = dark(wood, .2);
    for (const x of [-w / 2, w / 2 - 18]) { wsh(S, [[x, 0], [x + 18, 0], [x + 18, -h], [x, -h]], dkw, .6, 2, .4); ink(S, [[x + 18, 0], [x + 18, -h]], 1, { a: .6, gaps: 0 }); }
    wsh(S, [[-w / 2 + 18, -4], [-w / 2 + 34, -4], [w / 2 - 18, -h + 14], [w / 2 - 34, -h + 4]], dkw, .6, 2, .4);
    ink(S, [[-w / 2 + 18, -4], [w / 2 - 34, -h + 4]], .9, { a: .5, gaps: 0 }); ink(S, [[-w / 2 + 34, -4], [w / 2 - 18, -h + 14]], .9, { a: .5, gaps: 0 });
    for (const [x, y] of [[-w / 2 + 9, -10], [-w / 2 + 9, -h + 10], [w / 2 - 9, -10], [w / 2 - 9, -h + 10], [-w / 2 + 9, -h / 2], [w / 2 - 9, -h / 2]]) dot(S, x, y, 2.2, C.ink, .8);
    scribble(S, -40, 30, -h * .38, { col: dark(wood, .5), w: 2.4, h: 1.6 });
    return { S, parts: { lid: [20, -h - 20], plank: [0, -h * .62], brace: [0, -h * .5] } };
  });

  def('bottle', o => {
    const S = [], st = o.style || 'wine', g = tok(o.color, st === 'flask' ? mixc(C.sky, C.paperLight, .2) : mixc(C.leafDark, C.night, .25));
    const prof = st === 'onion' ? spline([[0, 66], [-8, 76], [-40, 76], [-74, 52], [-96, 20], [-150, 14], [-176, 16], [-182, 18]], false, 4)
      : st === 'flask' ? spline([[0, 34], [-10, 66], [-60, 80], [-110, 60], [-140, 22], [-160, 16], [-220, 15], [-228, 18]], false, 4)
        : spline([[0, 44], [-8, 46], [-140, 46], [-176, 36], [-200, 16], [-250, 13], [-262, 16], [-270, 16]], false, 4);
    const top = prof[prof.length - 1][0];
    // the liquid inside, then the glass over it
    const liq = mixc(C.cloth, C.night, .3), lvl = st === 'flask' ? -70 : -120;
    if (st !== 'flask' || o.full !== false) lathe(S, prof.filter(([y]) => y > lvl).map(([y, r]) => [y, r * .9]), st === 'flask' ? mixc(C.clothC, C.gold, .3) : liq, { a: .55, tex: false, ink: false, lift: false });
    const L = lathe(S, prof, g, { glass: true, a: st === 'flask' ? .16 : .4 });
    if (st === 'wine') { const lb = [[-38, -60], [38, -60], [38, -118], [-38, -118]].map(([x, y]) => [x, y + L.dy]); wsh(S, lb, PARCH(), .85, 2, .6); scribble(S, -26, 26, -92 + L.dy, { col: C.ink }); scribble(S, -18, 18, -76 + L.dy, { col: C.inkSoft }); ink(S, lb.concat([lb[0]]), 1.1, { raw: true, a: .7 }); }
    tube(S, [[0, top + L.dy + 2], [0, top + L.dy - 22]], 12, mixc(C.wood, C.ground, .5), { strokes: 1 });
    return { S, parts: { neck: [0, top + 40], cork: [0, top + L.dy - 14], body: [-30, -60], liquid: [0, lvl + 30] } };
  });

  // ================================================================ food and nature
  def('apple', o => {
    const S = [], c = tok(o.color, C.red), half = spline([[0, -150], [26, -160], [66, -152], [92, -118], [98, -70], [84, -26], [52, -4], [20, 0], [0, 0]], false, 5), sil = mirror(half);
    wsh(S, sil, c, .62, 3, 1.2);
    wsh(S, WC.blobPts(-38, -96, 42, 36, 22, .3), mixc(C.gold, C.leaf, .3), .3, 2, 2);
    for (let k = 0; k < 12; k++) { const x = -70 + k * 13, P = qcurve(x * .3, -150, x, -8, -x * .4, 8); brush(S, P, 3, dark(c, .2), { prof: 'leaf', nb: 0, a: .3 }); }
    wsh(S, half.concat(half.map(([x, y]) => [x * .3, y]).reverse()), dark(c, .35), .4, 2, .8);
    brush(S, qcurve(-62, -120, -44, -132, -3, 5), 9, C.paperLight, { prof: 'leaf', nb: 0, a: .6 });
    wsh(S, ell(0, -150, 16, 6, 0, TAU, 12), dark(c, .45), .5, 1, .3);
    brush(S, qcurve(0, -150, 8, -184, 6, 5), 4.5, C.wood, { prof: 'tip', nb: 0, a: .95 });
    const lf = spline([[8, -176], [34, -194], [64, -188], [36, -172]], true, 4);
    wsh(S, lf, C.leaf, .75, 2, .4); ink(S, [[10, -176], [56, -186]], .9, { a: .6, gaps: 0 }); ink(S, lf, 1.1, { a: .7 });
    ink(S, half, 2.2); ink(S, mirror(half).slice(half.length), 1.4, { a: .6 });
    return { S, parts: { stem: [6, -180], leaf: [44, -184], skin: [-40, -80] } };
  });

  def('egg', o => {
    const S = [], c = tok(o.color, mixc(C.paperLight, C.clothC, .35));
    const half = spline([[0, -232], [40, -214], [70, -160], [80, -96], [70, -40], [40, -6], [0, 0]], false, 6), sil = mirror(half);
    wsh(S, sil, c, .62, 3, 1);
    wsh(S, half.concat(half.map(([x, y]) => [x * .2, y]).reverse()), dark(c, .25), .35, 2, .8);
    wsh(S, half.slice(10).concat(half.slice(10).map(([x, y]) => [x * .6, y]).reverse()), dark(c, .4), .25, 2, .6);
    wsh(S, ell(-30, -150, 18, 26, 0, TAU, 16), C.paperLight, .55, 2, .5);
    if (o.speckled !== false) for (let k = 0; k < 40; k++) { const x = rnd(-70, 70), y = rnd(-220, -10); if (inside(sil, x, y)) dot(S, x, y, rnd(1.5, 4), mixc(C.wood, C.ink, .2), .6); }
    ink(S, half, 2.2); ink(S, mirror(half).slice(half.length), 1.3, { a: .55 });
    return { S, parts: { shell: [-40, -120], top: [0, -232] } };
  });

  def('feather', o => {
    const S = [], c = tok(o.color, mixc(C.stoneDark, C.wood, .35));
    const P = spline([[-150, 0], [-60, -18], [40, -44], [150, -96]], false, 8);
    featherS(S, P.slice(3), 34, c, { bars: true });
    brush(S, P.slice(0, 5), 3.4, lite(c, .5), { prof: 'even', nb: 0, a: .9 });
    for (let k = 0; k < 12; k++) { const [x, y] = P[3 + (k % 3)]; brush(S, WC.polar(x, y, rnd(-2.6, -.6) + (k % 2 ? PI : 0), rnd(14, 26), rnd(-6, 6), 5), 2, lite(c, .35), { prof: 'tip', nb: 0, a: .5 }); }
    const parts = { quill: [-130, -4], vane: [40, -44], tip: [150, -96] };
    seat(S, parts);
    return { S, parts };
  });

  def('mask', o => {
    const S = [], parts = {};
    if (o.style === 'theatre') {
      const ivory = mixc(C.paperLight, C.clothC, .25), sh = mixc(C.stoneDark, C.night, .3);
      const half = spline([[0, -300], [52, -292], [86, -258], [96, -200], [90, -140], [74, -82], [50, -36], [20, -6], [0, 0]], false, 5), sil = mirror(half);
      wsh(S, sil, ivory, .65, 3, 1);
      for (let k = 0; k < 14; k++) { const a = PI * (1.1 + k / 13 * .8), x = Math.cos(a) * 86, y = -238 + Math.sin(a) * 66; brush(S, ell(x, y, 12, 10, rnd(0, 6), rnd(0, 6) + 4.5, 8), 5, mixc(C.wood, C.ink, .2), { prof: 'tip', nb: 0, a: .75 }); }
      wsh(S, half.concat(half.map(([x, y]) => [x * .4, y]).reverse()), mixc(ivory, sh, .35), .35, 2, .8);
      for (const s of [-1, 1]) {
        const E = spline([[s * 18, -186], [s * 36, -200], [s * 62, -194], [s * 58, -176], [s * 34, -172]], true, 3);
        wsh(S, E, C.ink, .85, 2, .3);
        brush(S, qcurve(s * 14, -206, s * 70, -214, s * 14, 8), 4, mixc(C.wood, C.ink, .3), { prof: 'leaf', nb: 0, a: .85 });
        wsh(S, [[s * 22, -168], [s * 60, -172], [s * 52, -150], [s * 26, -154]], mixc(ivory, sh, .4), .3, 1, .4);
      }
      wsh(S, [[0, -196], [10, -132], [0, -124], [-10, -132]], mixc(ivory, sh, .4), .4, 1, .3);
      const mouth = spline([[-34, -78], [-18, -98], [0, -100], [18, -98], [34, -78], [16, -64], [0, -60], [-16, -64]], true, 3);
      wsh(S, mouth, C.ink, .88, 2, .3); ink(S, mouth, 1.2);
      ink(S, half, 2.2); ink(S, mirror(half).slice(half.length), 1.4, { a: .6 });
      Object.assign(parts, { eye: [-40, -186], mouth: [0, -80], brow: [40, -212] });
      return { S, parts };
    }
    // the gold funerary mask: hammered sheet gold, closed eyes, beard and moustache incised
    const gd = metal('gold'), half = spline([[0, -258], [52, -256], [86, -244], [98, -214], [98, -188], [114, -182], [118, -152], [104, -130], [96, -110], [84, -70], [60, -32], [28, -6], [0, 0]], false, 5), sil = mirror(half);
    wsh(S, sil, gd, .68, 3, 1.4);
    for (let i = 3; i < sil.length - 3; i += 6) { const [x, y] = sil[i], k = .9; dot(S, x * k, -129 + (y + 129) * .94, 1.6, dark(gd, .5), .7); }
    patches(S, sil, dark(gd, .15), 4, .1, .12); patches(S, sil, lite(gd, .3), 3, .14, .1);
    wsh(S, half.concat(half.map(([x, y]) => [x * .35, y]).reverse()), dark(gd, .35), .35, 2, .8);
    for (const s of [-1, 1]) {
      brush(S, qcurve(s * 14, -196, s * 76, -194, s * 10, 10), 3, dark(gd, .5), { prof: 'leaf', nb: 0, a: .8 });
      for (let k = 0; k < 8; k++) ink(S, [[s * (18 + k * 7), -196 + Math.abs(k - 3.5) * .8], [s * (18 + k * 7), -202 + Math.abs(k - 3.5) * .8]], .8, { a: .6, gaps: 0 });
      const lid = qcurve(s * 18, -166, s * 70, -168, s * -8, 10); wsh(S, lid.concat(qcurve(s * 70, -168, s * 18, -166, s * -14, 10)), dark(gd, .25), .5, 2, .3); ink(S, lid, 1.4);
      wsh(S, [[s * 100, -182], [s * 112, -176], [s * 112, -140], [s * 100, -130]], dark(gd, .3), .4, 1, .3);
    }
    wsh(S, [[-4, -186], [4, -186], [10, -118], [-10, -118]], dark(gd, .25), .4, 1, .3); ink(S, [[6, -184], [12, -120], [0, -114]], 1.3);
    for (const s of [-1, 1]) brush(S, qcurve(s * 4, -102, s * 50, -94, s * -10, 8), 6, dark(gd, .35), { prof: 'tip', nb: 2, a: .7 });
    ink(S, qcurve(-26, -84, 26, -84, 4, 8), 1.6);
    for (let k = -6; k <= 6; k++) ink(S, [[k * 8, -70 + Math.abs(k) * 2], [k * 7.4, -26 + Math.abs(k) * 3.4]], .9, { a: .5, gaps: 0 });
    brush(S, qcurve(-60, -250, -88, -170, 12, 8), 10, C.paperLight, { prof: 'leaf', nb: 2, a: .5 });
    ink(S, half, 2.4); ink(S, mirror(half).slice(half.length), 1.5, { a: .6 });
    Object.assign(parts, { eye: [-44, -168], mouth: [0, -84], brow: [44, -196], beard: [0, -40], ear: [-106, -156] });
    return { S, parts };
  });

  def('ring', o => {
    const S = [], gd = metal(o.metal || 'gold'), g = tok(o.color, C.red), rx = 78, ry = 94, cy = -ry - 10;
    tube(S, ell(0, cy, rx, ry, PI * 1.5, PI * 3.5, 64), 11, gd, { strokes: 2 });
    brush(S, ell(6, cy + 2, rx - 9, ry - 9, PI * .1, PI * .9, 20), 5, dark(gd, .35), { prof: 'leaf', nb: 0, a: .4 });
    lathe(S, [[cy - ry + 8, 30], [cy - ry - 4, 34], [cy - ry - 18, 34]], gd, { tilt: .3, nstrokes: 3 });
    ball(S, 0, cy - ry - 30, 24, g, { ry: 20, dk: .45 });
    for (const a of [0, PI / 2, PI, PI * 1.5]) { const x = Math.cos(a + .4) * 26, y = cy - ry - 26 + Math.sin(a + .4) * 10; ball(S, x, y, 4, gd, { ink: false }); }
    return { S, parts: { band: [rx, cy + 20], gem: [0, cy - ry - 34] }, sh: [0, 70, 10] };
  });
})();
