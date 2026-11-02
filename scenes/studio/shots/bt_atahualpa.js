// bt_atahualpa: Atahualpa's ransom room, Cajamarca 1532-1533, belgesel style (docs/BELGESEL.md). Clean still line art,
// slow natural motion only (dust in the light, glints breathing, mist, a caravan walking, flames). Every type is composed
// on a 1080x1920 vertical canvas (the Short); a wide frame shows the same canvas as a centred column.
//   bt_goldroom  P: {mode: "full"|"reach"|"measure"|"line"}  cues: hit
//                a stone Inca room seen from the door: fitted polygonal masonry, two trapezoid niches, a line across the
//                back wall at the height of a raised hand.
//                full: a heap of gold objects (plates, cups, vessels) reaches the line, glints breathe; on "hit" the line
//                glows gold. reach: the room is empty, one faceless figure (royal fringe on the forehead) stands with one
//                arm raised to the wall; on "hit" the line draws out both ways from the fingertips. measure: the empty
//                room with the line; a dashed outline of the heap draws in and on "hit" gold rises inside it up to the
//                line. line: the empty room, only the gold line stays; the light slowly cools
//   bt_andes     P: {text: "1532", mode: "lit"|"fade"|"fires"}  cues: hit (fires)   ridges of the Andes under stars, mist
//                drifting, one small warm light in the valley (Cajamarca); lit: the year in big thin type above. fade: no
//                text, the light goes out. fires: no text; a Spanish soldier (morion helmet, back to us) stands in the
//                foreground; from "hit" campfires light up one by one across the ridges
//   bt_captive   P: {mode: "taken"|"empty"}  cues: hit   a trapezoid double-jamb Inca doorway, lit from inside.
//                taken: one faceless figure with the royal band and fringe stands in it; two Spanish soldiers (morion
//                helmets, backs to us) flank the door in the foreground; on "hit" their halberds swing in and cross
//                before the door. empty: the doorway is empty, the royal fringe lies fallen on the threshold; on "hit"
//                the light inside slowly goes out
//   bt_road      P: {}   a mountain slope at dusk; an Inca road zigzags down; a caravan of llamas carrying gold packs
//                walks slowly down it towards us
//   bt_furnace   P: {}  cues: hit   a crucible on a stone hearth, flames in the opening below; a thin gold temple
//                plate (nail holes, hammered texture) sinks slowly into it; on "hit" it melts away and the molten surface
//                glows, sparks rise
//   bt_ingot     P: {}   a pyramid of gold bars on a stone floor in a pool of light; the bars appear one by one, glints
//   bt_fringe    P: {}  cues: hit   the royal fringe (red wool tassels on gold tubes, a braided band) lying on a
//                polished Inca stone in a pool of light; on "hit" the light slowly closes around it
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => v.toFixed(1);
  let CLIP = 0;
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1) => el(parent, 'path', { d, fill, 'fill-opacity': a, stroke: 'none' });
  const L0 = (parent, d, stroke, w = 3, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra));
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const spark = (x, y, s) => `M${f1(x)} ${f1(y - s)}L${f1(x + s * 0.22)} ${f1(y - s * 0.22)}L${f1(x + s)} ${f1(y)}L${f1(x + s * 0.22)} ${f1(y + s * 0.22)}L${f1(x)} ${f1(y + s)}L${f1(x - s * 0.22)} ${f1(y + s * 0.22)}L${f1(x - s)} ${f1(y)}L${f1(x - s * 0.22)} ${f1(y - s * 0.22)}Z`;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }

  // fitted polygonal Inca masonry inside a box: rows of blocks with slanted joints
  function masonry(x0, y0, x1, y1, seed, rowH = 110) {
    const r = rng(seed);
    let d = '';
    const rows = Math.max(1, Math.round((y1 - y0) / rowH));
    const ys = [y0];
    for (let i = 1; i < rows; i++) ys.push(y0 + (y1 - y0) * i / rows + (r() * 2 - 1) * 14);
    ys.push(y1);
    for (let i = 1; i < ys.length - 1; i++) {   // bed joints, gently broken
      let x = x0, y = ys[i];
      d += `M${f1(x)} ${f1(y)}`;
      while (x < x1) { x = Math.min(x1, x + 60 + r() * 90); y = ys[i] + (r() * 2 - 1) * 10; d += `L${f1(x)} ${f1(y)}`; }
    }
    for (let i = 0; i < ys.length - 1; i++) {   // head joints, slanted
      let x = x0 + r() * 120;
      while (x < x1 - 60) {
        const sl = (r() * 2 - 1) * 18;
        d += `M${f1(x - sl)} ${f1(ys[i] + 4)}L${f1(x + sl)} ${f1(ys[i + 1] - 4)}`;
        x += 120 + r() * 140;
      }
    }
    return d;
  }

  // a faceless standing figure (feet at 0, up = -y) with the royal band and fringe; arm: "down" | "up"
  function figure(parent, x, y, h, o = {}) {
    const fc = o.face ?? 1, col = C.paperDark, rim = C.inkSoft;
    const J = { head: [0, -0.9], sh: [0, -0.77], hip: [0, -0.47], k1: [-0.04, -0.24], f1: [-0.07, 0], k2: [0.05, -0.24], f2: [0.08, 0],
      e1: [-0.11, -0.6], h1: [-0.13, -0.44], e2: [0.11, -0.6], h2: [0.13, -0.44] };
    if (o.arm === 'up') { J.e2 = [0.12, -1.0]; J.h2 = [0.16, -1.24]; }
    const g = el(parent, 'g', { transform: `translate(${x} ${y})` });
    const pt = k => [J[k][0] * h * fc, J[k][1] * h];
    const line = ks => 'M' + ks.map(k => pt(k).map(f1).join(' ')).join('L');
    // a long tunic: a soft trapezoid from shoulders to knees
    const tunic = `M${f1(-0.13 * h)} ${f1(-0.76 * h)}L${f1(0.13 * h)} ${f1(-0.76 * h)}L${f1(0.17 * h)} ${f1(-0.22 * h)}L${f1(-0.17 * h)} ${f1(-0.22 * h)}Z`;
    const limbs = [[['hip', 'k1', 'f1'], 0.055], [['hip', 'k2', 'f2'], 0.055], [['sh', 'e1', 'h1'], 0.042], [['sh', 'e2', 'h2'], 0.042]];
    for (const [ks, w] of limbs) L0(g, line(ks), rim, w * h + 3, 0.8);
    P0(g, tunic, rim, 0.8); L0(g, tunic, rim, 3, 0.8);
    for (const [ks, w] of limbs) L0(g, line(ks), col, w * h, 1);
    P0(g, tunic, col, 1);
    const [hx, hy] = pt('head'), hr = 0.078 * h;
    P0(g, BTL.E(hx, hy, hr + 1.5, hr + 1.5), rim, 0.8);
    P0(g, BTL.E(hx, hy, hr, hr), col, 1);
    // band round the head and the red fringe over the forehead
    L0(g, `M${f1(hx - hr * 0.86)} ${f1(hy - hr * 0.62)}C${f1(hx - hr * 0.4)} ${f1(hy - hr * 1.02)} ${f1(hx + hr * 0.4)} ${f1(hy - hr * 1.02)} ${f1(hx + hr * 0.86)} ${f1(hy - hr * 0.62)}`, C.gold, Math.max(2, hr * 0.16), 0.95);
    let fr = ''; for (let i = -3; i <= 3; i++) fr += `M${f1(hx + i * hr * 0.15)} ${f1(hy - hr * 0.86 + Math.abs(i) * hr * 0.05)}l0 ${f1(hr * 0.3)}`;
    L0(g, fr, C.red, Math.max(1.5, hr * 0.11), 0.95);
    return g;
  }

  // a Spanish soldier seen from behind: faceless, morion helmet (crest + upturned brim), cloak; feet at 0
  function spaniard(parent, x, y, h, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y})${o.face === -1 ? ' scale(-1 1)' : ''}` });
    const col = C.paperDark, rim = C.inkSoft, u = v => f1(v * h);
    const body = `M${u(-0.15)} ${u(-0.78)}C${u(-0.2)} ${u(-0.6)} ${u(-0.22)} ${u(-0.4)} ${u(-0.2)} ${u(-0.26)}L${u(-0.07)} ${u(-0.26)}L${u(-0.07)} 0L${u(-0.02)} 0L0 ${u(-0.24)}L${u(0.02)} 0L${u(0.07)} 0L${u(0.07)} ${u(-0.26)}L${u(0.2)} ${u(-0.26)}C${u(0.22)} ${u(-0.4)} ${u(0.2)} ${u(-0.6)} ${u(0.15)} ${u(-0.78)}C${u(0.08)} ${u(-0.82)} ${u(-0.08)} ${u(-0.82)} ${u(-0.15)} ${u(-0.78)}Z`;
    const head = BTL.E(0, -0.86 * h, 0.07 * h, 0.075 * h);
    const helm = `M${u(-0.17)} ${u(-0.9)}C${u(-0.12)} ${u(-0.87)} ${u(0.12)} ${u(-0.87)} ${u(0.17)} ${u(-0.9)}C${u(0.12)} ${u(-0.92)} ${u(0.09)} ${u(-0.93)} ${u(0.08)} ${u(-0.95)}C${u(0.07)} ${u(-1.03)} ${u(0.03)} ${u(-1.07)} 0 ${u(-1.08)}C${u(-0.03)} ${u(-1.07)} ${u(-0.07)} ${u(-1.03)} ${u(-0.08)} ${u(-0.95)}C${u(-0.09)} ${u(-0.93)} ${u(-0.12)} ${u(-0.92)} ${u(-0.17)} ${u(-0.9)}Z`;
    for (const d of [body, head, helm]) { P0(g, d, col, 1); L0(g, d, rim, 3, 0.85); }
    L0(g, `M0 ${u(-1.08)}L0 ${u(-1.1)}`, rim, 3, 0.85);
    return g;
  }
  // the royal fringe as one small object (origin = centre of the band): braided band, gold tubes, red tassels
  function fringeObj(parent, x, y, w, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y})${o.rot ? ` rotate(${o.rot})` : ''}${o.k ? ` scale(${o.k})` : ''}` });
    L0(g, `M${-w / 2} 0C${-w / 4} -10 ${w / 4} -10 ${w / 2} 0`, C.gold, 7, 1);
    const n = 9, step = w * 0.7 / (n - 1);
    for (let i = 0; i < n; i++) {
      const tx = -w * 0.35 + i * step, ty = -6;
      P0(g, `M${f1(tx - 3)} ${ty}L${f1(tx + 3)} ${ty}L${f1(tx + 3)} ${ty + 12}L${f1(tx - 3)} ${ty + 12}Z`, C.gold, 1);
      P0(g, `M${f1(tx - 4)} ${ty + 12}L${f1(tx + 4)} ${ty + 12}L${f1(tx + 5)} ${ty + 46}L${f1(tx - 5)} ${ty + 46}Z`, C.red, 0.95);
    }
    return g;
  }

  // ------------------------------------------------------------------ the ransom room
  const ROOM = { L: 150, R: 930, T: 300, B: 1010, LINE: 590 };
  const heapTop = x => { const u = Math.abs(x - 540) / 350; return ROOM.LINE + 8 + Math.pow(u, 2.4) * 430 + 14 * Math.sin(x / 23) + 9 * Math.sin(x / 9.5 + 1); };
  const HEAP = (() => {
    let d = 'M190 1040';
    for (let x = 200; x <= 880; x += 8) d += `L${x} ${f1(Math.min(1040, heapTop(x)))}`;
    return d + 'L890 1040Z';
  })();

  function roomShell(g, svg, defs) {
    const { L, R, T, B } = ROOM;
    P0(g, `M-200 -100L1280 -100L1280 ${T}L-200 ${T}Z`, C.paperDark, 1);                         // ceiling dark
    P0(g, `M${L} ${T}L${R} ${T}L${R} ${B}L${L} ${B}Z`, C.paperLight, 1);                          // back wall
    P0(g, `M-200 ${T - 260}L${L} ${T}L${L} ${B}L-200 ${B + 330}Z`, C.paper, 1);                   // side walls
    P0(g, `M1280 ${T - 260}L${R} ${T}L${R} ${B}L1280 ${B + 330}Z`, C.paper, 1);
    P0(g, `M${L} ${B}L${R} ${B}L1500 1920L-420 1920Z`, C.paperDark, 0.92);                       // floor
    L0(g, masonry(L + 4, T + 4, R - 4, B - 4, 1532), C.inkSoft, 1.6, 0.34);
    L0(g, masonry(-200, T - 60, L, B + 120, 33, 150), C.inkSoft, 1.4, 0.16);
    L0(g, masonry(R, T - 60, 1280, B + 120, 34, 150), C.inkSoft, 1.4, 0.16);
    let fl = '';
    for (let i = -6; i <= 6; i++) fl += `M${540 + i * 65} ${B}L${540 + i * 240} 1920`;
    for (const y of [1060, 1130, 1230, 1380, 1580, 1840]) fl += `M-300 ${y}L1380 ${y}`;
    L0(g, fl, C.inkSoft, 1.4, 0.16);
    L0(g, `M${L} ${T}L${R} ${T}L${R} ${B}L${L} ${B}Z`, C.inkSoft, 2.5, 0.75);
    L0(g, `M${L} ${T}L-200 ${T - 260}M${R} ${T}L1280 ${T - 260}M${L} ${B}L-200 ${B + 330}M${R} ${B}L1280 ${B + 330}`, C.inkSoft, 2.5, 0.6);
    // two trapezoid niches, low on the wall beside the heap
    for (const x of [235, 845]) {
      const n = `M${x - 46} 860L${x - 34} 720L${x + 34} 720L${x + 46} 860Z`;
      P0(g, n, C.paperDark, 0.9); L0(g, n, C.inkSoft, 2.5, 0.85);
    }
  }

  function dustIn(g, seed, n, box) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: el(g, 'circle', { cx: 0, cy: 0, r: (1.3 + r() * 2).toFixed(1), fill: C.ink, 'fill-opacity': 0 }),
      x: box[0] + r() * (box[2] - box[0]), y0: r(), sp: 8 + r() * 10, ph: r() * TAU, a: 0.2 + r() * 0.35 });
    const hgt = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const yy = ((q.y0 * hgt - q.sp * lt) % hgt + hgt) % hgt, x = q.x + 12 * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('cx', f1(x)); q.e.setAttribute('cy', f1(box[1] + yy));
      q.e.setAttribute('fill-opacity', (q.a * on * Math.sin(Math.PI * yy / hgt)).toFixed(3));
    } } };
  }

  // the heap of gold: outline fill + small objects inside it, glints
  function heap(g, seed) {
    const hg = el(g, 'g'), r = rng(seed);
    P0(hg, HEAP, mix(C.paperLight, C.gold, 0.42), 1);
    const solid = mix(C.paperLight, C.gold, 0.62), list = [];
    for (let i = 0; i < 90 && list.length < 34; i++) {
      const x = 240 + r() * 600, y = 620 + r() * 420;
      if (y < heapTop(x) + 34 || y > 1010) continue;
      if (list.some(q => Math.abs(q.x - x) < 52 && Math.abs(q.y - y) < 40)) continue;
      list.push({ x, y, k: r(), s: 20 + r() * 18 });
    }
    list.sort((a, b) => a.y - b.y);
    for (const { x, y, k, s } of list) {
      let d, rim = '';
      if (k < 0.45) { d = BTL.E(x, y, s * 1.4, s * 0.45); rim = BTL.E(x, y, s * 0.7, s * 0.2); }      // plate
      else if (k < 0.75) d = `M${f1(x - s * 0.6)} ${f1(y - s)}L${f1(x + s * 0.6)} ${f1(y - s)}L${f1(x + s * 0.35)} ${f1(y + s * 0.4)}L${f1(x + s * 0.5)} ${f1(y + s)}L${f1(x - s * 0.5)} ${f1(y + s)}L${f1(x - s * 0.35)} ${f1(y + s * 0.4)}Z`; // cup
      else d = `M${f1(x)} ${f1(y - s * 1.1)}C${f1(x + s)} ${f1(y - s * 0.9)} ${f1(x + s)} ${f1(y + s)} ${f1(x)} ${f1(y + s)}C${f1(x - s)} ${f1(y + s)} ${f1(x - s)} ${f1(y - s * 0.9)} ${f1(x)} ${f1(y - s * 1.1)}Z`; // vessel
      P0(hg, d, solid, 1); L0(hg, d, C.gold, 2.2, 1);
      if (rim) L0(hg, rim, C.gold, 1.4, 0.7);
    }
    L0(hg, HEAP.replace(/L890 1040Z$/, ''), C.gold, 3.5, 0.95);
    const gl = [];
    for (let i = 0; i < 14; i++) {
      const x = 240 + r() * 600, y = heapTop(x) + 20 + r() * 300;
      if (y > 1020) continue;
      gl.push({ e: P0(hg, spark(x, y, 9 + r() * 10), C.ink, 0), ph: r() * TAU, sp: 0.5 + r() * 0.6 });
    }
    return { g: hg, glint(lt, on = 1) { for (const q of gl) q.e.setAttribute('fill-opacity', (on * Math.max(0, Math.sin(lt * q.sp + q.ph)) * 0.85).toFixed(3)); } };
  }

  SH.bt_goldroom = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'full', g = canvas(svg, W, H), { L, R, LINE } = ROOM;
      roomShell(g, svg, defs);
      const pool = BTL.glow(svg, defs, 540, 800, 620, C.stain, 0.3, g);
      const floorPool = P0(g, BTL.E(540, 1080, 520, 90), C.stain, 0.1);
      const dust = dustIn(g, 77, 26, [220, 320, 860, 1000]);
      const lineD = `M${L} ${LINE}L${R} ${LINE}`;
      const lineGlow = L0(g, lineD, C.gold, 14, 0);
      let hp = null, ghost = null, rise = null, clipRect = null, fig = null, lineL = null, lineR = null, line = null;
      const FX = 790;   // where the hand touches the wall in "reach"
      if (mode === 'reach') {
        lineL = L0(g, `M${FX} ${LINE}L${L} ${LINE}`, C.gold, 4, 1, { pathLength: 1 });
        lineR = L0(g, `M${FX} ${LINE}L${R} ${LINE}`, C.gold, 4, 1, { pathLength: 1 });
        draw(lineL, 0); draw(lineR, 0);
        fig = figure(g, FX - 0.16 * 470, 1110, 470, { arm: 'up' });
      } else {
        line = L0(g, lineD, C.gold, 4, 1, { pathLength: 1 });
      }
      if (mode === 'full') hp = heap(g, 90);
      if (mode === 'measure') {
        ghost = L0(g, HEAP.replace(/L890 1040Z$/, ''), C.gold, 3, 0.9, { 'stroke-dasharray': '14 12' });
        const cid = 'atahclip' + (++CLIP), cp = el(defs, 'clipPath', { id: cid });
        clipRect = el(cp, 'rect', { x: 0, y: 1040, width: 1080, height: 0 });
        rise = el(g, 'g', { 'clip-path': `url(#${cid})` });
        P0(rise, HEAP, C.gold, 0.4);
      }
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.55);
          let cool = mode === 'line' ? BTL.ease(lt, 0.8, Math.max(2, dur)) : 0;
          pool.set((0.3 + 0.025 * Math.sin(lt * 0.6)) * (1 - 0.6 * cool));
          floorPool.setAttribute('fill-opacity', (0.1 * (1 - 0.6 * cool)).toFixed(3));
          dust.update(lt, 1 - 0.5 * cool);
          if (mode === 'full') {
            draw(line, 1);
            hp.glint(lt);
            lineGlow.setAttribute('stroke-opacity', (0.22 * BTL.ease(lt, hit - 0.3, 1)).toFixed(3));
          } else if (mode === 'reach') {
            fade(fig, BTL.ease(lt, 0, 1));
            const p = BTL.ease(lt, hit - 0.2, 1.6);
            draw(lineL, p); draw(lineR, p);
            lineGlow.setAttribute('stroke-opacity', (0.12 * p).toFixed(3));
          } else if (mode === 'measure') {
            draw(line, 1);
            ghost.style.opacity = BTL.ease(lt, 0.1, 1).toFixed(3);
            const p = BTL.ease(lt, hit - 0.2, Math.max(1.4, dur - hit));
            const top = 1040 - p * (1040 - LINE);
            clipRect.setAttribute('y', f1(top)); clipRect.setAttribute('height', f1(1040 - top));
            lineGlow.setAttribute('stroke-opacity', (0.15 * p).toFixed(3));
          } else {   // line
            draw(line, 1);
            lineGlow.setAttribute('stroke-opacity', (0.2 * (0.85 + 0.15 * Math.sin(lt * 0.7))).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the Andes at night, 1532
  function ridges(g) {
    const r = rng(1532), out = [];
    const layer = (y0, amp, step, fill, a, line) => {
      let d = `M-200 ${y0}`;
      for (let x = -200; x <= 1280; x += step) d += `L${x} ${f1(y0 - amp * (0.3 + r() * 0.7) * (0.6 + 0.4 * Math.sin(x / 210)))}`;
      d += 'L1280 2000L-200 2000Z';
      P0(g, d, fill, a); L0(g, d.split('L1280 2000')[0], C.inkSoft, line, 0.7);
      out.push(d);
    };
    layer(860, 300, 90, C.paperLight, 0.8, 1.6);
    layer(990, 220, 70, C.paper, 1, 2);
    layer(1110, 120, 60, C.paperDark, 1, 2.2);
    return out;
  }
  SH.bt_andes = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'lit', g = canvas(svg, W, H);
      const st = BTL.stars(g, 140, 15, [0, 0, 1080, 760]);
      const sky = BTL.glow(svg, defs, 600, 980, 640, C.stain, 0.14, g);
      ridges(g);
      // mist in the valley
      const r = rng(9), mist = [];
      for (let i = 0; i < 6; i++) mist.push({ e: P0(g, '', C.ink, 0), y: 940 + r() * 160, w: 420 + r() * 400, h: 10 + r() * 14, x: r() * 1300 - 150, sp: 5 + r() * 7, a: 0.05 + r() * 0.05 });
      // Cajamarca: one warm light in the valley
      const town = BTL.glow(svg, defs, 610, 1060, 120, C.gold, 0.5, g);
      const dot = P0(g, BTL.E(610, 1062, 6, 6), C.gold, 1);
      const fires = [];
      if (mode === 'fires') {
        const rf = rng(77);
        for (let i = 0; i < 26; i++) {
          const x = 60 + rf() * 960, y = 900 + rf() * 230;
          if (x < 420 && y < 1080) continue;   // keep the soldier's silhouette clear
          const r0 = 9 + rf() * 6;
          fires.push({ e: P0(g, BTL.E(x, y, r0, r0 * 1.2), C.gold, 0), halo: P0(g, BTL.E(x, y, r0 * 4, r0 * 3), C.gold, 0), at: rf(), ph: rf() * TAU });
        }
        spaniard(g, 230, 1150, 420);
        
      }
      const t = mode === 'lit' ? txt(g, P.text || '1532', 540, 520, 230, { weight: 300 }) : null;
      if (t) BTL.fit(t, 900);
      const rule = t ? L0(g, 'M420 590L660 590', C.gold, 2.5, 1, { pathLength: 1 }) : null;
      if (rule) draw(rule, 0);
      return {
        update(lt, dur, cues) {
          st.update(lt);
          const out = mode === 'fade' ? BTL.ease(lt, 0.6, Math.max(2, dur - 0.6)) : 0;
          const hitT = cue(cues, 'hit', dur * 0.5);
          for (const f of fires) { const a = BTL.ease(lt, hitT - 0.2 + f.at * 1.3, 0.5) * (0.75 + 0.25 * Math.sin(lt * 2.3 + f.ph)); f.e.setAttribute('fill-opacity', a.toFixed(3)); f.halo.setAttribute('fill-opacity', (0.18 * a).toFixed(3)); }
          sky.set((0.14 + 0.02 * Math.sin(lt * 0.4)) * (1 - 0.7 * out));
          town.set((0.5 + 0.08 * Math.sin(lt * 1.3)) * (1 - out));
          dot.setAttribute('fill-opacity', (1 - 0.9 * out).toFixed(3));
          for (const m of mist) { const x = ((m.x + m.sp * lt + 300) % 1700) - 300; m.e.setAttribute('d', BTL.E(x, m.y, m.w / 2, m.h)); m.e.setAttribute('fill-opacity', (m.a * BTL.ease(lt, 0, 1.2)).toFixed(3)); }
          if (t) {
            fade(t, BTL.ease(lt, 0.1, 1.2));
            t.setAttribute('transform', `translate(0 ${f1((1 - BTL.ease(lt, 0.1, 1.6)) * 14)})`);
            draw(rule, BTL.ease(lt, 0.6, 1.2));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the captive in the doorway
  SH.bt_captive = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), FLOOR = 1100;
      P0(g, `M-200 160L1280 160L1280 ${FLOOR}L-200 ${FLOOR}Z`, C.paperLight, 1);
      P0(g, `M-200 -100L1280 -100L1280 160L-200 160Z`, C.paperDark, 1);
      P0(g, `M-200 ${FLOOR}L1280 ${FLOOR}L1280 1920L-200 1920Z`, C.paperDark, 0.92);
      L0(g, masonry(-200, 164, 1280, FLOOR - 4, 1533, 120), C.inkSoft, 1.6, 0.3);
      let fl = '';
      for (let i = -6; i <= 6; i++) fl += `M${540 + i * 70} ${FLOOR}L${540 + i * 250} 1920`;
      for (const y of [1150, 1230, 1350, 1520, 1760]) fl += `M-200 ${y}L1280 ${y}`;
      L0(g, fl, C.inkSoft, 1.4, 0.16);
      // double-jamb trapezoid doorway
      const outer = `M330 ${FLOOR}L380 400L700 400L750 ${FLOOR}Z`, inner = `M380 ${FLOOR}L420 450L660 450L700 ${FLOOR}Z`;
      P0(g, outer, C.paper, 1); L0(g, outer, C.inkSoft, 3, 0.9);
      P0(g, inner, C.paperDark, 1);
      const inGlow = BTL.glow(svg, defs, 540, 820, 330, C.stain, 0.45, g);
      L0(g, inner, C.ink, 3, 0.95);
      L0(g, 'M380 400L330 160M700 400L750 160', C.inkSoft, 1.6, 0.25);
      const mode = P.mode || 'taken';
      const fig = mode === 'empty' ? null : figure(g, 540, FLOOR - 4, 520, { arm: 'down' });
      const floorPool = P0(g, BTL.E(540, FLOOR + 70, 360, 70), C.stain, 0.14);
      if (mode === 'empty') {
        // the fallen fringe on the threshold, in the last of the light
        const fp = BTL.glow(svg, defs, 540, FLOOR - 10, 300, C.stain, 0.38, g);
        floorPool.setAttribute('d', BTL.E(540, FLOOR - 4, 300, 60));
        fringeObj(g, 540, FLOOR - 40, 200, { rot: -5, k: 2 });
        return {
          update(lt, dur, cues) {
            const off = BTL.ease(lt, cue(cues, 'hit', dur * 0.5) - 0.2, Math.max(1.8, dur * 0.6));
            inGlow.set((0.45 + 0.03 * Math.sin(lt * 0.7)) * (1 - 0.9 * off));
            floorPool.setAttribute('fill-opacity', (0.14 * (1 - 0.8 * off)).toFixed(3));
            fp.set(0.3 * (1 - 0.6 * off));
          },
        };
      }
      // two Spanish soldiers, backs to us, flank the door; on "hit" their halberds swing in and cross before it
      const halberd = () => {
        const hg = el(g, 'g');
        L0(hg, 'M0 0L0-900', C.ink, 7, 0.95);
        const blade = 'M0-840C30-846 52-860 62-886C72-852 72-808 62-776C50-792 28-800 0-800Z';
        P0(hg, blade, C.inkSoft, 1); L0(hg, blade, C.ink, 3, 0.95);
        L0(hg, 'M0-886L0-970M0-828L-34-812', C.ink, 5, 0.95);
        return hg;
      };
      const hA = halberd(), hB = halberd();
      spaniard(g, 175, 1640, 700); spaniard(g, 905, 1640, 700, { face: -1 });
      return {
        update(lt, dur, cues) {
          inGlow.set(0.45 + 0.03 * Math.sin(lt * 0.7));
          floorPool.setAttribute('fill-opacity', (0.14 + 0.02 * Math.sin(lt * 0.7)).toFixed(3));
          fade(fig, BTL.ease(lt, 0, 1.2));
          const p = BTL.ease(lt, cue(cues, 'hit', dur * 0.6) - 0.7, 1.0);
          hA.setAttribute('transform', `translate(255 1380) rotate(${f1(lerp(-4, 33.5, p))}) scale(-1 1)`);
          hB.setAttribute('transform', `translate(825 1380) rotate(${f1(lerp(4, -33.5, p))})`);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the llama caravan on the Inca road
  const LLAMA = 'M-36-34C-38-48-22-54 0-54L24-54C32-54 34-60 34-68L34-100C34-108 38-112 44-112L52-112C58-112 60-106 56-102L46-98L46-60C46-44 42-34 32-32L32 0L25 0L23-28L-18-28L-20 0L-27 0L-30-30C-36-30-38-32-36-34Z';
  const EARS = 'M40-112L38-124M47-112L48-124';
  const PACK = 'M-24-66L18-66L20-50L-26-50Z';
  SH.bt_road = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H);
      const st = BTL.stars(g, 60, 21, [0, 0, 1080, 300]);
      const sky = BTL.glow(svg, defs, 820, 330, 520, C.stain, 0.2, g);
      // far peaks, then the slope that fills the frame
      P0(g, 'M-200 470L60 300L220 410L420 230L640 380L820 260L1080 420L1280 360L1280 2000L-200 2000Z', C.paper, 1);
      L0(g, 'M-200 470L60 300L220 410L420 230L640 380L820 260L1080 420L1280 360', C.inkSoft, 2, 0.7);
      P0(g, 'M-200 560C200 470 700 470 1280 520L1280 2000L-200 2000Z', C.paperLight, 1);
      L0(g, 'M-200 560C200 470 700 470 1280 520', C.inkSoft, 2, 0.7);
      P0(g, 'M-200 1360L1280 1360L1280 2000L-200 2000Z', C.paperDark, 0.95);
      P0(g, 'M-200 1360L1280 1360L1280 1500L-200 1500Z', C.paper, 1);
      L0(g, masonry(-200, 1362, 1280, 1498, 61, 70), C.inkSoft, 1.4, 0.35);
      L0(g, 'M-200 1360L1280 1360M-200 1500L1280 1500', C.inkSoft, 2, 0.6);
      // terraces (faint)
      let tr = '';
      for (let i = 0; i < 9; i++) { const y = 600 + i * 80; tr += `M-200 ${y + 20}C200 ${y - 10} 700 ${y} 1280 ${y + 30}`; }
      L0(g, tr, C.inkSoft, 1.2, 0.14);
      // the road: a zigzag down the slope, every turn lower and nearer
      const PTS = [[1160, 560], [180, 680], [900, 820], [160, 980], [940, 1130], [-120, 1150]];
      let rd = 'M' + PTS.map(p => p.join(' ')).join('L');
      L0(g, rd, C.paper, 34, 1); L0(g, rd, C.inkSoft, 38, 0.25); L0(g, rd, C.paper, 30, 1);
      L0(g, rd, C.inkSoft, 1.4, 0.35, { 'stroke-dasharray': '6 18' });
      const seg = [], total = (() => { let s = 0; for (let i = 1; i < PTS.length; i++) { const l = Math.hypot(PTS[i][0] - PTS[i - 1][0], PTS[i][1] - PTS[i - 1][1]); seg.push([s, l, PTS[i - 1], PTS[i]]); s += l; } return s; })();
      const at = s => { for (const [s0, l, a, b] of seg) if (s <= s0 + l) { const u = (s - s0) / l; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.sign(b[0] - a[0])]; } const z = seg[seg.length - 1]; return [z[3][0], z[3][1], 1]; };
      const N = 9, lam = [];
      for (let i = 0; i < N; i++) {
        const lg = el(g, 'g');
        P0(lg, LLAMA, C.paperDark, 1); L0(lg, LLAMA, C.inkSoft, 2.2, 0.9); L0(lg, EARS, C.inkSoft, 3, 0.9);
        P0(lg, PACK, C.gold, 0.85); L0(lg, PACK, C.gold, 2, 1);
        lam.push({ g: lg, s0: 1500 - i * 190, glint: P0(lg, spark(-4, -62, 7), C.ink, 0), ph: i * 1.7 });
      }
      return {
        update(lt) {
          st.update(lt);
          sky.set(0.2 + 0.02 * Math.sin(lt * 0.5));
          for (const q of lam) {
            const s = q.s0 + 34 * lt;
            if (s < 0 || s > total) { q.g.setAttribute('opacity', 0); continue; }
            const [x, y, dir] = at(s), k = 0.9 + (y - 560) / 600 * 0.9;
            const bob = 1.5 * Math.sin(lt * 3 + q.ph);
            q.g.setAttribute('transform', `translate(${f1(x)} ${f1(y - 6 + bob)}) scale(${(dir * k).toFixed(3)} ${k.toFixed(3)})`);
            q.g.setAttribute('opacity', (clamp01(s / 120) * clamp01((total - s) / 120)).toFixed(3));
            q.glint.setAttribute('fill-opacity', (0.8 * Math.max(0, Math.sin(lt * 0.9 + q.ph))).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the crucible
  SH.bt_furnace = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), cx = 540;
      P0(g, 'M-200 1160L1280 1160L1280 1920L-200 1920Z', C.paperDark, 0.92);
      { let fl = ''; for (let i = -6; i <= 6; i++) fl += `M${cx + i * 70} 1160L${cx + i * 250} 1920`;
        for (const y of [1220, 1320, 1470, 1680]) fl += `M-200 ${y}L1280 ${y}`;
        L0(g, fl, C.inkSoft, 1.4, 0.16); }
      const heat = BTL.glow(svg, defs, cx, 860, 560, C.stain, 0.3, g);
      // the hearth: a stone block with an arched opening
      const hearth = 'M230 1160L260 900L820 900L850 1160Z', mouth = 'M420 1160L420 1040C420 990 470 960 540 960C610 960 660 990 660 1040L660 1160Z';
      P0(g, hearth, C.paperLight, 1); L0(g, masonry(232, 904, 848, 1156, 7, 85), C.inkSoft, 1.4, 0.3); L0(g, hearth, C.inkSoft, 3, 0.9);
      P0(g, mouth, C.paperDark, 1); L0(g, mouth, C.ink, 3, 0.9);
      const flames = [0, 1, 2, 3, 4].map(i => ({ e: P0(g, '', C.gold, 0.85), x: 470 + i * 35, h: 70 + (i % 2) * 30 + (i === 2 ? 30 : 0), ph: i * 1.3 }));
      const core = [0, 1, 2].map(i => ({ e: P0(g, '', C.ink, 0.5), x: 505 + i * 35, h: 40 + (i === 1 ? 20 : 0), ph: i * 2.1 }));
      const flame = (x, h, w, ph, lt) => { const s = Math.sin(lt * 2.1 + ph), s2 = Math.sin(lt * 3.3 + ph * 2); const tx = x + 8 * s, ty = 1150 - h * (0.9 + 0.1 * s2);
        return `M${x - w} 1150C${x - w} ${f1(1150 - h * 0.4)} ${f1(tx - 6)} ${f1(ty + h * 0.3)} ${f1(tx)} ${f1(ty)}C${f1(tx + 6)} ${f1(ty + h * 0.3)} ${x + w} ${f1(1150 - h * 0.4)} ${x + w} 1150Z`; };
      // crucible: back rim, molten surface, the plate, then the front of the bowl
      const RIM = 740;
      P0(g, `M340 ${RIM}A200 40 0 0 1 740 ${RIM}`, C.paperDark, 1);
      const molten = P0(g, BTL.E(cx, RIM + 4, 180, 32), C.gold, 0.5);
      const mGlow = BTL.glow(svg, defs, cx, RIM, 260, C.gold, 0.15, g);
      const pg = el(g, 'g'), r = rng(44);
      const plate = 'M-110-160L110-160L110 160L-110 160Z';
      P0(pg, plate, C.gold, 0.55); L0(pg, plate, C.gold, 3.5, 1);
      let ham = ''; for (let i = 0; i < 26; i++) { const x = -90 + r() * 180, y = -140 + r() * 280; ham += `M${f1(x)} ${f1(y)}c4-3 9-3 13 0`; }
      L0(pg, ham, C.ink, 1.6, 0.35);
      P0(pg, BTL.E(-92, -142, 6, 6) + BTL.E(92, -142, 6, 6) + BTL.E(-92, 142, 6, 6) + BTL.E(92, 142, 6, 6), C.paperDark, 1);
      const body = `M340 ${RIM}C340 820 400 900 540 904C680 900 740 820 740 ${RIM}A200 40 0 0 1 340 ${RIM}Z`;
      P0(g, body, C.paperLight, 1);
      L0(g, `M340 ${RIM}C340 820 400 900 540 904C680 900 740 820 740 ${RIM}`, C.ink, 3.5, 0.95);
      L0(g, BTL.E(cx, RIM, 200, 40), C.ink, 3.5, 0.95);
      L0(g, `M370 ${RIM + 50}C420 ${RIM + 90} 660 ${RIM + 90} 710 ${RIM + 50}`, C.inkSoft, 2, 0.6);
      const sp = [];
      for (let i = 0; i < 14; i++) sp.push({ e: el(g, 'circle', { cx: 0, cy: 0, r: (1.5 + r() * 2).toFixed(1), fill: C.gold, 'fill-opacity': 0 }), x: 400 + r() * 280, y0: r(), v: 30 + r() * 40, ph: r() * TAU });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.6), m = BTL.ease(lt, hit - 0.3, 1.6);
          heat.set(0.3 + 0.04 * Math.sin(lt * 1.1) + 0.12 * m);
          for (const f of flames) f.e.setAttribute('d', flame(f.x, f.h, 26, f.ph, lt));
          for (const f of core) f.e.setAttribute('d', flame(f.x, f.h, 12, f.ph + 1, lt));
          const y = lerp(520, 700, BTL.ease(lt, 0, Math.max(2, hit + 0.8)));
          pg.setAttribute('transform', `translate(${cx} ${f1(y)}) rotate(-7)`);
          pg.setAttribute('opacity', (1 - 0.95 * m).toFixed(3));
          molten.setAttribute('fill-opacity', (0.5 + 0.4 * m + 0.05 * Math.sin(lt * 1.7)).toFixed(3));
          mGlow.set(0.15 + 0.35 * m);
          for (const q of sp) {
            const u = ((q.y0 + lt * q.v / 400) % 1);
            q.e.setAttribute('cx', f1(q.x + 10 * Math.sin(lt + q.ph))); q.e.setAttribute('cy', f1(RIM - 20 - u * 380));
            q.e.setAttribute('fill-opacity', ((0.3 + 0.6 * m) * Math.sin(Math.PI * u)).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the ingots
  SH.bt_ingot = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), cx = 540, BASE = 1040;
      P0(g, `M-200 ${BASE}L1280 ${BASE}L1280 1920L-200 1920Z`, C.paperDark, 0.92);
      L0(g, `M-200 ${BASE}L1280 ${BASE}`, C.inkSoft, 2, 0.4);
      { let fl = ''; for (let i = -6; i <= 6; i++) fl += `M${cx + i * 70} ${BASE}L${cx + i * 250} 1920`;
        for (const y of [1100, 1190, 1320, 1500, 1740]) fl += `M-200 ${y}L1280 ${y}`;
        L0(g, fl, C.inkSoft, 1.4, 0.16); }
      const pool = BTL.glow(svg, defs, cx, 860, 560, C.stain, 0.3, g);
      P0(g, BTL.E(cx, BASE + 30, 440, 70), C.stain, 0.12);
      const bars = [], BW = 170, BH = 66, TOP = 30, r = rng(5);
      const rows = [4, 3, 2, 1];
      rows.forEach((n, j) => {
        for (let i = 0; i < n; i++) {
          const x = cx + (i - (n - 1) / 2) * (BW + 6), y = BASE - j * (BH + TOP * 0.2) - j * 4;
          const front = `M${x - BW / 2} ${y}L${x - BW / 2 + 14} ${y - BH}L${x + BW / 2 - 14} ${y - BH}L${x + BW / 2} ${y}Z`;
          const top = `M${x - BW / 2 + 14} ${y - BH}L${x - BW / 2 + 30} ${y - BH - TOP}L${x + BW / 2 - 30} ${y - BH - TOP}L${x + BW / 2 - 14} ${y - BH}Z`;
          const bg = el(g, 'g');
          P0(bg, front, C.gold, 0.45); P0(bg, top, C.gold, 0.7);
          L0(bg, front + top, C.gold, 3, 1);
          const gl = P0(bg, spark(x - 30 + r() * 60, y - BH - TOP / 2, 10), C.ink, 0);
          bars.push({ g: bg, gl, ph: r() * TAU });
        }
      });
      return {
        update(lt, dur) {
          pool.set(0.3 + 0.03 * Math.sin(lt * 0.6));
          const per = Math.max(0.06, Math.min(0.28, dur * 0.55 / bars.length));
          bars.forEach((b, i) => {
            const p = BTL.ease(lt, i * per, 0.5);
            b.g.setAttribute('opacity', p.toFixed(3));
            b.g.setAttribute('transform', `translate(0 ${f1((1 - p) * -24)})`);
            b.gl.setAttribute('fill-opacity', (0.8 * p * Math.max(0, Math.sin(lt * 0.8 + b.ph))).toFixed(3));
          });
        },
      };
    },
  };

  // ------------------------------------------------------------------ the royal fringe on a stone
  SH.bt_fringe = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), cx = 540;
      P0(g, 'M-200 1110L1280 1110L1280 1920L-200 1920Z', C.paperDark, 0.95);
      const pool = BTL.glow(svg, defs, cx, 820, 560, C.stain, 0.32, g);
      // the polished stone: top face + front face
      const topF = 'M150 680L930 680L1010 900L70 900Z', front = 'M70 900L1010 900L1010 1110L70 1110Z';
      P0(g, front, C.paper, 1); P0(g, topF, C.paperLight, 1);
      L0(g, topF, C.inkSoft, 2.5, 0.9); L0(g, front, C.inkSoft, 2.5, 0.9);
      L0(g, masonry(72, 904, 1008, 1106, 12, 100), C.inkSoft, 1.4, 0.25);
      const D = BTL.drawing(g);
      // the braided band, gently curved, lying across the stone
      const band = 'M220 740C380 716 700 716 860 740';
      D.s(band, { w: 16, color: C.inkSoft });
      D.s(band, { w: 10, color: C.paperLight });
      let br = ''; for (let i = 0; i <= 31; i++) { const x = 226 + i * 20, y = 740 - 24 * Math.sin(Math.PI * (x - 220) / 640); br += `M${f1(x - 5)} ${f1(y - 5)}l10 10`; }
      D.s(br, { w: 2, color: C.inkSoft });
      // tassels: gold tube, red wool, lying towards us
      const tas = [];
      let strands = '';
      for (let i = 0; i < 21; i++) {
        const x = 300 + i * 24, y = 740 - 24 * Math.sin(Math.PI * (x - 220) / 640) + 8, sp = (i - 10) * 1.6, L = 128 + (i % 3) * 8;
        const wool = `M${x - 7} ${y + 26}L${x + 7} ${y + 26}L${f1(x + 10 + sp)} ${y + L}C${f1(x + 5 + sp)} ${y + L + 8} ${f1(x - 5 + sp)} ${y + L + 8} ${f1(x - 10 + sp)} ${y + L}Z`;
        D.f(wool, C.red, 0.85);
        D.f(`M${x - 5} ${y}L${x + 5} ${y}L${x + 6} ${y + 28}L${x - 6} ${y + 28}Z`, C.gold, 1);
        strands += `M${x} ${y + 34}L${f1(x + sp)} ${y + L - 6}`;
        tas.push(wool);
      }
      D.s(tas.join(''), { w: 1.4, color: C.paperDark, alpha: 0.6 });
      D.s(strands, { w: 1.2, color: C.ink, alpha: 0.35 });
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.4));
          const k = BTL.ease(lt, cue(cues, 'hit', dur * 0.6) - 0.2, Math.max(1.6, dur * 0.5));
          pool.set((0.32 + 0.02 * Math.sin(lt * 0.6)) * (1 - 0.65 * k));
          pool.e.setAttribute('r', f1(560 - 260 * k));
          D.g.setAttribute('opacity', (1 - 0.35 * k).toFixed(3));
        },
      };
    },
  };
})();
