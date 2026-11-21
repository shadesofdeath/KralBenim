// bt_britannic: HMHS Britannic, Titanic's younger sister, sunk by a mine in the Kea Channel (21 November 1916),
// belgesel style (docs/BELGESEL.md). Still line art in the theme's tokens; the only motion is slow and natural: water,
// smoke, a ship slowly going down, a turning propeller, bubbles, a rising waterline. The ship is drawn as she was in
// hospital service: four raked funnels (the fourth a dummy, so it never smokes), a white hull with a horizontal green
// band and red crosses, the tall gantry davits of her boat deck, red bottom paint. Every type is composed on a
// 1080x1920 vertical canvas (the Short); a wide frame shows it as a centred column. Death is never shown.
//   bt_britannic_sink      P: {mode: "hook"|"gone", label}  cues: hit   hook: a calm grey morning sea, the ship bow-down,
//                          her stern and three propellers in the air, still turning (the cover frame). gone: only the
//                          stern is left; it slips under before "hit", rings spread; label (e.g. "55 dakika") above
//   bt_britannic_ship      P: {label: "1916"}  cues: hit   the whole ship side on, on a calm sea, smoke from three funnels;
//                          on "hit" the green band draws itself along the hull and the red crosses glow
//   bt_britannic_mine      cues: hit   split view at the waterline: the ship above, under water a moored, horned mine on
//                          its chain; the hull slides over it, on "hit" a flash, bubbles, a dark gash in the bow
//   bt_britannic_portholes cues: hit   close on the white hull plating: a row of round portholes; on "hit" their glass
//                          lids swing open, then the sea rises up the plating and pours into them
//   bt_britannic_map       P: {land: "Kea", cape: "Sunion"}  cues: hit   a sparse chart: the tip of Attica, the island of
//                          Kea, the ship's track up the channel, a red mark where the mine was; on "hit" a gold dashed line
//                          to Kea's shore draws in, the ship's mark follows it and stops short, a ring spreads
//   bt_britannic_prop      cues: hit   close on the raised stern: a great bronze propeller half out of the water, turning
//                          slowly, the sea churning; on "hit" two small lifeboats drift towards the swirl
//   bt_britannic_nurse     cues: hit   a lifeboat on a calm sea in pale morning light, one seated faceless woman in a nurse's
//                          white veil; on "hit" a small red cross appears on her apron
//   bt_britannic_two       P: {a: "Titanik", ay: "1912", b: "Britannic", by: "1916"}  cues: hit   two liners one above the
//                          other: Titanic (dark hull) and Britannic (white hull); a small gold light (Violet Jessop) burns on
//                          Britannic's deck; on "hit" a second one lights on Titanic and a dotted gold line joins them
//   bt_britannic_wreck     P: {label: "120 m"}  cues: -   the wreck on the sea floor, funnels gone, faint crosses, a dim
//                          light from far above, slow bubbles and drifting particles
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
  const HULL = () => mix(C.ink, C.paper, 0.1);          // white hull (light on a dark theme)
  const SUPER = () => mix(C.ink, C.paper, 0.04);
  const BUFF = () => mix(C.gold, C.inkSoft, 0.5);       // White Star buff funnels
  const BOTTOM = () => mix(C.red, C.paperDark, 0.55);   // red bottom paint
  const BRONZE = () => mix(C.gold, C.paperDark, 0.35);
  const WATER = () => mix(C.paper, C.paperDark, 0.55);
  const DEEP = () => mix(C.blue, C.paperDark, 0.72);

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  const rot = (x, y, a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };

  // ------------------------------------------------------------------ the liner (side on, bow right, waterline y 0)
  // ship units: 1000 long (bow 506, stern -504), hull top about -60, boat deck -86, funnel tops -172
  const HULLD = 'M506 -76L492 0C484 22 478 32 466 36L-420 38C-448 38 -462 22 -468 6L-474 -8C-492 -14 -508 -40 -504 -66Q0 -50 506 -76Z';
  const FX = [175, 70, -35, -140];
  const CROSS = [-300, 300];
  function liner(parent, o = {}) {
    const k = o.k || 1, g = el(parent, 'g'), s = el(g, 'g', { transform: `scale(${k})` }), w = v => v / k * (o.lw || 1);
    const titan = !!o.titanic, wreck = !!o.wreck, CX = o.crossX || CROSS, ck = o.crossK || 1;
    const lineC = wreck ? mix(C.inkSoft, C.paper, 0.25) : C.inkSoft;
    const hullFill = titan ? mix(C.paperDark, C.inkSoft, 0.22) : wreck ? mix(C.inkSoft, C.paper, 0.45) : HULL();
    const supFill = wreck ? mix(C.inkSoft, C.paper, 0.38) : SUPER();
    // masts and wires, behind everything
    if (!wreck && !o.noMast && o.mainOnly) {
      L0(s, 'M-380 -64L-394 -236', lineC, w(3), 1);
      L0(s, 'M-394 -236L-504 -66M-394 -236L-250 -88', lineC, w(1.2), 0.55);
    } else if (!wreck && !o.noMast) {
      L0(s, 'M360 -66L346 -250M-380 -64L-394 -236', lineC, w(3), 1);
      L0(s, 'M346 -250L506 -76M346 -250L-394 -236M-394 -236L-504 -66', lineC, w(1.2), 0.55);
      P0(s, 'M342 -186h12v-12h-12Z', lineC, 1);
    }
    // funnels (raked aft), buff with dark tops
    const tops = [];
    if (!wreck) for (const x of FX) {
      const d = `M${x - 15} -84L${x + 15} -84L${x + 3} -172L${x - 27} -172Z`;
      P0(s, d, BUFF(), 1);
      P0(s, `M${f1(x - 25.1)} -158L${f1(x + 4.9)} -158L${x + 3} -172L${x - 27} -172Z`, C.paperDark, 1);
      L0(s, d, lineC, w(1.6), 1);
      tops.push([x - 12, -174]);
    }
    // superstructure
    const sup = 'M-322 -60L262 -64L262 -86L-322 -84Z';
    P0(s, sup, supFill, 1); L0(s, sup, lineC, w(1.6), 1);
    P0(s, 'M226 -86L262 -86L262 -100L226 -100Z', supFill, 1); L0(s, 'M226 -86L226 -100L262 -100L262 -86', lineC, w(1.4), 1);
    P0(s, 'M110 -86L226 -86L226 -95L110 -95Z', supFill, 1); L0(s, 'M110 -86L110 -95L226 -95', lineC, w(1.2), 1);
    let win = ''; for (let x = -310; x < 252; x += 12) win += `M${x} -73l6 0`;
    L0(s, win, C.paperDark, w(2), wreck ? 0.4 : 0.7);
    // boats: Britannic's tall gantry davits; Titanic's boats sit low along the deck
    const BX = [214, 122, 18, -88, -192, -280];
    let boats = '', gant = '';
    for (const x of BX) {
      if (wreck) break;
      // Britannic's boats hang high inside the gantries; Titanic's sit low on the deck
      const by = titan ? -88 : -106;
      boats += `M${x - 13} ${by}L${x + 13} ${by}L${x + 11} ${by - 6}L${x - 11} ${by - 6}Z`;
      if (!titan) gant += `M${x - 15} -86L${x - 15} -118L${x + 15} -118L${x + 15} -86M${x - 15} -118L${x - 8} -112M${x + 15} -118L${x + 8} -112`;
    }
    if (boats) { P0(s, boats, mix(C.ink, C.paper, 0.2), 1); L0(s, boats, lineC, w(1), 0.8); }
    if (gant) L0(s, gant, lineC, w(1.6), 1);
    // hull, bottom paint, waterline
    P0(s, HULLD, hullFill, 1);
    P0(s, 'M492 0C484 22 478 32 466 36L-420 38C-448 38 -462 22 -468 6L-470 0Z', wreck ? mix(BOTTOM(), C.paper, 0.4) : BOTTOM(), 1);
    P0(s, 'M-470 2L-488 4L-492 36L-470 38Z', BOTTOM(), 1);
    L0(s, 'M-470 2L-488 4L-492 36L-470 38', lineC, w(1.2), 1);
    L0(s, HULLD, lineC, w(2.2), 1);
    L0(s, 'M-469 0L492 0', C.paperDark, w(1.5), 0.6);
    // portholes, in rows, gaps for the crosses
    let ph = '';
    for (const y of [-14, -26, -50]) for (let x = -440; x <= 470; x += 13) {
      if (!titan && y !== -50 && CX.some(c => Math.abs(x - c) < 26 * ck)) continue;
      ph += `M${x - 1.7} ${y}a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0 -3.4 0`;
    }
    P0(s, ph, C.paperDark, wreck ? 0.5 : 0.85);
    // hospital livery: the green band (broken by the crosses) and the red crosses
    let band = null, crosses = null;
    if (!titan) {
      let bd = '', x0 = -478;
      for (const c of CX) { bd += `M${x0} -38L${c - 24 * ck} -38`; x0 = c + 24 * ck; }
      bd += `M${x0} -38L492 -38`;
      band = L0(s, bd, C.green, o.bandW || w(5.5), wreck ? 0.3 : 1, { 'stroke-linecap': 'butt' });
      crosses = el(s, 'g', wreck ? { opacity: 0.38 } : {});
      for (const c of CX) P0(crosses, `M${c - 5} -58h10v10h11v10h-11v10h-10v-10h-11v-10h11Z`, C.red, 1, ck !== 1 ? { transform: `translate(${c} -38) scale(${ck}) translate(${-c} 38)` } : {});
    }
    // propellers (side on): centre and wing
    const props = [];
    if (o.props) for (const [x, y, r] of [[-424, 26, 14], [-462, 22, 11]]) props.push(propSide(s, x, y, r * (o.propK || 1), w(1)));
    return {
      g, band, crosses, tops,
      prop(a) { props.forEach((p, i) => p(a + i * 0.9)); },
    };
  }
  // a propeller seen side on: three blades whose height changes as it turns
  function propSide(parent, cx, cy, r, lw) {
    const e = P0(parent, '', BRONZE(), 1, { stroke: C.inkSoft, 'stroke-width': lw });
    P0(parent, BTL.E(cx, cy, r * 0.24, r * 0.24), BRONZE(), 1, { stroke: C.inkSoft, 'stroke-width': lw });
    L0(parent, `M${cx} ${cy}L${cx + 30} ${cy - 6}`, C.inkSoft, lw * 2.5, 1);
    return a => {
      let d = '';
      for (let i = 0; i < 3; i++) {
        const b = a + i * TAU / 3, ext = r * Math.cos(b), wd = r * (0.14 + 0.32 * Math.abs(Math.sin(b)));
        d += `M${f1(cx - wd * 0.35)} ${f1(cy)}Q${f1(cx - wd)} ${f1(cy + ext * 0.6)} ${f1(cx)} ${f1(cy + ext)}Q${f1(cx + wd)} ${f1(cy + ext * 0.6)} ${f1(cx + wd * 0.35)} ${f1(cy)}Z`;
      }
      e.setAttribute('d', d);
    };
  }
  // a great propeller seen three-quarter on (squashed by sx), three skewed blades
  function propBig(parent, cx, cy, r, sx) {
    const g = el(parent, 'g', { transform: `translate(${cx} ${cy}) scale(${sx} 1)` });
    const ns = { 'vector-effect': 'non-scaling-stroke' };
    const blades = P0(g, '', BRONZE(), 1, Object.assign({ stroke: C.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' }, ns));
    const ribs = L0(g, '', C.inkSoft, 2, 0.7, ns);
    P0(g, BTL.E(0, 0, r * 0.2, r * 0.2), BRONZE(), 1, Object.assign({ stroke: C.ink, 'stroke-width': 3 }, ns));
    P0(g, BTL.E(0, 0, r * 0.08, r * 0.08), C.paperDark, 1);
    const B = [[0.15, -0.12], [0.5, -0.44], [0.95, -0.34], [1, 0], [0.9, 0.2], [0.5, 0.24], [0.15, 0.1]];
    return a => {
      let d = '', rb = '';
      for (let i = 0; i < 3; i++) {
        const b = a + i * TAU / 3, q = B.map(([x, y]) => rot(x * r, y * r, b));
        d += `M${f1(q[0][0])} ${f1(q[0][1])}C${f1(q[1][0])} ${f1(q[1][1])} ${f1(q[2][0])} ${f1(q[2][1])} ${f1(q[3][0])} ${f1(q[3][1])}C${f1(q[4][0])} ${f1(q[4][1])} ${f1(q[5][0])} ${f1(q[5][1])} ${f1(q[6][0])} ${f1(q[6][1])}Z`;
        const m0 = rot(0.24 * r, 0, b), m1 = rot(0.86 * r, -0.04 * r, b);
        rb += `M${f1(m0[0])} ${f1(m0[1])}L${f1(m1[0])} ${f1(m1[1])}`;
      }
      blades.setAttribute('d', d); ribs.setAttribute('d', rb);
    };
  }

  // ------------------------------------------------------------------ water, smoke, bubbles, particles
  function sea(g, y0, seed, o = {}) {
    const r = rng(seed), amp = o.amp ?? 6, n = o.n ?? 9;
    P0(g, `M-300 ${y0}L1380 ${y0}L1380 2100L-300 2100Z`, o.fill || WATER(), 1);
    L0(g, `M-300 ${y0}L1380 ${y0}`, C.inkSoft, 2, 0.45);
    const lines = [];
    for (let i = 0; i < n; i++) {
      const u = (i + 1) / n, y = y0 + (o.depth ?? 950) * Math.pow(u, 1.7);
      lines.push({ e: L0(g, '', C.inkSoft, 1.2 + 2 * u, 0.16 + 0.26 * u), y, a: amp * (0.25 + 1.2 * u), wl: 60 + 150 * u, sp: 0.5 * (0.6 + r() * 0.5), ph: r() * TAU, ph2: r() * TAU });
    }
    return { update(lt) { for (const q of lines) {
      let d = '';
      for (let x = -300; x <= 1380; x += 30) {
        const y = q.y + q.a * Math.sin(x / q.wl + lt * q.sp + q.ph) + 0.45 * q.a * Math.sin(x / (q.wl * 0.43) - lt * q.sp * 1.3 + q.ph2);
        d += (x === -300 ? 'M' : 'L') + x + ' ' + f1(y);
      }
      q.e.setAttribute('d', d);
    } } };
  }
  function puffs(g, seed, n, o) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), ph: i / n, rx: o.size * (0.7 + r() * 0.6) });
    return { update(lt, x0, y0, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.12)) % 1, x = x0 + o.dx * u, y = y0 + o.dy * u, s = 0.5 + 1.1 * u;
      q.e.setAttribute('d', BTL.E(x, y, q.rx * s, q.rx * s * 0.6));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.2) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  function bubbles(g, n, seed, box, o = {}) {
    const r = rng(seed), list = [], [x0, y0, x1, y1] = box;
    for (let i = 0; i < n; i++) list.push({ x: x0 + r() * (x1 - x0), ph: r(), sp: (o.speed || 0.12) * (0.7 + r() * 0.6), s: (o.size || 5) * (0.5 + r()), wp: r() * TAU });
    const e = L0(g, '', C.ink, 2, 0);
    return { update(lt, k = 1, cx = null) {
      let d = '';
      for (const q of list) {
        const u = (q.ph + lt * q.sp) % 1, y = y1 - u * (y1 - y0), x = (cx == null ? q.x : cx + (q.x - (x0 + x1) / 2) * (0.3 + u)) + 8 * Math.sin(lt * 1.3 + q.wp + u * 6);
        d += `M${f1(x - q.s)} ${f1(y)}a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(2 * q.s)} 0a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(-2 * q.s)} 0`;
      }
      e.setAttribute('d', d); e.setAttribute('stroke-opacity', (0.5 * k).toFixed(3));
    } };
  }
  function motes(g, n, seed, box, alpha = 0.4) {
    const r = rng(seed), list = [], [x0, y0, x1, y1] = box;
    for (let i = 0; i < n; i++) list.push({ x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0), s: 1.4 + r() * 2.2, ph: r() * TAU, sp: 0.1 + r() * 0.2 });
    const e = P0(g, '', C.ink, alpha);
    return { update(lt, k = 1) {
      let d = '';
      for (const q of list) {
        const x = q.x + 24 * Math.sin(lt * q.sp + q.ph), y = y0 + ((q.y - y0 + lt * 7) % (y1 - y0));
        d += `M${f1(x - q.s)} ${f1(y)}a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(2 * q.s)} 0a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(-2 * q.s)} 0`;
      }
      e.setAttribute('d', d); e.setAttribute('fill-opacity', (alpha * k).toFixed(3));
    } };
  }
  function rings(g, n, col = C.inkSoft) {
    const list = Array.from({ length: n }, () => L0(g, '', col, 3, 0));
    return { update(lt, t0, x, y, span = 520) {
      list.forEach((e, i) => {
        const v = (lt - t0 - i * 0.5) / 2.8;
        if (v <= 0 || v >= 1) { e.setAttribute('stroke-opacity', '0'); return; }
        const rx = 30 + span * v;
        e.setAttribute('d', BTL.E(x, y, rx, rx * 0.16));
        e.setAttribute('stroke-width', f1(3.5 - 2 * v));
        e.setAttribute('stroke-opacity', (0.75 * (1 - v)).toFixed(3));
      });
    } };
  }
  // a low island on the horizon
  const isle = (x0, x1, y, h) => `M${x0} ${y}C${f1(x0 + (x1 - x0) * 0.18)} ${f1(y - h * 0.7)} ${f1(x0 + (x1 - x0) * 0.4)} ${f1(y - h)} ${f1(x0 + (x1 - x0) * 0.55)} ${f1(y - h * 0.92)}C${f1(x0 + (x1 - x0) * 0.72)} ${f1(y - h * 0.84)} ${f1(x0 + (x1 - x0) * 0.86)} ${f1(y - h * 0.5)} ${x1} ${y}Z`;

  // ------------------------------------------------------------------ the ship going down
  SH.bt_britannic_sink = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', hook = mode === 'hook', root = el(canvas(svg, W, H), 'g'), HZ = hook ? 1120 : 980, K = hook ? 1.4 : 1.8;
      BTL.glow(svg, defs, hook ? 500 : 520, hook ? HZ - 300 : HZ - 120, hook ? 640 : 820, C.stain, hook ? 0.3 : 0.14, root);
      P0(root, isle(hook ? 820 : 760, 1180, HZ, hook ? 34 : 46), mix(C.paper, C.inkSoft, 0.2), 1);
      const lab = mode === 'gone' ? txt(root, P.label || '55 dakika', 540, 470, 132, { weight: 300, color: C.gold }) : null;
      const sg = el(root, 'g'), L = liner(sg, { k: K, props: true, propK: hook ? 1.5 : 1, noMast: !hook, mainOnly: hook });
      const smoke = [0, 1, 2].map(i => puffs(root, 31 + i, 6, { size: 34, dx: -150, dy: -260, rate: 0.1, alpha: 0.16 }));
      const S = sea(root, HZ, mode === 'hook' ? 5 : 9);
      const foam = puffs(root, 71, 10, { size: hook ? 46 : 40, dx: hook ? -120 : 90, dy: -40, rate: 0.2, alpha: hook ? 0.32 : 0.22, color: C.ink });
      const under = hook ? BTL.glow(svg, defs, 560, HZ + 110, 380, C.stain, 0.12, root) : null;
      const gr = rng(57), glints = [];
      if (hook) for (let i = 0; i < 24; i++) glints.push({ e: L0(root, '', C.ink, 2, 0), x: 120 + gr() * 860, y: HZ + 26 + Math.pow(gr(), 1.4) * 420, w: 24 + gr() * 70, ph: gr() * TAU, sp: 0.6 + gr() * 0.8 });
      const R = rings(root, 4);
      let lastX = 360;
      return {
        update(lt, dur, cues) {
          let a, px, py;
          if (hook) {   // at lt 2.4 (cover.t): 28 deg, the deck meets the water near x 990, the stern at x 74, the stern
            // top about 500 px above the water (the cover's top shade ends at about stage y 630, so the ship sits low)
            a = (28 + 2.6 * (lt - 2.4)) * Math.PI / 180; px = 654 - 20 * (lt - 2.4); py = HZ - 83 + 30 * (lt - 2.4);   // the hook plays this at x0.35
          }
          else {
            const at = cue(cues, 'hit', dur * 0.7), u = clamp01(lt / Math.max(0.8, at + 0.2));
            a = (34 + 16 * u) * Math.PI / 180; px = 1000 - 40 * u; py = HZ + 250 + 640 * Math.pow(u, 1.6);
          }
          sg.setAttribute('transform', `translate(${f1(px)} ${f1(py)}) rotate(${f1(a * 180 / Math.PI)})`);
          L.prop(lt * (hook ? 5 : 1.4));
          const W2 = (x, y) => { const q = rot(x * K, y * K, a); return [px + q[0], py + q[1]]; };
          L.tops.slice(0, 3).forEach((t, i) => { const q = W2(t[0], t[1]); smoke[i].update(lt + i * 1.7, q[0], q[1], q[1] < HZ - 20 ? 1 : 0); });
          // where the deck line meets the water
          const xw = ((HZ - py) / K + 60 * Math.cos(a)) / Math.sin(a), q = W2(xw, -60);
          foam.update(hook ? lt * 2.5 : lt, q[0] - 40, HZ - 4, q[0] > -80 && q[0] < 1160 ? 1 : 0);
          S.update(hook ? lt * 2.5 : lt);
          for (const g of glints) { g.e.setAttribute('d', `M${f1(g.x + 10 * Math.sin(lt * 0.4 + g.ph))} ${f1(g.y)}l${f1(g.w)} 0`); g.e.setAttribute('stroke-opacity', (0.06 + 0.3 * Math.sin(lt * g.sp + g.ph) ** 2).toFixed(3)); }
          if (mode === 'gone') {
            const at = cue(cues, 'hit', dur * 0.7), st = W2(-504, -66);
            if (st[1] < HZ) lastX = Math.max(80, Math.min(1000, (st[0] + q[0]) / 2));
            R.update(lt, at - 0.4, lastX, HZ + 14, 460);
            fade(lab, BTL.ease(lt, 0.15, 0.8));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the whole ship, side on
  SH.bt_britannic_ship = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 1060, K = 1.8, XC = [-215, 215];
      BTL.glow(svg, defs, 540, HZ - 200, 700, C.stain, 0.2, root);
      const lab = txt(root, P.label || '1916', 540, 470, 170, { weight: 300, color: C.gold });
      const SINK = 10 * K;   // close on the middle of the ship: 90 px of hull above the water
      const sg = el(root, 'g', { transform: `translate(540 ${HZ + SINK})` }), L = liner(sg, { k: K, crossX: XC, crossK: 2, bandW: 11 / K });
      const smoke = [0, 1, 2].map(i => puffs(root, 41 + i, 6, { size: 40, dx: -200, dy: -230, rate: 0.09, alpha: 0.18 }));
      const S = sea(root, HZ, 13, { amp: 4 });
      const cg = L.crosses ? XC.map(x => BTL.glow(svg, defs, 540 + x * K, HZ + SINK - 38 * K, 130, C.red, 0, root)) : [];
      L.band.setAttribute('pathLength', 1);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), b = BTL.ease(lt, at - 0.4, 1.4), c = BTL.ease(lt, at - 0.1, 0.9);
          fade(lab, BTL.ease(lt, 0.1, 1.0));
          draw(L.band, b); L.band.setAttribute('stroke-opacity', b > 0 ? 1 : 0);
          fade(L.crosses, c);
          cg.forEach(g => g.set(0.32 * c * (0.85 + 0.15 * Math.sin(lt * 1.4))));
          const bob = 1.5 * Math.sin(lt * 0.8);
          sg.setAttribute('transform', `translate(540 ${f1(HZ + SINK + bob)})`);
          L.tops.slice(0, 3).forEach((t, i) => smoke[i].update(lt + i * 2.1, 540 + t[0] * K, HZ + SINK + t[1] * K + bob));
          S.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the mine under the bow
  SH.bt_britannic_mine = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), WL = 640, K = 1.6, MX = 760, MY = 826, MR = 62, SK = 20 * 1.6;
      BTL.glow(svg, defs, 420, WL - 180, 620, C.stain, 0.16, root);
      P0(root, `M-60 ${WL}L1140 ${WL}L1140 2000L-60 2000Z`, DEEP(), 1);
      // pale shafts of light from the surface
      let sh = ''; for (const x of [120, 330, 590, 880]) sh += `M${x} ${WL}L${x + 60} ${WL}L${x + 260} 1700L${x + 140} 1700Z`;
      P0(root, sh, C.stain, 0.05);
      const snow = motes(root, 70, 17, [-20, WL + 20, 1100, 1900], 0.3);
      // the mine, its chain and sinker
      const mg = el(root, 'g');
      let chain = ''; for (let y = MY + MR + 6; y < 1790; y += 26) chain += BTL.E(MX, y + 10, 6, 12);
      L0(mg, chain, C.inkSoft, 2.5, 0.8);
      P0(mg, `M${MX - 70} 1790h140v52h-140Z`, mix(C.paperDark, C.inkSoft, 0.3), 1, { stroke: C.inkSoft, 'stroke-width': 2.5 });
      const body = el(mg, 'g');
      let horns = '';
      for (const deg of [-160, -125, -90, -55, -20, 20, 160]) { const a = deg * Math.PI / 180, x0 = MX + Math.cos(a) * MR, y0 = MY + Math.sin(a) * MR, x1 = MX + Math.cos(a) * (MR + 20), y1 = MY + Math.sin(a) * (MR + 20); horns += `M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}`; }
      L0(body, horns, C.inkSoft, 9, 1);
      P0(body, BTL.E(MX, MY, MR, MR), mix(C.paperDark, C.inkSoft, 0.35), 1, { stroke: C.ink, 'stroke-width': 3 });
      L0(body, `M${MX - MR} ${MY}C${MX - 30} ${MY + 18} ${MX + 30} ${MY + 18} ${MX + MR} ${MY}`, C.inkSoft, 2, 0.7);
      // the ship: above and below the waterline
      const sg = el(root, 'g'), L = liner(sg, { k: K });
      const gash = P0(root, '', C.paperDark, 0, { stroke: C.inkSoft, 'stroke-width': 2 });
      const smoke = [0, 1, 2].map(i => puffs(root, 51 + i, 6, { size: 34, dx: -200, dy: -240, rate: 0.09, alpha: 0.16 }));
      L0(root, `M-60 ${WL}L1140 ${WL}`, C.ink, 2.5, 0.5);
      const wave = L0(root, '', C.inkSoft, 2, 0.6);
      const flash = BTL.glow(svg, defs, MX, MY - 40, 420, C.ink, 0, root);
      const fl2 = BTL.glow(svg, defs, MX, MY - 60, 160, C.gold, 0, root);
      const bub = bubbles(root, 40, 29, [MX - 160, WL + 40, MX + 160, MY + 40], { speed: 0.35, size: 7 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), m = BTL.ease(lt, 0, Math.max(0.6, at));
          const px = -60 + 150 * m;
          sg.setAttribute('transform', `translate(${f1(px)} ${WL + SK})`);
          L.tops.slice(0, 3).forEach((t, i) => smoke[i].update(lt + i * 1.9, px + t[0] * K, WL + SK + t[1] * K));
          const bob = 2 * Math.sin(lt * 0.9);
          body.setAttribute('transform', `translate(0 ${f1(bob)})`);
          const h = clamp01((lt - at) / 0.25), dec = Math.exp(-Math.max(0, lt - at) * 1.6);
          flash.set(lt < at ? 0 : 0.55 * dec * h);
          fl2.set(lt < at ? 0 : 0.6 * dec * h);
          fade(body, 1 - BTL.ease(lt, at, 0.35));
          const G = WL + 34; gash.setAttribute('d', `M${MX - 40} ${G + 52}L${MX - 14} ${G + 38}L${MX + 4} ${G + 56}L${MX + 30} ${G + 36}L${MX + 46} ${G + 54}L${MX + 20} ${G + 62}L${MX - 10} ${G + 60}Z`);
          gash.setAttribute('fill-opacity', BTL.ease(lt, at, 0.4).toFixed(3)); gash.setAttribute('stroke-opacity', BTL.ease(lt, at, 0.4).toFixed(3));
          bub.update(lt - at, lt < at ? 0 : 1, MX);
          snow.update(lt);
          let d = ''; for (let x = -60; x <= 1140; x += 30) d += (x === -60 ? 'M' : 'L') + x + ' ' + f1(WL + 6 + 4 * Math.sin(x / 70 + lt * 0.8));
          wave.setAttribute('d', d);
        },
      };
    },
  };

  // ------------------------------------------------------------------ open portholes, rising water
  SH.bt_britannic_portholes = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), PY = 780, PR = 64, XS = [170, 410, 650, 890];
      // hull plating, full frame
      P0(root, 'M-60 200L1140 200L1140 2000L-60 2000Z', HULL(), 1);
      BTL.glow(svg, defs, 540, PY, 700, C.stain, 0.16, root);
      let seams = ''; for (const y of [300, 1040, 1500]) seams += `M-60 ${y}L1140 ${y}`;
      for (const x of [290, 770]) seams += `M${x} 300L${x} 1040`;
      for (const x of [50, 530, 1010]) seams += `M${x} 1040L${x} 1500`;
      L0(root, seams, C.inkSoft, 2.5, 0.55);
      let riv = '';
      for (const y of [316, 1024, 1056, 1484]) for (let x = -40; x < 1120; x += 34) riv += `M${x - 3} ${y}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`;
      P0(root, riv, C.inkSoft, 0.5);
      // the green band of a hospital ship, above the portholes
      P0(root, 'M-60 430L1140 430L1140 500L-60 500Z', C.green, 0.95);
      // portholes: brass rim, dark inside, a glass lid hinged at the top
      const lids = [];
      for (const x of XS) {
        P0(root, BTL.E(x, PY, PR + 16, PR + 16), mix(C.gold, C.inkSoft, 0.45), 1, { stroke: C.inkSoft, 'stroke-width': 3 });
        P0(root, BTL.E(x, PY, PR, PR), C.paperDark, 1, { stroke: C.ink, 'stroke-width': 2.5 });
        let bolts = ''; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, bx = x + Math.cos(a) * (PR + 8), by = PY + Math.sin(a) * (PR + 8); bolts += `M${f1(bx - 3)} ${f1(by)}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`; }
        P0(root, bolts, C.paperDark, 0.6);
        const lid = P0(root, '', mix(C.blue, C.paperLight, 0.4), 0.95, { stroke: mix(C.gold, C.inkSoft, 0.4), 'stroke-width': 7 });
        const gl = L0(root, '', C.ink, 3, 0.7);
        lids.push({ x, lid, gl });
      }
      // the sea rising up the plating
      const water = P0(root, '', mix(C.blue, C.paperDark, 0.62), 0.96);
      const surf = L0(root, '', C.ink, 3, 0.75);
      const spill = L0(root, '', C.ink, 3, 0, { 'stroke-dasharray': '18 22' });
      const bub = bubbles(root, 30, 37, [0, 900, 1080, 1900], { speed: 0.15, size: 5 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', 0.9), o = BTL.ease(lt, at - 0.2, 0.9);
          for (const L of lids) {
            const th = o * 2.2, cy = PY - PR + PR * Math.cos(th), ry = Math.max(3, PR * Math.abs(Math.cos(th)));
            L.lid.setAttribute('d', BTL.E(L.x, cy, PR + 2, ry));
            L.gl.setAttribute('d', `M${L.x - PR * 0.5} ${f1(cy - ry * 0.3)}C${L.x - PR * 0.2} ${f1(cy - ry * 0.6)} ${L.x + PR * 0.1} ${f1(cy - ry * 0.62)} ${L.x + PR * 0.3} ${f1(cy - ry * 0.5)}`);
          }
          const r = BTL.ease(lt, at + 0.5, Math.max(1.2, dur - at - 0.7)), wy = 1140 - (1140 - (PY + 10)) * r;
          let d = ''; for (let x = -60; x <= 1140; x += 30) d += (x === -60 ? 'M' : 'L') + x + ' ' + f1(wy + 7 * Math.sin(x / 80 + lt * 1.2) + 3 * Math.sin(x / 31 - lt * 1.7));
          surf.setAttribute('d', d);
          water.setAttribute('d', d + 'L1140 2000L-60 2000Z');
          // when the surface reaches the portholes, water pours in over their lower rims
          const k = clamp01((PY + PR + 40 - wy) / 80);
          let sp = ''; for (const x of XS) sp += `M${x - PR * 0.8} ${f1(Math.min(wy, PY + PR) - 4)}Q${x} ${f1(Math.min(wy, PY + PR) - 34)} ${x + PR * 0.8} ${f1(Math.min(wy, PY + PR) - 4)}`;
          spill.setAttribute('d', sp); spill.setAttribute('stroke-opacity', (0.8 * k).toFixed(3));
          spill.setAttribute('stroke-dashoffset', f1(-lt * 60));
          bub.update(lt, r);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the chart: Kea Channel
  function blobPts(cx, cy, rx, ry, seed, ang, n = 48) {
    const r = rng(seed), pts = [];
    for (let i = 0; i < n; i++) {
      const u = i / n * TAU, rr = 1 + 0.08 * Math.sin(u * 3 + 0.4) + 0.06 * Math.sin(u * 7 + 1.3) + (r() - 0.5) * 0.06;
      const q = rot(Math.cos(u) * rx * rr, Math.sin(u) * ry * rr, ang);
      pts.push([cx + q[0], cy + q[1]]);
    }
    return { pts, d: 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z' };
  }
  SH.bt_britannic_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g');
      let grat = ''; for (let x = 60; x < 1080; x += 160) grat += `M${x} 160L${x} 1880`; for (let y = 220; y < 1900; y += 160) grat += `M20 ${y}L1060 ${y}`;
      L0(root, grat, C.inkSoft, 1.2, 0.12);
      BTL.glow(svg, defs, 560, 720, 520, C.stain, 0.12, root);
      const land = mix(C.paperLight, C.inkSoft, 0.18);
      const attica = 'M-60 300C80 350 190 430 250 510C282 552 298 586 306 612C268 632 196 640 120 630C60 622 0 640 -60 660Z';
      const KEA = blobPts(790, 790, 140, 300, 23, -0.26), kea = KEA.d;
      const D = BTL.drawing(root);
      D.f(attica, land, 1); D.f(kea, land, 1);
      D.s(attica.replace(/Z$/, ''), { w: 3, color: C.ink }); D.s(kea, { w: 3, color: C.ink });
      const lk = txt(root, P.land || 'Kea', 800, 830, 72, { font: BTL.LO, italic: true, weight: 500 });
      const lc = txt(root, P.cape || 'Sunion', 236, 700, 50, { font: BTL.LO, italic: true, color: C.inkSoft, weight: 500 });
      // the track: up the channel from the south-west to the mine (red X at the turn), then the turn towards Kea's
      // shore; the ship's mark stops halfway between the X and the shore
      const S0 = [330, 1090], B1 = [380, 950], B2 = [440, 780], X = [500, 650];
      const Kp = KEA.pts.reduce((m, q) => (Math.hypot(q[0] - X[0], q[1] - X[1]) < Math.hypot(m[0] - X[0], m[1] - X[1]) ? q : m), KEA.pts[0]);
      const CQ = [(X[0] + Kp[0]) / 2, Math.min(X[1], Kp[1]) - 30];
      const track = L0(root, `M${S0[0]} ${S0[1]}C${B1[0]} ${B1[1]} ${B2[0]} ${B2[1]} ${X[0]} ${X[1]}`, C.ink, 3.5, 1, { pathLength: 1, 'stroke-dasharray': '1 0' });
      const mark = L0(root, `M${X[0] - 22} ${X[1] - 22}L${X[0] + 22} ${X[1] + 22}M${X[0] + 22} ${X[1] - 22}L${X[0] - 22} ${X[1] + 22}`, C.red, 7, 1, { opacity: 0 });
      const intent = L0(root, '', C.gold, 4, 0.95);
      const ship = P0(root, '', C.ink, 1);
      const sg = BTL.glow(svg, defs, 0, 0, 70, C.ink, 0.25, root);
      const R = rings(root, 3, C.ink);
      const qb = (u, a, c, b) => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
      const cb = (u) => { const a = S0, b = B1, c = B2, d = X, m = 1 - u; return [m * m * m * a[0] + 3 * m * m * u * b[0] + 3 * m * u * u * c[0] + u * u * u * d[0], m * m * m * a[1] + 3 * m * m * u * b[1] + 3 * m * u * u * c[1] + u * u * u * d[1]]; };
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.45), tr = Math.max(0.6, Math.min(1.0, at - 0.3));
          D.reveal(BTL.ease(lt, 0, 0.9));
          fade(lk, BTL.ease(lt, 0.3, 0.7)); fade(lc, BTL.ease(lt, 0.5, 0.7));
          const u = BTL.ease(lt, 0.1, tr);
          draw(track, u);
          fade(mark, BTL.ease(lt, 0.1 + tr * 0.85, 0.35));
          const v = BTL.ease(lt, at - 0.3, 0.8);
          // the dashed line draws itself in: short dashes along the curve up to v
          let dd = ''; for (let i = 0; i < 12; i++) { const u0 = i / 12, u1 = Math.min(v, u0 + 0.05); if (u0 >= v) break; const a0 = qb(u0, X, CQ, Kp), a1 = qb(u1, X, CQ, Kp); dd += `M${f1(a0[0])} ${f1(a0[1])}L${f1(a1[0])} ${f1(a1[1])}`; }
          intent.setAttribute('d', dd);
          // the ship's mark: along the track, then along the turn, stopping halfway
          const t1 = Math.max(at, 0.1 + tr), s = BTL.ease(lt, t1, 0.9) * 0.5;
          const p = lt < t1 ? cb(u) : qb(s, X, CQ, Kp);
          const sink = BTL.ease(lt, t1 + 1.0, 0.6);
          ship.setAttribute('d', BTL.E(p[0], p[1], 12, 12)); ship.setAttribute('fill-opacity', (1 - sink).toFixed(3));
          sg.e.setAttribute('cx', f1(p[0])); sg.e.setAttribute('cy', f1(p[1])); sg.set(0.3 * (1 - sink));
          R.update(lt, t1 + 0.9, p[0], p[1], 110);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the raised stern, the turning propeller
  SH.bt_britannic_prop = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 1080, PX = 560, PY = 900, PR = 210;
      BTL.glow(svg, defs, 640, 520, 700, C.stain, 0.16, root);
      // the stern, seen from the port side, raised: taffrail top-right, the hull running down to the left into the sea
      const hull = 'M-60 250L700 150C760 142 820 150 860 180C900 220 880 330 840 420L800 640L740 700L-60 1200Z';
      P0(root, hull, HULL(), 1);
      P0(root, 'M-60 830L780 560L800 640L740 700L-60 1200Z', BOTTOM(), 1);
      L0(root, hull, C.inkSoft, 3, 1);
      L0(root, 'M-60 830L780 560', C.paperDark, 3, 0.7);
      P0(root, 'M-60 420L840 255L842 290L-60 455Z', C.green, 0.95);
      P0(root, 'M380 296h34v40h40v34h-40v40h-34v-40h-40v-34h40Z', C.red, 1);
      let ph = ''; for (let x = -20; x < 820; x += 46) { const y = 520 - (x + 60) * 0.18; if (Math.abs(x - 397) < 70) continue; ph += BTL.E(x, y, 7, 7); }
      P0(root, ph, C.paperDark, 0.85);
      L0(root, 'M-60 250L700 150', C.ink, 4, 0.8);
      // shaft bossing and the rudder
      L0(root, `M${PX + 20} ${PY - 10}L690 676`, C.inkSoft, 20, 1);
      L0(root, `M${PX + 20} ${PY - 10}L690 676`, mix(BOTTOM(), C.paperDark, 0.4), 14, 1);
      const rud = 'M808 560L866 574C884 700 890 880 884 1080L822 1080C816 940 812 800 804 690Z';
      P0(root, rud, BOTTOM(), 1); L0(root, rud, C.inkSoft, 3, 1);
      L0(root, 'M814 620L870 632M818 760L882 770M822 900L886 906', C.inkSoft, 2, 0.6);
      const prop = propBig(root, PX, PY, PR, 0.62);
      // the sea in front, churned around the propeller
      const S = sea(root, HZ, 21, { amp: 7 });
      const swirl = [0, 1, 2, 3].map(i => L0(root, '', C.ink, 2.5 - i * 0.4, 0.55 - i * 0.1, { 'stroke-dasharray': `${40 + i * 12} ${30 + i * 8}` }));
      const foam = puffs(root, 61, 10, { size: 44, dx: 220, dy: -40, rate: 0.2, alpha: 0.24, color: C.ink });
      // two lifeboats (a few faceless heads) drifting towards the swirl
      const boats = [[150, 1112, 0.9], [330, 1150, 1]].map(([x, y, s], i) => {
        const g = el(root, 'g');
        P0(g, `M${-90 * s} 0L${90 * s} 0L${70 * s} ${26 * s}L${-70 * s} ${26 * s}Z`, mix(C.ink, C.paper, 0.2), 1, { stroke: C.inkSoft, 'stroke-width': 2.5 });
        let hd = ''; for (const hx of [-50, -18, 14, 46]) hd += BTL.E(hx * s, -14 * s, 9 * s, 10 * s);
        P0(g, hd, C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 1.5 });
        return { g, x, y, i };
      });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6);
          prop(lt * 1.1);
          S.update(lt);
          swirl.forEach((e, i) => { const rx = 120 + i * 70; e.setAttribute('d', BTL.E(PX + 20, HZ + 14 + i * 6, rx, rx * 0.16)); e.setAttribute('stroke-dashoffset', f1(-lt * (40 - i * 6))); });
          foam.update(lt, PX - 120, HZ - 6);
          const pull = BTL.ease(lt, at - 0.6, Math.max(1.5, dur - at + 0.4));
          for (const b of boats) {
            const x = b.x + (PX - 160 - b.x) * 0.55 * pull * (b.i ? 0.8 : 1), y = b.y - 20 * pull + 3 * Math.sin(lt * 0.9 + b.i);
            b.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(4 * pull * (b.i ? -1 : 1) + 1.2 * Math.sin(lt * 0.7 + b.i))})`);
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the nurse in the lifeboat
  SH.bt_britannic_nurse = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 1010;
      BTL.glow(svg, defs, 560, 760, 560, C.stain, 0.28, root);
      L0(root, `M-60 ${HZ - 40}L1140 ${HZ - 40}`, C.inkSoft, 1.5, 0.3);
      const bg = el(root, 'g');
      // the boat
      const hull = 'M200 980L880 980C870 1020 830 1060 760 1070L320 1070C250 1060 210 1020 200 980Z';
      // the seated woman (faceless, side on, facing right): two legs bent at the knee, hands resting in her lap,
      // a white nurse's veil over her head and shoulders, a white apron with a small red cross on the bib
      const pg = el(bg, 'g'), SIL = C.paperDark, RIM = C.inkSoft;
      const limb = (d, wd) => { L0(pg, d, RIM, wd + 5, 0.85); L0(pg, d, SIL, wd, 1); };
      limb('M545 948L632 936L650 1010', 34);          // far leg (thigh, knee, shin)
      limb('M528 958L652 948L674 1020', 38);          // near leg
      const torso = 'M478 712C468 780 464 870 478 958L566 962C572 880 566 780 548 712Z';
      P0(pg, torso, SIL, 1); L0(pg, torso, RIM, 3, 0.85);
      P0(pg, 'M496 676h30v40h-30Z', SIL, 1);                                     // neck
      // apron: skirt over the lap and the bib on the chest
      P0(pg, 'M486 900L566 902L652 922L656 952L520 966L484 960Z', C.ink, 0.9);
      P0(pg, 'M490 722L546 722L550 830L494 830Z', C.ink, 0.92);
      L0(pg, 'M486 900L566 902', C.inkSoft, 2, 0.8);
      const red = P0(pg, 'M513 744h10v14h14v10h-14v14h-10v-14h-14v-10h14Z', C.red, 0);
      const rg = BTL.glow(svg, defs, 518, 763, 60, C.red, 0, pg);
      limb('M540 730L556 842L622 904', 24);           // near arm: shoulder, elbow, hands in the lap
      P0(pg, BTL.E(626, 906, 18, 13), SIL, 1, { stroke: RIM, 'stroke-width': 2.5 });
      // head and veil
      const hx = 514, hy = 642;
      P0(pg, BTL.E(hx, hy, 34, 38), SIL, 1, { stroke: RIM, 'stroke-width': 3 });
      P0(pg, `M${hx + 30} ${hy - 20}C${hx + 22} ${hy - 50} ${hx - 30} ${hy - 54} ${hx - 38} ${hy - 14}C${hx - 50} ${hy + 30} ${hx - 58} ${hy + 80} ${hx - 64} ${hy + 120}L${hx - 26} ${hy + 112}C${hx - 22} ${hy + 70} ${hx - 14} ${hy + 30} ${hx - 6} ${hy + 6}C${hx + 6} ${hy - 6} ${hx + 20} ${hy - 12} ${hx + 34} ${hy - 12}Z`, C.ink, 0.94);
      L0(pg, `M${hx + 32} ${hy - 16}C${hx + 12} ${hy - 26} ${hx - 20} ${hy - 26} ${hx - 36} ${hy - 12}`, C.inkSoft, 2.5, 0.8);
      P0(bg, hull, mix(C.ink, C.paper, 0.22), 1);
      L0(bg, hull, C.inkSoft, 3, 1);
      L0(bg, 'M200 980L880 980', C.ink, 4, 0.9);
      L0(bg, 'M240 1010L860 1004', C.inkSoft, 2, 0.6);
      // an oar, shipped
      L0(bg, 'M250 968L760 960', C.inkSoft, 7, 1);   // the oar lies shipped along the boat
      P0(bg, 'M760 952L840 950L842 966L760 968Z', C.inkSoft, 1);
      const S = sea(root, HZ + 30, 33, { amp: 4 });
      const gl = rng(91), glints = [];
      for (let i = 0; i < 14; i++) glints.push({ e: L0(root, '', C.ink, 2, 0), x: gl() * 1000 + 40, y: HZ + 70 + gl() * 700, w: 30 + gl() * 70, ph: gl() * TAU });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6), c = BTL.ease(lt, at - 0.2, 0.7);
          bg.setAttribute('transform', `translate(0 ${f1(3 * Math.sin(lt * 0.8))}) rotate(${f1(0.6 * Math.sin(lt * 0.6))} 540 1020)`);
          red.setAttribute('fill-opacity', c.toFixed(3));
          rg.set(0.35 * c);
          S.update(lt);
          for (const q of glints) { q.e.setAttribute('d', `M${f1(q.x)} ${f1(q.y)}l${f1(q.w)} 0`); q.e.setAttribute('stroke-opacity', (0.08 + 0.22 * Math.sin(lt * 0.5 + q.ph) ** 2).toFixed(3)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ two ships, one woman
  SH.bt_britannic_two = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), K = 0.86, YA = 560, YB = 1050;
      BTL.glow(svg, defs, 540, YA - 80, 520, C.stain, 0.13, root);
      BTL.glow(svg, defs, 540, YB - 80, 520, C.stain, 0.16, root);
      const la = txt(root, P.a || 'Titanik', 380, 300, 76, { weight: 400 });
      const lay = txt(root, P.ay || '1912', 700, 300, 60, { font: BTL.LO, italic: true, color: C.gold, weight: 500 });
      const lb = txt(root, P.b || 'Britannic', 380, 790, 76, { weight: 400 });
      const lby = txt(root, P.by || '1916', 720, 790, 60, { font: BTL.LO, italic: true, color: C.gold, weight: 500 });
      const SK = 20 * K;   // both ships sit in the water
      const cid = 'brtw' + Math.round(W + H), cp = el(defs, 'clipPath', { id: cid });
      el(cp, 'rect', { x: -800, y: -600, width: 1600, height: f1(600 - SK + 3) });   // in the ships' own space: above the waterline
      const ga = el(root, 'g', { transform: `translate(540 ${YA + SK})`, 'clip-path': `url(#${cid})` }), gb = el(root, 'g', { transform: `translate(540 ${YB + SK})`, 'clip-path': `url(#${cid})` });
      liner(ga, { k: K, titanic: true }); liner(gb, { k: K });
      const wa = L0(root, '', C.inkSoft, 2, 0.5), wb = L0(root, '', C.inkSoft, 2, 0.5);
      const DA = [540 + 40 * K, YA + SK - 100 * K], DB = [540 + 40 * K, YB + SK - 100 * K];
      const link = L0(root, `M${f1(DB[0])} ${f1(DB[1] - 20)}C${f1(DB[0] + 260)} ${f1(DB[1] - 200)} ${f1(DA[0] + 260)} ${f1(DA[1] + 120)} ${f1(DA[0])} ${f1(DA[1] + 20)}`, C.gold, 3, 0, { 'stroke-dasharray': '4 12' });
      const gA = BTL.glow(svg, defs, DA[0], DA[1], 110, C.gold, 0, root), gB = BTL.glow(svg, defs, DB[0], DB[1], 110, C.gold, 0, root);
      const dA = P0(root, BTL.E(DA[0], DA[1], 9, 9), C.gold, 0), dB = P0(root, BTL.E(DB[0], DB[1], 9, 9), C.gold, 0);
      const wl = (y, lt) => { let d = ''; for (let x = 40; x <= 1040; x += 25) d += (x === 40 ? 'M' : 'L') + x + ' ' + f1(y + 3 * Math.sin(x / 50 + lt)); return d; };
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55);
          fade(la, BTL.ease(lt, 0.1, 0.8)); fade(lay, BTL.ease(lt, 0.3, 0.8));
          fade(lb, BTL.ease(lt, 0.1, 0.8)); fade(lby, BTL.ease(lt, 0.3, 0.8));
          wa.setAttribute('d', wl(YA + 4, lt)); wb.setAttribute('d', wl(YB + 4, lt * 1.1 + 1));
          const b = BTL.ease(lt, 0.3, 0.8), a = BTL.ease(lt, at - 0.2, 0.8), l = BTL.ease(lt, at + 0.2, 1.2);
          const br = 0.9 + 0.1 * Math.sin(lt * 1.6);
          dB.setAttribute('fill-opacity', b.toFixed(3)); gB.set(0.55 * b * br);
          dA.setAttribute('fill-opacity', a.toFixed(3)); gA.set(0.55 * a * br);
          link.setAttribute('stroke-opacity', (0.85 * l).toFixed(3));
        },
      };
    },
  };

  // the wreck lying on her starboard side, seen from the deck side and a little above: the port side of the hull
  // faces up (foreshortened band: red bottom near the keel, faint green band, crosses, portholes), the deck faces the
  // viewer (superstructure, the dark openings where the funnels stood, gantries along the edge); the starboard edge
  // is buried in the sea floor. Ship units as in liner(): bow at +506, stern at -504, deck edge at y -60.
  function wreckSide(g) {
    const dim = c => mix(c, C.paper, 0.45);
    const f = x => x > 300 ? Math.pow(clamp01((506 - x) / 206), 0.55) : x < -440 ? Math.pow(clamp01((x + 506) / 66), 0.5) : 1;
    const xs = []; for (let x = -506; x <= 506; x += 12) xs.push(x); xs.push(506);
    const edge = (fy) => xs.map((x, i) => (i ? 'L' : 'M') + x + ' ' + f1(fy(x))).join('');
    const back = (fy) => xs.slice().reverse().map(x => 'L' + x + ' ' + f1(fy(x))).join('');
    const keel = x => -60 - 58 * f(x), boot = x => -60 - 40 * f(x), deckB = x => -60 + 96 * f(x);
    // port side band (hull plating seen from above) and the bottom paint along the keel
    P0(g, edge(keel) + back(x => -60) + 'Z', dim(HULL()), 1);
    P0(g, edge(keel) + back(boot) + 'Z', dim(BOTTOM()), 1);
    L0(g, edge(x => -60 - 30 * f(x)), C.green, 3.5, 0.3);
    let ph = ''; for (let x = -430; x < 440; x += 14) ph += BTL.E(x, -60 - 16 * f(x), 1.8, 1.2);
    P0(g, ph, C.paperDark, 0.5);
    for (const c of CROSS) P0(g, `M${c - 6} -94h12v6h12v8h-12v6h-12v-6h-12v-8h12Z`, C.red, 0.4);
    // the deck, facing the viewer
    P0(g, edge(x => -60) + back(deckB) + 'Z', dim(SUPER()), 1);
    L0(g, edge(keel) + back(deckB) + 'Z', mix(C.inkSoft, C.paper, 0.2), 2.2, 1);
    L0(g, edge(x => -60), mix(C.inkSoft, C.paper, 0.2), 2, 0.9);
    // superstructure block and its rows of windows
    const sup = 'M-322 -44L262 -44L262 30L-322 30Z';
    P0(g, sup, dim(mix(C.ink, C.paper, 0.2)), 1); L0(g, sup, mix(C.inkSoft, C.paper, 0.2), 2, 1);
    let win = ''; for (const y of [-30, -16, 16]) for (let x = -310; x < 252; x += 12) win += `M${x} ${y}l6 0`;
    L0(g, win, C.paperDark, 2, 0.5);
    // where the funnels stood: dark openings
    let holes = ''; for (const x of FX) holes += BTL.E(x - 4, 0, 16, 22);
    P0(g, holes, C.paperDark, 0.95); L0(g, holes, C.ink, 2.4, 0.75);
    // gantry davits along the upper (port) deck edge, now lying flat towards the viewer
    let gt = ''; for (const x of [214, 122, 18, -88, -192, -280]) gt += `M${x - 15} -60L${x - 15} -48L${x + 15} -48L${x + 15} -60`;
    L0(g, gt, mix(C.inkSoft, C.paper, 0.15), 1.8, 0.9);
    // hatches on the fore and aft decks
    let ht = ''; for (const x of [330, 390, 440, -380, -430]) ht += `M${x - 14} -30h28v26h-28Z`;
    L0(g, ht, mix(C.inkSoft, C.paper, 0.2), 1.6, 0.8);
  }

  // ------------------------------------------------------------------ the wreck on the sea floor
  SH.bt_britannic_wreck = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), SB = 1150;
      P0(root, 'M-60 0L1140 0L1140 2000L-60 2000Z', DEEP(), 1);
      const top = BTL.glow(svg, defs, 540, 80, 900, C.stain, 0.2, root);
      let sh = ''; for (const x of [200, 470, 760]) sh += `M${x} 0L${x + 70} 0L${x + 220} ${SB}L${x + 100} ${SB}Z`;
      P0(root, sh, C.stain, 0.05);
      const lab = txt(root, P.label || '120 m', 540, 440, 92, { font: BTL.LO, italic: true, color: C.inkSoft, weight: 500 });
      const pool = BTL.glow(svg, defs, 540, SB - 70, 520, C.stain, 0.2, root);
      // seen from a little above: the wreck fills the band y 900-1150 (stretched in height, not in length)
      const sg = el(root, 'g', { transform: `translate(540 ${SB - 62}) rotate(-1.5) scale(1.03 1.6)` });
      wreckSide(sg);
      // the sea floor, in front, burying the keel
      const floor = `M-60 ${SB}C200 ${SB - 14} 420 ${SB + 6} 600 ${SB - 4}C800 ${SB - 12} 960 ${SB + 4} 1140 ${SB - 6}L1140 2000L-60 2000Z`;
      P0(root, floor, mix(C.paper, C.inkSoft, 0.16), 1);
      L0(root, floor.split('L1140 2000')[0], C.inkSoft, 2.5, 0.6);
      const r = rng(77); let peb = '';
      for (let i = 0; i < 40; i++) { const x = r() * 1080, y = SB + 40 + r() * 600, s = 2 + r() * 5; peb += BTL.E(x, y, s * 1.5, s); }
      L0(root, peb, C.inkSoft, 1.4, 0.25);
      // sand ripples and a few rocks on the floor, down to about y 1400
      let rip = ''; for (const [y0, x0, x1] of [[1200, 40, 420], [1236, 560, 1000], [1290, 120, 520], [1330, 640, 1060], [1380, 20, 380]]) {
        let d = `M${x0} ${y0}`; for (let x = x0 + 30; x <= x1; x += 30) d += `L${x} ${f1(y0 + 6 * Math.sin(x / 26))}`; rip += d; }
      L0(root, rip, C.inkSoft, 2, 0.35);
      const rocks = 'M70 1420C80 1386 130 1376 160 1392C186 1404 190 1424 176 1430Z' + 'M860 1410C872 1372 940 1366 972 1388C990 1402 988 1420 972 1426Z' + 'M410 1176C418 1160 448 1156 462 1168C470 1176 468 1184 462 1186Z';
      P0(root, rocks, mix(C.paperDark, C.inkSoft, 0.25), 1); L0(root, rocks, C.inkSoft, 2, 0.7);
      const bub = bubbles(root, 26, 43, [240, 300, 860, SB - 260], { speed: 0.06, size: 6 });
      const snow = motes(root, 80, 61, [-20, 100, 1100, 1800], 0.3);
      return {
        update(lt, dur) {
          fade(lab, BTL.ease(lt, 0.3, 1.0));
          bub.update(lt); snow.update(lt);
          const k = BTL.ease(lt, 0.5, Math.max(2, dur));
          pool.set(0.2 - 0.08 * k); top.set(0.2 - 0.05 * k);
        },
      };
    },
  };
})();
