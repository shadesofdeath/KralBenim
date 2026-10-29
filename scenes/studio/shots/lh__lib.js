// lh__lib: shared drawing helpers for the lh_* shots (learned helplessness: Seligman & Maier's 1967 shuttle-box dogs and
// the 2016 reversal). Not a shot type. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*),
// every line boils at 8 Hz via _ink.js, everything is a pure function of (seed, t); no Math.random.
// window.LH = {
//   atOr(cues, name|sec, fb), f1, faceOf, dirOf, blank, txt(parent, attrs)
//   dog(parent, seed, o) -> {update(t, x, gy, s, st)}: a cute hand-drawn mongrel in side view (floppy dark ear, back
//     patch, red collar, curled tail, black nose). ~420 units long, ground at y = 0, nose at +x when face = 1.
//     st: {pose: "stand"|"lie"|"flinch"|"sit"|"jump"|"run", ph (run phase), face: 1|-1, prev: pose, mix: 0..1,
//          wag: 0..1, sway: 0..1 (slow tail sway), ground: y of the shadow (default gy), eye: override 0..1.4,
//          ear: add 0..1, shake: 0..1, brow: override (1 = worried, inner end up), smile: override -1..1}
//     -> {head: [x, y], nose: [x, y], body: [x, y]}
//   zap(parent, seed) -> {update(t, x, y, size, k, i)}: a small gold zig-zag shock mark that flickers (no pain shown)
//   shuttle(backParent, frontParent, seed) -> {update(t, o)}: the two-compartment shuttle box, seen slightly from the
//     front-left and above: back wall, grid floor (left half cool, right half lit), the low middle barrier, end walls,
//     a low front rim (front group, drawn over the dog's paws) and a hanging lamp over the right half.
//     o: {x0, x1, wt (back wall top), fb (floor back y), ff (floor front y), dx (depth shift, 44), bh (barrier height),
//         rim: 64, light: 0..1, lamp: true, lampY} -> {xm, bar: [[x, y] top front, [x, y] top back], floorL, floorR (centre
//         points of each half), gy (bottom of the front rim)}
//   board(parent, seed) -> {update(t, xm, gy, bh, dx, dep, bw)}: the shuttle box's low barrier standing on its own
//   person(parent, seed, o) -> {update(t, x, gy, s, pose)}: hatless figure; o: {kind: "lab" (white lab coat, pen in the
//     pocket, tie) | "sweater" (o.col), hair: "dark"|"white", glasses: true}; pose: {face, lean, armL, armR (targets, stage px),
//     seat: y | null (sitting), droop: 0..1 (head hangs), brow: -1..1 (1 = raised), look: [dx, dy], mouth: 0..1}
//     -> {hc, hL, hR, sh}
//   kasif(parent, K, W, H, seed) -> {update(lt, t, cues)}: Kaşif with K = {x, y (0..1), scale, pose, face, dir,
//     emotion, seq: [{at, pose, dir, face, emotion}]}
//   label(parent, o, W, H) -> {update(lt, t, cues)}: hand-written label (Patrick Hand), o: {text, x, y (0..1), size,
//     color: ink|red|gold|blue|paper, rot, at, underline, card, bold, hit, font: "hand"|"serif"}
//   clock(parent, seed) -> {update(t, x, y, r, a)}: wall clock, a = minute-hand angle in turns
//   calendar(parent, seed) -> {update(t, x, y, w, h, text, fly)}: tear-off wall calendar with a big year; fly: 0..1 phase
//     of leaves flying off (0 = none)
//   lamp(parent, seed) -> {update(t, x, y, k, floorY, spread)}: a hanging enamel lamp with a soft light cone
//   front(parent, seed, kind) -> {update(t, W, H, top, o)}: a foreground layer down to the frame bottom: "cart" (shock
//     generator on a trolley, cropped), "bench" (lab bench with glassware), "desk" (wooden desk front with books and a
//     mug), "grass" (big grass blades and flowers), "papers" (crumpled papers and a wastebasket)
// }
'use strict';

