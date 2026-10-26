// sh__lib: shared drawings for the sh_* shots (Stickstory "snapping shrimp", 2026-10-26). Not a shot type itself.
// Parchment ink style (brand/kit/BRAND.md §3, §5): every line boils at 8 Hz via _ink.js, palette tokens only (INK),
// everything a pure function of (seed, t). Parametric: usable for any small sea creature / underwater-sound story.
// window.SHR = {
//   shrimp(parent, seed) -> {update(t, o) -> {tip: [x, y] world (claw tip), palm: [x, y] world}}
//       side view of a pistol shrimp: tail fan, segmented abdomen, carapace with a big eye, two long antennae,
//       walking legs, one small pincer and one HUGE snapping claw (red-tinted palm, fixed lower finger, hinged
//       upper finger). o: {x, y (ground point under the body), s: 1 (1 = ~870 px long), face: 1|-1, rot (deg),
//       close: 0..1 (0 = claw cocked open, 1 = snapped shut), tiny: false (fewer details, for colonies)}
//   sub(parent, seed) -> {update(t, o)}   WWII-style submarine side view (hull, sail, periscope, deck gun,
//       portholes, turning propeller). o: {x, y (hull centre), s: 1 (1 = ~680 px long), face: 1|-1, rot}
//   bubble(parent, seed) -> {update(t, x, y, r)}       cavitation bubble: ink ring + highlight + light fill (r 0 hides)
//   burst(parent, seed) -> {update(t, x, y, age, R)}    the collapse: gold flash star, ink spikes, 3 sound rings
//       (age = seconds since the bang, < 0 hides; R = size)
//   jet(parent, seed) -> {update(t, x, y, dir, len, p)} water-jet speed streaks from the claw tip (p 0..1)
//   water(parent, seed, W, H, o) -> {update(t)}         drifting current lines + rising bubbles; o: {surface: 0.2 |
//       false (wavy surface line), bed: 0.6 | false (seabed: sand line, stipple, rocks, swaying weed), depth: 60 (px of sand fill), y0, y1}
//   arrow(parent, seed) -> {update(t, A, B, p)}         hand-drawn arrow A -> B (p 0..1 draws it)
//   finger(parent, seed) -> {update(t, o)}              a human index finger, pointing left (size reference)
//       o: {x, y (fingertip), s: 1 (1 = ~520 px long)}
//   ship(parent, seed) -> {update(t, o)}                small destroyer silhouette on the surface; o: {x, y (waterline), s}
//   fish(parent, seed) -> {update(t, o)}                small prey fish; o: {x, y (centre), s, face, rot, stun: 0..1 (belly-up, X eyes, dizzy stars)}
// }
'use strict';

