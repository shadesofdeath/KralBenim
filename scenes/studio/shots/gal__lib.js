// gal__lib: shared ink drawings for the gal_a_* / gal_b_* shots (02-galileo-teleskop, Galileo's telescope 1609-1633).
// Not a shot type itself. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils
// at 8 Hz via _ink.js, everything is a pure function of (seed, t); no Math.random. Parametric: any early-modern
// astronomy / scholar / church-court story can use it.
//
// window.GAL = {
//   atOr(cues, name|sec, fb), f1, faceOf(v, fb), dirOf(v), TAU, pop(lt, at, d) (spring 0..1, 1 when at == null)
//
//   person(parent, m, seed) -> {update(lt, t, cues, W, H) -> {x, y, face, s, head, hands, hip} (stage px) | null}
//     A KASIF rig + period costume. m = {
//       who: "kasif" (the narrator, explorer hat) | "galileo" | any name (period figure, no hat),
//       age: "old" | "young" (galileo only: grey full beard vs short dark beard),
//       robe: "scholar" (long dark academic gown + white collar; galileo's default) | "cardinal" (red cassock + cape) |
//             "senator" (red Venetian toga + dark stole) | "penitent" (plain pale shirt-robe) | "doublet" (short dark
//             doublet + white ruff: Dutch / English figures) | "duke" (gold-trimmed blue mantle) | false,
//       cap: "biretta" (red cardinal cap) | "zucchetto" (small red skullcap) | "scholar" (soft black cap) | "doge" (horned
//            doge cap) | null,   accessory / beard: as KASIF (crown, beret, turban, ... / "grey"|"black"|"short"),
//       x: 0.5 (0..1 W), y: 0.86 (ground, 0..1 H), scale: 0.62, face: "left"|"right", pose: "idle", dir, emotion,
//       text / item (hold), at: cue|sec + then: pose (pose change), seq: [{at, pose, dir, face, emotion, text, item}],
//       moves: [{at, to (0..1 W), dur: 1.6, face}] (walks, faces the way it walks), hide_until: cue|sec,
//       kneel: cue|sec|true (sinks to the knees: the body drops ~110 units, robe folds on the floor),
//       bow: cue|sec (head + torso bow forward ~18°, via pose lean), cane: true (old man's walking stick in the back hand)}
//
//   scope(parent, seed) -> {update(t, o) -> {eye: [x, y], obj: [x, y], ang}}: a 1609 spyglass: long tapered tube (leather
//     brown with gold tooled bands), narrow eyepiece, wider objective with a dark cap ring. o = {x, y (eyepiece px),
//     ang: -30 (deg; 0 = pointing right, negative = up), len: 520, r: 24 (objective radius px), tripod: false | {gy}
//     (wooden tripod on the ground line gy), glint: 0..1 (gold glint running along the tube), face: 1 (-1 mirrors ang)}
//
//   moon(parent, seed) -> {update(t, o)}: the Moon as seen through the glass. o = {x, y, r,
//     term: 0 (terminator: -1 full Moon .. 0 half .. 1 new; lit side on the right when side 1), side: 1,
//     rough: 1 (0 = the "perfect" pearl sphere of the old belief: no craters, a smooth gloss highlight; 1 = craters,
//            dark maria and a ragged terminator), dots: 0 (0..1 light points of mountain peaks appear in the dark side
//            beside the terminator), grow: 0 (0..1 those points grow, slide to the terminator and merge),
//     halo: true (soft ink rings), shade: 0.82 (dark side fill strength), spin: 0 (deg/s slow drift of the features)}
//
//   jupiter(parent, seed) -> {update(t, o)}: banded Jupiter disc + its moons. o = {x, y, r: 46,
//     moons: [{dx, dy: 0, r: 9, k: 1 (0..1 appears with a pop; 0 hidden), label}] (px offsets from the centre),
//     orbits: [{rx, ry, k (0..1 drawn), phase (0..1 where the moon sits), speed (turns/s), mr: 9}] (ellipse orbits whose
//     moons run along them; use instead of `moons` for the "they circle Jupiter" moment), tilt: 0 (deg)}
//
//   stars(parent, seed, n = 40) -> {update(t, x0, y0, x1, y1, k = 1)}: twinkling ink star crosses in a box (k fades in)
//
//   roofs(parent, seed) -> {update(t, o)}: an Italian roofline as a mid plane: houses with tiled pitched roofs, chimneys,
//     shuttered windows, a campanile and a dome. o = {W, gy (base line y), top: gy - 300 (highest ridge), x0: 0, x1: W,
//     kind: "padua" | "venice" (adds water-line posts + an arcade) | "florence" (bigger dome), lights: 0 (0..1 warm lit
//     windows at night), dome: true, tower: true, night: false (darker fill)}
//
//   campanile(parent, seed) -> {update(t, o) -> {top: [x, y] (belfry floor centre), w}}: St Mark's bell tower, Venice:
//     brick shaft with pilaster strips, arched belfry loggia, attic cube, green pyramid spire, gold angel on the tip.
//     o = {x, gy, h: 820, w: 130, k: 1 (0..1 draws itself from the ground up)}
//
//   ship(parent, seed) -> {update(t, x, y (waterline), s = 1, face = 1, o = {sails: 1, flag: "red"|"blue"})}: a carrack
//     with three masts and square sails, gently rocking (~420·s px long)
//
//   lens(parent, defs, seed) -> {view (g, clipped to the circle: draw the view in it), update(t, cx, cy, r, o)}: a round
//     telescope view: brass (gold) ring with tick marks, faint crosshair. o = {ticks: true, cross: false, k: 1 (0..1 the
//     ring opens from a dot), dark: true (ink-soft field inside the circle, the night sky)}
//
//   room(parent, seed) -> {update(t, W, H, o) -> {win: [x, y, w, h] | null, gy}}: an interior filling the frame: back wall
//     (o.kind "plaster" | "stone" ashlar | "wood" panels; o.dark), ceiling beams (beams: false), floor from gy (0.8 H) to the
//     frame bottom (floor: "planks" | "tiles"; floorColor: "stone"), window: {x, y, w, h (0..1), night, view: "roofs", bars}
//     (arched pane; draw a GAL.moon into the returned win box), shelves: [{x, y, w}] (0..1, with round jars/lenses)
//   table(parent, seed) -> {update(t, {x0, x1, y (front top edge px), depth: 70, H, legs: false})}: a wooden table; without
//     legs its front panel runs to the frame bottom (a foreground layer over the caption band)
//   GAL.person hold items: pose "hold" + item "scope" | "letter" | "paper" | "book" | "purse" is drawn by GAL in the front
//     hand (the rig gets "point", dir default -10°, scope 30°); any other item goes to the KASIF rig as before.
//   label(parent, L, W, H, seed) -> {update(lt, t, cues)}: hand-written note. L = {text, x, y (0..1), at, size: 56,
//     color: "ink"|"red"|"blue"|"gold", anchor: "middle", font: "serif" (Fraunces 900) | hand, underline: true,
//     arrow: [x, y] (0..1), box: false (red box behind, paper-light text)}
// }
'use strict';

