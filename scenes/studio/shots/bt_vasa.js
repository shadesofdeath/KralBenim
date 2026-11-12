// bt_vasa: the Swedish warship Vasa (sank on her maiden voyage, Stockholm, 10 August 1628; raised 24 April 1961),
// belgesel style (docs/BELGESEL.md). Still line art in the theme's tokens; the only motion is slow and natural
// (water lines, a pennant, bubbles, wind, slow heeling, slow sinking, marine snow, a hull rising). Places are drawn on
// the 1920x1080 stage and framed for a Short with BTL.stage.
//   bt_vasa_ship   P: {mode: "hook"|"profile"}  cues: hit   the galleon side on, bow to the right, in a light pool.
//                  hook: already low in the water and still sinking; profile: draws itself, gilding lights on hit
//   bt_vasa_front  P: {mode: "section"|"heel"}  cues: hit   the ship seen from the bow. section: cut open, two gun
//                  decks of cannon, a gold centre-of-gravity mark rises on hit; heel: wind, the ship heels over on hit
//   bt_vasa_port   P: {}  cues: hit   close-up of the hull side: an open gun port, the sea rises over its sill and pours in
//   bt_vasa_harbor P: {mode: "date"|"watch", text, sub}  cues: hit   date: 1620s Stockholm skyline on the water, the
//                  ship small beside it, big date; watch: people on a quay in the foreground, the ship sinks on hit
//   bt_vasa_years  P: {total: 333, label: "yıl"}   a big year counter (counts up in the first ~1.5 s) over the hull on the sea floor
//   bt_vasa_deep   P: {mode: "kept"|"rise"}  cues: hit   the hull on the dark sea floor; kept: a gold line traces it on
//                  hit; rise: the hull lifts slowly towards the light
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const ital = (g, s, x, y, size = 48, o = {}) => label(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft, weight: 400 }, o));
  let uid = 0;
  const clipRect = (g, x, y, w, h) => { const id = 'vsc' + (++uid), cp = el(g, 'clipPath', { id }); el(cp, 'rect', { x, y, width: w, height: h }); return `url(#${id})`; };

  // ------------------------------------------------------------------ the ship, side on (origin = waterline centre)
  // ~1020 wide (stern -458 .. bowsprit 560), mast tops at -800, keel at +80
  const HULL = 'M-455-300L-385-300L-372-190C-220-168 120-166 330-196L395-214L480-232L486-218L405-176C392-90 340 10 250 48C110 80-190 82-320 60C-400 44-440-70-458-180Z';
  const portsD = (y, h, x0 = -300, x1 = 300, step = 56) => { let d = ''; for (let x = x0; x <= x1; x += step) d += `M${x} ${y}h${h}v${h}h${-h}Z`; return d; };
  function side(D, o = {}) {
    if (o.ghost) {   // what is under the water: outline only
      D.s(HULL, { w: 2.5, color: C.inkSoft, alpha: 0.45 });
      D.s('M-450-20C-200 8 150 6 395-40', { w: 1.6, color: C.inkSoft, alpha: 0.3 });
      return;
    }
    D.f(HULL, C.paperLight, 1);
    D.f('M-455-300L-385-300L-372-190L-452-170Z', C.paper, 0.6);
    D.f(portsD(-58, 22) + portsD(-124, 20, -280, 290, 56), C.paperDark, 1);
    D.s(HULL, { w: 4 });
    D.s('M-450-20C-200 8 150 6 395-40M-445-86C-200-62 150-64 400-112M-440-150C-200-132 150-134 400-168', { w: 2, color: C.inkSoft });
    D.s(portsD(-58, 22) + portsD(-124, 20, -280, 290, 56), { w: 2, color: C.ink });
    if (o.rig !== false) {
      // masts, bowsprit
      D.s('M-300-195L-300-560M-40-175L-40-800M250-190L250-720M400-205L560-300', { w: 4 });
      // yards
      D.s('M-240-440L160-440M-180-690L100-690M110-420L390-420M150-640L350-640M-420-330L-200-560', { w: 3.5 });
      // sails: fore course, fore topsail, main topsail, mizzen lateen (the main course is furled, as on the day)
      const sails = 'M110-420L390-420C398-350 400-300 395-255C300-240 200-240 112-255C106-300 104-350 110-420Z' +
        'M150-640L350-640C362-570 366-510 362-450C290-438 210-438 140-450C136-510 140-570 150-640Z' +
        'M-180-690L100-690C112-610 116-540 112-480C30-466-90-466-200-480C-202-540-196-610-180-690Z' +
        'M-420-330L-200-560C-210-450-240-330-300-232C-350-262-390-296-420-330Z';
      D.f(sails, C.paperLight, 0.95);
      D.s(sails, { w: 3 });
      D.s('M-238-436C-120-424 40-424 158-436', { w: 7, color: C.inkSoft });   // furled main course
      // standing rigging
      D.s('M-40-800L380-205M250-720L560-300M-40-800L-300-560L-450-300M-300-560L-455-300' +
        'M-40-800L-110-185M-40-800L30-182M250-720L200-195M250-720L310-198M-300-560L-350-200M-300-560L-250-196', { w: 1.5, color: C.inkSoft, alpha: 0.8 });
    } else {
      D.s('M-300-195L-300-330M-40-175L-40-420M250-190L250-360M400-205L470-250', { w: 4 });   // stumps
    }
    // gilding: lion figurehead, stern carvings
    const gild = 'M420-200C440-242 470-252 490-236C480-222 456-212 432-190Z';
    D.f(gild, C.gold, o.gold ? 0.9 : 0.55);
    D.s('M-445-286L-395-286M-445-262L-392-262M-440-236L-390-236M-436-210L-388-210M-430-286L-430-200M-412-286L-410-200', { w: 2, color: C.gold, alpha: o.gold ? 1 : 0.6 });
  }
  // a pennant at the main top, waving slowly
  function pennant(g, x, y, s = 1) {
    const e = P0(g, '', C.inkSoft, 0.9);
    return { update(lt) { const a = 10 * Math.sin(lt * 1.1), b = 8 * Math.sin(lt * 1.1 + 1.2);
      e.setAttribute('d', `M${x} ${y}C${f1(x + 40 * s)} ${f1(y - 6 * s + a * s)} ${f1(x + 80 * s)} ${f1(y + 4 * s + b * s)} ${f1(x + 120 * s)} ${f1(y + 8 * s + b * s)}C${f1(x + 80 * s)} ${f1(y + 14 * s + b * s)} ${f1(x + 40 * s)} ${f1(y + 18 * s + a * s)} ${x} ${f1(y + 22 * s)}Z`); } };
  }

  // ------------------------------------------------------------------ shared scenery
  const bgFill = (g, col = C.paper) => P0(g, 'M-600-600L2520-600L2520 2400L-600 2400Z', col, 1);
  // a calm sea surface from y0 down: dark fill, horizon line and slowly drifting short strokes
  function sea(g, y0, seed, o = {}) {
    P0(g, `M-600 ${y0}L2520 ${y0}L2520 2400L-600 2400Z`, C.paperDark, 1);
    L0(g, `M-600 ${y0}L2520 ${y0}`, C.inkSoft, 2, 0.55);
    const r = rng(seed), rows = [];
    for (let i = 0; i < (o.n || 12); i++) {
      const y = y0 + 18 + Math.pow(i / (o.n || 12), 1.4) * (o.depth || 520), segs = [];
      for (let j = 0; j < 9; j++) segs.push({ x: r() * 2400 - 240, w: 30 + r() * 90 * (1 + i * 0.08), ph: r() * TAU });
      rows.push({ y, segs, sp: (o.sp || 6) * (0.6 + i * 0.12), e: L0(g, '', C.inkSoft, 1.6 + i * 0.08, 0.32) });
    }
    return { update(lt) { for (const q of rows) { let d = ''; for (const s of q.segs) { const x = ((s.x + lt * q.sp) % 2400 + 2400) % 2400 - 240, y = q.y + 2 * Math.sin(lt * 0.7 + s.ph);
      d += `M${f1(x)} ${f1(y)}c${f1(s.w * 0.3)} -4 ${f1(s.w * 0.7)} -4 ${f1(s.w)} 0`; } q.e.setAttribute('d', d); } } };
  }
  function bubbles(g, n, seed) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: el(g, 'circle', { r: 3 + r() * 6, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-opacity': 0 }), ph: r(), dx: (r() - 0.5) * 2, sp: 0.35 + r() * 0.3 });
    return { update(lt, x0, x1, y, h = 60, a = 1) { for (const b of list) { const p = (lt * b.sp + b.ph) % 1;
      b.e.setAttribute('cx', f1(lerp(x0, x1, (b.dx + 1) / 2) + 6 * Math.sin(lt * 1.3 + b.ph * 9))); b.e.setAttribute('cy', f1(y - p * h)); b.e.setAttribute('stroke-opacity', f1((1 - p) * 0.75 * a)); } } };
  }
  function snow(g, n, seed, box) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ x: box[0] + r() * (box[2] - box[0]), y: r(), sp: 0.012 + r() * 0.02, s: 1.2 + r() * 2.2, ph: r() * TAU });
    const e = P0(g, '', C.inkSoft, 0.6), hh = box[3] - box[1];
    return { update(lt) { let d = ''; for (const q of list) { const y = box[1] + ((q.y + lt * q.sp) % 1) * hh, x = q.x + 8 * Math.sin(lt * 0.3 + q.ph);
      d += `M${f1(x - q.s)} ${f1(y)}a${q.s} ${q.s} 0 1 0 ${f1(2 * q.s)} 0a${q.s} ${q.s} 0 1 0 ${f1(-2 * q.s)} 0`; } e.setAttribute('d', d); } };
  }
  // the ship as two layers: above the water (full) and below it (ghost outline), each clipped at the waterline y0
  function shipPair(defs, g, y0, o = {}) {
    const lo = el(g, 'g', { 'clip-path': clipRect(defs, -2000, y0, 6000, 4000) });
    const hi = el(g, 'g', { 'clip-path': clipRect(defs, -2000, -4000, 6000, 4000 + y0 + 1) });
    const tLo = el(lo, 'g'), tHi = el(hi, 'g');
    if (o.ghost !== false) { const Dg = BTL.drawing(tLo); side(Dg, { ghost: true }); Dg.reveal(1); }
    const D = BTL.drawing(tHi); side(D, o); D.reveal(1);
    const pn = o.rig === false ? null : pennant(tHi, -40, -800, 1);
    return { set(tr) { tLo.setAttribute('transform', tr); tHi.setAttribute('transform', tr); }, update(lt) { if (pn) pn.update(lt); } };
  }

  // ------------------------------------------------------------------ bt_vasa_ship
  SH.bt_vasa_ship = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'profile', HY = 640;
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: HY, ty: mode === 'hook' ? 930 : 1040, k: 1.5 });
      bgFill(g);
      BTL.glow(svg, defs, 960, HY - 200, 620, C.stain, mode === 'hook' ? 0.2 : 0.16, g);
      const st = BTL.stars(g, 70, 17, [300, -100, 1620, HY - 300]);
      const sl = sea(g, HY, 5, { n: 12, depth: 640 });
      const s = mode === 'hook' ? 0.56 : 0.52, cx = mode === 'hook' ? 900 : 934;
      if (mode === 'hook') {
        const sp = shipPair(defs, g, HY, {});
        const bb = bubbles(g, 10, 4), bb2 = bubbles(g, 6, 19);
        return {
          update(lt, dur, cues) {
            st.update(lt); sl.update(lt); sp.update(lt);
            const p = BTL.ease(lt, 0, Math.max(dur, 3) + 2), th = cue(cues, 'hit', dur * 0.7);
            const dy = 78 + 12 * p + 10 * BTL.ease(lt, th, 2.5);
            sp.set(`translate(${cx} ${f1(HY + dy)}) rotate(${f1(9.5 + 1.5 * p)}) scale(${s})`);
            bb.update(lt, cx - 60, cx + 250, HY + 4, 60, 1);
            bb2.update(lt + 0.37, cx - 260, cx + 40, HY + 4, 40, 0.7);
          },
        };
      }
      // profile: draws itself upright, the gilding lights up on hit
      const tw = el(g, 'g', { transform: `translate(${cx} ${HY + 6}) scale(${s})` });
      const D = BTL.drawing(tw); side(D, {});
      const G = BTL.drawing(tw); side(G, { gold: true, rig: true });
      // only the gilt strokes of G are wanted: hide everything else of G
      G.items.forEach((it, i) => { if (i < G.items.length - 2) it.e.setAttribute('display', 'none'); });
      const pn = pennant(tw, -40, -800, 1);
      P0(g, `M-600 ${HY + 2}L2520 ${HY + 2}L2520 2400L-600 2400Z`, C.paperDark, 1);   // water in front of the keel
      const sl2 = sea(g, HY + 2, 9, { n: 12, depth: 640 });
      return {
        update(lt, dur, cues) {
          st.update(lt); sl.update(lt); sl2.update(lt); pn.update(lt);
          D.reveal(BTL.ease(lt, 0, 2.6));
          const th = cue(cues, 'hit', dur * 0.55);
          G.reveal(BTL.ease(lt, th, 1.4));
          tw.setAttribute('transform', `translate(${f1(cx + 14 * BTL.ease(lt, 0, dur + 2))} ${HY + 6}) scale(${s})`);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the ship from the bow (origin = waterline centre)
  const FHULL = 'M-150-220C-185-170-198-90-192-30C-185 50-120 140 0 150C120 140 185 50 192-30C198-90 185-170 150-220Z';
  function front(D, o = {}) {
    if (o.ghost) { D.s(FHULL, { w: 2.5, color: C.inkSoft, alpha: 0.45 }); return; }
    D.f(FHULL, C.paperLight, 1);
    if (!o.cut) {
      D.s(FHULL, { w: 4 });
      D.s('M-190-40C-100-30 100-30 190-40M-196-108C-100-98 100-98 196-108M-180-170C-100-162 100-162 180-170', { w: 2, color: C.inkSoft });
      // open lower gun ports on both flanks
      D.f('M-196-62l14 0l2 24l-14 0ZM182-62l14 0l-2 24l-14 0Z', C.paperDark, 1);
    } else {
      // decks: hold floor, lower gun deck, upper gun deck
      D.s('M-180 60C-100 70 100 70 180 60M-194-40L194-40M-192-112L192-112', { w: 2.5, color: C.inkSoft });
      // cannons on both gun decks, muzzles out through the side
      const gun = (x, y, dir, k) => `M${x} ${y - 9 * k}L${x + dir * 92 * k} ${y - 6 * k}L${x + dir * 92 * k} ${y + 6 * k}L${x} ${y + 9 * k}Z`;
      const guns = gun(-118, -56, -1, 1) + gun(118, -56, 1, 1) + gun(-112, -128, -1, 0.85) + gun(112, -128, 1, 0.85);
      D.f(guns, C.inkSoft, 1); D.s(guns, { w: 2, color: C.ink });
      D.s('M-150-44L-110-44M110-44L150-44M-150-116L-112-116M112-116L150-116', { w: 3, color: C.ink });   // carriages
      // a little ballast in the bilge
      let st = ''; const r = rng(23);
      for (let i = 0; i < 9; i++) { const x = -70 + i * 17 + r() * 4, y = 108 + r() * 14, rr = 7 + r() * 5; st += BTL.E(x, y, rr, rr * 0.7); }
      D.f(st, C.paperDark, 1); D.s(st, { w: 1.6, color: C.inkSoft });
      D.s(FHULL, { w: 4 });
    }
    // mast, yards, square sails seen from ahead
    D.s('M0-220L0-720', { w: 4 });
    D.s('M-200-430L200-430M-150-650L150-650', { w: 3.5 });
    if (!o.cut) {
      const sl = 'M-200-430L200-430C206-360 208-300 204-250L-204-250C-208-300-206-360-200-430Z' +
        'M-150-650L150-650C156-590 158-530 154-470L-154-470C-158-530-156-590-150-650Z';
      D.f(sl, C.paperLight, 0.95); D.s(sl, { w: 3 });
    }
    D.s('M0-720L-150-222M0-720L150-222M0-650L-170-200M0-650L170-200', { w: 1.5, color: C.inkSoft, alpha: o.cut ? 0.4 : 0.8 });
  }

  SH.bt_vasa_front = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'section', portrait = H > W, g = el(svg, 'g');
      const s = portrait ? 0.98 : 0.74, cx = W / 2, HY = portrait ? 990 : 700;
      P0(g, `M-100-100L${W + 100}-100L${W + 100} ${H + 100}L-100 ${H + 100}Z`, C.paper, 1);
      BTL.glow(svg, defs, cx, HY - 260 * s, 560, C.stain, 0.16, g);
      const st = BTL.stars(g, 60, 31, [40, 40, W - 40, HY - 760 * s]);
      // the sea
      P0(g, `M-100 ${HY}L${W + 100} ${HY}L${W + 100} ${H + 100}L-100 ${H + 100}Z`, C.paperDark, 1);
      L0(g, `M-100 ${HY}L${W + 100} ${HY}`, C.inkSoft, 2, 0.6);
      const r = rng(7), waves = [];
      for (let i = 0; i < 10; i++) waves.push({ y: HY + 22 + i * i * 7, x: r() * W, w: 40 + r() * 80, ph: r() * TAU, e: L0(g, '', C.inkSoft, 1.8, 0.3) });
      const waveUp = (lt, amp = 1) => { for (const q of waves) { let d = ''; for (let k = -1; k < 4; k++) { const x = ((q.x + k * W / 3 + lt * 10) % (W + 200)) - 100, y = q.y + 2 * amp * Math.sin(lt + q.ph);
        d += `M${f1(x)} ${f1(y)}c${f1(q.w * 0.3)} ${f1(-4 * amp)} ${f1(q.w * 0.7)} ${f1(-4 * amp)} ${f1(q.w)} 0`; } q.e.setAttribute('d', d); } };
      if (mode === 'section') {
        const t = el(g, 'g', { transform: `translate(${cx} ${HY}) scale(${s})` });
        const D = BTL.drawing(t); front(D, { cut: true });
        // the waterline through the cut hull
        L0(t, 'M-260 0L260 0', C.blue, 2.5, 0.8, { 'stroke-dasharray': '14 12' });
        const cg = el(g, 'g', { opacity: 0 });
        L0(cg, BTL.E(0, 0, 22, 22), C.gold, 4);
        P0(cg, 'M0-22A22 22 0 0 1 22 0L0 0ZM0 22A22 22 0 0 1-22 0L0 0Z', C.gold, 1);
        const lead = L0(g, '', C.gold, 2, 0.8);
        const lab = ital(g, 'ağırlık', cx + 222 * s, HY - 310 * s, portrait ? 54 : 46, { color: C.gold, anchor: 'start' });
        const lab2 = ital(g, 'merkezi', cx + 222 * s, HY - 310 * s + 60, portrait ? 54 : 46, { color: C.gold, anchor: 'start' });
        return {
          update(lt, dur, cues) {
            st.update(lt); waveUp(lt);
            D.reveal(BTL.ease(lt, 0, 1.6));
            const th = cue(cues, 'hit', dur * 0.55), q = BTL.ease(lt, th - 0.9, 1.6);
            const y = HY + s * lerp(40, -78, q);
            cg.setAttribute('transform', `translate(${cx} ${f1(y)})`); fade(cg, BTL.ease(lt, 0.6, 0.8));
            const lx = cx + 222 * s, ly = HY - 310 * s;
            lead.setAttribute('d', `M${f1(cx + 26)} ${f1(y - 14)}L${f1(lx - 12)} ${f1(ly + 44)}`); fade(lead, BTL.ease(lt, 1.0, 0.8));
            fade(lab, BTL.ease(lt, 1.0, 0.8)); fade(lab2, BTL.ease(lt, 1.0, 0.8));
          },
        };
      }
      // heel: wind from the left, the ship heels to the right on hit; the hull below the water is a ghost line
      const lo = el(g, 'g', { 'clip-path': clipRect(defs, -100, HY, W + 200, H) });
      const hi = el(g, 'g', { 'clip-path': clipRect(defs, -100, -100, W + 200, HY + 101) });
      const tLo = el(lo, 'g'), tHi = el(hi, 'g');
      const Dg = BTL.drawing(tLo); front(Dg, { ghost: true }); Dg.reveal(1);
      const D = BTL.drawing(tHi); front(D, {}); D.reveal(1);
      const wr = rng(41), wind = [];
      for (let i = 0; i < 9; i++) wind.push({ y: HY - 760 * s + wr() * 620 * s, ph: wr(), w: 120 + wr() * 160, e: L0(g, '', C.inkSoft, 2.2, 0) });
      return {
        update(lt, dur, cues) {
          st.update(lt); waveUp(lt, 1.5);
          const th = cue(cues, 'hit', dur * 0.6);
          const a = 5 * BTL.ease(lt, 0, dur) + 13 * BTL.ease(lt, th - 1.0, 2.2);
          const tr = `translate(${cx} ${HY}) rotate(${f1(a)}) scale(${s})`;
          tLo.setAttribute('transform', tr); tHi.setAttribute('transform', tr);
          const gust = 0.35 + 0.65 * BTL.ease(lt, th - 0.8, 1);
          for (const q of wind) { const p = (lt * 0.45 + q.ph) % 1, x = -200 + p * (W + 400);
            q.e.setAttribute('d', `M${f1(x)} ${f1(q.y)}c${f1(q.w * 0.4)} -6 ${f1(q.w * 0.7)} 4 ${f1(q.w)} -2`);
            q.e.setAttribute('stroke-opacity', f1(Math.sin(p * Math.PI) * 0.55 * gust)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vasa_port: the sea pours in through a gun port
  SH.bt_vasa_port = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 540, ty: 640, k: 1.5 });
      bgFill(g, C.paperLight);
      // planking of the hull side
      let pl = ''; for (let y = -40; y <= 1500; y += 46) pl += `M-600 ${y}C300 ${y + 6} 1600 ${y + 6} 2520 ${y}`;
      L0(g, pl, C.inkSoft, 1.8, 0.55);
      let bu = ''; const r = rng(3); for (let y = -40, i = 0; y <= 1500; y += 46, i++) for (let k = 0; k < 4; k++) { const x = 300 + ((i * 337 + k * 420 + r() * 60) % 1400); bu += `M${f1(x)} ${y}l0 46`; }
      L0(g, bu, C.inkSoft, 1.4, 0.35);
      L0(g, 'M-600 300C300 312 1600 312 2520 300M-600 330C300 342 1600 342 2520 330', C.ink, 3, 0.8);   // wale
      // the port: dark opening, open lid hinged above it
      const px = 960, py = 520, pw = 230, ph = 210;
      P0(g, `M${px - pw / 2 - 16} ${py - ph / 2 - 16}h${pw + 32}v${ph + 32}h${-pw - 32}Z`, C.paper, 1);
      L0(g, `M${px - pw / 2 - 16} ${py - ph / 2 - 16}h${pw + 32}v${ph + 32}h${-pw - 32}Z`, C.ink, 3.5);
      P0(g, `M${px - pw / 2} ${py - ph / 2}h${pw}v${ph}h${-pw}Z`, C.paperDark, 1);
      L0(g, `M${px - pw / 2} ${py - ph / 2}h${pw}v${ph}h${-pw}Z`, C.ink, 3);
      // the cannon muzzle inside, in shadow
      L0(g, BTL.E(px, py + 10, 46, 46), C.inkSoft, 3, 0.7); L0(g, BTL.E(px, py + 10, 26, 26), C.inkSoft, 2, 0.5);
      const lid = `M${px - pw / 2 - 10} ${py - ph / 2 - 30}L${px + pw / 2 + 10} ${py - ph / 2 - 30}L${px + pw / 2 + 40} ${py - ph / 2 - 250}L${px - pw / 2 - 40} ${py - ph / 2 - 250}Z`;
      P0(g, lid, C.paper, 1); L0(g, lid, C.ink, 3.5);
      L0(g, `M${px - 60} ${py - ph / 2 - 40}L${px - 74} ${py - ph / 2 - 236}M${px + 60} ${py - ph / 2 - 40}L${px + 74} ${py - ph / 2 - 236}`, C.gold, 3, 0.9);   // iron straps
      L0(g, `M${px - pw / 2 - 10} ${py - ph / 2 - 26}L${px + pw / 2 + 10} ${py - ph / 2 - 26}`, C.gold, 4);   // hinge
      // the rising sea in front of the hull, and the water pouring over the sill
      const sill = py + ph / 2;
      const water = P0(g, '', C.paperDark, 1), crest = L0(g, '', C.blue, 3, 0.9);
      const pour = [0, 1, 2, 3, 4].map(i => ({ e: L0(g, '', C.blue, 3 - i * 0.2, 0), i }));
      const sl = el(g, 'g'), lines = [];
      for (let i = 0; i < 9; i++) lines.push({ e: L0(sl, '', C.inkSoft, 1.8, 0.35), dy: 30 + i * i * 9, ph: i * 1.3 });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.65);
          const q = BTL.ease(lt, 0, th + 0.4);
          const lvl = lerp(sill + 150, sill - 30, q) + 6 * Math.sin(lt * 1.2);
          let top = '';
          for (let x = -600; x <= 2520; x += 60) top += (x === -600 ? 'M' : 'L') + x + ' ' + f1(lvl + 7 * Math.sin(x / 120 + lt * 1.1));
          water.setAttribute('d', top + 'L2520 2400L-600 2400Z'); crest.setAttribute('d', top);
          for (const l of lines) { const y = lvl + l.dy; let d = ''; for (let k = 0; k < 8; k++) { const x = ((k * 330 + lt * 14 + l.ph * 90) % 2700) - 400; d += `M${f1(x)} ${f1(y)}c30 -5 70 -5 100 0`; } l.e.setAttribute('d', d); }
          const over = clamp01((sill - lvl + 8) / 30);
          for (const p of pour) {   // sheets of water curling in over the sill
            const x0 = px - pw / 2 + 20 + p.i * (pw - 40) / 4, ph2 = (lt * 0.9 + p.i * 0.23) % 1;
            p.e.setAttribute('d', `M${f1(x0)} ${f1(sill - 4)}C${f1(x0 + 6)} ${f1(sill - 40 - 20 * ph2)} ${f1(x0 + 18)} ${f1(sill - 70 - 20 * ph2)} ${f1(x0 + 30)} ${f1(sill - 90 - 10 * ph2)}`);
            p.e.setAttribute('stroke-opacity', f1(over * (0.5 + 0.4 * Math.sin(ph2 * Math.PI))));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vasa_harbor
  function skyline(g, base) {
    // Stadsholmen in the 1620s: the Tre Kronor castle with its tall spire, the great church, gabled houses
    const d = `M470 ${base}L470 ${base - 40}L560 ${base - 44}L560 ${base - 120}L640 ${base - 120}L640 ${base - 200}L652 ${base - 214}L664 ${base - 290}L676 ${base - 214}L688 ${base - 200}L688 ${base - 120}L770 ${base - 120}L770 ${base - 80}` +
      `L800 ${base - 80}L800 ${base - 104}L815 ${base - 124}L830 ${base - 104}L830 ${base - 86}L855 ${base - 86}L855 ${base - 190}L866 ${base - 190}L874 ${base - 250}L882 ${base - 190}L893 ${base - 190}L893 ${base - 90}` +
      `L920 ${base - 90}L920 ${base - 112}L936 ${base - 132}L952 ${base - 112}L952 ${base - 70}L985 ${base - 70}L985 ${base - 96}L1000 ${base - 114}L1015 ${base - 96}L1015 ${base - 60}L1060 ${base - 56}L1090 ${base}Z`;
    P0(g, d, C.paperLight, 1); L0(g, d, C.inkSoft, 2.2, 0.9);
    L0(g, `M664 ${base - 290}L664 ${base - 312}M656 ${base - 304}L672 ${base - 304}`, C.gold, 2.5, 0.9);   // the crowns on the spire
    let w = ''; for (const [x, y] of [[590, 90], [620, 90], [710, 90], [740, 90], [820, 60], [940, 60], [1000, 40]]) w += `M${x} ${base - y}h8v12h-8Z`;
    P0(g, w, C.gold, 0.5);
  }
  SH.bt_vasa_harbor = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'date', portrait = H > W;
      if (mode === 'date') {
        const HY = 700;
        const { g } = BTL.stage(svg, W, H, { fx: 960, fy: HY, ty: 1000, k: 1.15 });
        bgFill(g);
        BTL.glow(svg, defs, 1260, HY - 120, 520, C.stain, 0.18, g);
        const st = BTL.stars(g, 60, 9, [420, 120, 1500, HY - 340]);
        skyline(g, HY);
        const sl = sea(g, HY, 13, { n: 12, depth: 700 });
        const sh = el(g, 'g'); const D = BTL.drawing(sh); side(D, {}); D.reveal(1);
        const pn = pennant(sh, -40, -800, 1);
        // reflections of the skyline lights
        const refl = L0(g, '', C.gold, 2, 0.35);
        const big = label(svg, P.text || '1628', W / 2, portrait ? 380 : 230, portrait ? 190 : 150, { color: C.ink, weight: 300, anchor: 'middle' });
        const sub = P.sub ? ital(svg, P.sub, W / 2, portrait ? 480 : 310, portrait ? 62 : 50, { anchor: 'middle', color: C.ink }) : null;
        return {
          update(lt, dur) {
            st.update(lt); sl.update(lt); pn.update(lt);
            const p = BTL.ease(lt, 0, dur + 2);
            sh.setAttribute('transform', `translate(${f1(1250 + 50 * p)} ${HY + 4}) scale(0.3)`);
            let d = ''; for (const x of [594, 624, 714, 744, 824, 944, 1004]) d += `M${x - 6 + 3 * Math.sin(lt + x)} ${HY + 30}l12 0M${x - 3} ${HY + 52 + 2 * Math.sin(lt * 1.3 + x)}l6 0`;
            refl.setAttribute('d', d);
            fade(big, BTL.ease(lt, 0.2, 1.2)); fade(sub, BTL.ease(lt, 0.8, 1.2));
          },
        };
      }
      // watch: people on the quay in the foreground, the ship goes down in the middle of the harbour
      const HY = 620, Q = 858;
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: HY, ty: 880, k: 1.3 });
      bgFill(g);
      BTL.glow(svg, defs, 960, HY - 120, 560, C.stain, 0.2, g);
      const st = BTL.stars(g, 50, 21, [400, 0, 1520, HY - 380]);
      // the far shore, low
      const fs = `M300 ${HY}L300 ${HY - 26}L420 ${HY - 30}L440 ${HY - 52}L470 ${HY - 30}L620 ${HY - 34}L640 ${HY - 80}L652 ${HY - 34}L1250 ${HY - 30}L1270 ${HY - 60}L1290 ${HY - 30}L1640 ${HY - 24}L1640 ${HY}Z`;
      P0(g, fs, C.paperLight, 0.9); L0(g, fs, C.inkSoft, 1.6, 0.7);
      const sl = sea(g, HY, 17, { n: 10, depth: 260 });
      const sp = shipPair(defs, g, HY, { ghost: false });
      const bb = bubbles(g, 11, 8);
      // the quay
      P0(g, `M-600 ${Q}L2520 ${Q}L2520 2400L-600 2400Z`, C.paperLight, 1);
      L0(g, `M-600 ${Q}L2520 ${Q}M-600 ${Q + 16}L2520 ${Q + 16}`, C.inkSoft, 2, 0.8);
      let stn = ''; for (let y = Q + 16, i = 0; y < 1500; y += 52, i++) { stn += `M-600 ${y}L2520 ${y}`; for (let x = -600 + (i % 2) * 70; x < 2520; x += 140) stn += `M${x} ${y}l0 52`; }
      L0(g, stn, C.inkSoft, 1, 0.08);
      for (const [x, h, f, pose] of [[584, 140, 1, 'stand'], [626, 128, 1, 'stand'], [1276, 136, -1, 'stand'], [1312, 116, -1, 'stand'], [1346, 132, -1, 'stand']])
        BTL.person(g, pose, x, Q + 4, h, { face: f, color: C.paper, rim: C.inkSoft });
      return {
        update(lt, dur, cues) {
          st.update(lt); sl.update(lt); sp.update(lt);
          const th = cue(cues, 'hit', dur * 0.6);
          const q = 0.55 * BTL.ease(lt, 0, dur) + 0.45 * BTL.ease(lt, th - 0.5, 1.4);
          sp.set(`translate(960 ${f1(HY + 30 + 330 * q)}) rotate(${f1(4 + 6 * q)}) scale(0.5)`);
          bb.update(lt, 760, 1140, HY + 4, 46, 0.3 + q);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vasa_deep: on the sea floor, then up
  SH.bt_vasa_deep = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'kept', FY = 860;
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: FY, ty: 1150, k: 1.5 });
      bgFill(g);
      const rays = [700, 900, 1120].map((x, i) => ({ e: P0(g, `M${x - 40} -400L${x + 40} -400L${x + 200 + i * 20} 900L${x + 30 + i * 20} 900Z`, C.stain, 0.06), i }));
      const sky = BTL.glow(svg, defs, 960, -100, 700, C.stain, 0.1, g);
      const sn = snow(g, 60, 12, [520, 200, 1400, 1000]);
      // sea floor
      let top = ''; for (let x = -600; x <= 2520; x += 40) top += (x === -600 ? 'M' : 'L') + x + ' ' + f1(FY + 8 * Math.sin(x / 150 + 1));
      P0(g, top + 'L2520 2400L-600 2400Z', C.paperLight, 1); L0(g, top, C.inkSoft, 2.4);
      let rip = ''; const r = rng(77); for (let i = 0; i < 40; i++) { const x = 400 + r() * 1120, y = FY + 30 + r() * 300, w = 30 + r() * 60; rip += `M${f1(x)} ${f1(y)}c${f1(w * 0.3)} -6 ${f1(w * 0.7)} -6 ${f1(w)} 0`; }
      L0(g, rip, C.inkSoft, 1.5, 0.4);
      const hw = el(g, 'g');
      const D = BTL.drawing(hw); side(D, { rig: false }); D.reveal(1);
      const gold = L0(hw, HULL, C.gold, 5, 1, { pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });
      const pool = BTL.glow(svg, defs, 960, FY - 120, 420, C.gold, 0, g);
      const sand = el(g, 'g'), grains = [];
      const r2 = rng(5); for (let i = 0; i < 26; i++) grains.push({ e: el(sand, 'circle', { r: 2 + r2() * 3, fill: C.inkSoft, 'fill-opacity': 0 }), x: -380 + r2() * 760, ph: r2() });
      // the silt in front of the keel, drawn over the hull so it seems half buried
      const yrs = mode === 'years', portrait = H > W;
      const num = yrs ? label(svg, '0', W / 2, portrait ? 520 : 300, portrait ? 260 : 200, { color: C.gold, weight: 300, anchor: 'middle' }) : null;
      const unit = yrs ? ital(svg, P.label || 'yıl', W / 2, portrait ? 610 : 370, portrait ? 66 : 54, { color: C.ink, anchor: 'middle' }) : null;
      const silt = P0(g, `M500 ${FY + 20}C700 ${FY - 6} 1200 ${FY - 8} 1420 ${FY + 18}L1420 ${FY + 60}L500 ${FY + 60}Z`, C.paperLight, 1);
      return {
        update(lt, dur, cues) {
          sn.update(lt);
          rays.forEach(q => q.e.setAttribute('fill-opacity', (0.05 + 0.025 * Math.sin(lt * 0.45 + q.i * 1.7)).toFixed(3)));
          if (yrs) {
            hw.setAttribute('transform', `translate(960 ${FY - 30}) rotate(3) scale(0.56)`);
            num.textContent = String(Math.round((P.total || 333) * BTL.ease(lt, 0.15, 1.3)));
            fade(num, BTL.ease(lt, 0, 0.5)); fade(unit, BTL.ease(lt, 0.5, 0.8));
            return;
          }
          if (mode === 'kept') {
            hw.setAttribute('transform', `translate(960 ${FY - 36}) rotate(3) scale(${f1(0.62 + 0.01 * BTL.ease(lt, 0, dur))})`);
            const th = cue(cues, 'hit', dur * 0.6), q = BTL.ease(lt, th - 0.9, 1.6);
            gold.setAttribute('stroke-dashoffset', f1(1 - q)); gold.setAttribute('stroke-opacity', f1(0.2 + 0.8 * q));
            pool.set(0.12 * q);
            return;
          }
          // rise: lifted slowly towards the light, sand falls from the keel
          const p = BTL.ease(lt, 0.3, Math.max(dur, 3) + 1.5);
          const y = FY - 36 - 220 * p;
          hw.setAttribute('transform', `translate(960 ${f1(y)}) rotate(${f1(3 - 2 * p)}) scale(0.62)`);
          silt.setAttribute('fill-opacity', '1');
          gold.setAttribute('stroke-dashoffset', '0'); gold.setAttribute('stroke-opacity', f1(0.25 + 0.2 * p));
          sky.set(0.1 + 0.12 * p);
          for (const s of grains) { const k = (lt * 0.5 + s.ph) % 1;
            s.e.setAttribute('cx', f1(960 + s.x * 0.62)); s.e.setAttribute('cy', f1(y + 50 + k * (FY - y))); s.e.setAttribute('fill-opacity', f1((1 - k) * 0.7 * clamp01(p * 4))); }
        },
      };
    },
  };
  // bt_vasa_years: the hull on the sea floor under a big year counter (shares bt_vasa_deep's drawing)  P: {total, label}
  SH.bt_vasa_years = { kind: '2d', build(a) { return SH.bt_vasa_deep.build(Object.assign({}, a, { P: Object.assign({}, a.P, { mode: 'years' }) })); } };
})();
