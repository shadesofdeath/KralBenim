// ws_wow: shots for the Stickstory Short "The Wow! signal" (2026-11-02): on 15 August 1977 Ohio State's Big Ear radio
// telescope caught a 72-second narrowband burst; the line-printer printout read "6EQUJ5"; days later Jerry Ehman
// circled it in red pen and wrote "Wow!"; telescopes have searched that spot in Sagittarius for decades and heard
// nothing; a 2024 study (Méndez et al.) suggests a flare that briefly lit up a cold hydrogen cloud.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any radio-astronomy / printout / SETI story.
// Uses td__lib.js (TD.label, TD.stars, TD.earth) lazily at build time.
//
// Common
//   K (figure) = {x, y (ground 0..1 H), scale, pose, face: "left"|"right", dir, emotion, item, text,
//     seq: [{at, pose, dir, face, emotion}], hat: true (fez narrator; false = period figure)}
//   L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
//   gy: ground line (0..1 H) for the foreground layer · fg: "grass" | "desk" | false (fills the frame below gy)
//
// SHOTS.ws_print — a sheet of 1977 line-printer paper (green bars, tractor-feed holes, rows of channel digits; one
//   column reads the code letters top to bottom). P: {mode: "held" | "feed" | "desk",
//   sheet: {x, y (centre 0..1), w, h, rot}, cols: 7, rows: 10, size: 56, code: "6EQUJ5", hl: 2 (column), row0: 2,
//   blank: false (only 1s and spaces), circle: cue (red ring draws round the code), wow: cue ("Wow!" writes in red),
//   wowAt: [x, y] (paper units 0..1), pen: true (desk: a hand with a red pen follows the ink),
//   feed: {head: 0.6 (slot y 0..1 H), at: cue (first code letter prints), step: 0.3 (s per row)} (feed mode: paper
//   scrolls up out of a printer), stamp: {text, at} (red stamp slams on), signal: {from: [x, y]} (gold waves fall
//   from a star onto the sheet), kasif: K (held: the sheet hangs from his front hand), labels, gy, fg}
// SHOTS.ws_ear   — the Big Ear telescope at night (side view): tilted flat reflector, aluminium ground plane, standing
//   parabolic reflector, feed horn hut; gold wave pulses run star -> flat -> parabola -> feed horn; at "hit" the
//   horn flashes. P: {gy: 0.6, star: [0.2, 0.12], arrive: cue (pulses start), hit, labels, fg}
// SHOTS.ws_sky   — the night sky in Sagittarius (teapot asterism) with a dashed circle round the Wow! spot.
//   P: {spot: [0.62, 0.2], r: 90, teapot: [0.38, 0.3, 150] | false, flare: {at, gone} (a gold point pulses, dies at
//   "gone"), ask: cue (big red "?"), dishes: [{x, s, at}] (radio dishes on the ground, dashed beams to the spot),
//   counter: {from: 1977, to: 2024, at, dur, x, y, size, suffix}, listen: cue (gold rings travel spot -> first dish),
//   kasif: K, labels, gy: 0.6, fg}
// SHOTS.ws_cloud — deep space: a magnetar flares (cue "flare"), its ring hits a cold hydrogen cloud which glows gold
//   and sends a thin beam down to the Earth (limb fills the frame bottom). P: {mag: [0.22, 0.16], cloud: [0.6, 0.42,
//   250, 160], flare, earth: 0.69 (limb top 0..1 H), labels}
// cues: hit (punch) + the names above + labels / seq "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const SLAB = "'Zilla Slab', Georgia, serif";
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const ringS = (pts, sd, t, w = 5, amp = 1, smooth = true) => inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth });
  const lineS = (pts, sd, t, w = 5, amp = 1, taper) => inkPath(pts, { w, seed: sd, t, amp, taper });
  const loopS = (pts, sd, t, amp = 1, smooth = true) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const GREENBAR = () => mix(INK.paperLight, INK.green, 0.16);
  const METAL = () => mix(INK.paperLight, INK.blue, 0.22);
  const WOOD = () => mix(INK.gold, INK.inkSoft, 0.5);
  const GLOW = () => mix(INK.gold, INK.paperLight, 0.25);
  let clipN = 0;

  // ------------------------------------------------------------------ figure (narrator or period figure)
  function figure(parent, K, sd) {
    if (!K) return null;
    const g = el(parent, 'g');
    const isK = K.hat !== false;
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), seed: sd });
    const gpC = inkEl(g, INK.paperLight), gpI = inkEl(g, INK.ink), gpL = inkEl(g, INK.ink);
    return {
      K,
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        const x = (K.x ?? 0.8) * W, y = (K.y ?? 0.6) * H, face = faceOf(s.face ?? K.face, -1);
        const pose = s.pose || 'idle';
        const o = { x, y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, text: K.text, item: pose === 'hold' ? (K.item || 'scroll') : null };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, pose, o), sc = K.scale ?? 1;
        const hw = r.hands[1], hl = r.hands[0];
        const head = [x + face * sc * r.head[0], y + sc * r.head[1]];
        // gasp: round "O" mouth, big eyes and three shock ticks round the head (any pose)
        const ga = K.gasp === true ? 0 : atOr(cues, K.gasp, null);
        if (ga != null && lt >= ga) {
          const F = (u, v) => [head[0] + face * u * sc, head[1] + v * sc], q = spring(lt, ga, 0.4), pul = 1 + 0.08 * Math.sin(lt * 7);
          gpC.setAttribute('d', loopS(ell(...F(15, 35), 24 * sc, 12 * sc, 10), sd + 900, t, 0.3));
          const m = F(15, 40);
          gpI.setAttribute('d', inkPath(ell(m[0], m[1], 10 * sc * q * pul, 15 * sc * q * pul, 10), { w: 5 * sc, seed: sd + 901, t, closed: true, amp: 0.3 }) + ' ' +
            [-1, 1].map(e => inkCircle(...F(17 + e * 22, 2), 9 * sc, sd + 902 + e, t, { w: 3.5 * sc, amp: 0.3 })).join(' '));
          const L = [];
          [[-0.9, -1.25], [0, -1.55], [0.9, -1.25]].forEach(([u, v], i) => { const a = F(u * 70 + 15, v * 70 - 30), b = F(u * 100 + 15, v * 98 - 30); L.push(lineS([a, b], sd + 910 + i, t, 6 * sc, 0.4)); });
          gpL.setAttribute('d', q > 0.3 ? L.join(' ') : '');
        } else { gpC.setAttribute('d', ''); gpI.setAttribute('d', ''); gpL.setAttribute('d', ''); }
        return { x, y, face, sc, hand: [x + face * sc * hw[0], y + sc * hw[1]], hand2: [x + face * sc * hl[0], y + sc * hl[1]], head };
      },
    };
  }

  // ------------------------------------------------------------------ foreground layer below the ground line
  //   grass: tufts, hatching and a post-and-wire fence; desk: a wooden desk top with grain and a coffee mug
  function foreground(parent, sd, W, H, kind) {
    if (!kind) return null;
    const fill = inkEl(parent, kind === 'desk' ? WOOD() : mix(INK.green, INK.ink, 0.45), { 'fill-opacity': kind === 'desk' ? 1 : 0.55 });
    const fill2 = inkEl(parent, mix(INK.green, INK.ink, 0.62), { 'fill-opacity': 0.6 });
    const hatch = inkEl(parent, mix(INK.inkSoft, INK.ink, 0.3)), lite = inkEl(parent, mix(INK.paperLight, INK.green, 0.35));
    const posts = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.2)), wire = inkEl(parent, INK.inkSoft);
    const tufts = []; for (let i = 0; i < 46; i++) tufts.push([hn(sd + i, 1), hn(sd + i, 2), hn(sd + i, 3)]);
    return {
      update(lt, t, gy) {
        const k = sd * 3;
        if (kind === 'desk') {
          const top = [[-40, gy + 6], [W + 40, gy - 6], [W + 40, H + 40], [-40, H + 40]];
          fill.setAttribute('d', loopS(top, k + 1, t, 0.6, false));
          const G = [lineS([[-20, gy + 4], [W + 20, gy - 6]], k + 2, t, 7, 0.5)];
          for (let i = 0; i < 9; i++) { const y = gy + 60 + i * (H - gy) / 9; G.push(lineS([[-20, y], [W * 0.3, y + 10 * Math.sin(i)], [W * 0.7, y - 8], [W + 20, y + 6]], k + 10 + i, t, 2.5, 0.6, 0.6)); }
          hatch.setAttribute('d', G.join(' '));
          fill2.setAttribute('d', ''); lite.setAttribute('d', ''); posts.setAttribute('d', ''); wire.setAttribute('d', '');
          return;
        }
        if (kind === 'road') {   // a country road along the site: grass verge, asphalt with a dashed centre line, gravel edge
          const r0 = gy + (H - gy) * 0.22, r1 = gy + (H - gy) * 0.7, top = [];
          for (let i = 0; i <= 14; i++) top.push([-40 + i * (W + 80) / 14, gy + 4 + Math.sin(i * 1.7) * 6]);
          fill.setAttribute('d', loopS(top.concat([[W + 40, H + 40], [-40, H + 40]]), k + 1, t, 0.5, false));
          fill2.setAttribute('fill', mix(INK.inkSoft, INK.ink, 0.35)); fill2.setAttribute('fill-opacity', 0.85);
          fill2.setAttribute('d', loopS([[-40, r0], [W + 40, r0 - 10], [W + 40, r1], [-40, r1 + 10]], k + 2, t, 0.5, false));
          const D = [lineS([[-40, r0], [W + 40, r0 - 10]], k + 3, t, 5, 0.4), lineS([[-40, r1 + 10], [W + 40, r1]], k + 4, t, 5, 0.4)], Lh = [];
          const mid = (r0 + r1) / 2, off = (lt * 160) % 260;
          for (let i = -1; i < 6; i++) { const x = i * 260 - off; Lh.push(loopS(rect(x, mid - 9, x + 140, mid + 9), k + 10 + i + 1, t, 0.4, false)); }
          for (let i = 0; i < 40; i++) { const x = hn(sd + i, 7) * W, y = lerp(r1 + 30, H - 20, hn(sd + i, 8)); D.push(inkDot(x, y, 4 + hn(sd + i, 9) * 5, 3 + hn(sd + i, 9) * 3, k + 40 + i, t)); }
          for (let i = 0; i < 12; i++) { const x = hn(sd + i, 11) * W, y = lerp(gy + 20, r0 - 10, hn(sd + i, 12)); for (let j = -1; j <= 1; j++) D.push(lineS([[x + j * 10, y], [x + j * 16 + Math.sin(lt * 1.5 + i) * 4, y - 34]], k + 100 + i * 3 + j, t, 3, 0.4, 0.8)); }
          hatch.setAttribute('d', D.join(' ')); lite.setAttribute('d', Lh.join(' ')); lite.setAttribute('fill', INK.paperLight);
          posts.setAttribute('d', ''); wire.setAttribute('d', '');
          return;
        }
        const g2 = gy + (H - gy) * 0.38;
        const r1 = [], r2 = [];
        for (let i = 0; i <= 14; i++) { const x = -40 + i * (W + 80) / 14; r1.push([x, gy + 4 + Math.sin(i * 1.7) * 8]); r2.push([x, g2 + Math.sin(i * 1.3 + 2) * 18]); }
        fill.setAttribute('d', loopS(r1.concat([[W + 40, H + 40], [-40, H + 40]]), k + 1, t, 0.5, false));
        fill2.setAttribute('d', loopS(r2.concat([[W + 40, H + 40], [-40, H + 40]]), k + 2, t, 0.5, false));
        const D = [], Lh = [];
        tufts.forEach((q, i) => {
          const x = q[0] * W, y = lerp(gy + 40, H - 30, q[1]), s = lerp(0.6, 1.6, (y - gy) / (H - gy)), sway = Math.sin(lt * 1.6 + i) * 5 * s;
          for (let j = -2; j <= 2; j++) D.push(lineS([[x + j * 9 * s, y], [x + j * 16 * s + sway, y - (30 + 14 * (2 - Math.abs(j))) * s]], k + 30 + i * 5 + j, t, 3 * s, 0.4, 0.8));
          if (i % 3 === 0) Lh.push(lineS([[x + 20 * s, y - 2], [x + 30 * s + sway, y - 34 * s]], k + 300 + i, t, 2.5 * s, 0.4, 0.8));
        });
        hatch.setAttribute('d', D.join(' ')); lite.setAttribute('d', Lh.join(' '));
        // fence across the middle of the foreground
        const fy = gy + (H - gy) * 0.24, P_ = [], Wr = [];
        for (let i = 0; i < 7; i++) { const x = 40 + i * (W - 80) / 6; P_.push(lineS([[x, fy + 70], [x + 2, fy - 90]], k + 400 + i, t, 11, 0.5)); }
        [fy - 60, fy - 10].forEach((y, j) => Wr.push(lineS(Array.from({ length: 7 }, (_, i) => [40 + i * (W - 80) / 6, y + Math.sin(i * 2 + j) * 6]), k + 420 + j, t, 3, 0.5)));
        posts.setAttribute('d', P_.join(' ')); wire.setAttribute('d', Wr.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ line-printer sheet
  //   sheet(parent, sd, S) -> {update(lt, t, o)}; S: {w, h, cols, rows, size, code, hl, row0, blank}
  //   o: {x, y, rot, scroll (px, feed), clipY (screen y below which nothing shows, feed), circle 0..1, wow 0..1,
  //   stamp 0..1, wowAt}. Returns paper->screen mapper.
  function sheet(parent, sd, S, defs) {
    const w = S.w, h = S.h, cols = S.cols ?? 7, size = S.size ?? 56, rowH = size * 1.42;
    const nRows = S.rows ?? Math.ceil(h / rowH);
    const code = (S.code || '6EQUJ5').split(''), hl = S.hl ?? 2, row0 = S.row0 ?? 2;
    const g = el(parent, 'g');
    const id = 'wsclip' + (sd % 100000) + '_' + (clipN++);
    const cp = el(defs || g, 'clipPath', { id }), cr = el(cp, 'path');
    const body = el(g, 'g', { 'clip-path': `url(#${id})` });
    const paper = inkEl(body, INK.paperLight), bars = inkEl(body, GREENBAR()), holes = inkEl(body, mix(INK.paperDark, INK.inkSoft, 0.3)), perf = inkEl(body, INK.inkSoft);
    const rowsG = el(body, 'g'), txt = [];
    const colX = i => w * 0.17 + i * (w * 0.66) / (cols - 1);
    const R = rng(sd * 7 + 1);
    const total = nRows + 40;
    for (let r = 0; r < total; r++) {
      for (let c = 0; c < cols; c++) {
        const v = R();
        let ch = v < 0.58 ? '1' : v < 0.84 ? ' ' : v < 0.95 ? '2' : '3';
        if (S.blank) ch = v < 0.62 ? '1' : ' ';
        const isCode = !S.blank && c === hl && r >= row0 && r < row0 + code.length;
        if (isCode) ch = code[r - row0];
        if (!S.blank && c === hl && (r === row0 - 1 || r === row0 + code.length)) ch = ' ';
        if ((S.clear || []).some(([c0, c1, q0, q1]) => c >= c0 && c <= c1 && r >= q0 && r <= q1)) ch = ' ';
        if (ch === ' ') continue;
        const tx = el(rowsG, 'text', { x: f1(colX(c)), y: f1((r + 0.72) * rowH), 'font-family': SLAB, 'font-weight': 700, 'font-size': isCode ? size * 1.12 : size, 'text-anchor': 'middle', fill: isCode ? INK.ink : mix(INK.ink, INK.inkSoft, 0.45) });
        tx.textContent = ch; txt.push({ tx, r, isCode });
      }
    }
    const notes = (S.notes || []).map(N => { const tx = el(rowsG, 'text', { 'font-family': INK_FONT, 'font-size': N.size || size * 1.05, 'text-anchor': 'middle', fill: N.color === 'red' ? INK.red : INK.ink, opacity: 0 });
      tx.textContent = N.text; const xx = w * 0.17 + (N.col ?? 0) * (w * 0.66) / (cols - 1), yy = ((N.row ?? 0) + 0.72) * rowH; tx.setAttribute('x', f1(xx)); tx.setAttribute('y', f1(yy)); tx.setAttribute('transform', `rotate(${N.rot ?? -4} ${f1(xx)} ${f1(yy)})`); return { N, tx }; });
    const edge = inkEl(g), circ = inkEl(g, INK.red), stampF = inkEl(g, INK.red, { 'fill-opacity': 0.9 }), stampR = inkEl(g, INK.red);
    const stampT = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.paperLight });
    const wowId = id + 'w', wcp = el(defs || g, 'clipPath', { id: wowId }), wcr = el(wcp, 'rect');
    const wowG = el(g, 'g', { 'clip-path': `url(#${wowId})` });
    const wowT = el(wowG, 'text', { 'font-family': INK_FONT, 'font-size': size * (S.wowSize ?? 2.3), 'text-anchor': 'middle', fill: INK.red });
    wowT.textContent = 'Wow!';
    const wowU = inkEl(g, INK.red);
    return {
      rowH, colX, code, hl, row0,
      update(lt, t, o) {
        const k = sd * 3, b = boil(sd + 1, t, 1.2), sc = o.scroll || 0;
        g.setAttribute('transform', `translate(${f1(o.x + b[0])} ${f1(o.y + b[1])}) rotate(${f1(o.rot || 0)}) translate(${f1(-w / 2)} ${f1(-h / 2)})`);
        const outline = [[0, 0], [w, -3], [w + 2, h], [-2, h + 2]];
        let clip = outline;
        if (o.clipY != null) clip = [[0, o.clipTop ?? -2000], [w, o.clipTop ?? -2000], [w, o.clipY], [0, o.clipY]];
        cr.setAttribute('d', loopS(clip, k + 1, t, 0.4, false));
        const top = o.clipY != null ? -2000 : 0, bot = o.clipY != null ? o.clipY : h;
        paper.setAttribute('d', loopS([[0, top], [w, top], [w, bot], [0, bot]], k + 2, t, 0.4, false));
        const B = [], Ho = [], Pf = [];
        const r0 = Math.floor((top + sc) / rowH) - 1, r1 = Math.ceil((bot + sc) / rowH) + 1;
        for (let r = r0; r <= r1; r++) {
          const y = r * rowH - sc;
          if (((r % 4) + 4) % 4 < 2) B.push(loopS(rect(w * 0.09, y, w * 0.91, y + rowH), k + 10 + (r & 15), t, 0.3, false));
          [w * 0.045, w * 0.955].forEach((x, j) => Ho.push(inkCircle(x, y + rowH * 0.5, size * 0.17, k + 40 + j + (r & 7) * 2, t, { fill: true, amp: 0.4 })));
          if (((r % 12) + 12) % 12 === 0) Pf.push(lineS([[0, y], [w, y]], k + 60 + (r & 7), t, 2, 0.4));
        }
        bars.setAttribute('d', B.join(' ')); holes.setAttribute('d', Ho.join(' ')); perf.setAttribute('d', Pf.join(' '));
        rowsG.setAttribute('transform', `translate(0 ${f1(-sc)})`);
        if (o.reveal != null) txt.forEach(q => q.tx.setAttribute('opacity', q.r < o.reveal ? 1 : 0));
        notes.forEach(({ N, tx }) => { const a = o.cues ? atOr(o.cues, N.at, 0) : 0, v = lt >= a ? clamp01((lt - a) / 0.35) : 0; tx.setAttribute('opacity', f1(v)); });
        edge.setAttribute('d', o.clipY != null ? lineS([[0, -2000], [0, o.clipY]], k + 3, t, 4, 0.5) + ' ' + lineS([[w, -2000], [w, o.clipY]], k + 4, t, 4, 0.5) : ringS(outline, k + 3, t, 4, 0.5, false));
        // red ring round the code column
        const cx = colX(hl), cy = (row0 + code.length / 2) * rowH - sc, rx = size * 1.0, ry = code.length * rowH * 0.53;
        const cp_ = clamp01(o.circle || 0);
        if (cp_ > 0.01) {
          const n = 28, pts = [];
          for (let i = 0; i <= Math.ceil(n * 1.08 * cp_); i++) { const a = -Math.PI * 0.62 + i / n * Math.PI * 2; pts.push([cx + Math.cos(a) * rx * (1 + 0.04 * Math.sin(i)), cy + Math.sin(a) * ry]); }
          circ.setAttribute('d', pts.length > 1 ? lineS(pts, k + 70, t, size * 0.15, 0.6, 0.5) : '');
        } else circ.setAttribute('d', '');
        // "Wow!" in red pen, written left to right
        const wa = o.wowAt || [0.2, 0.5], wx = wa[0] * w, wy = wa[1] * h - sc * 0, wp = clamp01(o.wow || 0), wz = size * (S.wowSize ?? 2.3) / 2.3;
        let ww = 0; try { ww = wowT.getComputedTextLength(); } catch (e) { ww = 0; } if (!ww) ww = wz * 4.6;
        wowT.setAttribute('x', f1(wx)); wowT.setAttribute('y', f1(wy + wz * 0.8));
        wowT.setAttribute('transform', `rotate(-10 ${f1(wx)} ${f1(wy)})`);
        wcr.setAttribute('x', f1(wx - ww * 0.75)); wcr.setAttribute('y', f1(wy - wz * 2.2)); wcr.setAttribute('height', f1(wz * 4.4)); wcr.setAttribute('width', f1(Math.max(0, ww * 1.5 * wp)));
        wowU.setAttribute('d', wp > 0.98 ? lineS([[wx - ww * 0.55, wy + wz * 1.55], [wx + ww * 0.5, wy + wz * 1.0]], k + 80, t, wz * 0.12, 0.6) : '');
        this.penTip = cp_ > 0.01 && cp_ < 1 ? (() => { const a = -Math.PI * 0.62 + cp_ * 1.08 * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; })()
          : wp > 0.01 && wp < 1 ? [wx - ww * 0.5 + ww * wp, wy + wz * 0.6 - ww * wp * 0.17 + Math.sin(lt * 30) * wz * 0.25] : null;
        // stamp
        const sp = o.stamp || 0;
        if (sp > 0.01 && o.stampText) {
          stampT.textContent = o.stampText;
          const ss = size * 1.6, sw = o.stampText.length * ss * 0.72 + 60, sh = ss * 1.45, scl = lerp(2.2, 1, Math.min(1, sp * 1.6));
          const sx = w / 2, sy = (o.stampY ?? 0.45) * h;
          const pts = [[-sw / 2, -sh / 2], [sw / 2, -sh / 2 - 4], [sw / 2 + 3, sh / 2], [-sw / 2 - 2, sh / 2 + 3]].map(([x, y]) => [sx + x * scl, sy + y * scl]);
          stampF.setAttribute('d', loopS(pts, k + 90, t, 0.6, false)); stampR.setAttribute('d', ringS(pts, k + 91, t, 6, 0.6, false));
          stampT.setAttribute('font-size', f1(ss * scl)); stampT.setAttribute('x', f1(sx)); stampT.setAttribute('y', f1(sy + ss * scl * 0.36));
          stampT.setAttribute('transform', `rotate(-8 ${f1(sx)} ${f1(sy)})`); stampF.setAttribute('transform', `rotate(-8 ${f1(sx)} ${f1(sy)})`); stampR.setAttribute('transform', `rotate(-8 ${f1(sx)} ${f1(sy)})`);
        } else { stampF.setAttribute('d', ''); stampR.setAttribute('d', ''); stampT.textContent = ''; }
        const rot = (o.rot || 0) * Math.PI / 180, c = Math.cos(rot), s = Math.sin(rot);
        this.toScreen = p => { const x = p[0] - w / 2, y = p[1] - h / 2; return [o.x + x * c - y * s, o.y + x * s + y * c]; };
      },
    };
  }

  // ------------------------------------------------------------------ gold signal waves (wavy strands falling)
  function signal(parent, sd) {
    const e = inkEl(parent, INK.gold), e2 = inkEl(parent, GLOW()), star = inkEl(parent, INK.gold), starR = inkEl(parent);
    return {
      update(lt, t, from, to, on = 1) {
        const D = [], D2 = [];
        const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
        for (let s2 = 0; s2 < 3; s2++) {
          const pts = [], off = (s2 - 1) * 46;
          for (let i = 0; i <= 22; i++) { const v = i / 22, wv = Math.sin(v * 26 - lt * 9 + s2 * 2) * 22 * Math.sin(Math.PI * v); pts.push([from[0] + dx * v + nx * (wv + off * v), from[1] + dy * v + ny * (wv + off * v)]); }
          (s2 === 1 ? D : D2).push(lineS(pts, sd + 10 + s2, t, s2 === 1 ? 8 : 5, 0.5, 0.7));
        }
        e.setAttribute('d', on > 0.05 ? D.join(' ') : ''); e2.setAttribute('d', on > 0.05 ? D2.join(' ') : '');
        e.setAttribute('fill-opacity', f1(on)); e2.setAttribute('fill-opacity', f1(on));
        const R0 = 34 * (1 + 0.15 * Math.sin(lt * 6)), pts = [];
        for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + lt * 0.6, rad = k % 2 ? R0 * 0.36 : R0; pts.push([from[0] + Math.cos(a) * rad, from[1] + Math.sin(a) * rad]); }
        star.setAttribute('d', loopS(pts, sd + 20, t, 0.6, false)); starR.setAttribute('d', ringS(pts, sd + 21, t, 3, 0.6, false));
      },
    };
  }

  // ================================================================== ws_print
  SH.ws_print = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const sd = seed * 1000 + 8101, top = el(svg, 'g'), root = el(top, 'g');
      const mode = P.mode || 'held';
      const S = Object.assign({ x: 0.62, y: 0.47, w: 520, h: 720, rot: 0 }, P.sheet || {});
      const gy = (P.gy ?? (mode === 'desk' ? 0.62 : mode === 'feed' ? 0.6 : 0.68)) * H;
      const fg = foreground(el(root, 'g'), sd + 5, W, H, P.fg === undefined ? (mode === 'held' ? 'grass' : false) : P.fg);
      const sig = P.signal ? signal(el(root, 'g'), sd + 6) : null;
      // printer body (feed mode): a 1970s line printer, its top slot at feed.head
      const FD = Object.assign({ head: 0.6, at: null, step: 0.3 }, P.feed || {});
      const prn = mode === 'feed' ? (() => { const g = el(root, 'g'); return { g, f: inkEl(g, mix(INK.paperDark, INK.blue, 0.18)), f2: inkEl(g, mix(INK.paperDark, INK.ink, 0.25)), r: inkEl(g), lamp: inkEl(g, INK.red), dial: inkEl(g, INK.paperLight) }; })() : null;
      const sh = sheet(el(root, 'g'), sd + 2, { w: S.w, h: S.h, cols: P.cols, rows: P.rows, size: P.size, code: P.code, hl: P.hl, row0: P.row0, blank: P.blank, clear: P.clear, notes: P.notes, wowSize: P.wowSize }, defs);
      const prnFront = mode === 'feed' ? (() => { const g = el(root, 'g'); return { lip: inkEl(g, mix(INK.paperDark, INK.ink, 0.35)), r: inkEl(g) }; })() : null;
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, sd + 8) : null;
      const grip = inkEl(el(root, 'g'), INK.ink);
      const pen = P.pen ? (() => { const g = el(root, 'g'); return { arm: inkEl(g, INK.ink), hand: inkEl(g, INK.paperLight), handR: inkEl(g), body: inkEl(g, INK.red), bodyR: inkEl(g), tip: inkEl(g, INK.ink) }; })() : null;
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5)), k = sd;
          if (fg) fg.update(lt, t, gy);
          let sx = S.x * W, sy = S.y * H, rot = S.rot || 0;
          let kr = null;
          if (kas) {
            kr = kas.update(lt, t, cues, W, H);
            sx = kr.hand[0] + kr.face * (S.w / 2 - (S.grip ?? 40)); sy = kr.hand[1] + S.h / 2 - (S.top ?? 90) + Math.sin(lt * 1.3) * 6; rot = (S.rot || 0) + Math.sin(lt * 1.1) * 1.2;
          }
          const ca = atOr(cues, P.circle, null), wa = atOr(cues, P.wow, null), sa = P.stamp ? atOr(cues, P.stamp.at, null) : null;
          const o = { x: sx, y: sy, rot: rot + hit * 1.5, circle: ca == null ? 0 : prog(lt, ca, P.circleDur ?? 0.9), wow: wa == null ? 0 : prog(lt, wa, P.wowDur ?? 0.8), wowAt: P.wowAt,
            stamp: sa == null ? 0 : clamp01((lt - sa) / 0.25), stampText: P.stamp && P.stamp.text, stampY: P.stamp && P.stamp.y, cues };
          if (P.circle === true) o.circle = 1;
          if (P.wow === true) o.wow = 1;
          if (mode === 'feed') {
            const step = FD.step, a = atOr(cues, FD.at, 0.3), rowH = sh.rowH, v = rowH / step;
            const headLocal = FD.head * H - (sy - S.h / 2);       // printer slot in paper coordinates
            const sc0 = sh.row0 * rowH - headLocal + rowH * 0.2;  // scroll at which the first code row reaches the slot
            const lte = FD.stop != null ? Math.min(lt, a + step * (sh.code.length + FD.stop)) : lt;
            o.scroll = sc0 + v * (lte - a);
            o.clipY = headLocal;
            if (FD.top != null) o.clipTop = FD.top * H - (sy - S.h / 2);
            o.reveal = (o.scroll + headLocal) / rowH - 0.25;
          }
          sh.update(lt, t, o);
          if (prn) {
            const hy = FD.head * H, x0 = sx - S.w / 2 - 90, x1 = sx + S.w / 2 + 90;
            const body = rect(x0, hy - 10, x1, H + 40);
            prn.f.setAttribute('d', loopS(body, k + 30, t, 0.5, false));
            prn.f2.setAttribute('d', loopS(rect(x0 + 30, hy + 120, x1 - 30, hy + 150), k + 31, t, 0.4, false) + ' ' + loopS(rect(x0 + 40, hy + 330, x1 - 40, H + 40), k + 32, t, 0.4, false));
            const V = [ringS(body, k + 33, t, 6, 0.5, false), ringS(rect(x0 + 40, hy + 330, x1 - 40, H + 40), k + 34, t, 4, 0.4, false)];
            prn.r.setAttribute('d', V.join(' '));
            // fan-fold paper stack in the open bin under the slot (pages pile up)
            if (!prn.stack) { prn.stack = inkEl(prn.g, INK.paperLight); prn.stackB = inkEl(prn.g, GREENBAR()); prn.stackR = inkEl(prn.g, mix(INK.inkSoft, INK.ink, 0.2)); prn.plate = inkEl(prn.g, INK.paperLight); prn.plateR = inkEl(prn.g); }
            const SF = [], SB = [], SR = [], n = 9;
            for (let i = 0; i < n; i++) {
              const y0 = hy + 380 + i * 46 + Math.sin(i * 1.7) * 3, dx = (i % 2 ? 14 : -10) + Math.sin(lt * 0.8 + i) * 2, a0 = x0 + 80 + dx, a1 = x1 - 80 + dx;
              const pg = [[a0, y0], [a1, y0 - 3], [a1 + 4, y0 + 40], [a0 - 3, y0 + 42]];
              SF.push(loopS(pg, k + 500 + i, t, 0.4, false));
              if (i % 2 === 0) SB.push(loopS([[a0 + 40, y0 + 8], [a1 - 40, y0 + 6], [a1 - 40, y0 + 22], [a0 + 40, y0 + 24]], k + 520 + i, t, 0.3, false));
              SR.push(ringS(pg, k + 540 + i, t, 3, 0.4, false));
              [a0 + 18, a1 - 18].forEach((hx2, j) => SR.push(inkDot(hx2, y0 + 20, 5, 5, k + 560 + i * 2 + j, t)));
            }
            prn.stack.setAttribute('d', SF.join(' ')); prn.stackB.setAttribute('d', SB.join(' ')); prn.stackR.setAttribute('d', SR.join(' '));
            const pl = rect(x0 + 300, hy + 205, x1 - 150, hy + 260);
            prn.plate.setAttribute('d', loopS(pl, k + 580, t, 0.4, false)); prn.plateR.setAttribute('d', ringS(pl, k + 581, t, 3, 0.4, false) + ' ' + [0, 1, 2, 3].map(i => lineS([[x0 + 320 + i * 40, hy + 222], [x0 + 340 + i * 40, hy + 244]], k + 582 + i, t, 3, 0.3)).join(' '));
            const blink = Math.sin(lt * 9) > 0 ? 1 : 0.25;
            prn.lamp.setAttribute('d', inkDot(x1 - 80, hy + 230, 18, 18, k + 37, t)); prn.lamp.setAttribute('fill-opacity', f1(blink));
            prn.dial.setAttribute('d', [0, 1, 2].map(i => inkCircle(x0 + 110 + i * 90, hy + 230, 26, k + 38 + i, t, { fill: true })).join(' '));
            // print-head carriage shuttling across the slot
            const hx = sx - S.w / 2 + (0.5 + 0.5 * Math.sin(lt * 14)) * S.w;
            prnFront.lip.setAttribute('d', loopS(rect(x0 - 10, hy - 26, x1 + 10, hy + 22), k + 40, t, 0.4, false));
            prnFront.r.setAttribute('d', ringS(rect(x0 - 10, hy - 26, x1 + 10, hy + 22), k + 41, t, 5, 0.4, false) + ' ' + loopS(rect(hx - 26, hy - 40, hx + 26, hy - 4), k + 42, t, 0.4, false));
          }
          if (mode === 'feed' && FD.top != null) {   // the rail the paper runs over into the stacker
            const ry = FD.top * H, x0 = sx - S.w / 2 - 60, x1 = sx + S.w / 2 + 60;
            prnFront.rail = prnFront.rail || inkEl(prnFront.r.parentNode, mix(INK.paperDark, INK.ink, 0.35));
            prnFront.rail.setAttribute('d', loopS(rect(x0, ry - 22, x1, ry + 14), k + 44, t, 0.4, false) + ' ' + ringS(rect(x0, ry - 22, x1, ry + 14), k + 45, t, 5, 0.4, false));
          }
          // narrator's fingers over the sheet edge
          if (kr) grip.setAttribute('d', inkDot(kr.hand[0], kr.hand[1] + 6, 16 * kr.sc, 16 * kr.sc, k + 50, t) + ' ' + inkDot(kr.hand2[0], kr.hand2[1] + 6, 16 * kr.sc, 16 * kr.sc, k + 51, t));
          else grip.setAttribute('d', '');
          if (sig) {
            const to = sh.toScreen([sh.colX(sh.hl), (sh.row0 + 1) * sh.rowH]);
            sig.update(lt, t, [P.signal.from[0] * W, P.signal.from[1] * H], [to[0], to[1] - 40], 1);
          }
          if (pen) {
            const tipL = sh.penTip, rest = sh.toScreen([S.w * 0.93, S.h * 0.8]);
            const tip = tipL ? sh.toScreen(tipL) : [rest[0] + Math.sin(lt * 1.5) * 8, rest[1]];
            const dir = [0.26, 0.97], L = 210, back = [tip[0] + dir[0] * L, tip[1] + dir[1] * L];
            pen.body.setAttribute('d', lineS([[tip[0] + dir[0] * 22, tip[1] + dir[1] * 22], back], k + 60, t, 15, 0.3, 0.1));
            pen.bodyR.setAttribute('d', lineS([[tip[0] + dir[0] * 22, tip[1] + dir[1] * 22], back], k + 61, t, 3, 0.3) + ' ' + lineS([[back[0] - dir[0] * 60 - 9, back[1] - dir[1] * 60 + 4], [back[0] - dir[0] * 20 - 9, back[1] - dir[1] * 20 + 4]], k + 62, t, 3, 0.3));
            pen.tip.setAttribute('d', loopS([[tip[0], tip[1]], [tip[0] + dir[0] * 24 + 7, tip[1] + dir[1] * 24 - 3], [tip[0] + dir[0] * 24 - 7, tip[1] + dir[1] * 24 + 3]], k + 63, t, 0.3, false));
            const hc = [tip[0] + dir[0] * 120, tip[1] + dir[1] * 120], hp = ell(hc[0] + 6, hc[1], 34, 26, 10);
            pen.hand.setAttribute('d', loopS(hp, k + 67, t, 0.4));
            pen.handR.setAttribute('d', ringS(hp, k + 68, t, 4, 0.4) + ' ' + lineS([[hc[0] - 30, hc[1] - 8], [hc[0] - 46, hc[1] - 30]], k + 69, t, 4, 0.3) + ' ' + lineS([[hc[0] + 34, hc[1] - 6], [hc[0] + 40, hc[1] - 24]], k + 70, t, 4, 0.3));
            pen.arm.setAttribute('d', lineS([[hc[0] + 10, hc[1] + 22], [hc[0] + 70, hc[1] + 430]], k + 64, t, 7, 0.4) + ' ' + lineS([[hc[0] + 36, hc[1] + 8], [hc[0] + 120, hc[1] + 420]], k + 65, t, 7, 0.4));
          }
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ radio dish (side view, pointing along `ang`)
  function dish(parent, sd) {
    const tower = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.2)), back = inkEl(parent, METAL()), inner = inkEl(parent, INK.paperLight), innerS = inkEl(parent, mix(INK.paperLight, INK.blue, 0.12)), rim = inkEl(parent), feed = inkEl(parent, INK.ink);
    return {
      update(t, x, y, s, ang, lt = 0) {
        const k = sd * 3, R = 170 * s, a = ang * Math.PI / 180, d = [Math.cos(a), -Math.sin(a)], p = [-d[1], d[0]];
        const c = [x, y - 300 * s];
        const pt = (u, v) => [c[0] + p[0] * u + d[0] * v, c[1] + p[1] * u + d[1] * v];
        // tower: an A-frame from the ground up to the mount
        const m = pt(0, -R * 0.35);
        tower.setAttribute('d', [lineS([[x - 120 * s, y], m], k + 1, t, 12 * s, 0.4), lineS([[x + 120 * s, y], m], k + 2, t, 12 * s, 0.4), lineS([[x - 70 * s, y - 120 * s], [x + 70 * s, y - 120 * s]], k + 3, t, 7 * s, 0.4),
          lineS([[x - 150 * s, y + 4], [x + 150 * s, y + 4]], k + 4, t, 14 * s, 0.4)].join(' '));
        const bk = [], rm = [];
        for (let i = 0; i <= 14; i++) { const th = i / 14 * Math.PI; bk.push(pt(R * Math.cos(th), -R * 0.5 * Math.sin(th))); }
        for (let i = 0; i < 18; i++) { const th = i / 18 * Math.PI * 2; rm.push(pt(R * Math.cos(th), R * 0.24 * Math.sin(th))); }
        back.setAttribute('d', loopS(bk, k + 5, t, 0.5, true));
        inner.setAttribute('d', loopS(rm, k + 6, t, 0.5));
        innerS.setAttribute('d', [-0.5, 0, 0.5].map((u, i) => lineS([pt(R * u, -R * 0.22 * Math.sqrt(1 - u * u)), pt(R * u, R * 0.22 * Math.sqrt(1 - u * u))], k + 7 + i, t, 3, 0.4)).join(' '));
        const f = pt(0, R * 0.95);
        rim.setAttribute('d', [ringS(rm, k + 10, t, 6 * Math.max(0.7, s), 0.5), lineS(bk, k + 11, t, 6 * Math.max(0.7, s), 0.5),
          lineS([pt(-R * 0.8, R * 0.1), f], k + 12, t, 4 * s, 0.4), lineS([pt(R * 0.8, R * 0.1), f], k + 13, t, 4 * s, 0.4), lineS([pt(0, -R * 0.1), f], k + 14, t, 4 * s, 0.4)].join(' '));
        feed.setAttribute('d', inkDot(f[0], f[1], 16 * s, 16 * s, k + 15, t));
        return { focus: f, center: c };
      },
    };
  }

  // ------------------------------------------------------------------ dashed circle + teapot stars
  function skyMarks(parent, sd) {
    const tea = inkEl(parent, INK.inkSoft), teaS = inkEl(parent, INK.paperLight), teaR = inkEl(parent), dash = inkEl(parent, INK.red), flare = inkEl(parent, INK.gold), flareR = inkEl(parent, INK.gold), q = el(parent, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.red });
    q.textContent = '?';
    const TP = [[-1, 0.3], [-0.45, 0.05], [-0.35, 0.6], [0.12, 0.62], [0.15, 0.05], [0.6, -0.08], [0.78, 0.48], [0.32, -0.5]];
    const ED = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1], [4, 5], [5, 6], [6, 3], [4, 7], [7, 5]];
    return {
      update(lt, t, o) {
        const k = sd * 3;
        if (o.teapot) {
          const [tx, ty, ts] = o.teapot, S = TP.map(([u, v]) => [tx + u * ts, ty + v * ts]);
          tea.setAttribute('d', ED.map(([a, b], i) => lineS([S[a], S[b]], k + 1 + i, t, 3, 0.4)).join(' '));
          teaS.setAttribute('d', S.map((s, i) => inkDot(s[0], s[1], 11, 11, k + 20 + i, t)).join(' '));
          teaR.setAttribute('d', S.map((s, i) => inkCircle(s[0], s[1], 11, k + 40 + i, t, { w: 3, amp: 0.3 })).join(' '));
        }
        const [cx, cy] = o.spot, r = o.r;
        const n = 22, D = [];
        for (let i = 0; i < n; i++) { if (i % 2) continue; const a0 = i / n * Math.PI * 2 + lt * 0.15, a1 = (i + 1) / n * Math.PI * 2 + lt * 0.15; D.push(lineS([[cx + Math.cos(a0) * r, cy + Math.sin(a0) * r], [cx + Math.cos((a0 + a1) / 2) * r, cy + Math.sin((a0 + a1) / 2) * r], [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r]], k + 60 + i, t, 5, 0.4)); }
        dash.setAttribute('d', D.join(' '));
        const fl = o.flare || 0;
        if (fl > 0.02) {
          const R0 = 40 * fl * (1 + 0.2 * Math.sin(lt * 14)), pts = [];
          for (let j = 0; j < 12; j++) { const a = j * Math.PI / 6 + lt * 0.8, rad = j % 2 ? R0 * 0.35 : R0; pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]); }
          flare.setAttribute('d', loopS(pts, k + 90, t, 0.5, false));
          const rings = [];
          for (let j = 0; j < 3; j++) { const u = ((lt * 1.2 + j / 3) % 1), rr = R0 * 0.8 + u * r * 1.1; if (u < 0.95) rings.push(inkCircle(cx, cy, rr, k + 95 + j, t, { w: 5 * (1 - u) * fl + 0.5, amp: 0.4 })); }
          flareR.setAttribute('d', rings.join(' '));
        } else { flare.setAttribute('d', ''); flareR.setAttribute('d', ''); }
        const qa = o.ask;
        if (qa > 0.01) { const sz = r * 2.1 * lerp(0.4, 1, qa); q.setAttribute('font-size', f1(sz)); q.setAttribute('x', f1(cx)); q.setAttribute('y', f1(cy + sz * 0.36)); q.setAttribute('opacity', f1(clamp01(qa * 3))); }
        else q.setAttribute('opacity', 0);
      },
    };
  }

  // ================================================================== ws_sky
  SH.ws_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 8301, top = el(svg, 'g'), root = el(top, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const stars = window.TD.stars(el(root, 'g'), sd + 1, W, H, P.stars ?? 22, 0.08, (P.gy ?? 0.6) * 0.82);
      const sp = [(P.spot || [0.62, 0.2])[0] * W, (P.spot || [0.62, 0.2])[1] * H], r = P.r ?? 90;
      const beams = inkEl(root, INK.gold), rings = inkEl(root, INK.gold);
      const marks = skyMarks(el(root, 'g'), sd + 2);
      const fg = foreground(el(root, 'g'), sd + 5, W, H, P.fg === undefined ? 'grass' : P.fg);
      const dl = (P.dishes || []).map((D, i) => ({ D, d: dish(el(root, 'g'), sd + 20 + i * 11) }));
      const kas = P.kasif ? figure(el(root, 'g'), P.kasif, sd + 8) : null;
      const cnt = P.counter ? el(top, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` }) : null;
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5)), k = sd;
          stars.update(lt);
          const F = P.flare ? (() => { const a = atOr(cues, P.flare.at, 0), g = atOr(cues, P.flare.gone, null); let v = lt >= a ? spring(lt, a, 0.4) : 0; if (g != null && lt >= g) v *= 1 - prog(lt, g, 0.5); return v; })() : 0;
          const qa = P.ask != null ? (() => { const a = atOr(cues, P.ask, null); return a != null && lt >= a ? spring(lt, a, 0.5) * (1 + 0.1 * punch(lt, a)) : 0; })() : 0;
          marks.update(lt, t, { teapot: P.teapot === false ? null : (P.teapot ? [P.teapot[0] * W, P.teapot[1] * H, P.teapot[2] ?? 150] : [sp[0] - 260, sp[1] + 210, 140]), spot: sp, r: r * (1 + 0.05 * hit), flare: F, ask: qa });
          if (fg) fg.update(lt, t, gy);
          const B = [], Rg = [];
          dl.forEach(({ D, d }, i) => {
            const x = D.x * W, s = D.s ?? 1, base = [x, gy + (D.dy ?? 0)];
            const c0 = [x, base[1] - 300 * s], ang = Math.atan2(c0[1] - sp[1], sp[0] - c0[0]) * 180 / Math.PI;
            const a = atOr(cues, D.at, 0), turn = lt >= a ? progIO(lt, a, 0.8) : 0;
            const out = d.update(t, x, base[1], s, lerp(D.from ?? 90, ang, turn), lt);
            if (turn > 0.5) {   // dashed beam up to the spot
              const f = out.focus, n = 14, len = clamp01((lt - a - 0.4) / 0.8);
              for (let j = 0; j < n * len; j += 2) { const u0 = j / n, u1 = Math.min(1, (j + 1) / n); B.push(lineS([[lerp(f[0], sp[0], u0), lerp(f[1], sp[1], u0)], [lerp(f[0], sp[0], u1), lerp(f[1], sp[1], u1)]], k + 300 + i * 20 + j, t, 4, 0.4)); }
            }
            if (P.listen != null && i === 0) {
              const la = atOr(cues, P.listen, 0);
              if (lt >= la) {
                const f = out.focus, dx = f[0] - sp[0], dy = f[1] - sp[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
                for (let j = 0; j < 5; j++) {
                  const u = ((lt - la) * 0.45 + j / 5) % 1, cx = sp[0] + dx * u, cy = sp[1] + dy * u, wdt = 70 + 110 * u, pts = [];
                  for (let m = -4; m <= 4; m++) { const v = m / 4; pts.push([cx - uy * v * wdt + ux * (1 - v * v) * 24, cy + ux * v * wdt + uy * (1 - v * v) * 24]); }
                  if (u > 0.05 && u < 0.92) Rg.push(lineS(pts, k + 400 + j, t, 7 * Math.sin(Math.PI * u) + 1, 0.4, 0.6));
                }
              }
            }
          });
          beams.setAttribute('d', B.join(' ')); rings.setAttribute('d', Rg.join(' '));
          if (kas) kas.update(lt, t, cues, W, H);
          if (cnt) {
            const C = P.counter, a = atOr(cues, C.at, 0.2), p = lt >= a ? progIO(lt, a, C.dur ?? 2) : 0;
            const v = Math.round(lerp(C.from ?? 1977, C.to ?? 2024, p)), b = boil(sd + 9, t, 1.2), size = C.size ?? 150;
            cnt.textContent = String(v) + (p >= 1 && C.suffix ? C.suffix : '');
            cnt.setAttribute('font-size', size); cnt.setAttribute('x', f1((C.x ?? 0.5) * W + b[0])); cnt.setAttribute('y', f1((C.y ?? 0.42) * H + b[1]));
            cnt.setAttribute('opacity', f1(lt >= a - 0.2 ? 1 : 0));
          }
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ws_ear
  SH.ws_ear = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 8501, top = el(svg, 'g'), root = el(top, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const stars = window.TD.stars(el(root, 'g'), sd + 1, W, H, P.stars ?? 18, 0.08, (P.gy ?? 0.6) * 0.5);
      const plane = inkEl(root, METAL()), planeL = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.35)), truss = inkEl(root, mix(INK.ink, INK.inkSoft, 0.25));
      const flatF = inkEl(root, METAL()), paraF = inkEl(root, METAL()), structR = inkEl(root);
      const hutF = inkEl(root, INK.paperDark), hutR = inkEl(root), hutW = inkEl(root, INK.gold);
      const fg = foreground(el(root, 'g'), sd + 5, W, H, P.fg === undefined ? 'grass' : P.fg);
      const pulses = inkEl(root, INK.gold), beam = inkEl(root, GLOW()), flash = inkEl(root, INK.gold), star = inkEl(root, INK.gold), starR = inkEl(root);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hitA = atOr(cues, P.hit, cue(cues, 'hit', dur * 0.6)), hit = punch(lt, hitA);
          stars.update(lt);
          // ground plane (aluminium sheet seen slightly from above, receding grid)
          const pl = [[60, gy - 34], [W - 120, gy - 34], [W - 40, gy + 40], [20, gy + 40]];
          plane.setAttribute('d', loopS(pl, k + 1, t, 0.4, false));
          const G = [];
          for (let i = 1; i < 12; i++) { const u = i / 12; G.push(lineS([[lerp(60, W - 120, u), gy - 34], [lerp(20, W - 40, u), gy + 40]], k + 10 + i, t, 2, 0.3)); }
          G.push(lineS([[40, gy + 3], [W - 80, gy + 3]], k + 30, t, 2, 0.3));
          planeL.setAttribute('d', G.join(' '));
          // flat reflector (left): tilted slab with a lattice behind
          const fb = [150, gy - 30], ft = [300, gy - 500], fw = 70;   // flat reflector: a tilted face seen from the front-left
          const flat = [[fb[0] - fw, fb[1]], [ft[0] - fw, ft[1]], [ft[0] + fw, ft[1] + 14], [fb[0] + fw, fb[1]]];
          flatF.setAttribute('d', loopS(flat, k + 2, t, 0.5, false));
          const FG = [];
          for (let i = 1; i < 6; i++) { const v = i / 6; FG.push(lineS([[lerp(flat[0][0], flat[1][0], v), lerp(flat[0][1], flat[1][1], v)], [lerp(flat[3][0], flat[2][0], v), lerp(flat[3][1], flat[2][1], v)]], k + 80 + i, t, 2.5, 0.3)); }
          for (let i = 1; i < 3; i++) { const u = i / 3; FG.push(lineS([[lerp(flat[0][0], flat[3][0], u), flat[0][1]], [lerp(flat[1][0], flat[2][0], u), lerp(flat[1][1], flat[2][1], u)]], k + 90 + i, t, 2.5, 0.3)); }
          // parabolic reflector (right): curved wall concave to the left
          const para = [], paraIn = [];
          for (let i = 0; i <= 10; i++) { const v = i / 10, y = gy - 30 - v * 360, x = W - 110 - 110 * (v - 0.5) * (v - 0.5) * 4 + 40 * v; para.push([x, y]); paraIn.push([x - 40, y]); }
          paraF.setAttribute('d', loopS(para.concat(paraIn.slice().reverse()), k + 3, t, 0.5, false));
          const T = [];
          for (let i = 0; i < 6; i++) { const v = i / 5, a = [lerp(fb[0], ft[0], v), lerp(fb[1], ft[1], v)]; T.push(lineS([a, [Math.max(14, a[0] - 120 * v - 30), gy - 30]], k + 40 + i, t, 4, 0.4)); }
          T.push(lineS([[20, gy - 30], [ft[0] - 60, ft[1] + 40]], k + 50, t, 4, 0.4));
          para.forEach((p, i) => { if (i % 2 === 0) T.push(lineS([p, [Math.min(W - 20, p[0] + 50), gy - 30]], k + 60 + i, t, 4, 0.4)); });
          truss.setAttribute('d', T.join(' '));
          structR.setAttribute('d', [FG.join(' '), para.map((q, i) => i % 2 ? '' : lineS([q, paraIn[i]], k + 95 + i, t, 3, 0.3)).join(' '), ringS(flat, k + 4, t, 6, 0.5, false), lineS(para, k + 5, t, 6, 0.5), lineS(paraIn, k + 6, t, 5, 0.5), lineS([para[10], paraIn[10]], k + 7, t, 5, 0.4)].join(' '));
          // feed horn hut in the middle of the plane
          const hx = 520, hut = [[hx - 60, gy - 30], [hx - 60, gy - 120], [hx + 60, gy - 120], [hx + 60, gy - 30]];
          hutF.setAttribute('d', loopS(hut, k + 8, t, 0.5, false));
          hutR.setAttribute('d', ringS(hut, k + 9, t, 5, 0.5, false) + ' ' + lineS([[hx - 75, gy - 120], [hx, gy - 165], [hx + 75, gy - 120]], k + 70, t, 6, 0.5) + ' ' + lineS([[hx + 40, gy - 120], [hx + 70, gy - 150], [hx + 100, gy - 150]], k + 71, t, 5, 0.4));
          hutW.setAttribute('d', loopS(rect(hx - 30, gy - 95, hx + 10, gy - 60), k + 72, t, 0.4, false));
          // signal path: star -> flat reflector -> parabola -> feed horn
          const st = [(P.star || [0.2, 0.12])[0] * W, (P.star || [0.2, 0.12])[1] * H];
          const pf = [lerp(fb[0], ft[0], 0.62) + fw * 0.4, lerp(fb[1], ft[1], 0.62)], pp = [para[5][0] - 40, para[5][1]], ph = [hx + 70, gy - 150];
          const path = [st, pf, pp, ph], segL = [], tot = [0];
          for (let i = 0; i < 3; i++) { segL.push(Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1])); tot.push(tot[i] + segL[i]); }
          const at = s => { s = Math.max(0, Math.min(tot[3] - 0.01, s)); let i = 0; while (s > tot[i + 1]) i++; const u = (s - tot[i]) / segL[i]; return { p: [lerp(path[i][0], path[i + 1][0], u), lerp(path[i][1], path[i + 1][1], u)], d: [(path[i + 1][0] - path[i][0]) / segL[i], (path[i + 1][1] - path[i][1]) / segL[i]] }; };
          const aA = atOr(cues, P.arrive, 0.1);
          const PU = [], BM = [];
          if (lt >= aA) {
            const head = (lt - aA) * 900;
            for (let s = 0; s < Math.min(head, tot[3]); s += 30) { const a = at(s), b = at(Math.min(s + 15, tot[3])); BM.push(lineS([a.p, b.p], k + 100 + ((s / 30) | 0) % 40, t, 4, 0.3)); }
            for (let j = 0; j < 9; j++) {
              const s = ((lt - aA) * 520 + j * tot[3] / 9) % tot[3];
              if (s > head) continue;
              const a = at(s), n = [-a.d[1], a.d[0]], wdt = 34;
              PU.push(lineS([[a.p[0] - n[0] * wdt, a.p[1] - n[1] * wdt], [a.p[0] + a.d[0] * 10, a.p[1] + a.d[1] * 10], [a.p[0] + n[0] * wdt, a.p[1] + n[1] * wdt]], k + 200 + j, t, 7, 0.4, 0.6));
            }
          }
          pulses.setAttribute('d', PU.join(' ')); beam.setAttribute('d', BM.join(' '));
          const fl = lt >= hitA ? Math.max(0.35, 1 - (lt - hitA) * 0.8) * (1 + 0.15 * Math.sin(lt * 12)) : 0;
          flash.setAttribute('d', fl > 0.02 ? [0, 1].map(j => inkCircle(ph[0], ph[1], (36 + j * 40) * fl * (1 + hit * 0.5), k + 300 + j, t, { w: 6 - j * 2, amp: 0.4 })).join(' ') + ' ' + inkDot(ph[0], ph[1], 18 * fl, 18 * fl, k + 302, t) : '');
          const R0 = 38 * (1 + 0.15 * Math.sin(lt * 6)), sp = [];
          for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4 + lt * 0.6, rad = j % 2 ? R0 * 0.36 : R0; sp.push([st[0] + Math.cos(a) * rad, st[1] + Math.sin(a) * rad]); }
          star.setAttribute('d', loopS(sp, k + 400, t, 0.6, false)); starR.setAttribute('d', ringS(sp, k + 401, t, 3, 0.6, false));
          if (fg) fg.update(lt, t, gy + 40);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ws_cloud
  SH.ws_cloud = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const sd = seed * 1000 + 8701, top = el(svg, 'g'), root = el(top, 'g');
      const stars = window.TD.stars(el(root, 'g'), sd + 1, W, H, P.stars ?? 30, 0.05, 0.62);
      const CL = P.cloud || [0.6, 0.42, 250, 160], cx = CL[0] * W, cy = CL[1] * H, rx = CL[2], ry = CL[3];
      const MG = P.mag || [0.22, 0.16], mx = MG[0] * W, my = MG[1] * H;
      const cloudF = inkEl(root, INK.blue, { 'fill-opacity': 0.22 }), cloudG = inkEl(root, INK.gold, { 'fill-opacity': 0 }), cloudH = inkEl(root, mix(INK.blue, INK.ink, 0.25)), cloudR = inkEl(root, INK.blue);
      const ring = inkEl(root, INK.gold), beamG = inkEl(root, INK.gold), beamL = inkEl(root, GLOW());
      const magField = inkEl(root, INK.inkSoft), magBeam = inkEl(root, GLOW()), magF = inkEl(root, mix(INK.ink, INK.blue, 0.3)), magR = inkEl(root), magH = inkEl(root, INK.paperLight);
      const eF = inkEl(root, mix(INK.blue, INK.paperLight, 0.3)), eAtm = inkEl(root, mix(INK.blue, INK.paperLight, 0.45)), eR = inkEl(root);
      const eid = 'wsearth' + (sd % 100000) + '_' + (clipN++), ecp = el(defs, 'clipPath', { id: eid }), ecr = el(ecp, 'path'), eG = el(root, 'g', { 'clip-path': `url(#${eid})` });
      const eLand = inkEl(eG, mix(INK.green, INK.paperLight, 0.2)), eLandR = inkEl(eG, mix(INK.green, INK.ink, 0.4)), eCl = inkEl(eG, mix(INK.blue, INK.ink, 0.35));
      root.appendChild(eR);
      const blob = []; const rr = rng(sd + 77);
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, k2 = 0.82 + rr() * 0.3; blob.push([Math.cos(a) * rx * k2, Math.sin(a) * ry * k2]); }
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          stars.update(lt);
          // magnetar: dense ball, dipole loops, two lighthouse beams turning
          const spin = lt * 2.2, MR = 46;
          const LP = [];
          [-1, 1].forEach(sx => [1, 1.7].forEach((m, j) => { const pts = []; for (let i = 0; i <= 16; i++) { const th = i / 16 * Math.PI; const r_ = MR * 1.2 * m * 2 * Math.sin(th) ** 2 + MR * 0.9; pts.push([mx + sx * r_ * Math.sin(th), my - r_ * Math.cos(th)]); } LP.push(lineS(pts, k + 10 + j + (sx + 1) * 2, t, 2.5, 0.4)); }));
          magField.setAttribute('d', LP.join(' '));
          const fa = atOr(cues, P.flare, 0.3), fp = lt >= fa ? clamp01((lt - fa) / 1.4) : 0;
          const MB = [];
          [0, Math.PI].forEach((o2, j) => { const a = spin + o2, L = (P.beam ?? 150) * (1 + fp * 0.5), w2 = 26; MB.push(loopS([[mx, my], [mx + Math.cos(a - 0.12) * L, my + Math.sin(a - 0.12) * L], [mx + Math.cos(a + 0.12) * L, my + Math.sin(a + 0.12) * L]], k + 20 + j, t, 0.5, false)); void w2; });
          magBeam.setAttribute('d', MB.join(' '));
          magF.setAttribute('d', inkCircle(mx, my, MR * (1 + 0.25 * punch(lt, fa)), k + 30, t, { fill: true }));
          magR.setAttribute('d', inkCircle(mx, my, MR * (1 + 0.25 * punch(lt, fa)), k + 31, t, { w: 5 }));
          magH.setAttribute('d', [0, 1, 2].map(i => lineS([[mx - MR * 0.5 + i * 18, my - MR * 0.6], [mx - MR * 0.7 + i * 22, my + MR * 0.5]], k + 32 + i, t, 3, 0.4)).join(' '));
          // flare ring expanding towards the cloud
          const dC = Math.hypot(cx - mx, cy - my) - rx * 0.5;
          const R2 = [];
          if (fp > 0 && fp < 1) for (let j = 0; j < 3; j++) { const u = clamp01(fp - j * 0.1); if (u > 0) R2.push(inkCircle(mx, my, MR + u * dC, k + 40 + j, t, { w: (j === 0 ? 16 : 7) * (1 - 0.6 * u) + 3, amp: 0.5, n: 24 })); }
          ring.setAttribute('d', R2.join(' '));
          // the cloud lights up when the ring arrives, then sends a thin beam to the Earth
          const glow = lt >= fa + 1.3 ? spring(lt, fa + 1.3, 0.6) : 0, br = Math.sin(lt * 5) * 0.08;
          const pts = blob.map(([x, y], i) => [cx + x * (1 + 0.03 * Math.sin(lt * 1.3 + i)), cy + y * (1 + 0.03 * Math.cos(lt * 1.1 + i))]);
          cloudF.setAttribute('d', loopS(pts, k + 50, t, 1.2));
          cloudG.setAttribute('d', loopS(pts.map(([x, y]) => [cx + (x - cx) * 0.86, cy + (y - cy) * 0.86]), k + 51, t, 1.2));
          cloudG.setAttribute('fill-opacity', f1(clamp01(glow * (0.75 + br))));
          const Hh = [];
          for (let i = -6; i <= 6; i++) { const x0 = cx + i * rx * 0.13; Hh.push(lineS([[x0 - 40, cy + ry * 0.55 * Math.cos(i / 7)], [x0 + 40, cy - ry * 0.55 * Math.cos(i / 7)]], k + 60 + i, t, 2.5, 0.5)); }
          cloudH.setAttribute('d', Hh.join(' '));
          cloudR.setAttribute('d', inkPath(pts, { w: 4, seed: k + 80, t, closed: true, amp: 1 }));
          cloudR.setAttribute('fill', glow > 0.5 ? INK.gold : INK.blue);
          const ey = (P.earth ?? 0.69) * H, ER = P.earthR ?? 950, ecx = W * 0.5, ecy = ey + ER;
          {   // the Earth seen from space: ocean disc, hatched continents, curved latitude lines, thin atmosphere ring
            const lim = []; for (let i = 0; i <= 30; i++) { const a = -Math.PI / 2 + (i / 30 - 0.5) * 1.5; lim.push([ecx + Math.cos(a) * ER, ecy + Math.sin(a) * ER]); }
            const body = lim.concat([[W + 300, H + 60], [-300, H + 60]]);
            eAtm.setAttribute('d', inkPath(lim.map(([x, y]) => [ecx + (x - ecx) * 1.035, ecy + (y - ecy) * 1.035]), { w: 10, seed: k + 100, t, amp: 0.4 }));
            eF.setAttribute('d', loopS(body, k + 101, t, 0.5)); ecr.setAttribute('d', loopS(body, k + 101, t, 0.5));
            const rot = lt * 10, LD = [], LR = [];
            [[0.12, 0.16, 190, 120], [0.46, 0.3, 230, 150], [0.82, 0.14, 170, 110], [0.66, 0.6, 210, 120], [0.22, 0.62, 160, 100]].forEach(([u, v], i) => {
              const x = ((u * (W + 400) + rot) % (W + 400)) - 200, y = ey + v * (H - ey), pts = [];
              const a = [190, 230, 170, 210, 160][i], b = [120, 150, 110, 120, 100][i];
              for (let j = 0; j < 14; j++) { const th = j / 14 * Math.PI * 2, kk = 0.62 + hn(sd + i, j) * 0.55; pts.push([x + Math.cos(th) * a * kk, y + Math.sin(th) * b * kk]); }
              LD.push(loopS(pts, k + 110 + i, t, 0.6)); LR.push(ringS(pts, k + 120 + i, t, 4, 0.6));
              for (let j = -2; j <= 2; j++) LR.push(lineS([[x + j * a * 0.22 - 30, y + b * 0.3], [x + j * a * 0.22 + 30, y - b * 0.3]], k + 600 + i * 5 + j, t, 2.5, 0.4));
            });
            eLand.setAttribute('d', LD.join(' ')); eLandR.setAttribute('d', LR.join(' '));
            const CL_ = [];
            [0.2, 0.42, 0.68].forEach((f, i) => { const r_ = ER * (1 - f * 0.45), pts = []; for (let j = 0; j <= 24; j++) { const a = -Math.PI / 2 + (j / 24 - 0.5) * 1.5; pts.push([ecx + Math.cos(a) * ER * 1.0, ecy + Math.sin(a) * r_ + (ER - r_) * 0.2]); } CL_.push(lineS(pts, k + 130 + i, t, 3, 0.4)); });
            eCl.setAttribute('d', CL_.join(' '));
            eR.setAttribute('d', lineS(lim, k + 140, t, 7, 0.5));
          }
          const bp = lt >= fa + 1.6 ? prog(lt, fa + 1.6, 0.6) : 0;
          if (bp > 0) {
            const a = [cx + rx * 0.1, cy + ry * 0.7], b = [W * 0.58, ey + 6], e = [lerp(a[0], b[0], bp), lerp(a[1], b[1], bp)];
            const wv = []; for (let i = 0; i <= 14; i++) { const v = i / 14, x = lerp(a[0], e[0], v), y = lerp(a[1], e[1], v); wv.push([x + Math.sin(v * 20 - lt * 10) * 12, y]); }
            beamG.setAttribute('d', lineS(wv, k + 90, t, 6, 0.4, 0.4)); beamL.setAttribute('d', inkDot(e[0], e[1], 22 * bp, 14 * bp, k + 91, t));
          } else { beamG.setAttribute('d', ''); beamL.setAttribute('d', ''); }
          void hit;
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
