// Belgesel style typographic + data shots (docs/BELGESEL.md): quiet, centred, nothing in the top-left corner.
//   bt_chapter  P: {n: "II", title: "Kaynayan su", sub: "..."}                    numeral, hairline, title
//   bt_text     P: {lines: [{text, at: "<cue>", italic, size, accent}]}           one or two big words that appear on cues
//   bt_word     P: {from: {word, gloss, icon: "snail"|"chip"}, to: {word, gloss}} etymology: word -> word
//   bt_clock    P: {hours: 25, label: "saat", note: "..."}  cues: run            a 24-hour dial that fills past a full day
//   bt_count    P: {total: 2737, hit: 129, label: "kaşık", note: "..."}  cues: hit   a field of marks, a few light up
//   bt_map      P: {bounds: [lon0, lat0, lon1, lat1], points: [{lon, lat, label, sub, at}], routes: [[i, j, at]]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const txt = (g, s, x, y, size, o = {}) => {
    const e = svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR, 'font-weight': o.weight || 300 },
      o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
    return e;
  };
  const fade = (e, a) => e.setAttribute('opacity', clamp01(a).toFixed(3));

  SH.bt_chapter = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), cx = W / 2, cy = H * 0.44;
      BTL.glow(svg, defs, cx, cy, 560, C.stain, 0.1, g);
      const num = txt(g, P.n || 'I', cx, cy - 120, 58, { color: C.gold, weight: 400, spacing: '0.08em' });
      const rule = el(g, 'path', { d: `M${cx - 160} ${cy - 70}L${cx + 160} ${cy - 70}`, stroke: C.inkSoft, 'stroke-width': 2, pathLength: 1, fill: 'none' });
      const title = txt(g, P.title || '', cx, cy + 50, 118, { weight: 300 });
      const sub = P.sub ? txt(g, P.sub, cx, cy + 130, 44, { font: LO, italic: true, color: C.inkSoft, weight: 400 }) : null;
      return {
        update(lt) {
          fade(num, BTL.ease(lt, 0.1, 1.2)); draw(rule, BTL.ease(lt, 0.4, 1.4));
          fade(title, BTL.ease(lt, 0.7, 1.4)); title.setAttribute('transform', `translate(0 ${(1 - BTL.ease(lt, 0.7, 1.6)) * 14})`);
          if (sub) fade(sub, BTL.ease(lt, 1.4, 1.4));
        },
      };
    },
  };

  SH.bt_text = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), L = P.lines || [], n = L.length;
      BTL.glow(svg, defs, W / 2, H * 0.44, 520, C.stain, 0.08, g);
      const gap = P.gap || 190, y0 = H * 0.44 - (n - 1) * gap / 2 + 40;
      const items = L.map((l, i) => ({ l, e: txt(g, l.text, W / 2, y0 + i * gap, l.size || 150, { italic: l.italic, weight: l.weight || 300, color: l.accent ? C.gold : C.ink }) }));
      return {
        update(lt, dur, cues) {
          items.forEach(({ l, e }, i) => {
            const at = cue(cues, l.at, 0.2 + i * dur * 0.4);
            fade(e, BTL.ease(lt, at - 0.2, 1.2));
            e.setAttribute('transform', `translate(0 ${(1 - BTL.ease(lt, at - 0.2, 1.6)) * 16})`);
          });
        },
      };
    },
  };

  SH.bt_word = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), A = P.from || {}, B = P.to || {}, y = H * 0.5, xa = W * 0.29, xb = W * 0.71;
      BTL.glow(svg, defs, W / 2, H * 0.44, 600, C.stain, 0.08, g);
      const D = BTL.drawing(g);
      const ic = el(g, 'g', { transform: `translate(${xa} ${y - 230}) scale(0.36)` });
      const DI = BTL.drawing(ic);
      if (A.icon === 'snail') BTL.OBJ.snail(DI);
      else if (A.icon === 'chip') { DI.f('M-260-30L200-60L280-20L240 40L-220 50Z', C.paperLight, 1); DI.s('M-260-30L200-60L280-20L240 40L-220 50Z', { w: 6 }); DI.s('M-180-10L180-30M-160 26L200 10', { w: 4, color: C.inkSoft }); }
      const wa = txt(g, A.word || '', xa, y + 40, 116, { italic: true, weight: 300 });
      const ga = txt(g, A.gloss || '', xa, y + 120, 46, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      const ar = D.s(`M${W / 2 - 80} ${y + 10}L${W / 2 + 80} ${y + 10}M${W / 2 + 56} ${y - 10}L${W / 2 + 80} ${y + 10}L${W / 2 + 56} ${y + 30}`, { w: 3, color: C.gold });
      const wb = txt(g, B.word || '', xb, y + 40, 116, { italic: true, weight: 300, color: B.accent === false ? C.ink : C.gold });
      const gb = txt(g, B.gloss || '', xb, y + 120, 46, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      return {
        update(lt, dur, cues) {
          DI.reveal(BTL.ease(lt, 0, 2.2));
          fade(wa, BTL.ease(lt, 0.3, 1.2)); fade(ga, BTL.ease(lt, 0.9, 1.2));
          const tb = cue(cues, 'to', dur * 0.5);
          draw(ar, BTL.ease(lt, tb - 0.8, 1));
          fade(wb, BTL.ease(lt, tb - 0.2, 1.2)); fade(gb, BTL.ease(lt, tb + 0.4, 1.2));
        },
      };
    },
  };

  SH.bt_clock = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), cx = W / 2, cy = H * 0.45, R = 300, hours = P.hours || 25;
      BTL.glow(svg, defs, cx, cy, 560, C.stain, 0.1, g);
      el(g, 'circle', { cx, cy, r: R, fill: 'none', stroke: C.inkSoft, 'stroke-width': 2 });
      let ticks = '';
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.2832, r1 = R - (i % 6 ? 16 : 30); ticks += `M${(cx + Math.sin(a) * r1).toFixed(1)} ${(cy - Math.cos(a) * r1).toFixed(1)}L${(cx + Math.sin(a) * R).toFixed(1)} ${(cy - Math.cos(a) * R).toFixed(1)}`; }
      el(g, 'path', { d: ticks, stroke: C.inkSoft, 'stroke-width': 3, fill: 'none' });
      const arc = el(g, 'path', { fill: 'none', stroke: C.ink, 'stroke-width': 10, 'stroke-linecap': 'round' });
      const over = el(g, 'path', { fill: 'none', stroke: C.gold, 'stroke-width': 14, 'stroke-linecap': 'round' });
      const num = txt(g, '0', cx, cy + 40, 170, { weight: 300 });
      const lab = txt(g, P.label || 'saat', cx, cy + 112, 48, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      const arcD = (a0, a1, r) => { const p = a => `${(cx + Math.sin(a) * r).toFixed(1)} ${(cy - Math.cos(a) * r).toFixed(1)}`; return `M${p(a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`; };
      return {
        update(lt, dur, cues) {
          const t0 = cue(cues, 'run', 0.4), p = BTL.ease(lt, t0, Math.max(2, Math.min(5, dur - t0 - 1)));
          const h = p * hours, a = Math.min(h, 23.999) / 24 * 6.2832;
          arc.setAttribute('d', h > 0.02 ? arcD(0, a, R - 50) : '');
          over.setAttribute('d', h > 24 ? arcD(0, (h - 24) / 24 * 6.2832 + 0.001, R - 50) : '');
          num.textContent = String(Math.round(h));
          fade(lab, BTL.ease(lt, 0.2, 1));
        },
      };
    },
  };

  SH.bt_count = {
    kind: '2d',
    build({ P, W, H, svg, defs, seed }) {
      const g = el(svg, 'g'), total = P.total || 2737, hit = P.hit || 129, cols = 74, rows = Math.ceil(total / cols);
      const x0 = 90, y0 = 170, sx = 14.4, sy = 18.4, r = rng(seed * 31 + 7), pick = new Set();
      while (pick.size < hit) pick.add(Math.floor(r() * total));
      let dA = '', dB = '';
      for (let i = 0; i < total; i++) {
        const x = x0 + (i % cols) * sx, y = y0 + Math.floor(i / cols) * sy, s = `M${x.toFixed(1)} ${(y + 6).toFixed(1)}l6 -10`;
        if (pick.has(i)) dB += s; else dA += s;
      }
      const all = el(g, 'path', { d: dA, stroke: C.inkSoft, 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' });
      const gold = el(g, 'path', { d: dB, stroke: C.inkSoft, 'stroke-width': 3, 'stroke-linecap': 'round', fill: 'none' });
      const tx = x0 + cols * sx + 380;
      const num = txt(g, '0', tx, H * 0.47, 210, { weight: 300, color: C.gold });
      const lab = txt(g, P.label || '', tx, H * 0.47 + 76, 52, { font: LO, italic: true, color: C.ink, weight: 400 });
      const note = P.note ? txt(g, P.note, tx, H * 0.47 + 140, 40, { font: LO, italic: true, color: C.inkSoft, weight: 400 }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.45);
          fade(all, BTL.ease(lt, 0, 1.5) * (1 - 0.6 * BTL.ease(lt, th, 1.2)));
          const q = BTL.ease(lt, th, 1.2);
          fade(gold, BTL.ease(lt, 0, 1.5)); gold.setAttribute('stroke', q > 0.5 ? C.gold : C.inkSoft); gold.setAttribute('stroke-width', (3 + 2 * q).toFixed(2));
          num.textContent = String(Math.round(hit * BTL.ease(lt, th, 2)));
          fade(num, BTL.ease(lt, th - 0.2, 0.6)); fade(lab, BTL.ease(lt, th + 0.4, 1));
          if (note) fade(note, BTL.ease(lt, 0.4, 1.2));
        },
      };
    },
  };

  // coastlines in [lon, lat] (simplified, from the parchment map presets)
  const LAND = [
    [[-9.5, 43.5], [-9, 39], [-8.9, 37], [-6, 36.8], [-5.6, 36], [-4.5, 36.7], [-2, 36.8], [-0.5, 38.3], [0, 39], [0.3, 40.5], [3, 41.8], [3.1, 42.8], [4, 43.5], [6, 43.1], [7.5, 43.8], [8.8, 44.4], [10.2, 43.9], [10.6, 42.9], [11.6, 42.3], [12.4, 41.7], [13.6, 41.2], [14.3, 40.8], [15.6, 40], [16, 39], [15.7, 38], [16.1, 38], [16.6, 38.4], [17.2, 39], [16.6, 40], [17, 40.5], [18.5, 40.1], [18.4, 40.3], [17.9, 40.7], [16.2, 41.3], [15.2, 41.9], [14, 42.6], [13.6, 43.5], [12.3, 44.5], [12.4, 45.4], [13.7, 45.7], [13.6, 45.1], [14.3, 45.2], [15.2, 44.3], [16.4, 43.5], [17.6, 43], [18.5, 42.4], [19.4, 41.8], [19.4, 40.4], [20, 39.6], [20.7, 38.8], [21.1, 38.3], [21.6, 37.5], [21.7, 36.8], [22.5, 36.4], [23, 36.6], [22.8, 37.6], [23.2, 38], [24, 37.7], [23.9, 38.4], [22.8, 38.9], [22.6, 39.5], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29, 41.2], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [60, 47], [60, 75], [-30, 75], [-30, 43.5]],
    [[29.1, 41.2], [30, 41.1], [31.4, 41.3], [33, 42], [35, 42], [36.5, 41.3], [38, 40.9], [40, 41], [41.5, 41.5], [41.5, 42.5], [60, 42.5], [60, 36.6], [36.2, 36.6], [35.8, 36.8], [34.6, 36.8], [33.6, 36.2], [32.5, 36.1], [31, 36.8], [30.5, 36.5], [29.6, 36.2], [28.2, 36.7], [27.4, 37], [27.2, 37.9], [26.4, 38.3], [26.8, 38.6], [26.9, 39.4], [26.1, 39.5], [26.2, 40.1], [26.8, 40.35], [27.5, 40.4], [29, 40.4], [29.4, 40.8]],
    [[-30, 33], [-9.8, 30], [-6.8, 34], [-6, 35.8], [-5.3, 35.9], [-2, 35.1], [0, 35.9], [3, 36.8], [5, 36.8], [7.8, 36.9], [9.8, 37.3], [10.3, 36.8], [11, 37], [10.4, 36.2], [11.1, 35.2], [10, 34.2], [10.9, 33.1], [12.5, 32.8], [15.2, 32.3], [15.7, 31.4], [18.5, 30.3], [20, 30.9], [20, 32], [21, 32.8], [22.9, 32.6], [25, 31.7], [27.5, 31.2], [29.9, 31.2], [31.2, 31.5], [32.3, 31.2], [34.2, 31.3], [34.6, 32], [35.2, 33], [35.9, 34.5], [35.8, 35.5], [35.9, 36.6], [60, 36.6], [60, -10], [-30, -10]],
    [[12.4, 38.1], [13.4, 38.2], [15.6, 38.3], [15.1, 37.3], [15.1, 36.7], [14.3, 37], [12.4, 37.8]],
    [[8.4, 41], [9.2, 41.2], [9.8, 40.6], [9.6, 39.2], [9, 39], [8.4, 39], [8.4, 40]],
    [[8.6, 42.8], [9.4, 43], [9.6, 42.2], [9.2, 41.4], [8.6, 41.9]],
    [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]],
    [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],
  ];
  SH.bt_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), [l0, b0, l1, b1] = P.bounds || [-2, 28, 40, 46];
      // the requested bounds fit inside the picture (above the subtitles); the land then runs on to every frame edge
      const k = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - 180, ah = H - 230;
      const s = Math.min(aw / ((l1 - l0) * k), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * k * s / 2, oy = (H - 90) / 2 - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * k * s, Y = lat => oy + (b1 - lat) * s;
      const mg = el(g, 'g');
      let grat = '';
      for (let lon = -30; lon <= 60; lon += 5) grat += `M${X(lon).toFixed(0)} -10L${X(lon).toFixed(0)} ${H + 10}`;
      for (let lat = 10; lat <= 70; lat += 5) grat += `M-10 ${Y(lat).toFixed(0)}L${W + 10} ${Y(lat).toFixed(0)}`;
      el(mg, 'path', { d: grat, stroke: C.inkSoft, 'stroke-opacity': 0.18, 'stroke-width': 1.5, fill: 'none' });
      const landD = LAND.map(poly => 'M' + poly.map(p => X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('L') + 'Z').join('');
      el(mg, 'path', { d: landD, fill: C.paperLight, 'fill-opacity': 0.9, stroke: 'none' });
      const coast = el(mg, 'path', { d: landD, fill: 'none', stroke: C.inkSoft, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
      const pts = (P.points || []).map(p => {
        const x = X(p.lon), y = Y(p.lat), pg = el(g, 'g');
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 2.5 });
        el(pg, 'circle', { cx: x, cy: y, r: 9, fill: C.gold });
        const right = x < W * 0.7, ax = right ? x + 34 : x - 34, an = right ? 'start' : 'end';
        const lab = txt(pg, p.label || '', ax, y + 16, 54, { weight: 400, anchor: an });
        const sub = p.sub ? txt(pg, p.sub, ax, y + 70, 42, { font: LO, italic: true, color: C.inkSoft, weight: 400, anchor: an }) : null;
        for (const t of [lab, sub]) if (t) { t.setAttribute('stroke', C.paper); t.setAttribute('stroke-width', 10); t.setAttribute('stroke-linejoin', 'round'); t.setAttribute('paint-order', 'stroke'); }
        return { p, pg, ring, lab, sub, x, y };
      });
      const routes = (P.routes || []).map(([a, b, at]) => {
        const A = pts[a], B = pts[b], mxp = (A.x + B.x) / 2, myp = Math.min(A.y, B.y) - Math.abs(A.x - B.x) * 0.18;
        return { at, e: el(g, 'path', { d: `M${A.x} ${A.y}Q${mxp} ${myp} ${B.x} ${B.y}`, fill: 'none', stroke: C.gold, 'stroke-width': 3, pathLength: 1, 'stroke-linecap': 'round' }) };
      });
      return {
        update(lt, dur, cues) {
          coast.setAttribute('stroke-opacity', BTL.ease(lt, 0, 1.2).toFixed(3));
          pts.forEach((q, i) => {
            const at = cue(cues, q.p.at, 0.6 + i * 0.8);
            fade(q.pg, BTL.ease(lt, at - 0.3, 1));
            const ph = ((lt - at) % 2.6 + 2.6) % 2.6 / 2.6;
            q.ring.setAttribute('r', (14 + 26 * ph).toFixed(1)); q.ring.setAttribute('stroke-opacity', ((1 - ph) * 0.8).toFixed(3));
          });
          routes.forEach(r => draw(r.e, BTL.ease(lt, cue(cues, r.at, dur * 0.4), 1.6)));
        },
      };
    },
  };
})();
