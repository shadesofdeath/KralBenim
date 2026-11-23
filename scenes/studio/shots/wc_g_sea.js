// wc_g_sea — watercolour ships, the sea, weather and disasters for WC.G (same contract as the nature generators in
// wc__lib.js: local coordinates, y negative up, the stroke list is painted in in order, `live` is drawn every frame
// in local coordinates and is a pure function of lt).
//
// SHIPS. Origin = centre of the waterline, bow toward +x (the item's "flip" sails it to the left), sc 1 ≈ 320 px long.
// The whole hull is built, then everything below the waterline is cut away, so a listing or sinking ship really sits
// in the water (a sinking one shows its drowned part as a pale underwater wash). Options for every ship:
//   flag     true (default for the big ships) | false | 'red' | 'blue' | any colour token       waving, live
//   wind     'left' | 'right': every flag streams that way on screen whichever way the ship faces (default: aft)
//   damage   true: a broken mast, torn sails, broken oars, a slight list (warships: shot holes)
//   burning  true: live flames and smoke on deck, charred hull, scorched sails
//   sink     0..1: how far it lies in the water (0 afloat, .5 half under, 1 only one end sticking out)
//   bow      'down' (default, like Titanic) | 'up': which end goes under first
// galley     Mediterranean war galley. style 'ottoman' (kadırga: long low hull with a spur, ~25 oars a side, two
//            lateen sails, red awning over the stern, stern lantern(s), red crescent flags and long streamers) |
//            'venetian' (blue awning, gilded stern, red-and-gold banners). oars: n · row: true (the oars sweep,
//            live) · sails: 'full' | 'furled' · lanterns: 1 | 3 (a flagship)
// carrack    15th–16th c. carrack: high fore- and aftcastle, square courses and topsails, lateen mizzen(s).
//            masts: 3 | 4 · cross: true (red cross on the courses) · sails: 'full' | 'furled'
// caravel    lateen-rigged caravel (caravela latina). masts: 2 | 3 · cross: true (red cross on the sails)
// frigate    18th–19th c. frigate: 3 masts, ochre gun-deck stripe with ports. sails: 'full' (default) | 'furled'
// steamship  style 'liner' (Titanic era: black hull, white decks, 4 buff funnels, the fourth a dummy, red bottom) |
//            'cargo' | 'paddle' (side-wheeler) | 'warship' (dreadnought). smoke: false | true (default: a trail of
//            funnel smoke while afloat, none once sink ≥ .3) · lights: true (lit windows and portholes, for night)
// rowboat    small wooden boat. rowers: 0..3 (default 2)
// raft       log raft with a patched square sail. sail: false · people: 0..4 (default 2)
// sailboat   small fishing boat. rig: 'sloop' | 'lateen' · sail: 'cream' | 'red' (tanned sails)
// submarine  WW-era submarine; sink lowers it straight down (.5 decks awash, 1 only the periscope); the hull under
//            the water is always shown as a pale wash
//
// Fire (ships, burning, explosion) is painted with pre-built dry-brush flame tongues that flicker by blending
// variants; smoke, ash and steam are soft wet-in-wet puffs. Everything live is a pure function of lt.
//
// SEA AND LAND (origin = where it meets the water / ground)
// wave       a big breaking wave curling to the right; h: height × (sc 1 ≈ 300 px tall, 620 wide); live spray
// iceberg    an iceberg with its far bigger underwater part as a pale wash. w, h: ×  (sc 1 ≈ 300 × 210 px)
// island     a rocky island with trees. w: width × (sc 1 ≈ 420 px) · h: cliff height × · trees: n (default 3) ·
//            tree: 'pine' | 'cypress' | 'palm' | 'tree'
// whale      a humpback. pose: 'tail' (fluke raised, water streaming off: live) | 'breach' | 'back' (blowing: live spout)
//
// WEATHER AND DISASTERS (live, deterministic in lt; "start" = the moment the item has finished painting in, i.e.
// a numeric item `at` + its paint time; or set o.at = scene seconds. A cue-name `at` cannot be seen from `live`, so
// those start at wc_scene's default time.)
// volcano       a volcanic cone. w, h: × (sc 1 ≈ 600 × 300 px) · erupt: true (default: ash column, glowing crater,
//               lava bombs and lava flows creeping down from start) | false (a thin steam plume) · ash: column height ×
// lightning     a bolt from a cloud base h above the origin down to it, flashing at intervals. h: × (sc 1 ≈ 700 px)
//               · every: seconds between flashes (default 2.4) · branches: n (default 3)
// explosion     a burst of fire and smoke from start, then debris falls and it settles into a smoke column. size: ×
// cannon_smoke  gun smoke: muzzle flash + puffs drifting. n: guns spread over w (× 300 px) · every: s (default 3.2) ·
//               dir: 1 | -1 (which way the guns fire). Give it a y at or below the ship's so it is drawn in front.
// burning       flames along a width: a city or a field on fire. w: × (sc 1 ≈ 400 px) · h: flame height × ·
//               style: 'city' (rubble, tall flames) | 'field' (stubble, lower flames) · drift: smoke lean
//               (place it in front of / among the houses it burns; a second one higher up sets the roofs alight)
// tornado       a swirling funnel from a cloud base to the ground with a debris cloud. h, w: × (sc 1 ≈ 640 px tall)
// flood         a muddy water band rising from start. w: × (sc 1 ≈ 600 px) · h: level × (≈ 110 px) · rise: s (default 5)
// quake_crack   a fissure across the ground with branching cracks and rubble; live dust. w: × (≈ 520 px) · open: ×
'use strict';

