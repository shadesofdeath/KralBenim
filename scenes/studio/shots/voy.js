// voy: the Voynich Manuscript (Stickstory ag-02, 2026-10-28) and any "unreadable old book" story. Parchment ink
// style (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz via _ink.js, palette tokens only (INK), a pure
// function of (seed, lt). Uses TD.label / TD.figure from td__lib.js (pop-in labels, narrator / period figures).
//
// Shared: an invented "Voynich-like" script (loops, gallows, 9-tails; a small vocabulary so words really repeat),
// vellum pages with herbal / star-wheel / bathing-pool drawings, a 3/4 open book on a desk, candle, quill + inkpot.
// Page content: items [{kind: "text", box: [x0, y0, x1, y1] (page px, page = 1000 x 1400), gs: 34 (glyph height),
//   lh: 78 (line height)} | {kind: "plant"|"stars"|"bath", box}]
// Labels: L = {text, x, y, at, size, color, font: "hand"|"serif", box, rot}  (TD.label)
// Figures: K = {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, ...}], hat: false, accessory}
//
// SHOTS.voy_book  — a desk seen from the front (top at P.desk, 0..1 H), a big open manuscript on it (3/4 view),
//   a candle and a quill. P: {desk: 0.6, book: {x: 0.5, y: 0.6, w: 0.42 (half width of W), d: 0.2 (depth of H),
//   left: [items], right: [items], write: {at, dur} (glyphs ink in), glow: cue (gold glow on the pages)},
//   candle: {x, y, s} | false, quill: {x, y, s} | false, night: false (dark wall wash behind the desk),
//   behind: [K] (figures standing behind the desk: hat: true = narrator), kasif: K, cast: [K], labels: [L],
//   words: {lines: [{words, y, size, at: [..]}], highlight} (giant Fraunces words), stamp: {text, at, x, y}}
// SHOTS.voy_page  — one vellum page filling the frame, front-on. P: {items, write: {at, dur}, lens: {from: [x, y],
//   to: [x, y], at, dur, r: 150} (magnifying glass over the script, 0..1 W/H), mark: {word (vocab index), at, n: 4}
//   (repeats of one word ringed in gold one after the other, joined by a red thread), rot: -2, labels: [L]}
// SHOTS.voy_panels — loose manuscript pages dropped one by one on a wooden desk (top view):
//   P: {pages: [{items, x, y, w, rot, at}], labels: [L], quill: true}
// SHOTS.voy_room  — 1944 office: blackboard with chalk script, pinned photostats, a long table with papers and
//   three code-breakers behind it. P: {table: 0.62, board: {x, y, w, h, at}, cast: [K], balls: {at, n} (crumpled
//   papers drop onto the table), labels: [L], kasif: K}
// SHOTS.voy_date  — radiocarbon test: a big vellum page corner on the bench, a scalpel cuts a thin margin strip, the
//   strip lifts into a glass vial; a big date card stamps in. P: {cut: cue, lift: cue, card: {text, sub, at}, labels}
// cues: whatever names the params reference (at fields).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const at = (cues, v, fb) => typeof v === 'number' ? v : (v != null && cues && cues[v] != null) ? cues[v] : fb;
  const PW = 1000, PH = 1400;
  const brown = () => mix(mix(INK.red, INK.ink, 0.5), INK.paperDark, 0.25);
  const wood = () => mix(mix(INK.red, INK.ink, 0.35), INK.paperDark, 0.45);
  const vellum = () => mix(INK.paperLight, INK.paperDark, 0.28);
  const leaf = () => mix(INK.green, INK.paperLight, 0.25);
  const water = () => mix(INK.blue, INK.paperLight, 0.45);
  const ellP = (cx, cy, rx, ry, n = 14, a0 = 0) => { const o = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const arcP = (cx, cy, rx, ry, a0, a1, n = 8) => { const o = []; for (let i = 0; i <= n; i++) { const a = lerp(a0, a1, i / n); o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

  // ------------------------------------------------------------------ the script (glyph units: x-height 1, baseline 0)
  const G = {
    o: () => [ellP(0.3, -0.5, 0.26, 0.42, 10).concat([[0.56, -0.5]])],
    a: () => [arcP(0.3, -0.5, 0.26, 0.42, -0.4, TAU - 0.9, 9), [[0.56, -0.75], [0.58, 0]]],
    c: () => [arcP(0.34, -0.5, 0.26, 0.44, -1.0, -5.3, 8)],
    e: () => [arcP(0.3, -0.45, 0.22, 0.4, -0.9, -5.4, 8), [[0.1, -0.45], [0.48, -0.55]]],
    i: () => [[[0.15, -0.9], [0.2, 0]]],
    n: () => [[[0.12, -0.85], [0.16, 0]], [[0.16, -0.7], [0.4, -0.95], [0.55, -0.7], [0.56, 0.05], [0.7, 0.15]]],
    nine: () => [ellP(0.32, -0.62, 0.22, 0.3, 9), [[0.54, -0.6], [0.52, 0.35], [0.3, 0.6], [0.12, 0.45]]],
    eight: () => [ellP(0.3, -0.78, 0.17, 0.2, 8), ellP(0.3, -0.26, 0.22, 0.25, 8)],
    k: () => [[[0.12, 0], [0.18, -1.9]], [[0.6, 0], [0.62, -1.7]], [[0.15, -0.6], [0.55, -1.75], [0.95, -1.35], [0.6, -0.75], [0.15, -0.9]]],
    t: () => [[[0.12, 0], [0.16, -1.85]], [[0.15, -0.55], [0.5, -1.6], [0.85, -1.2], [0.4, -0.7]], [[0.48, -0.75], [0.62, 0]]],
    four: () => [[[0.08, -0.3], [0.48, -1.0], [0.5, 0.05]], [[0.0, -0.32], [0.7, -0.34]]],
    ch: () => [arcP(0.3, -0.5, 0.22, 0.42, -1.0, -5.3, 7), arcP(0.75, -0.5, 0.22, 0.42, -1.0, -5.3, 7), [[0.2, -1.05], [0.9, -1.1]]],
  };
  const GW = { o: 0.66, a: 0.7, c: 0.62, e: 0.6, i: 0.36, n: 0.82, nine: 0.66, eight: 0.6, k: 1.05, t: 0.95, four: 0.78, ch: 1.1 };
  const START = ['k', 't', 'four', 'ch', 'o', 'ch', 'k'], MID = ['o', 'a', 'e', 'e', 'i', 'k', 'ch', 'eight', 'o', 't'], END = ['nine', 'nine', 'n', 'eight', 'nine', 'a'];
  function vocab(seed, n = 11) {
    const r = rng(seed * 13 + 5), V = [];
    for (let k = 0; k < n; k++) {
      const len = 2 + Math.floor(r() * 4), w = [START[Math.floor(r() * START.length)]];
      for (let j = 1; j < len - 1; j++) w.push(MID[Math.floor(r() * MID.length)]);
      w.push(END[Math.floor(r() * END.length)]);
      V.push(w);
    }
    return V;
  }
  // lay text into a page box -> {strokes: [[pts page px]], words: [{v, x0, x1, y}]}
  function layText(it, seed, V) {
    const [x0, y0, x1, y1] = it.box, gs = it.gs ?? 34, lh = it.lh ?? gs * 2.3;
    const r = rng(seed * 7 + 3), strokes = [], words = [];
    for (let y = y0 + gs * 1.9; y <= y1; y += lh) {
      let x = x0 + (r() * 0.4) * gs;
      while (true) {
        const vi = r() < 0.35 ? Math.floor(r() * 3) : Math.floor(r() * V.length), w = V[vi];
        const ww = w.reduce((s, g) => s + GW[g], 0) * gs;
        if (x + ww > x1) break;
        const wx0 = x;
        w.forEach(g => {
          G[g]().forEach(st => { if (st.length > 1) strokes.push(st.map(p => [x + p[0] * gs, y + p[1] * gs])); });
          x += GW[g] * gs * 0.92;
        });
        words.push({ v: vi, x0: wx0, x1: x, y });
        x += gs * (0.55 + r() * 0.35);
      }
    }
    return { strokes, words, w: Math.max(2.4, gs * 0.1) };
  }
  // ------------------------------------------------------------------ page drawings (page px) -> [{pts, closed, fill, w}]
  function plant(box, seed) {
    const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, bw = x1 - x0, bh = y1 - y0, r = rng(seed * 3 + 1), o = [];
    const gy = y0 + bh * 0.8;
    for (let k = 0; k < 5; k++) { const a = -0.9 + k * 0.45; o.push({ pts: [[cx, gy], [cx + Math.sin(a) * bw * 0.12, gy + bh * 0.08], [cx + Math.sin(a) * bw * 0.28, gy + bh * 0.16 + r() * bh * 0.03]], w: 4 }); }
    o.push({ pts: ellP(cx, gy + bh * 0.02, bw * 0.13, bh * 0.05, 10), closed: true, fill: brown(), op: 0.55 });
    o.push({ pts: [[cx, gy], [cx - bw * 0.03, y0 + bh * 0.5], [cx + bw * 0.02, y0 + bh * 0.22], [cx, y0 + bh * 0.12]], w: 6 });
    for (let k = 0; k < 4; k++) {
      const s = k % 2 ? 1 : -1, ly = y0 + bh * (0.62 - k * 0.12), lx = cx + s * bw * 0.3, L = bw * (0.34 - k * 0.03);
      o.push({ pts: [[cx, ly + 20], [cx + s * L * 0.4, ly - L * 0.35], [cx + s * L, ly - L * 0.1], [cx + s * L * 0.5, ly + L * 0.25]], closed: true, fill: leaf(), op: 0.75 });
      o.push({ pts: [[cx, ly + 18], [cx + s * L * 0.85, ly - L * 0.12]], w: 3 });
    }
    const fy = y0 + bh * 0.12;
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU; o.push({ pts: ellP(cx + Math.cos(a) * bw * 0.09, fy + Math.sin(a) * bw * 0.07, bw * 0.07, bw * 0.05, 8, a), closed: true, fill: INK.blue, op: 0.55 }); }
    o.push({ pts: ellP(cx, fy, bw * 0.06, bw * 0.06, 9), closed: true, fill: INK.red, op: 0.75 });
    return o;
  }
  function stars(box, seed) {
    const [x0, y0, x1, y1] = box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.min(x1 - x0, y1 - y0) * 0.47, o = [];
    o.push({ pts: ellP(cx, cy, R, R, 24), closed: true, fill: water(), op: 0.35 });
    [1, 0.72, 0.42].forEach(k => o.push({ pts: ellP(cx, cy, R * k, R * k, 22), closed: true, w: 4 }));
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; o.push({ pts: [[cx + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.72], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], w: 3 }); }
    for (let k = 0; k < 10; k++) {
      const a = k / 10 * TAU + 0.3, rr = R * 0.58, sx = cx + Math.cos(a) * rr, sy = cy + Math.sin(a) * rr, s = R * 0.07, st = [];
      for (let j = 0; j < 10; j++) { const b = j / 10 * TAU - Math.PI / 2, q = j % 2 ? s * 0.4 : s; st.push([sx + Math.cos(b) * q, sy + Math.sin(b) * q]); }
      o.push({ pts: st, closed: true, fill: INK.gold, op: 0.9, sharp: true });
    }
    const sp = []; for (let k = 0; k < 16; k++) { const b = k / 16 * TAU, q = k % 2 ? R * 0.2 : R * 0.34; sp.push([cx + Math.cos(b) * q, cy + Math.sin(b) * q]); }
    o.push({ pts: sp, closed: true, fill: INK.red, op: 0.6, sharp: true });
    o.push({ pts: ellP(cx, cy, R * 0.16, R * 0.16, 10), closed: true, fill: INK.gold, op: 0.95 });
    return o;
  }
  function bath(box, seed) {
    const [x0, y0, x1, y1] = box, bw = x1 - x0, bh = y1 - y0, o = [];
    const pools = [[x0 + bw * 0.3, y0 + bh * 0.3, bw * 0.28], [x0 + bw * 0.68, y0 + bh * 0.72, bw * 0.3]];
    o.push({ pts: [[pools[0][0] + bw * 0.2, pools[0][1] + 20], [x0 + bw * 0.6, y0 + bh * 0.5], [pools[1][0] - bw * 0.15, pools[1][1] - 30]], w: 26, col: water() });
    pools.forEach(([px, py, pr], k) => {
      o.push({ pts: ellP(px, py, pr, pr * 0.42, 16), closed: true, fill: water(), op: 0.85 });
      for (let j = 0; j < 3; j++) {
        const fx = px + (j - 1) * pr * 0.55, fy = py - pr * 0.05;
        o.push({ pts: ellP(fx, fy - pr * 0.3, pr * 0.1, pr * 0.11, 8), closed: true, fill: INK.paperLight, op: 1 });
        o.push({ pts: [[fx, fy - pr * 0.19], [fx, fy + pr * 0.08]], w: 4 });
        o.push({ pts: [[fx - pr * 0.16, fy - pr * 0.24], [fx, fy - pr * 0.12], [fx + pr * 0.16, fy - pr * 0.26 - (j + k) % 2 * pr * 0.1]], w: 4 });
      }
      o.push({ pts: arcP(px, py, pr, pr * 0.42, 0.15, Math.PI - 0.15, 10), w: 5 });
    });
    return o;
  }
  const DRAW = { plant, stars, bath };

  // ------------------------------------------------------------------ one page renderer (any quad)
  // quad: [TL, TR, BR, BL] world px. update(t, quad, o: {reveal 0..1, hl: {v, n, p 0..1}, ink: 1})
  function page(parent, items, seed, opts = {}) {
    const g = el(parent, 'g');
    const sh = inkEl(g, INK.paperDark), f = inkEl(g, vellum()), stain = inkEl(g, INK.stain), edge = inkEl(g);
    const V = vocab(opts.vocab ?? 7);
    const draws = [], texts = [];
    (items || []).forEach((it, i) => {
      if (it.kind === 'text') texts.push(layText(it, seed + i * 17, V));
      else if (DRAW[it.kind]) draws.push(...DRAW[it.kind](it.box, seed + i));
    });
    const fills = draws.map(d => d.closed && d.fill ? inkEl(g, d.fill) : null);
    const drawR = inkEl(g), waterL = inkEl(g, water());
    const hlG = inkEl(g, INK.gold), txt = inkEl(g), thread = inkEl(g, INK.red);
    let memo = '';
    const api = {
      texts, tip: null,
      update(t, q, o = {}) {
        const M = (x, y) => { const u = x / PW, v = y / PH; const a = [lerp(q[0][0], q[1][0], u), lerp(q[0][1], q[1][1], u)], b = [lerp(q[3][0], q[2][0], u), lerp(q[3][1], q[2][1], u)]; return [lerp(a[0], b[0], v), lerp(a[1], b[1], v)]; };
        const scl = Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) / PW;
        const fr = inkFrame(t), rev = o.reveal ?? 1, hp = o.hl ? o.hl.p : -1;
        const key = fr + '|' + q.map(p => f1(p[0]) + ',' + f1(p[1])).join(';') + '|' + rev.toFixed(3) + '|' + (hp >= 0 ? hp.toFixed(3) : '');
        if (key === memo) return;
        memo = key;
        sh.setAttribute('d', inkLoop(q.map(p => [p[0] + 10 * scl + 6, p[1] + 14 * scl + 6]), { seed: seed + 1, t, smooth: false, amp: 1 }));
        f.setAttribute('d', inkLoop(q, { seed: seed + 2, t, smooth: false, amp: 1 }));
        stain.setAttribute('fill-opacity', 0.22);
        stain.setAttribute('d', inkLoop(ellP(820, 1220, 120, 90, 12).map(p => M(p[0], p[1])), { seed: seed + 3, t, amp: 1 }) + ' ' + inkLoop(ellP(120, 160, 70, 55, 10).map(p => M(p[0], p[1])), { seed: seed + 4, t, amp: 1 }));
        edge.setAttribute('d', inkPath(q, { w: Math.max(3, 5 * scl * 1.4), seed: seed + 5, t, closed: true, smooth: false, amp: 1 }));
        let dr = '', wl = '';
        draws.forEach((d, i) => {
          const pts = d.pts.map(p => M(p[0], p[1])), sd = seed * 3 + i * 7;
          if (fills[i]) { fills[i].setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 1, smooth: !d.sharp })); fills[i].setAttribute('fill-opacity', d.op ?? 0.7); }
          if (d.col) wl += inkPath(pts, { w: d.w * scl, seed: sd + 1, t, amp: 1 }) + ' ';
          else dr += inkPath(pts, { w: Math.max(2.2, (d.w ?? 4) * scl * 1.3), seed: sd + 2, t, closed: !!d.closed, amp: 1, smooth: !d.sharp }) + ' ';
        });
        drawR.setAttribute('d', dr); waterL.setAttribute('d', wl);
        let td = '', hd = '', thd = [], tip = null;
        texts.forEach((T, k) => {
          const n = Math.floor(T.strokes.length * rev);
          if (n > 0 && n < T.strokes.length) { const st = T.strokes[n - 1]; tip = M(st[st.length - 1][0], st[st.length - 1][1]); }
          for (let i = 0; i < n; i++) td += inkPath(T.strokes[i].map(p => M(p[0], p[1])), { w: Math.max(2, T.w * scl * 1.25), seed: seed + k * 1000 + i, t, amp: 0.5, taper: 0.4 }) + ' ';
          if (o.hl && hp >= 0) {
            const hits = T.words.filter(w => w.v === o.hl.v).slice(0, o.hl.n ?? 4);
            hits.forEach((w, j) => {
              const p = clamp01(hp * hits.length - j);
              if (p <= 0) return;
              const gs = (T.w / 0.1), c = M((w.x0 + w.x1) / 2, w.y - gs * 0.5), rx = (w.x1 - w.x0) / 2 * scl + 18, ry = gs * scl * 1.25;
              hd += inkLoop(ellP(c[0], c[1], rx * lerp(0.6, 1, p), ry * lerp(0.6, 1, p), 14), { seed: seed + 50 + j, t, amp: 1 }) + ' ';
              thd.push(c);
            });
          }
        });
        txt.setAttribute('d', td);
        hlG.setAttribute('d', hd); hlG.setAttribute('fill-opacity', 0.55);
        api.tip = tip;
        thread.setAttribute('d', thd.length > 1 ? inkPath(thd, { w: 5, seed: seed + 90, t, amp: 1.5, smooth: false }) : '');
      },
    };
    return api;
  }

  // ------------------------------------------------------------------ props
  function candle(parent, seed) {
    const g = el(parent, 'g'), glow = inkEl(g, INK.gold), body = inkEl(g, INK.paperLight), drip = inkEl(g, INK.paperDark), fl = inkEl(g, INK.gold), fc = inkEl(g, INK.red), r_ = inkEl(g), dish = inkEl(g, brown());
    return {
      update(t, x, y, s = 1) {
        const h = 230 * s, w = 54 * s, top = y - h, fk = Math.sin(t * 9.3 + seed) * 0.5 + Math.sin(t * 13.7) * 0.5;
        glow.setAttribute('fill-opacity', 0.18 + 0.05 * fk);
        glow.setAttribute('d', inkLoop(ellP(x, top - 60 * s, 130 * s, 150 * s, 16), { seed: seed + 1, t, amp: 2 }));
        dish.setAttribute('d', inkLoop(ellP(x, y, 90 * s, 22 * s, 12), { seed: seed + 2, t }));
        const bp = [[x - w / 2, y - 6], [x - w / 2, top], [x + w / 2, top], [x + w / 2, y - 6]];
        body.setAttribute('d', inkLoop(bp, { seed: seed + 3, t, smooth: false }));
        drip.setAttribute('d', inkLoop([[x - w / 2, top], [x - w / 2 - 4, top + 50 * s], [x - w / 2 + 10 * s, top + 60 * s], [x - w / 2 + 12, top]], { seed: seed + 4, t }));
        const fp = [[x, top - 4], [x - 22 * s, top - 40 * s], [x + fk * 8 * s, top - 110 * s], [x + 22 * s, top - 40 * s]];
        fl.setAttribute('d', inkLoop(fp, { seed: seed + 5, t, amp: 1 }));
        fc.setAttribute('fill-opacity', 0.75);
        fc.setAttribute('d', inkLoop(ellP(x, top - 30 * s, 9 * s, 18 * s, 8), { seed: seed + 6, t, amp: 0.8 }));
        r_.setAttribute('d', inkPath(bp, { w: 5, seed: seed + 7, t, smooth: false }) + ' ' + inkPath(ellP(x, y, 90 * s, 22 * s, 12), { w: 5, seed: seed + 8, t, closed: true }) +
          ' ' + inkPath(fp, { w: 3.5, seed: seed + 9, t, closed: true, amp: 1 }) + ' ' + inkPath([[x, top + 2], [x, top - 18 * s]], { w: 4, seed: seed + 10, t }));
      },
    };
  }
  function quill(parent, seed) {
    const g = el(parent, 'g'), pot = inkEl(g, INK.ink), potR = inkEl(g), fe = inkEl(g, INK.paperLight), r_ = inkEl(g);
    return {
      update(t, x, y, s = 1) {
        const pp = [[x - 60 * s, y], [x - 66 * s, y - 70 * s], [x - 40 * s, y - 100 * s], [x + 40 * s, y - 100 * s], [x + 66 * s, y - 70 * s], [x + 60 * s, y]];
        pot.setAttribute('d', inkLoop(pp, { seed: seed + 1, t })); pot.setAttribute('fill-opacity', 0.9);
        potR.setAttribute('d', inkPath(pp, { w: 5, seed: seed + 2, t, closed: true }));
        const sw = Math.sin(t * 1.3 + seed) * 4;
        const base = [x + 10 * s, y - 90 * s], tip = [x + (150 + sw) * s, y - 420 * s];
        const L = [base, [x + (40 + sw) * s, y - 210 * s], [x + (90 + sw) * s, y - 330 * s], tip, [x + (170 + sw) * s, y - 300 * s], [x + (120 + sw) * s, y - 190 * s], [x + 30 * s, y - 130 * s]];
        fe.setAttribute('d', inkLoop(L, { seed: seed + 3, t }));
        let d = inkPath(L, { w: 4, seed: seed + 4, t, closed: true }) + ' ' + inkPath([base, [x + (85 + sw) * s, y - 260 * s], tip], { w: 4, seed: seed + 5, t });
        for (let k = 1; k < 6; k++) { const p = k / 6; d += ' ' + inkPath([[lerp(base[0], tip[0], p), lerp(base[1], tip[1], p)], [lerp(base[0], tip[0], p) + 34 * s, lerp(base[1], tip[1], p) + 6 * s]], { w: 2.5, seed: seed + 10 + k, t }); }
        r_.setAttribute('d', d);
      },
    };
  }
  // desk seen from the front: top surface from yTop to yEdge (perspective), front panel to the bottom of the frame
  function desk(parent, seed) {
    const g = el(parent, 'g'), top = inkEl(g, wood()), front = inkEl(g, mix(wood(), INK.ink, 0.25)), r_ = inkEl(g), grain = inkEl(g, INK.inkSoft);
    const dg = el(g, 'g'), dIn = inkEl(dg, mix(wood(), INK.ink, 0.55)), dSide = inkEl(dg, mix(wood(), INK.ink, 0.15));
    const folios = [0, 1, 2].map(i => page(el(dg, 'g'), [{ kind: i === 1 ? 'stars' : 'text', box: i === 1 ? [100, 100, 900, 900] : [70, 60, 930, 1340], gs: 70 }].concat(i === 1 ? [{ kind: 'text', box: [70, 940, 930, 1340], gs: 70 }] : []), seed * 7 + 300 + i));
    const dFace = inkEl(dg, wood()), dR = inkEl(dg);
    return {
      update(t, W, H, yTop, yEdge, frontType) {
        const tp = [[-40, yTop], [W + 40, yTop], [W + 40, yEdge], [-40, yEdge]];
        top.setAttribute('d', inkLoop(tp, { seed: seed + 1, t, smooth: false }));
        top.setAttribute('fill-opacity', 0.8);
        const fp = [[-40, yEdge], [W + 40, yEdge], [W + 40, H + 40], [-40, H + 40]];
        front.setAttribute('d', inkLoop(fp, { seed: seed + 2, t, smooth: false }));
        front.setAttribute('fill-opacity', 0.9);
        let d = inkPath([[-40, yEdge], [W + 40, yEdge]], { w: 7, seed: seed + 3, t }) + ' ' + inkPath([[-40, yEdge + 34], [W + 40, yEdge + 34]], { w: 5, seed: seed + 4, t });
        const drawer = frontType === 'drawer';
        dg.style.display = drawer ? '' : 'none';
        if (drawer) {
          // an open drawer pulled towards the viewer, full of loose folios
          const sy = yEdge + 40, fy = sy + Math.max(110, (H - sy) * 0.42), a0 = W * 0.2, a1 = W * 0.8, b0 = W * 0.08, b1 = W * 0.92;
          const inside = [[a0, sy], [a1, sy], [b1, fy], [b0, fy]];
          dIn.setAttribute('d', inkLoop(inside, { seed: seed + 30, t, smooth: false })); dIn.setAttribute('fill-opacity', 0.95);
          dSide.setAttribute('d', inkLoop([[a0 - 20, sy - 6], [a0, sy], [b0, fy], [b0 - 26, fy - 10]], { seed: seed + 31, t, smooth: false }) + ' ' + inkLoop([[a1 + 20, sy - 6], [a1, sy], [b1, fy], [b1 + 26, fy - 10]], { seed: seed + 32, t, smooth: false }));
          const fw = (b1 - b0) * 0.36, fh = (fy - sy) * 0.9;
          [[0.3, -0.06, -7], [0.68, -0.02, 6], [0.5, 0.06, -2]].forEach(([u, dv, rot], i) => {
            const cx = lerp(b0, b1, u), cy = (sy + fy) / 2 + dv * (fy - sy) - fh * 0.15, r = rot * Math.PI / 180, sk = 0.92;
            const c = (dx, dy) => [cx + dx * Math.cos(r) - dy * Math.sin(r) * sk, cy + (dx * Math.sin(r) + dy * Math.cos(r)) * 0.55];
            folios[i].update(t, [c(-fw / 2, -fh), c(fw / 2, -fh), c(fw / 2, fh * 0.6), c(-fw / 2, fh * 0.6)]);
          });
          const face = [[b0 - 26, fy - 10], [b1 + 26, fy - 10], [b1 + 30, H + 40], [b0 - 30, H + 40]];
          dFace.setAttribute('d', inkLoop(face, { seed: seed + 33, t, smooth: false }));
          dR.setAttribute('d', inkPath(face, { w: 6, seed: seed + 34, t, closed: true, smooth: false }) + ' ' + inkPath(inside, { w: 5, seed: seed + 35, t, closed: true, smooth: false }) +
            ' ' + inkPath(ellP(W / 2, fy + 70, 46, 22, 10), { w: 6, seed: seed + 36, t, closed: true }));
        } else {
          const py0 = yEdge + 110, py1 = H - 70;
          if (py1 - py0 > 120) [[60, W * 0.47], [W * 0.53, W - 60]].forEach(([a, b], k) => {
            d += ' ' + inkPath([[a, py0], [b, py0], [b, py1], [a, py1]], { w: 5, seed: seed + 5 + k, t, closed: true, smooth: false });
            d += ' ' + inkPath(ellP((a + b) / 2, py0 + 80, 26, 16, 10), { w: 5, seed: seed + 8 + k, t, closed: true });
          });
        }
        r_.setAttribute('d', d);
        let gd = ''; const r = rng(seed * 5 + 1);
        for (let k = 0; k < 7; k++) { const y = lerp(yTop + 12, yEdge - 10, (k + 0.5) / 7), x0 = r() * W * 0.5, x1 = x0 + W * (0.3 + r() * 0.4); gd += inkPath([[x0, y], [(x0 + x1) / 2, y + (r() - 0.5) * 6], [x1, y]], { w: 2.4, seed: seed + 20 + k, t, amp: 0.8 }) + ' '; }
        grain.setAttribute('d', gd);
      },
    };
  }
  // open book in 3/4 view; returns quads of the two pages
  function book(parent, B, seed) {
    const g = el(parent, 'g'), cov = inkEl(g, mix(INK.red, INK.ink, 0.55)), covR = inkEl(g), edges = inkEl(g, INK.paperLight), edR = inkEl(g);
    const pl = page(g, B.left, seed + 100, { vocab: 7 }), pr = page(g, B.right, seed + 200, { vocab: 7 });
    const gut = inkEl(g, INK.inkSoft), glow = inkEl(g, INK.gold);
    return {
      pl, pr,
      update(lt, t, cues, W, H, o = {}) {
        const cx = (B.x ?? 0.5) * W, fy = (B.y ?? 0.6) * H, hw = (B.w ?? 0.42) * W, d = (B.d ?? 0.2) * H, k = 0.82, lift = 26;
        const by = fy - d;
        const Lq = [[cx - hw * k, by - lift * 0.4], [cx, by + 8], [cx, fy + 10], [cx - hw, fy - lift]];
        const Rq = [[cx, by + 8], [cx + hw * k, by - lift * 0.4], [cx + hw, fy - lift], [cx, fy + 10]];
        const cp = [[cx - hw * k - 16, by - 4], [cx + hw * k + 16, by - 4], [cx + hw + 22, fy + 4], [cx, fy + 40], [cx - hw - 22, fy + 4]];
        cov.setAttribute('d', inkLoop(cp, { seed: seed + 1, t, smooth: false }));
        covR.setAttribute('d', inkPath(cp, { w: 5, seed: seed + 2, t, closed: true, smooth: false }));
        const ep = [[cx - hw, fy - lift], [cx, fy + 10], [cx + hw, fy - lift], [cx + hw + 8, fy - lift + 16], [cx, fy + 28], [cx - hw - 8, fy - lift + 16]];
        edges.setAttribute('d', inkLoop(ep, { seed: seed + 3, t, smooth: false }));
        let ed = inkPath(ep, { w: 3.5, seed: seed + 4, t, closed: true, smooth: false });
        for (let j = 1; j < 3; j++) ed += ' ' + inkPath([[cx - hw - 2 * j, fy - lift + 6 * j], [cx, fy + 10 + 6 * j], [cx + hw + 2 * j, fy - lift + 6 * j]], { w: 2, seed: seed + 5 + j, t, smooth: false });
        edR.setAttribute('d', ed);
        const rev = B.write ? clamp01((lt - at(cues, B.write.at, 0)) / (B.write.dur ?? 2)) : 1;
        const seqW = B.write && B.write.seq;
        pl.update(t, Lq, { reveal: seqW ? clamp01(rev * 2) : rev }); pr.update(t, Rq, { reveal: seqW ? clamp01(rev * 2 - 1) : rev });
        gut.setAttribute('d', inkPath([[cx, by + 8], [cx, fy + 10]], { w: 6, seed: seed + 9, t }));
        const ga = at(cues, B.glow, null), gp = ga == null ? 0 : clamp01((lt - ga) / 0.5) * (0.75 + 0.25 * Math.sin(lt * 5));
        glow.setAttribute('fill-opacity', (0.22 * gp).toFixed(3));
        glow.setAttribute('d', gp > 0 ? inkLoop(ellP(cx, (by + fy) / 2, hw * 1.15, d * 0.95, 18), { seed: seed + 11, t, amp: 3 }) : '');
        return { cx, fy, by, hw, Lq, Rq, tip: pr.tip || pl.tip };
      },
    };
  }
  // giant Fraunces words (word by word, highlight word in a red box)
  function words(parent, Wd, W, H, seed) {
    if (!Wd) return null;
    const g = el(parent, 'g');
    const lines = Wd.lines.map((Ln, li) => Ln.words.map((w, wi) => {
      const gg = el(g, 'g'), box = inkEl(gg, INK.red), boxR = inkEl(gg);
      const tx = el(gg, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': Ln.size ?? 130, 'text-anchor': 'middle', fill: INK.ink });
      tx.textContent = w;
      return { gg, box, boxR, tx, w, hl: w === Wd.highlight, at: (Ln.at || [])[wi] ?? 0.1, li, wi, size: Ln.size ?? 130, y: Ln.y };
    }));
    return {
      update(lt, t, cues) {
        lines.forEach(ws => {
          const lens = ws.map(o => { let w = 0; try { w = o.tx.getComputedTextLength(); } catch (e) { } return w || o.w.length * o.size * 0.6; });
          const gap = ws[0].size * 0.28, tot = lens.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
          let x = (W - tot) / 2;
          ws.forEach((o, k) => {
            const a = at(cues, o.at, 0.1), p = lt >= a ? spring(lt, a, 0.5) : 0, cx = x + lens[k] / 2, cy = o.y * H, b = boil(seed + o.li * 10 + k, t, 1.2);
            x += lens[k] + gap;
            o.gg.setAttribute('transform', `translate(${f1(cx + b[0])} ${f1(cy + b[1])}) scale(${f1(Math.max(0.001, p) * 100) / 100})`);
            o.gg.style.visibility = lt < a ? 'hidden' : 'visible';
            o.tx.setAttribute('y', f1(o.size * 0.35)); o.tx.setAttribute('x', 0);
            if (o.hl) {
              o.tx.setAttribute('fill', INK.paperLight);
              const bw = lens[k] / 2 + 26, bh = o.size * 0.62, pts = [[-bw, -bh], [bw, -bh - 4], [bw + 3, bh], [-bw - 2, bh + 3]];
              o.box.setAttribute('d', inkLoop(pts, { seed: seed + 60 + k, t, smooth: false }));
              o.boxR.setAttribute('d', inkPath(pts, { w: 5, seed: seed + 70 + k, t, closed: true, smooth: false }));
            }
          });
        });
      },
    };
  }
  const figs = (parent, P, seed) => (P.cast || []).map((c, i) => TD.figure(el(parent, 'g'), c, seed * 3 + i * 7 + 1)).concat(P.kasif ? [TD.figure(el(parent, 'g'), Object.assign({ hat: true }, P.kasif), seed * 5 + 3)] : []);
  const labs = (parent, P, W, H, seed) => (P.labels || []).map((l, i) => TD.label(el(parent, 'g'), l, W, H, seed * 41 + i * 7));

  // ================================================================== voy_book
  SH.voy_book = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g');
      const wash = P.night ? inkEl(root, INK.ink) : null;
      const back = el(root, 'g');
      const dk = desk(root, seed + 1);
      const figBehind = el(root, 'g');
      const fb = (P.behind || []).map((K, i) => TD.figure(el(figBehind, 'g'), Object.assign({ hat: false }, K), seed * 9 + 2 + i * 5));
      const deskTop = el(root, 'g'), dk2 = desk(deskTop, seed + 1);
      const B = P.book ? book(root, P.book, seed + 3) : null;
      const cd = P.candle !== false ? candle(root, seed + 4) : null;
      const ql = P.quill !== false ? quill(root, seed + 5) : null;
      const fg = figs(root, P, seed);
      const pen = (P.behind || []).some(K => K.quill) ? { f: inkEl(root, INK.paperLight), r: inkEl(root) } : null;
      let lastHand = null, lastTip = null;
      const wd = words(root, P.words, W, H, seed + 6);
      const lb = labs(root, P, W, H, seed);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const yTop = (P.desk ?? 0.6) * H, yEdge = yTop + (P.desk_d ?? 0.12) * H;
          if (wash) { wash.setAttribute('fill-opacity', 0.32); wash.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, yTop + 20], [-40, yTop + 20]], { seed: seed + 8, t, smooth: false })); }
          dk.update(t, W, H, yTop, yEdge, P.front);
          fb.forEach(f => { lastHand = f.update(lt, t, cues, W, H) || lastHand; });
          // the desk is drawn twice: the front copy hides the lower body of a figure behind it
          dk2.update(t, W, H, yTop, yEdge, P.front);
          deskTop.style.display = fb.length ? '' : 'none';
          const bk = B ? B.update(lt, t, cues, W, H) : null;
          if (pen && lastHand) {
            // the scribe's quill: from his hand to the point where the script is being written
            if (bk && bk.tip) lastTip = bk.tip;
            const tip = lastTip || [lastHand.hand[0] + 60, lastHand.hand[1] + 140], h = lastHand.hand;
            const dx0 = tip[0] - h[0], dy0 = tip[1] - h[1], L = Math.hypot(dx0, dy0) || 1, ux = dx0 / L, uy = dy0 / L, ql = Math.min(L, 190);
            const tp = [h[0] + ux * ql, h[1] + uy * ql];
            const top = [h[0] - ux * 150, h[1] - uy * 150], nx = -uy, ny = ux;
            const vane = [h, [lerp(top[0], h[0], 0.5) + nx * 30, lerp(top[1], h[1], 0.5) + ny * 30], top, [lerp(top[0], h[0], 0.4) - nx * 8, lerp(top[1], h[1], 0.4) - ny * 8]];
            pen.f.setAttribute('d', inkLoop(vane, { seed: seed + 70, t }));
            pen.r.setAttribute('d', inkPath(vane, { w: 4, seed: seed + 71, t, closed: true }) + ' ' + inkPath([top, h, tp], { w: 4.5, seed: seed + 72, t }));
          }
          if (cd) cd.update(t, (P.candle?.x ?? 0.86) * W, (P.candle?.y ?? (P.desk ?? 0.6) + 0.05) * H, P.candle?.s ?? 1);
          if (ql) ql.update(t, (P.quill?.x ?? 0.1) * W, (P.quill?.y ?? (P.desk ?? 0.6) + 0.07) * H, P.quill?.s ?? 1);
          fg.forEach(f => f.update(lt, t, cues, W, H));
          if (wd) wd.update(lt, t, cues);
          lb.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== voy_page
  SH.voy_page = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const root = el(svg, 'g');
      const dk = desk(root, seed + 1);
      const pg = page(root, P.items || [{ kind: 'text', box: [70, 60, 930, 1340], gs: 40 }], seed + 2, { vocab: 7 });
      // magnifying glass: clipped, enlarged copy of the page
      const lensG = el(root, 'g');
      const cid = 'voyclip' + seed;
      const dfs = defs || el(svg, 'defs');
      const cp = el(dfs, 'clipPath', { id: cid }), cc = el(cp, 'circle', { cx: 0, cy: 0, r: 0 });
      const inner = el(lensG, 'g', { 'clip-path': `url(#${cid})` });
      const big = page(inner, P.items || [{ kind: 'text', box: [70, 60, 930, 1340], gs: 40 }], seed + 2, { vocab: 7 });
      const ring = inkEl(lensG), handle = inkEl(lensG, brown()), hR = inkEl(lensG), shine = inkEl(lensG, INK.paperLight);
      lensG.style.display = P.lens ? '' : 'none';
      const lb = labs(root, P, W, H, seed);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          dk.update(t, W, H, -40, H * 0.86);
          const rot = (P.rot ?? -2) * Math.PI / 180, mx = 70, ph = Math.min(H * 0.82, (W - 2 * mx) * 1.4), pw = ph / 1.4;
          const cx = W / 2, cy = (P.cy ?? 0.44) * H, drift = Math.sin(lt * 0.6) * 4;
          const corner = (dx, dy) => [cx + dx * Math.cos(rot) - dy * Math.sin(rot), cy + drift + dx * Math.sin(rot) + dy * Math.cos(rot)];
          const q = [corner(-pw / 2, -ph / 2), corner(pw / 2, -ph / 2), corner(pw / 2, ph / 2), corner(-pw / 2, ph / 2)];
          const rev = P.write ? clamp01((lt - at(cues, P.write.at, 0)) / (P.write.dur ?? 2)) : 1;
          const ma = P.mark ? at(cues, P.mark.at, 0.5) : null;
          const hl = P.mark ? { v: P.mark.word ?? 0, n: P.mark.n ?? 4, p: lt < ma ? -1 : clamp01((lt - ma) / (P.mark.dur ?? 1.6)) } : null;
          pg.update(t, q, { reveal: rev, hl });
          if (P.lens) {
            const L = P.lens, a = at(cues, L.at, 0), p = progIO(lt, a, L.dur ?? 2.5);
            const lx = lerp(L.from[0], L.to[0], p) * W + Math.sin(lt * 1.7) * 10, ly = lerp(L.from[1], L.to[1], p) * H + Math.cos(lt * 1.3) * 8, R = L.r ?? 150, z = L.zoom ?? 1.7;
            const qb = q.map(c => [lx + (c[0] - lx) * z, ly + (c[1] - ly) * z]);
            cc.setAttribute('cx', f1(lx)); cc.setAttribute('cy', f1(ly)); cc.setAttribute('r', R);
            big.update(t, qb, { reveal: rev });
            ring.setAttribute('d', inkCircle(lx, ly, R, seed + 31, t, { w: 14 }));
            const hp = [[lx + R * 0.68, ly + R * 0.68], [lx + R * 1.55, ly + R * 1.62], [lx + R * 1.68, ly + R * 1.48], [lx + R * 0.82, ly + R * 0.6]];
            handle.setAttribute('d', inkLoop(hp, { seed: seed + 32, t, smooth: false }));
            hR.setAttribute('d', inkPath(hp, { w: 5, seed: seed + 33, t, closed: true, smooth: false }));
            shine.setAttribute('fill-opacity', 0.5);
            shine.setAttribute('d', inkLoop(arcP(lx, ly, R * 0.8, R * 0.8, -2.6, -1.9, 5).concat(arcP(lx, ly, R * 0.68, R * 0.68, -1.9, -2.6, 5)), { seed: seed + 34, t, amp: 0.6 }));
          }
          lb.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== voy_panels
  SH.voy_panels = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g');
      const dk = desk(root, seed + 1);
      const ql = P.quill !== false ? quill(root, seed + 5) : null;
      const pages = (P.pages || []).map((p, i) => ({ p, g: page(el(root, 'g'), p.items, seed + 20 + i * 11, { vocab: 7 }) }));
      const lb = labs(root, P, W, H, seed);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          dk.update(t, W, H, -40, H * 0.9);
          if (ql) ql.update(t, (P.quill?.x ?? 0.12) * W, (P.quill?.y ?? 0.96) * H, P.quill?.s ?? 1.1);
          pages.forEach(({ p, g }, i) => {
            const a = at(cues, p.at, 0.1 + i * 0.6), k = lt < a ? 0 : spring(lt, a, 0.55);
            const w = (p.w ?? 0.5) * W, h = w * 1.4, cx = p.x * W, cy = p.y * H - (1 - k) * 220, rot = ((p.rot ?? 0) + (1 - k) * 14) * Math.PI / 180, s = lerp(1.25, 1, k);
            const cr = (dx, dy) => [cx + (dx * Math.cos(rot) - dy * Math.sin(rot)) * s, cy + (dx * Math.sin(rot) + dy * Math.cos(rot)) * s];
            const q = k <= 0.001 ? [[-9999, -9999], [-9998, -9999], [-9998, -9998], [-9999, -9998]] : [cr(-w / 2, -h / 2), cr(w / 2, -h / 2), cr(w / 2, h / 2), cr(-w / 2, h / 2)];
            g.update(t, q, { reveal: 1 });
          });
          lb.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== voy_room
  SH.voy_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g');
      const bd = P.board || {};
      const boardF = inkEl(root, mix(INK.ink, INK.green, 0.25)), boardR = inkEl(root, brown()), chalk = inkEl(root, INK.paperLight);
      const V = vocab(7), chalkT = layText({ box: [0, 0, 1000, 700], gs: 70, lh: 170 }, seed + 4, V);
      const pins = [0, 1].map(i => page(el(root, 'g'), [{ kind: i ? 'stars' : 'plant', box: [120, 120, 880, 900] }, { kind: 'text', box: [80, 940, 920, 1340], gs: 46 }], seed + 40 + i));
      const tacks = inkEl(root, INK.red);
      const people = el(root, 'g');
      const fg = (P.cast || []).map((c, i) => TD.figure(el(people, 'g'), Object.assign({ hat: false }, c), seed * 3 + i * 7 + 1));
      const tbl = desk(root, seed + 60);
      const papers = el(root, 'g'), pp = [0, 1, 2].map(i => page(el(papers, 'g'), [{ kind: 'text', box: [60, 60, 940, 1340], gs: 60 }], seed + 70 + i));
      const lamp = inkEl(root, INK.gold), lampR = inkEl(root);
      if (P.lamp !== true) { lamp.style.display = 'none'; lampR.style.display = 'none'; }
      const ballsF = inkEl(root, INK.paperLight), ballsR = inkEl(root);
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ hat: true }, P.kasif), seed * 5 + 3) : null;
      const lb = labs(root, P, W, H, seed);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ty = (P.table ?? 0.62) * H;
          // blackboard
          [boardF, boardR, chalk].forEach(n => { n.style.display = P.board === false ? 'none' : ''; });
          const bx = (bd.x ?? 0.5) * W, by = (bd.y ?? 0.27) * H, bw = (bd.w ?? 0.62) * W, bh = (bd.h ?? 0.2) * H;
          const bq = [[bx - bw / 2, by - bh / 2], [bx + bw / 2, by - bh / 2], [bx + bw / 2, by + bh / 2], [bx - bw / 2, by + bh / 2]];
          boardF.setAttribute('d', inkLoop(bq, { seed: seed + 1, t, smooth: false }));
          boardF.setAttribute('fill-opacity', 0.92);
          boardR.setAttribute('d', inkPath(bq, { w: 16, seed: seed + 2, t, closed: true, smooth: false }));
          const ca = at(cues, bd.at, 0), cr = clamp01((lt - ca) / 2.2), n = Math.floor(chalkT.strokes.length * cr);
          let cd = '';
          const sx = (bw - 60) / 1000, sy = (bh - 40) / 700;
          for (let i = 0; i < n; i++) cd += inkPath(chalkT.strokes[i].map(p => [bx - bw / 2 + 30 + p[0] * sx, by - bh / 2 + 10 + p[1] * sy]), { w: 4, seed: seed + 100 + i, t, amp: 0.6 }) + ' ';
          chalk.setAttribute('d', cd);
          // pinned photostats left / right of the board
          let tk = '';
          [[0.09, -4], [0.91, 5]].forEach(([px, rot], i) => {
            const cx = px * W, cy = by + 10, w = W * 0.15, h = w * 1.4, r = rot * Math.PI / 180;
            const c = (dx, dy) => [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)];
            pins[i].update(t, [c(-w / 2, -h / 2), c(w / 2, -h / 2), c(w / 2, h / 2), c(-w / 2, h / 2)]);
            tk += inkLoop(ellP(c(0, -h / 2 + 12)[0], c(0, -h / 2 + 12)[1], 10, 10, 8), { seed: seed + 50 + i, t }) + ' ';
          });
          tacks.setAttribute('d', tk);
          fg.forEach(f => f.update(lt, t, cues, W, H));
          // table
          tbl.update(t, W, H, ty, ty + H * 0.08, P.front ?? 'drawer');
          // papers lying on the table (flat, in perspective)
          [[0.2, -6], [0.5, 3], [0.8, -2]].forEach(([px, rot], i) => {
            const cx = px * W, cy = ty + H * 0.04, w = W * 0.2, d = H * 0.05, sk = rot * 2;
            pp[i].update(t, [[cx - w * 0.42 + sk, cy - d / 2], [cx + w * 0.42 + sk, cy - d / 2], [cx + w / 2, cy + d / 2], [cx - w / 2, cy + d / 2]]);
          });
          // desk lamp
          const lx = W * 0.92, lp = [[lx - 80, ty - 120], [lx + 50, ty - 160], [lx + 40, ty - 110], [lx - 60, ty - 80]];
          lamp.setAttribute('d', inkLoop(lp, { seed: seed + 12, t }));
          lampR.setAttribute('d', inkPath(lp, { w: 5, seed: seed + 13, t, closed: true }) + ' ' + inkPath([[lx + 20, ty - 130], [lx + 30, ty - 40], [lx + 10, ty]], { w: 7, seed: seed + 14, t }));
          // crumpled paper balls dropping onto the table
          const B = P.balls, ba = B ? at(cues, B.at, 0.5) : null;
          let bf = '', br = '';
          if (B) for (let k = 0; k < (B.n ?? 5); k++) {
            const a = ba + k * 0.22, p = clamp01((lt - a) / 0.45);
            if (p <= 0) continue;
            const x = W * (0.12 + ((k * 0.37 + 0.11) % 1) * 0.76), y0 = ty - H * 0.3, y = lerp(y0, ty + 6, p * p) - (p >= 1 ? Math.abs(Math.sin((lt - a - 0.45) * 9)) * 24 * Math.exp(-(lt - a - 0.45) * 5) : 0);
            const pts = ellP(x, y - 30, 36, 30, 9, k).map((q, j) => [q[0] + (j % 2 ? 6 : -4), q[1] + (j % 3 ? -5 : 5)]);
            bf += inkLoop(pts, { seed: seed + 200 + k, t, smooth: false }) + ' ';
            br += inkPath(pts, { w: 4, seed: seed + 210 + k, t, closed: true, smooth: false }) + ' ' + inkPath([[x - 20, y - 36], [x + 4, y - 26], [x + 18, y - 40]], { w: 3, seed: seed + 220 + k, t }) + ' ';
          }
          ballsF.setAttribute('d', bf); ballsR.setAttribute('d', br);
          if (kas) kas.update(lt, t, cues, W, H);
          lb.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== voy_date
  SH.voy_date = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const root = el(svg, 'g');
      const dk = desk(root, seed + 1);
      const pg = page(root, [{ kind: 'plant', box: [80, 80, 620, 820] }, { kind: 'text', box: [80, 860, 940, 1340], gs: 44 }], seed + 2);
      const strip = inkEl(root, vellum()), stripR = inkEl(root), slot = inkEl(root, mix(wood(), INK.ink, 0.1));
      const vial = inkEl(root, mix(INK.blue, INK.paperLight, 0.7)), vialR = inkEl(root), cap = inkEl(root, INK.red);
      const blade = inkEl(root, INK.paperLight), bladeR = inkEl(root), hnd = inkEl(root, brown());
      const cardF = inkEl(root, INK.paperLight), cardR = inkEl(root), cardT = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 150, 'text-anchor': 'middle', fill: INK.red });
      cardT.textContent = P.card?.text ?? '1404–1438';
      const subT = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 70, 'text-anchor': 'middle', fill: INK.ink });
      subT.textContent = P.card?.sub ?? '';
      const lb = labs(root, P, W, H, seed);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          dk.update(t, W, H, -40, H * 0.9);
          // page corner, big, tilted, lower half of the frame
          const r = -8 * Math.PI / 180, cx = W * 0.42, cy = H * 0.66, pw = W * 1.0, ph = pw * 1.4;
          const c = (dx, dy) => [cx + dx * Math.cos(r) - dy * Math.sin(r), cy + dx * Math.sin(r) + dy * Math.cos(r)];
          const q = [c(-pw / 2, -ph * 0.32), c(pw / 2, -ph * 0.32), c(pw / 2, ph * 0.68), c(-pw / 2, ph * 0.68)];
          pg.update(t, q);
          // the strip: cut along the right margin, then lifted to the vial
          const ca = at(cues, P.cut, 0.3), la = at(cues, P.lift, ca + 1.2);
          const cp = clamp01((lt - ca) / 0.9), lp = progIO(lt, la, 0.9);
          const s0 = c(pw / 2 - 70, -ph * 0.3), s1 = c(pw / 2 - 30, -ph * 0.3), sl = 380;
          const vx = W * 0.8, vy = H * 0.3;
          const sx = lerp(0, vx - (s0[0] + s1[0]) / 2, lp), sy = lerp(0, vy + 40 - s0[1], lp) - Math.sin(lp * Math.PI) * 120;
          const stq = [[s0[0] + sx, s0[1] + sy], [s1[0] + sx, s1[1] + sy], [s1[0] + sx - Math.sin(r) * sl * lerp(1, 0.6, lp), s1[1] + sy + Math.cos(r) * sl * lerp(1, 0.6, lp)], [s0[0] + sx - Math.sin(r) * sl * lerp(1, 0.6, lp), s0[1] + sy + Math.cos(r) * sl * lerp(1, 0.6, lp)]];
          const cutLen = sl * cp;
          slot.setAttribute('fill-opacity', lp > 0 ? 0.85 : 0);
          slot.setAttribute('d', inkLoop([s0, s1, [s1[0] - Math.sin(r) * sl, s1[1] + Math.cos(r) * sl], [s0[0] - Math.sin(r) * sl, s0[1] + Math.cos(r) * sl]], { seed: seed + 5, t, smooth: false, amp: 0.8 }));
          strip.setAttribute('d', inkLoop(stq, { seed: seed + 6, t, smooth: false, amp: 0.8 }));
          stripR.setAttribute('d', (cp > 0 ? inkPath([s1, [s1[0] - Math.sin(r) * cutLen, s1[1] + Math.cos(r) * cutLen]], { w: 5, seed: seed + 7, t }).replace(/^/, '') : '') + (lp > 0 ? ' ' + inkPath(stq, { w: 4, seed: seed + 8, t, closed: true, smooth: false }) : ''));
          // scalpel follows the cut, then moves away
          const tipD = cp < 1 ? cutLen : sl, away = lp;
          const tip = [s1[0] - Math.sin(r) * tipD + away * 300, s1[1] + Math.cos(r) * tipD + away * 200];
          const bp = [tip, [tip[0] + 30, tip[1] - 90], [tip[0] + 60, tip[1] - 70]], hp = [[tip[0] + 40, tip[1] - 84], [tip[0] + 220, tip[1] - 330], [tip[0] + 250, tip[1] - 310], [tip[0] + 64, tip[1] - 68]];
          blade.setAttribute('d', inkLoop(bp, { seed: seed + 9, t, smooth: false }));
          hnd.setAttribute('d', inkLoop(hp, { seed: seed + 10, t, smooth: false }));
          bladeR.setAttribute('d', inkPath(bp, { w: 4, seed: seed + 11, t, closed: true, smooth: false }) + ' ' + inkPath(hp, { w: 5, seed: seed + 12, t, closed: true, smooth: false }));
          // glass vial
          const vw = 110, vh = 300, vq = [[vx - vw / 2, vy - vh / 2], [vx + vw / 2, vy - vh / 2], [vx + vw / 2, vy + vh / 2 - 40], [vx, vy + vh / 2], [vx - vw / 2, vy + vh / 2 - 40]];
          vial.setAttribute('fill-opacity', 0.45);
          vial.setAttribute('d', inkLoop(vq, { seed: seed + 13, t }));
          vialR.setAttribute('d', inkPath(vq, { w: 5, seed: seed + 14, t, closed: true }));
          cap.setAttribute('d', inkLoop([[vx - vw / 2 - 8, vy - vh / 2 - 46], [vx + vw / 2 + 8, vy - vh / 2 - 46], [vx + vw / 2 + 8, vy - vh / 2 + 4], [vx - vw / 2 - 8, vy - vh / 2 + 4]], { seed: seed + 15, t, smooth: false }));
          // date card
          const C = P.card || {}, a = at(cues, C.at, 1.6), k = lt < a ? 0 : spring(lt, a, 0.5), pk = punch(lt, a, 0.5);
          const kx = W * 0.4, ky = H * (C.y ?? 0.27), kw = 760, kh = C.sub ? 300 : 220, s = Math.max(0.001, lerp(1.6, 1, k)) * (1 + 0.06 * pk);
          const kq = [[-kw / 2, -kh / 2], [kw / 2, -kh / 2 - 6], [kw / 2 + 4, kh / 2], [-kw / 2 - 3, kh / 2 + 4]].map(p => [kx + p[0] * s, ky + p[1] * s]);
          [cardF, cardR, cardT, subT].forEach(n => { n.style.visibility = k > 0 ? 'visible' : 'hidden'; });
          cardF.setAttribute('d', inkLoop(kq, { seed: seed + 16, t, smooth: false }));
          cardR.setAttribute('d', inkPath(kq, { w: 7, seed: seed + 17, t, closed: true, smooth: false }));
          cardT.setAttribute('transform', `translate(${f1(kx)} ${f1(ky + (C.sub ? -20 : 50) * s)}) rotate(-3) scale(${f1(s * 100) / 100})`);
          subT.setAttribute('transform', `translate(${f1(kx)} ${f1(ky + 100 * s)}) rotate(-3) scale(${f1(s * 100) / 100})`);
          lb.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  window.VOY = { page, book, desk, candle, quill, vocab, layText };
})();
