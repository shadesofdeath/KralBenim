// bt_troya: Troy (Hisarlık, Çanakkale) and Schliemann's dig, belgesel style (docs/BELGESEL.md). Still line art in the
// theme's tokens; the only motion is slow and natural (a slowly lowering pick, falling crumbs, drifting dust, a sinking
// sun, breathing light, figures walking away). Composed on the 1920x1080 stage (BTL.stage frames it for a Short).
// Shared drawings live in window.TROYA (used by bt_troya_b.js).
//   bt_tr_dig     P: {mode: "pick"|"glint"|"knife"}  cues: hit   a trench wall of layered earth seen close.
//                 pick: a pick lowers slowly and strikes on hit, crumbs fall, a gold glint shows. glint: a gold edge
//                 peeks out of the earth. knife: a kneeling figure cuts at the wall by a small lamp, gold in the wall
//   bt_tr_hill    P: {mode: "plain"|"calvert"|"two"|"trench"|"paydos"|"scar"|"today", label, sub}  cues: hit
//                 the low Hisarlık mound on the plain, the strait and the far hills behind, a slowly sinking sun.
//                 calvert/two: one / two figures on top. trench: a cut and many workers. paydos: the workers walk away
//                 on hit, one kneels at the cut. scar: the cut, nobody there. today: a path up the mound
//   bt_tr_section P: {mode: "hidden"|"two"|"agora"|"trench"|"burnt"|"layers"|"span"|"all"|"glow", cut: true|"done",
//                 label}  cues: hit, a, b   the mound in cross-section: nine strata (Troy I at the bottom, IX on top),
//                 wall stubs in each. trench: Schliemann's trench (dashed outline; cut: true opens it on hit, the
//                 walls inside fade to dashed ghosts; "done" = already cut). two: Troy II (gold, a) vs VI-VII (b).
//                 agora: VIII lights on hit. layers: numerals I-IX rise on hit. span: a gold line bottom to top with
//                 dates. all: every stratum lights in turn on hit. glow: the cut, gold glowing in Troy II (cover)
//   bt_tr_diadem  P: {mode: "show"|"lost"|"portrait"|"case"|"gone", label, sub}  cues: hit   the great gold diadem
//                 (a band with hanging chains of leaf pendants) in a light pool. lost: fades to a dashed ghost on hit.
//                 portrait: an oval carte-de-visite with a faceless bust wearing it. case: in a museum case.
//                 gone: the case, the diadem fades on hit
//   bt_tr_hoard   P: {labels: [4]}  cues: c0..c3   diadem, basket earring, two-handled cup, a heap of beads in a row
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const txt = (g, s, x, y, size, o = {}) => {
    const e = svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || LO,
      'font-weight': o.weight || 500, opacity: 0, 'text-anchor': o.anchor || 'middle' }, o.italic !== false ? { 'font-style': 'italic' } : {}));
    if (o.halo !== false) { e.setAttribute('stroke', C.paper); e.setAttribute('stroke-width', 10); e.setAttribute('stroke-linejoin', 'round'); e.setAttribute('paint-order', 'stroke'); }
    return e;
  };
  const drawP = (e, p) => { e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', '1 1'); e.setAttribute('stroke-dashoffset', f1(1 - clamp01(p))); };
  const FIG = () => mix(C.ink, C.paper, 0.12);
  const EARTH = t => mix(C.paperDark, C.stain, t);

  // slow drifting dust motes (or falling crumbs with fall: true)
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), x: r(), y: r(), s: (o.size || 2) * (0.7 + r() * 0.9), v: 0.02 + r() * 0.03, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      let x, y, a;
      if (o.fall) { const u = (q.y + q.v * 4 * lt) % 1; x = box[0] + q.x * w + 6 * Math.sin(q.ph + u * 3); y = box[1] + u * h; a = Math.sin(Math.PI * u); }
      else { const u = (q.x + q.v * lt + 10) % 1; x = box[0] + u * w; y = box[1] + q.y * h + 12 * Math.sin(lt * 0.3 + q.ph); a = Math.sin(Math.PI * u); }
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.4) * a).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ the great diadem (shared)
  // origin = centre of the top band; ~560 px wide, side chains hang ~330 px. Returns {D, glints: [path x3]}
  function diadem(parent, x, y, k = 1, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y}) scale(${k})` });
    const D = BTL.drawing(g), col = o.color || C.gold, r = rng(o.seed || 41);
    const leaf = (cx, cy, rx, ry) => `M${f1(cx)} ${f1(cy - ry)}Q${f1(cx + rx * 1.4)} ${f1(cy)} ${f1(cx)} ${f1(cy + ry)}Q${f1(cx - rx * 1.4)} ${f1(cy)} ${f1(cx)} ${f1(cy - ry)}Z`;
    const bandY = xx => 14 * (xx / 280) * (xx / 280);
    let leaves = '';
    const gl = ['', '', ''];
    const chains = [];
    for (let i = -8; i <= 8; i++) chains.push({ x: i * 17, L: 120 + (i % 2 ? 0 : 8) });
    for (let s of [-1, 1]) for (let j = 0; j < 7; j++) chains.push({ x: s * (170 + j * 15), L: 300 + j * 8 });
    chains.forEach((c, ci) => {
      const y0 = bandY(c.x) + 6;
      D.s(`M${f1(c.x)} ${f1(y0)}L${f1(c.x)} ${f1(y0 + c.L)}`, { w: 2.6, color: col });
      for (let yy = y0 + 14; yy < y0 + c.L - 6; yy += 15) {
        const lf = leaf(c.x, yy, 4.4, 7);
        leaves += lf;
        if (r() < 0.12) gl[(ci + Math.round(yy)) % 3] += lf;
      }
      leaves += Math.abs(c.x) > 160 ? leaf(c.x, y0 + c.L + 12, 9, 20) : leaf(c.x, y0 + c.L + 8, 6.5, 13);
    });
    D.f(`M-290 ${f1(bandY(-290) - 10)}Q0 -30 290 ${f1(bandY(290) - 10)}L290 ${f1(bandY(290) + 10)}Q0 -10 -290 ${f1(bandY(-290) + 10)}Z`, col, 1);
    D.s(`M-290 ${f1(bandY(-290) - 10)}Q0 -30 290 ${f1(bandY(290) - 10)}L290 ${f1(bandY(290) + 10)}Q0 -10 -290 ${f1(bandY(-290) + 10)}Z`, { w: 2.5, color: mix(col, C.ink, 0.4) });
    let dots = ''; for (let i = -9; i <= 9; i++) dots += BTL.E(i * 30, bandY(i * 30) - 10 + Math.abs(i) * 0.2, 5, 5);
    D.f(dots, C.paperLight, 0.8);
    D.f(leaves, col, 1);
    const glints = gl.map(d => P0(g, d, C.paperLight, 0));
    return { g, D, glints, update(lt) { glints.forEach((e, i) => e.setAttribute('fill-opacity', (0.75 * Math.max(0, Math.sin(lt * 0.8 + i * 2.1)) ** 3).toFixed(3))); } };
  }
  window.TROYA = { diadem, motes, txt, EARTH, FIG };

  // ------------------------------------------------------------------ bt_tr_dig
  SH.bt_tr_dig = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'pick', { g } = BTL.stage(svg, W, H, { fx: 960 });
      const r = rng(7 + mode.length);
      // the trench wall: undulating strata from top to the floor at y 900
      const yb = [-60, 110, 230, 330, 470, 590, 700, 800, 905];
      const lineAt = (k, x) => yb[k] + 10 * Math.sin(x / 170 + k * 1.3) + 6 * Math.sin(x / 61 + k);
      const row = k => { let d = ''; for (let x = -60; x <= 1980; x += 40) d += (x === -60 ? 'M' : 'L') + f1(x) + ' ' + f1(lineAt(k, x)); return d; };
      for (let k = 0; k < yb.length - 1; k++) {
        let d = row(k + 1); for (let x = 1980; x >= -60; x -= 40) d += 'L' + f1(x) + ' ' + f1(lineAt(k, x)); d += 'Z';
        P0(g, d, EARTH([0.15, 0.38, 0.22, 0.5, 0.18, 0.34, 0.44, 0.26][k]), 1);
      }
      for (let k = 1; k < yb.length - 1; k++) L0(g, row(k), C.inkSoft, 2, 0.55);
      // stones and pebbles
      let st = '';
      for (let i = 0; i < 70; i++) { const x = r() * 1920, y = 60 + r() * 820, s = 6 + r() * r() * 26; st += BTL.E(x, y, s * 1.4, s); }
      P0(g, st, mix(C.paperDark, C.ink, 0.18), 0.7); L0(g, st, C.inkSoft, 1.5, 0.5);
      // floor
      P0(g, 'M-60 900L1980 900L1980 1200L-60 1200Z', mix(C.paperDark, C.paper, 0.4), 1);
      L0(g, 'M-60 900L1980 900', C.ink, 3, 0.8);
      const crumbs = el(g, 'g'), mt = motes(crumbs, 19, 14, mode === 'knife' ? [760, 560, 980, 900] : [1000, 600, 1160, 900], { fall: true, size: 3, color: C.inkSoft, alpha: 0.55 });
      const gx = mode === 'knife' ? 900 : mode === 'glint' ? 960 : 1060, gy = mode === 'glint' ? 520 : 610;
      const pool = BTL.glow(svg, defs, gx, gy, mode === 'glint' ? 380 : 260, C.gold, 0, g);
      // the gold in the wall: the edge of the diadem band and a few chains
      const gold = el(g, 'g');
      const gd = diadem(gold, gx, gy, mode === 'glint' ? 1.15 : 0.6, { seed: 5 });
      const clipId = 'trdig' + mode; const cp = el(defs, 'clipPath', { id: clipId });
      el(cp, 'path', { d: BTL.E(gx, gy + (mode === 'glint' ? 40 : 20), mode === 'glint' ? 300 : 150, mode === 'glint' ? 120 : 70) });
      gold.setAttribute('clip-path', `url(#${clipId})`);
      let pick = null, fig = null, flame = null, knife = null;
      if (mode === 'pick') {
        pick = el(g, 'g');
        // handle runs out of the frame to the lower right; the iron head strikes at (1080, 600)
        L0(pick, 'M1110 640L1990 880', mix(C.ink, C.paperDark, 0.25), 22, 1);
        L0(pick, 'M1110 640L1990 880', C.ink, 3, 0.6);
        const head = 'M1000 560Q1100 560 1180 700L1170 712Q1100 610 1012 596Z';
        P0(pick, head, C.ink, 0.9); L0(pick, head, C.ink, 3, 1);
      }
      if (mode === 'knife') {
        fig = BTL.person(g, 'kneel', 560, 905, 440, { face: 1, color: FIG(), rim: C.ink });
        knife = L0(g, 'M716 660L842 610', C.ink, 5, 1);
        const fl = el(g, 'g'); flame = fl;
        P0(g, 'M300 905L380 905L370 870L310 870Z', C.ink, 0.85);
        BTL.glow(svg, defs, 340, 840, 220, C.stain, 0.35, g);
      }
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', mode === 'pick' ? dur * 0.6 : 0.6);
          let reveal = 1, q = 1;
          if (mode === 'pick') {
            const a = 24 * (1 - BTL.ease(lt, 0, Math.max(0.8, th)));
            pick.setAttribute('transform', `rotate(${f1(a)} 1990 880)`);
            q = BTL.ease(lt, th, 1.4); reveal = q;
            mt.update(lt - th, lt > th ? 1 - BTL.ease(lt, th + 2.5, 2) : 0);
          } else if (mode === 'glint') {
            reveal = BTL.ease(lt, 0, 2.4); q = 0.6 + 0.4 * BTL.ease(lt, th, 1.6);
            mt.update(lt, 0.8);
          } else {
            reveal = BTL.ease(lt, 0.2, 2.2); q = 0.5 + 0.5 * BTL.ease(lt, th, 1.6);
            mt.update(lt, 0.7);
            const s = 1 + 0.06 * Math.sin(lt * 1.7) + 0.03 * Math.sin(lt * 2.9);
            flame.setAttribute('transform', '');
            if (!flame.firstChild) { P0(flame, '', C.gold, 0.9); P0(flame, '', C.paperLight, 0.9); }
            flame.childNodes[0].setAttribute('d', `M340 870C318 852 322 ${f1(836 - 30 * s)} 340 ${f1(806 - 34 * s)}C358 ${f1(836 - 30 * s)} 362 852 340 870Z`);
            flame.childNodes[1].setAttribute('d', `M340 866C330 856 332 ${f1(846 - 12 * s)} 340 ${f1(834 - 14 * s)}C348 ${f1(846 - 12 * s)} 350 856 340 866Z`);
            const kx = 6 * Math.sin(lt * 0.9);
            knife.setAttribute('transform', `translate(${f1(kx)} ${f1(-kx * 0.4)})`);
          }
          gd.D.reveal(reveal); gd.update(lt);
          pool.set(q * (0.32 + 0.06 * Math.sin(lt * 0.9)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_hill
  SH.bt_tr_hill = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'plain', { g } = BTL.stage(svg, W, H, { fx: 1000, k: 1.6 });
      const sunG = el(g, 'g'), sunPool = BTL.glow(svg, defs, 1560, 300, 420, C.stain, 0.35, sunG);
      const sun = el(sunG, 'circle', { cx: 1560, cy: 300, r: 46, fill: C.paperLight, stroke: C.gold, 'stroke-width': 3 });
      // far hills across the strait, the water, the plain
      P0(g, 'M-60 506L120 492C300 470 420 462 560 476C700 490 820 470 980 458C1140 446 1260 470 1420 480C1580 490 1720 470 1980 478L1980 512L-60 512Z', mix(C.paperDark, C.paper, 0.35), 1);
      L0(g, 'M-60 506L120 492C300 470 420 462 560 476C700 490 820 470 980 458C1140 446 1260 470 1420 480C1580 490 1720 470 1980 478', C.inkSoft, 2, 0.7);
      P0(g, 'M-60 512L1980 512L1980 548L-60 548Z', mix(C.paper, C.inkSoft, 0.16), 1);
      const water = L0(g, '', C.paperLight, 2.5, 0.9);
      P0(g, 'M-60 548L1980 548L1980 1200L-60 1200Z', mix(C.paperDark, C.paper, 0.25), 1);
      L0(g, 'M-60 548L1980 548', C.inkSoft, 2, 0.8);
      let fl = '';
      for (let i = 0; i < 9; i++) { const y = 600 + i * i * 9; fl += `M-60 ${y}Q960 ${y - 14} 1980 ${y + 4}`; }
      L0(g, fl, C.inkSoft, 1.6, 0.35);
      // the mound
      const mound = 'M560 668C720 600 800 480 1000 474C1200 468 1290 590 1460 668Z';
      P0(g, mound, EARTH(0.32), 1);
      const ml = L0(g, 'M560 668C720 600 800 480 1000 474C1200 468 1290 590 1460 668', C.ink, 3, 1);
      L0(g, 'M700 612C760 590 800 560 840 540M1150 520C1200 560 1250 600 1300 626', C.inkSoft, 1.6, 0.5);
      let grass = '';
      const r = rng(23);
      for (let i = 0; i < 40; i++) { const x = 600 + r() * 820, t = (x - 560) / 900; const y = 668 - Math.sin(Math.PI * t) ** 0.7 * 190; grass += `M${f1(x)} ${f1(y)}l${f1(-3 + r() * 6)} -${f1(8 + r() * 10)}`; }
      L0(g, grass, C.inkSoft, 1.5, 0.6);
      const cut = 'M920 480L950 560L1060 560L1086 478Z';
      const cutE = (mode === 'trench' || mode === 'paydos' || mode === 'scar' || mode === 'today') ? P0(g, cut, mix(C.paperDark, C.ink, 0.35), 1) : null;
      if (cutE) L0(g, 'M920 480L950 560L1060 560L1086 478', C.ink, 2.5, 0.9);
      if (mode === 'today') L0(g, 'M600 660L760 620L700 590L880 540L820 512L940 486', C.inkSoft, 2.5, 0.8, { 'stroke-dasharray': '10 10' });
      const figs = [];
      const fig = (pose, x, y, h, face = 1) => { const e = BTL.person(g, pose, x, y, h, { face, color: FIG(), rim: C.ink }); figs.push({ e, x, y }); return e; };
      if (mode === 'calvert') fig('stand', 1000, 474, 120, -1);
      if (mode === 'two') { fig('stand', 960, 476, 118, 1); fig('stand', 1050, 474, 124, -1); }
      if (mode === 'trench' || mode === 'paydos') {
        const pts = [[880, 492], [905, 484], [1110, 486], [1135, 494], [1170, 504], [850, 502], [1205, 520], [820, 516], [990, 560], [1030, 560]];
        pts.forEach(([x, y], i) => fig(i % 3 === 0 ? 'bend' : 'stand', x, y, 56, i % 2 ? 1 : -1));
      }
      let boss = null, gl = null;
      if (mode === 'paydos') { boss = BTL.person(g, 'kneel', 1010, 560, 60, { face: 1, color: FIG(), rim: C.ink }); gl = BTL.glow(svg, defs, 1040, 548, 70, C.gold, 0, g); }
      const lab = P.label ? txt(g, P.label, 1000, 780, 52, { font: FR, italic: false, weight: 400 }) : null;
      const sub = P.sub ? txt(g, P.sub, 1000, 850, 48, { color: mix(C.ink, C.inkSoft, 0.35) }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          const sy = 300 + 26 * BTL.ease(lt, 0, Math.max(4, dur));
          sun.setAttribute('cy', f1(sy)); sunPool.e.setAttribute('cy', f1(sy));
          let wd = '';
          for (let i = 0; i < 14; i++) { const x = ((i * 151 + lt * 14) % 2040) - 60; wd += `M${f1(x)} ${f1(526 + (i % 3) * 7)}l${30 + (i % 4) * 10} 0`; }
          water.setAttribute('d', wd);
          drawP(ml, BTL.ease(lt, 0, 1.6));
          figs.forEach((f, i) => {
            let a = BTL.ease(lt, 0.3 + i * 0.12, 1), dx = 0;
            if (mode === 'paydos') { const w = BTL.ease(lt, th + (i % 4) * 0.2, Math.max(2.5, dur - th)); dx = -(160 + 30 * (i % 3)) * w; a *= 1 - 0.85 * w; }
            if (mode === 'calvert' || mode === 'two') dx = 0;
            f.e.setAttribute('transform', `translate(${f1(f.x + dx)} ${f1(f.y + (mode === 'paydos' ? -dx * 0.25 : 0))})`);
            fade(f.e, a);
          });
          if (boss) { fade(boss, BTL.ease(lt, th, 1.2)); gl.set(0.5 * BTL.ease(lt, th + 0.6, 1.6) * (0.85 + 0.15 * Math.sin(lt * 1.1))); }
          if (lab) fade(lab, BTL.ease(lt, mode === 'scar' ? th - 0.3 : 0.8, 1.2));
          if (sub) fade(sub, BTL.ease(lt, 1.4, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_section
  const SURF = x => 540 - 262 * Math.exp(-(((x - 960) / 560) ** 2));
  const BASE = 880;
  const BND = (k, x) => k === 9 ? SURF(x) : BASE - (BASE - SURF(x)) * k / 9 + (k > 0 ? 5 * Math.sin(x / 140 + k * 1.7) : 0);
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  const TRENCH = { l: 770, r: 1150, bl: 862, br: 1058 };
  SH.bt_tr_section = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'layers', { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.5 });
      const line = (k, x0 = -60, x1 = 1980, st = 40) => { let d = ''; for (let x = x0; x <= x1; x += st) d += (x === x0 ? 'M' : 'L') + f1(x) + ' ' + f1(BND(k, x)); return d; };
      const band = i => { let d = line(i + 1); for (let x = 1980; x >= -60; x -= 40) d += 'L' + f1(x) + ' ' + f1(BND(i, x)); return d + 'Z'; };
      const tints = [0.12, 0.42, 0.22, 0.32, 0.16, 0.46, 0.36, 0.2, 0.28];
      // natural soil below, then the nine strata
      P0(g, `M-60 ${BASE}L1980 ${BASE}L1980 1200L-60 1200Z`, mix(C.paperDark, C.inkSoft, 0.28), 1);
      const fills = [], outl = [];
      for (let i = 0; i < 9; i++) fills.push(P0(g, band(i), EARTH(tints[i]), 1));
      for (let k = 1; k < 9; k++) L0(g, line(k), C.inkSoft, 1.8, 0.6);
      // burnt layers (II, VIIa): a dark ash line under their top
      const ash = k => { let d = ''; for (let x = -60; x <= 1980; x += 40) d += (x === -60 ? 'M' : 'L') + f1(x) + ' ' + f1(BND(k + 1, x) + 0.25 * (BND(k, x) - BND(k + 1, x))); return d; };
      L0(g, ash(1), mix(C.ink, C.paperDark, 0.3), 4, 0.6, { 'stroke-dasharray': '18 10' });
      L0(g, ash(6), mix(C.ink, C.paperDark, 0.3), 4, 0.6, { 'stroke-dasharray': '18 10' });
      // wall stubs: in the trench (gIn) or outside it
      const r = rng(31), gIn = el(g, 'g'), gOut = el(g, 'g'), ghost = el(g, 'g', { opacity: 0 });
      for (let i = 1; i < 9; i++) for (let j = 0; j < 6; j++) {
        const x = 180 + j * 290 + (r() - 0.5) * 140, w = 40 + r() * 60;
        const yb = BND(i, x + w / 2), yt = BND(i + 1, x + w / 2), h = (yb - yt) * (0.5 + r() * 0.25);
        if (yb - yt < 30 || (x + w > 1330 && x < 1470) || x + w > 1700) continue;
        const d = `M${f1(x)} ${f1(yb - 3)}L${f1(x)} ${f1(yb - h)}L${f1(x + w)} ${f1(yb - h + 3)}L${f1(x + w)} ${f1(yb - 3)}Z`;
        const sd = `M${f1(x)} ${f1(yb - h / 2)}L${f1(x + w)} ${f1(yb - h / 2)}M${f1(x + w * 0.45)} ${f1(yb - h)}L${f1(x + w * 0.45)} ${f1(yb - h / 2)}`;
        const inside = x + w > TRENCH.l + 20 && x < TRENCH.r - 20 && i >= 2;
        const pg = inside ? gIn : gOut;
        P0(pg, d, C.paperLight, 0.85); L0(pg, d, C.inkSoft, 2, 0.9); L0(pg, sd, C.inkSoft, 1.4, 0.7);
        if (inside) L0(ghost, d, C.inkSoft, 2, 0.8, { 'stroke-dasharray': '6 8' });
      }
      // surface + grass
      const surf = L0(g, line(9, -60, 1980, 20), C.ink, 3, 1);
      let grass = '';
      for (let x = -40; x < 1960; x += 22) { const y = SURF(x); grass += `M${f1(x)} ${f1(y)}l${f1(-3 + (x % 7))} -${f1(9 + (x % 5) * 2)}`; }
      L0(g, grass, C.inkSoft, 1.5, 0.6);
      // the trench
      let tr = '';
      for (let x = TRENCH.l; x <= TRENCH.r; x += 20) tr += (x === TRENCH.l ? 'M' : 'L') + f1(x) + ' ' + f1(SURF(x));
      const trB = `L${TRENCH.br} ${f1(BND(2, TRENCH.br))}L${TRENCH.bl} ${f1(BND(2, TRENCH.bl))}Z`;
      const useTrench = ['trench', 'burnt', 'glow', 'two'].includes(mode);
      const cutFill = P0(g, tr + trB, mix(C.paper, C.paperDark, 0.25), useTrench ? 1 : 0, { opacity: 0 });
      const cutLine = L0(g, `M${TRENCH.l} ${f1(SURF(TRENCH.l))}L${TRENCH.bl} ${f1(BND(2, TRENCH.bl))}L${TRENCH.br} ${f1(BND(2, TRENCH.br))}L${TRENCH.r} ${f1(SURF(TRENCH.r))}`, C.ink, 3, useTrench ? 1 : 0, { 'stroke-dasharray': '14 10' });
      const dustG = el(g, 'g'), dm = motes(dustG, 11, 12, [TRENCH.l + 30, 330, TRENCH.r - 30, BND(2, 960) - 10], { alpha: 0.35 });
      // gold in Troy II, under the trench floor
      const gy = (BND(1, 960) + BND(2, 960)) / 2;
      const pool = BTL.glow(svg, defs, 960, gy, mode === 'glow' ? 300 : 200, C.gold, 0, g);
      const gd = diadem(g, 960, gy - 18, mode === 'glow' ? 0.2 : 0.15, { seed: 9 });
      // highlights: a gold outline per stratum
      const hl = [];
      for (let i = 0; i < 9; i++) hl.push(L0(g, band(i), C.gold, 4, 1, { opacity: 0 }));
      const nums = ROMAN.map((s, i) => { const y = (BND(i, 1400) + BND(i + 1, 1400)) / 2 + 15; return txt(g, s, 1400, y, 42, { font: FR, italic: false, weight: 500 }); });
      const midY = (i, x) => (BND(i, x) + BND(i + 1, x)) / 2;
      const labs = [];
      const lab = (s, i, x, at, o = {}) => { const e = txt(g, s, x, midY(i, x) + 16, o.size || 52, { anchor: o.anchor || 'start', color: o.color || C.ink }); labs.push({ e, at }); return e; };
      if (mode === 'two') { lab('Troya II · altın', 1, 1190, 'a', { color: C.ink }); lab("Homeros'un Troya'sı?", 6, 1190, 'b'); }
      if (mode === 'agora') lab(P.label || '≈ 2.800 yıl', 7, 1250, 'hit');
      if (mode === 'burnt') lab(P.label || 'yanmış şehir', 1, 1190, 'hit');
      if (mode === 'trench' && P.label) lab(P.label, 5, 1190, 'hit');
      let span = null, sl0 = null, sl1 = null;
      if (mode === 'span') {
        span = L0(g, `M1790 ${BASE - 6}L1790 ${f1(SURF(1790) + 6)}`, C.gold, 5, 1);
        sl0 = txt(g, P.from || '≈ MÖ 3000', 1765, (BND(0, 1700) + BND(1, 1700)) / 2 + 14, 44, { anchor: 'end' });
        sl1 = txt(g, P.to || '≈ MS 500', 1765, SURF(1640) - 40, 44, { anchor: 'end' });
      }
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.45), ta = cue(cues, 'a', dur * 0.3), tb = cue(cues, 'b', dur * 0.6);
          drawP(surf, BTL.ease(lt, 0, 1.4));
          dm.update(lt, useTrench ? 1 : 0.5);
          // trench
          if (mode === 'trench') {
            const cutAt = P.cut === 'done' ? -10 : P.cut ? th : 1e9;
            const q = BTL.ease(lt, cutAt, 1.0);
            fade(cutLine, BTL.ease(lt, 0.6, 1.2)); fade(cutFill, q); fade(gIn, 1 - q); fade(ghost, 0.8 * q);
          } else if (useTrench) { fade(cutLine, 1); fade(cutFill, 1); fade(gIn, 0); fade(ghost, 0.6); }
          else { fade(cutLine, 0); fade(cutFill, 0); }
          // the strata themselves
          if (mode === 'hidden') {
            fills.forEach((e, i) => e.setAttribute('fill', mix(EARTH(0.28), EARTH(tints[i]), BTL.ease(lt, th + i * 0.15, 1.2))));
            fade(gOut, BTL.ease(lt, th + 0.6, 1.6)); fade(gIn, BTL.ease(lt, th + 0.6, 1.6));
          }
          // gold
          const showGold = ['two', 'glow', 'burnt'].includes(mode) || (mode === 'trench' && P.gold);
          const gq = showGold ? BTL.ease(lt, mode === 'two' ? ta - 0.4 : 0.4, 1.6) : 0;
          gd.D.reveal(gq); gd.update(lt); fade(gd.g, gq);
          pool.set(gq * (mode === 'glow' ? 0.6 : 0.4) * (0.88 + 0.12 * Math.sin(lt * 0.9)));
          // highlights
          hl.forEach((e, i) => {
            let a = 0;
            if (mode === 'two') a = i === 1 ? BTL.ease(lt, ta, 1) : (i === 5 || i === 6) ? BTL.ease(lt, tb, 1) * 0.9 : 0;
            if (mode === 'agora') a = i === 7 ? BTL.ease(lt, th, 1.2) : 0;
            if (mode === 'burnt') a = i === 1 ? BTL.ease(lt, th, 1.2) : 0;
            if (mode === 'trench' && P.hl) a = P.hl.includes(i) ? BTL.ease(lt, th, 1.2) : 0;
            if (mode === 'layers') a = 0.85 * BTL.ease(lt, th + i * 0.32, 0.6) * (1 - BTL.ease(lt, th + i * 0.32 + 0.9, 0.8));
            if (mode === 'all') a = BTL.ease(lt, th + i * 0.28, 0.6) * (0.55 + 0.45 * (i === 8 ? 1 : 1 - BTL.ease(lt, th + i * 0.28 + 1, 1)));
            fade(e, a);
          });
          nums.forEach((e, i) => {
            const on = mode === 'layers' ? BTL.ease(lt, th + i * 0.32, 0.7) : (mode === 'span' || mode === 'all') ? BTL.ease(lt, 0.3 + i * 0.08, 0.8) : 0;
            fade(e, on);
          });
          labs.forEach(l => fade(l.e, BTL.ease(lt, cue(cues, l.at, dur * 0.5) + 0.1, 1)));
          if (span) { drawP(span, BTL.ease(lt, th, 2.2)); fade(sl0, BTL.ease(lt, th - 0.2, 1)); fade(sl1, BTL.ease(lt, th + 1.6, 1)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_diadem
  SH.bt_tr_diadem = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'show', { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.4 });
      const caseM = mode === 'case' || mode === 'gone', port = mode === 'portrait';
      const cx = port ? 860 : caseM ? 860 : 960;
      const pool = BTL.glow(svg, defs, cx, port ? 520 : 470, port ? 460 : 560, C.stain, 0.3, g);
      let frame = null, bust = null, glass = null, plinth = null;
      if (port) {
        frame = BTL.drawing(g);
        frame.f(BTL.E(cx, 520, 270, 350), C.paperLight, 1);
        frame.s(BTL.E(cx, 520, 270, 350), { w: 3, color: C.inkSoft });
        frame.s(BTL.E(cx, 520, 250, 330), { w: 1.5, color: C.inkSoft });
        bust = el(g, 'g');
        const col = FIG();
        P0(bust, `M${cx - 210} 860C${cx - 200} 720 ${cx - 120} 690 ${cx - 50} 668L${cx - 40} 600L${cx + 40} 600L${cx + 50} 668C${cx + 120} 690 ${cx + 200} 720 ${cx + 210} 860Z`, col, 1);
        P0(bust, BTL.E(cx, 470, 92, 118), col, 1);
        P0(bust, `M${cx - 96} 440C${cx - 110} 330 ${cx - 40} 320 ${cx} 330C${cx + 60} 320 ${cx + 110} 340 ${cx + 98} 450C${cx + 70} 390 ${cx - 60} 380 ${cx - 96} 440Z`, col, 1);
      }
      if (caseM) {
        plinth = BTL.drawing(g);
        plinth.f(`M${cx - 230} 770L${cx + 230} 770L${cx + 230} 900L${cx - 230} 900Z`, C.paperLight, 1);
        plinth.s(`M${cx - 230} 770L${cx + 230} 770L${cx + 230} 900L${cx - 230} 900Z`, { w: 3 });
        plinth.s(`M${cx - 250} 770L${cx + 250} 770`, { w: 4 });
        glass = BTL.drawing(g);
        glass.s(`M${cx - 250} 770L${cx - 250} 250L${cx + 250} 250L${cx + 250} 770`, { w: 2.5, color: C.inkSoft });
        glass.s(`M${cx - 200} 320L${cx - 120} 240M${cx - 200} 400L${cx - 60} 260`, { w: 2, color: C.inkSoft, alpha: 0.5 });
      }
      const k = port ? 0.5 : caseM ? 0.7 : 1.1;
      const dy = port ? 372 : caseM ? 330 : 330;
      const dd = diadem(g, cx, dy, k, { seed: 3 });
      const ghost = el(g, 'g', { opacity: 0 });
      if (mode === 'lost' || mode === 'gone') {
        const gg = el(ghost, 'g', { transform: `translate(${cx} ${dy}) scale(${k})` });
        L0(gg, 'M-282 14Q0 -14 282 14', C.inkSoft, 3, 0.9, { 'stroke-dasharray': '8 10' });
        let d = '';
        for (let i = -8; i <= 8; i += 2) d += `M${i * 17} 10L${i * 17} 130`;
        for (const s of [-1, 1]) for (let j = 0; j < 7; j += 2) d += `M${s * (170 + j * 15)} 20L${s * (170 + j * 15)} 330`;
        L0(gg, d, C.inkSoft, 2, 0.7, { 'stroke-dasharray': '6 10' });
      }
      const q = mode === 'lost' ? txt(g, '?', cx, 560, 160, { font: FR, italic: false, weight: 300, color: C.inkSoft, halo: false }) : null;
      const lx = port || caseM ? 1180 : cx, ly = port || caseM ? 520 : 850, an = port || caseM ? 'start' : 'middle';
      const lab = P.label ? txt(g, P.label, lx, ly, 52, { font: FR, italic: false, anchor: an }) : null;
      const sub = P.sub ? txt(g, P.sub, lx, ly + 66, 48, { color: mix(C.ink, C.inkSoft, 0.35), anchor: an }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          if (frame) frame.reveal(BTL.ease(lt, 0, 1.6));
          if (bust) fade(bust, BTL.ease(lt, 0.4, 1.4));
          if (plinth) { plinth.reveal(BTL.ease(lt, 0, 1.4)); glass.reveal(BTL.ease(lt, 0.3, 1.6)); }
          const rv = BTL.ease(lt, port ? 0.8 : caseM ? 0.6 : 0.1, 2.6);
          dd.D.reveal(rv); dd.update(lt);
          let a = 1;
          if (mode === 'lost' || mode === 'gone') { const lq = BTL.ease(lt, th, 2); a = 1 - lq; fade(ghost, lq); if (q) fade(q, BTL.ease(lt, th + 1, 1.4)); }
          fade(dd.g, a);
          pool.set(((mode === 'show' ? 0.5 : 0.24) + 0.06 * Math.sin(lt * 0.8)) * (mode === 'gone' ? 1 - 0.6 * BTL.ease(lt, th, 2) : mode === 'lost' ? 1 - 0.5 * BTL.ease(lt, th, 2) : 1) * BTL.ease(lt, 0, 1.2));
          if (lab) fade(lab, BTL.ease(lt, 1.2, 1.2));
          if (sub) fade(sub, BTL.ease(lt, 1.8, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tr_hoard
  SH.bt_tr_hoard = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.0 });
      const labels = P.labels || ['taç', 'küpe', 'kupa', 'boncuk'];
      const xs = [380, 800, 1170, 1560], y = 470;
      const items = [];
      // 0: diadem
      const gl0 = BTL.glow(svg, defs, xs[0], y + 30, 260, C.stain, 0, g);
      const d0 = diadem(g, xs[0], y - 130, 0.55, { seed: 12 });
      items.push({ draw: p => { d0.D.reveal(p); }, gl: gl0, u: d0 });
      // 1: basket earring: a crescent cup with a fringe of short chains
      const gl1 = BTL.glow(svg, defs, xs[1], y + 30, 220, C.stain, 0, g);
      const D1 = BTL.drawing(el(g, 'g', { transform: `translate(${xs[1]} ${y - 40})` }));
      D1.f('M-90-60Q0 60 90-60Q60 10 0 14Q-60 10-90-60Z', C.gold, 0.9);
      D1.s('M-90-60Q0 60 90-60Q60 10 0 14Q-60 10-90-60Z', { w: 3, color: C.gold });
      D1.s('M0-60Q-30-140 0-170Q30-140 0-60', { w: 3, color: C.gold });
      for (let i = -3; i <= 3; i++) D1.s(`M${i * 22} ${f1(20 - Math.abs(i) * 6)}L${i * 22} ${f1(150 - Math.abs(i) * 10)}`, { w: 2, color: C.gold });
      let lv = ''; for (let i = -3; i <= 3; i++) lv += BTL.E(i * 22, 160 - Math.abs(i) * 10, 6, 11);
      D1.f(lv, C.gold, 1);
      items.push({ draw: p => D1.reveal(p), gl: gl1 });
      // 2: the two-handled cup (depas)
      const gl2 = BTL.glow(svg, defs, xs[2], y + 30, 240, C.stain, 0, g);
      const D2 = BTL.drawing(el(g, 'g', { transform: `translate(${xs[2]} ${y})` }));
      const cupD = 'M-70-150L70-150Q80-40 40 60L36 120L-36 120L-40 60Q-80-40-70-150Z';
      D2.f(cupD, C.gold, 0.85); D2.s(cupD, { w: 3, color: C.ink });
      D2.s('M-74-120C-170-120-170 20-48 40M74-120C170-120 170 20 48 40', { w: 6, color: C.gold });
      D2.s('M-60-110L60-110', { w: 2, color: C.paperLight });
      items.push({ draw: p => D2.reveal(p), gl: gl2 });
      // 3: a heap of beads
      const gl3 = BTL.glow(svg, defs, xs[3], y + 40, 240, C.stain, 0, g);
      const D3 = BTL.drawing(el(g, 'g', { transform: `translate(${xs[3]} ${y + 40})` }));
      const r = rng(77); let bd = '';
      for (let i = 0; i < 70; i++) { const a = r() * TAU, rr = Math.sqrt(r()) * 110, bx = Math.cos(a) * rr * 1.3, by = Math.sin(a) * rr * 0.55 - (110 - rr) * 0.5; bd += BTL.E(bx, by, 8, 8); }
      D3.f(bd, C.gold, 0.95); D3.s(bd, { w: 1.5, color: C.ink, alpha: 0.6 });
      items.push({ draw: p => D3.reveal(p), gl: gl3 });
      const labs = labels.map((s, i) => txt(g, s, xs[i], 760, 46, { color: C.inkSoft }));
      return {
        update(lt, dur, cues) {
          items.forEach((it, i) => {
            const at = i === 0 ? Math.min(cue(cues, 'c0', 0.4), 0.4) : cue(cues, 'c' + i, 0.4 + i * dur * 0.2);
            it.draw(BTL.ease(lt, at - 0.3, 1.8));
            it.gl.set(0.3 * BTL.ease(lt, at, 1.2) * (0.85 + 0.15 * Math.sin(lt * 0.9 + i)));
            fade(labs[i], BTL.ease(lt, at + 0.3, 1));
          });
          d0.update(lt);
        },
      };
    },
  };
})();
