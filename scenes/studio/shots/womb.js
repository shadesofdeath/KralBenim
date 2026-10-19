// womb: an ultrasound-style fan view of a baby curled up in the womb. A scan line sweeps the fan; from the cue the baby
// hiccups: small rhythmic jolts of the chest with soft ripple rings (and a little "hık" pop). Gentle, not clinical.
// P: {pop: "hık", every: 0.95, tint: "#hex" (default accent2)}
// cues: hit (the hiccups start)
'use strict';

SHOTS.womb = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg, defs, seed } = ctx;
    const portrait = H > W, r = rng(57);
    const bd = backdrop(svg, pal, W, H, 59, { rays: 0.05, cy: H * 0.32 });
    const ax = W / 2, ay = portrait ? 270 : 70, R = portrait ? 880 : 760, half = (portrait ? 34 : 42) * Math.PI / 180;
    const tint = P.tint || '#d8d4cc';                                            // ultrasound grey-white
    const id = 'wb' + (seed || 0);
    const fan = `M${ax} ${ay} L${ax + Math.sin(-half) * R} ${ay + Math.cos(half) * R} A${R} ${R} 0 0 0 ${ax + Math.sin(half) * R} ${ay + Math.cos(half) * R} Z`;
    const cp = el(defs, 'clipPath', { id: id + 'c' }); el(cp, 'path', { d: fan });
    const gS = el(defs, 'radialGradient', { id: id + 'g', cx: 0.5, cy: 0.0, r: 1.0 });
    el(gS, 'stop', { offset: 0, 'stop-color': mix(pal.bg[1], '#000000', 0.3) }); el(gS, 'stop', { offset: 1, 'stop-color': '#050304' });
    const gB = el(defs, 'radialGradient', { id: id + 'b', gradientUnits: 'userSpaceOnUse', cx: 0, cy: -20, r: 340 });
    el(gB, 'stop', { offset: 0, 'stop-color': '#fbfaf6', 'stop-opacity': 1 }); el(gB, 'stop', { offset: 0.65, 'stop-color': '#cfcbc2', 'stop-opacity': 0.95 }); el(gB, 'stop', { offset: 1, 'stop-color': '#8d8981', 'stop-opacity': 0.8 });
    // fan glow behind (warm halo)
    const halo = el(svg, 'ellipse', { cx: ax, cy: ay + R * 0.6, rx: R * 0.75, ry: R * 0.55, fill: pal.glow, opacity: 0.18 });
    el(svg, 'path', { d: fan, fill: `url(#${id}g)` });
    const inner = el(svg, 'g', { 'clip-path': `url(#${id}c)` });
    // speckle grain (static positions, twinkling by groups)
    const speck = [0, 1, 2].map(() => el(inner, 'g'));
    for (let i = 0; i < 520; i++) {
      const a = (r() * 2 - 1) * half, d = 60 + r() * (R - 60);
      el(speck[i % 3], 'circle', { cx: ax + Math.sin(a) * d, cy: ay + Math.cos(a) * d, r: 1.5 + r() * 3.5, fill: tint, opacity: 0.08 + r() * 0.22 });
    }
    // womb wall: bright curved band
    const fcx = ax, fcy = ay + R * (portrait ? 0.56 : 0.55);
    const wall = el(inner, 'ellipse', { cx: fcx, cy: fcy, rx: R * 0.5, ry: R * 0.4, fill: 'none', stroke: tint, 'stroke-width': 34, opacity: 0.4 });
    const wall2 = el(inner, 'ellipse', { cx: fcx, cy: fcy, rx: R * 0.56, ry: R * 0.46, fill: 'none', stroke: tint, 'stroke-width': 10, opacity: 0.18 });
    // baby
    const baby = el(inner, 'g');
    // one continuous silhouette: halo pass (thick tint stroke) then the fill pass, same shapes
    const SKIN = '#e9e6df';
    // side profile facing left: big head with forehead, nose and chin; curled torso; folded leg; hand near the mouth
    const shapes = g => {
      const bg = el(g, 'g');
      el(bg, 'path', { d: 'M20 -50 C150 -40 222 80 186 186 C150 266 50 290 -20 256 C-82 226 -96 160 -72 100 C-56 60 -62 10 -64 -42 Z' });
      el(bg, 'path', { d: 'M150 212 L-42 150', 'stroke-width': 84, fill: 'none' });                 // thigh folded up to the chest
      el(bg, 'path', { d: 'M-42 150 L36 262', 'stroke-width': 60, fill: 'none' });                  // shin
      el(bg, 'path', { d: 'M30 270 L-10 284', 'stroke-width': 40, fill: 'none' });                  // foot
      el(bg, 'path', { d: 'M10 0 L-64 42 L-132 -58', 'stroke-width': 42, fill: 'none' });           // arm, bent up to the face
      el(bg, 'circle', { cx: -140, cy: -70, r: 27 });                                              // hand at the mouth
      const hd = el(g, 'g');
      el(hd, 'path', { d: 'M60 -255 C10 -292 -112 -282 -152 -214 C-170 -184 -168 -160 -172 -140 L-190 -122 L-172 -110 L-178 -96 L-164 -86 C-164 -64 -150 -48 -120 -42 C-80 -36 -40 -40 20 -40 C92 -60 116 -130 100 -192 C92 -226 80 -246 60 -255 Z' });
      return { bg, hd };
    };
    const haloG = el(baby, 'g', { fill: tint, stroke: tint, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.3 });
    const hs = shapes(haloG); [hs.bg, hs.hd].forEach(g => g.querySelectorAll('*').forEach(n => { n.setAttribute('stroke-width', (+n.getAttribute('stroke-width') || 0) + 26); }));
    const fillG = el(baby, 'g', { fill: `url(#${id}b)`, stroke: SKIN, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const fs_ = shapes(fillG);
    el(fs_.hd, 'path', { d: 'M-128 -168 Q-112 -160 -96 -168', fill: 'none', stroke: '#4a4740', 'stroke-width': 7, opacity: 0.7, 'stroke-linecap': 'round' });   // closed eye
    el(fs_.hd, 'path', { d: 'M-40 -150 C-30 -120 -10 -110 10 -118', fill: 'none', stroke: '#8d8981', 'stroke-width': 6, opacity: 0.6, 'stroke-linecap': 'round' }); // ear
    el(fs_.hd, 'path', { d: 'M20 -262 C66 -232 86 -180 76 -130', fill: 'none', stroke: '#ffffff', 'stroke-width': 10, opacity: 0.5, 'stroke-linecap': 'round' });  // rim light
    const bodyG = { setAttribute: (k, v) => { hs.bg.setAttribute(k, v); fs_.bg.setAttribute(k, v); } };
    const headG = { setAttribute: (k, v) => { hs.hd.setAttribute(k, v); fs_.hd.setAttribute(k, v); } };
    const chest = { x: 30, y: 40 };
    const rip = Array.from({ length: 3 }, () => el(inner, 'circle', { fill: 'none', stroke: pal.accent, 'stroke-width': 10 }));
    // scan line
    const scan = el(inner, 'line', { x1: ax, y1: ay, stroke: '#ffffff', 'stroke-width': 6, opacity: 0.35 });
    // fan edge ticks (ultrasound depth scale)
    const ticks = el(svg, 'g', { opacity: 0.55 });
    for (let k = 1; k <= 8; k++) { const d = k / 9 * R, x = ax + Math.sin(half) * d + 18, y = ay + Math.cos(half) * d; el(ticks, 'line', { x1: x, y1: y, x2: x + (k % 2 ? 18 : 30), y2: y, stroke: tint, 'stroke-width': 4 }); }
    el(svg, 'path', { d: fan, fill: 'none', stroke: tint, 'stroke-width': 4, opacity: 0.5 });
    const popTxt = svgText(svg, (P.pop || 'hık').toLocaleUpperCase('tr-TR') + '!', 0, 0, portrait ? 96 : 80,
      { fill: pal.accent, 'font-family': 'Anton', style: `paint-order: stroke; stroke: ${shade(pal.accent, -0.75)}; stroke-width: 12px; filter: drop-shadow(0 0 18px ${rgba(pal.accent, .5)})` });
    const scale = portrait ? 1.25 : 1.05;
    const every = P.every || 0.95;
    return {
      update(lt, dur, cues, env) {
        const t = env.t, hit = cue(cues, 'hit', Math.min(1.0, dur * 0.35));
        bd(t);
        speck.forEach((g, i) => g.setAttribute('opacity', 0.6 + 0.4 * Math.sin(t * 6 + i * 2.1)));
        halo.setAttribute('opacity', 0.16 + 0.05 * Math.sin(t * 1.4));
        // hiccup jolts
        let J = 0, last = -1;
        for (let e = hit; e < lt + 0.01; e += every) { last = e; }
        if (last >= 0) { const d = lt - last; J = d < 0.06 ? d / 0.06 : Math.exp(-(d - 0.06) * 4); }
        const ent = spring(lt, 0, 0.9);
        const floatY = 10 * Math.sin(t * 0.9), rot = 3 * Math.sin(t * 0.6) - 6 * J;
        baby.setAttribute('transform', `translate(${fcx + 8 * J} ${fcy + floatY - 22 * J}) rotate(${rot}) scale(${scale * (0.9 + 0.1 * ent) * (1 + 0.06 * J + 0.06 * punch(lt, hit, 0.6))})`);
        bodyG.setAttribute('transform', `translate(0 ${-10 * J}) scale(1 ${1 + 0.05 * J})`);
        headG.setAttribute('transform', `rotate(${-5 * J} -30 -40)`);
        wall.setAttribute('opacity', 0.36 + 0.08 * Math.sin(t * 1.1)); wall2.setAttribute('rx', R * (0.56 + 0.01 * Math.sin(t)));
        const cxp = fcx + chest.x * scale, cyp = fcy + chest.y * scale + floatY;
        rip.forEach((c, i) => {
          const a = last >= 0 ? lt - last - i * 0.1 : -1, p = clamp01(a / 0.8);
          c.setAttribute('cx', cxp); c.setAttribute('cy', cyp); c.setAttribute('r', 40 + p * 360);
          c.setAttribute('opacity', a > 0 ? (1 - p) * 0.8 : 0);
        });
        // scan sweep
        const sa = Math.sin(t * 1.6) * half * 0.95;
        scan.setAttribute('x2', ax + Math.sin(sa) * R); scan.setAttribute('y2', ay + Math.cos(sa) * R);
        // "HIK!" pop next to the baby
        const pd = last >= 0 ? lt - last : -1, pp = pd >= 0 ? spring(pd, 0, 0.35) * clamp01((every - pd) / 0.3) : 0;
        const px = fcx + (portrait ? 350 : 400), py = fcy - (portrait ? 60 : 70) - 30 * pp;
        popTxt.setAttribute('transform', `translate(${px} ${py}) rotate(-8) scale(${0.6 + 0.4 * pp})`);
        popTxt.setAttribute('opacity', pp);
      },
    };
  },
};