(() => {
  const TAU = Math.PI * 2;
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const pop = (lt, a, d = 0.7) => a == null ? 1 : spring(lt, a, d);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const line = (pts, seed, t, w = 5, amp = 1.2, taper = 0.3) => inkPath(pts, { w, seed, t, amp, taper });
  // closed outline; short point lists (boxes, roofs: <= 8 points) keep their corners, longer ones (ellipses) are smoothed
  const ring = (pts, seed, t, w = 5, amp = 1.2) => inkPath(pts, { w, seed, t, amp, closed: true, smooth: pts.length > 8 });
  const ROBE = () => ({
    scholar: mix(INK.inkSoft, INK.ink, 0.35), cardinal: INK.red, senator: mix(INK.red, INK.ink, 0.18),
    penitent: INK.paperLight, doublet: mix(INK.inkSoft, INK.ink, 0.45), duke: mix(INK.blue, INK.ink, 0.15),
  });

  // ------------------------------------------------------------------ hand props (GAL.person pose "hold" + item)
  // each draws into a fill path F and an ink path L at the hand (hx, hy); s = figure scale, face, ang (rad, 0 = forward)
  const GITEMS = {
    scope(F, L, hx, hy, s, face, ang, sd, t) {   // a short spyglass held out along the arm direction
      const len = 300 * s, r1 = 22 * s, r0 = 13 * s, ux = Math.cos(ang) * face, uy = Math.sin(ang), nx = -uy, ny = ux;
      const a = [hx - ux * len * 0.35, hy - uy * len * 0.35], b = [hx + ux * len * 0.65, hy + uy * len * 0.65];
      const pts = [[a[0] + nx * r0, a[1] + ny * r0], [b[0] + nx * r1, b[1] + ny * r1], [b[0] - nx * r1, b[1] - ny * r1], [a[0] - nx * r0, a[1] - ny * r0]];
      F.setAttribute('fill', mix(INK.red, INK.ink, 0.45));
      F.setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 0.6, smooth: false }));
      L.setAttribute('d', ring(pts, sd + 1, t, 4, 0.6) + ' ' + line([[b[0] + nx * r1 * 1.1, b[1] + ny * r1 * 1.1], [b[0] - nx * r1 * 1.1, b[1] - ny * r1 * 1.1]], sd + 2, t, 6) + ' ' + inkDot(hx, hy, 11 * s + 4, 10 * s + 4, sd + 3, t));
    },
    letter(F, L, hx, hy, s, face, ang, sd, t) { sheet(F, L, hx, hy, s, face, sd, t, 150, 104, true); },
    paper(F, L, hx, hy, s, face, ang, sd, t) { sheet(F, L, hx, hy, s, face, sd, t, 130, 170, false); },
    book(F, L, hx, hy, s, face, ang, sd, t) {
      const w = 120 * s, h = 160 * s, x0 = hx - w * 0.3 * face, pts = [[x0, hy - h * 0.6], [x0 + w * face, hy - h * 0.62], [x0 + w * face, hy + h * 0.4], [x0, hy + h * 0.42]];
      F.setAttribute('fill', INK.red);
      F.setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 0.6, smooth: false }));
      L.setAttribute('d', ring(pts, sd + 1, t, 4, 0.6) + ' ' + line([[x0 + w * 0.14 * face, hy - h * 0.58], [x0 + w * 0.14 * face, hy + h * 0.4]], sd + 2, t, 3));
    },
    purse(F, L, hx, hy, s, face, ang, sd, t) {
      const r = 46 * s + 8, pts = inkEllipsePts(hx, hy + r * 0.9, r, r * 0.85, sd, 10);
      F.setAttribute('fill', INK.gold);
      F.setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 0.8 }));
      L.setAttribute('d', ring(pts, sd + 1, t, 4, 0.8) + ' ' + line([[hx - r * 0.4, hy + r * 0.1], [hx, hy], [hx + r * 0.4, hy + r * 0.1]], sd + 2, t, 4));
    },
  };
  function sheet(F, L, hx, hy, s, face, sd, t, w0, h0, seal) {
    const w = w0 * s + 20, h = h0 * s + 14, x0 = hx - w * 0.15 * face, pts = [[x0, hy - h * 0.8], [x0 + w * face, hy - h * 0.84], [x0 + w * face, hy + h * 0.2], [x0, hy + h * 0.22]];
    F.setAttribute('fill', INK.paperLight);
    F.setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 0.6, smooth: false }));
    let d = ring(pts, sd + 1, t, 3.5, 0.6);
    for (let k = 1; k < 4; k++) d += ' ' + line([[x0 + w * 0.15 * face, hy - h * 0.8 + h * k * 0.22], [x0 + w * 0.85 * face, hy - h * 0.8 + h * k * 0.22]], sd + 3 + k, t, 2);
    if (seal) d += ' ' + inkDot(x0 + w * 0.5 * face, hy - h * 0.3, 12 * s + 5, 12 * s + 5, sd + 9, t);
    L.setAttribute('d', d);
  }

  // ------------------------------------------------------------------ period figure / narrator
  function person(parent, m, seed) {
    if (!m) return null;
    const g = el(parent, 'g');
    const isK = (m.who || 'kasif') === 'kasif', isG = m.who === 'galileo';
    const robeK = m.robe === undefined ? (isG ? 'scholar' : false) : m.robe;
    const beard = isK ? null : (m.beard || (isG ? (m.age === 'young' ? 'short' : 'grey') : null));
    const back = el(g, 'g');
    const cane = m.cane ? inkEl(back, INK.ink) : null;
    const robeF = robeK ? inkEl(back, ROBE()[robeK] || ROBE().scholar) : null, robeL = robeK ? inkEl(back, INK.ink) : null;
    const trim = robeK ? inkEl(back, robeK === 'senator' ? INK.ink : robeK === 'duke' ? INK.gold : INK.paperLight) : null;
    const rg = el(g, 'g');
    const sc = m.scale ?? 0.62;
    const rig = KASIF.create(rg, { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard, seed: seed * 7 + 3 });
    const capF = m.cap ? inkEl(g, m.cap === 'scholar' ? INK.ink : m.cap === 'doge' ? INK.gold : INK.red) : null, capL = m.cap ? inkEl(g, INK.ink) : null;
    const ruff = (robeK === 'doublet' || robeK === 'scholar') ? inkEl(g, INK.paperLight) : null, ruffL = ruff ? inkEl(g, INK.ink) : null;
    const gait = KASIF.gait ? KASIF.gait('walk') : 120;
    const itemF = inkEl(g, INK.paperLight), itemL = inkEl(g, INK.ink);
    return {
      update(lt, t, cues, W, H) {
        const hu = atOr(cues, m.hide_until, null);
        if (hu != null && lt < hu) { g.style.display = 'none'; return null; }
        g.style.display = '';
        const segs = [{ at: -1, pose: m.pose || 'idle', dir: m.dir, emotion: m.emotion0 || m.emotion, face: m.face, text: m.text, item: m.item }];
        const a = atOr(cues, m.at, null);
        if (m.then && a != null) segs.push({ at: a, pose: m.then, dir: m.dir, emotion: m.emotion, text: m.text, item: m.item });
        (m.seq || []).forEach(s => { const sa = atOr(cues, s.at, null); if (sa != null) segs.push(Object.assign({ text: m.text, item: m.item }, s, { at: sa })); });
        segs.sort((p, q) => p.at - q.at);
        let si = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) si = j;
        const s = segs[si];
        let face = faceOf(s.face, faceOf(m.face, 1)), pose = s.pose || 'idle', since = lt - Math.max(0, s.at), ph = 0;
        let x = m.x ?? 0.5, walked = 0;
        for (const mv of (m.moves || [])) {
          const st = atOr(cues, mv.at, null); if (st == null) continue;
          const d = mv.dur ?? 1.6, u = progIO(lt, st, d), from = x;
          x = lerp(from, mv.to, u); walked += Math.abs(mv.to - from) * u;
          if (lt >= st && lt < st + d) { pose = 'walk'; face = mv.to < from ? -1 : 1; ph = walked * W / (gait * sc); }
          else if (lt >= st + d && mv.face) face = faceOf(mv.face, face);
        }
        // kneel: the whole rig sinks; the robe hem folds onto the floor
        const ka = m.kneel === true ? -1 : atOr(cues, m.kneel, null);
        const kn = ka == null ? 0 : (ka < 0 ? 1 : progIO(lt, ka, 0.7));
        const gy = (m.y ?? 0.86) * H, drop = kn * 110 * sc;
        // GAL props (scope, letter, paper, book, purse) are drawn here in the front hand: the rig gets "point" instead of "hold"
        let gitem = null, sdir = s.dir;
        if (pose === 'hold' && GITEMS[s.item]) { gitem = s.item; pose = 'point'; sdir = s.dir ?? (s.item === 'scope' ? 30 : -10); }
        const o = { x: x * W, y: gy + drop, face, since, ph, dir: dirOf(sdir), text: s.text, item: gitem ? undefined : s.item, emotion: s.emotion || (pose === 'shock' ? 'surprised' : null), mouth: 0 };
        if (si > 0 && since < 0.3 && pose !== 'walk') {
          const pv = segs[si - 1], pc = (pv.pose === 'hold' && GITEMS[pv.item]);
          o.prev = { pose: pc ? 'point' : (pv.pose || 'idle'), since: since + 1, dir: dirOf(pc ? (pv.dir ?? -10) : pv.dir), text: pv.text, item: pc ? undefined : pv.item }; o.mix = since / 0.3;
        }
        const ba = atOr(cues, m.bow, null), bw = ba == null ? 0 : progIO(lt, ba, 0.6);
        rg.setAttribute('transform', bw > 0 ? `rotate(${f1(face * 16 * bw)} ${f1(x * W)} ${f1(gy + drop - 184 * sc)})` : '');
        const res = rig.update(t, pose, o) || {};
        const X = q => x * W + face * sc * q[0], Y = q => gy + drop + sc * q[1];
        const hip = res.hip || [0, -184], head = res.head || [0, -400];
        if (robeF) {
          const top = [hip[0], hip[1] - 132];
          const long = robeK !== 'doublet', hemY = long ? (kn > 0 ? lerp(-20, 0, kn) : -20) : hip[1] + 36;
          const flare = long ? 86 + kn * 50 : 66;
          const pts = [[top[0] - 40, top[1] + 4], [top[0] + 40, top[1] + 4], [hip[0] + 56, hip[1] - 20], [hip[0] + flare, hemY], [hip[0] - flare, hemY], [hip[0] - 56, hip[1] - 20]].map(q => [X(q), Y(q)]);
          robeF.setAttribute('d', inkLoop(pts, { seed: seed + 100, t, amp: 1, smooth: false }));
          let d = inkPath(pts, { w: 5, seed: seed + 101, t, closed: true, smooth: false });
          if (long) for (let k = -1; k <= 1; k += 2) d += ' ' + line([[X([hip[0] + k * 22, hip[1]]), Y([0, hip[1]])], [X([hip[0] + k * 40, hemY - 6]), Y([0, hemY - 6])]], seed + 102 + k, t, 3);
          robeL.setAttribute('d', d);
          // trim: a front band (scholar / penitent: pale; senator: dark stole; duke: gold hem)
          let tr = '';
          if (robeK === 'senator') tr = inkLoop([[X([top[0] - 46, top[1]]), Y([0, top[1]])], [X([top[0] - 20, top[1]]), Y([0, top[1]])], [X([hip[0] - 8, hemY]), Y([0, hemY])], [X([hip[0] - 34, hemY]), Y([0, hemY])]], { seed: seed + 104, t, amp: 0.8, smooth: false });
          else if (robeK === 'duke') tr = inkLoop([[X([hip[0] - flare, hemY - 16]), Y([0, hemY - 16])], [X([hip[0] + flare, hemY - 16]), Y([0, hemY - 16])], [X([hip[0] + flare, hemY]), Y([0, hemY])], [X([hip[0] - flare, hemY]), Y([0, hemY])]], { seed: seed + 104, t, amp: 0.8, smooth: false });
          else if (robeK === 'cardinal') tr = inkLoop([[X([top[0] - 60, top[1] + 2]), Y([0, top[1] + 2])], [X([top[0] + 60, top[1] + 2]), Y([0, top[1] + 2])], [X([top[0] + 72, top[1] + 70]), Y([0, top[1] + 70])], [X([top[0] - 72, top[1] + 70]), Y([0, top[1] + 70])]], { seed: seed + 104, t, amp: 0.8, smooth: false });
          trim.setAttribute('d', tr);
          if (robeK === 'cardinal') trim.setAttribute('fill', mix(INK.red, INK.ink, 0.22));
        }
        if (ruff) {   // white collar (scholar) / ruff (doublet) at the neck
          const nk = [head[0], head[1] + 82], rx = robeK === 'doublet' ? 58 : 46, ry = robeK === 'doublet' ? 20 : 14;
          const pts = inkEllipsePts(X(nk), Y(nk), rx * sc, ry * sc, seed + 110, 12);
          ruff.setAttribute('d', inkLoop(pts, { seed: seed + 110, t, amp: 0.8 }));
          ruffL.setAttribute('d', ring(pts, seed + 111, t, 3.5, 0.8));
        }
        if (capF) {   // cap over the head (head frame: radius 72 units)
          const hx = head[0], ht = head[1] - 66;
          let pts;
          if (m.cap === 'biretta') pts = [[hx - 58, ht + 16], [hx + 58, ht + 16], [hx + 50, ht - 40], [hx + 14, ht - 46], [hx, ht - 58], [hx - 14, ht - 46], [hx - 50, ht - 40]];
          else if (m.cap === 'zucchetto') pts = [[hx - 40, ht + 6], [hx + 40, ht + 6], [hx + 22, ht - 12], [hx - 22, ht - 12]];
          else if (m.cap === 'doge') pts = [[hx - 60, ht + 18], [hx + 60, ht + 18], [hx + 40, ht - 30], [hx - 30, ht - 80], [hx - 52, ht - 30]];
          else pts = [[hx - 64, ht + 18], [hx + 64, ht + 18], [hx + 52, ht - 22], [hx, ht - 36], [hx - 52, ht - 22]];
          const P = pts.map(q => [X(q), Y(q)]);
          capF.setAttribute('d', inkLoop(P, { seed: seed + 120, t, amp: 0.8, smooth: m.cap !== 'biretta' }));
          capL.setAttribute('d', ring(P, seed + 121, t, 4, 0.8) + (m.cap === 'biretta' ? ' ' + inkDot(X([hx, ht - 62]), Y([0, ht - 62]), 9 * sc + 2, 9 * sc + 2, seed + 122, t) : ''));
        }
        if (cane && res.hands) {
          const hb = res.hands.slice().sort((p, q) => face * (p[0] - q[0]))[0];
          cane.setAttribute('d', line([[X(hb), Y(hb)], [X([hb[0] - 10, 0]), Y([0, 0])]], seed + 130, t, 6) + ' ' + line([[X(hb), Y(hb)], [X([hb[0] + 18, hb[1] - 10]), Y([0, hb[1] - 10])]], seed + 131, t, 6));
        }
        const hands = (res.hands || []).map(q => [X(q), Y(q)]);
        if (gitem && hands.length) {
          const fh = hands.slice().sort((p, q) => face * (q[0] - p[0]))[0], ang = -dirOf(sdir) * Math.PI / 180;
          GITEMS[gitem](itemF, itemL, fh[0], fh[1], sc, face, ang, seed + 140, t);
        } else { itemF.setAttribute('d', ''); itemL.setAttribute('d', ''); }
        return { x: x * W, y: gy + drop, face, s: sc, head: [X(head), Y(head)], hip: [X(hip), Y(hip)], hands, item: gitem };
      },
    };
  }

  // ------------------------------------------------------------------ the 1609 spyglass
  function scope(parent, seed) {
    const g = el(parent, 'g');
    const legs = inkEl(g, mix(INK.stain, INK.ink, 0.35)), legsL = inkEl(g);
    const tubeF = inkEl(g, mix(INK.red, INK.ink, 0.45)), tubeHi = inkEl(g, INK.stain, { 'fill-opacity': 0.55 }), bands = inkEl(g, INK.gold), tubeL = inkEl(g);
    const capF = inkEl(g, INK.ink), glassF = inkEl(g, mix(INK.blue, INK.paperLight, 0.45)), eyeF = inkEl(g, INK.ink), gl = inkEl(g, INK.paperLight);
    return {
      update(t, o) {
        const fc = o.face ?? 1, ang = (o.ang ?? -30) * Math.PI / 180, len = o.len ?? 520, r1 = o.r ?? 24, r0 = r1 * 0.55;
        const ux = Math.cos(ang) * fc, uy = Math.sin(ang), nx = -uy, ny = ux;
        const ex = o.x, ey = o.y, ox = ex + ux * len, oy = ey + uy * len;
        const at = (k, side, r) => [ex + ux * len * k + nx * r * side, ey + uy * len * k + ny * r * side];
        const rr = k => lerp(r0, r1, k);
        const body = [at(0.04, 1, rr(0.04)), at(1, 1, rr(1)), at(1, -1, rr(1)), at(0.04, -1, rr(0.04))];
        if (o.tripod) {
          const pk = at(0.55, 0, 0), gy = o.tripod.gy;
          const L = [[pk, [pk[0] - 120, gy]], [pk, [pk[0] + 110, gy]], [pk, [pk[0] + 14, gy + 8]]];
          legs.setAttribute('d', L.map((l, i) => line(l, seed + 10 + i, t, 11, 1)).join(' '));
          legsL.setAttribute('d', inkDot(pk[0], pk[1], 16, 16, seed + 14, t));
        } else { legs.setAttribute('d', ''); legsL.setAttribute('d', ''); }
        tubeF.setAttribute('d', inkLoop(body, { seed: seed + 1, t, amp: 0.8, smooth: false }));
        tubeHi.setAttribute('d', inkLoop([at(0.08, 0.55, rr(0.08)), at(0.97, 0.55, rr(0.97)), at(0.97, 0.2, rr(0.97)), at(0.08, 0.2, rr(0.08))], { seed: seed + 2, t, amp: 0.6, smooth: false }));
        let b = '';
        for (const k of [0.2, 0.42, 0.66, 0.9]) b += inkLoop([at(k, 1.08, rr(k)), at(k + 0.025, 1.08, rr(k)), at(k + 0.025, -1.08, rr(k)), at(k, -1.08, rr(k))], { seed: seed + 20 + k * 100, t, amp: 0.5, smooth: false }) + ' ';
        bands.setAttribute('d', b);
        tubeL.setAttribute('d', inkPath(body, { w: 5, seed: seed + 3, t, closed: true, smooth: false, amp: 0.8 }));
        // objective: dark cap ring + blue glass
        const oc = at(1, 0, 0);
        const ell = (cx, cy, a, bb, n = 12) => { const p = []; for (let i = 0; i < n; i++) { const q = i / n * TAU; p.push([cx + ux * Math.cos(q) * a + nx * Math.sin(q) * bb, cy + uy * Math.cos(q) * a + ny * Math.sin(q) * bb]); } return p; };
        capF.setAttribute('d', inkLoop(ell(oc[0], oc[1], r1 * 0.38, r1 * 1.12), { seed: seed + 4, t, amp: 0.6 }));
        glassF.setAttribute('d', inkLoop(ell(oc[0] + ux * 4, oc[1] + uy * 4, r1 * 0.26, r1 * 0.82), { seed: seed + 5, t, amp: 0.5 }));
        // eyepiece
        const e0 = at(0.04, 0, 0);
        eyeF.setAttribute('d', inkLoop([[e0[0] + nx * r0 * 0.8, e0[1] + ny * r0 * 0.8], [ex - ux * 26 + nx * r0 * 0.6, ey - uy * 26 + ny * r0 * 0.6], [ex - ux * 26 - nx * r0 * 0.6, ey - uy * 26 - ny * r0 * 0.6], [e0[0] - nx * r0 * 0.8, e0[1] - ny * r0 * 0.8]], { seed: seed + 6, t, amp: 0.5, smooth: false }));
        const gk = o.glint ?? 0;
        if (gk > 0 && gk < 1) { const c = at(lerp(0.1, 0.95, gk), 0.5, rr(gk)); gl.setAttribute('d', inkDot(c[0], c[1], 22, 5, seed + 7, t)); }
        else gl.setAttribute('d', '');
        return { eye: [ex - ux * 26, ey - uy * 26], obj: [ox, oy], ang };
      },
    };
  }

  // ------------------------------------------------------------------ the Moon
  function moon(parent, seed) {
    const g = el(parent, 'g');
    const halo = inkEl(g, INK.inkSoft), disc = inkEl(g, INK.paperLight), gloss = inkEl(g, mix(INK.paperLight, INK.gold, 0.18));
    const mare = inkEl(g, mix(INK.paperDark, INK.inkSoft, 0.35)), cratS = inkEl(g, mix(INK.inkSoft, INK.paperDark, 0.25)), cratL = inkEl(g, INK.inkSoft);
    const dark = inkEl(g, mix(INK.ink, INK.inkSoft, 0.3)), dots = inkEl(g, INK.paperLight), dotsG = inkEl(g, INK.gold, { 'fill-opacity': 0.6 }), rim = inkEl(g);
    const q = rng(inkHash(seed, 31337));
    const MARE = [[-0.32, -0.3, 0.3, 0.2], [0.18, -0.25, 0.24, 0.18], [0.08, 0.22, 0.28, 0.17], [-0.34, 0.24, 0.17, 0.13], [0.42, 0.05, 0.12, 0.2]];
    const CR = [];
    for (let i = 0; i < 26; i++) { const u = q() * 1.8 - 0.9, v = q() * 1.8 - 0.9, r = 0.035 + q() * q() * 0.1; if (Math.hypot(u, v) < 0.86 - r) CR.push([u, v, r]); }
    const RAG = Array.from({ length: 21 }, () => q() * 2 - 1);
    const DOTS = Array.from({ length: 9 }, (_, i) => [-0.72 + i * 0.18 + (q() - 0.5) * 0.08, 0.035 + q() * 0.11, 0.6 + q() * 0.6]);
    return {
      update(t, o) {
        const R = o.r, cx = o.x, cy = o.y, side = o.side ?? 1, term = o.term ?? 0, rough = clamp01(o.rough ?? 1);
        const spin = (o.spin ?? 0) * t * Math.PI / 180;
        const P = (u, v) => { const c = Math.cos(spin), s = Math.sin(spin); return [cx + (u * c - v * s) * R, cy + (u * s + v * c) * R]; };
        if (o.halo !== false) {
          let hd = ''; for (let k = 0; k < 3; k++) { const p = (t * 0.22 + k / 3) % 1; hd += inkCircle(cx, cy, R * (1.06 + p * 0.3), seed * 3 + k, t, { w: lerp(3.5, 0.8, p) }) + ' '; }
          halo.setAttribute('d', hd);
        } else halo.setAttribute('d', '');
        const dpts = inkEllipsePts(cx, cy, R, R, seed + 1, 26, 0, 0.008);
        disc.setAttribute('d', inkLoop(dpts, { seed: seed + 1, t, amp: 0.8 }));
        // the old belief: a polished pearl with a gloss highlight
        gloss.setAttribute('d', rough < 0.98 ? inkLoop(inkEllipsePts(cx - R * 0.3, cy - R * 0.32, R * 0.32 * (1 - rough * 0.8), R * 0.22 * (1 - rough * 0.8), seed + 2, 12, -0.6), { seed: seed + 2, t, amp: 0.6 }) : '');
        gloss.setAttribute('fill-opacity', f1((1 - rough) * 0.9 * 100) / 100);
        mare.setAttribute('d', rough > 0.02 ? MARE.map((mm, i) => inkLoop(inkEllipsePts(...P(mm[0], mm[1]), mm[2] * R, mm[3] * R, seed + 10 + i, 11, i * 0.7, 0.12), { seed: seed + 10 + i, t, amp: 1 })).join(' ') : '');
        mare.setAttribute('fill-opacity', f1(rough * 0.75 * 100) / 100);
        let cs = '', cl = '';
        if (rough > 0.02) CR.forEach((c, i) => {
          const r = c[2] * R * Math.min(1, rough * 1.4), p = P(c[0], c[1]);
          cl += inkCircle(p[0], p[1], r, seed + 40 + i, t, { w: Math.max(2, Math.min(4.5, r * 0.14)) }) + ' ';
          // shadow crescent inside the rim, away from the light
          cs += inkLoop([[p[0] - side * r * 0.85, p[1] - r * 0.5], [p[0] - side * r * 0.2, p[1] - r * 0.75], [p[0] - side * r * 0.45, p[1]], [p[0] - side * r * 0.2, p[1] + r * 0.75], [p[0] - side * r * 0.85, p[1] + r * 0.5]], { seed: seed + 70 + i, t, amp: 0.5 }) + ' ';
        });
        cratS.setAttribute('d', cs); cratL.setAttribute('d', cl);
        cratS.setAttribute('fill-opacity', f1(rough * 100) / 100); cratL.setAttribute('fill-opacity', f1(rough * 100) / 100);
        // dark side: from the far limb to the (ragged) terminator
        const N = 20, limb = [], tline = [];
        for (let i = 0; i <= N; i++) {
          const v = -1 + 2 * i / N, w = Math.sqrt(Math.max(0, 1 - v * v));
          limb.push([cx - side * w * R * 1.004, cy + v * R]);
          const rag = rough * RAG[i] * 0.05 * w;
          tline.push([cx + side * (term * w + rag) * R, cy + v * R]);
        }
        const dk = limb.concat(tline.slice().reverse());
        dark.setAttribute('d', term > -0.999 ? inkLoop(dk, { seed: seed + 5, t, amp: 0.5, smooth: false }) : '');
        dark.setAttribute('fill-opacity', f1((o.shade ?? 0.82) * 100) / 100);
        // mountain peaks catching the dawn inside the dark side
        const dk1 = clamp01(o.dots ?? 0), gr = clamp01(o.grow ?? 0);
        let ds = '', dg = '';
        if (dk1 > 0) DOTS.forEach((d, i) => {
          const vis = clamp01(dk1 * DOTS.length - i * 0.8); if (vis <= 0) return;
          const v = d[0], w = Math.sqrt(Math.max(0, 1 - v * v)), off = d[1] * (1 - gr);
          const x = cx + side * (term * w - off) * R, y = cy + v * R, r = R * (0.012 + gr * 0.03) * d[2] * vis * (1 + 0.15 * Math.sin(t * 5 + i));
          ds += inkDot(x, y, r * (1 + gr * 1.2), r, seed + 90 + i, t) + ' ';
          dg += inkDot(x, y, r * 2.2, r * 1.8, seed + 100 + i, t) + ' ';
        });
        dots.setAttribute('d', ds); dotsG.setAttribute('d', dg);
        rim.setAttribute('d', ring(dpts, seed + 6, t, Math.max(4, R * 0.018), 0.8));
      },
    };
  }

  // ------------------------------------------------------------------ Jupiter + moons
  function jupiter(parent, seed) {
    const g = el(parent, 'g');
    const orb = inkEl(g, INK.inkSoft), disc = inkEl(g, mix(INK.paperLight, INK.gold, 0.25)), bandF = inkEl(g, mix(INK.stain, INK.red, 0.25)), rim = inkEl(g);
    const ms = inkEl(g, INK.paperLight), msL = inkEl(g), lab = el(g, 'g');
    const labs = [];
    return {
      update(t, o) {
        const cx = o.x, cy = o.y, r = o.r ?? 46, tl = (o.tilt ?? 0) * Math.PI / 180;
        const pts = inkEllipsePts(cx, cy, r, r * 0.94, seed + 1, 16);
        disc.setAttribute('d', inkLoop(pts, { seed: seed + 1, t, amp: 0.6 }));
        let bd = '';
        for (const [v, h] of [[-0.42, 0.12], [-0.1, 0.16], [0.28, 0.12]]) {
          const w = Math.sqrt(1 - v * v) * 0.96;
          bd += inkLoop([[cx - w * r, cy + v * r], [cx + w * r, cy + v * r], [cx + w * r * 0.98, cy + (v + h) * r], [cx - w * r * 0.98, cy + (v + h) * r]], { seed: seed + 3 + v * 10, t, amp: 0.5 }) + ' ';
        }
        bandF.setAttribute('d', bd);
        rim.setAttribute('d', ring(pts, seed + 2, t, 4.5, 0.6));
        let od = '', md = '', ml = '';
        const list = [];
        (o.orbits || []).forEach((ob, i) => {
          const k = clamp01(ob.k ?? 1); if (k <= 0) return;
          const n = 40, p = [];
          for (let j = 0; j <= Math.ceil(n * k); j++) { const a = j / n * TAU; p.push([cx + Math.cos(a) * ob.rx * Math.cos(tl) - Math.sin(a) * ob.ry * Math.sin(tl), cy + Math.cos(a) * ob.rx * Math.sin(tl) + Math.sin(a) * ob.ry * Math.cos(tl)]); }
          od += line(p, seed + 20 + i, t, 2.4, 0.6, 0.1) + ' ';
          const a = ((ob.phase ?? i * 0.27) + (ob.speed ?? 0.12) * t) * TAU;
          list.push({ x: cx + Math.cos(a) * ob.rx * Math.cos(tl) - Math.sin(a) * ob.ry * Math.sin(tl), y: cy + Math.cos(a) * ob.rx * Math.sin(tl) + Math.sin(a) * ob.ry * Math.cos(tl), r: ob.mr ?? 9, k, behind: Math.sin(a) < 0 });
        });
        (o.moons || []).forEach(mn => list.push({ x: cx + mn.dx, y: cy + (mn.dy ?? 0), r: mn.r ?? 9, k: clamp01(mn.k ?? 1), label: mn.label }));
        orb.setAttribute('d', od);
        list.forEach((mn, i) => {
          if (mn.k <= 0) return;
          const rr = mn.r * Math.min(1.25, spring(mn.k, 0, 1) || mn.k);
          if (mn.behind && Math.hypot(mn.x - cx, mn.y - cy) < r) return;
          md += inkDot(mn.x, mn.y, rr, rr, seed + 40 + i, t) + ' ';
          ml += inkCircle(mn.x, mn.y, rr, seed + 50 + i, t, { w: 3 }) + ' ';
        });
        ms.setAttribute('d', md); msL.setAttribute('d', ml);
        return list;
      },
    };
  }

  // ------------------------------------------------------------------ stars
  function stars(parent, seed, n = 40) {
    const g = el(parent, 'g');
    const st = inkEl(g, INK.paperLight), stI = inkEl(g, INK.gold, { 'fill-opacity': 0.7 });
    const q = rng(inkHash(seed, 777)), S = Array.from({ length: n }, () => [q(), q(), 0.5 + q(), q() * TAU]);
    return {
      update(t, x0, y0, x1, y1, k = 1) {
        let a = '', b = '';
        S.forEach((s, i) => {
          if (i / n > k) return;
          const x = lerp(x0, x1, s[0]), y = lerp(y0, y1, s[1]), tw = 0.6 + 0.4 * Math.sin(t * 2.2 + s[3]), r = 5 * s[2] * tw;
          a += inkLoop([[x, y - r * 2.2], [x + r * 0.5, y - r * 0.5], [x + r * 2.2, y], [x + r * 0.5, y + r * 0.5], [x, y + r * 2.2], [x - r * 0.5, y + r * 0.5], [x - r * 2.2, y], [x - r * 0.5, y - r * 0.5]], { seed: seed + i, t, amp: 0.4, smooth: false }) + ' ';
          if (s[2] > 1.2) b += inkDot(x, y, r * 1.4, r * 1.4, seed + 200 + i, t) + ' ';
        });
        st.setAttribute('d', a); stI.setAttribute('d', b);
      },
    };
  }

  // ------------------------------------------------------------------ Italian roofline (mid plane)
  function roofs(parent, seed) {
    const g = el(parent, 'g');
    const wallF = inkEl(g, INK.paperDark), roofF = inkEl(g, mix(INK.red, INK.paperDark, 0.45)), domeF = inkEl(g, mix(INK.inkSoft, INK.paperDark, 0.45));
    const win = inkEl(g, INK.inkSoft), lit = inkEl(g, INK.gold), tiles = inkEl(g, INK.inkSoft), lines = inkEl(g);
    const q = rng(inkHash(seed, 4711));
    const H0 = Array.from({ length: 16 }, () => [0.7 + q() * 0.6, 0.45 + q() * 0.55, q(), q()]);
    return {
      update(t, o) {
        const W = o.W, gy = o.gy, top = o.top ?? gy - 300, x0 = o.x0 ?? 0, x1 = o.x1 ?? W, hmax = gy - top, kind = o.kind || 'padua';
        const night = !!o.night;
        wallF.setAttribute('fill', night ? mix(INK.inkSoft, INK.paperDark, 0.35) : INK.paperDark);
        roofF.setAttribute('fill', night ? mix(INK.red, INK.ink, 0.45) : mix(INK.red, INK.paperDark, 0.45));
        let wf = '', rf = '', df = '', wn = '', lw = '', tl = '', ln = '';
        const span = x1 - x0, unit = span / 9;
        let x = x0 - unit * 0.3, i = 0;
        const towerAt = o.tower === false ? -1 : 2, domeAt = o.dome === false ? -1 : 6;
        while (x < x1 + unit * 0.3 && i < 16) {
          const h = H0[i], w = unit * h[0], hh = hmax * (0.35 + h[1] * 0.4), xa = x, xb = x + w, yt = gy - hh;
          if (i === towerAt) {   // campanile
            const tw = unit * 0.42, tx = xa + w * 0.3, th = hmax * 1.0;
            const sh = [[tx, gy], [tx, gy - th], [tx + tw, gy - th], [tx + tw, gy]];
            wf += inkLoop(sh, { seed: seed + 300, t, amp: 0.6, smooth: false }) + ' ';
            ln += ring(sh, seed + 301, t, 4, 0.6) + ' ';
            const sp = [[tx - 6, gy - th], [tx + tw / 2, gy - th - tw * 1.1], [tx + tw + 6, gy - th]];
            rf += inkLoop(sp, { seed: seed + 302, t, amp: 0.6, smooth: false }) + ' ';
            ln += ring(sp, seed + 303, t, 4, 0.6) + ' ';
            for (let k = 0; k < 2; k++) wn += inkLoop([[tx + tw * (0.2 + k * 0.38), gy - th + 22], [tx + tw * (0.42 + k * 0.38), gy - th + 22], [tx + tw * (0.42 + k * 0.38), gy - th + 70], [tx + tw * (0.2 + k * 0.38), gy - th + 70]], { seed: seed + 304 + k, t, amp: 0.4, smooth: false }) + ' ';
          }
          if (i === domeAt) {   // a basilica dome behind the houses
            const dr = unit * (kind === 'florence' ? 0.95 : 0.7), dx = xa + w / 2, dy = gy - hmax * 0.62;
            const dp = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI; dp.push([dx + Math.cos(a) * dr, dy + Math.sin(a) * dr * (kind === 'florence' ? 1.1 : 0.9)]); }
            dp.push([dx + dr, gy - hmax * 0.3], [dx - dr, gy - hmax * 0.3]);
            df += inkLoop(dp, { seed: seed + 320, t, amp: 0.6 }) + ' ';
            ln += ring(dp, seed + 321, t, 4, 0.6) + ' ' + line([[dx, dy - dr * (kind === 'florence' ? 1.1 : 0.9)], [dx, dy - dr * 1.25]], seed + 322, t, 5) + ' ';
            for (let k = -2; k <= 2; k++) tl += line([[dx + k * dr * 0.32, dy - dr * 0.85 * Math.sqrt(1 - (k * 0.32) ** 2)], [dx + k * dr * 0.45, gy - hmax * 0.32]], seed + 330 + k, t, 2.4) + ' ';
          }
          // house
          const body = [[xa, gy + 4], [xa, yt], [xb, yt], [xb, gy + 4]];
          wf += inkLoop(body, { seed: seed + 10 + i, t, amp: 0.6, smooth: false }) + ' ';
          ln += ring(body, seed + 30 + i, t, 4, 0.6) + ' ';
          const pk = yt - w * (0.18 + h[2] * 0.1), rp = [[xa - 12, yt + 4], [xa + w * (0.4 + h[3] * 0.2), pk], [xb + 12, yt + 4]];
          rf += inkLoop(rp, { seed: seed + 50 + i, t, amp: 0.6, smooth: false }) + ' ';
          ln += ring(rp, seed + 70 + i, t, 4, 0.6) + ' ';
          for (let k = 1; k < 4; k++) tl += line([[lerp(xa - 12, rp[1][0], k / 4), lerp(yt + 4, pk, k / 4)], [lerp(xb + 12, rp[1][0], k / 4), lerp(yt + 4, pk, k / 4)]], seed + 90 + i * 4 + k, t, 2) + ' ';
          if (h[2] > 0.45) { const cxh = xa + w * 0.72, cy0 = lerp(yt, pk, 0.4); const ch = [[cxh, cy0], [cxh, cy0 - 46], [cxh + 26, cy0 - 46], [cxh + 26, cy0]]; wf += inkLoop(ch, { seed: seed + 110 + i, t, amp: 0.4, smooth: false }) + ' '; ln += ring(ch, seed + 120 + i, t, 3.5, 0.5) + ' '; }
          // windows: 2 columns x floors
          const floors = Math.max(1, Math.floor(hh / 110));
          for (let f = 0; f < floors; f++) for (let c = 0; c < 2; c++) {
            const wx = xa + w * (0.22 + c * 0.38), wy = yt + 34 + f * 104, ww = w * 0.18, whh = 50;
            if (wy + whh > gy - 10) continue;
            const wp = [[wx, wy], [wx + ww, wy], [wx + ww, wy + whh], [wx, wy + whh]];
            const on = (o.lights ?? 0) > ((i * 7 + f * 3 + c * 5) % 10) / 10;
            if (on) lw += inkLoop(wp, { seed: seed + 140 + i * 9 + f * 2 + c, t, amp: 0.4, smooth: false }) + ' ';
            else wn += inkLoop(wp, { seed: seed + 140 + i * 9 + f * 2 + c, t, amp: 0.4, smooth: false }) + ' ';
          }
          if (kind === 'venice') for (let k = 0; k < 3; k++) { const ax = xa + w * (0.15 + k * 0.3); ln += line([[ax, gy], [ax, gy - 60], [ax + w * 0.12, gy - 80], [ax + w * 0.24, gy - 60], [ax + w * 0.24, gy]], seed + 200 + i * 3 + k, t, 3) + ' '; }
          x = xb + unit * 0.04; i++;
        }
        wallF.setAttribute('d', wf); roofF.setAttribute('d', rf); domeF.setAttribute('d', df);
        win.setAttribute('d', wn); lit.setAttribute('d', lw); tiles.setAttribute('d', tl); lines.setAttribute('d', ln);
      },
    };
  }

  // ------------------------------------------------------------------ St Mark's campanile
  function campanile(parent, seed) {
    const g = el(parent, 'g');
    const brick = inkEl(g, mix(INK.red, INK.paperDark, 0.5)), stone = inkEl(g, INK.paperLight), spire = inkEl(g, mix(INK.green, INK.paperDark, 0.25));
    const gold = inkEl(g, INK.gold), det = inkEl(g, INK.inkSoft), lines = inkEl(g), hole = inkEl(g, mix(INK.ink, INK.inkSoft, 0.4));
    return {
      update(t, o) {
        const x = o.x, gy = o.gy, H = o.h ?? 820, w = o.w ?? 130, k = clamp01(o.k ?? 1);
        const yS = gy - H * 0.62, yB = yS - H * 0.11, yA = yB - H * 0.09, yP = yA - H * 0.18;
        const cut = gy - H * 1.05 * k;   // draws itself from the ground up
        const clipY = y => Math.max(y, cut);
        const R = (a, b, c, d) => [[a, clipY(b)], [c, clipY(b)], [c, clipY(d)], [a, clipY(d)]];
        const sh = R(x - w / 2, yS, x + w / 2, gy);
        brick.setAttribute('d', inkLoop(sh, { seed: seed + 1, t, amp: 0.6, smooth: false }));
        let dt = '';
        for (let i = 1; i < 5; i++) { const px = x - w / 2 + w * i / 5; if (cut < gy) dt += line([[px, clipY(yS + 30)], [px, gy - 4]], seed + 10 + i, t, 3) + ' '; }
        for (let yy = gy - 60; yy > yS; yy -= 70) if (yy > cut) dt += line([[x - w / 2 + 6, yy], [x + w / 2 - 6, yy + 2]], seed + 30 + yy, t, 1.6) + ' ';
        det.setAttribute('d', dt);
        const bel = R(x - w / 2 - 8, yB, x + w / 2 + 8, yS), att = R(x - w / 2 + 2, yA, x + w / 2 - 2, yB);
        stone.setAttribute('d', (yS > cut ? inkLoop(bel, { seed: seed + 2, t, amp: 0.5, smooth: false }) : '') + ' ' + (yB > cut ? inkLoop(att, { seed: seed + 3, t, amp: 0.5, smooth: false }) : ''));
        let ho = '';
        if (yS > cut) for (let i = 0; i < 4; i++) { const ax = x - w / 2 + 4 + i * (w / 4); ho += inkLoop([[ax + 6, yS - 8], [ax + 6, yB + 34], [ax + w / 8, yB + 16], [ax + w / 4 - 6, yB + 34], [ax + w / 4 - 6, yS - 8]], { seed: seed + 40 + i, t, amp: 0.4, smooth: false }) + ' '; }
        hole.setAttribute('d', ho);
        const sp = [[x - w / 2 + 2, yA], [x, yP], [x + w / 2 - 2, yA]];
        spire.setAttribute('d', yA > cut ? inkLoop(sp, { seed: seed + 4, t, amp: 0.5, smooth: false }) : '');
        gold.setAttribute('d', yP - 30 > cut ? inkDot(x, yP - 22, 10, 24, seed + 5, t) + ' ' + inkLoop([[x - 26, yP - 30], [x, yP - 40], [x + 26, yP - 30], [x, yP - 26]], { seed: seed + 6, t, amp: 0.4 }) : '');
        lines.setAttribute('d', [ring(sh, seed + 7, t, 5, 0.6), yS > cut ? ring(bel, seed + 8, t, 4.5, 0.6) : '', yB > cut ? ring(att, seed + 9, t, 4.5, 0.6) : '', yA > cut ? ring(sp, seed + 11, t, 4.5, 0.6) : ''].join(' '));
        return { top: [x, yS - 6], w };
      },
    };
  }

  // ------------------------------------------------------------------ a carrack
  function ship(parent, seed) {
    const g = el(parent, 'g');
    const hull = inkEl(g, mix(INK.stain, INK.ink, 0.35)), hullL = inkEl(g), sails = inkEl(g, INK.paperLight), sailL = inkEl(g), flag = inkEl(g, INK.red), wake = inkEl(g, INK.inkSoft);
    return {
      update(t, x, y, s = 1, face = 1, o = {}) {
        const rock = Math.sin(t * 1.3 + seed) * 2.2 * Math.PI / 180, bob = Math.sin(t * 1.7 + seed) * 4 * s;
        const T = p => { const c = Math.cos(rock), sn = Math.sin(rock), px = p[0] * face * s, py = p[1] * s; return [x + px * c - py * sn, y + bob + px * sn + py * c]; };
        const hp = [[-210, -50], [210, -70], [180, 0], [-170, 0]].map(T);
        hull.setAttribute('d', inkLoop(hp, { seed: seed + 1, t, amp: 0.6, smooth: false }));
        let hl = ring(hp, seed + 2, t, 4.5, 0.6) + ' ' + line([[-190, -30], [195, -45]].map(T), seed + 3, t, 2.5);
        const masts = [[-90, -260], [20, -330], [130, -230]];
        let sd = '', slL = '';
        masts.forEach((m, i) => {
          hl += ' ' + line([[m[0], -50], [m[0], m[1]]].map(T), seed + 10 + i, t, 4);
          if ((o.sails ?? 1) > 0) {
            const sw = 70 + (i === 1 ? 20 : 0), b1 = Math.sin(t * 1.1 + i) * 6;
            for (const [y0, y1, k] of [[m[1] + 20, m[1] * 0.55 - 20, 0.8], [m[1] * 0.55, -80, 1]]) {
              const sp = [[m[0] - sw * k, y0], [m[0] + sw * k, y0], [m[0] + sw * k + 10 + b1, y1], [m[0] - sw * k + 10 + b1, y1]].map(T);
              sd += inkLoop(sp, { seed: seed + 20 + i, t, amp: 0.6 }) + ' '; slL += ring(sp, seed + 30 + i, t, 3.5, 0.6) + ' ';
            }
          }
        });
        hullL.setAttribute('d', hl); sails.setAttribute('d', sd); sailL.setAttribute('d', slL);
        flag.setAttribute('fill', o.flag === 'blue' ? INK.blue : INK.red);
        const fw = Math.sin(t * 4 + seed) * 8;
        flag.setAttribute('d', inkLoop([[20, -330], [80, -320 + fw], [20, -300]].map(T), { seed: seed + 40, t, amp: 0.5 }));
        wake.setAttribute('d', line([[-240, 6], [-160, 10], [-80, 6]].map(T), seed + 41, t, 3) + ' ' + line([[100, 8], [190, 12], [260, 6]].map(T), seed + 42, t, 3));
      },
    };
  }

  // ------------------------------------------------------------------ round telescope view
  let lensN = 0;
  function lens(parent, defs, seed) {
    const id = 'gallens' + (seed % 100000) + '_' + (lensN++);
    const cp = el(defs || parent, 'clipPath', { id });
    const cc = el(cp, 'circle', { cx: 0, cy: 0, r: 1 });
    const g = el(parent, 'g');
    const field = inkEl(g, mix(INK.ink, INK.inkSoft, 0.45));
    const view = el(g, 'g', { 'clip-path': `url(#${id})` });
    const cross = inkEl(g, INK.paperLight, { 'fill-opacity': 0.35 }), brass = inkEl(g, INK.gold), brassL = inkEl(g), ticks = inkEl(g, INK.ink);
    return {
      view,
      update(t, cx, cy, r, o = {}) {
        const k = clamp01(o.k ?? 1), R = Math.max(1, r * (k < 1 ? spring(k, 0, 1) : 1));
        cc.setAttribute('cx', f1(cx)); cc.setAttribute('cy', f1(cy)); cc.setAttribute('r', f1(R));
        field.setAttribute('d', o.dark === false ? '' : inkLoop(inkEllipsePts(cx, cy, R, R, seed + 1, 28, 0, 0.004), { seed: seed + 1, t, amp: 0.5 }));
        const outer = inkEllipsePts(cx, cy, R * 1.09, R * 1.09, seed + 2, 28, 0, 0.004), inner = inkEllipsePts(cx, cy, R, R, seed + 3, 28, 0, 0.004);
        brass.setAttribute('d', inkLoop(outer, { seed: seed + 2, t, amp: 0.5 }) + ' ' + inkLoop(inner.slice().reverse(), { seed: seed + 3, t, amp: 0.5 }));
        brass.setAttribute('fill-rule', 'evenodd');
        brassL.setAttribute('d', ring(outer, seed + 4, t, 6, 0.6) + ' ' + ring(inner, seed + 5, t, 5, 0.6));
        let tk = '';
        if (o.ticks !== false) for (let i = 0; i < 36; i++) { const a = i / 36 * TAU + t * 0.05; const r0 = R * 1.012, r1 = R * (i % 3 ? 1.04 : 1.07); tk += line([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], seed + 10 + i, t, 2.4, 0.4, 0) + ' '; }
        ticks.setAttribute('d', tk);
        cross.setAttribute('d', o.cross ? line([[cx - R * 0.9, cy], [cx + R * 0.9, cy]], seed + 60, t, 2, 0.4, 0) + ' ' + line([[cx, cy - R * 0.9], [cx, cy + R * 0.9]], seed + 61, t, 2, 0.4, 0) : '');
      },
    };
  }

  // ------------------------------------------------------------------ hand-written label
  function label(parent, L, W, H, seed) {
    const g = el(parent, 'g');
    const col = { red: INK.red, blue: INK.blue, gold: INK.gold, ink: INK.ink, paper: INK.paperLight }[L.color] || INK.ink;
    const size = L.size || 56, x = L.x * W, y = L.y * H, serif = L.font === 'serif';
    const box = L.box ? inkEl(g, INK.red) : null;
    const tx = el(g, 'text', { x, y, 'font-family': serif ? 'Fraunces, Georgia, serif' : INK_FONT, 'font-weight': serif ? 900 : 400, 'font-size': size, 'text-anchor': L.anchor || 'middle', fill: L.box ? INK.paperLight : col });
    tx.textContent = L.text;
    const ul = inkEl(g, col), ar = inkEl(g, col);
    let tw = 0;
    return {
      update(lt, t, cues) {
        const a = atOr(cues, L.at, 0.3), p = pop(lt, a, 0.6);
        if (!tw) { try { tw = tx.getComputedTextLength(); } catch (e) { tw = 0; } if (!tw) tw = size * L.text.length * 0.45; }
        const b = boil(seed, t, 1.2);
        g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1(L.rot || 0)}) scale(${f1(Math.max(0.001, p) * 100) / 100}) translate(${f1(-x)} ${f1(-y)})`);
        g.style.visibility = lt < a ? 'hidden' : 'visible';
        const anc = L.anchor || 'middle';
        const x0 = anc === 'start' ? x : anc === 'end' ? x - tw : x - tw / 2, x1 = x0 + tw;
        if (box) box.setAttribute('d', inkLoop([[x0 - 22, y - size * 0.86], [x1 + 22, y - size * 0.9], [x1 + 18, y + size * 0.28], [x0 - 18, y + size * 0.3]], { seed: seed + 2, t, amp: 1.2, smooth: false }));
        const u = clamp01((lt - a - 0.25) / 0.4);
        ul.setAttribute('d', !box && u > 0 && L.underline !== false ? line([[x0, y + 14], [lerp(x0, x1, u), y + 10]], seed + 3, t, 4.5) : '');
        if (L.arrow) {
          const ax = L.arrow[0] * W, ay = L.arrow[1] * H, sx = ax > x1 ? x1 + 12 : ax < x0 ? x0 - 12 : x, sy = ay > y ? y + 26 : y - size * 0.9;
          const q = clamp01((lt - a - 0.2) / 0.5), ex = lerp(sx, ax, q), ey = lerp(sy, ay, q);
          const mx = (sx + ex) / 2 + (ey - sy) * 0.18, my = (sy + ey) / 2 - (ex - sx) * 0.18, ang = Math.atan2(ey - my, ex - mx), hd = 26;
          ar.setAttribute('d', q > 0 ? line([[sx, sy], [mx, my], [ex, ey]], seed + 5, t, 5) + ' ' +
            line([[ex - Math.cos(ang - 0.5) * hd, ey - Math.sin(ang - 0.5) * hd], [ex, ey], [ex - Math.cos(ang + 0.5) * hd, ey - Math.sin(ang + 0.5) * hd]], seed + 6, t, 5) : '');
        }
      },
    };
  }

  // ------------------------------------------------------------------ interior room (back wall, ceiling beams, floor, window)
  function room(parent, seed) {
    const g = el(parent, 'g');
    const wall = inkEl(g), wallT = inkEl(g, INK.paperDark), beamF = inkEl(g, mix(INK.stain, INK.ink, 0.45));
    const winSky = inkEl(g), winRoof = inkEl(g, mix(INK.inkSoft, INK.paperDark, 0.2)), winF = inkEl(g, mix(INK.stain, INK.ink, 0.3));
    const floor = inkEl(g), floorT = inkEl(g, INK.inkSoft), shelfF = inkEl(g, mix(INK.stain, INK.ink, 0.35)), lines = inkEl(g);
    const q = rng(inkHash(seed, 5150)), CR = Array.from({ length: 14 }, () => [q(), q(), q()]);
    return {
      update(t, W, H, o = {}) {
        const gy = o.gy ?? H * 0.8, kind = o.kind || 'plaster';
        wall.setAttribute('fill', kind === 'stone' ? mix(INK.paperDark, INK.inkSoft, 0.18) : kind === 'wood' ? mix(INK.stain, INK.paperDark, 0.45) : mix(INK.paper, INK.paperDark, 0.55));
        if (o.dark) wall.setAttribute('fill', mix(INK.paperDark, INK.inkSoft, 0.45));
        const wp = [[-40, -40], [W + 40, -40], [W + 40, gy], [-40, gy]];
        wall.setAttribute('d', inkLoop(wp, { seed: seed + 1, t, amp: 0.5, smooth: false }));
        let tx = '';
        if (kind === 'stone') {   // ashlar courses
          for (let r = 0, y = gy - 90; y > -40; y -= 90, r++) {
            tx += line([[-40, y], [W + 40, y + 2]], seed + 10 + r, t, 2.2) + ' ';
            for (let x = (r % 2) * 110 - 40; x < W + 40; x += 220) tx += line([[x, y], [x + 2, y + 90]], seed + 40 + r * 13 + x, t, 2) + ' ';
          }
        } else if (kind === 'wood') {
          for (let x = 60; x < W; x += 140) tx += line([[x, -40], [x + 3, gy]], seed + 10 + x, t, 2.2) + ' ';
        } else CR.forEach((c, i) => { const x = c[0] * W, y = c[1] * gy * 0.9; tx += line([[x, y], [x + 40 + c[2] * 60, y + 10 + c[2] * 20], [x + 70 + c[2] * 60, y + 4]], seed + 60 + i, t, 1.8) + ' '; });
        wallT.setAttribute('d', tx);
        // ceiling beams
        let bm = '';
        if (o.beams !== false) {
          bm += inkLoop([[-40, -40], [W + 40, -40], [W + 40, 60], [-40, 60]], { seed: seed + 2, t, amp: 0.5, smooth: false }) + ' ';
          for (let x = 80; x < W; x += 300) bm += inkLoop([[x, 50], [x + 56, 50], [x + 50, 96], [x + 6, 96]], { seed: seed + 3 + x, t, amp: 0.5, smooth: false }) + ' ';
        }
        beamF.setAttribute('d', bm);
        // window
        let ws = '', wr = '', wf = '', ln = ring(wp, seed + 4, t, 0.01, 0);
        let win = null;
        if (o.window) {
          const w = o.window, x0 = (w.x ?? 0.7) * W, y0 = (w.y ?? 0.16) * H, ww = (w.w ?? 0.2) * W, wh = (w.h ?? 0.42) * H;
          win = [x0, y0, ww, wh];
          winSky.setAttribute('fill', w.night ? mix(INK.ink, INK.blue, 0.25) : mix(INK.paperLight, INK.blue, 0.12));
          const pane = [[x0, y0 + ww * 0.25], [x0 + ww * 0.5, y0], [x0 + ww, y0 + ww * 0.25], [x0 + ww, y0 + wh], [x0, y0 + wh]];
          ws = inkLoop(pane, { seed: seed + 5, t, amp: 0.5, smooth: false });
          if (w.view === 'roofs') { const b = y0 + wh; wr = inkLoop([[x0, b], [x0, b - wh * 0.25], [x0 + ww * 0.2, b - wh * 0.38], [x0 + ww * 0.4, b - wh * 0.26], [x0 + ww * 0.55, b - wh * 0.5], [x0 + ww * 0.62, b - wh * 0.5], [x0 + ww * 0.66, b - wh * 0.3], [x0 + ww * 0.85, b - wh * 0.36], [x0 + ww, b - wh * 0.22], [x0 + ww, b]], { seed: seed + 6, t, amp: 0.5, smooth: false }); }
          const fr = 22;
          wf = inkPath(pane, { w: fr, seed: seed + 7, t, closed: true, smooth: false, amp: 0.5 }) + ' ' + inkLoop([[x0 - 30, y0 + wh], [x0 + ww + 30, y0 + wh], [x0 + ww + 24, y0 + wh + 30], [x0 - 24, y0 + wh + 30]], { seed: seed + 8, t, amp: 0.5, smooth: false });
          if (w.bars !== false) wf += ' ' + line([[x0 + ww / 2, y0 + 4], [x0 + ww / 2, y0 + wh]], seed + 9, t, 8) + ' ' + line([[x0, y0 + wh * 0.5], [x0 + ww, y0 + wh * 0.5]], seed + 11, t, 8);
          ln += ' ' + ring(pane, seed + 12, t, 5, 0.5);
        }
        winSky.setAttribute('d', ws); winRoof.setAttribute('d', wr); winF.setAttribute('d', wf);
        // floor down to the frame bottom (fills the caption band with texture)
        floor.setAttribute('fill', o.floorColor === 'stone' ? mix(INK.paperDark, INK.inkSoft, 0.3) : mix(INK.stain, INK.paperDark, 0.4));
        const fp = [[-40, gy], [W + 40, gy], [W + 40, H + 40], [-40, H + 40]];
        floor.setAttribute('d', inkLoop(fp, { seed: seed + 13, t, amp: 0.5, smooth: false }));
        let ft = line([[-40, gy], [W + 40, gy + 2]], seed + 14, t, 6) + ' ';
        const vx = W / 2;
        if ((o.floor || 'planks') === 'tiles') {
          for (let k = 1; k < 5; k++) { const y = gy + (H - gy) * (k / 5) ** 1.3; ft += line([[-40, y], [W + 40, y]], seed + 20 + k, t, 2.4) + ' '; }
          for (let k = -8; k <= 8; k++) ft += line([[vx + k * 130, gy], [vx + k * 300, H + 40]], seed + 30 + k, t, 2.4) + ' ';
        } else for (let k = -10; k <= 10; k++) ft += line([[vx + k * 110, gy], [vx + k * 260, H + 40]], seed + 30 + k, t, 2.4) + ' ';
        floorT.setAttribute('d', ft);
        // shelves with jars / lenses
        let sf = '';
        (o.shelves || []).forEach((s, i) => {
          const x0 = s.x * W, y = s.y * H, w = s.w * W;
          sf += inkLoop([[x0, y], [x0 + w, y], [x0 + w, y + 18], [x0, y + 18]], { seed: seed + 50 + i, t, amp: 0.5, smooth: false }) + ' ';
          ln += ' ' + ring([[x0, y], [x0 + w, y], [x0 + w, y + 18], [x0, y + 18]], seed + 52 + i, t, 3.5, 0.5);
          const n = Math.floor(w / 70);
          for (let k = 0; k < n; k++) { const cx = x0 + 35 + k * 70, r = 18 + ((k * 7 + i) % 3) * 6; ln += ' ' + inkCircle(cx, y - r - 2, r, seed + 60 + i * 20 + k, t, { w: 3.5 }); }
        });
        shelfF.setAttribute('d', sf);
        lines.setAttribute('d', ln);
        return { win, gy };
      },
    };
  }

  // ------------------------------------------------------------------ wooden table whose front runs to the frame bottom (foreground)
  function table(parent, seed) {
    const g = el(parent, 'g');
    const top = inkEl(g, mix(INK.stain, INK.paperDark, 0.25)), front = inkEl(g, mix(INK.stain, INK.ink, 0.38)), grain = inkEl(g, INK.ink, { 'fill-opacity': 0.5 }), lines = inkEl(g);
    return {
      update(t, o) {
        const x0 = o.x0, x1 = o.x1, y = o.y, d = o.depth ?? 70, Hh = o.H ?? 1080;
        const tp = [[x0 + 40, y - d], [x1 - 40, y - d], [x1, y], [x0, y]];
        top.setAttribute('d', inkLoop(tp, { seed: seed + 1, t, amp: 0.5, smooth: false }));
        const fp = [[x0, y], [x1, y], [x1, y + 34], [x0, y + 34]];
        const legs = o.legs ? [[x0 + 30, y + 34], [x0 + 70, y + 34], [x0 + 70, Hh + 40], [x0 + 30, Hh + 40]] : null;
        const legs2 = o.legs ? [[x1 - 70, y + 34], [x1 - 30, y + 34], [x1 - 30, Hh + 40], [x1 - 70, Hh + 40]] : null;
        const panel = o.legs ? null : [[x0, y + 34], [x1, y + 34], [x1, Hh + 40], [x0, Hh + 40]];
        front.setAttribute('d', [fp, legs, legs2, panel].filter(Boolean).map((p, i) => inkLoop(p, { seed: seed + 2 + i, t, amp: 0.5, smooth: false })).join(' '));
        let gr = '';
        for (let k = 1; k < 4; k++) gr += line([[lerp(x0 + 40, x0, k / 4) + 30, lerp(y - d, y, k / 4)], [lerp(x1 - 40, x1, k / 4) - 30, lerp(y - d, y, k / 4) + 2]], seed + 10 + k, t, 1.8) + ' ';
        if (panel) for (let x = x0 + 120; x < x1 - 60; x += 180) gr += line([[x, y + 50], [x + 4, Hh + 40]], seed + 20 + x, t, 2.4) + ' ';
        grain.setAttribute('d', gr);
        lines.setAttribute('d', [tp, fp, panel, legs, legs2].filter(Boolean).map((p, i) => ring(p, seed + 30 + i, t, 4.5, 0.5)).join(' '));
        return { top: y - d * 0.5 };
      },
    };
  }

  window.GAL = { TAU, f1, atOr, pop, dirOf, faceOf, line, ring, person, scope, moon, jupiter, stars, roofs, campanile, ship, lens, label, room, table, GITEMS };
})();
