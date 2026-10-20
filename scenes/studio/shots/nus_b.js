// nus_b: Çanakkale 1915 naval shots in the parchment ink style (brand/kit/BRAND.md §5), written for the Nusret long video.
//   nus_b_sea  — side view of the Strait: sky (day or night), far Asian hills with stone forts, the water surface,
//                the hidden world below it (horned mines on chains anchored to the sea bed), ships on the surface.
//                Nusret (small, dark hull, one funnel, red crescent-star ensign) can lay a row of mines one by one;
//                Allied battleships (big grey hulls, 2-3 funnels, turrets, small French/British ensign) can sail in,
//                fire, take an explosion and sink (no people drawn: ship, water and smoke only). Searchlight, night
//                hatching, crescent moon, drifting smoke, Kaşif standing on the near headland.
//   nus_b_fort — close-up of an Ottoman shore battery under bombardment: stone parapet, a cannon that fires and
//                recoils, gunners (hatless period figures), shell impacts throwing dust, drifting smoke, distant
//                battleships flashing on the horizon, Kaşif crouching behind the wall.
//
// SHOTS.nus_b_sea P: {
//   night: false,                     // night sky hatching + crescent moon + stars, darker water
//   wl: 0.56, bed: 0.84,              // water line / sea bed (fractions of H)
//   hills: true, forts: [{x: 0.8, s: 1, fire: true}],      // far shore + stone forts (fire back when the ships fire)
//   headland: true,                   // near rock on the left (Kaşif stands on it)
//   ships: [{kind: "nusret"|"battle", x: 0.4, to, at: cue|sec, dur, s: 1, face: 1|-1, flag: "fr"|"gb", funnels: 2,
//            lights: true, off: cue (portholes go dark), fire: true|{every: 1.4, from: cue},
//            explode: cue, sink: {at: cue, dur: 4, tilt: -16}, turn: {at, dur: 1.2}, drop: true (lays the mine row)}],
//   mines: {n: 26, x0: 0.3, x1: 0.78, depth: 0.32 (0..1 between wl and bed), show: true, faint: false,
//           drop: true (appear as the dropping ship's stern passes), burst: index (mine that explodes with explode cue)},
//   counter: {x: 0.5, y: 0.17, label: "mayın", at},  // big count-up of dropped mines
//   searchlight: {x: 0.88, y: 0.47, keys: [{at: 0|cue, x: 0.9}, {at: cue, x: 0.5}, ...]},  // beam to a point on the water
//   smoke: 0..1, labels: [{text, x, y, at, color: "red", size}],
//   kasif: {x: 0.08, pose: "look", at, then, dir, face, scale, emotion, seq: [{at, pose, dir, emotion}]},
//   cam: {zoom: 1.06, focus: [0.5, 0.55]}
// }   cues: anything named above (off, explode, sink.at, drop via ship.at, labels[].at, kasif.at, keys[].at)
//
// SHOTS.nus_b_fort P: {fire: [cue|sec, ...] (cannon shots; plus an automatic one every `every` s), every: 2.6,
//   hits: [cue|sec, ...] (shell impacts in front of the wall: dust + shake), smoke: 0.6, fleet: 3,
//   gunners: 2, kasif: {pose: "shock", at, then, dir, emotion, x}, label: {text, x, y, at, color}}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

  // ------------------------------------------------------------------ ship drawings (local px, waterline y = 0, bow +x)
  function battleParts(funnels = 2) {
    const parts = [
      { p: [[-250, -28], [245, -28], [270, -42], [240, 16], [-232, 16], [-258, -8]], f: INK.paperDark, w: 5, c: 1, sm: 0 },
      { p: rect(-120, -62, 96, -28), f: INK.paperLight, w: 4, c: 1, sm: 0 },
      { p: rect(40, -96, 96, -62), f: INK.paperLight, w: 4, c: 1, sm: 0 },
      { p: [[130, -28], [136, -50], [184, -50], [190, -28]], f: INK.inkSoft, w: 4, c: 1, sm: 0, gun: 'fore' },
      { p: [[-202, -28], [-196, -50], [-148, -50], [-142, -28]], f: INK.inkSoft, w: 4, c: 1, sm: 0, gun: 'aft' },
      { p: [[186, -40], [244, -47]], w: 7 }, { p: [[-198, -40], [-256, -47]], w: 7 },
      { p: [[120, -96], [120, -196]], w: 4 }, { p: [[104, -170], [136, -170]], w: 3 },
      { p: [[-160, -62], [-160, -170]], w: 4 }, { p: [[-174, -148], [-146, -148]], w: 3 },
      { p: [[-230, -28], [-236, -84]], w: 3.5 },
    ];
    const fx = funnels >= 3 ? [-80, -30, 20] : [-62, -6];
    fx.forEach(x => {
      parts.push({ p: [[x - 16, -62], [x - 13, -134], [x + 13, -134], [x + 16, -62]], f: INK.paperDark, w: 4, c: 1, sm: 0, funnel: x });
      parts.push({ p: [[x - 13, -120], [x + 13, -120]], w: 6 });
    });
    return { parts, funnels: fx.map(x => [x, -136]), guns: [[246, -47], [-258, -47]], flag: [-236, -84], ports: [-180, -140, -100, -60, -20, 20, 60, 100, 140, 180].map(x => [x, -8]), len: 260 };
  }
  function nusretParts() {
    return {
      parts: [
        { p: [[-104, -22], [98, -22], [112, -34], [94, 10], [-92, 10], [-108, -6]], f: INK.ink, w: 5, c: 1, sm: 0 },
        { p: rect(-34, -48, 34, -22), f: INK.inkSoft, w: 4, c: 1, sm: 0 },
        { p: [[-10, -48], [-8, -100], [8, -100], [10, -48]], f: INK.ink, w: 4, c: 1, sm: 0, funnel: 0 },
        { p: [[56, -22], [56, -118]], w: 4 }, { p: [[44, -96], [68, -96]], w: 3 },
        { p: [[-98, -22], [-100, -74]], w: 3.5 },
        { p: [[-100, -22], [-60, -22]], w: 3, col: INK.paperLight },
      ],
      funnels: [[0, -102]], guns: [], flag: [-100, -74], ports: [-70, -45, 50, 75].map(x => [x, -8]).concat([[-18, -36], [18, -36]]), len: 108,
      deck: [[-84, -30], [-68, -30], [-52, -30]],
    };
  }
  // ensign (local to the pole top, drawn towards -x = away from the bow when face = 1)
  function flagShapes(kind, t, k) {
    const wv = i => Math.sin(t * 5 + i * 1.3 + k) * 3;
    const fw = 46, fh = 30, P = (u, v) => [-u * fw, v * fh + wv(u * 3) * u];
    const quad = (u0, u1, v0, v1) => [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
    if (kind === 'tr') return [{ p: quad(0, 1, 0, 1), f: INK.red }, { moon: true }];
    if (kind === 'fr') return [{ p: quad(0, 0.34, 0, 1), f: INK.blue }, { p: quad(0.33, 0.67, 0, 1), f: INK.paperLight }, { p: quad(0.66, 1, 0, 1), f: INK.red }];
    // British white ensign, simplified: red cross on paper-light, small blue canton at the hoist
    return [{ p: quad(0, 1, 0, 1), f: INK.paperLight }, { p: quad(0, 0.42, 0, 0.5), f: INK.blue }, { p: quad(0.42, 1, 0.4, 0.6), f: INK.red }, { p: quad(0.62, 0.74, 0, 1), f: INK.red }];
  }

  // horned sea mine (centre cx, cy, radius r) -> {disc, ring, horns}
  function minePaths(cx, cy, r, seed, t) {
    let horns = '';
    [-90, -40, 40, 0, 180, 220, 320, 140].slice(0, 6).forEach((a, i) => {
      const ar = (a - 90) * Math.PI / 180, c = Math.cos(ar), s = Math.sin(ar);
      horns += inkPath([[cx + c * r, cy + s * r], [cx + c * (r + 9), cy + s * (r + 9)]], { seed: seed + i, t, w: 4, amp: 0.5 }) + ' ';
      horns += inkDot(cx + c * (r + 10), cy + s * (r + 10), 3.5, 3.5, seed + 10 + i, t) + ' ';
    });
    return { disc: inkCircle(cx, cy, r, seed, t, { fill: true, amp: 0.8 }), ring: inkCircle(cx, cy, r, seed, t, { w: 4, amp: 0.8 }), horns };
  }

  // a ship object living in a parent group: build once, draw(x, y, rot, face, sc, t, opts)
  function makeShip(parent, defs, S, idx, seedBase, clipY) {
    const kind = S.kind || 'battle';
    const D = kind === 'nusret' ? nusretParts() : battleParts(S.funnels || 2);
    const cid = 'nusbclip' + seedBase + '_' + idx;
    const clip = el(defs, 'clipPath', { id: cid });
    const clipR = el(clip, 'rect', { x: -4000, y: -4000, width: 8000, height: 4000 + clipY });
    const outer = el(parent, 'g', { 'clip-path': `url(#${cid})` });
    const g = el(outer, 'g');
    const items = D.parts.map(st => ({ st, f: st.f ? mk(g, st.f) : null, r: mk(g, st.col || INK.ink) }));
    const flagK = S.flag || (kind === 'nusret' ? 'tr' : 'fr');
    const flagG = el(g, 'g');
    const flagFs = flagShapes(flagK, 0, 0).map(fs => fs.moon ? { moon: true, a: mk(flagG, INK.paperLight), b: mk(flagG, INK.red), c: mk(flagG, INK.paperLight) } : { f: mk(flagG, fs.f) });
    const flagR = mk(flagG);
    const ports = mk(g, INK.gold), deck = D.deck ? mk(g, INK.inkSoft) : null, deckR = D.deck ? mk(g) : null;
    return {
      S, D, kind, g, clipR, outer,
      draw(x, y, rot, face, sc, t, o = {}) {
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${(face * sc).toFixed(3)} ${sc.toFixed(3)})`);
        const sd = seedBase * 100 + idx * 37;
        items.forEach((it, i) => {
          const op = { seed: sd + i, t, amp: 1.1, smooth: it.st.sm !== 0 };
          if (it.f) it.f.setAttribute('d', inkLoop(it.st.p, op));
          it.r.setAttribute('d', inkPath(it.st.p, Object.assign({}, op, { w: it.st.w, closed: !!it.st.c })));
        });
        // flag at the stern pole
        const [fx, fy] = D.flag, shapes = flagShapes(flagK, t, idx);
        let ring = '';
        shapes.forEach((fs, i) => {
          const n = flagFs[i];
          if (fs.moon) {
            const cx = fx - 22, cy = fy + 15;
            n.a.setAttribute('d', inkCircle(cx, cy, 9, sd + 70, t, { fill: true, amp: 0.4 }));
            n.b.setAttribute('d', inkCircle(cx + 4, cy - 1, 7.5, sd + 71, t, { fill: true, amp: 0.4 }));
            n.c.setAttribute('d', inkDot(cx + 9, cy, 3.2, 3.2, sd + 72, t, 0.3));
            return;
          }
          const pts = fs.p.map(q => [fx + q[0], fy + q[1]]);
          n.f.setAttribute('d', inkLoop(pts, { seed: sd + 60 + i, t, amp: 0.6, smooth: false }));
          if (i === 0) ring = inkPath(pts, { seed: sd + 60, t, closed: true, w: 3, amp: 0.6, smooth: false });
        });
        flagR.setAttribute('d', ring);
        ports.setAttribute('d', o.lights > 0.02 ? D.ports.map((q, i) => inkDot(q[0], q[1], 5 * o.lights, 5 * o.lights, sd + 80 + i, t)).join(' ') : '');
        if (deck) {
          const n = Math.max(0, Math.min(3, Math.ceil(3 * (o.deck ?? 1))));
          const d = D.deck.slice(0, n).map((q, i) => inkCircle(q[0], q[1], 9, sd + 90 + i, t, { fill: true, amp: 0.4 })).join(' ');
          deck.setAttribute('d', d); deckR.setAttribute('d', D.deck.slice(0, n).map((q, i) => inkCircle(q[0], q[1], 9, sd + 90 + i, t, { w: 3, amp: 0.4 })).join(' '));
        }
      },
      // local point -> stage point
      at(q, x, y, rot, face, sc) {
        const a = rot * Math.PI / 180, lx = q[0] * face * sc, ly = q[1] * sc;
        return [x + lx * Math.cos(a) - ly * Math.sin(a), y + lx * Math.sin(a) + ly * Math.cos(a)];
      },
    };
  }

  // puff of smoke (filled paper-dark blob with an ink-soft ring)
  const puffPts = (cx, cy, r, seed) => inkEllipsePts(cx, cy, r, r * 0.8, seed, 10, 0, 0.12);

  function kasifPose(K, cues, lt) {
    const segs = [{ at: 0, pose: K.pose || 'idle', dir: K.dir, emotion: K.emotion0 || null, face: K.face }];
    if (K.at != null) segs.push({ at: atOr(cues, K.at, 1e9), pose: K.then || 'shock', dir: K.dir, emotion: K.emotion, face: K.face });
    (K.seq || []).forEach(s => segs.push(Object.assign({}, s, { at: atOr(cues, s.at, 1e9) })));
    segs.sort((a, b) => a.at - b.at);
    let i = 0; while (i < segs.length - 1 && segs[i + 1].at <= lt) i++;
    return { cur: segs[i], prev: i > 0 ? segs[i - 1] : null };
  }
  function driveKasif(kas, cues, lt, t, x, y, words) {
    const { cur, prev } = kasifPose(kas.K, cues, lt);
    const since = lt - cur.at, dirOf = d => typeof d === 'number' ? d : DIRS[d] ?? 20;
    const faceOf = f => f === 'left' ? -1 : f === 'right' ? 1 : (kas.K.face === 'left' ? -1 : 1);
    const o = { x, y, face: faceOf(cur.face), since, dir: dirOf(cur.dir), mouth: inkTalk(t, words),
      emotion: cur.emotion || (cur.pose === 'shock' ? 'surprised' : null) };
    if (prev && since < 0.32) { o.prev = { pose: prev.pose, since: prev.at, dir: dirOf(prev.dir) }; o.mix = since / 0.32; }
    kas.rig.update(t, cur.pose, o);
  }

  // ================================================================== nus_b_sea
  SH.nus_b_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const sd = seed * 1000, night = !!P.night;
      const WL = (P.wl ?? 0.56) * H, BED = (P.bed ?? 0.84) * H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const r0 = rng(seed * 13 + 7);
      // --- sky
      const skyG = el(world, 'g');
      const hatchE = night ? mk(skyG, INK.inkSoft, { 'fill-opacity': 0.75 }) : null;
      const hatchPts = [];
      if (night) for (let i = 0; i < 150; i++) {
        const x = r0() * W, y = 90 + r0() * (WL - 120);
        hatchPts.push([[x, y], [x + 46, y - 26]]);
      }
      const moonF = night ? mk(skyG, INK.paperLight) : null, moonR = night ? mk(skyG) : null, stars = night ? mk(skyG, INK.inkSoft) : null;
      const starPts = Array.from({ length: 12 }, () => [80 + r0() * (W - 160), 110 + r0() * (WL * 0.45)]);
      const clouds = night ? null : { f: mk(skyG, INK.paperLight), r: mk(skyG, INK.inkSoft) };
      // --- far shore
      const hillF = mk(world, INK.paperDark), hillR = mk(world, INK.inkSoft);
      const HX0 = 0.5 * W;
      const hillPts = [[HX0 - 60, WL + 2], [HX0, WL - 30], [HX0 + 120, WL - 70], [HX0 + 260, WL - 92], [HX0 + 420, WL - 80], [HX0 + 560, WL - 120], [HX0 + 700, WL - 104], [HX0 + 860, WL - 140], [W + 80, WL - 150], [W + 80, WL + 2]];
      const hillY = x => { for (let i = 1; i < hillPts.length; i++) if (x <= hillPts[i][0]) { const a = hillPts[i - 1], b = hillPts[i]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); } return WL - 140; };
      const forts = (P.hills === false ? [] : (P.forts || [{ x: 0.74 }, { x: 0.9 }])).map((F, k) => ({ F, k, x: F.x * W, y: hillY(F.x * W) + 6, s: F.s || 1, f: mk(world, INK.paperLight), r: mk(world), gun: mk(world) }));
      // --- water
      const waterF = mk(world, night ? INK.paperDark : INK.paperLight, night ? { 'fill-opacity': 0.55 } : {});
      const waves = mk(world, INK.inkSoft, { 'fill-opacity': 0.75 });
      const bedF = mk(world, INK.paperDark), bedR = mk(world, INK.inkSoft);
      const wavePts = Array.from({ length: 26 }, () => [r0() * W, WL + 30 + r0() * (BED - WL - 60), 30 + r0() * 50]);
      const weeds = Array.from({ length: 14 }, () => [r0() * W, 18 + r0() * 26]);
      // --- mines (under the ships)
      const M = P.mines || null, mineG = el(world, 'g');
      const mines = [];
      if (M && M.show !== false) {
        const n = M.n ?? 26, x0 = (M.x0 ?? 0.3) * W, x1 = (M.x1 ?? 0.78) * W;
        for (let i = 0; i < n; i++) {
          const x = n > 1 ? lerp(x0, x1, i / (n - 1)) : x0, dep = WL + (M.depth ?? 0.32) * (BED - WL) + Math.sin(i * 2.3) * 6;
          mines.push({ i, x, dep, chain: mk(mineG, INK.inkSoft), anc: mk(mineG, INK.inkSoft), disc: mk(mineG, M.faint ? INK.inkSoft : INK.ink), ring: mk(mineG), horns: mk(mineG), tDrop: 0 });
        }
      }
      const splash = mk(world, INK.inkSoft);
      // --- searchlight (behind ships)
      const SL = P.searchlight || null;
      const beamF = SL ? mk(world, INK.paperLight, { 'fill-opacity': 0.8 }) : null, beamR = SL ? mk(world, INK.gold, { 'fill-opacity': 0.9 }) : null;
      // --- smoke behind ships
      const smokeBackF = mk(world, INK.paperDark, { 'fill-opacity': 0.85 }), smokeBackR = mk(world, INK.inkSoft);
      // --- ships
      const shipsG = el(world, 'g');
      const ships = (P.ships || []).map((S, i) => makeShip(shipsG, defs, S, i, seed, WL + 18 * (S.s || 1)));
      // --- fx in front of ships
      const fxG = el(world, 'g');
      const shellE = mk(fxG, INK.ink), flashF = mk(fxG, INK.gold), flashR = mk(fxG, INK.red);
      const colF = mk(fxG, INK.paperLight), colR = mk(fxG, INK.inkSoft);
      const plumeF = mk(fxG, INK.inkSoft, { 'fill-opacity': 0.9 }), plumeR = mk(fxG, INK.ink);
      const smokeF = mk(fxG, INK.paperDark, { 'fill-opacity': 0.85 }), smokeR = mk(fxG, INK.inkSoft);
      const rings = mk(fxG, INK.inkSoft), debris = mk(fxG, INK.ink), boom = mk(fxG, INK.red);
      const surface = mk(world, INK.ink);
      // --- headland + Kaşif
      const headF = P.headland === false ? null : mk(world, INK.paperDark), headR = P.headland === false ? null : mk(world);
      const HW = 0.16 * W, HT = WL - 34;
      const headPts = [[-40, HT - 6], [HW * 0.55, HT], [HW * 0.9, HT + 10], [HW, WL - 4], [HW * 1.08, WL + 60], [HW * 0.95, WL + 170], [HW * 1.15, BED - 30], [HW * 1.3, BED + 8], [-40, BED + 8]];
      let kas = null;
      if (P.kasif && typeof KASIF !== 'undefined') kas = { K: P.kasif, rig: KASIF.create(el(world, 'g'), { scale: P.kasif.scale ?? 0.6, hat: true, seed: seed + 3 }) };
      // --- labels / counter
      const labels = (P.labels || []).map((L, k) => {
        const t = el(root, 'text', { 'font-family': INK_FONT, 'font-size': L.size || 64, 'text-anchor': 'middle', fill: L.color === 'red' ? INK.red : INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = L.text;
        return { L, t, k, u: mk(root, L.color === 'red' ? INK.red : INK.ink) };
      });
      let counter = null;
      if (P.counter) {
        const C = P.counter, g = el(root, 'g');
        const box = mk(g, INK.paperLight), boxR = mk(g);
        const num = el(g, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': C.size || 120, 'text-anchor': 'end', fill: INK.red });
        const lab = el(g, 'text', { 'font-family': INK_FONT, 'font-size': 64, 'text-anchor': 'start', fill: INK.ink });
        lab.textContent = C.label || 'mayın';
        counter = { C, g, box, boxR, num, lab };
      }
      const camF = P.cam || null;

      const shipState = (sh, lt, cues) => {
        const S = sh.S, at = atOr(cues, S.at, 0), dur = S.dur ?? 4;
        const mv = S.to != null ? (S.ease === 'io' ? progIO(lt, at, dur) : lin(lt, at, dur)) : 0;
        let x = lerp(S.x * W, (S.to ?? S.x) * W, mv), y = WL, rot = 0, face = S.face ?? 1, sc = S.s || 1;
        let turnK = 1;
        if (S.turn) { const ta = atOr(cues, S.turn.at, 0), tp = progIO(lt, ta, S.turn.dur ?? 1.4); turnK = Math.cos(tp * Math.PI); }
        return { x, y, rot, face: face * (Math.abs(turnK) < 0.08 ? Math.sign(turnK || 1) * 0.08 : turnK), sc, mv };
      };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, words = env.words || ctx.words || (typeof WORDS !== 'undefined' ? WORDS : null);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          let shake = [0, 0];
          // explosion timing (first ship with explode)
          const exShip = ships.find(s => s.S.explode != null);
          const exAt = exShip ? atOr(cues, exShip.S.explode, null) : null;
          if (exAt != null && lt >= exAt && lt < exAt + 1.2) { const k = Math.exp(-(lt - exAt) * 3.2); shake = [Math.sin(t * 61) * 14 * k, Math.cos(t * 53) * 10 * k]; }
          let camTf = '';
          if (camF) {
            const u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, camF.zoom ?? 1.06, u), fx = (camF.focus ? camF.focus[0] : 0.5) * W, fy = (camF.focus ? camF.focus[1] : 0.55) * H;
            camTf = ` translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`;
          }
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.33) * 7 + shake[0])} ${f1(Math.cos(lt * 0.25) * 4 + shake[1])})` + camTf);

          // sky
          if (night) {
            hatchE.setAttribute('d', hatchPts.map((l, i) => inkPath(l, { seed: sd + 1 + i, t, w: 3.2, amp: 1.2 })).join(' '));
            const mx = W * 0.4, my = 190, R = 46;
            moonF.setAttribute('d', inkLoop([...inkEllipsePts(mx, my, R, R, sd + 5, 16).slice(4, 13), [mx - 6, my + R * 0.6], [mx + 8, my], [mx - 6, my - R * 0.6]], { seed: sd + 5, t, amp: 0.8 }));
            moonR.setAttribute('d', inkPath([...inkEllipsePts(mx, my, R, R, sd + 5, 16).slice(4, 13), [mx - 6, my + R * 0.6], [mx + 8, my], [mx - 6, my - R * 0.6]], { seed: sd + 5, t, closed: true, w: 4, amp: 0.8 }));
            stars.setAttribute('d', starPts.map((q, i) => { const tw = 0.6 + 0.4 * Math.sin(t * 2.3 + i * 1.7); return inkDot(q[0], q[1], 4 * tw, 4 * tw, sd + 20 + i, t); }).join(' '));
          } else {
            let cf = '', cr = '';
            [[0.18, 0.2, 90], [0.46, 0.13, 70], [0.78, 0.22, 100]].forEach(([u, v, r], i) => {
              const cx = ((u * W + t * 9 + i * 200) % (W + 300)) - 150, cy = v * H, pts = [];
              for (let j = 0; j < 7; j++) { const a = Math.PI + j / 6 * Math.PI; pts.push([cx + Math.cos(a) * r * (1 + 0.25 * Math.sin(j * 2.1)), cy + Math.sin(a) * r * 0.45]); }
              pts.push([cx + r, cy + 10], [cx - r, cy + 10]);
              cf += inkLoop(pts, { seed: sd + 30 + i, t, amp: 1.2 }) + ' ';
              cr += inkPath(pts.slice(0, 7), { seed: sd + 30 + i, t, w: 3, amp: 1.2 }) + ' ';
            });
            clouds.f.setAttribute('d', cf); clouds.r.setAttribute('d', cr);
          }
          // far hills + forts
          if (P.hills !== false) {
            hillF.setAttribute('d', inkLoop(hillPts, { seed: sd + 40, t, amp: 1.2 }));
            hillR.setAttribute('d', inkPath(hillPts.slice(0, -1), { seed: sd + 40, t, w: 4, amp: 1.2 }));
          }
          forts.forEach(F => {
            const s = F.s * 1.1, x = F.x, y = F.y;
            const tower = [[x - 46 * s, y], [x - 40 * s, y - 64 * s], [x - 44 * s, y - 64 * s], [x - 44 * s, y - 80 * s], [x - 30 * s, y - 80 * s], [x - 30 * s, y - 70 * s], [x - 14 * s, y - 70 * s], [x - 14 * s, y - 80 * s], [x + 2 * s, y - 80 * s], [x + 2 * s, y - 70 * s], [x + 18 * s, y - 70 * s], [x + 18 * s, y - 80 * s], [x + 34 * s, y - 80 * s], [x + 34 * s, y - 64 * s], [x + 40 * s, y]];
            F.f.setAttribute('d', inkLoop(tower, { seed: sd + 50 + F.k, t, amp: 0.9, smooth: false }));
            let rd = inkPath(tower, { seed: sd + 50 + F.k, t, closed: true, w: 4, amp: 0.9, smooth: false });
            rd += ' ' + inkPath([[x - 38 * s, y - 38 * s], [x + 30 * s, y - 38 * s]], { seed: sd + 55 + F.k, t, w: 2.5 }) + ' ' + inkPath([[x - 6 * s, y - 64 * s], [x - 6 * s, y - 38 * s]], { seed: sd + 57 + F.k, t, w: 2.5 });
            F.r.setAttribute('d', rd);
            F.gun.setAttribute('d', inkPath([[x - 44 * s, y - 56 * s], [x - 84 * s, y - 60 * s]], { seed: sd + 59 + F.k, t, w: 9 }));
            F.muzzle = [x - 88 * s, y - 60 * s];
          });
          // water
          const surfPts = [];
          for (let i = 0; i <= 24; i++) { const x = -60 + i * (W + 120) / 24; surfPts.push([x, WL + Math.sin(i * 1.3 + t * 1.7) * 4]); }
          waterF.setAttribute('d', inkLoop([...surfPts, [W + 60, BED + 40], [-60, BED + 40]], { seed: sd + 60, t, amp: 0.8, smooth: false }));
          surface.setAttribute('d', inkPath(surfPts, { seed: sd + 61, t, w: 5, amp: 1 }));
          waves.setAttribute('d', wavePts.map(([x0, y0, L], i) => {
            const xx = ((x0 + t * (8 + i % 3 * 4)) % (W + 100)) - 50, pts = [];
            for (let j = 0; j <= 5; j++) pts.push([xx + j * L / 5, y0 + Math.sin(j * 1.8 + t * 2 + i) * 4]);
            return inkPath(pts, { seed: sd + 70 + i, t, w: 2.5, amp: 0.8 });
          }).join(' '));
          const bedPts = [];
          for (let i = 0; i <= 16; i++) bedPts.push([-60 + i * (W + 120) / 16, BED + Math.sin(i * 2.7) * 10]);
          bedF.setAttribute('d', inkLoop([...bedPts, [W + 60, H + 40], [-60, H + 40]], { seed: sd + 90, t, amp: 1 }));
          bedR.setAttribute('d', inkPath(bedPts, { seed: sd + 90, t, w: 4, amp: 1 }) + ' ' + weeds.map(([x, h], i) => {
            const y = BED + Math.sin(x / W * 16 * 2.7 / 2.7) * 0; const sw = Math.sin(t * 1.4 + i) * 6;
            return inkPath([[x, y + 4], [x + sw * 0.5, y - h * 0.5], [x + sw, y - h]], { seed: sd + 95 + i, t, w: 3, amp: 0.6 });
          }).join(' '));

          // ships state
          const st = ships.map(sh => shipState(sh, lt, cues));
          // mines + drop
          if (mines.length) {
            const dropper = ships.findIndex(s => s.S.drop);
            mines.forEach(m => { m.tDrop = M.drop && dropper >= 0 ? null : -10; });
            if (M.drop && dropper >= 0) {
              const sh = ships[dropper], S = sh.S, a = atOr(cues, S.at, 0), d = S.dur ?? 4, x0 = S.x * W, x1 = (S.to ?? S.x) * W;
              const sternOff = -(S.face ?? 1) * sh.D.len * (S.s || 1) * 0.85;
              mines.forEach(m => { const u = (m.x - sternOff - x0) / (x1 - x0); m.tDrop = u >= 0 && u <= 1 ? a + u * d : (u < 0 ? -10 : 1e9); });
            }
            const burstI = M.burst, burstAt = exAt;
            let sp = '';
            mines.forEach(m => {
              const age = lt - m.tDrop;
              if (age < 0) { m.disc.setAttribute('d', ''); m.ring.setAttribute('d', ''); m.horns.setAttribute('d', ''); m.chain.setAttribute('d', ''); m.anc.setAttribute('d', ''); return; }
              if (burstI === m.i && burstAt != null && lt >= burstAt) { m.disc.setAttribute('d', ''); m.ring.setAttribute('d', ''); m.horns.setAttribute('d', ''); m.chain.setAttribute('d', ''); m.anc.setAttribute('d', ''); return; }
              const fall = prog(age, 0, 0.9), ancFall = prog(age, 0, 1.3);
              const bob = Math.sin(t * 1.1 + m.i) * 3;
              const my = lerp(WL - 6, m.dep, fall) + bob * fall, ay = lerp(WL + 6, BED - 6, ancFall);
              const r = 15, ms = m.i * 13 + sd + 200;
              const mp = minePaths(m.x + Math.sin(t * 0.9 + m.i) * 2, my, r, ms, t);
              m.disc.setAttribute('d', mp.disc); m.ring.setAttribute('d', mp.ring); m.horns.setAttribute('d', mp.horns);
              m.anc.setAttribute('d', inkLoop(rect(m.x - 12, ay - 10, m.x + 12, ay + 8), { seed: ms + 5, t, amp: 0.6, smooth: false }));
              // chain: little links
              let cd = '';
              const n = Math.max(1, Math.round((ay - my - r) / 16));
              for (let j = 0; j < n; j++) { const yy = my + r + 6 + j * (ay - 10 - my - r - 6) / n; cd += inkCircle(m.x + Math.sin(j + t) * 1.2, yy, 3.4, ms + 20 + j, t, { ry: 6, w: 2.4, n: 8, amp: 0.4 }) + ' '; }
              m.chain.setAttribute('d', ay - my > r + 10 ? cd : '');
              if (age < 1.2) { const rr = 10 + age * 60; sp += inkCircle(m.x, WL + 2, rr, ms + 40, t, { ry: rr * 0.18, w: 3 * (1 - age / 1.2) + 0.5, amp: 0.4 }) + ' '; }
            });
            splash.setAttribute('d', sp);
          }
          // searchlight
          if (SL) {
            const keys = (SL.keys || [{ at: 0, x: 0.9 }, { at: dur, x: 0.3 }]).map(k => ({ at: atOr(cues, k.at, 0), x: k.x })).sort((a, b) => a.at - b.at);
            let tx = keys[0].x;
            for (let i = 1; i < keys.length; i++) if (lt >= keys[i - 1].at) tx = lerp(keys[i - 1].x, keys[i].x, progIO(lt, keys[i - 1].at, Math.max(0.3, keys[i].at - keys[i - 1].at)));
            tx = tx * W + Math.sin(t * 1.3) * 10;
            const sx = SL.x * W, sy = (SL.y ?? 0.47) * H, ang = Math.atan2(WL - sy, tx - sx), L = Math.hypot(tx - sx, WL - sy), spread = 0.1;
            const pA = [sx + Math.cos(ang - spread) * L, sy + Math.sin(ang - spread) * L], pB = [sx + Math.cos(ang + spread) * L, sy + Math.sin(ang + spread) * L];
            const yA = Math.min(pA[1], WL + 4), yB = Math.min(pB[1], WL + 4);
            beamF.setAttribute('d', inkLoop([[sx, sy - 6], [pA[0], yA], [tx, WL + 10], [pB[0], yB], [sx, sy + 6]], { seed: sd + 300, t, amp: 1, smooth: false }));
            beamR.setAttribute('d', inkPath([[sx, sy - 6], [pA[0], yA]], { seed: sd + 301, t, w: 5, amp: 1 }) + ' ' + inkPath([[sx, sy + 6], [pB[0], yB]], { seed: sd + 302, t, w: 5, amp: 1 }) + ' ' +
              inkCircle(tx, WL + 4, 70, sd + 303, t, { ry: 10, w: 3, amp: 0.6 }) + ' ' + inkDot(sx, sy, 12, 12, sd + 304, t));
          }
          // ships draw + funnel smoke + fire
          let sbF = '', sbR = '', shells = '', flF = '', flR = '', cF = '', cR = '', plF = '', plR = '', smF = '', smR = '', rg = '', db = '', bm = '';
          ships.forEach((sh, i) => {
            const S = sh.S, s = st[i];
            let { x, y, rot, face, sc } = s;
            const bob = Math.sin(t * 1.4 + i * 1.7) * 3;
            y += bob; rot = Math.sin(t * 1.1 + i) * (sh.kind === 'nusret' ? 2 : 1.2);
            // explosion jolt
            const ea = S.explode != null ? atOr(cues, S.explode, null) : null;
            if (ea != null && lt >= ea) rot += -6 * punch(lt, ea, 0.9) * Math.sign(face);
            // sinking
            let sinkP = 0;
            if (S.sink) {
              const sa = atOr(cues, S.sink.at, 0), sdur = S.sink.dur ?? 4;
              sinkP = progIO(lt, sa, sdur);
              rot += (S.sink.tilt ?? -14) * prog(lt, sa, sdur * 0.5) * Math.sign(face);
              y += sinkP * 200 * sc;
            }
            const lights = S.lights ? (S.off != null ? 1 - clamp01((lt - atOr(cues, S.off, 1e9)) / 0.5) * (1 - (Math.sin(t * 40) > 0.3 && lt - atOr(cues, S.off, 1e9) < 0.4 ? 0.5 : 0)) : 1) : 0;
            let deck = 1;
            if (S.drop && mines.length) { const done = mines.filter(m => lt >= m.tDrop).length; deck = 1 - done / mines.length; }
            sh.outer.style.opacity = sinkP >= 0.999 ? 0 : 1;
            sh.draw(x, y, rot, face, sc, t, { lights, deck });
            // funnel smoke (battleships always, Nusret thin)
            if (sinkP < 0.8) sh.D.funnels.forEach((q, k) => {
              const p0 = sh.at(q, x, y, rot, face, sc);
              for (let j = 0; j < (sh.kind === 'nusret' ? 2 : 4); j++) {
                const ph = ((t * 0.35 + j / 4 + k * 0.13 + i * 0.3) % 1), r = (10 + ph * 34) * sc;
                const px = p0[0] - Math.sign(face) * ph * 120 * sc + Math.sin(t + j) * 4, py = p0[1] - ph * 70 * sc;
                const pts = puffPts(px, py, r, sd + 400 + i * 20 + k * 5 + j);
                sbF += inkLoop(pts, { seed: sd + 400 + i * 20 + j, t, amp: 0.8 }) + ' ';
                sbR += inkPath(pts, { seed: sd + 400 + i * 20 + j, t, w: 2.5, closed: true, amp: 0.8 }) + ' ';
              }
            });
            // firing
            if (S.fire && sinkP <= 0) {
              const F = typeof S.fire === 'object' ? S.fire : {}, every = F.every ?? 1.5, from = atOr(cues, F.from, 0.3) + (i * 0.47) % every;
              const k = Math.floor((lt - from) / every);
              for (let e = Math.max(0, k - 1); e <= k; e++) {
                const t0 = from + e * every, age = lt - t0;
                if (age < 0 || age > 1.6) continue;
                const gi = (e + i) % Math.max(1, sh.D.guns.length);
                if (!sh.D.guns.length) continue;
                const gp = sh.at(sh.D.guns[gi], x, y, rot, face, sc);
                if (age < 0.35) {
                  const fr = (1 - age / 0.35) * 30 * sc, pts = [];
                  for (let q = 0; q < 10; q++) { const a = q / 10 * Math.PI * 2, rr = q % 2 ? fr * 0.45 : fr; pts.push([gp[0] + Math.cos(a) * rr + Math.sign(face) * fr * 0.6, gp[1] + Math.sin(a) * rr]); }
                  flF += inkLoop(pts, { seed: sd + 500 + i * 7 + e % 5, t, amp: 0.6, smooth: false }) + ' ';
                }
                const sr = (8 + age * 30) * sc, pp = puffPts(gp[0] + Math.sign(face) * (14 + age * 26), gp[1] - age * 30, sr, sd + 520 + i * 7 + e % 5);
                smF += inkLoop(pp, { seed: sd + 520 + i, t, amp: 0.8 }) + ' ';
                smR += inkPath(pp, { seed: sd + 520 + i, t, w: 2.5, closed: true, amp: 0.8 }) + ' ';
                // shell arc towards a fort
                const tgt = forts.length ? forts[(e + i) % forts.length] : null;
                if (tgt && tgt.muzzle && age < 1.1) {
                  const tp = clamp01(age / 1.0), tx = tgt.x, ty = tgt.y - 30;
                  const bx = lerp(gp[0], tx, tp), by = lerp(gp[1], ty, tp) - Math.sin(tp * Math.PI) * 160;
                  if (tp < 1) shells += inkDot(bx, by, 6, 6, sd + 540 + e % 7, t) + ' ';
                  if (tp > 0.15) { const tail = []; for (let q = 0; q <= 6; q++) { const u = Math.max(0, tp - 0.15 + q * 0.025); tail.push([lerp(gp[0], tx, u), lerp(gp[1], ty, u) - Math.sin(u * Math.PI) * 160]); } shells += inkPath(tail, { seed: sd + 545, t, w: 2.5, amp: 0.5 }) + ' '; }
                }
                if (tgt && age >= 1.0 && age < 1.6) {
                  const ia = age - 1.0, pr = 14 + ia * 70;
                  const pts = puffPts(tgt.x + (e % 3 - 1) * 26, tgt.y - 40 - ia * 40, pr, sd + 560 + e % 9);
                  smF += inkLoop(pts, { seed: sd + 560, t, amp: 1 }) + ' '; smR += inkPath(pts, { seed: sd + 560, t, w: 3, closed: true, amp: 1 }) + ' ';
                  if (ia < 0.2) bm += inkDot(tgt.x + (e % 3 - 1) * 26, tgt.y - 40, 16, 12, sd + 570, t) + ' ';
                }
              }
            }
            // explosion: flash, water column, then a smoke plume
            if (ea != null && lt >= ea - 0.02) {
              const age = lt - ea, ex = x + (S.ex ?? -0.15) * sh.D.len * sc * Math.sign(face), eyy = WL;
              if (age < 0.5) {
                const fr = (0.4 + age * 3) * 120 * (1 - age / 0.5 * 0.4), pts = [];
                for (let q = 0; q < 16; q++) { const a = q / 16 * Math.PI * 2, rr = q % 2 ? fr * 0.42 : fr * (0.8 + 0.3 * Math.sin(q * 3.1)); pts.push([ex + Math.cos(a) * rr, eyy - 30 + Math.sin(a) * rr * 0.85]); }
                flF += inkLoop(pts, { seed: sd + 600, t, amp: 1.2, smooth: false }) + ' ';
                flR += inkPath(pts, { seed: sd + 600, t, w: 5, closed: true, amp: 1.2, smooth: false }) + ' ';
              }
              const hgt = 420 * Math.sin(Math.PI * clamp01(age / 2.2)) * (age < 2.2 ? 1 : 0);
              if (hgt > 4) {
                const wcol = [[ex - 70, eyy + 6], [ex - 54, eyy - hgt * 0.5], [ex - 80, eyy - hgt * 0.85], [ex - 30, eyy - hgt], [ex + 6, eyy - hgt * 0.92], [ex + 44, eyy - hgt * 1.02], [ex + 82, eyy - hgt * 0.8], [ex + 56, eyy - hgt * 0.45], [ex + 72, eyy + 6]];
                cF += inkLoop(wcol, { seed: sd + 610, t, amp: 3 }) + ' ';
                cR += inkPath(wcol, { seed: sd + 610, t, w: 5, closed: true, amp: 3 }) + ' ';
                for (let q = 0; q < 9; q++) { const a = -Math.PI / 2 + (q - 4) * 0.28, rr = hgt * (0.9 + 0.25 * (q % 3)); cF += inkDot(ex + Math.cos(a) * rr * 0.5, eyy - 20 + Math.sin(a) * rr, 9, 9, sd + 620 + q, t) + ' '; }
              }
              // underwater shock ring at the mine
              if (age < 1.0 && mines.length) { const rr = 20 + age * 160; rg += inkCircle(ex, mines[0].dep, rr, sd + 630, t, { ry: rr * 0.6, w: 4 * (1 - age) + 0.5, amp: 1 }) + ' '; }
              // smoke plume, keeps rising
              if (age > 0.4) {
                const n = 7;
                for (let q = 0; q < n; q++) {
                  const ph = ((age * 0.22 + q / n) % 1), r = (30 + ph * 90) * Math.min(1, (age - 0.4) * 1.5);
                  const px = ex + Math.sin(q * 2.1 + t * 0.5) * 20 + ph * 140, py = eyy - 40 - ph * 380;
                  const pts = puffPts(px, py, r, sd + 640 + q);
                  plF += inkLoop(pts, { seed: sd + 640 + q, t, amp: 1.2 }) + ' ';
                  plR += inkPath(pts, { seed: sd + 640 + q, t, w: 3.5, closed: true, amp: 1.2 }) + ' ';
                }
              }
            }
            // after sinking: rings, bubbles, a few floating planks
            if (S.sink) {
              const sa = atOr(cues, S.sink.at, 0), sdur = S.sink.dur ?? 4, age = lt - sa - sdur * 0.6;
              if (age > 0) {
                for (let q = 0; q < 3; q++) { const ph = ((age * 0.4 + q / 3) % 1), rr = 30 + ph * 220; rg += inkCircle(x, WL + 4, rr, sd + 660 + q, t, { ry: rr * 0.12, w: 4 * (1 - ph) + 0.5, amp: 0.6 }) + ' '; }
                for (let q = 0; q < 8; q++) { const ph = ((age * 0.7 + q / 8) % 1); db += inkCircle(x + (q - 4) * 18 + Math.sin(t * 3 + q) * 5, WL + 140 - ph * 136, 5 + q % 3 * 2, sd + 670 + q, t, { w: 2.5, amp: 0.3 }) + ' '; }
                [[-120, 0], [80, 0], [190, 0]].forEach(([dx], q) => { const xx = x + dx + age * 10 * (q - 1), yy = WL - 2 + Math.sin(t * 1.6 + q) * 3; db += inkPath([[xx - 26, yy], [xx + 26, yy + (q - 1) * 3]], { seed: sd + 690 + q, t, w: 6, amp: 0.6 }) + ' '; });
              }
            }
          });
          // forts fire back (when any ship fires)
          const anyFire = ships.some(s => s.S.fire);
          if (anyFire) forts.forEach((F, k) => {
            if (F.F.fire === false || !F.muzzle) return;
            const every = 1.7, from = 0.9 + k * 0.6, e = Math.floor((lt - from) / every);
            if (e < 0) return;
            const age = lt - (from + e * every);
            if (age < 0.3) { const fr = (1 - age / 0.3) * 30, pts = []; for (let q = 0; q < 10; q++) { const a = q / 10 * Math.PI * 2, rr = q % 2 ? fr * 0.45 : fr; pts.push([F.muzzle[0] - fr * 0.6 + Math.cos(a) * rr, F.muzzle[1] + Math.sin(a) * rr]); } flF += inkLoop(pts, { seed: sd + 700 + k, t, amp: 0.6, smooth: false }) + ' '; }
            const pr = 8 + age * 26, pp = puffPts(F.muzzle[0] - 20 - age * 30, F.muzzle[1] - age * 26, pr, sd + 710 + k);
            if (age < 1.4) { smF += inkLoop(pp, { seed: sd + 710 + k, t, amp: 0.8 }) + ' '; smR += inkPath(pp, { seed: sd + 710 + k, t, w: 2.5, closed: true, amp: 0.8 }) + ' '; }
            // splash near a ship
            const tgtS = st.length ? st[(e + k) % st.length] : null;
            if (tgtS && age > 0.8 && age < 1.8) {
              const sa2 = age - 0.8, hh = 150 * Math.sin(Math.PI * clamp01(sa2 / 1.0)), sx2 = tgtS.x + ((e * 7 + k * 3) % 5 - 2) * 70 + 90;
              if (hh > 3) { const pts = [[sx2 - 22, WL + 4], [sx2 - 14, WL - hh * 0.7], [sx2 - 4, WL - hh], [sx2 + 10, WL - hh * 0.85], [sx2 + 22, WL + 4]]; cF += inkLoop(pts, { seed: sd + 720 + k, t, amp: 1.5 }) + ' '; cR += inkPath(pts, { seed: sd + 720 + k, t, w: 3, closed: true, amp: 1.5 }) + ' '; }
            }
          });
          // drifting battle smoke
          const SM = P.smoke || 0;
          if (SM > 0) {
            const n = Math.round(SM * 10);
            for (let q = 0; q < n; q++) {
              const ph = ((t * 0.02 + q / n) % 1), px = -150 + ph * (W + 300), py = WL - 70 - (q % 4) * 70 + Math.sin(t * 0.4 + q) * 10, r = 80 + (q % 3) * 30;
              const pts = [];
              for (let j = 0; j < 9; j++) { const a = j / 9 * Math.PI * 2; pts.push([px + Math.cos(a) * r * (1 + 0.22 * Math.sin(j * 2.3 + q)), py + Math.sin(a) * r * 0.42]); }
              (q % 2 ? (smF += inkLoop(pts, { seed: sd + 800 + q, t, amp: 1.5 }) + ' ') : (sbF += inkLoop(pts, { seed: sd + 800 + q, t, amp: 1.5 }) + ' '));
              (q % 2 ? (smR += inkPath(pts, { seed: sd + 800 + q, t, w: 3, closed: true, amp: 1.5 }) + ' ') : (sbR += inkPath(pts, { seed: sd + 800 + q, t, w: 3, closed: true, amp: 1.5 }) + ' '));
            }
          }
          smokeBackF.setAttribute('d', sbF); smokeBackR.setAttribute('d', sbR);
          shellE.setAttribute('d', shells); flashF.setAttribute('d', flF); flashR.setAttribute('d', flR);
          colF.setAttribute('d', cF); colR.setAttribute('d', cR); plumeF.setAttribute('d', plF); plumeR.setAttribute('d', plR);
          smokeF.setAttribute('d', smF); smokeR.setAttribute('d', smR); rings.setAttribute('d', rg); debris.setAttribute('d', db); boom.setAttribute('d', bm);
          // headland + Kaşif
          if (headF) {
            headF.setAttribute('d', inkLoop(headPts, { seed: sd + 900, t, amp: 1.2 }));
            headR.setAttribute('d', inkPath(headPts.slice(0, 8), { seed: sd + 900, t, w: 5, amp: 1.2 }) + ' ' +
              [[0.2, 20], [0.5, 60], [0.75, 120], [0.4, 180], [0.7, 250]].map(([u, dy], i) => inkPath([[HW * u - 30, HT + dy], [HW * u + 20, HT + dy - 6]], { seed: sd + 910 + i, t, w: 3, amp: 0.8 })).join(' '));
          }
          if (kas) { const K = kas.K; driveKasif(kas, cues, lt, t, (K.x ?? 0.08) * W, K.y != null ? K.y * H : HT + 2, words); }
          // labels
          labels.forEach(lb => {
            const L = lb.L, at = atOr(cues, L.at, 0.4 + lb.k * 0.3), p = spring(lt, at, 0.6), b = boil(sd + 950 + lb.k, t, 1);
            const x = (L.x ?? 0.5) * W + b[0], y = (L.y ?? 0.2) * H + b[1];
            lb.t.style.opacity = clamp01(p * 2);
            lb.t.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${L.rot || -2}) scale(${lerp(0.6, 1, p).toFixed(3)})`);
            const tw = lb.t.getComputedTextLength ? lb.t.getComputedTextLength() : 200, up = prog(lt, at + 0.2, 0.5);
            lb.u.setAttribute('d', up > 0.01 ? inkPath([[x - tw / 2, y + 16], [x - tw / 2 + tw * up, y + 12]], { seed: sd + 960 + lb.k, t, w: 5 }) : '');
          });
          if (counter) {
            const C = counter.C, at = atOr(cues, C.at, 0.3), p = spring(lt, at, 0.5);
            const done = mines.filter(m => lt >= m.tDrop).length;
            counter.num.textContent = String(done);
            const cx = (C.x ?? 0.5) * W, cy = (C.y ?? 0.17) * H, fs = C.size || 120;
            counter.num.setAttribute('x', cx + 20); counter.num.setAttribute('y', cy);
            counter.lab.setAttribute('x', cx + 40); counter.lab.setAttribute('y', cy - 6);
            const bp = [[cx - 160, cy - fs * 0.92], [cx + 250, cy - fs * 0.95], [cx + 254, cy + 30], [cx - 156, cy + 34]];
            counter.box.setAttribute('d', inkLoop(bp, { seed: sd + 980, t, smooth: false }));
            counter.boxR.setAttribute('d', inkPath(bp, { seed: sd + 980, t, closed: true, w: 4, smooth: false }));
            const pk = done >= mines.length && mines.length ? punch(lt, mines[mines.length - 1].tDrop, 0.6) : 0;
            counter.g.style.opacity = clamp01(p * 2);
            counter.g.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${(lerp(0.7, 1, p) * (1 + 0.12 * pk)).toFixed(3)}) translate(${f1(-cx)} ${f1(-cy)})`);
          }
        },
      };
    },
  };

  // ================================================================== nus_b_fort
  SH.nus_b_fort = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const sd = seed * 1000, GY = 0.8 * H, SEA = 0.5 * H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const r0 = rng(seed * 7 + 11);
      // far sea + distant ships
      const seaLine = mk(world, INK.inkSoft), seaWaves = mk(world, INK.inkSoft, { 'fill-opacity': 0.7 });
      const fleet = Array.from({ length: P.fleet ?? 3 }, (_, i) => ({ i, x: (0.1 + i * 0.16) * W, s: 0.36 - i * 0.04 }));
      const fleetG = el(world, 'g');
      const fleetShips = fleet.map((f, i) => makeShip(fleetG, defs, { kind: 'battle', flag: i % 2 ? 'gb' : 'fr', funnels: 2 + (i % 2) }, i, seed + 50, SEA + 10));
      const farFx = mk(world, INK.gold), farSmF = mk(world, INK.paperDark, { 'fill-opacity': 0.85 }), farSmR = mk(world, INK.inkSoft);
      // ground behind the wall
      const groundF = mk(world, INK.paperDark), groundR = mk(world, INK.inkSoft);
      // cannon + carriage
      const gunG = el(world, 'g');
      const barrelF = mk(gunG, INK.inkSoft), barrelR = mk(gunG), wheelF = mk(world, INK.paperLight), wheelR = mk(world), carF = mk(world, INK.paperDark), carR = mk(world);
      // gunners
      const gunners = Array.from({ length: P.gunners ?? 2 }, (_, i) => KASIF.create(el(world, 'g'), { scale: 0.58, hat: false, beard: i === 0 ? 'short' : null, seed: seed + 20 + i }));
      // wall (in front)
      const wallF = mk(world, INK.paperLight), wallR = mk(world), wallBlocks = mk(world, INK.inkSoft);
      const WX0 = 0.36 * W, WTOP = 0.6 * H;
      const wallPts = [[WX0, H + 20], [WX0 + 10, WTOP + 20], [WX0 + 90, WTOP], [WX0 + 90, WTOP - 40], [WX0 + 180, WTOP - 40], [WX0 + 180, WTOP], [WX0 + 420, WTOP], [WX0 + 420, WTOP - 40], [WX0 + 510, WTOP - 40], [WX0 + 510, WTOP], [W + 40, WTOP - 10], [W + 40, H + 20]];
      const blocks = [];
      for (let row = 0; row < 6; row++) for (let c = 0; c < 9; c++) { const x = WX0 + 40 + c * 150 + (row % 2) * 75, y = WTOP + 50 + row * 70; if (x < W) blocks.push([[x, y], [x + 120, y + 2]], [[x + 120, y + 2], [x + 122, y + 60]]); }
      // impacts, smoke, Kaşif, label
      const dustF = mk(world, INK.paperDark, { 'fill-opacity': 0.9 }), dustR = mk(world, INK.inkSoft), rocks = mk(world, INK.ink);
      const flashF = mk(world, INK.gold), flashR = mk(world, INK.red);
      const smF = mk(world, INK.paperDark, { 'fill-opacity': 0.85 }), smR = mk(world, INK.inkSoft);
      let kas = null;
      if (P.kasif) kas = { K: P.kasif, rig: KASIF.create(el(world, 'g'), { scale: P.kasif.scale ?? 0.78, hat: true, seed: seed + 3 }) };
      let label = null;
      if (P.label && P.label.text) {
        const t = el(root, 'text', { 'font-family': INK_FONT, 'font-size': P.label.size || 76, 'text-anchor': 'middle', fill: P.label.color === 'red' ? INK.red : INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = P.label.text;
        label = { L: P.label, t, u: mk(root, INK.red) };
      }
      const pivot = [WX0 + 300, WTOP - 70];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, words = env.words || ctx.words || (typeof WORDS !== 'undefined' ? WORDS : null);
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          // cannon shots: explicit cues + automatic rhythm
          const shots = (P.fire || []).map(c => atOr(cues, c, null)).filter(v => v != null);
          const every = P.every ?? 2.6;
          for (let s = 0.5; s < dur + 1; s += every) shots.push(s);
          const hits = (P.hits || []).map(c => atOr(cues, c, null)).filter(v => v != null);
          for (let s = 1.7; s < dur + 1; s += every * 1.3) hits.push(s);
          let shk = 0;
          hits.forEach(h => { if (lt >= h && lt < h + 0.8) shk = Math.max(shk, Math.exp(-(lt - h) * 5)); });
          const u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, 1.07, u), fx = 0.55 * W, fy = 0.6 * H;
          world.setAttribute('transform', `translate(${f1(Math.sin(t * 57) * 12 * shk + Math.sin(lt * 0.3) * 6)} ${f1(Math.cos(t * 49) * 9 * shk)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // far sea
          const sl = []; for (let i = 0; i <= 20; i++) sl.push([-60 + i * (W + 120) / 20, SEA + Math.sin(i * 1.4 + t) * 3]);
          seaLine.setAttribute('d', inkPath(sl, { seed: sd + 1, t, w: 3.5, amp: 0.8 }));
          let wv = '';
          for (let i = 0; i < 10; i++) { const x0 = ((i * 211 + t * 12) % (W + 100)) - 50, y0 = SEA + 30 + (i % 4) * 40, pts = []; for (let j = 0; j <= 4; j++) pts.push([x0 + j * 12, y0 + Math.sin(j * 1.8 + t * 2) * 3]); wv += inkPath(pts, { seed: sd + 10 + i, t, w: 2.5, amp: 0.6 }) + ' '; }
          seaWaves.setAttribute('d', wv);
          let ff = '', fsF = '', fsR = '';
          fleetShips.forEach((sh, i) => {
            const f = fleet[i], x = f.x + Math.sin(t * 0.2 + i) * 10;
            sh.draw(x, SEA + Math.sin(t * 1.3 + i) * 1.5, 0, 1, f.s, t, {});
            const period = 1.3 + i * 0.37, age = ((lt + i * 0.5) % period);
            const gp = sh.at([246, -47], x, SEA, 0, 1, f.s);
            if (age < 0.25) ff += inkDot(gp[0] + 6, gp[1], 14 * (1 - age * 3), 10 * (1 - age * 3) + 1, sd + 30 + i, t) + ' ';
            const pp = puffPts(gp[0] + 10 + age * 20, gp[1] - age * 20, 6 + age * 14, sd + 40 + i);
            fsF += inkLoop(pp, { seed: sd + 40 + i, t, amp: 0.6 }) + ' '; fsR += inkPath(pp, { seed: sd + 40 + i, t, w: 2, closed: true, amp: 0.6 }) + ' ';
          });
          farFx.setAttribute('d', ff); farSmF.setAttribute('d', fsF); farSmR.setAttribute('d', fsR);
          // ground
          const gpts = [[-40, SEA + 150], [W * 0.2, SEA + 170], [W * 0.4, SEA + 120], [W + 40, SEA + 90], [W + 40, H + 40], [-40, H + 40]];
          groundF.setAttribute('d', inkLoop(gpts, { seed: sd + 50, t, amp: 1 }));
          groundR.setAttribute('d', inkPath(gpts.slice(0, 4), { seed: sd + 50, t, w: 4, amp: 1 }));
          // cannon recoil
          let rec = 0, last = -9;
          shots.forEach(s => { if (lt >= s && s > last) last = s; });
          const age = lt - last;
          if (age >= 0 && age < 1.2) rec = Math.exp(-age * 6) * 40;
          const [px, py] = pivot, ang = -8 * Math.PI / 180;
          const bx = px + rec, by = py;
          const barrel = [[bx + 60, by - 22], [bx - 300, by - 14 - 40], [bx - 306, by + 10 - 40], [bx + 70, by + 22]].map(q => q);
          barrelF.setAttribute('d', inkLoop(barrel, { seed: sd + 60, t, amp: 0.8, smooth: false }));
          barrelR.setAttribute('d', inkPath(barrel, { seed: sd + 60, t, closed: true, w: 5, amp: 0.8, smooth: false }) + ' ' + inkPath([[bx - 120, by - 30], [bx - 118, by + 2]], { seed: sd + 61, t, w: 4 }));
          const car = [[px - 60, py + 10], [px + 120, py + 6], [px + 140, py + 70], [px - 80, py + 74]];
          carF.setAttribute('d', inkLoop(car, { seed: sd + 62, t, amp: 0.8, smooth: false }));
          carR.setAttribute('d', inkPath(car, { seed: sd + 62, t, closed: true, w: 5, amp: 0.8, smooth: false }));
          wheelF.setAttribute('d', inkCircle(px + 30 + rec * 0.3, py + 60, 44, sd + 63, t, { fill: true }));
          wheelR.setAttribute('d', inkCircle(px + 30 + rec * 0.3, py + 60, 44, sd + 63, t, { w: 5 }) + ' ' + [0, 1, 2].map(k => { const a = k * Math.PI / 3 + rec * 0.02; return inkPath([[px + 30 + rec * 0.3 - Math.cos(a) * 40, py + 60 - Math.sin(a) * 40], [px + 30 + rec * 0.3 + Math.cos(a) * 40, py + 60 + Math.sin(a) * 40]], { seed: sd + 64 + k, t, w: 3 }); }).join(' '));
          const muzzle = [bx - 306, by - 42];
          let fl = '', flr = '', sf = '', sr = '';
          if (age >= 0 && age < 0.4) {
            const fr = (1 - age / 0.4) * 90, pts = [];
            for (let q = 0; q < 14; q++) { const a = q / 14 * Math.PI * 2, rr = q % 2 ? fr * 0.4 : fr; pts.push([muzzle[0] - fr * 0.7 + Math.cos(a) * rr, muzzle[1] + Math.sin(a) * rr * 0.8]); }
            fl += inkLoop(pts, { seed: sd + 70, t, amp: 1, smooth: false }) + ' ';
            flr += inkPath(pts, { seed: sd + 70, t, w: 4, closed: true, amp: 1, smooth: false }) + ' ';
          }
          shots.forEach((s, k) => {
            const a2 = lt - s; if (a2 < 0 || a2 > 3) return;
            for (let q = 0; q < 2; q++) { const rr = 26 + a2 * 34 + q * 12, pts = puffPts(muzzle[0] - 40 - a2 * 90 - q * 40, muzzle[1] - a2 * 40 + q * 10, rr, sd + 80 + k * 3 + q); sf += inkLoop(pts, { seed: sd + 80 + q, t, amp: 1 }) + ' '; sr += inkPath(pts, { seed: sd + 80 + q, t, w: 3, closed: true, amp: 1 }) + ' '; }
          });
          // gunners behind the wall (heads + shoulders show over the parapet)
          gunners.forEach((g, i) => {
            const gx = WX0 + 560 + i * 200, since = age >= 0 && age < 0.6 ? age : 1;
            g.update(t, i === 0 ? 'point' : (age >= 0 && age < 0.5 ? 'shock' : 'talk'), { x: gx, y: WTOP + 150, face: -1, since: i === 0 ? lt : since, dir: 14, emotion: i === 0 ? 'angry' : null, mouth: 0 });
          });
          // wall
          wallF.setAttribute('d', inkLoop(wallPts, { seed: sd + 90, t, amp: 1, smooth: false }));
          wallR.setAttribute('d', inkPath(wallPts.slice(0, -1), { seed: sd + 90, t, w: 6, amp: 1, smooth: false }));
          wallBlocks.setAttribute('d', blocks.map((b, i) => inkPath(b, { seed: sd + 100 + i, t, w: 3, amp: 0.8 })).join(' '));
          // shell impacts in front of the wall (dust + flying stones)
          let df = '', dr = '', rk = '';
          hits.forEach((h, k) => {
            const a2 = lt - h; if (a2 < 0 || a2 > 2.4) return;
            const hx = W * (0.04 + ((k * 0.37) % 0.16)), hy = GY + 40;
            if (a2 < 0.3) { const fr = (1 - a2 / 0.3) * 80, pts = []; for (let q = 0; q < 12; q++) { const a = q / 12 * Math.PI * 2, rr = q % 2 ? fr * 0.4 : fr; pts.push([hx + Math.cos(a) * rr, hy - 30 + Math.sin(a) * rr]); } fl += inkLoop(pts, { seed: sd + 120 + k, t, amp: 1, smooth: false }) + ' '; }
            for (let q = 0; q < 3; q++) { const rr = 30 + a2 * 40 + q * 10, pts = puffPts(hx + (q - 1) * 50 + a2 * 30, hy - 40 - a2 * 90 - q * 26, rr, sd + 130 + k * 5 + q); df += inkLoop(pts, { seed: sd + 130 + q, t, amp: 1.2 }) + ' '; dr += inkPath(pts, { seed: sd + 130 + q, t, w: 3, closed: true, amp: 1.2 }) + ' '; }
            if (a2 < 1.2) for (let q = 0; q < 7; q++) { const a = -Math.PI / 2 + (q - 3) * 0.35, v = 520 + q * 40, xx = hx + Math.cos(a) * v * a2, yy = hy - 30 + Math.sin(a) * v * a2 + 700 * a2 * a2; rk += inkDot(xx, yy, 7, 6, sd + 150 + q, t) + ' '; }
          });
          // drifting smoke across the battery
          const SMK = P.smoke ?? 0.6, n = Math.round(SMK * 5);
          for (let q = 0; q < n; q++) {
            const ph = ((t * 0.025 + q / n) % 1), x = -200 + ph * (W + 400), y = SEA - 60 + (q % 3) * 90, r = 110 + (q % 2) * 40, pts = [];
            for (let j = 0; j < 9; j++) { const a = j / 9 * Math.PI * 2; pts.push([x + Math.cos(a) * r * (1 + 0.2 * Math.sin(j * 2.2 + q)), y + Math.sin(a) * r * 0.4]); }
            sf += inkLoop(pts, { seed: sd + 170 + q, t, amp: 1.5 }) + ' '; sr += inkPath(pts, { seed: sd + 170 + q, t, w: 3, closed: true, amp: 1.5 }) + ' ';
          }
          dustF.setAttribute('d', df); dustR.setAttribute('d', dr); rocks.setAttribute('d', rk);
          flashF.setAttribute('d', fl); flashR.setAttribute('d', flr); smF.setAttribute('d', sf); smR.setAttribute('d', sr);
          if (kas) {
            const K = kas.K;
            driveKasif(kas, cues, lt, t, (K.x ?? 0.25) * W, K.y != null ? K.y * H : GY + 60, words);
          }
          if (label) {
            const L = label.L, at = atOr(cues, L.at, dur * 0.6), p = spring(lt, at, 0.6), x = (L.x ?? 0.7) * W, y = (L.y ?? 0.2) * H;
            label.t.style.opacity = clamp01(p * 2);
            label.t.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(-3) scale(${lerp(0.6, 1, p).toFixed(3)})`);
            const tw = label.t.getComputedTextLength ? label.t.getComputedTextLength() : 300, up = prog(lt, at + 0.25, 0.5);
            label.u.setAttribute('d', up > 0.01 ? inkPath([[x - tw / 2, y + 18], [x - tw / 2 + tw * up, y + 14]], { seed: sd + 190, t, w: 6 }) : '');
          }
        },
      };
    },
  };
})();