(() => {
  const C = WC.C, PI = Math.PI;
  const { rnd, pick, mk, washShape, inkLine, qcurve, qctrl, polar, along, mixc, shades, clamp, hash, seg, ss, eo, drawS } = WC;
  const rgba = WC.rgba, mix = WC.mix, G = WC.G;
  const plen = P => { let L = 0; for (let i = 1; i < P.length; i++) L += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); return L; };
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const MAST = () => mixc(C.wood, C.ink, .25);
  const SAIL = () => mixc(C.paperLight, C.clothC, .2);
  const FOAM = () => mixc(C.paperLight, C.water, .08);
  const flagCol = (o, d) => typeof o.flag === 'string' ? (o.flag === 'red' ? C.red : o.flag === 'blue' ? C.blue : C[o.flag] || d || C.red) : (d || C.red);
  // translate a stroke list (to place another generator's object inside this one)
  const shiftS = (S, dx, dy) => S.map(s => s.poly
    ? Object.assign({}, s, { poly: s.poly.map(r => r.map(([x, y]) => [x + dx, y + dy])), pts: s.pts.map(([x, y]) => [x + dx, y + dy]) })
    : Object.assign({}, s, { pts: s.pts.map(([x, y]) => [x + dx, y + dy]) }));

  // ---------------------------------------------------------------- clipping at the waterline (y = lim)
  function clipPoly(P, lim = 0, below = false) {
    const ins = p => below ? p[1] >= lim : p[1] <= lim, out = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], ia = ins(a), ib = ins(b);
      if (ia) out.push(a);
      if (ia !== ib) { const t = (lim - a[1]) / (b[1] - a[1]); out.push([a[0] + (b[0] - a[0]) * t, lim]); }
    }
    return out;
  }
  function clipRuns(P, lim = 0) {
    const runs = []; let cur = null;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], ia = a[1] <= lim;
      if (i) {
        const b = P[i - 1], ib = b[1] <= lim;
        if (ia !== ib) {
          const t = (lim - b[1]) / (a[1] - b[1]), q = [b[0] + (a[0] - b[0]) * t, lim];
          if (ib) { cur.push(q); runs.push(cur); cur = null; } else cur = [q];
        }
      }
      if (ia) { if (!cur) cur = []; cur.push(a); }
    }
    if (cur) runs.push(cur);
    return runs.filter(r => r.length >= 2);
  }

  // ---------------------------------------------------------------- live helpers
  // alpha of the item's layer; floating things: wc_scene rocks them (bob) but calls live without that rotation,
  // so match it here and flags stay on their masts
  function begin(c, it, lt, floats) {
    if (!it || typeof it !== 'object') return;
    c.globalAlpha = (it.a ?? 1) * (it.L && it.L.a != null ? it.L.a : 1);
    if (!floats) return;
    const ph = it.ph || 0, by = Math.sin(lt * 1.3 + ph) * 4, d = c.getTransform().f - it.y;
    const still = Math.abs(d) < .02 && Math.abs(by) > .2;
    const rot = still ? (it.rot || 0) : Math.sin(lt * 1.1 + ph) * .012;
    if (rot) c.rotate(it.flip ? -rot : rot);
  }
  // scene time at which the item's live part starts (it has finished painting in)
  function startOf(c, it, o, nS) {
    if (o.at != null) return +o.at;
    if (!it || typeof it !== 'object') return 0;
    if (it.t1 != null) return it.t1;
    if (it.at === -1) return 0;
    const W = c.canvas ? c.canvas.width : 1920;
    const t0 = typeof it.at === 'number' ? it.at : .15 + clamp(it.x / W) * .7;
    return t0 + (it.paint ?? (nS > 80 ? 1.3 : .9));
  }
  const ikOf = it => (it && typeof it === 'object' ? (it.k || 0) : 0);
  function glow(c, x, y, r, colr, a) {
    if (r <= 0 || a <= 0) return;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(colr, a)); g.addColorStop(.45, rgba(colr, a * .45)); g.addColorStop(1, rgba(colr, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  }
  // a soft wet-in-wet puff of pigment (smoke, ash, steam, spray): flat in the middle, bleeding out at the edge
  function puff(c, x, y, r, colr, a) {
    if (a <= .004 || r < .5) return;
    const g = c.createRadialGradient(x - r * .15, y - r * .2, r * .1, x, y, r);
    g.addColorStop(0, rgba(colr, a)); g.addColorStop(.6, rgba(colr, a * .72)); g.addColorStop(.86, rgba(colr, a * .3)); g.addColorStop(1, rgba(colr, 0));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  }
  // a rising column of smoke made of soft puffs (deterministic in lt); drift > 0 leans it to +x
  function column(c, x, y, h, lt, i, a = .4, drift = 1, colr = C.smoke) {
    for (let k = 0; k < 11; k++) {
      const q = (lt * .15 + k / 11 + hash(i * 7 + k) * .08) % 1, yy = y - q * h;
      const xx = x + Math.sin(q * 3 + i + k) * h * .05 + q * q * h * .45 * drift, r = h * (.07 + q * .2) * (.8 + hash(k + i) * .4);
      puff(c, xx, yy, r, k % 3 ? colr : mixc(colr, C.ink, .2), a * Math.pow(Math.sin(PI * q), .8));
    }
  }
  // the smoke trail of a moving steamer: puffs streaming aft (-x) from a funnel top
  function trail(c, x, y, h, lt, i, a = .42, colr = C.smoke) {
    for (let m = 0; m < 18; m++) {
      const q = (lt * .2 + m / 18 + hash(i * 5 + m) * .03) % 1;
      const xx = x - q * h * 1.15 + Math.sin(q * 4 + m) * h * .02, yy = y - q * h * .3 - Math.sin(q * PI) * h * .08;
      puff(c, xx, yy, h * (.035 + q * .16), colr, a * Math.pow(1 - q, 1.1) * Math.min(1, q * 10));
    }
  }
  // fire: tongues painted once with dry-brush bristles (3 pigments each), then flickered by blending between
  // variants and swaying; deterministic in lt, cheap (pre-built strokes)
  let TONG = null;
  const tongues = () => TONG || (TONG = WC.withSeed(90210, () => Array.from({ length: 5 }, () => {
    const bend = rnd(-16, 16), lean = rnd(-12, 12), pts = qctrl(0, 0, bend, -55, lean, -100, 10);
    return [[C.fire, 1, .62, 4], [mixc(C.fire, C.gold, .5), .6, .72, 3], [C.gold, .3, .88, 0]].map(([colr, wf, a, nb], L) =>
      mk(pts.map(([x, y]) => [x * (1 - L * .25), y * (1 - L * .22)]), 38 * wf, colr, { prof: 'tip', nb, a, rough: .4 }));
  })));
  function tongue(c, x, y, h, lt, i, a = 1) {
    if (h < 2 || a <= 0) return;
    const T = tongues(), u = lt * 2.3 + i * .61, k0 = Math.floor(u), f = u - k0, s = h / 100;
    for (const [v, al] of [[k0, 1 - f], [k0 + 1, f]]) {
      const set = T[((v + i * 3) % 5 + 5) % 5];
      c.save(); c.translate(x, y); c.transform(1, 0, Math.sin(lt * 3.1 + i) * .16, 1, 0, 0);
      c.scale(s * (.9 + .1 * Math.sin(lt * 5 + i)), s * (.9 + .14 * Math.sin(lt * 6.3 + i * 2)));
      for (const st of set) drawS(c, st, 1, null, al * a);
      c.restore();
    }
  }
  // a polygon with a point every `step` units, so a jittered wash gets an organic edge
  function densify(P, step) {
    const out = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (let k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  }
  // dry-brush rows across a polygon (dir 'h' or 'v'): polylines for parallel strokes, ends broken a little
  function spans(P, y) {
    const xs = [];
    for (let i = 0; i < P.length; i++) { const [x0, y0] = P[i], [x1, y1] = P[(i + 1) % P.length]; if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) xs.push(x0 + (y - y0) / (y1 - y0) * (x1 - x0)); }
    xs.sort((a, b) => a - b);
    const out = []; for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
    return out;
  }
  function rowsOf(P, o = {}) {
    const v = o.dir === 'v', Q = v ? P.map(([x, y]) => [y, x]) : P, out = [];
    let y0 = 1e9, y1 = -1e9; for (const p of Q) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    const gap = o.gap ?? 8;
    for (let y = y0 + gap * .5; y < y1 - gap * .2; y += gap * rnd(.85, 1.15)) for (const [a, b] of spans(Q, y)) {
      let xa = a + 1, xb = b - 1; const L = xb - xa; xa += rnd(0, L * (o.broken ?? .12)); xb -= rnd(0, L * (o.broken ?? .12));
      if (xb - xa < 4) continue;
      const pp = qcurve(xa, y, xb, y + rnd(-.2, .2) * gap, (o.bend ?? 0) + rnd(-.3, .3) * gap, Math.max(4, Math.min(14, Math.round((xb - xa) / 10))));
      out.push(v ? pp.map(([x, yy]) => [yy, x]) : pp);
    }
    return out;
  }
  function drawFlag(c, f, lt, i) {
    const n = 8, top = [], bot = [], pen = f.kind === 'pennant', dir = f.dir || 1;
    for (let k = 0; k <= n; k++) {
      const s = k / n, wv = Math.sin(lt * 4.3 - s * 5.5 + i * 1.9) * f.h * .22 * s + Math.sin(lt * 7.3 - s * 9 + i) * f.h * .06 * s;
      const cy = f.y + f.h / 2 + wv + s * s * f.h * .1, hh = pen ? f.h / 2 * (1 - s * .9) : f.h / 2 * (1 - s * .07);
      top.push([f.x - s * f.w * dir, cy - hh]); bot.push([f.x - s * f.w * dir, cy + hh]);
    }
    c.beginPath(); top.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y));
    for (let k = n; k >= 0; k--) c.lineTo(bot[k][0], bot[k][1]);
    c.closePath(); c.fillStyle = rgba(f.col, .8); c.fill();
    // folds: the cloth darkens where it turns away
    const dk = mixc(f.col, C.ink, .35);
    for (let k = 0; k < n; k++) {
      const s = (k + .5) / n, sh = Math.cos(lt * 4.3 - s * 5.5 + i * 1.9) * s;
      if (sh <= .15) continue;
      c.beginPath(); c.moveTo(top[k][0], top[k][1]); c.lineTo(top[k + 1][0], top[k + 1][1]); c.lineTo(bot[k + 1][0], bot[k + 1][1]); c.lineTo(bot[k][0], bot[k][1]); c.closePath();
      c.fillStyle = rgba(dk, sh * .3); c.fill();
    }
    if (f.cres || f.emb) {
      const cx = (top[3][0] + top[4][0]) / 2, cy = (top[3][1] + bot[3][1] + top[4][1] + bot[4][1]) / 4, r = f.h * .27;
      if (f.cres) {      // the crescent, opening toward the fly
        c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.clip();
        c.beginPath(); c.arc(cx, cy, r, 0, 7); c.moveTo(cx - r * .3 * dir + r * .8, cy); c.arc(cx - r * .3 * dir, cy, r * .8, 0, 7);
        c.fillStyle = rgba(C.paperLight, .92); c.fill('evenodd'); c.restore();
      } else { c.beginPath(); c.arc(cx, cy, r * .85, 0, 7); c.fillStyle = rgba(C.gold, .9); c.fill(); }
    }
  }

  // ---------------------------------------------------------------- the ship kit
  // geometry is written in "ship units" (sc 1); the kit scales it, lists/sinks it (rotation about the waterline
  // centre + lowering) and cuts it at the waterline. cfg: maxA (tilt at sink 1), depth (lowering at sink 1), ghost
  function kit(sc, o, cfg = {}) {
    const S = [], ghost = [], fx = { flags: [], fires: [], lamps: [], funnels: [], oars: [] };
    const sink = clamp(+o.sink || 0), sgn = o.bow === 'up' ? -1 : 1;
    const a = sgn * ((o.damage ? .045 : 0) + ss(sink) * (cfg.maxA ?? .62)), dy = (o.damage ? 3 : 0) + sink * (cfg.depth ?? 55);
    const ca = Math.cos(a), sa = Math.sin(a);
    const T = p => [(p[0] * ca - p[1] * sa) * sc, (p[0] * sa + p[1] * ca + dy) * sc];
    const showGhost = cfg.ghost || sink > .02;
    let wl = null;
    const k = {
      S, fx, sc, sink, T, a,
      // a translucent wash (hull, cloth, deckhouse), cut at the waterline
      wash(P, colr, al = .6, passes = 3, jit = 1.6) {
        const Q = densify(P, 9).map(T), up = clipPoly(Q);
        if (up.length >= 3) S.push(washShape(up, colr, al, passes, jit * sc));
        return Q;
      },
      // dry-brush strokes across a ship-space polygon in one pigment (visible brushwork instead of a flat fill)
      rows(P, colr, o = {}) { for (const pts of rowsOf(P, o)) k.line(pts, o.w ?? 5, colr, { prof: o.prof || 'even', nb: o.nb ?? 4, a: (o.a ?? .2) * rnd(.75, 1.2), rough: .4 }); },
      // planking along the sheer: strokes in the hull's pigment, a little heavier toward the waterline
      planks(sheer, x0, x1, d0, d1, colr, n = 5, w = 4.5) {
        for (let i = 0; i < n; i++) { const d = mix(d0, d1, (i + rnd(.2, .8)) / n); k.line(sheer(x0 + rnd(0, 18), x1 - rnd(0, 18), d, 14), w * rnd(.8, 1.2), colr, { prof: 'even', nb: 4, a: rnd(.14, .24) + .12 * i / n, rough: .45 }); }
      },
      // register a hull outline: where it meets the water (shadow, foam) and its drowned part (pale wash)
      water(P) {
        const Q = P.map(T);
        for (let i = 0; i < Q.length; i++) {
          const p = Q[i], q = Q[(i + 1) % Q.length];
          if ((p[1] <= 0) !== (q[1] <= 0)) { const t = -p[1] / (q[1] - p[1]), x = p[0] + (q[0] - p[0]) * t; wl = wl ? [Math.min(wl[0], x), Math.max(wl[1], x)] : [x, x]; }
        }
        if (showGhost) { const dn = clipPoly(Q, 0, true); if (dn.length >= 3) ghost.push(dn); }
      },
      // a brush stroke (width in ship units), cut at the waterline
      line(P, w, colr, opt = {}) {
        const Q = P.map(T), L0 = plen(Q) || 1;
        for (const r of clipRuns(Q)) {
          const L = plen(r); if (L < 1.2 * sc) continue;
          const pts = r.length === Q.length ? r : along(r, Math.max(3, Math.round((P.length - 1) * L / L0)));
          S.push(mk(pts, w * sc, colr, opt));
        }
      },
      ink(P, w = 1.4, colr = C.ink, opt = {}) {
        for (const r of clipRuns(P.map(T))) if (plen(r) > 2.5 * sc) S.push(...inkLine(r, Math.max(.6, w * sc), colr, opt));
      },
      spar(P, w, colr) {
        const Q = P.length > 2 ? P : along(P, 8);
        k.line(Q, w, colr || MAST(), { prof: 'tip', nb: 0, a: .95, rough: .1 });
        k.ink(Q, Math.max(.5, w * .24), C.ink, { a: .55 });
      },
      rope(a, b, sag = 0, al = .45) { k.line(qcurve(a[0], a[1], b[0], b[1], sag, 8), .7, C.inkSoft, { prof: 'even', nb: 0, a: al, rough: .15 }); },
      dab(x, y, w, len, colr, al = .85, ang = -PI / 2) { k.line(polar(x, y, ang, len, 0, 3), w, colr, { prof: 'leaf', nb: 0, a: al }); },
      flag(p, w, h, kind = 'flag', ex = {}) {
        if (o.flag === false || (cfg.noFlag && !o.flag)) return;
        const q = T(p); if (q[1] > -24 * sc) return;          // not a flag lying on the water
        fx.flags.push(Object.assign({ x: q[0], y: q[1], w: w * sc, h: h * sc, kind, col: flagCol(o, cfg.flagCol) }, ex));
      },
      fire(p, h) { const q = T(p); if (q[1] < -1) fx.fires.push({ x: q[0], y: q[1], h: h * sc }); },
      lamp(p, r) { const q = T(p); if (q[1] < -1) fx.lamps.push({ x: q[0], y: q[1], r: r * sc }); },
      funnel(p, h, al) { const q = T(p); if (q[1] < -1) fx.funnels.push({ x: q[0], y: q[1], h: h * sc, a: al }); },
      // charred patches around the fires, when it burns
      char(pts) { if (!o.burning) return; for (const [x, y] of pts) k.wash(WC.blobPts(x, y - 6, rnd(16, 26), rnd(7, 11), 14, .25), mixc(C.ink, C.wood, .2), .38, 2, 1); },
      // the hull's shadow on the water, the dark line where it meets it, a bow wave, foam when it is in trouble
      finish() {
        for (const g of ghost) S.push(washShape(densify(g, 12 * sc), mixc(C.water, C.waterDeep, .5), cfg.ghostA ?? .17, 2, 3 * sc));
        if (!wl) return;
        const [x0, x1] = wl, foam = FOAM(), lens = [];
        for (let i = 0; i <= 12; i++) lens.push([mix(x0, x1, i / 12), 0]);
        for (let i = 12; i >= 0; i--) lens.push([mix(x0, x1, i / 12), (1.5 + Math.sin(PI * i / 12) * 5) * sc]);
        S.push(washShape(lens, C.waterDeep, .3, 2, 1 * sc));
        S.push(mk(qcurve(x0 - 5 * sc, .6 * sc, x1 + 5 * sc, .6 * sc, 0, 16), 2.2 * sc, mixc(C.waterDeep, C.ink, .3), { prof: 'even', nb: 0, a: .5 }));
        if (cfg.wake !== false && sink < .3) {
          S.push(mk(qcurve(x1 + 3 * sc, -1.5 * sc, x1 - 34 * sc, 2.5 * sc, -3 * sc, 8), 4.5 * sc, foam, { prof: 'tip', nb: 3, a: .85 }));
          S.push(mk(qcurve(x0 + 10 * sc, 2 * sc, x0 - 50 * sc, 3.5 * sc, 1.5 * sc, 8), 3.5 * sc, foam, { prof: 'leaf', nb: 3, a: .6 }));
        }
        const nf = (sink > .05 || o.damage || o.burning) ? 5 + Math.round(sink * 12) : 0;
        for (let i = 0; i < nf; i++) {
          const x = rnd(x0 - 24 * sc, x1 + 24 * sc), L = rnd(14, 38) * sc;
          S.push(mk(qcurve(x - L / 2, rnd(-2, 1) * sc, x + L / 2, rnd(-1, 3) * sc, rnd(-3, 3) * sc, 6), rnd(3, 6) * sc, foam, { prof: 'leaf', nb: 3, a: rnd(.6, .9) }));
        }
      },
    };
    return k;
  }

  // ---------------------------------------------------------------- sails
  // tear a sail's edge: one or two ragged bites taken out of it (toward g, or upward for a square sail's foot)
  function rip(E, depth, n, g) {
    const out = E.map(p => p.slice()), m = out.length - 1;
    for (let r = 0; r < n; r++) {
      const c = Math.floor(rnd(2, m - 1)), hw = rnd(1.2, 2.6), d = rnd(.25, .5);
      for (let i = 1; i < m; i++) {
        const f = (1 - Math.abs(i - c) / (hw + 1)) * rnd(.75, 1.1); if (f <= 0) continue;
        if (g) { const q = lerp(out[i], g, d * f); out[i][0] = q[0]; out[i][1] = q[1]; } else out[i][1] -= depth * d * f;
      }
    }
    for (let i = 1; i < m; i++) if (!g) out[i][1] -= rnd(0, .05) * depth;
    return out;
  }
  // a square sail hanging from its yard: top centre (cx, y), widths at the yard / the foot, height h
  function squareSail(k, cx, y, wt, wb, h, so = {}) {
    const bel = so.belly ?? .6, torn = so.torn, base = so.col || SAIL(), shade = mixc(base, C.stoneDark, .45);
    const tl = [cx - wt / 2, y], tr = [cx + wt / 2, y], br = [cx + wb / 2, y + h], bl = [cx - wb / 2, y + h];
    const fore = qctrl(tr[0], tr[1], tr[0] + (wb - wt) * .3 + wt * .1 * bel, y + h * .5, br[0], br[1], 6);
    let foot = qctrl(br[0], br[1], cx, y + h * (1 + .22 * bel), bl[0], bl[1], 12);
    if (torn) foot = rip(foot, h, rnd() < .5 ? 1 : 2);
    const aft = qctrl(bl[0], bl[1], bl[0] - wt * .05 * bel, y + h * .5, tl[0], tl[1], 6);
    const P = [tl, ...fore, ...foot.slice(1), ...aft.slice(1, -1)];
    k.wash(P, base, .6, 3, 1.8);
    // the cloth: dry-brush strokes down the sail, bending with its belly; the shadowed aft side; the foot
    k.rows(P, shade, { dir: 'v', gap: Math.max(6, wt / 6), w: Math.max(4.5, wt / 7), a: .15, nb: 4, bend: -wt * .03 * bel, broken: .1 });
    k.wash([tl, [cx - wt * .14, y], [cx - wb * .18, y + h * (torn ? .45 : .92 + .12 * bel)], [bl[0] + (torn ? 3 : 0), y + h * (torn ? .5 : 1)]], shade, .26, 2, 1.4);
    if (!torn) k.line(foot.map(([x, yy]) => [x, yy - 3]), 4, shade, { prof: 'leaf', nb: 3, a: .28 });
    if (so.cross) {
      k.line(along([[cx, y + h * .18], [cx, y + h * .8]], 6), wt * .11, C.red, { prof: 'even', nb: 4, a: .8 });
      k.line(along([[cx - wt * .27, y + h * .42], [cx + wt * .27, y + h * .42]], 6), wt * .1, C.red, { prof: 'even', nb: 4, a: .8 });
    }
    if (torn) { const [px, py] = foot[Math.floor(rnd(3, 9))]; k.line(qcurve(px, py - 2, px + rnd(-6, 6), py + rnd(10, 22), rnd(-4, 4), 5), rnd(4, 7), base, { prof: 'leaf', nb: 2, a: .6 }); }
    k.ink(fore, .8, C.inkSoft, { a: .4 });
    k.spar(along([[tl[0] - 6, y], [tr[0] + 6, y]], 8), 3);
  }
  function furledYard(k, cx, y, wt) {
    k.line(qcurve(cx - wt / 2, y - 1, cx + wt / 2, y - 1, 1.5, 10), 6, SAIL(), { prof: 'leaf', nb: 4, a: .85 });
    k.spar(along([[cx - wt / 2 - 5, y], [cx + wt / 2 + 5, y]], 8), 3);
    for (let i = 1; i < 5; i++) { const x = cx - wt / 2 + wt * i / 5; k.line([[x - 1, y - 5], [x + 1, y + 1]], .8, C.ink, { prof: 'even', nb: 0, a: .5 }); }
  }
  // a triangular sail: F (tack, forward low), A (head / upper yard end), K (clew, aft low); the yard runs F → A
  function triSail(k, F, A, K, so = {}) {
    const bel = so.belly ?? .6, base = so.col || SAIL(), shade = mixc(base, C.stoneDark, .45), torn = so.torn;
    const dAK = Math.hypot(K[0] - A[0], K[1] - A[1]), dKF = Math.hypot(F[0] - K[0], F[1] - K[1]);
    const Gc = [(F[0] + A[0] + K[0]) / 3, (F[1] + A[1] + K[1]) / 3];
    let leech = qcurve(A[0], A[1], K[0], K[1], dAK * .1 * bel, 12), foot = qcurve(K[0], K[1], F[0], F[1], dKF * .12 * bel, 12);
    if (torn) { if (rnd() < .6) leech = rip(leech, 0, 1, Gc); foot = rip(foot, 0, 1, Gc); }
    const P = [...along([F, A], 10), ...leech.slice(1), ...foot.slice(1, -1)];
    k.wash(P, base, .6, 3, 1.8);
    k.rows(P, shade, { dir: 'v', gap: Math.max(6, Math.abs(F[0] - K[0]) / 6), w: 5, a: .14, nb: 4, broken: .1 });
    k.wash([A, lerp(A, F, .22), lerp(K, F, .28), K], shade, .26, 2, 1.4);
    if (so.cross) {
      const s = Math.min(dAK, dKF) * .2, c0 = lerp(Gc, K, .05);
      k.line(along([[c0[0], c0[1] - s], [c0[0], c0[1] + s]], 6), s * .42, C.red, { prof: 'even', nb: 4, a: .8 });
      k.line(along([[c0[0] - s * .8, c0[1] - s * .15], [c0[0] + s * .8, c0[1] - s * .15]], 6), s * .4, C.red, { prof: 'even', nb: 4, a: .8 });
    }
    k.ink(leech, .8, C.inkSoft, { a: .38 });
    if (so.yard !== false) k.spar(along([lerp(F, A, -.05), lerp(F, A, 1.05)], 10), 3.2);
    else k.ink(along([F, A], 6), .9, C.inkSoft, { a: .5 });
  }
  function furledLateen(k, F, A) {
    k.line(along([lerp(F, A, .1), lerp(F, A, .9)], 10), 6.5, SAIL(), { prof: 'leaf', nb: 4, a: .85 });
    k.spar(along([lerp(F, A, -.05), lerp(F, A, 1.05)], 10), 3.2);
  }
  // a broken mast: the stump with a splintered top, the fallen spar lying across the deck
  function brokenMast(k, base, top, w, fall) {
    const b = lerp(base, top, .5);
    k.spar(along([base, b], 6), w);
    k.line(qcurve(b[0] - 2, b[1], b[0] + 1, b[1] - 9, 2, 3), w * .6, MAST(), { prof: 'tip', nb: 0 });
    k.line(qcurve(b[0] + 1, b[1], b[0] + 3, b[1] - 6, -1, 3), w * .45, MAST(), { prof: 'tip', nb: 0 });
    k.spar(along(fall, 8), w * .8);
  }

  // ---------------------------------------------------------------- ship live part
  function rowOars(c, k, oars, lt) {
    const ph = lt * 2.3, sw = Math.sin(ph), lift = Math.max(0, -Math.cos(ph)), sc = k.sc;
    c.lineCap = 'round'; c.strokeStyle = rgba(mixc(C.wood, C.ink, .4), .85); c.lineWidth = Math.max(1, 1.7 * sc);
    c.beginPath();
    const blades = [];
    for (const q of oars) {
      const p = k.T([q.x, q.y]); if (p[1] > 0) continue;
      const b = k.T([q.x - 22 + sw * 11, 3 - lift * 10]);
      let ex = b[0], ey = b[1];
      if (ey > 0) { const t = -p[1] / (ey - p[1]); ex = p[0] + (ex - p[0]) * t; ey = 0; } else blades.push([ex, ey]);
      c.moveTo(p[0] + (p[0] - ex) * .2, p[1] + (p[1] - ey) * .2); c.lineTo(ex, ey);
    }
    c.stroke();
    c.fillStyle = rgba(mixc(C.wood, C.ink, .4), .8);
    for (const [x, y] of blades) { c.beginPath(); c.ellipse(x, y, 1.6 * sc, 3.2 * sc, .3, 0, 7); c.fill(); }
  }
  function shipLive(k, o) {
    const fx = k.fx;
    if (!fx.flags.length && !fx.fires.length && !fx.lamps.length && !(fx.funnels.length && (o.smoke === true || (o.smoke !== false && k.sink < .3))) && !fx.oars.length) return undefined;
    return (c, lt, it) => {
      begin(c, it, lt, true);
      const ik = ikOf(it);
      for (const [i, l] of fx.lamps.entries()) { const f = 1 + .1 * Math.sin(lt * 9 + i * 2) + .05 * Math.sin(lt * 23 + i); glow(c, l.x, l.y, l.r * 3.2 * f, C.gold, .28); glow(c, l.x, l.y, l.r * 1.1 * f, C.gold, .7); }
      if (o.smoke === true || (o.smoke !== false && k.sink < .3)) for (const [i, f] of fx.funnels.entries()) trail(c, f.x, f.y, f.h, lt, i + ik * 5, f.a ?? .42, mixc(C.smoke, C.ink, .15));
      for (const [i, f] of fx.fires.entries()) column(c, f.x, f.y - f.h * .5, f.h * 4.5, lt, i + 11 + ik * 5, .5, -.8, mixc(C.smoke, C.ink, .3));
      for (const [i, f] of fx.fires.entries()) { glow(c, f.x, f.y - f.h * .35, f.h * 1.4, C.fire, .24); tongue(c, f.x, f.y, f.h * (.85 + .15 * Math.sin(lt * 6 + i * 2.3)), lt, i + ik * 7); tongue(c, f.x + f.h * .25, f.y, f.h * .6, lt, i + 3 + ik * 7); }
      if (fx.oars.length) rowOars(c, k, fx.oars, lt);
      if (fx.flags.length) {      // o.wind 'left' | 'right' blows every flag the same way on screen, whichever way the ship faces
        const fl = !!(it && typeof it === 'object' && it.flip), dir = o.wind === 'right' || o.wind === 'left' ? ((o.wind === 'right') !== fl ? -1 : 1) : 1;
        for (const [i, f] of fx.flags.entries()) { f.dir = dir; drawFlag(c, f, lt, i + ik * 3); }
      }
    };
  }
  const done = (k, o, topP) => { k.finish(); return { S: k.S, live: shipLive(k, o), top: k.T(topP) }; };

  // ================================================================ SHIPS
  // galley (Ottoman kadırga / Venetian galley), 340 long
  G.galley = (sc, o = {}) => {
    const k = kit(sc, o, { maxA: .5, depth: 42 }), ven = o.style === 'venetian';
    const hullC = ven ? mixc(C.wood, C.ink, .3) : mixc(C.wood, C.ink, .12), dark = mixc(hullC, C.ink, .4);
    const acc = ven ? C.gold : C.red, burnt = !!o.burning, torn = !!o.damage || burnt;
    const sailCol = burnt ? mixc(SAIL(), C.ink, .25) : SAIL();
    const top = x => { const u = x / 165; return -(14 + 16 * Math.pow(Math.max(0, -u), 3) + 8 * Math.pow(Math.max(0, u), 3)); };
    const sheer = (x0, x1, d = 0, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
    // hull: long and low, a curved stem, the stern rising into the sternpost
    const P = [...sheer(-160, 152, 0, 20), ...qctrl(152, top(152), 160, -2, 138, 8, 6).slice(1), [-136, 8], ...qctrl(-136, 8, -160, 4, -160, top(-160), 6).slice(1, -1)];
    k.water(P);
    k.wash(P, hullC, .85);
    k.wash([...sheer(-150, 146, 7, 14), [140, 8], [-136, 8]], dark, .45, 2);
    k.planks(sheer, -152, 148, 2, 11, mixc(hullC, C.ink, .3), 4, 3.6);
    for (const d of [4.5, 9.5]) k.line(sheer(-150, 146, d, 14), .9, C.ink, { prof: 'even', nb: 0, a: .25 });
    k.line(sheer(-156, 150, 1.6, 18), 3.8, acc, { prof: 'even', nb: 0, a: .85 });
    k.ink(sheer(-160, 152, 0, 18), 1.5, C.ink, { a: .8 });
    const spur = qcurve(146, -16, 206, -9, -3, 8);
    k.line(spur, 6.5, dark, { prof: 'tip', nb: 0, a: .95 }); k.ink(spur, 1.1);
    k.line(qcurve(150, -20, 158, -36, -5, 6), 4, hullC, { prof: 'tip', nb: 0 });
    const post = qctrl(-158, -28, -186, -40, -176, -64, 8);
    k.line(post, 5.5, ven ? C.gold : hullC, { prof: 'tip', nb: 0, a: .95 }); k.ink(post, 1.1);
    if (ven) k.wash([[-160, top(-160)], [-150, -40], [-128, -34], [-130, top(-130)]], C.gold, .55, 2);
    // the outrigger (apostis) the oars work from, and the crew's heads over it
    const rail = sheer(-120, 128, -4, 16);
    k.line(rail, 3.4, mixc(C.wood, C.paperLight, .2), { prof: 'even', nb: 0, a: .95 }); k.ink(rail, 1, C.ink, { a: .65 });
    const crewC = ven ? [C.cloth, C.clothB, C.paperDark, C.clothC] : [C.red, C.paperDark, C.red, C.clothC, C.cloth];
    for (let x = -104; x < 118; x += rnd(9, 13)) k.dab(x, top(x) - 6, 4.4, 5, pick(crewC));
    const n = o.oars ?? 25;
    for (let i = 0; i < n; i++) {
      const x = mix(-108, 118, i / (n - 1)), y = top(x) - 4;
      if (o.row) { k.fx.oars.push({ x, y }); continue; }
      if (o.damage && rnd() < .3) continue;
      const end = [x - 24 + rnd(-2, 2), o.damage && rnd() < .3 ? -6 : 4];
      k.line(qcurve(x, y, end[0], end[1], rnd(-1.5, 1.5), 5), 1.7, dark, { prof: 'even', nb: 0, a: .85 });
    }
    // masts, lateen yards and sails
    const mainTop = [26, -152], foreTop = [106, -112];
    const mF = [150, -58], mA = [-112, -214], mK = [-55, -46], fF = [178, -46], fA = [16, -152], fK = [42, -40];
    if (o.damage) brokenMast(k, [22, -14], mainTop, 4.4, [[30, -84], [-50, -24]]);
    else k.spar(along([[22, -14], mainTop], 8), 4.4);
    k.spar(along([[100, -18], foreTop], 8), 3.4);
    if (o.sails === 'furled') { if (!o.damage) furledLateen(k, mF, mA); furledLateen(k, fF, fA); }
    else {
      if (o.damage) k.wash(WC.blobPts(-6, -34, 42, 11, 18, .3), sailCol, .6, 3, 1);       // the main sail lies crumpled on deck
      else triSail(k, mF, mA, mK, { torn, col: sailCol });
      triSail(k, fF, fA, fK, { torn, col: sailCol });
    }
    if (!o.damage) { k.rope(mainTop, [152, -24], 8); k.rope(mainTop, [-124, -26], -10); }
    k.rope(foreTop, [176, -26], 5);
    // the stern: an awning over the commander's platform and the lantern(s)
    const aw = ven ? C.clothB : mixc(C.red, C.roof, .3);
    const awP = [[-152, top(-152)], [-152, -44], ...qctrl(-152, -44, -134, -60, -112, -42, 8).slice(1), [-112, top(-112)]];
    k.wash(awP, aw, .75, 3, 1);
    for (const x of [-144, -134, -124]) k.line(qcurve(x, -52 + Math.abs(x + 132) * .25, x + 1, top(x) - 2, 0, 4), 1.6, ven ? C.gold : mixc(aw, C.ink, .35), { prof: 'even', nb: 0, a: .7 });
    k.ink(qctrl(-153, -44, -134, -61, -111, -42, 10), 1.1, C.ink, { a: .7 });
    const nl = o.lanterns ?? (ven ? 1 : 1), lamps = nl >= 3 ? [[-171, -82], [-186, -70], [-156, -70]] : [[-171, -82]];
    k.spar(along([[-168, top(-168)], [-171, -74]], 6), 1.8);
    if (nl >= 3) { k.line(along([[-186, -64], [-156, -64]], 6), 1.4, MAST(), { prof: 'even', nb: 0 }); }
    for (const [x, y] of lamps) {
      k.wash([[x - 4, y + 5], [x - 5.5, y - 2], [x - 2.5, y - 8], [x + 2.5, y - 8], [x + 5.5, y - 2], [x + 4, y + 5]], mixc(C.gold, C.wood, .25), .85, 2, .4);
      k.ink([[x - 4, y + 5], [x - 5.5, y - 2], [x - 2.5, y - 8], [x + 2.5, y - 8], [x + 5.5, y - 2], [x + 4, y + 5]], .9);
      k.line([[x, y - 8], [x, y - 13]], 1.6, C.ink, { prof: 'tip', nb: 0 });
      k.lamp([x, y - 1], 4);
    }
    // flags: streamers from the upper yard ends, a flag at the masthead and a big one at the stern
    const fl = { cres: !ven, emb: ven };
    if (!o.damage) { k.flag(mA, 80, 9, 'pennant'); k.spar(along([mainTop, [26, -170]], 4), 1.6); k.flag([26, -170], 40, 24, 'flag', fl); }
    k.flag(fA, 62, 8, 'pennant');
    k.spar(along([[-150, -44], [-154, -100]], 6), 1.8);
    k.flag([-154, -100], 46, 30, 'flag', fl);
    if (o.burning) { const at = [[-80, top(-80)], [10, top(10)], [92, top(92)]]; k.char(at); at.forEach(([x, y], i) => k.fire([x, y - 2], [46, 60, 40][i])); }
    return done(k, o, o.damage ? foreTop : [26, -170]);
  };

  // carrack, 300 long: high castles, square courses and topsails, lateen mizzen
  G.carrack = (sc, o = {}) => {
    const k = kit(sc, o, { maxA: .55, depth: 62 }), four = +o.masts === 4, torn = !!o.damage || !!o.burning;
    const hc = mixc(C.wood, C.ink, .1), dark = mixc(C.wood, C.ink, .45), light = mixc(C.wood, C.paperLight, .28);
    const sailCol = o.burning ? mixc(SAIL(), C.ink, .25) : SAIL();
    const top = x => { const u = x / 150; return -(34 + 22 * Math.pow(Math.max(0, -u), 2) + 14 * Math.pow(Math.max(0, u), 2)); };
    const sheer = (x0, x1, d = 0, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
    const P = [...sheer(-150, 150, 0, 20), ...qctrl(150, top(150), 142, 10, 118, 16, 8).slice(1), [-112, 16], ...qctrl(-112, 16, -140, 10, -150, top(-150), 8).slice(1, -1)];
    k.water(P);
    k.wash(P, hc, .85);
    k.wash([...sheer(-140, 140, 16, 14), [124, 16], [-112, 16]], dark, .45, 2);
    k.planks(sheer, -146, 146, 2, 34, mixc(hc, C.ink, .3), 7, 4.5);
    for (const d of [7, 15, 24]) { k.line(sheer(-146, 146, d, 16), 3.4, dark, { prof: 'even', nb: 2, a: .8 }); k.ink(sheer(-146, 146, d + 1.6, 16), .8, C.ink, { a: .5 }); }
    for (const x of [-100, -40, 30, 90]) k.line([[x, top(x) + 8], [x + 1, top(x) + 30]], 1, C.ink, { prof: 'even', nb: 0, a: .3 });
    // castles
    const aft = [[-154, top(-150)], [-156, -86], [-64, -76], [-64, top(-64)], ...sheer(-64, -150, 0, 6).slice(1)];
    k.wash(aft, light, .8, 3, 1);
    k.wash([[-160, -84], [-162, -106], [-112, -102], [-112, -82]], light, .8, 3, 1);
    k.wash([[98, top(98)], [96, -70], [180, -82], [184, -66], [150, top(150)]], light, .8, 3, 1);
    for (const [x0, x1, y0, y1] of [[-156, -64, -86, -76], [-162, -112, -106, -102], [96, 182, -70, -82]]) {
      k.line(along([[x0, y0 + 3], [x1, y1 + 3]], 8), 3.6, C.red, { prof: 'even', nb: 0, a: .7 });
      k.ink(along([[x0, y0], [x1, y1]], 8), 1.2);
      for (let i = 0; i < 6; i++) { const t = (i + .5) / 6, x = mix(x0, x1, t), y = mix(y0, y1, t) + 9; k.dab(x, y + 3, 6, 6, pick([C.red, C.gold, C.clothB])); }
    }
    k.ink([[-156, -86], [-154, top(-150)]], 1.1); k.ink([[180, -82], [184, -66], [150, top(150)]], 1.1);
    k.ink(sheer(-150, 150, 0, 18), 1.3, C.ink, { a: .7 });
    for (const x of [-90, -20, 50, 110]) k.dab(x, top(x) + 20, 4.5, 4.5, C.ink, .8, 0);
    // masts
    const fore = [[112, top(112)], [114, -236]], main = [[10, top(10)], [10, -306]], miz = [[-88, -76], [-90, -212]], bon = [[-132, -100], [-134, -176]];
    if (o.damage) brokenMast(k, main[0], main[1], 5.4, [[18, -168], [-60, -80]]); else k.spar(along(main, 10), 5.4);
    k.spar(along(fore, 10), 4.4); k.spar(along(miz, 8), 3.4); if (four) k.spar(along(bon, 8), 2.8);
    const bow = along([[140, -58], [222, -100]], 8); k.spar(bow, 4.2);
    const tops = o.damage ? [[114, -200]] : [[10, -258], [114, -200]];
    for (const [x, y] of tops) { k.wash([[x - 11, y - 8], [x + 11, y - 8], [x + 7, y + 4], [x - 7, y + 4]], light, .85, 2, .5); k.ink([[x - 11, y - 8], [x + 11, y - 8], [x + 7, y + 4], [x - 7, y + 4]], .9); }
    const furled = o.sails === 'furled', cross = !!o.cross;
    if (furled) {
      if (!o.damage) { furledYard(k, 10, -214, 150); furledYard(k, 10, -292, 66); }
      furledYard(k, 113, -190, 112); furledYard(k, 114, -228, 46); furledLateen(k, [-30, -112], [-150, -238]);
    } else {
      if (!o.damage) { squareSail(k, 10, -214, 150, 166, 118, { torn, col: sailCol, cross }); squareSail(k, 10, -292, 64, 86, 36, { torn, col: sailCol }); }
      squareSail(k, 113, -190, 112, 124, 94, { torn, col: sailCol, cross }); squareSail(k, 114, -228, 44, 60, 26, { torn, col: sailCol });
      triSail(k, [-30, -112], [-150, -238], [-130, -96], { torn, col: sailCol });
      if (four) triSail(k, [-104, -118], [-178, -204], [-170, -110], { torn, col: sailCol });
      squareSail(k, 200, -94, 52, 56, 32, { torn, col: sailCol });
    }
    // rigging
    for (const [tp, xs] of [[[10, -258], [-30, -10, 30, 50]], [[114, -200], [86, 100, 128, 140]]]) {
      if (o.damage && tp[0] === 10) continue;
      for (const x of xs) k.rope(tp, [x, top(x)], 0, .35);
    }
    if (!o.damage) { k.rope([10, -300], [112, -210], 6); k.rope([10, -300], [-150, -104], -10); }
    k.rope([114, -232], [216, -98], 5);
    if (!o.damage) { k.flag([10, -306], 70, 9, 'pennant'); }
    k.flag([114, -236], 56, 8, 'pennant'); k.flag([-90, -212], 46, 7, 'pennant');
    k.spar(along([[-158, -104], [-164, -150]], 6), 1.8); k.flag([-164, -150], 42, 26);
    if (o.burning) { const at = [[-60, top(-60)], [40, top(40)], [125, -70]]; k.char(at); at.forEach(([x, y], i) => k.fire([x, y - 2], [52, 64, 44][i])); }
    return done(k, o, o.damage ? [114, -236] : [10, -306]);
  };

  // caravel (caravela latina), 260 long: low hull, small sterncastle, 2–3 lateen sails
  G.caravel = (sc, o = {}) => {
    const k = kit(sc, o, { maxA: .55, depth: 50 }), three = +o.masts !== 2, torn = !!o.damage || !!o.burning;
    const hc = mixc(C.wood, C.ink, .08), dark = mixc(C.wood, C.ink, .45), light = mixc(C.wood, C.paperLight, .28);
    const sailCol = o.burning ? mixc(SAIL(), C.ink, .25) : SAIL(), cross = !!o.cross;
    const top = x => { const u = x / 130; return -(22 + 18 * Math.pow(Math.max(0, -u), 2) + 7 * Math.pow(Math.max(0, u), 2)); };
    const sheer = (x0, x1, d = 0, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
    const P = [...sheer(-130, 130, 0, 18), ...qctrl(130, top(130), 128, 6, 106, 12, 8).slice(1), [-100, 12], ...qctrl(-100, 12, -126, 6, -130, top(-130), 8).slice(1, -1)];
    k.water(P);
    k.wash(P, hc, .85);
    k.wash([...sheer(-124, 124, 11, 14), [110, 12], [-100, 12]], dark, .45, 2);
    k.planks(sheer, -126, 126, 2, 22, mixc(hc, C.ink, .3), 5, 4);
    for (const d of [5, 12]) { k.line(sheer(-126, 126, d, 16), 2.6, dark, { prof: 'even', nb: 2, a: .75 }); }
    k.wash([[-133, top(-130)], [-135, -60], [-80, -52], [-80, top(-80)], ...sheer(-80, -130, 0, 5).slice(1)], light, .8, 3, 1);
    k.ink(along([[-135, -60], [-80, -52]], 6), 1.2); k.ink([[-135, -60], [-133, top(-130)]], 1);
    k.ink(sheer(-130, 130, 0, 16), 1.3, C.ink, { a: .7 });
    const masts = three ? [[[84, top(84)], [90, -196]], [[10, top(10)], [12, -222]], [[-62, top(-62)], [-62, -164]]] : [[[40, top(40)], [44, -220]], [[-50, top(-50)], [-50, -170]]];
    const sails = three
      ? [[[132, -38], [48, -218], [14, -36]], [[108, -48], [-44, -256], [-60, -38]], [[-10, -50], [-96, -190], [-118, -52]]]
      : [[[124, -40], [-20, -258], [-36, -36]], [[-4, -52], [-90, -196], [-118, -54]]];
    masts.forEach((m, i) => { if (o.damage && i === (three ? 1 : 0)) brokenMast(k, m[0], m[1], 4.2, [[18, -110], [-40, -30]]); else k.spar(along(m, 8), i === (three ? 1 : 0) ? 4.2 : 3.4); });
    sails.forEach(([F, A, K], i) => {
      if (o.damage && i === (three ? 1 : 0)) { k.wash(WC.blobPts(-10, -32, 36, 9, 16, .3), sailCol, .6, 3, 1); return; }
      if (o.sails === 'furled') furledLateen(k, F, A); else triSail(k, F, A, K, { torn, col: sailCol, cross });
    });
    masts.forEach((m, i) => { if (!(o.damage && i === (three ? 1 : 0))) { k.rope(m[1], [128, top(128)], 4); k.flag(m[1], 50, 7, 'pennant'); } });
    k.spar(along([[-132, -60], [-138, -104]], 6), 1.8); k.flag([-138, -104], 38, 24);
    if (o.burning) { const at = [[-50, top(-50)], [40, top(40)]]; k.char(at); at.forEach(([x, y], i) => k.fire([x, y - 2], [50, 58][i])); }
    return done(k, o, masts[three ? 1 : 0][1]);
  };

  // frigate, 330 long: three masts with courses, topsails, topgallants; ochre gun-deck stripe with ports
  G.frigate = (sc, o = {}) => {
    const k = kit(sc, o, { maxA: .55, depth: 60 }), torn = !!o.damage || !!o.burning, furled = o.sails === 'furled';
    const black = mixc(C.ink, C.wood, .35), ochre = mixc(C.clothC, C.gold, .25), copper = mixc(C.fire, C.wood, .45);
    const sailCol = o.burning ? mixc(SAIL(), C.ink, .25) : SAIL();
    const top = x => { const u = x / 160; return -(34 + 10 * Math.pow(Math.max(0, -u), 2) + 8 * Math.pow(Math.max(0, u), 2)); };
    const sheer = (x0, x1, d = 0, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
    const P = [...sheer(-164, 160, 0, 22), ...qctrl(160, top(160), 172, -6, 146, 18, 8).slice(1), [-132, 18], ...qctrl(-132, 18, -152, 10, -164, top(-164), 8).slice(1, -1)];
    k.water(P);
    k.wash(P, black, .88);
    k.wash([...sheer(-160, 160, 0, 6).map(([x]) => [x, 0]), [146, 18], [-132, 18]], copper, .85, 2);
    k.planks(sheer, -160, 156, 2, 34, mixc(black, C.wood, .55), 6, 4.5);
    k.wash([...sheer(-156, 158, 11, 16), ...sheer(-156, 158, 20, 16).reverse()], ochre, .82, 3, .8);
    k.planks(sheer, -150, 152, 12, 19, mixc(ochre, C.wood, .4), 2, 3.5);
    k.ink(sheer(-164, 160, 0, 18), 1.3, C.ink, { a: .75 });
    for (let i = 0; i < 13; i++) {
      const x = -128 + i * 21, y = top(x) + 12.5;
      if (o.damage && rnd() < .2) continue;
      k.wash([[x - 3.5, y], [x + 3.5, y], [x + 3.5, y + 6.5], [x - 3.5, y + 6.5]], C.ink, .85, 2, .3);
    }
    for (const x of [-140, -118]) { const y = top(x) + 2.5; k.wash([[x - 3, y], [x + 3, y], [x + 3, y + 5], [x - 3, y + 5]], C.ink, .8, 2, .3); }
    // stern windows and the quarter gallery, the beakhead and figurehead
    for (let i = 0; i < 3; i++) { const x = -158 + i * 6; k.wash([[x, -42], [x + 4, -42], [x + 4, -36], [x, -36]], mixc(C.gold, C.paperLight, .4), .85, 2, .2); }
    k.wash(WC.blobPts(-146, -26, 9, 10, 12, .1), ochre, .7, 2, .4);
    k.line(qcurve(160, -40, 180, -46, -3, 5), 5, ochre, { prof: 'tip', nb: 0 }); k.dab(178, -44, 6, 9, mixc(C.paperLight, C.gold, .4), .9, -.4);
    if (o.damage) for (let i = 0; i < 5; i++) { const x = rnd(-120, 120); k.wash(WC.blobPts(x, top(x) + rnd(4, 26), 4, 3.5, 10, .3), C.ink, .9, 2, .3); }
    // masts and spars
    const ms = [{ x: 100, top: -288, f: .9 }, { x: 0, top: -322, f: 1 }, { x: -100, top: -246, f: .78 }];
    ms.forEach((m, i) => {
      const base = [m.x, top(m.x)], tp = [m.x - 2, m.top];
      if (o.damage && i === 1) brokenMast(k, base, [m.x, -270], 5.4, [[8, -150], [-70, -50]]);
      else { k.spar(along([base, tp], 12), 5.2 * m.f); for (const y of [-150 * m.f - 10, -235 * m.f]) k.line([[m.x - 5, y], [m.x + 5, y]], 2.4, C.ink, { prof: 'even', nb: 0, a: .7 }); }
    });
    k.spar(along([[150, -44], [232, -88]], 8), 5); k.spar(along([[222, -84], [276, -108]], 6), 2.6);
    const yardsFor = (m, i) => {
      const x = m.x - 1, f = m.f;
      return i === 2 ? [[-172 * f, 86, 100, 60], [-226 * f, 62, 78, 44]]
        : [[-112 * f, 150 * f, 160 * f, 62 * f], [-200 * f, 118 * f, 140 * f, 82 * f], [-262 * f, 82 * f, 104 * f, 58 * f], [-302 * f, 52 * f, 66 * f, 36 * f]]
          .filter(([y]) => y > m.top + 6).map(r => r.concat([x]));
    };
    ms.forEach((m, i) => {
      if (o.damage && i === 1) { k.wash(WC.blobPts(-24, -40, 30, 7, 16, .35), sailCol, .6, 3, 1); k.line(qcurve(-50, -40, 4, -42, -4, 8), 2, mixc(sailCol, C.stoneDark, .5), { prof: 'leaf', nb: 3, a: .5 }); return; }
      for (const [y, wt, wb, h] of yardsFor(m, i)) {
        if (furled) furledYard(k, m.x - 1, y, wt); else squareSail(k, m.x - 1, y, wt, wb, h, { torn, col: sailCol, belly: .7 });
      }
    });
    // spanker on the mizzen, jibs on the bowsprit
    if (furled) { k.line(along([[-100, -150], [-176, -128]], 8), 5, SAIL(), { prof: 'leaf', nb: 3, a: .8 }); k.line(along([[160, -52], [262, -102]], 8), 4.5, SAIL(), { prof: 'leaf', nb: 3, a: .8 }); }
    else {
      const sp = [[-102, -152], [-176, -128], [-186, -62], [-102, -58]];
      k.wash([sp[0], ...qcurve(-176, -128, -186, -62, 6, 6), sp[3]], sailCol, .62, 3, 1);
      k.wash([sp[0], [-130, -144], [-134, -60], sp[3]], mixc(sailCol, C.stoneDark, .45), .25, 2, 1);
      triSail(k, [264, -102], [108, -232], [176, -74], { torn, col: sailCol, yard: false });
      triSail(k, [218, -84], [104, -176], [150, -62], { torn, col: sailCol, yard: false });
    }
    k.spar(along([[-100, -150], [-178, -128]], 6), 2.4); k.spar(along([[-100, -58], [-190, -60]], 6), 2.4);
    // rigging: shrouds to the channels, stays forward
    ms.forEach((m, i) => {
      if (o.damage && i === 1) return;
      const y = -150 * m.f - 10;
      for (const dx of [-24, -12, 12, 24]) k.rope([m.x, y], [m.x + dx, top(m.x + dx) + 2], 0, .3);
    });
    if (!o.damage) { k.rope([0, -300], [100, -150], 4); k.rope([-2, -318], [96, -280], 3); }
    k.rope([98, -280], [276, -108], 5); k.rope([-98, -240], [0, -200], 3);
    k.spar(along([[-164, -44], [-180, -92]], 6), 1.8); k.flag([-180, -92], 54, 32);
    if (!o.damage) k.flag([-2, -322], 110, 9, 'pennant');
    k.flag([98, -288], 50, 7, 'pennant');
    if (o.burning) { const at = [[-70, top(-70)], [30, top(30)], [110, top(110)]]; k.char(at); at.forEach(([x, y], i) => k.fire([x, y - 2], [56, 70, 48][i])); }
    return done(k, o, o.damage ? [98, -288] : [-2, -322]);
  };

  // steamship: 'liner' | 'cargo' | 'paddle' | 'warship'
  G.steamship = (sc, o = {}) => {
    const style = ['cargo', 'paddle', 'warship'].includes(o.style) ? o.style : 'liner';
    const k = kit(sc, o, { maxA: style === 'liner' ? .72 : .6, depth: style === 'liner' ? 70 : 60 });
    const white = C.paperLight, shadeW = mixc(C.sky, C.stoneDark, .35), lit = !!o.lights;
    const win = lit ? mixc(C.gold, C.paperLight, .25) : mixc(C.ink, C.night, .2);
    const redBottom = mixc(C.red, C.roof, .4);
    const deckhouse = (x0, x1, y0, y1, colr = white, al = .9) => {
      k.wash([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], colr, al, 2, .6);
      k.rows([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], shadeW, { gap: 4, w: 3.5, a: .14, nb: 3, broken: .15 });
      k.wash([[x0, y1], [x1, y1], [x1, y1 + 2.5], [x0, y1 + 2.5]], shadeW, .45, 2, .3);
      k.ink(along([[x0, y1], [x1, y1]], 8), .9, C.ink, { a: .55 }); k.ink([[x1, y1], [x1, y0]], .8, C.ink, { a: .45 });
    };
    const windows = (x0, x1, y, step, w = 2.6, h = 1.6) => { for (let x = x0; x <= x1; x += step) k.line([[x - w / 2, y], [x + w / 2, y]], h, win, { prof: 'even', nb: 0, a: lit ? .95 : .7 }); };
    const funnelAt = (x, y0, h, w, colr, capH, rake = 9) => {
      const p = [[x - w / 2, y0], [x + w / 2, y0], [x + w / 2 - rake, y0 - h], [x - w / 2 - rake, y0 - h]];
      k.wash(p, colr, .9, 2, .5);
      k.rows(p, mixc(colr, C.ink, .25), { dir: 'v', gap: w / 3, w: w / 3.2, a: .2, nb: 3, broken: .05 });
      k.wash([[x + w * .1 - rake * .5, y0], [x + w / 2, y0], [x + w / 2 - rake, y0 - h], [x + w * .1 - rake, y0 - h]], mixc(colr, C.ink, .3), .35, 2, .3);
      k.wash([[x - w / 2 - rake * (1 - capH / h), y0 - h + capH], [x + w / 2 - rake * (1 - capH / h), y0 - h + capH], [x + w / 2 - rake, y0 - h], [x - w / 2 - rake, y0 - h]], C.ink, .85, 2, .3);
      k.ink(p.slice(1, 3), .9, C.ink, { a: .5 }); k.ink([p[3], p[0]], .9, C.ink, { a: .5 });
      return [x - rake, y0 - h];
    };
    let topP = [0, -100];
    if (style === 'liner') {
      const top = x => { const u = x / 180; return -(32 + 5 * Math.pow(Math.max(0, u), 2) + 2 * Math.pow(Math.max(0, -u), 2)); };
      const sheer = (x0, x1, d = 0, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
      const P = [...sheer(-176, 180, 0, 24), ...qctrl(180, top(180), 179, 0, 175, 22, 4).slice(1), [-150, 22], ...qctrl(-150, 22, -172, 18, -179, -4, 5).slice(1), ...qctrl(-179, -4, -183, -20, -176, top(-176), 5).slice(1, -1)];
      k.water(P);
      k.wash(clipPoly(P, 0, true), redBottom, .85);
      k.wash(clipPoly(P, 0), mixc(C.ink, C.night, .3), .9);
      k.planks(sheer, -172, 176, 3, 30, mixc(C.night, C.waterDeep, .45), 6, 4.5);
      k.line(sheer(-172, 177, 2.5, 18), 1.3, C.gold, { prof: 'even', nb: 0, a: .8 });
      for (const [y, x0, x1] of [[-23, -160, 168], [-15, -156, 166]]) for (let x = x0; x <= x1; x += 11) k.dab(x, y + top(x) + 32, 1.8, 1.8, lit ? C.gold : white, lit ? .95 : .7, 0);
      deckhouse(-150, 132, -44, top(0) + 1);
      windows(-144, 126, -39, 9);
      deckhouse(-128, 112, -54, -44); windows(-122, 106, -49, 10);
      deckhouse(-112, 96, -60, -54);
      deckhouse(96, 112, -66, -54);
      k.line([[90, -66], [118, -66]], 1.6, C.ink, { prof: 'even', nb: 0, a: .7 });
      windows(99, 110, -61, 4, 2, 1.4);
      for (const x of [74, 64, 30, 20, -14, -24, -58, -100]) { k.wash([[x - 5, -64], [x + 5, -64], [x + 4, -60.5], [x - 4, -60.5]], white, .9, 2, .2); k.ink([[x - 5, -64], [x - 4, -60.5], [x + 4, -60.5], [x + 5, -64]], .7, C.ink, { a: .55 }); }
      const buff = mixc(C.clothC, C.gold, .3);
      const tops = [88, 46, 4, -38].map(x => funnelAt(x, -60, 62, 16, buff, 13));
      tops.slice(0, 3).forEach(t => k.funnel([t[0] + 2, t[1]], 210, .4));
      const fm = [[142, top(142)], [134, -186]], am = [[-134, -36], [-140, -168]];
      k.spar(along(fm, 10), 2.4); k.spar(along(am, 10), 2.2);
      k.rope(fm[1], am[1], 8, .35); k.rope(fm[1], [180, top(180)], 4); k.rope(am[1], [-176, top(-176)], -4);
      k.spar(along([[-176, top(-176)], [-180, -62]], 5), 1.4); k.flag([-180, -62], 28, 17);
      k.flag(fm[1], 36, 10, 'pennant');
      topP = fm[1];
      if (o.burning) { const at = [[-80, -60], [20, -60], [110, -66]]; k.char(at); at.forEach(([x, y], i) => k.fire([x, y], [50, 62, 44][i])); }
    } else if (style === 'cargo') {
      const top = x => { const u = x / 160; return -(26 + 8 * Math.pow(Math.max(0, u), 4) + 6 * Math.pow(Math.max(0, -u), 4)); };
      const sheer = (x0, x1, d = 0, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
      const P = [...sheer(-158, 162, 0, 20), [158, 18], [-150, 18], ...qctrl(-150, 18, -162, 8, -158, top(-158), 4).slice(1, -1)];
      k.water(P);
      k.wash(clipPoly(P, 0, true), redBottom, .85);
      k.wash(clipPoly(P, 0), mixc(C.clothB, C.ink, .4), .9);
      k.planks(sheer, -156, 160, 3, 24, mixc(C.clothB, C.paperLight, .1), 5, 4.5);
      k.ink(sheer(-158, 162, 0, 16), 1.2, C.ink, { a: .7 });
      for (const x of [-130, -76, 70, 124]) { k.wash([[x - 14, top(x)], [x + 14, top(x)], [x + 13, top(x) - 6], [x - 13, top(x) - 6]], mixc(C.wood, C.paperLight, .1), .85, 2, .3); k.ink([[x - 14, top(x)], [x - 13, top(x) - 6], [x + 13, top(x) - 6], [x + 14, top(x)]], .8); }
      deckhouse(-30, 36, -42, -26); windows(-26, 32, -35, 6);
      deckhouse(-16, 30, -54, -42); windows(-12, 26, -48, 6);
      deckhouse(-4, 26, -64, -54); windows(0, 22, -59, 4);
      const ft = funnelAt(-24, -42, 46, 18, mixc(C.red, C.roof, .3), 12, 5);
      k.funnel([ft[0] + 2, ft[1]], 190, .45);
      for (const [mx, h] of [[98, -132], [-100, -122]]) {
        k.spar(along([[mx, top(mx)], [mx, h]], 8), 3);
        k.spar(along([[mx, -40], [mx + (mx > 0 ? 34 : -34), -96]], 6), 1.8);
        k.spar(along([[mx, -40], [mx + (mx > 0 ? -34 : 34), -92]], 6), 1.8);
        k.rope([mx, h], [mx + (mx > 0 ? 34 : -34), -96], 2); k.rope([mx, h], [mx + (mx > 0 ? -34 : 34), -92], 2);
      }
      k.rope([98, -132], [162, top(162)], 3); k.rope([-100, -122], [-158, top(-158)], -3); k.rope([98, -132], [-100, -122], 10, .3);
      k.spar(along([[-158, top(-158)], [-162, -60]], 5), 1.4); k.flag([-162, -60], 26, 16);
      topP = [98, -132];
      if (o.burning) { const at = [[-76, -32], [10, -64], [70, -32]]; k.char(at); at.forEach(([x, y], i) => k.fire([x, y], [46, 58, 44][i])); }
    } else if (style === 'paddle') {
      const top = x => { const u = x / 150; return -(20 + 8 * Math.pow(Math.max(0, u), 2) + 6 * Math.pow(Math.max(0, -u), 2)); };
      const sheer = (x0, x1, d = 0, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
      const P = [...sheer(-150, 152, 0, 20), ...qctrl(152, top(152), 154, 0, 140, 12, 5).slice(1), [-128, 12], ...qctrl(-128, 12, -150, 8, -150, top(-150), 5).slice(1, -1)];
      k.water(P);
      k.wash(P, mixc(C.ink, C.wood, .3), .88);
      k.planks(sheer, -148, 150, 3, 16, mixc(C.wood, C.ink, .2), 4, 4);
      k.line(sheer(-146, 150, 3, 16), 2.2, mixc(C.red, C.roof, .2), { prof: 'even', nb: 0, a: .8 });
      k.ink(sheer(-150, 152, 0, 16), 1.2, C.ink, { a: .7 });
      deckhouse(-110, 100, -30, top(0) + 1, mixc(C.paperLight, C.clothC, .2)); windows(-104, 94, -25, 8);
      // the paddle box: a half-wheel housing with its fan of spokes
      const box = [[-44, -20], ...Array.from({ length: 17 }, (_, i) => { const t = PI + i / 16 * PI; return [Math.cos(t) * 44, -20 + Math.sin(t) * 42]; }), [44, -20]];
      k.wash(box, mixc(C.wood, C.paperLight, .2), .88, 3, .6);
      for (let i = 1; i < 10; i++) { const t = PI + i / 10 * PI; k.line(along([[0, -20], [Math.cos(t) * 40, -20 + Math.sin(t) * 38]], 4), 1, C.ink, { prof: 'even', nb: 0, a: .45 }); }
      k.wash(WC.blobPts(0, -22, 12, 7, 12, .1), C.gold, .8, 2, .3);
      k.ink(box, 1.3);
      const fn = [[34, -30], [34, -178]];
      k.line(along(fn, 8), 9, mixc(C.ink, C.night, .2), { prof: 'even', nb: 0, a: .95 });
      k.line(along([[28, -178], [40, -178]], 4), 3.5, C.ink, { prof: 'even', nb: 0, a: .9 });
      k.funnel([34, -180], 230, .5);
      for (const [mx, h] of [[110, -150], [-96, -130]]) k.spar(along([[mx, top(mx)], [mx, h]], 8), 2.6);
      if (o.sails !== 'furled') {
        k.wash([[-97, -122], [-150, -96], [-150, -36], [-97, -34]], SAIL(), .55, 3, 1);
        k.wash([[109, -140], [60, -120], [60, -38], [109, -36]], SAIL(), .55, 3, 1);
      }
      k.rope([110, -150], [152, top(152)], 3); k.rope([110, -150], [-96, -130], 8, .3); k.rope([-96, -130], [-150, top(-150)], -3);
      k.spar(along([[-150, top(-150)], [-154, -64]], 5), 1.4); k.flag([-154, -64], 30, 18);
      k.flag([110, -150], 34, 9, 'pennant');
      topP = [34, -178];
      if (o.burning) { const at = [[-70, -30], [70, -30]]; k.char(at); at.forEach(([x, y], i) => k.fire([x, y], [50, 44][i])); }
    } else {      // warship: a grey dreadnought
      const grey = mixc(C.smoke, C.far, .35), greyD = mixc(grey, C.ink, .35);
      const top = x => { const u = x / 180; return -(26 + 12 * Math.pow(Math.max(0, u), 2) + 2 * Math.pow(Math.max(0, -u), 2)); };
      const sheer = (x0, x1, d = 0, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
      const P = [...sheer(-176, 182, 0, 24), ...qctrl(182, top(182), 176, 4, 168, 22, 5).slice(1), [-150, 22], ...qctrl(-150, 22, -172, 14, -176, top(-176), 5).slice(1, -1)];
      k.water(P);
      k.wash(clipPoly(P, 0, true), redBottom, .8);
      k.wash(clipPoly(P, 0), grey, .9);
      k.wash([...sheer(-170, 176, 10, 16), [176, 0], [-170, 0]], greyD, .3, 2);
      k.planks(sheer, -174, 178, 2, 24, greyD, 6, 4.5);
      k.ink(sheer(-176, 182, 0, 18), 1.2, C.ink, { a: .7 });
      for (let x = -150; x < 160; x += 12) k.dab(x, top(x) + 7, 1.6, 1.6, C.ink, .55, 0);
      deckhouse(-60, 80, -40, top(0) + 1, mixc(grey, C.paperLight, .2), .9);
      deckhouse(-30, 70, -52, -40, mixc(grey, C.paperLight, .2), .9);
      deckhouse(56, 80, -66, -52, mixc(grey, C.paperLight, .2), .9); windows(60, 76, -60, 4, 2, 1.3);
      const fts = [funnelAt(30, -52, 40, 18, grey, 7, 4), funnelAt(-4, -52, 40, 18, grey, 7, 4)];
      fts.forEach(t => k.funnel([t[0] + 2, t[1]], 200, .5));
      // tripod mast, aft mast
      for (const dx of [-8, 8]) k.spar(along([[70 + dx, -66], [70, -150]], 6), 1.8);
      k.spar(along([[70, -66], [70, -176]], 8), 2.4);
      k.wash([[62, -150], [78, -150], [76, -140], [64, -140]], greyD, .85, 2, .3);
      k.spar(along([[-60, -40], [-62, -120]], 6), 2);
      k.rope([70, -176], [-62, -120], 6, .35);
      // turrets: two forward (one superfiring), two aft, twin barrels each
      for (const [x, y, dir] of [[132, top(132) - 1, 1], [100, -46, 1], [-96, -42, -1], [-128, top(-128) - 1, -1]]) {
        const tp = [[x - 15, y], [x + 15, y], [x + 12, y - 11], [x - 12, y - 11]];
        if (y < -40) k.wash([[x - 8, y], [x + 8, y], [x + 8, top(x) + 1], [x - 8, top(x) + 1]], greyD, .8, 2, .3);
        k.wash(tp, mixc(grey, C.ink, .15), .92, 2, .3); k.ink([tp[3], tp[0], tp[1], tp[2]], .9, C.ink, { a: .6 });
        for (const dy of [-4, -7.5]) k.line(along([[x + dir * 10, y + dy], [x + dir * 50, y + dy - 2]], 4), 2.2, greyD, { prof: 'even', nb: 0, a: .95 });
      }
      k.spar(along([[-176, top(-176)], [-180, -60]], 5), 1.4); k.flag([-180, -60], 32, 20);
      k.flag([70, -176], 30, 8, 'pennant');
      topP = [70, -176];
      if (o.damage) for (let i = 0; i < 6; i++) { const x = rnd(-140, 150); k.wash(WC.blobPts(x, top(x) + rnd(4, 20), 5, 4, 10, .3), C.ink, .9, 2, .3); }
      if (o.burning) { const at = [[-90, -52], [30, -56], [110, -40]]; k.char(at); at.forEach(([x, y], i) => k.fire([x, y], [52, 64, 44][i])); }
    }
    return done(k, o, topP);
  };

  // a seated figure painted as brush masses (no outline): body, head, cap, an arm reaching to x2,y2
  function figure(k, x, y, ht, o = {}) {
    const lean = o.lean ?? -5, cloth = o.col || pick([C.cloth, C.clothB, C.clothC, mixc(C.cloth, C.wood, .4)]);
    const sh = [x + lean, y - ht * .78];
    k.line(qcurve(x + 2, y, sh[0], sh[1], -3, 6), ht * .3, cloth, { prof: 'leaf', nb: 3, a: .9 });
    k.line(qcurve(x + 2, y - 2, sh[0] + 2, sh[1] + 4, -2, 5), ht * .12, mixc(cloth, C.ink, .35), { prof: 'leaf', nb: 0, a: .5 });
    k.dab(sh[0] - lean * .2, sh[1] - ht * .06, ht * .17, ht * .17, C.skin, .92);
    k.dab(sh[0] - lean * .2, sh[1] - ht * .17, ht * .15, ht * .08, o.cap || pick([C.ink, C.wood, C.red, C.paperDark]), .85);
    if (o.arm) k.line(qcurve(sh[0], sh[1] + ht * .08, o.arm[0], o.arm[1], 3, 5), ht * .08, cloth, { prof: 'tip', nb: 0, a: .9 });
  }

  // rowboat, 220 long
  G.rowboat = (sc, o = {}) => {
    const k = kit(sc, o, { maxA: .45, depth: 26, noFlag: true, flagCol: C.red });
    const hc = mixc(C.wood, C.paperLight, .1), dark = mixc(C.wood, C.ink, .4);
    const top = x => { const u = x / 110; return -(16 + 13 * u * u); };
    const sheer = (x0, x1, d = 0, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
    const P = [...sheer(-110, 110, 0, 16), ...qctrl(110, top(110), 112, 0, 96, 6, 5).slice(1), [-96, 6], ...qctrl(-96, 6, -112, 0, -110, top(-110), 5).slice(1, -1)];
    k.water(P);
    // the far side of the hull, seen over the near gunwale
    k.wash([...sheer(-104, 104, 0, 12), ...sheer(-104, 104, 0, 12).reverse().map(([x, y]) => [x, y - 6 * (1 - Math.pow(x / 104, 2))])], dark, .75, 2, .4);
    k.wash(P, hc, .85);
    k.wash([...sheer(-104, 104, 8, 12), [96, 6], [-96, 6]], dark, .35, 2);
    k.planks(sheer, -106, 106, 2, 18, mixc(C.wood, C.ink, .25), 4, 3.5);
    for (const d of [5, 10]) k.line(sheer(-104, 104, d, 12), .9, C.ink, { prof: 'even', nb: 0, a: .3 });
    k.line(sheer(-108, 108, 1.4, 14), 3, mixc(C.wood, C.paperLight, .4), { prof: 'even', nb: 0, a: .9 });
    k.ink(sheer(-110, 110, 0, 14), 1.3, C.ink, { a: .8 });
    const nr = clamp(Math.round(o.rowers ?? 2), 0, 3), xs = [[], [0], [-34, 36], [-56, 0, 56]][nr];
    for (const x of xs) {
      const hand = [x - 20, -38];
      k.line(along([[hand[0] - 4, hand[1] - 3], [x - 1, 4]], 6), 1.8, dark, { prof: 'even', nb: 0, a: .9 });
      figure(k, x, top(x) + 4, 52, { arm: hand, lean: 9 });
      k.dab(x - 1, 2, 3.6, 7, dark, .8, PI / 2);
    }
    if (!nr) k.line(along([[-60, top(-60) - 3], [50, top(50) - 6]], 6), 2, dark, { prof: 'even', nb: 0, a: .85 });
    k.spar(along([[-104, top(-104)], [-106, -60]], 4), 1.4); k.flag([-106, -60], 26, 16);
    if (o.burning) { k.char([[0, top(0)]]); k.fire([0, top(0) - 2], 40); }
    return done(k, o, [0, -90]);
  };

  // raft, 220 wide: lashed logs, a patched square sail, survivors huddled on it
  G.raft = (sc, o = {}) => {
    const k = kit(sc, o, { maxA: .3, depth: 14, noFlag: true, wake: false });
    const logs = shades(C.wood, .16, 4), N = 7;
    k.water([[-112, -1], [124, -1], [124, 3], [-112, 3]]);
    for (let j = N - 1; j >= 0; j--) {
      const y = -3 - j * 3.3, dx = j * 4;
      k.line(qcurve(-108 + dx + rnd(-4, 4), y, 104 + dx + rnd(-4, 4), y + rnd(-1, 1), rnd(-1, 1), 10), 7.2, pick(logs), { prof: 'even', nb: 3, a: .92 });
      k.dab(104 + dx, y, 6, 3, mixc(C.wood, C.paperLight, .35), .9, 0);
    }
    k.ink(along([[-108, -1], [104, -1]], 10), 1.4, C.ink, { a: .7 });
    for (const x of [-70, 0, 70]) k.line(along([[x, -1], [x + 22, -26]], 4), 2.2, C.clothC, { prof: 'even', nb: 0, a: .7 });
    if (o.sail !== false) {
      k.spar(along([[6, -16], [10, -178]], 8), 4);
      squareSail(k, 9, -166, 104, 112, 104, { col: mixc(SAIL(), C.clothC, .2), torn: !!o.damage, belly: .45 });
      k.wash([[-20, -140], [6, -140], [6, -112], [-20, -112]], C.clothC, .35, 2, .5);
      k.wash([[22, -100], [44, -100], [44, -80], [22, -80]], C.paperDark, .45, 2, .5);
      k.rope([10, -176], [-104, -12], -4); k.rope([10, -176], [118, -22], 4);
    }
    const np = clamp(Math.round(o.people ?? 2), 0, 4), px = [-66, -34, 54, 82].slice(0, np);
    px.forEach((x, i) => figure(k, x, -14 - (x > 0 ? 6 : 0), i === 3 ? 62 : 46, { lean: x > 0 ? 6 : -6, arm: i === 3 ? [x + 20, -92] : undefined }));
    k.flag([10, -178], 30, 18);
    return done(k, o, [10, -178]);
  };

  // sailboat, 200 long: a small fishing boat, sloop or lateen rigged
  G.sailboat = (sc, o = {}) => {
    const k = kit(sc, o, { maxA: .5, depth: 34, noFlag: true });
    const hc = mixc(C.clothB, C.paperLight, .15), dark = mixc(C.clothB, C.ink, .4);
    const sail = o.sail === 'red' ? mixc(C.red, C.clothC, .5) : SAIL(), torn = !!o.damage || !!o.burning;
    const top = x => { const u = x / 100; return -(16 + 9 * Math.pow(Math.max(0, u), 2) + 3 * Math.pow(Math.max(0, -u), 2)); };
    const sheer = (x0, x1, d = 0, n = 14) => Array.from({ length: n + 1 }, (_, i) => { const x = mix(x0, x1, i / n); return [x, top(x) + d]; });
    const P = [...sheer(-100, 100, 0, 14), ...qctrl(100, top(100), 98, 2, 82, 8, 5).slice(1), [-80, 8], [-98, 0]];
    k.water(P);
    k.wash(P, hc, .85);
    k.wash([...sheer(-96, 98, 8, 12), [84, 8], [-80, 8]], dark, .35, 2);
    k.planks(sheer, -98, 98, 2, 16, dark, 4, 3.5);
    k.line(sheer(-98, 98, 2.5, 14), 2.4, C.red, { prof: 'even', nb: 0, a: .75 });
    k.ink(sheer(-100, 100, 0, 14), 1.2, C.ink, { a: .75 });
    k.ink([[-98, 0], [-100, top(-100)]], 1.1);
    if (o.rig === 'lateen') {
      k.spar(along([[30, top(30)], [34, -170]], 8), 3);
      triSail(k, [104, -30], [-80, -236], [-74, -32], { col: sail, torn });
      k.flag([-80, -236], 46, 7, 'pennant');
    } else {
      const mt = [16, -232];
      k.spar(along([[15, top(15)], mt], 10), 3);
      triSail(k, [15, -36], mt, [-86, -38], { col: sail, torn, yard: false });
      triSail(k, [98, -26], [16, -192], [38, -30], { col: sail, torn, yard: false });
      k.spar(along([[15, -36], [-90, -38]], 6), 2.2);
      k.rope(mt, [100, top(100)], 2); k.rope(mt, [-98, top(-98)], -2);
      k.flag(mt, 40, 7, 'pennant');
    }
    if (o.burning) { k.char([[-20, top(-20)]]); k.fire([-20, top(-20) - 2], 44); }
    return done(k, o, [16, -232]);
  };

  // submarine, 340 long: sink lowers it straight down; its hull under the water is always a pale wash
  G.submarine = (sc, o = {}) => {
    const k = kit(sc, o, { maxA: .04, depth: 72, ghost: true, ghostA: .26, flagCol: C.red, noFlag: true });
    const hc = mixc(C.stoneDark, C.night, .35), hl = mixc(hc, C.paperLight, .25);
    const P = [];
    for (let i = 0; i <= 24; i++) { const u = -1 + i / 12; P.push([u * 170, 6 - 16 * Math.pow(1 - u * u, .3) - (u > .85 ? (u - .85) * 30 : 0)]); }
    for (let i = 24; i >= 0; i--) { const u = -1 + i / 12; P.push([u * 170, 6 + 15 * Math.pow(1 - u * u, .35)]); }
    k.water(P);
    k.wash(P, hc, .88);
    const deck = along([[-140, -10], [150, -11], [168, -14]], 16);
    k.wash([...deck, [168, -8], [-140, -6]], hl, .7, 2, .4);
    k.ink(deck, 1, C.ink, { a: .6 });
    const tw = [[-32, -10], [-28, -44], [18, -46], [30, -40], [38, -10]];
    k.water(tw);
    k.wash(tw, hc, .9, 3, .5); k.wash([[-28, -44], [18, -46], [24, -42], [-26, -40]], hl, .6, 2, .3);
    k.ink(tw.slice(0, 4), 1.1, C.ink, { a: .7 });
    k.line(along([[-26, -50], [22, -50]], 6), .9, C.ink, { prof: 'even', nb: 0, a: .6 });
    for (const x of [-22, -6, 10]) k.line([[x, -50], [x, -45]], .8, C.ink, { prof: 'even', nb: 0, a: .6 });
    k.spar(along([[0, -46], [1, -92]], 6), 2.4, mixc(C.ink, C.night, .3)); k.spar(along([[-9, -46], [-9, -76]], 5), 1.8, mixc(C.ink, C.night, .3));
    k.line(along([[1, -92], [6, -92]], 3), 2.4, C.ink, { prof: 'even', nb: 0, a: .9 });
    k.spar(along([[60, -11], [60, -18]], 3), 4, hc); k.line(along([[54, -21], [92, -24]], 6), 2.6, C.ink, { prof: 'even', nb: 0, a: .9 });
    k.rope([166, -14], [16, -58], 2, .4); k.rope([-28, -50], [-166, -6], -2, .4);
    k.flag([-26, -52], 30, 18);
    if (k.sink > .6) {     // only the periscope left: its feather of foam
      const p = k.T([1, 0]), f = FOAM();
      k.S.push(mk(qcurve(p[0] + 4 * sc, -1 * sc, p[0] - 40 * sc, 3 * sc, -2 * sc, 8), 4 * sc, f, { prof: 'tip', nb: 3, a: .8 }));
      k.S.push(mk(qcurve(p[0] + 2 * sc, 1 * sc, p[0] - 70 * sc, 5 * sc, 2 * sc, 8), 2.5 * sc, f, { prof: 'leaf', nb: 2, a: .5 }));
    }
    if (o.burning) { k.char([[0, -46]]); k.fire([0, -46], 40); }
    return done(k, o, [1, -92]);
  };

  // ================================================================ SEA AND LAND
  // a big breaking wave curling to the right: the swell's back, the lip thrown forward and curling under, its
  // shadowed face, flow lines spiralling into the curl, foam along the crest, a falling curtain, spray (live)
  G.wave = (sc, o = {}) => {
    const h = 300 * sc * (o.h ?? 1), S = [], foam = FOAM(), deep = mixc(C.waterDeep, C.ink, .3);
    const Q = (a, b, cc, n = 10) => qctrl(a[0] * h, a[1] * h, cc[0] * h, cc[1] * h, b[0] * h, b[1] * h, n);
    const back = Q([-1.2, 0], [-.02, -.94], [-.52, -.04], 18);
    const crest = Q([-.02, -.94], [.3, -1.0], [.1, -1.05], 6);
    const lip = Q([.3, -1.0], [.62, -.7], [.57, -.97], 8);
    const hook = Q([.62, -.7], [.48, -.6], [.6, -.55], 6);
    const curtain = Q([.48, -.6], [.7, -.1], [.62, -.4], 8);
    const foot = Q([.7, -.1], [1.1, 0], [.86, -.02], 8);
    const outer = [...back, ...crest.slice(1), ...lip.slice(1), ...hook.slice(1)], n = outer.length, iC = back.length - 1, iL = iC + crest.length - 1;
    const nrm = outer.map((p, i) => { const a = outer[Math.max(0, i - 1)], b = outer[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; });
    const off = (d, i0 = 0, i1 = n - 1) => outer.slice(i0, i1 + 1).map((p, j) => [p[0] + nrm[i0 + j][0] * d, p[1] + nrm[i0 + j][1] * d]);
    const band = (i0, i1, d0, d1) => [...off(d0, i0, i1), ...off(d1, i0, i1).reverse()];
    const above = P => P.filter(([, y]) => y < -.03 * h);
    S.push(washShape(densify([...outer, ...curtain.slice(1), ...foot.slice(1)], 12 * sc), C.water, .7, 3, 3 * sc));
    // the face under the curl, in shadow
    S.push(washShape(densify([...hook.slice(-2), ...curtain.slice(1), [.5 * h, -.08 * h], [.3 * h, -.3 * h], [.3 * h, -.62 * h]], 10 * sc), C.waterDeep, .42, 3, 2.5 * sc));
    // light through the thin lip, the dark hollow under it
    S.push(washShape(band(iC - 3, n - 3, 0, .1 * h), mixc(C.water, C.green, .35), .32, 2, 2 * sc));
    S.push(washShape(band(iL + 2, n - 1, .03 * h, .13 * h), deep, .5, 3, 1.5 * sc));
    // flow lines that follow the swell up and spiral into the curl
    [.04, .09, .15, .21, .28, .36, .45].forEach((d, j) => {
      const pts = above(off(d * h, Math.round(j * 1.5), n - 1 - Math.round(d * n * .9)));
      if (pts.length < 4) return;
      S.push(mk(pts, rnd(3, 7) * sc, j % 3 === 2 ? C.paperLight : j > 3 ? deep : C.waterDeep, { prof: 'leaf', nb: 5, a: j % 3 === 2 ? .35 : rnd(.32, .5), rough: .4 }));
    });
    for (let i = 0; i < 6; i++) {        // streaks on the back of the swell
      const a = Math.floor(rnd(2, iC - 6)), d = rnd(.04, .2) * h;
      S.push(mk(above(off(d, a, a + Math.floor(rnd(4, 7)))), rnd(3, 6) * sc, i % 2 ? C.paperLight : C.waterDeep, { prof: 'leaf', nb: 3, a: .3 }));
    }
    // foam: along the crest and lip, claws at the lip, the falling curtain, a churned pile at the foot, spray
    S.push(mk(off(2 * sc, iC - 4, n - 2), 15 * sc, foam, { prof: 'leaf', nb: 8, a: .85 }));
    S.push(mk(off(8 * sc, iC, n - 1), 7 * sc, foam, { prof: 'tip', nb: 4, a: .55 }));
    for (let i = 0; i < 9; i++) {
      const j = Math.min(n - 1, iL + 1 + i), [x, y] = outer[j], a = Math.atan2(-nrm[j][1], -nrm[j][0]) + rnd(-.5, .5), L = rnd(12, 28) * sc;
      S.push(mk(qcurve(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, rnd(5, 10) * sc, 6), rnd(4, 7) * sc, foam, { prof: 'tip', nb: 2, a: .85 }));
    }
    for (let i = 0; i < 7; i++) {
      const sh = rnd(-.04, .05) * h, pts = curtain.map(([x, y], j) => [x + sh * (1 - j / 8) + rnd(-2, 2) * sc, y]);
      S.push(mk(pts.slice(0, Math.floor(rnd(5, 9))), rnd(3, 8) * sc, foam, { prof: 'brush', nb: 4, a: rnd(.45, .75) }));
    }
    for (let i = 0; i < 6; i++) S.push(washShape(WC.blobPts(rnd(.5, 1.1) * h, rnd(-.09, -.02) * h, rnd(.06, .13) * h, rnd(.03, .05) * h, 18, .3), foam, .55, 2, 2 * sc));
    for (let i = 0; i < 8; i++) { const x = rnd(.35, 1.15) * h, y = rnd(-.06, .01) * h; S.push(mk(qcurve(x, y, x + rnd(30, 80) * sc, y + rnd(-3, 3) * sc, rnd(-4, 4) * sc, 8), rnd(3, 6) * sc, foam, { prof: 'leaf', nb: 4, a: .7 })); }
    for (let i = 0; i < 16; i++) { const x = rnd(.1, .8) * h, y = rnd(-1.14, -.98) * h + Math.abs(x / h - .4) * .2 * h; S.push(mk(polar(x, y, rnd(0, 6.28), rnd(2, 6) * sc, 0, 3), rnd(2.5, 5) * sc, foam, { prof: 'leaf', nb: 0, a: .8 })); }
    S.push(...inkLine(back.slice(8), 1.5 * sc, C.inkSoft, { step: 3, a: .35 }));
    const live = (c, lt, it) => {
      begin(c, it, lt, false);
      const ga = c.globalAlpha;
      c.fillStyle = rgba(foam, .8);
      for (let i = 0; i < 16; i++) {
        const q = (lt * .45 + hash(i * 3.7)) % 1, x0 = (.35 + hash(i) * .3) * h, y0 = (-1.0 + hash(i + 9) * .1) * h;
        const x = x0 + q * .3 * h, y = y0 - Math.sin(q * PI) * .14 * h + q * q * .14 * h, r = (1.6 + hash(i * 5) * 2.6) * sc;
        c.globalAlpha = ga * (1 - q); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      }
      c.globalAlpha = ga;
    };
    return { S, live, top: [.1 * h, -h] };
  };

  // an iceberg; its underwater part is a pale, much bigger wash
  G.iceberg = (sc, o = {}) => {
    const w = 300 * sc * (o.w ?? 1), h = 210 * sc * (o.h ?? 1), S = [];
    const ks = [[-.5, 0], [-.45, -.2], [-.37, -.3], [-.3, -.62], [-.2, -.56], [-.1, -1], [.02, -.84], [.1, -.92], [.2, -.6], [.32, -.54], [.42, -.26], [.5, 0]];
    const top = ks.map(([x, y], i) => i === 0 || i === ks.length - 1 ? [x * w, 0] : [x * w + rnd(-.02, .02) * w, y * h * rnd(.88, 1.08)]);
    const under = [[-.56, 0], [-.7, .22], [-.74, .55], [-.6, .95], [-.42, 1.25], [-.2, 1.55], [.08, 1.72], [.3, 1.55], [.5, 1.22], [.7, .78], [.76, .4], [.62, .12], [.52, 0]]
      .map(([x, y]) => [x * w + rnd(-.04, .04) * w, y * h * rnd(.9, 1.1)]);
    // under water: a big pale ghost, softer and bluer toward its depth, a few faint facets
    S.push(washShape(densify(under, 16 * sc), mixc(C.water, C.paperLight, .35), .24, 3, 6 * sc));
    S.push(washShape(densify(under.slice(3, 11).map(([x, y]) => [x * .8, y * .95 + .1 * h]), 16 * sc), mixc(C.water, C.waterDeep, .3), .12, 2, 6 * sc));
    for (let i = 0; i < 5; i++) { const x = rnd(-.4, .5) * w; S.push(mk(qcurve(x, rnd(.15, .4) * h, x + rnd(-.15, .15) * w, rnd(.8, 1.4) * h, rnd(-10, 10) * sc, 8), rnd(6, 12) * sc, mixc(C.water, C.paperLight, .4), { prof: 'leaf', nb: 4, a: .18 })); }
    S.push(...inkLine(under.concat([under[0]]), 1.1 * sc, mixc(C.waterDeep, C.paperLight, .25), { step: 2, a: .22 }));
    // above: ice is the paper, breathed on with sky; faces turned away from the light take a cool blue
    S.push(washShape(densify(top, 10 * sc), mixc(C.paperLight, C.sky, .3), .55, 3, 1.6 * sc));
    const sh = mixc(C.sky, C.waterDeep, .35);
    for (let i = 1; i < top.length - 1; i++) {
      const a = top[i], b = top[i + 1];
      if (b[1] <= a[1]) continue;      // a slope facing right, away from the light
      const F = [a, b, [b[0] - .04 * w, b[1] * .35], [a[0] + .02 * w, a[1] * .45]];
      S.push(washShape(densify(F, 8 * sc), sh, .42, 2, 1.4 * sc));
      for (const pts of rowsOf(F, { dir: 'v', gap: 7 * sc, broken: .2 })) S.push(mk(pts, 4 * sc, sh, { prof: 'even', nb: 3, a: .18, rough: .4 }));
    }
    const pk = top.reduce((m, p) => p[1] < m[1] ? p : m, top[1]);
    S.push(washShape([pk, ...top.filter(p => p[0] > pk[0]), [pk[0] + .1 * w, 0]], sh, .25, 2, 1.5 * sc));
    for (let i = 0; i < 6; i++) { const p = top[Math.floor(rnd(2, top.length - 2))]; S.push(mk(qcurve(p[0], p[1] + 6 * sc, p[0] + rnd(-.05, .06) * w, p[1] * rnd(.2, .5), rnd(-6, 6) * sc, 6), rnd(1.2, 2.4) * sc, i % 2 ? C.inkSoft : C.waterDeep, { prof: 'tip', nb: 0, a: .4 })); }
    S.push(washShape([[-.5 * w, 0], [.5 * w, 0], [.46 * w, -.08 * h], [-.46 * w, -.06 * h]], mixc(C.water, C.sky, .4), .3, 2, 1.5 * sc));
    for (let i = 0; i < top.length - 1; i++) if (rnd() < .8) S.push(...inkLine([top[i], top[i + 1]], 1.7 * sc, C.inkSoft, { step: 1, a: .55 }));
    S.push(mk(qcurve(-.56 * w, 1 * sc, .56 * w, 1 * sc, 0, 16), 2.4 * sc, mixc(C.waterDeep, C.ink, .2), { prof: 'even', nb: 0, a: .45 }));
    for (let i = 0; i < 6; i++) { const x = rnd(-.55, .5) * w; S.push(mk(qcurve(x, rnd(-2, 2) * sc, x + rnd(20, 50) * sc, rnd(-1, 2) * sc, 0, 6), rnd(3, 5) * sc, FOAM(), { prof: 'leaf', nb: 3, a: .8 })); }
    return { S, top: pk };
  };

  // a rocky island with trees on top
  G.island = (sc, o = {}) => {
    const w = 420 * sc * (o.w ?? 1), hr = 95 * sc * (o.h ?? 1), S = [], ph = rnd(0, 20);
    const prof = [];
    for (let i = 0; i <= 22; i++) { const u = -1 + i / 11; prof.push([u * w / 2, -hr * (1 - Math.pow(Math.abs(u), 5)) * (.78 + .38 * WC.vnoise(ph + u * 3.2))]); }
    const P = [[-w / 2, 2 * sc], ...prof, [w / 2, 2 * sc]];
    S.push(washShape(P, C.stone, .8, 3, 2 * sc));
    S.push(washShape([...prof.slice(11), [w / 2, 0], [w * .05, 0]], mixc(C.stoneDark, C.stone, .3), .42, 2, 2 * sc));
    S.push(washShape([[-w / 2, 0], ...prof.map(([x, y]) => [x, Math.max(y, -14 * sc)]), [w / 2, 0]], mixc(C.stoneDark, C.ink, .2), .38, 2, 1.5 * sc));
    for (let i = 0; i < 12; i++) {
      const j = Math.floor(rnd(2, 21)), [x, y] = prof[j];
      S.push(mk(qcurve(x, y + 10 * sc, x + rnd(-8, 8) * sc, rnd(-12, 0) * sc, rnd(-6, 6) * sc, 6), rnd(2, 4) * sc, i % 3 ? C.stoneDark : C.ink, { prof: 'tip', nb: 0, a: .45 }));
    }
    for (let i = 0; i < 4; i++) { const y = -hr * rnd(.25, .6), x = rnd(-.3, .2) * w; S.push(mk(qcurve(x, y, x + rnd(60, 140) * sc, y + rnd(-6, 6) * sc, rnd(-4, 4) * sc, 8), rnd(1.5, 2.5) * sc, C.stoneDark, { prof: 'leaf', nb: 0, a: .35 })); }
    // green cap along the top and leaf clumps
    const cap = prof.slice(2, 21);
    S.push(washShape([...cap.map(([x, y]) => [x, y - 4 * sc]), ...cap.slice().reverse().map(([x, y], i) => [x, y + rnd(10, 26) * sc])], C.mid, .65, 3, 2 * sc));
    const cols = shades(C.leaf, .18);
    for (let i = 2; i < 21; i += 1.5) { const [x, y] = prof[Math.floor(i)]; WC.clump(S, x + rnd(-8, 8) * sc, y + 2 * sc, rnd(12, 20) * sc, 7, cols, { l0: 8 * sc, l1: 16 * sc, w0: 6 * sc, w1: 10 * sc, sx: 1.5, sy: .6 }); }
    const tg = ['pine', 'cypress', 'palm', 'tree'].includes(o.tree) ? o.tree : 'pine', nt = Math.round(o.trees ?? 3);
    for (let i = 0; i < nt; i++) {
      const u = nt === 1 ? rnd(-.2, .2) : mix(-.5, .5, i / (nt - 1)) + rnd(-.08, .08), j = Math.round((u + 1) * 11), [x, y] = prof[clamp(j, 0, 22)];
      const t = G[tg](sc * rnd(.45, .62), {}).S;
      if (S.length + t.length > 520) break;          // keep the island under the stroke budget (palms are leafy)
      S.push(...shiftS(t, x, y + 3 * sc));
    }
    for (let i = 0; i < 7; i++) { const x = rnd(-.52, .52) * w, r = rnd(10, 22) * sc; S.push(washShape(WC.blobPts(x, -r * .25, r, r * .5, 14, .2).map(([a, b]) => [a, Math.min(b, 1 * sc)]), mixc(C.stone, C.stoneDark, .4), .8, 2, 1 * sc)); }
    S.push(...inkLine(prof, 2 * sc, C.ink, { step: 3, a: .55 }));
    S.push(washShape([[-w * .52, 0], [w * .52, 0], [w * .45, 9 * sc], [-w * .45, 9 * sc]], C.waterDeep, .28, 2, 1.5 * sc));
    S.push(mk(qcurve(-w * .54, .6 * sc, w * .54, .6 * sc, 0, 16), 2.4 * sc, mixc(C.waterDeep, C.ink, .3), { prof: 'even', nb: 0, a: .5 }));
    for (let i = 0; i < 8; i++) { const x = rnd(-.55, .5) * w; S.push(mk(qcurve(x, rnd(-2, 1) * sc, x + rnd(20, 50) * sc, rnd(0, 2) * sc, 0, 6), rnd(3, 5) * sc, FOAM(), { prof: 'leaf', nb: 3, a: .8 })); }
    return { S, top: [0, -hr * 1.6] };
  };

  // a humpback whale: its tail raised, breaching, or its back with a blow
  G.whale = (sc, o = {}) => {
    const S = [], pose = ['breach', 'back'].includes(o.pose) ? o.pose : 'tail', s = sc;
    const body = mixc(C.night, C.waterDeep, .45), bodyD = mixc(body, C.ink, .3), belly = mixc(C.stone, C.paperLight, .35), foam = FOAM();
    const ribbon = (cl, hw) => { const L = [], R = []; cl.forEach((p, i) => { const a = cl[Math.max(0, i - 1)], b = cl[Math.min(cl.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, w = hw(i / (cl.length - 1)); L.push([p[0] - dy / d * w, p[1] + dx / d * w]); R.push([p[0] + dy / d * w, p[1] - dx / d * w]); }); return { L, R, P: [...L, ...R.reverse()] }; };
    const splash = (x0, x1, n, hh) => {
      for (let i = 0; i < n; i++) { const x = rnd(x0, x1), a = -PI / 2 + rnd(-.9, .9); S.push(mk(polar(x, rnd(-2, 2) * s, a, rnd(.4, 1) * hh, rnd(-6, 6) * s, 6), rnd(3, 7) * s, foam, { prof: 'tip', nb: 2, a: rnd(.6, .9) })); }
      for (let i = 0; i < 4; i++) S.push(washShape(WC.blobPts(rnd(x0, x1), -rnd(2, 8) * s, rnd(14, 30) * s, rnd(5, 9) * s, 16, .3), foam, .55, 2, 1.5 * s));
      for (let i = 0; i < 3; i++) { const r = (x1 - x0) / 2 * (1.1 + i * .3); S.push(mk(qcurve((x0 + x1) / 2 - r, 3 * s + i * 3 * s, (x0 + x1) / 2 + r, 3 * s + i * 3 * s, (6 + i * 3) * s, 14), 2.5 * s, i % 2 ? C.waterDeep : foam, { prof: 'leaf', nb: 0, a: .45 })); }
    };
    let live, topP;
    if (pose === 'tail') {
      S.push(washShape([[-10 * s, 4 * s], [-150 * s, 40 * s], [-190 * s, 70 * s], [-120 * s, 60 * s], [10 * s, 18 * s]], mixc(C.waterDeep, C.water, .5), .16, 2, 3 * s));
      const st = ribbon(qcurve(-2 * s, 8 * s, 16 * s, -118 * s, -16 * s, 12), t => mix(30, 9, Math.pow(t, .8)) * s);
      S.push(washShape(densify(st.P, 8 * s), body, .88, 3, 1.6 * s));
      S.push(washShape([...st.R].concat(qcurve(-2 * s, 8 * s, 16 * s, -118 * s, -16 * s, 12)), bodyD, .3, 2, 1 * s));   // st.R runs top → base (ribbon reverses it)
      const ph = rnd(0, 9), serr = pts => pts.map(([x, y], i) => i && i < pts.length - 1 ? [x, y - WC.vnoise(ph + i * .9) * 5 * s] : [x, y]);
      const lL = qctrl(12 * s, -114 * s, -40 * s, -116 * s, -116 * s, -178 * s, 12), lT = serr(qctrl(-116 * s, -178 * s, -56 * s, -156 * s, 14 * s, -144 * s, 14));
      const rT = serr(qctrl(16 * s, -144 * s, 86 * s, -156 * s, 142 * s, -174 * s, 14)), rL = qctrl(142 * s, -174 * s, 72 * s, -118 * s, 22 * s, -114 * s, 12);
      const fl = [...lL, ...lT.slice(1), ...rT.slice(1), ...rL.slice(1)];
      S.push(washShape(fl, body, .9, 3, 1.2 * s));
      for (const pts of rowsOf(fl, { gap: 7 * s, broken: .2, bend: 2 * s })) S.push(mk(pts, 5 * s, bodyD, { prof: 'even', nb: 4, a: .22, rough: .4 }));
      // the pale underside markings of a humpback's flukes (every animal has its own pattern)
      for (let i = 0; i < 5; i++) {
        const side = i % 2 ? 1 : -1, d = rnd(22, 78), x = 14 + side * d, y = side < 0 ? -129 - d * .38 : -129 - d * .37;
        S.push(washShape(WC.blobPts(x * s, y * s, rnd(7, 13) * s, rnd(3, 5) * s, 14, .45), belly, .38, 2, 1 * s));
      }
      S.push(washShape([...lL.slice(4), ...lT.slice(0, 5)], bodyD, .3, 2, 1 * s));
      S.push(...inkLine(lT, 1.5 * s, C.ink, { step: 2, a: .65 }), ...inkLine(rT, 1.5 * s, C.ink, { step: 2, a: .65 }));
      S.push(...inkLine(lL, 1.2 * s, C.ink, { step: 3, a: .45 }), ...inkLine(rL, 1.2 * s, C.ink, { step: 3, a: .45 }), ...inkLine(st.R, 1.2 * s, C.ink, { step: 3, a: .45 }));
      for (let i = 0; i < 6; i++) { const p = (i < 3 ? lT : rT)[3 + (i % 3) * 3]; S.push(mk(qcurve(p[0], p[1] + 2 * s, p[0] + rnd(-3, 3) * s, p[1] + rnd(20, 60) * s, rnd(-3, 3) * s, 6), rnd(1.4, 2.4) * s, foam, { prof: 'tip', nb: 0, a: .45 })); }
      splash(-40 * s, 44 * s, 10, 34 * s);
      const drips = [...lT.filter((_, i) => i % 4 === 2), ...rT.filter((_, i) => i % 4 === 2)];
      live = (c, lt, it) => {
        begin(c, it, lt, false);
        c.strokeStyle = rgba(foam, .7); c.lineCap = 'round'; c.lineWidth = 1.6 * s;
        c.beginPath();
        drips.forEach(([x, y], i) => { for (let m = 0; m < 3; m++) { const q = (lt * .8 + hash(i * 7 + m * 3)) % 1, yy = y + q * q * (-y) * .97, xx = x + (hash(i + m) - .5) * 8 * s; c.moveTo(xx, yy); c.lineTo(xx, yy + (3 + q * 6) * s); } });
        c.stroke();
      };
      topP = [10 * s, -172 * s];
    } else if (pose === 'breach') {
      // the body bursting up out of the sea, back arched to the left, pale grooved throat toward the viewer
      const cl = qcurve(-30 * s, 34 * s, 70 * s, -250 * s, -34 * s, 20);
      const rb = ribbon(cl, t => (7 + 41 * Math.pow(Math.sin(PI * (.18 + .82 * t)), .7)) * s), bel = rb.L, bk = rb.P.slice(21).reverse();
      S.push(washShape(clipPoly(rb.P, 0, true), mixc(C.water, C.waterDeep, .5), .2, 2, 2 * s));
      const bodyQ = clipPoly(densify(rb.P, 8 * s));
      S.push(washShape(bodyQ, body, .9, 3, 1.6 * s));
      for (const pts of rowsOf(bodyQ, { gap: 7 * s, broken: .2 })) S.push(mk(pts, 5 * s, bodyD, { prof: 'even', nb: 4, a: .2, rough: .4 }));
      S.push(washShape(clipPoly([...bk.slice(3, 20), ...bk.slice(3, 20).map((p, j) => lerp(p, cl[j + 3], .35)).reverse()]), bodyD, .35, 2, 1 * s));
      const throat = clipPoly([...bel.slice(9, 20), ...bel.slice(9, 20).map((p, j) => lerp(p, cl[j + 9], .6)).reverse()]);
      if (throat.length > 2) S.push(washShape(densify(throat, 6 * s), belly, .7, 3, 1 * s));
      for (const f of [.14, .28, .42, .54]) { const r = clipRuns(bel.slice(9, 20).map((p, j) => lerp(p, cl[j + 9], f)))[0]; if (r) S.push(mk(r, 1.1 * s, mixc(C.ink, belly, .35), { prof: 'tip', nb: 0, a: .5 })); }
      const mouth = clipRuns(bel.slice(13, 21).map((p, j) => lerp(p, cl[j + 13], .62)))[0]; if (mouth) S.push(mk(mouth, 1.6 * s, C.ink, { prof: 'tip', nb: 0, a: .7 }));
      const eye = lerp(cl[15], bel[15], .5); S.push(mk(polar(eye[0], eye[1], .4, 3.5 * s, 0, 3), 3.4 * s, C.ink, { prof: 'leaf', nb: 0, a: .9 }));
      for (let i = 0; i < 9; i++) { const j = 16 + (i % 5), m = lerp(cl[j], bk[j] || cl[j], rnd(.15, .7)); S.push(mk(polar(m[0], m[1], rnd(0, 6.28), 3 * s, 0, 3), 4.5 * s, mixc(bodyD, C.ink, .2), { prof: 'leaf', nb: 0, a: .7 })); }
      S.push(...inkLine(clipRuns(bk)[0] || bk, 1.6 * s, C.ink, { step: 3, a: .6 }), ...inkLine(clipRuns(bel)[0] || bel, 1.2 * s, C.inkSoft, { step: 3, a: .45 }));
      // the long white pectoral fin flung out, its leading edge knobbed
      const fb = bel[9], fin = ribbon(qcurve(fb[0], fb[1], fb[0] + 116 * s, fb[1] + 36 * s, -18 * s, 12), t => (1 - t * .8) * 12 * s);
      S.push(washShape(fin.P, mixc(belly, C.paperLight, .3), .8, 3, .8 * s));
      S.push(washShape([...fin.R].concat(qcurve(fb[0], fb[1], fb[0] + 116 * s, fb[1] + 36 * s, -18 * s, 12)), mixc(belly, C.stoneDark, .3), .3, 2, .6 * s));
      S.push(...inkLine(fin.L.map(([x, y], i) => [x, y - (i % 2 ? 2.2 : 0) * s]), 1.2 * s, C.ink, { step: 2, a: .6 }), ...inkLine(fin.R, 1 * s, C.inkSoft, { step: 3, a: .45 }));
      // where it leaves the water: a burst of white
      const xs = bodyQ.filter(([, y]) => y > -2 * s).map(([x]) => x), x0 = Math.min(...xs), x1 = Math.max(...xs);
      splash(x0 - 30 * s, x1 + 30 * s, 18, 80 * s);
      live = (c, lt, it) => {
        begin(c, it, lt, false);
        c.fillStyle = rgba(foam, .8);
        for (let i = 0; i < 16; i++) { const q = (lt * .6 + hash(i * 2.3)) % 1, x = mix(x0 - 30 * s, x1 + 30 * s, hash(i)) + (hash(i * 4) - .5) * q * 60 * s, y = -Math.sin(q * PI) * (40 + hash(i * 5) * 70) * s; c.beginPath(); c.arc(x, y, (1.5 + hash(i * 3) * 2.5) * s, 0, 7); c.fill(); }
      };
      topP = [70 * s, -250 * s];
    } else {
      const backP = [[-170 * s, 2 * s], ...qctrl(-170 * s, 2 * s, -40 * s, -46 * s, 130 * s, -20 * s, 14).slice(1), ...qctrl(130 * s, -20 * s, 160 * s, -8 * s, 170 * s, 2 * s, 5).slice(1)];
      S.push(washShape([[-160 * s, 2 * s], [170 * s, 2 * s], [150 * s, 40 * s], [-140 * s, 34 * s]], mixc(C.water, C.waterDeep, .5), .18, 2, 3 * s));
      S.push(washShape(backP, body, .9, 3, 1.5 * s));
      S.push(washShape([[-60 * s, -26 * s], [-46 * s, -44 * s], [-36 * s, -30 * s]], body, .9, 2, .5 * s));
      S.push(...inkLine(backP.slice(0, 18), 1.6 * s, C.ink, { step: 3, a: .6 }));
      for (let i = 0; i < 6; i++) { const x = rnd(40, 150) * s; S.push(mk(polar(x, -14 * s - (150 * s - x) * .08, rnd(0, 6), 3 * s, 0, 3), 4 * s, bodyD, { prof: 'leaf', nb: 0, a: .6 })); }
      for (const xx of [-170, 165]) for (let i = 0; i < 3; i++) S.push(mk(qcurve((xx + rnd(-14, 4)) * s, rnd(-2, 1) * s, (xx + rnd(14, 34)) * s, rnd(0, 2) * s, 0, 6), rnd(3, 5) * s, foam, { prof: 'leaf', nb: 3, a: .8 }));
      S.push(mk(qcurve(-150 * s, 2 * s, 150 * s, 2 * s, -3 * s, 16), 3 * s, foam, { prof: 'leaf', nb: 4, a: .45 }));
      live = (c, lt, it) => {
        begin(c, it, lt, false);
        const per = 5.5, q = ((lt + hash(ikOf(it)) * per) % per) / per;
        if (q > .55) return;
        const u = q / .55;
        for (let i = 0; i < 12; i++) {
          const hh = 150 * s * Math.pow(u, .6) * (.4 + hash(i) * .6), side = i % 2 ? 1 : -1;
          puff(c, 72 * s + side * hh * .22 * hash(i * 3), -36 * s - hh, (8 + hh * .18) * (.7 + hash(i * 7) * .5), mixc(C.paperLight, C.sky, .3), .55 * (1 - u) + .1);
        }
      };
      topP = [72 * s, -190 * s];
    }
    return { S, live, top: topP };
  };

  // ================================================================ WEATHER AND DISASTERS
  // a volcanic cone, erupting (live) or quietly steaming
  G.volcano = (sc, o = {}) => {
    const w = 600 * sc * (o.w ?? 1), h = 300 * sc * (o.h ?? 1), cw = w * .06, S = [], ph = rnd(0, 20);
    const yOf = x => { const ax = Math.abs(x); if (ax <= cw) return -h; const u = (ax - cw) / (w / 2 - cw); return -h * Math.pow(1 - u, 2.1) * (1 + .05 * (WC.vnoise(ph + x / w * 9) - .5)); };
    const xr = y => cw + (1 - Math.pow(clamp(-y / h), 1 / 2.1)) * (w / 2 - cw);
    const sil = []; for (let i = 0; i <= 40; i++) { const x = -w / 2 + i * w / 40; sil.push([x, yOf(x)]); }
    const P = [...sil, [w / 2, 3 * sc], [-w / 2, 3 * sc]];
    S.push(washShape(densify(P, 14 * sc), mixc(C.stone, C.far, .5), .72, 3, 2.5 * sc));
    for (const pts of rowsOf(P, { gap: 12 * sc, broken: .25, bend: 3 * sc })) S.push(mk(pts, 6 * sc, mixc(C.stoneDark, C.far, .4), { prof: 'even', nb: 4, a: .12, rough: .45 }));
    S.push(washShape(densify([[0, -h], ...sil.filter(([x]) => x > 0), [w * .12, 0]], 14 * sc), mixc(C.stoneDark, C.night, .2), .4, 2, 3 * sc));
    // the upper cone darkened by ash, graded: three glazes, each reaching a little lower, with soft wavy lower edges
    for (const k of [.52, .66, .8]) {
      const edge = []; for (let i = 0; i <= 10; i++) { const x = mix(xr(-h * k), -xr(-h * k), i / 10); edge.push([x, -h * k + Math.sin(i * 1.7 + k * 9) * h * .04]); }
      S.push(washShape(densify([...sil.filter(([, y]) => y < -h * k), ...edge], 10 * sc), mixc(C.stoneDark, C.ink, .3), .13, 2, 4 * sc));
    }
    // ridges and gullies running down from the crater, catching light on one side
    for (let i = 0; i < 16; i++) {
      const f = rnd(-.92, .92), y0 = -h * rnd(.9, .98), y1 = -h * rnd(0, .35), pts = [];
      for (let j = 0; j <= 8; j++) { const y = mix(y0, y1, j / 8); pts.push([f * xr(y) + Math.sin(j * 1.3 + i) * 4 * sc, y]); }
      S.push(mk(pts, rnd(2.5, 5) * sc, i % 4 ? C.stoneDark : C.ink, { prof: 'brush', nb: 2, a: rnd(.3, .5) }));
      if (i % 2) S.push(mk(pts.map(([x, y]) => [x - 4 * sc, y]), rnd(2, 3.5) * sc, mixc(C.stone, C.paperLight, .4), { prof: 'tip', nb: 0, a: .35 }));
    }
    // green lower slopes
    const gb = sil.filter(([, y]) => y > -h * .16);
    S.push(washShape([...gb.filter(([x]) => x < 0), [-xr(-h * .14), -h * .14], [-w * .3, -h * .02], [-w * .3, 0]], C.mid, .45, 2, 2 * sc));
    S.push(washShape([[w * .3, 0], [w * .3, -h * .02], [xr(-h * .14), -h * .14], ...gb.filter(([x]) => x > 0)], C.mid, .45, 2, 2 * sc));
    const cols = shades(C.leaf, .18);
    for (let i = 0; i < 14; i++) { const x = (rnd() < .5 ? -1 : 1) * rnd(.25, .48) * w; WC.clump(S, x, -rnd(2, 14) * sc, rnd(10, 18) * sc, 7, cols, { l0: 8 * sc, l1: 15 * sc, w0: 6 * sc, w1: 10 * sc, sx: 1.6, sy: .6 }); }
    // crater rim
    S.push(washShape([[-cw * 1.2, -h + 2 * sc], [cw * 1.2, -h + 2 * sc], [cw * .7, -h + 10 * sc], [-cw * .7, -h + 10 * sc]], mixc(C.ink, C.stoneDark, .3), .6, 2, 1 * sc));
    S.push(...inkLine(sil, 1.8 * sc, C.ink, { step: 3, a: .5 }));
    const erupt = o.erupt !== false;
    // lava flows (built here, painted live as they creep down)
    const flows = [];
    if (erupt) for (let i = 0; i < 3; i++) {
      const f = [-.35, .15, .55][i] + rnd(-.1, .1), y1 = -h * rnd(.2, .5), pts = [];
      for (let j = 0; j <= 12; j++) { const y = mix(-h * .97, y1, j / 12); pts.push([f * xr(y) + Math.sin(j * .9 + i * 2) * 6 * sc, y]); }
      flows.push([mk(pts, 10 * sc, C.fire, { prof: 'tip', nb: 3, a: .85 }), mk(pts, 4 * sc, C.gold, { prof: 'tip', nb: 0, a: .95 })]);
    }
    const live = (c, lt, it) => {
      begin(c, it, lt, false);
      const ik = ikOf(it);
      if (!erupt) { column(c, 0, -h, h * .9, lt, ik, .3, .6, mixc(C.smoke, C.paperLight, .3)); return; }
      const t = lt - startOf(c, it, o, S.length), e = ss(seg(t, 0, 2.5));
      if (t < 0) return;
      const Hc = h * 1.8 * (o.ash ?? 1), ash = mixc(C.smoke, C.ink, .3);
      glow(c, 0, -h, (70 + 10 * Math.sin(lt * 5)) * sc * (.5 + e * .5), C.fire, .5 * e);
      // the ash column: puffs rising from the crater, spreading into an umbrella
      const N = 34, rate = .14;
      for (let i = N - 1; i >= 0; i--) {
        const q = (t * rate + i / N + hash(i + ik) * .02) % 1;
        if (t - q / rate < 0) continue;
        const sp = q > .55 ? (hash(i * 3.3) - .5) * Hc * 1.2 * ss((q - .55) / .45) : 0;
        const x = Math.sin(q * 5 + i) * Hc * .04 + q * q * Hc * .22 + sp, y = -h - Math.pow(q, .85) * Hc;
        const r = Hc * (.05 + .16 * q) * (.7 + .6 * hash(i * 7.1)), a = .7 * Math.pow(Math.sin(PI * Math.min(1, q * 1.08)), .5) * e;
        puff(c, x, y, r, mixc(ash, C.smoke, q * .5 + hash(i * 1.7) * .3), a);
        if (q < .35) puff(c, x, y + r * .3, r * .8, C.fire, .32 * (1 - q / .35) * e);     // lit from below by the crater
      }
      // lava flows creeping down, pulsing
      flows.forEach(([a, b], j) => { const p = ss(seg(t, .6 + j * .8, 8 + j * 2)), am = .75 + .25 * Math.sin(lt * 3 + j); drawS(c, a, p, null, am); drawS(c, b, p * .97, null, am); });
      // lava bombs on arcs
      for (let j = 0; j < 9; j++) {
        const P2 = 1.3 + hash(j * 5.1) * 1.1, q = ((t + hash(j * 7) * P2) / P2) % 1;
        if (t < .4 + hash(j) * .6) continue;
        const dir = (hash(j * 3) - .5) * 2, x = dir * w * .2 * q, y = -h - 4 * q * (1 - q) * h * (.3 + .4 * hash(j * 9)) + q * q * h * .3;
        const xb = dir * w * .2 * (q - .05), yb = -h - 4 * (q - .05) * (1.05 - q) * h * (.3 + .4 * hash(j * 9)) + (q - .05) * (q - .05) * h * .3;
        c.strokeStyle = rgba(C.fire, .6 * e); c.lineWidth = 2.5 * sc; c.lineCap = 'round'; c.beginPath(); c.moveTo(xb, yb); c.lineTo(x, y); c.stroke();
        c.fillStyle = rgba(C.gold, .95 * e); c.beginPath(); c.arc(x, y, 3.2 * sc, 0, 7); c.fill();
      }
      glow(c, 0, -h + 4 * sc, 26 * sc, C.gold, .7 * e);
    };
    return { S, live, top: [0, -h] };
  };

  // lightning: a bolt from a cloud base h above the origin down to it, flashing at intervals
  G.lightning = (sc, o = {}) => {
    const h = 700 * sc * (o.h ?? 1), per = o.every ?? 2.4, nb = o.branches ?? 3;
    const live = (c, lt, it) => {
      begin(c, it, lt, false);
      const ik = ikOf(it), t = lt + hash(ik + 1) * per, k = Math.floor(t / per), f = t - k * per;
      if (hash(k * 7.7 + ik) < .2) return;            // now and then a beat without a strike
      const env = f < .06 ? f / .06 : f < .12 ? 1 - (f - .06) / .06 * .75 : f < .18 ? .25 + (f - .12) / .06 * .75 : f < .6 ? 1 - (f - .18) / .42 : 0;
      if (env <= 0) return;
      const n = 14, pts = [], x0 = (hash(k * 3.1 + ik) - .5) * h * .25;
      for (let i = 0; i <= n; i++) { const s = i / n; pts.push([mix(x0, 0, s) + (i && i < n ? (hash(k * 13 + i * 1.7) - .5) * h * .1 : 0), -h + s * h]); }
      const br = [];
      for (let b = 0; b < nb; b++) {
        const i0 = 2 + Math.floor(hash(k * 5 + b * 11) * 8), dir = hash(k + b * 3.3) < .5 ? -1 : 1, seg2 = [pts[i0]];
        for (let m = 1; m <= 5; m++) { const [px, py] = seg2[m - 1]; seg2.push([px + dir * (8 + hash(k * 17 + b * 5 + m) * 22) * sc * (h / 700 / sc), py + (14 + hash(k * 19 + b + m * 2) * 20) * (h / 700)]); }
        br.push(seg2);
      }
      glow(c, pts[3][0], pts[3][1], h * .55, C.paperLight, .22 * env);
      glow(c, 0, 0, h * .12, mixc(C.paperLight, C.gold, .3), .35 * env);
      const path = L => { c.beginPath(); L.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = rgba(mixc(C.paperLight, C.gold, .35), .25 * env); c.lineWidth = 16 * sc; path(pts);
      c.strokeStyle = rgba(C.paperLight, .55 * env); c.lineWidth = 6 * sc; path(pts);
      c.strokeStyle = rgba(C.paperLight, .97 * env); c.lineWidth = 2.6 * sc; path(pts);
      c.lineWidth = 1.5 * sc; c.strokeStyle = rgba(C.paperLight, .75 * env); br.forEach(path);
    };
    return { S: [], live, top: [0, -h] };
  };

  // explosion: a burst of fire and smoke from start, debris thrown out, settling into a smoke column
  G.explosion = (sc, o = {}) => {
    const R = 120 * sc * (o.size ?? 1), smk = mixc(C.smoke, C.ink, .3);
    const live = (c, lt, it) => {
      begin(c, it, lt, false);
      const ik = ikOf(it), t = lt - startOf(c, it, o, 0);
      if (t < 0) return;
      if (t < 1.4) glow(c, 0, -R * .4, R * (1.4 + t * 2), C.gold, .5 * (1 - t / 1.4));
      // smoke billows thrown up and out, then rising, spreading and thinning
      for (let i = 0; i < 18; i++) {
        const a = -PI / 2 + (hash(i * 3.7 + ik) - .5) * 2.6, sp = .45 + hash(i * 5.3) * .7, g = eo(t / 1.8);
        const x = Math.cos(a) * R * sp * g * 1.25 + Math.sin(t * .5 + i) * R * .06, y = Math.sin(a) * R * sp * g * .9 - t * R * .14 - R * .3;
        const r = R * (.2 + .42 * eo(t / 2.8)) * (.6 + hash(i * 9.1) * .6), al = .6 * (1 - ss(seg(t, 3, 9))) * ss(seg(t, .05, .3));
        puff(c, x, y, r, mixc(smk, C.smoke, hash(i) * .7), al);
      }
      // the fireball: a hot core and tongues of flame thrown outward, burning out
      const fb = 1 - ss(seg(t, .3, 1.9));
      if (fb > 0) {
        puff(c, 0, -R * .35, R * (.45 + eo(t / .3) * .5), C.fire, .6 * fb);
        for (let i = 0; i < 12; i++) {
          const a = (hash(i * 2.9 + ik) - .5) * 3.6, L = R * (.45 + hash(i * 4.1) * .7) * eo(t / .35) * (1 + t * .25);
          c.save(); c.translate(0, -R * .3); c.rotate(a); tongue(c, 0, 0, L, lt, i + ik * 5, fb); c.restore();
        }
        puff(c, 0, -R * .35, R * .38 * eo(t / .25), C.gold, .8 * fb);
      }
      // debris on arcs
      if (t < 2) {
        c.strokeStyle = rgba(C.ink, .8 * (1 - t / 2)); c.lineCap = 'round'; c.lineWidth = 3 * sc * (o.size ?? 1);
        c.beginPath();
        for (let i = 0; i < 14; i++) {
          const a = -PI / 2 + (hash(i * 8.3 + ik) - .5) * 2.6, v = R * (2.2 + hash(i * 1.9) * 2.5);
          const x = Math.cos(a) * v * t, y = Math.sin(a) * v * t + 1.6 * R * t * t - R * .3;
          if (y > 0) continue;
          const r = (2 + hash(i) * 4) * sc, sp = t * 9 + i;
          c.moveTo(x - Math.cos(sp) * r, y - Math.sin(sp) * r); c.lineTo(x + Math.cos(sp) * r, y + Math.sin(sp) * r);
        }
        c.stroke();
      }
      // afterwards: a column of smoke over a low fire
      const s2 = ss(seg(t, 1.5, 3.5));
      if (s2 > 0) {
        column(c, 0, -R * .3, R * 3.4, lt, ik + 3, .5 * s2, .6, smk);
        tongue(c, -R * .12, 0, R * .5 * s2, lt, ik + 9); tongue(c, R * .16, 0, R * .34 * s2, lt, ik + 10);
      }
    };
    return { S: [], live, top: [0, -R * 2] };
  };

  // cannon smoke: guns along a line fire in turn; a muzzle flash and a puff that drifts and thins
  G.cannon_smoke = (sc, o = {}) => {
    const n = Math.max(1, Math.round(o.n ?? 1)), w = 300 * sc * (o.w ?? (n > 1 ? 1 : 0)), per = o.every ?? 3.2, dir = o.dir === -1 ? -1 : 1;
    const xs = Array.from({ length: n }, (_, i) => n === 1 ? 0 : -w / 2 + i * w / (n - 1));
    const col = mixc(C.smoke, C.paperLight, .25), core = mixc(C.smoke, C.ink, .1);
    const live = (c, lt, it) => {
      begin(c, it, lt, false);
      const ik = ikOf(it), T0 = startOf(c, it, o, 0);
      xs.forEach((x0, i) => {
        const off = T0 + hash(i * 3.1 + ik) * per * .8 + i * .22, last = Math.floor((lt - off) / per);
        for (let j = Math.max(0, last - 2); j <= last; j++) {
          const age = lt - off - j * per; if (age < 0 || age > 6) continue;
          if (age < .16) { const k = 1 - age / .16; puff(c, x0 + dir * 12 * sc, 0, 16 * sc * (1 + age * 4), C.gold, .9 * k); puff(c, x0 + dir * 20 * sc, 0, 10 * sc, C.fire, .8 * k); }
          for (let m = 0; m < 7; m++) {
            const g = 1 - Math.pow(1 - Math.min(1, age / 1.4), 3), hm = hash(i * 7 + j * 13 + m * 3.3);
            const x = x0 + dir * (g * (26 + m * 12) + age * 7) * sc + (hm - .5) * 10 * sc, y = -(age * 7 + m * 2.5 + hm * 8) * sc;
            puff(c, x, y, (12 + m * 3.5 + age * 14) * sc * (.8 + hm * .4), m < 2 && age < 1.5 ? core : col, .75 * (1 - ss(age / 6)) * ss(Math.min(1, age / .1)));
          }
        }
      });
    };
    return { S: [], live, top: [0, -60 * sc] };
  };

  // a fire along a width: a city or a field burning (put it in front of / among the houses it burns)
  G.burning = (sc, o = {}) => {
    const w = 400 * sc * (o.w ?? 1), fh = sc * (o.h ?? 1), S = [], city = o.style !== 'field', n = Math.max(3, Math.round(8 * (o.w ?? 1)));
    const scorch = [[-w * .54, 5 * sc], ...Array.from({ length: 13 }, (_, i) => [mix(-w * .5, w * .5, i / 12), -rnd(3, 12) * sc]), [w * .54, 5 * sc], ...Array.from({ length: 9 }, (_, i) => [mix(w * .45, -w * .45, i / 8), rnd(8, 16) * sc])];
    S.push(washShape(scorch, mixc(C.ink, C.wood, .3), .4, 3, 3 * sc));
    for (const pts of rowsOf(scorch, { gap: 5 * sc, broken: .3 })) S.push(mk(pts, 4 * sc, C.ink, { prof: 'even', nb: 3, a: .2, rough: .45 }));
    if (city) for (let i = 0; i < 12; i++) { const x = rnd(-.46, .46) * w; S.push(washShape(WC.blobPts(x, -rnd(2, 6) * sc, rnd(6, 16) * sc, rnd(3, 6) * sc, 10, .4), pick([C.stoneDark, C.ink, C.wood]), .7, 2, 1 * sc)); }
    else for (let i = 0; i < 40; i++) { const x = rnd(-.5, .5) * w; S.push(mk(polar(x, 2 * sc, -PI / 2 + rnd(-.4, .4), rnd(6, 14) * sc, 0, 3), 1.6 * sc, C.ink, { prof: 'tip', nb: 0, a: .6 })); }
    for (let i = 0; i < 16; i++) { const x = rnd(-.48, .48) * w; S.push(mk(polar(x, -rnd(0, 6) * sc, rnd(-.3, .3), rnd(6, 14) * sc, 0, 3), rnd(3, 5) * sc, i % 2 ? C.fire : C.gold, { prof: 'leaf', nb: 0, a: .85 })); }
    const fl = Array.from({ length: n }, (_, i) => ({ x: -w / 2 + (i + .5) / n * w + (hash(i * 1.3 + n) - .5) * w / n * .7, h: (city ? 60 + Math.pow(hash(i * 3.3 + n), 1.6) * 190 : 45 + hash(i * 3.3 + n) * 70) * fh }));
    const smk = mixc(C.smoke, C.ink, .35);
    const live = (c, lt, it) => {
      begin(c, it, lt, false);
      const ik = ikOf(it), k = ss(seg(lt - startOf(c, it, o, S.length), 0, 1.5));
      if (k <= 0) return;
      c.save(); c.scale(1, .45); glow(c, 0, -110 * fh / .45, w * .65, C.fire, .3 * k); c.restore();
      fl.forEach((f, i) => { if (i % 3 === 1) column(c, f.x, -f.h * .75, 420 * fh, lt, i + ik * 11, .55 * k, o.drift ?? .6, smk); });
      fl.forEach((f, i) => {
        const hh = f.h * k * (1 + .25 * Math.max(0, Math.sin(lt * .8 + i * 1.3)));
        tongue(c, f.x, 2 * sc, hh, lt, i + ik * 13);
        tongue(c, f.x + hh * .22, 2 * sc, hh * .6, lt, i + 7 + ik * 13);
      });
      const ga = c.globalAlpha; c.fillStyle = rgba(C.gold, .9);
      for (let m = 0; m < 18; m++) { const q = (lt * .35 + hash(m * 2.7 + ik)) % 1, f = fl[m % n], x = f.x + Math.sin(q * 6 + m) * 16 * sc, y = -q * 300 * fh - 20 * fh; c.globalAlpha = ga * (1 - q) * .9 * k; c.beginPath(); c.arc(x, y, 2.2 * sc, 0, 7); c.fill(); }
      c.globalAlpha = ga;
    };
    return { S, live, top: [0, -220 * fh] };
  };

  // a tornado: a swirling funnel from a cloud base to the ground, a cloud of debris and dust at its foot
  G.tornado = (sc, o = {}) => {
    const h = 640 * sc * (o.h ?? 1), tw = 300 * sc * (o.w ?? 1), bw = 34 * sc, S = [];
    const cloud = mixc(C.smoke, C.ink, .3), body = mixc(C.smoke, C.stoneDark, .3), dust = mixc(C.ground, C.smoke, .4);
    S.push(washShape(WC.blobPts(0, 2 * sc, 90 * sc, 10 * sc, 20, .3), mixc(C.ground, C.stoneDark, .4), .3, 2, 2 * sc));
    const N = 30, rad = s => bw / 2 + (tw / 2 - bw / 2) * Math.pow(s, 2.2);
    // the funnel's bands: partial, slanted arcs of different weights (painted once, swirled live)
    const rings = Array.from({ length: N }, (_, i) => {
      const s = clamp(i / (N - 1) + rnd(-.015, .015)), r = rad(s), a0 = -r * rnd(.55, 1), a1 = r * rnd(.45, 1);
      return { s, r, st: mk(qcurve(a0, -r * .1, a1, r * .08, r * .26, 10), (4 + 10 * s) * sc * rnd(.6, 1.3), i < 6 ? mixc(C.ground, body, .45) : pick(shades(body, .18)), { prof: 'leaf', nb: 5, a: rnd(.4, .6) }) };
    });
    const axis = (s, lt) => Math.sin(s * 2.4 + lt * .6) * h * .05 * s + s * s * h * .07 + Math.sin(lt * .4) * 18 * sc * (1 - s);
    const live = (c, lt, it) => {
      begin(c, it, lt, false);
      const L = [], R = [];
      for (let i = 0; i <= 16; i++) { const s = i / 16 * .96, x = axis(s, lt), y = -s * h, r = rad(s) * (1 + .06 * Math.sin(lt * 3 + i)); L.push([x - r, y]); R.push([x + r, y]); }
      const path = k => { c.beginPath(); L.forEach(([x, y], i) => { const xx = x + (R[i][0] - x) * k / 2; i ? c.lineTo(xx, y) : c.moveTo(xx, y); }); for (let i = 16; i >= 0; i--) c.lineTo(R[i][0] - (R[i][0] - L[i][0]) * k / 2, R[i][1]); c.closePath(); };
      path(0); c.fillStyle = rgba(body, .36); c.fill();
      path(.55); c.fillStyle = rgba(mixc(body, C.ink, .2), .22); c.fill();
      for (const [i, g] of rings.entries()) {
        const ph = lt * 4.5 + i * .9, x = axis(g.s, lt) + Math.sin(ph) * g.r * .2, y = -g.s * h;
        c.save(); c.translate(x, y); c.scale(.8 + .2 * Math.cos(ph), 1); drawS(c, g.st); c.restore();
      }
      // the wall cloud it hangs from, slowly turning
      const cx = axis(1, lt);
      for (let m = 0; m < 11; m++) { const a = lt * .25 + m * .63; puff(c, cx + Math.cos(a) * tw * .55 * (.4 + hash(m) * .6), -h + 4 * sc + Math.sin(a) * 18 * sc - (m % 2) * 20 * sc, (60 + hash(m * 3) * 70) * sc * (o.w ?? 1), m % 3 ? cloud : mixc(cloud, C.ink, .25), .52); }
      // dust boiling up at the foot, debris thrown round it
      const bx = axis(0, lt);
      for (let m = 0; m < 9; m++) { const a = lt * 1.4 + m * .7; puff(c, bx + Math.cos(a) * 70 * sc, -16 * sc - (m % 3) * 16 * sc + Math.sin(a) * 6 * sc, (34 + (m % 3) * 12) * sc, dust, .32); }
      c.lineCap = 'round';
      for (let m = 0; m < 18; m++) {
        const a = lt * 3.2 + hash(m) * 6.28, R0 = (36 + hash(m * 3) * 80) * sc, y = -(hash(m * 5) * 140 + 10) * sc - Math.sin(a) * R0 * .25;
        const x = bx + Math.cos(a) * R0, len = (3 + hash(m * 7) * 6) * sc, sp = lt * 8 + m;
        c.strokeStyle = rgba(m % 3 ? C.ink : C.wood, Math.sin(a) > 0 ? .85 : .4); c.lineWidth = 2.2 * sc;
        c.beginPath(); c.moveTo(x - Math.cos(sp) * len, y - Math.sin(sp) * len); c.lineTo(x + Math.cos(sp) * len, y + Math.sin(sp) * len); c.stroke();
      }
    };
    return { S, live, top: [0, -h] };
  };

  // a flood: muddy water rising from start, spreading out at its ends, rippling, with debris floating on it
  G.flood = (sc, o = {}) => {
    const w = 600 * sc * (o.w ?? 1), H = 110 * sc * (o.h ?? 1), rise = o.rise ?? 5;
    const mud = mixc(mixc(C.ground, C.wood, .4), C.waterDeep, .35), deep = mixc(mud, C.ink, .25), lite = mixc(mud, C.paperLight, .4);
    // brushwork inside the water, painted once: horizontal dry-brush strokes at fixed depths (0 surface .. 1 bottom)
    const tex = Array.from({ length: 12 }, (_, i) => { const x0 = rnd(-.36, 0) * w, L = rnd(.15, .36) * w; return { f: rnd(.05, .95), st: mk(qcurve(x0, 0, x0 + L, rnd(-3, 3) * sc, rnd(-4, 4) * sc, 10), rnd(5, 12) * sc, i % 3 ? deep : lite, { prof: 'leaf', nb: 5, a: rnd(.25, .4) }) }; });
    const live = (c, lt, it) => {
      begin(c, it, lt, false);
      const t = lt - startOf(c, it, o, 0), lv = H * ss(seg(t, 0, rise));
      if (lv < 1) return;
      const n = 36, surf = [], bot = [], prof = x => ss(clamp((1 - Math.abs(2 * x / w)) / .22));      // prof: 0 at the ends -> 1 inside
      for (let i = 0; i <= n; i++) { const x = -w / 2 + i * w / n; surf.push([x, -lv + (Math.sin(x * .02 / sc + lt * 1.4) * 3 + Math.sin(x * .045 / sc - lt * 2.1) * 1.5) * sc]); bot.push([x, (6 + hash(i * 1.7) * 8) * sc]); }
      const ramp = (colr, a) => { const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); for (const [t, k] of [[0, 0], [.13, 1], [.87, 1], [1, 0]]) g.addColorStop(t, rgba(colr, a * k)); return g; };
      const band = (colr, a, k) => {
        c.beginPath(); surf.forEach(([x, y], i) => { const yy = y + lv * k; i ? c.lineTo(x, yy) : c.moveTo(x, yy); }); for (let i = n; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath();
        c.fillStyle = ramp(colr, a); c.fill();
      };
      band(mud, .8, 0); band(deep, .25, .45);
      c.save(); c.beginPath(); surf.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); for (let i = n; i >= 0; i--) c.lineTo(bot[i][0], bot[i][1]); c.closePath(); c.clip();
      for (const gg of tex) { c.save(); c.translate(Math.sin(lt * .3 + gg.f * 9) * 12 * sc, -lv * (1 - gg.f)); drawS(c, gg.st); c.restore(); }
      c.restore();
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = ramp(lite, .6); c.lineWidth = 4 * sc; c.beginPath(); surf.forEach(([x, y], i) => i ? c.lineTo(x, y + 2 * sc) : c.moveTo(x, y + 2 * sc)); c.stroke();
      // ripples on the surface, planks floating
      c.lineWidth = 2.5 * sc;
      for (let i = 0; i < 14; i++) {
        const x = ((hash(i * 7) * w + lt * 18 * sc * (hash(i * 5) + .5)) % w) - w / 2, pf = prof(x), y = -lv + (6 + hash(i * 3) * .8 * lv / sc) * sc, len = (30 + hash(i) * 50) * sc * pf;
        if (pf < .2) continue;
        c.strokeStyle = rgba(C.paperLight, .35 * pf); c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y + 1); c.stroke();
      }
      for (let d = 0; d < 5; d++) {
        const x = ((hash(d * 9.1) * w + lt * (6 + hash(d) * 6) * sc) % (w * .8)) - w * .4, y = -lv + Math.sin(x * .02 / sc + lt * 1.4) * 3 * sc - 2 * sc, a = Math.sin(lt * .8 + d) * .12 + (hash(d * 3) - .5) * .6, L = (16 + hash(d * 4) * 30) * sc;
        c.strokeStyle = rgba(mixc(C.wood, C.ink, .3), .9); c.lineWidth = (3 + hash(d * 2) * 3) * sc;
        c.beginPath(); c.moveTo(x - Math.cos(a) * L / 2, y - Math.sin(a) * L / 2); c.lineTo(x + Math.cos(a) * L / 2, y + Math.sin(a) * L / 2); c.stroke();
      }
    };
    return { S: [], live, top: [0, -H] };
  };

  // an earthquake fissure across the ground: the dark gap, its far wall, branching cracks, rubble; live dust
  G.quake_crack = (sc, o = {}) => {
    const w = 520 * sc * (o.w ?? 1), g = 22 * sc * (o.open ?? 1), S = [], n = 22;
    const mid = Array.from({ length: n + 1 }, (_, i) => { const t = i / n; return [-w / 2 + t * w + (i && i < n ? rnd(-.012, .012) * w : 0), (rnd(-1, 1) * 7 + Math.sin(i * .7) * 5) * sc]; });
    const gap = mid.map((_, i) => g * Math.pow(Math.sin(PI * i / n), .6) * rnd(.6, 1.1));
    const far = mid.map(([x, y], i) => [x, y - gap[i] / 2]), near = mid.map(([x, y], i) => [x, y + gap[i] / 2]);
    S.push(washShape([...far.map(([x, y]) => [x, y - 14 * sc]), ...near.slice().reverse().map(([x, y]) => [x, y + 12 * sc])], mixc(C.ground, C.stoneDark, .45), .3, 2, 3 * sc));
    S.push(washShape([...far, ...near.slice().reverse()], mixc(C.stoneDark, C.ground, .25), .8, 3, 1 * sc));
    S.push(washShape([...far.map(([x, y], i) => [x, y + gap[i] * .45]), ...near.slice().reverse()], mixc(C.ink, C.stoneDark, .2), .82, 3, .8 * sc));
    S.push(...inkLine(near, 2.4 * sc, C.ink, { step: 2, a: .85 }));
    S.push(...inkLine(far, 1.5 * sc, C.inkSoft, { step: 2, a: .7 }));
    S.push(mk(along(near.map(([x, y]) => [x, y + 3 * sc]), 30), 2.5 * sc, mixc(C.ground, C.paperLight, .4), { prof: 'leaf', nb: 3, a: .5 }));
    // the slab on the near side has dropped: a step along part of the crack
    S.push(mk(along(far.slice(4, 15).map(([x, y]) => [x, y - 4 * sc]), 20), 4 * sc, mixc(C.ground, C.stoneDark, .3), { prof: 'leaf', nb: 3, a: .5 }));
    for (let b = 0; b < 7; b++) {
      const i = Math.floor(rnd(2, n - 2)), side = rnd() < .5 ? -1 : 1, start = side < 0 ? far[i] : near[i], pts = [start];
      let [x, y] = start; const len = rnd(40, 130) * sc * (o.w ?? 1) ** .3, ang = side < 0 ? -PI / 2 + rnd(-1.2, 1.2) : PI / 2 + rnd(-1.2, 1.2);
      for (let m = 1; m <= 5; m++) { x += Math.cos(ang + rnd(-.6, .6)) * len / 5; y += Math.sin(ang + rnd(-.6, .6)) * len / 5 * .45; pts.push([x, y]); }
      S.push(mk(pts, rnd(1.6, 3) * sc, C.ink, { prof: 'tip', nb: 0, a: .7 }));
      if (rnd() < .5) { const p = pts[2]; S.push(mk(polar(p[0], p[1], ang + rnd(-1.4, 1.4), len * .3, 2 * sc, 4), 1.2 * sc, C.ink, { prof: 'tip', nb: 0, a: .6 })); }
    }
    for (let i = 0; i < 22; i++) { const j = Math.floor(rnd(1, n)), p = rnd() < .5 ? far[j] : near[j], x = p[0] + rnd(-10, 10) * sc, y = p[1] + rnd(-6, 8) * sc; S.push(mk(polar(x, y, rnd(-.4, .4), rnd(4, 10) * sc, 0, 3), rnd(4, 8) * sc, pick([C.stone, C.stoneDark, C.ground]), { prof: 'leaf', nb: 0, a: .85 })); }
    const live = o.dust === false ? undefined : (c, lt, it) => {
      begin(c, it, lt, false);
      for (let i = 0; i < 7; i++) {
        const q = (lt * .22 + hash(i * 4.3)) % 1, j = 2 + Math.floor(hash(i * 2.1) * (n - 4)), [x, y] = mid[j];
        puff(c, x + q * 20 * sc, y - q * 70 * sc, (10 + q * 30) * sc, mixc(C.ground, C.smoke, .3), .3 * Math.sin(PI * q));
      }
    };
    return { S, live, top: [0, -20 * sc] };
  };
})();
