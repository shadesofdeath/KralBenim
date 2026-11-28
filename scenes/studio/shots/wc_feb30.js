// wc_feb30 — Sweden's February 30th, 1712 (Stickstory ag-02, 2026-11-28): an almanac page for February whose days
// paint in (or wash away), a row of leap-day leaves crossed out one by one, and a torn almanac strip as a plate object.
// Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9). Deterministic (WC.rnd / WC.withSeed), colours only from WC.C tokens,
// the static parts are baked once per scene, per frame only what changes is drawn.
//
// Objects (WC.G; origin = base centre, y up negative, sc 1 = natural size):
//   feb30_leaf   a torn strip of an old almanac page ≈ 420 × 330 px: three day rows (28, 29, 30) with the day numbers
//                painted as brush digits, faint lines of writing after each, the 30 in red with a red wash behind it.
//                o: {days: [28, 29, 30], red: 30 (the day painted red, false = none)}   parts: thirty top row29 row28
//
// Shots:
//   wc_feb30_page   an almanac page for February lying on a wooden desk, a candle burning beside it (live).
//       The page lists day rows from `from` to `to` (big serif numbers, faint lines of writing after them).
//       params: {month: "February", year: "1712", from: 24, to: 30, at: -1 (page already there) | s (it paints in),
//                add: [{day, at (s | cue), color: "red"}]   rows that are not there yet and paint themselves in,
//                lose: {day, at, label}   a red brush line strikes the row out, then the row washes back to paper,
//                ring: {day, at}   a red brush ring painted round that day's number,
//                candle: true | false, notes: [{text, x, y, ax?, ay?, at, color, size, align}]}
//   wc_feb30_leaps  the plan: eleven little calendar leaves "29 FEB" for the leap years 1700–1740 paint in one after
//       another (3 × 4 grid); from strike.at a red brush cross goes over each, in order; the last cell holds a note.
//       params: {years: [...] (default 1700, 1704, ... 1740), at (s, .1), strike: {at (s | cue), dur (s, 2)},
//                keep: [years not crossed], last: {text, at} (hand note in the 12th cell), title: {text, at}}
'use strict';

