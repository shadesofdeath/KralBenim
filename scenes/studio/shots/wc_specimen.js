// wc_specimen — a naturalist's / archivist's plate: one hero object (any WC.G generator) painted large on clean
// paper. It paints itself in, structure first (washes, form, shadow, then the ink), over a soft shadow wash; then
// hand-written notes (Caveat) appear one by one with pen leader lines pointing at parts of it; an optional small serif
// title with an italic subtitle; the object breathes very slowly (or turns a few degrees) while we listen.
// The object is fitted to the plate automatically: on a Short it stays inside y 220–1120 (notes never in the subtitle
// band y 1170–1320), on a long video inside the upper picture (subtitles are at the bottom).
// params:
//   g: "<WC.G name>" (required: sword, astrolabe, tablet, hourglass, helmet, coin, ... see wc_g_objects.js)
//   o: {generator options} (e.g. {"style": "kilij"}) · seed: variant number
//   s: size × the automatic fit (default 1; .8 smaller, 1.2 bigger) · rot: degrees (e.g. -28 lays a sword diagonally)
//   x, y: centre of the object (0..1 of the stage; default: the middle of the plate)
//   at: when painting starts (s | cue; default .15) · paint: seconds to paint it in (default 1.5)
//   drift: "float" (default: a slow breath, ±0.6°) | "turn" (a slow 4° turn over the scene) | "none"
//   notes: [{text, at (s | cue | {cue, d}), part: "<name>" (a named point of the object: "tip", "hilt", "rete", ...;
//            generic: top, bottom, left, right, center) or ax, ay (a point on the stage, 0..1),
//            x, y (label position 0..1: the label's end nearest the anchor; default: placed beside the object),
//            size, color: "red", bend, align: "left"|"right"|"center"}]   (keep them to 1–4 words)
//   title: {text, sub, at, align: "left"|"center"|"right"}   (default: centred on a Short, top-right on a long video)
//   ground: true (default: a soft cast shadow under it; tilted objects get a soft drop shadow) | "floor" | "drop" | false
//   pigment: colour token for a loose bloom of wash behind the object ("sky", "skyWarm", "stain", "clothC", ...)
//   mist: seconds | cue — the plate washes back to paper
'use strict';

