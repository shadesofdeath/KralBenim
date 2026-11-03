// bat__lib: shared drawings for the bat_* shots (Stickstory "the 145-year mystery of bat echolocation", 2026-11-03).
// Not a shot type itself. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK), every line boils
// at 8 Hz via _ink.js, everything a pure function of (seed, t). Parametric: any bat / owl / sound-and-echo story.
// window.BAT = {
//   bat(parent, seed) -> {update(t, o)}   a small insect-eating bat seen from the front, wings spread: furry body, big
//       pointed ears, tiny eyes, finger bones in the wing membrane, scalloped trailing edge. o: {x, y (body centre),
//       s: 1 (1 = ~700 px wingspan), rot (deg), ph (flap phase, cycles), mouth: 0..1 (open, calling), blind: 0..1
//       (a soft dark cloth band over the eyes), plugs: 0..1 (gold wax plugs in the ears), flour: 0..1 (pale speckles),
//       fold: 0..1 (wings folded: hanging/held)} -> {mouth: [x, y], ears: [[x, y], [x, y]]} (world points)
//   owl(parent, seed) -> {update(t, o)}   o: {x, y, s: 1 (~300 px wingspan), rot, ph, dizzy: 0..1}
//   arcs(parent, seed) -> {update(t, o)}  sound arcs leaving a point: o: {x, y, dir (deg, 0 = right), p: 0..1 (on),
//       n: 3, range: 260, spread: 34 (deg half-angle), period: 0.7 (s), w: 6, color: INK.gold, ghost: false (dashed,
//       ink-soft: a sound nobody hears), from: 0 (start radius)}
//   moth(parent, seed) -> {update(t, o)}  o: {x, y, s: 1, ph}
//   burst(parent, seed) -> {update(t, x, y, r, p)}  red crash star (p 0..1)
//   threads(parent, seed) -> {update(t, o)}  silk threads hanging from a ceiling beam: o: {x0, x1, n, top, len: [a, b], sway}
//       -> returns [{x, y0, y1}] (current thread lines, for collisions)
//   figure(parent, K, seed)  like TD.figure plus K.beard ("black"|"grey"|"short"), K.accessory, K.x animates with
//       K.to + K.at + K.dur (walk)
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const R = (p, a, c = [0, 0]) => { const s = Math.sin(a), k = Math.cos(a); return [c[0] + (p[0] - c[0]) * k - (p[1] - c[1]) * s, c[1] + (p[0] - c[0]) * s + (p[1] - c[1]) * k]; };
  const ell = (cx, cy, rx, ry, n = 14) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

  // ------------------------------------------------------------------ bat
  function bat(parent, sd) {
    const g = el(parent, 'g');
    const rimE = inkEl(g, INK.paperLight);
    const memF = [inkEl(g, INK.inkSoft, { 'fill-opacity': 0.92 }), inkEl(g, INK.inkSoft, { 'fill-opacity': 0.92 })];
    const memR = inkEl(g), bones = inkEl(g, INK.paperDark);
    const earF = inkEl(g, INK.ink), earIn = inkEl(g, INK.red, { 'fill-opacity': 0.55 });
    const bodyF = inkEl(g, INK.ink), fur = inkEl(g, INK.inkSoft), headF = inkEl(g, INK.ink);
    const eyes = inkEl(g, INK.paperLight), mouthE = inkEl(g, INK.red), teeth = inkEl(g, INK.paperLight), feet = inkEl(g);
    const band = inkEl(g, INK.hatBand), bandR = inkEl(g), plugs = inkEl(g, INK.gold), plugR = inkEl(g), flourE = inkEl(g, INK.paperLight);
    return {
      update(t, o = {}) {
        const s = o.s ?? 1, X = o.x ?? 0, Y = o.y ?? 0, rot = (o.rot ?? 0) * Math.PI / 180, ph = o.ph ?? 0;
        const fold = clamp01(o.fold ?? 0);
        g.setAttribute('transform', `translate(${f1(X)} ${f1(Y)}) rotate(${f1(o.rot ?? 0)}) scale(${s.toFixed(4)})`);
        const S = k => sd * 60 + k;
        const flap = Math.sin(ph * Math.PI * 2);
        let mr = '', bn = '';
        const wingPts = side => {
          const sh = [side * 30, -30];
          // open wing in local units, then rotated around the shoulder by the flap and squashed by the fold
          let pts = { elbow: [side * 120, -86], wrist: [side * 205, -60], f1: [side * 350, -30], f2: [side * 320, 70], f3: [side * 230, 140], leg: [side * 34, 78] };
          const a = side * flap * 0.42;
          for (const k in pts) {
            let p = R(pts[k], -a, sh);
            p = [lerp(p[0], sh[0] + side * 30 + (p[0] - sh[0]) * 0.12, fold), lerp(p[1], p[1] * 0.6 + 40, fold)];
            pts[k] = p;
          }
          return { sh, ...pts };
        };
        [-1, 1].forEach((side, i) => {
          const w = wingPts(side);
          // membrane outline: shoulder -> elbow -> wrist -> f1 tip, scallops back via f2, f3 to the leg
          const sc = (a, b, k) => [lerp(a[0], b[0], 0.5) - side * 18 * k, lerp(a[1], b[1], 0.5) - 26 * k];
          const mem = [w.sh, w.elbow, w.wrist, w.f1, sc(w.f1, w.f2, 1), w.f2, sc(w.f2, w.f3, 1), w.f3, sc(w.f3, w.leg, 1), w.leg];
          memF[i].setAttribute('d', inkLoop(mem, { seed: S(1 + i), t, amp: 1.2 }));
          mr += inkPath(mem, { w: 5, seed: S(3 + i), t, closed: true, amp: 1.2 }) + ' ';
          bn += inkPath([w.sh, w.elbow, w.wrist], { w: 7, seed: S(5 + i), t, amp: 1 }) + ' ';
          for (const [k, f] of [[0, w.f1], [1, w.f2], [2, w.f3]]) bn += inkPath([w.wrist, f], { w: 3.6, seed: S(7 + i * 3 + k), t, amp: 1, taper: 0.6 }) + ' ';
          bn += inkPath([[w.wrist[0], w.wrist[1]], [w.wrist[0] + side * 4, w.wrist[1] - 22]], { w: 5, seed: S(14 + i), t, amp: 0.6 }) + ' ';   // thumb
        });
        memR.setAttribute('d', mr); bones.setAttribute('d', bn);
        let rimD = '';
        if (o.rim) {
          const rw = Math.min(26, 7 / s);
          [-1, 1].forEach((side, i) => {
            const w = wingPts(side);
            rimD += inkPath([w.sh, w.elbow, w.wrist, w.f1, w.f2, w.f3, w.leg], { w: rw, seed: S(90 + i), t, closed: true, amp: 1, smooth: false }) + ' ';
            rimD += inkPath([[side * 12, -104], [side * 34, -170], [side * 64, -196], [side * 66, -130], [side * 46, -86]], { w: rw, seed: S(92 + i), t, closed: true, amp: 1 }) + ' ';
          });
          rimD += inkPath(ell(0, -30, 54, 120, 14), { w: rw, seed: S(94), t, closed: true, amp: 1 });
        }
        rimE.setAttribute('d', rimD);
        // ears
        let ed = '', ei = '';
        const ears = [];
        [-1, 1].forEach((side, i) => {
          const base1 = [side * 12, -104], base2 = [side * 46, -86], tip = [side * 64, -196];
          ed += inkLoop([base1, [side * 34, -170], tip, [side * 66, -130], base2], { seed: S(20 + i), t, amp: 1 }) + ' ';
          ei += inkLoop([[side * 24, -108], [side * 40, -160], [side * 56, -168], [side * 52, -112]], { seed: S(22 + i), t, amp: 0.8 }) + ' ';
          ears.push([side * 38, -112]);
        });
        earF.setAttribute('d', ed); earIn.setAttribute('d', ei);
        // body + head
        const bp = ell(0, 10, 44, 78, 14);
        bodyF.setAttribute('d', inkLoop(bp, { seed: S(30), t, amp: 1.2 }));
        let fd = '';
        for (let k = 0; k < 7; k++) { const yy = -30 + k * 14, xx = (k % 2 ? 10 : -10); fd += inkPath([[xx - 14, yy], [xx, yy + 8], [xx + 14, yy]], { w: 3, seed: S(31 + k), t, amp: 0.8 }) + ' '; }
        fur.setAttribute('d', fd);
        headF.setAttribute('d', inkLoop(ell(0, -88, 50, 42, 12), { seed: S(40), t, amp: 1.2 }));
        const blink = ((t + (sd % 97) * 0.37) % 3.7) < 0.12 ? 0.25 : 1;
        eyes.setAttribute('d', inkDot(-18, -96, 7, 7 * blink, S(41), t) + ' ' + inkDot(18, -96, 7, 7 * blink, S(42), t));
        const mo = clamp01(o.mouth ?? 0);
        mouthE.setAttribute('d', inkLoop(ell(0, -66, 12 + 6 * mo, 3 + 15 * mo, 10), { seed: S(43), t, amp: 0.6 }));
        teeth.setAttribute('d', mo > 0.3 ? inkLoop([[-10, -70 - 6 * mo], [-6, -62], [-3, -70 - 6 * mo]], { seed: S(44), t, amp: 0.3, smooth: false }) + ' ' + inkLoop([[10, -70 - 6 * mo], [6, -62], [3, -70 - 6 * mo]], { seed: S(45), t, amp: 0.3, smooth: false }) : '');
        feet.setAttribute('d', inkPath([[-14, 84], [-22, 112], [-30, 118]], { w: 5, seed: S(46), t }) + ' ' + inkPath([[14, 84], [22, 112], [30, 118]], { w: 5, seed: S(47), t }));
        // blindfold: a soft cloth band over the eyes
        const bl = clamp01(o.blind ?? 0);
        if (bl > 0.01) {
          const w = 64 * bl, pts = [[-w, -112], [w, -110], [w + 4, -82], [-w - 4, -84]];
          band.setAttribute('d', inkLoop(pts, { seed: S(50), t, amp: 1 }));
          bandR.setAttribute('d', inkPath(pts, { w: 4, seed: S(51), t, closed: true, amp: 1 }) + (bl > 0.95 ? ' ' + inkPath([[56, -96], [90, -78], [104, -64]], { w: 5, seed: S(52), t }) : ''));
        } else { band.setAttribute('d', ''); bandR.setAttribute('d', ''); }
        // wax plugs in the ears
        const pl = clamp01(o.plugs ?? 0);
        if (pl > 0.01) {
          let pd = '', prr = '';
          ears.forEach(([ex, ey], i) => {
            const yy = ey - 30 - (1 - pl) * 120, xx = ex + (ex > 0 ? 1 : -1) * (1 - pl) * 60;
            pd += inkDot(xx, yy, 22, 18, S(53 + i), t) + ' ';
            prr += inkCircle(xx, yy, 21, S(55 + i), t, { w: 4, ry: 17 }) + ' ';
          });
          plugs.setAttribute('d', pd); plugR.setAttribute('d', prr);
        } else { plugs.setAttribute('d', ''); plugR.setAttribute('d', ''); }
        // flour / varnish speckles
        const fl = clamp01(o.flour ?? 0);
        let fdd = '';
        if (fl > 0.01) {
          const r = rng(S(60)), n = Math.round(70 * fl);
          for (let k = 0; k < n; k++) {
            const side = r() < 0.5 ? -1 : 1, u = r(), v = r();
            const x = side * lerp(20, 300, u) * (1 - fold * 0.8), y = lerp(-70, 110, v) - u * 40 + (side * flap * 0.42 * lerp(20, 300, u)) * -side * 0.0;
            fdd += inkDot(x, y + Math.abs(x) * Math.sin(-side * flap * 0.42) * side * 0, 5 + r() * 5, 4 + r() * 4, S(70 + k), t) + ' ';
          }
        }
        flourE.setAttribute('d', fdd);
        const sR = (p) => { const q = R([p[0] * s, p[1] * s], rot); return [X + q[0], Y + q[1]]; };
        return { mouth: sR([0, -66]), ears: ears.map(sR), head: sR([0, -88]) };
      },
    };
  }

  // ------------------------------------------------------------------ owl
  function owl(parent, sd) {
    const g = el(parent, 'g');
    const rimO = inkEl(g, INK.paperLight);
    const wingF = [inkEl(g, INK.paperDark), inkEl(g, INK.paperDark)], wingR = inkEl(g), feath = inkEl(g, INK.inkSoft);
    const bodyF = inkEl(g, INK.stain), bodyR = inkEl(g), chest = inkEl(g, INK.inkSoft), faceF = inkEl(g, INK.paperLight), faceR = inkEl(g);
    const eyeW = inkEl(g, INK.gold), eyeR = inkEl(g), pup = inkEl(g), beak = inkEl(g, INK.gold), beakR = inkEl(g), tufts = inkEl(g, INK.ink), stars = inkEl(g, INK.gold);
    return {
      update(t, o = {}) {
        const s = o.s ?? 1, ph = o.ph ?? 0, flap = Math.sin(ph * Math.PI * 2), dz = clamp01(o.dizzy ?? 0);
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(o.rot ?? 0)}) scale(${s.toFixed(4)})`);
        const S = k => sd * 70 + k;
        let wr = '', fe = '';
        [-1, 1].forEach((side, i) => {
          const sh = [side * 50, -40], a = side * flap * 0.55;
          const pts = [[side * 50, -60], [side * 150, -110], [side * 260, -90], [side * 300, -50], [side * 240, -20], [side * 250, 10], [side * 170, 10], [side * 60, 40]].map(p => R(p, -a, sh));
          wingF[i].setAttribute('d', inkLoop(pts, { seed: S(1 + i), t }));
          wr += inkPath(pts, { w: 6, seed: S(3 + i), t, closed: true }) + ' ';
          for (let k = 0; k < 3; k++) fe += inkPath([R([side * (120 + k * 50), -70 + k * 6], -a, sh), R([side * (150 + k * 50), -10], -a, sh)], { w: 3.4, seed: S(5 + i * 3 + k), t, amp: 1 }) + ' ';
        });
        wingR.setAttribute('d', wr); feath.setAttribute('d', fe);
        let ro = '';
        if (o.rim) {
          [-1, 1].forEach((side, i) => { const sh = [side * 50, -40], a = side * flap * 0.55;
            ro += inkPath([[side * 50, -60], [side * 150, -110], [side * 260, -90], [side * 300, -50], [side * 240, -20], [side * 250, 10], [side * 170, 10], [side * 60, 40]].map(p => R(p, -a, sh)), { w: 16, seed: S(60 + i), t, closed: true }) + ' '; });
          ro += inkPath(ell(0, -10, 84, 140, 14), { w: 16, seed: S(62), t, closed: true });
        }
        rimO.setAttribute('d', ro);
        const bp = ell(0, 0, 78, 110, 14);
        bodyF.setAttribute('d', inkLoop(bp, { seed: S(10), t })); bodyR.setAttribute('d', inkPath(bp, { w: 6, seed: S(11), t, closed: true }));
        let cd = ''; for (let k = 0; k < 6; k++) { const x = -30 + (k % 3) * 30, y = 20 + Math.floor(k / 3) * 34; cd += inkPath([[x - 10, y], [x, y + 10], [x + 10, y]], { w: 3.4, seed: S(12 + k), t, amp: 0.8 }) + ' '; }
        chest.setAttribute('d', cd);
        const fp = [[-74, -70], [-40, -100], [0, -88], [40, -100], [74, -70], [64, -20], [0, -6], [-64, -20]];
        faceF.setAttribute('d', inkLoop(fp, { seed: S(20), t })); faceR.setAttribute('d', inkPath(fp, { w: 5, seed: S(21), t, closed: true }));
        tufts.setAttribute('d', inkLoop([[-70, -86], [-92, -146], [-40, -100]], { seed: S(22), t, smooth: false }) + ' ' + inkLoop([[70, -86], [92, -146], [40, -100]], { seed: S(23), t, smooth: false }));
        eyeW.setAttribute('d', inkDot(-32, -58, 24, 24, S(24), t) + ' ' + inkDot(32, -58, 24, 24, S(25), t));
        eyeR.setAttribute('d', inkCircle(-32, -58, 24, S(26), t, { w: 4 }) + ' ' + inkCircle(32, -58, 24, S(27), t, { w: 4 }));
        const sp = dz * t * 9, px = Math.cos(sp) * 8 * dz, py = Math.sin(sp) * 8 * dz;
        pup.setAttribute('d', inkDot(-32 + px, -58 + py, 11, 11, S(28), t) + ' ' + inkDot(32 - px, -58 - py, 11, 11, S(29), t));
        const bk = [[-12, -40], [12, -40], [0, -14]];
        beak.setAttribute('d', inkLoop(bk, { seed: S(30), t, smooth: false })); beakR.setAttribute('d', inkPath(bk, { w: 3.4, seed: S(31), t, closed: true, smooth: false }));
        let st = '';
        if (dz > 0.05) for (let k = 0; k < 3; k++) {
          const a = t * 3 + k * 2.1, cx = Math.cos(a) * 110, cy = -170 + Math.sin(a) * 26, r = 16 * dz, q = [];
          for (let m = 0; m < 10; m++) { const b = m * Math.PI / 5, rr = m % 2 ? r * 0.42 : r; q.push([cx + Math.cos(b) * rr, cy + Math.sin(b) * rr]); }
          st += inkLoop(q, { seed: S(40 + k), t, smooth: false, amp: 0.6 }) + ' ';
        }
        stars.setAttribute('d', st);
      },
    };
  }

  // ------------------------------------------------------------------ sound arcs
  function arcs(parent, sd) {
    const e = inkEl(parent, INK.gold);
    return {
      node: e,
      update(t, o = {}) {
        const p = clamp01(o.p ?? 1);
        if (p <= 0.01) { e.setAttribute('d', ''); return; }
        e.setAttribute('fill', o.color || (o.ghost ? INK.inkSoft : INK.gold));
        const n = o.n ?? 3, range = o.range ?? 260, spr = (o.spread ?? 34) * Math.PI / 180, per = o.period ?? 0.7, dir = (o.dir ?? 0) * Math.PI / 180;
        const from = o.from ?? 0, w = o.w ?? 6;
        let d = '';
        for (let k = 0; k < n; k++) {
          const u = (((t / per) + k / n) % 1 + 1) % 1, r = from + 30 + u * range, fade = (1 - u) * p;
          if (fade < 0.06) continue;
          if (o.ghost) {
            for (let q = 0; q < 5; q++) {
              const a0 = dir - spr + (q / 5) * 2 * spr, a1 = a0 + spr * 0.24;
              d += inkPath([[o.x + Math.cos(a0) * r, o.y + Math.sin(a0) * r], [o.x + Math.cos((a0 + a1) / 2) * r, o.y + Math.sin((a0 + a1) / 2) * r], [o.x + Math.cos(a1) * r, o.y + Math.sin(a1) * r]], { w: w * 0.7, seed: sd + k * 10 + q, t, amp: 0.8 }) + ' ';
            }
          } else {
            const pts = [];
            for (let q = 0; q <= 8; q++) { const a = dir - spr + q / 8 * 2 * spr; pts.push([o.x + Math.cos(a) * r, o.y + Math.sin(a) * r]); }
            d += inkPath(pts, { w: w * lerp(0.45, 1.15, fade), seed: sd + k * 10, t, amp: 1 }) + ' ';
          }
        }
        e.setAttribute('d', d);
      },
    };
  }

  // ------------------------------------------------------------------ moth
  function moth(parent, sd) {
    const g = el(parent, 'g'), wF = inkEl(g, INK.paperLight), wR = inkEl(g), spots = inkEl(g, INK.stain), body = inkEl(g, INK.ink), ant = inkEl(g);
    return {
      update(t, o = {}) {
        const s = o.s ?? 1, fl = 0.55 + 0.45 * Math.abs(Math.sin((o.ph ?? t * 4) * Math.PI));
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) scale(${s.toFixed(4)})`);
        let wf = '', wr = '', sp = '';
        [-1, 1].forEach((side, i) => {
          const up = [[0, -6], [side * 90 * fl, -70], [side * 110 * fl, -20], [side * 20, 4]], lo = [[0, 6], [side * 70 * fl, 30], [side * 50 * fl, 70], [side * 10, 20]];
          for (const [k, q] of [[0, up], [1, lo]]) { wf += inkLoop(q, { seed: sd + i * 4 + k, t, amp: 0.8 }) + ' '; wr += inkPath(q, { w: 3.6, seed: sd + 10 + i * 4 + k, t, closed: true, amp: 0.8 }) + ' '; }
          sp += inkDot(side * 64 * fl, -34, 12 * fl, 10, sd + 30 + i, t) + ' ';
        });
        wF.setAttribute('d', wf); wR.setAttribute('d', wr); spots.setAttribute('d', sp);
        body.setAttribute('d', inkLoop(ell(0, 6, 10, 38, 10), { seed: sd + 40, t, amp: 0.8 }));
        ant.setAttribute('d', inkPath([[-4, -30], [-20, -64], [-34, -70]], { w: 3, seed: sd + 41, t }) + ' ' + inkPath([[4, -30], [20, -64], [34, -70]], { w: 3, seed: sd + 42, t }));
      },
    };
  }

  // ------------------------------------------------------------------ crash star
  function burst(parent, sd) {
    const f = inkEl(parent, INK.red), r_ = inkEl(parent);
    return {
      update(t, x, y, r, p) {
        if (p <= 0.01) { f.setAttribute('d', ''); r_.setAttribute('d', ''); return; }
        const q = [], rr = r * spring(p, 0, 1);
        for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8 + 0.2, d = k % 2 ? rr * 0.45 : rr; q.push([x + Math.cos(a) * d, y + Math.sin(a) * d]); }
        f.setAttribute('d', inkLoop(q, { seed: sd + 1, t, smooth: false, amp: 1 }));
        r_.setAttribute('d', inkPath(q, { w: 4, seed: sd + 2, t, closed: true, smooth: false, amp: 1 }));
      },
    };
  }

  // ------------------------------------------------------------------ silk threads
  function threads(parent, sd) {
    const beam = inkEl(parent, INK.hatBand), beamR = inkEl(parent), thR = inkEl(parent, INK.paperLight), th = inkEl(parent, INK.inkSoft), knots = inkEl(parent, INK.paperLight);
    return {
      update(t, o = {}) {
        const n = o.n ?? 9, x0 = o.x0 ?? 100, x1 = o.x1 ?? 1800, top = o.top ?? 60, L = o.len || [600, 820], sway = o.sway ?? 1;
        const r = rng(sd + 5), out = [];
        let d = '', kd = '', rd = '';
        if (o.beam !== false) {
          const bp = [[x0 - 120, top - 26], [x1 + 120, top - 30], [x1 + 120, top + 8], [x0 - 120, top + 10]];
          beam.setAttribute('d', inkLoop(bp, { seed: sd + 1, t, smooth: false }));
          beamR.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
        }
        for (let k = 0; k < n; k++) {
          const x = lerp(x0, x1, n > 1 ? k / (n - 1) : 0.5) + (r() - 0.5) * 50, len = lerp(L[0], L[1], r()), ph = r() * 6;
          const sw = Math.sin(t * 0.9 + ph) * 10 * sway;
          d += inkPath([[x, top], [x + sw * 0.4, top + len * 0.5], [x + sw, top + len]], { w: 2.6, seed: sd + 10 + k, t, amp: 0.7, taper: 0.1 }) + ' ';
          if (o.rim) rd += inkPath([[x, top], [x + sw * 0.4, top + len * 0.5], [x + sw, top + len]], { w: 6.5, seed: sd + 10 + k, t, amp: 0.7, taper: 0.1 }) + ' ';
          kd += inkDot(x + sw, top + len, 5, 5, sd + 40 + k, t) + ' ';
          out.push({ x: x + sw, y0: top, y1: top + len });
        }
        th.setAttribute('d', d); knots.setAttribute('d', kd); thR.setAttribute('d', rd);
        return out;
      },
    };
  }

  // ------------------------------------------------------------------ figure (narrator or period person)
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  function figure(parent, K, sd) {
    if (!K) return null;
    const g = el(parent, 'g');
    const isK = K.hat !== false;
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), beard: isK ? null : (K.beard || null), seed: sd });
    return {
      K,
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion, text: K.text, item: K.item }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        let xu = K.x ?? 0.8, walking = false;
        if (K.to != null) {
          const a = atOr(cues, K.at, 0), d = K.dur ?? 1.6, u = clamp01((lt - a) / d);
          xu = lerp(K.x ?? 0.8, K.to, EASE_IO ? EASE_IO(u) : u); walking = lt >= a && u < 1;
        }
        const x = xu * W, y = (K.y ?? 0.8) * H, face = faceOf(s.face ?? K.face, -1), sc = K.scale ?? 1;
        const o = { x, y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, text: s.text, item: s.item };
        if (walking) o.ph = (xu * W) / (sc * KASIF.gait('walk'));
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, walking ? 'walk' : (s.pose || 'idle'), o);
        const hw = r.hands[1], hl = r.hands[0];
        return { x, y, face, hand: [x + face * sc * hw[0], y + sc * hw[1]], hand2: [x + face * sc * hl[0], y + sc * hl[1]], head: [x + face * sc * r.head[0], y + sc * r.head[1]] };
      },
    };
  }

  // ------------------------------------------------------------------ darkness hatching (ink strokes, no overlay)
  //   hatch(parent, seed) -> {update(t, W, H, dk 0..1, light: [x, y, r] | null)}
  function hatch(parent, sd) {
    const e = inkEl(parent, INK.ink, { 'fill-opacity': 0.62 }), e2 = inkEl(parent, INK.ink, { 'fill-opacity': 0.4 });
    const lines = (t, W, H, dk, L, dir, sp, seedOff) => {
      const n = Math.ceil((W + H) / sp) + 2; let hd = '';
      for (let k = 0; k < n; k++) {
        const c = k * sp - H; let seg = [];
        const flush = () => { if (seg.length > 1) hd += inkPath(seg, { w: lerp(2.6, 6.4, dk), seed: sd + seedOff + k * 3, t, amp: 1.2, taper: 0.4 }) + ' '; seg = []; };
        for (let q = 0; q <= 12; q++) {
          const y = q / 12 * H, x = dir > 0 ? c + y : W - (c + y);
          const inside = L && Math.hypot(x - L[0], y - L[1]) < L[2];
          if (x < -40 || x > W + 40 || inside) { flush(); continue; }
          seg.push([x, y]);
        }
        flush();
      }
      return hd;
    };
    return {
      update(t, W, H, dk, L) {
        e.setAttribute('d', dk > 0.02 ? lines(t, W, H, dk, L, 1, lerp(64, 24, dk), 500) : '');
        e2.setAttribute('d', dk > 0.55 ? lines(t, W, H, (dk - 0.55) / 0.45, L, -1, lerp(90, 40, (dk - 0.55) / 0.45), 900) : '');
      },
    };
  }

  // ------------------------------------------------------------------ baked darkness wash
  //   wash(parent, W, H, pools: [[x, y, r]], alpha: 0.86) -> {node, set(opacity 0..1)}
  //   One canvas baked at build time (ink token at `alpha`, soft radial light pools cut out, darker edges), drawn as a
  //   single <image>: no per-frame full-screen vector layer (performance rule).
  function wash(parent, W, H, pools = [], alpha = 0.86) {
    let href = '';
    try {
      const c = document.createElement('canvas'); c.width = Math.round(W / 2); c.height = Math.round(H / 2);
      const x = c.getContext('2d'), k = 0.5, [r, g, b] = hex2rgb(INK.ink);
      x.fillStyle = `rgba(${r},${g},${b},${alpha})`; x.fillRect(0, 0, c.width, c.height);
      x.globalCompositeOperation = 'destination-out';
      pools.forEach(([px, py, pr, ps = 0.92]) => {
        const gr = x.createRadialGradient(px * k, py * k, 0, px * k, py * k, pr * k);
        gr.addColorStop(0, `rgba(0,0,0,${ps})`); gr.addColorStop(0.45, `rgba(0,0,0,${ps * 0.76})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
        x.fillStyle = gr; x.fillRect(0, 0, c.width, c.height);
      });
      x.globalCompositeOperation = 'source-over';
      const v = x.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.45, c.width / 2, c.height / 2, c.width * 0.62);
      v.addColorStop(0, `rgba(${r},${g},${b},0)`); v.addColorStop(1, `rgba(${r},${g},${b},0.5)`);
      x.fillStyle = v; x.fillRect(0, 0, c.width, c.height);
      href = c.toDataURL('image/png');
    } catch (e) { href = ''; }
    const node = el(parent, 'image', { x: -40, y: -40, width: W + 80, height: H + 80, preserveAspectRatio: 'none', opacity: 0 });
    if (href) { node.setAttribute('href', href); node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href); }
    let last = -1;
    return { node, set(o) { o = Math.round(clamp01(o) * 100) / 100; if (o !== last) { node.setAttribute('opacity', o); node.style.display = o > 0.005 ? '' : 'none'; last = o; } } };
  }

  // ------------------------------------------------------------------ cassock (black robe + white clerical collar)
  //   cassock(parent, seed) -> {update(t, fig (BAT.figure result), scale)}
  function cassock(parent, sd) {
    const rim = inkEl(parent, INK.paperLight), f = inkEl(parent, INK.ink), coll = inkEl(parent, INK.paperLight), collR = inkEl(parent);
    return {
      update(t, o, sc) {
        const x = o.x, top = o.head[1] + 62 * sc, bot = o.y - 22 * sc;
        const pts = [[x - 40 * sc, top], [x + 40 * sc, top], [x + 62 * sc, top + 120 * sc], [x + 92 * sc, bot], [x - 92 * sc, bot], [x - 62 * sc, top + 120 * sc]];
        f.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, amp: 1 }));
        rim.setAttribute('d', inkPath(pts, { w: 9, seed: sd + 2, t, closed: true, amp: 1 }));
        const cp = [[x - 26 * sc, top - 6 * sc], [x + 26 * sc, top - 6 * sc], [x + 24 * sc, top + 12 * sc], [x - 24 * sc, top + 12 * sc]];
        coll.setAttribute('d', inkLoop(cp, { seed: sd + 3, t, amp: 0.6, smooth: false }));
        collR.setAttribute('d', inkPath(cp, { w: 3, seed: sd + 4, t, closed: true, amp: 0.6, smooth: false }));
      },
    };
  }

  window.BAT = { wash, cassock, hatch, atOr, f1, ell, bat, owl, arcs, moth, burst, threads, figure };
})();
