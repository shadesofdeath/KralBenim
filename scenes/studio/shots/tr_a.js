// tr_a: "Türkiye 50 yıl sonra" (1976 <-> 2076) shots in the parchment ink style (brand/kit/BRAND.md §3, §5).
// Every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt).
//
// SHOTS.tr_a_mirrors — the "two mirrors" motif: two oval hand mirrors with an ink frame and a handle. Inside the left
//   one a sepia 1976 village (flat-roof houses, hills, sun, a big family: two adults + running children); inside the
//   right one a 2076 city (towers) with old people leaning on canes and one lonely child. Year plates under each mirror
//   (the future year in red with a small handwritten "tahmin" note). Kaşif stands between them.
//   P: {show: "both"|"left"|"right", left: {year: "1976", at}, right: {year: "2076", at, note: "tahmin"},
//       light: {left: cue, right: cue} (that mirror gets a gold rim + punch, the other dims),
//       kasif: {x: 0.5, scale: 0.95, pose: "idle", face: 1, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//       label: {text, at, color, y: 0.08}, cam: {zoom: 1.05},
//       cover: {left: 0.42, right: 0.7, k: 0.8} | false (thumbnail layout: mirrors to the right, shot's Kaşif hidden)}
//   cues: hit (punch both mirrors), whatever names light/seq/label use
//
// SHOTS.tr_a_people — population as rows of tiny ink pictograms (1 figure = n people): adults, small children,
//   old people with canes. A big Fraunces counter with a handwritten unit, an optional second batch that pops in
//   (growth), an optional split that recolours the first k figures (e.g. 93 of 100 in the city).
//   P: {n: 40, cols: 10, mix: "aacc" (pattern of kinds: a adult, c child, e elder), grow: {n: 46, at, dur: 1.6},
//       count: {from: 0, to: 40, at, dur: 2, unit: "milyon", note: "tahmin"}, year: {text: "1976", at},
//       split: {k: 93, at, dur: 1.4, color: "red"}, note: {text, at, color: "red"},
//       kasif: {x: 0.8, scale: 0.7, pose, face: -1, emotion, seq: [{at, pose, dir, face, emotion}]} | false}
//   cues: hit (punch counter), names used by count/grow/split/note/year/seq
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const FR = 'Fraunces, Georgia, serif';
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold, soft: INK.inkSoft };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const txt = (parent, s, size, o = {}) => {
    const t = el(parent, 'text', Object.assign({ 'font-family': o.hand ? INK_FONT : FR, 'font-weight': o.hand ? 400 : 900, 'font-size': size,
      'text-anchor': o.anchor || 'middle', fill: o.fill || INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: ${o.sw ?? 12}px; stroke-linejoin: round` }));
    t.textContent = s; return t;
  };

  // ---------------------------------------------------------------- pictogram figures (local coords: feet at y 0, ~100 tall)
  // kind a = adult, c = child (drawn smaller by the caller), e = elder (bent, cane). ph: walk phase (0 = standing)
  function figure(kind, seed, t, ph = 0, w = 5) {
    const O = k => ({ seed: seed + k, t, w, amp: 1.1 });
    const sw = Math.sin(ph * Math.PI * 2) * 14;
    if (kind === 'e') {
      const hx = 14, hy = -78;
      return inkCircle(hx, hy, 11, seed + 1, t, { w: w * 0.9, amp: 0.8 }) + ' ' +
        inkPath([[2, -36], [6, -54], [12, -66]], O(2)) + ' ' +
        inkPath([[2, -36], [-8 + sw * 0.3, 0]], O(3)) + ' ' + inkPath([[2, -36], [12 - sw * 0.3, 0]], O(4)) + ' ' +
        inkPath([[9, -60], [22, -48], [26, -46]], O(5)) + ' ' + inkPath([[27, -48], [29, 0]], O(6, { w: w * 0.8 })) +
        ' ' + inkPath([[27, -48], [33, -54]], O(7, { w: w * 0.8 })) + ' ' + inkPath([[8, -62], [-6, -46]], O(8));
    }
    return inkCircle(0, -86, 12, seed + 1, t, { w: w * 0.9, amp: 0.8 }) + ' ' +
      inkPath([[0, -73], [0, -36]], O(2)) + ' ' +
      inkPath([[0, -36], [-11 - sw, 0]], O(3)) + ' ' + inkPath([[0, -36], [11 + sw, 0]], O(4)) + ' ' +
      inkPath([[0, -64], [-17 + sw * 0.6, -42]], O(5)) + ' ' + inkPath([[0, -64], [17 - sw * 0.6, -42]], O(6));
  }

  // ---------------------------------------------------------------- Kaşif with a pose sequence
  function kasifOf(K, parent, seed, defScale) {
    if (!K) return null;
    const rig = KASIF.create(el(parent, 'g'), { scale: K.scale ?? defScale, hat: true, seed: seed + 5 });
    return { K, rig };
  }
  function kasifUpdate(k, lt, t, cues, W, gy) {
    if (!k) return;
    const K = k.K, segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
    (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
    segs.sort((a, b) => a.at - b.at);
    let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
    const s = segs[i], p = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
    const dir = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
    const face = v => v === 'left' ? -1 : v === 'right' ? 1 : (typeof v === 'number' ? v : (K.face === 'left' ? -1 : K.face === -1 ? -1 : 1));
    const o = { x: (K.x ?? 0.5) * W, y: gy, face: face(s.face), since, dir: dir(s.dir ?? K.dir),
      emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : null), mouth: 0 };
    if (p && since < 0.32) { o.prev = { pose: p.pose, since: since + 1, dir: dir(p.dir ?? K.dir) }; o.mix = since / 0.32; }
    k.rig.update(t, s.pose, o);
  }

  // ================================================================ tr_a_mirrors
  SH.tr_a_mirrors = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 77, r = rng(seed * 31 + 5);
      const show = P.show || 'both';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const defs = el(svg, 'defs');
      const cy = H * 0.465, rx = W * 0.15, ry = H * 0.28;
      const sides = [];
      const mkSide = (key, cx, future) => {
        const id = `tra-clip-${seed}-${key}`;
        const cp = el(defs, 'clipPath', { id });
        const clipE = el(cp, 'ellipse', { cx: 0, cy: 0, rx: rx - 8, ry: ry - 8 });
        const g = el(cam, 'g'), inner = el(g, 'g');
        const glow = mk(g, INK.gold, { 'fill-opacity': 0 });
        const handleF = mk(g, INK.paperDark), handleR = mk(g);
        const glassF = mk(g, future ? INK.paperLight : mix(INK.paperDark, INK.stain, 0.25));
        const sceneG = el(g, 'g', { 'clip-path': `url(#${id})` }), sc = el(sceneG, 'g');
        const back = mk(sc, INK.inkSoft, { 'fill-opacity': 0.55 }), sunF = mk(sc, INK.gold, { 'fill-opacity': 0.8 }), lineR = mk(sc, INK.inkSoft);
        const houseF = mk(sc, INK.paperLight), houseR = mk(sc), winF = mk(sc, INK.gold, { 'fill-opacity': 0.75 });
        const groundF = mk(sc, INK.paperDark), figR = mk(sc), figC = mk(sc, INK.red);
        const dim = mk(sceneG, INK.paperDark, { 'fill-opacity': 0 });
        const shine = mk(g, INK.paperLight, { 'fill-opacity': 0.8 });
        const frameR = mk(g), frame2 = mk(g, INK.inkSoft);
        const S = (key === 'left' ? P.left : P.right) || {};
        const plate = el(g, 'g');
        const plateF = mk(plate, INK.paperLight), plateR = mk(plate);
        const yr = txt(plate, S.year || (future ? '2076' : '1976'), 96, { fill: future ? INK.red : INK.ink, sw: 0 });
        const note = future && S.note !== false ? txt(g, S.note || 'tahmin', 46, { hand: true, fill: INK.red }) : null;
        // contents (local coords centred on the mirror)
        const houses = [], figs = [], towers = [];
        if (!future) {
          for (let i = 0; i < 4; i++) houses.push({ x: -rx * 0.8 + i * rx * 0.42 + r() * 20, w: 90 + r() * 40, h: 70 + r() * 30 });
          const kinds = ['a', 'a', 'c', 'c', 'c', 'c'];
          kinds.forEach((k, i) => figs.push({ k, x0: -rx * 0.62 + i * rx * 0.24, sc: k === 'c' ? 0.95 : 1.45, run: k === 'c' && i % 2 === 0, sp: 40 + r() * 30 }));
        } else {
          for (let i = 0; i < 7; i++) towers.push({ x: -rx * 0.95 + i * rx * 0.3, w: 70 + r() * 30, h: ry * (0.55 + r() * 0.5) });
          ['e', 'e', 'e', 'c', 'e'].forEach((k, i) => figs.push({ k, x0: -rx * 0.6 + i * rx * 0.3, sc: k === 'c' ? 0.95 : 1.45, run: false, sp: 0 }));
        }
        sides.push({ key, cx, future, g, sc, clipE, glow, handleF, handleR, glassF, back, sunF, lineR, houseF, houseR, winF, groundF, figR, figC, dim, shine, frameR, frame2, plate, plateF, plateR, yr, note, houses, figs, towers, S });
      };
      if (show !== 'right') mkSide('left', show === 'left' ? W * 0.36 : W * 0.25, false);
      if (show !== 'left') mkSide('right', show === 'right' ? W * 0.64 : W * 0.75, true);
      const kG = el(cam, 'g');
      const kas = kasifOf(P.kasif === false ? null : (P.kasif || {}), kG, seed, 0.95);
      const lab = P.label ? txt(root, P.label.text, P.label.size || 76, { hand: true, fill: COL[P.label.color] || INK.red }) : null;
      let lastStep = -1;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const z = lerp(1, (P.cam && P.cam.zoom) || 1.05, progIO(lt, 0, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(W / 2 + Math.sin(lt * 0.3) * 6)} ${f1(H * 0.5 + Math.cos(lt * 0.23) * 5)}) scale(${z.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.5)})`);
          // thumbnail (engine cover: scene shifted right + text on the left): mirrors move right, smaller; the shot's
          // own Kaşif hides (the engine draws the big cover Kaşif instead). P.cover: {left: 0.42, right: 0.7, k: 0.8} | false
          const CV = P.cover === false ? null : Object.assign({ left: 0.42, right: 0.7, k: 0.8 }, P.cover || {});
          const isCover = !!CV && document.documentElement.classList.contains('cover') && show === 'both';
          kG.style.display = isCover ? 'none' : '';
          const L = P.light || {};
          const la = atOr(cues, L.left, null), ra = atOr(cues, L.right, null);
          let lit = null; { const cand = [['left', la], ['right', ra]].filter(c => c[1] != null && lt >= c[1]).sort((a, b) => b[1] - a[1]); if (cand.length) lit = cand[0]; }
          sides.forEach((s, si) => {
            const O = (k, x) => Object.assign({ seed: sd + si * 500 + k, t, amp: 1.6 }, x);
            const app = atOr(cues, s.S.at, si * 0.25), sp = lt >= app ? spring(lt, app, 0.8) : 0;
            const isLit = lit && lit[0] === s.key, litS = isLit ? lt - lit[1] : 0, pk = isLit ? punch(lt, lit[1], 0.7) : 0;
            const dimmed = lit && !isLit;
            const scl = Math.max(0.001, isCover ? 1 : sp) * (1 + 0.06 * pk + 0.04 * hit) * (isLit ? 1.03 : 1) * (isCover ? CV.k : 1);
            const cxx = isCover ? W * (s.key === 'left' ? CV.left : CV.right) : s.cx;
            const bob = Math.sin(lt * 1.1 + si * 2) * 6, tilt = Math.sin(lt * 0.7 + si) * 1.6 + (si ? 3 : -3);
            s.g.setAttribute('transform', `translate(${f1(cxx)} ${f1(cy + bob)}) rotate(${f1(tilt)}) scale(${scl.toFixed(4)})`);
            s.glow.setAttribute('fill-opacity', isLit ? f1(0.55 * sm(litS / 0.4) * 10) / 10 : 0);
            s.dim.setAttribute('fill-opacity', dimmed ? 0.45 : 0);
            if (!redraw && lt > 0.05) {   // between boil steps only the walkers move
              drawFigs(s, t, lt, O, false); return;
            }
            const ell = inkEllipsePts(0, 0, rx, ry, sd + si * 7, 22);
            const ell2 = inkEllipsePts(0, 0, rx + 22, ry + 22, sd + si * 7 + 3, 22);
            s.glow.setAttribute('d', inkLoop(inkEllipsePts(0, 0, rx + 46, ry + 46, sd + si * 9, 20), O(1, { amp: 3 })));
            s.glassF.setAttribute('d', inkLoop(ell, O(2)));
            s.frameR.setAttribute('d', inkPath(ell, O(3, { w: 9, closed: true })) + ' ' + inkPath(ell2, O(4, { w: 7, closed: true })));
            s.frame2.setAttribute('d', ell2.map((p, i) => i % 2 ? '' : inkDot(p[0], p[1], 7, 7, sd + si * 40 + i, t)).join(' '));
            const hy = ry + 20, hp = [[-30, hy], [30, hy], [24, hy + 115], [-24, hy + 115]];
            s.handleF.setAttribute('d', inkLoop(hp, O(5, { smooth: false })));
            s.handleR.setAttribute('d', inkPath(hp, O(6, { w: 7, closed: true, smooth: false })) + ' ' + inkPath([[-24, hy + 60], [24, hy + 60]], O(7, { w: 5 })));
            s.shine.setAttribute('d', inkPath([[-rx * 0.62, -ry * 0.35], [-rx * 0.5, -ry * 0.58], [-rx * 0.3, -ry * 0.74]], O(8, { w: 10 })));
            // plate with the year
            const py = ry - 30, pw = 230, ph = 104;
            const pr = [[-pw / 2, py - ph / 2], [pw / 2, py - ph / 2], [pw / 2, py + ph / 2], [-pw / 2, py + ph / 2]];
            s.plateF.setAttribute('d', inkLoop(pr, O(9, { smooth: false })));
            s.plateR.setAttribute('d', inkPath(pr, O(10, { w: 6, closed: true, smooth: false })));
            const jb = boil(sd + si * 13, t, 1.2);
            s.yr.setAttribute('x', f1(jb[0])); s.yr.setAttribute('y', f1(py + 34 + jb[1]));
            if (s.note) { s.note.setAttribute('x', f1(rx * 0.55)); s.note.setAttribute('y', f1(py + 100)); s.note.setAttribute('transform', `rotate(-6 ${f1(rx * 0.55)} ${f1(py + 100)})`); }
            // scene inside
            const gy = ry * 0.42;
            s.groundF.setAttribute('d', inkLoop([[-rx - 20, gy], [rx + 20, gy - 6], [rx + 20, ry + 20], [-rx - 20, ry + 20]], O(11, { smooth: false })));
            if (!s.future) {
              s.back.setAttribute('d', inkLoop([[-rx - 20, gy], [-rx * 0.6, gy - ry * 0.32], [-rx * 0.1, gy - ry * 0.12], [rx * 0.4, gy - ry * 0.4], [rx + 20, gy - ry * 0.15], [rx + 20, gy]], O(12)));
              s.back.setAttribute('fill-opacity', 0.25);
              const sx = rx * 0.45, sy = -ry * 0.62;
              s.sunF.setAttribute('d', inkCircle(sx, sy, 44, sd + 21, t, { fill: true }));
              let rays = inkCircle(sx, sy, 44, sd + 21, t, { w: 5 });
              for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + lt * 0.15; rays += ' ' + inkPath([[sx + Math.cos(a) * 58, sy + Math.sin(a) * 58], [sx + Math.cos(a) * 80, sy + Math.sin(a) * 80]], O(30 + i, { w: 4 })); }
              s.lineR.setAttribute('d', rays);
              let hf = '', hr = '', wf = '';
              s.houses.forEach((h, i) => {
                const by = gy - 4 - (i % 2) * 30, ty = by - h.h;
                const pts = [[h.x, by], [h.x, ty], [h.x + h.w, ty - 4], [h.x + h.w, by]];
                hf += inkLoop(pts, O(40 + i, { smooth: false })) + ' ';
                hr += inkPath(pts, O(40 + i, { w: 5, closed: true, smooth: false })) + ' ' + inkPath([[h.x - 8, ty], [h.x + h.w + 8, ty - 4]], O(50 + i, { w: 7 })) + ' ';
                wf += inkLoop([[h.x + h.w * 0.3, by - h.h * 0.65], [h.x + h.w * 0.55, by - h.h * 0.65], [h.x + h.w * 0.55, by - h.h * 0.35], [h.x + h.w * 0.3, by - h.h * 0.35]], O(60 + i, { smooth: false, amp: 1 })) + ' ';
              });
              s.houseF.setAttribute('d', hf); s.houseR.setAttribute('d', hr); s.winF.setAttribute('d', wf);
            } else {
              s.back.setAttribute('d', '');
              s.sunF.setAttribute('d', ''); s.lineR.setAttribute('d', '');
              let hf = '', hr = '', wf = '';
              s.towers.forEach((tw, i) => {
                const by = gy - 2, ty = by - tw.h;
                const pts = [[tw.x, by], [tw.x, ty], [tw.x + tw.w, ty], [tw.x + tw.w, by]];
                hf += inkLoop(pts, O(40 + i, { smooth: false })) + ' ';
                hr += inkPath(pts, O(40 + i, { w: 5, closed: true, smooth: false })) + ' ';
                for (let yy = ty + 26; yy < by - 30; yy += 46) for (let xx = tw.x + 14; xx < tw.x + tw.w - 20; xx += 26)
                  if ((xx * 7 + yy * 3 + i) % 5 < 3) wf += inkLoop([[xx, yy], [xx + 12, yy], [xx + 12, yy + 18], [xx, yy + 18]], O(70 + i, { smooth: false, amp: 0.6 })) + ' ';
              });
              s.houseF.setAttribute('d', hf); s.houseR.setAttribute('d', hr); s.winF.setAttribute('d', wf);
              s.winF.setAttribute('fill', INK.blue); s.winF.setAttribute('fill-opacity', 0.5);
            }
            drawFigs(s, t, lt, O, true);
          });
          kasifUpdate(kas, lt, t, cues, W, H * 0.86);
          if (lab) {
            const la2 = atOr(cues, P.label.at, 0.4), ls = lt >= la2 ? spring(lt, la2, 0.6) : 0, b = boil(sd + 900, t, 1.4);
            lab.setAttribute('opacity', clamp01(ls * 2));
            lab.setAttribute('transform', `translate(${f1(W * (P.label.x ?? 0.5) + b[0])} ${f1(H * (P.label.y ?? 0.1) + b[1])}) rotate(-3) scale(${lerp(0.5, 1, ls).toFixed(3)})`);
          }
        },
      };
      function drawFigs(s, t, lt, O, full) {
        const gy = ry * 0.42;
        let d = '', dc = '';
        s.figs.forEach((f, i) => {
          let x = f.x0, ph = 0, y = gy + 26 + (i % 2) * 10;
          if (f.run) { const span = rx * 2.2; x = ((f.x0 + rx * 1.1 + lt * f.sp * 2.2) % span + span) % span - rx * 1.1; ph = lt * 2.2 + i * 0.3; }
          else if (f.k === 'e') ph = Math.sin(lt * 1.3 + i) * 0.04;
          else y += -Math.abs(Math.sin(lt * 2.4 + i)) * 4;
          const dd = figure(f.k, sd + s.key.length * 100 + i * 17, t, ph, 5 / f.sc * 1.3);
          const tf = `translate(${f1(x)} ${f1(y)}) scale(${f.sc})`;
          const part = `<path transform="${tf}" d="${dd}"/>`;
          if (s.future && f.k === 'c') dc += part; else d += part;
        });
        // figures go into <g> wrappers (innerHTML of a path list) — rebuild only these two holders
        setGroup(s, 'figR', d, INK.ink); setGroup(s, 'figC', dc, INK.red);
      }
      function setGroup(s, key, html, fill) {
        let g = s[key + 'G'];
        if (!g) { g = el(s.sc, 'g', { fill }); s[key + 'G'] = g; }
        g.innerHTML = html;
      }
    },
  };

  // ================================================================ tr_a_people
  SH.tr_a_people = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 313;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const n0 = P.n ?? 40, G = P.grow || null, n1 = G ? G.n || 0 : 0, total = n0 + n1;
      const cols = P.cols ?? 10, rows = Math.ceil(total / cols);
      const area = P.area || [0.05, 0.2, 0.6, 0.86];
      const ax0 = area[0] * W, ay0 = area[1] * H, aw = (area[2] - area[0]) * W, ah = (area[3] - area[1]) * H;
      const cw = aw / cols, rh = ah / rows, fs = Math.min(cw / 42, rh / 108);
      const pat = P.mix || 'aacc';
      const figs = Array.from({ length: total }, (_, i) => ({ i, k: pat[i % pat.length], x: ax0 + cw * (i % cols + 0.5), y: ay0 + rh * (Math.floor(i / cols) + 0.92), batch: i < n0 ? 0 : 1 }));
      const figG = el(cam, 'g'), paths = figs.map(() => mk(figG));
      const ui = el(root, 'g');
      const C0 = P.count || {};
      const nx = W * (P.count_x ?? 0.8), ny = H * 0.4;
      const yearT = P.year ? txt(ui, P.year.text, 84, { fill: INK.inkSoft }) : null;
      const num = txt(ui, '0', 230, { fill: COL[C0.color] || INK.ink, sw: 16 });
      const unit = C0.unit ? txt(ui, C0.unit, 72, { hand: true, fill: INK.inkSoft }) : null;
      const unitNote = C0.note ? txt(ui, C0.note, 46, { hand: true, fill: INK.red }) : null;
      const noteT = P.note ? txt(ui, P.note.text, P.note.size || 80, { hand: true, fill: COL[P.note.color] || INK.red }) : null;
      const noteU = P.note ? mk(ui, COL[P.note.color] || INK.red) : null;
      const kG = el(root, 'g');
      const kas = kasifOf(P.kasif === false ? null : (P.kasif || null), kG, seed, 0.7);
      const SP = P.split || null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hitAt = atOr(cues, 'hit', null), hit = punch(lt, hitAt, 0.7);
          const z = lerp(1, 1.04, progIO(lt, 0, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(ax0 + aw / 2 + Math.sin(lt * 0.3) * 5)} ${f1(ay0 + ah / 2)}) scale(${z.toFixed(4)}) translate(${f1(-ax0 - aw / 2)} ${f1(-ay0 - ah / 2)})`);
          const a0 = atOr(cues, P.at, 0), gAt = G ? atOr(cues, G.at, dur * 0.4) : 0, gDur = G ? G.dur ?? 1.6 : 1;
          const spAt = SP ? atOr(cues, SP.at, dur * 0.45) : 0, spDur = SP ? SP.dur ?? 1.4 : 1;
          const step = inkFrame(t);
          figs.forEach((f, j) => {
            const start = f.batch === 0 ? a0 + (j / Math.max(1, n0)) * Math.min(1.6, dur * 0.3) : gAt + ((j - n0) / Math.max(1, n1)) * gDur;
            const s = lt >= start ? spring(lt, start, 0.5) : 0;
            const pth = paths[j];
            if (s <= 0.001) { pth.setAttribute('d', ''); return; }
            const bob = f.k === 'c' ? -Math.abs(Math.sin(lt * 3 + j * 0.7)) * 5 : Math.sin(lt * 1.5 + j * 0.9) * 1.5;
            const scl = fs * (f.k === 'c' ? 0.68 : 1) * s;
            pth.setAttribute('transform', `translate(${f1(f.x)} ${f1(f.y + bob)}) scale(${scl.toFixed(3)})`);
            if (pth._st !== step) { pth.setAttribute('d', figure(f.k, sd + j * 13, t, 0, 6)); pth._st = step; }
            let col = INK.ink;
            if (G && f.batch === 0 && lt >= gAt) col = INK.inkSoft;
            if (G && f.batch === 1) col = INK.red;
            if (SP && j < SP.k && lt >= spAt + (j / SP.k) * spDur) col = COL[SP.color] || INK.red;
            pth.setAttribute('fill', col);
          });
          // counter
          const ca = atOr(cues, C0.at, 0.2), cd = C0.dur ?? 2;
          const v = lerp(C0.from ?? 0, C0.to ?? n0, sm((lt - ca) / cd));
          num.textContent = fmtNum(Math.round(v));
          const ns = spring(lt, Math.max(0, ca - 0.3), 0.6) * (1 + 0.1 * hit), b = boil(sd + 1, t, 1.5);
          num.setAttribute('transform', `translate(${f1(nx + b[0])} ${f1(ny + b[1])}) scale(${Math.max(0.001, ns).toFixed(3)})`);
          if (yearT) { const ys = spring(lt, atOr(cues, P.year.at, 0), 0.6); yearT.setAttribute('opacity', clamp01(ys * 2)); yearT.setAttribute('transform', `translate(${f1(nx)} ${f1(ny - 230)}) scale(${lerp(0.6, 1, ys).toFixed(3)})`); }
          if (unit) { const us = spring(lt, ca + 0.2, 0.6); unit.setAttribute('opacity', clamp01(us * 2)); unit.setAttribute('transform', `translate(${f1(nx)} ${f1(ny + 80)}) rotate(-2)`); }
          if (unitNote) { unitNote.setAttribute('transform', `translate(${f1(nx + 150)} ${f1(ny - 170)}) rotate(-8)`); unitNote.setAttribute('opacity', clamp01(spring(lt, ca + cd * 0.6, 0.5) * 2)); }
          if (noteT) {
            const na = atOr(cues, P.note.at, dur * 0.6), s2 = lt >= na ? spring(lt, na, 0.6) : 0, nb = boil(sd + 3, t, 1.4);
            const px = W * (P.note.x ?? 0.8), py = H * (P.note.y ?? 0.56);
            noteT.setAttribute('opacity', clamp01(s2 * 2));
            noteT.setAttribute('transform', `translate(${f1(px + nb[0])} ${f1(py + nb[1])}) rotate(-4) scale(${lerp(0.4, 1, s2).toFixed(3)})`);
            const tw = noteT.getComputedTextLength ? noteT.getComputedTextLength() : 200, u = lt >= na ? prog(lt, na + 0.3, 0.4) : 0;
            noteU.setAttribute('d', u > 0.01 ? inkPath([[px - tw / 2, py + 22], [px - tw / 2 + tw * u, py + 14]], { seed: sd + 9, t, w: 7 }) : '');
          }
          kasifUpdate(kas, lt, t, cues, W, H * (P.kasif && P.kasif.y || 0.9));
        },
      };
    },
  };
})();
