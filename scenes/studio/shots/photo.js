// photo: a real, freely licensed photo or video clip printed onto the parchment (no AI-generated footage: lint)
// (brand/kit/BRAND.md §3, §8): sepia grade, multiplied by the paper colour, edges dissolving into the page,
// slow Ken Burns drift and hand-drawn marks on top.
// P: {src: "media/x.jpg"} | {video: "media/x.mp4", from: 2.0, rate: 0.6}  (build.py turns video into P.frames)
//    kb: {from: [zoom, cx, cy], to: [...]}, grade: "sepia" (default) | "mono", credit: "...",
//    marks: [{type: "circle"|"arrow"|"box", x, y (0..1 of the image), r | w,h | angle, text, at: "<cue>", color}]
'use strict';

(window.SHOTS || (window.SHOTS = {})).photo = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, root, svg } = ctx;
    const TP = THEME_PARCHMENT;
    const dpr = devicePixelRatio;
    const cv = document.createElement('canvas');
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    cv.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px`;
    root.insertBefore(cv, svg);
    const g2 = cv.getContext('2d');
    const imgs = new Map();
    const load = src => {
      if (imgs.has(src)) return imgs.get(src);
      const im = new Image(); im.src = src;
      const pr = im.decode().then(() => im).catch(() => null);
      const rec = { im, pr, ok: false }; pr.then(v => { rec.ok = !!v; });
      imgs.set(src, rec);
      return rec;
    };
    const F = P.frames;
    const frameSrc = lt => {
      if (!F) return P.src;
      const i = Math.max(0, Math.min(F.count - 1, Math.floor(lt * F.fps * (P.rate || 1))));
      return F.pattern.replace('%05d', String(i + 1).padStart(5, '0'));
    };
    const grade = P.grade === 'mono' ? 'grayscale(1) contrast(0.9) brightness(1.08)'
      : 'grayscale(1) sepia(0.85) contrast(0.82) brightness(1.12)';
    const marksG = el(svg, 'g');
    const marks = (P.marks || []).map(m => ({ m, g: el(marksG, 'g') }));
    if (P.credit) svgText(svg, P.credit, W - 40, H > W ? 262 : H - 40, 22, { fill: TP.ink, opacity: 0.7, 'text-anchor': 'end', 'font-weight': 600 });
    let geom = null;
    const kb = P.kb || { from: [1.0, 0.5, 0.5], to: [1.12, 0.5, 0.45] };
    return {
      pending(lt) { const r = load(frameSrc(lt)); return r.ok ? null : r.pr; },
      update(lt, dur, cues) {
        const rec = load(frameSrc(lt));
        if (!rec.ok) return;
        const im = rec.im, iw = im.naturalWidth, ih = im.naturalHeight;
        const p = progIO(lt, 0, Math.max(dur, 1));
        const z = lerp(kb.from[0], kb.to[0], p), cx = lerp(kb.from[1], kb.to[1], p), cy = lerp(kb.from[2], kb.to[2], p);
        const cover = Math.max(W / iw, H / ih) * z;           // css px per image px
        const dw = iw * cover, dh = ih * cover;
        let x = W / 2 - cx * dw, y = H / 2 - cy * dh;
        x = Math.min(0, Math.max(W - dw, x)); y = Math.min(0, Math.max(H - dh, y));
        geom = { x, y, s: cover };
        g2.save();
        g2.filter = grade;
        g2.drawImage(im, x * dpr, y * dpr, dw * dpr, dh * dpr);
        g2.restore();
        // ink printed on paper: multiply by the parchment colour, then let the edges dissolve into the page
        const CW = cv.width, CH = cv.height, portrait = H > W;
        g2.save();
        g2.globalCompositeOperation = 'multiply'; g2.fillStyle = TP.paper; g2.fillRect(0, 0, CW, CH);
        g2.globalCompositeOperation = 'destination-in';
        const gx = g2.createLinearGradient(0, 0, CW, 0);
        gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(0.1, 'rgba(0,0,0,1)'); gx.addColorStop(0.9, 'rgba(0,0,0,1)'); gx.addColorStop(1, 'rgba(0,0,0,0)');
        g2.fillStyle = gx; g2.fillRect(0, 0, CW, CH);
        const gy = g2.createLinearGradient(0, 0, 0, CH);
        const top = portrait ? [0.1, 0.2] : [0.08, 0.2], bot = portrait ? [0.62, 0.76] : [0.72, 0.92];
        gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(top[0], 'rgba(0,0,0,0.25)'); gy.addColorStop(top[1], 'rgba(0,0,0,1)');
        gy.addColorStop(bot[0], 'rgba(0,0,0,1)'); gy.addColorStop(bot[1], 'rgba(0,0,0,0)'); gy.addColorStop(1, 'rgba(0,0,0,0)');
        g2.fillStyle = gy; g2.fillRect(0, 0, CW, CH);
        g2.restore();
        marks.forEach(({ m, g }, k) => {
          g.innerHTML = '';
          const at = cue(cues, m.at, 0.6 + k * 0.5), a = spring(lt, at, 0.6);
          if (lt < at - 0.01) return;
          const X = geom.x + m.x * iw * geom.s, Y = geom.y + m.y * ih * geom.s;
          const c = { red: TP.red, blue: TP.blue, gold: TP.gold, green: TP.green, ink: TP.ink, accent: pal.accent }[m.color] || m.color || TP.red;
          if (m.type === 'circle') {
            const r = (m.r || 0.08) * iw * geom.s;
            const ci = el(g, 'circle', { cx: X, cy: Y, r: r * lerp(1.6, 1, a), fill: 'none', stroke: c, 'stroke-width': 10, pathLength: 1 });
            draw(ci, prog(lt, at, 0.5));
          } else if (m.type === 'box') {
            const w = (m.w || 0.2) * iw * geom.s, h = (m.h || 0.2) * ih * geom.s;
            const b = el(g, 'rect', { x: X - w / 2, y: Y - h / 2, width: w, height: h, rx: 12, fill: 'none', stroke: c, 'stroke-width': 8, pathLength: 1 });
            draw(b, prog(lt, at, 0.5));
          } else if (m.type === 'arrow') {
            const L = 220, ang = (m.angle ?? 135) * Math.PI / 180, sx = X + Math.cos(ang) * L, sy = Y + Math.sin(ang) * L;
            const ex = X + Math.cos(ang) * 30, ey = Y + Math.sin(ang) * 30;
            const ar = path(g, `M${sx} ${sy} Q${(sx + ex) / 2 + 40} ${(sy + ey) / 2} ${ex} ${ey}`, c, 10);
            draw(ar, prog(lt, at, 0.4));
            const hp = prog(lt, at + 0.3, 0.2), ha = Math.atan2(ey - sy, ex - sx);
            if (hp > 0) path(g, `M${ex - 40 * Math.cos(ha - 0.5)} ${ey - 40 * Math.sin(ha - 0.5)} L${ex} ${ey} L${ex - 40 * Math.cos(ha + 0.5)} ${ey - 40 * Math.sin(ha + 0.5)}`, c, 10, { opacity: hp });
          }
          if (m.text) {
            const tx = X + (m.dx ?? 0), ty = Y + (m.dy ?? -((m.r || 0.08) * iw * geom.s) - 40);
            const t = svgText(g, m.text, tx, ty, m.size || 56,
              { fill: TP.ink, 'font-family': "'Patrick Hand', sans-serif", opacity: clamp01(a * 1.4), style: `paint-order: stroke; stroke: ${TP.paperLight}; stroke-width: 12px` });
            t.setAttribute('transform', `translate(${tx} ${ty}) scale(${lerp(0.6, 1, a)}) translate(${-tx} ${-ty})`);
          }
        });
      },
    };
  },
};
