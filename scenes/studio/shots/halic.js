// halic: old ink map of Constantinople in 1453 (theme "parchment", brand/kit/BRAND.md §5): the Golden Horn (Haliç),
// the Bosphorus, the walled city, Galata; the harbour chain drawn link by link, Ottoman ships bumping against it,
// the overland route over the Galata hills with a ship sliding along it, ships popping up inside the Horn,
// and optionally Kaşif standing in front of the map sheet.
//
// SHOTS.halic P: {
//   chain: true,                       // draw the chain (cue "chain" = when it is drawn across)
//   bump: true,                        // an Ottoman ship sails at the chain and bounces back (cue "bump")
//   route: true,                       // dashed overland route + ship travelling along it (cue "route")
//   inside: 6,                         // ships that pop up inside the Horn (cue "inside", staggered)
//   byz: true,                         // Byzantine ships (blue pennants) waiting behind the chain
//   fleet: 4,                          // Ottoman ships (red pennants) outside in the Bosphorus
//   labels: [{text, u, v, size, rot, at}] (override; default Haliç / Boğaz / Konstantinopolis / Galata),
//   note: {text, u, v, at}             // hand-written note card (cue "note")
//   zoom: 1.2, focus: [u, v],          // slow push-in towards focus (sheet coords 0..1)
//   kasif: {x: 0.16, pose: "look", at: "cueName"|seconds, then: "shock", dir: "up-right", face: "right",
//           scale: 0.75, emotion}
// }
// cues: chain, bump, route, inside, note, kasif.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };

  // geometry in sheet coords (u right, v down)
  const WATER = [[0.70, 0.70], [0.60, 0.66], [0.48, 0.60], [0.36, 0.54], [0.22, 0.47], [0.10, 0.41], [0.0, 0.38], [-0.1, 0.37],
    [-0.1, 0.27], [0.05, 0.28], [0.16, 0.33], [0.28, 0.39], [0.40, 0.44], [0.52, 0.47], [0.62, 0.49], [0.66, 0.52],
    [0.70, 0.47], [0.73, 0.36], [0.74, 0.22], [0.76, 0.08], [0.78, -0.1],
    [0.95, -0.1], [0.92, 0.10], [0.90, 0.28], [0.92, 0.45], [0.96, 0.60], [1.1, 0.66],
    [1.1, 1.1], [-0.1, 1.1], [-0.1, 0.92], [0.1, 0.93], [0.3, 0.91], [0.5, 0.90], [0.62, 0.86], [0.72, 0.78], [0.74, 0.72]];
  const CHAIN = [[0.695, 0.69], [0.66, 0.525]];
  const ROUTE = [[0.84, 0.41], [0.74, 0.39], [0.67, 0.32], [0.58, 0.27], [0.48, 0.31], [0.41, 0.39], [0.38, 0.485]];
  const HILLS = [[0.55, 0.22], [0.64, 0.24], [0.47, 0.25], [0.60, 0.34], [0.30, 0.25], [0.12, 0.16]];
  const OUT = [[0.82, 0.60], [0.87, 0.70], [0.80, 0.78], [0.90, 0.52], [0.86, 0.84]];
  const BYZ = [[0.56, 0.575], [0.48, 0.54]];
  const IN = [[0.30, 0.45], [0.22, 0.41], [0.36, 0.50], [0.14, 0.37], [0.27, 0.49], [0.44, 0.52], [0.19, 0.44]];
  const LABELS = [{ text: 'Haliç', u: 0.31, v: 0.465, rot: 18, size: 58 }, { text: 'Boğaz', u: 0.84, v: 0.17, size: 50 },
    { text: 'Konstantinopolis', u: 0.46, v: 0.74, size: 56 }, { text: 'Galata', u: 0.52, v: 0.405, size: 52 }];

  // a small galley icon facing +x; returns stroke specs [{p, c, f, w, col}]
  function shipStrokes(s, pen) {
    const P = a => a.map(q => [q[0] * s, q[1] * s]);
    return [
      { p: P([[-1, -0.22], [1.05, -0.3], [0.7, 0.12], [-0.72, 0.12]]), c: 1, f: INK.paperDark, w: 4, sm: 0 },
      { p: P([[0, -0.26], [0, -1.25]]), w: 4 },
      { p: P([[0.06, -1.18], [0.8, -0.42], [0.06, -0.36]]), c: 1, f: INK.paperLight, w: 3.5, sm: 0 },
      { p: P([[0, -1.24], [0.2, -1.2], [0.42, -1.14]]), w: 7, col: pen },
    ];
  }

  SH.halic = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W;
      const S = portrait ? { x: 60, y: 300, w: 960, h: 830 } : { x: (W - 1040) / 2, y: 170, w: 1040, h: 700 };
      const X = (u, v) => [S.x + u * S.w, S.y + v * S.h];
      const root = el(svg, 'g'), cam = el(root, 'g');
      const pool = [];
      const mk = (parent, fill = INK.ink, extra) => { const e = inkEl(parent, fill, extra); return e; };
      // sheet + shadow
      const sheetPts = [[S.x, S.y], [S.x + S.w, S.y - 4], [S.x + S.w + 3, S.y + S.h], [S.x - 2, S.y + S.h + 3]];
      const shadow = mk(cam, rgba(INK.ink, 0.16)), sheetF = mk(cam, INK.paperLight), sheetR = mk(cam);
      const cid = 'halicclip' + seed;
      const clip = el(defs, 'clipPath', { id: cid });
      el(clip, 'rect', { x: S.x + 4, y: S.y + 4, width: S.w - 8, height: S.h - 8, rx: 8 });
      const outer = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const mg = el(outer, 'g');
      const landF = el(mg, 'rect', { x: S.x - 200, y: S.y - 200, width: S.w + 400, height: S.h + 400, fill: INK.paperDark });
      const grat = mk(mg, INK.inkSoft, { opacity: 0.25 });
      const waterF = mk(mg, INK.paperLight), waterR = mk(mg, INK.inkSoft);
      const waves = mk(mg, INK.inkSoft, { opacity: 0.6 }), hills = mk(mg, INK.inkSoft, { opacity: 0.8 });
      const city = mk(mg), cityF = mk(mg, INK.paperLight), cityF2 = mk(mg, INK.paperLight), city2 = mk(mg);
      // route
      const routeG = el(mg, 'g');
      const routeP = el(routeG, 'path', { fill: 'none', stroke: INK.red, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-dasharray': '20 16' });
      const routeHead = mk(routeG, INK.red);
      // chain
      const chainG = el(mg, 'g'), chainE = mk(chainG), chainPosts = mk(chainG, INK.ink);
      const xMark = mk(mg, INK.red);
      // ships
      const ships = [];
      const addShip = (kind, k, u, v, s, pen, face = 1) => {
        const g = el(mg, 'g'), parts = shipStrokes(s, pen).map(st => ({ st, f: st.f ? mk(g, st.f) : null, r: mk(g, st.col || INK.ink) }));
        ships.push({ kind, k, u, v, s, g, parts, face });
      };
      const fleet = P.fleet ?? 4;
      for (let k = 0; k < Math.min(fleet, OUT.length); k++) addShip('out', k, OUT[k][0], OUT[k][1], 34, INK.red, -1);
      if (P.byz !== false) BYZ.forEach((q, k) => addShip('byz', k, q[0], q[1], 30, INK.blue, 1));
      if (P.route) addShip('route', 0, ROUTE[0][0], ROUTE[0][1], 38, INK.red, -1);
      for (let k = 0; k < Math.min(P.inside || 0, IN.length); k++) addShip('in', k, IN[k][0], IN[k][1], 30, INK.red, -1);
      // labels (Patrick Hand)
      const labs = (P.labels || LABELS).map((L, k) => {
        const [x, y] = X(L.u, L.v);
        const t = el(mg, 'text', { 'font-family': INK_FONT, 'font-size': L.size || 52, 'text-anchor': 'middle', fill: L.color === 'red' ? INK.red : INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
        t.textContent = L.text;
        return { L, t, x, y, k };
      });
      // frame + compass
      const frame = mk(cam, INK.inkSoft);
      const compG = el(cam, 'g'), compF = mk(compG, INK.paperLight), compR = mk(compG, INK.inkSoft), compN = mk(compG, INK.ink), compS = mk(compG, INK.paperDark);
      const compT = el(compG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 800, 'font-size': 44, 'text-anchor': 'middle', fill: INK.ink });
      compT.textContent = 'K';
      const CC = [S.x + S.w - 100, S.y + S.h - 100];
      // note card
      let note = null;
      if (P.note) {
        const N = typeof P.note === 'string' ? { text: P.note } : P.note;
        const g = el(cam, 'g'), box = mk(g, INK.paperLight), boxR = mk(g);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': N.size || 64, 'text-anchor': 'middle', fill: INK.red });
        t.textContent = N.text;
        note = { N, g, box, boxR, t };
      }
      // Kaşif in front of the sheet
      let kas = null;
      if (P.kasif && typeof KASIF !== 'undefined') {
        const K = P.kasif, g = el(root, 'g');
        kas = { K, rig: KASIF.create(g, { scale: K.scale ?? (portrait ? 0.75 : 0.6), hat: true, seed: seed + 3 }) };
      }
      const FOC = X(...(P.focus || [0.6, 0.5]));

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = seed * 1000;
          const pin = spring(lt, 0, 0.7);
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 7)} ${f1(Math.cos(t * 0.23) * 6 + (1 - pin) * 50)})`);
          cam.style.opacity = clamp01(pin * 3);
          const z = lerp(1, P.zoom ?? 1.1, progIO(lt, 0.1, Math.max(1, dur)));
          mg.setAttribute('transform', `translate(${f1(FOC[0])} ${f1(FOC[1])}) scale(${z.toFixed(4)}) translate(${f1(-FOC[0])} ${f1(-FOC[1])})`);
          shadow.setAttribute('d', inkLoop(sheetPts.map(q => [q[0] + 10, q[1] + 12]), { seed: sd + 1, t, smooth: false }));
          sheetF.setAttribute('d', inkLoop(sheetPts, { seed: sd + 2, t, smooth: false, amp: 1.2 }));
          sheetR.setAttribute('d', inkPath(sheetPts, { seed: sd + 2, t, closed: true, w: 4, smooth: false, amp: 1.2 }));
          frame.setAttribute('d', inkPath([[S.x + 16, S.y + 16], [S.x + S.w - 16, S.y + 14], [S.x + S.w - 16, S.y + S.h - 16], [S.x + 16, S.y + S.h - 15]], { seed: sd + 3, t, closed: true, w: 2.5, smooth: false }));
          // graticule
          let gd = '';
          for (let i = 1; i < 6; i++) {
            gd += inkPath([X(i / 6, 0), X(i / 6, 1)], { seed: sd + 10 + i, t, w: 2, amp: 1 }) + ' ';
            gd += inkPath([X(0, i / 5), X(1, i / 5)], { seed: sd + 20 + i, t, w: 2, amp: 1 }) + ' ';
          }
          grat.setAttribute('d', gd);
          const wp = WATER.map(q => X(q[0], q[1]));
          waterF.setAttribute('d', inkLoop(wp, { seed: sd + 30, t, amp: 1.4 }));
          waterR.setAttribute('d', inkPath(wp, { seed: sd + 30, t, closed: true, w: 4, amp: 1.4 }));
          let wd = '';
          [[0.3, 0.98], [0.62, 0.95], [0.85, 0.35], [0.98, 0.78], [0.12, 0.33], [0.8, 0.12]].forEach(([u, v], i) => {
            const [x0, y0] = X(u, v), pts = [];
            for (let j = 0; j <= 6; j++) pts.push([x0 - 30 + j * 10, y0 + Math.sin(j * 1.6 + t * 2) * 5]);
            wd += inkPath(pts, { seed: sd + 40 + i, t, w: 3, amp: 0.8 }) + ' ';
          });
          waves.setAttribute('d', wd);
          let hd = '';
          HILLS.forEach(([u, v], i) => { const [x0, y0] = X(u, v); hd += inkPath([[x0 - 34, y0 + 10], [x0 - 10, y0 - 14], [x0 + 6, y0 - 16], [x0 + 32, y0 + 10]], { seed: sd + 60 + i, t, w: 4 }) + ' ' +
            inkPath([[x0 - 6, y0 - 6], [x0 + 4, y0 + 6]], { seed: sd + 70 + i, t, w: 3 }) + ' '; });
          hills.setAttribute('d', hd);
          // the city: a domed church (Hagia Sophia) + Galata tower glyph
          const [dx, dy] = X(0.6, 0.79), [gx, gy] = X(0.62, 0.43);
          const dome = [[dx - 50, dy], [dx - 46, dy - 34], [dx - 22, dy - 58], [dx, dy - 64], [dx + 22, dy - 58], [dx + 46, dy - 34], [dx + 50, dy]];
          const base = [[dx - 70, dy], [dx + 70, dy], [dx + 70, dy + 34], [dx - 70, dy + 34]];
          const tower = [[gx - 18, gy + 40], [gx - 16, gy - 34], [gx - 22, gy - 38], [gx, gy - 74], [gx + 22, gy - 38], [gx + 16, gy - 34], [gx + 18, gy + 40]];
          cityF.setAttribute('d', inkLoop(base, { seed: sd + 80, t, smooth: false }) + ' ' + inkLoop(dome, { seed: sd + 81, t }));
          cityF2.setAttribute('d', inkLoop(tower, { seed: sd + 82, t, smooth: false }));
          city.setAttribute('d', inkPath(base, { seed: sd + 80, t, closed: true, w: 4, smooth: false }) + ' ' + inkPath(dome, { seed: sd + 81, t, w: 4 }) + ' ' +
            inkPath([[dx, dy - 64], [dx, dy - 84]], { seed: sd + 83, t, w: 4 }));
          city2.setAttribute('d', inkPath(tower, { seed: sd + 82, t, closed: true, w: 4, smooth: false }) + ' ' + inkPath([[gx - 16, gy - 20], [gx + 16, gy - 20]], { seed: sd + 84, t, w: 3 }));
          // chain: links appear one by one from the city side to Galata
          if (P.chain !== false) {
            const at = atOr(cues, 'chain', 0.4), pc = prog(lt, at, 0.9), pk = punch(lt, at + 0.9, 0.5);
            const [a, b] = CHAIN.map(q => X(q[0], q[1])), n = 14, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
            const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
            let cd = '';
            for (let i = 0; i < n; i++) {
              if (i / n > pc) break;
              const u = (i + 0.5) / n, sag = Math.sin(u * Math.PI) * 14 + Math.sin(t * 1.5 + i) * 1.5;
              const cx = lerp(a[0], b[0], u) - Math.sin(ang) * sag, cy = lerp(a[1], b[1], u) + Math.cos(ang) * sag;
              const rx = L / n * 0.62, ry = i % 2 ? 4 : 10;
              cd += inkCircle(cx, cy, rx, sd + 100 + i, t, { ry, rot: ang, w: 4.5, n: 8 }) + ' ';
            }
            chainE.setAttribute('d', cd);
            chainG.setAttribute('transform', `translate(${f1((a[0] + b[0]) / 2)} ${f1((a[1] + b[1]) / 2)}) scale(${(1 + 0.12 * pk).toFixed(3)}) translate(${f1(-(a[0] + b[0]) / 2)} ${f1(-(a[1] + b[1]) / 2)})`);
            chainPosts.setAttribute('d', pc > 0 ? inkDot(a[0], a[1], 12, 12, sd + 120, t) + ' ' + (pc >= 1 ? inkDot(b[0], b[1], 12, 12, sd + 121, t) : '') : '');
          }
          // route
          let rTip = null, rAng = 0, rp = 0;
          if (P.route) {
            const at = atOr(cues, 'route', 0.8), rdur = P.route_dur || 2.2;
            rp = progIO(lt, at, rdur);
            const pts = inkSpline(ROUTE.map(q => X(q[0], q[1])), false, 6), cum = [0];
            for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
            const Lr = cum[cum.length - 1] * rp;
            let k = 1; while (k < pts.length - 1 && cum[k] < Lr) k++;
            const a0 = pts[k - 1], a1 = pts[k], u = clamp01((Lr - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1]));
            rTip = [lerp(a0[0], a1[0], u), lerp(a0[1], a1[1], u)];
            rAng = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
            const shown = pts.slice(0, k).concat([rTip]);
            routeP.setAttribute('d', rp > 0.001 ? 'M' + shown.map(q => `${f1(q[0])} ${f1(q[1])}`).join(' L') : '');
            routeP.setAttribute('stroke-dashoffset', f1(-t * 10));
            const hp = prog(lt, at + rdur - 0.1, 0.25), e = pts[pts.length - 1], ea = Math.atan2(e[1] - pts[pts.length - 4][1], e[0] - pts[pts.length - 4][0]);
            routeHead.setAttribute('d', hp > 0.01 ? inkPath([[e[0] - 36 * Math.cos(ea - 0.55), e[1] - 36 * Math.sin(ea - 0.55)], e, [e[0] - 36 * Math.cos(ea + 0.55), e[1] - 36 * Math.sin(ea + 0.55)]], { seed: sd + 130, t, w: 8, smooth: false }) : '');
          }
          // ships
          const bumpAt = P.bump ? atOr(cues, 'bump', 1.4) : null;
          for (const sh of ships) {
            let [x, y] = X(sh.u, sh.v), rot = 0, op = 1, sc = 1, face = sh.face;
            const bob = Math.sin(t * 1.6 + sh.k * 1.3) * 3;
            y += bob; rot = Math.sin(t * 1.2 + sh.k) * 4;
            if (sh.kind === 'out' && sh.k === 0 && bumpAt != null) {
              // sail at the chain, hit it, bounce back
              const [cx] = X(0.705, 0.6), go = progIO(lt, bumpAt - 0.7, 0.7), back = prog(lt, bumpAt, 0.6);
              x = lerp(x, cx + 24, go * (1 - 0.6 * back)); rot += punch(lt, bumpAt, 0.6) * 14;
            }
            if (sh.kind === 'route') {
              if (rTip) { x = rTip[0]; y = rTip[1] - 8 + bob * 0.3; face = Math.cos(rAng) < 0 ? -1 : 1; rot = (face < 0 ? rAng - Math.PI : rAng) * 180 / Math.PI; }
              op = clamp01(rp * 30);
              if (rp >= 1) { rot = Math.sin(t * 1.2) * 4; }
            }
            if (sh.kind === 'in') {
              const at = atOr(cues, 'inside', (P.route ? atOr(cues, 'route', 0.8) + (P.route_dur || 2.2) : 0.5)) + sh.k * 0.16, p = spring(lt, at, 0.5);
              op = clamp01(p * 3); sc = lerp(0.2, 1, p);
            }
            sh.g.style.opacity = op;
            sh.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${(face * sc).toFixed(3)} ${sc.toFixed(3)})`);
            sh.parts.forEach((pp, i) => {
              const o = { seed: sd + 200 + sh.kind.length * 50 + sh.k * 10 + i, t, amp: 1.2, smooth: pp.st.sm !== 0 };
              if (pp.f) pp.f.setAttribute('d', inkLoop(pp.st.p, o));
              pp.r.setAttribute('d', inkPath(pp.st.p, Object.assign({}, o, { w: pp.st.w, closed: !!pp.st.c })));
            });
          }
          if (bumpAt != null) {
            const [cx, cy] = X(0.68, 0.61), p = spring(lt, bumpAt + 0.05, 0.4), s = 30 * p;
            xMark.setAttribute('d', p > 0.01 ? inkPath([[cx - s, cy - s], [cx + s, cy + s]], { seed: sd + 300, t, w: 9 }) + ' ' + inkPath([[cx + s, cy - s], [cx - s, cy + s]], { seed: sd + 301, t, w: 9 }) : '');
          }
          labs.forEach(lb => {
            const at = atOr(cues, lb.L.at, 0.25 + lb.k * 0.15), p = spring(lt, at, 0.6), b = boil(sd + 400 + lb.k, t, 0.9);
            lb.t.style.opacity = clamp01(p * 2);
            lb.t.setAttribute('transform', `translate(${f1(lb.x + b[0])} ${f1(lb.y + b[1])}) rotate(${lb.L.rot || 0}) scale(${lerp(0.6, 1, p).toFixed(3)})`);
          });
          // compass
          const [ccx, ccy] = CC, R = 58, ca = Math.sin(t * 0.6) * 5 * Math.PI / 180;
          const rotp = (x, y) => [ccx + x * Math.cos(ca) - y * Math.sin(ca), ccy + x * Math.sin(ca) + y * Math.cos(ca)];
          compF.setAttribute('d', inkCircle(ccx, ccy, R * 0.72, sd + 500, t, { fill: true }));
          compR.setAttribute('d', inkCircle(ccx, ccy, R * 0.72, sd + 500, t, { w: 3 }));
          compN.setAttribute('d', inkLoop([rotp(-12, 0), rotp(0, -R), rotp(12, 0)], { seed: sd + 501, t, smooth: false, amp: 0.8 }));
          compS.setAttribute('d', inkLoop([rotp(-12, 0), rotp(0, R), rotp(12, 0)], { seed: sd + 502, t, smooth: false, amp: 0.8 }) + ' ' + inkLoop([rotp(0, -12), rotp(R * 0.8, 0), rotp(0, 12), rotp(-R * 0.8, 0)], { seed: sd + 503, t, smooth: false, amp: 0.8 }));
          compT.setAttribute('x', ccx); compT.setAttribute('y', ccy - R - 10);
          if (note) {
            const N = note.N, at = atOr(cues, N.at || 'note', Math.max(0.8, dur * 0.55)), p = spring(lt, at, 0.6);
            const [nx, ny] = X(N.u ?? 0.3, N.v ?? 0.12);
            const tw = note.t.getComputedTextLength ? note.t.getComputedTextLength() : 300, fs = N.size || 64;
            const bp = [[nx - tw / 2 - 26, ny - fs * 0.85], [nx + tw / 2 + 26, ny - fs * 0.88], [nx + tw / 2 + 28, ny + fs * 0.42], [nx - tw / 2 - 24, ny + fs * 0.45]];
            note.box.setAttribute('d', inkLoop(bp, { seed: sd + 600, t, smooth: false }));
            note.boxR.setAttribute('d', inkPath(bp, { seed: sd + 600, t, closed: true, w: 4, smooth: false }));
            note.t.setAttribute('x', nx); note.t.setAttribute('y', ny);
            note.g.style.opacity = clamp01(p * 2.5);
            note.g.setAttribute('transform', `translate(${f1(nx)} ${f1(ny)}) rotate(${f1(-3 + (1 - p) * -6)}) scale(${lerp(0.7, 1, p).toFixed(3)}) translate(${f1(-nx)} ${f1(-ny)})`);
          }
          if (kas) {
            const K = kas.K, at = atOr(cues, K.at, null), x = (K.x ?? 0.16) * W, y = K.y != null ? K.y * H : (portrait ? 1165 : 1040);
            const after = at != null && lt >= at, pose = after ? (K.then || 'shock') : (K.pose || 'idle');
            const since = after ? lt - at : lt, dir = typeof K.dir === 'number' ? K.dir : DIRS[K.dir] ?? 30;
            const words = env.words || (typeof WORDS !== 'undefined' ? WORDS : null);
            const o = { x, y, face: K.face === 'left' ? -1 : 1, since, dir, emotion: after ? (K.emotion || (pose === 'shock' ? 'surprised' : null)) : null, mouth: inkTalk(t, words) };
            if (after && since < 0.32) { o.prev = { pose: K.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
            kas.rig.update(t, pose, o);
          }
        },
      };
    },
  };
})();
