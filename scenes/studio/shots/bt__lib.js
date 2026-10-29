// bt__lib: shared drawing kit of the belgesel (documentary) style ("theme": "belgesel", docs/BELGESEL.md).
// Clean, still line art: no boil, no wobble. One subject per frame, thin strokes in the theme's ink, surfaces in
// paperLight, one accent (gold) and soft light pools (stain). Strokes draw themselves in once, then stand still.
//   BTL.drawing(parent)          -> {g, s(d, o), f(d, color, alpha), t(...), reveal(p)}   p 0..1 draws it in
//   BTL.OBJ.<name>(D, o)          -> draws object <name> into drawing D (origin = centre, ~660 px wide)
//   BTL.person(parent, pose, x, y, h, o) -> silhouette (stand, bend, kneel, sit, dive)
//   BTL.glow(svg, defs, cx, cy, r, color, alpha) -> {e, set(alpha)}   soft radial light pool
//   BTL.stars(parent, n, seed, box) -> {update(lt)}   still stars, a few breathe very slowly
//   BTL.E(cx, cy, rx, ry) ellipse path · BTL.ease(lt, a, d) eased 0..1 · BTL.FR / BTL.LO fonts
'use strict';

const BTL = (() => {
  const C = THEME_PARCHMENT;
  const FR = 'Fraunces, Georgia, serif', LO = 'Lora, Georgia, serif';
  const E = (cx, cy, rx, ry) => `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
  const ease = (lt, a, d) => progIO(lt, a, d);
  let gid = 0;

  function drawing(parent) {
    const g = el(parent, 'g'), items = [];
    return {
      g, items,
      s(d, o = {}) {      // stroke, drawn in
        const e = el(o.parent || g, 'path', { d, fill: 'none', stroke: o.color || C.ink, 'stroke-width': o.w ?? 4,
          'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1 });
        if (o.alpha != null) e.setAttribute('stroke-opacity', o.alpha);
        items.push({ e, k: 's', order: o.order ?? items.length });
        return e;
      },
      f(d, color, a = 1, o = {}) {   // fill, fades in under the strokes
        const e = el(o.parent || g, 'path', { d, fill: color, 'fill-opacity': 0, stroke: 'none' });
        items.push({ e, k: 'f', a });
        return e;
      },
      t(txt, x, y, size, o = {}) {   // text, fades in
        const e = svgText(o.parent || g, txt, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
          'font-weight': o.weight || 400, 'fill-opacity': 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.attrs || {}));
        if (o.spacing) e.setAttribute('letter-spacing', o.spacing);
        items.push({ e, k: 'f', a: o.alpha ?? 1, late: true });
        return e;
      },
      reveal(p) {          // strokes one after another (overlapping), fills follow
        const S = items.filter(i => i.k === 's'), n = S.length;
        S.forEach((it, j) => { const a = n > 1 ? j / n * 0.65 : 0; draw(it.e, clamp01((p - a) / 0.35)); });
        for (const it of items) if (it.k === 'f') it.e.setAttribute('fill-opacity', (it.a * clamp01((p - (it.late ? 0.6 : 0.35)) / 0.4)).toFixed(3));
      },
    };
  }

  function glow(svg, defs, cx, cy, r, color = C.stain, alpha = 0.3, parent = null) {
    const id = 'btg' + (++gid);
    const rg = el(defs, 'radialGradient', { id });
    el(rg, 'stop', { offset: '0', 'stop-color': color, 'stop-opacity': 1 });
    el(rg, 'stop', { offset: '0.45', 'stop-color': color, 'stop-opacity': 0.35 });
    el(rg, 'stop', { offset: '1', 'stop-color': color, 'stop-opacity': 0 });
    const e = el(parent || svg, 'circle', { cx, cy, r, fill: `url(#${id})`, 'fill-opacity': alpha });
    return { e, set(a) { e.setAttribute('fill-opacity', Math.max(0, a).toFixed(3)); } };
  }

  function stars(parent, n, seed, box) {
    const r = rng(seed), g = el(parent, 'g'), list = [];
    let d = '';
    for (let i = 0; i < n; i++) {
      const x = box[0] + r() * (box[2] - box[0]), y = box[1] + r() * (box[3] - box[1]), s = 0.8 + r() * r() * 2.4;
      if (i % 9 === 0) list.push({ e: el(g, 'circle', { cx: x, cy: y, r: s + 0.6, fill: C.ink }), ph: r() * 6.28, sp: 0.25 + r() * 0.3 });
      else d += `M${x.toFixed(1)} ${y.toFixed(1)}m-${s.toFixed(1)} 0a${s.toFixed(1)} ${s.toFixed(1)} 0 1 0 ${(2 * s).toFixed(1)} 0a${s.toFixed(1)} ${s.toFixed(1)} 0 1 0 -${(2 * s).toFixed(1)} 0`;
    }
    el(g, 'path', { d, fill: C.ink, 'fill-opacity': 0.45 });
    return { g, update(lt) { for (const s of list) s.e.setAttribute('fill-opacity', (0.55 + 0.35 * Math.sin(lt * s.sp + s.ph)).toFixed(3)); } };
  }

  // ---------------------------------------------------------------- silhouettes (filled, rim line)
  // joints in units of the figure height (feet at 0, up is negative y), mirrored by o.face = -1
  const POSES = {
    stand: { head: [0, -0.9], sh: [0, -0.77], hip: [0, -0.47], k1: [-0.04, -0.24], f1: [-0.07, 0], k2: [0.05, -0.24], f2: [0.08, 0], e1: [-0.1, -0.6], h1: [-0.12, -0.44], e2: [0.1, -0.6], h2: [0.12, -0.44] },
    bend:  { head: [0.36, -0.6], sh: [0.25, -0.62], hip: [0, -0.46], k1: [0.04, -0.24], f1: [-0.04, 0], k2: [0.1, -0.24], f2: [0.1, 0], e1: [0.3, -0.44], h1: [0.33, -0.26], e2: [0.36, -0.46], h2: [0.42, -0.3] },
    kneel: { head: [0.3, -0.63], sh: [0.17, -0.6], hip: [-0.04, -0.33], k1: [0.16, -0.05], f1: [-0.2, -0.02], k2: [0.08, -0.04], f2: [-0.26, 0], e1: [0.32, -0.44], h1: [0.39, -0.57], e2: [0.29, -0.42], h2: [0.37, -0.55] },
    sit:   { head: [0.04, -0.72], sh: [-0.01, -0.6], hip: [-0.04, -0.24], k1: [0.2, -0.4], f1: [0.32, -0.02], k2: [0.24, -0.36], f2: [0.36, 0], e1: [0.14, -0.42], h1: [0.3, -0.48], e2: [0.16, -0.4], h2: [0.32, -0.45] },
    dive:  { head: [0, -0.92], sh: [0, -0.8], hip: [0, -0.47], k1: [-0.03, -0.24], f1: [-0.05, 0.02], k2: [0.04, -0.25], f2: [0.07, 0.01], e1: [-0.05, -1.0], h1: [-0.02, -1.15], e2: [0.05, -1.0], h2: [0.02, -1.15] },
  };
  function person(parent, pose, x, y, h, o = {}) {
    const P = POSES[pose] || POSES.stand, fc = o.face ?? 1, col = o.color || C.paperDark, rim = o.rim || C.inkSoft;
    const g = el(parent, 'g', { transform: `translate(${x} ${y})${o.rot ? ` rotate(${o.rot})` : ''}` });
    const pt = k => [P[k][0] * h * fc, P[k][1] * h];
    const line = (ks, w) => { const d = 'M' + ks.map(k => pt(k).map(v => v.toFixed(1)).join(' ')).join(' L'); return d; };
    const limbs = [[['hip', 'k1', 'f1'], 0.055], [['hip', 'k2', 'f2'], 0.055], [['sh', 'e1', 'h1'], 0.042], [['sh', 'e2', 'h2'], 0.042], [['sh', 'hip'], 0.12]];
    for (const [ks, w] of limbs) el(g, 'path', { d: line(ks), fill: 'none', stroke: rim, 'stroke-width': w * h + 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-opacity': 0.8 });
    for (const [ks, w] of limbs) el(g, 'path', { d: line(ks), fill: 'none', stroke: col, 'stroke-width': w * h, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const [hx, hy] = pt('head');
    el(g, 'circle', { cx: hx, cy: hy, r: 0.078 * h + 1.5, fill: rim, 'fill-opacity': 0.8 });
    el(g, 'circle', { cx: hx, cy: hy, r: 0.078 * h, fill: col });
    return g;
  }

  // ---------------------------------------------------------------- objects (origin = centre)
  const OBJ = {};
  OBJ.bonespoon = (D, o = {}) => {
    D.f('M-330 0C-330-60-250-78-170-70C-130-66-100-40-80-26C0-22 150-20 250-24C280-40 330-38 336-6C340 20 300 34 262 22C150 20 0 24-80 26C-100 40-130 66-170 70C-250 78-330 60-330 0Z', C.paperLight, 1);
    D.f('M-305 0C-305-40-250-52-185-48C-140-44-112-24-112 0C-112 24-140 44-185 48C-250 52-305 40-305 0Z', C.paper, 0.75);
    D.s('M-330 0C-330-60-250-78-170-70C-130-66-100-40-80-26C0-22 150-20 250-24C280-40 330-38 336-6C340 20 300 34 262 22C150 20 0 24-80 26C-100 40-130 66-170 70C-250 78-330 60-330 0Z', { w: o.gold ? 7 : 4, color: o.gold ? C.gold : C.ink });
    D.s('M-305 0C-305-40-250-52-185-48C-140-44-112-24-112 0C-112 24-140 44-185 48C-250 52-305 40-305 0Z', { w: 2.5, color: C.inkSoft });
    D.s('M-40-9L60-11M90 7L200 6M262 22C276 2 272-14 252-24', { w: 2, color: C.inkSoft });
    if (o.wear) D.s('M-321-24C-316-38-304-48-290-54M-324 16C-319 32-306 44-292 50M-330-4L-330 6', { w: 5, color: C.gold });
  };
  // one cupped hand seen from the side, palm up, holding water: fingertips curl up on the left, thumb rises in the
  // middle, the wrist runs out to the right
  OBJ.hands = (D) => {
    const hand = 'M330 40C200 64 40 100-110 84C-200 74-252 30-266-36C-272-66-246-78-232-56C-214-28-190-12-150-8' +
      'C-90-4-30-14 18-34C52-50 66-96 104-106C136-114 152-88 140-62C130-40 190-22 330-22Z';
    D.f(hand, C.paperLight, 1);
    D.f('M-212-26C-150-56-20-60 26-36C-36-10-150-4-212-26Z', C.blue, 0.5);
    D.s(hand.slice(0, -1), { w: 4 });   // open at the wrist
    D.s('M-212-26C-150-56-20-60 26-36', { w: 2.5, color: C.blue });
    D.s('M-186 52C-214 30-232 0-240-30M-140 70C-176 50-200 22-212-8M-90 80C-130 62-156 40-170 14', { w: 2.5, color: C.inkSoft });
    D.s('M40-30C70-40 90-60 100-80', { w: 2.5, color: C.inkSoft });
  };
  // fan-shaped clam valve: margin + growth rings about the umbo + faint rays
  OBJ.shell = (D, o = {}) => {
    const U = [-30, -168];
    const M = [[-250, 30], [-250, -80, -140, -168, -30, -168], [80, -168, 250, -100, 250, 20], [250, 100, 150, 148, 20, 150], [-110, 152, -250, 110, -250, 30]];
    const sc = k => { const f = (x, y) => [(U[0] + (x - U[0]) * k).toFixed(1), (U[1] + (y - U[1]) * k).toFixed(1)].join(' ');
      return 'M' + f(...M[0]) + M.slice(1).map(c => 'C' + f(c[0], c[1]) + ' ' + f(c[2], c[3]) + ' ' + f(c[4], c[5])).join('') + 'Z'; };
    D.f(sc(1), C.paperLight, 1);
    const cid = 'btshell' + (++gid), cp = el(D.g, 'clipPath', { id: cid }); el(cp, 'path', { d: sc(1) });
    const rays = el(D.g, 'g', { 'clip-path': `url(#${cid})` });
    for (let a = -150; a <= -30; a += 20) { const r = a * Math.PI / 180; D.f(`M${U[0]} ${U[1]}L${(U[0] + Math.cos(r) * -330).toFixed(0)} ${(U[1] + Math.sin(r) * -330).toFixed(0)}L${(U[0] + Math.cos(r + 0.06) * -330).toFixed(0)} ${(U[1] + Math.sin(r + 0.06) * -330).toFixed(0)}Z`, C.stain, 0.12, { parent: rays }); }
    D.s(sc(1), { w: 4 });
    for (const k of [0.84, 0.68, 0.52, 0.36, 0.2]) D.s(sc(k), { w: 2, color: C.inkSoft, alpha: 0.85 });
    D.s(`M${U[0] - 36} ${U[1] + 6}C${U[0] - 20} ${U[1] - 14} ${U[0] + 20} ${U[1] - 14} ${U[0] + 36} ${U[1] + 6}`, { w: 3 });
    if (o.edge) D.s('M-246 64C-226 124-110 152 20 150C150 148 238 104 250 30', { w: 7, color: C.gold });
  };
  OBJ.snail = (D) => {
    const cx = 30, cy = -10, pts = [];
    for (let th = 0; th <= Math.PI * 6.2; th += 0.12) { const r = 7 * Math.exp(0.172 * th); pts.push([cx + Math.cos(th) * r, cy + Math.sin(th) * r * 0.92]); }
    const d = 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L');
    const R = 7 * Math.exp(0.172 * Math.PI * 6.2);
    D.f(E(cx, cy, R + 10, (R + 10) * 0.92), C.paperLight, 1);
    D.f(`M${cx + R - 30} ${cy + 40}C${cx + R + 70} ${cy + 60} ${cx + R + 60} ${cy + 200} ${cx + R - 30} ${cy + 190}C${cx + R - 90} ${cy + 170} ${cx + R - 70} ${cy + 90} ${cx + R - 30} ${cy + 40}Z`, C.paper, 1);
    D.s(E(cx, cy, R + 10, (R + 10) * 0.92), { w: 4 });
    D.s(d, { w: 3, color: C.ink });
    D.s(`M${cx + R - 30} ${cy + 40}C${cx + R + 70} ${cy + 60} ${cx + R + 60} ${cy + 200} ${cx + R - 30} ${cy + 190}C${cx + R - 90} ${cy + 170} ${cx + R - 70} ${cy + 90} ${cx + R - 30} ${cy + 40}Z`, { w: 3 });
  };
  OBJ.woodspoon = (D) => {
    const out = 'M-320 0C-320-70-260-95-195-95C-130-95-80-60-70-30C20-20 200-18 320-16C340-16 345 16 320 16C200 18 20 20-70 30C-80 60-130 95-195 95C-260 95-320 70-320 0Z';
    const bowl = 'M-298 0C-298-55-250-74-195-74C-140-74-96-45-96 0C-96 45-140 74-195 74C-250 74-298 55-298 0Z';
    D.f(out, C.paperLight, 1); D.f(bowl, C.paper, 0.7);
    D.s(out, { w: 4 }); D.s(bowl, { w: 2.5, color: C.inkSoft });
    D.s('M-30-6C60-9 160-8 280-6M10 8C100 6 200 7 300 6M-260-30C-230-46-190-50-160-40', { w: 2, color: C.inkSoft, alpha: 0.8 });
  };
  OBJ.steelspoon = (D, o = {}) => {
    const out = 'M-320 0C-320-62-268-86-206-86C-150-86-112-52-100-24C-40-16 120-14 280-22C320-24 344-10 344 0C344 10 320 24 280 22C120 14-40 16-100 24C-112 52-150 86-206 86C-268 86-320 62-320 0Z';
    D.f(out, C.paperLight, 1);
    D.s(out, { w: 4 });
    D.s('M-290-20C-276-50-240-64-206-64', { w: 3, color: C.inkSoft });
    if (o.flame) {
      D.f('M-206 34C-236 30-246 4-232-16C-226-6-220-4-218-12C-216-30-206-44-196-54C-196-34-176-26-176-4C-176 20-188 34-206 34Z', C.gold, 0.95);
      D.f('M-206 28C-218 26-224 14-218 2C-214 8-210 8-208 0C-206-10-202-16-198-22C-198-8-190-2-192 10C-194 22-198 28-206 28Z', C.paperLight, 0.9);
    }
  };
  OBJ.pot = (D, o = {}) => {
    const body = 'M-150-150C-160-60-175 40-120 120C-80 175 80 175 120 120C175 40 160-60 150-150Z';
    const rim = 'M-165-158C-165-185 165-185 165-158C165-131-165-131-165-158Z';
    D.f(body, C.paperLight, 1); D.f(rim, C.paper, 1);
    if (o.liquid) D.f('M-140-158C-140-176 140-176 140-158C140-140-140-140-140-158Z', C.gold, 0.5);
    D.f('M-110 108C-60 156 60 156 110 108C60 134-60 134-110 108Z', C.paperDark, 0.9);
    D.s(body, { w: 4 }); D.s(rim, { w: 4 });
    let h = '';
    for (let y = -100; y <= 80; y += 60) {
      const half = 150 - Math.max(0, y) * 0.35 - 30;
      for (let x = -half; x <= half - 10; x += 44) h += `M${x.toFixed(0)} ${y}l10 14`;
    }
    D.s(h, { w: 2, color: C.inkSoft, alpha: 0.45 });
  };
  OBJ.bowl = (D) => {
    D.f('M-220-40C-210 60-120 120 0 124C120 120 210 60 220-40Z', C.paperLight, 1);
    D.f('M-220-40C-220-72 220-72 220-40C220-8-220-8-220-40Z', C.paper, 1);
    D.f('M-196-38C-196-64 196-64 196-38C196-12-196-12-196-38Z', C.gold, 0.55);
    D.s('M-220-40C-210 60-120 120 0 124C120 120 210 60 220-40', { w: 4 });
    D.s('M-220-40C-220-72 220-72 220-40C220-8-220-8-220-40Z', { w: 4 });
    D.s('M-90 124L-80 150L80 150L90 124', { w: 3 });
    D.s('M-120-44l8-3M-60-30l9 2M10-50l8 3M70-34l9-2M120-46l7 3M-20-24l8 1', { w: 3, color: C.inkSoft });
  };
  OBJ.legbone = (D, o = {}) => {
    const b = 'M-330-40C-360-62-385-12-362 8C-384 32-352 72-320 50C-200 34 200 34 320 50C352 74 388 40 366 8C388-22 360-72 320-44C200-30-200-30-330-40Z';
    D.f(b, C.paperLight, 1); D.s(b, { w: 4 });
    D.s('M-300-20C-150-14 150-14 300-20M-290 30C-150 22 150 22 290 30', { w: 2, color: C.inkSoft, alpha: 0.6 });
    if (o.cut) D.s('M-300 0C-300-28-260-32-220-30C-190-28-176-14-166-10C-60-8 120-8 260-10C280-16 300-14 300 0C300 14 280 16 260 10C120 8-60 8-166 10C-176 14-190 28-220 30C-260 32-300 28-300 0Z', { w: 3.5, color: C.gold });
  };
  OBJ.antlerspoon = (D) => {
    const out = 'M-330 4C-332-50-270-70-200-62C-160-58-130-36-110-24C-20-30 120-44 300-80C330-86 346-60 326-46C150-12-20 14-110 26C-130 44-170 66-220 68C-290 70-328 50-330 4Z';
    D.f(out, C.paperLight, 1);
    D.f('M-306 4C-306-34-262-46-206-42C-168-38-140-22-140 2C-140 26-170 42-210 46C-262 48-306 36-306 4Z', C.paper, 0.75);
    D.s(out, { w: 4 });
    D.s('M-306 4C-306-34-262-46-206-42C-168-38-140-22-140 2C-140 26-170 42-210 46C-262 48-306 36-306 4Z', { w: 2.5, color: C.inkSoft });
    let z = 'M-80-30';
    for (let i = 1; i <= 12; i++) { const x = -80 + i * 30, y = -30 - i * 3.6; z += `L${x - 15} ${y - 14}L${x} ${y}`; }
    D.s(z, { w: 3 });
    D.s(E(20, -10, 9, 9) + E(110, -24, 9, 9) + E(200, -40, 9, 9), { w: 3, color: C.ink });
    D.s('M-40 4l10 12M60-10l10 12M150-26l10 12M240-44l10 12', { w: 2.5, color: C.inkSoft });
  };
  OBJ.egyptspoon = (D) => {
    const dish = 'M-360-10C-360-70-280-92-220-88C-160-84-130-50-130-10C-130 32-170 56-230 58C-300 60-360 40-360-10Z';
    D.f(dish, C.paperLight, 1);
    D.f('M-338-10C-338-56-276-70-228-66C-180-62-154-40-154-10C-154 22-186 38-232 40C-290 42-338 28-338-10Z', C.gold, 0.28);
    D.s(dish, { w: 4 });
    D.s('M-360-14C-392-34-404-78-376-92C-356-100-342-80-350-58', { w: 4 });
    const body = 'M-24-18C60-26 160-20 240-12C290-8 320-8 344-6L344 6C320 8 290 8 240 10C160 18 60 22-24 16Z';
    D.f(body, C.paperLight, 1); D.s(body, { w: 4 });
    D.s('M-40-10L-134-24M-40 8L-134 20', { w: 4 });
    D.f(E(-56, -2, 30, 30), C.paperLight, 1); D.s(E(-56, -2, 30, 30), { w: 4 });
    D.f('M-84-6C-86-42-38-48-24-24L-26 22C-40 30-82 26-84-6Z', C.inkSoft, 1);
    D.s('M150 0L344 0M60-18C80-10 90 8 100 18', { w: 2.5, color: C.inkSoft });
  };
  OBJ.romanspoon = (D) => {
    D.f(E(-250, 0, 72, 72), C.paperLight, 1); D.f(E(-250, 0, 54, 54), C.paper, 0.75);
    D.s(E(-250, 0, 72, 72), { w: 4 }); D.s(E(-250, 0, 54, 54), { w: 2.5, color: C.inkSoft });
    const h = 'M-178-8L-150-8L-140-14L300-5L346 0L300 5L-140 14L-150 8L-178 8Z';
    D.f(h, C.paperLight, 1); D.s(h, { w: 3.5 });
  };
  OBJ.egg = (D, o = {}) => {
    const shell = 'M-120-60L-96-90L-70-66L-40-100L-10-70L20-104L50-72L80-98L104-62L124-40C150 40 120 190 0 196C-120 190-150 40-124-40Z';
    D.f(shell, C.paperLight, 1);
    D.f('M-124-40L-96-70L-70-48L-40-80L-10-52L20-84L50-54L80-78L104-44L124-40C110-10-110-10-124-40Z', C.paper, 0.9);
    D.s(shell, { w: 4 });
    if (o.hole) { D.f(E(52, 130, 14, 18), C.paperDark, 1); D.s('M52 112L64 86L58 70M66 140L94 152L104 172M38 142L18 166', { w: 2.5, color: C.inkSoft }); }
  };
  OBJ.diamond = (D) => {
    const drop = k => `M0 ${-190 * k}C${70 * k} ${-120 * k} ${140 * k} ${-40 * k} ${140 * k} ${40 * k}C${140 * k} ${120 * k} ${80 * k} ${170 * k} 0 ${170 * k}C${-80 * k} ${170 * k} ${-140 * k} ${120 * k} ${-140 * k} ${40 * k}C${-140 * k} ${-40 * k} ${-70 * k} ${-120 * k} 0 ${-190 * k}Z`;
    D.f(drop(1), C.paperLight, 0.85); D.f(drop(0.55), C.paper, 0.5);
    D.s(drop(1), { w: 4 }); D.s(drop(0.55), { w: 2.5, color: C.inkSoft });
    const P = k => [[0, -190 * k], [99 * k, -60 * k], [140 * k, 40 * k], [100 * k, 145 * k], [0, 170 * k], [-100 * k, 145 * k], [-140 * k, 40 * k], [-99 * k, -60 * k]];
    const a = P(1), b = P(0.55);
    D.s(a.map((p, i) => `M${p[0].toFixed(0)} ${p[1].toFixed(0)}L${b[i][0].toFixed(0)} ${b[i][1].toFixed(0)}`).join(''), { w: 2, color: C.inkSoft });
    // the double row of 49 old-cut diamonds around it
    let ring = '';
    const row = (k, n, r) => { for (let i = 0; i < n; i++) { const u = i / n * Math.PI * 2, x = Math.sin(u) * 182 * k, y = (-Math.cos(u) * (u < Math.PI * 0.5 || u > Math.PI * 1.5 ? 230 : 200) + 10) * k; ring += `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`; } };
    row(1.14, 24, 9); row(1.3, 25, 10);
    D.s(ring, { w: 2.5, color: C.gold });
  };
  OBJ.stone = (D) => {
    const s = 'M-120-20L-70-80L20-96L100-60L130 10L90 80L-10 96L-100 60Z';
    D.f(s, C.paperLight, 1); D.s(s, { w: 4 });
    D.s('M-70-80L-30-10L20-96M-30-10L90 80M-30-10L-100 60', { w: 2, color: C.inkSoft });
    D.s('M30-50l20-10M40-30l14 4', { w: 3, color: C.gold });
  };

  return { C, FR, LO, E, ease, drawing, glow, stars, person, OBJ };
})();
