// pw_pig: shots for the Pig War Short (Stickstory 2026-10-28): San Juan Island, 1859, a shot pig, two armies, no war.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any farm quarrel / border standoff story.
// Uses td__lib.js (TD.label, TD.figure) at build time. Period figures go in params.figs (hat: false, NOT params.cast:
// lint counts cast as the narrator); the narrator (fez) comes from params.kasif.
//
// K (figure) = TD.figure spec {x, y (ground, 0..1), scale, pose, face: "left"|"right", dir, emotion, accessory,
//              seq: [{at, pose, dir, face, emotion}]} (+ pw extras: rifle: true, aim: [x, y] 0..1, bicorne: true)
// L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
// Lines      = [{words: [...], at: [cue...], y, size}] + highlight: "PIG." (giant Fraunces words, highlight in a red box)
//
// SHOTS.pw_farm — side view of a settler's farm: potato rows from the ground line to the frame bottom (perspective),
//   a split-rail fence, a log cabin with a smoking chimney, a far warship on the bay, a pig rooting in the potatoes,
//   the farmer with a rifle (cue "shot": muzzle flash + smoke, the pig keels over legs-up), a grave marker with
//   US / UK flags, the narrator, labels and giant words.
//   P: {ground: 0.6, rows: 6, fence: {x0: 0, x1: 1} | false, cabin: {x: 0.16, s: 1} | false,
//       ship: {x: 0.72, y: 0.5 (waterline), s: 0.45, face: -1} | false, pig: {x: 0.6, y, s: 1, face: -1, root: 1, die: cue|s,
//       dead: false} | false, farmer: K | false, shot: cue|s, grave: {x: 0.5, y, s: 1, text: "PIG", year: "1859",
//       flags: true, at} | false, kasif: K | false, labels: [L], lines, highlight, close: {focus: [x, y], zoom, to} (world only)}
// SHOTS.pw_close — close-up on the ground: the pig lying legs-up in the potato soil fills the frame, an ear tag with
//   the owner's initials, a small flag on a stake pops in (cue "flag").
//   P: {pig: {x: 0.5, y: 0.66, s: 2.6, tag: "HBC"}, flag: {kind: "uk"|"us", x: 0.8, y: 0.66, s: 1.4, at}, soil: 0.58, labels: [L]}
// SHOTS.pw_chart — full-frame old sea chart of a disputed island between two coasts (default: San Juan Islands,
//   Haro and Rosario straits): land, wave strokes, graticule, compass, two dashed claim lines drawing in (cues
//   "us", "uk") with mini flags, the island pulsing with a big red "?" (cue "q").
//   P: {land: [[[u, v]...]...] (0..1 frame), island: [[u, v]...], claims: [{pts, color: "red"|"blue", flag: "us"|"uk",
//       label, lx, ly, at}], name: {text: "SAN JUAN", x, y}, q: {x, y, at}, labels: [L]}
// SHOTS.pw_camp — army camp behind an earthwork: A-tents, cannons on the redoubt, a flag on a tall pole, rows of
//   soldiers marching in (kepi caps, rifles), a big counter.
//   P: {ground: 0.6, flag: {kind: "us", x: 0.82}, guns: [{x, s}], rows: [{y, n, s, x0, x1, at}],
//       counter: {from: 0, to: 400, suffix: "+", x: 0.6, y: 0.24, at, dur: 1.6, size: 200}, labels: [L]}
// SHOTS.pw_deck — eye level on a frigate's deck: plank deck to the frame bottom, bulwark with a gunport, a mast with
//   shrouds, a big cannon on its carriage, a far shore on the horizon, the admiral (bicorne), the narrator, labels,
//   giant words. P: {deck: 0.62, horizon: 0.42, cannon: {x: 0.7, s: 1}, shore: true, admiral: K, kasif: K, labels,
//   lines, highlight, close: {focus, zoom, to}}
// cues: hit (punch), shot, die, flag, us, uk, q, counter.at, rows[].at, labels / seq / words "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const fill = (e, pts, sd, t, amp = 1, smooth = true) => e.setAttribute('d', inkLoop(pts, { seed: sd, t, amp, smooth }));
  const ringS = (pts, sd, t, w = 5, amp = 1, smooth = true) => inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth });
  const lineS = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const loopS = (pts, sd, t, amp = 1, smooth = true) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const rotP = (p, c, deg) => { const a = deg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * cs - dy * sn, c[1] + dx * sn + dy * cs]; };
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);
  const PINK = () => mix(INK.paperLight, INK.red, 0.24);
  const LEAF = () => mix(INK.green, INK.paperLight, 0.15);

  // ------------------------------------------------------------------ pig (side view, facing +x, ground y = 0, ~380 units long)
  function pig(parent, sd) {
    const g = el(parent, 'g');
    const legF = inkEl(g, mix(PINK(), INK.ink, 0.12)), legR = inkEl(g), body = inkEl(g, PINK()), bodyR = inkEl(g), spots = inkEl(g, INK.stain, { 'fill-opacity': 0.55 });
    const head = inkEl(g, PINK()), headR = inkEl(g), ear = inkEl(g, mix(PINK(), INK.red, 0.18)), snout = inkEl(g, mix(PINK(), INK.red, 0.25)), tag = inkEl(g, INK.gold), inkE = inkEl(g), eyes = inkEl(g);
    return {
      update(t, o) {
        const s = o.s ?? 1, face = o.face ?? 1, x = o.x, y = o.y, k = sd * 13;
        const dead = clamp01(o.dead || 0), root = o.root ?? 0;
        const hb = dead > 0 ? -6 : root * (10 + 9 * Math.sin(t * 7.5));
        const piv = [0, -108], deg = dead * 180;
        const W = p => { const q = deg ? rotP(p, piv, deg) : p; return [x + face * q[0] * s, y + q[1] * s - (dead > 0 ? Math.sin(dead * Math.PI) * 60 * s : 0)]; };
        const Hd = p => W(rotP(p, [96, -150], hb));
        const legs = [-104, -64, 72, 112], LP = [], TP = [];
        legs.forEach((lx, i) => {
          const sw = (o.walk ? Math.sin(t * 9 + i * 1.7 + (i % 2) * 3) * 14 : 0) + (dead > 0.9 ? Math.sin(t * 5 + i) * 3 : 0);
          LP.push([[lx - 15, -90], [lx + 15, -90], [lx + 13 + sw, -12], [lx - 13 + sw, -12]]);
          TP.push([[lx - 14 + sw, -16], [lx + 14 + sw, -16], [lx + 15 + sw, 0], [lx - 15 + sw, 0]]);
        });
        legF.setAttribute('d', LP.map((q, i) => loopS(q.map(W), k + i, t, 1, false)).join(' '));
        legR.setAttribute('d', LP.map((q, i) => ringS(q.map(W), k + 30 + i, t, 4, 1, false)).concat(TP.map((q, i) => loopS(q.map(W), k + 35 + i, t, 0.6, false))).join(' '));
        const bp = ell(0, -132, 158, 90, 20);
        fill(body, bp.map(W), k + 10, t);
        const tail = []; for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2.4 + Math.sin(t * 9) * 0.3, r = 22 - i * 1.3; tail.push([-176 + Math.cos(a) * r - i * 2.5, -160 + Math.sin(a) * r]); }
        tail.unshift([-154, -150]);
        bodyR.setAttribute('d', ringS(bp.map(W), k + 40, t, 6) + ' ' + lineS(tail.map(W), k + 44, t, 4.5));
        spots.setAttribute('d', [ell(-50, -165, 28, 15, 8), ell(10, -100, 20, 11, 8)].map((q, i) => loopS(q.map(W), k + 12 + i, t, 0.8)).join(' '));
        const hp = ell(150, -150, 62, 58, 14), np = ell(206, -142, 20, 30, 10), ep = [[118, -190], [128, -236], [162, -200]];
        fill(head, hp.map(Hd), k + 20, t);
        headR.setAttribute('d', ringS(hp.map(Hd), k + 41, t, 6));
        fill(ear, ep.map(Hd), k + 22, t, 0.8);
        fill(snout, np.map(Hd), k + 21, t);
        inkE.setAttribute('d', [ringS(ep.map(Hd), k + 43, t, 4.5, 0.8), ringS(np.map(Hd), k + 42, t, 4.5), lineS([[178, -112], [194, -110]].map(Hd), k + 45, t, 3.5)].join(' '));
        const E = [];
        if (dead > 0.5) { const c = [168, -170]; E.push(lineS([[c[0] - 11, c[1] - 11], [c[0] + 11, c[1] + 11]].map(Hd), k + 50, t, 4.5), lineS([[c[0] + 11, c[1] - 11], [c[0] - 11, c[1] + 11]].map(Hd), k + 51, t, 4.5)); }
        else { const c = Hd([168, -170]); E.push(inkCircle(c[0], c[1], 8 * s, k + 52, t)); }
        [[208, -152], [208, -132]].forEach((p, i) => { const c = Hd(p); E.push(inkCircle(c[0], c[1], 4.5 * s, k + 53 + i, t)); });
        eyes.setAttribute('d', E.join(' '));
        const tg = Hd([140, -200]);
        tag.setAttribute('d', o.tag ? loopS(ell(tg[0], tg[1] + 26 * s, 20 * s, 24 * s, 10), k + 60, t) : '');
        return { tag: [tg[0], tg[1] + 26 * s], head: Hd([150, -150]), snout: Hd([210, -140]) };
      },
    };
  }

  // ------------------------------------------------------------------ waving flag on a pole: kind "us" | "uk"
  function flag(parent, kind, sd) {
    const g = el(parent, 'g'), base = inkEl(g, kind === 'uk' ? INK.blue : INK.red), a = inkEl(g, INK.paperLight), b = inkEl(g, kind === 'uk' ? INK.red : INK.blue), d = inkEl(g, INK.paperLight), r = inkEl(g);
    return {
      update(t, x, y, s, h, o = {}) {
        const fw = 170 * s, fh = 112 * s, top = y - h, k = sd * 7, ph = o.ph || 0;
        const F = (u, v) => [x + u * fw, top + v * fh + Math.sin(t * 4 + u * 4 + ph) * 9 * s * u];
        const quad = (u0, v0, u1, v1) => [F(u0, v0), F((u0 + u1) / 2, v0), F(u1, v0), F(u1, v1), F((u0 + u1) / 2, v1), F(u0, v1)];
        fill(base, quad(0, 0, 1, 1), k + 1, t, 0.8, false);
        if (kind === 'uk') {
          const diag = (p, q) => { const pts = []; for (let i = 0; i <= 4; i++) { const u = i / 4; pts.push(F(lerp(p[0], q[0], u), lerp(p[1], q[1], u))); } return pts; };
          a.setAttribute('d', [lineS(diag([0, 0], [1, 1]), k + 2, t, 22 * s, 0.5), lineS(diag([0, 1], [1, 0]), k + 3, t, 22 * s, 0.5)].join(' '));
          d.setAttribute('d', [loopS(quad(0.42, 0, 0.58, 1), k + 4, t, 0.5, false), loopS(quad(0, 0.36, 1, 0.64), k + 5, t, 0.5, false)].join(' '));
          b.setAttribute('d', [loopS(quad(0.46, 0, 0.54, 1), k + 6, t, 0.4, false), loopS(quad(0, 0.42, 1, 0.58), k + 7, t, 0.4, false)].join(' '));
        } else {
          const st = []; for (let i = 1; i < 6; i += 2) st.push(loopS(quad(0, i / 6.5, 1, (i + 0.85) / 6.5), k + 10 + i, t, 0.4, false));
          a.setAttribute('d', st.join(' '));
          b.setAttribute('d', loopS(quad(0, 0, 0.44, 0.54), k + 20, t, 0.5, false));
          const dots = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const c = F(0.08 + i * 0.14, 0.14 + j * 0.24); dots.push(inkCircle(c[0], c[1], 5 * s, k + 30 + i * 3 + j, t)); }
          d.setAttribute('d', dots.join(' '));
        }
        r.setAttribute('d', [lineS([[x, y], [x, top - 10 * s]], k + 40, t, 7 * s), ringS(quad(0, 0, 1, 1), k + 41, t, 4, 0.8, false), inkCircle(x, top - 14 * s, 9 * s, k + 42, t)].join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ potato rows from y0 to the frame bottom
  function potatoes(parent, sd, W, H, y0, rows, o = {}) {
    const g = el(parent, 'g'), mound = inkEl(g, mix(INK.stain, INK.paperDark, 0.35)), leaf = inkEl(g, LEAF()), spud = inkEl(g, mix(INK.gold, INK.stain, 0.5)), r = inkEl(g);
    const R = rng(sd);
    const ys = []; for (let i = 0; i < rows; i++) { const u = i / Math.max(1, rows - 1); ys.push(y0 + Math.pow(u, 1.35) * (H + 60 - y0)); }
    const plants = ys.map((y, i) => { const sc = 0.45 + (y - y0) / (H - y0) * 1.1, n = Math.max(3, Math.round(W / (150 * sc))); return Array.from({ length: n + 1 }, (_, j) => ({ x: (j + 0.2 + R() * 0.5) * W / n, y, sc, ph: R() * 6 })); });
    const dug = (o.dug || []).map(([u, v]) => [u * W, v * H]);
    return {
      update(t) {
        const M = [], L = [], S = [], k = sd * 3;
        ys.forEach((y, i) => {
          const sc = plants[i][0].sc, pts = [[-20, y + 10 * sc]];
          for (let x = 0; x <= W + 40; x += 60) pts.push([x, y - (14 + 6 * Math.sin(x * 0.03 + i)) * sc]);
          pts.push([W + 40, y + 26 * sc], [-20, y + 26 * sc]);
          M.push(loopS(pts, k + i, t, 1, true));
          S.push(lineS(pts.slice(0, pts.length - 2), k + 20 + i, t, 3.5 * Math.min(1.4, sc)));
          plants[i].forEach((p, j) => {
            const sw = Math.sin(t * 2.2 + p.ph) * 6 * p.sc, c = [p.x + sw, p.y - 40 * p.sc];
            const lf = [ell(c[0] - 26 * p.sc, c[1] + 6 * p.sc, 26 * p.sc, 16 * p.sc, 8), ell(c[0] + 26 * p.sc, c[1] + 4 * p.sc, 26 * p.sc, 16 * p.sc, 8), ell(c[0], c[1] - 18 * p.sc, 22 * p.sc, 20 * p.sc, 8)];
            lf.forEach((q, m) => { L.push(loopS(q, k + 100 + i * 50 + j * 3 + m, t, 0.8)); });
            S.push(lineS([[p.x, p.y - 12 * p.sc], [c[0], c[1]]], k + 400 + i * 50 + j, t, 3 * Math.min(1.4, p.sc)));
          });
        });
        leaf.setAttribute('d', L.join(' ')); mound.setAttribute('d', M.join(' '));
        spud.setAttribute('d', dug.map((p, i) => loopS(ell(p[0], p[1], 26, 18, 9), k + 700 + i, t, 0.8)).join(' '));
        r.setAttribute('d', S.concat(dug.map((p, i) => ringS(ell(p[0], p[1], 26, 18, 9), k + 720 + i, t, 3.5))).join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ far warship (side view, bow +x, waterline y = 0)
  function warship(parent, sd) {
    const g = el(parent, 'g'), smoke = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.3 }), hull = inkEl(g, mix(INK.ink, INK.inkSoft, 0.3)), band = inkEl(g, INK.paperLight), sails = inkEl(g, INK.paperLight), r = inkEl(g);
    return {
      update(t, x, y, s, face = 1) {
        const k = sd * 9, Wp = p => [x + face * p[0] * s, y + p[1] * s + Math.sin(t * 1.3) * 3 * s];
        const hp = [[-300, -70], [300, -76], [340, -110], [300, 12], [-290, 14], [-320, -40]];
        fill(hull, hp.map(Wp), k + 1, t);
        fill(band, [[-296, -52], [304, -58], [300, -40], [-296, -36]].map(Wp), k + 2, t, 0.6, false);
        const P = [];
        for (let i = 0; i < 9; i++) { const gx = -250 + i * 60; P.push(loopS([[gx, -52], [gx + 18, -52], [gx + 18, -38], [gx, -38]].map(Wp), k + 10 + i, t, 0.4, false)); }
        const masts = [-170, 0, 170], S = [];
        masts.forEach((mx, i) => {
          for (let j = 0; j < 2; j++) { const yy = -200 - j * 120, w = 90 - j * 20; S.push(loopS([[mx - w, yy], [mx + w, yy], [mx + w * 0.8, yy + 90], [mx - w * 0.8, yy + 90]].map(Wp), k + 30 + i * 4 + j, t, 0.8)); }
        });
        sails.setAttribute('d', S.join(' '));
        const R = [ringS(hp.map(Wp), k + 50, t, 5)].concat(masts.map((mx, i) => lineS([[mx, -76], [mx, -380 + Math.abs(mx) * 0.2]].map(Wp), k + 51 + i, t, 6)));
        masts.forEach((mx, i) => { for (let j = 0; j < 2; j++) { const yy = -200 - j * 120, w = 90 - j * 20; R.push(ringS([[mx - w, yy], [mx + w, yy], [mx + w * 0.8, yy + 90], [mx - w * 0.8, yy + 90]].map(Wp), k + 60 + i * 4 + j, t, 3.5)); } });
        R.push(lineS([[-300, -70], [-170, -340], [0, -380], [170, -346], [340, -110]].map(Wp), k + 80, t, 2.5));
        R.push(loopS([[60, -76], [64, -170], [100, -170], [104, -76]].map(Wp), k + 81, t, 0.8, false));
        r.setAttribute('d', R.concat(P).join(' '));
        const SM = []; for (let i = 0; i < 5; i++) { const u = (t * 0.3 + i / 5) % 1, c = Wp([82 - u * 260, -180 - u * 140]); SM.push(loopS(ell(c[0], c[1], (20 + u * 50) * s, (15 + u * 30) * s, 10), k + 90 + i, t, 1.2)); }
        smoke.setAttribute('d', SM.join(' '));
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
      const gap = size * 0.32, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
      const sc = Math.min(1, (W - 120) / tot);
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

  // figure + extras (rifle, bicorne)
  function person(parent, K, sd, narrator) {
    const g = el(parent, 'g');
    const fig = window.TD.figure(el(g, 'g'), Object.assign({}, K, narrator ? {} : { hat: false }), sd);
    const rifle = inkEl(g, mix(INK.ink, INK.stain, 0.3)), hat = inkEl(g, INK.ink), hatR = inkEl(g, INK.gold);
    return {
      update(lt, t, cues, W, H, aimPt) {
        const r = fig.update(lt, t, cues, W, H), sc = K.scale ?? 1;
        if (K.rifle) {
          const tx = aimPt ? aimPt[0] : r.hand[0] + r.face * 200, ty = aimPt ? aimPt[1] : r.hand[1];
          const a = Math.atan2(ty - r.hand[1], tx - r.hand[0]), c = Math.cos(a), s = Math.sin(a), nx = -s, ny = c;
          const h = r.hand, L = 330 * sc, B = 150 * sc;
          const pts = [[h[0] - c * B + nx * 18 * sc, h[1] - s * B + ny * 18 * sc], [h[0] - c * B - nx * 6 * sc, h[1] - s * B - ny * 6 * sc], [h[0] + c * L, h[1] + s * L], [h[0] + c * L + nx * 7 * sc, h[1] + s * L + ny * 7 * sc], [h[0] - c * 30 * sc + nx * 12 * sc, h[1] - s * 30 * sc + ny * 12 * sc]];
          rifle.setAttribute('d', inkLoop(pts, { seed: sd + 3, t, smooth: false, amp: 0.6 }));
          r.muzzle = [h[0] + c * (L + 10 * sc), h[1] + s * (L + 10 * sc)];
        }
        if (K.bicorne) {
          const c = r.head, w = 120 * sc, hh = 70 * sc, y0 = c[1] - 52 * sc;
          const pts = [[c[0] - w, y0 + 4 * sc], [c[0] - w * 0.4, y0 - hh * 0.7], [c[0], y0 - hh], [c[0] + w * 0.4, y0 - hh * 0.7], [c[0] + w, y0 + 4 * sc], [c[0], y0 + 14 * sc]];
          hat.setAttribute('d', inkLoop(pts, { seed: sd + 5, t, amp: 0.8 }));
          hatR.setAttribute('d', inkPath([[c[0] - w * 0.8, y0 - 4 * sc], [c[0], y0 - 6 * sc], [c[0] + w * 0.8, y0 - 4 * sc]], { w: 5, seed: sd + 6, t }) + ' ' + inkCircle(c[0] + w * 0.2, y0 - hh * 0.55, 10 * sc, sd + 7, t));
        }
        return r;
      },
    };
  }

  // smoke puffs + flash from a muzzle at cue time a
  function gunsmoke(parent, sd) {
    const sm = inkEl(parent, INK.inkSoft, { 'fill-opacity': 0.35 }), fl = inkEl(parent, INK.gold), flR = inkEl(parent, INK.red, { 'fill-opacity': 0.8 });
    return {
      update(lt, t, a, m, s = 1) {
        if (a == null || lt < a || !m) { sm.setAttribute('d', ''); fl.setAttribute('d', ''); flR.setAttribute('d', ''); return; }
        const u = lt - a, S = [];
        for (let i = 0; i < 6; i++) { const p = clamp01((u - i * 0.04) / 2.2), c = [m[0] + (40 + i * 22) * p * s + Math.sin(i * 2) * 20, m[1] - (90 * p + i * 8) * s]; if (u > i * 0.04) S.push(loopS(ell(c[0], c[1], (30 + 70 * p) * s, (24 + 50 * p) * s, 10), sd + i, t, 1.5)); }
        sm.setAttribute('d', S.join(' '));
        const fp = u < 0.22 ? 1 - u / 0.22 : 0, st = [], st2 = [];
        for (let i = 0; i < 10; i++) { const ang = i / 10 * Math.PI * 2, rr = (i % 2 ? 90 : 30) * fp * s; st.push([m[0] + Math.cos(ang) * rr, m[1] + Math.sin(ang) * rr]); st2.push([m[0] + Math.cos(ang) * rr * 0.5, m[1] + Math.sin(ang) * rr * 0.5]); }
        fl.setAttribute('d', fp > 0 ? loopS(st, sd + 20, t, 0.5, false) : ''); flR.setAttribute('d', fp > 0 ? loopS(st2, sd + 21, t, 0.5, false) : '');
      },
    };
  }

  // log cabin (front-side view), ground y
  function cabin(parent, sd) {
    const g = el(parent, 'g'), wall = inkEl(g, mix(INK.stain, INK.paperDark, 0.3)), roof = inkEl(g, mix(INK.inkSoft, INK.stain, 0.4)), win = inkEl(g, mix(INK.ink, INK.inkSoft, 0.4)), smoke = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.3 }), r = inkEl(g);
    return {
      update(t, x, y, s) {
        const k = sd * 5, P = p => [x + p[0] * s, y + p[1] * s];
        const wp = [[-170, 0], [170, 0], [170, -200], [-170, -200]], rp = [[-200, -190], [0, -330], [200, -190]], ch = [[90, -260], [90, -360], [140, -360], [140, -225]];
        fill(wall, wp.map(P), k + 1, t, 1, false); fill(roof, rp.map(P), k + 2, t, 1, false);
        fill(win, [[-120, -150], [-60, -150], [-60, -95], [-120, -95]].map(P).concat([]), k + 3, t, 0.6, false);
        const R = [ringS(wp.map(P), k + 4, t, 5, 1, false), ringS(rp.map(P), k + 5, t, 5, 1, false), ringS(ch.map(P), k + 6, t, 4, 1, false), ringS([[20, 0], [20, -130], [100, -130], [100, 0]].map(P), k + 7, t, 4, 1, false)];
        for (let i = 1; i < 6; i++) R.push(lineS([[-170, -i * 34], [170, -i * 34]].map(P), k + 10 + i, t, 2.5));
        r.setAttribute('d', R.join(' '));
        const SM = []; for (let i = 0; i < 5; i++) { const u = (t * 0.25 + i / 5) % 1, c = P([115 + Math.sin(u * 5 + i) * 20 - u * 80, -380 - u * 260]); SM.push(loopS(ell(c[0], c[1], (18 + u * 40) * s, (14 + u * 28) * s, 10), k + 30 + i, t, 1.2)); }
        smoke.setAttribute('d', SM.join(' '));
      },
    };
  }

  function fence(parent, sd) {
    const r = inkEl(parent, mix(INK.ink, INK.stain, 0.35));
    return {
      update(t, x0, x1, y, s = 1) {
        const S = [], k = sd * 3, n = Math.max(2, Math.round((x1 - x0) / (150 * s)));
        for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); S.push(lineS([[x, y + 6], [x + 4, y - 120 * s]], k + i, t, 9 * s)); }
        for (let i = 0; i < n; i++) { const a = lerp(x0, x1, i / n), b = lerp(x0, x1, (i + 1) / n); S.push(lineS([[a - 10, y - 95 * s], [b + 10, y - 88 * s]], k + 50 + i, t, 7 * s), lineS([[a - 10, y - 50 * s], [b + 10, y - 56 * s]], k + 80 + i, t, 7 * s)); }
        r.setAttribute('d', S.join(' '));
      },
    };
  }

  function grave(parent, sd, W, H) {
    const g = el(parent, 'g'), mound = inkEl(g, mix(INK.stain, INK.paperDark, 0.2)), board = inkEl(g, mix(INK.paperDark, INK.stain, 0.3)), fl = inkEl(g, INK.red), fl2 = inkEl(g, INK.gold), r = inkEl(g);
    const t1 = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink }), t2 = el(g, 'text', { 'font-family': INK_FONT, 'text-anchor': 'middle', fill: INK.ink });
    const fU = flag(g, 'us', sd + 40), fK = flag(g, 'uk', sd + 50);
    return {
      update(lt, t, G, a) {
        const s = G.s ?? 1, x = (G.x ?? 0.5) * W, y = (G.y ?? 0.66) * H, k = sd * 3, p = lt >= a ? spring(lt, a, 0.6) : 0;
        const P = q => [x + q[0] * s, y + q[1] * s * p + (1 - p) * 0];
        fill(mound, ell(x, y + 10 * s, 230 * s, 46 * s, 16), k + 1, t);
        const bp = [[-150, -330], [150, -336], [146, -150], [-146, -146]];
        fill(board, bp.map(P), k + 2, t, 1, false);
        const R = [ringS(ell(x, y + 10 * s, 230 * s, 46 * s, 16), k + 3, t, 4), ringS(bp.map(P), k + 4, t, 5, 1, false), lineS([[0, 0], [0, -146]].map(P), k + 5, t, 22 * s), lineS([[-210, 30], [210, 30]].map(q => [x + q[0] * s, y + q[1] * s]), k + 6, t, 3)];
        const F = [], F2 = [];
        [[-170, 18], [-120, 30], [130, 26], [180, 14]].forEach((q, i) => { const c = [x + q[0] * s, y + q[1] * s - 50 * s], sw = Math.sin(t * 2 + i) * 5; R.push(lineS([[c[0], c[1] + 50 * s], [c[0] + sw, c[1]]], k + 10 + i, t, 3)); for (let j = 0; j < 5; j++) { const an = j / 5 * Math.PI * 2; F.push(loopS(ell(c[0] + sw + Math.cos(an) * 16 * s, c[1] + Math.sin(an) * 16 * s, 12 * s, 12 * s, 7), k + 20 + i * 6 + j, t, 0.6)); } F2.push(inkCircle(c[0] + sw, c[1], 9 * s, k + 60 + i, t)); });
        fl.setAttribute('d', F.join(' ')); fl2.setAttribute('d', F2.join(' '));
        r.setAttribute('d', R.join(' '));
        const b = boil(k + 70, t, 1.2), c = P([0, -240]);
        t1.textContent = G.text || 'PIG'; t1.setAttribute('font-size', 96 * s); t1.setAttribute('x', f1(c[0] + b[0])); t1.setAttribute('y', f1(c[1] + b[1]));
        t2.textContent = G.year || '1859'; t2.setAttribute('font-size', 64 * s); t2.setAttribute('x', f1(c[0] + b[0])); t2.setAttribute('y', f1(c[1] + 66 * s + b[1]));
        t1.setAttribute('opacity', p > 0.3 ? 1 : 0); t2.setAttribute('opacity', p > 0.3 ? 1 : 0);
        if (G.flags !== false) { const sp = G.spread ?? 300; fU.update(t, x - sp * s, y + 20 * s, 0.9 * s, 420 * s * p, { ph: 0 }); fK.update(t, x + sp * s, y + 20 * s, 0.9 * s, 420 * s * p, { ph: 1.5 }); }
      },
    };
  }

  // ================================================================== pw_farm
  SH.pw_farm = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 1201, top = el(svg, 'g'), root = el(top, 'g');
      const gy = (P.ground ?? 0.6) * H;
      const SP = P.ship ? Object.assign({ x: 0.72, y: 0.5, s: 0.45, face: -1 }, P.ship) : null;
      const ship = SP ? warship(el(root, 'g'), sd + 1) : null;
      const CB = P.cabin === false ? null : Object.assign({ x: 0.16, s: 1 }, P.cabin || {});
      const cab = CB ? cabin(el(root, 'g'), sd + 2) : null;
      const FE = P.fence === false ? null : Object.assign({ x0: -0.02, x1: 1.02 }, P.fence || {});
      const fen = FE ? fence(el(root, 'g'), sd + 3) : null;
      const pot = potatoes(el(root, 'g'), sd + 4, W, H, gy + 20, P.rows ?? 6, { dug: P.dug });
      const GR = P.grave ? Object.assign({ x: 0.5, y: 0.7, s: 1, at: 0.1 }, P.grave) : null;
      const gr = GR ? grave(el(root, 'g'), sd + 5, W, H) : null;
      const PG = P.pig ? Object.assign({ x: 0.6, s: 1, face: -1, root: 1 }, P.pig) : null;
      const pg = PG ? pig(el(root, 'g'), sd + 6) : null;
      const far = P.farmer ? person(el(root, 'g'), P.farmer, sd + 7, false) : null;
      const kas = P.kasif ? person(el(root, 'g'), P.kasif, sd + 8, true) : null;
      const gun = gunsmoke(el(root, 'g'), sd + 9);
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const CL = P.close ? Object.assign({ focus: [0.5, 0.5], zoom: 1.6, to: [0.5, 0.55] }, P.close) : null;
      let muzzle = null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          if (CL) {
            const z = CL.zoom * (1 + 0.05 * lt / Math.max(1, dur)), fx = CL.focus[0] * W, fy = CL.focus[1] * H;
            root.setAttribute('transform', `translate(${f1(CL.to[0] * W)} ${f1(CL.to[1] * H)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          }
          if (ship) ship.update(t, SP.x * W + lt * 6 * SP.face, SP.y * H, SP.s, SP.face);
          if (cab) cab.update(t, CB.x * W, gy + 4, CB.s);
          if (fen) fen.update(t, FE.x0 * W, FE.x1 * W, gy + 6, FE.s ?? 1);
          pot.update(t);
          if (gr) gr.update(lt, t, GR, atOr(cues, GR.at, 0.1));
          const shot = atOr(cues, P.shot, null), die = PG ? atOr(cues, PG.die, shot != null ? shot + 0.12 : null) : null;
          let pigInfo = null;
          if (pg) {
            const dead = PG.dead ? 1 : die != null && lt >= die ? progIO(lt, die, 0.5) : 0;
            const px = PG.x * W + (PG.walk ? lt * 30 * PG.face : 0);
            pigInfo = pg.update(t, { x: px, y: (PG.y ?? (gy + 140) / H) * H, s: PG.s * (1 + 0.06 * hit), face: PG.face, root: dead ? 0 : PG.root, dead, tag: PG.tag, walk: PG.walk });
          }
          if (far) { const r = far.update(lt, t, cues, W, H, pigInfo ? pigInfo.head : null); muzzle = r.muzzle; }
          if (kas) kas.update(lt, t, cues, W, H);
          gun.update(lt, t, shot, muzzle, 1);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pw_close
  SH.pw_close = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 1301, root = el(svg, 'g');
      const soilY = (P.soil ?? 0.5) * H;
      const soil = inkEl(root, mix(INK.stain, INK.paperDark, 0.45)), soilR = inkEl(root);
      const pot = potatoes(el(root, 'g'), sd + 4, W, H, soilY + 60, P.rows ?? 7, { dug: P.dug || [[0.18, 0.86], [0.27, 0.9], [0.8, 0.88]] });
      const FL = P.flag ? Object.assign({ kind: 'uk', x: 0.78, y: 0.62, s: 1.4, at: 'flag' }, P.flag) : null;
      const fg = FL ? flag(el(root, 'g'), FL.kind, sd + 7) : null;
      const PG = Object.assign({ x: 0.48, y: 0.68, s: 2.4, tag: 'HBC' }, P.pig || {});
      const pg = pig(el(root, 'g'), sd + 6);
      const tagT = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink, 'font-size': 52 });
      tagT.textContent = PG.tag || '';
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const sp = [[-20, soilY]]; for (let x = 0; x <= W + 40; x += 80) sp.push([x, soilY - 18 * Math.sin(x * 0.01 + 1)]);
          const all = sp.concat([[W + 40, H + 40], [-20, H + 40]]);
          fill(soil, all, sd + 1, t, 1);
          soilR.setAttribute('d', lineS(sp, sd + 2, t, 5));
          pot.update(t);
          const fa = FL ? atOr(cues, FL.at, dur * 0.4) : 0, fp = FL && lt >= fa ? spring(lt, fa, 0.6) : 0;
          if (fg) fg.update(t, FL.x * W, FL.y * H, FL.s, 520 * FL.s * fp / 1.4 * 1.0 + 1, { ph: 0.4 });
          const r = pg.update(t, { x: PG.x * W, y: PG.y * H, s: PG.s * (1 + 0.05 * hit), face: PG.face ?? 1, dead: 1, tag: !!PG.tag });
          // tag text sits on a paper label hanging from the ear
          const b = boil(sd + 9, t, 1);
          tagT.setAttribute('x', f1(r.tag[0] + b[0])); tagT.setAttribute('y', f1(r.tag[1] + 90 + b[1]));
          tagT.setAttribute('style', `paint-order: stroke; stroke: ${INK.gold}; stroke-width: 30px; stroke-linejoin: round`);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pw_chart
  const CHART = {
    land: [
      [[-0.1, -0.1], [0.42, -0.1], [0.4, 0.1], [0.36, 0.22], [0.335, 0.32], [0.355, 0.4], [0.33, 0.48], [0.28, 0.55], [0.18, 0.585], [0.08, 0.565], [-0.1, 0.6]],
      [[0.76, -0.1], [1.1, -0.1], [1.1, 0.74], [0.93, 0.72], [0.885, 0.62], [0.845, 0.55], [0.865, 0.45], [0.825, 0.38], [0.86, 0.28], [0.805, 0.18], [0.785, 0.08]],
      [[-0.1, 0.77], [0.2, 0.755], [0.45, 0.775], [0.62, 0.75], [0.75, 0.77], [0.88, 0.755], [1.1, 0.77], [1.1, 1.1], [-0.1, 1.1]],
      [[0.615, 0.255], [0.7, 0.235], [0.755, 0.28], [0.735, 0.34], [0.665, 0.35], [0.62, 0.31]],
      [[0.625, 0.42], [0.68, 0.425], [0.705, 0.52], [0.665, 0.565], [0.62, 0.5]],
    ],
    island: [[0.44, 0.33], [0.5, 0.315], [0.565, 0.38], [0.585, 0.46], [0.55, 0.525], [0.48, 0.52], [0.45, 0.45], [0.425, 0.39]],
    claims: [
      { pts: [[0.385, 0.05], [0.4, 0.2], [0.395, 0.4], [0.375, 0.56], [0.28, 0.66], [0.0, 0.69]], color: 'red', flag: 'us', label: 'US', lx: 0.2, ly: 0.33, at: 'us' },
      { pts: [[0.79, 0.05], [0.775, 0.22], [0.765, 0.4], [0.76, 0.56], [0.7, 0.65], [0.45, 0.7], [0.0, 0.72]], color: 'blue', flag: 'uk', label: 'UK', lx: 0.92, ly: 0.4, at: 'uk' },
    ],
  };
  SH.pw_chart = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 1401, root = el(svg, 'g');
      const X = q => [q[0] * W, q[1] * H];
      const grat = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.35 }), landE = inkEl(root, mix(INK.paperDark, INK.stain, 0.45)), hatch = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.5 }), isl = inkEl(root, mix(INK.paperDark, INK.gold, 0.35)), wav = inkEl(root, INK.inkSoft), coast = inkEl(root, INK.inkSoft), islR = inkEl(root);
      const claimsG = el(root, 'g'), CLs = (P.claims || CHART.claims).map((c, i) => {
        const pts = c.pts.map(X), dense = []; for (let a = 0; a < pts.length - 1; a++) for (let k = 0; k < 12; k++) dense.push([lerp(pts[a][0], pts[a + 1][0], k / 12), lerp(pts[a][1], pts[a + 1][1], k / 12)]);
        dense.push(pts[pts.length - 1]);
        const col = c.color === 'blue' ? INK.blue : INK.red;
        const e = el(claimsG, 'path', { fill: 'none', stroke: col, 'stroke-width': 12, 'stroke-linecap': 'round', 'stroke-dasharray': '30 22' });
        const tx = el(claimsG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 92, 'text-anchor': 'middle', fill: col, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 16px; stroke-linejoin: round` });
        tx.textContent = c.label || '';
        return { c, dense, e, tx, fl: flag(claimsG, c.flag || 'us', sd + 50 + i * 10) };
      });
      const NM = Object.assign({ text: 'SAN JUAN', x: 0.505, y: 0.6 }, P.name || {});
      const nmT = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 76, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
      nmT.textContent = NM.text;
      const Q = P.q === false ? null : Object.assign({ x: 0.505, y: 0.445, at: 'q' }, P.q || {});
      const qT = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 230, 'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 16px; stroke-linejoin: round` });
      qT.textContent = Q ? '?' : '';
      const ST = (P.straits || []).map(o => { const e = el(root, 'text', { 'font-family': INK_FONT, 'font-size': o.size || 64, 'text-anchor': 'middle', fill: INK.inkSoft, 'letter-spacing': '0.12em', style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` }); e.textContent = o.text; return { o, e }; });
      const ZM = P.zoom ? Object.assign({ focus: [0.5, 0.45], z: 1.6 }, P.zoom) : null;
      const comp = inkEl(root, INK.ink), compF = inkEl(root, INK.paperLight);
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      const R = rng(sd); const waves = Array.from({ length: 16 }, () => [R(), 0.12 + R() * 0.65]).filter(([u, v]) => !(u < 0.36 && v < 0.56) && !(u > 0.8 && v < 0.72));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const z = (ZM ? lerp(1, ZM.z, progIO(lt, 0.1, Math.max(1, dur * 0.8))) : 1) * (1 + 0.06 * lt / Math.max(1, dur)), fx = ZM ? ZM.focus[0] * W : W * 0.5, fy = ZM ? ZM.focus[1] * H : H * 0.45;
          root.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const G = []; for (let i = 1; i < 5; i++) G.push(lineS([[i * W / 5, 0], [i * W / 5, H]], k + i, t, 2, 0.6)); for (let i = 1; i < 8; i++) G.push(lineS([[0, i * H / 8], [W, i * H / 8]], k + 10 + i, t, 2, 0.6));
          grat.setAttribute('d', G.join(' '));
          const lands = P.land || CHART.land;
          landE.setAttribute('d', lands.map((q, i) => loopS(q.map(X), k + 20 + i, t, 1.2)).join(' '));
          coast.setAttribute('d', lands.map((q, i) => ringS(q.map(X), k + 30 + i, t, 4, 1.2)).join(' '));
          { const HT = []; const RR = rng(k + 5); for (let i = 0; i < 26; i++) { const x = RR() * W, y = (0.8 + RR() * 0.18) * H; HT.push(loopS([[x - 34, y + 14], [x, y - 26], [x + 34, y + 14]], k + 300 + i, t, 0.8, false)); } hatch.setAttribute('d', HT.join(' ')); }
          ST.forEach((s2, i) => { const b2 = boil(k + 400 + i, t, 1.2), a = atOr(cues, s2.o.at, 0.2), p = lt >= a ? clamp01((lt - a) * 3) : 0; s2.e.setAttribute('x', f1(s2.o.x * W + b2[0])); s2.e.setAttribute('y', f1(s2.o.y * H + b2[1])); s2.e.setAttribute('opacity', p.toFixed(3)); s2.e.setAttribute('transform', `rotate(${s2.o.rot || 0} ${f1(s2.o.x * W)} ${f1(s2.o.y * H)})`); });
          const ip = (P.island || CHART.island).map(X), pul = 1 + 0.04 * Math.sin(t * 5) + 0.1 * punch(lt, Q ? atOr(cues, Q.at, dur * 0.5) : cue(cues, 'hit', null));
          const ic = ip.reduce((a, p) => [a[0] + p[0] / ip.length, a[1] + p[1] / ip.length], [0, 0]);
          const ipz = ip.map(p => [ic[0] + (p[0] - ic[0]) * pul, ic[1] + (p[1] - ic[1]) * pul]);
          fill(isl, ipz, k + 40, t, 1); islR.setAttribute('d', ringS(ipz, k + 41, t, 7, 1));
          wav.setAttribute('d', waves.map(([u, v], i) => { const x0 = u * W + Math.sin(t * 1.2 + i) * 8, y0 = v * H, pts = []; for (let j = 0; j <= 6; j++) pts.push([x0 - 40 + j * 13, y0 + Math.sin(j * 1.6 + t * 2) * 7]); return lineS(pts, k + 50 + i, t, 3); }).join(' '));
          CLs.forEach((o, i) => {
            const a = atOr(cues, o.c.at, 0.3 + i * 0.6), p = lt >= a ? progIO(lt, a, 1.0) : 0, n = Math.max(1, Math.round(o.dense.length * p));
            o.e.setAttribute('d', p > 0 ? 'M' + o.dense.slice(0, n).map(q => `${f1(q[0])} ${f1(q[1])}`).join(' L') : '');
            o.e.setAttribute('stroke-dashoffset', f1(-t * 30));
            const lp = lt >= a ? spring(lt, a + 0.3, 0.6) : 0, lx = o.c.lx * W, ly = o.c.ly * H;
            o.tx.setAttribute('x', f1(lx)); o.tx.setAttribute('y', f1(ly + 150)); o.tx.setAttribute('opacity', clamp01(lp * 3).toFixed(3));
            o.tx.setAttribute('transform', `rotate(-4 ${f1(lx)} ${f1(ly)}) scale(1)`);
            o.fl.update(t, lx - 80, ly + 60, 0.95, 200 * lp + 0.01, { ph: i * 2 });
          });
          const b = boil(k + 70, t, 1.5);
          if (Q) { const qa = atOr(cues, Q.at, dur * 0.5), qp = lt >= qa ? spring(lt, qa, 0.6) : 0;
          qT.setAttribute('x', f1(Q.x * W + b[0])); qT.setAttribute('y', f1(Q.y * H + 80 + b[1])); qT.setAttribute('opacity', clamp01(qp * 3).toFixed(3));
          qT.setAttribute('transform', `rotate(${f1(Math.sin(t * 3) * 6)} ${f1(Q.x * W)} ${f1(Q.y * H)})`); }
          nmT.setAttribute('x', f1(NM.x * W + b[1])); nmT.setAttribute('y', f1(NM.y * H + b[0]));
          // compass rose
          const cx = 0.86 * W, cy = 0.15 * H, Rr = 80, rot = Math.sin(t * 0.6) * 6, CF = [], CI = [];
          for (let q = 0; q < 8; q++) { const an = (q * 45 + rot - 90) * Math.PI / 180, L = q % 2 ? Rr * 0.58 : Rr, wd = q % 2 ? 0.2 : 0.16;
            const tip = [cx + Math.cos(an) * L, cy + Math.sin(an) * L], l = [cx + Math.cos(an - Math.PI / 2) * Rr * wd, cy + Math.sin(an - Math.PI / 2) * Rr * wd], r2 = [cx + Math.cos(an + Math.PI / 2) * Rr * wd, cy + Math.sin(an + Math.PI / 2) * Rr * wd];
            (q % 2 ? CF : CI).push(loopS([l, tip, [cx, cy]], k + 80 + q, t, 0.6, false)); CF.push(ringS([[cx, cy], tip, r2], k + 90 + q, t, 2.5, 0.6, false)); }
          comp.setAttribute('d', CI.concat([ringS(ell(cx, cy, Rr * 0.7, Rr * 0.7, 16), k + 99, t, 3)]).join(' ')); compF.setAttribute('d', CF.join(' '));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pw_camp
  SH.pw_camp = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 1501, root = el(svg, 'g');
      const gy = (P.ground ?? 0.6) * H;
      const tents = inkEl(root, INK.paperLight), tentsR = inkEl(root);
      const FL = Object.assign({ kind: 'us', x: 0.84 }, P.flag || {}), fg = flag(el(root, 'g'), FL.kind, sd + 3);
      const mound = inkEl(root, mix(INK.stain, INK.paperDark, 0.3)), moundR = inkEl(root);
      const guns = inkEl(root, mix(INK.ink, INK.inkSoft, 0.2)), gunW = inkEl(root, mix(INK.stain, INK.ink, 0.3)), gunR = inkEl(root);
      const rows = (P.rows || [{ y: 0.64, n: 9, s: 0.55, x0: 0.06, x1: 0.94 }, { y: 0.74, n: 7, s: 0.8, x0: 0.04, x1: 0.96 }, { y: 0.95, n: 5, s: 1.35, x0: 0.02, x1: 0.98 }]).map((Rw, i) => ({
        Rw, g: el(root, 'g'), heads: null, i,
      }));
      rows.forEach(r => { r.coat = inkEl(r.g, INK.blue); r.head = inkEl(r.g, INK.paperLight); r.cap = inkEl(r.g, mix(INK.blue, INK.ink, 0.35)); r.inkE = inkEl(r.g); });
      const CT = P.counter ? Object.assign({ from: 0, to: 400, suffix: '+', x: 0.62, y: 0.25, dur: 1.6, size: 210 }, P.counter) : null;
      const ctT = CT ? el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': CT.size, 'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 18px; stroke-linejoin: round` }) : null;
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      const GN = P.guns || [{ x: 0.3, s: 1 }, { x: 0.62, s: 1 }];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // tents behind
          const TP = [], TR = [];
          for (let i = 0; i < 6; i++) { const x = (0.08 + i * 0.15) * W, y = gy - 70, w = 70, h = 90; const q = [[x - w, y], [x, y - h], [x + w, y]]; TP.push(loopS(q, k + i, t, 0.8, false)); TR.push(ringS(q, k + 10 + i, t, 3.5, 0.8, false), lineS([[x, y - h], [x + 6, y]], k + 20 + i, t, 2.5)); }
          tents.setAttribute('d', TP.join(' ')); tentsR.setAttribute('d', TR.join(' '));
          fg.update(t, FL.x * W, gy - 40, 1.35, 560, {});
          // redoubt (earthwork) with logs
          const mp = [[-30, gy + 40], [W * 0.05, gy - 60], [W * 0.95, gy - 64], [W + 30, gy + 40]];
          fill(mound, mp.concat([[W + 30, gy + 80], [-30, gy + 80]]), k + 30, t, 1, false);
          const MR = [lineS(mp, k + 31, t, 5)]; for (let i = 0; i < 9; i++) { const x = (0.1 + i * 0.1) * W; MR.push(lineS([[x, gy - 50], [x + 40, gy - 50]], k + 40 + i, t, 3)); }
          moundR.setAttribute('d', MR.join(' '));
          // cannons on top, recoil wiggle
          const GB = [], GW = [], GR = [];
          GN.forEach((g2, i) => { const x = g2.x * W, y = gy - 64, s = g2.s ?? 1, rec = Math.sin(t * 2 + i) * 3;
            const bp = [[x - 60 * s + rec, y - 40 * s], [x + 120 * s + rec, y - 62 * s], [x + 122 * s + rec, y - 38 * s], [x - 58 * s + rec, y - 14 * s]];
            GB.push(loopS(bp, k + 50 + i, t, 0.6, false)); GR.push(ringS(bp, k + 55 + i, t, 3.5, 0.6, false));
            const wc = [x - 10 * s, y - 20 * s]; GW.push(loopS(ell(wc[0], wc[1], 34 * s, 34 * s, 12), k + 60 + i, t, 0.8)); GR.push(ringS(ell(wc[0], wc[1], 34 * s, 34 * s, 12), k + 65 + i, t, 4), lineS([[wc[0] - 30 * s, wc[1]], [wc[0] + 30 * s, wc[1]]], k + 70 + i, t, 2.5)); });
          guns.setAttribute('d', GB.join(' ')); gunW.setAttribute('d', GW.join(' ')); gunR.setAttribute('d', GR.join(' '));
          // soldiers march in row by row
          rows.forEach((r, ri) => {
            const Rw = r.Rw, a = atOr(cues, Rw.at, 0.05 + ri * 0.35), s = Rw.s, y = Rw.y * H, C = [], Hh = [], Cp = [], I = [];
            for (let j = 0; j < Rw.n; j++) {
              const tx = lerp(Rw.x0, Rw.x1, Rw.n > 1 ? j / (Rw.n - 1) : 0.5) * W, p = lt >= a ? progIO(lt, a + j * 0.05, 1.1) : 0;
              if (p <= 0) continue;
              const x = tx - (1 - p) * W * 0.7, walking = p < 1, ph = t * 7 + j, sw = walking ? Math.sin(ph) * 14 * s : 0, bob = walking ? Math.abs(Math.sin(ph)) * 6 * s : Math.sin(t * 2 + j) * 1.5 * s, sk = k + 100 + ri * 200 + j * 9;
              const yy = y - bob;
              C.push(inkPath([[x, yy - 150 * s], [x, yy - 82 * s]], { w: 30 * s, seed: sk, t, amp: 0.6 }));
              Hh.push(inkCircle(x + 2 * s, yy - 172 * s, 22 * s, sk + 1, t));
              Cp.push(loopS([[x - 20 * s, yy - 184 * s], [x + 22 * s, yy - 190 * s], [x + 18 * s, yy - 214 * s], [x - 14 * s, yy - 208 * s]], sk + 2, t, 0.6, false));
              I.push(inkPath(ell(x + 2 * s, yy - 172 * s, 22 * s, 22 * s, 12), { w: 3.5, seed: sk + 3, t, closed: true, amp: 0.6 }));
              I.push(lineS([[x - 22 * s, yy - 184 * s], [x + 34 * s, yy - 188 * s]], sk + 4, t, 4 * Math.max(0.8, s)));
              I.push(lineS([[x, yy - 84 * s], [x - 12 * s + sw, y]], sk + 5, t, 7 * s), lineS([[x, yy - 84 * s], [x + 12 * s - sw, y]], sk + 6, t, 7 * s));
              I.push(lineS([[x, yy - 140 * s], [x + 20 * s, yy - 104 * s], [x + 22 * s, yy - 120 * s]], sk + 7, t, 6 * s));
              I.push(lineS([[x + 22 * s, yy - 70 * s], [x + 24 * s, yy - 236 * s]], sk + 8, t, 6 * s), lineS([[x + 24 * s, yy - 236 * s], [x + 25 * s, yy - 270 * s]], sk + 9, t, 2.5 * Math.max(1, s)));
            }
            r.coat.setAttribute('d', C.join(' ')); r.head.setAttribute('d', Hh.join(' ')); r.cap.setAttribute('d', Cp.join(' ')); r.inkE.setAttribute('d', I.join(' '));
          });
          if (ctT) {
            const a = atOr(cues, CT.at, 0.2), p = lt >= a ? progIO(lt, a, CT.dur) : 0, v = Math.round(lerp(CT.from, CT.to, p)), b = boil(k + 90, t, 1.5);
            ctT.textContent = v + (p >= 1 ? CT.suffix : '');
            ctT.setAttribute('x', f1(CT.x * W + b[0])); ctT.setAttribute('y', f1(CT.y * H + b[1]));
            ctT.setAttribute('transform', `rotate(-3 ${f1(CT.x * W)} ${f1(CT.y * H)}) translate(${f1(CT.x * W * (1 - (1 + 0.1 * hit)))} ${f1(CT.y * H * (1 - (1 + 0.1 * hit)))}) scale(${(1 + 0.1 * hit).toFixed(3)})`);
          }
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== pw_deck
  SH.pw_deck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 1601, top = el(svg, 'g'), root = el(top, 'g');
      const dy = (P.deck ?? 0.62) * H, hz = (P.horizon ?? 0.42) * H;
      const shore = inkEl(root, mix(INK.paperDark, INK.green, 0.25)), shoreR = inkEl(root);
      const fS = P.shore === false ? null : flag(el(root, 'g'), 'us', sd + 2);
      const mast = inkEl(root, mix(INK.stain, INK.ink, 0.35)), ropes = inkEl(root, mix(INK.ink, INK.stain, 0.3));
      const bulw = inkEl(root, mix(INK.stain, INK.paperDark, 0.25)), port = inkEl(root, mix(INK.ink, INK.inkSoft, 0.2)), deck = inkEl(root, mix(INK.paperDark, INK.stain, 0.45)), dR = inkEl(root);
      const CN = Object.assign({ x: 0.7, s: 1 }, P.cannon || {});
      const cbar = inkEl(root, mix(INK.ink, INK.inkSoft, 0.15)), ccar = inkEl(root, mix(INK.stain, INK.ink, 0.25)), cR = inkEl(root);
      const adm = P.admiral ? person(el(root, 'g'), Object.assign({ bicorne: true }, P.admiral), sd + 7, false) : null;
      const kas = P.kasif ? person(el(root, 'g'), P.kasif, sd + 8, true) : null;
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const CL = P.close ? Object.assign({ focus: [0.5, 0.5], zoom: 1.5, to: [0.5, 0.6] }, P.close) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const sway = Math.sin(t * 1.1) * 1.2;
          let tf = `rotate(${f1(sway)} ${f1(W / 2)} ${f1(H)})`;
          if (CL) { const z = CL.zoom * (1 + 0.05 * lt / Math.max(1, dur)), fx = CL.focus[0] * W, fy = CL.focus[1] * H; tf += ` translate(${f1(CL.to[0] * W)} ${f1(CL.to[1] * H)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`; }
          root.setAttribute('transform', tf);
          if (fS) {
            const sp = [[W * 0.35, hz + 6], [W * 0.45, hz - 40], [W * 0.6, hz - 70], [W * 0.78, hz - 50], [W * 0.95, hz - 30], [W * 1.05, hz + 6]];
            fill(shore, sp, k + 1, t, 1); shoreR.setAttribute('d', lineS(sp.slice(0, -1).concat([[W * 1.05, hz + 6]]), k + 2, t, 3));
            fS.update(t, W * 0.6, hz - 66, 0.32, 70, {});
          }
          // mast + shrouds at the left
          const mx = W * (P.mast_x ?? 0.92), sx = mx > W / 2 ? -1 : 1;
          fill(mast, [[mx - 34, -40], [mx + 34, -40], [mx + 40, dy + 40], [mx - 40, dy + 40]], k + 3, t, 0.8, false);
          const RP = []; for (let i = 0; i < 5; i++) RP.push(lineS([[mx + 20 * sx, 300 + i * 30], [mx + sx * W * (0.18 + i * 0.07), dy - 150]], k + 10 + i, t, 3.5));
          RP.push(lineS([[mx - 34, -40], [mx - 40, dy + 40]], k + 20, t, 5), lineS([[mx + 34, -40], [mx + 40, dy + 40]], k + 21, t, 5));
          ropes.setAttribute('d', RP.join(' '));
          // bulwark with a gunport
          const bt = dy - 170, gx = CN.x * W + 230 * CN.s;
          fill(bulw, [[-20, bt], [W + 20, bt - 6], [W + 20, dy], [-20, dy]], k + 30, t, 1, false);
          if (P.port) fill(port, [[gx - 70, bt + 40], [gx + 70, bt + 38], [gx + 70, bt + 140], [gx - 70, bt + 142]], k + 31, t, 0.6, false);
          // deck planks to the bottom
          fill(deck, [[-20, dy], [W + 20, dy], [W + 20, H + 30], [-20, H + 30]], k + 32, t, 1, false);
          const D = [lineS([[-20, bt], [W + 20, bt - 6]], k + 33, t, 9), lineS([[-20, dy], [W + 20, dy]], k + 34, t, 5)];
          for (let i = 1; i < 3; i++) D.push(lineS([[-20, bt + i * 56], [W + 20, bt + i * 56 - 4]], k + 35 + i, t, 2.5));
          const vx = W * 0.5, vy = dy - 900;
          for (let i = -6; i <= 6; i++) { const bx = W * 0.5 + i * 230; const u = (dy - vy) / (H + 30 - vy); D.push(lineS([[lerp(vx, bx, u), dy], [bx, H + 30]], k + 40 + i, t, 3)); }
          for (let i = 1; i < 5; i++) { const y = dy + Math.pow(i / 5, 1.6) * (H - dy); D.push(lineS([[-20, y], [W + 20, y]], k + 60 + i, t, 2)); }
          if (P.port) D.push(ringS([[gx - 70, bt + 40], [gx + 70, bt + 38], [gx + 70, bt + 140], [gx - 70, bt + 142]], k + 70, t, 4, 0.6, false));
          dR.setAttribute('d', D.join(' '));
          // cannon on its carriage, barrel to the gunport
          const s = CN.s, cx = CN.x * W, cy = dy + (CN.dy ?? 260) * s, rec = -Math.abs(Math.sin(t * 1.5)) * 4 - 20 * hit;
          const barrel = [[cx - 150 * s + rec, cy - 126 * s], [cx + 250 * s + rec, cy - 118 * s], [cx + 262 * s + rec, cy - 124 * s], [cx + 262 * s + rec, cy - 72 * s], [cx + 250 * s + rec, cy - 78 * s], [cx - 150 * s + rec, cy - 58 * s], [cx - 196 * s + rec, cy - 92 * s]];
          fill(cbar, barrel, k + 80, t, 0.6, false);
          const car = [[cx - 160 * s, cy - 60 * s], [cx + 120 * s, cy - 70 * s], [cx + 130 * s, cy], [cx - 170 * s, cy]];
          fill(ccar, car, k + 81, t, 0.8, false);
          const CRS = [ringS(barrel, k + 82, t, 5, 0.6, false), ringS(car, k + 83, t, 5, 0.8, false)];
          [[cx - 110 * s, cy + 10 * s], [cx + 80 * s, cy + 10 * s]].forEach((w, i) => { CRS.push(ringS(ell(w[0], w[1], 40 * s, 40 * s, 12), k + 84 + i, t, 6), inkCircle(w[0], w[1], 9 * s, k + 86 + i, t)); });
          CRS.push(lineS([[cx - 60 * s + rec, cy - 124 * s], [cx - 60 * s + rec, cy - 62 * s]], k + 88, t, 4), lineS([[cx + 200 * s + rec, cy - 120 * s], [cx + 200 * s + rec, cy - 76 * s]], k + 89, t, 4));
          cR.setAttribute('d', CRS.join(' '));
          if (adm) adm.update(lt, t, cues, W, H);
          if (kas) kas.update(lt, t, cues, W, H);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
