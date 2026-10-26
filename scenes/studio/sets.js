// Sets: full-bleed ink-wash worlds behind the shots (brand/kit/BRAND.md §5.1). Without them every shot floated in
// the middle of an empty sheet and every video looked alike; a set gives the frame a sky, a horizon, a middle
// distance and a ground with depth (far planes pale and blue, near planes warm, dark and hatched), painted in the
// video's palette.
//
//   SETS.bake(name, w, h, ground, seed, horizon) -> canvas (w×h, "multiply" space: white = untouched paper)
//      ground: y of the line the cast stands on; horizon: y where sky meets land or sea (default ground - 9% h)
//   SETS.names: field, hills, desert, sea, ocean, coast, city, interior, night, snow, storm
//
// A scene picks one with "set": "<name>" or {"name", "ground", "horizon"} (stage px); with no "ground" the engine
// uses the shot's measured ground line. engine.js multiplies the set onto the paper under the shot with the same
// camera transform, so the set's ground stays under the cast's feet. Baked once per scene; per frame one drawImage.
// Deterministic: rng(seed), no Math.random.
'use strict';

const SETS = (() => {
  const C = THEME_PARCHMENT;
  const tint = (c, k) => mix('#ffffff', c, Math.max(0, Math.min(1, k)));   // 0 = white (no change) .. 1 = the colour

  function ridge(r, w, base, amp, freq, step = 5) {
    const ph = [r() * 6.28, r() * 6.28, r() * 6.28], pts = [];
    for (let x = -step; x <= w + step; x += step)
      pts.push([x, base - amp * (0.5 + 0.3 * Math.sin(x * freq + ph[0]) + 0.13 * Math.sin(x * freq * 2.3 + ph[1]) + 0.07 * Math.sin(x * freq * 5.1 + ph[2]))]);
    return pts;
  }
  function region(x, pts, bottom) {
    x.beginPath(); x.moveTo(pts[0][0], bottom);
    for (const p of pts) x.lineTo(p[0], p[1]);
    x.lineTo(pts[pts.length - 1][0], bottom); x.closePath();
  }
  const vgrad = (x, y0, y1, c0, c1) => { const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, c0); g.addColorStop(1, c1); return g; };
  // one wash plane under a ridge: flat colour, pigment pooled darker along its top edge
  function plane(x, pts, bottom, col, k) {
    const top = Math.min(...pts.map(p => p[1]));
    region(x, pts, bottom); x.fillStyle = vgrad(x, top, bottom, tint(col, k), tint(col, k * 0.75)); x.fill();
    x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]));
    x.strokeStyle = tint(col, k * 1.7); x.lineWidth = 1.4; x.lineJoin = 'round'; x.stroke();
  }
  // texture inside the current path: dry-brush streaks + (optional) hatching, both stronger towards the viewer
  function texture(x, r, w, y0, y1, col, k, hatch = 0) {
    x.save(); x.clip();
    for (let i = 0; i < (y1 - y0) * w / 500; i++) {
      const sy = y0 + Math.pow(r(), 0.8) * (y1 - y0), f = (sy - y0) / Math.max(1, y1 - y0), sx = r() * w, L = 6 + r() * 40 * (0.4 + f);
      x.strokeStyle = rgba(tint(col, k * (0.6 + 0.8 * f)), 0.5 + r() * 0.5); x.lineWidth = 0.5 + r() * 1.5 * (0.5 + f);
      x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + L, sy + (r() - 0.5) * 2); x.stroke();
    }
    if (hatch) {
      x.lineWidth = 0.8;
      for (let y = y0 - w * 0.5; y < y1; y += hatch) {
        const f = clamp01((y - y0) / Math.max(1, y1 - y0));
        x.strokeStyle = rgba(tint(col, k * 1.3), 0.25 + 0.5 * f);
        x.beginPath(); x.moveTo(-10, y); x.lineTo(w + 10, y + (w + 20) * 0.45 + (r() - 0.5) * 4); x.stroke();
      }
    }
    x.restore();
  }
  function sky(x, w, hy, top, k) { x.fillStyle = vgrad(x, 0, hy, tint(top, k), tint(top, k * 0.12)); x.fillRect(0, 0, w, hy + 2); }
  function sun(x, cx, cy, R, col, k) {
    const g = x.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 5);
    g.addColorStop(0, tint(col, k * 0.45)); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(cx - R * 5, cy - R * 5, R * 10, R * 10);
    x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fillStyle = tint(col, k); x.fill();
  }
  function clouds(x, r, w, y0, y1, col, k, n) {
    for (let i = 0; i < n; i++) {
      const cx = r() * w, cy = y0 + r() * (y1 - y0), cw = w * (0.18 + r() * 0.2);
      x.fillStyle = tint(col, k);
      x.beginPath();
      for (let j = 0; j < 5; j++) { const bx = cx - cw / 2 + cw * j / 4, br = cw * (0.12 + 0.08 * Math.sin(j * 2.1 + i)); x.moveTo(bx + br, cy); x.arc(bx, cy, br, Math.PI, 0); }
      x.rect(cx - cw / 2, cy - 1, cw, cw * 0.06); x.fill();
      x.strokeStyle = tint(col, k * 1.8); x.lineWidth = 1; x.beginPath(); x.moveTo(cx - cw * 0.55, cy + cw * 0.06); x.lineTo(cx + cw * 0.5, cy + cw * 0.06); x.stroke();
    }
  }
  function tufts(x, r, w, y0, y1, col, k, n) {
    x.strokeStyle = tint(col, k); x.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const ty = y0 + Math.pow(r(), 0.6) * (y1 - y0), f = (ty - y0) / Math.max(1, y1 - y0), tx = r() * w, s = 2 + 9 * f;
      x.lineWidth = 0.6 + f;
      for (let j = -1; j <= 1; j++) { x.beginPath(); x.moveTo(tx + j * s * 0.3, ty); x.quadraticCurveTo(tx + j * s * 0.5, ty - s * 0.7, tx + j * s, ty - s * 1.3); x.stroke(); }
    }
  }
  // the ground the cast stands on: warm wash darkening towards the viewer, hatched, with grass/stones
  function near(x, r, w, h, gy, col, k, grass = true) {
    const pts = ridge(r, w, gy + 2, 2, 0.03);
    region(x, pts, h); x.fillStyle = vgrad(x, gy, h, tint(col, k * 0.7), tint(col, k * 1.25)); x.fill();
    region(x, pts, h); texture(x, r, w, gy, h, col, k, 7);
    if (grass) tufts(x, r, w, gy + 4, h, C.inkSoft, 0.5, Math.round(w / 6));
  }
  function waves(x, r, w, y0, y1, col, k) {
    for (let y = y0 + 3, n = 0; y < y1; n++, y += 3 + (y - y0) * 0.08) {
      const f = (y - y0) / Math.max(1, y1 - y0), s = 1.5 + 10 * f;
      x.strokeStyle = tint(col, k * (0.8 + 0.6 * f)); x.lineWidth = 0.6 + s * 0.12;
      for (let px = (n % 2) * s * 1.5 + r() * s; px < w + s; px += s * (2.6 + r() * 2.6)) { x.beginPath(); x.arc(px, y, s, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }
    }
  }
  function skyline(x, r, w, base, hMax, col, k) {
    let cx = -10;
    x.beginPath(); x.moveTo(-10, base);
    while (cx < w + 10) {
      const bw = 8 + r() * 22, bh = hMax * (0.3 + r() * 0.7), kind = r();
      x.lineTo(cx, base - bh);
      if (kind < 0.2) { x.lineTo(cx + bw * 0.5, base - bh - bw * 0.45); x.lineTo(cx + bw, base - bh); }
      else if (kind < 0.32) x.arc(cx + bw / 2, base - bh, bw / 2, Math.PI, 0);
      else if (kind < 0.4) { x.lineTo(cx + bw * 0.42, base - bh); x.lineTo(cx + bw * 0.5, base - bh - hMax * 0.45); x.lineTo(cx + bw * 0.58, base - bh); }
      x.lineTo(cx + bw, base - bh); cx += bw + r() * 3; x.lineTo(cx, base - bh * 0.4);
    }
    x.lineTo(w + 10, base); x.closePath();
    x.fillStyle = tint(col, k); x.fill(); x.strokeStyle = tint(col, k * 1.6); x.lineWidth = 0.9; x.stroke();
    x.fillStyle = tint(col, k * 1.9);                                            // a few lit windows read as dark specks
    for (let i = 0; i < w / 14; i++) x.fillRect(r() * w, base - r() * hMax * 0.6, 1.4, 2);
  }

  const BUILD = {
    field(x, r, w, h, gy, hy) {
      sky(x, w, hy, C.blue, 0.42); clouds(x, r, w, hy * 0.15, hy * 0.55, C.paperLight, 0.0, 0);
      plane(x, ridge(r, w, hy, h * 0.012, 0.012), gy, C.blue, 0.22);
      plane(x, ridge(r, w, hy + (gy - hy) * 0.35, h * 0.01, 0.02), gy, C.green, 0.3);
      near(x, r, w, h, gy, C.stain, 0.45);
    },
    hills(x, r, w, h, gy, hy) {
      sky(x, w, hy, C.blue, 0.45); sun(x, w * (0.62 + 0.25 * r()), hy * 0.32, w * 0.07, C.gold, 0.55);
      plane(x, ridge(r, w, hy, h * 0.07, 0.008), gy, C.blue, 0.28);
      plane(x, ridge(r, w, hy + (gy - hy) * 0.3, h * 0.045, 0.013), gy, C.green, 0.36);
      plane(x, ridge(r, w, hy + (gy - hy) * 0.7, h * 0.025, 0.02), gy, C.green, 0.5);
      near(x, r, w, h, gy, C.green, 0.5);
    },
    desert(x, r, w, h, gy, hy) {
      sky(x, w, hy, C.gold, 0.45); sun(x, w * (0.2 + 0.6 * r()), hy * 0.3, w * 0.09, C.red, 0.45);
      plane(x, ridge(r, w, hy, h * 0.04, 0.006), gy, C.stain, 0.3);
      plane(x, ridge(r, w, hy + (gy - hy) * 0.5, h * 0.03, 0.01), gy, C.gold, 0.42);
      const pts = ridge(r, w, gy + 2, 2, 0.02);
      region(x, pts, h); x.fillStyle = vgrad(x, gy, h, tint(C.gold, 0.38), tint(C.stain, 0.6)); x.fill();
      x.strokeStyle = tint(C.stain, 0.65);
      for (let y = gy + 8; y < h; y += 6 + (y - gy) * 0.08) { x.lineWidth = 0.6 + (y - gy) / (h - gy); x.beginPath(); for (let px = -5; px <= w + 5; px += 6) { const yy = y + 2.5 * Math.sin(px * 0.035 + y * 0.7); px < 0 ? x.moveTo(px, yy) : x.lineTo(px, yy); } x.stroke(); }
    },
    sea(x, r, w, h, gy, hy) {   // a shore: open water to the horizon, the cast on the beach
      sky(x, w, hy, C.blue, 0.42); sun(x, w * (0.15 + 0.7 * r()), hy * 0.4, w * 0.06, C.gold, 0.5);
      x.fillStyle = vgrad(x, hy, gy, tint(C.blue, 0.4), tint(C.blue, 0.6)); x.fillRect(0, hy, w, gy - hy);
      x.strokeStyle = tint(C.blue, 0.9); x.lineWidth = 1.4; x.beginPath(); x.moveTo(0, hy); x.lineTo(w, hy); x.stroke();
      waves(x, r, w, hy, gy, C.blue, 0.7);
      near(x, r, w, h, gy, C.gold, 0.42, false);
    },
    ocean(x, r, w, h, gy, hy) {  // open water down to the frame bottom (ships, boats)
      sky(x, w, hy, C.blue, 0.42); sun(x, w * (0.15 + 0.7 * r()), hy * 0.4, w * 0.06, C.gold, 0.5);
      clouds(x, r, w, hy * 0.2, hy * 0.6, C.blue, 0.12, 3);
      x.fillStyle = vgrad(x, hy, h, tint(C.blue, 0.42), tint(C.blue, 0.8)); x.fillRect(0, hy, w, h - hy);
      x.strokeStyle = tint(C.blue, 0.9); x.lineWidth = 1.4; x.beginPath(); x.moveTo(0, hy); x.lineTo(w, hy); x.stroke();
      waves(x, r, w, hy, h, C.blue, 0.75);
    },
    coast(x, r, w, h, gy, hy) {
      BUILD.sea(x, r, w, h, gy, hy);
      const left = r() < 0.5, cw = w * 0.42;
      const pts = ridge(r, cw, hy, h * 0.05, 0.02).map(p => [left ? p[0] : w - p[0], p[1]]);
      pts.push([left ? cw : w - cw, hy]);
      plane(x, pts, hy + 2, C.green, 0.45);
    },
    city(x, r, w, h, gy, hy) {
      sky(x, w, hy, C.gold, 0.4); sun(x, w * (0.2 + 0.6 * r()), hy * 0.3, w * 0.06, C.red, 0.4);
      skyline(x, r, w, hy + (gy - hy) * 0.4, h * 0.12, C.blue, 0.3);
      skyline(x, r, w, hy + (gy - hy) * 0.85, h * 0.07, C.inkSoft, 0.4);
      const pts = ridge(r, w, gy + 2, 1, 0.03);
      region(x, pts, h); x.fillStyle = vgrad(x, gy, h, tint(C.stain, 0.35), tint(C.stain, 0.55)); x.fill();
      x.strokeStyle = tint(C.stain, 0.75); x.lineWidth = 1;                      // cobbles
      for (let y = gy + 6, row = 0; y < h; row++, y += 4 + (y - gy) * 0.07) {
        const s = 4 + (y - gy) * 0.09;
        for (let px = (row % 2) * s * 0.5; px < w; px += s) { x.beginPath(); x.ellipse(px, y, s * 0.42, s * 0.18 + 1, 0, 0, 6.283); x.stroke(); }
      }
    },
    interior(x, r, w, h, gy) {
      x.fillStyle = vgrad(x, 0, gy, tint(C.stain, 0.48), tint(C.stain, 0.3)); x.fillRect(0, 0, w, gy);
      x.strokeStyle = tint(C.stain, 0.6); x.lineWidth = 1;
      if (r() < 0.5) for (let px = r() * 24; px < w; px += 22 + r() * 8) { x.beginPath(); x.moveTo(px, 0); x.lineTo(px + (r() - 0.5) * 2, gy); x.stroke(); }
      else for (let y = gy - 16, row = 0; y > -16; y -= 16, row++) for (let px = (row % 2) * 18 - 18; px < w; px += 36) x.strokeRect(px + 0.5, y + 0.5, 36, 16);
      const ww = w * 0.22, wh = gy * 0.28, wx = w * (0.1 + 0.55 * r()), wy = gy * 0.22;   // window + its light pool
      const g = x.createRadialGradient(wx + ww / 2, gy * 0.75, 0, wx + ww / 2, gy * 0.75, w * 0.75);
      g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = tint(C.blue, 0.18); x.fillRect(wx, wy, ww, wh);
      x.strokeStyle = tint(C.ink, 0.6); x.lineWidth = 2.2; x.strokeRect(wx, wy, ww, wh);
      x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.moveTo(wx, wy + wh / 2); x.lineTo(wx + ww, wy + wh / 2); x.stroke();
      x.fillStyle = vgrad(x, gy, h, tint(C.stain, 0.5), tint(C.stain, 0.75)); x.fillRect(0, gy, w, h - gy);
      x.strokeStyle = tint(C.stain, 0.85); x.lineWidth = 1;
      for (let i = -10; i <= 10; i++) { x.beginPath(); x.moveTo(w / 2 + i * w * 0.06, gy); x.lineTo(w / 2 + i * w * 0.3, h); x.stroke(); }
      x.strokeStyle = tint(C.ink, 0.7); x.lineWidth = 1.6; x.beginPath(); x.moveTo(0, gy); x.lineTo(w, gy); x.stroke();
    },
    night(x, r, w, h, gy, hy) {
      x.fillStyle = vgrad(x, 0, hy, tint(C.blue, 0.95), tint(C.blue, 0.4)); x.fillRect(0, 0, w, hy + 2);
      for (let i = 0; i < w * hy / 900; i++) { x.fillStyle = `rgba(255,255,255,${0.55 + r() * 0.45})`; x.beginPath(); x.arc(r() * w, r() * hy * 0.85, 0.4 + r() * 1.1, 0, 6.283); x.fill(); }
      const mx = w * (0.15 + 0.7 * r()), my = hy * 0.28, mr = w * 0.05;
      const g = x.createRadialGradient(mx, my, mr, mx, my, mr * 5); g.addColorStop(0, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
      x.beginPath(); x.arc(mx, my, mr, 0, 6.283); x.fillStyle = '#ffffff'; x.fill();
      plane(x, ridge(r, w, hy, h * 0.05, 0.01), gy, C.blue, 0.6);
      plane(x, ridge(r, w, hy + (gy - hy) * 0.5, h * 0.025, 0.018), gy, C.ink, 0.42);
      near(x, r, w, h, gy, C.blue, 0.55);
    },
    snow(x, r, w, h, gy, hy) {
      sky(x, w, hy, C.blue, 0.38);
      plane(x, ridge(r, w, hy, h * 0.09, 0.011), gy, C.blue, 0.26);
      plane(x, ridge(r, w, hy + (gy - hy) * 0.5, h * 0.035, 0.02), gy, C.blue, 0.1);
      const pts = ridge(r, w, gy + 2, 2, 0.02);
      region(x, pts, h); x.fillStyle = vgrad(x, gy, h, tint(C.blue, 0.06), tint(C.blue, 0.24)); x.fill();
      region(x, pts, h); texture(x, r, w, gy, h, C.blue, 0.3, 11);
      for (let i = 0; i < w * h / 700; i++) { x.fillStyle = 'rgba(255,255,255,0.9)'; x.beginPath(); x.arc(r() * w, r() * gy, 0.6 + r() * 1.4, 0, 6.283); x.fill(); }
    },
    storm(x, r, w, h, gy, hy) {
      x.fillStyle = vgrad(x, 0, hy, tint(C.ink, 0.62), tint(C.inkSoft, 0.3)); x.fillRect(0, 0, w, hy + 2);
      clouds(x, r, w, hy * 0.1, hy * 0.7, C.ink, 0.28, 6);
      x.strokeStyle = tint(C.inkSoft, 0.45); x.lineWidth = 0.7;
      for (let i = 0; i < w * h / 500; i++) { const px = r() * w, py = r() * h, L = 6 + r() * 14; x.beginPath(); x.moveTo(px, py); x.lineTo(px - L * 0.3, py + L); x.stroke(); }
      x.fillStyle = vgrad(x, hy, h, tint(C.blue, 0.55), tint(C.ink, 0.6)); x.fillRect(0, hy, w, h - hy);
      waves(x, r, w, hy, h, C.ink, 0.55);
    },
  };

  function bake(name, w, h, ground, seed = 1, horizon = null) {
    const fn = BUILD[name];
    if (!fn) return null;
    const cv = document.createElement('canvas'); cv.width = Math.round(w); cv.height = Math.round(h);
    const x = cv.getContext('2d'), gy = Math.round(ground), hy = Math.round(horizon ?? ground - h * 0.09);
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, cv.width, cv.height);
    fn(x, rng(7001 + seed * 131), cv.width, cv.height, gy, hy);
    return cv;
  }
  return { names: Object.keys(BUILD), bake };
})();
