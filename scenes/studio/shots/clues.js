// clues: an archaeologist's evidence board. 1–3 finds slam onto a dark ground one by one, each with a hand-drawn
// glowing icon, a big name and a small note; a dashed string links them and an optional verdict stamp lands at the end.
// P: {items: [{icon: "pomegranate"|"nut"|"brazier"|"wall"|"scroll"|"coin", label: "NAR", sub: "sonbahar meyvesi", text: "XVI K NOV"}],
//     verdict: "SONBAHAR" (optional stamp), verdict_sub: "..."}
// cues: c0, c1, c2 (each find lands), verdict (stamp)
'use strict';

const CLUE_ICONS = {
  pomegranate: (g, c) => {
    el(g, 'circle', { cx: 0, cy: 12, r: 78, fill: '#b3263a', stroke: '#ffd6c8', 'stroke-width': 6 });
    el(g, 'path', { d: 'M-22 -60 L-14 -88 L0 -70 L14 -88 L22 -60 Z', fill: '#8a1c2c', stroke: '#ffd6c8', 'stroke-width': 6, 'stroke-linejoin': 'round' });
    const r = rng(3); for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = r() * 40; el(g, 'circle', { cx: Math.cos(a) * d + 6, cy: 20 + Math.sin(a) * d, r: 7, fill: '#ff6a7a', opacity: 0.9 }); }
    el(g, 'path', { d: 'M-48 -20 C-30 -44 10 -50 34 -34', fill: 'none', stroke: 'rgba(255,255,255,.45)', 'stroke-width': 8, 'stroke-linecap': 'round' });
  },
  nut: (g, c) => {
    el(g, 'ellipse', { cx: 0, cy: 6, rx: 72, ry: 82, fill: '#8a5a2e', stroke: '#f3d8a8', 'stroke-width': 6 });
    el(g, 'path', { d: 'M0 -76 V88', stroke: '#f3d8a8', 'stroke-width': 5 });
    for (const s of [-1, 1]) el(g, 'path', { d: `M${s * 10} -50 C${s * 50} -40 ${s * 20} -10 ${s * 52} 0 C${s * 20} 16 ${s * 50} 40 ${s * 12} 60`, fill: 'none', stroke: '#5a3a1a', 'stroke-width': 7, 'stroke-linecap': 'round' });
  },
  brazier: (g, c) => {
    el(g, 'path', { d: 'M-80 0 H80 L60 50 H-60 Z', fill: '#6b5a48', stroke: '#e8d2b0', 'stroke-width': 6, 'stroke-linejoin': 'round' });
    el(g, 'path', { d: 'M-50 50 L-66 96 M50 50 L66 96 M0 50 V96', stroke: '#e8d2b0', 'stroke-width': 8, 'stroke-linecap': 'round' });
    g._flame = el(g, 'path', { d: 'M-40 0 C-50 -40 -20 -50 -16 -84 C6 -60 0 -40 14 -46 C18 -70 30 -76 30 -90 C56 -60 56 -24 40 0 Z', fill: c, opacity: 0.95 });
    for (let i = 0; i < 5; i++) el(g, 'circle', { cx: -44 + i * 22, cy: -4, r: 12, fill: '#2a1a12', stroke: '#ff8a3a', 'stroke-width': 3 });
  },
  wall: (g, c) => {
    el(g, 'rect', { x: -130, y: -80, width: 260, height: 160, rx: 10, fill: '#d9ccb0', stroke: '#fff3dc', 'stroke-width': 5 });
    const r = rng(9); for (let i = 0; i < 18; i++) el(g, 'circle', { cx: -120 + r() * 240, cy: -70 + r() * 140, r: 3 + r() * 6, fill: '#b9aa8c', opacity: 0.7 });
    g._txt = svgText(g, '', 0, 20, 54, { fill: '#2a2220', 'font-family': 'Anton', 'letter-spacing': '0.06em' });
  },
  scroll: (g, c) => {
    el(g, 'rect', { x: -90, y: -70, width: 180, height: 140, fill: '#e9d9b4', stroke: '#fff3dc', 'stroke-width': 5 });
    for (const y of [-70, 70]) el(g, 'rect', { x: -104, y: y - 12, width: 208, height: 24, rx: 12, fill: '#8a5a2e' });
    for (let i = 0; i < 5; i++) el(g, 'path', { d: `M-66 ${-40 + i * 22} H${40 - (i % 2) * 30}`, stroke: '#6b5a48', 'stroke-width': 7, 'stroke-linecap': 'round' });
  },
  lamp: (g, c) => {
    // Roman clay oil lamp (lucerna) with a small, low flame
    el(g, 'path', { d: 'M-110 20 C-110 -14 -60 -30 0 -30 C40 -30 70 -20 88 -6 L128 -12 C126 12 110 24 86 22 C60 46 -70 50 -110 20 Z', fill: '#9a5a32', stroke: '#f3d8a8', 'stroke-width': 6, 'stroke-linejoin': 'round' });
    el(g, 'ellipse', { cx: -14, cy: -22, rx: 46, ry: 12, fill: '#6b3a1e', stroke: '#f3d8a8', 'stroke-width': 4 });
    el(g, 'circle', { cx: -14, cy: -22, r: 7, fill: '#2a160c' });
    el(g, 'path', { d: 'M-110 6 C-140 0 -150 -30 -128 -40', fill: 'none', stroke: '#f3d8a8', 'stroke-width': 8, 'stroke-linecap': 'round' });
    g._flame = el(g, 'path', { d: 'M118 -14 C104 -36 116 -60 124 -78 C138 -58 140 -34 126 -14 Z', fill: c, opacity: 0.8 });
  },
  coin: (g, c) => {
    el(g, 'circle', { cx: 0, cy: 0, r: 80, fill: '#c9a44a', stroke: '#fff0c0', 'stroke-width': 6 });
    el(g, 'circle', { cx: 0, cy: 0, r: 62, fill: 'none', stroke: '#8a6a20', 'stroke-width': 4, 'stroke-dasharray': '6 8' });
  },
};