(() => {
  const f1 = v => Math.round(v * 10) / 10;
  const ell = (cx, cy, rx, ry, n = 16) => {
    const out = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return out;
  };
  const rotP = (p, c, deg) => {
    const a = deg * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a), x = p[0] - c[0], y = p[1] - c[1];
    return [c[0] + x * cs - y * sn, c[1] + x * sn + y * cs];
  };
  // local -> world for a group transform translate(x y) rotate(rot) scale(face*s, s)
  const toWorld = (o, p) => {
    const s = o.s ?? 1, face = o.face ?? 1, a = (o.rot ?? 0) * Math.PI / 180;
    const x = p[0] * s * face, y = p[1] * s;
    return [(o.x ?? 0) + x * Math.cos(a) - y * Math.sin(a), (o.y ?? 0) + x * Math.sin(a) + y * Math.cos(a)];
  };
  const xf = (g, o) => g.setAttribute('transform', `translate(${f1(o.x ?? 0)} ${f1(o.y ?? 0)}) rotate(${f1(o.rot ?? 0)}) scale(${((o.face ?? 1) * (o.s ?? 1)).toFixed(4)} ${(o.s ?? 1).toFixed(4)})`);

  // ------------------------------------------------------------------ pistol shrimp
  const HINGE = [372, -132], DACT = [[0, -16], [60, -14], [104, 4], [112, 18], [92, 22], [52, 14], [0, 16]];
  function shrimp(parent, sd) {
    const g = el(parent, 'g');
    const antR = inkEl(g, INK.inkSoft);
    const legsR = inkEl(g);
    const tailF = inkEl(g, INK.paperLight), tailT = inkEl(g, INK.red, { 'fill-opacity': 0.22 }), tailR = inkEl(g);
    const absF = inkEl(g, INK.paperLight), absT = inkEl(g, INK.red, { 'fill-opacity': 0.22 }), absR = inkEl(g), segR = inkEl(g, INK.inkSoft);
    const carF = inkEl(g, INK.paperLight), carT = inkEl(g, INK.red, { 'fill-opacity': 0.22 }), carR = inkEl(g);
    const smallR = inkEl(g);
    const armO = inkEl(g), armI = inkEl(g, INK.paperLight);
    const polF = inkEl(g, INK.paperLight), polT = inkEl(g, INK.red, { 'fill-opacity': 0.45 }), polR = inkEl(g);
    const dacF = inkEl(g, INK.paperLight), dacT = inkEl(g, INK.red, { 'fill-opacity': 0.45 }), dacR = inkEl(g);
    const palmF = inkEl(g, INK.paperLight), palmT = inkEl(g, INK.red, { 'fill-opacity': 0.45 }), palmR = inkEl(g), spots = inkEl(g, INK.red);
    const eye = inkEl(g), eyeHi = inkEl(g, INK.paperLight), blush = inkEl(g, INK.red, { 'fill-opacity': 0.3 });
    return {
      node: g,
      update(t, o = {}) {
        xf(g, o);
        const S = k => sd * 60 + k, tiny = !!o.tiny, A = tiny ? 0.5 : 1;
        const close = clamp01(o.close ?? 0), sway = Math.sin(t * 1.7) * 10;
        // antennae (long, swaying)
        if (!tiny) antR.setAttribute('d',
          inkPath([[170, -150], [250, -220 + sway * 0.4], [360, -262 + sway], [470, -250 + sway * 1.4]], { w: 4, seed: S(1), t, amp: 1, taper: 0.6 }) + ' ' +
          inkPath([[172, -138], [270, -190 - sway * 0.3], [380, -206 - sway * 0.6], [452, -186 - sway]], { w: 3.6, seed: S(2), t, amp: 1, taper: 0.6 }));
        else antR.setAttribute('d', inkPath([[170, -150], [300, -240 + sway], [440, -240 + sway]], { w: 7, seed: S(1), t, amp: 1, taper: 0.5 }));
        // walking legs + swimmerets (little paddling)
        let ld = '';
        [-10, 40, 90].forEach((x, k) => {
          const st = Math.sin(t * 3 + k * 1.4) * 6;
          ld += inkPath([[x, -72], [x + 22 + st, -36], [x + 8 + st, 0]], { w: tiny ? 9 : 4.5, seed: S(10 + k), t, amp: 1 * A, smooth: false }) + ' ';
        });
        if (!tiny) [-250, -190, -130, -70].forEach((x, k) => {
          const st = Math.sin(t * 5 + k) * 8;
          ld += inkPath([[x, -70], [x - 6 + st, -40]], { w: 3.6, seed: S(20 + k), t, amp: 0.8 }) + ' ';
        });
        legsR.setAttribute('d', ld);
        // tail fan
        const flick = Math.sin(t * 2.3) * 4;
        const tail = [[-292, -104], [-352, -150 + flick], [-400, -112 + flick], [-404, -70 + flick], [-360, -42 + flick], [-296, -78]];
        tailF.setAttribute('d', inkLoop(tail, { seed: S(30), t, amp: A }));
        tailT.setAttribute('d', inkLoop(tail, { seed: S(30), t, amp: A }));
        tailR.setAttribute('d', inkPath(tail, { w: tiny ? 12 : 5.5, seed: S(31), t, closed: true, amp: A }) +
          (tiny ? '' : ' ' + inkPath([[-300, -90], [-390, -98 + flick]], { w: 3, seed: S(32), t, amp: 0.8 }) + ' ' + inkPath([[-300, -88], [-370, -58 + flick]], { w: 3, seed: S(33), t, amp: 0.8 })));
        // abdomen (curved, segmented)
        const abd = [[-300, -112], [-240, -146], [-150, -166], [-40, -170], [-20, -120], [-40, -68], [-140, -60], [-240, -66], [-300, -80]];
        absF.setAttribute('d', inkLoop(abd, { seed: S(40), t, amp: A }));
        absT.setAttribute('d', inkLoop(abd, { seed: S(40), t, amp: A }));
        absR.setAttribute('d', inkPath(abd, { w: tiny ? 12 : 6.5, seed: S(41), t, closed: true, amp: A }));
        let sg = '';
        if (!tiny) [-250, -190, -130, -75].forEach((x, k) => {
          const top = -146 - Math.min(20, (x + 250) * 0.12);
          sg += inkPath([[x, top + 6], [x + 10, -110], [x, -66]], { w: 3.6, seed: S(45 + k), t, amp: 0.8, taper: 0.5 }) + ' ';
        });
        segR.setAttribute('d', sg);
        // carapace (head shield)
        const car = [[-40, -172], [50, -186], [130, -170], [176, -140], [172, -98], [120, -72], [20, -66], [-40, -72], [-56, -120]];
        carF.setAttribute('d', inkLoop(car, { seed: S(50), t, amp: A }));
        carT.setAttribute('d', inkLoop(car, { seed: S(50), t, amp: A }));
        carR.setAttribute('d', inkPath(car, { w: tiny ? 12 : 6.5, seed: S(51), t, closed: true, amp: A }) +
          (tiny ? '' : ' ' + inkPath([[30, -180], [40, -120], [30, -70]], { w: 3.4, seed: S(52), t, amp: 0.8, taper: 0.5 })));
        // small pincer (front, low)
        smallR.setAttribute('d', tiny ? '' : inkPath([[120, -80], [170, -46], [214, -36]], { w: 5, seed: S(55), t, amp: 1 }) + ' ' +
          inkPath([[214, -36], [244, -44]], { w: 4.5, seed: S(56), t, amp: 0.8 }) + ' ' + inkPath([[214, -36], [240, -24]], { w: 4.5, seed: S(57), t, amp: 0.8 }));
        // big claw: arm tube, palm, fixed finger, hinged finger
        const arm = [[120, -108], [175, -126], [228, -118]];
        armO.setAttribute('d', inkPath(arm, { w: tiny ? 46 : 34, seed: S(60), t, amp: A, taper: 0 }));
        armI.setAttribute('d', tiny ? '' : inkPath(arm, { w: 20, seed: S(61), t, amp: A, taper: 0 }));
        const pol = [[376, -90], [440, -84], [486, -66], [478, -54], [430, -54], [372, -60]];
        polF.setAttribute('d', inkLoop(pol, { seed: S(62), t, amp: A }));
        polT.setAttribute('d', inkLoop(pol, { seed: S(62), t, amp: A }));
        polR.setAttribute('d', inkPath(pol, { w: tiny ? 12 : 6, seed: S(63), t, closed: true, amp: A }));
        const ang = lerp(-38, 22, close) + (close < 0.02 ? Math.sin(t * 4) * 2 : 0);
        const dac = DACT.map(p => rotP([HINGE[0] + p[0], HINGE[1] + p[1]], HINGE, ang));
        dacF.setAttribute('d', inkLoop(dac, { seed: S(64), t, amp: A }));
        dacT.setAttribute('d', inkLoop(dac, { seed: S(64), t, amp: A }));
        dacR.setAttribute('d', inkPath(dac, { w: tiny ? 12 : 6, seed: S(65), t, closed: true, amp: A }));
        const palm = ell(300, -100, 108, 64, 16).map(([x, y]) => [x, y + (x > 300 ? (y - -100) * -0.08 : 0)]);
        palmF.setAttribute('d', inkLoop(palm, { seed: S(66), t, amp: A }));
        palmT.setAttribute('d', inkLoop(palm, { seed: S(66), t, amp: A }));
        palmR.setAttribute('d', inkPath(palm, { w: tiny ? 14 : 7, seed: S(67), t, closed: true, amp: A }));
        spots.setAttribute('d', tiny ? '' : [[262, -122], [300, -86], [336, -118], [250, -80]].map(([x, y], k) => inkDot(x, y, 9, 8, S(70 + k), t)).join(' '));
        // eye + cheek
        eye.setAttribute('d', inkDot(140, -142, tiny ? 18 : 14, tiny ? 18 : 15, S(80), t));
        eyeHi.setAttribute('d', tiny ? '' : inkDot(145, -147, 4.5, 4.5, S(81), t));
        blush.setAttribute('d', tiny ? '' : inkDot(120, -104, 18, 10, S(82), t));
        return { tip: toWorld(o, [488, -64]), palm: toWorld(o, [300, -100]) };
      },
    };
  }

  // ------------------------------------------------------------------ submarine
  function sub(parent, sd) {
    const g = el(parent, 'g');
    const hullF = inkEl(g, INK.paperLight), hullT = inkEl(g, INK.blue, { 'fill-opacity': 0.45 }), sailF = inkEl(g, INK.paperLight), sailT = inkEl(g, INK.blue, { 'fill-opacity': 0.6 });
    const lines = inkEl(g), soft = inkEl(g), prop = inkEl(g);
    return {
      update(t, o = {}) {
        xf(g, o);
        const S = k => sd * 40 + k;
        const hull = [[-340, 0], [-290, -36], [-140, -54], [160, -54], [280, -40], [330, -6], [300, 30], [180, 50], [-140, 52], [-290, 36]];
        const sail = [[-40, -52], [-20, -126], [96, -126], [120, -52]];
        hullF.setAttribute('d', inkLoop(hull, { seed: S(1), t })); hullT.setAttribute('d', inkLoop(hull, { seed: S(1), t }));
        sailF.setAttribute('d', inkLoop(sail, { seed: S(2), t, smooth: false })); sailT.setAttribute('d', inkLoop(sail, { seed: S(2), t, smooth: false }));
        lines.setAttribute('d', inkPath(hull, { w: 10, seed: S(3), t, closed: true }) + ' ' + inkPath(sail, { w: 9, seed: S(4), t, closed: true, smooth: false }) + ' ' +
          inkPath([[40, -126], [40, -186], [70, -186]], { w: 6, seed: S(5), t, smooth: false }) + ' ' +           // periscope
          inkPath([[150, -54], [150, -78], [210, -84]], { w: 7, seed: S(6), t, smooth: false }) + ' ' +            // deck gun
          inkPath([[-342, 0], [-370, 0]], { w: 6, seed: S(7), t }));
        let sd2 = inkPath([[-260, 0], [260, 0]], { w: 3.4, seed: S(8), t, amp: 1 }) + ' ';
        [-200, -120, -40, 200].forEach((x, k) => { sd2 += inkDot(x, 18, 13, 13, S(10 + k), t) + ' '; });
        soft.setAttribute('d', sd2);
        const a = t * 9;
        prop.setAttribute('d', inkPath([[-372, -28 * Math.cos(a)], [-372, 28 * Math.cos(a)]], { w: 9, seed: S(20), t, amp: 0.8 }) + ' ' +
          inkPath([[-372 - 10 * Math.sin(a), -22 * Math.sin(a)], [-372 + 10 * Math.sin(a), 22 * Math.sin(a)]], { w: 7, seed: S(21), t, amp: 0.8 }));
      },
    };
  }

  // ------------------------------------------------------------------ cavitation bubble, collapse burst, jet
  function bubble(parent, sd) {
    const f = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.7 }), r_ = inkEl(parent), hi = inkEl(parent, INK.paperLight);
    return {
      update(t, x, y, r) {
        if (r < 2) { f.setAttribute('d', ''); r_.setAttribute('d', ''); hi.setAttribute('d', ''); return; }
        const p = ell(x, y, r, r * 0.96, 16);
        f.setAttribute('d', inkLoop(p, { seed: sd + 1, t, amp: 1.2 }));
        r_.setAttribute('d', inkPath(p, { w: Math.max(3, Math.min(7, r * 0.07)), seed: sd + 2, t, closed: true, amp: 1.2 }) + ' ' +
          inkPath([[x - r * 0.62, y - r * 0.2], [x - r * 0.5, y - r * 0.5], [x - r * 0.2, y - r * 0.64]], { w: Math.max(2.5, r * 0.05), seed: sd + 3, t, amp: 0.8 }));
        hi.setAttribute('d', inkDot(x + r * 0.35, y - r * 0.4, r * 0.1, r * 0.1, sd + 4, t));
      },
    };
  }
  function burst(parent, sd) {
    const rings = inkEl(parent, INK.inkSoft), star = inkEl(parent, INK.gold), starR = inkEl(parent), spikes = inkEl(parent), core = inkEl(parent, INK.paperLight);
    return {
      update(t, x, y, age, R = 120) {
        if (age == null || age < 0 || age > 1.6) { [rings, star, starR, spikes, core].forEach(e => e.setAttribute('d', '')); return; }
        let rd = '';
        for (let k = 0; k < 3; k++) {
          const a = age - k * 0.18;
          if (a > 0 && a < 1.3) rd += inkCircle(x, y, R * (0.6 + a * 1.8), sd + 10 + k, t, { w: lerp(8, 2, a / 1.3), n: 22 }) + ' ';
        }
        rings.setAttribute('d', rd);
        const fl = age < 0.55 ? Math.exp(-age * 3.2) * (1 + 0.25 * Math.sin(age * 40)) : 0;
        if (fl > 0.02) {
          const pts = [];
          for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + 0.2, rr = (k % 2 ? 0.42 : 1) * R * (0.5 + fl); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); }
          star.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, smooth: false }));
          starR.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 2, t, closed: true, smooth: false }));
          core.setAttribute('d', inkDot(x, y, R * 0.22 * (0.5 + fl), R * 0.22 * (0.5 + fl), sd + 3, t));
        } else { star.setAttribute('d', ''); starR.setAttribute('d', ''); core.setAttribute('d', ''); }
        let sp = '';
        if (age < 0.7) for (let k = 0; k < 10; k++) {
          const a = k / 10 * Math.PI * 2 + 0.5, r0 = R * (0.9 + age * 2.2), r1 = r0 + R * 0.5 * (1 - age / 0.7);
          sp += inkPath([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 7, seed: sd + 30 + k, t, amp: 1 }) + ' ';
        }
        spikes.setAttribute('d', sp);
      },
    };
  }
  function jet(parent, sd) {
    const e = inkEl(parent, INK.blue), e2 = inkEl(parent, INK.inkSoft);
    return {
      update(t, x, y, dir, len, p) {
        if (p <= 0.01) { e.setAttribute('d', ''); e2.setAttribute('d', ''); return; }
        let d = '', d2 = '';
        [-1, 0, 1].forEach((k, i) => {
          const l = len * (k === 0 ? 1 : 0.75), x0 = x + dir * 10, y0 = y + k * len * 0.07;
          const a = lerp(0, l, Math.min(1, p * 1.4)), b = lerp(0, l, clamp01(p * 1.4 - 0.4));
          if (a - b > 4) d += inkPath([[x0 + dir * b, y0], [x0 + dir * a, y0 + k * 6]], { w: k === 0 ? 16 : 11, seed: sd + i, t, amp: 1, taper: 0.5 }) + ' ';
        });
        for (let k = 0; k < 4; k++) {
          const u = clamp01(p * 1.2 - k * 0.12), xx = x + dir * len * u * 0.9, yy = y + (k % 2 ? -1 : 1) * len * 0.16;
          if (u > 0.05 && u < 0.98) d2 += inkPath([[xx - dir * 30, yy], [xx, yy]], { w: 4, seed: sd + 10 + k, t, amp: 0.8 }) + ' ';
        }
        e.setAttribute('d', d); e2.setAttribute('d', d2);
      },
    };
  }

  // ------------------------------------------------------------------ underwater backdrop
  function water(parent, sd, W, H, o = {}) {
    const g = el(parent, 'g');
    const cur = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.55 }), surf = inkEl(g, INK.blue), surfS = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.6 });
    const bub = inkEl(g, INK.inkSoft), sandF = inkEl(g, INK.paperDark, { 'fill-opacity': 0.55 }), sand = inkEl(g), dots = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.6 });
    const rocksF = inkEl(g, INK.paperDark), rocksR = inkEl(g), weed = inkEl(g, INK.green), weedR = inkEl(g);
    const r = rng(sd * 13 + 5), bubs = [], curs = [], rocks = [], weeds = [], stip = [];
    const y0 = (o.surface ? o.surface + 0.04 : o.y0 ?? 0.16) * H, y1 = (o.bed ? o.bed - 0.03 : o.y1 ?? 0.6) * H;
    for (let i = 0; i < 7; i++) curs.push({ y: lerp(y0 + 30, y1 - 30, (i + r() * 0.6) / 7), x: r() * W, L: lerp(120, 240, r()), sp: lerp(14, 30, r()) });
    for (let i = 0; i < 14; i++) bubs.push({ x: r() * W, ph: r(), sp: lerp(0.08, 0.16, r()), rr: lerp(5, 13, r()) });
    if (o.bed) {
      const by = o.bed * H;
      for (let i = 0; i < 5; i++) rocks.push({ x: lerp(0.04, 0.96, (i + r() * 0.7) / 5) * W, w: lerp(70, 130, r()), h: lerp(40, 80, r()) });
      for (let i = 0; i < 6; i++) weeds.push({ x: lerp(0.02, 0.98, (i + r()) / 6) * W, h: lerp(120, 220, r()), ph: r() * 6 });
      const dep = o.depth ?? 60;
      for (let i = 0; i < 40 + Math.round(dep / 6); i++) stip.push([r() * W, by + 20 + r() * Math.max(10, dep - 20)]);
    }
    return {
      update(t) {
        let cd = '';
        curs.forEach((c, i) => {
          const x = ((c.x + t * c.sp) % (W + c.L)) - c.L / 2;
          cd += inkPath([[x, c.y], [x + c.L * 0.33, c.y - 8], [x + c.L * 0.66, c.y + 6], [x + c.L, c.y - 2]], { w: 3.5, seed: sd + 20 + i, t, amp: 1, taper: 0.7 }) + ' ';
        });
        cur.setAttribute('d', cd);
        if (o.surface) {
          const sy = o.surface * H, pts = [];
          for (let k = 0; k <= 24; k++) { const x = k / 24 * W; pts.push([x, sy + Math.sin(k * 0.9 + t * 2.2) * 9]); }
          surf.setAttribute('d', inkPath(pts, { w: 7, seed: sd + 1, t, amp: 1.2 }));
          let ss = '';
          for (let k = 0; k < 8; k++) { const x = ((k * W / 8 + t * 20) % W); ss += inkPath([[x, sy + 26], [x + 60, sy + 22]], { w: 3.4, seed: sd + 40 + k, t, amp: 0.8 }) + ' '; }
          surfS.setAttribute('d', ss);
        }
        let bd = '';
        const top = o.surface ? o.surface * H + 20 : y0, bot = o.bed ? o.bed * H - 10 : y1;
        bubs.forEach((b, i) => {
          const u = (b.ph + t * b.sp) % 1, y = lerp(bot, top, u), x = b.x + Math.sin(t * 1.6 + i) * 10;
          bd += inkCircle(x, y, b.rr * lerp(0.7, 1.2, u), sd + 60 + i, t, { w: 3, n: 8 }) + ' ';
        });
        bub.setAttribute('d', bd);
        if (o.bed) {
          const by = o.bed * H, pts = [];
          for (let k = 0; k <= 16; k++) pts.push([k / 16 * W, by + Math.sin(k * 1.3) * 10]);
          sand.setAttribute('d', inkPath(pts, { w: 6.5, seed: sd + 2, t, amp: 1.2 }));
          sandF.setAttribute('d', inkLoop(pts.concat([[W, by + (o.depth ?? 60)], [0, by + (o.depth ?? 60)]]), { seed: sd + 3, t, amp: 1, smooth: false }));
          dots.setAttribute('d', stip.map(([x, y], i) => inkDot(x, y, 3.5, 3, sd + 100 + i, t)).join(' '));
          let rf = '', rr = '';
          rocks.forEach((k, i) => {
            const p = [[k.x - k.w, by + 8], [k.x - k.w * 0.7, by - k.h * 0.8], [k.x, by - k.h], [k.x + k.w * 0.75, by - k.h * 0.6], [k.x + k.w, by + 8]];
            rf += inkLoop(p, { seed: sd + 140 + i, t }) + ' '; rr += inkPath(p, { w: 5.5, seed: sd + 150 + i, t }) + ' ';
          });
          rocksF.setAttribute('d', rf);
          let wf = '', wr = '';
          weeds.forEach((w, i) => {
            const pts2 = [];
            for (let k = 0; k <= 5; k++) { const u = k / 5; pts2.push([w.x + Math.sin(t * 1.4 + w.ph + u * 2.4) * 22 * u, by - w.h * u]); }
            wr += inkPath(pts2, { w: 6, seed: sd + 170 + i, t, amp: 1, taper: 0.6 }) + ' ';
            const leaf = pts2[3];
            wf += inkDot(leaf[0] + 14, leaf[1], 16, 8, sd + 180 + i, t) + ' ';
          });
          weed.setAttribute('d', wf); weedR.setAttribute('d', wr + rr);
        }
      },
    };
  }

  // ------------------------------------------------------------------ arrow, finger, ship
  function arrow(parent, sd) {
    const e = inkEl(parent);
    return {
      update(t, A, B, p, color) {
        if (color) e.setAttribute('fill', color);
        if (p <= 0.01) { e.setAttribute('d', ''); return; }
        const mx = (A[0] + B[0]) / 2 + (B[1] - A[1]) * 0.12, my = (A[1] + B[1]) / 2 - (B[0] - A[0]) * 0.12;
        const E = [lerp(A[0], B[0], p), lerp(A[1], B[1], p)], M = [lerp(A[0], mx, p), lerp(A[1], my, p)];
        const a = Math.atan2(E[1] - M[1], E[0] - M[0]), h = 34;
        let d = inkPath([A, M, E], { w: 7, seed: sd + 1, t, amp: 1 });
        if (p > 0.6) d += ' ' + inkPath([[E[0] - Math.cos(a - 0.5) * h, E[1] - Math.sin(a - 0.5) * h], E, [E[0] - Math.cos(a + 0.5) * h, E[1] - Math.sin(a + 0.5) * h]], { w: 7, seed: sd + 2, t, amp: 1, smooth: false });
        e.setAttribute('d', d);
      },
    };
  }
  function finger(parent, sd) {
    // side view of an index finger pointing left: rounded fleshy tip, nail plate with cuticle on top near the tip,
    // two knuckle creases (wrinkle groups), slightly wider toward the hand which runs off to the right
    const g = el(parent, 'g'), f = inkEl(g, INK.paperLight), sh = inkEl(g, INK.stain, { 'fill-opacity': 0.35 }), r_ = inkEl(g);
    const nail = inkEl(g, INK.paperLight), nailT = inkEl(g, INK.red, { 'fill-opacity': 0.12 }), nr = inkEl(g), cr = inkEl(g, INK.inkSoft);
    return {
      update(t, o = {}) {
        xf(g, Object.assign({}, o, { face: 1 }));
        const S = k => sd * 30 + k;
        const top = [[600, -86], [420, -80], [260, -72], [110, -66], [44, -58], [10, -36], [0, -6]];
        const bot = [[0, -6], [8, 26], [40, 48], [110, 56], [260, 64], [420, 74], [600, 82]];
        const shape = top.concat(bot.slice(1));
        f.setAttribute('d', inkLoop(shape, { seed: S(1), t }));
        sh.setAttribute('d', inkLoop([[30, 30], [110, 44], [420, 62], [600, 70], [600, 82], [420, 74], [110, 56], [40, 48]], { seed: S(9), t }));
        r_.setAttribute('d', inkPath(shape, { w: 7, seed: S(2), t }));
        const n = [[28, -52], [70, -66], [150, -70], [168, -60], [160, -44], [70, -40], [34, -42]];
        nail.setAttribute('d', inkLoop(n, { seed: S(3), t }));
        nailT.setAttribute('d', inkLoop(n, { seed: S(3), t }));
        nr.setAttribute('d', inkPath(n, { w: 4.5, seed: S(4), t, closed: true }) + ' ' +
          inkPath([[150, -68], [140, -56], [148, -44]], { w: 3.4, seed: S(5), t, amp: 0.6 }));
        let c = '';
        [[250, 3], [470, 3]].forEach(([x, n2], j) => {
          for (let k = 0; k < n2; k++) {
            const xx = x + k * 16;
            c += inkPath([[xx + 8, -60], [xx - 4, -20], [xx - 6, 10]], { w: 3.6, seed: S(10 + j * 5 + k), t, amp: 0.7, taper: 0.7 }) + ' ';
          }
        });
        c += inkPath([[60, 40], [180, 50]], { w: 3, seed: S(30), t, amp: 0.6, taper: 0.7 });
        cr.setAttribute('d', c);
      },
    };
  }
  // small prey fish, side view, facing left by default; stun 0..1 flips it belly-up with X eyes and dizzy stars
  function fish(parent, sd) {
    const g = el(parent, 'g'), body = inkEl(g, INK.paperLight), tint = inkEl(g, INK.blue, { 'fill-opacity': 0.3 }), r_ = inkEl(g), eye = inkEl(g);
    const stars = inkEl(parent, INK.gold), starsR = inkEl(parent);
    return {
      update(t, o = {}) {
        const st = clamp01(o.stun ?? 0), s = o.s ?? 1;
        xf(g, { x: o.x, y: o.y, s, face: o.face ?? 1, rot: (o.rot ?? 0) + st * 170 });
        const S = k => sd * 30 + k, wag = Math.sin(t * 9) * 14 * (1 - st);
        const b = [[-120, 0], [-60, -52], [40, -50], [100, -14], [110, 0], [100, 14], [40, 50], [-60, 50]];
        const tl = [[100, 0], [170, -50 + wag], [160, 0], [170, 50 + wag]];
        body.setAttribute('d', inkLoop(b, { seed: S(1), t }) + ' ' + inkLoop(tl, { seed: S(2), t, smooth: false }));
        tint.setAttribute('d', inkLoop(b, { seed: S(1), t }));
        r_.setAttribute('d', inkPath(b, { w: 6, seed: S(3), t, closed: true }) + ' ' + inkPath(tl, { w: 6, seed: S(4), t, closed: true, smooth: false }) + ' ' +
          inkPath([[-20, -48], [10, -78], [50, -50]], { w: 5, seed: S(5), t }) + ' ' + inkPath([[-40, -30], [-30, 30]], { w: 4, seed: S(6), t, amp: 0.8 }) + ' ' +
          inkPath([[-118, 10], [-96, 14]], { w: 4, seed: S(7), t, amp: 0.6 }));
        eye.setAttribute('d', st < 0.5 ? inkDot(-78, -14, 9, 9, S(8), t) :
          inkPath([[-88, -24], [-68, -4]], { w: 5, seed: S(9), t, amp: 0.5 }) + ' ' + inkPath([[-68, -24], [-88, -4]], { w: 5, seed: S(10), t, amp: 0.5 }));
        let sf = '', sr = '';
        if (st > 0.5) for (let k = 0; k < 3; k++) {
          const a = t * 4 + k * 2.1, cx = (o.x ?? 0) + Math.cos(a) * 90 * s, cy = (o.y ?? 0) - 110 * s + Math.sin(a) * 26 * s, pts = [];
          for (let q = 0; q < 10; q++) { const an = q / 10 * Math.PI * 2, rr = (q % 2 ? 9 : 22) * s; pts.push([cx + Math.cos(an) * rr, cy + Math.sin(an) * rr]); }
          sf += inkLoop(pts, { seed: S(20 + k), t, smooth: false }) + ' '; sr += inkPath(pts, { w: 3.4, seed: S(25 + k), t, closed: true, smooth: false }) + ' ';
        }
        stars.setAttribute('d', sf); starsR.setAttribute('d', sr);
      },
    };
  }
  function ship(parent, sd) {
    const g = el(parent, 'g'), f = inkEl(g, INK.paperDark), r_ = inkEl(g), sm = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.6 });
    return {
      update(t, o = {}) {
        xf(g, Object.assign({}, o, { rot: Math.sin(t * 1.3) * 2 }));
        const S = k => sd * 30 + k;
        const hull = [[-260, -40], [250, -40], [210, 20], [-230, 20]];
        const deck = [[-120, -40], [-110, -90], [40, -90], [50, -40]];
        const st = [[-40, -90], [-30, -150], [10, -150], [16, -90]];
        f.setAttribute('d', [hull, deck, st].map((p, k) => inkLoop(p, { seed: S(k), t, smooth: false })).join(' '));
        r_.setAttribute('d', [hull, deck, st].map((p, k) => inkPath(p, { w: 6, seed: S(5 + k), t, closed: true, smooth: false })).join(' ') + ' ' +
          inkPath([[100, -40], [100, -130]], { w: 5, seed: S(9), t }) + ' ' + inkPath([[150, -60], [210, -70]], { w: 6, seed: S(10), t }));
        let sd2 = '';
        for (let k = 0; k < 3; k++) { const u = (t * 0.5 + k / 3) % 1; sd2 += inkDot(-10 - u * 120, -170 - u * 90, 16 + u * 22, 12 + u * 16, S(20 + k), t) + ' '; }
        sm.setAttribute('d', sd2);
      },
    };
  }

  window.SHR = { f1, ell, toWorld, shrimp, sub, bubble, burst, jet, water, arrow, finger, ship, fish };
})();
