// cay__lib: shared drawing helpers for the cay_* shots (Chernobyl tea, Rize 1986). Not a shot type itself.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything is a pure function of (seed, t); no Math.random.
// window.CAY = {
//   atOr(cues, name|sec, fb), f1, faceOf, dirOf, TEA() (brewed tea colour), LEAF(k) (tea-leaf green, k = 0 near .. 1 far)
//   glass(parent, seed) -> {update(t, x, y, s, o)}: a slim-waisted Turkish tea glass on its saucer, (x, y) = saucer
//     centre on the table, s = scale (glass is 230·s px tall). o: {fill: 0.82 (tea level), steam: 1, glow: 0 (gold
//     rings + hand-drawn trefoil in the steam), tref: [dx, dy, scale] (trefoil offset from the rim, units), steamH (units), steamW: 1
//     (steam thickness), tilt: 0
//     (deg, about the saucer), saucer: true, spoon: true, noGlass: false (saucer only)}
//     -> returns the glass rim centre [x, y]
//   flash(parent, seed) -> {update(t, x, y, r, k)}: a camera flash burst (paper-light star, gold rim), k 0..1
//   press(parent, seed, o) -> {update(t, lt, W, H, top, flashes)}: journalists seen from behind along the bottom edge
//     (backs of heads, shoulders, raised film cameras with flash heads, a boom microphone); a full-width foreground.
//     flashes: [seconds] (scene-local) when the cameras fire, in turn
//   terraces(parent, seed) -> {update(t, W, H, o)}: a steep tea hillside: terraced rows of rounded tea bushes from the
//     far rows (small, pale) to the frame bottom (big, dark, leaf-marked). o: {top: 0.45 (0..1 H), rows: 8, tilt: 0.12,
//     wet: 0 (drops on leaves), dust: 0 (gold specks settle on the bushes), skip: [x0, x1] (no bushes in this x band of
//     the top rows), sway, near0: 0 / near1: 1 (how near the first / last row looks: size, darkness)}
//   rain(parent, seed, n) -> {update(t, W, y0, y1, k, gold)}: slanted rain streaks; `gold` 0..1 share of glinting drops
//   cloud(parent, seed) -> {update(t, cx, cy, w, h, k, dark)}: a heavy ink-wash cloud
//   person(parent, seed, o) -> {update(t, x, gy, s, pose)}: a period figure, ink-wash body, no hat.
//     o.kind: "suit" (dark suit, red tie, moustache) | "picker" (headscarf, apron, wicker basket on the back);
//     pose: {lean, armL: [x, y], armR: [x, y] (world px targets), face: 1|-1, legs: true} -> {hc, hL, hR}
//   kasif(parent, K, W, H, seed) -> {update(lt, t, cues)}: Kaşif with K = {x, y (0..1), scale, pose, face, dir,
//     emotion, seq: [{at, pose, dir, face, emotion}]} -> returns the rig result ({head, hip, hands})
//   label(parent, o, W, H) -> {update(lt, t, cues)}: hand-written label, o: {text, x, y, size, color, rot, at, arrow: [x, y],
//     dim: cue (pale until that cue, then full colour with a pop)}
// }
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const TEA = () => mix(INK.red, INK.ink, 0.38);
  const LEAF = (k = 0) => mix(mix(INK.green, INK.ink, 0.18), INK.paper, Math.max(0, Math.min(0.85, k)));
  const R2 = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };

  // ------------------------------------------------------------------ tea glass (ince belli) + saucer
  // right half profile, rim -> foot (glass bottom at y = 0, 230 units tall)
  const PROF = [[64, -230], [59, -204], [48, -166], [44, -142], [49, -112], [58, -76], [58, -44], [50, -18], [38, -5], [40, 0]];
  const halfAt = y => {
    for (let i = 0; i < PROF.length - 1; i++) {
      const a = PROF[i], b = PROF[i + 1];
      if (y >= a[1] && y <= b[1]) return lerp(a[0], b[0], (y - a[1]) / (b[1] - a[1]));
    }
    return y < PROF[0][1] ? PROF[0][0] : PROF[PROF.length - 1][0];
  };
  function glass(parent, seed) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const glow = [0, 1, 2].map(() => P(INK.gold, { 'fill-opacity': 0.5 }));
    const sauShadow = P(INK.ink, { 'fill-opacity': 0.14 }), sau = P(INK.paperLight), sauGold = P(INK.gold), sauRim = P(), sauIn = P(INK.inkSoft);
    const spoon = P(INK.inkSoft), spoonR = P();
    const back = P(INK.paperLight, { 'fill-opacity': 0.55 });
    const tea = P(TEA()), teaTop = P(mix(TEA(), INK.gold, 0.45)), teaHi = P(INK.gold, { 'fill-opacity': 0.55 });
    const rim = P(), body = P(), hi = P(INK.paperLight, { 'fill-opacity': 0.9 }), hi2 = P(INK.paperLight, { 'fill-opacity': 0.7 });
    const steam = [0, 1, 2].map(() => P(mix(INK.inkSoft, INK.paperLight, 0.15), { 'fill-opacity': 0.6 }));
    const trefDisc = P(INK.gold, { 'fill-opacity': 0.85 }), tref = P(INK.ink), trefR = P();
    function update(t, x, y, s, o = {}) {
      const k = seed * 37, A = (o.tilt || 0) * Math.PI / 180;
      const T = p => { const q = R2([p[0] * s, p[1] * s], A); return [x + q[0], y + q[1]]; };
      const gy0 = -14;                                  // glass bottom sits on the saucer well
      const G = p => T([p[0], p[1] + gy0]);
      const fill = o.fill ?? 0.82, st = o.steam ?? 1, gl = clamp01(o.glow || 0);
      // glow rings behind everything
      glow.forEach((e, i) => {
        const u = ((t * 0.45 + i / 3) % 1), r = (150 + u * 190) * s, a = gl * Math.sin(Math.PI * u) * 0.55;
        if (a < 0.02) { e.setAttribute('d', ''); return; }
        e.setAttribute('fill-opacity', a.toFixed(3));
        e.setAttribute('d', inkCircle(...T([0, -120 + gy0]), r, k + 1 + i, t, { w: 7 * s + 2, n: 22 }));
      });
      // saucer
      if (o.saucer !== false) {
        const c = T([0, 0]);
        sauShadow.setAttribute('d', inkLoop(inkEllipsePts(c[0] + 8 * s, c[1] + 16 * s, 134 * s, 30 * s, k + 3, 16), { seed: k + 3, t, amp: 1 }));
        sau.setAttribute('d', inkLoop(inkEllipsePts(c[0], c[1], 128 * s, 27 * s, k + 4, 16, A), { seed: k + 4, t, amp: 1 }));
        sauGold.setAttribute('d', inkCircle(c[0], c[1], 114 * s, k + 5, t, { ry: 21 * s, w: 5 * s + 1, rot: A, n: 16 }));
        sauRim.setAttribute('d', inkCircle(c[0], c[1], 128 * s, k + 6, t, { ry: 27 * s, w: 5, rot: A, n: 16 }));
        sauIn.setAttribute('d', inkCircle(c[0], c[1] - 3 * s, 60 * s, k + 7, t, { ry: 11 * s, w: 2.5, rot: A, n: 12 }));
        if (o.spoon !== false) {
          const sp = [T([70, -2]), T([150, -14])], bowl = T([62, 1]);
          spoon.setAttribute('d', inkPath(sp, { w: 7 * s, seed: k + 8, t, amp: 0.6 }) + ' ' + inkDot(bowl[0], bowl[1], 16 * s, 7 * s, k + 9, t));
          spoonR.setAttribute('d', inkPath(sp, { w: 2.2, seed: k + 10, t, amp: 0.6 }));
        } else { spoon.setAttribute('d', ''); spoonR.setAttribute('d', ''); }
      } else for (const e of [sauShadow, sau, sauGold, sauRim, sauIn, spoon, spoonR]) e.setAttribute('d', '');
      if (o.noGlass) { for (const e of [back, tea, teaTop, teaHi, body, rim, hi, hi2, ...steam, trefDisc, tref, trefR]) e.setAttribute('d', ''); return T([0, -236 + gy0]); }
      // glass body
      const R = PROF.map(p => G(p)), L = PROF.slice().reverse().map(p => G([-p[0], p[1]]));
      const outline = R.concat(L);
      back.setAttribute('d', inkLoop(outline, { seed: k + 11, t, amp: 0.8 }));
      // tea (from the level down, inset 7 units)
      const lv = lerp(-8, -214, fill);
      const ys = [lv]; PROF.forEach(p => { if (p[1] > lv) ys.push(p[1]); });
      const right = ys.map(yy => [Math.max(0, halfAt(yy) - 7), Math.min(yy, -6)]);
      const tp = right.map(G).concat(right.slice().reverse().map(p => G([-p[0], p[1]])));
      tea.setAttribute('d', fill > 0.01 ? inkLoop(tp, { seed: k + 12, t, amp: 0.6 }) : '');
      const hw = Math.max(0, halfAt(lv) - 7), sl = Math.sin(t * 2.1 + seed) * 2;
      teaTop.setAttribute('d', fill > 0.01 ? inkLoop(inkEllipsePts(...G([0, lv + sl]), hw * s, 7 * s, k + 13, 12, A), { seed: k + 13, t, amp: 0.5 }) : '');
      teaHi.setAttribute('d', fill > 0.05 ? inkPath([G([-30, -60]), G([-34, -100]), G([-28, Math.max(lv + 20, -130)])], { w: 9 * s, seed: k + 14, t, amp: 0.6 }) : '');
      body.setAttribute('d', inkPath(outline, { w: 5.5, seed: k + 15, t, closed: true, amp: 0.9 }));
      rim.setAttribute('d', inkCircle(...G([0, -230]), 64 * s, k + 16, t, { ry: 9 * s, w: 4.5, rot: A, n: 14 }));
      hi.setAttribute('d', inkPath([G([-50, -196]), G([-40, -160]), G([-36, -142])], { w: 7 * s, seed: k + 17, t, amp: 0.6 }));
      hi2.setAttribute('d', inkPath([G([-48, -96]), G([-52, -60]), G([-44, -26])], { w: 6 * s, seed: k + 18, t, amp: 0.6 }));
      // steam: three slow S-curls rising from the rim
      const rimC = G([0, -236]);
      steam.forEach((e, i) => {
        if (st <= 0.01) { e.setAttribute('d', ''); return; }
        const ph = t * 0.9 + i * 2.1, x0 = (i - 1) * 30 * s, hgt = (o.steamH ?? (230 + i * 30)) * s * st;
        const pts = [];
        for (let j = 0; j <= 6; j++) { const u = j / 6; pts.push([rimC[0] + x0 + Math.sin(u * 5.2 + ph) * 26 * s * (0.4 + u), rimC[1] - 16 * s - u * hgt]); }
        e.setAttribute('fill-opacity', (0.62 * st).toFixed(3));
        e.setAttribute('d', inkPath(pts, { w: 10 * s * (o.steamW ?? 1), seed: k + 20 + i, t, amp: 1.2, taper: 0.9 }));
      });
      // trefoil (hand-drawn radiation sign) floating in the steam
      if (gl > 0.02 && st > 0.01) {
        const tr = o.tref || [0, -210, 1], sc = spring(gl, 0, 1) * s * (tr[2] ?? 1), c = [rimC[0] + tr[0] * s + Math.sin(t * 0.8) * 10 * s, rimC[1] + tr[1] * s - Math.sin(t * 1.1) * 8 * s];
        trefDisc.setAttribute('d', inkCircle(c[0], c[1], 74 * sc, k + 30, t, { fill: true, n: 16 }));
        const blades = [90, 210, 330].map((a0, i) => {
          const pts = [];
          for (let j = 0; j <= 6; j++) { const a = (a0 - 30 + j * 10) * Math.PI / 180; pts.push([c[0] + Math.cos(a) * 62 * sc, c[1] - Math.sin(a) * 62 * sc]); }
          for (let j = 6; j >= 0; j--) { const a = (a0 - 30 + j * 10) * Math.PI / 180; pts.push([c[0] + Math.cos(a) * 20 * sc, c[1] - Math.sin(a) * 20 * sc]); }
          return inkLoop(pts, { seed: k + 31 + i, t, amp: 0.8, smooth: false });
        });
        tref.setAttribute('d', blades.join(' ') + ' ' + inkDot(c[0], c[1], 12 * sc, 12 * sc, k + 35, t));
        trefR.setAttribute('d', inkCircle(c[0], c[1], 74 * sc, k + 36, t, { w: 5, n: 16 }));
      } else for (const e of [trefDisc, tref, trefR]) e.setAttribute('d', '');
      return rimC;
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ camera flash
  function flash(parent, seed) {
    const g = el(parent, 'g');
    const rays = inkEl(g, INK.paperLight), rim = inkEl(g, INK.gold), core = inkEl(g, INK.paperLight);
    function update(t, x, y, r, k) {
      if (k <= 0.02) { rays.setAttribute('d', ''); rim.setAttribute('d', ''); core.setAttribute('d', ''); return; }
      const rr = r * (0.6 + 0.4 * k), n = 10, pts = [];
      for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + seed, q = i % 2 ? rr * 0.32 : rr * (i % 4 ? 0.8 : 1); pts.push([x + Math.cos(a) * q, y + Math.sin(a) * q]); }
      rays.setAttribute('d', inkLoop(pts, { seed: seed + 1, t, amp: 1.5, smooth: false }));
      rim.setAttribute('d', inkPath(pts, { w: 4, seed: seed + 2, t, amp: 1.5, closed: true, smooth: false }));
      core.setAttribute('d', inkCircle(x, y, rr * 0.3, seed + 3, t, { fill: true }));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ journalists from behind (foreground)
  function press(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const shoulders = P(mix(INK.inkSoft, INK.paperDark, 0.35)), tone = P(mix(INK.blue, INK.inkSoft, 0.45)), collar = P(INK.paperLight), heads = P(mix(INK.ink, INK.inkSoft, 0.2)), cams = P(INK.ink), lens = P(INK.paperDark), outl = P(INK.ink), arms = P(mix(INK.inkSoft, INK.paperDark, 0.2)), hands = P(INK.paperDark);
    const mic = P(INK.ink);
    const fls = [0, 1, 2, 3].map(i => flash(g, seed * 11 + i * 5));
    const people = o.people || [
      { x: 0.08, r: 74, cam: [0.17, -2.5], dy: 10 }, { x: 0.33, r: 66, cam: null, dy: 34 },
      { x: 0.62, r: 70, cam: [0.53, -2.7], dy: 16 }, { x: 0.9, r: 78, cam: [0.82, -2.3], dy: 0 },
    ];
    function update(t, lt, W, H, top, flashes = []) {
      const k = seed * 50, Sh = [], Hd = [], Cm = [], Ln = [], Ol = [], Ar = [], Hn = [], Cl = [], Tn = [];
      people.forEach((p, i) => {
        const x = p.x * W, rr = p.r * (W / 1080), y = top + p.dy + Math.sin(t * 1.4 + i * 1.7) * 4;
        const sh = [[x - rr * 2.3, H + 40], [x - rr * 2.1, y + rr * 1.6], [x - rr * 1.0, y + rr * 1.1], [x + rr * 1.0, y + rr * 1.1], [x + rr * 2.1, y + rr * 1.6], [x + rr * 2.3, H + 40]];
        Sh.push(inkLoop(sh, { seed: k + 1 + i, t }));
        Ol.push(inkPath(sh.slice(1, 5), { w: 5, seed: k + 10 + i, t }));
        Hd.push(inkCircle(x, y, rr, k + 20 + i, t, { fill: true }));
        Ol.push(inkCircle(x, y, rr, k + 30 + i, t, { w: 5 }));
        // jacket from behind: shirt collar, centre seam, shoulder creases, a second jacket tone per person
        Cl.push(inkLoop([[x - rr * 0.62, y + rr * 0.78], [x + rr * 0.62, y + rr * 0.78], [x + rr * 0.7, y + rr * 1.12], [x - rr * 0.7, y + rr * 1.12]], { seed: k + 120 + i, t, amp: 0.6 }));
        Ol.push(inkPath([[x - rr * 0.7, y + rr * 1.12], [x + rr * 0.7, y + rr * 1.12]], { w: 4, seed: k + 125 + i, t }));
        Ol.push(inkPath([[x + Math.sin(i) * 6, y + rr * 1.2], [x + Math.sin(i) * 10, H + 30]], { w: 3.5, seed: k + 130 + i, t }));
        Ol.push(inkPath([[x - rr * 1.6, y + rr * 1.9], [x - rr * 1.1, y + rr * 2.8], [x - rr * 1.25, H + 30]], { w: 3, seed: k + 135 + i, t }));
        Ol.push(inkPath([[x + rr * 1.6, y + rr * 1.9], [x + rr * 1.1, y + rr * 2.8], [x + rr * 1.25, H + 30]], { w: 3, seed: k + 140 + i, t }));
        if (i % 2) Tn.push(inkLoop(sh, { seed: k + 145 + i, t }));
        // hair strands
        Ol.push(inkPath([[x - rr * 0.6, y - rr * 0.5], [x - rr * 0.1, y - rr * 0.75], [x + rr * 0.5, y - rr * 0.55]], { w: 3, seed: k + 40 + i, t }));
        if (p.cam) {
          const cx = p.cam[0] * W + Math.sin(t * 1.1 + i) * 5, cy = top + p.cam[1] * rr + Math.sin(t * 1.3 + i) * 4;
          const bw = rr * 1.5, bh = rr * 0.95;
          const body = [[cx - bw / 2, cy - bh / 2], [cx + bw / 2, cy - bh / 2], [cx + bw / 2, cy + bh / 2], [cx - bw / 2, cy + bh / 2]];
          Cm.push(inkLoop(body, { seed: k + 50 + i, t, smooth: false, amp: 1 }));
          // flash head on top
          const fh = [[cx - bw * 0.22, cy - bh / 2], [cx - bw * 0.22, cy - bh * 1.15], [cx + bw * 0.22, cy - bh * 1.15], [cx + bw * 0.22, cy - bh / 2]];
          Cm.push(inkLoop(fh, { seed: k + 60 + i, t, smooth: false, amp: 1 }));
          Ln.push(inkCircle(cx - bw * 0.05, cy + bh * 0.05, bh * 0.32, k + 70 + i, t, { fill: true }));
          Ol.push(inkCircle(cx - bw * 0.05, cy + bh * 0.05, bh * 0.32, k + 75 + i, t, { w: 4 }));
          // arms from the shoulders up to the camera
          Ar.push(inkPath([[x - rr * 0.9, y + rr * 1.2], [cx - bw * 0.7, cy + bh * 1.2], [cx - bw * 0.5, cy + bh * 0.2]], { w: 30 * (W / 1080), seed: k + 80 + i, t }));
          Ar.push(inkPath([[x + rr * 0.9, y + rr * 1.2], [cx + bw * 0.7, cy + bh * 1.2], [cx + bw * 0.5, cy + bh * 0.2]], { w: 30 * (W / 1080), seed: k + 85 + i, t }));
          Hn.push(inkDot(cx - bw * 0.5, cy + bh * 0.25, 15, 15, k + 90 + i, t), inkDot(cx + bw * 0.5, cy + bh * 0.25, 15, 15, k + 92 + i, t));
          p._flash = [cx, cy - bh * 1.15];
        }
      });
      shoulders.setAttribute('d', Sh.join(' ')); tone.setAttribute('d', Tn.join(' ')); collar.setAttribute('d', Cl.join(' ')); heads.setAttribute('d', Hd.join(' ')); cams.setAttribute('d', Cm.join(' '));
      lens.setAttribute('d', Ln.join(' ')); outl.setAttribute('d', Ol.join(' ')); arms.setAttribute('d', Ar.join(' ')); hands.setAttribute('d', Hn.join(' '));
      // a boom microphone over the crowd (the one without a camera holds it)
      const mp = people.find(p => !p.cam);
      if (mp && o.mic !== false) {
        const x = mp.x * W, y = top + mp.dy, tip = [x + 0.16 * W, top - 2.9 * mp.r + Math.sin(t * 0.9) * 6];
        mic.setAttribute('d', inkPath([[x + 30, y + 40], tip], { w: 10, seed: k + 95, t }) + ' ' + inkLoop(inkEllipsePts(tip[0] + 18, tip[1] - 14, 34, 22, k + 96, 10, -0.6), { seed: k + 96, t }));
      } else mic.setAttribute('d', '');
      // flashes fire in turn
      const camP = people.filter(p => p.cam);
      fls.forEach((f, i) => {
        let kk = 0;
        flashes.forEach((ft, j) => { if (j % camP.length === i) kk = Math.max(kk, punch(lt, ft, 0.5)); });
        const p = camP[i];
        if (!p || !p._flash) { f.update(t, 0, 0, 0, 0); return; }
        f.update(t, p._flash[0], p._flash[1] - 30, 120 * (W / 1080), kk);
      });
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ terraced tea hillside
  function terraces(parent, seed) {
    const g = el(parent, 'g');
    const rows = Array.from({ length: 10 }, () => ({ soil: inkEl(g, INK.stain), soilL: inkEl(g, INK.inkSoft), bush: inkEl(g, INK.green), rim: inkEl(g), marks: inkEl(g, mix(INK.green, INK.ink, 0.5)) }));
    const wetE = inkEl(g, INK.paperLight, { 'fill-opacity': 0.85 }), dustE = inkEl(g, INK.gold), dustR = inkEl(g, INK.gold, { 'fill-opacity': 0.4 });
    const r0 = rng(inkHash(seed, 31));
    const jit = Array.from({ length: 400 }, () => r0());
    function update(t, W, H, o = {}) {
      const k = seed * 90, n = o.rows ?? 8, top = (o.top ?? 0.45) * H, tilt = o.tilt ?? 0.12, sw = o.sway ?? 1;
      const wet = clamp01(o.wet || 0), dust = clamp01(o.dust || 0);
      const W1 = [], D1 = [], D2 = [];
      rows.forEach((R, i) => {
        if (i >= n) { for (const e of Object.values(R)) e.setAttribute('d', ''); return; }
        const u = i / (n - 1), y = top + (H + 60 - top) * Math.pow(u, 1.25);           // row baseline
        const near = lerp(o.near0 ?? 0, o.near1 ?? 1, u), far = 1 - near;
        const bh = lerp(26, 150, Math.pow(near, 1.3)) * (W / 1080);                     // bush height
        const lumpW = lerp(46, 210, Math.pow(near, 1.2)) * (W / 1080);
        const yy = x => y + tilt * (x - W / 2) * (i % 2 ? 1 : 0.8);
        // soil / terrace wall strip below the bushes
        const sh = lerp(10, 46, near);
        const soil = [[-30, yy(-30)], [W + 30, yy(W + 30)], [W + 30, yy(W + 30) + sh], [-30, yy(-30) + sh]];
        R.soil.setAttribute('d', inkLoop(soil, { seed: k + i * 7, t, smooth: false, amp: 1 }));
        R.soil.setAttribute('fill', mix(INK.stain, INK.paper, far * 0.55));
        R.soilL.setAttribute('d', inkPath([[-30, yy(-30) + sh], [W + 30, yy(W + 30) + sh]], { w: lerp(2, 5, near), seed: k + i * 7 + 1, t }));
        // bush lumps: scalloped top edge
        const pts = [[-40, yy(-40) + 4]];
        const sk = o.skip && i < n * 0.5 ? o.skip : null;
        let x = -40 - jit[i * 13 % 400] * lumpW, j = 0;
        while (x < W + 40) {
          const w = lumpW * (0.8 + jit[(i * 31 + j * 7) % 400] * 0.4), h = bh * (0.8 + jit[(i * 17 + j * 11) % 400] * 0.35);
          const cx = x + w / 2, sway = Math.sin(t * 1.6 + i + j * 0.7) * 2.5 * near * sw;
          if (sk && cx > sk[0] * W && cx < sk[1] * W) { pts.push([x, yy(x) + 2], [x + w, yy(x + w) + 2]); }
          else {
            pts.push([x, yy(x) - h * 0.15], [x + w * 0.2 + sway, yy(x + w * 0.2) - h * 0.8], [cx + sway, yy(cx) - h], [x + w * 0.8 + sway, yy(x + w * 0.8) - h * 0.8]);
            // leaf marks on near rows
            if (near > 0.35) for (let q = 0; q < 3; q++) {
              const lx = x + w * (0.25 + q * 0.25) + sway, ly = yy(lx) - h * (0.45 + jit[(i * 7 + j * 5 + q) % 400] * 0.35);
              W1.push(inkPath([[lx - 10 * near, ly + 6 * near], [lx, ly - 8 * near], [lx + 10 * near, ly + 4 * near]], { w: 3 + near * 2, seed: k + i * 50 + j * 3 + q, t, amp: 0.6 }));
              if (wet > 0.05 && (j + q) % 3 === 0) D1.push(inkDot(lx + 6, ly + 10 * near, 5 * near + 2, 6 * near + 2.5, k + 500 + i * 30 + j + q, t));
            }
            if (dust > 0.02 && (j + i * 2) % 4 === 0) {
              const tw = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.3 + j * 2.1), dx = cx + sway + (jit[(i * 23 + j) % 400] - 0.5) * w * 0.5, dy = yy(cx) - h * (0.9 + jit[(i * 3 + j) % 400] * 0.08);
              const ss = (7 + near * 16) * dust * (0.6 + 0.4 * tw);
              D2.push(inkLoop([[dx, dy - ss * 2], [dx + ss * 0.5, dy - ss * 0.5], [dx + ss * 2, dy], [dx + ss * 0.5, dy + ss * 0.5], [dx, dy + ss * 2], [dx - ss * 0.5, dy + ss * 0.5], [dx - ss * 2, dy], [dx - ss * 0.5, dy - ss * 0.5]], { seed: k + 900 + i * 40 + j, t, smooth: false, amp: 0.4 }));
            }
          }
          x += w; j++;
        }
        pts.push([W + 40, yy(W + 40) + 4]);
        const full = pts.concat([[W + 40, yy(W + 40) + sh * 0.2], [-40, yy(-40) + sh * 0.2]]);
        R.bush.setAttribute('d', inkLoop(full, { seed: k + i * 7 + 2, t, amp: 1.2 }));
        R.bush.setAttribute('fill', LEAF(far * 0.75));
        R.rim.setAttribute('d', inkPath(pts, { w: lerp(2.5, 6, near), seed: k + i * 7 + 3, t, amp: 1.2 }));
        R.marks.setAttribute('d', '');
      });
      rows[Math.min(n, rows.length) - 1].marks.setAttribute('d', W1.join(' '));
      wetE.setAttribute('d', D1.join(' '));
      dustE.setAttribute('d', D2.join(' '));
      dustR.setAttribute('d', '');
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ rain
  function rain(parent, seed, n = 70) {
    const g = el(parent, 'g');
    const grey = el(g, 'path', { fill: 'none', stroke: INK.inkSoft, 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-opacity': 0.75 });
    const gold = el(g, 'path', { fill: 'none', stroke: INK.gold, 'stroke-width': 5, 'stroke-linecap': 'round' });
    const r = rng(inkHash(seed, 71)), D = Array.from({ length: n }, () => [r(), r(), r()]);
    function update(t, W, y0, y1, k = 1, gk = 0) {
      if (k <= 0.01) { grey.setAttribute('d', ''); gold.setAttribute('d', ''); return; }
      let a = '', b = '';
      D.forEach((d, i) => {
        if (i / n > k) return;
        const u = (d[1] + t * (0.9 + d[2] * 0.4)) % 1, y = lerp(y0, y1, u), x = d[0] * (W + 200) - 100 - u * 90;
        const L = 46 + d[2] * 30, isG = gk > 0 && (i % 5 === 0) && d[2] < gk + 0.2;
        const s = `M${f1(x)} ${f1(y)} L${f1(x - L * 0.3)} ${f1(y + L)} `;
        if (isG) b += s; else a += s;
      });
      grey.setAttribute('d', a); gold.setAttribute('d', b);
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ cloud
  function cloud(parent, seed) {
    const g = el(parent, 'g');
    const fillE = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.55 }), under = inkEl(g, INK.ink, { 'fill-opacity': 0.25 }), rim = inkEl(g), hatch = inkEl(g, INK.ink, { 'fill-opacity': 0.5 });
    const r = rng(inkHash(seed, 51)), B = Array.from({ length: 7 }, () => [r(), r()]);
    function update(t, cx, cy, w, h, k = 1, dark = 0.55) {
      if (k <= 0.01) { for (const e of [fillE, under, rim, hatch]) e.setAttribute('d', ''); return; }
      w *= k; h *= k;
      const pts = [], N = 26;
      for (let i = 0; i < N; i++) {
        const a = i / N * Math.PI * 2, up = Math.sin(a) < 0;
        let rr = 1;
        if (up) B.forEach((b, j) => { const c = Math.PI + (j + 0.5) / B.length * Math.PI; rr += 0.22 * (0.5 + b[0]) * Math.max(0, Math.cos((a - c) * 3.5)); });
        const wob = 1 + 0.03 * Math.sin(t * 1.3 + i);
        pts.push([cx + Math.cos(a) * w / 2 * wob, cy + Math.sin(a) * h / 2 * (up ? rr : 0.55) * wob]);
      }
      fillE.setAttribute('fill-opacity', dark.toFixed(2));
      fillE.setAttribute('d', inkLoop(pts, { seed: seed + 1, t, amp: 2 }));
      under.setAttribute('d', inkLoop(pts.filter((p, i) => Math.sin(i / N * Math.PI * 2) >= -0.15), { seed: seed + 2, t, amp: 2 }));
      rim.setAttribute('d', inkPath(pts, { w: 5, seed: seed + 3, t, closed: true, amp: 2 }));
      const H = [];
      for (let i = 0; i < 6; i++) { const x = cx - w * 0.32 + i * w * 0.12; H.push(inkPath([[x, cy + h * 0.08], [x + w * 0.06, cy - h * 0.12]], { w: 3, seed: seed + 10 + i, t })); }
      hatch.setAttribute('d', H.join(' '));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ period figure (no hat)
  function person(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const kind = o.kind || 'suit';
    const basket = kind === 'picker' ? P(INK.stain) : null, basketR = kind === 'picker' ? P() : null;
    const legL = P(), legR = P();
    const bodyCol = kind === 'suit' ? mix(INK.ink, INK.inkSoft, 0.45) : kind === 'picker' ? INK.blue : INK.inkSoft;
    const coat = P(bodyCol), coatR = P(), shirt = P(INK.paperLight), tie = P(INK.red);
    const apron = kind === 'picker' ? P(INK.red) : null;
    const armBack = P(bodyCol), armBackR = P(), head = P(INK.paperDark), headR = P(), hair = P(INK.ink), face = P();
    const scarf = kind === 'picker' ? P(INK.red) : null, scarfR = kind === 'picker' ? P() : null, dots = kind === 'picker' ? P(INK.paperLight) : null;
    const armF = P(bodyCol), armFR = P(), hands = P(INK.paperDark), handsR = P();
    const twoBone = (a, b, l1, l2, bend) => {
      let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
      const mx = l1 + l2 - 1; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
      const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d || 1))));
      return [[a[0] + Math.cos(base + bend * al) * l1, a[1] + Math.sin(base + bend * al) * l1], [a[0] + dx, a[1] + dy]];
    };
    function update(t, x, gy, s, pose = {}) {
      const k = seed * 40, fc = pose.face ?? 1, lean = (pose.lean || 0) * Math.PI / 180;
      const br = Math.sin(t * 2 + seed) * 2 * s;
      const hip = [x, gy - 190 * s], neck = [x + Math.sin(lean) * 210 * s * fc, gy - 400 * s + br];
      const hc = [neck[0] + Math.sin(lean) * 40 * s * fc + 6 * s * fc, neck[1] - 54 * s];
      if (pose.legs !== false) {
        legL.setAttribute('d', inkPath([hip, [x - 24 * s, gy]], { w: 16 * s, seed: k + 1, t, amp: 1 }));
        legR.setAttribute('d', inkPath([hip, [x + 24 * s, gy]], { w: 16 * s, seed: k + 2, t, amp: 1 }));
      } else { legL.setAttribute('d', ''); legR.setAttribute('d', ''); }
      const sh = [neck[0], neck[1] + 14 * s];
      const hemY = kind === 'picker' ? gy - 30 * s : gy - 150 * s;
      const cp = [[sh[0] - 46 * s, sh[1] + 6 * s], [sh[0] + 46 * s, sh[1] + 6 * s], [x + (kind === 'picker' ? 66 : 50) * s, hemY], [x - (kind === 'picker' ? 66 : 50) * s, hemY]];
      coat.setAttribute('d', inkLoop(cp, { seed: k + 3, t, amp: 1.2, smooth: false }));
      coatR.setAttribute('d', inkPath(cp, { w: 4.5, seed: k + 4, t, closed: true, amp: 1.2, smooth: false }));
      if (kind === 'suit') {
        const v = [[sh[0] - 16 * s, sh[1] - 2 * s], [sh[0] + 16 * s, sh[1] - 2 * s], [sh[0] + 2 * s, sh[1] + 70 * s]];
        shirt.setAttribute('d', inkLoop(v, { seed: k + 5, t, amp: 0.6, smooth: false }));
        tie.setAttribute('d', inkLoop([[sh[0] - 5 * s, sh[1] + 2 * s], [sh[0] + 7 * s, sh[1] + 2 * s], [sh[0] + 9 * s, sh[1] + 64 * s], [sh[0] + 1 * s, sh[1] + 76 * s], [sh[0] - 7 * s, sh[1] + 64 * s]], { seed: k + 6, t, amp: 0.5, smooth: false }));
      } else { shirt.setAttribute('d', ''); tie.setAttribute('d', ''); }
      if (apron) apron.setAttribute('d', inkLoop([[x - 44 * s, gy - 200 * s], [x + 44 * s, gy - 200 * s], [x + 54 * s, gy - 40 * s], [x - 54 * s, gy - 40 * s]], { seed: k + 7, t, amp: 1, smooth: false }));
      if (basket) {   // wicker basket (küfe) on the back
        const bx = sh[0] - 70 * s * fc, b = [[bx - 52 * s, sh[1] - 30 * s], [bx + 52 * s, sh[1] - 30 * s], [bx + 38 * s, sh[1] + 150 * s], [bx - 38 * s, sh[1] + 150 * s]];
        basket.setAttribute('d', inkLoop(b, { seed: k + 8, t, smooth: false, amp: 1 }));
        const L = [inkPath(b, { w: 4.5, seed: k + 9, t, closed: true, smooth: false })];
        for (let i = 1; i < 5; i++) L.push(inkPath([[lerp(b[0][0], b[3][0], i / 5), lerp(b[0][1], b[3][1], i / 5)], [lerp(b[1][0], b[2][0], i / 5), lerp(b[1][1], b[2][1], i / 5)]], { w: 2.5, seed: k + 10 + i, t }));
        for (let i = 1; i < 4; i++) L.push(inkPath([[lerp(b[0][0], b[1][0], i / 4), b[0][1]], [lerp(b[3][0], b[2][0], i / 4), b[3][1]]], { w: 2.5, seed: k + 16 + i, t }));
        // leaves heaped in the basket
        const lf = [[bx - 50 * s, sh[1] - 30 * s], [bx - 30 * s, sh[1] - 62 * s], [bx, sh[1] - 52 * s], [bx + 28 * s, sh[1] - 66 * s], [bx + 50 * s, sh[1] - 30 * s]];
        L.push(inkPath(lf, { w: 4, seed: k + 21, t }));
        basketR.setAttribute('d', L.join(' '));
        basketR._leaf = lf;
      }
      const shL = [sh[0] - 36 * s * fc, sh[1] + 12 * s], shR = [sh[0] + 36 * s * fc, sh[1] + 12 * s];
      const tL = pose.armL || [shL[0] - 10 * s * fc, shL[1] + 170 * s], tR = pose.armR || [shR[0] + 10 * s * fc, shR[1] + 170 * s];
      const [eL, hL] = twoBone(shL, tL, 92 * s, 88 * s, fc);
      const [eR, hR] = twoBone(shR, tR, 92 * s, 88 * s, pose.bendR ?? -fc);
      armBack.setAttribute('d', inkPath([shL, eL, hL], { w: 26 * s, seed: k + 25, t, amp: 1, taper: 0.1 }));
      armBackR.setAttribute('d', inkPath([shL, eL, hL], { w: 4, seed: k + 26, t, amp: 1 }));
      armF.setAttribute('d', inkPath([shR, eR, hR], { w: 28 * s, seed: k + 27, t, amp: 1, taper: 0.1 }));
      armFR.setAttribute('d', inkPath([shR, eR, hR], { w: 4, seed: k + 28, t, amp: 1 }));
      hands.setAttribute('d', inkDot(hL[0], hL[1], 15 * s, 15 * s, k + 29, t) + ' ' + inkDot(hR[0], hR[1], 15 * s, 15 * s, k + 30, t));
      handsR.setAttribute('d', inkCircle(hL[0], hL[1], 15 * s, k + 31, t, { w: 3.5 }) + ' ' + inkCircle(hR[0], hR[1], 15 * s, k + 32, t, { w: 3.5 }));
      head.setAttribute('d', inkCircle(hc[0], hc[1], 50 * s, k + 33, t, { fill: true }));
      headR.setAttribute('d', inkCircle(hc[0], hc[1], 50 * s, k + 34, t, { w: 5 }));
      const F = [];
      F.push(inkDot(hc[0] + 18 * s * fc, hc[1] - 6 * s, 4.5 * s + 1, 4.5 * s + 1, k + 35, t));
      F.push(inkPath([[hc[0] + 8 * s * fc, hc[1] - 20 * s], [hc[0] + 30 * s * fc, hc[1] - 22 * s]], { w: 3.5, seed: k + 36, t, amp: 0.5 }));
      if (kind === 'suit') {
        hair.setAttribute('d', inkLoop([[hc[0] - 50 * s, hc[1] - 4 * s], [hc[0] - 44 * s, hc[1] - 36 * s], [hc[0] - 10 * s, hc[1] - 54 * s], [hc[0] + 34 * s * fc, hc[1] - 44 * s], [hc[0] + 44 * s * fc, hc[1] - 26 * s], [hc[0] + 4 * s, hc[1] - 34 * s], [hc[0] - 30 * s * fc, hc[1] - 10 * s]], { seed: k + 37, t, amp: 0.8 }));
        F.push(inkLoop([[hc[0] + 10 * s * fc, hc[1] + 16 * s], [hc[0] + 44 * s * fc, hc[1] + 12 * s], [hc[0] + 40 * s * fc, hc[1] + 24 * s], [hc[0] + 14 * s * fc, hc[1] + 26 * s]], { seed: k + 38, t, amp: 0.6 }));
      } else hair.setAttribute('d', '');
      face.setAttribute('d', F.join(' '));
      if (scarf) {
        const sc = [[hc[0] - 58 * s, hc[1] + 30 * s], [hc[0] - 60 * s, hc[1] - 20 * s], [hc[0] - 30 * s, hc[1] - 58 * s], [hc[0] + 20 * s, hc[1] - 60 * s], [hc[0] + 52 * s * fc, hc[1] - 30 * s], [hc[0] + 30 * s * fc, hc[1] - 26 * s], [hc[0] - 14 * s * fc, hc[1] + 10 * s], [hc[0] - 36 * s * fc, hc[1] + 56 * s]];
        scarf.setAttribute('d', inkLoop(sc, { seed: k + 40, t, amp: 0.8 }));
        scarfR.setAttribute('d', inkPath(sc, { w: 4, seed: k + 41, t, closed: true, amp: 0.8 }));
        dots.setAttribute('d', [[-30, -30], [0, -44], [-44, 4], [-20, 20]].map((d, i) => inkDot(hc[0] + d[0] * s * fc, hc[1] + d[1] * s, 5 * s, 5 * s, k + 42 + i, t)).join(' '));
      }
      return { hc, hL, hR, leaf: basketR ? basketR._leaf : null };
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
      return kas.update(t, s.pose || 'idle', oo);
    }
    return { update };
  }

  // ------------------------------------------------------------------ hand-written label (Patrick Hand)
  function label(parent, o, W, H) {
    const g = el(parent, 'g');
    const col = o.color === 'red' ? INK.red : o.color === 'blue' ? INK.blue : o.color === 'paper' ? INK.paperLight : INK.ink;
    const halo = el(g, 'text', { 'font-family': INK_FONT, 'font-size': o.size || 64, 'text-anchor': 'middle', fill: 'none', stroke: INK.paperLight, 'stroke-width': 12, 'stroke-linejoin': 'round' });
    const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': o.size || 64, 'text-anchor': 'middle', fill: col });
    halo.textContent = tx.textContent = o.text || '';
    if (o.halo === false) halo.textContent = '';
    if (o.dim) { tx.setAttribute('fill-opacity', 0.4); halo.setAttribute('stroke-opacity', 0.4); }
    const ul = inkEl(g, col), arrow = inkEl(parent, col);
    function update(lt, t, cues) {
      const a = atOr(cues, o.at, 0.3), p = spring(lt, a, 0.5);
      if (lt < a) { g.setAttribute('transform', 'scale(0)'); arrow.setAttribute('d', ''); return; }
      const x = (o.x ?? 0.5) * W, y = (o.y ?? 0.3) * H;
      let pp = p;
      if (o.dim) { const d = atOr(cues, o.dim, null), on = d != null && lt >= d; tx.setAttribute('fill-opacity', on ? 1 : 0.4); halo.setAttribute('stroke-opacity', on ? 1 : 0.4); pp *= 1 + 0.25 * punch(lt, d, 0.8); }
      g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${o.rot ?? -3}) scale(${f1(pp * 100) / 100})`);
      const w = (o.text || '').length * (o.size || 64) * 0.22;
      ul.setAttribute('d', o.underline === false ? '' : inkPath([[-w, 14], [w, 10]], { w: 5, seed: 900 + (o.text || '').length, t, amp: 1 }));
      if (o.arrow) {
        const q = clamp01((lt - a) / 0.5), tx2 = o.arrow[0] * W, ty2 = o.arrow[1] * H, sx = x + (tx2 > x ? w * 0.6 : -w * 0.6), sy = y + 20;
        const ex = lerp(sx, tx2, q), ey = lerp(sy, ty2, q), ang = Math.atan2(ey - sy, ex - sx);
        arrow.setAttribute('d', q > 0.05 ? inkPath([[sx, sy], [(sx + ex) / 2, (sy + ey) / 2 - 30], [ex, ey]], { w: 6, seed: 950, t }) + ' ' +
          inkPath([[ex - Math.cos(ang - 0.5) * 34, ey - Math.sin(ang - 0.5) * 34], [ex, ey], [ex - Math.cos(ang + 0.5) * 34, ey - Math.sin(ang + 0.5) * 34]], { w: 6, seed: 951, t, smooth: false }) : '');
      }
    }
    return { update };
  }

  window.CAY = { atOr, f1, faceOf, dirOf, TEA, LEAF, R2, glass, flash, press, terraces, rain, cloud, person, kasif, label };
})();