(() => {
  const C = WC.C, { rnd, mk, qcurve, along, washShape, mixc, clamp, seg, ss, eo, eio } = WC;
  const PI = Math.PI, TAU = PI * 2;
  const lite = (c, k = .4) => mixc(c, C.paperLight, k);
  const dark = (c, k = .35) => mixc(c, mixc(C.ink, C.night, .3), k);
  const paperBase = (X, W, H) => { const pp = WC.paper(); if (pp) X.drawImage(pp, 0, 0); else { X.fillStyle = C.paper; X.fillRect(0, 0, W, H); } };
  const mkCanvas = (w, h) => { const cv = document.createElement('canvas'); cv.width = Math.ceil(w); cv.height = Math.ceil(h); return cv; };

  // Catmull-Rom through points
  function spline(P, per = 6) {
    const n = P.length, out = [], g = i => P[Math.max(0, Math.min(n - 1, i))];
    for (let i = 0; i < n - 1; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(P[n - 1].slice());
    return out;
  }
  const ell = (cx, cy, rx, ry, a0 = 0, a1 = TAU, n = 32) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

  // brush digits in a box 0..1 wide (x .6), 0..1 tall (y down): each digit = list of strokes (point lists)
  const DIG = {
    0: [ell(.3, .5, .27, .48, -PI / 2, PI * 1.55, 30)],
    1: [[[.14, .2], [.34, 0], [.34, 1]]],
    2: [[[.04, .24], [.12, .06], [.32, 0], [.52, .1], [.54, .3], [.4, .52], [.04, 1]], [[.04, 1], [.58, .98]]],
    3: [[[.04, .14], [.24, 0], [.48, .06], [.52, .24], [.3, .45]], [[.3, .45], [.54, .58], [.56, .82], [.36, 1], [.04, .9]]],
    8: [ell(.3, .25, .2, .24, PI / 2, PI * 2.5, 22), ell(.3, .72, .26, .27, -PI / 2, PI * 1.5, 24)],
    9: [ell(.3, .28, .24, .27, 0, TAU, 24), [[.54, .3], [.5, .7], [.36, .96], [.14, .98]]],
  };
  function digits(S, str, x, y, h, w, colour) {
    let cx = x;
    for (const ch of String(str)) {
      const strokes = DIG[ch] || [];
      for (const P0 of strokes) {
        const P = (P0.length > 8 ? P0 : spline(P0, 5)).map(([u, v]) => [cx + u * h + rnd(-1, 1), y - h + v * h + rnd(-1, 1)]);
        S.push(mk(along(P, Math.max(8, Math.round(P.length * 1.2))), w, colour, { prof: 'even', nb: 3, a: .9, rough: .25 }));
      }
      cx += h * .68;
    }
    return cx;
  }
  // faint lines of hand-writing (no real words)
  function scribble(S, x0, x1, y, colour, a = .4, w = 3) {
    let x = x0;
    while (x < x1 - 20) {
      const len = Math.min(x1 - x, rnd(50, 130)), P = [];
      for (let k = 0; k <= Math.round(len / 7); k++) { const u = x + k * 7; P.push([u, y + Math.sin(u * .35 + rnd(0, 3)) * 3 + rnd(-1.5, 1.5)]); }
      S.push(mk(P, w, colour, { prof: 'even', nb: 0, a, rough: .4 }));
      x += len + rnd(14, 26);
    }
  }

  // ================================================================ feb30_leaf
  WC.G.feb30_leaf = (sc = 1, o = {}) => {
    const S = [], days = o.days || [28, 29, 30], red = o.red === false ? null : (o.red ?? 30);
    const w = 420 * sc, rh = 96 * sc, top = -(rh * days.length + 50 * sc), x0 = -w / 2, x1 = w / 2;
    // torn sheet: a ragged top edge, straight sides, soft shadow
    const edge = [];
    for (let x = x0; x <= x1; x += 14 * sc) edge.push([x, top + rnd(-7, 7) * sc]);
    const sheet = edge.concat([[x1, 0], [x0, 0]]);
    S.push(washShape(sheet.map(([x, y]) => [x + 8 * sc, y + 8 * sc]), mixc(C.stoneDark, C.night, .3), .14, 2, 2));
    S.push(washShape(sheet, mixc(C.paperLight, C.stain, .22), .95, 3, 1.2));
    S.push(washShape(WC.blobPts(x0 + w * .3, top + 60 * sc, w * .3, 40 * sc, 22, .3), C.stain, .18, 2, 2));
    S.push(washShape(WC.blobPts(x1 - 60 * sc, -40 * sc, 70 * sc, 34 * sc, 22, .3), C.stain, .14, 2, 2));
    S.push(mk(along(edge, 40), 2.4 * sc, C.inkSoft, { prof: 'even', nb: 0, a: .5, rough: .5 }));
    S.push(mk(qcurve(x0, top + 6, x0, 0, 1, 10), 2 * sc, C.inkSoft, { prof: 'even', nb: 0, a: .45 }));
    S.push(mk(qcurve(x1, top + 6, x1, 0, -1, 10), 2 * sc, C.inkSoft, { prof: 'even', nb: 0, a: .45 }));
    S.push(mk(qcurve(x0 + 10, -2, x1 - 10, -2, 0, 16), 2 * sc, C.inkSoft, { prof: 'even', nb: 0, a: .45 }));
    const parts = { top: [0, top + 10 * sc] };
    days.forEach((d, i) => {
      const yb = top + 50 * sc + (i + 1) * rh - 22 * sc, isRed = d === red;
      if (isRed) S.push(washShape(WC.blobPts(x0 + 86 * sc, yb - 32 * sc, 74 * sc, 44 * sc, 30, .08), C.red, .14, 3, 1.5));
      const end = digits(S, String(d), x0 + 40 * sc, yb, 60 * sc, 7 * sc, isRed ? C.red : C.ink);
      scribble(S, end + 30 * sc, x1 - 30 * sc, yb - 30 * sc, C.inkSoft, .42, 2.6 * sc);
      if (i < days.length - 1) S.push(mk(qcurve(x0 + 20, yb + 14 * sc, x1 - 20, yb + 14 * sc, 1, 14), 1.4 * sc, C.inkSoft, { prof: 'even', nb: 0, a: .3 }));
      parts['row' + d] = [end + 10 * sc, yb - 30 * sc];
      if (isRed) parts.thirty = [x0 + 80 * sc, yb - 30 * sc];
    });
    if (!parts.thirty) parts.thirty = parts['row' + days[days.length - 1]];
    return { S, parts };
  };

  // ================================================================ feb30_tent
  // a plain canvas army ridge tent seen three-quarter (early 18th c. camp), ≈ 200 px tall. o: {col: canvas token, flag: token | false}
  WC.G.feb30_tent = (sc = 1, o = {}) => {
    const S = [], cv = o.col ? WC.col(o.col) : mixc(C.stone, C.paperLight, .45), cd = mixc(cv, C.stoneDark, .5), k = sc;
    const P = pts => pts.map(([x, y]) => [x * k, y * k]);
    S.push(washShape(WC.blobPts(30 * k, 0, 190 * k, 12 * k, 24, .1), mixc(C.stoneDark, C.night, .3), .18, 2, 2));
    // side roof (a long slope going back to the right), then the front gable
    const side = P([[0, -190], [170, -160], [230, 0], [70, 0]]);
    S.push(washShape(side, cv, .8, 3, 1.2));
    S.push(washShape(P([[0, -190], [170, -160], [190, -118], [30, -140]]), lite(cv, .3), .35, 2, 1));
    for (let i = 1; i < 6; i++) { const f = i / 6; S.push(mk(qcurve((0 + 70 * f) * k, (-190 + 190 * f) * k, (170 + 60 * f) * k, (-160 + 160 * f) * k, 2, 10), 1.2 * k, cd, { prof: 'even', nb: 0, a: .35 })); }
    const front = P([[0, -190], [-80, 0], [70, 0]]);
    S.push(washShape(front, mixc(cv, C.stoneDark, .25), .85, 3, 1));
    S.push(washShape(P([[-4, -150], [-38, 0], [34, 0]]), mixc(C.ink, C.night, .3), .6, 2, .6));       // the open door
    S.push(washShape(P([[-4, -150], [34, 0], [56, 0], [10, -120]]), lite(cv, .2), .7, 2, .6));       // the flap tied back
    for (const L of [[[0, -190], [-80, 0]], [[0, -190], [70, 0]], [[0, -190], [170, -160]], [[170, -160], [230, 0]], [[70, 0], [230, 0]]])
      S.push(mk(along(P(L), 12), 2 * k, C.ink, { prof: 'even', nb: 0, a: .7, rough: .35 }));
    S.push(mk(along(P([[0, -190], [0, -236]]), 6), 3 * k, C.wood, { prof: 'even', nb: 0, a: .9 }));
    for (const [a, b] of [[[-40, -95], [-120, 0]], [[200, -80], [262, 0]]]) S.push(mk(along(P([a, b]), 8), 1 * k, C.inkSoft, { prof: 'even', nb: 0, a: .6 }));
    const fl = o.flag === false ? null : WC.col(o.flag || 'clothB');
    const live = fl ? (c, lt) => { const pts = []; for (let i = 0; i <= 8; i++) { const f = i / 8; pts.push([f * 46 * k, (-232 + Math.sin(lt * 3 + f * 4) * 4 * f) * k]); } WC.drawS(c, mk(pts, 16 * k, fl, { prof: 'tip', nb: 2, a: .85 })); } : null;
    return { S, live, top: [0, -236 * k] };
  };

  // ================================================================ wc_feb30_page
  SHOTS.wc_feb30_page = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const from = P.from ?? 24, to = P.to ?? 30, n = to - from + 1;
      const box = P.box || (portrait ? [190, 220, 960, 1120] : [W * .3, 60, W * .7, 900]);
      const [px0, py0, px1, py1] = box, head = P.header !== false;
      const headY = py0 + (portrait ? 120 : 90), rowsY0 = py0 + (head ? (portrait ? 250 : 190) : 60), rowsY1 = py1 - 40;
      const rh = (rowsY1 - rowsY0) / n, numS = Math.round(Math.min(rh * .78, P.num_size || (portrait ? 82 : 66)));
      const rowY = d => rowsY0 + (d - from + .5) * rh;                      // the baseline-ish centre of a row
      const numX = P.num_x != null ? px0 + (px1 - px0) * P.num_x : px0 + (portrait ? 70 : 60);
      const adds = (P.add || []).map(a => Object.assign({}, a));
      const dyn = new Set(adds.map(a => a.day).concat(P.lose ? [P.lose.day] : []));
      // per-row writing strokes (baked once, deterministic)
      const rowInk = {};
      WC.withSeed(seed * 17 + 5, () => {
        for (let d = from; d <= to; d++) {
          const S = []; X.font = `700 ${numS}px ${WC.SERIF}`;
          const nw = X.measureText(String(d)).width;
          scribble(S, numX + nw + 40, px1 - 50, rowY(d) - numS * .05, C.inkSoft, .4, portrait ? 3.4 : 2.8);
          if (rnd() < .5) scribble(S, numX + nw + 40, numX + nw + 40 + rnd(120, 260), rowY(d) + numS * .32, C.inkSoft, .28, 2.4);
          rowInk[d] = S;
        }
      });
      const drawRow = (c, d, p, col, am = 1) => {
        if (p <= 0) return;
        c.save(); c.globalAlpha = am;
        WC.serif(c, String(d), numX, rowY(d) + numS * .34, seg(p, 0, .55), { size: numS, w: 700, align: 'left', col });
        WC.drawList(c, rowInk[d], seg(p, .35, 1), null, 1);
        c.restore();
      };
      const desk = WC.withSeed(seed * 31 + 11, () => {
        const back = mkCanvas(W, H), c = back.getContext('2d'); paperBase(c, W, H);
        // the desk: warm wood washes with grain, darker towards the bottom
        const wood = mixc(C.wood, C.paper, .45);
        WC.wash(c, [[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]], wood, .42, 3, 3);
        for (let i = 0; i < (portrait ? 70 : 60); i++) { const y = rnd(-20, H + 20); WC.band(c, rnd(-200, W * .4), rnd(W * .6, W + 200), y, rnd(4, 14), WC.pick([C.wood, wood, lite(C.wood, .3)]), rnd(.08, .18)); }
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, WC.rgba(C.night, 0)); g.addColorStop(1, WC.rgba(C.night, .16)); c.fillStyle = g; c.fillRect(0, 0, W, H);
        return back;
      });
      const page = WC.withSeed(seed * 37 + 3, () => {
        const cv = mkCanvas(W, H), c = cv.getContext('2d');
        const pts = []; for (let x = px0; x <= px1; x += 20) pts.push([x, py0 + rnd(-2, 2)]);
        for (let y = py0; y <= py1; y += 20) pts.push([px1 + rnd(-2, 2), y]);
        for (let x = px1; x >= px0; x -= 20) pts.push([x, py1 + rnd(-2, 2)]);
        for (let y = py1; y >= py0; y -= 20) pts.push([px0 + rnd(-2, 2), y]);
        WC.wash(c, pts.map(([x, y]) => [x + 14, y + 16]), mixc(C.night, C.wood, .4), .22, 3, 2);
        WC.wash(c, pts, C.paperLight, .96, 3, 1);
        WC.wash(c, pts, C.stain, .1, 2, 1);
        WC.blob(c, px0 + 90, py0 + 120, 110, 70, C.stain, .2); WC.blob(c, px1 - 80, py1 - 90, 130, 60, C.stain, .16); WC.blob(c, px1 - 120, py0 + 200, 70, 40, C.skyWarm, .14);
        WC.drawS(c, mk(along(pts.slice(0, Math.round(pts.length / 4) + 1), 30), 2.2, C.inkSoft, { prof: 'even', nb: 0, a: .4 }));
        // header: the month in spaced serif caps, the year in hand, a double rule
        if (head) { c.save(); c.font = `700 ${portrait ? 92 : 70}px ${WC.SERIF}`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        c.letterSpacing = (portrait ? 10 : 8) + 'px'; c.fillStyle = WC.rgba(C.ink, .92);
        c.fillText(String(P.month || 'February').toLocaleUpperCase(LOCALE), (px0 + px1) / 2 + 5, headY);
        c.restore();
        if (P.year) WC.hand(c, String(P.year), (px0 + px1) / 2, headY + (portrait ? 64 : 50), 1, { size: portrait ? 62 : 50, align: 'center', col: mixc(C.ink, C.wood, .3) });
        for (const dy of [0, 10]) WC.drawS(c, mk(qcurve(px0 + 40, rowsY0 - 28 + dy, px1 - 40, rowsY0 - 28 + dy, 1, 20), dy ? 1.6 : 3, C.ink, { prof: 'even', nb: 0, a: .7 })); }
        // the static rows and the thin rules between rows
        for (let d = from; d <= to; d++) {
          if (d < to) WC.drawS(c, mk(qcurve(px0 + 40, rowY(d) + rh / 2, px1 - 40, rowY(d) + rh / 2, 1, 16), 1.4, C.inkSoft, { prof: 'even', nb: 0, a: .25 }));
          if (!dyn.has(d)) drawRow(c, d, 1, C.ink);
        }
        return cv;
      });
      const candle = P.candle !== false ? WC.make('candle', portrait ? 1.25 : 1, { holder: true }, seed + 3) : null;
      const quill = P.quill ? WC.make('quill', P.quill.s ?? 1.2, {}, seed + 4) : null;
      const cx = P.candle_x != null ? P.candle_x * W : (portrait ? 110 : px0 - 120), cy = P.candle_y != null ? P.candle_y * H : (portrait ? 1090 : py1 - 20);
      const pAt = P.at ?? -1;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(desk, 0, 0);
          const pp = pAt === -1 ? 1 : ss(seg(lt, pAt, pAt + 1));
          if (pp > 0) { X.save(); X.globalAlpha = pp; X.drawImage(page, 0, 0); X.restore(); }
          // rows that paint in
          for (const a of adds) {
            const t0 = WC.timeOf(a.at, cues, 1), p = seg(lt, t0, t0 + (a.paint ?? .6));
            if (p <= 0) continue;
            const red = a.color === 'red';
            if (red) { const k = (.35 + .65 * eo(p)) * (1 + .06 * Math.sin(lt * 1.6)); WC.withSeed(seed + 51, () => WC.wash(X, WC.blobPts(numX + numS * .55, rowY(a.day), numS * 1.15 * k, numS * .62 * k, 26, .2), C.red, (.2 + .06 * Math.sin(lt * 1.6)) * ss(p), 3, 1)); }
            drawRow(X, a.day, seg(lt, t0, t0 + .6), red ? C.red : C.ink);
          }
          // a row struck out and washed away
          if (P.lose) {
            const L = P.lose, t0 = WC.timeOf(L.at, cues, 1), y = rowY(L.day);
            const fade = ss(seg(lt, t0 + .45, t0 + 1.3));
            drawRow(X, L.day, 1, C.ink, 1 - fade * .82);
            const sp = seg(lt, t0, t0 + .45);
            if (sp > 0) {
              const S = WC.withSeed(seed + 99, () => mk(qcurve(numX - 30, y + 6, px1 - 60, y - 8, -8, 24), portrait ? 16 : 12, C.red, { prof: 'brush', nb: 4, a: .85 }));
              WC.drawS(X, S, sp);
            }
            if (L.label) WC.hand(X, L.label, px1 - 60, y + rh * .62, seg(lt, t0 + .1, t0 + .6), { size: portrait ? 56 : 44, align: 'right', col: C.red, w: 700 });
          }
          if (P.ring) {
            const t0 = WC.timeOf(P.ring.at, cues, .2), y = rowY(P.ring.day);
            const R = WC.withSeed(seed + 7, () => mk(ell(numX + numS * .55, y + 2, numS * 1.05, numS * .62, -PI * .7, PI * 1.45, 40), portrait ? 9 : 7, C.red, { prof: 'leaf', nb: 3, a: .85 }));
            WC.drawS(X, R, seg(lt, t0, t0 + .7));
          }
          if (quill) WC.drawObj(X, quill, P.quill.x * W, P.quill.y * H, 1, { rot: P.quill.rot ?? -.2 });
          if (candle) {
            WC.drawObj(X, candle, cx, cy, 1);
            X.save(); X.translate(cx, cy); candle.live(X, lt, {}); X.restore();
          }
          for (const nt of P.notes || []) {
            const t0 = WC.timeOf(nt.at, cues, 1.2), size = nt.size || (portrait ? 56 : 44), col = nt.color === 'red' ? C.red : C.ink;
            if (nt.ax != null) WC.note(X, lt, t0, nt.ax * W, nt.ay * H, nt.x * W, nt.y * H, nt.text, { size, col, w: 700 });
            else WC.hand(X, nt.text, nt.x * W, nt.y * H, seg(lt, t0, t0 + 1), { size, align: nt.align || 'center', col, w: 700 });
          }
        },
      };
    },
  };

  // ================================================================ wc_feb30_leaps
  SHOTS.wc_feb30_leaps = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const years = P.years || [1700, 1704, 1708, 1712, 1716, 1720, 1724, 1728, 1732, 1736, 1740];
      const keep = new Set(P.keep || []);
      const cols = portrait ? 3 : 6, rows = Math.ceil((years.length + 1) / cols);
      const gx0 = portrait ? 50 : 260, gx1 = portrait ? W - 50 : W - 260, gy0 = portrait ? 300 : 190, gy1 = portrait ? 1140 : 880;
      const cw = (gx1 - gx0) / cols, ch = (gy1 - gy0) / rows, lw = cw * .88, lh = ch * .86;
      const cell = i => [gx0 + (i % cols + .5) * cw, gy0 + (Math.floor(i / cols) + .5) * ch];
      const back = WC.withSeed(seed * 13 + 1, () => {
        const cv = mkCanvas(W, H), c = cv.getContext('2d'); paperBase(c, W, H);
        WC.blob(c, W * .5, (gy0 + gy1) / 2, W * .55, (gy1 - gy0) * .55, C.sky, .2);
        WC.blob(c, W * .3, gy1 - 60, W * .35, 120, C.skyWarm, .14);
        // the paper continues under the subtitles: a pale wash band, never empty
        WC.blob(c, W * .5, H * .82, W * .7, H * .12, C.stain, .12);
        return cv;
      });
      // one leaf: a small torn calendar leaf with a coloured top band, "FEB" and a big 29, the year on the band
      const leaves = years.map((y, i) => WC.withSeed(seed * 7 + i * 31, () => {
        const cv = mkCanvas(lw + 30, lh + 30), c = cv.getContext('2d'), x0 = 8, y0 = 8, x1 = lw, y1 = lh;
        const rect = [[x0, y0], [x1, y0 + rnd(-2, 2)], [x1 + rnd(-2, 2), y1], [x0, y1 + rnd(-2, 2)]];
        WC.wash(c, rect.map(([x, y]) => [x + 8, y + 9]), mixc(C.night, C.stoneDark, .4), .2, 2, 1);
        WC.wash(c, rect, C.paperLight, .97, 3, 1);
        WC.blob(c, x0 + lw * .3, y1 - lh * .25, lw * .25, lh * .14, C.stain, .2);
        const band = [[x0, y0], [x1, y0], [x1, y0 + lh * .28], [x0, y0 + lh * .28]];
        WC.wash(c, band, mixc(C.blue, C.paper, .3), .62, 3, 1);
        c.save(); c.font = `700 ${Math.round(lh * .21)}px ${WC.SERIF}`; c.textAlign = 'center'; c.fillStyle = WC.rgba(C.paperLight, .97);
        c.fillText(String(y), (x0 + x1) / 2, y0 + lh * .205); c.restore();
        c.save(); c.font = `700 ${Math.round(lh * .42)}px ${WC.SERIF}`; c.textAlign = 'center'; c.fillStyle = WC.rgba(C.ink, .9);
        c.fillText('29', (x0 + x1) / 2, y0 + lh * .7); c.restore();
        c.save(); c.font = `600 ${Math.round(lh * .13)}px ${WC.SERIF}`; c.textAlign = 'center'; c.letterSpacing = '4px'; c.fillStyle = WC.rgba(C.inkSoft, .95);
        c.fillText('FEB'.toLocaleUpperCase(LOCALE), (x0 + x1) / 2, y0 + lh * .9); c.restore();
        WC.drawS(c, mk(along(rect.concat([rect[0]]), 40), 2, C.inkSoft, { prof: 'even', nb: 0, a: .4 }));
        return cv;
      }));
      const crosses = years.map((y, i) => WC.withSeed(seed * 3 + i * 5, () => {
        const [x, yy] = cell(i), r = Math.min(lw, lh) * .36;
        return [mk(qcurve(x - r, yy - r * .9, x + r, yy + r * .9, rnd(-8, 8), 12), portrait ? 13 : 10, C.red, { prof: 'brush', nb: 4, a: .88 }),
                mk(qcurve(x + r, yy - r * .9, x - r, yy + r * .9, rnd(-8, 8), 12), portrait ? 13 : 10, C.red, { prof: 'brush', nb: 4, a: .88 })];
      }));
      const at0 = P.at ?? .1;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          X.clear(); X.drawImage(back, 0, 0);
          if (P.title && P.title.text) WC.serif(X, P.title.text, W / 2, gy0 - (portrait ? 70 : 50), seg(lt, WC.timeOf(P.title.at, cues, .1), WC.timeOf(P.title.at, cues, .1) + 1), { size: portrait ? 76 : 60, w: 700 });
          const st = WC.timeOf(P.strike && P.strike.at, cues, dur * .45), sd = (P.strike && P.strike.dur) || 2;
          years.forEach((y, i) => {
            const [x, yy] = cell(i), p = ss(seg(lt, at0 + i * .12, at0 + i * .12 + .6));
            if (p <= 0) return;
            const rot = (WC.hash(i + seed) - .5) * .08 + Math.sin(lt * .8 + i) * .006;
            X.save(); X.translate(x, yy + (1 - p) * 18); X.rotate(rot); X.globalAlpha = p;
            X.drawImage(leaves[i], -lw / 2 - 4, -lh / 2 - 4); X.restore();
            if (!keep.has(y)) {
              const t = st + i * sd / years.length;
              WC.drawS(X, crosses[i][0], seg(lt, t, t + .25)); WC.drawS(X, crosses[i][1], seg(lt, t + .15, t + .4));
            }
          });
          if (P.last && P.last.text) {
            const [x, yy] = cell(years.length);
            WC.hand(X, P.last.text, x, yy, seg(lt, WC.timeOf(P.last.at, cues, st + sd), WC.timeOf(P.last.at, cues, st + sd) + 1), { size: portrait ? 58 : 46, align: 'center', col: C.red, w: 700 });
          }
        },
      };
    },
  };
})();
