// bt_saltanat: the abolition of the Ottoman sultanate (1 November 1922) and the last sultan's departure on HMS Malaya
// (17 November 1922), belgesel style (docs/BELGESEL.md). Clean still line art, slow natural motion only (dust in a light
// beam, lamp light, self-writing lines, mist, water, a moving light). Every type is composed on a 1080x1920 vertical canvas
// (the Short); a wide frame shows the same canvas as a centred column.
//   bt_throne    P: {mode: "lit"|"fade"}  cues: hit   a dark hall, a tall pointed alcove, one empty Ottoman throne (low round-arched back,
//                small finial) on a
//                two-step dais under a beam of light, dust drifting in the beam. lit: on "hit" a gold line draws along
//                the empty cushion. fade: the beam and the light pool slowly go out over the scene
//   bt_date      P: {text: "1 Kasım 1922"}            the date in big thin type; below it a small empty throne on the
//                floor, its long shadow slowly stretching across the floor
//   bt_table     P: {mode: "invite"|"names"|"one", a: "İstanbul", b: "Ankara"}  cues: hit, a, b
//                a long peace table under a hanging lamp, two empty high-backed chairs behind it. invite: on "hit" two
//                sealed envelopes settle on the table, one before each chair. names: the same, then on "a"/"b" the
//                seal of that envelope lights and its label (a = left, b = right) fades in under it. one: both in place;
//                on "hit" the left chair, envelope and name sink into the dark, the right one stays in its own light
//   bt_assembly  P: {}  cues: hit                     night, the plain two-storey stone front of the first Grand National
//                Assembly building in Ankara (hipped roof, central bay with a small pediment, flagpole); its windows
//                light one by one; on "hit" the single window above the door glows gold
//   bt_decree    P: {}  cues: hit                     one sheet on a desk seen from above under lamp light, an inkwell
//                below it; the lines write themselves; on "hit" a round gold seal stamps the bottom of the page
//   bt_malaya    P: {mode: "pier"|"ship"}  cues: hit  a misty dawn shore of the Bosphorus.
//                pier: a long wooden jetty runs out into the mist; one faceless figure walks slowly to its end; far
//                out a grey battleship waits in the mist. ship: the grey Queen Elizabeth class battleship (HMS Malaya:
//                tripod foremast, two funnels, four twin turrets) fills the frame; a small launch with one figure
//                crosses towards it; on "hit" the ship's portholes and masthead light come on
//   bt_nightsea  P: {}  cues: hit                     a night sea under stars; one ship's light moves away towards the
//                horizon, its reflection trembling on the water; after "hit" it shrinks and goes out
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => v.toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1) => el(parent, 'path', { d, fill, 'fill-opacity': a, stroke: 'none' });
  const L0 = (parent, d, stroke, w = 3, a = 1) => el(parent, 'path', { d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));

  // every type draws on a 1080x1920 canvas; on a wide frame that canvas is shown as a centred column
  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }

  // ------------------------------------------------------------------ the throne (origin = floor centre, up = -y)
  // a wide Ottoman throne: ogee-crested high back, low scrolled arms, cushion, arcaded base, on a two-step dais
  const TH = {
    dais: 'M-360 0L-360-46L-326-58L326-58L360-46L360 0Z',
    step: 'M-296-58L-296-100L296-100L296-58Z',
    base: 'M-250-100L-250-208L250-208L250-100Z',
    cushion: 'M-244-208C-248-230-232-246-200-248L200-248C232-246 248-230 244-208Z',
    back: 'M-230-248L-230-430C-230-478-140-506 0-510C140-506 230-478 230-430L230-248Z',
    panel: 'M-190-268L-190-420C-190-458-116-480 0-484C116-480 190-458 190-420L190-268Z',
    crest: 'M-190-420C-190-458-116-480 0-484C116-480 190-458 190-420',
    rosette: BTL.E(0, -380, 46, 46) + BTL.E(0, -380, 22, 22),
    armL: 'M-292-208L-292-326C-292-354-264-366-240-356L-230-350L-230-208Z',
    armR: 'M292-208L292-326C292-354 264-366 240-356L230-350L230-208Z',
    bolsters: BTL.E(-172, -270, 42, 22) + BTL.E(172, -270, 42, 22),
    finial: 'M0-510L0-534' + BTL.E(0, -548, 14, 14),
    // the alem's crescent, horns up, sitting on the ball
    crescent: 'M-36-598A36 36 0 0 0 36-598A30 14 0 0 1-36-598Z',
  };
  TH.arcade = (() => { let d = ''; for (let i = -3; i <= 3; i++) { const x = i * 68; d += `M${x - 22} -100L${x - 22} -146Q${x} -178 ${x + 22} -146L${x + 22} -100`; } return d; })();
  TH.solid = TH.dais + TH.step + TH.base + TH.cushion + TH.back + TH.armL + TH.armR;

  function drawThrone(D) {
    D.f(TH.dais + TH.step, C.paperLight, 0.8);
    D.f(TH.back + TH.armL + TH.armR + TH.base, C.paperLight, 1);
    D.f(TH.panel, C.paper, 0.8);
    D.f(TH.cushion, C.paper, 1);
    D.f(TH.bolsters, C.paperLight, 1);
    D.s(TH.dais.replace(/Z$/, '') + TH.step, { w: 2.5, color: C.inkSoft });
    D.s(TH.base, { w: 3.5 });
    D.s(TH.arcade, { w: 2, color: C.inkSoft });
    D.s(TH.back, { w: 3.5 });
    D.s(TH.armL + TH.armR, { w: 3.5 });
    D.s(TH.panel, { w: 2, color: C.inkSoft });
    D.s(TH.cushion, { w: 3 });
    D.s(TH.bolsters, { w: 2.5, color: C.inkSoft });
    D.s(TH.crest, { w: 2.5, color: C.gold, alpha: 0.85 });
    D.s(TH.rosette, { w: 2, color: C.gold, alpha: 0.7 });
    D.f(TH.crescent, C.gold, 1);
    D.s(TH.finial, { w: 4, color: C.gold });
    D.s(TH.crescent, { w: 3, color: C.gold });
  }

  SH.bt_throne = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'lit', g = canvas(svg, W, H), FLOOR = 1090, cx = 540;
      // the hall: floor, a tall pointed alcove behind the throne, faint floor lines running to the alcove
      P0(g, `M-400 ${FLOOR}L1480 ${FLOOR}L1480 2000L-400 2000Z`, C.paperDark, 0.9);
      L0(g, `M-400 ${FLOOR}L1480 ${FLOOR}`, C.inkSoft, 2, 0.4);
      let fl = '';
      for (let i = -5; i <= 5; i++) fl += `M${cx + i * 60} ${FLOOR}L${cx + i * 330} 1920`;
      L0(g, fl, C.inkSoft, 1.5, 0.12);
      const s = 1.12, al = el(g, 'g', { transform: `translate(${cx} ${FLOOR}) scale(${s})` });
      L0(al, 'M-430 0L-430-690C-430-820-250-900 0-960C250-900 430-820 430-690L430 0', C.inkSoft, 2, 0.3);
      L0(al, 'M-470 0L-470-700C-470-840-270-930 0-1000C270-930 470-840 470-700L470 0', C.inkSoft, 1.5, 0.16);
      // the beam from above and the light pool on the throne
      const beam = P0(g, `M${cx - 80} -40L${cx + 80} -40L${cx + 470} ${FLOOR + 40}L${cx - 470} ${FLOOR + 40}Z`, C.stain, 0.07);
      const pool = BTL.glow(svg, defs, cx, FLOOR - 330, 640, C.stain, 0.3, g);
      const floorPool = el(g, 'path', { d: BTL.E(cx, FLOOR + 20, 520, 70), fill: C.stain, 'fill-opacity': 0.1 });
      // dust in the beam (behind the throne): slow rise, slow sway
      const r = rng(1922), dust = [];
      for (let i = 0; i < 34; i++) {
        const y0 = r() * 1100, w = 80 + (y0 / 1100) * 360;
        dust.push({ e: el(g, 'circle', { cx: 0, cy: 0, r: (1.4 + r() * 2.2).toFixed(1), fill: C.ink, 'fill-opacity': 0 }),
          x: cx + (r() * 2 - 1) * w * 0.8, y0, sp: 6 + r() * 10, ph: r() * TAU, a: 0.25 + r() * 0.4 });
      }
      const tg = el(g, 'g', { transform: `translate(${cx} ${FLOOR}) scale(${s})` });
      const D = BTL.drawing(tg);
      drawThrone(D);
      const seat = el(tg, 'path', { d: 'M-196-250L196-250', fill: 'none', stroke: C.gold, 'stroke-width': 5, 'stroke-linecap': 'round', pathLength: 1 });
      draw(seat, 0);
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6));
          const out = mode === 'fade' ? BTL.ease(lt, 0.6, Math.max(2, dur - 0.8)) : 0;
          const on = BTL.ease(lt, 0, 1.2) * (1 - 0.85 * out);
          pool.set((0.3 + 0.03 * Math.sin(lt * 0.6)) * on);
          beam.setAttribute('fill-opacity', (0.07 * on).toFixed(3));
          floorPool.setAttribute('fill-opacity', (0.1 * on).toFixed(3));
          for (const q of dust) {
            const y = ((q.y0 - q.sp * lt) % 1100 + 1100) % 1100, x = q.x + 14 * Math.sin(lt * 0.3 + q.ph);
            q.e.setAttribute('cx', f1(x)); q.e.setAttribute('cy', f1(y));
            q.e.setAttribute('fill-opacity', (q.a * on * Math.sin(Math.PI * y / 1100)).toFixed(3));
          }
          if (mode === 'lit') draw(seat, BTL.ease(lt, cue(cues, 'hit', dur * 0.6) - 0.45, 0.7));
          else draw(seat, 0);
          tg.setAttribute('opacity', (1 - 0.45 * out).toFixed(3));
        },
      };
    },
  };

  SH.bt_date = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), FLOOR = 950, cx = 540;
      const lamp = BTL.glow(svg, defs, 170, 520, 720, C.stain, 0.16, g);
      P0(g, `M-400 ${FLOOR}L1480 ${FLOOR}L1480 2000L-400 2000Z`, C.paperLight, 1);
      el(g, 'path', { d: BTL.E(cx, FLOOR + 90, 640, 120), fill: C.stain, 'fill-opacity': 0.12 });
      { let fl = ''; for (let i = -6; i <= 6; i++) fl += `M${cx + i * 70} ${FLOOR}L${cx + i * 300} 1900`;
        for (const y of [1010, 1090, 1190, 1320, 1490, 1700]) fl += `M-100 ${y}L1180 ${y}`;
        L0(g, fl, C.inkSoft, 1.5, 0.22); }
      L0(g, `M-400 ${FLOOR}L1480 ${FLOOR}`, C.inkSoft, 2, 0.5);
      // the throne's shadow on the floor (sheared silhouette), stretching slowly to the lower right
      const sh = P0(g, TH.solid, C.paperDark, 0.0);
      const t = txt(g, P.text || '1 Kasım 1922', cx, 350, 150, { weight: 300 });
      BTL.fit(t, 960);
      const rule = el(g, 'path', { d: `M${cx - 150} 420L${cx + 150} 420`, stroke: C.gold, 'stroke-width': 2.5, fill: 'none', pathLength: 1 });
      draw(rule, 0);
      const tg = el(g, 'g', { transform: `translate(${cx} ${FLOOR}) scale(0.62)` });
      const D = BTL.drawing(tg);
      drawThrone(D);
      return {
        update(lt) {
          lamp.set(0.16 + 0.02 * Math.sin(lt * 0.5));
          D.reveal(BTL.ease(lt, 0, 1.6));
          fade(t, BTL.ease(lt, 0.15, 1.2));
          t.setAttribute('transform', `translate(0 ${f1((1 - BTL.ease(lt, 0.15, 1.6)) * 14)})`);
          draw(rule, BTL.ease(lt, 0.7, 1.3));
          const c = -0.55 - 0.06 * lt;   // the light sinks: the shadow lengthens
          sh.setAttribute('transform', `matrix(0.62 0 ${(c * 0.62).toFixed(3)} ${(-0.36 * 0.62).toFixed(3)} ${cx} ${FLOOR})`);
          sh.setAttribute('fill-opacity', (0.95 * BTL.ease(lt, 0.1, 0.9)).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the peace table
  const ENV = { body: 'M-88-54L88-54L88 54L-88 54Z', flap: 'M-88-54L0 8L88-54', seal: BTL.E(0, 8, 14, 14) };
  SH.bt_table = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'invite', g = canvas(svg, W, H), cx = 540;
      L0(g, 'M540 -40L540 300', C.inkSoft, 2, 0.6);
      const lampG = BTL.glow(svg, defs, cx, 470, 640, C.stain, 0.26, g);
      P0(g, 'M-400 1150L1480 1150L1480 2000L-400 2000Z', C.paperDark, 0.9);
      L0(g, 'M-400 1150L1480 1150', C.inkSoft, 2, 0.35);
      { let fl = ''; for (let i = -7; i <= 7; i++) fl += `M${540 + i * 80} 1150L${540 + i * 260} 1900`;
        for (const y of [1220, 1320, 1460, 1650]) fl += `M-100 ${y}L1180 ${y}`;
        L0(g, fl, C.inkSoft, 1.5, 0.2); }
      const rug = el(g, 'path', { d: BTL.E(540, 1330, 600, 190), fill: C.stain, 'fill-opacity': 0.13 });
      P0(g, 'M70 1150L1010 1150L1180 1330L-100 1330Z', C.paper, 0.55);
      const D = BTL.drawing(g);
      // the hanging lamp
      D.f('M500 300L580 300L600 350L480 350Z', C.paperLight, 1);
      D.s('M500 300L580 300L600 350L480 350Z', { w: 2.5, color: C.inkSoft });
      const flame = el(g, 'path', { d: BTL.E(540, 368, 26, 14), fill: C.gold, 'fill-opacity': 0 });
      // two empty high-backed chairs behind the table
      const chair = x => `M${x - 105} 780L${x - 105} 520C${x - 105} 480 ${x - 60} 462 ${x} 456C${x + 60} 462 ${x + 105} 480 ${x + 105} 520L${x + 105} 780Z`;
      const chairIn = x => `M${x - 72} 760L${x - 72} 536C${x - 72} 510 ${x - 40} 496 ${x} 492C${x + 40} 496 ${x + 72} 510 ${x + 72} 536L${x + 72} 760`;
      const XA = 300, XB = 780;
      const chA = el(g, 'g'), chB = el(g, 'g');
      for (const [cg, x] of [[chA, XA], [chB, XB]]) { P0(cg, chair(x), C.paperLight, 1); L0(cg, chair(x), C.ink, 3.5, 1); L0(cg, chairIn(x), C.inkSoft, 2, 1); }
      const DT = BTL.drawing(g);
      // the table: top in slight perspective, apron, front legs
      const top = 'M140 760L940 760L1030 880L50 880Z', apron = 'M50 880L1030 880L1030 930L50 930Z';
      DT.f(top, C.paperLight, 1); DT.f(apron, C.paper, 1);
      DT.f('M84 930L112 930L108 1150L88 1150ZM968 930L996 930L992 1150L972 1150Z', C.paperLight, 1);
      DT.s(top, { w: 3.5 }); DT.s(apron, { w: 3 });
      DT.s('M84 930L88 1150M112 930L108 1150M968 930L972 1150M996 930L992 1150', { w: 3 });
      DT.s('M170 790L910 790', { w: 1.5, color: C.inkSoft, alpha: 0.5 });
      const spotB = BTL.glow(svg, defs, XB, 700, 330, C.stain, 0, g);
      // the two envelopes
      const envs = [XA, XB].map((x, i) => {
        const eg = el(g, 'g');
        P0(eg, ENV.body, C.paperLight, 1);
        L0(eg, ENV.body + ENV.flap, C.ink, 3, 1);
        const seal = P0(eg, ENV.seal, C.gold, 0.35);
        return { eg, seal, x, i };
      });
      const labs = mode !== 'invite' ? [txt(g, P.a || 'İstanbul', XA, 1030, 64, { font: LO, italic: true }), txt(g, P.b || 'Ankara', XB, 1030, 64, { font: LO, italic: true })] : [];
      return {
        update(lt, dur, cues) {
          D.reveal(mode === 'one' ? 1 : BTL.ease(lt, 0, 1.6)); DT.reveal(mode === 'one' ? 1 : BTL.ease(lt, 0, 1.6));
          const cr = mode === 'one' ? 1 : BTL.ease(lt, 0.1, 1.2);
          chB.setAttribute('opacity', cr.toFixed(3));
          // one: Istanbul's chair, envelope and name sink into the dark; Ankara's stay in a light of their own
          const dim = mode === 'one' ? BTL.ease(lt, cue(cues, 'hit', dur * 0.4) - 0.3, 1.8) : 0;
          chA.setAttribute('opacity', (cr * (1 - 0.82 * dim)).toFixed(3));
          spotB.set(0.45 * dim);
          lampG.e.setAttribute('cx', f1(540 + dim * 220));
          rug.setAttribute('fill-opacity', (0.13 * (1 - 0.5 * dim)).toFixed(3));
          lampG.set(0.26 + 0.03 * Math.sin(lt * 0.9) + 0.015 * Math.sin(lt * 2.3));
          flame.setAttribute('fill-opacity', (0.8 + 0.15 * Math.sin(lt * 1.7)).toFixed(3));
          const hit = cue(cues, 'hit', dur * 0.35);
          for (const q of envs) {
            let p, sealA;
            if (mode === 'one') {
              p = 1;
              const k = q.i ? 1 : 1 - 0.85 * dim;
              sealA = 0.95 * k;
              fade(labs[q.i], k);
              q.eg.setAttribute('opacity', k.toFixed(3));
            } else if (mode === 'names') {
              p = BTL.ease(lt, hit - 0.3 + q.i * 0.35, 1.4);
              const at = cue(cues, q.i ? 'b' : 'a', dur * (q.i ? 0.8 : 0.55));
              const lp = BTL.ease(lt, at - 0.2, 1);
              sealA = 0.35 * p + 0.6 * lp;
              fade(labs[q.i], lp);
            } else {
              p = BTL.ease(lt, hit - 0.3 + q.i * 0.35, 1.4);
              sealA = 0.35 * p;
            }
            const y = 815 - (1 - p) * 70 + 1.5 * Math.sin(lt * 0.5 + q.i);
            q.eg.setAttribute('transform', `translate(${q.x} ${f1(y)}) scale(1 0.62)`);
            if (mode !== 'one') q.eg.setAttribute('opacity', p.toFixed(3));
            q.seal.setAttribute('fill-opacity', (sealA * (0.9 + 0.1 * Math.sin(lt * 1.3 + q.i))).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the first assembly building, Ankara (night)
  SH.bt_assembly = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), GROUND = 1010;
      const st = BTL.stars(g, 120, 1920, [0, 0, 1080, 560]);
      const sky = BTL.glow(svg, defs, 540, 820, 700, C.stain, 0.16, g);
      P0(g, `M-400 ${GROUND}L1480 ${GROUND}L1480 2000L-400 2000Z`, C.paperDark, 0.95);
      // the forecourt: paving running towards us, a path of light from the door, two low walls with posts
      { let pv = ''; for (let i = -8; i <= 8; i++) pv += `M${540 + i * 70} ${GROUND + 40}L${540 + i * 230} 1900`;
        for (const y of [1090, 1160, 1260, 1400, 1590, 1820]) pv += `M-100 ${y}L1180 ${y}`;
        L0(g, pv, C.inkSoft, 1.5, 0.2); }
      const doorPool = el(g, 'path', { d: 'M500 1050L580 1050L760 1900L320 1900Z', fill: C.gold, 'fill-opacity': 0 });
      P0(g, 'M-40 1400L300 1400L300 1460L-40 1460ZM780 1400L1120 1400L1120 1460L780 1460Z', C.paperLight, 0.9);
      L0(g, 'M-40 1400L300 1400L300 1460M780 1460L780 1400L1120 1400', C.inkSoft, 2.5, 0.9);
      const D = BTL.drawing(g);
      const wingL = 'M90 690L430 690L430 1010L90 1010Z', wingR = 'M650 690L990 690L990 1010L650 1010Z';
      const bay = 'M430 650L650 650L650 1010L430 1010Z', roof = 'M66 690L150 612L930 612L1014 690Z', ped = 'M410 650L540 566L670 650Z';
      D.f(roof, C.paperDark, 1); D.f(wingL + wingR + bay, C.paperLight, 1); D.f(ped, C.paperLight, 1);
      D.s(roof, { w: 3, color: C.inkSoft });
      D.s(wingL + wingR, { w: 3 });
      D.s(bay + ped, { w: 3.5 });
      D.s('M90 836L990 836M90 986L990 986', { w: 1.5, color: C.inkSoft, alpha: 0.7 });
      D.s('M540 566L540 400', { w: 2.5, color: C.inkSoft });
      // steps and the arched door
      D.f('M500 1010L500 900C500 872 518 856 540 856C562 856 580 872 580 900L580 1010Z', C.paperDark, 1);
      D.s('M500 1010L500 900C500 872 518 856 540 856C562 856 580 872 580 900L580 1010', { w: 3 });
      D.s('M470 1010L610 1010M456 1026L624 1026M440 1042L640 1042', { w: 2, color: C.inkSoft, alpha: 0.8 });
      // windows: upper row square, lower row arched; lit one by one
      const xs = [140, 205, 270, 335, 395, 685, 745, 810, 875, 940], r = rng(23), wins = [];
      const winD = (x, y, wd, h, arch) => arch ? `M${x - wd / 2} ${y + h}L${x - wd / 2} ${y + wd / 2}A${wd / 2} ${wd / 2} 0 0 1 ${x + wd / 2} ${y + wd / 2}L${x + wd / 2} ${y + h}Z`
        : `M${x - wd / 2} ${y}L${x + wd / 2} ${y}L${x + wd / 2} ${y + h}L${x - wd / 2} ${y + h}Z`;
      for (const x of xs) for (const [y, arch] of [[724, false], [862, true]]) {
        const d = winD(x, y, 40, 78, arch);
        P0(g, d, C.paperDark, 1);
        wins.push({ e: P0(g, d, C.gold, 0), at: 0.4 + r() * 2.2, lit: r() < 0.62, ph: r() * TAU });
        L0(g, d, C.inkSoft, 2, 0.9);
      }
      // the window above the door: the one voice
      const mid = winD(540, 700, 58, 104, true);
      P0(g, mid, C.paperDark, 1);
      const midLit = P0(g, mid, C.gold, 0);
      L0(g, mid, C.ink, 2.5, 1);
      const midGlow = BTL.glow(svg, defs, 540, 752, 260, C.gold, 0, g);
      // the flag, slowly moving in the night air
      const flag = P0(g, '', C.paperLight, 1), flagS = L0(g, '', C.inkSoft, 2, 1);
      return {
        update(lt, dur, cues) {
          st.update(lt);
          sky.set(0.16 + 0.02 * Math.sin(lt * 0.4));
          D.reveal(BTL.ease(lt, 0, 1.8));
          for (const w of wins) w.e.setAttribute('fill-opacity', (w.lit ? BTL.ease(lt, w.at, 0.8) * (0.55 + 0.1 * Math.sin(lt * 0.6 + w.ph)) : 0).toFixed(3));
          const hit = BTL.ease(lt, cue(cues, 'hit', dur * 0.4) - 0.2, 1.2);
          midLit.setAttribute('fill-opacity', (0.12 + 0.83 * hit).toFixed(3));
          midGlow.set(0.55 * hit * (0.92 + 0.08 * Math.sin(lt * 1.1)));
          doorPool.setAttribute('fill-opacity', (0.05 + 0.07 * hit).toFixed(3));
          const fp = [];
          for (let i = 0; i <= 6; i++) { const u = i / 6, x = 540 + u * 118, y = 404 + 10 * u * Math.sin(lt * 1.1 - u * 4); fp.push([x, y]); }
          let d = 'M' + fp.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
          d += fp.slice().reverse().map(p => `L${f1(p[0])} ${f1(p[1] + 70)}`).join('') + 'Z';
          flag.setAttribute('d', d); flagS.setAttribute('d', d);
          fade(flag, BTL.ease(lt, 1.2, 1)); fade(flagS, BTL.ease(lt, 1.2, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the decision on a desk, seen from above
  SH.bt_decree = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H);
      const r = rng(1111);
      let grain = '';
      for (let i = 0; i < 26; i++) { const y = 80 + i * 70 + r() * 30; grain += `M-40 ${f1(y)}C300 ${f1(y + r() * 20 - 10)} 700 ${f1(y + r() * 20 - 10)} 1120 ${f1(y + r() * 16 - 8)}`; }
      L0(g, grain, C.inkSoft, 1.5, 0.16);
      // the desk's front edge and a closed inkwell in the lamp light below the page
      P0(g, 'M-100 1640L1180 1640L1180 2000L-100 2000Z', C.paperDark, 1);
      L0(g, 'M-100 1640L1180 1640M-100 1660L1180 1660', C.inkSoft, 2, 0.6);
      // a small square inkwell beside the page, seen from above (square glass, round lid)
      const ink = el(g, 'g', { transform: 'translate(955 1010) rotate(8)' });
      P0(ink, 'M-44-44L44-44L44 44L-44 44Z', C.paperLight, 1); L0(ink, 'M-44-44L44-44L44 44L-44 44Z', C.ink, 2.5, 1);
      P0(ink, BTL.E(0, 0, 24, 24), C.paper, 1); L0(ink, BTL.E(0, 0, 24, 24), C.inkSoft, 2.5, 1);
      const inkGl = el(ink, 'path', { d: 'M-36-30L-20-38', fill: 'none', stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-opacity': 0.4 });
      const lamp = BTL.glow(svg, defs, 540, 900, 900, C.stain, 0.24, g);
      const pg = el(g, 'g', { transform: 'rotate(-3 540 700)' });
      const D = BTL.drawing(pg);
      const sheet = 'M230 330L850 330L850 1060L230 1060Z';
      D.f(sheet, C.paperLight, 1);
      D.s(sheet, { w: 3 });
      // the lines of the text: header, then the body; written one after another
      const lines = [[440, 640, 420], [400, 680, 470]];
      for (let y = 560; y <= 900; y += 48) { const x1 = y === 900 ? 600 : 770 - r() * 70; lines.push([300, x1, y]); }
      const L = lines.map(([a, b, y]) => ({ e: el(pg, 'path', { d: `M${a} ${y}L${b} ${y}`, fill: 'none', stroke: C.inkSoft, 'stroke-width': 3.5, 'stroke-linecap': 'round', pathLength: 1 }), a, b, y }));
      for (const q of L) draw(q.e, 0);
      // the seal
      const sealG = el(pg, 'g', { transform: 'translate(712 975)' });
      const seal = [el(sealG, 'path', { d: BTL.E(0, 0, 62, 62), fill: C.gold, 'fill-opacity': 0, stroke: C.gold, 'stroke-width': 3, 'stroke-opacity': 0 }),
        el(sealG, 'path', { d: BTL.E(0, 0, 44, 44), fill: 'none', stroke: C.paperLight, 'stroke-width': 2.5, 'stroke-opacity': 0 })];
      return {
        update(lt, dur, cues) {
          lamp.set(0.24 + 0.025 * Math.sin(lt * 0.8));
          D.reveal(BTL.ease(lt, 0, 0.8));
          const hit = cue(cues, 'hit', dur * 0.55), t0 = 0.4, t1 = Math.max(t0 + 1, hit - 0.1), per = (t1 - t0) / L.length;
          L.forEach((q, i) => draw(q.e, clamp01((lt - t0 - i * per) / per)));
          inkGl.setAttribute('stroke-opacity', (0.3 + 0.15 * Math.sin(lt * 0.9)).toFixed(3));
          const s = BTL.ease(lt, hit - 0.15, 0.6);
          sealG.setAttribute('transform', `translate(712 975) scale(${(1.25 - 0.25 * s).toFixed(3)})`);
          seal[0].setAttribute('fill-opacity', (0.32 * s).toFixed(3));
          seal[0].setAttribute('stroke-opacity', s.toFixed(3));
          seal[1].setAttribute('stroke-opacity', (0.8 * s).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ HMS Malaya (Queen Elizabeth class), 1922
  // waterline y 0, bow to the right: raised forecastle, two twin turrets forward (B superfiring), bridge, tripod
  // foremast with spotting top, two funnels, mainmast, two twin turrets aft (X superfiring)
  const SHIP = {
    hull: 'M-440 0C-448-20-446-40-432-54L-120-56L-110-70L380-72L440-82L454 0Z',
    bridge: 'M106-72L110-132L206-132L204-72ZM126-132L132-164L190-164L186-132Z',
    fun1: 'M24-72L30-176L80-176L84-72Z',
    fun2: 'M-72-58L-68-160L-22-160L-18-58Z',
    turA: 'M300-72L306-100L366-100L372-72Z',
    turB: 'M226-72L226-104L300-104L300-72ZM230-104L236-130L292-130L298-104Z',
    turX: 'M-272-56L-272-88L-198-88L-196-56ZM-268-88L-262-114L-208-114L-202-88Z',
    turY: 'M-372-54L-366-82L-308-82L-302-54Z',
    guns: 'M366-90L430-93M366-82L428-84M296-122L362-126M296-114L360-116M-266-106L-340-110M-266-98L-338-100M-370-72L-428-75M-370-64L-426-66',
    tripod: 'M162-164L162-330M140-164L158-318M184-164L166-318M142-330L182-330L178-358L146-358Z',
    main: 'M-150-56L-150-246M-170-210L-130-210',
    rig: 'M162-330L452-80M-150-246L-438-50M162-300L-150-226',
  };
  SHIP.solid = SHIP.hull + SHIP.bridge + SHIP.fun1 + SHIP.fun2 + SHIP.turA + SHIP.turB + SHIP.turX + SHIP.turY;
  const PORTS = (() => { const out = []; for (let x = -400; x <= 420; x += 24) out.push(x); return out; })();
  const grey = () => mix(C.paperLight, C.inkSoft, 0.38);

  function shipDrawing(parent, o = {}) {
    const D = BTL.drawing(parent);
    D.f(SHIP.solid, grey(), 1);
    D.s(SHIP.hull, { w: 3, color: C.ink, alpha: 0.85 });
    D.s(SHIP.bridge + SHIP.fun1 + SHIP.fun2, { w: 2.5, color: C.ink, alpha: 0.8 });
    D.s(SHIP.turA + SHIP.turB + SHIP.turX + SHIP.turY, { w: 2.5, color: C.ink, alpha: 0.8 });
    D.s(SHIP.guns, { w: 4.5, color: C.ink, alpha: 0.8 });
    D.s(SHIP.tripod + SHIP.main, { w: 2.5, color: C.ink, alpha: 0.8 });
    D.s(SHIP.rig, { w: 1.2, color: C.inkSoft, alpha: 0.6 });
    D.s('M-430-40L440-48', { w: 1.5, color: C.inkSoft, alpha: 0.6 });
    return D;
  }

  // drifting mist bands (narrow, never a full-frame layer)
  function mist(g, n, seed, y0, y1) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', C.paperLight, 0), y: y0 + r() * (y1 - y0), w: 500 + r() * 600, h: 16 + r() * 22, x: r() * 1400 - 200, sp: 6 + r() * 10, a: 0.18 + r() * 0.16 });
    return { update(lt) { for (const m of list) { const x = ((m.x + m.sp * lt + 300) % 1700) - 300; m.e.setAttribute('d', BTL.E(x, m.y, m.w / 2, m.h)); m.e.setAttribute('fill-opacity', (m.a * BTL.ease(lt, 0, 1.2)).toFixed(3)); } } };
  }
  function water(g, y0, seed, x0 = 540) {
    const r = rng(seed), rip = [];
    for (let i = 0; i < 16; i++) {
      const y = y0 + 14 + i * i * 3.6 + i * 18, len = 50 + i * 26, x = x0 - 300 + r() * 600;
      rip.push({ e: L0(g, '', C.inkSoft, 2, 0.3 - i * 0.012), y, len, x, sp: 3 + (i % 4) * 2, ph: r() * TAU });
    }
    return { update(lt) { for (const q of rip) { const x = q.x + q.sp * lt + 14 * Math.sin(lt * 0.35 + q.ph); q.e.setAttribute('d', `M${f1(x - q.len / 2)} ${q.y}L${f1(x + q.len / 2)} ${q.y}`); } } };
  }

  SH.bt_malaya = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'pier', g = canvas(svg, W, H), HZ = mode === 'pier' ? 660 : 860;
      const sky = BTL.glow(svg, defs, mode === 'pier' ? 760 : 420, HZ - 40, 760, C.stain, 0.2, g);
      const st = BTL.stars(g, 40, 17, [0, 0, 1080, HZ - 260]);
      // the far Asian shore: low hills in the mist
      P0(g, `M-100 ${HZ}C120 ${HZ - 40} 260 ${HZ - 70} 420 ${HZ - 52}C560 ${HZ - 36} 700 ${HZ - 66} 880 ${HZ - 44}C980 ${HZ - 32} 1060 ${HZ - 20} 1180 ${HZ}Z`, C.paperLight, 0.45);
      P0(g, `M-100 ${HZ}L1180 ${HZ}L1180 2000L-100 2000Z`, C.paperDark, 0.9);
      L0(g, `M-100 ${HZ}L1180 ${HZ}`, C.inkSoft, 2, 0.4);
      const wv = water(g, HZ, mode === 'pier' ? 5 : 7, mode === 'pier' ? 760 : 540);
      const mBack = mist(g, 5, 11, HZ - 120, HZ + 10);
      // the ship
      const sx = mode === 'pier' ? 800 : 540, sy = HZ + (mode === 'pier' ? 6 : 40), ss = mode === 'pier' ? 0.5 : 1.08;
      const sg = el(g, 'g', { transform: `translate(${sx} ${sy}) scale(${ss})` });
      el(sg, 'path', { d: SHIP.solid, fill: C.paperLight, 'fill-opacity': 0.14, transform: 'scale(1 -0.55)' });
      const D = shipDrawing(sg);
      const ports = PORTS.map((x, i) => el(sg, 'circle', { cx: x, cy: x > -110 ? -40 : -30, r: 3.6, fill: C.gold, 'fill-opacity': 0, 'data-i': i }));
      const mastLight = el(sg, 'circle', { cx: 162, cy: -366, r: 6, fill: C.gold, 'fill-opacity': 0 });
      const smoke = [0, 1, 2].map(i => ({ e: L0(sg, '', C.inkSoft, 7, 0), x: i ? -45 : 55, ph: i * 0.37 }));
      let fig = null, pierG = null, boat = null, wake = null;
      if (mode === 'pier') {
        // the jetty runs from the lower left out into the water
        pierG = el(g, 'g');
        const DP = BTL.drawing(pierG);
        const deck = 'M-80 1160L300 1160L500 720L450 720Z';
        let posts = '';
        for (let i = 0; i <= 7; i++) { const u = i / 7, y = 1160 - u * 440, xl = -80 + u * 530, xr = 300 + u * 200, h = 60 - u * 44; posts += `M${f1(xl + 6)} ${f1(y)}L${f1(xl + 6)} ${f1(y + h)}M${f1(xr - 6)} ${f1(y)}L${f1(xr - 6)} ${f1(y + h)}`; }
        DP.s(posts, { w: 5, color: C.inkSoft });
        DP.f(deck, C.paperLight, 1);
        let planks = '';
        for (let i = 1; i < 18; i++) { const u = Math.pow(i / 18, 0.8), y = 1160 - u * 440, xl = -80 + u * 530, xr = 300 + u * 200; planks += `M${f1(xl)} ${f1(y)}L${f1(xr)} ${f1(y)}`; }
        DP.s(deck, { w: 3 });
        DP.s(planks, { w: 1.5, color: C.inkSoft, alpha: 0.6 });
        fig = el(g, 'g');
        pierG.D = DP;
      } else {
        // a small launch crossing towards the ship, one figure aboard
        wake = L0(g, '', C.inkSoft, 2, 0.5);
        boat = el(g, 'g');
        P0(boat, 'M-70 0L70 0L84-22L-80-22Z', C.paperLight, 1);
        L0(boat, 'M-70 0L70 0L84-22L-80-22Z', C.ink, 3, 1);
        BTL.person(boat, 'stand', 6, -22, 64, { face: 1, color: C.paperDark, rim: C.ink });
      }
      const mFront = mist(g, 4, 29, HZ + 20, HZ + (mode === 'pier' ? 240 : 140));
      return {
        update(lt, dur, cues) {
          st.update(lt); wv.update(lt); mBack.update(lt); mFront.update(lt);
          sky.set(0.2 + 0.03 * Math.sin(lt * 0.4));
          D.reveal(BTL.ease(lt, mode === 'pier' ? 0.3 : 0, 2));
          sg.setAttribute('transform', `translate(${f1(sx - 3 * lt)} ${sy}) scale(${ss})`);
          const on = mode === 'ship' ? BTL.ease(lt, cue(cues, 'hit', dur * 0.5) - 0.2, 1.4) : 0.6 * BTL.ease(lt, 0.8, 1.5);
          ports.forEach((p, i) => p.setAttribute('fill-opacity', (on * (i % 3 === 1 ? 0.3 : 0.85)).toFixed(3)));
          mastLight.setAttribute('fill-opacity', (on * (0.7 + 0.25 * Math.sin(lt * 1.2))).toFixed(3));
          for (const s of smoke) {
            const q = (lt * 0.1 + s.ph) % 1, x = s.x - q * 180, y = -180 - q * 60;
            s.e.setAttribute('d', `M${f1(x + 20)} ${f1(y + 8)}C${f1(x)} ${f1(y - 6)} ${f1(x - 30)} ${f1(y + 4)} ${f1(x - 70)} ${f1(y - 8)}`);
            s.e.setAttribute('stroke-opacity', (0.3 * Math.sin(q * Math.PI) * BTL.ease(lt, 1, 1)).toFixed(3));
          }
          if (mode === 'pier') {
            pierG.D.reveal(BTL.ease(lt, 0, 1.6));
            // the figure walks out along the jetty, slowly, to its end
            const u = 0.4 + 0.5 * BTL.ease(lt, 0.4, Math.max(2, dur - 0.4));
            const y = 1160 - u * 440, x = (-80 + u * 530 + 300 + u * 200) / 2, h = 330 * (1 - u * 0.75);
            fig.innerHTML = '';
            BTL.person(fig, 'stand', x, y - 4, h, { face: 1, color: C.paperDark, rim: C.ink });
            fade(fig, BTL.ease(lt, 0.3, 1));
          } else {
            const u = BTL.ease(lt, 0, dur + 1.5) * 0.85, x = 170 + u * 240, y = 1080 - u * 130, k = 1.4 - u * 0.5;
            boat.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${k.toFixed(3)})`);
            wake.setAttribute('d', `M${f1(x - 80 * k)} ${f1(y + 2)}L${f1(x - 230 * k)} ${f1(y + 50 * k)}M${f1(x - 80 * k)} ${f1(y + 2)}L${f1(x - 260 * k)} ${f1(y - 6 * k)}`);
            fade(boat, BTL.ease(lt, 0.2, 1)); fade(wake, BTL.ease(lt, 0.6, 1));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the night sea, one light going away
  SH.bt_nightsea = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), HZ = 820;
      const st = BTL.stars(g, 230, 1117, [0, 0, 1080, HZ - 20]);
      const sky = BTL.glow(svg, defs, 540, HZ, 640, C.stain, 0.12, g);
      P0(g, `M-100 ${HZ}L1180 ${HZ}L1180 2000L-100 2000Z`, C.paperDark, 0.92);
      L0(g, `M-100 ${HZ}L1180 ${HZ}`, C.inkSoft, 2, 0.45);
      const wv = water(g, HZ, 3);
      const D = BTL.drawing(g);
      D.s(`M-100 ${HZ}L1180 ${HZ}`, { w: 2, color: C.inkSoft, alpha: 0.3 });
      const sg = el(g, 'g');
      P0(sg, SHIP.solid, C.paperDark, 1);
      L0(sg, SHIP.solid + SHIP.tripod, C.inkSoft, 6, 0.8);
      const lg = BTL.glow(svg, defs, 0, 0, 160, C.gold, 0.6, g);
      const refl = L0(g, '', C.gold, 3, 0.4);
      const dot = el(g, 'circle', { cx: 0, cy: 0, r: 6, fill: C.ink });
      return {
        update(lt, dur, cues) {
          st.update(lt); wv.update(lt);
          sky.set(0.12 + 0.02 * Math.sin(lt * 0.4));
          D.reveal(BTL.ease(lt, 0, 1));
          const u = clamp01(lt / (dur + 1)), x = 520 + u * 150, y = HZ + 60 - u * 54, k = 1 - u * 0.7;
          const hit = cue(cues, 'hit', dur * 0.45), out = BTL.ease(lt, hit + 0.2, Math.max(1.5, dur - hit - 0.6));
          const a = BTL.ease(lt, 0, 0.8) * (1 - 0.95 * out);
          sg.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${(0.12 * k).toFixed(3)})`);
          fade(sg, BTL.ease(lt, 0, 0.8) * (1 - 0.9 * out));
          lg.e.setAttribute('cx', f1(x + 20 * k)); lg.e.setAttribute('cy', f1(y - 40 * k));
          lg.e.setAttribute('r', f1(60 + 160 * k));
          lg.set(0.7 * a);
          dot.setAttribute('cx', f1(x + 20 * k)); dot.setAttribute('cy', f1(y - 40 * k)); dot.setAttribute('r', f1(2 + 5 * k));
          dot.setAttribute('fill-opacity', a.toFixed(3));
          let d = '';
          for (let i = 0; i < 9; i++) { const yy = y + 12 + i * (14 + 30 * k), w = (6 + i * 4) * k + 4 * Math.sin(lt * 1.3 + i * 1.7); d += `M${f1(x + 20 * k - w)} ${f1(yy)}L${f1(x + 20 * k + w)} ${f1(yy)}`; }
          refl.setAttribute('d', d); refl.setAttribute('stroke-opacity', (0.45 * a).toFixed(3));
        },
      };
    },
  };
})();
