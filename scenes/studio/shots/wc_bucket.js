// wc_bucket — the War of the Bucket, Modena vs Bologna 1325 (Stickstory ag-01, 2026-11-24): the oak bucket (la
// Secchia rapita), a medieval stone well, an arched stone niche, and two shots (the bucket hanging in its niche,
// a bucket hauled up out of a well).
// Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9). Deterministic, colours only from WC.C tokens.
//
// Objects (WC.G; origin = base centre on the ground, y up negative, sc 1 = natural size):
//   bucket  a plain wooden pail ≈ 250 px with its handle: tapered oak staves, three iron hoops, two lugs and an iron
//           bail. o: {color: wood token, bail: false, chain: px (a chain of links rising from the bail)}
//           parts: mouth hoop stave handle bottom lug hook (the top of the chain, or the bail)
//   well    a medieval stone well head ≈ 330 px: a round parapet of dressed blocks, two timber posts, a roller with a
//           crank and a rope going down into the dark mouth. o: {col: stone token, rope: false}
//           parts: mouth rim (mouth's front edge, x = its half width) roller post stone
//   niche   an arched stone niche in a wall ≈ 460 px: voussoirs, jamb stones, a sill, a dark recess, an iron hook.
//           o: {col: stone token}   parts: hook sill recess arch
//
// Shots:
//   wc_bucket_relic  a stone wall indoors, an arched niche, the bucket hanging in it on its chain, swinging very
//       slowly; two candles on the sill (live). params: {wall, floor, horizon, s (× size), x (0..1), at (bucket paint:
//       s | cue | -1 = already painted, default -1), niche_at (-1), chain (px, 70), swing (degrees, 2),
//       candles: true|false, notes: [{text, x, y, ax?, ay?, at, color, size, align}]}
//   wc_bucket_well   a wc_scene (sky, land, items as in wc_scene) with a stone well at well.x; on lift.at (s | cue,
//       default cue "bucket") a bucket is hauled up on its rope out of the dark mouth and sways on it.
//       params: wc_scene params + {well: {x, s, dy, at}, lift: {at, dur}, bucket_s (× of the well, .42),
//       notes: [... drawn over the well]}
'use strict';

