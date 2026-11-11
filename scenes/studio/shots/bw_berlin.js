// bw_berlin: shots for the Stickstory Short "The Berlin Wall went up overnight" (2026-11-11): in the early hours of
// Sunday 13 August 1961 East German soldiers and police rolled barbed wire across Berlin's streets; concrete slabs came
// from 15 August; on 15 June 1961 Walter Ulbricht had said "Nobody intends to build a wall"; the Wall stood 28 years.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any city-cut-by-a-border, street-clock,
// barbed-wire or press-conference moment. Uses bb__lib.js (BBL.cast), tank__lib.js (TKL.helmet, TKL.wire) and
// lh__lib.js (LH.kasif, LH.label). Sky/ground come from the scene's "set" (night/city/interior).
//
// Common: cast [BBL.cast entries + helmet: "stahl"|"cap", suitcase: true (a suitcase swinging at the side; drawn in the
//   helmet layer colour) (always give "who": a name; no who = Kaşif)],
//   labels [LH.label entries {text, x, y, at, size, color, font, card, rot}], kasif {x, y, scale, pose, face, dir,
//   emotion, seq} (LH.kasif), hit: cue name (punch; default "hit").
//
// SHOTS.bw_street — a Berlin street seen head-on: rows of five-storey apartment blocks left and right, a gap in the
//   middle with a far gate silhouette (columns + attic), a street lamp, cobbles, a near kerb and pavement filling the
//   bottom. A border line runs across the street at `ground`.
//   P: {mode: "wire"|"morning"|"slabs"|"wall"|"memorial", ground: 0.55 (border line, 0..1 H), gate: true,
//       lamp: {x: 0.12} | false, roll: cue|s (wire unrolls left -> right from it; default 0.2), roll_dur: 2.6,
//       wire: {h: 90}, lit: cue|s (windows light up one by one from it; "wire"/"morning"),
//       slabs: {placed: 4, drop: cue|s, x: 0.62} ("slabs": a crane lowers one more slab onto the line at `drop`),
//       tower: {x: 0.8} ("wall": watchtower with a sweeping searchlight), count: {from: 1961, to: 1989, at, dur: 2,
//       x: 0.5, y: 0.2, size: 170} (big rolling year), crowd: true | {y (head centres, 0..1 H), r: 70, n: 6} (heads and shoulders from behind along the bottom),
//       coil: {x: 0.78} (spare wire drum in the foreground), front: {y: 0.74, r: 80, roll: cue|s, dur: 3, start: 0.1,
//       end: 1} (a thick coil across the near pavement unrolling left -> right from a drum; pair with a cast entry
//       side: "front" walking with it), cast side: "far" (default, behind the line) | "near" | "front" (on the pavement), roses: true ("memorial": roses and candles at the foot),
//       cast, labels, kasif}
//   cues: roll, lit, drop, count.at, hit, labels/cast/kasif cues.
// SHOTS.bw_clock — close-up of a round street clock on a cast-iron post at night (a building corner with a few lit
//   windows behind, the lamp glow pulsing); the red second hand ticks, the minute hand creeps (speed x real time);
//   a line of barbed wire draws itself across the bottom from cue `roll`.
//   P: {from: [h, m, s], speed: 1, x: 0.5, y: 0.34, r: 0.28 (of W), wire: true, roll: cue|s, labels, kasif}
//   cues: roll, hit, labels.
// SHOTS.bw_coil — close-up of barbed wire at street level: concrete posts, barbed strands stretching post to post and
//   a coil unrolling along the cobbles behind a rolling drum (mode "roll"); mode "still": the coil lies still, a glint
//   slides along the barbs, the strands sway.
//   P: {mode: "roll"|"still", ground: 0.62, posts: [0.12, 0.5, 0.88], strands: 3, coil: {x0: -0.05, x1: 1.05, r: 120},
//       roll: cue|s, roll_dur: 3, start: 0 (fraction already unrolled at lt 0), near: true (front kerb, post stubs and a
//       big second coil along the bottom), cast, labels, kasif}
//   cues: roll, hit, labels, cast.
// SHOTS.bw_podium — a 1961 press conference: curtain wall, a long table with a cloth, microphones on stands, papers and a
//   water glass; the speaker (BBL.cast entry, seated behind the table; glasses: true) talks; reporters' heads and
//   shoulders fill the bottom, notebooks up; flash bulbs pop.
//   P: {speaker: {...cast entry, glasses: true, goatee: true}, flashes: true, burst: [[x, y], ...] (flash bulbs that go off
//       around the frame on `quote`), table: 0.55 (table top, 0..1 H), labels, cast}
//   cues: quote (a flash burst + punch), hit, labels.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const SERIF = 'Fraunces, Georgia, serif';
  const labelsOf = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const FACADE = () => mix(INK.paperDark, INK.inkSoft, 0.28), FACADE2 = () => mix(INK.paperDark, INK.stain, 0.35);
  const CONC = () => mix(INK.paperLight, INK.paperDark, 0.55), CONC_D = () => mix(INK.paperDark, INK.inkSoft, 0.35);
  const WIN_D = () => mix(INK.ink, INK.blue, 0.25), WIN_L = () => mix(INK.gold, INK.paperLight, 0.25);
  const IRON = () => mix(INK.ink, INK.green, 0.25);
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // helmets / caps / glasses on top of BBL.cast results
  function dressCast(P, cres, t, sd) {
    const T = window.TKL, F = [], I = [];
    (P || []).forEach((m, i) => {
      const q = cres[i]; if (!q) return;
      if (m.helmet && T) { const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + i * 20); F.push(h.fill); I.push(h.ink); }
      if (m.suitcase) { const k = q.s, cx = q.x + q.face * 34 * k, top = q.y - 190 * k + Math.abs(Math.sin(t * 9 + i)) * 6 * k, w = 96 * k, h = 70 * k;
        const b = [[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2, top + h], [cx - w / 2, top + h]];
        F.push(inkLoop(b, { seed: sd + 500 + i, t, smooth: false, amp: 0.5 }));
        I.push(inkPath(b, { seed: sd + 510 + i, t, w: 4, closed: true, smooth: false, amp: 0.5 }), inkPath([[cx - 14 * k, top], [cx - 12 * k, top - 16 * k], [cx + 12 * k, top - 16 * k], [cx + 14 * k, top]], { seed: sd + 520 + i, t, w: 4, amp: 0.4 }),
          inkPath([[cx - w / 2, top + h * 0.45], [cx + w / 2, top + h * 0.45]], { seed: sd + 530 + i, t, w: 2.5, amp: 0.4 })); }
      if (m.glasses) { const r = 13 * q.s / 0.6, gx = q.head[0] + q.face * 30 * q.s, gy = q.head[1] - 4 * q.s;
        I.push(inkCircle(gx - r * 1.1, gy, r, sd + 280 + i, t, { w: 3, n: 8 }), inkCircle(gx + r * 1.1, gy, r, sd + 281 + i, t, { w: 3, n: 8 })); }
    });
    return { fill: F.join(' '), ink: I.join(' ') };
  }

  // a big barbed-wire coil from x0 to x1 lying on gy (radius r): loops + barbs; drum at the end when rolling
  function coil(x0, x1, gy, r, sd, t, drum) {
    const L = [], B = [], D = [];
    const step = r * 0.42;
    for (let x = x0, k = 0; x < x1; x += step, k++) {
      const cx = x + step / 2, cy = gy - r * 0.95;
      L.push(inkPath(inkEllipsePts(cx, cy, r * 0.5, r * 0.95, sd + k, 10, 0.18, 0.08), { seed: sd + k, t, w: 3.4, closed: true, amp: 1 }));
      const a = (k * 1.7) % 6.28, bx = cx + Math.cos(a) * r * 0.5, by = cy + Math.sin(a) * r * 0.95, s = r * 0.12;
      B.push(inkPath([[bx - s, by - s], [bx + s, by + s]], { seed: sd + 300 + k, t, w: 3, amp: 0.5 }), inkPath([[bx - s, by + s], [bx + s, by - s]], { seed: sd + 400 + k, t, w: 3, amp: 0.5 }));
    }
    if (drum) {
      const cx = x1 + r * 0.3, cy = gy - r * 1.05;
      for (let j = 0; j < 5; j++) D.push(inkCircle(cx, cy, r * (1.05 - j * 0.17), sd + 500 + j, t, { w: j ? 3 : 5, n: 14 }));
      for (let j = 0; j < 6; j++) { const a = j + t * 0, bx = cx + Math.cos(a) * r * 0.9, by = cy + Math.sin(a) * r * 0.9, s = r * 0.1;
        B.push(inkPath([[bx - s, by - s], [bx + s, by + s]], { seed: sd + 600 + j, t, w: 3, amp: 0.5 })); }
    }
    return { loops: L.join(' '), barbs: B.join(' '), drum: D.join(' ') };
  }

  // one apartment block: facade, cornice, window grid; lit(i) -> 0..1
  function block(x, top, base, w, cols, rows, sd, t, lit, u) {
    const F = [], I = [], WD = [], WL = [];
    const fac = rect(x, top, w, base - top);
    F.push(inkLoop(fac, { seed: sd, t, smooth: false, amp: 0.6 }));
    I.push(inkPath(fac, { seed: sd + 1, t, w: 5, closed: true, smooth: false, amp: 0.8 }));
    I.push(inkPath([[x - 14 * u, top], [x + w + 14 * u, top]], { seed: sd + 2, t, w: 9, amp: 0.6 }));
    I.push(inkPath([[x, top + 22 * u], [x + w, top + 22 * u]], { seed: sd + 3, t, w: 3, amp: 0.6 }));
    const gx = w / cols, gyy = (base - top - 40 * u) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = x + c * gx + gx * 0.24, wy = top + 40 * u + r * gyy + gyy * 0.18, ww = gx * 0.52, wh = gyy * 0.6, idx = r * cols + c;
      const p = rect(wx, wy, ww, wh), L = lit(idx);
      (L > 0.5 ? WL : WD).push(inkLoop(p, { seed: sd + 10 + idx, t, smooth: false, amp: 0.5 }));
      I.push(inkPath(p, { seed: sd + 200 + idx, t, w: 3, closed: true, smooth: false, amp: 0.5 }),
        inkPath([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], { seed: sd + 400 + idx, t, w: 2, amp: 0.4 }),
        inkPath([[wx - 6 * u, wy + wh + 6 * u], [wx + ww + 6 * u, wy + wh + 6 * u]], { seed: sd + 600 + idx, t, w: 4, amp: 0.4 }));
    }
    return { F, I, WD, WL };
  }

  function gate(cx, base, h, sd, t, u) {      // far gate silhouette: six columns, an attic, a small sculpture on top
    const w = h * 1.5, F = [], I = [];
    const att = rect(cx - w / 2, base - h, w, h * 0.22);
    F.push(inkLoop(att, { seed: sd, t, smooth: false, amp: 0.5 }));
    for (let k = 0; k < 6; k++) { const x = cx - w / 2 + w * (0.04 + k * 0.184); F.push(inkLoop(rect(x, base - h * 0.78, w * 0.07, h * 0.78), { seed: sd + 1 + k, t, smooth: false, amp: 0.4 })); }
    F.push(inkLoop(rect(cx - w * 0.54, base - 6 * u, w * 1.08, 10 * u), { seed: sd + 9, t, smooth: false, amp: 0.4 }));
    F.push(inkLoop([[cx - h * 0.18, base - h], [cx - h * 0.12, base - h * 1.22], [cx + h * 0.02, base - h * 1.3], [cx + h * 0.16, base - h * 1.18], [cx + h * 0.2, base - h]], { seed: sd + 10, t, amp: 0.8 }));
    I.push(inkPath(att, { seed: sd + 11, t, w: 3, closed: true, smooth: false, amp: 0.5 }));
    return { F, I };
  }

  function lampPost(x, gy, h, sd, t, lt, u, on) {
    const I = [], G = [];
    I.push(inkPath([[x, gy], [x, gy - h]], { seed: sd, t, w: 12, amp: 0.6 }));
    I.push(inkPath([[x - 30 * u, gy], [x + 30 * u, gy]], { seed: sd + 1, t, w: 14, amp: 0.6 }));
    I.push(inkPath([[x, gy - h], [x + 70 * u, gy - h - 30 * u], [x + 120 * u, gy - h]], { seed: sd + 2, t, w: 8, amp: 0.6 }));
    const lx = x + 120 * u, ly = gy - h + 30 * u;
    const head = [[lx - 34 * u, ly - 30 * u], [lx + 34 * u, ly - 30 * u], [lx + 22 * u, ly + 20 * u], [lx - 22 * u, ly + 20 * u]];
    I.push(inkPath(head, { seed: sd + 3, t, w: 5, closed: true, smooth: false, amp: 0.5 }));
    if (on) { const fl = 1 + Math.sin(lt * 7) * 0.04 + Math.sin(lt * 17) * 0.02;
      G.push(inkCircle(lx, ly + 10 * u, 120 * u * fl, sd + 5, t, { fill: true }));
      G.push(inkLoop(head, { seed: sd + 6, t, smooth: false, amp: 0.4 })); }
    return { I: I.join(' '), G: G.join(' '), lamp: [lx, ly] };
  }

  // near pavement: kerb + paving slabs from y0 to the bottom (fills the lower third)
  function pavement(W, H, y0, sd, t, u) {
    const F = [], I = [];
    F.push(inkLoop([[-30, y0], [W + 30, y0], [W + 30, H + 30], [-30, H + 30]], { seed: sd, t, smooth: false, amp: 0.5 }));
    I.push(inkPath([[-20, y0], [W + 20, y0 + 4]], { seed: sd + 1, t, w: 8, amp: 0.6 }));
    I.push(inkPath([[-20, y0 + 34 * u], [W + 20, y0 + 36 * u]], { seed: sd + 2, t, w: 4, amp: 0.6 }));
    for (let k = 0, y = y0 + 34 * u; y < H; k++) { const h = (70 + k * 28) * u; y += h;
      I.push(inkPath([[-20, y], [W + 20, y + 3]], { seed: sd + 10 + k, t, w: 3, amp: 0.6 }));
      for (let x = -40 + (k % 2) * 90 * u; x < W + 40; x += (180 + k * 40) * u) I.push(inkPath([[x, y - h + 4], [x - (x - W / 2) * 0.08, y]], { seed: sd + 50 + k * 13 + Math.round(x), t, w: 2.5, amp: 0.5 })); }
    return { F: F.join(' '), I: I.join(' ') };
  }

  // street cobbles between y0 and y1 (perspective rows of little arcs)
  function cobbles(W, y0, y1, sd, t, u) {
    const I = [];
    for (let y = y0 + 14 * u, row = 0; y < y1; row++) { const s = (22 + (y - y0) * 0.12) * u;
      for (let x = (row % 2) * s * 0.6 - 20; x < W + 20; x += s * 1.2) I.push(inkPath([[x - s * 0.4, y], [x, y - s * 0.22], [x + s * 0.4, y]], { seed: sd + row * 97 + Math.round(x), t, w: 2, amp: 0.4 }));
      y += s * 0.55; }
    return I.join(' ');
  }

  // =================================================================== bw_street
  SH.bw_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811, u = W / 1080, mode = P.mode || 'wire';
      const gy = (P.ground ?? 0.55) * H, curbY = gy + 300 * u;
      const night = mode === 'wire';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = {
        beam: L(INK.gold, { 'fill-opacity': 0.22 }),
        gateF: L(mix(INK.inkSoft, INK.blue, 0.3)), gateI: L(INK.ink),
        facF: L(FACADE()), facF2: L(FACADE2()), winD: L(WIN_D()), winL: L(WIN_L()), facI: L(INK.ink),
        towF: L(CONC()), towI: L(INK.ink), towWin: L(WIN_L()),
        cobb: L(INK.inkSoft),
        farCastG: el(cam, 'g'), farHelmF: L(mix(INK.green, INK.inkSoft, 0.5)), farHelmI: L(INK.ink),
        slabF: L(CONC()), slabS: L(CONC_D(), { 'fill-opacity': 0.6 }), slabI: L(INK.ink),
        pipeF: L(CONC()), pipeI: L(INK.ink),
        wirePost: L(INK.ink), wireCoil: L(INK.ink),
        craneF: L(INK.gold), craneI: L(INK.ink), hookF: L(CONC()), hookI: L(INK.ink),
        roseL: L(mix(INK.green, INK.ink, 0.25)), roseF: L(INK.red), roseI: L(INK.ink), candF: L(INK.paperLight), candI: L(INK.ink), flame: L(INK.gold),
        nearCastG: el(cam, 'g'), nearHelmF: L(mix(INK.green, INK.inkSoft, 0.5)), nearHelmI: L(INK.ink),
        paveF: L(mix(INK.paperDark, INK.stain, 0.25)), paveI: L(INK.ink),
        glow: L(INK.gold, { 'fill-opacity': 0.3 }), lampI: L(IRON()),
        drumI: L(INK.ink), drumL: L(INK.ink), drumB: L(INK.ink),
        frontCastG: el(cam, 'g'), frontHelmF: L(mix(INK.green, INK.inkSoft, 0.5)), frontHelmI: L(INK.ink),
        fcL: L(INK.ink), fcB: L(INK.ink), fcD: L(INK.ink),
        crowdF: L(mix(INK.inkSoft, INK.ink, 0.35)), crowdI: L(INK.ink),
      };
      const frontList = (P.cast || []).filter(m => m.side === 'front');
      const frontCast = window.BBL.cast(lay.frontCastG, frontList, W, H, sd + 90);
      const farList = (P.cast || []).filter(m => (m.side || 'far') === 'far'), nearList = (P.cast || []).filter(m => m.side === 'near');
      const farCast = window.BBL.cast(lay.farCastG, farList, W, H, sd + 40);
      const nearCast = window.BBL.cast(lay.nearCastG, nearList, W, H, sd + 70);
      const cnt = P.count ? el(root, 'text', { 'font-family': SERIF, 'font-weight': 900, 'font-size': (P.count.size || 170) * u, fill: INK.red, stroke: INK.paperLight, 'stroke-width': 14 * u, 'paint-order': 'stroke', 'text-anchor': 'middle' }) : null;
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const labs = labelsOf(el(root, 'g'), P.labels, W, H);
      const blocksDef = [
        { x: -40 * u, w: 420 * u, top: gy - 640 * u, cols: 4, rows: 5, alt: false },
        { x: 690 * u, w: 430 * u, top: gy - 600 * u, cols: 4, rows: 5, alt: true },
      ];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1, w: 5 }, extra || {});
          const hit = punch(lt, at(P.hit || 'hit', null));
          cam.setAttribute('transform', `translate(${W / 2} ${gy}) scale(${1 + hit * 0.05}) translate(${-W / 2} ${-gy})`);
          // far gate in the middle gap
          if (P.gate !== false) { const g = gate(W * 0.53, gy - 70 * u, 190 * u, sd + 900, t, u);
            lay.gateF.setAttribute('d', g.F.join(' ')); lay.gateI.setAttribute('d', g.I.join(' ')); }
          // apartment blocks; windows light up one by one from `lit`
          const litA = at(P.lit, null), FF = [], FF2 = [], FI = [], WD = [], WL = [];
          blocksDef.forEach((b, bi) => {
            const res = block(b.x, b.top, gy - 30 * u, b.w, b.cols, b.rows, sd + 100 + bi * 1000, t, idx => {
              const h = hn(idx + bi * 31, 3);
              if (!night && mode !== 'morning') return h < 0.12 ? 1 : 0;
              const base = h < (night ? 0.12 : 0.3) ? 1 : 0;
              if (litA == null) return base;
              return base || (lt > litA + h * 2.4 && h < 0.7) ? 1 : 0;
            }, u);
            (b.alt ? FF2 : FF).push(...res.F); FI.push(...res.I); WD.push(...res.WD); WL.push(...res.WL);
          });
          lay.facF.setAttribute('d', FF.join(' ')); lay.facF2.setAttribute('d', FF2.join(' ')); lay.facI.setAttribute('d', FI.join(' '));
          lay.winD.setAttribute('d', WD.join(' ')); lay.winL.setAttribute('d', WL.join(' '));
          lay.cobb.setAttribute('d', cobbles(W, gy, curbY, sd + 1300, t, u));
          // far cast (behind the line)
          const fr = farCast.update(lt, t, cues), fd = dressCast(farList, fr, t, sd + 1400);
          lay.farHelmF.setAttribute('d', fd.fill); lay.farHelmI.setAttribute('d', fd.ink);
          // the border line itself
          const SF = [], SS = [], SI = [], PF = [], PI = [];
          const slab = (x, w, h, k, y = gy) => { const p = rect(x, y - h, w, h); SF.push(inkLoop(p, o(1500 + k, { smooth: false, amp: 0.6 })));
            SI.push(inkPath(p, o(1600 + k, { closed: true, smooth: false, w: 5 })));
            SS.push(inkLoop(rect(x + w * 0.62, y - h, w * 0.38, h), o(1700 + k, { smooth: false, amp: 0.5 })));
            SI.push(inkPath([[x + w * 0.3, y - h * 0.7], [x + w * 0.38, y - h * 0.55], [x + w * 0.33, y - h * 0.4]], o(1800 + k, { w: 2.2 }))); };
          let wireP = '', wireC = '';
          if (mode === 'wire' || mode === 'morning' || mode === 'slabs') {
            const r0 = at(P.roll, 0.2), rd = P.roll_dur ?? 2.6;
            const pr = mode === 'wire' ? progIO(lt, r0, rd) : 1;
            const x0 = -0.05 * W, x1 = lerp(x0, 1.05 * W, pr), hW = (P.wire && P.wire.h || 90) * u;
            if (x1 > x0 + 10 && window.TKL) { const w = window.TKL.wire(x0, x1, () => gy, t, sd + 1900, () => 0, { h: hW, gap: 150 * u }); wireP = w.posts; wireC = w.coil; }
            if (mode === 'wire' && pr > 0 && pr < 1) { const c = coil(x1 - 10, x1, gy, hW * 0.55, sd + 1950, t, true); wireC += ' ' + c.drum; }
          }
          lay.wirePost.setAttribute('d', wireP); lay.wireCoil.setAttribute('d', wireC);
          // slabs (and a crane lowering one)
          const CF = [], CI = [], HF = [], HI = [];
          if (mode === 'slabs') {
            const S = P.slabs || {}, n = S.placed ?? 4, sw = 150 * u, sh = 230 * u, dropX = (S.x ?? 0.62) * W;
            for (let k = 0; k < n; k++) slab(-30 * u + k * (sw + 6 * u), sw, sh, k);
            const dA = at(S.drop, 0.6), dp = progIO(lt, dA, 1.8), sway = Math.sin(lt * 1.6) * 14 * u * (1 - dp);
            const sy = lerp(gy - 620 * u, gy, dp), sx = dropX + sway;
            slab(sx - sw / 2, sw, sh, 40, sy);
            const jibY = gy - 1000 * u;
            CF.push(inkLoop([[W * 0.35, jibY - 14 * u], [W + 40, jibY - 30 * u], [W + 40, jibY + 20 * u], [W * 0.35, jibY + 14 * u]], o(2000, { smooth: false, amp: 0.6 })));
            CI.push(inkPath([[W * 0.35, jibY - 14 * u], [W + 40, jibY - 30 * u], [W + 40, jibY + 20 * u], [W * 0.35, jibY + 14 * u]], o(2001, { closed: true, smooth: false, w: 5 })));
            for (let k = 0; k < 7; k++) { const xa = W * 0.38 + k * 90 * u; CI.push(inkPath([[xa, jibY + 12 * u], [xa + 45 * u, jibY - 14 * u], [xa + 90 * u, jibY + 12 * u]], o(2010 + k, { w: 3, smooth: false }))); }
            CI.push(inkPath([[sx, jibY + 16 * u], [sx, sy - sh - 40 * u]], o(2030, { w: 3.5 })));
            CI.push(inkPath([[sx - sw * 0.4, sy - sh], [sx, sy - sh - 40 * u], [sx + sw * 0.4, sy - sh]], o(2031, { w: 3, smooth: false })));
            HI.push(inkCircle(sx, sy - sh - 40 * u, 12 * u, sd + 2032, t, { w: 5 }));
            if (dp >= 1) for (let k = 0; k < 4; k++) { const ag = lt - dA - 1.8; if (ag < 1.2) HF.push(inkCircle(sx + (k - 1.5) * 60 * u, gy - 10 * u - ag * 40 * u, (20 + ag * 40) * u, sd + 2040 + k, t, { fill: true })); }
          }
          // the grown wall (pipe on top) + watchtower + searchlight
          const BM = [], TF = [], TI = [], TW = [];
          if (mode === 'wall' || mode === 'memorial') {
            const mem = mode === 'memorial', sw = 120 * u, sh = 300 * u;
            const segs = mem ? [[0.12, 0.42], [0.58, 0.92]] : [[-0.05, 1.05]];
            segs.forEach(([a, b], si) => { for (let x = a * W, k = 0; x < b * W - 4; x += sw + 4 * u, k++) slab(x, Math.min(sw, b * W - x), sh, si * 40 + k);
              const pp = [[a * W - 6 * u, gy - sh - 34 * u], [b * W + 6 * u, gy - sh - 34 * u], [b * W + 6 * u, gy - sh + 4 * u], [a * W - 6 * u, gy - sh + 4 * u]];
              PF.push(inkLoop(pp, o(2100 + si, { amp: 0.6 }))); PI.push(inkPath(pp, o(2110 + si, { closed: true, w: 5 }))); });
            if (!mem && P.tower !== false) {
              const tx = ((P.tower && P.tower.x) ?? 0.8) * W, tb = gy - sh - 10 * u, th = 420 * u;
              const col = [[tx - 40 * u, tb], [tx + 40 * u, tb], [tx + 40 * u, tb - th], [tx - 40 * u, tb - th]];
              const cab = [[tx - 95 * u, tb - th], [tx + 95 * u, tb - th], [tx + 95 * u, tb - th - 150 * u], [tx - 95 * u, tb - th - 150 * u]];
              TF.push(inkLoop(col, o(2200, { smooth: false, amp: 0.5 })), inkLoop(cab, o(2201, { smooth: false, amp: 0.5 })));
              TI.push(inkPath(col, o(2202, { closed: true, smooth: false })), inkPath(cab, o(2203, { closed: true, smooth: false })),
                inkPath([[tx - 110 * u, tb - th - 150 * u], [tx + 110 * u, tb - th - 150 * u]], o(2204, { w: 9 })));
              TW.push(inkLoop(rect(tx - 80 * u, tb - th - 120 * u, 160 * u, 60 * u), o(2205, { smooth: false, amp: 0.4 })));
              const lx = tx, ly = tb - th - 168 * u, ang = Math.PI * (0.62 + 0.22 * Math.sin(lt * 0.9)), len = 1400 * u, spread = 0.08;
              BM.push(inkLoop([[lx, ly], [lx + Math.cos(ang - spread) * len, ly + Math.sin(ang - spread) * len * 0.6 + 600 * u], [lx + Math.cos(ang + spread) * len, ly + Math.sin(ang + spread) * len * 0.6 + 600 * u]], o(2210, { smooth: false, amp: 0.5 })));
              TI.push(inkCircle(lx, ly, 22 * u, sd + 2211, t, { w: 5 }));
            }
          }
          lay.slabF.setAttribute('d', SF.join(' ')); lay.slabS.setAttribute('d', SS.join(' ')); lay.slabI.setAttribute('d', SI.join(' '));
          lay.pipeF.setAttribute('d', PF.join(' ')); lay.pipeI.setAttribute('d', PI.join(' '));
          lay.craneF.setAttribute('d', CF.join(' ')); lay.craneI.setAttribute('d', CI.join(' ') + ' ' + HI.join(' ')); lay.hookF.setAttribute('d', HF.join(' '));
          lay.beam.setAttribute('d', BM.join(' ')); lay.towF.setAttribute('d', TF.join(' ')); lay.towI.setAttribute('d', TI.join(' ')); lay.towWin.setAttribute('d', TW.join(' '));
          // roses + candles at the foot of the memorial
          const RL = [], RF = [], RI = [], KF = [], KI = [], FL = [];
          if (mode === 'memorial' && P.roses !== false) {
            for (let k = 0; k < 9; k++) { const x = (0.14 + k * 0.095) * W + hn(k, 1) * 30 * u, y = gy + (20 + hn(k, 2) * 60) * u, sw2 = Math.sin(lt * 1.2 + k) * 6 * u;
              if (k % 3 === 1) { const c = rect(x - 18 * u, y - 70 * u, 36 * u, 70 * u); KF.push(inkLoop(c, o(2300 + k, { smooth: false, amp: 0.4 }))); KI.push(inkPath(c, o(2320 + k, { closed: true, smooth: false, w: 3.5 })));
                const f = 1 + Math.sin(lt * 11 + k * 2) * 0.15; FL.push(inkLoop([[x - 10 * u, y - 76 * u], [x + sw2 * 0.3, y - (76 + 44 * f) * u], [x + 10 * u, y - 76 * u], [x, y - 66 * u]], o(2340 + k, { amp: 0.6 }))); continue; }
              RL.push(inkPath([[x, y], [x + sw2 * 0.4, y - 60 * u], [x + sw2, y - 120 * u]], o(2360 + k, { w: 4 })));
              RF.push(inkCircle(x + sw2, y - 132 * u, 22 * u, sd + 2380 + k, t, { fill: true }));
              RI.push(inkCircle(x + sw2, y - 132 * u, 22 * u, sd + 2390 + k, t, { w: 3 }), inkPath([[x + sw2 - 10 * u, y - 136 * u], [x + sw2, y - 126 * u], [x + sw2 + 10 * u, y - 138 * u]], o(2400 + k, { w: 2.5 }))); }
          }
          lay.roseL.setAttribute('d', RL.join(' ')); lay.roseF.setAttribute('d', RF.join(' ')); lay.roseI.setAttribute('d', RI.join(' '));
          lay.candF.setAttribute('d', KF.join(' ')); lay.candI.setAttribute('d', KI.join(' ')); lay.flame.setAttribute('d', FL.join(' '));
          // near cast (in front of the line)
          const nr = nearCast.update(lt, t, cues), nd = dressCast(nearList, nr, t, sd + 2500);
          lay.nearHelmF.setAttribute('d', nd.fill); lay.nearHelmI.setAttribute('d', nd.ink);
          // near pavement + lamp + spare drum + crowd
          const pv = pavement(W, H, curbY, sd + 2600, t, u);
          lay.paveF.setAttribute('d', pv.F); lay.paveI.setAttribute('d', pv.I);
          if (P.lamp !== false) { const lp = lampPost(((P.lamp && P.lamp.x) ?? 0.1) * W, curbY + 260 * u, 900 * u, sd + 2700, t, lt, u, true);
            lay.lampI.setAttribute('d', lp.I); lay.glow.setAttribute('d', night || mode === 'wall' ? lp.G : ''); }
          if (P.coil) { const cx = (P.coil.x ?? 0.78) * W, cy = curbY + 330 * u; const c = coil(cx - 260 * u, cx + 120 * u, cy, 120 * u, sd + 2800, t, true);
            lay.drumL.setAttribute('d', c.loops); lay.drumB.setAttribute('d', c.barbs); lay.drumI.setAttribute('d', c.drum); }
          if (P.crowd) { const CF2 = [], CI2 = [];
            const CR = typeof P.crowd === 'object' ? P.crowd : {}, cn = CR.n ?? 6, cy0 = CR.y != null ? CR.y * H : null, cr0 = (CR.r ?? 70) * u;
            for (let k = 0; k < cn; k++) { const x = (0.08 + k * (0.85 / Math.max(1, cn - 1))) * W + hn(k, 4) * 40 * u, y = cy0 != null ? cy0 + hn(k, 5) * 70 * u : H - (150 + hn(k, 5) * 90) * u, bob = Math.sin(lt * 1.4 + k * 1.3) * 6 * u, r = cr0 + hn(k, 6) * 16 * u;
              const sh = [[x - r * 2, H + 40], [x - r * 1.6, y + r * 1.3 + bob], [x - r * 0.6, y + r * 0.9 + bob], [x + r * 0.6, y + r * 0.9 + bob], [x + r * 1.6, y + r * 1.3 + bob], [x + r * 2, H + 40]];
              CF2.push(inkLoop(sh, o(2900 + k, { amp: 0.8 })), inkCircle(x, y + bob, r, sd + 2920 + k, t, { fill: true }));
              CI2.push(inkPath(sh, o(2940 + k, { closed: true, w: 5 })), inkCircle(x, y + bob, r, sd + 2960 + k, t, { w: 5 })); }
            lay.crowdF.setAttribute('d', CF2.join(' ')); lay.crowdI.setAttribute('d', CI2.join(' ')); }
          // front coil across the whole width on the near pavement, unrolling from a drum (front: {y, r, roll, dur, start})
          const frs = frontCast.update(lt, t, cues), fdd = dressCast(frontList, frs, t, sd + 3100);
          lay.frontHelmF.setAttribute('d', fdd.fill); lay.frontHelmI.setAttribute('d', fdd.ink);
          if (P.front) { const Fr = P.front, fy = (Fr.y ?? 0.74) * H, fr = (Fr.r ?? 80) * u, fa = at(Fr.roll, 0.05), fp = lerp(Fr.start ?? 0.1, Fr.end ?? 1, progIO(lt, fa, Fr.dur ?? 3));
            const fx1 = lerp(-0.05 * W, 1.08 * W, fp), c = coil(-0.05 * W, fx1, fy, fr, sd + 3200, t, fp < 0.999);
            lay.fcL.setAttribute('d', c.loops); lay.fcB.setAttribute('d', c.barbs); lay.fcD.setAttribute('d', c.drum); }
          // rolling year
          if (cnt) { const C = P.count, a = at(C.at, 0.3), p = progIO(lt, a, C.dur ?? 2), v = Math.round(lerp(C.from ?? 1961, C.to ?? 1989, p));
            cnt.textContent = String(v); const s = spring(lt, a - 0.1, 0.7);
            cnt.setAttribute('transform', `translate(${(C.x ?? 0.5) * W} ${(C.y ?? 0.2) * H}) scale(${0.6 + 0.4 * s})`);
            cnt.setAttribute('opacity', lt < a - 0.1 ? 0 : 1); }
          if (kas) kas.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // =================================================================== bw_clock
  SH.bw_clock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 523, u = W / 1080;
      const cx = (P.x ?? 0.5) * W, cy = (P.y ?? 0.34) * H, R = (P.r ?? 0.28) * W, gy = H * 0.86;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = { bldF: L(FACADE()), winL: L(WIN_L()), winD: L(WIN_D()), bldI: L(INK.ink), glow: L(INK.gold, { 'fill-opacity': 0.28 }),
        post: L(IRON()), postI: L(INK.ink), rim: L(IRON()), face: L(INK.paperLight), ticks: L(INK.ink), hands: L(INK.ink), sec: L(INK.red),
        wireP: L(INK.ink), wireC: L(INK.ink), cob: L(INK.inkSoft), kerbF: L(mix(INK.paperDark, INK.stain, 0.25)), kerbI: L(INK.ink),
        fcL: L(INK.ink), fcB: L(INK.ink), fcD: L(INK.ink) };
      const numG = el(cam, 'g');
      const nums = Array.from({ length: 12 }, (_, i) => { const n = el(numG, 'text', { 'font-family': SERIF, 'font-weight': 900, 'font-size': R * 0.2, fill: INK.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' }); n.textContent = String(i === 0 ? 12 : i); return n; });
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const labs = labelsOf(el(root, 'g'), P.labels, W, H);
      const f = P.from || [1, 0, 0], T0 = f[0] * 3600 + (f[1] || 0) * 60 + (f[2] || 0);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1, w: 5 }, extra || {});
          const hit = punch(lt, at(P.hit || 'hit', null)), s0 = spring(lt, 0, 0.8);
          cam.setAttribute('transform', `translate(${cx} ${cy}) scale(${(0.94 + 0.06 * s0) * (1 + hit * 0.06)}) translate(${-cx} ${-cy})`);
          // building corner on the left, dark block on the right
          const BF = [], BI = [], WLs = [], WDs = [];
          [[-40 * u, 300 * u, H * 0.12], [W - 260 * u, 320 * u, H * 0.18]].forEach(([x, w, top], b) => {
            const p = rect(x, top, w, gy - top); BF.push(inkLoop(p, o(10 + b, { smooth: false, amp: 0.5 }))); BI.push(inkPath(p, o(20 + b, { closed: true, smooth: false })));
            for (let r = 0; r < 7; r++) for (let c = 0; c < 2; c++) { const wx = x + 50 * u + c * 130 * u, wy = top + 60 * u + r * 170 * u, wp = rect(wx, wy, 80 * u, 110 * u), idx = b * 20 + r * 2 + c;
              if (wy + 110 * u > gy) continue;
              const on = hn(idx, 7) < 0.25 || (hn(idx, 8) < 0.45 && lt > 0.6 + hn(idx, 9) * 2.5);
              (on ? WLs : WDs).push(inkLoop(wp, o(40 + idx, { smooth: false, amp: 0.4 }))); BI.push(inkPath(wp, o(100 + idx, { closed: true, smooth: false, w: 3 }))); } });
          lay.bldF.setAttribute('d', BF.join(' ')); lay.bldI.setAttribute('d', BI.join(' ')); lay.winL.setAttribute('d', WLs.join(' ')); lay.winD.setAttribute('d', WDs.join(' '));
          const fl = 1 + Math.sin(lt * 5) * 0.03 + Math.sin(lt * 13) * 0.015;
          lay.glow.setAttribute('d', inkCircle(cx, cy, R * 1.45 * fl, sd + 200, t, { fill: true }));
          // post + bracket
          const pp = [[cx - 22 * u, cy + R], [cx + 22 * u, cy + R], [cx + 34 * u, gy], [cx - 34 * u, gy]];
          lay.post.setAttribute('d', inkLoop(pp, o(210, { smooth: false, amp: 0.5 })) + ' ' + inkLoop(rect(cx - 60 * u, gy - 60 * u, 120 * u, 60 * u), o(211, { smooth: false, amp: 0.5 })));
          lay.postI.setAttribute('d', inkPath(pp, o(212, { closed: true, smooth: false })) + ' ' + inkPath([[cx - 50 * u, cy + R * 1.25], [cx + 50 * u, cy + R * 1.25]], o(213, { w: 8 })) +
            ' ' + inkPath([[cx, cy - R - 10 * u], [cx, cy - R - 70 * u]], o(214, { w: 10 })) + ' ' + inkCircle(cx, cy - R - 80 * u, 16 * u, sd + 215, t, { w: 6 }));
          // clock
          lay.rim.setAttribute('d', inkCircle(cx, cy, R, sd + 220, t, { fill: true }));
          lay.face.setAttribute('d', inkCircle(cx, cy, R * 0.86, sd + 221, t, { fill: true }));
          const TK = [inkCircle(cx, cy, R, sd + 222, t, { w: 7 }), inkCircle(cx, cy, R * 0.86, sd + 223, t, { w: 4 })];
          for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, r1 = R * 0.84, r2 = R * (k % 5 ? 0.79 : 0.74);
            TK.push(inkPath([[cx + Math.sin(a) * r1, cy - Math.cos(a) * r1], [cx + Math.sin(a) * r2, cy - Math.cos(a) * r2]], o(300 + k, { w: k % 5 ? 2.5 : 6, amp: 0.4 }))); }
          lay.ticks.setAttribute('d', TK.join(' '));
          nums.forEach((n, i) => { const a = i / 12 * Math.PI * 2, r = R * 0.6; n.setAttribute('x', cx + Math.sin(a) * r); n.setAttribute('y', cy - Math.cos(a) * r); });
          const T = T0 + lt * (P.speed ?? 1), sec = Math.floor(T % 60), mn = (T / 60) % 60, hr = (T / 3600) % 12;
          const hand = (a, len, w, k, back = 0.12) => inkPath([[cx - Math.sin(a) * R * back, cy + Math.cos(a) * R * back], [cx + Math.sin(a) * len, cy - Math.cos(a) * len]], o(k, { w, amp: 0.6, taper: 0.5 }));
          lay.hands.setAttribute('d', hand(hr / 12 * Math.PI * 2, R * 0.45, 16, 400) + ' ' + hand(mn / 60 * Math.PI * 2, R * 0.7, 11, 401) + ' ' + inkDot(cx, cy, 18 * u, 18 * u, sd + 402, t));
          const sa = (sec + Math.min(1, (T % 1) / 0.12) - 1 + 1) / 60 * Math.PI * 2;
          lay.sec.setAttribute('d', hand(sa, R * 0.78, 5, 403, 0.2) + ' ' + inkDot(cx, cy, 9 * u, 9 * u, sd + 404, t));
          // cobbles + barbed wire drawing across the bottom
          lay.cob.setAttribute('d', cobbles(W, gy, H, sd + 500, t, u * 1.6));
          if (P.wire !== false && window.TKL) { const r0 = at(P.roll, 0.4), pr = progIO(lt, r0, 2.4), x1 = lerp(-0.05 * W, 1.05 * W, pr);
            if (pr > 0) { const w = window.TKL.wire(-0.05 * W, x1, () => gy + 20 * u, t, sd + 600, () => 0, { h: 120 * u, gap: 170 * u }); lay.wireP.setAttribute('d', w.posts); lay.wireC.setAttribute('d', w.coil); }
            // near kerb + a thick coil unrolling along it (fills the bottom)
            const ky = gy + 90 * u;
            lay.kerbF.setAttribute('d', inkLoop([[-30, ky], [W + 30, ky], [W + 30, H + 30], [-30, H + 30]], o(620, { smooth: false, amp: 0.5 })));
            lay.kerbI.setAttribute('d', inkPath([[-20, ky], [W + 20, ky + 4]], o(621, { w: 8 })) + ' ' + inkPath([[-20, ky + 30 * u], [W + 20, ky + 32 * u]], o(622, { w: 4 })));
            const fp = lerp(0.15, 1, progIO(lt, r0, 2.6)), c = coil(-0.05 * W, lerp(-0.05 * W, 1.08 * W, fp), H - 20 * u, 95 * u, sd + 640, t, fp < 0.999);
            lay.fcL.setAttribute('d', c.loops); lay.fcB.setAttribute('d', c.barbs); lay.fcD.setAttribute('d', c.drum); }
          if (kas) kas.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // =================================================================== bw_coil
  SH.bw_coil = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 337, u = W / 1080, mode = P.mode || 'roll';
      const gy = (P.ground ?? 0.62) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = { postF: L(CONC()), postS: L(CONC_D(), { 'fill-opacity': 0.6 }), postI: L(INK.ink), strand: L(INK.ink), barb: L(INK.ink),
        castG: el(cam, 'g'), helmF: L(mix(INK.green, INK.inkSoft, 0.5)), helmI: L(INK.ink),
        loops: L(INK.ink), cbarb: L(INK.ink), drum: L(INK.ink), glint: L(INK.gold),
        groundF: L(mix(INK.paperDark, INK.stain, 0.3)), groundI: L(INK.ink), cob: L(INK.inkSoft),
        kerbF: L(mix(INK.paperDark, INK.stain, 0.45)), kerbI: L(INK.ink), nL: L(INK.ink), nB: L(INK.ink), nPost: L(CONC()), nPostI: L(INK.ink) };
      const cast = window.BBL.cast(lay.castG, P.cast, W, H, sd + 50);
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const labs = labelsOf(el(root, 'g'), P.labels, W, H);
      const posts = P.posts || [0.12, 0.5, 0.88], ns = P.strands ?? 3;
      const C = Object.assign({ x0: -0.05, x1: 1.05, r: 120 }, P.coil || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1, w: 5 }, extra || {});
          const hit = punch(lt, at(P.hit || 'hit', null));
          cam.setAttribute('transform', `translate(${W / 2} ${gy}) scale(${1 + hit * 0.06}) translate(${-W / 2} ${-gy})`);
          const roll = mode === 'roll', r0 = at(P.roll, 0.15), pr = roll ? lerp(P.start ?? 0, 1, progIO(lt, r0, P.roll_dur ?? 3)) : 1;
          // posts + strands (strands reach as far as the coil front)
          const front = lerp(C.x0 * W, C.x1 * W, pr);
          const PF = [], PS = [], PI = [], ST = [], BB = [];
          const top = gy - 620 * u;
          posts.forEach((x, k) => { const px = x * W; if (roll && px > front + 40 * u) return;
            const p = [[px - 36 * u, gy + 20 * u], [px + 36 * u, gy + 20 * u], [px + 30 * u, top], [px - 30 * u, top]];
            PF.push(inkLoop(p, o(10 + k, { smooth: false, amp: 0.5 }))); PS.push(inkLoop([[px + 8 * u, gy + 20 * u], [px + 36 * u, gy + 20 * u], [px + 30 * u, top], [px + 8 * u, top]], o(20 + k, { smooth: false, amp: 0.4 })));
            PI.push(inkPath(p, o(30 + k, { closed: true, smooth: false, w: 6 }))); });
          const xs = posts.map(x => x * W).filter(x => !roll || x <= front + 40 * u);
          for (let s = 0; s < ns; s++) {
            const y0 = top + 60 * u + s * 120 * u, pts = [];
            const xA = -40, xB = roll ? Math.min(front, W + 40) : W + 40;
            for (let x = xA; x <= xB; x += 40 * u) { const sag = Math.sin((x / W) * Math.PI * 2.4) * 10 * u + Math.sin(lt * 1.3 + s) * 4 * u; pts.push([x, y0 + sag]); }
            if (pts.length > 1) ST.push(inkPath(pts, o(100 + s, { w: 4, amp: 0.8 })));
            for (let i = 1; i < pts.length; i += 2) { const [bx, by] = pts[i], q = 14 * u;
              BB.push(inkPath([[bx - q, by - q], [bx + q, by + q]], o(200 + s * 60 + i, { w: 3.5, amp: 0.4 })), inkPath([[bx - q, by + q], [bx + q, by - q]], o(300 + s * 60 + i, { w: 3.5, amp: 0.4 }))); }
          }
          void xs;
          lay.postF.setAttribute('d', PF.join(' ')); lay.postS.setAttribute('d', PS.join(' ')); lay.postI.setAttribute('d', PI.join(' '));
          lay.strand.setAttribute('d', ST.join(' ')); lay.barb.setAttribute('d', BB.join(' '));
          const cres = cast.update(lt, t, cues), cd = dressCast(P.cast, cres, t, sd + 400);
          lay.helmF.setAttribute('d', cd.fill); lay.helmI.setAttribute('d', cd.ink);
          const rr = C.r * u, c = coil(C.x0 * W, front, gy, rr, sd + 500, t, roll && pr < 1);
          lay.loops.setAttribute('d', c.loops); lay.cbarb.setAttribute('d', c.barbs); lay.drum.setAttribute('d', c.drum);
          // glint sliding along the top strand
          const gp = ((lt * 0.35) % 1.3) - 0.15, gx = gp * W, gyy = top + 60 * u + Math.sin((gx / W) * Math.PI * 2.4) * 10 * u;
          const gs = 26 * u * (1 + 0.3 * Math.sin(lt * 9));
          lay.glint.setAttribute('d', (gx < (roll ? front : W + 40)) ? inkLoop([[gx, gyy - gs * 1.6], [gx + gs * 0.3, gyy - gs * 0.3], [gx + gs * 1.6, gyy], [gx + gs * 0.3, gyy + gs * 0.3], [gx, gyy + gs * 1.6], [gx - gs * 0.3, gyy + gs * 0.3], [gx - gs * 1.6, gyy], [gx - gs * 0.3, gyy - gs * 0.3]], o(600, { smooth: false, amp: 0.4 })) : '');
          // ground in front: cobbles to the bottom
          lay.groundF.setAttribute('d', inkLoop([[-30, gy + 20 * u], [W + 30, gy + 20 * u], [W + 30, H + 30], [-30, H + 30]], o(700, { smooth: false, amp: 0.5 })));
          lay.groundI.setAttribute('d', inkPath([[-20, gy + 20 * u], [W + 20, gy + 24 * u]], o(701, { w: 7 })));
          lay.cob.setAttribute('d', cobbles(W, gy + 20 * u, H, sd + 800, t, u * 2.2));
          if (P.near !== false) {      // near kerb with post stubs and a second coil lying along it (fills the bottom)
            const ky = H * 0.82;
            lay.kerbF.setAttribute('d', inkLoop([[-30, ky], [W + 30, ky], [W + 30, H + 30], [-30, H + 30]], o(900, { smooth: false, amp: 0.5 })));
            lay.kerbI.setAttribute('d', inkPath([[-20, ky], [W + 20, ky + 4]], o(901, { w: 9 })) + ' ' + inkPath([[-20, ky + 40 * u], [W + 20, ky + 42 * u]], o(902, { w: 4 })));
            const NP = [], NI = [];
            [0.2, 0.72].forEach((x, k) => { const p = rect(x * W - 40 * u, ky - 260 * u, 80 * u, 300 * u); NP.push(inkLoop(p, o(910 + k, { smooth: false, amp: 0.5 }))); NI.push(inkPath(p, o(915 + k, { closed: true, smooth: false, w: 7 }))); });
            lay.nPost.setAttribute('d', NP.join(' ')); lay.nPostI.setAttribute('d', NI.join(' '));
            const sway = Math.sin(lt * 0.9) * 6 * u, c2 = coil(-0.08 * W + sway, 1.08 * W, ky + 150 * u, 150 * u, sd + 950, t, false);
            lay.nL.setAttribute('d', c2.loops); lay.nB.setAttribute('d', c2.barbs);
          }
          if (kas) kas.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // =================================================================== bw_podium
  SH.bw_podium = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 271, u = W / 1080;
      const ty = (P.table ?? 0.55) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = { curF: L(mix(INK.red, INK.paperDark, 0.55)), curI: L(INK.ink), castG: el(cam, 'g'), glassI: L(INK.ink),
        topF: L(mix(INK.paperDark, INK.stain, 0.4)), clothF: L(mix(INK.green, INK.inkSoft, 0.45)), tabI: L(INK.ink),
        paperF: L(INK.paperLight), paperI: L(INK.ink), micF: L(IRON()), micI: L(INK.ink), water: L(mix(INK.blue, INK.paperLight, 0.5)),
        flash: L(INK.gold), flashC: L(INK.paperLight), repF: L(mix(INK.inkSoft, INK.ink, 0.35)), repI: L(INK.ink), padF: L(INK.paperLight), padI: L(INK.ink), camF: L(INK.ink) };
      const sp = Object.assign({ who: 'speaker', x: 0.5, y: (P.table ?? 0.55) + 0.12, scale: 0.85, pose: 'talk', face: 'right', glasses: true, goatee: true }, P.speaker || {});
      const list = [sp].concat(P.cast || []);
      const cast = window.BBL.cast(lay.castG, list, W, H, sd + 30);
      const labs = labelsOf(el(root, 'g'), P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1, w: 5 }, extra || {});
          const qA = at(P.quote ?? 'quote', null), hit = Math.max(punch(lt, at(P.hit || 'hit', null)), punch(lt, qA));
          const z = 1 + lt * 0.01 + hit * 0.05;
          cam.setAttribute('transform', `translate(${W / 2} ${ty}) scale(${z}) translate(${-W / 2} ${-ty})`);
          // curtain folds behind
          const CF = [], CI = [];
          for (let k = 0; k < 9; k++) { const x0 = -40 + k * 135 * u, sw = Math.sin(lt * 0.5 + k) * 4 * u;
            const p = [[x0, H * 0.1], [x0 + 135 * u, H * 0.1], [x0 + 140 * u + sw, ty], [x0 - 5 * u + sw, ty]];
            if (k % 2 === 0) CF.push(inkLoop(p, o(10 + k, { smooth: false, amp: 0.5 })));
            CI.push(inkPath([[x0 + 67 * u, H * 0.1], [x0 + 70 * u + sw, ty]], o(30 + k, { w: 3 }))); }
          CI.push(inkPath([[-20, H * 0.1], [W + 20, H * 0.1]], o(50, { w: 12 })));
          lay.curF.setAttribute('d', CF.join(' ')); lay.curI.setAttribute('d', CI.join(' '));
          // speaker behind the table
          const cres = cast.update(lt, t, cues), cd = dressCast(list, cres, t, sd + 100);
          const GT = [];
          list.forEach((m, i) => { const q = cres[i]; if (!q || !m.goatee) return; const f = q.face, k = q.s / 0.6, hx = q.head[0], hy = q.head[1];
            GT.push(inkPath([[hx + f * 26 * k, hy + 44 * k], [hx + f * 30 * k, hy + 60 * k], [hx + f * 27 * k, hy + 74 * k]], o(140 + i, { w: 5, amp: 0.5 }))); });
          lay.glassI.setAttribute('d', cd.ink + ' ' + GT.join(' '));
          // table: top + cloth front down to the bottom of the stage area
          const top = [[-40, ty], [W + 40, ty], [W + 40, ty + 40 * u], [-40, ty + 40 * u]];
          const cloth = []; for (let k = 0; k <= 16; k++) cloth.push([lerp(-40, W + 40, k / 16), ty + 300 * u + Math.sin(k * 1.9 + lt * 0.7) * 8 * u]);
          lay.topF.setAttribute('d', inkLoop(top, o(60, { smooth: false, amp: 0.5 })));
          lay.clothF.setAttribute('d', inkLoop([[-40, ty + 40 * u], [W + 40, ty + 40 * u]].concat(cloth.slice().reverse()), o(61, { amp: 0.6 })));
          const TI = [inkPath(top, o(62, { closed: true, smooth: false, w: 6 })), inkPath(cloth, o(63, { w: 5 }))];
          for (let k = 1; k < 8; k++) TI.push(inkPath([[k * W / 8, ty + 50 * u], [k * W / 8 + Math.sin(lt * 0.7 + k) * 6 * u, ty + 290 * u]], o(64 + k, { w: 2.5 })));
          lay.tabI.setAttribute('d', TI.join(' '));
          // papers + glass
          const pa = [[W * 0.3, ty - 4 * u], [W * 0.44, ty - 14 * u], [W * 0.46, ty + 6 * u], [W * 0.32, ty + 16 * u]];
          lay.paperF.setAttribute('d', inkLoop(pa, o(80, { smooth: false, amp: 0.4 })));
          const gl = [[W * 0.74, ty - 120 * u], [W * 0.8, ty - 120 * u], [W * 0.79, ty], [W * 0.75, ty]];
          lay.water.setAttribute('d', inkLoop([[W * 0.745, ty - 70 * u], [W * 0.795, ty - 70 * u], [W * 0.79, ty], [W * 0.75, ty]], o(81, { smooth: false, amp: 0.4 })));
          lay.paperI.setAttribute('d', inkPath(pa, o(82, { closed: true, smooth: false, w: 3 })) + ' ' + inkPath(gl, o(83, { closed: true, smooth: false, w: 4 })));
          // microphones on stands, heads converging on the speaker's mouth
          const head = cres[0] ? cres[0].head : [W * 0.5, ty - 300 * u];
          const MF = [], MI = [];
          [-0.24, -0.1, 0.06, 0.2].forEach((dx, k) => { const bx = W * (0.5 + dx), by = ty;
            const hs = cres[0] ? cres[0].s : 0.85, hx = head[0] + (dx < 0 ? -1 : 1) * (95 + Math.abs(dx) * 260) * hs * u, hy = head[1] + 105 * hs + (k % 2) * 14 * u;
            MI.push(inkPath([[bx, by], [hx, hy + 18 * u]], o(90 + k, { w: 3 })), inkPath([[bx - 24 * u, by], [bx + 24 * u, by]], o(95 + k, { w: 7 })));
            const m = inkEllipsePts(hx, hy, 9 * u, 16 * u, sd + 100 + k, 10, (head[0] - hx) * 0.002);
            MF.push(inkLoop(m, o(100 + k, { amp: 0.5 }))); MI.push(inkPath(m, o(105 + k, { closed: true, w: 4 }))); });
          lay.micF.setAttribute('d', MF.join(' ')); lay.micI.setAttribute('d', MI.join(' '));
          // reporters: heads + shoulders from behind, notebooks and a camera with a flash
          const RF = [], RI = [], PF = [], PI = [], FF = [], FC = [], CM = [];
          const yB = ty + 230 * u;
          for (let k = 0; k < 5; k++) { const x = (0.1 + k * 0.2) * W + hn(k, 2) * 30 * u, y = yB + hn(k, 3) * 120 * u + 120 * u, r = (78 + hn(k, 4) * 14) * u, bob = Math.sin(lt * 1.6 + k * 1.1) * 6 * u;
            const sh = [[x - r * 2.1, H + 40], [x - r * 1.7, y + r * 1.25 + bob], [x - r * 0.6, y + r * 0.85 + bob], [x + r * 0.6, y + r * 0.85 + bob], [x + r * 1.7, y + r * 1.25 + bob], [x + r * 2.1, H + 40]];
            RF.push(inkLoop(sh, o(200 + k, { amp: 0.8 })), inkCircle(x, y + bob, r, sd + 220 + k, t, { fill: true }));
            RI.push(inkPath(sh, o(240 + k, { closed: true, w: 5 })), inkCircle(x, y + bob, r, sd + 260 + k, t, { w: 5 }));
            if (k % 2 === 0) { const nx = x + r * 1.2, ny = y + r * 0.6 + bob, wr = Math.sin(lt * 6 + k) * 3 * u;
              const pad = [[nx, ny - 90 * u], [nx + 80 * u, ny - 96 * u + wr], [nx + 84 * u, ny + 10 * u], [nx + 4 * u, ny + 16 * u]];
              PF.push(inkLoop(pad, o(280 + k, { smooth: false, amp: 0.4 }))); PI.push(inkPath(pad, o(290 + k, { closed: true, smooth: false, w: 4 })));
              for (let j = 0; j < 3; j++) PI.push(inkPath([[nx + 14 * u, ny - 64 * u + j * 24 * u], [nx + 66 * u, ny - 68 * u + j * 24 * u]], o(300 + k * 5 + j, { w: 2 }))); }
            if (k === 3 || k === 1) { const cx = x - r * 0.2, cy = y - r * 1.3 + bob;
              CM.push(inkLoop(rect(cx - 50 * u, cy - 34 * u, 100 * u, 68 * u), o(320 + k, { smooth: false, amp: 0.4 })), inkLoop(rect(cx + 30 * u, cy - 120 * u, 14 * u, 86 * u), o(325 + k, { smooth: false, amp: 0.4 })));
              const per = 1.7 + k * 0.3, ph = ((lt + k * 0.6) % per) / per, burst = (qA != null && lt >= qA && lt < qA + 0.3) ? 1 - (lt - qA) / 0.3 : 0;
              const fk = Math.max(ph < 0.14 ? 1 - ph / 0.14 : 0, burst);
              if (fk > 0.02 && P.flashes !== false) { const fx = cx + 37 * u, fy = cy - 150 * u, rr = 90 * u * (0.5 + fk);
                const star = []; for (let j = 0; j < 16; j++) { const a = j / 16 * Math.PI * 2, d = j % 2 ? rr * 0.4 : rr; star.push([fx + Math.cos(a) * d, fy + Math.sin(a) * d]); }
                FF.push(inkLoop(star, o(330 + k, { smooth: false, amp: 1.2 }))); FC.push(inkCircle(fx, fy, rr * 0.3, sd + 340 + k, t, { fill: true })); }
              CM.push(inkCircle(cx + 37 * u, cy - 150 * u, 28 * u, sd + 350 + k, t, { w: 4 })); } }
          lay.repF.setAttribute('d', RF.join(' ')); lay.repI.setAttribute('d', RI.join(' '));
          lay.padF.setAttribute('d', PF.join(' ')); lay.padI.setAttribute('d', PI.join(' '));
          if (qA != null && P.flashes !== false) (P.burst || [[0.3, 0.28], [0.76, 0.33], [0.24, 0.6], [0.8, 0.62]]).forEach(([bx, by], k) => {
            const a0 = qA + k * 0.12 + (k % 2) * 0.5, ag = lt - a0; if (ag < 0 || ag > 0.35) return; const fk = 1 - ag / 0.35, rr = 120 * u * (0.6 + fk), fx = bx * W, fy = by * H;
            const star = []; for (let j = 0; j < 16; j++) { const a = j / 16 * Math.PI * 2, d = j % 2 ? rr * 0.38 : rr; star.push([fx + Math.cos(a) * d, fy + Math.sin(a) * d]); }
            FF.push(inkLoop(star, o(370 + k, { smooth: false, amp: 1.2 }))); FC.push(inkCircle(fx, fy, rr * 0.3, sd + 380 + k, t, { fill: true })); });
          lay.camF.setAttribute('d', CM.join(' ')); lay.flash.setAttribute('d', FF.join(' ')); lay.flashC.setAttribute('d', FC.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
