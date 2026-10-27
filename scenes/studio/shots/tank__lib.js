// tank__lib: shared ink drawings for the tank_* shots (the first tank, 1915-1918). Not a shot type itself.
// window.TKL = {
//   tank(group, {variant: "male"|"female"|"willie"|"mother", roof: false, tail: true, label: "D1", seed})
//     -> {update(t, st) -> {muzzle, exhaust, nose, rear, top}}   (world px)
//     st: {x, y (world px of the middle of the track's ground run), a (deg, + = nose up), face: 1 (right) | -1,
//          s (px per cm: 1 -> the 8 m hull is 800 px long), ph (track travel in cm: links + tail wheels roll),
//          fire (0..1 muzzle flash), dead (0..1: track slack, hull scorched), shake (px)}
//   Mark I geometry in cm (origin = middle of the ground run, y up is negative): rhomboid track frame, side plate
//   with rivets and hatching, sponson (6-pounder gun on the male, machine guns on the female), cab, exhaust, the
//   anti-grenade wire roof of the Flers tanks (roof: true), steering tail with two wheels.
//   helmet(path, head, face, s, kind, t, seed) -> d string: "brodie" (British dish) | "stahl" (German coal scuttle) |
//     "cap" (peaked officer cap) | "top" (top hat) | "naval" (peaked naval cap)
//   moustache(head, face, s, t, seed) -> d (big Edwardian moustache: Kitchener, Haig)
//   wire(x0, x1, gy, t, seed, crush(x) -> 0..1, opts) -> {posts, coil}   barbed wire on X pickets
//   burst(cx, cy, age, size, t, seed) -> {cloud, ink, flash}            shell burst (age in s, 0..2.5)
//   puffs(list of {x, y, age, r}, t, seed) -> {fill, ink}                smoke puffs
//   plane(cx, cy, s, face, t, seed) -> {fill, ink}                       WWI biplane, side view
// }
// Everything is a pure function of (seed, t); no Math.random. Colours only from INK tokens.
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const D2R = Math.PI / 180;
  let UID = 0;

  // ---------- geometry helpers
  function offsetPoly(pts, d) {          // inward offset of a clockwise (screen) polygon by d along vertex bisectors
    const n = pts.length, cx = pts.reduce((a, p) => a + p[0], 0) / n, cy = pts.reduce((a, p) => a + p[1], 0) / n;
    return pts.map((p, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      let nx1 = -(p[1] - a[1]), ny1 = p[0] - a[0], nx2 = -(b[1] - p[1]), ny2 = b[0] - p[0];
      const l1 = Math.hypot(nx1, ny1) || 1, l2 = Math.hypot(nx2, ny2) || 1;
      let nx = nx1 / l1 + nx2 / l2, ny = ny1 / l1 + ny2 / l2; const ln = Math.hypot(nx, ny) || 1; nx /= ln; ny /= ln;
      if ((cx - p[0]) * nx + (cy - p[1]) * ny < 0) { nx = -nx; ny = -ny; }
      return [p[0] + nx * d, p[1] + ny * d];
    });
  }
  function perim(pts) {                  // cumulative arc lengths of a closed polygon
    const L = [0];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; L.push(L[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    return L;
  }
  function along(pts, L, s) {            // point + unit tangent at arc length s
    const tot = L[L.length - 1]; s = ((s % tot) + tot) % tot;
    let i = 0; while (i < pts.length - 1 && L[i + 1] < s) i++;
    const a = pts[i], b = pts[(i + 1) % pts.length], seg = L[i + 1] - L[i] || 1, u = (s - L[i]) / seg;
    return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], d: [(b[0] - a[0]) / seg, (b[1] - a[1]) / seg] };
  }
  const circ = (cx, cy, r, n = 12, ry) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * (ry ?? r)]);
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // ---------- tank profiles (cm)
  const PROF = {
    mk1: [[-235, 0], [185, 0], [300, -58], [392, -140], [404, -184], [384, -224], [336, -246], [-300, -246], [-366, -226], [-398, -182], [-386, -118], [-322, -48]],
    willie: [[-250, 0], [205, 0], [282, -42], [300, -88], [282, -122], [-262, -122], [-298, -92], [-292, -44]],
  };

  function tank(group, cfg = {}) {
    const v = cfg.variant || 'male', W = v === 'willie', sd = (cfg.seed || 1) * 97 + 11;
    const g = el(group, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra || {});
    const outer = PROF[W ? 'willie' : 'mk1'];
    const inner = offsetPoly(outer, W ? 24 : 34);
    const L = perim(outer);
    // clip for the hatching = the side plate (static)
    const cid = 'tkclip' + (++UID) + '_' + sd;
    const defs = el(g, 'defs'), cp = el(defs, 'clipPath', { id: cid });
    const plateBox = W ? rect(-232, -300, 236, -122) : inner;
    el(cp, 'path', { d: 'M' + (W ? plateBox : inner).map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L') + ' Z' });
    const shadowE = P(INK.ink, { 'fill-opacity': 0.16 });
    const lay = {
      tailI: P(INK.ink), tailF: P(INK.paperDark),
      trackF: P(INK.inkSoft), plateF: P(INK.paperDark), hullF: W ? P(INK.paperDark) : null,
      hatch: el(g, 'path', { fill: INK.inkSoft, stroke: 'none', 'clip-path': `url(#${cid})`, 'fill-opacity': 0.75 }),
      scorch: P(INK.ink, { 'fill-opacity': 0.0 }),
      rivet: P(INK.ink), links: P(INK.ink), ink: P(INK.ink),
      sponF: P(INK.paperDark), sponI: P(INK.ink), gun: P(INK.ink),
      roof: P(INK.ink), cabF: P(INK.paperDark), cabI: P(INK.ink),
      lab: null, flash: P(INK.gold), flashR: P(INK.red),
    };
    if (cfg.label) {
      lay.lab = el(g, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 64,
        'text-anchor': 'middle', fill: INK.paperLight, stroke: INK.ink, 'stroke-width': 3, 'paint-order': 'stroke' });
      lay.lab.textContent = cfg.label;
    }
    const fas = cfg.fascine ? { f: P(INK.paperDark), i: P(INK.ink) } : null;
    const rr = rng(sd);
    const hatchLines = [];   // static diagonal hatch over the lower plate
    for (let x = -460; x < 460; x += 22) hatchLines.push([x + rr() * 6, rr()]);

    function update(t, st) {
      const s = st.s ?? 1, face = st.face ?? 1, a = (st.a || 0), ph = st.ph || 0, dead = clamp01(st.dead || 0);
      const sh = st.shake ? [Math.sin(t * 47) * st.shake, Math.cos(t * 39) * st.shake * 0.6] : [0, 0];
      g.setAttribute('transform', `translate(${f1(st.x + sh[0])} ${f1(st.y + sh[1])}) rotate(${(-a * face).toFixed(2)}) scale(${(face * s).toFixed(4)} ${s.toFixed(4)})`);
      const w = k => k / Math.max(0.25, s);           // constant on-screen stroke width
      const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.4 / Math.max(0.3, s), w: w(5) }, extra || {});
      shadowE.setAttribute('d', inkLoop(circ(0, 6, W ? 300 : 420, 14, 16), o(0, { amp: 0.6 })));
      // steering tail
      const tailOn = cfg.tail !== false;
      if (tailOn) {
        const tx = W ? -440 : -560, ty = -58, root = W ? [-290, -80] : [-392, -150];
        const TI = [inkPath([root, [tx, ty - 6]], o(1, { w: w(9) })), inkPath([[root[0], root[1] + 40], [tx, ty + 10]], o(2, { w: w(5) }))];
        const wp = circ(tx, ty, 56, 14);
        TI.push(inkPath(wp, o(3, { closed: true, w: w(6) })));
        for (let k = 0; k < 4; k++) { const an = ph / 56 + k * Math.PI / 4; TI.push(inkPath([[tx - Math.cos(an) * 50, ty - Math.sin(an) * 50], [tx + Math.cos(an) * 50, ty + Math.sin(an) * 50]], o(4 + k, { w: w(3.5) }))); }
        lay.tailF.setAttribute('d', inkLoop(wp, o(8)));
        lay.tailI.setAttribute('d', TI.join(' '));
      } else { lay.tailF.setAttribute('d', ''); lay.tailI.setAttribute('d', ''); }
      // track band + side plate
      let oPts = outer;
      if (dead > 0) oPts = outer.map((p, i) => (p[1] > -10 ? [p[0], p[1] + 14 * dead] : p));   // slack, sagging track
      lay.trackF.setAttribute('d', inkLoop(oPts, o(10, { smooth: false })));
      lay.plateF.setAttribute('d', inkLoop(inner, o(11, { smooth: false })));
      const INKS = [inkPath(oPts, o(12, { closed: true, smooth: false, w: w(7) })), inkPath(inner, o(13, { closed: true, smooth: false, w: w(4.5) }))];
      // links: cross lines in the band, rolling with ph
      const LK = [], tot = L[L.length - 1], step = W ? 34 : 38;
      for (let sArc = (ph % step + step) % step; sArc < tot; sArc += step) {
        const q = along(oPts, L, sArc), nx = q.d[1], ny = -q.d[0];
        const dpt = W ? 24 : 34;
        const p0 = q.p, p1 = [q.p[0] + nx * dpt, q.p[1] + ny * dpt];
        LK.push(inkPath([p0, p1], { seed: sd + 200 + Math.round(sArc / step), t, amp: 0.6 / Math.max(0.3, s), w: w(3.2), taper: 0 }));
      }
      lay.links.setAttribute('d', LK.join(' '));
      // hull (willie: box on the track) or rivets on the mk1 plate
      const RV = [];
      if (W) {
        const hull = [[-230, -122], [226, -122], [262, -200], [232, -300], [-220, -300], [-242, -210]];
        lay.hullF.setAttribute('d', inkLoop(hull, o(20, { smooth: false })));
        INKS.push(inkPath(hull, o(21, { closed: true, smooth: false, w: w(6) })));
        for (let x = -200; x < 220; x += 46) { RV.push(inkDot(x, -138, 5, 5, sd + 300 + x, t, 0.4)); RV.push(inkDot(x, -284, 5, 5, sd + 400 + x, t, 0.4)); }
        // dummy turret drum on top (removed later in real life)
        const tur = [[-70, -300], [70, -300], [62, -350], [-62, -350]];
        INKS.push(inkPath(tur, o(22, { closed: true, smooth: false, w: w(5) })));
        RV.push(inkLoop(tur, o(23, { smooth: false })));
      } else {
        const ri = offsetPoly(outer, 52);
        const RL = perim(ri);
        for (let sArc = 0; sArc < RL[RL.length - 1]; sArc += 40) { const q = along(ri, RL, sArc); RV.push(inkDot(q.p[0], q.p[1], 4.5, 4.5, sd + 500 + sArc, t, 0.4)); }
        // two horizontal plate seams
        INKS.push(inkPath([[-300, -150], [330, -150]], o(24, { w: w(2.5) })));
      }
      lay.rivet.setAttribute('d', RV.join(' '));
      const HT = [];
      hatchLines.forEach(([x, r], k) => HT.push(inkPath([[x, -40], [x + 110, -320]], { seed: sd + 600 + k, t, amp: 0.8 / Math.max(0.3, s), w: w(2.2), taper: 0.2 })));
      lay.hatch.setAttribute('d', HT.join(' '));
      lay.scorch.setAttribute('fill-opacity', (0.35 * dead).toFixed(3));
      lay.scorch.setAttribute('d', dead > 0 ? inkLoop(inner, o(25, { smooth: false })) : '');
      // sponson + gun
      const out = {};
      if (!W) {
        const female = v === 'female', mother = v === 'mother';
        const sp = female ? [[-120, -48], [96, -48], [120, -110], [96, -196], [-120, -196]] : [[-110, -58], [70, -58], [104, -120], [70, -186], [-110, -186]];
        lay.sponF.setAttribute('d', inkLoop(sp, o(30, { smooth: false })));
        const SI = [inkPath(sp, o(31, { closed: true, smooth: false, w: w(6) }))];
        sp.forEach((p, k) => SI.push(inkDot(p[0] * 0.92, p[1] * 0.96 + 4, 4.5, 4.5, sd + 700 + k, t, 0.4)));
        lay.sponI.setAttribute('d', SI.join(' '));
        let G = [];
        if (female) {
          G.push(inkPath([[110, -96], [176, -96]], o(32, { w: w(11) })), inkPath([[104, -150], [168, -150]], o(33, { w: w(11) })));
          out.muzzle = [180, -96];
        } else {
          const gx0 = 92, gy = -122, len = mother ? 170 : 190;
          G.push(inkPath([[gx0, gy], [gx0 + len, gy]], o(34, { w: w(20), taper: 0 })), inkPath([[gx0 + len - 14, gy - 13], [gx0 + len - 14, gy + 13]], o(35, { w: w(8) })));
          G.push(inkLoop(circ(gx0 + 6, gy, 30, 10), o(36)));
          out.muzzle = [gx0 + len + 6, gy];
        }
        lay.gun.setAttribute('d', G.join(' '));
        // cab + exhaust
        const cab = [[218, -246], [330, -246], [320, -290], [226, -290]];
        lay.cabF.setAttribute('d', inkLoop(cab, o(40, { smooth: false })));
        const CI = [inkPath(cab, o(41, { closed: true, smooth: false, w: w(5) })), inkPath([[250, -272], [298, -272]], o(42, { w: w(4) })),
          inkPath([[-40, -246], [-40, -312]], o(43, { w: w(13), taper: 0 })), inkPath([[-58, -316], [-22, -316]], o(44, { w: w(7) }))];
        lay.cabI.setAttribute('d', CI.join(' '));
        out.exhaust = [-40, -320];
        // anti-grenade wire roof (Flers, September 1916)
        if (cfg.roof) {
          const R = [[-250, -246], [-200, -330], [250, -330], [300, -246]], RI = [inkPath(R, o(45, { w: w(5) }))];
          for (let x = -200; x <= 250; x += 45) RI.push(inkPath([[x, -330], [x + (x < 25 ? -50 : 50) * 0.2, -248]], o(46 + x, { w: w(2.5) })));
          RI.push(inkPath([[-225, -288], [275, -288]], o(47, { w: w(2.5) })));
          lay.roof.setAttribute('d', RI.join(' '));
        } else lay.roof.setAttribute('d', '');
      } else {
        lay.sponF.setAttribute('d', ''); lay.sponI.setAttribute('d', ''); lay.gun.setAttribute('d', ''); lay.cabF.setAttribute('d', ''); lay.roof.setAttribute('d', '');
        lay.cabI.setAttribute('d', inkPath([[-150, -300], [-150, -350]], o(43, { w: w(12), taper: 0 })));
        out.exhaust = [-150, -354]; out.muzzle = [300, -200];
      }
      lay.ink.setAttribute('d', INKS.join(' '));
      if (lay.lab) lay.lab.setAttribute('transform', `translate(${W ? 0 : -150} ${W ? -190 : -105}) scale(${face} 1)`);
      if (fas) {   // Cambrai 1917: a brushwood bundle on the roof, dropped into wide trenches
        const fb = [[-120, -250], [140, -250], [150, -300], [130, -350], [-110, -352], [-132, -300]];
        fas.f.setAttribute('d', inkLoop(fb, o(60)));
        const FI = [inkPath(fb, o(61, { closed: true, w: w(5) }))];
        for (let k = 0; k < 5; k++) FI.push(inkPath([[-120, -262 - k * 20], [140, -262 - k * 20]], o(62 + k, { w: w(2.4) })));
        for (let k = 0; k < 3; k++) FI.push(inkPath([[-60 + k * 90, -248], [-60 + k * 90, -352]], o(70 + k, { w: w(4) })));
        fas.i.setAttribute('d', FI.join(' '));
      }
      // muzzle flash
      const fl = clamp01(st.fire || 0);
      if (fl > 0.02 && out.muzzle) {
        const [mx, my] = out.muzzle, R = 70 * fl, pts = [];
        for (let k = 0; k < 14; k++) { const an = k / 14 * 6.2832, rr2 = (k % 2 ? 0.45 : 1) * R; pts.push([mx + 20 * fl + Math.cos(an) * rr2 * 1.5, my + Math.sin(an) * rr2]); }
        lay.flash.setAttribute('d', inkLoop(pts, o(50, { smooth: false })));
        lay.flashR.setAttribute('d', inkPath(pts, o(51, { closed: true, smooth: false, w: w(4) })));
      } else { lay.flash.setAttribute('d', ''); lay.flashR.setAttribute('d', ''); }
      // world points
      const ca = Math.cos(-a * face * D2R), sa = Math.sin(-a * face * D2R);
      const Wp = q => [st.x + sh[0] + (face * s * q[0]) * ca - (s * q[1]) * sa, st.y + sh[1] + (face * s * q[0]) * sa + (s * q[1]) * ca];
      return { muzzle: out.muzzle ? Wp(out.muzzle) : null, exhaust: Wp(out.exhaust), nose: Wp(W ? [300, -60] : [404, -184]),
        rear: Wp(W ? [-298, -60] : [-398, -150]), top: Wp([0, W ? -330 : -260]), center: Wp([0, -130]) };
    }
    return { update, node: g };
  }

  // ---------- helmets and faces (world px; head = [x, y] centre, s = rig scale, face = 1|-1)
  function helmet(head, face, s, kind, t, seed) {
    const [hx, hy] = head, R = 72 * s, o = (k, w) => ({ seed: seed + k, t, amp: 1, w: w * Math.max(0.5, s / 0.6) });
    const H = (u, v) => [hx + face * u * R, hy + v * R];
    if (kind === 'brodie') {
      const dome = [H(-0.78, -0.45), H(-0.6, -0.95), H(0, -1.22), H(0.62, -0.95), H(0.8, -0.45)];
      const brim = [H(-1.35, -0.42), H(-0.7, -0.5), H(0.7, -0.5), H(1.38, -0.4)];
      return { fill: inkLoop(dome.concat([H(0.8, -0.4), H(-0.78, -0.4)]), o(1, 1)), ink: inkPath(dome, o(2, 6)) + ' ' + inkPath(brim, o(3, 8)) };
    }
    if (kind === 'stahl') {
      const shell = [H(0.82, -0.2), H(0.8, -0.7), H(0.4, -1.12), H(-0.3, -1.18), H(-0.86, -0.82), H(-1.02, -0.2), H(-1.0, 0.25), H(-1.22, 0.4)];
      const fillP = shell.concat([H(-0.6, 0.3), H(-0.5, -0.1), H(0.7, -0.22)]);
      return { fill: inkLoop(fillP, o(4, 1)), ink: inkPath(shell, o(5, 6)) + ' ' + inkPath([H(0.84, -0.22), H(1.02, -0.12)], o(6, 6)) + ' ' + inkDot(...H(-0.6, -0.55), 6 * s, 6 * s, seed + 7, t) };
    }
    if (kind === 'cap' || kind === 'naval') {
      const crown = [H(-0.9, -0.55), H(-1.0, -1.05), H(0.2, -1.32), H(0.92, -1.0), H(0.86, -0.55)];
      return { fill: inkLoop(crown, o(8, 1)), ink: inkPath(crown.concat([crown[0]]), o(9, 6)) + ' ' + inkPath([H(0.4, -0.55), H(1.25, -0.42)], o(10, 9)) +
        (kind === 'naval' ? ' ' + inkDot(...H(0, -0.8), 9 * s, 7 * s, seed + 11, t) : ' ' + inkPath([H(-0.9, -0.66), H(0.88, -0.66)], o(12, 4))) };
    }
    if (kind === 'top') {
      const crown = [H(-0.62, -0.75), H(-0.7, -1.9), H(0.66, -1.9), H(0.6, -0.75)];
      return { fill: inkLoop(crown, o(13, 1)), ink: inkPath(crown.concat([crown[0]]), o(14, 6)) + ' ' + inkPath([H(-1.0, -0.72), H(1.0, -0.72)], o(15, 9)) };
    }
    if (kind === 'flat') {   // flat cap (workers)
      const c = [H(-0.92, -0.5), H(-0.7, -1.02), H(0.4, -1.1), H(0.95, -0.72), H(1.28, -0.55)];
      return { fill: inkLoop(c.concat([H(-0.9, -0.46)]), o(16, 1)), ink: inkPath(c, o(17, 6)) + ' ' + inkPath([H(-0.92, -0.5), H(1.28, -0.55)], o(18, 5)) };
    }
    return { fill: '', ink: '' };
  }
  function moustache(head, face, s, t, seed) {
    const [hx, hy] = head, R = 72 * s, H = (u, v) => [hx + face * u * R, hy + v * R];
    const cx = 0.36, L = [H(cx, 0.36), H(cx - 0.3, 0.42), H(cx - 0.62, 0.3), H(cx - 0.7, 0.18)], Rr = [H(cx, 0.36), H(cx + 0.3, 0.42), H(cx + 0.6, 0.3), H(cx + 0.72, 0.18)];
    return inkPath(L, { seed: seed + 1, t, w: 12 * s / 0.6, amp: 0.7, taper: 0.7 }) + ' ' + inkPath(Rr, { seed: seed + 2, t, w: 12 * s / 0.6, amp: 0.7, taper: 0.7 });
  }

  // bow tie under the chin, cigar in the mouth with smoke curling from its tip (Churchill)
  function bowtie(head, face, s, t, seed) {
    const [hx, hy] = head, R = 72 * s, c = [hx + face * 0.12 * R, hy + 1.35 * R], w = 0.42 * R, h = 0.22 * R;
    const pts = [[c[0] - w, c[1] - h], [c[0], c[1]], [c[0] - w, c[1] + h], [c[0] - w, c[1] - h]], pts2 = [[c[0] + w, c[1] - h], [c[0], c[1]], [c[0] + w, c[1] + h], [c[0] + w, c[1] - h]];
    return { fill: inkLoop(pts, { seed: seed + 1, t, smooth: false }) + ' ' + inkLoop(pts2, { seed: seed + 2, t, smooth: false }),
      ink: inkPath(pts, { seed: seed + 3, t, w: 3 * s / 0.6, smooth: false }) + ' ' + inkPath(pts2, { seed: seed + 4, t, w: 3 * s / 0.6, smooth: false }) };
  }
  function cigar(head, face, s, lt, t, seed) {
    const [hx, hy] = head, R = 72 * s, m = [hx + face * 0.45 * R, hy + 0.5 * R], tip = [m[0] + face * 0.95 * R, m[1] - 0.1 * R];
    const ink = inkPath([m, tip], { seed: seed + 1, t, w: 13 * s / 0.6, taper: 0 }) + ' ' + inkDot(tip[0], tip[1], 6 * s / 0.6, 6 * s / 0.6, seed + 2, t);
    const S = [];
    for (let k = 0; k < 4; k++) { const age = (lt * 0.45 + k / 4) % 1, pts = [];
      for (let j = 0; j < 6; j++) pts.push([tip[0] + Math.sin(age * 6 + j * 0.8 + k) * (6 + age * 22) * s / 0.6, tip[1] - (age * 160 + j * 18) * s / 0.6]);
      S.push(inkPath(pts, { seed: seed + 10 + k, t, w: (3.5 * (1 - age) + 0.8) * s / 0.6, amp: 0.8 })); }
    return { ink, smoke: S.join(' ') };
  }

  // ---------- barbed wire: X pickets + coil loops; crush(x) -> 0..1 flattens the coil at x
  function wire(x0, x1, gy, t, seed, crush = () => 0, opts = {}) {
    const h = opts.h ?? 70, gap = opts.gap ?? 150, P = [], C = [], B = [];
    for (let x = x0, k = 0; x <= x1 + 1; x += gap, k++) {
      const c = crush(x), hh = h * (1 - 0.85 * c), lean = c * 30;
      P.push(inkPath([[x - 22, gy(x)], [x + 22 + lean, gy(x) - hh - 10]], { seed: seed + k * 3, t, w: 4.5, amp: 0.8 }));
      P.push(inkPath([[x + 22, gy(x)], [x - 22 + lean, gy(x) - hh - 10]], { seed: seed + k * 3 + 1, t, w: 4.5, amp: 0.8 }));
    }
    const loopW = 34;
    for (let x = x0; x < x1; x += loopW) {
      const c = crush(x), hh = h * (1 - 0.85 * c), y = gy(x) - hh * 0.55, k = Math.round((x - x0) / loopW);
      C.push(inkPath(inkEllipsePts(x + loopW / 2, y, loopW * 0.75, hh * 0.5, seed + 100 + k, 9, 0.3), { seed: seed + 100 + k, t, w: 2.6, amp: 0.7, closed: true }));
      if (k % 2 === 0) B.push(inkPath([[x + 10, y - hh * 0.5 - 6], [x + 18, y - hh * 0.5 + 6]], { seed: seed + 300 + k, t, w: 2.6, amp: 0.4 }));
    }
    return { posts: P.join(' '), coil: C.join(' ') + ' ' + B.join(' ') };
  }

  // ---------- shell burst: flash, dark cloud column, debris
  function burst(cx, cy, age, size, t, seed) {
    if (age < 0 || age > 2.6) return { cloud: '', ink: '', flash: '' };
    const u = clamp01(age / 2.6), grow = 1 - Math.pow(1 - clamp01(age / 0.7), 3);
    const F = age < 0.22 ? inkLoop(Array.from({ length: 12 }, (_, k) => { const an = k / 12 * 6.2832, r = (k % 2 ? 0.5 : 1) * size * 0.9 * (0.6 + age * 2); return [cx + Math.cos(an) * r, cy - size * 0.3 + Math.sin(an) * r * 0.8]; }), { seed: seed + 1, t, smooth: false }) : '';
    const CL = [], IN = [];
    const blobs = 7;
    for (let k = 0; k < blobs; k++) {
      const r = rng(seed * 13 + k), ang = -Math.PI / 2 + (r() - 0.5) * 1.6, dist = size * (0.2 + r() * 0.9) * grow;
      const bx = cx + Math.cos(ang) * dist * 0.8, by = cy - size * 0.25 - Math.sin(-ang) * dist * (1 + u * 0.6), br = size * (0.25 + r() * 0.25) * (0.4 + grow * 0.8) * (1 - u * 0.25);
      const pts = inkEllipsePts(bx, by, br, br * 0.9, seed + 20 + k, 10, 0, 0.12);
      CL.push(inkLoop(pts, { seed: seed + 20 + k, t, amp: 1.5 }));
      if (k % 2 === 0) IN.push(inkPath(pts, { seed: seed + 40 + k, t, w: 3.5, closed: true, amp: 1.5 }));
    }
    for (let k = 0; k < 9; k++) {   // debris clods on ballistic arcs
      const r = rng(seed * 7 + k), vx = (r() - 0.5) * size * 3, vy = -size * (2 + r() * 2.5), tt = Math.min(age, 1.4);
      const x = cx + vx * tt, y = cy + vy * tt + 0.5 * size * 9 * tt * tt;
      if (y < cy + 20) IN.push(inkDot(x, y, 6 + r() * 5, 5 + r() * 4, seed + 60 + k, t));
    }
    return { cloud: CL.join(' '), ink: IN.join(' '), flash: F };
  }
  function puffs(list, t, seed) {
    const F = [], I = [];
    list.forEach((q, k) => {
      const pts = inkEllipsePts(q.x, q.y, q.r, q.r * 0.85, seed + k * 7, 10, 0, 0.1);
      F.push(inkLoop(pts, { seed: seed + k * 7, t, amp: 1.2 }));
      I.push(inkPath(pts, { seed: seed + k * 7 + 3, t, w: 3, closed: true, amp: 1.2 }));
    });
    return { fill: F.join(' '), ink: I.join(' ') };
  }

  // ---------- biplane (side view), cx/cy = fuselage middle
  function plane(cx, cy, s, face, t, seed) {
    const Q = (u, v) => [cx + face * u * s, cy + v * s], o = (k, w) => ({ seed: seed + k, t, w: w, amp: 0.9 });
    const fus = [Q(-150, -6), Q(-60, -16), Q(70, -18), Q(110, -10), Q(112, 12), Q(60, 16), Q(-60, 8), Q(-150, 2)];
    const wingT = [Q(-40, -70), Q(60, -70), Q(66, -60), Q(-46, -60)], wingB = [Q(-30, 20), Q(60, 20), Q(64, 28), Q(-34, 28)];
    const tail = [Q(-150, -6), Q(-170, -40), Q(-140, -40), Q(-120, -8)];
    const prop = Math.sin(t * 40);
    const F = [inkLoop(fus, o(1)), inkLoop(wingT, o(2)), inkLoop(wingB, o(3)), inkLoop(tail, o(4))].join(' ');
    const I = [inkPath(fus, Object.assign(o(5, 4), { closed: true })), inkPath(wingT, Object.assign(o(6, 4), { closed: true, smooth: false })),
      inkPath(wingB, Object.assign(o(7, 4), { closed: true, smooth: false })), inkPath(tail, Object.assign(o(8, 4), { closed: true, smooth: false })),
      inkPath([Q(-20, -60), Q(-10, 20)], o(9, 3)), inkPath([Q(40, -60), Q(48, 20)], o(10, 3)), inkPath([Q(-20, -60), Q(48, 20)], o(11, 2)),
      inkPath([Q(116, -40 * prop - 4), Q(116, 40 * prop + 4)], o(12, 5)), inkPath([Q(20, 16), Q(10, 44)], o(13, 3)), inkPath([Q(40, 16), Q(50, 44)], o(14, 3)),
      inkPath(circ(Q(10, 48)[0], Q(10, 48)[1], 10 * s, 8), Object.assign(o(15, 3), { closed: true })),
      inkDot(...Q(10, -24), 12 * s, 10 * s, seed + 16, t)].join(' ');
    return { fill: F, ink: I };
  }

  window.TKL = { tank, helmet, moustache, bowtie, cigar, wire, burst, puffs, plane, offsetPoly, circ, rect, f1 };
})();
