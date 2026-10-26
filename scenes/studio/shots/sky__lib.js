// sky__lib: shared drawings for the sky_* shots (Stickstory long video "Skylab fell on Esperance", 2026-10-26).
// Not a shot type itself. Parchment ink style (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz via _ink.js,
// palette tokens only (INK), everything a pure function of (seed, t). Parametric: any space-station / satellite story.
// window.SKY = {
//   station(parent, seed) -> {update(t, o) -> {pt(x, y) world point of a local point}}  Skylab, side view: orbital
//     workshop (big cylinder, left), airlock + docking adapter (thin, middle), the solar telescope mount with its four
//     "windmill" panels (above), docked Apollo ship (right). Local units: ~1000 wide (-400..560), hull radius 105.
//     o: {x, y, s: 1, rot: 0, shield: 1 (0..1 gold micrometeoroid wrap; 0 = gone), shield_tear: 0..1 (a panel peels
//       off and flies away), upper: 1 (top workshop wing 0 = folded .. 1 = open), upper_gone: 0..1 (ripped away,
//       tumbling off), lower: 1 (bottom wing 0 = folded/stuck .. 1 = open), strap: 0|1 (red-ringed strap pinning the
//       folded bottom wing), strap_cut: 0..1, parasol: 0..1 (pole pushes out, canopy unfolds over the top),
//       csm: true, lights: 1 (window glow 0..1), glow: 0..1 (re-entry: red/gold flame tongues trail behind, hull
//       hatched), trail: 180 (deg, direction the flames stream to), breakup: 0..1 (parts fly apart, tumbling),
//       heat: 0..1 (gold heat-wave squiggles over the hull)}
//   swift(parent, seed) -> {update(t, o)}  small space telescope (tube, sun shade, two square panels). o: {x, y, s, rot, glow}
//   shuttle(parent, seed) -> {update(t, o)} space shuttle orbiter, side view, nose right. o: {x, y, s, rot}
//   thermo(parent, seed) -> {update(t, x, y, h, level 0..1, text, hot 0..1)} big hand-drawn thermometer + reading
//   astro(parent, seed, {scale}) -> {update(t, pose, opts)} spacesuit figure: Kaşif rig without hat + helmet bubble +
//     backpack, no ground shadow (opts as KASIF rig: x, y, face, dir, emotion, since; rot: deg tilt while floating) -> rig result
//   chunk(parent, seed) -> {update(t, x, y, s, rot, smoke 0..1)} a charred space-station fragment with smoke wisps
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const R = (a) => a * Math.PI / 180;
  const rotP = ([x, y], deg) => { const a = R(deg), c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const ell = (cx, cy, rx, ry, n = 14) => { const o = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };

  // a "part": fill + ring paths inside its own group (own transform for break-up)
  function part(parent) { const g = el(parent, 'g'); return { g, list: [] }; }
  function mkPen(parent) {
    const g = el(parent, 'g');          // own sub-group, created now: later siblings (text) stay on top
    const pool = []; let i = 0;
    return {
      begin() { i = 0; },
      fill(d, color, op) { let e = pool[i]; if (!e) { e = inkEl(g, color); pool.push(e); } i++; e.setAttribute('fill', color); if (op != null) e.setAttribute('fill-opacity', op); else e.removeAttribute('fill-opacity'); e.setAttribute('d', d); e.style.display = ''; },
      end() { for (let k = i; k < pool.length; k++) pool[k].style.display = 'none'; },
    };
  }
  // filled shape with an ink ring
  function shape(pen, pts, fill, sd, t, o = {}) {
    const sm = o.smooth ?? false;
    if (fill) pen.fill(inkLoop(pts, { seed: sd, t, amp: o.amp ?? 1, smooth: sm }), fill, o.op);
    pen.fill(inkPath(pts, { w: o.w ?? 5, seed: sd + 1, t, closed: true, amp: o.amp ?? 1, smooth: sm }), o.ink || INK.ink);
  }
  function line(pen, pts, sd, t, w = 4, color, o = {}) { pen.fill(inkPath(pts, { w, seed: sd, t, amp: o.amp ?? 0.9, smooth: o.smooth ?? false, taper: o.taper ?? 0.3 }), color || INK.ink); }

  // ------------------------------------------------------------------ solar panel (rectangle with a grid)
  function panel(pen, x0, y0, x1, y1, sd, t, cols = 4, rows = 2, fill) {
    shape(pen, rect(x0, y0, x1, y1), fill || INK.blue, sd, t, { op: 0.45, w: 4.5 });
    for (let c = 1; c < cols; c++) { const x = lerp(x0, x1, c / cols); line(pen, [[x, y0], [x, y1]], sd + 10 + c, t, 2.6, INK.inkSoft); }
    for (let r = 1; r < rows; r++) { const y = lerp(y0, y1, r / rows); line(pen, [[x0, y], [x1, y]], sd + 20 + r, t, 2.6, INK.inkSoft); }
  }

  // ------------------------------------------------------------------ Skylab
  function station(parent, sd) {
    const root = el(parent, 'g');
    const fl = part(root), atm = part(root), wingU = part(root), ows = part(root), wingL = part(root), mda = part(root), csm = part(root), top = part(root);
    const pens = {}; for (const [k, p] of Object.entries({ fl, ows, wingU, wingL, mda, atm, csm, top })) pens[k] = mkPen(p.g);
    // break-up vectors per part (fixed): dx, dy, spin
    const BRK = { ows: [-260, 120, -40], wingU: [-120, -320, 120], wingL: [-60, 300, -90], mda: [140, -40, 70], atm: [220, -260, -150], csm: [420, 60, 60], top: [0, -200, 40] };
    return {
      node: root,
      update(t, o = {}) {
        const s = o.s ?? 1, X = o.x ?? 0, Y = o.y ?? 0, rot = o.rot ?? 0;
        root.setAttribute('transform', `translate(${f1(X)} ${f1(Y)}) rotate(${f1(rot)}) scale(${s.toFixed(4)})`);
        Object.values(pens).forEach(p => p.begin());
        const br = clamp01(o.breakup ?? 0), glow = clamp01(o.glow ?? 0);
        const setT = (pt, key, cx, cy) => {
          const v = BRK[key], e = br * br;
          pt.g.setAttribute('transform', br > 0 ? `translate(${f1(v[0] * e)} ${f1(v[1] * e)}) rotate(${f1(v[2] * e)} ${cx} ${cy})` : '');
        };
        const hull = glow > 0 ? mix(INK.paperLight, INK.gold, glow * 0.55) : INK.paperLight;
        const S = k => sd * 100 + k;
        // ---- flames (behind everything)
        const P0 = pens.fl;
        if (glow > 0.01) {
          const tr = o.trail ?? 180;
          for (let k = 0; k < 7; k++) {
            const off = (k - 3) * 42, wob = Math.sin(t * 9 + k * 1.7) * 0.15 + 1, L = (360 + (k % 3) * 120) * glow * wob;
            const base = rotP([0, off], tr - 180).map((v, i) => v + (i === 0 ? -60 : 0));
            const tip = [base[0] + Math.cos(R(tr)) * L, base[1] + Math.sin(R(tr)) * L + Math.sin(t * 6 + k) * 20];
            const n = rotP([0, 70], tr);
            const pts = [[base[0] + n[0], base[1] + n[1]], [lerp(base[0], tip[0], 0.5) + n[0] * 0.6, lerp(base[1], tip[1], 0.5) + n[1] * 0.6], tip, [lerp(base[0], tip[0], 0.5) - n[0] * 0.6, lerp(base[1], tip[1], 0.5) - n[1] * 0.6], [base[0] - n[0], base[1] - n[1]]];
            P0.fill(inkLoop(pts, { seed: S(1 + k), t, amp: 3 }), k % 2 ? INK.gold : INK.red, 0.85);
            P0.fill(inkPath(pts, { w: 3, seed: S(10 + k), t, closed: true, amp: 3 }), INK.ink);
          }
          // glowing nose cap
          const nose = rotP([-1, 0], tr - 180);
          P0.fill(inkLoop(ell(nose[0] * 420 * 0 - 380, 0, 140, 150, 12), { seed: S(19), t, amp: 3 }), INK.gold, 0.5 * glow);
        }
        // ---- upper wing (behind the hull)
        const U = pens.wingU, up = clamp01(o.upper ?? 1), ug = clamp01(o.upper_gone ?? 0);
        if (ug < 1) {
          const e = ug * ug;
          wingU.g.setAttribute('transform', ug > 0 ? `translate(${f1(-160 * e)} ${f1(-520 * e)}) rotate(${f1(-70 * e)} -120 -105)` : '');
          const ext = 40 + 260 * up;
          line(U, [[-120, -100], [-120, -105 - ext]], S(30), t, 9);
          panel(U, -290, -105 - ext, -130, -110, S(31), t, 3, Math.max(1, Math.round(4 * up)));
          panel(U, -110, -105 - ext, 50, -110, S(41), t, 3, Math.max(1, Math.round(4 * up)));
        } else wingU.g.setAttribute('transform', 'translate(0 -4000)');
        if (br > 0) setT(wingU, 'wingU', -120, -105);
        // ---- workshop (OWS)
        const O = pens.ows;
        shape(O, [[-330, -80], [-388, -60], [-388, 60], [-330, 80]], INK.paperDark, S(50), t);                   // aft skirt
        line(O, [[-388, -40], [-410, -30], [-410, 30], [-388, 40]], S(52), t, 5);
        shape(O, [[-330, -105], [100, -105], [100, 105], [-330, 105]], hull, S(54), t, { w: 6 });
        for (const x of [-250, -140, -30, 60]) line(O, [[x, -103], [x + 3, 103]], S(60 + x), t, 3, INK.inkSoft);
        const lit = clamp01(o.lights ?? 1);
        for (const [k, x] of [[0, -200], [1, -90], [2, 20]]) {
          O.fill(inkDot(x, -10, 15, 15, S(70 + k), t), lit > 0.05 ? mix(INK.inkSoft, INK.gold, lit) : INK.inkSoft);
          O.fill(inkPath(ell(x, -10, 19, 19, 10), { w: 3.5, seed: S(75 + k), t, closed: true, amp: 0.6 }), INK.ink);
        }
        if (glow > 0.2) for (let k = 0; k < 6; k++) line(O, [[-300 + k * 70, 100], [-260 + k * 70, -100]], S(80 + k), t, 3, INK.red);
        // shield (gold wrap) + tearing panel
        const sh = clamp01(o.shield ?? 1), tear = clamp01(o.shield_tear ?? 0);
        if (sh > 0.02) {
          const x1 = tear > 0 ? lerp(100, -120, Math.min(1, tear * 1.5)) : 100;
          shape(O, [[-330, -114], [x1, -114], [x1, 114], [-330, 114]], INK.gold, S(90), t, { op: 0.35 * sh, w: 4, ink: INK.inkSoft });
          for (let k = 0; k < 9; k++) { const x = -315 + k * 48; if (x < x1 - 10) line(O, [[x, -110], [x + 26, 110]], S(100 + k), t, 2.4, INK.gold); }
          if (tear > 0) {   // the flap peels off and flies away up-right
            const e = tear * tear, cx = 60 + 380 * e, cy = -110 - 420 * e, a = -40 - 300 * e;
            const fl2 = [[-90, -12], [90, -18], [96, 12], [-84, 20]].map(p => { const q = rotP(p, a); return [q[0] + cx, q[1] + cy]; });
            shape(O, fl2, INK.gold, S(120), t, { op: 0.6, w: 4 });
            for (let k = 0; k < 3; k++) line(O, [[cx - 40 + k * 30, cy + 70 + k * 10], [cx - 80 + k * 30, cy + 130 + k * 14]], S(124 + k), t, 3, INK.inkSoft);
          }
        }
        // heat squiggles
        const ht = clamp01(o.heat ?? 0);
        if (ht > 0.02) for (let k = 0; k < 4; k++) {
          const x = -280 + k * 110, ph = (t * 0.8 + k * 0.27) % 1, y0 = -130 - ph * 140;
          const pts = []; for (let j = 0; j < 6; j++) pts.push([x + Math.sin(j * 1.6 + t * 4) * 12, y0 - j * 18]);
          line(O, pts, S(130 + k), t, 5 * ht, INK.red, { smooth: true });
        }
        if (br > 0) setT(ows, 'ows', -110, 0);
        // ---- lower wing (in front of the hull)
        const L2 = pens.wingL, lo = clamp01(o.lower ?? 1);
        {
          const ext = 30 + 270 * lo;
          if (lo < 0.12) {   // folded flat against the hull
            shape(L2, [[-300, 110], [40, 110], [40, 134], [-300, 134]], INK.blue, S(140), t, { op: 0.45, w: 4.5 });
            for (let k = 1; k < 6; k++) line(L2, [[-300 + k * 57, 112], [-300 + k * 57, 132]], S(142 + k), t, 2.4, INK.inkSoft);
          } else {
            line(L2, [[-120, 105], [-120, 105 + ext]], S(150), t, 9);
            panel(L2, -290, 110, -130, 105 + ext, S(151), t, 3, Math.max(1, Math.round(4 * lo)));
            panel(L2, -110, 110, 50, 105 + ext, S(161), t, 3, Math.max(1, Math.round(4 * lo)));
          }
          const st = o.strap ? 1 : 0, cut = clamp01(o.strap_cut ?? 0);
          if (st && lo < 0.12) {
            if (cut < 0.5) line(L2, [[-150, 98], [-140, 142]], S(170), t, 7, INK.red);
            else { line(L2, [[-152, 96], [-150, 116 - 30 * cut]], S(171), t, 6, INK.red); line(L2, [[-140, 144], [-120, 160 + 20 * cut]], S(172), t, 6, INK.red); }
          }
        }
        if (br > 0) setT(wingL, 'wingL', -120, 105);
        // ---- airlock + docking adapter
        const M = pens.mda;
        shape(M, [[100, -60], [330, -60], [330, 60], [100, 60]], hull, S(180), t);
        line(M, [[200, -58], [200, 58]], S(182), t, 3, INK.inkSoft);
        shape(M, [[330, -26], [352, -26], [352, 26], [330, 26]], INK.paperDark, S(184), t);
        if (br > 0) setT(mda, 'mda', 215, 0);
        // ---- telescope mount + windmill panels
        const A = pens.atm;
        line(A, [[180, -60], [190, -160]], S(190), t, 5); line(A, [[250, -60], [240, -160]], S(191), t, 5);
        const ax = 215, ay = -215;
        for (let k = 0; k < 4; k++) {
          const a = 45 + k * 90, c = Math.cos(R(a)), sn = Math.sin(R(a)), L = 250, w = 38;
          const nx = -sn * w, ny = c * w, b0 = [ax + c * 70, ay + sn * 70], b1 = [ax + c * L, ay + sn * L];
          line(A, [[ax, ay], b0], S(200 + k), t, 5);
          const pts = [[b0[0] + nx, b0[1] + ny], [b1[0] + nx, b1[1] + ny], [b1[0] - nx, b1[1] - ny], [b0[0] - nx, b0[1] - ny]];
          shape(A, pts, INK.blue, S(210 + k), t, { op: 0.45, w: 4 });
          for (let j = 1; j < 4; j++) { const m0 = lerp(70, L, j / 4); line(A, [[ax + c * m0 + nx, ay + sn * m0 + ny], [ax + c * m0 - nx, ay + sn * m0 - ny]], S(220 + k * 4 + j), t, 2.4, INK.inkSoft); }
        }
        shape(A, [[ax - 60, ay - 40], [ax - 40, ay - 60], [ax + 40, ay - 60], [ax + 60, ay - 40], [ax + 60, ay + 40], [ax + 40, ay + 60], [ax - 40, ay + 60], [ax - 60, ay + 40]], INK.paperDark, S(240), t);
        A.fill(inkPath(ell(ax, ay, 26, 26, 10), { w: 4, seed: S(242), t, closed: true }), INK.ink);
        if (br > 0) setT(atm, 'atm', ax, ay);
        // ---- docked Apollo ship
        const C2 = pens.csm;
        if (o.csm !== false) {
          shape(C2, [[352, -10], [420, -64], [420, 64], [352, 10]], hull, S(250), t);                                 // command module cone
          shape(C2, [[420, -56], [540, -56], [540, 56], [420, 56]], INK.paperDark, S(254), t);                          // service module
          shape(C2, [[540, -30], [585, -50], [585, 50], [540, 30]], INK.inkSoft, S(258), t, { op: 0.6 });              // engine bell
          line(C2, [[470, -54], [470, 54]], S(262), t, 3, INK.inkSoft);
        }
        if (br > 0) setT(csm, 'csm', 470, 0);
        // ---- parasol (in front)
        const T2 = pens.top, pa = clamp01(o.parasol ?? 0);
        if (pa > 0.01) {
          const pole = clamp01(pa / 0.4), op = clamp01((pa - 0.35) / 0.65), cx = -110, py = -105 - 70 * pole;
          line(T2, [[cx, -105], [cx, py]], S(270), t, 6);
          const half = lerp(20, 200, EASE(op)), sag = lerp(4, 22, op);
          const pts = [[cx - half, py + 6], [cx - half * 0.5, py - sag * 0.4], [cx, py - sag], [cx + half * 0.5, py - sag * 0.4], [cx + half, py + 6], [cx + half * 0.5, py + 14], [cx, py + 10], [cx - half * 0.5, py + 14]];
          T2.fill(inkLoop(pts, { seed: S(272), t, amp: 1.2 }), INK.red, 0.8);
          T2.fill(inkPath(pts, { w: 5, seed: S(273), t, closed: true, amp: 1.2 }), INK.ink);
          for (const k of [-1, -0.5, 0.5, 1]) line(T2, [[cx, py - sag * 0.5], [cx + half * k, py + 6]], S(276 + k * 4), t, 2.6, INK.ink);
        }
        if (br > 0) setT(top, 'top', -110, -180);
        Object.values(pens).forEach(p => p.end());
        const cr = Math.cos(R(rot)), sr = Math.sin(R(rot));
        return { pt: (x, y) => [X + (x * cr - y * sr) * s, Y + (x * sr + y * cr) * s] };
      },
    };
  }

  // ------------------------------------------------------------------ Swift telescope
  function swift(parent, sd) {
    const g = el(parent, 'g'), pen = mkPen(g);
    return {
      update(t, o = {}) {
        const s = o.s ?? 1;
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(o.rot ?? 0)}) scale(${s.toFixed(4)})`);
        pen.begin();
        const gl = clamp01(o.glow ?? 0);
        if (gl > 0.01) for (let k = 0; k < 4; k++) {
          const L = (200 + k * 60) * gl, off = (k - 1.5) * 30;
          const pts = [[-60, off - 22], [-60 - L * 0.5, off - 14 + Math.sin(t * 8 + k) * 10], [-60 - L, off], [-60 - L * 0.5, off + 14], [-60, off + 22]];
          pen.fill(inkLoop(pts, { seed: sd + k, t, amp: 2.5 }), k % 2 ? INK.gold : INK.red, 0.85);
        }
        panel(pen, -40, -250, 60, -80, sd + 10, t, 2, 3);
        panel(pen, -40, 80, 60, 250, sd + 30, t, 2, 3);
        line(pen, [[10, -80], [10, -60]], sd + 50, t, 6); line(pen, [[10, 60], [10, 80]], sd + 51, t, 6);
        shape(pen, [[-110, -60], [130, -60], [130, 60], [-110, 60]], INK.paperLight, sd + 52, t, { w: 5.5 });
        shape(pen, [[130, -72], [170, -80], [170, 80], [130, 72]], INK.paperDark, sd + 54, t);
        line(pen, [[-30, -58], [-30, 58]], sd + 56, t, 3, INK.inkSoft); line(pen, [[50, -58], [50, 58]], sd + 57, t, 3, INK.inkSoft);
        pen.end();
      },
    };
  }

  // ------------------------------------------------------------------ Space Shuttle orbiter (side view, nose right)
  function shuttle(parent, sd) {
    const g = el(parent, 'g'), pen = mkPen(g);
    return {
      update(t, o = {}) {
        const s = o.s ?? 1;
        g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(o.rot ?? 0)}) scale(${s.toFixed(4)})`);
        pen.begin();
        const body = [[-300, -40], [180, -40], [250, -30], [300, 0], [270, 30], [200, 46], [-300, 46]];
        shape(pen, [[-300, -40], [-250, -190], [-200, -190], [-160, -40]], INK.paperLight, sd + 1, t);        // tail fin
        shape(pen, body, INK.paperLight, sd + 3, t, { w: 6, smooth: true });
        shape(pen, [[-260, 40], [60, 40], [-120, 110], [-270, 110]], INK.paperDark, sd + 5, t);                   // wing
        pen.fill(inkLoop([[200, 44], [270, 30], [300, 0], [290, 22], [240, 44]], { seed: sd + 7, t }), INK.ink);
        pen.fill(inkLoop([[205, -28], [245, -24], [255, -10], [210, -10]], { seed: sd + 8, t }), INK.ink);       // cockpit window
        line(pen, [[-160, -36], [150, -36]], sd + 9, t, 3, INK.inkSoft);
        for (let k = 0; k < 3; k++) shape(pen, [[-300, -30 + k * 26], [-340, -36 + k * 26], [-340, -8 + k * 26], [-300, -14 + k * 26]], INK.inkSoft, sd + 10 + k * 2, t, { op: 0.7, w: 3 });
        pen.end();
      },
    };
  }

  // ------------------------------------------------------------------ thermometer
  function thermo(parent, sd) {
    const g = el(parent, 'g'), pen = mkPen(g);
    const txt = el(g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 92, 'text-anchor': 'middle', fill: INK.red });
    return {
      update(t, x, y, h, level, text, hot = 1) {
        pen.begin();
        const w = 46, bulb = 62, top = y - h, b = boil(sd + 3, t, 1.2);
        shape(pen, [[x - w / 2, top], [x + w / 2, top], [x + w / 2, y - bulb * 0.6], [x - w / 2, y - bulb * 0.6]], INK.paperLight, sd + 1, t);
        const col = mix(INK.blue, INK.red, clamp01(hot));
        pen.fill(inkDot(x, y, bulb, bulb, sd + 4, t), col);
        pen.fill(inkPath(ell(x, y, bulb, bulb, 12), { w: 6, seed: sd + 5, t, closed: true }), INK.ink);
        const lv = y - bulb * 0.5 - (h - bulb) * clamp01(level);
        pen.fill(inkLoop([[x - 12, y - bulb * 0.4], [x + 12, y - bulb * 0.4], [x + 12, lv], [x - 12, lv]], { seed: sd + 6, t, smooth: false, amp: 0.6 }), col);
        for (let k = 1; k < 6; k++) line(pen, [[x + w / 2, top + k * (h - bulb) / 6], [x + w / 2 + 22, top + k * (h - bulb) / 6]], sd + 10 + k, t, 3.5);
        pen.end();
        txt.textContent = text || '';
        txt.setAttribute('x', f1(x + b[0])); txt.setAttribute('y', f1(top - 30 + b[1]));
        txt.setAttribute('fill', col);
      },
    };
  }

  // ------------------------------------------------------------------ astronaut (spacesuit figure)
  function astro(parent, sd, cfg = {}) {
    const g = el(parent, 'g');
    const back = el(g, 'g'), bp = mkPen(back);
    const rigG = el(g, 'g'), rig = KASIF.create(rigG, { scale: cfg.scale ?? 1, hat: false, seed: sd });
    rigG.querySelectorAll('ellipse').forEach(e => { e.style.display = 'none'; });   // floating: no ground shadow
    const front = el(g, 'g'), fp = mkPen(front);
    return {
      update(t, pose, o = {}) {
        const r = rig.update(t, pose, o), sc = cfg.scale ?? 1, face = o.face ?? 1;
        g.setAttribute('transform', o.rot ? `rotate(${f1(o.rot)} ${f1(o.x)} ${f1(o.y - 260 * sc)})` : '');
        const hx = o.x + face * sc * r.head[0], hy = o.y + sc * r.head[1];
        bp.begin(); fp.begin();
        // backpack behind the shoulders
        const bx = o.x - face * sc * 70, by = o.y - sc * 330;
        shape(bp, [[bx - 40 * sc, by - 70 * sc], [bx + 40 * sc, by - 70 * sc], [bx + 40 * sc, by + 80 * sc], [bx - 40 * sc, by + 80 * sc]], INK.paperDark, sd + 1, t, { w: 5 });
        // helmet bubble around the head
        const hr = 98 * sc;
        fp.fill(inkPath(ell(hx, hy - 6 * sc, hr, hr * 1.02, 14), { w: 6, seed: sd + 3, t, closed: true }), INK.ink);
        fp.fill(inkPath([[hx + face * hr * 0.2, hy - hr * 0.75], [hx + face * hr * 0.62, hy - hr * 0.5], [hx + face * hr * 0.8, hy - hr * 0.1]], { w: 5, seed: sd + 5, t, smooth: true, amp: 0.6 }), INK.paperLight);
        bp.end(); fp.end();
        return r;
      },
    };
  }

  // ------------------------------------------------------------------ charred fragment + smoke
  function chunk(parent, sd) {
    const g = el(parent, 'g'), pen = mkPen(g);
    const r0 = rng(sd * 7 + 1), pts = [];
    for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = lerp(0.6, 1.1, r0()); pts.push([Math.cos(a) * 60 * rr, Math.sin(a) * 42 * rr]); }
    return {
      update(t, x, y, s = 1, rot = 0, smoke = 1) {
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${s.toFixed(4)})`);
        pen.begin();
        shape(pen, pts, INK.inkSoft, sd + 1, t, { smooth: false, w: 5 });
        line(pen, [[-30, -6], [10, 10], [36, -4]], sd + 3, t, 4, INK.ink);
        pen.fill(inkDot(-14, -12, 10, 6, sd + 4, t), INK.red, 0.7);
        if (smoke > 0.02) for (let k = 0; k < 3; k++) {
          const ph = (t * 0.6 + k / 3) % 1, x0 = -20 + k * 22, y0 = -50 - ph * 160;
          const p2 = []; for (let j = 0; j < 5; j++) p2.push([x0 + Math.sin(j * 1.3 + t * 3 + k) * 12, y0 - j * 22]);
          line(pen, p2, sd + 10 + k, t, 5 * smoke * (1 - ph), INK.inkSoft, { smooth: true });
        }
        pen.end();
      },
    };
  }

  window.SKY = { station, swift, shuttle, thermo, astro, chunk, mkPen, shape, line, panel, ell, rotP };
})();
