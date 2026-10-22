// mcA_ship: the Mary Celeste (1872) in parchment ink (theme "parchment", brand/kit/BRAND.md §3, §5). Every line boils
// at 8 Hz through _ink.js; everything is a pure function of (seed, lt), no Math.random. Four 2D shots, 16:9 first:
//
// SHOTS.mcA_sea — open Atlantic, side view: sky with drifting clouds and gulls, a horizon, wave hatching, one or more
//   two-masted brigantines (square-rigged foremast, gaff mainsail, jibs) that bob, roll and can wander (yaw), with
//   sails set, furled, torn (ragged strips flap) or hanging loose by the corners; small rowing boats (cast rigs inside,
//   oars sweeping); an optional foreground deck (the watching ship's rail) the cast stands on; signal flags, shout
//   arcs, a day counter, hand-written labels.
//   P: {horizon: 0.46, zoom: 1.06, focus: [0.5, 0.55], clouds: 3, gulls: 3,
//       ships: [{x: 0.6, y: 0.8 (waterline, 0..1 H), scale: 1, face: 1|-1, to, at, dur, sails: "full"|"drift"|{...},
//                roll: 2.5 (deg), wander: 0 (0..1: yaw + extra roll, nobody at the wheel), flag: "us"|"uk"|null,
//                crew: 0 (tiny figures on deck), crew_fade: cue (they fade out), yawl: {at, down: 1.6, row: cue, to: -0.3,
//                figures: 4} (the ship's boat is lowered on the near side and rowed away), ghost: cue (whole ship fades
//                to a faint outline from that cue)}],
//       boats: [{x: 0.3, y: 0.86, scale: 1, to, at, dur, face: 1|-1, cast: [{who, accessory, beard, dx (px), pose,
//                at, then, dir, face, emotion, seq}], oars: true}],
//       deck: {y: 0.9 (deck line), rail: 0.74 (rail cap), mast: 0.07 (x of a foreground mast, false = none)},
//       cast: [{who, x, y (ground, defaults to deck.y), scale, pose, at, then, dir, face, emotion, seq, to, walk_at, walk_dur}],
//       flags: {x: 0.07, at, top: 0.2} (three signal flags run up a halyard), calls: [{x, y, at, dur: 1.6, dir: 1}],
//       counter: {x: 0.5, y: 0.2, from: 1, to: 9, at, dur: 3, prefix: "DAY ", size: 120},
//       labels: [{text, x, y, at, size: 60, color: "ink"|"red"|"blue", arrow: [x, y], rot: -3}]}
//   cues: anything named above (ship/boat at, yawl at/row, crew_fade, ghost, flags.at, calls[].at, counter.at, labels).
//
// SHOTS.mcA_hull — close views of the hull.
//   mode "stern": big stern close-up rising and falling on the swell, the name painted on the transom letter by letter
//     from cue "name" (P.name, default "MARY CELESTE"), a rowing boat with the cast bobbing in front (P.boats as above).
//   mode "hold":  cutaway of the hold: deck and hatch on top with a ladder, ribs, rows of barrels (P.barrels: {rows: 3,
//     at, dur: 2.4, counter: {to: 1701, suffix: " BARRELS", x, y}}), bilge water sloshing (P.water: {level: 0.3
//     (0..1 of the hold height), at, dur: 1.6}), a depth gauge (P.gauge: {at, text: "3½ FEET"}), the pump well and the
//     sounding rod (P.rod: {at: cue (lifts off the deck), drop: cue (slides down the well into the water)}),
//     P.warn: {at, text: "FLAMMABLE"} (red warning badge with a flickering flame).
//   P (both): cast [...as mcA_sea, x/y in 0..1], labels [...], zoom, focus.   cues: name, barrels.at, water.at, gauge.at,
//     rod.at, rod.drop, warn.at, cast/label "at" names.
//
// SHOTS.mcA_deck — on the Mary Celeste's deck (eye level): the far bulwark with the sea behind it, the mainmast with
//   swinging loose ropes, an open hatch, the deckhouse door swinging; the whole view rolls gently.
//   mode "deck":  P.climb: {who: cast index, at: 0, dur: 1.4, x0: 0.3} (that cast member climbs over the rail onto the
//     deck), P.sounds: [{text: "creak...", x, y, at}] (hand-written sound words that pulse), P.slap: cue (ropes whip),
//     P.ghosts: [{item: "boat"|"chrono"|"sextant"|"papers", x, y, at, scale}] (dashed outline of a missing thing + red X),
//     P.muster: {count: 10, at, dur: 2.4, counter: {x, y, label: "ON BOARD"}} (people pop up along the deck),
//     P.slate: {x: 0.62, y: 0.52, lines: [{text, at}], scale: 1} (the log slate leaning on the deckhouse, chalk text
//     writes itself in).
//   mode "cabin": the crew's quarters: plank wall, swinging lamp, pegs with clothes swaying, sea chests with open lids,
//     a shelf of clay pipes; P.ring: {at, item: "pipes"|"chests"} red ink ring.
//   P (both): cast, labels, zoom, focus.   cues: climb.at, slap, sounds/ghosts/muster/slate lines "at", ring.at, cast/labels.
//
// SHOTS.mcA_portraits — framed ink portraits hung on the page by a string (they swing): P.frames: [{kind: "man"|"woman"|
//   "girl"|"boy"|"granny", beard: true, name, at, x: 0.5, y: 0.45, scale: 1, dim: cue (fades to a pale "not here")}],
//   P.cast [...], P.labels [...].   cues: frames[].at / dim, cast/labels.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, gold: INK.gold, green: INK.green, soft: INK.inkSoft };
  const circ = (cx, cy, r, n = 14, ry) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * (ry ?? r)]);
  const sm = x => x * x * (3 - 2 * x);
  const U = s => String(s).toLocaleUpperCase(LOCALE);
  const fmt = v => Math.round(v).toLocaleString(LOCALE);

  // ------------------------------------------------------------------ shared: cast rigs (Kaşif + period figures)
  function makeCast(parent, list, seed, defScale) {
    return (list || []).map((c, i) => {
      const isK = (c.who || 'kasif') === 'kasif';
      const rig = KASIF.create(el(parent, 'g'), { scale: c.scale ?? defScale, hat: isK, accessory: isK ? null : (c.accessory || null), beard: isK ? null : (c.beard || null), seed: seed + i * 7 + 3 });
      return { c, rig, i };
    });
  }
  // state of one cast member at lt: pose chain (pose -> then at `at` -> seq) + optional walk
  function castState(c, lt, cues) {
    const steps = [];
    const at = atOr(cues, c.at, null);
    if (at != null) steps.push({ at, pose: c.then || 'shock', dir: c.then_dir ?? c.dir, emotion: c.emotion, face: c.then_face });
    (c.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) steps.push(Object.assign({}, s, { at: a })); });
    steps.sort((a, b) => a.at - b.at);
    let st = { pose: c.pose || 'idle', dir: c.dir, face: c.face, emotion: c.emotion0 || null, t0: 0, prev: null };
    for (const s of steps) {
      if (lt < s.at) break;
      st = { pose: s.pose || st.pose, dir: s.dir ?? st.dir, face: s.face ?? st.face, text: s.text,
        emotion: s.emotion ?? ((s.pose || st.pose) === 'shock' ? 'surprised' : st.emotion), t0: s.at, prev: { pose: st.pose, since: s.at - st.t0, dir: st.dir } };
    }
    return st;
  }
  function updCast(cast, t, lt, cues, W, H, place) {
    cast.forEach(m => {
      const { c, rig } = m;
      let st = castState(c, lt, cues);
      let x = (c.x ?? 0.5) * W, y = (c.y ?? 0.85) * H, walkPh = null, walkFace = null;
      if (c.to != null) {
        const wa = atOr(cues, c.walk_at, 0), wd = c.walk_dur ?? 1.8, x1 = c.to * W, u = clamp01((lt - wa) / wd);
        const e = sm(u);
        const nx = lerp(x, x1, e);
        if (lt >= wa && lt < wa + wd) { walkPh = Math.abs(nx - x) / ((KASIF.gait ? KASIF.gait('walk') : 120) * (c.scale ?? 0.5)); walkFace = x1 >= x ? 1 : -1; }
        x = nx;
      }
      if (place) { const p = place(m, x, y, lt); if (p) { x = p[0]; y = p[1]; if (p[2]) st = Object.assign({}, st, p[2]); } }
      const dir = typeof st.dir === 'number' ? st.dir : DIRS[st.dir] ?? 20;
      const faceS = st.face ?? c.face;
      const face = walkFace ?? (faceS === 'left' || faceS === -1 ? -1 : 1);
      const since = lt - st.t0;
      const o = { x, y, face, since, dir, emotion: st.emotion, text: st.text ?? c.text, item: c.item };
      let pose = st.pose;
      if (walkPh != null) { pose = 'walk'; o.ph = walkPh; }
      else if (st.prev && since < 0.32) { o.prev = { pose: st.prev.pose, since: st.prev.since, dir }; o.mix = since / 0.32; }
      rig.update(t, pose, o);
    });
  }

  // ------------------------------------------------------------------ shared: labels and counter
  function makeLabels(parent, list) {
    return (list || []).map(Lb => {
      const g = el(parent, 'g'), col = COL[Lb.color] || INK.ink;
      const tx = el(g, 'text', { 'font-family': Lb.font === 'serif' ? FR : INK_FONT, 'font-weight': Lb.font === 'serif' ? 800 : 400, 'font-size': Math.max(44, Lb.size || 60), 'text-anchor': 'middle', fill: col,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      tx.textContent = Lb.upper ? U(Lb.text) : Lb.text;
      return { Lb, g, tx, u: inkEl(g, col), ar: inkEl(g, col) };
    });
  }
  function updLabels(labels, t, lt, dur, cues, W, H, sd) {
    labels.forEach((L, i) => {
      const Lb = L.Lb, at = atOr(cues, Lb.at, Math.min(dur * 0.4, 1 + i * 0.6)), p = spring(lt, at, 0.6), pk = punch(lt, at, 0.5);
      if (lt < at) { L.g.style.display = 'none'; return; }
      L.g.style.display = '';
      const x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? 0.2) * H;
      L.tx.setAttribute('x', x); L.tx.setAttribute('y', y);
      const tw = L.tx.getComputedTextLength ? L.tx.getComputedTextLength() : 300;
      L.u.setAttribute('d', Lb.line === false ? '' : inkPath([[x - tw / 2, y + 16], [x + tw / 2, y + 10]], { seed: sd + 900 + i, t, w: 5 }));
      if (Lb.arrow) {
        const ax = Lb.arrow[0] * W, ay = Lb.arrow[1] * H, sx = x + (ax > x ? tw * 0.3 : -tw * 0.3) * (Math.abs(ax - x) > tw * 0.4 ? 1 : 0), sy = y + (ay > y ? 30 : -60);
        const pr = clamp01((lt - at - 0.2) / 0.5), ex = lerp(sx, ax, pr), ey = lerp(sy, ay, pr);
        const mx = (sx + ex) / 2 + (ey - sy) * 0.15, my = (sy + ey) / 2 - (ex - sx) * 0.15;
        const ang = Math.atan2(ey - my, ex - mx);
        let d = pr > 0.02 ? inkPath([[sx, sy], [mx, my], [ex, ey]], { seed: sd + 920 + i, t, w: 5 }) : '';
        if (pr > 0.9) d += ' ' + inkPath([[ex - 30 * Math.cos(ang - 0.5), ey - 30 * Math.sin(ang - 0.5)], [ex, ey], [ex - 30 * Math.cos(ang + 0.5), ey - 30 * Math.sin(ang + 0.5)]], { seed: sd + 940 + i, t, w: 5, smooth: false });
        L.ar.setAttribute('d', d);
      }
      const s = lerp(0.6, 1, p) * (1 + pk * 0.1);
      L.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${Lb.rot ?? -3}) scale(${s.toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
    });
  }
  function makeCounter(parent, C) {
    if (!C) return null;
    const g = el(parent, 'g');
    const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': C.size || 120, 'text-anchor': 'middle', fill: COL[C.color] || INK.red,
      style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 16px; stroke-linejoin: round` });
    let lb = null;
    if (C.label) { lb = el(g, 'text', { 'font-family': INK_FONT, 'font-size': C.label_size || 60, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px` }); lb.textContent = C.label; }
    return { C, g, tx, lb };
  }
  function updCounter(K, lt, dur, cues, W, H) {
    if (!K) return;
    const C = K.C, at = atOr(cues, C.at, 0.4), d = C.dur ?? 2.5, p = clamp01((lt - at) / d), e = 1 - Math.pow(1 - p, 2.2);
    if (lt < at) { K.g.style.display = 'none'; return; }
    K.g.style.display = '';
    const v = lerp(C.from ?? 0, C.to ?? 10, e), x = (C.x ?? 0.5) * W, y = (C.y ?? 0.22) * H;
    K.tx.textContent = (C.prefix || '') + fmt(v) + (C.suffix || '');
    K.tx.setAttribute('x', x); K.tx.setAttribute('y', y);
    if (K.lb) { K.lb.setAttribute('x', x); K.lb.setAttribute('y', y + (C.size || 120) * 0.62); }
    const s = spring(lt, at, 0.5) * (1 + punch(lt, at + d, 0.5) * 0.12 + (p < 1 ? 0.02 * Math.sin(lt * 30) : 0));
    K.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(-2) scale(${s.toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
  }

  // ------------------------------------------------------------------ shared: the brigantine (side view, bow to +x)
  // Local units: waterline y = 0, deck ≈ -64, mast tops ≈ -610, hull -312..318, bowsprit to 540.
  const SAILS = {
    full: { course: 'set', ltop: 'set', utop: 'set', tgal: 'set', main: 'set', gtop: 'set', jib: 'set', stay: 'set', fjib: 'set' },
    drift: { course: 'gone', ltop: 'loose', utop: 'torn', tgal: 'furled', main: 'furled', gtop: 'furled', jib: 'set', stay: 'set', fjib: 'gone' },
    furled: { course: 'furled', ltop: 'furled', utop: 'furled', tgal: 'furled', main: 'furled', gtop: 'furled', jib: 'gone', stay: 'gone', fjib: 'gone' },
  };
  function makeShip(parent) {
    const g = el(parent, 'g');
    const mk = (fill, ex) => inkEl(g, fill, ex);
    return { g, rig: mk(INK.inkSoft), mast: mk(), sailF: mk(INK.paperLight), sailS: mk(INK.paperDark), sailI: mk(), stripI: mk(), stripF: mk(INK.paperLight),
      hullD: mk(INK.paperDark), hullF: mk(INK.paperLight), hullS: mk(INK.inkSoft), hullI: mk(), flagR: mk(INK.red), flagF: mk(INK.paperLight), flagB: mk(INK.blue),
      crewF: mk(INK.paperLight), crewI: mk(), front: mk(INK.paperDark), frontI: mk(INK.inkSoft) };
  }
  // o: {cx, cy, k, face, roll, t, sd, sails, flag, crew, crewA, alpha (ghost 0..1), frontW}
  function drawShip(S, o) {
    const { cx, cy, k, t, sd } = o, face = o.face || 1, a = (o.roll || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const T = (x, y) => { const X = x * face * k, Y = y * k; return [cx + X * ca - Y * sa, cy + X * sa + Y * ca]; };
    const TP = pts => pts.map(p => T(p[0], p[1]));
    const w = v => Math.max(1.6, v * Math.min(1.2, Math.max(0.45, k)));
    const sails = Object.assign({}, SAILS.full, typeof o.sails === 'string' ? SAILS[o.sails] : (o.sails || {}));
    let rig = '', mast = '', sF = '', sS = '', sI = '', stI = '', stF = '', hD = '', hF = '', hS = '', hI = '', fR = '', fF = '', fB = '', cF = '', cI = '';
    const P = (pts, s, ww, ex) => inkPath(TP(pts), Object.assign({ seed: sd + s, t, w: w(ww) }, ex || {}));
    const LOOP = (pts, s, ex) => inkLoop(TP(pts), Object.assign({ seed: sd + s, t, amp: 1.2 }, ex || {}));
    const wind = Math.sin(t * 1.3), gust = Math.sin(t * 2.1 + 1);
    // rigging (behind)
    const FM = 120, MM = -130;
    rig += P([[FM, -600], [520, -168]], 1, 3) + ' ' + P([[MM, -620], [FM, -585]], 2, 3) + ' ' + P([[MM, -615], [-318, -104]], 3, 3) + ' ';
    rig += P([[FM, -430], [70, -86]], 4, 2.5) + ' ' + P([[FM, -430], [178, -90]], 5, 2.5) + ' ' + P([[MM, -440], [-180, -84]], 6, 2.5) + ' ' + P([[MM, -440], [-74, -82]], 7, 2.5) + ' ';
    rig += P([[FM, -560], [470, -158]], 8, 2.5) + ' ';
    // masts, bowsprit, yards, boom, gaff
    mast += P([[FM, -64], [FM + 4, -610]], 10, 10) + ' ' + P([[MM, -64], [MM - 4, -630]], 11, 11) + ' ' + P([[296, -96], [540, -170]], 12, 9) + ' ';
    mast += P([[MM, -118], [-390, -128]], 13, 7) + ' ' + P([[MM, -470], [-345, -540]], 14, 6) + ' ';
    const yards = { course: [-250, 172], ltop: [-360, 146], utop: [-452, 118], tgal: [-532, 92] };
    const foot = { course: -96, ltop: -256, utop: -364, tgal: -455 };
    Object.keys(yards).forEach((key, i) => {
      const [yT, hw] = yards[key];
      mast += P([[FM - hw - 12, yT + 2], [FM + hw + 12, yT - 2]], 20 + i, 6) + ' ';
      const st = sails[key], yB = foot[key], hB = hw + 18, h = yB - yT;
      const bul = 16 + wind * 6 + i * 2;
      if (st === 'set') {
        const pts = [[FM - hw, yT], [FM + hw, yT], [FM + hB + bul * 0.4, yT + h * 0.5], [FM + hB, yB], [FM, yB + bul], [FM - hB, yB], [FM - hB - bul * 0.3, yT + h * 0.5]];
        sF += LOOP(pts, 30 + i) + ' '; sI += P(pts, 30 + i, 5, { closed: true }) + ' ';
        sS += LOOP([[FM - hw * 0.6, yT + h * 0.2], [FM - hw * 0.2, yT + h * 0.25], [FM - hB * 0.4, yB - h * 0.1], [FM - hB * 0.8, yB - h * 0.15]], 40 + i, { amp: 1 }) + ' ';
      } else if (st === 'furled') {
        const pts = [[FM - hw, yT - 8], [FM, yT - 13], [FM + hw, yT - 8], [FM + hw, yT + 10], [FM, yT + 16], [FM - hw, yT + 10]];
        sF += LOOP(pts, 30 + i) + ' '; sI += P(pts, 30 + i, 4, { closed: true }) + ' ';
        for (let j = -2; j <= 2; j++) sI += P([[FM + j * hw * 0.38, yT - 10], [FM + j * hw * 0.38 + 6, yT + 12]], 50 + i * 5 + j, 2.5) + ' ';
      } else if (st === 'torn') {
        const yc = yT + h * 0.5, sw = gust * 10;
        const pts = [[FM - hw, yT], [FM + hw, yT], [FM + hB, yc - 10], [FM + hB * 0.6, yc + 14], [FM + hB * 0.3, yc - 6], [FM, yc + 22], [FM - hB * 0.35, yc - 4], [FM - hB * 0.7, yc + 18], [FM - hB, yc - 6]];
        sF += LOOP(pts, 30 + i, { smooth: false }) + ' '; sI += P(pts, 30 + i, 5, { closed: true, smooth: false }) + ' ';
        [[0.62, 0.9], [0.0, 1.1], [-0.68, 0.8]].forEach(([u, len], j) => {
          const x0 = FM + hB * u, y0 = yc + 8, L = h * 0.9 * len, pts2 = [];
          for (let q = 0; q <= 5; q++) { const v = q / 5; pts2.push([x0 + Math.sin(t * 3.4 + j * 1.9 + v * 2.2) * 26 * v + sw * v, y0 + L * v]); }
          stI += P(pts2, 60 + i * 4 + j, 26, { taper: 0.6 }) + ' '; stF += P(pts2, 60 + i * 4 + j, 16, { taper: 0.6 }) + ' ';
        });
      } else if (st === 'loose') {
        const sway = Math.sin(t * 2.2) * 34 + gust * 10;
        const pts = [[FM - hw, yT], [FM + hw, yT], [FM + hw * 0.74 + sway * 0.6, yT + h * 0.55], [FM + sway, yT + h * 1.15], [FM - hw * 0.74 + sway * 0.6, yT + h * 0.55]];
        sF += LOOP(pts, 30 + i) + ' '; sI += P(pts, 30 + i, 5, { closed: true }) + ' ';
        sS += LOOP([[FM - hw * 0.4 + sway * 0.4, yT + h * 0.3], [FM + sway * 0.8, yT + h * 0.95], [FM - hw * 0.2 + sway * 0.6, yT + h * 0.5]], 45 + i, { amp: 1 }) + ' ';
      }
    });
    // gaff mainsail + gaff topsail
    if (sails.main === 'set') {
      const b = wind * 10;
      const pts = [[MM - 6, -468], [-342, -536], [-360 - b, -330], [-384, -136], [-250, -128 + b * 0.5], [MM - 6, -124]];
      sF += LOOP(pts, 70) + ' '; sI += P(pts, 70, 5, { closed: true }) + ' ';
      sS += LOOP([[-170, -420], [-240, -300], [-200, -160], [-150, -200]], 71, { amp: 1 }) + ' ';
    } else if (sails.main === 'furled') {
      const pts = [[MM, -128], [-390, -136], [-392, -112], [MM, -104]];
      sF += LOOP(pts, 70) + ' '; sI += P(pts, 70, 4, { closed: true }) + ' ';
      for (let j = 0; j < 4; j++) sI += P([[-170 - j * 60, -132], [-166 - j * 60, -106]], 72 + j, 2.5) + ' ';
    }
    if (sails.gtop === 'set') { const pts = [[MM - 4, -480], [MM - 6, -612], [-322, -550]]; sF += LOOP(pts, 75) + ' '; sI += P(pts, 75, 4, { closed: true }) + ' '; }
    // jibs
    const jib = (key, head, tack, clew, s) => {
      const st = sails[key]; if (st !== 'set') return;
      const b = 10 + wind * 6, mid = [(tack[0] + clew[0]) / 2 + b * 0.4, (tack[1] + clew[1]) / 2 + b];
      const pts = [head, tack, mid, clew];
      sF += LOOP(pts, s) + ' '; sI += P(pts, s, 4, { closed: true }) + ' ';
    };
    jib('fjib', [FM + 6, -586], [536, -170], [380, -186], 80);
    jib('jib', [FM + 6, -540], [470, -158], [310, -150], 81);
    jib('stay', [FM + 4, -420], [300, -100], [200, -118], 82);
    // hull: sheer line (deck) + rail, wale, freeboard
    const sheer = [[-316, -86], [-200, -72], [0, -66], [180, -72], [322, -96]];
    const hull = sheer.concat([[300, -30], [262, 8], [150, 30], [-180, 30], [-284, 16], [-304, -30]]);
    hD += LOOP(hull, 100) + ' ';
    hF += LOOP([[-316, -86], [-200, -72], [0, -66], [180, -72], [322, -96], [318, -78], [180, -54], [0, -48], [-200, -54], [-312, -66]], 101) + ' ';
    hS += LOOP([[-310, -50], [-200, -40], [0, -34], [180, -40], [312, -62], [306, -50], [180, -28], [0, -22], [-200, -28], [-306, -38]], 102) + ' ';
    hI += P(hull, 100, 7, { closed: true }) + ' ';
    hI += P([[-318, -104], [-200, -90], [0, -84], [180, -90], [326, -114]], 103, 6) + ' ';
    for (let j = 0; j < 9; j++) { const x = -300 + j * 76, yy = -86 + Math.abs(x) * 0.0 - (x > 150 ? (x - 150) * 0.12 : 0); hI += P([[x, yy + 18], [x, yy - 2]], 110 + j, 3) + ' '; }
    for (let j = 0; j < 5; j++) hI += P([[-260 + j * 120, 6], [-200 + j * 120, 4]], 120 + j, 2.5, { amp: 1 }) + ' ';
    // deckhouse peeking over the rail
    const dh = [[-90, -84], [-88, -134], [20, -136], [22, -84]];
    hF += LOOP(dh, 130, { smooth: false }) + ' '; hI += P(dh, 130, 5, { closed: true, smooth: false }) + ' ';
    hI += P([[-60, -120], [-40, -120]], 131, 3) + ' ' + P([[-10, -120], [10, -120]], 132, 3) + ' ';
    // ensign at the gaff peak (or the main top when the main is furled)
    if (o.flag) {
      const fx = sails.main === 'set' ? -345 : MM - 4, fy = sails.main === 'set' ? -540 : -630, fl = Math.sin(t * 4) * 6;
      const fp = [[fx, fy], [fx - 70, fy + 4 + fl], [fx - 72, fy + 46 + fl], [fx, fy + 42]];
      mast += P([[fx, fy], [fx, fy + 50]], 140, 3) + ' ';
      if (o.flag === 'uk') { fR += LOOP(fp, 141) + ' '; fF += LOOP([[fx - 4, fy + 4], [fx - 30, fy + 5 + fl * 0.4], [fx - 30, fy + 22 + fl * 0.4], [fx - 4, fy + 22]], 142) + ' '; fB += LOOP([[fx - 8, fy + 7], [fx - 26, fy + 8 + fl * 0.4], [fx - 26, fy + 19 + fl * 0.4], [fx - 8, fy + 19]], 143) + ' '; }
      else { fF += LOOP(fp, 141) + ' '; for (let j = 0; j < 3; j++) fR += LOOP([[fx, fy + 6 + j * 13], [fx - 70, fy + 10 + j * 13 + fl], [fx - 70, fy + 16 + j * 13 + fl], [fx, fy + 12 + j * 13]], 144 + j, { amp: 0.6 }) + ' '; fB += LOOP([[fx - 2, fy + 2], [fx - 30, fy + 3 + fl * 0.4], [fx - 30, fy + 22 + fl * 0.4], [fx - 2, fy + 22]], 143) + ' '; }
      hI += P(fp, 141, 3, { closed: true }) + ' ';
    }
    // tiny crew on deck
    const nCrew = o.crew || 0, ca2 = o.crewA ?? 1;
    if (nCrew && ca2 > 0.02) {
      for (let j = 0; j < nCrew; j++) {
        const x = -240 + j * (430 / Math.max(1, nCrew - 1)) + (j % 2 ? 20 : 0), gy = -86, hh = 74, sw = Math.sin(t * 2 + j) * 3;
        const [hx, hy] = T(x, gy - hh), r = 11 * k;
        cF += inkLoop(circ(hx, hy, r, 10), { seed: sd + 160 + j, t, amp: 0.6 }) + ' ';
        cI += inkPath(circ(hx, hy, r, 10), { seed: sd + 160 + j, t, closed: true, w: w(4), amp: 0.6 }) + ' ';
        cI += P([[x, gy - hh + 12], [x, gy - 30]], 170 + j, 5) + ' ' + P([[x - 16, gy - 36 + sw], [x, gy - 52], [x + 16, gy - 40 - sw]], 180 + j, 4) + ' ';
      }
    }
    const al = o.alpha ?? 1;
    const set = (n, d, op) => { n.setAttribute('d', d); if (op != null) n.setAttribute('fill-opacity', op); };
    set(S.rig, rig, 0.8 * al); set(S.mast, mast, al); set(S.sailF, sF, al); set(S.sailS, sS, 0.5 * al); set(S.sailI, sI, al); set(S.stripI, stI, al); set(S.stripF, stF, al);
    set(S.hullD, hD, al); set(S.hullF, hF, al); set(S.hullS, hS, 0.85 * al); set(S.hullI, hI, al); set(S.flagR, fR, al); set(S.flagF, fF, al); set(S.flagB, fB, al);
    set(S.crewF, cF, ca2 * al); set(S.crewI, cI, ca2 * al);
    // water in front of the hull bottom (same paper-dark as the sea, with a wave line + foam ticks)
    const fw = o.frontW ?? 420, wp = [];
    for (let i = 0; i <= 16; i++) { const x = cx - fw * k + i * (2 * fw * k) / 16; wp.push([x, cy + 4 * k + Math.sin(i * 1.3 + t * 2.4) * 7 * k]); }
    S.front.setAttribute('d', inkLoop(wp.concat([[cx + fw * k, cy + 70 * k], [cx - fw * k, cy + 70 * k]]), { seed: sd + 190, t, amp: 1, smooth: false }));
    S.frontI.setAttribute('d', inkPath(wp, { seed: sd + 191, t, w: w(4), amp: 1 }));
    return T;
  }

  // ------------------------------------------------------------------ shared: rowing boat with cast rigs inside
  function makeBoat(parent, B, seed, i) {
    const g = el(parent, 'g');
    const oarI = inkEl(g), castG = el(g, 'g'), hullF = inkEl(g, INK.paperLight), hullI = inkEl(g), front = inkEl(g, INK.paperDark), frontI = inkEl(g, INK.inkSoft);
    const sc = B.scale ?? 1;
    const cast = makeCast(castG, B.cast, seed + 50 + i * 17, 0.34 * sc);
    return { B, g, oarI, hullF, hullI, front, frontI, cast, sc, i };
  }
  function updBoat(b, t, lt, dur, cues, W, H, sd) {
    const B = b.B, sc = b.sc, L = 300 * sc, at = atOr(cues, B.at, 0), d = B.dur ?? Math.max(1, dur - at);
    const x = lerp((B.x ?? 0.3) * W, (B.to ?? B.x ?? 0.3) * W, B.to != null ? progIO(lt, at, d) : 0);
    const cy = (B.y ?? 0.86) * H + Math.sin(t * 2.1 + b.i) * 6 * sc, rock = Math.sin(t * 1.7 + b.i) * 3, face = B.face ?? 1;
    const a = rock * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    const T = (u, v) => { const X = u * face, Y = v; return [x + X * ca - Y * sa, cy + X * sa + Y * ca]; };
    const hull = [[-L * 0.5, -L * 0.2], [-L * 0.1, -L * 0.15], [L * 0.3, -L * 0.17], [L * 0.54, -L * 0.25], [L * 0.42, L * 0.02], [L * 0.1, L * 0.07], [-L * 0.36, L * 0.06], [-L * 0.5, -L * 0.05]].map(p => T(p[0], p[1]));
    b.hullF.setAttribute('d', inkLoop(hull, { seed: sd + 300 + b.i * 9, t, amp: 1.2 }));
    b.hullI.setAttribute('d', inkPath(hull, { seed: sd + 300 + b.i * 9, t, w: 6, closed: true }) + ' ' + inkPath([T(-L * 0.48, -L * 0.12), T(L * 0.1, -L * 0.08), T(L * 0.5, -L * 0.17)], { seed: sd + 301 + b.i * 9, t, w: 3 }));
    let od = '';
    if (B.oars !== false) {
      const rowing = B.to != null && lt >= at && lt < at + d ? 1 : 0.35, ph = t * (rowing > 0.5 ? 5.2 : 2);
      [-0.05, 0.2].forEach((u, j) => {
        const pv = T(L * u, -L * 0.17), ang = 0.9 + Math.sin(ph + j * 0.4) * 0.45 * rowing;
        const bl = [pv[0] - Math.cos(ang) * L * 0.55 * face, pv[1] + Math.sin(ang) * L * 0.55];
        const hd = [pv[0] + Math.cos(ang) * L * 0.18 * face, pv[1] - Math.sin(ang) * L * 0.18];
        od += inkPath([hd, pv, bl], { seed: sd + 320 + j + b.i * 9, t, w: 5 }) + ' ';
        od += inkPath([[bl[0] - 10, bl[1] - 4], [bl[0] - 34 * face, bl[1] + 10]], { seed: sd + 330 + j + b.i * 9, t, w: 12 }) + ' ';
      });
    }
    b.oarI.setAttribute('d', od);
    const wp = []; for (let i = 0; i <= 10; i++) { const xx = x - L * 0.7 + i * L * 1.4 / 10; wp.push([xx, cy + L * 0.02 + Math.sin(i * 1.4 + t * 2.6) * 6]); }
    b.front.setAttribute('d', inkLoop(wp.concat([[x + L * 0.7, cy + L * 0.3], [x - L * 0.7, cy + L * 0.3]]), { seed: sd + 340 + b.i, t, amp: 1, smooth: false }));
    b.frontI.setAttribute('d', inkPath(wp, { seed: sd + 341 + b.i, t, w: 4, amp: 1 }));
    updCast(b.cast, t, lt, cues, W, H, (m) => { const p = T(m.c.dx ?? 0, -L * 0.02); return [p[0], p[1]]; });
  }

  // ------------------------------------------------------------------ shared: sky (clouds, gulls) and sea
  function makeSky(parent, seed, n, ng) {
    const r = rng(seed * 7 + 11);
    const clouds = Array.from({ length: n }, (_, i) => ({ x: r(), y: 0.1 + r() * 0.18, w: 160 + r() * 140, v: 6 + r() * 8 }));
    const gulls = Array.from({ length: ng }, (_, i) => ({ x: r(), y: 0.12 + r() * 0.2, v: 30 + r() * 30, s: 0.8 + r() * 0.5 }));
    return { clouds, gulls, cF: inkEl(parent, INK.paperLight), cI: inkEl(parent, INK.inkSoft), gI: inkEl(parent) };
  }
  function updSky(S, t, W, H, sd) {
    let f = '', d = '', gd = '';
    S.clouds.forEach((c, i) => {
      const x = ((c.x * (W + 400) + t * c.v) % (W + 400)) - 200, y = c.y * H, w = c.w, pts = [];
      for (let j = 0; j <= 8; j++) { const u = j / 8, a = Math.PI * u; pts.push([x - w / 2 + u * w, y - Math.sin(a) * w * 0.32 - (j % 2 ? w * 0.08 : 0)]); }
      pts.push([x + w / 2 + 10, y + 6], [x - w / 2 - 10, y + 6]);
      f += inkLoop(pts, { seed: sd + 500 + i, t, amp: 1 }) + ' ';
      d += inkPath(pts, { seed: sd + 500 + i, t, w: 3, closed: true, amp: 1 }) + ' ';
    });
    S.gulls.forEach((g, i) => {
      const x = ((g.x * (W + 300) + t * g.v) % (W + 300)) - 150, y = g.y * H + Math.sin(t * 1.4 + i) * 12, s = 26 * g.s, fl = Math.sin(t * 6 + i * 2) * 10;
      gd += inkPath([[x - s, y - 6 + fl], [x - s * 0.4, y - 10], [x, y], [x + s * 0.4, y - 10], [x + s, y - 6 + fl]], { seed: sd + 520 + i, t, w: 3.5 }) + ' ';
    });
    S.cF.setAttribute('d', f); S.cI.setAttribute('d', d); S.gI.setAttribute('d', gd);
  }
  function seaPaths(t, W, H, hy, sd, rows = 7) {
    const wv = []; for (let i = 0; i <= 30; i++) { const x = -80 + i * (W + 160) / 30; wv.push([x, hy + Math.sin(i * 1.1 + t * 0.8) * 2]); }
    const body = inkLoop(wv.concat([[W + 80, H + 80], [-80, H + 80]]), { seed: sd + 1, t, amp: 0.8, smooth: false });
    const line = inkPath(wv, { seed: sd + 2, t, w: 4, amp: 0.8 });
    let hatch = '';
    for (let r = 0; r < rows; r++) {
      const v = (r + 1) / (rows + 1), y = hy + Math.pow(v, 1.5) * (H - hy), sp = 160 + v * 220, len = 40 + v * 90, n = Math.ceil(W / sp) + 2;
      for (let j = 0; j < n; j++) {
        const x = ((j * sp + r * 73 + t * (10 + v * 30)) % (W + sp)) - sp / 2, pts = [];
        for (let q = 0; q <= 4; q++) pts.push([x + q * len / 4, y + Math.sin(q * 1.6 + t * 2 + j) * (2 + v * 4)]);
        hatch += inkPath(pts, { seed: sd + 30 + r * 40 + j, t, w: 2 + v * 2.5, amp: 0.8 }) + ' ';
      }
    }
    return { body, line, hatch };
  }

  // ================================================================== mcA_sea
  SH.mcA_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000, hy = (P.horizon ?? 0.46) * H;
      const cam = el(svg, 'g');
      const sky = makeSky(cam, seed, P.clouds ?? 3, P.gulls ?? 3);
      const seaF = inkEl(cam, INK.paperDark), seaL = inkEl(cam, INK.inkSoft), seaH = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.55 });
      const ships = (P.ships || []).map((s, i) => ({ s, i, S: makeShip(cam) }));
      ships.sort((a, b) => (a.s.y ?? 0.8) - (b.s.y ?? 0.8));
      ships.forEach(o => cam.appendChild(o.S.g));
      const yawlG = el(cam, 'g'), yawlF = inkEl(yawlG, INK.paperLight), yawlI = inkEl(yawlG), yawlC = inkEl(yawlG, INK.paperLight), yawlCI = inkEl(yawlG);
      const callI = inkEl(cam, INK.inkSoft);
      const boats = (P.boats || []).map((b, i) => makeBoat(cam, b, seed, i));
      // foreground deck (watching ship)
      const D = P.deck ? Object.assign({ y: 0.9, rail: 0.74, mast: 0.07 }, P.deck) : null;
      const deckG = el(cam, 'g'), bulF = inkEl(deckG, INK.paper), bulS = inkEl(deckG, INK.inkSoft, { 'fill-opacity': 0.6 }), bulI = inkEl(deckG), mastI = inkEl(deckG), flagR = inkEl(deckG, INK.red), flagB = inkEl(deckG, INK.blue), flagG = inkEl(deckG, INK.gold), flagI = inkEl(deckG);
      const castG = el(cam, 'g');
      const cast = makeCast(castG, P.cast, seed, 0.55);
      const deckF = inkEl(cam, INK.paperLight), deckI = inkEl(cam);
      const labels = makeLabels(svg, P.labels);
      const counter = makeCounter(svg, P.counter);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur))), fc = P.focus || [0.5, 0.55];
          const roll = D ? Math.sin(t * 0.9) * 1.2 : 0;
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(fc[0] * W)} ${f1(fc[1] * H)}) scale(${z.toFixed(4)}) rotate(${f1(roll)}) translate(${f1(-fc[0] * W)} ${f1(-fc[1] * H)})`);
          updSky(sky, t, W, H, sd);
          const sp = seaPaths(t, W, H, hy, sd);
          seaF.setAttribute('d', sp.body); seaL.setAttribute('d', sp.line); seaH.setAttribute('d', sp.hatch);
          let yawlD = { f: '', i: '', c: '', ci: '' };
          ships.forEach(({ s, i, S }) => {
            const at = atOr(cues, s.at, 0), d = s.dur ?? Math.max(1, dur - at);
            const x = lerp((s.x ?? 0.6) * W, (s.to ?? s.x ?? 0.6) * W, s.to != null ? progIO(lt, at, d) : 0);
            const wan = s.wander || 0, k = (s.scale ?? 1) * (1 + wan * 0.0);
            const yy = (s.y ?? 0.8) * H + Math.sin(t * 1.5 + i) * 8 * k;
            const roll = Math.sin(t * 1.1 + i * 2) * (s.roll ?? 2.5) + wan * Math.sin(t * 0.7 + 1) * 5;
            const yaw = 1 - wan * 0.22 * (0.5 + 0.5 * Math.sin(t * 0.55));            // the hull swings round: squeeze
            const cf = atOr(cues, s.crew_fade, null), crewA = cf == null ? 1 : 1 - clamp01((lt - cf) / 1.2);
            const gh = atOr(cues, s.ghost, null), alpha = gh == null ? 1 : lerp(1, 0.28, clamp01((lt - gh) / 1.5));
            const sp2 = spring(lt, at - 0.6, 0.9);
            const T = drawShip(S, { cx: x, cy: yy, k: k * yaw * lerp(0.92, 1, sp2), face: s.face || 1, roll, t, sd: sd + 2000 + i * 400, sails: s.sails || 'full', flag: s.flag, crew: s.crew, crewA, alpha });
            S.g.setAttribute('transform', yaw < 1 ? `translate(${f1(x)} ${f1(yy)}) scale(1 ${(1 / yaw * 0 + 1).toFixed(3)}) translate(${f1(-x)} ${f1(-yy)})` : '');
            // the ship's boat lowered on the near side and rowed off
            if (s.yawl) {
              const Y = s.yawl, ya = atOr(cues, Y.at, 0.5), dn = Y.down ?? 1.6, ra = atOr(cues, Y.row, ya + dn + 0.2);
              const p0 = T(-20, -150), p1 = T(-40, 14), down = progIO(lt, ya, dn);
              let bx = lerp(p0[0], p1[0], down), by = lerp(p0[1], p1[1], down);
              const rp = progIO(lt, ra, Math.max(1, dur - ra)), tx = (Y.to ?? -0.3) * W;
              bx = lerp(bx, tx, rp); by = (Y.y != null ? lerp(by, Y.y * H, rp) : by + rp * 30 * k) + Math.sin(t * 2.4) * 4 * down;
              const ys = Y.scale ?? 1, L = 230 * k * ys * (1 + rp * (Y.grow ?? 0.3)), fc2 = tx < p1[0] ? -1 : 1;
              const hp = [[-L * 0.5, -L * 0.22], [L * 0.5, -L * 0.26], [L * 0.4, 0], [-L * 0.38, 0.02 * L]].map(q => [bx + q[0] * fc2, by + q[1]]);
              yawlD.f += inkLoop(hp, { seed: sd + 700, t }) + ' ';
              yawlD.i += inkPath(hp, { seed: sd + 700, t, w: 4 * Math.sqrt(ys), closed: true }) + ' ' + inkPath([[bx - L * 0.46 * fc2, by - L * 0.15], [bx + L * 0.46 * fc2, by - L * 0.18]], { seed: sd + 703, t, w: 2.5 * Math.sqrt(ys) }) + ' ';
              if (lt < ya + dn) { yawlD.i += inkPath([T(-80, -560), [bx - L * 0.4 * fc2, by - L * 0.22]], { seed: sd + 701, t, w: 2.5 }) + ' ' + inkPath([T(40, -560), [bx + L * 0.4 * fc2, by - L * 0.24]], { seed: sd + 702, t, w: 2.5 }) + ' '; }
              const nF = Y.figures ?? 4;
              for (let j = 0; j < nF; j++) {
                const fx = bx + (-L * 0.35 + j * L * 0.7 / Math.max(1, nF - 1)) * fc2, fy = by - L * 0.22, hh = L * 0.36, r = L * 0.07, sw = Math.sin(t * 5 + j) * 5 * rp;
                yawlD.c += inkLoop(circ(fx + sw, fy - hh, r, 10), { seed: sd + 710 + j, t, amp: 0.6 }) + ' ';
                yawlD.ci += inkPath(circ(fx + sw, fy - hh, r, 10), { seed: sd + 710 + j, t, closed: true, w: 3, amp: 0.6 }) + ' ' + inkPath([[fx + sw, fy - hh + r], [fx, fy]], { seed: sd + 720 + j, t, w: 4 }) + ' ';
                if (rp > 0) yawlD.ci += inkPath([[fx + sw, fy - hh * 0.6], [fx - L * 0.25 * fc2 + sw * 2, fy + L * 0.15]], { seed: sd + 730 + j, t, w: 3 }) + ' ';
              }
            }
          });
          yawlF.setAttribute('d', yawlD.f); yawlI.setAttribute('d', yawlD.i); yawlC.setAttribute('d', yawlD.c); yawlCI.setAttribute('d', yawlD.ci);
          boats.forEach(b => updBoat(b, t, lt, dur, cues, W, H, sd));
          // shout arcs
          let cd = '';
          (P.calls || []).forEach((C, i) => {
            const at = atOr(cues, C.at, 0.5), d = C.dur ?? 1.6; if (lt < at || lt > at + d + 0.4) return;
            const x = C.x * W, y = C.y * H, dir = C.dir ?? 1;
            for (let j = 0; j < 3; j++) {
              const ph = ((lt - at) * 1.6 + j / 3) % 1, r = 30 + ph * 110, pts = [];
              for (let q = -3; q <= 3; q++) { const a = q * 0.22; pts.push([x + dir * Math.cos(a) * r, y + Math.sin(a) * r]); }
              cd += inkPath(pts, { seed: sd + 800 + i * 5 + j, t, w: lerp(7, 2, ph) }) + ' ';
            }
          });
          callI.setAttribute('d', cd);
          // foreground deck
          if (D) {
            const ry = D.rail * H, dy = D.y * H;
            const bw = [[-60, ry], [W + 60, ry - 8], [W + 60, dy], [-60, dy]];
            bulF.setAttribute('d', inkLoop(bw, { seed: sd + 900, t, smooth: false }));
            let bs = ''; for (let j = 1; j < 3; j++) bs += inkPath([[-60, lerp(ry, dy, j / 3)], [W + 60, lerp(ry - 8, dy, j / 3)]], { seed: sd + 901 + j, t, w: 2.5 }) + ' ';
            bulS.setAttribute('d', bs);
            let bi = inkPath([[-60, ry], [W + 60, ry - 8]], { seed: sd + 905, t, w: 12 }) + ' ';
            for (let j = 0; j < 9; j++) { const x = 80 + j * (W - 160) / 8; bi += inkPath([[x, ry + 4], [x, dy]], { seed: sd + 910 + j, t, w: 5 }) + ' '; }
            bulI.setAttribute('d', bi);
            deckF.setAttribute('d', inkLoop([[-60, dy], [W + 60, dy], [W + 60, H + 60], [-60, H + 60]], { seed: sd + 930, t, smooth: false }));
            let dd = inkPath([[-60, dy], [W + 60, dy]], { seed: sd + 931, t, w: 6 }) + ' ';
            for (let j = 1; j < 4; j++) dd += inkPath([[-60, dy + j * 26], [W + 60, dy + j * 26]], { seed: sd + 932 + j, t, w: 2 }) + ' ';
            deckI.setAttribute('d', dd);
            let md = '';
            if (D.mast !== false) {
              const mx = D.mast * W;
              md += inkPath([[mx, -40], [mx + 4, dy]], { seed: sd + 940, t, w: 26 }) + ' ' + inkPath([[mx + 14, -40], [mx + 220, ry]], { seed: sd + 941, t, w: 4 }) + ' ' + inkPath([[mx - 10, -40], [mx - 160, ry]], { seed: sd + 942, t, w: 4 }) + ' ';
            }
            // signal flags on a halyard
            let fr = '', fb = '', fg = '', fi = '';
            if (P.flags) {
              const F = P.flags, fa = atOr(cues, F.at, 0.5), up = progIO(lt, fa, 1.4), hx = (F.x ?? (D.mast !== false ? D.mast + 0.025 : 0.08)) * W;
              const top = (F.top ?? 0.18) * H, bottom = ry - 10, y0 = lerp(bottom, top, up);
              fi += inkPath([[hx, -30], [hx, ry]], { seed: sd + 950, t, w: 2.5 }) + ' ';
              [fr, fb, fg] = ['', '', ''];
              const acc = ['', '', ''];
              for (let j = 0; j < 3; j++) {
                const y = y0 + j * 74, fl = Math.sin(t * 4.5 + j) * 8, pts = [[hx, y], [hx + 92, y + 6 + fl], [hx + 90, y + 58 + fl], [hx, y + 60]];
                acc[j] = inkLoop(pts, { seed: sd + 960 + j, t });
                fi += inkPath(pts, { seed: sd + 960 + j, t, w: 4, closed: true }) + ' ';
              }
              fr = acc[0]; fb = acc[1]; fg = acc[2];
            }
            flagR.setAttribute('d', fr); flagB.setAttribute('d', fb); flagG.setAttribute('d', fg); flagI.setAttribute('d', fi);
            mastI.setAttribute('d', md);
          }
          updCast(cast, t, lt, cues, W, H, (m, x, y) => [x, m.c.y != null ? y : (D ? D.y * H : y)]);
          updLabels(labels, t, lt, dur, cues, W, H, sd);
          updCounter(counter, lt, dur, cues, W, H);
        },
      };
    },
  };

  // ================================================================== mcA_hull
  function barrelPaths(x, y, w, h, t, s) {   // standing barrel, bottom centre at (x, y)
    const pts = [[x - w * 0.42, y], [x - w * 0.5, y - h * 0.5], [x - w * 0.42, y - h], [x + w * 0.42, y - h], [x + w * 0.5, y - h * 0.5], [x + w * 0.42, y]];
    const f = inkLoop(pts, { seed: s, t, amp: 0.9 });
    let d = inkPath(pts, { seed: s, t, w: 4, closed: true, amp: 0.9 }) + ' ';
    [0.2, 0.8].forEach((v, j) => { const yy = y - h * v, ww = w * (0.46 + 0.04 * Math.sin(v * Math.PI)); d += inkPath([[x - ww, yy], [x, yy + 4], [x + ww, yy]], { seed: s + 1 + j, t, w: 3, amp: 0.8 }) + ' '; });
    return { f, d };
  }
  SH.mcA_hull = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000, mode = P.mode || 'hold';
      const cam = el(svg, 'g');
      const mk = (fill, ex) => inkEl(cam, fill, ex);
      let api = {};
      if (mode === 'stern') {
        const sky = makeSky(cam, seed, 2, 3);
        const seaF = mk(INK.paperDark), seaL = mk(INK.inkSoft), seaH = mk(INK.inkSoft, { 'fill-opacity': 0.5 });
        const sG = el(cam, 'g'), mastB = inkEl(sG), sD = inkEl(sG, INK.paperDark), sF = inkEl(sG, INK.paperLight), sS = inkEl(sG, INK.inkSoft, { 'fill-opacity': 0.7 }), sI = inkEl(sG), winF = inkEl(sG, INK.gold, { 'fill-opacity': 0.55 });
        const name = U(P.name || 'Mary Celeste');
        const letters = [...name].map(ch => { const tx = el(sG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 96, 'text-anchor': 'middle', fill: INK.gold, style: `paint-order: stroke; stroke: ${INK.ink}; stroke-width: 7px; stroke-linejoin: round` }); tx.textContent = ch; return tx; });
        const frontS = mk(INK.paperDark), frontSI = mk(INK.inkSoft);
        const boats = (P.boats || []).map((b, i) => makeBoat(cam, b, seed, i));
        const labels = makeLabels(svg, P.labels);
        api.update = (lt, dur, cues, env = {}) => {
          const t = env.t ?? lt, hy = 0.42 * H, wl = 0.74 * H;
          const z = lerp(1, P.zoom ?? 1.08, progIO(lt, 0, Math.max(1, dur))), fc = P.focus || [0.55, 0.45];
          cam.setAttribute('transform', `translate(${f1(fc[0] * W)} ${f1(fc[1] * H)}) scale(${z.toFixed(4)}) translate(${f1(-fc[0] * W)} ${f1(-fc[1] * H)})`);
          updSky(sky, t, W, H, sd);
          const sp = seaPaths(t, W, H, hy, sd, 6); seaF.setAttribute('d', sp.body); seaL.setAttribute('d', sp.line); seaH.setAttribute('d', sp.hatch);
          const cx = 0.56 * W, bob = Math.sin(t * 1.3) * 14, rl = Math.sin(t * 0.9) * 2;
          sG.setAttribute('transform', `translate(0 ${f1(bob)}) rotate(${f1(rl)} ${f1(cx)} ${f1(wl)})`);
          // transom seen from astern: square taffrail, flat stern board, sides tucking in to the rudder; masts behind
          const top = 0.2 * H, tw = 0.3 * W, bh = wl - top;
          let mb = '';
          [[-0.42, 1.0], [0.36, 0.92]].forEach(([u, k2], j) => {
            const mx = cx + u * tw * 0.7, mtop = -60;
            mb += inkPath([[mx, top + 10], [mx + 3, mtop]], { seed: sd + 60 + j, t, w: 16 * k2 }) + ' ';
            [0.1, 0.42, 0.7].forEach((v, q) => { const yy = lerp(top, mtop, v), hw2 = (140 - q * 30) * k2; mb += inkPath([[mx - hw2, yy + 4], [mx + hw2, yy - 4]], { seed: sd + 64 + j * 5 + q, t, w: 7 }) + ' '; });
            mb += inkPath([[mx, lerp(top, mtop, 0.5)], [cx - tw * 0.98, top]], { seed: sd + 75 + j, t, w: 3 }) + ' ' + inkPath([[mx, lerp(top, mtop, 0.5)], [cx + tw * 0.98, top]], { seed: sd + 77 + j, t, w: 3 }) + ' ';
          });
          mastB.setAttribute('d', mb);
          const tr = [[cx - tw, top + 46], [cx, top + 40], [cx + tw, top + 46], [cx + tw * 0.98, top + bh * 0.35], [cx + tw * 0.9, top + bh * 0.62], [cx + tw * 0.7, wl - 10], [cx + tw * 0.42, wl + 80], [cx - tw * 0.42, wl + 80], [cx - tw * 0.7, wl - 10], [cx - tw * 0.9, top + bh * 0.62], [cx - tw * 0.98, top + bh * 0.35]];
          sD.setAttribute('d', inkLoop(tr, { seed: sd + 10, t, smooth: false }));
          let ink = inkPath(tr, { seed: sd + 10, t, w: 8, closed: true, smooth: false }) + ' ', soft = '';
          // taffrail with balusters
          ink += inkPath([[cx - tw - 16, top], [cx, top - 8], [cx + tw + 16, top]], { seed: sd + 13, t, w: 12 }) + ' ';
          for (let j = 0; j <= 14; j++) { const x = cx - tw + j * (2 * tw) / 14; ink += inkPath([[x, top + 2], [x, top + 44]], { seed: sd + 14 + j, t, w: 4 }) + ' '; }
          const nb = [[cx - tw * 0.9, top + 150], [cx + tw * 0.9, top + 150], [cx + tw * 0.88, top + 280], [cx - tw * 0.88, top + 280]];
          sF.setAttribute('d', inkLoop(nb, { seed: sd + 11, t, smooth: false }));
          ink += inkPath(nb, { seed: sd + 11, t, w: 6, closed: true, smooth: false }) + ' ' + inkPath([[cx - tw, top + 120], [cx + tw, top + 120]], { seed: sd + 12, t, w: 5 }) + ' ';
          for (let j = 0; j < 6; j++) { const y = top + 320 + j * 44, f = clamp01((y - top) / bh), hw = lerp(tw * 0.98, tw * 0.66, f * f) - 14; if (y > wl + 40) break; soft += inkLoop([[cx - hw, y], [cx + hw, y], [cx + hw, y + 5], [cx - hw, y + 5]], { seed: sd + 20 + j, t, amp: 0.8 }) + ' '; }
          // stern windows (between taffrail and name board)
          let wf = '';
          [-0.6, -0.2, 0.2, 0.6].forEach((u, j) => { const wx = cx + u * tw, wy = top + 62, q = [[wx - 36, wy], [wx + 36, wy], [wx + 36, wy + 44], [wx - 36, wy + 44]]; wf += inkLoop(q, { seed: sd + 30 + j, t, smooth: false }) + ' '; ink += inkPath(q, { seed: sd + 30 + j, t, w: 4, closed: true, smooth: false }) + ' ' + inkPath([[wx, wy], [wx, wy + 44]], { seed: sd + 35 + j, t, w: 3 }) + ' '; });
          // rudder
          const rd = [[cx - 24, top + 300], [cx + 24, top + 300], [cx + 38, wl + 80], [cx - 38, wl + 80]];
          ink += inkPath(rd, { seed: sd + 40, t, w: 6, closed: true, smooth: false }) + ' ';
          sS.setAttribute('d', soft + inkLoop(rd, { seed: sd + 40, t, smooth: false }));
          sI.setAttribute('d', ink); winF.setAttribute('d', wf);
          // name letters
          const na = atOr(cues, 'name', 0.4), n = letters.length, endT = Math.max(na + 0.9, dur * 0.7), step = Math.max(0.03, (endT - na - 0.35) / n), span = tw * 1.62, ny = top + 252;
          letters.forEach((tx, j) => {
            const p = spring(lt, na + j * step, 0.45), x = cx - span / 2 + (j + 0.5) * span / n;
            tx.setAttribute('x', f1(x)); tx.setAttribute('y', f1(ny));
            tx.setAttribute('font-size', Math.round(Math.min(104, span / n * 1.5)));
            tx.style.display = lt < na + j * step ? 'none' : '';
            tx.setAttribute('transform', `translate(${f1(x)} ${f1(ny)}) scale(${lerp(0.3, 1, p).toFixed(3)}) rotate(${f1((1 - p) * -10)}) translate(${f1(-x)} ${f1(-ny)})`);
          });
          const wp = []; for (let i = 0; i <= 18; i++) { const x = cx - tw * 1.3 + i * tw * 2.6 / 18; wp.push([x, wl + bob + Math.sin(i * 1.2 + t * 2.4) * 10]); }
          frontS.setAttribute('d', inkLoop(wp.concat([[cx + tw * 1.3, H + 40], [cx - tw * 1.3, H + 40]]), { seed: sd + 50, t, amp: 1, smooth: false }));
          frontSI.setAttribute('d', inkPath(wp, { seed: sd + 51, t, w: 5 }));
          boats.forEach(b => updBoat(b, t, lt, dur, cues, W, H, sd));
          updLabels(labels, t, lt, dur, cues, W, H, sd);
        };
      } else {
        // ---------------- hold cutaway
        const L = { dy: 0.3 * H, fl: 0.86 * H, x0: 0.06 * W, x1: 0.94 * W };
        const bgF = mk(INK.paperDark, { 'fill-opacity': 0.55 }), ribI = mk(INK.inkSoft, { 'fill-opacity': 0.8 });
        const brlF = mk(INK.paperLight), brlI = mk();
        const wellF = mk(INK.paperLight), wellI = mk();
        const watF = mk(INK.blue, { 'fill-opacity': 0.32 }), watI = mk(INK.blue);
        const rodI = mk(), rodW = mk(INK.blue);
        const hullI = mk(), deckF = mk(INK.paperLight), deckI = mk(), ladI = mk();
        const gaugeI = mk(), gaugeR = mk(INK.red);
        const gaugeT = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 84, 'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        gaugeT.textContent = (P.gauge && P.gauge.text) || '3½ FEET';
        const warnG = el(cam, 'g'), warnF = inkEl(warnG, INK.red), warnFl = inkEl(warnG, INK.gold), warnI = inkEl(warnG);
        const warnT = el(warnG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: INK.paperLight });
        warnT.textContent = U((P.warn && P.warn.text) || 'flammable');
        const castG = el(cam, 'g');
        const cast = makeCast(castG, P.cast, seed, 0.42);
        const labels = makeLabels(svg, P.labels);
        const counter = P.barrels && P.barrels.counter ? makeCounter(svg, Object.assign({ x: 0.5, y: 0.22, size: 110, from: 0, to: 1701, color: 'red' }, P.barrels.counter, { at: P.barrels.counter.at ?? P.barrels.at })) : null;
        // barrel layout: rows from the back (small, higher) to the front
        const BR = P.barrels ? Object.assign({ rows: 3 }, P.barrels) : null;
        const brl = [];
        if (BR) {
          for (let r = 0; r < BR.rows; r++) {
            const sc = 1.15 + r * 0.2, bw = 120 * sc, bh = 150 * sc, y = L.fl - 30 - (BR.rows - 1 - r) * 80, n = Math.floor((L.x1 - L.x0 - 120) / (bw * 1.02));
            for (let j = 0; j < n; j++) {
              const x = L.x0 + 80 + bw / 2 + j * bw * 1.02 + (r % 2) * bw * 0.5;
              if (x > L.x1 - 60 || (P.rod && Math.abs(x - 0.74 * W) < bw * 0.9)) continue;
              brl.push({ x, y, bw, bh, r, j, k: brl.length });
              if (BR.stack && r === BR.rows - 1 && j % 2 === 0) brl.push({ x, y: y - bh * 0.98, bw, bh, r, j, k: brl.length, up: 1 });
            }
          }
        }
        api.update = (lt, dur, cues, env = {}) => {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur))), fc = P.focus || [0.5, 0.6];
          const roll = Math.sin(t * 0.8) * 1.4;
          cam.setAttribute('transform', `translate(${f1(fc[0] * W)} ${f1(fc[1] * H)}) scale(${z.toFixed(4)}) rotate(${f1(roll)}) translate(${f1(-fc[0] * W)} ${f1(-fc[1] * H)})`);
          // hold interior (back wall) + ribs
          const hull = [[L.x0, L.dy], [L.x1, L.dy], [L.x1 - 20, L.fl - 120], [L.x1 - 120, L.fl + 20], [L.x0 + 120, L.fl + 20], [L.x0 + 20, L.fl - 120]];
          bgF.setAttribute('d', inkLoop(hull, { seed: sd + 1, t }));
          let rb = '';
          for (let j = 0; j < 11; j++) { const x = L.x0 + 60 + j * (L.x1 - L.x0 - 120) / 10; rb += inkPath([[x, L.dy + 30], [x + 4, L.fl - 20]], { seed: sd + 10 + j, t, w: 7 }) + ' '; }
          for (let j = 1; j < 4; j++) { const y = lerp(L.dy + 40, L.fl, j / 4); rb += inkPath([[L.x0 + 30, y], [L.x1 - 30, y]], { seed: sd + 30 + j, t, w: 2.5 }) + ' '; }
          ribI.setAttribute('d', rb);
          hullI.setAttribute('d', inkPath(hull, { seed: sd + 1, t, w: 9, closed: true }));
          // deck on top: thick planks band with an open hatch on the left
          const dk = [[L.x0 - 60, L.dy - 34], [L.x1 + 60, L.dy - 34], [L.x1 + 60, L.dy + 8], [L.x0 - 60, L.dy + 8]];
          const hx0 = L.x0 + 180, hx1 = L.x0 + 340;
          deckF.setAttribute('d', inkLoop(dk, { seed: sd + 40, t, smooth: false }));
          let dd = inkPath([[L.x0 - 60, L.dy - 34], [hx0, L.dy - 34]], { seed: sd + 41, t, w: 7 }) + ' ' + inkPath([[hx1, L.dy - 34], [L.x1 + 60, L.dy - 34]], { seed: sd + 42, t, w: 7 }) + ' ' + inkPath([[L.x0 - 60, L.dy + 8], [hx0, L.dy + 8]], { seed: sd + 43, t, w: 5 }) + ' ' + inkPath([[hx1, L.dy + 8], [L.x1 + 60, L.dy + 8]], { seed: sd + 44, t, w: 5 }) + ' ';
          dd += inkPath([[hx0, L.dy - 34], [hx0, L.dy + 8]], { seed: sd + 45, t, w: 5 }) + ' ' + inkPath([[hx1, L.dy - 34], [hx1, L.dy + 8]], { seed: sd + 46, t, w: 5 }) + ' ';
          deckI.setAttribute('d', dd);
          let ld = inkPath([[hx0 + 30, L.dy - 20], [hx0 + 90, L.fl - 10]], { seed: sd + 50, t, w: 6 }) + ' ' + inkPath([[hx0 + 110, L.dy - 20], [hx0 + 170, L.fl - 10]], { seed: sd + 51, t, w: 6 }) + ' ';
          for (let j = 1; j < 8; j++) { const u = j / 8; ld += inkPath([[lerp(hx0 + 30, hx0 + 90, u), lerp(L.dy - 20, L.fl - 10, u)], [lerp(hx0 + 110, hx0 + 170, u), lerp(L.dy - 20, L.fl - 10, u)]], { seed: sd + 52 + j, t, w: 4 }) + ' '; }
          ladI.setAttribute('d', ld);
          // barrels pop in row by row
          let bf = '', bi = '';
          if (BR) {
            const ba = atOr(cues, BR.at, 0.3), bd = BR.dur ?? 2.4, N = brl.length;
            brl.forEach(b => {
              const at = ba + (b.k / Math.max(1, N)) * bd, p = spring(lt, at, 0.45);
              if (p <= 0.01) return;
              const h = b.bh * p, wob = Math.sin(t * 1.2 + b.k) * 1.5;
              const r = barrelPaths(b.x + wob, b.y, b.bw, h, t, sd + 100 + b.k * 3);
              bf += r.f + ' '; bi += r.d + ' ';
            });
          }
          brlF.setAttribute('d', bf); brlI.setAttribute('d', bi);
          // pump well + sounding rod
          let wf = '', wi = '', rd = '', rw = '';
          const wx = 0.74 * W;
          if (P.rod) {
            const pw = [[wx - 34, L.dy - 34], [wx + 34, L.dy - 34], [wx + 34, L.fl - 10], [wx - 34, L.fl - 10]];
            wf = inkLoop(pw, { seed: sd + 60, t, smooth: false });
            wi = inkPath([[wx - 34, L.dy - 34], [wx - 34, L.fl - 10]], { seed: sd + 61, t, w: 6 }) + ' ' + inkPath([[wx + 34, L.dy - 34], [wx + 34, L.fl - 10]], { seed: sd + 62, t, w: 6 });
            const ra = atOr(cues, P.rod.at, 0.6), da = atOr(cues, P.rod.drop, ra + 1.4);
            const lift = progIO(lt, ra, 0.9), drop = progIO(lt, da, 1.3);
            const len = 260;
            // lying on the deck -> stands up over the well -> slides down to the water
            const lx = lerp(wx + 230, wx, lift), ly = L.dy - 44 - lift * 40;
            const ang = lerp(0, Math.PI / 2, lift);
            const topY = lerp(ly - Math.sin(ang) * len, L.fl - 30 - len, drop), botY = topY + Math.sin(ang) * len;
            const x0 = lx - Math.cos(ang) * len / 2, x1 = lx + Math.cos(ang) * len / 2;
            const a0 = [x0, ly + (lift < 1 ? 0 : 0)], seg = lift < 1 ? [[x0, ly], [x1, ly - Math.sin(ang) * len]] : [[wx, topY], [wx, botY]];
            rd = inkPath(seg, { seed: sd + 63, t, w: 18 }) + ' ' + (lift >= 1 ? inkPath([seg[0], [seg[0][0] + 20, Math.min(L.dy - 80, seg[0][1]) - 140]], { seed: sd + 64, t, w: 3 }) : '');
            if (drop > 0.95) { const wy = L.fl - 10 - (P.water ? (P.water.level ?? 0.3) * (L.fl - L.dy) : 120); if (botY > wy) rw = inkLoop([[wx - 7, Math.max(wy, topY)], [wx + 7, Math.max(wy, topY)], [wx + 7, botY], [wx - 7, botY]], { seed: sd + 65, t, smooth: false }); }
            void a0;
          }
          wellF.setAttribute('d', wf); wellI.setAttribute('d', wi);
          // water: rises to its level, sloshes from side to side
          if (P.water) {
            const Wt = P.water, wa = atOr(cues, Wt.at, 0), rise = progIO(lt, wa, Wt.dur ?? 1.6), lvl = (Wt.level ?? 0.3) * (L.fl - L.dy) * rise;
            const tilt = Math.sin(t * 1.1) * 26, pts = [];
            for (let i = 0; i <= 20; i++) { const u = i / 20, x = lerp(L.x0 + 40, L.x1 - 40, u); pts.push([x, L.fl - lvl + (u - 0.5) * 2 * tilt + Math.sin(u * 14 + t * 3) * 5]); }
            watF.setAttribute('d', lvl > 2 ? inkLoop(pts.concat([[L.x1 - 120, L.fl + 18], [L.x0 + 120, L.fl + 18]]), { seed: sd + 70, t, amp: 1, smooth: false }) : '');
            watI.setAttribute('d', lvl > 2 ? inkPath(pts, { seed: sd + 71, t, w: 5 }) : '');
            // gauge on the right
            if (P.gauge) {
              const ga = atOr(cues, P.gauge.at, wa + 1), gp = spring(lt, ga, 0.6), gx = L.x1 - 70;
              let gi = inkPath([[gx, L.fl - 10], [gx, L.fl - 10 - (Wt.level ?? 0.3) * (L.fl - L.dy) * 1.6]], { seed: sd + 80, t, w: 5 }) + ' ';
              for (let j = 0; j <= 8; j++) { const y = L.fl - 10 - j * (Wt.level ?? 0.3) * (L.fl - L.dy) * 0.2; gi += inkPath([[gx - (j % 2 ? 14 : 26), y], [gx + (j % 2 ? 14 : 26), y]], { seed: sd + 81 + j, t, w: 3 }) + ' '; }
              gaugeI.setAttribute('d', lt >= ga - 0.5 ? gi : '');
              const my = L.fl - lvl;
              gaugeR.setAttribute('d', lt >= ga ? inkPath([[gx - 60 * gp, my], [gx + 60 * gp, my]], { seed: sd + 95, t, w: 9 }) + ' ' + inkPath([[gx - 70, my - 22], [gx - 40, my], [gx - 70, my + 22]], { seed: sd + 96, t, w: 6, smooth: false }) : '');
              gaugeT.style.display = lt >= ga ? '' : 'none';
              const tx = gx - 300, ty = my - 70;
              gaugeT.setAttribute('x', tx); gaugeT.setAttribute('y', ty);
              gaugeT.setAttribute('transform', `translate(${f1(tx)} ${f1(ty)}) rotate(-4) scale(${(lerp(0.5, 1, gp) * (1 + punch(lt, ga) * 0.12)).toFixed(3)}) translate(${f1(-tx)} ${f1(-ty)})`);
            } else { gaugeT.style.display = 'none'; }
          } else gaugeT.style.display = 'none';
          rodI.setAttribute('d', rd); rodW.setAttribute('d', rw);
          // warning badge
          if (P.warn) {
            const wa = atOr(cues, P.warn.at, dur * 0.5), p = spring(lt, wa, 0.6), x = (P.warn.x ?? 0.5) * W, y = (P.warn.y ?? 0.2) * H;
            warnG.style.display = lt < wa ? 'none' : '';
            const tw = 520, pill = [];
            for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.2832; pill.push([x + Math.cos(a) * (tw / 2), y - 22 + Math.sin(a) * 52]); }
            warnF.setAttribute('d', inkLoop(pill, { seed: sd + 120, t }));
            warnI.setAttribute('d', inkPath(pill, { seed: sd + 120, t, closed: true, w: 5 }));
            const fx = x - tw / 2 - 50, fy = y + 20, fl = Math.sin(t * 9) * 6, fl2 = Math.cos(t * 7) * 5;
            warnFl.setAttribute('d', inkLoop([[fx - 34, fy], [fx - 30 + fl2, fy - 50], [fx - 8 + fl, fy - 96], [fx + 4, fy - 56], [fx + 20 + fl2, fy - 80], [fx + 34, fy - 30], [fx + 30, fy]], { seed: sd + 121, t }));
            warnT.setAttribute('x', x); warnT.setAttribute('y', y);
            warnG.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(-3) scale(${(lerp(0.5, 1, p) * (1 + punch(lt, wa) * 0.1)).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
          } else warnG.style.display = 'none';
          updCast(cast, t, lt, cues, W, H);
          updLabels(labels, t, lt, dur, cues, W, H, sd);
          updCounter(counter, lt, dur, cues, W, H);
        };
      }
      return api;
    },
  };

  // ================================================================== mcA_deck
  function ghostItem(item, x, y, s) {   // outline points (one or more polylines) of a missing object, centred on x, y
    if (item === 'boat') return [[[x - 230 * s, y - 60 * s], [x + 250 * s, y - 70 * s], [x + 200 * s, y + 10 * s], [x - 180 * s, y + 14 * s]]];
    if (item === 'chrono') return [[[x - 70 * s, y - 60 * s], [x + 70 * s, y - 60 * s], [x + 70 * s, y + 60 * s], [x - 70 * s, y + 60 * s]], circ(x, y, 42 * s, 14), [[x, y - 28 * s], [x, y], [x + 22 * s, y + 8 * s]]];
    if (item === 'sextant') return [[[x, y - 80 * s], [x - 70 * s, y + 50 * s], [x + 70 * s, y + 50 * s]], [[x - 76 * s, y + 46 * s], [x - 30 * s, y + 70 * s], [x + 30 * s, y + 70 * s], [x + 76 * s, y + 46 * s]], [[x, y - 80 * s], [x + 30 * s, y + 60 * s]]];
    if (item === 'papers') return [[[x - 60 * s, y - 70 * s], [x + 50 * s, y - 76 * s], [x + 60 * s, y + 66 * s], [x - 52 * s, y + 72 * s]], [[x - 34 * s, y - 36 * s], [x + 30 * s, y - 38 * s]], [[x - 34 * s, y - 6 * s], [x + 34 * s, y - 8 * s]], [[x - 34 * s, y + 24 * s], [x + 20 * s, y + 22 * s]]];
    return [circ(x, y, 60 * s, 12)];
  }
  SH.mcA_deck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000, mode = P.mode || 'deck';
      const cam = el(svg, 'g');
      const mk = (fill, ex, g = cam) => inkEl(g, fill, ex);
      const L = { hz: 0.36 * H, rail: 0.44 * H, base: 0.6 * H };
      let backCast = null;
      // layers
      const sky = mode === 'deck' ? makeSky(cam, seed, 2, 2) : null;
      const seaF = mk(INK.paperDark), seaH = mk(INK.inkSoft, { 'fill-opacity': 0.5 });
      if (mode === 'deck') backCast = el(cam, 'g');
      const wallF = mk(INK.paper), wallS = mk(INK.inkSoft, { 'fill-opacity': 0.55 }), wallI = mk();
      const houseF = mk(INK.paperLight), houseD = mk(INK.paperDark), houseI = mk();
      const floorF = mk(INK.paperLight), floorS = mk(INK.inkSoft, { 'fill-opacity': 0.5 }), floorI = mk();
      const hatchF = mk(INK.ink, { 'fill-opacity': 0.82 }), hatchI = mk();
      const mastF = mk(INK.paperDark), mastI = mk(), ropeI = mk();
      const propF = mk(INK.paperLight), propD = mk(INK.paperDark), propS = mk(INK.inkSoft, { 'fill-opacity': 0.8 }), propB = mk(INK.blue, { 'fill-opacity': 0.7 }), propR = mk(INK.red, { 'fill-opacity': 0.8 }), propI = mk(), lampG = mk(INK.gold, { 'fill-opacity': 0.6 });
      const ghostI = mk(INK.ink), ghostX = mk(INK.red);
      const slateG = el(cam, 'g'), slateFr = mk(INK.paperDark, {}, slateG), slateF = mk(INK.ink, { 'fill-opacity': 0.92 }, slateG), slateI = mk(undefined, {}, slateG);
      const slateLines = ((P.slate && P.slate.lines) || []).map(Ln => { const tx = el(slateG, 'text', { 'font-family': INK_FONT, 'font-size': 76, 'text-anchor': 'start', fill: INK.paperLight }); tx.textContent = Ln.text; return { Ln, tx }; });
      const soundG = el(cam, 'g');
      const sounds = (P.sounds || []).map(S => { const tx = el(soundG, 'text', { 'font-family': INK_FONT, 'font-size': Math.max(44, S.size || 66), 'text-anchor': 'middle', fill: COL[S.color] || INK.inkSoft, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px` }); tx.textContent = S.text; return { S, tx }; });
      const musterG = el(cam, 'g');
      const MU = P.muster ? Object.assign({ count: 10, at: 0.3, dur: 2.4 }, P.muster) : null;
      const musterRigs = [];
      if (MU) {
        const kinds = MU.kinds || ['captain', 'woman', 'girl', 'sailor', 'sailor', 'sailor', 'sailor', 'sailor', 'sailor', 'sailor'];
        for (let i = 0; i < MU.count; i++) {
          const kd = kinds[i] || 'sailor', sc = kd === 'girl' ? 0.28 : 0.42;
          const rig = KASIF.create(el(musterG, 'g'), { scale: sc, hat: false, accessory: kd === 'sailor' ? 'beret' : null, beard: kd === 'captain' ? 'black' : (kd === 'sailor' && i % 3 === 0 ? 'short' : null), seed: seed + 200 + i * 5 });
          musterRigs.push({ rig, kd, i, sc });
        }
      }
      const frontCast = el(cam, 'g');
      const cast = makeCast(frontCast, P.cast, seed, 0.5);
      const ringI = mk(INK.red);
      const labels = makeLabels(svg, P.labels);
      const counter = MU && MU.counter ? makeCounter(svg, Object.assign({ x: 0.5, y: 0.2, from: 0, to: MU.count, at: MU.at, dur: MU.dur, size: 130 }, MU.counter)) : null;
      const climb = P.climb ? Object.assign({ who: 0, at: 0, dur: 1.4, x0: 0.3 }, P.climb) : null;
      if (climb && cast[climb.who] && backCast) backCast.appendChild(cast[climb.who].rig.node || cast[climb.who].rig.g || frontCast.childNodes[climb.who]);
      const r0 = rng(seed * 5 + 3);
      const ropes = Array.from({ length: 3 }, (_, i) => ({ x: 0.46 + i * 0.05 + r0() * 0.02, len: 0.22 + r0() * 0.12, ph: r0() * 6 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))), fc = P.focus || [0.5, 0.6];
          const roll = Math.sin(t * 0.85) * 1.6;
          cam.setAttribute('transform', `translate(${f1(fc[0] * W)} ${f1(fc[1] * H)}) scale(${z.toFixed(4)}) rotate(${f1(roll)}) translate(${f1(-fc[0] * W)} ${f1(-fc[1] * H)})`);
          let wf = '', ws = '', wi = '', ff = '', fs = '', fi = '', hf = '', hd = '', hi = '';
          let pf = '', pd = '', ps = '', pb = '', pr = '', pi = '', lg = '', mf = '', mi = '', ri = '';
          if (mode === 'deck') {
            updSky(sky, t, W, H, sd);
            const sp = seaPaths(t, W, L.rail + 40, L.hz, sd, 3);
            seaF.setAttribute('d', sp.body); seaH.setAttribute('d', sp.hatch);
            // far bulwark
            const bw = [[-80, L.rail], [W + 80, L.rail], [W + 80, L.base], [-80, L.base]];
            wf += inkLoop(bw, { seed: sd + 1, t, smooth: false }) + ' ';
            wi += inkPath([[-80, L.rail], [W + 80, L.rail]], { seed: sd + 2, t, w: 14 }) + ' ' + inkPath([[-80, L.base], [W + 80, L.base]], { seed: sd + 3, t, w: 5 }) + ' ';
            for (let j = 1; j < 3; j++) ws += inkPath([[-80, lerp(L.rail, L.base, j / 3)], [W + 80, lerp(L.rail, L.base, j / 3)]], { seed: sd + 4 + j, t, w: 2.5 }) + ' ';
            for (let j = 0; j < 10; j++) { const x = 40 + j * (W - 80) / 9; wi += inkPath([[x, L.rail + 6], [x, L.base]], { seed: sd + 10 + j, t, w: 5 }) + ' '; }
            // deck floor with planks converging to a far vanishing point
            ff += inkLoop([[-80, L.base], [W + 80, L.base], [W + 80, H + 80], [-80, H + 80]], { seed: sd + 20, t, smooth: false }) + ' ';
            for (let j = -8; j <= 8; j++) fs += inkPath([[W / 2 + j * 70, L.base], [W / 2 + j * 260, H + 40]], { seed: sd + 30 + j, t, w: 2.5 }) + ' ';
            // deckhouse (right)
            const hx = 0.7 * W, hw = 0.26 * W, ht = 0.18 * H;
            const house = [[hx, ht], [hx + hw, ht - 8], [hx + hw, L.base + 40], [hx, L.base + 40]];
            hf += inkLoop(house, { seed: sd + 40, t, smooth: false }) + ' ';
            hi += inkPath(house, { seed: sd + 40, t, w: 7, closed: true, smooth: false }) + ' ' + inkPath([[hx - 20, ht - 4], [hx + hw + 20, ht - 14]], { seed: sd + 41, t, w: 12 }) + ' ';
            for (let j = 1; j < 5; j++) hi += inkPath([[hx, lerp(ht, L.base + 40, j / 5)], [hx + hw, lerp(ht - 8, L.base + 40, j / 5)]], { seed: sd + 42 + j, t, w: 2.5 }) + ' ';
            // door swinging on its hinge
            const dx = hx + 60, dw = 150, sw = 0.55 + Math.sin(t * 0.9) * 0.35, dtop = ht + 70, dbot = L.base + 40;
            hd += inkLoop([[dx, dtop], [dx + dw, dtop], [dx + dw, dbot], [dx, dbot]], { seed: sd + 50, t, smooth: false }) + ' ';
            const dpts = [[dx, dtop], [dx + dw * (1 - sw), dtop - 10 * sw], [dx + dw * (1 - sw), dbot + 18 * sw], [dx, dbot]];
            hf += inkLoop(dpts, { seed: sd + 51, t, smooth: false }) + ' ';
            hi += inkPath(dpts, { seed: sd + 51, t, w: 5, closed: true, smooth: false }) + ' ' + inkPath([[dx, dtop], [dx + dw, dtop], [dx + dw, dbot]], { seed: sd + 52, t, w: 5, smooth: false }) + ' ';
            // open hatch in the deck
            const hc = [0.5 * W, 0.72 * H], hwid = 150, hdep = 40;
            const hp = [[hc[0] - hwid, hc[1] - hdep], [hc[0] + hwid, hc[1] - hdep], [hc[0] + hwid + 30, hc[1] + hdep], [hc[0] - hwid - 30, hc[1] + hdep]];
            hatchF.setAttribute('d', P.hatch === false ? '' : inkLoop(hp, { seed: sd + 60, t, smooth: false }));
            hatchI.setAttribute('d', P.hatch === false ? '' : inkPath(hp, { seed: sd + 60, t, w: 9, closed: true, smooth: false }) + ' ' + inkPath([[hc[0] - hwid - 50, hc[1] + hdep + 20], [hc[0] + hwid + 50, hc[1] + hdep + 20]], { seed: sd + 61, t, w: 5 }));
            // mainmast with shrouds + swinging loose ropes
            const mx = 0.58 * W;
            mf += inkLoop([[mx - 28, -60], [mx + 28, -60], [mx + 36, L.base + 120], [mx - 36, L.base + 120]], { seed: sd + 70, t, smooth: false }) + ' ';
            mi += inkPath([[mx - 28, -60], [mx - 36, L.base + 120]], { seed: sd + 71, t, w: 7 }) + ' ' + inkPath([[mx + 28, -60], [mx + 36, L.base + 120]], { seed: sd + 72, t, w: 7 }) + ' ';
            mi += inkPath([[mx - 40, 0.55 * H], [mx + 40, 0.55 * H]], { seed: sd + 73, t, w: 10 }) + ' ';
            ri += inkPath([[mx - 20, -40], [mx - 0.16 * W, L.rail]], { seed: sd + 74, t, w: 4 }) + ' ' + inkPath([[mx - 20, -40], [mx - 0.26 * W, L.rail]], { seed: sd + 75, t, w: 4 }) + ' ';
            const slap = atOr(cues, P.slap, null), kick = slap != null && lt >= slap ? Math.exp(-(lt - slap) * 1.4) * 2.2 : 0;
            ropes.forEach((r, i) => {
              const ox = r.x * W, oy = 0.04 * H, len = r.len * H + 200, amp = 0.16 + kick * 0.25, ang = Math.sin(t * 1.6 + r.ph) * amp, pts = [];
              for (let q = 0; q <= 6; q++) { const v = q / 6, aa = ang * (0.4 + v); pts.push([ox + Math.sin(aa) * len * v, oy + Math.cos(aa) * len * v]); }
              ri += inkPath(pts, { seed: sd + 80 + i, t, w: 5 }) + ' ';
            });
            // rope coil on deck
            for (let j = 0; j < 3; j++) ri += inkPath(circ(0.24 * W, 0.92 * H, 70 - j * 16, 14, 22 - j * 5), { seed: sd + 90 + j, t, w: 4, closed: true }) + ' ';
          } else {
            // ---------- cabin interior
            seaF.setAttribute('d', ''); seaH.setAttribute('d', '');
            wf += inkLoop([[-80, -80], [W + 80, -80], [W + 80, 0.74 * H], [-80, 0.74 * H]], { seed: sd + 1, t, smooth: false }) + ' ';
            for (let j = 1; j < 8; j++) ws += inkPath([[-80, j * 0.74 * H / 8], [W + 80, j * 0.74 * H / 8]], { seed: sd + 2 + j, t, w: 2.5 }) + ' ';
            wi += inkPath([[-80, 0.74 * H], [W + 80, 0.74 * H]], { seed: sd + 12, t, w: 7 }) + ' ';
            for (let j = 0; j < 4; j++) { const x = 0.1 * W + j * 0.27 * W; wi += inkPath([[x, -80], [x + 10, 0.74 * H]], { seed: sd + 14 + j, t, w: 9 }) + ' '; }
            ff += inkLoop([[-80, 0.74 * H], [W + 80, 0.74 * H], [W + 80, H + 80], [-80, H + 80]], { seed: sd + 20, t, smooth: false }) + ' ';
            for (let j = -6; j <= 6; j++) fs += inkPath([[W / 2 + j * 120, 0.74 * H], [W / 2 + j * 260, H + 40]], { seed: sd + 30 + j, t, w: 2.5 }) + ' ';
            // shelf with clay pipes (left)
            const sx = 0.08 * W, sy = 0.46 * H, sw2 = 0.3 * W;
            pd += inkLoop([[sx, sy], [sx + sw2, sy], [sx + sw2, sy + 22], [sx, sy + 22]], { seed: sd + 40, t, smooth: false }) + ' ';
            pi += inkPath([[sx, sy], [sx + sw2, sy], [sx + sw2, sy + 22], [sx, sy + 22]], { seed: sd + 40, t, w: 5, closed: true, smooth: false }) + ' ';
            for (let j = 0; j < 3; j++) {
              const px = sx + 70 + j * 170, py = sy - 4;
              pf += inkLoop([[px, py], [px - 10, py - 54], [px + 34, py - 58], [px + 30, py]], { seed: sd + 41 + j, t }) + ' ';
              pi += inkPath([[px, py], [px - 10, py - 54], [px + 34, py - 58], [px + 30, py]], { seed: sd + 41 + j, t, w: 5, closed: true }) + ' ' + inkPath([[px + 30, py - 20], [px + 140, py - 34]], { seed: sd + 45 + j, t, w: 7 }) + ' ';
            }
            // pegs with clothes (middle), swaying with the roll
            for (let j = 0; j < 3; j++) {
              const cx = 0.46 * W + j * 0.13 * W, cy = 0.16 * H, swy = Math.sin(t * 0.85 + j * 0.6) * 0.06;
              pi += inkPath([[cx - 14, cy], [cx + 14, cy]], { seed: sd + 50 + j, t, w: 10 }) + ' ';
              const R = (u, v) => [cx + u * Math.cos(swy) - v * Math.sin(swy), cy + u * Math.sin(swy) + v * Math.cos(swy)];
              const coat = [R(0, 0), R(-70, 30), R(-90, 120), R(-60, 300), R(60, 300), R(90, 120), R(70, 30)].map(p => p);
              (j === 1 ? pb : pd) && null;
              if (j === 1) pb += inkLoop(coat, { seed: sd + 55 + j, t }) + ' '; else if (j === 2) pr += inkLoop(coat, { seed: sd + 55 + j, t }) + ' '; else pd += inkLoop(coat, { seed: sd + 55 + j, t }) + ' ';
              pi += inkPath(coat, { seed: sd + 55 + j, t, w: 5, closed: true }) + ' ' + inkPath([R(0, 10), R(0, 290)], { seed: sd + 60 + j, t, w: 3 }) + ' ';
            }
            // swinging lamp
            const la = Math.sin(t * 0.85) * 0.2, lx = 0.88 * W + Math.sin(la) * 160, ly = 0.06 * H + Math.cos(la) * 160;
            pi += inkPath([[0.88 * W, -20], [lx, ly]], { seed: sd + 70, t, w: 3 }) + ' ';
            const lamp = [[lx - 30, ly], [lx + 30, ly], [lx + 40, ly + 70], [lx - 40, ly + 70]];
            lg += inkLoop(lamp, { seed: sd + 71, t }) + ' '; pi += inkPath(lamp, { seed: sd + 71, t, w: 5, closed: true }) + ' ';
            // sea chests with open lids (floor)
            [[0.2, 0.9, 1], [0.66, 0.92, 1.15]].forEach(([u, v, s], j) => {
              const x = u * W, y = v * H, w = 230 * s, h = 130 * s;
              const box = [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y], [x - w / 2, y]];
              pd += inkLoop(box, { seed: sd + 80 + j, t, smooth: false }) + ' ';
              pi += inkPath(box, { seed: sd + 80 + j, t, w: 6, closed: true, smooth: false }) + ' ' + inkPath([[x - w / 2, y - h * 0.5], [x + w / 2, y - h * 0.5]], { seed: sd + 82 + j, t, w: 4 }) + ' ';
              const lid = [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 + 10, y - h - 110 * s], [x - w / 2 - 10, y - h - 110 * s]];
              pf += inkLoop(lid, { seed: sd + 84 + j, t, smooth: false }) + ' ';
              pi += inkPath(lid, { seed: sd + 84 + j, t, w: 5, closed: true, smooth: false }) + ' ';
              // clothes spilling over the rim
              const cl = [[x - w * 0.4, y - h - 4], [x - w * 0.2, y - h - 36], [x + w * 0.1, y - h - 26], [x + w * 0.38, y - h - 40], [x + w * 0.52, y - h + 30], [x + w * 0.4, y - h + 6]];
              ps += inkLoop(cl, { seed: sd + 86 + j, t }) + ' ';
              pi += inkPath(cl, { seed: sd + 86 + j, t, w: 4, closed: true }) + ' ';
            });
          }
          wallF.setAttribute('d', wf); wallS.setAttribute('d', ws); wallI.setAttribute('d', wi);
          floorF.setAttribute('d', ff); floorS.setAttribute('d', fs); floorI.setAttribute('d', fi);
          houseF.setAttribute('d', hf); houseD.setAttribute('d', hd); houseI.setAttribute('d', hi);
          mastF.setAttribute('d', mf); mastI.setAttribute('d', mi); ropeI.setAttribute('d', ri);
          // ghosts of missing things
          let gi = '', gx = '';
          (P.ghosts || []).forEach((G, i) => {
            const at = atOr(cues, G.at, 0.5 + i * 0.8), p = clamp01((lt - at) / 0.8); if (lt < at) return;
            const s = G.scale ?? 1, x = G.x * W, y = G.y * H, bob = Math.sin(t * 1.5 + i) * 6;
            ghostItem(G.item, x, y + bob, s).forEach((pl, j) => {
              const n = Math.max(2, Math.round(pl.length * p + 1)), closed = p >= 1 && j === 0 && pl.length > 3;
              // dashed look: draw every other short segment of the outline
              const dense = []; const pts = closed || j === 0 ? pl.concat([pl[0]]) : pl;
              for (let q = 0; q < pts.length - 1; q++) for (let m = 0; m < 4; m++) dense.push([lerp(pts[q][0], pts[q + 1][0], m / 4), lerp(pts[q][1], pts[q + 1][1], m / 4)]);
              const lim = Math.round(dense.length * p);
              for (let q = 0; q + 1 < lim; q += 2) gi += inkPath([dense[q], dense[q + 1]], { seed: sd + 400 + i * 40 + j * 7 + q, t, w: 7 }) + ' ';
              void n;
            });
            const xp = spring(lt, at + 0.7, 0.5), hk = punch(lt, at + 0.7), r = 70 * s * xp * (1 + hk * 0.2);
            if (lt >= at + 0.7) gx += inkPath([[x - r, y - r * 0.8], [x + r, y + r * 0.8]], { seed: sd + 480 + i, t, w: 16 }) + ' ' + inkPath([[x + r, y - r * 0.8], [x - r, y + r * 0.8]], { seed: sd + 490 + i, t, w: 16 }) + ' ';
          });
          ghostI.setAttribute('d', gi); ghostX.setAttribute('d', gx);
          // log slate
          if (P.slate) {
            const S = P.slate, s = S.scale ?? 1, x = (S.x ?? 0.62) * W, y = (S.y ?? 0.52) * H, w = 640 * s, h = 400 * s;
            const pin = spring(lt, atOr(cues, S.at, 0), 0.7), tilt = -3 + Math.sin(t * 0.85) * 1.2;
            const fr2 = [[x - w / 2 - 26, y - h / 2 - 26], [x + w / 2 + 26, y - h / 2 - 26], [x + w / 2 + 26, y + h / 2 + 26], [x - w / 2 - 26, y + h / 2 + 26]];
            const inner = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
            slateFr.setAttribute('d', inkLoop(fr2, { seed: sd + 500, t, smooth: false }));
            slateF.setAttribute('d', inkLoop(inner, { seed: sd + 501, t, smooth: false }));
            slateI.setAttribute('d', inkPath(fr2, { seed: sd + 500, t, w: 6, closed: true, smooth: false }) + ' ' + inkPath(inner, { seed: sd + 501, t, w: 4, closed: true, smooth: false }));
            slateLines.forEach((Q, j) => {
              const at = atOr(cues, Q.Ln.at, 0.5 + j * 1.2), p = clamp01((lt - at) / 0.9), n = Q.Ln.text.length;
              Q.tx.textContent = lt < at ? '' : Q.Ln.text.slice(0, Math.max(1, Math.ceil(n * p)));
              Q.tx.setAttribute('x', x - w / 2 + 50 * s); Q.tx.setAttribute('y', y - h / 2 + (120 + j * 130) * s);
              Q.tx.setAttribute('font-size', Math.round(Math.max(48, (Q.Ln.size || 92) * s)));
              Q.tx.setAttribute('fill', Q.Ln.color === 'red' ? INK.gold : INK.paperLight);
            });
            slateG.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(tilt)}) scale(${lerp(0.6, 1, pin).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
            slateG.style.display = pin > 0.01 ? '' : 'none';
          } else slateG.style.display = 'none';
          // sound words
          sounds.forEach((Q, i) => {
            const at = atOr(cues, Q.S.at, 0.3 + i * 0.8), p = spring(lt, at, 0.5);
            Q.tx.style.display = lt < at ? 'none' : '';
            const x = Q.S.x * W, y = Q.S.y * H, pul = 1 + 0.06 * Math.sin((lt - at) * 7), wob = Math.sin(t * 3 + i) * 3;
            Q.tx.setAttribute('x', x); Q.tx.setAttribute('y', y);
            Q.tx.setAttribute('transform', `translate(${f1(x)} ${f1(y + wob)}) rotate(${Q.S.rot ?? (i % 2 ? 4 : -5)}) scale(${(lerp(0.4, 1, p) * pul).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
          });
          // muster: people pop up along the deck
          if (MU) {
            const ma = atOr(cues, MU.at, 0.3), n = musterRigs.length;
            musterRigs.forEach(m => {
              const at = ma + m.i * (MU.dur / n), p = spring(lt, at, 0.5);
              const x = (0.14 + m.i * (0.74 / Math.max(1, n - 1))) * W, y = 0.8 * H - (m.i % 2) * 24;
              m.rig.update(t, lt < at ? 'idle' : (m.i % 3 === 0 ? 'wave' : 'idle'), { x, y: y + (1 - p) * 400, face: m.i < n / 2 ? 1 : -1, since: lt - at, alpha: lt < at ? 0 : 1, emotion: m.kd === 'girl' ? 'happy' : null });
            });
          }
          // red ring (cabin)
          if (P.ring) {
            const at = atOr(cues, P.ring.at, dur * 0.5), p = clamp01((lt - at) / 0.7);
            const c = P.ring.item === 'chests' ? [0.43 * W, 0.8 * H, 560, 160] : [0.23 * W, 0.4 * H, 380, 110];
            const rp = []; for (let i = 0; i <= Math.round(34 * p); i++) { const a = -2.4 + i / 30 * 6.2832; rp.push([c[0] + Math.cos(a) * c[2] * (1 + i / 300), c[1] + Math.sin(a) * c[3] * (1 + i / 300)]); }
            ringI.setAttribute('d', lt >= at && rp.length > 1 ? inkPath(rp, { seed: sd + 600, t, w: 9 }) : '');
          }
          propF.setAttribute('d', pf); propD.setAttribute('d', pd); propS.setAttribute('d', ps); propB.setAttribute('d', pb); propR.setAttribute('d', pr); propI.setAttribute('d', pi); lampG.setAttribute('d', lg);
          // cast (climber goes over the rail: behind the bulwark first, then onto the deck)
          updCast(cast, t, lt, cues, W, H, (m, x, y, ltt) => {
            if (!climb || m.i !== climb.who) return null;
            const ca = atOr(cues, climb.at, 0), cd = climb.dur, u = clamp01((ltt - ca) / cd);
            const x0 = climb.x0 * W, x1 = (m.c.x ?? 0.4) * W;
            const up = sm(clamp01(u / 0.55)), over = sm(clamp01((u - 0.55) / 0.45));
            const cx = lerp(x0, x1, over), cy = lerp(lerp(L.rail + 330, L.rail + 20, up), y, over) - Math.sin(over * Math.PI) * 60;
            const front = u >= 0.55;
            const node = frontCast.contains(m.rig.node || null) ? null : null; void node;
            m._front = front;
            if (u < 1) return [cx, cy, { pose: u < 0.55 ? 'idle' : 'walk', emotion: 'worried', prev: null }];
            return [x, y];
          });
          if (climb && cast[climb.who]) {
            const m = cast[climb.who], gnode = m.rig.node || null;
            if (gnode) { const want = m._front ? frontCast : backCast; if (gnode.parentNode !== want) want.appendChild(gnode); }
          }
          updLabels(labels, t, lt, dur, cues, W, H, sd);
          updCounter(counter, lt, dur, cues, W, H);
        },
      };
    },
  };

  // ================================================================== mcA_portraits
  function bust(kind, cx, cy, s, t, sd, beard) {
    // returns {skin, hair, cloth, accent, ink} path strings; head centre at (cx, cy), s = scale
    let skin = '', hair = '', cloth = '', acc = '', ink = '', beardP = '';
    const small = kind === 'girl' || kind === 'boy', hr = (small ? 62 : 72) * s;
    const head = circ(cx, cy, hr, 16, hr * 1.08);
    // shoulders / clothes
    const sh = [[cx - 150 * s, cy + 250 * s], [cx - 130 * s, cy + 130 * s], [cx - 60 * s, cy + 96 * s], [cx + 60 * s, cy + 96 * s], [cx + 130 * s, cy + 130 * s], [cx + 150 * s, cy + 250 * s]];
    cloth += inkLoop(sh, { seed: sd + 1, t }) + ' '; ink += inkPath(sh, { seed: sd + 1, t, w: 5, closed: true }) + ' ';
    if (kind === 'man') {
      ink += inkPath([[cx - 50 * s, cy + 100 * s], [cx, cy + 190 * s], [cx + 50 * s, cy + 100 * s]], { seed: sd + 2, t, w: 5 }) + ' ';
      acc += inkLoop([[cx - 22 * s, cy + 104 * s], [cx + 22 * s, cy + 104 * s], [cx + 12 * s, cy + 150 * s], [cx - 12 * s, cy + 150 * s]], { seed: sd + 3, t }) + ' ';
    } else if (kind === 'woman' || kind === 'granny') {
      ink += inkPath([[cx - 40 * s, cy + 92 * s], [cx, cy + 112 * s], [cx + 40 * s, cy + 92 * s]], { seed: sd + 2, t, w: 6 }) + ' ';
      for (let j = 0; j < 3; j++) ink += inkDot(cx, cy + (140 + j * 34) * s, 6 * s, 6 * s, sd + 4 + j, t) + ' ';
    } else if (kind === 'girl') {
      ink += inkPath([[cx - 50 * s, cy + 104 * s], [cx, cy + 130 * s], [cx + 50 * s, cy + 104 * s]], { seed: sd + 2, t, w: 5 }) + ' ';
    }
    // hair behind/around
    if (kind === 'woman' || kind === 'granny') {
      hair += inkLoop([[cx - hr * 1.05, cy + hr * 0.2], [cx - hr * 1.1, cy - hr * 0.6], [cx - hr * 0.5, cy - hr * 1.15], [cx + hr * 0.5, cy - hr * 1.15], [cx + hr * 1.1, cy - hr * 0.6], [cx + hr * 1.05, cy + hr * 0.2], [cx + hr * 0.8, cy - hr * 0.3], [cx, cy - hr * 0.75], [cx - hr * 0.8, cy - hr * 0.3]], { seed: sd + 10, t }) + ' ';
      hair += inkLoop(circ(cx, cy - hr * 1.2, hr * 0.42, 12), { seed: sd + 11, t }) + ' ';
    } else if (kind === 'girl') {
      hair += inkLoop([[cx - hr * 1.15, cy + hr * 0.6], [cx - hr * 1.2, cy - hr * 0.5], [cx - hr * 0.5, cy - hr * 1.2], [cx + hr * 0.5, cy - hr * 1.2], [cx + hr * 1.2, cy - hr * 0.5], [cx + hr * 1.15, cy + hr * 0.6], [cx + hr * 0.85, cy - hr * 0.2], [cx, cy - hr * 0.7], [cx - hr * 0.85, cy - hr * 0.2]], { seed: sd + 10, t }) + ' ';
    } else {
      hair += inkLoop([[cx - hr * 1.0, cy - hr * 0.1], [cx - hr * 0.9, cy - hr * 0.8], [cx, cy - hr * 1.15], [cx + hr * 0.9, cy - hr * 0.8], [cx + hr * 1.0, cy - hr * 0.1], [cx + hr * 0.7, cy - hr * 0.55], [cx - hr * 0.6, cy - hr * 0.6]], { seed: sd + 10, t }) + ' ';
    }
    skin += inkLoop(head, { seed: sd + 20, t }) + ' ';
    ink += inkPath(head, { seed: sd + 20, t, w: 5, closed: true }) + ' ';
    if (kind === 'girl') { acc += inkLoop([[cx + hr * 0.5, cy - hr * 1.0], [cx + hr * 0.95, cy - hr * 1.25], [cx + hr * 0.9, cy - hr * 0.8]], { seed: sd + 12, t }) + ' ' + inkLoop([[cx + hr * 0.5, cy - hr * 1.0], [cx + hr * 0.2, cy - hr * 1.4], [cx + hr * 0.05, cy - hr * 0.95]], { seed: sd + 13, t }) + ' '; }
    // face
    const blink = ((t * 0.3 + sd * 0.001) % 1) < 0.04;
    ink += (blink ? inkPath([[cx - 32 * s, cy - 4 * s], [cx - 16 * s, cy - 4 * s]], { seed: sd + 30, t, w: 4 }) + ' ' + inkPath([[cx + 16 * s, cy - 4 * s], [cx + 32 * s, cy - 4 * s]], { seed: sd + 31, t, w: 4 }) : inkDot(cx - 24 * s, cy - 4 * s, 7 * s, 8 * s, sd + 30, t) + ' ' + inkDot(cx + 24 * s, cy - 4 * s, 7 * s, 8 * s, sd + 31, t)) + ' ';
    ink += inkPath([[cx - 38 * s, cy - 28 * s], [cx - 12 * s, cy - 32 * s]], { seed: sd + 32, t, w: 4 }) + ' ' + inkPath([[cx + 12 * s, cy - 32 * s], [cx + 38 * s, cy - 28 * s]], { seed: sd + 33, t, w: 4 }) + ' ';
    if (beard && kind === 'man') {
      const bd = [[cx - hr * 0.95, cy + hr * 0.05], [cx - hr * 0.7, cy + hr * 0.8], [cx, cy + hr * 1.25], [cx + hr * 0.7, cy + hr * 0.8], [cx + hr * 0.95, cy + hr * 0.05], [cx + hr * 0.5, cy + hr * 0.5], [cx, cy + hr * 0.45], [cx - hr * 0.5, cy + hr * 0.5]];
      beardP = inkLoop(bd, { seed: sd + 40, t });
      ink += inkPath([[cx - 16 * s, cy + 36 * s], [cx + 16 * s, cy + 36 * s]], { seed: sd + 41, t, w: 4 }) + ' ';
    } else ink += inkPath([[cx - 16 * s, cy + 34 * s], [cx, cy + 38 * s], [cx + 16 * s, cy + 34 * s]], { seed: sd + 41, t, w: 4 }) + ' ';
    return { skin, hair, cloth, acc, ink, beard: beardP };
  }
  SH.mcA_portraits = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000;
      const cam = el(svg, 'g');
      const frames = (P.frames || []).map((F, i) => {
        const g = el(cam, 'g');
        const o = { F, i, g, str: inkEl(g), shadow: inkEl(g, INK.ink, { 'fill-opacity': 0.12 }), frameF: inkEl(g, INK.hat), mat: inkEl(g, INK.paperLight),
          cloth: inkEl(g, F.kind === 'woman' || F.kind === 'granny' ? INK.blue : F.kind === 'girl' ? INK.red : INK.inkSoft), hair: inkEl(g, F.kind === 'granny' ? INK.paperDark : INK.ink, { 'fill-opacity': F.kind === 'granny' ? 1 : 0.85 }),
          skin: inkEl(g, INK.paperLight), acc: inkEl(g, INK.red), beard: inkEl(g, INK.ink, { 'fill-opacity': 0.85 }), ink: inkEl(g), frameI: inkEl(g), veil: inkEl(g, INK.paper, { 'fill-opacity': 0 }) };
        o.name = el(g, 'text', { 'font-family': INK_FONT, 'font-size': Math.max(44, F.size || 60), 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px` });
        o.name.textContent = F.name || '';
        return o;
      });
      const castG = el(cam, 'g');
      const cast = makeCast(castG, P.cast, seed, 0.5);
      const labels = makeLabels(svg, P.labels);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.05, progIO(lt, 0, Math.max(1, dur))), fc = P.focus || [0.5, 0.5];
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(fc[0] * W)} ${f1(fc[1] * H)}) scale(${z.toFixed(4)}) translate(${f1(-fc[0] * W)} ${f1(-fc[1] * H)})`);
          frames.forEach(o => {
            const F = o.F, at = atOr(cues, F.at, 0.2 + o.i * 0.7), p = spring(lt, at, 0.7), s = (F.scale ?? 1);
            if (lt < at) { o.g.style.display = 'none'; return; }
            o.g.style.display = '';
            const x = (F.x ?? 0.5) * W, y = (F.y ?? 0.45) * H, nailY = y - 300 * s - 60, swing = Math.sin(t * 1.1 + o.i * 1.3) * 2.2 + (1 - p) * 14;
            const rx = 170 * s, ry = 215 * s;
            o.str.setAttribute('d', inkPath([[x - rx * 0.6, y - ry * 0.75], [x, nailY], [x + rx * 0.6, y - ry * 0.75]], { seed: sd + o.i * 50 + 1, t, w: 3 }) + ' ' + inkDot(x, nailY, 9, 9, sd + o.i * 50 + 2, t));
            const outer = circ(x, y, rx + 26 * s, 22, ry + 26 * s), inner = circ(x, y, rx, 22, ry);
            o.shadow.setAttribute('d', inkLoop(outer.map(q => [q[0] + 12, q[1] + 14]), { seed: sd + o.i * 50 + 3, t }));
            o.frameF.setAttribute('d', inkLoop(outer, { seed: sd + o.i * 50 + 4, t }));
            o.mat.setAttribute('d', inkLoop(inner, { seed: sd + o.i * 50 + 5, t }));
            const b = bust(F.kind || 'man', x, y - 30 * s, s * 0.95, t, sd + o.i * 50 + 10, F.beard);
            o.cloth.setAttribute('d', b.cloth); o.hair.setAttribute('d', b.hair); o.skin.setAttribute('d', b.skin); o.acc.setAttribute('d', b.acc); o.beard.setAttribute('d', b.beard); o.ink.setAttribute('d', b.ink);
            o.frameI.setAttribute('d', inkPath(outer, { seed: sd + o.i * 50 + 4, t, w: 6, closed: true }) + ' ' + inkPath(inner, { seed: sd + o.i * 50 + 5, t, w: 4, closed: true }));
            // clip the bust's shoulders to the oval: cover the outside with the frame (simple: veil below the mat)
            const dm = atOr(cues, F.dim, null), dv = dm == null ? 0 : clamp01((lt - dm) / 0.8) * 0.55;
            o.veil.setAttribute('d', dv > 0 ? inkLoop(inner, { seed: sd + o.i * 50 + 5, t }) : ''); o.veil.setAttribute('fill-opacity', dv);
            o.name.setAttribute('x', x); o.name.setAttribute('y', y + ry + 26 * s + 70);
            const sc = lerp(0.5, 1, p) * (1 + punch(lt, at) * 0.08);
            o.g.setAttribute('transform', `rotate(${f1(swing)} ${f1(x)} ${f1(nailY)}) translate(${f1(x)} ${f1(y)}) scale(${sc.toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
          });
          updCast(cast, t, lt, cues, W, H);
          updLabels(labels, t, lt, dur, cues, W, H, sd);
        },
      };
    },
  };
})();
