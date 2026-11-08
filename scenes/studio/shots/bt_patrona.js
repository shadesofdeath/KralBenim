// bt_patrona: the Patrona Halil revolt (Istanbul, 1730) and the years before it, belgesel style (docs/BELGESEL.md).
// Clean still line art in the theme's tokens; the only motion is slow and natural (lamp light, flames, water, a slow
// walk, falling petals, a shutter coming down). Places are drawn on the 1920x1080 stage (BTL.stage frames a Short).
// Shared kit for bt_patrona_b.js: window.PTL (P0, L0, label, fade, f1, flame, floor, tulip).
//   bt_pt_kepenk  P: {mode: "close"|"empty"}  cues: hit   a covered bazaar street: five arched shop fronts, warm light
//                 inside. close: from "hit" the wooden shutters come down one after another and each light dies.
//                 empty: all shutters down, one hanging lamp in the middle arch, dust drifting in its light
//   bt_pt_kapi    P: {mode: "few"|"grow"|"empty", n}  cues: hit   the tall portal of a great mosque at dawn (pointed
//                 niche, stalactite tiers, dark door). few: a handful (n, default 5) of faceless figures before it, one
//                 holds a banner that moves slowly in the wind (the banner draws in on "hit"). grow: the same, and from
//                 "hit" many more figures fade in around them. empty: nobody, the light grows slowly
//   bt_pt_lale    P: {mode: "one"|"wilt"|"garden"|"name", n, label, text}  cues: hit
//                 one: a single slender Ottoman tulip (needle-pointed petals) in a light pool.
//                 wilt: the same; from "hit" the petals come loose one by one and sink slowly, the light dims.
//                 garden: rows of small tulips appear front to back; on "hit" a big number counts up to n with label.
//                 name: the tulip on the left, the words `text` on the right; on "hit" a thin gold line strikes them out
//   bt_pt_bulb    P: {label}  cues: hit   a balance: a tulip bulb on the left pan, a stack of coins growing on the right;
//                 on "hit" a gold line (the price cap) appears over the stack, the stack stops at it, label under it
//   bt_pt_sadabad P: {mode: "build"|"lamps"|"ruin"}  cues: hit   dusk on a stream: a long two-storey pavilion with wide
//                 eaves on the far bank, cypresses, small pavilions along both banks. build: the palace draws in, the
//                 small pavilions appear one by one from "hit". lamps: night; candles along the near bank light one by
//                 one, their reflections tremble on the water. ruin: night; from "hit" the small pavilions and the
//                 cypresses fade away one by one, the palace windows go dark
//   bt_pt_tortoise P: {}  cues: hit   a night garden: a tortoise walks slowly along the grass with a lit candle on
//                 its shell; tulip silhouettes behind; on "hit" a second, distant candle appears far behind
//   bt_pt_press   P: {label, book}  cues: hit, book   a wooden screw press. On "hit" the platen comes down and lifts,
//                 a printed sheet (lines of script) appears on the right with `label`. On "book": the sheet gives way
//                 to two thick volumes and `book` (text) under them
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const f1 = v => v.toFixed(1);
  let PTID = 0;
  const fade = (e, a) => e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, extra));
  const L0 = (parent, d, stroke, w = 3, a = 1) => el(parent, 'path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));

  // a small flame: nested tongues whose heights breathe smoothly; origin = base centre
  function flame(parent, x, y, s = 1, ph0 = 0) {
    const g = el(parent, 'g');
    const fl = [[C.red, 1, 0], [C.gold, 0.7, 1.3], [C.ink, 0.38, 2.1]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.92), k, ph: ph + ph0 }));
    return {
      g,
      update(lt, amp = 1) {
        for (const f of fl) {
          const h = (120 + 12 * Math.sin(lt * 2.1 + f.ph) + 6 * Math.sin(lt * 3.3 + f.ph * 2)) * f.k * s * amp, w = 40 * f.k * s * Math.max(0.2, amp), lean = 4 * Math.sin(lt * 1.1 + f.ph) * s;
          f.e.setAttribute('d', h < 0.5 ? '' : `M${f1(x - w)} ${y}C${f1(x - w)} ${f1(y - h * 0.45)} ${f1(x - w * 0.2 + lean)} ${f1(y - h * 0.7)} ${f1(x + lean)} ${f1(y - h)}C${f1(x + w * 0.2 + lean)} ${f1(y - h * 0.7)} ${f1(x + w)} ${f1(y - h * 0.45)} ${f1(x + w)} ${y}Z`);
        }
      },
    };
  }
  // the ground: a dark floor from GR to below the frame, one quiet horizon line
  function floor(g, GR, a = 0.85) {
    P0(g, `M-200 ${GR}L2120 ${GR}L2120 1800L-200 1800Z`, C.paperDark, a);
    L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.45);
  }
  // a slender Ottoman tulip into a BTL.drawing; origin = where the stem meets the flower, the flower ~300 tall
  const TUL = {
    stem: 'M0 0C6 90-8 200 4 330',
    leafL: 'M2 300C-60 240-120 150-130 40C-90 130-40 210 2 260Z',
    leafR: 'M4 250C60 190 90 110 96 10C70 100 40 170 4 210Z',
    back: 'M-18-10C-80-60-96-170-62-300C-40-200-14-130 0-90C14-130 40-200 62-300C96-170 80-60 18-10Z',
    mid: 'M0 -4C-56-40-62-170 0-336C62-170 56-40 0-4Z',
    left: 'M-6-2C-70-20-120-120-110-260C-80-160-40-90-2-50Z',
    right: 'M6-2C70-20 120-120 110-260C80-160 40-90 2-50Z',
  };
  function tulip(D, o = {}) {
    D.f(TUL.leafL + TUL.leafR, C.paperLight, 1);
    D.s(TUL.stem, { w: 4 }); D.s(TUL.leafL, { w: 3, color: C.inkSoft }); D.s(TUL.leafR, { w: 3, color: C.inkSoft });
    const petals = [];
    for (const k of ['back', 'left', 'right', 'mid']) {
      const pg = el(D.g, 'g');
      D.f(TUL[k], C.red, k === 'back' ? 0.3 : (k === 'mid' ? 0.72 : 0.55), { parent: pg });
      D.s(TUL[k], { w: 3.5, parent: pg, color: o.gold ? C.gold : C.ink });
      petals.push({ k, g: pg });
    }
    D.s('M0-20C-4-120-2-220 0-300', { w: 2, color: C.inkSoft, alpha: 0.7 });
    return petals;
  }
  window.PTL = { P0, L0, label, fade, f1, flame, floor, tulip, TUL };

  // ------------------------------------------------------------------ bt_pt_kepenk
  SH.bt_pt_kepenk = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'close', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 820, top = GR - 520;
      // the vault of the street above, the back wall
      P0(g, `M-200 ${top - 60}L2120 ${top - 60}L2120 ${GR}L-200 ${GR}Z`, C.paperLight, 0.35);
      L0(g, `M0 ${top - 60}L1920 ${top - 60}`, C.inkSoft, 2, 0.4);
      let vault = ''; for (let i = -1; i <= 5; i++) { const x = 960 + (i - 2) * 330 - 165; vault += `M${x} ${top - 60}C${x + 40} ${top - 230} ${x + 290} ${top - 230} ${x + 330} ${top - 60}`; }
      L0(g, vault, C.inkSoft, 2, 0.3);
      floor(g, GR, 0.9);
      let flags = ''; for (let i = -6; i <= 6; i++) flags += `M${960 + i * 120} ${GR}L${960 + i * 330} 1400`;
      L0(g, flags, C.inkSoft, 1.2, 0.12);
      const D = BTL.drawing(g), shops = [];
      for (let i = 0; i < 5; i++) {
        const cx = 960 + (i - 2) * 330, x0 = cx - 120, x1 = cx + 120, y0 = GR - 360, y1 = GR - 50;
        const arch = `M${cx - 150} ${GR}L${cx - 150} ${GR - 380}C${cx - 150} ${GR - 470} ${cx - 60} ${GR - 520} ${cx} ${GR - 540}C${cx + 60} ${GR - 520} ${cx + 150} ${GR - 470} ${cx + 150} ${GR - 380}L${cx + 150} ${GR}`;
        const light = P0(g, `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`, C.gold, 0);
        // a few goods in the opening: shelves with jars
        let goods = `M${x0 + 10} ${y0 + 110}L${x1 - 10} ${y0 + 110}M${x0 + 10} ${y0 + 200}L${x1 - 10} ${y0 + 200}`;
        for (let j = 0; j < 4; j++) { const gx = x0 + 34 + j * 56; goods += BTL.E(gx, y0 + 88, 16, 22) + `M${gx - 14} ${y0 + 178}L${gx - 14} ${y0 + 150}L${gx + 14} ${y0 + 150}L${gx + 14} ${y0 + 178}`; }
        const gd = L0(g, goods, C.inkSoft, 2, 0.6);
        D.f(`M${x0 - 20} ${GR}L${x0 - 20} ${y1}L${x1 + 20} ${y1}L${x1 + 20} ${GR}Z`, C.paperLight, 1);
        D.s(arch, { w: 3.5 }); D.s(`M${x0} ${y1}L${x0} ${y0}L${x1} ${y0}L${x1} ${y1}`, { w: 2.5, color: C.inkSoft });
        D.s(`M${x0 - 20} ${y1}L${x1 + 20} ${y1}`, { w: 3 });
        // the shutter: a clipped panel of horizontal boards that grows downwards
        const id = 'ptk' + (++PTID), cp = el(defs, 'clipPath', { id }), cr = el(cp, 'rect', { x: x0, y: y0, width: 240, height: 0 });
        const sg = el(g, 'g', { 'clip-path': `url(#${id})` });
        P0(sg, `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`, C.paperLight, 1);
        let boards = ''; for (let y = y0 + 22; y < y1; y += 22) boards += `M${x0} ${y}L${x1} ${y}`;
        L0(sg, boards, C.inkSoft, 1.6, 0.8);
        const edge = L0(g, '', C.ink, 3, 0);
        shops.push({ i, cx, x0, x1, y0, y1, light, gd, cr, edge });
      }
      // empty mode: one hanging lamp in the middle arch
      const lampG = BTL.glow(svg, defs, 960, GR - 300, 360, C.gold, 0, g);
      const chain = L0(g, `M960 ${GR - 540}L960 ${GR - 430}`, C.inkSoft, 2, 0);
      const lamp = P0(g, `M940 ${GR - 430}L980 ${GR - 430}L972 ${GR - 392}C966 ${GR - 380} 954 ${GR - 380} 948 ${GR - 392}Z`, C.gold, 0);
      const r = rng(1730), dust = [];
      for (let i = 0; i < 14; i++) dust.push({ e: el(g, 'circle', { r: 1.6 + r() * 1.8, fill: C.ink, 'fill-opacity': 0 }), x: 860 + r() * 200, y: GR - 380 + r() * 300, ph: r() });
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.4));
          const hit = mode === 'empty' ? -10 : cue(cues, 'hit', dur * 0.35);
          for (const s of shops) {
            const at = hit + [2, 0, 4, 1, 3][s.i] * 0.45, p = mode === 'empty' ? 1 : BTL.ease(lt, at, 1.3), h = (s.y1 - s.y0) * p;
            s.cr.setAttribute('height', f1(h));
            s.edge.setAttribute('d', `M${s.x0} ${f1(s.y0 + h)}L${s.x1} ${f1(s.y0 + h)}`);
            s.edge.setAttribute('stroke-opacity', p > 0.02 && p < 0.999 ? 0.9 : (p >= 0.999 ? 0.5 : 0));
            const on = BTL.ease(lt, 0.3, 1) * (1 - p);
            s.light.setAttribute('fill-opacity', (0.32 * on * (1 + 0.04 * Math.sin(lt * 1.6 + s.i))).toFixed(3));
            fade(s.gd, 0.25 + 0.75 * on);
          }
          if (mode === 'empty') {
            const a = BTL.ease(lt, 0.4, 1.6);
            lampG.set(0.26 * a * (1 + 0.06 * Math.sin(lt * 1.3))); lamp.setAttribute('fill-opacity', (0.85 * a).toFixed(3));
            chain.setAttribute('stroke-opacity', (0.8 * a).toFixed(3));
            for (const d of dust) {
              const ph = (d.ph + lt * 0.035) % 1;
              d.e.setAttribute('cx', f1(d.x + 16 * Math.sin(lt * 0.3 + d.ph * 6))); d.e.setAttribute('cy', f1(d.y - ph * 120));
              d.e.setAttribute('fill-opacity', (0.4 * Math.sin(ph * Math.PI) * a).toFixed(3));
            }
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_kapi
  SH.bt_pt_kapi = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'few', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 800, cx = 960;
      const dawn = BTL.glow(svg, defs, cx, GR - 80, 1000, C.stain, 0.14, g);
      // side walls of the courtyard, the dome behind the portal
      P0(g, `M120 ${GR}L120 ${GR - 260}L1800 ${GR - 260}L1800 ${GR}Z`, C.paperDark, 1);
      L0(g, `M120 ${GR}L120 ${GR - 260}L1800 ${GR - 260}L1800 ${GR}`, C.inkSoft, 2, 0.4);
      let arc = ''; for (let x = 180; x < 1780; x += 120) if (x < 640 || x > 1280) arc += `M${x} ${GR - 40}L${x} ${GR - 170}C${x} ${GR - 220} ${x + 80} ${GR - 220} ${x + 80} ${GR - 170}L${x + 80} ${GR - 40}`;
      L0(g, arc, C.inkSoft, 1.6, 0.35);
      P0(g, `M600 ${GR - 600}C600 ${GR - 790} 1320 ${GR - 790} 1320 ${GR - 600}Z`, C.paperDark, 1);
      L0(g, `M600 ${GR - 600}C600 ${GR - 790} 1320 ${GR - 790} 1320 ${GR - 600}`, C.inkSoft, 2, 0.4);
      floor(g, GR, 0.8);
      const D = BTL.drawing(g);
      const frame = `M${cx - 260} ${GR}L${cx - 260} ${GR - 620}L${cx + 260} ${GR - 620}L${cx + 260} ${GR}Z`;
      const niche = `M${cx - 180} ${GR}L${cx - 180} ${GR - 380}C${cx - 180} ${GR - 480} ${cx - 70} ${GR - 540} ${cx} ${GR - 570}C${cx + 70} ${GR - 540} ${cx + 180} ${GR - 480} ${cx + 180} ${GR - 380}L${cx + 180} ${GR}`;
      const door = `M${cx - 80} ${GR}L${cx - 80} ${GR - 220}C${cx - 80} ${GR - 280} ${cx + 80} ${GR - 280} ${cx + 80} ${GR - 220}L${cx + 80} ${GR}Z`;
      D.f(frame, C.paperLight, 1); D.f(niche + 'Z', C.paper, 1); D.f(door, C.paperDark, 1);
      D.s(frame, { w: 4 }); D.s(niche, { w: 3.5 }); D.s(door, { w: 3 });
      let tiers = '';
      for (let row = 0; row < 4; row++) {
        const y = GR - 400 + row * 34, half = 150 - row * 6, n = 6 - (row % 2);
        for (let j = 0; j < n; j++) { const x = cx - half + (j + 0.5) * (2 * half / n); tiers += `M${f1(x - 20)} ${y}C${f1(x - 20)} ${y - 26} ${f1(x + 20)} ${y - 26} ${f1(x + 20)} ${y}`; }
      }
      D.s(tiers, { w: 2, color: C.inkSoft });
      D.s(`M${cx - 236} ${GR - 600}L${cx + 236} ${GR - 600}M${cx - 236} ${GR - 600}L${cx - 236} ${GR}M${cx + 236} ${GR - 600}L${cx + 236} ${GR}`, { w: 2, color: C.inkSoft, alpha: 0.7 });
      // the figures
      const n = P.n || 5, figs = [], r = rng(28);
      const front = [[-330, 50], [-190, 76], [-50, 62], [110, 80], [250, 54], [380, 70]].slice(0, n);
      front.forEach(([dx, dy], i) => figs.push({ e: BTL.person(g, 'stand', cx + dx, GR + dy, 230 + dy * 0.3, { color: C.paperDark, rim: C.inkSoft, face: i % 2 ? -1 : 1 }), at: 0.4 + i * 0.25, more: false }));
      if (mode === 'grow') for (let i = 0; i < 26; i++) {
        const x = 260 + r() * 1400, dy = 30 + r() * 160;
        if (Math.abs(x - cx) < 420 && dy > 60) continue;
        figs.push({ e: BTL.person(g, 'stand', x, GR + dy, 190 + dy * 0.3, { color: C.paperDark, rim: C.inkSoft, face: r() < 0.5 ? -1 : 1 }), at: r() * 2.4, more: true });
      }
      // the banner: a pole held by the figure at front[1], a cloth moving slowly
      const bx = cx + front[0][0] - 30, by = GR + front[0][1] - 120;
      const pole = L0(g, `M${bx} ${by + 60}L${bx} ${by - 400}`, C.ink, 4, 0);
      const cloth = P0(g, '', C.gold, 0), clothL = L0(g, '', C.gold, 2.5, 0);
      if (mode === 'empty') figs.length = 0;
      if (mode === 'empty') { fade(pole, 0); }
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6));
          const hit = cue(cues, 'hit', dur * 0.45);
          dawn.set((0.12 + 0.06 * BTL.ease(lt, 0, dur)) * (mode === 'empty' ? 1.6 : 1));
          for (const f of figs) fade(f.e, f.more ? 0.85 * BTL.ease(lt, hit + f.at, 1.2) : BTL.ease(lt, f.at, 1));
          if (mode !== 'empty') {
            const a = BTL.ease(lt, mode === 'few' ? hit : 0.8, 1.2);
            pole.setAttribute('stroke-opacity', BTL.ease(lt, 0.6, 1).toFixed(3));
            const w = -240, yt = by - 390, s = (k) => 14 * Math.sin(lt * 0.9 + k * 1.6);
            const d = `M${bx} ${yt}C${f1(bx + w * 0.33)} ${f1(yt - 10 + s(0))} ${f1(bx + w * 0.66)} ${f1(yt + 10 + s(1))} ${f1(bx + w)} ${f1(yt + s(2))}L${f1(bx + w + 4)} ${f1(yt + 130 + s(2.6))}C${f1(bx + w * 0.66)} ${f1(yt + 140 + s(1.6))} ${f1(bx + w * 0.33)} ${f1(yt + 120 + s(0.6))} ${bx} ${yt + 130}Z`;
            cloth.setAttribute('d', d); clothL.setAttribute('d', d);
            cloth.setAttribute('fill-opacity', (0.5 * a).toFixed(3)); clothL.setAttribute('stroke-opacity', (0.9 * a).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_lale
  SH.bt_pt_lale = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'one', portrait = H > W, g = el(svg, 'g');
      if (mode === 'garden') {
        const GR = 560, st = BTL.stars(g, 60, 39, [0, 0, 1920, 360]);
        const gl = BTL.glow(svg, defs, 960, 760, 900, C.stain, 0.14, g);
        floor(g, GR, 0.55);
        const rows = [];
        for (let row = 0; row < 5; row++) {
          const y = 600 + row * 72, s = 0.12 + row * 0.05, n = 15 - row * 2, span = 1000 + row * 220;
          for (let j = 0; j < n; j++) {
            const x = 960 - span / 2 + (j + 0.5) * span / n + (row % 2) * 18;
            const k = el(g, 'g', { transform: `translate(${f1(x)} ${f1(y - 330 * s)}) scale(${f1(s)})` }), D = BTL.drawing(k);
            tulip(D);
            rows.push({ D, k, at: 0.2 + (4 - row) * 0.35 + j * 0.04 });
          }
        }
        const num = label(g, '0', 960, 300, 170, { weight: 300, color: C.gold });
        const lab = label(g, P.label || 'çeşit', 960, 370, 56, { italic: true, font: LO });
        return {
          update(lt, dur, cues) {
            st.update(lt); gl.set(0.13 + 0.02 * Math.sin(lt * 0.6));
            for (const r of rows) { r.D.reveal(BTL.ease(lt, r.at, 1.2)); fade(r.k, BTL.ease(lt, r.at, 0.6)); }
            const hit = cue(cues, 'hit', dur * 0.45), p = BTL.ease(lt, hit, 1.8);
            num.textContent = String(Math.round((P.n || 839) * p)); fade(num, BTL.ease(lt, hit, 0.5)); fade(lab, BTL.ease(lt, hit + 0.8, 1));
          },
        };
      }
      const named = mode === 'name';
      const cx = named && !portrait ? 640 : W / 2, cy = portrait ? 760 : 470;
      const gl = BTL.glow(svg, defs, cx, cy - 60, 520, C.stain, 0.28, g);
      el(g, 'path', { d: BTL.E(cx, cy + 340, 300, 40), fill: C.stain, 'fill-opacity': 0.08 });
      const sc = portrait ? 1.25 : 1.0;
      const k = el(g, 'g', { transform: `translate(${cx} ${cy - 40}) scale(${sc})` }), sway = el(k, 'g'), D = BTL.drawing(sway);
      const petals = tulip(D, { gold: P.gold });
      const fallen = [];
      if (mode === 'wilt') petals.filter(p => p.k !== 'back').forEach((p, i) => fallen.push({ g: p.g, i, dir: [-1, 1, 0.3][i] }));
      let txt = null, strike = null;
      if (named) {
        const tx = portrait ? W / 2 : 1240, ty = portrait ? 300 : 500;
        txt = label(g, P.text || 'Lâle Devri', tx, ty, portrait ? 120 : 130, { weight: 300 });
        strike = el(g, 'path', { d: `M${tx - 360} ${ty - 40}L${tx + 360} ${ty - 40}`, stroke: C.gold, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none', pathLength: 1 });
        draw(strike, 0);
      }
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2));
          const hit = cue(cues, 'hit', dur * 0.45);
          const droop = mode === 'wilt' ? BTL.ease(lt, cue(cues, 'hit', dur * 0.45), 4) : 0;
          sway.setAttribute('transform', `rotate(${f1(0.8 * Math.sin(lt * 0.45) * (1 - droop) - 16 * droop)} 0 330)`);
          let dim = 0;
          if (mode === 'wilt') {
            for (const f of fallen) {
              const p = BTL.ease(lt, hit + f.i * 0.9, 3.2);
              f.g.setAttribute('transform', `translate(${f1(f.dir * (150 + 60 * f.i) * p)} ${f1(470 * p)}) rotate(${f1(f.dir * 84 * p)} 0 -150)`);
              fade(f.g, 1 - 0.5 * BTL.ease(lt, hit + f.i * 0.9 + 2.2, 1.6));
            }
            dim = BTL.ease(lt, hit, dur - hit);
          }
          gl.set((0.27 + 0.02 * Math.sin(lt * 0.7)) * (1 - 0.6 * dim));
          if (named) { fade(txt, BTL.ease(lt, 0.8, 1.2) * (1 - 0.5 * BTL.ease(lt, hit + 0.4, 1.2))); draw(strike, BTL.ease(lt, hit, 1.1)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_bulb
  SH.bt_pt_bulb = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const cx = 960, GR = 820;
      const gl = BTL.glow(svg, defs, cx, 500, 640, C.stain, 0.24, g);
      floor(g, GR, 0.7);
      const D = BTL.drawing(g);
      D.f(`M${cx - 120} ${GR}L${cx + 120} ${GR}L${cx + 70} ${GR - 40}L${cx - 70} ${GR - 40}Z`, C.paperLight, 1);
      D.s(`M${cx - 120} ${GR}L${cx + 120} ${GR}L${cx + 70} ${GR - 40}L${cx - 70} ${GR - 40}Z`, { w: 3.5 });
      D.s(`M${cx} ${GR - 40}L${cx} ${GR - 560}`, { w: 5 });
      D.s(BTL.E(cx, GR - 572, 16, 16), { w: 3.5, color: C.gold });
      const beamG = el(g, 'g'), D2 = BTL.drawing(beamG);
      const L = 420, pans = [];
      D2.s(`M${cx - L} ${GR - 540}L${cx + L} ${GR - 540}`, { w: 5 });
      for (const sx of [-1, 1]) {
        const pg = el(g, 'g'), px = cx + sx * L;
        const Dp = BTL.drawing(pg);
        Dp.s(`M${px} ${GR - 540}L${px - 120} ${GR - 300}M${px} ${GR - 540}L${px + 120} ${GR - 300}`, { w: 2, color: C.inkSoft });
        const pan = `M${px - 150} ${GR - 300}C${px - 120} ${GR - 250} ${px + 120} ${GR - 250} ${px + 150} ${GR - 300}Z`;
        Dp.f(pan, C.paperLight, 1); Dp.s(pan, { w: 3.5 });
        pans.push({ pg, Dp, px, sx });
      }
      // the bulb on the left pan
      const bx = pans[0].px, byy = GR - 296;
      const bulb = `M${bx} ${byy - 150}C${bx - 10} ${byy - 120} ${bx - 90} ${byy - 90} ${bx - 90} ${byy - 40}C${bx - 90} ${byy - 6} ${bx - 50} ${byy + 2} ${bx} ${byy + 2}C${bx + 50} ${byy + 2} ${bx + 90} ${byy - 6} ${bx + 90} ${byy - 40}C${bx + 90} ${byy - 90} ${bx + 10} ${byy - 120} ${bx} ${byy - 150}Z`;
      pans[0].Dp.f(bulb, C.paperLight, 1); pans[0].Dp.s(bulb, { w: 3.5 });
      pans[0].Dp.s(`M${bx} ${byy - 150}C${bx - 30} ${byy - 100} ${bx - 40} ${byy - 40} ${bx - 26} ${byy}M${bx} ${byy - 150}C${bx + 26} ${byy - 100} ${bx + 34} ${byy - 40} ${bx + 22} ${byy}`, { w: 2, color: C.inkSoft });
      pans[0].Dp.s(`M${bx - 40} ${byy + 2}l-8 16M${bx} ${byy + 2}l0 18M${bx + 40} ${byy + 2}l8 16`, { w: 2, color: C.inkSoft });
      // coins on the right pan
      const coins = [], cxr = pans[1].px;
      for (let i = 0; i < 12; i++) {
        const y = GR - 300 - 6 - i * 22;
        const c = el(pans[1].pg, 'g', { opacity: 0 });
        el(c, 'path', { d: BTL.E(cxr + ((i * 37) % 9) - 4, y, 70, 14), fill: C.paperLight, stroke: C.gold, 'stroke-width': 3 });
        coins.push(c);
      }
      const capY = GR - 300 - 6 - 7.5 * 22;
      const cap = el(pans[1].pg, 'path', { d: `M${cxr - 150} ${capY}L${cxr + 150} ${capY}`, stroke: C.gold, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none', pathLength: 1 });
      draw(cap, 0);
      const lab = P.label ? label(g, P.label, cxr, GR + 90, 60, { italic: true, font: LO, color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.4)); D2.reveal(BTL.ease(lt, 0.2, 1.4));
          for (const p of pans) p.Dp.reveal(BTL.ease(lt, 0.4, 1.6));
          gl.set(0.22 + 0.02 * Math.sin(lt * 0.8));
          const hit = cue(cues, 'hit', dur * 0.6);
          const grow = Math.min(lt - 1.2, hit - 1.2 + 0.0001), nShown = Math.max(0, Math.min(8, grow / Math.max(0.3, (hit - 1.2) / 8)));
          coins.forEach((c, i) => fade(c, i < 8 ? clamp01(nShown - i) : 0));
          const tilt = -6 + 10 * clamp01(nShown / 8);
          beamG.setAttribute('transform', `rotate(${f1(tilt)} ${cx} ${GR - 540})`);
          for (const p of pans) {
            const a = tilt * Math.PI / 180, ex = cx + p.sx * L * Math.cos(a), ey = GR - 540 + p.sx * L * Math.sin(a);
            p.pg.setAttribute('transform', `translate(${f1(ex - p.px)} ${f1(ey - (GR - 540))})`);
          }
          draw(cap, BTL.ease(lt, hit, 0.9)); if (lab) fade(lab, BTL.ease(lt, hit + 0.5, 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_sadabad
  SH.bt_pt_sadabad = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'build', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const BANK = 560, WL = 700, cx = 960, night = mode !== 'build';
      const st = BTL.stars(g, night ? 110 : 40, 1722, [0, 0, 1920, 360]);
      const sky = BTL.glow(svg, defs, cx, BANK, 900, night ? C.stain : C.gold, night ? 0.1 : 0.14, g);
      // far bank and water
      P0(g, `M-200 ${BANK}L2120 ${BANK}L2120 ${WL - 100}L-200 ${WL - 100}Z`, C.paperDark, 0.9);
      P0(g, `M-200 ${WL - 100}L2120 ${WL - 100}L2120 ${WL + 120}L-200 ${WL + 120}Z`, C.paper, 1);
      L0(g, `M0 ${WL - 100}L1920 ${WL - 100}`, C.inkSoft, 2, 0.4);
      P0(g, `M-200 ${WL + 120}L2120 ${WL + 120}L2120 1800L-200 1800Z`, C.paperDark, 0.9);
      L0(g, `M0 ${WL + 120}L1920 ${WL + 120}`, C.inkSoft, 2, 0.4);
      // the palace: stone base on the water, two storeys of windows, a wide flat hipped roof with deep eaves
      const D = BTL.drawing(g), y0 = WL - 100;
      const base = `M${cx - 420} ${y0}L${cx - 420} ${y0 - 60}L${cx + 420} ${y0 - 60}L${cx + 420} ${y0}Z`;
      const body = `M${cx - 380} ${y0 - 60}L${cx - 380} ${y0 - 300}L${cx + 380} ${y0 - 300}L${cx + 380} ${y0 - 60}Z`;
      const roof = `M${cx - 470} ${y0 - 296}L${cx + 470} ${y0 - 296}L${cx + 300} ${y0 - 380}L${cx - 300} ${y0 - 380}Z`;
      const roof2 = `M${cx - 430} ${y0 - 176}L${cx + 430} ${y0 - 176}L${cx + 380} ${y0 - 196}L${cx - 380} ${y0 - 196}Z`;
      D.f(base, C.paperLight, 0.8); D.f(body, C.paperLight, 1); D.f(roof + roof2, C.paperDark, 1);
      D.s(base, { w: 3, color: C.inkSoft }); D.s(body, { w: 3.5 }); D.s(roof, { w: 3.5 }); D.s(roof2, { w: 2.5 });
      let arches = ''; for (let i = 0; i < 9; i++) { const x = cx - 340 + i * 85; arches += `M${x} ${y0 - 60}L${x} ${y0 - 120}C${x} ${y0 - 150} ${x + 60} ${y0 - 150} ${x + 60} ${y0 - 120}L${x + 60} ${y0 - 60}`; }
      D.s(arches, { w: 2, color: C.inkSoft });
      const wins = [];
      for (let i = 0; i < 12; i++) { const x = cx - 350 + i * 61; wins.push(P0(g, `M${x} ${y0 - 280}L${x + 32} ${y0 - 280}L${x + 32} ${y0 - 216}L${x} ${y0 - 216}Z`, C.gold, 0)); }
      let wl = ''; for (let i = 0; i < 12; i++) { const x = cx - 350 + i * 61; wl += `M${x} ${y0 - 280}L${x + 32} ${y0 - 280}L${x + 32} ${y0 - 216}L${x} ${y0 - 216}Z`; }
      D.s(wl, { w: 1.6, color: C.inkSoft });
      // small pavilions and cypresses along the far bank
      const smalls = [], r = rng(1730);
      const spots = [140, 300, 420, 1500, 1640, 1790];
      spots.forEach((x, i) => {
        const sg = el(g, 'g'), Ds = BTL.drawing(sg), w = 46 + r() * 16, h = 70 + r() * 20, yy = BANK + 40 + (i % 2) * 18;
        const b = `M${x - w} ${yy}L${x - w} ${yy - h}L${x + w} ${yy - h}L${x + w} ${yy}Z`, rf = `M${x - w - 26} ${yy - h}L${x + w + 26} ${yy - h}L${x} ${yy - h - 50}Z`;
        Ds.f(b, C.paperLight, 0.9); Ds.f(rf, C.paperDark, 1); Ds.s(b, { w: 2.5 }); Ds.s(rf, { w: 2.5 });
        const lit = P0(sg, `M${x - 12} ${yy - h + 18}L${x + 12} ${yy - h + 18}L${x + 12} ${yy - 20}L${x - 12} ${yy - 20}Z`, C.gold, 0);
        smalls.push({ sg, Ds, lit, i, kind: 'k' });
      });
      for (const x of [230, 520, 610, 1370, 1440, 1720]) {
        const sg = el(g, 'g'), Ds = BTL.drawing(sg), h = 220 + ((x * 7) % 60), yy = BANK + 30;
        const cy = `M${x} ${yy}L${x - 6} ${yy - 30}C${x - 42} ${yy - 80} ${x - 30} ${yy - h * 0.7} ${x} ${yy - h}C${x + 30} ${yy - h * 0.7} ${x + 42} ${yy - 80} ${x + 6} ${yy - 30}Z`;
        Ds.f(cy, C.paperDark, 1); Ds.s(cy, { w: 2.5, color: C.inkSoft });
        smalls.push({ sg, Ds, i: (x * 13) % 7, kind: 'c' });
      }
      // water: slow ripples + reflections
      const rip = [];
      for (let i = 0; i < 9; i++) rip.push({ e: L0(g, '', night ? C.gold : C.ink, 2, 0.22 - i * 0.015), y: WL - 80 + i * 22, len: 160 + i * 40, ph: i * 1.9, x: 520 + ((i * 397) % 900) });
      // candles along the near bank (lamps)
      const candles = [];
      if (mode === 'lamps') for (let i = 0; i < 11; i++) {
        const x = 200 + i * 152, y = WL + 170 + (i % 2) * 8;
        L0(g, `M${x} ${y}L${x} ${y - 30}`, C.paperLight, 8, 0.9);
        const fl = flame(g, x, y - 30, 0.18, i * 1.3), gl = BTL.glow(svg, defs, x, y - 40, 70, C.gold, 0, g);
        const refl = L0(g, '', C.gold, 3, 0);
        candles.push({ fl, gl, refl, x, i });
      }
      return {
        update(lt, dur, cues) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 2));
          const hit = cue(cues, 'hit', dur * 0.4);
          for (const s of smalls) {
            if (mode === 'build') { const at = hit + s.i * 0.18; s.Ds.reveal(BTL.ease(lt, at, 0.9)); fade(s.sg, BTL.ease(lt, at, 0.4)); }
            else if (mode === 'ruin') { s.Ds.reveal(1); fade(s.sg, 1 - BTL.ease(lt, hit + s.i * 0.35, 1.4)); }
            else s.Ds.reveal(BTL.ease(lt, 0.2, 1.6));
            if (s.lit) s.lit.setAttribute('fill-opacity', (night ? 0.55 * (mode === 'ruin' ? 1 - BTL.ease(lt, hit + s.i * 0.35 - 0.3, 0.8) : BTL.ease(lt, 0.8, 1)) : 0).toFixed(3));
          }
          const wa = mode === 'ruin' ? 1 - BTL.ease(lt, hit + 1.2, 2) : (night ? BTL.ease(lt, 0.6, 1.4) : 0.35 * BTL.ease(lt, 1.4, 1.4));
          wins.forEach((w, i) => w.setAttribute('fill-opacity', (0.5 * wa * (0.85 + 0.15 * Math.sin(lt * 0.6 + i))).toFixed(3)));
          for (const p of rip) { const dx = 18 * Math.sin(lt * 0.45 + p.ph); p.e.setAttribute('d', `M${f1(p.x + dx)} ${f1(p.y)}L${f1(p.x + p.len + dx)} ${f1(p.y)}`); }
          sky.set((night ? 0.1 : 0.13) + 0.02 * Math.sin(lt * 0.5));
          for (const c of candles) {
            const a = BTL.ease(lt, 0.4 + c.i * 0.28, 0.8);
            c.fl.update(lt, a); c.gl.set(0.4 * a);
            const wob = 6 * Math.sin(lt * 0.8 + c.i);
            c.refl.setAttribute('d', `M${f1(c.x - 10 + wob)} ${WL + 30}L${f1(c.x + 10 + wob)} ${WL + 30}M${f1(c.x - 6 - wob)} ${WL + 52}L${f1(c.x + 6 - wob)} ${WL + 52}`);
            c.refl.setAttribute('stroke-opacity', (0.5 * a).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_tortoise
  SH.bt_pt_tortoise = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 600 });
      const GR = 800;
      const st = BTL.stars(g, 90, 4, [0, 0, 1920, 420]);
      // tulip bed silhouettes behind
      const bed = el(g, 'g');
      for (let i = 0; i < 16; i++) {
        const x = 120 + i * 112 + ((i * 53) % 30), s = 0.16 + ((i * 7) % 5) * 0.012;
        const k = el(bed, 'g', { transform: `translate(${x} ${GR - 330 * s - 10}) scale(${s})` }), Dk = BTL.drawing(k); tulip(Dk); Dk.reveal(1);
      }
      fade(bed, 0.35);
      floor(g, GR, 0.9);
      let grass = ''; for (let x = 20; x < 1920; x += 38) grass += `M${x} ${GR + 4}l-6 -18M${x + 6} ${GR + 4}l4 -22M${x + 12} ${GR + 4}l10 -14`;
      L0(g, grass, C.inkSoft, 1.6, 0.45);
      const far = flame(g, 1500, GR - 190, 0.08, 2), farG = BTL.glow(svg, defs, 1500, GR - 200, 50, C.gold, 0, g);
      const tg = el(g, 'g'), D = BTL.drawing(tg);
      // the tortoise, side view facing right, origin = ground under its middle, ~360 long
      const shell = 'M-170 -30C-160-150-60-190 20-180C110-170 170-110 176-30Z';
      D.f(shell, C.paperLight, 1);
      D.s(shell, { w: 4 });
      D.s('M-120-60C-90-120-40-150 10-150M-60-40L-40-130M30-34L40-150M110-40L100-120M-150-60L170-60', { w: 2, color: C.inkSoft });
      const head = 'M170-46C200-70 250-74 270-50C280-36 262-22 240-24C214-26 196-30 176-26Z';
      D.f(head, C.paperLight, 1); D.s(head, { w: 3.5 });
      el(tg, 'circle', { cx: 252, cy: -50, r: 4, fill: C.ink });
      D.s('M-176-30C-196-30-206-22-214-14', { w: 3 });
      const legs = [];
      for (const [x, ph] of [[-110, 0], [-60, Math.PI], [80, Math.PI], [130, 0]]) legs.push({ e: L0(tg, '', C.inkSoft, 13, 1), x, ph });
      // candle on the shell
      L0(tg, 'M20-176L20-236', C.paperLight, 22, 1);
      L0(tg, 'M9-236L31-236', C.ink, 2.5, 0.8);
      const fl = flame(tg, 20, -240, 0.36, 0);
      const cg = BTL.glow(svg, defs, 0, 0, 260, C.gold, 0, g);
      return {
        update(lt, dur, cues) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 1.4));
          const x = 620 + lt * 26, y = GR;
          tg.setAttribute('transform', `translate(${f1(x)} ${y})`);
          for (const l of legs) { const s = Math.sin(lt * 1.7 + l.ph) * 10; l.e.setAttribute('d', `M${l.x} -36L${f1(l.x + s)} -2`); }
          const a = BTL.ease(lt, 0.6, 1.2);
          fl.update(lt, a); cg.e.setAttribute('cx', f1(x + 20)); cg.e.setAttribute('cy', f1(y - 250)); cg.set(0.32 * a * (1 + 0.05 * Math.sin(lt * 2)));
          const hit = cue(cues, 'hit', dur * 0.55), b = BTL.ease(lt, hit, 1.4);
          far.update(lt, b); farG.set(0.3 * b);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pt_press
  SH.bt_pt_press = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const GR = 820, cx = 700;
      const gl = BTL.glow(svg, defs, 960, 480, 760, C.stain, 0.22, g);
      floor(g, GR, 0.8);
      const D = BTL.drawing(g);
      const posts = `M${cx - 230} ${GR}L${cx - 230} ${GR - 640}L${cx - 180} ${GR - 640}L${cx - 180} ${GR}ZM${cx + 180} ${GR}L${cx + 180} ${GR - 640}L${cx + 230} ${GR - 640}L${cx + 230} ${GR}Z`;
      const head = `M${cx - 260} ${GR - 640}L${cx + 260} ${GR - 640}L${cx + 260} ${GR - 560}L${cx - 260} ${GR - 560}Z`;
      const bed = `M${cx - 300} ${GR - 260}L${cx + 300} ${GR - 260}L${cx + 300} ${GR - 220}L${cx - 300} ${GR - 220}Z`;
      const legs = `M${cx - 280} ${GR - 220}L${cx - 280} ${GR}M${cx + 280} ${GR - 220}L${cx + 280} ${GR}`;
      D.f(posts + head + bed, C.paperLight, 1);
      D.s(posts, { w: 3.5 }); D.s(head, { w: 3.5 }); D.s(bed, { w: 3.5 }); D.s(legs, { w: 6 });
      D.s(`M${cx - 205} ${GR - 600}L${cx - 205} ${GR - 280}M${cx + 205} ${GR - 600}L${cx + 205} ${GR - 280}`, { w: 1.6, color: C.inkSoft });
      // the sheet on the bed
      D.f(`M${cx - 150} ${GR - 262}L${cx + 150} ${GR - 262}L${cx + 150} ${GR - 270}L${cx - 150} ${GR - 270}Z`, C.ink, 0.8);
      // screw + platen move together
      const mv = el(g, 'g'), Dm = BTL.drawing(mv);
      let thread = ''; for (let y = GR - 560; y < GR - 420; y += 16) thread += `M${cx - 22} ${y}L${cx + 22} ${y + 10}`;
      Dm.f(`M${cx - 22} ${GR - 600}L${cx + 22} ${GR - 600}L${cx + 22} ${GR - 400}L${cx - 22} ${GR - 400}Z`, C.paperLight, 1);
      Dm.s(`M${cx - 22} ${GR - 600}L${cx + 22} ${GR - 600}L${cx + 22} ${GR - 400}L${cx - 22} ${GR - 400}Z`, { w: 3 });
      Dm.s(thread, { w: 2, color: C.inkSoft });
      Dm.s(`M${cx - 200} ${GR - 470}L${cx + 200} ${GR - 470}`, { w: 7, color: C.gold });
      const platen = `M${cx - 170} ${GR - 400}L${cx + 170} ${GR - 400}L${cx + 170} ${GR - 360}L${cx - 170} ${GR - 360}Z`;
      Dm.f(platen, C.paperLight, 1); Dm.s(platen, { w: 3.5 });
      // the printed sheet on the right
      const sx = 1360, sy = 470, sg = el(g, 'g', { opacity: 0 }), Ds = BTL.drawing(sg);
      const sheet = `M${sx - 190} ${sy - 250}L${sx + 190} ${sy - 250}L${sx + 190} ${sy + 250}L${sx - 190} ${sy + 250}Z`;
      Ds.f(sheet, C.paperLight, 1); Ds.s(sheet, { w: 3 });
      Ds.s(`M${sx - 150} ${sy - 210}L${sx + 150} ${sy - 210}L${sx + 150} ${sy + 210}L${sx - 150} ${sy + 210}Z`, { w: 1.5, color: C.gold });
      for (let i = 0; i < 12; i++) {
        const y = sy - 170 + i * 32; let d = `M${sx + 130} ${y}`;
        for (let x = sx + 130; x > sx - 130; x -= 26) d += `C${x - 6} ${y - 10} ${x - 14} ${y + 8} ${x - 26} ${y + ((x / 26) % 2 ? -3 : 3)}`;
        Ds.s(d, { w: 2, color: C.ink, alpha: 0.85 });
      }
      const lab = P.label ? label(g, P.label, sx, sy + 330, 64, { italic: true, font: LO, color: C.gold }) : null;
      // two volumes
      const bg = el(g, 'g', { opacity: 0 }), Db = BTL.drawing(bg);
      for (const [dx, h] of [[-90, 400], [90, 400]]) {
        const b = `M${sx + dx - 80} ${sy + 200}L${sx + dx - 80} ${sy + 200 - h}L${sx + dx + 80} ${sy + 200 - h}L${sx + dx + 80} ${sy + 200}Z`;
        Db.f(b, C.paperLight, 1); Db.s(b, { w: 3.5 });
        Db.s(`M${sx + dx - 80} ${sy + 200 - h + 50}L${sx + dx + 80} ${sy + 200 - h + 50}M${sx + dx - 80} ${sy + 150}L${sx + dx + 80} ${sy + 150}`, { w: 2, color: C.gold });
        Db.s(BTL.E(sx + dx, sy + 200 - h / 2, 40, 56), { w: 2, color: C.gold });
      }
      const blab = P.book ? label(g, P.book, sx, sy + 330, 64, { italic: true, font: LO, color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6)); Dm.reveal(BTL.ease(lt, 0.3, 1.6));
          gl.set(0.2 + 0.02 * Math.sin(lt * 0.8));
          const hit = cue(cues, 'hit', dur * 0.3), down = BTL.ease(lt, hit, 0.9) - BTL.ease(lt, hit + 1.2, 1.1);
          mv.setAttribute('transform', `translate(0 ${f1(90 * down)})`);
          const bk = P.book ? cue(cues, 'book', dur * 0.65) : 1e9;
          const sa = BTL.ease(lt, hit + 1.4, 1) * (1 - BTL.ease(lt, bk - 0.2, 0.8));
          fade(sg, sa); Ds.reveal(BTL.ease(lt, hit + 1.4, 2.2)); if (lab) fade(lab, sa * BTL.ease(lt, hit + 2, 1));
          fade(bg, BTL.ease(lt, bk, 0.8)); Db.reveal(BTL.ease(lt, bk, 1.6)); if (blab) fade(blab, BTL.ease(lt, bk + 0.6, 1));
        },
      };
    },
  };
})();
