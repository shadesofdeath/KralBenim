// Göbeklitepe (belgesel style, docs/BELGESEL.md): T-shaped pillars, stone rings, reliefs, the slope that buried them.
// Still line art in the theme's tokens; the only motion is slow (lines drawing in, earth creeping, light breathing).
// Shared drawing kit for bt_gobekli_b.js too: window.GTL (pillar, tSil, relief animals).
//   bt_gt_pillar  P: {soil, dark, arms, belt, pelt, person, label, sub, x, h}  cues: arms, belt
//                 one T-pillar seen from its broad side (arms / belt / hide carved in relief); soil: inside the earth
//   bt_gt_ring    P: {mode: "plan"|"fill"|"dig"|"pair", dusk}  cues: center
//                 a round enclosure (wall + ring of pillars + central pair); fill: earth rises over it; dig: a trench
//                 grid with the pillar heads showing; pair: the two central pillars, close
//   bt_gt_relief  P: {animals: [{a: "fox"|"boar"|"snake"|"vulture"|"scorpion", at}], mode: "one"|"p43"}
//                 a carved stone face; one animal after another (one) or vulture above scorpion (p43)
//   bt_gt_section P: {mode: "ritual"|"slide", done}   a cut through the slope: the enclosure fills by hand / by slow
//                 slides; done: already full, the buried pillars shown as a gold outline
//   bt_gt_karahan P: {mode: "room"|"head"}  cues: head   Karahantepe: a room cut into the bedrock, a head in the wall,
//                 10 pillars; head: the head alone, large, coming out of the wall
//   bt_gt_time    P: {marks: [{ago, label, at, gold}], max}   a time line from today back to 11,600 years ago
//   bt_gt_object  P: {obj: "flint"|"grinder", label, sub}  cues: show   one object, drawn in, in a light pool
//   bt_gt_bones   P: {n, hit, big, label, sub}  cues: hit   a grid of small bones, some turn gold
//   bt_gt_map     P: {mode: "near", points: [{lon, lat, label, sub, at}]}  Turkey outline + points; near: Şanlıurfa,
//                 the Germuş hills, Göbeklitepe (cue tepeye) and the Harran plain, close
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const P0 = (parent, d, fill, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, extra));
  const L0 = (parent, d, stroke, w = 3, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra));
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const lab = (g, s, x, y, size, o = {}) => txt(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft }, o));
  const halo = e => { e.setAttribute('stroke', C.paper); e.setAttribute('stroke-width', 10); e.setAttribute('stroke-linejoin', 'round'); e.setAttribute('paint-order', 'stroke'); return e; };
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  // scale a path written in unit coordinates (numbers only) by k around (x, y), optionally mirrored
  const U = (d, x, y, k, fc = 1) => d.replace(/(-?\d*\.?\d+)\s*,?\s*(-?\d*\.?\d+)/g, (m, a, b) => `${(x + a * k * fc).toFixed(1)} ${(y + b * k).toFixed(1)}`);

  // ---------------------------------------------------------------- the T-pillar (broad side; base at 0, height 1)
  const PIL = 'M-0.14 0L-0.12 -0.78L-0.17 -0.79L-0.17 -0.985L-0.155 -1L0.285 -1L0.3 -0.985L0.3 -0.805L0.12 -0.78L0.14 0Z';
  const ARM_O = 'M-0.10 -0.745L-0.086 -0.5C-0.082 -0.452 -0.07 -0.44 -0.04 -0.438L0.118 -0.418';
  const ARM_I = 'M-0.062 -0.745L-0.052 -0.52C-0.05 -0.49 -0.04 -0.476 -0.02 -0.475L0.118 -0.458';
  const FING = 'M0.05 -0.426L0.118 -0.424M0.05 -0.436L0.118 -0.435M0.05 -0.446L0.118 -0.446M0.06 -0.456L0.118 -0.457';
  const BELT = 'M-0.135 -0.37L0.135 -0.375L0.135 -0.343L-0.135 -0.338Z';
  const PELT = 'M0.045 -0.342L0.112 -0.344L0.106 -0.285L0.1 -0.262L0.104 -0.245L0.092 -0.25L0.086 -0.22L0.078 -0.198L0.07 -0.22L0.064 -0.25L0.052 -0.245L0.056 -0.262L0.05 -0.285Z';
  const PELT_T = 'M0.05 -0.31L0.036 -0.272L0.03 -0.262M0.106 -0.31L0.12 -0.272L0.126 -0.262M0.036 -0.272L0.03 -0.27M0.12 -0.272L0.127 -0.27';
  // draws one pillar: returns {D (stone), A (arms), B (belt + hide), g}
  function pillar(parent, x, y, h, o = {}) {
    const fc = o.face || 1, g = el(parent, 'g');
    const D = BTL.drawing(g);
    D.f(U(PIL, x, y, h, fc), o.fill || C.paperLight, 1);
    D.f(U('M-0.17 -0.985L-0.155 -1L0.285 -1L0.3 -0.985L0.3 -0.96L-0.17 -0.96Z', x, y, h, fc), C.paper, 0.9);
    D.s(U(PIL, x, y, h, fc), { w: o.w || 4 });
    D.s(U('M-0.06 -0.7L-0.055 -0.55M0.02 -0.3L0.025 -0.12M-0.09 -0.25L-0.088 -0.1M0.08 -0.68L0.085 -0.6M0.2 -0.94L0.26 -0.94', x, y, h, fc), { w: 1.6, color: C.inkSoft, alpha: 0.55 });
    let A = null, B = null;
    if (o.arms) {
      A = BTL.drawing(g);
      const col = o.gold === 'arms' ? C.gold : C.ink;
      A.s(U(ARM_O, x, y, h, fc), { w: o.aw || 3.5, color: col }); A.s(U(ARM_I, x, y, h, fc), { w: o.aw || 3.5, color: col });
      A.s(U(FING, x, y, h, fc), { w: 2.4, color: col });
    }
    if (o.belt) {
      B = BTL.drawing(g);
      const col = o.gold === 'belt' ? C.gold : C.ink;
      B.f(U(BELT, x, y, h, fc), C.paper, 1); B.s(U(BELT, x, y, h, fc), { w: 3, color: col });
      B.s(U('M-0.09 -0.37L-0.09 -0.341M-0.03 -0.371L-0.03 -0.342M0.03 -0.372L0.03 -0.343', x, y, h, fc), { w: 2, color: C.inkSoft });
      if (o.pelt) {
        B.f(U(PELT, x, y, h, fc), C.paper, 1); B.s(U(PELT, x, y, h, fc), { w: 3, color: col }); B.s(U(PELT_T, x, y, h, fc), { w: 3, color: col });
        B.s(U('M0.062 -0.33L0.066 -0.31M0.08 -0.332L0.08 -0.308M0.096 -0.33L0.093 -0.31M0.07 -0.236L0.074 -0.232M0.086 -0.236L0.082 -0.232', x, y, h, fc), { w: 1.8, color: C.inkSoft });
      }
    }
    return { g, D, A, B };
  }
  // a plain filled T silhouette (for distant pillars)
  function tSil(parent, x, y, h, fc = 1, o = {}) {
    return P0(parent, U(PIL, x, y, h, fc), o.fill || C.paperLight, o.a ?? 1, { stroke: o.stroke || C.ink, 'stroke-width': o.w || 2.5, 'stroke-linejoin': 'round' });
  }

  // ---------------------------------------------------------------- relief animals (~460 px wide, origin = centre)
  const ANIMALS = {
    fox: {
      body: 'M-230 -6L-180 -34L-168 -88L-140 -48L-118 -52L-112 -96L-86 -46C-20 -58 70 -60 120 -40C170 -70 236 -64 262 -24C224 -30 190 -22 150 2L140 86L118 86L112 18C60 30 -10 30 -50 18L-64 86L-86 86L-92 14C-130 10 -190 10 -230 -6Z',
      lines: 'M-196 -16L-150 -14M-200 -4L-160 2M-176 -22L-168 -18M150 2C110 -6 100 -30 120 -40M-40 -20C0 -10 50 -10 90 -24',
      eye: [-150, -32],
    },
    boar: {
      body: 'M-236 10L-210 -24C-176 -70 -110 -100 -20 -104C70 -106 150 -84 190 -42C214 -18 220 14 200 34L194 92L170 92L164 46C100 56 0 56 -60 46L-66 92L-90 92L-96 40C-140 44 -200 40 -236 10Z',
      lines: 'M-214 0C-226 -14 -222 -32 -204 -40M-140 -76L-150 -100M-104 -92L-110 -118M-60 -100L-62 -126M-16 -104L-14 -130M30 -104L34 -128M76 -98L82 -120M120 -86L128 -106M-150 -10C-120 10 -110 30 -116 46',
      eye: [-170, -36],
    },
    snake: {
      body: 'M-240 40C-190 -40 -120 -50 -70 10C-20 70 40 70 90 0C130 -56 190 -60 230 -20C246 -6 248 12 236 20C224 28 204 18 196 6C170 -26 140 -20 116 14C60 94 -30 100 -90 30C-130 -18 -170 -10 -214 56Z',
      lines: 'M-160 -12L-150 4M-90 0L-80 18M-20 40L-10 58M60 40L68 20M140 -24L148 -6',
      eye: [222, 2],
    },
    vulture: {
      body: 'M0 -150C26 -150 34 -126 22 -104C70 -110 150 -150 250 -150C230 -120 220 -96 196 -80C220 -70 226 -50 206 -40C150 -30 90 -20 40 0L50 120L12 100L0 130L-12 100L-50 120L-40 0C-90 -20 -150 -30 -206 -40C-226 -50 -220 -70 -196 -80C-220 -96 -230 -120 -250 -150C-150 -150 -70 -110 -22 -104C-34 -126 -26 -150 0 -150Z',
      lines: 'M-196 -80C-140 -76 -90 -66 -40 -40M196 -80C140 -76 90 -66 40 -40M-206 -40L-176 -60M-160 -36L-140 -60M-120 -30L-104 -56M206 -40L176 -60M160 -36L140 -60M120 -30L104 -56M0 -20L0 80M-6 -150C-20 -162 -34 -150 -30 -136',
      eye: [8, -132],
    },
    scorpion: {
      body: 'M-30 -70C10 -80 40 -60 40 -20C40 30 20 70 0 90C-20 70 -40 30 -40 -20C-40 -50 -40 -66 -30 -70Z',
      lines: 'M0 90C0 130 30 150 70 140C110 130 120 90 100 60C92 48 80 46 74 56M-36 -50C-80 -80 -110 -110 -120 -150M-130 -170C-150 -160 -140 -130 -118 -146M-104 -176C-90 -164 -108 -140 -118 -146M30 -56C80 -86 110 -116 120 -156M110 -176C90 -166 100 -136 120 -150M136 -180C150 -168 132 -144 120 -150M-40 -20L-100 -40L-120 -10M-40 10L-110 10L-126 40M-34 40L-96 64L-104 96M40 -20L100 -40L120 -10M40 10L110 10L126 40M34 40L96 64L104 96M-36 -40L36 -40M-38 -10L38 -10M-34 20L34 20M-24 50L24 50',
      eye: null,
    },
  };
  // a carved animal: shadow offset (relief depth) + raised surface + outline + carved lines
  function animal(parent, name, x, y, k = 1, o = {}) {
    const A = ANIMALS[name], g = el(parent, 'g', { transform: `translate(${x} ${y}) scale(${k * (o.flip ? -1 : 1)} ${k})` });
    const D = BTL.drawing(g);
    P0(g, A.body, C.paperDark, 0.9, { transform: 'translate(7 9)' });
    D.f(A.body, C.paperLight, 1);
    D.s(A.body, { w: (o.w || 4) / k, color: o.gold ? C.gold : C.ink });
    D.s(A.lines, { w: (o.w || 4) * 0.7 / k, color: C.inkSoft });
    if (A.eye) D.f(BTL.E(A.eye[0], A.eye[1], 7, 7), C.ink, 1);
    const sh = g.firstChild;
    return { g, D, sh };
  }
  // a stone surface with a few chisel scars (fills its box)
  function stoneFace(parent, x0, y0, x1, y1, seed) {
    const g = el(parent, 'g'), r = rng(seed);
    P0(g, `M${x0} ${y0 + 20}Q${x0} ${y0} ${x0 + 20} ${y0}L${x1 - 20} ${y0}Q${x1} ${y0} ${x1} ${y0 + 20}L${x1} ${y1}L${x0} ${y1}Z`, C.paperLight, 0.92);
    L0(g, `M${x0} ${y1}L${x0} ${y0 + 20}Q${x0} ${y0} ${x0 + 20} ${y0}L${x1 - 20} ${y0}Q${x1} ${y0} ${x1} ${y0 + 20}L${x1} ${y1}`, C.inkSoft, 3);
    let d = '';
    for (let i = 0; i < 60; i++) { const x = x0 + 30 + r() * (x1 - x0 - 60), y = y0 + 30 + r() * (y1 - y0 - 60), l = 8 + r() * 18, a = -0.4 + r() * 0.8; d += `M${x.toFixed(0)} ${y.toFixed(0)}l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}`; }
    L0(g, d, C.inkSoft, 1.6, 0.35);
    return g;
  }

  window.GTL = { pillar, tSil, animal, stoneFace, U, PIL, P0, L0, txt, lab, halo, fade };

  // ---------------------------------------------------------------- bt_gt_pillar
  SH.bt_gt_pillar = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: P.x || 960, ty: 600 });
      const x = P.x || 960, h = P.h || 760, base = P.soil ? 900 : 880;
      let soil = null;
      if (P.soil) {
        const top = base - h - 90;
        P0(g, `M0 ${top}C500 ${top - 14} 1400 ${top + 10} 1920 ${top - 6}L1920 1800L0 1800Z`, C.paperDark, 0.75);
        L0(g, `M0 ${top}C500 ${top - 14} 1400 ${top + 10} 1920 ${top - 6}`, C.inkSoft, 3);
        let grass = ''; for (let gx = 20; gx < 1920; gx += 40) grass += `M${gx} ${top - 2}l-5 -16M${gx + 8} ${top - 2}l4 -12`;
        L0(g, grass, C.inkSoft, 2, 0.6);
        for (const [yy, a] of [[top + 120, 0.35], [top + 260, 0.3], [top + 430, 0.3], [top + 610, 0.28], [top + 760, 0.25]]) L0(g, `M0 ${yy}C420 ${yy - 16} 980 ${yy + 18} 1400 ${yy - 6}C1650 ${yy - 16} 1820 ${yy + 6} 1920 ${yy}`, C.inkSoft, 2, a);
        const r = rng(17); let st = '';
        for (let i = 0; i < 46; i++) { const sx = r() * 1920, sy = top + 40 + r() * 1000; if (Math.abs(sx - x) < h * 0.36 && sy < base + 20) continue; const rx = 8 + r() * 16, ry = 5 + r() * 9; st += BTL.E(sx, sy, rx, ry); }
        P0(g, st, C.paper, 0.9, { stroke: C.inkSoft, 'stroke-width': 2 });
        if (P.dark) P0(g, `M0 ${top}C500 ${top - 14} 1400 ${top + 10} 1920 ${top - 6}L1920 1800L0 1800Z`, C.inkSoft, 0.35);
        soil = BTL.glow(svg, defs, x, base - h * 0.6, h * 0.95, P.dark ? C.paperLight : C.stain, 0, g);
        if (P.dark) { const hl = BTL.glow(svg, defs, x + h * 0.06, base - h * 1.0, h * 0.85, C.gold, 0, g); soil.head = hl; }
      } else {
        BTL.glow(svg, defs, x, base - h * 0.55, h * 0.9, C.stain, 0.22, g);
        P0(g, `M0 ${base}C600 ${base - 10} 1300 ${base + 8} 1920 ${base}L1920 1800L0 1800Z`, C.paperDark, 0.6);
        L0(g, `M0 ${base}C600 ${base - 10} 1300 ${base + 8} 1920 ${base}`, C.inkSoft, 2.5);
      }
      const pl = pillar(g, x, base, h, { arms: P.arms, belt: P.belt, pelt: P.pelt, gold: P.gold, face: P.face || 1 });
      let person = null, meas = null, mlab = null;
      if (P.person) {
        const px = x + h * 0.55, ph = h * 1.75 / 5.5;
        person = BTL.person(g, 'stand', px, base, ph, { face: -1, color: C.ink, rim: C.ink });
        person.setAttribute('opacity', 0);
        const mx = x - h * 0.3;
        meas = L0(g, `M${mx} ${base}L${mx} ${base - h}M${mx - 16} ${base}L${mx + 16} ${base}M${mx - 16} ${base - h}L${mx + 16} ${base - h}`, C.gold, 3, 1, { pathLength: 1 });
        mlab = halo(txt(g, P.person === true ? '5,5 m' : P.person, mx - 30, base - h / 2 + 20, 64, { anchor: 'end', color: C.gold }));
      }
      const L = P.label ? halo(lab(g, P.label, x + h * 0.45, base - h * 0.55, 54, { color: C.ink, anchor: 'start' })) : null;
      const S = P.sub ? halo(lab(g, P.sub, x + h * 0.45, base - h * 0.55 + 64, 44, { anchor: 'start' })) : null;
      return {
        update(lt, dur, cues) {
          pl.D.reveal(BTL.ease(lt, 0.1, P.slow ? 4.5 : 2.6));
          if (pl.A) pl.A.reveal(BTL.ease(lt, cue(cues, 'arms', Math.min(2.2, dur * 0.35)), 2.4));
          if (pl.B) pl.B.reveal(BTL.ease(lt, cue(cues, 'belt', Math.min(2.6, dur * 0.4)), 2.2));
          if (soil) { soil.set((P.dark ? 0.45 : 0.12) + 0.2 * BTL.ease(lt, 1, 3) + 0.04 * Math.sin(lt * 0.7)); if (soil.head) soil.head.set(0.45 + 0.5 * BTL.ease(lt, 0.8, 3) + 0.05 * Math.sin(lt * 0.6)); }
          if (person) { fade(person, BTL.ease(lt, 1.2, 1.6)); draw(meas, BTL.ease(lt, 1.6, 2)); fade(mlab, BTL.ease(lt, 2.6, 1)); }
          fade(L, BTL.ease(lt, 1.8, 1.2)); fade(S, BTL.ease(lt, 2.3, 1.2));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_gt_ring
  SH.bt_gt_ring = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'plan';
      const { g } = BTL.stage(svg, W, H, { fx: 960, ty: 600 });
      if (mode === 'pair') {
        const dusk = !!P.dusk;
        const gl = BTL.glow(svg, defs, 960, dusk ? 820 : 520, dusk ? 760 : 620, dusk ? C.gold : C.stain, 0.28, g);
        if (dusk) P0(g, 'M810 858A150 150 0 0 1 1110 858Z', C.gold, 0.55);
        P0(g, 'M0 860C600 850 1300 866 1920 856L1920 1800L0 1800Z', C.paperDark, 0.65);
        L0(g, 'M0 860C600 850 1300 866 1920 856', C.inkSoft, 2.5);
        // the ring wall behind, low and faint
        L0(g, 'M120 700C400 640 1520 640 1800 700', C.inkSoft, 2.5, 0.5);
        for (let i = 0; i < 7; i++) tSil(g, 230 + i * 243, 690 - Math.sin(i / 6 * Math.PI) * 50, 150 - Math.sin(i / 6 * Math.PI) * 40, i < 3 ? 1 : -1, { a: 0.5, w: 2, stroke: C.inkSoft });
        const a = pillar(g, 720, 880, 620, { arms: true, belt: true, pelt: true, face: 1, fill: dusk ? C.paperDark : null });
        const b = pillar(g, 1200, 880, 620, { arms: true, belt: true, pelt: true, face: -1, fill: dusk ? C.paperDark : null });
        return {
          update(lt) {
            gl.set((dusk ? 0.4 * BTL.ease(lt, 0, 4) + 0.1 : 0.24) + 0.05 * Math.sin(lt * 0.6));
            for (const p of [a, b]) { p.D.reveal(BTL.ease(lt, 0.1, 2.4)); p.A.reveal(BTL.ease(lt, 1.4, 2)); p.B.reveal(BTL.ease(lt, 1.9, 2)); }
          },
        };
      }
      const cx = 960, cy = 700, rx = 660, ry = 190;
      P0(g, `M0 ${cy - 40}C500 ${cy - 60} 1400 ${cy - 60} 1920 ${cy - 40}L1920 1800L0 1800Z`, C.paperDark, 0.45);
      const ell = (k, dy = 0) => BTL.E(cx, cy + dy, rx * k, ry * k);
      P0(g, ell(1), C.paper, 0.9);
      const back = el(g, 'g'), mid = el(g, 'g'), front = el(g, 'g');
      // wall: back half then front half; pillars around the ring by depth
      L0(back, `M${cx - rx} ${cy}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`, C.ink, 3.5);
      L0(back, `M${cx - rx} ${cy - 36}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy - 36}`, C.inkSoft, 2.5);
      const ring = [];
      const N = 12;
      for (let i = 0; i < N; i++) {
        const u = i / N * Math.PI * 2 + 0.26, px = cx + Math.cos(u) * rx * 0.94, py = cy + Math.sin(u) * ry * 0.94, depth = (Math.sin(u) + 1) / 2;
        const h = 150 + depth * 70, fc = Math.cos(u) < 0 ? 1 : -1;
        ring.push({ e: tSil(Math.sin(u) < 0 ? back : front, px, py, h, fc, { w: 2.5 }), depth });
      }
      const cen = [pillar(mid, cx - 120, cy + 10, 360, { face: 1 }), pillar(mid, cx + 120, cy + 10, 360, { face: -1 })];
      const cg = BTL.glow(svg, defs, cx, cy - 170, 380, C.gold, 0, mid);
      mid.insertBefore(cg.e, mid.firstChild);
      L0(front, `M${cx - rx} ${cy}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`, C.ink, 3.5);
      L0(front, `M${cx - rx} ${cy + 36}A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + 36}`, C.inkSoft, 2.5);
      for (const p of ring) p.e.setAttribute('opacity', 0);
      // fill / dig: an earth mound over it
      let mound = null, moundLine = null, strings = null, digger = null;
      if (mode === 'fill' || mode === 'dig') {
        mound = P0(g, '', C.paperDark, 1); moundLine = L0(g, '', C.inkSoft, 3);
      }
      if (mode === 'dig') {
        strings = el(g, 'g');
        let d = '';
        for (let i = -3; i <= 3; i++) d += `M${cx + i * 190 - 60} ${cy - 120}L${cx + i * 210} ${cy + 230}`;
        for (const k of [0, 0.5, 1]) d += `M${cx - 640 + k * 30} ${cy - 120 + k * 350}L${cx + 640 - k * 30} ${cy - 120 + k * 350}`;
        L0(strings, d, C.gold, 2, 0.75);
        digger = BTL.person(g, 'kneel', cx + 330, cy + 150, 200, { face: -1, color: C.ink, rim: C.ink });
      }
      const moundD = lev => {   // lev: y of the mound's crest
        const s = cy + 40;
        return `M0 ${s}C120 ${s} 160 ${lev + 30} 420 ${lev}C700 ${lev - 24} 1220 ${lev - 24} 1500 ${lev}C1760 ${lev + 30} 1800 ${s} 1920 ${s}`;
      };
      return {
        update(lt, dur, cues) {
          const tc = cue(cues, 'center', dur * 0.45);
          for (const p of ring) fade(p.e, BTL.ease(lt, 0.4 + (1 - p.depth) * 0.8, 1.4));
          for (const p of cen) p.D.reveal(BTL.ease(lt, 0.2, 2.4));
          cg.set(mode === 'plan' ? 0.4 * BTL.ease(lt, tc, 1.6) : 0.12);
          if (mound) {
            const top = cy - 400, ground = cy + 30;
            const q = mode === 'fill' ? BTL.ease(lt, 0.8, Math.max(3, dur - 1.2)) : 0.55 + 0.04 * (1 - BTL.ease(lt, 0, dur));
            const lev = lerp(ground, top, q), d = moundD(lev);
            mound.setAttribute('d', d + 'L1920 1800L0 1800Z'); moundLine.setAttribute('d', d);
          }
          if (strings) fade(strings, BTL.ease(lt, 0.6, 1.4));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_gt_relief
  SH.bt_gt_relief = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, ty: 560 });
      const p43 = P.mode === 'p43';
      BTL.glow(svg, defs, 960, 470, 760, C.stain, 0.16, g);
      stoneFace(g, p43 ? 560 : 360, 90, p43 ? 1360 : 1560, 1800, 5);
      const list = p43 ? [{ a: 'vulture', at: 'v', x: 960, y: 370, k: 1.1 }, { a: 'scorpion', at: 'akrep', x: 960, y: 760, k: 0.95 }]
        : (P.animals || [{ a: 'fox' }]).map((o, i) => Object.assign({ x: [920, 1000, 960][i % 3], y: 230 + i * 270, k: 0.85 }, o));
      const items = list.map(o => Object.assign({}, o, animal(g, o.a, o.x, o.y, o.k, { w: 5 })));
      if (p43) {   // the disc over the vulture's wing
        items.push(Object.assign({ at: 'v' }, (() => { const gg = el(g, 'g'); const D = BTL.drawing(gg); D.f(BTL.E(1190, 150, 34, 34), C.paperLight, 1); D.s(BTL.E(1190, 150, 34, 34), { w: 4 }); return { g: gg, D }; })()));
      }
      return {
        update(lt, dur, cues) {
          const n = items.length;
          items.forEach((it, i) => {
            const t0 = p43 ? cue(cues, it.at, i === 0 || it.at === 'v' ? 0.3 : dur * 0.5) : (i === 0 ? 0.3 : cue(cues, it.at, 0.3 + i * dur / n));
            it.D.reveal(BTL.ease(lt, t0, 2));
            let a = BTL.ease(lt, t0, 0.8);
                        fade(it.g, a);
          });
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_gt_section
  SH.bt_gt_section = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'slide';
      const { g } = BTL.stage(svg, W, H, { fx: 1000, ty: 600 });
      // the slope: high on the left, the enclosure dug into it in the middle
            P0(g, 'M0 300C300 300 520 330 700 400L700 860L1320 860L1320 460C1500 520 1700 600 1920 640L1920 1800L0 1800Z', C.paperDark, 0.7);
      L0(g, 'M0 300C300 300 520 330 700 400L700 860L1320 860L1320 460C1500 520 1700 600 1920 640', C.inkSoft, 3);
      for (const [yy, a] of [[460, 0.3], [620, 0.28], [960, 0.3], [1100, 0.25]]) L0(g, `M0 ${yy - 60}C300 ${yy - 50} 500 ${yy - 20} 700 ${yy}M1320 ${yy + 40}C1600 ${yy + 70} 1800 ${yy + 80} 1920 ${yy + 84}`, C.inkSoft, 2, a);
      // houses up the slope
      for (const [hx, hy] of [[150, 300], [330, 306], [520, 336]]) { P0(g, `M${hx - 60} ${hy}L${hx - 60} ${hy - 50}Q${hx} ${hy - 96} ${hx + 60} ${hy - 50}L${hx + 60} ${hy}Z`, C.paperLight, 1, { stroke: C.inkSoft, 'stroke-width': 2.5 }); }
      // the two central pillars in the enclosure
      const pa = pillar(g, 880, 860, 360, { face: 1 }), pb = pillar(g, 1140, 860, 360, { face: -1 });
      const fill = el(g, 'g'), layers = [];
      const NL = 7;
      for (let i = 0; i < NL; i++) {
        const y1 = 860 - (i + 1) * 58, y0 = 860 - i * 58;
        let d;
        if (mode === 'ritual') d = `M700 ${y0}L1320 ${y0}L1320 ${y1}L700 ${y1}Z`;
        else { const a0 = i ? Math.max(400, y0 - 50 - i * 8) : y0, a1 = Math.max(400, y1 - 50 - (i + 1) * 8), b0 = i ? Math.min(860, y0 + 20) : y0, b1 = Math.max(460, Math.min(860, y1 + 20)); d = `M700 ${a0}L1320 ${b0}L1320 ${b1}L700 ${a1}Z`; }
        const e = P0(fill, d, i % 2 ? C.paper : C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 1.6 });
        // fragments in the layer (bone, flint): small marks
        const r = rng(50 + i); let fr = '';
        for (let j = 0; j < 7; j++) { const fx = 730 + r() * 560, fy = (y0 + y1) / 2 + (r() - 0.5) * 30 + (mode === 'ritual' ? 0 : (1320 - fx) * -0.03 + 10); fr += `M${fx.toFixed(0)} ${fy.toFixed(0)}l${(10 + r() * 14).toFixed(0)} ${(r() * 8 - 4).toFixed(0)}`; }
        const fm = L0(fill, fr, (i === 2 || i === 5) && mode !== 'ritual' ? C.gold : C.ink, 3, 0.8);
        layers.push({ e, fm });
      }
      const movers = [];
      let ghost = null;
      if (P.done) {   // the pillars still standing under the fill, drawn as a gold outline
        ghost = el(g, 'g', { opacity: 0 });
        tSil(ghost, 880, 860, 360, 1, { fill: 'none', stroke: C.gold, w: 3.5 });
        tSil(ghost, 1140, 860, 360, -1, { fill: 'none', stroke: C.gold, w: 3.5 });
        P0(g, 'M700 400C900 420 1100 440 1320 460', 'none', 1, { stroke: C.ink, 'stroke-width': 3 });
      }
      if (P.done) { /* settled: no movers */ } else if (mode === 'ritual') {
        for (let i = 0; i < 3; i++) { const p = BTL.person(g, 'bend', 640 - i * 150, 400 - i * 34, 170, { face: 1, color: C.ink, rim: C.ink }); }
        for (let i = 0; i < 6; i++) movers.push({ e: el(g, 'circle', { r: 7, fill: C.inkSoft }), i });
      } else {
        for (let i = 0; i < 4; i++) movers.push({ e: P0(g, '', C.paper, 1, { stroke: C.inkSoft, 'stroke-width': 2.5 }), i });
      }
      return {
        update(lt, dur) {
          pa.D.reveal(BTL.ease(lt, 0, 1.6)); pb.D.reveal(BTL.ease(lt, 0.2, 1.6));
          const q = P.done ? 0.72 + 0.28 * BTL.ease(lt, 0.2, Math.max(3, dur - 1)) : BTL.ease(lt, 0.6, Math.max(3, dur - 1));
          if (ghost) fade(ghost, 0.85 * BTL.ease(lt, 1.2, 2));
          layers.forEach((L, i) => { const a = clamp01(q * NL - i); fade(L.e, a); fade(L.fm, a); });
          if (P.done) { /* settled */ } else if (mode === 'ritual') {
            movers.forEach(m => { const ph = (lt * 0.45 + m.i / 6) % 1, x0 = 660 - (m.i % 3) * 150 + 30, y0 = 330 - (m.i % 3) * 34; m.e.setAttribute('cx', (x0 + ph * (140 + (m.i % 3) * 120)).toFixed(1)); m.e.setAttribute('cy', (y0 + ph * ph * 380).toFixed(1)); m.e.setAttribute('opacity', (Math.sin(ph * Math.PI) * 0.9).toFixed(3)); });
          } else {
            movers.forEach(m => {
              const ph = (lt * 0.08 + m.i / 4) % 1, x = lerp(80, 760, ph), y = 300 + Math.pow(ph, 1.6) * 230 + (ph > 0.85 ? (ph - 0.85) * 900 : 0), s = 30 + m.i * 6;
              m.e.setAttribute('d', `M${(x - s).toFixed(1)} ${y.toFixed(1)}C${(x - s).toFixed(1)} ${(y - s * 0.7).toFixed(1)} ${(x + s).toFixed(1)} ${(y - s * 0.8).toFixed(1)} ${(x + s * 1.4).toFixed(1)} ${y.toFixed(1)}Z`);
              m.e.setAttribute('opacity', (Math.sin(ph * Math.PI) * 0.95).toFixed(3));
            });
          }
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_gt_karahan
  SH.bt_gt_karahan = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 900, ty: 600 });
      // bedrock in section, the room cut into it
      P0(g, 'M0 220L1920 220L1920 1800L0 1800Z', C.paperDark, 0.8);
      L0(g, 'M0 220L1920 220', C.inkSoft, 3);
      let grass = ''; for (let x = 20; x < 1920; x += 44) grass += `M${x} 220l-5 -16M${x + 8} 220l4 -12`;
      L0(g, grass, C.inkSoft, 2, 0.6);
      const close = P.mode === 'head';
      const room = close ? 'M815 220L815 1800L1920 1800L1920 220Z' : 'M300 220L300 760Q300 800 340 800L1600 800Q1640 800 1640 760L1640 220Z';
      P0(g, room, C.paper, 1); L0(g, room, C.ink, 3.5);
      const r = rng(9); let cr = '';
      for (let i = 0; i < 40; i++) { const x = r() * 1920, y = 260 + r() * 900; if (x > 290 && x < 1650 && y < 810) continue; cr += `M${x.toFixed(0)} ${y.toFixed(0)}l${(10 + r() * 30).toFixed(0)} ${(r() * 10 - 5).toFixed(0)}`; }
      L0(g, cr, C.inkSoft, 2, 0.45);
      // back wall line, floor
      if (!close) L0(g, 'M300 700L1640 700', C.inkSoft, 2, 0.5);
      // the head coming out of the left wall
      const head = el(g, 'g', close ? { transform: 'translate(155 -464) scale(2.2)' } : {});
      const HD = BTL.drawing(head);
      const hp = 'M300 330C340 320 380 330 400 360C420 380 424 400 416 420L432 440C440 452 432 462 420 462L414 478C420 490 414 504 400 504C396 530 380 548 350 552L300 556';
      HD.f(hp + 'Z', C.paperLight, 1);
      HD.s(hp, { w: 4 });
      HD.s('M372 402C382 396 394 396 402 402M384 400L384 410M392 506L412 504M340 330C330 380 330 440 336 520', { w: 3, color: C.inkSoft });
      const hg = close ? BTL.glow(svg, defs, 980, 500, 520, C.gold, 0, g) : BTL.glow(svg, defs, 380, 440, 260, C.gold, 0, g);
      g.insertBefore(hg.e, head);
      // ten pillars left standing in the rock (two rows, receding)
      const pil = el(g, 'g'), PL = [];
      for (let i = 0; i < (close ? 0 : 10); i++) {
        const row = i < 5 ? 0 : 1, k = row ? 0.82 : 1, x = 640 + (i % 5) * 210 + row * 105, base = row ? 700 : 790, h = (row ? 280 : 330) * (0.92 + ((i * 37) % 9) / 60), w = 38 * k;
        const d = `M${x - w} ${base}L${x - w} ${base - h + w}C${x - w} ${base - h - w * 0.3} ${x + w} ${base - h - w * 0.3} ${x + w} ${base - h + w}L${x + w} ${base}Z`;
        PL.push({ e: P0(pil, d, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 }), i: i < 5 ? i + 5 : i - 5 });
      }
      if (close) for (let i = 0; i < 3; i++) {
        const x = 1420 + i * 190, base = 880, h = 430 - i * 20, w = 46;
        PL.push({ e: P0(pil, `M${x - w} ${base}L${x - w} ${base - h + w}C${x - w} ${base - h - w * 0.3} ${x + w} ${base - h - w * 0.3} ${x + w} ${base - h + w}L${x + w} ${base}Z`, C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 }), i });
      }
      // back row first
      if (!close) for (const p of PL.slice(5)) pil.insertBefore(p.e, pil.firstChild);
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'head', 0.5);
          HD.reveal(BTL.ease(lt, th, 2));
          hg.set(0.35 * BTL.ease(lt, th + 0.6, 1.6) + 0.05 * Math.sin(lt * 0.7));
          PL.forEach((p, j) => fade(p.e, BTL.ease(lt, 0.3 + (j % 5) * 0.25, 1.2)));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_gt_time
  SH.bt_gt_time = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), max = P.max || 12000;
      const x0 = portrait ? 120 : 200, x1 = portrait ? W - 120 : W - 200, y = portrait ? 700 : 500;
      const X = ago => x1 - (x1 - x0) * ago / max;
      BTL.glow(svg, defs, X(11600), y, 420, C.stain, 0.14, g);
      const axis = L0(g, `M${x1} ${y}L${x0} ${y}`, C.inkSoft, 3, 1, { pathLength: 1 });
      let ticks = ''; for (let a = 0; a <= max; a += 1000) ticks += `M${X(a).toFixed(1)} ${y - 8}L${X(a).toFixed(1)} ${y + 8}`;
      const tk = L0(g, ticks, C.inkSoft, 2, 0.6);
      const marks = (P.marks || []).map((m, i) => {
        const x = X(m.ago), up = m.up ?? (i % 2 === 0), col = m.gold ? C.gold : C.ink, mg = el(g, 'g');
        el(mg, 'circle', { cx: x, cy: y, r: m.gold ? 14 : 9, fill: col });
        L0(mg, `M${x} ${y}L${x} ${up ? y - 110 : y + 110}`, col, 2.5);
        const t1 = txt(mg, m.label, x, up ? y - 190 : y + 180, m.gold ? 64 : 52, { anchor: m.anchor || 'middle', color: col, weight: m.gold ? 500 : 400 });
        const t2 = m.sub ? lab(mg, m.sub, x, up ? y - 128 : y + 236, 42, { anchor: m.anchor || 'middle' }) : null;
        fade(t1, 1); if (t2) fade(t2, 1);
        return { m, mg };
      });
      return {
        update(lt, dur, cues) {
          const p = BTL.ease(lt, 0.2, Math.max(2.5, dur * 0.7));
          draw(axis, p); fade(tk, p);
          marks.forEach(({ m, mg }) => {
            const t0 = m.at ? cue(cues, m.at, null) : null;
            const reach = (m.ago / max);
            const a = t0 != null ? BTL.ease(lt, t0, 1) : clamp01((p - reach) * 8 + 0.2);
            fade(mg, Math.max(m.ago === 0 ? BTL.ease(lt, 0.2, 0.8) : 0, a));
          });
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_gt_object
  const OBJS = {
    flint(D) {
      const out = 'M-330 10C-300 -30 -200 -58 -60 -62C80 -64 220 -46 330 -6C250 26 120 48 -20 50C-160 50 -270 40 -330 10Z';
      D.f(out, C.paperLight, 1);
      D.s(out, { w: 4 });
      D.s('M-310 4C-180 -16 0 -18 300 -8M-250 -34C-150 -40 -60 -40 40 -44M-200 34C-60 30 80 26 200 14', { w: 2.5, color: C.inkSoft });
      D.s('M-120 -60C-110 -40 -116 -20 -130 -12M60 -60C70 -40 64 -20 50 -12M180 -46C190 -30 186 -16 176 -10M-60 48C-50 30 -54 14 -66 6M100 40C110 24 106 10 94 4', { w: 2, color: C.inkSoft, alpha: 0.8 });
      D.s('M-260 -20C-240 -4 -238 14 -250 30M-20 -60C-6 -36 -10 -10 -26 4M140 -54C152 -34 150 -16 138 -6M-180 40C-170 20 -172 6 -184 -4', { w: 2, color: C.inkSoft, alpha: 0.7 });
      D.s('M220 -42C260 -30 300 -18 330 -6', { w: 6, color: C.gold });
    },
    grinder(D) {
      const side = 'M-360 -10C-366 8 -360 24 -330 30C-200 50 100 50 300 34C340 30 370 0 360 -30L352 60C340 90 300 100 250 104C80 116 -200 116 -320 100C-350 94 -358 80 -356 60Z';
      const top = 'M-360 -10C-340 -70 300 -80 360 -30C370 0 340 30 300 34C100 50 -200 50 -330 30C-360 24 -366 8 -360 -10Z';
      const trough = 'M-290 -4C-260 -46 240 -52 300 -20C270 8 -230 16 -290 -4Z';
      D.f(side, C.paperDark, 1); D.f(top, C.paperLight, 1); D.f(trough, C.paper, 1);
      D.s(side, { w: 4 }); D.s(top, { w: 4 }); D.s(trough, { w: 2.5, color: C.inkSoft });
      D.s('M-240 -2C-120 -26 120 -30 250 -14M-300 70L-296 96M-120 84L-118 108M80 84L82 106M240 72L242 98', { w: 2, color: C.inkSoft, alpha: 0.7 });
      const hs = 'M-60 -44C-50 -70 120 -76 150 -50C160 -36 140 -24 60 -22C-20 -20 -66 -28 -60 -44Z';
      D.f(hs, C.paperLight, 1); D.s(hs, { w: 4 });
      D.s('M-30 -40C30 -56 100 -58 136 -46', { w: 2, color: C.inkSoft });
      let gr = ''; const r = rng(3);
      for (let i = 0; i < 22; i++) { const x = -320 + r() * 640, y = 140 + r() * 40; gr += BTL.E(x, y, 8, 4.5); }
      D.f(gr, C.gold, 0.9); D.s(gr, { w: 1.5, color: C.gold });
    },
  };
  // bt_gt_bones P: {n: 100, hit: 60, big: "%60", label, sub}  cues: hit   a 10x10 grid of small bones, some turn gold
  SH.bt_gt_bones = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), n = P.n || 100, hit = P.hit || 60, cols = 10;
      const x0 = portrait ? 160 : 260, y0 = portrait ? 380 : 190, sx = portrait ? 78 : 72, sy = portrait ? 62 : 58;
      BTL.glow(svg, defs, x0 + cols * sx / 2, y0 + 5 * sy, 520, C.stain, 0.12, g);
      const bone = (x, y) => `M${x - 20} ${y - 6}a6 6 0 1 1 6 -6M${x - 20} ${y + 6}a6 6 0 1 0 6 6M${x - 14} ${y - 3}L${x + 14} ${y - 3}M${x - 14} ${y + 3}L${x + 14} ${y + 3}M${x + 20} ${y - 6}a6 6 0 1 0 -6 -6M${x + 20} ${y + 6}a6 6 0 1 1 -6 6`;
      let dA = '', dB = '';
      for (let i = 0; i < n; i++) { const x = x0 + (i % cols) * sx, y = y0 + Math.floor(i / cols) * sy; if (i < hit) dB += bone(x, y); else dA += bone(x, y); }
      const all = L0(g, dA, C.inkSoft, 2.5, 0.8), gold = L0(g, dB, C.inkSoft, 2.5, 0.8);
      const tx = portrait ? W / 2 : x0 + cols * sx + 330, ty = portrait ? 1100 : 470;
      const big = txt(g, P.big || '%60', tx, ty, 190, { weight: 300, color: C.gold, anchor: 'middle' });
      const L = P.label ? txt(g, P.label, tx, ty + 80, 54, { anchor: 'middle' }) : null;
      const S = P.sub ? lab(g, P.sub, tx, ty + 140, 42, { anchor: 'middle' }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.4), q = BTL.ease(lt, th, 1.4);
          fade(all, BTL.ease(lt, 0, 1.5)); fade(gold, BTL.ease(lt, 0, 1.5));
          gold.setAttribute('stroke', q > 0.5 ? C.gold : C.inkSoft); gold.setAttribute('stroke-width', (2.5 + q).toFixed(2));
          fade(big, q); fade(L, BTL.ease(lt, th + 0.5, 1)); fade(S, BTL.ease(lt, th + 0.9, 1));
        },
      };
    },
  };

  // ---------------------------------------------------------------- bt_gt_map: Turkey alone, clean outline
  const TR = [[26.0, 40.8], [26.6, 41.8], [28.0, 42.0], [29.0, 41.25], [30.3, 41.2], [31.4, 41.3], [32.4, 41.8], [33.4, 42.0], [34.7, 41.95], [35.1, 42.05], [35.5, 41.7], [36.1, 41.6], [36.4, 41.25], [37.4, 41.05], [38.4, 40.92], [39.7, 41.0], [40.5, 41.05], [41.5, 41.5],
    [42.8, 41.5], [43.5, 41.0], [44.8, 39.7], [44.3, 38.4], [44.6, 37.2], [42.4, 37.1], [40.6, 37.1], [38.8, 36.7], [37.0, 36.65], [36.6, 36.2], [36.2, 35.8], [35.9, 36.3], [36.2, 36.65],
    [35.6, 36.6], [34.6, 36.8], [33.6, 36.2], [32.5, 36.1], [31.0, 36.8], [30.5, 36.5], [29.6, 36.2], [28.2, 36.7], [27.4, 37.0], [27.2, 37.9], [26.4, 38.3], [26.8, 38.6], [26.9, 39.4],
    [26.1, 39.5], [26.2, 40.1], [26.8, 40.35], [27.5, 40.4], [29.0, 40.4], [29.4, 40.8], [29.0, 41.05], [28.0, 41.0], [27.5, 40.95], [26.7, 40.4], [26.2, 40.3]];
  SH.bt_gt_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      if (P.mode === 'near') {   // Şanlıurfa, the Germuş hills and the Harran plain, close
        const [n0, m0, n1, m1] = [38.3, 36.75, 39.5, 37.5], kk = Math.cos(37 * Math.PI / 180);
        const ss = Math.min((W - 300) / ((n1 - n0) * kk), (portrait ? 900 : 780) / (m1 - m0)), qx = W / 2 - (n1 - n0) * kk * ss / 2, qy = (portrait ? 640 : 450) - (m1 - m0) * ss / 2;
        const X = lon => qx + (lon - n0) * kk * ss, Y = lat => qy + (m1 - lat) * ss;
        BTL.glow(svg, defs, X(38.92), Y(37.22), 360, C.stain, 0.16, g);
        const plainE = P0(g, BTL.E(X(39.0), Y(36.95), 380, 120), C.paperDark, 0.55);
        const plainL = lab(g, 'Harran Ovası', X(38.82), Y(36.97) + 16, 46, { anchor: 'middle' });
        let ridge = ''; for (let i = 0; i < 9; i++) { const x = X(38.7 + i * 0.07), y = Y(37.27 + Math.sin(i) * 0.03); ridge += `M${(x - 34).toFixed(0)} ${(y + 14).toFixed(0)}Q${x.toFixed(0)} ${(y - 22).toFixed(0)} ${(x + 34).toFixed(0)} ${(y + 14).toFixed(0)}`; }
        const rl = L0(g, ridge, C.inkSoft, 2.5, 0.8);
        const pt = (lon, lat, name, o) => { const x = X(lon), y = Y(lat), pg = el(g, 'g', { opacity: 0 });
          if (o.gold) el(pg, 'circle', { cx: x, cy: y, r: 20, fill: 'none', stroke: C.gold, 'stroke-width': 3 });
          el(pg, 'circle', { cx: x, cy: y, r: o.gold ? 10 : 7, fill: o.gold ? C.gold : C.ink });
          fade(halo(txt(pg, name, x + o.dx, y + o.dy, o.gold ? 58 : 46, { anchor: o.anchor, weight: o.gold ? 500 : 400, color: o.gold ? C.ink : C.inkSoft })), 1);
          return pg; };
        const urfa = pt(38.79, 37.16, 'Şanlıurfa', { dx: -26, dy: 16, anchor: 'end' });
        const harran = pt(39.03, 36.86, 'Harran', { dx: 26, dy: 16, anchor: 'start' });
        const gt = pt(38.92, 37.22, 'Göbeklitepe', { dx: 34, dy: -24, anchor: 'start', gold: true });
        return {
          update(lt, dur, cues) {
            fade(plainE, BTL.ease(lt, 0, 1.5)); fade(plainL, BTL.ease(lt, 0.6, 1.2)); fade(rl, BTL.ease(lt, 0.3, 1.5));
            fade(urfa, BTL.ease(lt, 0.4, 1)); fade(harran, BTL.ease(lt, 0.9, 1));
            fade(gt, BTL.ease(lt, cue(cues, 'tepeye', 1.4), 1));
          },
        };
      }
      const [l0, b0, l1, b1] = [25.5, 35.5, 45.2, 42.3];
      const k = Math.cos(39 * Math.PI / 180), aw = W - (portrait ? 100 : 260), ah = portrait ? 900 : 760;
      const s = Math.min(aw / ((l1 - l0) * k), ah / (b1 - b0)), ox = W / 2 - (l1 - l0) * k * s / 2, oy = (portrait ? 640 : 460) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * k * s, Y = lat => oy + (b1 - lat) * s;
      const d = 'M' + TR.map(p => X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('L') + 'Z';
      P0(g, d, C.paperLight, 0.9);
      const coast = L0(g, d, C.inkSoft, 3, 1, { pathLength: 1 });
      // the Euphrates, faint
      const eu = L0(g, 'M' + [[38.3, 39.7], [38.6, 38.9], [38.4, 38.2], [38.3, 37.6], [38.0, 37.0], [38.0, 36.7]].map(p => X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('L'), C.blue, 3, 0.6, { pathLength: 1 });
      const pts = (P.points || []).map(p => {
        const x = X(p.lon), y = Y(p.lat), pg = el(g, 'g');
        el(pg, 'circle', { cx: x, cy: y, r: 20, fill: 'none', stroke: C.gold, 'stroke-width': 3 });
        el(pg, 'circle', { cx: x, cy: y, r: 10, fill: C.gold });
        const t1 = halo(txt(pg, p.label, x - 36, y - 60, 58, { anchor: 'end', weight: 500 }));
        const t2 = p.sub ? halo(lab(pg, p.sub, x - 36, y - 6, 44, { anchor: 'end' })) : null;
        fade(t1, 1); if (t2) fade(t2, 1);
        pg.setAttribute('opacity', 0);
        return { p, pg };
      });
      return {
        update(lt, dur, cues) {
          draw(coast, BTL.ease(lt, 0, 2)); draw(eu, BTL.ease(lt, 0.8, 2));
          pts.forEach(({ p, pg }) => fade(pg, BTL.ease(lt, cue(cues, p.at, 1.2), 1)));
        },
      };
    },
  };

  SH.bt_gt_object = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 640 : 460, k = P.scale || 1;
      const gl = BTL.glow(svg, defs, cx, cy, 520, C.stain, 0.22, g);
      const D = BTL.drawing(el(g, 'g', { transform: `translate(${cx} ${cy}) rotate(${P.rot || 0}) scale(${k})` }));
      (OBJS[P.obj] || OBJS.flint)(D);
      const L = P.label ? txt(g, P.label, cx, cy + (portrait ? 300 : 250) * Math.max(0.8, k), 58, { weight: 400 }) : null;
      const S = P.sub ? lab(g, P.sub, cx, cy + (portrait ? 300 : 250) * Math.max(0.8, k) + 62, 42) : null;
      return {
        update(lt, dur, cues) {
          const t0 = cue(cues, 'show', 0.2);
          D.reveal(BTL.ease(lt, t0, 2.6));
          gl.set(0.2 + 0.04 * Math.sin(lt * 0.6));
          fade(L, BTL.ease(lt, t0 + 1.6, 1)); fade(S, BTL.ease(lt, t0 + 2, 1));
        },
      };
    },
  };
})();
