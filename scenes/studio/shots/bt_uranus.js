// bt_uranus: Operation Uranus, Stalingrad (19-23 November 1942), belgesel style (docs/BELGESEL.md). Still line art in
// the theme's tokens; the only motion is slow and natural: snow falling, fog drifting, smoke rising, distant muzzle
// flashes swelling and fading, lines drawing themselves, a column walking slowly away. Every type is composed on a
// 1080x1920 vertical canvas (the Short); a wide frame shows it as a centred column.
//   bt_uranus_helmet P: {mode: "hook"|"end"}  cues: hit   a steel helmet half sunk in snow in a pool of light; two thin
//                    gold arcs start on its right and close around it on the left (hook: the cover frame). end: snow
//                    keeps falling, the drift slowly rises over the helmet, the ring stays faint
//   bt_uranus_city   P: {label: "Stalingrad", sub: "19 Kasım 1942"}  cues: hit   the ruined city seen across the Volga:
//                    broken walls, empty windows, the tall grain elevator, two smoke columns, snow, dark water
//   bt_uranus_ruin   cues: hit   a gutted factory hall: bent roof trusses, empty window rows, snow on the ledges,
//                    smoke drifting behind; on "hit" a faint fire glow breathes inside
//   bt_uranus_map    P: {mode: "flanks"|"ring", city, flank, meet, date}  cues: hit   schematic map: Don and Volga, the
//                    Stalingrad dot, the German army as a soft patch between the rivers. flanks: two thin dashed lines on
//                    its north and south sides labelled "Romenler"; on "hit" they turn gold and thin out. ring: two gold
//                    arrows from north and south meet at Kalaç, on "hit" the ring closes around the patch
//   bt_uranus_steppe cues: hit   the frozen steppe at dawn: one telegraph pole, a few fence stakes, fog banks drifting
//                    low; on "hit" the fog thickens
//   bt_uranus_guns   cues: hit   a foggy horizon at dawn: muzzle flashes swell along it one after another; on "hit"
//                    the whole horizon lights up at once and the fog glows
//   bt_uranus_march  P: {n: "91.000", label: "esir"}  cues: hit   a long column of silhouettes walking away across the
//                    snow towards the horizon; the number and label appear above it
//   bt_uranus_return P: {n: "5.000", label: "eve döndü"}  cues: hit   91 small silhouettes in rows (one per thousand);
//                    on "hit" all but five fade away, the five turn gold, the number appears
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
      'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}));
    e.setAttribute('text-anchor', o.anchor || 'middle');
    if (o.spacing) e.setAttribute('letter-spacing', o.spacing);
    return e;
  };
  const SNOW = () => mix(C.paperLight, C.ink, 0.16);     // snow ground: a pale surface, a little above the night
  const SIL = () => C.paperDark;
  let uid = 0;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }

  // falling snow: small flakes drifting down slowly, one path rebuilt per frame (deterministic)
  function snow(g, n, seed, box, o = {}) {
    const r = rng(seed), list = [], [x0, y0, x1, y1] = box, h = y1 - y0;
    for (let i = 0; i < n; i++) list.push({ x: x0 + r() * (x1 - x0), y: r() * h, sp: (o.sp || 34) * (0.6 + r() * 0.8), s: (o.s || 2.6) * (0.6 + r() * 0.8), ph: r() * TAU, sw: 8 + r() * 14 });
    const e = P0(g, '', C.ink, o.alpha ?? 0.6);
    return { e, update(lt, k = 1) {
      let d = '';
      for (const q of list) {
        const y = y0 + (q.y + lt * q.sp * k) % h, x = q.x + q.sw * Math.sin(lt * 0.35 + q.ph);
        d += `M${f1(x - q.s)} ${f1(y)}a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(2 * q.s)} 0a${f1(q.s)} ${f1(q.s)} 0 1 0 ${f1(-2 * q.s)} 0`;
      }
      e.setAttribute('d', d);
    } };
  }
  // banks of fog / smoke: large soft ellipses sharing one gradient, drifting slowly sideways
  function fog(g, defs, seed, banks, col) {
    const id = 'urf' + (++uid), rg = el(defs, 'radialGradient', { id }), cc = col || mix(C.inkSoft, C.paperLight, 0.35);
    el(rg, 'stop', { offset: '0', 'stop-color': cc, 'stop-opacity': 1 });
    el(rg, 'stop', { offset: '0.55', 'stop-color': cc, 'stop-opacity': 0.5 });
    el(rg, 'stop', { offset: '1', 'stop-color': cc, 'stop-opacity': 0 });
    const r = rng(seed), list = banks.map(([x, y, rx, ry, a]) => ({
      e: el(g, 'ellipse', { cx: x, cy: y, rx, ry, fill: `url(#${id})`, 'fill-opacity': a }), a,
      amp: 50 + r() * 80, sp: 0.06 + r() * 0.08, ph: r() * TAU, dir: r() < 0.5 ? -1 : 1 }));
    return { update(lt, k = 1) { for (const q of list) {
      q.e.setAttribute('transform', `translate(${f1(q.dir * q.amp * Math.sin(lt * q.sp + q.ph))} ${f1(6 * Math.sin(lt * q.sp * 0.7 + q.ph))})`);
      q.e.setAttribute('fill-opacity', Math.max(0, q.a * k).toFixed(3));
    } } };
  }
  const band = (seed, y0, y1, n, a, rx = 520, ry = 200) => {
    const r = rng(seed), out = [];
    for (let i = 0; i < n; i++) out.push([-120 + r() * 1320, y0 + r() * (y1 - y0), rx * (0.7 + r() * 0.6), ry * (0.7 + r() * 0.6), a * (0.7 + r() * 0.5)]);
    return out;
  };
  // a rising smoke column of soft puffs from (x, y)
  function smoke(g, defs, x, y, seed, o = {}) {
    const id = 'urs' + (++uid), rg = el(defs, 'radialGradient', { id }), cc = mix(C.inkSoft, C.paper, 0.25);
    el(rg, 'stop', { offset: '0', 'stop-color': cc, 'stop-opacity': 1 });
    el(rg, 'stop', { offset: '1', 'stop-color': cc, 'stop-opacity': 0 });
    const r = rng(seed), n = o.n || 14, H = o.h || 520, list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', `url(#${id})`, 0), ph: i / n + r() * 0.02, s: (o.s || 46) * (0.8 + r() * 0.4) });
    return { update(lt) { for (const q of list) {
      const u = (q.ph + lt * 0.05) % 1, yy = y - u * H, xx = x + (o.lean ?? 120) * u * u + 14 * Math.sin(lt * 0.4 + q.ph * 9), s = q.s * (0.5 + 1.6 * u);
      q.e.setAttribute('d', BTL.E(xx, yy, s * 1.2, s));
      q.e.setAttribute('fill-opacity', ((o.alpha ?? 0.5) * clamp01(u * 12) * (1 - u)).toFixed(3));
    } } };
  }

  // foreground snow: layered swells from y0 down to the bottom of the frame, each a little lighter at its crest
  function waves(g, y0, seed, o = {}) {
    const r = rng(seed), n = o.n || 4;
    for (let i = 0; i < n; i++) {
      const y = y0 + i * (o.step || 170) + r() * 30, a = 40 + r() * 40, ph = r() * 600;
      const d = `M-60 ${f1(y + a * 0.5)}C${f1(180 - ph * 0.2)} ${f1(y - a)} ${f1(420 + ph * 0.3)} ${f1(y - a * 0.2)} 600 ${f1(y + a * 0.3)}C${f1(760 + ph * 0.2)} ${f1(y + a * 0.7)} 940 ${f1(y - a * 0.8)} 1140 ${f1(y)}`;
      P0(g, d + 'L1140 2000L-60 2000Z', mix(C.paper, SNOW(), 0.3 + 0.06 * i), 1);
      L0(g, d, C.inkSoft, 2, 0.45);
    }
  }

  // the steel helmet, Stahlhelm M35 in profile: dark solid shell, the brow visor jutting forward on the left, the neck
  // guard flaring out and down on the right, one vent lug. origin = centre, ~640 px wide, ~330 px tall
  function helmet(D) {
    const shell = 'M-300 40C-292-40-232-150-100-195C0-230 150-215 230-130C270-85 282-20 276 30C286 70 312 104 344 124C304 140 240 136 198 120C120 94 40 80-40 72C-120 66-200 62-252 56C-276 52-294 48-300 40Z';
    D.f(shell, mix(C.paperDark, C.inkSoft, 0.2), 1);
    D.f('M-210-80C-160-160-60-200 40-200C-50-176-150-130-210-80Z', C.ink, 0.1);      // cold sheen on the dome
    D.f('M-300 40C-294 20-280 4-258 0C-262 20-262 40-252 56C-276 52-294 48-300 40Z', C.paperDark, 0.9);   // shade under the visor
    D.s(shell, { w: 4.5, color: C.ink });
    D.s('M-258 0C-140-14 100-14 262 22', { w: 3, color: C.inkSoft });                 // the ridge above the visor and guard
    D.s(BTL.E(-110, -40, 13, 13), { w: 3, color: C.inkSoft });                       // the vent lug
    D.f(BTL.E(-110, -40, 5, 5), C.inkSoft, 1);
  }

  // ------------------------------------------------------------------ the helmet in the snow (hook, end)
  SH.bt_uranus_helmet = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', root = el(canvas(svg, W, H), 'g'), HX = 560, HY = 900, K = 0.9;
      const stars = BTL.stars(root, 60, 23, [0, 80, 1080, 560]);
      fade(stars.g, mode === 'end' ? 0.8 : 0.5);
      // the snowfield behind, with the light pool on it
      P0(root, 'M-60 640C200 620 420 632 640 626C820 620 980 632 1140 624L1140 2000L-60 2000Z', mix(C.paper, SNOW(), 0.28), 1);
      L0(root, 'M-60 640C200 620 420 632 640 626C820 620 980 632 1140 624', C.inkSoft, 2, 0.5);
      const pool = BTL.glow(svg, defs, 540, 1000, 600, C.stain, 0.42, root);
      // the ring: two thin gold arcs start in front of the helmet, run round both sides and meet above / behind it
      const CX = 545, CY = 890, RX = 400, RY = 280;
      const arcA = L0(root, `M${CX} ${CY + RY}A${RX} ${RY} 0 0 1 ${CX} ${CY - RY}`, C.gold, 4.5, 0.95, { pathLength: 1 });   // via the west
      const arcB = L0(root, `M${CX} ${CY + RY}A${RX} ${RY} 0 0 0 ${CX} ${CY - RY}`, C.gold, 4.5, 0.95, { pathLength: 1 });   // via the east
      // the helmet, a little tilted, its lower third sunk in the drift
      const hg = el(root, 'g', { transform: `translate(${HX} ${HY}) rotate(-6) scale(${K} ${(K * 1.15).toFixed(3)})` });
      const D = BTL.drawing(hg); helmet(D); D.reveal(1);
      // the drift heaped against it (rises over it at the end)
      const frontPath = y => `M-60 ${f1(y + 130)}C120 ${f1(y + 100)} 260 ${f1(y + 70)} 380 ${f1(y + 30)}C470 ${f1(y + 4)} 620 ${f1(y + 0)} 720 ${f1(y + 18)}C850 ${f1(y + 40)} 980 ${f1(y + 100)} 1140 ${f1(y + 130)}L1140 2000L-60 2000Z`;
      const fp = P0(root, frontPath(HY + 30), mix(C.paper, SNOW(), 0.46), 1);
      const fl = L0(root, '', C.ink, 2.5, 0.45);
      const pool2 = BTL.glow(svg, defs, 540, 1040, 440, C.stain, 0.2, root);
      const fore = el(root, 'g'); waves(fore, 1230, 43, { n: 4, step: 180 });
      // the near half of the ring runs over the drift: redraw the lower arcs above it, clipped to below the drift line
      const low = fog(root, defs, 37, band(37, 1100, 1750, 7, 0.28, 520, 130));
      const front = el(root, 'g');
      const fA = L0(front, `M${CX} ${CY + RY}A${RX} ${RY} 0 0 1 ${CX} ${CY - RY}`, C.gold, 4.5, 0.95, { pathLength: 1 });
      const fB = L0(front, `M${CX} ${CY + RY}A${RX} ${RY} 0 0 0 ${CX} ${CY - RY}`, C.gold, 4.5, 0.95, { pathLength: 1 });
      const cid = 'urr' + (++uid), clipR = el(el(defs, 'clipPath', { id: cid }), 'path', { d: frontPath(HY + 30) });
      front.setAttribute('clip-path', `url(#${cid})`);
      const sn = snow(root, 160, 31, [-20, 0, 1100, 1900], { sp: mode === 'end' ? 46 : 30, s: 3 });
      const setDrift = y => { const d = frontPath(y); fp.setAttribute('d', d); fl.setAttribute('d', d.split('L')[0]); clipR.setAttribute('d', d); };
      const ring = (p, a) => { for (const e of [arcA, arcB, fA, fB]) { draw(e, p); e.setAttribute('stroke-opacity', a.toFixed(3)); } };
      return {
        update(lt, dur, cues) {
          const fast = mode === 'hook' ? lt * 8 : lt;   // the hook plays slowed (x0.35) under the cover text: snow keeps its pace
          stars.update(fast); sn.update(fast); low.update(fast * 2, 1);
          if (mode === 'hook') {
            const at = cue(cues, 'hit', 1.2), p = BTL.ease(lt, Math.min(at, 0.8) - 0.6, 2.0);
            ring(p, 0.95);
            pool.set(0.38 + 0.06 * p + 0.02 * Math.sin(fast * 0.5));
            setDrift(HY + 30);
          } else {
            const k = BTL.ease(lt, 0.2, Math.max(2, dur));
            ring(1, 0.95 - 0.65 * k);
            setDrift(HY + 30 - 200 * k);
            pool.set(0.42 - 0.16 * k); pool2.set(0.2 - 0.08 * k);
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the ruined city across the Volga
  SH.bt_uranus_city = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), RY = 1080;
      const lab = txt(root, P.label || 'Stalingrad', 540, 300, 112, { weight: 400 });
      const sub = txt(root, P.sub || '19 Kasım 1942', 540, 390, 56, { font: BTL.LO, italic: true, color: C.gold });
      BTL.glow(svg, defs, 540, 820, 620, C.stain, 0.16, root);
      const smokes = [smoke(root, defs, 300, 880, 3, { h: 560, lean: 160 }), smoke(root, defs, 820, 860, 5, { h: 520, lean: 120, s: 40 })];
      // skyline: broken blocks with jagged tops, empty windows, the tall grain elevator
      const city = el(root, 'g'), D = BTL.drawing(city);
      const r = rng(13);
      let blocks = '', wins = '';
      const B = [[-40, 170, 230], [130, 150, 300], [280, 120, 190], [400, 110, 0], [520, 150, 250], [670, 140, 210], [810, 160, 330], [970, 150, 200]];
      for (const [x, w, h0] of B) {
        if (!h0) continue;
        const top = RY - h0; let d = `M${x} ${RY}L${x} ${f1(top + r() * 30)}`;
        const steps = 5;
        for (let i = 1; i <= steps; i++) d += `L${f1(x + w * i / steps - w / steps / 2)} ${f1(top - 10 + r() * 60)}L${f1(x + w * i / steps)} ${f1(top + r() * 40)}`;
        blocks += d + `L${x + w} ${RY}Z`;
        for (let fy = top + 60; fy < RY - 40; fy += 62) for (let fx = x + 22; fx < x + w - 30; fx += 44) if (r() < 0.75) wins += `M${f1(fx)} ${f1(fy)}h20v32h-20Z`;
      }
      // the grain elevator: a tall block at 400..510
      const elev = `M400 ${RY}L400 640L430 620L470 620L510 640L510 ${RY}Z`;
      D.f(blocks + elev, SIL(), 1);
      D.s(blocks, { w: 2.5, color: C.inkSoft }); D.s(elev, { w: 3, color: C.ink });
      let ev = ''; for (let x = 418; x < 500; x += 18) ev += `M${x} 660L${x} ${RY - 20}`;
      D.s(ev, { w: 1.6, color: C.inkSoft, alpha: 0.5 });
      const W1 = P0(city, wins, C.paper, 1);
      L0(city, wins, C.inkSoft, 1.4, 0.35);
      // the river
      P0(root, `M-60 ${RY}L1140 ${RY}L1140 2000L-60 2000Z`, mix(C.paperDark, C.paper, 0.5), 1);
      L0(root, `M-60 ${RY}L1140 ${RY}`, C.inkSoft, 2.5, 0.7);
      L0(root, 'M-60 1560C300 1548 700 1556 1140 1546', C.inkSoft, 2, 0.35);          // the near (east) bank
      P0(root, 'M-60 1560C300 1548 700 1556 1140 1546L1140 2000L-60 2000Z', mix(C.paper, SNOW(), 0.25), 1);
      const glints = []; const gr = rng(9);
      for (let i = 0; i < 14; i++) glints.push({ e: L0(root, '', C.inkSoft, 2, 0), x: gr() * 1000 + 40, y: RY + 40 + gr() * 420, w: 30 + gr() * 70, ph: gr() * TAU });
      const sn = snow(root, 80, 41, [-20, 0, 1100, 1900]);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.4);
          D.reveal(BTL.ease(lt, 0, 1.4));
          fade(W1, BTL.ease(lt, 0.4, 1));
          fade(lab, BTL.ease(lt, Math.min(0.3, at - 0.5), 1)); fade(sub, BTL.ease(lt, Math.min(0.8, at), 1));
          smokes.forEach(s => s.update(lt + 6));
          sn.update(lt);
          for (const q of glints) { q.e.setAttribute('d', `M${f1(q.x)} ${f1(q.y)}l${f1(q.w)} 0`); q.e.setAttribute('stroke-opacity', (0.12 + 0.3 * Math.sin(lt * 0.5 + q.ph) ** 2).toFixed(3)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ a gutted factory hall
  SH.bt_uranus_ruin = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), GY = 1110;
      const back = smoke(root, defs, 760, 700, 17, { h: 560, lean: 200, s: 60, alpha: 0.4 });
      const glow = BTL.glow(svg, defs, 540, 1000, 360, C.gold, 0, root);
      const D = BTL.drawing(el(root, 'g', { transform: 'translate(54 150) scale(0.9)' }));
      // the end wall: a gable broken open, rows of empty windows
      const wall = 'M120 1110L120 520L300 400L360 450L400 380L470 430L540 330L600 410L660 360L760 470L820 440L960 520L960 1110Z';
      let win = '';
      const keepW = (x, y) => !(y === 560 && (x < 200 || x > 880)) && !(x >= 650 && y >= 720) && !(x === 410 && y === 560);
      for (const y of [560, 720, 880]) for (let x = 170; x < 920; x += 120) if (keepW(x, y)) win += `M${x} ${y}h70v110h-70Z`;
      // a shell breach torn through the lower right of the wall
      const breach = 'M640 1110L628 960L660 880L700 900L730 800L790 840L830 760L880 820L910 790L960 860L960 1110Z';
      D.f(wall, SIL(), 1);
      D.f(win + breach, mix(C.paper, C.stain, 0.12), 1);
      D.s(wall, { w: 3.5, color: C.ink });
      D.s(win, { w: 2, color: C.inkSoft });
      D.s(breach.slice(0, -1), { w: 3, color: C.ink });
      D.s('M700 900L690 1000M790 840L800 960M880 820L870 930', { w: 2.5, color: C.inkSoft, alpha: 0.7 });   // bent bars in the breach
      // bent roof trusses hanging from the top
      D.s('M300 400L250 330L330 250M540 330L520 230L600 170M760 470L820 380', { w: 4, color: C.ink });
      D.s('M250 330L300 360L330 250M520 230L560 280L600 170', { w: 2, color: C.inkSoft });
      // snow lying on the ledges
      let ledge = ''; for (const y of [560, 720, 880]) for (let x = 170; x < 920; x += 120) if (keepW(x, y)) ledge += `M${x - 6} ${y + 112}h82`;
      D.s(ledge, { w: 4, color: SNOW() });
      // rubble and snow down to the bottom of the frame
      D.f(`M-60 ${GY}C80 1080 200 1100 320 1076C440 1060 600 1096 760 1070C900 1052 1020 1090 1140 1080L1140 2000L-60 2000Z`, mix(C.paper, SNOW(), 0.3), 1);
      D.s(`M-60 ${GY}C80 1080 200 1100 320 1076C440 1060 600 1096 760 1070C900 1052 1020 1090 1140 1080`, { w: 2.5, color: C.inkSoft });
      D.s('M180 1150l60-24l40 30M640 1140l50-30l60 20l30 26M380 1500l70-20l50 26M760 1640l60-30l50 30', { w: 2.5, color: C.inkSoft, alpha: 0.6 });
      const sn = snow(root, 90, 47, [-20, 0, 1100, 1900]);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5);
          D.reveal(BTL.ease(lt, 0, 1.8));
          back.update(lt + 8); sn.update(lt);
          glow.set(0.22 * BTL.ease(lt, at - 0.4, 1.2) * (0.85 + 0.15 * Math.sin(lt * 1.1)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the map: flanks / the ring
  SH.bt_uranus_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), mode = P.mode || 'flanks';
      // faint graticule over the whole frame
      let grat = ''; for (let x = 60; x < 1080; x += 160) grat += `M${x} 140L${x} 1880`; for (let y = 200; y < 1900; y += 160) grat += `M20 ${y}L1060 ${y}`;
      L0(root, grat, C.inkSoft, 1.2, 0.14);
      const SX = 760, SY = 640, KX = 470, KY = 690;    // Stalingrad, Kalaç
      const volga = 'M960 150C930 300 860 450 790 560C760 610 755 660 790 760C840 900 900 1040 960 1160C1000 1300 1020 1500 1060 1880';
      const don = 'M40 330C160 340 260 380 340 460C400 520 440 600 470 690C490 760 450 840 380 920C300 1010 200 1080 120 1160C70 1220 40 1400 20 1880';
      const rv = el(root, 'g');
      L0(rv, volga, mix(C.blue, C.ink, 0.2), 6, 0.9); L0(rv, don, mix(C.blue, C.ink, 0.2), 4.5, 0.85);
      const vl = txt(root, 'Volga', 890, 880, 44, { font: BTL.LO, italic: true, color: C.inkSoft }); vl.setAttribute('opacity', 0.9); vl.setAttribute('text-anchor', 'start');
      const dl = txt(root, 'Don', 200, 330, 44, { font: BTL.LO, italic: true, color: C.inkSoft }); dl.setAttribute('opacity', 0.9);
      // the German army: a soft patch between the rivers around the city
      const patchD = 'M520 560C600 500 720 520 770 580C800 630 790 720 740 770C680 820 560 810 520 760C480 710 470 610 520 560Z';
      const patch = P0(root, patchD, C.inkSoft, 0.3);
      const patchL = L0(root, patchD, C.inkSoft, 2.5, 0.8);
      // the city
      const city = el(root, 'g');
      el(city, 'circle', { cx: SX, cy: SY, r: 12, fill: C.ink });
      const ring = el(city, 'circle', { cx: SX, cy: SY, r: 20, fill: 'none', stroke: C.ink, 'stroke-width': 2.5 });
      const cl = txt(city, P.city || 'Stalingrad', SX - 10, SY - 50, 54, { weight: 400 }); cl.setAttribute('opacity', 1);
      cl.setAttribute('stroke', C.paper); cl.setAttribute('stroke-width', 10); cl.setAttribute('paint-order', 'stroke');
      const out = { update() {} };
      if (mode === 'flanks') {
        const fN = L0(root, 'M180 400C280 420 380 470 450 520C500 545 540 545 560 540', C.ink, 5, 0.95, { 'stroke-dasharray': '18 12' });
        const fS = L0(root, 'M720 790C700 860 690 940 700 1040', C.ink, 5, 0.95, { 'stroke-dasharray': '18 12' });
        const lN = txt(root, P.flank || 'Romenler', 250, 540, 58, { font: BTL.LO, italic: true, color: C.ink });
        const lS = txt(root, P.flank || 'Romenler', 560, 1010, 58, { font: BTL.LO, italic: true, color: C.ink });
        for (const l of [lN, lS]) { l.setAttribute('stroke', C.paper); l.setAttribute('stroke-width', 12); l.setAttribute('stroke-linejoin', 'round'); l.setAttribute('paint-order', 'stroke'); }
        out.update = (lt, dur, cues) => {
          const at = cue(cues, 'hit', dur * 0.5), n = BTL.ease(lt, at - 0.2, 0.9);
          fade(patch, BTL.ease(lt, 0.2, 1)); fade(patchL, BTL.ease(lt, 0.2, 1));
          for (const f of [fN, fS]) {
            f.setAttribute('stroke', n > 0.5 ? C.gold : C.ink);
            f.setAttribute('stroke-width', f1(5 - 1.5 * n));
            f.setAttribute('stroke-opacity', (0.95 - 0.3 * n * (0.5 + 0.5 * Math.sin(lt * 1.6))).toFixed(3));
            f.setAttribute('stroke-dashoffset', f1(-lt * 6));
          }
          fade(lN, BTL.ease(lt, 0.3, 0.8)); fade(lS, BTL.ease(lt, 0.6, 0.8));
          for (const l of [lN, lS]) l.setAttribute('fill', n > 0.5 ? C.gold : C.ink);
        };
      } else {
        // pincers: the north arm crosses the Don from the north-west and runs south-east, the south arm starts south of
        // the city and swings west / north-west; both meet over the Don bend at Kalaç, then the ring closes round the pocket
        const kg = BTL.glow(svg, defs, KX, KY, 160, C.gold, 0, root);
        const aN = L0(root, `M170 230C230 400 350 560 ${KX - 12} ${KY - 18}`, C.gold, 6, 1, { pathLength: 1 });
        const aS = L0(root, `M820 1010C700 1010 560 900 ${KX + 12} ${KY + 16}`, C.gold, 6, 1, { pathLength: 1 });
        const head = (x, y, dx, dy) => { const a = Math.atan2(dy, dx), c = Math.cos(a), s2 = Math.sin(a), bx = x - 38 * c, by = y - 38 * s2;
          return `M${f1(bx - 20 * s2)} ${f1(by + 20 * c)}L${f1(x)} ${f1(y)}L${f1(bx + 20 * s2)} ${f1(by - 20 * c)}`; };
        const hN = L0(root, head(KX - 12, KY - 18, 108, 112), C.gold, 6, 0);
        const hS = L0(root, head(KX + 12, KY + 16, -78, -194), C.gold, 6, 0);
        const ringD = 'M490 540C600 450 760 470 820 560C860 630 850 740 790 800C710 870 550 860 490 790C430 720 420 600 490 540Z';
        const rg = L0(root, ringD, C.gold, 4, 0.95, { pathLength: 1 });
        const meet = el(root, 'g');
        el(meet, 'circle', { cx: KX, cy: KY, r: 14, fill: C.gold });
        const kl = txt(meet, P.meet || 'Kalaç', KX - 40, KY + 18, 52, { weight: 400, anchor: 'end' }); kl.setAttribute('opacity', 1);
        const kd = txt(meet, P.date || '23 Kasım', KX - 40, KY + 76, 44, { font: BTL.LO, italic: true, color: C.gold, anchor: 'end' }); kd.setAttribute('opacity', 1);
        for (const t of [kl, kd]) { t.setAttribute('stroke', C.paper); t.setAttribute('stroke-width', 10); t.setAttribute('paint-order', 'stroke'); }
        // the men inside: a faint field of marks in the patch
        let m = ''; const r = rng(53);
        for (let i = 0; i < 160; i++) { const u = r() * TAU, rr = Math.sqrt(r()), x = 650 + Math.cos(u) * 120 * rr, y = 665 + Math.sin(u) * 110 * rr; if (Math.hypot(x - SX, y - SY) > 30) m += `M${f1(x)} ${f1(y)}l2 -6`; }
        const men = L0(root, m, C.ink, 2.2, 0);
        out.update = (lt, dur, cues) => {
          const at = cue(cues, 'hit', dur * 0.6);
          fade(patch, 1); fade(patchL, 1);
          const pN = BTL.ease(lt, 0.15, Math.max(1, at - 0.75)), pS = BTL.ease(lt, 0.25, Math.max(1, at - 0.85));
          draw(aN, pN); draw(aS, pS);
          hN.setAttribute('stroke-opacity', clamp01((pN - 0.9) * 10).toFixed(3)); hS.setAttribute('stroke-opacity', clamp01((pS - 0.9) * 10).toFixed(3));
          const m2 = BTL.ease(lt, at - 0.65, 0.6);
          fade(meet, m2); kg.set(m2 * (0.3 + 0.05 * Math.sin(lt * 1.2)));
          draw(rg, BTL.ease(lt, at - 0.2, 1.4));
          men.setAttribute('stroke-opacity', (0.6 * BTL.ease(lt, at, 1.2)).toFixed(3));
        };
      }
      return {
        update(lt, dur, cues) {
          const ph = (lt % 2.6) / 2.6;
          ring.setAttribute('r', f1(16 + 22 * ph)); ring.setAttribute('stroke-opacity', ((1 - ph) * 0.8).toFixed(3));
          out.update(lt, dur, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the frozen steppe in fog
  SH.bt_uranus_steppe = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 860;
      BTL.glow(svg, defs, 540, HZ - 60, 640, C.stain, 0.14, root);
      const far = fog(root, defs, 61, band(61, HZ - 260, HZ + 60, 7, 0.32, 560, 160));
      P0(root, `M-60 ${HZ}L1140 ${HZ}L1140 2000L-60 2000Z`, mix(C.paper, SNOW(), 0.3), 1);
      L0(root, `M-60 ${HZ}L1140 ${HZ}`, C.inkSoft, 2, 0.5);
      let drift = ''; const r = rng(67);
      for (let i = 0; i < 12; i++) { const y = HZ + 40 + i * i * 7 + r() * 20, x = -60 + r() * 700; drift += `M${f1(x)} ${f1(y)}c120 -8 300 -8 ${f1(360 + r() * 300)} 2`; }
      L0(root, drift, C.inkSoft, 1.5, 0.25);
      const D = BTL.drawing(root);
      // the telegraph pole with one crossbar, wires running off both sides
      D.f('M672 1110L688 1110L684 470L676 470Z', SIL(), 1);
      D.s('M672 1110L688 1110L684 470L676 470Z', { w: 2.5, color: C.inkSoft });
      D.s('M610 520L750 520M620 520L620 506M740 520L740 506', { w: 4, color: C.inkSoft });
      D.s('M-60 600C200 640 450 560 620 512M740 512C860 540 1000 580 1140 560', { w: 1.6, color: C.inkSoft, alpha: 0.7 });
      // fence stakes leading away, smaller towards the horizon
      let st = '';
      for (let i = 0; i < 7; i++) { const u = i / 7, x = 220 + 330 * u, y = 1180 - 300 * u, h = 110 * (1 - 0.7 * u); st += `M${f1(x)} ${f1(y)}L${f1(x + 4)} ${f1(y - h)}`; }
      D.s(st, { w: 4, color: C.inkSoft });
      D.s('M224 1110C300 1100 380 1030 450 990C500 960 530 940 552 930', { w: 1.4, color: C.inkSoft, alpha: 0.6 });
      const near = fog(root, defs, 71, band(71, HZ - 80, HZ + 360, 6, 0.26, 520, 150));
      const sn = snow(root, 40, 73, [-20, 0, 1100, 1900], { sp: 16, s: 2, alpha: 0.4 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.4), n = BTL.ease(lt, at - 0.2, 1.6);
          D.reveal(BTL.ease(lt, 0, 1.6));
          far.update(lt * 1.4, 0.9 + 0.4 * n); near.update(lt * 1.4, 0.5 + 0.8 * n);
          sn.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ muzzle flashes along a foggy horizon
  SH.bt_uranus_guns = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 900;
      const sky = BTL.glow(svg, defs, 540, HZ, 700, C.stain, 0.1, root);
      P0(root, `M-60 ${HZ}C300 ${HZ - 8} 700 ${HZ + 6} 1140 ${HZ - 4}L1140 2000L-60 2000Z`, mix(C.paper, SNOW(), 0.22), 1);
      // a low dark ridge in the far distance, where the guns stand
      P0(root, `M-60 ${HZ}C120 ${HZ - 26} 300 ${HZ - 14} 480 ${HZ - 30}C660 ${HZ - 44} 860 ${HZ - 18} 1140 ${HZ - 28}L1140 ${HZ + 10}L-60 ${HZ + 10}Z`, SIL(), 1);
      const r = rng(83), guns = [];
      for (let i = 0; i < 22; i++) {
        const x = 30 + i * 47 + r() * 20, y = HZ - 22 - r() * 16;
        const g = BTL.glow(svg, defs, x, y, 70 + r() * 40, C.gold, 0, root);
        const core = P0(root, BTL.E(x, y, 5, 3.5), C.ink, 0);
        guns.push({ g, core, ph: r(), sp: 0.5 + r() * 0.35 });
      }
      const fogF = fog(root, defs, 89, band(89, HZ - 140, HZ + 180, 8, 0.34, 520, 140));
      const fogG = fog(root, defs, 97, band(97, HZ - 80, HZ + 40, 5, 0, 480, 110), mix(C.stain, C.gold, 0.4));
      // the near edge: snow and a dark trench lip in the foreground
      let dr = ''; for (let i = 0; i < 10; i++) { const y = HZ + 80 + i * i * 9 + r() * 20, x = -60 + r() * 700; dr += `M${f1(x)} ${f1(y)}c140 -8 320 -8 ${f1(380 + r() * 300)} 2`; }
      L0(root, dr, C.inkSoft, 1.5, 0.22);
      P0(root, 'M-60 1480C200 1440 500 1460 760 1430C900 1416 1040 1440 1140 1430L1140 2000L-60 2000Z', mix(C.paperDark, C.paper, 0.4), 1);
      L0(root, 'M-60 1480C200 1440 500 1460 760 1430C900 1416 1040 1440 1140 1430', C.inkSoft, 2.5, 0.6);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55), all = BTL.ease(lt, at - 0.15, 0.5) * (1 - 0.5 * BTL.ease(lt, at + 0.6, 2));
          let sum = 0;
          for (const q of guns) {
            const u = ((lt * q.sp + q.ph) % 1), sw = Math.max(0, Math.sin(Math.PI * clamp01(u / 0.35))) ** 2;   // a soft swell, not a flicker
            const a = Math.max(sw * 0.55 * BTL.ease(lt, 0, 0.8), all * 0.8);
            q.g.set(a); q.core.setAttribute('fill-opacity', (a * 1.1).toFixed(3)); sum += a;
          }
          fogF.update(lt, 1);
          fogG.update(lt, 0.15 + 0.5 * all + 0.2 * sum / guns.length);
          sky.set(0.08 + 0.12 * all + 0.05 * sum / guns.length);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the column of prisoners walking away
  SH.bt_uranus_march = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), HZ = 640;
      const when = txt(root, P.when || 'Şubat 1943', 540, 200, 50, { font: BTL.LO, italic: true, color: C.inkSoft });
      const num = txt(root, P.n || '91.000', 540, 360, 150, { weight: 300, color: C.gold });
      const lab = txt(root, P.label || 'esir', 540, 450, 62, { font: BTL.LO, italic: true });
      P0(root, `M-60 ${HZ}L1140 ${HZ}L1140 2000L-60 2000Z`, mix(C.paper, SNOW(), 0.28), 1);
      L0(root, `M-60 ${HZ}L1140 ${HZ}`, C.inkSoft, 2, 0.5);
      BTL.glow(svg, defs, 540, 900, 560, C.stain, 0.16, root);
      // the trodden track: from the left foreground (y 1110) to a point on the horizon
      const T = [[150, 1110], [320, 980], [520, 760], [650, 642]];
      const track = `M${T[0]}C${T[1]} ${T[2]} ${T[3]}`.replace(/,/g, ' ');
      L0(root, track, mix(C.paper, C.paperDark, 0.45), 70, 0.5);
      L0(root, track, C.inkSoft, 1.5, 0.35);
      const at = u => { const v = 1 - u, k = [v * v * v, 3 * v * v * u, 3 * v * u * u, u * u * u]; return [0, 1].map(j => k.reduce((acc, w, i) => acc + w * T[i][j], 0)); };
      const men = [], N = 24;
      for (let i = 0; i < N; i++) { const g = el(root, 'g'); BTL.person(g, 'stand', 0, 0, 100, { color: SIL(), rim: C.inkSoft }); men.push({ g, u0: i / N, off: ((i * 0.618) % 1) - 0.5 }); }
      const haze = fog(root, defs, 101, band(101, HZ - 140, HZ + 200, 7, 0.3, 520, 130));
      // foreground snow below the column, down to the bottom of the frame
      waves(el(root, 'g'), 1140, 59, { n: 4, step: 190 });
      const sn = snow(root, 70, 103, [-20, 0, 1100, 1900], { sp: 26 });
      return {
        update(lt, dur, cues) {
          fade(when, 0.9); fade(num, 1); fade(lab, 1);
          for (const q of men) {
            const u = (q.u0 + lt * 0.014) % 1, [x, y] = at(u), h = 200 * Math.pow(1 - u, 1.4) + 10;
            q.g.setAttribute('transform', `translate(${f1(x + q.off * 70 * (1 - u))} ${f1(y)}) scale(${(h / 100).toFixed(3)})`);
            q.g.setAttribute('opacity', (clamp01((1 - u) * 5) * clamp01(u * 25)).toFixed(3));
          }
          haze.update(lt, 1); sn.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ 91 marks, five come home
  SH.bt_uranus_return = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g');
      BTL.glow(svg, defs, 540, 780, 600, C.stain, 0.12, root);
      const num = txt(root, P.n || '5.000', 540, 400, 170, { weight: 300, color: C.gold });
      const lab = txt(root, P.label || 'eve döndü', 540, 490, 60, { font: BTL.LO, italic: true });
      const cols = 13, rows = 7, sx = 66, sy = 82, x0 = 540 - (cols - 1) * sx / 2, y0 = 640;
      const keep = new Set([9, 30, 47, 66, 83]);
      const fig = (x, y) => `M${f1(x)} ${f1(y - 44)}m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M${f1(x - 13)} ${f1(y + 14)}L${f1(x - 13)} ${f1(y - 22)}C${f1(x - 13)} ${f1(y - 32)} ${f1(x + 13)} ${f1(y - 32)} ${f1(x + 13)} ${f1(y - 22)}L${f1(x + 13)} ${f1(y + 14)}Z`;
      let dAll = '', dKeep = '';
      for (let i = 0; i < 91; i++) { const x = x0 + (i % cols) * sx, y = y0 + Math.floor(i / cols) * sy; if (keep.has(i)) dKeep += fig(x, y); else dAll += fig(x, y); }
      const all = P0(root, dAll, C.inkSoft, 0.85);
      const five = P0(root, dKeep, C.inkSoft, 0.85);
      const haze = fog(root, defs, 107, band(107, 600, 1200, 6, 0.18, 500, 160));
      const sn = snow(root, 50, 109, [-20, 0, 1100, 1900], { sp: 20, alpha: 0.45 });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.4), n = BTL.ease(lt, at - 0.1, 1.4);
          const appear = BTL.ease(lt, 0, 0.8);
          all.setAttribute('fill-opacity', (appear * (0.85 - 0.75 * n)).toFixed(3));
          five.setAttribute('fill', n > 0.4 ? C.gold : C.inkSoft);
          five.setAttribute('fill-opacity', (appear * (0.85 + 0.15 * n)).toFixed(3));
          fade(num, BTL.ease(lt, at, 0.8)); fade(lab, BTL.ease(lt, at + 0.4, 0.8));
          haze.update(lt, 1); sn.update(lt);
        },
      };
    },
  };
})();
