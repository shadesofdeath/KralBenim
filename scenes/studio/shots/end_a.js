// end_a: Shackleton's Endurance (Weddell Sea, 1915) in the parchment ink style (brand/kit/BRAND.md §3, §5; every
// line boils at 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random). Three 2D shots,
// written for 03-shackleton-endurance (chapters 1-3), all parametric. Layout tuned for 16:9, usable in 9:16.
//
// SHOTS.end_a_ice — side view of the three-masted Endurance (black hull, square-rigged foremast, funnel aft) in
//   polar water: drifting floes in three parallax rows, or a solid ice sheet; pressure ridges of tilted ice blocks
//   that rise around the hull, red cracks bursting in the hull, heel / lift / sink (bow first, stern in the air),
//   a sun that sets (polar night: sky hatching + stars) or rises, a far ice coast, crew (hatless, beret) sawing or
//   hacking at the ice, tents on the floe, hand-written labels, camera shake, and Kaşif standing on the ice.
//   P: {
//     surface: "water"|"ice" (default "water"),  pack: 0.6 (floe density 0..1, water only), floes: false (open water),
//     horizon: 0.5,                              // 0..1 of H
//     travel: 0 (px/s floe scroll = the ship sailing ahead), stop: cue (travel brakes to 0 exactly there + jolt),
//     ship: {x: 0.5, y: 0.7 (waterline), scale: 1, to (x at the end of at..at+dur), at, dur, zig: 0 (yaw/bob amp,
//            1 = strong zig-zag), sails: false, smoke: true, heel: {to: -10, at, dur: 2}, lift: {to: 30, at, dur},
//            sink: {at, dur: 3.5}, bump: [cue...] (hull jolts), frozen: false (ice band welded round the hull)},
//     ridges: {at, dur: 3, h: 1 (height), side: "both"|"left"|"right"} | true,   // pressure ridge blocks rise
//     cracks: [{at: cue, x: -0.1 (hull fraction -0.5..0.5), y: 0.5 (0 = deck, 1 = waterline), bang: "ÇAT!"}],
//     ice_cracks: {at, x: 0.3, y: 0.8, dur: 1.4},     // zig-zag cracks running across the ice
//     sun: {x: 0.8, y: 0.3, set: cue, rise: cue, dur: 3}, night: true | cue (sky hatching fades in from that cue),
//     dawn: cue (night fades out), coast: {at: cue, from: 0.04, to: 0.6} (far white ice cliffs rise on the horizon),
//     crew: [{x: 0.3, y: 0.86, scale: 0.55, pose: "idle", tool: "saw"|"pick"|null, accessory: "beret", face: "right",
//             at, then, to, walk_at, walk_dur, emotion, beard}],
//     tents: {xs: [0.2, 0.3], y: 0.86, at, size: 1},
//     sink extras: {tilt_at: cue (bow under, stern rises to ~35°), gone: cue (ship disappears, a ripple ring + floating
//             planks stay)}; vise: {at} (two red arrows push in on both sides of the hull); night_dense: true (darker sky);
//     book: {x, y, at} (open journal on a crate, a pencil line writes itself),
//     games: {ball: cue|seconds (a ball arcs between crew[0] and crew[1]), dogs: cue (two dogs race across the ice),
//             table: {at: cue, x: 0.5} (a winter feast table with a steaming pot pops up)},
//     labels: [{text, x, y, at, color: "ink"|"red"|"blue", size: 64, arrow: [x, y]}],
//     shake: [cue...], kasif: {x: 0.12, y: 0.86, scale: 0.62, pose: "look", at, then, dir, face, emotion, emotion0,
//             to, walk_at, walk_dur, seq: [{at, pose, dir, face, emotion}]},
//     zoom: 1.05, focus: [0.5, 0.55]
//   }   cues: anything named above
//
// SHOTS.end_a_top — bird's-eye diagram: the hull (almond-shaped from above, masts + yards) in a lead of dark water
//   on a cracked ice sheet; on `close` the lead shrinks and the ice welds round the hull; on `bar` a grid of
//   chocolate squares draws itself over the ice and the hull turns into an almond (the crew's own simile).
//   P: {close: cue, bar: cue, labels: [...as above], kasif: {...}, zoom: 1.08}   cues: close, bar, labels/kasif
//
// SHOTS.end_a_hull — cross-section diagrams of a hull between two ice slabs (why Endurance was crushed):
//   mode "fram": round bowl hull; on `squeeze` the slabs push in, slide under it and pop it upwards.
//   mode "endurance": straight-sided hull; on `squeeze` the walls bend in, on `crack` the deck beams snap (red).
//     compare: true adds a small Fram already lifted on the left (green ✓) and a red ✗ for Endurance.
//   mode "both": the two outlines side by side (labels "Fram" / "Endurance", question marks), Kaşif between.
//   mode "pump": Endurance section, water rising in the hold, two crew rocking a hand pump on deck, a jet over
//     the side.
//   P: {mode, squeeze: cue, crack: cue, labels: [...], kasif: {...}, arrows: true, zoom: 1.05}
//   cues: squeeze, crack, mark (✓/✗), labels/kasif "at" names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = INK;
  const FR = 'Fraunces, Georgia, serif';
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const f3 = v => Math.round(v * 1000) / 1000;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const COL = { red: C.red, ink: C.ink, blue: C.blue, gold: C.gold, green: C.green, soft: C.inkSoft };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const circ = (cx, cy, r, n = 12) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
  const xf = (pts, dx, dy, s = 1, rot = 0) => {
    const c = Math.cos(rot), si = Math.sin(rot);
    return pts.map(([x, y]) => [dx + (x * c - y * si) * s, dy + (x * si + y * c) * s]);
  };

  // stroke specs -> filled + outlined ink paths in a group; returns draw(t, map?) (map transforms points)
  function strokeSet(g, specs, seed) {
    const parts = specs.map(st => ({ st, f: st.f ? inkEl(g, st.f, st.fo != null ? { 'fill-opacity': st.fo } : {}) : null, r: st.w ? inkEl(g, st.col || C.ink) : null }));
    return (t, map) => parts.forEach((pp, i) => {
      const pts = map ? map(pp.st.p, pp.st) : pp.st.p;
      const o = { seed: seed + i * 7, t, amp: pp.st.amp ?? 1.1, smooth: pp.st.sm !== 0 };
      if (pp.f) pp.f.setAttribute('d', inkLoop(pts, o));
      if (pp.r) pp.r.setAttribute('d', inkPath(pts, Object.assign({}, o, { w: pp.st.w, closed: !!pp.st.c })));
    });
  }

  // ---------------------------------------------------------------- Kaşif / crew rigs (seq support)
  function makeRig(parent, K, seed, portrait, isK) {
    if (!K || typeof KASIF === 'undefined') return null;
    const scale = K.scale ?? (portrait ? 0.75 : 0.62);
    return { K, scale, isK, rig: KASIF.create(el(parent, 'g'), { scale, hat: isK, accessory: isK ? null : (K.accessory || 'beret'), beard: isK ? null : (K.beard || null), seed: seed + 3 }) };
  }
  function rigState(R, lt, cues, W, H, portrait) {
    const K = R.K, at = atOr(cues, K.at, null);
    let x = (K.x ?? 0.12) * W, face = K.face === 'left' ? -1 : 1, walking = false, ph = 0;
    const y = (K.y ?? (portrait ? 0.62 : 0.86)) * H;
    if (K.to != null) {
      const wa = atOr(cues, K.walk_at, 0.15), wd = K.walk_dur ?? 2, p = clamp01((lt - wa) / wd), x1 = K.to * W;
      walking = lt >= wa && p < 1;
      if (walking || p >= 1) face = x1 >= x ? 1 : -1;
      const d = Math.abs(x1 - x) * p;
      x = lerp(x, x1, p);
      ph = d / (KASIF.gait('walk') * R.scale);
      if (p >= 1 && K.face) face = K.face === 'left' ? -1 : 1;
    }
    const after = at != null && lt >= at;
    let pose = walking ? 'walk' : after ? (K.then || 'shock') : (K.pose || 'idle');
    let since = after ? lt - at : lt, dir = typeof K.dir === 'number' ? K.dir : DIRS[K.dir] ?? 25;
    let emotion = after ? (K.emotion || (pose === 'shock' ? 'surprised' : null)) : (K.emotion0 || null);
    let prev = after ? { pose: K.pose || 'idle', at } : null;
    for (const s of K.seq || []) {
      const sa = atOr(cues, s.at, null);
      if (sa == null || lt < sa || walking) continue;
      prev = { pose, at: sa };
      pose = s.pose || pose; since = lt - sa;
      if (s.dir != null) dir = typeof s.dir === 'number' ? s.dir : DIRS[s.dir] ?? dir;
      if (s.face) face = s.face === 'left' ? -1 : 1;
      if (s.emotion) emotion = s.emotion;
    }
    const o = { x, y, face, since, dir, ph, emotion };
    if (prev && !walking && since < 0.32) { o.prev = { pose: prev.pose, since: prev.at, dir }; o.mix = since / 0.32; }
    return { pose, o, x, y, face };
  }
  function updRig(R, lt, t, cues, env, W, H, portrait, extraY = 0) {
    if (!R) return null;
    const s = rigState(R, lt, cues, W, H, portrait);
    s.o.y += extraY;
    if (R.isK) { const words = env.words || (typeof WORDS !== 'undefined' ? WORDS : null); s.o.mouth = inkTalk(t, words); }
    R.rig.update(t, s.pose, s.o);
    return s;
  }

  // labels (Patrick Hand on a paper-light halo, optional arrow)
  function makeLabels(parent, list, portrait) {
    return (list || []).map((L, k) => {
      const g = el(parent, 'g');
      const arrow = L.arrow ? inkEl(g, COL[L.color] || C.ink) : null;
      const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': L.size || (portrait ? 72 : 64), 'text-anchor': 'middle', fill: COL[L.color] || C.ink,
        style: `paint-order: stroke; stroke: ${C.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
      t.textContent = L.text;
      return { L, k, g, t, arrow };
    });
  }
  function updLabels(labs, lt, t, cues, W, H, seed) {
    labs.forEach(({ L, k, g, t: tx, arrow }) => {
      const at = atOr(cues, L.at, 0.4 + k * 0.5), p = spring(lt, at, 0.6), x = L.x * W, y = L.y * H;
      g.setAttribute('opacity', f3(clamp01(lin(lt, at, 0.12))));
      tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(y));
      g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${f3(lerp(0.6, 1, p))}) rotate(${f1(-2 + Math.sin(t * 0.7 + k) * 1.2)}) translate(${f1(-x)} ${f1(-y)})`);
      if (arrow) {
        const ex = L.arrow[0] * W, ey = L.arrow[1] * H, sx = x + (ex > x ? 40 : -40) * 0, sy = y + (ey > y ? 24 : -70);
        const q = prog(lt, at + 0.2, 0.5), mx = (sx + ex) / 2 + (ex > sx ? -50 : 50), my = (sy + ey) / 2;
        const pts = []; for (let i = 0; i <= 10; i++) { const u = i / 10 * q; pts.push([(1 - u) * (1 - u) * sx + 2 * u * (1 - u) * mx + u * u * ex, (1 - u) * (1 - u) * sy + 2 * u * (1 - u) * my + u * u * ey]); }
        if (q > 0.05) {
          const a = pts[10], b = pts[8], ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
          let d = inkPath(pts, { seed: seed + 900 + k, t, w: 6, amp: 1.2 });
          if (q > 0.9) d += ' ' + inkPath([[a[0] - 30 * Math.cos(ang - 0.5), a[1] - 30 * Math.sin(ang - 0.5)], a, [a[0] - 30 * Math.cos(ang + 0.5), a[1] - 30 * Math.sin(ang + 0.5)]], { seed: seed + 950 + k, t, w: 6, amp: 0.8 });
          arrow.setAttribute('d', d);
        } else arrow.setAttribute('d', '');
      }
    });
  }

  // ---------------------------------------------------------------- Endurance, side view (bow +x, waterline y 0)
  function enduranceSide(sails) {
    const hull = [], fore = [], main = [], miz = [];
    hull.push({ p: [[-300, -80], [-160, -66], [60, -63], [236, -72], [306, -94], [292, -40], [262, 14], [196, 44], [-214, 44], [-282, 14], [-304, -34]], c: 1, f: C.ink, w: 5 });
    hull.push({ p: [[-286, -56], [-120, -46], [80, -44], [270, -58]], w: 3.5, col: C.paperDark });
    for (let i = 0; i < 6; i++) hull.push({ p: circ(-190 + i * 70, -30, 6, 8), f: C.paperDark, amp: 0.4 });
    hull.push({ p: [[-130, -64], [-130, -100], [-10, -100], [-10, -64]], c: 1, f: C.paperDark, w: 4, sm: 0 });
    hull.push({ p: [[-90, -100], [-62, -100], [-64, -158], [-88, -158]], c: 1, f: C.inkSoft, w: 4, sm: 0 });
    hull.push({ p: [[-90, -150], [-62, -150]], w: 5 });
    hull.push({ p: [[290, -88], [418, -126]], w: 8 });
    hull.push({ p: [[-300, -80], [-330, -86]], w: 5 });
    hull.push({ p: [[200, -70], [196, -96], [260, -100], [262, -76]], c: 1, f: C.paperDark, w: 3, sm: 0 });
    // foremast (square-rigged): x 170
    const FX = 172;
    fore.push({ p: [[FX, -70], [FX, -430]], w: 8 });
    [[-180, 190], [-245, 168], [-305, 138], [-362, 108], [-410, 80]].forEach(([y, w]) => {
      if (sails) fore.push({ p: [[FX - w / 2, y], [FX + w / 2, y], [FX + w / 2 - 8, y + 56], [FX - w / 2 + 8, y + 56]], c: 1, f: C.paperLight, w: 3.5 });
      fore.push({ p: [[FX - w / 2, y], [FX + w / 2, y]], w: 6 });
      if (!sails) fore.push({ p: [[FX - w / 2 + 6, y + 6], [FX + w / 2 - 6, y + 6]], w: 7, col: C.paperDark });
    });
    fore.push({ p: [[FX, -430], [418, -126]], w: 2.5, col: C.inkSoft });
    fore.push({ p: [[FX, -360], [FX + 150, -72]], w: 2.5, col: C.inkSoft });
    fore.push({ p: [[FX, -360], [FX - 110, -72]], w: 2.5, col: C.inkSoft });
    if (sails) fore.push({ p: [[FX + 8, -300], [400, -128], [300, -92]], c: 1, f: C.paperLight, w: 3.5 });
    // mainmast: x 20 (fore-and-aft)
    const MX = 20;
    main.push({ p: [[MX, -64], [MX, -440]], w: 7.5 });
    main.push({ p: [[MX, -120], [MX - 150, -132]], w: 5 });
    main.push({ p: [[MX, -330], [MX - 130, -300]], w: 5 });
    if (sails) main.push({ p: [[MX - 4, -326], [MX - 128, -300], [MX - 146, -136], [MX - 4, -124]], c: 1, f: C.paperLight, w: 3.5 });
    main.push({ p: [[MX, -440], [FX, -430]], w: 2.5, col: C.inkSoft });
    main.push({ p: [[MX, -380], [MX + 120, -66]], w: 2.5, col: C.inkSoft });
    main.push({ p: [[MX, -380], [MX - 90, -66]], w: 2.5, col: C.inkSoft });
    main.push({ p: [[MX, -440], [MX + 34, -450], [MX + 62, -436]], w: 5, col: C.red, flag: 1 });
    // mizzen: x -190
    const ZX = -196;
    miz.push({ p: [[ZX, -72], [ZX, -360]], w: 7 });
    miz.push({ p: [[ZX, -116], [ZX - 120, -124]], w: 5 });
    miz.push({ p: [[ZX, -280], [ZX - 100, -256]], w: 5 });
    if (sails) miz.push({ p: [[ZX - 4, -276], [ZX - 98, -256], [ZX - 118, -128], [ZX - 4, -120]], c: 1, f: C.paperLight, w: 3.5 });
    miz.push({ p: [[ZX, -360], [MX, -440]], w: 2.5, col: C.inkSoft });
    miz.push({ p: [[ZX, -300], [ZX + 100, -70]], w: 2.5, col: C.inkSoft });
    miz.push({ p: [[ZX, -300], [ZX - 96, -76]], w: 2.5, col: C.inkSoft });
    return { hull, masts: [{ S: fore, x: FX, y: -70 }, { S: main, x: MX, y: -64 }, { S: miz, x: ZX, y: -72 }], funnel: [-76, -160] };
  }

  // floe shape (top ellipse + front thickness skirt), local at (0,0) = centre of top face
  function floeSpecs(r, rx, th) {
    const n = 12, top = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * 6.2832, k = 1 + (r() * 2 - 1) * 0.18;
      top.push([Math.cos(a) * rx * k, Math.sin(a) * rx * 0.2 * k]);
    }
    const front = top.filter(p => p[1] >= -1).sort((a, b) => a[0] - b[0]);
    const skirt = front.concat(front.slice().reverse().map(([x, y]) => [x * 0.96, y + th]));
    return [{ p: skirt, c: 1, f: C.paperDark, w: 3.5, col: C.inkSoft }, { p: top, c: 1, f: C.paperLight, w: 4, col: C.inkSoft },
      { p: [[-rx * 0.3, -rx * 0.04], [rx * 0.1, -rx * 0.06]], w: 2.5, col: C.inkSoft, amp: 0.6 }];
  }

  // ================================================================ end_a_ice
  SH.end_a_ice = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W, sd = seed * 1000, R0 = rng(seed * 97 + 13);
      const HY = (P.horizon ?? (portrait ? 0.46 : 0.5)) * H;
      const S = Object.assign({ x: 0.5, y: portrait ? 0.62 : 0.7, scale: 1, smoke: true }, P.ship || {});
      const shipS = S.scale * (portrait ? 0.82 : 1);
      const WY = S.y * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sky = el(cam, 'g'), far = el(cam, 'g'), sea = el(cam, 'g');
      // sky: sun (clipped at the horizon), night hatching, stars
      const scid = 'endsky' + seed;
      el(el(defs, 'clipPath', { id: scid }), 'rect', { x: -400, y: -400, width: W + 800, height: HY + 400 });
      const skyClip = el(sky, 'g', { 'clip-path': `url(#${scid})` });
      const sun = P.sun ? { f: inkEl(skyClip, C.gold, { 'fill-opacity': 0.55 }), r: inkEl(skyClip, C.inkSoft), rays: inkEl(skyClip, C.gold) } : null;
      const hasNight = P.night != null && P.night !== false;
      const hatch = hasNight ? inkEl(sky, C.ink, { 'fill-opacity': 0 }) : null;
      const stars = hasNight ? inkEl(sky, C.ink, { 'fill-opacity': 0 }) : null;
      // far coast + far horizon floes
      const coast = P.coast ? { f: inkEl(far, C.paperLight), r: inkEl(far, C.ink), h: inkEl(far, C.inkSoft) } : null;
      // sea / ice body
      const water = P.surface !== 'ice';
      el(sea, 'rect', { x: -300, y: HY, width: W + 600, height: H - HY + 300, fill: water ? C.paperDark : C.paperLight });
      const seaLine = inkEl(sea, C.inkSoft), seaHatch = inkEl(sea, C.inkSoft);
      // floe rows: 0 far, 1 mid (behind ship), 2 near (in front of the ship)
      const pack = P.pack ?? 0.6;
      const mkRow = (row, n, y0, y1, rx0, rx1, th, parent) => Array.from({ length: n }, (_, k) => {
        const g = el(parent, 'g'), rx = lerp(rx0, rx1, R0());
        return { row, g, x: (k + R0() * 0.7) / n, y: lerp(y0, y1, R0()), rx, ph: R0() * 6, draw: strokeSet(g, floeSpecs(R0, rx, th), sd + 300 + row * 100 + k * 13) };
      });
      const shipLayer = el(cam, 'g');
      const midG = el(sea, 'g');
      let floes = [];
      if (water && P.floes !== false) {
        floes = floes.concat(mkRow(0, Math.round(10 + 10 * pack), HY + 8, HY + 34, 26, 60, 6, midG));
        floes = floes.concat(mkRow(1, Math.round(4 + 6 * pack), HY + 50, WY - 40, 60, 130, 14, midG));
      } else {
        // ice sheet: hummocks scattered behind the ship
        floes = floes.concat(mkRow(1, 9, HY + 30, WY - 30, 50, 110, 12, midG));
      }
      floes.sort((a, b) => a.y - b.y);
      floes.forEach(fl => midG.appendChild(fl.g));
      // ship (clipped at the waterline so it can sink)
      const shcid = 'endship' + seed;
      const shClipRect = el(el(defs, 'clipPath', { id: shcid }), 'rect', { x: -2000, y: -2000, width: W + 4000, height: WY + 2000 + 30 });
      const shipClip = el(shipLayer, 'g', { 'clip-path': `url(#${shcid})` });
      const shipG = el(shipClip, 'g');
      const def = enduranceSide(!!S.sails);
      const hullG = el(shipG, 'g');
      const mastGs = def.masts.map(m => ({ m, g: el(shipG, 'g') }));
      shipG.appendChild(hullG);   // hull in front of the mast feet
      const hullDraw = strokeSet(hullG, def.hull, sd + 10);
      mastGs.forEach((mg, i) => { mg.draw = strokeSet(mg.g, mg.m.S, sd + 60 + i * 40); });
      const crackG = el(shipG, 'g');
      const cracks = (P.cracks || []).map((c, k) => ({ c, k, r: inkEl(crackG, C.red), flash: inkEl(crackG, C.gold, { 'fill-opacity': 0 }) }));
      const smoke = S.smoke && !S.sink ? Array.from({ length: 6 }, () => inkEl(shipLayer, C.inkSoft, { 'fill-opacity': 0 })) : [];
      const fx = el(cam, 'g');
      const bangs = (P.cracks || []).filter(c => c.bang).map((c, k) => {
        const t = el(fx, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 96 : 88, 'text-anchor': 'middle', fill: C.red,
          style: `paint-order: stroke; stroke: ${C.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
        t.textContent = c.bang; return { c, t, k };
      });
      const ripple = S.sink ? { r: inkEl(fx, C.inkSoft), deb: inkEl(fx, C.inkSoft) } : null;
      const vise = P.vise ? inkEl(fx, C.red) : null;
      // frozen band + pressure ridges (in front of the hull)
      const frontG = el(cam, 'g');
      const frozen = S.frozen ? { f: inkEl(frontG, C.paperLight), r: inkEl(frontG, C.inkSoft), h: inkEl(frontG, C.inkSoft) } : null;
      const RG = P.ridges === true ? {} : P.ridges;
      const ridges = [];
      if (RG) {
        const side = RG.side || 'both', hk = RG.h ?? 1;
        const half = 320 * shipS;
        ['left', 'right'].forEach((sdn, si) => {
          if (side !== 'both' && side !== sdn) return;
          for (let k = 0; k < 7; k++) {
            const g = el(frontG, 'g'), w = lerp(70, 150, R0()) * shipS * hk, h = lerp(26, 44, R0()) * shipS * hk;
            const sgn = si === 0 ? -1 : 1;
            const base = sgn * (half * lerp(0.15, 1.05, k / 6) + lerp(0, 60, R0()));
            const ang = sgn * -lerp(18, 58, R0()) * (k % 3 === 2 ? 0.5 : 1);
            const rise = lerp(40, 150, R0()) * hk * shipS * (1 - k / 9);
            const box = [[-w / 2, -h / 2], [w / 2, -h / 2 + R0() * 6], [w / 2 - 4, h / 2], [-w / 2 + 6, h / 2]];
            ridges.push({ g, k, sgn, base, ang, rise, delay: R0() * 0.5, draw: strokeSet(g, [{ p: box, c: 1, f: C.paperLight, w: 4.5, sm: 0 },
              { p: [[-w / 2 + 10, h / 2 - 4], [w / 2 - 10, h / 2 - 2]], w: 5, col: C.paperDark, sm: 0 }], sd + 500 + si * 80 + k * 9) });
          }
        });
        ridges.sort((a, b) => a.rise - b.rise);
        ridges.forEach(r => frontG.appendChild(r.g));
      }
      // near floes / near ice (in front of the ship)
      const nearG = el(cam, 'g');
      let near = [];
      if (water && P.floes !== false) near = mkRow(2, Math.round(3 + 4 * pack), WY + 60, H * 0.97, 130, 260, 26, nearG);
      const iceCr = P.ice_cracks ? inkEl(nearG, C.ink) : null;
      const nearHatch = !water ? inkEl(nearG, C.inkSoft) : null;
      // tents, crew, Kaşif (on the near ice)
      const tentG = el(cam, 'g');
      const TT = P.tents;
      const tents = TT ? (TT.xs || [0.2, 0.3]).map((x, k) => {
        const g = el(tentG, 'g'), s = (TT.size || 1) * (portrait ? 0.8 : 1);
        return { g, x, k, draw: strokeSet(g, [{ p: [[-70 * s, 0], [0, -110 * s], [70 * s, 0]], c: 1, f: C.paperLight, w: 5, sm: 0 },
          { p: [[0, -110 * s], [-6 * s, 0]], w: 3.5, sm: 0 }, { p: [[-14 * s, 0], [0, -46 * s], [16 * s, 0]], c: 1, f: C.inkSoft, w: 3, sm: 0 },
          { p: [[0, -110 * s], [8 * s, -132 * s]], w: 4 }, { p: [[-90 * s, 4], [90 * s, 4]], w: 4, col: C.inkSoft }], sd + 700 + k * 17) };
      }) : [];
      const castG = el(cam, 'g');
      const crew = (P.crew || []).map((m, k) => {
        const tool = m.tool ? inkEl(castG, C.ink) : null;
        const R = makeRig(castG, Object.assign({ scale: portrait ? 0.62 : 0.52 }, m), seed + 40 + k * 11, portrait, false);
        return { R, tool, m, k };
      });
      const BK = P.book || null;
      const book = BK ? { g: el(castG, 'g'), pen: inkEl(castG, C.ink), line: inkEl(castG, C.ink) } : null;
      if (book) book.draw = strokeSet(book.g, [{ p: [[-90, 0], [90, 0], [90, -70], [-90, -70]], c: 1, f: C.paperDark, w: 5, sm: 0 },
        { p: [[-80, -60], [-90, -70]], w: 3, col: C.inkSoft },
        { p: [[0, -76], [-110, -90], [-106, -120], [0, -106]], c: 1, f: C.paperLight, w: 4, sm: 0 },
        { p: [[0, -76], [110, -90], [106, -120], [0, -106]], c: 1, f: C.paperLight, w: 4, sm: 0 },
        { p: [[-90, -100], [-20, -94]], w: 2.5, col: C.inkSoft }, { p: [[-92, -110], [-24, -103]], w: 2.5, col: C.inkSoft }], sd + 1100);
      const GM = P.games || null;
      const ball = GM && GM.ball != null ? { f: inkEl(castG, C.paperLight), r: inkEl(castG, C.ink), sh: inkEl(castG, C.ink, { 'fill-opacity': 0.15 }) } : null;
      const dogs = GM && GM.dogs ? [0, 1].map(k => ({ k, f: inkEl(castG, k ? C.inkSoft : C.paperDark), r: inkEl(castG, C.ink) })) : null;
      const table = GM && GM.table ? { g: el(castG, 'g'), steam: inkEl(castG, C.inkSoft, { 'fill-opacity': 0 }) } : null;
      if (table) table.draw = strokeSet(table.g, [{ p: [[-150, -70], [150, -70], [150, -54], [-150, -54]], c: 1, f: C.paperDark, w: 5, sm: 0 },
        { p: [[-130, -54], [-130, 0]], w: 6 }, { p: [[130, -54], [130, 0]], w: 6 },
        { p: [[-30, -70], [-34, -120], [34, -120], [30, -70]], c: 1, f: C.inkSoft, w: 5, sm: 0 }, { p: [[-44, -120], [44, -120]], w: 6 },
        { p: inkEllipsePts(-95, -76, 30, 8, 3, 10), c: 1, f: C.paperLight, w: 3.5 }, { p: inkEllipsePts(95, -76, 30, 8, 4, 10), c: 1, f: C.paperLight, w: 3.5 },
        { p: [[-80, -86], [-110, -84]], w: 4, col: C.red }, { p: [[80, -86], [112, -88]], w: 4, col: C.gold }], sd + 980);
      const kas = makeRig(root, P.kasif, seed, portrait, true);
      const labs = makeLabels(root, P.labels, portrait);
      const FOC = [(P.focus || [0.5, 0.55])[0] * W, (P.focus || [0.5, 0.55])[1] * H];
      const CR = rng(seed * 7 + 5);
      const crackPts = P.ice_cracks ? Array.from({ length: 5 }, (_, k) => {
        const a = -0.5 + k * 0.35 + (CR() - 0.5) * 0.3, pts = [[0, 0]];
        let x = 0, y = 0;
        for (let i = 0; i < 6; i++) { x += Math.cos(a) * 52 * (k % 2 ? -1 : 1) + (CR() - 0.5) * 30; y += Math.sin(a) * 10 - 6 + (CR() - 0.5) * 16; pts.push([x, y]); }
        return pts;
      }) : [];

      // travel distance (px of near-row scroll) at lt: constant speed, brakes to 0 at the stop cue
      const travelAt = (lt, cues) => {
        const v = P.travel || 0;
        if (!v) return 0;
        const st = atOr(cues, P.stop, null);
        if (st == null || lt < st - 0.7) return v * lt;
        const b0 = Math.max(0, st - 0.7);
        const u = clamp01((lt - b0) / (st - b0 || 1));
        return v * b0 + v * (st - b0) * (u - u * u / 2);
      };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // camera: push-in + shake
          let shake = 0;
          for (const sc of P.shake || []) { const a = atOr(cues, sc, null); if (a != null && lt >= a) shake += Math.exp(-(lt - a) * 5) * (lt - a < 1.2 ? 1 : 0); }
          for (const c of P.cracks || []) { const a = atOr(cues, c.at, null); if (a != null && lt >= a) shake += 0.7 * Math.exp(-(lt - a) * 6) * (lt - a < 1 ? 1 : 0); }
          const st0 = atOr(cues, P.stop, null);
          if (st0 != null && lt >= st0) shake += 0.8 * Math.exp(-(lt - st0) * 5) * (lt - st0 < 1 ? 1 : 0);
          const sx = Math.sin(t * 53) * 14 * shake, sy = Math.cos(t * 41) * 9 * shake;
          const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(sx + Math.sin(t * 0.31) * 5)} ${f1(sy + Math.cos(t * 0.23) * 4)}) translate(${f1(FOC[0])} ${f1(FOC[1])}) scale(${z.toFixed(4)}) translate(${f1(-FOC[0])} ${f1(-FOC[1])})`);
          // sun
          if (sun) {
            const U = P.sun, setA = atOr(cues, U.set, null), riseA = atOr(cues, U.rise, null), d = U.dur ?? 3;
            let k = 0;                                   // 0 = up, 1 = below the horizon
            if (setA != null) k = progIO(lt, setA, d);
            if (riseA != null) k = 1 - progIO(lt, riseA, d);
            const r = portrait ? 80 : 70, sxp = (U.x ?? 0.8) * W, y0 = (U.y ?? 0.3) * H, syp = lerp(y0, HY + r * 1.4, k);
            sun.f.setAttribute('d', inkCircle(sxp, syp, r, sd + 9, t, { fill: true }));
            sun.r.setAttribute('d', inkCircle(sxp, syp, r, sd + 9, t, { w: 4 }));
            let rd = '';
            for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832 + t * 0.15, r0 = r + 18, r1 = r + 46 + 10 * Math.sin(t * 1.5 + i); rd += inkPath([[sxp + Math.cos(a) * r0, syp + Math.sin(a) * r0], [sxp + Math.cos(a) * r1, syp + Math.sin(a) * r1]], { seed: sd + 20 + i, t, w: 4 }) + ' '; }
            sun.rays.setAttribute('d', rd);
          }
          // night
          if (hatch) {
            const nAt = P.night === true ? -1 : atOr(cues, P.night, 0);
            let nk = P.night === true ? 1 : progIO(lt, nAt, 2.4);
            const dA = atOr(cues, P.dawn, null);
            if (dA != null) nk *= 1 - progIO(lt, dA, 2.4);
            let d = '';
            const NL = P.night_dense ? 96 : 52;
            for (let i = 0; i < NL; i++) {
              const x0 = -120 + i * (W + 240) / NL, len = HY * (0.5 + 0.45 * ((i * 37) % 11) / 11);
              d += inkPath([[x0, -20], [x0 + len * 0.3, -20 + len]], { seed: sd + 5 + i, t, w: 2.2, amp: 1.2 }) + ' ';
            }
            hatch.setAttribute('d', d); hatch.setAttribute('fill-opacity', f3((P.night_dense ? 0.5 : 0.34) * nk));
            let sdd = '';
            for (let i = 0; i < 18; i++) { const sx2 = (0.05 + ((i * 0.618) % 1) * 0.9) * W, sy2 = (0.05 + ((i * 0.37) % 1) * 0.36) * HY * 1.6, tw = 3 + 2.5 * (0.5 + 0.5 * Math.sin(t * 2 + i)); if (sy2 < HY - 20) sdd += inkDot(sx2, sy2, tw, tw, sd + 300 + i, t) + ' '; }
            stars.setAttribute('d', sdd); stars.setAttribute('fill-opacity', f3(nk * 0.85));
          }
          // far coast: white tabular ice cliffs rising on the horizon
          if (coast) {
            const at = atOr(cues, P.coast.at, 0.5), p = progIO(lt, at, 1.6);
            const x0 = (P.coast.from ?? 0.04) * W, x1 = (P.coast.to ?? 0.6) * W, h = (portrait ? 70 : 64) * p, dy = (1 - p) * 30;
            const pts = [[x0, HY + 2], [x0 + 20, HY - h * 0.7 + dy], [lerp(x0, x1, 0.2), HY - h + dy], [lerp(x0, x1, 0.45), HY - h * 0.95 + dy], [lerp(x0, x1, 0.5), HY - h * 1.5 + dy], [lerp(x0, x1, 0.62), HY - h * 1.3 + dy], [lerp(x0, x1, 0.7), HY - h + dy], [x1 - 30, HY - h * 0.85 + dy], [x1, HY + 2]];
            coast.f.setAttribute('d', inkLoop(pts, { seed: sd + 30, t, smooth: false, amp: 1 }));
            coast.r.setAttribute('d', p > 0.02 ? inkPath(pts.slice(1, 8), { seed: sd + 30, t, w: 4, smooth: false }) : '');
            let hd = '';
            for (let i = 0; i < 14 && p > 0.3; i++) { const x = lerp(x0 + 30, x1 - 40, i / 13); hd += inkPath([[x, HY - h * 0.8 + dy + 6], [x + 3, HY - 4]], { seed: sd + 40 + i, t, w: 2.5 }) + ' '; }
            coast.h.setAttribute('d', hd);
            coast.f.setAttribute('fill-opacity', f3(clamp01(p * 2)));
          }
          // sea surface line + hatching
          const tr = travelAt(lt, cues);
          const sp = []; for (let i = 0; i <= 24; i++) sp.push([-200 + i * (W + 400) / 24, HY + Math.sin(i * 1.3 + t * 1.2) * 2]);
          seaLine.setAttribute('d', inkPath(sp, { seed: sd + 70, t, w: 4 }));
          let wd = '';
          if (water) {
            for (let r = 0; r < 4; r++) for (let i = 0; i < 8; i++) {
              const y = lerp(HY + 30, H * 0.98, (r + 0.5) / 4), x = (((i * 0.127 + r * 0.071) * (W + 300) - tr * (0.4 + r * 0.25) - t * (10 + r * 4)) % (W + 300) + (W + 300)) % (W + 300) - 150, w = [];
              for (let j = 0; j <= 6; j++) w.push([x + j * 12, y + Math.sin(j * 1.7 + t * 2) * 4]);
              wd += inkPath(w, { seed: sd + 80 + r * 10 + i, t, w: 3 }) + ' ';
            }
          } else {
            for (let i = 0; i < 26; i++) {
              const y = lerp(HY + 20, H * 0.98, ((i * 0.61) % 1)), x = ((((i * 0.383) % 1) * (W + 300) - tr * 0.6) % (W + 300) + (W + 300)) % (W + 300) - 150;
              wd += inkPath([[x, y], [x + 60 + (i % 3) * 20, y + 2]], { seed: sd + 80 + i, t, w: 2.5 }) + ' ';
            }
          }
          seaHatch.setAttribute('d', wd);
          // floes (parallax scroll)
          const rowK = [0.25, 0.55, 1.15];
          const placeFloe = fl => {
            const span = W + 640, x = ((((fl.x * span - tr * rowK[fl.row]) % span) + span) % span) - 320;
            const bob = Math.sin(t * 1.1 + fl.ph) * (fl.row === 2 ? 4 : 2);
            fl.g.setAttribute('transform', `translate(${f1(x)} ${f1(fl.y + bob)})`);
            fl.draw(t);
          };
          floes.forEach(placeFloe);
          near.forEach(placeFloe);
          // ship pose
          const sAt = atOr(cues, S.at, 0), sDur = S.dur ?? Math.max(1, dur);
          let x = S.x * W;
          if (S.to != null) x = lerp(S.x * W, S.to * W, progIO(lt, sAt, sDur));
          let y = WY, rot = 0;
          const zig = S.zig || 0;
          if (zig) { rot += Math.sin(t * 1.6) * 2.4 * zig; y += Math.sin(t * 2.2) * 5 * zig; x += Math.sin(t * 0.8) * 26 * zig; }
          else if (!S.frozen && !RG) { rot += Math.sin(t * 1.3) * 1.2; y += Math.sin(t * 1.7) * 4; }
          for (const b of S.bump || []) { const a = atOr(cues, b, null); if (a != null && lt >= a && lt < a + 1) { const e = Math.exp(-(lt - a) * 6); rot += Math.sin((lt - a) * 30) * 3 * e; x -= 14 * e; } }
          if (st0 != null && lt >= st0 && lt < st0 + 1) { const e = Math.exp(-(lt - st0) * 6); rot += Math.sin((lt - st0) * 26) * 2.6 * e; x += 18 * e; }
          if (S.heel) rot += lerp(0, S.heel.to ?? -10, progIO(lt, atOr(cues, S.heel.at, 0), S.heel.dur ?? 2));
          if (S.lift) y -= lerp(0, S.lift.to ?? 30, progIO(lt, atOr(cues, S.lift.at, 0), S.lift.dur ?? 2));
          if (RG) { const a = atOr(cues, RG.at, 0.3), p = progIO(lt, a, RG.dur ?? 3); rot += Math.sin(t * 9) * 0.5 * p * (lt - a < (RG.dur ?? 3) + 0.5 ? 1 : 0.3); }
          let sinkP = 0;
          if (S.sink) {
            const a = atOr(cues, S.sink.at, 0.5), d = S.sink.dur ?? 3.5;
            const ta = atOr(cues, S.sink.tilt_at, null), ga = atOr(cues, S.sink.gone, null);
            if (ta != null && ga != null) {
              const p1 = progIO(lt, a, Math.max(0.3, ta - a)), p2 = progIO(lt, ta, Math.max(0.3, ga - ta)), p3 = prog(lt, ga, 0.7);
              rot += 12 * p1 + 23 * p2; y += (50 * p1 + 190 * p2 + 700 * p3) * shipS; x += (20 * p1 + 40 * p2) * shipS;
              sinkP = p3;
            } else {
              sinkP = clamp01((lt - a) / d);
              const tilt = sm(sinkP / 0.45), down = sinkP * sinkP;
              rot += 34 * tilt; y += down * 900 * shipS; x += 60 * tilt * shipS;
            }
          }
          shipG.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f3(rot)}) scale(${f3(shipS)})`);
          hullDraw(t);
          const mFlap = Math.sin(t * 6) * 10;
          mastGs.forEach((mg, i) => {
            mg.draw(t, (p, st) => st.flag ? p.map(([px, py], j) => [px, py + (j ? mFlap * j * 0.4 : 0)]) : p);
            let a = 0;
            if (RG) { const ra = atOr(cues, RG.at, 0.3); a += progIO(lt, ra, RG.dur ?? 3) * (i === 0 ? -3 : i === 1 ? 2 : -1.5) + Math.sin(t * 2 + i) * 0.4; }
            mg.g.setAttribute('transform', `rotate(${f3(a)} ${mg.m.x} ${mg.m.y})`);
          });
          // hull cracks
          cracks.forEach(({ c, k, r, flash }) => {
            const a = atOr(cues, c.at, 0.8 + k * 0.6);
            const hx = (c.x ?? 0) * 600, hy = lerp(-62, 0, c.y ?? 0.5);
            const q = prog(lt, a, 0.18);
            if (lt < a) { r.setAttribute('d', ''); flash.setAttribute('fill-opacity', 0); return; }
            const pts = [[hx, hy - 30]]; const rr = rng(sd + 800 + k);
            for (let i = 1; i <= 6; i++) pts.push([hx + (i % 2 ? 14 : -12) + (rr() - 0.5) * 8, hy - 30 + i * 12 * q]);
            r.setAttribute('d', inkPath(pts, { seed: sd + 810 + k, t, w: 6, amp: 1, smooth: false }));
            const fp = clamp01((lt - a) / 0.35), star = [];
            for (let i = 0; i < 16; i++) { const ang = i / 16 * 6.2832, rr2 = (i % 2 ? 22 : 64) * (0.4 + fp); star.push([hx + Math.cos(ang) * rr2, hy - 10 + Math.sin(ang) * rr2]); }
            flash.setAttribute('d', inkLoop(star, { seed: sd + 820 + k, t, smooth: false, amp: 2 }));
            flash.setAttribute('fill-opacity', f3(0.85 * (1 - fp)));
          });
          bangs.forEach(({ c, t: tx, k }) => {
            const a = atOr(cues, c.at, 0.8), p = spring(lt, a, 0.5), vis = lt >= a && lt < a + 1.6;
            const bx = x + (c.x ?? 0) * 600 * shipS + (k % 2 ? 140 : -140) * shipS, by = y - 200 * shipS;
            tx.setAttribute('x', f1(bx)); tx.setAttribute('y', f1(by));
            tx.setAttribute('opacity', vis ? f3(clamp01(1.6 - (lt - a))) : 0);
            tx.setAttribute('transform', `translate(${f1(bx)} ${f1(by)}) scale(${f3(lerp(0.4, 1, p))}) rotate(${(k % 2 ? 8 : -8)}) translate(${f1(-bx)} ${f1(-by)})`);
          });
          // smoke from the funnel
          smoke.forEach((pf, k) => {
            const per = 2.8, ph = ((t + k * per / smoke.length) % per) / per;
            const [fx0, fy0] = def.funnel, c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180);
            const bx = x + (fx0 * c - fy0 * s) * shipS, by = y + (fx0 * s + fy0 * c) * shipS;
            pf.setAttribute('d', inkCircle(bx - ph * 120 * shipS, by - ph * 110 * shipS, (14 + ph * 34) * shipS, sd + 50 + k, t, { fill: true }));
            pf.setAttribute('fill-opacity', f3((1 - ph) * 0.5));
          });
          // sinking: churned water ring where the hull goes down
          shClipRect.setAttribute('height', f1(WY + 2000 + (S.sink ? 6 : 30)));
          if (ripple) {
            const ga = atOr(cues, S.sink.gone, null) ?? atOr(cues, S.sink.at, 0.5) + (S.sink.dur ?? 3.5) * 0.7;
            const cx = S.x * W + 60 * shipS;
            let d = '', dd = '';
            if (lt > ga - 0.2) {
              for (let i = 0; i < 3; i++) { const u = ((lt - ga + 0.2) * 0.45 + i / 3) % 1, rx = (60 + u * 300) * shipS; d += inkPath(inkEllipsePts(cx, WY + 8, rx, rx * 0.12, 70 + i, 18), { seed: sd + 1000 + i, t, w: 4 * (1 - u) + 1, closed: true }) + ' '; }
              for (let i = 0; i < 6; i++) { const px = cx + (i - 2.5) * 70 * shipS + Math.sin(t * 0.8 + i) * 10, py = WY + 4 + Math.sin(t * 1.6 + i) * 4, a2 = (i * 37 % 40) - 20; const c = Math.cos(a2 * Math.PI / 180) * 34, s2 = Math.sin(a2 * Math.PI / 180) * 34; dd += inkPath([[px - c, py - s2], [px + c, py + s2]], { seed: sd + 1010 + i, t, w: 9 }) + ' '; }
            }
            ripple.r.setAttribute('d', d); ripple.deb.setAttribute('d', dd);
          }
          if (vise) {
            const a = atOr(cues, P.vise.at, 0), p = prog(lt, a, 0.6), hw = 380 * shipS;
            let d = '';
            if (lt >= a) [-1, 1].forEach((sg, k) => {
              const ax = x + sg * (hw + 120 - 40 * Math.abs(Math.sin(t * 3))), ay = WY - 150 * shipS, L = 170 * p;
              d += inkPath([[ax + sg * L, ay], [ax, ay]], { seed: sd + 1020 + k, t, w: 14 }) + ' ' + inkPath([[ax + sg * 46, ay - 40], [ax, ay], [ax + sg * 46, ay + 40]], { seed: sd + 1022 + k, t, w: 14, smooth: false }) + ' ';
            });
            vise.setAttribute('d', d);
          }
          // frozen band round the hull
          if (frozen) {
            const hw = 360 * shipS, pts = [[x - hw * 1.6, WY + 8], [x - hw, WY - 26 * shipS], [x - hw * 0.5, WY - 34 * shipS], [x, WY - 30 * shipS], [x + hw * 0.6, WY - 36 * shipS], [x + hw, WY - 24 * shipS], [x + hw * 1.6, WY + 8], [x + hw * 1.6, WY + 80], [x - hw * 1.6, WY + 80]];
            frozen.f.setAttribute('d', inkLoop(pts, { seed: sd + 600, t }));
            frozen.r.setAttribute('d', inkPath(pts.slice(0, 7), { seed: sd + 600, t, w: 4.5 }));
            let hd = '';
            for (let i = 0; i < 9; i++) { const hx = x - hw * 1.3 + i * hw * 0.33; hd += inkPath([[hx, WY - 6], [hx + 40, WY - 2]], { seed: sd + 610 + i, t, w: 2.5 }) + ' '; }
            frozen.h.setAttribute('d', hd);
          }
          // pressure ridges: blocks rise and tilt against the hull
          if (RG) {
            const a = atOr(cues, RG.at, 0.3), d = RG.dur ?? 3;
            ridges.forEach(r => {
              const p = sm((lt - a - r.delay) / d), grind = Math.sin(t * 7 + r.k) * 2 * p;
              const bx = x + r.base * lerp(1.25, 1, p), by = WY + 14 - r.rise * p;
              r.g.setAttribute('transform', `translate(${f1(bx)} ${f1(by)}) rotate(${f3(r.ang * p + grind)})`);
              r.draw(t);
            });
          }
          // ice cracks
          if (iceCr) {
            const IC = P.ice_cracks, a = atOr(cues, IC.at, 0.5), q = prog(lt, a, IC.dur ?? 1.4);
            const ox = (IC.x ?? 0.3) * W, oy = (IC.y ?? 0.8) * H;
            let d = '';
            if (lt >= a) crackPts.forEach((pts, k) => {
              const n = Math.max(2, Math.round(pts.length * q));
              d += inkPath(pts.slice(0, n).map(([px, py]) => [ox + px, oy + py]), { seed: sd + 850 + k, t, w: 5, smooth: false, amp: 1 }) + ' ';
            });
            iceCr.setAttribute('d', d);
          }
          if (nearHatch) {
            let d = '';
            for (let i = 0; i < 12; i++) { const hx = ((i * 0.29) % 1) * W, hy = lerp(WY + 70, H * 0.97, ((i * 0.53) % 1)); d += inkPath([[hx, hy], [hx + 34, hy - 26], [hx + 70, hy]], { seed: sd + 620 + i, t, w: 3.5 }) + ' '; }
            nearHatch.setAttribute('d', d);
          }
          // tents pop up
          tents.forEach(tn => {
            const a = atOr(cues, TT.at, 0.4) + tn.k * 0.25, p = spring(lt, a, 0.6), tx = tn.x * W, ty = (TT.y ?? 0.86) * H;
            tn.g.setAttribute('opacity', f3(clamp01(lin(lt, a, 0.1))));
            tn.g.setAttribute('transform', `translate(${f1(tx)} ${f1(ty)}) scale(${f3(lerp(0.3, 1, p))} ${f3(lerp(0.1, 1, p) + Math.sin(t * 2 + tn.k) * 0.01)})`);
            tn.draw(t);
          });
          // crew + tools
          crew.forEach(({ R, tool, m, k }) => {
            const s = updRig(R, lt, t, cues, env, W, H, portrait);
            if (!tool || !s) return;
            const sc = R.scale, hx = s.x + s.face * 120 * sc, hy = s.y - 230 * sc;
            if (m.tool === 'saw') {
              const u = Math.sin(t * 7 + k) * 60 * sc;
              tool.setAttribute('d', inkPath([[hx, hy + u - 40 * sc], [hx + s.face * 8, hy + u + 260 * sc]], { seed: sd + 700 + k, t, w: 7 }) + ' ' +
                inkPath([[hx - 24 * sc, hy + u - 40 * sc], [hx + 24 * sc, hy + u - 44 * sc]], { seed: sd + 720 + k, t, w: 9 }));
            } else {
              const ang = (-70 + 95 * (0.5 + 0.5 * Math.sin(t * 5 + k))) * Math.PI / 180, L = 200 * sc;
              const ex = hx + s.face * Math.cos(ang) * L, ey = hy + Math.sin(ang) * L;
              const px = -Math.sin(ang) * 46 * sc * s.face, py = Math.cos(ang) * 46 * sc;
              tool.setAttribute('d', inkPath([[hx, hy], [ex, ey]], { seed: sd + 700 + k, t, w: 7 }) + ' ' + inkPath([[ex - px, ey - py], [ex + px * 1.2, ey + py * 1.2]], { seed: sd + 720 + k, t, w: 9 }));
            }
          });
          const crewXY = crew.map(({ R }) => R ? rigState(R, lt, cues, W, H, portrait) : null);
          if (ball && crewXY[0] && crewXY[1]) {
            const a = atOr(cues, GM.ball, 0), on = lt >= a, per = 1.5, ph = on ? ((lt - a) / per) % 2 : 0;
            const u = ph < 1 ? ph : 2 - ph, A = crewXY[0], B = crewXY[1];
            const bx = lerp(A.x + 50, B.x - 50, sm(u)), gy = lerp(A.y, B.y, u), by = gy - 26 - Math.sin(Math.min(1, ph < 1 ? ph : ph - 1) * Math.PI) * 170;
            ball.f.setAttribute('d', inkCircle(bx, by, 22, sd + 960, t, { fill: true }));
            ball.r.setAttribute('d', inkCircle(bx, by, 22, sd + 960, t, { w: 5 }) + ' ' + inkPath([[bx - 14, by - 8], [bx + 2, by + 4], [bx + 16, by - 6]], { seed: sd + 961, t, w: 3 }));
            ball.sh.setAttribute('d', inkDot(bx, gy - 4, 26, 7, sd + 962, t));
          }
          if (dogs) {
            const a = atOr(cues, GM.dogs, 0.5), d = 3.2;
            dogs.forEach(dg => {
              const p = clamp01((lt - a - dg.k * 0.25) / d), x0 = lerp(-0.12, 1.12, p) * W - dg.k * 40 * (1 - p), y0 = (portrait ? 0.68 : 0.78) * H + dg.k * 34;
              if (lt < a) { dg.f.setAttribute('d', ''); dg.r.setAttribute('d', ''); return; }
              const s = (portrait ? 0.9 : 1) * (dg.k ? 0.9 : 1), ph = t * 14 + dg.k, b = Math.abs(Math.sin(ph)) * 8;
              const body = inkEllipsePts(x0, y0 - 62 * s - b, 62 * s, 22 * s, 21 + dg.k, 12);
              const head = inkEllipsePts(x0 + 66 * s, y0 - 92 * s - b, 22 * s, 18 * s, 23 + dg.k, 10);
              dg.f.setAttribute('d', inkLoop(body, { seed: sd + 970 + dg.k, t }) + ' ' + inkLoop(head, { seed: sd + 972 + dg.k, t }));
              let dd = inkPath(body, { seed: sd + 970 + dg.k, t, w: 5, closed: true }) + ' ' + inkPath(head, { seed: sd + 972 + dg.k, t, w: 5, closed: true });
              dd += ' ' + inkPath([[x0 + 60 * s, y0 - 104 * s - b], [x0 + 64 * s, y0 - 128 * s - b], [x0 + 76 * s, y0 - 106 * s - b]], { seed: sd + 974 + dg.k, t, w: 4, smooth: false });
              dd += ' ' + inkPath([[x0 + 86 * s, y0 - 90 * s - b], [x0 + 100 * s, y0 - 86 * s - b]], { seed: sd + 976 + dg.k, t, w: 6 });
              dd += ' ' + inkPath([[x0 - 58 * s, y0 - 70 * s - b], [x0 - 84 * s, y0 - (96 + Math.sin(t * 18) * 10) * s - b]], { seed: sd + 978 + dg.k, t, w: 5 });
              [[-40, 0], [-24, Math.PI], [36, Math.PI * 0.5], [50, Math.PI * 1.5]].forEach(([lx, o2], j) => {
                const sw = Math.sin(ph + o2) * 22 * s;
                dd += ' ' + inkPath([[x0 + lx * s, y0 - 46 * s - b], [x0 + lx * s + sw, y0 - 4]], { seed: sd + 980 + j + dg.k * 5, t, w: 5 });
              });
              dg.r.setAttribute('d', dd);
            });
          }
          if (book) {
            const a = atOr(cues, BK.at, 0.3), p = spring(lt, a, 0.6), bx = (BK.x ?? 0.5) * W, by = (BK.y ?? 0.86) * H;
            book.g.setAttribute('opacity', f3(clamp01(lin(lt, a, 0.1))));
            book.g.setAttribute('transform', `translate(${f1(bx)} ${f1(by)}) scale(${f3(lerp(0.4, 1, p))})`);
            book.draw(t);
            const w = clamp01((lt - a - 0.3) / 2.5), lx0 = bx + 20, lx1 = lx0 + 70 * w, ly = by - 100 + 7 * (lx1 - lx0) / 70;
            const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8, xx = lerp(lx0, lx1, u); pts.push([xx, by - 104 + u * 6 * w + Math.sin(xx * 0.3) * 3]); }
            book.line.setAttribute('d', lt > a + 0.3 ? inkPath(pts, { seed: sd + 1110, t, w: 3 }) : '');
            const px = lx1 + Math.sin(t * 12) * 3, py = ly - 6;
            book.pen.setAttribute('d', lt >= a ? inkPath([[px, py], [px + 40, py - 70]], { seed: sd + 1111, t, w: 7 }) : '');
          }
          if (table) {
            const a = atOr(cues, GM.table.at, 1), p = spring(lt, a, 0.6), tx = (GM.table.x ?? 0.5) * W, ty = (portrait ? 0.7 : 0.84) * H;
            table.g.setAttribute('opacity', f3(clamp01(lin(lt, a, 0.1))));
            table.g.setAttribute('transform', `translate(${f1(tx)} ${f1(ty)}) scale(${f3(lerp(0.3, 1, p))})`);
            table.draw(t);
            let sd2 = '';
            if (lt >= a) for (let i = 0; i < 3; i++) { const u = ((t * 0.6 + i / 3) % 1); sd2 += inkCircle(tx + Math.sin(u * 6 + i) * 14, ty - 130 - u * 110, 10 + u * 18, sd + 990 + i, t, { fill: true }) + ' '; }
            table.steam.setAttribute('d', sd2); table.steam.setAttribute('fill-opacity', lt >= a ? 0.35 : 0);
          }
          updRig(kas, lt, t, cues, env, W, H, portrait);
          updLabels(labs, lt, t, cues, W, H, sd);
        },
      };
    },
  };

  // ================================================================ end_a_top: bird's-eye almond in chocolate
  SH.end_a_top = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W, sd = seed * 1000, R0 = rng(seed * 31 + 7);
      const Sx = portrait ? { x: 60, y: 300, w: 960, h: 820 } : { x: 340, y: 240, w: 1220, h: 600 };
      const root = el(svg, 'g'), cam = el(root, 'g');
      const cid = 'endtop' + seed;
      el(el(defs, 'clipPath', { id: cid }), 'rect', { x: Sx.x + 6, y: Sx.y + 6, width: Sx.w - 12, height: Sx.h - 12, rx: 10 });
      const sheetSh = inkEl(cam, C.ink, { 'fill-opacity': 0.16 });
      const sheet = inkEl(cam, C.paperLight), sheetR = inkEl(cam, C.ink);
      const inner = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      // ice cells (cracks): jittered grid
      const cracks = inkEl(inner, C.inkSoft);
      const segs = [];
      const nx = 9, ny = 5, gp = [];
      for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) gp.push([Sx.x + (i + (R0() - 0.5) * 0.6) / nx * Sx.w, Sx.y + (j + (R0() - 0.5) * 0.6) / ny * Sx.h]);
      const G = (i, j) => gp[j * (nx + 1) + i];
      for (let j = 0; j <= ny; j++) for (let i = 0; i < nx; i++) if (R0() > 0.25) segs.push([G(i, j), G(i + 1, j)]);
      for (let j = 0; j < ny; j++) for (let i = 0; i <= nx; i++) if (R0() > 0.25) segs.push([G(i, j), G(i, j + 1)]);
      const CX = Sx.x + Sx.w * 0.5, CY = Sx.y + Sx.h * 0.5, HL = portrait ? 300 : 330, HW = portrait ? 92 : 96;
      const almond = (k, n = 28) => { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * 6.2832, c = Math.cos(a), s = Math.sin(a); pts.push([CX + c * HL * k, CY + s * HW * k * (1 - 0.35 * Math.abs(c) ** 3) * (c > 0 ? 1 - 0.25 * c : 1)]); } return pts; };
      const leadF = inkEl(inner, C.paperDark), leadR = inkEl(inner, C.inkSoft), leadW = inkEl(inner, C.inkSoft);
      // chocolate grid
      const tiles = [];
      const tg = el(inner, 'g');
      const tw = portrait ? 160 : 172, th = portrait ? 136 : 140;
      for (let j = 0; j * th < Sx.h; j++) for (let i = 0; i * tw < Sx.w; i++) {
        const x0 = Sx.x + 14 + i * tw, y0 = Sx.y + 14 + j * th, cxx = x0 + tw / 2, cyy = y0 + th / 2;
        if (Math.abs(cxx - CX) < HL * 0.95 && Math.abs(cyy - CY) < HW * 0.9) continue;
        const pts = [[x0 + 10, y0 + 10], [x0 + tw - 10, y0 + 10], [x0 + tw - 10, y0 + th - 10], [x0 + 10, y0 + th - 10]];
        tiles.push({ pts, d: Math.hypot(cxx - CX, (cyy - CY) * 1.6), f: inkEl(tg, C.inkSoft, { 'fill-opacity': 0 }), r: inkEl(tg, C.ink, { 'fill-opacity': 0 }), k: tiles.length });
      }
      const maxD = Math.max(...tiles.map(t => t.d), 1);
      // hull from above
      const hullG = el(inner, 'g');
      const hullF = inkEl(hullG, C.paperDark), hullR = inkEl(hullG, C.ink), deck = inkEl(hullG, C.ink), alm = inkEl(hullG, C.hatBand, { 'fill-opacity': 0 });
      const kas = makeRig(root, P.kasif, seed, portrait, true);
      const labs = makeLabels(root, P.labels, portrait);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.08, progIO(lt, 0, Math.max(1, dur)));
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 5)} ${f1(Math.cos(t * 0.23) * 4)}) translate(${CX} ${CY}) scale(${z.toFixed(4)}) rotate(${f3(-1 + lt * 0.15)}) translate(${-CX} ${-CY})`);
          const sp = ptsRect(Sx.x, Sx.y, Sx.w, Sx.h);
          sheetSh.setAttribute('d', inkLoop(sp.map(([a, b]) => [a + 10, b + 12]), { seed: sd + 1, t, smooth: false }));
          sheet.setAttribute('d', inkLoop(sp, { seed: sd + 2, t, smooth: false }));
          sheetR.setAttribute('d', inkPath(sp, { seed: sd + 2, t, w: 4, closed: true, smooth: false }));
          cracks.setAttribute('d', segs.map((s2, k) => inkPath([s2[0], [(s2[0][0] + s2[1][0]) / 2 + ((k * 37) % 11 - 5) * 3, (s2[0][1] + s2[1][1]) / 2 + ((k * 53) % 9 - 4) * 3], s2[1]], { seed: sd + 10 + k, t, w: 3.5, smooth: false })).join(' '));
          // lead closes
          const ca = atOr(cues, P.close, 0.6), cp = progIO(lt, ca, 2.2);
          const lk = lerp(1.55, 1.03, cp);
          const lp = almond(lk, 22).map(([a, b], i) => [a + Math.sin(i * 2.3) * 22 * (1 - cp), b + Math.cos(i * 1.7) * 14 * (1 - cp)]);
          leadF.setAttribute('d', inkLoop(lp, { seed: sd + 20, t }));
          leadR.setAttribute('d', inkPath(lp, { seed: sd + 20, t, w: 4, closed: true }));
          let wv = '';
          if (cp < 0.9) for (let i = 0; i < 6; i++) { const ang = i / 6 * 6.2832 + t * 0.4, px = CX + Math.cos(ang) * HL * (lk + 1) / 2, py = CY + Math.sin(ang) * HW * (lk + 1) / 2; wv += inkPath([[px - 18, py], [px - 6, py - 5], [px + 6, py], [px + 18, py - 5]], { seed: sd + 30 + i, t, w: 2.5 }) + ' '; }
          leadW.setAttribute('d', wv);
          // chocolate
          const ba = atOr(cues, P.bar, null);
          tiles.forEach(tl => {
            if (ba == null || lt < ba) { tl.f.setAttribute('fill-opacity', 0); tl.r.setAttribute('fill-opacity', 0); return; }
            const p = prog(lt, ba + tl.d / maxD * 0.9, 0.4);
            tl.f.setAttribute('d', inkLoop(tl.pts, { seed: sd + 100 + tl.k, t, smooth: false, amp: 1.2 }));
            tl.r.setAttribute('d', inkPath(tl.pts, { seed: sd + 100 + tl.k, t, w: 4, closed: true, smooth: false, amp: 1.2 }));
            tl.f.setAttribute('fill-opacity', f3(0.32 * p)); tl.r.setAttribute('fill-opacity', f3(0.8 * p));
          });
          // hull (tiny bob in the lead, frozen still after the close)
          const bob = (1 - cp) * Math.sin(t * 1.4) * 1.5, pk = punch(lt, ba, 0.6);
          hullG.setAttribute('transform', `translate(${CX} ${CY}) rotate(${f3(bob)}) scale(${f3(1 + 0.08 * pk)}) translate(${-CX} ${-CY})`);
          const hp = almond(1, 28);
          hullF.setAttribute('d', inkLoop(hp, { seed: sd + 40, t }));
          hullR.setAttribute('d', inkPath(hp, { seed: sd + 40, t, w: 6, closed: true }));
          let dd = '';
          [[0.55, 0.9], [0.05, 1], [-0.5, 0.75]].forEach(([u, wy], k) => {
            const mx = CX + u * HL;
            dd += inkCircle(mx, CY, 14, sd + 50 + k, t, { w: 5 }) + ' ';
            if (k === 0) for (let j = 0; j < 3; j++) dd += inkPath([[mx - 30 + j * 30, CY - HW * wy], [mx - 30 + j * 30 + 6, CY + HW * wy]], { seed: sd + 60 + j, t, w: 4 }) + ' ';
          });
          dd += inkPath([[CX - HL * 0.22, CY - 24], [CX - HL * 0.22, CY + 24], [CX - HL * 0.36, CY + 24], [CX - HL * 0.36, CY - 24]], { seed: sd + 70, t, w: 4, closed: true, smooth: false });
          deck.setAttribute('d', dd);
          if (ba != null && lt >= ba) {
            let ad = '';
            for (let i = 0; i < 5; i++) { const off = (i - 2) * HW * 0.32, pts = []; for (let j = 0; j <= 10; j++) { const u = -0.85 + j * 0.17; pts.push([CX + u * HL, CY + off * Math.sqrt(Math.max(0, 1 - u * u))]); } ad += inkPath(pts, { seed: sd + 80 + i, t, w: 3.5 }) + ' '; }
            alm.setAttribute('d', ad); alm.setAttribute('fill-opacity', f3(prog(lt, ba, 0.5)));
          } else alm.setAttribute('d', '');
          updRig(kas, lt, t, cues, env, W, H, portrait);
          updLabels(labs, lt, t, cues, W, H, sd);
        },
      };
    },
  };
  const ptsRect = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // ================================================================ end_a_hull: cross-sections between ice slabs
  // hull outline (deck at y -150, keel ~ +155, centre 0), kind "round" (Fram) or "box" (Endurance)
  function hullPts(kind, bend = 0) {
    if (kind === 'round') return [[-190, -150], [190, -150], [208, -70], [200, 10], [168, 86], [96, 140], [0, 158], [-96, 140], [-168, 86], [-200, 10], [-208, -70]];
    const b = bend * 46;
    return [[-176, -150], [176, -150], [180 - b * 0.4, -70], [178 - b, 10], [174 - b * 0.5, 90], [150, 136], [0, 156], [-150, 136], [-174 + b * 0.5, 90], [-178 + b, 10], [-180 + b * 0.4, -70]];
  }
  SH.end_a_hull = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const portrait = H > W, sd = seed * 1000;
      const mode = P.mode || 'fram';
      const WL = (portrait ? 0.56 : 0.6) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const water = el(cam, 'rect', { x: -300, y: WL, width: W + 600, height: H - WL + 300, fill: C.paperDark });
      const waterR = inkEl(cam, C.inkSoft), waterH = inkEl(cam, C.inkSoft);
      // hulls to draw: {kind, cx, scale, lift, bend, crack, label, mark}
      const specs = [];
      const big = portrait ? 1.05 : 1;
      if (mode === 'fram') specs.push({ kind: 'round', cx: 0.45, s: big, label: 'Fram', anim: 'lift' });
      else if (mode === 'endurance') {
        if (P.compare) specs.push({ kind: 'round', cx: portrait ? 0.27 : 0.2, s: 0.6 * big, label: 'Fram', anim: 'done', mark: 'check' });
        specs.push({ kind: 'box', cx: P.compare ? (portrait ? 0.62 : 0.53) : 0.45, s: big * (P.compare ? 0.95 : 1), label: P.compare ? 'Endurance' : null, anim: 'crush', mark: P.compare ? 'x' : null });
      } else if (mode === 'both') {
        specs.push({ kind: 'round', cx: portrait ? 0.27 : 0.25, s: 0.78 * big, label: 'Fram', anim: 'intro', q: true });
        specs.push({ kind: 'box', cx: portrait ? 0.7 : 0.6, s: 0.78 * big, label: 'Endurance', anim: 'intro', q: true });
      } else specs.push({ kind: 'box', cx: 0.42, s: big * 1.08, anim: 'pump' });
      const hulls = specs.map((h, k) => {
        const g = el(cam, 'g'), cx = h.cx * W;
        const cidk = 'endhull' + seed + '_' + k;
        const clipPath = el(defs, 'clipPath', { id: cidk });
        const clipP = el(clipPath, 'path', {});
        const o = { h, k, g, cx, clipP,
          fill: inkEl(g, C.paperLight), inner: el(g, 'g', { 'clip-path': `url(#${cidk})` }),
          ribs: null, ring: inkEl(g, C.ink), beams: inkEl(g, C.ink), crackR: inkEl(g, C.red), mast: inkEl(g, C.ink) };
        o.water = inkEl(o.inner, C.blue, { 'fill-opacity': 0.32 });
        o.waterL = inkEl(o.inner, C.blue);
        o.ribs = inkEl(o.inner, C.inkSoft);
        o.g.appendChild(o.ring); o.g.appendChild(o.beams); o.g.appendChild(o.crackR); o.g.appendChild(o.mast);
        if (h.label) {
          o.lab = el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 74 : 70, 'text-anchor': 'middle', fill: C.ink,
            style: `paint-order: stroke; stroke: ${C.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
          o.lab.textContent = h.label;
        }
        if (h.mark) o.markR = inkEl(cam, h.mark === 'check' ? C.green : C.red);
        if (h.q) { o.qt = el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: C.red }); o.qt.textContent = '?'; }
        return o;
      });
      // ice slabs: for each hull a left and right slab (shared outer slabs in single mode)
      const slabs = [];
      hulls.forEach((o, k) => {
        if (o.h.anim === 'intro') return;
        [-1, 1].forEach(sg => slabs.push({ o, sg, f: inkEl(cam, C.paperLight), r: inkEl(cam, C.ink), top: inkEl(cam, C.inkSoft), arrow: inkEl(cam, C.red) }));
      });
      // pump: lever, pipe, jet, crew
      let pump = null;
      if (mode === 'pump') {
        const o = hulls[0];
        pump = { pipe: inkEl(cam, C.ink), lever: inkEl(cam, C.ink), jet: inkEl(cam, C.blue), leak: inkEl(cam, C.blue) };
        pump.crew = [{ x: -0.1, face: 'right' }, { x: 0.05, face: 'left' }].map((c, k) => makeRig(cam, { scale: (portrait ? 0.42 : 0.36) * o.h.s, accessory: 'beret', pose: 'point', dir: -38, face: c.face, x: 0 }, seed + 60 + k * 9, portrait, false));
      }
      const kas = makeRig(root, P.kasif, seed, portrait, true);
      const labs = makeLabels(root, P.labels, portrait);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur)));
          const sqA = atOr(cues, P.squeeze, mode === 'pump' ? -1 : 0.8), crA = atOr(cues, P.crack, null), mkA = atOr(cues, P.mark, null);
          const sq = mode === 'pump' ? 1 : progIO(lt, sqA, 1.8);
          let shake = 0;
          if (crA != null && lt >= crA && lt < crA + 1) shake = Math.exp(-(lt - crA) * 5);
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 5 + Math.sin(t * 50) * 10 * shake)} ${f1(Math.cos(t * 0.23) * 4)}) translate(${W / 2} ${WL}) scale(${z.toFixed(4)}) translate(${-W / 2} ${-WL})`);
          // water surface between everything
          const sp = []; for (let i = 0; i <= 24; i++) sp.push([-200 + i * (W + 400) / 24, WL + Math.sin(i * 1.3 + t * 1.6) * 3]);
          waterR.setAttribute('d', inkPath(sp, { seed: sd + 3, t, w: 4 }));
          let wd = '';
          for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const y = WL + 70 + r * 90, x = (((i * 0.111 + r * 0.05) * (W + 200) + t * 18) % (W + 200)) - 100, w = []; for (let j = 0; j <= 6; j++) w.push([x + j * 12, y + Math.sin(j * 1.7) * 4]); wd += inkPath(w, { seed: sd + 5 + r * 10 + i, t, w: 3 }) + ' '; }
          waterH.setAttribute('d', wd);
          hulls.forEach(o => {
            const h = o.h, s = h.s;
            let lift = 0, bend = 0, alpha = 1, rot = 0;
            if (h.anim === 'lift') lift = sm((sq - 0.35) / 0.65) * 150;
            if (h.anim === 'done') lift = 120;
            if (h.anim === 'crush') { bend = sq; lift = -8 * sq; rot = Math.sin(t * 8) * 0.6 * sq; }
            if (h.anim === 'pump') { bend = 0.3; rot = Math.sin(t * 1.2) * 0.8; }
            if (h.anim === 'intro') { const p = spring(lt, 0.2 + o.k * 0.5, 0.7); alpha = clamp01(p * 2); lift = Math.sin(t * 1.3 + o.k) * 4; o.g.setAttribute('transform', ''); }
            else lift += Math.sin(t * 1.4 + o.k) * 2 * (1 - sq);
            const cy = WL + 10 - lift * s;
            const pts = xf(hullPts(h.kind, bend), o.cx, cy, s, rot * Math.PI / 180);
            const k3 = { seed: sd + 100 + o.k * 50, t };
            o.g.setAttribute('opacity', f3(alpha));
            o.fill.setAttribute('d', inkLoop(pts, Object.assign({}, k3, { smooth: h.kind === 'round' })));
            o.ring.setAttribute('d', inkPath(pts, Object.assign({}, k3, { w: 9, closed: true, smooth: h.kind === 'round' })));
            o.clipP.setAttribute('d', inkLoop(pts, Object.assign({}, k3, { amp: 0, smooth: h.kind === 'round' })));
            // ribs (inner planking lines)
            let rd = '';
            for (let i = 1; i <= 3; i++) { const inner = xf(hullPts(h.kind, bend).slice(2).map(([px, py]) => [px * (1 - i * 0.09), py * (1 - i * 0.05) - i * 4]), o.cx, cy, s, rot * Math.PI / 180); rd += inkPath(inner, { seed: sd + 120 + o.k * 50 + i, t, w: 2.5 }) + ' '; }
            o.ribs.setAttribute('d', rd);
            // deck beams: deck + lower deck + stanchion; crack snaps the lower beam
            const cr = crA != null && h.anim === 'crush' ? prog(lt, crA, 0.25) : 0;
            const T = q => xf([q], o.cx, cy, s, rot * Math.PI / 180)[0];
            const hw = h.kind === 'round' ? 196 : 176 - bend * 40;
            let bd = inkPath([T([-hw + 6, -150]), T([hw - 6, -150])], { seed: sd + 140 + o.k * 50, t, w: 10 }) + ' ';
            if (cr > 0) {
              bd += inkPath([T([-hw + 4, -60]), T([-14, -60 + 26 * cr])], { seed: sd + 141 + o.k * 50, t, w: 9 }) + ' ';
              bd += inkPath([T([14, -60 + 26 * cr]), T([hw - 4, -60])], { seed: sd + 142 + o.k * 50, t, w: 9 }) + ' ';
            } else bd += inkPath([T([-hw + 4, -60]), T([hw - 4, -60 + bend * 6])], { seed: sd + 141 + o.k * 50, t, w: 9 }) + ' ';
            bd += inkPath([T([0, -150]), T([0, 150])], { seed: sd + 143 + o.k * 50, t, w: 6 }) + ' ';
            o.beams.setAttribute('d', bd);
            let cd = '';
            if (cr > 0) {
              [[-8, -60], [-hw + 20, 10], [hw - 20, 10]].forEach(([qx, qy], j) => {
                const zz = []; for (let i = 0; i < 6; i++) zz.push(T([qx + (i % 2 ? 14 : -14), qy - 30 + i * 14 * cr]));
                cd += inkPath(zz, { seed: sd + 150 + j, t, w: 7, smooth: false, amp: 1 }) + ' ';
              });
              const fp = clamp01((lt - crA) / 0.4);
              if (fp < 1) { const [bx, by] = T([0, -60]), star = []; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, r = (i % 2 ? 26 : 80) * (0.4 + fp); star.push([bx + Math.cos(a) * r, by + Math.sin(a) * r]); } cd += inkLoop(star, { seed: sd + 160, t, smooth: false }); }
            }
            o.crackR.setAttribute('d', cd);
            o.mast.setAttribute('d', h.anim === 'pump' ? '' : inkPath([T([0, -150]), T([0, -330])], { seed: sd + 170 + o.k * 50, t, w: 8 }) + ' ' + inkPath([T([-80, -290]), T([80, -290])], { seed: sd + 171 + o.k * 50, t, w: 6 }));
            // water inside (pump mode rises; crush mode after the crack)
            let lvl = null;
            if (h.anim === 'pump') lvl = lerp(140, 20, sm(lt / Math.max(dur, 1)));
            if (h.anim === 'crush' && crA != null && lt > crA) lvl = lerp(150, 70, prog(lt, crA + 0.3, 2.5));
            if (lvl != null) {
              const wy = cy + lvl * s, wp = [];
              for (let i = 0; i <= 14; i++) wp.push([o.cx - 260 * s + i * 520 * s / 14, wy + Math.sin(i * 1.5 + t * 3) * 5]);
              const loop = wp.concat([[o.cx + 260 * s, cy + 200 * s], [o.cx - 260 * s, cy + 200 * s]]);
              o.water.setAttribute('d', inkLoop(loop, { seed: sd + 180, t, smooth: false, amp: 0.6 }));
              o.waterL.setAttribute('d', inkPath(wp, { seed: sd + 181, t, w: 4 }));
            } else { o.water.setAttribute('d', ''); o.waterL.setAttribute('d', ''); }
            // labels, marks, question marks
            if (o.lab) {
              const ly = cy - 360 * s, p = spring(lt, 0.3 + o.k * 0.5, 0.6);
              o.lab.setAttribute('x', f1(o.cx)); o.lab.setAttribute('y', f1(ly));
              o.lab.setAttribute('opacity', f3(clamp01(p * 2)));
            }
            if (o.markR) {
              const a = mkA ?? (crA != null ? crA + 0.4 : 1.2), p = prog(lt, a, 0.4), mx = o.cx + 230 * s, my = cy - 300 * s, r = 46;
              const pts = h.mark === 'check' ? [[mx - r, my], [mx - r * 0.3, my + r * 0.7], [mx + r, my - r * 0.8]] : null;
              let d = '';
              if (lt >= a) {
                if (pts) d = inkPath(pts.slice(0, Math.max(2, Math.round(3 * p))), { seed: sd + 190, t, w: 12, smooth: false });
                else d = inkPath([[mx - r, my - r], [mx - r + 2 * r * p, my - r + 2 * r * p]], { seed: sd + 191, t, w: 12 }) + (p > 0.5 ? ' ' + inkPath([[mx + r, my - r], [mx + r - 2 * r * (p - 0.5) * 2, my - r + 2 * r * (p - 0.5) * 2]], { seed: sd + 192, t, w: 12 }) : '');
              }
              o.markR.setAttribute('d', d);
            }
            if (o.qt) {
              const a = 0.9 + o.k * 0.5, p = spring(lt, a, 0.6), qy = cy - 470 * s + Math.sin(t * 2 + o.k) * 8;
              o.qt.setAttribute('x', f1(o.cx + 120 * s)); o.qt.setAttribute('y', f1(qy));
              o.qt.setAttribute('opacity', f3(clamp01(lin(lt, a, 0.1))));
              o.qt.setAttribute('transform', `translate(${f1(o.cx + 120 * s)} ${f1(qy)}) scale(${f3(lerp(0.3, 1, p))}) rotate(${f1(10 + Math.sin(t * 1.5) * 5)}) translate(${f1(-o.cx - 120 * s)} ${f1(-qy)})`);
            }
            o.cy = cy;
          });
          // ice slabs
          slabs.forEach((sl, k) => {
            const o = sl.o, h = o.h, s = h.s, sg = sl.sg;
            const hw = (h.kind === 'round' ? 210 : 182) * s;
            let tip;
            if (h.anim === 'lift' || h.anim === 'done') { const q = h.anim === 'done' ? 1 : sq; tip = o.cx + sg * lerp(hw + 140 * s, 40 * s, q); }
            else if (h.anim === 'crush') tip = o.cx + sg * lerp(hw + 140 * s, hw - 30 * s, sq);
            else tip = o.cx + sg * (hw - 10 * s);
            const far = o.cx + sg * (h.anim === 'done' ? 300 * s : P.compare && sg < 0 ? 420 * s : W);
            const top = WL - 26 * s, bot = WL + 70 * s, tipUnder = (h.anim === 'lift' || h.anim === 'done') ? 30 * s : 0;
            const pts = [[far, top], [tip + sg * 30 * s, top], [tip + sg * 6 * s, top + 18 * s + tipUnder], [tip, top + 44 * s + tipUnder], [tip + sg * 18 * s, bot], [far, bot]];
            sl.f.setAttribute('d', inkLoop(pts, { seed: sd + 300 + k * 10, t, smooth: false }));
            sl.r.setAttribute('d', inkPath(pts.slice(0, 5).concat([[far, bot]]), { seed: sd + 300 + k * 10, t, w: 6, smooth: false }));
            let hd = '';
            for (let i = 0; i < 6; i++) { const hx = lerp(tip + sg * 60 * s, tip + sg * 420 * s, i / 5); hd += inkPath([[hx, top + 16 * s], [hx + sg * 36 * s, top + 14 * s]], { seed: sd + 320 + k * 10 + i, t, w: 3 }) + ' '; }
            sl.top.setAttribute('d', hd);
            // pressure arrows (red) pushing inward while squeezing
            if (P.arrows !== false && h.anim !== 'done') {
              const ax = tip + sg * 220 * s + sg * Math.sin(t * 5) * 6, ay = top - 70 * s, L = 120 * s, vis = mode === 'pump' || lt > sqA - 0.2;
              sl.arrow.setAttribute('d', vis ? inkPath([[ax + sg * L, ay], [ax, ay]], { seed: sd + 340 + k, t, w: 9 }) + ' ' + inkPath([[ax + sg * 30, ay - 26], [ax, ay], [ax + sg * 30, ay + 26]], { seed: sd + 341 + k, t, w: 9, smooth: false }) : '');
            } else sl.arrow.setAttribute('d', '');
          });
          // pump
          if (pump) {
            const o = hulls[0], s = o.h.s, deckY = o.cy - 150 * s, px = o.cx;
            const ang = Math.sin(t * 4.2) * 0.38, L = 110 * s;
            pump.pipe.setAttribute('d', inkPath([[px, o.cy + 110 * s], [px, deckY - 60 * s]], { seed: sd + 400, t, w: 12 }) + ' ' + inkPath([[px, deckY - 50 * s], [px - 90 * s, deckY - 50 * s], [px - 230 * s, deckY - 10 * s]], { seed: sd + 401, t, w: 10 }));
            const lx0 = px - Math.cos(ang) * L, ly0 = deckY - 70 * s - Math.sin(ang) * L, lx1 = px + Math.cos(ang) * L, ly1 = deckY - 70 * s + Math.sin(ang) * L;
            pump.lever.setAttribute('d', inkPath([[lx0, ly0], [lx1, ly1]], { seed: sd + 402, t, w: 9 }) + ' ' + inkCircle(px, deckY - 70 * s, 10, sd + 403, t, { w: 5 }));
            // jet over the side (pulses with the lever)
            const pul = 0.5 + 0.5 * Math.sin(t * 8.4);
            let jd = '';
            for (let i = 0; i < 7; i++) { const u = ((t * 1.6 + i / 7) % 1), jx = px - 230 * s - u * 160 * s, jy = deckY - 10 * s + u * u * 260 * s; jd += inkDot(jx, jy, (7 + 5 * pul) * s, (7 + 5 * pul) * s, sd + 410 + i, t) + ' '; }
            pump.jet.setAttribute('d', jd);
            // leaks through the walls
            let ld = '';
            for (let i = 0; i < 8; i++) { const sgn = i % 2 ? 1 : -1, u = ((t * 1.1 + i / 8) % 1), lx = o.cx + sgn * (150 - u * 70) * s, ly = o.cy + (10 + (i % 4) * 22 + u * u * 50) * s; ld += inkDot(lx, ly, 6 * s, 9 * s, sd + 430 + i, t) + ' '; }
            pump.leak.setAttribute('d', ld);
            pump.crew.forEach((R, k) => {
              if (!R) return;
              const hx = k ? lx1 : lx0, hy = k ? ly1 : ly0, fx = hx + (k ? 45 : -45) * s;
              R.K.x = fx / W; R.K.y = (deckY) / H;
              const st = rigState(R, lt, cues, W, H, portrait);
              st.o.y += (hy - (deckY - 70 * s)) * 0.6;
              R.rig.update(t, 'point', Object.assign(st.o, { dir: -38 + (hy - (deckY - 70 * s)) * 0.2, face: k ? -1 : 1 }));
            });
          }
          updRig(kas, lt, t, cues, env, W, H, portrait);
          updLabels(labs, lt, t, cues, W, H, sd);
        },
      };
    },
  };
  // ================================================================ end_a_camp: the ice camp at eye level
  // Same drawing kit as end_a_ice, laid out as a close camp shot: flat ice plain, tents and ice blocks in the
  // middle ground, the crushed, heeled Endurance small on the horizon, cast in front (sit / point / think), an
  // optional open journal. P: everything end_a_ice takes; defaults below are merged under P (P wins).
  SH.end_a_camp = {
    kind: '2d',
    build(ctx) {
      const P = ctx.P || {};
      const D = { surface: 'ice', horizon: 0.5, zoom: 1.04, focus: [0.5, 0.65],
        ship: { x: 0.78, y: 0.6, scale: 0.55, frozen: true, heel: { to: -15, at: 0, dur: 0.05 }, smoke: false },
        ridges: { at: -5, dur: 0.1, h: 1 }, tents: { xs: [0.12, 0.24], y: 0.66, at: -1, size: 1.1 } };
      const M = Object.assign({}, D, P, { ship: Object.assign({}, D.ship, P.ship || {}) });
      return SH.end_a_ice.build(Object.assign({}, ctx, { P: M }));
    },
  };

  // ================================================================ end_a_map: map + a planted flag
  // P: everything SHOTS.map takes, plus flag: {u, v (sheet 0..1), at: cue, colors: "no" (red cloth, blue cross)}
  SH.end_a_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, portrait = H > W, sd = seed * 1000;
      const n0 = svg.childNodes.length;
      const inner = SH.map.build(ctx);
      const camG = svg.childNodes[n0];
      const mg = (camG && camG.querySelector('g[clip-path] > g')) || svg;
      const S = portrait ? { x: 70, y: 330, w: 940, h: 783 } : { x: (W - 1000) / 2, y: 192, w: 1000, h: 636 };
      const F = P.flag || {}, fx = S.x + (F.u ?? 0.5) * S.w, fy = S.y + (F.v ?? 0.5) * S.h;
      const g = el(mg, 'g');
      const cloth = inkEl(g, C.red), cross = inkEl(g, C.blue), crossL = inkEl(g, C.paperLight), pole = inkEl(g, C.ink), clothR = inkEl(g, C.ink);
      return {
        update(lt, dur, cues, env = {}) {
          inner.update(lt, dur, cues, env);
          const t = env.t ?? lt, a = atOr(cues, F.at, 0.6), p = spring(lt, a, 0.7);
          g.setAttribute('opacity', f3(clamp01(lin(lt, a, 0.1))));
          g.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(1 ${f3(lerp(0.1, 1, p))}) translate(${f1(-fx)} ${f1(-fy)})`);
          const top = fy - 130, wv = k => Math.sin(t * 5 + k) * 6;
          const cl = [[fx, top], [fx + 50, top + wv(0)], [fx + 100, top + wv(1.4)], [fx + 100, top + 64 + wv(1.4)], [fx + 50, top + 64 + wv(0)], [fx, top + 64]];
          cloth.setAttribute('d', inkLoop(cl, { seed: sd + 1, t, amp: 0.8 }));
          clothR.setAttribute('d', inkPath(cl, { seed: sd + 1, t, w: 3.5, closed: true, amp: 0.8 }));
          const cx = fx + 34, cy = top + 32 + wv(0.7) * 0.6;
          crossL.setAttribute('d', inkPath([[cx, top + 2], [cx, top + 62]], { seed: sd + 2, t, w: 16, amp: 0.5 }) + ' ' + inkPath([[fx + 2, cy], [fx + 98, cy + wv(1) * 0.4]], { seed: sd + 3, t, w: 16, amp: 0.5 }));
          cross.setAttribute('d', inkPath([[cx, top + 2], [cx, top + 62]], { seed: sd + 4, t, w: 8, amp: 0.5 }) + ' ' + inkPath([[fx + 2, cy], [fx + 98, cy + wv(1) * 0.4]], { seed: sd + 5, t, w: 8, amp: 0.5 }));
          pole.setAttribute('d', inkPath([[fx, fy + 4], [fx, top - 10]], { seed: sd + 6, t, w: 7 }) + ' ' + inkCircle(fx, top - 14, 7, sd + 7, t, { fill: true }));
        },
      };
    },
  };

  // ================================================================ end_a_proof: three evidence cards with ink drawings
  // Cards: "photo" (box camera on a tripod + a small print), "diary" (open journal + pen), "wreck" (hull upright on
  // the sea bed under a wavy surface). Each card springs in, a green ✓ lands on its cue, a pill badge at the end.
  // P: {cards: [{kind, label, at}], pill: {text, at, color: "blue"}, kasif: {...end_a_ice kasif}}   cues: names used
  SH.end_a_proof = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, portrait = H > W, sd = seed * 1000;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const cards = (P.cards || []).slice(0, 3), n = Math.max(1, cards.length);
      const CW = portrait ? 300 : 400, CH = portrait ? 420 : 440, gap = portrait ? 20 : 50;
      const x0 = (portrait ? W : W * 0.86) / 2 - (n * CW + (n - 1) * gap) / 2, y0 = portrait ? 380 : 230;
      const drawings = {
        photo: (cx, cy) => [
          { p: [[-60, 70], [-10, -10]], w: 6 }, { p: [[60, 70], [10, -10]], w: 6 }, { p: [[0, 70], [0, -10]], w: 6 },
          { p: [[-80, -110], [60, -110], [60, -10], [-80, -10]], c: 1, f: C.inkSoft, w: 5, sm: 0 },
          { p: [[60, -96], [110, -110], [110, -10], [60, -24]], c: 1, f: C.paperDark, w: 5, sm: 0 },
          { p: circ(126, -60, 22, 12), c: 1, f: C.paperLight, w: 5 },
          { p: [[-150, 10], [-80, 2], [-74, 76], [-144, 84]], c: 1, f: C.paperLight, w: 4, sm: 0 },
          { p: [[-136, 60], [-120, 34], [-106, 50], [-92, 30]], w: 3.5, col: C.inkSoft }],
        diary: () => [
          { p: [[0, 50], [-150, 30], [-150, -100], [0, -80]], c: 1, f: C.paperLight, w: 5, sm: 0 },
          { p: [[0, 50], [150, 30], [150, -100], [0, -80]], c: 1, f: C.paperLight, w: 5, sm: 0 },
          ...[0, 1, 2, 3].map(i => ({ p: [[-130, -66 + i * 24], [-20, -52 + i * 24]], w: 2.5, col: C.inkSoft })),
          ...[0, 1, 2].map(i => ({ p: [[20, -52 + i * 24], [128 - i * 20, -66 + i * 24]], w: 2.5, col: C.inkSoft })),
          { p: [[60, 40], [150, -50]], w: 8 }, { p: [[50, 50], [60, 40]], w: 4 }],
        wreck: () => [
          { p: [[-170, -100], [-120, -110], [-60, -98], [0, -110], [60, -98], [120, -110], [170, -100]], w: 4, col: C.inkSoft },
          { p: [[-170, 70], [-60, 60], [60, 72], [170, 62], [170, 90], [-170, 90]], c: 1, f: C.paperDark, w: 4 },
          { p: [[-110, 40], [100, 34], [120, 0], [-120, 6]], c: 1, f: C.ink, w: 4, sm: 0 },
          { p: [[-20, 6], [-34, -70]], w: 6 }, { p: [[50, 2], [44, -40]], w: 6 },
          { p: [[-70, 20], [-50, 20]], w: 3, col: C.paperLight }, { p: [[0, 18], [20, 18]], w: 3, col: C.paperLight },
          ...[0, 1, 2].map(i => ({ p: circ(-130 + i * 16, -20 - i * 26, 6 + i * 2, 8), c: 1, w: 3, col: C.inkSoft }))],
      };
      const items = cards.map((c, k) => {
        const g = el(cam, 'g'), cx = x0 + k * (CW + gap) + CW / 2, cy = y0 + CH / 2;
        const box = [[cx - CW / 2, cy - CH / 2], [cx + CW / 2, cy - CH / 2], [cx + CW / 2, cy + CH / 2], [cx - CW / 2, cy + CH / 2]];
        const specs = [{ p: box.map(([a, b]) => [a + 10, b + 12]), f: C.ink, fo: 0.15, sm: 0 }, { p: box, c: 1, f: C.paperLight, w: 4, sm: 0 }];
        const dg = el(g, 'g');
        const sc = portrait ? 0.75 : 1;
        const draw = strokeSet(g, specs, sd + 10 + k * 30);
        g.appendChild(dg);
        const art = strokeSet(dg, (drawings[c.kind] || drawings.photo)(), sd + 100 + k * 40);
        const lab = el(g, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': portrait ? 50 : 56, 'text-anchor': 'middle', fill: C.ink, x: cx, y: cy + CH / 2 - 42 });
        lab.textContent = c.label || '';
        const mark = inkEl(g, C.green);
        return { c, k, g, dg, cx, cy, draw, art, mark, sc };
      });
      let pill = null;
      if (P.pill) {
        const g = el(cam, 'g'), py = y0 + CH + (portrait ? 90 : 70), px = x0 + (n * CW + (n - 1) * gap) / 2;
        const t = el(g, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': portrait ? 56 : 52, 'text-anchor': 'middle', fill: C.paperLight, x: px, y: py + 18 });
        t.textContent = P.pill.text;
        const w = Math.max(220, P.pill.text.length * 30 + 80);
        const bg = inkEl(g, COL[P.pill.color] || C.blue); g.insertBefore(bg, t);
        const bgR = inkEl(g, C.ink); g.insertBefore(bgR, t);
        pill = { g, px, py, w, bg, bgR };
      }
      const kas = makeRig(root, P.kasif, seed, portrait, true);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 5)} ${f1(Math.cos(t * 0.23) * 4)})`);
          items.forEach(it => {
            const a0 = 0.1 + it.k * 0.25, p = spring(lt, a0, 0.7), at = atOr(cues, it.c.at, 0.8 + it.k * 0.7), pk = punch(lt, at, 0.6);
            it.g.setAttribute('transform', `translate(${f1(it.cx)} ${f1(it.cy)}) rotate(${f1((it.k - 1) * 1.5 + (1 - p) * 6)}) scale(${f3(lerp(0.6, 1, p) * (1 + 0.06 * pk))}) translate(${f1(-it.cx)} ${f1(-it.cy)})`);
            it.g.setAttribute('opacity', f3(clamp01(p * 2)));
            it.draw(t);
            const bob = Math.sin(t * 1.5 + it.k) * 4;
            it.dg.setAttribute('transform', `translate(${f1(it.cx)} ${f1(it.cy - 40 + bob)}) scale(${it.sc})`);
            it.art(t);
            const q = prog(lt, at, 0.4), mx = it.cx + (portrait ? 110 : 150), my = it.cy - CH / 2 + 60, r = 40;
            const pts = [[mx - r, my], [mx - r * 0.3, my + r * 0.7], [mx + r, my - r * 0.9]];
            it.mark.setAttribute('d', lt >= at ? inkPath(q < 0.5 ? [pts[0], [lerp(pts[0][0], pts[1][0], q * 2), lerp(pts[0][1], pts[1][1], q * 2)]] : [pts[0], pts[1], [lerp(pts[1][0], pts[2][0], (q - 0.5) * 2), lerp(pts[1][1], pts[2][1], (q - 0.5) * 2)]], { seed: sd + 200 + it.k, t, w: 12, smooth: false }) : '');
          });
          if (pill) {
            const a = atOr(cues, P.pill.at, Math.max(1, dur * 0.72)), p = spring(lt, a, 0.6), pk = punch(lt, a, 0.5);
            const bx = [[pill.px - pill.w / 2, pill.py - 36], [pill.px + pill.w / 2, pill.py - 36], [pill.px + pill.w / 2, pill.py + 36], [pill.px - pill.w / 2, pill.py + 36]];
            pill.bg.setAttribute('d', inkLoop(bx, { seed: sd + 300, t, smooth: false }));
            pill.bgR.setAttribute('d', inkPath(bx, { seed: sd + 300, t, w: 4, closed: true, smooth: false }));
            pill.g.setAttribute('opacity', f3(clamp01(lin(lt, a, 0.1))));
            pill.g.setAttribute('transform', `translate(${f1(pill.px)} ${f1(pill.py)}) scale(${f3(lerp(0.5, 1, p) * (1 + 0.08 * pk))}) translate(${f1(-pill.px)} ${f1(-pill.py)})`);
          }
          updRig(kas, lt, t, cues, env, W, H, portrait);
        },
      };
    },
  };
})();
