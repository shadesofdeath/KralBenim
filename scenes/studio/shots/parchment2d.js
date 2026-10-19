// Parchment 2D shots (theme "parchment", brand/kit/BRAND.md): hand-drawn ink on sepia paper.
//   chapter  — "BÖLÜM 2 / 5" card: badge, blue disc with the number, title card + hand-drawn underline
//   title    — giant Fraunces title, word by word, highlight word in a red box, optional handwritten note + arrow
//   board    — pinned board: title, 2-4 cards with ✓/✗ items or progress bars, pill badge at the bottom
//   map      — old map: coastlines (presets or custom), cities, dashed route, compass rose, note
//   timeline — vertical (Shorts) / horizontal (long) time line, years in Fraunces, events handwritten
// Every ink line "boils" (re-jitters 8x per second, deterministic) so the page looks drawn by hand.
// The paper itself is the engine background (engine.js drawPaper); these shots are transparent.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = (typeof THEME_PARCHMENT !== 'undefined') ? THEME_PARCHMENT : {
    paper: '#E9DCC0', paperLight: '#F4EAD5', paperDark: '#D3C09A', stain: '#B88F5A', ink: '#2B1D12', inkSoft: '#6B5440',
    blue: '#4A6F94', red: '#A8432F', gold: '#C8922E', green: '#5E7D4B' };
  const FR = 'Fraunces, Georgia, serif', LO = 'Lora, Georgia, serif', PH = "'Patrick Hand', 'Comic Sans MS', cursive";
  const HZ = 8;                                         // boil rate (BRAND: 8 times per second)
  const COLORS = { blue: C.blue, red: C.red, green: C.green, gold: C.gold, ink: C.ink };

  // ---------------------------------------------------------------- hand-drawn line helpers
  // deterministic hash noise in [0,1)
  const hn = (a, b, c) => { const v = Math.sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453; return v - Math.floor(v); };
  const f1 = v => Math.round(v * 10) / 10;
  // Catmull-Rom through the points -> cubic Bézier path
  function smoothD(p, closed) {
    const n = p.length;
    if (n < 2) return '';
    const get = i => closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))];
    let d = `M${f1(p[0][0])} ${f1(p[0][1])}`;
    const segs = closed ? n : n - 1;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), q1 = get(i), q2 = get(i + 1), p3 = get(i + 2);
      d += ` C${f1(q1[0] + (q2[0] - p0[0]) / 6)} ${f1(q1[1] + (q2[1] - p0[1]) / 6)} ${f1(q2[0] - (p3[0] - q1[0]) / 6)} ${f1(q2[1] - (p3[1] - q1[1]) / 6)} ${f1(q2[0])} ${f1(q2[1])}`;
    }
    return closed ? d + ' Z' : d;
  }
  // jitter: _ink.js boil() if loaded, else our own private hash (no global names, no clashes)
  function wobble(pts, seed, step, amp) {
    if (typeof boil === 'function') {          // shared jitter from shots/_ink.js when present (same 8 Hz clock)
      const t = (step + 0.5) / HZ, s0 = Math.floor(seed * 13);
      return pts.map((q, i) => { const d = boil(s0 + i * 131, t, amp); return [q[0] + d[0], q[1] + d[1]]; });
    }
    return pts.map((q, i) => [q[0] + (hn(seed, step, i) - 0.5) * 2 * amp, q[1] + (hn(seed + 17.3, step, i * 1.31) - 0.5) * 2 * amp]);
  }
  // point generators
  function ptsLine(x1, y1, x2, y2, step = 70) {
    const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / step) + 1);
    return Array.from({ length: n }, (_, i) => [lerp(x1, x2, i / (n - 1)), lerp(y1, y2, i / (n - 1))]);
  }
  function ptsPoly(list, step = 70) {           // resample a polyline so long edges boil too
    const out = [];
    for (let i = 0; i < list.length - 1; i++) { const s = ptsLine(list[i][0], list[i][1], list[i + 1][0], list[i + 1][1], step); out.push(...s.slice(0, -1)); }
    out.push(list[list.length - 1]);
    return out;
  }
  function ptsRRect(x, y, w, h, r, step = 80) {
    r = Math.min(r, w / 2, h / 2);
    const out = [];
    const corner = (cx, cy, a0) => { for (let k = 0; k <= 3; k++) { const a = a0 + k / 3 * Math.PI / 2; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    const edge = (x1, y1, x2, y2) => { const s = ptsLine(x1, y1, x2, y2, step); out.push(...s.slice(1, -1)); };
    corner(x + w - r, y + r, -Math.PI / 2); edge(x + w, y + r, x + w, y + h - r);
    corner(x + w - r, y + h - r, 0); edge(x + w - r, y + h, x + r, y + h);
    corner(x + r, y + h - r, Math.PI / 2); edge(x, y + h - r, x, y + r);
    corner(x + r, y + r, Math.PI); edge(x + r, y, x + w - r, y);
    return out;
  }
  const ptsCircle = (cx, cy, r, n = 22) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);

  // a set of boiling ink paths for one shot: ink(parent, pts, opts) -> {node, pts}; ink.tick(t) re-jitters at 8 Hz
  function inkSet(seed0) {
    const list = [];
    let last = -1;
    const ink = (parent, pts, o = {}) => {
      const attrs = { fill: o.fill || 'none', stroke: o.stroke || C.ink, 'stroke-width': o.width ?? 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      if (o.dash) attrs['stroke-dasharray'] = o.dash; else if (o.reveal) attrs.pathLength = 1;
      if (o.opacity != null) attrs.opacity = o.opacity;
      const node = el(parent, 'path', attrs);
      const it = { node, pts, closed: !!o.closed, amp: o.amp ?? 2, seed: seed0 * 101 + list.length * 7.7, upto: 1 };
      node.setAttribute('d', smoothD(pts, it.closed));
      list.push(it);
      return it;
    };
    ink.tick = (t, force) => {
      const step = Math.floor(t * HZ);
      if (step === last && !force) return;
      last = step;
      for (const it of list) {
        let pts = it.amp ? wobble(it.pts, it.seed, step, it.amp) : it.pts;
        it.node.setAttribute('d', smoothD(pts, it.closed));
      }
    };
    return ink;
  }
  // tiny hand-placed wobble for text groups (translate + rotation), same 8 Hz clock
  const jig = (seed, t, amp = 0.9) => { const s = Math.floor(t * HZ); return `translate(${f1((hn(seed, s, 1) - 0.5) * 2 * amp)} ${f1((hn(seed, s, 2) - 0.5) * 2 * amp)}) rotate(${f1((hn(seed, s, 3) - 0.5) * 0.5)})`; };
  const around = (x, y, tf) => `translate(${f1(x)} ${f1(y)}) ${tf} translate(${f1(-x)} ${f1(-y)})`;
  const camDrift = (t, W, H) => `translate(${f1(Math.sin(t * 0.31) * 7)} ${f1(Math.cos(t * 0.23) * 6)})`;

  function txt(parent, s, x, y, size, font, attrs = {}) {
    return svgText(parent, s, x, y, size, Object.assign({ 'font-family': font, fill: C.ink }, attrs));
  }
  function fit(node, maxW, min = 44) {
    let fs = parseFloat(node.getAttribute('font-size'));
    while (fs > min && node.getComputedTextLength() > maxW) { fs -= 3; node.setAttribute('font-size', fs); }
    return fs;
  }
  // greedy word wrap into a <text> with <tspan>s; shrinks until it fits maxLines (never below min)
  function wrap(parent, s, x, y, size, font, maxW, maxLines = 2, min = 44, attrs = {}, lh = 1.12) {
    const node = txt(parent, '', x, y, size, font, attrs);
    const words = String(s || '').split(/\s+/).filter(Boolean);
    let fs = size, lines;
    for (;;) {
      node.setAttribute('font-size', fs);
      lines = []; let cur = '';
      for (const w of words) {
        const tryS = cur ? cur + ' ' + w : w;
        node.textContent = tryS;
        if (node.getComputedTextLength() > maxW && cur) { lines.push(cur); cur = w; } else cur = tryS;
      }
      if (cur) lines.push(cur);
      const widest = Math.max(0, ...lines.map(l => { node.textContent = l; return node.getComputedTextLength(); }));
      if ((lines.length <= maxLines && widest <= maxW) || fs <= min) break;
      fs = Math.max(min, fs - 3);
    }
    node.textContent = '';
    lines.forEach((l, i) => { const ts = el(node, 'tspan', { x, dy: i ? fs * lh : 0 }); ts.textContent = l; });
    return { node, lines, size: fs, height: fs * (1 + (lines.length - 1) * lh) };
  }
  const shadowOf = (ink, parent, pts, o = {}) => ink(parent, pts.map(q => [q[0] + (o.dx ?? 7), q[1] + (o.dy ?? 9)]), { closed: true, fill: rgba(C.ink, o.alpha ?? 0.16), stroke: 'none', width: 0, amp: 1.5 });
  // hand-drawn check / cross / arrow-head point lists (local coordinates)
  const CHECK = s => [[-0.42 * s, 0.02 * s], [-0.12 * s, 0.32 * s], [0.46 * s, -0.36 * s]];
  const CROSS = s => [[[-0.36 * s, -0.36 * s], [0.36 * s, 0.36 * s]], [[0.36 * s, -0.36 * s], [-0.36 * s, 0.36 * s]]];
  const atOr = (cues, name, fb) => (name != null && cues && cues[name] != null) ? cues[name] : fb;

  // ---------------------------------------------------------------- chapter: "BÖLÜM 2 / 5"
  // P: {n: 2, total: 5, title: "Dağ uyanıyor", label: "BÖLÜM"}   cues: n (disc pops), title (card), line (underline)
  SH.chapter = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, ink = inkSet(seed + 11);
      const cam = el(svg, 'g');
      const n = P.n ?? 1, total = P.total;
      const badgeS = `${P.label || 'BÖLÜM'} ${n}${total ? ' / ' + total : ''}`.toLocaleUpperCase('tr-TR');
      const L = portrait ? { by: 420, cy: 690, R: 160, maxW: 920, ts: 118 } : { by: 175, cy: 370, R: 135, maxW: 1240, ts: 112 };
      // badge
      const badge = el(cam, 'g');
      const bt = txt(badge, badgeS, W / 2, L.by + 16, 46, FR, { 'font-weight': 700, 'letter-spacing': '0.22em', fill: C.ink });
      const bw = bt.getComputedTextLength() + 80, bh = 84;
      const bpts = ptsRRect(W / 2 - bw / 2, L.by - bh / 2, bw, bh, bh / 2);
      badge.insertBefore(ink(badge, bpts, { closed: true, fill: C.paperLight, width: 3 }).node, bt);
      bt.setAttribute('x', W / 2 + 0.11 * 46);                 // letter-spacing adds trailing space: re-centre
      for (const s of [-1, 1]) {
        const x0 = W / 2 + s * (bw / 2 + 24);
        ink(badge, ptsLine(x0, L.by, x0 + s * 90, L.by, 30), { width: 4, stroke: C.inkSoft });
        ink(badge, ptsCircle(x0 + s * 106, L.by, 6, 8), { closed: true, fill: C.inkSoft, width: 0, stroke: 'none', amp: 0.8 });
      }
      // number disc
      const disc = el(cam, 'g');
      const ring = ink(disc, ptsCircle(W / 2, L.cy, L.R + 26, 30), { closed: true, width: 4, stroke: C.inkSoft, dash: '14 16' });
      ink(disc, ptsCircle(W / 2 + 8, L.cy + 10, L.R, 26), { closed: true, fill: rgba(C.ink, 0.16), stroke: 'none', width: 0 });
      ink(disc, ptsCircle(W / 2, L.cy, L.R, 26), { closed: true, fill: C.blue, width: 6 });
      const numS = L.R * 1.3;
      txt(disc, String(n), W / 2, L.cy + numS * 0.35, numS, FR, { 'font-weight': 900, fill: C.paperLight });
      // title card
      const card = el(cam, 'g');
      const cardTop = L.cy + L.R + 52;
      const tw = wrap(card, P.title || '', W / 2, 0, L.ts, FR, L.maxW - 120, 2, 64, { 'font-weight': 900, fill: C.ink }, 1.04);
      const lineW = Math.min(L.maxW - 140, Math.max(...tw.lines.map(l => { const m = txt(card, l, 0, -999, tw.size, FR, { 'font-weight': 900 }); const w = m.getComputedTextLength(); m.remove(); return w; })));
      const padY = 34, cw = Math.min(L.maxW, lineW + 140), ch = padY * 2 + tw.height + 34;
      const cardBottomMax = portrait ? 1140 : 800;
      const top = Math.min(cardTop, cardBottomMax - ch);
      const cpts = ptsRRect(W / 2 - cw / 2, top, cw, ch, 26);
      const shadow = shadowOf(ink, card, cpts);
      const cardBox = ink(card, cpts, { closed: true, fill: C.paperLight, width: 3 });
      card.insertBefore(shadow.node, tw.node); card.insertBefore(cardBox.node, tw.node);
      const baseY = top + padY + tw.size * 0.8;
      tw.node.setAttribute('y', baseY);
      const uy = baseY + tw.height - tw.size * 0.95 + 26;
      const upts = [];
      for (let i = 0; i <= 12; i++) upts.push([W / 2 - lineW / 2 + lineW * i / 12, uy + Math.sin(i * 1.3) * 5 + (i / 12) * -6]);
      const under = ink(card, upts, { width: 9, stroke: C.blue, reveal: true, amp: 1.5 });
      const cardCy = top + ch / 2;
      return {
        update(lt, dur, cues, env) {
          ink.tick(env.t);
          cam.setAttribute('transform', camDrift(env.t, W, H));
          const pb = spring(lt, 0.02, 0.6);
          badge.setAttribute('opacity', clamp01(pb * 2));
          badge.setAttribute('transform', around(W / 2, L.by, `translate(0 ${f1((1 - pb) * -40)}) ${jig(seed + 1, env.t)}`));
          const an = cue(cues, 'n', 0.2), pn = spring(lt, an, 0.7), hit = punch(lt, an, 0.6);
          disc.setAttribute('opacity', clamp01(pn * 3));
          disc.setAttribute('transform', around(W / 2, L.cy, `scale(${f1(lerp(0.2, 1, pn) * (1 + 0.08 * hit) * 100) / 100}) rotate(${f1((1 - pn) * -25 + Math.sin(env.t * 0.9) * 1.2)})`));
          ring.node.setAttribute('transform', around(W / 2, L.cy, `rotate(${f1(env.t * 9)})`));
          const at = cue(cues, 'title', 0.45), pt = spring(lt, at, 0.7);
          card.setAttribute('opacity', clamp01(pt * 2.5));
          card.setAttribute('transform', around(W / 2, cardCy, `translate(0 ${f1((1 - pt) * 70)}) scale(${f1(lerp(0.9, 1, pt) * 1000) / 1000}) ${jig(seed + 2, env.t, 0.6)}`));
          draw(under.node, prog(lt, cue(cues, 'line', at + 0.45), 0.6));
        },
      };
    },
  };

  // ---------------------------------------------------------------- title: giant Fraunces words
  // P: {lines: ["Pompeii", "bir gecede", "yok oldu"], highlight: ["yok"], hl_style: "box"|"gold",
  //     note: "MS 79" | {text, at, color}, arrow: true, y: 0.4}   cues: w0, w1... (word index), note
  SH.title = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, ink = inkSet(seed + 23);
      const cam = el(svg, 'g');
      const lines = P.lines || [];
      const hl = (P.highlight || []).map(s => s.toLocaleUpperCase('tr-TR'));
      const gold = P.hl_style === 'gold';
      const maxW = W - (portrait ? 150 : 380);
      const start = P.size || (portrait ? (lines.length > 2 ? 150 : 176) : (lines.length > 2 ? 140 : 160));
      const rows = [], all = [];
      for (const ln of lines) {
        const row = { nodes: [], size: start };
        for (const w of ln.split(/\s+/).filter(Boolean)) {
          const isHl = hl.includes(w.toLocaleUpperCase('tr-TR').replace(/[?!.,:;]/g, ''));
          const grp = el(cam, 'g');
          const sh = txt(grp, w, 0, 0, start, FR, { 'font-weight': 900, fill: isHl && !gold ? rgba(C.ink, 0.0) : C.paperDark, 'text-anchor': 'start' });
          const t = txt(grp, w, 0, 0, start, FR, { 'font-weight': 900, fill: isHl ? (gold ? C.gold : C.paperLight) : C.ink, 'text-anchor': 'start' });
          const o = { grp, sh, t, isHl, k: all.length };
          row.nodes.push(o); all.push(o);
        }
        rows.push(row);
      }
      const gap = 0.24;
      let totalH = 0;
      for (const row of rows) {
        let size = row.size;
        const measure = () => row.nodes.reduce((s, o) => s + o.t.getComputedTextLength() + (o.isHl && !gold ? size * 0.36 : 0), 0) + (row.nodes.length - 1) * size * gap;
        while (measure() > maxW && size > 70) { size -= 4; row.nodes.forEach(o => { o.t.setAttribute('font-size', size); o.sh.setAttribute('font-size', size); }); }
        row.size = size; row.width = measure(); totalH += size * 1.08;
      }
      let cy = (P.y ?? (portrait ? 0.4 : 0.44)) * H - totalH / 2;
      let hlAnchor = null, lastBottom = 0;
      for (const row of rows) {
        cy += row.size * 0.86;
        let x = (W - row.width) / 2;
        for (const o of row.nodes) {
          const pad = o.isHl && !gold ? row.size * 0.18 : 0, w = o.t.getComputedTextLength();
          o.t.setAttribute('x', x + pad); o.t.setAttribute('y', cy);
          o.sh.setAttribute('x', x + pad + row.size * 0.03); o.sh.setAttribute('y', cy + row.size * 0.04);
          o.cx = x + pad + w / 2; o.cy = cy - row.size * 0.33; o.size = row.size;
          if (o.isHl) {
            if (!gold) {
              const bx = x, by = cy - row.size * 0.84, bw = w + pad * 2, bh = row.size * 1.06;
              const bp = ptsRRect(bx, by, bw, bh, row.size * 0.14, 60);
              const shd = shadowOf(ink, o.grp, bp, { dx: 8, dy: 10, alpha: 0.2 });
              const box = ink(o.grp, bp, { closed: true, fill: C.red, width: 5 });
              o.grp.insertBefore(box.node, o.sh); o.grp.insertBefore(shd.node, box.node);
            } else {
              const up = ptsLine(x, cy + row.size * 0.14, x + w, cy + row.size * 0.1, 50);
              ink(o.grp, up, { width: 10, stroke: C.ink });
            }
            if (!hlAnchor) hlAnchor = [o.cx, cy + row.size * 0.22];
          }
          x += w + pad * 2 + row.size * gap;
        }
        cy += row.size * 0.22;
        lastBottom = cy;
      }
      // handwritten note + arrow towards the highlight word
      let note = null;
      if (P.note) {
        const N = typeof P.note === 'string' ? { text: P.note } : P.note;
        const ng = el(cam, 'g');
        const ny = Math.min(lastBottom + (portrait ? 120 : 100), portrait ? 1120 : 820);
        const nx = W / 2 + (hlAnchor && hlAnchor[0] < W / 2 ? 120 : -120);
        const t = txt(ng, N.text, nx, ny, N.size || (portrait ? 72 : 64), PH, { fill: COLORS[N.color] || C.red });
        fit(t, W - 200, 44);
        const tw = t.getComputedTextLength();
        ink(ng, ptsLine(nx - tw / 2, ny + 18, nx + tw / 2, ny + 12, 40), { width: 5, stroke: COLORS[N.color] || C.red, amp: 1.5 });
        let arrow = null, head = null;
        if (hlAnchor && P.arrow !== false) {
          const sx = nx + (hlAnchor[0] > nx ? tw / 2 + 20 : -tw / 2 - 20), sy = ny - 30;
          const ex = hlAnchor[0] + (sx > hlAnchor[0] ? 40 : -40), ey = hlAnchor[1] + 26;
          const mx = (sx + ex) / 2 + (sx > ex ? 60 : -60), my = Math.max(sy, ey) + 10;
          const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10; pts.push([(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * ey]); }
          arrow = ink(ng, pts, { width: 6, stroke: COLORS[N.color] || C.red, reveal: true, amp: 1.5 });
          const a = Math.atan2(ey - pts[8][1], ex - pts[8][0]);
          head = ink(ng, [[ex - 34 * Math.cos(a - 0.5), ey - 34 * Math.sin(a - 0.5)], [ex, ey], [ex - 34 * Math.cos(a + 0.5), ey - 34 * Math.sin(a + 0.5)]], { width: 6, stroke: COLORS[N.color] || C.red, amp: 1 });
        }
        note = { ng, N, nx, ny, arrow, head };
      }
      return {
        update(lt, dur, cues, env) {
          ink.tick(env.t);
          cam.setAttribute('transform', `${camDrift(env.t, W, H)} ${around(W / 2, H * 0.42, `scale(${f1(lerp(1, 1.03, lt / Math.max(dur, 1)) * 1000) / 1000})`)}`);
          all.forEach((o, i) => {
            const at = cue(cues, 'w' + i, 0.1 + i * 0.16);
            const p = spring(lt, at, 0.6), a = clamp01(lin(lt, at, 0.1)), pk = punch(lt, at, 0.5);
            const s = lerp(1.3, 1, p) * (1 + 0.05 * pk);
            o.grp.setAttribute('opacity', a);
            o.grp.setAttribute('transform', around(o.cx, o.cy, `translate(0 ${f1((1 - p) * 40)}) scale(${f1(s * 1000) / 1000}) rotate(${f1((1 - p) * (i % 2 ? 4 : -4) + (o.isHl && !gold ? -2 : 0))}) ${jig(seed + i * 3, env.t, 0.7)}`));
          });
          if (note) {
            const at = cue(cues, note.N.at || 'note', 0.3 + all.length * 0.16 + 0.35), p = spring(lt, at, 0.6);
            note.ng.setAttribute('opacity', clamp01(p * 2));
            note.ng.setAttribute('transform', around(note.nx, note.ny, `rotate(${f1(-3 + (1 - p) * 8)}) scale(${f1(lerp(0.7, 1, p) * 1000) / 1000}) ${jig(seed + 77, env.t)}`));
            if (note.arrow) { draw(note.arrow.node, prog(lt, at + 0.15, 0.45)); note.head.node.setAttribute('opacity', prog(lt, at + 0.55, 0.15)); }
          }
        },
      };
    },
  };

  // ---------------------------------------------------------------- board: cards with checks / bars + pill
  // P: {title: "Pompeii neden kaçamadı?",
  //     cards: [{title?: "Uyarılar", items: [{text: "Depremler", mark: "check"|"x"|null, at: "cueName"}]},
  //             {title?: "...", bars: [{label: "Kül", value: 0.8, text?: "%80", at}]}],
  //     pill: {text: "Kimse bilmiyordu", color: "blue"|"red"|"green", at}}
  // cues: c0, c1... (cards), item/bar "at" names, pill
  SH.board = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, ink = inkSet(seed + 37);
      const cam = el(svg, 'g');
      const cards = (P.cards || []).slice(0, 4), n = Math.max(1, cards.length);
      const A = portrait ? { x: 70, w: 940, ty: 372, top: 425, bot: P.pill ? 1032 : 1130, py: 1098 }
                         : { x: 170, w: 1580, ty: 252, top: 300, bot: P.pill ? 716 : 800, py: 774 };
      let titleG = null;
      if (P.title) {
        titleG = el(cam, 'g');
        const t = txt(titleG, P.title, W / 2, A.ty, portrait ? 80 : 74, FR, { 'font-weight': 800 });
        fit(t, A.w - 40, 48);
        const tw = t.getComputedTextLength();
        ink(titleG, ptsLine(W / 2 - tw / 2, A.ty + 20, W / 2 + tw / 2, A.ty + 16, 50), { width: 5, stroke: C.inkSoft, amp: 1.5 });
      } else A.top -= 60;
      const cols = portrait ? (n >= 4 ? 2 : 1) : n, rowsN = Math.ceil(n / cols), gap = portrait ? 30 : 40;
      const cw = (A.w - (cols - 1) * gap) / cols;
      // stacked rows share the height by how much each needs (title + items / bars)
      const need = cd => 50 + (cd.title ? 74 : 0) + (cd.bars ? cd.bars.length * 104 : (cd.items || []).length * 74);
      const rowNeed = Array.from({ length: rowsN }, (_, r) => Math.max(...cards.slice(r * cols, r * cols + cols).map(need)));
      const avail = A.bot - A.top - (rowsN - 1) * gap, sumNeed = rowNeed.reduce((a, b) => a + b, 0);
      const rowHs = rowNeed.map(v => v * avail / sumNeed), rowY = rowHs.map((_, r) => A.top + rowHs.slice(0, r).reduce((a, b) => a + b, 0) + r * gap);
      let gi = 0;
      const C2 = cards.map((cd, j) => {
        const cx = A.x + (j % cols) * (cw + gap), cyy = rowY[Math.floor(j / cols)], chh = rowHs[Math.floor(j / cols)];
        const g = el(cam, 'g');
        const pts = ptsRRect(cx, cyy, cw, chh, 24);
        shadowOf(ink, g, pts); ink(g, pts, { closed: true, fill: C.paperLight, width: 3 });
        let y = cyy + 26;
        if (cd.title) {
          const t = txt(g, cd.title, cx + 34, y + 46, portrait ? 54 : 50, FR, { 'font-weight': 800, 'text-anchor': 'start', fill: C.blue });
          fit(t, cw - 68, 44);
          y += 74;
        }
        const entries = cd.bars || cd.items || [];
        const m = Math.max(1, entries.length), rowH = Math.min(cd.bars ? 150 : 130, (cyy + chh - 20 - y) / m);
        const isz = Math.max(44, Math.min(portrait ? 52 : 48, rowH * 0.7));
        const rows = entries.map((it, k) => {
          const rg = el(g, 'g'), ry = y + rowH * (k + 0.5);
          const row = { g: rg, it, k: gi++, cx, ry };
          if (cd.bars) {
            const lab = txt(rg, it.label || '', cx + 34, ry - 10, portrait ? 48 : 46, LO, { 'font-weight': 700, 'text-anchor': 'start' });
            fit(lab, cw - 220, 44);
            if (it.text != null) txt(rg, it.text, cx + cw - 34, ry - 10, 48, FR, { 'font-weight': 800, 'text-anchor': 'end', fill: C.blue });
            const tx = cx + 34, tw = cw - 68, th = 30, ty = ry + 8;
            ink(rg, ptsRRect(tx, ty, tw, th, th / 2, 90), { closed: true, fill: C.paperDark, width: 3, amp: 1.2 });
            row.fill = el(rg, 'rect', { x: tx + 4, y: ty + 4, height: th - 8, rx: (th - 8) / 2, fill: C.blue, width: 0 });
            row.tw = tw - 8; row.value = clamp01(it.value ?? 0.5);
          } else {
            const bx = cx + 34, s = Math.min(52, Math.max(40, rowH * 0.62));
            ink(rg, ptsRRect(bx, ry - s / 2, s, s, 10, 40), { closed: true, fill: C.paper, width: 3, stroke: C.inkSoft, amp: 1.2 });
            if (it.mark === 'check') {
              row.marks = [ink(rg, CHECK(s * 1.25).map(q => [bx + s / 2 + q[0], ry - 4 + q[1]]), { width: 10, stroke: C.blue, reveal: true, amp: 1.2 })];
            } else if (it.mark === 'x') {
              row.marks = CROSS(s * 1.05).map(seg => ink(rg, seg.map(q => [bx + s / 2 + q[0], ry + q[1]]), { width: 10, stroke: C.red, reveal: true, amp: 1.2 }));
            } else {
              row.marks = null;
              ink(rg, ptsCircle(bx + s / 2, ry, 9, 8), { closed: true, fill: C.ink, stroke: 'none', width: 0, amp: 0.8 });
            }
            const w = wrap(rg, it.text || '', bx + s + 26, 0, isz, LO, cw - (s + 26) - 34 - 34, rowH > 110 ? 2 : 1, 44, { 'font-weight': 700, 'text-anchor': 'start' }, 1.08);
            w.node.setAttribute('y', ry + w.size * 0.34 - (w.lines.length - 1) * w.size * 0.54);
            if (it.mark === 'x') w.node.setAttribute('fill', C.inkSoft);
          }
          return row;
        });
        return { g, j, cx: cx + cw / 2, cy: cyy + chh / 2, rows };
      });
      let pill = null;
      if (P.pill) {
        const pg = el(cam, 'g'), col = COLORS[P.pill.color] || C.blue;
        const t = txt(pg, P.pill.text || '', W / 2, A.py + 18, portrait ? 52 : 48, FR, { 'font-weight': 800, fill: C.paperLight });
        fit(t, A.w - 160, 44);
        const tw = t.getComputedTextLength() + 90, ph = 92;
        const pp = ptsRRect(W / 2 - tw / 2, A.py - ph / 2, tw, ph, ph / 2, 60);
        const sh = shadowOf(ink, pg, pp, { dx: 6, dy: 8, alpha: 0.2 }), box = ink(pg, pp, { closed: true, fill: col, width: 4 });
        pg.insertBefore(sh.node, t); pg.insertBefore(box.node, t);
        pill = pg;
      }
      const total = Math.max(1, gi);
      return {
        update(lt, dur, cues, env) {
          ink.tick(env.t);
          cam.setAttribute('transform', `${camDrift(env.t, W, H)} ${around(W / 2, H * 0.4, `scale(${f1(lerp(1, 1.025, lt / Math.max(dur, 1)) * 1000) / 1000})`)}`);
          if (titleG) { const p = spring(lt, 0.02, 0.6); titleG.setAttribute('opacity', clamp01(p * 2)); titleG.setAttribute('transform', around(W / 2, A.ty, `translate(0 ${f1((1 - p) * -30)}) ${jig(seed + 5, env.t)}`)); }
          const span = Math.max(0.6, (dur - 1.4)) / total;
          C2.forEach(c => {
            const ac = cue(cues, 'c' + c.j, 0.15 + c.j * 0.15), p = spring(lt, ac, 0.65);
            c.g.setAttribute('opacity', clamp01(p * 2.5));
            c.g.setAttribute('transform', around(c.cx, c.cy, `translate(0 ${f1((1 - p) * 60)}) scale(${f1(lerp(0.9, 1, p) * 1000) / 1000}) rotate(${f1((c.j % 2 ? 0.5 : -0.5) + (1 - p) * 2)}) ${jig(seed + 10 + c.j, env.t, 0.6)}`));
            c.rows.forEach(r => {
              const at = atOr(cues, r.it.at, 0.5 + r.k * span), pr = spring(lt, at, 0.55), pk = punch(lt, at + 0.15, 0.5);
              r.g.setAttribute('opacity', clamp01(lin(lt, at, 0.12)));
              r.g.setAttribute('transform', around(r.cx, r.ry, `translate(${f1((1 - pr) * -30)} 0)`));
              if (r.fill) r.fill.setAttribute('width', Math.max(0, r.tw * r.value * prog(lt, at + 0.1, 0.9)));
              if (r.marks) r.marks.forEach((mk, q) => {
                draw(mk.node, prog(lt, at + 0.12 + q * 0.18, 0.28));
                mk.node.setAttribute('transform', around(r.cx + 60, r.ry, `scale(${f1((1 + 0.18 * pk) * 1000) / 1000})`));
              });
            });
          });
          if (pill) {
            const at = atOr(cues, P.pill.at || 'pill', Math.max(0.9, dur * 0.72)), p = spring(lt, at, 0.6), pk = punch(lt, at, 0.5);
            pill.setAttribute('opacity', clamp01(p * 2.5));
            pill.setAttribute('transform', around(W / 2, A.py, `scale(${f1(lerp(0.5, 1, p) * (1 + 0.08 * pk) * 1000) / 1000}) rotate(${f1(-1.5 + (1 - p) * -6)})`));
          }
        },
      };
    },
  };

  // ---------------------------------------------------------------- map: old map with route
  // Presets are simplified real coastlines in [lon, lat] (equirectangular, cos(lat) corrected). `bounds` =
  // [lon0, lon1, lat0, lat1] that must stay visible; the sheet shows more around it to fill its own aspect,
  // so land polygons reach far past the bounds. `water` polygons are drawn over the land (seas, lakes).
  const MAPS = {
    mediterranean: {
      bounds: [-6, 37.5, 30, 46.5],
      land: [
        [[-9.5, 43.5], [-9, 39], [-8.9, 37], [-6, 36.8], [-5.6, 36], [-4.5, 36.7], [-2, 36.8], [-0.5, 38.3], [0, 39], [0.3, 40.5], [3, 41.8], [3.1, 42.8], [4, 43.5], [6, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.6, 42.9], [11.6, 42.3], [12.4, 41.7], [13.6, 41.2], [14.3, 40.8], [15.6, 40], [16, 39], [15.7, 38], [16.1, 38], [16.6, 38.4], [17.2, 39], [16.6, 40], [17, 40.5], [18.5, 40.1], [18.4, 40.3], [17.9, 40.7], [16.2, 41.3], [15.2, 41.9], [14, 42.6], [13.6, 43.5], [12.3, 44.5], [12.4, 45.4], [13.7, 45.7], [13.6, 45.1], [14.3, 45.2], [15.2, 44.3], [16.4, 43.5], [17.6, 43], [18.5, 42.4], [19.4, 41.8], [19.4, 40.4], [20, 39.6], [20.7, 38.8], [21.1, 38.3], [21.6, 37.5], [21.7, 36.8], [22.5, 36.4], [23, 36.6], [22.8, 37.6], [23.2, 38], [24, 37.7], [23.9, 38.4], [22.8, 38.9], [22.6, 39.5], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29, 41.2], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [60, 47], [60, 75], [-30, 75], [-30, 43.5]],
        [[29.1, 41.2], [30, 41.1], [31.4, 41.3], [33, 42], [35, 42], [36.5, 41.3], [38, 40.9], [40, 41], [41.5, 41.5], [41.5, 42.5], [60, 42.5], [60, 36.6], [36.2, 36.6], [35.8, 36.8], [34.6, 36.8], [33.6, 36.2], [32.5, 36.1], [31, 36.8], [30.5, 36.5], [29.6, 36.2], [28.2, 36.7], [27.4, 37], [27.2, 37.9], [26.4, 38.3], [26.8, 38.6], [26.9, 39.4], [26.1, 39.5], [26.2, 40.1], [26.8, 40.35], [27.5, 40.4], [29, 40.4], [29.4, 40.8]],
        [[-30, 33], [-9.8, 30], [-6.8, 34], [-6, 35.8], [-5.3, 35.9], [-2, 35.1], [0, 35.9], [3, 36.8], [5, 36.8], [7.8, 36.9], [9.8, 37.3], [10.3, 36.8], [11, 37], [10.4, 36.2], [11.1, 35.2], [10, 34.2], [10.9, 33.1], [12.5, 32.8], [15.2, 32.3], [15.7, 31.4], [18.5, 30.3], [20, 30.9], [20, 32], [21, 32.8], [22.9, 32.6], [25, 31.7], [27.5, 31.2], [29.9, 31.2], [31.2, 31.5], [32.3, 31.2], [34.2, 31.3], [34.6, 32], [35.2, 33], [35.9, 34.5], [35.8, 35.5], [35.9, 36.6], [60, 36.6], [60, -10], [-30, -10]],
        [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 37], [12.4, 37.8]],
        [[8.4, 41], [9.2, 41.2], [9.8, 40.6], [9.6, 39.2], [9, 39], [8.4, 39], [8.4, 40]],
        [[8.6, 42.8], [9.4, 43], [9.6, 42.2], [9.2, 41.4], [8.6, 41.9]],
        [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]],
        [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],
        [[2.5, 39.9], [3.4, 39.8], [3.1, 39.3], [2.4, 39.5]],
      ],
      seas: [{ name: 'Akdeniz', x: 18, y: 34.3 }, { name: 'Karadeniz', x: 34, y: 43.3 }],
      waves: [[5, 39], [13, 35.5], [25, 33.5], [30, 33.2], [-2, 37.5]],
    },
    anatolia: {
      bounds: [25.5, 45, 35.5, 42.5],
      land: [[[0, 20], [60, 20], [60, 60], [0, 60]]],
      water: [
        [[27.5, 42], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [39.5, 47], [38, 46], [37.5, 45.3], [38.5, 44.4], [40, 43.4], [41.5, 42], [41.5, 41.5], [40, 41], [38, 40.9], [36.5, 41.3], [35, 42], [33, 42], [31.4, 41.3], [30, 41.1], [29.1, 41.2], [29, 41.2]],
        [[26.2, 40.1], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29.4, 40.8], [29, 40.4], [27.5, 40.4], [26.8, 40.35]],
        [[10, 30], [10, 40.6], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.1, 39.5], [26.9, 39.4], [26.8, 38.6], [26.4, 38.3], [27.2, 37.9], [27.4, 37], [28.2, 36.7], [29.6, 36.2], [30.5, 36.5], [31, 36.8], [32.5, 36.1], [33.6, 36.2], [34.6, 36.8], [35.8, 36.8], [36.2, 36.6], [35.9, 36.6], [35.8, 35.5], [35.9, 34.5], [35.2, 33], [34.6, 32], [34.2, 30]],
        [[42.3, 38.6], [42.9, 38.95], [43.5, 38.8], [43.3, 38.4], [42.6, 38.3]],
      ],
      islands: [
        [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]],
        [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],
        [[26.2, 39.3], [26.6, 39.4], [26.5, 39], [26.1, 39.1]],
        [[27.8, 36.2], [28.2, 36.45], [28.1, 36], [27.75, 35.9]],
      ],
      seas: [{ name: 'Karadeniz', x: 34, y: 43.3 }, { name: 'Akdeniz', x: 31, y: 35 }],
      waves: [[30, 42.6], [38, 42.3], [28, 35.5], [34, 35.8], [25.8, 37.5]],
    },
    naples: {
      bounds: [13.85, 14.65, 40.52, 40.95],
      land: [
        [[13.4, 41.6], [13.85, 41.1], [14.0, 40.95], [14.05, 40.85], [14.08, 40.78], [14.12, 40.82], [14.2, 40.8], [14.25, 40.84], [14.33, 40.81], [14.37, 40.78], [14.45, 40.75], [14.48, 40.7], [14.42, 40.66], [14.37, 40.63], [14.33, 40.57], [14.45, 40.6], [14.6, 40.63], [14.75, 40.66], [15.2, 40.55], [15.2, 41.6]],
        [[13.86, 40.73], [13.9, 40.76], [13.96, 40.75], [13.95, 40.71], [13.89, 40.7]],
        [[14.2, 40.55], [14.25, 40.56], [14.27, 40.55], [14.24, 40.54]],
      ],
      seas: [{ name: 'Napoli Körfezi', x: 14.2, y: 40.69 }],
      waves: [[14.0, 40.62], [14.3, 40.72], [14.1, 40.55], [14.5, 40.55]],
    },
    atlantic: {
      bounds: [-80, 10, 0, 60],
      land: [
        [[-120, 75], [-60, 75], [-55, 52], [-66, 45], [-70, 42], [-76, 38], [-81, 31], [-80, 25], [-82, 24], [-90, 21], [-87, 15], [-83, 10], [-77, 8], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-35, -5], [-35, -30], [-120, -30]],
        [[-10, 44], [-9, 43], [-9, 39], [-8.9, 37], [-6, 36.8], [-5.6, 36], [5, 36], [30, 36], [30, 75], [5, 62], [5, 58], [8, 57], [8, 54], [4, 52], [2, 51], [-1, 50], [-5, 48.5], [-4, 47.5], [-1, 46], [-1.5, 43.5]],
        [[-5.5, 35.8], [-6, 35.5], [-9.8, 30], [-13, 27], [-17, 21], [-17.5, 14.7], [-16, 12], [-13, 9], [-8, 4.5], [-3, 5], [5, 6], [9, 4], [9.5, 0], [30, -30], [30, 35.8]],
        [[-5.7, 50], [1.5, 51], [1.7, 52.8], [0, 53.5], [-1.5, 55], [-2, 57], [-4, 58.6], [-6, 57.5], [-5, 55], [-3, 54], [-4.5, 53], [-5, 51.7]],
        [[-10, 51.5], [-6, 52], [-6, 54], [-8, 55.2], [-10, 54]],
      ],
      seas: [{ name: 'Atlas Okyanusu', x: -40, y: 30 }],
      waves: [[-50, 40], [-30, 20], [-20, 45], [-40, 10]],
    },
  };
  // P: {preset: "mediterranean"|"anatolia"|"naples"|"atlantic", land: [[[x,y]...]...], coast: [[x,y]...] (open line),
  //     With a preset, every x/y below is [lon, lat] (x = longitude, y = latitude), e.g. Pompeii {x: 14.49, y: 40.75};
  //     without one (or with "coords": "sheet") x/y are 0..1 of the map sheet.
  //     cities: [{name, x, y, at, dx, dy, color, anchor}], mountains: [{name, x, y, volcano: true, at, size}],
  //     route: {points: [[x,y]...], at: "cueName", dur: 1.8, color: "red"}, note: "..." | {text, x, y, at},
  //     seas: [{name, x, y}] (override), focus: [x, y], zoom: 1.12, compass: "br"|"bl"|"tr"|"tl"|false}
  // cues: route (or route.at), city/mountain "at" names, note
  SH.map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W, ink = inkSet(seed + 53);
      const pre = MAPS[P.preset] || (P.land || P.coast ? {} : MAPS.mediterranean);
      const S = portrait ? { x: 70, y: 330, w: 940, h: 783 } : { x: (W - 1000) / 2, y: 192, w: 1000, h: 636 };
      const X = u => S.x + u * S.w, Y = v => S.y + v * S.h;            // sheet-relative (0..1)
      let PX = q => [X(q[0]), Y(q[1])];                                 // data coords -> stage px
      if (pre.bounds && P.coords !== 'sheet') {
        const [lo0, lo1, la0, la1] = pre.bounds, kx = Math.cos((la0 + la1) / 2 * Math.PI / 180);
        const sc = Math.min(S.w / ((lo1 - lo0) * kx), S.h / (la1 - la0)), lc = (lo0 + lo1) / 2, ac = (la0 + la1) / 2;
        PX = q => [S.x + S.w / 2 + (q[0] - lc) * kx * sc, S.y + S.h / 2 - (q[1] - ac) * sc];
      }
      const XY = PX;
      const cam = el(svg, 'g');
      const sheetPts = ptsRRect(S.x, S.y, S.w, S.h, 10, 90);
      shadowOf(ink, cam, sheetPts, { dx: 10, dy: 12, alpha: 0.18 });
      ink(cam, sheetPts, { closed: true, fill: C.paperLight, width: 4 });
      const cid = 'mapclip' + seed;
      const clip = el(defs, 'clipPath', { id: cid });
      el(clip, 'rect', { x: S.x + 4, y: S.y + 4, width: S.w - 8, height: S.h - 8, rx: 8 });
      const outer = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const mg = el(outer, 'g');
      // graticule
      for (let i = 1; i < 6; i++) {
        ink(mg, ptsLine(X(i / 6), S.y, X(i / 6), S.y + S.h, 120), { width: 2, stroke: C.inkSoft, opacity: 0.28, dash: '8 14', amp: 1 });
        ink(mg, ptsLine(S.x, Y(i / 5), S.x + S.w, Y(i / 5), 120), { width: 2, stroke: C.inkSoft, opacity: 0.28, dash: '8 14', amp: 1 });
      }
      const land = (P.land || pre.land || []);
      for (const poly of land) ink(mg, ptsPoly(poly.map(XY), 45), { closed: true, fill: C.paperDark, stroke: C.inkSoft, width: 4, amp: 1.6 });
      for (const wp of pre.water || []) ink(mg, ptsPoly(wp.map(XY), 45), { closed: true, fill: C.paperLight, stroke: C.inkSoft, width: 4, amp: 1.6 });
      for (const ip of pre.islands || []) ink(mg, ptsPoly(ip.map(XY), 45), { closed: true, fill: C.paperDark, stroke: C.inkSoft, width: 4, amp: 1.2 });
      if (P.coast) ink(mg, ptsPoly(P.coast.map(XY), 45), { stroke: C.inkSoft, width: 4, amp: 1.6 });
      for (const [wx, wy] of (P.waves || pre.waves || [])) {
        const [x0, y0] = PX([wx, wy]), pts = [];
        for (let i = 0; i <= 8; i++) pts.push([x0 - 36 + i * 9, y0 + Math.sin(i * 1.6) * 6]);
        ink(mg, pts, { width: 3, stroke: C.inkSoft, opacity: 0.7, amp: 1 });
      }
      for (const sl of (P.seas || pre.seas || [])) {
        const t = txt(mg, sl.name, PX([sl.x, sl.y])[0], PX([sl.x, sl.y])[1], sl.size || 50, PH, { fill: C.inkSoft, 'letter-spacing': '0.08em', opacity: 0.9 });
        fit(t, S.w * 0.5, 44);
      }
      // mountains / volcano
      const mts = (P.mountains || []).map((m, k) => {
        const g = el(mg, 'g'), [x0, y0] = PX([m.x, m.y]), s = m.size || 80;
        ink(g, [[x0 - s * 0.9, y0 + s * 0.45], [x0 - s * 0.15, y0 - s * 0.5], [x0 + s * 0.15, y0 - s * 0.5], [x0 + s * 0.9, y0 + s * 0.45]], { closed: true, fill: C.paper, stroke: C.ink, width: 5, amp: 1.5 });
        ink(g, [[x0 - s * 0.3, y0 - s * 0.1], [x0 - s * 0.1, y0 + s * 0.2], [x0, y0 - s * 0.05], [x0 + s * 0.15, y0 + s * 0.25]], { width: 3, stroke: C.inkSoft, amp: 1 });
        let plume = null;
        if (m.volcano) {
          plume = el(g, 'g');
          const pp = []; for (let i = 0; i <= 9; i++) pp.push([x0 + Math.sin(i * 0.9) * s * 0.18 + i * s * 0.05, y0 - s * 0.55 - i * s * 0.17]);
          ink(plume, pp, { width: 7, stroke: C.inkSoft, amp: 2 });
          [[0.18, -1.95, 0.32], [-0.12, -1.6, 0.26], [0.42, -1.75, 0.24]].forEach(([dx, dy, r]) => ink(plume, ptsCircle(x0 + dx * s, y0 + dy * s, r * s, 12), { closed: true, fill: C.paperDark, stroke: C.inkSoft, width: 4, amp: 1.5 }));
        }
        let lab = null;
        if (m.name) { lab = txt(g, m.name, x0 + (m.dx ?? 0), y0 + s * 0.45 + 56 + (m.dy ?? 0), m.label_size || 52, PH, { fill: C.ink, style: `paint-order: stroke; stroke: ${C.paperLight}; stroke-width: 10px` }); }
        return { g, m, k, x0, y0, plume, s };
      });
      // route
      let route = null;
      if (P.route && (P.route.points || []).length > 1) {
        const pts = P.route.points.map(XY), dense = [];
        for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < 16; k++) {
          const u = k / 16, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
          const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
          dense.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
        }
        dense.push(pts[pts.length - 1]);
        const cum = [0]; for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
        const col = COLORS[P.route.color] || C.red;
        const node = el(mg, 'path', { fill: 'none', stroke: col, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-dasharray': '22 18' });
        const head = el(mg, 'path', { fill: 'none', stroke: col, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
        const dot = el(mg, 'circle', { r: 14, fill: col, stroke: C.paperLight, 'stroke-width': 5 });
        route = { dense, cum, node, head, dot, L: cum[cum.length - 1] };
      }
      // cities
      const cities = (P.cities || []).map((c, k) => {
        const g = el(mg, 'g'), [x0, y0] = PX([c.x, c.y]), col = COLORS[c.color] || C.ink;
        ink(g, ptsCircle(x0, y0, 16, 10), { closed: true, fill: C.paperLight, stroke: col, width: 5, amp: 1 });
        ink(g, ptsCircle(x0, y0, 6, 8), { closed: true, fill: col, stroke: 'none', width: 0, amp: 0.6 });
        const dx = c.dx ?? 0, dy = c.dy ?? -36;
        const t = txt(g, c.name, x0 + dx, y0 + dy, c.size || (portrait ? 56 : 52), PH, { fill: col, 'text-anchor': c.anchor || 'middle', style: `paint-order: stroke; stroke: ${C.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        fit(t, S.w * 0.45, 44);
        return { g, c, k, x0, y0 };
      });
      // frame + compass on top of the clipped map
      ink(cam, ptsRRect(S.x + 16, S.y + 16, S.w - 32, S.h - 32, 6, 90), { closed: true, stroke: C.inkSoft, width: 2.5, amp: 1.2 });
      let compass = null;
      if (P.compass !== false) {
        const R = portrait ? 70 : 62, cp = typeof P.compass === 'string' ? P.compass : 'br';
        const ccx = cp[1] === 'l' ? S.x + R + 46 : S.x + S.w - R - 46, ccy = cp[0] === 't' ? S.y + R + 70 : S.y + S.h - R - 46;
        compass = el(cam, 'g');
        ink(compass, ptsCircle(ccx, ccy, R * 0.72, 18), { closed: true, fill: C.paperLight, stroke: C.inkSoft, width: 3, amp: 1 });
        for (let q = 0; q < 8; q++) {
          const a = q * Math.PI / 4 - Math.PI / 2, L = q % 2 ? R * 0.58 : R, wd = q % 2 ? 0.2 : 0.16;
          const tip = [ccx + Math.cos(a) * L, ccy + Math.sin(a) * L];
          const l = [ccx + Math.cos(a - Math.PI / 2) * R * wd, ccy + Math.sin(a - Math.PI / 2) * R * wd];
          const r2 = [ccx + Math.cos(a + Math.PI / 2) * R * wd, ccy + Math.sin(a + Math.PI / 2) * R * wd];
          ink(compass, [l, tip, [ccx, ccy]], { closed: true, fill: q % 2 ? C.paperDark : C.ink, stroke: C.ink, width: 2.5, amp: 0.8 });
          ink(compass, [[ccx, ccy], tip, r2], { closed: true, fill: q % 2 ? C.paperLight : C.paperDark, stroke: C.ink, width: 2.5, amp: 0.8 });
        }
        txt(compass, 'K', ccx, ccy - R - 12, 44, FR, { 'font-weight': 800 });
        compass.cx = ccx; compass.cy = ccy;
      }
      // note card
      let note = null;
      if (P.note) {
        const N = typeof P.note === 'string' ? { text: P.note } : P.note;
        const g = el(cam, 'g');
        const nx = N.x != null ? X(N.x) : S.x + 46, ny = N.y != null ? Y(N.y) : S.y + 90;
        const t = txt(g, N.text, nx + 24, ny, N.size || (portrait ? 58 : 54), PH, { fill: COLORS[N.color] || C.red, 'text-anchor': 'start' });
        fit(t, S.w * 0.62, 44);
        const tw = t.getComputedTextLength(), fs = parseFloat(t.getAttribute('font-size'));
        const bp = ptsRRect(nx, ny - fs * 0.95, tw + 48, fs * 1.35, 14, 60);
        const sh = shadowOf(ink, g, bp, { dx: 5, dy: 7 }), box = ink(g, bp, { closed: true, fill: C.paperLight, stroke: C.ink, width: 3, amp: 1.2 });
        g.insertBefore(sh.node, t); g.insertBefore(box.node, t);
        note = { g, N, nx: nx + tw / 2, ny };
      }
      const last = P.route && P.route.points ? P.route.points[P.route.points.length - 1] : null;
      const [FX, FY] = P.focus || last ? PX(P.focus || last) : [S.x + S.w / 2, S.y + S.h / 2];
      return {
        update(lt, dur, cues, env) {
          ink.tick(env.t);
          const pin = spring(lt, 0, 0.7);
          cam.setAttribute('transform', `${camDrift(env.t, W, H)} ${around(W / 2, S.y + S.h / 2, `translate(0 ${f1((1 - pin) * 50)}) rotate(${f1((1 - pin) * -2 - 0.4)})`)}`);
          cam.setAttribute('opacity', clamp01(pin * 3));
          const z = lerp(1, P.zoom ?? 1.12, progIO(lt, 0.2, Math.max(1, dur)));
          mg.setAttribute('transform', around(FX, FY, `scale(${f1(z * 1000) / 1000})`));
          const nPts = cities.length + mts.length;
          mts.forEach(m => {
            const at = atOr(cues, m.m.at, 0.3 + m.k * 0.3), p = spring(lt, at, 0.6);
            m.g.setAttribute('opacity', clamp01(p * 2));
            m.g.setAttribute('transform', around(m.x0, m.y0, `scale(${f1(lerp(0.4, 1, p) * 1000) / 1000})`));
            if (m.plume) m.plume.setAttribute('transform', around(m.x0, m.y0 - m.s * 0.5, `scale(${f1((0.95 + 0.05 * Math.sin(env.t * 1.7)) * 1000) / 1000}) translate(${f1(Math.sin(env.t * 0.8) * 4)} 0)`));
          });
          cities.forEach(c => {
            const at = atOr(cues, c.c.at, 0.35 + (mts.length + c.k) * 0.3), p = spring(lt, at, 0.6), pk = punch(lt, at, 0.5);
            c.g.setAttribute('opacity', clamp01(lin(lt, at, 0.1)));
            c.g.setAttribute('transform', around(c.x0, c.y0, `scale(${f1(lerp(0.3, 1, p) * (1 + 0.12 * pk) * 1000) / 1000}) ${jig(seed + c.k * 5, env.t, 0.7)}`));
          });
          if (route) {
            const at = atOr(cues, P.route.at || 'route', 0.6 + nPts * 0.3), p = progIO(lt, at, P.route.dur || 1.8);
            const L = route.L * p;
            let k = 1; while (k < route.dense.length - 1 && route.cum[k] < L) k++;
            const pts = route.dense.slice(0, k);
            const a0 = route.dense[k - 1], a1 = route.dense[k], u = (L - route.cum[k - 1]) / Math.max(1e-6, route.cum[k] - route.cum[k - 1]);
            const tip = [lerp(a0[0], a1[0], clamp01(u)), lerp(a0[1], a1[1], clamp01(u))];
            pts.push(tip);
            const vis = p > 0.001;
            route.node.setAttribute('d', vis ? 'M' + pts.map(q => `${f1(q[0])} ${f1(q[1])}`).join(' L') : '');
            route.node.setAttribute('stroke-dashoffset', f1(-env.t * 10));
            const ang = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
            route.dot.setAttribute('cx', tip[0]); route.dot.setAttribute('cy', tip[1]);
            route.dot.setAttribute('opacity', vis && p < 1 ? 1 : 0);
            route.dot.setAttribute('r', 14 * (1 + 0.15 * Math.sin(env.t * 6)));
            const hp = prog(lt, at + (P.route.dur || 1.8) - 0.15, 0.2);
            route.head.setAttribute('d', `M${f1(tip[0] - 38 * Math.cos(ang - 0.55))} ${f1(tip[1] - 38 * Math.sin(ang - 0.55))} L${f1(tip[0])} ${f1(tip[1])} L${f1(tip[0] - 38 * Math.cos(ang + 0.55))} ${f1(tip[1] - 38 * Math.sin(ang + 0.55))}`);
            route.head.setAttribute('opacity', hp);
          }
          if (compass) compass.setAttribute('transform', around(compass.cx, compass.cy, `rotate(${f1(Math.sin(env.t * 0.6) * 5)})`));
          if (note) {
            const at = atOr(cues, note.N.at || 'note', Math.max(0.8, dur * 0.55)), p = spring(lt, at, 0.6);
            note.g.setAttribute('opacity', clamp01(p * 2.5));
            note.g.setAttribute('transform', around(note.nx, note.ny, `rotate(${f1(-2 + (1 - p) * -6)}) scale(${f1(lerp(0.7, 1, p) * 1000) / 1000})`));
          }
        },
      };
    },
  };

  // ---------------------------------------------------------------- timeline
  // P: {items: [{year: "MS 62", text: "Büyük deprem", at: "cueName"}], focus: 2 (index highlighted in red)}
  // vertical in Shorts, horizontal in long videos. cues: item "at" names (marker moves there), else staggered
  SH.timeline = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, ink = inkSet(seed + 71);
      const cam = el(svg, 'g');
      const items = (P.items || []).slice(0, 6), n = Math.max(1, items.length);
      const focus = P.focus;
      const L = portrait ? { a: 360, b: 1100, x: 190 } : { a: 220, b: 1700, y: 440 };
      const pos = k => n === 1 ? (L.a + L.b) / 2 : portrait ? lerp(L.a + 50, L.b - 70, k / (n - 1)) : lerp(L.a + 170, L.b - 200, k / (n - 1));
      const line = portrait ? ink(cam, ptsLine(L.x, L.a - 20, L.x, L.b + 20, 60), { width: 7, reveal: true })
                            : ink(cam, ptsLine(L.a - 20, L.y, L.b + 20, L.y, 60), { width: 7, reveal: true });
      const arrowHead = portrait ? ink(cam, [[L.x - 22, L.b - 6], [L.x, L.b + 24], [L.x + 22, L.b - 6]], { width: 7, amp: 1 })
                                 : ink(cam, [[L.b - 6, L.y - 22], [L.b + 24, L.y], [L.b - 6, L.y + 22]], { width: 7, amp: 1 });
      const spacing = n > 1 ? Math.abs(pos(1) - pos(0)) : 600;
      const rows = items.map((it, k) => {
        const g = el(cam, 'g'), p = pos(k), isF = focus === k;
        const [dx, dy] = portrait ? [L.x, p] : [p, L.y];
        const dot = ink(g, ptsCircle(dx, dy, 20, 12), { closed: true, fill: C.paperLight, stroke: C.ink, width: 5, amp: 1 });
        const lab = el(g, 'g');
        let year, desc;
        if (portrait) {
          year = txt(lab, it.year || '', L.x + 62, dy + 6, n > 4 ? 80 : 92, FR, { 'font-weight': 900, 'text-anchor': 'start', fill: isF ? C.red : C.ink });
          fit(year, W - L.x - 140, 56);
          desc = wrap(lab, it.text || '', L.x + 66, dy + 72, n > 4 ? 52 : 58, PH, W - L.x - 150, spacing > 230 ? 2 : 1, 44, { 'text-anchor': 'start', fill: C.inkSoft });
        } else {
          year = txt(lab, it.year || '', dx, L.y - 84, n > 4 ? 76 : 88, FR, { 'font-weight': 900, fill: isF ? C.red : C.ink });
          fit(year, spacing - 24, 52);
          desc = wrap(lab, it.text || '', dx, L.y + 96, 52, PH, Math.min(420, spacing - 30), 3, 44, { fill: C.inkSoft });
        }
        const ring = isF ? ink(g, ptsCircle(dx, dy, 44, 16).concat([[dx + 40, dy - 24]]), { width: 6, stroke: C.red, reveal: true, amp: 1.5 }) : null;
        const tick = portrait ? ink(g, ptsLine(L.x + 24, dy, L.x + 50, dy, 20), { width: 4, stroke: C.inkSoft, amp: 0.8 })
                              : ink(g, ptsLine(dx, L.y - 24, dx, L.y - 40, 20), { width: 4, stroke: C.inkSoft, amp: 0.8 });
        return { g, it, k, dx, dy, dot, lab, year, desc, ring, isF };
      });
      const marker = el(cam, 'g');
      if (portrait) ink(marker, [[-74, -20], [-40, 0], [-74, 20]], { closed: true, fill: C.red, stroke: C.ink, width: 4, amp: 1 });
      else ink(marker, [[-18, -62], [0, -32], [18, -62]], { closed: true, fill: C.red, stroke: C.ink, width: 4, amp: 1 });
      return {
        update(lt, dur, cues, env) {
          ink.tick(env.t);
          cam.setAttribute('transform', camDrift(env.t, W, H));
          draw(line.node, prog(lt, 0, 0.7));
          arrowHead.node.setAttribute('opacity', prog(lt, 0.55, 0.2));
          const span = Math.max(0.5, (dur - 1.2) / n);
          const ats = rows.map(r => atOr(cues, r.it.at, 0.45 + r.k * span));
          let mpos = pos(0);
          rows.forEach((r, k) => {
            const at = ats[k], p = spring(lt, at, 0.6), pk = punch(lt, at, 0.5);
            const pre = prog(lt, 0.2 + k * 0.08, 0.4);          // faint "planned" state before its moment
            r.g.setAttribute('opacity', clamp01(Math.max(pre * 0.35, lin(lt, at, 0.12))));
            r.lab.setAttribute('transform', portrait ? `translate(${f1((1 - p) * 30)} 0) ${jig(seed + k * 7, env.t, 0.6)}` : `translate(0 ${f1((1 - p) * 24)}) ${jig(seed + k * 7, env.t, 0.6)}`);
            r.dot.node.setAttribute('fill', lt >= at ? (r.isF ? C.red : C.blue) : C.paperLight);
            r.dot.node.setAttribute('transform', around(r.dx, r.dy, `scale(${f1((1 + 0.35 * pk) * 1000) / 1000})`));
            if (r.ring) draw(r.ring.node, prog(lt, at + 0.2, 0.5));
            if (k > 0) mpos += (pos(k) - pos(k - 1)) * spring(lt, at - 0.15, 0.7);
          });
          const mp = spring(lt, ats[0] - 0.1, 0.6);
          marker.setAttribute('opacity', clamp01(mp * 2));
          marker.setAttribute('transform', portrait ? `translate(${L.x} ${f1(mpos)}) translate(${f1(Math.sin(env.t * 4) * 4)} 0)`
                                                    : `translate(${f1(mpos)} ${L.y}) translate(0 ${f1(Math.sin(env.t * 4) * 4)})`);
        },
      };
    },
  };
})();
