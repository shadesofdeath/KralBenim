// 2D shots: full-bleed SVG (viewBox = stage size) inside a root div that may also hold canvases.
// build(ctx) with ctx = {P, pal, W, H, root, svg, defs, seed} returns {update(lt, dur, cues, env)}.
'use strict';

const SHOTS2 = window.SHOTS || (window.SHOTS = {});

function svgText(parent, txt, x, y, size, attrs = {}) {
  const t = el(parent, 'text', Object.assign({ x, y, 'font-size': size, 'text-anchor': 'middle', 'dominant-baseline': 'alphabetic' }, attrs));
  t.textContent = txt;
  return t;
}
// radial burst + floating sparks that every 2D shot can put behind its content
function backdrop(svg, pal, W, H, seed, opts = {}) {
  const g = el(svg, 'g');
  const rays = el(g, 'g', { opacity: opts.rays ?? 0.07 });
  const cx = W / 2, cy = opts.cy ?? H * 0.42, R = Math.hypot(W, H);
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * Math.PI * 2, w = 0.035;
    el(rays, 'path', { d: `M${cx} ${cy} L${cx + Math.cos(a - w) * R} ${cy + Math.sin(a - w) * R} L${cx + Math.cos(a + w) * R} ${cy + Math.sin(a + w) * R} Z`, fill: pal.accent2 });
  }
  const r = rng(seed), sparks = Array.from({ length: 26 }, () => {
    const c = el(g, 'circle', { r: 2 + r() * 5, fill: r() > 0.5 ? pal.accent : pal.accent2 });
    return { c, x: r() * W, y: r() * H, v: 20 + r() * 60, ph: r() * 6.28, a: 0.15 + r() * 0.5 };
  });
  return t => {
    rays.setAttribute('transform', `rotate(${t * 4} ${cx} ${cy})`);
    sparks.forEach(s => {
      const y = ((s.y - t * s.v) % H + H) % H;
      s.c.setAttribute('cx', s.x + Math.sin(t * 0.8 + s.ph) * 20);
      s.c.setAttribute('cy', y);
      s.c.setAttribute('opacity', s.a * (0.5 + 0.5 * Math.sin(t * 2 + s.ph)));
    });
  };
}

