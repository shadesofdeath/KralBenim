// Theme "parchment" building blocks (brand/kit/BRAND.md), independent of engine.js so that other hosts
// (e.g. a HyperFrames composition driving a paused GSAP timeline) can reuse them.
// Depends only on core.js helpers (rng, rgba, spring, prog, lerp, clamp01, THEME_PARCHMENT). Time always comes
// in as an argument; every update() is a pure function of its arguments (deterministic, no Math.random/Date).
//
//   PARCHMENT.fonts(baseUrl)                       -> Promise; injects @font-face (Fraunces, Lora, Patrick Hand) + loads them
//   PARCHMENT.background(target, W, H, opts)       -> {canvas, update(t, scene = 0, prevScene = -1, mix = 1)}
//        target: a <canvas> or a container element (a canvas is appended). opts.scale (default 0.5: drawn at half
//        resolution, CSS-stretched to W×H), opts.seed. Paper is baked once; per frame only blits + 2-4 stains.
//   PARCHMENT.captions(container, W, H, groups)    -> {node, update(t)}   (t < 0 or no group at t: hidden)
//        groups: [{start, end, words: [{t, text, cue?: true|'red'}]}]  cue words are gold (or red)
//   PARCHMENT.groupWords(words, maxWords=3, maxChars=16) -> groups from a flat [{t, text, cue?}] list
//   PARCHMENT.kicker(container, W, H, {white, gray}) -> {node, update(lt, alpha = 1)}  (lt < 0: hidden)
//   PARCHMENT.brand(container, W, H, text)         -> {node, update(alpha = 1)}
'use strict';

