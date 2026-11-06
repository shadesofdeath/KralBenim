// bt_gordion: Gordion and the Great Tumulus (Tumulus MM, "Midas Mound", opened 1957), belgesel style (docs/BELGESEL.md).
// Still line art in the theme's tokens; the only motion is slow and natural (a lamp, a torch beam, steam, embers,
// falling pebbles, light). Places are drawn on the 1920x1080 stage (BTL.stage frames them for a Short).
//   bt_gd_mound   P: {mode: "dusk"|"night"|"dawn"|"field"|"small"|"dims", label, sub}  cues: hit (label / glow),
//                 h, w, c (dims: height line, width line, centre mark)   the great mound on the steppe
//   bt_gd_section P: {mode: "drill"|"stone"|"glow"}  cues: hit   cross-section of the mound: borings, stone pile, chamber
//   bt_gd_tunnel  P: {mode: "dig"|"stones", label}  cues: hit   a timbered tunnel in perspective / its stone wall end
//   bt_gd_wall    P: {mode: "logs"|"window"|"double"|"auger"}  cues: hole, hit   the log wall of the tomb
//   bt_gd_scan    P: {mode: "reveal"|"empty"}  cues: a, b, c   a torch beam in the dark chamber
//   bt_gd_room    P: {mode: "build"|"coffin", label}  cues: hit   the log chamber cut open / the open log coffin
//   bt_gd_king    P: {mode: "wish"|"real"|"ask"|"gold"}  cues: hit   a faceless crowned silhouette
//   bt_gd_touch   cues: a, b   a loaf and a cup turn to gold
//   bt_gd_fibula  P: {n: 182, label}  cues: hit   one bronze fibula + a number
//   bt_gd_cauldron P: {mode: "still"|"stew", label}  cues: hit   a bronze cauldron on an iron tripod
//   bt_gd_table   P: {label}   the inlaid wooden table
//   bt_gd_rings   P: {mode: "grow"|"date", label}  cues: hit   a log cross-section, tree rings
//   bt_gd_tablet  P: {label}  cues: hit   an Assyrian clay tablet with cuneiform
//   bt_gd_years   cues: a, b   a time line 760-690 BC: the tomb (740) and Mita still alive (709)
//   bt_gd_vessel  P: {label}  cues: hit   a jar in section, residue at the bottom
//   bt_gd_bowl    P: {mode: "mix"|"many"}  cues: a, b, c, hit   omphalos bowl + wine/beer/honey / a hundred bowls
//   bt_gd_layer   P: {mode: "fire"|"date", label}  cues: hit   a soil profile with a burnt layer
//   bt_gd_knot    P: {mode: "knot"|"cut"}  cues: hit, pin   the yoke knot on the wagon pole
//   bt_gd_cloth   P: {label}  cues: hit   the open coffin under a cloth with a golden sheen
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1) => el(p, 'path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const LD = (p, d, stroke, w = 3, a = 1) => { const e = L0(p, d, stroke, w, a); e.setAttribute('pathLength', 1); draw(e, 0); return e; };
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const ital = (g, s, x, y, size = 46, o = {}) => label(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft }, o));
  const rect = (x0, y0, x1, y1) => `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`;
  const dome = (cx, base, w, h) => `M${f1(cx - w / 2)} ${base}C${f1(cx - w * 0.3)} ${base} ${f1(cx - w * 0.2)} ${f1(base - h)} ${cx} ${f1(base - h)}` +
    `C${f1(cx + w * 0.2)} ${f1(base - h)} ${f1(cx + w * 0.3)} ${base} ${f1(cx + w / 2)} ${base}Z`;
  const domeY = (cx, base, w, h, x) => {   // approx. top of the dome at x
    const u = Math.min(1, Math.abs(x - cx) / (w / 2));
    return base - h * Math.pow(Math.cos(u * Math.PI / 2), 1.3);
  };

  // steppe ground with a horizon line; fills run on to 1800 for a vertical frame
  function steppe(g, y) {
    P0(g, `M-200 ${y}C400 ${y - 8} 900 ${y + 6} 1400 ${y - 4}C1700 ${y - 8} 1900 ${y} 2120 ${y}L2120 1800L-200 1800Z`, C.paperLight, 0.55);
    L0(g, `M-200 ${y}C400 ${y - 8} 900 ${y + 6} 1400 ${y - 4}C1700 ${y - 8} 1900 ${y} 2120 ${y}`, C.inkSoft, 2, 0.8);
    const r = rng(y * 7 + 3); let d = '';
    for (let i = 0; i < 60; i++) { const x = r() * 1920, yy = y + 30 + r() * 260, h = 8 + r() * 12; d += `M${f1(x)} ${f1(yy)}l-3 ${f1(-h)}M${f1(x)} ${f1(yy)}l4 ${f1(-h * 0.8)}`; }
    L0(g, d, C.inkSoft, 1.5, 0.45);
  }
  // a lamp flame (three nested tongues that breathe), origin = wick
  function flame(parent, x, y, s = 1) {
    const g = el(parent, 'g');
    const fl = [[C.red, 1, 0], [C.gold, 0.7, 1.1], [C.paperLight, 0.4, 2.3]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.95), k, ph }));
    return {
      update(lt) {
        for (const f of fl) {
          const h = (54 + 5 * Math.sin(lt * 2.1 + f.ph) + 3 * Math.sin(lt * 3.3 + f.ph * 2)) * f.k * s, w = 14 * f.k * s, ln = 3 * Math.sin(lt * 1.2 + f.ph) * s;
          f.e.setAttribute('d', `M${f1(x - w)} ${f1(y)}C${f1(x - w)} ${f1(y - h * 0.4)} ${f1(x - w * 0.2 + ln)} ${f1(y - h * 0.7)} ${f1(x + ln)} ${f1(y - h)}` +
            `C${f1(x + w * 0.2 + ln)} ${f1(y - h * 0.7)} ${f1(x + w)} ${f1(y - h * 0.4)} ${f1(x + w)} ${f1(y)}C${f1(x + w)} ${f1(y + w)} ${f1(x - w)} ${f1(y + w)} ${f1(x - w)} ${f1(y)}Z`);
        }
      },
    };
  }
  // a horizontal log: rounded ends, a few grain lines
  function logD(x0, x1, y, r, seed) {
    const rr = rng(seed); let grain = '';
    for (let k = 0; k < 3; k++) { const yy = y - r * 0.5 + k * r * 0.5 + (rr() - 0.5) * 6, a = x0 + 30 + rr() * 80, b = x1 - 30 - rr() * 80; grain += `M${f1(a)} ${f1(yy)}C${f1((a + b) / 2)} ${f1(yy + (rr() - 0.5) * 8)} ${f1((a + b) / 2 + 40)} ${f1(yy)} ${f1(b)} ${f1(yy)}`; }
    const body = `M${x0 + r * 0.4} ${y - r}L${x1 - r * 0.4} ${y - r}C${x1 + r * 0.2} ${y - r} ${x1 + r * 0.2} ${y + r} ${x1 - r * 0.4} ${y + r}L${x0 + r * 0.4} ${y + r}C${x0 - r * 0.2} ${y + r} ${x0 - r * 0.2} ${y - r} ${x0 + r * 0.4} ${y - r}Z`;
    return { body, grain };
  }
  function logWall(g, x0, x1, y0, y1, r, seed, alpha = 1) {
    const D = BTL.drawing(g);
    let i = 0;
    for (let y = y0 + r; y <= y1 - r + 1; y += 2 * r + 4, i++) {
      const off = (i % 2) * 40, L = logD(x0 - off, x1 + off, y, r, seed + i * 13);
      D.f(L.body, C.paperLight, alpha);
      D.s(L.body, { w: 3, color: C.ink });
      D.s(L.grain, { w: 1.6, color: C.inkSoft, alpha: 0.7 });
    }
    return D;
  }
  // a rough stone pile as a cluster of irregular stones inside a dome-ish region
  function stones(cx, cy, rx, ry, n, seed, sz = 18) {
    const r = rng(seed); let d = '';
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, k = Math.sqrt(r()), x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      if (y > cy + ry * 0.2 && ry > 0) continue;
      const s = sz * (0.6 + r() * 0.7), m = 6, pts = [];
      for (let j = 0; j < m; j++) { const b = j / m * Math.PI * 2, q = s * (0.75 + r() * 0.4); pts.push([x + Math.cos(b) * q, y + Math.sin(b) * q * 0.75]); }
      d += 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
    }
    return d;
  }
  // the open log coffin seen from the side (origin = centre of the top edge), with faint bone lines
  function coffin(g, x, y, s = 1, bones = true) {
    const X = v => f1(x + v * s), Y = v => f1(y + v * s);
    const D = BTL.drawing(el(g, 'g'));
    const body = `M${X(-380)} ${Y(0)}L${X(380)} ${Y(0)}C${X(392)} ${Y(60)} ${X(370)} ${Y(118)} ${X(330)} ${Y(126)}L${X(-330)} ${Y(126)}C${X(-370)} ${Y(118)} ${X(-392)} ${Y(60)} ${X(-380)} ${Y(0)}Z`;
    D.f(body, C.paperLight, 1);
    D.f(BTL.E(x, y, 380 * s, 22 * s), C.paperDark, 1);
    D.s(body, { w: 3.5 });
    D.s(BTL.E(x, y, 380 * s, 22 * s), { w: 2.5, color: C.inkSoft });
    D.s(`M${X(-340)} ${Y(50)}C${X(-100)} ${Y(56)} ${X(100)} ${Y(46)} ${X(330)} ${Y(54)}M${X(-320)} ${Y(92)}C${X(-60)} ${Y(98)} ${X(120)} ${Y(88)} ${X(310)} ${Y(94)}`, { w: 1.6, color: C.inkSoft, alpha: 0.7 });
    // four corner posts (the "four-poster" bed of the first report)
    D.s(`M${X(-360)} ${Y(126)}L${X(-360)} ${Y(170)}M${X(360)} ${Y(126)}L${X(360)} ${Y(170)}`, { w: 4 });
    let bone = null;
    if (bones) {
      bone = el(g, 'g', { opacity: 0, transform: `translate(0 ${f1(-26 * s)})` });
      // skull at the east (right) end, ribs, pelvis, the long bones of arms and legs: quiet but clear lines
      const sk = `M${X(318)} ${Y(-40)}C${X(352)} ${Y(-40)} ${X(366)} ${Y(-20)} ${X(360)} ${Y(-2)}L${X(342)} ${Y(4)}L${X(330)} ${Y(14)}L${X(300)} ${Y(12)}C${X(282)} ${Y(4)} ${X(280)} ${Y(-36)} ${X(318)} ${Y(-40)}Z`;
      P0(bone, sk, C.paperLight, 1); L0(bone, sk, C.ink, 3);
      L0(bone, BTL.E(x + 336 * s, y - 18 * s, 7 * s, 7 * s), C.ink, 2.4);
      L0(bone, `M${X(282)} ${Y(-6)}L${X(70)} ${Y(-6)}`, C.ink, 3);   // spine
      let ribs = ''; for (let i = 0; i < 7; i++) { const xx = 250 - i * 26; ribs += `M${X(xx)} ${Y(-6)}C${X(xx - 6)} ${Y(-26)} ${X(xx - 14)} ${Y(-30)} ${X(xx - 20)} ${Y(-28)}`; }
      L0(bone, ribs, C.ink, 2.4);
      L0(bone, BTL.E(x + 50 * s, y - 8 * s, 30 * s, 18 * s), C.ink, 2.6);   // pelvis
      L0(bone, `M${X(20)} ${Y(-14)}L${X(-150)} ${Y(-18)}M${X(20)} ${Y(-2)}L${X(-150)} ${Y(2)}M${X(-150)} ${Y(-18)}L${X(-320)} ${Y(-20)}M${X(-150)} ${Y(2)}L${X(-320)} ${Y(0)}`, C.ink, 3.2);   // legs
      L0(bone, BTL.E(x - 150 * s, y - 18 * s, 7 * s, 6 * s) + BTL.E(x - 150 * s, y + 2 * s, 7 * s, 6 * s), C.ink, 2.4);   // knees
      L0(bone, `M${X(250)} ${Y(-14)}L${X(150)} ${Y(-2)}L${X(60)} ${Y(4)}M${X(250)} ${Y(0)}L${X(150)} ${Y(10)}L${X(60)} ${Y(12)}`, C.inkSoft, 2.6);   // arms
    }
    return { D, bone };
  }

  // ------------------------------------------------------------------ bt_gd_mound
  SH.bt_gd_mound = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'dusk';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      if (mode === 'field') {
        const hy = 640;
        const gl = BTL.glow(svg, defs, 1260, 560, 760, C.stain, 0.12, g);
        steppe(g, hy);
        const r = rng(77), list = [];
        const spots = [[220, 90, 30], [380, 150, 44], [520, 70, 22], [660, 180, 52], [820, 110, 34], [1000, 140, 40], [1260, 620, 230], [1540, 160, 46], [1700, 90, 28], [1820, 130, 36], [140, 60, 18], [930, 60, 16]];
        spots.forEach(([x, w, h], i) => {
          const d = dome(x, hy + 2, w * 1.8, h * 1.5), pg = el(g, 'g', { opacity: 0 });
          P0(pg, d, C.paperLight, 1); L0(pg, d.slice(0, -1), i === 6 ? C.ink : C.inkSoft, i === 6 ? 3.5 : 2.5);
          list.push({ pg, t: 0.3 + (x / 1920) * 2.4 + r() * 0.2, big: i === 6 });
        });
        const lab = P.label ? ital(g, P.label, 1260, 790, 50, { color: C.ink }) : null;
        return {
          update(lt, dur, cues) {
            for (const m of list) fade(m.pg, BTL.ease(lt, m.big ? cue(cues, 'hit', m.t) : m.t, 1.4));
            gl.set(0.1 + 0.04 * BTL.ease(lt, 0, dur));
            if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', 2.4) + 0.5, 1.2));
          },
        };
      }
      if (mode === 'small') {
        // a smaller mound cut in section: a small wooden chamber under it takes a warm light
        const base = 760;
        steppe(g, base);
        P0(g, dome(960, base, 1300, 330), C.paperLight, 1);
        L0(g, dome(960, base, 1300, 330).slice(0, -1), C.ink, 3.5);
        let strata = ''; for (let k = 1; k < 4; k++) strata += dome(960, base, 1300 - k * 260, 330 - k * 70).slice(0, -1).replace('Z', '');
        L0(g, strata, C.inkSoft, 1.6, 0.5);
        const gl = BTL.glow(svg, defs, 960, 690, 280, C.gold, 0, g);
        const ch = el(g, 'g');
        P0(ch, rect(880, 640, 1040, 740), C.paperDark, 1);
        const box = L0(ch, rect(880, 640, 1040, 740) + 'M880 665L1040 665M880 690L1040 690M880 715L1040 715', C.inkSoft, 2.5);
        // the trench cut down to it from the right
        L0(g, 'M1360 560L1200 740L1040 740', C.inkSoft, 2, 0.6);
        return {
          update(lt, dur, cues) {
            const h = cue(cues, 'hit', dur * 0.45), a = BTL.ease(lt, h - 0.3, 1.6);
            gl.set(0.08 + 0.32 * a + 0.04 * a * Math.sin(lt * 1.1));
            box.setAttribute('stroke', a > 0.5 ? C.gold : C.inkSoft);
          },
        };
      }
      // the great mound alone: dusk / night / dawn / dims
      const base = 720, w = 1500, h = 340;
      const night = mode === 'night' || mode === 'dims' || mode === 'ask';
      const ask = mode === 'ask' ? label(g, '?', 960, 330, 260, { weight: 300, color: C.gold }) : null;
      const sky = BTL.glow(svg, defs, mode === 'dawn' ? 1500 : 420, base - 20, 900, mode === 'dawn' ? C.gold : C.stain, 0.12, g);
      const st = night ? BTL.stars(g, 120, 31, [0, 0, 1920, base - 160]) : null;
      steppe(g, base);
      const D = BTL.drawing(el(g, 'g'));
      D.f(dome(960, base + 2, w, h), C.paperLight, 1);
      D.s(dome(960, base + 2, w, h).slice(0, -1), { w: 3.5 });
      D.s(`M420 ${base - 40}C700 ${base - 70} 1200 ${base - 74} 1500 ${base - 36}`, { w: 1.6, color: C.inkSoft, alpha: 0.5 });
      const lab = P.label ? label(g, P.label, 960, base + 96, 60, { weight: 400 }) : null;
      const sub = P.sub ? ital(g, P.sub, 960, base + 150, 44) : null;
      let dims = null;
      if (mode === 'dims') {
        const hl = LD(g, `M${960 + 0} ${base}L960 ${base - h}`, C.gold, 3);
        const wl = LD(g, `M${960 - w / 2} ${base + 40}L${960 + w / 2} ${base + 40}M${960 - w / 2} ${base + 26}L${960 - w / 2} ${base + 54}M${960 + w / 2} ${base + 26}L${960 + w / 2} ${base + 54}`, C.gold, 3);
        const ht = label(g, '53 m', 1000, base - h / 2, 60, { anchor: 'start', color: C.gold });
        const wt = label(g, '300 m', 960, base + 110, 56, { color: C.gold });
        const q = label(g, '?', 960, base - 70, 170, { weight: 300, color: C.gold });
        dims = { hl, wl, ht, wt, q };
      }
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2.4));
          if (st) st.update(lt);
          if (ask) fade(ask, BTL.ease(lt, cue(cues, 'hit', 1), 1.4) * (0.8 + 0.2 * Math.sin(lt * 0.9)));
          const k = clamp01(lt / Math.max(6, dur));
          sky.set(mode === 'dusk' ? 0.16 - 0.05 * k : mode === 'dawn' ? 0.06 + 0.12 * k : 0.08);
          if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', 1.6), 1.2));
          if (sub) fade(sub, BTL.ease(lt, cue(cues, 'hit', 1.6) + 0.6, 1.2));
          if (dims) {
            const th = cue(cues, 'h', 0.8), tw = cue(cues, 'w', 2.2), tc = cue(cues, 'c', dur * 0.7);
            draw(dims.hl, BTL.ease(lt, th, 1.2)); fade(dims.ht, BTL.ease(lt, th + 0.6, 0.8));
            draw(dims.wl, BTL.ease(lt, tw, 1.4)); fade(dims.wt, BTL.ease(lt, tw + 0.6, 0.8));
            fade(dims.q, BTL.ease(lt, tc, 1.2) * (0.7 + 0.3 * Math.sin(lt * 1.1)));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_section
  SH.bt_gd_section = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'drill';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const base = 800, w = 1760, h = 470, cx = 960;
      P0(g, `M-200 ${base}L2120 ${base}L2120 1800L-200 1800Z`, C.paperDark, 0.6);
      L0(g, `M-200 ${base}L2120 ${base}`, C.inkSoft, 2.5);
      P0(g, dome(cx, base, w, h), C.paperLight, 1);
      // strata of the earth fill
      let strata = ''; for (let k = 1; k <= 4; k++) strata += dome(cx, base, w - k * 300, h - k * 85).slice(0, -1);
      L0(g, strata, C.inkSoft, 1.4, 0.35);
      L0(g, dome(cx, base, w, h).slice(0, -1), C.ink, 3.5);
      const sx = 820;   // the stone pile, a little south-west of the centre
      const pile = el(g, 'g', { opacity: 0 });
      P0(pile, `M${sx - 190} ${base}C${sx - 180} ${base - 150} ${sx + 180} ${base - 150} ${sx + 190} ${base}Z`, C.paper, 1);
      const pileS = L0(pile, stones(sx, base - 10, 180, 140, 160, 5, 16), C.inkSoft, 1.6, 0.9);
      const pileRim = L0(pile, `M${sx - 190} ${base}C${sx - 180} ${base - 150} ${sx + 180} ${base - 150} ${sx + 190} ${base}`, C.inkSoft, 3);
      const out = { pile };
      if (mode === 'drill') {
        const xs = [1360, 1180, 600, 1040, 860];
        const bores = xs.map((x, i) => ({ x, e: LD(g, `M${x} ${f1(domeY(cx, base, w, h, x))}L${x} ${base - 10}`, C.ink, 2.5), t: 0.6 + i * 0.9 }));
        const rig = el(g, 'g');
        L0(rig, 'M-40 0L0 -110L40 0M0 -110L0 10M-26 -44L26 -44', C.ink, 3);
        return {
          update(lt) {
            let cur = bores[0];
            for (const b of bores) { draw(b.e, BTL.ease(lt, b.t, 0.8)); if (lt >= b.t - 0.3) cur = b; }
            rig.setAttribute('transform', `translate(${cur.x} ${f1(domeY(cx, base, w, h, cur.x))})`);
          },
        };
      }
      if (mode === 'stone') {
        const xs = [1360, 1180, 600, 1040];
        for (const x of xs) { const e = L0(g, `M${x} ${f1(domeY(cx, base, w, h, x))}L${x} ${base - 10}`, C.inkSoft, 2.5, 0.7); e.setAttribute('stroke-dasharray', '10 8'); }
        const hit = LD(g, `M${sx} ${f1(domeY(cx, base, w, h, sx))}L${sx} ${base - 120}`, C.gold, 3.5);
        const lab = label(g, '30 m', sx, base + 80, 56, { color: C.gold });
        const ln = LD(g, `M${sx - 190} ${base + 20}L${sx + 190} ${base + 20}`, C.gold, 2.5);
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.35);
            draw(hit, BTL.ease(lt, th - 1.4, 1.4));
            fade(pile, BTL.ease(lt, th, 1.2));
            pileRim.setAttribute('stroke', lt > th + 0.4 ? C.gold : C.inkSoft);
            draw(ln, BTL.ease(lt, th + 1.2, 1)); fade(lab, BTL.ease(lt, th + 1.6, 1));
          },
        };
      }
      // glow: the chamber inside the pile, the tunnel running to it, a warm light
      fade(pile, 1);
      const gl = BTL.glow(svg, defs, sx, base - 80, 460, C.gold, 0, g);
      pileS.setAttribute('stroke-opacity', 0.18);
      const room = `M${sx - 170} ${base - 8}L${sx - 170} ${base - 120}L${sx} ${base - 150}L${sx + 170} ${base - 120}L${sx + 170} ${base - 8}Z`;
      P0(g, room, C.paperDark, 1);
      const inner = P0(g, room, C.gold, 0);
      let lg = ''; for (let y = base - 104; y < base - 10; y += 22) lg += `M${sx - 170} ${y}L${sx + 170} ${y}`;
      L0(g, lg, C.inkSoft, 1.4, 0.5);
      // the small open coffin inside, in gold, with the skull at its east end
      L0(g, `M${sx - 84} ${base - 56}L${sx + 84} ${base - 56}C${sx + 88} ${base - 36} ${sx + 78} ${base - 28} ${sx + 66} ${base - 26}L${sx - 66} ${base - 26}C${sx - 78} ${base - 28} ${sx - 88} ${base - 36} ${sx - 84} ${base - 56}ZM${sx - 74} ${base - 26}L${sx - 74} ${base - 10}M${sx + 74} ${base - 26}L${sx + 74} ${base - 10}`, C.gold, 3.5);
      L0(g, BTL.E(sx + 62, base - 66, 11, 9) + `M${sx + 50} ${base - 64}L${sx - 70} ${base - 64}`, C.gold, 2.5);
      const box = L0(g, room, C.gold, 4);
      const tun = L0(g, `M${sx + 190} ${base - 40}L${cx + w / 2 - 60} ${base - 40}`, C.inkSoft, 2, 0.7);
      tun.setAttribute('stroke-dasharray', '12 10');
      return {
        update(lt) {
          const on = BTL.ease(lt, 0.2, 2);
          gl.set((0.4 + 0.06 * Math.sin(lt * 0.9)) * on);
          inner.setAttribute('fill-opacity', (0.12 * on).toFixed(3));
          box.setAttribute('stroke-opacity', BTL.ease(lt, 0.2, 1.6).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_tunnel
  SH.bt_gd_tunnel = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'dig';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 500 });
      const vx = 960, vy = 470;
      P0(g, rect(-200, -200, 2120, 1800), C.paperDark, 1);
      // walls, floor, ceiling of the bore (earth)
      P0(g, `M200 -200L1720 -200L1080 380L840 380Z`, C.paper, 1);
      P0(g, `M200 1800L1720 1800L1720 1080L1080 580L840 580L200 1080Z`, C.paper, 0.9);
      const gl = BTL.glow(svg, defs, vx, vy, 520, C.stain, 0.2, g);
      // timber frames from the front to the back
      const frames = [];
      for (let i = 0; i < 7; i++) {
        const k = Math.pow(0.68, i), hw = 600 * k, top = vy - 520 * k, bot = vy + 560 * k;
        const d = `M${f1(vx - hw)} ${f1(bot)}L${f1(vx - hw)} ${f1(top)}L${f1(vx + hw)} ${f1(top)}L${f1(vx + hw)} ${f1(bot)}`;
        const e = LD(g, d, C.ink, Math.max(2, 9 * k), 0.95);
        frames.push({ e, t: 0.2 + i * 0.35 });
      }
      L0(g, `M200 1080L${vx - 120} ${vy + 110}M1720 1080L${vx + 120} ${vy + 110}M200 -100L${vx - 120} ${vy - 90}M1720 -100L${vx + 120} ${vy - 90}`, C.inkSoft, 1.6, 0.5);
      const lamp = el(g, 'g');
      L0(lamp, `M1240 120L1240 220`, C.inkSoft, 2.5);
      P0(lamp, 'M1220 220L1260 220L1252 262L1228 262Z', C.paperLight, 1); L0(lamp, 'M1220 220L1260 220L1252 262L1228 262Z', C.ink, 2.5);
      const fl = flame(lamp, 1240, 220, 0.7);
      const lg = BTL.glow(svg, defs, 1240, 200, 260, C.gold, 0.25, g);
      if (mode === 'dig') {
        const lab = P.label ? label(g, P.label, vx, 850, 60, { color: C.gold }) : null;
        return {
          update(lt, dur, cues) {
            for (const f of frames) draw(f.e, BTL.ease(lt, f.t, 1.1));
            fl.update(lt); lg.set(0.22 + 0.03 * Math.sin(lt * 2.2)); gl.set(0.16 + 0.04 * BTL.ease(lt, 0, dur));
            if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', 1.6), 1.2));
          },
        };
      }
      // stones: the far end is a rough stone wall with a breach; pebbles keep trickling out of it
      const ew = el(g, 'g');
      P0(ew, rect(vx - 300, vy - 250, vx + 300, vy + 260), C.paperLight, 1);
      L0(ew, stones(vx, vy, 290, 250, 140, 9, 22).replace(/Z/g, 'Z'), C.inkSoft, 2, 0.85);
      const hole = P0(g, BTL.E(vx - 20, vy + 70, 0, 0), C.paperDark, 1);
      const r = rng(41), peb = [];
      for (let i = 0; i < 18; i++) peb.push({ e: P0(g, '', C.paperLight, 0, { stroke: C.inkSoft, 'stroke-width': 1.5 }), ph: r(), dx: (r() - 0.5) * 360, s: 8 + r() * 10 });
      const heap = P0(g, `M${vx - 380} 880C${vx - 200} 770 ${vx + 200} 770 ${vx + 380} 880Z`, C.paperLight, 0);
      const heapS = L0(g, stones(vx, 860, 330, 80, 60, 13, 16), C.inkSoft, 1.6, 0);
      return {
        update(lt, dur, cues) {
          for (const f of frames) draw(f.e, 1);
          fl.update(lt); lg.set(0.22 + 0.03 * Math.sin(lt * 2.2));
          const th = cue(cues, 'hit', dur * 0.3), o = BTL.ease(lt, th - 0.4, 1.2);
          hole.setAttribute('d', BTL.E(vx - 20, vy + 70, 110 * o, 80 * o));
          for (const p of peb) {
            const ph = (p.ph + lt * 0.45) % 1, x = vx - 20 + p.dx * ph, y = vy + 70 + ph * ph * 300;
            p.e.setAttribute('d', BTL.E(x, y, p.s, p.s * 0.75));
            p.e.setAttribute('fill-opacity', (o * Math.min(1, (1 - ph) * 3)).toFixed(3));
            p.e.setAttribute('stroke-opacity', (o * Math.min(1, (1 - ph) * 3)).toFixed(3));
          }
          const hp = BTL.ease(lt, th, Math.max(2, dur - th));
          heap.setAttribute('fill-opacity', (0.9 * hp).toFixed(3)); heapS.setAttribute('stroke-opacity', (0.8 * hp).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_wall
  SH.bt_gd_wall = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'logs';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 500 });
      P0(g, rect(-200, -200, 2120, 1800), C.paperDark, 1);
      if (mode === 'auger') {
        // side section: rubble | log wall | plank wall | the dark, empty chamber
        P0(g, rect(-200, 160, 640, 880), C.paper, 1);
        L0(g, stones(260, 520, 420, 380, 220, 17, 22), C.inkSoft, 1.6, 0.75);
        P0(g, rect(640, 160, 800, 880), C.paperLight, 1);
        let rings = ''; for (let y = 200; y < 880; y += 76) rings += BTL.E(720, y + 36, 70, 34);
        L0(g, rings + rect(640, 160, 800, 880), C.ink, 2.5);
        P0(g, rect(830, 160, 930, 880), C.paperLight, 1);
        let pl = ''; for (let y = 160; y < 880; y += 90) pl += `M830 ${y}L930 ${y}`;
        L0(g, pl + rect(830, 160, 930, 880), C.ink, 2.5);
        P0(g, rect(930, 160, 2120, 880), C.paperDark, 1);
        L0(g, 'M930 160L2120 160M930 880L2120 880', C.inkSoft, 2, 0.6);
        const gl = BTL.glow(svg, defs, 1300, 520, 520, C.stain, 0, g);
        const lab = ital(g, P.label || 'boşluk', 1400, 540, 58, { color: C.ink });
        const aug = el(g, 'g');
        L0(aug, 'M-900 0L0 0', C.ink, 10);
        let sp = ''; for (let x = -200; x < 0; x += 26) sp += `M${x} -12L${x + 13} 12`;
        L0(aug, sp, C.inkSoft, 3);
        P0(aug, 'M0 -12L40 0L0 12Z', C.ink, 1);
        L0(aug, 'M-900 -90L-900 90', C.ink, 12);
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.5), x = 300 + 700 * BTL.ease(lt, 0, th + 0.3) + 120 * BTL.ease(lt, th + 0.3, 2);
            aug.setAttribute('transform', `translate(${f1(x)} 520)`);
            const a = BTL.ease(lt, th, 1.6);
            gl.set(0.12 * a); fade(lab, a);
          },
        };
      }
      const gl = BTL.glow(svg, defs, 520, 900, 900, C.stain, 0.22, g);
      const D = logWall(el(g, 'g'), -100, 2020, 110, 890, 46, 3);
      const out = { D };
      if (mode === 'logs') {
        const lamp = el(g, 'g');
        P0(lamp, 'M300 960L380 960L372 1010L308 1010Z', C.paperLight, 1); L0(lamp, 'M300 960L380 960L372 1010L308 1010Z', C.ink, 2.5);
        const fl = flame(lamp, 340, 960, 1.1);
        return {
          update(lt) {
            D.reveal(BTL.ease(lt, 0, 3)); fl.update(lt);
            gl.set(0.2 + 0.03 * Math.sin(lt * 2.1) + 0.015 * Math.sin(lt * 3.4));
          },
        };
      }
      // window / double: a rectangular opening cut in the logs
      const wx0 = 760, wx1 = 1160, wy0 = 330, wy1 = 640;
      const holeG = el(g, 'g', { opacity: 0 });
      P0(holeG, rect(wx0, wy0, wx1, wy1), C.paperDark, 1);
      L0(holeG, rect(wx0, wy0, wx1, wy1), C.ink, 4);
      // cut log ends at the opening edges
      let ends = ''; for (let y = wy0 + 30; y < wy1; y += 96) ends += BTL.E(wx0 + 6, y + 18, 10, 40) + BTL.E(wx1 - 6, y + 18, 10, 40);
      L0(holeG, ends, C.inkSoft, 2);
      if (mode === 'double') {
        const pg = el(g, 'g', { opacity: 0 });
        P0(pg, rect(wx0 + 14, wy0 + 14, wx1 - 14, wy1 - 14), C.paper, 1);
        let pl = ''; for (let x = wx0 + 14; x < wx1 - 14; x += 64) pl += `M${x} ${wy0 + 14}L${x} ${wy1 - 14}`;
        L0(pg, pl + rect(wx0 + 14, wy0 + 14, wx1 - 14, wy1 - 14), C.gold, 2.5);
        return {
          update(lt, dur, cues) {
            D.reveal(1); gl.set(0.2 + 0.02 * Math.sin(lt * 1.7));
            fade(holeG, BTL.ease(lt, 0.3, 1.2)); fade(pg, BTL.ease(lt, cue(cues, 'hit', dur * 0.5), 1.4));
          },
        };
      }
      // window: the opening is cut, then a torch beam reaches in from the bottom right (an arm holding it)
      const arm = el(g, 'g', { opacity: 0 });
      const armD = 'M2100 1080C1700 960 1400 820 1230 720L1200 690L1260 650L1290 680C1460 780 1760 880 2100 960Z';
      P0(arm, armD, C.paperLight, 1); L0(arm, armD, C.inkSoft, 2.5);
      P0(arm, 'M1150 600L1240 650L1215 700L1125 650Z', C.paperLight, 1); L0(arm, 'M1150 600L1240 650L1215 700L1125 650Z', C.ink, 2.5);
      const beam = P0(g, '', C.stain, 0);
      const spot = BTL.glow(svg, defs, 900, 480, 200, C.gold, 0, g);
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.2));
          const th = cue(cues, 'hole', 0.6);
          fade(holeG, BTL.ease(lt, th, 1.2));
          const a = BTL.ease(lt, th + 1.2, 1.6);
          fade(arm, a);
          const sw = 0.5 + 0.5 * Math.sin(lt * 0.45), tx = 820 + 120 * sw, ty = 430 + 50 * sw;
          beam.setAttribute('d', `M1140 620L${f1(tx - 70)} ${f1(ty - 60)}L${f1(tx + 60)} ${f1(ty + 70)}Z`);
          beam.setAttribute('fill-opacity', (0.35 * a).toFixed(3));
          spot.e.setAttribute('cx', f1(tx)); spot.e.setAttribute('cy', f1(ty)); spot.set(0.3 * a);
          gl.set(0.2 + 0.02 * Math.sin(lt * 1.7));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_scan
  SH.bt_gd_scan = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'reveal';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      P0(g, rect(-200, -200, 2120, 1800), C.paperDark, 1);
      const ox = 980, oy = 1180;   // the torch, below the frame
      const beamG = el(g, 'g');
      const beam = P0(beamG, '', C.stain, 0.16), core = P0(beamG, '', C.gold, 0.06);
      const pool = BTL.glow(svg, defs, 960, 600, 260, C.stain, 0.25, g);
      L0(g, 'M-200 760L2120 760', C.inkSoft, 1.5, 0.35);
      const things = [];
      if (mode === 'reveal') {
        // a cauldron (left), a table (middle), the coffin (right)
        const a = el(g, 'g', { opacity: 0 });
        L0(a, 'M300 560C300 690 560 690 560 560Z M290 560L570 560 M330 680L300 760M530 680L560 760M430 690L430 760', C.ink, 3);
        L0(a, BTL.E(330, 560, 18, 14) + BTL.E(530, 560, 18, 14), C.gold, 2.5);
        const b = el(g, 'g', { opacity: 0 });
        L0(b, 'M780 600L1080 600L1080 624L780 624ZM800 624C790 680 820 720 800 760M1060 624C1070 680 1040 720 1060 760', C.ink, 3);
        L0(b, 'M820 612l20 0M870 612l20 0M920 612l20 0M970 612l20 0M1020 612l20 0', C.gold, 2.5);
        const c = el(g, 'g', { opacity: 0 });
        const cf = coffin(c, 1500, 620, 0.62, true); cf.D.reveal(1); if (cf.bone) fade(cf.bone, 1);
        things.push({ e: a, x: 430, y: 620, k: 'a', t: 1 }, { e: b, x: 930, y: 640, k: 'b', t: 2.2 }, { e: c, x: 1500, y: 640, k: 'c', t: 3.4 });
      }
      const r = rng(19), motes = [];
      for (let i = 0; i < 26; i++) motes.push({ e: el(g, 'circle', { r: 1.6 + r() * 2, fill: C.ink, 'fill-opacity': 0 }), u: r(), v: r(), ph: r() });
      return {
        update(lt, dur, cues) {
          let tx, ty;
          if (mode === 'reveal') {
            // the beam goes from thing to thing, each lights up as it arrives
            const ts = things.map(t => cue(cues, t.k, t.t));
            let px = 200, py = 500; tx = px; ty = py;
            for (let i = 0; i < things.length; i++) {
              const k = BTL.ease(lt, ts[i] - 0.9, 1.0);
              tx = tx + (things[i].x - tx) * k; ty = ty + (things[i].y - ty) * k;
            }
            things.forEach((t, i) => {
              const near = Math.max(0, 1 - Math.hypot(tx - t.x, ty - t.y) / 520);
              fade(t.e, Math.max(0.25 * BTL.ease(lt, ts[i], 1), near) * BTL.ease(lt, ts[i] - 0.6, 0.8));
            });
          } else {
            const u = lt * 0.32;
            tx = 960 + 640 * Math.sin(u); ty = 600 + 60 * Math.sin(u * 1.7);
          }
          const ang = Math.atan2(ty - oy, tx - ox), L = Math.hypot(tx - ox, ty - oy) + 260, sp = 0.16;
          const pt = (a, l) => `${f1(ox + Math.cos(a) * l)} ${f1(oy + Math.sin(a) * l)}`;
          beam.setAttribute('d', `M${ox} ${oy}L${pt(ang - sp, L)}L${pt(ang + sp, L)}Z`);
          core.setAttribute('d', `M${ox} ${oy}L${pt(ang - sp * 0.45, L)}L${pt(ang + sp * 0.45, L)}Z`);
          const on = BTL.ease(lt, 0, 0.8);
          beamG.setAttribute('opacity', on.toFixed(3));
          pool.e.setAttribute('cx', f1(tx)); pool.e.setAttribute('cy', f1(ty)); pool.set(0.22 * on);
          for (const m of motes) {
            const ph = (m.ph + lt * 0.04) % 1, x = ox + (tx - ox) * (0.3 + 0.7 * m.u) + (m.v - 0.5) * 240 * m.u, y = oy + (ty - oy) * (0.3 + 0.7 * m.u) - ph * 60;
            m.e.setAttribute('cx', f1(x)); m.e.setAttribute('cy', f1(y)); m.e.setAttribute('fill-opacity', (0.45 * Math.sin(ph * Math.PI) * on).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_room
  SH.bt_gd_room = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'build';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      if (mode === 'coffin') {
        const gl = BTL.glow(svg, defs, 960, 560, 640, C.stain, 0, g);
        L0(g, 'M-200 800L2120 800', C.inkSoft, 1.5, 0.4);
        const back = el(g, 'g', { opacity: 0.35 });
        logWall(back, 300, 1620, 210, 520, 26, 51, 0.5).reveal(1);
        const cf = coffin(g, 960, 600, 1.15, true);
        const lab = P.label ? label(g, P.label, 960, 875, 58, { color: C.gold }) : null;
        return {
          update(lt, dur, cues) {
            cf.D.reveal(BTL.ease(lt, 0.2, 2.2)); fade(cf.bone, BTL.ease(lt, 1.6, 1.6));
            gl.set(0.2 * BTL.ease(lt, 0, 2) + 0.02 * Math.sin(lt * 0.8));
            if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', dur * 0.6), 1.2));
          },
        };
      }
      // build: the chamber cut open in front: back wall of logs, two side walls in perspective, a low gabled roof
      const gl = BTL.glow(svg, defs, 960, 560, 700, C.stain, 0.14, g);
      const x0 = 560, x1 = 1360, y0 = 330, y1 = 760;
      P0(g, `M200 860L1720 860L${x1} ${y1}L${x0} ${y1}Z`, C.paper, 1);
      const sideL = BTL.drawing(el(g, 'g')), sideR = BTL.drawing(el(g, 'g'));
      sideL.f(`M200 220L${x0} ${y0}L${x0} ${y1}L200 860Z`, C.paperLight, 0.7); sideR.f(`M1720 220L${x1} ${y0}L${x1} ${y1}L1720 860Z`, C.paperLight, 0.7);
      for (let i = 1; i < 9; i++) { const t = i / 9; sideL.s(`M200 ${f1(220 + 640 * t)}L${x0} ${f1(y0 + (y1 - y0) * t)}`, { w: 2, color: C.inkSoft }); sideR.s(`M1720 ${f1(220 + 640 * t)}L${x1} ${f1(y0 + (y1 - y0) * t)}`, { w: 2, color: C.inkSoft }); }
      sideL.s(`M200 220L${x0} ${y0}L${x0} ${y1}L200 860`, { w: 3 }); sideR.s(`M1720 220L${x1} ${y0}L${x1} ${y1}L1720 860`, { w: 3 });
      const backD = logWall(el(g, 'g'), x0, x1, y0, y1, 22, 61);
      const roof = BTL.drawing(el(g, 'g'));
      roof.f(`M${x0 - 10} ${y0}L960 ${y0 - 120}L${x1 + 10} ${y0}Z`, C.paperLight, 0.9);
      roof.s(`M${x0 - 10} ${y0}L960 ${y0 - 120}L${x1 + 10} ${y0}Z`, { w: 3 });
      roof.s(`M200 220L960 90L1720 220M960 90L960 ${y0 - 120}`, { w: 2.5, color: C.inkSoft });
      const lab = P.label ? ital(g, P.label, 960, 920, 52, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          backD.reveal(BTL.ease(lt, 0, 2.4)); sideL.reveal(BTL.ease(lt, 0.6, 2)); sideR.reveal(BTL.ease(lt, 0.6, 2)); roof.reveal(BTL.ease(lt, 1.4, 1.8));
          gl.set(0.12 + 0.03 * Math.sin(lt * 0.7));
          if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', dur * 0.55), 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_king
  SH.bt_gd_king = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      // a cloaked, crowned bust in profile (faceless, filled, rim line); bearded, facing right
      const mode = P.mode || 'wish';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const top = BTL.glow(svg, defs, 960, 380, 560, mode === 'gold' ? C.gold : C.stain, 0, g);
      const halo = el(g, 'circle', { cx: 958, cy: 390, r: 150, fill: 'none', stroke: C.gold, 'stroke-width': 3, 'stroke-opacity': 0 });
      const hg = BTL.glow(svg, defs, 958, 390, 300, C.gold, 0, g);
      const bust = 'M960 300C1010 300 1040 328 1046 362L1070 398L1048 406C1052 420 1046 434 1038 440C1044 470 1030 496 1004 506L1004 534' +
        'C1100 548 1172 594 1192 664L1234 880L686 880L728 664C748 594 820 548 916 534L916 500C880 476 868 436 872 386C876 336 910 300 960 300Z';
      const rimCol = mode === 'gold' ? C.gold : C.inkSoft;
      const body = P0(g, bust, C.paperDark, 1);
      const rim = L0(g, bust, rimCol, 3);
      const folds = L0(g, 'M860 600C840 700 820 790 800 880M1060 600C1080 700 1100 790 1120 880M960 590L960 880', C.inkSoft, 2, 0.7);
      const beard = L0(g, 'M1004 506C990 486 960 476 930 480', C.inkSoft, 2, 0.7);
      const clasp = el(g, 'circle', { cx: 960, cy: 572, r: 14, fill: C.gold, 'fill-opacity': 0.9 });
      const crown = L0(g, 'M892 312L888 262L918 290L948 250L978 288L1008 258L1012 312Z', C.gold, 3.5);
      L0(g, 'M-200 880L2120 880', C.inkSoft, 1.5, 0.4);
      const shadow = P0(g, 'M1234 880L1900 920L1900 960L1234 900Z', C.paperDark, 0);
      let goldLines = null;
      if (mode === 'gold') {
        goldLines = el(g, 'g', { opacity: 0 });
        L0(goldLines, 'M780 700C860 680 900 720 960 700C1020 680 1080 720 1160 700M760 780C850 760 900 800 960 780C1020 760 1090 800 1180 780M745 850C840 830 900 870 960 850C1030 830 1100 870 1200 850', C.gold, 2.5, 0.9);
      }
      const all = [body, rim, folds, beard];
      return {
        update(lt, dur, cues) {
          const on = BTL.ease(lt, 0, 1.4);
          for (const e of all) fade(e, on);
          fade(clasp, on); fade(crown, BTL.ease(lt, 0.6, 1.2));
          const th = cue(cues, 'hit', dur * 0.5);
          if (mode === 'wish') {
            top.set(0.2 * on); const a = BTL.ease(lt, th, 1.6);
            halo.setAttribute('stroke-opacity', (0.9 * a).toFixed(3)); halo.setAttribute('r', f1(150 + 6 * Math.sin(lt * 0.9)));
            hg.set(0.35 * a);
          } else if (mode === 'real') {
            const k = BTL.ease(lt, th, 2);
            top.set(0.22 * (1 - k) + 0.05); hg.set(0.3 * (1 - k)); halo.setAttribute('stroke-opacity', (0.8 * (1 - k)).toFixed(3));
            shadow.setAttribute('fill-opacity', (0.9 * k).toFixed(3));
          } else {
            top.set(0.16 + 0.04 * Math.sin(lt * 0.7)); fade(goldLines, BTL.ease(lt, th, 2)); hg.set(0.15 * BTL.ease(lt, th, 2));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_touch
  SH.bt_gd_touch = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      L0(g, 'M300 720L1620 720', C.inkSoft, 2.5);
      P0(g, rect(300, 720, 1620, 760), C.paperLight, 0.6);
      const mk = (x, d, d2) => {
        const gg = el(g, 'g');
        const f = P0(gg, d, C.paperLight, 1), s = L0(gg, d, C.ink, 3.5), s2 = L0(gg, d2, C.inkSoft, 2);
        const gl = BTL.glow(svg, defs, x, 600, 260, C.gold, 0, g);
        return { f, s, s2, gl };
      };
      const bread = mk(720, 'M520 716C510 600 600 540 720 540C840 540 930 600 920 716Z', 'M600 600C620 580 640 572 660 570M700 580C720 560 740 556 760 556M800 590C820 576 840 574 860 580');
      const cup = mk(1200, 'M1080 540L1320 540C1316 610 1270 650 1220 660L1220 700L1280 716L1120 716L1180 700L1180 660C1130 650 1084 610 1080 540Z', 'M1100 566C1160 576 1240 576 1300 566');
      return {
        update(lt, dur, cues) {
          for (const [o, k, fb] of [[bread, 'a', 0.8], [cup, 'b', dur * 0.4]]) {
            const a = BTL.ease(lt, cue(cues, k, fb), 1.4);
            o.f.setAttribute('fill', a > 0.5 ? C.gold : C.paperLight); o.f.setAttribute('fill-opacity', (1 - 0.45 * a).toFixed(3));
            o.s.setAttribute('stroke', a > 0.5 ? C.gold : C.ink); o.gl.set(0.3 * a + 0.03 * a * Math.sin(lt));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_fibula
  SH.bt_gd_fibula = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = portrait ? W / 2 : 720, cy = portrait ? 560 : 500;
      const gl = BTL.glow(svg, defs, cx, cy, 460, C.stain, 0.16, g);
      const D = BTL.drawing(el(g, 'g', { transform: `translate(${cx} ${cy}) scale(${portrait ? 0.8 : 1})` }));
      // a Phrygian arched fibula: the bow with mouldings, the pin below, the catch plate on the right
      const bow = 'M-260 120C-260-140 260-140 260 120L230 120C230-100-230-100-230 120Z';
      D.f(bow, C.paperLight, 1); D.s(bow, { w: 4 });
      for (const a of [-0.9, -0.45, 0, 0.45, 0.9]) {
        const x = Math.sin(a) * 245, y = 120 - Math.cos(a) * 240;
        D.f(BTL.E(x, y, 26, 26), C.paper, 1); D.s(BTL.E(x, y, 26, 26), { w: 3, color: C.gold });
      }
      D.f('M230 100L330 100L330 160L230 160Z', C.paperLight, 1); D.s('M230 100L330 100L330 160L230 160Z', { w: 3.5 });
      D.s('M-246 120C-270 150-250 170-226 150L310 140', { w: 4 });
      const num = label(g, String(P.n || 182), portrait ? W / 2 : 1380, portrait ? 1000 : 520, 220, { weight: 300, color: C.gold });
      const lab = P.label ? ital(g, P.label, portrait ? W / 2 : 1380, portrait ? 1070 : 600, 50, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2.4)); gl.set(0.14 + 0.03 * Math.sin(lt * 0.8));
          const th = cue(cues, 'hit', dur * 0.55);
          num.textContent = String(Math.round((P.n || 182) * BTL.ease(lt, th, 1.6)));
          fade(num, BTL.ease(lt, th - 0.2, 0.6)); if (lab) fade(lab, BTL.ease(lt, th + 0.6, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_cauldron
  function cauldron(D, o = {}) {
    const body = 'M-300-80C-300 140-180 220 0 220C180 220 300 140 300-80Z';
    D.f(body, C.paperLight, 1);
    D.f('M-310-80C-310-108 310-108 310-80C310-52-310-52-310-80Z', C.paper, 1);
    if (o.stew) D.f('M-280-80C-280-98 280-98 280-80C280-62-280-62-280-80Z', C.gold, 0.45);
    D.s(body, { w: 4 }); D.s('M-310-80C-310-108 310-108 310-80C310-52-310-52-310-80Z', { w: 4 });
    // bull-head attachments on the shoulder, ring handles
    for (const x of [-230, 230]) { D.f(BTL.E(x, -40, 30, 26), C.paper, 1); D.s(BTL.E(x, -40, 30, 26) + `M${x - 14} -62L${x - 30} -78M${x + 14} -62L${x + 30} -78`, { w: 3, color: C.gold }); D.s(BTL.E(x, 6, 26, 26), { w: 3, color: C.gold }); }
    D.s('M-260 60C-150 90 150 90 260 60', { w: 1.8, color: C.inkSoft, alpha: 0.7 });
    // the iron tripod
    D.s('M-180 180L-280 440M180 180L280 440M0 220L0 440M-240 340L240 340', { w: 6, color: C.inkSoft });
    D.s('M-300 440L-260 440M260 440L300 440M-20 440L20 440', { w: 6, color: C.inkSoft });
  }
  SH.bt_gd_cauldron = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'still', portrait = H > W, g = el(svg, 'g');
      const cx = portrait ? W / 2 : 960, cy = portrait ? 560 : 400, s = portrait ? 0.95 : 0.9;
      const gl = BTL.glow(svg, defs, cx, cy + 60, 520, C.stain, 0.16, g);
      const ghosts = el(g, 'g', { opacity: 0 });
      if (mode === 'still' && !portrait) for (const dx of [-560, 560]) { const d = BTL.drawing(el(ghosts, 'g', { transform: `translate(${cx + dx} ${cy + 80}) scale(0.5)` })); cauldron(d); d.reveal(1); }
      const D = BTL.drawing(el(g, 'g', { transform: `translate(${cx} ${cy}) scale(${s})` }));
      cauldron(D, { stew: mode === 'stew' });
      const steam = mode === 'stew' ? [0, 1, 2, 3].map(() => L0(g, '', C.ink, 2.5, 0)) : [];
      const lab = P.label ? ital(g, P.label, cx, portrait ? 1080 : 862, 52, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2.4)); gl.set(0.14 + 0.03 * Math.sin(lt * 0.9));
          const th = cue(cues, 'hit', dur * 0.5);
          fade(ghosts, 0.45 * BTL.ease(lt, th, 1.6));
          if (lab) fade(lab, BTL.ease(lt, th + 0.4, 1.2));
          steam.forEach((e, i) => {
            const ph = (lt * 0.18 + i / 4) % 1, x = cx - 150 + i * 100, y = cy - 110 - ph * 260, sw = 18 * Math.sin(lt * 0.8 + i * 1.7);
            e.setAttribute('d', `M${x} ${f1(y + 80)}C${f1(x + sw)} ${f1(y + 40)} ${f1(x - sw)} ${f1(y)} ${f1(x + sw * 0.5)} ${f1(y - 50)}`);
            e.setAttribute('stroke-opacity', (0.5 * Math.sin(ph * Math.PI) * BTL.ease(lt, 1, 1.5)).toFixed(3));
          });
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_table
  SH.bt_gd_table = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 560 : 470, s = portrait ? 0.62 : 1;
      const gl = BTL.glow(svg, defs, cx, cy, 620, C.stain, 0.14, g);
      const D = BTL.drawing(el(g, 'g', { transform: `translate(${cx} ${cy}) scale(${s})` }));
      // front face of the inlaid table: top, a deep inlaid frame, curved legs
      D.f('M-560-210L560-210L560-170L-560-170Z', C.paperLight, 1); D.s('M-560-210L560-210L560-170L-560-170Z', { w: 4 });
      D.f('M-520-170L520-170L520 30L-520 30Z', C.paper, 1); D.s('M-520-170L520-170L520 30L-520 30Z', { w: 4 });
      // inlay: a row of squares, each with an inner lozenge (dark inlay in light wood)
      let sq = '', lz = '';
      for (let i = 0; i < 12; i++) { const x = -500 + i * 84; sq += rect(x, -150, x + 72, -78); lz += `M${x + 36} -146L${x + 68} -114L${x + 36} -82L${x + 4} -114Z`; }
      for (let i = 0; i < 12; i++) { const x = -500 + i * 84; sq += rect(x, -66, x + 72, 6); lz += `M${x + 8} -30L${x + 36} -62L${x + 64} -30L${x + 36} 2Z`; }
      D.s(sq, { w: 2, color: C.inkSoft }); D.s(lz, { w: 2.5, color: C.gold });
      D.s('M-470 30C-520 120-440 220-500 330M470 30C520 120 440 220 500 330M0 30L0 330', { w: 6 });
      D.s('M-530 330L-470 330M470 330L530 330M-30 330L30 330', { w: 6 });
      const lab = P.label ? ital(g, P.label, cx, portrait ? 900 : 862, 50, { color: C.ink }) : null;
      return {
        update(lt, dur) {
          D.reveal(BTL.ease(lt, 0, Math.max(2.4, dur * 0.6))); gl.set(0.12 + 0.03 * Math.sin(lt * 0.7));
          if (lab) fade(lab, BTL.ease(lt, dur * 0.45, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_rings
  SH.bt_gd_rings = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'grow', portrait = H > W, g = el(svg, 'g');
      const cx = portrait ? W / 2 : 820, cy = portrait ? 600 : 480, R = portrait ? 380 : 340;
      const gl = BTL.glow(svg, defs, cx, cy, R * 1.6, C.stain, 0.14, g);
      P0(g, BTL.E(cx, cy, R + 22, R + 18), C.paperLight, 1);
      L0(g, BTL.E(cx, cy, R + 22, R + 18), C.ink, 4);
      const r = rng(23), rings = [];
      let rad = 10;
      while (rad < R - 6) {
        const w = r() < 0.25 ? 4 + r() * 4 : 10 + r() * 12; rad = Math.min(R, rad + w);
        let d = '';
        for (let k = 0; k <= 48; k++) { const a = k / 48 * Math.PI * 2, q = rad * (1 + 0.025 * Math.sin(a * 3 + rad * 0.05)); d += (k ? 'L' : 'M') + f1(cx + Math.cos(a) * q) + ' ' + f1(cy + Math.sin(a) * q * 0.94); }
        rings.push({ e: L0(g, d + 'Z', C.inkSoft, w < 8 ? 2.6 : 1.4, 0), rad });
      }
      const outer = rings[rings.length - 1].e;
      const crack = L0(g, `M${cx} ${cy}L${cx + R * 0.7} ${cy - R * 0.5}`, C.inkSoft, 1.6, 0.5);
      const strip = LD(g, `M${cx} ${cy}L${cx + R} ${cy}`, C.gold, 5);
      const lab = P.label ? label(g, P.label, portrait ? W / 2 : cx + R + 80, portrait ? 1110 : cy + 20, portrait ? 90 : 110, { weight: 300, color: C.gold, anchor: portrait ? 'middle' : 'start' }) : null;
      const sub = P.sub ? ital(g, P.sub, portrait ? W / 2 : cx + R + 84, portrait ? 1170 : cy + 90, 46, { anchor: portrait ? 'middle' : 'start' }) : null;
      return {
        update(lt, dur, cues) {
          const span = mode === 'grow' ? Math.max(3, dur * 0.8) : 0.01;
          rings.forEach(q => q.e.setAttribute('stroke-opacity', BTL.ease(lt, (q.rad / R) * span, 0.6).toFixed(3)));
          gl.set(0.12 + 0.03 * Math.sin(lt * 0.6));
          if (mode === 'date') {
            const th = cue(cues, 'hit', dur * 0.55);
            draw(strip, BTL.ease(lt, 0.6, 1.8));
            outer.setAttribute('stroke', lt > th ? C.gold : C.inkSoft); outer.setAttribute('stroke-width', lt > th ? 5 : 1.4);
            if (lab) fade(lab, BTL.ease(lt, th, 1.2)); if (sub) fade(sub, BTL.ease(lt, th + 0.6, 1.2));
          } else { draw(strip, 0); crack.setAttribute('stroke-opacity', 0.4); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_tablet
  SH.bt_gd_tablet = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 600 : 450, s = portrait ? 0.8 : 1;
      const gl = BTL.glow(svg, defs, cx, cy, 560, C.stain, 0.16, g);
      const tg = el(g, 'g', { transform: `translate(${cx} ${cy}) scale(${s})` });
      const D = BTL.drawing(tg);
      const body = 'M-360-240C-380-240-390-220-390-200L-390 200C-390 230-370 250-340 250L340 250C370 250 390 230 390 200L390-200C390-224 376-244 350-244Z';
      D.f(body, C.paperLight, 1); D.s(body, { w: 4 });
      const r = rng(7); let wedges = '', hot = '';
      for (let row = 0; row < 7; row++) {
        const y = -190 + row * 62; let x = -340;
        D.s(`M-350 ${y + 30}L350 ${y + 30}`, { w: 1.2, color: C.inkSoft, alpha: 0.5 });
        while (x < 330) {
          const k = r(), sz = 14 + r() * 8;
          const wd = k < 0.5 ? `M${f1(x)} ${f1(y)}L${f1(x + sz)} ${f1(y - sz * 0.5)}L${f1(x + sz)} ${f1(y + sz * 0.5)}ZM${f1(x + sz)} ${f1(y)}L${f1(x + sz * 2.4)} ${f1(y)}`
            : `M${f1(x)} ${f1(y - sz * 0.6)}L${f1(x + sz)} ${f1(y - sz * 0.6)}L${f1(x + sz * 0.5)} ${f1(y)}ZM${f1(x + sz * 0.5)} ${f1(y)}L${f1(x + sz * 0.5)} ${f1(y + sz * 1.1)}`;
          if (row === 3 && x > -60 && x < 140) hot += wd; else wedges += wd;
          x += sz * (1.6 + r() * 1.4);
        }
      }
      D.s(wedges, { w: 2.4, color: C.ink, alpha: 0.85 });
      const hotE = L0(tg, hot, C.inkSoft, 3, 0);
      const lab = P.label ? ital(g, P.label, cx, portrait ? 1000 : 860, 54, { color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2.6)); gl.set(0.14 + 0.03 * Math.sin(lt * 0.8));
          const th = cue(cues, 'hit', dur * 0.55), a = BTL.ease(lt, th, 1.2);
          hotE.setAttribute('stroke-opacity', BTL.ease(lt, 1.6, 1).toFixed(3)); hotE.setAttribute('stroke', a > 0.4 ? C.gold : C.ink);
          if (lab) fade(lab, BTL.ease(lt, th + 0.4, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_years
  SH.bt_gd_years = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const x0 = portrait ? 90 : 260, x1 = portrait ? W - 90 : 1660, y = portrait ? 640 : 520;
      const X = yr => x0 + (760 - yr) / 70 * (x1 - x0);   // 760 BC .. 690 BC, time runs to the right
      BTL.glow(svg, defs, W / 2, y, 700, C.stain, 0.08, g);
      const axis = LD(g, `M${x0} ${y}L${x1} ${y}`, C.inkSoft, 2.5);
      let ticks = ''; for (let yr = 760; yr >= 690; yr -= 10) ticks += `M${f1(X(yr))} ${y - 10}L${f1(X(yr))} ${y + 10}`;
      const tk = L0(g, ticks, C.inkSoft, 2, 0);
      const fs = portrait ? 44 : 44;
      const mk = (yr, top, bot, col) => {
        const m = el(g, 'g', { opacity: 0 });
        el(m, 'circle', { cx: X(yr), cy: y, r: 14, fill: col });
        L0(m, `M${f1(X(yr))} ${y - 20}L${f1(X(yr))} ${y - 120}`, col, 2.5);
        svgText(m, top, X(yr), y - 140, 60, { fill: C.ink, 'font-family': FR, 'font-weight': 400 });
        svgText(m, bot, X(yr), y + 80, fs, { fill: C.inkSoft, 'font-family': LO, 'font-style': 'italic' });
        return m;
      };
      const A = mk(740, 'mezar', 'MÖ 740', C.gold), B = mk(709, 'Mita', 'MÖ 709', C.ink);
      const who = ital(g, 'babası?', X(740), y + 150, 54, { color: C.gold });
      const life = LD(g, `M${f1(X(740) + 30)} ${y + 34}L${f1(X(709))} ${y + 34}`, C.inkSoft, 2);
      life.setAttribute('stroke-dasharray', '0.02 0.02');
      return {
        update(lt, dur, cues) {
          draw(axis, BTL.ease(lt, 0, 1.4)); tk.setAttribute('stroke-opacity', BTL.ease(lt, 0.6, 1).toFixed(3));
          fade(B, BTL.ease(lt, 0.8, 1.2));
          const ta = cue(cues, 'a', 1.6); fade(A, BTL.ease(lt, ta, 1.2)); draw(life, BTL.ease(lt, ta + 0.6, 1.4));
          fade(who, BTL.ease(lt, cue(cues, 'b', dur * 0.6), 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_vessel
  SH.bt_gd_vessel = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 600 : 470, s = portrait ? 0.9 : 1;
      const gl = BTL.glow(svg, defs, cx, cy + 120, 420, C.gold, 0, g);
      BTL.glow(svg, defs, cx, cy, 600, C.stain, 0.1, g);
      const tg = el(g, 'g', { transform: `translate(${cx} ${cy}) scale(${s})` });
      const D = BTL.drawing(tg);
      // a jar cut in half: the outer wall, the inner wall, the dark crust at the bottom
      const outer = 'M-120-300L120-300L130-260C260-200 300-40 270 120C240 260 120 320 0 320C-120 320-240 260-270 120C-300-40-260-200-130-260Z';
      const inner = 'M-96-280L96-280L104-244C230-186 268-40 240 112C212 240 110 292 0 292C-110 292-212 240-240 112C-268-40-230-186-104-244Z';
      D.f(outer, C.inkSoft, 0.45); D.f(inner, C.paperLight, 1);
      D.s(outer, { w: 4 }); D.s(inner, { w: 3, color: C.ink });
      const crust = 'M-200 200C-120 250 120 250 200 200C180 260 100 290 0 290C-100 290-180 260-200 200Z';
      const cr = P0(tg, crust, C.ink, 0);
      const crs = L0(tg, crust, C.gold, 3, 0);
      const r = rng(5); let dots = '';
      for (let i = 0; i < 60; i++) { const x = (r() - 0.5) * 340, y = 230 + r() * 50; if (Math.abs(x) < 190 - (y - 210) * 1.2) dots += BTL.E(x, y, 3, 3); }
      const dt = P0(tg, dots, C.gold, 0);
      const lab = P.label ? ital(g, P.label, cx, portrait ? 1060 : 862, 52, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2.2));
          const th = cue(cues, 'hit', dur * 0.55), a = BTL.ease(lt, th, 1.4);
          cr.setAttribute('fill-opacity', (0.55 * BTL.ease(lt, 1.2, 1.2)).toFixed(3)); crs.setAttribute('stroke-opacity', a.toFixed(3));
          dt.setAttribute('fill-opacity', (a * (0.7 + 0.3 * Math.sin(lt * 1.3))).toFixed(3));
          gl.set(0.25 * a);
          if (lab) fade(lab, BTL.ease(lt, th + 0.4, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_bowl
  function bowlD(x, y, s) {   // an omphalos bowl seen from the side, the boss shows as a bump in the rim line
    const X = v => f1(x + v * s), Y = v => f1(y + v * s);
    return {
      body: `M${X(-100)} ${Y(0)}C${X(-96)} ${Y(50)} ${X(-50)} ${Y(70)} ${X(0)} ${Y(70)}C${X(50)} ${Y(70)} ${X(96)} ${Y(50)} ${X(100)} ${Y(0)}Z`,
      rim: BTL.E(x, y, 100 * s, 14 * s),
    };
  }
  SH.bt_gd_bowl = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'mix', portrait = H > W, g = el(svg, 'g');
      if (mode === 'many') {
        const cols = 10, rows = 10, x0 = portrait ? 110 : 250, y0 = portrait ? 420 : 200, sx = portrait ? 88 : 92, sy = portrait ? 66 : 64, s = portrait ? 0.34 : 0.36;
        BTL.glow(svg, defs, x0 + sx * 4.5, y0 + sy * 4.5, 600, C.stain, 0.1, g);
        const list = [];
        for (let i = 0; i < 100; i++) {
          const b = bowlD(x0 + (i % cols) * sx, y0 + Math.floor(i / cols) * sy, s);
          const e = L0(g, b.body + b.rim, C.inkSoft, 2, 0);
          list.push(e);
        }
        const num = label(g, '100', portrait ? W / 2 : 1500, portrait ? 300 : 520, 220, { weight: 300, color: C.gold });
        const lab = ital(g, P.label || 'kâse', portrait ? W / 2 : 1500, portrait ? 370 : 600, 52, { color: C.ink });
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.35);
            list.forEach((e, i) => {
              const t = 0.1 + (i / 100) * Math.max(1.5, dur * 0.5);
              e.setAttribute('stroke-opacity', BTL.ease(lt, t, 0.5).toFixed(3));
              e.setAttribute('stroke', lt > t + 0.6 ? C.gold : C.inkSoft);
            });
            num.textContent = String(Math.round(100 * BTL.ease(lt, 0.1, Math.max(1.5, dur * 0.5))));
            fade(num, BTL.ease(lt, 0, 0.6)); fade(lab, BTL.ease(lt, th, 1));
          },
        };
      }
      // mix: one bowl, three sources above it pour into it on cues
      const cx = W / 2, by = portrait ? 860 : 690, s = portrait ? 2.6 : 2.6;
      const gl = BTL.glow(svg, defs, cx, by, 420, C.gold, 0.1, g);
      const D = BTL.drawing(el(g, 'g'));
      const b = bowlD(cx, by, s);
      D.f(b.body, C.paperLight, 1); D.f(BTL.E(cx, by, 100 * s, 14 * s), C.gold, 0.4);
      D.s(b.body, { w: 4 }); D.s(b.rim, { w: 3.5 });
      D.s(`M${cx - 30} ${by - 6}C${cx - 20} ${by - 26} ${cx + 20} ${by - 26} ${cx + 30} ${by - 6}`, { w: 2.5, color: C.inkSoft });
      const ys = portrait ? 420 : 290, xs = portrait ? [W / 2 - 300, W / 2, W / 2 + 300] : [cx - 520, cx, cx + 520];
      const icons = [
        // grapes
        (x, y) => { let d = ''; for (const [dx, dy] of [[-30, -20], [0, -24], [30, -20], [-15, 6], [15, 6], [0, 32]]) d += BTL.E(x + dx, y + dy, 16, 16); return d + `M${x} ${y - 44}L${x + 6} ${y - 70}`; },
        // barley ear
        (x, y) => { let d = `M${x} ${y + 60}L${x} ${y - 60}`; for (let k = 0; k < 5; k++) { const yy = y - 50 + k * 22; d += `M${x} ${yy}C${x - 20} ${yy - 4} ${x - 26} ${yy - 20} ${x - 18} ${yy - 30}M${x} ${yy}C${x + 20} ${yy - 4} ${x + 26} ${yy - 20} ${x + 18} ${yy - 30}`; } return d; },
        // honeycomb
        (x, y) => { let d = ''; for (const [dx, dy] of [[0, 0], [-34, -20], [34, -20], [-34, 20], [34, 20], [0, -40], [0, 40]]) { const hx = x + dx, hy = y + dy; d += `M${hx - 20} ${hy}L${hx - 10} ${hy - 18}L${hx + 10} ${hy - 18}L${hx + 20} ${hy}L${hx + 10} ${hy + 18}L${hx - 10} ${hy + 18}Z`; } return d; },
      ];
      const names = P.names || ['şarap', 'bira', 'bal'];
      const items = ['a', 'b', 'c'].map((k, i) => {
        const ig = el(g, 'g', { opacity: 0 });
        L0(ig, icons[i](xs[i], ys), C.ink, 2.5);
        svgText(ig, names[i], xs[i], ys + 120, 50, { fill: C.inkSoft, 'font-family': LO, 'font-style': 'italic' });
        const flow = LD(g, `M${xs[i]} ${ys + 150}C${xs[i]} ${by - 160} ${cx + (xs[i] - cx) * 0.2} ${by - 120} ${cx + (xs[i] - cx) * 0.1} ${by - 20}`, C.gold, 3);
        return { k, ig, flow, fb: 0.6 + i * 1.2 };
      });
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6)); gl.set(0.1 + 0.05 * BTL.ease(lt, dur * 0.6, 2) + 0.02 * Math.sin(lt));
          for (const it of items) { const t = cue(cues, it.k, it.fb); fade(it.ig, BTL.ease(lt, t - 0.2, 1)); draw(it.flow, BTL.ease(lt, t + 0.4, 1.4)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_layer
  SH.bt_gd_layer = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'fire';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const bands = [[120, C.paperLight, 0.5], [300, C.paper, 1], [430, C.paperLight, 0.35], [520, C.paperDark, 1], [700, C.paper, 1], [820, C.paperLight, 0.4], [960, C.paper, 1]];
      const wav = (y, k) => `M-200 ${y}C300 ${y - 10 - k} 700 ${y + 12} 1100 ${y - 6}C1500 ${y - 18 + k} 1800 ${y + 4} 2120 ${y}`;
      P0(g, rect(-200, -200, 2120, 1800), C.paper, 1);
      bands.forEach(([y, col, a], i) => { P0(g, wav(y, i * 3) + `L2120 1800L-200 1800Z`, col, a); });
      let lines = ''; bands.forEach(([y], i) => { lines += wav(y, i * 3); });
      const ln = LD(g, lines, C.inkSoft, 2, 0.8);
      // the burnt layer: 520..700, dark, with a stone wall stump, charred beams and slowly breathing embers
      const burn = el(g, 'g');
      L0(burn, stones(620, 640, 160, 70, 40, 3, 22), C.inkSoft, 2, 0.8);
      L0(burn, 'M900 600L1200 620M1300 650L1560 630M300 630L520 610', C.ink, 6, 0.7);
      const r = rng(13), emb = [];
      for (let i = 0; i < 40; i++) emb.push({ e: el(burn, 'circle', { cx: f1(r() * 1920), cy: f1(540 + r() * 150), r: f1(2 + r() * 3), fill: C.red, 'fill-opacity': 0 }), ph: r() * 6.28, sp: 0.4 + r() * 0.5 });
      const gl = BTL.glow(svg, defs, 1100, 610, 700, C.red, 0, g);
      const lab = P.label ? label(g, P.label, 1500, 470, 64, { color: C.gold }) : null;
      const arrow = P.label ? LD(g, 'M1500 490L1500 580', C.gold, 3) : null;
      return {
        update(lt, dur, cues) {
          draw(ln, BTL.ease(lt, 0, 1.8));
          const on = BTL.ease(lt, 0.8, 1.6);
          for (const m of emb) m.e.setAttribute('fill-opacity', (on * (0.35 + 0.3 * Math.sin(lt * m.sp + m.ph))).toFixed(3));
          gl.set((0.1 + 0.03 * Math.sin(lt * 0.8)) * on);
          if (lab) { const th = cue(cues, 'hit', dur * 0.45); fade(lab, BTL.ease(lt, th, 1.2)); draw(arrow, BTL.ease(lt, th + 0.3, 1)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_knot
  SH.bt_gd_knot = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'knot';
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 500 });
      const kx = 1020, ky = 480;
      const gl = BTL.glow(svg, defs, kx, ky, 520, C.stain, 0.16, g);
      // the wagon pole from the left, the yoke across it
      const pole = BTL.drawing(el(g, 'g'));
      pole.f(`M-200 ${ky - 30}L${kx + 140} ${ky - 30}L${kx + 140} ${ky + 30}L-200 ${ky + 30}Z`, C.paperLight, 1);
      pole.s(`M-200 ${ky - 30}L${kx + 140} ${ky - 30}L${kx + 140} ${ky + 30}L-200 ${ky + 30}`, { w: 3.5 });
      pole.s(`M100 ${ky - 8}L${kx - 200} ${ky - 8}M200 ${ky + 12}L${kx - 260} ${ky + 12}`, { w: 1.6, color: C.inkSoft, alpha: 0.7 });
      pole.f(`M${kx + 40} ${ky - 330}C${kx + 70} ${ky - 200} ${kx + 70} ${ky + 200} ${kx + 40} ${ky + 330}L${kx + 90} ${ky + 330}C${kx + 120} ${ky + 200} ${kx + 120} ${ky - 200} ${kx + 90} ${ky - 330}Z`, C.paperLight, 1);
      pole.s(`M${kx + 40} ${ky - 330}C${kx + 70} ${ky - 200} ${kx + 70} ${ky + 200} ${kx + 40} ${ky + 330}L${kx + 90} ${ky + 330}C${kx + 120} ${ky + 200} ${kx + 120} ${ky - 200} ${kx + 90} ${ky - 330}Z`, { w: 3.5 });
      // the knot: many wound loops around the joint, in two halves (they part when cut)
      const halves = [el(g, 'g'), el(g, 'g')];
      const r = rng(29);
      for (let i = 0; i < 26; i++) {
        const a = r() * 180, rx = 70 + r() * 70, ry = 26 + r() * 30, dx = (r() - 0.5) * 60, dy = (r() - 0.5) * 60;
        const hh = halves[dy < 0 ? 0 : 1];
        const e = L0(hh, BTL.E(0, 0, rx, ry), i % 5 === 0 ? C.gold : C.ink, 3, 0.9);
        e.setAttribute('transform', `translate(${f1(kx + 64 + dx)} ${f1(ky + dy)}) rotate(${f1(a)})`);
        e.setAttribute('pathLength', 1); draw(e, 0);
      }
      const loops = [...halves[0].children, ...halves[1].children];
      const blade = LD(g, `M${kx - 260} ${ky + 300}L${kx + 380} ${ky - 300}`, C.ink, 5);
      const peg = el(g, 'g', { opacity: 0 });
      L0(peg, `M${kx + 120} ${ky}L${kx + 300} ${ky}`, C.gold, 14);
      return {
        update(lt, dur, cues) {
          pole.reveal(BTL.ease(lt, 0, 1.8)); gl.set(0.14 + 0.03 * Math.sin(lt * 0.8));
          loops.forEach((e, i) => draw(e, BTL.ease(lt, 0.6 + i * 0.07, 1.2)));
          if (mode === 'cut') {
            const th = cue(cues, 'hit', dur * 0.3), k = BTL.ease(lt, th + 0.3, 1.8);
            draw(blade, BTL.ease(lt, th, 0.5)); blade.style.opacity = String(1 - BTL.ease(lt, th + 0.6, 1));
            halves[0].setAttribute('transform', `translate(0 ${f1(-60 * k)})`); halves[1].setAttribute('transform', `translate(0 ${f1(60 * k)})`);
            const tp = cue(cues, 'pin', dur * 0.75), pk = BTL.ease(lt, tp, 1.6);
            fade(peg, pk); peg.setAttribute('transform', `translate(${f1(120 * pk)} 0)`);
          } else { blade.style.opacity = '0'; }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_gd_cloth
  let clothN = 0;
  SH.bt_gd_cloth = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      // P.s scales the coffin (0.65 = compact, for a close-up); the cloth follows the body: feet low, chest, the head
      // raised at the east (right) end; it hangs over the front edge, so the log coffin and its cut ends show below
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const s = P.s || 1, k = 1.15 * s, cx = 960, cy = 600 - 40 * (1 - s);
      const gl = BTL.glow(svg, defs, cx, cy, 700 * s + 120, C.gold, 0.06, g);
      L0(g, `M-200 ${f1(cy + 170 * k)}L2120 ${f1(cy + 170 * k)}`, C.inkSoft, 1.5, 0.4);
      const cf = coffin(g, cx, cy, k, false);
      const lg = el(g, 'g', { transform: `translate(${cx} ${f1(cy)}) scale(${f1(k)})` });
      // the cut log ends of the coffin (end grain)
      const ends = L0(lg, BTL.E(-384, 62, 20, 62) + BTL.E(-384, 62, 10, 34) + BTL.E(384, 62, 20, 62) + BTL.E(384, 62, 10, 34), C.inkSoft, 2.5);
      const cloth = 'M-352 4C-330-18-260-26-170-30C-100-34-40-40 20-40C100-42 170-52 240-50C262-50 276-58 288-74C300-92 340-96 360-78' +
        'C376-62 378-30 372 2C374 22 370 40 366 58C330 66 300 54 262 64C200 74 160 58 100 68C40 78-20 60-80 70C-150 80-210 62-270 70C-310 74-340 66-354 60C-358 40-358 20-352 4Z';
      const D = BTL.drawing(lg);
      D.f(cloth, C.paperLight, 1); D.s(cloth, { w: 3.2 / k });
      D.s('M-260 8C-262 30-258 50-262 70M-150 4C-154 30-148 54-152 76M-40 0C-44 26-38 50-42 72M70-4C66 22 72 46 68 70M180-10C176 18 182 42 178 64M290-12C288 14 292 36 290 60', { w: 1.8 / k, color: C.inkSoft });
      D.s('M300-70C318-84 344-82 352-66', { w: 2 / k, color: C.inkSoft });   // the head under the cloth
      const cid = 'gdcloth' + (++clothN);
      const cp = el(lg, 'clipPath', { id: cid }); el(cp, 'path', { d: cloth });
      const sheenG = el(lg, 'g', { 'clip-path': `url(#${cid})` });
      const sheen = P0(sheenG, '', C.gold, 0);
      let thread = ''; for (let x = -360; x < 380; x += 18) thread += `M${x} -100L${x + 40} 80`;
      const th = L0(sheenG, thread, C.gold, 1.2 / k, 0);
      const lab = P.label ? ital(g, P.label, 960, 875, 56, { color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          cf.D.reveal(BTL.ease(lt, 0, 1.6)); D.reveal(BTL.ease(lt, 0.4, 1.8)); fade(ends, BTL.ease(lt, 0.6, 1.2));
          const t0 = cue(cues, 'hit', dur * 0.35), a = BTL.ease(lt, t0, 1.6);
          const x = -560 + ((lt * 120) % 1100);
          sheen.setAttribute('d', `M${f1(x)} -110L${f1(x + 170)} -110L${f1(x + 90)} 90L${f1(x - 80)} 90Z`);
          sheen.setAttribute('fill-opacity', (0.42 * a).toFixed(3));
          th.setAttribute('stroke-opacity', (0.4 * a).toFixed(3));
          gl.set(0.06 + 0.2 * a);
          if (lab) fade(lab, BTL.ease(lt, t0 + 0.6, 1.2));
        },
      };
    },
  };
})();