// ------------------------------------------------------------ headline: giant kinetic type
// P: {lines: ["Peki neden", "erimiyor?"], highlight: ["erimiyor?"], sub: "...",
//     count: {to: "3.000.000", prefix: "", suffix: "+", at: "w0"}}  cues: w0, w1... per word, "count"
SHOTS2.headline = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg, defs } = ctx;
    const bd = backdrop(svg, pal, W, H, 31);
    const portrait = H > W;
    const lines = P.lines || (P.words ? [P.words.join(' ')] : []);
    const hl = (P.highlight || []).map(s => s.toLocaleUpperCase('tr-TR'));
    const maxW = W - (portrait ? 120 : 320);
    const echoTxt = (P.echo || hl[0] || lines[0] || '').toLocaleUpperCase('tr-TR');
    const echo = svgText(svg, echoTxt, W / 2, H * 0.42 + 160, portrait ? 420 : 380,
      { fill: 'none', stroke: pal.accent2, 'stroke-width': 3, opacity: 0.08, 'font-family': 'Anton' });
    const g = el(svg, 'g');
    const words = [];
    let y = 0;
    const rows = [];
    const all = [];
    // count line (big number) goes first when present
    let countNode = null;
    if (P.count) {
      countNode = svgText(g, (P.count.prefix || '') + P.count.to + (P.count.suffix || ''), W / 2, 0, portrait ? 300 : 260,
        { fill: pal.accent, 'font-family': 'Anton', style: `filter: drop-shadow(0 0 30px ${rgba(pal.accent, .55)})` });
      rows.push({ nodes: [countNode], size: portrait ? 300 : 260 });
    }
    for (const ln of lines) {
      const size0 = portrait ? (lines.length > 2 ? 190 : 230) : 200;
      const row = { nodes: [], size: size0 };
      for (const w of ln.split(/\s+/)) {
        const isHl = hl.includes(w.toLocaleUpperCase('tr-TR'));
        const grp = el(g, 'g');
        const box = isHl ? el(grp, 'rect', { fill: pal.accent, rx: 14 }) : null;
        const shadow = svgText(grp, w.toLocaleUpperCase('tr-TR'), 0, 0, size0, { fill: shade(isHl ? pal.accent : pal.glow, -0.55), 'font-family': 'Anton', 'text-anchor': 'start' });
        const txt = svgText(grp, w.toLocaleUpperCase('tr-TR'), 0, 0, size0, { fill: isHl ? '#111' : pal.ink, 'font-family': 'Anton', 'text-anchor': 'start' });
        const o = { grp, box, shadow, txt, isHl, k: all.length };
        row.nodes.push(o); all.push(o);
      }
      rows.push(row);
    }
    // layout: fit each row into maxW, stack rows centred around y≈0.42H
    const gapW = 0.22;
    let totalH = 0;
    for (const row of rows) {
      if (row.nodes[0] && row.nodes[0].txt) {
        let size = row.size;
        const measure = () => row.nodes.reduce((s, o) => s + o.txt.getComputedTextLength() + (o.isHl ? size * 0.2 : 0), 0) + (row.nodes.length - 1) * size * gapW;
        while (measure() > maxW && size > 70) { size -= 6; row.nodes.forEach(o => { o.txt.setAttribute('font-size', size); o.shadow.setAttribute('font-size', size); }); }
        row.size = size; row.width = measure();
      } else {
        let size = row.size; const n = row.nodes[0];
        while (n.getComputedTextLength() > maxW && size > 80) { size -= 8; n.setAttribute('font-size', size); }
        row.size = size;
      }
      totalH += row.size * 1.02;
    }
    let cy = (P.y ?? (portrait ? 0.43 : 0.5)) * H - totalH / 2;
    for (const row of rows) {
      cy += row.size * 0.9;
      if (row.nodes[0] && row.nodes[0].txt) {
        let x = (W - row.width) / 2;
        for (const o of row.nodes) {
          const pad = o.isHl ? row.size * 0.1 : 0, w = o.txt.getComputedTextLength();
          o.x = x + pad; o.y = cy; o.cx = x + w / 2 + pad; o.size = row.size;
          o.txt.setAttribute('x', o.x); o.txt.setAttribute('y', o.y);
          o.shadow.setAttribute('x', o.x + row.size * 0.035); o.shadow.setAttribute('y', o.y + row.size * 0.045);
          if (o.box) { o.box.setAttribute('x', x); o.box.setAttribute('y', cy - row.size * 0.86); o.box.setAttribute('width', w + pad * 2); o.box.setAttribute('height', row.size * 0.98); }
          x += w + pad * 2 + row.size * gapW;
        }
      } else { row.nodes[0].setAttribute('y', cy); }
      cy += row.size * 0.12;
    }
    const sub = P.sub ? svgText(svg, P.sub, W / 2, cy + (portrait ? 90 : 70), portrait ? 50 : 42, { fill: pal.ink, opacity: 0.75, 'font-weight': 700 }) : null;
    return {
      update(lt, dur, cues, env) {
        bd(env.t);
        echo.setAttribute('x', W / 2 - 120 + lt * 40);
        all.forEach((o, i) => {
          const at = cue(cues, 'w' + i, 0.12 + i * 0.16);
          const p = spring(lt, at, 0.55), a = clamp01(lin(lt, at, 0.12));
          const pk = punch(lt, at, 0.5);
          const s = lerp(1.9, 1, p) * (1 + 0.05 * pk);
          o.grp.setAttribute('transform', `translate(${o.cx} ${o.y - o.size * 0.35}) scale(${s}) rotate(${(1 - p) * (i % 2 ? 6 : -6) + (o.isHl ? -2 : 0)}) translate(${-o.cx} ${-(o.y - o.size * 0.35)})`);
          o.grp.setAttribute('opacity', a);
          o.shadow.setAttribute('opacity', 0.9 * p);
        });
        if (countNode) {
          const C = P.count, at = cue(cues, 'count', 0.1), cp = prog(lt, at, 1.5);
          const to = parseNum(C.to), dec = String(C.to).includes(',') ? 1 : 0;
          countNode.textContent = (C.prefix || '') + fmtNum(to * cp, dec) + (C.suffix || '');
          const sp = spring(lt, at, 0.6);
          countNode.setAttribute('opacity', clamp01(sp * 2));
          countNode.setAttribute('transform', `translate(${W / 2} ${countNode.getAttribute('y')}) scale(${lerp(0.6, 1, sp) * (1 + 0.04 * Math.sin(env.t * 3))}) translate(${-W / 2} ${-countNode.getAttribute('y')})`);
        }
        if (sub) sub.setAttribute('opacity', 0.8 * prog(lt, 0.5 + all.length * 0.15, 0.5));
        const breathe = 1 + 0.015 * Math.sin(env.t * 1.5);
        g.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${breathe * lerp(1, 1.04, lt / Math.max(dur, 1))}) translate(${-W / 2} ${-H / 2})`);
      },
    };
  },
};

// ------------------------------------------------------------ scale_bar: "the part is tiny next to the total"
// P: {total: "6.400", part: "12", unit: "km", total_label: "Merkeze uzaklık", part_label: "En derin kuyu",
//     top_label: "Yüzey", bottom_label: "Merkez"}  cues: total, part
SHOTS2.scale_bar = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg, defs } = ctx;
    const portrait = H > W;
    const bd = backdrop(svg, pal, W, H, 41, { rays: 0.04 });
    const total = parseNum(P.total), part = parseNum(P.part);
    // bar geometry (portrait: vertical going down; landscape: horizontal going right)
    const A = portrait ? [220, 340] : [220, 600], B = portrait ? [220, 1010] : [1500, 600];
    const len = portrait ? B[1] - A[1] : B[0] - A[0];
    const at = u => portrait ? [A[0], A[1] + u * len] : [A[0] + u * len, A[1]];
    const gid = 'sbg' + ctx.seed;
    const lg = el(defs, 'linearGradient', { id: gid, x1: 0, y1: 0, x2: portrait ? 0 : 1, y2: portrait ? 1 : 0 });
    el(lg, 'stop', { offset: 0, 'stop-color': pal.accent2 }); el(lg, 'stop', { offset: 1, 'stop-color': pal.accent });
    const thick = 70;
    const track = el(svg, 'rect', portrait ? { x: A[0] - thick / 2, y: A[1], width: thick, height: len, rx: 18 } : { x: A[0], y: A[1] - thick / 2, width: len, height: thick, rx: 18 });
    track.setAttribute('fill', 'rgba(255,255,255,.06)'); track.setAttribute('stroke', 'rgba(255,255,255,.18)'); track.setAttribute('stroke-width', 2);
    const fill = el(svg, 'rect', { fill: `url(#${gid})`, rx: 18, style: `filter: drop-shadow(0 0 24px ${rgba(pal.accent, .5)})` });
    const ticks = el(svg, 'g');
    const step = P.step ? parseNum(P.step) : Math.pow(10, Math.floor(Math.log10(total))) ;
    const tickList = [];
    for (let v = step; v < total * (portrait ? 0.9 : 0.95); v += step) {
      const [x, y] = at(v / total);
      const tk = el(ticks, 'path', { d: portrait ? `M${x + thick / 2 + 8} ${y} h28` : `M${x} ${y + thick / 2 + 8} v28`, stroke: pal.ink, 'stroke-width': 3, opacity: 0.6 });
      const tx = svgText(ticks, fmtNum(v), portrait ? x + thick / 2 + 50 : x, portrait ? y + 14 : y + thick / 2 + 80, 36, { fill: pal.ink, opacity: 0.55, 'text-anchor': portrait ? 'start' : 'middle', 'font-weight': 700 });
      tickList.push({ v, tk, tx });
    }
    const [tx0, ty0] = at(0), [tx1, ty1] = at(1);
    const topL = svgText(svg, P.top_label || '', portrait ? tx0 - 60 : tx0, portrait ? ty0 - 30 : ty0 - 70, 44, { fill: pal.ink, 'font-weight': 800, 'text-anchor': portrait ? 'start' : 'middle' });
    const totalT = svgText(svg, '', portrait ? tx1 + thick / 2 + 40 : tx1, portrait ? ty1 - 10 : ty1 + 150, portrait ? 110 : 110, { fill: pal.accent, 'font-family': 'Anton', 'text-anchor': portrait ? 'start' : 'middle' });
    const totalL = svgText(svg, P.total_label || '', portrait ? tx1 + thick / 2 + 44 : tx1, portrait ? ty1 + 50 : ty1 + 200, 40, { fill: pal.ink, opacity: 0.8, 'font-weight': 700, 'text-anchor': portrait ? 'start' : 'middle' });
    // magnifier
    const M = portrait ? { x: 700, y: 560, r: 240 } : { x: 760, y: 300, r: 200 };
    const mg = el(svg, 'g');
    const cone = el(mg, 'path', { fill: rgba(pal.accent, 0.08), stroke: rgba(pal.accent, 0.5), 'stroke-width': 2 });
    const clipId = 'mclip' + ctx.seed;
    const clip = el(defs, 'clipPath', { id: clipId }); el(clip, 'circle', { cx: M.x, cy: M.y, r: M.r });
    const inside = el(mg, 'g', { 'clip-path': `url(#${clipId})` });
    el(inside, 'circle', { cx: M.x, cy: M.y, r: M.r, fill: shade(pal.bg[1], -0.3) });
    // zoomed view: ground surface + the tiny part drawn big
    const zoomH = M.r * 1.1;
    el(inside, 'rect', portrait ? { x: M.x - M.r, y: M.y - M.r * 0.55, width: M.r * 2, height: M.r * 2, fill: rgba(pal.accent2, 0.12) }
                                : { x: M.x - M.r, y: M.y - M.r * 0.55, width: M.r * 2, height: M.r * 2, fill: rgba(pal.accent2, 0.12) });
    for (let i = 0; i < 5; i++) el(inside, 'path', { d: `M${M.x - M.r} ${M.y - M.r * 0.55 + 30 + i * 70} h${M.r * 2}`, stroke: rgba(pal.ink, 0.07), 'stroke-width': 18 });
    el(inside, 'path', { d: `M${M.x - M.r} ${M.y - M.r * 0.55} h${M.r * 2}`, stroke: pal.ink, 'stroke-width': 6 });
    const partBar = el(inside, 'rect', { x: M.x - 22, y: M.y - M.r * 0.55, width: 44, height: 0, rx: 8, fill: RED, style: `filter: drop-shadow(0 0 16px ${rgba(RED, .8)})` });
    const partT = svgText(inside, '', M.x, M.y + M.r * 0.62, 92, { fill: '#fff', 'font-family': 'Anton' });
    const ring = el(mg, 'circle', { cx: M.x, cy: M.y, r: M.r, fill: 'none', stroke: pal.ink, 'stroke-width': 8 });
    const partL = svgText(mg, P.part_label || '', M.x, M.y + M.r + 64, 44, { fill: pal.ink, 'font-weight': 800 });
    const dot = el(svg, 'circle', { r: 10, fill: RED, style: `filter: drop-shadow(0 0 10px ${RED})` });
    return {
      update(lt, dur, cues, env) {
        bd(env.t);
        const ta = cue(cues, 'total', 0.2), tp = progIO(lt, ta, 1.6);
        const u = tp;
        if (portrait) { fill.setAttribute('x', A[0] - thick / 2); fill.setAttribute('y', A[1]); fill.setAttribute('width', thick); fill.setAttribute('height', Math.max(0.1, len * u)); }
        else { fill.setAttribute('x', A[0]); fill.setAttribute('y', A[1] - thick / 2); fill.setAttribute('height', thick); fill.setAttribute('width', Math.max(0.1, len * u)); }
        tickList.forEach(k => { const on = u * total >= k.v; k.tk.setAttribute('opacity', on ? 0.7 : 0.15); k.tx.setAttribute('opacity', on ? 0.6 : 0.12); });
        const tk = spring(lt, ta + 1.4, 0.6);
        totalT.textContent = fmtNum(Math.round(u * total)) + ' ' + (P.unit || '');
        totalT.setAttribute('opacity', clamp01(lin(lt, ta, 0.3)));
        totalL.setAttribute('opacity', 0.8 * tk);
        topL.setAttribute('opacity', prog(lt, 0, 0.5));
        const pa = cue(cues, 'part', Math.min(dur * 0.55, ta + 1.7)), pp = spring(lt, pa, 0.8);
        const [px, py] = at(part / total);
        dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('opacity', clamp01(lin(lt, pa - 0.3, 0.3)));
        dot.setAttribute('r', 10 + 8 * punch(lt, pa, 0.8) + 2 * Math.sin(env.t * 6));
        mg.setAttribute('opacity', clamp01(pp * 1.5));
        mg.setAttribute('transform', `translate(${M.x} ${M.y}) scale(${lerp(0.2, 1, pp)}) translate(${-M.x} ${-M.y})`);
        // cone from the dot to the circle
        const ang = Math.atan2(M.y - py, M.x - px), ca = Math.asin(Math.min(1, M.r / Math.hypot(M.x - px, M.y - py)));
        const d = Math.hypot(M.x - px, M.y - py) * Math.cos(ca);
        const p1 = [px + Math.cos(ang - ca) * d, py + Math.sin(ang - ca) * d], p2 = [px + Math.cos(ang + ca) * d, py + Math.sin(ang + ca) * d];
        cone.setAttribute('d', `M${px} ${py} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`);
        const gp = prog(lt, pa + 0.4, 1.0);
        partBar.setAttribute('height', zoomH * 0.5 * gp);
        partT.textContent = fmtNum(Math.round(gp * part)) + ' ' + (P.unit || '');
        partT.setAttribute('opacity', gp);
        ring.setAttribute('stroke-width', 8 + 6 * punch(lt, pa + 0.3, 0.6));
        partL.setAttribute('opacity', prog(lt, pa + 0.6, 0.5));
      },
    };
  },
};

