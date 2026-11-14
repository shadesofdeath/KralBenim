// bt_montagu_b: Lady Mary Wortley Montagu and the smallpox inoculation, part 2 (London 1721 → 1980), belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; faceless period silhouettes; the only motion is slow and
// natural (window light, a lantern flame, drifting motes, a slowly turning globe). Places on the 1920x1080 stage.
//   bt_mw_girl     P: {}  cues: hit   an English room with a tall sash window: a small girl on a chair holds out her arm,
//                  the surgeon bends over it; on hit three wigged physicians appear one by one at the back
//   bt_mw_newgate  P: {mode: "gate"|"cell"|"free", label}  cues: hit   Newgate. gate: night, the heavy stone front, iron
//                  door in a round arch, one lantern; the barred window above lights on hit. cell: inside, moonlight
//                  through a high barred window, six seated faceless figures; a soft light finds each one on hit.
//                  free: dawn, the door slowly opens, warm light, six figures walk out
//   bt_mw_royal    P: {label, sub}  cues: hit   a small crown on a cushion in a light pool; two little girls (wide
//                  skirts) appear behind it on hit
//   bt_mw_doctors  P: {mode: "turn", label}  cues: hit   three wigged physicians face a pamphlet lying lit on the
//                  floor; on hit they turn their backs on it one by one (slow turn), the light on it dims
//   bt_mw_pulpit   P: {word}  cues: hit   a church: tall lancet windows, a high wooden pulpit under its sounding board,
//                  a preacher raising his arm slowly; on hit the gold italic word appears
//   bt_mw_body     P: {mode: "breath"|"immune"}  cues: hit, b   a quiet body outline (head, shoulders, torso).
//                  breath: lungs inside; on hit faint motes are breathed in, on b they spread through the whole body.
//                  immune: a thin gold halo draws round the body on hit; from b motes come from outside and go out
//                  on the halo
//   bt_mw_routes   P: {left, right}  cues: hit   two columns: "nefes" with many motes, "deri" with a few; on hit the
//                  right column turns gold
//   bt_mw_ratio    P: {mode: "row"|"grid"|"tally", n, label, note, pick}  cues: hit, b   row: n standing figures,
//                  on hit one fades to a ghost with a gold ring, label (gold) under them. grid: n small figures in rows,
//                  same; on b the picture slowly closes in on that one. tally: n thin upright lines that turn gold one
//                  by one on hit, label under them. note: italic line above
//   bt_mw_barn     P: {label}  cues: hit   dawn: a barn with an open door, a cow inside in lantern light, a milkmaid
//                  with a pail outside; on hit soft light falls on her
//   bt_mw_globe    P: {mode: "dark"|"clear", label}  cues: hit, b   a slowly turning line globe (graticule, coasts).
//                  dark: faint marks appear on the land one after another, faster from hit. clear: the marks go out
//                  one by one from hit, the last one (East Africa) last; on b a thin gold ring draws round the globe
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2, D2R = Math.PI / 180;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const T = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const ital = (g, s, x, y, size = 48, o = {}) => T(g, s, x, y, size, Object.assign({ font: LO, italic: true, weight: 400, color: C.inkSoft }, o));
  const stroke = (e, p) => { e.setAttribute('pathLength', 1); draw(e, clamp01(p)); };
  const SIL = () => C.paperDark, RIM = () => C.inkSoft;
  const wallTone = () => mix(C.paper, C.paperLight, 0.55), floorTone = () => mix(C.paperDark, C.paper, 0.45);

  // slow drifting motes inside a box (dust in a light beam)
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.ink, 0), x: r(), y: r(), s: 1.4 + r() * 2.4, v: 0.008 + r() * 0.014, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.x + q.v * lt + 10) % 1, x = box[0] + u * w, y = box[1] + q.y * h + 10 * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.4) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }

  // ---------------------------------------------------------------- period silhouettes (faceless)
  // drawn in a 1000-unit figure (feet at 0, head top near -1000), facing +x; flip with o.face = -1.
  // Returns {g (placed at x, y), inner (scaled), setFace(sx)} so a figure can turn slowly (sx from -1 to 1).
  function figure(parent, x, y, h, build, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)})${o.rot ? ` rotate(${o.rot})` : ''}` });
    const k = h / 1000, inner = el(g, 'g');
    const col = o.color || SIL(), rim = o.rim || RIM(), rw = 2.6 / k;
    const fill = d => el(inner, 'path', { d, fill: col, stroke: rim, 'stroke-width': rw, 'stroke-linejoin': 'round' });
    const limb = (d, w) => { el(inner, 'path', { d, fill: 'none', stroke: rim, 'stroke-width': w + 2 * rw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); return el(inner, 'path', { d, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }); };
    const api = { g, inner, k, fill, limb, col, rim, setFace(sx) { inner.setAttribute('transform', `scale(${(sx * k).toFixed(4)} ${k.toFixed(4)})`); } };
    build(api);
    api.setFace(o.face ?? 1);
    return api;
  }
  const ARMS = { down: [[15, -600], [30, -470]], forward: [[90, -620], [210, -600]], reach: [[95, -590], [230, -290]],
    up: [[120, -880], [190, -1040]], half: [[130, -740], [220, -820]], pail: [[30, -600], [50, -470]] };
  // a gentleman of the 1720s in profile: full-bottomed wig, long coat with flared skirts, stockings; o.hat: tricorn
  function gent(parent, x, y, h, o = {}) {
    let arm = null;
    const f = figure(parent, x, y, h, F => {
      F.limb('M-30-272L-40-22M30-272L42-22', 50);
      F.limb('M-40-14L8-14M42-14L90-14', 30);
      F.fill('M-40-812C-92-790-100-640-100-520C-104-420-140-330-160-262L72-268C84-380 84-520 74-640C70-740 64-800 22-822Z');
      F.fill(BTL.E(-14, -872, 80, 82));                       // wig
      F.fill('M-74-850C-100-800-104-740-92-700L-56-720C-60-760-58-800-40-840Z');   // wig falls on the shoulder
      F.fill(BTL.E(10, -884, 60, 62));
      if (o.hat) F.fill('M-110-922Q0-962 110-922L74-948Q0-1032-74-948Z');
      const a = ARMS[o.arm || 'down'];
      arm = F.limb(`M0-760L${a[0][0]} ${a[0][1]}L${a[1][0]} ${a[1][1]}`, 48);
      if (o.bag) F.fill(`M${a[1][0] - 50} ${a[1][1] + 10}h100v80h-100z`);
    }, o);
    f.arm = arm;
    return f;
  }
  // a lady (or girl) in profile: hair in a knot, fitted bodice, wide skirt
  function lady(parent, x, y, h, o = {}) {
    return figure(parent, x, y, h, F => {
      F.fill('M-40-815C-62-760-58-680-48-625C-190-520-270-230-290 0L250 0C230-230 170-520 48-625C58-690 56-770 30-818Z');
      F.fill(BTL.E(-56, -900, 34, 34));
      F.fill(BTL.E(0, -888, 60, 62));
      const a = ARMS[o.arm || 'down'];
      F.limb(`M0-765L${a[0][0] + 20} ${a[0][1]}L${a[1][0] + 30} ${a[1][1]}`, 42);
      if (o.pail) { F.fill('M10-420L130-420L116-280L24-280Z'); F.limb('M20-420Q70-520 120-420', 10); }
    }, o);
  }

  // ---------------------------------------------------------------- bt_mw_girl
  SH.bt_mw_girl = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 900, fy: 560, k: 1.5 });
      const GY = 860, WB = 690;
      P0(g, `M-400 -200L2320 -200L2320 ${WB}L-400 ${WB}Z`, wallTone(), 1);
      P0(g, `M-400 ${WB}L2320 ${WB}L2320 1900L-400 1900Z`, floorTone(), 1);
      L0(g, `M-400 ${WB}L2320 ${WB}M-400 ${WB - 150}L2320 ${WB - 150}`, C.inkSoft, 2, 0.5);
      let fb = ''; for (let x = -300; x <= 2300; x += 160) { const k = (940 - WB) / (940 - 300); fb += `M${x} ${WB}L${f1(960 + (x - 960) * (1 + k * 1.2))} 940`; }
      L0(g, fb, C.inkSoft, 1.4, 0.25);
      // the tall sash window, light falling across the floor
      const wx0 = 1200, wx1 = 1440, wy0 = 150, wy1 = 600;
      const sky = BTL.glow(svg, defs, (wx0 + wx1) / 2, 380, 420, C.stain, 0.22, g);
      P0(g, `M${wx1} ${wy1}L${wx0} ${wy1}L560 940L1180 940Z`, C.stain, 0.07);
      P0(g, `M${wx0} ${wy0}h${wx1 - wx0}v${wy1 - wy0}h${wx0 - wx1}z`, mix(C.paperLight, C.stain, 0.25), 1);
      let panes = `M${wx0} ${wy0}h${wx1 - wx0}v${wy1 - wy0}h${wx0 - wx1}z`;
      for (let i = 1; i < 3; i++) panes += `M${wx0 + i * (wx1 - wx0) / 3} ${wy0}V${wy1}`;
      for (let j = 1; j < 4; j++) panes += `M${wx0} ${wy0 + j * (wy1 - wy0) / 4}H${wx1}`;
      L0(g, panes, C.ink, 3, 0.8);
      P0(g, `M${wx0 - 70} ${wy0 - 40}C${wx0 - 30} ${wy0 + 150} ${wx0 - 50} ${wy1} ${wx0 - 90} ${wy1 + 60}L${wx0 - 20} ${wy1 + 60}C${wx0 - 10} ${wy1 - 100} ${wx0 - 10} ${wy0 + 100} ${wx0 - 10} ${wy0 - 40}Z`, C.paperDark, 0.9);
      P0(g, `M${wx1 + 70} ${wy0 - 40}C${wx1 + 30} ${wy0 + 150} ${wx1 + 50} ${wy1} ${wx1 + 90} ${wy1 + 60}L${wx1 + 20} ${wy1 + 60}C${wx1 + 10} ${wy1 - 100} ${wx1 + 10} ${wy0 + 100} ${wx1 + 10} ${wy0 - 40}Z`, C.paperDark, 0.9);
      L0(g, `M${wx0 - 110} ${wy0 - 40}H${wx1 + 110}`, C.inkSoft, 4, 0.8);
      // three physicians, witnesses at the back
      const docs = [330, 470, 610].map((x, i) => { const d = gent(g, x, WB + 50, 360, { face: 1, arm: i === 1 ? 'half' : 'down' }); fade(d.g, 0); return d; });
      // the chair and the girl
      L0(g, `M742 ${GY}L742 640M735 788L855 788M748 792L748 ${GY}M848 792L848 ${GY}`, C.inkSoft, 6, 0.95);
      BTL.person(g, 'sit', 790, GY, 300, { face: 1 });
      // the surgeon bends over her arm
      gent(g, 1010, GY, 540, { face: -1, arm: 'reach', rot: -5 });
      const glint = L0(g, 'M872 700L892 712', C.gold, 3, 0);
      const gl = BTL.glow(svg, defs, 884, 708, 50, C.gold, 0, g);
      const ds = motes(g, 7, 26, [600, 200, 1300, 900], { alpha: 0.35 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); sky.set(0.22 + 0.04 * Math.sin(lt * 0.45));
          const q = BTL.ease(lt, 1.0, 1.2);
          glint.setAttribute('stroke-opacity', (0.9 * q).toFixed(3)); gl.set(0.4 * q * (0.85 + 0.15 * Math.sin(lt * 1.3)));
          const hit = cue(cues, 'hit', dur * 0.6);
          docs.forEach((d, i) => fade(d.g, BTL.ease(lt, hit - 0.2 + i * 0.55, 1.2)));
        },
      };
    },
  };

  // ---------------------------------------------------------------- Newgate
  function newgateFront(g, svg, defs, o = {}) {
    const GY = 880, TOP = 110, ax0 = 800, ax1 = 1120, spring = 540, axc = (ax0 + ax1) / 2, ar = (ax1 - ax0) / 2;
    const r = rng(19);
    P0(g, `M-400 ${TOP}L2320 ${TOP}L2320 ${GY}L-400 ${GY}Z`, mix(C.paperLight, C.paperDark, 0.35), 1);
    let cs = ''; for (let y = TOP + 70, row = 0; y < GY; y += 70, row++) { cs += `M-400 ${y}L2320 ${y}`; for (let x = -400 + (row % 2) * 90 + r() * 40; x < 2320; x += 180 + r() * 40) if (x < ax0 - 40 || x > ax1 + 40 || y < spring - ar - 60) cs += `M${f1(x)} ${y - 70}L${f1(x)} ${y}`; }
    L0(g, cs, C.inkSoft, 1.6, 0.4);
    L0(g, `M-400 ${TOP}L2320 ${TOP}M-400 ${TOP + 26}L2320 ${TOP + 26}`, C.ink, 3, 0.8);
    // the arch: light inside (free) behind the two iron door leaves
    const archD = `M${ax0} ${GY}L${ax0} ${spring}A${ar} ${ar} 0 0 1 ${ax1} ${spring}L${ax1} ${GY}Z`;
    const inside = P0(g, archD, mix(C.paperDark, C.ink, 0.04), 1);
    const inLight = BTL.glow(svg, defs, axc, 700, 260, C.gold, 0, g);
    const walkers = el(g, 'g');
    const leaf = (x0, x1, hinge) => {
      const lg = el(g, 'g'), lgi = el(lg, 'g');
      const d = x0 < axc ? `M${x0} ${GY}L${x0} ${spring}A${ar} ${ar} 0 0 1 ${axc} ${spring - ar}L${axc} ${GY}Z` : `M${axc} ${GY}L${axc} ${spring - ar}A${ar} ${ar} 0 0 1 ${x1} ${spring}L${x1} ${GY}Z`;
      const cid = 'mwng' + (++ANIUID); const cp = el(lgi, 'clipPath', { id: cid }); el(cp, 'path', { d });
      P0(lgi, d, mix(C.paperDark, C.ink, 0.1), 1);
      const cl = el(lgi, 'g', { 'clip-path': `url(#${cid})` });
      let pl = ''; for (let x = x0 + 32; x < x1; x += 32) pl += `M${x} ${spring - ar}L${x} ${GY}`;
      L0(cl, pl, C.inkSoft, 1.6, 0.45);
      let st = ''; for (let y = 600; y < GY; y += 90) for (let x = x0 + 22; x < x1; x += 46) st += BTL.E(x, y, 4, 4);
      P0(cl, st, C.inkSoft, 0.7);
      L0(cl, `M${x0} 640L${x1} 640M${x0} 780L${x1} 780`, C.inkSoft, 5, 0.6);
      L0(lgi, d, C.ink, 3, 0.9);
      return { lg, hinge };
    };
    const leaves = [leaf(ax0, axc, ax0), leaf(axc, ax1, ax1)];
    // voussoirs + keystone
    let vs = ''; for (let a = 0; a <= 180; a += 18) { const t = Math.PI - a * D2R; vs += `M${f1(axc + Math.cos(t) * ar)} ${f1(spring - Math.sin(t) * ar)}L${f1(axc + Math.cos(t) * (ar + 70))} ${f1(spring - Math.sin(t) * (ar + 70))}`; }
    L0(g, vs + `M${ax0 - 70} ${spring}A${ar + 70} ${ar + 70} 0 0 1 ${ax1 + 70} ${spring}`, C.ink, 3, 0.85);
    P0(g, `M${axc - 30} ${spring - ar - 76}L${axc + 30} ${spring - ar - 76}L${axc + 22} ${spring - ar + 4}L${axc - 22} ${spring - ar + 4}Z`, mix(C.paperLight, C.paperDark, 0.15), 1);
    L0(g, `M${axc - 30} ${spring - ar - 76}L${axc + 30} ${spring - ar - 76}L${axc + 22} ${spring - ar + 4}L${axc - 22} ${spring - ar + 4}Z`, C.ink, 3, 0.85);
    // the small barred window above the arch
    const bw = `M${axc - 70} 180h140v110h-140z`;
    const win = P0(g, bw, C.gold, 0);
    P0(g, bw, mix(C.paperDark, C.ink, 0.05), 1);
    const winLit = P0(g, bw, C.gold, 0);
    const winGlow = BTL.glow(svg, defs, axc, 235, 140, C.gold, 0, g);
    L0(g, bw + `M${axc - 35} 180V290M${axc} 180V290M${axc + 35} 180V290`, C.ink, 4, 0.9);
    // lantern on an iron bracket
    const lx = 1320, ly = 470;
    L0(g, `M${lx + 90} ${ly - 80}L${lx + 90} ${ly - 30}M${lx + 90} ${ly - 70}L${lx} ${ly - 70}L${lx} ${ly - 40}M${lx + 90} ${ly - 40}Q${lx + 40} ${ly - 46} ${lx + 20} ${ly - 68}`, C.ink, 4, 0.9);
    const lampGlow = BTL.glow(svg, defs, lx, ly + 10, 300, C.gold, o.night ? 0.32 : 0.12, g);
    P0(g, `M${lx - 34} ${ly - 40}L${lx + 34} ${ly - 40}L${lx + 26} ${ly + 50}L${lx - 26} ${ly + 50}Z`, mix(C.paperDark, C.gold, 0.25), 1);
    const flame = P0(g, '', C.ink, 0.95);
    L0(g, `M${lx - 34} ${ly - 40}L${lx + 34} ${ly - 40}L${lx + 26} ${ly + 50}L${lx - 26} ${ly + 50}ZM${lx} ${ly - 40}V${ly + 50}M${lx - 44} ${ly - 40}L${lx} ${ly - 64}L${lx + 44} ${ly - 40}`, C.ink, 3, 0.9);
    // the street in front: cobbles end above the captions
    P0(g, `M-400 ${GY}L2320 ${GY}L2320 1900L-400 1900Z`, floorTone(), 1);
    L0(g, `M-400 ${GY}L2320 ${GY}`, C.ink, 3, 0.8);
    let cb = ''; for (let y = GY + 22, row = 0; y < 940; y += 22, row++) for (let x = -380 + (row % 2) * 30; x < 2320; x += 62) cb += `M${x} ${y}h40`;
    L0(g, cb, C.inkSoft, 1.4, 0.3);
    return { GY, axc, ar, spring, leaves, inLight, walkers, win: winLit, winGlow, lampGlow, flame, lx, ly, inside };
  }
  let ANIUID = 0;

  SH.bt_mw_newgate = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'gate', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.4 });
      if (mode === 'cell') {
        const GY = 820;
        P0(g, `M-400 -200L2320 -200L2320 ${GY}L-400 ${GY}Z`, mix(C.paperLight, C.paperDark, 0.45), 1);
        const r = rng(23); let cs = '';
        for (let y = 0, row = 0; y < GY; y += 80, row++) { cs += `M-400 ${y}L2320 ${y}`; for (let x = -400 + (row % 2) * 100 + r() * 50; x < 2320; x += 210 + r() * 50) cs += `M${f1(x)} ${y}L${f1(x)} ${y + 80}`; }
        L0(g, cs, C.inkSoft, 1.6, 0.35);
        P0(g, `M-400 ${GY}L2320 ${GY}L2320 1900L-400 1900Z`, floorTone(), 1);
        L0(g, `M-400 ${GY}L2320 ${GY}`, C.ink, 3, 0.7);
        let straw = ''; for (let i = 0; i < 60; i++) { const x = -100 + r() * 2100, y = GY + 20 + r() * 90, a = (r() - 0.5) * 0.8; straw += `M${f1(x)} ${f1(y)}l${f1(Math.cos(a) * 34)} ${f1(Math.sin(a) * 34)}`; }
        L0(g, straw, C.inkSoft, 1.6, 0.35);
        // the high barred window and its cold beam
        const wx = 960, wy0 = 130, wy1 = 290;
        const moon = BTL.glow(svg, defs, wx, 210, 260, C.ink, 0.12, g);
        P0(g, `M${wx - 90} ${wy1}L${wx + 90} ${wy1}L${wx + 520} ${GY + 60}L${wx - 520} ${GY + 60}Z`, C.ink, 0.045);
        P0(g, `M${wx - 90} ${wy0}h180v${wy1 - wy0}h-180z`, mix(C.paper, C.ink, 0.35), 1);
        L0(g, `M${wx - 90} ${wy0}h180v${wy1 - wy0}h-180zM${wx - 45} ${wy0}V${wy1}M${wx} ${wy0}V${wy1}M${wx + 45} ${wy0}V${wy1}M${wx - 90} ${(wy0 + wy1) / 2}H${wx + 90}`, C.ink, 5, 0.9);
        const pool = BTL.glow(svg, defs, wx, GY + 30, 420, C.ink, 0.08, g);
        // six men sit on a low stone bench along the wall
        P0(g, `M-400 ${GY - 60}L2320 ${GY - 60}L2320 ${GY}L-400 ${GY}Z`, mix(C.paperLight, C.paperDark, 0.25), 1);
        L0(g, `M-400 ${GY - 60}L2320 ${GY - 60}`, C.inkSoft, 2.4, 0.8);
        const xs = [300, 560, 800, 1120, 1360, 1620], lights = [], figs = [];
        xs.forEach((x, i) => {
          lights.push(BTL.glow(svg, defs, x + 20, GY - 120, 170, C.stain, 0, g));
          figs.push(BTL.person(g, 'sit', x, GY + 6, 250, { face: i < 3 ? 1 : -1 }));
        });
        const lab = P.label ? ital(g, P.label, 1480, 360, 52, { color: C.ink }) : null;
        const ds = motes(g, 31, 30, [520, 300, 1400, 860], { alpha: 0.45 });
        return {
          update(lt, dur, cues) {
            ds.update(lt); moon.set(0.12 + 0.03 * Math.sin(lt * 0.4)); pool.set(0.08 + 0.02 * Math.sin(lt * 0.4 + 1));
            const hit = cue(cues, 'hit', dur * 0.55);
            lights.forEach((l, i) => l.set(0.32 * BTL.ease(lt, hit - 0.2 + i * 0.32, 1.1)));
            if (lab) fade(lab, BTL.ease(lt, 0.6, 1.4));
          },
        };
      }
      const night = mode === 'gate';
      const sky = BTL.glow(svg, defs, 960, 40, 900, night ? C.inkSoft : C.stain, night ? 0.08 : 0.4, g);
      const N = newgateFront(g, svg, defs, { night });
      const walkers = [];
      if (mode === 'free') {
        const ends = [[700, 915, 1.04], [1220, 915, 1.04], [520, 925, 1.08], [1400, 925, 1.08], [340, 930, 1.1], [1580, 930, 1.1]];
        ends.forEach((e, i) => {
          const wg = el(N.walkers, 'g');
          BTL.person(wg, 'stand', 0, 0, 230, { face: e[0] < N.axc ? -1 : 1 });
          walkers.push({ wg, e, x0: N.axc + (i - 2.5) * 22, d: 0.2 + i * 0.1 });
        });
        g.appendChild(N.walkers);   // once out of the arch they pass in front of the opened leaves
      }
      const lab = P.label ? T(g, P.label, 960, 70, 56, { weight: 300 }) : null;
      const ds = motes(g, night ? 13 : 17, 24, [-100, 300, 2020, 870], { alpha: night ? 0.3 : 0.4 });
      return {
        update(lt, dur, cues) {
          ds.update(lt);
          const fl = 1 + 0.12 * Math.sin(lt * 2.3) + 0.06 * Math.sin(lt * 3.7);
          N.flame.setAttribute('d', `M${N.lx - 11} ${N.ly + 30}Q${N.lx} ${f1(N.ly + 30 - 50 * fl)} ${N.lx + 11} ${N.ly + 30}Z`);
          N.lampGlow.set((night ? 0.32 : 0.12) * (0.9 + 0.1 * fl));
          const hit = cue(cues, 'hit', dur * 0.55);
          if (night) {
            sky.set(0.08);
            const q = BTL.ease(lt, hit - 0.3, 1.6);
            N.win.setAttribute('fill-opacity', (0.55 * q).toFixed(3)); N.winGlow.set(0.4 * q);
          } else {
            sky.set(0.32 + 0.12 * BTL.ease(lt, 0, Math.max(4, dur)));
            const o = BTL.ease(lt, 0, 1.2);
            N.leaves.forEach(l => l.lg.setAttribute('transform', `translate(${l.hinge} 0) scale(${(1 - 0.84 * o).toFixed(3)} 1) translate(${-l.hinge} 0)`));
            N.inLight.set(0.5 * o);
            N.inside.setAttribute('fill', mix(mix(C.paperDark, C.ink, 0.04), C.stain, 0.45 * o));
            walkers.forEach(w => {
              const p = BTL.ease(lt, w.d, 1.3), s = lerp(0.82, w.e[2], p);
              w.wg.setAttribute('transform', `translate(${f1(lerp(w.x0, w.e[0], p))} ${f1(lerp(N.GY, w.e[1], p))}) scale(${s.toFixed(3)})`);
              fade(w.wg, BTL.ease(lt, w.d - 0.3, 0.6));
            });
          }
          if (lab) fade(lab, BTL.ease(lt, 0.6, 1.4));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_mw_royal
  SH.bt_mw_royal = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.4 });
      const pool = BTL.glow(svg, defs, 960, 560, 520, C.stain, 0.3, g);
      const girls = [lady(g, 640, 780, 330, { face: 1 }), lady(g, 1290, 790, 300, { face: -1, arm: 'half' })];
      girls.forEach(q => fade(q.g, 0));
      // a draped plinth, the cushion, the crown
      const D = BTL.drawing(g);
      D.f('M800 660L1120 660L1150 900L770 900Z', C.paperLight, 1);
      D.s('M800 660L1120 660L1150 900L770 900Z', { w: 3 });
      D.s('M860 660C850 740 840 820 820 900M1060 660C1070 740 1080 820 1100 900M960 660L960 900', { w: 2, color: C.inkSoft });
      const cush = 'M760 650C740 610 760 580 800 576C900 566 1020 566 1120 576C1160 580 1180 610 1160 650C1100 668 820 668 760 650Z';
      D.f(cush, mix(C.red, C.paperDark, 0.45), 1); D.s(cush, { w: 3.5 });
      D.s('M800 590C900 606 1020 606 1120 590', { w: 2, color: C.inkSoft });
      D.s('M762 648l-18 40M1158 648l18 40', { w: 4, color: C.gold });
      const crown = 'M860 580L860 500L900 530L930 470L960 520L990 470L1020 530L1060 500L1060 580Z';
      D.f(crown, C.gold, 0.35); D.s(crown, { w: 4, color: C.gold });
      D.s('M860 560L1060 560', { w: 3, color: C.gold });
      const jewels = [[930, 470], [990, 470], [960, 520], [900, 545], [1020, 545]].map(([x, y], i) => ({ e: P0(g, BTL.E(x, y, 9, 9), C.ink, 0), ph: i * 1.3 }));
      const lab = P.label ? T(g, P.label, 960, 190, 76, { weight: 300 }) : null;
      const sub = P.sub ? ital(g, P.sub, 960, 262, 50, { color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          pool.set(0.3 + 0.04 * Math.sin(lt * 0.5));
          D.reveal(BTL.ease(lt, 0, 2.4));
          jewels.forEach(j => j.e.setAttribute('fill-opacity', (BTL.ease(lt, 1.4, 1) * (0.55 + 0.4 * Math.sin(lt * 0.9 + j.ph))).toFixed(3)));
          const hit = cue(cues, 'hit', dur * 0.6);
          girls.forEach((q, i) => fade(q.g, 0.9 * BTL.ease(lt, hit - 0.3 + i * 0.5, 1.4)));
          if (lab) fade(lab, BTL.ease(lt, 0.6, 1.2));
          if (sub) fade(sub, BTL.ease(lt, 1.2, 1.2));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_mw_doctors
  SH.bt_mw_doctors = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 1000, fy: 560, k: 1.4 });
      const GY = 860;
      P0(g, `M-400 -200L2320 -200L2320 ${GY - 120}L-400 ${GY - 120}Z`, wallTone(), 1);
      P0(g, `M-400 ${GY - 120}L2320 ${GY - 120}L2320 1900L-400 1900Z`, floorTone(), 1);
      L0(g, `M-400 ${GY - 120}L2320 ${GY - 120}`, C.inkSoft, 2, 0.5);
      // the pamphlet, open on a reading desk in its own light
      const pg = BTL.glow(svg, defs, 560, 600, 340, C.stain, 0.46, g);
      const D = BTL.drawing(g);
      D.f('M520 640L600 640L620 860L500 860Z', mix(C.paperLight, C.paperDark, 0.3), 1);
      D.s('M520 640L600 640L620 860L500 860ZM470 870L650 870', { w: 3 });
      D.f('M380 650L740 650L700 600L420 600Z', mix(C.paperLight, C.paperDark, 0.35), 1);
      D.s('M380 650L740 650L700 600L420 600Z', { w: 3 });
      const pa = 'M410 600L560 560L566 612L414 640Z', pb = 'M560 560L712 586L714 636L566 612Z';
      D.f(pa, C.paperLight, 1); D.f(pb, C.paperLight, 1);
      D.s(pa, { w: 3 }); D.s(pb, { w: 3 });
      D.s('M440 604L540 578M444 616L544 590M446 628L546 602M584 580L688 598M586 592L690 610M588 604L690 622', { w: 2.2, color: C.inkSoft });
      const docs = [1000, 1240, 1480].map((x, i) => gent(g, x, GY, 520 - i * 10, { face: -1, arm: i === 0 ? 'forward' : (i === 1 ? 'half' : 'down') }));
      const lab = P.label ? ital(g, P.label, 560, 470, 58, { color: C.gold }) : null;
      const ds = motes(g, 41, 22, [300, 200, 1700, 840], { alpha: 0.3 });
      const armD = (a, b, q) => { const A = ARMS[a], B = ARMS[b], e = [lerp(A[0][0], B[0][0], q), lerp(A[0][1], B[0][1], q)], h = [lerp(A[1][0], B[1][0], q), lerp(A[1][1], B[1][1], q)]; return `M0-760L${f1(e[0])} ${f1(e[1])}L${f1(h[0])} ${f1(h[1])}`; };
      return {
        update(lt, dur, cues) {
          ds.update(lt);
          D.reveal(BTL.ease(lt, 0, 2));
          const hit = cue(cues, 'hit', dur * 0.6);
          docs.forEach((d, i) => {
            const at = Math.min(hit - 0.3, dur - 2.6) + i * 0.45, q = BTL.ease(lt, at, 1.0), w = BTL.ease(lt, at + 0.8, 1.8);
            d.setFace(-1 + 2 * q);
            d.g.setAttribute('transform', `translate(${f1([1000, 1240, 1480][i] + 110 * w)} ${GY})`);
            const dd = armD(i === 0 ? 'forward' : (i === 1 ? 'half' : 'down'), 'down', q);
            d.arm.setAttribute('d', dd); d.arm.previousSibling.setAttribute('d', dd);
            fade(d.g, 1 - 0.35 * w);
          });
          pg.set(0.46 - 0.26 * BTL.ease(lt, hit + 0.6, 2.2) + 0.03 * Math.sin(lt * 0.6));
          if (lab) fade(lab, BTL.ease(lt, hit - 0.4, 1.2));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_mw_pulpit
  SH.bt_mw_pulpit = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.4 });
      const GY = 880;
      P0(g, `M-400 -200L2320 -200L2320 ${GY}L-400 ${GY}Z`, wallTone(), 1);
      P0(g, `M-400 ${GY}L2320 ${GY}L2320 1900L-400 1900Z`, floorTone(), 1);
      // two tall lancet windows
      const lights = [];
      for (const x of [420, 1500]) {
        const d = `M${x - 80} 720L${x - 80} 300Q${x - 80} 170 ${x} 120Q${x + 80} 170 ${x + 80} 300L${x + 80} 720Z`;
        lights.push(BTL.glow(svg, defs, x, 400, 300, C.stain, 0.2, g));
        P0(g, d, mix(C.paperLight, C.stain, 0.2), 1);
        L0(g, d + `M${x} 130V720M${x - 80} 420H${x + 80}M${x - 80} 570H${x + 80}`, C.ink, 3, 0.8);
      }
      L0(g, `M-400 ${GY}L2320 ${GY}`, C.ink, 3, 0.7);
      const D = BTL.drawing(g);
      // stair and rail
      D.f(`M1290 ${GY}L1100 610L1100 650L1250 ${GY}Z`, mix(C.paperLight, C.paperDark, 0.35), 1);
      D.s(`M1290 ${GY}L1100 610M1250 ${GY}L1100 650M1300 ${GY - 120}L1108 520`, { w: 3 });
      let bal = ''; for (let i = 1; i < 6; i++) { const x = 1100 + i * 33, y0 = 610 + i * 45; bal += `M${x} ${y0}L${x} ${y0 - 90}`; }
      D.s(bal, { w: 2, color: C.inkSoft });
      // column, back panel, sounding board
      D.f('M930 610L990 610L1000 880L920 880Z', mix(C.paperLight, C.paperDark, 0.3), 1);
      D.s('M930 610L990 610L1000 880L920 880Z', { w: 3 });
      D.f('M915 240L1005 240L1005 470L915 470Z', mix(C.paperLight, C.paperDark, 0.4), 1);
      D.s('M915 240L1005 240L1005 470L915 470Z', { w: 2.4, color: C.inkSoft });
      D.f('M790 200L1130 200L1100 240L820 240Z', mix(C.paperLight, C.paperDark, 0.25), 1);
      D.s('M790 200L1130 200L1100 240L820 240ZM960 200L960 160M948 160h24', { w: 3 });
      const preacher = gent(g, 960, 640, 400, { face: -1, arm: 'forward' });
      // the pulpit's box in front of him
      const D2 = BTL.drawing(g);
      D2.f('M820 470L1100 470L1080 610L840 610Z', mix(C.paperLight, C.paperDark, 0.2), 1);
      D2.s('M800 470L1120 470M820 470L1100 470L1080 610L840 610Z', { w: 3.4 });
      D2.s('M880 490L880 590M960 490L960 590M1040 490L1040 590', { w: 2, color: C.inkSoft });
      const word = ital(g, P.word || 'günah', 1500, 820, 96, { color: C.gold, font: FR, weight: 300 });
      const ds = motes(g, 47, 24, [300, 150, 1700, 860], { alpha: 0.35 });
      return {
        update(lt, dur, cues) {
          ds.update(lt);
          lights.forEach((l, i) => l.set(0.2 + 0.04 * Math.sin(lt * 0.4 + i)));
          D.reveal(BTL.ease(lt, 0, 2)); D2.reveal(BTL.ease(lt, 0.3, 2));
          const hit = cue(cues, 'hit', dur * 0.6);
          const a = BTL.ease(lt, 0.6, Math.max(2, hit + 0.6)), A = ARMS.forward, B = ARMS.up;
          const e = [lerp(A[0][0], B[0][0], a), lerp(A[0][1], B[0][1], a)], h = [lerp(A[1][0], B[1][0], a), lerp(A[1][1], B[1][1], a)];
          const dd = `M0-760L${f1(e[0])} ${f1(e[1])}L${f1(h[0])} ${f1(h[1])}`;
          preacher.arm.setAttribute('d', dd); preacher.arm.previousSibling.setAttribute('d', dd);
          fade(word, BTL.ease(lt, hit - 0.1, 1.2));
          word.setAttribute('transform', `translate(0 ${f1((1 - BTL.ease(lt, hit - 0.1, 1.6)) * 12)})`);
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_mw_body
  const BODY = 'M930 335L930 372C880 384 820 392 790 420C768 442 762 480 760 520L748 760C746 800 770 812 778 780L800 560L806 860L1114 860L1120 560L1142 780C1150 812 1174 800 1172 760L1160 520C1158 480 1152 442 1130 420C1100 392 1040 384 990 372L990 335';
  function bodyDrawing(g, faint) {
    const D = BTL.drawing(g);
    D.f(BODY + 'Z', C.paperLight, faint ? 0.6 : 0.85);
    D.f(BTL.E(960, 255, 70, 86), C.paperLight, faint ? 0.6 : 0.85);
    D.s(BTL.E(960, 255, 70, 86), { w: 3.5 });
    D.s(BODY, { w: 3.5 });
    return D;
  }
  function inBody(r) {   // a point inside the outline (torso, arms, head)
    const u = r();
    if (u < 0.1) { const a = r() * TAU, k = Math.sqrt(r()); return [960 + Math.cos(a) * 50 * k, 255 + Math.sin(a) * 64 * k]; }
    if (u < 0.22) return [r() < 0.5 ? 772 + r() * 20 : 1128 + r() * 20, 480 + r() * 260];
    return [830 + r() * 260, 420 + r() * 420];
  }
  SH.bt_mw_body = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'breath', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 500, k: 1.5 });
      const pool = BTL.glow(svg, defs, 960, 520, 560, C.stain, 0.2, g);
      const D = bodyDrawing(g, mode === 'immune');
      const r = rng(mode === 'immune' ? 61 : 53), dots = [];
      if (mode === 'breath') {
        D.s('M960 335L960 470M960 470C930 480 912 492 900 510M960 470C990 480 1008 492 1020 510', { w: 2.4, color: C.inkSoft });
        D.s('M940 470C880 452 846 500 840 580C834 660 860 700 900 690C930 680 944 620 944 560Z', { w: 2.4, color: C.inkSoft });
        D.s('M980 470C1040 452 1074 500 1080 580C1086 660 1060 700 1020 690C990 680 976 620 976 560Z', { w: 2.4, color: C.inkSoft });
        for (let i = 0; i < 46; i++) {
          const side = i % 2 ? 1 : -1, lx = 960 + side * (40 + r() * 70), ly = 520 + r() * 150;
          dots.push({ e: P0(g, '', C.ink, 0), s: [380 + r() * 260, 200 + r() * 160], l: [lx, ly], b: inBody(r), d: i * 0.05, d2: i * 0.025, ph: r() * TAU, sz: 3 + r() * 2.5 });
        }
      }
      let halo = null, haloGlow = null, flashes = [];
      if (mode === 'immune') {
        haloGlow = BTL.glow(svg, defs, 960, 520, 480, C.gold, 0, g);
        halo = L0(g, BTL.E(960, 512, 300, 392), C.gold, 3.5, 0.9); stroke(halo, 0);
        for (let i = 0; i < 28; i++) {
          const a = -Math.PI - 0.25 + r() * (Math.PI + 0.5);
          const hx = 960 + Math.cos(a) * 300, hy = 512 + Math.sin(a) * 392;
          dots.push({ e: P0(g, '', C.ink, 0), s: [960 + Math.cos(a) * 980, 512 + Math.sin(a) * 760], h: [hx, hy], d: i * 0.22, sz: 3 + r() * 2.5, fl: P0(g, '', C.gold, 0) });
        }
      }
      return {
        update(lt, dur, cues) {
          pool.set(0.2 + 0.03 * Math.sin(lt * 0.5));
          D.reveal(BTL.ease(lt, 0, 2));
          const hit = cue(cues, 'hit', dur * 0.3), b = cue(cues, 'b', dur * 0.65);
          if (mode === 'breath') {
            for (const q of dots) {
              let x, y, a;
              const t1 = lt - hit - q.d;
              if (t1 < 0) { x = q.s[0] + 14 * Math.sin(lt * 0.4 + q.ph); y = q.s[1] + 10 * Math.cos(lt * 0.33 + q.ph); a = 0.4 * BTL.ease(lt, 0.5, 1.5); }
              else {
                const p1 = BTL.ease(t1, 0, 1.0), p2 = BTL.ease(t1, 0.9, 0.5), p3 = BTL.ease(t1, 1.3, 0.7);
                x = lerp(q.s[0], 960, p1); y = lerp(q.s[1], 305, p1);
                y = lerp(y, 470, p2); x = lerp(x, q.l[0], p3); y = lerp(y, q.l[1], p3);
                const p4 = BTL.ease(lt, b + q.d2, 1.8);
                x = lerp(x, q.b[0], p4); y = lerp(y, q.b[1], p4); a = 0.75;
              }
              q.e.setAttribute('d', BTL.E(x, y, q.sz, q.sz)); q.e.setAttribute('fill-opacity', a.toFixed(3));
            }
          } else {
            const hq = BTL.ease(lt, hit - 0.3, 1.8);
            stroke(halo, hq); haloGlow.set(0.16 * hq + 0.03 * hq * Math.sin(lt * 0.7));
            for (const q of dots) {
              const t = lt - b - q.d, cyc = 2.6, u = t < 0 ? -1 : (t % cyc) / cyc;
              if (u < 0) { q.e.setAttribute('fill-opacity', 0); q.fl.setAttribute('fill-opacity', 0); continue; }
              const p = clamp01(u / 0.7), x = lerp(q.s[0], q.h[0], p), y = lerp(q.s[1], q.h[1], p);
              const out = clamp01((u - 0.7) / 0.3);
              q.e.setAttribute('d', BTL.E(x, y, q.sz, q.sz)); q.e.setAttribute('fill-opacity', (0.7 * Math.min(1, u * 6) * (1 - out)).toFixed(3));
              q.fl.setAttribute('d', BTL.E(q.h[0], q.h[1], 6 + 10 * out, 6 + 10 * out)); q.fl.setAttribute('fill-opacity', (u > 0.68 ? 0.6 * (1 - out) : 0).toFixed(3));
            }
          }
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_mw_routes
  SH.bt_mw_routes = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const cols = portrait ? [[540, 330], [540, 860]] : [[620, 470], [1300, 470]], pw = portrait ? 380 : 440, ph = portrait ? 340 : 440;
      BTL.glow(svg, defs, W / 2, portrait ? 640 : 470, 700, C.stain, 0.1, g);
      const rg = BTL.glow(svg, defs, cols[1][0], cols[1][1] + 40, 360, C.gold, 0, g);
      const r = rng(71), sides = [];
      [[P.left || 'nefes', 120], [P.right || 'deri', 7]].forEach(([word, n], k) => {
        const [cx, cy] = cols[k], x0 = cx - pw / 2, y0 = cy - ph / 2 + 50;
        const box = L0(g, `M${x0 + 30} ${y0}H${x0 + pw - 30}Q${x0 + pw} ${y0} ${x0 + pw} ${y0 + 30}V${y0 + ph - 30}Q${x0 + pw} ${y0 + ph} ${x0 + pw - 30} ${y0 + ph}H${x0 + 30}Q${x0} ${y0 + ph} ${x0} ${y0 + ph - 30}V${y0 + 30}Q${x0} ${y0} ${x0 + 30} ${y0}Z`, C.inkSoft, 2.4, 0.8);
        stroke(box, 0);
        const t = T(g, word, cx, y0 - 40, 84, { weight: 300 });
        const ds = [];
        for (let i = 0; i < n; i++) ds.push({ e: P0(g, '', C.ink, 0), x: x0 + 40 + r() * (pw - 80), y: y0 + 40 + r() * (ph - 80), ph: r() * TAU, sz: k ? 7 : 4 + r() * 2, v: 0.25 + r() * 0.25 });
        sides.push({ box, t, ds });
      });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.6), q = BTL.ease(lt, hit - 0.2, 1.4);
          sides.forEach((s, k) => {
            stroke(s.box, BTL.ease(lt, 0.2 + k * 0.5, 1.4));
            fade(s.t, BTL.ease(lt, 0.4 + k * 0.5, 1.2) * (k ? 1 : 1 - 0.45 * q));
            if (k) { s.box.setAttribute('stroke', q > 0.5 ? C.gold : C.inkSoft); s.t.setAttribute('fill', q > 0.5 ? C.gold : C.ink); }
            s.ds.forEach((d, i) => {
              const x = d.x + 16 * Math.sin(lt * d.v + d.ph), y = d.y + 14 * Math.cos(lt * d.v * 0.8 + d.ph);
              d.e.setAttribute('d', BTL.E(x, y, d.sz, d.sz));
              d.e.setAttribute('fill', k && q > 0.5 ? C.gold : C.ink);
              d.e.setAttribute('fill-opacity', (BTL.ease(lt, 0.8 + k * 0.5 + i * 0.008, 1) * (k ? 0.95 : 0.55 * (1 - 0.4 * q))).toFixed(3));
            });
          });
          rg.set(0.22 * q);
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_mw_ratio
  SH.bt_mw_ratio = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || (P.n > 12 ? 'grid' : 'row'), n = P.n || 8, g = el(svg, 'g'), cg = el(g, 'g'), zg = el(cg, 'g');
      BTL.glow(svg, defs, 960, 500, 720, C.stain, 0.12, zg);
      if (mode === 'grid') { const cid = 'mwrc' + (++ANIUID), cp = el(defs, 'clipPath', { id: cid }); el(cp, 'rect', { x: 0, y: 60, width: W, height: 770 }); cg.setAttribute('clip-path', `url(#${cid})`); }
      const items = [], pick = P.pick ?? (mode === 'grid' ? 26 : 5);
      let ring = null, px = 960, py = 500, ringGlow = null;
      if (mode === 'tally') {
        for (let i = 0; i < n; i++) {
          const x = 960 + (i - (n - 1) / 2) * 120;
          const base = L0(zg, `M${x} 330L${x} 650`, C.inkSoft, 6, 0.9); stroke(base, 0);
          const gold = L0(zg, `M${x} 330L${x} 650`, C.gold, 8, 1); stroke(gold, 0);
          items.push({ base, gold, gl: BTL.glow(svg, defs, x, 490, 120, C.gold, 0, zg) });
        }
      } else {
        const grid = mode === 'grid', cols = grid ? 10 : n, rows = Math.ceil(n / cols), h = grid ? 100 : 300;
        const sx = grid ? 112 : Math.min(170, 1500 / n), y0 = grid ? 300 : 740, sy = grid ? 120 : 0;
        for (let i = 0; i < n; i++) {
          const c = i % cols, rr = Math.floor(i / cols), x = 960 + (c - (cols - 1) / 2) * sx, y = y0 + rr * sy;
          const pg = el(zg, 'g'); BTL.person(pg, 'stand', x, y, h, { face: (i * 7) % 3 ? 1 : -1 });
          items.push({ pg, x, y });
          if (i === pick) { px = x; py = y - h * 0.5; }
        }
        ringGlow = BTL.glow(svg, defs, px, py, grid ? 90 : 220, C.gold, 0, zg);
        ring = L0(zg, BTL.E(px, py, grid ? 46 : 110, grid ? 70 : 190), C.gold, grid ? 2.4 : 3, 0.9); stroke(ring, 0);
      }
      const note = P.note ? ital(g, P.note, 960, mode === 'grid' ? 150 : 230, 50, { color: C.inkSoft }) : null;
      const lab = P.label ? T(g, P.label, 960, mode === 'tally' ? 790 : (mode === 'grid' ? 900 : 880), mode === 'tally' ? 64 : 74, { weight: 300, color: mode === 'tally' ? C.ink : C.gold, font: mode === 'tally' ? LO : FR, italic: mode === 'tally' }) : null;
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5), b = cue(cues, 'b', null);
          if (mode === 'tally') {
            const t0 = Math.min(hit - 0.3, dur * 0.45), step = Math.max(0.12, Math.min(0.35, (dur - 1.2 - t0) / items.length));
            items.forEach((it, i) => {
              stroke(it.base, BTL.ease(lt, 0.1 + i * 0.12, 0.8));
              const q = BTL.ease(lt, t0 + i * step, 0.6);
              stroke(it.gold, q); it.gl.set(0.25 * q);
            });
            if (lab) fade(lab, BTL.ease(lt, 0.5, 1.2));
          } else {
            items.forEach((it, i) => {
              const ap = BTL.ease(lt, 0.1 + (mode === 'grid' ? i * 0.025 : i * 0.14), 0.9);
              const zq = b != null ? BTL.ease(lt, b - 0.2, 2.4) : 0;
              const dim = i === pick ? 1 - 0.82 * BTL.ease(lt, hit, 1.6) : 1 - 0.55 * zq;
              fade(it.pg, ap * dim);
            });
            stroke(ring, BTL.ease(lt, hit + 0.3, 1.4)); ringGlow.set(0.3 * BTL.ease(lt, hit + 0.3, 1.4));
            if (lab) fade(lab, BTL.ease(lt, hit + 0.2, 1.2));
            if (b != null) {
              const z = 1 + 0.5 * BTL.ease(lt, b - 0.2, 3), tx = (960 - px) * BTL.ease(lt, b - 0.2, 3), ty = (480 - py) * BTL.ease(lt, b - 0.2, 3);
              zg.setAttribute('transform', `translate(${f1(px + tx)} ${f1(py + ty)}) scale(${z.toFixed(3)}) translate(${f1(-px)} ${f1(-py)})`);
            }
          }
          if (note) fade(note, BTL.ease(lt, 0.3, 1.2) * (b != null ? 1 - BTL.ease(lt, b - 0.2, 1.2) : 1));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_mw_barn
  function cow(g, x, y, s) {
    const t = el(g, 'g', { transform: `translate(${x} ${y}) scale(${s})` }), col = SIL(), rim = RIM();
    const legs = 'M-110-145L-112 0M-80-145L-78 0M70-145L68 0M100-145L104 0M-140-200C-165-170-165-110-160-60';
    el(t, 'path', { d: legs, fill: 'none', stroke: rim, 'stroke-width': 24, 'stroke-linecap': 'round' });
    el(t, 'path', { d: legs, fill: 'none', stroke: col, 'stroke-width': 18, 'stroke-linecap': 'round' });
    el(t, 'path', { d: 'M-140-200C-150-230-120-250-80-250L90-252C110-262 130-262 140-250L175-232L202-172C204-156 188-150 174-156L140-190C130-170 120-150 108-140L-120-140C-140-150-146-175-140-200Z', fill: col, stroke: rim, 'stroke-width': 3 });
    el(t, 'path', { d: 'M150-246L158-270M164-242L180-262', fill: 'none', stroke: rim, 'stroke-width': 5, 'stroke-linecap': 'round' });
    el(t, 'path', { d: BTL.E(-14, -138, 24, 14), fill: col, stroke: rim, 'stroke-width': 3 });
    return t;
  }
  SH.bt_mw_barn = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 540, k: 1.45 });
      const GY = 800;
      const sun = BTL.glow(svg, defs, 1560, 640, 640, C.stain, 0.36, g);
      const disc = P0(g, '', C.gold, 0.5);
      P0(g, `M-400 ${GY - 40}Q200 ${GY - 120} 700 ${GY - 70}Q1200 ${GY - 140} 1700 ${GY - 60}Q2000 ${GY - 80} 2320 ${GY - 50}L2320 1900L-400 1900Z`, mix(C.paperDark, C.paper, 0.5), 1);
      L0(g, `M-400 ${GY - 40}Q200 ${GY - 120} 700 ${GY - 70}Q1200 ${GY - 140} 1700 ${GY - 60}Q2000 ${GY - 80} 2320 ${GY - 50}`, C.inkSoft, 2, 0.6);
      P0(g, `M-400 ${GY}L2320 ${GY}L2320 1900L-400 1900Z`, floorTone(), 1);
      L0(g, `M-400 ${GY}L2320 ${GY}`, C.ink, 3, 0.8);
      // the barn
      const bx0 = 420, bx1 = 1100, eave = 480, ridge = 280, mid = (bx0 + bx1) / 2, dx0 = 610, dx1 = 910, dtop = 520;
      const D = BTL.drawing(g);
      D.f(`M${bx0} ${GY}L${bx0} ${eave}L${mid} ${ridge}L${bx1} ${eave}L${bx1} ${GY}Z`, mix(C.paperLight, C.paperDark, 0.35), 1);
      D.f(`M${bx0 - 40} ${eave + 14}L${mid} ${ridge - 30}L${bx1 + 40} ${eave + 14}L${bx1 + 40} ${eave - 6}L${mid} ${ridge - 54}L${bx0 - 40} ${eave - 6}Z`, mix(C.paperDark, C.ink, 0.15), 1);
      let bd = ''; for (let x = bx0 + 34; x < bx1; x += 34) { const top = x < mid ? eave - (x - bx0) / (mid - bx0) * (eave - ridge) : eave - (bx1 - x) / (bx1 - mid) * (eave - ridge); if (x < dx0 - 10 || x > dx1 + 10) bd += `M${x} ${f1(top + 6)}L${x} ${GY}`; else bd += `M${x} ${f1(top + 6)}L${x} ${dtop - 10}`; }
      D.s(bd, { w: 1.6, color: C.inkSoft, alpha: 0.5 });
      D.s(`M${bx0} ${GY}L${bx0} ${eave}L${mid} ${ridge}L${bx1} ${eave}L${bx1} ${GY}M${bx0 - 40} ${eave + 14}L${mid} ${ridge - 30}L${bx1 + 40} ${eave + 14}`, { w: 3.4 });
      D.f(`M${mid - 50} 380h100v60h-100z`, mix(C.paperDark, C.ink, 0.05), 1); D.s(`M${mid - 50} 380h100v60h-100zM${mid} 380v60`, { w: 2.6 });
      // the open door: warm lantern light inside, the cow
      P0(g, `M${dx0} ${GY}L${dx0} ${dtop}L${dx1} ${dtop}L${dx1} ${GY}Z`, mix(C.paperDark, C.stain, 0.22), 1);
      const lamp = BTL.glow(svg, defs, 820, 600, 220, C.gold, 0.3, g);
      cow(g, 745, GY - 6, 0.82);
      L0(g, `M${dx0} ${GY}L${dx0} ${dtop}L${dx1} ${dtop}L${dx1} ${GY}`, C.ink, 3.4, 0.9);
      // the swung-open door leaf
      P0(g, `M${dx1} ${GY}L${dx1} ${dtop}L${dx1 + 120} ${dtop + 30}L${dx1 + 120} ${GY + 20}Z`, mix(C.paperLight, C.paperDark, 0.2), 1);
      L0(g, `M${dx1} ${GY}L${dx1} ${dtop}L${dx1 + 120} ${dtop + 30}L${dx1 + 120} ${GY + 20}ZM${dx1} ${dtop + 10}L${dx1 + 120} ${GY}`, C.ink, 2.6, 0.85);
      // a fence, the milkmaid
      L0(g, `M1180 ${GY}L1180 700M1700 ${GY}L1700 700M1180 720L1700 720M1180 760L1700 760`, C.inkSoft, 4, 0.7);
      const maidLight = BTL.glow(svg, defs, 1360, 640, 230, C.gold, 0, g);
      lady(g, 1360, GY + 6, 330, { face: -1, arm: 'pail', pail: true });
      const mist = []; for (let i = 0; i < 4; i++) mist.push(L0(g, '', C.inkSoft, 1.8, 0.35));
      const lab = P.label ? ital(g, P.label, 1500, 230, 54, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2.2));
          const u = BTL.ease(lt, 0, Math.max(5, dur));
          disc.setAttribute('d', BTL.E(1560, 700 - 70 * u, 64, 64)); sun.set(0.32 + 0.1 * u);
          lamp.set(0.3 + 0.04 * Math.sin(lt * 2.1) + 0.02 * Math.sin(lt * 3.3));
          mist.forEach((m, i) => { let d = ''; const y = GY - 14 - i * 16; for (let x = -100; x <= 2020; x += 40) d += (x === -100 ? 'M' : 'L') + x + ' ' + f1(y + 5 * Math.sin(x / 140 + i * 1.7 + lt * 0.3)); m.setAttribute('d', d); m.setAttribute('stroke-dasharray', `${120 + i * 30} ${80 + i * 40}`); m.setAttribute('stroke-dashoffset', f1(-lt * (14 + i * 4))); });
          const hit = cue(cues, 'hit', dur * 0.6);
          maidLight.set(0.34 * BTL.ease(lt, hit - 0.3, 1.6));
          if (lab) fade(lab, BTL.ease(lt, 0.6, 1.4));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_mw_globe
  const CONT = [
    [[-17, 15], [-16, 22], [-10, 30], [-6, 35.8], [10, 37], [11, 33], [20, 31], [32, 31.3], [35, 28], [43, 13], [51, 12], [48, 5], [40, -3], [40, -15], [35, -25], [26, -34], [18, -34], [12, -17], [9, -1], [8, 4], [-8, 4.5], [-17, 15]],
    [[-9.5, 36.5], [-9, 43], [-1.5, 46], [-4.5, 48], [2, 51], [8.5, 54], [10.5, 57.5], [5.5, 59], [5, 62], [14, 67], [25, 71], [42, 67], [60, 70], [80, 73], [105, 77], [140, 72], [180, 68], [170, 60], [160, 54], [142, 52], [135, 43], [127, 38], [122, 40], [121, 31], [111, 21], [106, 10], [100, 13], [97, 17], [91, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 25], [52, 27], [48, 30], [56, 25], [59, 22], [55, 17], [45, 13], [43, 13], [39, 21], [35, 28], [34.5, 31.5], [35.8, 36.5], [28, 36.7], [26.3, 40.1], [23, 40.4], [22.5, 36.5], [19.5, 41], [13.6, 45.5], [12.3, 44.5], [16, 39.5], [15.5, 38], [12.5, 41.5], [8.8, 44.4], [3, 43], [-0.5, 38.5], [-5.5, 36], [-9.5, 36.5]],
    [[-165, 65], [-140, 70], [-110, 72], [-80, 72], [-62, 60], [-56, 50], [-66, 44], [-70, 41.5], [-76, 35], [-81, 25], [-82, 30], [-90, 29], [-97, 26], [-97, 19], [-88, 15], [-80, 8], [-85, 12], [-95, 16], [-106, 23], [-115, 30], [-124, 40], [-125, 50], [-136, 58], [-150, 60], [-165, 65]],
    [[-78, 8], [-61, 10.5], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-72, -50], [-74, -40], [-71, -20], [-81, -5], [-78, 8]],
    [[113, -22], [122, -18], [131, -12], [142, -11], [146, -19], [153, -28], [150, -37], [140, -38], [130, -32], [115, -34], [113, -22]],
  ];
  const inPoly = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
  SH.bt_mw_globe = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'dark', portrait = H > W, g = el(svg, 'g');
      const cx = portrait ? W / 2 : 880, cy = portrait ? 640 : 480, R = portrait ? 380 : 330, lat0 = 18;
      BTL.glow(svg, defs, cx, cy, R * 1.9, C.stain, 0.14, g);
      el(g, 'circle', { cx, cy, r: R, fill: mix(C.paper, C.paperLight, 0.6) });
      const grat = L0(g, '', C.inkSoft, 1.4, 0.35), land = el(g, 'path', { fill: C.paperLight, stroke: C.inkSoft, 'stroke-width': 2.4, 'stroke-linejoin': 'round' });
      const limb = L0(g, BTL.E(cx, cy, R, R), C.ink, 3, 0.9);
      const ringGlow = BTL.glow(svg, defs, cx, cy, R * 1.35, C.gold, 0, g);
      const ring = L0(g, BTL.E(cx, cy, R + 28, R + 28), C.gold, 3.5, 1); stroke(ring, 0);
      // densified coasts
      const polys = CONT.map(poly => { const out = []; for (let i = 0; i < poly.length - 1; i++) { const [a, b] = [poly[i], poly[i + 1]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 3)); for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } return out; });
      // marks on the land, deterministic; the last one sits in East Africa (Somalia, 1977)
      const r = rng(97), marks = [];
      while (marks.length < 150) { const p = [-120 + r() * 270, -35 + r() * 95]; if (CONT.some(c => inPoly(p, c))) marks.push({ p, e: P0(g, '', C.ink, 0), t: r() }); }
      marks.sort((a, b) => a.t - b.t);
      const last = { p: [45.3, 2.0], e: P0(g, '', C.gold, 0), t: 1 }; marks.push(last);
      const proj = (lon, lat, lon0) => { const l = (lon - lon0) * D2R, p = lat * D2R, p0 = lat0 * D2R;
        return [Math.cos(p) * Math.sin(l), -(Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)), Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l)]; };
      const lab = P.label ? ital(g, P.label, portrait ? W / 2 : cx + R + 90, portrait ? cy + R + 120 : cy + 18, 58, { color: C.ink, anchor: portrait ? 'middle' : 'start' }) : null;
      return {
        update(lt, dur, cues) {
          const lon0 = 8 + 3.2 * lt;
          let gd = '';
          for (let lon = -180; lon < 180; lon += 30) { let pen = false; for (let lat = -90; lat <= 90; lat += 6) { const [x, y, z] = proj(lon, lat, lon0); if (z > 0) { gd += (pen ? 'L' : 'M') + f1(cx + x * R) + ' ' + f1(cy + y * R); pen = true; } else pen = false; } }
          for (let lat = -60; lat <= 60; lat += 30) { let pen = false; for (let lon = -180; lon <= 180; lon += 6) { const [x, y, z] = proj(lon, lat, lon0); if (z > 0) { gd += (pen ? 'L' : 'M') + f1(cx + x * R) + ' ' + f1(cy + y * R); pen = true; } else pen = false; } }
          grat.setAttribute('d', gd);
          let ld = '';
          for (const poly of polys) {
            const pts = poly.map(([lo, la]) => { let [x, y, z] = proj(lo, la, lon0); if (z < 0) { const m = Math.hypot(x, y) || 1; x /= m; y /= m; } return [x, y, z]; });
            if (!pts.some(q => q[2] > 0)) continue;
            ld += 'M' + pts.map(q => f1(cx + q[0] * R) + ' ' + f1(cy + q[1] * R)).join('L') + 'Z';
          }
          land.setAttribute('d', ld);
          land.setAttribute('fill-opacity', BTL.ease(lt, 0, 1.2).toFixed(3)); land.setAttribute('stroke-opacity', BTL.ease(lt, 0, 1.2).toFixed(3));
          const hit = cue(cues, 'hit', dur * (mode === 'dark' ? 0.35 : 0.2)), b = cue(cues, 'b', dur * 0.7), N = marks.length - 1;
          marks.forEach((m, i) => {
            const [x, y, z] = proj(m.p[0], m.p[1], lon0);
            let a;
            if (mode === 'dark') {
              const at = i < N * 0.3 ? 0.4 + (i / (N * 0.3)) * Math.max(0.5, hit - 0.4) : hit + ((i - N * 0.3) / (N * 0.7)) * Math.max(1.5, dur - hit - 1);
              a = m === last ? 0.75 * BTL.ease(lt, hit + 0.5, 1) : 0.7 * BTL.ease(lt, at, 0.6);
              if (m === last) m.e.setAttribute('fill', C.ink);
            } else {
              const span = Math.max(1.5, b - hit - 0.6), off = m === last ? b + 0.6 : hit + (i / N) * span;
              a = (m === last ? 1 : 0.7) * (1 - BTL.ease(lt, off, 0.5));
            }
            const vis = z > 0.05 ? 1 : 0, s = m === last ? 7 : 4.5;
            m.e.setAttribute('d', BTL.E(cx + x * R, cy + y * R, s, s));
            m.e.setAttribute('fill-opacity', (a * vis * Math.min(1, z * 4)).toFixed(3));
          });
          if (mode === 'clear') { const q = BTL.ease(lt, b - 0.1, 1.8); stroke(ring, q); ringGlow.set(0.18 * q); }
          if (lab) fade(lab, BTL.ease(lt, 0.6, 1.4));
          limb.setAttribute('stroke-opacity', (0.9 * BTL.ease(lt, 0, 1)).toFixed(3));
        },
      };
    },
  };
})();
