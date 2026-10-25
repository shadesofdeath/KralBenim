// td__lib: shared drawings for the td_* shots (Stickstory "tardigrades in space", 2026-10-25). Not a shot type itself.
// Parchment ink style (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz via _ink.js, palette tokens only (INK),
// everything a pure function of (seed, t). Parametric: usable for any micro-animal / space-experiment story.
// window.TD = {
//   atOr(cues, name|sec, fb), f1,
//   bear(parent, seed) -> {update(t, o)}   a cute but anatomically right tardigrade (side view): plump segmented
//       body, round head with a snout ring (mouth) and one eye spot, 8 stubby legs (4 near + 4 far, the last pair
//       pointing backwards) with tiny hooked claws. o: {x, y (ground point under the body), s: 1 (1 = ~470 px long),
//       face: 1|-1, rot (deg), ph (walk phase, cycles), paddle: false (floating: legs paddle in the air),
//       dry: 0..1 (0 = active, 1 = dried "tun": legs and head pulled in, wrinkled barrel), glow: 0..1 (red UV tint)}
//   egg(parent, seed) -> {update(t, o)}    o: {x, y, s, crack: 0..1, baby: 0..1 (a tiny bear climbs out)}
//   sat(parent, seed) -> {update(t, o)}    FOTON-type capsule (sphere + service cylinder + antennas) with an
//       experiment box on the outside, lid open, a tray of dried tuns and two straps.
//       o: {x, y, s, rot, tuns: 6, strap: 0..1, glow: 0..1 (tuns flash red), lid: 1 (open)}
//       -> returns {tray: [x, y]} (world centre of the tray, for rays / arrows)
//   stars(parent, seed, W, H, n, y0, y1) -> {update(t)}   sparse boiling ink stars + gold sparkles that twinkle
//   earth(parent, defs, seed) -> {update(t, cx, cy, r, land = true, fill = true)}  (fill false: only the horizon arc + ink-soft hatching)   ink globe with drifting continents, dashed atmosphere ring
//   sun(parent, seed) -> {update(t, x, y, r)}             gold sun with rotating rays
//   bolt(parent, seed) -> {update(t, from, to, p)}        red zig-zag ultraviolet ray (p 0..1 grows from the sun)
//   label(parent, L, W, H, seed) -> {update(lt, t, cues)} pop-in text: {text, x, y, at, size: 90, color, font:
//       "hand"|"serif", rot, underline: true, box: false (red box + paper text), strike: cue (red strike-through)}
//   figure(parent, K, seed) -> {update(lt, t, cues, W, H) -> {hand: [x, y] world, x, y}}   narrator (fez via the
//       script's "narrator") or a period figure: K = {x, y (ground 0..1 H), scale, pose, face, dir, emotion,
//       seq: [{at, pose, dir, face, emotion}], hat: true}
// }
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold, soft: INK.inkSoft };
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 16, flat = 1) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, y = Math.sin(a) * ry;
      out.push([cx + Math.cos(a) * rx, cy + (y > 0 ? y * flat : y)]);
    }
    return out;
  };

  // ------------------------------------------------------------------ tardigrade
  function bear(parent, sd) {
    const g = el(parent, 'g');
    const farLegs = [0, 1, 2, 3].map(() => ({ f: inkEl(g, INK.paperDark), r: inkEl(g) }));
    const bodyF = inkEl(g, INK.paperLight), gut = inkEl(g, INK.stain, { 'fill-opacity': 0.28 });
    const headF = inkEl(g, INK.paperLight);
    const bodyR = inkEl(g), headR = inkEl(g), crease = inkEl(g, INK.inkSoft), wrink = inkEl(g, INK.inkSoft);
    const nearLegs = [0, 1, 2, 3].map(() => ({ f: inkEl(g, INK.paperLight), r: inkEl(g) }));
    const claws = inkEl(g), eye = inkEl(g), eyeHi = inkEl(g, INK.paperLight), lid = inkEl(g);
    const blush = inkEl(g, INK.red, { 'fill-opacity': 0.3 }), snout = inkEl(g), glowF = inkEl(g, INK.red, { 'fill-opacity': 0 });
    return {
      node: g,
      update(t, o = {}) {
        const d = clamp01(o.dry ?? 0), s = o.s ?? 1, face = o.face ?? 1, ph = o.ph ?? 0, pad = !!o.paddle;
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(o.rot ?? 0)}) scale(${(face * s).toFixed(4)} ${s.toFixed(4)})`);
        const bob = pad ? Math.sin(t * 2.2) * 4 : Math.abs(Math.sin(ph * Math.PI * 2)) * -4;
        const bx = lerp(-20, -10, d), by = lerp(-112, -84, d) + bob * (1 - d), rx = lerp(172, 122, d), ry = lerp(96, 82, d);
        const hx = lerp(150, 92, d), hy = lerp(-118, -92, d) + bob * (1 - d), hr = lerp(74, 46, d);
        const fill = mix(INK.paperLight, INK.paperDark, d * 0.85);
        bodyF.setAttribute('fill', fill); headF.setAttribute('fill', fill);
        const S = k => sd * 50 + k;
        // legs: [base x, rear?]
        const legAt = [-138, -62, 12, 86];
        const legD = (i, far) => {
          const lx = legAt[i] * lerp(1, 0.7, d) + (far ? 24 : 0);
          const phase = ph * Math.PI * 2 + i * Math.PI / 2 + (far ? Math.PI : 0);
          let dx = Math.sin(phase) * 16, lift = Math.max(0, Math.cos(phase)) * 12;
          if (pad) { dx = Math.sin(t * 3.2 + i * 1.3 + (far ? 1.7 : 0)) * 14; lift = 10 + Math.cos(t * 3.2 + i) * 6; }
          if (i === 0) dx -= 34;                                    // last pair points backwards
          const topY = by + ry * 0.45, len = (0 - topY) * (1 - d * 0.92);
          const fy = topY + len - lift * (1 - d) - (far ? 6 : 0), fx = lx + dx * (1 - d);
          const w0 = 25, w1 = 18;
          const pts = [[lx - w0, topY - 10], [lx + w0, topY - 10], [fx + w1, fy - 4], [fx + w1 * 0.4, fy + 3], [fx - w1 * 0.6, fy + 2], [fx - w1, fy - 6]];
          return { pts, fx, fy };
        };
        let cl = '';
        for (const [arr, far] of [[farLegs, true], [nearLegs, false]]) {
          arr.forEach((L, i) => {
            const { pts, fx, fy } = legD(i, far);
            L.f.setAttribute('d', inkLoop(pts, { seed: S(i + (far ? 10 : 0)), t, amp: 1 }));
            L.r.setAttribute('d', inkPath(pts, { w: 5, seed: S(i + (far ? 20 : 30)), t, closed: true, amp: 1 }));
            if (!far && d < 0.8) {
              for (let k = 0; k < 3; k++) {     // tiny hooked claws, pointing forward (backward on the last pair)
                const dirc = i === 0 ? -1 : 1, x0 = fx + (k - 1) * 11;
                cl += inkPath([[x0, fy], [x0 + dirc * 6, fy + 10], [x0 + dirc * 16, fy + 12]], { w: 3.6, seed: S(40 + i * 3 + k), t, amp: 0.6, taper: 0.5 }) + ' ';
              }
            }
          });
        }
        claws.setAttribute('d', cl);
        const bp = ell(bx, by, rx, ry, 16, 0.86);
        bodyF.setAttribute('d', inkLoop(bp, { seed: S(1), t, amp: 1.4 }));
        bodyR.setAttribute('d', inkPath(bp, { w: 6.5, seed: S(2), t, closed: true, amp: 1.4 }));
        gut.setAttribute('d', inkLoop(ell(bx + 10, by + 10, rx * 0.55, ry * 0.42, 10), { seed: S(3), t, amp: 1.2 }));
        const hp = ell(hx, hy, hr, hr * 0.92, 12);
        headF.setAttribute('d', inkLoop(hp, { seed: S(4), t, amp: 1.2 }));
        headR.setAttribute('d', inkPath(hp, { w: 6, seed: S(5), t, closed: true, amp: 1.2 }));
        // segment creases (curved, across the body)
        let cr = '';
        for (const [k, cx] of [[0, -112], [1, -44], [2, 26]]) {
          const x = bx + (cx + 20) * (rx / 172), u = (x - bx) / rx, hh = ry * Math.sqrt(Math.max(0, 1 - u * u));
          cr += inkPath([[x, by - hh * 0.9], [x + 12, by], [x, by + hh * 0.76]], { w: 3.6, seed: S(60 + k), t, amp: 1, taper: 0.6 }) + ' ';
        }
        crease.setAttribute('d', cr);
        let wr = '';
        if (d > 0.05) for (let k = 0; k < 4; k++) {
          const y = by - ry * 0.55 + k * ry * 0.38;
          wr += inkPath([[bx - rx * 0.7, y + 4], [bx - rx * 0.2, y - 6], [bx + rx * 0.3, y + 5], [bx + rx * 0.72, y - 3]], { w: 3.4 * d, seed: S(70 + k), t, amp: 1.2, taper: 0.6 }) + ' ';
        }
        wrink.setAttribute('d', wr);
        // face: eye spot (closes when dry), blush, snout ring (the mouth opening)
        const ex = hx + hr * 0.36, ey = hy - hr * 0.22;
        if (d < 0.5) {
          eye.setAttribute('d', inkDot(ex, ey, 11, 12, S(80), t));
          eyeHi.setAttribute('d', inkDot(ex + 4, ey - 4, 3.6, 3.6, S(81), t));
          lid.setAttribute('d', '');
        } else {
          eye.setAttribute('d', ''); eyeHi.setAttribute('d', '');
          lid.setAttribute('d', inkPath([[ex - 12, ey], [ex, ey + 6], [ex + 12, ey]], { w: 4, seed: S(82), t, amp: 0.6 }));
        }
        blush.setAttribute('d', d < 0.5 ? inkDot(ex - 8, ey + 30, 15, 9, S(83), t) : '');
        const sx = hx + hr * 0.94, sy = hy + hr * 0.16;
        snout.setAttribute('d', inkCircle(sx, sy, lerp(13, 8, d), S(84), t, { w: 4.5, n: 8 }));
        const gl = clamp01(o.glow ?? 0);
        glowF.setAttribute('fill-opacity', (gl * 0.35).toFixed(3));
        glowF.setAttribute('d', gl > 0.01 ? inkLoop(bp, { seed: S(1), t, amp: 1.4 }) : '');
      },
    };
  }

  // ------------------------------------------------------------------ egg (+ hatching baby)
  function egg(parent, sd) {
    const g = el(parent, 'g');
    const f = inkEl(g, INK.paperLight), r = inkEl(g), dots = inkEl(g, INK.inkSoft), crack = inkEl(g);
    const babyG = el(g, 'g'), baby = bear(babyG, sd + 3);
    return {
      update(t, o = {}) {
        const s = o.s ?? 1, c = clamp01(o.crack ?? 0), b = clamp01(o.baby ?? 0);
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) scale(${s.toFixed(4)})`);
        const top = ell(0, -40, 34, 42, 12);
        const shell = b > 0 ? top.map(([x, y]) => [x, y < -40 ? y - b * 30 - (x > 0 ? b * 10 : 0) : y]) : top;
        f.setAttribute('d', inkLoop(shell, { seed: sd + 1, t, amp: 0.8 }));
        r.setAttribute('d', inkPath(shell, { w: 4.5, seed: sd + 2, t, closed: true, amp: 0.8 }));
        let dd = '';
        for (let k = 0; k < 5; k++) dd += inkDot(-14 + (k % 3) * 14, -58 + Math.floor(k / 3) * 22, 3.5, 3.5, sd + 10 + k, t) + ' ';
        dots.setAttribute('d', dd);
        crack.setAttribute('d', c > 0.02 ? inkPath([[-32, -44], [-18, -52], [-8, -38], [6, -52], [18, -40], [32, -48]].slice(0, 2 + Math.round(c * 4)), { w: 4, seed: sd + 4, t, amp: 0.8, smooth: false }) : '');
        babyG.style.opacity = b > 0.02 ? 1 : 0;
        if (b > 0.02) baby.update(t, { x: lerp(0, 46, b), y: lerp(-30, 6, b), s: 0.2 * lerp(0.6, 1, b), ph: t * 1.2, rot: lerp(-30, 0, b) });
      },
    };
  }

  // ------------------------------------------------------------------ satellite (FOTON-type capsule)
  function sat(parent, sd) {
    const g = el(parent, 'g');
    const ant = inkEl(g), cylF = inkEl(g, INK.paperDark), cylR = inkEl(g), bands = inkEl(g, INK.inkSoft);
    const sphF = inkEl(g, INK.paperLight), sphR = inkEl(g), hatch = inkEl(g), rivets = inkEl(g, INK.inkSoft);
    const brk = inkEl(g), boxF = inkEl(g, INK.paperDark), boxR = inkEl(g), trayF = inkEl(g, INK.paperLight), trayR = inkEl(g);
    const tunsF = inkEl(g, INK.paperDark), tunsR = inkEl(g), tunsG = inkEl(g, INK.red, { 'fill-opacity': 0 }), strapF = inkEl(g, INK.hatBand), lidF = inkEl(g, INK.paperDark), lidR = inkEl(g);
    return {
      update(t, o = {}) {
        const s = o.s ?? 1, X = o.x ?? 0, Y = o.y ?? 0, rot = o.rot ?? 0;
        g.setAttribute('transform', `translate(${f1(X)} ${f1(Y)}) rotate(${f1(rot)}) scale(${s.toFixed(4)})`);
        const S = k => sd * 40 + k;
        ant.setAttribute('d', inkPath([[-60, -120], [-120, -260]], { w: 6, seed: S(1), t }) + ' ' + inkPath([[50, -130], [96, -250]], { w: 6, seed: S(2), t }) + ' ' +
          inkDot(-120, -262, 10, 10, S(3), t) + ' ' + inkDot(96, -252, 10, 10, S(4), t));
        const cyl = [[-130, 90], [130, 90], [140, 330], [-140, 330]];
        cylF.setAttribute('d', inkLoop(cyl, { seed: S(5), t, smooth: false }));
        cylR.setAttribute('d', inkPath(cyl, { w: 6, seed: S(6), t, closed: true, smooth: false }));
        bands.setAttribute('d', [170, 240, 300].map((y, k) => inkPath([[-134, y], [134, y]], { w: 4, seed: S(7 + k), t })).join(' '));
        const sp = ell(0, 0, 160, 160, 16);
        sphF.setAttribute('d', inkLoop(sp, { seed: S(10), t, amp: 1.2 }));
        sphR.setAttribute('d', inkPath(sp, { w: 7, seed: S(11), t, closed: true, amp: 1.2 }));
        hatch.setAttribute('d', inkCircle(-40, -20, 46, S(12), t, { w: 5 }) + ' ' + inkCircle(-40, -20, 30, S(13), t, { w: 3.5 }) + ' ' +
          inkPath([[-150, 40], [-60, 70], [60, 70], [150, 40]], { w: 4, seed: S(14), t }));
        let rv = ''; for (let k = 0; k < 8; k++) { const a = -0.3 + k * 0.42; rv += inkDot(Math.cos(a) * 128, Math.sin(a) * 128 - 6, 5, 5, S(20 + k), t) + ' '; }
        rivets.setAttribute('d', rv);
        // experiment box on the outside of the capsule (right side)
        brk.setAttribute('d', inkPath([[150, -10], [196, -14]], { w: 9, seed: S(30), t }) + ' ' + inkPath([[150, 50], [196, 54]], { w: 9, seed: S(31), t }));
        const bx0 = 196, bx1 = 420, by0 = -60, by1 = 110;
        const box = [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]];
        boxF.setAttribute('d', inkLoop(box, { seed: S(32), t, smooth: false }));
        boxR.setAttribute('d', inkPath(box, { w: 6, seed: S(33), t, closed: true, smooth: false }));
        const tray = [[bx0 + 18, by0 + 18], [bx1 - 18, by0 + 18], [bx1 - 18, by1 - 18], [bx0 + 18, by1 - 18]];
        trayF.setAttribute('d', inkLoop(tray, { seed: S(34), t, smooth: false }));
        trayR.setAttribute('d', inkPath(tray, { w: 3.5, seed: S(35), t, closed: true, smooth: false }));
        const n = o.tuns ?? 6, cols = 3, rows = Math.ceil(n / cols);
        let tf = '', tr = '';
        for (let k = 0; k < n; k++) {
          const cx = lerp(bx0 + 62, bx1 - 62, (k % cols) / (cols - 1)), cy = lerp(by0 + 52, by1 - 48, rows > 1 ? Math.floor(k / cols) / (rows - 1) : 0.5);
          const p = ell(cx, cy, 27, 19, 10);
          tf += inkLoop(p, { seed: S(40 + k), t, amp: 0.8 }) + ' ';
          tr += inkPath(p, { w: 3.5, seed: S(50 + k), t, closed: true, amp: 0.8 }) + ' ' + inkPath([[cx - 18, cy - 2], [cx + 18, cy + 2]], { w: 2.6, seed: S(60 + k), t, amp: 0.6 }) + ' ';
        }
        tunsF.setAttribute('d', tf); tunsR.setAttribute('d', tr);
        tunsG.setAttribute('d', tf); tunsG.setAttribute('fill-opacity', (clamp01(o.glow ?? 0) * 0.75).toFixed(3));
        const st = clamp01(o.strap ?? 1);
        let sd2 = '';
        for (const [k, x] of [[0, bx0 + 88], [1, bx1 - 88]]) {
          const y0 = by0 - 14, y1 = lerp(y0, by1 + 14, st);
          if (st > 0.02) sd2 += inkLoop([[x - 12, y0], [x + 12, y0], [x + 12, y1], [x - 12, y1]], { seed: S(70 + k), t, smooth: false, amp: 0.8 }) + ' ';
        }
        strapF.setAttribute('d', sd2);
        const lo = clamp01(o.lid ?? 1), la = lerp(0, -112, lo) * Math.PI / 180;
        const hinge = [bx0, by0], L = bx1 - bx0;
        const lid = [[0, 0], [L, 0], [L, -16], [0, -16]].map(([x, y]) => [hinge[0] + x * Math.cos(la) - y * Math.sin(la), hinge[1] + x * Math.sin(la) + y * Math.cos(la)]);
        lidF.setAttribute('d', inkLoop(lid, { seed: S(80), t, smooth: false }));
        lidR.setAttribute('d', inkPath(lid, { w: 5, seed: S(81), t, closed: true, smooth: false }));
        const cr = Math.cos(rot * Math.PI / 180), sr = Math.sin(rot * Math.PI / 180), tx = 308 * s, ty = 25 * s;
        return { tray: [X + tx * cr - ty * sr, Y + tx * sr + ty * cr] };
      },
    };
  }

  // ------------------------------------------------------------------ stars
  function stars(parent, sd, W, H, n = 26, y0 = 0.12, y1 = 0.6) {
    const g = el(parent, 'g'), dots = inkEl(g, INK.inkSoft), spark = inkEl(g, INK.gold), sparkR = inkEl(g);
    const r = rng(sd * 7 + 3), list = [];
    for (let i = 0; i < n; i++) list.push({ x: r() * W, y: lerp(y0, y1, r()) * H, k: r(), big: r() < 0.3, ph: r() * 6 });
    return {
      update(t) {
        let d = '', s = '', sr = '';
        list.forEach((q, i) => {
          const x = (q.x - t * (6 + q.k * 8) + W * 2) % W, tw = 0.65 + 0.35 * Math.sin(t * 2.4 + q.ph);
          if (q.big) {
            const R = (16 + q.k * 12) * tw, rr = R * 0.32, pts = [];
            for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + t * 0.3, rad = k % 2 ? rr : R; pts.push([x + Math.cos(a) * rad, q.y + Math.sin(a) * rad]); }
            s += inkLoop(pts, { seed: sd + i, t, amp: 0.8, smooth: false }) + ' ';
            sr += inkPath(pts, { w: 2.8, seed: sd + 100 + i, t, closed: true, amp: 0.8, smooth: false }) + ' ';
          } else d += inkDot(x, q.y, 4 + q.k * 3, 4 + q.k * 3, sd + 200 + i, t) + ' ';
        });
        dots.setAttribute('d', d); spark.setAttribute('d', s); sparkR.setAttribute('d', sr);
      },
    };
  }

  // ------------------------------------------------------------------ Earth
  let clipN = 0;
  function earth(parent, defs, sd) {
    const id = 'tdclip' + (sd % 100000) + '_' + (clipN++);
    const cp = el(defs || parent, 'clipPath', { id }), cc = el(cp, 'circle');
    const g = el(parent, 'g'), atm = inkEl(g, INK.blue, { 'fill-opacity': 0.55 }), fillE = inkEl(g, INK.paperLight), sea = inkEl(g, INK.blue, { 'fill-opacity': 0.1 });
    const hatch = inkEl(g, INK.inkSoft), land = el(g, 'g', { 'clip-path': `url(#${id})` }), landF = inkEl(land, INK.green, { 'fill-opacity': 0.4 }), landR = inkEl(land, INK.inkSoft), ring = inkEl(g);
    const r0 = rng(sd + 11), blobs = [];
    for (let i = 0; i < 6; i++) blobs.push({ u: r0(), v: lerp(-0.7, 0.7, r0()), a: lerp(0.16, 0.3, r0()), b: lerp(0.1, 0.2, r0()) });
    return {
      update(t, cx, cy, r, land = true, fill = true) {
        fillE.style.display = sea.style.display = fill ? '' : 'none';
        cc.setAttribute('cx', f1(cx)); cc.setAttribute('cy', f1(cy)); cc.setAttribute('r', f1(r));
        const n = Math.max(16, Math.min(40, Math.round(r / 14)));
        const p = ell(cx, cy, r, r, n);
        fillE.setAttribute('d', inkLoop(p, { seed: sd + 1, t, amp: 1.4 }));
        sea.setAttribute('d', inkLoop(p, { seed: sd + 1, t, amp: 1.4 }));
        ring.setAttribute('d', inkPath(p, { w: 7, seed: sd + 2, t, closed: true, amp: 1.4 }));
        let ad = '';
        for (let k = 0; k < 18; k++) {
          const a0 = k / 18 * Math.PI * 2 + t * 0.05, a1 = a0 + 0.17;
          ad += inkPath([[cx + Math.cos(a0) * (r + 22), cy + Math.sin(a0) * (r + 22)], [cx + Math.cos(a1) * (r + 22), cy + Math.sin(a1) * (r + 22)]], { w: 4, seed: sd + 30 + k, t, amp: 0.8 }) + ' ';
        }
        atm.setAttribute('d', fill ? ad : '');
        let hd = '';
        if (!fill) for (let k = 0; k < 9; k++) {      // ground hatching just under the horizon arc (no disc fill)
          const a = -Math.PI / 2 + (k - 4) * 0.045, d0 = 26 + (k % 3) * 22;
          const x = cx + Math.cos(a) * (r - d0), y = cy + Math.sin(a) * (r - d0);
          hd += inkPath([[x - 34, y + 3], [x + 34, y - 3]], { w: 4, seed: sd + 70 + k, t, amp: 0.8 }) + ' ';
        }
        hatch.setAttribute('d', hd);
        let lf = '', lr = '';
        if (land) blobs.forEach((b, i) => {
          const u = ((b.u + t * 0.018) % 1) * 2.6 - 1.3, x = cx + u * r, y = cy + b.v * r;
          const q = ell(x, y, b.a * r, b.b * r, 10).map(([px, py], k) => [px + Math.sin(k * 1.7 + i) * b.a * r * 0.18, py + Math.cos(k * 2.3 + i) * b.b * r * 0.2]);
          lf += inkLoop(q, { seed: sd + 50 + i, t, amp: 1.2 }) + ' ';
          lr += inkPath(q, { w: 3.5, seed: sd + 60 + i, t, closed: true, amp: 1.2 }) + ' ';
        });
        landF.setAttribute('d', lf); landR.setAttribute('d', lr);
      },
    };
  }

  // ------------------------------------------------------------------ sun + UV bolt
  function sun(parent, sd) {
    const g = el(parent, 'g'), rays = inkEl(g, INK.gold), raysR = inkEl(g), disc = inkEl(g, INK.gold), discR = inkEl(g), face = inkEl(g, INK.paperLight, { 'fill-opacity': 0.5 });
    return {
      update(t, x, y, r) {
        let rd = '', rr = '';
        for (let k = 0; k < 12; k++) {
          const a = k / 12 * Math.PI * 2 + t * 0.25, L = r * (1.55 + 0.15 * Math.sin(t * 3 + k));
          const pts = [[x + Math.cos(a - 0.12) * r * 1.12, y + Math.sin(a - 0.12) * r * 1.12], [x + Math.cos(a) * L, y + Math.sin(a) * L], [x + Math.cos(a + 0.12) * r * 1.12, y + Math.sin(a + 0.12) * r * 1.12]];
          rd += inkLoop(pts, { seed: sd + k, t, amp: 1, smooth: false }) + ' ';
          rr += inkPath(pts, { w: 3.5, seed: sd + 20 + k, t, amp: 1, smooth: false }) + ' ';
        }
        rays.setAttribute('d', rd); raysR.setAttribute('d', rr);
        const p = ell(x, y, r, r, 14);
        disc.setAttribute('d', inkLoop(p, { seed: sd + 40, t }));
        discR.setAttribute('d', inkPath(p, { w: 6, seed: sd + 41, t, closed: true }));
        face.setAttribute('d', inkLoop(ell(x - r * 0.25, y - r * 0.25, r * 0.4, r * 0.3, 10), { seed: sd + 42, t }));
      },
    };
  }
  function bolt(parent, sd) {
    const f = inkEl(parent, INK.red), h = inkEl(parent, INK.gold);
    return {
      update(t, A, B, p) {
        if (p <= 0.01) { f.setAttribute('d', ''); h.setAttribute('d', ''); return; }
        const n = 7, pts = [], dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        const fr = inkFrame(t);
        for (let k = 0; k <= n; k++) {
          const u = k / n * p, z = (k === 0 || k === n) ? 0 : ((k + fr) % 2 ? 1 : -1) * 26;
          pts.push([A[0] + dx * u + nx * z, A[1] + dy * u + ny * z]);
        }
        f.setAttribute('d', inkPath(pts, { w: 13, seed: sd + 1, t, smooth: false, taper: 0.2 }));
        h.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 2, t, smooth: false, taper: 0.2 }));
      },
    };
  }

  // ------------------------------------------------------------------ label
  function label(parent, L, W, H, sd) {
    if (!L) return null;
    const g = el(parent, 'g'), box = inkEl(g, COL[L.color] || INK.red), boxR = inkEl(g);
    const hand = (L.font || 'hand') === 'hand', size = L.size || 90;
    const txt = el(g, 'text', { 'font-family': hand ? INK_FONT : FR, 'font-weight': hand ? 400 : 900, 'font-size': size, 'text-anchor': 'middle',
      fill: L.box ? INK.paperLight : (COL[L.color] || INK.ink) });
    txt.textContent = L.text;
    const und = inkEl(g, COL[L.color] || INK.ink), strike = inkEl(g, INK.red);
    let w = 0; try { w = txt.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = L.text.length * size * 0.55;
    return {
      update(lt, t, cues) {
        const a = atOr(cues, L.at, 0.1), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5);
        const x = (L.x ?? 0.5) * W, y = (L.y ?? 0.2) * H, b = boil(sd + 5, t, 1.2);
        g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
        g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1((L.rot ?? -3) + (1 - p) * -8)}) scale(${(lerp(0.4, 1, p) * (1 + 0.08 * pk)).toFixed(3)})`);
        txt.setAttribute('y', f1(size * 0.34));
        if (L.box) {
          const bw = w + 70, bh = size * 1.3, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
          box.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, smooth: false }));
          boxR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 2, t, closed: true, smooth: false }));
        }
        const u = L.underline === false || L.box ? 0 : (lt >= a ? prog(lt, a + 0.2, 0.35) : 0);
        und.setAttribute('d', u > 0.01 ? inkPath([[-w / 2, size * 0.52], [-w / 2 + w * u, size * 0.46]], { w: 6, seed: sd + 3, t }) : '');
        const sa = atOr(cues, L.strike, null), sp = sa == null ? 0 : prog(lt, sa, 0.3);
        strike.setAttribute('d', sp > 0.01 ? inkPath([[-w / 2 - 30, 10], [-w / 2 - 30 + (w + 60) * sp, -16 * sp]], { w: size * 0.14, seed: sd + 4, t, taper: 0.2 }) : '');
      },
    };
  }

  // ------------------------------------------------------------------ narrator / cast member
  function figure(parent, K, sd) {
    if (!K) return null;
    const g = el(parent, 'g');
    const isK = K.hat !== false;
    const rig = KASIF.create(g, { scale: K.scale ?? 1, hat: isK, accessory: isK ? null : (K.accessory || null), seed: sd });
    return {
      K,
      update(lt, t, cues, W, H) {
        const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
        (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
        segs.sort((a, b) => a.at - b.at);
        let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
        const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
        const x = (K.x ?? 0.8) * W, y = (K.y ?? 0.6) * H, face = faceOf(s.face ?? K.face, -1);
        const o = { x, y, face, since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
        if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
        const r = rig.update(t, s.pose || 'idle', o), sc = K.scale ?? 1;
        const hw = r.hands[1], hl = r.hands[0];
        return { x, y, face, hand: [x + face * sc * hw[0], y + sc * hw[1]], hand2: [x + face * sc * hl[0], y + sc * hl[1]], head: [x + face * sc * r.head[0], y + sc * r.head[1]] };
      },
    };
  }

  // ------------------------------------------------------------------ big red push button (pause / off)
  //   button(parent, seed) -> {update(t, x, y, r, press 0..1, icon: "pause"|"power")}
  function button(parent, sd) {
    const baseF = inkEl(parent, INK.hatBand), f = inkEl(parent, INK.red), r_ = inkEl(parent), ic = inkEl(parent, INK.paperLight);
    return {
      update(t, x, y, r, press = 0, icon = 'pause') {
        const sink = 10 * press, base = ell(x, y + 26, r * 1.12, r * 0.55, 14), cp = ell(x, y + sink, r, r * 0.8, 16);
        baseF.setAttribute('d', inkLoop(base, { seed: sd + 1, t }));
        f.setAttribute('d', inkLoop(cp, { seed: sd + 2, t }));
        r_.setAttribute('d', inkPath(cp, { w: 6, seed: sd + 3, t, closed: true }) + ' ' + inkPath(base, { w: 5, seed: sd + 4, t, closed: true }));
        if (icon === 'power') {
          const pts = []; for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + 0.6 + k / 10 * (Math.PI * 2 - 1.2); pts.push([x + Math.cos(a) * r * 0.42, y + sink + Math.sin(a) * r * 0.36]); }
          ic.setAttribute('d', inkPath(pts, { w: r * 0.13, seed: sd + 5, t, amp: 0.8 }) + ' ' + inkPath([[x, y + sink - r * 0.5], [x, y + sink - r * 0.05]], { w: r * 0.14, seed: sd + 6, t, amp: 0.8 }));
        } else {
          const bw = r * 0.18, bh = r * 0.8;
          ic.setAttribute('d', [-1, 1].map((s, k) => inkLoop([[x + s * r * 0.26 - bw, y + sink - bh / 2], [x + s * r * 0.26 + bw, y + sink - bh / 2], [x + s * r * 0.26 + bw, y + sink + bh / 2], [x + s * r * 0.26 - bw, y + sink + bh / 2]], { seed: sd + 7 + k, t, smooth: false, amp: 0.8 })).join(' '));
        }
      },
    };
  }

  window.TD = { button, atOr, f1, ell, bear, egg, sat, stars, earth, sun, bolt, label, figure, COL };
})();
