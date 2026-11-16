// bt_rosetta_a: the Rosetta Stone (Rashid 1799 / Paris 1822), part A, belgesel style (docs/BELGESEL.md). Still line
// art in the theme's tokens; the only motion is slow and natural (a flame, smoke, water, stars, light, a line that
// draws itself, a slow walk or run). Places are drawn on the 1920x1080 stage (BTL.stage frames them for a Short).
// People are faceless silhouettes. Shared kit for bt_rosetta_b.js: window.ROSA (stone, glyph, flame, smoke, greek,
// P0, L0, T, ital, fade, place, f1). The black stone: dark granodiorite slab, top-left corner and the right edge
// broken, hieroglyph band on top (half lost), demotic band in the middle, Greek band at the bottom.
//
//   bt_rosa_street  P: {mode: "run"}  cues: hit, b   night, a narrow Paris street: tall stone facades, one gas lamp
//                   (slow flame). A faceless figure runs from left to right with a stack of papers; on hit the paper
//                   edges glint gold; on b (optional) the lamp turns slowly down
//   bt_rosa_room    P: {mode: "door"|"fall"}  cues: hit   a study: desk, one candle, a stack of books, a door on the
//                   right. door: a figure with papers stands in the lit doorway and steps in; on hit the flame leans.
//                   fall: lower, closer; the figure lies on the floor by the desk, papers fanned out, the candle burns on
//   bt_rosa_cartouche P: {mode: "paper"}  cues: hit, b   a sheet in a light pool; a vertical Ramses cartouche (sun disc,
//                   ms sign, two folded-cloth s) draws itself in pencil; on hit the signs come; on b the sheet's edges
//                   sink into the dark, only the cartouche stays. Cartouche centre: stage [960, 470]
//   bt_rosa_stone   P: {mode: "reveal"|"three"|"bands"|"broken"|"side", all, labels}  the black stone.
//                   reveal: cues hit, b: the stone appears in a light pool on hit; on b the light keeps only its left
//                     half, the right half sinks into the dark. Stone centre [960, 480]
//                   three: cues hit: the three bands write themselves top to bottom; all: true -> the bands are there
//                     and light up together on hit (closing scene). Stone centre [960, 480] (cover focus [960, 470])
//                   bands: cues c0, c1, c2: the stone at x 760, each cue lights its band, an italic label on the right
//                     (labels default ["hiyeroglif", "demotik", "Yunanca"])
//                   broken: cues hit, b: the top of the stone; on hit the lost part shows as a dashed outline and fades;
//                     on b the 14 hieroglyph rows are ticked in gold one by one, italic "14 satır". Close-up focus [960, 330]
//                   side: cues hit, b: a dim museum hall, the stone in a glass case under one spot, seen a little from
//                     the left so its left side shows; on hit a thin line of white paint appears on the side; on b the
//                     italic label (default "ele geçirildi · 1801"). Close-up focus on the side: [760, 480]
//   bt_rosa_philae  P: {mode: "carve"|"dusk"|"night", label}  cues: hit   the pylon of Philae on the Nile, reflection on
//                   the water. carve: by the gate a small god figure and a few columns of signs carve themselves in gold;
//                   on hit the label (default "394"). dusk: one oil lamp before the gate; on hit the flame dies, the
//                   gold lines turn grey, smoke rises. night: stars, the temple dark, the lamp stays lit
//   bt_rosa_obelisk P: {}  cues: hit   night, one tall obelisk from low; on hit its signs glow gold one by one
//   bt_rosa_glyphs  P: {mode: "trio", label}  cues: c0, c1, c2   owl, eye, cobra draw themselves one per cue; then the
//                   italic label (default "gizli anlam?")
//   bt_rosa_wall    P: {mode: "hidden"}  cues: hit   a ruined fort wall in section, dust in a pale beam; on hit one dark
//                   block's edge is drawn in gold
//   bt_rosa_fort    P: {mode: "dig", label}  cues: hit   sunset at a ruined fort: two soldiers with picks far off, an
//                   officer in a bicorne bends in front; on hit the corner of the black stone shows in a light pool
//                   at the wall's foot, label (default "Bouchard")
//   bt_rosa_greek   P: {mode: "read"}  cues: hit, b   close-up of the Greek band: engraved capitals, one row reads
//                   ΠΤΟΛΕΜΑΙΟΣ; on hit a gold line runs along it; on b two thin lines reach up to the bands above
//   bt_rosa_king    P: {label}  cues: hit   a temple hall at Memphis: the boy king on a throne (double crown), three
//                   priests bow; on hit light falls on the king; label (default "Memfis · MÖ 196")
//   bt_rosa_copies  P: {}  cues: hit, b   an ink rubbing of the stone in a light pool; on hit copies fan out behind it;
//                   on b they sink into the dark, only the middle sheet stays
//   bt_rosa_map     P: {preset: "delta"|"europe", bounds, points: [{lon, lat, label, sub, at, side: "left"}],
//                   routes: [[i, j, at, [[lon, lat], ...]]]}  cues: the points' / routes' "at" names
//                   plain map like bt_map with the Nile and its two branches (delta) or Europe's Atlantic coast and
//                   Britain (europe); points without "at" are quiet grey, points with "at" pulse in gold; a route
//                   runs through its waypoints
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2, E = BTL.E;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const T = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const ital = (g, s, x, y, size = 50, o = {}) => T(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft }, o));
  const place = (parent, x, y, s = 1, o = {}) => el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)})${o.rot ? ` rotate(${o.rot})` : ''} scale(${(o.flip ? -s : s).toFixed(3)} ${s.toFixed(3)})` });
  const halo = (t, w = 10) => { t.setAttribute('stroke', C.paper); t.setAttribute('stroke-width', w); t.setAttribute('stroke-linejoin', 'round'); t.setAttribute('paint-order', 'stroke'); return t; };
  let UID = 0;
  const uid = s => 'rosa' + s + (++UID);
  function linGrad(defs, stops, o = {}) {
    const id = uid('lg'), g = el(defs, 'linearGradient', Object.assign({ id, x1: 0, y1: 0, x2: 0, y2: 1 }, o));
    for (const [off, col, a] of stops) el(g, 'stop', { offset: off, 'stop-color': col, 'stop-opacity': a ?? 1 });
    return `url(#${id})`;
  }

  // ------------------------------------------------------------------ flame (gold body, ink core) and smoke
  function flame(parent, x, y, s = 1, o = {}) {
    const g = place(parent, x, y, s);
    const fl = [[C.gold, 1, 0, 0.9], [C.ink, 0.48, 1.7, 0.95]].map(([col, k, ph, a]) => ({ e: P0(g, '', col, a), k, ph: ph + (o.ph || 0) }));
    return {
      g,
      update(lt, amp = 1, lean = 0) {
        for (const f of fl) {
          const h = (52 + 4 * Math.sin(lt * 1.7 + f.ph) + 2.5 * Math.sin(lt * 2.7 + f.ph * 2)) * f.k * amp, w = 12 * f.k * Math.max(0.3, amp);
          const ln = lean * h * 0.55 + 1.6 * Math.sin(lt * 0.8 + f.ph);
          f.e.setAttribute('d', h < 1 ? '' : `M${f1(-w)} 0C${f1(-w)} ${f1(-h * 0.45)} ${f1(-w * 0.2 + ln * 0.6)} ${f1(-h * 0.72)} ${f1(ln)} ${f1(-h)}C${f1(w * 0.2 + ln * 0.6)} ${f1(-h * 0.72)} ${f1(w)} ${f1(-h * 0.45)} ${f1(w)} 0C${f1(w)} ${f1(w * 0.8)} ${f1(-w)} ${f1(w * 0.8)} ${f1(-w)} 0Z`);
        }
      },
    };
  }
  function smoke(parent, x, y, s = 1) {
    const g = el(parent, 'g'), lines = [0, 1].map(i => L0(g, '', C.inkSoft, (i ? 2 : 3) * s, 0));
    return {
      update(lt, t0, steady = false) {
        const u = lt - t0;
        lines.forEach((e, i) => {
          if (u <= 0) { e.setAttribute('d', ''); return; }
          const len = (steady ? 1 : Math.min(1, u / 2.6)) * 280 * s, pts = [];
          for (let k = 0; k <= 22; k++) { const v = k / 22, yy = y - v * len, xx = x + Math.sin(v * 5 + u * 0.6 + i * 1.7) * (5 + 30 * v) * s + i * 4 * v * s; pts.push(f1(xx) + ' ' + f1(yy)); }
          e.setAttribute('d', 'M' + pts.join('L'));
          e.setAttribute('stroke-opacity', ((i ? 0.35 : 0.6) * (steady ? 1 : clamp01(u / 0.6) * (1 - clamp01((u - 3.4) / 3)))).toFixed(3));
        });
      },
    };
  }
  // slow dust motes drifting in a box
  function motes(parent, n, seed, box, r0 = 2.2) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: el(parent, 'circle', { cx: 0, cy: 0, r: r0 * (0.6 + r() * 0.8), fill: C.ink, 'fill-opacity': 0 }), x: r(), y: r(), sp: 0.006 + r() * 0.01, ph: r() * TAU, a: 0.2 + r() * 0.35 });
    return {
      update(lt, k = 1) {
        for (const m of list) {
          const v = (m.y - lt * m.sp + 10) % 1, x = box[0] + (m.x + 0.03 * Math.sin(lt * 0.25 + m.ph)) * (box[2] - box[0]), y = box[1] + v * (box[3] - box[1]);
          m.e.setAttribute('cx', f1(x)); m.e.setAttribute('cy', f1(y));
          m.e.setAttribute('fill-opacity', (m.a * k * Math.sin(v * Math.PI)).toFixed(3));
        }
      },
    };
  }

  // ------------------------------------------------------------------ silhouettes from joints (rim + fill strokes)
  function limbFig(parent, o = {}) {
    const g = el(parent, 'g'), col = o.color || C.paperDark, rim = o.rim || C.inkSoft;
    return {
      g,
      // segs: [[pts, width]], heads: [[x, y, r]]; called once (static) or every frame
      set(segs, heads, extra = []) {
        g.textContent = '';
        for (const [pts, w] of segs) L0(g, 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L'), rim, w + 5, 0.85);
        for (const [x, y, r] of heads) P0(g, E(x, y, r + 2.5, r + 2.5), rim, 0.85);
        for (const d of extra) el(g, 'path', { d, fill: col, stroke: rim, 'stroke-width': 2.5, 'stroke-opacity': 0.85, 'stroke-linejoin': 'round' });
        for (const [pts, w] of segs) L0(g, 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L'), col, w, 1);
        for (const [x, y, r] of heads) P0(g, E(x, y, r, r), col, 1);
        for (const d of extra) P0(g, d, col, 1);
      },
    };
  }
  // a running figure, facing +x, feet at (0, 0), height h; returns {g, update(x, y, ph), hand}
  function runner(parent, h, o = {}) {
    const F = limbFig(parent, o), papers = el(parent, 'g');
    const sheets = [[-0.07, -0.05, -14], [-0.05, -0.065, -4], [-0.03, -0.05, 8]].map(([dx, dy, rot]) => {
      const sg = el(papers, 'g');
      const wv = 0.13 * h, hv = 0.095 * h;
      P0(sg, `M${f1(-wv / 2)} ${f1(-hv / 2)}h${f1(wv)}v${f1(hv)}h${f1(-wv)}Z`, C.paperLight, 1);
      const edge = L0(sg, `M${f1(-wv / 2)} ${f1(-hv / 2)}h${f1(wv)}v${f1(hv)}h${f1(-wv)}Z`, C.inkSoft, 2, 0.9);
      L0(sg, `M${f1(-wv * 0.35)} ${f1(-hv * 0.15)}h${f1(wv * 0.6)}M${f1(-wv * 0.35)} ${f1(hv * 0.12)}h${f1(wv * 0.5)}`, C.inkSoft, 1.5, 0.6);
      return { sg, edge, dx, dy, rot };
    });
    return {
      g: F.g,
      update(x, y, ph, glint = 0) {
        const J = (a, b) => [x + a * h, y + b * h];
        const hip = [0, -0.5], sh = [0.08, -0.79], head = [0.13, -0.91];
        const leg = i => {
          const q = ph + i * Math.PI, a = 0.55 * Math.sin(q), k = 0.25 + 0.75 * (0.5 - 0.5 * Math.cos(q - 0.9));
          const kn = [hip[0] + 0.25 * Math.sin(a), hip[1] + 0.25 * Math.cos(a)], b = a - k;
          const ft = [kn[0] + 0.25 * Math.sin(b), Math.min(0.0, kn[1] + 0.25 * Math.cos(b))];
          return [J(...hip), J(...kn), J(...ft)];
        };
        const c = -0.6 * Math.sin(ph), el1 = [sh[0] + 0.16 * Math.sin(c), sh[1] + 0.16 * Math.cos(c)], hd1 = [el1[0] + 0.14 * Math.sin(c + 1.3), el1[1] + 0.14 * Math.cos(c + 1.3)];
        const el2 = [sh[0] + 0.1, sh[1] + 0.12], hd2 = [sh[0] + 0.24, sh[1] + 0.16];
        F.set([[leg(1), 0.055 * h], [[J(...sh), J(...el1), J(...hd1)], 0.04 * h], [[J(...hip), J(...sh)], 0.12 * h], [leg(0), 0.055 * h], [[J(...sh), J(...el2), J(...hd2)], 0.042 * h]],
          [[...J(...head), 0.078 * h]]);
        const [px, py] = J(hd2[0] + 0.02, hd2[1] - 0.02);
        for (const s of sheets) {
          s.sg.setAttribute('transform', `translate(${f1(px + s.dx * h + 0.08 * h)} ${f1(py + s.dy * h)}) rotate(${s.rot + 2 * Math.sin(ph * 0.5)})`);
          s.edge.setAttribute('stroke', glint > 0.5 ? C.gold : C.inkSoft); s.edge.setAttribute('stroke-width', (2 + 1.5 * glint).toFixed(2));
        }
        parent.appendChild(papers);
        return [px + 0.08 * h, py];
      },
    };
  }

  // ------------------------------------------------------------------ the black stone (origin = centre, ~520 x 760)
  const SO = [[-252, 380], [-258, 120], [-262, -80], [-256, -170], [-236, -196], [-210, -214], [-190, -252], [-150, -268], [-118, -300], [-80, -318],
    [-40, -332], [0, -346], [40, -352], [80, -364], [118, -372], [150, -366], [176, -372], [198, -350], [212, -322], [232, -300], [240, -262],
    [254, -236], [250, -196], [262, -160], [258, -40], [264, 120], [258, 380]];
  const SOD = 'M' + SO.map(p => p.join(' ')).join('L') + 'Z';
  function span(y) {
    let lo = 1e9, hi = -1e9;
    for (let i = 0; i < SO.length; i++) {
      const [x1, y1] = SO[i], [x2, y2] = SO[(i + 1) % SO.length];
      if ((y1 <= y && y2 >= y) || (y2 <= y && y1 >= y)) { if (y1 === y2) continue; const x = x1 + (y - y1) / (y2 - y1) * (x2 - x1); lo = Math.min(lo, x); hi = Math.max(hi, x); }
    }
    return [lo, hi];
  }
  const inside = (x, y) => { const [a, b] = span(y); return x > a && x < b; };
  const BANDS = [[-326, -150], [-134, 104], [120, 352]];
  const HROWS = Array.from({ length: 14 }, (_, k) => -318 + k * 12.4);
  // the inscriptions: one path per band, rows top to bottom, left to right (so a dash reveal "writes" them)
  const STONE_D = (() => {
    const r = rng(1799), out = ['', '', ''];
    const rowX = (y, hgt, m) => { const a = span(y - hgt), b = span(y + 1); return [Math.max(a[0], b[0]) + m, Math.min(a[1], b[1]) - m]; };
    for (const y of HROWS) {   // hieroglyphs: little pictures
      let [x, x1] = rowX(y, 10, 18);
      while (x < x1 - 10) {
        const k = Math.floor(r() * 8); let w = 8;
        const X = f1(x), Y = f1(y);
        if (k === 0) { out[0] += `M${X} ${Y}v-9`; w = 3; }
        else if (k === 1) { out[0] += `M${X} ${f1(y - 4)}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`; w = 7; }
        else if (k === 2) { out[0] += `M${X} ${Y}l3 -6l5 -2l2 3m-6 1l-1 4`; w = 10; }
        else if (k === 3) { out[0] += `M${X} ${f1(y - 7)}h6v6h-6z`; w = 7; }
        else if (k === 4) { out[0] += `M${X} ${f1(y - 2)}h9`; w = 10; }
        else if (k === 5) { out[0] += `M${X} ${Y}q4 -10 8 0`; w = 9; }
        else if (k === 6) { out[0] += `M${X} ${f1(y - 5)}q2 -3 4 0t4 0`; w = 9; }
        else { out[0] += `M${X} ${Y}v-8l5 3`; w = 6; }
        x += w + 3;
      }
    }
    for (let k = 0; k < 22; k++) {   // demotic: short hooks
      const y = -128 + k * 10.8; let [x, x1] = rowX(y, 7, 16);
      while (x < x1 - 8) {
        const w = 3 + r() * 6, hh = 3 + r() * 5;
        out[1] += `M${f1(x)} ${f1(y)}q${f1(w * 0.5)} ${f1(-hh * 1.4)} ${f1(w)} ${f1(-hh * (0.2 + r() * 0.6))}`;
        x += w + 2 + r() * 3 + (r() < 0.08 ? 6 : 0);
      }
    }
    for (let k = 0; k < 18; k++) {   // Greek: small regular capitals
      const y = 132 + k * 12.4; let [x, x1] = rowX(y, 8, 18);
      while (x < x1 - 7) {
        const q = Math.floor(r() * 8), X = f1(x), Y = f1(y);
        out[2] += [`M${X} ${Y}v-8`, `M${X} ${f1(y - 4)}a3 3.6 0 1 0 6 0a3 3.6 0 1 0 -6 0`, `M${X} ${Y}l3 -8l3 8`, `M${X} ${Y}v-8h5v8`,
          `M${f1(x + 5)} ${f1(y - 8)}h-5v8h5m-5 -4h4`, `M${X} ${f1(y - 8)}h6m-3 0v8`, `M${X} ${Y}v-8l5 8v-8`, `M${f1(x + 5)} ${f1(y - 8)}h-5l3 4l-3 4h5`][q];
        x += (q === 0 ? 3 : 7) + 2.4;
      }
    }
    // granodiorite speckle, inside the outline
    let sp = '';
    for (let i = 0; i < 900; i++) { const x = -260 + r() * 524, y = -372 + r() * 752; if (!inside(x, y)) continue; const s = 0.6 + r() * 1.4; sp += `M${f1(x)} ${f1(y)}h${f1(s)}v${f1(s)}h${f1(-s)}z`; }
    return { bands: out, speckle: sp };
  })();
  // o: {ghost (band alpha before writing), print: true (a flat ink rubbing look)}
  function stone(parent, defs, o = {}) {
    const g = el(parent, 'g');
    const base = o.print ? C.paperDark : mix(C.paperLight, C.paperDark, 0.35);
    const fill = o.print ? base : linGrad(defs, [[0, mix(C.paperLight, C.stain, 0.08)], [0.5, base], [1, mix(C.paperLight, C.paperDark, 0.75)]], { x2: 1 });
    const body = el(g, 'path', { d: SOD, fill });
    P0(g, STONE_D.speckle, C.inkSoft, o.print ? 0.1 : 0.22);
    // chips along the broken edges
    if (!o.print) L0(g, 'M-236-190l18 6M-196-246l16 10M-120-292l14 12M-60-322l8 14M200-342l-14 10M236-292l-16 8M250-226l-14 4', C.inkSoft, 2, 0.6);
    const bands = STONE_D.bands.map((d, i) => L0(g, d, C.inkSoft, [1.6, 1.4, 1.3][i], 0.9, { pathLength: 1 }));
    const outline = L0(g, SOD, C.ink, 3, 0.75, { pathLength: 1 });
    return { g, body, bands, outline, BANDS, HROWS, span };
  }
  const bandMid = i => (BANDS[i][0] + BANDS[i][1]) / 2;

  // ------------------------------------------------------------------ hieroglyph signs (origin = centre, ~100 px)
  const GLYPH = {
    sun: D => { D.f(E(0, 0, 40, 40), C.paperLight, 1); D.s(E(0, 0, 40, 40), { w: 4 }); D.f(E(0, 0, 7, 7), C.ink, 1); },
    owl: D => {
      const b = 'M-20-12C-36 6-36 30-22 44L30 44L46 52L34 38C38 22 26 2 6-12Z';
      D.f(b, C.paperLight, 1); D.f(E(-6, -28, 20, 18), C.paperLight, 1);
      D.s(b, { w: 4 }); D.s(E(-6, -28, 20, 18), { w: 4 });
      D.s(E(-13, -30, 5, 5) + E(1, -30, 5, 5), { w: 2.5 });
      D.s('M-6-23L-6-16M-14 44l-4 9M0 44l2 9M-10 10C-2 18 10 22 22 24', { w: 3 });
    },
    eye: D => {
      const a = 'M-46 0C-24-22 24-22 46 0C24 18-24 18-46 0Z';
      D.f(a, C.paperLight, 1); D.s(a, { w: 4 }); D.f(E(0, -2, 12, 12), C.ink, 1);
      D.s('M-42-22C-16-38 22-38 46-24', { w: 4 });
      D.s('M-4 15L-10 44M14 13C18 30 32 36 40 26', { w: 3.5 });
    },
    cobra: D => {
      const hood = 'M8-2C-12-14-12-38 2-48C8-52 14-52 18-48L34-46C38-44 36-40 30-40L22-38C30-24 26-10 8-2Z';
      D.f(hood, C.paperLight, 1);
      D.s('M-48 44L12 44C34 44 38 26 24 18C12 11 4 6 8-2', { w: 5 });
      D.s(hood, { w: 4 });
      D.s('M4-36C6-24 10-14 14-8', { w: 2, color: C.inkSoft });
      D.f(E(16, -44, 2.5, 2.5), C.ink, 1);
    },
    ms: D => {
      D.s('M-9-34C-9-48 9-48 9-34', { w: 4 });
      D.s('M-5-30C-18-12-22 18-20 44M0-28L0 44M5-30C18-12 22 18 20 44M-12-16L12-16', { w: 4 });
    },
    cloth: D => {
      const s = 'M-10 44L-10-30C-10-42-2-46 6-44C14-42 14-32 6-26L1-22L1 44Z';
      D.f(s, C.paperLight, 1); D.s(s, { w: 4 });
    },
    reed: D => { const l = 'M0-20C10-30 12-44 4-52C-6-42-4-28 0-20Z'; D.f(l, C.paperLight, 1); D.s('M0 44L0-20', { w: 4 }); D.s(l, { w: 3.5 }); },
    water: D => D.s('M-44 0l7-7l7 14l7-14l7 14l7-14l7 14l7-14l7 14l7-14l7 7', { w: 3.5 }),
    bread: D => { const b = 'M-32 12C-32-16 32-16 32 12Z'; D.f(b, C.paperLight, 1); D.s(b, { w: 4 }); },
    mouth: D => { D.f(E(0, 0, 40, 13), C.paperLight, 1); D.s(E(0, 0, 40, 13), { w: 4 }); },
    stool: D => { D.f('M-24-24h48v48h-48Z', C.paperLight, 1); D.s('M-24-24h48v48h-48Z', { w: 4 }); },
    ankh: D => { D.s(E(0, -26, 14, 18), { w: 4 }); D.s('M0-8L0 44M-22-6L22-6', { w: 4 }); },
  };
  function glyph(parent, name, x, y, s = 1, o = {}) {
    const g = place(parent, x, y, s), D = BTL.drawing(g);
    const sD = D.s, w0 = o.w || 1;
    D.s = (d, q = {}) => sD.call(D, d, Object.assign({}, q, { w: (q.w || 4) * w0 / s, color: q.color || o.color }));
    (GLYPH[name] || GLYPH.sun)(D);
    return D;
  }

  // ------------------------------------------------------------------ engraved Greek capitals (stroke font, 0..1 box)
  const GK = {
    'Α': 'M0 1L0.5 0L1 1M0.22 0.62L0.78 0.62', 'Β': 'M0 0L0 1L0.62 1Q1 1 1 0.74Q1 0.5 0.6 0.48L0 0.48M0 0L0.56 0Q0.9 0 0.9 0.24Q0.9 0.47 0.6 0.48',
    'Γ': 'M0 1L0 0L0.85 0', 'Δ': 'M0 1L0.5 0L1 1Z', 'Ε': 'M0.9 0L0 0L0 1L0.9 1M0 0.5L0.7 0.5', 'Η': 'M0 0L0 1M1 0L1 1M0 0.5L1 0.5',
    'Θ': 'M0.5 0A0.5 0.5 0 1 0 0.5 1A0.5 0.5 0 1 0 0.5 0ZM0.28 0.5L0.72 0.5', 'Ι': 'M0.5 0L0.5 1', 'Κ': 'M0 0L0 1M0.9 0L0 0.56M0.3 0.38L0.95 1',
    'Λ': 'M0 1L0.5 0L1 1', 'Μ': 'M0 1L0 0L0.5 0.72L1 0L1 1', 'Ν': 'M0 1L0 0L1 1L1 0', 'Ο': 'M0.5 0A0.5 0.5 0 1 0 0.5 1A0.5 0.5 0 1 0 0.5 0Z',
    'Π': 'M0 1L0 0L1 0L1 1', 'Ρ': 'M0 1L0 0L0.6 0Q0.95 0 0.95 0.27Q0.95 0.54 0.6 0.54L0 0.54', 'Σ': 'M0.95 0L0 0L0.5 0.5L0 1L0.95 1',
    'Τ': 'M0 0L1 0M0.5 0L0.5 1', 'Υ': 'M0 0L0.5 0.5L1 0M0.5 0.5L0.5 1', 'Φ': 'M0.5 0.18A0.45 0.32 0 1 0 0.5 0.82A0.45 0.32 0 1 0 0.5 0.18ZM0.5 0L0.5 1',
    'Χ': 'M0 0L1 1M1 0L0 1', 'Ω': 'M0.1 1L0.34 1Q0 0.8 0 0.48Q0 0 0.5 0Q1 0 1 0.48Q1 0.8 0.66 1L0.9 1',
  };
  // returns {d, w}: one path string for a string of capitals at (x, y = baseline), cap height h
  function greek(s, x, y, h) {
    let d = '', cx = x;
    const wd = h * 0.74, gap = h * 0.3;
    for (const ch of s) {
      if (ch === ' ') { cx += h * 0.55; continue; }
      const g = GK[ch]; if (!g) continue;
      const ww = ch === 'Ι' ? h * 0.2 : wd, ox = ch === 'Ι' ? cx - h * 0.4 * 0.2 : cx;
      d += g.replace(/([MLQAZ])([^MLQAZ]*)/g, (m, c, args) => {
        if (c === 'Z') return 'Z';
        const n = args.trim().split(/[ ,]+/).filter(Boolean).map(Number);
        if (c === 'A') return `A${f1(n[0] * ww)} ${f1(n[1] * h)} ${n[2]} ${n[3]} ${n[4]} ${f1(ox + n[5] * ww)} ${f1(y - h + n[6] * h)}`;
        const out = []; for (let i = 0; i < n.length; i += 2) out.push(f1(ox + n[i] * ww) + ' ' + f1(y - h + n[i + 1] * h));
        return c + out.join(' ');
      });
      cx += ww + gap;
    }
    return { d, w: cx - gap - x };
  }

  // ================================================================== bt_rosa_street
  SH.bt_rosa_street = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 900, fy: 560 });
      const GR = 820, r = rng(1822);
      // the facades across the street
      let x = -60;
      const lit = [];
      while (x < 1980) {
        const w = 250 + r() * 130, top = 70 + r() * 120;
        const fd = `M${f1(x)} ${GR}L${f1(x)} ${f1(top)}L${f1(x + w)} ${f1(top)}L${f1(x + w)} ${GR}Z`;
        P0(g, fd, mix(C.paperLight, C.paper, 0.35 + r() * 0.3), 1);
        L0(g, `M${f1(x)} ${GR}L${f1(x)} ${f1(top)}L${f1(x + w)} ${f1(top)}`, C.inkSoft, 2, 0.55);
        // mansard roof + chimney
        P0(g, `M${f1(x + 10)} ${f1(top)}L${f1(x + 30)} ${f1(top - 46)}L${f1(x + w - 30)} ${f1(top - 46)}L${f1(x + w - 10)} ${f1(top)}Z`, mix(C.paperLight, C.paperDark, 0.4), 1);
        L0(g, `M${f1(x + 10)} ${f1(top)}L${f1(x + 30)} ${f1(top - 46)}L${f1(x + w - 30)} ${f1(top - 46)}L${f1(x + w - 10)} ${f1(top)}M${f1(x + w * 0.7)} ${f1(top - 46)}v-34h26v34`, C.inkSoft, 2, 0.5);
        L0(g, `M${f1(x)} ${f1(top + 6)}L${f1(x + w)} ${f1(top + 6)}`, C.inkSoft, 1.5, 0.4);
        const cols = 3, cw = w / cols;
        for (let yy = top + 60; yy < GR - 150; yy += 118) for (let c = 0; c < cols; c++) {
          const wx = x + c * cw + cw / 2 - 22, on = r() < 0.12;
          const wd = `M${f1(wx)} ${f1(yy)}h44v76h-44Z`;
          const e = P0(g, wd, on ? C.gold : C.paperDark, on ? 0.18 : 0.9);
          if (on) lit.push({ e, ph: r() * 6 });
          L0(g, wd + `M${f1(wx + 22)} ${f1(yy)}v76`, C.inkSoft, 1.4, 0.45);
          L0(g, `M${f1(wx - 6)} ${f1(yy + 80)}h56`, C.inkSoft, 1.6, 0.5);
        }
        const dx = x + w / 2 - 34;   // a door at street level
        P0(g, `M${f1(dx)} ${GR}L${f1(dx)} ${GR - 130}Q${f1(dx + 34)} ${GR - 160} ${f1(dx + 68)} ${GR - 130}L${f1(dx + 68)} ${GR}Z`, C.paperDark, 0.9);
        x += w;
      }
      // the street
      P0(g, `M-300 ${GR}L2220 ${GR}L2220 1900L-300 1900Z`, mix(C.paperDark, C.paper, 0.35), 1);
      L0(g, `M-300 ${GR}L2220 ${GR}`, C.inkSoft, 2, 0.6);
      let cob = '';
      for (let row = 0, yy = GR + 22; yy < 1300; row++, yy += 18 + row * 4) for (let cx = -40 + (row % 2) * 40; cx < 1980; cx += 80 + row * 6) cob += `M${cx} ${yy}q${20 + row * 2} -6 ${44 + row * 4} 0`;
      L0(g, cob, C.inkSoft, 1.4, 0.3);
      // the near walls framing the narrow street
      P0(g, `M-300 -10L190 -10L190 ${GR + 40}L-300 ${GR + 60}Z`, C.paperDark, 1);
      L0(g, `M190 -10L190 ${GR + 40}M150 -10L150 ${GR + 40}M-300 300L190 300M-300 600L190 600`, C.inkSoft, 2, 0.5);
      P0(g, `M1760 -10L2220 -10L2220 ${GR + 60}L1760 ${GR + 40}Z`, C.paperDark, 1);
      L0(g, `M1760 -10L1760 ${GR + 40}M1800 -10L1800 ${GR + 40}M1760 260L2220 260M1760 560L2220 560`, C.inkSoft, 2, 0.5);
      // the gas lamp
      const LX = 1330, LY = 440;
      const pool = BTL.glow(svg, defs, LX, LY + 20, 560, C.stain, 0.3, g);
      const gpool = BTL.glow(svg, defs, LX, GR + 30, 360, C.stain, 0.14, g);
      L0(g, `M${LX} ${GR}L${LX} ${LY + 40}M${LX - 30} ${GR}h60M${LX - 14} ${GR - 30}h28`, C.inkSoft, 6, 0.9);
      P0(g, `M${LX - 34} ${LY - 46}L${LX + 34} ${LY - 46}L${LX + 24} ${LY + 40}L${LX - 24} ${LY + 40}Z`, C.paperLight, 0.5);
      const fl = flame(g, LX, LY + 22, 0.62);
      L0(g, `M${LX - 34} ${LY - 46}L${LX + 34} ${LY - 46}L${LX + 24} ${LY + 40}L${LX - 24} ${LY + 40}ZM${LX - 44} ${LY - 46}L${LX} ${LY - 80}L${LX + 44} ${LY - 46}M${LX} ${LY - 80}v-14`, C.ink, 3, 0.85);
      // the runner
      const RG = el(g, 'g'), run = runner(RG, 330);
      const glintG = BTL.glow(svg, defs, 0, 0, 90, C.gold, 0, g);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.45), tb = cue(cues, 'b', null);
          const dim = tb != null ? BTL.ease(lt, tb, 2) : 0;
          fl.update(lt, 1 - 0.65 * dim);
          pool.set((0.3 + 0.015 * Math.sin(lt * 1.3)) * (1 - 0.7 * dim)); gpool.set(0.14 * (1 - 0.7 * dim));
          for (const w of lit) w.e.setAttribute('fill-opacity', (0.18 * (1 - 0.5 * dim)).toFixed(3));
          const p = clamp01(lt / Math.max(dur, 1)), rx = lerp(240, 1080, p);
          const gl = BTL.ease(lt, th - 0.2, 0.6) * (1 - BTL.ease(lt, th + 1.6, 1.4));
          const [hx, hy] = run.update(rx, GR, lt * TAU / 0.8, gl > 0.3 ? 1 : 0);
          glintG.e.setAttribute('cx', f1(hx)); glintG.e.setAttribute('cy', f1(hy)); glintG.set(0.45 * gl);
        },
      };
    },
  };

  // ================================================================== bt_rosa_room
  // the study, floor at y 830: desk + candle + books on the left, a door on the right
  function study(g, svg, defs) {
    const GR = 830;
    L0(g, `M-300 560L2220 560`, C.inkSoft, 1.5, 0.25);   // a dado rail
    P0(g, `M-300 ${GR}L2220 ${GR}L2220 1900L-300 1900Z`, mix(C.paperDark, C.paper, 0.4), 1);
    L0(g, `M-300 ${GR}L2220 ${GR}M-300 ${GR - 18}L2220 ${GR - 18}`, C.inkSoft, 2, 0.5);
    let fb = '';
    for (let x = -260; x < 2200; x += 150) fb += `M${x} ${GR}L${x - 120} 1400`;
    L0(g, fb, C.inkSoft, 1.4, 0.25);
    // the door on the right, open inwards, a lit corridor behind
    const dx0 = 1380, dx1 = 1660, dt = 200;
    P0(g, `M${dx0} ${GR}L${dx0} ${dt}L${dx1} ${dt}L${dx1} ${GR}Z`, mix(C.paperLight, C.stain, 0.3), 1);
    const dl = BTL.glow(svg, defs, (dx0 + dx1) / 2, 520, 420, C.stain, 0.22, g);
    P0(g, `M${dx0} ${GR + 30}L${dx0} ${dt - 20}L${dx0 - 120} ${dt - 60}L${dx0 - 120} ${GR + 70}Z`, mix(C.paperLight, C.paperDark, 0.3), 1);
    L0(g, `M${dx0} ${GR + 30}L${dx0} ${dt - 20}L${dx0 - 120} ${dt - 60}L${dx0 - 120} ${GR + 70}ZM${dx0 - 96} ${470}l0 50`, C.inkSoft, 2.4, 0.8);
    L0(g, `M${dx0 - 6} ${GR}L${dx0 - 6} ${dt - 8}L${dx1 + 6} ${dt - 8}L${dx1 + 6} ${GR}`, C.ink, 3, 0.8);
    // the desk
    P0(g, `M380 600L1000 600L1000 624L380 624Z`, C.paperLight, 1);
    L0(g, `M380 600L1000 600L1000 624L380 624ZM404 624L404 ${GR}M976 624L976 ${GR}M420 660L960 660`, C.inkSoft, 3, 0.85);
    // books
    const bk = [[760, 920, 572], [740, 940, 546], [770, 905, 522], [750, 930, 494]];
    for (const [a, b, y] of bk) { const d = `M${a} ${y + 26}L${a} ${y}L${b} ${y}L${b} ${y + 26}Z`; P0(g, d, mix(C.paperLight, C.paper, 0.3), 1); L0(g, d + `M${a + 12} ${y + 6}L${a + 12} ${y + 20}`, C.inkSoft, 2, 0.85); }
    // papers on the desk
    P0(g, 'M600 600L700 592L708 600Z', C.paperLight, 1); L0(g, 'M590 600L700 590L716 600', C.inkSoft, 2, 0.6);
    // candle
    const cx = 520;
    const pool = BTL.glow(svg, defs, cx, 470, 520, C.stain, 0.3, g);
    P0(g, `M${cx - 16} 600L${cx - 16} 500L${cx + 16} 500L${cx + 16} 600Z`, C.paperLight, 1);
    L0(g, `M${cx - 16} 600L${cx - 16} 504C${cx - 8} 498 ${cx + 8} 498 ${cx + 16} 504L${cx + 16} 600M${cx - 40} 600C${cx - 30} 586 ${cx + 30} 586 ${cx + 40} 600M${cx} 502L${cx} 490`, C.ink, 2.6, 0.85);
    const fl = flame(g, cx, 494, 0.9);
    return { fl, pool, dl, GR };
  }
  SH.bt_rosa_room = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'door', { g } = BTL.stage(svg, W, H, { fx: mode === 'fall' ? 760 : 1000, fy: 600 });
      const fall = mode === 'fall';
      const rg = fall ? el(g, 'g', { transform: `translate(${f1(700 - 1.25 * 700)} ${f1(1270 - 1.25 * 1270)}) scale(1.25)` }) : el(g, 'g');
      const S = study(rg, svg, defs);
      let fig = null, sheets = [];
      if (!fall) {
        fig = el(rg, 'g');
        BTL.person(fig, 'stand', 0, S.GR, 520, { face: -1 });
        for (const [dx, dy, rot] of [[-84, -238, -10], [-74, -232, 4]]) {
          const sg = place(fig, dx, S.GR + dy, 1, { rot });
          P0(sg, 'M-30-22h60v44h-60Z', C.paperLight, 1); L0(sg, 'M-30-22h60v44h-60Z', C.inkSoft, 2, 0.9);
        }
      } else {
        // the figure lying on the floor (screen coords; floor at 720 on screen)
        const F = limbFig(g);
        F.set([[[[1100, 806], [1000, 772], [900, 798]], 24], [[[1094, 824], [990, 806], [900, 806]], 24], [[[900, 800], [705, 786]], 54],
          [[[700, 784], [610, 812], [520, 832]], 19], [[[720, 796], [780, 818], [840, 826]], 19]], [[652, 768, 30]]);
        const r = rng(14);
        sheets = [[380, 830, -22], [450, 852, -6], [560, 862, 10], [300, 810, -34], [640, 842, 22]].map(([x, y, rot], i) => {
          const sg = el(g, 'g');
          const d = 'M-62-20L58-24L64 20L-56 24Z';
          P0(sg, d, C.paperLight, 1); L0(sg, d, C.inkSoft, 2, 0.85);
          L0(sg, 'M-40-8L36-10M-38 6L30 4', C.inkSoft, 1.4, 0.5);
          return { sg, x, y, rot, d0: 0.15 * i + r() * 0.2 };
        });
      }
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.55);
          const lean = fall ? 0 : -0.5 * BTL.ease(lt, th - 0.1, 0.5) * (1 - BTL.ease(lt, th + 0.6, 1.6));
          S.fl.update(lt, 1, lean);
          S.pool.set(0.3 + 0.015 * Math.sin(lt * 1.2));
          if (fig) {
            const x = lerp(1530, 1450, BTL.ease(lt, 0, Math.max(2, dur)));
            fig.setAttribute('transform', `translate(${f1(x)} 0)`);
            fade(fig, BTL.ease(lt, 0, 0.8));
          }
          for (const s of sheets) {
            const q = BTL.ease(lt, s.d0, 2.6), x = lerp(540, s.x, q), y = lerp(836, s.y, q);
            s.sg.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(s.rot * q)}) scale(${f1(1)} 1)`);
          }
        },
      };
    },
  };

  // ================================================================== bt_rosa_cartouche (paper)
  SH.bt_rosa_cartouche = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 640 : 470;
      const pool = BTL.glow(svg, defs, cx, cy, 600, C.stain, 0.24, g);
      const sheet = place(g, cx, cy, 1, { rot: -3 });
      const sd = 'M-270-330L270-330L272 330L-268 334Z';
      const sf = P0(sheet, sd, mix(C.paperLight, C.stain, 0.14), 1);
      const so = L0(sheet, sd, C.inkSoft, 2.4, 0.8);
      // faint pencil notes at the top of the sheet
      let notes = '';
      const r = rng(27);
      for (let k = 0; k < 3; k++) { let x = -220; const y = -280 + k * 26; while (x < 180 - k * 60) { const w = 10 + r() * 26; notes += `M${f1(x)} ${y}q${f1(w / 2)} ${f1(-6 - r() * 6)} ${f1(w)} 0`; x += w + 8; } }
      const nt = L0(sheet, notes, C.inkSoft, 1.6, 0.45, { pathLength: 1 });
      // the cartouche: vertical oval + a bar under it
      const ring = L0(sheet, 'M-82-160C-82-214-40-226 0-226C40-226 82-214 82-160L82 150C82 204 40 216 0 216C-40 216-82 204-82 150ZM-90 240L90 240', C.ink, 4, 0.9, { pathLength: 1 });
      const sg = el(sheet, 'g');
      const D1 = glyph(sg, 'sun', 0, -142, 1, { w: 1 }), D2 = glyph(sg, 'ms', 0, -14, 1.05), D3 = glyph(sg, 'cloth', -28, 120, 0.95), D4 = glyph(sg, 'cloth', 30, 120, 0.95);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.3), tb = cue(cues, 'b', dur * 0.7);
          fade(sheet, BTL.ease(lt, 0, 1));
          draw(nt, BTL.ease(lt, 0.2, 2.4));
          draw(ring, BTL.ease(lt, 0.3, 1.8));
          [D1, D2, D3, D4].forEach((D, i) => D.reveal(BTL.ease(lt, th - 0.3 + i * 0.45, 1.6)));
          const k = BTL.ease(lt, tb, 2.4);
          sf.setAttribute('fill-opacity', (1 - 0.8 * k).toFixed(3));
          so.setAttribute('stroke-opacity', (0.8 * (1 - k)).toFixed(3));
          nt.setAttribute('stroke-opacity', (0.45 * (1 - k)).toFixed(3));
          pool.set((0.24 - 0.1 * k) + 0.01 * Math.sin(lt * 1.1));
          pool.e.setAttribute('r', f1(600 - 220 * k));
        },
      };
    },
  };

  // ================================================================== bt_rosa_stone
  SH.bt_rosa_stone = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'three', portrait = H > W;
      if (mode === 'side') return sideBuild({ P, W, H, svg, defs });
      const g = el(svg, 'g');
      const cx = mode === 'bands' ? (portrait ? W / 2 : 760) : W / 2;
      const brk = mode === 'broken', cy = brk ? (portrait ? 760 : 700) : (portrait ? 640 : 480), s = brk ? 1.45 : (portrait ? 1.05 : (mode === 'bands' ? 1 : 1.06));
      const pool = BTL.glow(svg, defs, cx, brk ? cy - 300 : cy - 20, 700, C.stain, 0.42, g);
      const pool2 = BTL.glow(svg, defs, cx, cy, 300, C.stain, 0, g);
      // a soft contact shadow under the stone
      if (mode !== 'broken') P0(g, E(cx, cy + 384 * s, 300 * s, 22 * s), C.paperDark, 0.8);
      // broken (a close-up of the top): the body fades out above the subtitles (y 880)
      let host = g;
      if (brk) {
        const mid = uid('mk'), mk = el(defs, 'mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H });
        el(mk, 'rect', { x: 0, y: 0, width: W, height: H, fill: linGrad(defs, [[0, 'white'], [0.66, 'white'], [0.82, 'black']], { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: H }) });
        host = el(g, 'g', { mask: `url(#${mid})` });
      }
      const sg = place(host, cx, cy, s), ST = stone(sg, defs);
      let dark = null, ghost = null, ticks = [], tlab = null, labels = [], leads = [];
      if (mode === 'reveal') {
        const fill = linGrad(defs, [[0, C.paper, 0], [0.22, C.paper, 0.85], [1, C.paper, 1]], { x2: 1, y2: 0 });
        const cid = uid('sc'), cp = el(defs, 'clipPath', { id: cid }); el(cp, 'path', { d: SOD });
        dark = P0(el(sg, 'g', { 'clip-path': `url(#${cid})` }), 'M-40-400L300-400L300 420L-40 420Z', fill, 1);
      }
      if (mode === 'broken') {
        // the lost upper part: a dashed outline of the missing top
        ghost = L0(sg, 'M-256-170L-262-470L258-470L262-160', C.ink, 2, 0.7, { 'stroke-dasharray': '10 8' });
        const r = rng(14);
        for (let k = 0; k < 14; k++) {
          const y = HROWS[k] - 4, [a] = span(y);
          ticks.push(L0(sg, `M${f1(a - 30)} ${f1(y)}L${f1(a - 12)} ${f1(y)}`, C.gold, 2.4, 1, { opacity: 0 }));
        }
        tlab = halo(ital(g, P.label || '14 satır', cx + (span(-250)[0] - 60) * s, cy - 236 * s, 60, { anchor: 'end', color: C.gold }));
      }
      if (mode === 'bands') {
        const L = P.labels || ['hiyeroglif', 'demotik', 'Yunanca'];
        for (let i = 0; i < 3; i++) {
          const y = cy + bandMid(i) * s, x0 = cx + (span(bandMid(i))[1] + 20) * s;
          leads.push(L0(g, `M${f1(x0)} ${f1(y)}L${f1(x0 + 80)} ${f1(y)}`, C.gold, 2.5, 1, { pathLength: 1 }));
          labels.push(halo(ital(g, L[i], x0 + 104, y + 18, 58, { anchor: 'start', color: C.ink })));
        }
      }
      const BG = BANDS.map((b, i) => BTL.glow(svg, defs, cx, cy + bandMid(i) * s, 330, C.stain, 0, g));
      // the band glows sit under the stone drawing
      for (const b of BG) g.insertBefore(b.e, brk ? host : sg);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.3), tb = cue(cues, 'b', dur * 0.7);
          if (mode === 'reveal') {
            const a = BTL.ease(lt, th - 0.4, 1.8);
            draw(ST.outline, BTL.ease(lt, 0, Math.max(1.2, th)));
            ST.outline.setAttribute('stroke-opacity', (0.35 + 0.45 * a).toFixed(3));
            fade(sg, 0.18 + 0.82 * a);
            ST.bands.forEach((b, i) => { draw(b, 1); b.setAttribute('stroke-opacity', (0.15 + 0.6 * a).toFixed(3)); });
            const k = BTL.ease(lt, tb - 0.6, 0.9);
            pool.set((0.06 + 0.38 * a) * (1 - 0.25 * k) + 0.01 * Math.sin(lt));
            pool.e.setAttribute('cx', f1(cx - 190 * k)); pool.e.setAttribute('r', f1(700 - 220 * k));
            dark.setAttribute('opacity', k.toFixed(3));
            return;
          }
          draw(ST.outline, BTL.ease(lt, 0, 1.4));
          fade(sg, BTL.ease(lt, 0, 0.9));
          pool.set(0.42 + 0.015 * Math.sin(lt * 1.1));
          if (mode === 'three') {
            if (P.all) {
              const k = BTL.ease(lt, th - 0.3, 1.8);
              ST.bands.forEach((b, i) => { draw(b, 1); b.setAttribute('stroke', k > 0.5 ? C.ink : C.inkSoft); b.setAttribute('stroke-opacity', (0.45 + 0.5 * k).toFixed(3)); BG[i].set(0.1 * k); });
              pool.set(0.38 + 0.08 * k + 0.012 * Math.sin(lt * 1.1));
            } else {
              ST.bands.forEach((b, i) => {
                const q = BTL.ease(lt, th - 0.2 + i * 0.5, 1.1);
                draw(b, q); b.setAttribute('stroke-opacity', '0.95');
                BG[i].set(0.12 * BTL.ease(lt, th + i * 0.5, 0.6) * (1 - 0.6 * BTL.ease(lt, th + i * 0.5 + 1.2, 1.2)));
              });
            }
          } else if (mode === 'bands') {
            const ts = [0, 1, 2].map(i => cue(cues, 'c' + i, dur * (0.15 + i * 0.3)));
            let act = -1; ts.forEach((t, i) => { if (lt >= t - 0.15) act = i; });
            ST.bands.forEach((b, i) => {
              draw(b, 1);
              const on = act === i ? BTL.ease(lt, ts[i] - 0.15, 0.7) : 0, seen = act >= i;
              b.setAttribute('stroke', on > 0.5 ? C.ink : C.inkSoft);
              b.setAttribute('stroke-opacity', (act < 0 ? 0.8 : (act === i ? 0.4 + 0.6 * on : 0.35)).toFixed(3));
              BG[i].set(0.16 * on);
              draw(leads[i], seen ? BTL.ease(lt, ts[i] - 0.1, 0.6) : 0);
              fade(labels[i], seen ? BTL.ease(lt, ts[i], 0.8) * (act === i ? 1 : 0.7) : 0);
              labels[i].setAttribute('fill', act === i ? C.gold : C.inkSoft);
              leads[i].setAttribute('stroke-opacity', act === i ? '1' : '0.4');
            });
          } else if (mode === 'broken') {
            ST.bands.forEach(b => { draw(b, 1); b.setAttribute('stroke-opacity', '0.85'); });
            const k = BTL.ease(lt, th - 0.2, 1.2) * (1 - BTL.ease(lt, tb - 0.6, 1.6));
            fade(ghost, k * 0.9);
            ticks.forEach((t, i) => fade(t, BTL.ease(lt, tb - 0.3 + i * 0.07, 0.3)));
            fade(tlab, BTL.ease(lt, tb - 0.1, 0.8));
            pool2.e.setAttribute('cy', f1(cy - 240 * s)); pool2.set(0.12 * BTL.ease(lt, tb, 1.5));
          }
        },
      };
    },
  };
  // the stone in a museum case, seen a little from the left (its left side shows)
  function sideBuild({ P, W, H, svg, defs }) {
    const { g } = BTL.stage(svg, W, H, { fx: 900, fy: 520 });
    const GR = 880, cx = 1000, s = 0.78, by = 760, cy = by - 380 * s;
    P0(g, `M-300 ${GR}L2220 ${GR}L2220 1900L-300 1900Z`, mix(C.paperDark, C.paper, 0.4), 1);
    L0(g, `M-300 ${GR}L2220 ${GR}`, C.inkSoft, 2, 0.5);
    // the spot from above
    const cone = linGrad(defs, [[0, C.stain, 0.2], [1, C.stain, 0]]);
    P0(g, `M${cx - 70} -10L${cx + 70} -10L${cx + 280} ${GR}L${cx - 300} ${GR}Z`, cone, 1);
    const pool = BTL.glow(svg, defs, cx - 40, 470, 560, C.stain, 0.26, g);
    // plinth
    P0(g, `M${cx - 240} ${by}L${cx + 220} ${by}L${cx + 220} ${GR}L${cx - 240} ${GR}Z`, C.paperLight, 1);
    P0(g, `M${cx - 240} ${by}L${cx - 290} ${by - 18}L${cx - 290} ${GR - 10}L${cx - 240} ${GR}Z`, mix(C.paperLight, C.paperDark, 0.5), 1);
    L0(g, `M${cx - 240} ${by}L${cx + 220} ${by}L${cx + 220} ${GR}M${cx - 240} ${by}L${cx - 240} ${GR}M${cx - 240} ${by}L${cx - 290} ${by - 18}L${cx - 290} ${GR - 10}`, C.inkSoft, 2.5, 0.8);
    // the left side face of the stone (thickness), then the front
    const side = SO.slice(0, 4).map(([x, y]) => [cx + x * s, cy + y * s]);
    const back = side.map(([x, y]) => [x - 64, y - 20]).reverse();
    const sd = 'M' + side.concat(back).map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
    P0(g, sd, mix(C.paperLight, C.paperDark, 0.55), 1);
    L0(g, sd, C.ink, 2.6, 0.7);
    const sg = place(g, cx, cy, s), ST = stone(sg, defs);
    ST.bands.forEach(b => { draw(b, 1); b.setAttribute('stroke-opacity', '0.6'); });
    draw(ST.outline, 1);
    // the painted line on the side (white paint, unreadable small capitals)
    const r = rng(1801);
    let paint = '';
    const sx0 = cx - 258 * s - 54, sx1 = cx - 258 * s - 10;
    for (let k = 0; k < 3; k++) {
      const y = 430 + k * 22; let x = sx0 + 2;
      while (x < sx1 - 5) { const q = Math.floor(r() * 4); paint += [`M${f1(x)} ${y + 3}v-9`, `M${f1(x)} ${y + 3}l2.5 -9l2.5 9`, `M${f1(x)} ${y + 3}v-9h4v9`, `M${f1(x + 4)} ${y - 6}h-4v9h4`][q]; x += q ? 7 : 4; }
    }
    const pl = L0(g, paint, C.ink, 1.8, 0.95, { pathLength: 1 });
    const pglow = BTL.glow(svg, defs, (sx0 + sx1) / 2, 452, 140, C.stain, 0, g);
    g.insertBefore(pglow.e, pl);
    // the glass case
    const gx0 = cx - 340, gx1 = cx + 290, gy0 = 110;
    L0(g, `M${gx0} ${by}L${gx0} ${gy0}L${gx1} ${gy0}L${gx1} ${by}M${gx0} ${gy0}L${gx0 - 40} ${gy0 - 18}L${gx1 - 40} ${gy0 - 18}L${gx1} ${gy0}M${gx0 - 40} ${gy0 - 18}L${gx0 - 40} ${by - 18}`, C.inkSoft, 2, 0.6);
    const sheen = L0(g, '', C.ink, 3, 0.08);
    const lab = halo(ital(g, P.label || 'ele geçirildi · 1801', sx0 - 40, 600, 56, { anchor: 'end', color: C.ink }));
    const tick = L0(g, `M${sx0 - 30} 470L${sx0 - 6} 458`, C.gold, 2.5, 1, { pathLength: 1 });
    return {
      update(lt, dur, cues) {
        const th = cue(cues, 'hit', dur * 0.25), tb = cue(cues, 'b', dur * 0.75);
        pool.set(0.26 + 0.012 * Math.sin(lt * 1.1));
        const q = (lt * 0.06) % 1.4, x = gx0 - 200 + q * 900;
        sheen.setAttribute('d', `M${f1(Math.max(gx0, x))} ${f1(gy0 + Math.max(0, gx0 - x) * 1.2)}L${f1(Math.min(gx1, x + 200))} ${f1(gy0 + 240 - Math.max(0, x + 200 - gx1) * 1.2)}`);
        draw(pl, BTL.ease(lt, th - 0.2, 1.8));
        pglow.set(0.22 * BTL.ease(lt, th, 1.2));
        draw(tick, BTL.ease(lt, th + 0.6, 0.6));
        fade(lab, BTL.ease(lt, tb - 0.5, 0.7));
      },
    };
  }

  // ================================================================== bt_rosa_philae
  SH.bt_rosa_philae = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'carve', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const night = mode === 'night', WL = 770;
      const stars = BTL.stars(g, night ? 120 : 50, 394, [0, 0, 1920, 420]);
      fade(stars.g, night ? 1 : 0.45);
      const sky = BTL.glow(svg, defs, 1000, WL - 40, 900, C.stain, night ? 0.06 : 0.18, g);
      const T0 = el(g, 'g');
      const wallF = night ? mix(C.paperLight, C.paperDark, 0.45) : C.paperLight;
      const tower = (x0, x1) => `M${x0} ${WL - 60}L${x0 + 28} 300L${x1 - 28} 300L${x1} ${WL - 60}Z`;
      const temple = (G, ghostly) => {
        // the island rock
        P0(G, `M240 ${WL}C300 ${WL - 50} 420 ${WL - 70} 520 ${WL - 62}L1660 ${WL - 62}C1740 ${WL - 60} 1800 ${WL - 30} 1840 ${WL}Z`, mix(C.paperLight, C.paperDark, 0.5), 1);
        for (const [a, b] of [[500, 830], [910, 1240]]) {
          P0(G, tower(a, b), wallF, 1);
          P0(G, `M${a + 20} 300L${a + 12} 270L${b - 12} 270L${b - 20} 300Z`, mix(wallF, C.ink, 0.06), 1);
          if (!ghostly) {
            L0(G, tower(a, b) + `M${a + 20} 300L${a + 12} 270L${b - 12} 270L${b - 20} 300M${a + 26} 320L${b - 26} 320`, C.inkSoft, 2.5, 0.85);
            // the great relief figures, faint
            L0(G, `M${a + 110} 640L${a + 110} 450M${b - 110} 640L${b - 110} 450M${a + 90} 470C${a + 110} 440 ${a + 130} 440 ${a + 150} 470M${b - 150} 470C${b - 130} 440 ${b - 110} 440 ${b - 90} 470`, C.inkSoft, 1.8, 0.35);
          }
        }
        // the gate
        P0(G, `M820 ${WL - 60}L820 420L920 420L920 ${WL - 60}Z`, wallF, 1);
        P0(G, `M846 ${WL - 60}L846 500L894 500L894 ${WL - 60}Z`, C.paperDark, 1);
        if (!ghostly) L0(G, `M820 ${WL - 60}L820 420L920 420L920 ${WL - 60}M812 420L928 420M812 404L928 404M846 ${WL - 60}L846 500L894 500L894 ${WL - 60}`, C.inkSoft, 2.5, 0.85);
        // the low wall / colonnade on the right
        P0(G, `M1240 ${WL - 60}L1240 520L1660 520L1660 ${WL - 60}Z`, wallF, 1);
        if (!ghostly) {
          L0(G, `M1240 ${WL - 60}L1240 520L1660 520L1660 ${WL - 60}M1232 520L1668 520M1232 506L1668 506`, C.inkSoft, 2.5, 0.85);
          let cl = ''; for (let x = 1300; x < 1640; x += 70) cl += `M${x} ${WL - 60}L${x} 540M${x - 14} 540L${x + 14} 540`;
          L0(G, cl, C.inkSoft, 2, 0.55);
        }
      };
      temple(T0, false);
      // water + reflection
      P0(g, `M-300 ${WL}L2220 ${WL}L2220 1900L-300 1900Z`, mix(C.paper, C.paperDark, 0.5), 1);
      const RF = el(g, 'g', { transform: `translate(0 ${2 * WL}) scale(1 -1)`, opacity: 0.22 });
      temple(RF, true);
      L0(g, `M-300 ${WL}L2220 ${WL}`, C.inkSoft, 2, 0.6);
      const rip = el(g, 'g'), rr = rng(7), rips = [];
      for (let i = 0; i < 26; i++) { const y = WL + 16 + rr() * 260, x = 260 + rr() * 1500, w = 40 + rr() * 140; rips.push({ e: L0(rip, `M0 0h${f1(w)}`, C.inkSoft, 1.6, 0.35), x, y, ph: rr() * 6, sp: 0.2 + rr() * 0.25 }); }
      // the carving: a small god figure + columns of signs on the right tower, by the gate
      const cg = el(g, 'g');
      const carveD = (() => {
        let d = 'M980 640L980 556M970 556C970 530 990 530 990 556M980 528C972 528 970 516 976 510L984 498L988 512C992 520 988 528 980 528ZM980 556L1004 580M966 640L994 640';
        const r = rng(394);
        for (let c = 0; c < 4; c++) { const x = 1030 + c * 34; for (let y = 500; y < 640; y += 22) { const q = Math.floor(r() * 4); d += [`M${x} ${y}h16`, `M${x + 8} ${y - 8}v16`, `M${x} ${y + 4}q8 -14 16 0`, `M${x + 3} ${y - 5}h10v10h-10z`][q]; } }
        return d;
      })();
      const carve = L0(cg, carveD, C.gold, 2.6, 1, { pathLength: 1 });
      const carveGrey = L0(cg, carveD, C.inkSoft, 2.6, 0);
      const lab = mode === 'carve' ? halo(ital(g, P.label || '394', 1090, 450, 64, { color: C.gold, anchor: 'middle' })) : null;
      // the oil lamp before the gate
      let lamp = null, lpool = null, sm = null;
      if (mode !== 'carve') {
        lpool = BTL.glow(svg, defs, 870, WL - 110, 300, C.stain, 0.3, g);
        P0(g, `M840 ${WL - 62}L900 ${WL - 62}L890 ${WL - 72}L850 ${WL - 72}Z`, C.paperLight, 1);
        P0(g, `M842 ${WL - 72}C842 ${WL - 92} 898 ${WL - 92} 898 ${WL - 72}Z`, C.paperLight, 1);
        L0(g, `M840 ${WL - 62}L900 ${WL - 62}M842 ${WL - 72}C842 ${WL - 92} 898 ${WL - 92} 898 ${WL - 72}ZM898 ${WL - 80}l14 -6`, C.inkSoft, 2.4, 0.9);
        lamp = flame(g, 870, WL - 92, 0.5);
        sm = smoke(g, 870, WL - 100, 0.9);
      }
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          stars.update(lt);
          for (const q of rips) q.e.setAttribute('transform', `translate(${f1(q.x + 18 * Math.sin(lt * q.sp + q.ph))} ${f1(q.y)})`);
          if (mode === 'carve') {
            draw(carve, BTL.ease(lt, 0.3, Math.max(2.5, dur - 1)));
            fade(lab, BTL.ease(lt, th - 0.1, 1));
            sky.set(0.18 + 0.01 * Math.sin(lt * 0.9));
          } else if (mode === 'dusk') {
            const out = BTL.ease(lt, th, 1.8);
            draw(carve, 1);
            carve.setAttribute('stroke-opacity', (1 - out).toFixed(3)); carveGrey.setAttribute('stroke-opacity', (0.7 * out).toFixed(3));
            lamp.update(lt, 1 - out); lpool.set(0.3 * (1 - out) + 0.01 * Math.sin(lt * 1.3));
            sm.update(lt, th + 0.6);
            sky.set(0.14 - 0.06 * out);
          } else {
            draw(carve, 0);
            lamp.update(lt, 1); lpool.set(0.26 + 0.04 * BTL.ease(lt, th, 2) + 0.01 * Math.sin(lt * 1.3));
          }
        },
      };
    },
  };

  // ================================================================== bt_rosa_obelisk
  SH.bt_rosa_obelisk = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 480 });
      const stars = BTL.stars(g, 150, 9, [0, 0, 1920, 760]);
      const GR = 900;
      BTL.glow(svg, defs, 960, 560, 640, C.stain, 0.14, g);
      P0(g, `M-300 ${GR}C300 ${GR - 40} 700 ${GR - 20} 960 ${GR - 10}C1300 ${GR} 1700 ${GR - 50} 2220 ${GR - 20}L2220 1900L-300 1900Z`, mix(C.paperDark, C.paper, 0.3), 1);
      L0(g, `M-300 ${GR}C300 ${GR - 40} 700 ${GR - 20} 960 ${GR - 10}C1300 ${GR} 1700 ${GR - 50} 2220 ${GR - 20}`, C.inkSoft, 2, 0.5);
      const ob = `M840 ${GR - 6}L884 140L1036 140L1080 ${GR - 6}Z`, py = 'M884 140L960 46L1036 140Z';
      P0(g, ob, C.paperLight, 1); P0(g, `M984 140L1036 140L1080 ${GR - 6}L1000 ${GR - 6}Z`, mix(C.paperLight, C.paperDark, 0.4), 1);
      P0(g, py, mix(C.paperLight, C.stain, 0.15), 1);
      L0(g, ob + py + `M984 140L1000 ${GR - 6}M960 46L984 140`, C.ink, 3, 0.8);
      const names = ['owl', 'reed', 'water', 'sun', 'bread', 'cobra', 'eye', 'ms', 'cloth', 'ankh', 'mouth', 'stool'];
      const gx = i => 934 - i * 1.2, gy = i => 205 + i * 56;
      const glows = names.map((n, i) => BTL.glow(svg, defs, gx(i), gy(i), 50, C.gold, 0, g));
      const signs = names.map((n, i) => glyph(g, n, gx(i), gy(i), 0.5, { w: 0.65 }));
      signs.forEach(D => D.reveal(1));
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          stars.update(lt);
          signs.forEach((D, i) => {
            const k = BTL.ease(lt, th - 0.3 + i * 0.16, 0.6);
            for (const it of D.items) if (it.k === 's') it.e.setAttribute('stroke', k > 0.5 ? C.gold : C.ink);
            glows[i].set(0.35 * k);
          });
        },
      };
    },
  };

  // ================================================================== bt_rosa_glyphs
  SH.bt_rosa_glyphs = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const pos = portrait ? [[540, 330], [540, 640], [540, 950]] : [[480, 440], [960, 440], [1440, 440]];
      const sc = portrait ? 2.2 : 2.7;
      const pools = pos.map(([x, y]) => BTL.glow(svg, defs, x, y, 300, C.stain, 0, g));
      const D = ['owl', 'eye', 'cobra'].map((n, i) => glyph(g, n, pos[i][0], pos[i][1], sc, { w: 1.1 }));
      const lab = halo(ital(g, P.label || 'gizli anlam?', W / 2, portrait ? 1120 : 790, 60, { color: C.ink }));
      return {
        update(lt, dur, cues) {
          const ts = [0, 1, 2].map(i => cue(cues, 'c' + i, 0.3 + i * dur * 0.25));
          D.forEach((d, i) => { d.reveal(BTL.ease(lt, ts[i] - 0.3, 1.8)); pools[i].set(0.2 * BTL.ease(lt, ts[i] - 0.3, 1.2) + 0.01 * Math.sin(lt + i)); });
          fade(lab, BTL.ease(lt, Math.min(ts[2] + 1.4, dur - 1.4), 1.2));
        },
      };
    },
  };

  // ================================================================== bt_rosa_wall
  SH.bt_rosa_wall = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 990, fy: 560 });
      const GR = 880, r = rng(11);
      // a pale beam from the upper left
      const beam = linGrad(defs, [[0, C.stain, 0.16], [1, C.stain, 0]], { x1: 0, y1: 0, x2: 0.6, y2: 1 });
      P0(g, 'M260 -10L620 -10L1460 900L900 900Z', beam, 1);
      const pool = BTL.glow(svg, defs, 990, 520, 620, C.stain, 0.2, g);
      P0(g, `M-300 ${GR}L2220 ${GR}L2220 1900L-300 1900Z`, mix(C.paperDark, C.paper, 0.35), 1);
      L0(g, `M-300 ${GR}L2220 ${GR}`, C.inkSoft, 2, 0.5);
      // courses of blocks; the top is ruined (rows get shorter, blocks missing)
      const rows = 6, rh = 96, y0 = GR - rows * rh;
      let key = null;
      for (let k = 0; k < rows; k++) {
        const y = GR - (k + 1) * rh, cut = k * 70 + r() * 60;
        let x = 140 + (k % 2) * 90 + cut * 0.6;
        const xe = 1800 - cut * 0.9;
        while (x < xe) {
          const w = Math.min(xe - x, 170 + r() * 110);
          if (w < 60) break;
          const isKey = k === 2 && !key && x > 860;
          if (k >= 4 && r() < 0.3) { x += w; continue; }
          const j = () => (r() - 0.5) * 8;
          const d = `M${f1(x + 4 + j())} ${f1(y + 4 + j())}L${f1(x + w - 4 + j())} ${f1(y + 4 + j())}L${f1(x + w - 4 + j())} ${f1(y + rh - 4 + j())}L${f1(x + 4 + j())} ${f1(y + rh - 4 + j())}Z`;
          if (isKey) { key = { d, x, y, w }; P0(g, d, mix(C.paperDark, C.paper, 0.2), 1); L0(g, d, C.inkSoft, 2.2, 0.8); }
          else { P0(g, d, mix(C.paperLight, C.paper, r() * 0.5), 1); L0(g, d, C.inkSoft, 2.2, 0.75); }
          x += w;
        }
      }
      // rubble at the foot
      let rb = '';
      for (let i = 0; i < 26; i++) { const x = 120 + r() * 1700, s = 14 + r() * 34; rb += `M${f1(x)} ${GR}l${f1(s * 0.3)} ${f1(-s * 0.8)}l${f1(s * 0.8)} ${f1(-s * 0.2)}l${f1(s * 0.4)} ${f1(s)}Z`; }
      P0(g, rb, C.paperLight, 1); L0(g, rb, C.inkSoft, 2, 0.7);
      // the key block: faint signs on its face, a gold edge on hit
      const kglow = BTL.glow(svg, defs, key.x + key.w / 2, key.y + rh / 2, 220, C.gold, 0, g);
      let km = ''; for (let yy = key.y + 26; yy < key.y + rh - 16; yy += 16) for (let xx = key.x + 20; xx < key.x + key.w - 24; xx += 12) km += `M${f1(xx)} ${f1(yy)}q4 -6 8 0`;
      const kmarks = L0(g, km, C.inkSoft, 1.4, 0.5);
      const kedge = L0(g, key.d, C.gold, 3, 1, { pathLength: 1 });
      const dust = motes(g, 26, 5, [360, 60, 1300, 860]);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.55);
          dust.update(lt);
          pool.set(0.2 + 0.012 * Math.sin(lt * 0.9));
          draw(kedge, BTL.ease(lt, th - 0.1, 1.4));
          kglow.set(0.22 * BTL.ease(lt, th, 1.6));
          kmarks.setAttribute('stroke-opacity', (0.3 + 0.5 * BTL.ease(lt, th + 0.4, 1.6)).toFixed(3));
        },
      };
    },
  };

  // ================================================================== bt_rosa_fort
  SH.bt_rosa_fort = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 900, fy: 600 });
      const HZ = 640, GR = 780, r = rng(99);
      const sun = el(g, 'circle', { cx: 1560, cy: HZ - 30, r: 70, fill: C.ink, 'fill-opacity': 0.35 });
      BTL.glow(svg, defs, 1560, HZ - 30, 900, C.stain, 0.24, g);
      // the far plain
      P0(g, `M-300 ${HZ}L2220 ${HZ}L2220 1900L-300 1900Z`, mix(C.paper, C.paperDark, 0.3), 1);
      L0(g, `M-300 ${HZ}L2220 ${HZ}`, C.inkSoft, 2, 0.5);
      // the ruined fort wall (right), stepped broken top
      const wt = [[860, GR], [860, 430], [960, 430], [980, 400], [1120, 400], [1140, 360], [1300, 360], [1320, 330], [1520, 330], [1540, 380], [1700, 380], [1720, 440], [2220, 440], [2220, GR]];
      const wd = 'M' + wt.map(p => p.join(' ')).join('L') + 'Z';
      P0(g, wd, mix(C.paperLight, C.paperDark, 0.25), 1);
      L0(g, wd, C.inkSoft, 2.4, 0.8);
      let bl = '';
      for (let y = 330, k = 0; y < GR; y += 48, k++) { bl += `M860 ${y}L2220 ${y}`; for (let x = 880 + (k % 2) * 55; x < 2220; x += 110) bl += `M${x} ${y}v48`; }
      const wid = uid('wc'), wcp = el(defs, 'clipPath', { id: wid }); el(wcp, 'path', { d: wd });
      L0(el(g, 'g', { 'clip-path': `url(#${wid})` }), bl, C.inkSoft, 1.4, 0.35);
      // the ground in front + rubble
      P0(g, `M-300 ${GR}C200 ${GR - 10} 600 ${GR + 10} 860 ${GR}L2220 ${GR}L2220 1900L-300 1900Z`, mix(C.paperDark, C.paper, 0.4), 1);
      L0(g, `M-300 ${GR}C200 ${GR - 10} 600 ${GR + 10} 860 ${GR}L2220 ${GR}`, C.inkSoft, 2, 0.6);
      let rb = '';
      for (let i = 0; i < 18; i++) { const x = 840 + r() * 900, y = GR + 10 + r() * 70, s = 18 + r() * 30; rb += `M${f1(x)} ${f1(y)}l${f1(s * 0.3)} ${f1(-s * 0.8)}l${f1(s * 0.8)} ${f1(-s * 0.2)}l${f1(s * 0.4)} ${f1(s)}Z`; }
      P0(g, rb, C.paperLight, 1); L0(g, rb, C.inkSoft, 2, 0.7);
      // the black stone's corner at the foot of the wall
      const SX = 930, SY = GR + 40;
      const spool = BTL.glow(svg, defs, SX + 40, SY - 30, 260, C.stain, 0, g);
      const cd = `M${SX - 60} ${SY + 20}L${SX - 50} ${SY - 70}L${SX + 70} ${SY - 96}L${SX + 130} ${SY - 40}L${SX + 120} ${SY + 20}Z`;
      const corner = el(g, 'g', { opacity: 0 });
      P0(corner, cd, mix(C.paperDark, C.paper, 0.1), 1);
      let cm = ''; for (let k = 0; k < 5; k++) { const y = SY - 60 + k * 14; for (let x = SX - 40 + k * 4; x < SX + 100 - k * 2; x += 10) cm += `M${x} ${y}q3 -6 6 0`; }
      L0(corner, cm, C.inkSoft, 1.4, 0.8);
      L0(corner, cd, C.ink, 2.6, 0.85);
      // two soldiers with picks far off on the rubble
      const picks = [];
      for (const [x, s, ph] of [[1480, 150, 0], [1640, 140, 1.9]]) {
        BTL.person(g, 'bend', x, GR + 20, s, { face: -1 });
        const hx = x - 0.4 * s, hy = GR + 20 - 0.28 * s;
        const pg = el(g, 'g');
        L0(pg, `M0 0L${f1(-0.05 * s)} ${f1(-0.5 * s)}M${f1(-0.22 * s)} ${f1(-0.52 * s)}C${f1(-0.1 * s)} ${f1(-0.6 * s)} ${f1(0.08 * s)} ${f1(-0.56 * s)} ${f1(0.16 * s)} ${f1(-0.44 * s)}`, C.inkSoft, 4, 0.9);
        picks.push({ pg, hx, hy, ph });
      }
      // the officer bending in front, bicorne hat
      const OX = 640, OH = 360;
      BTL.person(g, 'bend', OX, GR + 70, OH, { face: 1 });
      const hx = OX + 0.36 * OH, hy = GR + 70 - 0.6 * OH - 0.04 * OH;
      const hat = `M${f1(hx - 58)} ${f1(hy + 6)}C${f1(hx - 50)} ${f1(hy - 30)} ${f1(hx - 20)} ${f1(hy - 42)} ${f1(hx)} ${f1(hy - 44)}C${f1(hx + 20)} ${f1(hy - 42)} ${f1(hx + 50)} ${f1(hy - 30)} ${f1(hx + 58)} ${f1(hy + 6)}C${f1(hx + 30)} ${f1(hy - 6)} ${f1(hx - 30)} ${f1(hy - 6)} ${f1(hx - 58)} ${f1(hy + 6)}Z`;
      el(g, 'path', { d: hat, fill: C.paperDark, stroke: C.inkSoft, 'stroke-width': 2.5, 'stroke-opacity': 0.85, 'stroke-linejoin': 'round' });
      const lab = halo(ital(g, P.label || 'Bouchard', OX + 60, GR - 330, 56, { anchor: 'middle', color: C.ink }));
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          sun.setAttribute('cy', f1(HZ - 30 + lt * 3));
          for (const p of picks) p.pg.setAttribute('transform', `translate(${f1(p.hx)} ${f1(p.hy)}) rotate(${f1(-30 + 26 * Math.sin(lt * 1.4 + p.ph))})`);
          const k = BTL.ease(lt, th - 0.2, 1.4);
          fade(corner, 0.25 + 0.75 * k); spool.set(0.32 * k + 0.01 * Math.sin(lt));
          fade(lab, BTL.ease(lt, th + 0.6, 1));
        },
      };
    },
  };

  // ================================================================== bt_rosa_greek
  SH.bt_rosa_greek = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 480, k: 1.6 });
      const pool = BTL.glow(svg, defs, 960, 500, 900, C.stain, 0.18, g);
      const surf = 'M150 40L1700 30L1730 300L1760 620L1770 940L140 950L150 600L120 300Z';
      const fill = linGrad(defs, [[0, mix(C.paperLight, C.stain, 0.12)], [0.5, mix(C.paperLight, C.paperDark, 0.12)], [1, mix(C.paperLight, C.paperDark, 0.5)]], { x2: 1, y2: 1 });
      el(g, 'path', { d: surf, fill });
      const r = rng(196);
      let sp = ''; for (let i = 0; i < 1400; i++) { const x = 150 + r() * 1600, y = 40 + r() * 900, s = 1 + r() * 2.2; sp += `M${f1(x)} ${f1(y)}h${f1(s)}v${f1(s)}h${f1(-s)}z`; }
      P0(g, sp, C.inkSoft, 0.2);
      L0(g, surf, C.ink, 3, 0.6);
      // the end of the demotic band at the top
      let dm = '';
      for (let k = 0; k < 2; k++) { const y = 100 + k * 44; let x = 190; while (x < 1660) { const w = 8 + r() * 16, h = 8 + r() * 12; dm += `M${f1(x)} ${f1(y)}q${f1(w * 0.5)} ${f1(-h * 1.3)} ${f1(w)} ${f1(-h * (0.2 + r() * 0.6))}`; x += w + 6 + r() * 8; } }
      L0(g, dm, C.inkSoft, 2.6, 0.7);
      // Greek rows
      const rows = ['ΒΑΣΙΛΕΥΟΝΤΟΣΤΟΥΝΕΟΥΚΑΙΠΑΡΑΛΑΒΟΝΤΟΣΤΗΝ', 'ΒΑΣΙΛΕΙΑΝΠΑΡΑΤΟΥΠΑΤΡΟΣΚΥΡΙΟΥΒΑΣΙΛΕΙΩΝ', null, 'ΗΓΑΠΗΜΕΝΟΥΥΠΟΤΟΥΦΘΑΘΕΟΥΕΠΙΦΑΝΟΥΣ', 'ΤΟΙΣΤΕΙΕΡΟΙΣΚΑΙΕΓΧΩΡΙΟΙΣΚΑΙΕΛΛΗΝΙΚΟΙΣ'];
      const hgt = 54, ys = [280, 410, 540, 670, 800];
      const cid = uid('clip'), cp = el(defs, 'clipPath', { id: cid }); el(cp, 'path', { d: surf });
      const RG = el(g, 'g', { 'clip-path': `url(#${cid})` });
      rows.forEach((s, i) => { if (s) L0(RG, greek(s, 170 - i * 23, ys[i], hgt).d, C.inkSoft, 4, 0.85); });
      const pre = greek('ΚΑΙΤΟΥ', 0, 0, hgt).w, word = greek('ΠΤΟΛΕΜΑΙΟΣ', 0, 0, hgt).w;
      const wx = 960 - word / 2;
      L0(RG, greek('ΑΣΙΛΕΩΣ', wx - pre - 80 - greek('ΑΣΙΛΕΩΣ', 0, 0, hgt).w - 30, ys[2], hgt).d + greek('ΚΑΙΤΟΥ', wx - pre - 40, ys[2], hgt).d + greek('ΑΙΩΝΟΒΙΟΣΗΓΑΠΗΜΕΝΟΣ', wx + word + 46, ys[2], hgt).d, C.inkSoft, 4, 0.85);
      const PT = L0(g, greek('ΠΤΟΛΕΜΑΙΟΣ', wx, ys[2], hgt).d, C.ink, 4.5, 1);
      const wglow = BTL.glow(svg, defs, 960, ys[2] - 26, 380, C.stain, 0, g);
      g.insertBefore(wglow.e, PT);
      const line = L0(g, `M150 ${ys[2] + 22}L1760 ${ys[2] + 22}`, C.gold, 3, 1, { pathLength: 1 });
      const tip = BTL.glow(svg, defs, 150, ys[2] + 22, 70, C.gold, 0, g);
      const up = [L0(g, `M${f1(wx + 40)} ${ys[2] - hgt - 16}L${f1(wx + 40)} 108`, C.gold, 2.5, 1, { pathLength: 1 }), L0(g, `M${f1(wx + word - 40)} ${ys[2] - hgt - 16}L${f1(wx + word - 40)} -20`, C.gold, 2.5, 1, { pathLength: 1 })];
      const dot = el(g, 'circle', { cx: f1(wx + 40), cy: 108, r: 7, fill: C.gold, opacity: 0 });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.2), tb = cue(cues, 'b', dur * 0.65);
          pool.set(0.18 + 0.01 * Math.sin(lt * 0.9));
          const q = lin(lt, th - 0.3, Math.max(2, tb - th));
          draw(line, q);
          tip.e.setAttribute('cx', f1(150 + 1610 * q)); tip.set(q > 0 && q < 1 ? 0.5 : 0);
          wglow.set(0.2 * BTL.ease(lt, th + 0.3, 1.4));
          PT.setAttribute('stroke', q > 0.45 ? C.gold : C.ink);
          up.forEach((u, i) => draw(u, BTL.ease(lt, tb - 0.1 + i * 0.3, 1.4)));
          fade(dot, BTL.ease(lt, tb + 1.1, 0.5));
        },
      };
    },
  };

  // ================================================================== bt_rosa_king
  SH.bt_rosa_king = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 840;
      BTL.glow(svg, defs, 960, 520, 800, C.stain, 0.12, g);
      const shaft = linGrad(defs, [[0, C.stain, 0.2], [1, C.stain, 0]]);
      const beam = P0(g, `M1140 -10L1300 -10L1420 ${GR - 60}L1060 ${GR - 60}Z`, shaft, 0);
      const kpool = BTL.glow(svg, defs, 1240, 560, 360, C.stain, 0, g);
      P0(g, `M-300 ${GR}L2220 ${GR}L2220 1900L-300 1900Z`, mix(C.paperDark, C.paper, 0.4), 1);
      L0(g, `M-300 ${GR}L2220 ${GR}`, C.inkSoft, 2, 0.5);
      // papyrus columns framing the hall
      for (const x of [230, 1690]) {
        P0(g, `M${x - 60} ${GR}L${x - 60} 170L${x + 60} 170L${x + 60} ${GR}Z`, C.paperLight, 1);
        P0(g, `M${x - 60} 170C${x - 110} 120 ${x - 110} 60 ${x - 96} 30L${x + 96} 30C${x + 110} 60 ${x + 110} 120 ${x + 60} 170Z`, C.paperLight, 1);
        L0(g, `M${x - 60} ${GR}L${x - 60} 170M${x + 60} ${GR}L${x + 60} 170M${x - 60} 170C${x - 110} 120 ${x - 110} 60 ${x - 96} 30L${x + 96} 30C${x + 110} 60 ${x + 110} 120 ${x + 60} 170M${x - 64} 170L${x + 64} 170M${x - 60} 200h120M${x - 60} 214h120M${x - 110} 30L${x + 110} 30M${x - 110} 14L${x + 110} 14`, C.inkSoft, 2.4, 0.8);
        L0(g, `M${x - 30} 600L${x - 30} 260M${x} 600L${x} 260M${x + 30} 600L${x + 30} 260`, C.inkSoft, 1.4, 0.35);
      }
      // the dais and the throne
      P0(g, `M1060 ${GR}L1060 ${GR - 30}L1420 ${GR - 30}L1420 ${GR}Z`, C.paperLight, 1);
      P0(g, `M1090 ${GR - 30}L1090 ${GR - 56}L1400 ${GR - 56}L1400 ${GR - 30}Z`, mix(C.paperLight, C.paper, 0.3), 1);
      L0(g, `M1060 ${GR}L1060 ${GR - 30}L1420 ${GR - 30}L1420 ${GR}M1090 ${GR - 30}L1090 ${GR - 56}L1400 ${GR - 56}L1400 ${GR - 30}`, C.inkSoft, 2.2, 0.8);
      const KH = 380, KX = 1180, KY = GR - 56;
      const thr = `M${KX - 0} ${KY}L${KX - 0} ${f1(KY - 0.24 * KH)}L${f1(KX + 0.22 * KH)} ${f1(KY - 0.24 * KH)}L${f1(KX + 0.22 * KH)} ${f1(KY - 0.66 * KH)}L${f1(KX + 0.28 * KH)} ${f1(KY - 0.66 * KH)}L${f1(KX + 0.28 * KH)} ${KY}Z`;
      P0(g, thr, mix(C.paperLight, C.stain, 0.1), 1); L0(g, thr, C.inkSoft, 2.4, 0.85);
      const KF = limbFig(g), hipY = KY - 0.25 * KH;
      KF.set([[[[KX + 40, hipY], [KX - 52, hipY + 4], [KX - 56, KY]], 0.06 * KH], [[[KX + 40, hipY - 4], [KX + 38, KY - 0.62 * KH]], 0.13 * KH],
        [[[KX + 30, KY - 0.6 * KH], [KX + 6, KY - 0.46 * KH], [KX + 46, KY - 0.52 * KH]], 0.042 * KH]], [[KX + 34, KY - 0.72 * KH, 0.078 * KH]],
        [`M${KX - 76} ${KY}L${KX - 40} ${KY}L${KX - 40} ${KY - 10}L${KX - 70} ${KY - 10}Z`]);
      // the double crown (facing left)
      const hr = 0.078 * KH, chx = KX + 34, chy = KY - 0.72 * KH;
      const cr = (pts) => 'M' + pts.map(([a, b]) => f1(chx + a * hr) + ' ' + f1(chy + b * hr)).join('L') + 'Z';
      const red = cr([[-1.1, -0.3], [-1.0, -1.2], [0.9, -1.2], [1.0, -2.7], [1.3, -2.7], [1.25, -0.3]]);
      const white = `M${f1(chx - 0.7 * hr)} ${f1(chy - 1.2 * hr)}C${f1(chx - 0.8 * hr)} ${f1(chy - 2.2 * hr)} ${f1(chx - 0.4 * hr)} ${f1(chy - 3.1 * hr)} ${f1(chx + 0.05 * hr)} ${f1(chy - 3.2 * hr)}C${f1(chx + 0.5 * hr)} ${f1(chy - 3.0 * hr)} ${f1(chx + 0.75 * hr)} ${f1(chy - 2.2 * hr)} ${f1(chx + 0.7 * hr)} ${f1(chy - 1.2 * hr)}Z`;
      for (const d of [white, red]) el(g, 'path', { d, fill: C.paperDark, stroke: C.inkSoft, 'stroke-width': 2.4, 'stroke-opacity': 0.85, 'stroke-linejoin': 'round' });
      L0(g, `M${f1(chx - 0.3 * hr)} ${f1(chy - 1.2 * hr)}C${f1(chx - 0.6 * hr)} ${f1(chy - 1.9 * hr)} ${f1(chx - 1.2 * hr)} ${f1(chy - 2.0 * hr)} ${f1(chx - 1.3 * hr)} ${f1(chy - 1.6 * hr)}`, C.inkSoft, 2.4, 0.85);
      // three bowing priests (shaved heads, long kilts)
      for (const [x, h] of [[520, 330], [700, 320], [880, 330]]) {
        const pg = BTL.person(g, 'bend', x, GR, h, { face: 1 });
        el(pg, 'path', { d: `M${f1(-0.07 * h)} ${f1(-0.5 * h)}L${f1(0.08 * h)} ${f1(-0.5 * h)}L${f1(0.13 * h)} ${f1(-0.1 * h)}L${f1(-0.09 * h)} ${f1(-0.1 * h)}Z`, fill: C.paperDark, stroke: C.inkSoft, 'stroke-width': 2.4, 'stroke-opacity': 0.8, 'stroke-linejoin': 'round' });
      }
      // incense stand between them
      L0(g, `M990 ${GR}L990 ${GR - 120}M966 ${GR}h48M972 ${GR - 120}h36`, C.inkSoft, 4, 0.9);
      const ember = el(g, 'circle', { cx: 990, cy: GR - 128, r: 6, fill: C.gold, 'fill-opacity': 0.8 });
      const sm = smoke(g, 990, GR - 132, 1.2);
      const lab = halo(ital(g, P.label || 'Memfis · MÖ 196', 1240, 170, 54, { color: C.ink }));
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.55);
          sm.update(lt + 1, 0, true);
          const k = BTL.ease(lt, th - 0.2, 1.8);
          beam.setAttribute('fill-opacity', k.toFixed(3)); kpool.set(0.3 * k);
          ember.setAttribute('fill-opacity', (0.6 + 0.2 * Math.sin(lt * 1.5)).toFixed(3));
          fade(lab, BTL.ease(lt, 0.6, 1.2));
        },
      };
    },
  };

  // ================================================================== bt_rosa_copies
  SH.bt_rosa_copies = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 640 : 470, s = portrait ? 1.1 : 1;
      const pool = BTL.glow(svg, defs, cx, cy, 640, C.stain, 0.26, g);
      // one rubbing sheet, kept in defs and reused
      const sid = uid('sheet'), sym = el(defs, 'g', { id: sid });
      const sd = 'M-230-310L230-310L232 310L-228 314Z';
      P0(sym, sd, mix(C.paperLight, C.stain, 0.14), 1);
      L0(sym, sd, C.inkSoft, 2.2, 0.8);
      const pg = place(sym, 0, 0, 0.7), ST = stone(pg, defs, { print: true });
      ST.bands.forEach(b => { draw(b, 1); b.setAttribute('stroke', C.inkSoft); b.setAttribute('stroke-opacity', '0.75'); });
      draw(ST.outline, 1); ST.outline.setAttribute('stroke', C.inkSoft);
      const piv = 320 * s;
      const copies = [-2, 2, -1, 1].map(k => ({ k, e: el(g, 'use', { href: '#' + sid, opacity: 0 }) }));
      const main = el(g, 'use', { href: '#' + sid, transform: `translate(${cx} ${cy}) scale(${s})` });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.2), tb = cue(cues, 'b', dur * 0.7);
          fade(main, BTL.ease(lt, 0, 1));
          const q = BTL.ease(lt, th - 0.2, 2.4), out = BTL.ease(lt, tb - 0.2, 2);
          for (const c of copies) {
            const a = c.k * 11 * q;
            c.e.setAttribute('transform', `translate(${f1(cx + c.k * 70 * q)} ${f1(cy + piv)}) rotate(${f1(a)}) translate(0 ${f1(-piv)}) scale(${s * 0.96})`);
            fade(c.e, (Math.abs(c.k) === 2 ? 0.55 : 0.8) * BTL.ease(lt, th - 0.2, 0.8) * (1 - out));
          }
          pool.set(0.26 - 0.08 * out + 0.01 * Math.sin(lt * 1.1));
        },
      };
    },
  };

  // ================================================================== bt_rosa_map
  const LANDS = {
    delta: [[[24, 31.6], [25.2, 31.6], [27.2, 31.35], [28.5, 30.95], [29.3, 30.98], [29.9, 31.2], [30.1, 31.3], [30.36, 31.46], [30.7, 31.52], [31.05, 31.58], [31.45, 31.55], [31.84, 31.5], [32.1, 31.35], [32.3, 31.25], [32.6, 31.08], [33.2, 31.1], [33.8, 31.13], [34.3, 31.3], [35, 31.4], [35, 28], [24, 28]]],
    europe: [
      [[-9.5, 43.5], [-9, 39], [-8.9, 37], [-6, 36.8], [-5.6, 36], [-4.5, 36.7], [-2, 36.8], [-0.5, 38.3], [0, 39], [0.3, 40.5], [3, 41.8], [3.1, 42.8], [4, 43.5], [6, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.6, 42.9], [11.6, 42.3], [12.4, 41.7], [13.6, 41.2], [14.3, 40.8], [15.6, 40], [16, 39], [15.7, 38], [16.1, 38], [16.6, 38.4], [17.2, 39], [16.6, 40], [17, 40.5], [18.5, 40.1], [18.4, 40.3], [17.9, 40.7], [16.2, 41.3], [15.2, 41.9], [14, 42.6], [13.6, 43.5], [12.3, 44.5], [12.4, 45.4], [13.7, 45.7], [13.6, 45.1], [14.3, 45.2], [15.2, 44.3], [16.4, 43.5], [17.6, 43], [18.5, 42.4], [19.4, 41.8], [19.4, 40.4], [20, 39.6], [20.7, 38.8], [21.1, 38.3], [21.6, 37.5], [21.7, 36.8], [22.5, 36.4], [23, 36.6], [22.8, 37.6], [23.2, 38], [24, 37.7], [23.9, 38.4], [22.8, 38.9], [22.6, 39.5], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29, 41.2], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [37.8, 44.7], [39.7, 43.6], [41.6, 41.6], [75, 41.6], [75, 75], [10, 75], [10, 57.5], [8.1, 56.8], [8.6, 55.4], [8.6, 54], [7, 53.5], [5, 53.3], [4.2, 52], [3.4, 51.4], [1.6, 50.9], [1.5, 50.2], [0, 49.6], [-1.3, 49.6], [-1.6, 48.7], [-3, 48.8], [-4.7, 48.4], [-4.3, 47.8], [-2.5, 47.3], [-2.2, 46.5], [-1.2, 45.6], [-1.3, 44.5], [-1.5, 43.4], [-3, 43.4], [-5, 43.5], [-8, 43.7], [-9.3, 43.2]],
      [[29.1, 41.2], [30, 41.1], [31.4, 41.3], [33, 42], [35, 42], [36.5, 41.3], [38, 40.9], [40, 41], [41.6, 41.6], [75, 41.6], [75, 36.6], [36.2, 36.6], [35.8, 36.8], [34.6, 36.8], [33.6, 36.2], [32.5, 36.1], [31, 36.8], [30.5, 36.5], [29.6, 36.2], [28.2, 36.7], [27.4, 37], [27.2, 37.9], [26.4, 38.3], [26.8, 38.6], [26.9, 39.4], [26.1, 39.5], [26.2, 40.1], [26.8, 40.35], [27.5, 40.4], [29, 40.4], [29.4, 40.8]],
      [[-17, -10], [-17, 21], [-16, 24], [-14.5, 26], [-13.2, 27.6], [-12, 28.2], [-10.2, 29.3], [-9.8, 30], [-9.6, 31], [-9.3, 32.5], [-8.5, 33.3], [-6.8, 34], [-6, 35.8], [-5.3, 35.9], [-2, 35.1], [0, 35.9], [3, 36.8], [5, 36.8], [7.8, 36.9], [9.8, 37.3], [10.3, 36.8], [11, 37], [10.4, 36.2], [11.1, 35.2], [10, 34.2], [10.9, 33.1], [12.5, 32.8], [15.2, 32.3], [15.7, 31.4], [18.5, 30.3], [20, 30.9], [20, 32], [21, 32.8], [22.9, 32.6], [25, 31.7], [27.5, 31.2], [29.9, 31.2], [31.2, 31.5], [32.3, 31.2], [34.2, 31.3], [34.6, 32], [35.2, 33], [35.9, 34.5], [35.8, 35.5], [35.9, 36.6], [75, 36.6], [75, -10]],
      [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 37], [12.4, 37.8]],
      [[8.4, 41], [9.2, 41.2], [9.8, 40.6], [9.6, 39.2], [9, 39], [8.4, 39], [8.4, 40]],
      [[8.6, 42.8], [9.4, 43], [9.6, 42.2], [9.2, 41.4], [8.6, 41.9]],
      [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]],
      [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],
      [[-5.7, 50.05], [-4, 50.4], [-3, 50.7], [-1, 50.8], [1.4, 51.2], [1.7, 52.6], [0.3, 53.4], [-0.3, 54], [-1.3, 54.8], [-1.6, 55.6], [-2.1, 56], [-1.8, 57.6], [-3.3, 58.6], [-5, 58.6], [-5.6, 57.3], [-5.7, 56], [-4.9, 55.7], [-5, 54.8], [-3.4, 54.9], [-3, 53.9], [-3.1, 53.3], [-4.6, 53.3], [-4, 52.4], [-5.2, 51.8], [-3.2, 51.5], [-4.2, 51.2]],
      [[-6, 52.2], [-6.1, 53.4], [-6, 54.2], [-5.6, 54.6], [-6.2, 55.2], [-7.4, 55.3], [-8.3, 55], [-8.6, 54.3], [-9.9, 53.9], [-10, 53.4], [-9.3, 52.6], [-10.4, 52.1], [-9.8, 51.5], [-8.2, 51.8], [-6.4, 52.2]],
    ],
  };
  const RIVERS = {
    delta: [[[31.3, 28.5], [31.27, 29.6], [31.25, 29.85], [31.23, 30.05], [31.15, 30.22], [31.0, 30.42], [30.85, 30.62], [30.78, 30.85], [30.6, 31.05], [30.5, 31.22], [30.42, 31.38], [30.36, 31.47]],
      [[31.15, 30.22], [31.2, 30.45], [31.3, 30.7], [31.4, 30.95], [31.52, 31.1], [31.65, 31.3], [31.78, 31.45], [31.84, 31.53]]],
    europe: [],
  };
  // smooth path through points (Catmull-Rom)
  const smooth = pts => {
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    return d;
  };
  SH.bt_rosa_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const preset = P.preset || 'delta', g = el(svg, 'g');
      const [l0, b0, l1, b1] = P.bounds || (preset === 'delta' ? [29.3, 29.6, 32.6, 31.8] : [-11, 28, 33, 54]);
      const portrait = H > W, k = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 120 : 180), ah = portrait ? 1000 : H - 230;
      const s = Math.min(aw / ((l1 - l0) * k), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * k * s / 2, oy = (portrait ? 640 : (H - 90) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * k * s, Y = lat => oy + (b1 - lat) * s;
      const mg = el(g, 'g');
      let grat = '';
      const step = (l1 - l0) < 8 ? 1 : 5;
      for (let lon = -30; lon <= 60; lon += step) grat += `M${X(lon).toFixed(0)} -10L${X(lon).toFixed(0)} ${H + 10}`;
      for (let lat = 10; lat <= 70; lat += step) grat += `M-10 ${Y(lat).toFixed(0)}L${W + 10} ${Y(lat).toFixed(0)}`;
      el(mg, 'path', { d: grat, stroke: C.inkSoft, 'stroke-opacity': 0.16, 'stroke-width': 1.5, fill: 'none' });
      // delta: a darker sea under the land and a smooth coast (the long gentle arc of the delta)
      if (preset === 'delta') P0(mg, `M-10 -10L${W + 10} -10L${W + 10} ${H + 10}L-10 ${H + 10}Z`, mix(C.paper, C.paperDark, 0.7), 1);
      const landD = preset === 'delta'
        ? LANDS.delta.map(poly => { const n = poly.length - 2; return smooth(poly.slice(0, n).map(p => [X(p[0]), Y(p[1])])) + poly.slice(n).map(p => 'L' + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('') + 'Z'; }).join('')
        : LANDS[preset].map(poly => 'M' + poly.map(p => X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('L') + 'Z').join('');
      el(mg, 'path', { d: landD, fill: C.paperLight, 'fill-opacity': 0.9, stroke: 'none' });
      // coast strokes only along real coast: edges touching a filler point far outside the map are left out
      const fake = p => Math.abs(p[0]) >= 70 || p[1] >= 70 || p[1] <= -5;
      const coastD = LANDS[preset].map(poly => { let d = '', open = false; poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length]; if (fake(p) || fake(q)) { open = false; return; } d += (open ? '' : `M${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`) + `L${X(q[0]).toFixed(1)} ${Y(q[1]).toFixed(1)}`; open = true; }); return d; }).join('');
      const coast = el(mg, 'path', { d: preset === 'delta' ? smooth(LANDS.delta[0].slice(0, -2).map(p => [X(p[0]), Y(p[1])])) : coastD, fill: 'none', stroke: C.inkSoft, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' });
      const rivers = RIVERS[preset].map(r => L0(mg, smooth(r.map(p => [X(p[0]), Y(p[1])])), C.blue, 3, 0.85, { pathLength: 1 }));
      const pts = (P.points || []).map(p => {
        const x = X(p.lon), y = Y(p.lat), pg = el(g, 'g'), main = !!p.at;
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 2.5, opacity: main ? 1 : 0 });
        el(pg, 'circle', { cx: x, cy: y, r: main ? 9 : 7, fill: main ? C.gold : C.inkSoft });
        const left = p.side === 'left' || (p.side == null && x > W * 0.7), ax = left ? x - 30 : x + 30, an = left ? 'end' : 'start';
        const lab = svgText(pg, p.label || '', ax, y + 16, main ? 56 : 46, { fill: main ? C.ink : C.inkSoft, 'font-family': FR, 'font-weight': 400, 'text-anchor': an });
        const sub = p.sub ? svgText(pg, p.sub, ax, y + (main ? 70 : 60), 42, { fill: main ? C.gold : C.inkSoft, 'font-family': LO, 'font-style': 'italic', 'text-anchor': an }) : null;
        for (const t of [lab, sub]) if (t) halo(t);
        return { p, pg, ring, main, x, y };
      });
      const routes = (P.routes || []).map(([a, b, at, via]) => {
        const A = pts[a], B = pts[b], mid = (via || []).map(q => [X(q[0]), Y(q[1])]);
        const d = mid.length ? smooth([[A.x, A.y], ...mid, [B.x, B.y]]) : `M${A.x} ${A.y}Q${(A.x + B.x) / 2} ${Math.min(A.y, B.y) - Math.abs(A.x - B.x) * 0.18} ${B.x} ${B.y}`;
        return { at, e: L0(g, d, C.gold, 3, 1, { pathLength: 1 }) };
      });
      for (const q of pts) g.appendChild(q.pg);
      return {
        update(lt, dur, cues) {
          coast.setAttribute('stroke-opacity', BTL.ease(lt, 0, 1.2).toFixed(3));
          rivers.forEach(r => draw(r, BTL.ease(lt, 0.2, 2.2)));
          pts.forEach((q, i) => {
            const at = q.main ? cue(cues, q.p.at, 0.6 + i * 0.8) : 0.3 + i * 0.25;
            fade(q.pg, BTL.ease(lt, at - 0.3, 1));
            if (q.main) { const ph = ((lt - at) % 2.6 + 2.6) % 2.6 / 2.6; q.ring.setAttribute('r', (14 + 26 * ph).toFixed(1)); q.ring.setAttribute('stroke-opacity', (lt < at ? 0 : (1 - ph) * 0.8).toFixed(3)); }
          });
          routes.forEach(r => draw(r.e, BTL.ease(lt, cue(cues, r.at, dur * 0.3), 2.2)));
        },
      };
    },
  };

  window.ROSA = { stone, glyph, GLYPH, flame, smoke, motes, greek, limbFig, SO, SOD, BANDS, HROWS, span, P0, L0, T, ital, fade, place, f1, halo, linGrad };
})();
