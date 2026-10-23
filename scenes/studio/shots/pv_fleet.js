// pv_fleet: 16th-century galley warfare in parchment ink (Preveze 1538; theme "parchment", brand/kit/BRAND.md §3, §5).
// Every line boils at 8 Hz through _ink.js; everything is a pure function of (seed, lt), no Math.random. Three 2D shots:
//
// SHOTS.pv_sea — side view of the sea: horizon, far shore with a small stone fort, wave hatching, galleys (kadırga:
//   long low hull, stern kiosk, a row of sweeping oars, lateen sail set or furled, pennant) and tall sailing ships
//   (yelkenli: high stern castle, three masts, square sails that billow in the wind and go slack when it drops,
//   gunports, stern lantern). Wind streaks in the sky; cannon smoke puffs with gold flashes; a ship can catch fire,
//   turn away and scatter, stop at a sandbar (cross-section: water body, seabed, sandbar, dashed keel), or put its
//   lantern out at night. Kaşif / cast stand on a foreground rock ledge.
//   P: {horizon: 0.4, night: false | cue (dusk falls), moon: true, shore: {side: "left"|"right", w: 0.4, fort: true} | false,
//       wind: {s: 1 (0..1), dir: 1 (blows to +x), drop: cue (dies out), dur: 1.4, lines: 7, label: {text, x, y, at}},
//       ships: [{kind: "galley"|"sail", side: "tr"|"hl" (red / blue pennants), x: 0.5, y: 0.62 (waterline), scale: 1,
//                face: 1|-1, to (x at the end), at, dur (move window; default the whole scene), row: true (galley oars),
//                sail: "set"|"furled" (galley), scatter: cue (turns away, recedes), scatter_dir: 1, fire: cue,
//                lantern: true, dark: cue (lantern out), stop: cue (jolts to a halt), draft: true (dashed keel),
//                depth: 0 (0..1: smaller, higher, paler)}],
//       guns: [{x, y, at, n: 3, gap: 0.35, dx: 60, r: 1 (puff size)}] (smoke puffs + flashes), section: {surface: 0.6, bed: 0.9,
//       bar: {x: 0.5, w: 0.34, h: 0.12}, at} (cross-section mode), ledge: {side: "right", y: 0.7, w: 0.42} | false,
//       labels: [{text, x, y, at, size: 64, color: "ink"|"red"|"blue", rot: -3, arrow: [x, y], x_mark: cue}],
//       cast: [{who: "kasif"|name, accessory, beard: "black"|"grey"|"short"|"red", x, y, scale, pose, at, then, dir,
//               face, emotion, seq: [{at, pose, dir, face, emotion}]}], shake: cue, zoom: 1.06, focus: [0.5, 0.5]}
//   cues: anything named above (ship at/scatter/fire/dark/stop, wind.drop, guns[].at, labels[].at, cast at/seq, shake).
//
// SHOTS.pv_gulf — bird's-eye map sheet of a narrow strait into a gulf (Preveze / Arta): open sea on the left, the
//   narrow mouth with a stippled sandbar and a fort, the wide gulf on the right; fleets as top-view icons (galleys with
//   oar ticks, sailing ships with yard bars; red = Ottoman, blue = Holy League) in grid / line / crescent formations
//   that move along cue-bound key frames and leave wakes; dashed route arrows; hand-written labels.
//   P: {fleets: [{side: "tr"|"hl", kind: "galley"|"sail"|"mix", n: 12, x, y (0..1 sheet), form: "grid"|"line"|"crescent",
//         spread: 1, heading: 0 (deg, 0 = east/right, 90 = south/down), appear: cue (staggered pop-in),
//         moves: [{at, x, y, dur: 1.6, form, heading}]}],
//       bar: {at, label: "sığ"} | true, fort: true, arrows: [{pts: [[u, v]...], at, dur: 1.2, color: "red"}],
//       labels: [{text, u, v, at, size: 52, color, rot}] (default: İyon Denizi / Preveze / Arta Körfezi),
//       kasif: {x: 0.84, y: 0.86 (frame 0..1), scale: 0.42, pose, at, then, dir, face, emotion, seq},
//       zoom: 1.08, focus: [0.5, 0.5] (sheet)}
//   cues: fleets appear / moves[].at, bar.at, arrows[].at, labels[].at, kasif at/seq.
//
// SHOTS.pv_deck — eye level on the poop deck of a galley: sea and far ships behind a rail, deck planks, a cropped
//   lateen sail and yard, a stern pole with a long pennant that streams in the wind (or hangs when it drops), wind
//   streaks, an optional stern lantern; the cast stands on the deck (period figures, red-bearded Barbaros, Kaşif).
//   P: {horizon: 0.46, deck: 0.74, side: "tr"|"hl" (pennant colour), wind: {s: 1, dir: 1, drop: cue, at: cue (gust)},
//       far: [{kind, side, x, scale: 0.3}], sail: true, lantern: {x: 0.9, dark: cue} | false, night: false,
//       labels: [...as pv_sea], cast: [...as pv_sea], zoom: 1.06, focus: [0.5, 0.6], shake: cue}
// Made for Preveze 1538; parametric for any galley-age sea battle (İnebahtı, Cerbe, Rodos...).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, soft: INK.inkSoft };
  const SIDE = { tr: INK.red, hl: INK.blue };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : 1);
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const circ = (cx, cy, r, n = 12) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  // ---------------------------------------------------------------- layered path buffer (one <path> per colour)
  // order: light (sails, kiosk), dark (hulls), red, blue, gold, soft, ink
  const LAYERS = ['light', 'dark', 'red', 'blue', 'gold', 'soft', 'ink'];
  const LCOL = { light: INK.paperLight, dark: INK.paperDark, red: INK.red, blue: INK.blue, gold: INK.gold, soft: INK.inkSoft, ink: INK.ink };
  function layerSet(parent, extra = {}) {
    const g = el(parent, 'g'), E = {}, B = {};
    LAYERS.forEach(k => { E[k] = mk(g, LCOL[k], extra[k] || {}); B[k] = ''; });
    return {
      g, add(k, d) { B[k] += d + ' '; },
      flush() { LAYERS.forEach(k => { E[k].setAttribute('d', B[k]); B[k] = ''; }); },
    };
  }

  // ---------------------------------------------------------------- cast (Kaşif + period figures)
  function makeCast(parent, list, seed, defScale) {
    return (list || []).map((c, i) => {
      const isK = (c.who || 'kasif') === 'kasif';
      const red = !isK && c.beard === 'red';
      const rig = KASIF.create(el(parent, 'g'), { scale: c.scale ?? defScale, hat: isK, accessory: isK ? null : (c.accessory || null),
        beard: isK ? null : (red ? 'black' : (c.beard || null)), seed: seed + i * 7 + 3 });
      if (red) {   // Barbaros: red beard. The rig draws head fill (paper-light), head ring, then the beard fill.
        const kids = Array.from(rig.node.children);
        const hi = kids.findIndex(k => k.getAttribute('fill') === INK.paperLight);
        if (hi >= 0 && kids[hi + 2]) kids[hi + 2].setAttribute('fill', INK.red);
      }
      return { c, rig };
    });
  }
  function updateCast(cast, lt, t, cues, W, H) {
    cast.forEach(({ c, rig }) => {
      const ev = [];
      if (c.then && c.at != null) ev.push({ at: atOr(cues, c.at, null), pose: c.then, dir: c.dir, face: c.face2, emotion: c.emotion });
      (c.seq || []).forEach(s => ev.push(Object.assign({}, s, { at: atOr(cues, s.at, null) })));
      const live = ev.filter(e => e.at != null && lt >= e.at).sort((a, b) => a.at - b.at);
      const cur = live.length ? live[live.length - 1] : null, prev = live.length > 1 ? live[live.length - 2] : null;
      const basePose = c.pose || 'idle';
      const pose = cur ? cur.pose || basePose : basePose;
      const since = cur ? lt - cur.at : lt;
      const dir = dirOf(cur && cur.dir != null ? cur.dir : c.dir);
      let emo = cur ? (cur.emotion || (pose === 'shock' ? 'surprised' : c.emotion0 || null)) : (c.emotion0 || null);
      const face = faceOf(cur && cur.face != null ? cur.face : c.face);
      const o = { x: (c.x ?? 0.8) * W, y: (c.y ?? 0.7) * H, face, since, dir, emotion: emo };
      if (cur && since < 0.32) {
        o.prev = { pose: prev ? prev.pose || basePose : basePose, since: prev ? cur.at - prev.at : cur.at, dir: dirOf(prev && prev.dir != null ? prev.dir : c.dir) };
        o.mix = since / 0.32;
      }
      rig.update(t, pose, o);
    });
  }

  // ---------------------------------------------------------------- labels (Patrick Hand, paper halo)
  function makeLabels(parent, list, portrait) {
    return (list || []).map(Lb => {
      const g = el(parent, 'g'), size = Lb.size || (portrait ? 64 : 54), col = COL[Lb.color] || INK.ink;
      const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: col,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: ${Math.round(size * 0.2)}px; stroke-linejoin: round` });
      tx.textContent = Lb.text || '';
      return { Lb, g, tx, line: mk(g, col), xm: mk(g, INK.red), col };
    });
  }
  function updateLabels(labels, lt, t, cues, dur, X, Y, sd) {
    labels.forEach((L, i) => {
      const Lb = L.Lb, at = atOr(cues, Lb.at, Math.min(dur * 0.5, 0.4 + i * 0.5)), p = spring(lt, at, 0.6), pk = punch(lt, at, 0.5);
      if (lt < at) { L.g.style.display = 'none'; return; }
      L.g.style.display = '';
      const x = X(Lb.x ?? Lb.u ?? 0.5), y = Y(Lb.y ?? Lb.v ?? 0.2);
      L.tx.setAttribute('x', f1(x)); L.tx.setAttribute('y', f1(y));
      let d = '';
      if (Lb.arrow) {
        const ax = X(Lb.arrow[0]), ay = Y(Lb.arrow[1]), sy = y + 16, pr = prog(lt, at + 0.15, 0.4);
        const ex = lerp(x, ax, pr), ey = lerp(sy, ay, pr), mx = (x + ex) / 2 + (ey - sy) * 0.15, my = (sy + ey) / 2 - (ex - x) * 0.15;
        if (pr > 0.02) {
          d += inkPath([[x, sy], [mx, my], [ex, ey]], { w: 6, seed: sd + 300 + i, t, amp: 1.2 }) + ' ';
          const a = Math.atan2(ey - my, ex - mx);
          [0.5, -0.5].forEach((o, k) => d += inkPath([[ex, ey], [ex - Math.cos(a + o) * 34, ey - Math.sin(a + o) * 34]], { w: 6, seed: sd + 310 + i * 3 + k, t, amp: 0.8, taper: 0.1 }) + ' ');
        }
      }
      L.line.setAttribute('d', d);
      if (Lb.x_mark != null) {
        const xa = atOr(cues, Lb.x_mark, null);
        if (xa != null && lt >= xa) {
          const tw = L.tx.getComputedTextLength ? L.tx.getComputedTextLength() : 200, s = (Lb.size || 64) * 0.7;
          const p1 = prog(lt, xa, 0.2), p2 = prog(lt, xa + 0.15, 0.2);
          const a0 = [x - tw * 0.55, y - s], a1 = [x + tw * 0.55, y + s * 0.4], b0 = [x + tw * 0.55, y - s], b1 = [x - tw * 0.55, y + s * 0.4];
          let xd = '';
          if (p1 > 0.02) xd += inkPath([a0, [lerp(a0[0], a1[0], p1), lerp(a0[1], a1[1], p1)]], { w: 10, seed: sd + 340 + i, t, amp: 1 }) + ' ';
          if (p2 > 0.02) xd += inkPath([b0, [lerp(b0[0], b1[0], p2), lerp(b0[1], b1[1], p2)]], { w: 10, seed: sd + 350 + i, t, amp: 1 });
          L.xm.setAttribute('d', xd);
        } else L.xm.setAttribute('d', '');
      }
      L.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${Lb.rot ?? -3}) scale(${(lerp(0.55, 1, p) * (1 + 0.08 * pk)).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
    });
  }

  // ---------------------------------------------------------------- side-view ships
  // local units: 1 = half hull length, waterline y = 0, bow toward +x. Returns strokes {p, k (fill layer), w (outline), c, sm}
  function sailShape(xl, xr, yt, yb, w, dir, ripple) {
    // square sail seen broadside: billowed (w = 1) .. slack (w = 0)
    const cx = (xl + xr) / 2, ym = (yt + yb) / 2, bw = w, sl = 1 - w;
    return [[xl, yt], [xr, yt],
      [xr + 0.05 * bw + dir * 0.05 * bw - 0.04 * sl, ym],
      [xr + 0.02 * bw - 0.07 * sl, yb + 0.03 * sl],
      [cx + dir * 0.07 * bw, yb + 0.07 * bw - 0.05 * sl + ripple],
      [xl - 0.02 * bw + 0.07 * sl, yb + 0.03 * sl],
      [xl - 0.05 * bw + dir * 0.05 * bw + 0.04 * sl, ym]];
  }
  function pennant(x0, y0, len, w, dir, t, ph) {
    // streams to dir * len when w = 1, hangs down when w = 0
    const fl = Math.sin(t * 9 + ph) * 0.03 * (0.3 + w), hx = 0.04, hy = len * 0.75;
    const tip = [x0 + lerp(hx, dir * len, w), y0 + lerp(hy, 0.03, w) + fl];
    const mid = [x0 + lerp(hx * 0.6, dir * len * 0.5, w), y0 + lerp(hy * 0.45, 0.0, w) - fl];
    return [[x0, y0 - 0.05], mid, tip, [mid[0] + lerp(-0.02, 0, w), mid[1] + lerp(0.02, 0.05, w)], [x0, y0 + 0.05]];
  }
  function galleyStrokes(o, t, wind, wdir, ph) {
    const S = [], col = o.side === 'hl' ? 'blue' : 'red';
    // sail first (behind the hull)
    if (o.sail === 'set') {
      const b = 0.12 * wind * wdir;
      S.push({ p: [[0.8, -0.42], [0.1, -0.8], [-0.55, -1.15], [-0.5 - b, -0.7], [-0.42 - b * 0.5, -0.32], [0.2, -0.36 + 0.06 * wind]], k: 'light', w: 4 });
      S.push({ p: [[0.92, -0.38], [-0.66, -1.2]], w: 5 });
    } else {
      S.push({ p: [[0.92, -0.38], [-0.66, -1.2]], w: 7 });
      for (let i = 0; i < 5; i++) { const u = 0.15 + i * 0.17, x = lerp(0.92, -0.66, u), y = lerp(-0.38, -1.2, u); S.push({ p: [[x - 0.03, y + 0.02], [x, y + 0.07], [x + 0.03, y + 0.03]], w: 4 }); }
    }
    S.push({ p: [[0.12, -0.14], [0.12, -0.98]], w: 6 });
    // hull
    S.push({ p: [[-1.0, -0.22], [-0.9, -0.05], [-0.6, 0.02], [0.6, 0.02], [0.9, -0.04], [1.24, -0.06], [0.96, -0.1], [0.92, -0.15], [-0.82, -0.15]], k: 'dark', w: 6, c: 1 });
    S.push({ p: [[-0.86, -0.09], [0.9, -0.09]], w: 3, col: 'soft' });
    // stern kiosk + awning
    S.push({ p: [[-0.98, -0.18], [-0.98, -0.36], [-0.66, -0.36], [-0.66, -0.15]], k: 'light', w: 4, c: 1, sm: 0 });
    S.push({ p: [[-1.03, -0.35], [-0.82, -0.45], [-0.6, -0.35]], w: 5 });
    // oars
    if (o.row !== false) {
      for (let i = 0; i < 10; i++) {
        const x = -0.62 + i * 0.15, sw = Math.sin(ph), lift = Math.max(0, Math.cos(ph)) * 0.07;
        S.push({ p: [[x, -0.1], [x - 0.12 + sw * 0.14, 0.18 - lift]], w: 3.2 });
      }
    }
    // stern pole + pennant, mast-top pennant
    S.push({ p: [[-1.0, -0.22], [-1.05, -0.66]], w: 4 });
    S.push({ p: pennant(-1.05, -0.62, 0.42, wind, wdir, t, ph * 0.3), k: col, w: 3, c: 1 });
    S.push({ p: pennant(0.12, -0.96, 0.3, wind, wdir, t, ph * 0.3 + 2), k: col, w: 3, c: 1 });
    return S;
  }
  function shipStrokes(o, t, wind, wdir, ph) {
    const S = [], col = o.side === 'tr' ? 'red' : 'blue';
    const rip = k => (1 - wind) * Math.sin(t * 3 + k) * 0.02;
    // masts + sails (behind hull)
    [[0.5, -1.55, [[-0.5, -0.95, 0.3], [-1.0, -1.38, 0.23]]], [-0.02, -1.85, [[-0.48, -1.05, 0.36], [-1.1, -1.6, 0.27]]]].forEach(([mx, top, sails], m) => {
      S.push({ p: [[mx, -0.3], [mx, top]], w: 6 });
      sails.forEach(([yb, yt, hw], q) => {
        S.push({ p: [[mx - hw - 0.04, yt], [mx + hw + 0.04, yt]], w: 4 });
        S.push({ p: sailShape(mx - hw, mx + hw, yt, yb, wind, wdir, rip(m * 2 + q)), k: 'light', w: 4, c: 1 });
        if (wind < 0.6) S.push({ p: [[mx - hw * 0.35, yt + 0.05], [mx - hw * 0.3, yb - 0.02]], w: 2.5, col: 'soft' }, { p: [[mx + hw * 0.3, yt + 0.05], [mx + hw * 0.35, yb - 0.02]], w: 2.5, col: 'soft' });
      });
      S.push({ p: pennant(mx, top, 0.34, wind, wdir, t, m * 1.7 + ph), k: col, w: 3, c: 1 });
    });
    // mizzen lateen
    S.push({ p: [[-0.55, -0.45], [-0.55, -1.32]], w: 5 });
    S.push({ p: [[-0.35, -0.62], [-0.8, -1.3], [-0.78 - 0.08 * wind * wdir, -0.66]], k: 'light', w: 4, c: 1 });
    // bowsprit
    S.push({ p: [[0.88, -0.36], [1.36, -0.62]], w: 5 });
    // hull with high stern castle
    S.push({ p: [[-1.0, -0.64], [-0.98, -0.3], [-0.85, -0.05], [-0.55, 0.06], [0.55, 0.06], [0.85, -0.08], [1.0, -0.3], [0.94, -0.44], [0.62, -0.37], [0.58, -0.3], [-0.56, -0.3], [-0.62, -0.52], [-0.8, -0.58]], k: 'dark', w: 6, c: 1, sm: 0 });
    S.push({ p: [[-0.9, -0.2], [0.9, -0.2]], w: 3, col: 'soft' });
    for (let i = 0; i < 6; i++) { const x = -0.48 + i * 0.19; S.push({ p: [[x, -0.12], [x + 0.06, -0.12], [x + 0.06, -0.07], [x, -0.07]], k: 'ink', w: 0, c: 1, sm: 0 }); }
    S.push({ p: [[-0.9, -0.48], [-0.7, -0.48]], w: 3, col: 'soft' });
    return S;
  }
  // transform + emit strokes into a layer set
  function emit(LS, S, X, Y, L, face, roll, seed, t, pale) {
    const c = Math.cos(roll), s = Math.sin(roll);
    const tp = q => { const x = q[0] * face, y = q[1]; return [X + (x * c - y * s) * L, Y + (x * s + y * c) * L]; };
    S.forEach((st, i) => {
      const pts = st.p.map(tp), sd = seed + i * 13;
      const smooth = st.sm !== 0;
      if (st.k) LS.add(pale && st.k !== 'light' && st.k !== 'dark' ? 'soft' : st.k, inkLoop(pts, { seed: sd, t, amp: 1.2, smooth }));
      if (st.w) LS.add(pale ? 'soft' : (st.col || 'ink'), inkPath(pts, { w: st.w * Math.max(0.55, Math.min(1.2, L / 180)), seed: sd + 5, t, closed: !!st.c, amp: 1.2, smooth }));
    });
  }
  function puff(LS, x, y, r, seed, t, dark) {
    // small cloud: three overlapping round lobes (paper-light with a soft rim, or dark smoke)
    [[-0.55, 0.15, 0.62], [0.5, 0.18, 0.66], [0, -0.22, 0.8]].forEach(([dx, dy, k], i) => {
      const pts = inkEllipsePts(x + dx * r, y + dy * r, r * k, r * k * 0.86, seed + i * 5, 10, 0, 0.06);
      LS.add(dark ? 'soft' : 'light', inkLoop(pts, { seed: seed + i, t, amp: 1 }));
      if (!dark) LS.add('soft', inkPath(pts, { w: 3.5, seed: seed + i + 3, t, closed: true, amp: 1 }));
    });
  }
  // wavy ink flame tongues (outer red, inner gold), flickering
  function tongue(fx, y0, w, h, t, ph) {
    const L = [], R = [];
    for (let s = 0; s <= 6; s++) {
      const u = s / 6, wid = w * Math.pow(1 - u, 0.75), sw = Math.sin(t * 9 + ph + u * 4) * w * 0.35 * u;
      L.push([fx - wid + sw, y0 - h * u]); R.push([fx + wid + sw, y0 - h * u]);
    }
    const tip = [fx + Math.sin(t * 7 + ph) * w * 0.7, y0 - h * 1.12];
    return L.slice(0, -1).concat([tip]).concat(R.slice(0, -1).reverse());
  }
  function flames(LS, x, y, L, seed, t, k) {
    for (let i = 0; i < 5; i++) {
      const fx = x + (i - 2) * L * 0.13, h = L * (0.3 + 0.12 * Math.sin(t * 6 + i * 2.1) + (i === 2 ? 0.14 : 0)) * k, w = L * 0.11;
      const outer = tongue(fx, y, w, h, t, i * 1.7), inner = tongue(fx, y, w * 0.5, h * 0.55, t * 1.2, i * 1.7 + 1);
      LS.add('red', inkLoop(outer, { seed: seed + i, t, amp: 1.2 }));
      LS.add('ink', inkPath(outer, { w: 3.5, seed: seed + i + 9, t, amp: 1.2, closed: true }));
      LS.add('gold', inkLoop(inner, { seed: seed + i + 20, t, amp: 1 }));
    }
  }

  // ---------------------------------------------------------------- pv_sea
  SH.pv_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 31;
      const HZ = (P.horizon ?? (portrait ? 0.4 : 0.42)) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const nightOn = P.night != null && P.night !== false;
      const sky = layerSet(cam, { soft: { 'fill-opacity': 0.32 } });
      const shoreL = layerSet(cam);
      const waterF = mk(cam, INK.paperDark, { 'fill-opacity': 0.38 });
      const sec = P.section ? layerSet(cam, { light: { 'fill-opacity': 0.9 }, dark: { 'fill-opacity': 0.5 }, gold: { 'fill-opacity': 0.3 } }) : null;
      const shipsP = (P.ships || []).map((s, i) => Object.assign({ i }, s)).sort((a, b) => (b.depth || 0) - (a.depth || 0) || (a.y ?? 0.62) - (b.y ?? 0.62));
      const ships = shipsP.map(s => ({ s, LS: layerSet(cam, s.depth ? { dark: { 'fill-opacity': 0.8 } } : {}), wave: mk(cam, INK.ink), fx: layerSet(cam, { soft: { 'fill-opacity': 0.5 } }) }));
      const smoke = layerSet(cam);
      const front = mk(cam, INK.inkSoft);
      const ledgeL = P.ledge === false ? null : layerSet(cam);
      const castG = el(cam, 'g');
      const cast = makeCast(castG, P.cast, seed, portrait ? 0.5 : 0.42);
      const labG = el(root, 'g');
      const labels = makeLabels(labG, P.labels, portrait);
      const wind = Object.assign({ s: 1, dir: 1, dur: 1.4, lines: 7 }, P.wind || { s: 0.7 });
      const windLab = wind.label ? makeLabels(labG, [Object.assign({ size: portrait ? 70 : 58, rot: -4 }, wind.label)], portrait) : [];
      const LG = P.ledge || {}, lSide = LG.side || 'right', lY = (LG.y ?? 0.7) * H, lW = (LG.w ?? 0.42) * W;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // camera
          const z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur)));
          const fo = P.focus || [0.5, 0.5], fx = fo[0] * W, fy = fo[1] * H;
          const shA = atOr(cues, P.shake, null), shk = shA != null ? punch(lt, shA, 0.7) : 0;
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6 + Math.sin(t * 47) * 14 * shk)} ${f1(Math.cos(t * 0.23) * 5 + Math.cos(t * 41) * 10 * shk)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // wind strength
          const dropA = atOr(cues, wind.drop, null);
          const w = wind.s * (dropA != null ? 1 - progIO(lt, dropA, wind.dur) : 1), wdir = wind.dir;
          // night amount
          const nA = P.night === true ? -1 : atOr(cues, P.night, null), night = nightOn ? (nA == null ? 1 : prog(lt, nA, 1.2)) : 0;

          // ---- sky: night hatch + moon + stars, wind streaks
          if (night > 0) {
            const top = -40, bot = HZ;
            sky.add('soft', inkLoop([[-60, top], [W + 60, top], [W + 60, lerp(top, bot, night)], [-60, lerp(top, bot, night)]], { seed: sd + 1, t, amp: 2, smooth: false }));
            for (let i = 0; i < 14; i++) { const x = (i * 97 + 40) % W, y = 300 + (i * 53) % Math.max(60, HZ - 360); if (y < lerp(top, bot, night) - 20) sky.add('light', inkDot(x, y, 4.5, 4.5, sd + 20 + i, t, 0.6)); }
            if (P.moon !== false) {
              const mx = W * 0.78, my = Math.max(340, HZ * 0.62);
              sky.add('light', inkCircle(mx, my, 46, sd + 40, t, { fill: true }));
              sky.add('soft', inkCircle(mx + 20, my - 8, 40, sd + 41, t, { fill: true }));
            }
          }
          if (w > 0.03) {
            for (let i = 0; i < wind.lines; i++) {
              const y0 = 300 + (i * 71) % Math.max(80, HZ - 330), sp = 260 + (i % 3) * 70, len = 220 + (i % 4) * 50;
              const x0 = ((((t * sp + i * 337) % (W + len + 200)) + W + len + 200) % (W + len + 200)) - len - 100;
              const xs = wdir > 0 ? x0 : W - x0;
              const pts = Array.from({ length: 6 }, (_, k) => [xs + wdir * k * len / 5 * w, y0 + Math.sin(k * 1.3 + t * 3 + i) * 10]);
              if (i % 3 === 0) pts.push([pts[5][0] + wdir * 30 * w, pts[5][1] - 34], [pts[5][0] - wdir * 6, pts[5][1] - 40]);
              sky.add('soft', inkPath(pts, { w: 4 * (0.4 + 0.6 * w), seed: sd + 60 + i, t, amp: 1.5 }));
            }
          }
          sky.flush();

          // ---- far shore + fort
          if (P.shore !== false) {
            const SHp = Object.assign({ side: 'left', w: 0.42, fort: true }, P.shore || {}), left = SHp.side !== 'right';
            const x0 = left ? -60 : W - SHp.w * W, x1 = left ? SHp.w * W : W + 60;
            const pts = [[x0, HZ + 4]];
            for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(x0, x1, u); const edge = left ? u : 1 - u; pts.push([x, HZ - 70 * (1 - sm(edge)) * (0.8 + 0.2 * Math.sin(i * 1.9)) - 8]); }
            pts.push([x1, HZ + 4]);
            shoreL.add('dark', inkLoop(pts, { seed: sd + 80, t, amp: 1.4 }));
            shoreL.add('soft', inkPath(pts.slice(1, -1), { w: 4, seed: sd + 81, t, amp: 1.4 }));
            if (SHp.fort) {
              const fx0 = left ? W * SHp.w * 0.42 : W - W * SHp.w * 0.42, fyb = HZ - 56, fw = 92, fh = 70;
              const body = [[fx0 - fw / 2, fyb], [fx0 - fw / 2, fyb - fh], [fx0 - fw / 4, fyb - fh], [fx0 - fw / 4, fyb - fh - 14], [fx0, fyb - fh - 14], [fx0, fyb - fh], [fx0 + fw / 4, fyb - fh], [fx0 + fw / 4, fyb - fh - 14], [fx0 + fw / 2, fyb - fh - 14], [fx0 + fw / 2, fyb]];
              shoreL.add('light', inkLoop(body, { seed: sd + 82, t, amp: 1, smooth: false }));
              shoreL.add('ink', inkPath(body, { w: 4, seed: sd + 83, t, amp: 1, smooth: false, closed: true }));
              shoreL.add('ink', inkPath([[fx0, fyb - fh - 14], [fx0, fyb - fh - 66]], { w: 3.5, seed: sd + 84, t, amp: 0.8 }));
              shoreL.add('red', inkLoop([[fx0, fyb - fh - 66], [fx0 + 40, fyb - fh - 58 + Math.sin(t * 6) * 3], [fx0, fyb - fh - 48]], { seed: sd + 85, t, amp: 0.8 }));
            }
          }
          shoreL.flush();

          // ---- water body + horizon
          const wv = []; for (let i = 0; i <= 20; i++) { const x = -80 + i * (W + 160) / 20; wv.push([x, HZ + Math.sin(i * 1.1 + t * 1.4) * 3]); }
          waterF.setAttribute('d', inkLoop(wv.concat([[W + 80, H + 80], [-80, H + 80]]), { seed: sd + 90, t, amp: 1.2 }));

          // ---- cross-section (sandbar)
          if (sec) {
            const S2 = P.section, sa = atOr(cues, S2.at, 0), ps = prog(lt, sa, 0.8);
            const sy = (S2.surface ?? 0.6) * H, by = (S2.bed ?? 0.9) * H, B2 = S2.bar || {};
            const bx = (B2.x ?? 0.5) * W, bw = (B2.w ?? 0.34) * W, bh = (B2.h ?? 0.12) * H * ps;
            const bed = [];
            for (let i = 0; i <= 24; i++) { const x = -80 + i * (W + 160) / 24, u = (x - bx) / (bw / 2); bed.push([x, by - (Math.abs(u) < 1.6 ? bh * Math.exp(-u * u * 1.6) : 0) + Math.sin(i * 2.3) * 6]); }
            sec.add('dark', inkLoop([[-80, sy]].concat([[W + 80, sy]]).concat(bed.slice().reverse()), { seed: sd + 100, t, amp: 1 }));
            sec.add('gold', inkLoop(bed.concat([[W + 80, H + 80], [-80, H + 80]]), { seed: sd + 101, t, amp: 1 }));
            sec.add('ink', inkPath(bed, { w: 6, seed: sd + 102, t, amp: 1.2 }));
            for (let i = 0; i < 26; i++) { const x = bx + ((i * 37) % 100 - 50) / 50 * bw * 0.55, u = (x - bx) / (bw / 2); const y = by - bh * Math.exp(-u * u * 1.6) + 16 + (i * 13) % 40; sec.add('ink', inkDot(x, y, 3.5, 3, sd + 110 + i, t, 0.5)); }
            for (let i = 0; i < 6; i++) { const y = sy + 40 + i * ((by - sy) / 7), x0 = ((t * 30 + i * 180) % (W + 300)) - 150; sec.add('soft', inkPath([[x0, y], [x0 + 70, y + 4], [x0 + 140, y]], { w: 3, seed: sd + 140 + i, t, amp: 1 })); }
            sec.flush();
          }

          // ---- ships
          ships.forEach(({ s, LS, wave, fx: FX }, j) => {
            const kind = s.kind || 'galley', depth = s.depth || 0;
            const L = (kind === 'sail' ? 0.17 : 0.18) * W * (s.scale ?? 1) * (1 - depth * 0.45);
            const a0 = atOr(cues, s.at, 0), mdur = s.dur ?? Math.max(0.5, dur - a0);
            let x = (s.x ?? 0.5) * W, y = (s.y ?? 0.62) * H - depth * 0.08 * H, face = s.face ?? 1;
            const stopA = atOr(cues, s.stop, null);
            if (s.to != null) {
              let p = clamp01((lt - a0) / mdur);
              if (stopA != null) p = Math.min(p, clamp01((stopA - a0) / mdur));
              const speedK = kind === 'sail' && dropA != null ? 1 : 1;
              x = lerp(x, s.to * W, s.at != null ? progIO(p, 0, 1) * speedK : p);
            }
            if (stopA != null && lt >= stopA) x += Math.sin((lt - stopA) * 30) * 10 * Math.exp(-(lt - stopA) * 4);
            const scA = atOr(cues, s.scatter, null);
            let k = 1;
            if (scA != null && lt >= scA) {
              const u = lt - scA, turn = progIO(u, 0, 0.9), dirS = s.scatter_dir ?? (x > W / 2 ? 1 : -1);
              face = lerp(face, dirS, turn);
              x += dirS * (u * u * 60 + u * 140);
              y -= sm(u / 1.6) * 0.06 * H;
              k = lerp(1, 0.72, sm(u / 1.6));
            }
            const bob = Math.sin(t * 1.6 + j * 1.3) * 5, roll = Math.sin(t * 1.1 + j) * 0.02 + (stopA != null && lt >= stopA ? 0.05 * Math.exp(-(lt - stopA) * 2) : 0);
            const ph = s.row === false ? 0 : t * 5.4 + j;
            const strokes = kind === 'sail' ? shipStrokes(s, t, w, wdir, j) : galleyStrokes(s, t, Math.max(w, s.sail === 'set' ? 0.2 : 0), wdir, ph);
            const Y0 = y + bob;
            emit(LS, strokes, x, Y0, L * k, face, roll, sd + 200 + s.i * 97, t, depth > 0.5);
            // lantern
            if (s.lantern) {
              const dA = atOr(cues, s.dark, null), lit = dA == null ? 1 : 1 - prog(lt, dA, 0.35);
              const lx = x + (kind === 'sail' ? -0.98 : -1.05) * L * k * Math.sign(face || 1) * Math.abs(face), ly = Y0 + (kind === 'sail' ? -0.78 : -0.74) * L * k;
              LS.add('ink', inkPath([[lx, ly + 40 * k], [lx, ly + 10]], { w: 4, seed: sd + 260 + j, t, amp: 0.6 }));
              if (lit > 0.02) {
                LS.add('light', inkCircle(lx, ly, (34 + Math.sin(t * 9 + j) * 3) * lit * k, sd + 270 + j, t, { fill: true }));
                LS.add('gold', inkCircle(lx, ly, 15 * k * (0.6 + 0.4 * lit), sd + 280 + j, t, { fill: true }));
              }
              LS.add('ink', inkCircle(lx, ly, 15 * k, sd + 290 + j, t, { w: 4 }));
              if (dA != null && lt >= dA && lt < dA + 1.6) { const u = lt - dA; puff(FX, lx + u * 20, ly - 20 - u * 60, 8 + u * 16, sd + 300 + j, t); }
            }
            // draft (dashed keel under water)
            if (s.draft) {
              const dk = [[-0.62, 0.06], [-0.5, 0.5], [0.5, 0.5], [0.72, 0.06]].map(q => [x + q[0] * face * L * k, Y0 + q[1] * L * k]);
              for (let q = 0; q < dk.length - 1; q++) {
                const A = dk[q], Bq = dk[q + 1], n = Math.max(1, Math.round(Math.hypot(Bq[0] - A[0], Bq[1] - A[1]) / 36));
                for (let m = 0; m < n; m++) { const u0 = m / n, u1 = (m + 0.55) / n; LS.add('ink', inkPath([[lerp(A[0], Bq[0], u0), lerp(A[1], Bq[1], u0)], [lerp(A[0], Bq[0], u1), lerp(A[1], Bq[1], u1)]], { w: 5, seed: sd + 320 + q * 9 + m, t, amp: 0.8, taper: 0 })); }
              }
            }
            // fire
            const fA = atOr(cues, s.fire, null);
            if (fA != null && lt >= fA) {
              const fk = prog(lt, fA, 0.5);
              flames(FX, x + face * 0.1 * L * k, Y0 - (kind === 'sail' ? 0.32 : 0.16) * L * k, L * k, sd + 340 + j, t, fk * (kind === 'sail' ? 1.6 : 1));
              for (let q = 0; q < 5; q++) { const u = ((lt - fA) * 0.5 + q * 0.2) % 1; puff(FX, x + face * 0.1 * L * k + Math.sin(q * 2 + u * 3) * 20 + u * 90, Y0 - L * k * (0.75 + u * 1.3), (16 + u * 40) * Math.min(1, (lt - fA) * 2 + 0.3), sd + 360 + q + j * 5, t, true); }
            }
            LS.flush(); FX.flush();
            // waterline ripple in front of the hull
            const half = L * k * 1.15, rp = [];
            for (let q = 0; q <= 8; q++) rp.push([x - half + q * half / 4, Y0 + 6 + Math.sin(q * 1.7 + t * 4) * 4]);
            wave.setAttribute('d', depth > 0.5 ? '' : inkPath(rp, { w: 4, seed: sd + 380 + j, t, amp: 1 }));
          });

          // ---- cannon puffs
          (P.guns || []).forEach((g, gi) => {
            const ga = atOr(cues, g.at, 0.3), n = g.n ?? 3, gap = g.gap ?? 0.35;
            for (let q = 0; q < n; q++) {
              const tq = ga + q * gap; if (lt < tq) continue;
              const u = lt - tq, gx = (g.x ?? 0.5) * W + q * (g.dx ?? 60), gy = (g.y ?? 0.55) * H;
              if (u < 0.16) { const r = 30 * (g.r ?? 1); const st = []; for (let k = 0; k < 10; k++) { const a = k / 10 * 6.2832, rr = k % 2 ? r * 0.45 : r; st.push([gx + Math.cos(a) * rr, gy + Math.sin(a) * rr]); } smoke.add('gold', inkLoop(st, { seed: sd + 400 + q, t, amp: 1, smooth: false })); }
              if (u < 2.2) { const r = (12 + u * 22) * (g.r ?? 1) * (u > 1.5 ? 1 - (u - 1.5) / 0.7 : 1); if (r > 2) puff(smoke, gx + u * 22, gy - u * 40, r, sd + 420 + gi * 11 + q, t); }
            }
          });
          smoke.flush();

          // ---- foreground wave hatching
          let fd = '';
          for (let i = 0; i < 9; i++) {
            const yy = HZ + 60 + ((i * 131) % Math.max(100, H * 0.62 - HZ)), x0 = (((t * (18 + i % 3 * 8) + i * 233) % (W + 260)) + W + 260) % (W + 260) - 130;
            if (P.section && yy > (P.section.surface ?? 0.6) * H - 10) continue;
            if (yy > 1160 && yy < 1330 && portrait) continue;
            fd += inkPath([[x0, yy], [x0 + 40, yy - 8], [x0 + 80, yy], [x0 + 120, yy - 8]], { w: 3.5, seed: sd + 440 + i, t, amp: 1 }) + ' ';
          }
          front.setAttribute('d', fd);

          // ---- foreground rock ledge (Kaşif stands on it)
          if (ledgeL) {
            const right = lSide !== 'left', x0 = right ? W - lW : -40, x1 = right ? W + 40 : lW;
            const pts = [[x0 - (right ? 30 : -30), H + 60], [x0, lY + 40], [lerp(x0, x1, 0.2), lY + 6], [lerp(x0, x1, 0.55), lY - 4], [lerp(x0, x1, 0.85), lY + 8], [x1, lY + 20], [x1, H + 60]];
            ledgeL.add('dark', inkLoop(pts, { seed: sd + 470, t, amp: 1.4 }));
            ledgeL.add('ink', inkPath(pts.slice(0, -1), { w: 6, seed: sd + 471, t, amp: 1.4 }));
            for (let i = 0; i < 6; i++) { const hx = lerp(x0, x1, 0.15 + i * 0.13), hy = lY + 60 + (i % 3) * 40; ledgeL.add('soft', inkPath([[hx, hy], [hx + 36, hy + 18]], { w: 4, seed: sd + 480 + i, t, amp: 1 })); }
            ledgeL.flush();
          }
          updateCast(cast, lt, t, cues, W, H);
          const X = u => u * W, Y = v => v * H;
          updateLabels(labels, lt, t, cues, dur, X, Y, sd);
          updateLabels(windLab, lt, t, cues, dur, X, Y, sd + 50);
          if (windLab.length && dropA != null) windLab.forEach(L => { if (lt > dropA) L.g.setAttribute('transform', L.g.getAttribute('transform') + ` translate(0 ${f1(sm((lt - dropA) / 1.2) * 40)})`); });
        },
      };
    },
  };

  // ---------------------------------------------------------------- pv_gulf (bird's-eye)
  // water outline of a sea | narrow mouth | gulf, in sheet coords (u right, v down)
  const WATER = [[-0.08, -0.08], [0.27, -0.08], [0.25, 0.08], [0.28, 0.22], [0.31, 0.34], [0.34, 0.425], [0.45, 0.44], [0.55, 0.445], [0.62, 0.41],
    [0.68, 0.3], [0.78, 0.2], [0.9, 0.16], [1.08, 0.17], [1.08, 0.88], [0.92, 0.86], [0.8, 0.82], [0.7, 0.72], [0.64, 0.6], [0.58, 0.545],
    [0.46, 0.55], [0.36, 0.565], [0.32, 0.66], [0.27, 0.8], [0.26, 0.94], [0.29, 1.08], [-0.08, 1.08]];
  function inPoly(p, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  function formOff(form, i, n, sp, hd) {
    const ca = Math.cos(hd), sa = Math.sin(hd);
    let al = 0, ac = 0;
    if (form === 'line') { al = -(i - (n - 1) / 2) * 50 * sp; ac = (i % 2 ? 14 : -14) * sp; }
    else if (form === 'crescent') { const a = n > 1 ? i / (n - 1) * 2 - 1 : 0, R = 210 * sp; al = R * 0.55 * a * a - R * 0.2; ac = a * R; }
    else { // grid (axis aligned)
      const cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.3))), rows = Math.ceil(n / cols), r = Math.floor(i / cols), c = i % cols;
      return [(c - (cols - 1) / 2) * 58 * sp + (r % 2 ? 18 : 0) * sp, (r - (rows - 1) / 2) * 50 * sp];
    }
    return [al * ca - ac * sa, al * sa + ac * ca];
  }
  SH.pv_gulf = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 57;
      const S = portrait ? { x: 40, y: 300, w: 1000, h: 830 } : { x: (W - 1440) / 2, y: 140, w: 1440, h: 720 };
      const X = u => S.x + u * S.w, Y = v => S.y + v * S.h, PX = q => [X(q[0]), Y(q[1])];
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sheet = layerSet(cam, { dark: { 'fill-opacity': 0.75 } });
      const waterE = mk(cam, INK.paper), coastE = mk(cam, INK.inkSoft), waveE = mk(cam, INK.inkSoft), barL = layerSet(cam);
      const routeE = mk(cam, INK.red), routeB = mk(cam, INK.blue);
      const fleetL = layerSet(cam);
      const labG = el(cam, 'g');
      const defLabels = [{ text: 'İyon Denizi', u: 0.13, v: 0.2, size: portrait ? 52 : 46, rot: -6, at: 0 }, { text: 'Preveze', u: 0.46, v: 0.36, size: portrait ? 56 : 48, rot: -3, at: 0 },
        { text: 'Arta Körfezi', u: 0.83, v: 0.5, size: portrait ? 52 : 46, rot: 4, at: 0 }];
      const labels = makeLabels(labG, P.labels || defLabels, portrait);
      const castG = el(root, 'g');
      const kas = P.kasif ? makeCast(castG, [Object.assign({ who: 'kasif', x: 0.86, y: 0.88, scale: portrait ? 0.42 : 0.36, face: -1 }, P.kasif)], seed, 0.42) : [];
      // land hatch points (outside water), fixed
      const hatch = [];
      const r = rng(seed * 31 + 7);
      for (let i = 0; i < 70; i++) { const q = [r() * 1.0, r() * 1.0]; if (!inPoly(q, WATER)) hatch.push(q); }
      const waves = [];
      for (let i = 0; i < 26; i++) { const q = [r(), r()]; if (inPoly(q, WATER) && !(q[0] > 0.29 && q[0] < 0.66 && q[1] > 0.4 && q[1] < 0.6)) waves.push(q); }
      const fleets = (P.fleets || []).map((F, fi) => Object.assign({ fi, n: 12, kind: 'galley', form: 'grid', spread: 1, heading: 0 }, F));

      function groupAt(F, lt, cues) {
        let x = F.x, y = F.y, form = F.form, prevForm = F.form, fk = 1, hd = F.heading, sp = F.spread;
        (F.moves || []).forEach((m, k) => {
          const a = atOr(cues, m.at, 0.5 + k), d = m.dur ?? 1.6, p = progIO(lt, a, d);
          if (lt >= a) {
            x = lerp(x, m.x ?? x, p); y = lerp(y, m.y ?? y, p);
            if (m.form && m.form !== form) { prevForm = form; form = m.form; fk = p; }
            if (m.heading != null) hd = m.heading;
            if (m.spread != null) sp = lerp(sp, m.spread, p);
          }
        });
        return { x, y, form, prevForm, fk, hd, sp };
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.08, progIO(lt, 0, Math.max(1, dur)));
          const fo = P.focus || [0.5, 0.5], fx = X(fo[0]), fy = Y(fo[1]);
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // sheet + land
          const rect = [[S.x, S.y], [S.x + S.w, S.y], [S.x + S.w, S.y + S.h], [S.x, S.y + S.h]];
          sheet.add('dark', inkLoop(rect, { seed: sd + 1, t, amp: 1.2, smooth: false }));
          hatch.forEach((q, i) => { const [hx, hy] = PX(q); sheet.add('soft', inkPath([[hx, hy], [hx + 26, hy - 18]], { w: 3.5, seed: sd + 10 + i, t, amp: 0.8 })); });
          // fort at the mouth (north bank)
          if (P.fort !== false) {
            const [cx, cy] = PX([0.4, 0.4]), fw = 58;
            const body = [[cx - fw / 2, cy], [cx - fw / 2, cy - 44], [cx - fw / 6, cy - 44], [cx - fw / 6, cy - 54], [cx + fw / 6, cy - 54], [cx + fw / 6, cy - 44], [cx + fw / 2, cy - 44], [cx + fw / 2, cy]];
            sheet.add('light', inkLoop(body, { seed: sd + 3, t, amp: 0.8, smooth: false }));
            sheet.add('ink', inkPath(body, { w: 4, seed: sd + 4, t, amp: 0.8, smooth: false, closed: true }));
            sheet.add('ink', inkPath([[cx, cy - 54], [cx, cy - 92]], { w: 3, seed: sd + 5, t, amp: 0.6 }));
            sheet.add('red', inkLoop([[cx, cy - 92], [cx + 30, cy - 85 + Math.sin(t * 6) * 2], [cx, cy - 76]], { seed: sd + 6, t, amp: 0.6 }));
          }
          sheet.add('ink', inkPath(rect, { w: 5, seed: sd + 2, t, amp: 1.2, smooth: false, closed: true }));
          sheet.flush();
          // water + coast
          const wp = WATER.map(q => [X(Math.max(0, Math.min(1, q[0]))), Y(Math.max(0, Math.min(1, q[1])))]);
          waterE.setAttribute('d', inkLoop(wp, { seed: sd + 20, t, amp: 1.2 }));
          const coastN = WATER.slice(1, 13), coastS = WATER.slice(14, 25);
          coastE.setAttribute('d', inkPath(coastN.map(PX), { w: 5, seed: sd + 21, t, amp: 1.2 }) + ' ' + inkPath(coastS.map(PX), { w: 5, seed: sd + 22, t, amp: 1.2 }));
          let wd = '';
          waves.forEach((q, i) => { const [wx, wy] = PX(q), o = Math.sin(t * 1.5 + i) * 6; wd += inkPath([[wx - 22 + o, wy], [wx - 8 + o, wy - 8], [wx + 6 + o, wy], [wx + 20 + o, wy - 8]], { w: 3, seed: sd + 30 + i, t, amp: 0.8 }) + ' '; });
          waveE.setAttribute('d', wd);
          // sandbar
          if (P.bar) {
            const B = P.bar === true ? {} : P.bar, ba = atOr(cues, B.at, null);
            for (let i = 0; i < 34; i++) { const q = [0.3 + ((i * 37) % 70) / 70 * 0.09, 0.43 + ((i * 53) % 90) / 90 * 0.14]; if (inPoly(q, WATER)) { const [dx, dy] = PX(q); barL.add('dark', inkDot(dx, dy, 5, 4, sd + 40 + i, t, 0.5)); } }
            if (ba != null && lt >= ba) {
              const pr = prog(lt, ba, 0.7), pk = punch(lt, ba, 0.6), [cx, cy] = PX([0.345, 0.495]);
              const n = 26, pts = [];
              for (let i = 0; i <= Math.round(n * 1.05 * pr); i++) { const a = -2.2 + i / n * 6.2832; pts.push([cx + Math.cos(a) * 92 * (1 + 0.1 * pk), cy + Math.sin(a) * 118 * (1 + 0.1 * pk)]); }
              if (pts.length > 1) barL.add('red', inkPath(pts, { w: 9, seed: sd + 80, t, amp: 1.2 }));
            }
            barL.flush();
          }
          // route arrows (dashed, drawn progressively)
          let rr = '', rb = '';
          (P.arrows || []).forEach((A, ai) => {
            const a = atOr(cues, A.at, 0.5), pr = prog(lt, a, A.dur ?? 1.2);
            if (pr <= 0.01) return;
            const pts = inkSpline(A.pts.map(PX), false, 8);
            const n = Math.max(2, Math.round((pts.length - 1) * pr));
            let d = '';
            for (let i = 0; i + 3 < n; i += 6) d += inkPath(pts.slice(i, i + 4), { w: 7, seed: sd + 90 + ai * 30 + i, t, amp: 0.8, taper: 0 }) + ' ';
            const e = pts[n - 1], b = pts[Math.max(0, n - 6)], an = Math.atan2(e[1] - b[1], e[0] - b[0]);
            [0.55, -0.55].forEach((o, k) => d += inkPath([e, [e[0] - Math.cos(an + o) * 38, e[1] - Math.sin(an + o) * 38]], { w: 7, seed: sd + 95 + ai * 30 + k, t, amp: 0.6, taper: 0.1 }) + ' ');
            if (A.color === 'blue') rb += d; else rr += d;
          });
          routeE.setAttribute('d', rr); routeB.setAttribute('d', rb);
          // fleets
          fleets.forEach(F => {
            const G = groupAt(F, lt, cues), G2 = groupAt(F, lt + 0.08, cues);
            const moving = Math.hypot(G2.x - G.x, G2.y - G.y) * S.w > 1.2;
            const hd = (moving ? Math.atan2((G2.y - G.y) * S.h, (G2.x - G.x) * S.w) : G.hd * Math.PI / 180);
            const ap = atOr(cues, F.appear, null), col = F.side === 'hl' ? 'blue' : 'red';
            for (let i = 0; i < F.n; i++) {
              const pin = ap == null ? 1 : spring(lt, ap + i * 0.05, 0.5);
              if (pin <= 0.01) continue;
              const o1 = formOff(G.form, i, F.n, G.sp, hd), o0 = formOff(G.prevForm, i, F.n, G.sp, hd);
              const ox = lerp(o0[0], o1[0], G.fk), oy = lerp(o0[1], o1[1], G.fk);
              const jx = Math.sin(t * 0.9 + i * 1.7) * 3, jy = Math.cos(t * 0.8 + i * 2.3) * 3;
              const cx = X(G.x) + ox + jx, cy = Y(G.y) + oy + jy;
              const kind = F.kind === 'mix' ? (i % 3 === 1 ? 'sail' : 'galley') : F.kind;
              const len = (kind === 'sail' ? 30 : 28) * pin * (portrait ? 1 : 0.9), wid = kind === 'sail' ? 13 : 8;
              const ca = Math.cos(hd), sa = Math.sin(hd), P2 = (a, b) => [cx + a * ca - b * sa, cy + a * sa + b * ca];
              const hull = [P2(-len, 0), P2(-len * 0.6, -wid), P2(len * 0.4, -wid), P2(len * 1.15, 0), P2(len * 0.4, wid), P2(-len * 0.6, wid)];
              fleetL.add(col, inkLoop(hull, { seed: sd + 200 + F.fi * 50 + i, t, amp: 0.8 }));
              fleetL.add('ink', inkPath(hull, { w: 3.5, seed: sd + 260 + F.fi * 50 + i, t, amp: 0.8, closed: true }));
              if (kind === 'sail') {
                [-0.35, 0.3].forEach((u, k) => fleetL.add('ink', inkPath([P2(len * u, -wid * 1.7), P2(len * u, wid * 1.7)], { w: 4, seed: sd + 300 + i * 3 + k, t, amp: 0.6 })));
              } else {
                const sw = Math.sin(t * 5 + i) * 0.25;
                for (let k = 0; k < 4; k++) { const u = -0.5 + k * 0.32; [-1, 1].forEach(sg => fleetL.add('ink', inkPath([P2(len * u, sg * wid), P2(len * (u - 0.12 + sw * 0.15), sg * wid * 2.3)], { w: 2.5, seed: sd + 320 + i * 9 + k * 2 + (sg > 0 ? 1 : 0), t, amp: 0.4, taper: 0 }))); }
              }
              if (moving) [-1, 1].forEach((sg, k) => fleetL.add('soft', inkPath([P2(-len * 1.1, sg * wid * 0.6), P2(-len * 2.2, sg * wid * 1.9)], { w: 3, seed: sd + 400 + i * 2 + k, t, amp: 0.8 })));
            }
          });
          fleetL.flush();
          updateLabels(labels, lt, t, cues, dur, u => X(u), v => Y(v), sd);
          updateCast(kas, lt, t, cues, W, H);
        },
      };
    },
  };

  // ---------------------------------------------------------------- pv_deck (eye level on a galley's poop deck)
  SH.pv_deck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 83;
      const HZ = (P.horizon ?? 0.46) * H, DY = (P.deck ?? 0.74) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sky = layerSet(cam, { soft: { 'fill-opacity': 0.5 } });
      const waterF = mk(cam, INK.paperDark, { 'fill-opacity': 0.38 }), waveE = mk(cam, INK.inkSoft);
      const farL = layerSet(cam, { dark: { 'fill-opacity': 0.8 } });
      const rig = layerSet(cam);
      const deckL = layerSet(cam);
      const castG = el(cam, 'g');
      const cast = makeCast(castG, P.cast, seed, portrait ? 0.62 : 0.5);
      const labG = el(root, 'g');
      const labels = makeLabels(labG, P.labels, portrait);
      const wind = Object.assign({ s: 1, dir: 1, dur: 1.4 }, P.wind || {});
      const col = (P.side || 'tr') === 'hl' ? 'blue' : 'red';
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur)));
          const fo = P.focus || [0.5, 0.6], fx = fo[0] * W, fy = fo[1] * H;
          const roll = Math.sin(t * 0.9) * 0.8, shA = atOr(cues, P.shake, null), shk = shA != null ? punch(lt, shA, 0.7) : 0;
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 47) * 12 * shk)} ${f1(Math.sin(t * 0.7) * 6)}) translate(${f1(fx)} ${f1(fy)}) rotate(${roll.toFixed(2)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const dropA = atOr(cues, wind.drop, null), gustA = atOr(cues, wind.at, null);
          const w = wind.s * (dropA != null ? 1 - progIO(lt, dropA, wind.dur) : 1) * (gustA != null ? lerp(0.35, 1, prog(lt, gustA, 0.8)) : 1), wdir = wind.dir;
          // night sky
          if (P.night) {
            sky.add('soft', inkLoop([[-60, -60], [W + 60, -60], [W + 60, HZ], [-60, HZ]], { seed: sd + 1, t, amp: 2, smooth: false }));
            for (let i = 0; i < 12; i++) sky.add('light', inkDot((i * 97 + 60) % W, 300 + (i * 61) % Math.max(60, HZ - 340), 4.5, 4.5, sd + 10 + i, t, 0.6));
          }
          // wind streaks
          if (w > 0.03) for (let i = 0; i < 6; i++) {
            const y0 = 330 + (i * 83) % Math.max(80, HZ - 360), sp = 300 + (i % 3) * 80, len = 240 + (i % 3) * 60, span = W + len + 200;
            const x0 = (((t * sp + i * 311) % span) + span) % span - len - 100, xs = wdir > 0 ? x0 : W - x0;
            const pts = Array.from({ length: 6 }, (_, k) => [xs + wdir * k * len / 5 * w, y0 + Math.sin(k * 1.3 + t * 3 + i) * 10]);
            if (i % 2 === 0) pts.push([pts[5][0] + wdir * 30 * w, pts[5][1] - 34], [pts[5][0] - wdir * 6, pts[5][1] - 40]);
            sky.add('soft', inkPath(pts, { w: 4.5 * (0.4 + 0.6 * w), seed: sd + 20 + i, t, amp: 1.5 }));
          }
          sky.flush();
          // sea
          const wv = []; for (let i = 0; i <= 16; i++) wv.push([-80 + i * (W + 160) / 16, HZ + Math.sin(i * 1.2 + t * 1.3) * 3]);
          waterF.setAttribute('d', inkLoop(wv.concat([[W + 80, H + 80], [-80, H + 80]]), { seed: sd + 30, t, amp: 1.2 }));
          let wd = ''; for (let i = 0; i < 7; i++) { const y = HZ + 30 + i * 30, x0 = (((t * 22 + i * 190) % (W + 200)) + W + 200) % (W + 200) - 100; wd += inkPath([[x0, y], [x0 + 36, y - 7], [x0 + 72, y], [x0 + 108, y - 7]], { w: 3, seed: sd + 40 + i, t, amp: 0.8 }) + ' '; }
          waveE.setAttribute('d', wd);
          // far ships
          (P.far || []).forEach((f, i) => {
            const L = W * 0.17 * (f.scale ?? 0.3), x = (f.x ?? 0.5) * W + Math.sin(t * 0.4 + i) * 6, y = HZ + 14 + (f.dy ?? 0) * H;
            const S = f.kind === 'sail' ? shipStrokes(f, t, w, wdir, i) : galleyStrokes(Object.assign({ sail: 'set' }, f), t, Math.max(0.3, w), wdir, t * 5 + i);
            emit(farL, S, x, y + Math.sin(t * 1.5 + i) * 2, L, f.face ?? 1, 0, sd + 60 + i * 91, t, false);
          });
          farL.flush();
          // lateen yard + sail (cropped, upper right), stern pole + long pennant (left)
          if (P.sail !== false) {
            const b = 60 * w * wdir;
            const A = [W * 1.06, H * 0.56], B = [W * 0.42, H * 0.15];
            const sail = [A, [lerp(A[0], B[0], 0.5), lerp(A[1], B[1], 0.5)], B, [W * 0.66 - b, H * 0.4], [W * 0.98 - b * 0.4, H * 0.62]];
            rig.add('light', inkLoop(sail, { seed: sd + 100, t, amp: 1.4 }));
            rig.add('ink', inkPath(sail.slice(2), { w: 5, seed: sd + 101, t, amp: 1.4 }));
            rig.add('ink', inkPath([[A[0] + 20, A[1] + 12], B], { w: 9, seed: sd + 102, t, amp: 1.2 }));
            rig.add('soft', inkPath([[W * 0.62, H * 0.3], [W * 0.84 - b * 0.3, H * 0.5]], { w: 3, seed: sd + 103, t, amp: 1 }));
            rig.add('ink', inkPath([[W * 0.9, DY], [W * 0.9, H * 0.4]], { w: 12, seed: sd + 104, t, amp: 1 }));
          }
          const px = W * (P.pole ?? 0.1), ptop = H * 0.2, L = W * 0.5;
          rig.add('ink', inkPath([[px, DY - 120], [px - 6, ptop]], { w: 8, seed: sd + 110, t, amp: 0.8 }));
          const pn = pennant(0, 0, 1, w, wdir, t * 0.7, 0).map(q => [px - 6 + q[0] * L * 0.6, ptop + 40 + q[1] * L * (w > 0.4 ? 0.5 : 0.62)]);
          rig.add(col, inkLoop(pn, { seed: sd + 111, t, amp: 1.2 }));
          rig.add('ink', inkPath(pn, { w: 4, seed: sd + 112, t, amp: 1.2, closed: true }));
          if (col === 'red') {   // small crescent on the Ottoman pennant
            const cx = px + 70 * Math.max(0.2, w), cy = ptop + 40 + lerp(70, 0, w);
            rig.add('light', inkCircle(cx, cy, 16, sd + 113, t, { fill: true }));
            rig.add('red', inkCircle(cx + 6, cy - 2, 13, sd + 114, t, { fill: true }));
          }
          rig.flush();
          // rail + deck planks
          const RY = DY - 120;
          deckL.add('dark', inkLoop([[-60, RY - 12], [W + 60, RY - 12], [W + 60, RY + 10], [-60, RY + 10]], { seed: sd + 120, t, amp: 1, smooth: false }));
          deckL.add('ink', inkPath([[-60, RY - 12], [W + 60, RY - 12]], { w: 6, seed: sd + 121, t, amp: 1 }));
          for (let i = 0; i < 11; i++) { const x = -20 + i * (W + 40) / 10; deckL.add('ink', inkPath([[x, RY + 6], [x, DY]], { w: 5, seed: sd + 130 + i, t, amp: 0.8 })); }
          deckL.add('ink', inkPath([[-60, DY], [W + 60, DY]], { w: 6, seed: sd + 150, t, amp: 1 }));
          deckL.add('dark', inkLoop([[-60, DY], [W + 60, DY], [W + 60, H + 60], [-60, H + 60]], { seed: sd + 151, t, amp: 1, smooth: false }));
          for (let i = 0; i < 9; i++) { const xb = W / 2 + (i - 4) * 150; deckL.add('soft', inkPath([[xb, DY + 4], [W / 2 + (i - 4) * 420, H + 40]], { w: 3.5, seed: sd + 160 + i, t, amp: 1 })); }
          // lantern on the stern post
          if (P.lantern) {
            const LN = P.lantern === true ? {} : P.lantern, lx = (LN.x ?? 0.92) * W, ly = RY - 70, dA = atOr(cues, LN.dark, null), lit = dA == null ? 1 : 1 - prog(lt, dA, 0.35);
            deckL.add('ink', inkPath([[lx, RY], [lx, ly + 20]], { w: 6, seed: sd + 180, t, amp: 0.6 }));
            if (lit > 0.02) { deckL.add('light', inkCircle(lx, ly, (50 + Math.sin(t * 9) * 4) * lit, sd + 181, t, { fill: true })); deckL.add('gold', inkCircle(lx, ly, 22, sd + 182, t, { fill: true })); }
            deckL.add('ink', inkCircle(lx, ly, 22, sd + 183, t, { w: 5 }));
          }
          deckL.flush();
          updateCast(cast, lt, t, cues, W, H);
          updateLabels(labels, lt, t, cues, dur, u => u * W, v => v * H, sd);
        },
      };
    },
  };
})();
