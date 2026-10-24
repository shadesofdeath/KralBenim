// ro_fort: an abandoned colonial fort in parchment ink (theme "parchment", brand/kit/BRAND.md §3, §5). Written for the
// Roanoke "lost colony" (August 1590, "CROATOAN"), parametric for any deserted settlement / carved-message moment.
// Every line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random.
// Needs mcB__lib.js (window.MCB: cast, labels, camPush).
// Planes: sky (drifting clouds, birds) · far pine tree line · cottages behind the stockade (steep thatched roofs that
// peek over the stakes; on `gone` they sink out of sight, a dust puff rises, thick dashed ghost outlines and fallen logs stay) · a palisade of
// pointed log stakes with an entrance gap · a big bark-covered post/tree with a stripped panel where a word is carved
// letter by letter (wood chips fly) · an optional dashed "ghost" cross that gets a red no-sign · ground with swaying
// grass · cast (Kaşif / fez narrator + period figures) · hand-written labels.
// P: {
//   ground: 0.62 (0..1 H, ground line), far: true (pine tree line), sky: {clouds: 3, birds: 3} | false,
//   palisade: {x0: -0.05, x1: 1.05, h: 330 (px), gap: [0.6, 0.72] (0..1 W)} | false,
//   houses: [{x: 0.2, w: 230, h: 470 (to the roof ridge)}], houses_front: false (true: drawn in front of the stakes),
//   stamp: {text, x: 0.5, y: 0.2, at, size: 150} (red box, Fraunces, slams in), gone: cue|s (houses sink away; negative = already gone,
//     only the ghost outlines are drawn), ghost: true,
//   post: {x: 0.3, w: 540, top: -0.05, base: 0.66 (0..1 H), panel: [0.34, 0.45] (stripped band, 0..1 H),
//          text: "CROATOAN", size: 96, at: cue|s (carving starts; negative = already carved), dur: 1.6} | false,
//   cross: {x: 0.5, y: 0.3 (0..1), size: 120, at: cue (dashed ghost cross draws in), no: cue (red no-sign)} | false,
//   cast: [MCB cast entries], labels: [MCB label entries], cam: {zoom: 1.06, focus: [0.5, 0.5]}, shake: cue
// }
// cues: hit (punch), gone, post.at, cross.at, cross.no, cast/label "at" names, shake.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const circ = (cx, cy, r, n = 12) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);

  SH.ro_fort = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MCB;
      const portrait = H > W, sd = seed * 1000 + 811;
      const S = portrait ? W / 1080 : H / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra = {}) => inkEl(cam, fill, extra);
      const gy = (P.ground ?? (portrait ? 0.62 : 0.78)) * H;

      const HF = !!P.houses_front, lay = {};
      Object.assign(lay, { cloudF: L(INK.paperLight), cloudI: L(INK.inkSoft), birds: L(INK.ink),
        farF: L(INK.paperDark, { 'fill-opacity': 0.7 }), farI: L(INK.inkSoft) });
      const mkHouses = () => Object.assign(lay, { houseF: L(INK.paperLight), houseD: L(INK.paperDark), houseI: L(INK.ink), ghost: L(INK.ink) });
      if (!HF) mkHouses();
      Object.assign(lay, { palF: L(INK.paperDark), palI: L(INK.ink) });
      if (HF) mkHouses();
      Object.assign(lay, { groundB: L(INK.paper), groundF: L(INK.paperDark, { 'fill-opacity': 0.55 }), groundI: L(INK.inkSoft),
        rubF: L(INK.paperDark), rubI: L(INK.ink), dust: L(INK.paperDark, { 'fill-opacity': 0.5 }),
        postF: L(INK.paperDark), postBark: L(INK.inkSoft), panelF: L(INK.paperLight), postI: L(INK.ink) });
      const letterG = el(cam, 'g');
      const chips = L(INK.hat);
      const crossG = el(cam, 'g');
      const crossI = inkEl(crossG, INK.inkSoft), crossR = inkEl(crossG, INK.red);
      const grassI = L(INK.ink);
      const castG = el(cam, 'g'), labG = el(root, 'g');
      let stamp = null;
      if (P.stamp && P.stamp.text) {
        const g = el(root, 'g'), size = (P.stamp.size || 150) * S;
        const box = inkEl(g, INK.red), tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': f1(size), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.paperLight });
        tx.textContent = String(P.stamp.text).toLocaleUpperCase(LOCALE);
        let w = 0; try { w = tx.getComputedTextLength(); } catch (e) { w = size * 3; }
        stamp = { g, box, w, size };
      }
      const cast = M && typeof KASIF !== 'undefined' ? M.cast(castG, P.cast, W, H, sd + 50) : null;
      const labs = M ? M.labels(labG, P.labels, W, H, sd + 70) : null;

      // ---- static layout
      const PL = P.palisade === false ? null : Object.assign({ x0: -0.05, x1: 1.05, h: 330, gap: [0.6, 0.72] }, P.palisade || {});
      const stakes = [];
      if (PL) {
        const r = rng(sd + 3), sw = 58 * S;
        for (let x = PL.x0 * W; x < PL.x1 * W; x += sw) {
          const cx = x + sw / 2;
          if (PL.gap && cx > PL.gap[0] * W && cx < PL.gap[1] * W) continue;
          stakes.push({ x0: x + 3 * S, x1: x + sw - 3 * S, h: PL.h * S * (0.9 + r() * 0.18), tip: (r() - 0.5) * 10 * S });
        }
      }
      const houses = (P.houses || []).map((h, i) => Object.assign({ w: 230, h: 470 }, h, { i }));
      const PO = P.post === false || P.post == null ? null : Object.assign({ x: 0.3, w: 540, top: -0.05, base: portrait ? 0.66 : 0.8,
        panel: [0.34, 0.45], text: '', size: 96, dur: 1.6 }, P.post);
      // carved letters, laid out once
      const letters = [];
      if (PO && PO.text) {
        const size = PO.size * S, cx = PO.x * W, cy = (PO.panel[0] + PO.panel[1]) / 2 * H;
        const meas = el(letterG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size });
        const chars = [...String(PO.text).toLocaleUpperCase(LOCALE)];
        const wid = [];
        chars.forEach(c => { meas.textContent = c; let w = 0; try { w = meas.getComputedTextLength(); } catch (e) { w = size * 0.7; } wid.push(w); });
        letterG.removeChild(meas);
        const gapL = size * 0.04, tot = wid.reduce((a, b) => a + b, 0) + gapL * (chars.length - 1);
        let x = cx - tot / 2;
        chars.forEach((c, i) => {
          const g = el(letterG, 'g');
          const sh = el(g, 'text', { x: f1(x + wid[i] / 2 + 3 * S), y: f1(cy + size * 0.36 + 4 * S), 'font-family': FR, 'font-weight': 900, 'font-size': f1(size), 'text-anchor': 'middle', fill: INK.paperDark });
          const tx = el(g, 'text', { x: f1(x + wid[i] / 2), y: f1(cy + size * 0.36), 'font-family': FR, 'font-weight': 900, 'font-size': f1(size), 'text-anchor': 'middle', fill: INK.ink });
          sh.textContent = c; tx.textContent = c;
          letters.push({ g, cx: x + wid[i] / 2, cy, i });
          x += wid[i] + gapL;
        });
      }
      const CR = P.cross ? Object.assign({ x: 0.5, y: 0.3, size: 120 }, P.cross) : null;

      // cottage shape (ridge at by - h)
      function house(h, by, A, t, o) {
        const cx = h.x * W, w = h.w * S, top = by - h.h * S, eave = by - h.h * S * 0.48;
        const body = rect(cx - w / 2, eave, cx + w / 2, by);
        const roof = [[cx - w / 2 - 26 * S, eave + 6 * S], [cx, top], [cx + w / 2 + 26 * S, eave + 6 * S]];
        if (A.F) {
          A.F.push(inkLoop(body, o(h.i * 20 + 1, { smooth: false })));
          A.I.push(inkPath(body, o(h.i * 20 + 2, { closed: true, smooth: false, w: 5 * S })));
          A.D.push(inkLoop(roof, o(h.i * 20 + 3, { smooth: false })));
          A.I.push(inkPath(roof, o(h.i * 20 + 4, { closed: true, smooth: false, w: 6 * S })));
          for (let k = 1; k < 5; k++) {        // thatch hatching
            const u = k / 5, y = lerp(top, eave, u);
            A.I.push(inkPath([[lerp(cx, cx - w / 2 - 20 * S, u) + 10 * S, y], [lerp(cx, cx + w / 2 + 20 * S, u) - 10 * S, y]], o(h.i * 20 + 5 + k, { w: 3 * S })));
          }
          const ch = rect(cx + w * 0.18, top + h.h * S * 0.14, cx + w * 0.3, top + h.h * S * 0.3);
          A.F.push(inkLoop(ch, o(h.i * 20 + 11, { smooth: false })));
          A.I.push(inkPath(ch, o(h.i * 20 + 12, { closed: true, smooth: false, w: 4 * S })));
        } else {                                // ghost: dashed roof + walls
          const seg = (a, b, n, s0) => { for (let k = 0; k < n; k += 2) A.G.push(inkPath([[lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)], [lerp(a[0], b[0], (k + 1) / n), lerp(a[1], b[1], (k + 1) / n)]], o(s0 + k, { w: 8 * S, amp: 1 }))); };
          seg(roof[0], roof[1], 9, 300 + h.i * 60); seg(roof[1], roof[2], 9, 320 + h.i * 60);
          seg([cx - w / 2, eave], [cx - w / 2, by], 7, 340 + h.i * 60); seg([cx - w / 2, eave], [cx + w / 2, eave], 9, 370 + h.i * 60); seg([cx + w / 2, eave], [cx + w / 2, by], 7, 350 + h.i * 60);
        }
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const o = base => (n, extra = {}) => Object.assign({ seed: base + n, t, amp: 1.4, w: 5 * S }, extra);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const shA = atOr(cues, P.shake, null);
          if (M) M.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.06, focus: [0.5, portrait ? 0.5 : 0.55] }, P.cam || {}), hit, shA == null ? 0 : punch(lt, shA, 0.7));

          // ---- sky
          const SK = P.sky === false ? null : Object.assign({ clouds: 3, birds: 3 }, P.sky || {});
          const cF = [], cI = [], bI = [];
          if (SK) {
            const r = rng(sd + 21);
            for (let c = 0; c < SK.clouds; c++) {
              const y = (portrait ? 0.17 : 0.14) * H + r() * 0.14 * H, w = (200 + r() * 140) * S, sp = (8 + r() * 10) * S;
              const x = ((r() * (W + w * 2) + lt * sp) % (W + w * 2)) - w;
              const pts = [[x - w / 2, y], [x - w * 0.35, y - w * 0.16], [x - w * 0.1, y - w * 0.26], [x + w * 0.15, y - w * 0.2], [x + w * 0.38, y - w * 0.12], [x + w / 2, y]];
              cF.push(inkLoop(pts, o(sd + 30 + c)(0, { amp: 2 })));
              cI.push(inkPath(pts.concat([pts[0]]), o(sd + 40 + c)(0, { w: 4 * S, amp: 2 })));
            }
            for (let b = 0; b < SK.birds; b++) {
              const bx = ((r() * W + lt * (60 + b * 14) * S) % (W + 200)) - 100, by = (0.2 + r() * 0.12) * H + Math.sin(lt * 1.3 + b) * 12 * S;
              const fl = Math.sin(lt * 9 + b * 2) * 10 * S, bw = 22 * S;
              bI.push(inkPath([[bx - bw, by - 6 * S + fl], [bx, by], [bx + bw, by - 6 * S + fl]], o(sd + 60 + b)(0, { w: 4 * S, amp: 0.8 })));
            }
          }
          lay.cloudF.setAttribute('d', cF.join(' ')); lay.cloudI.setAttribute('d', cI.join(' ')); lay.birds.setAttribute('d', bI.join(' '));

          // ---- far pines
          const fF = [], fI = [];
          if (P.far !== false) {
            const r = rng(sd + 81), base = gy - (PL ? PL.h * S * 0.55 : 0);
            for (let x = -30 * S; x < W + 40 * S; x += 70 * S) {
              const h = (200 + r() * 140) * S, w = (70 + r() * 30) * S, sway = Math.sin(lt * 1.1 + x * 0.01) * 4 * S;
              const tri = [[x - w / 2, base], [x + sway, base - h], [x + w / 2, base]];
              fF.push(inkLoop(tri, o(sd + 100 + Math.round(x))(0, { amp: 1.2, smooth: false })));
              fI.push(inkPath(tri, o(sd + 300 + Math.round(x))(0, { closed: true, smooth: false, w: 3.5 * S, amp: 1.2 })));
            }
          }
          lay.farF.setAttribute('d', fF.join(' ')); lay.farI.setAttribute('d', fI.join(' '));

          // ---- houses (behind the stockade)
          const ga = atOr(cues, P.gone, null), gp = ga == null ? 0 : progIO(lt, ga, 1.1);
          const A = { F: [], D: [], I: [] }, G = { G: [] }, DU = [], RF = [], RI = [];
          houses.forEach(h => {
            if (gp < 1) house(h, gy + gp * h.h * S * 1.05, A, t, o(sd + 500));
            if (P.ghost !== false && gp > 0.2) house(h, gy, G, t, o(sd + 700));
            if (ga != null && lt >= ga && lt < ga + 2.4) {
              const a = lt - ga;
              for (let j = 0; j < 3; j++) {
                const ph = clamp01((a - j * 0.1) / 2.2), x = h.x * W + (j - 1) * 70 * S + ph * 40 * S;
                const y = gy - 60 * S - ph * 220 * S, r0 = (40 + ph * 70) * S * (1 - ph);
                if (ph > 0 && ph < 1) DU.push(inkLoop(circ(x, y, r0, 9), { seed: sd + 900 + h.i * 10 + j, t, amp: 3 }));
              }
            }
            if (ga != null && gp > 0.35) {          // fallen logs + stones where the house stood
              const rp = spring(lt, ga + 0.4, 0.5), cx = h.x * W, w = h.w * S;
              [[-0.32, 0.12, 0.62], [0.18, -0.1, 0.55], [-0.02, 0.06, 0.8]].forEach(([u, rot, len], j) => {
                const L0 = w * len * rp, R = 15 * S, x0 = cx + u * w, y0 = gy + (12 + j * 16) * S;
                const c = Math.cos(rot), sn = Math.sin(rot), pts = [];
                for (let k = 0; k <= 6; k++) { const an = -Math.PI / 2 + k / 6 * Math.PI; pts.push([L0 / 2 + Math.cos(an) * R, Math.sin(an) * R]); }
                for (let k = 0; k <= 6; k++) { const an = Math.PI / 2 + k / 6 * Math.PI; pts.push([-L0 / 2 + Math.cos(an) * R, Math.sin(an) * R]); }
                const P2 = pts.map(q => [x0 + q[0] * c - q[1] * sn, y0 + q[0] * sn + q[1] * c]);
                if (rp > 0.02) {
                  RF.push(inkLoop(P2, { seed: sd + 1900 + h.i * 10 + j, t, amp: 1 }));
                  RI.push(inkPath(P2, { seed: sd + 1950 + h.i * 10 + j, t, amp: 1, closed: true, w: 5 * S }));
                  RI.push(inkPath(circ(x0 + L0 / 2 * c, y0 + L0 / 2 * sn, R * 0.6, 8), { seed: sd + 1980 + h.i * 10 + j, t, amp: 0.6, closed: true, w: 3 * S }));
                }
              });
              for (let j = 0; j < 3; j++) { const x = cx + (j - 1) * w * 0.42 + 20 * S, y = gy + 40 * S; if (rp > 0.02) { RF.push(inkLoop(circ(x, y, 14 * S * rp, 7), { seed: sd + 2990 + h.i * 5 + j, t, amp: 1 })); RI.push(inkPath(circ(x, y, 14 * S * rp, 7), { seed: sd + 2995 + h.i * 5 + j, t, amp: 1, closed: true, w: 3.5 * S })); } }
            }
          });
          lay.houseF.setAttribute('d', A.F.join(' ')); lay.houseD.setAttribute('d', A.D.join(' ')); lay.houseI.setAttribute('d', A.I.join(' '));
          lay.ghost.setAttribute('d', G.G.join(' '));
          lay.dust.setAttribute('d', DU.join(' ')); lay.rubF.setAttribute('d', RF.join(' ')); lay.rubI.setAttribute('d', RI.join(' '));

          // ---- palisade
          const pF = [], pI = [];
          if (PL) {
            stakes.forEach((s, i) => {
              const top = gy - s.h, mx = (s.x0 + s.x1) / 2 + s.tip;
              const pts = [[s.x0, gy + 6 * S], [s.x0, top + 30 * S], [mx, top], [s.x1, top + 30 * S], [s.x1, gy + 6 * S]];
              pF.push(inkLoop(pts, { seed: sd + 1000 + i, t, amp: 1.2, smooth: false }));
              pI.push(inkPath(pts, { seed: sd + 1200 + i, t, amp: 1.2, smooth: false, w: 5 * S }));
              pI.push(inkPath([[mx - 6 * S, top + 70 * S], [mx - 3 * S, top + 160 * S]], { seed: sd + 1400 + i, t, w: 2.5 * S, amp: 1 }));
            });
            for (const yy of [0.32, 0.72]) {      // binding rails
              const y = gy - PL.h * S * yy;
              const segs = [[PL.x0 * W, PL.gap ? PL.gap[0] * W : PL.x1 * W]].concat(PL.gap ? [[PL.gap[1] * W, PL.x1 * W]] : []);
              segs.forEach(([a, b], j) => pI.push(inkPath([[a, y], [b, y + 4 * S]], { seed: sd + 1600 + j + yy * 10, t, w: 5 * S, amp: 1.4 })));
            }
          }
          lay.palF.setAttribute('d', pF.join(' ')); lay.palI.setAttribute('d', pI.join(' '));

          // ---- ground + grass
          const gF = [inkLoop([[-60, gy], [W * 0.3, gy - 6 * S], [W * 0.7, gy + 4 * S], [W + 60, gy], [W + 60, H + 60], [-60, H + 60]], { seed: sd + 1700, t, amp: 1.5 })];
          const gI = [inkPath([[-40, gy], [W * 0.3, gy - 6 * S], [W * 0.7, gy + 4 * S], [W + 40, gy]], { seed: sd + 1701, t, w: 5 * S })];
          const r2 = rng(sd + 1702);
          for (let k = 0; k < 14; k++) { const x = r2() * W, y = gy + (40 + r2() * 300) * S; gI.push(inkPath([[x, y], [x + 50 * S, y + 3 * S]], { seed: sd + 1710 + k, t, w: 3 * S, amp: 1 })); }
          lay.groundB.setAttribute('d', gF.join(' ')); lay.groundF.setAttribute('d', gF.join(' ')); lay.groundI.setAttribute('d', gI.join(' '));
          const GR = [];
          for (let k = 0; k < 16; k++) {
            const x = (k + 0.3) / 16 * W, sway = Math.sin(lt * 2.2 + k * 0.9) * 9 * S, y = gy + 4 * S;
            for (let b = -1; b <= 1; b++) GR.push(inkPath([[x + b * 9 * S, y], [x + b * 14 * S + sway, y - (34 + (b === 0 ? 14 : 0)) * S]], { seed: sd + 1800 + k * 3 + b, t, w: 3.5 * S, amp: 0.8 }));
          }
          grassI.setAttribute('d', GR.join(' '));

          // ---- post / tree with the stripped panel
          if (PO) {
            const cx = PO.x * W, w = PO.w * S, top = PO.top * H, by = PO.base * H, sw = Math.sin(lt * 0.8) * 2 * S;
            const trunk = [[cx - w / 2, top], [cx + w / 2, top], [cx + w * 0.52, by - 40 * S], [cx + w * 0.6, by], [cx - w * 0.6, by], [cx - w * 0.52, by - 40 * S]];
            lay.postF.setAttribute('d', inkLoop(trunk, { seed: sd + 2000, t, amp: 1.4, smooth: false }));
            const py0 = PO.panel[0] * H, py1 = PO.panel[1] * H, pw = Math.min(w * 0.92, w - 24 * S);
            const bark = [], r3 = rng(sd + 2001);
            for (let k = 0; k < Math.max(3, Math.round(w / (34 * S))); k++) {
              const x = cx - w * 0.45 + (k + 0.5) / Math.max(3, Math.round(w / (34 * S))) * w * 0.9 + (r3() - 0.5) * 10 * S;
              const segs = [[top, py0 - 14 * S], [py1 + 14 * S, by - 10 * S]];
              segs.forEach(([a, b], j) => { if (b - a > 20 * S) bark.push(inkPath([[x, a + 8 * S], [x + 6 * S + sw, lerp(a, b, 0.5)], [x - 2 * S, b]], { seed: sd + 2010 + k * 2 + j, t, w: 3.5 * S, amp: 1.2 })); });
            }
            lay.postBark.setAttribute('d', bark.join(' '));
            const panel = [[cx - pw / 2, py0], [cx - pw * 0.2, py0 - 10 * S], [cx + pw * 0.25, py0 + 4 * S], [cx + pw / 2, py0 - 6 * S], [cx + pw / 2 + 4 * S, py1], [cx + pw * 0.1, py1 + 12 * S], [cx - pw / 2, py1 + 2 * S]];
            lay.panelF.setAttribute('d', inkLoop(panel, { seed: sd + 2100, t, amp: 1.2 }));
            lay.postI.setAttribute('d', inkPath(trunk, { seed: sd + 2101, t, closed: true, smooth: false, w: 6 * S }) + ' ' +
              inkPath(panel, { seed: sd + 2102, t, closed: true, w: 3.5 * S, amp: 1.2 }));
            // letters
            const ca = atOr(cues, PO.at, -1), per = PO.dur / Math.max(1, letters.length), CH = [];
            letters.forEach(L0 => {
              const a = ca + L0.i * per, p = lt >= a ? spring(lt, a, 0.35) : 0;
              const b = boil(sd + 2200 + L0.i, t, 1.2);
              L0.g.setAttribute('opacity', clamp01(p * 4).toFixed(3));
              L0.g.setAttribute('transform', `translate(${f1(L0.cx + b[0])} ${f1(L0.cy + b[1])}) scale(${Math.max(0.01, lerp(1.35, 1, clamp01(p))).toFixed(3)}) translate(${f1(-L0.cx)} ${f1(-L0.cy)})`);
              if (lt >= a && lt < a + 0.5) for (let j = 0; j < 4; j++) {   // wood chips
                const ph = (lt - a) / 0.5, ang = -2.4 + j * 0.55, d = (20 + ph * 90) * S;
                CH.push(inkDot(L0.cx + Math.cos(ang) * d, L0.cy - PO.size * 0.2 * S + Math.sin(ang) * d + ph * ph * 90 * S, 6 * S * (1 - ph * 0.5), 4 * S, sd + 2300 + L0.i * 5 + j, t));
              }
            });
            chips.setAttribute('d', CH.join(' '));
          }

          // ---- ghost cross + red no-sign
          if (CR) {
            const a = atOr(cues, CR.at, 0.2), np = atOr(cues, CR.no, null), p = lt >= a ? prog(lt, a, 0.6) : 0;
            const cx = CR.x * W, cy = CR.y * H, s = CR.size * S, arm = s * 0.28;
            const arms = [[[cx, cy - s], [cx, cy + s]], [[cx - s, cy], [cx + s, cy]]];
            const D = [];
            arms.forEach(([q0, q1], j) => {
              const n = 10;
              for (let k = 0; k < n * p; k += 2) D.push(inkPath([[lerp(q0[0], q1[0], k / n), lerp(q0[1], q1[1], k / n)], [lerp(q0[0], q1[0], Math.min(1, (k + 1) / n)), lerp(q0[1], q1[1], Math.min(1, (k + 1) / n))]], { seed: sd + 2400 + j * 20 + k, t, w: 9 * S, amp: 1 }));
              // flared ends (Maltese-like), dashed
              [q0, q1].forEach((q, e) => { if (p > 0.9) { const dx = j ? 0 : arm, dy = j ? arm : 0; D.push(inkPath([[q[0] - dx, q[1] - dy], [q[0] + dx, q[1] + dy]], { seed: sd + 2450 + j * 4 + e, t, w: 7 * S, amp: 1 })); } });
            });
            crossI.setAttribute('d', D.join(' '));
            const nq = np == null ? 0 : prog(lt, np, 0.28), pk = np == null ? 0 : punch(lt, np, 0.6), rr0 = s * 1.3;
            crossG.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${(1 + 0.1 * pk).toFixed(3)}) translate(${f1(-cx)} ${f1(-cy)})`);
            const ring = circ(cx, cy, rr0, 18), ringP = ring.slice(0, Math.max(2, Math.round(18 * nq) + 1));
            crossR.setAttribute('d', nq > 0.02 ? inkPath(nq >= 1 ? ring : ringP, { seed: sd + 2500, t, w: 16 * S, amp: 1.5, closed: nq >= 1 }) +
              (nq > 0.6 ? ' ' + inkPath([[cx - rr0 * 0.7, cy - rr0 * 0.7], [lerp(cx - rr0 * 0.7, cx + rr0 * 0.7, (nq - 0.6) / 0.4), lerp(cy - rr0 * 0.7, cy + rr0 * 0.7, (nq - 0.6) / 0.4)]], { seed: sd + 2501, t, w: 16 * S, amp: 1.5 }) : '') : '');
          }

          if (stamp) {
            const a = atOr(cues, P.stamp.at, dur * 0.5), p = lt >= a ? spring(lt, a, 0.5) : 0, b = boil(sd + 3100, t, 1.2);
            const x = (P.stamp.x ?? 0.5) * W, y = (P.stamp.y ?? 0.2) * H, bw = stamp.w + 70 * S, bh = stamp.size * 1.25;
            stamp.box.setAttribute('d', inkLoop([[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4 * S], [bw / 2 + 3 * S, bh / 2], [-bw / 2 - 2 * S, bh / 2 + 3 * S]], { seed: sd + 3101, t, amp: 1.5, smooth: false }));
            stamp.g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
            stamp.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-4) scale(${Math.max(0.01, lerp(1.8, 1, clamp01(p))).toFixed(3)})`);
          }
          if (cast) cast.update(lt, t, cues);
          if (labs) labs.update(lt, t, cues);
        },
      };
    },
  };
})();
