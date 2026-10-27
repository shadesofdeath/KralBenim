// neu__lib: shared drawings for the neu_* shots (Stickstory long video "the neutrino, the ghost particle", 2026-10-27).
// Not a shot type itself. Parchment ink style (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz via _ink.js,
// palette tokens only (INK), everything a pure function of (seed, t). Parametric: any particle-physics story.
// window.NEU = {
//   f1, atOr(cues, name|sec, fb), ell(cx, cy, rx, ry, n), rect(x0, y0, x1, y1), FLAV() -> [blue, red, gold] flavour colours
//   mkPen(parent) -> {begin(), fill(d, colour, opacity?), end()}  pooled <path> list (one per drawn piece, reused per frame)
//   shape(pen, pts, fill, seed, t, {w: 5, op, ink, smooth, amp})  filled polygon with an ink ring
//   line(pen, pts, seed, t, w, colour, {smooth, amp, taper})
//   nu(pen, x, y, r, seed, t, {dir: [1, 0], tail: 90, col: blue, ghost: false, glow: 0})  one neutrino: small ball with an
//       ink ring and a dashed comet tail behind it (ghost: dashed ring, no fill = "unseen")
//   flash(pen, x, y, R, seed, t, p 0..1)  a gold/red starburst that blooms and fades (p = time since start / life)
//   human(pen, x, y, h, seed, t, {fill, op})  a contour human silhouette (not a stick figure): ground point x, y; height h
//   nucleus(pen, x, y, r, seed, t, {n: 9, cols: [red, paperLight], shake})  a cluster of nucleons
//   rain(n, seed) -> list of {u, v, k}; rainPos(q, t, speed) -> u in 0..1 (wraps), for streams of particles
//   common(root, P, W, H, seed) -> {update(lt, t, cues)}  P.figures (bare-headed period people) + P.labels (TD.label) +
//       P.kasif (TD.figure, fez narrator)
//   token(pen, x, y, s, flavour 0..2, seed, t)  flavour token: blue ball / red triangle / gold diamond
//   bench(pen, x0, x1, y, floor, seed, t)  a work table (top board + two legs)
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const ell = (cx, cy, rx, ry, n = 14) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const FLAV = () => [INK.blue, INK.red, INK.gold];

  function mkPen(parent) {
    const g = el(parent, 'g');
    const pool = []; let i = 0;
    return {
      g,
      begin() { i = 0; },
      fill(d, color, op) {
        if (!d) return;
        let e = pool[i]; if (!e) { e = inkEl(g, color); pool.push(e); } i++;
        e.setAttribute('fill', color);
        if (op != null && op < 0.999) e.setAttribute('fill-opacity', Math.max(0, op).toFixed(3)); else e.removeAttribute('fill-opacity');
        e.setAttribute('d', d); e.style.display = '';
      },
      end() { for (let k = i; k < pool.length; k++) pool[k].style.display = 'none'; },
    };
  }
  function shape(pen, pts, fill, sd, t, o = {}) {
    const sm = o.smooth ?? false;
    if (fill) pen.fill(inkLoop(pts, { seed: sd, t, amp: o.amp ?? 1, smooth: sm }), fill, o.op);
    if (o.w !== 0) pen.fill(inkPath(pts, { w: o.w ?? 5, seed: sd + 1, t, closed: true, amp: o.amp ?? 1, smooth: sm }), o.ink || INK.ink, o.inkOp);
  }
  function line(pen, pts, sd, t, w = 4, color, o = {}) {
    pen.fill(inkPath(pts, { w, seed: sd, t, amp: o.amp ?? 0.9, smooth: o.smooth ?? false, taper: o.taper ?? 0.3 }), color || INK.ink, o.op);
  }

  // one neutrino: ball + ring + dashed comet tail
  function nu(pen, x, y, r, sd, t, o = {}) {
    const d = o.dir || [1, 0], L = Math.hypot(d[0], d[1]) || 1, dx = d[0] / L, dy = d[1] / L, col = o.col || INK.blue;
    const tail = o.tail ?? 90;
    for (let k = 0; k < 3; k++) {
      const a = r * 1.6 + k * tail / 3, b = a + tail / 3 * 0.55;
      if (tail > 4) pen.fill(inkPath([[x - dx * a, y - dy * a], [x - dx * b, y - dy * b]], { w: Math.max(2, r * 0.5 * (1 - k * 0.25)), seed: sd + 3 + k, t, amp: 0.5 }), col, 0.9 - k * 0.25);
    }
    if (o.glow) pen.fill(inkLoop(ell(x, y, r * 2.2, r * 2.2, 10), { seed: sd + 7, t, amp: 0.8 }), INK.gold, 0.35 * o.glow);
    const p = ell(x, y, r, r, 9);
    if (o.ghost) {
      for (let k = 0; k < 4; k++) {
        const a0 = k / 4 * Math.PI * 2 + 0.3, a1 = a0 + 0.9;
        pen.fill(inkPath([[x + Math.cos(a0) * r, y + Math.sin(a0) * r], [x + Math.cos((a0 + a1) / 2) * r * 1.02, y + Math.sin((a0 + a1) / 2) * r * 1.02], [x + Math.cos(a1) * r, y + Math.sin(a1) * r]], { w: Math.max(2.4, r * 0.22), seed: sd + 10 + k, t, amp: 0.5, smooth: true }), col);
      }
      return;
    }
    pen.fill(inkLoop(p, { seed: sd, t, amp: 0.6 }), col);
    pen.fill(inkPath(p, { w: Math.max(2.4, r * 0.28), seed: sd + 1, t, closed: true, amp: 0.6 }), INK.ink);
    pen.fill(inkDot(x - r * 0.3, y - r * 0.32, r * 0.28, r * 0.22, sd + 2, t), INK.paperLight, 0.8);
  }

  // starburst: p 0..1 over its life (0 = nothing)
  function flash(pen, x, y, R, sd, t, p) {
    if (p <= 0 || p >= 1) return;
    const grow = EASE(clamp01(p * 3)), fade = 1 - clamp01((p - 0.35) / 0.65), rr = R * (0.35 + 0.65 * grow);
    const pts = [];
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + sd, rad = k % 2 ? rr * 0.42 : rr * (0.9 + 0.2 * Math.sin(k * 3.1 + sd)); pts.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]); }
    pen.fill(inkLoop(pts, { seed: sd, t, amp: 1.2, smooth: false }), INK.gold, 0.9 * fade);
    pen.fill(inkPath(pts, { w: 4, seed: sd + 1, t, closed: true, amp: 1.2, smooth: false }), INK.red, fade);
    pen.fill(inkLoop(ell(x, y, rr * 0.3, rr * 0.3, 8), { seed: sd + 2, t }), INK.paperLight, fade);
  }

  // contour human silhouette (front view), ground point (x, y), height h
  function human(pen, x, y, h, sd, t, o = {}) {
    const u = h / 100;
    const R = [[3, 83], [10, 80.5], [15, 78], [17.5, 74], [18.5, 66], [19.5, 54], [19.5, 42], [18, 37], [15.5, 38], [15.2, 50], [14.2, 62],
      [12.8, 58], [12.2, 48], [11.6, 36], [10.5, 18], [9.6, 3], [10.6, 0.5], [3.4, 0], [3.2, 6], [2.2, 30], [1, 45]];
    const pts = R.map(([a, b]) => [x + a * u, y - b * u]).concat([[x, y - 47 * u]]).concat(R.slice().reverse().map(([a, b]) => [x - a * u, y - b * u]));
    shape(pen, pts, o.fill || INK.paperLight, sd, t, { op: o.op ?? 0.8, w: o.w ?? 6, amp: 1.1, smooth: true });
    shape(pen, ell(x, y - 91 * u, 7.6 * u, 9.2 * u, 16), o.fill || INK.paperLight, sd + 5, t, { op: o.op ?? 0.8, w: o.w ?? 6, smooth: true });
  }

  function nucleus(pen, x, y, r, sd, t, o = {}) {
    const n = o.n ?? 9, cols = o.cols || [INK.red, INK.paperLight], R0 = rng(sd + 31);
    const sh = o.shake ? Math.sin(t * 40) * o.shake : 0;
    const balls = [];
    for (let i = 0; i < n; i++) {
      const a = i * 2.4 + R0() * 0.5, d = r * 0.9 * Math.sqrt(i / n);
      balls.push([x + Math.cos(a) * d + sh, y + Math.sin(a) * d, i]);
    }
    balls.sort((a, b) => a[1] - b[1]);
    for (const [bx, by, i] of balls) {
      const rr = r * 0.42, p = ell(bx, by, rr, rr, 9);
      pen.fill(inkLoop(p, { seed: sd + i * 3, t, amp: 0.7 }), cols[i % cols.length]);
      pen.fill(inkPath(p, { w: 4, seed: sd + i * 3 + 1, t, closed: true, amp: 0.7 }), INK.ink);
    }
  }

  function rain(n, sd) { const r = rng(sd); return Array.from({ length: n }, () => ({ u: r(), v: r(), k: r(), f: Math.floor(r() * 3) })); }
  const rainPos = (q, t, speed) => ((q.u + t * speed * (0.7 + 0.6 * q.k)) % 1 + 1) % 1;

  // P.figures: period people (bare-headed, same rig) · P.labels (TD.label) · P.kasif: the fez narrator (TD.figure)
  function common(root, P, W, H, sd) {
    const TD = window.TD;
    const figs = (P.figures || []).map((K, i) => TD.figure(el(root, 'g'), Object.assign({ x: 0.3, y: 0.86, scale: 0.9, pose: 'idle', face: 'right' }, K, { hat: false }), sd + 970 + i * 7));
    const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 900 + i));
    const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.1, y: 0.86, scale: 0.7, pose: 'point', face: 'right', dir: 20 }, P.kasif), sd + 950) : null;
    return {
      kas,
      update(lt, t, cues) {
        figs.forEach(f => f.update(lt, t, cues, W, H));
        labels.forEach(l => l && l.update(lt, t, cues));
        return kas ? kas.update(lt, t, cues, W, H) : null;
      },
    };
  }

  // flavour token: 0 blue ball (electron), 1 red triangle (muon), 2 gold diamond (tau)
  function token(pen, x, y, s, f, sd, t) {
    const col = FLAV()[f];
    let pts;
    if (f === 0) pts = ell(x, y, s, s, 12);
    else if (f === 1) pts = [[x, y - s * 1.25], [x + s * 1.15, y + s * 0.8], [x - s * 1.15, y + s * 0.8]];
    else pts = [[x, y - s * 1.3], [x + s, y], [x, y + s * 1.3], [x - s, y]];
    shape(pen, pts, col, sd, t, { w: Math.max(3, s * 0.22), smooth: f === 0 });
  }

  // a work table: top board at y (stage px) from x0 to x1, two legs down to the floor
  function bench(pen, x0, x1, y, floor, sd, t) {
    shape(pen, rect(x0, y, x1, y + 26), INK.paperDark, sd, t, { w: 6 });
    for (const x of [x0 + 40, x1 - 60]) shape(pen, rect(x, y + 26, x + 22, floor), INK.paperDark, sd + 3 + (x > x0 + 50 ? 1 : 0), t, { w: 5 });
    line(pen, [[x0 + 50, y + 70], [x1 - 50, y + 70]], sd + 6, t, 4, INK.inkSoft);
  }

  window.NEU = { f1, atOr, ell, rect, FLAV, mkPen, shape, line, nu, flash, human, nucleus, rain, rainPos, common, token, bench };
})();
