// gp_plot: shots for the Stickstory Short "Gunpowder Plot" (2026-11-05, Bonfire Night): 36 barrels of gunpowder in the
// undercroft under the House of Lords, King James I as the target, the anonymous letter, the midnight search that
// caught Guy Fawkes, and the bonfires Britain still lights every 5 November. Parametric for any "cellar / palace /
// plot / bonfire" story. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line
// boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.kasif,
// LH.label) lazily at build time. Kaşif / period figures come from KASIF.create (kasif.js).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = LH label {text, x, y, at, size, color: ink|red|gold|blue|paper, font: hand|serif, card, rot, underline}
//   F = period figure {x, y (ground 0..1 H), scale: 0.8, accessory, beard, face, pose, emotion, lantern: true,
//       walk: {from: x0, at, dur: 1.6} (walks in to x), seq: [{at, pose, face, emotion, dir}]}
//
// SHOTS.gp_palace — Westminster at night seen across the Thames: Westminster Hall's big roof and towers, St Stephen's
//   with pinnacles, the Abbey behind, lit pointed windows; the river fills the bottom with gold reflections and a
//   small boat. A big sealed letter (red wax seal) floats and glows over the palace on `letter`.
//   P: {gy: 0.6 (river bank / where Kaşif stands), tall: 1.5 (building height factor), win_y: 170 (hall windows, px above
//       the bank), letter: {x: 0.34, y: 0.42, s: 1, at: 0.1} | false, kasif: K,
//       labels: [L]}
// SHOTS.gp_cellar — the vaulted undercroft. P: {mode: "count"|"below"|"dark", gy: 0.6 (cellar floor),
//   barrels: {at: 0.2, step: 0.05} (36 barrels in four stacked rows pop in one by one; count mode), wood: true
//   (firewood bundles laid over the barrels), count: {to: 36, at, dur: 1.6, suffix: " BARRELS", y: 0.3} (serif card),
//   chamber: {label, at} (below mode: the House of Lords chamber above the vault with lords on red benches and the
//   empty throne), arrow: {at} (red dashed arrow from the powder up to the throne), figures: [F] (dark mode: guards
//   with lanterns, Fawkes), labels: [L]}
// SHOTS.gp_throne — the Lords chamber: King James I (crown, beard) on the throne under a red cloth of estate, lords on
//   red benches, tall lit windows; under the floor a cut-away strip shows the barrels right below him; a red dashed
//   target ring closes around the king on `target`. P: {gy: 0.6 (chamber floor), target: cue, labels: [L]}
// SHOTS.gp_bonfire — Bonfire Night: a big bonfire on a green, sparks and smoke, fireworks bursting over a far London
//   skyline (the Elizabeth Tower and Parliament), heads and shoulders of a crowd from behind fill the bottom.
//   P: {gy: 0.62, fire: {x: 0.5, s: 1, at: 0}, fireworks: [{x, y, at, col: gold|red|blue, r: 1}] (defaults: a
//       burst every 1.1 s), crowd: {n: 5, y: 0.9} | false, kasif: K | false, labels: [L]}
// cues: hit (punch) + the names above + labels/figures "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const SERIF = 'Fraunces, Georgia, serif';
  const set = (e, d) => e.setAttribute('d', d || '');
  const NIGHT = () => mix(INK.ink, INK.blue, 0.28);
  const NIGHT2 = () => mix(INK.ink, INK.blue, 0.5);
  const NIGHT3 = () => mix(INK.inkSoft, INK.blue, 0.45);
  const STONE = () => mix(INK.paperDark, INK.inkSoft, 0.35);
  const STONE_D = () => mix(INK.inkSoft, INK.ink, 0.35);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.45);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const rectP = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const COLS = () => ({ gold: INK.gold, red: INK.red, blue: mix(INK.blue, INK.paperLight, 0.3), paper: INK.paperLight });

  // ------------------------------------------------------------------ painter: a pool of ink elements per fill
  function pool(parent, fill, extra) {
    const els = []; let k = 0;
    return {
      begin() { k = 0; },
      add(d) { const e = els[k] || (els[k] = inkEl(parent, fill, extra)); e.setAttribute('d', d); k++; },
      end() { for (let i = k; i < els.length; i++) els[i].setAttribute('d', ''); },
    };
  }

  // barrels drawn one after another (fill, top, outline per barrel) so front barrels cover the back ones
  function bpool(parent, fill, topFill) {
    const els = []; let k = 0;
    return {
      begin() { k = 0; },
      add(d) { let e = els[k]; if (!e) { const g = el(parent, 'g'); e = els[k] = [inkEl(g, fill), inkEl(g, topFill), inkEl(g, INK.ink)]; }
        e[0].setAttribute('d', d.fill); e[1].setAttribute('d', d.top); e[2].setAttribute('d', d.line + ' ' + d.topR); k++; },
      end() { for (let i = k; i < els.length; i++) els[i].forEach(x => x.setAttribute('d', '')); },
    };
  }

  // ------------------------------------------------------------------ barrel (upright), bottom centre (x, y)
  function barrelD(x, y, w, h, sd, t) {
    const pts = [[x - w * 0.42, y], [x - w * 0.5, y - h * 0.5], [x - w * 0.42, y - h], [x + w * 0.42, y - h], [x + w * 0.5, y - h * 0.5], [x + w * 0.42, y]];
    const fill = inkLoop(pts, { seed: sd, t, amp: 0.7 });
    let line = inkPath(pts, { w: 4, seed: sd + 1, t, amp: 0.8, closed: true });
    for (const v of [0.16, 0.84]) line += ' ' + inkPath([[x - w * 0.46, y - h * v], [x + w * 0.46, y - h * v]], { w: 3.5, seed: sd + 2 + v * 10, t, amp: 0.6 });
    const st = inkPath([[x - w * 0.16, y - 4], [x - w * 0.19, y - h * 0.5], [x - w * 0.16, y - h + 4]], { w: 2.2, seed: sd + 5, t, amp: 0.5 }) + ' ' +
      inkPath([[x + w * 0.16, y - 4], [x + w * 0.19, y - h * 0.5], [x + w * 0.16, y - h + 4]], { w: 2.2, seed: sd + 6, t, amp: 0.5 });
    const top = inkEllipsePts(x, y - h, w * 0.42, h * 0.07, sd + 7, 12);
    return { fill, line: line + ' ' + st, top: inkLoop(top, { seed: sd + 7, t, amp: 0.5 }), topR: inkPath(top, { w: 3, seed: sd + 8, t, closed: true, amp: 0.5 }) };
  }

  // the 36-barrel stack: rows back -> front: [n, y offset (up), scale]
  const STACK = [[10, 150, 0.7], [9, 100, 0.8], [9, 50, 0.9], [8, 0, 1]];
  function stackLayout(cx, gy, span, s) {
    const out = [];
    STACK.forEach(([n, dy, k], r) => {
      const w = 92 * s * k, step = span * (0.82 + r * 0.06) / n;
      for (let i = 0; i < n; i++) out.push({ x: cx + (i - (n - 1) / 2) * step + (r % 2 ? step * 0.12 : 0), y: gy - dy * s, w, h: w * 1.3, r, i });
    });
    return out;   // 36 entries, back row first (draw order)
  }

  // ------------------------------------------------------------------ lantern held at a hand point (hangs down)
  function lanternD(x, y, s, sd, t) {
    const sw = Math.sin(t * 2.3 + sd) * 4 * s, bx = x + sw, by = y + 34 * s;
    const body = rectP(bx - 22 * s, by, bx + 22 * s, by + 56 * s);
    const roof = [[bx - 26 * s, by], [bx, by - 22 * s], [bx + 26 * s, by]];
    return {
      line: inkPath([[x, y], [bx, by - 22 * s]], { w: 3, seed: sd, t, amp: 0.4 }) + ' ' + inkPath(body, { w: 4, seed: sd + 1, t, closed: true, smooth: false, amp: 0.5 }) + ' ' +
        inkPath(roof, { w: 4, seed: sd + 2, t, closed: true, smooth: false, amp: 0.5 }) + ' ' + inkPath([[bx, by + 2], [bx, by + 54 * s]], { w: 2.5, seed: sd + 3, t, amp: 0.4 }),
      glass: inkLoop(body, { seed: sd + 4, t, smooth: false, amp: 0.4 }),
      roofF: inkLoop(roof, { seed: sd + 5, t, smooth: false, amp: 0.4 }),
      flame: inkLoop([[bx - 8 * s, by + 46 * s], [bx, by + (14 + Math.sin(t * 9 + sd) * 4) * s], [bx + 8 * s, by + 46 * s]], { seed: sd + 6, t, amp: 0.5 }),
      c: [bx, by + 28 * s],
    };
  }

  // ------------------------------------------------------------------ period figure (KASIF rig, hatless) with optional lantern
  function figure(parent, F, W, H, sd) {
    const g = el(parent, 'g');
    const sc = F.scale ?? 0.8;
    const rig = KASIF.create(g, { scale: sc, hat: false, accessory: F.accessory || null, beard: F.beard || null, seed: sd });
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    return {
      update(lt, t, cues) {
        const wk = F.walk, x1 = (F.x ?? 0.5) * W;
        let x = x1, pose = F.pose || 'idle', ph = 0;
        if (wk) {
          const a = atOr(cues, wk.at, 0), d = wk.dur ?? 1.6, x0 = (wk.from ?? -0.15) * W, p = clamp01((lt - a) / d);
          x = lerp(x0, x1, sm(p));
          if (lt < a + d) { pose = 'walk'; ph = Math.abs(x - x0) / (gait * sc); }
        }
        const segs = [{ at: -1, pose, face: F.face, emotion: F.emotion, dir: F.dir }];
        if (!(wk && lt < atOr(cues, wk.at, 0) + (wk.dur ?? 1.6))) (F.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null && lt >= a) segs.push(Object.assign({}, s, { at: a })); });
        const s = segs[segs.length - 1], since = lt - Math.max(0, s.at);
        const face = (s.face ?? F.face) === 'left' ? -1 : 1;
        const dir = typeof (s.dir ?? F.dir) === 'number' ? (s.dir ?? F.dir) : ({ up: 70, down: -38, forward: 8 })[s.dir ?? F.dir] ?? 20;
        const r = rig.update(t, s.pose || pose, { x, y: (F.y ?? 0.6) * H, face, ph, since, dir, emotion: s.emotion || F.emotion || (s.pose === 'shock' ? 'surprised' : null) });
        const hand = r && r.hands ? r.hands[1] : [30, -250];
        return { x, hand: [x + face * sc * hand[0], (F.y ?? 0.6) * H + sc * hand[1]], head: r && r.head ? [x + face * sc * r.head[0], (F.y ?? 0.6) * H + sc * r.head[1]] : [x, (F.y ?? 0.6) * H - 400 * sc] };
      },
    };
  }

  // ------------------------------------------------------------------ stone block wall lines over a rect
  function blocksD(x0, y0, x1, y1, bh, bw, sd, t) {
    const D = [];
    for (let y = y1, row = 0; y > y0 + 4; y -= bh, row++) {
      D.push(inkPath([[x0, y], [x1, y]], { w: 2.4, seed: sd + row, t, amp: 0.6 }));
      for (let x = x0 + (row % 2) * bw * 0.5; x < x1; x += bw) if (x > x0 + 6) D.push(inkPath([[x, y], [x + 2, Math.max(y0, y - bh)]], { w: 2.2, seed: sd + 50 + row * 13 + Math.round(x), t, amp: 0.5 }));
    }
    return D.join(' ');
  }

  // ------------------------------------------------------------------ gothic arch window
  function archWin(x, y, w, h) {
    const p = [[x - w / 2, y + h], [x - w / 2, y + h * 0.35]];
    for (let i = 1; i < 6; i++) { const a = Math.PI - i / 6 * Math.PI; p.push([x + Math.cos(a) * w / 2, y + h * 0.35 - Math.sin(a) * h * 0.35 * (1 - Math.abs(Math.cos(a)) * 0.2)]); }
    p.push([x + w / 2, y + h * 0.35], [x + w / 2, y + h]);
    return p;
  }

  // ------------------------------------------------------------------ the sealed letter
  function letter(parent, sd) {
    const g = el(parent, 'g');
    const glow = inkEl(g, INK.gold, { 'fill-opacity': 0.28 }), glow2 = inkEl(g, INK.gold, { 'fill-opacity': 0.4 });
    const sheet = inkEl(g, INK.paperLight), fold = inkEl(g, INK.paperDark), line = inkEl(g), seal = inkEl(g, INK.red), sealR = inkEl(g);
    return { update(t, lt, x, y, s, k) {
      if (k <= 0.01) { [glow, glow2, sheet, fold, line, seal, sealR].forEach(e => set(e)); return; }
      const S = s * k, bob = Math.sin(t * 1.4) * 10 * s, rot = Math.sin(t * 0.9) * 0.05 - 0.08, c = Math.cos(rot), sn = Math.sin(rot);
      const P = (a, b) => [x + (c * a - sn * b) * S, y + bob + (sn * a + c * b) * S];
      const w = 200, h = 130;
      const R = [P(-w, -h), P(w, -h), P(w, h), P(-w, h)];
      set(glow, inkCircle(x, y + bob, 330 * S * (1 + 0.05 * Math.sin(t * 3)), sd + 1, t, { fill: true, ry: 260 * S }));
      set(glow2, inkCircle(x, y + bob, 250 * S, sd + 2, t, { fill: true, ry: 190 * S }));
      set(sheet, inkLoop(R, { seed: sd + 3, t, smooth: false, amp: 0.8 }));
      set(fold, inkLoop([P(-w, -h), P(0, 20), P(w, -h)], { seed: sd + 4, t, smooth: false, amp: 0.6 }));
      set(line, inkPath(R, { w: 6, seed: sd + 5, t, closed: true, smooth: false }) + ' ' + inkPath([P(-w, -h), P(0, 20), P(w, -h)], { w: 5, seed: sd + 6, t, smooth: false }) + ' ' +
        inkPath([P(-w, h), P(-50, 0)], { w: 3.5, seed: sd + 7, t }) + ' ' + inkPath([P(w, h), P(50, 0)], { w: 3.5, seed: sd + 8, t }));
      const sc = P(0, 26);
      set(seal, inkCircle(sc[0], sc[1], 44 * S, sd + 9, t, { fill: true, n: 11 }));
      set(sealR, inkCircle(sc[0], sc[1], 44 * S, sd + 10, t, { w: 4 }) + ' ' + inkCircle(sc[0], sc[1], 24 * S, sd + 11, t, { w: 3 }));
    } };
  }

  // ------------------------------------------------------------------ flames (tongues) of a fire, base centre (x, y)
  function flamesD(x, y, w, h, sd, t) {
    const out = { red: [], gold: [], core: [], line: [] };
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n - 0.5, hh = h * (1 - Math.abs(u) * 1.3) * (0.75 + 0.35 * Math.sin(t * (5 + hn(sd, i) * 3) + i * 1.7));
      const bx = x + u * w, ww = w / n * 1.5, sway = Math.sin(t * 4 + i) * ww * 0.5;
      const tip = [bx + sway, y - hh];
      const tg = [[bx - ww, y], [bx - ww * 0.6, y - hh * 0.45], tip, [bx + ww * 0.6, y - hh * 0.45], [bx + ww, y]];
      out.red.push(inkLoop(tg, { seed: sd + i, t, amp: 1 }));
      const tg2 = [[bx - ww * 0.6, y], [bx - ww * 0.3, y - hh * 0.35], [bx + sway * 0.7, y - hh * 0.68], [bx + ww * 0.3, y - hh * 0.35], [bx + ww * 0.6, y]];
      out.gold.push(inkLoop(tg2, { seed: sd + 20 + i, t, amp: 0.8 }));
      if (i % 2 === 0) out.core.push(inkLoop([[bx - ww * 0.3, y], [bx + sway * 0.4, y - hh * 0.36], [bx + ww * 0.3, y]], { seed: sd + 40 + i, t, amp: 0.6 }));
      out.line.push(inkPath(tg.slice(1, 4), { w: 3.5, seed: sd + 60 + i, t, amp: 0.8 }));
    }
    return { red: out.red.join(' '), gold: out.gold.join(' '), core: out.core.join(' '), line: out.line.join(' ') };
  }

  // ------------------------------------------------------------------ crowd heads + shoulders from behind
  function crowdD(W, H, n, base, s, sd, t) {
    const B = [], R = [], HD = [], HT = [];
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5 + (hn(sd, i) - 0.5) * 0.35) / n * W, sc = s * (0.9 + hn(sd, i + 3) * 0.3), y = base + hn(sd, i + 7) * 50 * s;
      const sway = Math.sin(t * 0.9 + i * 1.7) * 6 * sc, hr = 58 * sc, hx = x + sway, hy = y - 150 * sc;
      const sh = [[x - 160 * sc, H + 60], [x - 150 * sc, y + 10 * sc], [x - 110 * sc, y - 50 * sc], [x - 40 * sc, y - 76 * sc], [x + 40 * sc, y - 76 * sc], [x + 110 * sc, y - 50 * sc], [x + 150 * sc, y + 10 * sc], [x + 160 * sc, H + 60]];
      B.push(inkLoop(sh, { seed: sd + i, t, amp: 0.8 }));
      R.push(inkPath(sh.slice(1, -1), { w: 5, seed: sd + 40 + i, t, amp: 0.8 }));
      HD.push(inkCircle(hx, hy, hr, sd + 20 + i, t, { fill: true, ry: hr * 1.08 }));
      R.push(inkCircle(hx, hy, hr, sd + 60 + i, t, { w: 5, ry: hr * 1.08 }));
      if (i % 2 === 0) {
        const bn = [[hx - hr * 1.02, hy - hr * 0.15], [hx - hr * 0.8, hy - hr * 0.95], [hx, hy - hr * 1.22], [hx + hr * 0.8, hy - hr * 0.95], [hx + hr * 1.02, hy - hr * 0.15]];
        HT.push(inkLoop(bn, { seed: sd + 120 + i, t, amp: 0.6 }), inkCircle(hx, hy - hr * 1.3, hr * 0.26, sd + 125 + i, t, { fill: true }));
        R.push(inkPath(bn, { w: 4, seed: sd + 130 + i, t, closed: true, amp: 0.6 }));
      }
    }
    return { body: B.join(' '), line: R.join(' '), head: HD.join(' '), hat: HT.join(' ') };
  }

  // ================================================================== SHOTS.gp_palace
  SH.gp_palace = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 131, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const abbey = inkEl(root, NIGHT3()), abbeyR = inkEl(root, INK.ink);
      const bld = inkEl(root, NIGHT2()), bldR = inkEl(root, INK.ink), wins = inkEl(root, INK.gold), winR = inkEl(root, INK.ink);
      const bank = inkEl(root, STONE_D()), bankR = inkEl(root, INK.ink);
      const river = inkEl(root, mix(INK.blue, INK.ink, 0.45)), ripples = inkEl(root, NIGHT3()), refl = inkEl(root, INK.gold, { 'fill-opacity': 0.7 });
      const boat = inkEl(root, WOOD_D()), boatR = inkEl(root, INK.ink);
      const LT = letter(el(root, 'g'), sd + 300);
      const kas = P.kasif ? L.kasif(el(root, 'g'), P.kasif, W, H, sd + 7) : null;
      const LB = labels(root, P.labels, W, H);
      const LP = Object.assign({ x: 0.34, y: 0.42, s: 1, at: 0.1 }, P.letter || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const base = gy - 6 * u, hk = P.tall ?? 1.5;
          const Y = v => base - (base - v) * hk;
          // the Abbey far behind (two-tier nave + lantern tower)
          const ab = [[0.02 * W, base], [0.02 * W, Y(base - 300 * u)], [0.1 * W, Y(base - 300 * u)], [0.1 * W, Y(base - 360 * u)], [0.16 * W, Y(base - 360 * u)], [0.16 * W, Y(base - 300 * u)], [0.3 * W, Y(base - 300 * u)], [0.3 * W, base]];
          set(abbey, inkLoop(ab, { seed: sd + 1, t, smooth: false, amp: 0.6 }));
          set(abbeyR, inkPath(ab, { w: 3, seed: sd + 2, t, smooth: false, amp: 0.6 }));
          // Westminster Hall: huge roof + two front towers; St Stephen's: tall chapel with pinnacles; a long range
          const B = [], BR = [], WN = [];
          const hall = [[0.18 * W, base], [0.18 * W, Y(base - 210 * u)], [0.42 * W, Y(base - 400 * u)], [0.66 * W, Y(base - 210 * u)], [0.66 * W, base]];
          const tw1 = rectP(0.16 * W, Y(base - 300 * u), 0.24 * W, base), tw2 = rectP(0.6 * W, Y(base - 300 * u), 0.68 * W, base);
          const lan = [[0.4 * W, Y(base - 390 * u)], [0.4 * W, Y(base - 450 * u)], [0.42 * W, Y(base - 480 * u)], [0.44 * W, Y(base - 450 * u)], [0.44 * W, Y(base - 390 * u)]];
          const chap = [[0.7 * W, base], [0.7 * W, Y(base - 330 * u)], [0.78 * W, Y(base - 420 * u)], [0.86 * W, Y(base - 330 * u)], [0.86 * W, base]];
          const range = rectP(0.84 * W, Y(base - 200 * u), 1.04 * W, base);
          for (const [p, k] of [[range, 0], [hall, 1], [tw1, 2], [tw2, 3], [lan, 4], [chap, 5]]) { B.push(inkLoop(p, { seed: sd + 10 + k, t, smooth: false, amp: 0.7 })); BR.push(inkPath(p, { w: 4.5, seed: sd + 20 + k, t, closed: true, smooth: false, amp: 0.7 })); }
          for (const px of [0.7, 0.86]) { const pn = [[px * W - 12 * u, Y(base - 330 * u)], [px * W, Y(base - 400 * u)], [px * W + 12 * u, Y(base - 330 * u)]]; B.push(inkLoop(pn, { seed: sd + 30 + px * 10, t, smooth: false })); BR.push(inkPath(pn, { w: 3.5, seed: sd + 32 + px * 10, t, smooth: false })); }
          // battlements on the towers
          for (const [x0, x1] of [[0.16, 0.24], [0.6, 0.68]]) for (let i = 0; i < 4; i++) { const bx = lerp(x0, x1, (i + 0.25) / 4) * W, bw = (x1 - x0) * W / 8; const m = rectP(bx, Y(base - 330 * u), bx + bw, Y(base - 300 * u)); B.push(inkLoop(m, { seed: sd + 40 + i + x0 * 10, t, smooth: false })); }
          // lit windows (flicker slowly)
          const win = (x, y, w, h, i) => { w *= Math.sqrt(hk); h *= hk; const on = 0.85 + 0.15 * Math.sin(t * (1.3 + hn(sd, i)) + i); const p = archWin(x, y + h * (1 - on), w, h * on); WN.push(inkLoop(p, { seed: sd + 60 + i, t, amp: 0.4 })); BR.push(inkPath(p, { w: 2.5, seed: sd + 80 + i, t, closed: true, amp: 0.4 })); };
          const wy = P.win_y ?? 170;
          [0.27, 0.33, 0.39, 0.45, 0.51, 0.57].forEach((x, i) => win(x * W, Y(base - wy * u), 28 * u, 90 * u, i));
          win(0.78 * W, Y(base - 260 * u), 40 * u, 110 * u, 7);
          [0.89, 0.94, 0.99].forEach((x, i) => win(x * W, Y(base - 150 * u), 26 * u, 80 * u, 10 + i));
          [0.2, 0.64].forEach((x, i) => win(x * W, Y(base - 250 * u), 22 * u, 70 * u, 14 + i));
          set(bld, B.join(' ')); set(bldR, BR.join(' ')); set(wins, WN.join(' '));
          set(winR, '');
          // river bank wall + the Thames
          const bk = rectP(-20, base - 4, W + 20, base + 60 * u);
          set(bank, inkLoop(bk, { seed: sd + 90, t, smooth: false, amp: 0.6 }));
          set(bankR, inkPath([[-20, base - 4], [W + 20, base - 4]], { w: 5, seed: sd + 91, t }) + ' ' + blocksD(-20, base, W + 20, base + 60 * u, 30 * u, 90 * u, sd + 92, t));
          set(river, inkLoop(rectP(-20, base + 60 * u, W + 20, H + 20), { seed: sd + 95, t, smooth: false, amp: 0.4 }));
          const RP = [], RF = [];
          for (let i = 0; i < 16; i++) { const y = base + 90 * u + i * (H - base - 90 * u) / 16, ph = t * 0.6 + i; const x0 = ((hn(sd, i) + ph * 0.05) % 1) * W; RP.push(inkPath([[x0 - 120 * u, y], [x0, y + 6 * u * Math.sin(ph)], [x0 + 120 * u, y]], { w: 3, seed: sd + 100 + i, t, amp: 0.6 })); }
          [0.3, 0.42, 0.54, 0.78, 0.94].forEach((x, i) => { for (let k = 0; k < 6; k++) { const y = base + 90 * u + k * 70 * u, wv = Math.sin(t * 2 + k + i) * 14 * u, ww = (34 - k * 3) * u; RF.push(inkLoop([[x * W - ww + wv, y], [x * W + ww + wv, y - 4 * u], [x * W + ww * 0.8 + wv, y + 10 * u], [x * W - ww * 0.8 + wv, y + 12 * u]], { seed: sd + 140 + i * 9 + k, t, amp: 0.5 })); } });
          set(ripples, RP.join(' ')); set(refl, RF.join(' '));
          // small boat drifting with a lantern
          const bx = (0.15 + ((lt * 0.025) % 0.3)) * W, by = H - 330 * u + Math.sin(t * 1.5) * 6 * u;
          const hull = [[bx - 150 * u, by], [bx + 160 * u, by], [bx + 120 * u, by + 50 * u], [bx - 120 * u, by + 50 * u]];
          set(boat, inkLoop(hull, { seed: sd + 200, t, amp: 0.6 }));
          set(boatR, inkPath(hull, { w: 5, seed: sd + 201, t, closed: true, amp: 0.6 }) + ' ' + inkPath([[bx + 100 * u, by], [bx + 220 * u, by - 120 * u]], { w: 5, seed: sd + 202, t }));
          // the letter
          const la = atOr(cues, LP.at, 0.1), lk = lt < la ? 0 : spring(lt, la, 0.7) * (1 + 0.12 * punch(lt, atOr(cues, 'hit', null), 0.7));
          LT.update(t, lt, LP.x * W, LP.y * H, (LP.s ?? 1) * u, lk);
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== SHOTS.gp_cellar
  SH.gp_cellar = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 271, u = W / 1080, mode = P.mode || 'count';
      const dark = mode === 'dark', below = mode === 'below';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const vTop = below ? 0.45 * H : 0.14 * H;          // top of the vault
      const wallC = dark ? STONE_D() : STONE(), archC = dark ? mix(INK.ink, INK.inkSoft, 0.3) : STONE_D();
      // chamber (below mode)
      const chW = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.5)), chWin = inkEl(root, mix(INK.gold, INK.paperLight, 0.45)), chR = inkEl(root, INK.ink);
      const bench = inkEl(root, INK.red), benchR = inkEl(root, INK.ink), lordH = inkEl(root, mix(INK.paperDark, INK.stain, 0.2)), lordB = inkEl(root, mix(INK.blue, INK.ink, 0.35));
      const canopy = inkEl(root, INK.red), throne = inkEl(root, INK.gold), slab = inkEl(root, STONE_D()), slabR = inkEl(root, INK.ink);
      // vault
      const wall = inkEl(root, wallC), wallR = inkEl(root, dark ? INK.ink : INK.inkSoft), arches = inkEl(root, archC), archR = inkEl(root, INK.ink);
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.22 });
      const BP = bpool(el(root, 'g'), dark ? WOOD_D() : WOOD(), dark ? mix(WOOD_D(), INK.paperDark, 0.25) : mix(WOOD(), INK.paperLight, 0.3));
      const wood = inkEl(root, WOOD_D()), woodR = inkEl(root, INK.ink);
      const floor = inkEl(root, dark ? mix(INK.inkSoft, INK.ink, 0.5) : mix(INK.paperDark, INK.inkSoft, 0.5)), floorR = inkEl(root, INK.ink);
      const FGP = bpool(el(root, 'g'), dark ? WOOD_D() : WOOD(), dark ? mix(WOOD_D(), INK.paperDark, 0.25) : mix(WOOD(), INK.paperLight, 0.3));
      const arrow = inkEl(root, INK.red);
      const figG = el(root, 'g');
      const FIG = (P.figures || []).map((F, i) => figure(figG, F, W, H, sd + 400 + i * 17));
      const lanG = el(root, 'g'), lanF = pool(lanG, mix(INK.gold, INK.paperLight, 0.4)), lanRf = pool(lanG, INK.ink), lanFl = pool(lanG, INK.red), lanL = pool(lanG, INK.ink);
      const cardG = el(root, 'g'), card = inkEl(cardG, INK.paperLight), cardR = inkEl(cardG, INK.ink);
      const cardT = L.txt(cardG, { 'font-family': SERIF, 'font-weight': 900, 'font-size': 104 * u, fill: INK.red });
      const LB = labels(root, P.labels, W, H);
      const span = W * (below ? 0.8 : 0.9);
      const bs = (P.bscale ?? (below ? 0.62 : 1.15)) * u;
      const ST = stackLayout(W / 2, gy, span, bs);
      const BR = Object.assign({ at: 0.15, step: 0.045 }, P.barrels || {});
      const CT = P.count ? Object.assign({ to: 36, at: 0.2, dur: 1.6, suffix: ' BARRELS', y: 0.3 }, P.count) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          // ---- chamber above (below mode)
          if (below) {
            const cT = 0.13 * H, cB = 0.4 * H;
            const D = [], WN = [], BN = [], BNR = [], LH_ = [], LBd = [];
            set(chW, inkLoop(rectP(0.04 * W, cT, 0.96 * W, cB), { seed: sd + 1, t, smooth: false, amp: 0.5 }));
            D.push(inkPath(rectP(0.04 * W, cT, 0.96 * W, cB), { w: 6, seed: sd + 2, t, closed: true, smooth: false }));
            [0.16, 0.32, 0.68, 0.84].forEach((x, i) => { const p = archWin(x * W, cT + 50 * u, 70 * u, 190 * u); WN.push(inkLoop(p, { seed: sd + 10 + i, t, amp: 0.4 })); D.push(inkPath(p, { w: 3.5, seed: sd + 14 + i, t, closed: true, amp: 0.4 }), inkPath([[x * W, cT + 80 * u], [x * W, cT + 240 * u]], { w: 2.5, seed: sd + 18 + i, t })); });
            set(chWin, WN.join(' '));
            // cloth of estate + throne in the middle
            const cx = W / 2, cn = rectP(cx - 90 * u, cT + 30 * u, cx + 90 * u, cB - 70 * u);
            set(canopy, inkLoop(cn, { seed: sd + 20, t, smooth: false, amp: 0.5 }));
            const th = [[cx - 60 * u, cB], [cx - 60 * u, cB - 210 * u], [cx - 40 * u, cB - 250 * u], [cx + 40 * u, cB - 250 * u], [cx + 60 * u, cB - 210 * u], [cx + 60 * u, cB]];
            set(throne, inkLoop(th, { seed: sd + 21, t, smooth: false, amp: 0.5 }));
            D.push(inkPath(cn, { w: 4, seed: sd + 22, t, closed: true, smooth: false }), inkPath(th, { w: 5, seed: sd + 23, t, closed: true, smooth: false }), inkPath([[cx - 60 * u, cB - 110 * u], [cx + 60 * u, cB - 110 * u]], { w: 4, seed: sd + 24, t }));
            // red benches with lords (heads + robes) on both sides
            for (const side of [-1, 1]) for (let r = 0; r < 2; r++) {
              const x0 = side < 0 ? 0.07 * W : 0.62 * W, x1 = side < 0 ? 0.38 * W : 0.93 * W, y = cB - 10 * u - r * 70 * u;
              const bn = rectP(x0, y - 40 * u, x1, y);
              BN.push(inkLoop(bn, { seed: sd + 30 + r + side, t, smooth: false, amp: 0.5 })); BNR.push(inkPath(bn, { w: 4, seed: sd + 34 + r + side, t, closed: true, smooth: false }));
              for (let i = 0; i < 4; i++) {
                const lx = lerp(x0 + 30 * u, x1 - 30 * u, i / 3), ly = y - 40 * u - 4 * u * Math.sin(t * 1.2 + i + r), hr = 24 * u;
                LBd.push(inkLoop([[lx - 34 * u, y - 36 * u], [lx - 24 * u, ly - 60 * u], [lx + 24 * u, ly - 60 * u], [lx + 34 * u, y - 36 * u]], { seed: sd + 40 + i * 3 + r * 13 + side, t, amp: 0.6 }));
                LH_.push(inkCircle(lx, ly - 82 * u, hr, sd + 60 + i + r * 7 + side, t, { fill: true }));
                BNR.push(inkCircle(lx, ly - 82 * u, hr, sd + 70 + i + r * 7 + side, t, { w: 3.5 }));
              }
            }
            set(bench, BN.join(' ')); set(lordB, LBd.join(' ')); set(lordH, LH_.join(' ')); set(benchR, BNR.join(' '));
            set(chR, D.join(' '));
            // the floor slab between the chamber and the vault
            const sb = rectP(0, cB, W, vTop);
            set(slab, inkLoop(sb, { seed: sd + 80, t, smooth: false, amp: 0.5 }));
            set(slabR, inkPath([[0, cB], [W, cB]], { w: 6, seed: sd + 81, t }) + ' ' + inkPath([[0, vTop], [W, vTop]], { w: 5, seed: sd + 82, t }) + ' ' + blocksD(0, cB, W, vTop, 30 * u, 120 * u, sd + 83, t));
          }
          // ---- vault: back wall with blocks + arches
          set(wall, inkLoop(rectP(-20, vTop, W + 20, gy), { seed: sd + 100, t, smooth: false, amp: 0.4 }));
          set(wallR, blocksD(-20, vTop, W + 20, gy, (below ? 34 : 56) * u, (below ? 90 : 140) * u, sd + 101, t));
          const nA = below ? 3 : 2, AR = [], AF = [];
          for (let i = 0; i < nA; i++) {
            const x0 = i / nA * W, x1 = (i + 1) / nA * W, cx = (x0 + x1) / 2, r = (x1 - x0) / 2, spring_ = vTop + (below ? 60 : 300) * u;
            const ap = []; for (let k = 0; k <= 12; k++) { const a = Math.PI - k / 12 * Math.PI; ap.push([cx + Math.cos(a) * r * 0.94, spring_ - Math.sin(a) * (spring_ - vTop) * 0.92]); }
            AR.push(inkPath(ap, { w: 7, seed: sd + 110 + i, t }));
            const band = ap.concat([[x1 + 4, vTop - 4], [x0 - 4, vTop - 4]]);
            AF.push(inkLoop(band, { seed: sd + 120 + i, t, amp: 0.4 }));
            // pillar between arches
            if (i > 0) { const pl = rectP(x0 - 34 * u, spring_ - 20 * u, x0 + 34 * u, gy); AF.push(inkLoop(pl, { seed: sd + 130 + i, t, smooth: false, amp: 0.4 })); AR.push(inkPath(pl, { w: 5, seed: sd + 135 + i, t, closed: true, smooth: false })); }
          }
          set(arches, AF.join(' ')); set(archR, AR.join(' '));
          // ---- figures + lanterns (dark): positions first (light pools behind the barrels)
          const figs = FIG.map(f => f.update(lt, t, cues));
          lanF.begin(); lanRf.begin(); lanFl.begin(); lanL.begin();
          const G = [];
          figs.forEach((f, i) => {
            if (!P.figures[i].lantern) return;
            const ln = lanternD(f.hand[0], f.hand[1], 1.0 * u * ((P.figures[i].scale ?? 0.8) / 0.8), sd + 500 + i * 11, t);
            lanF.add(ln.glass); lanRf.add(ln.roofF); lanFl.add(ln.flame); lanL.add(ln.line);
            const fl = 1 + 0.05 * Math.sin(t * 7 + i);
            G.push(inkCircle(ln.c[0], ln.c[1], 210 * u * fl, sd + 520 + i, t, { fill: true, ry: 190 * u * fl }));
          });
          lanF.end(); lanRf.end(); lanFl.end(); lanL.end();
          set(glow, G.join(' '));
          // ---- the 36 barrels
          BP.begin();
          let shown = 0;
          ST.forEach((b, j) => {
            const order = (STACK.length - 1 - b.r) * 10 + b.i;      // front row first so the count builds up the pile
            const idx = [8, 9, 9, 10].slice(0, STACK.length - 1 - b.r).reduce((a, c) => a + c, 0) + b.i;
            const a = mode === 'count' ? atOr(cues, BR.at, 0.15) + idx * BR.step : -1;
            if (lt < a) return;
            shown++;
            const k = mode === 'count' ? spring(lt, a, 0.35) : 1;
            const wob = 1 + hit * 0.06;
            const d = barrelD(b.x, b.y, b.w * k * wob, b.h * k * wob, sd + 600 + j * 7 + order * 0, t);
            BP.add(d);
          });
          BP.end();
          // firewood bundles laid on top of the pile
          if (P.wood !== false && mode !== 'count') {
            const WD = [], WR = [], topY = gy - 150 * bs - 92 * bs * 0.7 * 1.3;
            for (let i = 0; i < 7; i++) {
              const cx = W / 2 + (i - 3) * span * 0.13, y = topY + 10 * bs + hn(sd, i) * 14 * bs, len = 150 * bs, th = 34 * bs;
              const bd = [[cx - len / 2, y], [cx + len / 2, y - 6 * bs], [cx + len / 2, y + th - 6 * bs], [cx - len / 2, y + th]];
              WD.push(inkLoop(bd, { seed: sd + 700 + i, t, amp: 0.6 }));
              WR.push(inkPath(bd, { w: 3.5, seed: sd + 710 + i, t, closed: true, amp: 0.6 }));
              for (let k = 1; k < 3; k++) WR.push(inkPath([[cx - len / 2, y + th * k / 3], [cx + len / 2, y - 6 * bs + th * k / 3]], { w: 2, seed: sd + 720 + i * 3 + k, t, amp: 0.5 }));
              WR.push(inkPath([[cx - 10 * bs, y - 4 * bs], [cx - 6 * bs, y + th + 2 * bs]], { w: 4, seed: sd + 740 + i, t }));
            }
            set(wood, WD.join(' ')); set(woodR, WR.join(' '));
          }
          // ---- floor: flagstones in perspective down to the frame bottom + big barrels cropped in front
          set(floor, inkLoop(rectP(-20, gy, W + 20, H + 20), { seed: sd + 800, t, smooth: false, amp: 0.4 }));
          const FL = [inkPath([[-20, gy], [W + 20, gy]], { w: 6, seed: sd + 801, t })];
          for (let i = 1; i < 9; i++) { const y = gy + (H - gy) * Math.pow(i / 9, 1.5); FL.push(inkPath([[-20, y], [W + 20, y]], { w: 2.5, seed: sd + 810 + i, t, amp: 0.6 })); }
          for (let i = -6; i <= 6; i++) FL.push(inkPath([[W / 2 + i * W * 0.09, gy], [W / 2 + i * W * 0.32, H + 20]], { w: 2.2, seed: sd + 830 + i, t, amp: 0.6 }));
          set(floorR, FL.join(' '));
          FGP.begin();
          if (P.front !== false) {
            const fs = [[0.04, 1.0, 1.15], [0.2, 1.06, 0.95], [0.86, 1.02, 1.1]].map(([x, y, k]) => [x * W, Math.min(H + 80 * u, gy + (H - gy) * y), k]);
            fs.forEach(([x, y, k], i) => { const d = barrelD(x, y + 60 * u, 300 * u * k, 400 * u * k, sd + 900 + i * 9, t); FGP.add(d); });
          }
          FGP.end();
          // ---- arrow from the powder up to the throne
          if (P.arrow) {
            const a = atOr(cues, P.arrow.at, 0.6), p = clamp01((lt - a) / 0.8);
            if (p > 0) {
              const y0 = gy - 270 * bs, y1 = 0.4 * H - 110 * u, D = [];
              const n = 7; for (let i = 0; i < n; i++) { const q0 = i / n, q1 = q0 + 0.55 / n; if (q0 > p) break; D.push(inkPath([[W / 2, lerp(y0, y1, q0)], [W / 2, lerp(y0, y1, Math.min(p, q1))]], { w: 9, seed: sd + 950 + i, t })); }
              if (p >= 1) D.push(inkPath([[W / 2 - 30 * u, y1 + 36 * u], [W / 2, y1], [W / 2 + 30 * u, y1 + 36 * u]], { w: 9, seed: sd + 960, t }));
              set(arrow, D.join(' '));
            }
          }
          // ---- counter card
          if (CT) {
            const a = atOr(cues, CT.at, 0.2), p = clamp01((lt - a) / CT.dur);
            if (lt >= a) {
              const k = spring(lt, a, 0.5), n = Math.max(1, Math.round(CT.to * sm(p))), y = CT.y * H, txt = `${n}${CT.suffix}`;
              cardT.textContent = txt; cardT.setAttribute('x', W / 2); cardT.setAttribute('y', y + 36 * u);
              const w = 330 * u + txt.length * 14 * u, bx = rectP(W / 2 - w, y - 70 * u, W / 2 + w, y + 70 * u);
              set(card, inkLoop(bx, { seed: sd + 980, t, smooth: false, amp: 1 })); set(cardR, inkPath(bx, { w: 6, seed: sd + 981, t, closed: true, smooth: false }));
              cardG.setAttribute('transform', `translate(${W / 2} ${y}) rotate(-3) scale(${f1(k * (1 + 0.1 * punch(lt, a + CT.dur, 0.6)) * 100) / 100}) translate(${-W / 2} ${-y})`);
            } else cardG.setAttribute('transform', 'scale(0)');
          } else cardG.setAttribute('transform', 'scale(0)');
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== SHOTS.gp_street
  // gp_street — the londonfire "street" (half-timbered houses, cast, label) at night, with no fire, plus a cobbled
  // street in front down to the frame bottom: cobbles in perspective, a puddle with gold window reflections and a lamp
  // post with a glowing lantern at one edge. P: londonfire P + {lamp: "left"|"right"|false}
  SH.gp_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const P2 = Object.assign({ mode: 'street', bakery: -1, fire: { start: 0, at: 999, only: true } }, P);
      const inner = SH.londonfire.build(Object.assign({}, ctx, { P: P2 }));
      const sd = seed * 1000 + 733, u = W / 1080, gy = (P.ground ?? 0.585) * H;
      const root = el(svg, 'g');
      const road = inkEl(root, NIGHT3()), cob = inkEl(root, mix(NIGHT3(), INK.paperDark, 0.25)), cobR = inkEl(root, INK.ink);
      const pud = inkEl(root, mix(INK.blue, INK.ink, 0.35)), pudG = inkEl(root, INK.gold, { 'fill-opacity': 0.75 });
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.22 }), post = inkEl(root, INK.ink);
      const lg = el(root, 'g'), lanF = inkEl(lg, mix(INK.gold, INK.paperLight, 0.4)), lanFl = inkEl(lg, INK.red), lanL = inkEl(lg, INK.ink);
      const CARDS = labels(root, P.cards, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          inner.update(lt, dur, cues, env);
          const t = env.t ?? lt, top = gy + 30 * u;
          set(road, inkLoop(rectP(-20, top, W + 20, H + 20), { seed: sd, t, smooth: false, amp: 0.4 }));
          const C = [], R = [inkPath([[-20, top], [W + 20, top]], { w: 5, seed: sd + 1, t })];
          for (let r = 0, y = top + 20 * u; y < H + 40; r++) {
            const sz = (30 + (y - top) * 0.16) * u;
            for (let x = (r % 2) * sz * 0.6 - sz; x < W + sz; x += sz * 1.25) {
              const pts = inkEllipsePts(x, y, sz * 0.52, sz * 0.24, sd + r * 37 + Math.round(x), 8);
              C.push(inkLoop(pts, { seed: sd + r * 37 + Math.round(x), t, amp: 0.5 }));
            }
            y += sz * 0.62;
          }
          set(cob, C.join(' ')); set(cobR, R.join(' '));
          const px = 0.5 * W, py = H - 330 * u, pr = 300 * u;
          set(pud, inkCircle(px, py, pr, sd + 5, t, { fill: true, ry: 80 * u, n: 16 }));
          const RF = []; [0.3, 0.45, 0.6].forEach((x, i) => { for (let k = 0; k < 3; k++) { const wv = Math.sin(t * 2 + i + k) * 10 * u; RF.push(inkLoop(rectP(x * W + wv - 18 * u, py - 50 * u + k * 34 * u, x * W + wv + 18 * u, py - 38 * u + k * 34 * u), { seed: sd + 20 + i * 5 + k, t, smooth: false, amp: 0.4 })); } });
          set(pudG, RF.join(' '));
          if (P.lamp !== false) {
            const lx = (P.lamp === 'right' ? 0.92 : 0.08) * W, ly = top - 40 * u, ht = 760 * u;
            set(post, inkPath([[lx, H + 20], [lx, ly - ht]], { w: 16 * u, seed: sd + 40, t, taper: 0 }) + ' ' + inkPath([[lx, ly - ht], [lx + (P.lamp === 'right' ? -70 : 70) * u, ly - ht]], { w: 9 * u, seed: sd + 41, t }));
            const ln = lanternD(lx + (P.lamp === 'right' ? -70 : 70) * u, ly - ht, 1.8 * u, sd + 50, t);
            set(lanF, ln.glass); set(lanFl, ln.flame); set(lanL, ln.line);
            set(glow, inkCircle(ln.c[0], ln.c[1], 260 * u * (1 + 0.04 * Math.sin(t * 6)), sd + 60, t, { fill: true }));
          }
          CARDS.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== SHOTS.gp_throne
  SH.gp_throne = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 613, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const wall = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.45)), wallR = inkEl(root, INK.inkSoft);
      const winF = inkEl(root, mix(INK.gold, INK.paperLight, 0.4)), winR = inkEl(root, INK.ink);
      const beams = inkEl(root, WOOD_D());
      const cloth = inkEl(root, INK.red), clothR = inkEl(root, INK.ink), fringe = inkEl(root, INK.gold);
      const thF = inkEl(root, INK.gold), thR = inkEl(root, INK.ink), thC = inkEl(root, INK.red);
      const robe = inkEl(root, INK.red), robeR = inkEl(root, INK.ink), ermine = inkEl(root, INK.paperLight);
      const kingG = el(root, 'g');
      const king = KASIF.create(kingG, { scale: 0.95 * u, hat: false, accessory: 'crown', beard: 'short', seed: sd + 3 });
      const bench = inkEl(root, INK.red), benchR = inkEl(root, INK.ink), lordB = inkEl(root, mix(INK.blue, INK.ink, 0.35)), lordH = inkEl(root, mix(INK.paperDark, INK.stain, 0.2));
      const floorF = inkEl(root, mix(INK.paperDark, INK.stain, 0.4)), floorR = inkEl(root, INK.ink);
      const slab = inkEl(root, STONE_D()), cellar = inkEl(root, mix(INK.inkSoft, INK.ink, 0.55)), slabR = inkEl(root, INK.ink);
      const BP = bpool(el(root, 'g'), WOOD_D(), mix(WOOD_D(), INK.paperDark, 0.3));
      const ring = inkEl(root, INK.red);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const top = 0.12 * H, cx = W / 2;
          set(wall, inkLoop(rectP(-20, top - 300, W + 20, gy), { seed: sd + 1, t, smooth: false, amp: 0.4 }));
          set(wallR, blocksD(-20, top, W + 20, gy, 60 * u, 160 * u, sd + 2, t));
          const WF = [], WR = [];
          [0.12, 0.88].forEach((x, i) => { const p = archWin(x * W, top + 120 * u, 140 * u, 420 * u); WF.push(inkLoop(p, { seed: sd + 10 + i, t, amp: 0.4 })); WR.push(inkPath(p, { w: 5, seed: sd + 12 + i, t, closed: true, amp: 0.4 }), inkPath([[x * W, top + 150 * u], [x * W, top + 540 * u]], { w: 3, seed: sd + 14 + i, t }), inkPath([[x * W - 70 * u, top + 360 * u], [x * W + 70 * u, top + 360 * u]], { w: 3, seed: sd + 16 + i, t })); });
          set(winF, WF.join(' ')); set(winR, WR.join(' '));
          set(beams, [0, 1, 2].map(i => inkLoop(rectP(-20, top - 300 + i * 120 * u, W + 20, top - 270 + i * 120 * u), { seed: sd + 20 + i, t, smooth: false, amp: 0.5 })).join(' '));
          // cloth of estate behind the throne, swaying slightly
          const sw = Math.sin(t * 0.8) * 6 * u;
          const cl = [[cx - 230 * u, top + 40 * u], [cx + 230 * u, top + 40 * u], [cx + 220 * u + sw, gy - 120 * u], [cx - 220 * u + sw, gy - 120 * u]];
          set(cloth, inkLoop(cl, { seed: sd + 30, t, smooth: false, amp: 0.6 }));
          const FR = []; for (let i = 0; i < 12; i++) { const x = lerp(cx - 220 * u, cx + 220 * u, i / 11) + sw; FR.push(inkLoop(rectP(x - 9 * u, gy - 122 * u, x + 9 * u, gy - 92 * u), { seed: sd + 40 + i, t, smooth: false, amp: 0.4 })); }
          FR.push(inkLoop(rectP(cx - 250 * u, top + 10 * u, cx + 250 * u, top + 60 * u), { seed: sd + 55, t, smooth: false, amp: 0.4 }));
          set(fringe, FR.join(' '));
          set(clothR, inkPath(cl, { w: 5, seed: sd + 31, t, closed: true, smooth: false }) + ' ' + inkPath([[cx - 150 * u, top + 160 * u], [cx, top + 120 * u], [cx + 150 * u, top + 160 * u]], { w: 3, seed: sd + 32, t }));
          // throne
          const th = [[cx - 150 * u, gy], [cx - 150 * u, gy - 330 * u], [cx - 120 * u, gy - 560 * u], [cx - 60 * u, gy - 610 * u], [cx + 60 * u, gy - 610 * u], [cx + 120 * u, gy - 560 * u], [cx + 150 * u, gy - 330 * u], [cx + 150 * u, gy]];
          set(thF, inkLoop(th, { seed: sd + 60, t, smooth: false, amp: 0.5 }));
          set(thC, inkLoop(rectP(cx - 100 * u, gy - 540 * u, cx + 100 * u, gy - 250 * u), { seed: sd + 61, t, smooth: false, amp: 0.4 }));
          set(thR, inkPath(th, { w: 6, seed: sd + 62, t, closed: true, smooth: false }) + ' ' + inkPath(rectP(cx - 100 * u, gy - 540 * u, cx + 100 * u, gy - 250 * u), { w: 4, seed: sd + 63, t, closed: true, smooth: false }) + ' ' +
            inkPath([[cx - 170 * u, gy - 230 * u], [cx + 170 * u, gy - 230 * u]], { w: 7, seed: sd + 64, t }));
          // the king, seated, facing the viewer's right; robe over his shoulders
          const kx = cx - 20 * u, ky = gy - 40 * u;
          const r = king.update(t, P.king_pose || 'idle', { x: kx, y: ky, face: 1, since: lt, emotion: lt > atOr(cues, P.target, 99) + 0.2 ? 'worried' : 'neutral' });
          const sk = 0.95 * u, hc = r && r.head ? [kx + r.head[0] * sk, ky + r.head[1] * sk] : [kx, ky - 400 * u];
          const rb = [[hc[0] - 70 * u, hc[1] + 80 * u], [hc[0] + 60 * u, hc[1] + 80 * u], [hc[0] + 110 * u, ky - 150 * u], [hc[0] - 120 * u, ky - 150 * u]];
          set(robe, inkLoop(rb, { seed: sd + 70, t, amp: 0.6 }));
          set(robeR, inkPath(rb, { w: 5, seed: sd + 71, t, closed: true, amp: 0.6 }));
          set(ermine, inkLoop([[hc[0] - 74 * u, hc[1] + 78 * u], [hc[0] + 64 * u, hc[1] + 78 * u], [hc[0] + 50 * u, hc[1] + 110 * u], [hc[0] - 60 * u, hc[1] + 110 * u]], { seed: sd + 72, t, amp: 0.5 }));
          // benches with lords in the foreground corners
          const BN = [], BNR = [], LBd = [], LHd = [];
          for (const side of [-1, 1]) {
            const x0 = side < 0 ? -40 : W - 300 * u, x1 = side < 0 ? 300 * u : W + 40, y = gy + 10 * u;
            const bn = rectP(x0, y - 70 * u, x1, y);
            BN.push(inkLoop(bn, { seed: sd + 80 + side, t, smooth: false, amp: 0.5 })); BNR.push(inkPath(bn, { w: 5, seed: sd + 82 + side, t, closed: true, smooth: false }));
            for (let i = 0; i < 2; i++) {
              const lx = lerp(x0 + 90 * u, x1 - 90 * u, i), ly = y - 70 * u - 4 * u * Math.sin(t * 1.3 + i + side), hr = 46 * u;
              LBd.push(inkLoop([[lx - 70 * u, y - 66 * u], [lx - 50 * u, ly - 120 * u], [lx + 50 * u, ly - 120 * u], [lx + 70 * u, y - 66 * u]], { seed: sd + 90 + i * 5 + side, t, amp: 0.6 }));
              const hx = lx + Math.sin(t * 0.7 + i) * 4 * u;
              LHd.push(inkCircle(hx, ly - 160 * u, hr, sd + 100 + i + side * 3, t, { fill: true }));
              BNR.push(inkCircle(hx, ly - 160 * u, hr, sd + 110 + i + side * 3, t, { w: 4.5 }));
            }
          }
          set(bench, BN.join(' ')); set(benchR, BNR.join(' ')); set(lordB, LBd.join(' ')); set(lordH, LHd.join(' '));
          // floor, slab and the cellar strip with barrels right under the throne
          const sT = gy + 10 * u, sB = gy + 80 * u;
          set(floorF, inkLoop(rectP(-20, gy, W + 20, sT), { seed: sd + 120, t, smooth: false, amp: 0.4 }));
          set(slab, inkLoop(rectP(-20, sT, W + 20, sB), { seed: sd + 121, t, smooth: false, amp: 0.4 }));
          set(cellar, inkLoop(rectP(-20, sB, W + 20, H + 20), { seed: sd + 122, t, smooth: false, amp: 0.4 }));
          set(slabR, inkPath([[-20, gy], [W + 20, gy]], { w: 6, seed: sd + 123, t }) + ' ' + blocksD(-20, sT, W + 20, sB, 35 * u, 110 * u, sd + 124, t) + ' ' + blocksD(-20, sB, W + 20, H + 20, 90 * u, 220 * u, sd + 126, t));
          BP.begin();
          const rows = [[7, H - 300 * u, 1.35], [6, H + 40 * u, 1.7]];
          rows.forEach(([n, y, k], r_) => { for (let i = 0; i < n; i++) { const x = (i + 0.5 + (r_ ? 0 : 0.0)) / n * W, w = 120 * u * k; const d = barrelD(x, y, w, w * 1.3, sd + 200 + r_ * 20 + i * 3, t); BP.add(d); } });
          BP.end();
          // target ring closing on the king
          const ta = atOr(cues, P.target, null);
          if (ta != null && lt >= ta) {
            const p = sm((lt - ta) / 0.6), rr = lerp(520, 230, p) * u, c0 = [hc[0] + 10 * u, hc[1] + 120 * u];
            set(ring, inkCircle(c0[0], c0[1], rr, sd + 300, t, { w: 9, ry: rr * 1.15 }) + ' ' +
              inkPath([[c0[0] - rr - 50 * u, c0[1]], [c0[0] - rr + 60 * u, c0[1]]], { w: 8, seed: sd + 301, t }) + ' ' + inkPath([[c0[0] + rr - 60 * u, c0[1]], [c0[0] + rr + 50 * u, c0[1]]], { w: 8, seed: sd + 302, t }));
          } else set(ring, '');
          // keep the labels on top
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== SHOTS.gp_bonfire
  SH.gp_bonfire = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 877, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.62) * H;
      const fwG = el(root, 'g'), fwL = { gold: pool(fwG, INK.gold), red: pool(fwG, INK.red), blue: pool(fwG, mix(INK.blue, INK.paperLight, 0.3)), paper: pool(fwG, INK.paperLight) };
      const sky = inkEl(root, NIGHT2()), skyR = inkEl(root, INK.ink), skyW = inkEl(root, INK.gold);
      const green = inkEl(root, mix(INK.green, INK.ink, 0.45)), greenR = inkEl(root, INK.ink);
      const smoke = inkEl(root, NIGHT3(), { 'fill-opacity': 0.5 });
      const halo = inkEl(root, INK.gold, { 'fill-opacity': 0.2 });
      const logs = inkEl(root, WOOD_D()), logsR = inkEl(root, INK.ink);
      const fRed = inkEl(root, INK.red), fGold = inkEl(root, INK.gold), fCore = inkEl(root, INK.paperLight), fLine = inkEl(root, INK.ink);
      const sparks = inkEl(root, INK.gold);
      const kas = P.kasif ? L.kasif(el(root, 'g'), P.kasif, W, H, sd + 7) : null;
      const cB = inkEl(root, NIGHT2()), cH = inkEl(root, mix(INK.inkSoft, INK.stain, 0.3)), cHt = inkEl(root, mix(INK.blue, INK.inkSoft, 0.45)), cL = inkEl(root, INK.ink);
      const LB = labels(root, P.labels, W, H);
      const FI = Object.assign({ x: 0.5, s: 1, at: 0 }, P.fire || {});
      const FW = P.fireworks || [0, 1, 2, 3, 4, 5, 6, 7].map(i => ({ x: [0.25, 0.72, 0.5, 0.15, 0.85, 0.38, 0.62, 0.3][i], y: [0.2, 0.17, 0.26, 0.3, 0.27, 0.15, 0.22, 0.24][i], at: 0.1 + i * 0.9, col: ['gold', 'red', 'blue', 'gold', 'paper', 'red', 'gold', 'blue'][i], r: 0.8 + (i % 3) * 0.2 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // fireworks: rays expand from a centre, fade; a short rising trail first
          Object.values(fwL).forEach(p => p.begin());
          FW.forEach((f, i) => {
            const a = atOr(cues, f.at, 0.2), cyc = 3.2, local = lt - a;
            if (local < 0) return;
            const ph = local % cyc, rep = Math.floor(local / cyc), x = (f.x + (rep ? (hn(sd, i + rep) - 0.5) * 0.12 : 0)) * W, y = (f.y + (rep ? (hn(sd, i + rep + 9) - 0.5) * 0.05 : 0)) * H;
            const pl = fwL[f.col] || fwL.gold;
            if (ph < 0.5) { const q = ph / 0.5; pl.add(inkPath([[x, lerp(gy, y, q) + 60 * u], [x, lerp(gy, y, q)]], { w: 5, seed: sd + i * 7 + rep, t, amp: 0.4 })); return; }
            const q = (ph - 0.5) / 1.6; if (q > 1) return;
            const R = (f.r ?? 1) * 280 * u * sm(Math.min(1, q * 1.6)), n = 14, len = 70 * u * (1 - q * 0.6) + 10 * u, drop = q * q * 60 * u;
            const D = [];
            for (let k = 0; k < n; k++) { const an = k / n * 6.283 + i; const r0 = Math.max(0, R - len); D.push(inkPath([[x + Math.cos(an) * r0, y + Math.sin(an) * r0 + drop], [x + Math.cos(an) * R, y + Math.sin(an) * R + drop]], { w: 11 * (1 - q * 0.5), seed: sd + 100 + i * 31 + k, t, amp: 0.5 })); D.push(inkCircle(x + Math.cos(an) * R, y + Math.sin(an) * R + drop, 12 * u * (1 - q * 0.4), sd + 300 + k, t, { fill: true, n: 6 })); }
            pl.add(D.join(' '));
          });
          Object.values(fwL).forEach(p => p.end());
          // far London skyline: Parliament range + the Elizabeth Tower clock tower
          const sb = gy - 170 * u, S = [], SR = [], SW = [];
          const rng_ = rectP(-20, sb - 120 * u, W + 20, sb + 4);
          S.push(inkLoop(rng_, { seed: sd + 400, t, smooth: false, amp: 0.5 }));
          for (let i = 0; i < 14; i++) { const x = (i + 0.5) / 14 * W; const pn = [[x - 10 * u, sb - 120 * u], [x, sb - 160 * u - (i % 3) * 14 * u], [x + 10 * u, sb - 120 * u]]; S.push(inkLoop(pn, { seed: sd + 410 + i, t, smooth: false })); SW.push(inkLoop(rectP(x - 7 * u, sb - 90 * u, x + 7 * u, sb - 60 * u), { seed: sd + 430 + i, t, smooth: false, amp: 0.3 })); }
          const bx = 0.82 * W, tw = [[bx - 40 * u, sb], [bx - 40 * u, sb - 380 * u], [bx - 50 * u, sb - 390 * u], [bx - 50 * u, sb - 450 * u], [bx - 30 * u, sb - 470 * u], [bx, sb - 560 * u], [bx + 30 * u, sb - 470 * u], [bx + 50 * u, sb - 450 * u], [bx + 50 * u, sb - 390 * u], [bx + 40 * u, sb - 380 * u], [bx + 40 * u, sb]];
          S.push(inkLoop(tw, { seed: sd + 450, t, smooth: false, amp: 0.5 }));
          SR.push(inkPath(tw, { w: 4, seed: sd + 451, t, closed: true, smooth: false }), inkPath(rng_.slice(0, 2), { w: 3.5, seed: sd + 452, t }));
          SW.push(inkCircle(bx, sb - 420 * u, 26 * u, sd + 453, t, { fill: true }));
          SR.push(inkCircle(bx, sb - 420 * u, 26 * u, sd + 454, t, { w: 3 }));
          set(sky, S.join(' ')); set(skyR, SR.join(' ')); set(skyW, SW.join(' '));
          // the green
          const gp = [[-40, H + 40], [-40, sb + 10]]; for (let i = 0; i <= 8; i++) gp.push([-40 + i * (W + 80) / 8, sb + 10 + Math.sin(i * 1.3 + sd) * 10 * u]); gp.push([W + 40, H + 40]);
          set(green, inkLoop(gp, { seed: sd + 470, t, amp: 0.6 }));
          set(greenR, inkPath(gp.slice(1, -1), { w: 5, seed: sd + 471, t }));
          // bonfire
          const fx = FI.x * W, fs = FI.s * u, k = spring(lt, atOr(cues, FI.at, 0), 0.8);
          const SM = []; for (let i = 0; i < 6; i++) { const ph = (t * 0.18 + i / 6) % 1, sx = fx + Math.sin(ph * 5 + i) * 70 * fs + ph * 120 * fs, sy = gy - 380 * fs - ph * 700 * fs, r = (40 + ph * 80) * fs; SM.push(inkCircle(sx, sy, r, sd + 500 + i, t, { fill: true, n: 10 })); }
          set(smoke, SM.join(' '));
          set(halo, inkCircle(fx, gy - 200 * fs, 420 * fs * (1 + 0.04 * Math.sin(t * 6)), sd + 520, t, { fill: true, ry: 360 * fs }));
          const LG = [], LR = [];
          for (let i = 0; i < 7; i++) { const an = -0.9 + i * 0.3, x0 = fx + Math.cos(an + Math.PI / 2) * 0 - (i - 3) * 50 * fs, len = 300 * fs; const p0 = [x0 - Math.sin(an) * len * 0.5, gy + 10 * fs], p1 = [x0 + Math.sin(an) * len * 0.3, gy - 220 * fs + Math.abs(i - 3) * 30 * fs]; const lp = [[p0[0] - 14 * fs, p0[1]], [p1[0] - 12 * fs, p1[1]], [p1[0] + 12 * fs, p1[1]], [p0[0] + 14 * fs, p0[1]]]; LG.push(inkLoop(lp, { seed: sd + 540 + i, t, smooth: false, amp: 0.5 })); LR.push(inkPath(lp, { w: 4, seed: sd + 550 + i, t, closed: true, smooth: false })); }
          set(logs, LG.join(' ')); set(logsR, LR.join(' '));
          const FL = flamesD(fx, gy - 20 * fs, 420 * fs, 560 * fs * k, sd + 600, t);
          set(fRed, FL.red); set(fGold, FL.gold); set(fCore, FL.core); set(fLine, FL.line);
          const SP = []; for (let i = 0; i < 22; i++) { const ph = (t * (0.3 + hn(sd, i) * 0.4) + hn(sd, i + 5)) % 1, x = fx + (hn(sd, i + 9) - 0.5) * 360 * fs + Math.sin(t * 2 + i) * 30 * fs, y = gy - 300 * fs - ph * 900 * fs, r = (8 - ph * 5) * fs; SP.push(inkCircle(x, y, r, sd + 700 + i, t, { fill: true, n: 6 })); }
          set(sparks, k > 0.3 ? SP.join(' ') : '');
          if (kas) kas.update(lt, t, cues);
          if (P.crowd !== false) {
            const C = P.crowd || {}, cd = crowdD(W, H, C.n ?? 5, (C.y ?? 0.9) * H, (C.s ?? 1.1) * u, sd + 800, t);
            set(cB, cd.body); set(cH, cd.head); set(cHt, cd.hat); set(cL, cd.line);
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
