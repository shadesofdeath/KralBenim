// mi__lib: shared drawing kit for the mi_* shots (Stickstory long "Mongol invasions of Japan", 2026-11-09). Not a shot.
// window.MI = {junk(parent, sd, o) -> {update(t, x, y, s, face, st)}, samurai(parent, sd, s) -> {update(t, pose, o)},
//   soldiers(parent, sd, spec) -> {update(t, lt, cues)}, waves(parent, W, H, y0, sd, o) -> {top(x, t), update(t)},
//   rain(parent, W, H, sd, n) -> {update(t, k)}, bolt(parent, sd) -> {update(t, lt, at, x)}, figs(list...) }
// Junk (Yuan / Song war junk, side view, bow to +x, waterline y = 0, ~420 units long): high stern castle, two masts
// with battened lug sails, red pennants. st: {roll (deg), mast: 0..1 (main mast falls), split: 0..1 (hull breaks in
// two), sink: 0..1, sail: 1 (0 = furled), lean: 0}. Samurai = Kaşif-style rig (no hat) with a helmet and gold horns.
// Palette tokens only (INK), boils at 8 Hz via _ink.js, pure function of (seed, lt); no Math.random.
'use strict';

(() => {
  const T = () => window.TZ;
  const f1 = v => Math.round(v * 10) / 10;
  const tf = (x, y, s, face, rot) => `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot || 0)}) scale(${(s * face).toFixed(3)} ${s.toFixed(3)})`;

  // ---------------------------------------------------------------- war junk
  function junk(parent, sd, o = {}) {
    const g = el(parent, 'g'), simple = !!o.simple;
    const sh = T().Shapes();
    const hullFill = o.bold ? mix(INK.ink, INK.stain, 0.25) : o.dark ? mix(INK.ink, INK.inkSoft, 0.4) : mix(INK.paperDark, INK.inkSoft, 0.35);
    const sailFill = o.dark ? mix(INK.inkSoft, INK.paperDark, 0.4) : INK.paperLight;
    const st = { mast: 0, split: 0, sail: 1 };
    // halves of the hull (stern half x < 0, bow half x > 0) live in their own groups so they can break apart
    const back = el(g, 'g'), front = el(g, 'g');
    const sternHull = [[-215, -95], [-200, -40], [-170, 0], [-150, 12], [6, 14], [6, -50], [-150, -52], [-190, -88]];
    const bowHull = [[-6, 14], [150, 12], [190, -20], [222, -62], [180, -58], [130, -50], [-6, -50]];
    const w = simple ? 7 : o.bold ? 9 : 5;
    sh.add(back, sternHull, { fill: hullFill, stroke: INK.ink, w });
    sh.add(front, bowHull, { fill: hullFill, stroke: INK.ink, w });
    if (!simple) {
      sh.add(back, [[-205, -95], [-205, -140], [-120, -140], [-120, -60]], { fill: hullFill, stroke: INK.ink, w: 4.5, closed: false });   // stern castle
      sh.add(back, [[-190, -128], [-136, -128]], { stroke: INK.ink, w: 3.5, closed: false });
      for (let i = 0; i < 4; i++) sh.add(i < 2 ? back : front, [[-150 + i * 95, -28], [-120 + i * 95, -28]], { stroke: INK.inkSoft, w: 4, closed: false });   // planks
      sh.add(front, [[-6, -50], [160, -52]], { stroke: INK.ink, w: 3.5, closed: false });
      sh.add(back, [[-150, -52], [6, -50]], { stroke: INK.ink, w: 3.5, closed: false });
    }
    // masts + battened sails: the main mast sits in its own group so it can fall
    const mainG = el(back, 'g'), foreG = el(front, 'g');
    const mast = (gg, mx, h, sw) => {
      sh.add(gg, [[mx, -50], [mx, -50 - h]], { stroke: INK.ink, w: simple ? 8 : 6, closed: false });
      const top = -50 - h + 14, bot = -80;
      sh.add(gg, lt => { const k = st.sail; if (k < 0.05) return null; const b = bot - (1 - k) * (bot - top) * 0.9;
        return [[mx - sw * 0.7, top + 10], [mx + sw * 0.35, top], [mx + sw * 0.5, b], [mx - sw * 0.85, b + 6]]; },
        { fill: sailFill, stroke: INK.ink, w: simple ? 6 : o.bold ? 8 : 4.5 });
      if (!simple) for (let i = 1; i < 6; i++) {
        sh.add(gg, lt => { const k = st.sail; if (k < 0.05) return null; const b = bot - (1 - k) * (bot - top) * 0.9, y = lerp(top + 6, b, i / 6);
          return [[mx - sw * (0.7 + 0.15 * i / 6) - 6, y + 2], [mx + sw * (0.35 + 0.15 * i / 6) + 6, y]]; }, { stroke: o.bold ? INK.ink : INK.inkSoft, w: o.bold ? 5 : 3, closed: false });
      }
      sh.add(gg, lt => { const fl = Math.sin(lt * 6 + mx) * 8; return [[mx, -50 - h], [mx + 40, -50 - h + 6 + fl * 0.3], [mx + 70, -50 - h + 12 + fl], [mx + 36, -50 - h + 20], [mx, -50 - h + 22]]; },
        { fill: INK.red, stroke: INK.ink, w: simple ? 4 : 3, smooth: true });
    };
    if (o.bold) sh.add(back, [[-40, -50], [-40, -340]], { stroke: INK.ink, w: 12, closed: false });
    mast(mainG, -40, 290, 170);
    mast(foreG, 110, 210, 120);
    const crack = inkEl(g, INK.red);
    return {
      node: g,
      update(t, lt, x, y, s, face, S = {}) {
        st.sail = S.sail ?? 1;
        const sink = clamp01(S.sink || 0), sp = clamp01(S.split || 0), mk = clamp01(S.mast || 0);
        const roll = (S.roll ?? 0) + (S.lean ?? 0) * 1 + sink * 24 * (S.sinkDir || 1);
        g.setAttribute('transform', tf(x, y + sink * 260 * s, s, face, roll * face));
        back.setAttribute('transform', `translate(${f1(-sp * 50)} ${f1(sp * 30)}) rotate(${f1(-sp * 16)} 0 10)`);
        front.setAttribute('transform', `translate(${f1(sp * 50)} ${f1(sp * 34)}) rotate(${f1(sp * 18)} 0 10)`);
        mainG.setAttribute('transform', `rotate(${f1(mk * 72)} -40 -50)`);
        sh.update(t, lt);
        crack.setAttribute('d', sp > 0.02 && sp < 0.6 ? inkPath([[0, -60], [12, -30], [-8, -6], [6, 18]], { w: 7, seed: sd + 5, t }) : '');
      },
    };
  }

  // ---------------------------------------------------------------- samurai: rig + helmet + gold horns (kuwagata)
  function samurai(parent, sd, s, o = {}) {
    const g = el(parent, 'g');
    const rig = KASIF.create(g, { scale: s, hat: false, accessory: null, beard: o.beard || null, seed: sd });
    const dome = inkEl(g, mix(INK.ink, INK.inkSoft, 0.45)), domeR = inkEl(g, INK.ink), horns = inkEl(g, INK.gold), hornsR = inkEl(g, INK.ink);
    const bow = o.bow ? inkEl(g, INK.ink) : null;
    return {
      update(t, pose, op) {
        rig.update(t, pose, op);
        const f = op.face || 1, sc = s, cx = op.x + f * 4 * sc, cy = op.y - (pose === 'sit' ? 312 : 392) * sc + (pose === 'shock' ? -8 * sc : 0);
        const P = q => [cx + q[0] * sc, cy + q[1] * sc];
        const D = [[-92, 26], [-84, -20], [-74, -56], [-44, -88], [0, -98], [44, -88], [74, -56], [84, -20], [92, 26], [70, 20], [72, -18], [0, -26], [-72, -18], [-70, 20]].map(P);
        dome.setAttribute('d', inkLoop(D, { seed: sd + 5, t, amp: 0.7 }));
        domeR.setAttribute('d', inkPath(D, { w: 4, seed: sd + 7, t, closed: true, amp: 0.7 }));
        const L = [[-6, -70], [-40, -110], [-62, -170], [-30, -116], [2, -84]].map(P), R = L.map(p => [2 * cx - p[0], p[1]]);
        horns.setAttribute('d', inkLoop(L, { seed: sd + 1, t, amp: 0.6 }) + ' ' + inkLoop(R, { seed: sd + 2, t, amp: 0.6 }));
        hornsR.setAttribute('d', inkPath(L, { w: 3, seed: sd + 3, t, closed: true, amp: 0.6 }) + ' ' + inkPath(R, { w: 3, seed: sd + 4, t, closed: true, amp: 0.6 }));
        if (bow) { const bx = op.x + f * 70 * sc, by = op.y - 260 * sc;
          bow.setAttribute('d', inkPath([[bx, by - 230 * sc], [bx + f * 40 * sc, by - 60 * sc], [bx + f * 34 * sc, by + 60 * sc], [bx, by + 170 * sc]], { w: 5, seed: sd + 6, t })); }
      },
    };
  }

  // ---------------------------------------------------------------- invader blocks: rows of small soldiers
  // spec: {x, y (front row feet, px), cols: 8, rows: 3, gap: 46, s: 1, face: -1, at (appear), march: {to, at, dur}, drum: true}
  function soldiers(parent, sd, spec) {
    const g = el(parent, 'g');
    const body = inkEl(g, INK.ink), heads = inkEl(g, INK.paperLight), shieldR = inkEl(g, INK.ink), helm = inkEl(g, mix(INK.inkSoft, INK.ink, 0.3)), tips = inkEl(g, INK.red), shields = inkEl(g, mix(INK.paperDark, INK.stain, 0.4)), shieldO = inkEl(g, INK.ink);
    const drum = spec.drum ? { f: inkEl(g, INK.red), r: inkEl(g, INK.ink), w: inkEl(g, INK.gold) } : null;
    return {
      update(t, lt, cues) {
        const A = T().atOr, s = spec.s || 1, gap = (spec.gap || 50) * s, face = spec.face || -1;
        const ap = A(cues, spec.at, 0), pin = spring(lt, ap, 0.6);
        let x0 = spec.x;
        if (spec.march) { const ma = A(cues, spec.march.at, 0); x0 = lerp(spec.x, spec.march.to, progIO(lt, ma, spec.march.dur || 2)); }
        const beat = Math.pow(Math.abs(Math.sin(lt * Math.PI * 1.6)), 6);
        const B = [], Hm = [], Tp = [], Sh = [], Hd = [], O = [], SO = [];
        if (lt >= ap) for (let r = (spec.rows || 3) - 1; r >= 0; r--) for (let c = 0; c < (spec.cols || 8); c++) {
          const k = 1 - r * 0.12, x = x0 + (c * gap + (r % 2) * gap * 0.5) * -face * 1 + r * 14 * face, y = spec.y - r * 34 * s - beat * 6 * s;
          const z = s * k * pin, hy = y - 112 * z;
          B.push(inkPath([[x, y], [x, y - 90 * z]], { w: 6 * z, seed: sd + r * 31 + c, t, amp: 0.8 }));
          B.push(inkPath([[x + face * 26 * z, y - 10 * z], [x + face * 30 * z, y - 190 * z]], { w: 4 * z, seed: sd + r * 31 + c + 500, t, amp: 0.8 }));
          Hd.push(inkLoop(inkEllipsePts(x, hy, 18 * z, 18 * z, sd + c, 10), { seed: sd + r * 37 + c, t, amp: 0.6 }));
          O.push(inkPath(inkEllipsePts(x, hy, 18 * z, 18 * z, sd + c, 10), { w: 4 * z, seed: sd + r * 41 + c, t, closed: true, amp: 0.6 }));
          Hm.push(inkLoop([[x - 22 * z, hy - 4 * z], [x, hy - 46 * z], [x + 22 * z, hy - 4 * z]], { seed: sd + c * 3 + r, t, amp: 0.6 }));
          Tp.push(inkDot(x, hy - 46 * z, 6 * z, 6 * z, sd + c + r * 9, t));
          const sx = x + face * 14 * z, sy = y - 58 * z;
          Sh.push(inkLoop(inkEllipsePts(sx, sy, 26 * z, 30 * z, sd + c * 7 + r, 10), { seed: sd + c * 7 + r, t, amp: 0.6 }));
          SO.push(inkPath(inkEllipsePts(sx, sy, 26 * z, 30 * z, sd + c * 7 + r, 10), { w: 4 * z, seed: sd + c * 5 + r, t, closed: true, amp: 0.6 }));
        }
        body.setAttribute('d', B.join(' ')); helm.setAttribute('d', Hm.join(' ')); tips.setAttribute('d', Tp.join(' '));
        shields.setAttribute('d', Sh.join(' ')); heads.setAttribute('d', Hd.join(' ')); shieldR.setAttribute('d', O.join(' ')); shieldO.setAttribute('d', SO.join(' '));
        if (drum) {
          const dx = x0 - face * ((spec.cols || 8) * gap + 40 * s), dy = spec.y - 40 * s, rr = 56 * s * (1 + 0.08 * beat);
          drum.f.setAttribute('d', lt >= ap ? inkLoop(inkEllipsePts(dx, dy - 40 * s, rr, rr * 0.9, sd + 900, 12), { seed: sd + 900, t }) : '');
          drum.r.setAttribute('d', lt >= ap ? inkPath(inkEllipsePts(dx, dy - 40 * s, rr, rr * 0.9, sd + 900, 12), { w: 6, seed: sd + 901, t, closed: true }) + ' ' +
            inkPath([[dx - rr, dy + 40 * s], [dx - rr * 0.6, dy - 10 * s]], { w: 6, seed: sd + 902, t }) + ' ' + inkPath([[dx + rr, dy + 40 * s], [dx + rr * 0.6, dy - 10 * s]], { w: 6, seed: sd + 903, t }) : '');
          const ring = beat > 0.2 && lt >= ap ? inkPath(inkEllipsePts(dx, dy - 40 * s, rr * (1.3 + (1 - beat) * 0.6), rr * (1.2 + (1 - beat) * 0.6), sd + 904, 14), { w: 4, seed: sd + 905, t, closed: true }) : '';
          drum.w.setAttribute('d', ring);
        }
      },
    };
  }

  // ---------------------------------------------------------------- sea with waves (calm .. storm)
  function waves(parent, W, H, y0, sd, o = {}) {
    const amp = o.amp ?? 10, rows = o.rows ?? 4, storm = !!o.storm;
    const fill = inkEl(parent, o.dark ? mix(INK.paperDark, INK.inkSoft, 0.45) : INK.paperDark);
    const line = inkEl(parent, INK.inkSoft);
    const crestF = Array.from({ length: rows }, (_, i) => inkEl(parent, mix(INK.paperDark, INK.inkSoft, storm ? 0.25 + i * 0.08 : 0.08 + i * 0.05)));
    const crestL = Array.from({ length: rows }, () => inkEl(parent, INK.ink));
    const foam = inkEl(parent, INK.paperLight);
    const top = (x, t) => y0 + Math.sin(x * 0.010 + t * 1.4) * amp + Math.sin(x * 0.027 - t * 2.1) * amp * 0.45;
    return {
      top,
      rowY: i => y0 + (i + 1) / (rows + 0.6) * (H - y0),
      update(t) {
        const p = []; for (let x = -60; x <= W + 60; x += 40) p.push([x, top(x, t)]);
        fill.setAttribute('d', inkLoop(p.concat([[W + 60, H + 40], [-60, H + 40]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
        line.setAttribute('d', inkPath(p, { w: 5, seed: sd + 2, t, amp: 1.2 }));
        const F = [];
        for (let i = 0; i < rows; i++) {
          const yy = y0 + (i + 1) / (rows + 0.6) * (H - y0), k = (i + 1) / rows, A = amp * (storm ? 2.6 : 0.8) * (0.6 + k), L = storm ? 260 : 180;
          const pts = []; const sp = storm ? 80 : 60;
          for (let x = -L; x <= W + L; x += 30) {
            const ph = (x + t * (storm ? 160 : 40) * (i % 2 ? 1 : -0.7)) / L;
            const fr = ph - Math.floor(ph), crest = storm ? Math.pow(fr, 3) * 1.6 - (fr > 0.92 ? (fr - 0.92) * 18 : 0) : Math.sin(fr * Math.PI * 2) * 0.5;
            pts.push([x, yy - A * crest - Math.sin(x * 0.004 + i) * 6]);
          }
          crestF[i].setAttribute('d', inkLoop(pts.concat([[W + L, H + 40], [-L, H + 40]]), { seed: sd + 20 + i, t, amp: 1, smooth: false }));
          crestL[i].setAttribute('d', inkPath(pts, { w: 3 + k * 3, seed: sd + 30 + i, t, amp: 1.2 }));
          if (storm) for (let j = 0; j < pts.length; j += 9) F.push(inkDot(pts[j][0], pts[j][1] - 4, 16 * k, 7 * k, sd + i * 50 + j, t));
        }
        foam.setAttribute('d', F.join(' '));
      },
    };
  }

  // ---------------------------------------------------------------- rain + lightning
  function rain(parent, W, H, sd, n = 70) {
    const e = inkEl(parent, INK.inkSoft, { 'fill-opacity': 0.8 }), r = rng(sd), D = Array.from({ length: n }, () => [r(), r(), r()]);
    return { update(t, k = 1) {
      if (k <= 0) { e.setAttribute('d', ''); return; }
      e.setAttribute('d', D.slice(0, Math.round(n * k)).map((d, i) => { const y = ((d[1] + t * (1.4 + d[2])) % 1.1) * H - 60, x = ((d[0] * (W + 300) - t * 260) % (W + 300) + W + 300) % (W + 300) - 100;
        return inkPath([[x, y], [x - 34, y + 90]], { w: 3, seed: sd + i, t, amp: 0.5 }); }).join(' '));
    } };
  }
  function bolt(parent, sd) {
    const e = inkEl(parent, INK.paperLight), r = inkEl(parent, INK.ink);
    return { update(t, lt, ats, x, H) {
      const a = (ats || []).filter(v => v != null && lt >= v && lt < v + 0.35).pop();
      if (a == null) { e.setAttribute('d', ''); r.setAttribute('d', ''); return; }
      const pts = [[x, -20], [x - 40, H * 0.12], [x + 20, H * 0.17], [x - 30, H * 0.3], [x + 10, H * 0.34], [x - 50, H * 0.46]];
      e.setAttribute('d', inkPath(pts, { w: 22, seed: sd, t, amp: 3, smooth: false }));
      r.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 1, t, amp: 3, smooth: false }));
    } };
  }

  window.MI = { f1, junk, samurai, soldiers, waves, rain, bolt };
})();
