// bt_inebahti: the Battle of Lepanto (İnebahtı, 7 October 1571), belgesel style (docs/BELGESEL.md). Still line art in
// the theme's tokens; the only motion is slow and natural (waves, drifting smoke, a waving banner, slow oars, a slow
// advance of two fleets drawn from above). Places are drawn on the 1920x1080 stage. Shared kit for bt_inebahti_b.js:
// window.IBK (P0, L0, label, ital, fade, sea, smoke, galley, galleass, bgFill).
//   bt_ib_sea      P: {mode: "smoke"|"debris"|"turban"|"horizon"}  cues: hit
//                  smoke: wide sea after the battle, distant burning galleys, smoke columns (thicker on hit)
//                  debris: close sea surface, floating broken oars and turbans bobbing (one oar turns gold on hit)
//                  turban: a single turban afloat in a pool of light, slow ripples
//                  banner: a broken pole and the crescent banner fallen into the sea, half sunk (sinks a little on hit)
//                  horizon: dusk sea, a low sun; on hit galley silhouettes appear one by one on the horizon
//   bt_ib_galley   P: {mode: "flag"|"lower"|"prow"|"empty", label}  cues: hit
//                  flag: the stern of the flagship close up, a great banner waving; lower: the banner slides down on hit
//                  prow: a galley side on, a lone standing figure at the bow (+ label); empty: the bare pole at dusk
//   bt_ib_galleass P: {mode: "profile"|"compare"|"fire", labels}  cues: hit
//                  profile: the Venetian galleass draws itself; compare: a galley beside it, both labelled;
//                  fire: its broadside fires on hit, smoke puffs roll out and drift
//   bt_ib_arcs     cues: a, b   from above: a galley with a narrow forward firing arc (a), a galleass with arcs all round (b)
//   bt_ib_order    P: {mode: "meet"|"galleass"|"broken"|"escape"}  cues: hit   the two fleets from above at the mouth
//                  of the gulf (north coast at the top, Peloponnese at the bottom); League in ink (west), Ottoman in gold (east)
//   bt_ib_ram      P: {mode: "ram"|"board"}  cues: hit   two flagships bow to bow; board: figures cross between the decks
//   bt_ib_gulf     P: {}  cues: hit   a quiet map of the Gulf of Patras: İnebahtı inside the narrows, the enemy at the mouth
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
  const ital = (g, s, x, y, size = 46, o = {}) => label(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft, weight: 400 }, o));
  const bgFill = (g, col = C.paper) => P0(g, 'M-600-600L2520-600L2520 2400L-600 2400Z', col, 1);
  const place = (parent, x, y, s = 1, flip = false) => el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${flip ? -s : s} ${s})` });

  // ------------------------------------------------------------------ sea surface from y0 down
  function sea(g, y0, seed, o = {}) {
    P0(g, `M-600 ${y0}L2520 ${y0}L2520 2400L-600 2400Z`, C.paperDark, 1);
    L0(g, `M-600 ${y0}L2520 ${y0}`, C.inkSoft, 2, 0.5);
    const r = rng(seed), rows = [], n = o.n || 12;
    for (let i = 0; i < n; i++) {
      const y = y0 + 16 + Math.pow(i / n, 1.4) * (o.depth || 520), segs = [];
      for (let j = 0; j < 9; j++) segs.push({ x: r() * 2400 - 240, w: 30 + r() * 90 * (1 + i * 0.08), ph: r() * TAU });
      rows.push({ y, segs, sp: (o.sp || 6) * (0.6 + i * 0.12), e: L0(g, '', C.inkSoft, 1.6 + i * 0.08, 0.3) });
    }
    return { update(lt) { for (const q of rows) { let d = ''; for (const s of q.segs) { const x = ((s.x + lt * q.sp) % 2400 + 2400) % 2400 - 240, y = q.y + 2 * Math.sin(lt * 0.7 + s.ph);
      d += `M${f1(x)} ${f1(y)}c${f1(s.w * 0.3)} -4 ${f1(s.w * 0.7)} -4 ${f1(s.w)} 0`; } q.e.setAttribute('d', d); } } };
  }
  // a slow smoke column: puffs rise from (x, y), grow and fade; strength 0..1 set per frame
  let sid = 0;
  function smoke(g, x, y, seed, o = {}) {
    const r = rng(seed), n = (o.n || 9) + 4, list = [], id = 'ibsm' + (++sid) + '_' + seed;
    const rg = el(el(g, 'defs'), 'radialGradient', { id });
    el(rg, 'stop', { offset: '0', 'stop-color': o.color || C.inkSoft, 'stop-opacity': 1 });
    el(rg, 'stop', { offset: '0.55', 'stop-color': o.color || C.inkSoft, 'stop-opacity': 0.45 });
    el(rg, 'stop', { offset: '1', 'stop-color': o.color || C.inkSoft, 'stop-opacity': 0 });
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', `url(#${id})`, 0), ph: i / n, dx: (r() - 0.5) * 60, s: 0.8 + r() * 0.7 });
    const H = o.h || 420, R = o.r || 60, sp = o.sp || 0.05, lean = o.lean ?? 120;
    return {
      update(lt, k = 1) {
        for (const q of list) {
          const p = (lt * sp + q.ph) % 1, cx = x + q.dx + lean * p * p, cy = y - p * H, rr = R * q.s * (0.4 + p * 1.2);
          q.e.setAttribute('d', BTL.E(cx, cy, rr * 1.5, rr * 1.1));
          q.e.setAttribute('fill-opacity', (Math.max(0, (o.a || 0.22) * 1.6 * k * Math.sin(Math.PI * p))).toFixed(3));
        }
      },
    };
  }

  // ------------------------------------------------------------------ the galley, side on, bow (ram) to the right
  // origin = waterline centre; ~1300 long (stern -580 .. ram tip +720), deck at -60, mast top at -560
  const G_HULL = 'M-585-118L-520-108L-470-66L520-58L585-66L600-52L720-40L600-34L585-20C430 16-360 20-520 4C-560-6-585-60-585-118Z';
  function galley(D, o = {}) {
    D.f(G_HULL, C.paperLight, 1);
    D.f('M-470-66L520-58L520-44L-470-52Z', C.paper, 0.9);       // outrigger frame (apostis)
    D.s(G_HULL, { w: 3.5 });
    D.s('M-470-58L540-50M-520-26C-200-12 200-12 560-30', { w: 2, color: C.inkSoft });
    // stern: raised poop with an arched awning and lanterns
    D.f('M-585-118L-585-150L-470-150L-470-66L-520-108Z', C.paper, 1);
    D.s('M-585-118L-585-150L-470-150L-470-70M-580-150C-560-230-490-230-472-150', { w: 3 });
    D.s('M-560-150L-560-205M-500-150L-500-205', { w: 2, color: C.inkSoft });
    if (o.lantern !== false) { D.f(BTL.E(-585, -250, 12, 18), C.gold, 0.9); D.s('M-585-232L-585-200M-597-268L-573-268', { w: 2.5 }); }
    // bow: forecastle platform (rambade) and the spur
    D.f('M470-58L470-96L580-96L585-66Z', C.paper, 1);
    D.s('M470-60L470-96L580-96L585-66', { w: 3 });
    if (o.rig !== false) {
      D.s('M40-58L40-560', { w: 4 });                                // main mast
      D.s('M-300-260L460-600', { w: 3.5 });                          // lateen yard
      if (o.sail) {
        const sail = 'M-290-262L455-596C430-470 300-300 40-140C-80-180-200-220-290-262Z';
        D.f(sail, C.paperLight, 0.9); D.s(sail, { w: 3 });
      } else D.s('M-280-268C-40-380 200-480 440-592', { w: 8, color: C.inkSoft });   // furled
      D.s('M40-560L-585-150M40-560L600-60M40-560L-40-62M40-560L120-60', { w: 1.4, color: C.inkSoft, alpha: 0.7 });
    }
  }
  // the oars: a fan of long strokes from the outrigger into the water; they sweep slowly (k = stroke strength)
  function oars(g, o = {}) {
    const n = o.n || 24, x0 = o.x0 ?? -430, x1 = o.x1 ?? 470, list = [];
    for (let i = 0; i < n; i++) list.push(L0(g, '', C.ink, o.w || 3, 0.85));
    return {
      update(lt, k = 1, broken = 0) {
        list.forEach((e, i) => {
          const x = lerp(x0, x1, i / (n - 1)), a = 0.5 + (k ? 0.22 * Math.sin(lt * 0.9 * k + i * 0.05) : 0);
          const len = broken && i % 3 === 1 ? 70 : 150;
          e.setAttribute('d', `M${f1(x)} -52L${f1(x - Math.sin(a) * len * 0.55)} ${f1(-52 + Math.cos(a) * len)}`);
        });
      },
    };
  }
  // the Venetian galleass: a heavier, higher hull, a round gun castle at the bow, gun ports along the side, 3 masts
  const GS_HULL = 'M-640-210L-560-200L-520-150L520-150C580-150 640-170 680-200L700-180C690-120 660-60 610-30C420 20-400 24-560 4C-610-20-640-100-640-210Z';
  function galleass(D, o = {}) {
    D.f(GS_HULL, C.paperLight, 1);
    D.f('M-520-150L520-150L540-110L-520-110Z', C.paper, 1);
    D.s(GS_HULL, { w: 4 });
    D.s('M-520-110L560-110M-560-40C-200-20 200-20 600-40', { w: 2, color: C.inkSoft });
    // bow castle (round) and stern castle
    D.f('M500-150L500-240C560-262 640-250 680-200L680-150Z', C.paper, 1);
    D.s('M500-150L500-240C560-262 640-250 680-200', { w: 3.5 });
    D.f('M-640-210L-640-280L-500-280L-500-150L-560-200Z', C.paper, 1);
    D.s('M-640-210L-640-280L-500-280L-500-152', { w: 3.5 });
    // gun ports along the side and in the bow castle
    let ports = '';
    for (let x = -460; x <= 440; x += 75) ports += `M${x} -98h26v20h-26Z`;
    ports += 'M530-215h26v20h-26ZM590-222h26v20h-26ZM-610-250h26v20h-26ZM-560-250h26v20h-26Z';
    D.f(ports, C.paperDark, 1); D.s(ports, { w: 2 });
    // oars below the ports
    let od = '';
    for (let x = -420; x <= 420; x += 48) od += `M${x} -60L${x - 60} 60`;
    D.s(od, { w: 2.5, color: C.inkSoft });
    if (o.rig !== false) {
      D.s('M-300-150L-300-560M60-150L60-700M420-150L420-520', { w: 4 });
      D.s('M-560-360L-60-640M-240-360L400-780M240-340L620-560', { w: 3 });
      D.s('M-540-370C-400-450-200-560-80-630M-220-370C-20-500 200-650 380-770M260-350C380-420 500-490 600-550', { w: 7, color: C.inkSoft });
    }
  }
  // gun muzzle points in galleass coordinates (side ports + bow)
  const GS_GUNS = []; for (let x = -460; x <= 440; x += 75) GS_GUNS.push([x + 13, -88]);

  // a turban seen from above-side: wrapped cloth (folds) round a small cap
  function turban(D, s = 1) {
    const S = v => f1(v * s);
    // one round, bulbous wrapped turban: a full silhouette, curved wrap lines across it (alternately slanted),
    // a small dome of the cap (kavuk) showing on top, the cloth's loose end tucked at the side
    const cap = `M${S(-46)} ${S(-118)}C${S(-50)} ${S(-160)} ${S(-26)} ${S(-176)} 0 ${S(-176)}C${S(26)} ${S(-176)} ${S(50)} ${S(-160)} ${S(46)} ${S(-118)}Z`;
    const bulb = `M${S(-150)} ${S(10)}C${S(-176)} ${S(-60)} ${S(-120)} ${S(-130)} 0 ${S(-132)}C${S(120)} ${S(-130)} ${S(176)} ${S(-60)} ${S(150)} ${S(10)}C${S(130)} ${S(50)} ${S(-130)} ${S(50)} ${S(-150)} ${S(10)}Z`;
    D.f(cap, C.paperLight, 1); D.s(cap, { w: 3 });
    D.f(bulb, C.paperLight, 1); D.s(bulb, { w: 3.5 });
    let wraps = '';
    const ys = [-96, -60, -24, 12];
    ys.forEach((y, k) => { const t = k % 2 ? 22 : -22, hw = 146 - Math.abs(y + 40) * 0.5;
      wraps += `M${S(-hw)} ${S(y - t)}C${S(-hw * 0.4)} ${S(y + 26 - t * 0.3)} ${S(hw * 0.4)} ${S(y + 26 + t * 0.3)} ${S(hw)} ${S(y + t)}`; });
    D.s(wraps, { w: 2.6, color: C.ink });
    D.s(`M${S(140)} ${S(-20)}C${S(176)} ${S(0)} ${S(180)} ${S(40)} ${S(160)} ${S(64)}`, { w: 3 });
  }
  const OAR = (len, s = 1) => `M${-len / 2} -5L${len / 2 - 120 * s} -5L${len / 2 - 20 * s} -18L${len / 2} -14L${len / 2} 14L${len / 2 - 20 * s} 18L${len / 2 - 120 * s} 5L${-len / 2} 5Z`;

  window.IBK = { P0, L0, label, ital, fade, sea, smoke, galley, galleass, oars, turban, OAR, bgFill, place, f1 };

  // ------------------------------------------------------------------ bt_ib_sea
  SH.bt_ib_sea = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'smoke', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      bgFill(g);
      const R = [];
      if (mode === 'smoke' || mode === 'horizon') {
        const HY = mode === 'smoke' ? 600 : 640;
        BTL.glow(svg, defs, mode === 'horizon' ? 1180 : 960, HY - 60, 700, C.stain, 0.16, g);
        let sun = null;
        if (mode === 'horizon') { sun = P0(g, BTL.E(1180, HY, 70, 70), C.gold, 0.5); P0(g, `M1080 ${HY}L1280 ${HY}L1280 ${HY + 80}L1080 ${HY + 80}Z`, C.paperDark, 1); }
        const s = sea(g, HY, 11, { n: 13, depth: 520 });
        R.push(lt => s.update(lt));
        if (mode === 'smoke') {
          // distant wrecks: low galley silhouettes, some listing, smoke rising from three
          const wrecks = [[420, 0.42, -6], [760, 0.3, 4], [1240, 0.38, -10], [1580, 0.32, 8], [1030, 0.22, 0]];
          for (const [x, k, rot] of wrecks) {
            const wg = el(g, 'g', { transform: `translate(${x} ${HY + 4}) rotate(${rot}) scale(${k})` });
            const D = BTL.drawing(wg); galley(D, { lantern: false, rig: rot === 0 }); D.reveal(1);
            wg.setAttribute('opacity', 0.75);
          }
          const sm = [smoke(g, 420, HY - 20, 3, { h: 520, r: 70, a: 0.26 }), smoke(g, 1240, HY - 10, 5, { h: 560, r: 80, a: 0.26, lean: 160 }), smoke(g, 1580, HY - 10, 7, { h: 420, r: 60, a: 0.2 })];
          const glows = [420, 1240, 1580].map(x => P0(g, BTL.E(x, HY - 6, 46, 14), C.gold, 0));
          // foreground: a broken oar drifting
          const og = el(g, 'g'); P0(og, OAR(520), C.paperLight, 0.9); L0(og, OAR(520), C.ink, 2.5, 0.9);
          R.push((lt, dur, cues) => {
            const k = 0.6 + 0.4 * BTL.ease(lt, cue(cues, 'hit', 1.5), 2);
            sm.forEach(q => q.update(lt, k)); glows.forEach((e, i) => e.setAttribute('fill-opacity', f1((0.35 + 0.15 * Math.sin(lt * 0.8 + i)) * k)));
            og.setAttribute('transform', `translate(${f1(700 + lt * 8)} ${f1(860 + 4 * Math.sin(lt * 0.7))}) rotate(${f1(-8 + 2 * Math.sin(lt * 0.5))})`);
          });
        } else {
          const ships = [];
          for (let i = 0; i < 7; i++) {
            const wg = el(g, 'g', { opacity: 0 }), D = BTL.drawing(wg); galley(D, { lantern: false, sail: true }); D.reveal(1);
            ships.push({ wg, x: 200 + i * 250, k: 0.24 + (i % 3) * 0.03 });
          }
          R.push((lt, dur, cues) => {
            const at = cue(cues, 'hit', dur * 0.4);
            ships.forEach((q, i) => { fade(q.wg, BTL.ease(lt, at - 1.2 + i * 0.35, 1.4) * 0.85); q.wg.setAttribute('transform', `translate(${f1(q.x + lt * 6)} ${HY + 2}) scale(${q.k})`); });
            sun.setAttribute('d', BTL.E(1180, HY + lt * 1.2, 70, 70));
          });
        }
      } else {
        // close sea surface seen from a low angle: horizon high, debris afloat
        const HY = 250;
        BTL.glow(svg, defs, 960, 560, 640, C.stain, 0.2, g);
        const s = sea(g, HY, 17, { n: 16, depth: 760, sp: 4 });
        R.push(lt => s.update(lt));
        const items = [];
        const add = (kind, x, y, sc, rot, ph) => {
          const ig = el(g, 'g'), D = BTL.drawing(ig);
          if (kind === 'oar') { D.f(OAR(560 * sc, sc), C.paperLight, 1); D.s(OAR(560 * sc, sc), { w: 3 }); }
          else if (kind === 'plank') { D.f(`M-${110 * sc} -12L${110 * sc} -16L${116 * sc} 12L-${104 * sc} 16Z`, C.paperLight, 0.9); D.s(`M-${110 * sc} -12L${110 * sc} -16L${116 * sc} 12L-${104 * sc} 16Z`, { w: 2.5, color: C.inkSoft }); }
          else turban(D, sc);
          D.reveal(1);
          const ring = L0(g, '', C.inkSoft, 2, 0);
          items.push({ ig, x, y, rot, ph, ring, sc, kind, D });
        };
        if (mode === 'banner') {
          // a broken pole and the crescent banner fallen into the sea, half sunk
          const mast = el(g, 'g');
          L0(mast, 'M-560 -560L240 260', C.ink, 9); L0(mast, 'M-560 -560L-590 -600M-560 -560L-530 -606M-560 -560L-600 -570', C.ink, 4);
          L0(mast, 'M-300 -294L-120 -330M-300 -294L-260 -250', C.inkSoft, 3);
          const bg = el(g, 'g'), D = BTL.drawing(bg);
          D.s('M-520 -60L60 40', { w: 7 }); D.s('M60 40L90 30M60 40L84 58', { w: 4 });
          const cloth = 'M-500 -50C-380 -110 -200 -80 -60 -150C80 -200 220 -140 330 -170C300 -60 220 20 120 60C0 100 -200 40 -360 60Z';
          D.f(cloth, C.paperLight, 1); D.s(cloth, { w: 3.5 });
          const cr = 'M-150 -40A70 70 0 1 0 -40 -120A54 54 0 1 1 -150 -40Z';
          D.f(cr, C.gold, 0.9); D.s(cr, { w: 2.5, color: C.gold });
          D.reveal(1);
          const water = P0(g, '', C.paperDark, 0.82), wl = L0(g, '', C.inkSoft, 2.5, 0.8);
          const rings = [0, 1, 2].map(() => L0(g, '', C.inkSoft, 2, 0));
          R.push((lt, dur, cues) => {
            const hit = cue(cues, 'hit', dur * 0.3), sink = 30 * BTL.ease(lt, hit, 3) + lt * 2;
            bg.setAttribute('transform', `translate(960 ${f1(600 + sink)}) rotate(-6) scale(1.05)`);
            mast.setAttribute('transform', `translate(1180 ${f1(560 + sink * 0.8)})`); fade(mast, BTL.ease(lt, 0, 1.6));
            fade(bg, BTL.ease(lt, 0, 1.6));
            // the surface cuts across the cloth: everything below y≈610 sits under a dark translucent water band
            let d = 'M-100 2000L-100 ', w = '';
            for (let x = -100; x <= 2020; x += 40) { const y = 610 + 8 * Math.sin(x * 0.012 + lt * 0.9) + 4 * Math.sin(x * 0.031 - lt * 0.6); d += `${x} ${f1(y)}L`; w += (x === -100 ? 'M' : 'L') + `${x} ${f1(y)}`; }
            water.setAttribute('d', d + '2020 2000Z'); wl.setAttribute('d', w);
            rings.forEach((e, i) => { const p = ((lt * 0.22 + i / 3) % 1), rx = 520 + p * 700; e.setAttribute('d', BTL.E(960, 620, rx, rx * 0.12)); e.setAttribute('stroke-opacity', f1(0.45 * (1 - p))); });
          });
        } else if (mode === 'turban') {
          add('turban', 960, 560, 1.7, -4, 0);
          add('oar', 1460, 760, 0.7, 14, 2);
        } else {
          add('oar', 520, 470, 0.9, -12, 0); add('turban', 960, 580, 0.8, 4, 1.4); add('oar', 1400, 640, 1.1, 18, 2.3);
          add('plank', 1520, 400, 1.2, -6, 3.1); add('turban', 420, 760, 0.7, -8, 4.2); add('oar', 1100, 820, 0.8, -4, 5.0);
          add('turban', 1600, 860, 0.6, 10, 0.7);
        }
        const gold = mode === 'debris' ? items[2] : null;
        let goldE = null;
        if (gold) goldE = L0(gold.ig, OAR(560 * gold.sc, gold.sc), C.gold, 4, 0);
        R.push((lt, dur, cues) => {
          items.forEach(q => {
            const bob = 5 * Math.sin(lt * 0.8 + q.ph), x = q.x + 6 * Math.sin(lt * 0.25 + q.ph);
            q.ig.setAttribute('transform', `translate(${f1(x)} ${f1(q.y + bob)}) rotate(${f1(q.rot + 1.5 * Math.sin(lt * 0.5 + q.ph))})`);
            const p = ((lt * 0.28 + q.ph * 0.1) % 1), rx = (q.kind === 'turban' ? 140 : 200) * q.sc * (1 + p * 1.6);
            q.ring.setAttribute('d', BTL.E(x, q.y + 40 * q.sc, rx, rx * 0.2)); q.ring.setAttribute('stroke-opacity', f1(0.5 * (1 - p)));
          });
          if (goldE) goldE.setAttribute('stroke-opacity', f1(BTL.ease(lt, cue(cues, 'hit', dur * 0.5), 1.2)));
          if (mode === 'turban') items[0].D.reveal(BTL.ease(lt, 0, 2.2));
        });
      }
      return { update(lt, dur, cues) { R.forEach(f => f(lt, dur, cues)); } };
    },
  };

  // ------------------------------------------------------------------ bt_ib_galley
  SH.bt_ib_galley = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'flag', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      bgFill(g);
      const R = [];
      if (mode === 'prow') {
        const HY = 700;
        BTL.glow(svg, defs, 1300, 460, 560, C.stain, 0.2, g);
        const s = sea(g, HY, 23, { n: 10, depth: 380 }); R.push(lt => s.update(lt));
        const sg = el(g, 'g', { transform: `translate(820 ${HY}) scale(0.95)` });
        const D = BTL.drawing(sg); galley(D, { sail: false }); const oa = oars(sg, { n: 22 });
        const fig = BTL.person(sg, 'stand', 530, -96, 210, { face: 1 });
        const lab = P.label ? ital(g, P.label, 1320, 300, 54, { color: C.ink }) : null;
        R.push((lt, dur, cues) => { D.reveal(BTL.ease(lt, 0, 2.2)); oa.update(lt, 0.6); fade(fig, BTL.ease(lt, 0.8, 1.4)); if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', 1.6) - 0.2, 1)); sg.setAttribute('transform', `translate(${f1(820 + lt * 5)} ${HY}) scale(0.95)`); });
      } else {
        // the stern of the flagship, large: the banner flies from a tall pole on the poop
        const HY = 820;
        BTL.glow(svg, defs, 900, 380, 640, C.stain, mode === 'empty' ? 0.14 : 0.2, g);
        let sun = null;
        if (mode === 'empty') sun = P0(g, BTL.E(1500, HY - 30, 80, 80), C.gold, 0.4);
        const s = sea(g, HY, 29, { n: 8, depth: 260 }); R.push(lt => s.update(lt));
        const sm = mode === 'empty' ? null : [smoke(g, 1500, HY - 30, 13, { h: 640, r: 110, a: 0.18, lean: -200 }), smoke(g, 280, HY - 20, 19, { h: 520, r: 90, a: 0.15, lean: 120 })];
        const GX = 1380, GK = 1.05;
        const sg = el(g, 'g', { transform: `translate(${GX} ${HY}) scale(${GK})` });
        const D = BTL.drawing(sg); galley(D, { lantern: true, rig: false }); D.reveal(1);
        const oa = oars(sg, { n: 20, x0: -430, x1: 300 });
        // pole on the poop
        const px = GX - 530 * GK, py0 = HY - 150 * GK, pyT = 170;
        L0(g, `M${f1(px)} ${f1(py0)}L${f1(px)} ${f1(pyT)}`, C.ink, 5);
        P0(g, BTL.E(px, pyT - 8, 10, 10), C.gold, 1);
        const flag = P0(g, '', C.paperLight, 1), rim = L0(g, '', C.ink, 3), mark = L0(g, '', C.gold, 3.5);
        const fw = 440, fh = 250;
        R.push((lt, dur, cues) => {
          oa.update(lt, 0);
          if (sm) sm.forEach(q => q.update(lt, 1));
          if (sun) sun.setAttribute('d', BTL.E(1500, HY - 30 + lt * 1.5, 80, 80));
          let drop = 0, vis = 1;
          if (mode === 'lower') drop = BTL.ease(lt, cue(cues, 'hit', dur * 0.35), 3.2);
          if (mode === 'empty') vis = 0;
          const top = pyT + 10 + drop * 90;
          // banner flies to the right (wind from the left), slow wave; when lowered (half-mast) it hangs limp along the pole
          const amp = 22 * (1 - drop * 0.85), pts = [], hh = fh * (1 - 0.3 * drop);
          for (let i = 0; i <= 10; i++) { const u = i / 10, x = px + u * fw * (1 - drop * 0.8), w = amp * u * Math.sin(lt * 1.2 - u * 4); pts.push([x, top + w + drop * u * fw * 0.75, top + hh + w + drop * u * fw * 0.45]); }
          const d = 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'L' + pts.slice().reverse().map(p => f1(p[0]) + ' ' + f1(p[2])).join('L') + 'Z';
          flag.setAttribute('d', d); rim.setAttribute('d', d);
          // a crescent on the banner, near the hoist
          const c = pts[3], cy = (c[1] + c[2]) / 2;
          mark.setAttribute('d', `M${f1(c[0] + 18)} ${f1(cy - 56)}A60 60 0 1 0 ${f1(c[0] + 18)} ${f1(cy + 56)}A46 46 0 1 1 ${f1(c[0] + 18)} ${f1(cy - 56)}`);
          for (const e of [flag, rim, mark]) fade(e, vis);
        });
      }
      return { update(lt, dur, cues) { R.forEach(f => f(lt, dur, cues)); } };
    },
  };

  // ------------------------------------------------------------------ bt_ib_galleass
  SH.bt_ib_galleass = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'profile', HY = 760, { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      bgFill(g);
      BTL.glow(svg, defs, 960, 480, 700, C.stain, 0.18, g);
      const s = sea(g, HY, 31, { n: 9, depth: 320 });
      const gx = mode === 'compare' ? 1160 : 960, k = mode === 'compare' ? 0.82 : 1;
      const sg = el(g, 'g', { transform: `translate(${gx} ${HY}) scale(${k})` });
      const D = BTL.drawing(sg); galleass(D);
      let D2 = null, gl = null, l1 = null, l2 = null;
      if (mode === 'compare') {
        gl = el(g, 'g', { transform: `translate(330 ${HY}) scale(0.4)` });
        D2 = BTL.drawing(gl); galley(D2, { lantern: false });
        l1 = ital(g, (P.labels && P.labels[0]) || 'kadırga', 330, HY + 130, 50, { color: C.ink });
        l2 = ital(g, (P.labels && P.labels[1]) || 'galeas', 1160, HY + 130, 50, { color: C.gold });
      }
      // gun flashes and smoke
      const puffs = [], flashes = [];
      if (mode === 'fire') {
        GS_GUNS.forEach(([x, y], i) => {
          const sx = gx + x * k, sy = HY + y * k;
          flashes.push(P0(g, BTL.E(sx, sy + 30, 30, 14), C.gold, 0));
          puffs.push({ sm: smoke(g, sx, sy + 40, 41 + i, { n: 4, h: 260, r: 70, a: 0.3, sp: 0.08, lean: 60 }), i });
        });
      }
      return {
        update(lt, dur, cues) {
          s.update(lt);
          D.reveal(mode === 'profile' ? BTL.ease(lt, 0, 3) : 1);
          if (D2) { D2.reveal(1); fade(l1, BTL.ease(lt, 0.6, 1)); fade(l2, BTL.ease(lt, cue(cues, 'hit', 1.6) - 0.2, 1)); }
          sg.setAttribute('transform', `translate(${f1(gx + lt * 4)} ${f1(HY + 3 * Math.sin(lt * 0.6))}) scale(${k})`);
          if (mode === 'fire') {
            const at = cue(cues, 'hit', dur * 0.3);
            flashes.forEach((e, i) => { const t0 = Math.max(0.3, at - 0.3) + i * 0.05; e.setAttribute('fill-opacity', f1(lt > t0 ? 0.9 * Math.exp(-(lt - t0) * 2.2) : 0)); });
            puffs.forEach(q => { const t0 = Math.max(0.3, at - 0.3) + q.i * 0.05; q.sm.update(Math.max(0, lt - t0) + 0.01, lt > t0 ? 1 : 0); });
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_arcs (from above)
  function topGalley(g, x, y, len, o = {}) {
    const wg = el(g, 'g', { transform: `translate(${x} ${y})` }), w = o.wide ? len * 0.16 : len * 0.1;
    const hull = `M${-len / 2} ${-w / 2}L${len / 2 - 40} ${-w / 2}C${len / 2} ${-w / 2} ${len / 2 + 10} 0 ${len / 2 + (o.wide ? 10 : 80)} 0C${len / 2 + 10} 0 ${len / 2} ${w / 2} ${len / 2 - 40} ${w / 2}L${-len / 2} ${w / 2}Z`;
    let od = '';
    for (let i = 0; i < 14; i++) { const xx = -len / 2 + 60 + i * (len - 160) / 13; od += `M${f1(xx)} ${f1(-w / 2)}l-16 -50M${f1(xx)} ${f1(w / 2)}l-16 50`; }
    L0(wg, od, C.inkSoft, 2.5, 0.8);
    P0(wg, hull, C.paperLight, 1); L0(wg, hull, C.ink, 3.5);
    return wg;
  }
  const wedge = (x, y, r, a0, a1) => { const p = a => [x + Math.cos(a) * r, y + Math.sin(a) * r]; const [ax, ay] = p(a0), [bx, by] = p(a1);
    return `M${x} ${y}L${f1(ax)} ${f1(ay)}A${r} ${r} 0 0 1 ${f1(bx)} ${f1(by)}Z`; };
  SH.bt_ib_arcs = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g');
      BTL.glow(svg, defs, 960, 480, 760, C.stain, 0.12, g);
      const A = { x: 520, y: 470 }, B = { x: 1380, y: 470 };
      const wa = P0(g, wedge(A.x + 150, A.y, 330, -0.28, 0.28), C.gold, 0.0);
      const wb = [];
      for (const [a0, a1] of [[-0.3, 0.3], [-1.9, -1.2], [1.2, 1.9], [2.9, 3.4], [-1.2, -0.6], [0.6, 1.2]]) wb.push(P0(g, wedge(B.x, B.y, 330, a0, a1), C.gold, 0));
      const ga = topGalley(g, A.x, A.y, 300), gb = topGalley(g, B.x, B.y, 360, { wide: true });
      const la = ital(g, 'kadırga', A.x, 800, 52, { color: C.ink }), lb = ital(g, 'galeas', B.x, 800, 52, { color: C.ink });
      return {
        update(lt, dur, cues) {
          const a = cue(cues, 'a', 1.2), b = cue(cues, 'b', dur * 0.55);
          fade(ga, BTL.ease(lt, 0, 1)); fade(gb, BTL.ease(lt, 0.4, 1)); fade(la, BTL.ease(lt, 0.4, 1)); fade(lb, BTL.ease(lt, 0.8, 1));
          wa.setAttribute('fill-opacity', f1(0.35 * BTL.ease(lt, a - 0.2, 1.2) * (0.85 + 0.15 * Math.sin(lt * 1.4))));
          wb.forEach((e, i) => e.setAttribute('fill-opacity', f1(0.3 * BTL.ease(lt, b - 0.5 + i * 0.05, 0.8) * (0.85 + 0.15 * Math.sin(lt * 1.4 + i)))));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_order: the two fleets from above
  // coasts: the north shore (Aetolia) along the top, the Peloponnese along the bottom
  const NORTH = 'M-100-100L2020-100L2020 150C1880 170 1820 230 1700 240C1560 250 1500 200 1380 210C1260 220 1200 160 1060 150C920 140 860 120 720 130C560 140 480 100 340 110C220 118 120 90-100 100Z';
  const SOUTH = 'M-100 1200L2020 1200L2020 900C1880 880 1820 840 1700 850C1560 862 1480 900 1360 890C1220 880 1180 940 1040 950C900 960 820 1000 680 1000C520 1000 420 1040 260 1030C120 1022 40 1050-100 1040Z';
  SH.bt_ib_order = {
    kind: '2d',
    build({ P, W, H, svg, defs, seed }) {
      const mode = P.mode || 'meet', g = el(svg, 'g');
      bgFill(g);
      P0(g, NORTH, C.paperLight, 0.9); L0(g, NORTH, C.inkSoft, 2.5);
      P0(g, SOUTH, C.paperLight, 0.9); L0(g, SOUTH, C.inkSoft, 2.5);
      // the Curzolari islets off the north shore
      for (const [x, y, r] of [[300, 210, 22], [380, 236, 14], [250, 250, 12]]) { P0(g, BTL.E(x, y, r * 1.6, r), C.paperLight, 0.9); L0(g, BTL.E(x, y, r * 1.6, r), C.inkSoft, 2); }
      BTL.glow(svg, defs, 960, 540, 720, C.stain, 0.1, g);
      const r = rng(77);
      // each fleet: left wing (north), centre, right wing (south) as rows of small top-view galleys
      const mk = (side) => {
        const list = [], dir = side === 'L' ? 1 : -1, xb = side === 'L' ? 520 : 1400;
        const wings = [[250, 400], [440, 660], [700, 860]];   // y ranges north..south
        wings.forEach(([y0, y1], wi) => {
          const n = wi === 1 ? 11 : 8;
          for (let i = 0; i < n; i++) {
            const y = lerp(y0, y1, i / (n - 1)), x = xb + (side === 'L' ? 0 : (wi === 0 ? -40 : wi === 2 ? 40 : 0)) + (i % 2) * 46 * dir;
            const e = P0(g, '', side === 'L' ? C.ink : C.gold, 0.95);
            list.push({ e, x, y, wi, dir, jx: (r() - 0.5) * 120, jy: (r() - 0.5) * 60, ph: r() * TAU });
          }
        });
        return list;
      };
      const L = mk('L'), O = mk('O');
      const boat = (x, y, dir, s = 1.3) => `M${f1(x - 18 * dir * s)} ${f1(y - 4 * s)}L${f1(x + 12 * dir * s)} ${f1(y - 4 * s)}L${f1(x + 22 * dir * s)} ${f1(y)}L${f1(x + 12 * dir * s)} ${f1(y + 4 * s)}L${f1(x - 18 * dir * s)} ${f1(y + 4 * s)}Z`;
      // the six galleasses ahead of the League line, two per division
      const GS = [[660, 290], [660, 370], [670, 500], [670, 610], [660, 740], [660, 820]].map(([x, y]) => ({ x, y, e: P0(g, '', C.ink, 1), ring: L0(g, '', C.ink, 2, 0) }));
      const puffs = GS.map((q, i) => smoke(g, q.x + 30, q.y, 90 + i, { n: 4, h: 90, r: 26, a: 0.28, sp: 0.12, lean: 40, color: C.inkSoft }));
      const ll = ital(g, 'Kutsal İttifak', 420, 560, 44, { color: C.ink, anchor: 'end' });
      const lo = ital(g, 'Osmanlı', 1520, 560, 44, { color: C.gold, anchor: 'start' });
      const route = L0(g, 'M1440 760C1560 820 1700 860 1860 830', C.gold, 3, 1, { pathLength: 1, 'stroke-dasharray': '1 1' });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.4);
          fade(ll, BTL.ease(lt, 0.3, 1)); fade(lo, BTL.ease(lt, 0.6, 1));
          // advance: meet = slow closing; broken = the Ottoman line passes the galleasses and loses its order
          const adv = mode === 'meet' ? 40 * BTL.ease(lt, 0, dur) : mode === 'galleass' ? 120 : mode === 'broken' ? 140 + 160 * BTL.ease(lt, 0, dur) : 330;
          const mess = mode === 'broken' ? BTL.ease(lt, hit, 2.5) : mode === 'escape' ? 1 : 0;
          L.forEach(q => { const x = q.x + (mode === 'meet' ? adv * 0.6 : mode === 'escape' ? 260 : 110); q.e.setAttribute('d', boat(x, q.y, 1)); fade(q.e, BTL.ease(lt, 0.1 + q.y / 2000, 1)); });
          O.forEach((q, i) => {
            let x = q.x - adv + q.jx * mess, y = q.y + q.jy * mess;
            if (mode === 'escape' && q.wi === 2 && i % 8 < 6) {     // Uluç Ali's wing slips away to the south-east
              const p = BTL.ease(lt, hit + (i % 8) * 0.08, 3.2);
              x = lerp(x, 1640 + (i % 8) * 40, p); y = lerp(y, 800 + (i % 3) * 26, p);
            }
            q.e.setAttribute('d', boat(x, y, -1)); fade(q.e, BTL.ease(lt, 0.2 + q.y / 2000, 1) * (mode === 'escape' && q.wi === 1 ? 0.35 : 1));
          });
          GS.forEach((q, i) => {
            const x = q.x + (mode === 'meet' ? adv * 0.6 : mode === 'escape' ? 260 : 110);
            q.e.setAttribute('d', boat(x, q.y, 1, 2.6)); fade(q.e, mode === 'meet' ? 0.8 : 1);
            const ph = ((lt - hit) % 2.4 + 2.4) % 2.4 / 2.4;
            q.ring.setAttribute('d', BTL.E(x, q.y, 30 + 40 * ph, 30 + 40 * ph)); q.ring.setAttribute('stroke-opacity', f1(mode === 'galleass' && lt > hit - 0.2 ? (1 - ph) * 0.8 : 0));
            if (mode === 'broken') puffs[i].update(lt, BTL.ease(lt, hit - 0.5, 1)); else puffs[i].update(lt, 0);
          });
          route.setAttribute('stroke-dashoffset', f1(1 - (mode === 'escape' ? BTL.ease(lt, hit + 0.6, 2.4) : 0)));
          fade(route, mode === 'escape' ? 1 : 0);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_ram: two flagships bow to bow
  SH.bt_ib_ram = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const SK = 0.68, mode = P.mode || 'ram', HY = 760, { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      bgFill(g);
      const glow = BTL.glow(svg, defs, 960, 560, 560, C.stain, 0.18, g);
      const sm = [smoke(g, 960, HY - 120, 51, { h: 600, r: 120, a: 0.2, lean: 80 }), smoke(g, 700, HY - 80, 53, { h: 460, r: 90, a: 0.14, lean: -60 })];
      const s = sea(g, HY, 37, { n: 8, depth: 280 });
      const A = el(g, 'g'), B = el(g, 'g');
      const DA = BTL.drawing(A); galley(DA, { lantern: true }); DA.reveal(1);
      const DB = BTL.drawing(B); galley(DB, { lantern: true }); DB.reveal(1);
      const oa = oars(A, { n: 18 }), ob = oars(B, { n: 18 });
      const spark = P0(g, BTL.E(960, HY - 40, 34, 16), C.gold, 0);
      const la = ital(g, 'Real', 480, 880, 48, { color: C.ink }), lb = ital(g, 'Sultana', 1440, 880, 48, { color: C.gold });
      const figs = [];
      if (mode === 'board') for (let i = 0; i < 7; i++) figs.push({ e: BTL.person(g, 'stand', 0, 0, 110, { face: 1 }), i });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.35);
          const close = mode === 'ram' ? BTL.ease(lt, 0, hit + 0.2) : 1;
          const xa = 960 - 700 * SK - 220 * (1 - close), xb = 960 + 700 * SK + 220 * (1 - close);
          A.setAttribute('transform', `translate(${f1(xa)} ${f1(HY + 3 * Math.sin(lt * 0.6))}) scale(${SK})`);
          B.setAttribute('transform', `translate(${f1(xb)} ${f1(HY + 3 * Math.sin(lt * 0.6 + 1))}) scale(${-SK} ${SK})`);
          s.update(lt); oa.update(lt, mode === 'ram' ? 0.7 : 0); ob.update(lt, mode === 'ram' ? 0.7 : 0);
          const k = mode === 'ram' ? BTL.ease(lt, hit, 1.5) : 1;
          sm.forEach(q => q.update(lt, 0.4 + 0.6 * k));
          spark.setAttribute('fill-opacity', f1(mode === 'ram' ? 0.7 * Math.exp(-Math.max(0, lt - hit) * 0.8) * (lt > hit ? 1 : 0) : 0.25));
          fade(la, BTL.ease(lt, 0.6, 1)); fade(lb, BTL.ease(lt, 0.9, 1));
          // board: figures walk across from Real's deck towards Sultana, then fall back after "hit"
          figs.forEach(q => {
            const p = BTL.ease(lt, 0.4 + q.i * 0.25, 3.5), back = BTL.ease(lt, hit + q.i * 0.1, 3);
            const x = 600 + q.i * 44 + 440 * p - 400 * back, y = HY - 60 * SK - 6;
            q.e.setAttribute('transform', `translate(${f1(x)} ${f1(y)})`);
          });
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ib_gulf: map of the Gulf of Patras
  SH.bt_ib_gulf = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g');
      bgFill(g);
      // north shore with the narrows at x≈1380; gulf of Corinth continues to the right
      const N = 'M-100-100L2020-100L2020 400C1900 410 1760 420 1640 430C1540 440 1460 450 1400 492C1340 452 1280 380 1180 360C1060 336 960 300 860 290C740 280 640 250 540 250C420 250 330 200 220 210C120 220 40 200-100 210Z';
      const S = 'M-100 1200L2020 1200L2020 560C1900 556 1760 560 1640 552C1540 546 1460 540 1400 512C1330 560 1260 640 1160 700C1060 760 960 800 820 800C700 800 600 840 480 860C360 880 240 900-100 900Z';
      BTL.glow(svg, defs, 900, 560, 760, C.stain, 0.12, g);
      P0(g, N, C.paperLight, 0.9); const cn = L0(g, N, C.inkSoft, 2.5, 1, { pathLength: 1 });
      P0(g, S, C.paperLight, 0.9); const cs = L0(g, S, C.inkSoft, 2.5, 1, { pathLength: 1 });
      for (const [x, y, rr] of [[260, 300, 26], [340, 330, 16], [200, 340, 14]]) { P0(g, BTL.E(x, y, rr * 1.6, rr), C.paperLight, 0.9); L0(g, BTL.E(x, y, rr * 1.6, rr), C.inkSoft, 2); }
      const pin = (x, y, t, sub, anchor) => {
        const pg = el(g, 'g', { opacity: 0 });
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 2.5 });
        el(pg, 'circle', { cx: x, cy: y, r: 9, fill: C.gold });
        const ax = anchor === 'end' ? x - 34 : x + 34;
        const a = svgText(pg, t, ax, y + 16, 54, { fill: C.ink, 'font-family': FR, 'font-weight': 400, 'text-anchor': anchor || 'start' });
        if (sub) svgText(pg, sub, ax, y + 68, 40, { fill: C.inkSoft, 'font-family': LO, 'font-style': 'italic', 'text-anchor': anchor || 'start' });
        return { pg, ring };
      };
      const inb = pin(1520, 430, 'İnebahtı', 'liman', 'start');
      const pat = ital(g, 'Mora', 1000, 900, 44);
      // the enemy: a row of small dark marks arriving at the mouth from the west
      const marks = [];
      for (let i = 0; i < 18; i++) marks.push({ e: P0(g, '', C.ink, 0.95), y: 420 + i * 18 + (i % 2) * 6, x: 260 + (i % 3) * 14 });
      const lab = ital(g, 'Kutsal İttifak', 360, 790, 44, { color: C.ink });
      return {
        update(lt, dur, cues) {
          draw(cn, BTL.ease(lt, 0, 1.6)); draw(cs, BTL.ease(lt, 0.2, 1.6));
          fade(inb.pg, BTL.ease(lt, 0.8, 1)); fade(pat, BTL.ease(lt, 1, 1));
          const ph = ((lt - 0.8) % 2.6 + 2.6) % 2.6 / 2.6; inb.ring.setAttribute('r', f1(14 + 26 * ph)); inb.ring.setAttribute('stroke-opacity', f1((1 - ph) * 0.8));
          const hit = cue(cues, 'hit', dur * 0.5), p = BTL.ease(lt, hit - 1, 3);
          marks.forEach((q, i) => { const x = q.x - 200 + 300 * p; q.e.setAttribute('d', `M${f1(x - 16)} ${q.y - 4}L${f1(x + 12)} ${q.y - 4}L${f1(x + 22)} ${q.y}L${f1(x + 12)} ${q.y + 4}L${f1(x - 16)} ${q.y + 4}Z`); fade(q.e, BTL.ease(lt, hit - 1 + i * 0.03, 1)); });
          fade(lab, BTL.ease(lt, hit, 1));
        },
      };
    },
  };
})();
