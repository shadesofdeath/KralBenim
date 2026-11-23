// Watercolor (suluboya) style, "theme": "watercolor" (docs/SULUBOYA.md; owner 2026-11-23, both channels):
// a hand-painted journal page that paints itself. Warm cotton paper under everything, translucent brush strokes,
// hand-written notes, calm serif subtitles that always stay readable. No kicker, no brand, no host on screen.
// Colours come from the video's paper set (scenes/studio/watercolor-themes.json via window.PALETTE -> THEME_PARCHMENT).
//   WATERCOLOR.background(canvas, W, H) -> {update(), paper}     baked once: paper tone, smooth noise, fibres, grain, vignette
//   WATERCOLOR.paper                                             the baked W x H paper canvas (mist / erase draws it)
//   WATERCOLOR.captions(container, W, H, groups) -> {update(t)}  one phrase at a time, cue words in the accent colour
//   WATERCOLOR.chapters(container, W, H, list) -> {update(t)}    long videos: "02 / 05" + chapter name, top-left, a few s
'use strict';

const WATERCOLOR = (() => {
  const C = THEME_PARCHMENT;
  const out = { paper: null };

  // smooth value noise on a coarse grid, bilinear with smoothstep (deterministic)
  function grid(w, h, cell, r) {
    const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh);
    for (let i = 0; i < g.length; i++) g[i] = r() - 0.5;
    return (x, y) => {
      const fx = x / cell, fy = y / cell, i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j;
      const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v), k = j * gw + i;
      const a = g[k] + (g[k + 1] - g[k]) * su, b = g[k + gw] + (g[k + gw + 1] - g[k + gw]) * su;
      return a + (b - a) * sv;
    };
  }

  function bake(W, H) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const X = cv.getContext('2d'), r = rng(20261123);
    const [br, bg, bb] = hex2rgb(C.paper);
    const n1 = grid(W, H, 240, r), n2 = grid(W, H, 90, r), n3 = grid(W, H, 25, r);
    const im = X.createImageData(W, H), d = im.data;
    const cx = W / 2, cy = H / 2, rx = W * 0.62, ry = H * 0.62;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const m = n1(x, y) * 0.9 + n2(x, y) * 0.5 + n3(x, y) * 0.25;
      const vx = (x - cx) / rx, vy = (y - cy) / ry, vig = 1 - 0.05 * Math.min(1.5, vx * vx + vy * vy);
      const k = (1 + m * 0.07) * vig, g = (r() - 0.5) * 3.2, i = (y * W + x) * 4;
      d[i] = br * k + g; d[i + 1] = bg * k + g; d[i + 2] = bb * k + g; d[i + 3] = 255;
    }
    X.putImageData(im, 0, 0);
    // cotton fibres: short curved hairs, a little lighter or darker than the paper
    const n = Math.round(2600 * W * H / (1920 * 1080));
    X.lineWidth = 1; X.lineCap = 'round';
    for (let f = 0; f < n; f++) {
      let x = r() * W, y = r() * H, a = r() * Math.PI;
      const len = 8 + r() * 32, light = r() < 0.5;
      X.strokeStyle = rgba(light ? C.paperLight : C.paperDark, 0.18 + r() * 0.3);
      X.beginPath(); X.moveTo(x, y);
      for (let k = 0; k < 4; k++) { a += (r() - 0.5) * 0.7; x += Math.cos(a) * len / 4; y += Math.sin(a) * len / 4; X.lineTo(x, y); }
      X.stroke();
    }
    return cv;
  }

  function background(cv, W, H) {
    cv.width = W; cv.height = H;                    // full resolution: the paper texture is the look
    const X = cv.getContext('2d');
    out.paper = bake(W, H);
    X.drawImage(out.paper, 0, 0);
    return { canvas: cv, paper: out.paper, update() {} };   // still paper: drawn once
  }

  // Subtitles sit on the paper, not in a box: a semi-bold serif in ink over a soft paper halo. They are always
  // on (owner, 2026-11-23: "alt yazılar videolarda kesin olsun"): one phrase at a time, max two balanced lines.
  function captions(container, W, H, groups) {
    const portrait = H > W;
    const halo = rgba(C.paperLight, 0.95), halo2 = rgba(C.paper, 0.9);
    const node = document.createElement('div');
    node.style.cssText = `position:absolute;left:50%;transform:translateX(-50%);width:max-content;text-align:center;opacity:0;` +
      `font-family:'Cormorant Garamond',Lora,Georgia,serif;font-weight:700;line-height:1.12;letter-spacing:0.005em;color:${C.ink};` +
      `text-wrap:balance;text-shadow:0 0 3px ${halo},0 0 8px ${halo},0 0 16px ${halo2},0 0 28px ${halo2},0 0 42px ${halo2};` +
      (portrait ? 'top:1176px;max-width:940px;font-size:72px;' : 'bottom:58px;max-width:1560px;font-size:58px;');
    container.appendChild(node);
    let cur = null;
    return {
      node,
      update(t) {
        const g = t < 0 ? null : groups.find(c => t >= c.start && t < c.end);
        if (!g) { node.style.opacity = 0; cur = null; return; }
        if (cur !== g) {
          cur = g; node.innerHTML = '';
          g.words.forEach((w, k) => {
            const s = document.createElement('span'); s.textContent = (k ? ' ' : '') + w.text;
            if (w.cue) s.style.color = C.red;
            node.appendChild(s);
          });
        }
        node.style.opacity = Math.min(clamp01((t - g.start + 0.06) / 0.2), 1 - clamp01((t - (g.end - 0.1)) / 0.1));
      },
    };
  }

  // long videos: the chapter's number and name in the top-left corner for the first seconds of each chapter
  // (a brush dash, "02 / 05" in small caps, the name in the serif), then the corner is empty again
  function chapters(container, W, H, list) {
    if (H > W || !list.length) return { update() {} };
    const box = document.createElement('div');
    box.style.cssText = 'position:absolute;left:84px;top:70px;opacity:0;color:' + C.ink + ';' +
      `text-shadow:0 0 6px ${rgba(C.paperLight, 0.95)},0 0 16px ${rgba(C.paper, 0.9)}`;
    box.innerHTML = '<div class="n" style="font:600 22px \'Cormorant Garamond\',serif;letter-spacing:5px;opacity:.75;display:flex;align-items:center;gap:14px">' +
      '<span class="d" style="display:inline-block;width:34px;height:9px;border-radius:5px 2px 6px 3px;opacity:.9"></span><span class="t"></span></div>' +
      '<div class="name" style="font:600 56px \'Cormorant Garamond\',serif;margin-top:6px;letter-spacing:.01em"></div>';
    container.appendChild(box);
    const total = String(list.length).padStart(2, '0');
    let cur = -1;
    return {
      update(t) {
        let k = -1;
        for (let i = 0; i < list.length; i++) if (t >= list[i].start) k = i;
        const c = list[k];
        const a = !c || t < 0 ? 0 : Math.min(clamp01((t - c.start - 0.5) / 0.6), 1 - clamp01((t - c.start - 6.5) / 0.8));
        if (k !== cur && c) {
          cur = k;
          box.querySelector('.t').textContent = String(k + 1).padStart(2, '0') + ' / ' + total;
          box.querySelector('.name').textContent = c.name;
          box.querySelector('.d').style.background = [C.red, C.blue, C.green, C.stain, C.gold][k % 5];
        }
        box.style.opacity = a;
        box.style.transform = `translateY(${(1 - EASE(clamp01((t - (c ? c.start : 0) - 0.5) / 0.8))) * 12}px)`;
      },
    };
  }

  return Object.assign(out, { background, captions, chapters });
})();