const PARCHMENT = (() => {
  const C = THEME_PARCHMENT;
  const FONTS = [
    ['Fraunces', 'fraunces', '100 900'], ['Lora', 'lora', '400 700'], ["'Patrick Hand'", 'patrick-hand', '400'],
  ];
  const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
  const EXT = 'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';

  function fonts(baseUrl = 'fonts/') {
    if (!document.getElementById('parchment-fonts')) {
      let css = '';
      for (const [fam, file, w] of FONTS) for (const [part, rng2] of [['latin', LAT], ['latin-ext', EXT]])
        css += `@font-face{font-family:${fam};src:url(${baseUrl}${file}-${part}.woff2) format('woff2');font-weight:${w};font-display:block;unicode-range:${rng2}}\n`;
      const st = document.createElement('style'); st.id = 'parchment-fonts'; st.textContent = css; document.head.appendChild(st);
    }
    return Promise.all(['900 100px Fraunces', '800 100px Fraunces', '700 100px Lora', '400 100px "Patrick Hand"']
      .map(f => document.fonts.load(f, 'AĞİŞÇÖÜ0123'))).then(() => true);
  }

  // ---------------------------------------------------------------- paper background
  function bake(w, h, seed) {
    const m = Math.round(Math.max(w, h) * 0.04);
    const cv = document.createElement('canvas'); cv.width = w + 2 * m; cv.height = h + 2 * m;
    const x = cv.getContext('2d'), r = rng(4242 + seed), CW = cv.width, CH = cv.height, k = Math.max(w, h) / 960;
    x.fillStyle = C.paper; x.fillRect(0, 0, CW, CH);
    for (let i = 0; i < 46; i++) {                       // soft mottling
      const cx = r() * CW, cy = r() * CH, rad = (0.08 + r() * 0.22) * Math.max(CW, CH);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rad), col = r() > 0.45 ? C.paperDark : C.paperLight;
      g.addColorStop(0, rgba(col, 0.1 + r() * 0.14)); g.addColorStop(1, rgba(col, 0));
      x.fillStyle = g; x.fillRect(0, 0, CW, CH);
    }
    for (let i = 0; i < 2600 * k * k; i++) {             // paper fibres
      const px = r() * CW, py = r() * CH, a = r() * Math.PI, L = (3 + r() * 16) * k, bend = (r() - 0.5) * 6 * k;
      x.strokeStyle = rgba(r() > 0.5 ? C.inkSoft : C.stain, 0.04 + r() * 0.08); x.lineWidth = (0.5 + r() * 0.7) * k;
      x.beginPath(); x.moveTo(px, py);
      x.quadraticCurveTo(px + Math.cos(a) * L / 2 - Math.sin(a) * bend, py + Math.sin(a) * L / 2 + Math.cos(a) * bend, px + Math.cos(a) * L, py + Math.sin(a) * L);
      x.stroke();
    }
    for (let i = 0; i < 1400 * k * k; i++) {             // specks
      x.fillStyle = rgba(C.inkSoft, 0.08 + r() * 0.2);
      x.beginPath(); x.arc(r() * CW, r() * CH, (0.4 + r() * 1.1) * k, 0, 6.283); x.fill();
    }
    for (let i = 0; i < 2; i++) {                        // faint fold creases
      const y0 = (0.3 + 0.4 * r()) * CH;
      x.strokeStyle = rgba(C.paperDark, 0.55); x.lineWidth = 2 * k;
      x.beginPath(); x.moveTo(0, y0); x.lineTo(CW, y0 + (r() - 0.5) * CH * 0.08); x.stroke();
    }
    const im = x.getImageData(0, 0, CW, CH), d = im.data;  // fine grain
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.8; }
    x.putImageData(im, 0, 0);
    const stains = [];                                   // coffee-ring sprites
    for (let s0 = 0; s0 < 4; s0++) {
      const S0 = Math.round(Math.max(w, h) * 0.26), sc = document.createElement('canvas'); sc.width = sc.height = S0;
      const s = sc.getContext('2d'), c = S0 / 2, R = S0 * 0.38;
      const ph = [r() * 6.28, r() * 6.28, r() * 6.28];
      const rad = a => R * (1 + 0.05 * Math.sin(3 * a + ph[0]) + 0.03 * Math.sin(5 * a + ph[1]) + 0.02 * Math.sin(9 * a + ph[2]));
      const ring = (sc2, wid, alpha, from = 0, to = 6.283) => {
        s.beginPath();
        for (let a = from; a <= to + 1e-3; a += 0.04) { const rr = rad(a) * sc2; a === from ? s.moveTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr) : s.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); }
        s.strokeStyle = rgba(C.stain, alpha); s.lineWidth = wid * k; s.stroke();
      };
      s.beginPath();
      for (let a = 0; a <= 6.29; a += 0.04) { const rr = rad(a); a === 0 ? s.moveTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr) : s.lineTo(c + Math.cos(a) * rr, c + Math.sin(a) * rr); }
      const g = s.createRadialGradient(c, c, R * 0.2, c, c, R);
      g.addColorStop(0, rgba(C.stain, 0.05)); g.addColorStop(0.8, rgba(C.stain, 0.12)); g.addColorStop(1, rgba(C.stain, 0.2));
      s.fillStyle = g; s.fill();
      ring(1, 3.5, 0.45); ring(0.985, 1.5, 0.3);
      const a0 = r() * 6.28; ring(1.07 + r() * 0.05, 2, 0.28, a0, a0 + 1.5 + r() * 2);   // second, partial ring
      for (let i = 0; i < 6; i++) { const a = r() * 6.28, rr = R * (1.05 + r() * 0.2); s.fillStyle = rgba(C.stain, 0.25); s.beginPath(); s.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, (1 + r() * 3) * k, 0, 6.283); s.fill(); }
      stains.push(sc);
    }
    return { cv, m, stains };
  }
  // 2-4 stains for scene k: deterministic, mostly towards the edges
  function stainLayout(k, seed) {
    const r = rng(1009 + k * 7919 + seed * 31), n = 2 + Math.floor(r() * 3), out = [];
    for (let j = 0; j < n; j++) {
      const edge = r() < 0.75;
      out.push({ s: Math.floor(r() * 4), x: edge ? (r() < 0.5 ? r() * 0.25 : 0.75 + r() * 0.25) : 0.2 + r() * 0.6,
                 y: r(), z: 0.55 + r() * 0.75, rot: r() * 6.28, a: 0.55 + r() * 0.35 });
    }
    return out;
  }
  function background(target, W, H, opts = {}) {
    const scale = opts.scale ?? 0.5, seed = opts.seed ?? 0;
    let cv = target;
    if (!(target instanceof HTMLCanvasElement)) {
      cv = document.createElement('canvas');
      cv.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px`;
      target.appendChild(cv);
    }
    cv.width = Math.round(W * scale); cv.height = Math.round(H * scale);
    const X = cv.getContext('2d'), w = cv.width, h = cv.height;
    const P = bake(w, h, seed);
    return {
      canvas: cv,
      update(t, scene = 0, prevScene = -1, mix = 1) {
        const { m, stains } = P;
        const ox = m * (0.5 + 0.45 * Math.sin(t * 0.07)), oy = m * (0.5 + 0.45 * Math.cos(t * 0.05));   // slow paper drift
        X.globalCompositeOperation = 'source-over'; X.globalAlpha = 1;
        X.drawImage(P.cv, -ox, -oy);
        const put = (k, alpha) => {
          if (alpha <= 0.01 || k < 0) return;
          for (const st of stainLayout(k, seed)) {
            const sp = stains[st.s], sz = sp.width * st.z;
            X.save(); X.globalAlpha = alpha * st.a;
            X.translate(st.x * w + m - ox, st.y * h + m - oy); X.rotate(st.rot);
            X.drawImage(sp, -sz / 2, -sz / 2, sz, sz); X.restore();
          }
        };
        put(prevScene, 1 - mix); put(scene, mix);
        const R = Math.hypot(w, h) / 2, g = X.createRadialGradient(w / 2, h * 0.47, R * 0.45, w / 2, h * 0.47, R);
        g.addColorStop(0, rgba(C.paperDark, 0)); g.addColorStop(0.7, rgba(C.paperDark, 0.55)); g.addColorStop(1, rgba(C.stain, 0.55));
        X.fillStyle = g; X.fillRect(0, 0, w, h);
      },
    };
  }

  // ---------------------------------------------------------------- captions (Lora 700 on a paper strip)
  function groupWords(words, maxWords = 3, maxChars = 16) {
    const out = []; let cur = [];
    const flush = () => { if (cur.length) out.push(cur); cur = []; };
    for (const w of words) {
      cur.push(w);
      const txt = cur.map(c => c.text).join(' '), last = w.text[w.text.length - 1];
      if ('.?!:;'.includes(last) || (last === ',' && cur.length > 1) || cur.length >= maxWords || txt.length > maxChars) flush();
    }
    flush();
    return out.map((ws, i) => ({ start: ws[0].t, end: out[i + 1] ? out[i + 1][0].t : ws[ws.length - 1].t + 0.8, words: ws }));
  }
  function captions(container, W, H, groups) {
    const portrait = H > W;
    const node = document.createElement('div');
    node.style.cssText = 'position:absolute;left:50%;transform:translateX(-50%);width:max-content;text-align:center;opacity:0;' +
      `font-family:Lora,Georgia,serif;font-weight:700;color:${C.ink};background:${C.paperLight};border:3px solid ${C.ink};` +
      `border-radius:34px;box-shadow:6px 8px 0 ${rgba(C.ink, 0.18)};letter-spacing:-0.01em;line-height:1.12;` +
      (portrait ? 'top:1170px;max-width:940px;font-size:84px;padding:6px 30px 16px;' : 'bottom:92px;max-width:1440px;font-size:60px;padding:4px 26px 12px;');
    container.appendChild(node);
    let curG = null, spans = [];
    return {
      node,
      update(t) {
        const g = t < 0 ? null : groups.find(c => t >= c.start && t < c.end);
        if (!g) { node.style.opacity = 0; return; }
        if (curG !== g) {
          curG = g; node.innerHTML = '';
          spans = g.words.map(w => { const s = document.createElement('span'); s.textContent = w.text; s.style.cssText = 'display:inline-block;margin:0 .15em;transform-origin:50% 70%'; node.appendChild(s); return s; });
        }
        g.words.forEach((w, k) => {
          const next = k + 1 < g.words.length ? g.words[k + 1].t : g.end;
          const on = t >= w.t, now = on && t < next, p = spring(t, w.t, 0.35);
          spans[k].style.visibility = on ? 'visible' : 'hidden';
          spans[k].style.color = w.cue ? (w.cue === 'red' ? C.red : C.gold) : C.ink;
          spans[k].style.transform = `translateY(${(1 - p) * 30}px) scale(${lerp(0.6, 1, p) * (now ? 1.06 : 1)})`;
        });
        node.style.opacity = 1 - prog(t, g.end - 0.08, 0.08);
      },
    };
  }

  // ---------------------------------------------------------------- kicker + brand (Fraunces, ink)
  function kicker(container, W, H, title = {}) {
    const portrait = H > W;
    const node = document.createElement('div');
    node.style.cssText = `position:absolute;display:flex;align-items:stretch;gap:18px;opacity:0;font-family:Fraunces,Georgia,serif;font-weight:800;color:${C.ink};letter-spacing:-0.01em;line-height:1.05;` +
      (portrait ? 'left:64px;top:168px;font-size:52px;max-width:720px;' : 'left:90px;top:128px;font-size:46px;max-width:900px;');
    container.appendChild(node);
    const words = [];
    let bar = null;
    if (title.white || title.gray) {
      bar = document.createElement('div'); bar.style.cssText = `width:8px;border-radius:4px;background:${C.blue};flex:none`; node.appendChild(bar);
      const tx = document.createElement('div'); node.appendChild(tx);
      for (const [col, s] of [[C.ink, title.white || ''], [C.inkSoft, title.gray || '']])
        for (const wd of s.split(/\s+/).filter(Boolean)) {
          const sp = document.createElement('span'); sp.textContent = wd; sp.style.cssText = `display:inline-block;margin-right:.22em;color:${col}`;
          tx.appendChild(sp); words.push(sp);
        }
    }
    return {
      node, words,
      update(lt, alpha = 1) {
        if (lt == null || lt < 0 || !words.length) { node.style.opacity = 0; return; }
        node.style.opacity = alpha;
        bar.style.transform = `scaleY(${spring(lt, 0, 0.5)})`;
        words.forEach((w, j) => { const p = spring(lt, 0.05 + j * 0.07, 0.55); w.style.opacity = clamp01(p * 1.6); w.style.transform = `translateY(${(1 - p) * 40}px)`; });
      },
    };
  }
  function brand(container, W, H, text) {
    const portrait = H > W;
    const node = document.createElement('div');
    node.style.cssText = `position:absolute;display:flex;align-items:center;gap:14px;font-family:Fraunces,Georgia,serif;font-weight:700;font-size:34px;color:${C.ink};` +
      (portrait ? 'left:64px;top:92px;' : 'left:90px;top:64px;');
    const dot = document.createElement('i'); dot.style.cssText = `width:16px;height:16px;border-radius:50%;background:${C.red};display:block`;
    const sp = document.createElement('span'); sp.textContent = text || '';
    node.appendChild(dot); node.appendChild(sp); container.appendChild(node);
    return { node, update(alpha = 1) { node.style.opacity = alpha; } };
  }

  return { colors: C, fonts, background, captions, groupWords, kicker, brand };
})();
