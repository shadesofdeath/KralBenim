// tbC_villa: the stormy summer of 1816 at Lake Geneva (Tambora long video, chapter 4). Parchment ink (BRAND §5).
//   tbC_lake  — Lake Geneva in a storm: far Alps with snow caps, the lake with drifting waves, a lakeside villa on a slope
//               with candle-lit windows (small figures inside), dark clouds, rain, lightning on cues
//   tbC_villa — inside the villa: tall window with rain and lightning, red curtains, bookshelf, candles; chairs for the
//               seated cast; optional speech bubble with a ghost doodle and words, optional writing desk where a
//               seated figure's quill fills a page with lines
//   tbC_book  — the birth of a book: a desk with a candle and a pile of manuscript pages that flutter; a bound book drops in
//               with its title on the cover; behind it a pinned page where a tall cloaked silhouette (the novel's
//               unnamed creature, faint gold eyes) rises beside a small human outline
// Common P: cast (TBC.cast entries; seated figures: pose "sit" + noseat: true + chair: true), labels (MCB labels),
//   cam: {zoom, focus, push: cue}, bolts: [cue, ...] (lightning), rain: {n} | false, ground: 0.86
// tbC_lake P: + villa: {x: 0.7, y: 0.6, s: 1, lit: cue (windows light up)}, lake: {y: 0.68}, alps: true,
//   clouds: {n: 6, y: 0.1}
// tbC_villa P: + window: {x: 0.5, w: 300, h: 420, y: 0.12 (top)}, shelf: {x: 0.12} | false,
//   candles: [{x, y (0..1 H, holder base), s: 1}], bubble: {at, from: cast index, text: "A GHOST STORY", ghost: true, x, y},
//   desk: {x: 0.5, w: 420, y: 0.7 (top)} | false, page: {who: cast index of the writer, at, lines: 6}
// tbC_book P: + book: {at, title: "FRANKENSTEIN", x: 0.42, y: 0.72}, pages: {at (flutter)}, sketch: {at, dur: 2.4,
//   x: 0.42, y: 0.32}, window: {x: 0.82, w: 240, h: 330, y: 0.1}, candle: {x: 0.72, y: 0.74, s: 1.1}
// cues: whatever the params name
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const T = () => window.TBC;
  function layers(ctx) {
    const { svg, seed } = ctx;
    const camG = el(svg, 'g');
    return { camG, bg: T().ink(el(camG, 'g'), seed * 3 + 1), mid: T().ink(el(camG, 'g'), seed * 3 + 2), castG: el(camG, 'g'),
      front: T().ink(el(camG, 'g'), seed * 3 + 3), fx: T().ink(el(camG, 'g'), seed * 3 + 4), labG: el(camG, 'g') };
  }
  const boltsOf = (P, cues) => (P.bolts || []).map(b => T().atOr(cues, b, null));
  // storm view inside a rectangle (window panes): hatching sky, rain streaks, lightning
  function stormIn(R, x, y, w, h, lt, ats, sd) {
    R.shape([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { f: INK.inkSoft, w: 0.1, smooth: false, fop: 0.85 });
    const r = rng(sd);
    for (let i = 0; i < 14; i++) {
      const xx = x + r() * w, ph = r(), yy = y + ((ph * h + lt * 700) % h), len = Math.min(46, y + h - yy);
      R.line([[xx, yy], [xx - len * 0.2, yy + len]], { w: 3, c: 'light', amp: 0.5, op: 0.8 });
    }
    const at = ats.filter(v => v != null && lt >= v && lt < v + 0.4).pop();
    if (at != null) {
      const k = 1 - (lt - at) / 0.4, bx = x + w * 0.55;
      R.fill([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], { c: INK.paperLight, op: 0.6 * k, smooth: false });
      R.shape([[bx, y + 6], [bx - 26, y + h * 0.35], [bx + 6, y + h * 0.38], [bx - 30, y + h * 0.75], [bx + 24, y + h * 0.3], [bx - 6, y + h * 0.28], [bx + 18, y + 6]], { f: INK.gold, w: 3.5, smooth: false });
    } else { R.fill(null); R.shape(null); }
    return at != null ? 1 - (lt - at) / 0.4 : 0;
  }
  function chair(R, x, gy, s, face) {
    R.shape([[x - face * 70 * s, gy - 300 * s], [x - face * 46 * s, gy - 300 * s], [x - face * 40 * s, gy], [x - face * 64 * s, gy]], { f: INK.stain, w: 4, smooth: false });
    R.shape([[x - face * 70 * s, gy - 112 * s], [x + face * 70 * s, gy - 112 * s], [x + face * 70 * s, gy - 90 * s], [x - face * 70 * s, gy - 90 * s]], { f: INK.red, w: 4, smooth: false });
    R.line([[x + face * 60 * s, gy - 92 * s], [x + face * 60 * s, gy]], { w: 6 });
  }

  // ------------------------------------------------------------------ tbC_lake
  SH.tbC_lake = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, L = layers(ctx);
      const gy = H * (P.ground ?? 0.86), ly = H * ((P.lake && P.lake.y) ?? 0.66);
      const cast = T().cast(L.castG, P.cast, W, H, seed * 11);
      const labs = T().labels(L.labG, P.labels, W, H, seed * 5);
      const alps = []; { const r = rng(seed + 77); for (let i = 0; i <= 12; i++) alps.push([lerp(-60, W + 60, i / 12), ly - 60 - (i % 2 ? 60 + r() * 110 : r() * 40)]); }
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, ats = boltsOf(P, cues);
          const fl = ats.some(v => v != null && lt >= v && lt < v + 0.5) ? 1 : 0;
          T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.06, focus: [0.65, 0.5] }, punch(lt, T().atOr(cues, P.cam && P.cam.push, null)), fl * 0.3);
          const { bg, mid, front, fx } = L;
          bg.begin(t); mid.begin(t); front.begin(t); fx.begin(t);
          T().clouds(bg, W, H * ((P.clouds && P.clouds.y) ?? 0.1), (P.clouds && P.clouds.n) ?? 5, lt, { dark: true, w: 400, seed: seed + 3, x0: W * 0.36, drift: 6 });
          // Alps with snow caps
          bg.shape(alps.concat([[W + 60, ly], [-60, ly]]), { f: INK.paperDark, w: 5, smooth: false });
          alps.forEach((p, i) => { if (i % 2 && i < alps.length - 1) bg.shape([[p[0] - 40, p[1] + 34], p, [p[0] + 40, p[1] + 34], [p[0] + 12, p[1] + 24], [p[0] - 10, p[1] + 38]], { f: INK.paperLight, w: 3.5, smooth: false }); });
          // lake
          bg.shape([[-60, ly], [W + 60, ly], [W + 60, gy], [-60, gy]], { f: INK.paper, w: 5, smooth: false });
          for (let i = 0; i < 16; i++) {
            const yy = ly + 20 + (i % 5) * (gy - ly - 30) / 5, xx = ((i * 263 + lt * (30 + (i % 3) * 12)) % (W + 200)) - 100;
            bg.line([[xx, yy], [xx + 40, yy - 8], [xx + 80, yy]], { w: 4, c: 'soft' });
          }
          // slope + villa
          const V = P.villa || {}, vx = W * (V.x ?? 0.7), vy = H * (V.y ?? 0.6), s = V.s ?? 1;
          mid.shape([[vx - 420 * s, gy + 10], [vx - 200 * s, vy + 20], [vx + 420 * s, vy - 10], [W + 60, vy - 30], [W + 60, gy + 10]], { f: INK.paperDark, w: 5 });
          const vw = 440 * s, vh = 300 * s, x0 = vx - vw / 2, top = vy - vh;
          mid.shape([[x0, vy], [x0, top], [x0 + vw, top], [x0 + vw, vy]], { f: INK.paperLight, w: 6, smooth: false });
          mid.shape([[x0 - 30 * s, top + 4], [x0 + 70 * s, top - 90 * s], [x0 + vw - 70 * s, top - 90 * s], [x0 + vw + 30 * s, top + 4]], { f: INK.inkSoft, w: 5, smooth: false });
          const lit = prog(lt, T().atOr(cues, V.lit, 0.2), 0.8);
          for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) {
            const wx = x0 + vw * (0.15 + k * 0.233), wy = top + vh * (0.26 + r * 0.32), ww = 26 * s, wh = 38 * s;
            const flick = 0.75 + 0.25 * Math.sin(t * 7 + r * 3 + k * 1.7);
            mid.shape([[wx - ww, wy - wh], [wx + ww, wy - wh], [wx + ww, wy + wh], [wx - ww, wy + wh]], { f: lit > 0.5 ? INK.gold : INK.paperDark, fop: lit > 0.5 ? flick : 1, w: 4, smooth: false });
            if (lit > 0.5 && r === 1 && (k === 1 || k === 2)) { mid.dot(wx, wy - 6 * s, 9 * s); mid.line([[wx, wy + 2 * s], [wx, wy + wh]], { w: 5 }); }
            else { mid.dot(-99, -99, 0.1); mid.line(null); }
          }
          // ground-floor loggia: columns
          for (let k = 0; k < 5; k++) { const cx = x0 + vw * (0.1 + k * 0.2); mid.line([[cx, vy - 2], [cx, top + vh * 0.72]], { w: 7 }); }
          mid.line([[x0 - 10, top + vh * 0.7], [x0 + vw + 10, top + vh * 0.7]], { w: 7 });
          // near shore + reeds
          front.shape([[-60, gy - 10], [W * 0.4, gy - 24], [W + 60, gy - 6], [W + 60, H + 20], [-60, H + 20]], { f: INK.paperDark, w: 6 });
          for (let i = 0; i < 7; i++) { const rx = 40 + i * 36, sw = Math.sin(t * 2 + i) * 8; front.line([[rx, gy - 4], [rx + sw, gy - 90 - (i % 3) * 20]], { w: 4, c: 'soft' }); }
          if (P.rain !== false) T().rain(fx, W, H, (P.rain && P.rain.n) ?? 70, lt + 2, { y1: gy, seed: seed + 9 });
          T().bolt(fx, W * 0.32, H * 0.14, ly - 40, lt, ats, seed);
          T().bolt(fx, W * 0.56, H * 0.12, ly - 80, lt, ats.map(v => v == null ? v : v + 0.12), seed + 2);
          bg.end(); mid.end(); front.end(); fx.end();
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ tbC_villa (interior)
  SH.tbC_villa = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, L = layers(ctx);
      const gy = H * (P.ground ?? 0.86);
      const cast = T().cast(L.castG, P.cast, W, H, seed * 11);
      const labs = T().labels(L.labG, P.labels, W, H, seed * 5);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, ats = boltsOf(P, cues), A = (n, fb) => T().atOr(cues, n, fb);
          T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.5, 0.6] }, punch(lt, A(P.cam && P.cam.push, null)));
          const { bg, mid, front, fx } = L;
          bg.begin(t); mid.begin(t); front.begin(t); fx.begin(t);
          // wall: wainscot + floor
          bg.line([[-60, gy - 210], [W + 60, gy - 214]], { w: 5, c: 'soft' });
          for (let i = 0; i < 9; i++) bg.line([[i * W / 8, gy - 206], [i * W / 8 + 4, gy - 6]], { w: 3, c: 'soft', op: 0.7 });
          bg.shape([[-60, gy], [W + 60, gy - 4], [W + 60, H + 30], [-60, H + 30]], { f: INK.paperDark, w: 6 });
          // window with the storm
          const Wn = P.window || {}, ww = Wn.w ?? 300, wh = Wn.h ?? 420, wx = W * (Wn.x ?? 0.5) - ww / 2, wy = H * (Wn.y ?? 0.1);
          stormIn(bg, wx, wy, ww, wh, lt, ats, seed + 41);
          bg.line([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], { w: 9, closed: true, smooth: false });
          bg.line([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], { w: 6 }); bg.line([[wx, wy + wh * 0.45], [wx + ww, wy + wh * 0.45]], { w: 6 });
          const sway = Math.sin(lt * 1.4) * 8;
          bg.shape([[wx - 90, wy - 30], [wx + 10, wy - 30], [wx - 10 + sway, wy + wh + 40], [wx - 100, wy + wh + 60]], { f: INK.red, w: 5 });
          bg.shape([[wx + ww - 10, wy - 30], [wx + ww + 90, wy - 30], [wx + ww + 100, wy + wh + 60], [wx + ww + 10 - sway, wy + wh + 40]], { f: INK.red, w: 5 });
          bg.line([[wx - 120, wy - 34], [wx + ww + 120, wy - 34]], { w: 8 });
          // bookshelf
          if (P.shelf !== false) {
            const sx = W * ((P.shelf && P.shelf.x) ?? 0.1);
            bg.shape([[sx - 130, gy - 2], [sx - 130, gy - 560], [sx + 130, gy - 560], [sx + 130, gy - 2]], { f: INK.stain, w: 6, smooth: false });
            for (let r = 0; r < 4; r++) {
              const yy = gy - 120 - r * 125;
              bg.line([[sx - 130, yy], [sx + 130, yy]], { w: 5 });
              for (let b = 0; b < 7; b++) { const bx = sx - 112 + b * 32, bh = 70 + ((b * 7 + r * 3) % 4) * 10; bg.shape([[bx, yy], [bx, yy - bh], [bx + 24, yy - bh], [bx + 24, yy]], { f: [INK.blue, INK.red, INK.green, INK.paperLight][(b + r) % 4], w: 3, smooth: false }); }
            }
          }
          // chairs for seated cast members
          (P.cast || []).forEach((m, i) => { if (m.chair) chair(mid, W * m.x, H * (m.y ?? 0.86), (m.scale ?? 0.6) / 0.6 * 0.62, T().faceOf(m.face, 1)); });
          bg.end(); mid.end();
          cast.update(lt, t, cues);
          // desk (in front of a seated writer), page with growing lines, quill in the writer's hand
          if (P.desk) {
            const D = P.desk, dx = W * (D.x ?? 0.5), dw = D.w ?? 420, dy = H * (D.y ?? 0.72);
            front.shape([[dx - dw / 2, dy], [dx + dw / 2, dy], [dx + dw / 2 - 10, dy + 30], [dx - dw / 2 + 10, dy + 30]], { f: INK.stain, w: 5, smooth: false });
            front.line([[dx - dw / 2 + 30, dy + 30], [dx - dw / 2 + 36, gy]], { w: 9 }); front.line([[dx + dw / 2 - 30, dy + 30], [dx + dw / 2 - 36, gy]], { w: 9 });
            const pg = P.page || {}, st = P.page ? cast.state[pg.who ?? 0] : null;
            const px = dx - 60, pw = 170, a = A(pg.at, 0.4), n = pg.lines ?? 6;
            front.shape(P.page ? [[px - pw / 2, dy - 4], [px + pw / 2, dy - 4], [px + pw / 2 + 30, dy - 40], [px - pw / 2 + 30, dy - 40]] : null, { f: INK.paperLight, w: 4, smooth: false });
            const fill = P.page ? clamp01((lt - a) / Math.max(1, dur - a - 0.5)) * n : 0;
            for (let i = 0; i < n; i++) {
              const u = clamp01(fill - i), yy = dy - 34 + i * 5.2, xa = px - pw / 2 + 34 - i * 4;
              front.line(u > 0.02 ? [[xa, yy], [xa + (pw - 40) * u, yy]] : null, { w: 2.5, c: 'ink', amp: 0.8 });
            }
            if (st) {
              const hnd = st.hands[1], wig = Math.sin(lt * 14) * 6;
              front.line([[hnd[0] + wig, hnd[1] + 4], [hnd[0] + 40 + wig, hnd[1] - 80]], { w: 4 });
              front.shape([[hnd[0] + 40 + wig, hnd[1] - 80], [hnd[0] + 26 + wig, hnd[1] - 40], [hnd[0] + 64 + wig, hnd[1] - 120]], { f: INK.paperLight, w: 3 });
            } else { front.line(null); front.shape(null); }
          }
          (P.candles || []).forEach(cd => T().candle(front, W * cd.x, H * cd.y, cd.s ?? 1, t));
          // speech bubble with a ghost doodle
          if (P.bubble) {
            const B = P.bubble, a = A(B.at, 0.5), p = spring(lt, a, 0.6);
            const st = cast.state[B.from ?? 0], bx = W * (B.x ?? 0.5), by = H * (B.y ?? 0.22);
            if (lt >= a && st) {
              fx.push(`translate(${T().f1(bx)} ${T().f1(by)}) scale(${Math.max(0.01, p).toFixed(3)})`);
              fx.shape(inkEllipsePts(0, 0, 360, 120, 9, 16), { f: INK.paperLight, w: 6 });
              fx.text(B.text || 'A GHOST STORY', 60, 0, { font: 'serif', size: 56 });
              if (B.ghost !== false) {
                const gb = Math.sin(lt * 3) * 8;
                fx.shape([[-280, 40 + gb], [-282, -40 + gb], [-250, -78 + gb], [-212, -40 + gb], [-210, 40 + gb], [-224, 26 + gb], [-238, 44 + gb], [-252, 26 + gb], [-266, 44 + gb]], { f: INK.paperLight, w: 5 });
                fx.dot(-256, -36 + gb, 6); fx.dot(-234, -36 + gb, 6); fx.circle(-245, -12 + gb, 8, { w: 3.5 });
              }
              fx.pop();
              const tip = st.head;
              fx.shape([[bx - 120 * p, by + 90 * p], [bx - 40 * p, by + 110 * p], [lerp(bx, tip[0] + 40, p), lerp(by, tip[1] - 70, p)]], { f: INK.paperLight, w: 5, smooth: false });
            } else { fx.push(''); fx.pop(); fx.shape(null); }
          }
          front.end(); fx.end();
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ tbC_book
  SH.tbC_book = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx, L = layers(ctx);
      const gy = H * (P.ground ?? 0.86);
      const cast = T().cast(L.castG, P.cast, W, H, seed * 11);
      const labs = T().labels(L.labG, P.labels, W, H, seed * 5);
      // the creature as in the novel: an unnamed, very tall cloaked silhouette with long dark hair (no film make-up),
      // beside a small human outline for scale (page-local 0..1 box, y down)
      const TALL = [[0.5, 0.08], [0.6, 0.1], [0.64, 0.2], [0.63, 0.27], [0.76, 0.33], [0.8, 0.6], [0.84, 0.97], [0.36, 0.97],
        [0.4, 0.6], [0.43, 0.33], [0.4, 0.26], [0.38, 0.18], [0.42, 0.1]];
      const HAIR = [[0.42, 0.1], [0.5, 0.07], [0.6, 0.1], [0.66, 0.24], [0.66, 0.36], [0.61, 0.3], [0.6, 0.18], [0.44, 0.17], [0.4, 0.3], [0.36, 0.34], [0.37, 0.2]];
      const SMALL = [[[0.17, 0.68], 0.045], [[0.17, 0.73], [0.17, 0.86]], [[0.17, 0.86], [0.13, 0.97]], [[0.17, 0.86], [0.21, 0.97]], [[0.12, 0.78], [0.22, 0.78]]];
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, ats = boltsOf(P, cues), A = (n, fb) => T().atOr(cues, n, fb);
          const B = P.book || {}, bat = A(B.at, dur * 0.55), hit = punch(lt, bat);
          T().cam(L.camG, lt, dur, W, H, P.cam || { zoom: 1.06, focus: [0.45, 0.55] }, hit);
          const { bg, mid, front, fx } = L;
          bg.begin(t); mid.begin(t); front.begin(t); fx.begin(t);
          bg.shape([[-60, gy], [W + 60, gy - 4], [W + 60, H + 30], [-60, H + 30]], { f: INK.paperDark, w: 6 });
          const Wn = P.window || {}, ww = Wn.w ?? 240, wh = Wn.h ?? 330, wx = W * (Wn.x ?? 0.82) - ww / 2, wy = H * (Wn.y ?? 0.1);
          stormIn(bg, wx, wy, ww, wh, lt, ats, seed + 41);
          bg.line([[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]], { w: 9, closed: true, smooth: false });
          bg.line([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], { w: 6 }); bg.line([[wx, wy + wh * 0.45], [wx + ww, wy + wh * 0.45]], { w: 6 });
          // pinned sketch page with the creature drawing itself
          const S = P.sketch || {}, sx = W * (S.x ?? 0.42), sy = H * (S.y ?? 0.3), sw = 380, sh = 460;
          const sp = prog(lt, A(S.at, 0.3), S.dur ?? 2.4);
          bg.push(`translate(${T().f1(sx)} ${T().f1(sy)}) rotate(-2)`);
          bg.shape([[-sw / 2, -sh / 2], [sw / 2, -sh / 2], [sw / 2, sh / 2], [-sw / 2, sh / 2]], { f: INK.paperLight, w: 5, smooth: false });
          bg.circle(0, -sh / 2 + 18, 10, { f: INK.red, w: 3 });
          const PX = q => [-sw / 2 + q[0] * sw, -sh / 2 + q[1] * sh];
          // reveal: the tall figure rises from the bottom of the page (clipped by scaling about its feet)
          const rise = sp, fy = -sh / 2 + 0.97 * sh;
          bg.push(`translate(0 ${T().f1(fy)}) scale(1 ${Math.max(0.01, rise).toFixed(3)}) translate(0 ${T().f1(-fy)})`, rise > 0.01 ? 1 : 0);
          bg.shape(TALL.map(PX), { f: INK.inkSoft, w: 5 });
          bg.shape(HAIR.map(PX), { f: INK.ink, w: 3 });
          bg.dot(PX([0.47, 0.19])[0], PX([0.47, 0.19])[1], 5, { c: 'gold' }); bg.dot(PX([0.55, 0.19])[0], PX([0.55, 0.19])[1], 5, { c: 'gold' });
          bg.pop();
          const sm = clamp01(sp * 3);
          bg.circle(PX(SMALL[0][0])[0], PX(SMALL[0][0])[1], SMALL[0][1] * sw, { w: 4, op: sm });
          SMALL.slice(1).forEach(l => bg.line(sm > 0.05 ? l.map(PX) : null, { w: 4, c: 'ink' }));
          bg.pop();
          bg.end(); mid.end();
          cast.update(lt, t, cues);
          // desk with manuscript pages, candle and the book
          const dy = H * (P.desk_y ?? 0.74);
          front.shape([[-60, dy], [W + 60, dy - 4], [W + 60, dy + 40], [-60, dy + 44]], { f: INK.stain, w: 6 });
          const fl = P.pages ? A(P.pages.at, 0) : 0;
          for (let i = 0; i < 6; i++) {
            const fly = clamp01((lt - fl - i * 0.25) / 1.4), on = lt >= fl && i % 2 === 1;
            const px = W * 0.16 + i * 14, py = dy - 6 - i * 7;
            const ox = on ? fly * (90 + i * 30) : 0, oy = on ? -Math.sin(fly * Math.PI) * (140 + i * 20) : 0, rot = on ? fly * (40 + i * 15) : (i - 3) * 2;
            front.push(`translate(${T().f1(px + ox)} ${T().f1(py + oy)}) rotate(${rot.toFixed(1)})`);
            front.shape([[-110, -8], [110, -8], [110, 8], [-110, 8]], { f: INK.paperLight, w: 4, smooth: false });
            front.pop();
          }
          T().candle(front, W * ((P.candle && P.candle.x) ?? 0.72), H * ((P.candle && P.candle.y) ?? 0.74), (P.candle && P.candle.s) ?? 1.1, t);
          // the book drops in
          const bp = lt >= bat ? spring(lt, bat, 0.7) : 0, bx = W * (B.x ?? 0.42), by = H * (B.y ?? 0.74) - (1 - bp) * 300;
          if (lt >= bat) {
            fx.push(`translate(${T().f1(bx)} ${T().f1(by)}) rotate(${((1 - bp) * -8).toFixed(2)}) scale(${(1 + 0.06 * hit).toFixed(3)})`);
            fx.shape([[-250, -10], [250, -10], [262, 30], [-262, 30]], { f: INK.paperLight, w: 5, smooth: false });
            fx.shape([[-262, -10], [262, -10], [262, -210], [-262, -210]], { f: INK.red, w: 6, smooth: false });
            fx.line([[-230, -190], [230, -190], [230, -30], [-230, -30]], { w: 4, c: 'gold', closed: true, smooth: false });
            fx.text(B.title || 'FRANKENSTEIN', 0, -112, { font: 'serif', size: B.size ?? 64, c: 'light', maxw: 420 });
            fx.pop();
          } else { fx.push(''); fx.pop(); }
          front.end(); fx.end();
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
