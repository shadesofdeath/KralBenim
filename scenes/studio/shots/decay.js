// decay: qualitative "each repetition gets a weaker response": a row of glowing response spikes, every new one
// shorter than the last, each tagged with the repeated word; a trend line through the peaks sinks. No numbers.
// P: {label: "KAŞIK", n: 5, ratio: 0.62, axis: "TEPKİ"}   cues: hit (the last, weakest spike lands; trend line flashes)
'use strict';

SHOTS.decay = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg } = ctx;
    const portrait = H > W, n = P.n || 5, ratio = P.ratio || 0.62;
    const bd = backdrop(svg, pal, W, H, 71, { rays: 0.04, cy: H * 0.38 });
    const x0 = portrait ? 150 : 420, x1 = W - (portrait ? 90 : 420);
    const yb = H * (portrait ? 0.55 : 0.72), hMax = H * (portrait ? 0.3 : 0.5);
    const step = (x1 - x0) / n, bw = Math.min(130, step * 0.62);
    // depth: giant ghost words drifting at different speeds (parallax) + a perspective floor with reflections
    const ghosts = [[0.22, 0.12, 360, 0.05], [0.3, 0.6, 250, 0.08], [0.4, 0.3, 170, 0.11]].map(([fy, fx, fs, op], i) =>
      ({ n: svgText(svg, (P.label || 'KAŞIK').toLocaleUpperCase('tr-TR'), W * fx, H * fy, fs, { fill: 'none', stroke: pal.accent2, 'stroke-width': 3, opacity: op, 'font-family': 'Anton', 'text-anchor': 'start' }), sp: 14 + i * 16, x: W * fx }));
    const fy1 = H * (portrait ? 0.79 : 0.98), floor = el(svg, 'g');
    const hl = Array.from({ length: 9 }, () => el(floor, 'line', { x1: 0, x2: W, stroke: pal.accent2, 'stroke-width': 2 }));
    for (let k = -8; k <= 8; k++) el(floor, 'line', { x1: W / 2 + k * 40, y1: yb, x2: W / 2 + k * 260, y2: fy1, stroke: rgba(pal.accent2, 0.08), 'stroke-width': 2 });
    const refl = el(svg, 'g', { opacity: 0.22 });
    // axis + grid
    const grid = el(svg, 'g', { opacity: 0.5 });
    for (let k = 0; k <= 4; k++) el(grid, 'line', { x1: x0 - 20, x2: x1, y1: yb - hMax * k / 4, y2: yb - hMax * k / 4, stroke: rgba(pal.ink, k ? 0.1 : 0.45), 'stroke-width': k ? 2 : 4 });
    const axis = svgText(svg, P.axis || 'TEPKİ', x0 - 50, yb - hMax - 40, 52, { fill: pal.ink, 'font-weight': 900, 'text-anchor': 'start', 'letter-spacing': 2 });
    const arrow = path(svg, `M${x0 - 20} ${yb} V${yb - hMax - 10}`, rgba(pal.ink, 0.6), 4);
    const bars = Array.from({ length: n }, (_, i) => {
      const cx = x0 + step * (i + 0.5), h = hMax * Math.pow(ratio, i);
      const g = el(svg, 'g');
      const glow = el(g, 'rect', { x: cx - bw / 2 - 14, width: bw + 28, rx: bw / 2, fill: rgba(pal.accent, 0.18) });
      const bar = el(g, 'rect', { x: cx - bw / 2, width: bw, rx: bw / 2.4, fill: pal.accent });
      const shine = el(g, 'rect', { x: cx - bw / 2 + bw * 0.16, width: bw * 0.2, rx: bw * 0.1, fill: 'rgba(255,255,255,.35)' });
      const rf = el(refl, 'rect', { x: cx - bw / 2, y: yb + 8, width: bw, rx: bw / 2.4, fill: pal.accent });
      const tag = svgText(svg, (P.label || 'KAŞIK').toLocaleUpperCase('tr-TR'), cx, yb + 66, 44, { fill: pal.ink, 'font-weight': 900, opacity: 0 });
      return { g, glow, bar, shine, tag, rf, cx, h, i };
    });
    const trend = path(svg, bars.map((b, i) => `${i ? 'L' : 'M'}${b.cx} ${yb - b.h - 26}`).join(' '), RED, 8, { 'stroke-dasharray': '1 1' });
    const tip = el(svg, 'circle', { r: 14, fill: RED });
    return {
      update(lt, dur, cues, env) {
        const t = env.t;
        bd(t);
        ghosts.forEach(g => g.n.setAttribute('x', g.x - lt * g.sp));
        hl.forEach((l, k) => { const u = ((k / hl.length + lt * 0.12) % 1), y = yb + (fy1 - yb) * u * u; l.setAttribute('y1', y); l.setAttribute('y2', y); l.setAttribute('opacity', 0.16 * u); });
        const hit = cue(cues, 'hit', dur * 0.75);
        const at = i => n > 1 ? 0.12 + (Math.max(0.6, hit - 0.12) * i) / (n - 1) : 0.12;
        axis.setAttribute('opacity', prog(lt, 0, 0.4));
        draw(arrow, prog(lt, 0, 0.5));
        let last = 0;
        bars.forEach(b => {
          const s = at(b.i), p = spring(lt, s, 0.55), pk = punch(lt, s, 0.6);
          const h = Math.max(1, b.h * p * (1 + 0.025 * Math.sin(t * 5 + b.i)));
          const fade = b.i / Math.max(1, n - 1);
          const c = mix(pal.accent, '#6b7280', fade * 0.85);
          b.bar.setAttribute('y', yb - h); b.bar.setAttribute('height', h); b.bar.setAttribute('fill', c);
          b.glow.setAttribute('y', yb - h - 14); b.glow.setAttribute('height', h + 14); b.glow.setAttribute('fill', rgba(c, 0.12 + 0.35 * pk));
          b.shine.setAttribute('y', yb - h + bw * 0.25); b.shine.setAttribute('height', Math.max(0, h - bw * 0.5));
          b.g.setAttribute('opacity', clamp01(lin(lt, s, 0.1)));
          b.rf.setAttribute('height', h * 0.45); b.rf.setAttribute('fill', c); b.rf.setAttribute('opacity', clamp01(lin(lt, s, 0.1)));
          b.tag.setAttribute('opacity', clamp01(lin(lt, s + 0.05, 0.2)) * (1 - 0.5 * fade));
          b.tag.setAttribute('letter-spacing', (fade * 3).toFixed(1));
          if (lt >= s) last = b.i + clamp01((lt - s) / 0.3);
        });
        const tp = clamp01(last / Math.max(1, n - 1)) * clamp01(lin(lt, at(1), 0.2));
        draw(trend, tp);
        const pts = bars.map(b => [b.cx, yb - b.h - 26]);
        const f = tp * (n - 1), k = Math.min(n - 2, Math.floor(f)), u = f - k;
        const px = lerp(pts[k][0], pts[k + 1][0], u), py = lerp(pts[k][1], pts[k + 1][1], u);
        tip.setAttribute('cx', px); tip.setAttribute('cy', py);
        tip.setAttribute('r', 14 * (1 + 0.6 * punch(lt, hit, 0.7)) * (1 + 0.1 * Math.sin(t * 6)));
        tip.setAttribute('opacity', tp > 0.01 ? 1 : 0);
        trend.setAttribute('stroke-width', 8 + 6 * punch(lt, hit, 0.7));
      },
    };
  },
};
