// wc_broadst — the Broad Street pump, Soho 1854 (Düşün Bakalım, 2026-11-28 02-broad-street-pompasi): John Snow's
// cholera inquiry. A Victorian cast-iron street pump (with or without its handle), the handle on its own, a gas
// street lamp, a glass of water, and four shots: Snow's street plan with the deaths stacked at the houses, the ground
// cut open under 40 Broad Street (cesspool, well, seepage), the handle coming off / going back, and the daily curve.
// Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9). Deterministic (WC.rnd / WC.hash), colours only from WC.C tokens.
//
// Objects (WC.G; origin = base centre on the ground, y up negative, sc 1 = natural size):
//   bs_pump     a cast-iron parish street pump ≈ 270 px: stone plinth, a tapered fluted column, collars, a domed cap with
//               a ball finial, a spout with a drip, a long curved handle on the left. o: {handle: true|false (only the
//               pivot boss), col: iron token, drip: true (live: a slow drop forming and falling from the spout)}
//               parts: handle (the grip), pivot, spout, cap, body, base
//   bs_handle   the pump handle alone, origin = its pivot (lies along +x→ -x like on the pump). parts: grip pivot
//   bs_gaslamp  a gas street lamp ≈ 330 px: iron post with a flared foot, a ladder bar, a glazed lantern and cap.
//               o: {lit: true (live: warm glow, slow flicker), h: ×}   parts: lantern post
//   bs_sick     a man curled up on a straw mattress, knees to his belly (cholera night). parts: head knees body
//   bs_glass    a plain tumbler of water ≈ 150 px. o: {cloudy: true (fine specks drifting in it)}   parts: water rim glass
//
// Shots:
//   wc_broadst_map      a painted street plan of the Broad Street quarter (schematic, after Snow's 1854 map).
//       params: {paint (s: the plan paints in, default .9), pump: {at} (the pump: red ring + "pompa"), deaths: {at, dur,
//       n (default 300), done: true (all there from the start)}, pumps: {at} (the other street pumps, small circles),
//       highlight: [{what: "workhouse"|"brewery", at, label}], ring: {at} (a red pen circle round the pump),
//       labels: true (street names), notes: [{text, x, y, ax?, ay?, at, color}], mist}
//   wc_broadst_section  the ground cut open in front of 40 Broad Street: the house front, the pump on the pavement, the
//       brick cesspool under the area and the brick well shaft under the pump. params: {pour: s | cue (a woman tips a
//       bucket of washing water into the cesspool grate), seep: s | cue (brown seepage creeps through the cracked
//       bricks into the well; the water at the bottom darkens), gap: s | cue (red double arrow between pit and shaft),
//       sky: "day"|"dusk", notes: [...] }
//   wc_broadst_handle   a wc_scene (sky, land, items, notes as in wc_scene) with the pump at pump.x; the handle comes off
//       (mode "off": at handle.at it lifts out of its pivot and is carried away to the left, fading) or goes back on
//       ("on") or just stays ("still"). params: wc_scene params + {pump: {x, s, at}, handle: {mode, at, dur}}
//   wc_broadst_curve    a hand-painted daily bar chart of fatal attacks, 31 Aug – 15 Sep 1854 (Snow 1855, table): bars
//       paint up one by one from at; on mark (s | cue) a red pen line at 8 Sep with a note. params: {at, mark, note,
//       title, values: [{d, v}] (override)}
'use strict';

