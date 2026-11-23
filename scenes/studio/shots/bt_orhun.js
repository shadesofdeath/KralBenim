// bt_orhun: the Orkhon inscriptions (Kül Tigin 732, Bilge Kağan 735) in the Orkhon valley of Mongolia, belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; the only motion is slow and natural: drifting clouds and
// their shadows, dust, smoke, steam, a slowly sinking sun, a silk cloth in the wind, letters carving themselves in.
// Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame shows it as a centred column.
// The runes are plain straight-stroke shapes in the manner of the Old Turkic script (no font needed).
//   bt_orhun_stele  P: {mode: "hook"|"end"|"far"}  cues: hit   the stele on its stone turtle on the open steppe, low
//                   hills, slow clouds. hook: fully drawn from the first frame (the cover frame), on "hit" one column of
//                   letters warms to gold. end: a low sun behind, the light slowly goes. far: the stele small on a vast
//                   steppe, the sun touching the horizon and sinking
//   bt_orhun_map    P: {label: "Orhun Vadisi", sub: "Moğolistan"}  cues: hit   close on the Orkhon valley: hatched
//                   foothills, the meandering river draws itself, on "hit" a gold point at the monuments; a small
//                   locator of Mongolia (with this view's frame) on the right, below the river
//   bt_orhun_sat    P: {label: "Hotont"}  cues: hit   a satellite view from above: faint terrain, a winding stream, a
//                   scanning frame; on "hit" the traces of walled enclosures draw in, gold
//   bt_orhun_runes  cues: hit   close on the stone face: ruled columns of runes carving themselves in; on "hit" they fade
//                   to a worn grey, as they were for more than a thousand years
//   bt_orhun_khagan cues: hit   a faceless khagan seated on a low throne before a great felt tent, smoke from its crown;
//                   on "hit" the light around him warms
//   bt_orhun_silk   cues: hit   a bolt of silk on a rod, the cloth hanging in folds to a fringed hem, a shadow below,
//                   moving slowly in the air; on "hit" a soft sheen slides down it
//   bt_orhun_years  P: {n: 50, label: "yıl"}  cues: hit   tally marks scratched in groups of five, the number counts to n
//   bt_orhun_cup    cues: hit   close on a single drinking bowl, steam rising; on "hit" the drink darkens, rings spread
//                   on it, the steam stops and the pool of light narrows
//   bt_orhun_camp   cues: hit   felt tents on the steppe at dusk, smoke rising; their smoke stops and they fade one
//                   by one, finishing on "hit"
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const txt = (g, s, x, y, size, o = {}) => {
    const e = svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || BTL.FR,
      'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}));
    e.setAttribute('text-anchor', o.anchor || 'middle');
    if (o.spacing) e.setAttribute('letter-spacing', o.spacing);
    return e;
  };
  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  const GROUND = () => mix(C.paper, C.paperDark, 0.55);
  const HILL = () => mix(C.paper, C.inkSoft, 0.22);
  const STONE = () => mix(C.paperDark, C.inkSoft, 0.1);
  const FELT = () => mix(C.paperLight, C.paperDark, 0.2);

  // ------------------------------------------------------------------ runes: straight strokes in a unit cell (w 1, h 1.4)
  const GLYPHS = [
    [[0.5, 0, 0.5, 1.4]],
    [[0.5, 0, 0.5, 1.4], [0.5, 0, 0.12, 0.42], [0.5, 0, 0.88, 0.42]],
    [[0.5, 0.62, 0.5, 1.4], [0.5, 0.62, 0.12, 0], [0.5, 0.62, 0.88, 0]],
    [[0.12, 0, 0.88, 0.7], [0.88, 0.7, 0.12, 1.4]],
    [[0.3, 0, 0.3, 1.4], [0.3, 0.7, 0.86, 0.2], [0.3, 0.7, 0.86, 1.2]],
    [[0.5, 0, 0.88, 0.7], [0.88, 0.7, 0.5, 1.4], [0.5, 1.4, 0.12, 0.7], [0.12, 0.7, 0.5, 0]],
    [[0.12, 1.4, 0.5, 0], [0.5, 0, 0.88, 1.4]],
    [[0.22, 0, 0.22, 1.4], [0.22, 0, 0.82, 0.42], [0.82, 0.42, 0.22, 0.84]],
    [[0.5, 0, 0.5, 1.4], [0.12, 0.3, 0.5, 0.62], [0.88, 0.3, 0.5, 0.62]],
    [[0.2, 0, 0.2, 1.4], [0.8, 0, 0.8, 1.4], [0.2, 0.7, 0.8, 0.7]],
    [[0.12, 0, 0.5, 0.7], [0.5, 0.7, 0.12, 1.4], [0.88, 0, 0.88, 1.4]],
  ];
  // one path per column; returns [{e, n}] so a column can be recoloured or revealed
  function runeCols(parent, cols, o) {
    const r = rng(o.seed || 7), out = [];
    for (const cx of cols) {
      let d = '', y = o.y0;
      while (y + o.cell * 1.4 <= o.y1) {
        if (r() < 0.12) { d += `M${f1(cx)} ${f1(y + o.cell * 0.35)}l0 0.1M${f1(cx)} ${f1(y + o.cell * 0.85)}l0 0.1`; y += o.cell * 1.2; continue; }
        const G = GLYPHS[Math.floor(r() * GLYPHS.length)], x0 = cx - o.cell / 2;
        for (const [a, b, c, e] of G) d += `M${f1(x0 + a * o.cell)} ${f1(y + b * o.cell)}L${f1(x0 + c * o.cell)} ${f1(y + e * o.cell)}`;
        y += o.cell * 1.4 + o.gap;
      }
      out.push(L0(parent, d, o.color || C.ink, o.w || 3, o.alpha ?? 1, { pathLength: 1 }));
    }
    return out;
  }

  // ------------------------------------------------------------------ the steppe: sky is the theme's ground
  function steppe(root, svg, defs, HZ, seed, o = {}) {
    const r = rng(seed);
    // far hills (the Khangai foothills), two layers
    let d = `M-200 ${HZ}`;
    for (let x = -200; x <= 1280; x += 40) d += `L${x} ${f1(HZ - (o.hill ?? 60) * (0.5 + 0.5 * Math.sin(x / 190 + seed)) * (0.6 + 0.4 * Math.sin(x / 73 + seed * 2)))}`;
    P0(root, d + `L1280 ${HZ}Z`, mix(C.paper, C.inkSoft, 0.12), 1);
    d = `M-200 ${HZ}`;
    for (let x = -200; x <= 1280; x += 40) d += `L${x} ${f1(HZ - (o.hill ?? 60) * 0.45 * (0.5 + 0.5 * Math.sin(x / 130 + seed * 3)))}`;
    P0(root, d + `L1280 ${HZ}Z`, HILL(), 1);
    P0(root, `M-200 ${HZ}L1280 ${HZ}L1280 2100L-200 2100Z`, GROUND(), 1);
    L0(root, `M-200 ${HZ}L1280 ${HZ}`, C.inkSoft, 2, 0.5);
    // short tufts of grass, still, thinning towards the horizon
    let gr = '';
    for (let i = 0; i < 140; i++) {
      const u = Math.pow(r(), 1.6), y = HZ + 14 + u * (2000 - HZ), x = -40 + r() * 1160, h = 6 + u * 26, s = 0.6 + u;
      gr += `M${f1(x)} ${f1(y)}l${f1(-4 * s)} ${f1(-h)}M${f1(x)} ${f1(y)}l${f1(1 * s)} ${f1(-h * 1.15)}M${f1(x)} ${f1(y)}l${f1(5 * s)} ${f1(-h * 0.9)}`;
    }
    L0(root, gr, C.inkSoft, 2, 0.35);
    // clouds: long flat shapes drifting slowly; their shadows cross the ground
    const clouds = [], shadows = [];
    for (let i = 0; i < (o.clouds ?? 3); i++) {
      clouds.push({ e: P0(root, '', C.paperLight, 0.7), x: r() * 1200 - 100, y: 260 + r() * (HZ - 520), w: 180 + r() * 220, sp: 6 + r() * 6 });
    }
    const shGroup = el(root, 'g');
    for (let i = 0; i < 2; i++) shadows.push({ e: P0(shGroup, '', C.paperDark, 0.18), x: r() * 1100, y: HZ + 140 + i * 260, w: 260 + r() * 160, sp: 12 });
    const dust = [];
    for (let i = 0; i < 26; i++) dust.push({ x: r() * 1080, y: HZ - 160 + r() * 460, s: 1.5 + r() * 2.5, sp: 10 + r() * 16, ph: r() * TAU });
    const dustE = P0(root, '', C.inkSoft, 0.35);
    return {
      update(lt) {
        for (const c of clouds) {
          const x = ((c.x + lt * c.sp + 300) % 1500) - 300;
          c.e.setAttribute('d', `M${f1(x - c.w)} ${f1(c.y)}C${f1(x - c.w * 0.7)} ${f1(c.y - 30)} ${f1(x - c.w * 0.2)} ${f1(c.y - 44)} ${f1(x + c.w * 0.1)} ${f1(c.y - 28)}C${f1(x + c.w * 0.5)} ${f1(c.y - 36)} ${f1(x + c.w)} ${f1(c.y - 16)} ${f1(x + c.w)} ${f1(c.y)}Z`);
        }
        for (const s of shadows) { const x = ((s.x + lt * s.sp + 400) % 1900) - 400; s.e.setAttribute('d', BTL.E(x, s.y, s.w, s.w * 0.12)); }
        let dd = '';
        for (const q of dust) { const x = (q.x + lt * q.sp) % 1120 - 20, y = q.y + 10 * Math.sin(lt * 0.5 + q.ph); dd += `M${f1(x - q.s)} ${f1(y)}a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(2 * q.s)} 0a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(-2 * q.s)} 0`; }
        dustE.setAttribute('d', dd);
      },
    };
  }

  // ------------------------------------------------------------------ the stele on its stone turtle (origin: ground, centre)
  // units: slab 200 wide, 430 tall; a carved cap above; the turtle 460 wide under it
  function stele(parent, k, o = {}) {
    const g = el(parent, 'g', { transform: `scale(${k})` }), lw = v => v / k * (o.lw || 1);
    const sil = !!o.silhouette, fillS = sil ? mix(C.paperDark, C.inkSoft, 0.5) : STONE();
    // shadow on the ground
    P0(g, BTL.E(30, 4, 300, 26), C.paperDark, 0.45);
    // the turtle: shell dome, head forward (left), four short legs
    const shell = 'M-210 -6C-206 -70 -120 -118 0 -120C120 -118 206 -70 214 -6Z';
    P0(g, 'M-196 -4L-176 -30L-150 -4ZM150 -4L176 -30L198 -4Z', fillS, 1);
    P0(g, shell, fillS, 1); L0(g, shell, C.ink, lw(3), 1);
    const head = 'M-200 -40C-236 -48 -262 -36 -266 -16C-268 -2 -246 4 -206 -6Z';
    P0(g, head, fillS, 1); L0(g, head, C.ink, lw(3), 1);
    if (!sil) {
      L0(g, 'M-150 -60C-80 -88 80 -88 150 -60M-110 -30L-90 -96M110 -30L90 -96M0 -26L0 -112M-60 -40L-46 -104M60 -40L46 -104', C.inkSoft, lw(1.6), 0.55);
      P0(g, BTL.E(-246, -26, 4, 4), C.inkSoft, 0.8);
    }
    // the slab, set into the shell
    const slab = 'M-100 -96L-100 -500L100 -500L100 -96Z';
    P0(g, slab, sil ? fillS : mix(C.paperLight, C.paperDark, 0.12), 1); L0(g, slab, C.ink, lw(3), 1);
    // the carved cap: a rounded crown with coiled shapes (the dragons of the real stones, only suggested)
    const cap = 'M-116 -500L-116 -540C-116 -600 -60 -626 0 -626C60 -626 116 -600 116 -540L116 -500Z';
    P0(g, cap, fillS, 1); L0(g, cap, C.ink, lw(3), 1);
    if (!sil) {
      L0(g, 'M-90 -520C-90 -570 -50 -600 -10 -596C20 -592 24 -560 0 -556M90 -520C90 -570 50 -600 10 -596M-60 -510C-60 -540 -30 -552 -20 -536M60 -510C60 -540 30 -552 20 -536', C.inkSoft, lw(1.8), 0.6);
      L0(g, 'M-40 -508L40 -508L40 -540L-40 -540Z', C.inkSoft, lw(1.4), 0.5);
    }
    // ruled columns of runes on the face
    let cols = [];
    if (!sil) {
      let rules = ''; for (let x = -84; x <= 84; x += 28) rules += `M${x} -480L${x} -112`;
      L0(g, rules, C.inkSoft, lw(1), 0.35);
      cols = runeCols(g, [-70, -42, -14, 14, 42, 70], { y0: -474, y1: -116, cell: 15, gap: 6, w: lw(o.runeW || 2), seed: o.seed || 11, color: C.ink, alpha: 0.85 });
    }
    return { g, cols };
  }

  // ------------------------------------------------------------------ the stele on the steppe
  SH.bt_orhun_stele = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', root = el(canvas(svg, W, H), 'g');
      const far = mode === 'far', hook = mode === 'hook', HZ = far ? 1090 : hook ? 1220 : 1110, K = far ? 0.62 : hook ? 1.35 : 1.04, SX = far ? 380 : 540;
      const sun = mode === 'hook' ? null : P0(root, '', mix(C.gold, C.paperLight, 0.45), 1);
      const sunG = mode === 'hook' ? BTL.glow(svg, defs, 540, 820, 760, C.stain, 0.34, root) : BTL.glow(svg, defs, far ? 760 : 700, HZ - 120, 820, C.gold, 0.3, root);
      const S = steppe(root, svg, defs, HZ, far ? 5 : 3, { hill: far ? 46 : 70, clouds: far ? 4 : 3 });
      const sg = el(root, 'g', { transform: `translate(${SX} ${HZ + (far ? 40 : 30)})` });
      const glowCol = mode === 'hook' ? BTL.glow(svg, defs, SX + 42 * K, HZ + 30 - 300 * K, 320, C.gold, 0, root) : null;
      const st = stele(sg, K, { seed: 11, silhouette: false, runeW: far ? 2.4 : 2 });
      const longShadow = mode === 'hook' ? null : P0(root, '', C.paperDark, 0.0);
      if (longShadow) root.insertBefore(longShadow, sg);
      st.cols.forEach(c => draw(c, 1));
      // hook: one column of the warning is written over again in gold, letter by letter, from top to bottom
      const goldCol = hook ? st.cols[4].cloneNode() : null;
      if (goldCol) { goldCol.setAttribute('stroke', C.gold); goldCol.setAttribute('stroke-opacity', 1); goldCol.setAttribute('stroke-width', f1(5.2 / K)); st.cols.forEach((c, i) => i !== 4 && c.setAttribute('stroke-opacity', 0.6)); st.cols[4].parentNode.appendChild(goldCol); }
      const halo = goldCol ? goldCol.cloneNode() : null;   // a soft gold halo around the column on the cue
      if (halo) { halo.setAttribute('stroke-width', f1(14 / K)); halo.setAttribute('stroke-opacity', 0); goldCol.parentNode.insertBefore(halo, goldCol); }
      return {
        update(lt, dur, cues) {
          S.update(hook ? lt * 8 : lt);
          if (mode === 'hook') {
            const at = cue(cues, 'hit', 1.2), q = BTL.ease(lt, at - 0.2, 0.9);
            const gp = Math.max(0.04, BTL.ease(lt, 0.5, 2.0));
            draw(goldCol, gp); draw(halo, gp); halo.style.opacity = ''; halo.setAttribute('stroke-opacity', (0.22 * q).toFixed(3));
            const rise = BTL.ease(lt, 2.1, 1.5);   // the light on the stone grows while the hook holds (played slowed)
            glowCol.set((0.5 + 0.3 * rise) * Math.max(q, 0.6)); glowCol.e.setAttribute('r', f1(320 + 80 * q));
            sunG.set(0.16 + 0.38 * rise);
            sunG.e.setAttribute('r', f1(600 + 220 * rise));
          } else {
            // the sun sinks slowly; its glow follows and dims
            const u = clamp01(lt / Math.max(4, dur)), sx = far ? 760 : 720, sy = (far ? HZ - 110 : HZ - 220) + (far ? 110 : 150) * u, r = far ? 58 : 70;
            sun.setAttribute('d', BTL.E(sx, sy, r, r));
            const clip = Math.max(0, sy + r - HZ);
            sun.setAttribute('fill-opacity', clip > 0 ? (1 - clamp01(clip / (2 * r)) * 0.6).toFixed(3) : '1');
            sunG.e.setAttribute('cx', sx); sunG.e.setAttribute('cy', f1(sy));
            sunG.set((far ? 0.34 : 0.3) * (1 - 0.45 * u));
            const L = (far ? 520 : 360) + 160 * u;
            longShadow.setAttribute('d', `M${SX - 90 * K} ${HZ + 34}L${f1(SX - 90 * K - L)} ${HZ + 70}L${f1(SX - 60 * K - L)} ${HZ + 90}L${SX + 120 * K} ${HZ + 44}Z`);
            longShadow.setAttribute('fill-opacity', (0.28 * BTL.ease(lt, 0, 1.2)).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ map: Mongolia and the Orkhon
  const MONGOLIA = [[87.8, 49.2], [90.0, 50.0], [92.3, 50.8], [94.3, 50.5], [95.5, 49.9], [97.8, 49.9], [98.3, 50.4], [97.9, 51.0], [98.9, 52.1], [100.0, 51.7], [102.1, 51.4], [102.4, 50.6], [103.7, 50.1], [105.9, 50.4], [107.0, 50.2], [108.3, 49.5], [110.7, 49.1], [112.9, 49.5], [114.4, 50.2], [115.6, 49.8], [116.7, 49.9], [116.2, 49.1], [115.5, 48.1], [117.3, 47.7], [118.5, 47.9], [119.7, 47.0], [118.9, 46.8], [117.4, 46.6], [116.0, 45.7], [114.5, 45.4], [113.3, 44.8], [111.9, 45.1], [111.3, 44.5], [111.8, 43.7], [110.4, 42.8], [108.8, 42.4], [107.0, 42.5], [105.0, 41.6], [104.5, 41.9], [103.3, 41.9], [101.8, 42.5], [100.3, 42.6], [98.0, 42.7], [96.4, 42.7], [95.3, 44.2], [93.5, 45.0], [92.1, 45.1], [90.9, 45.3], [90.6, 45.7], [91.0, 46.6], [90.3, 47.7], [89.0, 48.0], [88.0, 48.6]];
  const ORKHON = [[101.2, 46.85], [101.9, 47.0], [102.5, 47.15], [102.8, 47.35], [102.95, 47.7], [103.3, 48.1], [104.0, 48.6], [104.9, 49.25], [105.7, 49.85], [106.2, 50.3]];
  SH.bt_orhun_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      // close on the Orkhon valley (lon 100.6-105.6, lat 46.3-49.7); a small locator of Mongolia top right
      const root = el(canvas(svg, W, H), 'g'), l0 = 100.6, b1 = 49.7, k = Math.cos(48 * Math.PI / 180), s = 300;
      const X = lon => 40 + (lon - l0) * k * s, Y = lat => 58 + (b1 - lat) * s;
      P0(root, 'M-60 -60L1140 -60L1140 2000L-60 2000Z', C.paperLight, 1);
      const r = rng(19);
      let grat = '';
      for (let lon = 100; lon <= 107; lon++) grat += `M${f1(X(lon))} -60L${f1(X(lon))} 2000`;
      for (let lat = 44; lat <= 51; lat++) grat += `M-60 ${f1(Y(lat))}L1140 ${f1(Y(lat))}`;
      L0(root, grat, C.inkSoft, 1.5, 0.22);
      // relief: the Khangai foothills (south-west) and low ridges, as small hatched peaks
      let hill = '';
      for (let i = 0; i < 170; i++) {
        const u = r(), v = r(), lon = 100.4 + u * 2.8, lat = 44.0 + v * 3.1 + u * 0.4;
        if (lat > 47.2 + (lon - 100.5) * 0.25) continue;
        const x = X(lon), y = Y(lat), w = 16 + r() * 18;
        hill += `M${f1(x - w)} ${f1(y)}L${f1(x)} ${f1(y - w * 0.8)}L${f1(x + w)} ${f1(y)}`;
      }
      for (let i = 0; i < 110; i++) {
        const lon = 103.4 + r() * 2.6, lat = 44.0 + r() * 3.6, x = X(lon), y = Y(lat), w = 10 + r() * 12;
        hill += `M${f1(x - w)} ${f1(y)}L${f1(x)} ${f1(y - w * 0.7)}L${f1(x + w)} ${f1(y)}`;
      }
      L0(root, hill, C.inkSoft, 2.2, 0.5);
      // the river, with meanders, and its pale valley floor
      const RV = [[100.4, 46.55], [100.9, 46.75], [101.5, 46.92], [102.1, 47.05], [102.55, 47.18], [102.8, 47.35], [102.95, 47.7], [103.3, 48.1], [103.9, 48.55], [104.6, 49.05], [105.3, 49.6], [105.8, 50.0]];
      let rd = '';
      for (let i = 0; i < RV.length - 1; i++) {
        const [a, b] = RV[i], [c, d] = RV[i + 1];
        for (let j = 0; j < 6; j++) { const t = j / 6, x = X(a + (c - a) * t), y = Y(b + (d - b) * t), m = 9 * Math.sin((i * 6 + j) * 1.3); rd += (i || j ? 'L' : 'M') + f1(x + m) + ' ' + f1(y - m * 0.6); }
      }
      rd += 'L' + f1(X(105.8)) + ' ' + f1(Y(50));
      const vale = L0(root, rd, C.stain, 70, 0.18);
      const riv = L0(root, rd, C.blue, 7, 0.95, { pathLength: 1 });
      const px = X(102.83), py = Y(47.56);
      BTL.glow(svg, defs, px, py, 380, C.stain, 0.3, root);
      const pg = el(root, 'g');
      const dot = el(pg, 'g');
      const ring = el(dot, 'circle', { cx: px, cy: py, r: 20, fill: 'none', stroke: C.gold, 'stroke-width': 3.5 });
      el(dot, 'circle', { cx: px, cy: py, r: 12, fill: C.gold, stroke: C.ink, 'stroke-width': 2 });
      const lab = txt(pg, P.label || 'Orhun Vadisi', px - 44, py - 22, 60, { weight: 400, anchor: 'end' });
      lab.setAttribute('stroke', C.paperLight); lab.setAttribute('stroke-width', 12); lab.setAttribute('stroke-linejoin', 'round'); lab.setAttribute('paint-order', 'stroke');
      // locator: Mongolia, small, top right, with the frame of this view
      const ig = el(root, 'g'), il0 = 87.5, ib1 = 52.3, is = 9.6, ik = Math.cos(47 * Math.PI / 180);
      const IX = lon => 700 + (lon - il0) * ik * is, IY = lat => 880 + (ib1 - lat) * is;
      const inset = 'M' + MONGOLIA.map(p => f1(IX(p[0])) + ' ' + f1(IY(p[1]))).join('L') + 'Z';
      P0(ig, inset, C.paper, 1); L0(ig, inset, C.ink, 2, 0.85);
      L0(ig, `M${f1(IX(100.6))} ${f1(IY(49.7))}L${f1(IX(105.6))} ${f1(IY(49.7))}L${f1(IX(105.6))} ${f1(IY(46.3))}L${f1(IX(100.6))} ${f1(IY(46.3))}Z`, C.gold, 3, 1);
      const sub = txt(ig, P.sub || 'Moğolistan', 862, 1050, 46, { font: BTL.LO, italic: true, color: C.ink, weight: 400 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.45);
          draw(riv, BTL.ease(lt, 0, Math.max(0.9, at + 0.2)));
          vale.setAttribute('stroke-opacity', (0.18 * BTL.ease(lt, 0.2, 1)).toFixed(3));
          fade(pg, 1); fade(lab, 1); fade(dot, BTL.ease(lt, at - 0.3, 0.7));
          fade(ig, BTL.ease(lt, 0, 0.8)); fade(sub, BTL.ease(lt, 0.1, 0.8));
          const ph = (((lt - at) % 2.2) + 2.2) % 2.2 / 2.2;
          ring.setAttribute('r', f1(16 + 40 * ph)); ring.setAttribute('stroke-opacity', ((1 - ph) * 0.9).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ satellite view: traces of walls
  SH.bt_orhun_sat = {
    kind: '2d',
    build({ P, W, H, svg, defs, seed }) {
      const root = el(canvas(svg, W, H), 'g'), r = rng(23), CX = 540, CY = 725;
      P0(root, 'M-60 -60L1140 -60L1140 2000L-60 2000Z', mix(C.paper, C.paperDark, 0.45), 1);
      // terrain contours (closed, smooth, deterministic)
      for (let i = 0; i < 9; i++) {
        const cx = r() * 1080, cy = 200 + r() * 1500, R = 120 + r() * 300, ph = r() * TAU;
        let d = '';
        for (let j = 0; j <= 48; j++) { const a = j / 48 * TAU, rr = R * (1 + 0.18 * Math.sin(3 * a + ph) + 0.08 * Math.sin(5 * a - ph)); d += (j ? 'L' : 'M') + f1(cx + Math.cos(a) * rr) + ' ' + f1(cy + Math.sin(a) * rr * 0.8); }
        L0(root, d + 'Z', C.inkSoft, 1.5, 0.22);
      }
      // a winding stream
      let sd = 'M-60 260'; for (let y = 260, x = -60; x < 1140; x += 60) { y += 40 + 30 * Math.sin(x / 120); sd += `L${x} ${f1(y + 50 * Math.sin(x / 90))}`; }
      L0(root, sd, mix(C.blue, C.paper, 0.35), 7, 0.55);
      // speckle of the ground, still
      let sp = ''; for (let i = 0; i < 260; i++) { const x = r() * 1080, y = r() * 1900, s = 1 + r() * 2.5; sp += `M${f1(x - s)} ${f1(y)}a${f1(s)} ${f1(s)} 0 1 0 ${f1(2 * s)} 0a${f1(s)} ${f1(s)} 0 1 0 ${f1(-2 * s)} 0`; }
      P0(root, sp, C.paperDark, 0.5);
      // below the frame the ground runs on: a second stream, denser speckle, a few field strips
      let sd2 = 'M-60 1380'; for (let x = -60; x < 1140; x += 60) sd2 += `L${x} ${f1(1420 + 60 * Math.sin(x / 150) + 30 * Math.sin(x / 61))}`;
      L0(root, sd2, mix(C.blue, C.paper, 0.35), 6, 0.5);
      let sp2 = ''; for (let i = 0; i < 240; i++) { const x = r() * 1080, y = 1330 + r() * 600, s = 1.2 + r() * 3; sp2 += `M${f1(x - s)} ${f1(y)}a${f1(s)} ${f1(s)} 0 1 0 ${f1(2 * s)} 0a${f1(s)} ${f1(s)} 0 1 0 ${f1(-2 * s)} 0`; }
      P0(root, sp2, C.paperDark, 0.6);
      let strips = ''; for (let i = 0; i < 7; i++) { const x = 40 + i * 150, y = 1560 + (i % 3) * 40; strips += `M${x} ${y}l120 -18l14 200l-120 18Z`; }
      L0(root, strips, C.inkSoft, 1.5, 0.3);
      BTL.glow(svg, defs, CX, CY, 600, C.stain, 0.2, root);
      // the walled enclosures (slightly turned): an outer wall, an inner court, a mound
      const wg = el(root, 'g', { transform: `rotate(-9 ${CX} ${CY})` }), zg = wg;
      const walls = [
        L0(wg, `M${CX - 330} ${CY - 260}L${CX + 330} ${CY - 260}L${CX + 330} ${CY + 260}L${CX - 330} ${CY + 260}Z`, C.gold, 6, 0.95, { pathLength: 1 }),
        L0(wg, `M${CX - 175} ${CY - 130}L${CX + 140} ${CY - 130}L${CX + 140} ${CY + 140}L${CX - 175} ${CY + 140}Z`, C.gold, 4.5, 0.9, { pathLength: 1 }),
        L0(wg, `M${CX - 330} ${CY}L${CX - 175} ${CY}M${CX + 140} ${CY}L${CX + 330} ${CY}M${CX - 18} ${CY + 140}L${CX - 18} ${CY + 260}`, C.gold, 3, 0.7, { pathLength: 1 }),
      ];
      const mound = P0(wg, BTL.E(CX - 18, CY + 5, 62, 52), C.gold, 0);
      // the scanning frame: corner marks and a slow scan line
      let fr = ''; const F = [[70, 300], [1010, 300], [70, 1150], [1010, 1150]];
      F.forEach(([x, y], i) => { const dx = i % 2 ? -1 : 1, dy = i < 2 ? 1 : -1; fr += `M${x} ${y + dy * 60}L${x} ${y}L${x + dx * 60} ${y}`; });
      L0(root, fr, C.ink, 3, 0.75);
      const scan = L0(root, '', C.ink, 2, 0.3);
      const lab = txt(root, P.label || 'Hotont', 540, 268, 48, { font: BTL.LO, italic: true, color: C.ink, weight: 400 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5);
          walls.forEach((w, i) => draw(w, BTL.ease(lt, at - 0.3 + i * 0.35, 1.2)));
          const z = 1 + 0.12 * BTL.ease(lt, at, Math.max(1.5, dur - at));   // slow move in on the traces
          zg.setAttribute('transform', `translate(${CX} ${CY}) scale(${z.toFixed(4)}) rotate(-9) translate(${-CX} ${-CY})`);
          mound.setAttribute('fill-opacity', (0.25 * BTL.ease(lt, at + 0.8, 1)).toFixed(3));
          const y = 320 + ((lt * 120) % 810);
          scan.setAttribute('d', `M90 ${f1(y)}L990 ${f1(y)}`);
          fade(lab, BTL.ease(lt, 0.4, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the stone face, close
  SH.bt_orhun_runes = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), r = rng(41);
      P0(root, 'M-60 -60L1140 -60L1140 2000L-60 2000Z', mix(C.paperLight, C.paperDark, 0.22), 1);
      let pits = ''; for (let i = 0; i < 320; i++) { const x = r() * 1080, y = r() * 1900, s = 1 + r() * 3; pits += `M${f1(x - s)} ${f1(y)}a${f1(s)} ${f1(s * 0.7)} 0 1 0 ${f1(2 * s)} 0a${f1(s)} ${f1(s * 0.7)} 0 1 0 ${f1(-2 * s)} 0`; }
      P0(root, pits, C.paperDark, 0.55);
      const light = BTL.glow(svg, defs, 200, 660, 700, C.paperLight, 0.5, root);
      let rules = ''; for (const x of [80, 230, 380, 530, 680, 830, 980]) rules += `M${x} 120L${x} 1900`;
      L0(root, rules, C.inkSoft, 2, 0.4);
      const XS = [155, 305, 455, 605, 755, 905];
      const cols = runeCols(root, XS, { y0: 150, y1: 1150, cell: 72, gap: 22, w: 7.5, seed: 5, color: C.ink, alpha: 1 });
      // the columns run on below the subtitle band, worn and faint (texture of the stone, no detail to read)
      const low = runeCols(root, XS, { y0: 1350, y1: 1900, cell: 72, gap: 22, w: 7, seed: 9, color: C.inkSoft, alpha: 0.45 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), wear = BTL.ease(lt, at - 0.1, 1.4);
          low.forEach((c, i) => draw(c, BTL.ease(lt, 0.3 + i * 0.3, 1.6)));
          cols.forEach((c, i) => { draw(c, BTL.ease(lt, 0.05 + i * 0.26, 1.5)); c.setAttribute('stroke', wear > 0.5 ? C.inkSoft : C.ink); c.setAttribute('stroke-opacity', (1 - 0.55 * wear).toFixed(3)); });
          light.e.setAttribute('cx', f1(200 + 680 * clamp01(lt / Math.max(3, dur))));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the khagan before his tent
  function smoke(root, seed, n, o) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(root, '', C.inkSoft, 0), ph: i / n, rx: o.size * (0.7 + r() * 0.6) });
    return { update(lt, x0, y0, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.1)) % 1, x = x0 + (o.dx || 60) * u + 14 * Math.sin(u * 5 + q.ph * 6), y = y0 - (o.dy || 300) * u, s = 0.5 + 1.2 * u;
      q.e.setAttribute('d', BTL.E(x, y, q.rx * s, q.rx * s * 0.7));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.2) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  function yurt(parent, x, y, w, o = {}) {
    const h = w * 0.62, g = el(parent, 'g'), lw = o.lw || 3;
    const body = `M${x - w / 2} ${y}L${x - w / 2} ${y - h * 0.45}C${x - w * 0.3} ${y - h * 0.8} ${x - w * 0.12} ${y - h} ${x} ${y - h}C${x + w * 0.12} ${y - h} ${x + w * 0.3} ${y - h * 0.8} ${x + w / 2} ${y - h * 0.45}L${x + w / 2} ${y}Z`;
    const fillE = P0(g, body, o.fill || FELT(), 1);
    const det = L0(g, `M${x - w / 2} ${y - h * 0.45}L${x + w / 2} ${y - h * 0.45}M${x - w * 0.42} ${y - h * 0.3}L${x + w * 0.42} ${y - h * 0.3}`, C.inkSoft, lw * 0.6, 0.6);
    const door = P0(g, `M${x - w * 0.09} ${y}L${x - w * 0.09} ${y - h * 0.36}L${x + w * 0.09} ${y - h * 0.36}L${x + w * 0.09} ${y}Z`, C.paperDark, 1);
    const line = L0(g, body, C.inkSoft, lw, 1);
    return { g, fillE, det, door, line, top: [x, y - h] };
  }
  SH.bt_orhun_khagan = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 1060;
      const warm = BTL.glow(svg, defs, 540, 820, 620, C.stain, 0.14, root);
      const S = steppe(root, svg, defs, HZ, 9, { hill: 40, clouds: 2 });
      const Y = yurt(root, 600, HZ + 40, 720, { lw: 3.5 });
      const sm = smoke(root, 17, 7, { size: 30, dy: 360, dx: 80, rate: 0.08, alpha: 0.2 });
      // the standard (tuğ): a tall pole with a hanging tail, still
      L0(root, `M180 ${HZ + 70}L180 470`, C.ink, 5, 1);
      P0(root, 'M180 470C168 520 164 580 172 640C180 600 190 560 196 520Z', C.paperDark, 1);
      P0(root, BTL.E(180, 462, 12, 12), C.gold, 1);
      // the low throne and the seated khagan in front of the door
      P0(root, `M440 ${HZ + 70}L660 ${HZ + 70}L650 ${HZ - 10}L450 ${HZ - 10}Z`, mix(C.paperDark, C.inkSoft, 0.3), 1, { stroke: C.inkSoft, 'stroke-width': 3 });
      P0(root, BTL.E(550, HZ + 72, 200, 18), C.paperDark, 0.4);
      BTL.person(root, 'sit', 520, HZ - 8, 360, { face: 1, color: mix(C.inkSoft, C.ink, 0.35), rim: C.ink });
      // a tall hat shape over the head (a khagan's headdress), simple
      P0(root, `M${520 + 0.04 * 360 - 22} ${HZ - 8 - 0.72 * 360 - 18}L${520 + 0.04 * 360} ${HZ - 8 - 0.72 * 360 - 74}L${520 + 0.04 * 360 + 22} ${HZ - 8 - 0.72 * 360 - 18}Z`, mix(C.inkSoft, C.ink, 0.35), 1, { stroke: C.ink, 'stroke-width': 2.5 });
      const spot = BTL.glow(svg, defs, 540, HZ - 160, 300, C.gold, 0, root);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.3), q = BTL.ease(lt, at - 0.2, 1.4);
          S.update(lt); sm.update(lt, Y.top[0], Y.top[1] - 6);
          spot.set(0.3 * q); warm.set(0.14 + 0.12 * q);
        },
      };
    },
  };

  // ------------------------------------------------------------------ silk in the wind
  SH.bt_orhun_silk = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      // a bolt of silk on a rod; the cloth hangs and pools, its lower edge fringed, moving slowly in the air
      const root = el(canvas(svg, W, H), 'g'), X0 = 250, X1 = 830, TOP = 300, BOT = 1080, N = 22;
      BTL.glow(svg, defs, 540, 640, 660, C.stain, 0.26, root);
      const LIGHT = mix(C.gold, C.paperLight, 0.62), DARK = mix(C.gold, C.paperDark, 0.2);
      P0(root, BTL.E(560, BOT + 70, 360, 34), C.paperDark, 0.55);
      const strips = Array.from({ length: N }, () => P0(root, '', LIGHT, 1));
      const outline = L0(root, '', C.inkSoft, 2.5, 0.9);
      const foldL = L0(root, '', DARK, 2, 0.5);
      const border = P0(root, '', C.gold, 0.75);
      const fringe = L0(root, '', C.gold, 2.5, 0.9);
      const sheen = P0(root, '', C.paperLight, 0);
      // the rolled bolt on its rod, drawn last (in front)
      P0(root, `M${X0 - 30} ${TOP - 38}L${X1 + 30} ${TOP - 38}L${X1 + 30} ${TOP + 22}L${X0 - 30} ${TOP + 22}Z`, DARK, 1);
      L0(root, `M${X0 - 30} ${TOP - 38}L${X1 + 30} ${TOP - 38}M${X0 - 30} ${TOP + 22}L${X1 + 30} ${TOP + 22}`, C.inkSoft, 2.5, 1);
      P0(root, BTL.E(X0 - 30, TOP - 8, 16, 30), LIGHT, 1, { stroke: C.inkSoft, 'stroke-width': 2.5 });
      P0(root, BTL.E(X1 + 30, TOP - 8, 16, 30), LIGHT, 1, { stroke: C.inkSoft, 'stroke-width': 2.5 });
      L0(root, `M${X0 - 90} ${TOP - 8}L${X0 - 46} ${TOP - 8}M${X1 + 46} ${TOP - 8}L${X1 + 90} ${TOP - 8}`, C.ink, 7, 1);
      P0(root, BTL.E(X0 - 96, TOP - 8, 12, 12), C.ink, 1); P0(root, BTL.E(X1 + 96, TOP - 8, 12, 12), C.ink, 1);
      // a point of the cloth: u across 0..1, v down 0..1
      const pt = (u, v, lt) => {
        const sway = 26 * v * v * Math.sin(lt * 0.55 + u * 1.6), spread = 1 + 0.12 * v;
        const x = 540 + (X0 + (X1 - X0) * u - 540) * spread + sway;
        const y = TOP + 22 + (BOT - TOP - 22) * v + (v > 0.98 ? 0 : 0);
        return [x, y];
      };
      const hem = (u, lt) => BOT + 22 * Math.sin(u * Math.PI * 7 + 0.6) + 6 * Math.sin(lt * 0.7 + u * 4);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6);
          const col = (u, v) => { const p = pt(u, v, lt); return f1(p[0]) + ' ' + f1(v >= 1 ? hem(u, lt) : p[1]); };
          let outl = '', fl = '', bd = '', fr = '';
          for (let i = 0; i < N; i++) {
            const u0 = i / N, u1 = (i + 1) / N, um = (u0 + u1) / 2;
            let d = 'M' + col(u0, 0);
            for (let v = 0.1; v <= 1.001; v += 0.1) d += 'L' + col(u0, v);
            for (let v = 1; v >= -0.001; v -= 0.1) d += 'L' + col(u1, v);
            strips[i].setAttribute('d', d + 'Z');
            const sh = 0.5 + 0.5 * Math.cos(um * Math.PI * 7 + 0.6 + 0.25 * Math.sin(lt * 0.5));
            strips[i].setAttribute('fill', mix(LIGHT, DARK, 0.15 + 0.6 * sh));
            if (i % 2 === 0) { fl += 'M' + col(um, 0.04); for (let v = 0.2; v <= 1.001; v += 0.2) fl += 'L' + col(um, Math.min(0.97, v)); }
          }
          outl = 'M' + col(0, 0); for (let v = 0.1; v <= 1.001; v += 0.1) outl += 'L' + col(0, v);
          for (let j = 1; j <= 40; j++) outl += 'L' + col(j / 40, 1);
          for (let v = 0.9; v >= -0.001; v -= 0.1) outl += 'L' + col(1, v);
          outline.setAttribute('d', outl); foldL.setAttribute('d', fl);
          // a woven band near the hem and the fringe below it
          for (let j = 0; j < 14; j++) {
            const u = (j + 0.5) / 14, p = pt(u, 0.9, lt), y = hem(u, lt) - 70, s = 16;
            bd += `M${f1(p[0])} ${f1(y - s)}L${f1(p[0] + s)} ${f1(y)}L${f1(p[0])} ${f1(y + s)}L${f1(p[0] - s)} ${f1(y)}Z`;
          }
          for (let j = 0; j <= 60; j++) { const u = j / 60, p = pt(u, 1, lt), y = hem(u, lt); fr += `M${f1(p[0])} ${f1(y)}l${f1(3 * Math.sin(lt * 0.6 + j))} 34`; }
          border.setAttribute('d', bd); fringe.setAttribute('d', fr);
          // on the cue a soft sheen slides down the cloth
          const s = BTL.ease(lt, at - 0.2, 1.8), v0 = -0.1 + 1.1 * s;
          let sd = 'M' + col(0.05, clamp01(v0)) + 'L' + col(0.95, clamp01(v0 + 0.06)) + 'L' + col(0.95, clamp01(v0 + 0.14)) + 'L' + col(0.05, clamp01(v0 + 0.08)) + 'Z';
          sheen.setAttribute('d', sd); sheen.setAttribute('fill-opacity', (0.3 * Math.sin(Math.PI * s)).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ fifty years, as tally marks
  SH.bt_orhun_years = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), n = P.n || 50;
      P0(root, 'M-60 -60L1140 -60L1140 2000L-60 2000Z', mix(C.paperLight, C.paperDark, 0.15), 1);
      BTL.glow(svg, defs, 540, 760, 620, C.stain, 0.2, root);
      const num = txt(root, '0', 540, 470, 230, { weight: 300, color: C.gold });
      const lab = txt(root, P.label || 'yıl', 540, 560, 58, { font: BTL.LO, italic: true, color: C.ink, weight: 400 });
      const marks = [];
      for (let i = 0; i < n; i++) {
        const grp = Math.floor(i / 5), k = i % 5, gx = 170 + (grp % 2) * 420, gy = 680 + Math.floor(grp / 2) * 92, r = rng(100 + i);
        const d = k < 4 ? `M${f1(gx + k * 52 + r() * 4)} ${gy}L${gx + k * 52 + 6} ${gy + 70}` : `M${gx - 20} ${gy + 58}L${gx + 190} ${gy + 10}`;
        marks.push(L0(root, d, C.ink, 5, 0.9, { pathLength: 1 }));
      }
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5), T = Math.max(1.2, at + 0.4);
          const c = clamp01((lt - 0.1) / T);
          marks.forEach((m, i) => draw(m, clamp01((c * n - i) / 1.2)));
          num.textContent = String(Math.min(n, Math.round(c * n)));
          fade(num, BTL.ease(lt, 0, 0.6)); fade(lab, BTL.ease(lt, 0.3, 0.8));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the bowl
  SH.bt_orhun_cup = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      // close on one drinking bowl; a thin wooden edge below, a soft shadow; on the cue the drink darkens, rings spread
      // on its surface, the steam stops and the pool of light narrows
      const root = el(canvas(svg, W, H), 'g'), CX = 540, CY = 760, K = 1.9;
      const lamp = BTL.glow(svg, defs, CX, CY - 60, 720, C.stain, 0.42, root);
      L0(root, `M-60 ${CY + 300}L1140 ${CY + 300}`, C.inkSoft, 3, 0.6);
      L0(root, `M-60 ${CY + 318}L1140 ${CY + 318}`, C.inkSoft, 1.5, 0.35);
      P0(root, BTL.E(CX + 16, CY + 290, 300, 26), C.paperDark, 0.6);
      const sm = smoke(root, 29, 9, { size: 46, dy: 520, dx: 40, rate: 0.16, alpha: 0.3 });
      const g = el(root, 'g', { transform: `translate(${CX} ${CY}) scale(${K})` }), w = v => v / K;
      const bowl = 'M-220 -40C-210 60 -120 116 0 116C120 116 210 60 220 -40Z';
      P0(g, bowl, mix(C.gold, C.paperDark, 0.3), 1);
      P0(g, 'M-60 116L60 116L48 140L-48 140Z', mix(C.gold, C.paperDark, 0.42), 1);
      L0(g, bowl, C.ink, w(3.5), 1); L0(g, 'M-60 116L-48 140L48 140L60 116', C.ink, w(3), 1);
      L0(g, 'M-200 10C-120 40 120 40 200 10M-170 52C-100 74 100 74 170 52', C.inkSoft, w(2), 0.7);
      P0(g, BTL.E(0, -40, 220, 34), mix(C.paperDark, C.ink, 0.2), 1);
      const drink = P0(g, BTL.E(0, -38, 198, 27), mix(C.red, C.paperDark, 0.45), 1);
      const hl = L0(g, 'M-120 -50C-60 -58 0 -58 40 -54', C.paperLight, w(4), 0.5);
      const rings = Array.from({ length: 3 }, () => L0(g, '', C.paperLight, w(2.5), 0));
      L0(g, BTL.E(0, -40, 220, 34), C.ink, w(3.5), 1);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55), q = BTL.ease(lt, at - 0.3, 1.2);
          drink.setAttribute('fill', mix(mix(C.red, C.paperDark, 0.45), mix(C.green, C.paperDark, 0.72), q));
          hl.setAttribute('stroke-opacity', (0.5 * (1 - q)).toFixed(3));
          lamp.set(0.42 * (1 - 0.55 * q)); lamp.e.setAttribute('r', f1(720 - 340 * q));
          sm.update(lt, CX - 20, CY - 120, 1 - q);
          rings.forEach((e, i) => {
            const v = (lt - at + 0.2 - i * 0.45) / 1.6;
            if (v <= 0 || v >= 1) { e.setAttribute('stroke-opacity', '0'); return; }
            e.setAttribute('d', BTL.E(0, -38, 20 + 170 * v, (20 + 170 * v) * 0.135));
            e.setAttribute('stroke-opacity', (0.8 * (1 - v)).toFixed(3));
          });
        },
      };
    },
  };

  // ------------------------------------------------------------------ the camp fades
  SH.bt_orhun_camp = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 900;
      const dusk = BTL.glow(svg, defs, 540, HZ - 120, 760, C.gold, 0.26, root);
      const S = steppe(root, svg, defs, HZ, 13, { hill: 50, clouds: 3 });
      const T = [[150, HZ + 40, 220], [380, HZ + 70, 300], [650, HZ + 110, 400], [920, HZ + 60, 260], [540, HZ + 190, 360]];
      const ys = T.map(([x, y, w], i) => ({ y: yurt(root, x, y, w, { lw: 2.5 + w / 200 }), sm: smoke(root, 60 + i, 6, { size: 14 + w / 18, dy: 200 + w * 0.5, dx: 50, rate: 0.08, alpha: 0.2 }) }));
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.7), t0 = Math.max(0.3, Math.min(at - 1.4, dur * 0.3));
          S.update(lt);
          dusk.set(0.26 * (1 - 0.5 * BTL.ease(lt, t0, 2)));
          ys.forEach((q, i) => {
            const order = [3, 0, 2, 1, 4][i], f = BTL.ease(lt, t0 + order * 0.28, 0.8);
            q.sm.update(lt + i * 1.3, q.y.top[0], q.y.top[1] - 4, 1 - f);
            q.y.fillE.setAttribute('fill-opacity', (1 - 0.85 * f).toFixed(3));
            q.y.door.setAttribute('fill-opacity', (1 - 0.85 * f).toFixed(3));
            q.y.det.setAttribute('stroke-opacity', (0.6 * (1 - 0.8 * f)).toFixed(3));
            q.y.line.setAttribute('stroke-opacity', (1 - 0.7 * f).toFixed(3));
          });
        },
      };
    },
  };
})();