(() => {
  const C = WC.C, { rnd, mk, qcurve, along, washShape, mixc, clamp, seg, ss, eio } = WC;
  const PI = Math.PI, TAU = PI * 2;

  // ------------------------------------------------------------ small painting kit (own copy, same recipes)
  const lite = (c, k = .4) => mixc(c, C.paperLight, k);
  const dark = (c, k = .35) => mixc(c, mixc(C.ink, C.night, .3), k);
  const tok = (v, fb) => (v ? WC.col(v) : fb);
  const iron = () => mixc(C.stoneDark, C.ink, .3);
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
  const inside = (P, x, y) => { let r = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-9) + xi) r = !r; } return r; };
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
  function pool(S, P, c, w = 3, a = .24) { const L = polyLen(P); if (L < 10) return; S.push(mk(along(P, Math.max(6, Math.min(60, Math.round(L / 9)))), w, c, { prof: 'even', nb: 0, a, rough: .55 })); }
  function patches(S, P, c, n = 3, a = .12, rk = .2) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const R = Math.min(x1 - x0, y1 - y0) * rk;
    for (let k = 0, tries = 0; k < n && tries < 40; tries++) {
      const x = rnd(x0, x1), y = rnd(y0, y1); if (!inside(P, x, y)) continue;
      const B = WC.blobPts(x, y, R * rnd(.6, 1.2), R * rnd(.4, .8), 18, .25); if (!B.every(([u, v]) => inside(P, u, v))) continue;
      k++; wsh(S, B, c, a, 2, R * .04);
    }
  }
  const dot = (S, x, y, r, c = C.ink, a = .85) => { const s = mk([[x - r * .5, y], [x, y - r * .1], [x + r * .5, y]], r * 1.8, c, { prof: 'leaf', nb: 0, a, rough: .2 }); s.fine = true; S.push(s); return s; };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  function xform(S, a, dx, dy, parts) {
    const c = Math.cos(a), s = Math.sin(a), R = ([x, y]) => [x * c - y * s + dx, x * s + y * c + dy];
    for (const q of S) {
      if (q.poly) { q.poly = q.poly.map(r => r.map(R)); q.pts = q.pts.map(R); continue; }
      q.pts = q.pts.map(R);
      if (a) { const nx = q.nx.map((v, i) => v * c - q.ny[i] * s), ny = q.nx.map((v, i) => v * s + q.ny[i] * c); q.nx = nx; q.ny = ny; }
    }
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
      if (lift) xform(S, 0, 0, lift, r.parts);
      let pre = [];
      if (o.shadow !== false && r.sh !== false && S.length) {
        const b = WC.bbox(S, 0), w = b[2] - b[0], sc_ = mixc(C.stoneDark, C.night, .3);
        const [cx, rx, ry] = r.sh || [(b[0] + b[2]) / 2 + w * .05, w * .5, Math.max(5, Math.min(16, w * .055))];
        pre = [washShape(WC.blobPts(cx, -1, rx * 1.1, ry * 1.5, 30, .1), sc_, .12, 3, 3), washShape(WC.blobPts(cx + rx * .05, -1, rx * .8, ry * .7, 26, .08), sc_, .2, 3, 2)];
      }
      const all = pre.concat(S);
      scaleList(all, sc);
      const sp = p => p && [p[0] * sc, p[1] * sc];
      const out = { S: all, parts: {} };
      if (r.parts) for (const k in r.parts) out.parts[k] = sp(r.parts[k]);
      return out;
    };
  }
  // a turned form seen a little from above (prof: [[y, r], ...] from the base up): wash, form strokes, shade, ink
  function lathe(S, prof, base, o = {}) {
    const t = o.tilt ?? .2, rb = prof[0][1], dy = -rb * t;
    const P = prof.map(([y, r]) => [y + dy, r]), n = P.length, Rm = Math.max(...P.map(p => p[1]));
    const col = v => P.map(([y, r]) => [v * r, y + r * t * Math.sqrt(Math.max(0, 1 - v * v))]);
    const band = (v0, v1) => col(v0).concat(col(v1).reverse());
    const rAt = y => { const yy = y + dy; if (yy >= P[0][0]) return P[0][1]; for (let i = 1; i < n; i++) if (yy >= P[i][0]) { const f = (yy - P[i - 1][0]) / ((P[i][0] - P[i - 1][0]) || 1); return P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f; } return P[n - 1][1]; };
    const arc = (y, r, v0, v1, back = false, k = 18) => { const out = []; for (let i = 0; i <= k; i++) { const v = v0 + (v1 - v0) * i / k; out.push([v * r, y + (back ? -1 : 1) * r * t * Math.sqrt(Math.max(0, 1 - v * v))]); } return out; };
    const ring = (y, v0 = -1, v1 = 1, back = false) => arc(y + dy, rAt(y), v0, v1, back);
    const yb = P[0][0], yt = P[n - 1][0], rt = P[n - 1][1];
    const sil = col(-1).reverse().concat(arc(yb, rb, -1, 1), col(1), arc(yt, rt, 1, -1, true));
    wsh(S, sil, base, o.a ?? .5, 3, 1.4);
    patches(S, sil, dark(base, .12), 3, .12);
    for (let k = 0, nk = o.nstrokes ?? 7; k < nk; k++) {
      const v = -.85 + 1.7 * (k + rnd(.2, .8)) / nk;
      S.push(mk(col(v), Rm * rnd(.2, .3), mixc(base, v > 0 ? C.ink : C.paperLight, Math.abs(v) * .3), { prof: 'leaf', nb: 5, a: .24, rough: .2 }));
    }
    pool(S, col(.96), dark(base, .22), Math.max(2, Rm * .05), .24);
    wsh(S, band(.15, 1), dark(base, .28), .4, 2, .6);
    wsh(S, band(.55, .9), dark(base, .45), .28, 2, .5);
    S.push(mk(col(-.55), Rm * .14, C.paperLight, { prof: 'leaf', nb: 2, a: .4 }));
    ink(S, col(1), 2.4); ink(S, col(-1), 1.5, { a: .55 }); ink(S, arc(yb, rb, -.9, .95), 1.9, { a: .7, gaps: 0 });
    if (o.mouth) {
      wsh(S, ell(0, yt, rt, rt * t, 0, TAU, 32), dark(base, .6), .75, 2, .4);
      wsh(S, ell(0, yt + rt * t * .25, rt * .8, rt * t * .55, 0, PI, 14).concat(ell(0, yt, rt * .8, rt * t * .2, PI, 0, 10)), dark(base, .75), .5, 2, .3);
      ink(S, arc(yt, rt, -1, 1), 2, { a: .8, gaps: 0 }); ink(S, arc(yt, rt, 1, -1, true), 1.3, { a: .55 });
    }
    return { col, band, ring, rAt, sil, yt, yb, rt, rb, dy, t, Rm };
  }

  // ================================================================ bucket
  def('bucket', o => {
    const S = [], wood = tok(o.color, mixc(C.wood, C.clothC, .32)), ir = iron();
    const Hb = 150, rb = 56, rt = 74;
    const L = lathe(S, [[0, rb], [-Hb * .5, (rb + rt) / 2], [-Hb, rt]], wood, { tilt: .22, nstrokes: 7, mouth: true });
    const yt = L.yt;
    // staves: thin joints running up the body, a darker one here and there
    for (let k = -5; k <= 5; k++) { const P = L.col(k / 5.6); ink(S, P.slice(0, -1), .9, { a: k % 2 ? .32 : .45, gaps: 0, col: dark(wood, .5) }); }
    // iron hoops with nail heads
    for (const [y, w] of [[-14, 9], [-76, 8], [-136, 9]]) {
      const R = L.ring(y, -1, 1);
      brush(S, R, w, ir, { prof: 'even', nb: 3, a: .82 });
      ink(S, R.map(([x, yy]) => [x, yy + w * .55]), .9, { a: .5, gaps: 0 });
      brush(S, L.ring(y, -.85, -.25).map(([x, yy]) => [x, yy - w * .2]), w * .3, C.paperLight, { prof: 'leaf', nb: 0, a: .35 });
      for (const v of [-.6, 0, .6]) { const r = L.rAt(y); dot(S, v * r, y + L.dy + r * L.t * Math.sqrt(1 - v * v), 2, C.ink, .75); }
    }
    // two lugs (taller staves) carrying the bail
    for (const sd of [-1, 1]) {
      const x0 = sd * rt - (sd > 0 ? 18 : 0), lug = rect(x0, yt + 8, x0 + 18, yt - 26);
      wsh(S, lug, sd > 0 ? dark(wood, .25) : wood, .7, 2, .5);
      inkC(S, lug, 1.4, { a: .7 });
      dot(S, x0 + 9, yt - 16, 3.2, ir, .9);
    }
    const parts = { mouth: [0, yt], hoop: [rt * .9, -136 + L.dy], stave: [-18, -90], bottom: [0, -8], lug: [rt - 9, yt - 16] };
    let topY = yt - 16;
    if (o.bail !== false) {
      const B = spline([[-rt + 9, yt - 16], [-rt * .72, yt - 74], [0, yt - 100], [rt * .72, yt - 74], [rt - 9, yt - 16]], false, 6);
      brush(S, B, 6, ir, { prof: 'even', nb: 2, a: .88 });
      ink(S, B, 1.5, { a: .7, gaps: 0 });
      parts.handle = [0, yt - 100]; topY = yt - 100;
    }
    if (o.chain) {
      const n = Math.max(2, Math.round(o.chain / 17));
      for (let i = 0; i < n; i++) {
        const cy = topY - 9 - i * 17;
        if (i % 2 === 0) { const E = ell(0, cy, 7, 11, 0, TAU, 18); wsh(S, E, ir, .35, 2, .3); inkC(S, E, 2.2, { a: .85, gaps: 0 }); }
        else { brush(S, [[0, cy - 11], [0, cy + 11]], 5, ir, { prof: 'even', nb: 0, a: .85 }); ink(S, [[1.5, cy - 11], [1.5, cy + 11]], 1.2, { a: .6, gaps: 0 }); }
      }
      topY = topY - 9 - (n - 1) * 17 - 11;
    }
    parts.hook = [0, topY];
    return { S, parts };
  });

  // ================================================================ well
  def('well', o => {
    const S = [], st = tok(o.col, C.stone), wood = mixc(C.wood, C.ground, .2), R = 118, Hh = 96;
    const L = lathe(S, [[0, R], [-Hh * .5, R], [-Hh, R]], st, { tilt: .3, nstrokes: 6, mouth: true });
    const yt = L.yt, at = (v, y) => [v * R, y + L.dy + R * L.t * Math.sqrt(Math.max(0, 1 - v * v))];
    // dressed blocks: two bed joints and staggered head joints, a shadow under the coping
    for (const y of [-34, -66]) ink(S, L.ring(y, -1, 1), 1.1, { a: .45, gaps: 0 });
    [[0, -34, [-.75, -.25, .3, .8]], [-34, -66, [-.95, -.5, 0, .55, .92]], [-66, -Hh, [-.72, -.2, .35, .82]]].forEach(([y0, y1, vs]) => {
      for (const v of vs) ink(S, [at(v, y0 - 2), at(v, y1 + 2)], 1, { a: .42, gaps: 0 });
    });
    for (let k = 0; k < 16; k++) { const v0 = rnd(-.95, .5), y = rnd(-Hh + 10, -6); brush(S, L.ring(y, v0, Math.min(.98, v0 + rnd(.2, .5))), rnd(6, 12), mixc(st, k % 3 ? C.stoneDark : C.paperLight, rnd(.15, .35)), { prof: 'leaf', nb: 7, a: .22 }); }
    for (let k = 0; k < 10; k++) { const v = rnd(-.9, .9), y = rnd(-Hh + 8, -8); wsh(S, WC.blobPts(v * R * .95, y + L.dy + R * L.t * Math.sqrt(1 - v * v) * .9, rnd(8, 18), rnd(4, 8), 12, .3), mixc(C.leaf, st, .5), rnd(.12, .22), 2, 1); }
    brush(S, L.ring(-Hh + 6, -1, 1), 12, lite(st, .2), { prof: 'even', nb: 3, a: .45 });
    brush(S, L.ring(-Hh + 14, -.2, 1), 6, dark(st, .3), { prof: 'leaf', nb: 2, a: .3 });
    // posts and the roller with its crank
    const rollY = yt - 205;
    for (const sd of [-1, 1]) {
      const x = sd * (R - 10), post = rect(x - 9, yt + 6, x + 9, rollY - 22);
      wsh(S, post, sd > 0 ? dark(wood, .2) : wood, .65, 3, .6);
      brush(S, [[x - 3, yt], [x - 3, rollY - 16]], 4, lite(wood, .3), { prof: 'leaf', nb: 2, a: .3 });
      for (let k = 0; k < 3; k++) brush(S, [[x + rnd(-5, 5), yt - rnd(0, 30)], [x + rnd(-5, 5), rollY - rnd(10, 60)]], rnd(3, 6), dark(wood, .3), { prof: 'leaf', nb: 6, a: .22 });
      ink(S, [[x + 9, yt + 6], [x + 9, rollY - 22]], 1.6, { a: .75 }); ink(S, [[x - 9, yt + 6], [x - 9, rollY - 22]], 1.1, { a: .5 });
    }
    const roll = rect(-R + 2, rollY - 11, R - 2, rollY + 11);
    wsh(S, roll, lite(wood, .15), .7, 3, .5);
    wsh(S, rect(-R + 2, rollY + 2, R - 2, rollY + 11), dark(wood, .3), .45, 2, .4);
    inkC(S, roll, 1.4, { a: .7 });
    for (let k = -3; k <= 3; k++) ink(S, [[k * 9 - 5, rollY - 11], [k * 9 + 5, rollY + 11]], 1.2, { a: .55, gaps: 0, col: dark(wood, .5) });
    const cx = R + 12, crank = [[R - 6, rollY], [cx, rollY], [cx, rollY + 34], [cx + 20, rollY + 34]];
    brush(S, crank, 5, iron(), { prof: 'even', nb: 0, a: .85 }); ink(S, crank, 1.2, { a: .6, gaps: 0 });
    if (o.rope !== false) { brush(S, [[0, rollY + 11], [0, yt]], 3.5, mixc(C.clothC, C.wood, .4), { prof: 'even', nb: 0, a: .85 }); ink(S, [[1.5, rollY + 11], [1.5, yt]], .9, { a: .5, gaps: 0 }); }
    return { S, parts: { mouth: [0, yt], rim: [R, yt + R * L.t], roller: [0, rollY], post: [R - 10, rollY + 60], stone: [-R * .5, -40] } };
  });

  // ================================================================ niche
  def('niche', o => {
    const S = [], st = tok(o.col, mixc(C.stone, C.ground, .2)), w = 300, h = 460, r = w / 2, th = 30, sill = 30;
    const ri = r - th, spring = -h + r;                       // inner radius, where the arch springs
    const recess = [[-ri, -sill], [ri, -sill]].concat(ell(0, spring, ri, ri, 0, -PI, 24).slice(0).map(p => p)).concat([[-ri, -sill]]);
    const deep = mixc(C.stoneDark, C.night, .35);
    wsh(S, recess, deep, .55, 3, 1);
    patches(S, recess, dark(deep, .15), 4, .14, .22);
    wsh(S, [[-ri, -sill], [-ri + 70, -sill], [-ri + 40, spring + 40]].concat(ell(0, spring, ri, ri, -PI * .62, -PI, 8)), dark(deep, .25), .3, 3, 3);
    wsh(S, [[-ri, -sill], [ri, -sill], [ri, -sill - 40], [-ri, -sill - 40]], lite(deep, .25), .25, 2, .6);
    // voussoirs around the arch
    const nV = 9;
    for (let i = 0; i < nV; i++) {
      const a0 = -PI + i * PI / nV + .02, a1 = -PI + (i + 1) * PI / nV - .02;
      const V = ell(0, spring, ri, ri, a0, a1, 4).concat(ell(0, spring, r, r, a1, a0, 4));
      wsh(S, V, i % 2 ? st : lite(st, .15), .55, 2, .6); inkC(S, V, 1.2, { a: .55 });
    }
    // jamb stones
    for (const sd of [-1, 1]) for (let k = 0, y = -sill; y > spring + 4; k++) {
      const hh = Math.min(k % 2 ? 62 : 78, y - spring), J = rect(sd * ri, y, sd * r, y - hh);
      wsh(S, J, k % 2 ? lite(st, .12) : st, .5, 2, .6); inkC(S, J, 1.1, { a: .5 }); y -= hh;
    }
    // sill slab
    const SL = rect(-r - 20, 0, r + 20, -sill);
    wsh(S, SL, lite(st, .2), .6, 3, .6); wsh(S, rect(-r - 20, 0, r + 20, -9), dark(st, .25), .4, 2, .4); inkC(S, SL, 1.6, { a: .7 });
    // the iron hook at the crown
    const hy = spring - ri + 10;
    brush(S, [[0, hy - 10], [0, hy + 14], [6, hy + 22], [12, hy + 14]], 4.5, iron(), { prof: 'even', nb: 0, a: .9 });
    return { S, parts: { hook: [0, hy + 22], sill: [0, -sill], recess: [ri * .6, -h * .45], arch: [0, spring - r] }, sh: false };
  });

  // ================================================================ shots
  // a soldier's forearm reaching in from the right, the hand closed round a vertical rope at the origin (baked once)
  function armSprite(sc, seed) {
    return WC.withSeed(seed, () => {
      const S = [], cl = mixc(C.clothB, C.ink, .1), sk = C.skin;
      const sleeve = [[22, -20], [120, -34], [240, -22], [300, 0], [300, 64], [230, 72], [120, 48], [20, 22]];
      wsh(S, sleeve, cl, .62, 3, 2.4); patches(S, sleeve, dark(cl, .2), 4, .16, .25);
      for (let k = 0; k < 6; k++) brush(S, qcurve(40 + k * 35, rnd(-18, -6), 70 + k * 35, rnd(30, 50), rnd(-8, 8), 6), rnd(5, 9), dark(cl, .3), { prof: 'leaf', nb: 5, a: .25 });
      wsh(S, sleeve.slice(4).concat([[20, 22], [120, 48]]).slice(0, 4).concat([[300, 30]]), dark(cl, .3), .3, 2, 2);
      ink(S, sleeve.slice(0, 4), 2, { a: .7 }); ink(S, sleeve.slice(4), 1.6, { a: .6 });
      const cuff = [[14, -24], [36, -26], [40, 26], [16, 28]];
      wsh(S, cuff, lite(cl, .2), .6, 2, 1); ink(S, cuff.concat([cuff[0]]), 1.4, { a: .6 });
      const hand = WC.blobPts(-2, 2, 26, 22, 22, .18);
      wsh(S, hand, sk, .62, 3, 1.4); wsh(S, WC.blobPts(6, 10, 18, 12, 16, .2), dark(sk, .22), .35, 2, 1);
      for (let k = 0; k < 4; k++) { const y = -14 + k * 9; brush(S, qcurve(14, y, -20, y + 3, -5, 8), 8.5, mixc(sk, C.ink, .05), { prof: 'leaf', nb: 2, a: .5 }); ink(S, qcurve(14, y + 4, -20, y + 7, -5, 8), 1.1, { a: .55, gaps: 0 }); }
      brush(S, qcurve(12, -16, -14, -22, -6, 6), 9, sk, { prof: 'leaf', nb: 2, a: .55 });
      ink(S, hand.slice(0, Math.floor(hand.length * .6)), 1.6, { a: .6 });
      scaleList(S, sc);
      const g = { S }; g.spr = WC.sprite(S); return g;
    });
  }
  // a solid paper underlay in the shape of an object's sprite (the washes are translucent: the niche must not show
  // through the bucket); alpha thresholded and grown by 2 px, baked once per object
  const SOLID = new WeakMap();
  function solidOf(g) {
    if (SOLID.has(g)) return SOLID.get(g);
    const sp = g.spr, w = sp.cv.width, h = sp.cv.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const src = sp.cv.getContext('2d').getImageData(0, 0, w, h).data;
    let cur = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) cur[i] = src[i * 4 + 3] > 150 ? 1 : 0;
    for (let pass = 0; pass < 3; pass++) {               // erode: the underlay stays inside the painted edge
      const nx = new Uint8Array(w * h);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        nx[i] = cur[i] && cur[i - 1] && cur[i + 1] && cur[i - w] && cur[i + w] ? 1 : 0;
      }
      cur = nx;
    }
    const c = cv.getContext('2d'), img = c.createImageData(w, h), rgb = WC.rgba(C.paper, 1).match(/\d+/g).map(Number);
    for (let i = 0; i < w * h; i++) if (cur[i]) { img.data[i * 4] = rgb[0]; img.data[i * 4 + 1] = rgb[1]; img.data[i * 4 + 2] = rgb[2]; img.data[i * 4 + 3] = 255; }
    c.putImageData(img, 0, 0);
    const out = { cv, x0: sp.x0, y0: sp.y0 };
    SOLID.set(g, out);
    return out;
  }
  function drawSolid(X, g, x, y, a, rot = 0) {
    if (a <= 0) return;
    const b = solidOf(g);
    X.save(); X.translate(x, y); if (rot) X.rotate(rot); X.globalAlpha = clamp(a); X.drawImage(b.cv, b.x0, b.y0); X.restore();
  }
  const notes = (X, W, H, lt, cues, list, portrait) => {
    for (const n of list || []) {
      const t0 = WC.timeOf(n.at, cues, 1.2), size = n.size || (portrait ? 52 : 44), col = n.color === 'red' ? C.red : C.ink;
      if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size, col, align: n.align });
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size, align: n.align || 'center', col });
    }
  };

  SHOTS.wc_bucket_relic = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const gy = H * (P.horizon ?? (portrait ? .66 : .8));
      const back = WC.withSeed(seed * 31 + 5, () => WC.backdrop(W, H, gy, { land: 'interior', sky: 'none', wall: P.wall || 'stone', floor: P.floor }));
      const k = P.s ?? 1, ns = Math.round((portrait ? 2.0 : 1.35) * k * 100) / 100;
      const niche = WC.make('niche', ns, { shadow: false }, seed + 3);
      const nx = W * (P.x ?? .5), ny = portrait ? Math.min(gy - 20, H * .6) : gy - 20;
      const hook = [nx + niche.parts.hook[0], ny + niche.parts.hook[1]];
      const bucket = WC.make('bucket', Math.round(ns * .9 * 100) / 100, { shadow: false, chain: P.chain ?? 70 }, seed + 5);
      const Lh = -bucket.parts.hook[1];
      const sillY = ny + niche.parts.sill[1], half = 150 * ns - 30 * ns;
      const candles = P.candles === false ? [] : [-1, 1].map((sd, i) => ({ obj: WC.make('candle', Math.round(ns * .38 * 100) / 100, { holder: true }, seed + 7 + i), x: nx + sd * half * .72, y: sillY }));
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          const na = P.niche_at ?? -1, np = na === -1 ? 1 : seg(lt, WC.timeOf(na, cues, 0), WC.timeOf(na, cues, 0) + 1.2);
          WC.drawObj(X, niche, nx, ny, np);
          for (const c of candles) {
            WC.drawObj(X, c.obj, c.x, c.y, np);
            if (c.obj.live && np >= 1) { X.save(); X.translate(c.x, c.y); c.obj.live(X, lt, c); X.restore(); }
          }
          const ba = P.at ?? -1, t0 = ba === -1 ? -9 : WC.timeOf(ba, cues, .3), bp = ba === -1 ? 1 : seg(lt, t0, t0 + 1.4);
          const amp = (P.swing ?? 2) * PI / 180, rot = amp * Math.sin(lt * 1.05 + .6);
          X.save(); X.translate(hook[0], hook[1]); X.rotate(rot);
          drawSolid(X, bucket, 0, Lh, ss(seg(bp, .45, .85)));
          WC.drawObj(X, bucket, 0, Lh, bp);
          X.restore();
          notes(X, W, H, lt, cues, P.notes, portrait);
        },
      };
    },
  };

  SHOTS.wc_bucket_well = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W;
      const s = WC.scene(Object.assign({}, ctx, { P: Object.assign({}, P, { notes: [] }) })), X = s.X;
      const zoom = P.scale ?? (portrait ? 1.45 : 1), Wp = P.well || {};
      const wsc = Math.round((Wp.s ?? 1) * zoom * 100) / 100;
      const well = WC.make('well', wsc, { rope: false }, seed + 11);
      const wx = (Wp.x ?? .5) * W, wy = s.gy + (Wp.dy ?? 0);
      const bucket = WC.make('bucket', Math.round(wsc * (P.bucket_s ?? .42) * 100) / 100, { shadow: false }, seed + 12);
      const hb = -bucket.parts.handle[1];
      const mY = wy + well.parts.mouth[1], rimY = wy + well.parts.rim[1], rx = well.parts.rim[0], ry = Math.max(4, rimY - mY);
      const rollY = wy + well.parts.roller[1] + 11 * wsc;
      const ropeC = mixc(C.clothC, C.wood, .4);
      const arm = P.hand ? armSprite(Math.round(wsc * .62 * 100) / 100, seed * 17 + 3) : null;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          s.update(lt, dur, cues);
          const wa = Wp.at ?? -1, wt = WC.timeOf(wa, cues, 0), wp = wa === -1 ? 1 : seg(lt, wt, wt + 1.3);
          drawSolid(X, well, wx, wy, ss(seg(wp, .4, .8)));
          WC.drawObj(X, well, wx, wy, wp);
          const La = P.lift || {}, t0 = WC.timeOf(La.at ?? 'bucket', cues, 1), d = La.dur ?? 1.6;
          const f = eio(seg(lt, t0, t0 + d));
          const by = WC.mix(mY + hb + 2 * ry + 20 * wsc, mY - 16 * wsc, f);
          const rot = .05 * Math.sin((lt - t0) * 1.4) * ss(seg(lt, t0 + d * .6, t0 + d + .6));
          if (wp >= 1) {
            X.save();
            X.beginPath(); X.rect(0, 0, W, mY); X.ellipse(wx, mY, rx * .97, ry * .95, 0, 0, TAU); X.clip();
            const topX = wx + Math.sin(rot) * hb, topY = by - Math.cos(rot) * hb;
            X.lineCap = 'round';
            X.strokeStyle = WC.rgba(ropeC, .9); X.lineWidth = 3.4 * Math.pow(wsc, .7);
            X.beginPath(); X.moveTo(wx, rollY); X.lineTo(topX, topY); X.stroke();
            X.strokeStyle = WC.rgba(C.ink, .45); X.lineWidth = 1.1;
            X.beginPath(); X.moveTo(wx + 1.5, rollY); X.lineTo(topX + 1.5, topY); X.stroke();
            drawSolid(X, bucket, wx, by, 1, rot);
            WC.drawObj(X, bucket, wx, by, 1, { rot });
            X.restore();
            if (arm) {                                    // the hand on the rope, pulling down a little as it rises
              const hy = Math.min(WC.mix(rollY, mY, .3) + 26 * wsc * Math.sin(PI * f), by - hb - 34 * wsc);
              X.save(); X.globalAlpha = ss(seg(lt, t0 - .9, t0 - .2)); X.drawImage(arm.spr.cv, wx + arm.spr.x0, hy + arm.spr.y0); X.restore();
            }
          }
          notes(X, W, H, lt, cues, P.notes, portrait);
        },
      };
    },
  };
})();
