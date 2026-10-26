// ist09__lib: shared helpers for the ist09_* shots (1509 İstanbul depremi, "Kıyamet-i Suğra"). Not a shot type.
// window.IST9 = {atOr, f1, arc, rect, Shapes, dust, drops, quakeEnv}
//   Shapes(): registry of ink shapes {add(parent, pts | (lt) => pts, {fill, fop, stroke, sop, w, seed, amp, smooth,
//     closed, vis: (lt) => bool}) -> entry; update(t, lt)}: fills via inkLoop, outlines via inkPath, all re-boiled.
//   dust(parent, sd): billowing dust clouds {puff(x, y, at, size), update(lt, t)} (paper-dark wash blobs, ink-soft rims)
//   drops(parent, sd): ballistic stones / water drops {add({x, y, vx, vy, at, size, kind: 'stone'|'drop', floor}), update(lt, t)}
//   quakeEnv(lt, at, dur): 0..1 shaking strength (rises fast, holds, fades over the last 40%)
// Palette tokens only (INK.*); pure functions of (seed, lt); no Math.random.
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const arc = (cx, cy, rx, ry, a0, a1, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const orient = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a < 0 ? pts.slice().reverse() : pts; };

  function Shapes() {
    const list = [];
    let n = 0;
    return {
      list,
      add(parent, pts, o = {}) {
        const seed = o.seed ?? (n += 7) * 13 + 101;
        const e = { pts, o, seed,
          f: o.fill ? inkEl(parent, o.fill, o.fop != null ? { 'fill-opacity': o.fop } : {}) : null,
          l: o.stroke ? inkEl(parent, o.stroke, o.sop != null ? { 'fill-opacity': o.sop } : {}) : null };
        list.push(e);
        return e;
      },
      update(t, lt) {
        for (const e of list) {
          const o = e.o, vis = o.vis ? o.vis(lt) : true;
          let pts = vis ? (typeof e.pts === 'function' ? e.pts(lt) : e.pts) : null;
          if (!pts || pts.length < 2) { if (e.f) e.f.setAttribute('d', ''); if (e.l) e.l.setAttribute('d', ''); continue; }
          const amp = o.amp ?? 1.3, smooth = o.smooth ?? false, closed = o.closed ?? true;
          if (e.f) e.f.setAttribute('d', pts.length > 2 ? inkLoop(orient(pts), { seed: e.seed, t, amp, smooth }) : '');
          if (e.l) e.l.setAttribute('d', inkPath(pts, { seed: e.seed + 1, t, amp, w: o.w ?? 5, closed, smooth }));
        }
      },
    };
  }

  // dust clouds: each puff = 6 wash blobs that swell, rise and thin out over ~2.2 s
  function dust(parent, sd) {
    const puffs = [];
    return {
      puff(x, y, at, size = 1) {
        const r = rng(sd + puffs.length * 31 + 7);
        const blobs = Array.from({ length: 6 }, (_, i) => ({ dx: (r() - 0.5) * 120 * size, dy: -r() * 40 * size, rr: (40 + r() * 50) * size,
          vx: (r() - 0.5) * 60 * size, vy: -(30 + r() * 50) * size,
          f: inkEl(parent, INK.paperDark, { 'fill-opacity': 0 }), l: inkEl(parent, INK.inkSoft, { 'fill-opacity': 0 }) }));
        puffs.push({ x, y, at, size, blobs });
      },
      update(lt, t) {
        puffs.forEach((p, k) => p.blobs.forEach((b, i) => {
          const u = (lt - p.at) / 2.4;
          if (p.at == null || u < 0 || u > 1) { b.f.setAttribute('d', ''); b.l.setAttribute('d', ''); return; }
          const g = 1 - Math.pow(1 - Math.min(1, u * 1.6), 3), R = b.rr * (0.35 + 0.9 * g);
          const cx = p.x + b.dx + b.vx * u * 2, cy = p.y + b.dy + b.vy * u * 2;
          const pts = inkEllipsePts(cx, cy, R, R * 0.78, sd + k * 50 + i, 10, 0, 0.12);
          const a = (1 - u) * (u < 0.08 ? u / 0.08 : 1);
          b.f.setAttribute('fill-opacity', (0.85 * a).toFixed(3)); b.l.setAttribute('fill-opacity', (0.7 * a).toFixed(3));
          b.f.setAttribute('d', inkLoop(pts, { seed: sd + k * 50 + i, t, amp: 2 }));
          b.l.setAttribute('d', inkPath(pts, { seed: sd + k * 50 + i + 3, t, amp: 2, w: 3, closed: true }));
        }));
      },
    };
  }

  // ballistic bits: stones tumble (paper-light block, ink rim), drops are blue blobs; both vanish at their floor
  function drops(parent, sd) {
    const items = [];
    return {
      add(o) {
        const isDrop = o.kind === 'drop';
        items.push(Object.assign({ size: 1, g: 900, spin: 0, floor: 1e9 }, o, {
          f: inkEl(parent, isDrop ? INK.blue : INK.paperLight, isDrop ? { 'fill-opacity': 0.8 } : {}),
          l: isDrop ? null : inkEl(parent, INK.ink), ring: o.splash ? inkEl(parent, INK.paperLight) : null, ring2: o.splash ? inkEl(parent, INK.blue) : null }));
      },
      update(lt, t) {
        items.forEach((d, i) => {
          const u = lt - d.at;
          let x = d.x + d.vx * u, y = d.y + d.vy * u + 0.5 * d.g * u * u;
          if (d.ring) {   // splash where it lands: foam ring + spray ring widening for 0.7 s
            const ul = (-d.vy + Math.sqrt(Math.max(0, d.vy * d.vy + 2 * d.g * (d.floor - d.y)))) / d.g, s2 = u - ul;
            if (d.at != null && s2 >= 0 && s2 < 0.7) {
              const R = (20 + 120 * s2) * d.size, cx = d.x + d.vx * ul, pts = inkEllipsePts(cx, d.floor, R, R * 0.3, sd + 50 + i, 12);
              d.ring.setAttribute('d', inkPath(pts, { seed: sd + 60 + i, t, w: 10 * (1 - s2), amp: 1, closed: true }));
              d.ring2.setAttribute('d', inkPath(pts.slice(5, 12).map(([px, py]) => [px, py - (1 - s2) * 40 * d.size]), { seed: sd + 70 + i, t, w: 5, amp: 1 }));
            } else { d.ring.setAttribute('d', ''); d.ring2.setAttribute('d', ''); }
          }
          if (d.at == null || u < 0 || y > d.floor) { d.f.setAttribute('d', ''); if (d.l) d.l.setAttribute('d', ''); return; }
          const s = 12 * d.size;
          if (d.kind === 'drop') { d.f.setAttribute('d', inkDot(x, y, s * 0.6, s * 0.75, sd + i, t, 0.6)); return; }
          const a = (d.spin || 3) * u + i, c = Math.cos(a), sn = Math.sin(a);
          const pts = [[-1, -0.7], [1, -0.7], [1, 0.7], [-1, 0.7]].map(([px, py]) => [x + (px * c - py * sn) * s, y + (px * sn + py * c) * s]);
          d.f.setAttribute('d', inkLoop(pts, { seed: sd + i, t, amp: 0.8, smooth: false }));
          d.l.setAttribute('d', inkPath(pts, { seed: sd + i + 1, t, amp: 0.8, w: 3, closed: true, smooth: false }));
        });
      },
    };
  }

  const quakeEnv = (lt, at, dur) => {
    if (at == null || lt < at) return 0;
    const u = (lt - at) / dur;
    if (u > 1) return 0;
    return Math.min(1, u * 8) * (u > 0.6 ? 1 - (u - 0.6) / 0.4 : 1);
  };

  window.IST9 = { atOr, f1, arc, rect, orient, Shapes, dust, drops, quakeEnv };
})();
