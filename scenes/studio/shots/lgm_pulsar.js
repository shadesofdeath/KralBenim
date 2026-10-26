// lgm_pulsar: shots for the Stickstory Short "LGM-1, the first pulsar" (2026-10-26, Jocelyn Bell 1967), parchment ink
// style (brand/kit/BRAND.md §3, §5): palette tokens only (INK), every line boils at 8 Hz via _ink.js, everything a pure
// function of (seed, lt). Parametric: usable for any radio-astronomy / discovery / prize story.
// Uses td__lib.js (window.TD: stars, label, figure, earth) and ce__lib.js (window.CE: desk) at build time.
//
// Shared params (all shots): kasif: {x, y (ground, 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face,
//   emotion}]} | false · cast: [{who: "woman"|"man", hair: "dark"|"grey", accessory, beard, x, y, scale, pose, face,
//   dir, emotion, seq}] (period figures, hatless; "woman" gets a 1960s bob) · labels: [{text, x, y, at, size, color,
//   font: "hand"|"serif", box, rot, strike}] · stars: 0 · cam: {zoom: 1.06, fx: 0.5, fy: 0.45} · cues: hit (punch).
//
// SHOTS.lgm_chart — a chart-recorder paper strip scrolling under a pen that draws a noisy trace with a sharp pulse every
//   `period` seconds (real time: the rhythm on screen is the rhythm of the signal). P: {
//   strip: {y: 0.33 (centre, 0..1 H), h: 250, x0: -20, x1: W + 20, pen: 0.78 (x of the pen, 0..1 W), v: 180 (px/s)},
//   period: 1.33, phase: 0.25, mode: "hook" | "pulse",
//   // hook : at "alien" (cue) a little green ink alien doodle pops out above the strip and waves
//   //        (alien: {x: 0.5, y: 0.17, s: 1})
//   // pulse: at "beat" (cue) a red bracket spans the two newest pulses with a big "1.33 s" (bracket: {text, size})
// }
// SHOTS.lgm_dish — a radio telescope dish under the stars; ink wave fronts travel from a spiral galaxy to the dish
//   feed; at "ask" (cue) a big red "?" pops over the dish. P: {galaxy: {x: 0.22, y: 0.2, r: 150}, dish: {x: 0.6,
//   y: 0.42, r: 230}, ground: 0.6, ask}
// SHOTS.lgm_desk — 1967 observatory hut: a desk with a chart recorder spilling paper over the edge into folds on the
//   floor; at "hit" (cue) a wavy signal line shoots down from the sky into the recorder (punch + paper jolt).
//   P: {desk: {x: 0.5, y: 0.47, w: 560}, signal: {from: [0.1, 0.12]}, hit}
// SHOTS.lgm_sky — a round star chart (grid, constellation lines); source A pulses with rings; at "second" (cue) source B
//   lights up on the far side of the chart, a dashed arc links them. P: {chart: {x: 0.5, y: 0.36, r: 360},
//   a: [-0.55, 0.15], b: [0.55, -0.2] (in chart radii), second}
// SHOTS.lgm_pulsar — a spinning neutron star: dense hatched ball, dipole field loops, two lighthouse beams that turn
//   once every `period` s; a small Earth flashes each time beam A sweeps over it. P: {star: {x: 0.5, y: 0.34, r: 64},
//   earth: {x: 0.84, y: 0.5, r: 62} | false, period: 1.33, beam: 760 (px)}
// SHOTS.lgm_medal — a big gold medal on a red ribbon floats in the middle; at "give" (cue) it flies into the raised hand
//   of a cast member (medal: {x: 0.5, y: 0.24, r: 120, text: "1974", to: index of the cast member}).
// SHOTS.lgm_prize — a big Fraunces money counter (counter: {x: 0.5, y: 0.2, size: 130, value: 3000000}).
//   mode "win": at "count" (cue) the counter runs up from 0 and banknotes rain down around the winner (cast[0]).
//   mode "give": banknotes fly in arcs from cast[0] to the other cast members while the counter runs down to 0
//   (give: cue, dur: 1.4).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, n, fb) => typeof n === 'number' ? n : (n != null && cues && cues[n] != null) ? cues[n] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const ell = (cx, cy, rx, ry, n = 16, rot = 0) => {
    const c = Math.cos(rot), s = Math.sin(rot), out = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, x = Math.cos(a) * rx, y = Math.sin(a) * ry; out.push([cx + x * c - y * s, cy + x * s + y * c]); }
    return out;
  };
  const rect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const hz = (a, b) => { const r = rng(inkHash(a, b)); r(); return r(); };

  // ------------------------------------------------------------------ frame helpers
  function base(ctx, nStars) {
    const { P, W, H, svg, seed } = ctx;
    const sd = seed * 1000 + 467;
    const root = el(svg, 'g'), cam = el(root, 'g');
    const n = P.stars ?? nStars ?? 0;
    const stars = n ? window.TD.stars(cam, sd + 1, W, H, n, 0.18, 0.55) : null;
    return { sd, root, cam, stars };
  }
  function camT(cam, lt, dur, cues, W, H, P, d = {}) {
    const C = Object.assign({ zoom: 1.06, fx: 0.5, fy: 0.45 }, d, P.cam || {});
    const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
    const z = lerp(1, C.zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
    const fx = W * C.fx, fy = H * C.fy, sh = (C.shake || 0) * hit;
    cam.setAttribute('transform', `translate(${f1(fx + sh * Math.sin(lt * 70))} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }
  function extras(ctx, root, castParent, sd, kdef) {
    const { P, W, H } = ctx, TD = window.TD;
    const cast = (P.cast || []).map((K, i) => person(el(castParent, 'g'), K, sd + 500 + i * 37));
    const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 300 + i));
    const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({}, kdef, P.kasif), sd + 200) : null;
    return { cast, labels, kas };
  }
  function tail(o, lt, t, cues, W, H) {
    o.labels.forEach(l => l && l.update(lt, t, cues));
    if (o.kas) o.kas.update(lt, t, cues, W, H);
  }

  // ------------------------------------------------------------------ period figure (hatless; "woman" has a bob)
  function person(parent, K, sd) {
    const g = el(parent, 'g'), woman = K.who === 'woman';
    const hairCol = K.hair === 'grey' ? INK.paperDark : INK.inkSoft;
    const hairB = woman ? inkEl(g, hairCol) : null, hairBR = woman ? inkEl(g) : null;
    const rg = el(g, 'g');
    const rig = KASIF.create(rg, { scale: K.scale ?? 0.8, hat: false, accessory: K.accessory || null, beard: K.beard || null, seed: sd });
    const hairF = woman ? inkEl(g, hairCol) : null, hairFR = woman ? inkEl(g) : null;
    return {
      K,
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        const sc = K.scale ?? 0.8, face = faceOf(s.face ?? K.face, 1);
        const X = (K.x ?? 0.3) * W, Y = (K.y ?? 0.6) * H;
        const o = { x: X, y: Y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, item: s.item || K.item };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, s.pose || 'idle', o);
        const Wp = p => [X + face * sc * p[0], Y + sc * p[1]];
        if (woman) {
          const hc = Wp(r.head), R = 72 * sc, sw = Math.sin(t * 2.1) * 0.05;
          const HP = pts => pts.map(([u, v]) => [hc[0] + face * u * R, hc[1] + v * R]);
          const back = HP([[0.8, -0.62], [0.3, -1.06], [-0.4, -1.06], [-0.95, -0.7], [-1.14, -0.05], [-1.1 + sw, 0.6], [-0.8 + sw, 0.86],
            [-0.42, 0.7], [-0.36, 0.2], [-0.2, 0.05]]);
          hairB.setAttribute('d', inkLoop(back, { seed: sd * 3 + 1, t, amp: 1 }));
          hairBR.setAttribute('d', inkPath(back, { w: 4.5, seed: sd * 3 + 2, t, closed: true, amp: 1 }));
          const fr = HP([[0.92, -0.38], [0.66, -0.88], [0.1, -1.08], [-0.5, -0.98], [-0.94, -0.6], [-1.0, -0.1], [-0.62, -0.46], [0.02, -0.6], [0.5, -0.44]]);
          hairF.setAttribute('d', inkLoop(fr, { seed: sd * 3 + 3, t, amp: 0.9 }));
          hairFR.setAttribute('d', inkPath(fr, { w: 4, seed: sd * 3 + 4, t, closed: true, amp: 0.9 }));
        }
        const hw = r.hands[1], hl = r.hands[0];
        return { x: X, y: Y, face, hand: Wp(hw), hand2: Wp(hl), head: Wp(r.head) };
      },
    };
  }

  // ------------------------------------------------------------------ chart-recorder strip
  function strip(parent, sd) {
    const paper = inkEl(parent, INK.paperLight), grid = inkEl(parent, INK.inkSoft), edge = inkEl(parent);
    const trace = inkEl(parent), hot = inkEl(parent, INK.red), arm = inkEl(parent, INK.inkSoft), armR = inkEl(parent), nib = inkEl(parent, INK.red);
    return {
      // o: {x0, x1, y (centre), h, xpen, v, period, phase, hl: 0..1 (red flash of the newest pulse)}
      update(lt, t, o) {
        const { x0, x1, y, h, xpen, v, period, phase } = o;
        const top = y - h / 2, bot = y + h / 2, baseY = y + h * 0.22, scroll = lt * v;
        const pp = [[x0, top], [x1, top + 4], [x1, bot], [x0, bot - 3]];
        paper.setAttribute('d', inkLoop(pp, { seed: sd + 1, t, amp: 1, smooth: false }));
        edge.setAttribute('d', inkPath([[x0, top], [x1, top + 4]], { w: 6, seed: sd + 2, t }) + ' ' + inkPath([[x0, bot - 3], [x1, bot]], { w: 6, seed: sd + 3, t }));
        // grid: verticals ride with the paper, two faint horizontals
        let gd = '';
        const span = x1 - x0, step = 70;
        for (let k = 0; k < Math.ceil(span / step) + 1; k++) {
          const gx = x0 + (((k * step - scroll) % span) + span) % span;
          gd += inkPath([[gx, top + 12], [gx, bot - 12]], { w: 2, seed: sd + 20 + k, t, amp: 0.6 }) + ' ';
        }
        gd += inkPath([[x0, y - h * 0.12], [x1, y - h * 0.12]], { w: 2, seed: sd + 60, t, amp: 0.6 }) + ' ';
        grid.setAttribute('d', gd);
        // trace: noisy baseline + a pulse at every phase + k * period
        const pts = [], pulses = [];
        const noise = x => { const u = Math.floor((x + scroll) / 11); return (hz(sd + 7, u) - 0.5) * 12; };
        const k1 = Math.floor((lt - phase) / period), k0 = Math.floor((lt - phase - (xpen - x0) / v) / period);
        for (let k = k0; k <= k1; k++) {
          const tk = phase + k * period, xk = xpen - (lt - tk) * v;
          if (xk < x0 - 20 || xk > xpen) continue;
          pulses.push({ k, x: xk, A: h * (0.42 + 0.22 * hz(sd + 9, k + 1000)), age: lt - tk });
        }
        let pi = 0;
        for (let x = x0; x <= xpen; x += 11) {
          while (pi < pulses.length && pulses[pi].x < x) {
            const q = pulses[pi], A = q.A;
            pts.push([q.x - 9, baseY + noise(q.x - 9)], [q.x - 3, baseY - A * 0.55], [q.x, baseY - A], [q.x + 5, baseY - A * 0.15], [q.x + 10, baseY + A * 0.18]);
            pi++;
          }
          pts.push([x, baseY + noise(x)]);
        }
        const tip = [xpen, baseY + noise(xpen)];
        pts.push(tip);
        trace.setAttribute('d', pts.length > 1 ? inkPath(pts, { w: 4.5, seed: sd + 70, t, amp: 0.5, smooth: false, taper: 0.1 }) : '');
        // newest pulse flashes red while fresh
        const nw = pulses[pulses.length - 1];
        if (nw && nw.age < 0.45) {
          const A = nw.A;
          hot.setAttribute('d', inkPath([[nw.x - 9, baseY], [nw.x - 3, baseY - A * 0.55], [nw.x, baseY - A], [nw.x + 5, baseY - A * 0.15], [nw.x + 10, baseY + A * 0.18]], { w: 8, seed: sd + 71, t, amp: 0.5, smooth: false }));
        } else hot.setAttribute('d', '');
        if (o.box) {
          // recorder housing at the right end of the strip; the pen arm reaches out of it sideways
          const bx = x1 - 12, bw = o.box.w ?? 120, hb = rect(bx, top - 80, bw, h + 160);
          const ap = rect(xpen - 4, tip[1] - 34, bx - xpen + 6, 16);
          arm.setAttribute('d', inkLoop(hb, { seed: sd + 84, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(ap, { seed: sd + 80, t, amp: 0.8, smooth: false }));
          armR.setAttribute('d', inkPath(hb, { w: 6, seed: sd + 85, t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkPath(ap, { w: 4, seed: sd + 81, t, closed: true, amp: 0.8, smooth: false }) + ' ' +
            inkCircle(bx + bw / 2, top - 20, 30, sd + 86, t, { w: 5 }) + ' ' + inkPath([[bx + bw / 2, top - 20], [bx + bw / 2 + Math.cos(-2 + Math.sin(lt * 5)) * 26, top - 20 + Math.sin(-2 + Math.sin(lt * 5)) * 26]], { w: 4, seed: sd + 87, t }) + ' ' +
            inkPath([[bx + 20, bot + 30], [bx + bw - 20, bot + 30]], { w: 4, seed: sd + 88, t }) + ' ' + inkPath([[bx + 20, bot + 52], [bx + bw - 20, bot + 52]], { w: 4, seed: sd + 89, t }));
          arm.setAttribute('fill', INK.paperDark);
        } else {
          // pen arm from above + red nib at the trace tip
          const ap = rect(xpen - 9, top - 150, 18, tip[1] - (top - 150) - 18);
          arm.setAttribute('d', inkLoop(ap, { seed: sd + 80, t, amp: 0.8, smooth: false }));
          armR.setAttribute('d', inkPath(ap, { w: 4, seed: sd + 81, t, closed: true, amp: 0.8, smooth: false }) + ' ' +
            inkPath(rect(xpen - 46, top - 190, 92, 46), { w: 5, seed: sd + 82, t, closed: true, amp: 0.8, smooth: false }));
        }
        nib.setAttribute('d', inkLoop([[tip[0] - 12, tip[1] - 22], [tip[0] + 12, tip[1] - 22], [tip[0], tip[1]]], { seed: sd + 83, t, amp: 0.6, smooth: false }));
        return { pulses, baseY, top, bot };
      },
    };
  }

  // ------------------------------------------------------------------ alien doodle (the "little green men" joke)
  function alien(parent, sd) {
    const g = el(parent, 'g');
    const body = inkEl(g), headF = inkEl(g, INK.green, { 'fill-opacity': 0.55 }), headR = inkEl(g), eyes = inkEl(g), shine = inkEl(g, INK.paperLight), ant = inkEl(g), tips = inkEl(g, INK.red);
    return {
      update(t, x, y, s, p) {
        if (p <= 0.01) { g.setAttribute('opacity', 0); return; }
        g.setAttribute('opacity', 1);
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${(s * lerp(0.2, 1, p)).toFixed(3)})`);
        const wv = Math.sin(t * 9) * 26, bob = Math.sin(t * 3) * 4;
        body.setAttribute('d', inkPath([[0, 40 + bob], [0, 150]], { w: 7, seed: sd + 1, t }) + ' ' +
          inkPath([[0, 80], [-60, 60 - wv], [-80, 10 - wv]], { w: 7, seed: sd + 2, t }) + ' ' +
          inkPath([[0, 80], [60, 100], [86, 120]], { w: 7, seed: sd + 3, t }) + ' ' +
          inkPath([[0, 150], [-34, 214]], { w: 7, seed: sd + 4, t }) + ' ' + inkPath([[0, 150], [34, 214]], { w: 7, seed: sd + 5, t }));
        const hp = ell(0, bob - 20, 82, 64, 16);
        headF.setAttribute('d', inkLoop(hp, { seed: sd + 6, t }));
        headR.setAttribute('d', inkPath(hp, { w: 6.5, seed: sd + 7, t, closed: true }));
        eyes.setAttribute('d', inkLoop(ell(-30, bob - 26, 22, 28, 10, -0.3), { seed: sd + 8, t, amp: 0.8 }) + ' ' + inkLoop(ell(30, bob - 26, 22, 28, 10, 0.3), { seed: sd + 9, t, amp: 0.8 }) + ' ' +
          inkPath([[-20, bob + 14], [0, bob + 22], [20, bob + 14]], { w: 5, seed: sd + 10, t }));
        shine.setAttribute('d', inkDot(-24, bob - 36, 7, 7, sd + 11, t) + ' ' + inkDot(36, bob - 36, 7, 7, sd + 12, t));
        const sw = Math.sin(t * 5) * 10;
        ant.setAttribute('d', inkPath([[-26, bob - 78], [-44 + sw, bob - 132]], { w: 5, seed: sd + 13, t }) + ' ' + inkPath([[26, bob - 78], [44 - sw, bob - 132]], { w: 5, seed: sd + 14, t }));
        tips.setAttribute('d', inkDot(-44 + sw, bob - 138, 12, 12, sd + 15, t) + ' ' + inkDot(44 - sw, bob - 138, 12, 12, sd + 16, t));
      },
    };
  }

  // ================================================================== lgm_chart
  SH.lgm_chart = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam } = base(ctx, 0);
      const S = Object.assign({ y: 0.33, h: 250, x0: -20, x1: W + 20, pen: 0.78, v: 180 }, P.strip || {});
      const castG = el(cam, 'g');
      const st = strip(cam, sd + 10);
      const al = (P.mode || 'hook') === 'hook' ? alien(cam, sd + 40) : null;
      const brk = inkEl(root, INK.red);
      const BT = Object.assign({ text: '1.33 s', size: 120 }, P.bracket || {});
      const bT = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': BT.size, 'text-anchor': 'middle', fill: INK.red });
      bT.textContent = BT.text;
      const X = extras(ctx, root, castG, sd, { x: 0.82, y: 0.6, scale: 0.8, pose: 'point', face: 'left', dir: 40 });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.4 });
          X.cast.forEach(c => c.update(lt, t, cues, W, H));
          const r = st.update(lt, t, { box: S.box, x0: Math.abs(S.x0) <= 1.5 ? S.x0 * W : S.x0, x1: S.x1 <= 1.5 ? S.x1 * W : S.x1, y: S.y * H, h: S.h, xpen: S.pen * W, v: S.v, period: P.period ?? 1.33, phase: P.phase ?? 0.25 });
          if (al) {
            const A = Object.assign({ x: 0.5, y: 0.17, s: 1 }, P.alien || {}), a = atOr(cues, 'alien', 0.6);
            const p = lt >= a ? spring(lt, a, 0.6) : 0;
            al.update(t, A.x * W, A.y * H + (1 - p) * 120, A.s * (1 + 0.1 * punch(lt, a, 0.5)), p);
          }
          // bracket over the two newest complete pulses
          const b = atOr(cues, 'beat', null);
          const pl = r.pulses.filter(q => q.age > 0.05);
          if (b != null && lt >= b && pl.length >= 2) {
            const q1 = pl[pl.length - 2], q2 = pl[pl.length - 1], yb = r.top - 26, p = prog(lt, b, 0.4), pk = punch(lt, b, 0.5);
            const xa = q1.x, xb = lerp(q1.x, q2.x, p);
            brk.setAttribute('d', inkPath([[xa, yb + 30], [xa, yb], [xb, yb], [xb, yb + 30]], { w: 7, seed: sd + 90, t, smooth: false }));
            const bb = boil(sd + 91, t, 1.2);
            bT.setAttribute('opacity', clamp01(p * 2).toFixed(3));
            bT.setAttribute('transform', `translate(${f1((xa + q2.x) / 2 + bb[0])} ${f1(yb - 34 + bb[1])}) scale(${(lerp(0.6, 1, p) * (1 + 0.12 * pk)).toFixed(3)})`);
          } else { brk.setAttribute('d', ''); bT.setAttribute('opacity', 0); }
          tail(X, lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------------ spiral galaxy
  function galaxy(parent, sd) {
    const arms = inkEl(parent, INK.inkSoft), core = inkEl(parent, INK.gold), coreR = inkEl(parent), dust = inkEl(parent, INK.inkSoft);
    return {
      update(t, x, y, r) {
        let d = '', dd = '';
        for (let a = 0; a < 2; a++) {
          const pts = [];
          for (let k = 0; k <= 14; k++) {
            const u = k / 14, ang = a * Math.PI + u * Math.PI * 2.2 + t * 0.25, rr = r * (0.15 + 0.85 * u);
            pts.push([x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.55]);
          }
          d += inkPath(pts, { w: 7, seed: sd + a, t, taper: 0.6 }) + ' ';
          for (let k = 0; k < 7; k++) {
            const u = (k + 0.5) / 7, ang = a * Math.PI + u * Math.PI * 2.2 + t * 0.25 + 0.25, rr = r * (0.2 + 0.8 * u);
            dd += inkDot(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr * 0.55, 4, 4, sd + 10 + a * 10 + k, t) + ' ';
          }
        }
        arms.setAttribute('d', d); dust.setAttribute('d', dd);
        core.setAttribute('d', inkLoop(ell(x, y, r * 0.2, r * 0.13, 12), { seed: sd + 30, t }));
        coreR.setAttribute('d', inkPath(ell(x, y, r * 0.2, r * 0.13, 12), { w: 4, seed: sd + 31, t, closed: true }));
      },
    };
  }

  // ================================================================== lgm_dish
  SH.lgm_dish = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam, stars } = base(ctx, 16);
      const G = Object.assign({ x: 0.22, y: 0.2, r: 150 }, P.galaxy || {}), D = Object.assign({ x: 0.6, y: 0.42, r: 230 }, P.dish || {});
      const GY = (P.ground ?? 0.6) * H;
      const gal = galaxy(cam, sd + 5);
      const waves = inkEl(cam);
      const legs = inkEl(cam), bowl = inkEl(cam, INK.paperDark), bowlR = inkEl(cam), rim = inkEl(cam, INK.paperLight), rimR = inkEl(cam), ribs = inkEl(cam, INK.inkSoft), struts = inkEl(cam), feed = inkEl(cam, INK.ink), glow = inkEl(cam, INK.gold);
      const hill = inkEl(cam, INK.paperDark), hillR = inkEl(cam), hatch = inkEl(cam, INK.inkSoft);
      const q = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 260, 'text-anchor': 'middle', fill: INK.red }); q.textContent = '?';
      const X = extras(ctx, root, cam, sd, { x: 0.16, y: 0.6, scale: 0.75, pose: 'look', face: 'right' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.4 });
          if (stars) stars.update(t);
          const gx = G.x * W, gy = G.y * H, dx = D.x * W, dy = D.y * H, R = D.r;
          gal.update(t, gx, gy, G.r);
          // dish frame: local "up" points at the galaxy
          const ang = Math.atan2(gy - dy, gx - dx) + Math.PI / 2, c = Math.cos(ang), s = Math.sin(ang);
          const L = ([u, v]) => [dx + u * c - v * s, dy + u * s + v * c];
          const F = L([0, -R * 0.78]);
          // wave fronts from the galaxy to the feed
          let wd = '';
          const ux = F[0] - gx, uy = F[1] - gy, len = Math.hypot(ux, uy), nx = ux / len, ny = uy / len;
          for (let i = 0; i < 6; i++) {
            const u = ((lt * 0.42 + i / 6) % 1), cx = gx + ux * lerp(0.2, 0.98, u), cy = gy + uy * lerp(0.2, 0.98, u), rr = lerp(40, 120, u);
            const arc = [-0.9, -0.45, 0, 0.45, 0.9].map(a => [cx + (-ny * Math.sin(a) - nx * (1 - Math.cos(a)) * 0.6) * rr, cy + (nx * Math.sin(a) - ny * (1 - Math.cos(a)) * 0.6) * rr]);
            wd += inkPath(arc, { w: 5, seed: sd + 40 + i, t, amp: 0.8 }) + ' ';
          }
          waves.setAttribute('d', wd);
          // mount (world space) down to the ground
          const B = L([0, R * 0.42]);
          legs.setAttribute('d', inkPath([B, [dx - 120, GY]], { w: 12, seed: sd + 50, t }) + ' ' + inkPath([B, [dx + 120, GY]], { w: 12, seed: sd + 51, t }) + ' ' +
            inkPath([[dx - 80, GY - 90], [dx + 80, GY - 90]], { w: 7, seed: sd + 52, t }));
          const bowlPts = [];
          for (let k = 0; k <= 12; k++) { const u = -1 + k / 6; bowlPts.push(L([u * R, R * 0.42 * (1 - u * u)])); }
          bowl.setAttribute('d', inkLoop(bowlPts, { seed: sd + 53, t }));
          bowlR.setAttribute('d', inkPath(bowlPts, { w: 6, seed: sd + 54, t }));
          const rimPts = ell(0, 0, R, R * 0.3, 18).map(L);
          rim.setAttribute('d', inkLoop(rimPts, { seed: sd + 55, t }));
          rimR.setAttribute('d', inkPath(rimPts, { w: 6.5, seed: sd + 56, t, closed: true }));
          let rb = '';
          for (let k = 1; k < 4; k++) rb += inkPath(ell(0, 0, R * k / 4, R * 0.3 * k / 4, 14).map(L), { w: 2.5, seed: sd + 60 + k, t, closed: true, amp: 0.8 }) + ' ';
          ribs.setAttribute('d', rb);
          struts.setAttribute('d', inkPath([L([-R * 0.85, R * 0.02]), F], { w: 5, seed: sd + 70, t }) + ' ' + inkPath([L([R * 0.85, R * 0.02]), F], { w: 5, seed: sd + 71, t }) + ' ' + inkPath([L([0, R * 0.3]), F], { w: 5, seed: sd + 72, t }));
          feed.setAttribute('d', inkLoop(ell(F[0], F[1], 20, 20, 8), { seed: sd + 73, t }));
          const ping = Math.max(0, Math.sin(lt * 0.42 * 6 * Math.PI * 2 / 6 * 6)) ** 8;
          glow.setAttribute('d', inkLoop(ell(F[0], F[1], 14 + 22 * ping, 14 + 22 * ping, 10), { seed: sd + 74, t }));
          glow.setAttribute('fill-opacity', (0.3 + 0.6 * ping).toFixed(2));
          // ground hill
          const hp = [[-30, GY + 10], [W * 0.25, GY - 26], [W * 0.6, GY - 6], [W + 30, GY - 30], [W + 30, H * 0.8], [-30, H * 0.8]];
          hill.setAttribute('d', inkLoop(hp, { seed: sd + 80, t, amp: 1.2 }));
          hillR.setAttribute('d', inkPath(hp.slice(0, 4), { w: 6, seed: sd + 81, t }));
          let hd = '';
          for (let j = 0; j < 10; j++) { const x = (j * 157) % W, y = GY + 40 + (j * 53) % 160; hd += inkPath([[x, y], [x + 70, y - 8]], { w: 3.5, seed: sd + 90 + j, t, amp: 0.8 }) + ' '; }
          hatch.setAttribute('d', hd);
          // big red question mark
          const a = atOr(cues, 'ask', null), p = a != null && lt >= a ? spring(lt, a, 0.6) : 0, bq = boil(sd + 99, t, 1.5);
          const Q = Object.assign({ x: 0.82, y: 0.25 }, P.q || {});
          q.setAttribute('opacity', clamp01(p * 3).toFixed(3));
          q.setAttribute('transform', `translate(${f1(Q.x * W + bq[0])} ${f1(Q.y * H + bq[1])}) rotate(${f1(8 + Math.sin(lt * 3) * 4)}) scale(${(lerp(0.3, 1, p) * (1 + 0.12 * punch(lt, a, 0.5))).toFixed(3)})`);
          tail(X, lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== lgm_desk
  SH.lgm_desk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam } = base(ctx, 0);
      const DK = Object.assign({ x: 0.5, y: 0.47, w: 560 }, P.desk || {});
      const GY = (P.ground ?? 0.6) * H;
      const wallR = inkEl(cam, INK.inkSoft), win = inkEl(cam, INK.paperDark), winR = inkEl(cam), winS = inkEl(cam, INK.inkSoft);
      const floor = inkEl(cam), sig = inkEl(cam, INK.red), spark = inkEl(cam, INK.gold);
      const desk = window.CE.desk(cam, sd + 10);
      const pileF = inkEl(cam, INK.paperLight), pileR = inkEl(cam), pileT = inkEl(cam, INK.inkSoft);
      const boxF = inkEl(cam, INK.paperDark), boxR = inkEl(cam), dial = inkEl(cam, INK.paperLight), dialR = inkEl(cam), needle = inkEl(cam, INK.red), lamp = inkEl(cam, INK.gold);
      const castG = el(cam, 'g');
      const X = extras(ctx, root, castG, sd, { x: 0.86, y: 0.6, scale: 0.72, pose: 'point', face: 'left', dir: 20 });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.42, shake: 14 });
          const hit = atOr(cues, 'hit', null), hp = hit != null && lt >= hit ? 1 : 0, pk = punch(lt, hit, 0.6);
          // hut wall: a window with the night sky
          const wx = (P.window?.x ?? 0.12) * W, wy = (P.window?.y ?? 0.17) * H, ww = 250, wh = 210;
          win.setAttribute('d', inkLoop(rect(wx, wy, ww, wh), { seed: sd + 1, t, smooth: false }));
          winR.setAttribute('d', inkPath(rect(wx, wy, ww, wh), { w: 7, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], { w: 5, seed: sd + 3, t }) + ' ' + inkPath([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], { w: 5, seed: sd + 4, t }));
          // night through the glass: diagonal ink hatching, twinkling stars, a crescent moon
          let nh = '';
          for (let k = 1; k < 9; k++) { const u = k / 9; nh += inkPath([[wx + 8, wy + wh * u], [wx + ww * u, wy + 8]], { w: 2.5, seed: sd + 100 + k, t, amp: 0.6 }) + ' '; }
          const tw = k => 5 + 3 * Math.sin(lt * 3 + k * 1.7);
          nh += [[0.2, 0.62], [0.68, 0.22], [0.36, 0.84], [0.84, 0.62], [0.58, 0.8], [0.12, 0.88]].map(([u, v], k) => inkDot(wx + u * ww, wy + v * wh, tw(k), tw(k), sd + 5 + k, t)).join(' ');
          const mx0 = wx + ww * 0.28, my0 = wy + wh * 0.28;
          nh += ' ' + inkLoop([...ell(mx0, my0, 30, 30, 12).slice(3, 10), ...ell(mx0 + 14, my0 - 6, 24, 24, 12).slice(3, 10).reverse()], { seed: sd + 120, t, amp: 0.8 });
          winS.setAttribute('d', nh);
          wallR.setAttribute('d', inkPath([[-20, GY + 2], [W + 20, GY - 4]], { w: 6, seed: sd + 9, t }));
          floor.setAttribute('d', [0.1, 0.35, 0.62, 0.9].map((u, k) => inkPath([[u * W, GY + 40 + k * 9], [u * W + 90, GY + 34 + k * 9]], { w: 3, seed: sd + 12 + k, t, amp: 0.8 })).join(' '));
          // desk + recorder box
          const dx = DK.x * W, dy = DK.y * H, dw = DK.w;
          desk.update(t, dx, dy, dw, GY - dy - 34);
          const jolt = pk * 8;
          const bx = dx - dw * 0.38, by = dy - 170 - jolt, bw = 250, bh = 170;
          boxF.setAttribute('d', inkLoop(rect(bx, by, bw, bh), { seed: sd + 20, t, smooth: false }));
          boxR.setAttribute('d', inkPath(rect(bx, by, bw, bh), { w: 6, seed: sd + 21, t, closed: true, smooth: false }) + ' ' + inkPath(rect(bx + bw - 20, by + 40, 30, 90), { w: 5, seed: sd + 22, t, closed: true, smooth: false }));
          dial.setAttribute('d', inkLoop(ell(bx + 80, by + 70, 46, 46, 12), { seed: sd + 23, t }));
          dialR.setAttribute('d', inkPath(ell(bx + 80, by + 70, 46, 46, 12), { w: 5, seed: sd + 24, t, closed: true }));
          const na = -2.2 + 0.25 * Math.sin(lt * 4.7) + hp * (0.9 + 0.4 * Math.sin(lt * 4.72 * 2));
          needle.setAttribute('d', inkPath([[bx + 80, by + 70], [bx + 80 + Math.cos(na) * 38, by + 70 + Math.sin(na) * 38]], { w: 5, seed: sd + 25, t }));
          lamp.setAttribute('d', inkDot(bx + 180, by + 40, 13, 13, sd + 26, t));
          lamp.setAttribute('fill', hp && Math.sin(lt * 9) > 0 ? INK.red : INK.gold);
          // paper: from the recorder slot across the desk, over the edge, into folds on the floor
          const ex = dx + dw / 2, pw = 120, roll = (lt * 40) % 46;
          const sheet = [[bx + bw, by + bh - 40], [ex, dy - 2], [ex + 18, dy + 30], [ex + 26, GY - 140]];
          let pr = inkPath([[bx + bw - 6, by + bh - 34], [ex, dy - 4]], { w: 5, seed: sd + 30, t }) + ' ' + inkPath([[ex, dy - 4], [ex + 22, dy + 20], [ex + 28, GY - 150]], { w: 5, seed: sd + 31, t });
          let pf = '';
          const folds = 6;
          for (let k = 0; k < folds; k++) {
            const fy = GY - 14 - k * 22, fx = ex + 28 + (k % 2 ? 40 : -10);
            const f = [[fx - pw / 2, fy], [fx + pw / 2, fy - 4], [fx + pw / 2 + 6, fy - 22], [fx - pw / 2 + 4, fy - 20]];
            pf += inkLoop(f, { seed: sd + 40 + k, t, smooth: false }) + ' ';
            pr += inkPath(f, { w: 4, seed: sd + 50 + k, t, closed: true, smooth: false }) + ' ';
          }
          pileF.setAttribute('d', pf + ' ' + inkLoop([[bx + bw, by + bh - 38], [ex, dy - 6], [ex, dy + 4], [bx + bw, by + bh - 26]], { seed: sd + 32, t, smooth: false }) + ' ' + inkLoop([[ex, dy - 4], [ex + 22, dy + 20], [ex + 28, GY - 150], [ex + 28 + 30, GY - 150], [ex + 46, dy + 20], [ex + 24, dy - 4]], { seed: sd + 33, t, smooth: false }));
          pileR.setAttribute('d', pr);
          // tiny trace scribbles crawling along the paper on the desk
          let tr = '';
          for (let k = 0; k < 4; k++) {
            const u = ((k / 4 + lt * 0.18) % 1), px = lerp(bx + bw, ex, u), py = lerp(by + bh - 34, dy - 4, u) + 2;
            tr += inkPath([[px - 18, py], [px - 8, py - 2], [px - 4, py - 14], [px, py + 2], [px + 14, py]], { w: 3, seed: sd + 60 + k, t, smooth: false, amp: 0.6 }) + ' ';
          }
          pileT.setAttribute('d', tr);
          // the signal: a red zig-zag from the window down into the recorder
          if (hit != null && lt >= hit - 0.35) {
            const p = prog(lt, hit - 0.35, 0.35), S0 = [wx + ww * 0.7, wy + wh * 0.6], S1 = [bx + bw * 0.5, by - 4];
            const n = 9, z = [];
            for (let k = 0; k <= n; k++) {
              const u = k / n * p, j = k === 0 || k === n ? 0 : (k % 2 ? 1 : -1) * 22;
              z.push([lerp(S0[0], S1[0], u) + j, lerp(S0[1], S1[1], u)]);
            }
            sig.setAttribute('d', inkPath(z, { w: 9, seed: sd + 70, t, smooth: false }));
            spark.setAttribute('d', lt >= hit ? [0, 1, 2, 3, 4, 5].map(k => { const a = k / 6 * Math.PI * 2 + 0.3, r0 = 20, r1 = 20 + 50 * pk + 16; return inkPath([[S1[0] + Math.cos(a) * r0, S1[1] + Math.sin(a) * r0 * 0.7], [S1[0] + Math.cos(a) * r1, S1[1] + Math.sin(a) * r1 * 0.7]], { w: 7, seed: sd + 71 + k, t }); }).join(' ') : '');
          } else { sig.setAttribute('d', ''); spark.setAttribute('d', ''); }
          X.cast.forEach(c => c.update(lt, t, cues, W, H));
          tail(X, lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== lgm_sky
  SH.lgm_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam } = base(ctx, 0);
      const C = Object.assign({ x: 0.5, y: 0.36, r: 360 }, P.chart || {});
      const disc = inkEl(cam, INK.paperDark), discR = inkEl(cam), grid = inkEl(cam, INK.inkSoft), con = inkEl(cam, INK.inkSoft), dots = inkEl(cam);
      const link = inkEl(cam, INK.red), ringsA = inkEl(cam, INK.gold), ringsB = inkEl(cam, INK.gold), coreA = inkEl(cam, INK.red), coreB = inkEl(cam, INK.red), ringR = inkEl(cam);
      const r0 = rng(sd + 3), field = Array.from({ length: 34 }, () => { const a = r0() * Math.PI * 2, d = Math.sqrt(r0()) * 0.92; return [Math.cos(a) * d, Math.sin(a) * d, 3 + r0() * 5]; });
      const X = extras(ctx, root, cam, sd, { x: 0.5, y: 0.6, scale: 0.72, pose: 'look', face: 'left' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.36 });
          const cx = C.x * W, cy = C.y * H, R = C.r, rot = lt * 0.05;
          const toW = ([u, v]) => [cx + (u * Math.cos(rot) - v * Math.sin(rot)) * R, cy + (u * Math.sin(rot) + v * Math.cos(rot)) * R];
          disc.setAttribute('d', inkLoop(ell(cx, cy, R, R, 24), { seed: sd + 1, t }));
          discR.setAttribute('d', inkPath(ell(cx, cy, R, R, 24), { w: 7, seed: sd + 2, t, closed: true }) + ' ' + inkPath(ell(cx, cy, R + 18, R + 18, 24), { w: 3, seed: sd + 4, t, closed: true }));
          let gd = '';
          for (let k = 1; k < 3; k++) gd += inkPath(ell(cx, cy, R * k / 3, R * k / 3, 18), { w: 2.5, seed: sd + 10 + k, t, closed: true, amp: 0.8 }) + ' ';
          for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI + rot; gd += inkPath([[cx - Math.cos(a) * R, cy - Math.sin(a) * R], [cx + Math.cos(a) * R, cy + Math.sin(a) * R]], { w: 2.5, seed: sd + 20 + k, t, amp: 0.8 }) + ' '; }
          grid.setAttribute('d', gd);
          let dd = '';
          field.forEach(([u, v, s], i) => { const p = toW([u, v]); dd += inkDot(p[0], p[1], s, s, sd + 30 + i, t) + ' '; });
          dots.setAttribute('d', dd);
          const cons = [[0, 1, 2, 3], [5, 6, 7], [9, 10, 11, 12]];
          con.setAttribute('d', cons.map((ix, k) => inkPath(ix.map(i => toW(field[i])), { w: 3, seed: sd + 80 + k, t, smooth: false, amp: 0.8 })).join(' '));
          const A = toW(P.a || [-0.55, 0.15]), Bp = toW(P.b || [0.55, -0.2]);
          const sec = atOr(cues, 'second', null);
          const pulseRings = (Pt, t0, sdd) => {
            let d = '';
            for (let k = 0; k < 3; k++) {
              const u = (((lt - t0) / 1.33 + k / 3) % 1 + 1) % 1, r = 22 + u * 110;
              d += inkPath(ell(Pt[0], Pt[1], r, r, 14), { w: lerp(7, 2, u), seed: sdd + k, t, closed: true, amp: 0.8 }) + ' ';
            }
            return d;
          };
          ringsA.setAttribute('d', pulseRings(A, 0, sd + 100));
          coreA.setAttribute('d', inkDot(A[0], A[1], 18, 18, sd + 110, t));
          const bp = sec != null && lt >= sec ? spring(lt, sec, 0.5) : 0;
          ringsB.setAttribute('d', bp > 0 ? pulseRings(Bp, sec, sd + 120) : '');
          coreB.setAttribute('d', bp > 0 ? inkDot(Bp[0], Bp[1], 18 * bp * (1 + 0.4 * punch(lt, sec, 0.5)), 18 * bp * (1 + 0.4 * punch(lt, sec, 0.5)), sd + 130, t) : '');
          ringR.setAttribute('d', inkPath(ell(A[0], A[1], 18, 18, 10), { w: 4, seed: sd + 140, t, closed: true }) + (bp > 0 ? ' ' + inkPath(ell(Bp[0], Bp[1], 18 * bp, 18 * bp, 10), { w: 4, seed: sd + 141, t, closed: true }) : ''));
          // dashed arc A -> B (drawn after the second source appears)
          if (bp > 0) {
            const lp = prog(lt, sec + 0.15, 0.6), mid = [(A[0] + Bp[0]) / 2, Math.min(A[1], Bp[1]) - R * 0.55];
            const q = u => [(1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * mid[0] + u * u * Bp[0], (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * mid[1] + u * u * Bp[1]];
            let ld = '';
            for (let k = 0; k < 12; k++) { const u0 = k / 12, u1 = u0 + 0.5 / 12; if (u1 > lp) break; ld += inkPath([q(u0), q((u0 + u1) / 2), q(u1)], { w: 5, seed: sd + 150 + k, t, amp: 0.7 }) + ' '; }
            link.setAttribute('d', ld);
          } else link.setAttribute('d', '');
          tail(X, lt, t, cues, W, H);
        },
      };
    },
  };

  // ================================================================== lgm_pulsar
  SH.lgm_pulsar = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, defs } = ctx;
      const { sd, root, cam, stars } = base(ctx, 18);
      const ST = Object.assign({ x: 0.5, y: 0.34, r: 64 }, P.star || {}), E = P.earth === false ? null : Object.assign({ x: 0.84, y: 0.5, r: 62 }, P.earth || {});
      const per = P.period ?? 1.33, BL = P.beam ?? 760;
      const beamA = inkEl(cam, INK.gold, { 'fill-opacity': 0.42 }), beamB = inkEl(cam, INK.gold, { 'fill-opacity': 0.3 }), beamR = inkEl(cam, INK.inkSoft);
      const field = inkEl(cam, INK.inkSoft), axis = inkEl(cam, INK.inkSoft), spin = inkEl(cam, INK.red);
      const star = inkEl(cam, INK.paperLight), starH = inkEl(cam, INK.inkSoft), starR = inkEl(cam);
      const earth = E ? window.TD.earth(cam, defs, sd + 40) : null, flash = inkEl(cam, INK.red);
      const X = extras(ctx, root, cam, sd, { x: 0.16, y: 0.6, scale: 0.75, pose: 'point', face: 'right', dir: 40 });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: ST.y });
          if (stars) stars.update(t);
          const cx = ST.x * W, cy = ST.y * H, r = ST.r * (1 + 0.08 * punch(lt, atOr(cues, 'spin', null), 0.5));
          const th0 = E ? Math.atan2(E.y * H - cy, E.x * W - cx) : 0;
          const th = th0 - 0.5 + (lt / per) * Math.PI * 2;   // beam A sweeps over the Earth once per period
          // beams stop at the line y = beam_top (they never cross the kicker / source note)
          const yTop = (P.beam_top ?? 0.17) * H, lenAt = (b, len) => Math.sin(b) < -0.02 ? Math.min(len, (cy - yTop) / -Math.sin(b)) : len;
          const cone = (a, len, half) => [[cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6], [cx + Math.cos(a - half) * lenAt(a - half, len), cy + Math.sin(a - half) * lenAt(a - half, len)], [cx + Math.cos(a + half) * lenAt(a + half, len), cy + Math.sin(a + half) * lenAt(a + half, len)]];
          const cA = cone(th, BL, 0.14), cB = cone(th + Math.PI, BL, 0.14);
          beamA.setAttribute('d', inkLoop(cA, { seed: sd + 1, t, smooth: false }));
          beamB.setAttribute('d', inkLoop(cB, { seed: sd + 2, t, smooth: false }));
          beamR.setAttribute('d', [cA, cB].map((c, k) => inkPath([c[1], c[0], c[2]], { w: 3.5, seed: sd + 3 + k, t, smooth: false })).join(' '));
          // dipole field loops around the magnetic axis (= beam axis)
          let fd = '';
          [1.9, 2.8, 3.8].forEach((m, k) => {
            [1, -1].forEach((side, j) => {
              const pts = [];
              for (let i = 1; i < 14; i++) { const ph = i / 14 * Math.PI, rr = r * m * Math.sin(ph) ** 2 + r * 0.9, loc = [Math.cos(ph) * rr, side * Math.sin(ph) * rr]; pts.push([cx + loc[0] * Math.cos(th) - loc[1] * Math.sin(th), cy + loc[0] * Math.sin(th) + loc[1] * Math.cos(th)]); }
              fd += inkPath(pts, { w: 3, seed: sd + 10 + k * 2 + j, t, amp: 0.8 }) + ' ';
            });
          });
          field.setAttribute('d', fd);
          axis.setAttribute('d', [0, 1, 2, 3].map(k => inkPath([[cx, cy - r - 30 - k * 46], [cx, cy - r - 52 - k * 46]], { w: 4, seed: sd + 20 + k, t })).join(' '));
          // red spin arrow around the axis top
          const sp = [], ay = cy - r - 120;
          for (let k = 0; k <= 10; k++) { const a = Math.PI * 0.1 + k / 10 * Math.PI * 1.4 + lt * 2; sp.push([cx + Math.cos(a) * 60, ay + Math.sin(a) * 18]); }
          const e = sp[sp.length - 1], e2 = sp[sp.length - 2], an = Math.atan2(e[1] - e2[1], e[0] - e2[0]);
          spin.setAttribute('d', inkPath(sp, { w: 6, seed: sd + 30, t }) + ' ' + inkPath([[e[0] - Math.cos(an - 0.5) * 22, e[1] - Math.sin(an - 0.5) * 22], e, [e[0] - Math.cos(an + 0.5) * 22, e[1] - Math.sin(an + 0.5) * 22]], { w: 6, seed: sd + 31, t, smooth: false }));
          star.setAttribute('d', inkCircle(cx, cy, r, sd + 32, t, { fill: true }));
          let hd = '';
          for (let k = -3; k <= 3; k++) { const yy = cy + k * r * 0.26, hw = Math.sqrt(Math.max(0, r * r * 0.8 - (k * r * 0.26) ** 2)); hd += inkPath([[cx - hw, yy + 6], [cx + hw, yy - 6]], { w: 3, seed: sd + 40 + k, t, amp: 0.7 }) + ' '; }
          starH.setAttribute('d', hd);
          starR.setAttribute('d', inkCircle(cx, cy, r, sd + 50, t, { w: 7 }));
          if (earth) {
            const ex = E.x * W, ey = E.y * H;
            earth.update(t, ex, ey, E.r);
            const ph = (((lt / per) % 1) + 1) % 1, fl = Math.max(0, 1 - Math.min(Math.abs(ph - 0.5 / (Math.PI * 2)), Math.abs(ph - 1 - 0.5 / (Math.PI * 2))) * 9);
            flash.setAttribute('d', fl > 0.05 ? [0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k / 8 * Math.PI * 2, r0 = E.r + 14, r1 = E.r + 14 + 40 * fl; return inkPath([[ex + Math.cos(a) * r0, ey + Math.sin(a) * r0], [ex + Math.cos(a) * r1, ey + Math.sin(a) * r1]], { w: 6, seed: sd + 60 + k, t }); }).join(' ') : '');
          }
          tail(X, lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------------ medal on a ribbon
  function medal(parent, sd, text) {
    const g = el(parent, 'g');
    const rib = inkEl(g, INK.red), ribR = inkEl(g), disc = inkEl(g, INK.gold), discR = inkEl(g), inner = inkEl(g, INK.hatBand), prof = inkEl(g, INK.hatBand, { 'fill-opacity': 0.55 }), shine = inkEl(g, INK.paperLight);
    const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 52, 'text-anchor': 'middle', fill: INK.ink }); tx.textContent = text || '';
    return {
      update(t, x, y, r, rot = 0, ribbon = true, rl = 2.1) {
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`);
        const rp = [[-r * 0.55, -r * rl], [-r * 0.15, -r * rl], [r * 0.12, -r * 0.9], [-r * 0.12, -r * 0.9]], rp2 = [[r * 0.55, -r * rl], [r * 0.15, -r * rl], [-r * 0.12, -r * 0.9], [r * 0.12, -r * 0.9]];
        rib.setAttribute('d', ribbon ? inkLoop(rp, { seed: sd + 1, t, smooth: false }) + ' ' + inkLoop(rp2, { seed: sd + 2, t, smooth: false }) : '');
        ribR.setAttribute('d', ribbon ? inkPath(rp, { w: 4, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath(rp2, { w: 4, seed: sd + 4, t, closed: true, smooth: false }) : '');
        disc.setAttribute('d', inkCircle(0, 0, r, sd + 5, t, { fill: true }));
        discR.setAttribute('d', inkCircle(0, 0, r, sd + 6, t, { w: 7 }));
        inner.setAttribute('d', inkCircle(0, 0, r * 0.78, sd + 7, t, { w: 3.5 }));
        // a simple head-in-profile relief
        const hp = [[-r * 0.25, r * 0.3], [-r * 0.32, -r * 0.05], [-r * 0.2, -r * 0.4], [r * 0.08, -r * 0.48], [r * 0.28, -r * 0.3], [r * 0.3, -r * 0.12], [r * 0.4, -r * 0.02], [r * 0.28, r * 0.06], [r * 0.24, r * 0.2], [r * 0.08, r * 0.3]];
        prof.setAttribute('d', inkLoop(hp, { seed: sd + 8, t, amp: 1 }));
        shine.setAttribute('d', inkLoop(ell(-r * 0.5, -r * 0.5, r * 0.12, r * 0.06, 8, -0.8), { seed: sd + 9, t, amp: 0.6 }));
        tx.setAttribute('x', 0); tx.setAttribute('y', f1(r * 0.62));
        tx.setAttribute('font-size', f1(Math.max(44, r * 0.36)));
      },
    };
  }

  // ================================================================== lgm_medal
  SH.lgm_medal = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam } = base(ctx, 0);
      const M = Object.assign({ x: 0.5, y: 0.24, r: 120, text: '1974', to: 1 }, P.medal || {});
      const GY = (P.ground ?? 0.6) * H;
      const stageF = inkEl(cam, INK.paperDark), stageR = inkEl(cam), rays = inkEl(cam, INK.gold);
      const castG = el(cam, 'g');
      const md = medal(cam, sd + 30, M.text);
      const X = extras(ctx, root, castG, sd, { x: 0.86, y: 0.6, scale: 0.7, pose: 'shrug', face: 'left' });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.4 });
          const sp = [[W * 0.32, GY], [W * 0.68, GY], [W * 0.66, GY - 50], [W * 0.34, GY - 50]];
          stageF.setAttribute('d', inkLoop(sp, { seed: sd + 1, t, smooth: false }));
          stageR.setAttribute('d', inkPath(sp, { w: 6, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[-20, GY + 2], [W + 20, GY - 3]], { w: 6, seed: sd + 3, t }));
          const outs = X.cast.map(c => c.update(lt, t, cues, W, H));
          const give = atOr(cues, 'give', null), tgt = outs[M.to];
          // at "give" the medal flies onto the chest of cast[M.to] (ribbon round the neck)
          const p = give != null && tgt ? progIO(lt, give - 0.1, 0.5) : 0;
          const body = tgt ? tgt.y - tgt.head[1] : 1;
          const hx = tgt ? tgt.head[0] : M.x * W, hy = tgt ? tgt.head[1] + body * 0.42 : M.y * H;
          const sw = Math.sin(lt * 2.6) * 8;
          const mx = lerp(M.x * W, hx, p), my = lerp(M.y * H + Math.sin(lt * 2) * 10, hy, p) - Math.sin(p * Math.PI) * 120;
          const rr = M.r * lerp(1, 0.42, p) * (1 + 0.12 * punch(lt, atOr(cues, 'nobel', null), 0.5) + 0.15 * punch(lt, give != null ? give + 0.4 : null, 0.5));
          const rlW = tgt ? (hy - (tgt.head[1] + body * 0.1)) / (M.r * 0.42) : 2.1;
          md.update(t, mx, my, rr, sw * (1 - p), true, lerp(2.1, Math.max(1, rlW), p));
          // gold glints around the medal
          let rd = '';
          for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + lt * 0.8, r0 = rr * 1.25, r1 = rr * (1.45 + 0.12 * Math.sin(lt * 5 + k)); rd += inkPath([[mx + Math.cos(a) * r0, my + Math.sin(a) * r0], [mx + Math.cos(a) * r1, my + Math.sin(a) * r1]], { w: 6, seed: sd + 40 + k, t }) + ' '; }
          rays.setAttribute('d', rd);
          tail(X, lt, t, cues, W, H);
        },
      };
    },
  };

  // ------------------------------------------------------------------ banknote
  function notes(parent, sd) {
    const f = inkEl(parent, INK.green, { 'fill-opacity': 0.5 }), r_ = inkEl(parent), mk = inkEl(parent, INK.ink);
    return {
      // list: [{x, y, rot, s}]
      update(t, list) {
        let a = '', b = '', c = '';
        list.forEach((n, i) => {
          const cs = Math.cos(n.rot), sn = Math.sin(n.rot), w = 92 * n.s, h = 48 * n.s;
          const P = ([u, v]) => [n.x + u * cs - v * sn, n.y + u * sn + v * cs];
          const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(P);
          a += inkLoop(pts, { seed: sd + i * 3, t, smooth: false, amp: 0.8 }) + ' ';
          b += inkPath(pts, { w: 3.5, seed: sd + i * 3 + 1, t, closed: true, smooth: false, amp: 0.8 }) + ' ';
          c += inkPath(ell(0, 0, h * 0.28, h * 0.28, 8).map(P), { w: 3, seed: sd + i * 3 + 2, t, closed: true, amp: 0.5 }) + ' ';
        });
        f.setAttribute('d', a); r_.setAttribute('d', b); mk.setAttribute('d', c);
      },
    };
  }

  // ================================================================== lgm_prize
  SH.lgm_prize = {
    kind: '2d',
    build(ctx) {
      const { P, W, H } = ctx;
      const { sd, root, cam } = base(ctx, 0);
      const CT = Object.assign({ x: 0.5, y: 0.26, size: 130, value: 3000000 }, P.counter || {});
      const give = (P.mode || 'win') === 'give';
      const GY = (P.ground ?? 0.6) * H;
      const floor = inkEl(cam);
      const castG = el(cam, 'g');
      const nt = notes(cam, sd + 50);
      const num = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': CT.size, 'text-anchor': 'middle', fill: INK.ink });
      const und = inkEl(root, INK.gold);
      const X = extras(ctx, root, castG, sd, { x: 0.86, y: 0.6, scale: 0.7, pose: 'shock', face: 'left' });
      const r0 = rng(sd + 9), seeds = Array.from({ length: 16 }, () => [r0(), r0(), r0(), r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          camT(cam, lt, dur, cues, W, H, P, { fy: 0.4 });
          floor.setAttribute('d', inkPath([[-20, GY + 2], [W + 20, GY - 3]], { w: 6, seed: sd + 1, t }));
          const outs = X.cast.map(c => c.update(lt, t, cues, W, H));
          let v, list = [];
          if (!give) {
            const c = atOr(cues, 'count', 0.3), p = lt >= c ? prog(lt, c, 1.1) : 0;
            v = CT.value * p;
            if (p > 0) seeds.forEach(([a, b, cc, d], i) => {
              const y0 = CT.y * H + 70, fall = (lt - c) * (260 + 160 * b) + a * 900, y = y0 + (fall % (GY - 30 - y0)), x = (0.08 + 0.84 * cc) * W + Math.sin(lt * 2 + d * 6) * 30;
              list.push({ x, y, rot: Math.sin(lt * 3 + i) * 0.6 + d, s: 0.9 });
            });
          } else {
            const g0 = atOr(cues, 'give', 0.3), D = P.dur ?? 1.4, src = outs[0], dst = outs.slice(1);
            const p = lt >= g0 ? clamp01((lt - g0) / D) : 0;
            v = CT.value * (1 - p);
            if (src && dst.length) seeds.forEach(([a, b, cc, d], i) => {
              const s0 = g0 + (i / seeds.length) * D, u = clamp01((lt - s0) / 0.55);
              const to = dst[i % dst.length], A = src.hand, B = to.hand;
              if (u <= 0) { if (i < 4) list.push({ x: A[0] + (i - 1.5) * 16, y: A[1] - 10 - i * 6, rot: -0.3 + i * 0.2, s: 0.85 }); return; }
              if (u >= 1) { list.push({ x: B[0] + (a - 0.5) * 30, y: B[1] - 8 - Math.floor(i / dst.length) * 10, rot: d - 0.5, s: 0.7 }); return; }
              list.push({ x: lerp(A[0], B[0], u), y: lerp(A[1], B[1], u) - Math.sin(u * Math.PI) * (160 + 80 * b), rot: u * 6 + d, s: 0.85 });
            });
          }
          nt.update(t, list);
          const b = boil(sd + 5, t, 1.2), pk = punch(lt, atOr(cues, give ? 'give' : 'count', null), 0.5);
          num.textContent = '$' + Math.round(v).toLocaleString('en-US');
          num.setAttribute('fill', give && v < 1 ? INK.red : INK.ink);
          num.setAttribute('transform', `translate(${f1(CT.x * W + b[0])} ${f1(CT.y * H + b[1])}) scale(${(1 + 0.08 * pk).toFixed(3)})`);
          und.setAttribute('d', inkPath([[CT.x * W - 330, CT.y * H + 34], [CT.x * W + 330, CT.y * H + 26]], { w: 12, seed: sd + 6, t }));
          tail(X, lt, t, cues, W, H);
        },
      };
    },
  };
})();