// ------------------------------------------------------------ bars: animated comparison bars
// P: {items: [{label, value, unit}], highlight: 1, title: "..."}  cues: b0, b1...
SHOTS2.bars = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg } = ctx;
    const bd = backdrop(svg, pal, W, H, 51, { rays: 0.04 });
    const items = P.items || [], max = Math.max(...items.map(i => parseNum(i.value)));
    const portrait = H > W, x0 = portrait ? 90 : 300, wMax = W - x0 * 2, rowH = portrait ? 210 : 150;
    const y0 = (portrait ? 0.42 : 0.5) * H - (items.length * rowH) / 2;
    const rows = items.map((it, i) => {
      const y = y0 + i * rowH, hlt = i === P.highlight;
      const lab = svgText(svg, it.label, x0, y + 10, portrait ? 52 : 44, { fill: pal.ink, 'font-weight': 800, 'text-anchor': 'start' });
      el(svg, 'rect', { x: x0, y: y + 34, width: wMax, height: 70, rx: 20, fill: 'rgba(255,255,255,.06)' });
      const bar = el(svg, 'rect', { x: x0, y: y + 34, width: 0, height: 70, rx: 20, fill: hlt ? pal.accent : rgba(pal.ink, .55), style: hlt ? `filter: drop-shadow(0 0 22px ${rgba(pal.accent, .6)})` : '' });
      const val = svgText(svg, '', x0 + 24, y + 88, 54, { fill: hlt ? '#111' : '#111', 'font-family': 'Anton', 'text-anchor': 'start' });
      return { it, lab, bar, val, v: parseNum(it.value), dec: String(it.value).includes(',') ? 1 : 0 };
    });
    return {
      update(lt, dur, cues, env) {
        bd(env.t);
        rows.forEach((r, i) => {
          const at = cue(cues, 'b' + i, 0.2 + i * 0.35), p = prog(lt, at, 1.2), s = spring(lt, at, 0.6);
          r.lab.setAttribute('opacity', clamp01(s * 1.5));
          const w = Math.max(0.1, wMax * r.v / max * p);
          r.bar.setAttribute('width', w);
          r.val.textContent = fmtNum(r.v * p, r.dec) + (r.it.unit ? ' ' + r.it.unit : '');
          const tw = r.val.getComputedTextLength();
          const inside = w > tw + 60;
          r.val.setAttribute('x', inside ? x0 + w - tw - 24 : x0 + w + 20);
          r.val.setAttribute('fill', inside ? '#111' : pal.ink);
          r.val.setAttribute('opacity', clamp01(p * 3));
        });
      },
    };
  },
};

