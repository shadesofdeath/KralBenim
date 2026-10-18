// signal: a two-node chain where something still arrives but the link onward is broken.
// Top node (e.g. SES ✓) sends pulses down a bridge; at the "right" cue the bridge cracks open, pulses spill out
// of the gap, a red ✗ appears and the bottom node (e.g. ANLAM) goes grey.
// P: {top: {label: "SES", sub: "kulağa ulaşıyor", icon: "sound"}, bottom: {label: "ANLAM", sub: "kurulmuyor", icon: "question"}}
// cues: left (top node lights, ✓), right (bridge breaks, ✗)
'use strict';

SHOTS.signal = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg } = ctx;
    const portrait = H > W;
    const bd = backdrop(svg, pal, W, H, 81, { rays: 0.05, cy: H * 0.3 });
    const T = P.top || { label: 'SES', sub: 'kulağa ulaşıyor', icon: 'sound' };
    const B = P.bottom || { label: 'ANLAM', sub: 'kurulmuyor', icon: 'question' };
    const nx = portrait ? W * 0.3 : W * 0.38, ay = portrait ? H * 0.235 : H * 0.22, by = portrait ? H * 0.53 : H * 0.72, R = portrait ? 100 : 80;
    const gy = (ay + by) / 2 + 20, gap = 46;                                  // where the bridge breaks
    const G = GREEN, GREY = '#6b7280';
    // sound rings from the top node
    const rings = Array.from({ length: 4 }, () => el(svg, 'circle', { cx: nx, cy: ay, fill: 'none', stroke: G, 'stroke-width': 5 }));
    // bridge: upper half / lower half (separate so they can split)
    const up = el(svg, 'g'), lo = el(svg, 'g');
    const bw = 26;
    el(up, 'rect', { x: nx - bw / 2 - 10, y: ay + R - 10, width: bw + 20, height: gy - ay - R + 10, rx: 18, fill: rgba(G, 0.14) });
    const upBar = el(up, 'rect', { x: nx - bw / 2, y: ay + R - 10, width: bw, height: gy - ay - R + 10, rx: bw / 2, fill: G });
    el(up, 'path', { d: `M${nx - bw / 2} ${gy} l8 -14 l8 12 l8 -12 l4 10 V${gy - 2} Z`, fill: shade(G, -0.3) });
    const loBar = el(lo, 'rect', { x: nx - bw / 2, y: gy, width: bw, height: by - R - gy + 10, rx: bw / 2, fill: G });
    // nodes
    const node = (y, S, top) => {
      const g = el(svg, 'g');
      const halo = el(g, 'circle', { cx: nx, cy: y, r: R * 1.45, fill: rgba(G, 0.18) });
      const disc = el(g, 'circle', { cx: nx, cy: y, r: R, fill: shade(pal.bg[1], -0.2), stroke: G, 'stroke-width': 8 });
      const ic = ICONS[S.icon] ? el(g, 'path', { d: ICONS[S.icon], transform: `translate(${nx - R * 0.62} ${y - R * 0.62}) scale(${R * 1.24 / 100})`, fill: 'none', stroke: G, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }) : null;
      const tx = nx + R + 50;
      const lab = svgText(g, S.label || '', tx, y + 14, portrait ? 130 : 110, { fill: G, 'font-family': 'Anton', 'text-anchor': 'start' });
      let fs = portrait ? 130 : 110; while (lab.getComputedTextLength() > W - tx - 60 && fs > 60) { fs -= 6; lab.setAttribute('font-size', fs); }
      const sub = svgText(g, S.sub || '', tx, y + 80, 46, { fill: pal.ink, 'font-weight': 800, 'text-anchor': 'start', opacity: 0.85 });
      let fs2 = 46; while (sub.getComputedTextLength() > W - tx - 50 && fs2 > 40) { fs2 -= 2; sub.setAttribute('font-size', fs2); }
      const mk = el(g, 'g');
      const mx = nx - R * 0.8, my = y - R * 0.8;
      el(mk, 'circle', { cx: mx, cy: my, r: 40, fill: top ? GREEN : RED });
      el(mk, 'path', { d: ICONS[top ? 'check' : 'x'], transform: `translate(${mx - 22} ${my - 22}) scale(.44)`, fill: 'none', stroke: '#fff', 'stroke-width': 18, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
      return { g, halo, disc, ic, lab, sub, mk, mc: [mx, my], y };
    };
    const A = node(ay, T, true), Bn = node(by, B, false);
    // red ✗ at the gap
    const gx = el(svg, 'g');
    el(gx, 'circle', { cx: nx, cy: gy + gap / 2, r: 58, fill: RED, style: `filter: drop-shadow(0 0 18px ${rgba(RED, .7)})` });
    el(gx, 'path', { d: ICONS.x, transform: `translate(${nx - 30} ${gy + gap / 2 - 30}) scale(.6)`, fill: 'none', stroke: '#fff', 'stroke-width': 18, 'stroke-linecap': 'round' });
    // pulses travelling down
    const NP = 7, r = rng(ctx.seed * 5 + 1);
    const pulses = Array.from({ length: NP }, (_, i) => ({ c: el(svg, 'circle', { r: 16, fill: '#ffffff' }), ph: i / NP, dx: (r() - 0.5) * 2 }));
    return {
      update(lt, dur, cues, env) {
        const t = env.t;
        bd(t);
        const L = cue(cues, 'left', 0.15), Rt = cue(cues, 'right', dur * 0.55);
        const pa = spring(lt, L - 0.2, 0.6), brk = progIO(lt, Rt - 0.1, 0.5), bp = punch(lt, Rt, 0.7);
        // nodes
        A.g.setAttribute('opacity', clamp01(lin(lt, 0, 0.2)));
        A.g.setAttribute('transform', `translate(${nx} ${ay}) scale(${(0.8 + 0.2 * pa) * (1 + 0.06 * punch(lt, L, 0.6))}) translate(${-nx} ${-ay})`);
        A.halo.setAttribute('r', R * (1.35 + 0.12 * Math.sin(t * 4)));
        A.mk.setAttribute('transform', `translate(${A.mc[0]} ${A.mc[1]}) scale(${spring(lt, L + 0.3, 0.5)}) translate(${-A.mc[0]} ${-A.mc[1]})`);
        const bcol = mix(G, GREY, brk);
        Bn.g.setAttribute('opacity', clamp01(lin(lt, 0.1, 0.3)) * (1 - 0.35 * brk));
        Bn.disc.setAttribute('stroke', mix(G, RED, brk * 0.8)); if (Bn.ic) Bn.ic.setAttribute('stroke', bcol);
        Bn.lab.setAttribute('fill', mix(G, RED, brk)); Bn.halo.setAttribute('fill', rgba(mix(G, RED, brk), 0.16 * (1 - 0.6 * brk)));
        Bn.halo.setAttribute('r', R * (1.35 + 0.1 * Math.sin(t * 3 + 1)) * (1 - 0.2 * brk));
        Bn.mk.setAttribute('transform', `translate(${Bn.mc[0]} ${Bn.mc[1]}) scale(${spring(lt, Rt + 0.25, 0.5)}) translate(${-Bn.mc[0]} ${-Bn.mc[1]})`);
        const shake = bp * 10 * Math.sin(t * 60);
        Bn.g.setAttribute('transform', `translate(${shake} 0)`);
        // bridge splits
        up.setAttribute('transform', `translate(${-8 * brk} ${-gap / 2 * brk}) rotate(${-4 * brk} ${nx} ${ay})`);
        lo.setAttribute('transform', `translate(${10 * brk} ${gap / 2 * brk + 30 * brk}) rotate(${6 * brk} ${nx} ${by})`);
        up.setAttribute('opacity', clamp01(lin(lt, 0.05, 0.3)));
        lo.setAttribute('opacity', clamp01(lin(lt, 0.05, 0.3)) * (1 - 0.55 * brk));
        loBar.setAttribute('fill', bcol);
        gx.setAttribute('transform', `translate(${nx} ${gy + gap / 2}) scale(${spring(lt, Rt, 0.5) * (1 + 0.15 * bp)}) translate(${-nx} ${-gy - gap / 2})`);
        // rings
        rings.forEach((c, i) => { const u = ((lt * 0.7 + i / 4) % 1); c.setAttribute('r', R * (1 + 1.6 * u)); c.setAttribute('opacity', 0.5 * (1 - u) * pa); });
        // pulses
        pulses.forEach(p => {
          const u = (lt * 0.8 + p.ph) % 1;
          let y = lerp(ay + R, by - R, u), x = nx, a = 1, s = 1;
          const pastGap = y > gy - gap / 2 * brk;
          if (pastGap && brk > 0.5) {                     // spill out of the gap and fade
            const f = (y - gy) / (by - gy);
            x = nx + p.dx * 160 * clamp01(f * 3); y = gy + (y - gy) * 0.6 + 60 * f * f; a = 1 - clamp01(f * 2.5); s = 1 - 0.5 * clamp01(f * 2);
          }
          p.c.setAttribute('cx', x); p.c.setAttribute('cy', y);
          p.c.setAttribute('r', 15 * s);
          p.c.setAttribute('fill', pastGap && brk > 0.5 ? RED : '#ffffff');
          p.c.setAttribute('opacity', a * clamp01(lin(lt, L - 0.1, 0.3)) * Math.sin(Math.PI * u));
        });
      },
    };
  },
};
