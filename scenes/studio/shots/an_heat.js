// an_heat: a summer march under a blazing sun, in the parchment ink style (brand/kit/BRAND.md §3, §5): a huge gold
// sun with turning ink rays, shimmering heat-wave lines, cracked dry earth that scrolls past (slow side pan), far
// hills, a long column of small ink soldiers (team-coloured cap, spear or banner, heads bobbing, dust at the feet),
// one soldier shaking an empty water skin (a single blue drop falls on the `empty` cue) and the narrator (sweats).
// mode "split": the screen is cut in two by a dashed ink line: LEFT = tired column under the sun (bent, slow, empty
// skin, cracked ground, heat waves); RIGHT = shaded camp (big tents with pennants and hatched shade, a water barrel
// with a rippling surface, upright rested soldiers who lift their spears on `rest`, green grass tufts).
//
// P: {mode: "march"|"split",
//   ground: 0.66 (horizon / ground line, 0..1 H), feet: 0.8 (y of the soldiers' feet, 0..1 H),
//   sun: {x: 0.82, y: 0.2, r: 95} | false   (split default: {x: 0.3, y: 0.24, r: 80}),
//   column: {n: 12 (split: 4), color: "blue"|"red", x0: 0.06, x1: 0.74 (split: 0.07..0.4), scale: 0.5 (split 0.62), dir: -1|1
//            (walking direction, -1 = to the left), speed: 70 (px/s of the ground scroll), cadence: 0.9 (steps/s),
//            lean: 12 (deg, tired forward bend; split: 20), banner: 4 (every Nth soldier carries a banner, 0 = none),
//            skin: 3 (index of the soldier with the water skin, -1 = none), turn: cue (column stands facing -dir,
//            turns round on the cue and starts to march; omit = marching from the start)},
//   empty: cue (the water skin is shaken upside down, one drop falls),
//   dust: true, cracks: true, hills: true, waves: {n: 7, at: cue (waves get stronger)},
//   rest: {color: "red", tents: 2, barrel: true, n: 3 (rested soldiers), banner: true, at: cue (spears go up + punch),
//          grass: true}                                    (split only; RIGHT half)
//   divide: {at: 0.15, dur: 0.7} (split only: when the dashed line draws itself),
//   tired: cue (split: left column bends further, sweat drops appear),
//   labels: [{text, x, y, at, size: 60, color: "ink"|"red"|"blue"|"soft", rot: -3}],
//   kasif: {x: 0.88 (split 0.5), y: ground y (0..1 H), scale: 0.6, face: -1|1, pose: "idle", dir, emotion,
//           seq: [{at, pose, dir, face, emotion}], walk: true (walks in place while the column marches),
//           sweat: cue} | false,
//   cam: {zoom: 1.05, focus: [0.5, 0.6]}}
// cues: hit (camera punch), plus whatever names the params reference (turn, hot, empty, tired, rest ...).
// For the split mode (scene 33) a typical call:
//   {"mode": "split", "column": {"n": 4}, "rest": {"at": "rest"}, "tired": "tired", "empty": "tired",
//    "kasif": {"x": 0.5, "pose": "idle", "seq": [{"at": 0.4, "pose": "look", "face": -1}, {"at": "tired", "pose": "idle",
//    "face": -1, "emotion": "worried"}, {"at": "rest", "pose": "point", "face": 1, "dir": 10}]}}
// Also exposes SHOTS.an_heat.soldier(...) (the ink soldier pictogram) for an_water.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2, rad = d => d * Math.PI / 180;
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, soft: INK.inkSoft, gold: INK.gold, green: INK.green, light: INK.paperLight, dark: INK.paperDark };
  const colOf = (c, fb) => COL[c] || fb || INK.ink;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : 1);
  const rot = (v, deg) => { const a = rad(deg), c = Math.cos(a), s = Math.sin(a); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mod = (a, n) => ((a % n) + n) % n;

  // ---------------------------------------------------------------- ink soldier pictogram
  // local units: ground y = 0, about 400 tall, facing +x. o: {ph (step phase, cycles), walk (0..1), lean (deg),
  // team: colour, carry: "spear"|"banner"|"skin"|"bucket"|"none", lift (0..1 spear raised), shake (deg), droop (0..1 head
  // down), worried (0..1 brow), t}. Returns shapes [{p, c (closed), f (fill), w}] in local units.
  function soldier(o) {
    const walk = o.walk ?? 0, ph = o.ph ?? 0, t = o.t ?? 0;
    const sw = Math.sin(ph * TAU) * 24 * walk, bob = -8 * walk * Math.abs(Math.sin(ph * TAU)) + Math.sin(t * 2 + (o.k || 0)) * 2;
    const lean = (o.lean || 0) + walk * 2 * Math.sin(ph * TAU * 2);
    const hip = [0, -150 + bob];
    const neck = add(hip, rot([0, -118], lean));
    const hc = add(neck, rot([4, -40], lean + (o.droop || 0) * 22));
    const team = o.team || INK.blue, st = [];
    // legs (two segments, knee forward)
    [1, -1].forEach(sg => {
      const a = rad(sw * sg), foot = [hip[0] + Math.sin(a) * 148, 0];
      const lift = walk * Math.max(0, Math.sin((ph + (sg > 0 ? 0 : 0.5)) * TAU)) * 22;
      foot[1] -= lift;
      const knee = [(hip[0] + foot[0]) / 2 + 14, (hip[1] + foot[1]) / 2];
      st.push({ p: [hip, knee, foot], w: 7 });
      st.push({ p: inkEllipsePts(foot[0] + 8, foot[1] - 4, 15, 8, 11 + sg, 8), c: 1, f: INK.ink, w: 2 });
    });
    // tunic
    const tn = [add(neck, rot([-24, 14], lean)), add(neck, rot([26, 14], lean)), add(hip, rot([40, 26], lean)), add(hip, rot([-38, 26], lean))];
    st.push({ p: tn, c: 1, f: INK.paperLight, w: 5, sm: 0 });
    st.push({ p: [add(hip, rot([-34, -4], lean)), add(hip, rot([36, -4], lean))], w: 9, col: team });
    // arms
    const sho = add(neck, rot([0, 20], lean));
    const swing = Math.sin(ph * TAU) * 26 * walk;
    let hF = add(sho, rot([18, 104], lean - swing)), hB = add(sho, rot([-16, 100], lean + swing));
    const carry = o.carry || 'spear';
    if (carry === 'spear') {
      const lift = o.lift || 0;
      hB = add(sho, rot([30, 70 - 80 * lift], lean));
      const top = add(hB, rot([22 + 10 * lift, -300 - 40 * lift], lean * 0.4 - 10 * (1 - lift)));
      const bot = add(hB, rot([-14, 110], lean * 0.4 - 10 * (1 - lift)));
      st.push({ p: [bot, top], w: 5 });
      const ax = rot([0, -1], lean * 0.4 - 10 * (1 - lift)), px = [-ax[1], ax[0]];
      st.push({ p: [add(top, [px[0] * -12, px[1] * -12]), add(top, [ax[0] * 40, ax[1] * 40]), add(top, [px[0] * 12, px[1] * 12])], c: 1, f: INK.inkSoft, w: 3, sm: 0 });
    } else if (carry === 'banner') {
      hB = add(sho, rot([34, 60], lean));
      const top = [hB[0] + 10, -560], bot = [hB[0] - 4, hB[1] + 90], wv = Math.sin(t * 5 + (o.k || 0)) * 12, wv2 = Math.sin(t * 5 + 1.3 + (o.k || 0)) * 14;
      st.push({ p: [bot, top], w: 5 });
      st.push({ p: [top, [top[0] - 80, top[1] + 10 + wv], [top[0] - 160, top[1] + 24 + wv2], [top[0] - 130, top[1] + 52 + wv], [top[0] - 160, top[1] + 84 + wv2], [top[0] - 70, top[1] + 80 + wv], [top[0], top[1] + 84]], c: 1, f: team, w: 4 });
    } else if (carry === 'skin' || carry === 'bucket') {
      const sk = o.shake || 0;
      hF = add(sho, rot([50, -96], lean * 0.3));
      hB = add(sho, rot([36, -88], lean * 0.3 - 6));
      const C = add(hF, rot([0, -34], sk)), R = (x, y) => add(C, rot([x, y], 180 + sk));
      if (carry === 'skin') {
        st.push({ p: [R(-40, -10), R(-30, -34), R(0, -42), R(32, -32), R(42, -6), R(26, 20), R(10, 26), R(6, 50), R(-8, 50), R(-12, 26), R(-30, 18)], c: 1, f: INK.paperDark, w: 5 });
        st.push({ p: [R(-4, 48), R(4, 56)], w: 4 });
      } else {
        st.push({ p: [R(-34, -30), R(34, -30), R(26, 34), R(-26, 34)], c: 1, f: INK.paperDark, w: 5, sm: 0 });
        st.push({ p: [R(-30, -8), R(30, -8)], w: 3 });
        st.push({ p: [R(-30, -30), R(-20, -62), R(0, -70), R(20, -62), R(30, -30)], w: 3 });
      }
      o._spout = carry === 'skin' ? R(0, 56) : R(0, -30);
    }
    st.push({ p: [sho, add(sho, rot([10, 52], lean)), hF], w: 6 });
    st.push({ p: [sho, add(sho, rot([-6, 52], lean)), hB], w: 6 });
    st.push({ p: inkEllipsePts(hF[0], hF[1], 9, 9, 21, 7), c: 1, f: INK.ink, w: 2 });
    st.push({ p: inkEllipsePts(hB[0], hB[1], 9, 9, 22, 7), c: 1, f: INK.ink, w: 2 });
    // head + cap (börk) + face
    st.push({ p: inkEllipsePts(hc[0], hc[1], 34, 34, 31, 10), c: 1, f: INK.paperLight, w: 5 });
    const hr = lean + (o.droop || 0) * 22, H = (x, y) => add(hc, rot([x, y], hr));
    st.push({ p: [H(-36, -10), H(-34, -40), H(-18, -74), H(8, -80), H(22, -66), H(30, -40), H(36, -10)], c: 1, f: team, w: 4 });
    st.push({ p: inkEllipsePts(H(16, 4)[0], H(16, 4)[1], 4.5, 5, 33, 6), c: 1, f: INK.ink, w: 1 });
    const wr = o.worried || 0;
    st.push({ p: [H(4, -10 + wr * 2), H(26, -14 - wr * 8)], w: 3.5 });
    return st;
  }

  // shapes -> one group's paths: fills (by colour) under one ink outline path
  function painter(g) {
    const ring = inkEl(g), fills = {}, cols = {};
    return (shapes, t, sd, X, Y, s, face) => {
      const fs = {}, cs = {};
      let rd = '';
      shapes.forEach((sp, i) => {
        const pts = sp.p.map(q => [X + q[0] * s * face, Y + q[1] * s]);
        const o = { seed: sd + i, t, amp: 1.2, w: Math.max(1.5, (sp.w || 5) * Math.max(0.55, s)), closed: !!sp.c, smooth: sp.sm !== 0 };
        if (sp.f) fs[sp.f] = (fs[sp.f] || '') + inkLoop(pts, o) + ' ';
        if (sp.col) cs[sp.col] = (cs[sp.col] || '') + inkPath(pts, o) + ' ';
        else rd += inkPath(pts, o) + ' ';
      });
      Object.keys(fills).forEach(k => { if (!fs[k]) fills[k].setAttribute('d', ''); });
      Object.keys(fs).forEach(k => { if (!fills[k]) { fills[k] = inkEl(g, k); g.insertBefore(fills[k], ring); } fills[k].setAttribute('d', fs[k]); });
      ring.setAttribute('d', rd);
      Object.keys(cols).forEach(k => { if (!cs[k]) cols[k].setAttribute('d', ''); });
      Object.keys(cs).forEach(k => { if (!cols[k]) cols[k] = inkEl(g, k); cols[k].setAttribute('d', cs[k]); });
    };
  }

  // pose segments for a rig: base pose then seq entries at their cues
  function segs(K, cues, lt) {
    const L = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
    (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) L.push(Object.assign({}, s, { at: a })); });
    L.sort((a, b) => a.at - b.at);
    let i = 0; for (let j = 0; j < L.length; j++) if (lt >= L[j].at) i = j;
    const s = L[i], pv = i > 0 ? L[i - 1] : null, since = lt - Math.max(0, s.at);
    const o = { since, dir: dirOf(s.dir ?? K.dir), emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : (K.emotion || null)), mouth: 0, seg: s };
    if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
    // face turns smoothly between segments
    const f1v = faceOf(s.face ?? K.face ?? 1), f0v = pv ? faceOf(pv.face ?? K.face ?? 1) : f1v;
    o.face = lerp(f0v, f1v, progIO(since, 0, 0.35));
    return { pose: s.pose || 'idle', o };
  }

  function makeLabel(parent, L) {
    const t = el(parent, 'text', { 'font-family': INK_FONT, 'font-size': L.size || 60, 'text-anchor': 'middle', fill: colOf(L.color, INK.ink),
      style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
    t.textContent = L.text;
    return t;
  }

  SH.an_heat = {
    kind: '2d',
    soldier, painter,
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const split = P.mode === 'split', portrait = H > W;
      const sd = seed * 1000 + 431, r = rng(seed * 23 + 5);
      const U = Math.min(W, H) / 1080;                       // size unit
      const root = el(svg, 'g'), cam = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const gy = H * (P.ground ?? (split ? 0.68 : 0.64)), fy = H * (P.feet ?? (portrait ? 0.74 : 0.8));
      const LX0 = 0, LX1 = split ? W / 2 - 14 : W;          // hot zone
      const RX0 = W / 2 + 14, RX1 = W;                       // shaded zone (split)

      // ---------------------------------------------------------------- layers
      const sunF = mk(cam, INK.gold), sunR = mk(cam);
      const hillF = mk(cam, INK.paperDark, { 'fill-opacity': 0.7 }), hillR = mk(cam, INK.inkSoft);
      const groundF = mk(cam, INK.paperDark, { 'fill-opacity': 0.42 }), groundR = mk(cam);
      const crackR = mk(cam, INK.inkSoft);
      const waveR = mk(cam, INK.inkSoft);
      const shadeR = mk(cam, INK.inkSoft);
      const restG = el(cam, 'g');
      const tentF = mk(restG, INK.paperLight), tentR = mk(restG), penF = mk(restG, colOf((P.rest || {}).color, INK.red));
      const grassR = mk(restG, INK.green);
      const barrelF = mk(restG, INK.paperDark), barrelW = mk(restG, INK.blue, { 'fill-opacity': 0.75 }), barrelR = mk(restG);
      const dustF = mk(cam, INK.paperDark, { 'fill-opacity': 0.8 }), dustR = mk(cam, INK.inkSoft);
      const colG = el(cam, 'g'), restSolG = el(cam, 'g');
      const dropF = mk(cam, INK.blue), sweatF = mk(cam, INK.blue);
      const divR = mk(root);
      const front = el(root, 'g');

      // column
      const C = Object.assign({ n: split ? 4 : 12, color: 'blue', x0: split ? 0.07 : 0.06, x1: split ? 0.4 : 0.74, scale: split ? 0.62 : 0.5,
        dir: split ? 1 : -1, speed: split ? 40 : 70, cadence: split ? 0.65 : 0.9, lean: split ? 20 : 12, banner: split ? 3 : 4, skin: split ? 1 : 3 }, P.column || {});
      C.scale *= U;
      const sols = [];
      for (let i = 0; i < C.n; i++) {
        const g = el(colG, 'g');
        const u = C.n > 1 ? i / (C.n - 1) : 0.5;
        sols.push({ g, paint: painter(g), x: W * lerp(C.x0, C.x1, u) + (r() - 0.5) * 20 * U, y: fy + (i % 2 ? -16 : 10) * U, k: i,
          carry: i === C.skin ? 'skin' : (C.banner && i % C.banner === 1 ? 'banner' : 'spear'), ph0: r() });
      }
      // shaded camp (split)
      const RS = split ? Object.assign({ color: 'red', tents: 2, barrel: true, n: 3, banner: true, grass: true }, P.rest || {}) : null;
      const rested = [];
      if (RS) {
        const xs = RS.n === 3 ? [0.6, 0.71, 0.9] : Array.from({ length: RS.n }, (_, i) => lerp(0.58, 0.92, RS.n > 1 ? i / (RS.n - 1) : 0.5));
        xs.forEach((x, i) => { const g = el(restSolG, 'g'); rested.push({ g, paint: painter(g), x: W * x, y: fy + (i % 2 ? -10 : 8) * U, k: 50 + i, carry: RS.banner && i === 1 ? 'banner' : 'spear' }); });
      }
      // precomputed cracks over the hot zone (scroll + wrap)
      const span = LX1 - LX0;
      const cracks = [];
      if (P.cracks !== false) {
        const n = split ? 14 : 30;
        for (let i = 0; i < n; i++) {
          const x = r() * span, y = gy + 24 * U + r() * (H * 0.97 - gy - 24 * U), pts = [[x, y]];
          let a = r() * TAU, L = (40 + r() * 70) * U;
          for (let q = 0; q < 3; q++) { a += (r() - 0.5) * 1.6; const p = pts[pts.length - 1]; pts.push([p[0] + Math.cos(a) * L / 3, p[1] + Math.sin(a) * L / 3 * 0.5]); }
          const br = [pts[1], [pts[1][0] + Math.cos(a + 1.4) * L / 3, pts[1][1] + Math.sin(a + 1.4) * L / 6]];
          cracks.push({ pts, br });
        }
      }
      const ridge = []; for (let i = 0; i <= 24; i++) ridge.push([i / 24 * span * 2, -30 * U - Math.sin(i * 1.1 + seed) * 22 * U - Math.sin(i * 0.43) * 26 * U - r() * 14 * U]);
      const tufts = []; if (RS && RS.grass) for (let i = 0; i < 16; i++) tufts.push([RX0 + 30 * U + r() * (RX1 - RX0 - 60 * U), gy + 30 * U + r() * (H * 0.93 - gy - 30 * U)]);

      const labels = (P.labels || []).map(L => ({ L, t: makeLabel(front, L) }));
      const K = P.kasif === false ? null : Object.assign({ x: split ? 0.5 : 0.88, scale: split ? 0.58 : 0.6, face: split ? 1 : -1, pose: 'idle', walk: !split }, P.kasif || {});
      const kasR = K ? KASIF.create(el(front, 'g'), { scale: 1, hat: true, seed: sd + 9 }) : null;
      const kSweat = K && K.sweat != null ? mk(front, INK.blue) : null;

      let lastStep = -1;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          const fc = Cm.focus || [0.5, 0.6], fx = fc[0] * W, fyc = fc[1] * H;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.35) * 4)} ${f1(fyc + Math.cos(lt * 0.27) * 3)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fyc)})`);

          // march state: before `turn` the column stands facing -dir, then turns and walks
          const turnAt = C.turn != null ? atOr(cues, C.turn, null) : null;
          const marchFrom = turnAt != null ? turnAt + 0.35 : 0;
          const marching = lt >= marchFrom;
          const mT = Math.max(0, lt - marchFrom);
          const dir = C.dir >= 0 ? 1 : -1;
          const colFace = turnAt != null ? lerp(-dir, dir, progIO(lt, turnAt, 0.35)) : dir;
          const scroll = mT * C.speed * U * (split ? 1 : 1);       // ground moves opposite to dir
          const tiredAt = P.tired != null ? atOr(cues, P.tired, null) : null, tiredP = tiredAt != null ? progIO(lt, tiredAt, 0.8) : 0;
          const hotAt = P.waves && P.waves.at != null ? atOr(cues, P.waves.at, null) : (P.hot != null ? atOr(cues, P.hot, null) : atOr(cues, 'hot', null));
          const hotP = hotAt != null ? progIO(lt, hotAt, 0.8) : 0;

          // ---- sun
          const S = P.sun === false ? null : Object.assign(split ? { x: 0.3, y: 0.24, r: 80 } : { x: 0.82, y: 0.2, r: 95 }, P.sun || {});
          if (S) {
            const ph = punch(lt, hotAt, 0.8), x = S.x * W, y = S.y * H, R = S.r * U * (1 + 0.12 * ph + 0.03 * Math.sin(lt * 2.4));
            const pts = inkEllipsePts(x, y, R, R, sd + 1, 16);
            sunF.setAttribute('d', inkLoop(pts, O(1)));
            let rr = inkPath(pts, O(2, { closed: true, w: 5 }));
            for (let q = 0; q < 14; q++) {
              const a = q / 14 * TAU + lt * 0.35, l = (q % 2 ? 46 : 74) * U * (1 + 0.25 * hotP + 0.12 * Math.sin(lt * 4 + q));
              rr += ' ' + inkPath([[x + Math.cos(a) * (R + 18 * U), y + Math.sin(a) * (R + 18 * U)], [x + Math.cos(a) * (R + 18 * U + l), y + Math.sin(a) * (R + 18 * U + l)]], O(10 + q, { w: 5 }));
            }
            // squinting face on the sun? no: plain disc with two hatch arcs for heat
            sunR.setAttribute('d', rr);
          }

          // ---- far hills (parallax) + ground
          if (P.hills !== false) {
            const off = mod(scroll * 0.25 * dir, span);
            const pts = ridge.map(p => [LX0 + p[0] + off - span, gy + p[1]]).filter(p => p[0] > LX0 - 200 && p[0] < LX1 + 200);
            if (pts.length > 2) {
              const cl = pts.map(p => [Math.max(LX0, Math.min(LX1, p[0])), p[1]]);
              hillF.setAttribute('d', inkLoop(cl.concat([[LX1, gy + 4], [LX0, gy + 4]]), O(30, { smooth: false, amp: 1 })));
              hillR.setAttribute('d', inkPath(cl, O(31, { w: 4 })));
            }
          }
          if (redraw || lt < 0.05) {
            groundF.setAttribute('d', inkLoop([[LX0 - 40, gy], [LX1, gy - 4], [LX1, H + 40], [LX0 - 40, H + 40]], O(40, { smooth: false })) +
              (split ? ' ' + inkLoop([[RX0, gy], [RX1 + 40, gy - 4], [RX1 + 40, H + 40], [RX0, H + 40]], O(41, { smooth: false })) : ''));
            groundR.setAttribute('d', inkPath([[LX0 - 30, gy + 2], [lerp(LX0, LX1, 0.4), gy - 4], [lerp(LX0, LX1, 0.7), gy + 3], [LX1 + (split ? 0 : 30), gy - 3]], O(42, { w: 5 })) +
              (split ? ' ' + inkPath([[RX0, gy + 2], [lerp(RX0, RX1, 0.5), gy - 3], [RX1 + 30, gy + 2]], O(43, { w: 5 })) : ''));
          }
          // cracks scroll with the ground
          if (cracks.length) {
            let cd = '';
            const off = scroll * dir;
            cracks.forEach((c, i) => {
              const dx = mod(c.pts[0][0] - off, span) - c.pts[0][0];
              const mv = p => [LX0 + p[0] + dx, p[1]];
              const p0 = mv(c.pts[0]);
              if (p0[0] < LX0 + 20 || p0[0] > LX1 - 90 * U) return;
              cd += inkPath(c.pts.map(mv), O(100 + i, { w: 3.5 * U + 0.5, amp: 0.8, smooth: false })) + ' ' + inkPath(c.br.map(mv), O(160 + i, { w: 2.5 * U + 0.5, amp: 0.8 })) + ' ';
            });
            crackR.setAttribute('d', cd);
          }
          // heat waves (shimmer + rise)
          {
            const Wv = P.waves || {}, n = Wv.n ?? (split ? 5 : 7);
            let wd = '';
            for (let q = 0; q < n; q++) {
              const rise = mod(lt * 22 * U + q * 37 * U, 150 * U);
              const y0 = gy - 40 * U - rise - (q % 3) * 50 * U;
              const xa = lerp(LX0 + 40 * U, LX1 - 260 * U, ((q * 0.37) % 1)), len = (split ? 220 : 340) * U;
              const amp = (7 + 6 * hotP + 4 * tiredP) * U, pts = [];
              for (let j = 0; j <= 10; j++) { const x = xa + j / 10 * len; pts.push([x, y0 + Math.sin(x * 0.03 / U + lt * 4 + q) * amp]); }
              wd += inkPath(pts, O(200 + q, { w: 3.5 * U + 0.5, amp: 0.6, taper: 0.8 })) + ' ';
            }
            waveR.setAttribute('d', wd);
          }

          // ---- shaded camp (split, right half)
          if (RS) {
            const ra = RS.at != null ? atOr(cues, RS.at, null) : atOr(cues, 'rest', null);
            const rp = punch(lt, ra, 0.7);
            let tf = '', tr = '', pf = '', sh = '', gr = '', bf = '', bw = '', br = '';
            const tents = RS.tents ?? 2, txs = tents === 1 ? [0.76] : Array.from({ length: tents }, (_, i) => lerp(0.64, 0.9, i / (tents - 1)));
            txs.forEach((tx, i) => {
              const s = 1.0 * U, x = tx * W, y = gy + 16 * U, wv = Math.sin(t * 4 + i) * 10 * s;
              const body = [[x - 130 * s, y], [x - 120 * s, y - 130 * s], [x + 120 * s, y - 130 * s], [x + 130 * s, y]];
              const roof = [[x - 150 * s, y - 120 * s], [x, y - 270 * s], [x + 150 * s, y - 120 * s]];
              tf += inkLoop(body, O(300 + i, { smooth: false })) + ' ' + inkLoop(roof, O(310 + i, { smooth: false })) + ' ';
              tr += inkPath(body, O(320 + i, { w: 6, smooth: false })) + ' ' + inkPath(roof.concat([roof[0]]), O(330 + i, { w: 6, smooth: false })) + ' ' +
                inkPath([[x - 30 * s, y], [x, y - 100 * s], [x + 30 * s, y]], O(340 + i, { w: 5 })) + ' ' + inkPath([[x, y - 270 * s], [x, y - 350 * s]], O(350 + i, { w: 5 })) + ' ';
              pf += inkLoop([[x, y - 350 * s], [x + 80 * s, y - 336 * s + wv], [x + 62 * s, y - 320 * s], [x + 84 * s, y - 304 * s + wv * 0.6], [x, y - 296 * s]], O(360 + i)) + ' ';
            });
            // hatched shade on the ground of the right half
            for (let q = 0; q < 22; q++) {
              const x = RX0 + 30 * U + q * (RX1 - RX0) / 22, y = gy + 40 * U + (q % 3) * 26 * U;
              sh += inkPath([[x, y + 60 * U], [x + 50 * U, y]], O(400 + q, { w: 3 * U + 0.5, amp: 0.7 })) + ' ';
            }
            tufts.forEach((p, i) => {
              const s2 = Math.sin(t * 1.6 + i) * 3 * U;
              gr += inkPath([[p[0], p[1]], [p[0] - 8 * U + s2, p[1] - 26 * U]], O(450 + i, { w: 3.5 * U + 0.5, amp: 0.7 })) + ' ' +
                inkPath([[p[0] + 6 * U, p[1]], [p[0] + 10 * U + s2, p[1] - 32 * U]], O(480 + i, { w: 3.5 * U + 0.5, amp: 0.7 })) + ' ' +
                inkPath([[p[0] + 12 * U, p[1]], [p[0] + 26 * U + s2, p[1] - 22 * U]], O(510 + i, { w: 3.5 * U + 0.5, amp: 0.7 })) + ' ';
            });
            if (RS.barrel) {
              const s = 1.05 * U, x = W * (RS.barrel_x ?? 0.805), y = fy - 4 * U;
              const body = [[x - 62 * s, y], [x - 72 * s, y - 70 * s], [x - 62 * s, y - 150 * s], [x + 62 * s, y - 150 * s], [x + 72 * s, y - 70 * s], [x + 62 * s, y]];
              bf = inkLoop(body, O(600));
              br = inkPath(body, O(601, { closed: true, w: 6 })) + ' ' + inkPath([[x - 70 * s, y - 40 * s], [x + 70 * s, y - 40 * s]], O(602, { w: 4 })) + ' ' + inkPath([[x - 70 * s, y - 110 * s], [x + 70 * s, y - 110 * s]], O(603, { w: 4 })) + ' ' +
                inkPath([[x - 20 * s, y - 4 * s], [x - 22 * s, y - 146 * s]], O(604, { w: 2.5 })) + ' ' + inkPath([[x + 24 * s, y - 4 * s], [x + 26 * s, y - 146 * s]], O(605, { w: 2.5 }));
              const wpts = inkEllipsePts(x, y - 150 * s, 58 * s, 15 * s, sd + 606, 12);
              bw = inkLoop(wpts, O(606));
              br += ' ' + inkPath(wpts, O(607, { closed: true, w: 4 }));
              for (let q = 0; q < 2; q++) { const u = mod(lt * 0.7 + q * 0.5, 1); br += ' ' + inkPath(inkEllipsePts(x, y - 150 * s, 50 * s * u + 6, 12 * s * u + 2, sd + 610 + q, 10), O(610 + q, { closed: true, w: 2.5, amp: 0.5 })); }
              // ladle
              br += ' ' + inkPath([[x + 30 * s, y - 154 * s], [x + 110 * s, y - 230 * s + Math.sin(t * 1.5) * 4]], O(620, { w: 5 }));
            }
            tentF.setAttribute('d', tf); tentR.setAttribute('d', tr); penF.setAttribute('d', pf); shadeR.setAttribute('d', sh); grassR.setAttribute('d', gr);
            barrelF.setAttribute('d', bf); barrelW.setAttribute('d', bw); barrelR.setAttribute('d', br);
            // rested soldiers: upright, breathing, spears go up on `rest`
            const lift = ra != null ? spring(lt, ra, 0.6) : 0;
            rested.forEach((sl, i) => {
              const s = C.scale * (1 + 0.06 * rp);
              const st = soldier({ t, k: sl.k, walk: 0, lean: -2, team: colOf(RS.color, INK.red), carry: sl.carry, lift: clamp01(lift) });
              sl.paint(st, t, sd + 700 + i * 60, sl.x, sl.y, s, -1);
            });
            // the dividing dashed line
            const D = P.divide || {}, da = atOr(cues, D.at, 0.15), dp = prog(lt, da, D.dur ?? 0.7);
            let dd = '';
            const y0 = 40 * U, y1 = H - 40 * U, seg = 34 * U, gap = 24 * U, yEnd = lerp(y0, y1, dp);
            for (let y = y0, q = 0; y < yEnd; y += seg + gap, q++) dd += inkPath([[W / 2, y], [W / 2, Math.min(yEnd, y + seg)]], O(800 + q, { w: 6, amp: 1 })) + ' ';
            divR.setAttribute('d', dd);
          }

          // ---- the column
          const emptyAt = P.empty != null ? atOr(cues, P.empty, null) : null;
          let dustF2 = '', dustR2 = '', drop = '', sweat = '';
          sols.forEach((sl, i) => {
            const walk = marching ? 1 : 0, ph = sl.ph0 + mT * C.cadence * (split ? 1 - 0.2 * tiredP : 1);
            const shake = sl.carry === 'skin' ? (emptyAt != null && lt >= emptyAt ? Math.sin((lt - emptyAt) * 16) * 22 * Math.exp(-(lt - emptyAt) * 0.6) + 8 : Math.sin(lt * 3) * 6) : 0;
            const o = { t, k: sl.k, ph, walk, lean: C.lean + tiredP * 10, team: colOf(C.color, INK.blue), carry: sl.carry, shake, droop: 0.4 + 0.5 * tiredP, worried: 0.6 + 0.4 * tiredP };
            const st = soldier(o);
            sl.paint(st, t, sd + 1000 + i * 60, sl.x, sl.y, C.scale, colFace);
            // dust puffs at the feet
            if (walk && P.dust !== false) {
              for (let q = 0; q < 2; q++) {
                const u = mod(lt * 0.9 + i * 0.29 + q * 0.5, 1), x = sl.x - colFace * (30 + u * 110) * C.scale * 2, y = sl.y - u * 50 * U - 6 * U, R = (10 + u * 22) * U;
                const pts = inkEllipsePts(x, y, R, R * 0.7, sd + 1500 + i * 3 + q, 9);
                dustF2 += inkLoop(pts, O(1500 + i * 3 + q, { amp: 0.8 })) + ' ';
                dustR2 += inkPath(pts.slice(0, 5), O(1560 + i * 3 + q, { w: 2.5, amp: 0.6 })) + ' ';
              }
            }
            // the single drop from the empty skin
            if (sl.carry === 'skin' && emptyAt != null && o._spout) {
              const da = emptyAt + 0.35, u = (lt - da) / 0.7;
              const sp = [sl.x + o._spout[0] * C.scale * colFace, sl.y + o._spout[1] * C.scale];
              if (u >= 0 && u < 1) {
                const y = lerp(sp[1], sl.y, u * u), x = sp[0];
                drop = inkLoop([[x, y - 16 * U], [x + 9 * U, y + 2 * U], [x, y + 10 * U], [x - 9 * U, y + 2 * U]], O(1700, { amp: 0.5 }));
              } else if (u >= 1 && u < 1.8) {
                const k2 = (u - 1) / 0.8, x = sp[0];
                drop = inkLoop(inkEllipsePts(x, sl.y + 4 * U, 18 * U * (0.5 + k2), 5 * U, sd + 1701, 8), O(1701, { amp: 0.4 }));
              }
            }
            // sweat drops (split, tired)
            if (split && tiredP > 0.05 && i % 2 === 0) {
              const hy = sl.y - 300 * C.scale, hx = sl.x + colFace * 40 * C.scale;
              for (let q = 0; q < 2; q++) {
                const u = mod(lt * 1.3 + q * 0.5 + i * 0.2, 1), x = hx + (q ? 30 : -24) * C.scale, y = hy + u * 70 * C.scale;
                sweat += inkLoop([[x, y - 12 * U], [x + 7 * U, y + 2 * U], [x, y + 8 * U], [x - 7 * U, y + 2 * U]], O(1720 + i * 2 + q, { amp: 0.4 })) + ' ';
              }
            }
          });
          dustF.setAttribute('d', dustF2); dustR.setAttribute('d', dustR2); dropF.setAttribute('d', drop); sweatF.setAttribute('d', sweat);

          // ---- labels
          labels.forEach((lb, i) => {
            const L = lb.L, a = atOr(cues, L.at, 0.3), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 70 + i, t, 1.4);
            lb.t.setAttribute('opacity', clamp01(p * 2));
            lb.t.setAttribute('transform', `translate(${f1(W * (L.x ?? 0.5) + b[0])} ${f1(H * (L.y ?? 0.15) + b[1])}) rotate(${L.rot ?? -3}) scale(${Math.max(0.001, lerp(0.5, 1, p)).toFixed(3)})`);
          });

          // ---- narrator
          if (kasR) {
            const sg = segs(K, cues, lt), o = sg.o;
            let pose = sg.pose;
            const kx = K.x * W, ky = (K.y != null ? K.y * H : fy + 30 * U);
            o.x = kx; o.y = ky; o.scale = K.scale * U;
            if (K.walk && marching && (pose === 'idle' || pose === 'walk')) { pose = 'walk'; o.ph = mT * C.speed * U / (KASIF.gait('walk') * o.scale); o.face = colFace; delete o.prev; }
            kasR.update(t, pose, o);
            if (kSweat) {
              const a = atOr(cues, K.sweat, dur * 0.4);
              let d = '';
              if (lt >= a) for (let q = 0; q < 3; q++) {
                const u = mod((lt - a) * 1.2 + q / 3, 1), x = kx + (q - 1) * 60 * o.scale + o.face * 30 * o.scale, y = ky - 560 * o.scale + u * 120 * o.scale;
                d += inkLoop([[x, y - 18 * U], [x + 9 * U, y + 2 * U], [x, y + 10 * U], [x - 9 * U, y + 2 * U]], O(3000 + q, { amp: 0.6 })) + ' ';
              }
              kSweat.setAttribute('d', d);
            }
          }
        },
      };
    },
  };
})();
