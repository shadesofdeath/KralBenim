// wc_stethoscope — René Laennec's paper stethoscope, Paris 1816 (Stickstory ag-01, 2026-11-26): a rolled paper tube
// (and his turned wooden cylinder), a long timber beam the children played with, a modern stethoscope draped as if
// round a neck; and three shots: the ward (the young woman in bed, the doctor tapping or listening through the tube),
// the beam with a pin scratching one end and a child's ear on the other, and two hands rolling a sheet into a tube.
// Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9). Deterministic, colours only from WC.C tokens, sprites baked once.
//
// Objects (WC.G; origin = base centre on the ground, y up negative, sc 1 = natural size):
//   paper_tube   a rolled paper tube lying on its side ≈ 440 × 70 px: the spiral of sheets at the near (left) end, the
//                free edge of the outer sheet, faint ruled lines and handwriting. o: {wood: true (Laennec's turned wooden
//                cylinder)}  parts: left, right, center, top
//   timber_beam  a long squared timber on two stone blocks ≈ 760 × 120 px.  parts: left, right, top, center
//   stethoscope  a modern stethoscope ≈ 340 × 520 px draped as if round a neck.  parts: chest, ears, top, yoke
//   steth_pair   the paper tube lying beside today's stethoscope (one specimen plate).  parts: tube, tube_end, chest, top, ears
//
// Shots (all take notes: [{text, x, y, ax?, ay?, at, color: "red", size, align}]; built for the 1080 × 1920 Short):
//   wc_steth_ward    medium shot in the ward by day: an arched window, the young woman lying on her back in a
//       high-collared dress (profile, eyes closed), a blanket over her legs; the doctor behind the bed.
//       params: {mode: "rest" (no doctor: the paper tube lies across her chest) | "tap" (he taps her chest twice with
//       two fingers, small grey rings; then draws his hand back) | "listen" (he bends, his ear at the top of the tube
//       standing on her chest, his hand holding it), beat_at (s | cue: a red wet bloom beats under the cloth, and in
//       "listen" red pulses run up the tube; default 0 for rest, none otherwise), at (rest: tube paint start),
//       taps: [s, s], withdraw (s | cue)}
//   wc_steth_beam    close on a long beam in a courtyard: at the far (left) end a hand scratches the wood with a pin; at
//       the near end a child kneels, bent over, cheek and ear on the wood; red arcs run through the beam to the ear.
//       params: {waves_at (s | cue), sky}
//   wc_steth_roll    from above on a writing desk (inkwell and quill, the desk's front edge): a sheet with faint
//       handwriting rolls up from its left edge into a tight tube held by two hands in coat sleeves.
//       params: {at (s | cue, .3), dur (2.2)}
'use strict';