(() => {
  const C = WC.C, { clamp, seg, ss, eo, eio, rnd } = WC, DEG = Math.PI / 180;

  const rotP = ([x, y], a) => { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
  // extents of a stroke list rotated by a about (cx, cy): [x0, y0, x1, y1] relative to that centre
  function extents(S, a, cx, cy) {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const s of S) {
      const pts = s.pts;
      for (let i = 0; i < pts.length; i += (s.poly ? 1 : 2)) {
        const w = s.poly ? 0 : (s.ws[i] || 0) / 2, [x, y] = rotP([pts[i][0] - cx, pts[i][1] - cy], a);
        x0 = Math.min(x0, x - w); x1 = Math.max(x1, x + w); y0 = Math.min(y0, y - w); y1 = Math.max(y1, y + w);
      }
    }
    return x0 > x1 ? [-1, -1, 1, 1] : [x0, y0, x1, y1];
  }

  // a smooth irregular wash outline (low-frequency wobble, no zigzag): call inside WC.withSeed
  function softBlob(cx, cy, rx, ry, j = .12, n = 96) {
    const ph = [rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3)], out = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + j * (Math.sin(2 * a + ph[0]) * .5 + Math.sin(3 * a + ph[1]) * .3 + Math.sin(5 * a + ph[2]) * .15 + Math.sin(9 * a + ph[3]) * .06); out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    return out;
  }

  SHOTS.wc_specimen = {
    kind: '2d',
    build(ctx) {
      const { W, H, P, seed } = ctx, portrait = H > W, X = WC.canvas(ctx);
      const name = P.g || 'astrolabe';
      if (!WC.G[name]) throw new Error('wc_specimen: unknown object "' + name + '" (WC.G)');
      const o = Object.assign({}, P.o || {}, { shadow: false });
      const rot = (P.rot || 0) * DEG, sd = (P.seed ?? 1) + seed * 13;
      const T = P.title && P.title.text ? P.title : null, notes = P.notes || [];
      // the plate: where the object may sit
      const box = portrait ? { x0: 110, x1: W - 110, y0: T ? 340 : 230, y1: 1110 } : { x0: W * .17, x1: W * .83, y0: T ? 200 : 110, y1: 860 };
      const bw = box.x1 - box.x0, bh = box.y1 - box.y0;
      // fit: measure the object at sc 1 (rotated), then build it at the scale it will be shown
      const g1 = WC.withSeed(sd * 7919 + 3, () => WC.G[name](1, o)), b1 = WC.bbox(g1.S, 0);
      const e1 = extents(g1.S, rot, (b1[0] + b1[2]) / 2, (b1[1] + b1[3]) / 2);
      const k = (notes.length && portrait ? .86 : .94) * (P.s ?? 1);
      const sc = Math.round(clamp(Math.min(bw / (e1[2] - e1[0]), bh / (e1[3] - e1[1])) * k, .15, 5) * 100) / 100;
      const g = WC.make(name, sc, o, sd);
      const sb = [g.spr.x0 + 6, g.spr.y0 + 6, g.spr.x1 - 6, g.spr.y1 - 6], lc = [(sb[0] + sb[2]) / 2, (sb[1] + sb[3]) / 2];
      const E = extents(g.S, rot, lc[0], lc[1]);
      const Cs = [(P.x ?? (box.x0 + bw / 2) / W) * W, (P.y ?? (box.y0 + bh / 2) / H) * H];
      // keep the painted extents centred on Cs
      Cs[0] -= (E[0] + E[2]) / 2; Cs[1] -= (E[1] + E[3]) / 2;
      const objS = [Cs[0] + E[0], Cs[1] + E[1], Cs[0] + E[2], Cs[1] + E[3]];
      const parts = Object.assign({ top: [lc[0], sb[1] + 4], bottom: [lc[0], sb[3] - 4], left: [sb[0] + 4, lc[1]], right: [sb[2] - 4, lc[1]], center: lc.slice() }, g.parts || {});
      const t0 = P.at, paint = P.paint ?? 1.5, drift = P.drift || 'float', phase = WC.hash(seed) * 6.28;

      // ---- what sits under the object, baked once: a bloom of pigment, a floor shadow, or a drop shadow
      const groundKind = P.ground === false ? null : P.ground === 'floor' || P.ground === 'drop' ? P.ground : Math.abs(P.rot || 0) > 8 ? 'drop' : 'floor';
      const under = document.createElement('canvas'); under.width = W; under.height = H;
      WC.withSeed(sd * 31 + 11, () => {
        const c = under.getContext('2d'), ow = objS[2] - objS[0], oh = objS[3] - objS[1], cx = (objS[0] + objS[2]) / 2, cy = (objS[1] + objS[3]) / 2;
        if (P.pigment) {
          const pig = WC.col(P.pigment), rx = Math.max(ow * .62, W * (portrait ? .36 : .2)), ry = Math.max(oh * .6, H * (portrait ? .2 : .3));
          for (let i = 0; i < 4; i++) WC.washFill(c, WC.washShape(softBlob(cx + rnd(-.1, .1) * rx, cy + rnd(-.08, .08) * ry, rx * rnd(.78, 1), ry * rnd(.72, 1)), pig, rnd(.07, .1), 2, 1.5));
          for (let i = 0; i < 3; i++) { const y = cy + rnd(-.45, .45) * ry; WC.drawS(c, WC.mk(WC.qcurve(cx - rx * rnd(.6, .8), y, cx + rx * rnd(.6, .8), y + rnd(-30, 30), rnd(-40, 40), 16), rnd(30, 60), pig, { prof: 'leaf', nb: 8, a: .08 })); }
        }
        if (groundKind === 'floor') {
          const sc_ = WC.mixc(C.stoneDark, C.night, .3), gx = cx + ow * .04, gy = objS[3] - Math.min(14, oh * .02), rx = Math.max(ow * .5, 60), ry = clamp(rx * .1, 12, portrait ? 36 : 30);
          WC.washFill(c, WC.washShape(softBlob(gx, gy, rx * 1.15, ry * 1.6, .06), sc_, .12, 2, 1.2));
          WC.washFill(c, WC.washShape(softBlob(gx + rx * .04, gy, rx * .85, ry * .8, .05), sc_, .2, 2, 1));
          WC.drawS(c, WC.mk(WC.qcurve(gx - rx * 1.05, gy + ry * .4, gx + rx * 1.1, gy + ry * .3, rnd(-6, 6), 16), ry * .7, sc_, { prof: 'leaf', nb: 7, a: .08 }));
        }
      });
      let drop = null;
      if (groundKind === 'drop') {          // the object's own silhouette, softened, as a shadow on the paper
        const pad = 24, sw = g.spr.cv.width + pad * 2, sh = g.spr.cv.height + pad * 2;
        const s1 = document.createElement('canvas'); s1.width = sw; s1.height = sh;
        const c1 = s1.getContext('2d'); c1.drawImage(g.spr.cv, pad, pad); c1.globalCompositeOperation = 'source-in'; c1.fillStyle = WC.mixc(C.stoneDark, C.night, .35); c1.fillRect(0, 0, sw, sh);
        drop = document.createElement('canvas'); drop.width = sw; drop.height = sh;
        const c2 = drop.getContext('2d'); c2.globalAlpha = 1 / 9;
        for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28, r = i ? 6 : 0; c2.drawImage(s1, Math.cos(a) * r, Math.sin(a) * r); }
        drop.ox = g.spr.x0 - pad; drop.oy = g.spr.y0 - pad;
      }

      // ---- notes: anchors in object space, labels placed once (after the fonts are in)
      const fs = portrait ? 54 : 46;
      const topLim = portrait ? (T ? 330 : 150) : (T ? 230 : 70), botLim = portrait ? 1130 : 900;
      let placed = null;
      // each label goes where its leader is shortest: beside the object (left/right) or above/below it
      function place(dur) {
        const L = [], m = portrait ? 34 : 70, gap = 26;
        const n0 = tStart() + paint + .4, step = notes.length ? Math.min(1.1, Math.max(.45, (dur - 1.4 - n0) / notes.length)) : 1;
        notes.forEach((n, i) => {
          const size = n.size || fs;
          X.save(); X.font = WC.font(size, 600, 'hand'); const tw = X.measureText(n.text || '').width; X.restore();
          const loc = n.part && parts[n.part] ? parts[n.part] : null;
          const A = loc ? toScreen(loc, 0) : [(n.ax ?? .5) * W, (n.ay ?? .5) * H];
          let lx, ly, align;
          if (n.x != null && n.y != null) {
            lx = n.x * W; ly = n.y * H;
            align = n.align || (Math.abs(lx - A[0]) < 60 ? 'center' : lx < A[0] ? 'right' : 'left');
          } else {
            const cx = clamp(A[0], m + tw / 2, W - m - tw / 2), cand = [];
            if (objS[0] - m - gap >= tw) cand.push({ lx: objS[0] - gap, ly: A[1], align: 'right', d: A[0] - objS[0] + gap });
            if (W - m - objS[2] - gap >= tw) cand.push({ lx: objS[2] + gap, ly: A[1], align: 'left', d: objS[2] + gap - A[0] });
            const ya = objS[1] - size * .9, yb = objS[3] + size * 1.1;
            if (ya >= topLim) cand.push({ lx: cx, ly: ya, align: 'center', d: A[1] - ya + Math.abs(cx - A[0]) * .5 + 30 });
            if (yb <= botLim) cand.push({ lx: cx, ly: yb, align: 'center', d: yb - A[1] + Math.abs(cx - A[0]) * .5 + 30 });
            const best = cand.sort((a, b) => a.d - b.d)[0] || { lx: cx, ly: clamp(ya, topLim, botLim), align: 'center' };
            ({ lx, ly, align } = best);
          }
          ly = clamp(ly, topLim, botLim);
          L.push({ n, i, size, tw, loc, A, lx, ly, align, auto: !(n.x != null && n.y != null), t: WC.timeOf(n.at, curCues, n0 + i * step) });
        });
        // keep labels apart: side labels by height, labels above/below by width
        for (const side of ['left', 'right']) {
          const G = L.filter(q => q.auto && q.align === side).sort((a, b) => a.ly - b.ly);
          for (let j = 1; j < G.length; j++) if (G[j].ly - G[j - 1].ly < G[j].size * 1.25) G[j].ly = G[j - 1].ly + G[j].size * 1.25;
          for (let j = G.length - 1; j >= 0; j--) if (G[j].ly > botLim) { G[j].ly = botLim; if (j) G[j - 1].ly = Math.min(G[j - 1].ly, botLim - G[j].size * 1.25); }
        }
        for (const row of [...new Set(L.filter(q => q.auto && q.align === 'center').map(q => q.ly))]) {
          const G = L.filter(q => q.auto && q.align === 'center' && q.ly === row).sort((a, b) => a.lx - b.lx);
          for (let j = 1; j < G.length; j++) { const need = (G[j].tw + G[j - 1].tw) / 2 + 36; if (G[j].lx - G[j - 1].lx < need) G[j].lx = G[j - 1].lx + need; }
          const over = G.length ? G[G.length - 1].lx + G[G.length - 1].tw / 2 - (W - (portrait ? 34 : 70)) : 0;
          if (over > 0) for (const q of G) q.lx -= over;
        }
        return L;
      }
      let curCues = {}, curLt = 0;
      const tStart = () => WC.timeOf(t0, curCues, .15);
      const pose = lt => {
        const k = ss(seg(lt, tStart() + paint * .6, tStart() + paint + 1.2));
        let a = rot, dy = 0;
        if (drift === 'float') { a += Math.sin(lt * .42 + phase) * .6 * DEG * k; dy = Math.sin(lt * .55 + phase * 2) * (portrait ? 6 : 5) * k; }
        else if (drift === 'turn') a += (lt - tStart()) * .5 * DEG * k;
        return { a, dy };
      };
      function toScreen(p, lt) {
        const { a, dy } = pose(lt), q = rotP([p[0] - lc[0], p[1] - lc[1]], a);
        return [Cs[0] + q[0], Cs[1] + q[1] + dy];
      }
      function drawNote(q, lt) {
        if (lt < q.t) return;
        const A = q.loc ? toScreen(q.loc, lt) : q.A, x0 = q.align === 'right' ? q.lx - q.tw : q.align === 'center' ? q.lx - q.tw / 2 : q.lx, x1 = x0 + q.tw;
        let sx, sy;
        if (A[0] > x1 + 8 && q.align !== 'center') { sx = x1 + 12; sy = q.ly + 2; }
        else if (A[0] < x0 - 8 && q.align !== 'center') { sx = x0 - 12; sy = q.ly + 2; }
        else { sx = clamp(A[0], x0 + 12, x1 - 12); sy = q.ly + (A[1] > q.ly ? 1 : -1) * q.size * .62; }
        const bend = q.n.bend ?? (Math.abs(A[1] - sy) > 30 ? 16 : 10) * (q.i % 2 ? 1 : -1);
        WC.leader(X, sx, sy, A[0], A[1], seg(lt, q.t, q.t + .6), bend);
        WC.hand(X, q.n.text, q.lx, q.ly, seg(lt, q.t + .3, q.t + 1.3), { size: q.size, align: q.align, col: q.n.color === 'red' ? C.red : C.ink });
      }

      function update(lt, dur, cues) {
        X.clear();
        curCues = cues || {}; curLt = lt;
        const s0 = tStart(), p = clamp((lt - s0) / paint);
        // under-painting: a bloom of pigment and the floor shadow spread out from the middle
        const ur = eo(seg(lt, s0 - .1, s0 + paint * .7));
        if (ur > 0) {
          const cx = (objS[0] + objS[2]) / 2, cy = (objS[1] + objS[3]) / 2;
          X.save(); X.beginPath(); X.ellipse(cx, cy, W * 1.2 * ur + 1, H * 1.2 * ur + 1, 0, 0, 7); X.clip(); X.globalAlpha = ss(ur); X.drawImage(under, 0, 0); X.restore();
        }
        const { a, dy } = pose(lt), q = rotP(lc, a), x = Cs[0] - q[0], y = Cs[1] - q[1] + dy;
        if (drop && p > 0) {
          X.save(); X.translate(x + W * .008, y + H * (portrait ? .008 : .016)); X.rotate(a); X.globalAlpha = .22 * ss(seg(p, .2, 1)); X.drawImage(drop, drop.ox, drop.oy); X.restore();
        }
        if (p > 0) WC.drawObj(X, g, x, y, p, { rot: a });
        if (g.live) {
          const rv = ss(seg(lt, s0 + paint * .6, s0 + paint + .5));
          if (rv > 0) { X.save(); X.translate(x, y); X.rotate(a); g.live(X, lt, { reveal: rv }); X.restore(); }
        }
        // title
        if (T) {
          const ta = WC.timeOf(T.at, curCues, s0 + .2), al = T.align || (portrait ? 'center' : 'right');
          const tx = al === 'center' ? W / 2 : al === 'left' ? (portrait ? 70 : 110) : W - (portrait ? 70 : 110), ty = portrait ? 205 : 132;
          X.save(); X.font = WC.font(portrait ? 84 : 72, 600); const twd = X.measureText(T.text).width; X.restore();
          const size = Math.min(portrait ? 84 : 72, (portrait ? 84 : 72) * (W - 140) / Math.max(1, twd));
          WC.serif(X, T.text, tx, ty, seg(lt, ta, ta + 1.1), { size, align: al });
          if (T.sub) WC.serif(X, T.sub, tx, ty + size * .78, seg(lt, ta + .5, ta + 1.6), { size: size * .56, align: al, italic: true, w: 500, col: C.inkSoft, a: .95 });
        }
        if (notes.length) { if (!placed) placed = place(dur); for (const n of placed) drawNote(n, lt); }
        if (P.mist != null) { const m0 = WC.timeOf(P.mist, curCues, dur - 1.2); WC.mist(X, W, H, seg(lt, m0, m0 + 1.6)); }
      }
      return { update: (lt, dur, cues) => update(lt, dur, cues || {}) };
    },
  };
})();
