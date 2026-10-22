// ag04_dance: a medieval street dancing scene (Strasbourg, July 1518 dancing plague) in the parchment ink style
// (brand/kit/BRAND.md §5; every line boils at 8 Hz via _ink.js). A row of half-timbered gabled houses, the
// cathedral's single spire behind them, cobbles; stick-figure townsfolk (no hats, optional accessory) dance on
// their own: each one cycles through arm-flinging poses on a beat, hops, turns, worried brows. Optional extras:
// the crowd grows on a cue (one dancer -> many), a wooden stage rises behind them with musicians (drummers beat
// drums, a shawm player blows; ink notes float up), some dancers collapse (keel over onto the cobbles), a day
// counter with a sun/moon wheeling across the sky, a red hand-written label, slow camera push + push on a cue.
//
// SHOTS.ag04_dance P: {
//   ground: 0.6 (0..1 H), k: 1 (size of houses + cathedral), houses: 5, cathedral: {x: 0.5} | false, tempo: 0.44 (s per dance beat),
//   faster: {at, tempo: 0.3} (beat speeds up from the cue),
//   crowd: {n0: 1, n: 12 (0 = nobody), at, dur: 2.2, x: [0.08, 0.92], scale: 0.56, first: {x: 0.5, scale: 0.66, female: true},
//          female: 3 (every 3rd dancer is a woman: headscarf tied under the chin + skirt), front_dy: 46 (back row lift, px),
//          list: [{x, scale, back: false, female: false, face: 1|-1 (fixed facing), fall: false (collapses on collapse.at)}]
//          (explicit dancers instead of the automatic rows), turn: true (false = nobody spins round)},
//   collapse: {at, n: 3, step: 0.35} (the first n non-first dancers keel over one by one),
//   stage: {at, x: 0.5, w: 0.62, h: 0.07 (0..1 H, platform height), y: (top, 0..1 H)},
//   musicians: {at, list: ["drum", "shawm", "drum"]} (stand on the stage; without a stage on the ground at the back),
//   days: {at, to: 4, x: 0.5, y: 0.2, size: 110, word: "DAY"} (sun/moon wheel across the sky, counter ticks),
//   cast: [{who: "kasif"|name, accessory, x, y, scale, pose, at, then, to, face, dir, emotion, emotion0, seq,
//           blend: {pose: "shrug", k: 0.5} (hold a mix of the pose with another one, e.g. shock with the hands off the face),
//           thin: 0.8 (gaunt: narrower figure), carry: "basket" (a nearly empty bread basket hanging from the hand)}],
//   signs: [{text, x, at, size: 54}] (hand-painted board on a post standing on the ground),
//   label: {text, x: 0.5, y: 0.2, at, size: 100, color: "red"|"ink", arrow: [x, y]},
//   cam: {z0: 1 (start zoom), zoom: 1.06, focus: [0.5, 0.55], push: {at, zoom: 1.2, focus, dur}}, shake: cue (small shake)
// }
// cues: crowd.at, collapse.at, stage.at, musicians.at, days.at, faster.at, label.at, cast "at"/seq, cam.push.at, shake
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };

  // a set of boiling strokes: add(pts, {w, fill, closed, smooth, col, op}) once, tick(t) re-jitters
  function strokes(parent, seed) {
    const L = [];
    return {
      add(pts, o = {}) {
        const s = { pts, o, k: L.length };
        if (o.fill) s.f = inkEl(parent, o.fill, o.fop != null ? { 'fill-opacity': o.fop } : {});
        if (o.w !== 0) s.r = inkEl(parent, o.col || INK.ink, o.op != null ? { 'fill-opacity': o.op } : {});
        L.push(s); return s;
      },
      tick(t) {
        L.forEach(s => {
          const sd = seed * 37 + s.k * 7, sm = s.o.smooth !== false ? true : false;
          if (s.f) s.f.setAttribute('d', inkLoop(s.pts, { seed: sd, t, amp: s.o.amp ?? 1.4, smooth: sm }));
          if (s.r) s.r.setAttribute('d', inkPath(s.pts, { seed: sd + 1, t, amp: s.o.amp ?? 1.4, w: s.o.w ?? 5, closed: !!s.o.closed, smooth: sm }));
        });
      },
    };
  }

  // a half-timbered house with a jettied upper floor and a steep gable (x centre, base y, width w, height h)
  function house(S, x, by, w, h, r) {
    const f1h = h * 0.38, jet = w * 0.07, top = by - h * 0.66, peak = by - h;
    S.add([[x - w / 2, by], [x - w / 2, by - f1h], [x + w / 2, by - f1h], [x + w / 2, by]], { fill: INK.paperLight, closed: true, smooth: false });
    S.add([[x - w / 2 - jet, by - f1h], [x - w / 2 - jet, top], [x + w / 2 + jet, top], [x + w / 2 + jet, by - f1h]], { fill: INK.paperLight, closed: true, smooth: false });
    S.add([[x - w / 2 - jet * 1.8, top], [x + (r() - 0.5) * 8, peak], [x + w / 2 + jet * 1.8, top]], { fill: INK.red, fop: 0.55, closed: true, smooth: false });
    // timber: posts, braces, beams
    const ux = x - w / 2 - jet, uw = w + jet * 2;
    [0.0, 0.33, 0.66, 1.0].forEach(u => S.add([[ux + uw * u, by - f1h], [ux + uw * u, top]], { w: 4 }));
    S.add([[ux, (by - f1h + top) / 2], [ux + uw, (by - f1h + top) / 2]], { w: 3.5 });
    S.add([[ux + uw * 0.33, by - f1h], [ux + uw * 0.66, top]], { w: 3.5, op: 0.8 });
    S.add([[ux + uw * 0.66, by - f1h], [ux + uw * 0.33, top]], { w: 3.5, op: 0.8 });
    // lattice windows (upper floor) and door + shop window (ground floor)
    [0.165, 0.835].forEach(u => {
      const cx = ux + uw * u, cy = (by - f1h + top) / 2 - 6, s = uw * 0.1;
      S.add([[cx - s, cy - s * 1.2], [cx + s, cy - s * 1.2], [cx + s, cy + s * 0.6], [cx - s, cy + s * 0.6]], { fill: INK.paperDark, w: 3.5, closed: true, smooth: false });
    });
    const dx = x + (r() < 0.5 ? -1 : 1) * w * 0.2;
    S.add([[dx - w * 0.11, by], [dx - w * 0.11, by - f1h * 0.78], [dx + w * 0.11, by - f1h * 0.78], [dx + w * 0.11, by]], { fill: INK.paperDark, w: 4, closed: true, smooth: false });
    // a gable window
    const gy = (top + peak) / 2 + (top - peak) * 0.12;
    S.add(inkEllipsePts(x, gy, w * 0.07, w * 0.07, 3, 9), { fill: INK.paperDark, w: 3, closed: true });
  }

  // Strasbourg cathedral: big west front, rose window, one tall north tower with an openwork spire
  function cathedral(S, x, by, s) {
    const fw = 230 * s, fh = 420 * s, ty = by - fh;
    const tw = 90 * s, tx = x - fw / 2 + tw / 2 + 6 * s;
    S.add([[x - fw / 2, by], [x - fw / 2, ty], [x + fw / 2, ty], [x + fw / 2, by]], { fill: INK.paperDark, fop: 0.75, col: INK.inkSoft, w: 4, closed: true, smooth: false });
    S.add(inkEllipsePts(x + 10 * s, ty + fh * 0.32, 44 * s, 44 * s, 5, 14), { fill: INK.paperLight, col: INK.inkSoft, w: 4, closed: true });
    S.add([[tx - tw / 2, ty], [tx - tw / 2, ty - 190 * s], [tx + tw / 2, ty - 190 * s], [tx + tw / 2, ty]], { fill: INK.paperDark, fop: 0.75, col: INK.inkSoft, w: 4, closed: true, smooth: false });
    S.add([[tx - tw / 2, ty - 190 * s], [tx, ty - 430 * s], [tx + tw / 2, ty - 190 * s]], { fill: INK.paperDark, fop: 0.75, col: INK.inkSoft, w: 4, closed: true, smooth: false });
    for (let i = 1; i < 5; i++) S.add([[tx - tw / 2 * (1 - i / 5.5), ty - 190 * s - 240 * s * i / 5.5], [tx + tw / 2 * (1 - i / 5.5), ty - 190 * s - 240 * s * i / 5.5]], { col: INK.inkSoft, w: 3 });
    [-0.3, 0.05, 0.4].forEach(u => S.add([[x + fw * u - 14 * s, by], [x + fw * u - 14 * s, by - 90 * s], [x + fw * u, by - 116 * s], [x + fw * u + 14 * s, by - 90 * s], [x + fw * u + 14 * s, by]], { col: INK.inkSoft, w: 3 }));
  }

  // music note glyph points (head + stem + flag) around (x, y), size k
  const noteHead = (x, y, k, sd) => inkEllipsePts(x, y, 15 * k, 11 * k, sd, 8, -0.4);

  // ---- cast (narrator + period figures), same contract as the stage cast
  function castMake(parent, list, seed, portrait) {
    return (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const sc = m.scale ?? (portrait ? 0.62 : 0.5);
      const wrap = el(parent, 'g');
      const rig = KASIF.create(el(wrap, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 });
      let carry = null;
      if (m.carry) {
        const cg = el(wrap, 'g'), S = strokes(cg, seed + 900 + i);
        // nearly empty bread basket: handle, woven body, one small heel of bread inside
        S.add([[-46, 0], [-40, -62], [0, -84], [40, -62], [46, 0]], { w: 5 });
        S.add(inkEllipsePts(-8, 4, 26, 12, 7, 9, -0.2), { fill: INK.stain, w: 4, closed: true });
        S.add([[-62, 0], [62, 0], [48, 62], [-48, 62]], { fill: INK.paperDark, w: 5, closed: true, smooth: false });
        S.add([[-56, 22], [56, 22]], { w: 3, op: 0.7 }); S.add([[-52, 42], [52, 42]], { w: 3, op: 0.7 });
        [-30, 0, 30].forEach(u => S.add([[u, 2], [u * 0.8, 60]], { w: 3, op: 0.6 }));
        carry = { g: cg, S };
      }
      return { m, sc, rig, wrap, carry };
    });
  }
  function castUpdate(cast, lt, t, cues, W, H, G, dur) {
    cast.forEach(c => {
      const m = c.m;
      let pose = m.pose || 'idle', since = lt, x = (m.x ?? 0.8) * W, face = m.face === 'left' ? -1 : 1, emotion = m.emotion0 || null, dir = m.dir, prevPose = null, at = null;
      const at0 = atOr(cues, m.at, null);
      const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
      if (moving && (at0 == null || lt < at0)) x = lerp(x, m.to * W, clamp01(lt / Math.max(0.3, at0 ?? dur)));
      else if (m.to != null) x = m.to * W;
      if (at0 != null && lt >= at0) { prevPose = pose; pose = m.then || 'point'; since = lt - at0; at = at0; emotion = m.emotion || (pose === 'shock' ? 'surprised' : null); }
      (m.seq || []).forEach(sq => {
        const sa = atOr(cues, sq.at, null);
        if (sa == null || lt < sa) return;
        prevPose = pose; at = sa; since = lt - sa;
        const x0 = x;
        pose = sq.pose || pose;
        if (sq.face) face = sq.face === 'left' ? -1 : 1;
        if (sq.emotion) emotion = sq.emotion;
        if (sq.dir != null) dir = sq.dir;
        if (sq.to != null) x = lerp(x0, sq.to * W, clamp01((lt - sa) / (sq.dur ?? 1.2)));
      });
      const y = m.y != null ? m.y * H : G + 6;
      const dd = typeof dir === 'number' ? dir : DIRS[dir] ?? 30;
      const o = { x, y, face, since, dir: dd, emotion };
      if (pose === 'walk' || pose === 'run') o.ph = lt / (pose === 'run' ? 0.55 : 0.9);
      if (at != null && since < 0.32 && prevPose) { o.prev = { pose: prevPose, since: at, dir: dd, ph: o.ph }; o.mix = since / 0.32; }
      if (m.blend && !(o.prev && o.mix < 1)) { o.prev = { pose: m.blend.pose || 'shrug', since: 1, dir: dd }; o.mix = 1 - (m.blend.k ?? 0.5); }
      const res = c.rig.update(t, pose, o);
      c.wrap.setAttribute('transform', m.thin ? `translate(${f1(x)} 0) scale(${m.thin} 1) translate(${f1(-x)} 0)` : '');
      if (c.carry) {
        const s = c.sc, hd = res.hands[1];
        c.carry.g.setAttribute('transform', `translate(${f1(x + face * s * hd[0])} ${f1(y + s * hd[1] + 14 * s)}) scale(${(s * 1.25).toFixed(3)})`);
        c.carry.S.tick(t);
      }
    });
  }

  const DANCE = ['wave', 'run', 'point', 'shrug', 'wave', 'shock', 'run', 'point'];
  const ACCS = [null, 'beret', null, null, 'beret', null];

  SH.ag04_dance = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W;
      const G = (P.ground ?? (portrait ? 0.6 : 0.82)) * H;
      const r = rng(seed * 13 + 3);
      const cam = el(svg, 'g');
      const farG = el(cam, 'g'), houseG = el(cam, 'g'), skyG = el(cam, 'g'), stageG = el(cam, 'g'), musG = el(cam, 'g'),
        instG = el(cam, 'g'), noteG = el(cam, 'g'), backG = el(cam, 'g'), frontG = el(cam, 'g'), castG = el(cam, 'g');
      const uiG = el(svg, 'g');

      // ---- background: cathedral, houses, cobbles
      const SF = strokes(farG, seed + 1), SHs = strokes(houseG, seed + 2);
      const KS = P.k ?? 1, hb = G - (portrait ? 70 : 60) * KS;
      if (P.cathedral !== false) cathedral(SF, (P.cathedral && P.cathedral.x != null ? P.cathedral.x : 0.5) * W, hb - 40 * KS, (portrait ? 0.85 : 0.62) * KS);
      const nh = Math.max(3, Math.min(7, P.houses ?? 5)), hw = W * 1.08 / nh;
      for (let i = 0; i < nh; i++) {
        const hh = (portrait ? 430 : 330) * KS * (0.85 + r() * 0.3);
        if (P.cathedral !== false && Math.abs(-0.04 + 1.08 * (i + 0.5) / nh - (P.cathedral && P.cathedral.x != null ? P.cathedral.x : 0.5)) < 0.12) continue;   // a gap: the square in front of the cathedral
        house(SHs, -W * 0.04 + hw * (i + 0.5), hb, hw * 0.86, hh, r);
      }
      SHs.add([[-20, hb], [W + 20, hb]], { w: 5 });
      SHs.add([[-20, G + 10], [W * 0.3, G + 6], [W * 0.7, G + 12], [W + 20, G + 8]], { w: 6 });
      for (let i = 0; i < 16; i++) {          // cobbles between the house line and the ground line
        const cx = W * (i + 0.5) / 16 + (r() - 0.5) * 20, cy = lerp(hb + 18, G - 8, r());
        SHs.add(inkEllipsePts(cx, cy, 16 + r() * 8, 7, 40 + i, 8), { w: 3, op: 0.55, closed: true });
      }
      for (let i = 0; i < 10; i++) {          // foreground cobbles below the ground line (stay above the caption band)
        const cx = W * (i + 0.5) / 10 + (r() - 0.5) * 30, cy = G + 34 * KS + r() * (portrait ? 40 : 30) * KS;
        if (portrait && ((cy > 1160 && cy < 1330) || cy > 1490)) continue;
        SHs.add(inkEllipsePts(cx, cy, 26 + r() * 10, 9, 80 + i, 8), { w: 3, op: 0.45, closed: true });
      }

      // ---- signs on posts
      const signs = (P.signs || []).map((sg, i) => {
        const g = el(houseG, 'g'), S = strokes(g, seed + 60 + i), x = (sg.x ?? 0.8) * W, sz = sg.size || 54;
        const bw = Math.max(200, (sg.text || '').length * sz * 0.52 + 60), bt = G - 330 * KS, bh = sz * 1.9;
        S.add([[x, G + 6], [x + 2, bt + bh]], { w: 9 });
        S.add([[x - bw / 2, bt], [x + bw / 2, bt - 4], [x + bw / 2 + 3, bt + bh], [x - bw / 2 + 2, bt + bh + 3]], { fill: INK.paperLight, w: 5, closed: true, smooth: false });
        const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': sz, 'text-anchor': 'middle', fill: INK.ink, x: f1(x), y: f1(bt + bh * 0.66) });
        tx.textContent = sg.text || '';
        return { g, S, sg };
      });

      // ---- sky: sun / moon wheel + day counter
      const D = P.days || null;
      let sunF = null, sunR = null, moonF = null, rays = [], dayTx = null;
      if (D) {
        sunF = inkEl(skyG, INK.gold); sunR = inkEl(skyG); moonF = inkEl(skyG, INK.paperLight);
        for (let i = 0; i < 8; i++) rays.push(inkEl(skyG, INK.gold));
        dayTx = el(uiG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': D.size || 110, 'text-anchor': 'middle',
          fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
      }

      // ---- stage platform + musicians
      const ST = P.stage || null;
      const stTop = ST ? (ST.y != null ? ST.y * H : G - (portrait ? 150 : 110)) : G - 40;
      const stX = (ST && ST.x != null ? ST.x : 0.5) * W, stW = (ST && ST.w != null ? ST.w : 0.62) * W;
      const SS = strokes(stageG, seed + 3);
      if (ST) {
        SS.add([[stX - stW / 2, stTop], [stX + stW / 2, stTop], [stX + stW / 2, G - 30], [stX - stW / 2, G - 30]], { fill: INK.paperDark, closed: true, smooth: false });
        for (let i = 1; i < 6; i++) SS.add([[stX - stW / 2 + stW * i / 6, stTop + 6], [stX - stW / 2 + stW * i / 6 + 3, G - 34]], { w: 3, op: 0.7 });
        SS.add([[stX - stW / 2 - 14, stTop], [stX + stW / 2 + 14, stTop]], { w: 7 });
      }
      const MU = P.musicians || null;
      const mus = (MU ? (MU.list || ['drum', 'shawm', 'drum']) : []).map((kind, i, a) => {
        const sc = (MU && MU.scale) || (portrait ? 0.56 : 0.44), x = stX + stW * ((i + 0.5) / a.length - 0.5) * 0.8;
        const rig = KASIF.create(el(musG, 'g'), { scale: sc, hat: false, accessory: i % 2 ? 'beret' : null, seed: seed + 300 + i * 17 });
        const g = el(instG, 'g'), S = strokes(g, seed + 400 + i);
        if (kind === 'drum') {
          S.add([[-46, -30], [46, -30], [42, 40], [-42, 40]], { fill: INK.red, fop: 0.85, closed: true, smooth: false });
          S.add(inkEllipsePts(0, -30, 46, 12, 5, 10), { fill: INK.paperLight, w: 4, closed: true });
          S.add([[-42, -26], [-14, 38], [14, -26], [42, 38]], { w: 3, smooth: false });
        } else {
          S.add([[0, 0], [150, 0]], { w: 9 });
          S.add([[150, -6], [196, -26], [196, 26], [150, 6]], { fill: INK.gold, w: 4, closed: true, smooth: false });
        }
        return { kind, x, sc, rig, g, S, i };
      });
      const notes = [];
      if (MU) for (let i = 0; i < 7; i++) {
        const g = el(noteG, 'g');
        notes.push({ g, head: inkEl(g, INK.ink), stem: inkEl(g, INK.ink), flag: inkEl(g, INK.ink), x0: (r() - 0.5) * stW * 0.9, ph: r(), k: 0.9 + r() * 0.6 });
      }

      // ---- dancers
      const C = Object.assign({ n0: 1, n: 1, at: null, dur: 2.2, x: [0.08, 0.92], scale: portrait ? 0.56 : 0.44, female: 3, front_dy: portrait ? 46 : 34 }, P.crowd || {});
      const LIST = Array.isArray(C.list) ? C.list : null;
      const nD = LIST ? LIST.length : Math.max(0, Math.min(18, C.n));
      const dancers = [];
      for (let i = 0; i < nD; i++) {
        const first = i === 0;
        let x, y, sc;
        const L = LIST ? LIST[i] : null;
        if (L) {
          x = (L.x ?? 0.5) * W; sc = L.scale ?? C.scale; y = L.back ? G - C.front_dy : G + 4;
        } else if (first) {
          x = (C.first && C.first.x != null ? C.first.x : (C.x[0] + C.x[1]) / 2) * W;
          sc = (C.first && C.first.scale) || C.scale * 1.18; y = G + 4;
        } else {
          const row = i % 2;                     // 0 = back row, 1 = front row
          const slot = Math.floor((i - 1) / 2), slots = Math.ceil((nD - 1) / 2);
          let u = (slot + 0.5) / Math.max(1, slots) + (r() - 0.5) * 0.08;
          if (row) u = 1 - u;
          x = lerp(C.x[0], C.x[1], clamp01(u)) * W;
          sc = C.scale * (row ? 1.04 : 0.84) * (0.92 + r() * 0.14);
          y = row ? G + 4 : G - C.front_dy;
        }
        const wrap = el(L ? (L.back ? backG : frontG) : first || i % 2 ? frontG : backG, 'g');
        const fem = L ? !!L.female : first ? (!C.first || C.first.female !== false) : (C.female && i % C.female === C.female - 1);
        const col = first ? INK.blue : [INK.green, INK.blue, INK.red][i % 3], skirtC = first ? INK.green : [INK.red, INK.green, INK.blue][i % 3];
        const hood = fem ? inkEl(wrap, col) : null;          // headscarf, back part (frames the face)
        const rig = KASIF.create(el(wrap, 'g'), { scale: sc, hat: false, accessory: first || fem ? null : ACCS[i % ACCS.length], beard: !first && !fem && i % 5 === 3 ? 'short' : null, seed: seed + 600 + i * 19 });
        const fz = fem ? { skirtF: inkEl(wrap, skirtC), skirtR: inkEl(wrap), capF: inkEl(wrap, col), capR: inkEl(wrap), knot: inkEl(wrap, col), hoodR: null } : null;
        dancers.push({ i, x, y, sc, rig, wrap, hood, fz, off: r() * 3, ord: L ? (L.fall ? 1 : 0) : first ? 0 : i, L, fall: L ? !!L.fall : null });
      }
      const castL = castMake(castG, P.cast, seed + 50, portrait);

      // label
      const LB = P.label || null;
      let lbT = null, lbU = null, lbA = null;
      if (LB) {
        lbT = el(uiG, 'text', { 'font-family': INK_FONT, 'font-size': LB.size || 100, 'text-anchor': 'middle', fill: LB.color === 'ink' ? INK.ink : INK.red,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 12px; stroke-linejoin: round` });
        lbT.textContent = LB.text || '';
        lbU = inkEl(uiG, LB.color === 'ink' ? INK.ink : INK.red);
        if (LB.arrow) lbA = inkEl(uiG, LB.color === 'ink' ? INK.ink : INK.red);
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // camera
          const Pc = P.cam || {}, F0 = Pc.focus || [0.5, 0.55];
          let z = lerp(Pc.z0 ?? 1, Pc.zoom ?? 1.06, progIO(lt, 0, Math.max(1.5, dur))), fx = F0[0] * W, fy = F0[1] * H;
          if (Pc.push) {
            const pa = atOr(cues, Pc.push.at, null);
            if (pa != null) { const pp = progIO(lt, pa, Pc.push.dur ?? 1.2), F1 = Pc.push.focus || F0; z = lerp(z, Pc.push.zoom ?? 1.2, pp); fx = lerp(fx, F1[0] * W, pp); fy = lerp(fy, F1[1] * H, pp); }
          }
          const shA = atOr(cues, P.shake, null), sh = shA != null && lt >= shA ? 5 * Math.exp(-(lt - shA) * 2.5) : 0;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(t * 37) * sh)} ${f1(fy + Math.cos(t * 41) * sh)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          SF.tick(t); SHs.tick(t);

          // tempo
          let beat = P.tempo ?? 0.44;
          const FA = P.faster ? atOr(cues, P.faster.at, null) : null;
          if (FA != null) beat = lerp(beat, P.faster.tempo ?? 0.3, prog(lt, FA, 1.0));

          // days
          if (D) {
            const da = atOr(cues, D.at, 0.2), to = D.to ?? 4, span = Math.max(0.8, (dur - da) * 0.85);
            const day = lt < da ? 1 : Math.min(to, 1 + Math.floor(clamp01((lt - da) / span) * (to - 1) + 1e-6));
            const cyc = (lt < da ? 0.25 : 0.25 + clamp01((lt - da) / span) * (to - 1)), f = cyc - Math.floor(cyc);
            const ang = Math.PI * (1 - f * 2), cx = W / 2 + Math.cos(ang) * W * 0.42, cy = (portrait ? 0.4 : 0.42) * H - Math.abs(Math.sin(ang)) * H * (portrait ? 0.12 : 0.2);
            const isSun = f < 0.5;
            const sx = isSun ? cx : W / 2 + Math.cos(ang + Math.PI) * W * 0.42, sy = isSun ? cy : (portrait ? 0.4 : 0.42) * H - Math.abs(Math.sin(ang)) * H * (portrait ? 0.12 : 0.2);
            const R = portrait ? 46 : 38;
            sunF.setAttribute('d', inkCircle(sx, sy, R, seed + 71, t, { fill: true }));
            sunR.setAttribute('d', inkCircle(sx, sy, R, seed + 72, t, { w: 5 }));
            moonF.setAttribute('d', isSun ? '' : inkLoop(inkEllipsePts(sx + R * 0.4, sy - R * 0.2, R * 0.82, R * 0.82, seed + 73, 10), { seed: seed + 73, t }));
            sunF.setAttribute('fill', isSun ? INK.gold : INK.inkSoft);
            rays.forEach((ry, k) => {
              const a = k / 8 * Math.PI * 2 + t * 0.6;
              ry.setAttribute('d', isSun ? inkPath([[sx + Math.cos(a) * R * 1.3, sy + Math.sin(a) * R * 1.3], [sx + Math.cos(a) * R * 1.75, sy + Math.sin(a) * R * 1.75]], { w: 6, seed: seed + 80 + k, t }) : '');
            });
            const pk = punch(lt, da + (day - 1) * span / Math.max(1, to - 1), 0.5);
            dayTx.textContent = `${(D.word || 'DAY').toLocaleUpperCase(LOCALE)} ${day}`;
            const b = boil(seed + 90, t, 1.2), dy = (D.y ?? 0.2) * H;
            dayTx.setAttribute('transform', `translate(${f1((D.x ?? 0.5) * W + b[0])} ${f1(dy + b[1])}) scale(${(spring(lt, da, 0.6) * (1 + 0.12 * pk)).toFixed(3)})`);
            dayTx.style.display = lt >= da ? '' : 'none';
          }

          // stage rises
          if (ST) {
            const sa = atOr(cues, ST.at, 0), p = spring(lt, sa, 0.8);
            stageG.style.display = lt >= sa ? '' : 'none';
            stageG.setAttribute('transform', `translate(0 ${f1((1 - p) * 140)})`);
            SS.tick(t);
          }
          // musicians
          if (MU) {
            const ma = atOr(cues, MU.at, 0), on = lt >= ma;
            musG.style.display = instG.style.display = noteG.style.display = on ? '' : 'none';
            if (on) {
              const p = spring(lt, ma, 0.6), ml = lt - ma;
              mus.forEach(m => {
                const face = m.x < stX ? 1 : -1, y = stTop + 4 - (1 - p) * 60;
                let res;
                if (m.kind === 'drum') {
                  const hit = Math.floor(ml / 0.24) % 2, f = (ml % 0.24) / 0.24;
                  res = m.rig.update(t, 'point', { x: m.x, y, face, dir: hit ? -40 : 0, since: 1, emotion: 'happy', prev: { pose: 'point', dir: hit ? 0 : -40, since: 1 }, mix: Math.min(1, f * 2.2) });
                  const hx = res.hands[1][0], hy = res.hands[1][1];
                  m.g.setAttribute('transform', `translate(${f1(m.x + face * m.sc * (hx + 30))} ${f1(y + m.sc * (hy + 70))}) scale(${(m.sc * 1.1).toFixed(3)})`);
                } else {
                  res = m.rig.update(t, 'point', { x: m.x, y, face, dir: 18 + Math.sin(ml * 5) * 6, since: 1, emotion: 'happy' });
                  const hd = res.head, hn = res.hands[1];
                  const mx = hd[0] + 20, my = hd[1] + 40, a = Math.atan2(hn[1] - my, hn[0] - mx) * 180 / Math.PI;
                  m.g.setAttribute('transform', `translate(${f1(m.x + face * m.sc * mx)} ${f1(y + m.sc * my)}) scale(${(face * m.sc).toFixed(3)} ${m.sc.toFixed(3)}) rotate(${f1(a)})`);
                }
                m.S.tick(t);
              });
              notes.forEach((n, k) => {
                const cyc = 2.4, u = ((ml / cyc + n.ph) % 1), x = stX + n.x0 + Math.sin(u * 7 + k) * 24, y = stTop - 240 - u * (portrait ? 330 : 200);
                const k2 = n.k * (portrait ? 1.3 : 1);
                n.head.setAttribute('d', inkLoop(noteHead(x, y, k2, seed + 500 + k), { seed: seed + 500 + k, t }));
                n.stem.setAttribute('d', inkPath([[x + 13 * k2, y - 2], [x + 14 * k2, y - 62 * k2]], { w: 5, seed: seed + 520 + k, t }));
                n.flag.setAttribute('d', inkPath([[x + 14 * k2, y - 62 * k2], [x + 34 * k2, y - 46 * k2], [x + 30 * k2, y - 28 * k2]], { w: 5, seed: seed + 540 + k, t }));
                n.g.style.opacity = (Math.min(1, u * 5) * Math.min(1, (1 - u) * 3)).toFixed(3);
              });
            }
          }

          // dancers
          const ca = atOr(cues, C.at, null), n0 = Math.max(1, Math.min(nD, C.n0));
          const CL = P.collapse || null, cla = CL ? atOr(cues, CL.at, null) : null;
          dancers.forEach(d => {
            let appear = 0;
            if (!d.L && d.ord >= n0) appear = ca == null ? 0.15 + d.ord * 0.05 : ca + C.dur * (d.ord - n0) / Math.max(1, nD - n0);
            const vis = lt >= appear;
            d.wrap.style.display = vis ? '' : 'none';
            if (!vis) return;
            const pop = d.ord < n0 ? 1 : spring(lt, appear, 0.5);
            const T = lt + d.off, k = Math.floor(T / beat), f = (T - k * beat) / beat;
            const pose = DANCE[(k + d.i) % DANCE.length], prev = DANCE[(k + d.i + DANCE.length - 1) % DANCE.length];
            const kb = Math.floor(T / (beat * 2)), fb = (T - kb * beat * 2) / 0.14, sg = (kb + d.i) % 2 ? 1 : -1;
            const face = d.L && d.L.face ? d.L.face : C.turn === false ? (d.i % 2 ? -1 : 1) : fb < 1 ? lerp(-sg, sg, fb) : sg;   // quick turn every two beats
            const hop = Math.abs(Math.sin(Math.PI * f)) * 26 * d.sc;
            const dirOf = pz => pz === 'point' ? 70 : 20;
            let fallen = 0;
            if (CL && cla != null && (d.L ? d.fall : d.ord > 0 && d.ord <= (CL.n ?? 3))) fallen = prog(lt, cla + (d.ord - 1) * (CL.step ?? 0.35), 0.55);
            const s = d.sc * pop;
            const fU = fallen > 0 ? (face < 0 ? -1 : 1) : (Math.abs(face) < 0.3 ? (face < 0 ? -0.3 : 0.3) : face);
            const res = d.rig.update(t, fallen > 0.85 ? 'idle' : pose, {
              x: d.x, y: d.y - hop * (1 - fallen), face: fU,
              scale: pop, since: f * beat, dir: dirOf(pose), emotion: fallen > 0.85 ? 'worried' : (d.i % 3 === 1 ? 'surprised' : 'worried'),
              prev: { pose: prev, since: 1, dir: dirOf(prev) }, mix: fallen > 0.85 ? 1 : Math.min(1, f * 2.4) });
            d.wrap.setAttribute('transform', fallen > 0 ? `rotate(${f1(-86 * fallen * (face < 0 ? -1 : 1))} ${f1(d.x)} ${f1(d.y)})` : '');
            if (d.fz) {
              const yE = d.y - hop * (1 - fallen), Tp = (px, py) => [d.x + fU * s * px, yE + s * py];
              const hc = res.head, hp = res.hip, R = 72, sd = seed + 700 + d.i * 11;
              // headscarf: back part around the head down to a point under the chin
              const hood = []; for (let a = -200; a <= 20; a += 20) { const q = a * Math.PI / 180; hood.push(Tp(hc[0] + Math.cos(q) * R * 1.2, hc[1] + Math.sin(q) * R * 1.2)); }
              hood.push(Tp(hc[0] + R * 0.9, hc[1] + R * 0.95), Tp(hc[0], hc[1] + R * 1.3), Tp(hc[0] - R * 0.9, hc[1] + R * 0.95));
              d.hood.setAttribute('d', inkLoop(hood, { seed: sd, t }));
              // front cap over the top of the head down to the brows
              const cap = []; for (let a = -170; a <= -10; a += 20) { const q = a * Math.PI / 180; cap.push(Tp(hc[0] + Math.cos(q) * R * 1.07, hc[1] + Math.sin(q) * R * 1.07)); }
              cap.push(Tp(hc[0] + R * 0.95, hc[1] - R * 0.42), Tp(hc[0] - R * 0.95, hc[1] - R * 0.42));
              d.fz.capF.setAttribute('d', inkLoop(cap, { seed: sd + 1, t }));
              d.fz.capR.setAttribute('d', inkPath(cap, { seed: sd + 2, t, w: 5 * s / 0.6, closed: true }));
              // knot under the chin
              const kc = Tp(hc[0], hc[1] + R * 1.12), kr = R * 0.17 * s;
              d.fz.knot.setAttribute('d', inkLoop(inkEllipsePts(kc[0], kc[1], kr * 1.3, kr, sd + 3, 8), { seed: sd + 3, t }));
              // skirt: waist to knee, flares while hopping
              const fl = 1 + 0.25 * Math.abs(Math.sin(Math.PI * (lt + d.off) / beat)) * (1 - fallen);
              const sk = [Tp(hp[0] - 26, hp[1] - 40), Tp(hp[0] + 30, hp[1] - 40), Tp(hp[0] + 62 * fl, hp[1] + 92), Tp(hp[0], hp[1] + 100), Tp(hp[0] - 62 * fl, hp[1] + 92)];
              d.fz.skirtF.setAttribute('d', inkLoop(sk, { seed: sd + 4, t, smooth: false }));
              d.fz.skirtR.setAttribute('d', inkPath(sk, { seed: sd + 5, t, w: 5 * s / 0.6, closed: true, smooth: false }));
            }
          });

          castUpdate(castL, lt, t, cues, W, H, G, dur);
          signs.forEach(sg => { const a = atOr(cues, sg.sg.at, 0), p = spring(lt, a, 0.6); sg.g.style.display = lt >= a ? '' : 'none';
            sg.g.setAttribute('transform', `translate(0 ${f1((1 - p) * 60)})`); sg.S.tick(t); });

          if (LB) {
            const la = atOr(cues, LB.at, 0.3), p = spring(lt, la, 0.6), pk = punch(lt, la, 0.6);
            const show = lt >= la;
            lbT.style.display = lbU.style.display = show ? '' : 'none';
            if (lbA) lbA.style.display = show ? '' : 'none';
            if (show) {
              const x = (LB.x ?? 0.5) * W, y = (LB.y ?? 0.2) * H, b = boil(seed + 95, t, 1.2), sz = LB.size || 100;
              lbT.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) scale(${(lerp(1.3, 1, p) * (1 + 0.1 * pk)).toFixed(3)}) rotate(-3)`);
              const wd = (lbT.getComputedTextLength ? lbT.getComputedTextLength() || sz * 4 : sz * 4) * 0.5;
              lbU.setAttribute('d', inkPath([[x - wd, y + sz * 0.22], [x - wd + 2 * wd * clamp01((lt - la) / 0.5), y + sz * 0.16]], { w: 7, seed: seed + 96, t }));
              if (lbA) {
                const ax = LB.arrow[0] * W, ay = LB.arrow[1] * H, sx = x, sy = y + sz * 0.35, q = clamp01((lt - la - 0.2) / 0.4);
                const ex = lerp(sx, ax, q), ey = lerp(sy, ay, q), an = Math.atan2(ey - sy, ex - sx);
                lbA.setAttribute('d', q > 0 ? inkPath([[sx, sy], [lerp(sx, ex, 0.5) + 20, lerp(sy, ey, 0.5)], [ex, ey]], { w: 6, seed: seed + 97, t }) + inkPath([[ex - Math.cos(an - 0.5) * 34, ey - Math.sin(an - 0.5) * 34], [ex, ey], [ex - Math.cos(an + 0.5) * 34, ey - Math.sin(an + 0.5) * 34]], { w: 6, seed: seed + 98, t }) : '');
              }
            }
          }
        },
      };
    },
  };
})();