(() => {
  const C = WC.C, { rnd, mk, qcurve, along, washShape, mixc, clamp, seg, ss, eio, eo, hash } = WC;
  const PI = Math.PI, TAU = PI * 2;

  // ------------------------------------------------------------ small painting kit (own copy, same recipes)
  const lite = (c, k = .4) => mixc(c, C.paperLight, k);
  const dark = (c, k = .35) => mixc(c, mixc(C.ink, C.night, .3), k);
  const tok = (v, fb) => (v ? WC.col(v) : fb);
  const iron = () => mixc(mixc(C.ink, C.night, .25), C.stoneDark, .3);
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
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
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const dot = (S, x, y, r, c = C.ink, a = .85) => { const s = mk([[x - r * .5, y], [x, y - r * .1], [x + r * .5, y]], r * 1.8, c, { prof: 'leaf', nb: 0, a, rough: .2 }); s.fine = true; S.push(s); return s; };
  function xform(S, dx, dy, parts) {
    const R = ([x, y]) => [x + dx, y + dy];
    for (const q of S) { if (q.poly) { q.poly = q.poly.map(r => r.map(R)); q.pts = q.pts.map(R); continue; } q.pts = q.pts.map(R); }
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
  // generator wrapper: lift the lowest point to y 0 (unless o.noLift), soft ground shadow, scale, parts
  function def(name, fn, opt = {}) {
    WC.G[name] = (sc = 1, o = {}) => {
      const r = fn(o) || {}, S = r.S || [];
      if (!opt.noLift) {
        let yb = -1e9;
        for (const q of S) { if (q.poly) { for (const p of q.pts) yb = Math.max(yb, p[1]); } else for (let i = 0; i < q.pts.length; i++) yb = Math.max(yb, q.pts[i][1] + q.ws[i] * .4); }
        const lift = yb > -1e8 && Math.abs(yb) > .5 ? -yb : 0;
        if (lift) xform(S, 0, lift, r.parts);
      }
      let pre = [];
      if (!opt.noLift && o.shadow !== false && r.sh !== false && S.length) {
        const b = WC.bbox(S, 0), w = b[2] - b[0], sc_ = mixc(C.stoneDark, C.night, .3);
        const [cx, rx, ry] = r.sh || [(b[0] + b[2]) / 2 + w * .05, w * .5, Math.max(5, Math.min(16, w * .055))];
        pre = [washShape(WC.blobPts(cx, -1, rx * 1.1, ry * 1.5, 30, .1), sc_, .12, 3, 3), washShape(WC.blobPts(cx + rx * .05, -1, rx * .8, ry * .7, 26, .08), sc_, .2, 3, 2)];
      }
      const all = pre.concat(S);
      scaleList(all, sc);
      const out = { S: all, parts: {} };
      if (r.parts) for (const k in r.parts) out.parts[k] = [r.parts[k][0] * sc, r.parts[k][1] * sc];
      if (r.live) out.live = (c, lt, it) => r.live(c, lt, it, sc);
      if (r.sway) out.sway = r.sway;
      return out;
    };
  }

  // ================================================================ pump
  // geometry shared by bs_pump and bs_handle (pump coords: base centre at 0, y up negative)
  const PIV = [-20, -186];                                  // the handle's pivot on the column
  function handleStrokes(S, ox, oy, irn) {
    // a long curved lever from the pivot out to the left and down, ending in a round grip
    const P = [[ox, oy], [ox - 40, oy + 4], [ox - 82, oy + 16], [ox - 116, oy + 38], [ox - 132, oy + 62]];
    const sp = along(P, 18);
    brush(S, sp, 11, irn, { prof: 'even', nb: 3, a: .9 });
    brush(S, sp.map(([x, y]) => [x + 1, y - 3]), 3, lite(irn, .45), { prof: 'leaf', nb: 0, a: .45 });
    ink(S, sp.map(([x, y]) => [x, y + 5]), 1.5, { a: .75, gaps: 0 });
    const g = [ox - 134, oy + 70], E = ell(g[0], g[1], 9, 12, 0, TAU, 16);
    wsh(S, E, irn, .8, 2, .3); inkC(S, E, 1.6, { a: .8, gaps: 0 });
    brush(S, [[g[0] - 3, g[1] - 6], [g[0] - 2, g[1] + 2]], 3, lite(irn, .5), { prof: 'leaf', nb: 0, a: .5 });
    return g;
  }
  def('bs_pump', o => {
    const S = [], irn = tok(o.col, iron()), st = mixc(C.stone, C.paper, .1);
    // stone plinth and a worn kerb slab
    const pl = rect(-40, 0, 40, -28);
    wsh(S, pl, st, .62, 3, .8); wsh(S, rect(-40, 0, 40, -8), dark(st, .25), .35, 2, .5);
    for (let k = 0; k < 4; k++) brush(S, qcurve(-34 + k * 18, -24, -26 + k * 18, -6, rnd(-3, 3), 4), rnd(4, 8), dark(st, .18), { prof: 'leaf', nb: 4, a: .22 });
    inkC(S, pl, 1.6, { a: .7 });
    // the column: tapered, a wash, vertical flutes, a lit edge on the left, shadow on the right
    const yb = -28, yt = -206, rb = 23, rt = 18;
    const body = [[-rb, yb], [rb, yb], [rt, yt], [-rt, yt]];
    wsh(S, body, irn, .78, 3, .6);
    wsh(S, [[rb * .25, yb], [rb, yb], [rt, yt], [rt * .25, yt]], dark(irn, .3), .45, 2, .4);
    for (let k = -3; k <= 3; k++) { const f = k / 3.6; brush(S, [[f * rb, yb - 10], [f * rt, yt + 10]], 2.2, k < 0 ? lite(irn, .35) : dark(irn, .25), { prof: 'even', nb: 0, a: k < 0 ? .4 : .35, rough: .3 }); }
    brush(S, [[-rb * .55, yb - 6], [-rt * .55, yt + 8]], 5, lite(irn, .55), { prof: 'leaf', nb: 2, a: .4 });
    // cast iron is never flat: mottled washes, dry-brush drags and a little rust bloom
    for (let k = 0; k < 9; k++) { const y = rnd(yt + 14, yb - 14), x = rnd(-.7, .7) * WC.mix(rt, rb, (y - yt) / (yb - yt)); wsh(S, WC.blobPts(x, y, rnd(5, 10), rnd(10, 22), 14, .3), k % 3 ? dark(irn, .2) : lite(irn, .3), rnd(.12, .25), 2, .8); }
    for (let k = 0; k < 7; k++) { const f = rnd(-.8, .8), y0 = rnd(yb - 60, yb - 10), y1 = rnd(yt + 10, yt + 70); brush(S, [[f * rb, y0], [f * rt + rnd(-2, 2), y1]], rnd(5, 9), k % 2 ? lite(irn, .4) : dark(irn, .25), { prof: 'leaf', nb: 7, a: .2, rough: .4 }); }
    for (let k = 0; k < 3; k++) wsh(S, WC.blobPts(rnd(-14, 14), rnd(-70, -40), rnd(4, 8), rnd(6, 12), 12, .35), mixc(C.roof, C.stoneDark, .4), .16, 2, .6);
    ink(S, [[rb, yb], [rt, yt]], 2.2, { a: .85 }); ink(S, [[-rb, yb], [-rt, yt]], 1.4, { a: .6 });
    // collars
    for (const [y, r, h] of [[yb, rb + 6, 12], [-120, 23, 7], [yt, rt + 8, 12]]) {
      const R = rect(-r, y, r, y - h);
      wsh(S, R, irn, .85, 2, .3); brush(S, [[-r + 3, y - h * .4], [r * .1, y - h * .4]], h * .35, lite(irn, .45), { prof: 'leaf', nb: 0, a: .4 }); inkC(S, R, 1.3, { a: .75 });
    }
    // domed cap + finial
    const cap = ell(0, yt - 12, rt + 10, 22, PI, TAU, 18).concat([[rt + 10, yt - 12]]);
    wsh(S, cap, irn, .85, 3, .4); brush(S, qcurve(-rt, yt - 20, -2, yt - 30, -4, 6), 5, lite(irn, .5), { prof: 'leaf', nb: 0, a: .45 });
    ink(S, ell(0, yt - 12, rt + 10, 22, PI * 1.05, TAU * .98, 14), 1.8, { a: .8, gaps: 0 });
    brush(S, [[0, yt - 34], [0, yt - 46]], 4, irn, { prof: 'even', nb: 0, a: .9 });
    const fin = ell(0, yt - 54, 9, 9, 0, TAU, 14); wsh(S, fin, irn, .9, 2, .3); inkC(S, fin, 1.4, { a: .8, gaps: 0 });
    dot(S, -3, yt - 57, 2.2, lite(irn, .6), .6);
    // spout: a short tube out to the right, turning down, a lion-mask boss behind it
    const boss = ell(14, -142, 12, 12, 0, TAU, 16); wsh(S, boss, irn, .9, 2, .3); inkC(S, boss, 1.3, { a: .7, gaps: 0 });
    const sp = [[18, -146], [40, -146], [58, -140], [66, -128], [67, -116]];
    brush(S, along(sp, 12), 12, irn, { prof: 'even', nb: 2, a: .92 });
    brush(S, along(sp, 12).map(([x, y]) => [x - 1, y - 3]), 3, lite(irn, .5), { prof: 'leaf', nb: 0, a: .45 });
    ink(S, along(sp, 12).map(([x, y]) => [x + 2, y + 5]), 1.4, { a: .7, gaps: 0 });
    const mouth = [67, -110];
    // pivot boss and the handle
    const pv = ell(PIV[0], PIV[1], 9, 9, 0, TAU, 14); wsh(S, pv, dark(irn, .2), .9, 2, .3); inkC(S, pv, 1.4, { a: .8, gaps: 0 });
    let grip = [PIV[0] - 4, PIV[1]];
    if (o.handle !== false) grip = handleStrokes(S, PIV[0], PIV[1], irn);
    // a small iron grate in the pavement under the spout
    const gr = rect(48, 0, 88, -6); wsh(S, gr, dark(irn, .1), .5, 2, .3); for (let k = 0; k < 4; k++) ink(S, [[52 + k * 10, -1], [52 + k * 10, -5]], .9, { a: .6, gaps: 0 });
    const parts = { handle: grip, pivot: PIV.slice(), spout: mouth, cap: [0, yt - 30], body: [0, -90], base: [0, -14] };
    const live = o.drip ? (c, lt, it, sc) => {
      const ph = (lt * .45) % 1, x = mouth[0] * sc, y0 = mouth[1] * sc;
      const grow = ss(seg(ph, 0, .6)), fall = seg(ph, .6, 1), y = y0 + 4 * sc + fall * fall * 100 * sc;
      c.fillStyle = WC.rgba(C.water, .75 * (1 - seg(ph, .92, 1))); c.beginPath(); c.ellipse(x, y, 3.2 * sc * (.5 + grow * .5), 4.4 * sc * (.5 + grow * .5), 0, 0, TAU); c.fill();
      c.fillStyle = WC.rgba(C.paperLight, .6 * (1 - seg(ph, .92, 1))); c.beginPath(); c.arc(x - 1 * sc, y - 1.2 * sc, 1.1 * sc, 0, TAU); c.fill();
    } : null;
    return { S, parts, live };
  });
  def('bs_handle', o => {
    const S = [], irn = tok(o.col, iron());
    const g = handleStrokes(S, 0, 0, irn);
    const pv = ell(0, 0, 7, 7, 0, TAU, 12); wsh(S, pv, dark(irn, .2), .9, 2, .3); inkC(S, pv, 1.2, { a: .8, gaps: 0 });
    return { S, parts: { grip: g, pivot: [0, 0] }, sh: false };
  }, { noLift: true });

  // ================================================================ gas lamp
  def('bs_gaslamp', o => {
    const S = [], irn = iron(), h = 330 * (o.h ?? 1), top = -h + 70;
    // flared foot
    const foot = [[-22, 0], [22, 0], [12, -26], [8, -60], [-8, -60], [-12, -26]];
    wsh(S, foot, irn, .85, 3, .5); ink(S, [[22, 0], [12, -26], [8, -60]], 1.8, { a: .8 });
    // post
    brush(S, [[0, -60], [0, top]], 10, irn, { prof: 'even', nb: 2, a: .92 });
    brush(S, [[-2.5, -64], [-2.5, top + 6]], 2.4, lite(irn, .45), { prof: 'leaf', nb: 0, a: .45 });
    ink(S, [[5, -60], [5, top]], 1.3, { a: .7, gaps: 0 });
    // ladder bar
    brush(S, [[-34, top + 26], [34, top + 26]], 6, irn, { prof: 'even', nb: 0, a: .9 }); ink(S, [[-34, top + 29], [34, top + 29]], 1, { a: .6, gaps: 0 });
    for (const sd of [-1, 1]) dot(S, sd * 34, top + 26, 3.4, irn, .9);
    // lantern: a glazed box wider at the top, a cap and finial
    const lb = top - 4, lt = top - 62, gl = [[-14, lb], [14, lb], [24, lt], [-24, lt]];
    wsh(S, gl, o.lit === false ? lite(C.sky, .2) : C.gold, o.lit === false ? .35 : .55, 3, .4);
    if (o.lit !== false) wsh(S, WC.blobPts(0, (lb + lt) / 2 + 6, 8, 12, 14, .2), lite(C.gold, .45), .6, 2, .5);
    for (const sd of [-1, 0, 1]) brush(S, [[sd * 14, lb], [sd * 24, lt]], 2.6, irn, { prof: 'even', nb: 0, a: .85 });
    brush(S, [[-16, lb], [16, lb]], 5, irn, { prof: 'even', nb: 0, a: .9 });
    const cap = [[-30, lt], [30, lt], [10, lt - 22], [-10, lt - 22]];
    wsh(S, cap, irn, .9, 2, .3); inkC(S, cap, 1.3, { a: .7 });
    brush(S, [[0, lt - 22], [0, lt - 36]], 4, irn, { prof: 'even', nb: 0, a: .9 });
    dot(S, 0, lt - 38, 4, irn, .9);
    const lc = [0, (lb + lt) / 2];
    const live = o.lit === false ? null : (c, t, it, sc) => {
      const f = .85 + .1 * Math.sin(t * 2.1 + (it?.ph || 0)) + .05 * Math.sin(t * 5.3);
      const x = lc[0] * sc, y = lc[1] * sc, r = 150 * sc * f;
      const g = c.createRadialGradient(x, y, 4 * sc, x, y, r);
      g.addColorStop(0, WC.rgba(C.gold, .42 * f)); g.addColorStop(.35, WC.rgba(C.gold, .16 * f)); g.addColorStop(1, WC.rgba(C.gold, 0));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.fillStyle = WC.rgba(lite(C.gold, .5), .7 * f); c.beginPath(); c.ellipse(x, y + 6 * sc, 5 * sc, 9 * sc * f, 0, 0, TAU); c.fill();
    };
    return { S, parts: { lantern: lc, post: [0, -h * .5] }, live };
  });

  // ================================================================ glass of water
  def('bs_glass', o => {
    const S = [], gl = lite(C.water, .55), wt = o.cloudy ? mixc(C.water, C.ground, .35) : C.water;
    const yb = 0, yt = -150, rb = 40, rt = 54, wl = -104;
    const at = (f, y) => WC.mix(rb, rt, (yb - y) / (yb - yt)) * f;
    const water = [[-rb, yb], [rb, yb], [at(1, wl), wl], [at(-1, wl), wl]];
    wsh(S, rect(-rb, yb, rb, yb - 1).concat([[at(1, yt), yt], [at(-1, yt), yt]]).slice(0, 2).concat([[at(1, yt), yt], [at(-1, yt), yt]]), gl, .22, 2, .4);
    wsh(S, water, wt, .5, 3, .5);
    wsh(S, ell(0, wl, at(1, wl), 7, 0, TAU, 22), lite(wt, .3), .45, 2, .3);
    if (o.cloudy) for (let k = 0; k < 26; k++) { const y = rnd(wl + 8, yb - 8), x = rnd(-.85, .85) * at(1, y); dot(S, x, y, rnd(1.2, 2.6), mixc(C.stoneDark, C.ground, .3), rnd(.35, .7)); }
    brush(S, [[-rb + 10, yb - 10], [at(-1, yt) + 12, yt + 14]], 6, C.paperLight, { prof: 'leaf', nb: 0, a: .55 });
    ink(S, [[-rb, yb], [at(-1, yt), yt]], 1.6, { a: .65 }); ink(S, [[rb, yb], [at(1, yt), yt]], 2, { a: .8 });
    ink(S, ell(0, yt, rt, 8, 0, TAU, 26), 1.4, { a: .65, gaps: 1 });
    ink(S, ell(0, yb, rb, 6, 0, PI, 14), 2, { a: .75, gaps: 0 });
    return { S, parts: { water: [0, (wl + yb) / 2], rim: [rt, yt], glass: [at(-1, -130), -130] } };
  });

  // ================================================================ a sick man curled on a straw mattress
  // bs_sick  ≈ 330 px long: a low straw mattress, a man on his side, knees pulled up to his belly, arms round them,
  //          head tucked, a rumpled blanket half off. live: slow, uneven breathing (a small lift of the shoulders).
  def('bs_sick', o => {
    // seen from the bedside: he lies on his left side facing us, head on a rolled pillow (right), knees drawn up in
    // front of his belly, the shins tucked back, one hand pressed flat on his stomach
    const S = [], straw = mixc(C.clothC, C.paper, .3), shirt = lite(C.stone, .45), trou = mixc(C.wood, C.ink, .35), sk = C.skin;
    const mat = [[-165, 0], [165, 0], [158, -26], [-160, -24]];
    wsh(S, mat, straw, .6, 3, 1.2); wsh(S, rect(-165, 0, 165, -8), dark(straw, .3), .35, 2, .6);
    for (let k = 0; k < 8; k++) brush(S, qcurve(-150 + k * 40, -5, -128 + k * 40, -20, rnd(-4, 4), 5), rnd(3, 5), dark(straw, .25), { prof: 'leaf', nb: 3, a: .28 });
    inkC(S, mat, 1.5, { a: .6 });
    const B = -26;
    const pil = WC.blobPts(128, B - 14, 34, 14, 18, .12); wsh(S, pil, lite(C.paper, .2), .75, 3, .6); ink(S, pil.slice(10, 18), 1.2, { a: .5 });
    // shins tucked back (behind), then the thighs drawn up in front of the belly
    brush(S, qcurve(8, B - 14, -78, B - 10, 4, 10), 22, dark(trou, .1), { prof: 'even', nb: 5, a: .85 });
    wsh(S, WC.blobPts(-86, B - 9, 13, 7, 12, .2), sk, .7, 2, .4);
    // torso on its side: shoulders right, hips left, back rounded along the top
    const tor = [[-62, B], [-66, B - 30], [-30, B - 56], [30, B - 64], [84, B - 56], [100, B - 30], [96, B]];
    wsh(S, tor, shirt, .78, 3, 1); patches(S, tor, dark(shirt, .15), 2, .14);
    for (let k = 0; k < 4; k++) brush(S, qcurve(-50 + k * 34, B - 50, -40 + k * 34, B - 8, rnd(-6, 6), 6), 5, dark(shirt, .25), { prof: 'leaf', nb: 3, a: .25 });
    ink(S, [[-66, B - 30], [-30, B - 56], [30, B - 64], [84, B - 56]], 1.8, { a: .7 });
    brush(S, qcurve(-58, B - 22, 22, B - 30, -6, 10), 30, trou, { prof: 'even', nb: 6, a: .9 });       // thigh, knee toward the belly
    const knee = WC.blobPts(26, B - 28, 16, 15, 14, .12); wsh(S, knee, trou, .85, 2, .4);
    ink(S, qcurve(-58, B - 8, 28, B - 14, -4, 10), 1.4, { a: .6 });
    // arm: shoulder down, the hand pressed on the stomach above the knee
    brush(S, qcurve(76, B - 52, 58, B - 30, 4, 8), 17, shirt, { prof: 'even', nb: 3, a: .85 });
    brush(S, qcurve(58, B - 30, 40, B - 46, -4, 6), 14, shirt, { prof: 'even', nb: 3, a: .85 });
    const hand = WC.blobPts(36, B - 48, 12, 8, 12, .18); wsh(S, hand, sk, .8, 2, .4); ink(S, hand.slice(0, 7), 1.1, { a: .55 });
    ink(S, qcurve(82, B - 46, 62, B - 22, 4, 8), 1.2, { a: .5 });
    // head on the pillow, face toward us, turned down in pain, dark hair
    const hd = WC.blobPts(122, B - 40, 22, 19, 18, .1);
    wsh(S, hd, sk, .78, 3, .5);
    wsh(S, WC.blobPts(128, B - 52, 21, 11, 14, .18), mixc(C.ink, C.wood, .45), .72, 2, .4);
    wsh(S, WC.blobPts(114, B - 34, 8, 5, 10, .2), dark(sk, .3), .3, 2, .3);
    brush(S, [[110, B - 42], [118, B - 41]], 2.2, C.ink, { prof: 'leaf', nb: 0, a: .7 });
    ink(S, hd.slice(6, 16), 1.4, { a: .55 });
    return { S, parts: { head: [122, B - 40], hand: [36, B - 48], knees: [26, B - 28], body: [20, B - 40] } };
  });
  function patches(S, P, c, n = 3, a = .12) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of P) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    for (let k = 0; k < n; k++) wsh(S, WC.blobPts(rnd(x0 + (x1 - x0) * .25, x1 - (x1 - x0) * .25), rnd(y0 + (y1 - y0) * .3, y1 - (y1 - y0) * .3), (x1 - x0) * .12, (y1 - y0) * .14, 14, .25), c, a, 2, .6);
  }

  // ------------------------------------------------------------ shared helpers
  const notesDraw = (X, W, H, lt, cues, list) => {
    for (const n of list || []) {
      const t0 = WC.timeOf(n.at, cues, 1.2), size = n.size || 44, col = n.color === 'red' ? C.red : C.ink;
      if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size, col, align: n.align, bend: n.bend });
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, t0, t0 + 1), { size, align: n.align || 'center', col });
    }
  };
  function paintReveal(X, img, W, H, rv) {
    if (rv >= 1) { X.drawImage(img, 0, 0); return; }
    if (rv <= 0) return;
    X.save(); X.beginPath(); const R = WC.mix(-150, W + 150, rv); X.moveTo(-10, -10);
    for (let y = -10; y <= H + 40; y += 40) X.lineTo(R + (WC.vnoise(y * .02) - .5) * 160, y);
    X.lineTo(-10, H + 10); X.closePath(); X.clip(); X.drawImage(img, 0, 0); X.restore();
  }
  const paperCanvas = (W, H) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); const pp = WC.paper(); if (pp) c.drawImage(pp, 0, 0); else { c.fillStyle = C.paper; c.fillRect(0, 0, W, H); } return [cv, c]; };

  // ================================================================ the street plan
  // stage coords for a 1920 × 1080 frame (scaled to W)
  const STREETS = [
    { name: 'Broad Street', pts: [[230, 520], [1720, 520]], w: 40, lab: [600, 520] },
    { name: 'Cambridge Street', pts: [[900, 120], [900, 520]], w: 30, lab: [900, 300], vert: true },
    { name: 'Poland Street', pts: [[420, 90], [420, 990]], w: 34, lab: [420, 720], vert: true },
    { name: 'Berwick Street', pts: [[1460, 90], [1460, 990]], w: 34, lab: [1460, 280], vert: true },
    { name: '', pts: [[660, 520], [660, 990]], w: 28 },
    { name: '', pts: [[230, 300], [1720, 300]], w: 28 },
    { name: '', pts: [[230, 790], [1720, 790]], w: 30 },
    { name: '', pts: [[1180, 120], [1180, 520]], w: 26 },
    { name: '', pts: [[1180, 790], [1180, 990]], w: 26 },
  ];
  const PUMP = [900, 545];
  const BLOCKS = { workhouse: [440, 322, 640, 496], brewery: [930, 412, 1120, 497], square: [770, 640, 1040, 770] };
  const OTHER_PUMPS = [[420, 270], [1460, 545], [660, 815], [1205, 790], [440, 950]];
  function mapBack(W, H, sc) {
    const [cv, c] = paperCanvas(W, H);
    const S = p => [p[0] * sc, p[1] * sc];
    // the built blocks: one warm wash over the whole quarter, streets painted back out of it as paper
    WC.wash(c, [[180, 60], [1770, 60], [1770, 1030], [180, 1030]].map(S), mixc(C.stone, C.paper, .35), .5, 3, 4);
    WC.blooms(c, 180 * sc, 60 * sc, 1770 * sc, 1030 * sc, C.stone, 10, .14);
    WC.granulate(c, 180 * sc, 60 * sc, 1770 * sc, 1030 * sc, C.stone, .5, .1);
    // Golden Square: a green
    const sq = BLOCKS.square; WC.wash(c, [[sq[0], sq[1]], [sq[2], sq[1]], [sq[2], sq[3]], [sq[0], sq[3]]].map(S), C.leaf, .38, 3, 3);
    for (let k = 0; k < 10; k++) { const x = WC.mix(sq[0] + 20, sq[2] - 20, hash(k * 3.3)) * sc, y = WC.mix(sq[1] + 18, sq[3] - 18, hash(k * 7.1)) * sc; WC.blob(c, x, y, 14 * sc, 10 * sc, C.leafDark, .25); }
    // streets: paper-coloured bands with soft ink kerbs
    for (const st of STREETS) {
      const [a, b] = st.pts.map(S), w = st.w * sc, vx = a[0] === b[0];
      const poly = vx ? [[a[0] - w / 2, a[1]], [a[0] + w / 2, a[1]], [b[0] + w / 2, b[1]], [b[0] - w / 2, b[1]]] : [[a[0], a[1] - w / 2], [b[0], b[1] - w / 2], [b[0], b[1] + w / 2], [a[0], a[1] + w / 2]];
      c.save(); c.beginPath(); poly.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip();
      const pp = WC.paper(); if (pp) c.drawImage(pp, 0, 0); c.globalAlpha = .25; c.fillStyle = C.paperLight; c.fill(); c.restore();
      for (const sd of [-1, 1]) {
        const off = sd * w / 2, line = vx ? [[a[0] + off, a[1]], [b[0] + off, b[1]]] : [[a[0], a[1] + off], [b[0], b[1] + off]];
        WC.drawS(c, mk(along(line, 30), 1.8 * Math.max(1, sc), C.inkSoft, { prof: 'even', nb: 0, a: .6, rough: .35 }));
      }
    }
    // house divisions: little ink ticks along the street fronts
    c.strokeStyle = WC.rgba(C.inkSoft, .35); c.lineWidth = 1.2;
    for (const st of STREETS) {
      const [a, b] = st.pts, vx = a[0] === b[0], L = vx ? b[1] - a[1] : b[0] - a[0], w = st.w;
      for (let s = 10; s < L; s += 24) for (const sd of [-1, 1]) {
        const off = sd * (w / 2 + 2), len = sd * 22;
        const p0 = vx ? [a[0] + off, a[1] + s] : [a[0] + s, a[1] + off], p1 = vx ? [p0[0] + len, p0[1]] : [p0[0], p0[1] + len];
        c.beginPath(); c.moveTo(p0[0] * sc, p0[1] * sc); c.lineTo(p1[0] * sc, p1[1] * sc); c.stroke();
      }
    }
    return cv;
  }
  // death marks: deterministic, weighted by distance to the pump, stacked outward from the house front
  function makeDeaths(n, seed) {
    return WC.withSeed(seed, () => {
      const slots = [];
      for (const st of STREETS) {
        const [a, b] = st.pts, vx = a[0] === b[0], L = vx ? b[1] - a[1] : b[0] - a[0];
        for (let s = 22; s < L - 10; s += 24) for (const sd of [-1, 1]) {
          const x = vx ? a[0] + sd * (st.w / 2 + 4) : a[0] + s, y = vx ? a[1] + s : a[1] + sd * (st.w / 2 + 4);
          const inB = k => { const B = BLOCKS[k]; return x > B[0] - 6 && x < B[2] + 6 && y > B[1] - 6 && y < B[3] + 6; };
          if (inB('brewery') || inB('workhouse') || inB('square')) continue;
          const d = Math.hypot(x - PUMP[0], y - PUMP[1]);
          slots.push({ x, y, vx, sd, w: Math.exp(-d / 210) + .015, k: 0 });
        }
      }
      const tot = slots.reduce((q, s) => q + s.w, 0), out = [];
      for (let i = 0; i < n; i++) {
        let r = rnd() * tot, s = slots[0];
        for (const q of slots) { r -= q.w; if (r <= 0) { s = q; break; } }
        const k = s.k++;
        out.push({ x: s.x + (s.vx ? s.sd * k * 5.2 : 0), y: s.y + (s.vx ? 0 : s.sd * k * 5.2), vx: s.vx, len: rnd(12, 17), o: rnd() });
      }
      // the workhouse: five
      const B = BLOCKS.workhouse;
      for (let k = 0; k < 5; k++) out.push({ x: B[0] + 8, y: B[1] + 30 + k * 30, vx: true, len: 14, o: rnd(), wh: true });
      out.sort((p, q) => p.o - q.o);
      return out;
    });
  }
  SHOTS.wc_broadst_map = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), sc = W / 1920;
      const back = WC.withSeed(seed * 17 + 3, () => mapBack(W, H, sc));
      const D = P.deaths ? makeDeaths(P.deaths.n ?? 300, 7331) : [];
      const S = p => [p[0] * sc, p[1] * sc];
      const pumpObj = WC.make('bs_pump', Math.round(.34 * sc * 100) / 100, { shadow: false }, 5);
      const hl = (P.highlight || []).map(h => ({ ...h, B: BLOCKS[h.what] }));
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear();
          const pd = P.paint ?? .9;
          paintReveal(X, back, W, H, pd ? eio(seg(lt, 0, pd)) : 1);
          // highlighted blocks
          for (const h of hl) {
            const t0 = WC.timeOf(h.at, cues, 1), k = ss(seg(lt, t0, t0 + 1));
            if (k <= 0 || !h.B) continue;
            const [x0, y0, x1, y1] = h.B.map(v => v * sc), colr = h.what === 'brewery' ? C.clothC : C.blue;
            X.save(); X.globalAlpha = k * .55; X.fillStyle = colr; X.beginPath();
            X.moveTo(x0, y0); X.lineTo(x1, y0 + 2 * sc); X.lineTo(x1 - 2 * sc, y1); X.lineTo(x0 + 1, y1 - 1); X.closePath(); X.fill(); X.restore();
            X.save(); X.strokeStyle = WC.rgba(C.ink, .8 * k); X.lineWidth = 2.4 * sc; X.setLineDash([]); X.strokeRect(x0, y0, x1 - x0, y1 - y0); X.restore();
            if (h.what === 'workhouse') {      // its own well: a small ring in the yard
              const cx = (x0 + x1) / 2 + 30 * sc, cy = (y0 + y1) / 2;
              X.save(); X.globalAlpha = k; X.strokeStyle = WC.rgba(C.ink, .85); X.lineWidth = 3 * sc; X.beginPath(); X.arc(cx, cy, 14 * sc, 0, TAU); X.stroke();
              X.fillStyle = WC.rgba(C.waterDeep, .8); X.beginPath(); X.arc(cx, cy, 9 * sc, 0, TAU); X.fill(); X.restore();
            }
            if (h.label) WC.hand(X, h.label, (x0 + x1) / 2, y0 - 26 * sc, seg(lt, t0 + .4, t0 + 1.4), { size: 40 * sc, align: 'center', col: C.ink });
          }
          // other pumps: small ink circles
          if (P.pumps) {
            const t0 = WC.timeOf(P.pumps.at, cues, 1);
            OTHER_PUMPS.forEach((p, i) => {
              const k = ss(seg(lt, t0 + i * .15, t0 + i * .15 + .5)); if (k <= 0) return;
              const [x, y] = S(p); X.save(); X.globalAlpha = k; X.strokeStyle = WC.rgba(C.ink, .85); X.lineWidth = 2.6 * sc; X.beginPath(); X.arc(x, y, 9 * sc, 0, TAU); X.stroke(); X.fillStyle = WC.rgba(C.inkSoft, .5); X.beginPath(); X.arc(x, y, 4 * sc, 0, TAU); X.fill(); X.restore();
            });
          }
          // deaths
          if (P.deaths) {
            const t0 = P.deaths.done ? -99 : WC.timeOf(P.deaths.at, cues, 1), d = P.deaths.dur ?? 4;
            const nShow = D.length * (P.deaths.done ? 1 : eo(seg(lt, t0, t0 + d)));
            for (let i = 0; i < D.length && i < nShow; i++) {
              const m = D[i], f = clamp(nShow - i), [x, y] = S([m.x, m.y]), L = m.len * sc * f, th = 3.6 * sc;
              X.fillStyle = WC.rgba(mixc(C.ink, C.night, .2), .88);
              if (m.vx) X.fillRect(x - th / 2, y - L / 2, th, L);
              else X.fillRect(x - L / 2, y - th / 2, L, th);
            }
          }
          // labels
          if (P.labels !== false) {
            const k = seg(lt, (pd || 0) * .6, (pd || 0) * .6 + 1.2);
            X.save(); X.font = WC.font(Math.round(30 * sc), 600, 'serif', true); X.textAlign = 'center'; X.textBaseline = 'middle';
            X.fillStyle = WC.rgba(C.inkSoft, .9 * k);
            for (const st of STREETS) if (st.name) {
              const [x, y] = S(st.lab);
              X.save(); X.translate(x, y); if (st.vert) X.rotate(-PI / 2); X.shadowColor = WC.rgba(C.paperLight, .9); X.shadowBlur = 6; X.fillText(st.name, 0, 0); X.restore();
            }
            const sq = BLOCKS.square; X.fillText('Golden Square', (sq[0] + sq[2]) / 2 * sc, (sq[1] + sq[3]) / 2 * sc);
            X.restore();
          }
          // the pump
          if (P.pump) {
            const t0 = WC.timeOf(P.pump.at, cues, 1.2), k = seg(lt, t0, t0 + 1);
            const [x, y] = S(PUMP);
            WC.drawObj(X, pumpObj, x, y + 18 * sc, k);
            if (k > 0) {
              X.save(); X.strokeStyle = WC.rgba(C.red, .9); X.lineWidth = 4 * sc; X.lineCap = 'round';
              const a1 = -PI / 2 + TAU * eio(seg(lt, t0 + .3, t0 + 1.2)); X.beginPath(); X.arc(x, y - 30 * sc, 64 * sc, -PI / 2, a1); X.stroke(); X.restore();
              if (P.pump.label !== false) WC.hand(X, P.pump.label || 'pompa', x + 78 * sc, y - 92 * sc, seg(lt, t0 + .8, t0 + 1.8), { size: 46 * sc, col: C.red });
            }
          }
          if (P.ring) {
            const t0 = WC.timeOf(P.ring.at, cues, 2), k = eio(seg(lt, t0, t0 + 1.6)); const [x, y] = S(PUMP);
            if (k > 0) { X.save(); X.strokeStyle = WC.rgba(C.red, .75); X.lineWidth = 3 * sc; X.setLineDash([14 * sc, 10 * sc]); X.beginPath(); X.ellipse(x, y - 10 * sc, (P.ring.r ?? 330) * sc, (P.ring.r ?? 330) * .8 * sc, 0, -PI / 2, -PI / 2 + TAU * k); X.stroke(); X.restore(); }
          }
          notesDraw(X, W, H, lt, cues, P.notes);
          if (P.mist != null) { const m0 = WC.timeOf(P.mist, cues, dur - 1.2); WC.mist(X, W, H, seg(lt, m0, m0 + 1.6)); }
        },
      };
    },
  };

  // ================================================================ the ground cut open
  SHOTS.wc_broadst_section = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), sc = W / 1920;
      const gy = H * .44, pitX = W * .43, pitW = 190 * sc, pitT = gy + 18 * sc, pitB = gy + 250 * sc;
      const shX = W * .66, shW = 130 * sc, shB = H * 1.02, wl = H * .80;
      const brick = mixc(C.roof, C.stone, .35), soil = mixc(C.ground, C.wood, .25), sludge = mixc(C.wood, mixc(C.ink, C.night, .2), .35);
      const back = WC.withSeed(seed * 23 + 9, () => {
        const [cv, c] = paperCanvas(W, H);
        // sky
        const g = c.createLinearGradient(0, 0, 0, gy); const warm = P.sky === 'dusk';
        g.addColorStop(0, WC.rgba(warm ? C.skyWarm : C.sky, .25)); g.addColorStop(1, WC.rgba(warm ? C.skyWarm : C.sky, .75)); c.fillStyle = g; c.fillRect(0, 0, W, gy);
        // the house front of No. 40 (left): brick wall, a door, two sash windows
        WC.wash(c, [[-20, -20], [W * .38, -20], [W * .38, gy], [-20, gy]], mixc(brick, C.paper, .2), .62, 3, 3);
        WC.blooms(c, 0, 0, W * .38, gy, brick, 7, .18);
        for (let r = 0, y = gy - 14 * sc; y > 0; r++, y -= 22 * sc) for (let x = (r % 2) * 30 * sc; x < W * .38; x += 60 * sc) { c.strokeStyle = WC.rgba(dark(brick, .3), .2); c.lineWidth = 1.2; c.strokeRect(x, y, 58 * sc, 20 * sc); }
        const door = [W * .2, gy - 230 * sc, W * .2 + 110 * sc, gy];
        WC.wash(c, [[door[0], door[1]], [door[2], door[1]], [door[2], door[3]], [door[0], door[3]]], mixc(C.clothB, C.ink, .25), .8, 3, 1.5);
        c.strokeStyle = WC.rgba(C.ink, .8); c.lineWidth = 2.4; c.strokeRect(door[0], door[1], door[2] - door[0], door[3] - door[1]);
        WC.serif(c, '40', (door[0] + door[2]) / 2, door[1] - 18 * sc, 1, { size: 44 * sc, col: C.ink });
        for (const wx of [W * .05, W * .29]) { const w0 = [wx, gy - 330 * sc, wx + 90 * sc, gy - 170 * sc]; WC.wash(c, [[w0[0], w0[1]], [w0[2], w0[1]], [w0[2], w0[3]], [w0[0], w0[3]]], mixc(C.night, C.sky, .4), .6, 3, 1); c.strokeStyle = WC.rgba(C.paperLight, .8); c.lineWidth = 4; c.strokeRect(w0[0], w0[1], w0[2] - w0[0], w0[3] - w0[1]); c.beginPath(); c.moveTo(w0[0], (w0[1] + w0[3]) / 2); c.lineTo(w0[2], (w0[1] + w0[3]) / 2); c.stroke(); }
        // the soil, cut open: layered washes, darker with depth, granulation, pebbles
        WC.wash(c, [[-20, gy], [W + 20, gy], [W + 20, H + 20], [-20, H + 20]], soil, .62, 3, 3);
        const dg = c.createLinearGradient(0, gy, 0, H); dg.addColorStop(0, WC.rgba(C.stoneDark, 0)); dg.addColorStop(1, WC.rgba(C.stoneDark, .45)); c.fillStyle = dg; c.fillRect(0, gy, W, H - gy);
        for (let i = 0; i < 4; i++) WC.softBand(c, -100, W + 100, gy + (80 + i * 120) * sc, 30 * sc, i % 2 ? C.stoneDark : C.ground, .18);
        WC.granulate(c, 0, gy, W, H, soil, 1, .16);
        for (let i = 0; i < 40; i++) WC.blob(c, WC.rnd(0, W), WC.rnd(gy + 30, H), WC.rnd(4, 10) * sc, WC.rnd(3, 6) * sc, C.stoneDark, .35);
        // pavement and kerb
        WC.wash(c, [[-20, gy - 10 * sc], [W + 20, gy - 10 * sc], [W + 20, gy + 14 * sc], [-20, gy + 14 * sc]], mixc(C.stone, C.paper, .2), .75, 3, 1);
        WC.drawS(c, mk(qcurve(-10, gy - 10 * sc, W + 10, gy - 10 * sc, 0, 24), 3, C.ink, { prof: 'even', nb: 3, a: .75, rough: .3 }));
        // the cesspool: a brick pit, sludge inside, a grate at the top
        const pit = [[pitX - pitW / 2, pitT], [pitX + pitW / 2, pitT], [pitX + pitW / 2, pitB], [pitX - pitW / 2, pitB]];
        WC.wash(c, pit, sludge, .78, 3, 1.5);
        WC.blooms(c, pitX - pitW / 2, pitT, pitX + pitW / 2, pitB, sludge, 4, .2);
        const bw = 22 * sc;
        for (const sd of [-1, 1]) for (let y = pitT, r = 0; y < pitB; y += 14 * sc, r++) { const x = pitX + sd * (pitW / 2 + bw / 2); c.fillStyle = WC.rgba(r % 2 ? brick : dark(brick, .15), .85); c.fillRect(x - bw / 2, y + 1, bw, 12 * sc); }
        for (let x = pitX - pitW / 2 - bw; x < pitX + pitW / 2 + bw; x += 30 * sc) { c.fillStyle = WC.rgba(dark(brick, .1), .85); c.fillRect(x, pitB + 1, 28 * sc, 13 * sc); }
        c.strokeStyle = WC.rgba(C.ink, .75); c.lineWidth = 2; c.strokeRect(pitX - pitW / 2 - bw, pitT, pitW + bw * 2, pitB - pitT + 14 * sc);
        // cracks in its right wall
        c.strokeStyle = WC.rgba(C.ink, .85); c.lineWidth = 2.2; c.beginPath();
        for (const y0 of [pitT + 60 * sc, pitT + 150 * sc]) { let x = pitX + pitW / 2, y = y0; c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += 6 * sc; y += (k % 2 ? -1 : 1) * 10 * sc; c.lineTo(x, y); } }
        c.stroke();
        // the grate in the area pavement
        c.fillStyle = WC.rgba(iron(), .9); c.fillRect(pitX - 50 * sc, gy - 12 * sc, 100 * sc, 8 * sc);
        // the well shaft: brick-lined, deep, water at the bottom, the pump's pipe going down
        WC.wash(c, [[shX - shW / 2, gy + 14 * sc], [shX + shW / 2, gy + 14 * sc], [shX + shW / 2, shB], [shX - shW / 2, shB]], mixc(C.night, C.stoneDark, .45), .55, 3, 1);
        for (const sd of [-1, 1]) for (let y = gy + 14 * sc, r = 0; y < shB; y += 14 * sc, r++) { const x = shX + sd * (shW / 2 + bw / 2); c.fillStyle = WC.rgba(r % 2 ? brick : dark(brick, .15), .85); c.fillRect(x - bw / 2, y + 1, bw, 12 * sc); }
        c.strokeStyle = WC.rgba(C.ink, .7); c.lineWidth = 2; c.beginPath(); for (const sd of [-1, 1]) { c.moveTo(shX + sd * (shW / 2 + bw), gy + 14 * sc); c.lineTo(shX + sd * (shW / 2 + bw), shB); } c.stroke();
        c.strokeStyle = WC.rgba(iron(), .9); c.lineWidth = 7 * sc; c.beginPath(); c.moveTo(shX, gy); c.lineTo(shX, wl + 60 * sc); c.stroke();
        return cv;
      });
      const pump = WC.make('bs_pump', Math.round(1.25 * sc * 100) / 100, { shadow: false }, seed + 3);
      const woman = WC.make('person', Math.round(1.6 * sc * 100) / 100, { pose: 'stand', dress: 'woman', face: 'right' }, seed + 4);
      const bucket = WC.make('bucket', Math.round(.36 * sc * 100) / 100, { shadow: false }, seed + 5);
      const bH = 150 * .36 * sc;
      const tendrils = WC.withSeed(seed + 77, () => Array.from({ length: 7 }, (_, i) => {
        const y0 = pitT + (40 + i * 28) * sc, y1 = wl - (10 + rnd(0, 120)) * sc;
        return mk(qcurve(pitX + pitW / 2 + 20 * sc, y0, shX - shW / 2 - 20 * sc, y1, rnd(-40, 40) * sc, 16), rnd(12, 22) * sc, dark(sludge, .25), { prof: 'leaf', nb: 6, a: .6 });
      }));
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          // water in the well: clean, darkening with the seepage
          const sp = P.seep != null ? eio(seg(lt, WC.timeOf(P.seep, cues, 1.5), WC.timeOf(P.seep, cues, 1.5) + 3)) : 0;
          const wc = mixc(C.water, sludge, sp * .6);
          X.fillStyle = WC.rgba(wc, .8); X.fillRect(shX - shW / 2, wl + Math.sin(lt * 1.2) * 2, shW, H - wl);
          X.strokeStyle = WC.rgba(C.paperLight, .5); X.lineWidth = 2; X.beginPath(); X.moveTo(shX - shW / 2 + 8, wl + 6 + Math.sin(lt * 1.2) * 2); X.lineTo(shX + shW / 2 - 8, wl + 8 + Math.sin(lt * 1.2 + 1) * 2); X.stroke();
          // seepage through the soil
          if (sp > 0) tendrils.forEach((s, i) => WC.drawS(X, s, clamp(sp * 1.3 - i * .05)));
          // the pump on the pavement over its shaft
          WC.drawObj(X, pump, shX, H * .44 - 8 * sc, 1);
          // the woman tipping the bucket into the grate
          if (P.pour != null) {
            const t0 = WC.timeOf(P.pour, cues, .8), tip = eio(seg(lt, t0, t0 + 1));
            const wx = pitX - 150 * sc, wy = gy - 8 * sc, hh = 170 * 1.6 * sc;
            WC.drawObj(X, woman, wx, wy, 1);
            const hx = wx + hh * .2, hy = wy - hh * .5;
            X.save(); X.translate(hx, hy); X.rotate(tip * 1.75);
            WC.drawObj(X, bucket, 0, bH * 1.25, 1); X.restore();
            if (tip > .7) {                        // the stream into the grate, then down into the pit
              const k = seg(lt, t0 + .7, t0 + 1.5), sx = hx + bH * .9 * Math.sin(tip * 1.75) * 0 + 30 * sc, sy = hy + 10 * sc;
              X.strokeStyle = WC.rgba(mixc(C.water, C.ground, .4), .8); X.lineWidth = 9 * sc; X.lineCap = 'round';
              X.beginPath(); X.moveTo(sx, sy); X.quadraticCurveTo(sx + 40 * sc, sy + 10 * sc, pitX - 20 * sc, WC.mix(sy, pitT + 60 * sc, k)); X.stroke();
              for (let d = 0; d < 6; d++) { const ph = (lt * 1.4 + d / 6) % 1; X.fillStyle = WC.rgba(mixc(C.water, C.ground, .4), .6 * (1 - ph)); X.beginPath(); X.arc(pitX - 20 * sc + Math.sin(d * 3) * 18 * sc, pitT + 40 * sc + ph * 120 * sc, 4 * sc, 0, TAU); X.fill(); }
            }
          }
          // the gap
          if (P.gap != null) {
            const t0 = WC.timeOf(P.gap, cues, 1), k = eio(seg(lt, t0, t0 + .9));
            const x0 = pitX + pitW / 2 + 26 * sc, x1 = shX - shW / 2 - 26 * sc, y = pitT + 110 * sc;
            if (k > 0) {
              X.save(); X.strokeStyle = WC.rgba(C.red, .92); X.fillStyle = WC.rgba(C.red, .92); X.lineWidth = 4 * sc; X.lineCap = 'round';
              const xm = WC.mix(x0, x1, k); X.beginPath(); X.moveTo(x0, y); X.lineTo(xm, y); X.stroke();
              const head = (x, d) => { X.beginPath(); X.moveTo(x, y); X.lineTo(x - d * 16 * sc, y - 10 * sc); X.lineTo(x - d * 16 * sc, y + 10 * sc); X.closePath(); X.fill(); };
              head(x0, -1); if (k >= 1) head(x1, 1);
              X.restore();
            }
          }
          notesDraw(X, W, H, lt, cues, P.notes);
          if (P.mist != null) { const m0 = WC.timeOf(P.mist, cues, dur - 1.2); WC.mist(X, W, H, seg(lt, m0, m0 + 1.6)); }
        },
      };
    },
  };

  // ================================================================ the handle off / on
  SHOTS.wc_broadst_handle = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx;
      const s = WC.scene(Object.assign({}, ctx, { P: Object.assign({}, P, { notes: [] }) })), X = s.X;
      const Pp = P.pump || {}, psc = Math.round((Pp.s ?? 1.6) * 100) / 100;
      const pump = WC.make('bs_pump', psc, { handle: false }, seed + 11);
      const handle = WC.make('bs_handle', psc, {}, seed + 12);
      const px = (Pp.x ?? .5) * W, py = s.gy + (Pp.dy ?? 0);
      const piv = [px + pump.parts.pivot[0], py + pump.parts.pivot[1]];
      const Hd = P.handle || {}, mode = Hd.mode || 'off';
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          s.update(lt, dur, cues);
          const pa = Pp.at ?? -1, pt = WC.timeOf(pa, cues, 0), pp = pa === -1 ? 1 : seg(lt, pt, pt + 1.3);
          WC.drawObj(X, pump, px, py, pp);
          const t0 = WC.timeOf(Hd.at, cues, 1.2), d = Hd.dur ?? 2.4;
          let f = mode === 'still' ? 0 : eio(seg(lt, t0, t0 + d));
          if (mode === 'on') f = 1 - f;
          // f 0 = on the pump; 0..0.25 lifted out, then carried away left and down, fading at the end
          const lift = ss(seg(f, 0, .25)), away = eio(seg(f, .2, 1));
          const hx = piv[0] - away * W * .42, hy = piv[1] - lift * 26 * psc + away * 140 * psc, rot = lift * -.25 + away * .5;
          const a = 1 - ss(seg(f, .75, 1));
          if (a > 0 && pp >= 1) WC.drawObj(X, handle, hx, hy, 1, { rot, a });
          notesDraw(X, W, H, lt, cues, P.notes);
        },
      };
    },
  };

  // ================================================================ the daily curve
  // fatal attacks per day (Snow, On the Mode of Communication of Cholera, 2nd ed. 1855, table of the Broad Street outbreak)
  const DAYS = [['31 Ağu', 56], ['1', 143], ['2', 116], ['3', 54], ['4', 46], ['5', 36], ['6', 20], ['7', 28], ['8 Eyl', 12], ['9', 11], ['10', 5], ['11', 5], ['12', 1], ['13', 3], ['14', 0], ['15', 1]];
  SHOTS.wc_broadst_curve = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, X = WC.canvas(ctx), sc = W / 1920;
      const vals = P.values ? P.values.map(v => [v.d, v.v]) : DAYS;
      const x0 = 300 * sc, x1 = 1620 * sc, yb = 820 * sc, yTop = 230 * sc, vmax = Math.max(...vals.map(v => v[1]));
      const bw = (x1 - x0) / vals.length;
      const bars = WC.withSeed(seed * 5 + 1, () => vals.map(([d, v], i) => {
        const x = x0 + bw * (i + .5), h = v / vmax * (yb - yTop);
        return { x, h, d, v, s: h > 2 ? mk(qcurve(x, yb, x + rnd(-2, 2), yb - h, rnd(-3, 3), 10), bw * .62, i === 8 ? C.inkSoft : mixc(C.stoneDark, C.ink, .3), { prof: 'even', nb: 6, a: .72, rough: .25 }) : null };
      }));
      const axis = WC.withSeed(seed + 2, () => mk(qcurve(x0 - 30 * sc, yb + 4, x1 + 30 * sc, yb + 6, 2, 24), 4 * sc, C.ink, { prof: 'even', nb: 3, a: .8 }));
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); const pp = WC.paper(); if (pp) X.drawImage(pp, 0, 0);
          if (P.title) WC.serif(X, P.title, W / 2, 140 * sc, seg(lt, 0, 1), { size: 54 * sc, italic: true, col: C.inkSoft });
          WC.drawS(X, axis, eio(seg(lt, 0, .8)));
          const t0 = WC.timeOf(P.at, cues, .4), step = (P.step ?? .16);
          bars.forEach((b, i) => {
            const k = eo(seg(lt, t0 + i * step, t0 + i * step + .6));
            if (b.s) WC.drawS(X, b.s, k);
            if (i % 2 === 0 || i === 8) WC.hand(X, b.d, b.x, yb + 44 * sc, seg(lt, t0 + i * step, t0 + i * step + .5), { size: 34 * sc, align: 'center', col: C.inkSoft });
            if ((i === 1 || i === 8) && k > .6) WC.hand(X, String(b.v), b.x, yb - b.h - 36 * sc, seg(lt, t0 + i * step + .3, t0 + i * step + 1.1), { size: 52 * sc, align: 'center', col: C.ink, w: 700 });
          });
          if (P.mark != null) {
            const m0 = WC.timeOf(P.mark, cues, 3), k = eio(seg(lt, m0, m0 + .8)), b = bars[8];
            if (k > 0) {
              X.save(); X.strokeStyle = WC.rgba(C.red, .9); X.lineWidth = 4 * sc; X.lineCap = 'round'; X.setLineDash([16 * sc, 10 * sc]);
              const x = b.x - bw * .5; X.beginPath(); X.moveTo(x, yb + 10 * sc); X.lineTo(x, WC.mix(yb, yTop - 20 * sc, k)); X.stroke(); X.restore();
              WC.hand(X, P.note || 'kol söküldü', b.x - bw * .5 + 18 * sc, yTop + 10 * sc, seg(lt, m0 + .5, m0 + 1.5), { size: 48 * sc, col: C.red });
            }
          }
        },
      };
    },
  };
})();