(() => {
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const R2 = (v, a) => { const c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const txt = (parent, a = {}) => el(parent, 'text', Object.assign({ 'text-anchor': 'middle' }, a));
  const SERIF = 'Fraunces, Georgia, serif';
  const lerpA = (a, b, p) => Array.isArray(a) ? a.map((v, i) => lerpA(v, b[i], p)) : (a && typeof a === 'object') ? Object.fromEntries(Object.keys(a).map(k => [k, lerpA(a[k], b[k], p)])) : lerp(a, b, p);
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // ------------------------------------------------------------------ the dog
  // pose numbers, face right, ground y = 0. legs: [attach, paw]; tail: 3 points; ear: 0 hanging .. 1 flapped back
  const DOGP = {
    stand: () => ({ bc: [0, -150], rx: 122, ry: 54, tilt: 0, hc: [170, -224], ht: 0,
      fN: [[88, -128], [104, 0]], fF: [[112, -128], [132, 0]], bN: [[-86, -128], [-98, 0]], bF: [[-62, -128], [-70, 0]],
      tail: [[-116, -168], [-160, -214], [-150, -258]], ear: 0.2, eye: 1, brow: 0.2, tongue: 0, smile: 0 }),
    lie: () => ({ bc: [0, -50], rx: 128, ry: 44, tilt: 0, hc: [176, -56], ht: 10,
      fN: [[92, -30], [220, -10]], fF: [[108, -36], [236, -13]], bN: [[-72, -38], [-18, -9]], bF: [[-52, -50], [4, -14]],
      tail: [[-122, -44], [-184, -20], [-228, -10]], ear: 0, eye: 0.32, brow: 1, tongue: 0, smile: -1 }),
    flinch: () => ({ bc: [-6, -136], rx: 120, ry: 56, tilt: 4, hc: [168, -250], ht: -14,
      fN: [[86, -116], [126, 0]], fF: [[108, -116], [148, 0]], bN: [[-86, -116], [-122, 0]], bF: [[-62, -116], [-96, 0]],
      tail: [[-116, -146], [-140, -108], [-124, -76]], ear: 0.75, eye: 1.35, brow: 1, tongue: 0, smile: -0.6 }),
    sit: () => ({ bc: [-34, -116], rx: 112, ry: 54, tilt: -38, hc: [86, -268], ht: -6,
      fN: [[44, -120], [60, 0]], fF: [[66, -120], [82, 0]], bN: [[-70, -66], [-14, -6]], bF: [[-52, -80], [0, -10]],
      tail: [[-120, -40], [-188, -16], [-236, -36]], ear: 0.35, eye: 1, brow: 0, tongue: 1, smile: 1 }),
    jump: () => ({ bc: [0, -150], rx: 124, ry: 52, tilt: -10, hc: [178, -214], ht: -10,
      fN: [[90, -138], [210, -124]], fF: [[106, -138], [226, -108]], bN: [[-88, -138], [-218, -112]], bF: [[-70, -138], [-202, -96]],
      tail: [[-118, -166], [-180, -180], [-226, -170]], ear: 1, eye: 1.25, brow: 0, tongue: 0.8, smile: 1 }),
  };
  const RUN_G = { fN: [[88, -124], [22, -8]], fF: [[106, -124], [44, -4]], bN: [[-86, -124], [-8, -4]], bF: [[-70, -124], [14, -8]] };
  const RUN_E = { fN: [[88, -124], [196, -26]], fF: [[106, -124], [214, -14]], bN: [[-86, -124], [-198, -18]], bF: [[-70, -124], [-182, -8]] };
  function dogPose(name, t, ph) {
    if (name === 'run') {
      const p = DOGP.jump(), q = 0.5 + 0.5 * Math.sin(ph * Math.PI * 2);
      for (const k of ['fN', 'fF', 'bN', 'bF']) p[k] = lerpA(RUN_G[k], RUN_E[k], q);
      p.bc = [0, -140 - 14 * Math.abs(Math.sin(ph * Math.PI * 2))]; p.tilt = -6 + 8 * Math.cos(ph * Math.PI * 2);
      p.hc = [176, -206 - 10 * Math.sin(ph * Math.PI * 2)];
      return p;
    }
    return (DOGP[name] || DOGP.stand)();
  }
  const HEAD = [[-46, -8], [-40, -36], [-12, -50], [22, -44], [42, -24], [70, -14], [90, -2], [93, 14], [80, 27], [50, 33], [14, 40], [-24, 34], [-44, 16]];
  const EAR = [[0, 0], [-20, 8], [-30, 46], [-20, 80], [-2, 74], [8, 32]];
  function dog(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const coat = INK.paperLight, patchC = mix(INK.stain, INK.inkSoft, 0.2), earC = mix(INK.stain, INK.ink, 0.5);
    const farCol = mix(coat, INK.paperDark, 0.75);
    const shadow = inkEl(g, INK.ink, { 'fill-opacity': 0.14 });
    const legFarO = inkEl(g), legFarI = inkEl(g, farCol), pawFar = inkEl(g, farCol), pawFarR = inkEl(g);
    const earFar = inkEl(g, mix(earC, INK.ink, 0.35));
    const tailO = inkEl(g), tailI = inkEl(g, coat);
    const neckO = inkEl(g);
    const body = inkEl(g, coat), patch = inkEl(g, patchC), bodyR = inkEl(g), neckI = inkEl(g, coat);
    const legNearO = inkEl(g), legNearI = inkEl(g, coat), paws = inkEl(g, coat), pawsR = inkEl(g), toes = inkEl(g);
    const head = inkEl(g, coat), headR = inkEl(g), cheek = inkEl(g, patchC, { 'fill-opacity': 0.55 });
    const collar = inkEl(g, INK.red), tag = inkEl(g, INK.gold);
    const tongue = inkEl(g, INK.red), ear = inkEl(g, earC), earR = inkEl(g);
    const face = inkEl(g), nose = inkEl(g), shine = inkEl(g, INK.paperLight);
    function update(t, x, gy, s, st = {}) {
      const k = seed * 53, fc = st.face ?? 1;
      let p = dogPose(st.pose || 'stand', t, st.ph ?? t * 1.6);
      if (st.prev && st.mix != null && st.mix < 1) p = lerpA(dogPose(st.prev, t, st.ph ?? t * 1.6), p, smooth01(st.mix));
      const br = Math.sin(t * 2.3 + seed) * (st.pose === 'lie' ? 0.05 : 0.025);
      const shake = (st.shake || 0) * Math.sin(t * 40) * 4;
      const T = q => [x + fc * (q[0] + shake) * s, gy + q[1] * s];
      // body ellipse (tilted about its centre), breathing
      const A = p.tilt * Math.PI / 180, ry = p.ry * (1 + br);
      const BP = a => { const v = R2([Math.cos(a) * p.rx, Math.sin(a) * ry], A); return [p.bc[0] + v[0], p.bc[1] + v[1]]; };
      const bodyPts = []; for (let i = 0; i < 16; i++) bodyPts.push(T(BP(i / 16 * Math.PI * 2)));
      body.setAttribute('d', inkLoop(bodyPts, { seed: k + 1, t, amp: 0.8 }));
      bodyR.setAttribute('d', inkPath(bodyPts, { w: 6, seed: k + 2, t, closed: true, amp: 0.8 }));
      const pp = []; for (let i = 0; i <= 6; i++) pp.push(T(BP(Math.PI * (1.12 + i * 0.07))));
      for (let i = 6; i >= 0; i--) { const q = BP(Math.PI * (1.12 + i * 0.07)); pp.push(T([lerp(q[0], p.bc[0] - 20, 0.42), lerp(q[1], p.bc[1], 0.42)])); }
      patch.setAttribute('d', inkLoop(pp, { seed: k + 3, t, amp: 0.8 }));
      // legs: thick outlined strokes with a joint; back legs bend backwards (hock)
      const leg = (L, back) => { const a = L[0], b = L[1], m = [lerp(a[0], b[0], 0.5) + (back ? -14 : 8), lerp(a[1], b[1], 0.5)]; return [T(a), T(m), T(b)]; };
      const lfF = leg(p.fF, false), lbF = leg(p.bF, true), lfN = leg(p.fN, false), lbN = leg(p.bN, true);
      legFarO.setAttribute('d', inkPath(lfF, { w: 30 * s + 4, seed: k + 10, t, taper: 0 }) + ' ' + inkPath(lbF, { w: 34 * s + 4, seed: k + 11, t, taper: 0 }));
      legFarI.setAttribute('d', inkPath(lfF, { w: 30 * s - 6, seed: k + 12, t, taper: 0, amp: 0.6 }) + ' ' + inkPath(lbF, { w: 34 * s - 6, seed: k + 13, t, taper: 0, amp: 0.6 }));
      legNearO.setAttribute('d', inkPath(lfN, { w: 32 * s + 4, seed: k + 14, t, taper: 0 }) + ' ' + inkPath(lbN, { w: 36 * s + 4, seed: k + 15, t, taper: 0 }));
      legNearI.setAttribute('d', inkPath(lfN, { w: 32 * s - 6, seed: k + 16, t, taper: 0, amp: 0.6 }) + ' ' + inkPath(lbN, { w: 36 * s - 6, seed: k + 17, t, taper: 0, amp: 0.6 }));
      const paw = (q, i) => { const c = [q[2][0] + fc * 6 * s, q[2][1] - 2 * s]; return inkDot(c[0], c[1], 22 * s, 12 * s, k + 20 + i, t); };
      const pawR = (q, i) => { const c = [q[2][0] + fc * 6 * s, q[2][1] - 2 * s]; return inkCircle(c[0], c[1], 22 * s, k + 24 + i, t, { ry: 12 * s, w: 4.5 }); };
      pawFar.setAttribute('d', paw(lfF, 0) + ' ' + paw(lbF, 1)); pawFarR.setAttribute('d', pawR(lfF, 0) + ' ' + pawR(lbF, 1));
      paws.setAttribute('d', paw(lfN, 2) + ' ' + paw(lbN, 3)); pawsR.setAttribute('d', pawR(lfN, 2) + ' ' + pawR(lbN, 3));
      toes.setAttribute('d', [lfN, lbN].map((q, i) => { const c = [q[2][0] + fc * 16 * s, q[2][1] - 2 * s]; return inkPath([[c[0], c[1] - 8 * s], [c[0], c[1] + 4 * s]], { w: 3, seed: k + 28 + i, t, amp: 0.4 }); }).join(' '));
      // tail (wags)
      const wag = (st.wag || 0) * Math.sin(t * 14) * 30 + (st.sway || 0) * Math.sin(t * 2.2 + seed) * 22;
      const tp = [p.tail[0], [p.tail[1][0], p.tail[1][1] + wag * 0.4], [p.tail[2][0] + wag * 0.3, p.tail[2][1] + wag]].map(T);
      tailO.setAttribute('d', inkPath(tp, { w: 22 * s + 4, seed: k + 30, t, taper: 0.5 }));
      tailI.setAttribute('d', inkPath(tp, { w: 22 * s - 6, seed: k + 31, t, taper: 0.5, amp: 0.6 }));
      // neck: from the body's front top to under the head
      const nf = BP(-0.35), nA = T([nf[0] - 10, nf[1] + 8]), nB = T([p.hc[0] - 14, p.hc[1] + 16]);
      neckO.setAttribute('d', inkPath([nA, nB], { w: 76 * s + 6, seed: k + 34, t, taper: 0 }));
      neckI.setAttribute('d', inkPath([nA, nB], { w: 76 * s - 6, seed: k + 35, t, taper: 0, amp: 0.6 }));
      // head
      const HA = p.ht * Math.PI / 180, H = q => { const v = R2(q, HA); return T([p.hc[0] + v[0], p.hc[1] + v[1]]); };
      const hp = HEAD.map(H);
      head.setAttribute('d', inkLoop(hp, { seed: k + 40, t, amp: 0.7 }));
      headR.setAttribute('d', inkPath(hp, { w: 6, seed: k + 41, t, closed: true, amp: 0.7 }));
      const ch = H([28, 14]); cheek.setAttribute('d', inkDot(ch[0], ch[1], 14 * s, 8 * s, k + 42, t));
      // collar
      const c0 = [lerp(nA[0], nB[0], 0.62), lerp(nA[1], nB[1], 0.62)], dv = [nB[0] - nA[0], nB[1] - nA[1]], dl = Math.hypot(dv[0], dv[1]) || 1, nn = [-dv[1] / dl, dv[0] / dl];
      const cw = 40 * s;
      collar.setAttribute('d', inkPath([[c0[0] + nn[0] * cw, c0[1] + nn[1] * cw], [c0[0] - nn[0] * cw, c0[1] - nn[1] * cw]], { w: 16 * s + 3, seed: k + 43, t, taper: 0 }));
      const tg = [c0[0] - nn[0] * cw * Math.sign(nn[1] || 1) * 0.9, c0[1] + Math.abs(nn[1]) * cw * 0.9 + 10 * s];
      tag.setAttribute('d', inkCircle(tg[0], tg[1], 9 * s + 1, k + 44, t, { fill: true }));
      // ear: hanging .. flapped back
      const ea = clamp01(p.ear + (st.ear || 0)) * 100 * Math.PI / 180, ePivot = [-26, -34];
      const earPts = EAR.map(q => { const v = R2(q, ea); return H([ePivot[0] + v[0], ePivot[1] + v[1]]); });
      ear.setAttribute('d', inkLoop(earPts, { seed: k + 50, t, amp: 0.7 }));
      earR.setAttribute('d', inkPath(earPts, { w: 4.5, seed: k + 51, t, closed: true, amp: 0.7 }));
      const earFP = EAR.map(q => { const v = R2([q[0] * 0.8, q[1] * 0.8], ea * 0.8 + 0.2); return H([ePivot[0] + 24 + v[0], ePivot[1] - 4 + v[1]]); });
      earFar.setAttribute('d', inkLoop(earFP, { seed: k + 52, t, amp: 0.7 }));
      // face: eye (blinks), brow, mouth, nose
      const blinkPh = (t + seed * 0.7) % 3.4, blink = blinkPh < 0.14 ? 0.1 : 1;
      const eo = (st.eye ?? p.eye) * blink, E = H([26, -16]);
      const F = [];
      if (eo > 0.6) { F.push(inkDot(E[0] + 2 * s, E[1], 7 * s * eo + 1.5, 8 * s * eo + 1.5, k + 60, t)); if ((st.brow ?? p.brow) > 0.9) F.push(inkPath([H([10, -15]), H([24, -24]), H([40, -27])], { w: 3.5, seed: k + 67, t, amp: 0.3 })); }
      else {   // half-closed: a lid line over a small dot (sleepy / sad)
        F.push(inkDot(E[0], E[1] + 3 * s, 6 * s + 1, 4 * s * Math.max(0.3, eo) + 1, k + 60, t));
        F.push(inkPath([H([14, -18]), H([26, -21]), H([38, -17])], { w: 4, seed: k + 61, t, amp: 0.4 }));
      }
      const bw = st.brow ?? p.brow;
      F.push(bw > 1 ? inkPath([H([8, -24 + bw * 4]), H([22, -34]), H([38, -38 - bw * 9])], { w: 4.5, seed: k + 62, t, amp: 0.4 }) : inkPath([H([10, -30 + bw * 4]), H([36, -34 - bw * 8])], { w: 4.5, seed: k + 62, t, amp: 0.4 }));
      const sm = st.smile ?? p.smile;
      F.push(inkPath([H([84, 26]), H([66, 30 - sm * 4]), H([50, 24 + sm * 6])], { w: 4, seed: k + 63, t, amp: 0.4 }));
      face.setAttribute('d', F.join(' '));
      const N = H([88, 1]);
      nose.setAttribute('d', inkDot(N[0], N[1], 13 * s + 1, 10 * s + 1, k + 64, t));
      shine.setAttribute('d', inkDot(N[0] - fc * 3 * s, N[1] - 4 * s, 3.5 * s + 0.5, 2.5 * s + 0.5, k + 65, t));
      const tq = p.tongue;
      tongue.setAttribute('d', tq > 0.05 ? inkLoop([H([62, 28]), H([76, 28]), H([74, 28 + 30 * tq]), H([62, 30 + 26 * tq])], { seed: k + 66, t, amp: 0.5 }) : '');
      // ground shadow
      const sg = st.ground ?? gy, lift = clamp01((sg - (gy + p.bc[1] * s)) / (300 * s) - 0.3);
      shadow.setAttribute('d', inkCircle(x + fc * (p.bc[0] + 30) * s, sg + 4 * s, (170 - 60 * lift) * s, k + 70, t, { ry: 15 * s, fill: true }));
      return { head: T(p.hc), nose: N, body: T(p.bc), eye: E };
    }
    return { g, update };
  }
  function smooth01(x) { x = clamp01(x); return x * x * (3 - 2 * x); }

  // ------------------------------------------------------------------ zig-zag shock mark (no pain shown)
  function zap(parent, seed) {
    const g = el(parent, 'g');
    const f = inkEl(g, INK.gold), r = inkEl(g);
    function update(t, x, y, sz, k = 1, i = 0) {
      const on = k > 0.02 && ((t * 5 + i * 0.37 + seed * 0.13) % 1) < 0.55;
      if (!on) { blank(f, r); return; }
      const a = (i * 47 + seed * 13) % 360 * Math.PI / 180 * 0.3 - 0.15;
      const Z = [[-0.1, -1], [0.45, -1], [0.12, -0.25], [0.5, -0.25], [-0.3, 1], [-0.02, 0.12], [-0.42, 0.12]].map(q => { const v = R2([q[0] * sz * 0.9, q[1] * sz], a); return [x + v[0], y + v[1]]; });
      f.setAttribute('d', inkLoop(Z, { seed: seed + i, t, amp: 0.6, smooth: false }));
      r.setAttribute('d', inkPath(Z, { w: 3.5, seed: seed + i + 9, t, closed: true, amp: 0.6, smooth: false }));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ hanging lamp
  function lamp(parent, seed) {
    const g = el(parent, 'g');
    const cone = inkEl(g, INK.paperLight, { 'fill-opacity': 0.3 }), pool = inkEl(g, INK.gold, { 'fill-opacity': 0.22 });
    const cord = inkEl(g), shade = inkEl(g, mix(INK.inkSoft, INK.blue, 0.3)), shadeR = inkEl(g), bulb = inkEl(g, INK.gold), halo = inkEl(g, INK.gold, { 'fill-opacity': 0.3 });
    function update(t, x, y, k = 1, floorY = y + 400, spread = 200) {
      const sw = Math.sin(t * 0.9 + seed) * 6;
      const sx = x + sw;
      cord.setAttribute('d', inkPath([[x, -40], [sx, y - 40]], { w: 4, seed: seed + 1, t }));
      const sp = [[sx - 22, y - 42], [sx + 22, y - 42], [sx + 70, y + 20], [sx - 70, y + 20]];
      shade.setAttribute('d', inkLoop(sp, { seed: seed + 2, t, smooth: false, amp: 0.8 }));
      shadeR.setAttribute('d', inkPath(sp, { w: 5, seed: seed + 3, t, closed: true, smooth: false, amp: 0.8 }));
      bulb.setAttribute('d', inkCircle(sx, y + 24, 18, seed + 4, t, { fill: true }));
      const fl = k * (0.92 + 0.08 * Math.sin(t * 7 + seed));
      halo.setAttribute('fill-opacity', (0.3 * fl).toFixed(3));
      halo.setAttribute('d', k > 0.02 ? inkCircle(sx, y + 24, 44, seed + 5, t, { fill: true }) : '');
      cone.setAttribute('fill-opacity', (0.32 * fl).toFixed(3));
      cone.setAttribute('d', k > 0.02 ? inkLoop([[sx - 60, y + 22], [sx + 60, y + 22], [sx + spread, floorY], [sx - spread, floorY]], { seed: seed + 6, t, smooth: false, amp: 1 }) : '');
      pool.setAttribute('fill-opacity', (0.24 * fl).toFixed(3));
      pool.setAttribute('d', k > 0.02 ? inkCircle(sx, floorY, spread * 1.05, seed + 7, t, { ry: 34, fill: true }) : '');
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ the shuttle box
  function shuttle(backP, frontP, seed) {
    const B = el(backP, 'g'), Fg = el(frontP, 'g');
    const wood = mix(INK.stain, INK.paperDark, 0.35), woodD = mix(INK.stain, INK.ink, 0.3);
    const wall = inkEl(B, mix(INK.paperLight, INK.gold, 0.22)), wallL = inkEl(B, mix(INK.inkSoft, INK.blue, 0.25)), wallR = inkEl(B);
    const floorL = inkEl(B, mix(INK.inkSoft, INK.ink, 0.25)), floorR = inkEl(B, mix(INK.paperLight, INK.gold, 0.3)), glowR = inkEl(B, INK.gold, { 'fill-opacity': 0.3 }), rods = inkEl(B), floorRim = inkEl(B);
    const lmp = lamp(B, seed + 300);
    const endL = inkEl(B, wood), endLR = inkEl(B);
    const barS = inkEl(B, wood), barT = inkEl(B, mix(wood, INK.paperLight, 0.4)), barR = inkEl(B), barGrain = inkEl(B, woodD);
    const endR = inkEl(Fg, wood), endRR = inkEl(Fg);
    const rim = inkEl(Fg, wood), rimR = inkEl(Fg), rimG = inkEl(Fg, woodD), bolts = inkEl(Fg, INK.ink);
    function update(t, o) {
      const k = seed * 31, x0 = o.x0, x1 = o.x1, wt = o.wt, fb = o.fb, ff = o.ff, dx = o.dx ?? 44, bh = o.bh ?? 110, rh = o.rim ?? 64;
      const xm = o.xm ?? (x0 + x1) / 2, bw = o.bw ?? 16;
      // back wall (two tones: the left half in shade)
      wall.setAttribute('d', inkLoop(rect(xm + dx, wt, x1 + dx, fb), { seed: k + 1, t, smooth: false, amp: 1 }));
      wallL.setAttribute('d', inkLoop(rect(x0 + dx, wt, xm + dx, fb), { seed: k + 2, t, smooth: false, amp: 1 }));
      const WL = [inkPath(rect(x0 + dx, wt, x1 + dx, fb), { w: 6, seed: k + 3, t, closed: true, smooth: false })];
      for (let i = 1; i < 4; i++) { const y = lerp(wt, fb, i / 4); WL.push(inkPath([[x0 + dx + 8, y], [x1 + dx - 8, y + (i % 2 ? 2 : -2)]], { w: 2.5, seed: k + 4 + i, t })); }
      wallR.setAttribute('d', WL.join(' '));
      // grid floor: front edge x0..x1 at ff, back edge shifted by dx at fb
      floorL.setAttribute('d', inkLoop([[x0, ff], [xm, ff], [xm + dx, fb], [x0 + dx, fb]], { seed: k + 10, t, smooth: false, amp: 0.8 }));
      floorR.setAttribute('d', inkLoop([[xm, ff], [x1, ff], [x1 + dx, fb], [xm + dx, fb]], { seed: k + 11, t, smooth: false, amp: 0.8 }));
      const RD = [];
      const n = 22;
      for (let i = 1; i < n; i++) { const u = i / n, xf = lerp(x0, x1, u); if (Math.abs(xf - xm) < 14) continue; RD.push(inkPath([[xf, ff - 2], [xf + dx, fb + 2]], { w: 2.6, seed: k + 20 + i, t, amp: 0.6 })); }
      rods.setAttribute('d', RD.join(' '));
      const gc = [lerp(xm, x1, 0.4) + dx * 0.5, (fb + ff) / 2], gw = (x1 - xm) * 0.42 * (1 + 0.03 * Math.sin(t * 1.7));
      glowR.setAttribute('d', inkCircle(gc[0], gc[1], gw, k + 49, t, { ry: (ff - fb) * 0.62, fill: true }));
      floorRim.setAttribute('d', inkPath([[x0 + dx, fb], [x1 + dx, fb]], { w: 4, seed: k + 50, t }));
      // lamp over the right half
      if (o.lamp !== false) lmp.update(t, o.lampX ?? lerp(xm, x1, 0.5) + dx * 0.5, o.lampY ?? wt - 150, o.light ?? 1, lerp(fb, ff, 0.55), (x1 - xm) * 0.42);
      else lmp.update(t, 0, -999, 0);
      // left end wall
      const eh = fb - wt;
      endL.setAttribute('d', inkLoop([[x0, ff + rh * 0.2], [x0, ff - eh], [x0 + dx, wt], [x0 + dx, fb]], { seed: k + 60, t, smooth: false, amp: 0.8 }));
      endLR.setAttribute('d', inkPath([[x0, ff + rh * 0.2], [x0, ff - eh], [x0 + dx, wt], [x0 + dx, fb]], { w: 5, seed: k + 61, t, closed: true, smooth: false, amp: 0.8 }));
      // the barrier: a low board from the front edge to the back wall
      const bs = [[xm, ff], [xm, ff - bh], [xm + dx, fb - bh], [xm + dx, fb]];
      const bt = [[xm - bw, ff - bh], [xm + bw, ff - bh], [xm + dx + bw, fb - bh], [xm + dx - bw, fb - bh]];
      barS.setAttribute('d', inkLoop([[xm - bw, ff], [xm - bw, ff - bh], [xm + bw, ff - bh], [xm + bw, ff]], { seed: k + 70, t, smooth: false, amp: 0.6 }) + ' ' + inkLoop(bs, { seed: k + 71, t, smooth: false, amp: 0.6 }));
      barT.setAttribute('d', inkLoop(bt, { seed: k + 72, t, smooth: false, amp: 0.6 }));
      barR.setAttribute('d', inkPath([[xm - bw, ff], [xm - bw, ff - bh], [xm + bw, ff - bh], [xm + bw, ff]], { w: 4.5, seed: k + 73, t, closed: true, smooth: false }) + ' ' +
        inkPath([[xm + bw, ff - bh], [xm + dx + bw, fb - bh]], { w: 4.5, seed: k + 74, t }) + ' ' + inkPath([[xm - bw, ff - bh], [xm + dx - bw, fb - bh]], { w: 3.5, seed: k + 75, t }));
      barGrain.setAttribute('d', [0.3, 0.55, 0.8].map((q, i) => inkPath([[xm - bw * 0.6, ff - bh * q], [xm + bw * 0.6, ff - bh * q - 3]], { w: 2, seed: k + 76 + i, t })).join(' '));
      // right end wall + front rim (front group: in front of the dog's paws)
      endR.setAttribute('d', inkLoop([[x1, ff + rh], [x1, ff - eh], [x1 + dx, wt], [x1 + dx, fb]], { seed: k + 80, t, smooth: false, amp: 0.8 }));
      endRR.setAttribute('d', inkPath([[x1, ff + rh], [x1, ff - eh], [x1 + dx, wt], [x1 + dx, fb]], { w: 5, seed: k + 81, t, closed: true, smooth: false, amp: 0.8 }));
      const rp = rect(x0 - 6, ff - 14, x1 + 6, ff + rh);
      rim.setAttribute('d', inkLoop(rp, { seed: k + 82, t, smooth: false, amp: 0.8 }));
      rimR.setAttribute('d', inkPath(rp, { w: 6, seed: k + 83, t, closed: true, smooth: false }) + ' ' + inkPath([[xm, ff - 14], [xm, ff + rh]], { w: 4, seed: k + 84, t }));
      const nr = Math.max(6, Math.round(rh / 14)), G = []; for (let i = 0; i < nr; i++) { const y = ff + 4 + i * (rh - 10) / nr; G.push(inkPath([[x0 + 20 + (i * 37) % 60, y], [xm - 30 - (i * 23) % 50, y + 1]], { w: 2, seed: k + 90 + i, t }), inkPath([[xm + 30 + (i * 29) % 40, y], [x1 - 20 - (i * 31) % 60, y - 1]], { w: 2, seed: k + 100 + i, t })); }
      rimG.setAttribute('d', G.join(' '));
      bolts.setAttribute('d', [x0 + 18, xm - 22, xm + 22, x1 - 18].map((bx, i) => inkDot(bx, ff + Math.min(rh * 0.45, 40), 6, 6, k + 110 + i, t) + ' ' + inkDot(bx, ff + rh - 30, 6, 6, k + 120 + i, t)).join(' '));
      return { xm, bar: [[xm, ff - bh], [xm + dx, fb - bh]], floorL: [lerp(x0, xm, 0.5) + dx * 0.5, (fb + ff) / 2], floorR: [lerp(xm, x1, 0.5) + dx * 0.5, (fb + ff) / 2], gy: ff + rh };
    }
    return { update };
  }

  // ------------------------------------------------------------------ hatless figure (lab coat / sweater)
  function person(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const kind = o.kind || 'lab';
    const coatCol = kind === 'lab' ? INK.paperLight : (o.col || mix(INK.blue, INK.inkSoft, 0.35));
    const skin = mix(INK.paperDark, INK.stain, 0.2), trou = mix(INK.ink, INK.inkSoft, 0.35);
    const legsO = P(), legsI = P(trou), shoes = P(INK.ink);
    const armBack = P(coatCol), armBackR = P();
    const coat = P(coatCol), coatR = P(), shirt = P(INK.paperLight), tie = P(INK.red), pocket = P(), pen = P(INK.blue);
    const head = P(skin), headR = P(), hair = P(o.hair === 'white' ? INK.paperLight : INK.ink), hairR = P(), ear = P(skin), face = P(), specs = P();
    const armF = P(coatCol), armFR = P(), hands = P(skin), handsR = P();
    const twoBone = (a, b, l1, l2, bend) => {
      let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
      const mx = l1 + l2 - 1; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
      const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d || 1))));
      return [[a[0] + Math.cos(base + bend * al) * l1, a[1] + Math.sin(base + bend * al) * l1], [a[0] + dx, a[1] + dy]];
    };
    function update(t, x, gy, s, pose = {}) {
      const k = seed * 40, fc = pose.face ?? 1, lean = (pose.lean || 0) * Math.PI / 180, droop = pose.droop || 0;
      const br = Math.sin(t * 2 + seed) * 2 * s;
      const seated = pose.seat != null;
      const hip = seated ? [x, pose.seat] : [x, gy - 190 * s];
      const neck = [hip[0] + Math.sin(lean) * 210 * s * fc, hip[1] - Math.cos(lean) * 210 * s + br];
      const hc = [neck[0] + (Math.sin(lean) * 40 + 6 + droop * 36) * s * fc, neck[1] - (54 - droop * 30) * s];
      // legs
      let LG;
      if (seated) {
        const kn = [x + 92 * s * fc, hip[1] + 4 * s], ft = [x + 96 * s * fc, gy - 8 * s];
        LG = [[hip, kn, ft], [[hip[0] - 10 * s * fc, hip[1]], [kn[0] - 14 * s * fc, kn[1] + 4 * s], [ft[0] - 26 * s * fc, ft[1]]]];
      } else LG = [[hip, [x - 14 * s, gy - 95 * s], [x - 26 * s, gy - 6 * s]], [hip, [x + 14 * s, gy - 95 * s], [x + 26 * s, gy - 6 * s]]];
      legsO.setAttribute('d', LG.map((L, i) => inkPath(L, { w: 30 * s + 6, seed: k + 1 + i, t, taper: 0 })).join(' '));
      legsI.setAttribute('d', LG.map((L, i) => inkPath(L, { w: 30 * s - 4, seed: k + 3 + i, t, taper: 0, amp: 0.6 })).join(' '));
      shoes.setAttribute('d', LG.map((L, i) => inkDot(L[2][0] + 12 * s * fc, L[2][1], 26 * s, 12 * s, k + 5 + i, t)).join(' '));
      // coat (lab coat reaches the knees; on a sitting figure it ends at the seat)
      const sh = [neck[0], neck[1] + 14 * s];
      const hemY = seated ? hip[1] + 10 * s : (kind === 'lab' ? gy - 110 * s : hip[1] + 6 * s);
      const hemX = seated ? hip[0] + 30 * s * fc : hip[0];
      const cp = [[sh[0] - 46 * s, sh[1] + 6 * s], [sh[0] + 46 * s, sh[1] + 6 * s], [hemX + (kind === 'lab' ? 62 : 54) * s, hemY], [hemX - (kind === 'lab' ? 62 : 54) * s, hemY]];
      coat.setAttribute('d', inkLoop(cp, { seed: k + 7, t, amp: 1.2, smooth: false }));
      const CR = [inkPath(cp, { w: 4.5, seed: k + 8, t, closed: true, amp: 1.2, smooth: false })];
      if (kind === 'lab') {
        CR.push(inkPath([[sh[0] - 14 * s * fc, sh[1] + 2 * s], [sh[0] + 4 * s * fc, sh[1] + 70 * s], [lerp(sh[0], hemX, 0.9) + 4 * s * fc, hemY]], { w: 3.5, seed: k + 9, t }));
        CR.push(inkPath([[sh[0] + 16 * s * fc, sh[1] + 2 * s], [sh[0] + 6 * s * fc, sh[1] + 66 * s]], { w: 3.5, seed: k + 10, t }));
        shirt.setAttribute('d', inkLoop([[sh[0] - 12 * s * fc, sh[1] + 2 * s], [sh[0] + 16 * s * fc, sh[1] + 2 * s], [sh[0] + 5 * s * fc, sh[1] + 62 * s]], { seed: k + 11, t, amp: 0.5 }));
        tie.setAttribute('d', inkLoop([[sh[0] + 1 * s * fc, sh[1] + 6 * s], [sh[0] + 9 * s * fc, sh[1] + 6 * s], [sh[0] + 7 * s * fc, sh[1] + 50 * s], [sh[0] + 3 * s * fc, sh[1] + 54 * s]], { seed: k + 12, t, amp: 0.4 }));
        const pk = [sh[0] + 26 * s * fc, sh[1] + 62 * s];
        pocket.setAttribute('d', inkPath([[pk[0] - 16 * s, pk[1]], [pk[0] + 16 * s, pk[1]]], { w: 3.5, seed: k + 13, t }));
        pen.setAttribute('d', inkPath([[pk[0] + 4 * s * fc, pk[1] + 2 * s], [pk[0] + 6 * s * fc, pk[1] - 24 * s]], { w: 6 * s + 1, seed: k + 14, t }));
      } else {
        CR.push(inkPath([[sh[0] - 20 * s, sh[1] + 8 * s], [sh[0] + 20 * s, sh[1] + 8 * s]], { w: 3.5, seed: k + 9, t }));
        CR.push(inkPath([[hemX - 52 * s, hemY - 14 * s], [hemX + 52 * s, hemY - 14 * s]], { w: 3, seed: k + 10, t }));
        blank(shirt, tie, pocket, pen);
      }
      coatR.setAttribute('d', CR.join(' '));
      // arms
      const shL = [sh[0] - 36 * s * fc, sh[1] + 12 * s], shR = [sh[0] + 36 * s * fc, sh[1] + 12 * s];
      const tL = pose.armL || [shL[0] - 10 * s * fc, shL[1] + 170 * s], tR = pose.armR || [shR[0] + 10 * s * fc, shR[1] + 170 * s];
      const [eL, hL] = twoBone(shL, tL, 92 * s, 88 * s, pose.bendL ?? fc);
      const [eR, hR] = twoBone(shR, tR, 92 * s, 88 * s, pose.bendR ?? -fc);
      armBack.setAttribute('d', inkPath([shL, eL, hL], { w: 26 * s, seed: k + 20, t, amp: 1, taper: 0.1 }));
      armBackR.setAttribute('d', inkPath([shL, eL, hL], { w: 4, seed: k + 21, t, amp: 1 }));
      armF.setAttribute('d', inkPath([shR, eR, hR], { w: 28 * s, seed: k + 22, t, amp: 1, taper: 0.1 }));
      armFR.setAttribute('d', inkPath([shR, eR, hR], { w: 4, seed: k + 23, t, amp: 1 }));
      hands.setAttribute('d', inkDot(hL[0], hL[1], 15 * s, 15 * s, k + 24, t) + ' ' + inkDot(hR[0], hR[1], 15 * s, 15 * s, k + 25, t));
      handsR.setAttribute('d', inkCircle(hL[0], hL[1], 15 * s, k + 26, t, { w: 3.5 }) + ' ' + inkCircle(hR[0], hR[1], 15 * s, k + 27, t, { w: 3.5 }));
      // head
      head.setAttribute('d', inkCircle(hc[0], hc[1], 50 * s, k + 30, t, { fill: true }));
      headR.setAttribute('d', inkCircle(hc[0], hc[1], 50 * s, k + 31, t, { w: 5 }));
      ear.setAttribute('d', inkCircle(hc[0] - 12 * s * fc, hc[1] + 4 * s, 11 * s, k + 32, t, { fill: true }) + ' ' + inkCircle(hc[0] - 12 * s * fc, hc[1] + 4 * s, 11 * s, k + 33, t, { w: 3 }));
      const HP = o.hair === 'white'
        ? [[-52, 6], [-54, -20], [-46, -40], [-30, -42], [-22, -30], [-36, -18], [-40, 8]]          // receding white hair: back and side
        : [[-50, -4], [-44, -36], [-10, -56], [34, -46], [46, -26], [4, -36], [-30, -12]];
      const hp = HP.map(q => [hc[0] + q[0] * s * fc, hc[1] + q[1] * s]);
      hair.setAttribute('d', inkLoop(hp, { seed: k + 34, t, amp: 0.8 }));
      hairR.setAttribute('d', o.hair === 'white' ? inkPath(hp, { w: 3.5, seed: k + 35, t, closed: true, amp: 0.8 }) + ' ' +
        inkPath([[hc[0] - 8 * s * fc, hc[1] - 46 * s], [hc[0] + 10 * s * fc, hc[1] - 50 * s]], { w: 3, seed: k + 36, t }) : '');
      const F = [], brow = pose.brow || 0, lk = pose.look || [0, 0];
      const eye = [hc[0] + (20 + lk[0]) * s * fc, hc[1] + (-6 + lk[1] + droop * 6) * s];
      const blink = ((t + seed) % 3.1) < 0.12;
      F.push(blink ? inkPath([[eye[0] - 5 * s, eye[1]], [eye[0] + 5 * s, eye[1]]], { w: 3, seed: k + 37, t }) : inkDot(eye[0], eye[1], 4.5 * s + 1, 4.5 * s + 1, k + 37, t));
      const bl = droop > 0.3 ? 6 : 0;    // sad: outer end low
      F.push(inkPath([[hc[0] + 8 * s * fc, hc[1] - 24 * s - brow * 14 * s + bl * s * 0.4], [hc[0] + 32 * s * fc, hc[1] - 26 * s - brow * 6 * s + bl * s]], { w: 3.5, seed: k + 38, t, amp: 0.5 }));
      if (o.hair === 'white') F.push(inkPath([[hc[0] + 2 * s * fc, hc[1] - 25 * s - brow * 12 * s], [hc[0] + 10 * s * fc, hc[1] - 28 * s - brow * 14 * s]], { w: 3, seed: k + 39, t }));
      const mo = pose.mouth || 0;
      F.push(mo > 0.05 ? inkCircle(hc[0] + 26 * s * fc, hc[1] + 24 * s, 5 * s * mo + 2, k + 40, t, { w: 3 }) :
        inkPath([[hc[0] + 16 * s * fc, hc[1] + 22 * s + droop * 2 * s], [hc[0] + 34 * s * fc, hc[1] + 21 * s + droop * 5 * s]], { w: 3, seed: k + 41, t, amp: 0.4 }));
      F.push(inkPath([[hc[0] + 44 * s * fc, hc[1] + 2 * s], [hc[0] + 52 * s * fc, hc[1] + 10 * s], [hc[0] + 44 * s * fc, hc[1] + 12 * s]], { w: 3, seed: k + 42, t, amp: 0.3 }));   // nose
      face.setAttribute('d', F.join(' '));
      if (o.glasses !== false) {
        const g1 = [eye[0] + 2 * s * fc, eye[1]], g2 = [hc[0] - 6 * s * fc, eye[1]];
        specs.setAttribute('d', inkCircle(g1[0], g1[1], 14 * s, k + 43, t, { w: 3.5 }) + ' ' + inkCircle(g2[0], g2[1], 10 * s, k + 44, t, { w: 3, rx: 7 * s }) + ' ' +
          inkPath([[g1[0] - 14 * s * fc, g1[1] - 2 * s], [g2[0] + 8 * s * fc, g2[1] - 2 * s]], { w: 3, seed: k + 45, t }) + ' ' +
          inkPath([[g2[0] - 8 * s * fc, g2[1] - 2 * s], [hc[0] - 14 * s * fc, hc[1] - 2 * s]], { w: 3, seed: k + 46, t }));
      } else specs.setAttribute('d', '');
      return { hc, hL, hR, sh, neck, hip };
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ Kaşif with a pose sequence
  function kasif(parent, K, W, H, seed) {
    const kas = KASIF.create(el(parent, 'g'), { scale: K.scale ?? 0.8, seed: seed * 3 + 1 });
    function update(lt, t, cues) {
      const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
      (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
      segs.sort((a, b) => a.at - b.at);
      let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
      const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
      const oo = { x: (K.x ?? 0.8) * W, y: (K.y ?? 0.6) * H, face: faceOf(s.face ?? K.face, 1), since, dir: dirOf(s.dir ?? K.dir),
        emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0, item: s.item || K.item, text: s.text || K.text };
      if (pv && since < 0.32) { oo.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; oo.mix = since / 0.32; }
      return kas.update(t, s.pose || 'idle', oo);
    }
    return { update };
  }

  // ------------------------------------------------------------------ hand-written label
  function label(parent, o, W, H) {
    const g = el(parent, 'g');
    const col = o.color === 'red' ? INK.red : o.color === 'blue' ? INK.blue : o.color === 'paper' ? INK.paperLight : o.color === 'gold' ? INK.gold : INK.ink;
    const fam = o.font === 'serif' ? SERIF : INK_FONT, fw = o.font === 'serif' ? 900 : 400, sz = o.size || 64;
    const card = o.card ? inkEl(g, INK.paperLight) : null, cardR = o.card ? inkEl(g) : null;
    const halo = txt(g, { 'font-family': fam, 'font-weight': fw, 'font-size': sz, fill: 'none', stroke: o.halo === 'ink' ? INK.ink : INK.paperLight, 'stroke-width': 12, 'stroke-linejoin': 'round' });
    const tx = txt(g, { 'font-family': fam, 'font-weight': fw, 'font-size': sz, fill: col });
    halo.textContent = tx.textContent = o.text || '';
    if (o.halo === false) halo.textContent = '';
    if (o.bold) { tx.setAttribute('stroke', col); tx.setAttribute('stroke-width', 2.5); }
    const ul = inkEl(g, col);
    function update(lt, t, cues) {
      const a = atOr(cues, o.at, 0.3), p = spring(lt, a, 0.5);
      if (lt < a) { g.setAttribute('transform', 'scale(0)'); return; }
      const x = (o.x ?? 0.5) * W, y = (o.y ?? 0.3) * H;
      const pp = p * (1 + 0.15 * punch(lt, atOr(cues, o.hit, null), 0.7));
      const wob = Math.sin(t * 2.2) * 1.2;
      g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1((o.rot ?? -3) + wob)}) scale(${f1(pp * 100) / 100})`);
      const w = (o.text || '').length * sz * (o.font === 'serif' ? 0.3 : 0.22);
      if (card) { const bx = [[-w * 1.25 - 24, -sz * 0.95], [w * 1.25 + 24, -sz * 0.98], [w * 1.25 + 28, sz * 0.42], [-w * 1.25 - 22, sz * 0.45]]; card.setAttribute('d', inkLoop(bx, { seed: 970 + sz, t, smooth: false, amp: 1 })); cardR.setAttribute('d', inkPath(bx, { w: 5, seed: 971 + sz, t, closed: true, smooth: false, amp: 1 })); }
      ul.setAttribute('d', o.underline === false ? '' : inkPath([[-w, 14], [w, 10]], { w: 5, seed: 900 + (o.text || '').length, t, amp: 1 }));
    }
    return { update };
  }

  // ------------------------------------------------------------------ wall clock
  function clock(parent, seed) {
    const g = el(parent, 'g');
    const face = inkEl(g, INK.paperLight), rim = inkEl(g), ticks = inkEl(g), hands = inkEl(g), red = inkEl(g, INK.red);
    function update(t, x, y, r, a = 0) {
      face.setAttribute('d', inkCircle(x, y, r, seed, t, { fill: true }));
      rim.setAttribute('d', inkCircle(x, y, r, seed + 1, t, { w: 7 }) + ' ' + inkCircle(x, y, r * 0.88, seed + 2, t, { w: 2.5 }));
      const T = []; for (let i = 0; i < 12; i++) { const q = i / 12 * Math.PI * 2, l = i % 3 ? 0.1 : 0.18; T.push(inkPath([[x + Math.sin(q) * r * (0.82 - l), y - Math.cos(q) * r * (0.82 - l)], [x + Math.sin(q) * r * 0.82, y - Math.cos(q) * r * 0.82]], { w: i % 3 ? 3 : 5, seed: seed + 3 + i, t, amp: 0.4 })); }
      ticks.setAttribute('d', T.join(' '));
      const am = a * Math.PI * 2, ah = a / 12 * Math.PI * 2 + 1.9;
      hands.setAttribute('d', inkPath([[x, y], [x + Math.sin(am) * r * 0.72, y - Math.cos(am) * r * 0.72]], { w: 6, seed: seed + 20, t, amp: 0.4 }) + ' ' +
        inkPath([[x, y], [x + Math.sin(ah) * r * 0.48, y - Math.cos(ah) * r * 0.48]], { w: 9, seed: seed + 21, t, amp: 0.4 }));
      red.setAttribute('d', inkDot(x, y, r * 0.08 + 2, r * 0.08 + 2, seed + 22, t));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ tear-off wall calendar
  function calendar(parent, seed) {
    const g = el(parent, 'g');
    const back = inkEl(g, mix(INK.paperDark, INK.stain, 0.3)), sheet = inkEl(g, INK.paperLight), top = inkEl(g, INK.red), rim = inkEl(g), rings = inkEl(g), nail = inkEl(g, INK.ink);
    const num = txt(g, { 'font-family': SERIF, 'font-weight': 900, fill: INK.ink });
    const lines = inkEl(g, INK.inkSoft);
    const leafG = el(g, 'g');
    const leaves = Array.from({ length: 3 }, () => ({ f: inkEl(leafG, INK.paperLight), r: inkEl(leafG) }));
    function update(t, x, y, w, h, text, fly = 0) {
      const rr = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
      back.setAttribute('d', inkLoop([[x - w / 2 - 10, y - h / 2 - 8], [x + w / 2 + 10, y - h / 2 - 8], [x + w / 2 + 12, y + h / 2 + 16], [x - w / 2 - 8, y + h / 2 + 14]], { seed, t, smooth: false, amp: 0.8 }));
      sheet.setAttribute('d', inkLoop(rr, { seed: seed + 1, t, smooth: false, amp: 0.8 }));
      top.setAttribute('d', inkLoop([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y - h / 2 + h * 0.2], [x - w / 2, y - h / 2 + h * 0.2]], { seed: seed + 2, t, smooth: false, amp: 0.8 }));
      rim.setAttribute('d', inkPath(rr, { w: 5, seed: seed + 3, t, closed: true, smooth: false }));
      rings.setAttribute('d', [-0.25, 0.25].map((q, i) => inkCircle(x + q * w, y - h / 2, 12, seed + 4 + i, t, { w: 4 })).join(' '));
      nail.setAttribute('d', inkDot(x, y - h / 2 - 34, 8, 8, seed + 6, t) + ' ' + inkPath([[x - w * 0.25, y - h / 2 - 10], [x, y - h / 2 - 34], [x + w * 0.25, y - h / 2 - 10]], { w: 3, seed: seed + 7, t }));
      num.setAttribute('x', f1(x)); num.setAttribute('y', f1(y + h * 0.22));
      num.setAttribute('font-size', f1(h * 0.42));
      num.textContent = text;
      lines.setAttribute('d', [0.36, 0.42].map((q, i) => inkPath([[x - w * 0.3, y + h * q], [x + w * 0.3, y + h * q]], { w: 3, seed: seed + 8 + i, t })).join(' '));
      leaves.forEach((L, i) => {
        const ph = fly > 0 ? (fly * 4 + i / 4) % 1 : -1;
        if (ph < 0) { blank(L.f, L.r); return; }
        const cx = x + ph * w * 0.7, cy = y - h * 0.1 - ph * h * 0.6, a = ph * 2.4 + i, sc = 0.42 - ph * 0.22;
        const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(q => { const v = R2([q[0] * sc, q[1] * sc * (0.4 + 0.6 * Math.abs(Math.cos(a)))], a * 0.5); return [cx + v[0], cy + v[1]]; });
        L.f.setAttribute('d', inkLoop(pts, { seed: seed + 20 + i, t, smooth: false, amp: 0.8 }));
        L.r.setAttribute('d', inkPath(pts, { w: 4, seed: seed + 30 + i, t, closed: true, smooth: false }));
      });
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ foreground layers (down to the frame bottom)
  function front(parent, seed, kind) {
    const g = el(parent, 'g');
    const E = (fill, extra) => inkEl(g, fill, extra);
    const wood = mix(INK.stain, INK.paperDark, 0.25), woodD = mix(INK.stain, INK.ink, 0.35);
    const r0 = rng(inkHash(seed, 3)), J = Array.from({ length: 200 }, () => r0());
    if (kind === 'grass') {
      const dark = E(mix(INK.green, INK.ink, 0.35)), mid = E(INK.green), light = E(mix(INK.green, INK.paperLight, 0.35)), petals = E(INK.gold), petals2 = E(INK.paperLight), petR = E(), ctr = E(INK.red);
      return { update(t, W, H, top) {
        const Dk = [], Md = [], Lt = [], PT = [], PT2 = [], PR = [], CT = [];
        const rows = [[top, 0.5, 26, Lt], [top + (H - top) * 0.35, 0.8, 20, Md], [top + (H - top) * 0.7, 1.15, 16, Dk]];
        rows.forEach(([y0, sc, n, arr], r) => {
          for (let i = 0; i < n; i++) {
            const x = (i + J[(r * 40 + i) % 200]) / n * (W + 120) - 60, hgt = (90 + J[(r * 40 + i + 7) % 200] * 130) * sc, sway = Math.sin(t * 1.6 + i * 0.9 + r) * 14 * sc;
            arr.push(inkLoop([[x - 16 * sc, H + 40], [x - 6 * sc, y0 + 40], [x + sway, y0 - hgt + 40], [x + 8 * sc, y0 + 40], [x + 18 * sc, H + 40]], { seed: seed + r * 100 + i, t, amp: 0.8 }));
            arr.push(inkLoop([[x + 8 * sc, H + 40], [x + 22 * sc, y0 + 50], [x + 40 * sc + sway, y0 - hgt * 0.7 + 40], [x + 30 * sc, y0 + 50], [x + 30 * sc, H + 40]], { seed: seed + r * 100 + i + 50, t, amp: 0.8 }));
            if (r > 0 && i % 4 === 1) {
              const fx = x + 20 * sc + sway, fy = y0 - hgt * 0.5 + 40, pr = 16 * sc, white = (i + r) % 2;
              for (let q = 0; q < 5; q++) { const a = q / 5 * Math.PI * 2 + t * 0.3; (white ? PT2 : PT).push(inkCircle(fx + Math.cos(a) * pr, fy + Math.sin(a) * pr, pr * 0.75, seed + 500 + r * 50 + i * 5 + q, t, { fill: true, n: 8 })); }
              PR.push(inkCircle(fx, fy, pr * 1.6, seed + 700 + r * 50 + i, t, { w: 3 }));
              CT.push(inkDot(fx, fy, pr * 0.55, pr * 0.55, seed + 800 + i, t));
            }
          }
        });
        light.setAttribute('d', Lt.join(' ')); mid.setAttribute('d', Md.join(' ')); dark.setAttribute('d', Dk.join(' '));
        petals.setAttribute('d', PT.join(' ')); petals2.setAttribute('d', PT2.join(' ')); petR.setAttribute('d', ''); ctr.setAttribute('d', CT.join(' '));
      } };
    }
    if (kind === 'papers') {
      const bin = E(mix(INK.inkSoft, INK.blue, 0.3)), binR = E(), balls = E(INK.paperLight), ballsR = E(), xs = E(INK.red), boards = E(mix(INK.stain, INK.ink, 0.25));
      return { update(t, W, H, top, o = {}) {
        const k = seed * 7, u = W / 1080;
        const BD = []; for (let i = 0; i < 7; i++) { const y = top + Math.pow(i / 7, 1.4) * (H - top); BD.push(inkPath([[-20, y], [W + 20, y + 4]], { w: 2.5 + i * 0.5, seed: k + i, t })); }
        boards.setAttribute('d', BD.join(' '));
        const bx = (o.bin ?? 0.16) * W, by = H - 60 * u;
        const bp = [[bx - 130 * u, by - 330 * u], [bx + 130 * u, by - 330 * u], [bx + 100 * u, H + 40], [bx - 100 * u, H + 40]];
        bin.setAttribute('d', inkLoop(bp, { seed: k + 20, t, smooth: false }));
        const BR = [inkPath(bp, { w: 6, seed: k + 21, t, closed: true, smooth: false })];
        for (let i = 1; i < 6; i++) { const q = i / 6; BR.push(inkPath([[lerp(bp[0][0], bp[3][0], 0.1) + q * 240 * u - 10 * u, by - 320 * u], [lerp(bp[0][0], bp[3][0], 0.1) + q * 200 * u + 10 * u, H]], { w: 3, seed: k + 22 + i, t })); }
        binR.setAttribute('d', BR.join(' '));
        const spots = (o.balls || [[0.1, -0.2], [0.2, -0.22], [0.15, -0.3], [0.45, 0.3], [0.7, 0.45], [0.88, 0.25], [0.58, 0.7]]);
        const BA = [], BAR = [], X = [];
        spots.forEach((q, i) => {
          const x = q[0] * W, y = q[1] < 0 ? by - 330 * u + q[1] * 200 * u + 60 * u : top + q[1] * (H - top), r = (q[1] < 0 ? 52 : 44 + q[1] * 40) * u;
          const pts = inkEllipsePts(x, y + Math.sin(t * 1.1 + i) * 2, r, r * 0.85, k + 40 + i, 9, i, 0.16);
          BA.push(inkLoop(pts, { seed: k + 40 + i, t, amp: 1, smooth: false }));
          BAR.push(inkPath(pts, { w: 4.5, seed: k + 60 + i, t, closed: true, amp: 1, smooth: false }), inkPath([[x - r * 0.5, y - r * 0.2], [x + r * 0.1, y + r * 0.1], [x + r * 0.4, y - r * 0.3]], { w: 2.5, seed: k + 80 + i, t }));
          X.push(inkPath([[x - r * 0.35, y - r * 0.35], [x + r * 0.35, y + r * 0.35]], { w: 6, seed: k + 100 + i, t }), inkPath([[x + r * 0.35, y - r * 0.35], [x - r * 0.35, y + r * 0.35]], { w: 6, seed: k + 120 + i, t }));
        });
        balls.setAttribute('d', BA.join(' ')); ballsR.setAttribute('d', BAR.join(' ')); xs.setAttribute('d', X.join(' '));
      } };
    }
    // cart / bench / desk: a slab top + a front down to the bottom + a few objects on top
    const topF = E(mix(wood, INK.paperLight, 0.2)), frontF = E(wood), frontR = E(), grain = E(woodD), knobs = E(INK.ink);
    const objG = el(g, 'g');
    const O = Array.from({ length: 14 }, (_, i) => inkEl(objG, [INK.paperLight, INK.blue, INK.red, INK.gold, mix(INK.inkSoft, INK.paperDark, 0.3), INK.ink, INK.paperLight, INK.blue][i % 8]));
    const OR = inkEl(objG), dial = inkEl(objG, INK.paperLight), needle = inkEl(objG, INK.red), lampE = inkEl(objG, INK.red);
    const T = (x, y) => [x, y];
    return { update(t, W, H, top, o = {}) {
      const k = seed * 9, u = W / 1080, x0 = (o.x0 ?? (kind === 'cart' ? -0.05 : -0.05)) * W, x1 = (o.x1 ?? (kind === 'cart' ? 0.46 : 1.05)) * W;
      const th = 38 * u;
      topF.setAttribute('d', inkLoop([T(x0, top), T(x1, top), T(x1 + 10, top + th), T(x0 - 10, top + th)], { seed: k + 1, t, smooth: false, amp: 1 }));
      frontF.setAttribute('d', inkLoop([T(x0 + 10 * u, top + th), T(x1 - 10 * u, top + th), T(x1 - 10 * u, H + 40), T(x0 + 10 * u, H + 40)], { seed: k + 2, t, smooth: false, amp: 1 }));
      const FR = [inkPath([T(x0, top), T(x1, top), T(x1 + 10, top + th), T(x0 - 10, top + th)], { w: 6, seed: k + 3, t, closed: true, smooth: false }),
        inkPath([T(x0 + 10 * u, top + th), T(x0 + 10 * u, H + 40)], { w: 6, seed: k + 4, t }), inkPath([T(x1 - 10 * u, top + th), T(x1 - 10 * u, H + 40)], { w: 6, seed: k + 5, t })];
      const nd = kind === 'cart' ? 2 : 3, KN = [];
      for (let i = 1; i < nd; i++) { const xx = lerp(x0, x1, i / nd); FR.push(inkPath([T(xx, top + th), T(xx, H + 40)], { w: 4, seed: k + 6 + i, t })); }
      FR.push(inkPath([T(x0 + 10 * u, top + th + 150 * u), T(x1 - 10 * u, top + th + 150 * u)], { w: 4, seed: k + 12, t }));
      for (let i = 0; i < nd; i++) { const xx = lerp(x0, x1, (i + 0.5) / nd); KN.push(inkDot(xx, top + th + 80 * u, 12 * u, 9 * u, k + 14 + i, t), inkDot(xx, top + th + 260 * u, 12 * u, 9 * u, k + 18 + i, t)); }
      frontR.setAttribute('d', FR.join(' ')); knobs.setAttribute('d', KN.join(' '));
      const GR = []; for (let i = 0; i < 8; i++) { const y = top + th + 20 * u + J[i] * (H - top - th); GR.push(inkPath([T(x0 + 30 * u + J[i + 9] * 80 * u, y), T(x0 + 160 * u + J[i + 19] * (x1 - x0 - 300 * u), y + 2)], { w: 2, seed: k + 30 + i, t })); }
      grain.setAttribute('d', GR.join(' '));
      // objects on top
      const D = Array(14).fill(''), RR = [];
      const put = (i, pts, sm) => { D[i] = inkLoop(pts, { seed: k + 100 + i, t, smooth: !!sm, amp: 0.8 }); RR.push(inkPath(pts, { w: 4.5, seed: k + 120 + i, t, closed: true, smooth: !!sm, amp: 0.8 })); };
      let dialD = '', needleD = '', lampD = '';
      if (kind === 'cart') {       // the shock generator: a box with a dial, a switch and a blinking lamp
        const gx = lerp(x0, x1, 0.55), gw = 300 * u, gh = 190 * u, gt = top - gh;
        put(4, [[gx - gw / 2, top], [gx + gw / 2, top], [gx + gw / 2, gt], [gx - gw / 2, gt]]);
        const dc = [gx - 50 * u, gt + 90 * u];
        dialD = inkCircle(dc[0], dc[1], 56 * u, k + 200, t, { fill: true });
        RR.push(inkCircle(dc[0], dc[1], 56 * u, k + 201, t, { w: 4 }));
        const na = (-140 + 100 * (0.5 + 0.5 * Math.sin(t * 2.6))) * Math.PI / 180;
        needleD = inkPath([dc, [dc[0] + Math.cos(na) * 46 * u, dc[1] + Math.sin(na) * 46 * u]], { w: 5, seed: k + 202, t });
        lampD = ((t * 2) % 1) < 0.5 ? inkCircle(gx + 90 * u, gt + 60 * u, 18 * u, k + 203, t, { fill: true }) : '';
        RR.push(inkCircle(gx + 90 * u, gt + 60 * u, 18 * u, k + 204, t, { w: 3.5 }), inkPath([[gx + 70 * u, gt + 140 * u], [gx + 110 * u, gt + 110 * u]], { w: 10 * u, seed: k + 205, t }));
        const cab = o.cable || [W * 0.4, top - 400 * u];
        RR.push(inkPath([[gx + gw / 2 - 10 * u, gt + 40 * u], [gx + gw / 2 + 80 * u, gt - 30 * u], [cab[0] + 40 * u, cab[1] + 160 * u], cab], { w: 6, seed: k + 206, t }));
      } else if (kind === 'bench') {   // flasks, a beaker and a notebook stack
        const bx = lerp(x0, x1, 0.18), fx = lerp(x0, x1, 0.62), nx = lerp(x0, x1, 0.84);
        put(0, [[bx - 40 * u, top], [bx + 40 * u, top], [bx + 36 * u, top - 120 * u], [bx - 36 * u, top - 120 * u]]);
        put(1, [[bx - 40 * u, top], [bx + 40 * u, top], [bx + 38 * u, top - 60 * u + Math.sin(t * 2) * 3 * u], [bx - 38 * u, top - 60 * u - Math.sin(t * 2) * 3 * u]]);
        put(6, [[fx - 70 * u, top], [fx + 70 * u, top], [fx + 16 * u, top - 110 * u], [fx + 16 * u, top - 190 * u], [fx - 16 * u, top - 190 * u], [fx - 16 * u, top - 110 * u]]);
        put(7, [[fx - 70 * u, top], [fx + 70 * u, top], [fx + 40 * u, top - 50 * u + Math.sin(t * 2.4) * 3 * u], [fx - 40 * u, top - 50 * u - Math.sin(t * 2.4) * 3 * u]]);
        put(5, [[nx - 90 * u, top], [nx + 90 * u, top], [nx + 86 * u, top - 34 * u], [nx - 94 * u, top - 30 * u]]);
        put(4, [[nx - 80 * u, top - 34 * u], [nx + 84 * u, top - 34 * u], [nx + 78 * u, top - 64 * u], [nx - 86 * u, top - 60 * u]]);
        const BU = []; for (let i = 0; i < 3; i++) { const ph = (t * 0.8 + i / 3) % 1; BU.push(inkCircle(fx + Math.sin(i * 2 + t) * 8 * u, top - 120 * u - ph * 160 * u, (6 + ph * 8) * u, k + 210 + i, t, { w: 3 })); }
        RR.push(...BU);
      } else {                     // desk: a stack of books, a mug, a pencil cup
        const bx = lerp(x0, x1, 0.2), mx = lerp(x0, x1, 0.55), px = lerp(x0, x1, 0.82);
        put(1, [[bx - 120 * u, top], [bx + 110 * u, top], [bx + 110 * u, top - 46 * u], [bx - 120 * u, top - 46 * u]]);
        put(2, [[bx - 100 * u, top - 46 * u], [bx + 120 * u, top - 46 * u], [bx + 116 * u, top - 90 * u], [bx - 104 * u, top - 88 * u]]);
        put(3, [[bx - 110 * u, top - 90 * u], [bx + 96 * u, top - 90 * u], [bx + 100 * u, top - 128 * u], [bx - 106 * u, top - 126 * u]]);
        put(0, [[mx - 46 * u, top], [mx + 46 * u, top], [mx + 50 * u, top - 110 * u], [mx - 50 * u, top - 110 * u]]);
        RR.push(inkPath([[mx + 48 * u, top - 90 * u], [mx + 86 * u, top - 70 * u], [mx + 46 * u, top - 30 * u]], { w: 7, seed: k + 220, t }));
        for (let i = 0; i < 2; i++) { const ph = (t * 0.6 + i / 2) % 1; RR.push(inkPath([[mx - 10 * u + i * 20 * u, top - 120 * u - ph * 90 * u], [mx + Math.sin(t * 2 + i) * 14 * u + i * 20 * u, top - 160 * u - ph * 90 * u], [mx - 6 * u + i * 20 * u, top - 200 * u - ph * 90 * u]], { w: 3, seed: k + 222 + i, t })); }
        put(4, [[px - 50 * u, top], [px + 50 * u, top], [px + 44 * u, top - 100 * u], [px - 44 * u, top - 100 * u]]);
        RR.push(inkPath([[px - 20 * u, top - 96 * u], [px - 34 * u, top - 190 * u]], { w: 10 * u, seed: k + 226, t }), inkPath([[px + 12 * u, top - 96 * u], [px + 30 * u, top - 176 * u]], { w: 10 * u, seed: k + 227, t }));
      }
      O.forEach((e, i) => e.setAttribute('d', D[i]));
      OR.setAttribute('d', RR.join(' '));
      dial.setAttribute('d', dialD); needle.setAttribute('d', needleD); lampE.setAttribute('d', lampD);
    } };
  }

  // ------------------------------------------------------------------ the barrier board on its own (same shape as in the box)
  function board(parent, seed) {
    const wood = mix(INK.stain, INK.paperDark, 0.3);
    const g = el(parent, 'g'), S = inkEl(g, wood), T = inkEl(g, mix(wood, INK.paperLight, 0.4)), R = inkEl(g), G = inkEl(g, mix(INK.stain, INK.ink, 0.3));
    function update(t, xm, gy, bh, dx, dep, bw) {
      const face = [[xm - bw, gy], [xm - bw, gy - bh], [xm + bw, gy - bh], [xm + bw, gy]];
      const side = [[xm + bw, gy], [xm + bw, gy - bh], [xm + bw + dx, gy - bh - dep], [xm + bw + dx, gy - dep]];
      S.setAttribute('d', inkLoop(face, { seed, t, smooth: false }) + ' ' + inkLoop(side, { seed: seed + 1, t, smooth: false }));
      T.setAttribute('d', inkLoop([[xm - bw, gy - bh], [xm + bw, gy - bh], [xm + bw + dx, gy - bh - dep], [xm - bw + dx, gy - bh - dep]], { seed: seed + 2, t, smooth: false }));
      R.setAttribute('d', inkPath(face, { w: 5, seed: seed + 3, t, closed: true, smooth: false }) + ' ' + inkPath(side.slice(1), { w: 5, seed: seed + 4, t, smooth: false }) + ' ' + inkPath([[xm - bw, gy - bh], [xm - bw + dx, gy - bh - dep], [xm + bw + dx, gy - bh - dep]], { w: 4, seed: seed + 5, t, smooth: false }));
      G.setAttribute('d', [0.3, 0.55, 0.8].map((q, i) => inkPath([[xm + bw + dx * 0.15, gy - bh * q - dep * 0.1], [xm + bw + dx * 0.85, gy - bh * q - dep * 0.85]], { w: 2.5, seed: seed + 6 + i, t })).join(' '));
    }
    return { g, update };
  }

  window.LH = { board, atOr, f1, faceOf, dirOf, R2, blank, txt, SERIF, rect, smooth01, dog, zap, lamp, shuttle, person, kasif, label, clock, calendar, front };
})();
