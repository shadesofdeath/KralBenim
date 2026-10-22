// ag03a_sefer: two parchment-ink shots for the Malazgirt 1071 long video (Anlatayım Gel), BRAND.md §3, §5.
//   ag03a_field — side-on landscape stage: far mountains / hills, day or night sky (crescent moon, stars, sun), wind
//                 streaks + bending grass, buildings (castle with a rising flag, steppe tent with a tuğ, Byzantine
//                 palace arcade, Hagia Sophia dome, city walls), a river the riders splash through, horses with riders
//                 (KASIF rigs clipped at the saddle), small marching troops, an ink lion head, a hoof-print trail that
//                 vanishes towards the horizon, hand-written labels with red rings, and the cast (KASIF rigs that can
//                 kneel, drop a crown, raise a sword or shiver).
//   ag03a_map   — old map of Anatolia and the Near East in [lon, lat]: hatched realms that spread from one side,
//                 cities with red rings, several dashed arrows (rider glyphs + dust cloud at the tip), a distance gauge,
//                 small map icons (dome, castle with a flag, tent), a note card, a camera pan between two views, and the
//                 narrator standing beside the sheet.
//
// SHOTS.ag03a_field P: {
//   ground: 0.76 (ground line, 0..1 H), sky: "day"|"night", moon: {x, y, r}, sun: {x, y, r}, stars: 14,
//   far: {kind: "mountains"|"hills", h: 0.24, ridges: 2, seed: 1} | false,
//   wind: {at: cue} (streaks across the sky, grass and banners bend harder after the cue), grass: 16 | false,
//   buildings: [{type: "castle"|"tent"|"palace"|"dome"|"walls", x: 0.7, scale: 1, at, tug: true (tent),
//                flag: {at, color: "red"|"blue"} (castle), from/to (walls, 0..1 W)}],
//   props: [{type: INK_PROPS type (rock, tree, column, sign...), x, y, scale, at, text}],
//   river: {x: 0.5, w: 0.15, label: "Fırat", label_at},
//   lion: {x: 0.72, y: 0.3, size: 150, at},
//   riders: [{x, to, start, at (arrive), dur, gait: "walk"|"gallop", face: "left"|"right", scale: 1, coat: "light"|"dark",
//             cloth: "red"|"blue", banner: "red"|"blue", turn: cue (turns round), off: 1.3 (x it gallops to after turn),
//             rider: {accessory, beard, pose: "idle", at, then, dir, emotion}}],
//   troops: [{kind: "spear"|"rider", n: 6, from: [x, y], to: [x, y] (0..1), at, dur, gap: [-70, 0] (px), scale: 1,
//             color: "red"|"blue", appear: true (pops in at `at`)}],
//   trail: {from: [x, y], to: [x, y], at, dur: 2.2, n: 14},
//   labels: [{text, x, y, at, size: 64, color: "ink"|"red"|"blue", ring: cue|true, box: true, arrow: [x, y]}],
//   cast: [{who: "kasif"|name, accessory, beard, x, y, scale, pose, to, at, then, dir, face, emotion, seq: [...]
//           (same as SHOTS.stage) + kneel: true, stand: cue (gets up), crown: {fall: cue}, sword: cue|true, shiver: cue}],
//   cam: {zoom: 1.06, focus: [0.5, 0.6], pan: 0}, shake: cue, scale: 1
// }
// SHOTS.ag03a_map P: {
//   view: [lon0, lon1, lat0, lat1], view2: [...], pan: {at: cue|seconds, dur: 1.8},
//   realms: [{poly: "bizans"|"selcuklu"|[[lon, lat]...], color: "red"|"blue", at, dur: 1.6, from: "west"|"east",
//             label: {text, lon, lat, size: 60, at}}],
//   cities: [{name, lon, lat, at, color, dx, dy, ring: cue|true, size: 54}],
//   icons: [{type: "dome"|"castle"|"tent", lon, lat, at, size: 1, flag: {at, color}}],
//   routes: [{pts: [[lon, lat]...], at, dur: 1.8, color: "red"|"blue"|"ink", head: true, riders: 0..3, dust: true,
//             width: 8, label: {text, u: 0.6, dx, dy, at, color}}],
//   gauge: {from: [lon, lat], to: [lon, lat], at, dur: 1.2, color},
//   note: {text, x: 0.06, y: 0.12 (0..1 of the sheet), at, color}, texts: [{text, lon, lat, at, size: 50, color: "soft", rot}],
//   sheet: {x, y, w, h} (override the sheet rect),
//   kasif: {side: "left"|"right", pose, at, then, dir, face, emotion, scale: 0.72, walk: true, seq: [...]}
// }
// cues: whatever names the params reference. Everything is a pure function of (lt, cues): no Math.random.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const tc = (v, cues, fb) => v == null ? fb : typeof v === 'number' ? v : cue(cues, v, fb);
  const sm01 = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, gold: INK.gold, green: INK.green, soft: INK.inkSoft,
    light: INK.paperLight, dark: INK.paperDark };
  const colOf = (c, fb) => COL[c] || fb || INK.ink;
  const FR = 'Fraunces, Georgia, serif';
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const dirAng = d => typeof d === 'number' ? d : (DIRS[d] ?? 10);
  const dirFace = d => typeof d !== 'string' ? null : /left/.test(d) ? -1 : /right/.test(d) ? 1 : null;
  const faceOf = v => v === 'left' ? -1 : v === 'right' ? 1 : null;
  const rotV = (v, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const arcPts = (cx, cy, rx, ry, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => {
    const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const sub = (pts, p) => {          // first fraction p of a polyline (draw-on)
    if (p >= 1) return pts;
    if (p <= 0) return pts.slice(0, 1);
    const n = pts.length - 1, x = p * n, k = Math.floor(x), f = x - k, out = pts.slice(0, k + 1);
    if (k < n) out.push([lerp(pts[k][0], pts[k + 1][0], f), lerp(pts[k][1], pts[k + 1][1], f)]);
    return out;
  };

  // pool of filled ink paths: paint(strokes, t, seed). stroke: {p, c, f (fill), fo, w (0 = no outline), col, o, sm: 0, amp}
  function painter(parent) {
    const els = [];
    return function paint(strokes, t, sd) {
      let k = 0;
      const get = () => { const e = els[k] || (els[k] = inkEl(parent)); k++; e.style.display = ''; return e; };
      for (let i = 0; i < strokes.length; i++) {
        const s = strokes[i];
        if (!s || !s.p || s.p.length < 2) continue;
        const base = { seed: sd + i * 7, t, amp: s.amp ?? 1.5, smooth: s.sm !== 0 };
        if (s.f) { const e = get(); e.setAttribute('fill', s.f); e.setAttribute('fill-opacity', s.fo ?? 1); e.setAttribute('d', inkLoop(s.p, base)); }
        if (s.w !== 0) {
          const e = get(); e.setAttribute('fill', s.col || INK.ink); e.setAttribute('fill-opacity', s.o ?? 1);
          e.setAttribute('d', inkPath(s.p, Object.assign({}, base, { w: s.w ?? 6, closed: !!s.c, taper: s.taper ?? 0.3 })));
        }
      }
      for (let j = k; j < els.length; j++) els[j].style.display = 'none';
    };
  }

  // ---------------------------------------------------------------- horse (local: facing +x, ground y = 0, ~300 tall)
  const HORSE = [[-128, -160], [-118, -185], [-70, -192], [0, -190], [60, -196], [96, -222], [118, -256], [128, -276], [140, -266],
    [156, -256], [194, -214], [186, -198], [160, -200], [132, -214], [116, -180], [112, -140], [86, -114], [0, -110], [-84, -114], [-122, -132]];
  const SEAT = [4, -194];
  // ph: gait phase (cycles), gait 0 stand | 1 walk | 2 gallop; o: {coat, cloth, wk (width factor), t}
  function horseStrokes(t, ph, gait, o = {}) {
    const wk = o.wk || 1, W = w => w * wk;
    const TAU = Math.PI * 2;
    const bob = gait === 2 ? -12 * Math.abs(Math.sin(ph * TAU)) : gait === 1 ? -3 * Math.abs(Math.sin(ph * TAU)) : Math.sin(t * 1.4) * 1.2;
    const pitch = gait === 2 ? Math.sin(ph * TAU) * 3 : 0;
    const nod = gait === 2 ? Math.sin(ph * TAU + 1) * 7 : gait === 1 ? Math.sin(ph * TAU * 2) * 3 : Math.sin(t * 0.9) * 2.5;
    const B = q => { const r = rotV([q[0], q[1] + 150], pitch); return [r[0], r[1] - 150 + bob]; };
    const head = q => (q[0] > 115 && q[1] < -195) ? (() => { const r = rotV([q[0] - 105, q[1] + 205], nod); return [r[0] + 105, r[1] - 205]; })() : q;
    const body = HORSE.map(q => B(head(q)));
    const amp = gait === 2 ? 34 : gait === 1 ? 17 : 0, bend = gait === 2 ? 70 : gait === 1 ? 34 : 0;
    const offs = gait === 2 ? [0, 0.12, 0.5, 0.62] : [0, 0.5, 0.75, 0.25];   // LF, RF, LH, RH
    const leg = (hx, hy, k, front) => {
      const s = (ph + offs[k]) % 1, a = amp * Math.sin(s * TAU), b = bend * Math.max(0, Math.cos(s * TAU));
      const H = B([hx, hy]), K = [H[0] + rotV([0, 62], -a)[0], H[1] + rotV([0, 62], -a)[1]];
      const sh = rotV([0, 66], front ? -a + b : -a - b * 0.6);
      const F = [K[0] + sh[0], Math.min(0, K[1] + sh[1])];
      return [H, K, F];
    };
    const LF = leg(80, -128, 0, true), RF = leg(70, -128, 1, true), LH = leg(-86, -132, 2, false), RH = leg(-96, -132, 3, false);
    const coat = o.coat === 'dark' ? INK.paperDark : INK.paperLight;
    const sway = Math.sin(t * 2.2) * 6 + (gait === 2 ? 14 : 0), lift = gait === 2 ? -24 : 0;
    const tail = [B([-124, -170]), B([-146 - sway * 0.4, -150 + lift * 0.4]), B([-158 - sway, -112 + lift]), B([-152 - sway * 1.2, -78 + lift])];
    const hoof = (F, i) => ({ p: inkEllipsePts(F[0] + 6, F[1] - 5, 13, 7, 400 + i, 8), c: 1, f: INK.ink, w: 0 });
    const out = { back: [], front: [] };
    out.back.push({ p: RF, w: W(7), col: INK.inkSoft }, { p: RH, w: W(7), col: INK.inkSoft }, hoof(RF[2], 1), hoof(RH[2], 2));
    out.back.push({ p: tail, w: W(11), taper: 0.6 }, { p: tail.map((q, i) => [q[0] + i * 4, q[1] + i * 3]), w: W(4), col: INK.inkSoft });
    out.front.push({ p: body, c: 1, f: coat, w: W(6) });
    const cl = o.cloth ? colOf(o.cloth) : null;
    if (cl) out.front.push({ p: [B([-34, -191]), B([44, -196]), B([40, -146]), B([-30, -144])], c: 1, f: cl, w: W(4), sm: 0 });
    out.front.push({ p: LF, w: W(7) }, { p: LH, w: W(7) }, hoof(LF[2], 3), hoof(LH[2], 4));
    const mane = [];
    for (let i = 0; i < 6; i++) {
      const u = i / 5, a = B(head([lerp(62, 126, u), lerp(-198, -272, u)]));
      mane.push({ p: [a, [a[0] - 16 - (gait === 2 ? 10 : 0), a[1] + 10 + Math.sin(t * 3 + i) * 3]], w: W(5), taper: 0.6 });
    }
    out.front.push(...mane);
    const ear = [B(head([124, -270])), B(head([120, -298])), B(head([136, -276]))];
    out.front.push({ p: ear, w: W(5), sm: 0 });
    const eye = B(head([148, -248]));
    out.front.push({ p: inkEllipsePts(eye[0], eye[1], 5 * wk, 5 * wk, 31, 6), c: 1, f: INK.ink, w: 0 });
    out.seat = B(SEAT); out.bob = bob; out.pitch = pitch;
    return out;
  }

  // small foot soldier (local, ground y = 0, ~330 tall): shield + spear
  function soldierStrokes(t, ph, moving, o = {}) {
    const wk = o.wk || 1, W = w => w * wk, TAU = Math.PI * 2;
    const a = moving ? Math.sin(ph * TAU) * 24 : 0, bob = moving ? -6 * Math.abs(Math.sin(ph * TAU)) : 0;
    const hip = [0, -150 + bob], neck = [6, -262 + bob], head = [10, -300 + bob];
    const legA = [hip, [Math.sin(a * Math.PI / 180) * 150, 0]], legB = [hip, [-Math.sin(a * Math.PI / 180) * 150, 0]];
    const col = colOf(o.color, INK.red);
    return [
      { p: legA, w: W(7) }, { p: legB, w: W(7) }, { p: [hip, neck], w: W(7) },
      { p: [[30, -340 + bob], [36, 20 + bob]], w: W(5) },
      { p: [[30, -340 + bob], [22, -386 + bob], [38, -390 + bob]], c: 1, f: INK.inkSoft, w: W(3), sm: 0 },
      { p: inkEllipsePts(head[0], head[1], 34, 34, 51, 10), c: 1, f: INK.paperLight, w: W(5) },
      { p: arcPts(head[0], head[1] - 6, 36, 34, 180, 360, 6), c: 1, f: col, w: W(4) },
      { p: inkEllipsePts(-14, -200 + bob, 46, 58, 52, 10), c: 1, f: col, w: W(5) },
      { p: [[-14, -246 + bob], [-14, -154 + bob]], w: W(3), col: INK.paperLight },
    ];
  }

  // stick rider for map glyphs / far troops (local seat SEAT)
  function stickRider(t, out, o = {}) {
    const wk = o.wk || 1, W = w => w * wk, s = out.seat, col = colOf(o.color, INK.red);
    const top = [s[0] + 8, s[1] - 130];
    const st = [{ p: [s, top], w: W(7) },
      { p: [[top[0] - 2, top[1] + 30], [top[0] + 46, top[1] + 70]], w: W(6) },
      { p: inkEllipsePts(top[0] + 4, top[1] - 36, 36, 36, 61, 10), c: 1, f: col, w: W(5) }];
    if (o.spear) st.push({ p: [[top[0] - 20, top[1] + 90], [top[0] + 60, top[1] - 160]], w: W(5) });
    return st;
  }

  // ---------------------------------------------------------------- buildings (local: ground y = 0, centre x = 0)
  function castleStrokes(t, flagUp, flagCol) {
    const st = [];
    const cren = (x0, x1, y, h = 24, n = 0) => { const pts = [[x0, y]]; const k = n || Math.max(2, Math.round((x1 - x0) / 34)); const w = (x1 - x0) / k;
      for (let i = 0; i < k; i++) { const a = x0 + i * w; if (i % 2 === 0) pts.push([a, y - h], [a + w, y - h]); else pts.push([a, y], [a + w, y]); } pts.push([x1, y]); return pts; };
    st.push({ p: [[-112, 0], [-112, -214], ...cren(-112, 112, -214).slice(1), [112, 0]], c: 1, f: INK.paperLight, w: 6, sm: 0 });
    for (const sx of [-1, 1]) {
      const x0 = sx < 0 ? -196 : 112, x1 = sx < 0 ? -112 : 196;
      st.push({ p: [[x0, 0], [x0 + 4, -296], ...cren(x0 - 6, x1 + 6, -296, 28, 4).slice(1), [x1 - 4, 0]], c: 1, f: INK.paperDark, w: 6, sm: 0 });
      st.push({ p: [[(x0 + x1) / 2, -230], [(x0 + x1) / 2, -190]], w: 7 });
    }
    st.push({ p: [[-40, 0], [-40, -90], ...arcPts(0, -90, 40, 44, 180, 360, 8).slice(1), [40, 0]], c: 1, f: INK.inkSoft, w: 6, sm: 0 });
    for (let i = 0; i < 9; i++) { const x = -96 + (i % 3) * 64 + (i > 2 ? 18 : 0), y = -40 - Math.floor(i / 3) * 56; if (Math.abs(x) < 52 && y > -120) continue; st.push({ p: [[x, y], [x + 30, y + 2]], w: 3, col: INK.inkSoft }); }
    // flag on the right tower
    const px = 154, top = -440, fy = lerp(-320, top, flagUp);
    st.push({ p: [[px, -324], [px, top]], w: 6 });
    if (flagUp > 0.01) {
      const w1 = Math.sin(t * 5) * 8, w2 = Math.sin(t * 5 + 1.4) * 12;
      st.push({ p: [[px, fy], [px + 60, fy + 4 + w1], [px + 118, fy + 2 + w2], [px + 110, fy + 52 + w2], [px + 56, fy + 56 + w1], [px, fy + 58]], c: 1, f: flagCol, w: 4 });
    }
    return st;
  }
  function tentStrokes(t, tug) {
    const st = [];
    st.push({ p: [[-128, 0], [-128, -96], [128, -96], [128, 0]], c: 1, f: INK.paperLight, w: 6, sm: 0 });
    for (let i = 0; i < 7; i++) { const x = -110 + i * 36; st.push({ p: [[x, -10], [x + 30, -86]], w: 2.5, col: INK.inkSoft }, { p: [[x + 30, -10], [x, -86]], w: 2.5, col: INK.inkSoft }); }
    st.push({ p: [[-140, -94], ...arcPts(0, -94, 140, 118, 180, 360, 12).slice(1, -1), [140, -94]], c: 1, f: INK.paperDark, w: 6 });
    for (const a of [210, 240, 270, 300, 330]) { const r = a * Math.PI / 180; st.push({ p: [[Math.cos(r) * 22, -200 + Math.sin(r) * 6], [Math.cos(r) * 132, -94 + Math.sin(r) * 112 + 94 * 0]], w: 3, col: INK.inkSoft }); }
    st.push({ p: [[-128, -104], [128, -104]], w: 5, col: INK.red });
    st.push({ p: [[-34, 0], [-34, -78], [34, -78], [34, 0]], c: 1, f: INK.inkSoft, w: 5, sm: 0 });
    if (tug) {
      const sw = Math.sin(t * 2.3) * 7;
      st.push({ p: [[0, -210], [0, -380]], w: 6 });
      st.push({ p: inkEllipsePts(0, -392, 15, 15, 71, 8), c: 1, f: INK.gold, w: 4 });
      for (let i = 0; i < 4; i++) st.push({ p: [[-10 + i * 7, -370], [-16 + i * 8 + sw * 0.5, -330], [-12 + i * 9 + sw, -290]], w: 5, col: i % 2 ? INK.inkSoft : INK.ink, taper: 0.7 });
    }
    return st;
  }
  function palaceStrokes() {
    const st = [], xs = [-300, -100, 100, 300];
    st.push({ p: [[-360, 0], [360, 0], [360, -26], [-360, -26]], c: 1, f: INK.paperDark, w: 5, sm: 0 });
    st.push({ p: [[-340, -310], [340, -310], [340, -352], [-340, -352]], c: 1, f: INK.paperLight, w: 5, sm: 0 });
    st.push({ p: [[-130, -352], ...arcPts(0, -352, 130, 120, 180, 360, 12).slice(1)], c: 1, f: INK.paperLight, w: 6 });
    st.push({ p: [[0, -472], [0, -512]], w: 5 }, { p: [[-14, -496], [14, -496]], w: 5 });
    for (let i = 0; i < xs.length - 1; i++) st.push({ p: arcPts((xs[i] + xs[i + 1]) / 2, -250, 82, 66, 180, 360, 10), w: 5 });
    for (const x of xs) {
      st.push({ p: [[x - 30, -26], [x - 26, -250], [x + 26, -250], [x + 30, -26]], c: 1, f: INK.paperLight, w: 5, sm: 0 });
      st.push({ p: [[x - 40, -250], [x + 40, -250], [x + 34, -272], [x - 34, -272]], c: 1, f: INK.paperLight, w: 4, sm: 0 });
      st.push({ p: [[x - 8, -40], [x - 8, -240]], w: 2.5, col: INK.inkSoft });
    }
    st.push({ p: [[-60, -60], [60, -60]], w: 3, col: INK.inkSoft });
    return st;
  }
  function domeStrokes() {
    const st = [];
    for (const sx of [-1, 1]) st.push({ p: [[sx * 300, 0], [sx * 300, -230], [sx * 250, -250], [sx * 250, 0]], c: 1, f: INK.paperDark, w: 5, sm: 0 });
    st.push({ p: [[-260, 0], [-260, -200], [260, -200], [260, 0]], c: 1, f: INK.paperLight, w: 6, sm: 0 });
    for (const sx of [-1, 1]) st.push({ p: [[sx * 240, -200], ...arcPts(sx * 130, -200, 110, 90, sx < 0 ? 180 : 270, sx < 0 ? 270 : 360, 8).slice(1), [sx * 20, -200]], c: 1, f: INK.paperLight, w: 5 });
    st.push({ p: [[-118, -200], [-114, -262], [114, -262], [118, -200]], c: 1, f: INK.paperLight, w: 5, sm: 0 });
    for (let i = 0; i < 9; i++) { const x = -96 + i * 24; st.push({ p: [[x, -218], [x, -246]], w: 4 }); }
    st.push({ p: [[-126, -262], ...arcPts(0, -262, 126, 112, 180, 360, 14).slice(1)], c: 1, f: INK.paperLight, w: 6 });
    st.push({ p: [[-70, -330], [-30, -360], [20, -366]], w: 3, col: INK.inkSoft });
    st.push({ p: [[0, -374], [0, -416]], w: 5 }, { p: [[-14, -400], [14, -400]], w: 5 });
    for (let i = 0; i < 5; i++) { const x = -200 + i * 100; st.push({ p: [[x - 16, -40], [x - 16, -110], ...arcPts(x, -110, 16, 18, 180, 360, 4).slice(1), [x + 16, -40]], w: 4 }); }
    return st;
  }
  function wallsStrokes(w) {
    const st = [], h = 190, n = Math.max(2, Math.round(w / 300));
    const pts = [[0, 0], [0, -h]];
    for (let x = 0; x < w; x += 40) pts.push([x, -h], [x, -h - 22], [x + 20, -h - 22], [x + 20, -h]);
    pts.push([w, -h], [w, 0]);
    st.push({ p: pts, c: 1, f: INK.paperLight, w: 5, sm: 0 });
    for (let i = 0; i <= n; i++) {
      const x = i * w / n;
      st.push({ p: [[x - 46, 0], [x - 42, -h - 70], [x + 42, -h - 70], [x + 46, 0]], c: 1, f: INK.paperDark, w: 5, sm: 0 });
      st.push({ p: [[x - 50, -h - 70], [x - 50, -h - 94], [x - 22, -h - 94], [x - 22, -h - 76], [x + 22, -h - 76], [x + 22, -h - 94], [x + 50, -h - 94], [x + 50, -h - 70]], w: 4, sm: 0 });
      st.push({ p: [[x, -h + 10], [x, -h - 30]], w: 6 });
    }
    for (let i = 0; i < 14; i++) { const x = 30 + ((i * 97) % Math.max(60, w - 60)), y = -30 - ((i * 53) % (h - 50)); st.push({ p: [[x, y], [x + 28, y + 2]], w: 3, col: INK.inkSoft }); }
    return st;
  }
  // lion head (centre 0,0; unit radius 1)
  function lionStrokes(p, R) {
    const mane = [];
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, r = i % 2 ? 0.98 : 1.32; mane.push([Math.cos(a) * r, Math.sin(a) * r * 1.05]); }
    const sc = s => Object.assign({}, s, { p: s.p.map(q => [q[0] * R, q[1] * R]), w: s.w ? s.w * 150 : 0 });
    return [
      { p: mane, c: 1, f: INK.gold, fo: 0.55, w: 0.05, col: INK.ink, sm: 0 },
      { p: inkEllipsePts(-0.5, -0.62, 0.16, 0.16, 81, 8), c: 1, f: INK.paperLight, w: 0.035 },
      { p: inkEllipsePts(0.5, -0.62, 0.16, 0.16, 82, 8), c: 1, f: INK.paperLight, w: 0.035 },
      { p: inkEllipsePts(0, 0.02, 0.66, 0.74, 83, 14), c: 1, f: INK.paperLight, w: 0.05 },
      { p: inkEllipsePts(-0.24, -0.16, 0.06, 0.07, 84, 6), c: 1, f: INK.ink, w: 0 },
      { p: inkEllipsePts(0.24, -0.16, 0.06, 0.07, 85, 6), c: 1, f: INK.ink, w: 0 },
      { p: [[-0.38, -0.32], [-0.12, -0.27]], w: 0.04 }, { p: [[0.38, -0.32], [0.12, -0.27]], w: 0.04 },
      { p: [[-0.14, 0.14], [0.14, 0.14], [0, 0.3]], c: 1, f: INK.ink, w: 0.03, sm: 0 },
      { p: [[0, 0.3], [0, 0.4]], w: 0.035 },
      { p: [[-0.24, 0.48], [-0.1, 0.42], [0, 0.4], [0.1, 0.42], [0.24, 0.48]], w: 0.035 },
      { p: [[-0.42, 0.24], [-0.3, 0.3]], w: 0.025, col: INK.inkSoft }, { p: [[0.42, 0.24], [0.3, 0.3]], w: 0.025, col: INK.inkSoft },
    ].map(sc).map(s => (p < 1 && s.f === INK.gold) ? Object.assign({}, s, { p: sub(s.p.concat([s.p[0]]), p), c: 0, f: p > 0.98 ? s.f : null }) : s);
  }
  const CROWN = [[-56, -50], [-62, -104], [-34, -78], [-14, -118], [6, -80], [30, -120], [46, -80], [66, -106], [60, -50]];

  // ---------------------------------------------------------------- cast planner (same semantics as SHOTS.stage)
  function makePlanner(W, unit) {
    const moving = s => (s.pose === 'walk' || s.pose === 'run') && s.to != null;
    function plan(m, cues, px) {
      const segs = [{ at: tc(m.start, cues, 0), pose: m.pose || 'idle', to: m.to, dur: m.dur, dir: m.dir, face: m.face, emotion: m.emotion, text: m.text, item: m.item, then: m.then }];
      if (m.at != null) segs.push({ at: tc(m.at, cues, 1), pose: m.then || 'idle', dir: m.dir, emotion: m.emotion2 || m.emotion, text: m.text, item: m.item, arrive: moving(segs[0]) });
      for (const s of m.seq || []) segs.push(Object.assign({}, s, { at: tc(s.at, cues, 0) }));
      segs.sort((a, b) => a.at - b.at);
      const items = [];
      let x = (m.x ?? 0.5) * W, face = faceOf(m.face) ?? (moving(segs[0]) ? (m.to > m.x ? 1 : -1) : (m.x ?? 0.5) > 0.5 ? -1 : 1);
      segs.forEach((s, k) => {
        const nx = segs[k + 1];
        const it = { t0: s.at, pose: s.pose, x0: x, x1: x, t1: s.at, dir: s.dir, emotion: s.emotion, text: s.text, item: s.item };
        if (moving(s)) {
          it.x1 = s.to * W;
          const nat = Math.abs(it.x1 - x) / (KASIF.gait(s.pose) * px / (s.pose === 'run' ? 0.62 : 0.9));
          it.t1 = s.at + (s.dur ?? (nx && nx.arrive ? Math.max(0.3, nx.at - s.at) : nat));
          if (nx && !nx.arrive && it.t1 > nx.at) it.t1 = nx.at;
          if (faceOf(s.face) == null && it.x1 !== x) face = it.x1 > x ? 1 : -1;
        }
        const df = dirFace(s.dir);
        if (faceOf(s.face) != null) face = faceOf(s.face); else if (df != null && !moving(s)) face = df;
        it.face = face;
        items.push(it);
        x = it.x1;
        if (moving(s) && (!nx || it.t1 < nx.at - 0.01)) items.push({ t0: it.t1, pose: s.then || (k === 0 && m.at == null && m.then) || 'idle', x0: x, x1: x, t1: it.t1, face: faceOf(m.face_after) ?? face, dir: s.dir ?? m.dir, emotion: s.emotion, text: m.text, item: m.item });
      });
      return items;
    }
    const phaseOf = (it, lt, px) => {
      if (it.pose !== 'walk' && it.pose !== 'run') return undefined;
      if (it.x1 === it.x0) return lt / (it.pose === 'run' ? 0.62 : 0.9);
      const u = clamp01((lt - it.t0) / Math.max(0.01, it.t1 - it.t0));
      return Math.abs(lerp(it.x0, it.x1, u) - it.x0) / (KASIF.gait(it.pose) * px);
    };
    const posAt = (it, lt) => it.t1 > it.t0 ? lerp(it.x0, it.x1, clamp01((lt - it.t0) / (it.t1 - it.t0))) : it.x1;
    // -> {x, face, pose, opts} for the rig at lt
    function state(m, lt, cues, px) {
      const items = plan(m, cues, px);
      let k = 0; while (k + 1 < items.length && lt >= items[k + 1].t0) k++;
      const it = items[k], pv = items[k - 1], since = lt - it.t0;
      let face = it.face;
      if (pv && pv.face !== it.face && since < 0.22) face = lerp(pv.face, it.face, sm01(since / 0.22));
      const opts = { x: posAt(it, lt), face, ph: phaseOf(it, lt, px), since, dir: dirAng(it.dir), emotion: it.emotion || m.emotion, text: it.text, item: it.item };
      if (pv && since < 0.32) { opts.prev = { pose: pv.pose, ph: phaseOf(pv, it.t0, px), since: it.t0 - pv.t0, dir: dirAng(pv.dir), emotion: pv.emotion || m.emotion }; opts.mix = since / 0.32; }
      return { pose: it.pose, opts };
    }
    return { state };
  }

  // hand-written label (Patrick Hand) with optional card, red ring and arrow
  function makeLabel(parent, L, W, H, seed) {
    const g = el(parent, 'g'), size = L.size || 64, col = colOf(L.color, INK.ink);
    const boxE = L.box ? inkEl(g, INK.paperLight) : null, boxR = L.box ? inkEl(g) : null;
    const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: col,
      style: L.box ? '' : `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
    t.textContent = L.text;
    const ring = L.ring ? inkEl(g, INK.red) : null, arrow = L.arrow ? inkEl(g, col) : null;
    let tw = null;
    return {
      update(lt, t0, cues) {
        const at = tc(L.at, cues, 0.2), sp = spring(lt, at, 0.6);
        if (tw == null) { try { tw = t.getComputedTextLength(); } catch (e) { tw = 0; } if (!tw) tw = size * L.text.length * 0.42; }
        const x = (L.x ?? 0.5) * W, y = (L.y ?? 0.16) * H, b = boil(seed + 3, t0, 1);
        const vis = lt >= at;
        g.style.display = vis ? '' : 'none';
        if (!vis) return;
        g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1(-2 + b[0] * 0.4)}) scale(${f1(lerp(0.6, 1, sp) * 1000) / 1000})`);
        t.setAttribute('y', size * 0.34);
        if (boxE) {
          const bw = tw + 56, bh = size * 1.3, bp = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 3], [bw / 2 + 2, bh / 2], [-bw / 2 + 1, bh / 2 + 2]];
          boxE.setAttribute('d', inkLoop(bp, { seed: seed + 5, t: t0, smooth: false }));
          boxR.setAttribute('d', inkPath(bp, { seed: seed + 5, t: t0, w: 4, closed: true, smooth: false }));
        }
        if (ring) {
          const ra = L.ring === true ? at + 0.35 : tc(L.ring, cues, at + 0.35), rp = prog(lt, ra, 0.5);
          const pts = inkEllipsePts(0, 0, tw / 2 + 40, size * 0.85, seed + 9, 18, -0.05, 0.05);
          ring.setAttribute('d', rp > 0.01 ? inkPath(sub(pts.concat([pts[0], pts[1]]), rp), { seed: seed + 9, t: t0, w: 7 }) : '');
        }
        if (arrow) {
          const tx = L.arrow[0] * W - x, ty = L.arrow[1] * H - y, sx = tx < 0 ? -tw / 2 - 14 : tw / 2 + 14, sy = 0;
          const pa = prog(lt, at + 0.3, 0.45), mx = (sx + tx) / 2, my = Math.min(sy, ty) - 40;
          const q = []; for (let i = 0; i <= 10; i++) { const v = i / 10 * pa; q.push([(1 - v) * (1 - v) * sx + 2 * v * (1 - v) * mx + v * v * tx, (1 - v) * (1 - v) * sy + 2 * v * (1 - v) * my + v * v * ty]); }
          let d = pa > 0.02 ? inkPath(q, { w: 6, seed: seed + 11, t: t0 }) : '';
          if (pa > 0.95) { const e = q[10], f = q[8], an = Math.atan2(e[1] - f[1], e[0] - f[0]); d += ' ' + inkPath([[e[0] - 28 * Math.cos(an - 0.5), e[1] - 28 * Math.sin(an - 0.5)], e, [e[0] - 28 * Math.cos(an + 0.5), e[1] - 28 * Math.sin(an + 0.5)]], { w: 6, seed: seed + 12, t: t0, smooth: false }); }
          arrow.setAttribute('d', d);
        }
      },
    };
  }

  // ================================================================ ag03a_field
  SH.ag03a_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const GY = (P.ground ?? 0.76) * H, baseS = P.scale || 1;
      const root = el(svg, 'g'), world = el(root, 'g');
      const L = name => el(world, 'g', { 'data-l': name });
      const skyG = L('sky'), farG = L('far'), riverBG = L('riverB'), groundG = L('ground'), lionG = L('lion'), bldG = L('bld'),
        trailG = L('trail'), propG = L('props'), troopG = L('troops'), riderG = L('riders'), castG = L('cast'), riverFG = L('riverF'),
        grassG = L('grass'), labelG = L('labels'), windG = L('wind');
      const sr = rng(seed * 31 + 7);
      const night = P.sky === 'night';
      // sky
      const paintSky = painter(skyG);
      const stars = [];
      if (night) for (let i = 0; i < (P.stars ?? 16); i++) stars.push([40 + sr() * (W - 80), 40 + sr() * GY * 0.45, 7 + sr() * 8, sr() * 6]);
      const hatch = [];
      if (night) for (let i = 0; i < 70; i++) { const x = sr() * (W + 200) - 100, y = sr() * GY * 0.42; hatch.push([[x, y], [x + 34, y - 22]]); }
      // far ridges
      const paintFar = painter(farG), ridges = [];
      if (P.far !== false) {
        const F = Object.assign({ kind: 'hills', h: 0.24, ridges: 2 }, P.far || {});
        const fr = rng((F.seed || 1) * 97 + seed);
        for (let k = 0; k < F.ridges; k++) {
          const hh = F.h * H * (k === 0 ? 1 : 0.62), base = GY - 4, pts = [[-200, base]];
          const n = F.kind === 'mountains' ? 9 : 6;
          for (let i = 0; i <= n; i++) {
            const x = -200 + i * (W + 400) / n + (fr() - 0.5) * 80;
            const y = base - hh * (F.kind === 'mountains' ? (i % 2 ? 0.95 + fr() * 0.25 : 0.4 + fr() * 0.3) : 0.55 + fr() * 0.45);
            pts.push([x, y]);
          }
          pts.push([W + 200, base]);
          const hs = [];
          if (F.kind === 'mountains') for (let i = 1; i < pts.length - 2; i += 2) { const a = pts[i]; for (let j = 0; j < 3; j++) hs.push([[a[0] + 16 + j * 22, a[1] + 40 + j * 26], [a[0] + 40 + j * 22, a[1] + 76 + j * 26]]); }
          ridges.push({ pts, hs, k, sharp: F.kind === 'mountains' });
        }
      }
      // ground
      const gr = rng(seed * 13 + 5), gPts = [], ticks = [];
      for (let x = -200; x <= W + 200; x += 110) gPts.push([x, GY + 4 + (gr() * 2 - 1) * 5]);
      for (let i = 0; i < 10; i++) { const x = 40 + gr() * (W - 80), y = GY + 24 + gr() * 40; ticks.push([[x, y], [x + 18 + gr() * 22, y - 2 + gr() * 4]]); }
      const paintGround = painter(groundG);
      // river (runs from the horizon down to the bottom, slightly diagonal)
      const R = P.river ? Object.assign({ x: 0.5, w: 0.15 }, P.river) : null;
      const paintRiverB = painter(riverBG), paintRiverF = painter(riverFG);
      // buildings + props
      const blds = (P.buildings || []).map((b, i) => ({ b, g: el(bldG, 'g'), paint: null, i }));
      blds.forEach(o => { o.paint = painter(o.g); });
      const props = (P.props || []).map((pp, i) => { const g = el(propG, 'g'); return { pp, g, d: INK_PROPS.make(g, pp.type, seed * 10 + i + 1) }; });
      // lion
      const paintLion = painter(lionG);
      // trail
      const paintTrail = painter(trailG);
      // troops
      const troops = (P.troops || []).map((tp, i) => ({ tp, g: el(troopG, 'g'), i, members: [] }));
      troops.forEach(o => { for (let j = 0; j < (o.tp.n || 5); j++) { const g = el(o.g, 'g'); o.members.push({ g, paint: painter(g) }); } });
      // riders (horse + clipped KASIF rig)
      const riders = (P.riders || []).map((r, i) => {
        const g = el(riderG, 'g'), back = el(g, 'g'), paintBack = painter(back);
        const cid = `ag3clip${seed}_${i}`, clip = el(defs, 'clipPath', { id: cid });
        const clipRect = el(clip, 'rect', { x: -1200, y: -2400, width: 2400, height: 2400 + SEAT[1] + 6 });
        const rg = el(g, 'g', { 'clip-path': `url(#${cid})` });
        const R0 = r.rider || {};
        const rig = R0.none ? null : KASIF.create(rg, { scale: R0.scale || 0.6, hat: R0.who === 'kasif', accessory: R0.accessory || null, beard: R0.beard || null, seed: 50 + i * 7 });
        const front = el(g, 'g'), paintFront = painter(front);
        return { r, g, rig, paintBack, paintFront, i, clipRect };
      });
      // cast
      const planner = makePlanner(W);
      const cast = (P.cast || []).map((m, i) => {
        const who = m.who || 'kasif', isK = who === 'kasif';
        const wrap = el(castG, 'g');
        let clipRect = null, cid = null;
        if (m.kneel) { cid = `ag3kn${seed}_${i}`; const cp = el(defs, 'clipPath', { id: cid }); clipRect = el(cp, 'rect', { x: -400, y: -400, width: W + 800, height: 400 }); }
        const legsE = m.kneel ? inkEl(wrap) : null;
        const rg = el(wrap, 'g');
        if (cid) rg.setAttribute('clip-path', `url(#${cid})`);
        const rig = KASIF.create(rg, { scale: baseS * (m.scale || 1), hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: i * 7 + 3 + (isK ? 0 : 11) });
        const extra = el(wrap, 'g'), paintX = painter(extra);
        return { m, isK, rig, rg, clipRect, cid, legsE, paintX };
      });
      const labels = (P.labels || []).map((Lb, i) => makeLabel(labelG, Lb, W, H, seed * 50 + i * 13));
      const paintGrass = painter(grassG), paintWind = painter(windG);
      const grass = [];
      if (P.grass !== false) for (let i = 0; i < (P.grass ?? 16); i++) grass.push([30 + gr() * (W - 60), GY + 8 + gr() * 50, 0.7 + gr() * 0.6, gr() * 6]);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          // camera: drift + push-in + optional shake
          const Cm = P.cam || {}, u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, Cm.zoom ?? 1.05, u);
          const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : 0.6) * H;
          const shAt = tc(P.shake, cues, null), shk = shAt != null && lt >= shAt && lt < shAt + 0.5 ? Math.exp(-(lt - shAt) * 7) : 0;
          const camTf = k => `translate(${f1(Math.sin(lt * 0.35) * 8 * k - (Cm.pan ?? 0) * u * k + Math.sin(lt * 61) * 14 * shk)} ${f1(Math.cos(lt * 0.27) * 4 * k + Math.cos(lt * 53) * 10 * shk)}) translate(${f1(fx)} ${f1(fy)}) scale(${(1 + (z - 1) * k).toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`;
          world.setAttribute('transform', camTf(1));
          skyG.setAttribute('transform', `translate(${f1(-Math.sin(lt * 0.35) * 5)} 0)`);
          farG.setAttribute('transform', `translate(${f1(-Math.sin(lt * 0.35) * 3 + (Cm.pan ?? 0) * u * 0.5)} 0)`);
          const windAt = P.wind ? tc(P.wind.at, cues, dur * 0.5) : null;
          const wind = P.wind ? 0.35 + 0.65 * prog(lt, windAt, 0.5) : 0;

          // ---- sky
          const sky = [];
          if (night) {
            hatch.forEach((h, i) => sky.push({ p: h, w: 2.5, col: INK.inkSoft, o: 0.5, amp: 0.8 }));
            stars.forEach(([x, y, r, ph], i) => { const k = 0.6 + 0.4 * Math.sin(t * 2.4 + ph); sky.push({ p: [[x - r * k, y], [x + r * k, y]], w: 3.5, col: INK.inkSoft }, { p: [[x, y - r * k], [x, y + r * k]], w: 3.5, col: INK.inkSoft }); });
          }
          if (P.moon) {
            const M = Object.assign({ x: 0.82, y: 0.16, r: 62 }, P.moon), mx = M.x * W, my = M.y * H, r = M.r;
            const outer = arcPts(mx, my, r, r, -115, 115, 14), inner = arcPts(mx - r * 0.42, my, r * 0.86, r * 0.92, 108, -108, 12);
            sky.push({ p: outer.concat(inner), c: 1, f: INK.paperLight, w: 5 });
            for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + t * 0.15; sky.push({ p: [[mx + Math.cos(a) * r * 1.35, my + Math.sin(a) * r * 1.35], [mx + Math.cos(a) * r * 1.6, my + Math.sin(a) * r * 1.6]], w: 3, col: INK.inkSoft, o: 0.6 }); }
          }
          if (P.sun) {
            const S0 = Object.assign({ x: 0.84, y: 0.16, r: 54 }, P.sun), sx = S0.x * W, sy = S0.y * H, r = S0.r;
            sky.push({ p: inkEllipsePts(sx, sy, r, r, 91, 14), c: 1, f: INK.gold, fo: 0.75, w: 5 });
            for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + t * 0.2; sky.push({ p: [[sx + Math.cos(a) * r * 1.3, sy + Math.sin(a) * r * 1.3], [sx + Math.cos(a) * r * 1.75, sy + Math.sin(a) * r * 1.75]], w: 4, col: INK.gold }); }
          }
          paintSky(sky, t, seed * 1000 + 1);
          // ---- far ridges
          const far = [];
          ridges.forEach(rd => {
            far.push({ p: rd.pts, c: 0, f: INK.paperDark, fo: rd.k === 0 ? 0.5 : 0.85, w: 0, sm: rd.sharp ? 0 : 1 });
            far.push({ p: rd.pts.slice(1, -1), w: rd.k === 0 ? 3.5 : 4.5, col: INK.inkSoft, sm: rd.sharp ? 0 : 1 });
            rd.hs.forEach(h => far.push({ p: h, w: 2.5, col: INK.inkSoft, o: 0.7 }));
          });
          paintFar(far, t, seed * 1000 + 2);
          // ---- ground
          paintGround([{ p: gPts.concat([[W + 200, GY + 140], [-200, GY + 140]]), f: INK.paperDark, fo: 0.35, w: 0, sm: 0 }, { p: gPts, w: 6 }, ...ticks.map(tk => ({ p: tk, w: 4, col: INK.inkSoft }))], t, seed * 1000 + 3);
          // ---- river
          let riverX = null;
          if (R) {
            const cx = R.x * W, hw = R.w * W / 2, top = GY - 70;
            const bankL = [[cx - hw * 0.35, top], [cx - hw * 0.7, GY], [cx - hw * 1.1, H + 40]], bankR = [[cx + hw * 0.35, top], [cx + hw * 0.7, GY], [cx + hw * 1.1, H + 40]];
            riverX = y => { const k = clamp01((y - top) / (H + 40 - top)); return [lerp(cx - hw * 0.35, cx - hw * 1.1, k), lerp(cx + hw * 0.35, cx + hw * 1.1, k)]; };
            const waves = []; for (let i = 0; i < 9; i++) { const yy = top + 20 + ((i * 47 + lt * 60) % (H + 40 - top - 30)), [a, b] = riverX(yy), w = (b - a) * 0.3, x0 = lerp(a, b, ((i * 0.37) % 0.6) + 0.15); waves.push({ p: [[x0, yy], [x0 + w * 0.5, yy - 6], [x0 + w, yy]], w: 3.5, col: INK.blue, o: 0.8 }); }
            paintRiverB([{ p: bankL.concat(bankR.slice().reverse()), f: INK.paperLight, w: 0 }, { p: bankL, w: 5, col: INK.inkSoft }, { p: bankR, w: 5, col: INK.inkSoft }, ...waves], t, seed * 1000 + 4);
            // front band (covers hooves inside the water)
            const fy = GY - 34, [a0, b0] = riverX(fy), [a1, b1] = riverX(H + 40);
            const front = [[a0, fy], ...Array.from({ length: 7 }, (_, i) => [lerp(a0, b0, (i + 1) / 8), fy + Math.sin(lt * 3 + i * 1.3) * 4]), [b0, fy], [b1, H + 40], [a1, H + 40]];
            const fw = []; for (let i = 0; i < 6; i++) { const yy = fy + 26 + ((i * 41 + lt * 70) % 160), [a, b] = riverX(yy), x0 = lerp(a, b, 0.12 + (i % 3) * 0.28); fw.push({ p: [[x0, yy], [x0 + 26, yy - 6], [x0 + 52, yy]], w: 3.5, col: INK.blue }); }
            paintRiverF([{ p: front, f: INK.paperLight, w: 0, sm: 0 }, { p: front.slice(0, 9), w: 3, col: INK.inkSoft, o: 0.7 }, ...fw], t, seed * 1000 + 5);
          }
          // ---- lion
          if (P.lion) {
            const Ln = Object.assign({ x: 0.72, y: 0.3, size: 150 }, P.lion), at = tc(Ln.at, cues, 0.5), p = prog(lt, at, 0.9), sp = spring(lt, at, 0.7);
            if (lt >= at) {
              lionG.setAttribute('transform', `translate(${f1(Ln.x * W)} ${f1(Ln.y * H + Math.sin(t * 1.1) * 5)})`);
              paintLion(lionStrokes(p, Ln.size * lerp(0.5, 1, sp) * (1 + 0.04 * Math.sin(t * 1.6))), t, seed * 1000 + 6);
            } else paintLion([], t, 0);
          }
          // ---- buildings
          blds.forEach(o => {
            const b = o.b, at = tc(b.at, cues, 0), sp = spring(lt, at, 0.7), s = (b.scale || 1) * baseS;
            if (lt < at) { o.g.style.display = 'none'; return; }
            o.g.style.display = '';
            let st;
            if (b.type === 'castle') { const fa = b.flag ? tc(b.flag.at, cues, null) : null; st = castleStrokes(t, fa == null ? 0 : progIO(lt, fa, 0.9), colOf(b.flag && b.flag.color, INK.red)); }
            else if (b.type === 'tent') st = tentStrokes(t, b.tug);
            else if (b.type === 'palace') st = palaceStrokes();
            else if (b.type === 'dome') st = domeStrokes();
            else st = wallsStrokes(((b.to ?? 1) - (b.from ?? 0)) * W / s);
            const x = b.type === 'walls' ? (b.from ?? 0) * W : (b.x ?? 0.7) * W;
            o.g.setAttribute('transform', `translate(${f1(x)} ${f1(GY + (b.dy || 0))}) scale(${f1(s * 1000) / 1000} ${f1(s * lerp(0.3, 1, sp) * 1000) / 1000})`);
            o.paint(st, t, seed * 1000 + 100 + o.i * 40);
          });
          props.forEach(({ pp, g, d }, i) => {
            const at = tc(pp.at, cues, 0.1 + i * 0.15), sp = spring(lt, at, 0.6), s = baseS * (pp.scale || 1);
            g.style.display = lt >= at ? '' : 'none';
            g.setAttribute('transform', `translate(${f1((pp.x ?? 0.7) * W)} ${f1(pp.y != null ? pp.y * H : GY)}) scale(${(s * (pp.flip ? -1 : 1)).toFixed(4)} ${(s * lerp(0.2, 1, sp)).toFixed(4)})`);
            d.update(t, lt, { text: pp.text, flip: pp.flip });
          });
          // ---- trail of hoof prints towards the horizon
          if (P.trail) {
            const Tr = Object.assign({ n: 14, dur: 2.2 }, P.trail), at = tc(Tr.at, cues, 0.3);
            const a = [Tr.from[0] * W, Tr.from[1] * H], b = [Tr.to[0] * W, Tr.to[1] * H], st = [];
            const nrm = [-(b[1] - a[1]), b[0] - a[0]], nl = Math.hypot(nrm[0], nrm[1]) || 1;
            st.push({ p: [[a[0] - 150, a[1] + 30], [b[0] - 10, b[1]]], w: 4, col: INK.inkSoft, o: 0.8 }, { p: [[a[0] + 150, a[1] + 30], [b[0] + 10, b[1]]], w: 4, col: INK.inkSoft, o: 0.8 });
            for (let i = 0; i < Tr.n; i++) {
              const v = i / (Tr.n - 1), k = Math.pow(v, 0.8), shown = lt >= at + v * Tr.dur;
              if (!shown) continue;
              const fade = 1 - v * 0.85, s = lerp(1, 0.25, k), sd = i % 2 ? 1 : -1;
              const c = [lerp(a[0], b[0], k) + nrm[0] / nl * 26 * s * sd, lerp(a[1], b[1], k) + nrm[1] / nl * 26 * s * sd];
              st.push({ p: arcPts(c[0], c[1], 30 * s, 24 * s, 200, 340, 6).concat(arcPts(c[0], c[1] - 3 * s, 18 * s, 13 * s, 330, 210, 4)), c: 1, f: INK.ink, fo: fade, w: 0 });
            }
            paintTrail(st, t, seed * 1000 + 7);
          }
          // ---- troops
          troops.forEach(o => {
            const tp = o.tp, at = tc(tp.at, cues, 0), d = tp.dur || 3, uu = lin(lt, at, d), mov = lt >= at && uu < 1;
            const a = [tp.from[0] * W, tp.from[1] * H], b = [(tp.to || tp.from)[0] * W, (tp.to || tp.from)[1] * H], gap = tp.gap || [-80, 0];
            const face = tp.face ? faceOf(tp.face) : (b[0] >= a[0] ? 1 : -1), s = (tp.scale || 1) * 0.3 * baseS;
            o.members.forEach((mb, j) => {
              const sp = tp.appear ? spring(lt, at + j * 0.08, 0.5) : 1;
              if (tp.appear && lt < at + j * 0.08) { mb.g.style.display = 'none'; return; }
              mb.g.style.display = '';
              const x = lerp(a[0], b[0], uu) + gap[0] * j, y = lerp(a[1], b[1], uu) + gap[1] * j;
              mb.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${f1(face * s * sp * 1000) / 1000} ${f1(s * sp * 1000) / 1000})`);
              const ph = (lt * (tp.kind === 'rider' ? 2.4 : 1.5)) + j * 0.37;
              if (tp.kind === 'rider') {
                const hs = horseStrokes(t, ph, mov || tp.loop ? 2 : 0, { wk: 1.9, cloth: tp.color || 'blue' });
                mb.paint([...hs.back, ...stickRider(t, hs, { wk: 1.6, color: tp.color || 'blue', spear: true }), ...hs.front], t, seed * 1000 + 300 + o.i * 50 + j);
              } else mb.paint(soldierStrokes(t, ph, mov || tp.loop, { wk: 1.6, color: tp.color }), t, seed * 1000 + 300 + o.i * 50 + j);
            });
          });
          // ---- riders
          riders.forEach(o => {
            const r = o.r, s = (r.scale || 1) * 0.8 * baseS, x0 = r.x * W, x1 = (r.to ?? r.x) * W;
            const start = tc(r.start, cues, 0), gait = r.gait === 'gallop' ? 2 : 1, speed = (gait === 2 ? 520 : 170) * s;
            const arr = r.at != null ? tc(r.at, cues, null) : null, t1 = arr ?? start + (r.dur ?? Math.abs(x1 - x0) / speed);
            const turnAt = r.turn != null ? tc(r.turn, cues, null) : null;
            const stride = (gait === 2 ? 330 : 150) * s;
            let x, face = faceOf(r.face) ?? (x1 >= x0 ? 1 : -1), g = 0, ph = 0;
            const mvP = x1 === x0 ? 1 : prog(lt, start, Math.max(0.2, t1 - start));
            x = lerp(x0, x1, mvP);
            if (x1 !== x0 && lt >= start && lt < t1 + 0.1) { g = gait; ph = Math.abs(x - x0) / stride; }
            else ph = Math.abs(x1 - x0) / stride;
            if (r.loop) { g = gait; ph = lt * (gait === 2 ? 2.4 : 1.1); }
            if (turnAt != null && lt >= turnAt) {
              const k = lt - turnAt, xo = (r.off ?? (face > 0 ? -0.3 : 1.3)) * W;
              const tf = sm01(k / 0.35);
              face = lerp(face, -face, tf);
              const op = prog(lt, turnAt + 0.25, r.off_dur || 1.8);
              x = lerp(x1, xo, op);
              g = 2; ph = Math.abs(x - x1) / (330 * s) + 0.3;
            }
            o.g.setAttribute('transform', `translate(${f1(x)} ${f1(GY + (r.dy || 0))}) scale(${f1(face * s * 1000) / 1000} ${f1(s * 1000) / 1000})`);
            const hs = horseStrokes(t, ph, g, { coat: r.coat, cloth: r.cloth });
            const R0 = r.rider || {};
            const back = hs.back.slice();
            if (r.banner) {
              const bx = -40, wv = Math.sin(t * 5) * 8 + (g === 2 ? 10 : 0), wv2 = Math.sin(t * 5 + 1.3) * 12;
              back.push({ p: [[bx, hs.seat[1] + 50], [bx, hs.seat[1] - 300]], w: 6 });
              back.push({ p: [[bx, hs.seat[1] - 300], [bx - 70, hs.seat[1] - 290 + wv], [bx - 150, hs.seat[1] - 274 + wv2], [bx - 72, hs.seat[1] - 252 + wv], [bx, hs.seat[1] - 240]], c: 1, f: colOf(r.banner, INK.red), w: 4 });
            }
            o.paintBack(back, t, seed * 1000 + 500 + o.i * 60);
            if (o.rig) {
              const rs = R0.scale || 0.6, at = R0.at != null ? tc(R0.at, cues, null) : null, on = at != null && lt >= at;
              const pose = on ? (R0.then || 'point') : (R0.pose || 'idle');
              o.clipRect.setAttribute('height', f1(2400 + hs.seat[1] + 6));
              // KASIF origin is the ground under the hip: put it 184 rig units below the saddle so the hip sits on it
              o.rig.update(t, pose, { x: hs.seat[0], y: hs.seat[1] + 184 * rs, face: 1, since: on ? lt - at : lt, dir: dirAng(R0.dir ?? 20),
                emotion: on ? (R0.emotion2 || R0.emotion) : R0.emotion });
            }
            const legSeat = hs.seat;
            o.paintFront([...hs.front, { p: [[legSeat[0], legSeat[1] + 2], [legSeat[0] + 34, legSeat[1] + 46], [legSeat[0] + 20, legSeat[1] + 96]], w: 7 },
              { p: inkEllipsePts(legSeat[0] + 30, legSeat[1] + 98, 17, 8, 77, 8), c: 1, f: INK.ink, w: 0 }], t, seed * 1000 + 560 + o.i * 60);
            if (riverX && x > 0) {   // splash when the horse is in the water
              const [a, b] = riverX(GY);
              if (x > a - 40 && x < b + 40 && g) {
                const sp = []; for (let i = 0; i < 4; i++) { const k = ((lt * 3 + i * 0.25) % 1); sp.push({ p: arcPts(x + (i - 1.5) * 50, GY - 20, 20 + k * 30, 14 + k * 26, 200, 340, 5), w: 3.5, col: INK.blue, o: 1 - k }); }
                o.paintFront.splash = o.paintFront.splash || painter(riverFG);
                o.paintFront.splash(sp, t, seed * 1000 + 590 + o.i);
              } else if (o.paintFront.splash) o.paintFront.splash([], t, 0);
            }
          });
          // ---- cast
          cast.forEach((c, i) => {
            const m = c.m, px = baseS * (m.scale || 1);
            const st = planner.state(m, lt, cues, px);
            const gy = m.y != null ? m.y * H : GY;
            const o = st.opts;
            const shAt = m.shiver != null ? tc(m.shiver, cues, null) : null;
            if (shAt != null && lt >= shAt) o.x += Math.sin(lt * 46) * 3.5;
            // kneel: 1 kneeling .. 0 standing
            let kn = 0;
            if (m.kneel) { kn = 1; const sa = m.stand != null ? tc(m.stand, cues, null) : null; if (sa != null) kn = 1 - progIO(lt, sa, 0.6); }
            const hipH = lerp(184, 112, kn);
            o.y = gy + (184 - hipH) * px;
            const res = c.rig.update(t, st.pose, o);
            const f = o.face, X = q => [o.x + f * px * q[0], o.y + px * q[1]];
            if (c.clipRect) {
              if (kn > 0.01) {
                const hy = gy - hipH * px;
                c.rg.setAttribute('clip-path', `url(#${c.cid})`);
                c.clipRect.setAttribute('y', -400); c.clipRect.setAttribute('height', hy + 6 * px + 400);
                const legs = [];
                for (const [dx, ss] of [[-10, 1], [12, 2]]) {
                  const hip = [o.x + f * dx * px, hy];
                  const knee = [o.x + f * (dx + lerp(16, 48, kn)) * px, lerp(gy - 92 * px, gy - 10 * px, kn)];
                  const foot = [o.x + f * (dx + lerp(20, -78, kn)) * px, gy - 6 * px];
                  legs.push(inkPath([hip, knee, foot], { w: 7 * px, seed: seed * 70 + ss + i * 5, t, amp: 1.5 }));
                  legs.push(inkDot(foot[0] - f * 6 * px, foot[1] - 2, 18 * px, 9 * px, seed * 70 + ss + 9, t));
                }
                c.legsE.setAttribute('d', legs.join(' '));
              } else { c.rg.removeAttribute('clip-path'); c.legsE.setAttribute('d', ''); }
            }
            const ex = [];
            if (m.crown && res) {      // a separate crown that can fall off the head
              const hc = X(res.head), fa = m.crown.fall != null ? tc(m.crown.fall, cues, null) : null;
              let tf = q => [hc[0] + f * px * q[0], hc[1] + px * q[1]];
              if (fa != null && lt >= fa) {
                const k = clamp01((lt - fa) / 0.75), e = [o.x + f * 150 * px, gy - 34 * px], s0 = [hc[0], hc[1] - 85 * px];
                const cx = lerp(s0[0], e[0], k), cy = lerp(s0[1], e[1], k) - Math.sin(Math.PI * k) * 90 * px;
                const ang = f * (k * 105 + (k >= 1 ? Math.sin((lt - fa - 0.75) * 9) * 6 * Math.exp(-(lt - fa - 0.75) * 3) : 0));
                tf = q => { const r = rotV([f * q[0] * px, (q[1] + 85) * px], ang); return [cx + r[0], cy + r[1]]; };
              }
              const cp = CROWN.map(tf);
              ex.push({ p: cp, c: 1, f: INK.gold, w: 5 * px });
              [[-34, -66], [6, -66], [44, -66]].forEach((q, j) => { const p = tf(q); ex.push({ p: inkEllipsePts(p[0], p[1], 7 * px, 7 * px, 90 + j, 6), c: 1, f: INK.red, w: 0 }); });
            }
            if (m.sword && res) {
              const sa = m.sword === true ? 0 : tc(m.sword, cues, 0);
              if (lt >= sa - 0.4) {
                const hand = X(res.hands[1]), sho = X([res.hip[0] + 6, res.hip[1] - 112]);
                let dx = hand[0] - sho[0], dy = hand[1] - sho[1]; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
                const tip = [hand[0] + dx * 190 * px, hand[1] + dy * 190 * px], pm = [-dy, dx];
                ex.push({ p: [[hand[0] + pm[0] * 9 * px, hand[1] + pm[1] * 9 * px], [tip[0], tip[1]], [hand[0] - pm[0] * 9 * px, hand[1] - pm[1] * 9 * px]], c: 1, f: INK.paperLight, w: 4 * px, sm: 0 });
                ex.push({ p: [[hand[0] + pm[0] * 30 * px + dx * 6 * px, hand[1] + pm[1] * 30 * px + dy * 6 * px], [hand[0] - pm[0] * 30 * px + dx * 6 * px, hand[1] - pm[1] * 30 * px + dy * 6 * px]], w: 7 * px });
                const pk = punch(lt, sa, 0.6);
                if (pk > 0.05) for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2; ex.push({ p: [[tip[0] + Math.cos(a) * 26, tip[1] + Math.sin(a) * 26], [tip[0] + Math.cos(a) * (26 + 40 * pk), tip[1] + Math.sin(a) * (26 + 40 * pk)]], w: 4, col: INK.gold }); }
              }
            }
            c.paintX(ex, t, seed * 1000 + 700 + i * 30);
          });
          // ---- grass (foreground), wind, labels
          const gs = [];
          grass.forEach(([x, y, k, ph], i) => {
            const bend = Math.sin(t * 1.7 + ph) * 4 + wind * (14 + Math.sin(t * 6 + i) * 6);
            for (let j = -1; j <= 1; j++) gs.push({ p: [[x + j * 8, y], [x + j * 12 + bend * 0.5, y - 20 * k], [x + j * 14 + bend, y - (34 + j * j * -6) * k]], w: 3.5, col: INK.inkSoft, taper: 0.7 });
          });
          paintGrass(gs, t, seed * 1000 + 800);
          const ws = [];
          if (P.wind) for (let i = 0; i < 7; i++) {
            const sp = 500 + i * 60, x = ((lt * sp * (0.4 + wind) + i * 410) % (W + 600)) - 300, y = H * (0.12 + (i * 0.09) % 0.5) + Math.sin(lt * 2 + i) * 10;
            ws.push({ p: [[x, y], [x + 60, y - 8], [x + 130, y + 4], [x + 170, y - 6]], w: 3.5, col: INK.inkSoft, o: 0.35 + 0.6 * wind, taper: 0.8 });
          }
          paintWind(ws, t, seed * 1000 + 900);
          labels.forEach(lb => lb.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================ ag03a_map
  // simplified coastlines [lon, lat]; land is everything that is not water
  const WATER = {
    med: [[15, 28], [15, 40], [19.4, 40.4], [20, 39.6], [20.7, 38.8], [21.1, 38.3], [21.6, 37.5], [21.7, 36.8], [22.5, 36.4], [23, 36.6], [22.8, 37.6], [23.2, 38], [24, 37.7], [23.9, 38.4], [22.8, 38.9], [22.6, 39.5], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.1, 39.5], [26.9, 39.4], [26.8, 38.6], [26.4, 38.3], [27.2, 37.9], [27.4, 37], [28.2, 36.7], [29.6, 36.2], [30.5, 36.5], [31, 36.8], [32.5, 36.1], [33.6, 36.2], [34.6, 36.8], [35.8, 36.8], [36.2, 36.6], [35.9, 36.6], [35.8, 35.5], [35.9, 34.5], [35.2, 33], [34.6, 32], [34.2, 31.3], [32.3, 31.2], [31.2, 31.5], [29.9, 31.2], [27.5, 31.2], [25, 31.7], [22.9, 32.6], [21, 32.8], [20, 32], [20, 30.9], [18.5, 30.3], [15, 30.5]],
    black: [[27.5, 42], [28, 42], [27.8, 42.8], [28.5, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5], [35.5, 45.2], [36.6, 45.4], [38, 47], [39.5, 47], [38, 46], [37.5, 45.3], [38.5, 44.4], [40, 43.4], [41.5, 42], [41.5, 41.5], [40, 41], [38, 40.9], [36.5, 41.3], [35, 42], [33, 42], [31.4, 41.3], [30, 41.1], [29.1, 41.2], [29, 41.2]],
    marmara: [[26.2, 40.1], [26.7, 40.4], [27.5, 40.95], [28.9, 41], [29.4, 40.8], [29, 40.4], [27.5, 40.4], [26.8, 40.35]],
    van: [[42.28, 38.52], [42.45, 38.72], [42.62, 38.8], [42.85, 38.86], [43.05, 38.92], [43.3, 39.02], [43.45, 38.93], [43.3, 38.72], [43.35, 38.52], [43.15, 38.35], [42.85, 38.36], [42.55, 38.4]],
    urmia: [[45.1, 38.2], [45.6, 38.1], [45.9, 37.6], [45.6, 37.2], [45.3, 37.4], [45.0, 37.8]],
    caspian: [[46.7, 44.8], [47.5, 45.6], [49, 46.4], [51.2, 47], [53, 46.8], [53.2, 45.3], [51.3, 44.5], [50.3, 44.3], [51.2, 43.2], [52.7, 42], [53, 40.6], [54, 39.5], [53.8, 37.3], [53, 36.9], [51, 36.8], [50, 37.4], [49, 38], [48.9, 38.4], [49.4, 40.2], [50.3, 40.4], [49.5, 40.6], [48.6, 41.8], [47.5, 43], [47.5, 43.8]],
    gulf: [[47.9, 30], [48.8, 30], [50.1, 30.1], [50.8, 28.9], [51.4, 27.9], [56, 26.5], [56.4, 24], [51.6, 24], [50.5, 25], [50.2, 26.3], [49.1, 27.4], [48.4, 28.5]],
  };
  const ISLANDS = [[[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]], [[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]]];
  const RIVERS = [
    [[41.0, 39.9], [40, 39.5], [39.2, 39.1], [38.6, 38.8], [38.3, 38.2], [38, 37.3], [38.1, 36.9], [38.4, 36], [39, 35.95], [40.1, 35.3], [40.9, 34.5], [41.9, 34.1], [43, 33.3], [44.3, 32.5], [45.3, 31.6], [46.3, 31], [47.4, 30.9], [48, 30.4]],
    [[39.8, 38.5], [40.2, 37.9], [41.2, 37.6], [42.2, 37.3], [42.8, 36.7], [43.15, 36.35], [43.3, 35.5], [43.8, 34.6], [44.4, 33.3], [45.4, 32.5], [46.3, 31.6], [47.4, 30.9]],
    [[31.2, 31.5], [31.1, 30.4], [31.2, 29.5], [30.9, 28.2]],
  ];
  const REALMS = {
    bizans: [[19.6, 41.8], [22, 44.5], [28.6, 44.3], [28.2, 42], [29, 41.2], [31.4, 41.3], [33, 42], [35, 42], [36.5, 41.3], [38, 40.9], [40, 41], [41.5, 41.5], [43.6, 41.2], [44.6, 40.2], [44, 39.2], [42.4, 38.2], [40.5, 37.6], [38.5, 37.1], [36.6, 36.3], [36.1, 36.7], [35.8, 36.8], [32.5, 36.1], [30.5, 36.5], [28.2, 36.7], [26.2, 39.5], [22.6, 36.4], [21.3, 37.5], [20, 39.6]],
    selcuklu: [[44.6, 40.2], [46.5, 41.6], [49, 41], [50, 37], [54, 37.5], [61, 37], [61, 26], [50.5, 27.5], [48.5, 30], [46.5, 30.6], [44, 30.2], [41, 32.6], [38.8, 34.6], [37.6, 35.6], [38.5, 37.1], [40.5, 37.6], [42.4, 38.2], [44, 39.2]],
  };
  const KX = Math.cos(37 * Math.PI / 180);

  function iconStrokes(type, t, o = {}) {
    if (type === 'dome') return [
      { p: [[-60, 0], [-60, -40], [60, -40], [60, 0]], c: 1, f: INK.paperLight, w: 5, sm: 0 },
      { p: [[-48, -40], ...arcPts(0, -40, 48, 46, 180, 360, 10).slice(1)], c: 1, f: INK.gold, w: 5 },
      { p: [[0, -86], [0, -106]], w: 4 }, { p: [[-8, -98], [8, -98]], w: 4 },
      { p: [[-86, 0], [-86, -30], [-60, -40]], w: 4 }, { p: [[86, 0], [86, -30], [60, -40]], w: 4 }];
    if (type === 'tent') return [
      { p: [[-50, 0], [-50, -34], ...arcPts(0, -34, 52, 44, 180, 360, 8).slice(1), [50, 0]], c: 1, f: INK.paperLight, w: 5 },
      { p: [[-12, 0], [-12, -26], [12, -26], [12, 0]], c: 1, f: INK.inkSoft, w: 3, sm: 0 }];
    // castle (with a flag that rises)
    const fu = o.flagUp || 0, st = [
      { p: [[-56, 0], [-56, -64], [-40, -64], [-40, -54], [-24, -54], [-24, -64], [-8, -64], [-8, -54], [8, -54], [8, -64], [24, -64], [24, -54], [40, -54], [40, -64], [56, -64], [56, 0]], c: 1, f: INK.paperLight, w: 5, sm: 0 },
      { p: [[-14, 0], [-14, -26], [14, -26], [14, 0]], c: 1, f: INK.inkSoft, w: 3, sm: 0 },
      { p: [[40, -64], [40, -150]], w: 5 }];
    if (fu > 0.01) { const fy = lerp(-80, -150, fu), w = Math.sin(t * 5) * 5; st.push({ p: [[40, fy], [90, fy + 6 + w], [86, fy + 36 + w], [40, fy + 34]], c: 1, f: colOf(o.flagColor, INK.red), w: 3.5 }); }
    return st;
  }

  SH.ag03a_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const K0 = Object.assign({ side: 'left', scale: 0.72 }, P.kasif || {});
      const left = K0.side !== 'right';
      const S = left ? { x: 420, y: 150, w: 1440, h: 712 } : { x: 250, y: 150, w: 1360, h: 712 }
      if (P.sheet) Object.assign(S, P.sheet);   // optional per-scene sheet rect override {x, y, w, h}
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sheetE = inkEl(cam, INK.paperLight), sheetSh = inkEl(cam, INK.ink, { 'fill-opacity': 0.16 });
      cam.insertBefore(sheetSh, sheetE);
      const sheetR = inkEl(cam);
      const cid = 'ag3map' + seed, clip = el(defs, 'clipPath', { id: cid });
      el(clip, 'rect', { x: S.x + 5, y: S.y + 5, width: S.w - 10, height: S.h - 10, rx: 8 });
      const mg = el(cam, 'g', { 'clip-path': `url(#${cid})` });
      const landE = inkEl(mg, INK.paperDark);
      const gridE = inkEl(mg, INK.inkSoft, { 'fill-opacity': 0.35 });
      // realms with hatch patterns + sweep clips
      const pats = {};
      const pat = col => {
        if (pats[col]) return pats[col];
        const id = `ag3pat${seed}_${col.slice(1)}`, p = el(defs, 'pattern', { id, width: 20, height: 20, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(38)' });
        el(p, 'rect', { x: 0, y: 0, width: 5, height: 20, fill: col, 'fill-opacity': 0.55 });
        return (pats[col] = `url(#${id})`);
      };
      const realms = (P.realms || []).map((rm, i) => {
        const col = colOf(rm.color, INK.red), id = `ag3rc${seed}_${i}`, cp = el(defs, 'clipPath', { id });
        const rect = el(cp, 'rect', { x: 0, y: 0, width: 0, height: H });
        const g = el(mg, 'g', { 'clip-path': `url(#${id})` });
        const fillE = el(g, 'path', { fill: pat(col), stroke: 'none' }), tintE = inkEl(g, col, { 'fill-opacity': 0.1 }), lineE = inkEl(g, col);
        const pts = typeof rm.poly === 'string' ? REALMS[rm.poly] : rm.poly;
        return { rm, col, rect, fillE, tintE, lineE, pts };
      });
      const waterE = inkEl(mg, INK.paperLight), coastE = inkEl(mg, INK.inkSoft), riverE = inkEl(mg, INK.blue, { 'fill-opacity': 0.75 });
      const wavesE = inkEl(mg, INK.inkSoft, { 'fill-opacity': 0.7 });
      const realmLabG = el(mg, 'g');
      const realmLabs = realms.map(r => {
        if (!r.rm.label) return null;
        const Lb = r.rm.label, t = el(realmLabG, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': Lb.size || 60, 'text-anchor': 'middle', fill: r.col, 'letter-spacing': '0.06em',
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
        t.textContent = Lb.text.toLocaleUpperCase(LOCALE);
        return t;
      });
      const routesG = el(mg, 'g');
      const routes = (P.routes || []).map((rt, i) => {
        const col = colOf(rt.color, INK.red);
        const node = el(routesG, 'path', { fill: 'none', stroke: col, 'stroke-width': rt.width || 8, 'stroke-linecap': 'round', 'stroke-dasharray': rt.solid ? 'none' : '22 16' });
        const head = inkEl(routesG, col), dustG = el(routesG, 'g'), paintDust = painter(dustG);
        const glyphs = []; for (let j = 0; j < (rt.riders || 0); j++) { const g = el(routesG, 'g'); glyphs.push({ g, paint: painter(g) }); }
        let lab = null;
        if (rt.label) { lab = el(routesG, 'text', { 'font-family': INK_FONT, 'font-size': rt.label.size || 62, 'text-anchor': 'middle', fill: colOf(rt.label.color, col), style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` }); lab.textContent = rt.label.text; }
        return { rt, col, node, head, paintDust, glyphs, lab };
      });
      const gaugeE = P.gauge ? inkEl(mg, colOf(P.gauge.color, INK.ink)) : null;
      const iconsG = el(mg, 'g');
      const icons = (P.icons || []).map((ic, i) => { const g = el(iconsG, 'g'); return { ic, g, paint: painter(g), i }; });
      const citiesG = el(mg, 'g');
      const cities = (P.cities || []).map((c, i) => {
        const g = el(citiesG, 'g'), col = colOf(c.color, INK.ink);
        const dotE = inkEl(g, INK.paperLight), dotR = inkEl(g, col), dotC = inkEl(g, col), ringE = inkEl(g, INK.red);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': c.size || 64, 'text-anchor': c.anchor || 'middle', fill: col, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = c.name;
        return { c, g, col, dotE, dotR, dotC, ringE, t, i };
      });
      const texts = (P.texts || []).map(T => {
        const t = el(citiesG, 'text', { 'font-family': INK_FONT, 'font-size': T.size || 60, 'text-anchor': 'middle', fill: colOf(T.color, INK.inkSoft), 'letter-spacing': '0.04em',
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });
        t.textContent = T.text;
        return { T, t };
      });
      const frameE = inkEl(cam, INK.inkSoft);
      // compass (bottom corner away from the narrator)
      const compG = el(cam, 'g'), paintComp = painter(compG);
      const ccx = left ? S.x + S.w - 100 : S.x + 100, ccy = S.y + S.h - 100;
      // note card
      let note = null;
      if (P.note) {
        const N = P.note, g = el(cam, 'g'), box = inkEl(g, INK.paperLight), boxR = inkEl(g);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': N.size || 58, 'text-anchor': 'start', fill: colOf(N.color, INK.red) });
        t.textContent = N.text;
        note = { N, g, box, boxR, t, tw: null };
      }
      // narrator beside the sheet
      const kg = el(root, 'g'), groundE = inkEl(kg, INK.inkSoft);
      const rig = KASIF.create(el(kg, 'g'), { scale: K0.scale, hat: true, seed: seed + 5 });
      const KX0 = left ? 210 : W - 165, KY = 900;
      const planner = makePlanner(W);
      const km = Object.assign({}, K0, { x: (K0.walk ? (left ? -0.06 : 1.06) : KX0 / W), pose: K0.walk ? 'walk' : (K0.pose || 'idle'), to: K0.walk ? KX0 / W : undefined,
        then: K0.walk ? (K0.then || K0.pose || 'point') : K0.then, at: K0.walk ? (K0.arrive ?? 1.0) : K0.at, face: K0.face || (left ? 'right' : 'left') });
      if (K0.walk && K0.at != null) km.seq = [{ at: K0.at, pose: K0.then2 || K0.then || 'point', dir: K0.dir, emotion: K0.emotion2 || K0.emotion, face: K0.face || (left ? 'right' : 'left') }].concat(K0.seq || []);

      const V0 = P.view || [26, 46, 34, 43], V1 = P.view2 || V0;
      const vparams = V => { const sc = Math.min(S.w / ((V[1] - V[0]) * KX), S.h / (V[3] - V[2])); return [(V[0] + V[1]) / 2, (V[2] + V[3]) / 2, Math.log(sc)]; };
      const A0 = vparams(V0), A1 = vparams(V1);
      const dense = (pts, n = 10) => {
        const out = [];
        for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < n; k++) {
          const u = k / n, p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
          const cr = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
          out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
        }
        out.push(pts[pts.length - 1]);
        return out;
      };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          const pin = spring(lt, 0, 0.7);
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.3) * 5)} ${f1(Math.cos(t * 0.25) * 3 + (1 - pin) * 50)}) rotate(${f1((1 - pin) * -2 - 0.3)} ${W / 2} ${H / 2})`);
          // view (pan + slow push-in)
          const pa = P.pan ? tc(P.pan.at, cues, 0.5) : 0, pp = P.view2 ? progIO(lt, pa, (P.pan && P.pan.dur) || 1.8) : 0;
          const push = 1 + 0.05 * progIO(lt, 0, Math.max(1, dur));
          const lc = lerp(A0[0], A1[0], pp), ac = lerp(A0[1], A1[1], pp), sc = Math.exp(lerp(A0[2], A1[2], pp)) * push;
          const PX = q => [S.x + S.w / 2 + (q[0] - lc) * KX * sc, S.y + S.h / 2 - (q[1] - ac) * sc];
          const PXs = pts => pts.map(PX);
          // sheet
          const sp = [[S.x, S.y], [S.x + S.w, S.y + 2], [S.x + S.w - 2, S.y + S.h], [S.x + 2, S.y + S.h - 2]];
          sheetSh.setAttribute('d', inkLoop(sp.map(q => [q[0] + 10, q[1] + 12]), { seed: seed + 1, t, smooth: false }));
          sheetE.setAttribute('d', inkLoop(sp, { seed: seed + 2, t, smooth: false }));
          sheetR.setAttribute('d', inkPath(sp, { seed: seed + 2, t, w: 4, closed: true, smooth: false }));
          frameE.setAttribute('d', inkPath([[S.x + 18, S.y + 18], [S.x + S.w - 18, S.y + 18], [S.x + S.w - 18, S.y + S.h - 18], [S.x + 18, S.y + S.h - 18]], { seed: seed + 3, t, w: 2.5, closed: true, smooth: false }));
          landE.setAttribute('d', `M${S.x} ${S.y} H${S.x + S.w} V${S.y + S.h} H${S.x} Z`);
          // graticule every 5 degrees
          let gd = '';
          for (let lo = 15; lo <= 60; lo += 5) { const a = PX([lo, 25]), b = PX([lo, 50]); if (a[0] > S.x - 10 && a[0] < S.x + S.w + 10) gd += inkPath([a, b], { seed: seed * 7 + lo, t, w: 2, amp: 1 }) + ' '; }
          for (let la = 25; la <= 50; la += 5) { const a = PX([10, la]), b = PX([62, la]); if (a[1] > S.y - 10 && a[1] < S.y + S.h + 10) gd += inkPath([a, b], { seed: seed * 7 + la + 100, t, w: 2, amp: 1 }) + ' '; }
          gridE.setAttribute('d', gd);
          // realms
          realms.forEach((r, i) => {
            const pts = PXs(r.pts), at = tc(r.rm.at, cues, -1), p = at < 0 ? 1 : progIO(lt, at, r.rm.dur || 1.6);
            let x0 = Infinity, x1 = -Infinity; pts.forEach(q => { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); });
            const w = (x1 - x0) * p;
            r.rect.setAttribute('x', f1(r.rm.from === 'east' ? x1 - w : x0)); r.rect.setAttribute('width', f1(Math.max(0, w)));
            const d = inkLoop(pts, { seed: seed * 11 + i, t, amp: 1.2, smooth: false });
            r.fillE.setAttribute('d', d); r.tintE.setAttribute('d', d);
            r.lineE.setAttribute('d', inkPath(pts, { seed: seed * 11 + i, t, w: 5, closed: true, amp: 1.2, smooth: false }));
            const lb = realmLabs[i];
            if (lb) {
              const Lb = r.rm.label, la = tc(Lb.at, cues, at < 0 ? 0 : at + (r.rm.dur || 1.6) * 0.6), q = PX([Lb.lon, Lb.lat]), s2 = spring(lt, la, 0.6);
              lb.style.display = lt >= la ? '' : 'none';
              lb.setAttribute('transform', `translate(${f1(q[0])} ${f1(q[1])}) rotate(-4) scale(${f1(lerp(0.6, 1, s2) * 1000) / 1000})`);
            }
          });
          // water + coast + rivers
          let wd = '', cd = '';
          Object.keys(WATER).forEach((k, i) => { const pts = PXs(WATER[k]); wd += inkLoop(pts, { seed: seed * 13 + i, t, amp: 1.2 }) + ' '; cd += inkPath(pts, { seed: seed * 13 + i, t, w: 4, closed: true, amp: 1.2 }) + ' '; });
          ISLANDS.forEach((isl, i) => { cd += inkPath(PXs(isl), { seed: seed * 17 + i, t, w: 3.5, closed: true }) + ' '; });
          waterE.setAttribute('d', wd); coastE.setAttribute('d', cd);
          riverE.setAttribute('d', RIVERS.map((rv, i) => inkPath(PXs(rv), { seed: seed * 19 + i, t, w: 4, amp: 1, taper: 0.6 })).join(' '));
          let wv = '';
          [[30, 43.2], [36, 42.6], [33, 34.6], [26.5, 34.5], [51, 41.5], [29, 33]].forEach(([lo, la], i) => { const c = PX([lo, la]); const pts = []; for (let j = 0; j <= 6; j++) pts.push([c[0] - 30 + j * 10, c[1] + Math.sin(j * 1.6 + t * 1.5) * 5]); wv += inkPath(pts, { seed: seed * 23 + i, t, w: 3, amp: 0.8 }) + ' '; });
          wavesE.setAttribute('d', wv);
          // routes
          routes.forEach((ro, i) => {
            const rt = ro.rt, pts = dense(PXs(rt.pts)), cum = [0];
            for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
            const Ltot = cum[cum.length - 1], at = tc(rt.at, cues, 0.5), dd = rt.dur || 1.8, p = rt.linear ? lin(lt, at, dd) : progIO(lt, at, dd), Lc = Ltot * p;
            const pos = L => { let k = 1; while (k < pts.length - 1 && cum[k] < L) k++; const u = clamp01((L - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1])); return { q: [lerp(pts[k - 1][0], pts[k][0], u), lerp(pts[k - 1][1], pts[k][1], u)], ang: Math.atan2(pts[k][1] - pts[k - 1][1], pts[k][0] - pts[k - 1][0]) }; };
            const vis = lt >= at;
            if (!vis) { ro.node.setAttribute('d', ''); ro.head.setAttribute('d', ''); ro.paintDust([], t, 0); ro.glyphs.forEach(gl => gl.g.style.display = 'none'); if (ro.lab) ro.lab.style.display = 'none'; return; }
            const tip = pos(Lc), shown = []; let k = 0;
            while (k < pts.length && cum[k] < Lc) shown.push(pts[k++]);
            shown.push(tip.q);
            ro.node.setAttribute('d', 'M' + shown.map(q => `${f1(q[0])} ${f1(q[1])}`).join(' L'));
            ro.node.setAttribute('stroke-dashoffset', f1(-t * 12));
            if (rt.head !== false && Lc > 20) {
              const e = tip.q, a = tip.ang, hl = 34;
              ro.head.setAttribute('d', inkPath([[e[0] - hl * Math.cos(a - 0.55), e[1] - hl * Math.sin(a - 0.55)], e, [e[0] - hl * Math.cos(a + 0.55), e[1] - hl * Math.sin(a + 0.55)]], { seed: seed * 29 + i, t, w: 8, smooth: false }));
            } else ro.head.setAttribute('d', '');
            // dust cloud behind the tip while moving
            const moving = p > 0.001 && p < 1;
            if (rt.dust && (moving || rt.dust === 'stay')) {
              const ds = [];
              for (let j = 0; j < 5; j++) { const b = pos(Math.max(0, Lc - 26 - j * 20)).q, r = 16 + j * 5 + Math.sin(t * 4 + j) * 4; ds.push({ p: inkEllipsePts(b[0] + Math.sin(j * 2.1) * 10, b[1] - 8 - j * 3, r, r * 0.8, 40 + j, 9), c: 1, f: INK.paperLight, w: 3, col: INK.inkSoft }); }
              ro.paintDust(ds, t, seed * 31 + i * 10);
            } else ro.paintDust([], t, 0);
            ro.glyphs.forEach((gl, j) => {
              const L = Math.max(0, Lc - j * 58), q = pos(L), fc = Math.cos(q.ang) >= 0 ? 1 : -1;
              gl.g.style.display = Lc > 6 ? '' : 'none';
              gl.g.setAttribute('transform', `translate(${f1(q.q[0])} ${f1(q.q[1] + 14)}) scale(${f1(fc * 0.2 * (rt.glyph || 1) * 1000) / 1000} ${f1(0.2 * (rt.glyph || 1) * 1000) / 1000})`);
              const hs = horseStrokes(t, t * 2.4 + j * 0.3, moving || rt.loop ? 2 : 0, { wk: 2.6, cloth: rt.color === 'blue' ? 'blue' : 'red' });
              gl.paint([...hs.back, ...stickRider(t, hs, { wk: 2.4, color: rt.color === 'blue' ? 'blue' : 'red', spear: true }), ...hs.front], t, seed * 37 + i * 10 + j);
            });
            if (ro.lab) {
              const Lb = rt.label, la = tc(Lb.at, cues, at + dd * (Lb.u ?? 0.6)), q = pos(Ltot * (Lb.u ?? 0.6)).q, s2 = spring(lt, la, 0.6);
              ro.lab.style.display = lt >= la ? '' : 'none';
              ro.lab.setAttribute('transform', `translate(${f1(q[0] + (Lb.dx || 0))} ${f1(q[1] + (Lb.dy ?? -30))}) rotate(-3) scale(${f1(lerp(0.6, 1, s2) * 1000) / 1000})`);
            }
          });
          // gauge
          if (gaugeE) {
            const G = P.gauge, at = tc(G.at, cues, 1), p = progIO(lt, at, G.dur || 1.2);
            if (lt >= at) {
              const a = PX(G.from), b0 = PX(G.to), b = [lerp(a[0], b0[0], p), lerp(a[1], b0[1], p)], an = Math.atan2(b0[1] - a[1], b0[0] - a[0]), n = [-Math.sin(an) * 22, Math.cos(an) * 22];
              let d = inkPath([a, b], { seed: seed * 41, t, w: 7 }) + ' ' + inkPath([[a[0] + n[0], a[1] + n[1]], [a[0] - n[0], a[1] - n[1]]], { seed: seed * 41 + 1, t, w: 7 });
              if (p > 0.97) d += ' ' + inkPath([[b[0] + n[0], b[1] + n[1]], [b[0] - n[0], b[1] - n[1]]], { seed: seed * 41 + 2, t, w: 7 });
              gaugeE.setAttribute('d', d);
            } else gaugeE.setAttribute('d', '');
          }
          // icons
          icons.forEach(o => {
            const ic = o.ic, at = tc(ic.at, cues, 0.3), s2 = spring(lt, at, 0.6), q = PX([ic.lon, ic.lat]);
            if (lt < at) { o.g.style.display = 'none'; return; }
            o.g.style.display = '';
            const s = (ic.size || 1) * lerp(0.3, 1, s2) * (1 + 0.1 * punch(lt, at, 0.5));
            o.g.setAttribute('transform', `translate(${f1(q[0] + (ic.dx || 0))} ${f1(q[1] + (ic.dy ?? -18))}) scale(${f1(s * 1000) / 1000})`);
            const fa = ic.flag ? tc(ic.flag.at, cues, null) : null;
            o.paint(iconStrokes(ic.type, t, { flagUp: fa == null ? 0 : progIO(lt, fa, 0.8), flagColor: ic.flag && ic.flag.color }), t, seed * 43 + o.i * 20);
          });
          // cities
          cities.forEach(o => {
            const c = o.c, at = tc(c.at, cues, 0.3 + o.i * 0.25), s2 = spring(lt, at, 0.6), pk = punch(lt, at, 0.5), q = PX([c.lon, c.lat]);
            if (lt < at) { o.g.style.display = 'none'; return; }
            o.g.style.display = '';
            o.g.setAttribute('transform', `translate(${f1(q[0])} ${f1(q[1])}) scale(${f1(lerp(0.3, 1, s2) * (1 + 0.14 * pk) * 1000) / 1000})`);
            const R = c.dot || 15;
            o.dotE.setAttribute('d', inkLoop(inkEllipsePts(0, 0, R, R, seed + o.i, 10), { seed: seed + o.i, t, amp: 0.8 }));
            o.dotR.setAttribute('d', inkPath(inkEllipsePts(0, 0, R, R, seed + o.i, 10), { seed: seed + o.i, t, w: 5, closed: true, amp: 0.8 }));
            o.dotC.setAttribute('d', inkDot(0, 0, R * 0.42, R * 0.42, seed + o.i + 50, t));
            o.t.setAttribute('x', c.dx ?? 0); o.t.setAttribute('y', (c.dy ?? -34));
            if (c.ring) {
              const ra = c.ring === true ? at + 0.3 : tc(c.ring, cues, at + 0.3), rp = prog(lt, ra, 0.5);
              const pts = inkEllipsePts(0, 0, 46, 40, seed + o.i + 70, 14, -0.2, 0.06);
              o.ringE.setAttribute('d', rp > 0.01 ? inkPath(sub(pts.concat([pts[0], pts[1]]), rp), { seed: seed + o.i + 70, t, w: 7 }) : '');
            }
          });
          texts.forEach(({ T, t: te }, i) => {
            const at = tc(T.at, cues, 0.2), q = PX([T.lon, T.lat]), s2 = spring(lt, at, 0.6);
            te.style.display = lt >= at ? '' : 'none';
            te.setAttribute('transform', `translate(${f1(q[0])} ${f1(q[1])}) rotate(${T.rot ?? -3}) scale(${f1(lerp(0.6, 1, s2) * 1000) / 1000})`);
          });
          // compass
          const cs = [];
          const RR = 56, ca = Math.sin(t * 0.6) * 5;
          cs.push({ p: inkEllipsePts(ccx, ccy, RR * 0.72, RR * 0.72, 5, 16), c: 1, f: INK.paperLight, w: 3, col: INK.inkSoft });
          for (let q = 0; q < 4; q++) { const a = (q * 90 + ca - 90) * Math.PI / 180, tip = [ccx + Math.cos(a) * RR, ccy + Math.sin(a) * RR], l = [ccx + Math.cos(a - 1.57) * 10, ccy + Math.sin(a - 1.57) * 10], r = [ccx + Math.cos(a + 1.57) * 10, ccy + Math.sin(a + 1.57) * 10]; cs.push({ p: [l, tip, r, [ccx, ccy]], c: 1, f: q === 0 ? INK.red : INK.paperDark, w: 3, sm: 0 }); }
          paintComp(cs, t, seed * 47);
          // note
          if (note) {
            const N = note.N, at = tc(N.at, cues, Math.max(0.8, dur * 0.5)), s2 = spring(lt, at, 0.6);
            if (note.tw == null) { try { note.tw = note.t.getComputedTextLength(); } catch (e) { note.tw = 0; } if (!note.tw) note.tw = (N.size || 58) * N.text.length * 0.42; }
            note.g.style.display = lt >= at ? '' : 'none';
            const nx = S.x + (N.x ?? 0.06) * S.w, ny = S.y + (N.y ?? 0.13) * S.h, fs = N.size || 58;
            note.t.setAttribute('x', nx + 24); note.t.setAttribute('y', ny);
            const bp = [[nx, ny - fs * 0.95], [nx + note.tw + 48, ny - fs * 0.95 - 2], [nx + note.tw + 50, ny + fs * 0.4], [nx + 1, ny + fs * 0.42]];
            note.box.setAttribute('d', inkLoop(bp, { seed: seed + 61, t, smooth: false }));
            note.boxR.setAttribute('d', inkPath(bp, { seed: seed + 61, t, w: 3.5, closed: true, smooth: false }));
            note.g.setAttribute('transform', `rotate(${f1(-2 + (1 - s2) * -6)} ${f1(nx)} ${f1(ny)}) translate(${f1(nx * (1 - lerp(0.7, 1, s2)))} ${f1(ny * (1 - lerp(0.7, 1, s2)))}) scale(${f1(lerp(0.7, 1, s2) * 1000) / 1000})`);
          }
          // narrator
          const st = planner.state(km, lt, cues, K0.scale);
          st.opts.y = KY;
          groundE.setAttribute('d', inkPath([[KX0 - 150, KY + 4], [KX0, KY + 7], [KX0 + 150, KY + 3]], { seed: seed + 71, t, w: 5 }));
          rig.update(t, st.pose, st.opts);
        },
      };
    },
  };
})();
