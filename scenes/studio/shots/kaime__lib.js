// kaime__lib: shared drawing helpers for the kaime_* shots (Ottoman paper money, 1840-1879). Not a shot type itself.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything is a pure function of (seed, t); no Math.random.
// window.KMA = {
//   atOr(cues, name|sec, fb), f1, faceOf, dirOf,
//   note(parent, seed) -> {g, update(t, o)}: a kaime banknote in local coords (centre 0,0). o: {w: 420, h: 270,
//     write: 0..1 (calligraphy drawn right-to-left, line by line), seal: 0..1 (red seal stamp springs in), burn: 0..1
//     (charred edge eats the note from the bottom, glowing rim), printed: true (ornate double frame + serial mark),
//     value: "100" (small denomination in the corner), ghost: 0..1 (pencil-grey copy look)} -> returns pen tip [x, y]
//   flame(parent, seed) -> {update(t, cx, by, w, h, k)}: three-layer ink flame (red, gold, paper core), 12 fps hand-drawn
//   smoke(parent, seed, n) -> {update(t, cx, by, w, top, k)}: rising ink-wash smoke curls (fill-opacity per path)
//   fig(parent, seed, o) -> {update(t, x, gy, s, pose)}: a period figure in silhouette (ink-wash long coat, red fez);
//     pose: {lean, armL: [x, y], armR: [x, y] (world px targets), face: 1|-1, walk: phase}
//   hand(parent, seed, o) -> {update(t, wrist, ang, s, kind, extra)}: a close-up hand with its sleeve.
//     o: {sleeve: "blue"|"dark"|"red", from: [x, y] (sleeve anchor, off-screen)}; kind: "pen" | "flat" | "stop" | "fist"
//   fore(parent, kind, seed) -> {update(t, W, H, gy)}: foreground below the ground line (cobbles | panel | hill)
//   kasif(parent, K, W, H, seed) -> {update(lt, t, cues)}: Kaşif with K = {x, y (0..1), scale, pose, face, dir,
//     emotion, seq: [{at, pose, dir, face, emotion}]}
// }
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const R = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const step12 = t => Math.floor(t * 12 + 1e-6);

  // ------------------------------------------------------------------ kaime note
  // one calligraphy line: a baseline written right-to-left with loops, tall alef strokes and dots (fixed per seed)
  function scriptLine(r, x0, x1, y, hgt) {
    const pts = [], dots = [], tall = [];
    let x = x1;
    pts.push([x, y]);
    while (x > x0) {
      const kind = r();
      const dx = 10 + r() * 16;
      if (kind < 0.18) {            // tall letter: up and back down
        tall.push([[x - 2, y], [x - 4, y - hgt * (1.1 + r() * 0.6)]]);
        x -= dx * 0.6; pts.push([x, y]);
      } else if (kind < 0.5) {      // loop below the line
        pts.push([x - dx * 0.4, y + hgt * 0.45], [x - dx * 0.9, y + hgt * 0.1]); x -= dx; pts.push([x, y]);
      } else if (kind < 0.75) {     // bowl above
        pts.push([x - dx * 0.5, y - hgt * 0.5]); x -= dx; pts.push([x, y]);
      } else { x -= dx; pts.push([x, y + (r() - 0.5) * 4]); }
      if (r() < 0.22) dots.push([x + dx * 0.4, y - hgt * (0.7 + r() * 0.4)]);
      if (r() < 0.12) { pts.push([x - 6, y]); x -= 14 + r() * 10; pts.push([x, y]); }   // word gap (kept joined: a drawn line)
    }
    return { pts, dots, tall };
  }

  function note(parent, seed) {
    const g = el(parent, 'g');
    const r = rng(inkHash(seed, 4401));
    const P = (fill, extra) => inkEl(g, fill, extra);
    const shadow = P(INK.ink, { 'fill-opacity': 0.16 });
    const body = P(INK.paperLight), rim = P(), frame1 = P(INK.inkSoft), frame2 = P(INK.inkSoft), corner = [P(INK.inkSoft), P(INK.inkSoft), P(INK.inkSoft), P(INK.inkSoft)];
    const tug = P(), tug2 = P();
    const lines = [0, 1, 2, 3, 4].map(() => ({ base: P(), tall: P(), dots: P() }));
    const sealF = P(INK.red, { 'fill-opacity': 0.85 }), sealR = P(INK.red), sealIn = P(INK.paperLight, { 'fill-opacity': 0.9 }), sealTx = P(INK.red);
    const val = el(g, 'text', { 'font-family': INK_FONT, 'text-anchor': 'middle', fill: INK.ink });
    const char = P(INK.ink), glow = P(INK.red), glow2 = P(INK.gold);
    // fixed geometry per seed (unit note 420 x 270; scaled in update)
    const L = lines.map((_, i) => scriptLine(r, -150, 150, -38 + i * 34, 13));
    const tugPts = [[-40, -96], [-30, -122], [-14, -100], [-4, -130], [6, -98], [20, -128], [30, -96], [44, -104], [56, -90], [20, -84], [-20, -84], [-56, -92]];
    const burnR = rng(inkHash(seed, 4402)), burnJ = Array.from({ length: 15 }, () => burnR());
    const cut = (pts, u) => {          // first u (0..1) of a polyline by count
      if (u >= 1) return pts;
      const n = Math.max(2, Math.floor(pts.length * u));
      return u <= 0 ? [] : pts.slice(0, n);
    };
    function update(t, o = {}) {
      const w = o.w ?? 420, h = o.h ?? 270, sx = w / 420, sy = h / 270;
      const S = p => [p[0] * sx, p[1] * sy];
      const k = seed * 50;
      const burn = clamp01(o.burn || 0), ghost = clamp01(o.ghost || 0);
      // the edge that is left: bottom edge rises with the burn (jagged)
      const yb = lerp(135, -150, burn);
      const edge = burnJ.map((j, i) => [lerp(210, -210, i / 14), Math.min(135, yb + (j - 0.5) * 34 * (burn > 0 ? 1 : 0) + Math.sin(i * 1.7 + t * 3) * 3 * (burn > 0 ? 1 : 0))]);
      const outline = burn > 0.001
        ? [[-210, -135], [210, -135], ...edge].map(S)
        : [[-210, -135], [0, -138], [210, -135], [212, 0], [210, 135], [0, 137], [-210, 135], [-212, 0]].map(S);
      if (burn > 0.97) { for (const e of [shadow, body, rim, frame1, frame2, tug, tug2, sealF, sealR, sealIn, sealTx, char, glow, glow2, ...corner]) e.setAttribute('d', ''); lines.forEach(l => { l.base.setAttribute('d', ''); l.tall.setAttribute('d', ''); l.dots.setAttribute('d', ''); }); val.textContent = ''; return [0, 0]; }
      shadow.setAttribute('d', inkLoop(outline.map(p => [p[0] + 10, p[1] + 12]), { seed: k + 1, t, amp: 0.6, smooth: false }));
      body.setAttribute('d', inkLoop(outline, { seed: k + 2, t, amp: 0.8, smooth: false }));
      body.setAttribute('fill', ghost > 0 ? mix(INK.paperLight, INK.paper, ghost) : INK.paperLight);
      rim.setAttribute('d', inkPath(outline, { w: 4.5, seed: k + 3, t, closed: true, smooth: false, amp: 1.2 }));
      const vis = y => y < yb - 18;     // drawn only above the burn line
      // frame
      if (o.printed !== false) {
        const fr = (m) => [[-210 + m, -135 + m], [210 - m, -135 + m], [210 - m, Math.min(135 - m, yb - 20)], [-210 + m, Math.min(135 - m, yb - 20)]].map(S);
        frame1.setAttribute('d', inkPath(fr(16), { w: 2.6, seed: k + 4, t, closed: burn < 0.05, smooth: false, amp: 0.8 }));
        frame2.setAttribute('d', inkPath(fr(24), { w: 1.6, seed: k + 5, t, closed: burn < 0.05, smooth: false, amp: 0.8 }));
        [[-186, -111], [186, -111], [186, 111], [-186, 111]].forEach((c, i) => corner[i].setAttribute('d', vis(c[1]) ? inkDot(c[0] * sx, c[1] * sy, 9 * sx, 9 * sy, k + 6 + i, t) : ''));
      } else { frame1.setAttribute('d', ''); frame2.setAttribute('d', ''); corner.forEach(c => c.setAttribute('d', '')); }
      // tugra-like flourish on top
      const wr = o.write ?? 1;
      tug.setAttribute('d', wr > 0.02 && vis(-90) ? inkPath(tugPts.map(S), { w: 4, seed: k + 10, t, amp: 1, taper: 0.5 }) : '');
      tug2.setAttribute('d', wr > 0.02 && vis(-90) ? inkPath([[-70, -80], [0, -76], [70, -80]].map(S), { w: 2.4, seed: k + 11, t, amp: 0.8 }) : '');
      // calligraphy, right to left, line after line
      let tip = null;
      const inkC = ghost > 0 ? INK.inkSoft : INK.ink;
      lines.forEach((ln, i) => {
        const u = clamp01(wr * lines.length - i), D = L[i];
        if (!vis(D.pts[0][1]) || u <= 0) { ln.base.setAttribute('d', ''); ln.tall.setAttribute('d', ''); ln.dots.setAttribute('d', ''); return; }
        const seg = cut(D.pts, u);
        ln.base.setAttribute('d', seg.length > 1 ? inkPath(seg.map(S), { w: 3.2, seed: k + 20 + i, t, amp: 0.7, taper: 0.4, smooth: true }) : '');
        ln.base.setAttribute('fill', inkC);
        const xMin = seg.length ? seg[seg.length - 1][0] : 999;
        ln.tall.setAttribute('d', D.tall.filter(s => s[0][0] >= xMin).map((s, j) => inkPath(s.map(S), { w: 3, seed: k + 40 + i * 9 + j, t, amp: 0.6, taper: 0.5 })).join(' '));
        ln.tall.setAttribute('fill', inkC);
        ln.dots.setAttribute('d', D.dots.filter(d => d[0] >= xMin).map((d, j) => inkDot(d[0] * sx, d[1] * sy, 3.6, 3.2, k + 70 + i * 9 + j, t)).join(' '));
        ln.dots.setAttribute('fill', inkC);
        if (u < 1 && seg.length) tip = S(seg[seg.length - 1]);
      });
      if (!tip) tip = S(L[Math.min(lines.length - 1, Math.floor(wr * lines.length))].pts[0]);
      // seal (bottom centre)
      const sp = clamp01(o.seal || 0), sc = sp > 0 ? spring(sp, 0, 1) : 0, scx = 0, scy = 92;
      if (sp > 0.01 && vis(scy - 30)) {
        const rad = 32 * sc;
        sealF.setAttribute('d', inkCircle(scx * sx, scy * sy, rad * Math.min(sx, sy) * 1.02, k + 80, t, { fill: true }));
        sealR.setAttribute('d', inkCircle(scx * sx, scy * sy, rad * Math.min(sx, sy) * 1.18, k + 81, t, { w: 3 }));
        sealIn.setAttribute('d', inkCircle(scx * sx, scy * sy, rad * Math.min(sx, sy) * 0.66, k + 82, t, { w: 2.2 }));
        sealTx.setAttribute('d', inkPath([[-14, 92], [-6, 84], [2, 96], [10, 86], [16, 94]].map(p => [p[0] * sx * sc, scy * sy + (p[1] - scy) * sy * sc]), { w: 2.6, seed: k + 83, t, amp: 0.5 }));
        sealTx.setAttribute('fill', INK.paperLight);
      } else for (const e of [sealF, sealR, sealIn, sealTx]) e.setAttribute('d', '');
      // denomination
      if (o.value && vis(-100)) {
        val.textContent = o.value; val.setAttribute('font-size', f1(50 * Math.min(sx, sy)));
        val.setAttribute('x', f1(-160 * sx)); val.setAttribute('y', f1(-82 * sy));
      } else val.textContent = '';
      // burn: charred band + glowing rim
      if (burn > 0.001) {
        const band = edge.map(p => [p[0], p[1] - 16]);
        char.setAttribute('d', inkLoop([...edge, ...band.slice().reverse()].map(S), { seed: k + 90, t, amp: 1.2, smooth: false }));
        glow.setAttribute('d', inkPath(edge.map(S), { w: 9, seed: k + 91, t, amp: 2, smooth: false }));
        glow2.setAttribute('d', inkPath(edge.map(p => S([p[0], p[1] + 3])), { w: 4, seed: k + 92, t, amp: 2, smooth: false }));
      } else for (const e of [char, glow, glow2]) e.setAttribute('d', '');
      return tip;
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ flame
  function flame(parent, seed) {
    const g = el(parent, 'g');
    const outer = inkEl(g, INK.red), mid = inkEl(g, INK.gold), core = inkEl(g, INK.paperLight), line = inkEl(g);
    // union of pointed tongues (wide base, sharp tip) over a low body: one cohesive fire silhouette
    function tongues(t, cx, by, w, h, k, n, sd) {
      const f = step12(t), r = rng(inkHash(sd, f)), T = [];
      for (let i = 0; i < n; i++) {
        const u = (i + 0.5) / n, env = Math.pow(Math.sin(Math.PI * (0.08 + 0.84 * u)), 0.7);
        T.push({ c: cx - w / 2 + u * w + Math.sin(t * 2.6 + i * 1.9 + sd) * w * 0.04 + (r() - 0.5) * w * 0.02,
          hh: h * k * env * (0.7 + 0.3 * Math.abs(Math.sin(t * 4.1 + i * 2.3 + sd))) * (0.9 + r() * 0.2), wd: w / n * 1.6 });
      }
      const pts = [[cx - w / 2, by]], N = 30;
      for (let j = 1; j < N; j++) {
        const x = cx - w / 2 + w * j / N, xe = Math.sin(Math.PI * j / N);
        let y = h * k * 0.3 * xe;
        for (const q of T) { const d = Math.abs(x - q.c) / q.wd; if (d < 1) y = Math.max(y, q.hh * Math.pow(1 - d, 1.15) * (1 - 0.25 * d * d)); }
        pts.push([x, by - y]);
      }
      pts.push([cx + w / 2, by], [cx + w * 0.25, by + 14], [cx - w * 0.25, by + 14]);
      return pts;
    }
    function update(t, cx, by, w, h, k = 1) {
      if (k <= 0.01) { for (const e of [outer, mid, core, line]) e.setAttribute('d', ''); return; }
      const o = tongues(t, cx, by, w, h, k, 5, seed);
      outer.setAttribute('d', inkLoop(o, { seed: seed + 1, t, amp: 2 }));
      line.setAttribute('d', inkPath(o, { w: 5, seed: seed + 2, t, closed: true, amp: 2 }));
      mid.setAttribute('d', inkLoop(tongues(t + 0.21, cx, by, w * 0.74, h * 0.7, k, 5, seed + 7), { seed: seed + 3, t, amp: 1.6 }));
      core.setAttribute('d', inkLoop(tongues(t + 0.43, cx, by, w * 0.46, h * 0.4, k, 3, seed + 13), { seed: seed + 4, t, amp: 1.2 }));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ smoke
  function smoke(parent, seed, n = 7) {
    const g = el(parent, 'g');
    const puffs = Array.from({ length: n }, (_, i) => ({ f: inkEl(g, INK.inkSoft, { 'fill-opacity': 0.12 }), r: inkEl(g, INK.inkSoft, { 'fill-opacity': 0.3 }), ph: i / n }));
    function update(t, cx, by, w, top, k = 1) {
      puffs.forEach((p, i) => {
        const u = ((t * 0.22 + p.ph) % 1), y = lerp(by, top, u), rad = (w * 0.18 + u * w * 0.4) * k;
        const x = cx + Math.sin(u * 5 + i * 1.3) * w * 0.25 * u + u * w * 0.3;
        const a = Math.sin(Math.PI * u);
        if (k <= 0.01 || a < 0.05) { p.f.setAttribute('d', ''); p.r.setAttribute('d', ''); return; }
        p.f.setAttribute('fill-opacity', (0.13 * a).toFixed(3));
        p.r.setAttribute('fill-opacity', (0.32 * a).toFixed(3));
        p.f.setAttribute('d', inkCircle(x, y, rad, seed + i * 3, t, { fill: true, n: 10 }));
        p.r.setAttribute('d', inkPath(inkEllipsePts(x, y, rad, rad, seed + i * 3, 10).slice(0, 7), { w: 3, seed: seed + i * 3 + 1, t, amp: 1.5 }));
      });
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ period figure in silhouette (fez, long coat)
  function fig(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const legL = P(), legR = P(), coat = P(o.coat === 'blue' ? INK.blue : INK.inkSoft), coatR = P(), armBack = P(INK.inkSoft), armBackR = P(),
      head = P(INK.paperDark), headR = P(), fez = P(INK.red), fezR = P(), tassel = P(), armF = P(INK.inkSoft), armFR = P(), hands = P(INK.paperDark), handsR = P();
    const beard = o.beard ? P(INK.ink) : null;
    const twoBone = (a, b, l1, l2, bend) => {
      let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
      const mx = l1 + l2 - 1; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
      const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d || 1))));
      return [[a[0] + Math.cos(base + bend * al) * l1, a[1] + Math.sin(base + bend * al) * l1], [a[0] + dx, a[1] + dy]];
    };
    function update(t, x, gy, s, pose = {}) {
      const k = seed * 40, face = pose.face ?? 1, lean = (pose.lean || 0) * Math.PI / 180;
      const br = Math.sin(t * 2 + seed) * 2 * s;
      const hip = [x, gy - 190 * s], neck = [x + Math.sin(lean) * 210 * s * face, gy - 400 * s + br];
      const hc = [neck[0] + Math.sin(lean) * 40 * s * face, neck[1] - 52 * s];
      const wk = pose.walk != null ? Math.sin(pose.walk * Math.PI * 2) * 30 * s : 0;
      legL.setAttribute('d', inkPath([hip, [x - 22 * s + wk, gy]], { w: 16 * s, seed: k + 1, t, amp: 1 }));
      legR.setAttribute('d', inkPath([hip, [x + 22 * s - wk, gy]], { w: 16 * s, seed: k + 2, t, amp: 1 }));
      // long coat: shoulders to knees, flared
      const sh = [neck[0], neck[1] + 14 * s];
      const cp = [[sh[0] - 40 * s, sh[1] + 6 * s], [sh[0] + 40 * s, sh[1] + 6 * s], [x + 62 * s, gy - 70 * s], [x, gy - 62 * s], [x - 62 * s, gy - 70 * s]];
      coat.setAttribute('d', inkLoop(cp, { seed: k + 3, t, amp: 1.2 }));
      coatR.setAttribute('d', inkPath(cp, { w: 4.5, seed: k + 4, t, closed: true, amp: 1.2 }));
      // arms (upper 92, fore 88)
      const shL = [sh[0] - 34 * s * face, sh[1] + 12 * s], shR = [sh[0] + 34 * s * face, sh[1] + 12 * s];
      const tL = pose.armL || [shL[0] - 10 * s * face, shL[1] + 170 * s], tR = pose.armR || [shR[0] + 10 * s * face, shR[1] + 170 * s];
      const [eL, hL] = twoBone(shL, tL, 92 * s, 88 * s, face);
      const [eR, hR] = twoBone(shR, tR, 92 * s, 88 * s, -face);
      armBack.setAttribute('d', inkPath([shL, eL, hL], { w: 26 * s, seed: k + 5, t, amp: 1, taper: 0.1 }));
      armBackR.setAttribute('d', inkPath([shL, eL, hL], { w: 4, seed: k + 6, t, amp: 1 }));
      armBackR.setAttribute('fill', INK.ink);
      armF.setAttribute('d', inkPath([shR, eR, hR], { w: 28 * s, seed: k + 7, t, amp: 1, taper: 0.1 }));
      armFR.setAttribute('d', inkPath([shR, eR, hR], { w: 4, seed: k + 8, t, amp: 1 }));
      hands.setAttribute('d', inkDot(hL[0], hL[1], 15 * s, 15 * s, k + 9, t) + ' ' + inkDot(hR[0], hR[1], 15 * s, 15 * s, k + 10, t));
      handsR.setAttribute('d', inkCircle(hL[0], hL[1], 15 * s, k + 11, t, { w: 3.5 }) + ' ' + inkCircle(hR[0], hR[1], 15 * s, k + 12, t, { w: 3.5 }));
      // head + fez
      head.setAttribute('d', inkCircle(hc[0], hc[1], 50 * s, k + 13, t, { fill: true }));
      headR.setAttribute('d', inkCircle(hc[0], hc[1], 50 * s, k + 14, t, { w: 5 }));
      if (beard) beard.setAttribute('d', inkLoop([[hc[0] - 34 * s, hc[1] + 16 * s], [hc[0] + 34 * s, hc[1] + 16 * s], [hc[0] + 22 * s * face, hc[1] + 62 * s], [hc[0] + 6 * s * face, hc[1] + 72 * s], [hc[0] - 18 * s, hc[1] + 54 * s]], { seed: k + 15, t }));
      const fz = [[hc[0] - 40 * s, hc[1] - 30 * s], [hc[0] + 40 * s, hc[1] - 30 * s], [hc[0] + 30 * s, hc[1] - 92 * s], [hc[0] - 30 * s, hc[1] - 92 * s]];
      fez.setAttribute('d', inkLoop(fz, { seed: k + 16, t, smooth: false, amp: 1 }));
      fezR.setAttribute('d', inkPath(fz, { w: 4, seed: k + 17, t, closed: true, smooth: false, amp: 1 }));
      const sw = Math.sin(t * 3 + seed) * 6 * s;
      tassel.setAttribute('d', inkPath([[hc[0], hc[1] - 92 * s], [hc[0] - 30 * s * face, hc[1] - 80 * s], [hc[0] - 44 * s * face + sw, hc[1] - 40 * s]], { w: 5 * Math.max(0.6, s), seed: k + 18, t, amp: 0.8 }));
      return { hc, hL, hR };
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ close-up hand with sleeve
  function hand(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const sleeveCol = o.sleeve === 'blue' ? INK.blue : o.sleeve === 'red' ? INK.red : INK.inkSoft;
    const sleeve = inkEl(g, sleeveCol), sleeveR = inkEl(g), folds = inkEl(g), cuff = inkEl(g, INK.paperDark), cuffR = inkEl(g);
    const pen = inkEl(g, INK.hatBand ? INK.inkSoft : INK.inkSoft), penR = inkEl(g), nib = inkEl(g);
    const palm = inkEl(g, INK.paperLight), palmR = inkEl(g), fingers = inkEl(g), fingFill = inkEl(g, INK.paperLight), fingR = inkEl(g);
    // local hand shapes (wrist at 0,0, hand points along +x, size ~ 1 = 100 px)
    const SH = {
      pen: { palm: [[0, -34], [46, -44], [92, -30], [112, -4], [104, 26], [70, 40], [24, 38], [0, 30]],
        lines: [[[62, -10], [100, -6]], [[60, 8], [98, 12]], [[56, 24], [88, 28]]],
        thumb: [[30, -36], [70, -50], [104, -36]] },
      fist: { palm: [[0, -36], [50, -46], [96, -34], [114, -6], [108, 26], [70, 42], [24, 40], [0, 32]],
        lines: [[[70, -22], [106, -18]], [[66, -2], [110, 2]], [[62, 18], [104, 22]]], thumb: [[26, -38], [62, -48], [86, -30]] },
      flat: { palm: [[0, -30], [60, -36], [150, -30], [176, -16], [176, 6], [150, 22], [60, 30], [0, 28]],
        lines: [[[96, -16], [168, -14]], [[96, 0], [172, 0]], [[96, 14], [164, 14]]], thumb: [[30, -30], [70, -50], [100, -46]] },
      stop: { palm: [[-44, 0], [-50, -80], [-38, -120], [40, -120], [52, -80], [46, 0]],
        fing: [[-36, -120, -36, -196], [-12, -122, -12, -222], [12, -122, 12, -214], [34, -118, 36, -180]],
        thumb: [[-46, -60], [-84, -110], [-96, -146]] },
    };
    function update(t, wrist, ang, s, kind = 'pen', ex = {}) {
      const k = seed * 60, A = ang * Math.PI / 180, mir = ex.mirror ? -1 : 1;
      const T = p => { const q = R([p[0] * s, p[1] * s * mir], A); return [wrist[0] + q[0], wrist[1] + q[1]]; };
      // sleeve from anchor to wrist (tapered tube)
      const from = o.from || [wrist[0] + 600, wrist[1] + 300];
      const dx = wrist[0] - from[0], dy = wrist[1] - from[1], dl = Math.hypot(dx, dy) || 1, nx = -dy / dl, ny = dx / dl;
      const w0 = 95 * s, w1 = 58 * s;
      const sl = [[from[0] + nx * w0, from[1] + ny * w0], [wrist[0] - dx / dl * 10 + nx * w1, wrist[1] - dy / dl * 10 + ny * w1], [wrist[0] - dx / dl * 10 - nx * w1, wrist[1] - dy / dl * 10 - ny * w1], [from[0] - nx * w0, from[1] - ny * w0]];
      sleeve.setAttribute('d', inkLoop(sl, { seed: k + 1, t, smooth: false, amp: 1.2 }));
      sleeveR.setAttribute('d', inkPath(sl, { w: 5, seed: k + 2, t, closed: true, smooth: false, amp: 1.2 }));
      const fl = [];
      for (let i = 1; i <= 3; i++) { const u = 0.3 + i * 0.15, cx = lerp(from[0], wrist[0], u), cy = lerp(from[1], wrist[1], u), ww = lerp(w0, w1, u) * 0.7; fl.push(inkPath([[cx + nx * ww, cy + ny * ww], [cx + nx * ww * 0.2 + dx / dl * 14, cy + ny * ww * 0.2 + dy / dl * 14]], { w: 3, seed: k + 3 + i, t, amp: 1 })); }
      folds.setAttribute('d', fl.join(' '));
      const cc = [[wrist[0] - dx / dl * 34 + nx * (w1 + 6), wrist[1] - dy / dl * 34 + ny * (w1 + 6)], [wrist[0] - dx / dl * 4 + nx * (w1 + 4), wrist[1] - dy / dl * 4 + ny * (w1 + 4)], [wrist[0] - dx / dl * 4 - nx * (w1 + 4), wrist[1] - dy / dl * 4 - ny * (w1 + 4)], [wrist[0] - dx / dl * 34 - nx * (w1 + 6), wrist[1] - dy / dl * 34 - ny * (w1 + 6)]];
      cuff.setAttribute('d', inkLoop(cc, { seed: k + 8, t, smooth: false, amp: 0.8 }));
      cuffR.setAttribute('d', inkPath(cc, { w: 4, seed: k + 9, t, closed: true, smooth: false, amp: 0.8 }));
      const sh = SH[kind] || SH.pen;
      // pen (reed pen) for "pen": from between the fingers to the tip
      if (kind === 'pen') {
        const a = T([70, -40]), b = T([190, 46]);
        pen.setAttribute('d', inkPath([a, b], { w: 12 * s, seed: k + 10, t, amp: 0.6, taper: 0.5 }));
        penR.setAttribute('d', inkPath([T([60, -48]), T([184, 42])], { w: 3, seed: k + 11, t, amp: 0.6 }));
        nib.setAttribute('d', inkDot(b[0], b[1], 5, 5, k + 12, t));
      } else for (const e of [pen, penR, nib]) e.setAttribute('d', '');
      const pp = sh.palm.map(T);
      palm.setAttribute('d', inkLoop(pp, { seed: k + 13, t, amp: 1 }));
      palmR.setAttribute('d', inkPath(pp, { w: 5, seed: k + 14, t, closed: true, amp: 1 }));
      const fl2 = (sh.lines || []).map((l, i) => inkPath(l.map(T), { w: 3, seed: k + 15 + i, t, amp: 0.7 }));
      fl2.push(inkPath(sh.thumb.map(T), { w: 4.5, seed: k + 19, t, amp: 0.8 }));
      if (sh.fing) {
        const fills = [], rims = [];
        sh.fing.forEach((f, i) => {
          const curl = ex.curl || 0, tip = [f[2], lerp(f[3], f[1] - 20, curl)];
          const a = T([f[0], f[1] + 10]), b = T(tip);
          fills.push(inkPath([a, b], { w: 30 * s, seed: k + 20 + i, t, amp: 0.8, taper: 0, vary: 0.05 }));
          rims.push(inkPath([T([f[0] - 15, f[1] + 6]), T([tip[0] - 15, tip[1] + 6]), T([tip[0], tip[1] - 14]), T([tip[0] + 15, tip[1] + 6]), T([f[0] + 15, f[1] + 6])], { w: 4, seed: k + 25 + i, t, amp: 0.8 }));
        });
        fingFill.setAttribute('d', fills.join(' ')); fingR.setAttribute('d', rims.join(' '));
      } else { fingFill.setAttribute('d', ''); fingR.setAttribute('d', ''); }
      fingers.setAttribute('d', fl2.join(' '));
      return kind === 'pen' ? T([190, 46]) : T([100, 0]);
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ Kaşif with a pose sequence
  function kasif(parent, K, W, H, seed) {
    const kas = KASIF.create(el(parent, 'g'), { scale: K.scale ?? 0.8, seed: seed * 3 + 1 });
    function update(lt, t, cues) {
      const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
      (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
      segs.sort((a, b) => a.at - b.at);
      let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
      const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
      const oo = { x: (K.x ?? 0.8) * W, y: (K.y ?? 0.6) * H, face: faceOf(s.face ?? K.face, 1), since, dir: dirOf(s.dir ?? K.dir),
        emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, item: s.item || K.item, text: s.text || K.text };
      if (pv && since < 0.32) { oo.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; oo.mix = since / 0.32; }
      kas.update(t, s.pose || 'idle', oo);
    }
    return { update };
  }

  // hand-written label (Patrick Hand), springs in at `at`; o: {text, x, y (0..1), size, color, rot, at}
  function label(parent, o, W, H) {
    const g = el(parent, 'g');
    const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': o.size || 64, 'text-anchor': 'middle', fill: o.color === 'red' ? INK.red : o.color === 'blue' ? INK.blue : INK.ink });
    tx.textContent = o.text || '';
    const ul = inkEl(g, o.color === 'red' ? INK.red : INK.ink);
    function update(lt, t, cues) {
      const a = atOr(cues, o.at, 0.3), p = spring(lt, a, 0.5);
      if (lt < a) { g.setAttribute('transform', 'scale(0)'); return; }
      const x = (o.x ?? 0.5) * W, y = (o.y ?? 0.3) * H;
      g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${o.rot ?? -3}) scale(${f1(p * 100) / 100})`);
      tx.setAttribute('x', 0); tx.setAttribute('y', 0);
      const w = (o.text || '').length * (o.size || 64) * 0.24;
      ul.setAttribute('d', o.underline === false ? '' : inkPath([[-w, 14], [w, 10]], { w: 5, seed: 900 + (o.text || '').length, t, amp: 1 }));
    }
    return { update };
  }


  // ------------------------------------------------------------------ foreground below the captions
  // fore(parent, kind, seed) -> {update(t, W, H, gy)}: an unimportant layer from the ground line to the frame bottom so
  // no frame ends in plain paper (BRAND §5.1). Every layer is one or two full-width paths (the engine camera treats
  // them as backdrop and does not frame them). kind: "cobbles" (perspective cobbles + dark crowd heads in fez at the
  // bottom edge + scattered burnt scraps), "panel" (wooden desk / counter front with drawers), "hill" (dark hatched
  // foreground hill with tufts).
  function fore(parent, kind, seed) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const base = P(kind === 'panel' ? INK.stain : kind === 'hill' ? mix(INK.green, INK.ink, 0.25) : mix(INK.paperDark, INK.stain, 0.4));
    const lines = P(INK.inkSoft, kind === 'cobbles' ? { 'fill-opacity': 0.6 } : {}), lines2 = P(INK.ink);
    const scrap = kind === 'cobbles' ? P(INK.paperLight) : null, scrapC = kind === 'cobbles' ? P(INK.ink) : null, scrapG = kind === 'cobbles' ? P(INK.red) : null;
    const shoulders = kind === 'cobbles' ? P(INK.inkSoft) : null, heads = kind === 'cobbles' ? P(INK.paperDark) : null, fez = kind === 'cobbles' ? P(INK.red) : null, outl = kind === 'cobbles' ? P(INK.ink) : null;
    const r0 = rng(inkHash(seed, 777));
    const scraps = Array.from({ length: 7 }, () => [r0(), r0(), r0(), r0()]);
    const tufts = Array.from({ length: 14 }, () => [r0(), r0()]);
    function update(t, W, H, gy) {
      const k = seed * 70;
      if (kind === 'cobbles') {
        base.setAttribute('d', `M-20 ${f1(gy)} H${W + 20} V${H + 20} H-20 Z`);
        const L = [];
        for (let y = gy + 14, row = 0; y < H; row++) {
          const sz = 22 + (y - gy) * 0.2, hgt = sz * 0.3;
          for (let x = (row % 2) * sz * 0.55 - sz; x < W + sz; x += sz * 1.1)
            L.push(inkPath(inkEllipsePts(x, y, sz * 0.5, hgt, k + row * 31 + Math.round(x), 8), { w: 1.4 + (y - gy) * 0.004, seed: k + row * 7 + Math.round(x) % 97, t, closed: true, amp: 0.8 }));
          y += hgt * 2.3;
        }
        lines.setAttribute('d', L.join(' '));
        // burnt scraps on the ground (below the caption strip)
        const S = [], C = [], G = [];
        scraps.forEach((q, i) => {
          const x = q[0] * W, y = H * (0.71 + 0.08 * q[1]), a = (q[2] - 0.5) * 1.6, w = 70 + q[3] * 60, h = w * 0.45;
          const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2 - 8, h / 2], [w * 0.1, h / 2 - 10], [-w / 2 + 6, h / 2]].map(p => { const v = R(p, a); return [x + v[0], y + v[1]]; });
          S.push(inkLoop(pts, { seed: k + 200 + i, t, smooth: false, amp: 0.8 }));
          C.push(inkPath(pts.slice(2).concat([pts[0]]), { w: 7, seed: k + 220 + i, t, smooth: false }));
          G.push(inkPath(pts.slice(2, 4), { w: 3, seed: k + 240 + i, t, smooth: false }));
        });
        scrap.setAttribute('d', S.join(' ')); scrapC.setAttribute('d', C.join(' ')); scrapG.setAttribute('d', G.join(' '));
        // onlookers seen from behind along the bottom edge: coat shoulders, back of the head, fez (one path per colour)
        const Sh = [], Hd = [], Fz = [], Ol = [], hx = [0.06, 0.26, 0.77, 0.96];
        hx.forEach((u, i) => {
          const x = u * W, rr = 70 + (i % 2) * 10, y = H * 0.875 + (i % 2) * 18 + Math.sin(t * 1.6 + i) * 3;
          const sh = [[x - rr * 2.1, H + 30], [x - rr * 1.9, y + rr * 1.5], [x - rr * 0.9, y + rr * 1.05], [x + rr * 0.9, y + rr * 1.05], [x + rr * 1.9, y + rr * 1.5], [x + rr * 2.1, H + 30]];
          Sh.push(inkLoop(sh, { seed: k + 300 + i, t }));
          Ol.push(inkPath(sh.slice(1, 5), { w: 5, seed: k + 330 + i, t }));
          Ol.push(inkPath([[x, y + rr * 1.1], [x, y + rr * 2.2]], { w: 3, seed: k + 340 + i, t }));
          Hd.push(inkCircle(x, y, rr, k + 310 + i, t, { fill: true }));
          Ol.push(inkCircle(x, y, rr, k + 350 + i, t, { w: 5 }));
          const fz = [[x - rr * 0.8, y - rr * 0.5], [x + rr * 0.8, y - rr * 0.5], [x + rr * 0.6, y - rr * 1.45], [x - rr * 0.6, y - rr * 1.45]];
          Fz.push(inkLoop(fz, { seed: k + 320 + i, t, smooth: false }));
          Ol.push(inkPath(fz, { w: 4.5, seed: k + 360 + i, t, closed: true, smooth: false }));
          Ol.push(inkPath([[x, y - rr * 1.45], [x + rr * 0.5, y - rr * 1.2], [x + rr * 0.7, y - rr * 0.7]], { w: 5, seed: k + 370 + i, t }));
        });
        shoulders.setAttribute('d', Sh.join(' ')); heads.setAttribute('d', Hd.join(' ')); fez.setAttribute('d', Fz.join(' ')); outl.setAttribute('d', Ol.join(' '));
        lines2.setAttribute('d', '');
      } else if (kind === 'floor') {   // wooden floor boards in perspective
        base.setAttribute('d', `M-20 ${f1(gy)} H${W + 20} V${H + 20} H-20 Z`);
        const L = [];
        for (let i = -9; i <= 9; i++) L.push(inkPath([[W / 2 + i * W * 0.07, gy], [W / 2 + i * W * 0.42, H + 20]], { w: 2.4, seed: k + 40 + i, t }));
        for (let y = gy + 40, j = 0; y < H; j++, y += 40 + (y - gy) * 0.35) L.push(inkPath([[-10, y], [W + 10, y + 2]], { w: 1.6, seed: k + 70 + j, t }));
        lines.setAttribute('d', L.join(' '));
        lines2.setAttribute('d', inkPath([[-20, gy + 4], [W + 20, gy + 4]], { w: 6, seed: k + 5, t }));
      } else if (kind === 'panel') {
        base.setAttribute('d', `M-20 ${f1(gy)} H${W + 20} V${H + 20} H-20 Z`);
        const L = [], y0 = gy + 0.1 * H, y1 = gy + 0.3 * H;
        [[0.06, 0.46], [0.54, 0.94]].forEach(([a, b], i) => {
          const pts = [[a * W, y0], [b * W, y0], [b * W, y1], [a * W, y1]];
          L.push(inkPath(pts, { w: 5, seed: k + 10 + i, t, closed: true, smooth: false }));
          L.push(inkCircle((a + b) / 2 * W, (y0 + y1) / 2, 18, k + 14 + i, t, { w: 5 }));
        });
        for (let y = gy + 26; y < H; y += 34) if (y < y0 - 10 || y > y1 + 10) L.push(inkPath([[-10, y], [W * 0.5, y + 3], [W + 10, y - 2]], { w: 1.8, seed: k + 20 + Math.round(y) % 53, t }));
        lines.setAttribute('d', L.join(' '));
        lines2.setAttribute('d', inkPath([[-20, gy + 8], [W + 20, gy + 8]], { w: 7, seed: k + 5, t }));
      } else {
        const top = gy + 0.08 * H, pts = [[-20, H + 20]];
        for (let i = 0; i <= 12; i++) pts.push([i / 12 * (W + 40) - 20, top + Math.sin(i * 0.9 + seed) * 40 + (i % 3) * 8]);
        pts.push([W + 20, H + 20]);
        base.setAttribute('d', inkLoop(pts, { seed: k + 1, t, smooth: true }));
        const L = [];
        for (let y = top + 40; y < H; y += 26) L.push(inkPath([[-10, y], [W + 10, y + (W + 20) * 0.35]], { w: 2, seed: k + 30 + Math.round(y) % 61, t, amp: 1 }));
        lines.setAttribute('d', L.join(' ')); lines.setAttribute('fill', mix(INK.green, INK.ink, 0.55));
        lines2.setAttribute('d', inkPath(pts.slice(1, -1), { w: 6, seed: k + 2, t }) + ' ' + tufts.map((q, i) => { const x = q[0] * W, y = top + 30 + q[1] * 0.25 * H; return inkPath([[x - 14, y], [x, y - 34], [x + 6, y - 2], [x + 18, y - 28]], { w: 4, seed: k + 50 + i, t }); }).join(' '));
      }
    }
    return { g, update };
  }

  window.KMA = { atOr, f1, faceOf, dirOf, R, step12, note, flame, smoke, fig, hand, kasif, label, fore };
})();
