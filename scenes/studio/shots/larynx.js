// larynx: side cut through the throat. Fleshy walls, two pearly vocal folds jutting in from both sides, a stream of air
// rushing down through the gap between them. At the cue the folds snap shut like a door: the stream above piles up and
// stops, a shock ring bursts from the closed folds, nothing flows below.
// P: {label: "SES TELLERİ", sub: "", flow: "down"|"up", closed: false (start closed), shut: "KAPANDI",
//     big: "HIK!" (sound mode: folds are shut, a giant word slams in at the cue and sound rings pulse out of the folds)}
// cues: label (label draws in), hit (the folds slam shut)
'use strict';

SHOTS.larynx = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg, defs, seed } = ctx;
    const id = 'lx' + (seed || 0);
    const portrait = H > W, r = rng(41);
    const bd = backdrop(svg, pal, W, H, 43, { rays: 0.05, cy: H * 0.38 });
    const top = portrait ? 250 : 90, bot = portrait ? 1160 : 850;
    const fy = (portrait ? 700 : 470) + (P.big ? (portrait ? 200 : 120) : 0), cx = W / 2;
    const half = portrait ? 330 : 300;                                         // half width of the airway
    const dn = (P.flow || 'down') === 'down' ? 1 : -1;
    // gradients
    const gW = el(defs, 'linearGradient', { id: id + 'W', x1: 0, y1: 0, x2: 1, y2: 0 });
    el(gW, 'stop', { offset: 0, 'stop-color': '#4a1620' }); el(gW, 'stop', { offset: 0.75, 'stop-color': '#a8404a' }); el(gW, 'stop', { offset: 1, 'stop-color': '#e07a7c' });
    const gW2 = el(defs, 'linearGradient', { id: id + 'W2', x1: 1, y1: 0, x2: 0, y2: 0 });
    el(gW2, 'stop', { offset: 0, 'stop-color': '#4a1620' }); el(gW2, 'stop', { offset: 0.75, 'stop-color': '#a8404a' }); el(gW2, 'stop', { offset: 1, 'stop-color': '#e07a7c' });
    const gF = el(defs, 'linearGradient', { id: id + 'F', x1: 0, y1: 0, x2: 0, y2: 1 });
    el(gF, 'stop', { offset: 0, 'stop-color': '#fff6ee' }); el(gF, 'stop', { offset: 0.6, 'stop-color': '#efd2c4' }); el(gF, 'stop', { offset: 1, 'stop-color': '#c99486' });
    const gA = el(defs, 'radialGradient', { id: id + 'A' });
    el(gA, 'stop', { offset: 0, 'stop-color': pal.accent2, 'stop-opacity': 0.35 }); el(gA, 'stop', { offset: 1, 'stop-color': pal.accent2, 'stop-opacity': 0 });
    // airway glow (behind everything)
    const airGlow = el(svg, 'ellipse', { cx, cy: (top + bot) / 2, rx: half * 1.1, ry: (bot - top) * 0.6, fill: `url(#${id}A)` });
    // tissue blobs drifting slowly (parallax back layer)
    const blobs = Array.from({ length: 14 }, () => ({ e: el(svg, 'circle', { r: 30 + r() * 70, fill: pal.accent2, opacity: 0.05 + r() * 0.05 }), x: r() * W, y: top + r() * (bot - top), v: 6 + r() * 14 }));
    // air streaks
    const NS_ = 34;
    const streaks = Array.from({ length: NS_ }, (_, i) => ({ e: el(svg, 'line', { stroke: pal.accent2, 'stroke-width': 5 + r() * 5, 'stroke-linecap': 'round' }),
      x: (r() * 2 - 1), ph: r(), sp: 0.7 + r() * 0.5, L: 50 + r() * 70 }));
    // walls (wobbly fleshy edges)
    const wallPath = side => {
      let d = '';
      const N = 44;
      for (let i = 0; i <= N; i++) {
        const y = top - 60 + i / N * (bot - top + 120);
        const bulge = 40 * Math.exp(-((y - fy) ** 2) / (2 * 120 * 120)) + 9 * Math.sin(i * 1.3) + 5 * Math.sin(i * 3.1);
        const x = cx + side * (half - bulge);
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      }
      const xo = side < 0 ? -40 : W + 40;
      d += `L${xo} ${bot + 60} L${xo} ${top - 60} Z`;
      return d;
    };
    const walls = [-1, 1].map(s => el(svg, 'path', { d: wallPath(s), fill: s < 0 ? `url(#${id}W)` : `url(#${id}W2)` }));
    const edges = [-1, 1].map(s => el(svg, 'path', { d: wallPath(s).split('L' + (s < 0 ? -40 : W + 40))[0], fill: 'none', stroke: '#ffb3ae', 'stroke-width': 4, opacity: 0.5 }));
    // vocal folds
    const foldG = el(svg, 'g');
    const folds = [-1, 1].map(s => el(foldG, 'path', { fill: `url(#${id}F)`, stroke: '#fff', 'stroke-width': 3, 'stroke-opacity': 0.6 }));
    const foldShine = [-1, 1].map(() => el(foldG, 'path', { fill: 'none', stroke: '#ffffff', 'stroke-width': 5, opacity: 0.7, 'stroke-linecap': 'round' }));
    const foldPath = (s, tip) => {
      const x0 = cx + s * (half - 30), xt = cx + s * tip;
      return `M${x0} ${fy - 95} C${lerp(x0, xt, 0.5)} ${fy - 80} ${xt + s * 30} ${fy - 30} ${xt} ${fy + 6} C${xt + s * 20} ${fy + 40} ${lerp(x0, xt, 0.4)} ${fy + 70} ${x0} ${fy + 80} Z`;
    };
    // shock rings
    const rings = Array.from({ length: 3 }, () => el(svg, 'ellipse', { cx, cy: fy, fill: 'none', stroke: pal.accent, 'stroke-width': 8 }));
    const flash = el(svg, 'ellipse', { cx, cy: fy, rx: 160, ry: 60, fill: pal.accent, opacity: 0 });
    // label
    const lblG = el(svg, 'g');
    const ly = portrait ? 400 : 200, lx = portrait ? W * 0.5 : W * 0.78;
    const lead = path(lblG, `M${lx} ${ly + 30} L${lx} ${fy - 120} L${cx - 60} ${fy - 30}`, pal.accent, 5);
    const lbl = svgText(lblG, (P.label || 'SES TELLERİ').toLocaleUpperCase('tr-TR'), lx, ly, portrait ? 96 : 80,
      { fill: pal.ink, 'font-family': 'Anton', style: 'paint-order: stroke; stroke: rgba(0,0,0,.55); stroke-width: 10px' });
    const sub = P.sub ? svgText(lblG, P.sub, lx, ly + 60, 44, { fill: pal.ink, 'font-weight': 800, opacity: 0.8 }) : null;
    const shutTxt = svgText(svg, (P.shut || 'KAPANDI').toLocaleUpperCase('tr-TR'), cx, portrait ? 1050 : 760, portrait ? 110 : 90,
      { fill: pal.accent, 'font-family': 'Anton', style: `filter: drop-shadow(0 0 24px ${rgba(pal.accent, .6)})` });
    const big = P.big ? svgText(svg, P.big.toLocaleUpperCase('tr-TR'), cx - (portrait ? 60 : 0), portrait ? 660 : 330, portrait ? 340 : 280,
      { fill: pal.accent, 'font-family': 'Anton', style: `paint-order: stroke; stroke: ${shade(pal.accent, -0.7)}; stroke-width: 18px; filter: drop-shadow(0 0 40px ${rgba(pal.accent, .55)})` }) : null;
    if (big) { lblG.setAttribute('display', 'none'); shutTxt.setAttribute('display', 'none'); }
    return {
      update(lt, dur, cues, env) {
        const t = env.t, hit = cue(cues, 'hit', big ? 0.3 : dur * 0.55), la = cue(cues, 'label', 0.3);
        bd(t);
        blobs.forEach(b => { b.e.setAttribute('cx', b.x + 20 * Math.sin(t * 0.4 + b.v)); b.e.setAttribute('cy', top + ((b.y - top + t * b.v) % (bot - top))); });
        const startClosed = !!P.closed || !!big;
        const close = startClosed ? 1 : EASE(clamp01((lt - hit + 0.02) / 0.09));      // fast snap
        const bounce = lt > hit ? 10 * Math.exp(-(lt - hit) * 9) * Math.sin((lt - hit) * 45) : 0;
        const tip = lerp(150 + 8 * Math.sin(t * 9), 4, close) + bounce;
        [-1, 1].forEach((s, i) => {
          folds[i].setAttribute('d', foldPath(s, tip));
          const x0 = cx + s * (half - 40), xt = cx + s * (tip + 14);
          foldShine[i].setAttribute('d', `M${x0} ${fy - 70} Q${lerp(x0, xt, 0.6)} ${fy - 50} ${xt} ${fy - 6}`);
        });
        // walls breathe slightly
        walls.forEach((w, i) => w.setAttribute('transform', `translate(${(i ? 1 : -1) * 6 * Math.sin(t * 1.3)} 0)`));
        // air: flows through the gap while open; above the folds it piles up after the snap
        const hp = punch(lt, hit, 0.9);
        streaks.forEach(s => {
          const u = (s.ph + lt * s.sp * (lt < hit ? 1 : Math.exp(-(lt - hit) * 3) * 0.5)) % 1;
          let y = dn > 0 ? top + u * (bot - top) : bot - u * (bot - top);
          const near = Math.exp(-((y - fy) ** 2) / (2 * 140 * 140));
          const halfAt = lerp(half - 60, tip - 10, near);                          // squeeze through the gap
          let x = cx + s.x * Math.max(8, halfAt);
          let op = 0.75;
          if (close > 0.5) {
            if ((dn > 0 && y > fy - 110) || (dn < 0 && y < fy + 110)) {         // past the folds: nothing flows any more
              const past = dn > 0 ? y > fy + 30 : y < fy - 30;
              if (past) op *= Math.exp(-(lt - hit) * 6);
              else { y = fy - dn * (110 + 80 * Math.abs(s.x) * (s.ph)); x = cx + s.x * (half - 70); }
            }
          }
          const L = s.L * (lt < hit ? 1.4 : 0.6 + 0.6 * Math.exp(-(lt - hit) * 3));
          s.e.setAttribute('x1', x); s.e.setAttribute('x2', x); s.e.setAttribute('y1', y - dn * L / 2); s.e.setAttribute('y2', y + dn * L / 2);
          s.e.setAttribute('opacity', op * clamp01(Math.sin(Math.PI * u) * 3));
          s.e.setAttribute('stroke', close > 0.5 ? mix(pal.accent2, RED, clamp01((lt - hit) * 2)) : pal.accent2);
        });
        airGlow.setAttribute('opacity', 1 - 0.6 * close);
        rings.forEach((g, i) => {
          const a = big ? ((lt - hit) > 0 ? (lt - hit - i * 0.3) % 0.9 : -1) : lt - hit - i * 0.14, p = clamp01(a / 0.9);
          g.setAttribute('rx', 60 + p * 520); g.setAttribute('ry', 20 + p * 200);
          g.setAttribute('opacity', a > 0 ? (1 - p) * 0.9 : 0);
        });
        flash.setAttribute('opacity', 0.9 * hp);
        foldG.setAttribute('transform', `translate(${cx} ${fy}) scale(${1 + 0.06 * hp}) translate(${-cx} ${-fy})`);
        if (big) {
          const bs = spring(lt, hit, 0.5), bp = punch(lt, hit, 0.7);
          const by = portrait ? 660 : 330, wob = 1 + 0.03 * Math.sin(t * 9) * Math.exp(-Math.max(0, lt - hit) * 1.5);
          big.setAttribute('opacity', clamp01(lin(lt, hit, 0.08)));
          big.setAttribute('transform', `translate(${cx} ${by - 120}) scale(${lerp(2.2, 1, bs) * (1 + 0.08 * bp) * wob}) rotate(${-4 + 4 * (1 - bs)}) translate(${-cx} ${-(by - 120)})`);
        }
        const a = prog(lt, la, 0.4);
        draw(lead, prog(lt, la, 0.6));
        lbl.setAttribute('opacity', a); if (sub) sub.setAttribute('opacity', 0.8 * a);
        lbl.setAttribute('transform', `translate(0 ${(1 - spring(lt, la, 0.6)) * 30})`);
        const sa = spring(lt, hit + 0.05, 0.5);
        shutTxt.setAttribute('opacity', clamp01(sa * 1.2));
        shutTxt.setAttribute('transform', `translate(${cx} ${portrait ? 1050 : 760}) scale(${0.6 + 0.4 * sa + 0.08 * hp}) translate(${-cx} ${-(portrait ? 1050 : 760)})`);
      },
    };
  },
};
