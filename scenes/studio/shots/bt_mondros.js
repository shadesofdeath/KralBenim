// bt_mondros: the Armistice of Mudros (30 October 1918), belgesel style (docs/BELGESEL.md).
// Clean still line art, slow natural motion only (water, lamp light, smoke, self-drawing lines). Vertical Short first.
//   bt_warship  P: {}                       night harbour: one pre-dreadnought battleship silhouette on still water,
//                                           lit portholes, their reflections trembling slowly, smoke drifting, stars
//   bt_cabin    P: {}                       a ship's cabin: hanging lamp, two portholes, a table with papers and two
//                                           faceless seated delegates facing each other, a thread of smoke
//   bt_treaty   P: {header, label, n, hit}  cues: hit    one page of the armistice; lines write themselves; on "hit"
//                                           article n (default 7) turns gold, a bracket draws, "Madde 7" appears
//   bt_bosphorus P: {n}  cues: hit          Istanbul's skyline (domes, minarets) at dusk; a line of warships slides
//                                           in on the water; on "hit" the last ships are in place and the light cools
//   bt_key      P: {}  cues: key, lock      the treaty page fades; an old iron key draws itself in a light pool; on
//                                           "lock" a door edge + lock plate appear, the key slides in, turns, light
//                                           opens in the door gap
//   bt_aegean   P: {bounds, label, sub, ship}  cues: m   north Aegean: Lemnos in the middle, Imbros, Gallipoli, the
//                                           Troad; Mudros Bay point pulses, the battleship lies at anchor below it
//   bt_occupy   P: like bt_map               the shared bt_map plus a spreading gold zone at every point on its cue
//   bt_mosul    P: {label, sub}  cues: m    Mosul at dusk: the leaning al-Hadba minaret over flat roofs; on "m" the
//                                           balcony lamp and the sky light go out, stars come up
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const f1 = v => v.toFixed(1);
  const fade = (e, a) => e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1) => el(parent, 'path', { d, fill, 'fill-opacity': a, stroke: 'none' });
  const L0 = (parent, d, stroke, w = 3, a = 1) => el(parent, 'path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));

  // ------------------------------------------------------------------ the battleship (waterline at y 0, bow right)
  // A Lord Nelson class pre-dreadnought (HMS Agamemnon): long low hull, two funnels, two pole masts, twin turrets.
  const SHIP = {
    hull: 'M-332 0C-340-18-338-36-324-48L300-52L336-58L346 0Z',
    deck: 'M-170-49L-164-82L150-84L160-51Z',
    bridge: 'M98-84L104-118L160-118L156-84Z',
    fun1: 'M-62-82L-56-178L-18-178L-14-82Z',
    fun2: 'M8-84L14-180L52-180L56-84Z',
    turF: 'M206-54L212-82L266-82L272-54Z',
    turA: 'M-272-52L-266-80L-212-80L-206-52Z',
    guns: 'M262-70L326-74M262-62L322-64M-266-68L-330-72M-266-60L-326-62',
    masts: 'M128-118L128-272M106-236L150-236M-150-82L-150-238M-172-208L-128-208',
    rig: 'M128-272L340-58M-150-238L-330-46M128-250L-150-222',
    sec: 'M-120-82L-120-96L-86-96L-86-82M60-84L60-98L92-98L92-84',
  };
  const SHIP_SOLID = SHIP.hull + SHIP.deck + SHIP.bridge + SHIP.fun1 + SHIP.fun2 + SHIP.turF + SHIP.turA;
  const PORTS = (() => { const r = rng(1918), out = []; for (let x = -296; x <= 296; x += 23) out.push({ x, lit: r() < 0.55, ph: r() * 6.28 }); return out; })();

  // a small solid ship silhouette (no draw-in) for the fleet; local stroke width compensates the scale
  function smallShip(parent, x, y, s, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${s})` });
    P0(g, SHIP_SOLID, o.fill || C.paperDark, 1);
    el(g, 'path', { d: SHIP_SOLID, fill: 'none', stroke: C.inkSoft, 'stroke-width': 2.2 / s, 'stroke-linejoin': 'round' });
    L0(g, SHIP.guns + SHIP.masts, C.inkSoft, 2.2 / s, 1);
    return g;
  }

  SH.bt_warship = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      const st = BTL.stars(g, 200, 23, [0, -200, 1920, 520]);
      const sky = BTL.glow(svg, defs, 960, 600, 470, C.stain, 0.22, g);
      // the low hills of Lemnos behind the harbour
      P0(g, 'M0 690L0 650C200 640 330 598 520 610C650 618 700 580 820 586C940 592 1000 634 1120 628C1260 620 1330 570 1480 582C1640 596 1760 646 1920 648L1920 690Z', C.paperLight, 0.7);
      L0(g, 'M0 650C200 640 330 598 520 610C650 618 700 580 820 586C940 592 1000 634 1120 628C1260 620 1330 570 1480 582C1640 596 1760 646 1920 648', C.inkSoft, 2, 0.6);
      // water
      P0(g, 'M0 690L1920 690L1920 1800L0 1800Z', C.paperDark, 0.85);
      L0(g, 'M0 690L1920 690', C.inkSoft, 2, 0.5);
      const ripples = [];
      for (let i = 0; i < 14; i++) {
        const y = 716 + i * i * 4 + i * 16, len = 60 + i * 26, x = 640 + ((i * 271) % 640);
        ripples.push({ e: L0(g, '', C.inkSoft, 2, 0.28 - i * 0.012), y, len, x, sp: 4 + (i % 4) * 2.5, ph: i * 1.7 });
      }
      // ship
      const sg = el(g, 'g', { transform: 'translate(960 690) scale(0.8)' });
      // reflection: the ship's mirror image, very faint
      const refl = el(sg, 'g', { transform: 'scale(1 -0.62)' });
      P0(refl, SHIP_SOLID, C.paper, 0.55);
      const smoke = [0, 1, 2, 3].map(i => ({ e: L0(sg, '', C.inkSoft, 6, 0), x: i < 2 ? -37 : 33, y: -182, ph: i * 0.5 }));
      const D = BTL.drawing(sg);
      D.f(SHIP_SOLID, C.paperDark, 1);
      D.s(SHIP.hull, { w: 3.5, color: C.inkSoft });
      D.s(SHIP.deck + SHIP.bridge, { w: 3, color: C.inkSoft });
      D.s(SHIP.fun1 + SHIP.fun2, { w: 3, color: C.inkSoft });
      D.s(SHIP.turF + SHIP.turA + SHIP.sec, { w: 3, color: C.inkSoft });
      D.s(SHIP.guns, { w: 5, color: C.inkSoft });
      D.s(SHIP.masts, { w: 3, color: C.inkSoft });
      D.s(SHIP.rig, { w: 1.5, color: C.inkSoft, alpha: 0.6 });
      D.s('M-322-40L298-44', { w: 1.5, color: C.inkSoft, alpha: 0.5 });
      const ports = PORTS.filter(p => p.lit).map(p => ({ p, e: el(sg, 'circle', { cx: p.x, cy: -28, r: 3.6, fill: C.gold, 'fill-opacity': 0 }),
        r: L0(sg, '', C.gold, 3, 0) }));
      const mast = el(sg, 'circle', { cx: 128, cy: -272, r: 4, fill: C.gold, 'fill-opacity': 0 });
      return {
        update(lt) {
          st.update(lt);
          sky.set(0.2 + 0.03 * Math.sin(lt * 0.5));
          D.reveal(BTL.ease(lt, 0, 2.2));
          const on = BTL.ease(lt, 0.8, 1.6);
          for (const q of ports) {
            q.e.setAttribute('fill-opacity', (on * (0.75 + 0.2 * Math.sin(lt * 0.7 + q.p.ph))).toFixed(3));
            const dx = 5 * Math.sin(lt * 0.9 + q.p.ph), y = 26 + (q.p.ph % 1) * 14, w = 8 + 5 * Math.sin(lt * 0.6 + q.p.ph * 2);
            q.r.setAttribute('d', `M${f1(q.p.x - w + dx)} ${f1(y)}L${f1(q.p.x + w + dx)} ${f1(y)}`);
            q.r.setAttribute('stroke-opacity', (on * 0.45).toFixed(3));
          }
          mast.setAttribute('fill-opacity', (on * (0.6 + 0.3 * Math.sin(lt * 1.1))).toFixed(3));
          for (const r of ripples) {
            const x = r.x + r.sp * lt + 14 * Math.sin(lt * 0.4 + r.ph);
            r.e.setAttribute('d', `M${f1(x - r.len / 2)} ${r.y}L${f1(x + r.len / 2)} ${r.y}`);
          }
          for (const s of smoke) {   // slow wisps drifting aft (left)
            const q = ((lt * 0.12 + s.ph) % 1), x = s.x - q * 150, y = s.y - q * 70;
            s.e.setAttribute('d', `M${f1(x + 20)} ${f1(y + 10)}C${f1(x)} ${f1(y - 6)} ${f1(x - 30)} ${f1(y + 4)} ${f1(x - 60)} ${f1(y - 8)}`);
            s.e.setAttribute('stroke-opacity', (0.28 * Math.sin(q * Math.PI) * BTL.ease(lt, 1, 1)).toFixed(3));
          }
        },
      };
    },
  };

  SH.bt_cabin = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      // curved hull wall with ribs, a ceiling beam
      L0(g, 'M560 160C600 400 600 640 570 830M1360 160C1320 400 1320 640 1350 830', C.inkSoft, 3, 0.5);
      L0(g, 'M520 210L1400 210M520 232L1400 232', C.inkSoft, 2.5, 0.45);
      const lamp = BTL.glow(svg, defs, 960, 430, 560, C.stain, 0.28, g);
      // portholes (lomboz)
      const ports = [[760, 380], [1160, 380]].map(([x, y]) => {
        P0(g, BTL.E(x, y, 50, 50), C.paperDark, 1);
        const sh = P0(g, BTL.E(x, y, 40, 40), C.blue, 0);
        const wave = L0(g, '', C.ink, 2, 0.4);
        L0(g, BTL.E(x, y, 50, 50), C.inkSoft, 5, 1);
        L0(g, BTL.E(x, y, 40, 40), C.inkSoft, 2, 0.8);
        let riv = ''; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.2832; riv += BTL.E(x + Math.cos(a) * 58, y + Math.sin(a) * 58, 3, 3); }
        P0(g, riv, C.inkSoft, 0.8);
        return { x, y, sh, wave };
      });
      // floor
      P0(g, 'M0 820L1920 820L1920 1800L0 1800Z', C.paperDark, 0.75);
      L0(g, 'M0 820L1920 820', C.inkSoft, 2.5, 0.7);
      let planks = ''; for (let k = -6; k <= 6; k++) planks += `M${960 + k * 70} 820L${960 + k * 190} 1400`;
      L0(g, planks, C.inkSoft, 1.5, 0.18);
      // the lamp on its chain
      const D = BTL.drawing(g);
      D.s('M960 150L960 300', { w: 2, color: C.inkSoft });
      D.f('M930 300L990 300L1010 334L910 334Z', C.paperLight, 1);
      D.s('M930 300L990 300L1010 334L910 334Z', { w: 3 });
      const bulb = el(g, 'circle', { cx: 960, cy: 342, r: 9, fill: C.gold, 'fill-opacity': 0.9 });
      // chairs, then the delegates
      D.s('M688 820L684 590M688 742L750 742M1232 820L1236 590M1232 742L1170 742', { w: 4, color: C.inkSoft });
      BTL.person(g, 'sit', 732, 820, 330, { face: 1 });
      BTL.person(g, 'sit', 1188, 820, 330, { face: -1 });
      // table + papers
      D.f('M800 642L1120 642L1150 670L770 670Z', C.paperLight, 1);
      D.s('M800 642L1120 642L1150 670L770 670Z', { w: 3.5 });
      D.s('M790 670L790 820M1130 670L1130 820M960 670L960 812', { w: 3.5 });
      D.f('M902 652L996 648L1006 662L912 666Z', C.ink, 0.85);
      D.f('M940 646L1020 644L1030 656L948 658Z', C.ink, 0.6);
      D.s('M916 660L990 657', { w: 2, color: C.gold });
      D.f('M1060 640C1060 632 1086 632 1086 640Z', C.inkSoft, 1);   // ashtray
      const smoke = [0, 1, 2].map(i => ({ e: L0(g, '', C.inkSoft, 3, 0), ph: i / 3 }));
      return {
        update(lt) {
          D.reveal(BTL.ease(lt, 0, 2));
          lamp.set(0.26 + 0.03 * Math.sin(lt * 0.9) + 0.015 * Math.sin(lt * 2.3));
          bulb.setAttribute('fill-opacity', (0.8 + 0.15 * Math.sin(lt * 0.9)).toFixed(3));
          ports.forEach((p, i) => {   // moonlit water rising and falling slowly behind the glass
            p.sh.setAttribute('fill-opacity', (0.12 + 0.05 * Math.sin(lt * 0.6 + i)).toFixed(3));
            const h = p.y + 8 + 10 * Math.sin(lt * 0.7 + i * 1.3);
            p.wave.setAttribute('d', `M${p.x - 34} ${f1(h)}C${p.x - 12} ${f1(h - 6)} ${p.x + 12} ${f1(h + 6)} ${p.x + 34} ${f1(h)}`);
          });
          for (const s of smoke) {
            const q = (lt * 0.18 + s.ph) % 1, y = 630 - q * 230, sw = 14 * Math.sin(lt * 0.8 + s.ph * 6);
            s.e.setAttribute('d', `M1073 ${f1(y + 50)}C${f1(1073 + sw)} ${f1(y + 25)} ${f1(1073 - sw)} ${f1(y)} ${f1(1073 + sw * 0.6)} ${f1(y - 30)}`);
            s.e.setAttribute('stroke-opacity', (0.4 * Math.sin(q * Math.PI)).toFixed(3));
          }
        },
      };
    },
  };

  // one page of the treaty: paragraphs of hand-ruled lines; article n lights up on the cue
  function treatyPage(parent, o = {}) {
    const g = el(parent, 'g'), n = o.n || 7, paras = [];
    P0(g, 'M-310-420L250-420L310-360L310 420L-310 420Z', C.paperLight, 1);
    L0(g, 'M-310-420L250-420L310-360L310 420L-310 420Z', C.inkSoft, 3, 1);
    L0(g, 'M250-420L250-360L310-360', C.inkSoft, 2, 0.8);
    const r = rng(77);
    let y = -250;
    for (let i = 1; i <= 8; i++) {
      const lines = [], nl = i === n ? 3 : 2;
      const mark = L0(g, `M-262 ${y - 8}L-228 ${y - 8}`, C.inkSoft, 4, 1);
      for (let k = 0; k < nl; k++) {
        const x0 = k === 0 ? (i === n ? -40 : -200) : -262, x1 = k === nl - 1 ? 40 + r() * 160 : 262;
        const e = L0(g, `M${x0} ${y - 8 + k * 24}L${f1(x1)} ${y - 8 + k * 24}`, C.inkSoft, 3, 0.9);
        e.setAttribute('pathLength', 1);
        lines.push(e);
      }
      paras.push({ i, y, mark, lines });
      y += nl * 24 + 30;
    }
    return { g, paras, art: paras[n - 1] };
  }

  SH.bt_treaty = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, cx = W / 2, cy = portrait ? 680 : H * 0.46, k = portrait ? 1 : 0.86;
      const g = el(svg, 'g');
      const gl = BTL.glow(svg, defs, cx, cy, 620, C.stain, 0.16, g);
      const pg = el(g, 'g');
      const T = treatyPage(pg, { n: P.n || 7 });
      const head = label(T.g, P.header || 'MÜTAREKE', 0, -330, 52, { weight: 500, spacing: '0.12em' });
      const rule = L0(T.g, 'M-120-300L120-300', C.inkSoft, 2, 1); rule.setAttribute('pathLength', 1);
      const A = T.art, ay = A.y - 8;
      const lab = label(T.g, P.label || 'Madde 7', -262, ay + 16, 50, { weight: 600, color: C.gold, anchor: 'start' });
      const brk = L0(T.g, `M-286 ${ay - 34}L-296 ${ay - 34}L-296 ${ay + 70}L-286 ${ay + 70}`, C.gold, 4, 1); brk.setAttribute('pathLength', 1);
      const gold = A.lines.map(e => { const c = e.cloneNode(); c.setAttribute('stroke', C.gold); c.setAttribute('stroke-width', 4); c.setAttribute('stroke-opacity', 1); T.g.appendChild(c); return c; });
      const all = T.paras.flatMap(p => p.lines);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.4), q = BTL.ease(lt, th - 0.2, 1.2);
          fade(head, BTL.ease(lt, 0, 1)); draw(rule, BTL.ease(lt, 0.2, 1));
          all.forEach((e, j) => draw(e, BTL.ease(lt, 0.1 + j * 0.06, 0.7)));
          T.paras.forEach(p => {
            const dim = p === A ? 1 : 1 - 0.65 * q;
            p.lines.forEach(e => e.setAttribute('opacity', dim.toFixed(3)));
            p.mark.setAttribute('opacity', (p === A ? 1 - q : dim).toFixed(3));
          });
          gold.forEach((e, j) => draw(e, BTL.ease(lt, th + j * 0.25, 0.9)));
          draw(brk, q); fade(lab, BTL.ease(lt, th, 1));
          gl.set(0.14 + 0.1 * q);
          // a slow push towards the article once it lights up
          const z = k * (1 + 0.14 * BTL.ease(lt, th, Math.max(1.5, dur - th))), fy = ay * (z - k);
          pg.setAttribute('transform', `translate(${cx} ${f1(cy - fy)}) scale(${z.toFixed(4)})`);
        },
      };
    },
  };

  // Istanbul's historic peninsula: hill line with three great mosques (domes + a few minarets), seen from the sea
  function skyline() {
    let d = 'M380 640L380 626C450 620 500 606 560 600';
    const mosque = (x, base, r, mins) => {
      let s = `L${x - r * 2.1} ${base}L${x - r * 2.1} ${base - r * 0.6}L${x - r * 1.45} ${base - r * 0.6}`;
      s += `A${r * 0.42} ${r * 0.42} 0 0 1 ${x - r * 1.05} ${base - r * 0.85}L${x - r} ${base - r * 0.85}`;
      s += `A${r} ${r} 0 0 1 ${x + r} ${base - r * 0.85}L${x + r * 1.05} ${base - r * 0.85}`;
      s += `A${r * 0.42} ${r * 0.42} 0 0 1 ${x + r * 1.45} ${base - r * 0.6}L${x + r * 2.1} ${base - r * 0.6}L${x + r * 2.1} ${base}`;
      let m = '';
      for (const [mx, mh] of mins) m += `M${x + mx - 5} ${base}L${x + mx - 5} ${base - mh}L${x + mx} ${base - mh - 30}L${x + mx + 5} ${base - mh}L${x + mx + 5} ${base}Z`;
      return { s, m };
    };
    const A = mosque(700, 600, 48, [[-118, 130], [118, 130]]);
    const B = mosque(975, 590, 44, [[-104, 150], [104, 150], [-132, 108], [132, 108]]);
    const Cc = mosque(1245, 594, 52, [[-126, 160], [126, 160]]);
    d += A.s + 'L860 592' + B.s + 'L1100 588' + Cc.s + 'L1380 596C1450 604 1500 618 1560 626L1560 640Z';
    return { body: d, mins: A.m + B.m + Cc.m };
  }

  SH.bt_bosphorus = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      const sky = BTL.glow(svg, defs, 980, 590, 520, C.stain, 0.3, g);
      const st = BTL.stars(g, 70, 9, [0, -200, 1920, 360]);
      const S = skyline();
      const D = BTL.drawing(g);
      D.f(S.body + S.mins, C.paperDark, 1);
      D.s(S.body.replace(/Z$/, ''), { w: 2.5, color: C.inkSoft });
      D.s(S.mins, { w: 2, color: C.inkSoft });
      // a few lit windows in the city
      const wins = [];
      const r = rng(1311);
      for (let i = 0; i < 16; i++) wins.push({ e: el(g, 'rect', { x: f1(620 + r() * 700), y: f1(612 + r() * 18), width: 5, height: 7, fill: C.gold, 'fill-opacity': 0 }), ph: r() * 6.28 });
      // sea
      P0(g, 'M0 640L1920 640L1920 1800L0 1800Z', C.paperDark, 0.6);
      L0(g, 'M0 640L1920 640', C.inkSoft, 2, 0.5);
      const col = el(g, 'g');
      const ripples = [];
      for (let i = 0; i < 12; i++) {
        const y = 660 + i * i * 4 + i * 16, len = 40 + i * 18;
        ripples.push({ e: L0(col, '', C.stain, 2, 0.35 - i * 0.02), y, len, ph: i * 1.9 });
      }
      // the fleet: a line of warships, far ones small and high, near ones lower and larger
      const n = P.n || 5, fleet = [];
      for (let i = 0; i < n; i++) {
        const q = i / (n - 1), s = 0.17 + q * 0.19, x = 690 + i * 118, y = 690 + q * 130;
        fleet.push({ g: smallShip(g, x, y, s), x, y, s, i });
      }
      return {
        update(lt, dur, cues) {
          st.update(lt);
          D.reveal(BTL.ease(lt, 0, 1.8));
          sky.set(0.28 + 0.03 * Math.sin(lt * 0.6));
          for (const w of wins) w.e.setAttribute('fill-opacity', (BTL.ease(lt, 0.8, 1.5) * (0.55 + 0.25 * Math.sin(lt * 0.5 + w.ph))).toFixed(3));
          for (const rp of ripples) {
            const dx = 16 * Math.sin(lt * 0.5 + rp.ph);
            rp.e.setAttribute('d', `M${f1(980 - rp.len / 2 + dx)} ${rp.y}L${f1(980 + rp.len / 2 + dx)} ${rp.y}`);
          }
          const th = cue(cues, 'hit', dur * 0.5);
          for (const f of fleet) {   // they slide in from the right, one after another, and keep creeping on
            const at = 0.2 + (th - 0.2) * (f.i / (n - 1));
            const p = BTL.ease(lt, at, 1.8), x = f.x + (1 - p) * 140 - 6 * lt;
            f.g.setAttribute('transform', `translate(${f1(x)} ${f1(f.y)}) scale(${f.s})`);
            fade(f.g, p);
          }
        },
      };
    },
  };

  // the old key: ring bow, collar, shaft, bit (origin = centre of the shaft)
  const KEY = {
    bow: BTL.E(-236, 0, 96, 96), bowIn: BTL.E(-236, 0, 58, 58),
    trefoil: BTL.E(-236, -30, 16, 16) + BTL.E(-262, 16, 16, 16) + BTL.E(-210, 16, 16, 16),
    collar: 'M-140-28L-118-28L-118 28L-140 28ZM-104-21L-90-21L-90 21L-104 21Z',
    shaft: 'M-90-13L262-13C272-13 274 13 262 13L-90 13Z',
    bit: 'M168 13L168 122L196 122L196 84L216 84L216 122L250 122L250 13Z',
  };
  SH.bt_key = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, cx = W / 2, cy = portrait ? 660 : H * 0.45, k = portrait ? 1.35 : 1.1;
      const g = el(svg, 'g');
      const gl = BTL.glow(svg, defs, cx, cy + 20, 560, C.stain, 0.12, g);
      // the page it was (fades out)
      const pg = el(g, 'g', { transform: `translate(${cx} ${cy}) scale(${portrait ? 0.95 : 0.8})` });
      const T = treatyPage(pg, {});
      T.paras.forEach(p => p.lines.forEach(e => draw(e, 1)));
      // the door it opens: a door edge, a lock plate with a keyhole, the light of the gap behind it
      const lx = portrait ? 720 : cx + 330, door = el(g, 'g', { opacity: 0 });
      const slitGl = BTL.glow(svg, defs, lx + 110, cy, 420, C.gold, 0, door);
      const slit = el(door, 'rect', { x: lx + 108, y: cy - 520, width: 4, height: 1040, fill: C.gold, 'fill-opacity': 0 });
      P0(door, `M${lx + 106} ${cy - 560}L${lx + 106} ${cy + 560}`, 'none');
      L0(door, `M${lx + 106} ${cy - 560}L${lx + 106} ${cy + 560}`, C.inkSoft, 3, 0.8);
      const plate = `M${lx - 54} ${cy - 150}Q${lx - 54} ${cy - 170} ${lx - 34} ${cy - 170}L${lx + 34} ${cy - 170}Q${lx + 54} ${cy - 170} ${lx + 54} ${cy - 150}L${lx + 54} ${cy + 150}Q${lx + 54} ${cy + 170} ${lx + 34} ${cy + 170}L${lx - 34} ${cy + 170}Q${lx - 54} ${cy + 170} ${lx - 54} ${cy + 150}Z`;
      const kg = el(g, 'g', { transform: `translate(${cx} ${cy}) rotate(-12) scale(${k})` });
      const D = BTL.drawing(kg);
      const solid = KEY.bow + KEY.collar + KEY.shaft + KEY.bit;
      D.f(solid, C.paperLight, 1);
      D.f(KEY.bowIn, C.paper, 1);
      D.s(KEY.bow, { w: 4 }); D.s(KEY.bowIn, { w: 3 });
      D.s(KEY.trefoil, { w: 2.5, color: C.inkSoft });
      D.s(KEY.collar, { w: 3.5 }); D.s(KEY.shaft, { w: 4 }); D.s(KEY.bit, { w: 4 });
      D.s('M-80-4L240-4', { w: 2, color: C.inkSoft, alpha: 0.7 });
      const G = BTL.drawing(kg);
      G.s(KEY.bow + KEY.bit, { w: 6, color: C.gold });
      // the plate is drawn over the key, so the bit disappears into the keyhole
      const lock = el(g, 'g', { opacity: 0 });
      P0(lock, plate, C.paperDark, 1); L0(lock, plate, C.inkSoft, 3, 1);
      P0(lock, `${BTL.E(lx, cy - 18, 15, 15)}M${lx - 8} ${cy - 8}L${lx - 14} ${cy + 34}L${lx + 14} ${cy + 34}L${lx + 8} ${cy - 8}Z`, C.paper, 1);
      P0(lock, BTL.E(lx, cy - 130, 6, 6) + BTL.E(lx, cy + 130, 6, 6), C.inkSoft, 1);
      const ks = portrait ? 1.1 : 0.8;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'key', dur * 0.3), tl = cue(cues, 'lock', Math.max(th + 1.6, dur * 0.5));
          fade(pg, BTL.ease(lt, 0, 0.6) * (1 - BTL.ease(lt, th - 0.6, 1.4)) * 0.9);
          D.reveal(BTL.ease(lt, th - 0.4, 2.0));
          G.reveal(BTL.ease(lt, th + 0.8, 1.6));
          gl.set(0.1 + 0.2 * BTL.ease(lt, th, 2.5) + 0.03 * Math.sin(lt * 0.7));
          // then the key travels into the lock, turns a quarter, and light opens in the door gap
          const a = BTL.ease(lt, tl - 0.2, 0.9), m = BTL.ease(lt, tl + 0.2, 1.6), turn = BTL.ease(lt, tl + 1.9, 0.9), lite = BTL.ease(lt, tl + 2.5, 1.8);
          fade(door, a); fade(lock, a);
          const z = lerp(k * (1 + 0.04 * BTL.ease(lt, th, 2)), ks, m);
          const tx = lerp(cx, lx - 168 * ks, m), rot = lerp(-12, 0, m);
          kg.setAttribute('transform', `translate(${f1(tx)} ${cy}) rotate(${f1(rot)}) scale(${z.toFixed(4)} ${(z * (1 - 0.55 * turn)).toFixed(4)})`);
          slit.setAttribute('fill-opacity', (0.9 * lite).toFixed(3));
          slit.setAttribute('x', f1(lx + 108 - 10 * lite)); slit.setAttribute('width', f1(4 + 20 * lite));
          slitGl.set(0.3 * lite + 0.04 * lite * Math.sin(lt * 0.8));
        },
      };
    },
  };

  // ------------------------------------------------------------------ a small map of the north Aegean around Lemnos
  // [lon, lat] outlines, simplified by hand: Lemnos (Mudros Bay cuts deep into its south coast), Imbros, Gallipoli
  // and Thrace, the Troad
  const AEG = {
    lemnos: [[25.05, 39.92], [25.07, 39.97], [25.13, 40.01], [25.20, 40.02], [25.24, 39.99], [25.23, 39.95], [25.27, 39.94], [25.30, 39.97], [25.36, 40.01], [25.42, 40.00], [25.45, 39.95], [25.43, 39.90], [25.37, 39.88], [25.35, 39.83], [25.31, 39.80], [25.30, 39.84], [25.29, 39.88], [25.27, 39.905], [25.24, 39.90], [25.22, 39.87], [25.23, 39.83], [25.20, 39.80], [25.14, 39.82], [25.08, 39.85]],
    imbros: [[25.66, 40.18], [25.75, 40.24], [25.90, 40.235], [26.01, 40.17], [25.95, 40.11], [25.80, 40.12], [25.70, 40.135]],
    thrace: [[24.0, 41.4], [24.0, 40.93], [25.3, 40.93], [25.9, 40.78], [26.3, 40.62], [26.75, 40.62], [26.75, 40.53], [26.55, 40.40], [26.35, 40.25], [26.2, 40.1], [26.17, 40.04], [26.25, 40.07], [26.38, 40.15], [26.5, 40.28], [26.67, 40.41], [26.95, 40.52], [28.0, 40.6], [28.0, 41.4]],
    troad: [[26.07, 39.47], [26.06, 39.6], [26.12, 39.8], [26.16, 39.97], [26.25, 40.03], [26.40, 40.13], [26.55, 40.26], [26.68, 40.34], [26.95, 40.40], [28.0, 40.40], [28.0, 39.0], [26.95, 39.0], [27.0, 39.58], [26.6, 39.55], [26.3, 39.48]],
  };
  SH.bt_aegean = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const [l0, b0, l1, b1] = P.bounds || [25.0, 39.45, 26.55, 40.66];
      const kc = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 120 : 180), ah = portrait ? 980 : H - 230;
      const s = Math.min(aw / ((l1 - l0) * kc), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * kc * s / 2, oy = (portrait ? 640 : (H - 90) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * kc * s, Y = lat => oy + (b1 - lat) * s;
      const poly = pts => 'M' + pts.map(p => f1(X(p[0])) + ' ' + f1(Y(p[1]))).join('L') + 'Z';
      let grat = '';
      for (let lon = 24; lon <= 27; lon += 0.5) grat += `M${f1(X(lon))} -10L${f1(X(lon))} ${H + 10}`;
      for (let lat = 39; lat <= 41; lat += 0.5) grat += `M-10 ${f1(Y(lat))}L${W + 10} ${f1(Y(lat))}`;
      L0(g, grat, C.inkSoft, 1.5, 0.16);
      const gl = BTL.glow(svg, defs, X(25.25), Y(39.91), 360, C.stain, 0.14, g);
      const D = BTL.drawing(g);
      for (const k of ['thrace', 'troad', 'imbros']) D.f(poly(AEG[k]), mix(C.paperLight, C.ink, 0.07), 1);
      D.f(poly(AEG.lemnos), mix(C.paperLight, C.ink, 0.2), 1);
      for (const k of ['thrace', 'troad', 'imbros']) D.s(poly(AEG[k]), { w: 2.5, color: C.inkSoft });
      D.s(poly(AEG.lemnos), { w: 4, color: C.ink });
      const bx = X(25.265), by = Y(39.865);
      const lead = L0(g, `M${f1(bx + 14)} ${f1(by)}L${f1(bx + 140)} ${f1(by)}`, C.gold, 2, 0.8); lead.setAttribute('pathLength', 1);
      const ring = el(g, 'circle', { cx: bx, cy: by, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 3 });
      const dot = el(g, 'circle', { cx: bx, cy: by, r: 10, fill: C.gold, 'fill-opacity': 0 });
      const halo = (e) => { e.setAttribute('stroke', C.paper); e.setAttribute('stroke-width', 10); e.setAttribute('stroke-linejoin', 'round'); e.setAttribute('paint-order', 'stroke'); return e; };
      const lab = halo(label(g, P.label || 'Mondros', bx + 152, by + 18, 58, { anchor: 'start' }));
      const sub = halo(label(g, P.sub || '30 Ekim 1918', bx + 152, by + 74, 44, { font: LO, italic: true, color: C.inkSoft, anchor: 'start' }));
      // the battleship at anchor in the bay
      const sy = by + 240, ship = smallShip(g, bx + 10, sy, 0.42);
      const shl = halo(label(g, P.ship || 'Agamemnon', bx + 10, sy + 62, 44, { font: LO, italic: true, color: C.ink }));
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.8));
          const at = cue(cues, 'm', dur * 0.4);
          const ph = ((lt - at) % 2.4 + 2.4) % 2.4 / 2.4, on = BTL.ease(lt, at - 0.3, 0.8);
          ring.setAttribute('r', f1(16 + 46 * ph)); ring.setAttribute('stroke-opacity', ((1 - ph) * 0.9 * on).toFixed(3));
          dot.setAttribute('fill-opacity', on.toFixed(3));
          fade(lab, on); fade(sub, BTL.ease(lt, at + 0.3, 1)); draw(lead, BTL.ease(lt, at - 0.3, 0.8));
          fade(ship, BTL.ease(lt, 0.6, 1.4)); fade(shl, BTL.ease(lt, 1.2, 1.2));
          ship.setAttribute('transform', `translate(${f1(bx + 10 + 5 * Math.sin(lt * 0.5))} ${f1(sy)}) scale(0.42)`);
          gl.set(0.12 + 0.06 * on + 0.02 * Math.sin(lt * 0.6));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_occupy: the shared bt_map + spreading zones
  // Same params as bt_map; each point also gets a large, slowly spreading zone and a held halo when its cue arrives.
  SH.bt_occupy = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg } = ctx;
      const base = SH.bt_map.build(Object.assign({}, ctx, { P: Object.assign({}, P, { points: (P.points || []).map(p => Object.assign({}, p, { label: '', sub: '' })) }) }));
      const [l0, b0, l1, b1] = P.bounds || [-2, 28, 40, 46];   // the same projection as bt_map
      const portrait = H > W, kc = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 120 : 180), ah = portrait ? 1000 : H - 230;
      const s = Math.min(aw / ((l1 - l0) * kc), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * kc * s / 2, oy = (portrait ? 640 : (H - 90) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * kc * s, Y = lat => oy + (b1 - lat) * s;
      const g = el(svg, 'g');
      const zones = (P.points || []).map((p, i) => ({ p, i, x: X(p.lon), y: Y(p.lat),
        fill: el(g, 'circle', { cx: X(p.lon), cy: Y(p.lat), r: 0, fill: C.gold, 'fill-opacity': 0 }),
        w1: el(g, 'circle', { cx: X(p.lon), cy: Y(p.lat), r: 0, fill: 'none', stroke: C.gold, 'stroke-width': 3 }),
        w2: el(g, 'circle', { cx: X(p.lon), cy: Y(p.lat), r: 0, fill: 'none', stroke: C.gold, 'stroke-width': 2 }) }));
      const halo = (e) => { e.setAttribute('stroke', C.paper); e.setAttribute('stroke-width', 10); e.setAttribute('stroke-linejoin', 'round'); e.setAttribute('paint-order', 'stroke'); return e; };
      const labs = zones.filter(z => z.p.label).map(z => {   // side: right (default) | left | above | below
        const sd = z.p.side || 'right', dx = sd === 'right' ? 34 : sd === 'left' ? -34 : 0, dy = sd === 'above' ? -34 : sd === 'below' ? 72 : 18;
        return { z, e: halo(label(g, z.p.label, z.x + dx, z.y + dy, 54, { anchor: sd === 'right' ? 'start' : sd === 'left' ? 'end' : 'middle' })) };
      });
      return {
        update(lt, dur, cues) {
          base.update(lt, dur, cues);
          for (const l of labs) fade(l.e, BTL.ease(lt, cue(cues, l.z.p.at, 0.6 + l.z.i * 0.8) - 0.2, 0.8));
          for (const z of zones) {
            const at = cue(cues, z.p.at, 0.6 + z.i * 0.8), on = BTL.ease(lt, at - 0.2, 1.2);
            z.fill.setAttribute('r', f1(70 * on)); z.fill.setAttribute('fill-opacity', (0.14 * on).toFixed(3));
            for (const [w, off] of [[z.w1, 0], [z.w2, 1.2]]) {
              const ph = (((lt - at - off) % 2.4) + 2.4) % 2.4 / 2.4, live = lt > at + off - 0.01 ? 1 : 0;
              w.setAttribute('r', f1(30 + 110 * ph)); w.setAttribute('stroke-opacity', ((1 - ph) * 0.7 * on * live).toFixed(3));
            }
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mosul: the leaning al-Hadba minaret at dusk
  SH.bt_mosul = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      const st = BTL.stars(g, 120, 57, [0, -200, 1920, 520]);
      const sky = BTL.glow(svg, defs, 1000, 520, 560, C.stain, 0.36, g);
      // the town: low flat roofs and a few domes
      let town = 'M300 780L300 712L380 712L380 690L470 690L470 720L560 720L560 676L640 676L640 704';
      town += 'A44 44 0 0 1 728 704L760 704L760 724L840 724L840 698L880 698';
      town += 'L1080 698L1080 716L1150 716L1150 684L1230 684L1230 708A40 40 0 0 1 1310 708L1340 708L1340 726L1440 726L1440 694L1540 694L1540 780Z';
      P0(g, town, C.paperDark, 1);
      L0(g, town.replace(/Z$/, ''), C.inkSoft, 2.5, 0.8);
      P0(g, 'M0 780L1920 780L1920 1800L0 1800Z', C.paperDark, 0.9);
      L0(g, 'M0 780L1920 780', C.inkSoft, 2, 0.6);
      // the Great Mosque's ribbed dome beside it
      P0(g, 'M1060 700A70 70 0 0 1 1200 700Z', C.paperDark, 1);
      L0(g, 'M1060 700A70 70 0 0 1 1200 700M1130 630L1130 606M1096 640L1104 700M1164 640L1156 700', C.inkSoft, 2.5, 0.8);
      // the al-Hadba minaret leans east: a square base, a slim tapering brick shaft, a balcony, a small dome + finial
      const lean = 0.12, sx = (x, y) => f1(x + (780 - y) * lean);
      const pt = (x, y) => `${sx(x, y)} ${y}`;
      const shaft = `M${pt(934, 690)}L${pt(942, 330)}L${pt(978, 330)}L${pt(986, 690)}Z`;
      const baseB = 'M904 780L904 690L1016 690L1016 780Z';
      const balc = `M${pt(926, 330)}L${pt(994, 330)}L${pt(986, 312)}L${pt(934, 312)}Z`;
      const top = `M${pt(946, 312)}L${pt(946, 282)}L${pt(974, 282)}L${pt(974, 312)}Z`;
      const dome = `M${pt(944, 282)}C${pt(946, 258)} ${pt(974, 258)} ${pt(976, 282)}Z`;
      const fin = `M${pt(960, 264)}L${pt(960, 236)}`;
      const D = BTL.drawing(g);
      for (const d of [baseB, shaft, balc, top, dome]) D.f(d, C.paperDark, 1);
      for (const d of [baseB, shaft, balc, top, dome, fin]) D.s(d, { w: 3, color: C.inkSoft });
      let dia = '';   // the brick lattice panels
      for (const y0 of [620, 520, 420]) for (let r = 0; r < 3; r++) { const y = y0 - r * 16; for (let x = 942; x < 978; x += 12) dia += `M${sx(x, y)} ${y}L${sx(x + 6, y - 8)} ${y - 8}L${sx(x + 12, y)} ${y}`; }
      D.s(dia, { w: 1.8, color: C.inkSoft, alpha: 0.7 });
      // lit windows in the town that go out
      const wr = rng(4), wins = [];
      for (let i = 0; i < 14; i++) { const x = 330 + wr() * 1180; if (x > 880 && x < 1040) continue; wins.push(el(g, 'rect', { x: f1(x), y: f1(735 + wr() * 25), width: 7, height: 10, fill: C.gold, 'fill-opacity': 0 })); }
      const lab = label(g, P.label || 'Musul', 960, 858, 38, {});
      const sub = label(g, P.sub || 'Kasım 1918', 960, 896, 30, { font: LO, italic: true, color: C.inkSoft });
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6));
          const th = cue(cues, 'm', dur * 0.5), out = BTL.ease(lt, th, 1.6);
          sky.set((0.36 - 0.26 * out) + 0.02 * Math.sin(lt * 0.6));
          wins.forEach((w, i) => w.setAttribute('fill-opacity', (0.75 * BTL.ease(lt, 0.3, 1) * (1 - BTL.ease(lt, th + i * 0.1, 0.8))).toFixed(3)));
          st.update(lt); st.g.setAttribute('opacity', (0.25 + 0.75 * out).toFixed(3));
          fade(lab, BTL.ease(lt, 0.3, 1)); fade(sub, BTL.ease(lt, 0.8, 1));
        },
      };
    },
  };
})();
