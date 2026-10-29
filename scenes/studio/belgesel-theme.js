// Belgesel (documentary) style building blocks, "theme": "belgesel" (docs/BELGESEL.md, owner 2026-10-29):
// a still, clean ground (no paper drift, no stains, no boil), quiet one-line subtitles, no kicker, no brand.
// Colours come from the video's theme (scenes/studio/belgesel-themes.json via window.PALETTE -> THEME_PARCHMENT).
//   BELGESEL.background(canvas, W, H) -> {update()}            baked once: ground, soft centre light, vignette, grain
//   BELGESEL.captions(container, W, H, groups) -> {update(t)}   whole phrase fades in, cue words in the accent colour
'use strict';

const BELGESEL = (() => {
  const C = THEME_PARCHMENT;
  function background(cv, W, H) {
    const X = cv.getContext('2d'), w = cv.width, h = cv.height, r = rng(9157);
    X.fillStyle = C.paper; X.fillRect(0, 0, w, h);
    const R = Math.hypot(w, h) / 2;
    const g = X.createRadialGradient(w / 2, h * 0.46, 0, w / 2, h * 0.46, R);
    g.addColorStop(0, rgba(C.paperLight, 0.9)); g.addColorStop(0.55, rgba(C.paperLight, 0)); g.addColorStop(1, rgba(C.paperDark, 0.95));
    X.fillStyle = g; X.fillRect(0, 0, w, h);
    const im = X.getImageData(0, 0, w, h), d = im.data;     // fine static film grain
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * (C.dark ? 7 : 6); d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    X.putImageData(im, 0, 0);
    const baked = document.createElement('canvas'); baked.width = w; baked.height = h;
    baked.getContext('2d').drawImage(cv, 0, 0);
    return { canvas: cv, update() { X.globalAlpha = 1; X.globalCompositeOperation = 'source-over'; X.drawImage(baked, 0, 0); } };
  }

  function captions(container, W, H, groups) {
    const portrait = H > W;
    const node = document.createElement('div');
    node.style.cssText = `position:absolute;left:50%;transform:translateX(-50%);width:max-content;text-align:center;opacity:0;` +
      `font-family:Lora,Georgia,serif;font-weight:500;line-height:1.25;letter-spacing:0.005em;color:${C.ink};` +
      `text-shadow:0 0 6px ${rgba(C.paperDark, 0.95)},0 2px 18px ${rgba(C.paperDark, 0.9)};` +
      (portrait ? 'top:1190px;max-width:900px;font-size:64px;' : 'bottom:64px;max-width:1500px;font-size:50px;');
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
            if (w.cue) s.style.color = w.cue === 'red' ? C.red : C.gold;
            node.appendChild(s);
          });
        }
        node.style.opacity = Math.min(clamp01((t - g.start + 0.05) / 0.25), 1 - clamp01((t - (g.end - 0.12)) / 0.12));
      },
    };
  }
  return { background, captions };
})();
