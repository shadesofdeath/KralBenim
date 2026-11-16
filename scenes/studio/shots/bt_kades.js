// bt_kades: the battle of Kadesh (c. 1274 BC, on the Orontes) and the Egyptian-Hittite peace treaty (c. 1259 BC),
// belgesel style (docs/BELGESEL.md). Still line art in the theme's tokens; only slow natural motion (pennants in the
// wind, dust, water, a sinking sun, a glint). Every type is composed on a 1080x1920 vertical canvas (the Short); a wide
// frame shows it as a centred column.
//   bt_kd_kings  P: {mode: "hook"|"hatti"|"peace"}  cues: hit
//                two faceless kings face each other on an empty plain: left the pharaoh (blue khepresh crown, white
//                kilt, a tall pole with streamers), right the Hittite king (skullcap, long robe, the curled lituus staff
//                with a ribbon; tall pointed cap, long braid, fringed mantle, upturned shoes). hook: a broken spear lies
//                between them; on "hit" both streamers turn gold. hatti: the walled city of Kadesh on its mound behind
//                them; on "hit" the pharaoh's side sinks into shade, the Hittite king's light grows, the city is outlined gold. peace: they stand closer and hold one clay tablet
//                between them; on "hit" it glows gold
//   bt_kd_standards cues: hit   the hook/cover: the pharaoh's fan standard and the Hittite lituus crossed over a broken
//                spear in a light pool, streamers blowing; on "hit" (and on the cover) both streamers turn gold
//   bt_kd_wall   P: {mode: "glyphs"|"relief"}  cues: hit
//                a sandstone temple wall in raking light. glyphs: columns of hieroglyphs carve themselves in, on "hit" a
//                cartouche is outlined in gold. relief: a sunk relief of the pharaoh in his chariot drawing a bow behind
//                a galloping horse carves itself in; on "hit" its outline turns gold
//   bt_kd_map    P: {sub}  cues: kadesh, egypt, hatti, hit
//                the Levant: the coast, Cyprus, the Nile delta, the Orontes; Kadesh pulses ("kadesh"), the Egyptian
//                route draws up the coast ("egypt"), the Hittite route down from Anatolia ("hatti"); on "hit" a ring
//                flashes where they meet. Italic sub under Kadesh
//   bt_kd_field  P: {mode: "after"|"river"}  cues: hit
//                after: dusk on the empty battlefield, a broken six-spoked chariot wheel half sunk in the ground, a
//                spear stuck at a slant, dust drifting, far off a small column of chariots heading home (left);
//                on "hit" the low sun sinks into the haze.
//                river: the Orontes today winding to the horizon past the flat mound (tell) of Kadesh, reeds, water
//                lines flowing, the sun going down
//   bt_kd_tablet P: {mode: "write"|"peace"}  cues: hit  (peace: fully written, a broken spear below, every row lights
//                gold on "hit")   one big clay tablet (the Hittite copy of the treaty, a corner broken); cuneiform rows press
//                themselves in one after another, on "hit" three rows light gold; a glint passes slowly
//   bt_kd_museum P: {label, sub}  cues: hit   a museum vitrine under a spotlight: plinth, glass case, the tablet on a
//                small stand inside, dust in the light; on "hit" the label appears below
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const LD = (p, d, stroke, w = 3, a = 1) => { const e = L0(p, d, stroke, w, a, { pathLength: 1 }); draw(e, 0); return e; };
  const SIL = () => mix(C.paper, C.ink, 0.62);
  const CLAY = () => mix(C.paperLight, C.stain, 0.42);
  const STONE = () => mix(C.paperLight, C.stain, 0.22);
  const txt = (g, s, x, y, size, o = {}) => {
    const e = svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || BTL.FR,
      'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}));
    e.setAttribute('text-anchor', o.anchor || 'middle');
    return e;
  };
  let uid = 0;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  function ground(g, y, a = 0.7) {
    P0(g, `M-300 ${y}L1380 ${y}L1380 2100L-300 2100Z`, C.paperDark, a);
    L0(g, `M-300 ${y}L1380 ${y}`, C.inkSoft, 2, 0.45);
    L0(g, `M-300 ${y + 140}L1380 ${y + 140}M-300 ${y + 380}L1380 ${y + 380}`, C.inkSoft, 1.5, 0.12);
  }
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.ink, 0), x: r(), y: r(), s: (o.size || 2.4) * (0.7 + r() * 0.9), v: 0.015 + r() * 0.025, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.y + q.v * lt + 10) % 1, y = o.up ? box[3] - u * h : box[1] + u * h, x = box[0] + q.x * w + (o.drift || 16) * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.4) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  // a cloth streamer from (x, y), blowing towards dir (+1 right / -1 left), waving slowly
  function streamer(g, x, y, dir, L, wd, o = {}) {
    const e = P0(g, '', o.color || SIL(), 1, { stroke: C.ink, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
    const ph = o.ph || 0;
    return { e, update(lt) {
      const N = 10, top = [], bot = [];
      for (let i = 0; i <= N; i++) {
        const s = i / N, px = x + dir * L * s, wave = 22 * s * Math.sin(s * 5.2 - lt * 2.1 + ph) + 30 * s * s, hw = wd * (1 - 0.75 * s) / 2;
        top.push([px, y + wave - hw + wd / 2]); bot.push([px, y + wave + hw + wd / 2]);
      }
      e.setAttribute('d', 'M' + top.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'L' + bot.reverse().map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z');
    } };
  }

  // ------------------------------------------------------------------ clay tablet (origin = centre)
  function tabletPath(w, h, chip = 0) {
    const x = w / 2, y = h / 2, c = Math.min(w, h) * 0.14;
    return `M${-x + c} ${-y}L${x - c - chip} ${-y}${chip ? `L${f1(x - c * 0.3)} ${f1(-y + chip * 0.7)}L${x} ${f1(-y + c + chip)}` : `Q${x} ${-y} ${x} ${-y + c}`}` +
      `L${x} ${y - c}Q${x} ${y} ${x - c} ${y}L${-x + c} ${y}Q${-x} ${y} ${-x} ${y - c}L${-x} ${-y + c}Q${-x} ${-y} ${-x + c} ${-y}Z`;
  }
  function wedges(seed, x0, x1, y0, rows, rowH, size) {
    const r = rng(seed), out = [];
    for (let i = 0; i < rows; i++) {
      let d = '', x = x0 + r() * 8; const y = y0 + i * rowH + rowH * 0.5, end = x1 - r() * 24;
      while (x < end) {
        const k = r(), s = size * (0.75 + r() * 0.5);
        if (k < 0.5) d += `M${f1(x)} ${f1(y - s * 0.45)}l${f1(s * 0.5)} ${f1(s * 0.45)}l${f1(-s * 0.5)} ${f1(s * 0.45)}Z M${f1(x + s * 0.45)} ${f1(y)}l${f1(s * 1.0)} 0 `;
        else if (k < 0.82) d += `M${f1(x)} ${f1(y - s * 0.6)}l${f1(s * 0.5)} 0l${f1(-s * 0.25)} ${f1(s * 0.42)}Z M${f1(x + s * 0.25)} ${f1(y - s * 0.2)}l0 ${f1(s * 0.85)} `;
        else d += `M${f1(x)} ${f1(y - s * 0.4)}l${f1(s * 0.55)} ${f1(s * 0.4)}l${f1(-s * 0.55)} ${f1(s * 0.4)}Z `;
        x += s * (k < 0.5 ? 1.8 : 1.05) + r() * s * 0.5;
        if (r() < 0.08) x += s * 1.1;
      }
      out.push(d);
    }
    return out;
  }
  // a whole tablet: returns {g, rows: [{base, gold}], d}
  function tablet(parent, cx, cy, TW, TH, o = {}) {
    const T = el(parent, 'g', { transform: `translate(${cx} ${cy}) rotate(${o.rot ?? -2})` });
    const d = tabletPath(TW, TH, TW * 0.12);
    P0(T, `M${-TW / 2 + 16} ${TH / 2 + 22}L${TW / 2 + 12} ${TH / 2 + 22}L${TW / 2 - 6} ${TH / 2 - 8}L${-TW / 2 + 8} ${TH / 2 - 8}Z`, C.ink, 0.12);
    P0(T, d, CLAY(), 1);
    // the broken corner: a rough break surface
    L0(T, `M${f1(TW / 2 - TW * 0.26)} ${-TH / 2 + 4}L${f1(TW / 2 - TW * 0.18)} ${f1(-TH / 2 + TW * 0.06)}L${f1(TW / 2 - TW * 0.1)} ${f1(-TH / 2 + TW * 0.1)}L${TW / 2 - 4} ${f1(-TH / 2 + TW * 0.24)}`, C.inkSoft, 2, 0.7);
    const rows = o.rows || 12, pad = TW * 0.07, rowH = (TH - pad * 2) / rows;
    let rl = ''; for (let i = 1; i < rows; i++) rl += `M${f1(-TW / 2 + pad)} ${f1(-TH / 2 + pad + i * rowH)}L${f1(TW / 2 - pad)} ${f1(-TH / 2 + pad + i * rowH)}`;
    L0(T, rl, C.inkSoft, Math.max(1, TW / 500), 0.4);
    const W0 = wedges(o.seed || 1259, -TW / 2 + pad + 6, TW / 2 - pad - 6, -TH / 2 + pad, rows, rowH, rowH * 0.52);
    const sw = Math.max(1.2, TW / 300);
    const R = W0.map(rd => ({
      base: L0(T, rd, C.inkSoft, sw, 0, { fill: C.inkSoft, 'fill-opacity': 0 }),
      gold: L0(T, rd, C.gold, sw * 1.4, 0, { fill: C.gold, 'fill-opacity': 0 }),
    }));
    L0(T, d, C.ink, Math.max(2, TW / 180), 1);
    return { g: T, rows: R, d, TW, TH };
  }
  function rowsSet(R, written, gold) {   // written: 0..rows (fractional), gold: per-row 0..1 function
    R.forEach((r, i) => {
      const a = clamp01(written - i), gd = gold ? gold(i) : 0;
      r.base.setAttribute('stroke-opacity', (0.85 * a * (1 - gd)).toFixed(3)); r.base.setAttribute('fill-opacity', (0.6 * a * (1 - gd)).toFixed(3));
      r.gold.setAttribute('stroke-opacity', (gd * a).toFixed(3)); r.gold.setAttribute('fill-opacity', (0.85 * gd * a).toFixed(3));
    });
  }

  // ------------------------------------------------------------------ the two kings (feet at FY, height h)
  function pharaoh(g, x, FY, h, fc) {
    BTL.person(g, 'stand', x, FY, h, { face: fc, color: SIL(), rim: C.ink });
    const X = v => f1(x + v * h * fc), Y = v => f1(FY + v * h);
    // white linen kilt with a front panel
    const kilt = `M${X(-0.085)} ${Y(-0.5)}L${X(0.085)} ${Y(-0.5)}L${X(0.13)} ${Y(-0.3)}L${X(-0.11)} ${Y(-0.31)}Z`;
    P0(g, kilt, C.paperLight, 1); L0(g, kilt, C.ink, 2.5);
    L0(g, `M${X(0.02)} ${Y(-0.49)}L${X(0.05)} ${Y(-0.31)}`, C.inkSoft, 2);
    P0(g, `M${X(-0.09)} ${Y(-0.52)}L${X(0.09)} ${Y(-0.52)}L${X(0.09)} ${Y(-0.49)}L${X(-0.09)} ${Y(-0.49)}Z`, C.gold, 0.9);
    // broad collar
    L0(g, `M${X(-0.07)} ${Y(-0.79)}C${X(-0.05)} ${Y(-0.74)} ${X(0.05)} ${Y(-0.74)} ${X(0.07)} ${Y(-0.79)}`, C.gold, 0.02 * h, 0.9);
    // the blue crown (khepresh), uraeus at the front
    const hy = -0.9, cr = `M${X(-0.083)} ${Y(hy + 0.03)}C${X(-0.11)} ${Y(hy - 0.08)} ${X(-0.08)} ${Y(hy - 0.2)} ${X(-0.01)} ${Y(hy - 0.205)}C${X(0.06)} ${Y(hy - 0.205)} ${X(0.1)} ${Y(hy - 0.12)} ${X(0.085)} ${Y(hy + 0.01)}C${X(0.04)} ${Y(hy - 0.01)} ${X(-0.03)} ${Y(hy)} ${X(-0.083)} ${Y(hy + 0.03)}Z`;
    P0(g, cr, C.blue, 1); L0(g, cr, C.ink, 2.5);
    let dots = ''; for (let i = 0; i < 9; i++) { const u = (i % 3) * 0.045 - 0.04, v = hy - 0.05 - Math.floor(i / 3) * 0.045; dots += BTL.E(+X(u), +Y(v), 0.006 * h, 0.006 * h); }
    P0(g, dots, C.paperLight, 0.55);
    L0(g, `M${X(0.085)} ${Y(hy - 0.005)}C${X(0.11)} ${Y(hy - 0.03)} ${X(0.11)} ${Y(hy - 0.06)} ${X(0.09)} ${Y(hy - 0.07)}`, C.gold, 0.012 * h);
    // the tall pole in the back hand
    const px = x - 0.13 * h * fc;
    L0(g, `M${f1(px)} ${Y(0.01)}L${f1(px)} ${Y(-1.22)}`, C.ink, 0.016 * h);
    P0(g, BTL.E(px, FY - 1.23 * h, 0.018 * h, 0.018 * h), C.gold, 1);
    return { top: [px, FY - 1.2 * h], hand: [x + 0.12 * h * fc, FY - 0.44 * h] };
  }
  function hittite(g, x, FY, h, fc) {
    const X = v => f1(x + v * h * fc), Y = v => f1(FY + v * h);
    // the long braid down the back (drawn first, behind the body)
    let br = `M${X(-0.06)} ${Y(-0.9)}C${X(-0.12)} ${Y(-0.82)} ${X(-0.12)} ${Y(-0.7)} ${X(-0.1)} ${Y(-0.56)}`;
    L0(g, br, C.ink, 0.034 * h); L0(g, br, SIL(), 0.022 * h);
    let bk = ''; for (let i = 0; i < 6; i++) { const v = -0.86 + i * 0.05; bk += `M${X(-0.118)} ${Y(v)}l${f1(0.03 * h * fc)} ${f1(0.012 * h)}`; }
    L0(g, bk, C.ink, 2, 0.7);
    P0(g, BTL.E(+X(-0.1), +Y(-0.545), 0.016 * h, 0.022 * h), C.gold, 1);
    BTL.person(g, 'stand', x, FY, h, { face: fc, color: SIL(), rim: C.ink });
    // long robe flaring to the ankles, a mantle wrapped across it (fringed edge), a belt
    const robe = `M${X(-0.07)} ${Y(-0.78)}L${X(0.07)} ${Y(-0.78)}C${X(0.1)} ${Y(-0.5)} ${X(0.14)} ${Y(-0.25)} ${X(0.19)} ${Y(-0.04)}L${X(-0.15)} ${Y(-0.04)}C${X(-0.12)} ${Y(-0.25)} ${X(-0.1)} ${Y(-0.5)} ${X(-0.07)} ${Y(-0.78)}Z`;
    const RB = mix(C.paperDark, C.ink, 0.3);
    P0(g, robe, RB, 1); L0(g, robe, C.ink, 2.5);
    const mantle = `M${X(0.07)} ${Y(-0.77)}C${X(0.0)} ${Y(-0.6)} ${X(-0.08)} ${Y(-0.38)} ${X(-0.14)} ${Y(-0.1)}L${X(-0.15)} ${Y(-0.04)}L${X(-0.07)} ${Y(-0.78)}Z`;
    P0(g, mantle, mix(RB, C.ink, 0.25), 1);
    L0(g, `M${X(0.07)} ${Y(-0.77)}C${X(0.0)} ${Y(-0.6)} ${X(-0.08)} ${Y(-0.38)} ${X(-0.14)} ${Y(-0.1)}`, C.gold, 0.012 * h, 0.9);
    let fr = ''; for (let i = 1; i < 9; i++) { const t = i / 9, xx = 0.07 - 0.21 * t, yy = -0.77 + 0.67 * t; fr += `M${X(xx)} ${Y(yy)}l${f1(0.022 * h * fc)} ${f1(0.006 * h)}`; }
    L0(g, fr, C.gold, 2, 0.8);
    L0(g, `M${X(-0.095)} ${Y(-0.5)}L${X(0.1)} ${Y(-0.5)}`, C.ink, 0.012 * h, 0.8);
    // shoes with upturned toes
    L0(g, `M${X(0.02)} ${Y(-0.005)}L${X(0.11)} ${Y(-0.005)}C${X(0.13)} ${Y(-0.01)} ${X(0.14)} ${Y(-0.03)} ${X(0.135)} ${Y(-0.05)}M${X(-0.1)} ${Y(-0.005)}L${X(-0.01)} ${Y(-0.005)}`, C.ink, 0.02 * h);
    // tall pointed cap, its tip bent slightly forward
    const hy = -0.9, cap = `M${X(-0.082)} ${Y(hy + 0.005)}C${X(-0.07)} ${Y(hy - 0.12)} ${X(-0.02)} ${Y(hy - 0.24)} ${X(0.05)} ${Y(hy - 0.27)}C${X(0.04)} ${Y(hy - 0.18)} ${X(0.08)} ${Y(hy - 0.08)} ${X(0.083)} ${Y(hy + 0.005)}Z`;
    P0(g, cap, mix(C.ink, C.paperDark, 0.25), 1); L0(g, cap, C.ink, 2.5);
    L0(g, `M${X(-0.08)} ${Y(hy - 0.015)}L${X(0.082)} ${Y(hy - 0.015)}`, C.gold, 0.012 * h, 0.9);
    // the lituus (curled staff) in the back hand
    const px = x - 0.15 * h * fc, ty = FY - 1.08 * h, r0 = 0.06 * h;
    const lit = `M${f1(px)} ${Y(0.01)}L${f1(px)} ${f1(ty)}C${f1(px)} ${f1(ty - r0 * 1.4)} ${f1(px - fc * r0 * 1.8)} ${f1(ty - r0 * 1.6)} ${f1(px - fc * r0 * 1.9)} ${f1(ty - r0 * 0.6)}C${f1(px - fc * r0 * 1.9)} ${f1(ty + r0 * 0.1)} ${f1(px - fc * r0 * 1.1)} ${f1(ty + r0 * 0.2)} ${f1(px - fc * r0 * 1.0)} ${f1(ty - r0 * 0.4)}`;
    L0(g, lit, C.ink, 0.016 * h);
    return { top: [px - fc * r0 * 0.3, ty - r0 * 1.2], hand: [x + 0.12 * h * fc, FY - 0.44 * h] };
  }
  // the walled city of Kadesh on its mound (centre x, ground y, scale)
  function fortress(g, cx, gy, k = 1) {
    const X = v => f1(cx + v * k), Y = v => f1(gy + v * k);
    const mound = `M${X(-260)} ${Y(0)}C${X(-200)} ${Y(-30)} ${X(-170)} ${Y(-70)} ${X(-150)} ${Y(-80)}L${X(150)} ${Y(-80)}C${X(170)} ${Y(-70)} ${X(200)} ${Y(-30)} ${X(260)} ${Y(0)}Z`;
    let wall = `M${X(-140)} ${Y(-80)}L${X(-140)} ${Y(-170)}`;
    for (let i = 0; i < 7; i++) { const a = -140 + i * 40; wall += `L${X(a)} ${Y(-180)}L${X(a + 14)} ${Y(-180)}L${X(a + 14)} ${Y(-170)}L${X(a + 26)} ${Y(-170)}L${X(a + 26)} ${Y(-180)}L${X(a + 40)} ${Y(-180)}`; }
    wall += `L${X(140)} ${Y(-80)}`;
    const towers = [-150, -20, 130].map(a => `M${X(a)} ${Y(-80)}L${X(a)} ${Y(-215)}L${X(a + 10)} ${Y(-215)}L${X(a + 10)} ${Y(-205)}L${X(a + 20)} ${Y(-205)}L${X(a + 20)} ${Y(-215)}L${X(a + 30)} ${Y(-215)}L${X(a + 30)} ${Y(-80)}Z`).join('');
    P0(g, mound, mix(C.paperDark, C.ink, 0.12), 1); L0(g, mound, C.inkSoft, 2.5, 0.8);
    P0(g, wall + 'Z', C.paperLight, 1); P0(g, towers, C.paperLight, 1);
    L0(g, wall, C.ink, 3); L0(g, towers, C.ink, 3);
    P0(g, `M${X(-14)} ${Y(-80)}L${X(-14)} ${Y(-120)}C${X(-14)} ${Y(-136)} ${X(14)} ${Y(-136)} ${X(14)} ${Y(-120)}L${X(14)} ${Y(-80)}Z`, C.ink, 0.8);
    return LD(g, mound + wall + towers, C.gold, 4 * k, 1);
  }

  SH.bt_kd_kings = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), mode = P.mode || 'hook', FY = 1150;
      const close = mode === 'peace', h = mode === 'hook' ? 610 : 520;
      const xl = close ? 350 : (mode === 'hook' ? 270 : 280), xr = close ? 730 : (mode === 'hook' ? 810 : 800);
      const poolL = BTL.glow(svg, defs, xl, FY - 0.62 * h, 420, C.stain, 0.32, g);
      const poolR = BTL.glow(svg, defs, xr, FY - 0.62 * h, 420, C.stain, 0.32, g);
      // far horizon: a low line of hills
      const hills = `M-300 ${FY - 110}C0 ${FY - 150} 260 ${FY - 120} 540 ${FY - 140}C800 ${FY - 158} 1040 ${FY - 120} 1380 ${FY - 136}L1380 ${FY}L-300 ${FY}Z`;
      P0(g, hills, C.paperDark, 0.45); L0(g, hills.slice(0, hills.indexOf('L1380')), C.inkSoft, 2, 0.45);
      const fortGold = mode === 'hatti' ? fortress(g, 620, FY - 100, 1.15) : null;
      ground(g, FY, 0.75);
      P0(g, BTL.E(xl, FY + 6, 120, 14) + BTL.E(xr, FY + 6, 120, 14), C.ink, 0.14);
      if (mode === 'hook') {   // the broken spear between them
        L0(g, `M380 ${FY + 70}L560 ${FY + 40}M600 ${FY + 58}L740 ${FY + 96}`, C.ink, 8);
        P0(g, `M740 ${FY + 96}L792 ${FY + 106}L746 ${FY + 82}Z`, C.ink, 1);
        L0(g, `M556 ${FY + 36}L568 ${FY + 48}L560 ${FY + 40}M602 ${FY + 52}L594 ${FY + 64}`, C.ink, 4);
      }
      const A = pharaoh(g, xl, FY, h, 1), B = hittite(g, xr, FY, h, -1);
      const sA = streamer(g, A.top[0], A.top[1], -1, 150, 40, { ph: 0 });
      const sA2 = streamer(g, A.top[0], A.top[1] + 46, -1, 120, 30, { ph: 1.3 });
      const sB = streamer(g, B.top[0], B.top[1], 1, 170, 32, { ph: 2.1 });
      // tablets: hatti in the Hittite king's front hand; peace between their front hands
      let tab = null;
      if (mode === 'peace') tab = tablet(g, 540, FY - 0.45 * h, 200, 170, { rows: 6, rot: 0, seed: 1259 });
      const tglow = tab ? BTL.glow(svg, defs, 540, FY - 0.45 * h, 240, C.gold, 0, g) : null;
      if (tab) g.appendChild(tab.g);
      const shade = mode === 'hatti' ? BTL.glow(svg, defs, xl, FY - 0.5 * h, 520, C.paper, 0, g) : null;
      const ds = motes(g, 1274, 34, [60, 560, 1020, FY + 200], { alpha: 0.35, size: 2.6, drift: 30 });
      const gust = [];   // hook: low dust blowing across the plain
      if (mode === 'hook') { const r = rng(88); for (let i = 0; i < 9; i++) gust.push({ e: L0(g, '', C.inkSoft, 6 + r() * 10, 0), y: FY + 30 + r() * 260, x: r() * 1400, w: 160 + r() * 260, v: 160 + r() * 140 }); }
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), n = BTL.ease(lt, at - 0.15, 1.2);
          const sp = mode === 'hook' ? 1.7 : 1;
          for (const s of [sA, sA2, sB]) s.update(lt * sp);
          const pul = 0.03 * Math.sin(lt * 1.1);
          if (mode === 'hook') {
            const gc = mix(SIL(), C.gold, n);
            for (const s of [sA, sA2, sB]) s.e.setAttribute('fill', gc);
            poolL.set(0.32 + 0.14 * n + pul); poolR.set(0.32 + 0.14 * n - pul);
          } else if (mode === 'hatti') {
            shade.set(0.95 * n);
            poolL.set(0.32 * (1 - n) + pul); poolR.set(0.32 + 0.2 * n - pul);
            draw(fortGold, n);
            sB.e.setAttribute('fill', mix(SIL(), C.gold, 0.6 * n));
          } else {
            rowsSet(tab.rows, 6, i => BTL.ease(lt, at - 0.2 + i * 0.12, 0.5));
            tglow.set(0.55 * n + 0.08 * n * Math.sin(lt * 2));
            poolL.set(0.3 + pul); poolR.set(0.3 - pul);
          }
          ds.update(lt * 6 * sp);
          for (const q of gust) { const x = ((q.x + lt * q.v) % 1500) - 300, u = clamp01((x + 300) / 1500);
            q.e.setAttribute('d', `M${f1(x)} ${f1(q.y)}c${f1(q.w * 0.3)} -10 ${f1(q.w * 0.7)} -10 ${f1(q.w)} 0`); q.e.setAttribute('stroke-opacity', (0.28 * Math.sin(Math.PI * u)).toFixed(3)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ hieroglyphs (origin = glyph centre, size s)
  const GLYPH = [
    s => [BTL.E(0, 0, s * 0.36, s * 0.36) + BTL.E(0, 0, s * 0.07, s * 0.07)],                                // sun
    s => { let d = `M${-s * 0.45} 0`; for (let i = 0; i < 8; i++) d += `L${f1(-s * 0.45 + (i + 0.5) * s * 0.1125)} ${i % 2 ? 0 : -s * 0.1}`; return [d + `L${s * 0.45} 0`, `M${-s * 0.45} ${s * 0.22}L${s * 0.45} ${s * 0.22}`]; },   // water
    s => [`M0 ${s * 0.45}C${-s * 0.2} ${s * 0.1} ${-s * 0.18} ${-s * 0.25} 0 ${-s * 0.45}C${s * 0.18} ${-s * 0.25} ${s * 0.2} ${s * 0.1} 0 ${s * 0.45}Z`, `M0 ${s * 0.4}L0 ${-s * 0.3}`],   // reed leaf
    s => [`M${-s * 0.42} ${s * 0.3}C${-s * 0.2} ${s * 0.1} ${-s * 0.05} ${-s * 0.15} ${s * 0.1} ${-s * 0.2}C${s * 0.12} ${-s * 0.38} ${s * 0.32} ${-s * 0.4} ${s * 0.34} ${-s * 0.24}L${s * 0.44} ${-s * 0.2}L${s * 0.32} ${-s * 0.14}C${s * 0.34} ${s * 0.1} ${s * 0.2} ${s * 0.28} 0 ${s * 0.3}Z`, `M${s * 0.02} ${s * 0.3}L${-s * 0.02} ${s * 0.46}M${s * 0.14} ${s * 0.28}L${s * 0.14} ${s * 0.46}`],   // bird
    s => [`M${-s * 0.44} 0C${-s * 0.2} ${-s * 0.26} ${s * 0.2} ${-s * 0.26} ${s * 0.44} 0C${s * 0.2} ${s * 0.18} ${-s * 0.2} ${s * 0.18} ${-s * 0.44} 0Z`, BTL.E(0, -s * 0.02, s * 0.1, s * 0.1), `M${-s * 0.1} ${s * 0.14}L${-s * 0.18} ${s * 0.4}M${s * 0.06} ${s * 0.14}C${s * 0.1} ${s * 0.3} ${s * 0.24} ${s * 0.34} ${s * 0.3} ${s * 0.24}`],   // eye
    s => [`M0 ${-s * 0.06}C${-s * 0.22} ${-s * 0.2} ${-s * 0.16} ${-s * 0.48} 0 ${-s * 0.48}C${s * 0.16} ${-s * 0.48} ${s * 0.22} ${-s * 0.2} 0 ${-s * 0.06}Z`, `M${-s * 0.3} ${-s * 0.04}L${s * 0.3} ${-s * 0.04}M0 ${-s * 0.06}L0 ${s * 0.46}`],   // ankh
    s => [`M${-s * 0.4} ${s * 0.12}C${-s * 0.4} ${-s * 0.24} ${s * 0.4} ${-s * 0.24} ${s * 0.4} ${s * 0.12}Z`],   // bread loaf
    s => [`M${-s * 0.4} 0C${-s * 0.2} ${-s * 0.18} ${s * 0.2} ${-s * 0.18} ${s * 0.4} 0C${s * 0.2} ${s * 0.18} ${-s * 0.2} ${s * 0.18} ${-s * 0.4} 0Z`],   // mouth
    s => [`M${-s * 0.06} ${s * 0.46}L${-s * 0.06} ${-s * 0.2}C${-s * 0.06} ${-s * 0.42} ${s * 0.3} ${-s * 0.42} ${s * 0.3} ${-s * 0.24}`, `M${-s * 0.2} ${s * 0.46}L${s * 0.1} ${s * 0.46}`],   // was-like staff
  ];
  function wallBase(g, svg, defs) {
    P0(g, 'M-300-300L1380-300L1380 2200L-300 2200Z', STONE(), 1);
    // block courses (staggered joints)
    let j = ''; const r = rng(31);
    for (let y = 120, i = 0; y < 2000; y += 190, i++) {
      j += `M-300 ${y}L1380 ${y}`;
      for (let x = (i % 2 ? -120 : 40) + r() * 40; x < 1300; x += 300 + r() * 90) j += `M${f1(x)} ${y}L${f1(x)} ${y + 190}`;
    }
    L0(g, j, C.inkSoft, 2, 0.35);
    // weathering pits
    let pits = ''; for (let i = 0; i < 60; i++) { const x = r() * 1080, y = 100 + r() * 1700, s = 2 + r() * 5; pits += BTL.E(x, y, s, s * 0.8); }
    P0(g, pits, C.inkSoft, 0.18);
    return BTL.glow(svg, defs, 250, 380, 900, C.paperLight, 0.5, g);
  }

  SH.bt_kd_wall = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), mode = P.mode || 'glyphs';
      const rake = wallBase(g, svg, defs);
      const ds = motes(g, 9, 30, [80, 200, 1000, 1150], { alpha: 0.3, size: 2.4 });
      const carve = (parent, d, w) => {   // sunk relief: a dark cut with a light lip below-right
        const lip = L0(parent, d, C.paperLight, w + 2, 0, { transform: 'translate(3 3)' });
        const cut = LD(parent, d, C.ink, w, 0.85);
        return { lip, cut };
      };
      if (mode === 'relief') {
        const R = el(g, 'g', { transform: 'translate(470 780) scale(1.15)' });
        const items = [];
        // the horse, galloping right, forelegs stretched out
        const horse = 'M-20-10C20-40 160-44 230-30C270-70 300-150 330-200C345-222 372-228 390-214L404-232L402-206C430-190 452-160 462-138C466-126 456-118 444-122C420-140 392-150 372-150C340-110 310-60 290-20C300-6 300 10 290 20L360-10L400-40L410-30L372 6L300 40C240 52 140 54 80 46L60 120L30 170L18 168L44 118L30 60C0 50-24 30-20-10Z';
        const tail = 'M-20-6C-70-10-100 30-110 80M-24 4C-64 10-84 50-88 96';
        const mane = 'M300-150C290-120 270-80 250-50M326-190C312-150 292-110 270-76M350-208C336-176 316-140 296-110';
        const legs2 = 'M290 30L350 44L392 22M50 50L22 112L-10 150';
        const plume = 'M384-222C382-262 398-292 426-302';
        // chariot: box and six-spoked wheel behind the horse
        const wheel = BTL.E(-150, 120, 92, 92), hub = BTL.E(-150, 120, 14, 14);
        let spokes = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; spokes += `M${f1(-150 + Math.cos(a) * 14)} ${f1(120 + Math.sin(a) * 14)}L${f1(-150 + Math.cos(a) * 90)} ${f1(120 + Math.sin(a) * 90)}`; }
        const box = 'M-250 40L-250-60C-210-70-110-70-60-40L-60 40Z', pole = 'M-60 20C40 26 160 20 280 0';
        // the pharaoh standing in the chariot, drawing a bow
        const k = 1, bx = -170;
        const body = `M${bx} -60L${bx - 6} -200M${bx - 6} -200L${bx + 70} -230L${bx + 150} -232M${bx - 6} -196L${bx + 40} -170L${bx + 70} -210`;
        const head = BTL.E(bx - 4, -250, 26, 30);
        const crown = `M${bx - 30} -246C${bx - 40} -290 ${bx - 20} -320 ${bx + 6} -322C${bx + 34} -322 ${bx + 42} -290 ${bx + 26} -252Z`;
        const bow = `M${bx + 150} -360C${bx + 200} -300 ${bx + 200} -160 ${bx + 150} -100`, string = `M${bx + 150} -360L${bx + 70} -230L${bx + 150} -100`;
        const arrow = `M${bx + 70} -230L${bx + 300} -236M${bx + 286} -246L${bx + 300} -236L${bx + 286} -226`;
        const kilt = `M${bx + 4} -60L${bx - 16} -120L${bx + 24} -120Z`;
        P0(R, horse, mix(STONE(), C.ink, 0.1), 1); P0(R, box, mix(STONE(), C.ink, 0.1), 1); P0(R, crown, C.blue, 0.55);
        const parts = [[horse, 5], [tail, 4], [mane, 3], [legs2, 4], [plume, 4], [wheel, 5], [hub, 4], [spokes, 3.5], [box, 5], [pole, 4], [body, 9], [head, 4], [crown, 4], [kilt, 4], [bow, 5], [string, 2], [arrow, 3.5]];
        for (const [d, w] of parts) items.push(carve(R, d, w));
        const goldD = [horse, wheel, box, crown, bow].join('');
        const gold = LD(R, goldD, C.gold, 5, 1);
        return {
          update(lt, dur, cues) {
            const at = cue(cues, 'hit', dur * 0.55), n = items.length;
            items.forEach((it, i) => { const p = BTL.ease(lt, 0.1 + i * Math.min(0.16, at * 0.7 / n), 0.9); draw(it.cut, p); it.lip.setAttribute('stroke-opacity', (0.7 * p).toFixed(3)); });
            draw(gold, BTL.ease(lt, at - 0.1, 1.6));
            rake.set(0.5 + 0.06 * Math.sin(lt * 0.7));
            ds.update(lt * 5);
          },
        };
      }
      // glyph columns with a cartouche in the middle column
      const cols = [250, 540, 830], S = 120, items = [], r = rng(1274);
      L0(g, 'M395 180L395 1120M685 180L685 1120', C.inkSoft, 3, 0.6);
      let gold = null;
      cols.forEach((cx, ci) => {
        let y = 250;
        while (y < 1090) {
          if (ci === 1 && y > 480 && !gold) {   // cartouche
            const ch = 360, cd = `M${cx - 80} ${y + 50}C${cx - 80} ${y - 10} ${cx + 80} ${y - 10} ${cx + 80} ${y + 50}L${cx + 80} ${y + ch - 50}C${cx + 80} ${y + ch + 10} ${cx - 80} ${y + ch + 10} ${cx - 80} ${y + ch - 50}Z`;
            items.push(carve(g, cd + `M${cx - 60} ${y + ch + 24}L${cx + 60} ${y + ch + 24}`, 5));
            for (const [gi, gy] of [[0, y + 70], [3, y + 180], [8, y + 290]]) {
              const gg = el(g, 'g', { transform: `translate(${cx} ${gy})` });
              for (const d of GLYPH[gi](S * 0.8)) items.push(carve(gg, d, 4));
            }
            gold = LD(g, cd, C.gold, 7, 1);
            y += ch + 80;
            continue;
          }
          const gi = Math.floor(r() * GLYPH.length);
          const gg = el(g, 'g', { transform: `translate(${cx} ${y + S / 2})` });
          for (const d of GLYPH[gi](S)) items.push(carve(gg, d, 4.5));
          y += S + 30;
        }
      });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), n = items.length, span = Math.max(1, at - 0.3);
          items.forEach((it, i) => { const p = BTL.ease(lt, i / n * span, 0.6); draw(it.cut, p); it.lip.setAttribute('stroke-opacity', (0.7 * p).toFixed(3)); });
          draw(gold, BTL.ease(lt, at - 0.1, 1.4));
          rake.set(0.5 + 0.06 * Math.sin(lt * 0.7));
          ds.update(lt * 5);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the Levant map (close: Cyprus to the Orontes)
  const COAST = [[29.0, 36.5], [30.6, 36.85], [31.6, 36.6], [32.6, 36.1], [33.6, 36.2], [34.6, 36.8], [35.5, 36.6], [35.9, 36.95], [36.2, 36.6],
    [35.95, 36.0], [35.8, 35.5], [35.9, 35.2], [35.6, 34.5], [35.5, 34.0], [35.2, 33.3], [35.05, 32.85], [34.9, 32.4], [34.6, 31.7], [34.25, 31.3],
    [33.3, 31.1], [32.3, 31.25], [31.0, 31.5]];
  const CYPRUS = [[32.27, 35.05], [32.55, 35.17], [32.95, 35.38], [33.6, 35.36], [34.08, 35.47], [34.59, 35.69], [33.95, 35.25], [34.0, 34.98],
    [33.6, 34.82], [33.0, 34.62], [32.65, 34.68], [32.4, 34.75]];
  const ORONTES = [[36.2, 33.95], [36.42, 34.3], [36.52, 34.56], [36.72, 34.9], [36.75, 35.15], [36.5, 35.5], [36.35, 35.9], [36.18, 36.18], [36.0, 36.08], [35.92, 36.02]];
  function smoothOpen(pts) {
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) { const p = pts[i], q = pts[i + 1]; d += `Q${f1(p[0])} ${f1(p[1])} ${f1((p[0] + q[0]) / 2)} ${f1((p[1] + q[1]) / 2)}`; }
    const z = pts[pts.length - 1]; return d + `L${f1(z[0])} ${f1(z[1])}`;
  }
  function smoothClosed(pts) {
    const n = pts.length, m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], s0 = m(pts[n - 1], pts[0]);
    let d = `M${f1(s0[0])} ${f1(s0[1])}`;
    for (let i = 0; i < n; i++) { const p = pts[i], e = m(p, pts[(i + 1) % n]); d += `Q${f1(p[0])} ${f1(p[1])} ${f1(e[0])} ${f1(e[1])}`; }
    return d + 'Z';
  }
  SH.bt_kd_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), LON = 35.0, LAT = 33.9, SC = 165, K = Math.cos(LAT * Math.PI / 180);
      const X = lon => 540 + (lon - LON) * K * SC, Y = lat => 700 - (lat - LAT) * SC;
      const pr = a => a.map(([lo, la]) => [X(lo), Y(la)]);
      const SEAC = mix(C.paperDark, C.blue, 0.3);
      // land everywhere, the sea cut out west of the coast
      P0(g, 'M-300-300L1380-300L1380 2200L-300 2200Z', C.paperLight, 1);
      const sea = pr(COAST); sea.push([-400, Y(31.5)], [-400, Y(36.5)]);
      const seaD = smoothOpen(sea) + 'Z';
      P0(g, seaD, SEAC, 1);
      { const sid = 'kdS' + (++uid); el(el(defs, 'clipPath', { id: sid }), 'path', { d: seaD }); const wg = el(g, 'g', { 'clip-path': `url(#${sid})` });
        let wv = ''; const r = rng(4); for (let i = 0; i < 46; i++) { const x = r() * 760 - 120, y = 330 + r() * 720; wv += `M${f1(x)} ${f1(y)}c14 -8 28 -8 42 0s28 8 42 0`; }
        L0(wg, wv, C.paperLight, 2.5, 0.45); }
      L0(g, smoothOpen(pr(COAST)), C.ink, 3, 0.9);
      const cy = smoothClosed(pr(CYPRUS));
      P0(g, cy, C.paperLight, 1); L0(g, cy, C.ink, 3, 0.9);
      // land texture: a few faint contour strokes inland
      L0(g, `M${f1(X(36.0))} 1080C${f1(X(36.4))} 900 ${f1(X(37.3))} 820 ${f1(X(37.6))} 560M${f1(X(35.8))} 300C${f1(X(36.8))} 330 ${f1(X(37.4))} 380 1200 360`, C.inkSoft, 2, 0.25);
      const riv = smoothOpen(pr(ORONTES));
      L0(g, riv, C.blue, 6, 0.9);
      const flow = L0(g, riv, C.paperLight, 3, 0.8, { pathLength: 1, 'stroke-dasharray': '0.04 0.12' });
      const t = (s, x, y, size, o = {}) => { const e = svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || BTL.FR,
        'font-weight': o.weight || 500, stroke: o.halo || C.paperLight, 'stroke-width': 10, 'stroke-linejoin': 'round', 'paint-order': 'stroke' },
        o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {})); e.setAttribute('text-anchor', o.anchor || 'middle'); return e; };
      t('Akdeniz', X(33.4), Y(33.0), 54, { font: BTL.LO, italic: true, weight: 400, color: C.inkSoft, halo: SEAC, spacing: '0.14em' });
      t('Kıbrıs', X(33.3), Y(34.5), 44, { font: BTL.LO, italic: true, weight: 400, color: C.inkSoft, halo: SEAC });
      t('Asi', X(36.62), Y(34.05), 48, { font: BTL.LO, italic: true, weight: 400, color: C.blue, anchor: 'start' });
      const [kx, ky] = [X(36.52), Y(34.56)];
      // the two armies: Egypt up the coast from the south, Hatti down from the north
      const egR = LD(g, smoothOpen(pr([[34.4, 30.9], [34.75, 31.9], [35.25, 33.0], [35.85, 33.9], [36.38, 34.42]])), C.ink, 6, 0.9);
      const htR = LD(g, smoothOpen(pr([[35.9, 37.3], [36.45, 36.7], [36.95, 35.9], [36.95, 35.1], [36.62, 34.7]])), C.ink, 6, 0.9);
      const tEg = t('Mısır', X(35.4), Y(31.45), 60, { weight: 600 }), tHt = t('Hatti', X(35.0), Y(37.0), 60, { weight: 600 });
      tEg.setAttribute('opacity', 0); tHt.setAttribute('opacity', 0);
      const pg = el(g, 'g', { opacity: 0 });
      const ring = el(pg, 'circle', { cx: kx, cy: ky, r: 20, fill: 'none', stroke: C.gold, 'stroke-width': 4 });
      el(pg, 'circle', { cx: kx, cy: ky, r: 14, fill: C.gold, stroke: C.ink, 'stroke-width': 2 });
      const tK = t('Kadeş', kx - 90, ky + 22, 76, { anchor: 'end', weight: 600 }); tK.setAttribute('opacity', 0);
      const tS = P.sub ? t(P.sub, kx - 90, ky + 82, 46, { anchor: 'end', italic: true, font: BTL.LO, weight: 400, color: C.inkSoft }) : null;
      if (tS) tS.setAttribute('opacity', 0);
      const flash = el(g, 'circle', { cx: kx, cy: ky, r: 30, fill: 'none', stroke: C.gold, 'stroke-width': 6, opacity: 0 });
      return {
        update(lt, dur, cues) {
          const ka = cue(cues, 'kadesh', 0.8), hit = cue(cues, 'hit', dur * 0.75);
          fade(pg, BTL.ease(lt, ka - 0.3, 0.6)); fade(tK, BTL.ease(lt, ka - 0.2, 0.8)); if (tS) fade(tS, BTL.ease(lt, ka + 0.4, 1));
          const ph = (((lt - ka) % 1.8) + 1.8) % 1.8 / 1.8;
          ring.setAttribute('r', f1(18 + 26 * ph)); ring.setAttribute('stroke-opacity', f1((1 - ph) * 0.9));
          fade(tEg, BTL.ease(lt, 0.2, 0.8)); fade(tHt, BTL.ease(lt, 0.2, 0.8));
          const rp = BTL.ease(lt, 0.4, Math.max(1, hit - 0.3));
          draw(egR, rp); draw(htR, rp);
          const f = clamp01((lt - hit) / 1.4);
          flash.setAttribute('r', f1(30 + 110 * f)); flash.setAttribute('opacity', (lt < hit ? 0 : 0.9 * (1 - f)).toFixed(3));
          flow.setAttribute('stroke-dashoffset', f1(-lt * 0.05));
        },
      };
    },
  };

  // ------------------------------------------------------------------ fields: after the battle / the Orontes today
  SH.bt_kd_field = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), mode = P.mode || 'after', FY = mode === 'river' ? 760 : 900;
      const sunG = BTL.glow(svg, defs, 700, FY - 120, 560, C.stain, 0.45, g);
      const sun = P0(g, '', C.stain, 0.55);
      const hills = `M-300 ${FY}L-300 ${FY - 70}C-40 ${FY - 120} 200 ${FY - 90} 420 ${FY - 110}C640 ${FY - 130} 860 ${FY - 80} 1380 ${FY - 100}L1380 ${FY}Z`;
      const sunCover = P0(g, hills, C.paperDark, 0.85); L0(g, hills.slice(hills.indexOf('C') - 12, hills.indexOf('L1380')), C.inkSoft, 2, 0.5);
      ground(g, FY, 0.8);
      const ds = motes(g, 5, 46, [0, FY - 300, 1080, FY + 420], { alpha: 0.38, size: 3, drift: 40 });
      if (mode === 'river') {
        // the river winding from the horizon to the foreground
        const rv = `M520 ${FY}C470 ${FY + 60} 620 ${FY + 120} 560 ${FY + 200}C480 ${FY + 300} 300 ${FY + 360} 340 ${FY + 520}C380 ${FY + 660} 700 ${FY + 760} 640 ${FY + 1200}` +
          `L1060 ${FY + 1200}C1080 ${FY + 760} 640 ${FY + 640} 600 ${FY + 520}C560 ${FY + 380} 700 ${FY + 300} 640 ${FY + 200}C600 ${FY + 120} 560 ${FY + 60} 560 ${FY}Z`;
        P0(g, rv, mix(C.paperDark, C.blue, 0.35), 1); L0(g, rv, C.inkSoft, 2.5, 0.7);
        const r = rng(11), flow = [];
        for (let i = 0; i < 18; i++) { const u = r(); flow.push({ e: L0(g, '', C.paperLight, 2 + u * 4, 0.7), u, ph: r() }); }
        // the tell (flat-topped mound) on the far bank
        const tell = `M640 ${FY + 4}C680 ${FY - 50} 720 ${FY - 120} 780 ${FY - 128}L960 ${FY - 130}C1010 ${FY - 120} 1040 ${FY - 50} 1090 ${FY + 4}Z`;
        P0(g, tell, mix(C.paperDark, C.ink, 0.15), 1); L0(g, tell, C.ink, 2.5, 0.8);
        let reeds = ''; for (let i = 0; i < 16; i++) { const x = 20 + i * 62 + (i % 3) * 10, y = FY + 1000 + (i % 2) * 30; if (x > 560 && x < 920) continue; reeds += `M${x} ${y}Q${x - 8} ${y - 80} ${x + 14} ${y - 150 - (i % 4) * 26}`; }
        const rd = L0(g, reeds, C.ink, 4, 0.75);
        return {
          update(lt) {
            const sy = FY - 170 + 14 * lt;
            sun.setAttribute('d', BTL.E(820, sy, 64, 64)); sunG.e.setAttribute('cy', f1(sy)); sunG.set(0.45 - 0.01 * lt);
            for (const q of flow) {   // short light lines sliding down the river towards the viewer
              const s = (q.ph + lt * 0.05) % 1, y = FY + 40 + s * 1050, x = y < FY + 200 ? 540 + (y - FY) * 0.3 : y < FY + 520 ? 600 - (y - FY - 200) * 0.6 : 470 + (y - FY - 520) * 0.5;
              const w = 16 + s * 90; q.e.setAttribute('d', `M${f1(x - w / 2 + (q.u - 0.5) * 120 * s)} ${f1(y)}l${f1(w)} 0`); q.e.setAttribute('stroke-opacity', (0.7 * Math.sin(Math.PI * s)).toFixed(3));
            }
            ds.update(lt * 4);
          },
        };
      }
      // after the battle: a broken wheel half sunk, a spear stuck at a slant
      const wx = 430, wy = FY + 170, wr = 190;
      const Wg = el(g, 'g', { transform: `translate(${wx} ${wy}) rotate(-8) scale(1 0.92)` });
      const rim = BTL.E(0, 0, wr, wr), rim2 = BTL.E(0, 0, wr - 26, wr - 26);
      P0(Wg, rim + rim2, mix(C.paperDark, C.ink, 0.35), 1, { 'fill-rule': 'evenodd' });
      L0(Wg, rim + rim2, C.ink, 4);
      let sp = ''; for (let i = 0; i < 6; i++) { if (i === 4) continue; const a = i * Math.PI / 3 - 0.3; sp += `M${f1(Math.cos(a) * 30)} ${f1(Math.sin(a) * 30)}L${f1(Math.cos(a) * (wr - 26))} ${f1(Math.sin(a) * (wr - 26))}`; }
      L0(Wg, sp, C.ink, 16); L0(Wg, sp, mix(C.paperDark, C.ink, 0.35), 9);
      const a4 = 4 * Math.PI / 3 - 0.3;
      L0(Wg, `M${f1(Math.cos(a4) * 30)} ${f1(Math.sin(a4) * 30)}L${f1(Math.cos(a4) * 90)} ${f1(Math.sin(a4) * 90)}`, C.ink, 14);
      P0(Wg, BTL.E(0, 0, 40, 40), mix(C.paperDark, C.ink, 0.5), 1, { stroke: C.ink, 'stroke-width': 4 });
      // the ground swallows the lower part of the wheel
      P0(g, `M-300 ${wy + 90}C200 ${wy + 70} 600 ${wy + 110} 1380 ${wy + 80}L1380 2100L-300 2100Z`, C.paperDark, 1);
      L0(g, `M-300 ${wy + 90}C200 ${wy + 70} 600 ${wy + 110} 1380 ${wy + 80}`, C.inkSoft, 2.5, 0.6);
      // the spear
      L0(g, `M760 ${wy + 100}L880 ${FY - 140}`, C.ink, 8);
      P0(g, `M880 ${FY - 140}L876 ${FY - 210}L900 ${FY - 150}Z`, C.ink, 1);
      let gr = ''; const r = rng(3); for (let i = 0; i < 26; i++) { const x = r() * 1080, y = wy + 130 + r() * 300; gr += `M${f1(x)} ${f1(y)}l${f1(-6 + r() * 12)} ${f1(-20 - r() * 30)}`; }
      L0(g, gr, C.inkSoft, 2.5, 0.6);
      const haze = P0(g, `M-300 ${FY - 260}L1380 ${FY - 260}L1380 ${FY + 20}L-300 ${FY + 20}Z`, C.paper, 0);
      // far off, a short column of chariots going home (left), a little dust behind each
      const col = [], DK = SIL();
      for (let i = 0; i < 3; i++) {
        const cg = el(g, 'g');
        P0(cg, BTL.E(-55, -55, 38, 15), DK, 1, { stroke: C.ink, 'stroke-width': 2 });
        L0(cg, 'M-82-62L-100-92L-120-84M-80-46L-96 0M-70-46L-60 0M-36-46L-30 0M-26-46L-10 0M-17-60L-4-38M20-36L-30-44', C.ink, 4);
        L0(cg, 'M20-60L70-60L70-32L20-32Z', C.ink, 3); P0(cg, 'M20-60L70-60L70-32L20-32Z', DK, 1);
        L0(cg, BTL.E(46, -26, 26, 26) + 'M20-26L72-26M46-52L46 0', C.ink, 3);
        L0(cg, 'M46-60L46-98', C.ink, 6); P0(cg, BTL.E(46, -108, 9, 10), DK, 1, { stroke: C.ink, 'stroke-width': 2 });
        const dust = P0(cg, '', C.paperDark, 0.6);
        col.push({ cg, dust, x0: 760 + i * 170 });
      }
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5), n = BTL.ease(lt, at - 0.2, dur - at + 0.6);
          const sy = FY - 150 + 110 * n + 6 * lt;
          sun.setAttribute('d', BTL.E(720, sy, 60, 60)); sunG.e.setAttribute('cy', f1(sy)); sunG.set(0.45 - 0.2 * n);
          haze.setAttribute('fill-opacity', (0.35 * n).toFixed(3));
          col.forEach((c, i) => { const x = c.x0 - 34 * lt, k = 0.62;
            c.cg.setAttribute('transform', `translate(${f1(x)} ${FY + 14}) scale(${k})`);
            const pu = 30 + 14 * Math.sin(lt * 2 + i); c.dust.setAttribute('d', BTL.E(110, -14, pu * 1.6, pu * 0.5)); });
          ds.update(lt * 6);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the treaty tablet
  SH.bt_kd_tablet = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const peace = P.mode === 'peace', g = el(canvas(svg, W, H), 'g'), cx = 540, cy = peace ? 620 : 680;
      const pool = BTL.glow(svg, defs, cx, cy, 620, C.stain, 0.34, g);
      ground(g, peace ? 1040 : 1120, 0.5);
      if (peace) {   // the broken spear lies on the ground in front of the tablet
        L0(g, 'M150 1120L500 1072M560 1080L900 1128', C.ink, 9);
        P0(g, 'M900 1128L962 1140L906 1110Z', C.ink, 1);
        L0(g, 'M496 1066L512 1082L500 1072M564 1074L552 1090', C.ink, 4);
      }
      const T = tablet(g, cx, cy, peace ? 560 : 640, peace ? 660 : 760, { rows: peace ? 11 : 13, rot: peace ? 1.5 : -2, seed: peace ? 1258 : 1259 });
      const cid = 'kdT' + (++uid);
      el(el(defs, 'clipPath', { id: cid }), 'path', { d: T.d });
      const glint = el(el(T.g, 'g', { 'clip-path': `url(#${cid})` }), 'path', { d: 'M-60-500L40-500L-40 500L-140 500Z', fill: C.paperLight, 'fill-opacity': 0.35 });
      const ds = motes(g, 59, 30, [140, 240, 940, 1110], { alpha: 0.35, size: 2.6 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55), rows = T.rows.length;
          if (peace) rowsSet(T.rows, rows, i => BTL.ease(lt, at - 0.2 + i * 0.12, 0.5));
          else {
            const wr = rows * BTL.ease(lt, 0, Math.max(1.2, at - 0.2)) + 0.001;
            rowsSet(T.rows, wr, i => (i >= 3 && i <= 5) ? BTL.ease(lt, at - 0.1 + (i - 3) * 0.18, 0.6) : 0);
          }
          const u = ((lt * 0.2) % 1.6) - 0.3;
          glint.setAttribute('transform', `translate(${f1(-420 + u * 700)} 0)`);
          pool.set(0.34 + (peace ? 0.2 : 0.1) * BTL.ease(lt, at, 1.5) + 0.03 * Math.sin(lt));
          ds.update(lt * 4);
        },
      };
    },
  };

  // ------------------------------------------------------------------ two crossed standards (the hook / cover)
  SH.bt_kd_standards = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FY = 1050, XC = 540, YC = 800;
      const pool = BTL.glow(svg, defs, XC, YC - 40, 520, C.stain, 0.4, g);
      ground(g, FY, 0.7);
      P0(g, BTL.E(XC, FY + 10, 260, 20), C.ink, 0.12);
      // the broken spear at their foot
      L0(g, `M250 ${FY + 50}L520 ${FY + 18}M572 ${FY + 24}L812 ${FY + 58}`, C.ink, 9);
      P0(g, `M812 ${FY + 58}L872 ${FY + 70}L818 ${FY + 40}Z`, C.ink, 1);
      L0(g, `M516 ${FY + 12}L532 ${FY + 28}L520 ${FY + 18}M576 ${FY + 18}L564 ${FY + 34}`, C.ink, 4);
      // Egyptian standard: pole from bottom left to top right, a fan on top
      const eB = [330, FY + 4], eT = [770, 500], hB = [750, FY + 4], hT = [330, 520];
      L0(g, `M${eB[0]} ${eB[1]}L${eT[0]} ${eT[1]}`, C.ink, 13);
      const fan = `M${eT[0]} ${eT[1]}L${eT[0] - 70} ${eT[1] - 60}C${eT[0] - 40} ${eT[1] - 110} ${eT[0] + 40} ${eT[1] - 120} ${eT[0] + 76} ${eT[1] - 70}Z`;
      P0(g, fan, C.blue, 1); L0(g, fan, C.ink, 3);
      let rib = ''; for (let i = 1; i < 5; i++) { const u = i / 5; rib += `M${eT[0]} ${eT[1]}L${f1(eT[0] - 70 + 146 * u)} ${f1(eT[1] - 60 - 50 * Math.sin(Math.PI * u))}`; }
      L0(g, rib, C.paperLight, 2, 0.7);
      // Hittite lituus: pole from bottom right to top left, curled head
      const r0 = 40;
      L0(g, `M${hB[0]} ${hB[1]}L${hT[0]} ${hT[1]}C${hT[0] - 24} ${hT[1] - 40} ${hT[0] - 4} ${hT[1] - 90} ${hT[0] + 40} ${hT[1] - 84}C${hT[0] + 76} ${hT[1] - 76} ${hT[0] + 70} ${hT[1] - 34} ${hT[0] + 40} ${hT[1] - 34}`, C.ink, 13);
      const knot = P0(g, BTL.E(541, 788, 22, 22), C.gold, 0, { stroke: C.ink, 'stroke-width': 3 });
      // streamers: both blow to the right
      const sE = [streamer(g, eT[0] - 20, eT[1] + 20, 1, 230, 46, { ph: 0 }), streamer(g, eT[0] - 34, eT[1] + 60, 1, 180, 34, { ph: 1.2 })];
      const sH = [streamer(g, hT[0] + 24, hT[1] + 10, 1, 250, 46, { ph: 2.2 }), streamer(g, hT[0] + 14, hT[1] + 50, 1, 190, 34, { ph: 3.1 })];
      const ds = motes(g, 1274, 34, [80, 520, 1000, FY + 200], { alpha: 0.35, size: 2.6, drift: 30 });
      const gust = []; { const r = rng(88); for (let i = 0; i < 9; i++) gust.push({ e: L0(g, '', C.inkSoft, 6 + r() * 10, 0), y: FY + 90 + r() * 200, x: r() * 1400, w: 160 + r() * 260, v: 160 + r() * 140 }); }
      const root = document.documentElement;
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6);
          let n = BTL.ease(lt, at - 0.15, 1.0);
          try { if (root.classList.contains('cover')) n = 1; } catch (e) { /* no document */ }
          const gc = mix(SIL(), C.gold, n);
          for (const s2 of [...sE, ...sH]) { s2.update(lt * 1.6); s2.e.setAttribute('fill', gc); }
          knot.setAttribute('fill-opacity', n.toFixed(3));
          pool.set(0.4 + 0.18 * n + 0.04 * Math.sin(lt * 1.1));
          ds.update(lt * 10);
          for (const q of gust) { const x = ((q.x + lt * q.v) % 1500) - 300, u = clamp01((x + 300) / 1500);
            q.e.setAttribute('d', `M${f1(x)} ${f1(q.y)}c${f1(q.w * 0.3)} -10 ${f1(q.w * 0.7)} -10 ${f1(q.w)} 0`); q.e.setAttribute('stroke-opacity', (0.28 * Math.sin(Math.PI * u)).toFixed(3)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the vitrine
  SH.bt_kd_museum = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FY = 1040, cx = 540;
      P0(g, 'M-300-300L1380-300L1380 2200L-300 2200Z', mix(C.paper, C.ink, 0.12), 1);
      // the spotlight cone from above
      P0(g, `M${cx - 60} -100L${cx + 60} -100L${cx + 330} ${FY - 120}L${cx - 330} ${FY - 120}Z`, C.paperLight, 0.22);
      const pool = BTL.glow(svg, defs, cx, FY - 440, 520, C.paperLight, 0.5, g);
      ground(g, FY, 0.6);
      // plinth
      const pl = `M${cx - 330} ${FY + 120}L${cx - 330} ${FY - 120}L${cx + 330} ${FY - 120}L${cx + 330} ${FY + 120}Z`;
      P0(g, pl, C.paperLight, 1); L0(g, pl, C.ink, 3);
      L0(g, `M${cx - 330} ${FY - 96}L${cx + 330} ${FY - 96}`, C.inkSoft, 2, 0.6);
      // glass case
      const gc = `M${cx - 240} ${FY - 120}L${cx - 240} ${FY - 760}L${cx + 240} ${FY - 760}L${cx + 240} ${FY - 120}`;
      P0(g, gc + 'Z', C.paperLight, 0.12);
      L0(g, gc + `M${cx - 240} ${FY - 760}L${cx + 240} ${FY - 760}`, C.inkSoft, 2.5, 0.8);
      // the small stand and the tablet
      L0(g, `M${cx - 60} ${FY - 122}L${cx} ${FY - 210}L${cx + 60} ${FY - 122}`, C.ink, 4);
      const T = tablet(g, cx, FY - 420, 300, 360, { rows: 12, rot: 0, seed: 1259 });
      rowsSet(T.rows, 12, null);
      const cid = 'kdM' + (++uid);
      el(el(defs, 'clipPath', { id: cid }), 'path', { d: gc + 'Z' });
      const refl = el(el(g, 'g', { 'clip-path': `url(#${cid})` }), 'path', { d: `M0 ${FY - 800}L60 ${FY - 800}L-140 ${FY - 80}L-200 ${FY - 80}Z`, fill: C.paperLight, 'fill-opacity': 0.3 });
      const ds = motes(g, 71, 40, [cx - 300, 120, cx + 300, FY - 140], { alpha: 0.45, size: 2.6, color: C.inkSoft });
      // the label sits on the plinth face, two lines
      const lab = P.label ? BTL.fit(txt(g, P.label, cx, FY - 4, 66, { weight: 500 }), 600) : null;
      const sub = P.sub ? BTL.fit(txt(g, P.sub, cx, FY + 64, 50, { font: BTL.LO, italic: true, color: C.inkSoft }), 600) : null;
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5);
          const u = ((lt * 0.16) % 1.5) - 0.2;
          refl.setAttribute('transform', `translate(${f1(cx - 200 + u * 560)} 0)`);
          pool.set(0.5 + 0.05 * Math.sin(lt * 0.9));
          if (lab) fade(lab, BTL.ease(lt, at - 0.2, 0.9)); if (sub) fade(sub, BTL.ease(lt, at + 0.4, 0.9));
          ds.update(lt * 5);
        },
      };
    },
  };
})();
