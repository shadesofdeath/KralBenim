// bt_troya_b: Troy, part two (docs/BELGESEL.md; drawings shared with bt_troya.js through window.TROYA). Slow natural
// motion only: drifting sea lines, breathing flames and smoke, slow searchlights, a closing lid, light pools.
//   bt_tr_scroll  P: {mode: "read"|"fade", label}  cues: hit   an open papyrus scroll with Greek capitals (the
//                 Iliad's first line); read: the lines write in. fade: the lines fade on hit, a "?" label stays
//   bt_tr_paper   P: {mode: "permit"|"court", label, sub}  cues: hit   one folded document with a wax seal in a light
//                 pool. permit: a ruled half (the share) lights gold on hit. court: the seal cracks on hit
//   bt_tr_crate   P: {mode: "crate"|"ship", label}  cues: hit   crate: a wooden crate by a lantern, gold inside, the
//                 lid closes on hit. ship: a small sailing steamer drifting slowly over a calm sea at dusk
//   bt_tr_tower   P: {mode: "war"|"open", label}  cues: hit   Berlin's Zoo flak tower: a huge concrete block with
//                 corner turrets, two slow searchlights, smoke. open: the door lights on hit, a crate leaves
//   bt_tr_walls   P: {mode: "wall"|"fire"|"reuse"|"agora", label, sub}  cues: hit   the sloping stone wall of Troy VI
//                 with its offsets, a tower and a gate. fire: slow flames and smoke along the top. reuse: small houses
//                 lean on the wall one by one on hit. agora: a paved square and a road to the south gate on hit
//   bt_tr_plan    P: {label, sub}  cues: hit, b   plan: the citadel ring on top, the lower town outline (hit) and
//                 the dashed ditch drawing round it (b)
//   bt_tr_tablet  P: {label}  cues: hit   a Hittite clay tablet of cuneiform; one line lights gold on hit + label
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const drawP = (e, p) => { e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', '1 1'); e.setAttribute('stroke-dashoffset', f1(1 - clamp01(p))); };
  const T = () => window.TROYA;
  const lab2 = (g, P, x, y, an = 'middle') => {
    const a = P.label ? T().txt(g, P.label, x, y, 52, { font: FR, italic: false, anchor: an }) : null;
    const b = P.sub ? T().txt(g, P.sub, x, y + 64, 48, { color: mix(C.ink, C.inkSoft, 0.35), anchor: an }) : null;
    return lt => { fade(a, BTL.ease(lt, 1, 1.2)); fade(b, BTL.ease(lt, 1.6, 1.2)); };
  };
  // three nested flames whose heights breathe smoothly
  function flame(g, x, y, s, ph) {
    const a = P0(g, '', C.stain, 0.6), b = P0(g, '', C.gold, 0.8), c = P0(g, '', C.paperLight, 0.9);
    const sh = (h, w) => `M${f1(x - w)} ${f1(y)}C${f1(x - w)} ${f1(y - h * 0.5)} ${f1(x - w * 0.2)} ${f1(y - h * 0.7)} ${f1(x)} ${f1(y - h)}C${f1(x + w * 0.2)} ${f1(y - h * 0.7)} ${f1(x + w)} ${f1(y - h * 0.5)} ${f1(x + w)} ${f1(y)}Z`;
    return { update(lt, on = 1) {
      const k = on * (1 + 0.12 * Math.sin(lt * 1.3 + ph) + 0.06 * Math.sin(lt * 2.3 + ph * 2));
      a.setAttribute('d', sh(110 * s * k, 34 * s)); b.setAttribute('d', sh(74 * s * k, 22 * s)); c.setAttribute('d', sh(36 * s * k, 10 * s));
      for (const e of [a, b, c]) fade(e, on);
    } };
  }
  function puffs(g, seed, n, o) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', C.inkSoft, 0), ph: i / n, rx: o.size * (0.7 + r() * 0.6), x0: o.x0 + (r() - 0.5) * o.spread });
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.06)) % 1, s = 0.5 + 1.3 * u;
      q.e.setAttribute('d', BTL.E(q.x0 + o.dx * u, o.y0 + o.dy * u, q.rx * s, q.rx * s * 0.7));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.16) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ bt_tr_scroll
  SH.bt_tr_scroll = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'read', { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.1 });
      const pool = BTL.glow(svg, defs, 960, 480, 620, C.stain, 0.25, g);
      const D = BTL.drawing(g);
      const sheet = 'M480 250Q960 236 1440 250L1440 730Q960 716 480 730Z';
      D.f(sheet, C.paperLight, 1); D.s(sheet, { w: 2.5, color: C.inkSoft });
      for (const x of [470, 1450]) {
        D.f(`M${x - 26} 222L${x + 26} 222L${x + 26} 758L${x - 26} 758Z`, mix(C.paperDark, C.stain, 0.35), 1);
        D.s(`M${x - 26} 222L${x + 26} 222L${x + 26} 758L${x - 26} 758Z`, { w: 3 });
        D.s(`M${x} 200L${x} 222M${x} 758L${x} 780`, { w: 6 });
      }
      const lines = ['ΙΛΙΑΣ', 'ΜΗΝΙΝ ΑΕΙΔΕ ΘΕΑ', 'ΠΗΛΗΙΑΔΕΩ ΑΧΙΛΗΟΣ', 'ΟΥΛΟΜΕΝΗΝ Η ΜΥΡΙ', 'ΑΧΑΙΟΙΣ ΑΛΓΕ ΕΘΗΚΕ'];
      const tl = lines.map((s, i) => {
        const e = svgText(g, s, 960, 340 + i * 88, i ? 50 : 62, { fill: i ? C.ink : C.gold, 'font-family': FR, 'font-weight': i ? 400 : 500, opacity: 0, 'letter-spacing': '0.14em' });
        BTL.fit(e, 860); return e;
      });
      const lb = lab2(g, P, 960, 860);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          D.reveal(BTL.ease(lt, 0, 1.6));
          tl.forEach((e, i) => {
            let a = BTL.ease(lt, 0.6 + i * (mode === 'read' ? 0.5 : 0.12), 1);
            if (mode === 'fade') a *= 1 - BTL.ease(lt, th + (4 - i) * 0.3, 1.6);
            fade(e, a);
          });
          pool.set((0.22 + 0.05 * Math.sin(lt * 0.8)) * (mode === 'fade' ? 1 - 0.5 * BTL.ease(lt, th, 2.5) : 1));
          lb(mode === 'fade' ? lt - th : lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_paper
  SH.bt_tr_paper = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'permit', { g } = BTL.stage(svg, W, H, { fx: 860, k: 1.2 });
      const cx = 800;
      const pool = BTL.glow(svg, defs, cx, 470, 520, C.stain, 0.28, g);
      const D = BTL.drawing(el(g, 'g', { transform: `rotate(-3 ${cx} 470)` }));
      const sheet = `M${cx - 270} 150L${cx + 270} 150L${cx + 270} 800L${cx - 270} 800Z`;
      D.f(sheet, C.paperLight, 1); D.s(sheet, { w: 2.5, color: C.inkSoft });
      D.s(`M${cx - 270} 476L${cx + 270} 476`, { w: 1.5, color: C.inkSoft, alpha: 0.6 });
      let ln = '';
      for (let i = 0; i < 12; i++) { const y = 220 + i * 46 + (i > 5 ? 30 : 0), w = 380 - (i % 4) * 40; ln += `M${cx - 210} ${y}Q${cx - 210 + w / 2} ${y - 5} ${cx - 210 + w} ${y}`; }
      D.s(ln, { w: 3, color: C.ink, alpha: 0.75 });
      const half = L0(g, `M${cx - 250} 500L${cx + 250} 500L${cx + 250} 780L${cx - 250} 780Z`, C.gold, 4, 1, { opacity: 0, transform: `rotate(-3 ${cx} 470)` });
      const seal = el(g, 'g', { transform: `translate(${cx + 170} 720)` });
      P0(seal, 'M-54 0C-56-30-30-56 0-54C32-56 58-28 54 2C56 32 28 56-2 54C-32 56-56 30-54 0Z', mix(C.ink, C.stain, 0.45), 0.9);
      el(seal, 'circle', { cx: 0, cy: 0, r: 34, fill: 'none', stroke: C.paperLight, 'stroke-width': 2, 'stroke-opacity': 0.6 });
      const crack = L0(seal, 'M-40-20L-8 0L-18 18L20 40M-8 0L30-30', C.paperLight, 3, 0.9);
      const lb = lab2(g, P, 1220, 470, 'start');
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          D.reveal(BTL.ease(lt, 0, 2));
          fade(seal, BTL.ease(lt, 1, 1));
          if (mode === 'permit') { fade(half, BTL.ease(lt, th, 1.2)); drawP(crack, 0); }
          else drawP(crack, BTL.ease(lt, th, 1));
          pool.set(0.24 + 0.05 * Math.sin(lt * 0.8));
          lb(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_crate
  SH.bt_tr_crate = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'crate', { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.4 });
      if (mode === 'ship') {
        const sunPool = BTL.glow(svg, defs, 1400, 420, 520, C.stain, 0.35, g);
        P0(g, 'M-60 560L1980 560L1980 1200L-60 1200Z', mix(C.paper, C.inkSoft, 0.18), 1);
        L0(g, 'M-60 560L1980 560', C.inkSoft, 2, 0.8);
        const water = L0(g, '', C.inkSoft, 2, 0.45), shine = L0(g, '', C.paperLight, 3, 0.9);
        const ship = el(g, 'g');
        const hull = 'M-210 0L210 0L180 52L-170 52Z';
        P0(ship, hull, mix(C.ink, C.paper, 0.15), 1);
        L0(ship, 'M-90 0L-90-250M60 0L60-280M-90-230L-10-30M60-260L150-20M-60-6L-60-60L-20-60L-20-6', C.ink, 3, 1);
        P0(ship, 'M-84-236L-20-40L-84-40Z', C.paperLight, 0.9); L0(ship, 'M-84-236L-20-40L-84-40Z', C.ink, 2, 0.8);
        P0(ship, 'M66-266L140-30L66-30Z', C.paperLight, 0.9); L0(ship, 'M66-266L140-30L66-30Z', C.ink, 2, 0.8);
        P0(ship, 'M-40-40L-14-40L-14-110L-40-110Z', C.ink, 0.85);
        const smoke = el(g, 'g'), pf = puffs(smoke, 5, 7, { x0: 0, y0: 0, dx: -260, dy: -120, size: 26, spread: 6, rate: 0.05, alpha: 0.18 });
        const lb = lab2(g, P, 960, 860);
        return {
          update(lt, dur) {
            const x = 700 + 9 * lt, y = 568 + 2 * Math.sin(lt * 0.6);
            ship.setAttribute('transform', `translate(${f1(x)} ${f1(y)})`);
            smoke.setAttribute('transform', `translate(${f1(x - 27)} ${f1(y - 110)})`);
            pf.update(lt, 1);
            let wd = '', sd = '';
            for (let i = 0; i < 26; i++) { const xx = ((i * 137 + lt * 10) % 2040) - 60, yy = 600 + (i % 7) * 70; wd += `M${f1(xx)} ${yy}l${50 + (i % 3) * 30} 0`; }
            for (let i = 0; i < 9; i++) { const yy = 580 + i * 26, w = 140 - i * 10; sd += `M${f1(1400 - w / 2 + 14 * Math.sin(lt * 0.5 + i))} ${yy}l${w} 0`; }
            water.setAttribute('d', wd); shine.setAttribute('d', sd);
            sunPool.set(0.3 + 0.04 * Math.sin(lt * 0.7));
            lb(lt);
          },
        };
      }
      const pool = BTL.glow(svg, defs, 860, 560, 520, C.stain, 0.35, g);
      P0(g, 'M-60 820L1980 820L1980 1200L-60 1200Z', mix(C.paperDark, C.paper, 0.3), 1);
      L0(g, 'M-60 820L1980 820', C.inkSoft, 2, 0.8);
      const D = BTL.drawing(g);
      const box = 'M600 560L1120 560L1120 820L600 820Z';
      D.f(box, mix(C.paperDark, C.stain, 0.45), 1); D.s(box, { w: 3.5 });
      D.s('M600 646L1120 646M600 734L1120 734M640 560L640 820M1080 560L1080 820', { w: 2, color: C.inkSoft });
      // gold inside the open crate: the diadem's band and a cup rim
      const gold = el(g, 'g');
      const gp = BTL.glow(svg, defs, 860, 560, 200, C.gold, 0.4, gold);
      L0(gold, 'M660 556Q860 520 1060 556', C.gold, 6, 1);
      let ch = ''; for (let i = 0; i < 12; i++) ch += `M${700 + i * 30} ${f1(548 - 18 * Math.sin(Math.PI * i / 11))}l0 12`;
      L0(gold, ch, C.gold, 3, 1);
      const lid = el(g, 'g');
      P0(lid, 'M0 0L530 0L530 -30L0 -30Z', mix(C.paperDark, C.stain, 0.55), 1);
      L0(lid, 'M0 0L530 0L530 -30L0 -30Z', C.ink, 3.5, 1);
      L0(lid, 'M40 -15L490 -15', C.inkSoft, 2, 0.8);
      // the lantern
      P0(g, 'M1290 820L1370 820L1360 800L1300 800Z', C.ink, 0.9);
      L0(g, 'M1302 800L1302 700L1358 700L1358 800M1296 700L1330 670L1364 700M1330 670L1330 650', C.ink, 3, 1);
      const fl = flame(g, 1330, 784, 0.55, 1.2);
      BTL.glow(svg, defs, 1330, 750, 200, C.gold, 0.3, g);
      const lb = lab2(g, P, 860, 900);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.55);
          D.reveal(BTL.ease(lt, 0, 1.6));
          const q = BTL.ease(lt, th - 0.6, 2.0);
          // the lid swings from standing open (hinged at the back left) down onto the crate
          lid.setAttribute('transform', `translate(595 562) rotate(${f1(-100 * (1 - q))})`);
          fade(gold, 1 - q); gp.set(0.4 * (1 - q) * (0.85 + 0.15 * Math.sin(lt)));
          fl.update(lt, 1);
          pool.set(0.3 - 0.1 * q);
          lb(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_tower
  SH.bt_tr_tower = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'war', { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.3 });
      const beams = el(g, 'g');
      const bA = P0(beams, '', C.paperLight, 0.5), bB = P0(beams, '', C.paperLight, 0.4);
      const sm = el(g, 'g'), pf = puffs(sm, 13, 9, { x0: 520, y0: 700, dx: 180, dy: -420, size: 70, spread: 900, rate: 0.03, alpha: 0.14 });
      P0(g, 'M-60 850L1980 850L1980 1200L-60 1200Z', mix(C.paperDark, C.inkSoft, 0.3), 1);
      // the Zoo flak tower: a squat concrete block, four heavy round corner towers (two seen), gun platforms on top,
      // a few narrow slits instead of windows
      const col = mix(C.paperDark, C.ink, 0.38), dark = mix(C.paperDark, C.ink, 0.62), edge = C.ink;
      const D = BTL.drawing(g);
      const body = 'M690 850L690 330L1230 330L1230 850Z';
      D.f(body, col, 1); D.s(body, { w: 3, color: edge });
      for (const x of [600, 1170]) {
        const t = `M${x} 850L${x} 280Q${x + 75} 262 ${x + 150} 280L${x + 150} 850Z`;
        D.f(t, mix(col, C.ink, 0.12), 1); D.s(t, { w: 3, color: edge });
        D.s(`M${x + 22} 300L${x + 22} 840M${x + 128} 300L${x + 128} 840`, { w: 1.5, color: C.ink, alpha: 0.35 });
        const plat = `M${x - 14} 280L${x - 14} 244L${x + 164} 244L${x + 164} 280Z`;
        D.f(plat, dark, 1); D.s(plat, { w: 3, color: edge });
        D.s(`M${x + 40} 244L${x + 40} 214L${x + 110} 214L${x + 110} 244M${x + 75} 214L${x + 150} 170`, { w: 5, color: edge });
      }
      D.f('M690 330L1230 330L1230 300L690 300Z', dark, 1);
      let slit = '';
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) slit += `M${790 + c * 110} ${430 + r * 130}l12 0l0 54l-12 0Z`;
      for (const x of [655, 1225]) for (let r = 0; r < 3; r++) slit += `M${x + 14} ${400 + r * 150}l12 0l0 50l-12 0Z`;
      D.f(slit, C.ink, 0.85);
      const door = P0(g, 'M905 850L905 720Q960 696 1015 720L1015 850Z', C.ink, 0.9);
      const doorLight = BTL.glow(svg, defs, 960, 800, 240, C.gold, 0, g);
      const dl = P0(g, 'M905 850L905 720Q960 696 1015 720L1015 850Z', C.paperLight, 0);
      const crate = el(g, 'g', { opacity: 0 });
      P0(crate, 'M-36 0L36 0L36-48L-36-48Z', mix(C.paperDark, C.stain, 0.5), 1); L0(crate, 'M-36 0L36 0L36-48L-36-48Z', C.ink, 3, 1);
      L0(crate, 'M-36-24L36-24', C.ink, 2, 0.7);
      const figs = [0, 1].map(i => BTL.person(g, 'stand', 0, 0, 130, { face: 1, color: C.ink, rim: C.ink }));
      figs.forEach(f => fade(f, 0));
      const lb = lab2(g, P, 1420, 560, 'start');
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          D.reveal(BTL.ease(lt, 0, 1.6));
          const a1 = -0.5 + 0.18 * Math.sin(lt * 0.25), a2 = 0.45 + 0.16 * Math.sin(lt * 0.21 + 2);
          const beam = (x, y, a) => { const L = 1400, w = 0.05; return `M${x} ${y}L${f1(x + Math.sin(a - w) * L)} ${f1(y - Math.cos(a - w) * L)}L${f1(x + Math.sin(a + w) * L)} ${f1(y - Math.cos(a + w) * L)}Z`; };
          bA.setAttribute('d', beam(300, 850, a1 + 0.35)); bB.setAttribute('d', beam(1650, 850, a2 - 0.4));
          fade(beams, mode === 'open' ? 1 - BTL.ease(lt, th, 2) * 0.6 : 1);
          pf.update(lt, 1);
          if (mode === 'open') {
            const q = BTL.ease(lt, th, 1.4);
            dl.setAttribute('fill-opacity', (0.85 * q).toFixed(3)); doorLight.set(0.5 * q);
            const w = BTL.ease(lt, th + 0.3, Math.max(2, dur - th - 0.3));
            figs.forEach((f, i) => { f.setAttribute('transform', `translate(${f1(1000 + 480 * w + i * 110)} 850)`); fade(f, BTL.ease(lt, th + 0.1, 0.6)); });
            crate.setAttribute('transform', `translate(${f1(1055 + 480 * w)} 812)`); fade(crate, BTL.ease(lt, th + 0.1, 0.6));
          }
          lb(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_walls
  SH.bt_tr_walls = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'wall', { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.4 });
      const pool = BTL.glow(svg, defs, 960, 480, 760, C.stain, 0.22, g);
      const GY = mode === 'agora' ? 640 : 760;
      P0(g, `M-60 ${GY}L1980 ${GY}L1980 1200L-60 1200Z`, mix(C.paperDark, C.paper, 0.3), 1);
      L0(g, `M-60 ${GY}L1980 ${GY}`, C.inkSoft, 2, 0.8);
      const stone = mix(C.paperLight, C.paperDark, 0.45);
      const D = BTL.drawing(g);
      // the sloping (battered) wall in segments with small offsets; a gate gap between x 980 and 1100; a tower at right
      const top = GY - (mode === 'agora' ? 250 : 330), batter = 70;
      const segs = [[-80, 300], [300, 640], [640, 980], [1100, 1420], [1420, 1980]];
      const r = rng(17);
      segs.forEach(([a, b], i) => {
        const o = i % 2 ? 10 : 0;
        const d = `M${a} ${GY}L${a + batter} ${top + o}L${b} ${top + o}L${b - (i === 2 ? 0 : 0)} ${GY}Z`;
        D.f(d, stone, 1); D.s(d, { w: 3 });
        let c = '';
        for (let y = top + 50 + o; y < GY - 10; y += 46) { const xs = a + batter * (GY - y) / (GY - top); c += `M${f1(xs + 6)} ${y}L${b - 4} ${y}`; for (let x = xs + 30 + r() * 60; x < b - 30; x += 70 + r() * 60) c += `M${f1(x)} ${y}l${f1((r() - 0.5) * 8)} -40`; }
        D.s(c, { w: 1.5, color: C.inkSoft, alpha: 0.7 });
        // mud-brick upper wall (dashed: gone)
        D.s(`M${a + batter} ${top + o - 90}L${b} ${top + o - 90}`, { w: 2, color: C.inkSoft, alpha: 0.5, });
      });
      const tower = `M1460 ${GY}L1490 ${top - 70}L1780 ${top - 70}L1780 ${GY}Z`;
      D.f(tower, stone, 1); D.s(tower, { w: 3 });
      D.s(`M1490 ${top - 70}L1490 ${top - 110}L1780 ${top - 110}L1780 ${top - 70}`, { w: 2, color: C.inkSoft, alpha: 0.6 });
      const gateDark = P0(g, `M980 ${GY}L980 ${top}L1100 ${top}L1100 ${GY}Z`, mix(C.paper, C.paperDark, 0.5), 1);
      const extra = el(g, 'g');
      let flames = [], smoke = null, houses = [], pav = null, road = null;
      if (mode === 'fire') {
        const fr = rng(4);
        for (let i = 0; i < 7; i++) flames.push(flame(extra, 160 + i * 250 + fr() * 60, top + 6, 0.9 + fr() * 0.6, i * 1.7));
        smoke = puffs(extra, 21, 12, { x0: 960, y0: top - 60, dx: 220, dy: -420, size: 80, spread: 1700, rate: 0.035, alpha: 0.16 });
      }
      if (mode === 'reuse') {
        // small rough houses in front of the old wall, built against it
        const hs = [[340, 200, 150], [560, 180, 120], [1160, 220, 160], [1440, 160, 130]];
        hs.forEach(([x, w, h]) => {
          const hg = el(extra, 'g', { opacity: 0 });
          const d = `M${x} ${GY}L${x} ${GY - h}L${x + w} ${GY - h - 12}L${x + w} ${GY}Z`;
          P0(hg, d, mix(C.paperDark, C.stain, 0.35), 1); L0(hg, d, C.ink, 3, 1);
          L0(hg, `M${x - 10} ${GY - h + 2}L${x + w + 10} ${GY - h - 12}`, C.ink, 5, 1);
          L0(hg, `M${x + w * 0.4} ${GY}L${x + w * 0.4} ${GY - h * 0.55}L${x + w * 0.62} ${GY - h * 0.56}L${x + w * 0.62} ${GY}`, C.ink, 2.5, 0.8);
          houses.push(hg);
        });
      }
      if (mode === 'agora') {
        // a paved square in the foreground (perspective) and a paved road running to the gate
        pav = el(extra, 'g', { opacity: 0 });
        const sq = `M360 900L1620 900L1400 ${GY + 70}L560 ${GY + 70}Z`;
        P0(pav, sq, C.paperLight, 0.7); L0(pav, sq, C.ink, 3, 0.9);
        let gr = '';
        for (let i = 1; i < 5; i++) { const t = i / 5, y = GY + 70 + (900 - GY - 70) * t, xl = 560 - 200 * t, xr = 1400 + 220 * t; gr += `M${f1(xl)} ${f1(y)}L${f1(xr)} ${f1(y)}`; }
        for (let i = 1; i < 10; i++) { const t = i / 10; gr += `M${f1(560 + 840 * t)} ${GY + 70}L${f1(360 + 1260 * t)} 900`; }
        L0(pav, gr, C.inkSoft, 1.6, 0.6);
        road = L0(extra, `M1000 ${GY + 70}L1010 ${GY}M1080 ${GY + 70}L1070 ${GY}`, C.ink, 3, 1);
      }
      const lb = lab2(g, P, 960, mode === 'agora' ? 250 : 200);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.45);
          D.reveal(BTL.ease(lt, 0, 2));
          if (mode === 'fire') { const on = BTL.ease(lt, th - 0.4, 1.6); flames.forEach(f => f.update(lt, on)); smoke.update(lt, on); pool.set(0.2 + 0.18 * on + 0.03 * Math.sin(lt * 1.1)); }
          else pool.set(0.2 + 0.04 * Math.sin(lt * 0.8));
          houses.forEach((h, i) => fade(h, BTL.ease(lt, th + i * 0.35, 1)));
          if (pav) { fade(pav, BTL.ease(lt, th - 0.2, 1.6)); drawP(road, BTL.ease(lt, th + 0.6, 1.4)); }
          lb(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_plan
  SH.bt_tr_plan = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.2 });
      const pool = BTL.glow(svg, defs, 960, 470, 640, C.stain, 0.2, g);
      const cit = 'M880 210C930 180 1030 182 1070 220C1110 262 1100 330 1060 360C1010 392 920 390 880 352C844 318 840 244 880 210Z';
      const town = 'M700 330C700 240 800 200 880 210L1070 220C1180 230 1260 330 1270 450C1280 620 1180 780 980 800C800 820 680 700 670 560C664 470 690 400 700 330Z';
      const ditch = 'M640 320C630 220 780 160 900 168L1080 178C1230 196 1320 320 1330 460C1340 650 1210 840 980 860C780 880 630 740 616 570C608 470 632 400 640 320Z';
      const tF = P0(g, town, C.paperLight, 0.8, { opacity: 0 });
      const tS = L0(g, town, C.inkSoft, 2.5, 1);
      const dS = L0(g, ditch, C.gold, 4, 1, { 'stroke-dasharray': '16 12', opacity: 0 });
      const D = BTL.drawing(g);
      D.f(cit, mix(C.paperDark, C.stain, 0.4), 1); D.s(cit, { w: 4 });
      D.s('M900 240C950 220 1020 222 1050 248', { w: 2, color: C.inkSoft });
      const tx = window.TROYA.txt;
      const l1 = tx(g, 'kale', 1150, 250, 46, { anchor: 'start' });
      const l2 = tx(g, P.label || 'aşağı şehir', 980, 560, 50, { font: FR, italic: false });
      const l3 = tx(g, P.sub || 'hendek', 1360, 650, 44, { anchor: 'start', color: C.gold });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.35), tb = cue(cues, 'b', dur * 0.65);
          D.reveal(BTL.ease(lt, 0, 1.6)); fade(l1, BTL.ease(lt, 0.8, 1));
          drawP(tS, BTL.ease(lt, th - 0.3, 2)); fade(tF, BTL.ease(lt, th + 0.6, 1.4)); fade(l2, BTL.ease(lt, th + 0.8, 1));
          fade(dS, BTL.ease(lt, tb - 0.2, 0.4)); dS.setAttribute('stroke-dashoffset', f1(-lt * 6));
          const q = BTL.ease(lt, tb - 0.2, 2.4);
          dS.setAttribute('stroke-dasharray', q < 1 ? `16 12` : '16 12');
          dS.setAttribute('clip-path', '');
          fade(dS, q); fade(l3, BTL.ease(lt, tb + 0.6, 1));
          pool.set(0.2 + 0.04 * Math.sin(lt * 0.8));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_tablet
  SH.bt_tr_tablet = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 900, k: 1.3 });
      const cx = 820;
      const pool = BTL.glow(svg, defs, cx, 470, 520, C.stain, 0.28, g);
      const D = BTL.drawing(el(g, 'g', { transform: `rotate(-4 ${cx} 470)` }));
      const tab = `M${cx - 250} 170Q${cx} 150 ${cx + 250} 170Q${cx + 270} 470 ${cx + 250} 800Q${cx} 820 ${cx - 250} 800Q${cx - 270} 470 ${cx - 250} 170Z`;
      D.f(tab, mix(C.paperDark, C.stain, 0.5), 1); D.s(tab, { w: 3.5 });
      const r = rng(61), rows = [];
      for (let i = 0; i < 11; i++) {
        const y = 220 + i * 52; let d = `M${cx - 220} ${y + 22}L${cx + 220} ${y + 22}`;
        for (let x = cx - 205; x < cx + 200; x += 26 + r() * 22) { const big = r() < 0.4; d += big ? `M${f1(x)} ${y}l14 0l-7 14ZM${f1(x + 7)} ${y + 14}l0 6` : `M${f1(x)} ${y + 6}l10 4l-10 4Z`; }
        rows.push(d);
      }
      rows.forEach((d, i) => { if (i !== 6) D.s(d, { w: 2.5, color: C.ink, alpha: 0.75 }); });
      const gl = L0(el(g, 'g', { transform: `rotate(-4 ${cx} 470)` }), rows[6], C.ink, 2.5, 0.75);
      const tx = window.TROYA.txt;
      const lead = L0(g, `M${cx + 240} 534L${cx + 400} 534`, C.gold, 3, 1);
      const lab = tx(g, P.label || 'Wilusa', cx + 430, 552, 64, { font: FR, italic: false, anchor: 'start', color: C.gold });
      const sub = P.sub ? tx(g, P.sub, cx + 430, 620, 42, { anchor: 'start', color: C.inkSoft }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          D.reveal(BTL.ease(lt, 0, 2.2));
          const q = BTL.ease(lt, th, 1.2);
          gl.setAttribute('stroke', q > 0.5 ? C.gold : C.ink); gl.setAttribute('stroke-width', f1(2.5 + 1.5 * q)); gl.setAttribute('stroke-opacity', '1');
          drawP(lead, BTL.ease(lt, th + 0.2, 0.8)); fade(lab, BTL.ease(lt, th + 0.5, 1)); if (sub) fade(sub, BTL.ease(lt, th + 1, 1));
          pool.set(0.24 + 0.05 * Math.sin(lt * 0.8));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_map
  // a plain map like bt_map, plus the North Sea, the Baltic and Britain so northern Europe is not one blank block.
  //   bt_tr_map P: {bounds: [lon0, lat0, lon1, lat1], points: [{lon, lat, label, sub, at, side}], routes: [[i, j, at]]}
  const LAND0 = [
    [[-9.5, 43.5], [-9, 39], [-8.9, 37], [-6, 36.8], [-5.6, 36], [-4.5, 36.7], [-2, 36.8], [-0.5, 38.3], [0, 39], [0.3, 40.5], [3, 41.8], [3.1, 42.8], [4, 43.5], [6, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.6, 42.9], [11.6, 42.3], [12.4, 41.7], [13.6, 41.2], [14.3, 40.8], [15.6, 40], [16, 39], [15.7, 38], [16.1, 38], [16.6, 38.4], [17.2, 39], [16.6, 40], [17, 40.5], [18.5, 40.1], [18.4, 40.3], [17.9, 40.7], [16.2, 41.3], [15.2, 41.9], [14, 42.6], [13.6, 43.5], [12.3, 44.5], [12.4, 45.4], [13.7, 45.7], [13.6, 45.1], [14.3, 45.2], [15.2, 44.3], [16.4, 43.5], [17.6, 43], [18.5, 42.4], [19.4, 41.8], [19.4, 40.4], [20, 39.6], [20.7, 38.8], [21.1, 38.3], [21.6, 37.5], [21.7, 36.8], [22.5, 36.4], [23, 36.6], [22.8, 37.6], [23.2, 38], [24, 37.7], [23.9, 38.4], [22.8, 38.9], [22.6, 39.5], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29, 41.2], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [60, 47], [60, 75], [-30, 75], [-30, 43.5]],
    [[29.1, 41.2], [30, 41.1], [31.4, 41.3], [33, 42], [35, 42], [36.5, 41.3], [38, 40.9], [40, 41], [41.5, 41.5], [41.5, 42.5], [60, 42.5], [60, 36.6], [36.2, 36.6], [35.8, 36.8], [34.6, 36.8], [33.6, 36.2], [32.5, 36.1], [31, 36.8], [30.5, 36.5], [29.6, 36.2], [28.2, 36.7], [27.4, 37], [27.2, 37.9], [26.4, 38.3], [26.8, 38.6], [26.9, 39.4], [26.1, 39.5], [26.2, 40.1], [26.8, 40.35], [27.5, 40.4], [29, 40.4], [29.4, 40.8]],
    [[-30, 33], [-9.8, 30], [-6.8, 34], [-6, 35.8], [-5.3, 35.9], [-2, 35.1], [0, 35.9], [3, 36.8], [5, 36.8], [7.8, 36.9], [9.8, 37.3], [10.3, 36.8], [11, 37], [10.4, 36.2], [11.1, 35.2], [10, 34.2], [10.9, 33.1], [12.5, 32.8], [15.2, 32.3], [15.7, 31.4], [18.5, 30.3], [20, 30.9], [20, 32], [21, 32.8], [22.9, 32.6], [25, 31.7], [27.5, 31.2], [29.9, 31.2], [31.2, 31.5], [32.3, 31.2], [34.2, 31.3], [34.6, 32], [35.2, 33], [35.9, 34.5], [35.8, 35.5], [35.9, 36.6], [60, 36.6], [60, -10], [-30, -10]],
    [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 37], [12.4, 37.8]],
    [[8.4, 41], [9.2, 41.2], [9.8, 40.6], [9.6, 39.2], [9, 39], [8.4, 39], [8.4, 40]],
    [[8.6, 42.8], [9.4, 43], [9.6, 42.2], [9.2, 41.4], [8.6, 41.9]],
    [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]],
    [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],
  ];
  const SEAS = [[-30, 48], [-4.5, 48], [-1.6, 48.7], [1.5, 50.2], [2.5, 51.1], [4, 51.4], [4.8, 52.9], [6.8, 53.4], [8.6, 53.9], [8.9, 54.9], [8.3, 55.6], [8.1, 56.8], [10.5, 57.7], [10.4, 56.3], [10.9, 56.4], [10.2, 55], [10.9, 54.4], [12.5, 54.4], [14.2, 53.9], [16.7, 54.6], [18.6, 54.4], [19.9, 54.9], [21.2, 55.3], [21.1, 56.4], [21.6, 57.4], [22.6, 57.7], [23.4, 57], [24.4, 57.2], [24.3, 58.3], [23.5, 59.2], [25.6, 59.6], [28, 59.5], [30.2, 59.9], [29, 60.2], [26.6, 60.5], [22.9, 59.9], [21.4, 60.8], [21.5, 62.6], [25.2, 65], [24.1, 65.8], [22.3, 65.8], [21.2, 64.6], [17.8, 62.5], [17.3, 60.6], [18.8, 59.8], [18.4, 59.1], [16.7, 58.4], [16.4, 56.7], [14.5, 56.1], [12.9, 55.6], [12.6, 56.2], [11.9, 57.7], [10.9, 59], [10.4, 59.4], [8.4, 58.2], [6.6, 58.1], [5.5, 59], [5, 61], [5.3, 62.5], [8, 63.5], [10, 64.5], [13, 67], [16, 69], [20, 70], [25, 71], [30, 70], [33, 69.5], [40, 68], [44, 67], [60, 67], [60, 75], [-30, 75]];
  const ISLES = [[[-5.7, 50], [1.4, 51.2], [1.7, 52.7], [0.2, 53.5], [-0.5, 54.5], [-1.6, 55.6], [-2.1, 57.7], [-3, 58.6], [-5, 58.6], [-6.2, 56.6], [-5, 55], [-3, 53.9], [-4.6, 53.3], [-4.8, 52], [-3, 51.4]],
    [[10.9, 56.1], [12.6, 56], [12.3, 55.3], [11.1, 55.2]], [[18.1, 57.3], [19.1, 57.9], [18.8, 57.3], [18.3, 56.9]]];
  SH.bt_tr_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), [l0, b0, l1, b1] = P.bounds || [8, 36, 32, 56];
      const portrait = H > W, k = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 120 : 180), ah = portrait ? 1000 : H - 230;
      const s = Math.min(aw / ((l1 - l0) * k), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * k * s / 2, oy = (portrait ? 640 : (H - 90) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * k * s, Y = lat => oy + (b1 - lat) * s;
      const poly = p => 'M' + p.map(q => f1(X(q[0])) + ' ' + f1(Y(q[1]))).join('L') + 'Z';
      const mg = el(g, 'g');
      let grat = '';
      for (let lon = -30; lon <= 60; lon += 5) grat += `M${X(lon).toFixed(0)} -10L${X(lon).toFixed(0)} ${H + 10}`;
      for (let lat = 10; lat <= 75; lat += 5) grat += `M-10 ${Y(lat).toFixed(0)}L${W + 10} ${Y(lat).toFixed(0)}`;
      L0(mg, grat, C.inkSoft, 1.5, 0.18);
      const landD = LAND0.map(poly).join('') + ISLES.map(poly).join('');
      P0(mg, landD, C.paperDark, 0.75);
      const seaD = poly(SEAS);
      P0(mg, seaD, C.paper, 1);
      P0(mg, ISLES.map(poly).join(''), C.paperDark, 0.75);
      const coast = el(mg, 'g');
      L0(coast, LAND0.map(poly).join(''), C.inkSoft, 2.5, 1); L0(coast, seaD, C.inkSoft, 2.5, 1); L0(coast, ISLES.map(poly).join(''), C.inkSoft, 2.5, 1);
      const tx = window.TROYA.txt;
      const pts = (P.points || []).map(p => {
        const x = X(p.lon), y = Y(p.lat), pg = el(g, 'g');
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 3 });
        el(pg, 'circle', { cx: x, cy: y, r: 10, fill: C.gold });
        const right = p.side ? p.side !== 'left' : x < W * 0.7, ax = right ? x + 34 : x - 34, an = right ? 'start' : 'end';
        const dy = p.dy || 0, lab = tx(pg, p.label || '', ax, y + 18 + dy, 58, { font: FR, italic: false, weight: 500, anchor: an });
        const sub = p.sub ? tx(pg, p.sub, ax, y + 74 + dy, 46, { anchor: an, color: mix(C.ink, C.inkSoft, 0.35) }) : null;
        fade(lab, 1); if (sub) fade(sub, 1);
        return { p, pg, ring, x, y };
      });
      const routes = (P.routes || []).map(([a, b, at]) => {
        const A = pts[a], B = pts[b], mxp = (A.x + B.x) / 2, myp = Math.min(A.y, B.y) - Math.abs(A.x - B.x) * 0.18;
        return { at, e: L0(g, `M${f1(A.x)} ${f1(A.y)}Q${f1(mxp)} ${f1(myp)} ${f1(B.x)} ${f1(B.y)}`, C.gold, 4, 1) };
      });
      return {
        update(lt, dur, cues) {
          fade(coast, BTL.ease(lt, 0, 1.2));
          pts.forEach((q, i) => {
            const at = cue(cues, q.p.at, 0.6 + i * 0.8);
            fade(q.pg, BTL.ease(lt, at - 0.3, 1));
            const ph = ((lt - at) % 2.6 + 2.6) % 2.6 / 2.6;
            q.ring.setAttribute('r', f1(14 + 26 * ph)); q.ring.setAttribute('stroke-opacity', ((1 - ph) * 0.8).toFixed(3));
          });
          routes.forEach(r => drawP(r.e, BTL.ease(lt, cue(cues, r.at, dur * 0.4), 1.6)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_timeline
  //   bt_tr_timeline P: {from, to}  cues: c0 (the bottom end lights), c1 (the top end)   nine cities on a time bar:
  //   one segment per city I-IX (≈ MÖ 3000 → MS 500), II gold, VI-VII outlined
  SH.bt_tr_timeline = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.0 });
      BTL.glow(svg, defs, 960, 480, 760, C.stain, 0.16, g);
      // years: negative = BC
      const segs = [[-3000, -2550], [-2550, -2300], [-2300, -2200], [-2200, -2000], [-2000, -1750], [-1750, -1300], [-1300, -950], [-950, -85], [-85, 500]];
      const x0 = 200, x1 = 1720, X = yr => x0 + (yr + 3000) / 3500 * (x1 - x0), y = 470;
      const tx = window.TROYA.txt, R = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
      const bars = segs.map(([a, b], i) => {
        const d = `M${f1(X(a) + 3)} ${y - 34}L${f1(X(b) - 3)} ${y - 34}L${f1(X(b) - 3)} ${y + 34}L${f1(X(a) + 3)} ${y + 34}Z`;
        const e = P0(g, d, i === 1 ? C.gold : (i === 5 || i === 6) ? mix(C.paperDark, C.stain, 0.6) : mix(C.paperDark, C.stain, 0.25), i === 1 ? 0.9 : 1, { opacity: 0 });
        const o = L0(g, d, C.ink, 2.5, 0.8, { opacity: 0 });
        const w = X(b) - X(a), n = w > 70 ? tx(g, R[i], (X(a) + X(b)) / 2, y + (i % 2 ? 120 : -70), 46, { font: FR, italic: false, weight: 500, halo: false }) : null;
        const tick = w > 70 ? null : L0(g, `M${f1((X(a) + X(b)) / 2)} ${y + 40}L${f1((X(a) + X(b)) / 2)} ${y + 60}`, C.inkSoft, 2, 1, { opacity: 0 });
        return { e, o, n, tick };
      });
      const axis = L0(g, `M${x0} ${y + 60}L${x1} ${y + 60}`, C.inkSoft, 2, 1);
      const la = tx(g, P.from || '≈ MÖ 3000', x0, y + 200, 50, { anchor: 'start', color: C.ink });
      const lb = tx(g, P.to || '≈ MS 500', x1, y + 200, 50, { anchor: 'end', color: C.ink });
      const now = tx(g, '3.500 yıl', 960, 260, 72, { font: FR, italic: false, weight: 600, color: C.gold });
      return {
        update(lt, dur, cues) {
          const ta = cue(cues, 'c0', 0.8), tb = cue(cues, 'c1', dur * 0.5);
          drawP(axis, BTL.ease(lt, 0, 1.2));
          bars.forEach((b, i) => { const q = BTL.ease(lt, ta - 0.2 + i * 0.22, 0.7); fade(b.e, q); fade(b.o, q); fade(b.n, q); fade(b.tick, q); });
          fade(la, BTL.ease(lt, ta, 1)); fade(lb, BTL.ease(lt, tb, 1)); fade(now, BTL.ease(lt, tb, 0.8));
        },
      };
    },
  };
})();
