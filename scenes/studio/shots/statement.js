// statement: closing punchline in giant type with generous Turkish-cap line spacing (İ, Ğ, Ş never collide),
// and below it a glowing brain outline with signals running around it.
// P: {lines: ["Anlam", "kelimede değil,", "beyninde!"], highlight: ["beyninde!"], icon: "brain"}
// cues: w0, w1, ... (each word slams in), the highlighted word also lights the brain
'use strict';

SHOTS.statement = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg } = ctx;
    const portrait = H > W;
    const bd = backdrop(svg, pal, W, H, 91, { rays: 0.06, cy: H * 0.3 });
    const lines = P.lines || [];
    const hl = (P.highlight || []).map(s => s.toLocaleUpperCase('tr-TR'));
    const maxW = W - (portrait ? 150 : 400);
    const top = H * (portrait ? 0.14 : 0.12), bottom = H * (portrait ? 0.575 : 0.8);
    // measure every row at a common start size, then shrink rows that are too wide
    const g = el(svg, 'g');
    const all = [], rows = [];
    for (const ln of lines) {
      const row = { nodes: [], size: portrait ? 200 : 170 };
      for (const w of ln.split(/\s+/)) {
        const W0 = w.toLocaleUpperCase('tr-TR'), isHl = hl.includes(W0);
        const grp = el(g, 'g');
        const box = isHl ? el(grp, 'rect', { fill: pal.accent, rx: 16 }) : null;
        const sh = svgText(grp, W0, 0, 0, row.size, { fill: shade(isHl ? pal.accent : pal.glow, -0.6), 'font-family': 'Anton', 'text-anchor': 'start' });
        const tx = svgText(grp, W0, 0, 0, row.size, { fill: isHl ? '#111' : pal.ink, 'font-family': 'Anton', 'text-anchor': 'start' });
        const o = { grp, box, sh, tx, isHl, k: all.length };
        row.nodes.push(o); all.push(o);
      }
      rows.push(row);
    }
    const gapW = 0.22, lh = 1.22;
    const width = row => row.nodes.reduce((s, o) => s + o.tx.getComputedTextLength() + (o.isHl ? row.size * 0.24 : 0), 0) + (row.nodes.length - 1) * row.size * gapW;
    const setSize = (row, s) => { row.size = s; row.nodes.forEach(o => { o.tx.setAttribute('font-size', s); o.sh.setAttribute('font-size', s); }); };
    rows.forEach(row => { while (width(row) > maxW && row.size > 70) setSize(row, row.size - 6); });
    const uni = Math.min(...rows.map(r => r.size)); rows.forEach(r => setSize(r, Math.min(r.size, uni * 1.25)));
    // keep the block inside top..bottom
    let total = rows.reduce((s, r) => s + r.size * lh, 0);
    while (total > bottom - top) { rows.forEach(r => setSize(r, r.size * 0.95)); total = rows.reduce((s, r) => s + r.size * lh, 0); }
    let cy = top + (bottom - top - total) / 2;
    for (const row of rows) {
      cy += row.size * 1.0;                                          // cap height incl. Turkish dots/breves above
      let x = (W - width(row)) / 2;
      for (const o of row.nodes) {
        const pad = o.isHl ? row.size * 0.12 : 0, w = o.tx.getComputedTextLength();
        o.x = x + pad; o.y = cy; o.cx = x + w / 2 + pad; o.size = row.size;
        o.tx.setAttribute('x', o.x); o.tx.setAttribute('y', cy);
        o.sh.setAttribute('x', o.x + row.size * 0.035); o.sh.setAttribute('y', cy + row.size * 0.045);
        if (o.box) { o.box.setAttribute('x', x); o.box.setAttribute('y', cy - row.size * 0.9); o.box.setAttribute('width', w + pad * 2); o.box.setAttribute('height', row.size * 1.02); }
        x += w + pad * 2 + row.size * gapW;
      }
      cy += row.size * (lh - 1.0);
    }
    // brain below the text
    const bs = portrait ? 9.0 : 7.0, bcx = W / 2, bcy = portrait ? H * 0.36 : H * 0.46;
    const bg = el(svg, 'g', { transform: `translate(${bcx - 50 * bs} ${bcy - 50 * bs}) scale(${bs})` });
    const halo = el(svg, 'circle', { cx: bcx, cy: bcy, r: 52 * bs, fill: rgba(pal.accent, 0.1) });
    svg.insertBefore(bg, g); svg.insertBefore(halo, bg);
    const glowP = el(bg, 'path', { d: ICONS[P.icon || 'brain'], fill: 'none', stroke: pal.accent, 'stroke-width': 4, opacity: 0.25, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const og = el(bg, 'g', { opacity: 0.45 });
    const outline = path(og, ICONS[P.icon || 'brain'], pal.ink, 1.4);
    const len = outline.getTotalLength ? outline.getTotalLength() : 300;
    const sparks = Array.from({ length: 9 }, (_, i) => ({ c: el(svg, 'circle', { r: 11, fill: i % 3 ? pal.accent : '#ffffff' }), ph: i / 9 }));
    return {
      update(lt, dur, cues, env) {
        const t = env.t;
        bd(t);
        all.forEach((o, i) => {
          const at = cue(cues, 'w' + i, 0.12 + i * 0.25);
          const p = spring(lt, at, 0.55), a = clamp01(lin(lt, at, 0.12)), pk = punch(lt, at, 0.5);
          const s = lerp(1.8, 1, p) * (1 + 0.05 * pk), ry = o.y - o.size * 0.35;
          o.grp.setAttribute('transform', `translate(${o.cx} ${ry}) scale(${s}) rotate(${(1 - p) * (i % 2 ? 6 : -6) + (o.isHl ? -2 : 0)}) translate(${-o.cx} ${-ry})`);
          o.grp.setAttribute('opacity', a);
          o.sh.setAttribute('opacity', 0.9 * p);
        });
        const hlAt = all.filter(o => o.isHl).map(o => cue(cues, 'w' + o.k, 0.12 + o.k * 0.25))[0] ?? dur * 0.6;
        const lit = prog(lt, hlAt - 0.1, 0.5), hp = punch(lt, hlAt, 0.8);
        draw(outline, prog(lt, 0.1, Math.max(0.8, hlAt)));
        outline.setAttribute('stroke', mix(pal.ink, pal.accent, lit));
        glowP.setAttribute('opacity', 0.15 + 0.5 * lit + 0.3 * hp);
        glowP.setAttribute('stroke-width', 4 + 2 * Math.sin(t * 3) * lit);
        halo.setAttribute('r', 52 * bs * (1 + 0.05 * Math.sin(t * 2) + 0.15 * hp));
        halo.setAttribute('opacity', 0.25 + 0.4 * lit);
        sparks.forEach(sp => {
          const u = (sp.ph + lt * 0.18) % 1, pt = outline.getPointAtLength(u * len);
          sp.c.setAttribute('cx', bcx - 50 * bs + pt.x * bs); sp.c.setAttribute('cy', bcy - 50 * bs + pt.y * bs);
          sp.c.setAttribute('opacity', 0.6 * (0.25 + 0.75 * lit) * (0.6 + 0.4 * Math.sin(t * 5 + sp.ph * 9)));
          sp.c.setAttribute('r', 9 + 5 * hp);
        });
        const breathe = 1 + 0.012 * Math.sin(t * 1.5);
        g.setAttribute('transform', `translate(${W / 2} ${H * 0.28}) scale(${breathe * lerp(1, 1.03, lt / Math.max(dur, 1))}) translate(${-W / 2} ${-H * 0.28})`);
      },
    };
  },
};
