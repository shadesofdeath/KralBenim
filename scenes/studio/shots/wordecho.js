// wordecho: one word repeated until it loses meaning. echo = every repetition slams in a new copy while the older
// copies shrink back into a tunnel and fade to outlines (a "meaning" meter drains); scatter = the word's letters
// break apart into a meaningless pile of sounds over a jittering sound wave.
// P: {word: "KAŞIK", mode: "echo"|"scatter", n: 5, meter: "ANLAM", y: 0.43}
// cues: echo -> first, last (the first and last spoken repetition; the ones between are spaced evenly);
//       scatter -> hit (letters fly apart)
'use strict';

SHOTS.wordecho = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg, defs } = ctx;
    const portrait = H > W, mode = P.mode || 'echo';
    const word = (P.word || 'KAŞIK').toLocaleUpperCase('tr-TR');
    const bd = backdrop(svg, pal, W, H, 61, { rays: 0.05, cy: H * 0.33 });
    const vp = [W / 2, H * (portrait ? 0.235 : 0.3)];
    const baseY = H * (P.y ?? (portrait ? 0.43 : 0.5));
    // fit the front copy
    const probe = svgText(svg, word, -9999, 0, 340, { 'font-family': 'Anton' });
    let size = portrait ? 340 : 300;
    const maxW = W - (portrait ? 170 : 600);
    while (probe.getComputedTextLength() > maxW && size > 120) { size -= 8; probe.setAttribute('font-size', size); }
    probe.remove();

    // tunnel frames (continuous zoom toward the vanishing point)
    const tunnel = el(svg, 'g');
    const NF = 9;
    const frames = Array.from({ length: NF }, () => el(tunnel, 'rect', { fill: 'none', stroke: pal.accent2, 'stroke-width': 4, rx: 30 }));

    const R = rng(ctx.seed * 7 + 3);
    let copies = [], letters = [], wave = [], meter = null;
    if (mode === 'echo') {
      const n = P.n || 5;
      copies = Array.from({ length: n }, (_, k) => {
        const g = el(svg, 'g');
        const halo = svgText(g, word, 0, 0, size, { 'font-family': 'Anton', fill: 'none', stroke: pal.accent, 'stroke-width': 22, 'stroke-linejoin': 'round', opacity: 0.5, 'dominant-baseline': 'central' });
        const sh = svgText(g, word, size * 0.03, size * 0.04, size, { 'font-family': 'Anton', fill: shade(pal.glow, -0.6), 'dominant-baseline': 'central' });
        const tx = svgText(g, word, 0, 0, size, { 'font-family': 'Anton', fill: pal.ink, stroke: pal.accent2, 'stroke-width': 0, 'dominant-baseline': 'central' });
        return { g, halo, sh, tx, k, rot: (k % 2 ? 1 : -1) * (2 + R() * 3) };
      });
      // meaning meter
      const my = baseY + size * 0.75 + (portrait ? 40 : 10);
      meter = el(svg, 'g');
      const lab = svgText(meter, P.meter || 'ANLAM', W / 2 - 250, my + 18, 52, { fill: pal.ink, 'font-weight': 900, 'text-anchor': 'end', 'letter-spacing': 2 });
      el(meter, 'rect', { x: W / 2 - 220, y: my - 20, width: 480, height: 44, rx: 22, fill: 'rgba(255,255,255,.08)', stroke: rgba(pal.ink, 0.25), 'stroke-width': 2 });
      const bar = el(meter, 'rect', { x: W / 2 - 214, y: my - 14, width: 468, height: 32, rx: 16, fill: pal.accent });
      meter._bar = bar; meter._lab = lab; meter._y = my;
    } else {
      const chars = [...word];
      const probe2 = svgText(svg, '', -9999, 0, size, { 'font-family': 'Anton' });
      const widths = chars.map(c => { probe2.textContent = c; return probe2.getComputedTextLength(); });
      probe2.remove();
      const gap = size * 0.04, total = widths.reduce((a, b) => a + b, 0) + gap * (chars.length - 1);
      let x = (W - total) / 2;
      letters = chars.map((c, i) => {
        const g = el(svg, 'g');
        const sh = svgText(g, c, size * 0.03, size * 0.04, size, { 'font-family': 'Anton', fill: shade(pal.glow, -0.6), 'dominant-baseline': 'central' });
        const tx = svgText(g, c, 0, 0, size, { 'font-family': 'Anton', fill: i % 2 ? pal.accent : pal.ink, 'dominant-baseline': 'central' });
        const hx = x + widths[i] / 2; x += widths[i] + gap;
        // where the letter ends up: a loose, shuffled spread over the main stage (no overlaps, clear of the corners)
        const SPOTS = portrait ? [[0.68, 0.43], [0.25, 0.25], [0.8, 0.31], [0.3, 0.44], [0.55, 0.19], [0.5, 0.33], [0.18, 0.36], [0.84, 0.45]]
          : [[0.62, 0.62], [0.25, 0.3], [0.78, 0.35], [0.38, 0.66], [0.52, 0.25], [0.5, 0.45], [0.16, 0.5], [0.86, 0.6]];
        const sp0 = SPOTS[i % SPOTS.length];
        const tx0 = W * sp0[0] + (R() - 0.5) * 40, ty0 = H * sp0[1] + (R() - 0.5) * 30;
        return { g, sh, tx, hx, to: [tx0, ty0],
          rot: (R() - 0.5) * 60, sc: 0.72 + R() * 0.3, ph: R() * 6.28, sp: 1.2 + R() * 1.6 };
      });
      const wy = H * (portrait ? 0.565 : 0.8), NB = 46, x0 = W * 0.1, x1 = W * 0.9, bw = (x1 - x0) / NB;
      wave = Array.from({ length: NB }, (_, i) => ({ r: el(svg, 'rect', { x: x0 + i * bw + bw * 0.18, width: bw * 0.64, rx: bw * 0.3, fill: i % 3 ? pal.accent2 : pal.accent }),
        y: wy, k: 2 + R() * 7, ph: R() * 6.28, env: Math.sin(Math.PI * (i + 0.5) / NB) }));
    }

    return {
      update(lt, dur, cues, env) {
        const t = env.t;
        bd(t);
        frames.forEach((f, i) => {
          const u = ((i / NF + lt * 0.22) % 1 + 1) % 1, z = 0.06 * Math.pow(16, u);
          const w = W * 1.05 * z, h = H * (portrait ? 0.62 : 0.9) * z;
          f.setAttribute('x', vp[0] - w / 2); f.setAttribute('y', vp[1] - h / 2 + (baseY - vp[1]) * Math.min(1, z) * 0.5);
          f.setAttribute('width', w); f.setAttribute('height', h);
          f.setAttribute('opacity', 0.32 * Math.sin(Math.PI * u) * (mode === 'echo' ? 1 : 0.5));
        });
        if (mode === 'echo') {
          const n = copies.length;
          const a = cue(cues, 'first', 0.12), b = cue(cues, 'last', Math.max(a + 0.4, dur * 0.72));
          const at = k => n > 1 ? a + (b - a) * k / (n - 1) : a;
          let shown = 0;
          copies.forEach((c, k) => {
            const tk = at(k), p = spring(lt, tk, 0.45), on = lin(lt, tk, 0.08);
            shown += prog(lt, tk, 0.3);
            let age = 0; for (let j = k + 1; j < n; j++) age += prog(lt, at(j) - 0.05, 0.22);
            const s = Math.pow(0.7, age) * lerp(1.35, 1, p) * (1 + 0.012 * Math.sin(t * 2 + k));
            const x = vp[0] + Math.sin(t * 0.7 + k) * 6 * age;
            const y = vp[1] + (baseY - vp[1]) * Math.pow(0.7, age);
            const pk = punch(lt, tk, 0.6);
            c.g.setAttribute('transform', `translate(${x} ${y}) rotate(${c.rot * clamp01(age) + (1 - p) * c.rot * 2}) scale(${s})`);
            c.g.setAttribute('opacity', on * (age < 1 ? lerp(1, 0.35, age) : 0.35 * Math.pow(0.8, age - 1)));
            const old = clamp01(age);
            c.tx.setAttribute('fill', old > 0.5 ? 'none' : (pk > 0.3 ? pal.accent : pal.ink));
            c.tx.setAttribute('stroke-width', 7 * old / Math.max(0.3, Math.pow(0.7, age)));
            c.tx.setAttribute('letter-spacing', (size * 0.05 * age).toFixed(1));
            c.sh.setAttribute('letter-spacing', (size * 0.05 * age).toFixed(1));
            c.halo.setAttribute('letter-spacing', (size * 0.05 * age).toFixed(1));
            c.sh.setAttribute('opacity', 1 - old);
            c.halo.setAttribute('opacity', (0.1 + 0.35 * pk) * (1 - old) * p);
          });
          const m = 1 - 0.86 * shown / n;
          meter._bar.setAttribute('width', Math.max(6, 468 * m));
          meter._bar.setAttribute('fill', mix(RED, pal.accent, clamp01((m - 0.15) / 0.6)));
          meter.setAttribute('opacity', clamp01(lin(lt, 0.1, 0.3)) * (0.85 + 0.15 * Math.sin(t * 6) * (m < 0.4 ? 1 : 0)));
        } else {
          const hit = cue(cues, 'hit', Math.min(0.8, dur * 0.3));
          const sp = progIO(lt, hit - 0.1, 0.9), shake = 0.3 + 0.7 * prog(lt, 0, hit + 0.1);
          letters.forEach((L, i) => {
            const wob = Math.sin(t * L.sp * 2 + L.ph);
            const x = lerp(L.hx, L.to[0], sp) + wob * (4 * shake + 18 * sp);
            const y = lerp(baseY, L.to[1], sp) + Math.cos(t * L.sp * 1.7 + L.ph) * (3 * shake + 22 * sp);
            const s = lerp(1, L.sc, sp) * (1 + 0.1 * punch(lt, hit, 0.6));
            const r = L.rot * sp + wob * (2 * shake + 6 * sp);
            L.g.setAttribute('transform', `translate(${x} ${y}) rotate(${r}) scale(${s})`);
            L.g.setAttribute('opacity', clamp01(lin(lt, 0, 0.15)));
          });
          const amp = 0.25 + 0.75 * prog(lt, hit - 0.2, 0.6);
          wave.forEach(b => {
            const h = 14 + 120 * amp * b.env * (0.35 + 0.65 * Math.abs(Math.sin(t * b.k + b.ph) * Math.cos(t * b.k * 0.37 + b.ph * 2)));
            b.r.setAttribute('y', b.y - h / 2); b.r.setAttribute('height', h);
            b.r.setAttribute('opacity', 0.85);
          });
        }
      },
    };
  },
};
