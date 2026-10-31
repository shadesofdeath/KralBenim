// ch_herschel: shots for the Caroline Herschel Short (Stickstory 2026-10-31): the girl her family raised to keep house
// swept the night sky with a small telescope, found a comet on 1 August 1786 while her brother William was away, found
// eight in all, and King George III paid her a salary (1787): the first woman paid as an astronomer.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any 18th/19th-century stargazing story.
// Uses td__lib.js (TD.label, TD.stars) at build time.
//
// K (figure) = {x, y (ground 0..1 H), scale, pose, face: "left"|"right", dir, emotion, seq: [{at, pose, dir, face,
//   emotion}], accessory ("crown" ...), dress: "blue"|"soft"|"red"|"stain" (period woman: bodice, long skirt, apron,
//   frilled mob cap), apron: true, cap: true, kneel: 150 (rig units: the figure sinks to its knees, legs clipped at
//   the floor, the skirt pools on the floor), walk: {from: x0, at, dur} (walks in to x), wob: {amp: 10, f: 0.7}
//   (dir sways: scrubbing, sweeping)}. The narrator (fez) is params.kasif (same spec, no dress).
// L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
// Lines      = [{words: [...], at: [cue...], y, size}] + highlight (giant Fraunces words, highlight in a red box)
//
// SHOTS.ch_garden — a night lawn (set "night"): a small Newtonian "comet sweeper" on a wooden tripod, an observer at
//   its side eyepiece; a comet in the sky (grows in on cue), optional broom in her back hand, a lantern, grass tufts,
//   a hedge to the frame bottom; the tube can sweep slowly across the sky (dashed sweep arc).
//   P: {ground: 0.6, carol: K, scope: {ang: 62, sweep: 0 (deg amplitude), len: 440, r: 46, dx, dy (eyepiece offset from
//       her eye)}, broom: false | {sweep, size, x (stands on its own, leaning, instead of in her hand)},
//       comet: {x, y, len, ang, r, at, grow} | false, more: {n: 7, at, dur, pts: [[x, y]...]} (small comets pop in),
//       arc: {at, r} | false, lantern: 0.86 | false, stool: false (stool with an open logbook, left foreground), hedge: 1690, kasif: K, labels, lines, highlight}
// SHOTS.ch_kitchen — a German house kitchen (set "interior"): hearth with a pot over a small fire, hanging pans, a
//   doorframe with height marks; on cue "mark" a red line is drawn at the girl's head ("4 FT 3"); washtub, bucket,
//   laundry basket in front. P: {ground: 0.6, carol: K, mother: K, chart: {x: 0.84, at, text} | false, labels}
// SHOTS.ch_study — a Georgian room at night (set "interior"): a tall sash window full of stars with a big telescope
//   standing at it, a man polishing a metal telescope mirror on a post (wob = rubbing), a girl bringing a candle tray,
//   and a table in front with a rolled star chart, a spare mirror and a candle.
//   P: {ground: 0.6, will: K, carol: K, post: 0.47, scope: {E: [0.86, 0.44], s: -1, ang, len, r} | false, tray: true, labels}
// SHOTS.ch_eyepiece — the view through the eyepiece: a round brass-rimmed window of night sky with stars, a fuzzy dot
//   that drifts away from its first place (ghost ring + arrow on cue "moved"), and her notebook page below, where a
//   comet sketch is drawn. P: {cx: 0.5, cy: 0.37, r: 430, dot: {from: [-0.25, 0.1], to: [0.12, -0.05]}, at, labels}
// SHOTS.ch_logbook — top-down desk: her open observation book, eight comet sketches pop in one by one (cue "cnt"),
//   a big red counter, candle, inkpot and quill, a rolled star chart. P: {n: 8, at, dur, counter: {x, y, size},
//   labels}
// SHOTS.ch_court — Windsor (set "hills"): the castle on the far hill, the king (crown) holds out a sealed scroll, it
//   passes to the woman on cue "give"; hedge and gravel path in front. P: {ground: 0.6, castleX: 640, king: K, carol: K, give: cue,
//   labels}
// cues: hit (punch), comet.at, arc.at, mark, moved, cnt, give, labels / seq / words "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const FR = 'Fraunces, Georgia, serif';
  const TAU = Math.PI * 2;
  const ell = (cx, cy, rx, ry, n = 14, rot = 0) => Array.from({ length: n }, (_, i) => { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
  const fill = (e, pts, sd, t, amp = 1, smooth = true) => e.setAttribute('d', inkLoop(pts, { seed: sd, t, amp, smooth }));
  const ringS = (pts, sd, t, w = 5, amp = 1, smooth = true) => inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth });
  const lineS = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const loopS = (pts, sd, t, amp = 1, smooth = true) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25);
  const SKY = () => mix(INK.ink, INK.blue, 0.32);
  const DRESS = { blue: () => mix(INK.blue, INK.paperLight, 0.3), soft: () => mix(INK.inkSoft, INK.paperLight, 0.25), red: () => mix(INK.red, INK.paperLight, 0.25), stain: () => mix(INK.stain, INK.paperDark, 0.1) };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;

  // ------------------------------------------------------------------ a figure (narrator or period person, optional dress)
  function person(parent, K, sd, narrator) {
    if (!K) return null;
    const g = el(parent, 'g'), sc = K.scale ?? 1;
    let clipR = null, rg = el(g, 'g');
    if (K.kneel) {
      const id = 'chk' + sd + '_' + Math.floor(hn(sd, 9) * 1e6);
      const cp = el(g, 'clipPath', { id }); clipR = el(cp, 'rect', { x: -5000, y: -5000, width: 10000, height: 5000 });
      rg.setAttribute('clip-path', `url(#${id})`);
    }
    const rig = KASIF.create(rg, { scale: sc, hat: !!narrator, accessory: narrator ? null : (K.accessory || null), seed: sd });
    const dz = K.dress && !narrator ? el(g, 'g') : null;
    const D = dz ? {
      skirt: inkEl(dz, (DRESS[K.dress] || DRESS.blue)()), apron: inkEl(dz, INK.paperLight), bod: inkEl(dz, (DRESS[K.dress] || DRESS.blue)()),
      fold: inkEl(dz, INK.inkSoft), r: inkEl(dz), cap: inkEl(dz, INK.paperLight), capR: inkEl(dz), hair: inkEl(dz, mix(INK.inkSoft, INK.ink, 0.4)),
    } : null;
    return {
      K,
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        let x = (K.x ?? 0.5) * W, pose = s.pose || 'idle', ph = 0;
        const gy0 = (K.y ?? 0.6) * H, kn = (K.kneel || 0) * sc, y = gy0 + kn, face = faceOf(s.face ?? K.face, 1);
        if (clipR) clipR.setAttribute('height', f1(gy0 + 5000 + 6));
        if (K.walk) {
          const wa = atOr(cues, K.walk.at, 0), wd = K.walk.dur ?? 1.2, x0 = K.walk.from * W;
          if (lt < wa + wd) {
            const u = lt < wa ? 0 : lin(lt, wa, wd); x = lerp(x0, x, u);
            if (lt >= wa) { pose = 'walk'; ph = Math.abs(x - x0) / sc / KASIF.gait('walk'); }
          }
        }
        let dir = dirOf(s.dir ?? K.dir);
        if (K.wob) dir += (K.wob.amp ?? 10) * Math.sin(t * TAU * (K.wob.f ?? 0.7));
        const o = { x, y, face, since: pose === 'walk' ? lt : since, dir, ph, emotion: s.emotion || (pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
        if (pv && since < 0.32 && pose !== 'walk') { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, pose, o);
        const hw = r.hands[1], hl = r.hands[0];
        const head = [x + face * sc * r.head[0], y + sc * r.head[1]];
        if (D) {
          const k = sd * 7, wy = y - 205 * sc, hy = kn ? gy0 - 4 : y - 34 * sc, sw = pose === 'walk' ? Math.sin(ph * TAU) * 10 * sc : Math.sin(t * 1.3 + sd) * 3 * sc;
          const fw = kn ? 1.35 : 1;
          const sk = [[x - 30 * sc, wy], [x + 30 * sc, wy], [x + 96 * sc * fw + sw, hy], [x + 48 * sc * fw + sw, hy + 9 * sc], [x + sw * 0.5, hy + 4 * sc], [x - 48 * sc * fw + sw, hy + 9 * sc], [x - 96 * sc * fw + sw, hy]];
          fill(D.skirt, sk, k + 1, t, 0.6);
          const bd = [[x - 21 * sc, y - 322 * sc], [x + 21 * sc, y - 322 * sc], [x + 31 * sc, wy + 6 * sc], [x - 31 * sc, wy + 6 * sc]];
          fill(D.bod, bd, k + 2, t, 0.5, false);
          const R = [ringS(sk, k + 3, t, 5, 0.6), ringS(bd, k + 4, t, 4, 0.5, false)];
          if (K.apron !== false) {
            const ax = x + face * 14 * sc, ap = [[ax - 24 * sc, wy + 10 * sc], [ax + 24 * sc, wy + 10 * sc], [ax + 56 * sc + sw * 0.8, hy - 16 * sc], [ax - 44 * sc + sw * 0.8, hy - 12 * sc]];
            fill(D.apron, ap, k + 5, t, 0.5, false);
            R.push(ringS(ap, k + 6, t, 3.5, 0.5, false), lineS([[x - 30 * sc, wy + 8 * sc], [x + 30 * sc, wy + 6 * sc]], k + 7, t, 4, 0.5));
          } else D.apron.setAttribute('d', '');
          D.fold.setAttribute('d', [-1, 1].map((q, j) => lineS([[x + q * 22 * sc, wy + 40 * sc], [x + q * 55 * sc + sw * 0.7, hy - 20 * sc]], k + 8 + j, t, 2.5, 0.6)).join(' '));
          D.r.setAttribute('d', R.join(' '));
          if (K.cap !== false) {
            const hr = 72 * sc, cx = head[0] - face * 8 * sc, cy = head[1] - hr * 0.5;
            const cp = []; for (let q = 0; q <= 12; q++) { const a = Math.PI + q / 12 * Math.PI; cp.push([cx + Math.cos(a) * hr * 1.08, cy + Math.sin(a) * hr * 0.72]); }
            for (let q = 0; q <= 8; q++) { const u = q / 8; cp.push([lerp(cx + hr * 1.08, cx - hr * 1.08, u), cy + hr * 0.12 + (q % 2 ? hr * 0.12 : 0)]); }
            fill(D.cap, cp, k + 10, t, 0.6, false);
            D.capR.setAttribute('d', ringS(cp, k + 11, t, 4, 0.6, false) + ' ' + lineS([[cx - hr * 0.9, cy - hr * 0.05], [cx + hr * 0.9, cy - hr * 0.08]], k + 12, t, 3, 0.5));
            const bx = head[0] - face * hr * 0.95, by = head[1] - hr * 0.05;
            D.hair.setAttribute('d', loopS(ell(bx, by, hr * 0.26, hr * 0.22, 9), k + 13, t, 0.5));
          }
        }
        return { x, y, face, hand: [x + face * sc * hw[0], y + sc * hw[1]], hand2: [x + face * sc * hl[0], y + sc * hl[1]], head };
      },
    };
  }

  // ------------------------------------------------------------------ Newtonian telescope on a wooden tripod
  //   update(t, o): o = {E: [x, y] eyepiece (world), s: 1 (observer on the left, tube leans over them to the upper left),
  //   ang: 62, len: 440, r: 46, gy (ground y)} -> {mouth: [x, y], u: [ux, uy]}
  function scope(parent, sd) {
    const g = el(parent, 'g');
    const legs = inkEl(g, WOOD()), legR = inkEl(g), tube = inkEl(g, INK.paperLight), shade = inkEl(g, INK.paperDark), bands = inkEl(g, INK.gold), mouth = inkEl(g, mix(INK.ink, INK.blue, 0.2)), eye = inkEl(g, INK.inkSoft), r_ = inkEl(g);
    return {
      update(t, o) {
        const k = sd * 9, s = o.s ?? 1, a = (o.ang ?? 62) * Math.PI / 180, L = o.len ?? 440, R = o.r ?? 46, E = o.E;
        const u = [-s * Math.cos(a), -Math.sin(a)], n = [s * Math.sin(a), -Math.cos(a)];
        const A = [E[0] + n[0] * (R + 20), E[1] + n[1] * (R + 20)], M = [A[0] + u[0] * 64, A[1] + u[1] * 64], B = [M[0] - u[0] * L, M[1] - u[1] * L];
        const P = (p, q, d) => [p[0] + n[0] * d + u[0] * q, p[1] + n[1] * d + u[1] * q];
        const tp = [P(M, 0, R), P(M, 0, -R), P(B, 0, -R * 0.94), P(B, 0, R * 0.94)];
        // tripod: pivot 40 % up from the back end
        const pv = [B[0] + u[0] * L * 0.4, B[1] + u[1] * L * 0.4], gy = o.gy;
        const LG = [[pv, [pv[0] - s * 120, gy]], [pv, [pv[0] + s * 30, gy + 8]], [pv, [pv[0] + s * 170, gy - 4]]];
        legs.setAttribute('d', LG.map((l, i) => lineS(l, k + 1 + i, t, 16, 0.6)).join(' '));
        legR.setAttribute('d', LG.map((l, i) => lineS(l, k + 5 + i, t, 4, 0.6)).join(' ') + ' ' + loopS(ell(pv[0], pv[1], 18, 18, 8), k + 9, t, 0.5));
        fill(tube, tp, k + 10, t, 0.6, false);
        fill(shade, [P(M, 0, R * 0.3), P(M, 0, R), P(B, 0, R * 0.94), P(B, 0, R * 0.3)], k + 11, t, 0.5, false);
        const BD = [0.12, 0.5, 0.88].map((q, i) => { const c = [lerp(M[0], B[0], q), lerp(M[1], B[1], q)]; return loopS([P(c, -9, R + 4), P(c, -9, -R - 4), P(c, 9, -R - 4), P(c, 9, R + 4)], k + 12 + i, t, 0.5, false); });
        bands.setAttribute('d', BD.join(' '));
        mouth.setAttribute('d', loopS(ell(M[0], M[1], R * 0.98, R * 0.32, 12, Math.atan2(n[1], n[0])), k + 16, t, 0.5));
        const ep = [P(A, -8, -R), P(A, 8, -R), [E[0] + u[0] * 9, E[1] + u[1] * 9], [E[0] - u[0] * 9, E[1] - u[1] * 9]];
        fill(eye, ep, k + 17, t, 0.4, false);
        r_.setAttribute('d', [ringS(tp, k + 18, t, 6, 0.6, false), ringS(ep, k + 19, t, 4, 0.4, false), ringS(ell(M[0], M[1], R * 0.98, R * 0.32, 12, Math.atan2(n[1], n[0])), k + 20, t, 4, 0.5)].join(' '));
        return { mouth: M, u };
      },
    };
  }

  // ------------------------------------------------------------------ a comet: glow, head and a curved tail
  function comet(parent, sd) {
    const g = el(parent, 'g'), glow = inkEl(g, INK.gold, { 'fill-opacity': 0.22 }), tail = inkEl(g, INK.gold, { 'fill-opacity': 0.6 }), tail2 = inkEl(g, mix(INK.gold, INK.paperLight, 0.5), { 'fill-opacity': 0.75 }), streak = inkEl(g, INK.paperLight), head = inkEl(g, mix(INK.gold, INK.paperLight, 0.6)), r_ = inkEl(g, INK.ink);
    return {
      update(t, o) {
        const k = sd * 5, p = clamp01(o.p ?? 1), x = o.x, y = o.y, R = (o.r ?? 26) * (0.3 + 0.7 * p), Lt = (o.len ?? 420) * p, a = (o.ang ?? -25) * Math.PI / 180;
        if (p <= 0.001) { [glow, tail, tail2, streak, head, r_].forEach(e => e.setAttribute('d', '')); return; }
        const ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux, sh = Math.sin(t * 2.2 + sd) * 0.06;
        const wedge = (wk, lk, bend) => { const P = []; for (let i = 0; i <= 10; i++) { const q = i / 10, d = q * Lt * lk, w = R * (0.9 + q * wk), b = bend * q * q * Lt * 0.12; P.push([x + ux * d + nx * (w + b), y + uy * d + ny * (w + b)]); } for (let i = 10; i >= 0; i--) { const q = i / 10, d = q * Lt * lk, w = R * (0.9 + q * wk), b = bend * q * q * Lt * 0.12; P.push([x + ux * d - nx * (w - b), y + uy * d - ny * (w - b)]); } return P; };
        fill(tail, wedge(3.2 + sh * 10, 1, 1), k + 1, t, 1.2);
        fill(tail2, wedge(1.2, 0.7, 0.6), k + 2, t, 1);
        streak.setAttribute('d', [-0.5, 0, 0.55].map((q, i) => lineS([[x + nx * R * q, y + ny * R * q], [x + ux * Lt * (0.55 + 0.1 * i) + nx * R * q * 2.4, y + uy * Lt * (0.55 + 0.1 * i) + ny * R * q * 2.4]], k + 3 + i, t, 3, 0.8)).join(' '));
        const pu = 1 + 0.08 * Math.sin(t * 3.1 + sd);
        glow.setAttribute('d', loopS(ell(x, y, R * 3.2 * pu, R * 3.2 * pu, 14), k + 7, t, 1));
        head.setAttribute('d', loopS(ell(x, y, R, R, 12), k + 8, t, 0.6));
        r_.setAttribute('d', ringS(ell(x, y, R, R, 12), k + 9, t, 3, 0.6));
      },
    };
  }

  // ------------------------------------------------------------------ giant words (Fraunces 900, highlight in a red box)
  function words(parent, P, W, H, sd) {
    const out = [];
    (P.lines || []).forEach((Ln, li) => {
      const size = Ln.size || 130, y = (Ln.y ?? 0.17 + li * 0.09) * H;
      const ts = Ln.words.map(w => { const g = el(parent, 'g'); const box = inkEl(g, INK.red), boxR = inkEl(g); const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` }); tx.textContent = w; return { g, box, boxR, tx, w, hl: w === P.highlight }; });
      const ws = ts.map(o => { let w = 0; try { w = o.tx.getComputedTextLength(); } catch (e) { w = 0; } return w || o.w.length * size * 0.6; });
      const gap = size * 0.32, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1), sc = Math.min(1, (W - 120) / tot);
      let x = W / 2 - tot * sc / 2;
      ts.forEach((o, i) => { o.x = x + ws[i] * sc / 2; o.y = y; o.ww = ws[i]; o.size = size; o.sc = sc; o.at = (Ln.at || [])[i]; o.k = li * 10 + i; x += (ws[i] + gap) * sc; out.push(o); });
    });
    return {
      update(lt, t, cues) {
        out.forEach(o => {
          const a = atOr(cues, o.at, 0.1 + o.k * 0.2), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5), b = boil(sd + 50 + o.k, t, 1.2);
          o.g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
          o.g.setAttribute('transform', `translate(${f1(o.x + b[0])} ${f1(o.y + b[1])}) rotate(${f1((o.hl ? -3 : 0) + (1 - p) * -6)}) scale(${(o.sc * lerp(0.4, 1, p) * (1 + 0.08 * pk)).toFixed(3)})`);
          o.tx.setAttribute('y', f1(o.size * 0.35));
          if (o.hl) {
            o.tx.setAttribute('fill', INK.paperLight); o.tx.setAttribute('style', '');
            const bw = o.ww + 50, bh = o.size * 1.25, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
            o.box.setAttribute('d', inkLoop(pts, { seed: sd + 60 + o.k, t, smooth: false })); o.boxR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 70 + o.k, t, closed: true, smooth: false }));
          }
        });
      },
    };
  }

  // ------------------------------------------------------------------ small props
  function flame(parent, sd) {
    const glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.25 }), f = inkEl(parent, INK.gold), c = inkEl(parent, mix(INK.gold, INK.paperLight, 0.6)), r_ = inkEl(parent, INK.red);
    return {
      update(t, x, y, s = 1, glowR = 120) {
        const k = sd * 3, fl = 1 + 0.12 * Math.sin(t * 9 + sd) + 0.06 * Math.sin(t * 15), sw = Math.sin(t * 6 + sd) * 4 * s;
        const sh = q => [[x - 12 * s * q, y], [x - 9 * s * q + sw * 0.4, y - 22 * s * q * fl], [x + sw, y - 44 * s * q * fl], [x + 9 * s * q + sw * 0.4, y - 22 * s * q * fl], [x + 12 * s * q, y]];
        glow.setAttribute('d', loopS(ell(x, y - 20 * s, glowR * s * (0.95 + 0.05 * fl), glowR * s * (0.95 + 0.05 * fl), 14), k + 1, t, 1));
        f.setAttribute('d', loopS(sh(1), k + 2, t, 0.6)); c.setAttribute('d', loopS(sh(0.5), k + 3, t, 0.4));
        r_.setAttribute('d', ringS(sh(1), k + 4, t, 2.5, 0.6));
      },
    };
  }
  function tufts(parent, sd, W, y0, y1, n, col) {
    const e = inkEl(parent, col || INK.inkSoft), r = rng(sd * 13 + 5), L = [];
    for (let i = 0; i < n; i++) L.push({ x: r() * W, y: lerp(y0, y1, Math.pow(r(), 0.7)), k: r() });
    return {
      update(t) {
        const D = [];
        L.forEach((q, i) => { const s = 0.5 + 0.9 * (q.y - y0) / Math.max(1, y1 - y0), sw = Math.sin(t * 1.4 + i) * 4 * s; [-1, 0, 1].forEach((j, m) => D.push(lineS([[q.x + j * 10 * s, q.y], [q.x + j * 22 * s + sw, q.y - (34 + 14 * q.k) * s * (m === 1 ? 1.3 : 1)]], sd + i * 3 + m, t, 3.5 * s, 0.5))); });
        e.setAttribute('d', D.join(' '));
      },
    };
  }
  function hedge(parent, sd, W, H, y0) {
    const f = inkEl(parent, mix(INK.green, INK.ink, 0.45)), f2 = inkEl(parent, mix(INK.green, INK.ink, 0.25)), r_ = inkEl(parent);
    return {
      update(t) {
        const k = sd * 7, top = [], top2 = [];
        for (let i = 0; i <= 18; i++) { const x = -40 + i * (W + 80) / 18; top.push([x, y0 + (i % 2 ? -26 : 8) + Math.sin(t * 1.1 + i) * 3]); top2.push([x + 30, y0 + 70 + (i % 2 ? 14 : -18)]); }
        fill(f, top.concat([[W + 40, H + 40], [-40, H + 40]]), k + 1, t, 1);
        fill(f2, top2.concat([[W + 70, H + 40], [-10, H + 40]]), k + 2, t, 1);
        r_.setAttribute('d', lineS(top, k + 3, t, 5, 1));
      },
    };
  }

  // ================================================================== ch_garden
  SH.ch_garden = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7101, gy = (P.ground ?? 0.6) * H, root = el(svg, 'g');
      const stars = window.TD.stars(el(root, 'g'), sd + 1, W, H, 22, 0.16, 0.5);
      const arcE = inkEl(root, INK.paperLight, { 'fill-opacity': 0.9 });
      const com = P.comet === false ? null : comet(el(root, 'g'), sd + 2);
      const C = Object.assign({ x: 0.3, y: 0.22, len: 440, ang: -22, r: 26, at: 0 }, P.comet || {});
      const MORE = P.more ? Object.assign({ n: 7, at: 'eight', dur: 0.9, pts: [[0.58, 0.17], [0.8, 0.27], [0.5, 0.34], [0.86, 0.15], [0.68, 0.41], [0.42, 0.2], [0.9, 0.38]] }, P.more) : null;
      const moreC = MORE ? Array.from({ length: MORE.n }, (_, i) => comet(el(root, 'g'), sd + 300 + i)) : [];
      const tuf = tufts(el(root, 'g'), sd + 3, W, gy + 20, H - 260, 26);
      const lanG = el(root, 'g'), lanF = inkEl(lanG, INK.inkSoft), lanGl = inkEl(lanG, INK.paperLight, { 'fill-opacity': 0.55 }), lanR = inkEl(lanG), lanFl = flame(lanG, sd + 4);
      const stool = inkEl(root, WOOD()), book = inkEl(root, INK.paperLight), bookR = inkEl(root);
      const sc_ = scope(el(root, 'g'), sd + 5);
      const carG = el(root, 'g');
      const carol = person(carG, P.carol || { x: 0.3, y: P.ground ?? 0.6, face: 'right', pose: 'point', dir: 'forward', dress: 'blue' }, sd + 6);
      const broomG = el(root, 'g'), broomS = inkEl(broomG, WOOD()), broomB = inkEl(broomG, mix(INK.gold, INK.stain, 0.4)), broomR = inkEl(broomG);
      const kas = P.kasif ? person(el(root, 'g'), P.kasif, sd + 7, true) : null;
      const hed = hedge(el(root, 'g'), sd + 8, W, H, P.hedge ?? 1690);
      const wd = words(el(root, 'g'), P, W, H, sd + 9);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      const S = Object.assign({ ang: 62, sweep: 0, len: 440, r: 46 }, P.scope || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          stars.update(t);
          // lantern on the lawn
          const lx = (P.lantern ?? 0.86) * W, ly = gy + 300;
          if (P.lantern !== false) {
            const lb = [[lx - 34, ly], [lx + 34, ly], [lx + 28, ly - 96], [lx - 28, ly - 96]];
            lanFl.update(t, lx, ly - 22, 0.9, 150);
            fill(lanGl, lb, k + 10, t, 0.4, false);
            fill(lanF, [[lx - 40, ly - 96], [lx + 40, ly - 96], [lx, ly - 132]], k + 11, t, 0.4, false);
            lanR.setAttribute('d', [ringS(lb, k + 12, t, 5, 0.4, false), lineS([[lx, ly - 132], [lx, ly - 160]], k + 13, t, 4), ringS(ell(lx, ly - 170, 16, 12, 8), k + 14, t, 3.5)].join(' '));
          }
          // stool with the open logbook (left foreground)
          const bx = 150, by = gy + 330;
          if (P.stool) {
          fill(stool, [[bx - 110, by], [bx + 110, by], [bx + 96, by + 26], [bx - 96, by + 26]], k + 20, t, 0.4, false);
          const bk = [[bx - 100, by - 8], [bx, by - 22], [bx + 100, by - 8], [bx + 92, by + 4], [bx - 92, by + 4]];
          fill(book, bk, k + 21, t, 0.4, false);
          bookR.setAttribute('d', [ringS(bk, k + 22, t, 3.5, 0.4, false), lineS([[bx - 86, by + 26], [bx - 100, by + 200]], k + 23, t, 9), lineS([[bx + 86, by + 26], [bx + 100, by + 200]], k + 24, t, 9), lineS([[bx, by - 22], [bx, by + 4]], k + 25, t, 2.5)].join(' '));
          }
          tuf.update(t);
          // the observer, then the telescope at her eye
          const cs = carol.K.scale ?? 1, cf = faceOf(carol.K.face, 1), cx = (carol.K.x ?? 0.3) * W, cy = (carol.K.y ?? (P.ground ?? 0.6)) * H;
          const sweep = S.sweep ? S.sweep * Math.sin(lt * 0.9) : 0;
          const E = [cx + cf * (96 * cs + (S.dx ?? 0)), cy - 398 * cs + (S.dy ?? 0)];
          const so = sc_.update(t, { E, s: cf, ang: S.ang + sweep, len: S.len, r: S.r, gy });
          const cr = carol.update(lt, t, cues, W, H);
          // dashed sweep arc across the sky from the tube mouth
          if (P.arc) {
            const a0 = atOr(cues, P.arc.at, 0.3), pp = lt >= a0 ? prog(lt, a0, 1.4) : 0, A = [];
            const cxA = so.mouth[0] + so.u[0] * 40, cyA = so.mouth[1] + so.u[1] * 40, R0 = P.arc.r ?? 330;
            for (let i = 0; i < 9; i++) { const q0 = i / 9, q1 = q0 + 0.06; if (q0 > pp) break; const an0 = lerp(-2.6, -0.9, q0), an1 = lerp(-2.6, -0.9, Math.min(pp, q1)); A.push(lineS([[cxA + Math.cos(an0) * R0, cyA + 140 + Math.sin(an0) * R0], [cxA + Math.cos((an0 + an1) / 2) * R0, cyA + 140 + Math.sin((an0 + an1) / 2) * R0], [cxA + Math.cos(an1) * R0, cyA + 140 + Math.sin(an1) * R0]], k + 30 + i, t, 6, 0.6)); }
            arcE.setAttribute('d', A.join(' '));
          }
          // comet grows in on its cue
          if (com) {
            const ca = atOr(cues, C.at, 0), cp = lt >= ca ? prog(lt, ca, C.grow ?? 0.9) : 0;
            com.update(t, { x: C.x * W, y: C.y * H, len: C.len, ang: C.ang, r: C.r * (1 + 0.25 * hit), p: cp });
          }
          // more comets pop in across the sky (her later finds)
          moreC.forEach((c, i) => {
            const ap = atOr(cues, MORE.at, dur * 0.6) + i * MORE.dur / MORE.n, q = lt >= ap ? spring(lt, ap, 0.45) : 0, pt = MORE.pts[i % MORE.pts.length];
            c.update(t, { x: pt[0] * W, y: pt[1] * H, len: MORE.len ?? 230, ang: MORE.ang ?? (-18 - (i % 3) * 10), r: MORE.r ?? 20, p: clamp01(q) });
          });
          // broom in her back hand
          if (P.broom) {
            const bs = P.broom.size ?? 1, h2 = cr.hand2, swp = (P.broom.sweep ?? 0) * Math.sin(t * 3.2), top = P.broom.x != null ? [P.broom.x * W - 40 * bs, gy - 360 * bs] : [h2[0] + cr.face * 14, h2[1] - 150 * bs], bot = P.broom.x != null ? [P.broom.x * W + 20 * bs + swp * 0.2, gy - 70 * bs] : [h2[0] - cr.face * 46 + swp, gy - 70 * bs];
            broomS.setAttribute('d', lineS([top, bot], k + 40, t, 12 * bs, 0.5));
            const br = [[bot[0] - 16 * bs, bot[1] - 8], [bot[0] + 16 * bs, bot[1] - 8], [bot[0] + 46 * bs - cr.face * 20, gy + 2], [bot[0] - 46 * bs - cr.face * 20, gy + 6]];
            fill(broomB, br, k + 41, t, 0.6, false);
            broomR.setAttribute('d', [lineS([top, bot], k + 42, t, 4, 0.5), ringS(br, k + 43, t, 4, 0.6, false)].concat([-1, 0, 1].map((j, m) => lineS([[bot[0] + j * 8, bot[1]], [bot[0] + j * 30 - cr.face * 20, gy]], k + 44 + m, t, 2.5, 0.5))).join(' '));
          }
          if (kas) kas.update(lt, t, cues, W, H);
          hed.update(t);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ch_kitchen
  SH.ch_kitchen = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7301, gy = (P.ground ?? 0.6) * H, root = el(svg, 'g');
      const hearthF = inkEl(root, mix(INK.paperDark, INK.stain, 0.4)), hearthIn = inkEl(root, mix(INK.ink, INK.stain, 0.2)), hearthR = inkEl(root);
      const fireG = el(root, 'g'), fl1 = flame(fireG, sd + 1), fl2 = flame(fireG, sd + 2), fl3 = flame(fireG, sd + 3);
      const pot = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), potR = inkEl(root), steam = inkEl(root, INK.paperLight, { 'fill-opacity': 0.7 });
      const pans = inkEl(root, mix(INK.stain, INK.inkSoft, 0.4)), pansR = inkEl(root);
      const doorF = inkEl(root, WOOD()), doorR = inkEl(root), ticks = inkEl(root), redL = inkEl(root, INK.red);
      const chartTx = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 76, 'text-anchor': 'end', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
      const mom = P.mother ? person(el(root, 'g'), P.mother, sd + 5) : null;
      const carol = P.carol ? person(el(root, 'g'), P.carol, sd + 6) : null;
      const brushG = el(root, 'g'), brush = inkEl(brushG, WOOD()), brushR = inkEl(brushG);
      const tubF = inkEl(root, WOOD()), water = inkEl(root, mix(INK.blue, INK.paperLight, 0.45)), suds = inkEl(root, INK.paperLight), tubR = inkEl(root);
      const bucket = inkEl(root, mix(INK.stain, INK.paperDark, 0.2)), bucketR = inkEl(root);
      const basket = inkEl(root, mix(INK.gold, INK.stain, 0.55)), cloth = inkEl(root, INK.paperLight), cloth2 = inkEl(root, mix(INK.blue, INK.paperLight, 0.4)), basketR = inkEl(root);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      const CH = P.chart === false ? null : Object.assign({ x: 0.86, at: 'mark', text: '4 FT 3' }, P.chart || {});
      chartTx.textContent = CH ? CH.text : '';
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // hearth (left): stone arch, fire, pot on a hook, steam
          const hx0 = -20, hx1 = 400, hy0 = gy - 560;
          const hp = [[hx0, gy], [hx0, hy0], [hx1, hy0 - 10], [hx1, gy]];
          fill(hearthF, hp, k + 1, t, 0.5, false);
          const ip = [[hx0 + 50, gy], [hx0 + 50, hy0 + 200], [hx0 + 100, hy0 + 130], [hx1 - 100, hy0 + 130], [hx1 - 50, hy0 + 200], [hx1 - 50, gy]];
          fill(hearthIn, ip, k + 2, t, 0.5);
          const HR = [ringS(hp, k + 3, t, 5, 0.5, false), ringS(ip, k + 4, t, 4, 0.5)];
          for (let i = 0; i < 6; i++) HR.push(lineS([[hx0 + 10, hy0 + 40 + i * 70], [hx0 + 45, hy0 + 42 + i * 70]], k + 5 + i, t, 3, 0.5), lineS([[hx1 - 45, hy0 + 30 + i * 70], [hx1 - 8, hy0 + 32 + i * 70]], k + 12 + i, t, 3, 0.5));
          HR.push(lineS([[hx0 + 30, hy0 + 2], [hx1 + 10, hy0 - 8]], k + 19, t, 9, 0.5));
          HR.push(lineS([[190, hy0 + 130], [190, gy - 250]], k + 20, t, 4, 0.5));
          hearthR.setAttribute('d', HR.join(' '));
          fl1.update(t, 140, gy - 20, 1.6, 0); fl2.update(t + 0.3, 200, gy - 20, 2.0, 160); fl3.update(t + 0.7, 260, gy - 20, 1.5, 0);
          const sw = Math.sin(t * 1.2) * 4, pp = ell(190 + sw, gy - 180, 92, 70, 14);
          fill(pot, pp, k + 21, t, 0.6);
          potR.setAttribute('d', ringS(pp, k + 22, t, 5, 0.6) + ' ' + lineS([[110 + sw, gy - 236], [190 + sw, gy - 290], [270 + sw, gy - 236]], k + 23, t, 4));
          const ST = []; for (let i = 0; i < 4; i++) { const u = (t * 0.35 + i / 4) % 1, x = 190 + Math.sin(u * 7 + i) * 30, y = gy - 260 - u * 260; ST.push(loopS(ell(x, y, 26 + u * 24, 18 + u * 16, 9), k + 24 + i, t, 0.8)); }
          steam.setAttribute('d', ST.join(' ')); steam.setAttribute('fill-opacity', '0.55');
          // pans hanging on the wall
          const PN = [], PR = [];
          [[480, 420, 54], [590, 450, 42], [690, 410, 48]].forEach(([x, y, r], i) => { const sx = x + Math.sin(t * 1.3 + i) * 4; const e = ell(sx, y + r, r, r, 12); PN.push(loopS(e, k + 30 + i, t, 0.6)); PR.push(ringS(e, k + 33 + i, t, 4, 0.6), lineS([[sx, y], [sx, y - 70]], k + 36 + i, t, 7, 0.5), loopS(ell(x, y - 80, 8, 8, 6), k + 39 + i, t, 0.4)); });
          pans.setAttribute('d', PN.join(' ')); pansR.setAttribute('d', PR.join(' '));
          // doorframe with height marks
          if (CH) {
            const dx = CH.x * W, dp = [[dx - 60, gy], [dx - 60, gy - 900], [dx + 140, gy - 900], [dx + 140, gy], [dx + 90, gy], [dx + 90, gy - 850], [dx - 10, gy - 850], [dx - 10, gy]];
            fill(doorF, dp, k + 40, t, 0.5, false);
            doorR.setAttribute('d', ringS(dp, k + 41, t, 5, 0.5, false));
            const TK = []; for (let i = 1; i < 14; i++) { const y = gy - i * 55; TK.push(lineS([[dx - 60, y], [dx - 60 + (i % 2 ? 26 : 44), y]], k + 42 + i, t, 3.5, 0.4)); }
            ticks.setAttribute('d', TK.join(' '));
            const ma = atOr(cues, CH.at, dur * 0.5), mp = lt >= ma ? prog(lt, ma, 0.45) : 0;
            const ch = carol ? carol.K : null, hy = ch ? (ch.y ?? 0.6) * H - 492 * (ch.scale ?? 1) : gy - 440;
            const lx = ch ? (ch.x ?? 0.7) * W : dx - 90, lx0 = lx - 150, lx1 = Math.max(lx + 150, dx - 40);
            redL.setAttribute('d', mp > 0.01 ? lineS([[lx0, hy], [lerp(lx0, lx1, mp), hy - 4]], k + 60, t, 10 + 4 * hit) : '');
            chartTx.setAttribute('opacity', clamp01((mp - 0.4) * 3).toFixed(3));
            chartTx.setAttribute('text-anchor', 'middle');
            const b = boil(k + 61, t, 1);
            chartTx.setAttribute('transform', `translate(${f1(lx + b[0])} ${f1(hy - 34 + b[1])}) scale(${(1 + 0.1 * punch(lt, ma + 0.45, 0.5)).toFixed(3)})`);
          }
          let mr = null, cr = null;
          if (mom) mr = mom.update(lt, t, cues, W, H);
          if (carol) cr = carol.update(lt, t, cues, W, H);
          // scrubbing brush in her hand
          if (cr && P.brush) {
            const h = [cr.hand[0], Math.min(cr.hand[1], (carol.K.y ?? 0.6) * H - 40)], bp = [[h[0] - 40, h[1] + 4], [h[0] + 40, h[1]], [h[0] + 38, h[1] + 26], [h[0] - 38, h[1] + 30]];
            fill(brush, bp, k + 70, t, 0.4, false);
            brushR.setAttribute('d', ringS(bp, k + 71, t, 4, 0.4, false) + ' ' + [0, 1, 2, 3, 4, 5].map(i => lineS([[h[0] - 32 + i * 13, h[1] + 28], [h[0] - 34 + i * 13, h[1] + 44]], k + 72 + i, t, 2.5, 0.4)).join(' '));
          }
          // foreground: washtub with laundry (centre-left), bucket (right), basket (bottom left)
          const tx = 470, ty = gy + 420, tp = [[tx - 230, ty - 150], [tx + 230, ty - 150], [tx + 190, ty + 90], [tx - 190, ty + 90]];
          fill(tubF, tp, k + 80, t, 0.5, false);
          fill(water, ell(tx, ty - 150, 222, 40, 14), k + 81, t, 0.5);
          const SD = []; for (let i = 0; i < 7; i++) { const q = i / 6, x = tx - 170 + q * 340, b = Math.sin(t * 2 + i) * 6; SD.push(loopS(ell(x, ty - 162 + b, 26 + (i % 3) * 8, 18, 8), k + 82 + i, t, 0.6)); }
          suds.setAttribute('d', SD.join(' '));
          tubR.setAttribute('d', [ringS(tp, k + 90, t, 6, 0.5, false), ringS(ell(tx, ty - 150, 222, 40, 14), k + 91, t, 4, 0.5), lineS([[tx - 220, ty - 80], [tx + 220, ty - 80]], k + 92, t, 5), lineS([[tx - 200, ty + 20], [tx + 200, ty + 20]], k + 93, t, 5)].join(' '));
          const ux = 900, uy = gy + 560, up = [[ux - 110, uy - 220], [ux + 110, uy - 220], [ux + 86, uy + 60], [ux - 86, uy + 60]];
          fill(bucket, up, k + 94, t, 0.5, false);
          bucketR.setAttribute('d', [ringS(up, k + 95, t, 6, 0.5, false), ringS(ell(ux, uy - 220, 110, 26, 12), k + 96, t, 4), lineS([[ux - 110, uy - 220], [ux - 60, uy - 330], [ux + 60, uy - 330], [ux + 110, uy - 220]], k + 97, t, 4), lineS([[ux - 100, uy - 120], [ux + 100, uy - 120]], k + 98, t, 4)].join(' '));
          const kx = 200, ky = gy + 720, kp = [[kx - 260, ky - 160], [kx + 240, ky - 170], [kx + 210, ky + 120], [kx - 230, ky + 120]];
          fill(basket, kp, k + 100, t, 0.5, false);
          fill(cloth, [[kx - 230, ky - 160], [kx - 150, ky - 250], [kx - 20, ky - 220], [kx + 60, ky - 270], [kx + 200, ky - 190], [kx + 230, ky - 165]], k + 101, t, 0.8);
          fill(cloth2, [[kx - 60, ky - 170], [kx + 10, ky - 236], [kx + 120, ky - 200], [kx + 140, ky - 168]], k + 102, t, 0.8);
          const BR = [ringS(kp, k + 103, t, 5, 0.5, false)]; for (let i = 0; i < 4; i++) BR.push(lineS([[kx - 250 + i * 6, ky - 100 + i * 60], [kx + 230 - i * 6, ky - 108 + i * 60]], k + 104 + i, t, 3, 0.5));
          for (let i = 0; i < 6; i++) BR.push(lineS([[kx - 200 + i * 80, ky - 160], [kx - 196 + i * 76, ky + 118]], k + 110 + i, t, 2.5, 0.5));
          basketR.setAttribute('d', BR.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
          void mr;
        },
      };
    },
  };

  // ================================================================== ch_study
  SH.ch_study = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7501, gy = (P.ground ?? 0.6) * H, root = el(svg, 'g');
      const winF = inkEl(root, SKY()), winR = inkEl(root), cur = inkEl(root, mix(INK.red, INK.paperDark, 0.35)), curR = inkEl(root);
      const starG = el(root, 'g'), starD = inkEl(starG, INK.paperLight), starS = inkEl(starG, INK.gold);
      const shelf = inkEl(root, WOOD()), books = [inkEl(root, mix(INK.red, INK.stain, 0.4)), inkEl(root, mix(INK.blue, INK.paperDark, 0.3)), inkEl(root, mix(INK.green, INK.paperDark, 0.3))], shelfR = inkEl(root);
      const sc_ = scope(el(root, 'g'), sd + 3);
      const post = inkEl(root, WOOD()), pmir = inkEl(root, mix(INK.gold, INK.paperDark, 0.4)), postR = inkEl(root), swirl = inkEl(root, INK.paperLight);
      const will = person(el(root, 'g'), P.will || { x: 0.62, y: P.ground ?? 0.6, face: 'left', pose: 'point', dir: 'down', scale: 1.15, wob: { amp: 14, f: 1.1 } }, sd + 4);
      const carol = P.carol ? person(el(root, 'g'), P.carol, sd + 5) : null;
      const trayG = el(root, 'g'), tray = inkEl(trayG, mix(INK.gold, INK.stain, 0.3)), trayR = inkEl(trayG), cup = inkEl(trayG, INK.paperLight), trayFl = flame(trayG, sd + 6);
      const table = inkEl(root, WOOD()), tableF = inkEl(root, mix(WOOD(), INK.ink, 0.22)), chart = inkEl(root, INK.paperLight), mirror = inkEl(root, mix(INK.gold, INK.paperDark, 0.45)), mirG = inkEl(root, INK.paperLight, { 'fill-opacity': 0.6 }), candle = inkEl(root, INK.paperLight), tableR = inkEl(root), tFl = flame(el(root, 'g'), sd + 7);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      const SL = Array.from({ length: 26 }, (_, i) => ({ x: hn(sd + i, 1), y: hn(sd + i, 2), b: hn(sd + i, 3) < 0.25, ph: hn(sd + i, 4) * 6 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // tall sash window with stars (right)
          const wx0 = 560, wx1 = 1010, wy0 = 300, wy1 = gy - 230, wp = [[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]];
          fill(winF, wp, k + 1, t, 0.5, false);
          const SD = [], SS = [];
          SL.forEach((q, i) => { const x = lerp(wx0 + 20, wx1 - 20, q.x), y = lerp(wy0 + 20, wy1 - 20, q.y), tw = 0.6 + 0.4 * Math.sin(t * 2.5 + q.ph); if (q.b) { const R = 14 * tw, pts = []; for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4, rr = j % 2 ? R * 0.35 : R; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } SS.push(loopS(pts, k + 10 + i, t, 0.5, false)); } else SD.push(loopS(ell(x, y, 3.5 * tw + 1, 3.5 * tw + 1, 6), k + 40 + i, t, 0.4)); });
          starD.setAttribute('d', SD.join(' ')); starS.setAttribute('d', SS.join(' '));
          const WR = [ringS(wp, k + 2, t, 9, 0.5, false), lineS([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], k + 3, t, 7), lineS([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], k + 4, t, 5)];
          for (let i = 1; i < 3; i++) WR.push(lineS([[wx0, lerp(wy0, wy1, i / 6)], [wx1, lerp(wy0, wy1, i / 6)]], k + 5 + i, t, 3), lineS([[wx0, lerp(wy0, wy1, 0.5 + i / 6)], [wx1, lerp(wy0, wy1, 0.5 + i / 6)]], k + 8 + i, t, 3));
          WR.push(lineS([[wx0 - 30, wy1 + 14], [wx1 + 40, wy1 + 14]], k + 12, t, 14));
          winR.setAttribute('d', WR.join(' '));
          const cs = Math.sin(t * 0.8) * 8, cp = [[wx0 - 70, wy0 - 40], [wx0 + 30, wy0 - 40], [wx0 + 10 + cs, wy0 + 260], [wx0 + 40 + cs, wy1 + 10], [wx0 - 80, wy1 + 10]];
          fill(cur, cp, k + 13, t, 0.6);
          curR.setAttribute('d', ringS(cp, k + 14, t, 4, 0.6) + ' ' + [0, 1].map(i => lineS([[wx0 - 40 + i * 30, wy0], [wx0 - 44 + i * 34 + cs * 0.6, wy1]], k + 15 + i, t, 2.5, 0.6)).join(' ') + ' ' + lineS([[wx0 - 100, wy0 - 46], [wx1 + 40, wy0 - 46]], k + 17, t, 8));
          // bookshelf (left wall)
          const sx0 = 20, sx1 = 330, sy = [380, 560];
          const SHL = sy.map((y, i) => loopS([[sx0, y], [sx1, y], [sx1, y + 18], [sx0, y + 18]], k + 20 + i, t, 0.4, false));
          shelf.setAttribute('d', SHL.join(' '));
          const BB = [[], [], []], BR = [];
          sy.forEach((y, j) => { let x = sx0 + 10; for (let i = 0; x < sx1 - 30; i++) { const w = 26 + hn(sd + i, j) * 18, h = 110 + hn(sd + i, j + 5) * 50, lean = i === 4 ? 14 : 0, q = [[x, y], [x + w, y], [x + w + lean, y - h], [x + lean, y - h]]; BB[(i + j) % 3].push(loopS(q, k + 30 + j * 20 + i, t, 0.4, false)); BR.push(ringS(q, k + 70 + j * 20 + i, t, 3, 0.4, false)); x += w + 4; } BR.push(ringS([[sx0, y], [sx1, y], [sx1, y + 18], [sx0, y + 18]], k + 110 + j, t, 3.5, 0.4, false)); });
          BB.forEach((b, i) => books[i].setAttribute('d', b.join(' ')));
          shelfR.setAttribute('d', BR.join(' '));
          // a big telescope stands at the window (no observer)
          if (P.scope !== false) {
            const SO = Object.assign({ E: [0.86, 0.44], s: -1, ang: 58, len: 520, r: 50 }, P.scope || {});
            sc_.update(t, { E: [SO.E[0] * W, SO.E[1] * H], s: SO.s, ang: SO.ang, len: SO.len, r: SO.r, gy });
          }
          // the polishing post with the metal mirror; William rubs it
          const px = (P.post ?? 0.47) * W, ptop = gy - 200;
          const pst = [[px - 46, ptop + 20], [px + 46, ptop + 20], [px + 70, gy], [px - 70, gy]];
          fill(post, pst, k + 100, t, 0.5, false);
          const wr = will.update(lt, t, cues, W, H);
          const mw = Math.sin(t * TAU * 1.1) * 6;
          fill(pmir, ell(px + mw * 0.3, ptop, 160, 46, 16), k + 101, t, 0.5);
          postR.setAttribute('d', [ringS(pst, k + 102, t, 5, 0.5, false), ringS(ell(px + mw * 0.3, ptop, 160, 46, 16), k + 103, t, 6, 0.5), lineS([[px - 60, ptop + 4], [px - 10, ptop - 14]], k + 104, t, 2.5, 0.5)].join(' '));
          const sw2 = []; for (let i = 0; i < 3; i++) { const a2 = t * 6 + i * 2.1; sw2.push(lineS([[px + Math.cos(a2) * 90, ptop + Math.sin(a2) * 24], [px + Math.cos(a2 + 1.1) * 90, ptop + Math.sin(a2 + 1.1) * 24]], k + 105 + i, t, 5, 0.4)); }
          swirl.setAttribute('d', sw2.join(' '));
          // Caroline brings a candle tray
          if (carol) {
            const cr = carol.update(lt, t, cues, W, H);
            if (P.tray !== false) {
              const hx = cr.hand[0] + cr.face * 40, hy = cr.hand[1] - 8;
              const tp = [[hx - 84, hy], [hx + 84, hy], [hx + 70, hy + 16], [hx - 70, hy + 16]];
              fill(tray, tp, k + 120, t, 0.4, false);
              fill(cup, [[hx + 10, hy - 2], [hx + 54, hy - 2], [hx + 50, hy - 40], [hx + 14, hy - 40]], k + 121, t, 0.4, false);
              trayR.setAttribute('d', [ringS(tp, k + 122, t, 4, 0.4, false), ringS([[hx + 10, hy - 2], [hx + 54, hy - 2], [hx + 50, hy - 40], [hx + 14, hy - 40]], k + 123, t, 3, 0.4, false), ringS([[hx - 50, hy - 2], [hx - 30, hy - 2], [hx - 30, hy - 70], [hx - 50, hy - 70]], k + 124, t, 3, 0.4, false)].join(' '));
              trayFl.update(t, hx - 40, hy - 70, 1.0, 110);
            }
          }
          // table in front: rolled star chart, metal mirror, candle
          const ty = gy + 300;
          fill(table, [[-30, ty], [W + 30, ty - 6], [W + 30, ty + 70], [-30, ty + 76]], k + 130, t, 0.5, false);
          fill(tableF, [[-30, ty + 76], [W + 30, ty + 70], [W + 30, H + 30], [-30, H + 30]], k + 131, t, 0.5, false);
          const chp = [[90, ty - 20], [600, ty - 40], [612, ty + 10], [96, ty + 30]];
          fill(chart, chp, k + 132, t, 0.5, false);
          const mx = 800, my = ty - 70, mp = ell(mx, my, 120, 120, 16);
          fill(mirror, mp, k + 133, t, 0.5);
          mirG.setAttribute('d', loopS([[mx - 70, my - 40], [mx - 30, my - 84], [mx + 10, my - 60], [mx - 40, my - 10]], k + 134, t, 0.5));
          const cdx = 980, cdp = [[cdx - 22, ty - 10], [cdx + 22, ty - 10], [cdx + 20, ty - 160], [cdx - 20, ty - 160]];
          fill(candle, cdp, k + 135, t, 0.4, false);
          tFl.update(t, cdx, ty - 162, 1.2, 130);
          const TR = [lineS([[-30, ty], [W + 30, ty - 6]], k + 136, t, 6), lineS([[-30, ty + 76], [W + 30, ty + 70]], k + 137, t, 5), ringS(chp, k + 138, t, 4, 0.5, false), ringS(mp, k + 139, t, 6, 0.5), ringS(ell(mx, my, 90, 90, 14), k + 140, t, 3, 0.5), ringS(cdp, k + 141, t, 4, 0.4, false), ringS(ell(cdx, ty - 6, 60, 18, 10), k + 142, t, 4, 0.4)];
          for (let i = 0; i < 4; i++) TR.push(lineS([[140 + i * 110, ty - 10 - i * 4], [180 + i * 110, ty + 18 - i * 4]], k + 143 + i, t, 2.5, 0.5));
          for (let i = 0; i < 5; i++) TR.push(lineS([[-30, ty + 200 + i * 140], [W + 30, ty + 196 + i * 140]], k + 150 + i, t, 2.5, 0.5));
          tableR.setAttribute('d', TR.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ch_eyepiece
  SH.ch_eyepiece = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7701, root = el(svg, 'g');
      const cx = (P.cx ?? 0.5) * W, cy = (P.cy ?? 0.37) * H, R = P.r ?? 430;
      const page = inkEl(root, INK.paperLight), pageR = inkEl(root), lines_ = inkEl(root, INK.inkSoft), sketch = inkEl(root), sketchT = inkEl(root, INK.inkSoft);
      const quill = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.3)), quillR = inkEl(root);
      const dateTx = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 92, 'text-anchor': 'start', fill: INK.ink });
      dateTx.textContent = P.date || '';
      const housing = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), rim = inkEl(root, INK.gold), view = inkEl(root, SKY()), rimR = inkEl(root);
      const starD = inkEl(root, INK.paperLight), starB = inkEl(root, mix(INK.paperLight, INK.gold, 0.25));
      const halo3 = inkEl(root, INK.gold, { 'fill-opacity': 0.16 }), halo2 = inkEl(root, INK.gold, { 'fill-opacity': 0.3 }), halo1 = inkEl(root, mix(INK.gold, INK.paperLight, 0.5), { 'fill-opacity': 0.85 });
      const ghost = inkEl(root, INK.paperLight), arrow = inkEl(root, INK.red);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      const SL = Array.from({ length: 44 }, (_, i) => { const a = hn(sd + i, 1) * TAU, rr = Math.sqrt(hn(sd + i, 2)) * 0.92; return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, s: 2 + hn(sd + i, 3) * 4, ph: hn(sd + i, 4) * 6, big: hn(sd + i, 5) < 0.12 }; });
      const DOT = Object.assign({ from: [-0.28, 0.12], to: [0.14, -0.08] }, P.dot || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // notebook page below (fills the lower frame)
          const py = Math.max(cy + R + 120, P.pageTop ?? 1345), pp = [[60, py], [1040, py - 30], [1070, H + 40], [30, H + 40]];
          fill(page, pp, k + 1, t, 0.5, false);
          pageR.setAttribute('d', ringS(pp, k + 2, t, 5, 0.5, false));
          const LN = []; for (let i = 0; i < 7; i++) LN.push(lineS([[100, py + 110 + i * 82 - i * 2], [1010, py + 82 + i * 82 - i * 2]], k + 3 + i, t, 2.2, 0.4));
          lines_.setAttribute('d', LN.join(' '));
          const sa = atOr(cues, P.sketch, dur * 0.55), sp = lt >= sa ? prog(lt, sa, 0.9) : 0;
          const skx = 760, sky = py + 110;
          const SK = [];
          if (sp > 0) {
            const n = Math.max(2, Math.round(12 * sp)), circ = []; for (let i = 0; i <= n; i++) { const a = i / 12 * TAU; circ.push([skx + Math.cos(a) * 34, sky + Math.sin(a) * 34]); }
            SK.push(lineS(circ, k + 20, t, 5, 0.6));
            if (sp > 0.6) [-1, 0, 1].forEach((q, j) => SK.push(lineS([[skx + 34, sky + q * 18], [skx + 34 + 150 * (sp - 0.6) / 0.4, sky - 50 + q * 26]], k + 21 + j, t, 4, 0.6)));
          }
          sketch.setAttribute('d', SK.join(' '));
          sketchT.setAttribute('d', '');
          const da = atOr(cues, P.dateAt, 0.2), dp = lt >= da ? prog(lt, da, 0.6) : 0;
          dateTx.setAttribute('opacity', clamp01(dp * 2).toFixed(3));
          const bd = boil(k + 30, t, 1);
          dateTx.setAttribute('transform', `translate(${f1(120 + bd[0])} ${f1(py + 120 + bd[1])}) rotate(-2)`);
          // quill writing over the page
          const qx = 120 + Math.min(1, dp) * 480 + Math.sin(t * 7) * 10 + (sp > 0 ? (skx - 600) * Math.min(1, sp * 1.5) : 0), qy = py + 110 + Math.cos(t * 9) * 6;
          const qp = [[qx, qy], [qx + 60, qy - 150], [qx + 160, qy - 330], [qx + 210, qy - 380], [qx + 150, qy - 260], [qx + 40, qy - 70]];
          fill(quill, qp, k + 31, t, 0.6);
          quillR.setAttribute('d', ringS(qp, k + 32, t, 3.5, 0.6) + ' ' + lineS([[qx, qy], [qx + 190, qy - 360]], k + 33, t, 3, 0.5));
          // eyepiece housing, brass rim, the view
          fill(housing, ell(cx, cy, R + 70, R + 70, 24), k + 40, t, 0.6);
          fill(rim, ell(cx, cy, R + 34, R + 34, 24), k + 41, t, 0.6);
          fill(view, ell(cx, cy, R, R, 24), k + 42, t, 0.5);
          const RR = [ringS(ell(cx, cy, R + 70, R + 70, 24), k + 43, t, 6, 0.6), ringS(ell(cx, cy, R + 34, R + 34, 24), k + 44, t, 4, 0.6), ringS(ell(cx, cy, R, R, 24), k + 45, t, 6, 0.5)];
          for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; RR.push(lineS([[cx + Math.cos(a) * (R + 8), cy + Math.sin(a) * (R + 8)], [cx + Math.cos(a) * (R + 28), cy + Math.sin(a) * (R + 28)]], k + 50 + i, t, 3, 0.4)); }
          rimR.setAttribute('d', RR.join(' '));
          // stars drift very slowly (the sky turns)
          const rot = lt * 0.012, D = [], B = [];
          SL.forEach((q, i) => { const x = cx + (q.x * Math.cos(rot) - q.y * Math.sin(rot)) * R, y = cy + (q.x * Math.sin(rot) + q.y * Math.cos(rot)) * R, tw = 0.7 + 0.3 * Math.sin(t * 2.6 + q.ph); if (Math.hypot(x - cx, y - cy) > R - 14) return; if (q.big) { const rr = 16 * tw, pts = []; for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4, r2 = j % 2 ? rr * 0.3 : rr; pts.push([x + Math.cos(a) * r2, y + Math.sin(a) * r2]); } B.push(loopS(pts, k + 80 + i, t, 0.4, false)); } else D.push(loopS(ell(x, y, q.s * tw, q.s * tw, 6), k + 130 + i, t, 0.4)); });
          starD.setAttribute('d', D.join(' ')); starB.setAttribute('d', B.join(' '));
          // the fuzzy dot moves from its first place
          const ma = atOr(cues, P.at ?? 'moved', dur * 0.45), mv = lt < ma ? lin(lt, 0, ma) * 0.15 : lerp(0.15, 1, prog(lt, ma, 1.0));
          const fx = cx + lerp(DOT.from[0], DOT.to[0], mv) * R, fy = cy + lerp(DOT.from[1], DOT.to[1], mv) * R, pu = 1 + 0.1 * Math.sin(t * 3);
          halo3.setAttribute('d', loopS(ell(fx, fy, 70 * pu, 70 * pu, 14), k + 200, t, 1.2));
          halo2.setAttribute('d', loopS(ell(fx, fy, 42 * pu, 40 * pu, 12), k + 201, t, 1));
          halo1.setAttribute('d', loopS(ell(fx, fy, 18, 18, 10), k + 202, t, 0.6));
          const ga = lt >= ma ? clamp01((lt - ma) / 0.3) : 0, gx = cx + DOT.from[0] * R, gyy = cy + DOT.from[1] * R;
          const GR = []; if (ga > 0) for (let i = 0; i < 10; i++) { if (i % 2) continue; const a0 = i / 10 * TAU, a1 = (i + 1) / 10 * TAU; GR.push(lineS([[gx + Math.cos(a0) * 46, gyy + Math.sin(a0) * 46], [gx + Math.cos((a0 + a1) / 2) * 46, gyy + Math.sin((a0 + a1) / 2) * 46], [gx + Math.cos(a1) * 46, gyy + Math.sin(a1) * 46]], k + 210 + i, t, 4, 0.5)); }
          ghost.setAttribute('d', GR.join(' '));
          const ap = lt >= ma + 0.15 ? prog(lt, ma + 0.15, 0.6) : 0;
          if (ap > 0.01) {
            const dx = fx - gx, dy = fy - gyy, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl, s0 = [gx + ux * 56, gyy + uy * 56], e0 = [lerp(s0[0], fx - ux * 66, ap), lerp(s0[1], fy - uy * 66, ap)];
            const AR = [lineS([s0, [(s0[0] + e0[0]) / 2 - uy * 30, (s0[1] + e0[1]) / 2 + ux * 30], e0], k + 230, t, 12, 0.6)];
            if (ap > 0.6) AR.push(lineS([[e0[0] - ux * 46 - uy * 30, e0[1] - uy * 46 + ux * 30], e0, [e0[0] - ux * 46 + uy * 30, e0[1] - uy * 46 - ux * 30]], k + 231, t, 12, 0.6));
            arrow.setAttribute('d', AR.join(' '));
          } else arrow.setAttribute('d', '');
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ch_logbook
  SH.ch_logbook = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 7901, root = el(svg, 'g');
      const desk = inkEl(root, WOOD()), grain = inkEl(root, mix(WOOD(), INK.ink, 0.25));
      const shadow = inkEl(root, mix(WOOD(), INK.ink, 0.35)), pages = inkEl(root, INK.paperLight), pagesR = inkEl(root), txt = inkEl(root, INK.inkSoft);
      const N = P.n ?? 8, SK = Array.from({ length: N }, (_, i) => ({ g: el(root, 'g') }));
      SK.forEach((s, i) => { s.c = comet(s.g, sd + 20 + i); });
      const chart = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.35)), chartR = inkEl(root), chartS = inkEl(root, INK.inkSoft);
      const pot = inkEl(root, mix(INK.ink, INK.blue, 0.25)), potR = inkEl(root), quill = inkEl(root, INK.paperLight), quillR = inkEl(root);
      const candle = inkEl(root, INK.paperLight), dish = inkEl(root, mix(INK.gold, INK.stain, 0.4)), candleR = inkEl(root), fl = flame(el(root, 'g'), sd + 5);
      const C = Object.assign({ x: 0.74, y: 0.14, size: 230 }, P.counter || {});
      const ctr = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': C.size, 'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 18px; stroke-linejoin: round` });
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.7));
          fill(desk, [[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], k + 1, t, 0.3, false);
          const G = []; for (let i = 0; i < 16; i++) { const y = 40 + i * 120 + Math.sin(i * 2.3) * 30, pts = []; for (let j = 0; j <= 8; j++) pts.push([-40 + j * (W + 80) / 8, y + Math.sin(j * 1.3 + i) * 12]); G.push(lineS(pts, k + 2 + i, t, 2.5, 0.4)); }
          grain.setAttribute('d', G.join(' '));
          // open book (above the caption band)
          const by0 = 330, by1 = 1140, pl = [[60, by0 + 20], [536, by0], [540, by1 - 10], [70, by1]], pr = [[544, by0], [1020, by0 + 20], [1010, by1], [540, by1 - 10]];
          fill(shadow, [[50, by0 + 40], [1040, by0 + 40], [1036, by1 + 30], [54, by1 + 30]], k + 20, t, 0.4, false);
          pages.setAttribute('d', loopS(pl, k + 21, t, 0.4, false) + ' ' + loopS(pr, k + 22, t, 0.4, false));
          pagesR.setAttribute('d', [ringS(pl, k + 23, t, 4, 0.4, false), ringS(pr, k + 24, t, 4, 0.4, false), lineS([[540, by0], [540, by1 - 10]], k + 25, t, 5)].join(' '));
          const T = []; [[100, 500], [580, 980]].forEach(([x0, x1], j) => { for (let i = 0; i < 4; i++) { const y = by0 + 330 + i * 190; T.push(lineS([[x0, y + 70], [x1 - 40 - (i % 2) * 60, y + 66]], k + 30 + j * 10 + i, t, 2.2, 0.4)); } });
          txt.setAttribute('d', T.join(' '));
          // eight comet sketches, one after another
          const a = atOr(cues, P.at ?? 'cnt', 0.15), d = P.dur ?? 1.4;
          let shown = 0;
          SK.forEach((s, i) => {
            const col = i % 2, row = Math.floor(i / 2) % 4, page = i < N / 2 ? 0 : 1, li = i % (N / 2);
            const x = (page ? 610 : 130) + (li % 2) * 220, y = by0 + 120 + Math.floor(li / 2) * 360 + (li % 2) * 40; void col; void row;
            const ap = a + i * d / N, q = lt >= ap ? spring(lt, ap, 0.45) : 0; if (lt >= ap) shown = i + 1;
            s.g.setAttribute('opacity', clamp01(q * 3).toFixed(3));
            s.c.update(t, { x, y, len: 200, ang: -16 - (i % 3) * 8, r: 18, p: clamp01(q) });
          });
          ctr.textContent = String(shown);
          const sp = lt >= a ? spring(lt, a, 0.5) : 0, pk = punch(lt, a + d, 0.6), b = boil(k + 40, t, 1.2);
          ctr.setAttribute('opacity', clamp01(sp * 3).toFixed(3));
          ctr.setAttribute('transform', `translate(${f1(C.x * W + b[0])} ${f1(C.y * H + C.size * 0.35 + b[1])}) scale(${(lerp(0.5, 1, sp) * (1 + 0.12 * pk + 0.06 * hit)).toFixed(3)})`);
          // rolled star chart, inkpot + quill, candle (below the caption band)
          const cp = [[40, 1400], [640, 1370], [660, 1520], [52, 1550]];
          fill(chart, cp, k + 50, t, 0.4, false);
          const CS = [ringS(cp, k + 51, t, 4, 0.4, false), ringS(ell(52, 1475, 30, 78, 10), k + 52, t, 4, 0.4)];
          const CD = []; for (let i = 0; i < 9; i++) { const x = 120 + hn(sd + i, 7) * 480, y = 1410 + hn(sd + i, 8) * 110; CD.push(loopS(ell(x, y, 6, 6, 6), k + 60 + i, t, 0.3)); }
          for (let i = 0; i < 4; i++) CS.push(lineS([[120 + i * 120, 1420 + hn(i, 3) * 60], [240 + i * 120, 1440 + hn(i, 4) * 60]], k + 70 + i, t, 2, 0.4));
          chartR.setAttribute('d', CS.join(' ')); chartS.setAttribute('d', CD.join(' '));
          const px = 300, py = 1760;
          pot.setAttribute('d', loopS(ell(px, py, 90, 80, 14), k + 80, t, 0.5));
          potR.setAttribute('d', ringS(ell(px, py, 90, 80, 14), k + 81, t, 5, 0.5) + ' ' + ringS(ell(px, py - 6, 40, 34, 10), k + 82, t, 4, 0.5));
          const qs = Math.sin(t * 1.2) * 6, qp = [[px + 10, py - 20], [px + 120 + qs, py - 200], [px + 270 + qs, py - 330], [px + 320 + qs, py - 350], [px + 230 + qs, py - 210], [px + 60, py - 50]];
          fill(quill, qp, k + 83, t, 0.6);
          quillR.setAttribute('d', ringS(qp, k + 84, t, 3.5, 0.6) + ' ' + lineS([[px + 10, py - 20], [px + 300 + qs, py - 340]], k + 85, t, 3, 0.5));
          const cx = 860, cy = 1700;
          dish.setAttribute('d', loopS(ell(cx, cy, 140, 120, 16), k + 90, t, 0.5));
          candle.setAttribute('d', loopS(ell(cx, cy, 48, 44, 12), k + 91, t, 0.4));
          candleR.setAttribute('d', ringS(ell(cx, cy, 140, 120, 16), k + 92, t, 5, 0.5) + ' ' + ringS(ell(cx, cy, 48, 44, 12), k + 93, t, 4, 0.4) + ' ' + lineS([[cx + 140, cy], [cx + 200, cy + 10], [cx + 200, cy + 50]], k + 94, t, 8));
          fl.update(t, cx, cy - 4, 1.4, 170);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== ch_court
  SH.ch_court = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 8101, gy = (P.ground ?? 0.6) * H, root = el(svg, 'g');
      const castle = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.35)), castleR = inkEl(root, INK.inkSoft), flag = inkEl(root, INK.red), flagR = inkEl(root, INK.ink), pole = inkEl(root, INK.ink);
      const path_ = inkEl(root, mix(INK.paperDark, INK.paperLight, 0.4)), pathR = inkEl(root, INK.inkSoft);
      const robe = inkEl(root, mix(INK.red, INK.paperDark, 0.15)), robeR = inkEl(root), ermine = inkEl(root, INK.paperLight), ermD = inkEl(root);
      const king = person(el(root, 'g'), P.king || { x: 0.3, y: P.ground ?? 0.6, face: 'right', pose: 'point', dir: 'forward', accessory: 'crown', scale: 1.15 }, sd + 2);
      const carol = P.carol ? person(el(root, 'g'), P.carol, sd + 3) : null;
      const scrollG = el(root, 'g'), scroll = inkEl(scrollG, INK.paperLight), scrollR = inkEl(scrollG), seal = inkEl(scrollG, INK.red);
      const hed = hedge(el(root, 'g'), sd + 4, W, H, P.hedge ?? 1640);
      const flowers = inkEl(root, INK.red), flowersY = inkEl(root, INK.gold);
      const labs = labels(el(root, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          // Windsor Castle on the far hill (right): the round tower on its mound, curtain walls, towers
          const cy0 = gy - 150, CX = P.castleX ?? 640;
          const sil = [[CX - 330, cy0], [CX - 330, cy0 - 120], [CX - 300, cy0 - 120], [CX - 300, cy0 - 140], [CX - 270, cy0 - 140], [CX - 270, cy0 - 120], [CX - 200, cy0 - 120], [CX - 200, cy0 - 180], [CX - 150, cy0 - 180], [CX - 150, cy0 - 120],
            [CX - 70, cy0 - 120], [CX - 70, cy0 - 200], [CX - 60, cy0 - 290], [CX + 80, cy0 - 290], [CX + 90, cy0 - 200], [CX + 90, cy0 - 120], [CX + 170, cy0 - 120], [CX + 170, cy0 - 190], [CX + 220, cy0 - 190], [CX + 220, cy0 - 120], [CX + 360, cy0 - 120], [CX + 360, cy0]];
          fill(castle, sil, k + 1, t, 0.5, false);
          const CR = [ringS(sil, k + 2, t, 3.5, 0.5, false)];
          for (let i = 0; i < 6; i++) CR.push(lineS([[CX - 60 + i * 26, cy0 - 290], [CX - 60 + i * 26, cy0 - 306]], k + 3 + i, t, 6, 0.4));
          [[CX - 250, cy0 - 70], [CX - 175, cy0 - 140], [CX + 10, cy0 - 230], [CX + 195, cy0 - 150], [CX + 280, cy0 - 70]].forEach(([x, y], i) => CR.push(lineS([[x, y], [x, y + 30]], k + 10 + i, t, 6, 0.4)));
          castleR.setAttribute('d', CR.join(' '));
          pole.setAttribute('d', lineS([[CX + 10, cy0 - 286], [CX + 10, cy0 - 396]], k + 16, t, 6) + ' ' + loopS(ell(CX + 10, cy0 - 400, 8, 8, 6), k + 18, t, 0.4));
          const fw = Math.sin(t * 3) * 10;
          const fp = [[CX + 13, cy0 - 392], [CX + 60, cy0 - 384 + fw * 0.4], [CX + 104, cy0 - 388 + fw * 0.6], [CX + 98 + fw * 0.3, cy0 - 352], [CX + 56, cy0 - 356 + fw * 0.4], [CX + 13, cy0 - 352]];
          flag.setAttribute('d', loopS(fp, k + 17, t, 0.6, false));
          flagR.setAttribute('d', ringS(fp, k + 19, t, 3.5, 0.6, false));
          // gravel path towards the castle
          const pp = [[440, gy - 20], [640, gy - 20], [1000, H + 40], [80, H + 40]];
          fill(path_, pp, k + 20, t, 0.5, false);
          const PR = [lineS([[440, gy - 20], [80, H + 40]], k + 21, t, 3.5), lineS([[640, gy - 20], [1000, H + 40]], k + 22, t, 3.5)];
          for (let i = 0; i < 18; i++) { const u = hn(sd + i, 1), v = Math.pow(hn(sd + i, 2), 0.6), y = lerp(gy + 20, H - 100, v), x = lerp(lerp(450, 90, v), lerp(630, 990, v), u); PR.push(loopS(ell(x, y, 5 + v * 6, 3 + v * 3, 6), k + 30 + i, t, 0.3)); }
          pathR.setAttribute('d', PR.join(' '));
          // king (crown + red robe with ermine collar) and Caroline
          const kr = king.update(lt, t, cues, W, H), ks = king.K.scale ?? 1;
          const rx = kr.x, ry = kr.y;
          const rb = [[rx - 50 * ks, ry - 318 * ks], [rx + 50 * ks, ry - 318 * ks], [rx + 108 * ks, ry - 20 * ks], [rx - 108 * ks, ry - 20 * ks]];
          fill(robe, rb, k + 40, t, 0.5, false);
          robeR.setAttribute('d', ringS(rb, k + 41, t, 5, 0.5, false));
          const er = [[rx - 66 * ks, ry - 330 * ks], [rx + 66 * ks, ry - 330 * ks], [rx + 54 * ks, ry - 282 * ks], [rx - 54 * ks, ry - 282 * ks]];
          fill(ermine, er, k + 42, t, 0.5);
          ermD.setAttribute('d', ringS(er, k + 43, t, 3.5, 0.5) + ' ' + [0, 1, 2, 3, 4].map(i => loopS(ell(rx - 44 * ks + i * 22 * ks, ry - 306 * ks + (i % 2) * 10, 4, 7, 6), k + 44 + i, t, 0.3)).join(' '));
          const cr = carol ? carol.update(lt, t, cues, W, H) : null;
          // the sealed scroll travels from his hand to hers
          const ga = atOr(cues, P.give, dur * 0.4), gp = lt >= ga ? progIO(lt, ga, 0.9) : 0;
          const from = kr.hand, to = cr ? cr.hand : [from[0] + 200, from[1]];
          const sx = lerp(from[0], to[0], gp), sy = lerp(from[1], to[1], gp) - Math.sin(gp * Math.PI) * 60 - 10;
          const sp = [[sx - 64, sy - 26], [sx + 64, sy - 30], [sx + 66, sy + 26], [sx - 62, sy + 30]];
          fill(scroll, sp, k + 60, t, 0.5);
          scrollR.setAttribute('d', ringS(sp, k + 61, t, 4, 0.5) + ' ' + ringS(ell(sx - 64, sy, 12, 30, 8), k + 62, t, 3.5, 0.5) + ' ' + ringS(ell(sx + 65, sy - 2, 12, 30, 8), k + 63, t, 3.5, 0.5));
          seal.setAttribute('d', loopS(ell(sx, sy + 34, 20, 18, 9), k + 64, t, 0.5) + ' ' + loopS([[sx - 10, sy + 44], [sx - 22, sy + 84], [sx - 4, sy + 74]], k + 65, t, 0.4, false) + ' ' + loopS([[sx + 8, sy + 44], [sx + 22, sy + 84], [sx + 4, sy + 74]], k + 66, t, 0.4, false));
          hed.update(t);
          const FL = [], FY = []; for (let i = 0; i < 14; i++) { const x = 30 + i * 76 + Math.sin(i * 3.1) * 20, y = (P.hedge ?? 1640) + 20 + (i % 3) * 60 + Math.sin(t * 1.5 + i) * 3; FL.push(loopS(ell(x, y, 15, 13, 7), k + 70 + i, t, 0.5)); FY.push(loopS(ell(x, y, 5, 5, 6), k + 90 + i, t, 0.3)); }
          flowers.setAttribute('d', FL.join(' ')); flowersY.setAttribute('d', FY.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
