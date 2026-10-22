// mcB_hold: cut-away of a small ship's cargo hold in parchment ink (BRAND.md §3, §5; boils at 8 Hz via _ink.js; pure
// function of (seed, lt)). Written for the Mary Celeste alcohol theory, parametric. Three shot types:
//
//   mcB_hold — the hull cut open: deck with a hatch, mast stumps and a pump; rows of barrels in the hold.
//     P: {rows: 3, cols: 12, empty: {count: 9, at} (those barrels turn hollow, red outline, drips), fumes: {at, dur: 4}
//         (vapour wisps rise and a haze fills the hold), flame: {at, dur: 1.6} (a cool blue flame front sweeps the hold;
//         the haze is gone behind it, nothing is scorched), water: {level: 0.3 (0..1 of the hold height), at, dur: 3},
//         pump: {apart: true, at} (the deck pump lies in pieces), hatch: "closed"|"open",
//         cast: [...MCB cast] (deck ground y ≈ 0.36, hold floor ≈ 0.84), labels: [...MCB labels], shake: [cue],
//         cam: {zoom: 1.05, focus}}
//     cues: hit, empty.at, fumes.at, flame.at, water.at, pump.at, labels/cast "at"
//
//   mcB_oak — two big barrels side by side: one leaks through its porous staves (pores, drips, a growing puddle, the
//     level in the cut-away window drops), the other stays tight.
//     P: {barrels: [{x: 0.28, leak: true, at}, {x: 0.72, leak: false}], cast, labels, cam}   cues: hit, barrels[].at
//
//   mcB_lab — a lab bench with a long clear model of a hold (little paper barrels inside): gas fills it on `gas`, an
//     igniter sparks on `lit`, a blue flame wave runs through on `wave`, the lid jumps; the paper barrels stay clean.
//     P: {gas: cue, lit: cue, wave: cue (default lit + 0.3), cast, labels, cam}   cues: hit, gas, lit, wave
// Needs mcB__lib.js (window.MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  // barrel standing upright, centre bottom at (x, y), size w × h -> outline points
  const barrelPts = (x, y, w, h) => [[x - w * 0.42, y], [x - w * 0.5, y - h * 0.5], [x - w * 0.42, y - h], [x + w * 0.42, y - h], [x + w * 0.5, y - h * 0.5], [x + w * 0.42, y]];
  function barrel(g, sd, t, x, y, w, h, o = {}) {
    const pts = barrelPts(x, y, w, h);
    o.f.setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 0.8 }));
    let d = inkPath(pts, { w: o.lw ?? 4, seed: sd + 1, t, amp: 0.9, closed: true });
    for (const v of [0.18, 0.5, 0.82]) d += ' ' + inkPath([[x - w * (v === 0.5 ? 0.5 : 0.46), y - h * v], [x + w * (v === 0.5 ? 0.5 : 0.46), y - h * v]], { w: (o.lw ?? 4) * 0.8, seed: sd + 2 + v * 10, t, amp: 0.7 });
    o.r.setAttribute('d', d);
  }
  // flame band: tail at x0, jagged tongues leading at x1 (moving right), between yT and yB
  // flame front: rows of separate tongues (teardrops leaning forward) across [x0, x1] x [yT, yB]; the
  // tongues are tallest at the leading edge x1 and die down towards the tail x0. Returns {fill, line, core}.
  function flame(x0, x1, yT, yB, t, sd) {
    const res = { fill: '', line: '', core: '' };
    if (x1 - x0 < 10) return res;
    const rows = Math.max(1, Math.round((yB - yT) / 110));
    for (let rI = 0; rI < rows; rI++) {
      const y = lerp(yB, yT, (rI + 0.7) / rows);
      for (let x = x1; x > x0; x -= 74) {
        const k = 1 - (x1 - x) / Math.max(1, x1 - x0);           // 1 at the front, 0 at the tail
        const r = rng(inkHash(sd + rI * 31 + Math.round(x / 74), inkFrame(t)));
        const h = (40 + 90 * k) * (0.75 + r() * 0.5), w = 18 + 16 * k, xx = x + (rI % 2 ? 30 : 0);
        const pts = [[xx - w, y], [xx - w * 0.9, y - h * 0.45], [xx - w * 0.1, y - h * 0.8], [xx + w * 1.1, y - h * 1.1 - r() * 14], [xx + w * 0.7, y - h * 0.4], [xx + w, y]];
        const o = { seed: sd + rI * 101 + Math.round(x), t, amp: 2 };
        res.fill += inkLoop(pts, o) + ' ';
        res.line += inkPath(pts, Object.assign({ w: 3.5, closed: true }, o)) + ' ';
        if (k > 0.4) res.core += inkLoop(pts.map(([px, py]) => [xx + (px - xx) * 0.45, y + (py - y) * 0.5]), o) + ' ';
      }
    }
    return res;
  }
  const camShake = (P, cues, lt, atOr) => { let s = 0; (P.shake || []).forEach(c => { const a = atOr(cues, c, null); if (a != null && lt >= a && lt < a + 0.7) s = Math.max(s, 1 - (lt - a) / 0.7); }); return s; };

  SH.mcB_hold = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1, rr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 931;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const DY = 0.36 * H, FL = 0.78 * H, X0 = 0.05 * W, X1 = 0.95 * W;
      const hull = [[X0, DY], [X0 + 20, 0.62 * H], [0.16 * W, FL + 40], [0.5 * W, FL + 62], [0.86 * W, FL + 36], [X1 - 10, 0.6 * H], [X1, DY - 12]];
      const clipId = 'mcbhold' + seed, cp = el(el(svg, 'defs'), 'clipPath', { id: clipId }), cpp = el(cp, 'path', {});
      cpp.setAttribute('d', 'M' + inkSpline(hull, false).map(q => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L') + ' Z');
      const inner = el(cam, 'g', { 'clip-path': `url(#${clipId})` });
      const G = {
        inside: inkEl(inner, INK.paperDark, { 'fill-opacity': 0.55 }), ribs: inkEl(inner, INK.inkSoft),
        haze: inkEl(inner, INK.stain, { 'fill-opacity': 0 }), water: inkEl(inner, INK.blue, { 'fill-opacity': 0.5 }), wline: inkEl(inner, INK.blue),
      };
      const rows = P.rows ?? 3, cols = P.cols ?? 12;
      const BX0 = 0.13 * W, BX1 = 0.87 * W;
      const bw = (BX1 - BX0) / cols * 0.84, bh = Math.min((FL - DY - 70) / rows * 0.9, bw * 1.35);
      const bars = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = BX0 + (c + 0.5) * (BX1 - BX0) / cols + (r % 2 ? bw * 0.1 : 0), y = FL - r * bh * 1.04;
        bars.push({ x, y, f: inkEl(inner, INK.hat), r: inkEl(inner), drip: inkEl(inner, INK.blue) });
      }
      // deterministic set of empty barrels (spread out)
      const nE = P.empty ? Math.min(bars.length, P.empty.count ?? 9) : 0, emptyIdx = new Set();
      { const r = rng(sd + 5); while (emptyIdx.size < nE) emptyIdx.add(Math.floor(r() * bars.length)); }
      const wisps = Array.from({ length: 16 }, () => inkEl(inner, INK.inkSoft, { 'fill-opacity': 0.9 }));
      const fl = { o: inkEl(inner, INK.blue, { 'fill-opacity': 0.6 }), i: inkEl(inner, INK.paperLight, { 'fill-opacity': 0.9 }), r: inkEl(inner, INK.blue) };
      const hullR = inkEl(cam), deck = inkEl(cam, INK.paperDark), deckR = inkEl(cam), masts = inkEl(cam), hatch = inkEl(cam, INK.hat), hatchR = inkEl(cam);
      const pump = { f: inkEl(cam, INK.paperDark), r: inkEl(cam) };
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          G.inside.setAttribute('d', inkLoop(hull, { seed: sd + 1, t, amp: 1 }));
          let rb = '';
          for (let k = 1; k < 10; k++) { const x = lerp(X0, X1, k / 10); rb += inkPath([[x, DY + 10], [x + (x - W / 2) * 0.04, FL + 30 - Math.abs(x - W / 2) * 0.05]], { w: 3, seed: sd + 10 + k, t, amp: 1 }) + ' '; }
          G.ribs.setAttribute('d', rb);
          // water rising
          if (P.water) {
            const lv = (P.water.level ?? 0.3) * progIO(lt, atOr(cues, P.water.at, 0.2), P.water.dur ?? 3), wy = FL + 50 - lv * (FL + 50 - DY);
            if (lv > 0.005) {
              const top = []; for (let x = X0 + 10; x <= X1 - 10; x += 40) top.push([x, wy + Math.sin(x * 0.02 + t * 2.4) * 6]);
              G.water.setAttribute('d', inkLoop(top.concat([[0.86 * W, FL + 36], [0.5 * W, FL + 62], [0.16 * W, FL + 40]]), { seed: sd + 20, t, amp: 1, smooth: false }));
              G.wline.setAttribute('d', inkPath(top, { w: 5, seed: sd + 21, t, amp: 1 }));
            } else { G.water.setAttribute('d', ''); G.wline.setAttribute('d', ''); }
          }
          // barrels
          const ea = P.empty ? atOr(cues, P.empty.at, 0.5) : 1e9;
          bars.forEach((b, i) => {
            const isE = emptyIdx.has(i), on = isE && lt >= ea + [...emptyIdx].indexOf(i) * 0.08;
            const pk = on ? punch(lt, ea + [...emptyIdx].indexOf(i) * 0.08, 0.6) : 0;
            const s = 1 + 0.18 * pk;
            b.f.setAttribute('fill', on ? INK.paperLight : INK.hat);
            barrel(cam, sd + 30 + i * 5, t, b.x, b.y, bw * s, bh * 0.94 * s, { f: b.f, r: b.r, lw: on ? 6 : 3.5 });
            b.r.setAttribute('fill', on ? INK.red : INK.ink);
            if (on) {
              const u = ((lt - ea) * 0.9 + i * 0.37) % 1;
              b.drip.setAttribute('d', inkDot(b.x + bw * 0.2, b.y - bh * 0.3 + u * bh * 0.4, 5, 8, sd + 300 + i, t));
            } else b.drip.setAttribute('d', '');
          });
          // fumes
          let fumeK = 0;
          const fa = P.fumes ? atOr(cues, P.fumes.at, 0.3) : null;
          const flA = P.flame ? atOr(cues, P.flame.at, 1) : null, flD = P.flame ? P.flame.dur ?? 1.6 : 1;
          const front = flA != null ? lerp(X0 - 200, X1 + 400, lin(lt, flA, flD)) : -1e9;
          if (fa != null) fumeK = progIO(lt, fa, P.fumes.dur ?? 4);
          if (P.flame && fa == null) fumeK = 0.9;
          if (fumeK > 0.01) {
            const hz = []; const top = lerp(FL, DY + 20, fumeK);
            for (let x = Math.max(X0, front); x <= X1; x += 60) hz.push([x, top + Math.sin(x * 0.01 + t * 1.5) * 14]);
            G.haze.setAttribute('fill-opacity', (0.5 * fumeK).toFixed(3));
            G.haze.setAttribute('d', hz.length > 1 ? inkLoop(hz.concat([[X1 - 10, FL + 30], [Math.max(X0, front), FL + 40]]), { seed: sd + 40, t, amp: 2, smooth: false }) : '');
          } else G.haze.setAttribute('d', '');
          wisps.forEach((w, i) => {
            if (fumeK < 0.01) { w.setAttribute('d', ''); return; }
            const r = rng(sd + 500 + i), bx = lerp(X0 + 100, X1 - 100, r()), u = ((lt * 0.25 + r()) % 1);
            const y = lerp(FL - 40, DY + 40, u * Math.max(0.3, fumeK)), x = bx + Math.sin(lt * 1.3 + i) * 30;
            if (x < front + 40) { w.setAttribute('d', ''); return; }
            w.setAttribute('d', inkPath([[x, y + 50], [x + 18, y + 25], [x - 6, y], [x + 14, y - 30]], { w: 6, seed: sd + 520 + i, t, amp: 1.5 }));
          });
          if (flA != null && lt >= flA && lt < flA + flD + 0.4) {
            const x1 = Math.min(front, X1 + 300), x0 = Math.max(X0, x1 - 520), F = flame(x0, x1, DY + 40, FL + 10, t, sd + 600);
            fl.o.setAttribute('d', F.fill); fl.i.setAttribute('d', F.core); fl.r.setAttribute('d', F.line);
          } else { fl.o.setAttribute('d', ''); fl.i.setAttribute('d', ''); fl.r.setAttribute('d', ''); }
          // hull outline, deck, masts, hatch
          hullR.setAttribute('d', inkPath(hull, { w: 8, seed: sd + 2, t, amp: 1.3 }) + ' ' + inkPath([[X0 - 20, DY - 50], [X1 + 20, DY - 62]], { w: 5, seed: sd + 3, t, amp: 1.2 }));
          const dp = [[X0 - 20, DY - 14], [X1 + 20, DY - 26], [X1 + 20, DY + 4], [X0 - 20, DY + 14]];
          deck.setAttribute('d', inkLoop(dp, { seed: sd + 4, t, amp: 1, smooth: false })); deckR.setAttribute('d', inkPath(dp, { w: 5, seed: sd + 5, t, amp: 1.2, closed: true, smooth: false }));
          masts.setAttribute('d', inkPath([[0.36 * W, DY - 16], [0.36 * W, -40]], { w: 16, seed: sd + 6, t, amp: 1 }) + ' ' + inkPath([[0.72 * W, DY - 22], [0.72 * W, -40]], { w: 16, seed: sd + 7, t, amp: 1 }));
          const hx = 0.54 * W, open = P.hatch === 'open';
          const hp = open ? [[hx - 90, DY - 20], [hx - 70, DY - 120], [hx + 40, DY - 140], [hx + 20, DY - 30]] : [[hx - 90, DY - 22], [hx + 90, DY - 26], [hx + 90, DY - 64], [hx - 90, DY - 60]];
          hatch.setAttribute('d', inkLoop(hp, { seed: sd + 8, t, amp: 1, smooth: false })); hatchR.setAttribute('d', inkPath(hp, { w: 5, seed: sd + 9, t, amp: 1, closed: true, smooth: false }));
          // pump on deck (intact or in pieces)
          const px = (P.pump && P.pump.x || 0.3) * W;
          if (P.pump) {
            const apart = P.pump.apart !== false && lt >= atOr(cues, P.pump.at, 0), k = apart ? spring(lt, atOr(cues, P.pump.at, 0), 0.7) : 0;
            const parts = apart ? [
              rr(px - 120, DY - 50 - 20 * (1 - k), 140, 34, 14),           // barrel of the pump lying down
              [[px + 50, DY - 30], [px + 140, DY - 70 - 30 * (1 - k)], [px + 150, DY - 60], [px + 60, DY - 20]], // handle
              rr(px - 200, DY - 34, 60, 22, 8), rr(px + 170, DY - 36, 50, 20, 8)] :
              [rr(px - 26, DY - 190, 52, 176, 14), [[px, DY - 180], [px + 110, DY - 230], [px + 116, DY - 220], [px + 6, DY - 168]]];
            pump.f.setAttribute('d', parts.map((q, i) => inkLoop(q, { seed: sd + 60 + i, t, amp: 1, smooth: false })).join(' '));
            pump.r.setAttribute('d', parts.map((q, i) => inkPath(q, { w: 5, seed: sd + 64 + i, t, amp: 1, closed: true, smooth: false })).join(' '));
          }
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit, camShake(P, cues, lt, atOr));
          lb.update(lt, t, cues);
        },
      };
    },
  };

  SH.mcB_oak = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, rr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 377;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const GY = 0.82 * H, bh = 0.5 * H, bw = 0.36 * H;
      const floor = inkEl(cam, INK.inkSoft);
      const B = (P.barrels || [{ x: 0.28, leak: true }, { x: 0.72, leak: false }]).map((b, i) => ({
        b, puddle: inkEl(cam, INK.blue, { 'fill-opacity': 0.4 }), f: inkEl(cam, b.leak ? INK.red : INK.hat), r: inkEl(cam), staves: inkEl(cam, INK.hatBand),
        win: inkEl(cam, INK.paperLight), liq: inkEl(cam, INK.blue, { 'fill-opacity': 0.55 }), winR: inkEl(cam), pores: inkEl(cam, INK.ink), drips: inkEl(cam, INK.blue),
      }));
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          floor.setAttribute('d', inkPath([[-20, GY], [W + 20, GY]], { w: 5, seed: sd + 1, t, amp: 1.2 }) + ' ' + [0, 1, 2, 3, 4, 5].map(k => inkPath([[k * W / 5 - 60, GY + 40], [k * W / 5 + 60, GY + 40]], { w: 3, seed: sd + 2 + k, t, amp: 1 })).join(' '));
          B.forEach((o, i) => {
            const x = o.b.x * W, a = atOr(cues, o.b.at, 0.4), sp = spring(lt, 0.05 + i * 0.15, 0.6);
            const w = bw * sp, h = bh * sp;
            if (sp < 0.02) return;
            barrel(cam, sd + 10 + i * 20, t, x, GY, w, h, { f: o.f, r: o.r, lw: 7 });
            let st = '';
            for (const u of [-0.28, -0.1, 0.1, 0.28]) st += inkPath([[x + w * u * 0.9, GY - 8], [x + w * u * 1.08, GY - h * 0.5], [x + w * u * 0.9, GY - h + 8]], { w: 3, seed: sd + 40 + i * 9 + u * 50, t, amp: 0.8 }) + ' ';
            o.staves.setAttribute('d', st);
            // cut-away window with the liquid level
            const wx = x - w * 0.16, wy = GY - h * 0.76, ww = w * 0.32, wh = h * 0.5;
            const leak = o.b.leak && lt >= a, lv = o.b.leak ? lerp(0.85, 0.15, progIO(lt, a, Math.max(1.5, dur - a - 0.5))) : 0.85;
            const wp = rr(wx, wy, ww, wh, 14);
            o.win.setAttribute('d', inkLoop(wp, { seed: sd + 60 + i, t, amp: 0.8 }));
            const ly = wy + wh * (1 - lv) + Math.sin(t * 2 + i) * 3;
            o.liq.setAttribute('d', inkLoop([[wx + 4, ly], [wx + ww - 4, ly - 2], [wx + ww - 4, wy + wh - 4], [wx + 4, wy + wh - 4]], { seed: sd + 62 + i, t, amp: 0.8, smooth: false }));
            o.winR.setAttribute('d', inkPath(wp, { w: 5, seed: sd + 64 + i, t, amp: 1, closed: true }));
            // pores + drips + puddle
            if (o.b.leak) {
              const r = rng(sd + 70 + i); let pd = '', dd = '';
              const pores = Array.from({ length: 16 }, () => [x + w * (r() * 0.7 - 0.35), GY - h * (0.12 + r() * 0.5)]).filter(([px, py]) => !(px > wx - 6 && px < wx + ww + 6 && py > wy - 6 && py < wy + wh + 6));
              pores.forEach(([px, py], k) => { pd += inkDot(px, py, 6, 4, sd + 80 + k, t) + ' '; });
              if (leak) pores.slice(0, 7).forEach(([px, py], k) => {
                const u = ((lt - a) * 0.8 + k * 0.31) % 1, yy = lerp(py + 8, GY - 4, u * u);
                dd += inkDot(px + Math.sin(k) * 3, yy, 6, 10, sd + 100 + k, t) + ' ';
              });
              o.pores.setAttribute('d', pd); o.drips.setAttribute('d', dd);
              const pk = leak ? clamp01((lt - a) / 4) : 0;
              o.puddle.setAttribute('d', pk > 0.02 ? inkLoop(inkEllipsePts(x, GY + 6, w * (0.4 + 0.5 * pk), 16 + 10 * pk, sd + 120 + i, 12), { seed: sd + 120 + i, t, amp: 1 }) : '');
            }
          });
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  SH.mcB_lab = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, rr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 613;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const BX0 = 0.2 * W, BX1 = 0.74 * W, BT = 0.42 * H, BB = 0.7 * H, TY = BB + 4;
      const bench = { f: inkEl(cam, INK.paperDark), r: inkEl(cam) };
      const shelf = inkEl(cam, INK.inkSoft), jars = Array.from({ length: 5 }, () => ({ f: inkEl(cam, INK.paperLight), r: inkEl(cam, INK.inkSoft) }));
      const boxF = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.55 }), gas = inkEl(cam, INK.stain, { 'fill-opacity': 0 });
      const cubes = Array.from({ length: 12 }, (_, i) => ({ f: inkEl(cam, INK.paperLight), r: inkEl(cam) }));
      const wisps = Array.from({ length: 10 }, () => inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.8 }));
      const clipId = 'mcblab' + seed, cpp = el(el(el(svg, 'defs'), 'clipPath', { id: clipId }), 'rect', { x: BX0 + 4, y: BT + 4, width: BX1 - BX0 - 8, height: BB - BT - 8 });
      const flG = el(cam, 'g', { 'clip-path': `url(#${clipId})` });
      const fl = { o: inkEl(flG, INK.blue, { 'fill-opacity': 0.6 }), i: inkEl(flG, INK.paperLight, { 'fill-opacity': 0.9 }), r: inkEl(flG, INK.blue) };
      const boxR = inkEl(cam), lid = inkEl(cam, INK.paperLight), lidR = inkEl(cam);
      const ign = { s: inkEl(cam), fl: inkEl(cam, INK.gold), sp: inkEl(cam, INK.red) };
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const ga = atOr(cues, P.gas, null), la = atOr(cues, P.lit, null), wa = atOr(cues, P.wave, la != null ? la + 0.3 : null);
          const bp = [[0.06 * W, TY], [0.94 * W, TY], [0.94 * W, TY + 40], [0.06 * W, TY + 40]];
          bench.f.setAttribute('d', inkLoop(bp, { seed: sd + 1, t, amp: 1, smooth: false }));
          bench.r.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 2, t, amp: 1.2, closed: true, smooth: false }) + ' ' + inkPath([[0.1 * W, TY + 40], [0.1 * W, H + 20]], { w: 9, seed: sd + 3, t, amp: 1 }) + ' ' + inkPath([[0.9 * W, TY + 40], [0.9 * W, H + 20]], { w: 9, seed: sd + 4, t, amp: 1 }));
          shelf.setAttribute('d', inkPath([[0.5 * W, 0.24 * H], [0.92 * W, 0.24 * H]], { w: 5, seed: sd + 5, t, amp: 1 }));
          jars.forEach((j, k) => { const x = 0.53 * W + k * 0.08 * W, hgt = 70 + (k % 3) * 24; const q = rr(x, 0.24 * H - hgt, 60, hgt, 12);
            j.f.setAttribute('d', inkLoop(q, { seed: sd + 10 + k, t, amp: 0.8 })); j.r.setAttribute('d', inkPath(q, { w: 3.5, seed: sd + 15 + k, t, amp: 0.8, closed: true })); });
          const box = [[BX0, BT], [BX1, BT], [BX1, BB], [BX0, BB]];
          boxF.setAttribute('d', inkLoop(box, { seed: sd + 20, t, amp: 1, smooth: false }));
          const WD = P.wave_dur ?? 2.4, gk = ga != null ? progIO(lt, ga, 2.5) : 0, front = wa != null ? lerp(BX0 - 100, BX1 + 300, lin(lt, wa, WD)) : -1e9;
          gas.setAttribute('fill-opacity', (0.6 * gk).toFixed(3));
          gas.setAttribute('d', gk > 0.01 && front < BX1 ? inkLoop([[Math.max(BX0 + 6, front), BB - 6], [Math.max(BX0 + 6, front), lerp(BB, BT + 10, gk)], [BX1 - 6, lerp(BB, BT + 10, gk)], [BX1 - 6, BB - 6]], { seed: sd + 21, t, amp: 2, smooth: false }) : '');
          cubes.forEach((c, i) => { const col = i % 6, row = Math.floor(i / 6), s = 54, x = lerp(BX0 + 50, BX1 - 110, col / 5), y = BB - 10 - s - row * (s + 8);
            const q = [[x, y], [x + s, y], [x + s, y + s], [x, y + s]];
            c.f.setAttribute('d', inkLoop(q, { seed: sd + 30 + i, t, amp: 0.8, smooth: false })); c.r.setAttribute('d', inkPath(q, { w: 3.5, seed: sd + 50 + i, t, amp: 0.8, closed: true, smooth: false })); });
          wisps.forEach((w, i) => { if (gk < 0.02) { w.setAttribute('d', ''); return; }
            const r = rng(sd + 70 + i), x = lerp(BX0 + 40, BX1 - 40, r()) + Math.sin(lt * 1.2 + i) * 20, u = (lt * 0.3 + r()) % 1, y = lerp(BB - 20, BT + 40, u * gk);
            if (x < front + 30) { w.setAttribute('d', ''); return; }
            w.setAttribute('d', inkPath([[x, y + 40], [x + 14, y + 20], [x - 6, y], [x + 10, y - 22]], { w: 3.5, seed: sd + 90 + i, t, amp: 1.4 })); });
          if (wa != null && lt >= wa && lt < wa + WD + 0.3) {
            const x1 = Math.min(front, BX1 - 4), x0 = Math.max(BX0 + 4, x1 - 420);
            const F = front < BX1 + 280 ? flame(x0, x1, BT + 30, BB - 6, t, sd + 600) : { fill: '', line: '', core: '' };
            fl.o.setAttribute('d', F.fill); fl.i.setAttribute('d', F.core); fl.r.setAttribute('d', F.line);
          } else { fl.o.setAttribute('d', ''); fl.i.setAttribute('d', ''); fl.r.setAttribute('d', ''); }
          boxR.setAttribute('d', inkPath(box, { w: 6, seed: sd + 22, t, amp: 1.2, closed: true, smooth: false }));
          const jump = wa != null && lt >= wa + WD * 0.75 ? Math.max(0, Math.sin(Math.min(Math.PI, (lt - wa - WD * 0.75) * 5))) * 50 : 0;
          const lp = [[BX0 - 20, BT - 24 - jump], [BX1 + 20, BT - 24 - jump * 1.2], [BX1 + 20, BT - jump * 1.2], [BX0 - 20, BT - jump]];
          lid.setAttribute('d', inkLoop(lp, { seed: sd + 23, t, amp: 1, smooth: false })); lidR.setAttribute('d', inkPath(lp, { w: 5, seed: sd + 24, t, amp: 1, closed: true, smooth: false }));
          // igniter at the left end
          if (la != null && lt >= la - 0.6) {
            const k = spring(lt, la - 0.6, 0.5), ix = BX0 - 30, iy = BB - 70;
            ign.s.setAttribute('d', inkPath([[ix - 160 * k, iy + 40], [ix, iy]], { w: 9, seed: sd + 25, t, amp: 1 }));
            ign.fl.setAttribute('d', lt >= la ? inkLoop([[ix - 6, iy + 4], [ix + 8, iy - 34 - Math.sin(t * 20) * 6], [ix + 16, iy + 2]], { seed: sd + 26, t, amp: 1.5 }) : '');
            ign.sp.setAttribute('d', lt >= la && lt < la + 0.5 ? [0, 1, 2, 3, 4].map(j => { const a = j * 1.25, r = 20 + (lt - la) * 120; return inkDot(ix + 10 + Math.cos(a) * r, iy - 10 + Math.sin(a) * r, 5, 5, sd + 27 + j, t); }).join(' ') : '');
          } else { ign.s.setAttribute('d', ''); ign.fl.setAttribute('d', ''); ign.sp.setAttribute('d', ''); }
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
