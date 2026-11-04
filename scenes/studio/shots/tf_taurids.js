// tf_taurids: shots for the Stickstory Short "Taurid fireballs" (2026-11-04): every November the Taurids send big,
// slow fireballs across the sky; they are crumbs of Comet Encke (orbit worked out by Johann Encke, who linked the
// sightings of 1786, 1795, 1805 and 1818), which loops the Sun every 3.3 years and sheds rock on every lap; most
// meteors are sand grains, Taurids can be pebbles, so they burn longer and brighter. Parametric for any "meteor /
// comet / fireball" story. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line
// boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.kasif,
// LH.label, LH.person) lazily at build time. The night sky itself comes from the "night" set (sets.js).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = LH label {text, x, y, at, size, color: ink|red|gold|blue|paper, font: hand|serif, card, rot, underline}
//   F = fireball {from: [x, y], to: [x, y] (0..1), at: cue|sec, dur: 2.8, size: 1, train: true (smoky trail left
//       behind after it fades), flare: 0.7 (0..1 of the path where it flares)}
//
// SHOTS.tf_sky   — night view from a hill or over rooftops. P: {mode: "hill"|"roofs", gy: 0.6 (ground 0..1 H, where
//   Kaşif stands), hy: 0.34 (horizon), town: true (small lit houses in the valley, hill mode), fireballs: [F],
//   kasif: K | false, crowd: {n: 5, at: cue (one of them points up)} | false (heads + shoulders from behind, bottom),
//   comet: {x, y (0..1), s: 1, at} | false (a faint ghost comet in the sky), stars: 46, labels: [L]}
// SHOTS.tf_orbit — a full-frame hand-drawn orbit chart (no set): the Sun with turning rays, dashed planet orbits with
//   moving planets, a ring of asteroid dots, Encke's long red dashed ellipse. P: {mode: "comet"|"loop"|"shed",
//   sun: [0.5, 0.29], au: 305 (px per astronomical unit), tilt: -10 (deg), q: 0.34, e: 0.848 (Encke's orbit),
//   comet: {M0: -0.35 (start mean anomaly, turns), laps: 0 (turns during the scene), s: 1, at},
//   counter: {text: "3.3 YEARS", at} (a big serif card), earth: {at: cue (reaches the debris crossing)},
//   labels: [L]}   comet: the comet big near the Sun; loop: it races one full lap (fast near the Sun, slow far
//   out); shed: it leaves rocky crumbs along the whole orbit, then Earth runs into them (sparks).
// SHOTS.tf_desk  — 1819 study by candlelight: an astronomer (hatless, dark coat) writes at a desk; four pinned notes
//   on the wall each show a small comet sketch and a year; at "link" a red thread joins them into one arc and at
//   "orbit" a big ellipse is sketched on his sheet. P: {gy: 0.6 (desk top), notes: ["1786", "1795", "1805", "1818"],
//   name: {text, at} (hand label), labels}
// SHOTS.tf_size  — a night study table under a window: a big magnifying glass over a single sand grain on a
//   fingertip-size dish, through the window thin faint meteors flick past; a dashed arrow links grain and streak.
//   P: {gy: 0.62, labels}   cues: grain (the grain pops in), arrow
// SHOTS.tf_burn  — two meteors fall side by side over dark hills: the left one (sand) flicks and dies fast, the right
//   one (pebble) is fat, bright and long, flares and leaves a train. P: {hy: 0.4, gy: 0.7, labels, small: F, big: F}
//   cues: small, big
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const SERIF = 'Fraunces, Georgia, serif';
  const NIGHT = () => mix(INK.ink, INK.blue, 0.28);
  const NIGHT2 = () => mix(INK.ink, INK.blue, 0.5);
  const NIGHT3 = () => mix(INK.inkSoft, INK.blue, 0.45);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.3);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const set = (e, d) => e.setAttribute('d', d || '');

  // ------------------------------------------------------------------ twinkling stars (dots that pulse)
  function stars(parent, seed, n, W, y0, y1) {
    const e = inkEl(parent, INK.paperLight), r = rng(seed), S = [];
    for (let i = 0; i < n; i++) S.push([r() * W, y0 + r() * (y1 - y0), 2.5 + r() * 4, r() * 6.28, 1.5 + r() * 2.5]);
    return { update(t) {
      set(e, S.map(([x, y, s, ph, sp], i) => {
        const k = 0.55 + 0.45 * Math.sin(t * sp + ph), rr = s * k;
        return inkDot(x, y, rr, rr, seed + i, t, 0.3) + (s > 5.2 ? ' ' + inkPath([[x - rr * 2.6, y], [x + rr * 2.6, y]], { w: 2, seed: seed + 300 + i, t, amp: 0.3 }) + ' ' + inkPath([[x, y - rr * 2.6], [x, y + rr * 2.6]], { w: 2, seed: seed + 400 + i, t, amp: 0.3 }) : '');
      }).join(' '));
    } };
  }

  // ------------------------------------------------------------------ a slow fireball with a tapering glowing trail
  function fireball(parent, seed) {
    const g = el(parent, 'g');
    const train = inkEl(g, INK.paperLight, { 'fill-opacity': 0.42 });
    const outer = inkEl(g, INK.red, { 'fill-opacity': 0.55 });
    const mid = inkEl(g, INK.gold);
    const core = inkEl(g, INK.paperLight);
    const halo = inkEl(g, INK.gold, { 'fill-opacity': 0.35 });
    const head = inkEl(g, INK.gold), headC = inkEl(g, INK.paperLight);
    const sparks = inkEl(g, INK.gold), sparks2 = inkEl(g, INK.paperLight);
    const all = [train, outer, mid, core, halo, head, headC, sparks, sparks2];
    function taper(pts, w0, w1, sd, t) {
      const L = [], R = [], n = pts.length;
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
        const w = lerp(w0, w1, Math.pow(i / (n - 1), 1.6)), nx = -dy / d * w, ny = dx / d * w;
        L.push([pts[i][0] + nx, pts[i][1] + ny]); R.push([pts[i][0] - nx, pts[i][1] - ny]);
      }
      return inkLoop(L.concat(R.reverse()), { seed: sd, t, amp: 0.8 });
    }
    // F in stage px: {A, B, at, dur, size, train, flare, len}
    function update(lt, t, F) {
      const p = (lt - F.at) / F.dur;
      if (p <= 0) { all.forEach(e => set(e)); return null; }
      const pc = Math.min(1, p), u = F.size;
      const at = q => [lerp(F.A[0], F.B[0], q), lerp(F.A[1], F.B[1], q) + Math.sin(q * 3.1) * 8];
      const fade = p > 1 ? Math.max(0, 1 - (p - 1) * F.dur / 0.5) : 1;
      const flare = 1 + 0.7 * Math.exp(-Math.pow((pc - (F.flare ?? 0.7)) * 9, 2));
      const len = F.len ?? 0.55;
      const q0 = Math.max(0, pc - len), N = 14, pts = [];
      for (let i = 0; i <= N; i++) pts.push(at(lerp(q0, pc, i / N)));
      const H0 = pts[N];
      if (F.train !== false) {
        const tr = [], tq0 = Math.max(0, pc - 1.2);
        for (let i = 0; i <= 18; i++) { const q = lerp(tq0, pc * 0.92, i / 18), b = at(q), drift = (lt - F.at - q * F.dur) * 6; tr.push([b[0] + Math.sin(q * 20 + t * 0.8) * 6 + drift, b[1] + drift * 0.6]); }
        const tf = p > 1 ? Math.max(0, 1 - (p - 1) * F.dur / 3.5) : 1;
        train.setAttribute('fill-opacity', f1(0.42 * tf * 100) / 100);
        set(train, tf > 0.02 ? taper(tr, 1, 9 * u, seed + 1, t) : '');
      }
      if (fade <= 0.01) { [outer, mid, core, halo, head, headC, sparks, sparks2].forEach(e => set(e)); return H0; }
      const w = 30 * u * flare * fade;
      set(outer, taper(pts, 1, w * 1.25, seed + 2, t));
      set(mid, taper(pts, 0.5, w * 0.82, seed + 3, t));
      set(core, taper(pts.slice(Math.floor(N * 0.4)), 0.4, w * 0.38, seed + 4, t));
      const hr = w * 1.05 * (1 + 0.16 * Math.sin(t * 23) + 0.06 * Math.sin(t * 37));
      set(halo, inkCircle(H0[0], H0[1], hr * 2.1, seed + 5, t, { fill: true, n: 12 }));
      set(head, inkCircle(H0[0], H0[1], hr * 1.2, seed + 6, t, { fill: true, n: 10 }));
      set(headC, inkCircle(H0[0], H0[1], hr * 0.62, seed + 7, t, { fill: true, n: 8 }));
      // sparks peel off behind the head
      const S1 = [], S2 = [], fr = inkFrame(t);
      for (let i = 0; i < 10; i++) {
        const q = pc - (i + 1) * 0.03 - hn(seed + fr, i) * 0.02; if (q <= q0) continue;
        const b = at(q), off = (hn(seed + fr * 3, i + 20) - 0.5) * w * 2.2, r0 = (3 + hn(seed, i) * 5) * u * fade;
        (i % 2 ? S2 : S1).push(inkDot(b[0] + off * 0.6, b[1] + off, r0, r0, seed + 60 + i, t, 0.3));
      }
      set(sparks, S1.join(' ')); set(sparks2, S2.join(' '));
      return H0;
    }
    return { update };
  }
  const fbStage = (F, W, H, cues, fb) => ({ A: [F.from[0] * W, F.from[1] * H], B: [F.to[0] * W, F.to[1] * H], at: atOr(cues, F.at, fb), dur: F.dur ?? 2.8, size: (F.size ?? 1) * W / 1080, train: F.train, flare: F.flare, len: F.len });

  // ------------------------------------------------------------------ a comet: rocky nucleus, glowing coma, two tails
  function comet(parent, seed) {
    const g = el(parent, 'g');
    const dust = inkEl(g, mix(INK.gold, INK.paperLight, 0.35), { 'fill-opacity': 0.7 });
    const ion = inkEl(g, mix(INK.blue, INK.paperLight, 0.3), { 'fill-opacity': 0.75 });
    const tailR = inkEl(g), coma = inkEl(g, INK.gold, { 'fill-opacity': 0.45 }), comaC = inkEl(g, INK.paperLight);
    const rock = inkEl(g, INK.inkSoft), rockR = inkEl(g);
    const all = [dust, ion, tailR, coma, comaC, rock, rockR];
    return { update(t, x, y, s, ang, tl = 1) {
      if (s <= 0.01) { all.forEach(e => set(e)); return; }
      const c = Math.cos(ang), sn = Math.sin(ang), P = (a, b) => [x + c * a - sn * b, y + sn * a + c * b];
      const L = 380 * s * tl, sw = Math.sin(t * 1.3) * 0.05;
      const ionP = [P(0, -20 * s), P(L * 0.5, -36 * s), P(L, -50 * s + L * sw), P(L * 1.02, 40 * s + L * sw), P(L * 0.5, 30 * s), P(0, 20 * s)];
      const dustP = [P(0, -10 * s), P(L * 0.45, 30 * s), P(L * 0.8, 120 * s + L * sw), P(L * 0.72, 190 * s + L * sw), P(L * 0.35, 90 * s), P(0, 24 * s)];
      set(dust, inkLoop(dustP, { seed: seed + 1, t, amp: 1 }));
      set(ion, inkLoop(ionP, { seed: seed + 2, t, amp: 1 }));
      const st = [];
      for (let i = 0; i < 5; i++) { const b = -26 + i * 13; st.push(inkPath([P(40 * s, b * s), P(L * (0.55 + i * 0.08), (b * 1.5 + L * sw * 0.3) * s / s)], { w: 2.5, seed: seed + 10 + i, t, amp: 1 })); }
      set(tailR, st.join(' '));
      set(coma, inkCircle(x, y, 74 * s * (1 + 0.05 * Math.sin(t * 3)), seed + 3, t, { fill: true }));
      set(comaC, inkCircle(x, y, 40 * s, seed + 4, t, { fill: true }));
      const R = [], n = 9; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + t * 0.4, rr = 22 * s * (0.75 + hn(seed, i) * 0.45); R.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.85]); }
      set(rock, inkLoop(R, { seed: seed + 5, t, amp: 0.8 }));
      set(rockR, inkPath(R, { w: 4, seed: seed + 6, t, closed: true, amp: 0.8 }));
    } };
  }

  // ------------------------------------------------------------------ small houses with lit windows
  function houses(parent, seed, fillCol) {
    const body = inkEl(parent, fillCol), lit = inkEl(parent, INK.gold), edge = inkEl(parent, INK.ink);
    const r = rng(seed), HS = Array.from({ length: 16 }, () => [r(), r(), r(), r()]);
    return { update(t, W, x0, x1, base, s, n, smoke) {
      const B = [], Lt = [], E = [], step = (x1 - x0) / n;
      for (let i = 0; i < n; i++) {
        const [a, b, c, d] = HS[i % 16], w = step * (0.62 + a * 0.3), h = (70 + b * 70) * s, x = x0 + i * step + step * 0.1, y = base + (c - 0.5) * 12 * s;
        const roof = h * (0.45 + d * 0.3);
        const shape = [[x, y], [x, y - h], [x + w * 0.5, y - h - roof], [x + w, y - h], [x + w, y]];
        B.push(inkLoop(shape, { seed: seed + i, t, smooth: false, amp: 0.7 }));
        E.push(inkPath(shape, { w: 3.5 * Math.min(1.4, s), seed: seed + 40 + i, t, closed: false, smooth: false, amp: 0.7 }));
        if (smoke && i % 3 === 1) {   // chimney + rising smoke
          const cx = x + w * 0.72, cy = y - h - roof * 0.42;
          B.push(inkLoop([[cx - 9 * s, cy + 10 * s], [cx - 9 * s, cy - 34 * s], [cx + 11 * s, cy - 34 * s], [cx + 11 * s, cy + 6 * s]], { seed: seed + 70 + i, t, smooth: false, amp: 0.5 }));
          const SM = [];
          for (let k = 0; k < 6; k++) { const ph = (t * 0.35 + k / 6) % 1; SM.push([cx + Math.sin(ph * 6 + i) * 18 * s + ph * 40 * s, cy - 40 * s - ph * 210 * s]); }
          SM.sort((p1, p2) => p2[1] - p1[1]);
          E.push(inkPath(SM, { w: 3, seed: seed + 90 + i, t, amp: 1 }));
        }
        const nwin = 1 + (i % 2);
        for (let k = 0; k < nwin; k++) {
          const on = 0.75 + 0.25 * Math.sin(t * (1.5 + a) + i + k);
          const wx = x + w * (nwin === 1 ? 0.38 : 0.18 + k * 0.42), wy = y - h * 0.62, ww = w * 0.22, wh = h * 0.32 * on + h * 0.04;
          Lt.push(inkLoop([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], { seed: seed + 120 + i * 3 + k, t, smooth: false, amp: 0.5 }));
        }
      }
      set(body, B.join(' ')); set(lit, Lt.join(' ')); set(edge, E.join(' '));
    } };
  }

  // ------------------------------------------------------------------ a dark foreground hill with grass tufts
  function front(parent, seed, col, col2, amp = 26) {
    const mass = inkEl(parent, col || NIGHT()), tufts = inkEl(parent, col2 || NIGHT2()), edge = inkEl(parent, INK.ink);
    return { update(t, W, H, top, tilt = 0) {
      const pts = [[-60, H + 60]];
      for (let i = 0; i <= 10; i++) { const x = -60 + i * (W + 120) / 10; pts.push([x, top + Math.sin(i * 1.1 + seed) * amp + (i / 10 - 0.5) * tilt]); }
      pts.push([W + 60, H + 60]);
      set(mass, inkLoop(pts, { seed: seed + 1, t, amp: 1 }));
      set(edge, inkPath(pts.slice(1, -1), { w: 6, seed: seed + 2, t, amp: 1 }));
      const T = [];
      for (let i = 0; i < 24; i++) {
        const x = (i + hn(seed, i)) / 24 * W, y0 = top + Math.sin((x + 60) / (W + 120) * 10 * 1.1 + seed) * amp + 18 + hn(seed, i + 50) * 30;
        const hh = 40 + hn(seed, i + 9) * 60, sw = Math.sin(t * 1.4 + i) * 9;
        T.push(inkLoop([[x - 10, y0 + 20], [x - 3, y0], [x + sw, y0 - hh], [x + 6, y0], [x + 14, y0 + 20]], { seed: seed + 10 + i, t, amp: 0.6 }));
      }
      set(tufts, T.join(' '));
    } };
  }

  // ------------------------------------------------------------------ crowd: heads and shoulders seen from behind
  // each watcher gets a coat with a collar, a head and a hat (beanie with a bobble, brimmed hat or hood); the middle
  // one raises an arm with a hand and a pointing finger at `pointAt`
  function crowd(parent, seed) {
    const bodies = inkEl(parent, NIGHT2()), collars = inkEl(parent, NIGHT3()), heads = inkEl(parent, mix(INK.inkSoft, INK.stain, 0.35)), hats = inkEl(parent, mix(INK.blue, INK.inkSoft, 0.45)), hats2 = inkEl(parent, mix(INK.blue, INK.ink, 0.3)), rims = inkEl(parent, INK.ink), arm = inkEl(parent, NIGHT2()), hand = inkEl(parent, mix(INK.inkSoft, INK.stain, 0.35));
    return { update(t, lt, W, H, n, base, pointAt, s = 1) {
      const B = [], CL = [], Hd = [], HT = [], HT2 = [], R = [], A = [], HN = [];
      for (let i = 0; i < n; i++) {
        const x = (i + 0.5 + (hn(seed, i) - 0.5) * 0.35) / n * W, sc = s * (0.9 + hn(seed, i + 3) * 0.3), y = base + hn(seed, i + 7) * 50 * s;
        const sway = Math.sin(t * 0.9 + i * 1.7) * 6 * sc, hr = 58 * sc, kind = i % 3;
        const hx = x + sway, hy = y - 150 * sc;
        const sh = [[x - 160 * sc, H + 60], [x - 150 * sc, y + 10 * sc], [x - 110 * sc, y - 50 * sc], [x - 40 * sc, y - 76 * sc], [x + 40 * sc, y - 76 * sc], [x + 110 * sc, y - 50 * sc], [x + 150 * sc, y + 10 * sc], [x + 160 * sc, H + 60]];
        B.push(inkLoop(sh, { seed: seed + i, t, amp: 0.8 }));
        const col = [[x - 70 * sc, y - 60 * sc], [x - 30 * sc, y - 98 * sc + sway * 0.3], [x + 30 * sc, y - 98 * sc + sway * 0.3], [x + 70 * sc, y - 60 * sc], [x + 30 * sc, y - 40 * sc], [x - 30 * sc, y - 40 * sc]];
        CL.push(inkLoop(col, { seed: seed + 90 + i, t, amp: 0.6 }));
        R.push(inkPath(sh.slice(1, -1), { w: 5, seed: seed + 40 + i, t, amp: 0.8 }), inkPath(col, { w: 4, seed: seed + 95 + i, t, closed: true, amp: 0.6 }));
        if (kind === 2) {   // hood: a big loop around the head
          HT2.push(inkCircle(hx, hy + 6 * sc, hr * 1.3, seed + 20 + i, t, { fill: true, ry: hr * 1.35 }));
          R.push(inkCircle(hx, hy + 6 * sc, hr * 1.3, seed + 60 + i, t, { w: 5, ry: hr * 1.35 }));
        } else {
          Hd.push(inkCircle(hx, hy, hr, seed + 20 + i, t, { fill: true, ry: hr * 1.08 }));
          R.push(inkCircle(hx, hy, hr, seed + 60 + i, t, { w: 5, ry: hr * 1.08 }));
          if (kind === 0) {   // beanie with a bobble
            const bn = [[hx - hr * 1.02, hy - hr * 0.15], [hx - hr * 0.8, hy - hr * 0.95], [hx, hy - hr * 1.22], [hx + hr * 0.8, hy - hr * 0.95], [hx + hr * 1.02, hy - hr * 0.15]];
            HT.push(inkLoop(bn, { seed: seed + 120 + i, t, amp: 0.6 }), inkCircle(hx, hy - hr * 1.3, hr * 0.26, seed + 125 + i, t, { fill: true }));
            R.push(inkPath(bn, { w: 4, seed: seed + 130 + i, t, closed: true, amp: 0.6 }), inkPath([[hx - hr * 1.02, hy - hr * 0.3], [hx + hr * 1.02, hy - hr * 0.3]], { w: 4, seed: seed + 135 + i, t }));
          } else {            // brimmed hat
            const br = inkEllipsePts(hx, hy - hr * 0.55, hr * 1.55, hr * 0.28, seed + 140 + i, 14), cr = [[hx - hr * 0.8, hy - hr * 0.55], [hx - hr * 0.7, hy - hr * 1.35], [hx + hr * 0.7, hy - hr * 1.35], [hx + hr * 0.8, hy - hr * 0.55]];
            HT2.push(inkLoop(br, { seed: seed + 141 + i, t, amp: 0.5 }), inkLoop(cr, { seed: seed + 142 + i, t, amp: 0.5, smooth: false }));
            R.push(inkPath(br, { w: 4, seed: seed + 143 + i, t, closed: true, amp: 0.5 }), inkPath(cr, { w: 4, seed: seed + 144 + i, t, closed: true, smooth: false, amp: 0.5 }));
          }
        }
        if (pointAt != null && i === Math.floor(n / 2) && lt > pointAt) {
          const k = spring(lt, pointAt, 0.6), sx = x + 100 * sc, sy = y - 50 * sc;
          const el2 = [sx + 70 * sc * k, sy - 170 * sc * k], ex = sx + 120 * sc * k, ey = sy - 330 * sc * k + Math.sin(t * 2) * 6;
          A.push(inkLoop([[sx - 26 * sc, sy + 20 * sc], [el2[0] - 22 * sc, el2[1]], [ex - 16 * sc, ey], [ex + 16 * sc, ey + 6 * sc], [el2[0] + 24 * sc, el2[1] + 8 * sc], [sx + 34 * sc, sy + 30 * sc]], { seed: seed + 80, t, amp: 0.6 }));
          R.push(inkPath([[sx - 26 * sc, sy + 20 * sc], [el2[0] - 22 * sc, el2[1]], [ex - 16 * sc, ey]], { w: 5, seed: seed + 82, t }), inkPath([[ex + 16 * sc, ey + 6 * sc], [el2[0] + 24 * sc, el2[1] + 8 * sc], [sx + 34 * sc, sy + 30 * sc]], { w: 5, seed: seed + 83, t }));
          HN.push(inkCircle(ex, ey - 14 * sc, 26 * sc, seed + 84, t, { fill: true }));
          R.push(inkCircle(ex, ey - 14 * sc, 26 * sc, seed + 85, t, { w: 4 }), inkPath([[ex + 4 * sc, ey - 34 * sc], [ex + 22 * sc, ey - 92 * sc]], { w: 12 * sc, seed: seed + 86, t }));
        }
      }
      set(bodies, B.join(' ')); set(collars, CL.join(' ')); set(heads, Hd.join(' ')); set(hats, HT.join(' ')); set(hats2, HT2.join(' ')); set(rims, R.join(' ')); set(arm, A.join(' ')); set(hand, HN.join(' '));
    } };
  }

  // ------------------------------------------------------------------ pine silhouettes standing on a ground line
  function pines(parent, seed, col) {
    const T = inkEl(parent, col), TR = inkEl(parent);
    return { update(t, W, xs, base, hh) {
      const A = [], B = [];
      xs.forEach((x0, i) => {
        const x = x0 * W, b = base, h = hh * (0.8 + hn(seed, i) * 0.45), w = h * 0.34, sw = Math.sin(t * 0.8 + i) * h * 0.012;
        const tr = [[x - w * 0.12, b + 10], [x - w, b - h * 0.18], [x - w * 0.4, b - h * 0.28], [x - w * 0.8, b - h * 0.52], [x - w * 0.3, b - h * 0.6], [x + sw, b - h], [x + w * 0.3, b - h * 0.6], [x + w * 0.8, b - h * 0.52], [x + w * 0.4, b - h * 0.28], [x + w, b - h * 0.18], [x + w * 0.12, b + 10]];
        A.push(inkLoop(tr, { seed: seed + 10 + i, t, smooth: false, amp: 0.8 })); B.push(inkPath(tr, { w: 3.5, seed: seed + 40 + i, t, closed: true, smooth: false, amp: 0.8 }));
      });
      set(T, A.join(' ')); set(TR, B.join(' '));
    } };
  }

  // ------------------------------------------------------------------ rocks scattered on the foreground
  function rocks(parent, seed) {
    const R = inkEl(parent, NIGHT2()), RR = inkEl(parent, INK.ink), HL = inkEl(parent, NIGHT3());
    return { update(t, W, H, top, n) {
      const A = [], B = [], C = [];
      for (let i = 0; i < n; i++) {
        const x = (i + 0.3 + hn(seed, i) * 0.5) / n * W, y = top + 60 + hn(seed, i + 5) * (H - top - 120), r = 40 + hn(seed, i + 9) * 70;
        const pts = inkEllipsePts(x, y, r, r * 0.55, seed + i, 9, 0, 0.12);
        A.push(inkLoop(pts, { seed: seed + i, t, amp: 0.6 })); B.push(inkPath(pts, { w: 5, seed: seed + 30 + i, t, closed: true, amp: 0.6 }));
        C.push(inkLoop([[x - r * 0.6, y - r * 0.2], [x - r * 0.1, y - r * 0.45], [x + r * 0.3, y - r * 0.38], [x - r * 0.2, y - r * 0.15]], { seed: seed + 60 + i, t, amp: 0.4 }));
      }
      set(R, A.join(' ')); set(RR, B.join(' ')); set(HL, C.join(' '));
    } };
  }

  // ------------------------------------------------------------------ glowing crumbs drifting down (a comet's dust)
  function embers(parent, seed) {
    const G = inkEl(parent, INK.gold), C = inkEl(parent, INK.paperLight), TR = inkEl(parent, INK.gold, { 'fill-opacity': 0.45 });
    return { update(t, W, H, n, y0, y1, speed = 1) {
      const A = [], B = [], D = [];
      for (let i = 0; i < n; i++) {
        const sp = (0.06 + hn(seed, i) * 0.08) * speed, ph = (t * sp + hn(seed, i + 3)) % 1;
        const x = hn(seed, i + 7) * W + Math.sin(t * 0.7 + i) * 30 - ph * 120, y = lerp(y0, y1, ph), r = 5 + hn(seed, i + 11) * 9, fl = 0.7 + 0.3 * Math.sin(t * 6 + i);
        A.push(inkCircle(x, y, r * fl, seed + i, t, { fill: true, n: 8 }));
        B.push(inkCircle(x, y, r * 0.45, seed + 100 + i, t, { fill: true, n: 6 }));
        D.push(inkLoop([[x + r * 0.7, y - r * 0.5], [x + r * 5, y - r * 3], [x + r * 0.2, y + r * 0.6]], { seed: seed + 200 + i, t, amp: 0.3 }));
      }
      set(TR, D.join(' ')); set(G, A.join(' ')); set(C, B.join(' '));
    } };
  }

  // ------------------------------------------------------------------ SHOTS.tf_sky
  SH.tf_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 517, u = W / 1080, mode = P.mode || 'hill';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, hy = (P.hy ?? 0.34) * H;
      const ST = stars(el(root, 'g'), sd + 1, P.stars ?? 46, W, 270, hy - 30);
      const CM = P.comet ? comet(el(root, 'g'), sd + 5) : null;
      const FB = (P.fireballs || []).map((F, i) => fireball(el(root, 'g'), sd + 100 + i * 37));
      const valley = mode === 'hill' ? inkEl(el(root, 'g'), mix(NIGHT3(), INK.blue, 0.25)) : null;
      const town = mode === 'hill' && P.town !== false ? houses(el(root, 'g'), sd + 200, NIGHT3()) : null;
      const back = mode === 'roofs' ? houses(el(root, 'g'), sd + 300, NIGHT3()) : null;
      const midR = mode === 'roofs' ? houses(el(root, 'g'), sd + 400, NIGHT2()) : null;
      const TRE = P.trees ? pines(el(root, 'g'), sd + 430, NIGHT2()) : null;
      const hillM = mode === 'hill' ? front(el(root, 'g'), sd + 450, mix(NIGHT3(), NIGHT2(), 0.45), NIGHT2(), 8) : null;
      const kas = P.kasif ? L.kasif(el(root, 'g'), P.kasif, W, H, sd + 7) : null;
      const fr = front(el(root, 'g'), sd + 500);
      const frontR = mode === 'roofs' ? houses(el(root, 'g'), sd + 600, NIGHT()) : null;
      const RK = P.rocks ? rocks(el(root, 'g'), sd + 650) : null;
      const CR = P.crowd ? crowd(el(root, 'g'), sd + 700) : null;
      const EM = P.embers ? embers(el(root, 'g'), sd + 800) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          ST.update(t);
          if (CM) { const c = P.comet, k = spring(lt, atOr(cues, c.at, 0.2), 0.9); CM.update(t, (c.x ?? 0.8) * W + Math.sin(t * 0.3) * 8, (c.y ?? 0.2) * H, (c.s ?? 0.5) * u * k, c.ang ?? -2.6, 1); }
          FB.forEach((f, i) => f.update(lt, t, fbStage(P.fireballs[i], W, H, cues, 0.1 + i * 1.2)));
          if (valley) { const vb = hy + (gy - hy) * 0.55 - 30 * u, V = [[-40, gy + 20]]; for (let i = 0; i <= 8; i++) V.push([-40 + i * (W + 80) / 8, vb + Math.sin(i * 1.9 + sd) * 14 * u]); V.push([W + 40, gy + 20]); set(valley, inkLoop(V, { seed: sd + 210, t, amp: 0.8 })); }
          if (town) town.update(t, W, 0.04 * W, 0.96 * W, hy + (gy - hy) * 0.55, 0.62 * u, 11, true);
          if (back) back.update(t, W, -0.05 * W, 1.05 * W, gy - 120 * u, 0.9 * u, 9, false);
          if (midR) midR.update(t, W, -0.12 * W, 1.1 * W, gy + (P.mid ?? 360) * u, 2.1 * u, 6, true);
          if (TRE) TRE.update(t, W, P.trees.x || [0.06, 0.16, 0.3, 0.72, 0.86, 0.95], gy + 6, (P.trees.h ?? 300) * u);
          if (hillM) hillM.update(t, W, H, gy - 4, 0);
          if (kas) kas.update(lt, t, cues);
          if (mode === 'hill') fr.update(t, W, H, (P.front ?? 0.8) * H, 40);
          if (frontR) frontR.update(t, W, -0.25 * W, 1.25 * W, H + 60, 3.0 * u, 5, true);
          if (RK) RK.update(t, W, H, (P.front ?? 0.8) * H, P.rocks.n ?? 5);
          if (EM) EM.update(t, W, H, P.embers.n ?? 16, (P.embers.y0 ?? 0.15) * H, Math.min((P.embers.y1 ?? 0.75) * H, hy - 20 * u), P.embers.speed ?? 1);
          if (CR) CR.update(t, lt, W, H, P.crowd.n ?? 5, (P.crowd.y ?? 0.86) * H, atOr(cues, P.crowd.at, null), (P.crowd.s ?? 1) * u);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.tf_orbit
  SH.tf_orbit = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 811, u = W / 1080, mode = P.mode || 'loop';
      const root = el(svg, 'g');
      const S = [(P.sun?.[0] ?? 0.5) * W, (P.sun?.[1] ?? 0.29) * H], au = (P.au ?? 305) * u;
      const q = P.q ?? 0.34, e = P.e ?? 0.848, a = q / (1 - e), tilt = (P.tilt ?? -10) * Math.PI / 180, base = -Math.PI / 2 + tilt;
      const pt = nu => { const r = a * (1 - e * e) / (1 + e * Math.cos(nu)) * au; return [S[0] + r * Math.cos(nu + base), S[1] + r * Math.sin(nu + base)]; };
      const nuOfM = M => { let E = M; for (let i = 0; i < 12; i++) E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2)); };
      const PL = [[0.387, 'mer', 0.24], [0.723, 'ven', 0.62], [1, 'ear', 1], [1.524, 'mar', 1.88]];
      const grid = inkEl(root, INK.inkSoft), belt = inkEl(root, INK.inkSoft), orbits = inkEl(root, INK.inkSoft);
      const ell = inkEl(root, INK.red);
      const debris = inkEl(root, INK.inkSoft), debrisG = inkEl(root, INK.gold);
      const rays = inkEl(root, INK.gold), sun = inkEl(root, INK.gold), sunC = inkEl(root, mix(INK.gold, INK.paperLight, 0.5)), sunR = inkEl(root);
      const planets = inkEl(root, INK.inkSoft), earthE = inkEl(root, INK.blue), earthR = inkEl(root), spark = inkEl(root, INK.red);
      const CM = comet(el(root, 'g'), sd + 50);
      const cardG = el(root, 'g'), card = inkEl(cardG, INK.paperLight), cardR = inkEl(cardG), cardT = L.txt(cardG, { 'font-family': SERIF, 'font-weight': 900, 'font-size': 112 * u, fill: INK.red });
      const LB = labels(root, P.labels, W, H);
      const dashes = (pts, w, sdd, t, on = 0.55) => { const D = []; for (let i = 0; i < pts.length - 1; i += 2) D.push(inkPath([pts[i], pts[i + 1]], { w, seed: sdd + i, t, amp: 0.5 })); return D.join(' '); };
      const C = P.comet || {};
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // chart grid: faint radial lines + a frame-filling ring of asteroid dots
          const G = [];
          for (let i = 0; i < 12; i++) { const an = i / 12 * 6.283 + 0.13; G.push(inkPath([[S[0] + Math.cos(an) * 60 * u, S[1] + Math.sin(an) * 60 * u], [S[0] + Math.cos(an) * 2400 * u, S[1] + Math.sin(an) * 2400 * u]], { w: 1.6, seed: sd + i, t, amp: 0.5 })); }
          set(grid, G.join(' '));
          const BD = [];
          for (let i = 0; i < (P.belt ?? 150); i++) { const r = (2.2 + hn(sd, i) * 1.1) * au, an = hn(sd, i + 400) * 6.283 + t * 0.02; const x = S[0] + Math.cos(an) * r, y = S[1] + Math.sin(an) * r; if (x < -20 || x > W + 20 || y < 250 || y > H + 20) continue; const rr = (2 + hn(sd, i + 9) * 3.5) * u; BD.push(inkDot(x, y, rr, rr * 0.8, sd + 600 + i, t, 0.3)); }
          set(belt, BD.join(' '));
          // planet orbits (dashed) + planets moving
          const O = [], PD = [];
          PL.forEach(([r, nm, per], j) => {
            const pts = []; for (let i = 0; i <= 72; i++) { const an = i / 72 * 6.283; pts.push([S[0] + Math.cos(an) * r * au, S[1] + Math.sin(an) * r * au]); }
            O.push(dashes(pts, 2.8, sd + 100 + j * 80, t));
            if (nm !== 'ear') { const an = hn(sd, j + 70) * 6.283 + t * 0.25 / per; PD.push(inkCircle(S[0] + Math.cos(an) * r * au, S[1] + Math.sin(an) * r * au, (nm === 'mer' ? 9 : 13) * u, sd + 300 + j, t, { fill: true })); }
          });
          set(orbits, O.join(' ')); set(planets, PD.join(' '));
          // Encke's ellipse (red dashes), drawn on over the first second
          const ep = []; const dr = mode === 'loop' || mode === 'shed' ? 1 : prog(lt, 0.1, 1.2);
          for (let i = 0; i <= 110 * dr; i++) ep.push(pt(-Math.PI + i / 110 * 6.283));
          set(ell, dashes(ep, 5, sd + 500, t));
          // the Sun
          const sr = 46 * u, rot = t * 0.25, RY = [];
          for (let i = 0; i < 12; i++) { const an = i / 12 * 6.283 + rot, l = (i % 2 ? 26 : 40) * u * (1 + 0.1 * Math.sin(t * 3 + i)); RY.push(inkLoop([[S[0] + Math.cos(an - 0.12) * sr * 1.2, S[1] + Math.sin(an - 0.12) * sr * 1.2], [S[0] + Math.cos(an) * (sr * 1.25 + l), S[1] + Math.sin(an) * (sr * 1.25 + l)], [S[0] + Math.cos(an + 0.12) * sr * 1.2, S[1] + Math.sin(an + 0.12) * sr * 1.2]], { seed: sd + 700 + i, t, smooth: false, amp: 0.6 })); }
          set(rays, RY.join(' '));
          set(sun, inkCircle(S[0], S[1], sr, sd + 720, t, { fill: true }));
          set(sunC, inkCircle(S[0] - 8 * u, S[1] - 8 * u, sr * 0.5, sd + 721, t, { fill: true }));
          set(sunR, inkCircle(S[0], S[1], sr, sd + 722, t, { w: 5 }));
          // the comet: Kepler motion (fast near the Sun)
          const st = atOr(cues, C.at, 0.15);
          const laps = C.laps ?? (mode === 'comet' ? 0.02 : 1);
          const span = Math.max(0.8, (dur - st) * (mode === 'shed' ? 0.62 : 0.88));
          const frac = mode === 'comet' ? lt / Math.max(1, dur) * laps : progIO(clamp01((lt - st) / span), 0, 1) * laps;
          const M = (C.M0 ?? (mode === 'comet' ? -0.06 : -0.5)) * 6.283 + frac * 6.283;
          let nu = nuOfM(M);
          if (C.y != null) { let bd = 1e9; for (let i = 1; i < 720; i++) { const nn = -Math.PI + i / 720 * 6.283, pp = pt(nn); if ((pp[0] < S[0]) === (C.side !== 'right')) { const d = Math.abs(pp[1] - C.y * H); if (d < bd) { bd = d; nu = nn; } } } nu += Math.sin(lt * 0.5) * 0.004 + lt * 0.003; }
          if (C.nu != null) nu = (C.nu + Math.sin(lt * 0.6) * 1.2 + lt * 0.8) * Math.PI / 180;
          const cp = pt(nu), rAU = a * (1 - e * e) / (1 + e * Math.cos(nu));
          const ang = Math.atan2(cp[1] - S[1], cp[0] - S[0]);
          const cs = (C.s ?? (mode === 'comet' ? 1.3 : 0.55)) * u * spring(lt, mode === 'comet' ? atOr(cues, C.at, 0.1) : 0, 0.7);
          CM.update(t, cp[0], cp[1], cs, ang, C.tail ?? (clamp01(1.4 / Math.max(0.5, rAU)) * (mode === 'comet' ? 1 : 0.8) + 0.25));
          // shed: crumbs left behind along the path the comet has covered (and older laps all round the orbit)
          if (mode === 'shed') {
            const DB = [], DG = [];
            const old = prog(lt, atOr(cues, 'older', dur * 0.45), 1.2);
            for (let i = 0; i < (P.crumbs ?? 280); i++) {
              const mi = hn(sd, i + 900), Mi = (C.M0 ?? -0.5) * 6.283 + mi * frac * 6.283;
              const showOld = hn(sd, i + 1300) < old;
              const MM = showOld ? hn(sd, i + 1700) * 6.283 : Mi;
              if (!showOld && mi * frac > frac - 0.004) continue;
              const p0 = pt(nuOfM(MM)), off = (hn(sd, i + 1100) - 0.5) * 46 * u, off2 = (hn(sd, i + 1500) - 0.5) * 46 * u;
              const rr = (3 + hn(sd, i + 1200) * 6) * u;
              (i % 5 === 0 ? DG : DB).push(inkLoop(inkEllipsePts(p0[0] + off, p0[1] + off2, rr, rr * 0.8, sd + 2000 + i, 6), { seed: sd + 2000 + i, t, amp: 0.4, smooth: false }));
            }
            set(debris, DB.join(' ')); set(debrisG, DG.join(' '));
          } else { set(debris); set(debrisG); }
          // Earth: in shed mode it runs into the crumbs at the crossing
          const crossNu = (() => { let best = 0, bd = 9; for (let i = 0; i < 360; i++) { const nn = -Math.PI + i / 360 * 6.283, rr = a * (1 - e * e) / (1 + e * Math.cos(nn)); if (Math.abs(rr - 1) < bd && Math.cos(nn + base) > 0) { bd = Math.abs(rr - 1); best = nn; } } return best; })();
          const cross = pt(crossNu), cA = Math.atan2(cross[1] - S[1], cross[0] - S[0]);
          const eAt = atOr(cues, P.earth?.at, dur * 0.75);
          const eA = mode === 'shed' ? cA + (lt - eAt) * 0.32 : 0.9 + t * 0.12;
          const ex = S[0] + Math.cos(eA) * au, ey = S[1] + Math.sin(eA) * au;
          set(earthE, inkCircle(ex, ey, 22 * u, sd + 800, t, { fill: true }));
          set(earthR, inkCircle(ex, ey, 22 * u, sd + 801, t, { w: 5 }));
          if (mode === 'shed' && lt > eAt - 0.2) {
            const SP = [], k = lt - eAt + 0.2;
            for (let i = 0; i < 9; i++) { const an = i / 9 * 6.283 + hn(sd + inkFrame(t), i) * 0.5, r0 = (34 + (k * 50 % 40)) * u; SP.push(inkPath([[ex + Math.cos(an) * r0, ey + Math.sin(an) * r0], [ex + Math.cos(an) * (r0 + 26 * u), ey + Math.sin(an) * (r0 + 26 * u)]], { w: 5, seed: sd + 850 + i, t })); }
            set(spark, SP.join(' '));
          } else set(spark);
          // the counter card
          if (P.counter) {
            const ca = atOr(cues, P.counter.at, 0.4), k = spring(lt, ca, 0.6) * (1 + 0.1 * punch(lt, atOr(cues, 'hit', null)));
            if (lt < ca) cardG.setAttribute('transform', 'scale(0)');
            else {
              const cx = (P.counter.x ?? 0.5) * W, cy = (P.counter.y ?? 0.5) * H;
              cardG.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(-3 + Math.sin(t * 2) * 1)}) scale(${f1(k * 100) / 100})`);
              cardT.textContent = P.counter.text || '3.3 YEARS';
              const w = cardT.textContent.length * 36 * u;
              const bx = [[-w - 40 * u, -100 * u], [w + 40 * u, -104 * u], [w + 44 * u, 40 * u], [-w - 36 * u, 44 * u]];
              set(card, inkLoop(bx, { seed: sd + 900, t, smooth: false, amp: 1 }));
              set(cardR, inkPath(bx, { w: 6, seed: sd + 901, t, closed: true, smooth: false, amp: 1 }));
              cardT.setAttribute('y', 0);
            }
          } else cardG.setAttribute('transform', 'scale(0)');
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ a candle
  function candle(parent, seed) {
    const glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.22 }), wax = inkEl(parent, INK.paperLight), waxR = inkEl(parent), fl = inkEl(parent, INK.gold), flC = inkEl(parent, INK.paperLight);
    return { update(t, x, y, s) {
      const fk = Math.sin(t * 9) * 0.12 + Math.sin(t * 13.7) * 0.08;
      set(glow, inkCircle(x, y - 150 * s, 190 * s * (1 + fk * 0.3), seed, t, { fill: true }));
      const body = [[x - 20 * s, y], [x - 20 * s, y - 110 * s], [x + 20 * s, y - 112 * s], [x + 20 * s, y]];
      set(wax, inkLoop(body, { seed: seed + 1, t, smooth: false, amp: 0.5 }));
      set(waxR, inkPath(body, { w: 4, seed: seed + 2, t, smooth: false, amp: 0.5 }) + ' ' + inkLoop([[x - 34 * s, y + 4 * s], [x + 34 * s, y + 4 * s], [x + 30 * s, y - 10 * s], [x - 30 * s, y - 10 * s]], { seed: seed + 3, t, amp: 0.5 }));
      const fy = y - 112 * s, sw = fk * 30 * s;
      set(fl, inkLoop([[x - 15 * s, fy - 16 * s], [x + sw, fy - 78 * s * (1 + fk)], [x + 15 * s, fy - 16 * s], [x, fy]], { seed: seed + 4, t, amp: 0.6 }));
      set(flC, inkLoop([[x - 6 * s, fy - 16 * s], [x + sw * 0.5, fy - 46 * s], [x + 6 * s, fy - 16 * s], [x, fy - 6 * s]], { seed: seed + 5, t, amp: 0.4 }));
    } };
  }

  // ------------------------------------------------------------------ a desk: top + front panel down to the bottom
  function desk(parent, seed) {
    const top = inkEl(parent, WOOD()), fr = inkEl(parent, WOOD_D()), lines = inkEl(parent);
    return { update(t, W, H, y) {
      set(top, inkLoop([[-40, y], [W + 40, y - 6], [W + 40, y + 46], [-40, y + 52]], { seed, t, smooth: false, amp: 0.6 }));
      set(fr, inkLoop([[-40, y + 50], [W + 40, y + 44], [W + 40, H + 40], [-40, H + 40]], { seed: seed + 1, t, smooth: false, amp: 0.6 }));
      const Ls = [inkPath([[-40, y], [W + 40, y - 6]], { w: 6, seed: seed + 2, t }), inkPath([[-40, y + 50], [W + 40, y + 44]], { w: 6, seed: seed + 3, t })];
      for (let i = 0; i < 7; i++) { const yy = y + 110 + i * (H - y) / 7; Ls.push(inkPath([[-20, yy], [W * 0.35, yy + 8 * Math.sin(i)], [W * 0.7, yy - 6], [W + 20, yy + 4]], { w: 2.5, seed: seed + 10 + i, t })); }
      [0.28, 0.72].forEach((q, i) => { const x = q * W, yy = y + 170; Ls.push(inkPath([[x - 150, yy], [x + 150, yy], [x + 150, yy + 200], [x - 150, yy + 200]], { w: 4, seed: seed + 30 + i, t, closed: true, smooth: false })); Ls.push(inkCircle(x, yy + 100, 14, seed + 40 + i, t, { w: 4 })); });
      set(lines, Ls.join(' '));
    } };
  }

  // ------------------------------------------------------------------ SHOTS.tf_desk
  SH.tf_desk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 271, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, NT = P.notes || ['1786', '1795', '1805', '1818'];
      const notes = NT.map((s, i) => { const g = el(root, 'g'); return { g, card: inkEl(g, INK.paperLight), r: inkEl(g), pin: inkEl(g, INK.red), cm: comet(el(g, 'g'), sd + 40 + i * 7), tx: L.txt(g, { 'font-family': SERIF, 'font-weight': 900, 'font-size': 56 * u, fill: INK.ink }) }; });
      const thread = inkEl(root, INK.red);
      const person = L.person(el(root, 'g'), sd + 100, { kind: 'sweater', hair: 'dark', col: mix(INK.ink, INK.blue, 0.35) });
      const dk = desk(el(root, 'g'), sd + 200);
      const sheet = inkEl(root, INK.paperLight), sheetR = inkEl(root), scrib = inkEl(root, INK.inkSoft), oval = inkEl(root, INK.red), quill = inkEl(root, INK.paperLight), quillR = inkEl(root);
      const cdl = candle(el(root, 'g'), sd + 300);
      const name = P.name ? L.label(el(root, 'g'), Object.assign({ x: 0.3, y: 0.36, size: 70, color: 'ink', rot: -4 }, P.name), W, H) : null;
      const LB = labels(root, P.labels, W, H);
      // note positions on the wall: an arc, left to right
      const NP = NT.map((s, i) => [W * (0.22 + i * 0.187), H * (0.2 + Math.abs(i - 1.5) * 0.045) + 20 * u]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const lk = atOr(cues, 'link', dur * 0.35), ob = atOr(cues, 'orbit', dur * 0.6);
          notes.forEach((n, i) => {
            const k = spring(lt, 0.05 + i * 0.18, 0.5), [x, y] = NP[i];
            const hl = 1 + 0.12 * punch(lt, lk + i * 0.18, 0.6);
            if (k <= 0.01) { n.g.setAttribute('transform', 'scale(0)'); return; }
            n.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1((i % 2 ? 4 : -4) + Math.sin(t * 1.3 + i) * 1.2)}) scale(${f1(k * hl * 100) / 100})`);
            const bw = 88 * u, bh = 120 * u, bx = [[-bw, -bh], [bw, -bh - 4], [bw + 4, bh], [-bw - 2, bh + 3]];
            set(n.card, inkLoop(bx, { seed: sd + i * 10, t, smooth: false, amp: 0.8 }));
            set(n.r, inkPath(bx, { w: 4, seed: sd + i * 10 + 1, t, closed: true, smooth: false, amp: 0.8 }));
            set(n.pin, inkCircle(0, -bh + 14 * u, 11 * u, sd + i * 10 + 2, t, { fill: true }));
            n.cm.update(t, -30 * u, -30 * u, 0.32 * u, -2.4 + i * 0.15, 0.9);
            n.tx.textContent = NT[i]; n.tx.setAttribute('y', 96 * u);
          });
          // the red thread joins the notes into one arc
          const tp = prog(lt, lk, 1.1);
          if (tp > 0) {
            const pts = []; const N = 40;
            for (let i = 0; i <= N * tp; i++) { const f = i / N * (NP.length - 1), j = Math.min(NP.length - 2, Math.floor(f)), r = f - j; const A = NP[j], B = NP[j + 1]; pts.push([lerp(A[0], B[0], r), lerp(A[1], B[1], r) - 125 * u - Math.sin(r * Math.PI) * 40 * u]); }
            set(thread, pts.length > 1 ? inkPath(pts, { w: 6, seed: sd + 60, t }) : '');
          } else set(thread);
          // the astronomer writing at the desk
          const px = 0.3 * W, ps = 1.3 * u, wr = Math.sin(t * 7) * 10 * u;
          const pen = [0.56 * W + wr, gy - 36 * u + Math.sin(t * 11) * 4 * u];
          person.update(t, px, gy + 260 * u, ps, { face: 1, seat: gy + 40 * u, lean: 18, armR: pen, armL: [0.48 * W, gy - 10 * u], look: [6, 8], brow: lt > ob ? 1 : 0.2 });
          dk.update(t, W, H, gy);
          // the sheet + scribbled sums + the ellipse sketched at "orbit"
          const sx = 0.6 * W, sy = gy + 22 * u, sh = [[sx - 200 * u, sy + 10 * u], [sx + 190 * u, sy - 6 * u], [sx + 220 * u, sy + 28 * u], [sx - 180 * u, sy + 42 * u]];
          set(sheet, inkLoop(sh, { seed: sd + 70, t, smooth: false, amp: 0.5 }));
          set(sheetR, inkPath(sh, { w: 3, seed: sd + 71, t, closed: true, smooth: false, amp: 0.5 }));
          const SC = [], nw = Math.floor(lt * 3) % 12 + 4;
          for (let i = 0; i < nw; i++) { const yy = sy + 6 * u + (i % 3) * 10 * u, xx = sx - 170 * u + Math.floor(i / 3) * 70 * u; SC.push(inkPath([[xx, yy], [xx + 50 * u, yy - 2 * u]], { w: 2.5, seed: sd + 80 + i, t })); }
          set(scrib, SC.join(' '));
          const op = prog(lt, ob, 1);
          if (op > 0) { const E = []; for (let i = 0; i <= 30 * op; i++) { const an = i / 30 * 6.283; E.push([sx + 110 * u + Math.cos(an) * 80 * u, sy + 18 * u + Math.sin(an) * 14 * u]); } set(oval, E.length > 1 ? inkPath(E, { w: 4, seed: sd + 90, t }) : ''); } else set(oval);
          const qv = [[pen[0], pen[1]], [pen[0] + 40 * u, pen[1] - 120 * u], [pen[0] + 70 * u, pen[1] - 170 * u], [pen[0] + 30 * u, pen[1] - 90 * u]];
          set(quill, inkLoop(qv, { seed: sd + 95, t, amp: 0.6 }));
          set(quillR, inkPath(qv, { w: 3, seed: sd + 96, t, closed: true, amp: 0.6 }));
          cdl.update(t, 0.88 * W, gy + 20 * u, 1.2 * u);
          if (name) name.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.tf_size
  SH.tf_size = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 633, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.62) * H;
      const wsky = inkEl(root, NIGHT2()), wR = inkEl(root);
      const streak = inkEl(root, INK.paperLight), streakG = inkEl(root, INK.gold);
      const dk = desk(el(root, 'g'), sd + 50);
      const dish = inkEl(root, INK.paperLight), dishR = inkEl(root);
      const grain = inkEl(root, mix(INK.stain, INK.gold, 0.4)), grainR = inkEl(root);
      const lensG = el(root, 'g'), lens = inkEl(lensG, mix(INK.paperLight, INK.blue, 0.12), { 'fill-opacity': 0.55 }), lensR = inkEl(lensG), handle = inkEl(lensG, WOOD_D()), big = inkEl(lensG, mix(INK.stain, INK.gold, 0.4)), bigR = inkEl(lensG), glint = inkEl(lensG, INK.paperLight);
      const arrow = inkEl(root, INK.red);
      const LB = labels(root, P.labels, W, H);
      // the window: x 0.2..0.8 W, y 0.14..0.5 H
      const wx0 = (P.win?.[0] ?? 0.3) * W, wx1 = (P.win?.[1] ?? 0.9) * W, wy0 = (P.win?.[2] ?? 0.16) * H, wy1 = (P.win?.[3] ?? 0.37) * H;
      const starsIn = (() => { const r = rng(sd + 9), S = []; for (let i = 0; i < 18; i++) S.push([lerp(wx0 + 20, wx1 - 20, r()), lerp(wy0 + 20, wy1 - 20, r()), 2.5 + r() * 3.5, r() * 6]); return S; })();
      const stE = inkEl(root, INK.paperLight);
      root.insertBefore(stE, streak);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const win = [[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]];
          set(wsky, inkLoop(win, { seed: sd + 2, t, smooth: false, amp: 0.6 }));
          set(wR, inkPath(win, { w: 12, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 9, seed: sd + 4, t }) + ' ' + inkPath([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], { w: 9, seed: sd + 5, t }));
          set(stE, starsIn.map(([x, y, s, ph], i) => { const k = 0.6 + 0.4 * Math.sin(t * 2 + ph); return inkDot(x, y, s * k, s * k, sd + 20 + i, t, 0.3); }).join(' '));
          // thin faint meteors flick past every ~1.1 s
          const per = 1.1, ph = (lt % per) / per, idx = Math.floor(lt / per);
          if (ph < 0.42) {
            const q = ph / 0.42, x0 = lerp(wx0 + 60, wx1 - 260, hn(sd, idx)), y0 = lerp(wy0 + 30, wy0 + 170, hn(sd, idx + 50));
            const hx = x0 + q * 220 * u, hy2 = y0 + q * 120 * u, tx = hx - 120 * u * Math.min(1, q * 2), ty = hy2 - 66 * u * Math.min(1, q * 2);
            const fade = 1 - Math.max(0, q - 0.7) / 0.3;
            set(streak, inkLoop([[tx, ty], [hx - 3, hy2 - 4 * fade], [hx + 3, hy2 + 4 * fade]], { seed: sd + 30, t, amp: 0.3 }));
            set(streakG, inkCircle(hx, hy2, 5 * u * fade, sd + 31, t, { fill: true }));
          } else { set(streak); set(streakG); }
          dk.update(t, W, H, gy);
          // a small dish with one sand grain
          const cx = 0.5 * W, cy = gy + 24 * u;
          set(dish, inkCircle(cx, cy, 150 * u, sd + 40, t, { fill: true, ry: 30 * u }));
          set(dishR, inkCircle(cx, cy, 150 * u, sd + 41, t, { w: 5, ry: 30 * u }));
          const gk = spring(lt, atOr(cues, 'grain', 0.2), 0.5);
          const gr = 7 * u * gk;
          set(grain, gr > 0.5 ? inkCircle(cx, cy - 4 * u, gr, sd + 42, t, { fill: true, ry: gr * 0.8 }) : '');
          set(grainR, gr > 0.5 ? inkCircle(cx, cy - 4 * u, gr, sd + 43, t, { w: 2, ry: gr * 0.8 }) : '');
          // the magnifying glass hovers above it, showing the grain big
          const lx = cx + Math.sin(t * 1.1) * 14 * u, ly = gy - 200 * u + Math.sin(t * 1.7) * 10 * u, R = 150 * u;
          const lk = spring(lt, 0.1, 0.7);
          lensG.setAttribute('transform', `translate(${f1(lx)} ${f1(ly)}) rotate(${f1(-8 + Math.sin(t) * 2)}) scale(${f1(lk * 100) / 100})`);
          set(lens, inkCircle(0, 0, R, sd + 60, t, { fill: true }));
          set(lensR, inkCircle(0, 0, R, sd + 61, t, { w: 16 }));
          set(handle, inkLoop([[R * 0.68, R * 0.68], [R * 0.82, R * 0.56], [R * 1.75, R * 1.45], [R * 1.6, R * 1.6]], { seed: sd + 62, t, amp: 0.6 }));
          const bg = [], n = 9; for (let i = 0; i < n; i++) { const an = i / n * 6.283 + t * 0.3, rr = 72 * u * gk * (0.8 + hn(sd, i) * 0.35); bg.push([Math.cos(an) * rr, Math.sin(an) * rr * 0.78]); }
          set(big, gk > 0.05 ? inkLoop(bg, { seed: sd + 63, t, amp: 0.8 }) : '');
          set(bigR, gk > 0.05 ? inkPath(bg, { w: 5, seed: sd + 64, t, closed: true, amp: 0.8 }) : '');
          set(glint, inkLoop([[-R * 0.62, -R * 0.2], [-R * 0.5, -R * 0.55], [-R * 0.2, -R * 0.66], [-R * 0.45, -R * 0.42]], { seed: sd + 65, t, amp: 0.4 }));
          // dashed arrow from the lens up to the window
          const ap = prog(lt, atOr(cues, 'arrow', dur * 0.45), 0.8);
          if (ap > 0) {
            const A = [lx + R * 0.95, ly - R * 0.4], B = [0.72 * W, wy1 - 70 * u], D = [];
            for (let i = 0; i < 10 * ap; i++) { const f0 = i / 10, f2 = (i + 0.55) / 10; const bend = f => [lerp(A[0], B[0], f) + Math.sin(f * Math.PI) * 90 * u, lerp(A[1], B[1], f)]; D.push(inkPath([bend(f0), bend(f2)], { w: 7, seed: sd + 70 + i, t })); }
            if (ap >= 1) D.push(inkPath([[B[0] - 34 * u, B[1] + 30 * u], B, [B[0] + 30 * u, B[1] + 36 * u]], { w: 7, seed: sd + 90, t }));
            set(arrow, D.join(' '));
          } else set(arrow);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.tf_burn
  SH.tf_burn = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 377, u = W / 1080;
      const root = el(svg, 'g');
      const hy = (P.hy ?? 0.4) * H;
      const ST = stars(el(root, 'g'), sd + 1, 40, W, 270, hy - 20);
      const small = fireball(el(root, 'g'), sd + 10), big = fireball(el(root, 'g'), sd + 40);
      const fr = front(el(root, 'g'), sd + 70);
      const trees = inkEl(root, NIGHT()), treesR = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          ST.update(t);
          const S = Object.assign({ from: [0.18, 0.15], to: [0.3, 0.33], dur: 0.7, size: 0.35, train: false, len: 0.5, at: 'small' }, P.small || {});
          const B = Object.assign({ from: [0.56, 0.14], to: [0.86, 0.62], dur: Math.max(2.2, dur * 0.7), size: 1.25, flare: 0.65, len: 0.6, at: 'big' }, P.big || {});
          const s0 = fbStage(S, W, H, cues, 0.2), rep = S.repeat ?? 1, ev = S.every ?? 1.3;
          let k0 = 0; for (let r = 1; r < rep; r++) if (lt >= s0.at + r * ev) k0 = r;
          const dx = k0 * 0.05 * W, dy = k0 * 0.03 * H;
          small.update(lt, t, Object.assign({}, s0, { at: s0.at + k0 * ev, A: [s0.A[0] + dx, s0.A[1] + dy], B: [s0.B[0] + dx, s0.B[1] + dy] }));
          big.update(lt, t, fbStage(B, W, H, cues, 0.5));
          fr.update(t, W, H, (P.gy ?? 0.7) * H, -60);
          // a few pine silhouettes on the hill
          const T = [], TR = [], gy = (P.gy ?? 0.7) * H;
          [0.08, 0.2, 0.9].forEach((x0, i) => {
            const x = x0 * W, b = gy + 30 * u, h = (300 + i * 60) * u, sw = Math.sin(t * 0.8 + i) * 5 * u;
            const tr = [[x - 16 * u, b + 40 * u], [x - 110 * u, b - h * 0.2], [x - 40 * u, b - h * 0.28], [x - 90 * u, b - h * 0.55], [x - 30 * u, b - h * 0.6], [x + sw, b - h], [x + 30 * u, b - h * 0.6], [x + 90 * u, b - h * 0.55], [x + 40 * u, b - h * 0.28], [x + 110 * u, b - h * 0.2], [x + 16 * u, b + 40 * u]];
            T.push(inkLoop(tr, { seed: sd + 90 + i, t, smooth: false, amp: 0.8 })); TR.push(inkPath(tr, { w: 4, seed: sd + 95 + i, t, closed: true, smooth: false, amp: 0.8 }));
          });
          set(trees, T.join(' ')); set(treesR, TR.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
