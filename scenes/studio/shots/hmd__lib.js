// hmd__lib: shared drawing helpers for the hmd_* shots (the Ottoman cruiser Hamidiye's 1913 raid). Not a shot type.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything is a pure function of (seed, t); no Math.random.
// window.HMD = {
//   atOr(cues, name|sec, fb), f1, faceOf, dirOf
//   cruiser(parent, seed, o) -> {update(t, x, wy, s, u)}: side view of a protected cruiser drawn from Hamidiye's
//     photographs: long low hull with a ram bow, raised forecastle, bridge, THREE equal, evenly spaced funnels, TWO pole
//     masts, a gun fore and aft, boats amidships, a red crescent-and-star ensign at the stern. 640 units long (stern
//     -320 .. bow +320, bow at +x when face = 1), waterline y = 0. o: {funnels: 3, flag: "tr"|"gr"|"uk"|null,
//     tone: "grey"|"dark"} · u: {face: 1|-1, roll: deg, smoke: 0..1, lights: 0..1 (lit portholes), night: 0..1
//     (silhouette), beam: null|{a: deg, len: px, k: 0..1} (searchlight from the bridge), dress: 0..1 (signal-flag
//     string bow-mast-mast-stern), wake: 0..1 (stern wake + bow wave), puff: 0..1 (one black puff from the 2nd funnel)}
//     -> {bow, stern, funnelTops: [[x, y]...], bridge: [x, y]}
//   beam(parent, seed) -> {update(t, x, y, a, len, w, k)}: a searchlight cone (paper-light, soft)
//   sea(parent, seed) -> {update(t, W, H, y0, o)}: a water band from y0 to the frame bottom, wave hatching that grows
//     towards the viewer, o: {night: 0..1, rows: 9, swell: 1, near: true (big crests at the bottom)}
//   person(parent, seed, o) -> {update(t, x, gy, s, pose)}: a hatless period figure. o.kind: "navy" (dark navy double-
//     breasted coat, gold buttons, moustache) | "white" (white tropical tunic, sun-tanned, clean-shaven) | "stoker"
//     (sleeveless vest, bare arms, sooty) | "crowd" (plain coat); pose: {lean, armL, armR (world px targets), face,
//     legs: true, brow: 0 (raised eyebrow), mouth: 0} -> {hc, hL, hR}
//   kasif(parent, K, W, H, seed) -> {update(lt, t, cues)}: Kaşif with K = {x, y (0..1), scale, pose, face, dir,
//     emotion, item, seq: [{at, pose, dir, face, emotion}]}
//   label(parent, o, W, H) -> {update(lt, t, cues)}: hand-written label (Patrick Hand), o: {text, x, y, size, color,
//     rot, at, arrow: [x, y], underline: true, card: false (paper-light card behind the text), bold: false, hit: cue (punch)}
//   smoke(parent, seed) -> {update(t, x, y, k, lean, n)}: a drifting ink-wash smoke trail from (x, y)
//   flag(parent, seed) -> {update(t, x, y, w, h, kind)}: a waving flag on a pole top at (x, y); kind "tr" (red,
//     crescent + star), "gr" (blue, white cross), "uk" (red ensign, simplified)
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

  // ------------------------------------------------------------------ waving flag
  function flag(parent, seed) {
    const g = el(parent, 'g');
    const cloth = inkEl(g), mark = inkEl(g, INK.paperLight), rim = inkEl(g);
    function update(t, x, y, w, h, kind = 'tr', face = 1) {
      if (!w) { blank(cloth, mark, rim); return; }
      const N = 7, top = [], bot = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N, wv = Math.sin(t * 6 + u * 4 + seed) * h * 0.12 * u;
        top.push([x - face * u * w, y + wv]); bot.push([x - face * u * w, y + h + wv]);
      }
      const pts = top.concat(bot.reverse());
      cloth.setAttribute('fill', kind === 'gr' ? INK.blue : INK.red);
      cloth.setAttribute('d', inkLoop(pts, { seed: seed + 1, t, amp: 0.6 }));
      rim.setAttribute('d', inkPath(pts, { w: Math.max(2, h * 0.06), seed: seed + 2, t, closed: true, amp: 0.6 }));
      const P = u => { const i = Math.min(N - 1, Math.floor(u * N)), q = u * N - i; return [lerp(top[i][0], top[i + 1][0], q), lerp(top[i][1], top[i + 1][1], q)]; };
      if (kind === 'tr') {
        const c = P(0.42), cy = c[1] + h * 0.5, r = h * 0.3;
        const cres = [];
        for (let j = 0; j <= 10; j++) { const a = Math.PI * 0.35 + j / 10 * Math.PI * 1.3; cres.push([c[0] - face * Math.cos(a) * r, cy - Math.sin(a) * r]); }
        for (let j = 10; j >= 0; j--) { const a = Math.PI * 0.42 + j / 10 * Math.PI * 1.16; cres.push([c[0] - face * (Math.cos(a) * r * 0.78 - r * 0.28), cy - Math.sin(a) * r * 0.78]); }
        const sx = c[0] - face * r * 0.75, st = [];
        for (let j = 0; j < 10; j++) { const a = -Math.PI / 2 + j * Math.PI / 5, q = j % 2 ? r * 0.16 : r * 0.38; st.push([sx + Math.cos(a) * q, cy + Math.sin(a) * q]); }
        mark.setAttribute('d', inkLoop(cres, { seed: seed + 3, t, amp: 0.3, smooth: false }) + ' ' + inkLoop(st, { seed: seed + 4, t, amp: 0.2, smooth: false }));
      } else if (kind === 'gr') {
        const a = P(0), b = P(0.4);
        mark.setAttribute('d', inkLoop([[a[0], a[1] + h * 0.4], [b[0], b[1] + h * 0.4], [b[0], b[1] + h * 0.56], [a[0], a[1] + h * 0.56]], { seed: seed + 3, t, amp: 0.3, smooth: false }) + ' ' +
          inkLoop([[lerp(a[0], b[0], 0.42), a[1]], [lerp(a[0], b[0], 0.58), a[1]], [lerp(a[0], b[0], 0.58), a[1] + h], [lerp(a[0], b[0], 0.42), a[1] + h]], { seed: seed + 4, t, amp: 0.3, smooth: false }));
      } else mark.setAttribute('d', '');
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ smoke trail
  function smoke(parent, seed) {
    const g = el(parent, 'g');
    const puffs = Array.from({ length: 9 }, () => inkEl(g, INK.inkSoft, { 'fill-opacity': 0.5 }));
    function update(t, x, y, k = 1, lean = 1, n = 7, sc = 1, col) {
      puffs.forEach((p, i) => {
        if (i >= n || k <= 0.02) { p.setAttribute('d', ''); return; }
        const u = ((t * 0.35 + i / n) % 1), r = (14 + u * 46) * sc * (0.6 + 0.4 * k);
        const px = x - lean * u * 230 * sc + Math.sin(t * 1.3 + i) * 6 * sc, py = y - u * 120 * sc - r * 0.4;
        if (col) p.setAttribute('fill', col);
        p.setAttribute('fill-opacity', (0.55 * k * (1 - u * 0.75)).toFixed(3));
        p.setAttribute('d', inkCircle(px, py, r, seed + i * 3, t, { fill: true, n: 10 }));
      });
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ searchlight beam
  function beam(parent, seed) {
    const g = el(parent, 'g');
    const cone = inkEl(g, INK.paperLight, { 'fill-opacity': 0.32 }), core = inkEl(g, INK.paperLight, { 'fill-opacity': 0.4 }), lamp = inkEl(g, INK.gold);
    function update(t, x, y, a, len, w, k = 1) {
      if (k <= 0.02) { blank(cone, core, lamp); return; }
      const A = a * Math.PI / 180, d = [Math.cos(A), -Math.sin(A)], n = [-d[1], d[0]];
      const tip = [x + d[0] * len, y + d[1] * len];
      const pts = [[x + n[0] * 8, y + n[1] * 8], [tip[0] + n[0] * w, tip[1] + n[1] * w], [tip[0] - n[0] * w, tip[1] - n[1] * w], [x - n[0] * 8, y - n[1] * 8]];
      cone.setAttribute('fill-opacity', (0.3 * k).toFixed(3));
      cone.setAttribute('d', inkLoop(pts, { seed, t, amp: 1, smooth: false }));
      const p2 = [[x + n[0] * 4, y + n[1] * 4], [tip[0] + n[0] * w * 0.4, tip[1] + n[1] * w * 0.4], [tip[0] - n[0] * w * 0.4, tip[1] - n[1] * w * 0.4], [x - n[0] * 4, y - n[1] * 4]];
      core.setAttribute('fill-opacity', (0.38 * k).toFixed(3));
      core.setAttribute('d', inkLoop(p2, { seed: seed + 1, t, amp: 1, smooth: false }));
      lamp.setAttribute('d', inkCircle(x, y, 12, seed + 2, t, { fill: true }));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ the cruiser
  function cruiser(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const nF = o.funnels ?? 3;
    const P = (fill, extra) => inkEl(g, fill, extra);
    const sm = [0, 1, 2].map(i => smoke(g, seed * 7 + 40 + i * 13));
    const wake = P(INK.paperLight, { 'fill-opacity': 0.75 });
    const mastE = P(INK.ink), rig = el(g, 'path', { fill: 'none', stroke: INK.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    const dressL = el(g, 'path', { fill: 'none', stroke: INK.ink, 'stroke-width': 2, 'stroke-linecap': 'round' });
    const dressF = Array.from({ length: 18 }, (_, i) => P([INK.red, INK.gold, INK.blue, INK.paperLight][i % 4]));
    const funF = Array.from({ length: nF }, () => P()), funBand = Array.from({ length: nF }, () => P(INK.ink)), funR = P();
    const house = P(), houseR = P(), boats = P(INK.paperLight), boatsR = P();
    const hull = P(), hullTop = P(), boot = P(INK.red), hullR = P();
    const guns = P(INK.ink), ports = P(INK.gold);
    const bm = beam(g, seed * 7 + 90);
    const fl = flag(g, seed * 7 + 100);
    const puffE = P(INK.ink, { 'fill-opacity': 0.75 });
    function update(t, x, wy, s, u = {}) {
      const k = seed * 61, fc = u.face ?? 1, A = (u.roll || 0) * Math.PI / 180, night = clamp01(u.night || 0);
      const bob = Math.sin(t * 1.2 + seed) * 3 * s;
      const T = p => { const q = R2([p[0] * s * fc, p[1] * s], A * fc); return [x + q[0], wy + bob + q[1]]; };
      const tone = o.tone === 'dark' ? 0.25 : 0.55;
      const hullCol = mix(mix(INK.inkSoft, INK.paperDark, tone * 0.6), INK.ink, night * 0.8);
      const upCol = mix(mix(INK.paperDark, INK.paperLight, 0.3), INK.ink, night * 0.72);
      const funCol = mix(mix(INK.inkSoft, INK.paperDark, 0.25), INK.ink, night * 0.75);
      // wake
      const wk = clamp01(u.wake || 0);
      wake.setAttribute('d', wk > 0.02 ? [0, 1, 2].map(i => inkPath([T([-330 - i * 60, 6 + i * 4]), T([-420 - i * 120, 14 + i * 10]), T([-560 - i * 160, 10 + i * 14])], { w: (10 - i * 2) * s * wk, seed: k + 1 + i, t, amp: 1.5 })).join(' ') + ' ' +
        inkPath([T([300, 8]), T([360, 22]), T([420, 30])], { w: 9 * s * wk, seed: k + 5, t, amp: 1.5 }) + ' ' +
        inkLoop([T([290, 4]), T([318, -16 - 6 * Math.sin(t * 6)]), T([346, -4]), T([360, 8]), T([300, 10])], { seed: k + 6, t, amp: 1.5 }) : '');
      // masts + rigging (fore and main pole masts)
      const fm = [T([150, -60]), T([156, -340])], mm = [T([-215, -50]), T([-221, -300])];
      mastE.setAttribute('d', inkPath(fm, { w: 7 * s + 1, seed: k + 10, t }) + ' ' + inkPath(mm, { w: 7 * s + 1, seed: k + 11, t }) +
        ' ' + inkPath([T([140, -250]), T([172, -250])], { w: 5 * s + 1, seed: k + 12, t }) + ' ' + inkPath([T([-232, -220]), T([-204, -220])], { w: 5 * s + 1, seed: k + 13, t }));
      mastE.setAttribute('fill', mix(INK.ink, INK.inkSoft, 0.2 * (1 - night)));
      const rr = [[T([156, -330]), T([322, -76])], [T([156, -330]), T([-221, -292])], [T([-221, -292]), T([-318, -54])], [T([156, -320]), T([100, -60])], [T([-221, -290]), T([-170, -52])]];
      rig.setAttribute('d', rr.map(([a, b]) => `M${f1(a[0])} ${f1(a[1])} L${f1(b[0])} ${f1(b[1])}`).join(' '));
      rig.setAttribute('stroke-width', f1(Math.max(1.6, 2.4 * s)));
      // dressed overall (signal flags on the stays)
      const dr = clamp01(u.dress || 0);
      if (dr > 0.02) {
        const pathP = [T([322, -76]), T([156, -336]), T([-221, -296]), T([-318, -54])];
        const segL = [], tot = [0];
        for (let i = 1; i < pathP.length; i++) { segL.push(Math.hypot(pathP[i][0] - pathP[i - 1][0], pathP[i][1] - pathP[i - 1][1])); tot.push(tot[i - 1] + segL[i - 1]); }
        const at = f => { let d = f * tot[tot.length - 1]; for (let i = 0; i < segL.length; i++) { if (d <= segL[i]) { const q = d / segL[i]; return [lerp(pathP[i][0], pathP[i + 1][0], q), lerp(pathP[i][1], pathP[i + 1][1], q) + Math.sin(q * Math.PI) * 18 * s]; } d -= segL[i]; } return pathP[pathP.length - 1]; };
        const L = []; for (let i = 0; i <= 40; i++) L.push(at(i / 40));
        dressL.setAttribute('d', 'M' + L.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L'));
        dressF.forEach((e, i) => {
          if ((i + 0.5) / dressF.length > dr) { e.setAttribute('d', ''); return; }
          const p = at((i + 0.5) / dressF.length), sz = 16 * s + 3, sw = Math.sin(t * 5 + i) * 4 * s;
          e.setAttribute('d', inkLoop([[p[0] - sz * 0.5, p[1]], [p[0] + sz * 0.5, p[1]], [p[0] + sz * 0.3 + sw, p[1] + sz * 1.3], [p[0] - sz * 0.4 + sw, p[1] + sz * 1.2]], { seed: k + 200 + i, t, amp: 0.5, smooth: false }));
        });
      } else { dressL.setAttribute('d', ''); dressF.forEach(e => e.setAttribute('d', '')); }
      // funnels: equal size, evenly spaced, slight rake aft
      const fxs = nF === 3 ? [70, -10, -90] : nF === 2 ? [50, -60] : [0];
      const tops = [], FR = [];
      fxs.forEach((fx, i) => {
        const w = 15, top = -205, rake = -14;
        const pts = [T([fx - w, -64]), T([fx + w, -64]), T([fx + w + rake, top]), T([fx - w + rake, top])];
        funF[i].setAttribute('fill', funCol);
        funF[i].setAttribute('d', inkLoop(pts, { seed: k + 20 + i, t, smooth: false, amp: 0.8 }));
        funBand[i].setAttribute('d', inkLoop([T([fx - w + rake * 0.9, top + 22]), T([fx + w + rake * 0.9, top + 22]), T([fx + w + rake, top]), T([fx - w + rake, top])], { seed: k + 25 + i, t, smooth: false, amp: 0.6 }));
        FR.push(inkPath(pts, { w: 4 * s + 1.2, seed: k + 28 + i, t, closed: true, smooth: false }));
        tops.push(T([fx + rake, top - 6]));
      });
      funR.setAttribute('d', FR.join(' '));
      // bridge house + boats
      const hs = [T([110, -54]), T([200, -54]), T([196, -112]), T([116, -112])];
      const hs2 = [T([-170, -50]), T([-120, -50]), T([-122, -86]), T([-168, -86])];
      house.setAttribute('fill', upCol);
      house.setAttribute('d', inkLoop(hs, { seed: k + 30, t, smooth: false }) + ' ' + inkLoop(hs2, { seed: k + 31, t, smooth: false }));
      houseR.setAttribute('d', inkPath(hs, { w: 4 * s + 1, seed: k + 32, t, closed: true, smooth: false }) + ' ' + inkPath(hs2, { w: 4 * s + 1, seed: k + 33, t, closed: true, smooth: false }) +
        ' ' + inkPath([T([100, -122]), T([210, -122])], { w: 5 * s + 1, seed: k + 34, t }));
      const bt = [[-40, -62], [-60, -62]].map(([bx, by], i) => [T([bx - 34 + i * 70, by]), T([bx + 30 + i * 70, by]), T([bx + 24 + i * 70, by - 16]), T([bx - 28 + i * 70, by - 16])]);
      boats.setAttribute('fill', mix(INK.paperLight, INK.ink, night * 0.7));
      boats.setAttribute('d', bt.map((b, i) => inkLoop(b, { seed: k + 36 + i, t, smooth: false })).join(' '));
      boatsR.setAttribute('d', bt.map((b, i) => inkPath(b, { w: 3 * s + 1, seed: k + 38 + i, t, closed: true, smooth: false })).join(' '));
      // hull: ram bow, raised forecastle, low waist, rounded stern
      const hp = [T([-318, -52]), T([-332, -36]), T([-326, -14]), T([-300, 2]), T([290, 2]), T([326, 14]), T([316, -6]), T([322, -76]), T([150, -76]), T([132, -54])];
      hull.setAttribute('fill', hullCol);
      hull.setAttribute('d', inkLoop(hp, { seed: k + 40, t, smooth: false, amp: 1 }));
      boot.setAttribute('fill', mix(INK.red, INK.ink, 0.25 + night * 0.6));
      boot.setAttribute('d', inkLoop([T([-312, -10]), T([300, -10]), T([316, -2]), T([300, 2]), T([-300, 2]), T([-324, -6])], { seed: k + 41, t, smooth: false, amp: 0.8 }));
      hullTop.setAttribute('fill', mix(INK.paperDark, INK.ink, 0.3 + night * 0.6));
      hullTop.setAttribute('d', inkLoop([T([-318, -52]), T([132, -54]), T([150, -76]), T([322, -76]), T([320, -68]), T([152, -68]), T([136, -46]), T([-322, -44])], { seed: k + 42, t, smooth: false, amp: 0.6 }));
      hullR.setAttribute('d', inkPath(hp, { w: 5 * s + 1.5, seed: k + 43, t, closed: true, smooth: false, amp: 1 }));
      // guns fore and aft (barrels), a few casemate guns along the side
      guns.setAttribute('d', [inkPath([T([236, -92]), T([300, -94])], { w: 8 * s + 1, seed: k + 50, t }), inkLoop([T([216, -78]), T([252, -78]), T([248, -100]), T([220, -100])], { seed: k + 51, t, smooth: false }),
        inkPath([T([-256, -66]), T([-316, -70])], { w: 8 * s + 1, seed: k + 52, t }), inkLoop([T([-236, -52]), T([-270, -52]), T([-266, -74]), T([-240, -74])], { seed: k + 53, t, smooth: false }),
        ...[60, -60, -170].map((gx, i) => inkPath([T([gx, -34]), T([gx + 40, -36])], { w: 6 * s + 1, seed: k + 54 + i, t }))].join(' '));
      // portholes
      const lt = clamp01(u.lights ?? 0);
      ports.setAttribute('fill', lt > 0.02 ? INK.gold : mix(INK.ink, INK.inkSoft, 0.4));
      ports.setAttribute('fill-opacity', lt > 0.02 ? (0.4 + 0.6 * lt).toFixed(2) : (0.7 * (1 - night)).toFixed(2));
      const PH = [];
      for (let i = 0; i < 16; i++) { const px = -280 + i * 34; if (Math.abs(px - 100) < 30) continue; const p = T([px, -26]); PH.push(inkCircle(p[0], p[1], 4.5 * s + 1.5, k + 60 + i, t, { fill: true, n: 8 })); }
      ports.setAttribute('d', PH.join(' '));
      // smoke
      const smk = u.smoke ?? 0.6;
      tops.forEach((p, i) => sm[i] && sm[i].update(t, p[0], p[1], smk, fc, 7, s * 1.1, night > 0.5 ? mix(INK.inkSoft, INK.ink, 0.35) : null));
      const pf = clamp01(u.puff || 0);
      if (pf > 0.02 && tops[1]) { const p = tops[1]; puffE.setAttribute('d', inkCircle(p[0] - fc * 20 * s, p[1] - 30 * s - pf * 40 * s, (20 + 50 * pf) * s, k + 70, t, { fill: true, n: 12 }) + ' ' + inkCircle(p[0] + fc * 30 * s, p[1] - 50 * s - pf * 60 * s, (14 + 36 * pf) * s, k + 71, t, { fill: true, n: 10 })); }
      else puffE.setAttribute('d', '');
      // ensign at the stern staff
      if (o.flag) { const st = T([-318, -52]), sp = T([-322, -130]); fl.update(t, sp[0], sp[1], 64 * s, 42 * s, o.flag, fc); mastE.setAttribute('d', mastE.getAttribute('d') + ' ' + inkPath([st, sp], { w: 4 * s + 1, seed: k + 80, t })); }
      else fl.update(t, 0, 0, 0, 0);
      // searchlight from the bridge top
      const br = T([160, -128]);
      if (u.beam) bm.update(t, br[0], br[1], u.beam.a, u.beam.len, u.beam.w ?? 90, u.beam.k ?? 1); else bm.update(t, 0, 0, 0, 0, 0, 0);
      return { bow: T([326, 0]), stern: T([-326, 0]), funnelTops: tops, bridge: br, mast: fm[1] };
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ water band
  function sea(parent, seed) {
    const g = el(parent, 'g');
    const body = inkEl(g), shine = inkEl(g, INK.paperLight, { 'fill-opacity': 0.45 }), lines = inkEl(g, INK.blue), swell = inkEl(g), crest = inkEl(g, INK.paperLight, { 'fill-opacity': 0.7 }), crestR = inkEl(g);
    const r0 = rng(inkHash(seed, 17)), J = Array.from({ length: 300 }, () => r0());
    function update(t, W, H, y0, o = {}) {
      const k = seed * 13, night = clamp01(o.night || 0), rows = o.rows ?? 9;
      body.setAttribute('fill', mix(mix(INK.blue, INK.paperLight, 0.45), INK.ink, night * 0.62));
      body.setAttribute('d', `M-30 ${f1(y0)} H${W + 30} V${H + 30} H-30 Z`);
      lines.setAttribute('fill', night > 0.5 ? mix(INK.blue, INK.paperLight, 0.35) : INK.blue);
      const L = [], S = [], C = [], CR = [];
      for (let i = 0; i < rows; i++) {
        const u = (i + 0.5) / rows, y = y0 + (H - y0) * Math.pow(u, 1.5), sz = lerp(14, 70, u) * (W / 1080), n = Math.round(lerp(10, 4, u));
        for (let j = 0; j < n; j++) {
          const x = ((j + J[(i * 11 + j) % 300]) / n) * (W + 200) - 100 + Math.sin(t * (0.6 + u) + i + j) * sz * 0.6;
          const yy = y + Math.sin(t * 1.4 + j * 2 + i) * sz * 0.12;
          L.push(inkPath([[x - sz * 1.6, yy], [x - sz * 0.6, yy - sz * 0.32], [x + sz * 0.4, yy], [x + sz * 1.4, yy - sz * 0.32]], { w: lerp(2.2, 5.5, u), seed: k + i * 40 + j, t, amp: 0.8 }));
        }
      }
      lines.setAttribute('d', L.join(' '));
      if (o.moon) { for (let i = 0; i < 7; i++) { const y = y0 + 20 + i * 26, w = 40 + i * 20, x = o.moon + Math.sin(t * 2 + i) * 12; S.push(inkLoop([[x - w, y], [x + w, y - 3], [x + w * 0.8, y + 6], [x - w * 0.9, y + 7]], { seed: k + 900 + i, t, amp: 0.8 })); } }
      shine.setAttribute('d', S.join(' '));
      const SW = [];
      if (o.near !== false) {
        const uu = W / 1080, big = o.near === 'big';
        const rowsN = big ? [[H - 360 * uu, 240 * uu, 5], [H - 110 * uu, 330 * uu, 4]] : [[H - 120 * uu, 260 * uu, 4]];
        rowsN.forEach(([y0, w, n], r) => {
          for (let j = 0; j < n; j++) {
            const cx = ((j + (r % 2) * 0.5) / (n - 1)) * W + Math.sin(t * (0.8 + r * 0.3) + j) * 34 * uu, cy = y0 + Math.sin(t * 1.3 + j * 2 + r) * 16 * uu;
            const crestP = [[cx - w, cy + 60 * uu], [cx - w * 0.5, cy - 10 * uu], [cx, cy - 46 * uu], [cx + w * 0.3, cy - 30 * uu], [cx + w * 0.42, cy - 4 * uu], [cx + w * 0.25, cy + 12 * uu]];
            if (big) SW.push(inkLoop([[cx - w * 1.1, H + 40], [cx - w, cy + 60 * uu], [cx - w * 0.5, cy - 10 * uu], [cx, cy - 46 * uu], [cx + w * 0.42, cy - 4 * uu], [cx + w * 1.1, cy + 70 * uu], [cx + w * 1.1, H + 40]], { seed: k + 760 + r * 10 + j, t, amp: 1.2 }));
            C.push(inkLoop(crestP.concat([[cx + w * 0.1, cy + 20 * uu], [cx - w * 0.5, cy + 30 * uu]]), { seed: k + 700 + r * 10 + j, t, amp: 1.2 }));
            CR.push(inkPath(crestP.slice(0, 5), { w: 5, seed: k + 720 + r * 10 + j, t, amp: 1.2 }));
          }
        });
      }
      swell.setAttribute('fill', mix(mix(INK.blue, INK.paperLight, 0.3), INK.ink, 0.3 + night * 0.45));
      swell.setAttribute('d', SW.join(' '));
      crest.setAttribute('fill', mix(INK.paperLight, INK.blue, 0.25 + night * 0.4));
      crest.setAttribute('d', C.join(' ')); crestR.setAttribute('d', CR.join(' '));
    }
    return { g, update };
  }

  // ------------------------------------------------------------------ period figure (no hat)
  function person(parent, seed, o = {}) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const kind = o.kind || 'navy';
    const bodyCol = kind === 'navy' ? mix(INK.blue, INK.ink, 0.55) : kind === 'white' ? INK.paperLight : kind === 'stoker' ? mix(INK.inkSoft, INK.ink, 0.3) : (o.col || INK.inkSoft);
    const skin = kind === 'white' ? mix(INK.paperDark, INK.stain, 0.35) : INK.paperDark;
    const legL = P(), legR = P();
    const coat = P(bodyCol), coatR = P(), buttons = P(INK.gold), belt = P(INK.ink);
    const armBack = P(kind === 'stoker' ? skin : bodyCol), armBackR = P(), head = P(skin), headR = P(), hair = P(INK.ink), face = P(), soot = P(INK.ink, { 'fill-opacity': 0.35 });
    const armF = P(kind === 'stoker' ? skin : bodyCol), armFR = P(), hands = P(skin), handsR = P();
    const twoBone = (a, b, l1, l2, bend) => {
      let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
      const mx = l1 + l2 - 1; if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
      const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d || 1))));
      return [[a[0] + Math.cos(base + bend * al) * l1, a[1] + Math.sin(base + bend * al) * l1], [a[0] + dx, a[1] + dy]];
    };
    function update(t, x, gy, s, pose = {}) {
      const k = seed * 40, fc = pose.face ?? 1, lean = (pose.lean || 0) * Math.PI / 180;
      const br = Math.sin(t * 2 + seed) * 2 * s;
      const hip = [x, gy - 190 * s], neck = [x + Math.sin(lean) * 210 * s * fc, gy - 400 * s + br];
      const hc = [neck[0] + Math.sin(lean) * 40 * s * fc + 6 * s * fc, neck[1] - 54 * s];
      if (pose.legs !== false) {
        const lc = kind === 'white' ? INK.paperLight : mix(INK.ink, INK.inkSoft, 0.3);
        legL.setAttribute('fill', lc); legR.setAttribute('fill', lc);
        legL.setAttribute('d', inkPath([hip, [x - 26 * s, gy]], { w: 22 * s, seed: k + 1, t, amp: 1 }) + ' ' + inkDot(x - 34 * s, gy - 4 * s, 22 * s, 10 * s, k + 3, t));
        legR.setAttribute('d', inkPath([hip, [x + 26 * s, gy]], { w: 22 * s, seed: k + 2, t, amp: 1 }) + ' ' + inkDot(x + 34 * s, gy - 4 * s, 22 * s, 10 * s, k + 4, t));
      } else blank(legL, legR);
      const sh = [neck[0], neck[1] + 14 * s];
      const hemY = gy - (kind === 'stoker' ? 170 : 130) * s;
      const cp = [[sh[0] - 48 * s, sh[1] + 6 * s], [sh[0] + 48 * s, sh[1] + 6 * s], [x + 54 * s, hemY], [x - 54 * s, hemY]];
      coat.setAttribute('d', inkLoop(cp, { seed: k + 5, t, amp: 1.2, smooth: false }));
      coatR.setAttribute('d', inkPath(cp, { w: 4.5, seed: k + 6, t, closed: true, amp: 1.2, smooth: false }) +
        (kind === 'navy' || kind === 'white' ? ' ' + inkPath([[sh[0] - 12 * s, sh[1] + 4 * s], [sh[0] + 6 * s * fc, sh[1] + 40 * s], [sh[0] + 4 * s * fc, hemY]], { w: 3.5, seed: k + 7, t }) : ''));
      buttons.setAttribute('d', kind === 'navy' || kind === 'white' ? [0, 1, 2, 3].map(i => inkDot(sh[0] + 24 * s * fc, sh[1] + 50 * s + i * 52 * s, 6 * s + 1, 6 * s + 1, k + 8 + i, t)).join(' ') + ' ' +
        [0, 1, 2, 3].map(i => inkDot(sh[0] - 12 * s * fc, sh[1] + 50 * s + i * 52 * s, 6 * s + 1, 6 * s + 1, k + 12 + i, t)).join(' ') : '');
      buttons.setAttribute('fill', kind === 'white' ? INK.gold : INK.gold);
      belt.setAttribute('d', kind === 'stoker' ? inkPath([[x - 54 * s, hemY + 8 * s], [x + 54 * s, hemY + 8 * s]], { w: 12 * s, seed: k + 16, t }) : '');
      const shL = [sh[0] - 38 * s * fc, sh[1] + 12 * s], shR = [sh[0] + 38 * s * fc, sh[1] + 12 * s];
      const tL = pose.armL || [shL[0] - 10 * s * fc, shL[1] + 170 * s], tR = pose.armR || [shR[0] + 10 * s * fc, shR[1] + 170 * s];
      const [eL, hL] = twoBone(shL, tL, 92 * s, 88 * s, fc);
      const [eR, hR] = twoBone(shR, tR, 92 * s, 88 * s, pose.bendR ?? -fc);
      const aw = kind === 'stoker' ? 22 : 26;
      armBack.setAttribute('d', inkPath([shL, eL, hL], { w: aw * s, seed: k + 25, t, amp: 1, taper: 0.1 }));
      armBackR.setAttribute('d', inkPath([shL, eL, hL], { w: 4, seed: k + 26, t, amp: 1 }));
      armF.setAttribute('d', inkPath([shR, eR, hR], { w: (aw + 2) * s, seed: k + 27, t, amp: 1, taper: 0.1 }));
      armFR.setAttribute('d', inkPath([shR, eR, hR], { w: 4, seed: k + 28, t, amp: 1 }));
      hands.setAttribute('d', inkDot(hL[0], hL[1], 15 * s, 15 * s, k + 29, t) + ' ' + inkDot(hR[0], hR[1], 15 * s, 15 * s, k + 30, t));
      handsR.setAttribute('d', inkCircle(hL[0], hL[1], 15 * s, k + 31, t, { w: 3.5 }) + ' ' + inkCircle(hR[0], hR[1], 15 * s, k + 32, t, { w: 3.5 }));
      head.setAttribute('d', inkCircle(hc[0], hc[1], 50 * s, k + 33, t, { fill: true }));
      headR.setAttribute('d', inkCircle(hc[0], hc[1], 50 * s, k + 34, t, { w: 5 }));
      const F = [], brow = pose.brow || 0;
      F.push(inkDot(hc[0] + 18 * s * fc, hc[1] - 6 * s, 4.5 * s + 1, 4.5 * s + 1, k + 35, t));
      F.push(inkPath([[hc[0] + 8 * s * fc, hc[1] - 20 * s - brow * 12 * s], [hc[0] + 30 * s * fc, hc[1] - 22 * s - brow * 4 * s]], { w: 3.5, seed: k + 36, t, amp: 0.5 }));
      hair.setAttribute('d', inkLoop([[-50, -4], [-44, -36], [-10, -54], [34, -44], [44, -26], [4, -34], [-30, -10]].map(q => [hc[0] + q[0] * s * fc, hc[1] + q[1] * s]), { seed: k + 37, t, amp: 0.8 }));
      if (kind === 'navy' || kind === 'stoker' || kind === 'crowd') {      // moustache
        F.push(inkLoop([[hc[0] + 8 * s * fc, hc[1] + 16 * s], [hc[0] + 46 * s * fc, hc[1] + 10 * s], [hc[0] + 42 * s * fc, hc[1] + 22 * s], [hc[0] + 12 * s * fc, hc[1] + 26 * s]], { seed: k + 38, t, amp: 0.6 }));
      } else F.push(inkPath([[hc[0] + 16 * s * fc, hc[1] + 22 * s], [hc[0] + 36 * s * fc, hc[1] + 21 * s]], { w: 3, seed: k + 39, t, amp: 0.4 }));
      if (pose.mouth) F.push(inkCircle(hc[0] + 28 * s * fc, hc[1] + 32 * s, 6 * s * pose.mouth + 2, k + 41, t, { w: 3 }));
      face.setAttribute('d', F.join(' '));
      soot.setAttribute('d', kind === 'stoker' ? inkDot(hc[0] - 14 * s * fc, hc[1] + 14 * s, 18 * s, 10 * s, k + 42, t) + ' ' + inkDot(sh[0], sh[1] + 70 * s, 26 * s, 16 * s, k + 43, t) : '');
      return { hc, hL, hR, sh };
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

  // ------------------------------------------------------------------ hand-written label (Patrick Hand)
  function label(parent, o, W, H) {
    const g = el(parent, 'g');
    const col = o.color === 'red' ? INK.red : o.color === 'blue' ? INK.blue : o.color === 'paper' ? INK.paperLight : o.color === 'gold' ? INK.gold : INK.ink;
    const halo = el(g, 'text', { 'font-family': INK_FONT, 'font-size': o.size || 64, 'text-anchor': 'middle', fill: 'none', stroke: o.halo === 'ink' ? INK.ink : INK.paperLight, 'stroke-width': 12, 'stroke-linejoin': 'round' });
    const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': o.size || 64, 'text-anchor': 'middle', fill: col });
    const card = o.card ? inkEl(g, INK.paperLight) : null, cardR = o.card ? inkEl(g) : null;
    if (card) { g.insertBefore(cardR, halo); g.insertBefore(card, cardR); }
    halo.textContent = tx.textContent = o.text || '';
    if (o.halo === false) halo.textContent = '';
    if (o.bold) { tx.setAttribute('stroke', col); tx.setAttribute('stroke-width', 2.5); }
    const ul = inkEl(g, col), arrow = inkEl(parent, col);
    function update(lt, t, cues) {
      const a = atOr(cues, o.at, 0.3), p = spring(lt, a, 0.5);
      if (lt < a) { g.setAttribute('transform', 'scale(0)'); arrow.setAttribute('d', ''); return; }
      const x = (o.x ?? 0.5) * W, y = (o.y ?? 0.3) * H;
      const pp = p * (1 + 0.15 * punch(lt, atOr(cues, o.hit, null), 0.7));
      g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${o.rot ?? -3}) scale(${f1(pp * 100) / 100})`);
      const w = (o.text || '').length * (o.size || 64) * 0.22;
      if (card) { const sz = o.size || 64, bx = [[-w * 1.25 - 20, -sz * 0.95], [w * 1.25 + 20, -sz * 0.98], [w * 1.25 + 24, sz * 0.42], [-w * 1.25 - 18, sz * 0.45]]; card.setAttribute('d', inkLoop(bx, { seed: 970 + sz, t, smooth: false, amp: 1 })); cardR.setAttribute('d', inkPath(bx, { w: 5, seed: 971 + sz, t, closed: true, smooth: false, amp: 1 })); }
      ul.setAttribute('d', o.underline === false ? '' : inkPath([[-w, 14], [w, 10]], { w: 5, seed: 900 + (o.text || '').length, t, amp: 1 }));
      if (o.arrow) {
        const q = clamp01((lt - a) / 0.5), tx2 = o.arrow[0] * W, ty2 = o.arrow[1] * H, sx = x + (tx2 > x ? w * 0.6 : -w * 0.6), sy = y + 20;
        const ex = lerp(sx, tx2, q), ey = lerp(sy, ty2, q), ang = Math.atan2(ey - sy, ex - sx);
        arrow.setAttribute('d', q > 0.05 ? inkPath([[sx, sy], [(sx + ex) / 2, (sy + ey) / 2 - 30], [ex, ey]], { w: 6, seed: 950, t }) + ' ' +
          inkPath([[ex - Math.cos(ang - 0.5) * 34, ey - Math.sin(ang - 0.5) * 34], [ex, ey], [ex - Math.cos(ang + 0.5) * 34, ey - Math.sin(ang + 0.5) * 34]], { w: 6, seed: 951, t, smooth: false }) : '');
      }
    }
    return { update };
  }

  window.HMD = { atOr, f1, faceOf, dirOf, R2, blank, flag, smoke, beam, cruiser, sea, person, kasif, label };
})();
