// bt_ani: Ani, the "city of 1001 churches" on the Arpaçay (Kars), belgesel style (docs/BELGESEL.md). Still line art
// in the theme's tokens; the only motion is slow and natural (drifting dust, breathing light, falling grain or stone,
// a slow sun). Places are drawn on the 1920x1080 stage (BTL.stage frames them for a Short). Shared drawings live in
// window.ANI (used by bt_ani_b.js).
//   bt_an_dig      P: {mode: "pit"|"jars"|"find"|"last", label, sub}  cues: hit (jars: the jars draw in one by one;
//                  find: label), m (jars: the "> 1 m" scale bar)   an excavation pit cut into the steppe with five big
//                  storage jars (pithoi). pit: the soil slowly sinks, only the rims show. last: the jars in a light pool
//   bt_an_jar      P: {mode: "mouth"|"fill"|"relief", label, sub}  cues: hit, b   one big jar in a light pool.
//                  mouth: "≈ 50 cm" across the dark mouth on hit, the inside darkens on b. fill: cut open, grain rises on
//                  hit and fades to a dashed level line on b. relief: the S-shaped appliqué band lights gold on hit
//   bt_an_skyline  P: {mode: "ruins"|"rise"|"glow"|"unesco", label, sub}  cues: hit   the plateau's skyline: the
//                  cathedral, churches with conical domes, walls, a minaret. rise: churches draw in one by one
//   bt_an_cathedral P: {mode: "build"|"crescent"|"collapse"|"ruin"|"night", label, sub}  cues: hit, a, b
//                  the cathedral (blind arcades, gabled roof, drum and conical dome). crescent: the cross fades on a,
//                  a gold crescent appears on b. collapse: drum and dome come down on hit. ruin/night: dome gone
//   bt_an_dome     P: {label, sub}  cues: hit   Hagia Sophia's great dome on its window ring with a broken western
//                  part (dashed); on hit the missing part redraws in gold
//   bt_an_plateau  P: {mode: "site"|"walls", label}  cues: hit (river label / the double wall)   plan of the
//                  triangular plateau between two gorges, the Arpaçay on the east
//   bt_an_map      P: {bounds, points: [{lon, lat, label, sub, at, side, dy}], routes: [{path, at, dashed, fade}],
//                  regions: [{lon, lat, text}]}  cues: the "at" names (route "fade": the route turns dashed at that cue)
//                  the Black Sea, the Caspian and the eastern Mediterranean, land a shade lighter than the water
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const T = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const ital = (g, s, x, y, size = 46, o = {}) => T(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft }, o));
  const place = (parent, x, y, s = 1, rot = 0) => el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})` });
  const stroke = (e, p) => { e.setAttribute('pathLength', 1); draw(e, clamp01(p)); };

  const ANI = window.ANI = { f1, fade, P0, L0, T, ital, place, stroke, uid: 0 };
  const clay = () => mix(C.paperLight, C.red, 0.16), clayDark = () => mix(C.paperDark, C.red, 0.2);

  // slow drifting motes inside a box (dust in the air)
  ANI.dust = (g, seed, n, box, o = {}) => {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), x: r(), y: r(), s: 1.6 + r() * 2.8, v: 0.01 + r() * 0.018, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.x + q.v * lt * (o.dir ?? 1) + 10) % 1, x = box[0] + u * w, y = box[1] + q.y * h + 12 * Math.sin(lt * 0.33 + q.ph) + (o.fall || 0) * lt;
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.45) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  };
  // soft puffs rising (smoke, dust clouds)
  ANI.puffs = (g, seed, n, o) => {
    const r = rng(seed), list = [];
    let fill = o.color || C.inkSoft;
    if (o.defs) {
      const id = 'anpf' + (++ANI.uid), rg = el(o.defs, 'radialGradient', { id });
      el(rg, 'stop', { offset: '0', 'stop-color': fill, 'stop-opacity': 1 });
      el(rg, 'stop', { offset: '0.55', 'stop-color': fill, 'stop-opacity': 0.5 });
      el(rg, 'stop', { offset: '1', 'stop-color': fill, 'stop-opacity': 0 });
      fill = `url(#${id})`;
    }
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', fill, 0), ph: i / n, rx: o.size * (0.7 + r() * 0.6), x0: o.x0 + (r() - 0.5) * o.spread });
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.06)) % 1, x = q.x0 + o.dx * u, y = o.y0 + o.dy * u, s = 0.5 + 1.2 * u;
      q.e.setAttribute('d', BTL.E(x, y, q.rx * s, q.rx * s * 0.62));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.16) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  };
  // steppe ground from y down to the bottom of a vertical frame, with a few still grass strokes
  ANI.ground = (g, y, o = {}) => {
    P0(g, `M-400 ${y}L2320 ${y}L2320 1900L-400 1900Z`, o.color || C.paperDark, o.alpha ?? 0.75);
    L0(g, `M-400 ${y}L2320 ${y}`, C.inkSoft, 2, 0.7);
    const r = rng(o.seed || 9); let d = '';
    for (let i = 0; i < (o.n ?? 30); i++) { const x = -200 + r() * 2320, yy = y + 30 + Math.pow(r(), 1.4) * 260; d += `M${f1(x)} ${f1(yy)}l${f1(24 + r() * 60)} 0`; }
    L0(g, d, C.inkSoft, 2, 0.32);
  };

  // ------------------------------------------------------------------ the storage jar (pithos), origin = centre,
  // ~340 x 400 at s = 1: wide shoulder, narrow foot, thick rim, a band of S-shaped appliqué on the shoulder
  const JAR = 'M-72-198C-74-186-86-176-102-168C-174-132-190-44-170 36C-150 114-104 172-64 198L64 198C104 172 150 114 170 36C190-44 174-132 102-168C86-176 74-186 72-198Z';
  const sRow = (y, x0, x1, step) => { let d = ''; for (let x = x0; x <= x1; x += step) d += `M${x + 9} ${y - 15}C${x - 7} ${y - 17} ${x - 7} ${y - 2} ${x} ${y}C${x + 7} ${y + 2} ${x + 7} ${y + 17} ${x - 9} ${y + 15}`; return d; };
  ANI.jar = (parent, x, y, s = 1, o = {}) => {
    const g = place(parent, x, y, s), w = v => v / s * (o.k || 1);
    const body = P0(g, JAR, clay(), 1);
    // soft shading on the right flank
    P0(g, 'M80-150C150-110 170-30 156 40C140 110 104 160 64 190L40 190C80 150 120 100 128 30C136-40 120-110 80-150Z', clayDark(), 0.55);
    const inner = o.cut ? P0(g, 'M-58-186C-150-140-172-50-154 30C-136 104-96 158-56 184L56 184C96 158 136 104 154 30C172-50 150-140 58-186Z', C.paperLight, 1) : null;
    const grain = o.cut ? el(g, 'g') : null;
    const out = L0(g, JAR, C.ink, w(3.2), 1);
    const band = L0(g, 'M-170-124Q0-108 170-124M-180-84Q0-68 180-84', C.inkSoft, w(2), 0.8);
    const S = L0(g, sRow(-104, -144, 144, 36), C.ink, w(2.6), 0.85);
    const low = L0(g, 'M-176 20Q0 36 176 20', C.inkSoft, w(1.6), 0.5);
    const rim = P0(g, BTL.E(0, -198, 78, 16), C.paperLight, 1);
    const rimL = L0(g, BTL.E(0, -198, 78, 16), C.ink, w(3), 1);
    const mouth = P0(g, BTL.E(0, -198, 60, 10), C.ink, 0.82);
    return { g, body, out, band, S, low, rim, rimL, mouth, inner, grain };
  };
  // grain inside a cut-open jar, level 0..1 (bottom 184 -> top -150)
  ANI.grainD = (lv, seed = 3) => {
    const top = 184 - lv * 330; if (lv <= 0.001) return '';
    const half = yy => { const t = (yy + 186) / 370; return 58 + 110 * Math.sin(Math.PI * Math.min(1, t * 1.18)) * (yy < 160 ? 1 : 0.6); };
    const r = rng(seed); let d = '';
    for (let yy = top + 8; yy < 182; yy += 13) { const hw = half(yy) - 14; for (let xx = -hw; xx < hw; xx += 15) { const jx = xx + (r() - 0.5) * 6, jy = yy + (r() - 0.5) * 5; d += BTL.E(+jx.toFixed(1), +jy.toFixed(1), 5, 3.6); } }
    return d;
  };

  // ------------------------------------------------------------------ an Armenian church: block, drum, conical dome
  ANI.church = (parent, x, y, s = 1, o = {}) => {
    const g = place(parent, x, y, s), w = v => v / s;
    const fill = o.fill || mix(C.paperDark, C.ink, 0.12);
    const body = `M-80 0L-80-92L0-128L80-92L80 0Z`;
    const drum = `M-30-112L-30-170L30-170L30-112Z`;
    const cone = o.ruin ? 'M-34-170L-6-206L8-196L34-170Z' : 'M-36-170L0-228L36-170Z';
    for (const d of [body, drum, cone]) P0(g, d, fill, 1);
    L0(g, body + drum + cone, C.ink, w(2.4), 0.9);
    L0(g, 'M-10-150L-10-130M10-150L10-130M-56-30L-56-66M56-30L56-66', C.inkSoft, w(2), 0.7);
    if (o.ruin) L0(g, 'M30-170L38-150L30-140', C.ink, w(2), 0.8);
    const lamp = P0(g, 'M-6-10L-6-34Q0-42 6-34L6-10Z', C.gold, 0);
    return { g, lamp };
  };

  // ------------------------------------------------------------------ the cathedral (origin = centre of the base)
  // Ani Cathedral as seen from the side: a near-square stone block with tall, narrow blind arcades, a pointed portal
  // and window, low gables, the tall drum with narrow windows and a sharp conical dome. ruin: the drum is a broken stump
  // (the dome fell in 1319) with one gold broken edge, and a piece of the east corner has fallen away.
  // Returned: Hb (body height), DB/DT/AP (drum base, drum top, apex; local y).
  ANI.cathedral = (parent, x, y, s = 1, o = {}) => {
    const g = place(parent, x, y, s), w = v => v / s, D = BTL.drawing(g);
    const W2 = 300, Hb = 420, DB = -Hb - 70, DT = -Hb - 270, AP = -Hb - 430, DW = 92;
    const wall = mix(C.paperLight, C.paperDark, 0.4), dark = mix(C.paperDark, C.ink, 0.14);
    const body = `M${-W2} 0L${-W2} ${-Hb}L${W2} ${-Hb}L${W2} 0Z`;
    const roof = `M${-W2 - 12} ${-Hb}L${-W2 + 40} ${-Hb - 26}L-60 ${-Hb - 104}L60 ${-Hb - 104}L${W2 - 40} ${-Hb - 26}L${W2 + 12} ${-Hb}Z`;
    D.f(body, wall, 1); D.f(roof, dark, 1);
    D.s(body, { w: w(o.ruin ? 4.6 : 3.4) }); D.s(roof, { w: w(o.ruin ? 4.6 : 3.4) });
    // blind arcade: seven tall, narrow arches on slim colonnettes
    let arc = ''; const n = 7, step = (2 * W2 - 40) / n;
    for (let i = 0; i < n; i++) { const x0 = -W2 + 20 + i * step + 8, x1 = x0 + step - 16, top = -Hb + 70, mx = (x0 + x1) / 2; arc += `M${f1(x0)} -20L${f1(x0)} ${top}Q${f1(x0)} ${top - 46} ${f1(mx)} ${top - 52}Q${f1(x1)} ${top - 46} ${f1(x1)} ${top}L${f1(x1)} -20`; }
    D.s(arc, { w: w(2), color: C.inkSoft });
    // pointed portal and a tall pointed window above it
    const portal = 'M-40 0L-40-150Q-40-200 0-214Q40-200 40-150L40 0Z', win = `M-16 -250L-16 -320Q-16 -342 0 -350Q16 -342 16 -320L16 -250Z`;
    D.f(portal, mix(C.paperDark, C.ink, 0.4), 1); D.s(portal, { w: w(3) });
    D.f(win, mix(C.paperDark, C.ink, 0.45), 1); D.s(win, { w: w(2.6) });
    const top = { g: el(g, 'g') }, TD = BTL.drawing(top.g);
    const drumWins = (y1, y2) => { let d = ''; for (const xx of [-54, -18, 18, 54]) d += `M${xx - 7} ${y1}L${xx - 7} ${y2 + 10}Q${xx} ${y2} ${xx + 7} ${y2 + 10}L${xx + 7} ${y1}Z`; return d; };
    if (!o.ruin) {
      const drum = `M${-DW} ${DB}L${-DW} ${DT}L${DW} ${DT}L${DW} ${DB}Z`, cone = `M${-DW - 14} ${DT}L0 ${AP}L${DW + 14} ${DT}Z`;
      TD.f(drum, wall, 1); TD.f(cone, dark, 1);
      TD.s(drum, { w: w(3.2) }); TD.s(cone, { w: w(3.2) });
      TD.f(drumWins(DB - 60, DB - 150), mix(C.paperDark, C.ink, 0.45), 1);
      TD.s(`M${-DW} ${DT + 16}L${DW} ${DT + 16}`, { w: w(2), color: C.inkSoft });
    } else {
      // the broken drum: left side stands higher, the right side has fallen
      const edgeT = `L${-DW} ${DB - 150}L-60 ${DB - 132}L-38 ${DB - 160}L-10 ${DB - 104}L18 ${DB - 96}L44 ${DB - 62}L70 ${DB - 56}L${DW} ${DB - 30}`;
      const stump = `M${-DW} ${DB}${edgeT}L${DW} ${DB}Z`;
      D.f(stump, wall, 1); D.s(stump, { w: w(4.4) });
      D.f(`M-61 ${DB - 30}L-61 ${DB - 100}Q-54 ${DB - 112} -47 ${DB - 100}L-47 ${DB - 30}Z`, mix(C.paperDark, C.ink, 0.45), 1);
      D.s(`M${-DW} ${DB - 150}` + edgeT.slice(edgeT.indexOf('L', 1)), { w: w(7), color: C.gold });
      // a piece of the east corner has fallen away (the sky shows through)
      const gp = `M${W2 + 1} ${-Hb - 1}L${W2 - 86} ${-Hb - 1}L${W2 - 70} ${-Hb + 40}L${W2 - 110} ${-Hb + 100}L${W2 - 60} ${-Hb + 160}L${W2 - 84} ${-Hb + 220}L${W2 - 30} ${-Hb + 250}L${W2 + 1} ${-Hb + 250}Z`;
      D.f(gp, C.paper, 1);
      D.s(`M${W2 - 86} ${-Hb}L${W2 - 70} ${-Hb + 40}L${W2 - 110} ${-Hb + 100}L${W2 - 60} ${-Hb + 160}L${W2 - 84} ${-Hb + 220}L${W2 - 30} ${-Hb + 250}L${W2} ${-Hb + 250}`, { w: w(6), color: C.gold });
      D.f(`M${W2 - 90} 0L${W2 - 80} -28L${W2 - 40} -34L${W2 - 20} -10L${W2 + 20} -22L${W2 + 60} 0Z`, dark, 1);
      D.s(`M${W2 - 90} 0L${W2 - 80} -28L${W2 - 40} -34L${W2 - 20} -10L${W2 + 20} -22L${W2 + 60} 0`, { w: w(2.6) });
    }
    return { g, D, top, TD, Hb, DB, DT, AP, DW };
  };

  // ------------------------------------------------------------------ bt_an_dig
  SH.bt_an_dig = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'pit', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 640, k: 1.45 });
      const last = mode === 'last';
      const SY = 470, PY = 880;   // surface line, pit floor
      const sun = BTL.glow(svg, defs, 1500, 360, 420, C.stain, last ? 0.12 : 0.3, g);
      // far plateau ruins on the horizon
      const far = el(g, 'g', { opacity: last ? 0.25 : 0.6 });
      ANI.church(far, 1640, SY, 0.34, { fill: C.paperDark }); ANI.church(far, 1760, SY, 0.24, { ruin: true, fill: C.paperDark }); ANI.church(far, 260, SY, 0.28, { fill: C.paperDark });
      ANI.ground(g, SY, { seed: 4, n: 0, alpha: 0.6 });
      // the pit: cut walls with soil strata
      const pit = `M360 ${SY}L1560 ${SY}L1540 ${PY}L380 ${PY}Z`;
      P0(g, pit, mix(C.paperDark, C.ink, 0.12), 1);
      let strata = ''; for (const yy of [540, 610, 700, 790]) strata += `M372 ${yy}Q600 ${yy + 8} 760 ${yy - 4}M1160 ${yy - 4}Q1360 ${yy + 10} 1550 ${yy}`;
      L0(g, strata, C.inkSoft, 2, 0.45);
      L0(g, pit, C.ink, 3, 0.9);
      // grid pegs and string on the rim
      L0(g, `M360 ${SY}L360 ${SY - 50}M760 ${SY}L760 ${SY - 50}M1160 ${SY}L1160 ${SY - 50}M1560 ${SY}L1560 ${SY - 50}M360 ${SY - 40}L1560 ${SY - 40}`, C.inkSoft, 2, 0.6);
      const pool = BTL.glow(svg, defs, 960, 690, 640, C.stain, last ? 0.5 : 0.22, g);
      // five jars, alternately set back
      const J = [[565, PY - 34, 0.74], [762, PY - 52, 0.68], [960, PY - 30, 0.8], [1158, PY - 52, 0.68], [1355, PY - 34, 0.74]];
      const jars = J.map(([x, y, s]) => { const jg = el(g, 'g'); return { jg, J: ANI.jar(jg, x, y - 198 * s, s) }; });
      // the order: back jars first
      for (const i of [1, 3]) g.insertBefore(jars[i].jg, jars[0].jg);
      // soil still covering them (pit mode): sinks slowly
      const soil = mode === 'pit' ? P0(g, '', mix(C.paperDark, C.ink, 0.1), 1) : null;
      const soilL = mode === 'pit' ? L0(g, '', C.inkSoft, 2.5, 0.8) : null;
      const person = mode === 'find' ? BTL.person(g, 'kneel', 1660, SY, 190, { face: -1 }) : null;
      if (person) person.setAttribute('opacity', 0);
      // the scale bar
      const bar = mode === 'jars' ? el(g, 'g', { opacity: 0 }) : null;
      if (bar) { L0(bar, `M1600 ${PY - 30}L1600 ${PY - 30 - 300}M1584 ${PY - 30}L1616 ${PY - 30}M1584 ${PY - 330}L1616 ${PY - 330}`, C.gold, 3.5, 1); const t = T(bar, '> 1 m', 1636, PY - 165, 54, { anchor: 'start', color: C.gold }); t.setAttribute('opacity', 1); }
      const lab = P.label ? T(g, P.label, 960, 150, 64, { weight: 300 }) : null;
      const sub = P.sub ? ital(g, P.sub, 960, 220, 44) : null;
      const ds = ANI.dust(g, 17, 34, [300, 300, 1620, 900], { alpha: last ? 0.5 : 0.4 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); sun.set((last ? 0.12 : 0.3) + 0.03 * Math.sin(lt * 0.4));
          pool.set((last ? 0.5 : 0.22) + 0.05 * Math.sin(lt * 0.6));
          const hit = cue(cues, 'hit', 0.8);
          jars.forEach((j, i) => {
            const a = mode === 'jars' ? BTL.ease(lt, hit - 0.2 + i * 0.45, 1.2) : 1;
            j.jg.setAttribute('opacity', a.toFixed(3));
            if (last) j.J.S.setAttribute('stroke', C.gold);
          });
          if (soil) {
            const y = 566 + 22 * BTL.ease(lt, 0, Math.max(5, dur));
            const d = `M381 ${f1(y)}Q960 ${f1(y - 14)} 1539 ${f1(y)}L1540 ${PY}L380 ${PY}Z`;
            soil.setAttribute('d', d); soilL.setAttribute('d', `M381 ${f1(y)}Q960 ${f1(y - 14)} 1539 ${f1(y)}`);
          }
          if (bar) fade(bar, BTL.ease(lt, cue(cues, 'm', dur * 0.6), 1));
          if (person) fade(person, BTL.ease(lt, 0.4, 1.4));
          if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', 0.6), 1.2));
          if (sub) fade(sub, BTL.ease(lt, cue(cues, 'hit', 0.6) + 0.6, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_jar
  SH.bt_an_jar = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'mouth', portrait = H > W, g = el(svg, 'g');
      const cx = portrait ? W / 2 : 900, cy = portrait ? 640 : 500, s = portrait ? 1.3 : 1.42;
      const pool = BTL.glow(svg, defs, cx, cy + 40, 560, C.stain, 0.34, g);
      P0(g, BTL.E(cx, cy + 198 * s + 6, 210 * s, 26 * s), C.ink, 0.12);
      const J = ANI.jar(g, cx, cy, s, { cut: mode === 'fill' });
      const lx = portrait ? W / 2 : 1440, ly = portrait ? 1080 : 470;
      const lab = P.label ? T(g, P.label, lx, ly, 64, { weight: 300, color: mode === 'relief' ? C.gold : C.ink }) : null;
      const sub = P.sub ? ital(g, P.sub, lx, ly + 70, 46) : null;
      // mouth: a measuring line across the rim
      let meas = null, dark = null;
      if (mode === 'mouth') {
        meas = el(g, 'g', { opacity: 0 });
        const y = cy - 198 * s - 60;
        L0(meas, `M${f1(cx - 60 * s)} ${f1(y)}L${f1(cx + 60 * s)} ${f1(y)}M${f1(cx - 60 * s)} ${f1(y - 16)}L${f1(cx - 60 * s)} ${f1(y + 16)}M${f1(cx + 60 * s)} ${f1(y - 16)}L${f1(cx + 60 * s)} ${f1(y + 16)}`, C.gold, 3.5);
        const t = T(meas, '≈ 50 cm', cx, y - 34, 52, { color: C.gold }); t.setAttribute('opacity', 1);
        dark = J.mouth;
      }
      let grain = null, level = null;
      if (mode === 'fill') { grain = P0(J.grain, '', clayDark(), 1); level = L0(J.grain, '', C.gold, 4 / s, 1, { 'stroke-dasharray': `${12 / s} ${10 / s}` }); }
      const glints = mode === 'relief' ? L0(J.g, J.S.getAttribute('d'), C.gold, 4.2 / s, 0) : null;
      const ds = ANI.dust(g, 31, 22, [cx - 420, cy - 380, cx + 420, cy + 320], { alpha: 0.4 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); pool.set(0.34 + 0.05 * Math.sin(lt * 0.55));
          const hit = cue(cues, 'hit', dur * 0.35), b = cue(cues, 'b', dur * 0.7);
          if (meas) { fade(meas, BTL.ease(lt, hit - 0.2, 1)); dark.setAttribute('fill-opacity', (0.82 + 0.16 * BTL.ease(lt, b - 0.3, 1.6)).toFixed(3)); }
          if (grain) {
            const up = BTL.ease(lt, hit - 0.3, 2.4), gone = BTL.ease(lt, b - 0.2, 1.8);
            grain.setAttribute('d', ANI.grainD(0.72 * up)); grain.setAttribute('fill-opacity', (1 - gone).toFixed(3));
            const yy = 184 - 0.72 * up * 330;
            level.setAttribute('d', up > 0.02 ? `M${f1(-150)} ${f1(yy)}L150 ${f1(yy)}` : '');
            level.setAttribute('stroke-opacity', (gone * 0.9).toFixed(3));
          }
          if (glints) glints.setAttribute('stroke-opacity', (BTL.ease(lt, hit - 0.2, 1.4) * (0.85 + 0.1 * Math.sin(lt * 0.8))).toFixed(3));
          if (lab) fade(lab, BTL.ease(lt, (mode === 'relief' ? hit : 0.6) + 0.1, 1.2));
          if (sub) fade(sub, BTL.ease(lt, mode === 'relief' ? b : 1.2, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_skyline
  SH.bt_an_skyline = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'ruins', st0 = BTL.stage(svg, W, H, { fx: 960, fy: 560, k: 1.6 });
      const HY = 700, g = el(st0.g, 'g', { transform: `translate(960 ${HY}) scale(1.45) translate(-960 ${-HY})` });
      const sunY = mode === 'unesco' ? 600 : 520, sun = BTL.glow(svg, defs, 1380, sunY, 560, C.stain, mode === 'glow' ? 0.2 : 0.36, g);
      const disc = mode === 'unesco' || mode === 'ruins' ? P0(g, '', C.gold, 0.5) : null;
      // the plateau edge: a long low rise, a gorge dropping on the right
      const land = `M-400 ${HY + 10}L180 ${HY - 10}L1500 ${HY - 14}L1640 ${HY + 40}L1700 ${HY + 150}L1760 ${HY + 160}L1800 ${HY + 60}L2320 ${HY + 40}L2320 1900L-400 1900Z`;
      P0(g, land, C.paperDark, 0.8);
      L0(g, `M-400 ${HY + 10}L180 ${HY - 10}L1500 ${HY - 14}L1640 ${HY + 40}L1700 ${HY + 150}L1760 ${HY + 160}L1800 ${HY + 60}L2320 ${HY + 40}`, C.inkSoft, 2.4, 0.8);
      L0(g, `M1690 ${HY + 150}Q1730 ${HY + 170} 1770 ${HY + 156}`, C.blue, 3, 0.6);
      // the wall on the left
      let wall = `M-60 ${HY}L-60 ${HY - 90}`;
      for (let x = -60; x < 420; x += 120) wall += `L${x + 40} ${HY - 90}L${x + 40} ${HY - 130}Q${x + 80} ${HY - 150} ${x + 120} ${HY - 130}L${x + 120} ${HY - 90}`;
      wall += `L420 ${HY}Z`;
      P0(g, wall, mix(C.paperDark, C.ink, 0.12), 1); L0(g, wall, C.ink, 2.4, 0.85);
      // the buildings, left to right; the cathedral is the big one
      const ruin = mode === 'ruins' || mode === 'unesco';
      const B = [];
      const cat = el(g, 'g');
      const CT = ANI.cathedral(cat, 960, HY - 6, 0.36, { ruin });
      B.push({ g: cat, lamp: null, x: 960 });
      const spots = [[560, 0.55], [700, 0.4], [1240, 0.5], [1400, 0.36], [1560, 0.44], [380, 0.32]];
      spots.forEach(([x, s], i) => { const c = ANI.church(g, x, HY - 4, s, { ruin: ruin && i % 2 === 1 }); B.push({ g: c.g, lamp: c.lamp, x }); });
      // minaret
      const mn = el(g, 'g');
      P0(mn, `M614 ${HY}L620 ${HY - 210}L638 ${HY - 210}L644 ${HY}Z`, mix(C.paperDark, C.ink, 0.14), 1);
      L0(mn, `M614 ${HY}L620 ${HY - 210}L638 ${HY - 210}L644 ${HY}M616 ${HY - 160}L642 ${HY - 160}`, C.ink, 2.4, 0.9);
      B.push({ g: mn, lamp: null, x: 629 });
      const lab = P.label ? T(st0.g, P.label, 960, 150, mode === 'unesco' ? 66 : 92, { weight: 300 }) : null;
      const sub = P.sub ? ital(st0.g, P.sub, 960, 218, 48) : null;
      const order = B.slice().sort((a, b) => a.x - b.x);
      const ds = ANI.dust(g, 7, 26, [-100, HY - 260, 2020, HY + 200], { alpha: 0.32 });
      const birds = [];
      for (let i = 0; i < 3; i++) birds.push(L0(g, '', C.inkSoft, 2.2, 0.6));
      return {
        update(lt, dur, cues) {
          ds.update(lt);
          sun.set((mode === 'glow' ? 0.2 : 0.36) + 0.04 * Math.sin(lt * 0.4));
          if (disc) disc.setAttribute('d', BTL.E(1380, sunY + 40 - 30 * BTL.ease(lt, 0, Math.max(5, dur)), 46, 46));
          const hit = cue(cues, 'hit', dur * 0.5);
          order.forEach((b, i) => {
            if (mode === 'rise') fade(b.g, BTL.ease(lt, 0.2 + i * Math.min(0.5, (hit - 0.2) / order.length), 0.9));
            if (b.lamp) b.lamp.setAttribute('fill-opacity', mode === 'glow' ? (0.7 + 0.2 * Math.sin(lt * 0.9 + i)).toFixed(3) : '0');
          });
          birds.forEach((e, i) => {
            const x = 300 + ((lt * 22 + i * 90) % 1400), y = 380 + i * 30 + 8 * Math.sin(lt * 0.5 + i);
            e.setAttribute('d', `M${f1(x - 14)} ${f1(y - 6)}Q${f1(x - 6)} ${f1(y - 10)} ${f1(x)} ${f1(y)}Q${f1(x + 6)} ${f1(y - 10)} ${f1(x + 14)} ${f1(y - 6)}`);
          });
          if (lab) fade(lab, BTL.ease(lt, mode === 'rise' || mode === 'ruins' ? hit - 0.2 : 0.6, 1.4));
          if (sub) fade(sub, BTL.ease(lt, (mode === 'rise' || mode === 'ruins' ? hit : 1.2) + 0.4, 1.4));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_cathedral
  SH.bt_an_cathedral = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'build', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.15 });
      const night = mode === 'night', ruin = mode === 'ruin' || night;
      const GY = 880;
      if (night) { const st = BTL.stars(g, 120, 21, [-200, -100, 2120, 560]); g._st = st; }
      const pool0 = mode === 'ruin' ? 0.46 : (night ? 0.18 : 0.3), pool = BTL.glow(svg, defs, 960, 540, 700, C.stain, pool0, g);
      ANI.ground(g, GY, { seed: 12, n: 24 });
      const K = 0.86, CT = ANI.cathedral(g, 960, GY, K, { ruin });
      const Hb = CT.Hb, Y = v => GY + v * K;
      // the cross on top / the crescent
      const crossY = Y(CT.AP);
      const cross = mode === 'crescent' || mode === 'build' ? L0(g, `M960 ${crossY}L960 ${crossY - 70}M936 ${crossY - 46}L984 ${crossY - 46}`, C.ink, 4, 1) : null;
      const cy0 = crossY - 44, cres = mode === 'crescent' ? P0(g, `M966 ${cy0 - 38}A38 38 0 0 0 966 ${cy0 + 38}A22 38 0 0 1 966 ${cy0 - 38}Z`, C.gold, 0) : null;
      // collapse: drum and cone come down as stones
      let stones = [];
      if (mode === 'collapse') {
        const r = rng(41);
        for (let i = 0; i < 22; i++) {
          const x0 = 960 + (r() - 0.5) * 160, y0 = Y(CT.DB) - r() * 200 * K, sz = 12 + r() * 18;
          const e = P0(g, '', mix(C.paperDark, C.ink, 0.2), 0); const l = L0(g, '', C.ink, 2, 0);
          stones.push({ e, l, x0, y0, sz, dx: (r() - 0.5) * 260, rot: r() * 90, dl: r() * 0.8 });
        }
      }
      const edge = mode === 'collapse' ? L0(g, `M${960 - 79} ${Y(CT.DB - 20)}L${960 - 50} ${Y(CT.DB - 54)}L${960 - 16} ${Y(CT.DB - 28)}L${960 + 26} ${Y(CT.DB - 64)}L${960 + 79} ${Y(CT.DB - 24)}`, C.gold, 4, 0) : null;
      const lab = P.label ? T(g, P.label, 1580, 300, 66, { weight: 300 }) : null;
      const sub = P.sub ? ital(g, P.sub, 1580, 370, 46) : null;
      const ds = ANI.dust(g, 5, 30, [300, 200, 1620, GY], { alpha: 0.38 });
      const dl = mode === 'collapse' ? [0, 1, 2, 3, 4].map(i => L0(g, '', C.inkSoft, 1.8, 0)) : [];
      const cloud = mode === 'collapse' ? { update(lt, on) { dl.forEach((e, i) => {
        const y0 = Y(-Hb) - 20 - i * 34 - 40 * on * (1 + 0.15 * lt), half = 150 + i * 40 + 80 * on; let d = '';
        for (let x = -half; x <= half; x += 20) { const k = 1 - Math.pow(x / half, 2); d += (x === -half ? 'M' : 'L') + f1(960 + x) + ' ' + f1(y0 - 30 * k * on - 6 * Math.sin(x / 50 + i + lt * 0.4)); }
        e.setAttribute('d', d); e.setAttribute('stroke-opacity', (0.6 * on * (1 - i * 0.12)).toFixed(3));
      }); } } : null;
      return {
        update(lt, dur, cues) {
          ds.update(lt); if (g._st) g._st.update(lt);
          pool.set(pool0 + 0.04 * Math.sin(lt * 0.5));
          const hit = cue(cues, 'hit', dur * 0.4);
          if (mode === 'build') { CT.D.reveal(BTL.ease(lt, 0, 2.6)); CT.TD.reveal(BTL.ease(lt, 1.4, 2.2)); fade(cross, BTL.ease(lt, 3, 1)); }
          else { CT.D.reveal(1); CT.TD.reveal(1); }
          if (mode === 'crescent') {
            const a = cue(cues, 'a', dur * 0.25), b = cue(cues, 'b', dur * 0.55);
            fade(cross, 1 - BTL.ease(lt, a, 1.4));
            cres.setAttribute('fill-opacity', BTL.ease(lt, b - 0.2, 1.4).toFixed(3));
          }
          if (mode === 'collapse') {
            const q = BTL.ease(lt, hit, 1.2);
            CT.top.g.setAttribute('opacity', (1 - q).toFixed(3));
            CT.top.g.setAttribute('transform', `translate(0 ${f1(q * 60)})`);
            edge.setAttribute('stroke-opacity', BTL.ease(lt, hit + 1, 1.4).toFixed(3));
            for (const s of stones) {
              const u = clamp01((lt - hit - 0.3 - s.dl) / 2.4), y = s.y0 + (Y(-Hb) - 10 - s.y0) * u * u, x = s.x0 + s.dx * u;
              const d = `M${f1(x - s.sz)} ${f1(y - s.sz * 0.6)}L${f1(x + s.sz * 0.8)} ${f1(y - s.sz * 0.7)}L${f1(x + s.sz)} ${f1(y + s.sz * 0.5)}L${f1(x - s.sz * 0.7)} ${f1(y + s.sz * 0.6)}Z`;
              const a = lt > hit + 0.3 + s.dl ? 1 : 0;
              s.e.setAttribute('d', d); s.l.setAttribute('d', d); s.e.setAttribute('fill-opacity', a); s.l.setAttribute('stroke-opacity', a * 0.8);
            }
            cloud.update(lt, BTL.ease(lt, hit + 0.6, 1.6));
          }
          if (lab) fade(lab, BTL.ease(lt, mode === 'crescent' ? cue(cues, 'b', dur * 0.55) : (mode === 'build' ? hit : 0.8), 1.2));
          if (sub) fade(sub, BTL.ease(lt, (mode === 'build' ? cue(cues, 'b', hit + 1) : 1.6), 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_dome (Hagia Sophia, 989)
  SH.bt_an_dome = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.4 });
      const GY = 820, cx = 900;
      const pool = BTL.glow(svg, defs, cx, 560, 640, C.stain, 0.3, g);
      ANI.ground(g, GY, { seed: 3, n: 18 });
      const D = BTL.drawing(g);
      const base = `M${cx - 520} ${GY}L${cx - 520} ${GY - 210}L${cx + 520} ${GY - 210}L${cx + 520} ${GY}Z`;
      const halfL = `M${cx - 420} ${GY - 210}Q${cx - 420} ${GY - 330} ${cx - 250} ${GY - 340}L${cx - 250} ${GY - 210}Z`;
      const halfR = `M${cx + 420} ${GY - 210}Q${cx + 420} ${GY - 330} ${cx + 250} ${GY - 340}L${cx + 250} ${GY - 210}Z`;
      const ring = `M${cx - 250} ${GY - 300}L${cx - 250} ${GY - 360}L${cx + 250} ${GY - 360}L${cx + 250} ${GY - 300}Z`;
      for (const d of [base, halfL, halfR, ring]) D.f(d, mix(C.paperLight, C.paperDark, 0.45), 1);
      for (const d of [base, halfL, halfR, ring]) D.s(d, { w: 3.2 });
      let win = ''; for (let i = 0; i < 13; i++) { const x = cx - 228 + i * 38; win += `M${x} ${GY - 312}L${x} ${GY - 348}`; }
      D.s(win, { w: 3, color: C.ink });
      let arc = ''; for (let i = 0; i < 8; i++) { const x = cx - 480 + i * 124; arc += `M${x} ${GY - 20}L${x} ${GY - 110}Q${x + 40} ${GY - 160} ${x + 80} ${GY - 110}L${x + 80} ${GY - 20}`; }
      D.s(arc, { w: 2, color: C.inkSoft });
      // the dome: east half intact, west half broken (dashed) and redrawn in gold on the cue
      const R = 250, top = GY - 360;
      const east = `M${cx} ${top - 150}Q${cx + R * 0.9} ${top - 150} ${cx + R} ${top}`;
      const westD = `M${cx - R} ${top}Q${cx - R * 0.9} ${top - 150} ${cx} ${top - 150}`;
      D.f(`${east}L${cx} ${top}Z`, mix(C.paperDark, C.ink, 0.1), 1);
      D.s(east, { w: 3.4 });
      const dashed = L0(g, westD, C.inkSoft, 3, 0.7, { 'stroke-dasharray': '10 12' });
      const westF = P0(g, `${westD}L${cx} ${top}Z`, C.gold, 0);
      const west = L0(g, westD, C.gold, 5, 1); stroke(west, 0);
      // broken stubs
      D.s(`M${cx - R} ${top}L${cx - R + 20} ${top - 50}M${cx} ${top - 150}L${cx - 24} ${top - 136}`, { w: 3, color: C.ink });
      const lab = P.label ? T(g, P.label, 1560, 330, 68, { weight: 300 }) : null;
      const sub = P.sub ? ital(g, P.sub, 1560, 400, 46) : null;
      const ds = ANI.dust(g, 13, 24, [400, 200, 1500, GY], { alpha: 0.35 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); pool.set(0.3 + 0.05 * Math.sin(lt * 0.5));
          D.reveal(BTL.ease(lt, 0, 2.2));
          const hit = cue(cues, 'hit', dur * 0.6), q = BTL.ease(lt, hit - 0.2, 2);
          stroke(west, q); westF.setAttribute('fill-opacity', (0.28 * q).toFixed(3));
          dashed.setAttribute('stroke-opacity', (0.7 * (1 - q)).toFixed(3));
          if (lab) fade(lab, BTL.ease(lt, 0.8, 1.2));
          if (sub) fade(sub, BTL.ease(lt, 1.6, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_plateau (plan view)
  SH.bt_an_plateau = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'site', portrait = H > W;
      const g = el(svg, 'g', portrait ? { transform: `translate(${W / 2 - 960 * 0.62} 280) scale(0.62)` } : {});
      const pool = BTL.glow(svg, defs, 940, 480, 620, C.stain, 0.22, g);
      // the triangular plateau, its point to the south
      const plat = 'M520 170C700 150 1200 150 1400 180C1420 250 1340 380 1240 500C1140 620 1040 760 960 860C900 790 800 650 700 520C610 400 520 270 520 170Z';
      const D = BTL.drawing(g);
      D.f(plat, C.paperLight, 0.9);
      D.s(plat, { w: 3.4 });
      // gorge hatching outside the edges
      let h = ''; const r = rng(8);
      for (let i = 0; i < 40; i++) {
        const t = i / 40;
        const ex = 1400 - 440 * t + (t < 0.1 ? 0 : 0), ey = 180 + 680 * t;   // east edge (approx)
        const wx = 520 + 440 * t, wy = 170 + 690 * t;
        h += `M${f1(ex + 14)} ${f1(ey)}l${f1(30 + r() * 20)} ${f1(10)}M${f1(wx - 14)} ${f1(wy)}l${f1(-30 - r() * 20)} ${f1(10)}`;
      }
      D.s(h, { w: 2, color: C.inkSoft, alpha: 0.6 });
      // the Arpaçay on the east, the valley stream on the west
      const river = 'M1520 60C1500 200 1470 320 1400 450C1330 580 1180 740 1080 860C1050 896 1020 916 990 930';
      const riv = L0(g, river, C.blue, 6, 0.85); stroke(riv, 0);
      const brook = L0(g, 'M420 120C440 260 520 400 640 540C740 660 860 800 930 880', C.blue, 3, 0.55); stroke(brook, 0);
      const rl = ital(g, 'Arpaçay', 1560, 520, 54, { color: C.blue });
      // ruins: small marks inside
      let ru = ''; const r2 = rng(19);
      for (let i = 0; i < 40; i++) { const x = 640 + r2() * 680, y = 220 + r2() * 420; const inside = (x - 960) ** 2 / 400 ** 2 + (y - 300) ** 2 / 330 ** 2 < 1 && y < 200 + (900 - y) * 0.9; if (inside && y < 700 - Math.abs(x - 960) * 0.8) ru += `M${f1(x)} ${f1(y)}h14v-12h-14z`; }
      D.s(ru, { w: 2, color: C.inkSoft, alpha: 0.7 });
      const name = T(g, 'Ani', 960, 470, 92, { weight: 300 });
      // the north wall: double line with semicircular towers
      const WG = el(g, 'g', { opacity: mode === 'walls' ? 0 : 0.4 });
      const w1 = L0(WG, 'M530 130C700 110 1200 110 1410 140', C.ink, 5, 1);
      const w2 = L0(WG, 'M530 100C700 80 1200 80 1410 110', C.gold, 5, 1);
      let tw = ''; for (let i = 0; i < 12; i++) { const t = i / 11, x = 560 + 820 * t, y = 112 - 26 * Math.sin(Math.PI * t) - 10; tw += `M${f1(x - 13)} ${f1(y)}A13 13 0 0 0 ${f1(x + 13)} ${f1(y)}`; }
      const tow = L0(WG, tw, C.gold, 3.5, 1);
      const nl = ital(g, mode === 'walls' ? 'çifte sur' : 'kuzey', 960, 52, 48, { color: mode === 'walls' ? C.gold : C.inkSoft });
      const ds = ANI.dust(g, 27, 18, [300, 100, 1700, 900], { alpha: 0.3 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); pool.set(0.22 + 0.04 * Math.sin(lt * 0.5));
          D.reveal(mode === 'site' ? BTL.ease(lt, 0, 2.4) : 1);
          fade(name, BTL.ease(lt, mode === 'site' ? 1.2 : 0, 1.2));
          const hit = cue(cues, 'hit', dur * 0.5);
          if (mode === 'site') { stroke(riv, BTL.ease(lt, hit - 0.6, 2.2)); stroke(brook, BTL.ease(lt, 1.2, 2.4)); fade(rl, BTL.ease(lt, hit, 1.2)); fade(nl, 0); }
          else {
            stroke(riv, 1); stroke(brook, 1); fade(rl, 1);
            fade(WG, BTL.ease(lt, 0.2, 0.8));
            stroke(w1, BTL.ease(lt, 0.4, 2)); stroke(w2, BTL.ease(lt, hit - 0.4, 2)); stroke(tow, BTL.ease(lt, cue(cues, 'b', hit + 1.4) - 0.2, 2));
            fade(nl, BTL.ease(lt, hit, 1.2));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_map
  const SEAS = [
    // Black Sea
    [[28.0, 41.2], [29.1, 41.25], [31.0, 41.1], [32.5, 41.8], [33.4, 42.0], [35.0, 42.05], [36.0, 41.7], [37.5, 41.1], [39.0, 41.05], [40.5, 41.05],
     [41.6, 41.6], [41.7, 42.3], [41.5, 42.8], [40.0, 43.4], [38.7, 44.3], [37.4, 44.7], [36.6, 45.3], [35.4, 45.0], [33.6, 44.5], [33.0, 45.3],
     [32.5, 45.4], [31.2, 46.6], [30.2, 46.0], [29.6, 45.2], [28.7, 44.3], [28.0, 43.2], [27.9, 42.4]],
    // Caspian
    [[47.5, 45.6], [47.2, 44.2], [47.5, 43.0], [48.5, 41.8], [49.5, 40.6], [49.3, 39.5], [48.9, 38.4], [49.0, 37.6], [50.3, 37.0], [51.5, 36.8],
     [53.9, 36.9], [53.9, 37.4], [53.0, 38.9], [53.2, 40.0], [52.8, 41.2], [53.0, 42.1], [52.5, 42.8], [51.3, 43.2], [51.0, 44.5], [50.3, 44.6],
     [51.0, 45.3], [53.0, 45.3], [53.2, 46.6], [51.0, 47.0], [49.2, 46.4]],
    // eastern Mediterranean
    [[20.0, 36.0], [26.0, 36.2], [27.3, 37.0], [28.0, 36.7], [29.6, 36.2], [30.6, 36.8], [32.0, 36.5], [34.0, 36.3], [34.6, 36.8], [36.1, 36.6],
     [35.8, 35.5], [35.9, 34.6], [35.0, 32.5], [34.3, 31.3], [30.0, 31.4], [20.0, 31.6]],
  ];
  const spline = (pts, closed = true) => {
    const n = pts.length, Pp = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = Pp(i - 1), p1 = Pp(i), p2 = Pp(i + 1), p3 = Pp(i + 2);
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    return d + (closed ? 'Z' : '');
  };
  SH.bt_an_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), [l0, b0, l1, b1] = P.bounds || [26, 35.5, 52, 44.5];
      const portrait = H > W, k = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 120 : 200), ah = portrait ? 1000 : H - 260;
      const s = Math.min(aw / ((l1 - l0) * k), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * k * s / 2, oy = (portrait ? 640 : (H - 110) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * k * s, Y = lat => oy + (b1 - lat) * s;
      const clipId = 'anmap' + (++ANI.uid);
      const cp = el(defs, 'clipPath', { id: clipId }); el(cp, 'rect', { x: X(l0), y: Y(b1), width: X(l1) - X(l0), height: Y(b0) - Y(b1), rx: 6 });
      const mg = el(g, 'g', { 'clip-path': `url(#${clipId})` });
      P0(mg, `M${X(l0)} ${Y(b1)}H${X(l1)}V${Y(b0)}H${X(l0)}Z`, C.paperLight, 0.6);
      const seaD = SEAS.map(poly => spline(poly.map(p => [X(p[0]), Y(p[1])]))).join('');
      P0(mg, seaD, C.paper, 1);
      const coast = L0(mg, seaD, C.inkSoft, 2.2, 0.9);
      L0(g, `M${X(l0)} ${Y(b1)}H${X(l1)}V${Y(b0)}H${X(l0)}Z`, C.inkSoft, 1.5, 0.35);
      const regs = (P.regions || []).map(r => { const t = ital(g, r.text, X(r.lon), Y(r.lat), 44, { color: r.blue ? C.blue : C.inkSoft, anchor: 'middle' }); if (!r.blue) t.setAttribute('letter-spacing', '0.12em'); return t; });
      const rivers = (P.rivers || []).map(r => L0(mg, spline(r.map(p => [X(p[0]), Y(p[1])]), false), C.blue, 3.5, 0.75));
      const routes = (P.routes || []).map(r => {
        const e = L0(mg, spline(r.path.map(p => [X(p[0]), Y(p[1])]), false), C.gold, 4.5, 1, { pathLength: 1 });
        const dsh = L0(mg, spline(r.path.map(p => [X(p[0]), Y(p[1])]), false), C.inkSoft, 3, 0, { 'stroke-dasharray': '10 12' });
        if (r.dashed) { e.setAttribute('stroke-opacity', r.alpha ?? 0.55); if (r.alpha) e.setAttribute('stroke-width', 5.5); }
        draw(e, 0); return { e, dsh, r };
      });
      const pts = (P.points || []).map(p => {
        const x = X(p.lon), y = Y(p.lat), pg = el(g, 'g', { opacity: 0 });
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 2.5 });
        el(pg, 'circle', { cx: x, cy: y, r: 9, fill: C.gold });
        const left = p.side ? p.side === 'left' : x > W * 0.7, ax = left ? x - 30 : x + 30, an = left ? 'end' : 'start', dy = p.dy || 0;
        const lab = T(pg, p.label || '', ax, y + 16 + dy, 56, { anchor: an }); lab.setAttribute('opacity', 1);
        const sub = p.sub ? ital(pg, p.sub, ax, y + 66 + dy, 42, { anchor: an }) : null; if (sub) sub.setAttribute('opacity', 1);
        for (const t of [lab, sub]) if (t) { t.setAttribute('stroke', C.paperLight); t.setAttribute('stroke-width', 10); t.setAttribute('stroke-linejoin', 'round'); t.setAttribute('paint-order', 'stroke'); }
        return { p, pg, ring };
      });
      return {
        update(lt, dur, cues) {
          coast.setAttribute('stroke-opacity', (0.9 * BTL.ease(lt, 0, 1.2)).toFixed(3));
          regs.forEach(t => fade(t, BTL.ease(lt, 0, 0.8)));
          rivers.forEach(e => e.setAttribute('stroke-opacity', (0.75 * BTL.ease(lt, 0, 0.8)).toFixed(3)));
          routes.forEach(({ e, dsh, r }) => {
            draw(e, BTL.ease(lt, cue(cues, r.at, r.t0 ?? dur * 0.4), r.dur || 2));
            if (r.fade) { const q = BTL.ease(lt, cue(cues, r.fade, dur * 0.6), 1.6); e.style.opacity = (1 - q).toFixed(3); dsh.setAttribute('stroke-opacity', (0.8 * q).toFixed(3)); }
          });
          pts.forEach((q, i) => {
            const at = cue(cues, q.p.at, 0.6 + i * 0.8);
            fade(q.pg, BTL.ease(lt, at - 0.3, 1) * (q.p.dim ? 0.5 : 1));
            const ph = ((lt - at) % 2.6 + 2.6) % 2.6 / 2.6;
            q.ring.setAttribute('r', f1(14 + 26 * ph)); q.ring.setAttribute('stroke-opacity', f1((1 - ph) * 0.8));
          });
        },
      };
    },
  };
})();
