// ce__lib: shared drawings for the ce_* shots (Stickstory "Carrington Event 1859", 2026-10-26). Not a shot type.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK), every line boils at 8 Hz (_ink.js),
// everything a pure function of (seed, t). Parametric: usable for any night-sky / aurora / telegraph / 19th-century
// observatory story. Reuses td__lib.js (window.TD: label, stars, sun) at build time.
// window.CE = {
//   atOr, f1, hz(i, t) (0..1 hash that re-rolls 8x per second)
//   fig(parent, K, seed) -> {update(lt, t, cues, W, H) -> {x, y, face, hand, hand2, head}}   narrator (fez) or a period
//       figure: K = {who: "kasif"|"man", x, y (ground, 0..1), scale, pose, face, dir, emotion, accessory, beard,
//       seq: [{at, pose, dir, face, emotion}], bob: 0 (px of idle bounce, e.g. a yawning stretch)}
//   aurora(parent, seed) -> {update(t, o)}  hand-drawn aurora curtain: a red ribbon over a softer gold veil, rows of
//       flickering vertical rays, a green-gold lower hem. o: {x0, x1, y (lower hem, px), h (px), amp: 36, p: 1
//       (reveal left -> right), rise: 1 (height 0..1), k: 1 (speed), tilt: 0 (px of y change from x0 to x1), bright: 0, op: 1 (opacity scale)}
//   ridge(parent, seed, o) -> {update(t, dx)}  mountain / hill range: o {x0, x1, y (base), h, n (peaks), sharp: true,
//       snow: false, fill: paperDark, depth: 260 (fill below the base), hatch: true}
//   town(parent, seed, o) -> {update(t)}       row of small houses with lit gold windows and a church spire: o {x0, x1, y, s}
//   moon(parent, seed) -> {update(t, x, y, r)} paper crescent
//   pole(parent, seed) -> {update(t, x, y, h) -> [[xL, yTop], [xR, yTop]]} telegraph pole with crossbar + insulators
//   wire(parent, seed, color) -> {update(t, a, b, sag, pulses: 0..1, n, color) }  sagging wire; pulses: gold dots running a -> b
//   spark(parent, seed) -> {update(t, x, y, s, p)} flickering gold/red spark burst (p 0..1 intensity)
//   desk(parent, seed) -> {update(t, x, y, w)}  writing desk (top at y)
//   key(parent, seed) -> {update(t, x, y, s, press 0..1)}  Morse key on a wooden base (+ returns contact point)
//   sounder(parent, seed) -> {update(t, x, y, s, click 0..1)}  telegraph sounder (two coils + armature)
//   battery(parent, seed) -> {update(t, x, y, s, n) -> {term: [x, y]}}  row of glass battery jars (plates, acid)
//   fire(parent, seed) -> {update(t, x, y, s)}  campfire (logs + flickering red/gold flames)
//   tent(parent, seed) -> {update(t, x, y, s)}
//   pan(parent, seed) -> {update(t, x, y, s, rot)}  frying pan with two eggs + steam (x, y = handle end)
//   scope(parent, seed) -> {update(t, x, y, s, ang)} brass refractor on a tripod; returns {eye: [x, y], obj: [x, y]}
//   board(parent, seed) -> {update(t, x, y, r, o)} projection screen on an easel with the Sun's disc, sunspot group,
//       pencil sketch marks and white-light flare kernels: o {spots: 0..1 (sketched), flare: 0..1, flash: 0..1 (burst)}
// }
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hz = (i, t, s = 0) => { const v = Math.sin((i + 1) * 12.9898 + inkFrame(t) * 78.233 + s * 37.719) * 43758.5453; return v - Math.floor(v); };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const ell = (cx, cy, rx, ry, n = 16) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * rx, cy + Math.sin(i / n * Math.PI * 2) * ry]);
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // ------------------------------------------------------------------ figures
  function fig(parent, K, sd) {
    if (!K) return null;
    const g = el(parent, 'g');
    const isK = (K.who || 'kasif') === 'kasif';
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), beard: isK ? null : (K.beard || null), seed: sd });
    return {
      K,
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        const x = (K.x ?? 0.8) * W, y = (K.y ?? 0.6) * H - (K.bob ? Math.abs(Math.sin(lt * 2.4)) * K.bob : 0);
        const face = faceOf(s.face ?? K.face, -1);
        const o = { x, y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, s.pose || 'idle', o), sc = K.scale ?? 1;
        const hw = r.hands[1], hl = r.hands[0];
        return { x, y, face, hand: [x + face * sc * hw[0], y + sc * hw[1]], hand2: [x + face * sc * hl[0], y + sc * hl[1]], head: [x + face * sc * r.head[0], y + sc * r.head[1]] };
      },
    };
  }

  // ------------------------------------------------------------------ aurora curtain
  function aurora(parent, sd) {
    const g = el(parent, 'g');
    const veil = inkEl(g, INK.gold, { 'fill-opacity': 0.34 });
    const body = inkEl(g, INK.red, { 'fill-opacity': 0.4 });
    const raysG = inkEl(g, INK.gold, { 'fill-opacity': 0.75 });
    const raysR = inkEl(g, INK.red, { 'fill-opacity': 0.8 });
    const hem = inkEl(g, INK.green, { 'fill-opacity': 0.85 });
    const hemG = inkEl(g, INK.gold);
    return {
      update(t, o = {}) {
        const x0 = o.x0 ?? 0, x1 = o.x1 ?? 1000, y = o.y ?? 600, h = (o.h ?? 300) * clamp01(o.rise ?? 1), amp = o.amp ?? 36;
        const p = clamp01(o.p ?? 1), k = o.k ?? 1, tilt = o.tilt ?? 0, br = clamp01(o.bright ?? 0), ph = (sd % 7) * 0.9;
        if (p < 0.01 || h < 4) { [veil, body, raysG, raysR, hem, hemG].forEach(n => n.setAttribute('d', '')); return; }
        const op = o.op ?? 1;
        body.setAttribute('fill-opacity', ((0.52 + 0.2 * br) * op).toFixed(3));
        veil.setAttribute('fill-opacity', ((0.34 + 0.14 * br) * op).toFixed(3));
        raysR.setAttribute('fill-opacity', (0.8 * Math.min(1, op + 0.2)).toFixed(3)); raysG.setAttribute('fill-opacity', (0.75 * Math.min(1, op + 0.2)).toFixed(3));
        const N = 30, bot = [], top = [], veilTop = [];
        for (let i = 0; i <= N; i++) {
          const u = i / N * p, xx = x0 + (x1 - x0) * u + amp * 0.55 * Math.sin(u * 11 + t * 1.1 * k + ph);
          const yb = y + tilt * u + amp * Math.sin(u * 6.5 + t * 0.9 * k + ph) + amp * 0.4 * Math.sin(u * 15 - t * 1.7 * k);
          const yt = yb - h * (0.72 + 0.28 * Math.sin(u * 4.6 + t * 0.7 * k + 1 + ph));
          bot.push([xx, yb]); top.push([xx, yt]); veilTop.push([xx, yt - h * 0.28]);
        }
        const loop = (a, b) => a.concat(b.slice().reverse());
        veil.setAttribute('d', inkLoop(loop(veilTop, bot.map(([a, b]) => [a, b + 14])), { seed: sd + 1, t, amp: 2 }));
        body.setAttribute('d', inkLoop(loop(top, bot), { seed: sd + 2, t, amp: 2 }));
        // vertical rays: flicker in length 8x per second, sway with the curtain
        let dr = '', dg = '';
        const M = Math.round(42 * p) + 1;
        for (let i = 0; i < M; i++) {
          const u = (i + 0.5) / 42, j = Math.min(N, Math.round(u / Math.max(p, 1e-3) * N));
          if (u > p) break;
          const [bx, by] = bot[j], [, ty] = top[j];
          const len = (by - ty) * (0.45 + 0.6 * hz(i, t, sd)) * (1 + 0.15 * br);
          const sway = Math.sin(t * 1.3 + i) * 10;
          const d = inkPath([[bx, by - 4], [bx + sway * 0.5, by - len * 0.5], [bx + sway, by - len]], { w: i % 3 === 1 ? 6 : 9, seed: sd + 10 + i, t, amp: 1.2, taper: 0.85 }) + ' ';
          if (i % 3 === 1) dg += d; else dr += d;
        }
        raysR.setAttribute('d', dr); raysG.setAttribute('d', dg);
        hem.setAttribute('d', inkPath(bot, { w: 10, seed: sd + 5, t, amp: 1.5, taper: 0.7 }));
        hemG.setAttribute('d', inkPath(bot.map(([a, b]) => [a, b + 2]), { w: 3, seed: sd + 6, t, amp: 1.2, taper: 0.7 }));
      },
    };
  }

  // ------------------------------------------------------------------ mountains / hills
  function ridge(parent, sd, o = {}) {
    const g = el(parent, 'g');
    const fillE = inkEl(g, o.fill || INK.paperDark), snowE = inkEl(g, INK.paperLight), line = inkEl(g), hatch = inkEl(g, INK.inkSoft);
    const r = rng(sd * 3 + 1), n = o.n ?? 4, sharp = o.sharp !== false, x0 = o.x0 ?? -40, x1 = o.x1 ?? 1120, y = o.y ?? 800, h = o.h ?? 300;
    const pts = [[x0, y]];
    const peaks = [];
    for (let i = 0; i < n; i++) {
      const cx = lerp(x0, x1, (i + 0.5) / n) + (r() - 0.5) * (x1 - x0) / n * 0.4, ph = h * lerp(0.55, 1, r());
      const half = (x1 - x0) / n * lerp(0.45, 0.62, r());
      if (sharp) { pts.push([cx - half * 0.55, y - ph * 0.42]); pts.push([cx - half * 0.12, y - ph * 0.86]); pts.push([cx, y - ph]); pts.push([cx + half * 0.18, y - ph * 0.8]); pts.push([cx + half * 0.6, y - ph * 0.36]); }
      else { pts.push([cx - half * 0.6, y - ph * 0.55]); pts.push([cx, y - ph]); pts.push([cx + half * 0.6, y - ph * 0.55]); }
      peaks.push([cx, y - ph, ph]);
    }
    pts.push([x1, y]);
    const depth = o.depth ?? 260;
    return {
      update(t, dx = 0) {
        const P = pts.map(([a, b]) => [a + dx, b]);
        fillE.setAttribute('d', inkLoop(P.concat([[x1 + dx, y + depth], [x0 + dx, y + depth]]), { seed: sd + 1, t, amp: 1.4, smooth: !sharp }));
        line.setAttribute('d', inkPath(P, { w: 6, seed: sd + 2, t, amp: 1.4, smooth: !sharp }));
        let sn = '', hd = '';
        peaks.forEach(([cx, py, ph], i) => {
          if (o.snow) {
            const s = ph * 0.22;
            sn += inkLoop([[cx + dx, py], [cx + dx + s * 0.55, py + s], [cx + dx + s * 0.2, py + s * 0.8], [cx + dx - s * 0.1, py + s * 1.05], [cx + dx - s * 0.5, py + s * 0.85]], { seed: sd + 20 + i, t, amp: 1, smooth: false }) + ' ';
          }
          if (o.hatch !== false) for (let k = 0; k < 4; k++) {
            const hx = cx + dx + ph * (0.12 + k * 0.09), hy = py + ph * (0.3 + k * 0.15);
            hd += inkPath([[hx, hy], [hx + ph * 0.12, hy + ph * 0.1]], { w: 3.5, seed: sd + 40 + i * 5 + k, t, amp: 0.8 }) + ' ';
          }
        });
        snowE.setAttribute('d', sn); hatch.setAttribute('d', hd);
      },
    };
  }

  // ------------------------------------------------------------------ town (houses + church)
  function town(parent, sd, o = {}) {
    const g = el(parent, 'g');
    const bodyF = inkEl(g, INK.paperLight), roofF = inkEl(g, INK.paperDark), win = inkEl(g, INK.gold), lines = inkEl(g), smoke = inkEl(g, INK.inkSoft);
    const r = rng(sd * 5 + 2), x0 = o.x0 ?? 0, x1 = o.x1 ?? 1080, y = o.y ?? 900, s = o.s ?? 1, list = [];
    let x = x0;
    let church = Math.floor(r() * 3) + 1, idx = 0;
    while (x < x1) {
      const ch = idx === church, w = (ch ? 110 : lerp(90, 150, r())) * s, hh = (ch ? 150 : lerp(70, 120, r())) * s;
      list.push({ x, w, h: hh, roof: (ch ? 60 : lerp(36, 70, r())) * s, ch, chim: !ch && r() < 0.5 });
      x += w + lerp(6, 30, r()) * s; idx++;
    }
    return {
      update(t) {
        let bf = '', rf = '', wd = '', ld = '', sm = '';
        list.forEach((b, i) => {
          const S = k => sd * 50 + i * 9 + k, bx = b.x, top = y - b.h;
          const body = rect(bx, top, b.w, b.h);
          bf += inkLoop(body, { seed: S(1), t, amp: 1, smooth: false }) + ' ';
          ld += inkPath(body, { w: 5, seed: S(2), t, closed: true, amp: 1, smooth: false }) + ' ';
          const roof = b.ch ? [[bx - 8, top], [bx + b.w / 2, top - b.roof * 3.2], [bx + b.w + 8, top]] : [[bx - 12, top], [bx + b.w / 2, top - b.roof], [bx + b.w + 12, top]];
          rf += inkLoop(roof, { seed: S(3), t, amp: 1, smooth: false }) + ' ';
          ld += inkPath(roof, { w: 5, seed: S(4), t, closed: true, amp: 1, smooth: false }) + ' ';
          if (b.ch) ld += inkPath([[bx + b.w / 2, top - b.roof * 3.2], [bx + b.w / 2, top - b.roof * 3.2 - 50 * s]], { w: 5, seed: S(5), t }) + ' ' +
            inkPath([[bx + b.w / 2 - 16 * s, top - b.roof * 3.2 - 32 * s], [bx + b.w / 2 + 16 * s, top - b.roof * 3.2 - 32 * s]], { w: 5, seed: S(6), t }) + ' ';
          const nw = b.ch ? 1 : Math.max(1, Math.round(b.w / (60 * s)));
          for (let k = 0; k < nw; k++) {
            const ww = (b.ch ? 34 : 26) * s, wh = (b.ch ? 56 : 32) * s, wx = bx + (k + 0.5) * b.w / nw - ww / 2, wy = top + b.h * 0.3;
            const flick = 0.92 + 0.08 * Math.sin(t * 5 + i + k);
            wd += inkLoop(rect(wx, wy, ww, wh * flick), { seed: S(10 + k), t, amp: 0.8, smooth: false }) + ' ';
            ld += inkPath(rect(wx, wy, ww, wh), { w: 3.5, seed: S(20 + k), t, closed: true, amp: 0.8, smooth: false }) + ' ';
          }
          if (b.chim) {
            const cx = bx + b.w * 0.72, cy = top - b.roof * 0.45;
            ld += inkPath(rect(cx, cy - 34 * s, 20 * s, 34 * s), { w: 4.5, seed: S(30), t, closed: true, amp: 0.8, smooth: false }) + ' ';
            const sp = []; for (let k = 0; k < 6; k++) { const u = k / 5; sp.push([cx + 10 * s + Math.sin(t * 1.6 + u * 4 + i) * 12 * u + u * 40, cy - 40 * s - u * 120 * s]); }
            sm += inkPath(sp, { w: 4, seed: S(31), t, amp: 1, taper: 0.9 }) + ' ';
          }
        });
        bodyF.setAttribute('d', bf); roofF.setAttribute('d', rf); win.setAttribute('d', wd); lines.setAttribute('d', ld); smoke.setAttribute('d', sm);
      },
    };
  }

  // ------------------------------------------------------------------ moon
  function moon(parent, sd) {
    const f = inkEl(parent, INK.paperLight), r_ = inkEl(parent);
    return {
      update(t, x, y, r) {
        const pts = [];
        for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i / 10 * Math.PI; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
        for (let i = 10; i >= 0; i--) { const a = -Math.PI / 2 + i / 10 * Math.PI; pts.push([x + Math.cos(a) * r * 0.45 + r * 0.1, y + Math.sin(a) * r * 0.92]); }
        f.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, amp: 1 }));
        r_.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 2, t, closed: true, amp: 1 }));
      },
    };
  }

  // ------------------------------------------------------------------ telegraph pole + wire
  function pole(parent, sd) {
    const f = inkEl(parent, INK.paperDark), r_ = inkEl(parent), ins = inkEl(parent, INK.green, { 'fill-opacity': 0.8 });
    return {
      update(t, x, y, h, s = 1) {
        const w = 16 * s, top = y - h, bar = 90 * s;
        const post = [[x - w / 2, y], [x - w / 2 * 0.7, top], [x + w / 2 * 0.7, top], [x + w / 2, y]];
        f.setAttribute('d', inkLoop(post, { seed: sd + 1, t, amp: 0.8, smooth: false }));
        const cb = rect(x - bar, top + 20 * s, bar * 2, 12 * s);
        let d = inkPath(post, { w: 4.5 * Math.max(0.6, s), seed: sd + 2, t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkPath(cb, { w: 4.5 * Math.max(0.6, s), seed: sd + 3, t, closed: true, amp: 0.8, smooth: false });
        let id = '';
        const tops = [];
        for (const [k, dx] of [[0, -bar * 0.78], [1, bar * 0.78]]) {
          const ix = x + dx, iy = top + 20 * s;
          id += inkDot(ix, iy - 9 * s, 9 * s, 11 * s, sd + 10 + k, t) + ' ';
          tops.push([ix, iy - 16 * s]);
        }
        r_.setAttribute('d', d); ins.setAttribute('d', id);
        return tops;
      },
    };
  }
  function wire(parent, sd, color) {
    const w_ = inkEl(parent, color || INK.ink), pu = inkEl(parent, INK.gold), puR = inkEl(parent, INK.red, { 'fill-opacity': 0.45 });
    return {
      update(t, a, b, sag = 40, pulses = 0, n = 3, w = 4) {
        const P = u => [lerp(a[0], b[0], u), lerp(a[1], b[1], u) + sag * 4 * u * (1 - u)];
        const pts = []; for (let k = 0; k <= 8; k++) pts.push(P(k / 8));
        w_.setAttribute('d', inkPath(pts, { w, seed: sd + 1, t, amp: 0.8, taper: 0.1 }));
        let d = '', dr = '';
        if (pulses > 0.01) for (let k = 0; k < n; k++) {
          const u = ((t * 0.55 + k / n) % 1), q = P(u), rr = 8 * pulses;
          d += inkDot(q[0], q[1], rr * 1.3, rr, sd + 20 + k, t) + ' ';
          dr += inkDot(q[0], q[1], rr * 1.9, rr * 1.5, sd + 40 + k, t) + ' ';
        }
        puR.setAttribute('d', dr); pu.setAttribute('d', d);
      },
    };
  }

  // ------------------------------------------------------------------ spark burst
  function spark(parent, sd) {
    const glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.45 }), rays = inkEl(parent, INK.gold), core = inkEl(parent, INK.red), coreL = inkEl(parent, INK.paperLight);
    return {
      update(t, x, y, s = 1, p = 1) {
        if (p < 0.02) { [glow, rays, core, coreL].forEach(n => n.setAttribute('d', '')); return; }
        const fr = inkFrame(t), R = 70 * s * p;
        let d = '';
        for (let k = 0; k < 8; k++) {
          const a = k / 8 * Math.PI * 2 + (fr % 2) * 0.35 + sd, L = R * (1.1 + 0.9 * hz(k, t, sd));
          const pts = [[x + Math.cos(a) * R * 0.3, y + Math.sin(a) * R * 0.3]];
          for (let j = 1; j <= 3; j++) { const u = j / 3, z = (j % 2 ? 1 : -1) * 10 * s; pts.push([x + Math.cos(a) * L * u - Math.sin(a) * z, y + Math.sin(a) * L * u + Math.cos(a) * z]); }
          d += inkPath(pts, { w: 7 * s, seed: sd + k, t, amp: 0.8, smooth: false, taper: 0.8 }) + ' ';
        }
        rays.setAttribute('d', d);
        glow.setAttribute('d', inkDot(x, y, R * 0.95, R * 0.95, sd + 30, t, 2));
        const st = []; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + fr * 0.4, rr = k % 2 ? R * 0.18 : R * 0.42; st.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
        core.setAttribute('d', inkLoop(st, { seed: sd + 31, t, amp: 0.8, smooth: false }));
        coreL.setAttribute('d', inkDot(x, y, R * 0.12, R * 0.12, sd + 32, t));
      },
    };
  }

  // ------------------------------------------------------------------ desk, key, sounder, battery
  function desk(parent, sd) {
    const f = inkEl(parent, INK.paperDark), r_ = inkEl(parent), grain = inkEl(parent, INK.inkSoft);
    return {
      update(t, x, y, w, legs = 260) {
        const top = rect(x - w / 2, y, w, 34);
        f.setAttribute('d', inkLoop(top, { seed: sd + 1, t, amp: 1, smooth: false }) + ' ' + inkLoop(rect(x - w / 2 + 30, y + 34, 26, legs), { seed: sd + 2, t, amp: 1, smooth: false }) + ' ' + inkLoop(rect(x + w / 2 - 56, y + 34, 26, legs), { seed: sd + 3, t, amp: 1, smooth: false }));
        r_.setAttribute('d', inkPath(top, { w: 6, seed: sd + 4, t, closed: true, amp: 1, smooth: false }) + ' ' + inkPath(rect(x - w / 2 + 30, y + 34, 26, legs), { w: 5, seed: sd + 5, t, closed: true, amp: 1, smooth: false }) + ' ' + inkPath(rect(x + w / 2 - 56, y + 34, 26, legs), { w: 5, seed: sd + 6, t, closed: true, amp: 1, smooth: false }));
        grain.setAttribute('d', [0.2, 0.55, 0.8].map((u, k) => inkPath([[x - w / 2 + w * u, y + 12], [x - w / 2 + w * u + 90, y + 18]], { w: 3, seed: sd + 10 + k, t, amp: 0.8 })).join(' '));
      },
    };
  }
  function key(parent, sd) {
    const baseF = inkEl(parent, INK.paperDark), lever = inkEl(parent, INK.inkSoft), r_ = inkEl(parent), knob = inkEl(parent, INK.ink), brass = inkEl(parent, INK.gold);
    return {
      update(t, x, y, s = 1, press = 0) {
        const bw = 260 * s, bh = 34 * s, base = rect(x - bw / 2, y - bh, bw, bh);
        baseF.setAttribute('d', inkLoop(base, { seed: sd + 1, t, amp: 0.8, smooth: false }));
        const px = x - bw * 0.3, py = y - bh - 30 * s, ang = (-4 + 7 * press) * Math.PI / 180, L = bw * 0.72;
        const ex = px + Math.cos(ang) * L, ey = py + Math.sin(ang) * L;
        const nx = -Math.sin(ang) * 9 * s, ny = Math.cos(ang) * 9 * s;
        const lv = [[px - nx, py - ny], [ex - nx, ey - ny], [ex + nx, ey + ny], [px + nx, py + ny]];
        lever.setAttribute('d', inkLoop(lv, { seed: sd + 2, t, amp: 0.6, smooth: false }));
        r_.setAttribute('d', inkPath(base, { w: 5, seed: sd + 3, t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkPath(lv, { w: 4, seed: sd + 4, t, closed: true, amp: 0.6, smooth: false }) + ' ' +
          inkPath([[px, py], [px, y - bh]], { w: 7 * s, seed: sd + 5, t }) + ' ' + inkPath([[px + L * 0.62, y - bh], [px + L * 0.62, y - bh - 16 * s]], { w: 6 * s, seed: sd + 6, t }));
        knob.setAttribute('d', inkDot(ex, ey - 14 * s, 30 * s, 20 * s, sd + 7, t));
        brass.setAttribute('d', inkDot(px, py, 12 * s, 12 * s, sd + 8, t) + ' ' + inkDot(x + bw * 0.42, y - bh - 8 * s, 10 * s, 8 * s, sd + 9, t));
        return { contact: [px + L * 0.62, y - bh - 16 * s], knob: [ex, ey - 14 * s], post: [x + bw * 0.42, y - bh - 8 * s] };
      },
    };
  }
  function sounder(parent, sd) {
    const baseF = inkEl(parent, INK.paperDark), coil = inkEl(parent, INK.red, { 'fill-opacity': 0.75 }), r_ = inkEl(parent), arm = inkEl(parent, INK.gold);
    return {
      update(t, x, y, s = 1, click = 0) {
        const base = rect(x - 120 * s, y - 30 * s, 240 * s, 30 * s);
        baseF.setAttribute('d', inkLoop(base, { seed: sd + 1, t, amp: 0.8, smooth: false }));
        const c1 = rect(x - 80 * s, y - 120 * s, 50 * s, 90 * s), c2 = rect(x - 20 * s, y - 120 * s, 50 * s, 90 * s);
        coil.setAttribute('d', inkLoop(c1, { seed: sd + 2, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(c2, { seed: sd + 3, t, amp: 0.8, smooth: false }));
        let wind = '';
        for (let k = 1; k < 5; k++) for (const [j, cx] of [[0, -80], [1, -20]]) wind += inkPath([[x + cx * s, y - (30 + k * 18) * s], [x + (cx + 50) * s, y - (30 + k * 18) * s]], { w: 2.6, seed: sd + 10 + k * 2 + j, t, amp: 0.5 }) + ' ';
        const ay = y - (140 - 10 * click) * s;
        r_.setAttribute('d', inkPath(base, { w: 5, seed: sd + 4, t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkPath(c1, { w: 4, seed: sd + 5, t, closed: true, amp: 0.8, smooth: false }) + ' ' +
          inkPath(c2, { w: 4, seed: sd + 6, t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkPath([[x + 70 * s, y - 30 * s], [x + 70 * s, y - 160 * s]], { w: 9 * s, seed: sd + 7, t }) + ' ' + wind);
        arm.setAttribute('d', inkLoop(rect(x - 100 * s, ay - 12 * s, 180 * s, 16 * s), { seed: sd + 8, t, amp: 0.6, smooth: false }));
      },
    };
  }
  function battery(parent, sd) {
    const glass = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.9 }), acid = inkEl(parent, INK.blue, { 'fill-opacity': 0.35 }), plates = inkEl(parent, INK.inkSoft), r_ = inkEl(parent), cop = inkEl(parent, INK.gold);
    return {
      update(t, x, y, s = 1, n = 3) {
        let gd = '', ad = '', pd = '', rd = '', cd = '';
        const jw = 92 * s, jh = 150 * s, gap = 26 * s, x0 = x - (n * jw + (n - 1) * gap) / 2;
        const terms = [];
        for (let i = 0; i < n; i++) {
          const jx = x0 + i * (jw + gap), J = [[jx, y - jh], [jx + jw, y - jh], [jx + jw - 4 * s, y], [jx + 4 * s, y]];
          gd += inkLoop(J, { seed: sd + i, t, amp: 0.8, smooth: false }) + ' ';
          const lvl = y - jh * 0.7 + Math.sin(t * 2 + i) * 2;
          ad += inkLoop([[jx + 6 * s, lvl], [jx + jw - 6 * s, lvl], [jx + jw - 8 * s, y - 4], [jx + 8 * s, y - 4]], { seed: sd + 10 + i, t, amp: 0.8, smooth: false }) + ' ';
          pd += inkLoop(rect(jx + 18 * s, y - jh - 30 * s, 14 * s, jh * 0.9), { seed: sd + 20 + i, t, amp: 0.6, smooth: false }) + ' ' + inkLoop(rect(jx + jw - 32 * s, y - jh - 30 * s, 14 * s, jh * 0.9), { seed: sd + 30 + i, t, amp: 0.6, smooth: false }) + ' ';
          rd += inkPath(J, { w: 5, seed: sd + 40 + i, t, closed: true, amp: 0.8, smooth: false }) + ' ';
          cd += inkDot(jx + 25 * s, y - jh - 34 * s, 9 * s, 9 * s, sd + 50 + i, t) + ' ' + inkDot(jx + jw - 25 * s, y - jh - 34 * s, 9 * s, 9 * s, sd + 60 + i, t) + ' ';
          terms.push([jx + 25 * s, y - jh - 34 * s], [jx + jw - 25 * s, y - jh - 34 * s]);
          for (let k = 0; k < 3; k++) { const by = y - jh * 0.2 - ((t * 40 + k * 30 + i * 13) % (jh * 0.45)); rd += inkCircle(jx + jw / 2 + Math.sin(t * 3 + k) * 6, by, 5 * s, sd + 70 + i * 3 + k, t, { w: 2.5 }) + ' '; }
          if (i < n - 1) rd += inkPath([[jx + jw - 25 * s, y - jh - 34 * s], [jx + jw + gap / 2, y - jh - 70 * s], [jx + jw + gap + 25 * s, y - jh - 34 * s]], { w: 4, seed: sd + 80 + i, t, amp: 0.8 }) + ' ';
        }
        glass.setAttribute('d', gd); acid.setAttribute('d', ad); plates.setAttribute('d', pd); r_.setAttribute('d', rd); cop.setAttribute('d', cd);
        return { term: terms[0], last: terms[terms.length - 1] };
      },
    };
  }

  // ------------------------------------------------------------------ camp: fire, tent, pan
  function fire(parent, sd) {
    const logs = inkEl(parent, INK.paperDark), logR = inkEl(parent), fr = inkEl(parent, INK.red, { 'fill-opacity': 0.85 }), fg = inkEl(parent, INK.gold), glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.25 });
    return {
      update(t, x, y, s = 1) {
        const L1 = [[x - 110 * s, y - 6 * s], [x + 100 * s, y - 40 * s], [x + 108 * s, y - 18 * s], [x - 102 * s, y + 14 * s]];
        const L2 = [[x - 100 * s, y - 40 * s], [x + 110 * s, y - 4 * s], [x + 102 * s, y + 16 * s], [x - 108 * s, y - 18 * s]];
        logs.setAttribute('d', inkLoop(L1, { seed: sd + 1, t, smooth: false }) + ' ' + inkLoop(L2, { seed: sd + 2, t, smooth: false }));
        logR.setAttribute('d', inkPath(L1, { w: 5, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath(L2, { w: 5, seed: sd + 4, t, closed: true, smooth: false }));
        const flame = (k, hh, ww) => { const pts = [[x - ww, y - 20 * s]]; for (let i = 1; i < 6; i++) { const u = i / 6; pts.push([x - ww + 2 * ww * u + Math.sin(t * 9 + i * 2 + k) * 10 * s, y - 20 * s - hh * Math.sin(u * Math.PI) * (0.6 + 0.4 * hz(i + k * 7, t, sd))]); } pts.push([x + ww, y - 20 * s]); return pts; };
        fr.setAttribute('d', inkLoop(flame(0, 190 * s, 80 * s), { seed: sd + 5, t, amp: 2 }));
        fg.setAttribute('d', inkLoop(flame(3, 110 * s, 46 * s), { seed: sd + 6, t, amp: 2 }));
        glow.setAttribute('d', inkDot(x, y - 60 * s, 170 * s, 120 * s, sd + 7, t, 2));
      },
    };
  }
  function tent(parent, sd) {
    const f = inkEl(parent, INK.paperLight), d_ = inkEl(parent, INK.paperDark), r_ = inkEl(parent);
    return {
      update(t, x, y, s = 1) {
        const T = [[x - 200 * s, y], [x, y - 260 * s], [x + 200 * s, y]], D = [[x - 60 * s, y], [x, y - 200 * s], [x + 40 * s + Math.sin(t * 1.4) * 6, y]];
        f.setAttribute('d', inkLoop(T, { seed: sd + 1, t, smooth: false }));
        d_.setAttribute('d', inkLoop(D, { seed: sd + 2, t, smooth: false }));
        r_.setAttribute('d', inkPath(T, { w: 6, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath(D, { w: 4, seed: sd + 4, t, smooth: false }) + ' ' +
          inkPath([[x, y - 260 * s], [x, y - 300 * s]], { w: 6, seed: sd + 5, t }) + ' ' + inkPath([[x + 200 * s, y], [x + 260 * s, y - 20 * s]], { w: 3, seed: sd + 6, t }));
      },
    };
  }
  function pan(parent, sd) {
    const f = inkEl(parent, INK.inkSoft), r_ = inkEl(parent), white = inkEl(parent, INK.paperLight), yolk = inkEl(parent, INK.gold), steam = inkEl(parent, INK.inkSoft);
    return {
      update(t, x, y, s = 1, face = 1) {
        const cx = x + face * 150 * s, cy = y + 6 * s;
        const P = ell(cx, cy, 90 * s, 30 * s, 16);
        f.setAttribute('d', inkLoop(P, { seed: sd + 1, t }));
        r_.setAttribute('d', inkPath(P, { w: 6, seed: sd + 2, t, closed: true }) + ' ' + inkPath([[x, y], [cx - face * 88 * s, cy]], { w: 10 * s, seed: sd + 3, t }));
        white.setAttribute('d', inkDot(cx - 30 * s, cy - 6 * s, 34 * s, 14 * s, sd + 4, t) + ' ' + inkDot(cx + 30 * s, cy - 2 * s, 32 * s, 13 * s, sd + 5, t));
        yolk.setAttribute('d', inkDot(cx - 30 * s, cy - 8 * s, 11 * s, 7 * s, sd + 6, t) + ' ' + inkDot(cx + 30 * s, cy - 4 * s, 11 * s, 7 * s, sd + 7, t));
        let sd2 = '';
        for (let k = 0; k < 3; k++) { const pts = []; for (let j = 0; j < 5; j++) { const u = j / 4; pts.push([cx + (k - 1) * 34 * s + Math.sin(t * 3 + u * 5 + k) * 10 * s, cy - 30 * s - u * 110 * s - ((t * 30) % 20)]); } sd2 += inkPath(pts, { w: 4, seed: sd + 10 + k, t, amp: 1, taper: 0.9 }) + ' '; }
        steam.setAttribute('d', sd2);
      },
    };
  }

  // ------------------------------------------------------------------ observatory: telescope + projection board
  function scope(parent, sd) {
    const legs = inkEl(parent), tube = inkEl(parent, INK.gold, { 'fill-opacity': 0.55 }), r_ = inkEl(parent), bands = inkEl(parent, INK.hatBand);
    return {
      update(t, x, y, s = 1, ang = -30) {
        const a = ang * Math.PI / 180, L = 520 * s, w0 = 34 * s, w1 = 50 * s;
        const hx = x, hy = y - 300 * s;                                   // mount head
        const ex = hx - Math.cos(a) * L * 0.35, ey = hy - Math.sin(a) * L * 0.35, ox = hx + Math.cos(a) * L * 0.65, oy = hy + Math.sin(a) * L * 0.65;
        const nx = -Math.sin(a), ny = Math.cos(a);
        const T = [[ex + nx * w0 / 2, ey + ny * w0 / 2], [ox + nx * w1 / 2, oy + ny * w1 / 2], [ox - nx * w1 / 2, oy - ny * w1 / 2], [ex - nx * w0 / 2, ey - ny * w0 / 2]];
        legs.setAttribute('d', [[-150, 0], [10, 0], [150, 0]].map(([dx], k) => inkPath([[hx, hy], [x + dx * s, y]], { w: 8, seed: sd + k, t })).join(' '));
        tube.setAttribute('d', inkLoop(T, { seed: sd + 5, t, amp: 0.8, smooth: false }));
        let bd = '';
        for (const [k, u] of [[0, 0.12], [1, 0.55], [2, 0.92]]) { const cx = lerp(ex, ox, u), cy = lerp(ey, oy, u), ww = lerp(w0, w1, u) / 2 + 5 * s; bd += inkLoop([[cx + nx * ww - Math.cos(a) * 8 * s, cy + ny * ww - Math.sin(a) * 8 * s], [cx + nx * ww + Math.cos(a) * 8 * s, cy + ny * ww + Math.sin(a) * 8 * s], [cx - nx * ww + Math.cos(a) * 8 * s, cy - ny * ww + Math.sin(a) * 8 * s], [cx - nx * ww - Math.cos(a) * 8 * s, cy - ny * ww - Math.sin(a) * 8 * s]], { seed: sd + 10 + k, t, amp: 0.6, smooth: false }) + ' '; }
        bands.setAttribute('d', bd);
        r_.setAttribute('d', inkPath(T, { w: 6, seed: sd + 6, t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkDot(hx, hy, 14 * s, 14 * s, sd + 7, t) + ' ' +
          inkPath([[ex, ey], [ex - Math.cos(a) * 40 * s, ey - Math.sin(a) * 40 * s]], { w: 14 * s, seed: sd + 8, t }));
        return { eye: [ex - Math.cos(a) * 40 * s, ey - Math.sin(a) * 40 * s], obj: [ox, oy] };
      },
    };
  }
  function board(parent, sd) {
    const easel = inkEl(parent), card = inkEl(parent, INK.paperLight), disc = inkEl(parent, INK.paper), discR = inkEl(parent), pen = inkEl(parent, INK.paperDark, { 'fill-opacity': 0.9 }),
      spots = inkEl(parent, INK.ink), sketch = inkEl(parent, INK.inkSoft), glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.5 }), kern = inkEl(parent, INK.paperLight), kernR = inkEl(parent, INK.red), rays = inkEl(parent, INK.gold);
    // the sunspot group (relative to disc radius): umbra blobs with a penumbra ring
    const group = [[-0.18, -0.05, 0.11], [0.0, 0.02, 0.15], [0.17, -0.06, 0.09], [0.08, 0.16, 0.07], [-0.08, 0.15, 0.05], [0.28, 0.06, 0.05]];
    const kernels = [[-0.06, -0.2, 0.09, 0.05, -0.4], [0.2, 0.2, 0.08, 0.045, 0.5]];
    return {
      update(t, x, y, r, o = {}) {
        const gs = o.gs ?? 1, frame = o.frame !== false, sk = clamp01(o.spots ?? 1), fl = clamp01(o.flare ?? 0), fsh = clamp01(o.flash ?? 0);
        if (frame) {
          const cw = r * 2.5, ch = r * 2.5;
          easel.setAttribute('d', inkPath([[x - r * 0.9, y - ch / 2 - 40], [x - r * 1.3, y + ch / 2 + 300]], { w: 9, seed: sd + 1, t }) + ' ' + inkPath([[x + r * 0.9, y - ch / 2 - 40], [x + r * 1.3, y + ch / 2 + 300]], { w: 9, seed: sd + 2, t }) + ' ' +
            inkPath(rect(x - cw / 2, y - ch / 2, cw, ch), { w: 6, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath([[x - cw / 2 - 10, y + ch / 2 + 14], [x + cw / 2 + 10, y + ch / 2 + 14]], { w: 9, seed: sd + 4, t }));
          card.setAttribute('d', inkLoop(rect(x - cw / 2, y - ch / 2, cw, ch), { seed: sd + 5, t, amp: 1, smooth: false }));
        } else { easel.setAttribute('d', ''); card.setAttribute('d', ''); }
        const D = ell(x, y, r, r, 28);
        disc.setAttribute('d', inkLoop(D, { seed: sd + 6, t, amp: 1.2 }));
        pen.setAttribute('d', '');
        // limb darkening ring + the drawn outline
        discR.setAttribute('d', inkPath(D, { w: Math.max(4, r * 0.025), seed: sd + 7, t, closed: true, amp: 1.2 }) + ' ' + inkPath(ell(x, y, r * 0.93, r * 0.93, 28), { w: Math.max(2, r * 0.01), seed: sd + 8, t, closed: true, amp: 1 }));
        // sunspots appear one by one as they are "sketched"
        let sp = '', pd = '', sh = '';
        const ng = Math.round(sk * group.length);
        const gx = x + r * 0.08, gy = y + r * 0.1;
        group.slice(0, ng).map(([u, v, rr]) => [u * gs, v * gs, rr * gs]).forEach(([u, v, rr], i) => {
          pd += inkDot(gx + u * r, gy + v * r, rr * r * 1.6, rr * r * 1.2, sd + 20 + i, t, 1.5) + ' ';
          sp += inkDot(gx + u * r, gy + v * r, rr * r * 0.75, rr * r * 0.6, sd + 30 + i, t, 1) + ' ';
          for (let k = 0; k < 3; k++) { const a = i + k * 2.1; sh += inkPath([[gx + u * r + Math.cos(a) * rr * r * 1.1, gy + v * r + Math.sin(a) * rr * r * 0.9], [gx + u * r + Math.cos(a) * rr * r * 1.7, gy + v * r + Math.sin(a) * rr * r * 1.3]], { w: Math.max(2, r * 0.008), seed: sd + 40 + i * 3 + k, t, amp: 0.6 }) + ' '; }
        });
        pen.setAttribute('d', pd); spots.setAttribute('d', sp); sketch.setAttribute('d', sh);
        // white-light flare: two bright kernels with a gold halo + burst rays
        let kd = '', kr = '', gd = '', rd = '';
        if (fl > 0.01) kernels.map(([u, v, a, b, rot]) => [u * gs, v * gs, a * gs, b * gs, rot]).forEach(([u, v, a, b, rot], i) => {
          const cx = gx + u * r, cy = gy + v * r, s = fl * (1 + 0.25 * fsh) * (0.9 + 0.1 * Math.sin(t * 9 + i));
          const P = ell(0, 0, a * r * s, b * r * s, 12).map(([px, py], k) => { const c = Math.cos(rot), sn = Math.sin(rot), w = 1 + 0.25 * Math.sin(k * 2.3 + i); return [cx + (px * c - py * sn) * w, cy + (px * sn + py * c) * w]; });
          kd += inkLoop(P, { seed: sd + 60 + i, t, amp: 1 }) + ' ';
          kr += inkPath(P, { w: Math.max(4, r * 0.016), seed: sd + 62 + i, t, closed: true, amp: 1 }) + ' ';
          gd += inkDot(cx, cy, a * r * 2.2 * s, b * r * 2.6 * s, sd + 64 + i, t, 2) + ' ';
          if (fsh > 0.01) for (let k = 0; k < 10; k++) {
            const an = k / 10 * Math.PI * 2 + i, R0 = a * r * 1.3, R1 = R0 + r * 0.32 * fsh * (0.6 + 0.6 * hz(k + i * 10, t, sd));
            rd += inkPath([[cx + Math.cos(an) * R0, cy + Math.sin(an) * R0], [cx + Math.cos(an) * R1, cy + Math.sin(an) * R1]], { w: Math.max(4, r * 0.016), seed: sd + 70 + k + i * 10, t, amp: 0.8, taper: 0.7 }) + ' ';
          }
        });
        kern.setAttribute('d', kd); kernR.setAttribute('d', kr); glow.setAttribute('d', gd); rays.setAttribute('d', rd);
        return { kernels: kernels.map(([u, v]) => [gx + u * r, gy + v * r]) };
      },
    };
  }

  window.CE = { atOr, f1, hz, ell, rect, fig, aurora, ridge, town, moon, pole, wire, spark, desk, key, sounder, battery, fire, tent, pan, scope, board };
})();