(() => {
  const C = WC.C, { rnd, mk, along, washShape, mixc, clamp, seg, ss, eio, eo } = WC;
  const PI = Math.PI, TAU = PI * 2;

  // ------------------------------------------------------------ painting kit (same recipes as wc_transfusion.js)
  const lite = (c, k = .4) => mixc(c, C.paperLight, k);
  const dark = (c, k = .35) => mixc(c, mixc(C.ink, C.night, .3), k);
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
  function pool(S, P, c, w = 3, a = .24) { const L = polyLen(P); if (L < 10) return; S.push(mk(along(P, Math.max(6, Math.min(60, Math.round(L / 9)))), w, c, { prof: 'even', nb: 0, a, rough: .55 })); }
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
  // a stroke list baked to a sprite (for things drawn by the shots, not WC.G objects)
  const bake = (seed, fn) => WC.withSeed(seed, () => { const S = []; fn(S); return { S, spr: WC.sprite(S) }; });
  const blit = (X, g, x, y, o = {}) => {
    X.save(); X.translate(x, y); if (o.rot) X.rotate(o.rot); if (o.s) X.scale(o.s, o.s); X.globalAlpha = o.a ?? 1;
    X.drawImage(g.spr.cv, g.spr.x0, g.spr.y0); X.restore();
  };
  const paperC = () => mixc(C.paperLight, C.stone, .12);
  const paperS = () => mixc(C.stone, C.paperDark, .4);
  const metal = () => mixc(C.stone, C.clothB, .35);
  const tubing = () => mixc(C.ink, C.clothB, .4);

  // heartbeat envelope: a soft lub (0) and a smaller dub (.28 s) every 1.05 s
  const beat = t => { if (t < 0) return 0; const p = t % 1.05; return Math.exp(-p * 9) + .6 * Math.exp(-Math.max(0, p - .28) * 10) * (p > .28 ? 1 : 0); };

  // notes, as in wc_scene
  function drawNotes(X, P, lt, cues, W, H) {
    const portrait = H > W;
    for (const n of P.notes || []) {
      const t0 = WC.timeOf(n.at, cues, 1.2), col = n.color === 'red' ? C.red : C.ink;
      if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size: n.size || (portrait ? 52 : 44), col, bend: n.bend });
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size: n.size || (portrait ? 54 : 46), align: n.align || 'center', col });
    }
  }

  // ================================================================ paper tube / wooden cylinder
  def('paper_tube', o => {
    const S = [], L = 220, R = 34, cy = -R;
    if (o.wood) {
      const wd = mixc(C.wood, C.clothC, .3), wdD = dark(wd, .3);
      const body = spline([[-L, cy - R * .8], [-L * .3, cy - R * .82], [L * .7, cy - R * .8], [L - 6, cy - R * 1.15], [L + 6, cy - R * 1.2], [L + 6, cy + R * 1.2], [L - 6, cy + R * 1.15], [L * .7, cy + R * .8], [-L * .3, cy + R * .82], [-L, cy + R * .8]], true, 3);
      wsh(S, body, lite(wd, .3), .6, 3, 1.2);
      wsh(S, body, wd, .4, 3, 1.4);
      wsh(S, [[-L, cy + R * .2], [L * .7, cy + R * .2], [L, cy + R * .6], [L, cy + R * 1.1], [L * .7, cy + R * .78], [-L, cy + R * .78]], wdD, .45, 3, 1);
      for (let k = 0; k < 7; k++) { const y = cy - R * .55 + k * R * .18; brush(S, [[-L + 10, y], [-L * .2, y + rnd(-2, 2)], [L * .6, y + rnd(-2, 2)]], rnd(2, 3.5), dark(wd, .45), { prof: 'leaf', nb: 0, a: .3 }); }
      brush(S, [[-L + 14, cy - R * .5], [L * .6, cy - R * .52]], 7, C.paperLight, { prof: 'leaf', nb: 4, a: .45 });
      for (const x of [-8, 8]) { brush(S, [[x, cy - R * .86], [x + 1, cy + R * .86]], 5, wdD, { prof: 'even', nb: 2, a: .75 }); }
      wsh(S, ell(-L, cy, R * .3, R * .8, 0, TAU, 24), dark(wd, .15), .8, 3, .4);
      wsh(S, ell(-L, cy, R * .1, R * .26, 0, TAU, 14), C.ink, .85, 2, .2);
      pool(S, spline([[-L, cy + R * .8], [L * .7, cy + R * .8], [L + 6, cy + R * 1.2]], false, 4), dark(wd, .55), 2.4, .5);
      ink(S, spline([[-L, cy - R * .8], [L * .7, cy - R * .8], [L + 6, cy - R * 1.2]], false, 4), 1.8, { a: .7 });
      ink(S, ell(-L, cy, R * .3, R * .8, -PI / 2, PI / 2, 14), 1.6, { a: .7, gaps: 0 });
      return { S, parts: { left: [-L, cy], right: [L, cy], center: [0, cy], top: [0, cy - R * 1.2] } };
    }
    const pc = paperC(), ps = paperS();
    const body = [[-L, cy - R], [L, cy - R * .96], [L + 4, cy + R * .96], [-L, cy + R]];
    wsh(S, body, lite(pc, .2), .75, 3, 1.4);
    // the curved shading of a cylinder: a broad shadow below, a fainter core, a paper-white light along the top
    wsh(S, [[-L, cy + R * .15], [L, cy + R * .1], [L + 4, cy + R * .96], [-L, cy + R]], ps, .4, 3, 1.4);
    wsh(S, [[-L, cy + R * .55], [L, cy + R * .5], [L + 4, cy + R * .95], [-L, cy + R]], dark(ps, .2), .28, 2, 1);
    for (let k = 0; k < 3; k++) brush(S, [[-L + 20 + k * 30, cy - R * .62 + k * 4], [L * .2, cy - R * .6 + k * 4], [L - 20, cy - R * .62 + k * 4]], rnd(5, 9), C.paperLight, { prof: 'leaf', nb: 4, a: .5 });
    // faint ruled lines on the outer sheet (they wrap round: short arcs)
    for (let k = 0; k < 3; k++) { const y = cy - R * .35 + k * R * .28; brush(S, [[-L + 18, y], [0, y + rnd(-1, 1)], [L - 16, y + rnd(-1, 1)]], 1.5, mixc(C.blue, C.paper, .55), { prof: 'even', nb: 0, a: .28 }); }
    for (let k = 0; k < 5; k++) { const x = -L + 50 + k * 70 + rnd(-10, 10), y = cy - R * .48 + rnd(0, 4); brush(S, spline([[x, y], [x + 12, y - 4], [x + 22, y + 2], [x + 36, y - 3], [x + 48, y + 1]], false, 3), 1.6, C.inkSoft, { prof: 'leaf', nb: 0, a: .35 }); }
    // the free edge of the outer sheet, lifting a little at the right end
    const edge = spline([[-L + 6, cy + R * .3], [-L * .2, cy + R * .26], [L * .55, cy + R * .2], [L - 12, cy + R * .05], [L + 10, cy - R * .25]], false, 5);
    brush(S, edge.map(([x, y]) => [x, y + 3]), 4, dark(ps, .25), { prof: 'even', nb: 0, a: .45 });
    ink(S, edge, 1.4, { a: .7, gaps: 1 });
    wsh(S, [[L - 30, cy + R * .1], [L + 12, cy - R * .3], [L + 22, cy - R * .05], [L, cy + R * .3]], lite(pc, .3), .8, 2, .5);
    // right end: an arc, a little shadow inside
    ink(S, spline([[L - 2, cy - R * .96], [L + 10, cy], [L + 4, cy + R * .96]], false, 4), 1.8, { a: .75, gaps: 0 });
    // near (left) end: the spiral of sheets, a dark hollow
    wsh(S, ell(-L, cy, R * .36, R, 0, TAU, 30), lite(pc, .15), .9, 3, .5);
    for (let k = 0; k < 5; k++) { const f = 1 - k * .16; ink(S, ell(-L + k * .6, cy + k * .8, R * .36 * f, R * f, -PI * .5, PI * 1.35, 24), 1.1, { a: .5 - k * .05, gaps: 0, col: dark(ps, .3) }); }
    wsh(S, ell(-L + 2, cy + 2, R * .13, R * .36, 0, TAU, 16), mixc(C.ink, C.stoneDark, .3), .85, 3, .4);
    ink(S, ell(-L, cy, R * .36, R, 0, TAU, 30), 1.8, { a: .8, gaps: 1 });
    ink(S, [[-L, cy - R], [L - 2, cy - R * .96]], 1.8, { a: .75 });
    pool(S, [[-L, cy + R], [L + 4, cy + R * .96]], dark(ps, .5), 2.6, .5);
    return { S, parts: { left: [-L, cy], right: [L, cy], center: [0, cy], top: [0, cy - R] } };
  });
  function qarc(x, cy, R) { return spline([[x, cy - R * .95], [x + 4, cy - R * .3], [x + 5, cy + R * .3], [x + 3, cy + R * .92]], false, 3); }

  // ================================================================ timber beam on two blocks
  def('timber_beam', o => {
    const S = [], L = 380, th = 40, fh = 46, by = -50, wd = mixc(C.wood, C.ground, .3), wdD = dark(wd, .3), st = C.stone;
    for (const x of [-250, 250]) {
      const B = [[x - 46, 0], [x - 42, -by * 0 - 52], [x + 44, -54], [x + 48, 0]];
      wsh(S, B, st, .75, 3, 2); wsh(S, [[x + 10, -52], [x + 44, -54], [x + 48, 0], [x + 14, 0]], dark(st, .25), .4, 2, 1);
      ink(S, B.concat([B[0]]).slice(0, 4), 1.6, { a: .6 });
    }
    // top face (seen a little from above) and the front face
    const top = [[-L + 14, by - fh - th * .5], [L + 14, by - fh - th * .5], [L, by - fh], [-L, by - fh]];
    const front = [[-L, by - fh], [L, by - fh], [L, by], [-L, by]];
    wsh(S, top, lite(wd, .35), .75, 3, 1.4);
    wsh(S, front, wd, .72, 3, 1.6);
    wsh(S, [[-L, by - 14], [L, by - 16], [L, by], [-L, by]], wdD, .4, 2, 1);
    for (let k = 0; k < 9; k++) { const y = by - fh + 6 + k * 4.6; brush(S, spline([[-L + 10, y], [-L * .3, y + rnd(-2, 2)], [L * .4, y + rnd(-2, 2)], [L - 6, y + rnd(-2, 2)]], false, 4), rnd(1.6, 3), dark(wd, .4), { prof: 'leaf', nb: 0, a: rnd(.22, .4) }); }
    for (let k = 0; k < 3; k++) brush(S, [[-L + 40 + k * 20, by - fh - th * .3], [L - 40, by - fh - th * .28]], rnd(4, 7), C.paperLight, { prof: 'leaf', nb: 4, a: .4 });
    for (const x of [-120, 90, 230]) ink(S, [[x, by - fh + 4], [x + rnd(20, 50), by - fh + 18 + rnd(-4, 6)]], 1.2, { a: .55, gaps: 0 });
    // end grain at the left: rings
    const E = [[-L, by - fh], [-L + 14, by - fh - th * .5], [-L + 14, by - th * .5], [-L, by]];
    wsh(S, E, lite(wd, .15), .85, 2, .6);
    for (let k = 1; k < 4; k++) ink(S, ell(-L + 7, by - fh * .5 - th * .25, 2 + k * 2, 5 + k * 7, 0, TAU, 14), .9, { a: .45, gaps: 0, col: wdD });
    ink(S, [[-L + 14, by - fh - th * .5], [L + 14, by - fh - th * .5], [L, by - fh]], 1.8, { a: .75 });
    ink(S, [[-L, by - fh], [L, by - fh]], 1.4, { a: .6 });
    pool(S, [[-L, by], [L, by]], dark(wd, .55), 2.4, .5);
    ink(S, [[L, by - fh], [L, by]], 1.6, { a: .7, gaps: 0 });
    return { S, parts: { left: [-L + 6, by - fh * .5], right: [L - 6, by - fh * .5], top: [0, by - fh - th * .5], center: [0, by - fh * .5] } };
  });

  // ================================================================ modern stethoscope, draped
  def('stethoscope', o => {
    const S = [], tb = tubing(), mt = metal();
    const tube = (pts, w = 15) => { const P = spline(pts, false, 6); brush(S, P, w, tb, { prof: 'even', nb: 4, a: .9, rough: .12 }); brush(S, P.map(([x, y]) => [x - 3, y - 3]), w * .22, lite(tb, .55), { prof: 'leaf', nb: 0, a: .55 }); ink(S, P.map(([x, y]) => [x + 4, y + 5]), 1.2, { a: .5, gaps: 1 }); };
    // the arc over the (unseen) neck, the left fall to the yoke, the right fall to the chest piece
    tube([[-118, -250], [-128, -360], [-100, -440], [-30, -490], [40, -488], [104, -440], [126, -360], [118, -250], [104, -150], [104, -96]]);
    // yoke + binaurals (metal) to two ear tips
    wsh(S, ell(-118, -246, 14, 10, 0, TAU, 14), mt, .9, 2, .3);
    for (const [ex, ey, b] of [[-170, -96, -1], [-92, -84, 1]]) {
      const P = spline([[-118, -240], [-118 + b * 14, -200], [ex - b * 6, -140], [ex, ey]], false, 6);
      brush(S, P, 7, mt, { prof: 'even', nb: 2, a: .95, rough: .1 }); brush(S, P.map(([x, y]) => [x - 1.5, y]), 2, C.paperLight, { prof: 'leaf', nb: 0, a: .7 });
      ink(S, P.map(([x, y]) => [x + 3.5, y + 1]), 1, { a: .55, gaps: 0 });
      wsh(S, WC.blobPts(ex, ey + 4, 11, 9, 14, .1), mixc(C.ink, C.stoneDark, .2), .9, 3, .3);
    }
    // the chest piece seen face on: a stem, a silver rim ring, a pale diaphragm, a small glint
    brush(S, [[104, -98], [106, -84]], 9, mt, { prof: 'even', nb: 0, a: .95 });
    const D = ell(106, -42, 44, 44, 0, TAU, 40);
    wsh(S, D, dark(mt, .15), .9, 3, .5);
    wsh(S, ell(106, -42, 33, 33, 0, TAU, 34), lite(mt, .55), .85, 3, .4);
    wsh(S, ell(112, -36, 26, 26, -PI * .1, PI * .9, 20).concat([[112, -36]]), mt, .3, 2, .4);
    ink(S, ell(106, -42, 33, 33, 0, TAU, 34), 1.2, { a: .5, gaps: 1 });
    brush(S, spline([[82, -60], [94, -72], [110, -76]], false, 4), 5, C.paperLight, { prof: 'leaf', nb: 0, a: .8 });
    inkC(S, D, 1.8, { a: .75 });
    pool(S, ell(106, -42, 44, 44, 0, PI, 18), dark(mt, .5), 2.4, .45);
    return { S, parts: { chest: [106, -42], ears: [-130, -96], top: [0, -490], yoke: [-118, -246] } };
  });


  // ================================================================ the paper tube beside today's stethoscope (one plate)
  def('steth_pair', o => {
    const st = WC.G.stethoscope(1, { shadow: false }), tb = WC.G.paper_tube(.78, { shadow: false });
    const S = [];
    for (const q of tb.S) S.push(q); xform(tb.S, -250, 0);
    for (const q of st.S) S.push(q); xform(st.S, 130, 0);
    return { S, parts: { tube: [-250, -30], tube_end: [-420, -30], chest: [236, -42], top: [130, -490], ears: [0, -96] } };
  });

  // ================================================================ a head in profile, painted into a stroke list
  // local frame: the face looks toward -x, the crown is -y; r = skull radius. o: {ang, mirror, hair (token), kind:
  // 'man'|'woman'|'child', eye: 'closed'|'open', blush (0..1)}. Returns the ear position on the stage.
  function head(S, cx, cy, r, o = {}) {   // S is reassigned for the ear only
    const ang = o.ang || 0, c = Math.cos(ang), s = Math.sin(ang), my = o.mirror ? -1 : 1;
    const T = ([x, y]) => { y *= my; return [cx + (x * c - y * s) * r, cy + (x * s + y * c) * r]; };
    const TP = P => P.map(T);
    const sk = mixc(C.skin, C.wood, .06), hair = WC.col(o.hair || mixc(C.wood, C.ink, .35)), kid = o.kind === 'child';
    const nose = kid ? -1.1 : -1.22;
    const face = [[-.55, -.85], [-.9, -.45], [-.95, -.15], [-1.0, -.05], [nose, .2], [-.98, .3], [-1.02, .42], [-.95, .52], [-.98, .64], [-.8, .84], [-.35, .92], [.1, .72], [.55, .6], [1.0, .05], [.85, -.65], [.2, -1.02]];
    const F = spline(face.map(T), true, 4);
    const Hp0 = (o.kind === 'woman' ? [[-.75, -.7], [-.35, -1.12], [.4, -1.1], [1.05, -.5], [1.1, .2], [.75, .55], [.4, .35], [.3, -.15], [-.2, -.55], [-.55, -.6]]
      : [[-.8, -.68], [-.4, -1.12], [.45, -1.06], [1.06, -.35], [1.0, .3], [.68, .5], [.45, .15], [.25, -.3], [-.1, -.55], [-.55, -.62]]);
    // an opaque paper underlay first: nothing behind shows through the face or the hair
    add(S, washShape(F, mixc(C.paperLight, sk, .25), .7, 1, 0));
    add(S, washShape(spline(Hp0.map(T), true, 4), mixc(C.paperLight, hair, .2), .7, 1, 0));
    wsh(S, F, lite(sk, .18), .62, 3, r * .02);
    wsh(S, spline([[-.9, -.3], [-.6, .1], [-.3, .5], [-.8, .7]].map(T), true, 3), sk, .25, 2, r * .02);
    wsh(S, spline([[-.4, .3], [.1, .2], [.5, .5], [.1, .8], [-.5, .85]].map(T), true, 3), dark(sk, .22), .32, 2, r * .02);      // jaw shadow
    if (o.blush) wsh(S, WC.blobPts(...T([-.55, .28]), r * .26, r * .18, 16, .2), mixc(C.red, C.skin, .4), .22 * o.blush, 2, 1);
    brush(S, spline([[-.85, -.5], [-.95, -.2]].map(T), false, 3), r * .07, C.paperLight, { prof: 'leaf', nb: 0, a: .5 });           // light on the brow
    // hair
    const HP = spline(Hp0.map(T), true, 4);
    wsh(S, HP, hair, .55, 3, r * .03);
    wsh(S, HP, dark(hair, .2), .3, 2, r * .04);
    for (let k = 0; k < 7; k++) { const a0 = rnd(-.6, .6), b0 = rnd(-.9, -.5); brush(S, spline([[a0, b0], [a0 + .35, b0 + .25], [a0 + .6, b0 + .6]].map(T), false, 3), r * rnd(.06, .1), dark(hair, .35), { prof: 'leaf', nb: 3, a: .35 }); }
    if (o.kind === 'woman') { const B = spline(WC.blobPts(1.15, -.2, .4, .36, 18, .1).map(T), true, 2); add(S, washShape(B, mixc(C.paperLight, hair, .2), .7, 1, 0)); wsh(S, B, hair, .65, 3, 1); ink(S, B, 1.2, { a: .45 }); }
    if (o.kind === 'man') wsh(S, spline([[.15, -.2], [.32, -.15], [.3, .45], [.12, .5]].map(T), true, 3), hair, .5, 2, 1);        // sideburn
    // ear (o.earList: painted into a separate list, so a shot can lay it over something)
    const ex = .25, ey = .12, S0 = S;
    if (o.earList) S = o.earList;
    const E = spline([[ex - .1, ey - .3], [ex + .12, ey - .32], [ex + .2, ey - .05], [ex + .12, ey + .25], [ex - .05, ey + .3], [ex - .12, ey + .1]].map(T), true, 4);
    wsh(S, E, mixc(sk, C.red, .14), .8, 3, .6);
    ink(S, spline([[ex - .1, ey - .3], [ex + .12, ey - .32], [ex + .2, ey - .05], [ex + .12, ey + .25], [ex - .05, ey + .3]].map(T), false, 4), Math.max(1.2, r * .025), { a: .7, gaps: 0 });
    ink(S, spline([[ex - .02, ey - .18], [ex + .1, ey - .12], [ex + .06, ey + .1]].map(T), false, 3), Math.max(1, r * .018), { a: .5, gaps: 0 });
    dot(S, ...T([ex + .01, ey + .02]), r * .05, dark(sk, .5), .7);
    S = S0;
    // eye, brow, mouth
    if (o.eye === 'open') { dot(S, ...T([-.66, -.04]), r * .06, C.ink, .9); } else brush(S, spline([[-.76, -.02], [-.66, .02], [-.56, -.01]].map(T), false, 3), Math.max(1.6, r * .035), C.ink, { prof: 'leaf', nb: 0, a: .75 });
    brush(S, spline([[-.82, -.2], [-.66, -.24], [-.5, -.2]].map(T), false, 3), Math.max(2, r * .05), dark(hair, .1), { prof: 'leaf', nb: 0, a: .6 });
    brush(S, spline([[-.98, .48], [-.88, .5]].map(T), false, 2), Math.max(1.4, r * .03), mixc(C.red, C.skin, .5), { prof: 'leaf', nb: 0, a: .6 });
    // the profile line: a loose ink edge down the face, a lighter one round the back
    ink(S, spline(face.slice(0, 11).map(T), false, 4), Math.max(1.4, r * .03), { a: .75 });
    pool(S, spline(face.slice(10, 14).map(T), false, 3), dark(sk, .45), Math.max(1.4, r * .03), .35);
    const e = T([ex, ey]); e.cheek = T([-.55, .28]); e.nape = T([.55, .7]); return e;
  }

  // ================================================================ the ward, medium shot (baked in two layers: behind / in front of the doctor)
  // the woman lies on her back, head on the pillow at the left, in a high-collared dress, a blanket over her legs.
  function ward(W, H, seed, o = {}) {
    const floorY = 1250, bedTop = 1010, chest = [470, 905];
    const back = document.createElement('canvas'); back.width = W; back.height = H;
    const front = document.createElement('canvas'); front.width = W; front.height = H;
    WC.withSeed(seed, () => {
      const c = back.getContext('2d'), wall = mixc(C.stone, C.paper, .45);
      WC.wash(c, [[-20, -20], [W + 20, -20], [W + 20, floorY + 10], [-20, floorY + 10]], wall, .5, 3, 6);
      WC.blooms(c, 0, 0, W, floorY, mixc(C.stone, C.paperDark, .4), 9, .12);
      WC.granulate(c, 0, 0, W, floorY, C.stoneDark, .6, .08);
      // a tall arched window, its glass the pale sky, light falling across the wall
      if (o.window !== false) { const win = WC.make('window', 1.45, { style: 'arched', light: false }, seed + 4); WC.drawObj(c, win, 250, floorY, 1); }
      else for (let k = 0; k < 5; k++) WC.drawS(c, mk(WC.qcurve(rnd(0, W), rnd(100, 600), rnd(0, W), rnd(700, 1200), rnd(-60, 60), 10), rnd(20, 40), mixc(C.stone, C.paperDark, .3), { prof: 'leaf', nb: 7, a: .12 }), 1);
      // floor
      const fl = mixc(C.wood, C.ground, .45);
      WC.wash(c, [[-20, floorY], [W + 20, floorY], [W + 20, H + 20], [-20, H + 20]], fl, .55, 3, 6);
      for (let k = 0; k < 9; k++) { const y = floorY + 30 + k * k * 9; WC.drawS(c, mk([[-20, y], [W / 2, y + rnd(-3, 3)], [W + 20, y + rnd(-4, 4)]], rnd(2, 4), dark(fl, .3), { prof: 'leaf', nb: 3, a: .3 }), 1); }
      WC.blooms(c, 0, floorY, W, H, dark(fl, .2), 7, .12);
      WC.drawS(c, mk([[-20, floorY], [W + 20, floorY]], 3, C.ink, { prof: 'even', nb: 0, a: .35 }), 1);
    });
    WC.withSeed(seed + 1, () => {
      const c = front.getContext('2d'), S = [];
      const wd = mixc(C.wood, C.ink, .12), linen = mixc(C.paperLight, C.stone, .22), dr = mixc(C.clothB, C.paper, .3), bl = mixc(C.cloth, C.stoneDark, .3);
      // the shadow under the bed
      wsh(S, WC.blobPts(560, floorY + 70, 560, 40, 30, .1), mixc(C.stoneDark, C.night, .3), .25, 3, 4);
      // bedstead: the headboard at the left, side rail, legs
      wsh(S, rect(30, 720, 78, floorY + 60), wd, .75, 3, 1.2); ink(S, [[30, 720], [30, floorY + 60]], 2, { a: .7 });
      wsh(S, spline([[30, 722], [54, 690], [78, 722]], false, 4).concat([[78, 722]]), dark(wd, .2), .8, 2, .5);
      wsh(S, rect(70, 1080, W + 20, 1150), wd, .72, 3, 1.5);
      wsh(S, rect(70, 1130, W + 20, 1150), dark(wd, .25), .5, 2, 1);
      for (let k = 0; k < 3; k++) brush(S, [[90, 1090 + k * 16], [W, 1092 + k * 16]], 3, dark(wd, .35), { prof: 'leaf', nb: 2, a: .3 });
      ink(S, [[70, 1080], [W + 20, 1080]], 1.8, { a: .7 });
      for (let k = 0; k < 4; k++) brush(S, [[80 + k * 30, 1086 + k * 6], [W * .5, 1088 + k * 6 + rnd(-3, 3)], [W, 1086 + k * 6]], rnd(5, 9), k % 2 ? C.paperLight : dark(wd, .3), { prof: 'leaf', nb: 8, a: .35 });   // dry brush on the rail
      for (const x of [110, 980]) wsh(S, rect(x - 16, 1150, x + 16, floorY + 70), dark(wd, .2), .8, 2, .6);
      // mattress and the sheet hanging over the rail
      wsh(S, spline([[78, bedTop + 8], [600, bedTop], [W + 20, bedTop + 4], [W + 20, 1090], [600, 1096], [78, 1090]], true, 4), linen, .7, 3, 2);
      for (let k = 0; k < 6; k++) { const x = 150 + k * 160 + rnd(-30, 30); brush(S, spline([[x, bedTop + 20], [x + 10, 1050], [x - 6, 1090]], false, 3), 10, dark(linen, .25), { prof: 'leaf', nb: 4, a: .25 }); }
      // pillow
      wsh(S, WC.blobPts(190, 975, 130, 44, 28, .12), lite(linen, .3), .8, 3, 1);
      ink(S, ell(190, 975, 130, 44, PI * 1.05, PI * 1.95, 18), 1.4, { a: .45, gaps: 1 });
      // blanket over her legs, from the waist to the foot of the bed, draping over the rail
      const B = spline([[600, 965], [700, 948], [820, 952], [960, 944], [W + 20, 950], [W + 20, 1110], [800, 1118], [610, 1112], [590, 1040]], true, 4);
      wsh(S, B, bl, .6, 3, 3); wsh(S, B, lite(bl, .2), .35, 2, 4); wsh(S, B.map(([x, y]) => [x + 12, y + 10]), dark(bl, .15), .22, 3, 10);
      for (let k = 0; k < 6; k++) { const x = 640 + k * 80; brush(S, spline([[x, 960], [x + 14, 1030], [x - 4, 1110]], false, 3), 12, dark(bl, .3), { prof: 'leaf', nb: 5, a: .3 }); }
      brush(S, spline([[620, 958], [800, 946], [W, 944]], false, 4), 8, lite(bl, .5), { prof: 'leaf', nb: 4, a: .4 });
      ink(S, spline([[600, 965], [700, 948], [820, 952], [960, 944], [W + 20, 950]], false, 4), 1.8, { a: .7 });
      // her body under the dress: shoulders, the rise of the chest, the waist (lying on her back)
      const Bd = spline([[250, 1000], [290, 945], [360, 925], [430, 902], [510, 900], [570, 925], [620, 955], [640, 1004], [420, 1012]], true, 5);
      add(S, washShape(Bd, mixc(C.paperLight, dr, .3), .7, 1, 0));
      wsh(S, Bd, lite(dr, .3), .6, 3, 2); wsh(S, Bd, dr, .45, 3, 3);
      wsh(S, Bd.map(([x, y]) => [x + 10, y + 8]), dark(dr, .1), .25, 3, 9);                          // a second soft-edged wash
      wsh(S, WC.blobPts(470, 935, 120, 50, 26, .3), mixc(C.red, dr, .5), .18, 3, 8);                   // the red bleeding into the dress
      wsh(S, spline([[300, 985], [450, 975], [630, 990], [630, 1008], [300, 1008]], true, 3), dark(dr, .25), .4, 2, 1.5);
      for (let k = 0; k < 4; k++) brush(S, spline([[360 + k * 60, 930], [372 + k * 60, 970], [366 + k * 60, 1004]], false, 3), 8, dark(dr, .3), { prof: 'leaf', nb: 4, a: .28 });
      brush(S, spline([[340, 930], [440, 908], [540, 910]], false, 4), 10, C.paperLight, { prof: 'leaf', nb: 5, a: .45 });          // light on the bodice
      brush(S, spline([[575, 928], [585, 965], [590, 1004]], false, 3), 14, mixc(C.clothC, C.wood, .2), { prof: 'even', nb: 4, a: .7 });  // Empire ribbon
      ink(S, spline([[290, 945], [360, 925], [430, 902], [510, 900], [570, 925], [620, 955]], false, 5), 1.8, { a: .7 });
      // the high white collar (chemisette) with a ruffle at the throat
      const Cl = spline([[240, 950], [262, 918], [300, 912], [322, 940], [300, 975], [262, 985]], true, 4);
      wsh(S, Cl, mixc(C.paperLight, C.stone, .08), .9, 3, 1);
      for (let k = 0; k < 5; k++) brush(S, spline([[262 + k * 10, 916 + k * 2], [268 + k * 10, 932], [262 + k * 10, 948]], false, 3), 3, mixc(C.stone, C.inkSoft, .3), { prof: 'leaf', nb: 0, a: .5 });
      // her arm along her side in a long sleeve, the hand on the blanket
      brush(S, spline([[320, 995], [470, 1000], [600, 990]], false, 4), 34, dark(dr, .1), { prof: 'even', nb: 6, a: .6 });
      wsh(S, WC.blobPts(640, 988, 22, 14, 14, .15), mixc(C.skin, C.wood, .06), .85, 3, .5);
      for (const s of S) WC.drawItem(c, s, 1, null, 1);
      // her head on the pillow, face up, eyes closed
      const S2 = [];
      head(S2, 200, 925, 50, { ang: PI / 2, mirror: true, kind: 'woman', hair: mixc(C.wood, C.clothC, .35), eye: 'closed' });
      for (const s of S2) WC.drawItem(c, s, 1, null, 1);
    });
    const shaft = document.createElement('canvas'); shaft.width = W; shaft.height = H;
    WC.withSeed(seed + 2, () => { const c = shaft.getContext('2d'); WC.wash(c, [[180, 300], [380, 300], [900, floorY], [520, floorY]], mixc(C.gold, C.paperLight, .5), .3, 3, 10); WC.wash(c, [[230, 360], [330, 360], [780, floorY], [600, floorY]], mixc(C.gold, C.paperLight, .4), .2, 2, 8); });
    return { back, front, chest, bedTop, floorY, shaft };
  }

  // the doctor (behind the bed): a dark coat, a white cravat, his head in profile. pose: 'tap' | 'listen'.
  // returns {S (body + head, baked), ear, shoulder}
  function doctor(pose, seed) {
    return WC.withSeed(seed, () => {
      const S = [], coat = mixc(C.clothB, C.ink, .38), wt = mixc(C.paperLight, C.stone, .1);
      let body, neck, hc, ang, r = 60;
      if (pose === 'listen') {
        body = [[540, 720], [570, 640], [630, 560], [720, 505], [840, 570], [885, 760], [900, 1060], [600, 1060], [560, 840]];
        neck = null; ang = -.78; hc = [455, 604];
      } else {
        body = [[600, 600], [640, 520], [760, 520], [840, 600], [870, 800], [880, 1060], [600, 1060], [590, 760]];
        neck = [[606, 500], [662, 486], [680, 600], [620, 612]]; ang = -.5; hc = [600, 450];
      }
      // coat: washes, folds, dry-brush light on the shoulder, the colour pooling at the edges
      const Bd = spline(body, true, 4);
      const cxB = body.reduce((a, p) => a + p[0], 0) / body.length, cyB = body.reduce((a, p) => a + p[1], 0) / body.length;
      const inset = (k) => Bd.map(([x, y]) => [cxB + (x - cxB) * k, cyB + (y - cyB) * k]);
      add(S, washShape(Bd, mixc(C.paperLight, coat, .4), .7, 1, 0));                        // opaque underlay
      wsh(S, Bd, lite(coat, .45), .55, 3, 5);                                                  // first light wash, wet edge
      wsh(S, inset(.9).map(([x, y]) => [x + 14, y + 10]), coat, .45, 3, 6);                  // second, darker, offset to the shadow side
      wsh(S, inset(.62).map(([x, y]) => [x + 40, y + 30]), dark(coat, .25), .35, 2, 6);      // the deep shadow under the arm and back
      for (let k = 0; k < 10; k++) { const x = rnd(cxB - 120, cxB + 120), y = rnd(cyB - 200, cyB + 160); brush(S, WC.qcurve(x, y, x + rnd(-40, 40), y + rnd(90, 200), rnd(-30, 30), 7), rnd(8, 16), dark(coat, .35), { prof: 'leaf', nb: 7, a: .32 }); }
      for (let k = 0; k < 3; k++) brush(S, spline(body.slice(1, 4).map(([x, y]) => [x + 10 + k * 8, y + 12 + k * 10]), false, 4), rnd(8, 12), C.paperLight, { prof: 'leaf', nb: 8, a: .2 });   // dry-brush light on the shoulders
      brush(S, spline(body.slice(2, 6), false, 5), 18, dark(coat, .2), { prof: 'brush', nb: 9, a: .45 });                 // ragged dry-brush edge down the back
      pool(S, spline(body.slice(3, 6), false, 4), dark(coat, .5), 3, .45);
      ink(S, spline(body.slice(0, 4), false, 4), 1.8, { a: .6 });
      // neck and the white cravat
      const SH = [], SE = [];
      const ear = head(SH, hc[0], hc[1], r, { ang, kind: 'man', eye: pose === 'listen' ? 'closed' : 'open', blush: .4, earList: pose === 'listen' ? SE : null });
      if (pose === 'listen') {   // the neck: from the nape down and back into the collar, clearly apart from the tube
        const nk = [[ear.nape[0] - 6, ear.nape[1] - 10], [ear.nape[0] + 30, ear.nape[1] + 30], [585, 660]];
        brush(S, spline(nk, false, 4), 50, mixc(C.paperLight, C.skin, .4), { prof: 'even', nb: 0, a: 1, rib: 1, rough: .08 });
        brush(S, spline(nk, false, 4), 46, mixc(C.skin, C.wood, .1), { prof: 'even', nb: 3, a: .7 });
        brush(S, spline(nk, false, 4).map(([x, y]) => [x + 8, y + 8]), 16, dark(mixc(C.skin, C.wood, .1), .3), { prof: 'leaf', nb: 2, a: .35 });
        ink(S, spline(nk, false, 4).map(([x, y]) => [x - 16, y + 16]), 1.4, { a: .5 });
      } else {
        add(S, washShape(spline(neck, true, 3), mixc(C.paperLight, C.skin, .3), .7, 1, 0));
        wsh(S, spline(neck, true, 3), mixc(C.skin, C.wood, .1), .8, 3, 1);
      }
      const cv = pose === 'listen' ? [[548, 660], [592, 640], [606, 690], [562, 704]] : [[605, 590], [665, 585], [672, 650], [615, 655]];
      add(S, washShape(spline(cv, true, 3), C.paperLight, .7, 1, 0));
      wsh(S, spline(cv, true, 3), wt, .9, 3, 1); ink(S, spline(cv, true, 3), 1.2, { a: .45 });
      // the coat's high collar wrapping the neck, under the cravat
      const col = pose === 'listen' ? [[540, 716], [590, 704], [622, 664], [636, 616]] : [[606, 640], [650, 640], [690, 610], [700, 560]];
      brush(S, spline(col, false, 4), 26, coat, { prof: 'even', nb: 6, a: .9 });
      brush(S, spline(col, false, 4).map(([x, y]) => [x - 4, y - 6]), 6, lite(coat, .5), { prof: 'leaf', nb: 3, a: .4 });
      return { S, ear, cheek: ear.cheek, spr: WC.sprite(S), hd: { spr: WC.sprite(SH) }, er: SE.length ? { spr: WC.sprite(SE) } : null };
    });
  }
  // an arm in a coat sleeve from the shoulder through the elbow to the hand; fingers: 'tap' | 'grip'
  function arm(S, sh, el, hd, fingers, k = 1) {
    const coat = mixc(C.clothB, C.ink, .38), sk = mixc(C.skin, C.wood, .08);
    const P = spline([sh, el, hd], false, 6);
    brush(S, P.slice(0, -2), 44 * k, mixc(C.paperLight, coat, .3), { prof: 'even', nb: 0, a: 1, rib: 1, rough: .1 });
    brush(S, P.slice(0, -2), 44 * k, lite(coat, .2), { prof: 'even', nb: 0, a: .85, rough: .12 });
    brush(S, P.slice(0, -2).map(([x, y]) => [x + 6 * k, y + 6 * k]), 20 * k, dark(coat, .25), { prof: 'leaf', nb: 0, a: .4 });
    for (const f of [.3, .5, .7]) { const q = P[Math.floor((P.length - 3) * f)], q2 = P[Math.floor((P.length - 3) * f) + 1], dx = q2[0] - q[0], dy = q2[1] - q[1], L = Math.hypot(dx, dy) || 1;
      brush(S, [[q[0] - dy / L * 18 * k, q[1] + dx / L * 18 * k], [q[0] + dx / L * 10 * k, q[1] + dy / L * 10 * k], [q[0] + dy / L * 16 * k, q[1] - dx / L * 16 * k]], 5 * k, dark(coat, .4), { prof: 'leaf', nb: 2, a: .45 }); }
    const cf = P[P.length - 3];
    wsh(S, WC.blobPts(cf[0], cf[1], 22 * k, 22 * k, 14, .15), mixc(C.paperLight, C.stone, .1), .9, 3, .6);     // white cuff
    wsh(S, WC.blobPts(hd[0], hd[1], 26 * k, 20 * k, 16, .15), sk, .85, 3, .8);
    const dx = hd[0] - el[0], dy = hd[1] - el[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    if (fingers === 'tap') for (const o of [-8, 8]) brush(S, [[hd[0] + ux * 10 - uy * o, hd[1] + uy * 10 + ux * o], [hd[0] + ux * 46 - uy * o, hd[1] + uy * 46 + ux * o]], 13 * k, sk, { prof: 'even', nb: 2, a: .9 });
    else for (let j = -1; j <= 1; j++) brush(S, [[hd[0] + ux * 6 * k - uy * j * 12 * k, hd[1] + uy * 6 * k + ux * j * 12 * k], [hd[0] + ux * 30 * k - uy * j * 12 * k, hd[1] + uy * 30 * k + ux * j * 12 * k]], 11 * k, sk, { prof: 'even', nb: 2, a: .9 });
    pool(S, WC.blobPts(hd[0], hd[1], 26 * k, 20 * k, 16, .15).slice(0, 9), dark(sk, .45), 1.6, .4);
  }
  // a soft red wet-in-wet bloom (the heartbeat under the cloth), baked
  function glow(r, seed) {
    return WC.withSeed(seed, () => {
      const w = Math.ceil(r * 3), cv = document.createElement('canvas'); cv.width = w; cv.height = w; const c = cv.getContext('2d');
      for (let k = 0; k < 5; k++) WC.wash(c, WC.blobPts(w / 2 + rnd(-r * .15, r * .15), w / 2 + rnd(-r * .1, r * .1), r * (1 - k * .15), r * (.8 - k * .12), 30, .25), mixc(C.red, C.paperLight, .3 + k * .05), .16, 3, 3);
      WC.blooms(c, w / 2 - r, w / 2 - r, w / 2 + r, w / 2 + r, mixc(C.red, C.paperLight, .55), 5, .1);
      return { cv, w };
    });
  }
  const drawGlow = (X, g, x, y, s, a) => { X.save(); X.globalAlpha = a; X.translate(x, y); X.scale(s, s); X.drawImage(g.cv, -g.w / 2, -g.w / 2); X.restore(); };

  // ================================================================ shot: the ward, medium (rest | tap | listen)
  SHOTS.wc_steth_ward = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), mode = P.mode || 'listen';
      const wd = ward(W, H, seed * 3 + 1, { window: P.window }), [cx, cy] = wd.chest;
      const doc = mode === 'rest' ? null : doctor(mode, seed + 21);
      const tube = WC.make('paper_tube', .66, {}, seed + 3);       // ≈ 290 px long
      const gl = glow(120, seed + 12);
      const tubeLen = 440 * .66;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(wd.back, 0, 0);
          X.save(); X.globalAlpha = .55 + .4 * Math.sin(lt * 3.2); X.drawImage(wd.shaft, 0, 0); X.restore();   // the light shaft shimmers
          X.save(); X.fillStyle = WC.rgba(C.paperLight, .75);                                                     // dust drifting in the light
          for (let i = 0; i < 46; i++) { const u = WC.hash(i * 3.1 + 1), v = (WC.hash(i * 7.7 + 2) + lt * (.12 + .1 * WC.hash(i))) % 1;
            const y = 320 + v * 900, x = WC.mix(WC.mix(190, 380, u), WC.mix(530, 890, u), v) + Math.sin(lt * 1.3 + i) * 12;
            X.globalAlpha = Math.sin(v * PI) * .8; X.beginPath(); X.arc(x, y, 2.5 + 3 * WC.hash(i * 5.3), 0, TAU); X.fill(); }
          X.restore();
          if (doc) {
            const din = ss(seg(lt, 0, .5));
            WC.drawObj(X, doc, 0, 0, 1, { a: din });
            if (mode === 'tap') WC.drawObj(X, doc.hd, 0, 0, 1, { a: din });
          }
          X.drawImage(wd.front, 0, 0);
          const b0 = WC.timeOf(P.beat_at, cues, mode === 'rest' ? 0 : 99), k = beat(lt - b0), on = ss(seg(lt, b0 - .2, b0 + .4));
          if (on > 0) drawGlow(X, gl, cx, cy + 20 - 4 * Math.sin(lt * 1.6), 1 + .3 * Math.min(1, k) + .05 * Math.sin(lt * 1.6), on * (.45 + .55 * Math.min(1, k)));
          if (mode === 'rest') {
            // the tube lies across her chest, rocking very slightly as she breathes
            const t0 = WC.timeOf(P.at, cues, .1), p = seg(lt, t0, t0 + 1.1), rot = -.18 + Math.sin(lt * 1.3) * .03;
            WC.drawObj(X, tube, cx + Math.sin(rot) * 22, cy - 6 + Math.cos(rot) * 22 + Math.sin(lt * 1.1) * 2, p, { rot });
          }
          if (mode === 'tap') {
            const taps = P.taps || [.6, 1.5], w0 = WC.timeOf(P.withdraw, cues, 2.6), wdr = eio(seg(lt, w0, w0 + 1));
            let lift = 1; for (const t of taps) { const d = lt - t; if (d > -.2 && d < .35) lift = Math.min(lift, Math.abs(d < 0 ? d / .2 : d / .35)); }
            const hd = [WC.mix(cx + 30, 660, wdr), WC.mix(cy - 40 - lift * 22, 770, wdr)];
            const S = WC.withSeed(seed + 31, () => { const S = []; arm(S, [690, 600], [WC.mix(600, 700, wdr), WC.mix(760, 700, wdr)], hd, 'tap'); return S; });
            for (const s of S) WC.drawItem(X, s, 1, null, ss(seg(lt, 0, .5)));
            for (const t of taps) {
              const d = lt - t; if (d < 0 || d > .9) continue; const q = d / .9;
              X.save(); X.strokeStyle = WC.rgba(C.inkSoft, .5 * (1 - q)); X.lineWidth = 3;
              X.beginPath(); X.ellipse(cx, cy - 8, 16 + 40 * eo(q), 7 + 16 * eo(q), 0, 0, TAU); X.stroke(); X.restore();
            }
          }
          if (mode === 'listen') {
            // the tube comes down onto her chest; its top end is at his ear
            const down = eio(seg(lt, 0, .8)), bot = cy - 4 - (1 - down) * 40;
            const breathe = 3 * Math.sin(lt * 1.6);          // her chest rises and falls: the tube rides on it
            WC.drawObj(X, doc.hd, 0, 0, 1);
            WC.drawObj(X, tube, cx + 22, bot - tubeLen / 2 - 2 - breathe, 1, { rot: -PI / 2 });
            if (doc.er) WC.drawObj(X, doc.er, 0, 0, 1);      // his ear rests on the tube's top rim
            const S = WC.withSeed(seed + 41, () => { const S = []; arm(S, [660, 560], [610, 760], [cx + 22, bot - tubeLen * .45 - breathe], 'grip'); return S; });
            for (const s of S) WC.drawItem(X, s, 1, null, 1);
            if (on > 0) for (let i = 0; i < 2; i++) {
              const tt = lt - b0 - i * .28; if (tt < 0) continue;
              const ph = (tt % 1.05) / .7; if (ph > 1) continue;
              const y = WC.mix(bot - 20, bot - tubeLen + 20, eio(ph)), a = on * Math.sin(ph * PI) * (i ? .6 : .9);
              X.save(); X.strokeStyle = WC.rgba(C.red, a); X.lineWidth = 5; X.lineCap = 'round';
              for (const sd of [-1, 1]) { X.beginPath(); X.arc(cx, y, 40, sd > 0 ? -PI * .25 : PI * .75, sd > 0 ? PI * .25 : PI * 1.25); X.stroke(); }
              X.restore();
            }
          }
          if (doc) {   // the blush on his cheek slowly deepens
            const bl = (mode === 'tap' ? .5 : .3) + .5 * ss(seg(lt, 0, 4)) + .1 * Math.sin(lt * 1.2);
            X.save(); X.globalAlpha = Math.max(0, bl); X.fillStyle = WC.rgba(mixc(C.red, C.skin, .35), .45);
            X.beginPath(); X.ellipse(doc.cheek[0], doc.cheek[1], 17, 11, 0, 0, TAU); X.fill(); X.restore();
          }
          drawNotes(X, P, lt, cues, W, H);
        },
      };
    },
  };
  // let WC.drawObj take a doctor bundle (S + spr at stage coordinates)
  // (drawObj draws g.spr at translate(x, y) + spr.x0/y0, so a bundle built in stage coordinates is drawn at 0, 0)

  // ================================================================ shot: the beam, close: a pin scratching at the far end, a child's ear on the near end
  SHOTS.wc_steth_beam = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx);
      const gy = H * .52;
      const back = WC.withSeed(seed * 101 + 7, () => WC.backdrop(W, H, gy, { sky: P.sky || 'day', land: 'plain', sun: false, horizon: .52 }));
      const sk = WC.withSeed(seed + 2, () => { const sl = WC.make('skyline', .9, { style: 'medieval' }, seed + 2); return sl; });
      const beam = WC.make('timber_beam', 1.38, {}, seed + 5);
      const by = 1130, bx = 520;
      const pl = beam.parts.left, pr = beam.parts.right, pt = beam.parts.top;
      const topY = by + pt[1], leftX = bx + pl[0], rightX = bx + pr[0];
      const fgs = [WC.make('grass', 2.2, {}, seed + 8), WC.make('rock', 1.6, {}, seed + 9), WC.make('shrub', 1.5, {}, seed + 10)];
      // the listening child: kneeling behind the near (right) end, bent over, the cheek and ear on the wood
      const child = WC.withSeed(seed + 13, () => {
        const DX = -110, S = [], smock = mixc(C.cloth, C.paper, .3), smD = dark(smock, .3);
        // kneeling behind the near end, bent forward over it: shoulders, a rounded back, the hip going down behind the wood
        const Bd = spline([[905, topY - 60], [950, topY - 150], [1040, topY - 200], [1110, topY - 170], [1130, topY - 60], [1120, by], [930, by], [920, topY - 10]], true, 4);
        add(S, washShape(Bd, mixc(C.paperLight, smock, .2), .7, 1, 0));
        wsh(S, Bd, lite(smock, .25), .6, 3, 3); wsh(S, Bd, smock, .45, 3, 4);
        for (let k = 0; k < 4; k++) brush(S, WC.qcurve(960 + k * 40, topY - 170, 950 + k * 44, by, rnd(-20, 20), 6), 12, smD, { prof: 'leaf', nb: 5, a: .3 });
        brush(S, spline([[960, topY - 150], [1040, topY - 196], [1100, topY - 175]], false, 4), 12, lite(smock, .5), { prof: 'leaf', nb: 5, a: .45 });
        ink(S, spline([[905, topY - 60], [950, topY - 150], [1040, topY - 200], [1110, topY - 170]], false, 4), 1.8, { a: .65 });
        wsh(S, spline([[880, topY - 70], [930, topY - 110], [955, topY - 40], [910, topY - 20]], true, 3), mixc(C.paperLight, C.stone, .15), .85, 3, 1);   // collar
        const S2 = [];
        // an arm hugging the beam, the hand flat on the wood
        brush(S2, spline([[1010, topY - 120], [960, topY - 30], [880, topY + 8]], false, 4), 34, smock, { prof: 'even', nb: 5, a: .85 });
        wsh(S2, WC.blobPts(860, topY + 10, 22, 14, 12, .15), mixc(C.skin, C.wood, .05), .9, 3, .5);
        const ear = head(S2, 870, topY - 50, 74, { ang: -.85, kind: 'child', hair: mixc(C.wood, C.ink, .2), eye: 'closed' });
        xform(S, DX, 0); xform(S2, DX, 0); ear[0] += DX;
        return { S, S2, ear, spr: WC.sprite(S), spr2: WC.sprite(S2) };
      });
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          WC.drawObj(X, sk, W * .45, gy - 4, 1, { a: .55 });
          X.drawImage(child.spr.cv, child.spr.x0, child.spr.y0);
          WC.drawObj(X, beam, bx, by, 1);
          X.drawImage(child.spr2.cv, child.spr2.x0, child.spr2.y0);
          // the far end: a hand comes in from the left edge with a pin and scratches the wood
          const t0 = WC.timeOf(P.waves_at, cues, .6), ap = ss(seg(lt, t0 - .6, t0));
          const scr = lt > t0 ? Math.sin((lt - t0) * 10) * 12 : 0, hx = leftX + 110 + scr, hy = topY - 20;
          const S = WC.withSeed(seed + 51, () => { const S = []; const sk2 = mixc(C.skin, C.wood, .06), sl = mixc(C.clothB, C.paper, .25);
            brush(S, spline([[-60, hy - 220], [hx - 130, hy - 120], [hx - 36, hy - 34]], false, 5), 58, sl, { prof: 'even', nb: 6, a: .85 });
            wsh(S, WC.blobPts(hx - 14, hy - 20, 34, 24, 14, .15), sk2, .9, 3, .6);
            brush(S, [[hx - 4, hy - 30], [hx + 26, hy - 34]], 13, sk2, { prof: 'even', nb: 1, a: .9 });
            return S; });
          for (const s of S) WC.drawItem(X, s, 1, null, ap);
          if (ap > 0) { X.save(); X.globalAlpha = ap; X.strokeStyle = WC.rgba(C.ink, .9); X.lineWidth = 3; X.lineCap = 'round'; X.beginPath(); X.moveTo(hx + 14, hy - 30); X.lineTo(hx + 30, hy + 6); X.stroke();
            X.fillStyle = WC.rgba(C.gold, .9); X.beginPath(); X.arc(hx + 30, hy + 7, 4.5, 0, TAU); X.fill(); X.restore(); }
          // sound arcs running through the wood from the pin to the ear
          if (lt > t0) {
            const fy = by + beam.parts.center[1];
            X.save(); X.lineCap = 'round';
            for (let i = 0; i < 4; i++) {
              const ph = ((lt - t0) * .5 + i / 4) % 1, x = WC.mix(hx + 50, rightX - 30, ph), a = Math.sin(ph * PI) * .9 * ss(seg(lt, t0, t0 + .4));
              for (let j = 0; j < 2; j++) {
                const r = 22 + j * 20;
                X.strokeStyle = WC.rgba(j ? mixc(C.red, C.paperLight, .3) : C.red, a * (j ? .6 : .95)); X.lineWidth = j ? 4 : 6;
                X.beginPath(); X.arc(x, fy, r, -PI * .35, PI * .35); X.stroke();
              }
            }
            X.restore();
          }
          WC.drawObj(X, fgs[0], 120, H * .95, 1, { sk: .02 * Math.sin(lt * 1.2) });
          WC.drawObj(X, fgs[1], 930, H * .93, 1);
          WC.drawObj(X, fgs[2], 520, H * .9, 1, { sk: .01 * Math.sin(lt * 1.1 + 1) });
          drawNotes(X, P, lt, cues, W, H);
        },
      };
    },
  };

  // ================================================================ shot: rolling the sheet into a tube on the desk
  SHOTS.wc_steth_roll = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx);
      const y0 = 560, y1 = 1110, sx0 = 290, sx1 = 790;
      const desk = document.createElement('canvas'); desk.width = W; desk.height = H;
      WC.withSeed(seed * 5 + 2, () => {
        const c = desk.getContext('2d'), wd = mixc(C.wood, C.clothC, .25), fl = mixc(C.wood, C.ink, .3);
        // the desk top, its front edge low in the frame, the dark room below
        WC.wash(c, [[-20, -20], [W + 20, -20], [W + 20, 1420], [-20, 1420]], lite(wd, .3), .55, 3, 6);
        WC.wash(c, [[-20, -20], [W + 20, -20], [W + 20, 1420], [-20, 1420]], wd, .3, 3, 8);
        for (let k = 0; k < 22; k++) { const y = rnd(-20, 1400); WC.drawS(c, mk(WC.qcurve(-20, y, W + 20, y + rnd(-20, 20), rnd(-30, 30), 16), rnd(3, 8), dark(wd, .35), { prof: 'leaf', nb: 4, a: rnd(.12, .25) }), 1); }
        WC.blooms(c, 0, 0, W, 1400, dark(wd, .2), 8, .12);
        WC.wash(c, [[-20, 1400], [W + 20, 1410], [W + 20, 1470], [-20, 1462]], dark(wd, .3), .7, 3, 3);
        WC.wash(c, [[-20, 1462], [W + 20, 1470], [W + 20, H + 20], [-20, H + 20]], fl, .5, 3, 6);
        WC.blooms(c, 0, 1470, W, H, dark(fl, .2), 5, .14);
        WC.drawS(c, mk([[-20, 1404], [W + 20, 1412]], 3, C.ink, { prof: 'even', nb: 0, a: .5 }), 1);
        // an inkwell with a quill, top right
        WC.drawObj(c, WC.make('quill', 1.3, {}, seed + 6), 960, 330, 1);
      });
      const sheet = document.createElement('canvas'); sheet.width = W; sheet.height = H;
      WC.withSeed(seed * 5 + 3, () => {
        const c = sheet.getContext('2d');
        WC.wash(c, [[sx0 + 16, y0 + 18], [sx1 + 18, y0 + 18], [sx1 + 18, y1 + 20], [sx0 + 16, y1 + 20]], mixc(C.stoneDark, C.night, .3), .2, 3, 3);
        WC.wash(c, [[sx0, y0], [sx1, y0 + 4], [sx1 - 2, y1], [sx0 + 2, y1 - 2]], C.paperLight, .9, 4, 3);
        WC.wash(c, [[sx0 + 20, y0 + 30], [sx1 - 10, y0 + 20], [sx1 - 20, y1 - 10], [sx0 + 30, y1 - 30]], mixc(C.paperLight, C.stone, .3), .2, 3, 6);
        WC.blooms(c, sx0, y0, sx1, y1, mixc(C.stone, C.paper, .4), 6, .1);
        for (let y = y0 + 70; y < y1 - 30; y += 50) WC.drawS(c, mk([[sx0 + 30, y], [sx1 - 30, y + 2]], 1.6, mixc(C.blue, C.paper, .55), { prof: 'even', nb: 0, a: .28 }), 1);
        c.font = `600 36px ${WC.HANDF}`; c.fillStyle = WC.rgba(C.inkSoft, .6);
        ['Observation, 1816', 'jeune femme, le coeur', 'percussion : rien', ''].forEach((t, i) => c.fillText(t, sx0 + 44, y0 + 58 + i * 50));
        const S = []; ink(S, [[sx0, y0], [sx1, y0 + 4], [sx1 - 2, y1], [sx0 + 2, y1 - 2], [sx0, y0]], 1.6, { a: .45 });
        for (const s of S) WC.drawS(c, s, 1);
      });
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(desk, 0, 0);
          const t0 = WC.timeOf(P.at, cues, .3), f = eio(seg(lt, t0, t0 + (P.dur ?? 2.2)));
          // the sheet rolls up from its top edge toward us: the rolled edge moves down, the roll thickens
          const yr = WC.mix(y0, y1 - 60, f), r = 12 + 30 * Math.sqrt(f);
          X.save(); X.beginPath(); X.rect(0, yr, W, H); X.clip(); X.drawImage(sheet, 0, 0); X.restore();
          // the roll, painted: a pale wash, the shadow underneath, dry-brush light on top, the spiral at its end, loose ink
          const S = WC.withSeed(seed + 61, () => {
            const S = [], pc = paperC(), ps = paperS(), xa = sx0 - 6, xb = sx1 + 6;
            wsh(S, WC.blobPts((sx0 + sx1) / 2, yr + r + 6, (sx1 - sx0) / 2 + 10, r * .5 + 4, 24, .05), mixc(C.stoneDark, C.night, .3), .22, 3, 2);
            wsh(S, rect(xa, yr - r, xb, yr + r), lite(pc, .3), .95, 3, 1.2);
            wsh(S, rect(xa, yr + r * .15, xb, yr + r), ps, .45, 3, 1.2);
            wsh(S, rect(xa, yr + r * .6, xb, yr + r), dark(ps, .2), .3, 2, 1);
            brush(S, [[xa + 14, yr - r * .45], [(xa + xb) / 2, yr - r * .5], [xb - 14, yr - r * .45]], Math.max(4, r * .3), C.paperLight, { prof: 'leaf', nb: 5, a: .6 });
            ink(S, [[xa, yr - r], [xb, yr - r]], 1.8, { a: .7 });
            pool(S, [[xa, yr + r], [xb, yr + r]], dark(ps, .4), 2.6, .55);
            for (let k = 0; k < 3; k++) ink(S, ell(xa, yr, r * .3 * (1 - k * .3), r * (1 - k * .3), 0, TAU, 20), 1.1, { a: .5, gaps: 0, col: dark(ps, .3) });
            wsh(S, ell(xa, yr, r * .05 + 1.5, r * .14, 0, TAU, 10), C.ink, .6, 2, .3);
            // two short forearms in from the sides (elbows just off frame); the hands hold the roll's ends and follow it down
            arm(S, [-160, yr + 300], [-30, yr + 150], [sx0 - 22, yr + 6], 'grip', 1.5);
            arm(S, [W + 160, yr + 300], [W + 30, yr + 150], [sx1 + 22, yr + 6], 'grip', 1.5);
            return S;
          });
          const handIn = ss(seg(lt, 0, .5));
          for (const s of S) WC.drawItem(X, s, 1, null, handIn);
          drawNotes(X, P, lt, cues, W, H);
        },
      };
    },
  };
})();
