// wc_cem — Cem Sultan (videos/2026-11-26/02-cem-sultan.json): the tower built to hold him at Bourganeuf, an
// inscribed Ottoman coin, period standards and two figures the library has no dress for.
// Watercolour kit: wc__lib.js (docs/SULUBOYA.md §9). Deterministic (WC.rnd inside WC.make), colours only from tokens.
//
// Objects (WC.G; origin = base centre on the ground, y up negative, sc 1 = natural size):
//   cem_tower    a tall round stone keep with a conical roof (the Tour Zizim, ≈ 560 px at sc 1), string courses,
//                arrow slits, mottled wash on the stone, an arched window high up: o.lit (default true) → a warm
//                candle wash flickering in it (live) and a soft, half-transparent figure of a turbaned man at it.
//                o: {h: height ×, lit: true|false, figure: true|false, col: stone token}   parts: window roof base
//   cem_akce     an Ottoman coin, no portrait: a slightly irregular disc, a dotted border and three lines of
//                calligraphic inscription. o: {metal: 'silver' (akçe) | 'gold' (sultani)}   parts: face text rim
//   cem_tug      a horsetail standard (tuğ): a pole, a gilded ball finial, a dark horsehair plume hanging below it.
//                o: {h: ×}   live: the hair stirs in the wind
//   cem_sancak   a plain swallow-tailed war banner on a pole (no crescent, no star). o: {color: token (red), h: ×}
//                live: the cloth waves
//   cem_pope     a pope standing: white cassock and alb, red mozzetta cape, the three-tiered tiara, a gold staff
//                with a cross. o: {flip}   parts: head hand
//   (cem_tower o.wide: × the width of the drum, roof and window; default 1)
// Shot:
//   wc_cem_fog   a wc_scene (same params) that a morning fog slowly swallows: soft bands of mist drifting low, and a
//                paper-coloured veil thickening over the whole picture from 0 to params.fog (default .6) across the
//                scene; notes are drawn on top of the fog so they stay readable.
//   cem_hospitaller  a Knight Hospitaller grand master in council: bare head, grey hair and beard, a black mantle
//                with the white cross of the Order on the breast. o: {pose: 'stand'|'point'}   parts: head hand
'use strict';

