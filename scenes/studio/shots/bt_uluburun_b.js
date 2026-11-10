// bt_uluburun_b: the cargo of the Uluburun wreck, one object per frame in a light pool (docs/BELGESEL.md).
// Uses the shared drawings in window.ULB (bt_uluburun.js). Strokes draw themselves in once, then stand still.
//   bt_ul_ingot  P: {mode: "sketch"|"one"|"hide"|"count", label, sub, n: 354, from}  cues: hit, from (count: the origin, e.g. "Kıbrıs")
//                sketch: the described shape in thin lines, its four ears in gold ("metal biscuits with ears"); one: the copper oxhide
//                ingot, its four ears turn gold on hit; hide: a dashed ox hide outline is drawn round it on hit;
//                count: a stack of ingots on the left, a number counts up to n on the right (+ unit)
//   bt_ul_relic  P: {obj: "tin"|"sword"|"glass"|"scarab"|"weights", label, sub, close}  cues: hit (label / accent)
//                scarab: hit shows the cartouche beside the beetle
//   bt_ul_goods  P: {items: ["ebony"|"tusk"|"hippo"|"egg"|"amber", ...]}  cues: a, b, c (one per item)
//   bt_ul_alloy  cues: a (nine copper ingots), b (one tin ingot), c (= bronze sword)
//   bt_ul_tablet P: {mode: "open"|"wax", label}  cues: hit   the folding boxwood writing board with its ivory hinge;
//                open: it unfolds; wax: open, faint lines in the wax fade away on hit
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const ital = (g, s, x, y, size = 48, o = {}) => label(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft, weight: 400 }, o));
  const place = (parent, x, y, s = 1, rot = 0) => el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})` });
  const U = () => window.ULB;

  // ------------------------------------------------------------------ object drawings (origin = centre)
  const OB = {};
  OB.tin = D => {   // a plano-convex "bun" ingot of tin, grey, seen at an angle
    D.f('M-260 20C-260 90 260 90 260 20L260 50C260 130-260 130-260 50Z', C.paperDark, 1);
    D.f('M-260 20C-260-110 260-110 260 20C260 90-260 90-260 20Z', C.paperLight, 1);
    D.f('M-260 20C-260-110 260-110 260 20C260 90-260 90-260 20Z', C.inkSoft, 0.28);
    D.s('M-260 20C-260-110 260-110 260 20C260 90-260 90-260 20Z', { w: 4 });
    D.s('M-260 20L-260 50C-260 130 260 130 260 50L260 20', { w: 3, color: C.inkSoft });
    D.s('M-170-30C-100-60 60-64 150-34M-120 20C-40 4 60 6 130 22', { w: 1.8, color: C.inkSoft, alpha: 0.7 });
  };
  OB.sword = D => {   // a long bronze sword with a midrib, flanged hilt and rivets, lying horizontally
    const blade = 'M-160-26L330-12L400 0L330 12L-160 26Z';
    D.f(blade, C.paperLight, 1); D.f(blade, C.gold, 0.22);
    D.s(blade, { w: 4, color: C.gold });
    D.s('M-160 0L380 0', { w: 2, color: C.inkSoft });
    const hilt = 'M-170-60L-150-60L-150 60L-170 60ZM-380-18L-170-18L-170 18L-380 18ZM-420-34C-440-34-440 34-420 34L-380 34L-380-34Z';
    D.f(hilt, C.paperLight, 1); D.s(hilt, { w: 3.5 });
    D.s(BTL.E(-320, 0, 7, 7) + BTL.E(-260, 0, 7, 7) + BTL.E(-200, 0, 7, 7), { w: 2.5, color: C.gold });
  };
  OB.glass = (D, k = 1, a = 0.75) => {   // a discoid raw-glass ingot, cobalt blue
    const top = BTL.E(0, -20 * k, 220 * k, 70 * k);
    D.f(`M${-220 * k} ${-20 * k}L${-220 * k} ${30 * k}C${-220 * k} ${120 * k} ${220 * k} ${120 * k} ${220 * k} ${30 * k}L${220 * k} ${-20 * k}Z`, C.blue, a * 0.7);
    D.f(top, C.blue, a);
    D.s(top, { w: 3.5 });
    D.s(`M${-220 * k} ${-20 * k}L${-220 * k} ${30 * k}C${-220 * k} ${120 * k} ${220 * k} ${120 * k} ${220 * k} ${30 * k}L${220 * k} ${-20 * k}`, { w: 3, color: C.inkSoft });
    D.s(`M${-120 * k} ${-50 * k}C${-60 * k} ${-70 * k} ${20 * k} ${-72 * k} ${80 * k} ${-62 * k}`, { w: 3, color: C.ink, alpha: 0.7 });
  };
  OB.scarab = D => {   // a gold scarab seen from above: head, thorax, wing cases
    const body = 'M0-170C90-170 130-80 130 20C130 120 70 190 0 190C-70 190-130 120-130 20C-130-80-90-170 0-170Z';
    D.f(body, C.paperLight, 1); D.f(body, C.gold, 0.4);
    D.s(body, { w: 4, color: C.gold });
    D.s('M-120-60C-60-40 60-40 120-60M0-48L0 186', { w: 3, color: C.gold });
    D.f('M-60-170C-60-230 60-230 60-170Z', C.gold, 0.5); D.s('M-60-170C-60-230 60-230 60-170', { w: 3.5, color: C.gold });
    D.s('M-126-20L-190-50M-128 60L-196 80M-120 130L-180 180M126-20L190-50M128 60L196 80M120 130L180 180', { w: 3.5, color: C.gold });
    D.s('M-70 20C-50 60-50 110-70 150M70 20C50 60 50 110 70 150', { w: 1.8, color: C.inkSoft, alpha: 0.8 });
  };
  OB.weights = D => {   // a row of graded sphendonoid balance weights under a simple balance
    let x = -300;
    for (const s of [1, 0.82, 0.66, 0.52, 0.4, 0.3]) {
      const w = 70 * s, h = 46 * s, d = `M${f1(x - w)} 120C${f1(x - w)} ${f1(120 - h * 1.6)} ${f1(x + w)} ${f1(120 - h * 1.6)} ${f1(x + w)} 120Z`;
      D.f(d, C.paperLight, 1); D.f(d, C.gold, 0.18); D.s(d, { w: 3 });
      x += w + 70 * (s * 0.82) + 26;
    }
    D.s('M0-60L0-250M-260-200L260-200M-260-200L-300-110M-260-200L-220-110M260-200L220-110M260-200L300-110M-310-110C-300-80-220-80-210-110ZM210-110C220-80 300-80 310-110Z', { w: 3, color: C.inkSoft });
    D.s('M-40-250L40-250', { w: 4 });
  };
  OB.ebony = D => {   // a short log of African blackwood
    D.f('M-260-50L230-60C270-60 270 60 230 60L-260 50Z', C.paperDark, 1);
    D.s('M-260-50L230-60C270-60 270 60 230 60L-260 50', { w: 3.5 });
    D.f(BTL.E(-260, 0, 26, 50), C.paperLight, 1); D.s(BTL.E(-260, 0, 26, 50), { w: 3 });
    D.s(BTL.E(-260, 0, 14, 28) + BTL.E(-260, 0, 5, 10), { w: 1.6, color: C.inkSoft });
    D.s('M-200-20C-60-28 80-30 220-30M-180 22C-40 16 100 18 220 26', { w: 1.6, color: C.inkSoft, alpha: 0.8 });
  };
  OB.tusk = D => {   // an elephant tusk section, curved
    const d = 'M-260 60C-120-80 100-140 280-120L282-80C120-90-80-30-230 96Z';
    D.f(d, C.paperLight, 1); D.f(d, C.ink, 0.22); D.s(d, { w: 3.5 });
    D.f(BTL.E(-245, 78, 20, 26), C.paper, 1); D.s(BTL.E(-245, 78, 20, 26), { w: 2.5, color: C.inkSoft });
    D.s('M-180 30C-60-50 80-90 240-100', { w: 1.6, color: C.inkSoft, alpha: 0.7 });
  };
  OB.hippo = D => {   // a hippopotamus canine: a thick curved crescent
    const d = 'M-190 110C-200-50-80-200 110-210C190-212 214-170 190-144C50-144-70-50-110 110Z';
    D.f(d, C.paperLight, 1); D.f(d, C.ink, 0.22); D.s(d, { w: 3.5 });
    D.s('M-150 80C-140-40-40-150 130-170', { w: 1.6, color: C.inkSoft, alpha: 0.7 });
  };
  OB.egg = D => {   // an ostrich egg
    const d = BTL.E(0, 0, 130, 160);
    D.f(d, C.paperLight, 1); D.s(d, { w: 3.5 });
    const r = rng(41); let p = '';
    for (let i = 0; i < 40; i++) { const a = r() * 6.28, q = Math.sqrt(r()) * 0.86, x = Math.cos(a) * 130 * q, y = Math.sin(a) * 160 * q; p += BTL.E(x, y, 2.5, 2.5); }
    D.s(p, { w: 1.6, color: C.inkSoft, alpha: 0.7 });
    D.s('M-80-90C-50-120 0-130 30-126', { w: 2.5, color: C.inkSoft });
  };
  OB.amber = D => {   // a short string of amber beads
    D.s('M-280-40C-140 80 140 80 280-40', { w: 1.6, color: C.inkSoft });
    for (let i = 0; i <= 8; i++) {
      const u = i / 8, x = -280 + 560 * u, y = -40 + 4 * 120 * u * (1 - u) * 0.5 * 2, r = 30 - Math.abs(u - 0.5) * 18;
      D.f(BTL.E(x, y, r, r * 0.9), C.gold, 0.55); D.s(BTL.E(x, y, r, r * 0.9), { w: 2.5, color: C.gold });
    }
  };

  // ------------------------------------------------------------------ the ingot
  SH.bt_ul_ingot = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'one', portrait = H > W, g = el(svg, 'g');
      const count = mode === 'count';
      const cx = count ? (portrait ? W / 2 : 680) : W / 2, cy = portrait ? 600 : (count ? 470 : 450);
      const gl = BTL.glow(svg, defs, cx, cy, 520, C.stain, 0.18, g);
      const hot = BTL.glow(svg, defs, cx, cy, 420, C.gold, 0, g);
      let D = null, sketch = null, hide = null, ears = null, stack = [];
      if (mode === 'sketch') {
        // no paper: the shape Çakır described, drawn in thin lines in the dark, its four ears pointed out
        const sg = place(g, cx, cy, portrait ? 0.9 : 1, 0);
        sketch = BTL.drawing(place(sg, 0, -10, 0.85));
        sketch.s(U().ingotD, { w: 3, color: C.ink });
        sketch.s(U().ingotPath(1, 0, 0.94), { w: 1.6, color: C.inkSoft, alpha: 0.6 });
        sketch.s(U().earsPath(1, 0), { w: 6, color: C.gold });
        sketch.s('M-470-300L-370-235M-370-235L-396-240M-370-235L-382-259M470-300L370-235M370-235L396-240M370-235L382-259' +
          'M-470 300L-370 235M-370 235L-396 240M-370 235L-382 259M470 300L370 235M370 235L396 240M370 235L382 259', { w: 2.4, color: C.gold });
      } else if (count) {
        for (let r = 0; r < 5; r++) {
          const sg = el(g, 'g', { opacity: 0 });
          for (let c = 0; c < 3; c++) U().ingotMini(sg, cx - 220 + c * 220 + (r % 2) * 40, cy + 200 - r * 70, 1.55, { w: 2.6 });
          stack.push(sg);
        }
      } else {
        D = BTL.drawing(place(g, cx, cy, portrait ? 1 : 1.12));
        U().ingot(D, { seed: 7 });
        const eg = place(g, cx, cy, portrait ? 1 : 1.12);
        ears = L0(eg, U().earsPath(0.58, 0), C.gold, 9, 0);
        if (mode === 'hide') {
          hide = L0(eg, U().ingotPath(0.58, 0, 1.3, 8), C.gold, 3, 1, { pathLength: 1 });
          draw(hide, 0);
        }
      }
      const tx = count ? (portrait ? W / 2 : 1420) : W / 2;
      const num = count ? label(g, '0', tx, portrait ? 1050 : 500, 220, { color: C.gold }) : null;
      const lab = P.label ? (count ? ital(g, P.label, tx, portrait ? 1110 : 590, 54, { color: C.ink })
        : ital(g, P.label, W / 2, portrait ? 1060 : (mode === 'sketch' ? 870 : 880), 52, { color: mode === 'sketch' ? C.gold : C.ink })) : null;
      const sub = P.sub ? ital(g, P.sub, tx, count ? (portrait ? 1170 : 660) : (portrait ? 1120 : 940), 46) : null;
      const from = count && P.from ? label(g, P.from, tx, portrait ? 1250 : 780, 64, { color: C.gold, weight: 400 }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          gl.set(0.16 + 0.03 * Math.sin(lt * 0.7));
          if (sketch) sketch.reveal(BTL.ease(lt, 0, 3.2));
          if (D) D.reveal(BTL.ease(lt, 0, 2.6));
          if (ears) ears.setAttribute('stroke-opacity', (mode === 'one' ? BTL.ease(lt, th, 1.2) : 0).toFixed(3));
          if (hide) draw(hide, BTL.ease(lt, th, 2.4));
          if (count) {
            stack.forEach((s, i) => fade(s, BTL.ease(lt, 0.2 + i * 0.35, 0.9)));
            const n = P.n || 354; num.textContent = String(Math.round(n * BTL.ease(lt, 0.4, Math.min(3, Math.max(1.5, th - 0.4)))));
            fade(num, BTL.ease(lt, 0.3, 0.6));
            if (from) fade(from, BTL.ease(lt, cue(cues, 'from', dur * 0.8) - 0.2, 0.8));
          }
          hot.set(mode === 'one' ? 0.18 * BTL.ease(lt, th, 1.4) : 0);
          if (lab) fade(lab, BTL.ease(lt, count ? 0.8 : (mode === 'sketch' ? cue(cues, 'hit', 1.6) : th + 0.2), 1.2));
          if (sub) fade(sub, BTL.ease(lt, count ? th - 0.5 : th + 0.8, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ one object on a plinth of light
  SH.bt_ul_relic = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const obj = P.obj || 'tin', portrait = H > W, g = el(svg, 'g');
      const scarab = obj === 'scarab';
      const cx = scarab && !portrait ? 760 : W / 2, cy = portrait ? 600 : 440;
      const gl = BTL.glow(svg, defs, cx, cy, 520, C.stain, 0.2, g);
      const hot = BTL.glow(svg, defs, cx, cy, 300, C.gold, 0, g);
      const k = (P.scale || 1) * (portrait ? 0.9 : 1.1);
      const extra = [];
      if (obj === 'glass') {   // two more discs behind the first
        for (const [x, y, s] of [[-250, -120, 0.62], [240, -110, 0.56]]) { const E = BTL.drawing(place(g, cx + x, cy + y, s * k)); OB.glass(E, 1, 0.45); extra.push(E); }
      }
      const D = BTL.drawing(place(g, cx, cy + (obj === 'glass' ? 40 : 0), k));
      (obj === 'glass' ? d => OB.glass(d) : OB[obj] || OB.tin)(D);
      let cart = null;
      if (scarab && P.cart !== false) {   // the cartouche with simple glyphs, to the right of the beetle
        cart = el(g, 'g', { opacity: 0 });
        const x = portrait ? W / 2 : 1240, y = portrait ? 980 : 430, h = portrait ? 120 : 250;
        const box = `M${x - 70} ${y - h}C${x - 70} ${y - h - 50} ${x + 70} ${y - h - 50} ${x + 70} ${y - h}L${x + 70} ${y + h}C${x + 70} ${y + h + 50} ${x - 70} ${y + h + 50} ${x - 70} ${y + h}Z`;
        P0(cart, box, C.paperLight, 1); L0(cart, box, C.gold, 4); L0(cart, `M${x - 90} ${y + h + 56}L${x + 90} ${y + h + 56}`, C.gold, 4);
        const gs = portrait ? 0.5 : 1;
        L0(cart, `M${x - 36} ${y - 190 * gs}L${x + 36} ${y - 190 * gs}M${x} ${y - 220 * gs}L${x} ${y - 140 * gs}` +
          `M${x - 30} ${y - 90 * gs}C${x - 30} ${y - 130 * gs} ${x + 30} ${y - 130 * gs} ${x + 30} ${y - 90 * gs}Z` +
          `M${x - 40} ${y}L${x + 40} ${y}M${x - 26} ${y + 30 * gs}L${x + 26} ${y + 30 * gs}` +
          `M${x - 30} ${y + 120 * gs}C${x - 10} ${y + 80 * gs} ${x + 10} ${y + 160 * gs} ${x + 30} ${y + 120 * gs}M${x} ${y + 190 * gs}l0 ${-40 * gs}`, C.ink, 3);
      }
      const ly = portrait ? 1080 : 810;
      const lab = P.label ? (scarab && !portrait ? ital(g, P.label, 1240, 800, 54, { color: C.gold }) : ital(g, P.label, W / 2, ly, 54, { color: C.ink })) : null;
      const sub = P.sub ? ital(g, P.sub, scarab && !portrait ? 1240 : W / 2, scarab && !portrait ? 860 : ly + 58, 44) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.55);
          extra.forEach(E => E.reveal(BTL.ease(lt, 0.6, 2.2)));
          D.reveal(BTL.ease(lt, 0, Math.max(0.9, Math.min(2.6, th - 0.2))));
          gl.set(0.18 + 0.03 * Math.sin(lt * 0.7));
          hot.set((obj === 'scarab' || obj === 'sword' ? 0.2 : 0.08) * BTL.ease(lt, th, 1.4) + (scarab ? 0.04 * Math.sin(lt * 0.9) : 0));
          if (cart) fade(cart, BTL.ease(lt, th - 0.2, 1.4));
          if (lab) fade(lab, BTL.ease(lt, th, 1.2)); if (sub) fade(sub, BTL.ease(lt, th + 0.7, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ several goods appear one by one
  SH.bt_ul_goods = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const items = P.items || ['ebony', 'tusk'], portrait = H > W, g = el(svg, 'g'), n = items.length;
      const LAB = { ebony: 'abanoz', tusk: 'fil dişi', hippo: 'su aygırı dişi', egg: 'deve kuşu yumurtası', amber: 'kehribar' };
      const list = items.map((it, i) => {
        const x = portrait ? W / 2 : W / 2 + (i - (n - 1) / 2) * (W / (n + 0.3)), y = portrait ? 380 + i * 360 : 450;
        const gl = BTL.glow(svg, defs, x, y, 330, C.stain, 0, g);
        const s = (portrait ? 0.62 : 1.05) * (n > 2 ? 0.8 : 1);
        const D = BTL.drawing(place(g, x, y, s, it === 'ebony' ? -8 : 0));
        (OB[it] || OB.ebony)(D);
        const lab = ital(g, (P.labels && P.labels[i]) || LAB[it] || it, x, portrait ? y + 150 : 760, 48, { color: C.ink });
        return { D, gl, lab, i };
      });
      return {
        update(lt, dur, cues) {
          for (const q of list) {
            const at = cue(cues, 'abc'[q.i], 0.3 + q.i * dur / (n + 0.5));
            q.D.reveal(BTL.ease(lt, at - 1.2, 1.4)); q.gl.set(0.16 * BTL.ease(lt, at - 0.3, 1.2) + 0.02 * Math.sin(lt * 0.7 + q.i));
            fade(q.lab, BTL.ease(lt, at - 0.2, 0.8));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ nine parts copper, one part tin, bronze
  SH.bt_ul_alloy = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      BTL.glow(svg, defs, W / 2, portrait ? 640 : 440, 700, C.stain, 0.12, g);
      const ax = portrait ? W / 2 : 430, ay = portrait ? 380 : 420;
      const cu = el(g, 'g', { opacity: 0 });
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) U().ingotMini(cu, ax - 130 + c * 130, ay - 110 + r * 100, 0.85, { w: 2.4 });
      const cuL = ital(g, P.a || '9 bakır', ax, ay + 230, 50, { color: C.ink });
      const bx = portrait ? W / 2 : 960, by = portrait ? 760 : 420;
      const plus = label(g, '+', portrait ? W / 2 : 700, portrait ? 640 : 450, 110, { color: C.inkSoft });
      const tg = place(g, bx, by, 0.4); const T = BTL.drawing(tg); OB.tin(T);
      const tnL = ital(g, P.b || '1 kalay', bx, by + 230 - (portrait ? 80 : 0), 50, { color: C.ink });
      const eq = label(g, '=', portrait ? W / 2 : 1200, portrait ? 960 : 450, 110, { color: C.inkSoft });
      const cxs = portrait ? W / 2 : 1520, cys = portrait ? 1060 : 420;
      const sg = place(g, cxs, cys, portrait ? 0.5 : 0.62, -30); const S = BTL.drawing(sg); OB.sword(S);
      const swL = ital(g, P.c || 'bronz', cxs, cys + 230 - (portrait ? 100 : 0), 54, { color: C.gold });
      return {
        update(lt, dur, cues) {
          const a = cue(cues, 'a', 0.4), b = cue(cues, 'b', dur * 0.4), c = cue(cues, 'c', dur * 0.7);
          fade(cu, BTL.ease(lt, a - 0.3, 1.2)); fade(cuL, BTL.ease(lt, a + 0.3, 1));
          fade(plus, BTL.ease(lt, b - 1.0, 0.5)); T.reveal(BTL.ease(lt, b - 1.0, 0.9)); fade(tnL, BTL.ease(lt, b - 0.2, 0.5));
          fade(eq, BTL.ease(lt, c - 0.6, 0.8)); S.reveal(BTL.ease(lt, c - 0.4, 1.8)); fade(swL, BTL.ease(lt, c + 0.4, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the folding writing board (diptych)
  SH.bt_ul_tablet = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'open', portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, cy = portrait ? 620 : 450, k = portrait ? 0.8 : 1;
      const gl = BTL.glow(svg, defs, cx, cy, 600, C.stain, 0.18, g);
      const t = place(g, cx, cy, k);
      const leaf = (parent, side) => {   // side -1: the left leaf; +1: the right leaf (mirrored)
        const lg = el(parent, 'g');
        const o = `M0-230L${side * 330}-230L${side * 330} 230L0 230Z`, inn = `M${side * 30}-196L${side * 300}-196L${side * 300} 196L${side * 30} 196Z`;
        P0(lg, o, C.paperLight, 1); L0(lg, o, C.ink, 4);
        P0(lg, inn, C.paperDark, 0.9); L0(lg, inn, C.inkSoft, 2.4);
        let grain = ''; for (let i = 0; i < 4; i++) grain += `M${side * 8} ${-216 + i * 140}L${side * 322} ${-212 + i * 142}`;
        L0(lg, grain, C.inkSoft, 1.2, 0.35);
        return lg;
      };
      leaf(t, -1);
      const right = el(t, 'g'); leaf(right, 1);
      // the ivory hinge: three cylinders on the spine
      const hinge = el(t, 'g');
      for (const y of [-160, 0, 160]) { el(hinge, 'rect', { x: -14, y: y - 34, width: 28, height: 68, rx: 12, fill: C.paperLight, stroke: C.gold, 'stroke-width': 3 }); }
      // faint writing in the wax
      const wax = el(t, 'g');
      const r = rng(19); let wd = '';
      for (const side of [-1, 1]) for (let row = 0; row < 8; row++) {
        const y = -160 + row * 44; let x = side < 0 ? -290 : 50;
        while (x < (side < 0 ? -50 : 290)) { const w = 14 + r() * 26; wd += `M${f1(x)} ${f1(y + r() * 6)}c${f1(w * 0.3)} -10 ${f1(w * 0.6)} 10 ${f1(w)} 0`; x += w + 10 + r() * 12; }
      }
      const wl = L0(wax, wd, C.ink, 2.2, 0.75);
      const lab = P.label ? ital(g, P.label, cx, portrait ? 1060 : 860, 52, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          gl.set(0.16 + 0.03 * Math.sin(lt * 0.7));
          const p = mode === 'open' ? BTL.ease(lt, 0.4, Math.max(2.5, dur * 0.6)) : 1;
          const s = lerp(-1, 1, p);
          right.setAttribute('transform', `scale(${(Math.abs(s) < 0.02 ? 0.02 * Math.sign(s || 1) : s).toFixed(3)} 1)`);
          if (mode === 'open') { fade(wax, 0); } else {
            fade(wax, 1); wl.setAttribute('stroke-opacity', (0.75 * (1 - BTL.ease(lt, th, 2.4))).toFixed(3));
          }
          if (lab) fade(lab, BTL.ease(lt, mode === 'open' ? th : th + 0.6, 1.2));
        },
      };
    },
  };
})();
