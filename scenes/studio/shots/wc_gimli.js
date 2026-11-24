// wc_gimli — topic objects for "Gimli Planörü" (Air Canada 143, 23 July 1983; videos/2026-11-24/01-gimli-planoru.json).
// Same contract as the other WC.G generators: local coordinates, y negative up, origin = base centre, painted in order.
// airliner  a twin-engine wide-body jet (Boeing 767-like) in side view, nose toward +x. sc 1 ≈ 430 px long.
//           o: {gear: 'up' (default, flying: origin = belly centre) | 'down' (on its wheels: origin = wheel contact)
//               | 'nose' (nose gear collapsed: the nose rests on the ground, origin = main-wheel contact),
//               rat: true (the small ram-air turbine hanging under the belly), tail: colour token (default "red"),
//               stripe: colour token of the window line (default "red") | false}
// glider    a sailplane in a three-quarter view from below: slim pod, bubble canopy, T-tail, long wings. sc 1 ≈ 320 px.
//           o: {col: body token (default paperLight-ish), tips: token (wing-tip marks, default "red") | false}
// race_car  a 1970s–80s club sports racer in side view, nose toward +x: low wedge body, open cockpit, roll hoop,
//           helmeted driver, racing number on a pale roundel. sc 1 ≈ 200 px. o: {col: body token (default "clothC"),
//           num: '7' (drawn live; false = no roundel), helmet: token}
// cloud_sea a sea of cumulus seen from above (origin = the mean top line), running down to the frame bottom.
//           o: {w: width px at sc 1 (1300), d: depth (900), n: billows}
// runway    a strip of runway seen from above at a low angle: a long asphalt band, pale edges, a dashed centre line,
//           tyre marks. origin = centre of the band. o: {w: width px at sc 1 (1300), d: depth px (120), marks: true}
'use strict';
(() => {
  const C = WC.C, { mk, washShape, inkLine, mixc, along, qcurve, rnd } = WC;
  const circ = (cx, cy, rx, ry = rx, n = 18) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });

  // ------------------------------------------------------------------ airliner
  WC.G.airliner = (sc, o = {}) => {
    const S = [], L = 430 * sc, h = L * .105, gear = o.gear || 'up';
    const gearH = h * .62, wr = h * .22, mgx = -.04 * L;
    // body frame: x along the fuselage (nose +), belly at y 0, up negative. The pose rotates it about the main wheels.
    let ang = 0;
    const Pm = [mgx, gearH + wr];
    if (gear === 'nose') { const dx = .43 * L - Pm[0]; ang = Math.atan2(gearH + wr - h * .02, dx); }
    const ca = Math.cos(ang), sa = Math.sin(ang);
    const T = gear === 'up' ? (x, y) => [x, y] : (x, y) => { const px = x - Pm[0], py = y - Pm[1]; return [px * ca - py * sa + Pm[0], px * sa + py * ca]; };
    const P = (xf, yf) => T(xf * L, yf * h);
    const poly = a => a.map(([x, y]) => P(x, y));
    const ink = C.ink, body = mixc(C.stone, C.paperLight, .55), shade = mixc(C.stoneDark, C.stone, .45);

    const hull = poly([[.5, -.42], [.49, -.66], [.465, -.85], [.43, -.97], [.38, -1], [-.30, -1], [-.44, -.98], [-.5, -.9], [-.505, -.8],
      [-.44, -.55], [-.33, -.12], [-.26, 0], [.40, 0], [.46, -.08], [.49, -.22]]);
    const fin = poly([[-.27, -.99], [-.43, -2.85], [-.495, -2.85], [-.49, -.95]]);
    const stab = poly([[-.36, -.74], [-.49, -.46], [-.53, -.47], [-.47, -.8]]);
    const wing = poly([[.10, -.30], [-.15, .95], [-.215, .95], [-.11, -.22]]);
    const ecx = .035, ecy = .62, el = .07, eh = .32;
    const nac = poly([[ecx + el, ecy - eh], [ecx - el * .6, ecy - eh * .85], [ecx - el, ecy - eh * .35], [ecx - el * 1.12, ecy], [ecx - el, ecy + eh * .4],
      [ecx - el * .6, ecy + eh * .85], [ecx + el, ecy + eh], [ecx + el * 1.06, ecy]]);
    const pylon = poly([[ecx + el * .3, ecy - eh * .9], [ecx - el * .9, ecy - eh * .7], [-.06, .25], [.02, .18]]);

    // washes: structure first
    S.push(washShape(wing, mixc(C.stone, C.stoneDark, .25), .7, 3, 1.5 * sc));
    S.push(washShape(hull, body, .55, 3, 2.5 * sc));
    // light and shade: the crown stays near paper, the flank takes a middle wash, the belly a darker one
    S.push(washShape(poly([[.49, -.6], [.47, -.74], [.40, -.86], [-.30, -.86], [-.47, -.82], [-.5, -.72], [-.44, -.55], [-.33, -.16], [.44, -.14], [.49, -.3]]), mixc(C.stone, C.sky, .25), .38, 3, 2.5 * sc));
    S.push(washShape(poly([[.48, -.3], [.45, -.12], [.40, -.02], [-.26, -.02], [-.33, -.14], [-.40, -.36], [.10, -.4]]), mixc(C.stoneDark, C.sky, .2), .4, 3, 2 * sc));
    S.push(washShape(poly([[.47, -.12], [.40, 0], [-.26, 0], [-.33, -.12], [-.42, -.42], [.49, -.40]]), shade, .42, 2, 1));
    S.push(washShape(fin, o.tail || C.red, .62, 3, 2 * sc));
    S.push(washShape(poly([[-.30, -1.2], [-.40, -2.4], [-.47, -2.4], [-.48, -1.1]]), mixc(o.tail || C.red, C.ink, .2), .35, 2, 2 * sc));
    S.push(washShape(stab, mixc(C.stone, C.stoneDark, .3), .7, 2, 1));
    S.push(washShape(pylon, mixc(C.stone, C.stoneDark, .35), .7, 2, 1));
    S.push(washShape(nac, mixc(C.stoneDark, C.stone, .35), .75, 3, 1.5 * sc));
    S.push(washShape(poly([[ecx + el, ecy + eh * .1], [ecx - el * 1.1, ecy + eh * .1], [ecx - el * .6, ecy + eh * .85], [ecx + el, ecy + eh]]), mixc(C.stoneDark, C.ink, .35), .5, 2, 1));
    S.push(washShape(poly([[ecx + el, ecy - eh * .2], [ecx - el, ecy + eh * .2], [ecx - el * .6, ecy + eh * .85], [ecx + el, ecy + eh]]), shade, .45, 2, 1));
    S.push(washShape(poly(circ(ecx + el * .98, ecy, el * .16, eh * .86, 14).map(([x, y]) => [x, y])), mixc(C.ink, C.stoneDark, .35), .8, 2, .5));
    // brush texture over the washes: long dry-brush strokes along the hull, the fin and the wing, a wet edge that
    // pooled darker along the belly, a pale highlight left along the crown (unpainted paper)
    const tex = mixc(body, C.stoneDark, .22);
    for (const [yf, a] of [[-.28, .3], [-.5, .22], [-.78, .18], [-.16, .32]]) {
      const x0 = rnd(.36, .44), x1 = rnd(-.34, -.26);
      S.push(mk(along([P(x0, yf + rnd(-.04, .04)), P((x0 + x1) / 2, yf + rnd(-.05, .05)), P(x1, yf - .03)], 16), h * rnd(.16, .24), tex, { prof: 'leaf', nb: 6, a, rough: .35 }));
    }
    S.push(mk(along([P(.42, -.04), P(0, -.03), P(-.25, -.03)], 18), h * .12, mixc(C.stoneDark, C.ink, .2), { prof: 'leaf', nb: 4, a: .35, rough: .4 }));
    S.push(mk(along([P(.38, -.93), P(0, -.95), P(-.28, -.94)], 16), h * .08, C.paperLight, { prof: 'leaf', nb: 3, a: .55 }));
    for (let k = 0; k < 3; k++) S.push(mk(along([P(-.30 - k * .04, -1.05), P(-.41 - k * .025, -2.7)], 10), h * .22, mixc(o.tail || C.red, C.ink, .18), { prof: 'leaf', nb: 5, a: .3 }));
    S.push(mk(along([P(.06, -.2), P(-.16, .85)], 10), h * .18, mixc(C.stone, C.stoneDark, .45), { prof: 'leaf', nb: 5, a: .3 }));
    S.push(mk(along([P(ecx + el * .8, ecy + eh * .6), P(ecx - el, ecy + eh * .5)], 8), h * .14, mixc(C.stoneDark, C.ink, .2), { prof: 'leaf', nb: 4, a: .35 }));
    // window line stripe, windows, cockpit
    if (o.stripe !== false) S.push(mk(along([P(.475, -.42), P(.2, -.44), P(-.2, -.44), P(-.43, -.52)], 20), h * .1, o.stripe || C.red, { prof: 'even', nb: 3, a: .8 }));
    for (let xf = .33; xf > -.31; xf -= .021) {
      if (Math.abs(xf - .25) < .012 || Math.abs(xf + .02) < .012) continue;   // doors
      const [x, y] = P(xf, -.64);
      S.push(mk([[x - h * .03, y], [x + h * .03, y]], h * .075, ink, { prof: 'even', nb: 0, a: .55, rough: .1 }));
    }
    for (const dx of [.25, -.02]) S.push(mk(along([P(dx + .008, -.88), P(dx + .008, -.14)], 6), 1.4 * sc, C.inkSoft, { prof: 'even', nb: 0, a: .5 }));
    S.push(washShape(poly([[.462, -.80], [.48, -.68], [.447, -.68], [.432, -.80]]), ink, .75, 2, .3));
    // ink
    S.push(...inkLine([...hull, hull[0]], 1.5 * sc, ink, { step: 3, a: .62 }));
    S.push(...inkLine(fin, 1.4 * sc, ink, { step: 2, a: .6 }));
    S.push(...inkLine([...wing, wing[0]], 1.3 * sc, ink, { step: 2, a: .55 }));
    S.push(...inkLine(stab, 1.6 * sc, ink, { step: 2, a: .75 }));
    S.push(...inkLine([...nac, nac[0]], 1.5 * sc, ink, { step: 2, a: .7 }));
    S.push(mk(along([P(.36, -.03), P(-.24, -.03)], 12), 1.4 * sc, C.inkSoft, { prof: 'even', nb: 0, a: .4 }));
    // landing gear
    const strut = (xf, len) => { const a = T(xf * L, -h * .05), b = T(xf * L, len); S.push(mk([a, b], h * .09, mixc(C.ink, C.stoneDark, .3), { prof: 'even', nb: 0, a: .9 })); return b; };
    const wheel = ([x, y], dx = 0) => { const c = [x + dx, y]; S.push(washShape(circ(c[0], c[1], wr), mixc(C.ink, C.stoneDark, .25), .9, 2, .4)); S.push(washShape(circ(c[0], c[1], wr * .38), C.stone, .7, 1, 0)); };
    if (gear !== 'up') {
      const b = strut(mgx / L, gearH); wheel(b, -wr * 1.05); wheel(b, wr * 1.05);
      if (gear === 'down') { const n = strut(.38, gearH); wheel(n); }
      else {   // nose on the runway: scraped, a little crumpled
        S.push(mk(along([P(.48, -.05), P(.40, .02), P(.28, .02)], 8), 3 * sc, mixc(C.ink, C.stoneDark, .4), { prof: 'tip', nb: 2, a: .7 }));
      }
    }
    if (o.rat) {
      const a = P(.14, 0), b = P(.14, .48);
      S.push(mk([a, b], h * .06, ink, { prof: 'even', nb: 0, a: .85 }));
      S.push(mk([[b[0] - h * .25, b[1] - h * .12], [b[0] + h * .25, b[1] + h * .12]], h * .07, ink, { prof: 'leaf', nb: 0, a: .85 }));
      S.push(washShape(circ(b[0], b[1], h * .06), ink, .9, 1, 0));
    }
    const top = P(-.46, -2.85);
    return { S, top, parts: { nose: P(.5, -.42), tail: top, engine: P(ecx, ecy), wing: P(-.1, .6), window: P(.1, -.64), belly: P(.1, 0), cockpit: P(.45, -.75), gear: Pm } };
  };

  // ------------------------------------------------------------------ glider
  WC.G.glider = (sc, o = {}) => {
    const S = [], L = 320 * sc, h = L * .07, ink = C.ink;
    const P = (xf, yf) => [xf * L, yf * h];
    const poly = a => a.map(([x, y]) => P(x, y));
    const body = o.col ? WC.col(o.col) : mixc(C.stone, C.paperLight, .6), shade = mixc(C.stoneDark, C.stone, .5);
    const far = poly([[.14, -.9], [.33, -3.6], [.30, -3.65], [.03, -.85]]);
    const near = poly([[.13, -.7], [-.08, 5.2], [-.15, 5.15], [-.01, -.6]]);
    const pod = poly([[.5, -.45], [.47, -.9], [.38, -1.15], [.25, -1.1], [0, -.85], [-.3, -.55], [-.48, -.5], [-.5, -.35], [-.3, -.18], [0, -.02], [.3, .05], [.45, -.1]]);
    const canopy = poly([[.40, -1.08], [.34, -1.6], [.18, -1.52], [.12, -1.0]]);
    const fin = poly([[-.36, -.52], [-.45, -2.4], [-.51, -2.4], [-.5, -.42]]);
    const htail = poly([[-.40, -2.42], [-.56, -2.55], [-.58, -2.48], [-.52, -2.34]]);
    S.push(washShape(far, mixc(body, C.stoneDark, .2), .65, 2, 1));
    S.push(washShape(pod, body, .85, 3, 1));
    S.push(washShape(poly([[.45, -.1], [.3, .05], [0, -.02], [-.3, -.18], [-.5, -.35], [.48, -.5]]), shade, .35, 2, 1));
    S.push(washShape(fin, body, .8, 2, 1));
    S.push(washShape(htail, body, .8, 2, .6));
    S.push(washShape(canopy, mixc(C.sky, C.waterDeep, .35), .8, 3, .6));
    S.push(mk(along([P(.36, -1.48), P(.24, -1.3)], 5), h * .14, C.paperLight, { prof: 'leaf', nb: 0, a: .7 }));
    S.push(washShape(near, body, .85, 3, 1));
    S.push(washShape(poly([[-.01, -.6], [-.15, 5.15], [-.12, 5.17], [.05, -.65]]), shade, .4, 2, .5));
    if (o.tips !== false) {
      S.push(washShape(poly([[-.07, 4.7], [-.08, 5.2], [-.15, 5.15], [-.14, 4.67]]), o.tips || C.red, .85, 2, .3));
      S.push(washShape(poly([[.315, -3.3], [.33, -3.6], [.30, -3.65], [.29, -3.32]]), o.tips || C.red, .8, 2, .3));
    }
    for (const q of [pod, near, far, fin, canopy]) S.push(...inkLine([...q, q[0]], 2 * sc, ink, { step: 2, a: .8 }));
    S.push(...inkLine(htail, 1.6 * sc, ink, { step: 2, a: .8 }));
    return { S, top: P(-.48, -2.5), parts: { nose: P(.5, -.45), canopy: P(.26, -1.3), wing: P(-.1, 4.5), tail: P(-.48, -2.4) } };
  };

  // ------------------------------------------------------------------ race_car
  // a 1970s–80s club sports racer: long low nose, bulging wheel arches, a small open cockpit with a roll hoop and a
  // helmeted driver, a racing number on a pale roundel (o.num: '7' — drawn live so it stays crisp)
  WC.G.race_car = (sc, o = {}) => {
    const S = [], L = 200 * sc, ink = C.ink, body = WC.col(o.col || 'clothC');
    const P = (xf, yf) => [xf * L, yf * L];
    const poly = a => a.map(([x, y]) => P(x, y));
    const hull = poly([[.5, -.07], [.47, -.13], [.30, -.17], [.22, -.22], [.10, -.205], [.02, -.2], [-.20, -.2], [-.30, -.22], [-.40, -.2], [-.5, -.22], [-.52, -.08], [-.42, -.05], [.44, -.05]]);
    S.push(washShape(hull, body, .85, 3, 1.5 * sc));
    S.push(washShape(poly([[.5, -.07], [.44, -.05], [-.42, -.05], [-.52, -.08], [-.51, -.12], [.49, -.11]]), mixc(body, C.ink, .35), .45, 2, .8));
    S.push(mk(along([P(.46, -.12), P(0, -.17), P(-.48, -.18)], 14), L * .05, mixc(body, C.ink, .15), { prof: 'leaf', nb: 5, a: .35 }));
    S.push(mk(along([P(.4, -.15), P(-.45, -.19)], 12), L * .02, C.paperLight, { prof: 'leaf', nb: 2, a: .55 }));
    // cockpit: windscreen, roll hoop, driver's helmet
    S.push(washShape(poly([[.03, -.205], [-.02, -.29], [-.05, -.29], [-.03, -.2]]), mixc(C.sky, C.ink, .25), .7, 2, .3));
    S.push(mk([P(-.17, -.2), P(-.16, -.33), P(-.12, -.33), P(-.11, -.2)], 3 * sc, ink, { prof: 'even', nb: 0, a: .85 }));
    S.push(washShape(circ(-.08 * L, -.28 * L, .045 * L), o.helmet ? WC.col(o.helmet) : C.paperLight, .9, 2, .3));
    S.push(washShape(poly([[-.05, -.29], [-.035, -.27], [-.06, -.27]]), ink, .8, 1, 0));
    if (o.num !== false) S.push(washShape(circ(.18 * L, -.12 * L, L * .05), C.paperLight, .92, 2, .3));
    S.push(...inkLine([...hull, hull[0]], 2 * sc, ink, { step: 2, a: .85 }));
    for (const xf of [.3, -.33]) {
      S.push(washShape(circ(xf * L, -.075 * L, .09 * L), mixc(C.ink, C.stoneDark, .2), .92, 2, .3));
      S.push(washShape(circ(xf * L, -.075 * L, .04 * L), C.stone, .8, 1, 0));
    }
    const num = String(o.num ?? '');
    const live = num ? (c) => { c.save(); c.font = `700 ${Math.round(L * .075)}px ${WC.HANDF}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = WC.rgba(ink, .9); c.fillText(num, .18 * L, -.12 * L); c.restore(); } : null;
    return { S, live, top: P(0, -.33), parts: { nose: P(.5, -.1), wheel: P(.3, -.07) } };
  };

  // ------------------------------------------------------------------ meadow
  // meadow     the near ground under the subtitles: tonal washes darkening toward the bottom, line-like grass strokes
  //            growing taller toward the viewer, a few dark tufts. Absolute size (ignores sc): origin = bottom centre,
  //            o: {w: px (1200), h: px up from the origin (720), night: true (cool, dark), leaf, ground: tokens}
  WC.G.meadow = (sc, o = {}) => {
    const S = [], w = o.w ?? 1200, h = o.h ?? 720, night = !!o.night;
    const g0 = WC.col(o.ground || 'ground'), lf = WC.col(o.leaf || 'leaf');
    const tone = (c, k) => night ? mixc(c, C.night, .45 + k * .2) : mixc(c, C.leafDark, k);
    for (let i = 0; i < 4; i++) {
      const y0 = -h + i * h * .25 - 30, pts = [];
      for (let x = -w / 2 - 20; x <= w / 2 + 20; x += 60) pts.push([x, y0 + rnd(-14, 14)]);
      pts.push([w / 2 + 20, 20], [-w / 2 - 20, 20]);
      S.push(washShape(pts, tone(g0, .08 + i * .1), .22 + i * .05, 3, 8));
    }
    const cols = [tone(lf, .1), tone(lf, .3), tone(C.clothC, .15), tone(lf, .5)];
    for (let i = 0; i < 230; i++) {
      const k = Math.pow(rnd(), .8), y = -h + k * h + 10, x = rnd(-w / 2, w / 2), len = 14 + k * 46 + rnd(0, 14), a = -Math.PI / 2 + rnd(-.45, .45);
      S.push(mk(WC.polar(x, y, a, len, rnd(-4, 4), 5), 1.6 + k * 2.4, cols[i % 4], { prof: 'tip', nb: 0, a: .35 + k * .35 }));
    }
    for (let i = 0; i < 7; i++) {
      const x = -w / 2 + (i + rnd(.1, .9)) * w / 7, y = -h * rnd(.02, .3);
      for (let q = 0; q < 9; q++) S.push(mk(WC.polar(x + rnd(-8, 8), y, -Math.PI / 2 + rnd(-.7, .7), rnd(40, 90), rnd(-8, 8), 6), rnd(2.5, 4.5), tone(C.leafDark, .2), { prof: 'tip', nb: 0, a: .75 }));
    }
    return { S, sway: .004 };
  };

  // ------------------------------------------------------------------ cloud_sea
  // cloud_sea  a sea of cumulus seen from above: a row of billowing tops (paper-light crowns, sky-blue shadowed
  //            undersides) over a soft body that runs down to the bottom of the frame. origin = the mean top line.
  //            o: {w: width px at sc 1 (1300), d: depth below the tops (900), n: billows (default by width)}
  WC.G.cloud_sea = (sc, o = {}) => {
    const S = [], w = (o.w ?? 1300) * sc, d = (o.d ?? 900) * sc, n = o.n ?? Math.round(w / (90 * sc));
    const shadow = mixc(C.sky, C.far, .45), lightT = mixc(C.paperLight, C.sky, .12);
    S.push(washShape([[-w / 2, -20 * sc], [w / 2, -20 * sc], [w / 2, d], [-w / 2, d]], mixc(C.sky, C.paperLight, .35), .55, 3, 6 * sc));
    for (let r = 0; r < 2; r++) for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + rnd(-.3, .3)) * w / (n - 1), y = r * 90 * sc + rnd(-20, 20) * sc, R = rnd(60, 105) * sc * (r ? 1.2 : 1);
      S.push(washShape(WC.blobPts(x, y + R * .08, R * 1.05, R * .6, 26, .22), shadow, .42, 3, 5 * sc));
      for (let b = 0; b < 3; b++) S.push(washShape(WC.blobPts(x + (b - 1) * R * .45 + rnd(-8, 8) * sc, y - R * rnd(.18, .38), R * rnd(.4, .55), R * rnd(.3, .42), 22, .2), lightT, .7, 3, 3 * sc));
      S.push(mk(WC.polar(x - R * .8, y + R * .42, rnd(-.06, .06), R * 1.6, R * .06, 12), R * .1, mixc(shadow, C.ink, .12), { prof: 'leaf', nb: 6, a: .35 }));
      S.push(mk(WC.polar(x - R * .7, y + R * .25, -.05, R * 1.4, R * .1, 10), R * .14, shadow, { prof: 'leaf', nb: 5, a: .3 }));
    }
    return { S };
  };

  // ------------------------------------------------------------------ runway
  WC.G.runway = (sc, o = {}) => {
    const S = [], w = (o.w ?? 1300) * sc, d = (o.d ?? 120) * sc, asph = mixc(C.stoneDark, C.ink, .35);
    const band = [[-w / 2, -d / 2], [w / 2, -d / 2 + rnd(-2, 2)], [w / 2, d / 2], [-w / 2, d / 2 + rnd(-2, 2)]];
    S.push(washShape(band, asph, .55, 3, 2));
    {
      for (let i = 0; i < 10; i++) { const y = rnd(-d * .4, d * .4), x = rnd(-w * .5, w * .4); S.push(mk(qcurve(x, y, x + rnd(120, 300) * sc, y + rnd(-3, 3), rnd(-4, 4), 8), rnd(6, 14) * sc, asph, { prof: 'leaf', nb: 3, a: .25 })); }
    }
    S.push(mk(qcurve(-w / 2, -d / 2, w / 2, -d / 2, 0, 24), 4 * sc, C.paperLight, { prof: 'even', nb: 3, a: .55 }));
    S.push(mk(qcurve(-w / 2, d / 2, w / 2, d / 2, 0, 24), 5 * sc, C.paperLight, { prof: 'even', nb: 3, a: .55 }));
    for (let x = -w / 2 + 30 * sc; x < w / 2 - 60 * sc; x += 110 * sc) S.push(mk([[x, 0], [x + 55 * sc, 0]], 5 * sc, C.paperLight, { prof: 'even', nb: 0, a: .7 }));
    if (o.marks !== false) for (let i = 0; i < 4; i++) { const y = (i - 1.5) * d * .16, x = -w * .1 + i * 20 * sc; S.push(mk(qcurve(x, y, x + w * .35, y + 4 * sc, 3, 10), 3 * sc, C.ink, { prof: 'leaf', nb: 0, a: .22 })); }
    return { S, parts: { centre: [0, 0] } };
  };
})();