(() => {
  const C = WC.C, { mk, mixc, rnd, washShape, blobPts } = WC, rgbaC = WC.rgba;
  const add = (S, s) => (S.push(s), s);
  const wsh = (S, pts, c, a = .6, passes = 3, jit = 1.2) => add(S, washShape(pts, c, a, passes, jit));
  const ink = (S, pts, w, a = .75, col = C.ink) => S.push(...WC.inkLine(pts, w, col, { step: 2, a }));
  const ell = (cx, cy, rx, ry, n = 24) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const scl = (P, sc) => P.map(([x, y]) => [x * sc, y * sc]);

  // ================================================================ the tower
  WC.G.cem_tower = (sc, o = {}) => {
    const h = o.h ?? 1;
    const base = WC.G.tower(sc, { style: 'round', h: 2.1 * h, roof: true, col: o.col });
    const S = base.S.slice(), H = 250 * 2.1 * h * sc, r = 44 * sc;
    const stone = WC.col(o.col || 'stone'), shade = mixc(stone, C.stoneDark, .6);
    // mottled stone: soft blots of darker and warmer wash, a few dry vertical drags (less flat, more brush)
    for (let k = 0; k < 14; k++) {
      const y = -H * rnd(.05, .92), x = rnd(-.7, .7) * r;
      wsh(S, blobPts(x, y, r * rnd(.18, .4), r * rnd(.3, .7), 16, .3), k % 3 ? mixc(stone, C.stoneDark, .45) : mixc(stone, C.stain, .5), rnd(.08, .16), 2, 1.4 * sc);
    }
    for (let k = 0; k < 9; k++) {
      const x = rnd(-.85, .85) * r, y0 = -H * rnd(.05, .8);
      S.push(mk([[x, y0], [x + rnd(-2, 2) * sc, y0 - H * rnd(.06, .16)]], rnd(3, 6) * sc, mixc(stone, C.stoneDark, .5), { prof: 'leaf', nb: 6, a: .18 }));
    }
    // the shadowed side, a broad wash down the right of the drum
    wsh(S, [[r * .35, -H * .97], [r * .98, -H * .97], [r * .98, 0], [r * .4, 0]], C.stoneDark, .14, 2, 1.5 * sc);
    for (let k = 1; k <= 5; k++) {
      const y = -H * k / 6.2;
      S.push(mk(WC.qcurve(-r * .96, y, r * .96, y, 3 * sc, 10), 3.2 * sc, shade, { prof: 'even', nb: 3, a: .38 }));
    }
    for (const [fx, fy] of [[-.35, .2], [.3, .38], [-.2, .55], [.38, .68]]) {
      const x = fx * r, y = -H * fy;
      S.push(mk([[x, y - 13 * sc], [x, y + 13 * sc]], 3.6 * sc, mixc(C.ink, C.night, .3), { prof: 'leaf', nb: 2, a: .7 }));
    }
    // an arched window high up: a dark recess, warm candle wash pooled in its lower half
    const wy = -H * .8, ww = 20 * sc, wh = 46 * sc;
    const arch = [];
    for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; arch.push([Math.cos(a) * ww, wy - wh * .2 + Math.sin(a) * ww]); }
    const win = [[-ww, wy + wh * .5]].concat(arch, [[ww, wy + wh * .5]]);
    const lit = o.lit !== false;
    wsh(S, win, mixc(C.ink, C.night, .45), .72, 3, .8 * sc);
    if (lit) {
      wsh(S, blobPts(0, wy, ww * .95, wh * .62, 20, .15), mixc(C.gold, C.paperLight, .25), .85, 3, 1.2 * sc);
      wsh(S, blobPts(0, wy + wh * .18, ww * .8, wh * .3, 16, .2), mixc(C.gold, C.fire, .3), .45, 2, 1 * sc);
    }
    S.push(mk(win.concat([win[0]]), 2.4 * sc, mixc(stone, C.ink, .55), { prof: 'even', nb: 2, a: .6, rough: .4 }));
    S.push(mk([[-ww * 1.5, wy + wh * .55], [ww * 1.5, wy + wh * .55]], 5 * sc, mixc(stone, C.paperLight, .25), { prof: 'leaf', nb: 3, a: .8 }));
    const kx = o.wide ?? 1;
    if (kx !== 1) for (const q of S) { if (q.poly) q.poly = q.poly.map(r => r.map(([x, y]) => [x * kx, y])); q.pts = q.pts.map(([x, y]) => [x * kx, y]); }
    const res = Object.assign({}, base, { S, parts: Object.assign({}, base.parts || {}, { window: [0, wy], roof: base.top || [0, -H - 120 * sc], base: [0, 0] }) });
    if (lit) {
      const prev = base.live;
      res.live = (c, lt, it) => {
        if (prev) prev(c, lt, it);
        const f = .82 + .1 * Math.sin(lt * 5.3) + .08 * Math.sin(lt * 11.7 + 1.3), gr = 150 * sc * kx;
        // a broad, soft amber wash of light spilling round the window onto the stone and the night
        const g = c.createRadialGradient(0, wy, 0, 0, wy, gr);
        g.addColorStop(0, rgbaC(C.gold, .75 * f)); g.addColorStop(.3, rgbaC(C.gold, .34 * f)); g.addColorStop(.7, rgbaC(C.fire, .08 * f)); g.addColorStop(1, rgbaC(C.gold, 0));
        c.fillStyle = g; c.beginPath(); c.arc(0, wy, gr, 0, 7); c.fill();
        c.save(); c.scale(kx, 1);
        if (o.figure !== false) {
          // the man at the window: soft-edged, half transparent, against the candlelight
          const sway = Math.sin(lt * .5) * .6 * sc;
          c.save();
          c.beginPath(); c.moveTo(-ww, wy + wh * .5); arch.forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(ww, wy + wh * .5); c.closePath(); c.clip();
          c.filter = `blur(${(.9 * sc).toFixed(2)}px)`;
          c.fillStyle = rgbaC(mixc(C.ink, C.night, .3), .72);
          c.beginPath(); c.ellipse(sway, wy + 4 * sc, 6.5 * sc, 7.5 * sc, 0, 0, 7); c.fill();
          c.beginPath(); c.ellipse(sway, wy - 4 * sc, 9 * sc, 6 * sc, 0, 0, 7); c.fill();
          c.beginPath(); c.moveTo(sway - 16 * sc, wy + wh * .55); c.quadraticCurveTo(sway - 14 * sc, wy + 13 * sc, sway, wy + 11 * sc);
          c.quadraticCurveTo(sway + 14 * sc, wy + 13 * sc, sway + 16 * sc, wy + wh * .55); c.closePath(); c.fill();
          c.restore();
        }
        c.restore();
      };
    }
    return res;
  };

  // ================================================================ a scene swallowed by fog
  SHOTS.wc_cem_fog = {
    kind: '2d',
    build(ctx) {
      const { W, H, P } = ctx;
      const s = WC.scene(Object.assign({}, ctx, { P: Object.assign({}, P, { notes: [] }) })), X = s.X;
      const top = P.fog ?? .6;
      return {
        update(lt, dur, cues) {
          cues = cues || {};
          s.update(lt, dur, cues);
          const f = WC.ss(WC.seg(lt, .3, dur - .4));
          X.save();
          X.fillStyle = rgbaC(C.paperLight, top * f); X.fillRect(0, 0, W, H);
          for (let i = 0; i < 5; i++) {
            const y = s.gy - H * (.42 - i * .1), x = Math.sin(lt * .15 + i * 1.7) * W * .08;
            const g = X.createLinearGradient(0, y - 90, 0, y + 90);
            g.addColorStop(0, rgbaC(C.paperLight, 0)); g.addColorStop(.5, rgbaC(C.paperLight, .32 + .3 * f)); g.addColorStop(1, rgbaC(C.paperLight, 0));
            X.fillStyle = g; X.fillRect(x - W * .1, y - 90, W * 1.2, 180);
          }
          X.restore();
          for (const n of P.notes || []) {
            const t0 = WC.timeOf(n.at, cues, 1.2), col = n.color === 'red' ? C.red : C.ink;
            if (n.ax != null) WC.note(X, lt, t0, n.ax * W, n.ay * H, n.x * W, n.y * H, n.text, { size: n.size || 44, col });
            else WC.hand(X, n.text, n.x * W, n.y * H, WC.seg(lt, t0, t0 + 1), { size: n.size || 44, align: n.align || 'center', col });
          }
        },
      };
    },
  };

  // ================================================================ the coin (no portrait: inscribed)
  WC.G.cem_akce = (sc, o = {}) => {
    const S = [], R = 120, gold = o.metal === 'gold';
    const metal = gold ? mixc(C.gold, C.wood, .12) : mixc(C.stone, C.paperLight, .15), dk = mixc(metal, C.ink, .68);
    const rim = blobPts(0, -R, R, R, 40, .02);
    wsh(S, rim, metal, .85, 3, 1.2);
    wsh(S, blobPts(R * .3, -R * .8, R * .62, R * .7, 30, .1), mixc(metal, C.stoneDark, .35), .22, 2, 1);
    wsh(S, blobPts(-R * .4, -R * 1.4, R * .22, R * .14, 16, .2), C.paperLight, .3, 2, 1);
    S.push(mk(rim.concat([rim[0]]), 7, mixc(metal, C.ink, .3), { prof: 'even', nb: 3, a: .55, rough: .3 }));
    S.push(mk(rim.concat([rim[0]]), 2.4, dk, { prof: 'even', nb: 1, a: .7, rough: .35 }));
    const inner = blobPts(0, -R, R * .78, R * .78, 36, .015);
    S.push(mk(inner.concat([inner[0]]), 1.8, dk, { prof: 'even', nb: 0, a: .45, rough: .3 }));
    for (let i = 0; i < 44; i++) { const a = i / 44 * Math.PI * 2, x = Math.cos(a) * R * .86, y = -R + Math.sin(a) * R * .86; S.push(mk([[x - 1.5, y], [x + 1.5, y]], 4, dk, { prof: 'leaf', nb: 0, a: .6 })); }
    // three lines of script: flowing ink strokes with dots and tall letters (calligraphy, not readable text)
    [[-R * 1.32, .6], [-R * 1.0, .78], [-R * .68, .58]].forEach(([y, wf], li) => {
      const w = R * wf, n = 5 + li;
      for (let k = 0; k < n; k++) {
        const x0 = -w + (2 * w) * k / n, x1 = x0 + (2 * w) / n * rnd(.6, .9);
        S.push(mk(WC.qcurve(x0, y + rnd(-3, 3), x1, y + rnd(-4, 4), rnd(-8, 8), 8), rnd(4.5, 7), dk, { prof: 'tip', nb: 2, a: .85 }));
        if (rnd() < .5) S.push(mk([[x0 + 4, y + 2], [x0 + rnd(-2, 2), y - rnd(16, 26)]], 4.5, dk, { prof: 'tip', nb: 0, a: .85 }));
        if (rnd() < .5) S.push(mk([[x1 - 3, y - 12], [x1, y - 11]], 4, dk, { prof: 'leaf', nb: 0, a: .7 }));
      }
    });
    return { S: S.map(s => s).map(s => (scaleS(s, sc), s)), parts: { face: [0, -R * sc], text: [0, -R * 1.0 * sc], rim: [-R * .92 * sc, -R * sc] } };
  };
  function scaleS(s, sc) {
    if (sc === 1) return;
    const M = ([x, y]) => [x * sc, y * sc];
    if (s.poly) { s.poly = s.poly.map(r => r.map(M)); s.pts = s.pts.map(M); return; }
    s.pts = s.pts.map(M); s.ws = s.ws.map(w => Math.max(.5, w * sc));
    if (s.br) for (const b of s.br) { b.bw = Math.max(.6, b.bw * sc); b.dash = b.dash.map(d => d * sc); }
  }
  const fin = (S, sc, x = {}) => { S.forEach(s => scaleS(s, sc)); const out = Object.assign({}, x, { S }); if (x.parts) { out.parts = {}; for (const k in x.parts) out.parts[k] = [x.parts[k][0] * sc, x.parts[k][1] * sc]; } return out; };

  // ================================================================ standards
  const pole = (S, H) => { S.push(mk([[0, 0], [rnd(-2, 2), -H]], 5, mixc(C.wood, C.ink, .2), { prof: 'even', nb: 3, a: .9 })); ink(S, [[2.5, 0], [2.5, -H]], 1.2, .5); };
  WC.G.cem_tug = (sc, o = {}) => {
    const S = [], H = 300 * (o.h ?? 1);
    pole(S, H);
    wsh(S, ell(0, -H - 9, 9, 10), C.gold, .9, 2, .6);
    wsh(S, ell(0, -H - 24, 4, 7), C.gold, .9, 2, .4);
    const res = fin(S, sc, { top: [0, -H] });
    const hair = mixc(C.ink, C.wood, .25);
    res.live = (c, lt) => {
      c.save(); c.scale(sc, sc);
      for (let k = 0; k < 16; k++) {
        const ph = k * .7, len = 70 + (k % 5) * 9, x0 = (k - 8) * 1.3;
        const sw = Math.sin(lt * 1.6 + ph) * 6 + 5;
        c.strokeStyle = rgbaC(hair, .55); c.lineWidth = 3.2; c.lineCap = 'round';
        c.beginPath(); c.moveTo(x0, -H + 2); c.quadraticCurveTo(x0 + sw * .5, -H + len * .5, x0 + sw, -H + len); c.stroke();
      }
      c.restore();
    };
    return res;
  };
  WC.G.cem_sancak = (sc, o = {}) => {
    const S = [], H = 300 * (o.h ?? 1), col = WC.col(o.color || 'red');
    pole(S, H);
    wsh(S, ell(0, -H - 6, 6, 7), C.gold, .9, 2, .5);
    const res = fin(S, sc, { top: [0, -H] });
    res.live = (c, lt) => {
      c.save(); c.scale(sc, sc);
      const n = 10, top = [], bot = [], w = 120, hh = 64;
      for (let k = 0; k <= n; k++) {
        const s = k / n, wv = Math.sin(lt * 2.6 - s * 4.5) * 9 * s;
        top.push([s * w, -H + 4 + wv]); bot.push([s * w, -H + 4 + hh * (1 - s * .1) + wv + s * 6]);
      }
      c.beginPath(); top.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y));
      const [tx, ty] = top[n], [bx, by] = bot[n]; c.lineTo(tx - 26, (ty + by) / 2);   // swallow tail
      for (let k = n; k >= 0; k--) c.lineTo(bot[k][0], bot[k][1]);
      c.closePath(); c.fillStyle = rgbaC(col, .72); c.fill();
      c.fillStyle = rgbaC(mixc(col, C.ink, .35), .25);
      for (let k = 2; k < n; k += 3) { c.beginPath(); c.rect(top[k][0], top[k][1], w / n, hh * .9); c.fill(); }
      c.strokeStyle = rgbaC(mixc(col, C.ink, .5), .5); c.lineWidth = 1.4; c.stroke();
      c.restore();
    };
    return res;
  };

  // ================================================================ figures
  // a standing figure in a long robe, painted with washes and a few folds; returns the shoulder / head points
  function robeFigure(S, o) {
    const H = 172, sh = -H * .74, hem = 0, rw = o.rw ?? 34, hw = o.hw ?? 22;
    const body = [[-hw, sh], [hw, sh], [rw * .9, -H * .3], [rw, hem], [-rw, hem], [-rw * .9, -H * .3]];
    wsh(S, body, o.robe, .85, 3, 1.4);
    wsh(S, [[hw * .2, sh], [hw, sh], [rw, hem], [rw * .25, hem]], mixc(o.robe, C.ink, .35), .22, 2, 1.2);
    for (let k = 0; k < 4; k++) { const x = rnd(-.6, .6) * rw; S.push(mk([[x * .6, sh + 20], [x, hem - 3]], rnd(2, 4), mixc(o.robe, C.ink, .3), { prof: 'leaf', nb: 3, a: .3 })); }
    S.push(mk(body.concat([body[0]]), 1.8, mixc(o.robe, C.ink, .6), { prof: 'even', nb: 1, a: .45, rough: .45 }));
    // arms (sleeves) and hands
    const hand = o.point ? [rw + 34, sh + 18] : [hw + 10, sh + 58];
    S.push(mk([[hw - 4, sh + 4], [(hw + hand[0]) / 2 + 4, (sh + hand[1]) / 2], hand], 13, o.sleeve || o.robe, { prof: 'even', nb: 3, a: .85 }));
    wsh(S, ell(hand[0], hand[1], 4.5, 4), C.skin, .9, 2, .4);
    S.push(mk([[-hw + 4, sh + 4], [-hw - 6, sh + 34], [-hw + 2, sh + 58]], 13, o.sleeve || o.robe, { prof: 'even', nb: 3, a: .85 }));
    // head
    const hy = sh - 15;
    wsh(S, blobPts(0, hy, 10.5, 12.5, 20, .06), C.skin, .9, 3, .6);
    wsh(S, blobPts(3, hy + 2, 5, 9, 12, .1), mixc(C.skin, C.ink, .3), .2, 2, .4);
    S.push(mk([[-2, hy - 1], [0, hy - 1]], 2, C.ink, { prof: 'leaf', nb: 0, a: .7 }));
    S.push(mk([[4, hy - 1], [6, hy - 1]], 2, C.ink, { prof: 'leaf', nb: 0, a: .7 }));
    return { sh, hy, hand, H };
  }
  WC.G.cem_pope = (sc, o = {}) => {
    const S = [];
    wsh(S, ell(4, -2, 48, 7), C.stoneDark, .18, 2, 1);
    const white = mixc(C.paperLight, C.stone, .12);
    const f = robeFigure(S, { robe: white, sleeve: white, rw: 36 });
    // red mozzetta (short cape) over the shoulders, a gold stole hanging down the front
    wsh(S, [[-26, f.sh - 2], [26, f.sh - 2], [30, f.sh + 30], [0, f.sh + 38], [-30, f.sh + 30]], C.red, .82, 3, 1);
    S.push(mk([[-6, f.sh + 30], [-8, -8]], 6, C.gold, { prof: 'even', nb: 2, a: .75 }));
    S.push(mk([[6, f.sh + 30], [8, -8]], 6, C.gold, { prof: 'even', nb: 2, a: .75 }));
    // grey beard, then the three-tiered tiara (beehive of white with three gold crowns, a small cross)
    wsh(S, blobPts(0, f.hy + 10, 7, 6, 12, .2), mixc(C.stone, C.paperLight, .3), .8, 2, .4);
    const ty = f.hy - 10;
    const tiara = [[-11, ty], [11, ty], [12, ty - 14], [10, ty - 28], [5, ty - 38], [-5, ty - 38], [-10, ty - 28], [-12, ty - 14]];
    wsh(S, tiara, white, .95, 3, .6);
    for (const y of [ty - 2, ty - 15, ty - 28]) S.push(mk([[-12 + (y < ty - 20 ? 2 : 0), y], [12 - (y < ty - 20 ? 2 : 0), y]], 4, C.gold, { prof: 'even', nb: 1, a: .9 }));
    S.push(mk([[0, ty - 38], [0, ty - 48]], 2.5, C.gold, { prof: 'even', nb: 0, a: .9 }), mk([[-4, ty - 44], [4, ty - 44]], 2.5, C.gold, { prof: 'even', nb: 0, a: .9 }));
    ink(S, tiara.concat([tiara[0]]), 1.2, .45);
    // the staff with a cross, held in the right hand
    const [hx, hy] = f.hand, top = hy - 150;
    S.push(mk([[hx, -2], [hx, top]], 4.5, C.gold, { prof: 'even', nb: 2, a: .9 }));
    S.push(mk([[hx, top], [hx, top - 26]], 4, C.gold, { prof: 'even', nb: 0, a: .9 }), mk([[hx - 11, top - 16], [hx + 11, top - 16]], 4, C.gold, { prof: 'even', nb: 0, a: .9 }));
    wsh(S, ell(hx, hy, 5, 4.5), C.skin, .95, 2, .3);
    return fin(S, sc, { parts: { head: [0, f.hy], hand: [hx, hy] } });
  };
  WC.G.cem_hospitaller = (sc, o = {}) => {
    const S = [];
    wsh(S, ell(4, -2, 48, 7), C.stoneDark, .18, 2, 1);
    const black = mixc(C.ink, C.night, .25);
    const f = robeFigure(S, { robe: black, sleeve: black, rw: 38, point: o.pose === 'point' });
    // the white cross of the Order on the breast (eight-pointed, broad-armed)
    const cx = -2, cy = f.sh + 34, a = 13, b = 4;
    const cross = [[cx - b, cy - b], [cx - a * .7, cy - a], [cx + a * .7, cy - a], [cx + b, cy - b], [cx + a, cy - a * .7], [cx + a, cy + a * .7], [cx + b, cy + b],
      [cx + a * .7, cy + a], [cx - a * .7, cy + a], [cx - b, cy + b], [cx - a, cy + a * .7], [cx - a, cy - a * .7]];
    wsh(S, cross, C.paperLight, .92, 3, .5);
    // bare head: grey hair and a short grey beard
    const grey = mixc(C.stone, C.paperLight, .2);
    wsh(S, [[-11, f.hy - 4], [-9, f.hy - 13], [0, f.hy - 16], [9, f.hy - 13], [11, f.hy - 4], [7, f.hy - 9], [-7, f.hy - 9]], grey, .85, 2, .5);
    wsh(S, blobPts(0, f.hy + 9, 8, 6.5, 12, .2), grey, .85, 2, .4);
    return fin(S, sc, { parts: { head: [0, f.hy], hand: f.hand } });
  };
})();
