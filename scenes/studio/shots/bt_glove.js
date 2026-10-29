// bt_glove: the first surgical rubber gloves (Johns Hopkins, 1889-1890), belgesel style (docs/BELGESEL.md).
// Clean still line art, slow natural motion only. Laid out for a vertical Short first (subject y ~250-1100).
//   bt_glove   P: {mode: "hero"|"many", scale, label, sub, cols, rows}  cues: hit (many: the one glove lights up)
//              hero: one thin rubber glove with a long gauntlet cuff, upright in a light pool
//              many: rows of identical gloves; on "hit" one turns gold and the rest dim (+ label)
//   bt_hands   P: {mode: "sore"|"healed", label}  cues: sore    two raised hands; red irritation patches spread
//              ("sore") or fade away ("healed")
//   bt_basin   P: {label: ["Cıva", "klorür"]}  cues: label     apothecary bottle + enamel basin, slow ripple rings
//   bt_don     P: {label}  cues: in                            a hand slides up into an empty, limp glove; the
//              glove fills, the redness on the forearm fades
//   bt_couple  P: {}                                           two silhouettes, hands joined, in a tall window's light
//   bt_theatre P: {}  cues: bare                               an 1890s operating theatre: skylight, gas lamp, table,
//              a surgeon bent over it; on "bare" his bare hands light up
//   bt_rate    P: {a: {label, value, text}, b: {label, value, text}, note}  cues: b    two bars: before / after
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const RUBBER = () => mix(C.paperLight, C.stain, 0.42);
  const fade = (e, a) => e.setAttribute('opacity', clamp01(a).toFixed(3));
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const place = (parent, x, y, s, extra = '') => el(parent, 'g', { transform: `translate(${x} ${y}) scale(${s})${extra}` });
  const P0 = (parent, d, fill, a = 1) => el(parent, 'path', { d, fill, 'fill-opacity': a, stroke: 'none' });
  const L0 = (parent, d, stroke, w = 3, a = 1) => el(parent, 'path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const f1 = v => v.toFixed(1);

  // ------------------------------------------------------------------ the hand / glove outline
  // A raised right hand, palm to the viewer, thumb on the left; origin = palm centre, fingertips at y ~ -375.
  // o.k: 1 = fingers upright (a hand, a worn glove), 0 = limp (an empty glove); o.bottom: "cuff" (gauntlet down to
  // y 466) or "arm" (forearm down to o.arm).
  const FING = [
    { bl: [-127, -150], br: [-69, -152], ang: -6, len: 150, limp: -30 },
    { bl: [-63, -155], br: [-3, -155], ang: -1.5, len: 188, limp: -12 },
    { bl: [3, -152], br: [61, -150], ang: 3, len: 168, limp: 14 },
    { bl: [67, -138], br: [118, -128], ang: 9, len: 122, limp: 32 },
  ];
  const THUMB = { bl: [-130, 70], br: [-128, -60], ang: -50, len: 150, w: 64, limp: -34 };
  function digit(f, k) {   // tapered capsule from base points bl -> tip -> br (clockwise), returns path tail + geometry
    const a = (f.ang + (1 - k) * f.limp) * Math.PI / 180, len = f.len * (0.74 + 0.26 * k);
    const dx = Math.sin(a), dy = -Math.cos(a), px = dy, py = -dx;   // p: the digit's left side
    const mx = (f.bl[0] + f.br[0]) / 2, my = (f.bl[1] + f.br[1]) / 2;
    const r = (f.w || Math.hypot(f.br[0] - f.bl[0], f.br[1] - f.bl[1])) / 2;
    const tx = mx + dx * len, ty = my + dy * len;
    const tl = [tx + px * r, ty + py * r], tr = [tx - px * r, ty - py * r];
    const d = `C${f1(f.bl[0] + dx * len * 0.4)} ${f1(f.bl[1] + dy * len * 0.4)} ${f1(tl[0] - dx * len * 0.3)} ${f1(tl[1] - dy * len * 0.3)} ${f1(tl[0])} ${f1(tl[1])}` +
      `A${f1(r)} ${f1(r)} 0 0 1 ${f1(tr[0])} ${f1(tr[1])}` +
      `C${f1(tr[0] - dx * len * 0.3)} ${f1(tr[1] - dy * len * 0.3)} ${f1(f.br[0] + dx * len * 0.4)} ${f1(f.br[1] + dy * len * 0.4)} ${f1(f.br[0])} ${f1(f.br[1])}`;
    return { d, dx, dy, px, py, len, r, mx, my };
  }
  function handD(o = {}) {
    const k = o.k ?? 1;
    let d = 'M-104 165C-110 125-124 95-130 70';
    d += digit(THUMB, k).d;
    d += 'L-127 -150';
    FING.forEach((f, i) => {
      d += digit(f, k).d;
      const n = FING[i + 1];
      if (n) d += `Q${f1((f.br[0] + n.bl[0]) / 2)} ${f1(Math.max(f.br[1], n.bl[1]) + 12)} ${n.bl[0]} ${n.bl[1]}`;
    });
    d += 'C132 -60 136 40 124 110C118 135 108 150 104 165';
    if (o.bottom === 'arm') { const L = o.arm || 900; d += `C108 300 116 600 120 ${L}L-120 ${L}C-116 600-108 300-104 165Z`; }
    else d += 'C112 230 140 330 152 440Q0 466-152 440C-140 330-112 230-104 165Z';
    return d;
  }
  // creases, cuff rim and sheen of a glove (k = 1 shape)
  function gloveDetail(D, o = {}) {
    let cr = '';
    for (const f of FING) {
      const g = digit(f, 1);
      for (const q of [0.38, 0.68]) {
        const ax = f.bl[0] + g.dx * g.len * q, ay = f.bl[1] + g.dy * g.len * q, bx = f.br[0] + g.dx * g.len * q, by = f.br[1] + g.dy * g.len * q;
        cr += `M${f1(ax + (bx - ax) * 0.25)} ${f1(ay + (by - ay) * 0.25)}Q${f1((ax + bx) / 2)} ${f1((ay + by) / 2 + 6)} ${f1(ax + (bx - ax) * 0.75)} ${f1(ay + (by - ay) * 0.75)}`;
      }
    }
    D.s(cr, { w: 2, color: C.inkSoft, alpha: 0.8 });
    D.s('M-80 205Q-45 196-10 206M24 220Q60 210 92 222M-60 250Q-20 242 10 252', { w: 2, color: C.inkSoft, alpha: 0.7 });
    D.s('M-146 410Q0 436 146 410', { w: 2.5, color: C.inkSoft });
    if (o.sheen !== false) D.s('M-36-310L-36-190M-14-70C-4 10-4 80-24 140M40 260C50 320 60 370 66 420', { w: 7, color: C.paperLight, alpha: 0.9 });
  }
  function drawGlove(D, o = {}) {
    const d = handD({ k: 1 });
    D.f(d, C.paperLight, 1);
    D.f(d, o.color || RUBBER(), o.gold ? 0.55 : 1);
    D.s(d, { w: o.w || 4.5, color: o.gold ? C.gold : C.ink });
    if (o.detail !== false) gloveDetail(D, o);
  }
  const PATCHES = [[-50, 20, 70, 48], [50, -50, 52, 40], [-5, 105, 78, 44], [-96, -215, 24, 46], [-33, -250, 24, 50],
    [33, -232, 24, 44], [92, -180, 20, 34], [-195, -45, 34, 24], [70, 60, 40, 56], [10, 250, 70, 40], [-40, 380, 64, 36],
    [50, 470, 54, 34], [-20, 610, 60, 36]];
  const CRACKS = 'M-80 20l18 10M-50 44l14-8M30-46l12 12M-20 96l20 6M10 110l16-6M10 286l18 8M-60 414l16-6M50 556l14 8';

  // a raised hand with forearm; returns {g, patches: [{e}], cracks}
  function skinHand(parent, x, y, s, mirror, o = {}) {   // forearm runs past the frame bottom
    const g = place(parent, x, y, s, mirror ? ' scale(-1 1)' : '');
    const d = handD({ bottom: 'arm', arm: o.arm || 1500 });
    P0(g, d, C.paperLight, 1);
    const patches = PATCHES.map(([px, py, rx, ry]) => ({ e: P0(g, BTL.E(px, py, rx, ry), C.red, 0), px, py, rx, ry }));
    const cracks = L0(g, CRACKS, C.red, 2.5, 0);
    L0(g, d, C.ink, 4);
    L0(g, 'M-110 20C-70 60-30 110-44 150M-104-60C-40-48 40-50 106-74M-60-110C-10-96 50-100 100-112', C.inkSoft, 2.5, 0.8);
    return { g, patches, cracks };
  }
  // an irregular blotch (smooth closed curve through jittered radii), deterministic per patch
  const BLOB = PATCHES.map((_, i) => { const r = rng(97 + i * 13); return Array.from({ length: 9 }, () => 0.7 + 0.45 * r()); });
  function blob(i, x, y, rx, ry) {
    const R = BLOB[i], n = R.length, pts = R.map((k, j) => { const a = j / n * 6.2832; return [x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k]; });
    const mid = j => { const a = pts[j % n], b = pts[(j + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
    let d = `M${f1(mid(0)[0])} ${f1(mid(0)[1])}`;
    for (let j = 1; j <= n; j++) { const c = pts[j % n], m = mid(j); d += `Q${f1(c[0])} ${f1(c[1])} ${f1(m[0])} ${f1(m[1])}`; }
    return d + 'Z';
  }
  const setPatches = (h, a, grow = 1) => {
    h.patches.forEach((p, i) => {
      const q = clamp01(grow * 1.25 - i * 0.03);
      p.e.setAttribute('d', blob(i, p.px, p.py, p.rx * (0.45 + 0.55 * q), p.ry * (0.45 + 0.55 * q)));
      p.e.setAttribute('fill-opacity', (0.3 * a).toFixed(3));
    });
    h.cracks.setAttribute('stroke-opacity', (0.75 * a * clamp01(grow * 1.4 - 0.3)).toFixed(3));
  };

  // ------------------------------------------------------------------ silhouettes (filled, ink coloured on a light theme)
  const POSE = {
    stand: { head: [0, -0.9], sh: [0, -0.77], hip: [0, -0.47], k1: [-0.04, -0.24], f1: [-0.07, 0], k2: [0.05, -0.24], f2: [0.08, 0], e1: [-0.1, -0.6], h1: [-0.12, -0.44], e2: [0.1, -0.6], h2: [0.12, -0.44] },
    reach: { head: [0.01, -0.9], sh: [0, -0.77], hip: [0, -0.47], k1: [-0.03, -0.24], f1: [-0.06, 0], k2: [0.05, -0.24], f2: [0.08, 0], e1: [-0.08, -0.6], h1: [-0.09, -0.44], e2: [0.13, -0.62], h2: [0.25, -0.53] },
    bend: { head: [0.3, -0.66], sh: [0.2, -0.66], hip: [0, -0.47], k1: [0.03, -0.24], f1: [-0.04, 0], k2: [0.09, -0.24], f2: [0.1, 0], e1: [0.27, -0.5], h1: [0.36, -0.38], e2: [0.33, -0.52], h2: [0.44, -0.4] },
  };
  function fig(parent, pose, x, y, h, o = {}) {
    const P = POSE[pose], fc = o.face ?? 1, col = o.color || C.ink;
    const g = el(parent, 'g', { transform: `translate(${x} ${y})` });
    const pt = k => [P[k][0] * h * fc, P[k][1] * h];
    const line = ks => 'M' + ks.map(k => pt(k).map(f1).join(' ')).join('L');
    if (o.skirt) {
      const [hx, hy] = pt('hip');
      P0(g, `M${f1(hx - 0.07 * h)} ${f1(hy - 0.05 * h)}L${f1(hx + 0.07 * h)} ${f1(hy - 0.05 * h)}L${f1(hx + 0.19 * h)} ${f1(-0.01 * h)}Q${f1(hx)} ${f1(0.01 * h)} ${f1(hx - 0.19 * h)} ${f1(-0.01 * h)}Z`, col, 1);
    }
    for (const [ks, w] of [[['hip', 'k1', 'f1'], 0.055], [['hip', 'k2', 'f2'], 0.055], [['sh', 'e1', 'h1'], 0.042], [['sh', 'e2', 'h2'], 0.042], [['sh', 'hip'], 0.12]])
      el(g, 'path', { d: line(ks), fill: 'none', stroke: col, 'stroke-width': w * h, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    const [hx, hy] = pt('head');
    el(g, 'circle', { cx: hx, cy: hy, r: 0.078 * h, fill: col });
    if (o.bun) el(g, 'circle', { cx: hx - 0.06 * h * fc, cy: hy - 0.02 * h, r: 0.04 * h, fill: col });
    return { g, hand: k => { const [a, b] = pt(k); return [x + a, y + b]; } };
  }
  // slow dust in a light beam: drifts up, deterministic
  function motes(parent, n, seed, box) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: el(parent, 'circle', { r: 1.6 + r() * 2.2, fill: C.stain }), x: box[0] + r() * (box[2] - box[0]), y: r(), sp: 0.012 + r() * 0.02, ph: r() * 6.28 });
    return { update(lt) {
      for (const m of list) {
        const q = (m.y + lt * m.sp) % 1, yy = box[3] - q * (box[3] - box[1]);
        m.e.setAttribute('cx', f1(m.x + 10 * Math.sin(lt * 0.3 + m.ph))); m.e.setAttribute('cy', f1(yy));
        m.e.setAttribute('fill-opacity', (0.55 * Math.sin(q * Math.PI)).toFixed(3));
      }
    } };
  }

  // ------------------------------------------------------------------ shots
  SH.bt_glove = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      if (P.mode === 'many') {
        const cols = P.cols || (portrait ? 5 : 9), rows = P.rows || (portrait ? 5 : 3);
        const sx = portrait ? 190 : 190, sy = portrait ? 172 : 230, s = portrait ? 0.165 : 0.2;
        const x0 = W / 2 - (cols - 1) * sx / 2, y0 = (portrait ? 690 : H * 0.47) - (rows - 1) * sy / 2;
        const mid = Math.floor(rows / 2) * cols + Math.floor(cols / 2);
        const gl = BTL.glow(svg, defs, W / 2, y0 + Math.floor(rows / 2) * sy, 300, C.stain, 0, g);
        const items = [];
        const d = handD({ k: 1 });
        for (let i = 0; i < cols * rows; i++) {
          const x = x0 + (i % cols) * sx, y = y0 + Math.floor(i / cols) * sy;
          const gg = place(g, x, y, s);
          P0(gg, d, i === mid ? C.paperLight : RUBBER(), 1);
          const st = el(gg, 'path', { d, fill: 'none', stroke: C.inkSoft, 'stroke-width': 9, 'stroke-linejoin': 'round' });
          items.push({ gg, st, i, x, y });
        }
        const hero = items[mid];
        g.appendChild(hero.gg);
        const HD = BTL.drawing(hero.gg);
        drawGlove(HD, { gold: true, w: 12, detail: false });
        const lab = P.label ? label(g, P.label, W / 2, portrait ? 200 : 110, portrait ? 66 : 56, {}) : null;
        const sub = P.sub ? label(g, P.sub, W / 2, portrait ? 262 : 164, portrait ? 46 : 40, { font: LO, italic: true, color: C.inkSoft }) : null;
        return {
          update(lt, dur, cues) {
            const th = cue(cues, 'hit', dur * 0.5), q = BTL.ease(lt, th - 0.3, 1.6);
            items.forEach((it, j) => { if (j !== mid) fade(it.gg, BTL.ease(lt, j * 0.04, 1) * (1 - 0.75 * q)); });
            fade(hero.gg, BTL.ease(lt, 0, 1));
            hero.st.setAttribute('opacity', (1 - q).toFixed(3));
            HD.reveal(q);
            const k = 1 + 1.1 * BTL.ease(lt, th, Math.max(1.5, dur - th));   // the one glove slowly grows in its light
            hero.gg.setAttribute('transform', `translate(${hero.x} ${hero.y}) scale(${(s * k).toFixed(4)})`);
            gl.set(0.35 * q);
            if (lab) fade(lab, BTL.ease(lt, th + 0.3, 1.2));
            if (sub) fade(sub, BTL.ease(lt, th + 0.8, 1.2));
          },
        };
      }
      // hero: one glove in a light pool
      const s = (P.scale || 1) * (portrait ? 1.05 : 0.8), cx = W / 2, cy = portrait ? 690 : H * 0.47;
      const gl = BTL.glow(svg, defs, cx, cy - 60, 640 * s, C.stain, 0, g);
      const D = BTL.drawing(place(g, cx, cy, s));
      drawGlove(D);
      const lab = P.label ? label(g, P.label, W / 2, portrait ? 210 : 110, portrait ? 62 : 54, {}) : null;
      const sub = P.sub ? label(g, P.sub, W / 2, portrait ? 270 : 162, portrait ? 44 : 40, { font: LO, italic: true, color: C.inkSoft }) : null;
      return {
        update(lt, dur, cues) {
          D.g.parentNode.setAttribute('transform', `translate(${cx} ${cy}) scale(${(s * (1 + 0.012 * lt)).toFixed(4)})`);   // a very slow push
          gl.set(0.16 + 0.1 * BTL.ease(lt, 0.3, 2) + 0.04 * Math.sin(lt * 0.7));
          D.reveal(BTL.ease(lt, cue(cues, 'show', 0), Math.min(3, Math.max(1.8, dur * 0.6))));
          if (lab) fade(lab, BTL.ease(lt, 1, 1.2));
          if (sub) fade(sub, BTL.ease(lt, 1.5, 1.2));
        },
      };
    },
  };

  SH.bt_hands = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const s = portrait ? 0.92 : 0.74, y = portrait ? 700 : H * 0.55, dx = portrait ? 225 : 300;
      BTL.glow(svg, defs, W / 2, y - 100, portrait ? 620 : 700, C.stain, 0.16, g);
      const hands = [skinHand(g, W / 2 - dx, y, s, false), skinHand(g, W / 2 + dx, y + 20, s, true)];
      const lab = P.label ? label(g, P.label, W / 2, portrait ? 170 : 90, portrait ? 58 : 50, { font: LO, italic: true, color: C.inkSoft }) : null;
      const heal = P.mode === 'healed';
      return {
        update(lt, dur, cues) {
          hands.forEach((h, i) => fade(h.g, BTL.ease(lt, i * 0.2, 1)));
          if (heal) {   // the redness slowly goes
            const q = BTL.ease(lt, 0.2, Math.max(1.4, dur * 0.85));
            hands.forEach(h => setPatches(h, 1 - q, 1));
          } else {
            const t0 = cue(cues, 'sore', 0.4), q = BTL.ease(lt, t0 - 0.6, 1.8);
            hands.forEach(h => setPatches(h, BTL.ease(lt, t0, 0.8), q));
          }
          if (lab) fade(lab, BTL.ease(lt, 0.8, 1.2));
        },
      };
    },
  };

  SH.bt_basin = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g', { transform: portrait ? 'translate(540 700) scale(1.15) translate(-540 -700)' : `translate(${(W - 1080) / 2} -300)` });
      const ty = 1010;   // table top
      BTL.glow(svg, defs, portrait ? 540 : W / 2, portrait ? 760 : 460, 600, C.stain, 0.18, g);
      P0(g, `M-600 ${ty}L1680 ${ty}L1680 2400L-600 2400Z`, C.paperDark, 0.75);
      L0(g, `M-600 ${ty}L1680 ${ty}`, C.inkSoft, 3);
      L0(g, `M-600 ${ty + 40}L1680 ${ty + 40}`, C.inkSoft, 1.5, 0.5);
      // apothecary bottle (left), drawn in
      const B = BTL.drawing(el(g, 'g'));
      const bx = 360, bottle = `M${bx - 50} ${ty - 520}L${bx + 50} ${ty - 520}L${bx + 50} ${ty - 450}C${bx + 50} ${ty - 410} ${bx + 125} ${ty - 400} ${bx + 125} ${ty - 340}L${bx + 125} ${ty - 14}Q${bx + 125} ${ty} ${bx + 110} ${ty}L${bx - 110} ${ty}Q${bx - 125} ${ty} ${bx - 125} ${ty - 14}L${bx - 125} ${ty - 340}C${bx - 125} ${ty - 400} ${bx - 50} ${ty - 410} ${bx - 50} ${ty - 450}Z`;
      B.f(bottle, C.paperLight, 1);
      B.f(`M${bx - 118} ${ty - 230}L${bx + 118} ${ty - 230}L${bx + 118} ${ty - 14}Q${bx + 118} ${ty - 6} ${bx + 108} ${ty - 6}L${bx - 108} ${ty - 6}Q${bx - 118} ${ty - 6} ${bx - 118} ${ty - 14}Z`, C.blue, 0.22);
      const stopper = `M${bx - 62} ${ty - 520}L${bx + 62} ${ty - 520}L${bx + 54} ${ty - 586}Q${bx} ${ty - 610} ${bx - 54} ${ty - 586}Z`;
      B.f(stopper, C.paperDark, 1);
      const lab = `M${bx - 100} ${ty - 360}L${bx + 100} ${ty - 360}L${bx + 100} ${ty - 190}L${bx - 100} ${ty - 190}Z`;
      B.f(lab, C.paper, 1);
      B.s(bottle, { w: 4 }); B.s(stopper, { w: 3.5 }); B.s(lab, { w: 2.5, color: C.inkSoft });
      B.s(`M${bx - 98} ${ty - 300}L${bx - 98} ${ty - 60}`, { w: 7, color: C.paperLight, alpha: 0.9 });
      const L = P.label || ['Cıva', 'klorür'];
      const t1 = label(g, L[0], bx, ty - 290, 48, { font: LO, italic: true });
      const t2 = label(g, L[1] || '', bx, ty - 232, 48, { font: LO, italic: true });
      const rule = el(g, 'path', { d: `M${bx - 70} ${ty - 212}L${bx + 70} ${ty - 212}`, stroke: C.gold, 'stroke-width': 3, fill: 'none', pathLength: 1 });
      // enamel basin (right, in front)
      const ux = 700, uy = ty - 120, rx = 250, ry = 56;
      const K = BTL.drawing(el(g, 'g'));
      const body = `M${ux - rx} ${uy}C${ux - rx + 20} ${uy + 90} ${ux - 150} ${ty} ${ux - 110} ${ty}L${ux + 110} ${ty}C${ux + 150} ${ty} ${ux + rx - 20} ${uy + 90} ${ux + rx} ${uy}Z`;
      K.f(body, C.paperLight, 1);
      K.f(BTL.E(ux, uy, rx, ry), C.paperLight, 1);
      K.f(BTL.E(ux, uy + 6, rx - 26, ry - 14), C.blue, 0.28);
      K.s(body, { w: 4 }); K.s(BTL.E(ux, uy, rx, ry), { w: 4 });
      K.s(`M${ux - rx + 30} ${uy + 40}C${ux - 120} ${uy + 70} ${ux + 120} ${uy + 70} ${ux + rx - 30} ${uy + 40}`, { w: 2.5, color: C.blue, alpha: 0.7 });
      const rings = [0, 1, 2].map(() => L0(g, '', C.ink, 2.5, 0));
      return {
        update(lt, dur, cues) {
          B.reveal(BTL.ease(lt, 0, 2.4)); K.reveal(BTL.ease(lt, 0.5, 2.4));
          const tl = cue(cues, 'label', 1.2);
          fade(t1, BTL.ease(lt, tl - 0.3, 1)); fade(t2, BTL.ease(lt, tl - 0.1, 1)); draw(rule, BTL.ease(lt, tl + 0.2, 1));
          rings.forEach((e, i) => {   // slow concentric rings on the liquid
            const T = 3.6, ph = ((lt - 0.8 - i * 1.2) % T + T) % T / T;
            const k = 0.12 + 0.88 * ph;
            e.setAttribute('d', BTL.E(ux, uy + 6, (rx - 40) * k, (ry - 18) * k));
            e.setAttribute('stroke-opacity', lt < 0.8 ? 0 : (0.55 * (1 - ph)).toFixed(3));
          });
        },
      };
    },
  };

  SH.bt_don = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const s = portrait ? 0.98 : 0.74, cx = W / 2, cy = portrait ? 680 : H * 0.45;
      BTL.glow(svg, defs, cx, cy - 60, 640 * s, C.stain, 0.2, g);
      // the hand is only visible below the cuff's mouth: above it, it is inside the glove (no thumb poking out)
      const cid = 'btdon' + Math.round(cx + cy), cp = el(defs, 'clipPath', { id: cid });
      el(cp, 'rect', { x: -W, y: cy + 446 * s, width: 3 * W, height: 3 * H });
      const hand = skinHand(el(g, 'g', { 'clip-path': `url(#${cid})` }), cx, cy, s * 0.96, false, { arm: 1500 });
      const gg = place(g, cx, cy, s);
      const fillA = P0(gg, '', C.paperLight, 1), fillB = P0(gg, '', RUBBER(), 1);
      const line = L0(gg, '', C.ink, 4.5);
      const rim = L0(gg, 'M-146 410Q0 436 146 410', C.inkSoft, 2.5);
      const lab = P.label ? label(g, P.label, W / 2, portrait ? 190 : 90, portrait ? 58 : 50, { font: LO, italic: true, color: C.inkSoft }) : null;
      return {
        update(lt, dur, cues) {
          const t0 = cue(cues, 'in', 0.2), span = Math.max(2, Math.min(3.4, dur - t0 - 0.2));
          const p = BTL.ease(lt, t0, span);                         // 0: hand far below, 1: inside the glove
          const off = (1 - p) * 760;
          hand.g.setAttribute('transform', `translate(${cx} ${f1(cy + off * s)}) scale(${(s * 0.96).toFixed(4)})`);
          const k = clamp01((p - 0.35) / 0.65);                      // fingers fill once the hand is in the cuff
          const d = handD({ k: 0.15 + 0.85 * EASE_IO(k) });
          fillA.setAttribute('d', d); fillB.setAttribute('d', d); line.setAttribute('d', d);
          setPatches(hand, 1 - BTL.ease(lt, t0 + span * 0.6, Math.max(1, dur - t0 - span * 0.6)), 1);
          fade(gg, BTL.ease(lt, 0, 0.8));
          if (lab) fade(lab, BTL.ease(lt, 0.8, 1.2));
        },
      };
    },
  };

  SH.bt_couple = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.5 });
      const fy = 820;
      // a tall arched window, its light on the floor
      const win = 'M790 720L790 330C790 210 1130 210 1130 330L1130 720Z';
      P0(g, win, C.paperLight, 1);
      const gl = BTL.glow(svg, defs, 960, 470, 520, C.stain, 0.25, g);
      L0(g, win, C.inkSoft, 4);
      L0(g, 'M960 236L960 720M790 470L1130 470M790 600L1130 600', C.inkSoft, 3, 0.8);
      L0(g, 'M760 724L1160 724', C.inkSoft, 5);
      P0(g, `M0 ${fy}L1920 ${fy}L1920 1800L0 1800Z`, C.paperDark, 0.7);
      L0(g, `M0 ${fy}L1920 ${fy}`, C.inkSoft, 2.5);
      P0(g, `M800 ${fy}L1120 ${fy}L1300 ${fy + 300}L620 ${fy + 300}Z`, C.paperLight, 0.5);
      const mo = motes(g, 22, 13, [800, 260, 1120, 800]);
      const H0 = 360;
      const man = fig(g, 'reach', 870, fy, H0, { face: 1 });
      const wom = fig(g, 'reach', 1050, fy, H0 * 0.93, { face: -1, skirt: true, bun: true });
      const [hx, hy] = man.hand('h2');
      const hgl = BTL.glow(svg, defs, hx + 5, hy, 70, C.gold, 0, g);
      return {
        update(lt, dur) {
          mo.update(lt);
          gl.set(0.2 + 0.1 * BTL.ease(lt, 0, Math.max(2, dur)));
          hgl.set(0.5 * BTL.ease(lt, 0.6, 1.6));
          fade(man.g, BTL.ease(lt, 0, 1.2)); fade(wom.g, BTL.ease(lt, 0.2, 1.2));
        },
      };
    },
  };

  SH.bt_theatre = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, k: 1.5 });
      const fy = 860;
      // skylight window behind, light falling on the table
      const win = 'M760 160L1160 160L1160 560L760 560Z';
      P0(g, win, C.paperLight, 1);
      L0(g, win, C.inkSoft, 4);
      L0(g, 'M893 160L893 560M1027 160L1027 560M760 293L1160 293M760 427L1160 427', C.inkSoft, 2.5, 0.8);
      const beam = P0(g, 'M760 560L1160 560L1220 760L700 760Z', C.stain, 0);
      P0(g, `M0 ${fy}L1920 ${fy}L1920 1800L0 1800Z`, C.paperDark, 0.7);
      L0(g, `M0 ${fy}L1920 ${fy}`, C.inkSoft, 2.5);
      const mo = motes(g, 18, 29, [760, 560, 1160, 760]);
      // gas lamp hanging on the right, over the surgeon
      const lx = 1250;
      L0(g, `M${lx} 0L${lx} 250`, C.inkSoft, 2.5);
      P0(g, `M${lx - 30} 250L${lx + 30} 250L${lx + 46} 300L${lx - 46} 300Z`, C.paperLight, 1);
      L0(g, `M${lx - 30} 250L${lx + 30} 250L${lx + 46} 300L${lx - 46} 300Z`, C.ink, 3);
      const flame = P0(g, '', C.gold, 0.95);
      const lgl = BTL.glow(svg, defs, lx, 300, 160, C.stain, 0.3, g);
      // the table, a draped patient
      const D = BTL.drawing(el(g, 'g'));
      D.f('M760 740L1110 740L1110 762L760 762Z', C.paperLight, 1);
      D.s('M760 740L1110 740L1110 762L760 762Z', { w: 3.5 });
      D.s('M790 762L790 860M1080 762L1080 860M790 830L1080 830', { w: 3.5 });
      const drape = 'M770 740C780 700 830 686 880 690C930 694 960 676 1000 680C1050 684 1090 700 1100 740Z';
      D.f(drape, C.paperLight, 1); D.s(drape, { w: 3.5 });
      D.s('M800 740C820 760 840 780 834 806M1090 740C1080 770 1072 790 1080 810', { w: 2.5, color: C.inkSoft });
      // basin on a stand, left
      D.s('M610 860L630 700M690 860L670 700M600 700L700 700', { w: 3 });
      D.f(BTL.E(650, 696, 56, 14), C.paperLight, 1); D.s(BTL.E(650, 696, 56, 14), { w: 3 });
      // the surgeon, bent over the patient from the right
      const sg = fig(g, 'bend', 1190, fy, 370, { face: -1 });
      const hands = ['h1', 'h2'].map(k => sg.hand(k));
      const hgl = BTL.glow(svg, defs, (hands[0][0] + hands[1][0]) / 2, (hands[0][1] + hands[1][1]) / 2, 110, C.gold, 0, g);
      const hc = hands.map(([x, y]) => el(g, 'circle', { cx: x, cy: y, r: 13, fill: C.paperLight, stroke: C.gold, 'stroke-width': 3, opacity: 0 }));
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2));
          beam.setAttribute('fill-opacity', (0.12 + 0.03 * Math.sin(lt * 0.5)).toFixed(3));
          mo.update(lt);
          const h = 34 + 4 * Math.sin(lt * 2.1) + 2 * Math.sin(lt * 3.3), w = 9;
          flame.setAttribute('d', `M${lx - w} 298C${lx - w} ${298 - h * 0.5} ${lx - 2} ${298 - h * 0.8} ${lx} ${298 - h}C${lx + 2} ${298 - h * 0.8} ${lx + w} ${298 - h * 0.5} ${lx + w} 298Z`);
          lgl.set(0.28 + 0.03 * Math.sin(lt * 1.7));
          fade(sg.g, BTL.ease(lt, 0.2, 1.2));
          const tb = cue(cues, 'bare', dur * 0.5), q = BTL.ease(lt, tb - 0.2, 1.2);
          hgl.set(0.6 * q); hc.forEach(c => fade(c, q));
        },
      };
    },
  };

  SH.bt_rate = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const A = P.a || { label: 'eldivensiz', value: 17.3, text: '%17' }, B = P.b || { label: 'eldivenli', value: 1.8, text: '%1,8' };
      const base = portrait ? 1000 : H * 0.74, hmax = portrait ? 560 : 520, bw = portrait ? 200 : 180;
      const xa = portrait ? W / 2 - 200 : W / 2 - 260, xb = portrait ? W / 2 + 200 : W / 2 + 260;
      const vmax = Math.max(A.value, B.value);
      BTL.glow(svg, defs, W / 2, base - 260, 640, C.stain, 0.12, g);
      L0(g, `M${xa - 200} ${base}L${xb + 200} ${base}`, C.inkSoft, 3);
      const mk = (x, v, col, a) => {
        const r = el(g, 'path', { fill: col, 'fill-opacity': a, stroke: C.ink, 'stroke-width': 3.5, 'stroke-linejoin': 'round' });
        return { r, x, h: v / vmax * hmax };
      };
      const ba = mk(xa, A.value, C.inkSoft, 0.35), bb = mk(xb, B.value, C.gold, 0.9);
      const na = label(g, A.text, xa, 0, portrait ? 120 : 100, { weight: 300 }), nb = label(g, B.text, xb, 0, portrait ? 120 : 100, { weight: 400, color: C.gold });
      const la = label(g, A.label, xa, base + 70, portrait ? 52 : 46, { font: LO, italic: true, color: C.inkSoft });
      const lb = label(g, B.label, xb, base + 70, portrait ? 52 : 46, { font: LO, italic: true, color: C.inkSoft });
      const note = P.note ? label(g, P.note, W / 2, portrait ? 200 : 100, portrait ? 50 : 44, { font: LO, italic: true, color: C.inkSoft }) : null;
      const setBar = (b, n, q) => {
        const h = Math.max(2, b.h * q);
        b.r.setAttribute('d', `M${b.x - bw / 2} ${base}L${b.x - bw / 2} ${f1(base - h)}L${b.x + bw / 2} ${f1(base - h)}L${b.x + bw / 2} ${base}Z`);
        n.setAttribute('y', f1(base - h - 34));
      };
      return {
        update(lt, dur, cues) {
          const qa = BTL.ease(lt, 0.2, 1.8), tb = cue(cues, 'b', dur * 0.55), qb = BTL.ease(lt, tb - 0.2, 1.4);
          setBar(ba, na, qa); setBar(bb, nb, qb);
          fade(ba.r, BTL.ease(lt, 0, 0.6)); fade(na, BTL.ease(lt, 0.8, 1)); fade(la, BTL.ease(lt, 0.3, 1));
          fade(bb.r, BTL.ease(lt, tb - 0.4, 0.6)); fade(nb, BTL.ease(lt, tb + 0.2, 1)); fade(lb, BTL.ease(lt, tb - 0.2, 1));
          if (note) fade(note, BTL.ease(lt, 0.6, 1.2));
        },
      };
    },
  };
})();