// ------------------------------------------------------------ compare: split screen, two big sides
// P: {left: {title, value, icon, mark: "x"|"check", color}, right: {...}, vs: "VS"}  cues: left, right
SHOTS2.compare = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg } = ctx;
    const portrait = H > W;
    const sides = ['left', 'right'].map((k, i) => {
      const S = P[k] || {};
      const g = el(svg, 'g');
      const c = S.color === 'red' ? RED : S.color === 'green' ? GREEN : S.color === 'accent' ? pal.accent : S.color || (i ? pal.accent : pal.ink);
      const rect = portrait ? { x: 0, y: i ? H * 0.42 : H * 0.12, w: W, h: H * 0.3 } : { x: i ? W / 2 : 0, y: 0, w: W / 2, h: H };
      el(g, 'rect', { x: rect.x, y: rect.y, width: rect.w, height: rect.h, fill: rgba(c, 0.08) });
      const cx = rect.x + rect.w / 2, cy = rect.y + rect.h * (portrait ? 0.4 : 0.42);
      const ic = el(g, 'g');
      const hasIcon = S.icon && ICONS[S.icon];
      // icon above the text, text auto-fits the half width
      const iy = portrait ? cy - 150 : cy - 120, ty = hasIcon ? (portrait ? cy + 90 : cy + 140) : cy + 40;
      if (hasIcon) {
        el(ic, 'path', { d: ICONS[S.icon], transform: `translate(${cx - 70} ${iy - 70}) scale(1.4)`, fill: 'none', stroke: c, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', style: `filter: drop-shadow(0 0 16px ${rgba(c, .6)})` });
      }
      const val = svgText(g, S.value || S.title || '', cx, ty, portrait ? 150 : 130, { fill: c, 'font-family': 'Anton' });
      let fs = portrait ? 150 : 130;
      while (val.getComputedTextLength() > rect.w - 120 && fs > 60) { fs -= 6; val.setAttribute('font-size', fs); }
      const lab = svgText(g, S.value ? (S.title || '') : (S.sub || ''), cx, ty + (portrait ? 70 : 70), portrait ? 50 : 46, { fill: pal.ink, 'font-weight': 800, opacity: .85 });
      let mk = null;
      if (S.mark) {
        mk = el(g, 'g');
        const mx = rect.x + rect.w - (portrait ? 110 : 90), my = rect.y + (portrait ? 90 : 120);
        el(mk, 'circle', { cx: mx, cy: my, r: 48, fill: S.mark === 'x' ? RED : GREEN });
        el(mk, 'path', { d: ICONS[S.mark === 'x' ? 'x' : 'check'], transform: `translate(${mx - 26} ${my - 26}) scale(.52)`, fill: 'none', stroke: '#fff', 'stroke-width': 18, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        mk._c = [mx, my];
      }
      return { g, ic, val, lab, mk, cx, cy, i };
    });
    const vs = el(svg, 'g');
    const vc = portrait ? [W / 2, H * 0.42] : [W / 2, H / 2];
    el(vs, 'circle', { cx: vc[0], cy: vc[1], r: 70, fill: pal.accent });
    svgText(vs, P.vs || 'VS', vc[0], vc[1] + 22, 64, { fill: '#111', 'font-family': 'Anton' });
    return {
      update(lt, dur, cues, env) {
        sides.forEach(s => {
          const at = cue(cues, s.i ? 'right' : 'left', 0.15 + s.i * 0.6), p = spring(lt, at, 0.7);
          const dx = portrait ? 0 : (s.i ? 1 : -1) * (1 - p) * 300, dy = portrait ? (s.i ? 1 : -1) * (1 - p) * 300 : 0;
          s.g.setAttribute('transform', `translate(${dx} ${dy})`);
          s.g.setAttribute('opacity', clamp01(p * 1.5));
          const pk = punch(lt, at, 0.6);
          s.ic.setAttribute('transform', `translate(0 ${Math.sin(env.t * 2 + s.i) * 10}) `);
          s.val.setAttribute('transform', `translate(${s.cx} ${s.cy}) scale(${1 + 0.08 * pk}) translate(${-s.cx} ${-s.cy})`);
          if (s.mk) { const mp = spring(lt, at + 0.5, 0.5); s.mk.setAttribute('transform', `translate(${s.mk._c[0]} ${s.mk._c[1]}) scale(${mp}) translate(${-s.mk._c[0]} ${-s.mk._c[1]})`); }
        });
        const vp = spring(lt, 0.3, 0.6);
        vs.setAttribute('transform', `translate(${vc[0]} ${vc[1]}) scale(${vp * (1 + 0.05 * Math.sin(env.t * 4))}) rotate(${(1 - vp) * 90}) translate(${-vc[0]} ${-vc[1]})`);
      },
    };
  },
};

// ------------------------------------------------------------ photo / video: real footage with Ken Burns + annotations
// P: {src: "media/x.jpg"} or {video: "media/x.mp4", from: 2.0, rate: 1} (build.py extracts frames -> P.frames),
//    kb: {from: [1.0, 0.5, 0.5], to: [1.15, 0.55, 0.45]} (zoom, centre x, centre y in 0..1 of the image),
//    grade: "natural"|"cinematic"|"mono"|"duotone", credit: "Foto: ... / Wikimedia Commons (CC BY-SA 4.0)",
//    marks: [{type: "circle"|"arrow"|"label"|"box", x, y, r, w, h, text, at: "cueName"}] (x, y in 0..1 of the image)
SHOTS2.photo = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, root, svg } = ctx;
    const dpr = devicePixelRatio;
    const cv = document.createElement('canvas');
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px`;
    root.insertBefore(cv, svg);
    const g2 = cv.getContext('2d');
    const imgs = new Map();
    const load = src => {
      if (imgs.has(src)) return imgs.get(src);
      const im = new Image(); im.src = src;
      const pr = im.decode().then(() => im).catch(() => null);
      const rec = { im, pr, ok: false }; pr.then(v => { rec.ok = !!v; });
      imgs.set(src, rec);
      return rec;
    };
    const F = P.frames;
    const frameSrc = lt => {
      if (!F) return P.src;
      const i = Math.max(0, Math.min(F.count - 1, Math.floor(lt * F.fps * (P.rate || 1))));
      return F.pattern.replace('%05d', String(i + 1).padStart(5, '0'));
    };
    const grade = { natural: 'saturate(1.05) contrast(1.05)', cinematic: 'contrast(1.12) saturate(0.9) brightness(0.92)',
                    mono: 'grayscale(1) contrast(1.15) brightness(0.9)', duotone: 'grayscale(1) contrast(1.2) brightness(0.85)' }[P.grade || 'cinematic'];
    const tint = P.grade === 'duotone' ? pal.accent : null;
    const marksG = el(svg, 'g');
    const marks = (P.marks || []).map(m => ({ m, g: el(marksG, 'g') }));
    let credit = null;
    if (P.credit) credit = svgText(svg, P.credit, W - 40, H > W ? 262 : H - 40, 22, { fill: '#fff', opacity: 0.55, 'text-anchor': 'end', 'font-weight': 600 });
    let geom = null;
    const kb = P.kb || { from: [1.0, 0.5, 0.5], to: [1.12, 0.5, 0.45] };
    return {
      pending(lt) { const r = load(frameSrc(lt)); return r.ok ? null : r.pr; },
      update(lt, dur, cues, env) {
        const rec = load(frameSrc(lt));
        if (!rec.ok) return;
        const im = rec.im, iw = im.naturalWidth, ih = im.naturalHeight;
        const p = progIO(lt, 0, Math.max(dur, 1));
        const z = lerp(kb.from[0], kb.to[0], p), cx = lerp(kb.from[1], kb.to[1], p), cy = lerp(kb.from[2], kb.to[2], p);
        const cover = Math.max(W / iw, H / ih) * z;           // css px per image px
        const dw = iw * cover, dh = ih * cover;
        let x = W / 2 - cx * dw, y = H / 2 - cy * dh;
        x = Math.min(0, Math.max(W - dw, x)); y = Math.min(0, Math.max(H - dh, y));
        geom = { x, y, s: cover };
        g2.save();
        g2.filter = grade;
        g2.drawImage(im, x * dpr, y * dpr, dw * dpr, dh * dpr);
        g2.restore();
        if (tint) { g2.save(); g2.globalCompositeOperation = 'soft-light'; g2.fillStyle = tint; g2.fillRect(0, 0, cv.width, cv.height); g2.restore(); }
        // gradient so captions and kicker stay readable
        const gr = g2.createLinearGradient(0, 0, 0, cv.height);
        gr.addColorStop(0, 'rgba(0,0,0,.45)'); gr.addColorStop(0.25, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)');
        g2.fillStyle = gr; g2.fillRect(0, 0, cv.width, cv.height);
        marks.forEach(({ m, g }, k) => {
          g.innerHTML = '';
          const at = cue(cues, m.at, 0.6 + k * 0.5), a = spring(lt, at, 0.6);
          if (lt < at - 0.01) return;
          const X = geom.x + m.x * iw * geom.s, Y = geom.y + m.y * ih * geom.s, c = m.color === 'accent' ? pal.accent : (m.color || RED);
          const glow = `filter: drop-shadow(0 0 12px ${rgba(c, .8)})`;
          if (m.type === 'circle') {
            const r = (m.r || 0.08) * iw * geom.s;
            const ci = el(g, 'circle', { cx: X, cy: Y, r: r * lerp(1.6, 1, a), fill: 'none', stroke: c, 'stroke-width': 10, style: glow, pathLength: 1 });
            draw(ci, prog(lt, at, 0.5));
          } else if (m.type === 'box') {
            const w = (m.w || 0.2) * iw * geom.s, h = (m.h || 0.2) * ih * geom.s;
            const b = el(g, 'rect', { x: X - w / 2, y: Y - h / 2, width: w, height: h, rx: 12, fill: 'none', stroke: c, 'stroke-width': 8, style: glow, pathLength: 1 });
            draw(b, prog(lt, at, 0.5));
          } else if (m.type === 'arrow') {
            const L = 220, ang = (m.angle ?? 135) * Math.PI / 180, sx = X + Math.cos(ang) * L, sy = Y + Math.sin(ang) * L;
            const ex = X + Math.cos(ang) * 30, ey = Y + Math.sin(ang) * 30;
            const ar = path(g, `M${sx} ${sy} Q${(sx + ex) / 2 + 40} ${(sy + ey) / 2} ${ex} ${ey}`, c, 10, { style: glow });
            draw(ar, prog(lt, at, 0.4));
            const hp = prog(lt, at + 0.3, 0.2), ha = Math.atan2(ey - sy, ex - sx);
            if (hp > 0) path(g, `M${ex - 40 * Math.cos(ha - 0.5)} ${ey - 40 * Math.sin(ha - 0.5)} L${ex} ${ey} L${ex - 40 * Math.cos(ha + 0.5)} ${ey - 40 * Math.sin(ha + 0.5)}`, c, 10, { style: glow, opacity: hp });
          }
          if (m.text) {
            const tx = X + (m.dx ?? 0), ty = Y + (m.dy ?? -((m.r || 0.08) * iw * geom.s) - 40);
            const t = svgText(g, m.text, tx, ty, m.size || 56, { fill: '#fff', 'font-weight': 900, opacity: clamp01(a * 1.4),
              style: 'paint-order: stroke; stroke: rgba(0,0,0,.85); stroke-width: 10px' });
            t.setAttribute('transform', `translate(${tx} ${ty}) scale(${lerp(0.6, 1, a)}) translate(${-tx} ${-ty})`);
          }
        });
      },
    };
  },
};