SHOTS.clues = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg } = ctx;
    const portrait = H > W;
    const bd = backdrop(svg, pal, W, H, 61, { rays: 0.035, cy: H * 0.4 });
    const items = (P.items || []).slice(0, 3), n = items.length;
    // landscape: a row across the main area (y 150–820); portrait: a column
    const solo = n === 1;
    const pos = k => solo ? [W / 2, portrait ? 640 : 510] : portrait ? [W / 2, 420 + k * 260 + (3 - n) * 130] : [W / 2 + (k - (n - 1) / 2) * (n === 3 ? 560 : 640), 430];
    const string = el(svg, 'path', { fill: 'none', stroke: rgba(pal.accent, 0.7), 'stroke-width': 5, 'stroke-dasharray': '16 14' });
    const nodes = items.map((it, k) => {
      const [x, y] = pos(k);
      const g = el(svg, 'g');
      // solo: the find big on one side (landscape: left, ≥ 600 px wide), its name huge on the other
      const K = solo ? 2.4 : 1, icx = solo ? (portrait ? 0 : -W * 0.19) : 0, icy = solo && portrait ? -180 : 0;
      const holder = el(g, 'g', { transform: `translate(${icx} ${icy}) scale(${K})` });
      el(holder, 'circle', { cx: 0, cy: 0, r: 150, fill: rgba(pal.glow, solo ? 0.1 : 0.16) });
      if (!solo) el(holder, 'circle', { cx: 0, cy: 0, r: 136, fill: shade(pal.bg[1], -0.35), stroke: rgba(pal.accent2, 0.5), 'stroke-width': 4 });
      const ic = el(holder, 'g');
      (CLUE_ICONS[it.icon] || CLUE_ICONS.coin)(ic, pal.accent);
      if (ic._txt) ic._txt.textContent = it.text || '';
      const lx = solo && !portrait ? W * 0.21 : 0, ly = solo ? (portrait ? 300 : 40) : 230;
      const lab = svgText(g, (it.label || '').toLocaleUpperCase('tr-TR'), lx, ly, solo ? 170 : 84, { fill: solo ? pal.accent : pal.ink, 'font-family': 'Anton' });
      const sub = it.sub ? svgText(g, it.sub, lx, ly + (solo ? 80 : 60), solo ? 50 : 44, { fill: pal.ink, opacity: 0.85, 'font-weight': 700 }) : null;
      return { g, ic, x, y, k };
    });
    let stamp = null;
    if (P.verdict) {
      stamp = el(svg, 'g');
      const sx = W / 2, sy = portrait ? 1080 : 170;
      const t = svgText(stamp, P.verdict.toLocaleUpperCase('tr-TR'), sx, sy + 30, 96, { fill: pal.accent, 'font-family': 'Anton', 'letter-spacing': '0.04em' });
      const w = t.getComputedTextLength() + 80;
      el(stamp, 'rect', { x: sx - w / 2, y: sy - 62, width: w, height: 118, rx: 14, fill: 'none', stroke: pal.accent, 'stroke-width': 8 });
      stamp._c = [sx, sy];
    }
    return {
      update(lt, dur, cues, env) {
        bd(env.t);
        let pts = [];
        nodes.forEach(o => {
          const at = cue(cues, 'c' + o.k, 0.2 + o.k * 0.7), p = spring(lt, at, 0.6), pk = punch(lt, at, 0.6);
          const bob = Math.sin(env.t * 1.4 + o.k * 2) * 8;
          o.g.setAttribute('transform', `translate(${o.x} ${o.y + bob + (1 - p) * -120}) scale(${lerp(1.6, 1, p) * (1 + 0.07 * pk)}) rotate(${(1 - p) * (o.k % 2 ? 8 : -8)})`);
          o.g.setAttribute('opacity', clamp01(lin(lt, at, 0.15)));
          o.ic.setAttribute('transform', `rotate(${3 * Math.sin(env.t * 1.1 + o.k)})`);
          if (o.ic._flame) { o.ic._flame.setAttribute('opacity', 0.55 + 0.25 * Math.sin(env.t * 7 + o.k) * Math.sin(env.t * 3.1)); }
          if (lt >= at + 0.2) pts.push([o.x, o.y + bob]);
        });
        string.setAttribute('d', pts.length > 1 ? 'M' + pts.map(p => p.join(' ')).join(' L') : '');
        string.setAttribute('stroke-dashoffset', -env.t * 30);
        if (stamp) {
          const at = cue(cues, 'verdict', dur * 0.75), p = spring(lt, at, 0.5);
          const [sx, sy] = stamp._c;
          stamp.setAttribute('opacity', clamp01(lin(lt, at, 0.1)));
          stamp.setAttribute('transform', `translate(${sx} ${sy}) rotate(${-6 + (1 - p) * -10}) scale(${lerp(2.2, 1, p)}) translate(${-sx} ${-sy})`);
        }
      },
    };
  },
};
