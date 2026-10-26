// cas__lib: shared drawings for the cas_* shots (Stickstory "orphan tsunami of 1700", 2026-10-27). Not a shot type.
// Parchment ink style (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz via _ink.js, palette tokens only (INK),
// everything a pure function of (seed, t). Parametric: usable for any tsunami / coastal-disaster / Edo-Japan story.
// window.CAS = {
//   f1, atOr (TD-style: cue name or seconds), ell,
//   house(parent, seed) -> {update(t, o)}  Edo-period Japanese fishing house (minka): posts, plank walls, a shoji
//       panel, a heavy hipped roof with upturned eaves and a ridge beam. o: {x, y (ground point, centre), s: 1
//       (1 = ~300 px wide), rot (deg, tilting when the sea lifts it), fire: 0..1 (flames on the roof), wet: 0..1}
//   flame(parent, seed) -> {update(t, x, y, s, p)}  red + gold licking flames with sparks (p 0..1 grows them)
//   wave(parent, seed) -> {update(t, o)}  a towering breaking wave in woodblock-print style: blue wash body with
//       parallel ink stripes, a curling lip with claw-like foam fingers, spray dots. o: {x (crest x), y (base y),
//       h: 700 (height), back: 900 (length of the back slope, to the left), curl: 0..1, face: 1 (breaks to the right)
//       | -1}
//   pine(parent, seed) -> {update(t, o)}  wind-bent coastal pine: crooked trunk, flat cloud-like needle pads.
//       o: {x, y (ground), s: 1 (1 = ~420 px tall), face: 1|-1, sway: 1}
//   water(parent, seed) -> {update(t, x0, x1, y, depth, p)} a flood sheet: blue wash band with surface ripples and
//       foam (p 0..1 fills from the left)
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const ell = (cx, cy, rx, ry, n = 16) => {
    const out = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return out;
  };
  const xf = (g, o) => g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(o.rot ?? 0)}) scale(${((o.face ?? 1) * (o.s ?? 1)).toFixed(4)} ${(o.s ?? 1).toFixed(4)})`);

  // ------------------------------------------------------------------ flame
  function flame(parent, sd) {
    const g = el(parent, 'g'), red = inkEl(g, INK.red), gold = inkEl(g, INK.gold), rim = inkEl(g), sp = inkEl(g, INK.gold);
    return {
      update(t, x, y, s, p) {
        if (p <= 0.01) { red.setAttribute('d', ''); gold.setAttribute('d', ''); rim.setAttribute('d', ''); sp.setAttribute('d', ''); return; }
        const tongue = (k, hh, ww) => {
          const ph = t * 7 + k * 1.9, lean = Math.sin(ph) * ww * 0.5, top = -hh * (0.85 + 0.15 * Math.sin(ph * 1.3));
          return [[-ww, 0], [-ww * 0.7, top * 0.45], [lean - ww * 0.15, top * 0.8], [lean, top], [lean + ww * 0.25, top * 0.7], [ww * 0.75, top * 0.35], [ww, 0]];
        };
        let r = '', go = '', rr = '';
        [[-0.55, 0.7], [0, 1], [0.5, 0.8]].forEach(([dx, k], i) => {
          const H = 150 * s * p * k, Wd = 46 * s * k;
          const pts = tongue(i, H, Wd).map(q => [x + dx * 70 * s + q[0], y + q[1]]);
          r += inkLoop(pts, { seed: sd + i, t, amp: 2 }) + ' ';
          rr += inkPath(pts, { w: 4, seed: sd + 10 + i, t, closed: true, amp: 2 }) + ' ';
          const inner = tongue(i + 5, H * 0.55, Wd * 0.5).map(q => [x + dx * 70 * s + q[0], y + q[1]]);
          go += inkLoop(inner, { seed: sd + 20 + i, t, amp: 1.5 }) + ' ';
        });
        red.setAttribute('d', r); gold.setAttribute('d', go); rim.setAttribute('d', rr);
        let sps = '';
        for (let k = 0; k < 6; k++) {
          const life = ((t * 0.9 + k / 6) % 1), sx = x + Math.sin(k * 2.3 + t) * 60 * s, sy = y - 120 * s * p - life * 220 * s;
          sps += inkDot(sx, sy, 5 * (1 - life) + 1, 5 * (1 - life) + 1, sd + 40 + k, t) + ' ';
        }
        sp.setAttribute('d', sps);
      },
    };
  }

  // ------------------------------------------------------------------ house
  function house(parent, sd) {
    const g = el(parent, 'g');
    const posts = inkEl(g), wallF = inkEl(g, INK.paperLight), wallR = inkEl(g), planks = inkEl(g, INK.inkSoft);
    const shojiF = inkEl(g, INK.paperLight), shojiR = inkEl(g), wetF = inkEl(g, INK.blue, { 'fill-opacity': 0.3 });
    const roofF = inkEl(g, INK.paperDark), roofT = inkEl(g, INK.inkSoft), roofR = inkEl(g), ridge = inkEl(g);
    const fl = flame(g, sd + 300);
    return {
      node: g,
      update(t, o = {}) {
        xf(g, o);
        const S = k => sd * 50 + k;
        // walls (local: centre bottom at 0,0; 300 wide)
        const wb = [[-130, 0], [130, 0], [130, -150], [-130, -150]];
        wallF.setAttribute('d', inkLoop(wb, { seed: S(1), t, smooth: false }));
        wallR.setAttribute('d', inkPath(wb, { w: 6, seed: S(2), t, closed: true, smooth: false }));
        let pl = '';
        for (let k = 1; k < 5; k++) pl += inkPath([[-130, -k * 30], [-40, -k * 30 + 1]], { w: 2.6, seed: S(3 + k), t, amp: 0.8 }) + ' ';
        planks.setAttribute('d', pl);
        posts.setAttribute('d', [-130, -40, 130].map((x, k) => inkPath([[x, 6], [x, -152]], { w: 9, seed: S(10 + k), t, amp: 0.8 })).join(' '));
        const sj = [[-20, -10], [110, -10], [110, -130], [-20, -130]];
        shojiF.setAttribute('d', inkLoop(sj, { seed: S(14), t, smooth: false }));
        let sr = inkPath(sj, { w: 5, seed: S(15), t, closed: true, smooth: false });
        for (const x of [23, 66]) sr += ' ' + inkPath([[x, -10], [x, -130]], { w: 3, seed: S(16 + x), t, amp: 0.6 });
        for (const y of [-50, -90]) sr += ' ' + inkPath([[-20, y], [110, y]], { w: 3, seed: S(18 - y), t, amp: 0.6 });
        shojiR.setAttribute('d', sr);
        const wet = clamp01(o.wet ?? 0);
        wetF.setAttribute('d', wet > 0.01 ? inkLoop([[-130, 0], [130, 0], [130, -150 * wet * 0.6], [-130, -150 * wet * 0.6 - 8]], { seed: S(19), t, smooth: false }) : '');
        // roof: heavy hipped roof, eaves turned up at the ends
        const rf = [[-200, -140], [-170, -150], [-110, -262], [110, -262], [170, -150], [200, -140], [150, -128], [-150, -128]];
        roofF.setAttribute('d', inkLoop(rf, { seed: S(20), t, amp: 1.4 }));
        roofR.setAttribute('d', inkPath(rf, { w: 7, seed: S(21), t, closed: true, amp: 1.4 }));
        let rt = '';
        for (let k = 1; k < 5; k++) { const y = -140 - k * 24, hw = lerp(175, 112, k / 5); rt += inkPath([[-hw, y], [hw, y]], { w: 2.4, seed: S(22 + k), t, amp: 1 }) + ' '; }
        roofT.setAttribute('d', rt);
        ridge.setAttribute('d', inkPath([[-125, -266], [125, -266]], { w: 14, seed: S(30), t }) + ' ' +
          inkPath([[-125, -266], [-140, -284]], { w: 8, seed: S(31), t }) + ' ' + inkPath([[125, -266], [140, -284]], { w: 8, seed: S(32), t }));
        fl.update(t, 0, -262, 1.2, clamp01(o.fire ?? 0));
      },
    };
  }

  // ------------------------------------------------------------------ pine
  function pine(parent, sd) {
    const g = el(parent, 'g'), trunk = inkEl(g), pads = [0, 1, 2, 3].map(() => ({ f: inkEl(g, INK.green, { 'fill-opacity': 0.55 }), r: inkEl(g), h: inkEl(g, INK.inkSoft) }));
    return {
      update(t, o = {}) {
        xf(g, o);
        const sw = Math.sin(t * 1.3) * 6 * (o.sway ?? 1), S = k => sd * 40 + k;
        trunk.setAttribute('d', inkPath([[0, 0], [10, -120], [-20, -240], [30 + sw * 0.5, -360]], { w: 16, seed: S(1), t, taper: 0.5 }) + ' ' +
          inkPath([[-14, -220], [-110 + sw, -270]], { w: 9, seed: S(2), t }) + ' ' + inkPath([[18, -300], [130 + sw, -320]], { w: 8, seed: S(3), t }));
        [[-120, -280, 95], [130, -330, 85], [30, -385, 110], [-40, -200, 70]].forEach(([x, y, r], k) => {
          const pts = ell(x + sw, y, r, r * 0.34, 12).map((p, i) => [p[0], p[1] + (i > 6 ? Math.sin(i) * 6 : 0)]);
          pads[k].f.setAttribute('d', inkLoop(pts, { seed: S(10 + k), t }));
          pads[k].r.setAttribute('d', inkPath(pts, { w: 5, seed: S(20 + k), t, closed: true }));
          let h = ''; for (let j = -2; j <= 2; j++) h += inkPath([[x + sw + j * r * 0.3 - 14, y + 6], [x + sw + j * r * 0.3 + 14, y - 8]], { w: 2.6, seed: S(30 + k * 5 + j), t, amp: 0.8 }) + ' ';
          pads[k].h.setAttribute('d', h);
        });
      },
    };
  }

  // ------------------------------------------------------------------ wave
  function wave(parent, sd) {
    const g = el(parent, 'g');
    const body = inkEl(g, INK.blue, { 'fill-opacity': 0.5 }), deep = inkEl(g, INK.ink, { 'fill-opacity': 0.16 });
    const stripes = inkEl(g, INK.paperLight, { 'fill-opacity': 0.8 }), rim = inkEl(g), foam = inkEl(g, INK.paperLight), foamR = inkEl(g), spray = inkEl(g, INK.paperLight), sprayR = inkEl(g, INK.inkSoft);
    // outline in units of h (x forward, y up negative); the lip is stretched by curl
    const BACK = [[-1.0, 0], [-0.72, -0.1], [-0.45, -0.32], [-0.22, -0.62], [-0.06, -0.9]];
    const LIP = [[0.04, -1.0], [0.2, -1.04], [0.36, -1.0], [0.5, -0.88], [0.58, -0.72], [0.56, -0.58], [0.47, -0.52]];
    const UNDER = [[0.42, -0.62], [0.33, -0.72], [0.2, -0.75], [0.09, -0.68]];
    const FRONT = [[0.03, -0.5], [0.06, -0.3], [0.2, -0.12], [0.45, -0.03], [0.65, 0]];
    return {
      update(t, o = {}) {
        const h = o.h ?? 700, back = o.back ?? 900, face = o.face ?? 1, curl = clamp01(o.curl ?? 0.6), S = k => sd * 70 + k;
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) scale(${face} 1)`);
        const k = 0.7 + 0.45 * curl, bob = Math.sin(t * 1.6) * 0.012;
        const P = (q, i, lip) => [q[0] * (lip ? h * k : (q[0] < 0 ? (q[0] < -0.5 ? back : h * 0.8) : h)) + (lip ? 0 : 0), q[1] * h * (1 + bob * (i % 3)) + (lip ? h * 0.1 * (1 - curl) * (q[0] / 0.6) : 0)];
        const back_ = BACK.map((q, i) => [q[0] < -0.5 ? q[0] * back : q[0] * Math.max(h * 0.9, back * 0.5), q[1] * h * (1 + bob)]);
        const lip = LIP.map((q, i) => P(q, i, true)), und = UNDER.map((q, i) => P(q, i, true)), front = FRONT.map((q, i) => P(q, i, false));
        const shape = back_.concat(lip, und, front);
        body.setAttribute('d', inkLoop(shape, { seed: S(1), t, amp: 2 }));
        rim.setAttribute('d', inkPath(back_.concat(lip), { w: 10, seed: S(2), t, taper: 0.15 }) + ' ' +
          inkPath(lip.slice(-1).concat(und, front), { w: 6, seed: S(3), t, taper: 0.3 }));
        // the dark barrel under the lip
        deep.setAttribute('d', inkLoop(und.concat([front[0], [h * 0.2 * k, -h * 0.5], [h * 0.4 * k, -h * 0.56]]), { seed: S(4), t, amp: 1.5 }));
        // pale woodblock streaks following the back slope (they flow up towards the crest)
        let st = '';
        for (let j = 1; j <= 7; j++) {
          const u = j / 8, sh = ((t * 0.35 + j * 0.13) % 1);
          const pts = back_.slice(1).concat([lip[1]]).map((p, i) => [p[0] * (1 - u * 0.15) + h * 0.12 * u, p[1] * (1 - u * 0.85) - h * 0.02]);
          const n = pts.length, a0 = Math.floor(sh * 2), seg = pts.slice(a0, a0 + 4);
          if (seg.length > 1) st += inkPath(seg, { w: 7 - u * 3, seed: S(10 + j), t, amp: 1.4, taper: 0.7 }) + ' ';
        }
        stripes.setAttribute('d', st);
        // foam claws along the lip, pointing outwards and forwards
        let fo = '', fr = '';
        for (let i = 1; i < lip.length; i++) {
          const A = lip[i - 1], B = lip[i];
          for (let s2 = 0; s2 < 2; s2++) {
            const u = (s2 + 0.5) / 2, px = lerp(A[0], B[0], u), py = lerp(A[1], B[1], u);
            let dx = B[0] - A[0], dy = B[1] - A[1]; const L0 = Math.hypot(dx, dy) || 1; dx /= L0; dy /= L0;
            const nx = dy, ny = -dx, L = h * (0.075 + 0.02 * Math.sin(i * 2.1 + s2 + t * 3)) * (0.7 + 0.5 * curl);
            const claw = [[px - dx * 16, py - dy * 16], [px + nx * L * 0.7 - dx * 4, py + ny * L * 0.7 - dy * 4], [px + nx * L + dx * L * 0.7, py + ny * L + dy * L * 0.7], [px + nx * L * 0.35 + dx * 10, py + ny * L * 0.35 + dy * 10], [px + dx * 16, py + dy * 16]];
            fo += inkLoop(claw, { seed: S(30 + i * 2 + s2), t, amp: 1.5 }) + ' ';
            fr += inkPath(claw, { w: 4, seed: S(50 + i * 2 + s2), t, closed: true, amp: 1.5 }) + ' ';
          }
        }
        foam.setAttribute('d', fo); foamR.setAttribute('d', fr);
        // spray thrown forward off the lip
        let sp = '', spr = '';
        const tip = lip[4];
        for (let j = 0; j < 16; j++) {
          const life = (t * 0.55 + j / 16) % 1, a = -Math.PI * (0.05 + 0.45 * ((j * 0.37) % 1));
          const x = tip[0] + Math.cos(a) * h * (0.05 + life * 0.35), y = tip[1] - h * 0.12 + Math.sin(a) * h * (0.05 + life * 0.3) + life * life * h * 0.25;
          const r = (16 - life * 10) * (0.6 + (j % 3) * 0.3) * Math.min(1, h / 500);
          sp += inkDot(x, y, r, r, S(80 + j), t) + ' ';
          spr += inkCircle(x, y, r, S(100 + j), t, { w: 2.6, amp: 0.6 }) + ' ';
        }
        spray.setAttribute('d', sp); sprayR.setAttribute('d', spr);
      },
    };
  }

  // ------------------------------------------------------------------ flood sheet
  function water(parent, sd) {
    const g = el(parent, 'g'), f = inkEl(g, INK.blue, { 'fill-opacity': 0.45 }), r = inkEl(g), rip = inkEl(g, INK.paperLight), rr = inkEl(g, INK.inkSoft);
    return {
      update(t, x0, x1, y, depth, p) {
        if (p <= 0.01) { f.setAttribute('d', ''); r.setAttribute('d', ''); rip.setAttribute('d', ''); rr.setAttribute('d', ''); return; }
        const xe = lerp(x0, x1, p), top = [], S = k => sd * 30 + k;
        for (let k = 0; k <= 16; k++) { const x = lerp(x0, xe, k / 16); top.push([x, y - depth + Math.sin(x * 0.02 - t * 4) * 8]); }
        top.push([xe + 30, y - depth * 0.4]);
        f.setAttribute('d', inkLoop(top.concat([[xe + 40, y], [x0, y]]), { seed: S(1), t, smooth: false, amp: 1.4 }));
        r.setAttribute('d', inkPath(top, { w: 6, seed: S(2), t, amp: 1.4 }));
        let a = '', b = '';
        for (let k = 0; k < 7; k++) {
          const x = lerp(x0, xe, (k + 0.5) / 7) + Math.sin(t * 2 + k) * 10, yy = y - depth * (0.35 + 0.3 * ((k * 0.61) % 1));
          b += inkPath([[x - 34, yy], [x - 10, yy - 7], [x + 14, yy]], { w: 3.4, seed: S(10 + k), t, amp: 1 }) + ' ';
        }
        for (let k = 0; k < 5; k++) { const x = xe - 10 + Math.sin(t * 5 + k) * 8, yy = y - depth * (0.2 + k * 0.18); a += inkDot(x + 12, yy, 13 - k, 9, S(20 + k), t) + ' '; }
        rip.setAttribute('d', a); rr.setAttribute('d', b);
      },
    };
  }

  window.CAS = { f1, atOr, ell, house, flame, pine, wave, water };
})();
