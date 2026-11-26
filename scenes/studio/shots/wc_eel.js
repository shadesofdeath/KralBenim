// wc_eel — topic objects and shots for "Humboldt's horses and electric eels" (videos/2026-11-26/ag-02-humboldt-electric-eels.json).
// Same contract as the other WC.G generators: local coordinates, y negative up, painted in order (structure first).
// electric_eel  an electric eel (Electrophorus): a long thick round body, a broad flat head with a small eye and a wide
//               mouth, dark olive back, a pale orange throat and belly, no back fin, one long rippling fin along the
//               underside to the tail tip. sc 1 ≈ 470 px long.
//               o: {pose: "swim" (lying along the ground / water, head to +x, a gentle S; origin = under its middle) |
//                   "rise" (head and neck arched up out of the water, chin forward to +x; origin = where the body crosses
//                   the water surface, the rest of the body runs down and back to the lower left), fat (×), col: back token}
//               parts: head chin eye body tail fin
// pond          a muddy dry-season pool on the llanos seen a little from above: a dark wet-mud rim, brown-green water,
//               pale sky streaks, reeds at both ends. sc 1 ≈ 900 × 170 px. Origin = its centre (place it with y).
//               live: slow rings spreading on the water. o: {w, h (px at sc 1), reeds: true|false, rings: n (4)}
//               parts: center left right near
// wc_eel_strike  side view at the water line. params:
//               mode: "pond" (default: a hot llanos day, the far bank with palms, a horse standing belly-deep in brown
//                     water; an eel rises out of the water and presses its chin against the horse's flank; on "fire"
//                     gold sparks pulse out from the contact again and again and the horse rears a little) |
//                     "tank" (a lab: a glass tank on a table, low clear water, an aluminium plate with a column of
//                     small lights dipped into it; the eel leaps up the plate, chin against it; on "fire" the lights glow)
//               rise: s | cue (when the eel starts to rise, default .25) · rise_dur (s, .9) · fire: s | cue (default 1.1)
//               pulse (s between discharges, .55) · flip: true (mirror the whole picture) · coat (horse coat) ·
//               painted: true (everything already painted at 0, for a first frame) · eel_s (× eel size) ·
//               second: true|false (a second eel gliding under the surface, pond only, default true) ·
//               notes: [{text, x, y, ax?, ay?, at, color, size, align}]
// wc_eel_herd   a wide llanos day: a muddy pond in the middle ground; a herd of horses gallops in from the left and wades
//               into it (their legs disappear under the brown water, rings spread), two riders drive them from behind.
//               params: {n (horses, 8), at (s | cue, when they start, default .1), riders: true, notes}
'use strict';
(() => {
  const C = WC.C, { mk, washShape, inkLine, mixc, along, qcurve, rnd, seg, ss, eo, eio, timeOf, clamp } = WC;
  const mixN = WC.mix;
  const tok = (v, fb) => (v && C[v]) ? C[v] : fb;
  const circ = (cx, cy, rx, ry = rx, n = 22) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const bez = (P0, P1, P2, P3, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * P0[k] + 3 * u * u * t * P1[k] + 3 * u * t * t * P2[k] + t * t * t * P3[k]); };
  const shift = (S, dx, dy) => S.map(s => {
    const m = ([x, y]) => [x + dx, y + dy];
    if (s.poly) return Object.assign({}, s, { poly: s.poly.map(r => r.map(m)), pts: s.pts.map(m) });
    return Object.assign({}, s, { pts: s.pts.map(m) });
  });

  // ------------------------------------------------------------------ electric_eel
  WC.G.electric_eel = (sc, o = {}) => {
    const S = [], pose = o.pose === 'rise' ? 'rise' : 'swim', R = 25 * sc * (o.fat ?? 1), ink = C.ink, n = 44;
    const L = 470 * sc;
    const spine = [];
    if (pose === 'rise') {
      const P0 = [70, -150], P1 = [-30, -185], P2 = [-70, 25], P3 = [-330, 130];
      for (let i = 0; i <= n; i++) { const p = bez(P0, P1, P2, P3, i / n); spine.push([p[0] * sc, p[1] * sc]); }
    } else {
      for (let i = 0; i <= n; i++) { const t = i / n; spine.push([L * .5 - t * L, -R * 1.05 + Math.sin(t * Math.PI * 1.7 + .5) * R * .7 - (1 - t) * R * .2]); }
    }
    // radius along the body: a broad rounded head, the thickest part just behind it, a long taper to a fine tail
    const rad = t => R * Math.max(.06, t < .07 ? .35 + .5 * Math.sqrt(t / .07) : t < .26 ? .85 + .15 * (t - .07) / .19 : 1 - Math.pow((t - .26) / .74, 1.5) * .93);
    const nrm = i => { const a = spine[Math.max(0, i - 1)], b = spine[Math.min(n, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
    const side = (k, t0 = 0, t1 = 1) => { const out = []; for (let i = Math.round(t0 * n); i <= Math.round(t1 * n); i++) { const [nx, ny] = nrm(i), r = rad(i / n) * k; out.push([spine[i][0] + nx * r, spine[i][1] + ny * r]); } return out; };
    const back = side(1), belly = side(-1);
    const body = back.concat(belly.slice().reverse());
    const backCol = o.col ? tok(o.col, C.leafDark) : mixc(C.leafDark, C.wood, .45), dark = mixc(ink, C.leafDark, .35);
    const throat = mixc(C.fire, C.clothC, .45), pale = mixc(C.ground, C.paperLight, .35);
    // shadow under it (swim pose only: it lies on mud or the pond floor)
    if (pose === 'swim' && o.shadow !== false) S.push(mk(along([[-L * .5, 4 * sc], [0, 8 * sc], [L * .48, 4 * sc]], 12), 22 * sc, mixc(C.ground, ink, .4), { prof: 'leaf', nb: 0, a: .22 }));
    // the long fin under the belly, from behind the throat to the tail tip (pale, see-through, fine rays)
    const finIn = side(-.92, .2, 1), finOut = []; for (let i = Math.round(.2 * n); i <= n; i++) { const t = i / n, [nx, ny] = nrm(i), r = rad(t) + R * .5 * Math.sin(Math.PI * Math.min(1, (t - .2) / .75)) * (1 - t * .3); finOut.push([spine[i][0] - nx * r, spine[i][1] - ny * r]); }
    const finMid = finIn.map((p, k) => [(p[0] + finOut[k][0]) / 2, (p[1] + finOut[k][1]) / 2]);
    S.push(mk(along(finMid, 40), R * .62, mixc(C.wood, C.paper, .4), { prof: 'leaf', nb: 5, a: .42, rough: .3 }));
    S.push(mk(along(finOut, 40), R * .14, mixc(C.wood, ink, .2), { prof: 'leaf', nb: 0, a: .3, rough: .3 }));
    // the body: olive wash, the dark back, the orange throat grading into a pale belly (continuous strokes, no tiles)
    S.push(washShape(body, backCol, .9, 3, .6 * sc));
    S.push(mk(along(side(.55), 44), R * .95, dark, { prof: 'leaf', nb: 6, a: .5, rough: .25 }));
    S.push(mk(along(side(-.55, .015, .34), 24), R * .8, throat, { prof: 'leaf', nb: 4, a: .6, rough: .2 }));
    S.push(mk(along(side(-.6, .22, .9), 36), R * .55, pale, { prof: 'leaf', nb: 4, a: .32, rough: .2 }));
    S.push(mk(along(side(-.45, .1, .5), 24), R * .5, mixc(throat, pale, .5), { prof: 'leaf', nb: 3, a: .25, rough: .2 }));
    // wet sheen along the back, dry-brush texture along the length
    S.push(mk(along(side(.5, .05, .55), 20), 7 * sc, C.paperLight, { prof: 'leaf', nb: 3, a: .42 }));
    for (let k = 0; k < 5; k++) { const a = rnd(.05, .4), b = Math.min(.95, a + rnd(.25, .45)); S.push(mk(along(side(rnd(-.4, .6), a, b), 18), rnd(6, 11) * sc, mixc(backCol, ink, .3), { prof: 'leaf', nb: 6, a: rnd(.14, .24), rough: .45 })); }
    // faint mottling of pale spots on the flank
    for (let k = 0; k < 14; k++) { const t = rnd(.12, .7), i = Math.round(t * n), [nx, ny] = nrm(i), r = rad(t) * rnd(-.3, .6); S.push(washShape(circ(spine[i][0] + nx * r, spine[i][1] + ny * r, rnd(2.5, 5) * sc, rnd(2, 3.5) * sc, 8), mixc(C.clothC, C.paperLight, .3), .35, 1, .3)); }
    // the small pectoral fin, the mouth, the eye
    { const i = Math.round(.11 * n), [nx, ny] = nrm(i), b0 = [spine[i][0] - nx * rad(.11) * .6, spine[i][1] - ny * rad(.11) * .6];
      const d = [spine[i + 2][0] - spine[i][0], spine[i + 2][1] - spine[i][1]], dl = Math.hypot(...d) || 1;
      const tip = [b0[0] + d[0] / dl * 26 * sc - nx * 14 * sc, b0[1] + d[1] / dl * 26 * sc - ny * 14 * sc];
      S.push(mk(qcurve(b0[0], b0[1], tip[0], tip[1], 6 * sc, 8), 12 * sc, mixc(C.wood, C.paper, .3), { prof: 'leaf', nb: 3, a: .6 })); }
    const mouth = side(-.35, 0, .07);
    S.push(mk(along(mouth, 8), 2.2 * sc, ink, { prof: 'tip', nb: 0, a: .7 }));
    const ie = Math.round(.035 * n), [enx, eny] = nrm(ie), er = rad(.035) * .45, eye = [spine[ie][0] + enx * er, spine[ie][1] + eny * er];
    S.push(washShape(circ(eye[0], eye[1], 4 * sc), ink, .9, 1, .2));
    S.push(washShape(circ(eye[0] - 1.2 * sc, eye[1] - 1.2 * sc, 1.3 * sc), C.paperLight, .8, 1, 0));
    // a row of sensory pores along the head
    for (let k = 0; k < 6; k++) { const t = .03 + k * .018, i = Math.round(t * n), [nx, ny] = nrm(i), r = rad(t) * .7; S.push(washShape(circ(spine[i][0] + nx * r, spine[i][1] + ny * r, 1.6 * sc), dark, .7, 1, 0)); }
    // the ink: a broken contour, firmer on the back
    S.push(...inkLine(back, 2.2 * sc, ink, { step: 3, a: .72 }));
    S.push(...inkLine(side(-1, 0, .3), 1.6 * sc, ink, { step: 3, a: .55 }));
    const at = t => spine[Math.round(t * n)];
    const chin = side(-1, .02, .03)[0];
    return { S, top: spine[0], parts: { head: spine[0], chin, eye, body: at(.3), tail: spine[n], fin: finOut[Math.round(finOut.length * .5)] } };
  };

  // ------------------------------------------------------------------ horse_shade
  // soft watercolour modelling laid over a library horse (pose stand, same sc): a dark wash pooled under the belly and
  // down the far legs, a cool glaze on the hindquarters, a pale wet light along the back, loose dry brush on the flank.
  // o: {face: 'left' (mirror)}
  WC.G.horse_shade = (sc, o = {}) => {
    const S = [], ink = C.ink, f = o.face === 'left' ? -1 : 1, P = pts => pts.map(([x, y]) => [x * sc * f, y * sc]);
    const sh = mixc(C.wood, ink, .45);
    S.push(mk(along(P([[-74, -96], [-30, -88], [20, -88], [62, -98]]), 24), 26 * sc, sh, { prof: 'leaf', nb: 6, a: .42, rough: .3 }));
    S.push(mk(along(P([[-70, -118], [-40, -100], [10, -96], [58, -108]]), 24), 16 * sc, sh, { prof: 'leaf', nb: 5, a: .22, rough: .3 }));
    S.push(washShape(P([[-70, -136], [-48, -142], [-34, -124], [-40, -100], [-66, -98], [-74, -114]]), mixc(C.waterDeep, C.wood, .55), .2, 3, 1.5 * sc));
    S.push(mk(along(P([[-56, -134], [-20, -139], [26, -138], [46, -134]]), 20), 9 * sc, C.paperLight, { prof: 'leaf', nb: 4, a: .26 }));
    for (let k = 0; k < 7; k++) { const x0 = rnd(-70, 30), y0 = rnd(-140, -100); S.push(mk(along(P([[x0, y0], [x0 + rnd(30, 60), y0 + rnd(-6, 8)]]), 10), rnd(5, 10) * sc, mixc(C.wood, ink, .3), { prof: 'leaf', nb: 5, a: rnd(.1, .2), rough: .45 })); }
    S.push(mk(along(P([[40, -150], [58, -178], [76, -196]]), 12), 9 * sc, sh, { prof: 'leaf', nb: 4, a: .22 }));
    return { S };
  };

  // ------------------------------------------------------------------ eel_rings
  // a patch of brown pond water where something has just gone under: concentric rings, a few bubbles. sc 1 ≈ 420 × 120.
  WC.G.eel_rings = (sc, o = {}) => {
    const S = [], w = 420 * sc, h = 120 * sc, wat = mixc(mixc(C.water, C.ground, .5), C.leafDark, .12);
    S.push(washShape(WC.blobPts(0, -h * .5, w * .5, h * .5, 36, .08), wat, .75, 3, 3 * sc));
    S.push(washShape(WC.blobPts(0, -h * .48, w * .3, h * .28, 28, .1), mixc(C.waterDeep, C.wood, .4), .3, 3, 2 * sc));
    for (const [k, a] of [[.18, .9], [.34, .7], [.52, .5], [.72, .3]]) S.push(mk(along(circ(0, -h * .5, w * .5 * k, h * .5 * k, 30).concat([[w * .5 * k, -h * .5]]), 40), 3.4 * sc, C.paperLight, { prof: 'even', nb: 0, a }));
    for (let i = 0; i < 5; i++) S.push(washShape(circ(rnd(-.12, .12) * w, -h * .5 + rnd(-.1, .1) * h, rnd(3, 6) * sc), C.paperLight, .8, 1, 0));
    S.push(...inkLine(WC.blobPts(0, -h * .5, w * .5, h * .5, 36, .05).slice(14, 34), 1.4 * sc, mixc(C.wood, C.ink, .4), { step: 3, a: .35 }));
    return { S };
  };

  // ------------------------------------------------------------------ pond
  WC.G.pond = (sc, o = {}) => {
    const S = [], w = (o.w ?? 900) * sc, h = (o.h ?? 170) * sc, ink = C.ink;
    const mud = mixc(C.wood, C.ground, .45), water = mixc(mixc(C.water, C.ground, .5), C.leafDark, .12);
    S.push(washShape(WC.blobPts(0, h * .04, w * .56, h * .66, 40, .08), mixc(C.ground, C.wood, .25), .45, 3, 4 * sc));
    S.push(washShape(WC.blobPts(0, h * .02, w * .52, h * .57, 40, .07), mud, .55, 3, 3 * sc));
    const edge = WC.blobPts(0, 0, w * .5, h * .5, 44, .05);
    S.push(washShape(edge, water, .85, 3, 2 * sc));
    S.push(washShape(WC.blobPts(w * .02, h * .06, w * .36, h * .3, 30, .1), mixc(C.waterDeep, C.wood, .4), .32, 3, 3 * sc));
    // the far rim in shadow, sky streaks on the water
    S.push(mk(along(edge.filter(([x, y]) => y < -h * .15).sort((a, b) => a[0] - b[0]), 30), 9 * sc, mixc(mud, ink, .35), { prof: 'leaf', nb: 4, a: .4 }));
    for (let k = 0; k < 9; k++) { const y = rnd(-.32, .36) * h, half = w * .44 * Math.sqrt(Math.max(0, 1 - Math.pow(y / (h * .5), 2))), x = rnd(-half * .7, half * .2); S.push(mk(qcurve(x, y, x + rnd(.25, .55) * half, y + rnd(-2, 2) * sc, rnd(-3, 3) * sc, 8), rnd(3, 6) * sc, C.paperLight, { prof: 'leaf', nb: 0, a: rnd(.3, .5) })); }
    for (let k = 0; k < 6; k++) { const y = rnd(-.3, .3) * h, x = rnd(-.35, .35) * w; S.push(mk(qcurve(x, y, x + rnd(60, 140) * sc, y, 0, 6), rnd(2, 4) * sc, mixc(C.sky, C.paperLight, .3), { prof: 'leaf', nb: 0, a: .4 })); }
    S.push(...inkLine(edge.slice(0, 23), 1.4 * sc, mixc(mud, ink, .5), { step: 3, a: .4 }));
    if (o.reeds !== false) {
      for (const [x, y, s] of [[-w * .47, h * .1, .9], [-w * .4, h * .3, .7], [w * .46, h * .05, .85], [w * .38, h * .32, .65]]) {
        const g = WC.G.reeds(sc * s);
        S.push(...shift(g.S, x, y));
      }
    }
    const nR = o.rings ?? 4, src = Array.from({ length: nR }, (_, i) => ({ x: rnd(-.32, .32) * w, y: rnd(-.25, .25) * h, ph: rnd(0, 1), per: rnd(2.2, 3.2) }));
    const live = (c, lt) => {
      c.lineCap = 'round';
      for (const s of src) for (let j = 0; j < 2; j++) {
        const age = ((lt / s.per + s.ph + j * .5) % 1 + 1) % 1, rx = (14 + age * 90) * sc;
        c.strokeStyle = WC.rgba(C.paperLight, .5 * (1 - age) * Math.min(1, age * 6)); c.lineWidth = 2.4 * sc;
        c.beginPath(); c.ellipse(s.x, s.y, rx, rx * .22, 0, 0, Math.PI * 2); c.stroke();
      }
    };
    return { S, live, parts: { center: [0, 0], left: [-w * .45, 0], right: [w * .45, 0], near: [0, h * .45] } };
  };

  // ------------------------------------------------------------------ shared live bits
  // gold sparks: pre-built bursts of jagged rays, each painted outward from the contact point and fading
  function sparkBursts(seed, r, n = 6) {
    return WC.withSeed(seed, () => Array.from({ length: n }, () => {
      const S = [];
      for (let k = 0; k < 7; k++) {
        const a = rnd(-Math.PI, Math.PI), len = r * rnd(.55, 1.1), pts = [[0, 0]];
        let x = 0, y = 0; for (let j = 1; j <= 5; j++) { const f = j / 5; x = Math.cos(a) * len * f + rnd(-.12, .12) * len; y = Math.sin(a) * len * f + rnd(-.12, .12) * len; pts.push([x, y]); }
        S.push(mk(along(pts, 14), rnd(4, 7), C.gold, { prof: 'tip', nb: 0, a: .9 }));
        S.push(mk(along(pts, 14), rnd(1.4, 2.2), mixc(C.fire, C.red, .3), { prof: 'tip', nb: 0, a: .75 }));
      }
      return S;
    }));
  }
  function drawSparks(X, bursts, x, y, lt, t0, per, scale = 1) {
    if (lt < t0) return;
    const k = Math.floor((lt - t0) / per), age = (lt - t0) - k * per;
    for (const kk of [k, k - 1]) {
      if (kk < 0) continue;
      const a = (lt - t0) - kk * per, life = per * 1.6; if (a > life) continue;
      const p = eo(a / (per * .6)), fade = 1 - ss(seg(a, per * .5, life));
      X.save(); X.translate(x, y); X.scale(scale, scale); X.globalAlpha = fade;
      const g = X.createRadialGradient(0, 0, 4, 0, 0, 120); g.addColorStop(0, WC.rgba(C.gold, .45)); g.addColorStop(1, WC.rgba(C.gold, 0));
      X.fillStyle = g; X.beginPath(); X.arc(0, 0, 120, 0, 7); X.fill();
      WC.drawList(X, bursts[kk % bursts.length], p);
      X.restore();
    }
    void age;
  }
  function drawNotes(X, P, lt, cues, W, H, portrait) {
    for (const n of (P.notes || [])) {
      const nt = timeOf(n.at, cues, 1.2);
      if (n.ax != null) {   // the words are written first, then the pen line reaches out to what they name
        const size = n.size || (portrait ? 54 : 44), lx = n.x * W, ly = n.y * H, ax = n.ax * W, ay = n.ay * H;
        const w = WC.hand(X, n.text, lx, ly, seg(lt, nt, nt + 1), { size, col: n.color === 'red' ? C.red : C.ink }) || 0;
        const sx = ax < lx ? lx - 10 : lx + w + 10;
        WC.leader(X, sx, ly, ax, ay, seg(lt, nt + .8, nt + 1.4), n.bend ?? 18);
      }
      else WC.hand(X, n.text, n.x * W, n.y * H, seg(lt, nt, nt + 1), { size: n.size || (portrait ? 58 : 46), align: n.align || 'center', col: n.color === 'red' ? C.red : C.ink });
    }
  }
  // a paper-coloured silhouette of an object (washes are see-through: the background must not show through a body)
  const _und = new Map();
  function under(g) {
    if (_und.has(g)) return _und.get(g);
    const s = g.spr, cv = document.createElement('canvas'); cv.width = s.cv.width; cv.height = s.cv.height;
    const c = cv.getContext('2d'); for (let i = 0; i < 5; i++) c.drawImage(s.cv, 0, 0);
    c.globalCompositeOperation = 'source-in'; c.fillStyle = C.paper; c.fillRect(0, 0, cv.width, cv.height);
    const u = { S: [], spr: { cv, x0: s.x0, y0: s.y0 } }; _und.set(g, u); return u;
  }
  // draw a sprite object clipped above (or below) a horizontal line, with an alpha
  function drawCut(X, g, x, y, line, above, a, p, o = {}) {
    X.save(); X.beginPath();
    if (above) X.rect(-5000, -5000, 10000, line + 5000); else X.rect(-5000, line, 10000, 10000);
    X.clip();
    if (o.solid) WC.drawObj(X, under(g), x, y, 1, Object.assign({}, o, { a: a * clamp(p * 1.5) * .92 }));
    WC.drawObj(X, g, x, y, p, Object.assign({ a }, o)); X.restore();
  }

  // ------------------------------------------------------------------ wc_eel_strike
  SHOTS.wc_eel_strike = { kind: '2d', build(ctx) {
    const P = ctx.P || {}, { W, H } = ctx, portrait = H > W, X = WC.canvas(ctx), tank = P.mode === 'tank';
    const flip = !!P.flip;
    const U = portrait ? H / 1920 : H / 1080;
    const yW = H * (tank ? (portrait ? .55 : .6) : (portrait ? .56 : .66));      // the water surface
    const back = WC.withSeed(ctx.seed * 17 + 5, () => {
      if (tank) {
        const cv = WC.backdrop(W, H, H * (portrait ? .76 : .82), { sky: 'none', land: 'interior', wall: 'stone', floor: 'wood' });
        const c = cv.getContext('2d');
        return cv;
      }
      const gy = H * (portrait ? .4 : .48);
      const cv = WC.backdrop(W, H, gy, { sky: 'day', land: 'plain', sun: P.sun ?? false, clouds: 2 });
      const c = cv.getContext('2d');
      // far bank: palms and low scrub, then the pond's water from the far bank down
      const yF = H * (portrait ? .45 : .54);
      for (const [x, s, k] of [[.1, .8, 1], [.24, .62, 2], [.83, .9, 3], [.93, .66, 4]]) WC.drawObj(c, WC.make('palm', s * U * 1.2, {}, k + ctx.seed), W * (flip ? 1 - x : x), gy + 6 * U);
      for (const [x, k] of [[.4, 1], [.62, 2], [.72, 3]]) WC.drawObj(c, WC.make('shrub', .7 * U, {}, k), W * x, gy + 10 * U, 1, { a: .8 });
      const wat = mixc(mixc(C.water, C.ground, .5), C.leafDark, .12);
      const pts = []; for (let x = -20; x <= W + 20; x += 30) pts.push([x, yF + Math.sin(x * .01) * 4 * U]);
      pts.push([W + 20, H + 20], [-20, H + 20]);
      WC.wash(c, pts, C.wood, .3, 2, 3);
      const pts2 = pts.map(([x, y], i) => i < pts.length - 2 ? [x, y + 8 * U] : [x, y]);
      WC.wash(c, pts2, wat, .8, 3, 3);
      const g = c.createLinearGradient(0, yF, 0, H); g.addColorStop(0, WC.rgba(wat, 0)); g.addColorStop(1, WC.rgba(mixc(C.waterDeep, C.wood, .45), .55));
      c.fillStyle = g; c.fillRect(0, yF, W, H - yF);
      WC.blooms(c, 0, yF, W, H, wat, 10, .2);
      for (let i = 0; i < 16; i++) { const y = yF + 20 * U + Math.pow(rnd(), 1.2) * (H - yF); const x = rnd(-50, W); WC.drawS(c, mk(qcurve(x, y, x + rnd(80, 240) * U, y + rnd(-2, 2), rnd(-3, 3), 8), rnd(2, 5) * U, C.paperLight, { prof: 'leaf', nb: 0, a: .35 })); }
      WC.granulate(c, 0, yF, W, H, C.wood, .6, .12);
      WC.drawS(c, mk(qcurve(-10, yF + 4 * U, W + 10, yF + 6 * U, 0, 24), 5 * U, mixc(C.wood, C.ink, .3), { prof: 'even', nb: 3, a: .5, rough: .4 }));
      return cv;
    });
    // tank: glass, water, gravel, the plate with its lights (baked: front glass is drawn after the eel)
    const T = tank ? { x0: W * .07, x1: W * .93, y0: H * (portrait ? .3 : .2), y1: H * (portrait ? .76 : .82) } : null;
    const plate = tank ? { x: W * (flip ? .36 : .64), y0: -20, y1: H * (portrait ? .63 : .7), w: W * .1 } : null;
    const tankBack = tank ? WC.withSeed(ctx.seed + 9, () => {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
      WC.wash(c, [[T.x0, T.y0], [T.x1, T.y0], [T.x1, T.y1], [T.x0, T.y1]], mixc(C.sky, C.paperLight, .4), .25, 2, 1);
      // gravel on the bottom
      for (let i = 0; i < 160; i++) { const x = rnd(T.x0 + 10, T.x1 - 10), y = T.y1 - rnd(6, 40) * U; WC.wash(c, WC.blobPts(x, y, rnd(5, 11) * U, rnd(3, 7) * U, 8, .2), WC.pick([C.stoneDark, C.stone, mixc(C.wood, C.stone, .5)]), .55, 1, 0); }
      // the plate on its rod
      const px0 = plate.x - plate.w / 2, px1 = plate.x + plate.w / 2;
      WC.drawS(c, mk([[plate.x, plate.y0], [plate.x, plate.y0 + H * .12]], 10 * U, mixc(C.stoneDark, C.ink, .3), { prof: 'even', nb: 2, a: .9 }));
      WC.wash(c, [[px0, plate.y0 + H * .12], [px1, plate.y0 + H * .12], [px1, plate.y1], [px0, plate.y1]], mixc(C.stone, C.far, .45), .85, 3, 1.5);
      WC.drawS(c, mk([[px0 + plate.w * .22, plate.y0 + H * .13], [px0 + plate.w * .22, plate.y1 - 10]], plate.w * .16, C.paperLight, { prof: 'even', nb: 3, a: .45 }));
      for (const s of inkLine([[px0, plate.y0 + H * .12], [px0, plate.y1], [px1, plate.y1], [px1, plate.y0 + H * .12]], 2.2 * U, C.ink, { step: 1, a: .7 })) WC.drawS(c, s);
      return cv;
    }) : null;
    const leds = tank ? Array.from({ length: 7 }, (_, i) => [plate.x, H * (portrait ? .2 : .2) + i * (plate.y1 - H * .23) / 7 + H * .03]) : [];
    // the horse (pond) and the eels
    const hs = (P.horse_s ?? 3.1) * U;
    const horse = tank ? null : WC.make('horse', Math.round(hs * 100) / 100, { pose: 'stand', coat: P.coat || 'bay', face: flip ? 'left' : 'right' }, 3 + ctx.seed);
    const hshade = tank ? null : WC.make('horse_shade', Math.round(hs * 100) / 100, { face: flip ? 'left' : 'right' }, 4);
    const hx = W * (P.horse_x ?? (flip ? .45 : .55)), hy = yW + 62 * hs;
    const es = (P.eel_s ?? (tank ? 2.1 : 2.2)) * U;
    const eel = WC.make('electric_eel', Math.round(es * 100) / 100, { pose: 'rise' }, 2);
    const ex = tank ? plate.x - (plate.w / 2 + 70 * es) * (flip ? -1 : 1) : W * (P.eel_x ?? (flip ? .64 : .36));
    // the eel is nearer to us than the horse: its own water line sits lower in the picture
    const ey = tank ? yW : yW + (P.eel_near ?? 200) * U;
    const eel2 = WC.make('electric_eel', Math.round(es * .9 * 100) / 100, { pose: 'swim', shadow: false }, 5);
    const bursts = sparkBursts(ctx.seed * 3 + 1, 120 * U);
    const reedsFg = tank ? null : [WC.make('reeds', 1.5 * U, {}, 7), WC.make('reeds', 1.2 * U, {}, 8)];
    const marks = WC.withSeed(ctx.seed + 55, () => Array.from({ length: 26 }, () => ({ x: rnd(0, W), y: yW + 10 + Math.pow(rnd(), 1.4) * (H - yW), w: rnd(30, 90), ph: rnd(0, 6.28) })));

    return { update(lt, dur, cues) {
      cues = cues || {};
      X.clear(); X.drawImage(back, 0, 0);
      if (tankBack) X.drawImage(tankBack, 0, 0);
      const painted = !!P.painted;
      const r0 = timeOf(P.rise, cues, .25), rd = P.rise_dur ?? .9, fire = timeOf(P.fire, cues, 1.1), per = P.pulse ?? .55;
      const rp = eo(seg(lt, r0, r0 + rd));
      // water shimmer
      X.lineCap = 'round';
      for (const m of marks) { const a = .22 * (.5 + .5 * Math.sin(lt * 1.5 + m.ph)); X.strokeStyle = WC.rgba(C.paperLight, a); X.lineWidth = 3 * U; X.beginPath(); const dx = Math.sin(lt * .6 + m.ph) * 12; X.moveTo(m.x + dx, m.y); X.lineTo(m.x + dx + m.w * U, m.y + 1); X.stroke(); }
      // the horse: belly-deep, faint under the brown water; it rears back a little when the shocks start
      if (horse) {
        const hp = painted ? 1 : seg(lt, 0, .9), rear = ss(seg(lt, fire, fire + 1.4)) * .045 + Math.sin(lt * 1.3) * .004;
        const pivot = [hx + (flip ? 1 : -1) * 70 * hs, hy];
        X.save(); X.beginPath(); X.rect(-10, -10, W + 20, yW + 10); X.clip();
        X.translate(pivot[0], pivot[1]); X.rotate(flip ? rear : -rear); X.translate(-pivot[0], -pivot[1]);
        WC.drawObj(X, under(horse), hx, hy, 1, { a: clamp(hp * 1.5) * .92 }); WC.drawObj(X, horse, hx, hy, hp); WC.drawObj(X, hshade, hx, hy, seg(hp, .6, 1)); X.restore();
        X.save(); X.beginPath(); X.rect(-10, yW, W + 20, H); X.clip();
        X.translate(pivot[0], pivot[1]); X.rotate(flip ? rear : -rear); X.translate(-pivot[0], -pivot[1]);
        WC.drawObj(X, horse, hx, hy, hp, { a: .2 }); X.restore();
      }
      // a second eel gliding under the surface
      if (!tank && P.second !== false) {
        const sx = W * mixN(flip ? .2 : .8, flip ? .4 : .6, seg(lt, 0, dur)), sy = yW + H * .17;
        drawCut(X, eel2, sx, sy, yW + 4, false, .32, painted ? 1 : seg(lt, .2, 1.1), { flip: !flip });
      }
      // the eel rising: below the water faint, above it full
      const ep = painted ? 1 : seg(lt, Math.max(0, r0 - .4), r0 + .4);
      const dy = (1 - rp) * H * .2 + Math.sin(lt * 1.7) * 5 * U, rot = (1 - rp) * .35 * (flip ? -1 : 1) + Math.sin(lt * 1.3) * .018;
      const eo2 = { flip, rot };
      drawCut(X, eel, ex, ey + dy, ey, false, tank ? .55 : .3, ep, eo2);
      drawCut(X, eel, ex, ey + dy, ey, true, 1, ep, Object.assign({ solid: true }, eo2));
      // rings where the body breaks the surface (and round the horse's legs)
      const ring = (x, y, ph, k) => { for (let j = 0; j < 2; j++) { const age = ((lt / 2.2 + ph + j * .5) % 1 + 1) % 1, rx = (30 + age * 170) * U * k; X.strokeStyle = WC.rgba(C.paperLight, .55 * (1 - age) * Math.min(1, age * 5)); X.lineWidth = 3 * U; X.beginPath(); X.ellipse(x, y, rx, rx * .16, 0, 0, Math.PI * 2); X.stroke(); } };
      if (rp > .05) ring(ex + (flip ? 1 : -1) * 20 * es, ey, .1, 1);
      if (horse) { ring(hx - 60 * hs * (flip ? -1 : 1), yW, .4, .8); ring(hx + 50 * hs * (flip ? -1 : 1), yW, .75, .8); }
      // the front glass of the tank and the water inside it
      if (tank) {
        X.save(); X.globalAlpha = .9;
        WC.drawS(X, mk([[T.x0, yW], [T.x1, yW]], 4 * U, C.paperLight, { prof: 'even', nb: 0, a: .7 }));
        X.fillStyle = WC.rgba(C.water, .16); X.fillRect(T.x0, yW, T.x1 - T.x0, T.y1 - yW);
        for (const [x0, y0, x1, y1] of [[T.x0, T.y0, T.x0, T.y1], [T.x1, T.y0, T.x1, T.y1], [T.x0, T.y1, T.x1, T.y1], [T.x0, T.y0, T.x1, T.y0]]) { X.strokeStyle = WC.rgba(C.inkSoft, .7); X.lineWidth = 4 * U; X.beginPath(); X.moveTo(x0, y0); X.lineTo(x1, y1); X.stroke(); }
        X.strokeStyle = WC.rgba(C.paperLight, .6); X.lineWidth = 10 * U; X.beginPath(); X.moveTo(T.x0 + 40 * U, T.y0 + 30 * U); X.lineTo(T.x0 + 40 * U, T.y1 - 60 * U); X.stroke();
        X.restore();
        // the lights on the plate: dark, then glowing with each discharge
        const k = lt < fire ? 0 : Math.max(0, 1 - ((lt - fire) % per) / (per * .9));
        for (const [i, [x, y]] of leds.entries()) {
          const on = lt >= fire ? k * (.75 + .25 * Math.sin(i * 1.7)) : 0;
          if (on > 0) { const g = X.createRadialGradient(x, y, 2, x, y, 46 * U); g.addColorStop(0, WC.rgba(C.gold, .85 * on)); g.addColorStop(1, WC.rgba(C.gold, 0)); X.fillStyle = g; X.beginPath(); X.arc(x, y, 46 * U, 0, 7); X.fill(); }
          X.fillStyle = WC.rgba(on > .1 ? C.gold : C.stoneDark, .95); X.beginPath(); X.arc(x, y, 9 * U, 0, 7); X.fill();
          X.strokeStyle = WC.rgba(C.ink, .6); X.lineWidth = 1.6 * U; X.stroke();
        }
      }
      // the sparks at the chin
      const ch = eel.parts.chin, cx = ex + (flip ? -ch[0] : ch[0]), cy = ey + dy + ch[1];
      if (rp >= .98) drawSparks(X, bursts, cx, cy, lt, fire, per, (P.spark_s ?? 1) * (tank ? .85 : 1));
      if (!tank && rp >= .98 && lt >= fire) {   // each discharge sends a pale-gold ring across the water round the eel
        for (let j = 0; j < 2; j++) { const age = (((lt - fire) / (per * 2) + j * .5) % 1 + 1) % 1, rx = (40 + age * 260) * U; X.strokeStyle = WC.rgba(C.gold, .55 * (1 - age)); X.lineWidth = 4 * U; X.beginPath(); X.ellipse(ex + (flip ? 1 : -1) * 20 * es, ey, rx, rx * .16, 0, 0, 7); X.stroke(); }
      }
      // reeds in front (pond)
      if (reedsFg) { WC.drawObj(X, reedsFg[0], W * (flip ? .9 : .08), H * (portrait ? .96 : 1.02), 1, { sk: Math.sin(lt * 1.1) * .03 }); WC.drawObj(X, reedsFg[1], W * (flip ? .1 : .93), H * (portrait ? .98 : 1.04), 1, { sk: Math.sin(lt * 1.2 + 1) * .03 }); }
      drawNotes(X, P, lt, cues, W, H, portrait);
      if (P.mist != null) { const m0 = timeOf(P.mist, cues, dur - 1.2); WC.mist(X, W, H, seg(lt, m0, m0 + 1.6)); }
    } };
  } };

  // ------------------------------------------------------------------ wc_eel_herd
  SHOTS.wc_eel_herd = { kind: '2d', build(ctx) {
    const P = ctx.P || {}, { W, H } = ctx, portrait = H > W, X = WC.canvas(ctx);
    const U = portrait ? H / 1920 : H / 1080;
    const gy = H * (portrait ? .36 : .5);
    const pc = [W * (portrait ? .62 : .58), H * (portrait ? .5 : .72)], pa = W * (portrait ? .52 : .36), pb = H * (portrait ? .075 : .11);
    const pond = WC.make('pond', 1, { w: pa * 2 / 1.02, h: pb * 2 / 1.0, rings: 0 }, 4);
    const back = WC.withSeed(ctx.seed * 13 + 2, () => {
      const cv = WC.backdrop(W, H, gy, { sky: 'day', land: 'plain', sun: { x: .82, y: .32, r: 50 }, clouds: 2 });
      const c = cv.getContext('2d');
      for (const [x, s, k] of [[.12, .75, 1], [.3, .55, 2], [.78, .85, 3], [.92, .6, 4]]) WC.drawObj(c, WC.make('palm', s * U, {}, k + 11), W * x, gy + 4 * U);
      WC.drawObj(c, pond, pc[0], pc[1]);
      return cv;
    });
    const n = P.n ?? 8;
    const coats = ['bay', 'chestnut', 'dun', 'black', 'grey', 'bay', 'chestnut', 'dun', 'white'];
    const herd = WC.withSeed(ctx.seed + 7, () => Array.from({ length: n }, (_, i) => {
      // a loose diagonal: the lead horse (i = 0) is nearest, biggest and furthest into the water; the rest trail back
      // up and to the left behind it
      const lead = i === 0, row = lead ? 2.4 : (i % 3), y = pc[1] - pb * .55 + row * pb * .5 + (lead ? 0 : rnd(-8, 8) * U);
      const s = (lead ? 1.6 : 0.95 + row * .12) * U * (portrait ? 1.15 : 1);
      const half = pa * Math.sqrt(Math.max(0, 1 - Math.pow((y - pc[1]) / pb, 2)));
      const x1 = lead ? pc[0] + half * .25 : pc[0] - half * .2 - (i / n) * half * 1.1 + rnd(-30, 30) * U;
      return { y, s, lead, x0: -W * .25 - i * W * .1, x1, g: WC.make('horse', Math.round(s * 100) / 100, { pose: 'gallop', coat: lead ? 'bay' : coats[i % coats.length] }, i + 21), ph: rnd(0, 6.28), d0: lead ? 0 : rnd(.05, .5) };
    }).sort((a, b) => a.y - b.y));
    const riders = P.riders === false ? [] : [0, 1].map(i => ({ g: WC.make('rider', Math.round((1.0 + i * .1) * U * (portrait ? 1.15 : 1) * 100) / 100, { pose: 'gallop', dress: 'peasant', hold: 'staff', coat: i ? 'dun' : 'chestnut' }, 31 + i), y: pc[1] + pb * (i ? .9 : -.3), x0: -W * .5 - i * W * .2, x1: W * (.02 + i * .1), ph: i * 2 }));
    const fg = WC.withSeed(ctx.seed + 3, () => [[.06, 'reeds', 1.4], [.24, 'grass', 1.6], [.42, 'grass', 1.3], [.6, 'shrub', 1.1], [.78, 'grass', 1.5], [.95, 'reeds', 1.2]].map(([x, g, sc], k) => ({ x: x * W, g: WC.make(g, Math.round(sc * U * 100) / 100, {}, k + 40), y: H * (.9 + (k % 2) * .05), ph: k })));
    const fgBand = WC.withSeed(ctx.seed + 4, () => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); const y0 = H * (portrait ? .62 : .85); for (let i = 0; i < 70; i++) { const x = rnd(-20, W), y = y0 + Math.pow(rnd(), .8) * (H - y0), k = (y - y0) / (H - y0); for (let q = 0; q < 3; q++) WC.drawS(c, mk(WC.polar(x + q * 6, y, -Math.PI / 2 + rnd(-.4, .4), rnd(20, 50) * (1 + k), 3, 5), 3 * (1 + k) * U, WC.pick(WC.shades(C.leaf, .2)), { prof: 'tip', nb: 0, a: .5 })); } return cv; });
    const inPond = (x, y) => { const k = 1 - Math.pow((y - pc[1]) / pb, 2); return k > 0 && Math.abs(x - pc[0]) < pa * Math.sqrt(k) * .95; };
    return { update(lt, dur, cues) {
      cues = cues || {};
      X.clear(); X.drawImage(back, 0, 0);
      pond.live && pond.live; // rings drawn per horse below
      const t0 = timeOf(P.at, cues, .1), T1 = Math.max(t0 + 1.5, dur - .3);
      const all = herd.map(h => Object.assign({ kind: 'h' }, h)).concat(riders.map(r => Object.assign({ kind: 'r' }, r))).sort((a, b) => a.y - b.y);
      for (const h of all) {
        const q = eio(seg(lt, t0 + (h.d0 || 0), T1));
        const x = mixN(h.x0, h.x1, q);
        const wet = h.kind === 'h' && inPond(x + 40 * h.s, h.y) ? 1 : 0;
        // depth: eases in as the horse goes further into the pond
        const depth = h.kind === 'h' ? clamp((x - (pc[0] - pa * .9)) / (pa * .6)) * 70 * h.s * (wet ? 1 : 0) : 0;
        const bob = Math.sin(lt * 6 + h.ph) * 3 * U * (1 - q * .6);
        X.save(); X.beginPath();
        // clip away whatever is under the surface inside the pond
        X.rect(-W, -H, 3 * W, h.y + H);
        const k = 1 - Math.pow((h.y - pc[1]) / pb, 2), half = pa * Math.sqrt(Math.max(0, k)) * .95;
        X.rect(-W, h.y, W + pc[0] - half, H); X.rect(pc[0] + half, h.y, W * 2, H);
        X.clip();
        WC.drawObj(X, under(h.g), x, h.y + depth + bob, 1, { a: .92 }); WC.drawObj(X, h.g, x, h.y + depth + bob, 1);
        X.restore();
        if (depth > 2) {
          for (let j = 0; j < 2; j++) { const age = ((lt / 1.6 + h.ph + j * .5) % 1 + 1) % 1, rx = (30 + age * 90) * h.s; X.strokeStyle = WC.rgba(C.paperLight, .6 * (1 - age)); X.lineWidth = 2.6 * U; X.beginPath(); X.ellipse(x, h.y, rx, rx * .2, 0, 0, Math.PI * 2); X.stroke(); }
          // splash: a few pale arcs thrown up at the chest
          X.strokeStyle = WC.rgba(C.paperLight, .7 * clamp(depth / (40 * h.s))); X.lineWidth = 3 * U;
          for (let j = 0; j < 3; j++) { const sx = x + (50 + j * 12) * h.s, a = Math.sin(lt * 5 + j + h.ph) * .5 + .5; X.beginPath(); X.moveTo(sx, h.y); X.quadraticCurveTo(sx + 10 * h.s, h.y - (16 + a * 16) * h.s, sx + 24 * h.s, h.y - 4 * h.s); X.stroke(); }
        }
      }
      X.drawImage(fgBand, 0, 0);
      for (const f of fg) WC.drawObj(X, f.g, f.x, f.y, 1, { sk: Math.sin(lt * 1.1 + f.ph) * .025 });
      drawNotes(X, P, lt, cues, W, H, portrait);
    } };
  } };
  // ------------------------------------------------------------------ wc_eel_catch
  // the end of the fight: a still, muddy pond; on the bank a plainsman in profile hauls on a rope; the rope runs
  // down to a harpoon shaft standing in the shallows by an exhausted eel, which is drawn slowly toward the bank.
  // params: {pull: s | cue (when the rope tightens, default .6), x (man, .36), notes}
  SHOTS.wc_eel_catch = { kind: '2d', build(ctx) {
    const P = ctx.P || {}, { W, H } = ctx, portrait = H > W, X = WC.canvas(ctx);
    const U = portrait ? H / 1920 : H / 1080, Z = portrait ? 1.45 : 1;
    const gy = H * (portrait ? .36 : .5);
    const pc = [W * .62, H * (portrait ? .5 : .68)], pw = W * .62, ph = H * (portrait ? .13 : .16);
    const pond = WC.make('pond', 1, { w: pw, h: ph, rings: 3, reeds: true }, 6);
    const back = WC.withSeed(ctx.seed * 7 + 1, () => {
      const cv = WC.backdrop(W, H, gy, { sky: 'day', land: 'plain', sun: false, clouds: 2 });
      const c = cv.getContext('2d');
      for (const [x, s, k] of [[.1, .8, 5], [.55, .6, 9], [.9, .75, 2]]) WC.drawObj(c, WC.make('palm', s * U * Z, { h: 1 }, k), W * x, gy + 4 * U);
      WC.drawObj(c, pond, pc[0], pc[1]);
      const y0 = H * (portrait ? .6 : .85);
      for (let i = 0; i < 80; i++) { const x = rnd(-20, W), y = y0 + Math.pow(rnd(), .8) * (H - y0), k = (y - y0) / (H - y0); for (let q = 0; q < 3; q++) WC.drawS(c, mk(WC.polar(x + q * 6, y, -Math.PI / 2 + rnd(-.4, .4), rnd(20, 50) * (1 + k), 3, 5), 3 * (1 + k) * U, WC.pick(WC.shades(C.leaf, .2)), { prof: 'tip', nb: 0, a: .5 })); }
      return cv;
    });
    const manX = W * (P.x ?? .2), manY = H * (portrait ? .53 : .74), ms = (P.man_s ?? 2.3) * Z * U;
    const man = WC.make('person', Math.round(ms * 100) / 100, { pose: 'stand', dress: 'peasant', face: 'right', cols: P.cols || { cloth: 'paperDark', clothB: 'wood', hat: 'clothC' } }, P.man_seed ?? 12);
    const manSh = 170 * ms;
    const hand = [manX + manSh * .13, manY - manSh * .5];
    const eel = WC.make('electric_eel', Math.round(.8 * Z * U * 100) / 100, { pose: 'swim', shadow: false }, 9);
    const eel0 = [W * (P.eel_x ?? .66), pc[1] + ph * .22];
    const fg = [WC.make('reeds', 1.3 * U, {}, 41), WC.make('grass', 1.5 * U, {}, 42), WC.make('shrub', 1.0 * U, {}, 43)];
    return { update(lt, dur, cues) {
      cues = cues || {};
      X.clear(); X.drawImage(back, 0, 0);
      X.save(); X.translate(pc[0], pc[1]); pond.live(X, lt); X.restore();
      const pull = timeOf(P.pull, cues, .6), k = eio(seg(lt, pull, pull + Math.max(1.5, dur - pull)));
      // the eel: limp, half under the brown water, drawn slowly toward the bank
      const ex = eel0[0] - k * W * .05, ey = eel0[1];
      X.save(); X.globalAlpha = .8; WC.drawObj(X, under(eel), ex, ey, 1, { a: .5 }); X.restore();
      WC.drawObj(X, eel, ex, ey, seg(lt, 0, .8), { a: .85, flip: true });
      // a pale skin of water over its lower half
      X.save(); X.beginPath(); X.ellipse(pc[0], pc[1], pw * .49, ph * .48, 0, 0, 7); X.clip(); X.beginPath(); X.rect(ex - W * .3, ey - 14 * U, W * .6, 40 * U); X.clip(); X.fillStyle = WC.rgba(mixc(C.water, C.ground, .5), .45); X.fillRect(ex - W * .3, ey - 14 * U, W * .6, 40 * U); X.restore();
      // the harpoon shaft standing in the shallows by the eel (its iron is under the water)
      const sb = [ex + 30 * U, ey - 4 * U], st = [sb[0] - 70 * U, sb[1] - 170 * U];
      WC.drawS(X, mk([sb, st], 9 * U, C.wood, { prof: 'even', nb: 2, a: .95 }));
      WC.drawS(X, mk([[sb[0] - 2 * U, sb[1] - 2 * U], [st[0] - 2 * U, st[1] - 2 * U]], 2 * U, C.ink, { prof: 'even', nb: 0, a: .6 }));
      // rings round the shaft
      for (let j = 0; j < 2; j++) { const age = ((lt / 1.8 + j * .5) % 1 + 1) % 1, rx = (20 + age * 80) * U; X.strokeStyle = WC.rgba(C.paperLight, .55 * (1 - age)); X.lineWidth = 2.4 * U; X.beginPath(); X.ellipse(sb[0], sb[1], rx, rx * .2, 0, 0, 7); X.stroke(); }
      // the man, then the rope from his hands to the top of the shaft: slack, then pulled taut
      WC.drawObj(X, under(man), manX, manY, 1, { a: .9 });
      WC.drawObj(X, man, manX, manY, seg(lt, 0, .7));
      const sag = (1 - k) * 90 * U + 14 * U, rope = [];
      for (let i = 0; i <= 20; i++) { const t = i / 20; rope.push([mixN(hand[0], st[0], t), mixN(hand[1], st[1], t) + Math.sin(Math.PI * t) * sag + Math.sin(lt * 1.4 + t * 5) * 2 * U * (1 - k)]); }
      WC.drawS(X, mk(rope, 4 * U, mixc(C.clothC, C.wood, .5), { prof: 'even', nb: 0, a: .95 }));
      WC.drawS(X, mk(rope.map(([x, y]) => [x, y + 1.5 * U]), 1.2 * U, C.ink, { prof: 'even', nb: 0, a: .5 }));
      // a coil of spare rope hanging from his hand
      X.strokeStyle = WC.rgba(mixc(C.clothC, C.wood, .5), .9); X.lineWidth = 4 * U;
      for (let j = 0; j < 3; j++) { const r = (14 + j * 3) * U * ms / 2.6; X.beginPath(); X.ellipse(hand[0], hand[1] + r * 1.9, r, r * 1.9, .08, 0, 7); X.stroke(); }
      WC.drawObj(X, fg[0], W * .06, H * .97, 1, { sk: Math.sin(lt * 1.1) * .03 });
      WC.drawObj(X, fg[1], W * .5, H * .99, 1, { sk: Math.sin(lt * 1.3 + 1) * .03 });
      WC.drawObj(X, fg[2], W * .92, H * .97, 1, { sk: Math.sin(lt * .9 + 2) * .02 });
      drawNotes(X, P, lt, cues, W, H, portrait);
    } };
  } };
})();
