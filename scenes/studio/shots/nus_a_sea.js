// nus_a_sea: side view of a strait in the parchment ink style (brand/kit/BRAND.md §5; every line boils at 8 Hz via
// _ink.js). Wavy water line with drifting wave hatching, a seabed, optional shore hills with stone forts (taş burç +
// top + red crescent flag), big grey battleships (2-3 funnels, turrets, small French/British ensign, smoke), the small
// dark minelayer Nusret (one funnel, red crescent-and-star ensign at the stern, mines on deck) that can drop horned
// mines which sink on a chain, a night sky (moon, stars, hatching) with a sweeping searchlight beam, a mine counter,
// hand-written labels with arrows and an optional Kaşif standing on a near rock in front of the water.
//
// SHOTS.nus_a_sea P: {
//   water: 0.56 (water line, 0..1 of H), bed: 0.86 (seabed), night: false,
//   shore: {left: true, right: false, h: 0.2, w: 0.2},               // hills at the frame edges
//   forts: [{side: "left"|"right", at, fire: cue (muzzle flash)}],     // stone bastion + cannon on that hill
//   ships: [{kind: "battle"|"nusret", x: 0.6, to: 0.7 (moves over the scene, or over at..at+dur), at, dur,
//            scale: 1 (battle hull half-length = 0.13 W * scale; nusret = 0.07 W * scale), face: 1|-1,
//            funnels: 2|3, flag: "fr"|"uk"|null, far: false (lighter, on the horizon), smoke: true, deck: 4 (nusret mines)}],
//   drop: {ship: 0 (index of the nusret ship), count: 9, at, dur: 4, depth: [0.68, 0.74] (0..1 H), from: 0.25, to: 0.75
//          (x range the drops happen over; normally the ship's own path)},
//   mines: {xs: [0.2, 0.3...] | count + x0 + x1, depth: 0.7, at, dur: 1.5 (staggered pop), rows: 1|2},  // pre-laid field
//   beam: {x: 0.92, y: 0.4 (source), from: 200, to: 160 (deg, 180 = pointing left), len: 0.9, at, dur},
//   counter: {x: 0.5, y: 0.2, total: 26, at, dur, suffix: " MAYIN"},
//   labels: [{text, x, y, at, size: 60, color: "ink"|"red", arrow: [x, y]}],
//   kasif: {x: 0.12, y: 0.86 (ground), pose: "look", at, then: "shock", dir, face: "right", scale: 0.55, emotion, rock: true},
//   cam: {zoom: 1.06, focus: [0.5, 0.5]}
// }
// cues: hit (punch on the whole drawing), label/ship/mine/kasif "at" names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold };
  const FR = 'Fraunces, Georgia, serif';
  const GREY = mix(INK.inkSoft, INK.paperDark, 0.35);

  // ---------------------------------------------------------------- ship drawings (local coords, waterline y = 0, facing +x)
  // stroke spec: {p, c: closed, f: fill, w, col, sm: smooth}
  function battleStrokes(n, flag) {
    const S = [];
    S.push({ p: [[-1, 0], [-1.03, -0.15], [0.98, -0.15], [1.1, -0.2], [0.94, 0]], c: 1, f: GREY, w: 6, sm: 0 });
    S.push({ p: [[-0.95, -0.06], [0.92, -0.06]], w: 3, col: INK.inkSoft });
    S.push({ p: [[-0.46, -0.15], [-0.46, -0.29], [0.34, -0.29], [0.34, -0.15]], c: 1, f: INK.paperDark, w: 5, sm: 0 });
    S.push({ p: [[0.16, -0.29], [0.16, -0.42], [0.36, -0.42], [0.36, -0.29]], c: 1, f: INK.paperDark, w: 4.5, sm: 0 });
    const fx = n >= 3 ? [-0.3, -0.1, 0.08] : [-0.22, 0.02];
    fx.forEach(x => S.push({ p: [[x - 0.05, -0.29], [x - 0.045, -0.56], [x + 0.05, -0.56], [x + 0.055, -0.29]], c: 1, f: GREY, w: 4.5, sm: 0 }));
    S.push({ p: [[-0.62, -0.15], [-0.62, -0.82]], w: 4 }, { p: [[0.46, -0.42], [0.46, -0.88]], w: 4 });
    S.push({ p: [[-0.62, -0.7], [0.46, -0.76]], w: 2.5, col: INK.inkSoft });
    S.push({ p: [[0.58, -0.15], [0.61, -0.25], [0.8, -0.25], [0.83, -0.15]], c: 1, f: INK.paperDark, w: 4.5, sm: 0 });
    S.push({ p: [[0.76, -0.215], [1.04, -0.235]], w: 6 });
    S.push({ p: [[-0.58, -0.15], [-0.61, -0.25], [-0.8, -0.25], [-0.83, -0.15]], c: 1, f: INK.paperDark, w: 4.5, sm: 0 });
    S.push({ p: [[-0.76, -0.215], [-1.02, -0.235]], w: 6 });
    for (let i = 0; i < 7; i++) { const x = -0.7 + i * 0.22; S.push({ p: [[x, -0.1], [x + 0.025, -0.1]], w: 5 }); }
    if (flag) {
      const fx0 = -0.98, top = -0.42, fw = 0.16, fh = 0.1;
      S.push({ p: [[fx0, -0.15], [fx0, top]], w: 3.5 });
      if (flag === 'fr') {
        [INK.blue, INK.paperLight, INK.red].forEach((c, i) => S.push({ p: [[fx0 - i * fw / 3, top], [fx0 - (i + 1) * fw / 3, top], [fx0 - (i + 1) * fw / 3, top + fh], [fx0 - i * fw / 3, top + fh]], c: 1, f: c, w: 0, sm: 0 }));
      } else {
        S.push({ p: [[fx0, top], [fx0 - fw, top], [fx0 - fw, top + fh], [fx0, top + fh]], c: 1, f: INK.paperLight, w: 0, sm: 0 });
        S.push({ p: [[fx0 - fw / 2, top + 0.005], [fx0 - fw / 2, top + fh - 0.005]], w: 3, col: INK.red }, { p: [[fx0 - 0.005, top + fh / 2], [fx0 - fw + 0.005, top + fh / 2]], w: 3, col: INK.red });
      }
      S.push({ p: [[fx0, top], [fx0 - fw, top], [fx0 - fw, top + fh], [fx0, top + fh]], c: 1, w: 2.5, sm: 0 });
    }
    return { S, funnels: fx.map(x => [x, -0.56]) };
  }
  function nusretStrokes(deck) {
    const S = [];
    S.push({ p: [[-1, 0], [-1.05, -0.2], [0.95, -0.2], [1.12, -0.3], [0.9, 0]], c: 1, f: INK.ink, w: 6, sm: 0 });
    S.push({ p: [[-0.2, -0.2], [-0.2, -0.44], [0.32, -0.44], [0.32, -0.2]], c: 1, f: INK.inkSoft, w: 5, sm: 0 });
    S.push({ p: [[0.18, -0.36], [0.26, -0.36]], w: 5, col: INK.paperDark });
    S.push({ p: [[-0.02, -0.44], [-0.015, -0.8], [0.11, -0.8], [0.12, -0.44]], c: 1, f: INK.ink, w: 5, sm: 0 });
    S.push({ p: [[0.62, -0.22], [0.62, -1.02]], w: 4.5 }, { p: [[0.62, -0.95], [-0.95, -0.66]], w: 2.5, col: INK.inkSoft });
    // stern ensign: red, crescent + star
    const sx = -0.95, top = -0.72, fw = 0.46, fh = 0.3;
    S.push({ p: [[sx, -0.2], [sx, top - 0.04]], w: 4 });
    S.push({ p: [[sx, top], [sx + fw, top + 0.02], [sx + fw, top + fh + 0.02], [sx, top + fh]], c: 1, f: INK.red, w: 3, sm: 0 });
    const mines = [];
    for (let i = 0; i < deck; i++) mines.push([-0.78 + i * 0.12, -0.27]);
    return { S, flag: { cx: sx + fw * 0.4, cy: top + fh / 2 + 0.01, r: fh * 0.3, sx: sx + fw * 0.72 }, mines, funnels: [[0.05, -0.8]] };
  }

  function star(cx, cy, r) {
    const p = [];
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
    return p;
  }
  // horned mine at (x, y) radius r
  function mineD(x, y, r, seed, t) {
    let d = inkCircle(x, y, r, seed, t, { fill: true, amp: 0.6 });
    for (let k = 0; k < 6; k++) {
      const a = -Math.PI / 2 + (k - 2.5) * 0.62;
      const p0 = [x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9], p1 = [x + Math.cos(a) * r * 1.42, y + Math.sin(a) * r * 1.42];
      d += ' ' + inkPath([p0, p1], { w: Math.max(3, r * 0.22), seed: seed + k * 7, t, amp: 0.5, taper: 0 });
      d += ' ' + inkDot(p1[0], p1[1], r * 0.17, r * 0.17, seed + k * 11, t, 0.4);
    }
    return d;
  }

  SH.nus_a_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W;
      const sd = seed * 1000 + 17;
      const WY = (P.water ?? 0.56) * H, BY = (P.bed ?? 0.86) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const night = !!P.night;
      // sky
      const skyH = night ? mk(cam, INK.inkSoft, { 'fill-opacity': 0.55 }) : null;
      const moonF = night ? mk(cam, INK.paperLight) : null, moonR = night ? mk(cam) : null, moonCut = night ? mk(cam, INK.inkSoft) : null;
      const stars = night ? mk(cam, INK.paperLight) : null;
      const beam = P.beam ? mk(cam, INK.paperLight, { 'fill-opacity': 0.7 }) : null, beamR = P.beam ? mk(cam, INK.gold, { 'fill-opacity': 0.9 }) : null;
      const far = mk(cam, INK.inkSoft, { 'fill-opacity': 0.5 });
      // ships (far first)
      const shipsP = (P.ships || []).map((s, i) => Object.assign({ i }, s)).sort((a, b) => (b.far ? 1 : 0) - (a.far ? 1 : 0));
      const ships = shipsP.map(s => {
        const g = el(cam, 'g');
        const smoke = mk(g, night ? INK.paperDark : INK.inkSoft, { 'fill-opacity': night ? 0.45 : 0.35 });
        const def = s.kind === 'nusret' ? nusretStrokes(s.deck ?? 4) : battleStrokes(s.funnels ?? 2, s.flag);
        const els = def.S.map(st => ({ st, F: st.f ? mk(g, s.far && st.f !== INK.red ? INK.inkSoft : st.f, s.far ? { 'fill-opacity': 0.75 } : {}) : null, R: st.w ? mk(g, st.col || INK.ink) : null }));
        const flagE = def.flag ? { moon: mk(g, INK.paperLight), cut: mk(g, INK.red), star: mk(g, INK.paperLight) } : null;
        const deckE = def.mines ? mk(g, INK.ink) : null;
        const half = (s.kind === 'nusret' ? 0.07 : 0.13) * W * (s.scale ?? 1) * (s.far ? 0.55 : 1);
        return { s, g, smoke, def, els, flagE, deckE, half };
      });
      // water
      const under = mk(cam, INK.inkSoft, { 'fill-opacity': night ? 0.5 : 0.3 });
      const waterR = mk(cam), hatch = mk(cam, INK.inkSoft), bedF = mk(cam, INK.paperDark), bedR = mk(cam);
      // shores + forts
      const sh = P.shore || null;
      const shoreE = sh ? ['left', 'right'].filter(k => sh[k]).map(side => ({ side, F: mk(cam, INK.paperDark), R: mk(cam), H: mk(cam, INK.inkSoft) })) : [];
      const forts = (P.forts || []).map(f => ({ f, F: mk(cam, INK.paperLight), R: mk(cam), gun: mk(cam), flag: mk(cam, INK.red), moon: mk(cam, INK.paperLight), cut: mk(cam, INK.red), flash: mk(cam, INK.gold) }));
      // mines
      const chains = el(cam, 'path', { fill: 'none', stroke: INK.ink, 'stroke-width': 4, 'stroke-dasharray': '3 9', 'stroke-linecap': 'round' });
      const mineE = mk(cam, INK.ink), anchors = mk(cam, INK.inkSoft);
      const minesList = [];
      if (P.mines) {
        const M = P.mines, n = M.count ?? (M.xs ? M.xs.length : 8), rows = M.rows ?? 1;
        for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) {
          const x = M.xs ? M.xs[i] : lerp(M.x0 ?? 0.25, M.x1 ?? 0.75, n > 1 ? i / (n - 1) : 0.5) + r * 0.03;
          minesList.push({ x: x * W, d: ((M.depth ?? 0.7) + r * 0.07 + ((i * 37) % 5) * 0.006) * H, kind: 'field', k: r * n + i, n: n * rows, at: M.at, dur: M.dur ?? 1.5 });
        }
      }
      if (P.drop) {
        const D = P.drop, n = D.count ?? 9, dep = D.depth || [0.68, 0.74];
        for (let i = 0; i < n; i++) minesList.push({ x: lerp(D.from ?? 0.25, D.to ?? 0.75, n > 1 ? i / (n - 1) : 0.5) * W, d: lerp(dep[0], dep[1], ((i * 5) % 3) / 2) * H, kind: 'drop', k: i, n, at: D.at, dur: D.dur ?? 4 });
      }
      const mineR = (portrait ? 30 : 24) * (P.mine_scale ?? 1);
      // near rock + Kaşif
      let kas = null;
      if (P.kasif && typeof KASIF !== 'undefined') {
        const K = P.kasif;
        const rockF = K.rock !== false ? mk(cam, INK.paperDark) : null, rockR = K.rock !== false ? mk(cam) : null, rockH = K.rock !== false ? mk(cam, INK.inkSoft) : null;
        const g = el(cam, 'g');
        kas = { K, rockF, rockR, rockH, rig: KASIF.create(g, { scale: K.scale ?? (portrait ? 0.75 : 0.55), hat: true, seed: seed + 3 }) };
      }
      // counter + labels (topmost)
      let counter = null;
      if (P.counter) {
        const C2 = P.counter;
        const g = el(cam, 'g');
        const t = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': C2.size || 120, 'text-anchor': 'middle', fill: INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 16px; stroke-linejoin: round` });
        counter = { C: C2, g, t };
      }
      const labels = (P.labels || []).map(L => {
        const g = el(cam, 'g');
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': L.size || 60, 'text-anchor': 'middle', fill: COL[L.color] || INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = L.text;
        return { L, g, t, arrow: L.arrow ? mk(cam, COL[L.color] || INK.ink) : null };
      });

      // ---------------------------------------------------------------- helpers
      const shipX = (s, lt, dur, cues) => {
        const at = atOr(cues, s.at, null);
        const x0 = (s.x ?? 0.5) * W, x1 = (s.to ?? s.x ?? 0.5) * W;
        const E = s.linear ? lin : progIO;
        if (at == null) return lerp(x0, x1, E(lt, 0, Math.max(dur, 0.1)));
        return lerp(x0, x1, E(lt, at, s.dur ?? Math.max(1, dur - at)));
      };
      const waveY = (x, lt) => WY + Math.sin(x * 0.012 + lt * 1.6) * 5 + Math.sin(x * 0.031 - lt * 2.3) * 2.5;
      const shorePts = (side) => {
        const w = (sh.w ?? 0.2) * W, h = (sh.h ?? 0.2) * H;
        const L = [[-20, WY + 30], [-20, WY - h], [w * 0.35, WY - h * 0.98], [w * 0.62, WY - h * 0.75], [w * 0.86, WY - h * 0.25], [w, WY + 4], [w, WY + 30]];
        return side === 'left' ? L : L.map(q => [W - q[0], q[1]]);
      };
      const fortTop = (side) => { const w = (sh ? sh.w ?? 0.2 : 0.2) * W, h = (sh ? sh.h ?? 0.2 : 0.2) * H; const x = side === 'left' ? w * 0.32 : W - w * 0.32; return [x, WY - h * 0.98]; };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null));
          // camera
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.06, sm01(lt / Math.max(dur, 1))) * (1 + 0.025 * hit);
          const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : 0.5) * H;
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // night sky
          if (night) {
            let d = '';
            for (let i = 0; i < 72; i++) {
              const x = (i / 72) * (W + 300) - 150, y0 = 40 + ((i * 53) % 7) * 6, y1 = WY - 30;
              d += ' ' + inkPath([[x, y0], [x - 120, y1]], { w: 4, seed: sd + i, t, amp: 1.5, taper: 0.5 });
            }
            skyH.setAttribute('d', d);
            const mx = W * (P.moon_x ?? 0.78), my = H * 0.16, mr = portrait ? 60 : 48;
            moonF.setAttribute('d', inkCircle(mx, my, mr, sd + 3, t, { fill: true }));
            moonR.setAttribute('d', inkCircle(mx, my, mr, sd + 3, t, { w: 4 }));
            moonCut.setAttribute('d', inkCircle(mx + mr * 0.45, my - mr * 0.15, mr * 0.86, sd + 4, t, { fill: true }));
            let sdd = '';
            for (let i = 0; i < 14; i++) {
              const x = ((i * 0.137 + 0.05) % 1) * W, y = H * (0.07 + ((i * 0.29) % 1) * 0.3), tw = 0.6 + 0.4 * Math.sin(t * 2.2 + i);
              sdd += ' ' + inkLoop(star(x, y, (6 + (i % 3) * 3) * tw), { seed: sd + 40 + i, t, amp: 0.6, smooth: false });
            }
            stars.setAttribute('d', sdd);
          }
          // searchlight
          if (beam) {
            const B = P.beam, at = atOr(cues, B.at, 0), p = progIO(lt, at, B.dur ?? Math.max(1, dur - at));
            const a = (lerp(B.from ?? 200, B.to ?? 160, p) + Math.sin(t * 0.9) * 2) * Math.PI / 180, len = (B.len ?? 0.9) * W, sp = 0.07;
            const sx = (B.x ?? 0.92) * W, sy = (B.y ?? 0.42) * H;
            const pts = [[sx, sy], [sx + Math.cos(a - sp) * len, sy - Math.sin(a - sp) * len], [sx + Math.cos(a + sp) * len, sy - Math.sin(a + sp) * len]];
            beam.setAttribute('d', inkLoop(pts, { seed: sd + 70, t, amp: 3, smooth: false }));
            beamR.setAttribute('d', inkCircle(sx, sy, 16, sd + 71, t, { fill: true }));
          }
          // far ridge
          {
            const pts = [[-20, WY + 2]];
            for (let i = 0; i <= 12; i++) { const x = i / 12 * (W + 40) - 20; pts.push([x, WY - 18 - Math.abs(Math.sin(i * 1.7)) * 34 - (i > 3 && i < 9 ? 14 : 0)]); }
            pts.push([W + 20, WY + 2]);
            far.setAttribute('d', inkLoop(pts, { seed: sd + 90, t, amp: 1.5 }));
          }
          // ships
          for (const S of ships) {
            const s = S.s, at = atOr(cues, s.at, null), show = s.appear ? spring(lt, atOr(cues, s.appear, 0), 0.7) : 1;
            const x = shipX(s, lt, dur, cues), face = s.face ?? 1, k = S.half;
            const y = (s.far ? WY - 6 : WY + 4) + Math.sin(t * 1.3 + S.s.i) * (s.far ? 1 : 3);
            const rot = Math.sin(t * 1.1 + S.s.i * 2) * (s.kind === 'nusret' ? 1.6 : 0.7);
            S.g.setAttribute('transform', `translate(${f1(x)} ${f1(y + (1 - show) * 40)}) rotate(${f1(rot)})`);
            S.g.style.opacity = clamp01(show * 1.5);
            const L = q => [q[0] * k * face, q[1] * k];
            S.els.forEach((E, j) => {
              const pts = E.st.p.map(L), o = { seed: sd + S.s.i * 97 + j * 5, t, amp: s.far ? 0.8 : 1.4, smooth: E.st.sm !== 0 };
              if (E.F) E.F.setAttribute('d', inkLoop(pts, o));
              if (E.R) E.R.setAttribute('d', inkPath(pts, Object.assign({ w: E.st.w * (s.far ? 0.7 : 1), closed: !!E.st.c, taper: E.st.c ? 0 : 0.2 }, o)));
            });
            if (S.flagE) {
              const fl = S.def.flag, [cx, cy] = L([fl.cx, fl.cy]), r = fl.r * k, [qx, qy] = L([fl.sx, fl.cy]);
              S.flagE.moon.setAttribute('d', inkCircle(cx, cy, r, sd + 300 + S.s.i, t, { fill: true, amp: 0.5 }));
              S.flagE.cut.setAttribute('d', inkCircle(cx + r * 0.32 * face, cy, r * 0.8, sd + 301 + S.s.i, t, { fill: true, amp: 0.5 }));
              S.flagE.star.setAttribute('d', inkLoop(star(qx, qy, r * 0.55), { seed: sd + 302, t, amp: 0.4, smooth: false }));
            }
            if (S.deckE) {
              // mines left on deck: one disappears per dropped mine
              let left = S.def.mines.length;
              if (P.drop && (P.drop.ship ?? 0) === s.i) {
                const D = P.drop, dat = atOr(cues, D.at, 0.3), dd = D.dur ?? 4, n = D.count ?? 9;
                const dropped = Math.floor(clamp01((lt - dat) / dd) * n + 1e-6);
                left = Math.max(1, S.def.mines.length - Math.floor(dropped / Math.max(1, n / S.def.mines.length)));
              }
              let d = '';
              S.def.mines.slice(0, left).forEach((q, j) => { const [mx, my] = L(q); d += ' ' + mineD(mx, my, 0.05 * k, sd + 400 + j * 9, t); });
              S.deckE.setAttribute('d', d);
            }
            if (s.smoke !== false) {
              let d = '';
              S.def.funnels.forEach((q, j) => {
                const [fx2, fy2] = L(q);
                for (let m = 0; m < 5; m++) {
                  const u = ((t * 0.35 + m / 5 + j * 0.13) % 1);
                  const px = fx2 - face * u * k * 0.9 - u * 30, py = fy2 - u * k * 0.5 - 6, r = k * (0.04 + u * 0.1);
                  d += ' ' + inkCircle(px, py, r, sd + 500 + j * 13 + m, t, { fill: true, amp: 1 });
                }
              });
              S.smoke.setAttribute('d', d);
            }
          }
          // water line + underwater hatching + seabed
          {
            const pts = [];
            for (let x = -40; x <= W + 40; x += 60) pts.push([x, waveY(x, lt)]);
            waterR.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 600, t, amp: 1, taper: 0 }));
            const uPts = pts.concat([[W + 40, BY], [-40, BY]]);
            under.setAttribute('d', '');
            let d = '';
            for (let r = 0; r < 6; r++) {
              const y = WY + 30 + r * (BY - WY - 40) / 6;
              for (let i = 0; i < 9; i++) {
                const x = ((i / 9 + r * 0.07 + lt * 0.018 * (r % 2 ? 1 : -1)) % 1 + 1) % 1 * (W + 200) - 100;
                d += ' ' + inkPath([[x, y], [x + 40, y - 6], [x + 80, y]], { w: 3, seed: sd + 700 + r * 20 + i, t, amp: 1, taper: 0.6 });
              }
            }
            if (night) under.setAttribute('d', d); else { under.setAttribute('d', ''); }
            hatch.setAttribute('d', night ? '' : d);
            const bp = [[-40, BY]];
            for (let i = 0; i <= 16; i++) bp.push([i / 16 * (W + 80) - 40, BY + Math.sin(i * 1.3) * 8]);
            const bf = bp.concat([[W + 40, H + 40], [-40, H + 40]]);
            bedF.setAttribute('d', inkLoop(bf, { seed: sd + 800, t, amp: 1.2 }));
            bedR.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 801, t, amp: 1.2, taper: 0 }));
            if (!night) under.setAttribute('d', '');
            void uPts;
          }
          // shores
          for (const E of shoreE) {
            const pts = shorePts(E.side);
            E.F.setAttribute('d', inkLoop(pts, { seed: sd + 900 + (E.side === 'left' ? 0 : 1), t, amp: 1.5 }));
            E.R.setAttribute('d', inkPath(pts.slice(1, -1), { w: 6, seed: sd + 910 + (E.side === 'left' ? 0 : 1), t, amp: 1.5 }));
            let d = '';
            for (let i = 0; i < 8; i++) {
              const u = (i + 0.5) / 8, w = (sh.w ?? 0.2) * W, h = (sh.h ?? 0.2) * H;
              let x = u * w * 0.85, y = WY - h * (1 - u * 0.9) * 0.7 + 20;
              if (E.side === 'right') x = W - x;
              d += ' ' + inkPath([[x - 18, y], [x + 18, y + 22]], { w: 3, seed: sd + 920 + i, t, amp: 1, taper: 0.5 });
            }
            E.H.setAttribute('d', d);
          }
          // forts
          forts.forEach((F, j) => {
            const side = F.f.side || 'left', [cx, ty] = fortTop(side), s = portrait ? 1.1 : 1;
            const p = spring(lt, atOr(cues, F.f.at, 0), 0.7), dy = (1 - p) * 30;
            const bw = 120 * s, bh = 70 * s, x0 = cx - bw / 2, y0 = ty - bh + 6 + dy;
            const box = [[x0, ty + 8], [x0 + 6, y0], [x0 + bw - 6, y0], [x0 + bw, ty + 8]];
            const cren = [];
            for (let i = 0; i < 5; i++) { const xx = x0 + 6 + i * (bw - 12) / 4; cren.push([xx - 9, y0], [xx - 9, y0 - 16], [xx + 9, y0 - 16], [xx + 9, y0]); }
            F.F.setAttribute('d', inkLoop(box, { seed: sd + 1000 + j, t, amp: 1, smooth: false }) + ' ' + inkLoop(cren, { seed: sd + 1001 + j, t, amp: 0.8, smooth: false }));
            F.R.setAttribute('d', inkPath(box, { w: 5, seed: sd + 1002 + j, t, closed: true, smooth: false }) + ' ' + inkPath([[x0 + 10, y0 + bh * 0.45], [x0 + bw - 10, y0 + bh * 0.48]], { w: 3, seed: sd + 1003 + j, t }));
            const dir = side === 'left' ? 1 : -1, gx = cx + dir * bw * 0.35, gy = y0 + bh * 0.3;
            const recoil = F.f.fire ? punch(lt, atOr(cues, F.f.fire, null), 0.5) : 0;
            F.gun.setAttribute('d', inkPath([[gx - dir * recoil * 12, gy], [gx + dir * (70 * s - recoil * 12), gy - 18 * s]], { w: 14 * s, seed: sd + 1004 + j, t, taper: 0 }));
            F.flash.setAttribute('d', recoil > 0.05 ? inkLoop(star(gx + dir * 92 * s, gy - 24 * s, 34 * recoil + 8), { seed: sd + 1005, t, amp: 2, smooth: false }) : '');
            const fx0 = cx - dir * bw * 0.3, ftop = y0 - 80 * s;
            const fl = [[fx0, ftop], [fx0 + dir * 60 * s, ftop + 3], [fx0 + dir * 60 * s, ftop + 40 * s], [fx0, ftop + 38 * s]];
            F.flag.setAttribute('d', inkLoop(fl, { seed: sd + 1006 + j, t, amp: 1, smooth: false }) + ' ' + inkPath([[fx0, y0], [fx0, ftop - 4]], { w: 4, seed: sd + 1007 + j, t }));
            const mcx = fx0 + dir * 24 * s, mcy = ftop + 20 * s;
            F.moon.setAttribute('d', inkCircle(mcx, mcy, 11 * s, sd + 1008 + j, t, { fill: true, amp: 0.4 }) + ' ' + inkLoop(star(mcx + dir * 19 * s, mcy, 6 * s), { seed: sd + 1009, t, amp: 0.3, smooth: false }));
            F.cut.setAttribute('d', inkCircle(mcx + dir * 4 * s, mcy, 9 * s, sd + 1010 + j, t, { fill: true, amp: 0.4 }));
          });
          // mines + chains
          {
            let md = '', cd = '', ad = '';
            const nus = ships.find(S => S.s.kind === 'nusret' && (!P.drop || (P.drop.ship ?? 0) === S.s.i));
            for (const m of minesList) {
              const at = atOr(cues, m.at, m.kind === 'drop' ? 0.3 : 0.2), t0 = at + (m.k / Math.max(1, m.n)) * m.dur;
              if (lt < t0) continue;
              let x = m.x, y;
              if (m.kind === 'drop') {
                const p = prog(lt, t0, 1.3);
                if (nus && P.drop.follow !== false) x = m.x; // ship path should match from..to
                y = lerp(WY - 10, m.d, p) + Math.sin(t * 1.4 + m.k) * 3;
              } else {
                const p = spring(lt, t0, 0.7);
                y = m.d + (1 - p) * 30 + Math.sin(t * 1.4 + m.k) * 3;
              }
              md += ' ' + mineD(x, y, mineR, sd + 1200 + m.k * 3, t);
              const bottom = m.kind === 'drop' ? lerp(y, BY - 8, prog(lt, t0 + 0.4, 1.0)) : BY - 8;
              if (bottom > y + mineR) {
                cd += ` M${f1(x)} ${f1(y + mineR)} L${f1(x + Math.sin(t + m.k) * 3)} ${f1(bottom)}`;
                ad += ' ' + inkLoop([[x - 16, bottom - 6], [x + 16, bottom - 6], [x + 18, bottom + 10], [x - 18, bottom + 10]], { seed: sd + 1300 + m.k, t, amp: 0.8, smooth: false });
              }
            }
            mineE.setAttribute('d', md); chains.setAttribute('d', cd); anchors.setAttribute('d', ad);
          }
          // Kaşif on the near rock
          if (kas) {
            const K = kas.K, at = atOr(cues, K.at, null), x = (K.x ?? 0.12) * W, y = (K.y ?? 0.86) * H;
            if (kas.rockF) {
              const rw = (K.rock_w ?? 0.13) * W;
              const rp = [[x - rw, H + 40], [x - rw * 0.95, y + 10], [x - rw * 0.6, y - 6], [x + rw * 0.5, y - 4], [x + rw * 0.95, y + 16], [x + rw * 1.1, H + 40]];
              kas.rockF.setAttribute('d', inkLoop(rp, { seed: sd + 1400, t, amp: 1.2 }));
              kas.rockR.setAttribute('d', inkPath(rp.slice(0, -1).concat([[x + rw * 1.1, H + 40]]), { w: 6, seed: sd + 1401, t, amp: 1.2 }));
              let d = '';
              for (let i = 0; i < 6; i++) { const xx = x - rw * 0.7 + i * rw * 0.3, yy = y + 34 + (i % 2) * 22; d += ' ' + inkPath([[xx, yy], [xx + 26, yy + 18]], { w: 3, seed: sd + 1410 + i, t, amp: 0.8, taper: 0.5 }); }
              kas.rockH.setAttribute('d', d);
            }
            const after = at != null && lt >= at, pose = after ? (K.then || 'shock') : (K.pose || 'idle');
            const since = after ? lt - at : lt, dir = typeof K.dir === 'number' ? K.dir : DIRS[K.dir] ?? 20;
            const words = env.words || (typeof WORDS !== 'undefined' ? WORDS : null);
            const o = { x, y, face: K.face === 'left' ? -1 : 1, since, dir, emotion: after ? (K.emotion || (pose === 'shock' ? 'surprised' : null)) : (K.emotion0 || null), mouth: inkTalk(t, words) };
            if (after && since < 0.32) { o.prev = { pose: K.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
            kas.rig.update(t, pose, o);
          }
          // counter
          if (counter) {
            const C2 = counter.C, at = atOr(cues, C2.at, 0.3), d2 = C2.dur ?? 4;
            const v = Math.round(clamp01((lt - at) / d2) * (C2.total ?? 26));
            const x = (C2.x ?? 0.5) * W, y = (C2.y ?? 0.2) * H, p = spring(lt, at, 0.6), pk = punch(lt, at + d2, 0.6);
            counter.t.textContent = lt < at ? '' : `${v}${C2.suffix ?? ''}`;
            counter.t.setAttribute('x', f1(x)); counter.t.setAttribute('y', f1(y));
            counter.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${(lerp(0.6, 1, p) * (1 + 0.12 * pk)).toFixed(3)}) rotate(-3) translate(${f1(-x)} ${f1(-y)})`);
          }
          // labels
          labels.forEach((E, j) => {
            const L = E.L, at = atOr(cues, L.at, 0.4 + j * 0.4), p = spring(lt, at, 0.6);
            const x = (L.x ?? 0.5) * W, y = (L.y ?? 0.15) * H;
            E.t.setAttribute('x', f1(x)); E.t.setAttribute('y', f1(y));
            E.g.style.opacity = clamp01(p * 2.5);
            E.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(-3 + (1 - p) * 6)}) scale(${lerp(0.7, 1, p).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
            if (E.arrow) {
              const ax = L.arrow[0] * W, ay = L.arrow[1] * H, sx = x, sy = y + (ay > y ? 18 : -(L.size || 60));
              const q = prog(lt, at + 0.2, 0.5);
              if (q <= 0) { E.arrow.setAttribute('d', ''); return; }
              const ex = lerp(sx, ax, q), ey = lerp(sy, ay, q), mxp = (sx + ex) / 2 + (ey - sy) * 0.15, myp = (sy + ey) / 2 - (ex - sx) * 0.15;
              const a = Math.atan2(ey - myp, ex - mxp);
              let d = inkPath([[sx, sy], [mxp, myp], [ex, ey]], { w: 5, seed: sd + 1500 + j, t, amp: 1 });
              if (q > 0.9) d += ' ' + inkPath([[ex - 30 * Math.cos(a - 0.5), ey - 30 * Math.sin(a - 0.5)], [ex, ey], [ex - 30 * Math.cos(a + 0.5), ey - 30 * Math.sin(a + 0.5)]], { w: 5, seed: sd + 1510 + j, t, amp: 0.6, smooth: false });
              E.arrow.setAttribute('d', d);
            }
          });
        },
      };
    },
  };
  const sm01 = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
})();
