// sf_siffre: shots for the Stickstory Short "Michel Siffre's Cave" (2026-11-08): in July 1962 the 23-year-old French
// geologist Michel Siffre lived alone about two months in the Scarasson ice cave (Maritime Alps, ~130 m down) with no
// clock and no daylight; he phoned his surface team when he woke, ate and slept, and they never told him the time.
// Counting to 120 took him about five minutes; when the team called on 14 September to say it was over, he thought it
// was 20 August. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at
// 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random. Parametric: any cave / isolation /
// "time without clocks" story. Uses lh__lib.js (LH.kasif, LH.label, LH.clock).
//
// Common: K = Kaşif {x, y (0..1 H, ground point), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = labels [{text, x, y, at, size, color: ink|red|gold|blue|paper, font: hand|serif, card, rot, underline}]
//   caver: the hatless period figure in a helmet with a headlamp (gold beam) and a blue jumper.
//
// SHOTS.sf_cave — an ice-cave chamber: rock wall with strata, stalactites + a falling drip, an ice floor down to the
//   frame bottom, a glowing tent, a lantern, a field telephone on a crate. P: {mode, gy: 0.6, labels}
//   "hook": a tear-off calendar on the rock sheds leaf after leaf (days flick by); the caver sits and stares at it.
//   "dark": the caver sits by the tent; a clock pops in at cue "clock" and a sun at cue "sun", each struck out in red.
//   "sure": the caver stands, receiver at his ear; a thought bubble with a calendar sheet (P.month, P.day) pops at "hit".
// SHOTS.sf_shaft — a cross-section of the mountain: a thin strip of surface (camp tent, team member), the rock below,
//   a vertical shaft with a rope ladder down to the cave chamber, the underground glacier under it, a depth arrow.
//   "descend": the caver climbs down the ladder into the chamber. "call": he phones from below, gold pulses run up the
//   wire from cue "hit" and the phone up top rings. P: {mode, labels}
// SHOTS.sf_camp — "secret": inside the surface tent: a team member with the receiver at his ear behind a table with a
//   telephone, a logbook and an alarm clock; at cue "hit" a cloth drops over the clock.
//   "sun": outside the cave mouth on the mountain: the sun with turning rays, the caver blinks in the light, a thought
//   bubble with a clock whose hands spin. "end": the cave mouth, the team tent and Kaşif (P.kasif). P: {mode, kasif, labels}
// SHOTS.sf_count — in the cave: a thought bubble counts 1 -> P.to (120) while a big stopwatch sweeps P.turns (5) minutes;
//   Kaşif (P.kasif) between them; cue "hit" punches the stopwatch. P: {to: 120, turns: 5, kasif, labels}
// SHOTS.sf_calendar — a big tear-off calendar nailed to the cave rock: leaves rip off from P.from to P.to
//   ([month, day]); lantern + telephone on the ledge below. P: {from: ["AUGUST", 20], to: ["SEPTEMBER", 14], labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const SERIF = 'Fraunces, Georgia, serif';
  const txt = (parent, a = {}) => el(parent, 'text', Object.assign({ 'text-anchor': 'middle' }, a));
  const rectP = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const ROCK = () => mix(INK.inkSoft, INK.paperDark, 0.42), ROCK_D = () => mix(INK.ink, INK.inkSoft, 0.45), ROCK_L = () => mix(INK.paperDark, INK.inkSoft, 0.18);
  const ICE = () => mix(INK.blue, INK.paperLight, 0.66), ICE_D = () => mix(INK.blue, INK.paperLight, 0.3);
  const TENT = () => mix(INK.red, INK.gold, 0.4), TENT_D = () => mix(INK.red, INK.ink, 0.3);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25), WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const JUMPER = () => mix(INK.blue, INK.ink, 0.25);
  const GRASS = () => mix(INK.green, INK.paperLight, 0.4);
  const AUG = 31;

  // ------------------------------------------------------------------ cave chamber backdrop + ice floor + foreground rocks
  function caveBack(parent, sd) {
    const wall = inkEl(parent, ROCK()), strata = inkEl(parent, ROCK_D(), { 'fill-opacity': 0.55 }), lumps = inkEl(parent, ROCK_L());
    const sides = inkEl(parent, ROCK_D()), ceil = inkEl(parent, ROCK_D()), tips = inkEl(parent, mix(ICE(), ROCK_L(), 0.4)), drip = inkEl(parent, ICE());
    const pool = inkEl(parent, INK.gold, { 'fill-opacity': 0.22 });
    const ice = inkEl(parent, ICE()), iceD = inkEl(parent, ICE_D()), glint = inkEl(parent, INK.paperLight), rim = inkEl(parent);
    const fr = inkEl(parent, ROCK_D()), frL = inkEl(parent, ROCK()), frR = inkEl(parent);
    return {
      update(t, W, H, gy, o = {}) {
        const u = W / 1080;
        wall.setAttribute('d', inkLoop(rectP(-60, -60, W + 60, gy + 30), { seed: sd, t, amp: 0.5, smooth: false }));
        const S = [];
        for (let i = 0; i < 7; i++) { const y = 0.16 * H + i * (gy - 0.16 * H) / 7, P = [];
          for (let x = -40; x <= W + 40; x += 90 * u) P.push([x, y + Math.sin(x * 0.006 + i * 1.7) * 26 * u]);
          S.push(inkPath(P, { w: 8 + 6 * hn(sd, i), seed: sd + 10 + i, t, amp: 0.8 })); }
        strata.setAttribute('d', S.join(' '));
        const LU = []; for (let i = 0; i < 6; i++) { const x = (0.12 + 0.15 * i + 0.05 * hn(sd + 1, i)) * W, y = (0.22 + 0.3 * hn(sd + 2, i)) * gy + 0.1 * H;
          LU.push(inkLoop(inkEllipsePts(x, y, (40 + 40 * hn(sd + 3, i)) * u, (22 + 14 * hn(sd + 4, i)) * u, sd + 20 + i, 9, 0, 0.18), { seed: sd + 20 + i, t, amp: 0.6 })); }
        lumps.setAttribute('d', LU.join(' '));
        // side walls (framing), cropped
        const sw = o.sides ?? 0.13;
        const SL = [[-60, -60], [sw * W, -60], [sw * W * 0.7, 0.25 * H], [sw * W * 1.1, 0.42 * H], [sw * W * 0.55, gy - 40 * u], [sw * W * 0.2, gy + 30], [-60, gy + 30]];
        const SR = SL.map(([x, y]) => [W - x, y]);
        sides.setAttribute('d', inkLoop(SL, { seed: sd + 30, t, amp: 0.8 }) + ' ' + inkLoop(SR, { seed: sd + 31, t, amp: 0.8 }));
        // ceiling with stalactites (icicles) and one falling drip
        const cy = (o.ceil ?? 0.1) * H, C = [[-60, -60], [W + 60, -60], [W + 60, cy]], TP = [];
        for (let i = 12; i >= 0; i--) C.push([i / 12 * W, cy + Math.sin(i * 1.9) * 24 * u]);
        ceil.setAttribute('d', inkLoop(C, { seed: sd + 40, t, amp: 0.8 }));
        let dripTip = null;
        for (let i = 0; i < 9; i++) { const x = (0.06 + i * 0.11 + 0.03 * hn(sd + 5, i)) * W, L = (60 + 150 * hn(sd + 6, i)) * u, w = (18 + 16 * hn(sd + 7, i)) * u, y = cy + Math.sin(x / W * 12 * 1.9 / 1) * 6 * u;
          TP.push(inkLoop([[x - w, y - 10 * u], [x + w, y - 10 * u], [x + 2 * u, y + L]], { seed: sd + 50 + i, t, amp: 0.5 }));
          if (i === (o.drip ?? 5)) dripTip = [x + 2 * u, y + L]; }
        tips.setAttribute('d', TP.join(' '));
        if (dripTip) { const q = (t * 0.6) % 1, dy = q < 0.35 ? 0 : (q - 0.35) * (q - 0.35) * 2600 * u, sz = (q < 0.35 ? 4 + q * 20 : 11) * u;
          drip.setAttribute('d', dripTip[1] + dy < gy ? inkLoop([[dripTip[0], dripTip[1] + dy - sz * 1.4], [dripTip[0] + sz, dripTip[1] + dy + sz * 0.4], [dripTip[0], dripTip[1] + dy + sz * 1.1], [dripTip[0] - sz, dripTip[1] + dy + sz * 0.4]], { seed: sd + 60, t, amp: 0.3 }) : ''); }
        // lamp light pool
        if (o.glow) { const [gx, gyy, gr] = o.glow, k = 1 + 0.04 * Math.sin(t * 7) + 0.03 * Math.sin(t * 13);
          pool.setAttribute('d', inkLoop(inkEllipsePts(gx, gyy, gr * k, gr * 0.62 * k, sd + 61, 16, 0, 0.04), { seed: sd + 61, t, amp: 0.6 }) + ' ' + inkLoop(inkEllipsePts(gx, gyy, gr * 0.6 * k, gr * 0.38 * k, sd + 62, 14, 0, 0.04), { seed: sd + 62, t, amp: 0.6 })); }
        else pool.setAttribute('d', '');
        // ice floor (down to the frame bottom)
        const IT = [[-60, gy + 10 * u]]; for (let i = 0; i <= 10; i++) IT.push([i / 10 * W, gy + Math.sin(i * 1.3 + 0.5) * 8 * u]);
        IT.push([W + 60, gy], [W + 60, H + 60], [-60, H + 60]);
        ice.setAttribute('d', inkLoop(IT, { seed: sd + 70, t, amp: 0.6 }));
        const CR = [inkPath(IT.slice(0, 12), { w: 6, seed: sd + 71, t })];
        for (let i = -5; i <= 5; i++) { const x0 = W / 2 + i * 70 * u, x1 = W / 2 + i * 260 * u;
          CR.push(inkPath([[x0, gy + 30 * u], [lerp(x0, x1, 0.5) + 20 * u * Math.sin(i), lerp(gy, H, 0.5)], [x1, H + 20]], { w: 3, seed: sd + 80 + i, t })); }
        rim.setAttribute('d', CR.join(' '));
        const ID = []; for (let i = 0; i < 4; i++) { const y = gy + (90 + i * 150) * u; ID.push(inkPath([[-40, y], [0.3 * W, y + 12 * u], [0.62 * W, y - 6 * u], [W + 40, y + 10 * u]], { w: 10 + i * 4, seed: sd + 90 + i, t, amp: 1 })); }
        iceD.setAttribute('d', ID.join(' '));
        const GL = []; for (let i = 0; i < 6; i++) { const q = (t * 0.5 + hn(sd + 8, i)) % 1; if (q > 0.3) continue;
          const x = (0.1 + 0.8 * hn(sd + 9, i)) * W, y = gy + (60 + (H - gy - 200 * u) * hn(sd + 10, i)), s = Math.sin(q / 0.3 * Math.PI) * 26 * u;
          GL.push(inkLoop([[x, y - s], [x + s * 0.25, y], [x, y + s], [x - s * 0.25, y]], { seed: sd + 100 + i, t, amp: 0.2, smooth: false }), inkLoop([[x - s, y], [x, y - s * 0.25], [x + s, y], [x, y + s * 0.25]], { seed: sd + 110 + i, t, amp: 0.2, smooth: false })); }
        glint.setAttribute('d', GL.join(' '));
        // foreground rocks in the corners
        if (o.front !== false) {
          const A = [[-60, H + 60], [-60, H - 330 * u], [90 * u, H - 380 * u], [250 * u, H - 300 * u], [330 * u, H - 120 * u], [380 * u, H + 60]];
          const B = [[W + 60, H + 60], [W + 60, H - 280 * u], [W - 120 * u, H - 330 * u], [W - 290 * u, H - 210 * u], [W - 360 * u, H + 60]];
          fr.setAttribute('d', inkLoop(A, { seed: sd + 120, t, amp: 0.8 }) + ' ' + inkLoop(B, { seed: sd + 121, t, amp: 0.8 }));
          frL.setAttribute('d', inkLoop([[40 * u, H - 330 * u], [180 * u, H - 320 * u], [120 * u, H - 250 * u]], { seed: sd + 122, t, amp: 0.6 }) + ' ' + inkLoop([[W - 140 * u, H - 300 * u], [W - 40 * u, H - 270 * u], [W - 120 * u, H - 230 * u]], { seed: sd + 123, t, amp: 0.6 }));
          frR.setAttribute('d', inkPath(A.slice(1, 5), { w: 6, seed: sd + 124, t }) + ' ' + inkPath(B.slice(1, 4), { w: 6, seed: sd + 125, t }));
        } else blank(fr, frL, frR);
      },
    };
  }

  // ------------------------------------------------------------------ an A-frame tent glowing from inside (x = centre, gy = ground)
  function tent(parent, sd) {
    const side = inkEl(parent, TENT_D()), front = inkEl(parent, TENT()), door = inkEl(parent, INK.gold), doorD = inkEl(parent, mix(INK.gold, INK.paperLight, 0.45)), rim = inkEl(parent);
    return {
      update(t, x, gy, s) {
        const w = 230 * s, h = 300 * s, dp = 150 * s, ap = [x, gy - h];
        const SD = [ap, [ap[0] + dp, ap[1] + 34 * s], [x + w + dp, gy - 16 * s], [x + w, gy]];
        side.setAttribute('d', inkLoop(SD, { seed: sd, t, amp: 0.6, smooth: false }));
        const F = [ap, [x + w, gy], [x - w, gy]];
        front.setAttribute('d', inkLoop(F, { seed: sd + 1, t, amp: 0.6, smooth: false }));
        const fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
        const D = [[x, gy - h * 0.72], [x + w * 0.42, gy], [x - w * 0.42, gy]];
        door.setAttribute('d', inkLoop(D, { seed: sd + 2, t, amp: 0.5, smooth: false }));
        doorD.setAttribute('d', inkLoop([[x, gy - h * 0.5 * fl], [x + w * 0.24, gy], [x - w * 0.24, gy]], { seed: sd + 3, t, amp: 0.5, smooth: false }));
        rim.setAttribute('d', inkPath(F, { w: 6, seed: sd + 4, t, closed: true, smooth: false }) + ' ' + inkPath(SD, { w: 5, seed: sd + 5, t, closed: true, smooth: false }) + ' ' + inkPath(D, { w: 4, seed: sd + 6, t, closed: true, smooth: false }) +
          ' ' + inkPath([[ap[0], ap[1] - 30 * s], [ap[0], ap[1] + 10 * s]], { w: 6, seed: sd + 7, t }) + ' ' + inkPath([[x - w, gy], [x - w - 90 * s, gy + 14 * s]], { w: 3, seed: sd + 8, t }) + ' ' + inkPath([[ap[0], ap[1]], [x - w - 120 * s, gy + 10 * s]], { w: 2.5, seed: sd + 9, t }));
      },
    };
  }

  // ------------------------------------------------------------------ hurricane lantern (x, base y)
  function lantern(parent, sd) {
    const halo = inkEl(parent, INK.gold, { 'fill-opacity': 0.2 }), glass = inkEl(parent, mix(INK.gold, INK.paperLight, 0.55)), flame = inkEl(parent, INK.gold), body = inkEl(parent, ROCK_D()), rim = inkEl(parent);
    return {
      update(t, x, y, s) {
        const fl = 1 + 0.12 * Math.sin(t * 11) + 0.08 * Math.sin(t * 17);
        halo.setAttribute('d', inkCircle(x, y - 90 * s, 120 * s * fl, sd, t, { fill: true }));
        const G = inkEllipsePts(x, y - 90 * s, 44 * s, 62 * s, sd + 1, 12, 0, 0.02);
        glass.setAttribute('d', inkLoop(G, { seed: sd + 1, t, amp: 0.5 }));
        flame.setAttribute('d', inkLoop([[x, y - 130 * s * fl], [x + 14 * s, y - 86 * s], [x, y - 70 * s], [x - 14 * s, y - 86 * s]], { seed: sd + 2, t, amp: 0.4 }));
        body.setAttribute('d', inkLoop(rectP(x - 50 * s, y - 30 * s, x + 50 * s, y), { seed: sd + 3, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(rectP(x - 36 * s, y - 166 * s, x + 36 * s, y - 148 * s), { seed: sd + 4, t, amp: 0.4, smooth: false }));
        rim.setAttribute('d', inkPath(G, { w: 4, seed: sd + 5, t, closed: true }) + ' ' + inkPath([[x - 30 * s, y - 166 * s], [x - 34 * s, y - 210 * s], [x + 34 * s, y - 210 * s], [x + 30 * s, y - 166 * s]], { w: 4, seed: sd + 6, t }) +
          ' ' + inkPath([[x - 50 * s, y - 30 * s], [x - 50 * s, y - 150 * s]], { w: 4, seed: sd + 7, t }) + ' ' + inkPath([[x + 50 * s, y - 30 * s], [x + 50 * s, y - 150 * s]], { w: 4, seed: sd + 8, t }));
      },
    };
  }

  // ------------------------------------------------------------------ field telephone on a crate (x, ground y); returns the receiver cradle point
  function phone(parent, sd) {
    const crate = inkEl(parent, WOOD()), box = inkEl(parent, mix(WOOD(), INK.ink, 0.25)), rcv = inkEl(parent, INK.ink), rim = inkEl(parent), ring = inkEl(parent, INK.red);
    return {
      update(t, x, y, s, o = {}) {
        const ch = o.crate === false ? 0 : 150 * s, C = rectP(x - 110 * s, y - ch, x + 110 * s, y);
        crate.setAttribute('d', ch ? inkLoop(C, { seed: sd, t, amp: 0.5, smooth: false }) : '');
        const rr = o.ring ? Math.sin(t * 40) * 4 * s : 0, b = rectP(x - 80 * s + rr, y - ch - 130 * s, x + 80 * s + rr, y - ch);
        box.setAttribute('d', inkLoop(b, { seed: sd + 1, t, amp: 0.5, smooth: false }));
        const L = [ch ? inkPath(C, { w: 5, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[x - 110 * s, y - ch * 0.5], [x + 110 * s, y - ch * 0.5]], { w: 3, seed: sd + 3, t }) : '', inkPath(b, { w: 5, seed: sd + 4, t, closed: true, smooth: false }),
          inkPath([[x + 80 * s, y - ch - 70 * s], [x + 120 * s, y - ch - 70 * s], [x + 120 * s, y - ch - 30 * s]], { w: 5, seed: sd + 5, t }), inkCircle(x, y - ch - 70 * s, 22 * s, sd + 6, t, { w: 4 })];
        rim.setAttribute('d', L.join(' '));
        const up = o.lifted ? 1 : 0, cr = [x, y - ch - 150 * s];
        rcv.setAttribute('d', up ? '' : inkPath([[x - 70 * s, cr[1]], [x + 70 * s, cr[1]]], { w: 22 * s, seed: sd + 7, t, taper: 0 }) + ' ' + inkDot(x - 70 * s, cr[1] + 4 * s, 22 * s, 16 * s, sd + 8, t) + ' ' + inkDot(x + 70 * s, cr[1] + 4 * s, 22 * s, 16 * s, sd + 9, t));
        const R = []; if (o.ring) for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + (i - 1) * 0.6, r0 = 120 * s, r1 = (170 + 14 * Math.sin(t * 20 + i)) * s; R.push(inkPath([[x + Math.cos(a) * r0, cr[1] + Math.sin(a) * r0], [x + Math.cos(a) * r1, cr[1] + Math.sin(a) * r1]], { w: 6, seed: sd + 10 + i, t })); }
        ring.setAttribute('d', R.join(' '));
        return { jack: [x - 80 * s, y - ch - 40 * s] };
      },
    };
  }

  // ------------------------------------------------------------------ a hatless figure (stick rig) with a helmet + headlamp, jumper; optional receiver at the ear
  function caver(parent, sd, o = {}) {
    const g = el(parent, 'g'), sc = o.scale ?? 1;
    const beam = inkEl(g, INK.gold, { 'fill-opacity': 0.2 });
    const jump = inkEl(g, o.col || JUMPER()), jumpR = inkEl(g);
    const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: false, accessory: o.helmet === false ? (o.accessory || null) : null, beard: o.beard ?? null, seed: sd });
    const helm = inkEl(g, mix(INK.gold, INK.paperLight, 0.3)), helmR = inkEl(g);
    const lamp = inkEl(g, INK.gold), lampR = inkEl(g), rcv = inkEl(g, INK.ink), cord = inkEl(g);
    return {
      g,
      update(t, pose, op) {
        const r = rig.update(t, pose, op), f = op.face ?? 1, Wp = q => [op.x + f * sc * q[0], op.y + sc * q[1]];
        const hip = Wp(r.hip), hd = Wp(r.head), sh = [lerp(hip[0], hd[0], 0.66), lerp(hip[1], hd[1], 0.66)];
        const V = [[sh[0] - 34 * sc, sh[1] - 4 * sc], [sh[0] + 34 * sc, sh[1] - 4 * sc], [hip[0] + 40 * sc, hip[1] + 14 * sc], [hip[0] - 40 * sc, hip[1] + 14 * sc]];
        jump.setAttribute('d', inkLoop(V, { seed: sd + 1, t, amp: 0.7 }));
        jumpR.setAttribute('d', inkPath(V, { w: 4, seed: sd + 2, t, closed: true }) + ' ' + inkPath([[hip[0] - 38 * sc, hip[1] - 6 * sc], [hip[0] + 38 * sc, hip[1] - 6 * sc]], { w: 3, seed: sd + 3, t }));
        if (o.helmet !== false) {
          const HP = [[-86, -24], [-80, -62], [-52, -100], [0, -116], [52, -100], [80, -62], [86, -24]].map(([a, b]) => [hd[0] + f * a * sc, hd[1] + b * sc]);
          helm.setAttribute('d', inkLoop(HP, { seed: sd + 11, t, amp: 0.6 }));
          helmR.setAttribute('d', inkPath(HP, { w: 5, seed: sd + 12, t, closed: true }) + ' ' + inkPath([[hd[0] - f * 100 * sc, hd[1] - 22 * sc], [hd[0] + f * 104 * sc, hd[1] - 26 * sc]], { w: 8, seed: sd + 13, t }));
          const lp = [hd[0] + f * 58 * sc, hd[1] - 70 * sc], dir = op.beam ?? 0.15, a = f > 0 ? dir : Math.PI - dir, L = (o.beamLen ?? 520) * sc;
          lamp.setAttribute('d', inkDot(lp[0], lp[1], 15 * sc, 13 * sc, sd + 4, t));
          lampR.setAttribute('d', inkCircle(lp[0], lp[1], 16 * sc, sd + 5, t, { w: 4 }));
          const sp = 0.2, fl = 1 + 0.03 * Math.sin(t * 6);
          beam.setAttribute('d', o.beamLen === 0 ? '' : inkLoop([lp, [lp[0] + Math.cos(a - sp) * L * fl, lp[1] + Math.sin(a - sp) * L * fl], [lp[0] + Math.cos(a + sp) * L * fl, lp[1] + Math.sin(a + sp) * L * fl]], { seed: sd + 6, t, amp: 0.6 }));
        } else blank(lamp, lampR, beam, helm, helmR);
        if (op.receiver) {
          const ec = [hd[0] - f * 70 * sc, hd[1] + 6 * sc], R = [[ec[0] - f * 4 * sc, ec[1] - 48 * sc], [ec[0] + f * 22 * sc, ec[1] + 58 * sc]];
          rcv.setAttribute('d', inkPath(R, { w: 22 * sc, seed: sd + 7, t, taper: 0 }) + ' ' + inkDot(R[0][0], R[0][1], 22 * sc, 18 * sc, sd + 8, t) + ' ' + inkDot(R[1][0], R[1][1], 22 * sc, 18 * sc, sd + 9, t));
          if (op.receiver.jack) { const j = op.receiver.jack, m = [lerp(R[1][0], j[0], 0.5), Math.max(R[1][1], j[1]) + 80 * sc], P = [R[1]];
            for (let i = 1; i < 14; i++) { const q = i / 14, x = (1 - q) * (1 - q) * R[1][0] + 2 * q * (1 - q) * m[0] + q * q * j[0], y = (1 - q) * (1 - q) * R[1][1] + 2 * q * (1 - q) * m[1] + q * q * j[1]; P.push([x + Math.sin(i * 2.2) * 8 * sc, y + Math.cos(i * 2.2) * 8 * sc]); }
            P.push(j); cord.setAttribute('d', inkPath(P, { w: 3.5, seed: sd + 10, t })); } else cord.setAttribute('d', '');
        } else blank(rcv, cord);
        r.headW = hd; r.hipW = hip; r.handsW = r.hands.map(Wp);
        return r;
      },
    };
  }

  // ------------------------------------------------------------------ calendar sheet (month band + big day number) with flying leaves
  function calendar(parent, sd) {
    const g = el(parent, 'g'), back = inkEl(g, WOOD_D()), sheet = inkEl(g, INK.paperLight), band = inkEl(g, INK.red), rim = inkEl(g), nail = inkEl(g, INK.ink);
    const mon = txt(g, { 'font-family': SERIF, 'font-weight': 900, fill: INK.paperLight }), day = txt(g, { 'font-family': SERIF, 'font-weight': 900, fill: INK.ink });
    const lines = inkEl(g, INK.inkSoft);
    const lg = el(g, 'g'), leaves = Array.from({ length: 6 }, () => ({ f: inkEl(lg, INK.paperLight), r: inkEl(lg), b: inkEl(lg, INK.red) }));
    return {
      g,
      update(t, x, y, w, h, month, dayTxt, fly = [], o = {}) {
        const S = rectP(x - w / 2, y, x + w / 2, y + h), bh = h * 0.24;
        back.setAttribute('d', inkLoop(rectP(x - w / 2 - 14, y - 12, x + w / 2 + 16, y + h + 20), { seed: sd, t, amp: 0.8, smooth: false }));
        sheet.setAttribute('d', inkLoop(S, { seed: sd + 1, t, amp: 0.8, smooth: false }));
        band.setAttribute('d', inkLoop(rectP(x - w / 2, y, x + w / 2, y + bh), { seed: sd + 2, t, amp: 0.8, smooth: false }));
        rim.setAttribute('d', inkPath(S, { w: 6, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + [-0.28, 0.28].map((q, i) => inkCircle(x + q * w, y, 14, sd + 4 + i, t, { w: 5 })).join(' '));
        nail.setAttribute('d', inkDot(x, y - 50, 11, 11, sd + 6, t) + ' ' + inkPath([[x - w * 0.28, y - 12], [x, y - 50], [x + w * 0.28, y - 12]], { w: 4, seed: sd + 7, t }));
        mon.textContent = month; const ms = Math.min(bh * 0.62, w * 0.9 / (Math.max(1, month.length) * 0.7));
        mon.setAttribute('font-size', f1(ms)); mon.setAttribute('x', f1(x)); mon.setAttribute('y', f1(y + bh * 0.5 + ms * 0.36));
        day.textContent = dayTxt; const ds = h * 0.5 * (o.pop || 1);
        day.setAttribute('font-size', f1(ds)); day.setAttribute('x', f1(x)); day.setAttribute('y', f1(y + bh + (h - bh) * 0.48 + ds * 0.36));
        if (o.dayColor) day.setAttribute('fill', o.dayColor); else day.setAttribute('fill', INK.ink);
        lines.setAttribute('d', [0.86, 0.92].map((q, i) => inkPath([[x - w * 0.32, y + h * q], [x + w * 0.32, y + h * q]], { w: 3, seed: sd + 8 + i, t })).join(' '));
        leaves.forEach((L, i) => {
          const ph = fly[i]; if (ph == null || ph < 0 || ph > 1) { blank(L.f, L.r, L.b); return; }
          const side = i % 2 ? 1 : -1, cx = x + side * w * (0.12 + ph * (1.1 + 0.3 * hn(sd, i))), cy = y + h * 0.42 - Math.sin(ph * Math.PI) * h * 0.25 + ph * ph * h * 0.8, a = side * ph * (1.6 + hn(sd + 1, i)), sc = (o.leaf ?? 0.95) * (1 - ph * 0.5);
          const pts = rectP(-w / 2, -h / 2, w / 2, h / 2).map(([px, py]) => { const qx = px * sc, qy = py * sc * (0.35 + 0.65 * Math.abs(Math.cos(a * 1.3))); return [cx + qx * Math.cos(a) - qy * Math.sin(a), cy + qx * Math.sin(a) + qy * Math.cos(a)]; });
          L.f.setAttribute('d', inkLoop(pts, { seed: sd + 20 + i, t, amp: 0.8, smooth: false }));
          L.b.setAttribute('d', inkLoop([pts[0], pts[1], lerpP(pts[1], pts[2], 0.24), lerpP(pts[0], pts[3], 0.24)], { seed: sd + 30 + i, t, amp: 0.6, smooth: false }));
          L.r.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 40 + i, t, closed: true, smooth: false }));
        });
      },
    };
  }
  const lerpP = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
  // date n days after (month0 = "AUGUST", day0)
  const dateAfter = (d0, n) => { const d = d0 + n; return d <= AUG ? ['AUGUST', String(d)] : ['SEPTEMBER', String(d - AUG)]; };

  // ------------------------------------------------------------------ thought bubble (cloud + trailing dots)
  function bubble(parent, sd) {
    const fill = inkEl(parent, INK.paperLight), rim = inkEl(parent);
    return {
      update(t, x, y, r, k, from) {
        if (k <= 0.01) { blank(fill, rim); return; }
        const P = []; for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2, rr = r * k * (1 + 0.09 * Math.cos(a * 7 + 0.5)); P.push([x + Math.cos(a) * rr * 1.12, y + Math.sin(a) * rr * 0.92]); }
        const D = []; if (from) [0.25, 0.5, 0.72].forEach((q, i) => { const px = lerp(from[0], x, q * 0.8), py = lerp(from[1], y + r * 0.7, q * 0.8), rr = (10 + i * 9) * k; D.push(inkCircle(px, py, rr, sd + 3 + i, t, { fill: true })); });
        fill.setAttribute('d', [inkLoop(P, { seed: sd, t, amp: 0.8 })].concat(D).join(' '));
        const DR = []; if (from) [0.25, 0.5, 0.72].forEach((q, i) => { const px = lerp(from[0], x, q * 0.8), py = lerp(from[1], y + r * 0.7, q * 0.8), rr = (10 + i * 9) * k; DR.push(inkCircle(px, py, rr, sd + 6 + i, t, { w: 4 })); });
        rim.setAttribute('d', [inkPath(P, { w: 6, seed: sd + 1, t, closed: true })].concat(DR).join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ a sun with turning rays
  function sun(parent, sd) {
    const halo = inkEl(parent, INK.gold, { 'fill-opacity': 0.22 }), rays = inkEl(parent, INK.gold), disc = inkEl(parent, mix(INK.gold, INK.paperLight, 0.3)), rim = inkEl(parent);
    return {
      update(t, x, y, r, o = {}) {
        if (r <= 1) { blank(halo, rays, disc, rim); return; }
        halo.setAttribute('d', o.halo === false ? '' : inkCircle(x, y, r * (1.7 + 0.06 * Math.sin(t * 2)), sd, t, { fill: true }));
        const R = []; const n = o.n ?? 12, sp = o.spin ?? 0.15;
        for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + t * sp, l = (i % 2 ? 1.55 : 1.9) * r + Math.sin(t * 3 + i) * 0.06 * r;
          R.push(inkPath([[x + Math.cos(a) * r * 1.18, y + Math.sin(a) * r * 1.18], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: Math.max(6, r * 0.12), seed: sd + 1 + i, t })); }
        rays.setAttribute('d', R.join(' '));
        disc.setAttribute('d', inkCircle(x, y, r, sd + 20, t, { fill: true }));
        rim.setAttribute('d', inkCircle(x, y, r, sd + 21, t, { w: 6 }));
      },
    };
  }

  // ------------------------------------------------------------------ red strike-through X (drawn in)
  function strike(parent, sd) {
    const x = inkEl(parent, INK.red);
    return {
      update(t, cx, cy, r, k) {
        const a = clamp01(k * 2), b = clamp01(k * 2 - 1), S = [];
        if (a > 0) S.push(inkPath([[cx - r, cy - r], lerpP([cx - r, cy - r], [cx + r, cy + r], a)], { w: 22, seed: sd, t }));
        if (b > 0) S.push(inkPath([[cx + r, cy - r], lerpP([cx + r, cy - r], [cx - r, cy + r], b)], { w: 22, seed: sd + 1, t }));
        x.setAttribute('d', S.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.sf_cave
  SH.sf_cave = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 311, u = W / 1080, mode = P.mode || 'hook', gy = (P.gy ?? 0.6) * H;
      const root = el(svg, 'g');
      const cb = caveBack(el(root, 'g'), sd);
      const cal = mode === 'hook' ? calendar(el(root, 'g'), sd + 40) : null;
      const tn = tent(el(root, 'g'), sd + 60);
      const lt0 = lantern(el(root, 'g'), sd + 80);
      const ph = phone(el(root, 'g'), sd + 100);
      const man = caver(el(root, 'g'), sd + 120, { scale: (mode === 'sure' ? 1.05 : mode === 'dark' ? 0.95 : 0.85) * u, beamLen: mode === 'sure' ? 0 : 560 });
      const clk = mode === 'dark' ? window.LH.clock(el(root, 'g'), sd + 140) : null;
      const sn = mode === 'dark' ? sun(el(root, 'g'), sd + 160) : null;
      const x1 = mode === 'dark' ? strike(root, sd + 180) : null, x2 = mode === 'dark' ? strike(root, sd + 190) : null;
      const bb = mode === 'sure' ? bubble(el(root, 'g'), sd + 200) : null;
      const cal2 = mode === 'sure' ? calendar(el(root, 'g'), sd + 220) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5);
          const tx = 0.78 * W;
          cb.update(t, W, H, gy, { glow: mode === 'hook' ? [0.6 * W, gy + 50 * u, 300 * u] : [tx - 40 * u, gy + 40 * u, 330 * u] });
          if (mode === 'hook') {
            // days flick by: a new leaf every 0.16 s
            const rate = 0.2, n = Math.floor(lt / rate), fly = [];
            for (let i = 0; i < 6; i++) { const k = n - i; fly.push(k >= 0 ? (lt - k * rate) / 0.5 : -1); }
            const pu = 1 + 0.08 * punch(lt, hit);
            cal.g.setAttribute('transform', `translate(${f1(0.6 * W)} ${f1(0.48 * H)}) scale(${f1(pu * 100) / 100}) translate(${f1(-0.6 * W)} ${f1(-0.48 * H)})`);
            cal.update(t, 0.6 * W, 0.355 * H, 420 * u, 440 * u, P.header || 'DAY', P.day != null ? String(P.day) : String(((n + 15) % 31) + 1), fly, { leaf: 0.42 });
            tn.update(t, -999, gy, 0.01);
            lt0.update(t, 0.665 * W, gy + 40 * u, 0.8 * u);
            ph.update(t, 0.95 * W, gy + 110 * u, 0.5 * u, { crate: true });
            man.update(t, 'sit', { x: 0.765 * W, y: gy + 50 * u, face: -1, since: lt, emotion: lt < hit ? 'worried' : 'surprised', beam: -0.55 });
          } else if (mode === 'dark') {
            tn.update(t, tx, gy, 1.0 * u);
            lt0.update(t, 0.92 * W, gy + 60 * u, 0.9 * u);
            ph.update(t, 0.14 * W, gy + 70 * u, 0.75 * u);
            const cc = atOr(cues, 'clock', 0.2), cs = atOr(cues, 'sun', dur * 0.55);
            man.update(t, lt < cs ? 'think' : 'shrug', { x: 0.44 * W, y: gy + 30 * u, face: 1, since: lt < cs ? lt : lt - cs, emotion: 'worried', beam: -0.35 });
            const kc = spring(lt, cc, 0.5), ks = spring(lt, cs, 0.5);
            if (lt >= cc) { const a = lt * 0.9; clk.g.style.display = ''; clk.update(t, 0.28 * W, 0.26 * H, 150 * u * kc, a); x1.update(t, 0.28 * W, 0.26 * H, 150 * u, clamp01((lt - cc - 0.25) / 0.35)); }
            else { clk.g.style.display = 'none'; x1.update(t, 0, 0, 0, 0); }
            if (lt >= cs) { sn.update(t, 0.72 * W, 0.26 * H, 105 * u * ks, { halo: false, spin: 0.4 }); x2.update(t, 0.72 * W, 0.26 * H, 150 * u, clamp01((lt - cs - 0.2) / 0.35)); }
            else { sn.update(t, 0, 0, 0); x2.update(t, 0, 0, 0, 0); }
          } else {
            tn.update(t, 0.86 * W, gy, 0.85 * u);
            lt0.update(t, 0.93 * W, gy + 60 * u, 0.9 * u);
            const pr = ph.update(t, 0.16 * W, gy + 60 * u, 0.85 * u, { lifted: true });
            man.update(t, 'think', { x: 0.4 * W, y: gy + 40 * u, face: 1, since: lt, emotion: lt < hit ? 'neutral' : 'happy', receiver: { jack: pr.jack } });
            const k = spring(lt, hit - 0.1, 0.6), bx = 0.65 * W, by = 0.31 * H, br = 175 * u;
            bb.update(t, bx, by, br, k, [0.46 * W, 0.4 * H]);
            if (k > 0.05) { cal2.g.style.display = ''; cal2.update(t, bx, by - 120 * u * k, 220 * u * k, 240 * u * k, P.month || 'AUGUST', String(P.day ?? 20), [], { pop: 1 + 0.08 * punch(lt, hit + 0.3) }); }
            else cal2.g.style.display = 'none';
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ mountain cross-section pieces
  function section(parent, sd) {
    const rock = inkEl(parent, ROCK()), strata = inkEl(parent, ROCK_D(), { 'fill-opacity': 0.5 }), hatch = inkEl(parent, ROCK_D());
    const soil = inkEl(parent, WOOD_D()), grass = inkEl(parent, GRASS()), surf = inkEl(parent);
    const glac = inkEl(parent, ICE()), glacD = inkEl(parent, ICE_D()), glacR = inkEl(parent);
    const cav = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.35)), floor = inkEl(parent, ICE()), cavR = inkEl(parent);
    const shaft = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.2)), shaftR = inkEl(parent);
    return {
      update(t, W, H, L) {
        const u = W / 1080, y0 = L.y0;
        const top = [[-60, y0 + 10 * u]]; for (let i = 0; i <= 12; i++) top.push([i / 12 * W, y0 + Math.sin(i * 1.4) * 10 * u]); top.push([W + 60, y0]);
        rock.setAttribute('d', inkLoop(top.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd, t, amp: 0.5 }));
        soil.setAttribute('d', inkLoop(top.concat(top.slice().reverse().map(([x, y]) => [x, y + 34 * u])), { seed: sd + 1, t, amp: 0.5 }));
        const G = []; for (let i = 0; i < 46; i++) { const x = (i + hn(sd, i)) / 46 * W, h = (24 + 26 * hn(sd + 1, i)) * u, sw = Math.sin(t * 1.6 + i) * 5 * u, y = y0 + Math.sin(x / W * 12 * 1.4) * 10 * u + 4 * u;
          G.push(inkLoop([[x - 8 * u, y], [x + sw, y - h], [x + 8 * u, y]], { seed: sd + 10 + i, t, amp: 0.3 })); }
        grass.setAttribute('d', G.join(' '));
        surf.setAttribute('d', inkPath(top, { w: 6, seed: sd + 2, t }));
        const S = [], HT = [];
        for (let i = 0; i < 12; i++) { const y = y0 + 80 * u + i * 120 * u, P = [];
          for (let x = -40; x <= W + 40; x += 80 * u) P.push([x, y + Math.sin(x * 0.005 + i * 2.1) * 30 * u]);
          S.push(inkPath(P, { w: 7 + 5 * hn(sd + 3, i), seed: sd + 60 + i, t, amp: 0.8 }));
          for (let j = 0; j < 7; j++) { const x = (j + hn(sd + 4, i * 7 + j)) / 7 * W, yy = y + 40 * u; HT.push(inkPath([[x, yy], [x + 26 * u, yy - 22 * u]], { w: 3, seed: sd + 100 + i * 7 + j, t })); } }
        strata.setAttribute('d', S.join(' ')); hatch.setAttribute('d', HT.join(' '));
        // the underground glacier (a big ice lens under the chamber)
        const gc = L.glacier, GP = inkEllipsePts(gc[0], gc[1], gc[2], gc[3], sd + 5, 20, -0.05, 0.08);
        glac.setAttribute('d', inkLoop(GP, { seed: sd + 5, t, amp: 0.8 }));
        const GD = []; for (let i = 0; i < 5; i++) { const y = gc[1] - gc[3] * 0.6 + i * gc[3] * 0.3; GD.push(inkPath([[gc[0] - gc[2] * 0.8, y], [gc[0], y + 14 * u], [gc[0] + gc[2] * 0.8, y - 6 * u]], { w: 8, seed: sd + 200 + i, t })); }
        glacD.setAttribute('d', GD.join(' '));
        glacR.setAttribute('d', inkPath(GP, { w: 6, seed: sd + 6, t, closed: true }));
        // chamber
        const ch = L.chamber, CP = inkEllipsePts(ch[0], ch[1], ch[2], ch[3], sd + 7, 20, 0.04, 0.1);
        cav.setAttribute('d', inkLoop(CP, { seed: sd + 7, t, amp: 0.8 }));
        const fy = L.floor, FP = CP.filter(p => p[1] > fy - 4).concat([[ch[0] - ch[2] * 0.95, fy], [ch[0] + ch[2] * 0.95, fy]]);
        const FL = [[ch[0] - ch[2] * 0.96, fy], [ch[0] + ch[2] * 0.96, fy - 6 * u], [ch[0] + ch[2] * 0.8, ch[1] + ch[3] * 0.85], [ch[0], ch[1] + ch[3] * 1.0], [ch[0] - ch[2] * 0.8, ch[1] + ch[3] * 0.85]];
        void FP;
        floor.setAttribute('d', inkLoop(FL, { seed: sd + 8, t, amp: 0.6 }));
        cavR.setAttribute('d', inkPath(CP, { w: 7, seed: sd + 9, t, closed: true }) + ' ' + inkPath([FL[0], FL[1]], { w: 5, seed: sd + 10, t }));
        // shaft
        const sx = L.shaftX, sw2 = 50 * u, SP = [[sx - sw2, y0 - 4], [sx + sw2, y0 - 4]];
        for (let i = 1; i <= 8; i++) SP.push([sx + sw2 + Math.sin(i * 1.7) * 12 * u, lerp(y0, ch[1] - ch[3] * 0.6, i / 8)]);
        for (let i = 8; i >= 1; i--) SP.push([sx - sw2 + Math.sin(i * 2.3) * 12 * u, lerp(y0, ch[1] - ch[3] * 0.6, i / 8)]);
        shaft.setAttribute('d', inkLoop(SP, { seed: sd + 11, t, amp: 0.6 }));
        shaftR.setAttribute('d', inkPath(SP.slice(2, 10), { w: 5, seed: sd + 12, t }) + ' ' + inkPath(SP.slice(10), { w: 5, seed: sd + 13, t }));
      },
    };
  }
  function ladder(parent, sd) {
    const e = inkEl(parent, mix(INK.paperDark, INK.gold, 0.3));
    return { update(t, x, y0, y1, u) {
      const S = [inkPath([[x - 22 * u, y0], [x - 22 * u, y1]], { w: 5, seed: sd, t }), inkPath([[x + 22 * u, y0], [x + 22 * u, y1]], { w: 5, seed: sd + 1, t })];
      for (let y = y0 + 30 * u, i = 0; y < y1; y += 46 * u, i++) S.push(inkPath([[x - 22 * u, y], [x + 22 * u, y + 3 * u]], { w: 4, seed: sd + 2 + i, t }));
      e.setAttribute('d', S.join(' ')); } };
  }

  // ------------------------------------------------------------------ SHOTS.sf_shaft
  SH.sf_shaft = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 511, u = W / 1080, mode = P.mode || 'descend';
      const L = { y0: 0.2 * H, shaftX: 0.36 * W, chamber: [0.47 * W, 0.49 * H, 0.4 * W, 0.085 * H], floor: 0.545 * H, glacier: [0.5 * W, 0.78 * H, 0.46 * W, 0.12 * H] };
      const root = el(svg, 'g');
      const sec = section(el(root, 'g'), sd);
      const lad = ladder(el(root, 'g'), sd + 30);
      const wire = inkEl(root), pulse = inkEl(root, INK.gold);
      const tn = tent(el(root, 'g'), sd + 40), tnSmall = tent(el(root, 'g'), sd + 50);
      const lant = lantern(el(root, 'g'), sd + 60);
      const phDown = phone(el(root, 'g'), sd + 70), phUp = phone(el(root, 'g'), sd + 80);
      const mate = caver(el(root, 'g'), sd + 90, { scale: 0.42 * u, helmet: false, accessory: 'beret', col: mix(INK.green, INK.ink, 0.3) });
      const man = caver(el(root, 'g'), sd + 110, { scale: 0.42 * u, beamLen: 380 });
      const arrow = inkEl(root, INK.red);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.35);
          sec.update(t, W, H, L);
          const ch = L.chamber, fy = L.floor, y0 = L.y0;
          lad.update(t, L.shaftX, y0 - 30 * u, fy, u);
          tn.update(t, 0.82 * W, y0 + 6 * u, 0.42 * u);
          tnSmall.update(t, 0.74 * W, fy, 0.4 * u);
          lant.update(t, 0.6 * W, fy, 0.5 * u);
          // depth arrow along the right edge: surface -> chamber floor
          const ax = 0.94 * W, A = [inkPath([[ax, y0 + 20 * u], [ax, fy]], { w: 6, seed: sd + 1, t }), inkPath([[ax - 22 * u, y0 + 50 * u], [ax, y0 + 20 * u], [ax + 22 * u, y0 + 50 * u]], { w: 6, seed: sd + 2, t }), inkPath([[ax - 22 * u, fy - 30 * u], [ax, fy], [ax + 22 * u, fy - 30 * u]], { w: 6, seed: sd + 3, t })];
          arrow.setAttribute('d', A.join(' '));
          const pu = phUp.update(t, 0.6 * W, y0 + 4 * u, 0.32 * u, { crate: true, ring: mode === 'call' && lt > hit && lt < hit + 1.6, lifted: mode === 'call' && lt > hit + 0.6 });
          mate.update(t, mode === 'call' && lt > hit + 0.6 ? 'think' : 'idle', { x: 0.68 * W, y: y0 + 6 * u, face: -1, since: lt, emotion: 'neutral', receiver: mode === 'call' && lt > hit + 0.6 ? { jack: pu.jack } : null });
          if (mode === 'descend') {
            const p = progIO(lt, 0.1, Math.max(1, dur * 0.85)), y = lerp(y0 + 150 * u, fy, p);
            phDown.update(t, 0.2 * W, fy, 0.3 * u, { crate: true });
            man.update(t, p < 0.98 ? 'point' : 'idle', { x: L.shaftX, y, face: 1, dir: 80 + Math.sin(t * 6) * 8, since: lt, emotion: 'happy', beam: 1.2 });
            blank(wire, pulse);
          } else {
            const pd = phDown.update(t, 0.2 * W, fy, 0.3 * u, { crate: true, lifted: lt > hit - 0.2 });
            man.update(t, lt > hit - 0.2 ? 'think' : 'sit', { x: 0.29 * W, y: fy, face: -1, since: lt, emotion: lt > hit ? 'happy' : 'neutral', beam: 0.3, receiver: lt > hit - 0.2 ? { jack: pd.jack } : null });
            // the wire: phone below -> up the shaft wall -> surface phone
            const WP = [[0.2 * W + 24 * u, fy - 60 * u], [L.shaftX - 40 * u, ch[1] - ch[3] * 0.4], [L.shaftX - 36 * u, y0 + 40 * u], [L.shaftX - 20 * u, y0 - 10 * u], [0.52 * W, y0 - 6 * u], [0.6 * W - 30 * u, y0 - 20 * u]];
            wire.setAttribute('d', inkPath(WP, { w: 4, seed: sd + 4, t, smooth: false }));
            const PU = []; if (lt > hit - 0.2) for (let i = 0; i < 3; i++) { const q = ((lt - hit + 0.2) * 0.9 + i / 3) % 1;
              let tot = 0; const seg = []; for (let j = 1; j < WP.length; j++) { const d = Math.hypot(WP[j][0] - WP[j - 1][0], WP[j][1] - WP[j - 1][1]); seg.push(d); tot += d; }
              let dd = q * tot, j = 0; while (j < seg.length - 1 && dd > seg[j]) { dd -= seg[j]; j++; }
              const pp = lerpP(WP[j], WP[j + 1], dd / seg[j]); PU.push(inkDot(pp[0], pp[1], 14 * u, 14 * u, sd + 5 + i, t)); }
            pulse.setAttribute('d', PU.join(' '));
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ outdoor pieces: mountain flank with a cave mouth, meadow foreground
  function mountain(parent, sd) {
    const rock = inkEl(parent, ROCK()), shade = inkEl(parent, ROCK_D(), { 'fill-opacity': 0.5 }), snow = inkEl(parent, INK.paperLight), mouth = inkEl(parent, mix(INK.ink, INK.inkSoft, 0.2)), rim = inkEl(parent);
    return {
      update(t, W, H, gy, o = {}) {
        const u = W / 1080, mx = (o.mouth ?? 0.76) * W;
        const M = [[0.32 * W, gy + 20], [0.55 * W, 0.42 * H], [0.7 * W, 0.3 * H], [0.86 * W, 0.2 * H], [W + 60, 0.16 * H], [W + 60, gy + 20]];
        rock.setAttribute('d', inkLoop(M, { seed: sd, t, amp: 0.8 }));
        snow.setAttribute('d', inkLoop([[0.78 * W, 0.245 * H], [0.86 * W, 0.2 * H], [W + 60, 0.16 * H], [W + 60, 0.2 * H], [0.93 * W, 0.235 * H], [0.88 * W, 0.225 * H]], { seed: sd + 1, t, amp: 0.6 }));
        const S = []; for (let i = 0; i < 6; i++) { const y = 0.3 * H + i * 0.05 * H; S.push(inkPath([[lerp(0.6, 0.4, i / 6) * W + i * 10 * u, y + 0.08 * H], [W + 40, y]], { w: 9, seed: sd + 10 + i, t })); }
        shade.setAttribute('d', S.join(' '));
        const MP = [[mx - 140 * u, gy], [mx - 130 * u, gy - 170 * u], [mx - 60 * u, gy - 270 * u], [mx + 40 * u, gy - 280 * u], [mx + 120 * u, gy - 190 * u], [mx + 140 * u, gy]];
        mouth.setAttribute('d', inkLoop(MP, { seed: sd + 2, t, amp: 0.6 }));
        rim.setAttribute('d', inkPath(M.slice(0, 5), { w: 6, seed: sd + 3, t }) + ' ' + inkPath(MP, { w: 7, seed: sd + 4, t }));
        return { mouth: [mx, gy] };
      },
    };
  }
  function meadow(parent, sd) {
    const base = inkEl(parent, GRASS()), stones = inkEl(parent, ROCK_L()), rim = inkEl(parent), blades = inkEl(parent, mix(INK.green, INK.ink, 0.2)), big = inkEl(parent, ROCK());
    return {
      update(t, W, H, gy) {
        const u = W / 1080;
        base.setAttribute('d', inkLoop([[-60, gy], [W + 60, gy - 6 * u], [W + 60, H + 60], [-60, H + 60]], { seed: sd, t, amp: 0.6, smooth: false }));
        const ST = [], R = [inkPath([[-60, gy], [W + 60, gy - 6 * u]], { w: 6, seed: sd + 1, t })];
        for (let i = 0; i < 9; i++) { const x = (0.05 + 0.11 * i) * W, y = gy + (120 + 520 * hn(sd + 2, i)) * u, r = (24 + 30 * hn(sd + 3, i)) * u * (1 + (y - gy) / 900);
          const P = inkEllipsePts(x, y, r * 1.5, r, sd + 10 + i, 9, 0, 0.15); ST.push(inkLoop(P, { seed: sd + 10 + i, t, amp: 0.5 })); R.push(inkPath(P.slice(0, 6), { w: 4, seed: sd + 20 + i, t })); }
        stones.setAttribute('d', ST.join(' '));
        const BG = [[-60, H + 60], [-60, H - 300 * u], [140 * u, H - 340 * u], [300 * u, H - 230 * u], [360 * u, H + 60]], BG2 = [[W + 60, H + 60], [W + 60, H - 260 * u], [W - 200 * u, H - 300 * u], [W - 330 * u, H + 60]];
        big.setAttribute('d', inkLoop(BG, { seed: sd + 30, t, amp: 0.8 }) + ' ' + inkLoop(BG2, { seed: sd + 31, t, amp: 0.8 }));
        R.push(inkPath(BG.slice(1, 4), { w: 6, seed: sd + 32, t }), inkPath(BG2.slice(1, 3), { w: 6, seed: sd + 33, t }));
        rim.setAttribute('d', R.join(' '));
        const B = []; for (let i = 0; i < 44; i++) { const x = (i + hn(sd + 4, i)) / 44 * (W + 80) - 40, y = gy + 30 * u + hn(sd + 5, i) * (H - gy), L = (40 + 60 * hn(sd + 6, i)) * u * (1 + (y - gy) / 700), sw = Math.sin(t * 1.5 + i) * 8 * u;
          B.push(inkLoop([[x - 7 * u, y], [x + sw, y - L], [x + 7 * u, y]], { seed: sd + 50 + i, t, amp: 0.3 })); }
        blades.setAttribute('d', B.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.sf_camp
  SH.sf_camp = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 711, u = W / 1080, mode = P.mode || 'secret', gy = (P.gy ?? 0.6) * H;
      const root = el(svg, 'g');
      const LH = window.LH;
      if (mode === 'secret') {
        const canvas = inkEl(root, mix(INK.paperDark, INK.paperLight, 0.35)), seams = inkEl(root, INK.inkSoft), pole = inkEl(root, WOOD_D());
        const floorC = inkEl(root, mix(INK.paperDark, INK.stain, 0.45)), under = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.55));
        const crate = inkEl(root, WOOD()), sack = inkEl(root, mix(INK.green, INK.inkSoft, 0.35)), sackS = inkEl(root, WOOD_D()), coilE = inkEl(root, INK.ink), legs = inkEl(root, WOOD_D()), apron = inkEl(root, WOOD()), ul = inkEl(root);
        const mate = caver(el(root, 'g'), sd + 10, { scale: 1.15 * u, helmet: false, accessory: 'beret', col: mix(INK.green, INK.ink, 0.3) });
        const top = inkEl(root, WOOD()), tl = inkEl(root);
        const ph = phone(el(root, 'g'), sd + 30);
        const book = inkEl(root, INK.paperLight), bookR = inkEl(root), ink = inkEl(root, INK.inkSoft), pen = inkEl(root, INK.blue);
        const clk = LH.clock(el(root, 'g'), sd + 50), bells = inkEl(root, INK.gold), bellsR = inkEl(root);
        const cloth = inkEl(root, mix(INK.paperLight, INK.blue, 0.15)), clothR = inkEl(root), stripe = inkEl(root, INK.red);
        const lamp = lantern(el(root, 'g'), sd + 70);
        const LB = labels(root, P.labels, W, H);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.45);
            const fl = 0.885 * H;
            canvas.setAttribute('d', inkLoop(rectP(-60, -60, W + 60, fl + 10), { seed: sd, t, amp: 0.5, smooth: false }));
            const S = []; for (let i = 1; i < 6; i++) { const x = i / 6 * W + Math.sin(t * 0.7 + i) * 4 * u; S.push(inkPath([[x, -40], [x + (i - 3) * 14 * u, fl]], { w: 3, seed: sd + 1 + i, t })); }
            S.push(inkPath([[-40, 0.08 * H], [W / 2, 0.03 * H], [W + 40, 0.08 * H]], { w: 4, seed: sd + 8, t }));
            seams.setAttribute('d', S.join(' '));
            floorC.setAttribute('d', inkLoop(rectP(-60, fl, W + 60, H + 60), { seed: sd + 60, t, amp: 0.5, smooth: false }));
            pole.setAttribute('d', inkPath([[0.93 * W, -40], [0.93 * W, gy]], { w: 26 * u, seed: sd + 9, t, taper: 0 }));
            const tp = gy;
            const pr = ph.update(t, 0.17 * W, tp, 0.8 * u, { crate: false, lifted: true });
            const cov = spring(lt, hit, 0.55);
            mate.update(t, 'think', { x: 0.36 * W, y: tp + 150 * u, face: 1, since: lt, emotion: lt < hit ? 'neutral' : 'worried', receiver: { jack: pr.jack } });
            const TP = rectP(-60, tp, W + 60, tp + 46 * u);
            top.setAttribute('d', inkLoop(TP, { seed: sd + 11, t, amp: 0.6, smooth: false }));
            // under the table: shadow, legs, a crate, a rucksack and a coil of phone wire on the tent floor
            const ap = rectP(-60, tp + 46 * u, W + 60, tp + 130 * u);
            under.setAttribute('d', inkLoop(rectP(0.04 * W, tp + 130 * u, 0.96 * W, fl + 30 * u), { seed: sd + 61, t, amp: 0.5, smooth: false }));
            apron.setAttribute('d', inkLoop(ap, { seed: sd + 12, t, amp: 0.6, smooth: false }));
            const LG = [rectP(0.02 * W, tp + 130 * u, 0.09 * W, H - 40 * u), rectP(0.91 * W, tp + 130 * u, 0.98 * W, H - 40 * u)];
            legs.setAttribute('d', LG.map((q, i) => inkLoop(q, { seed: sd + 62 + i, t, amp: 0.5, smooth: false })).join(' '));
            const CR = rectP(0.13 * W, H - 330 * u, 0.4 * W, H - 70 * u);
            crate.setAttribute('d', inkLoop(CR, { seed: sd + 64, t, amp: 0.5, smooth: false }));
            const SK = [[0.62 * W, H - 60 * u], [0.6 * W, H - 260 * u], [0.66 * W, H - 340 * u], [0.78 * W, H - 345 * u], [0.84 * W, H - 260 * u], [0.83 * W, H - 60 * u]];
            sack.setAttribute('d', inkLoop(SK, { seed: sd + 65, t, amp: 0.6 }));
            sackS.setAttribute('d', inkLoop([[0.61 * W, H - 250 * u], [0.85 * W, H - 255 * u], [0.83 * W, H - 190 * u], [0.62 * W, H - 185 * u]], { seed: sd + 66, t, amp: 0.5 }));
            const CO = []; for (let i = 0; i < 4; i++) CO.push(inkCircle(0.5 * W, H - 110 * u, (70 - i * 12) * u, sd + 67 + i, t, { w: 5, ry: (30 - i * 5) * u }));
            CO.push(inkPath([[0.5 * W + 70 * u, H - 110 * u], [0.56 * W, tp + 260 * u], [0.3 * W, tp + 140 * u]], { w: 4, seed: sd + 72, t }));
            coilE.setAttribute('d', CO.join(' '));
            const TL = [inkPath(TP, { w: 6, seed: sd + 13, t, closed: true, smooth: false }), inkPath(ap, { w: 5, seed: sd + 14, t, closed: true, smooth: false })];
            LG.forEach((q, i) => TL.push(inkPath(q, { w: 5, seed: sd + 15 + i, t, closed: true, smooth: false })));
            TL.push(inkPath(CR, { w: 5, seed: sd + 17, t, closed: true, smooth: false }), inkPath([[0.13 * W, H - 200 * u], [0.4 * W, H - 200 * u]], { w: 3, seed: sd + 18, t }), inkPath([[0.13 * W, H - 330 * u], [0.4 * W, H - 70 * u]], { w: 3, seed: sd + 19, t }));
            TL.push(inkPath(SK, { w: 5, seed: sd + 20, t, closed: true }), inkPath([[0.68 * W, H - 340 * u], [0.72 * W, H - 400 * u], [0.76 * W, H - 342 * u]], { w: 6, seed: sd + 21, t }));
            TL.push(inkPath([[-60, fl], [W + 60, fl]], { w: 5, seed: sd + 22, t }));
            tl.setAttribute('d', TL.join(' '));
            // logbook with times written in
            const bx = 0.55 * W, by = tp - 8 * u, BK = [[bx - 150 * u, by], [bx + 150 * u, by], [bx + 120 * u, by - 70 * u], [bx - 120 * u, by - 70 * u]];
            book.setAttribute('d', inkLoop(BK, { seed: sd + 20, t, amp: 0.5, smooth: false }));
            bookR.setAttribute('d', inkPath(BK, { w: 4, seed: sd + 21, t, closed: true, smooth: false }) + ' ' + inkPath([[bx, by], [bx, by - 70 * u]], { w: 3, seed: sd + 22, t }));
            const wk = clamp01(lt / Math.max(1, dur * 0.8)), IL = [];
            for (let i = 0; i < 4; i++) { const k = clamp01(wk * 4 - i); if (k > 0) { const y = by - 14 * u - i * 15 * u; IL.push(inkPath([[bx + 20 * u, y], [bx + lerp(20, 110, k) * u, y]], { w: 3, seed: sd + 23 + i, t })); }
              IL.push(inkPath([[bx - 110 * u, by - 14 * u - i * 15 * u], [bx - 30 * u, by - 14 * u - i * 15 * u]], { w: 3, seed: sd + 30 + i, t })); }
            ink.setAttribute('d', IL.join(' '));
            const pq = Math.min(3, Math.floor(wk * 4)), px = bx + 20 * u + ((t * 2) % 1) * 90 * u, py = by - 14 * u - pq * 15 * u;
            pen.setAttribute('d', inkPath([[px, py], [px + 40 * u, py - 110 * u]], { w: 10 * u, seed: sd + 35, t }));
            // alarm clock + bells, then a cloth drops over it
            const cx = 0.8 * W, cyy = tp - 120 * u, cr = 95 * u;
            clk.update(t, cx, cyy, cr, lt * 0.5);
            bells.setAttribute('d', inkCircle(cx - 70 * u, cyy - 92 * u, 32 * u, sd + 40, t, { fill: true }) + ' ' + inkCircle(cx + 70 * u, cyy - 92 * u, 32 * u, sd + 41, t, { fill: true }));
            bellsR.setAttribute('d', inkCircle(cx - 70 * u, cyy - 92 * u, 32 * u, sd + 42, t, { w: 4 }) + ' ' + inkCircle(cx + 70 * u, cyy - 92 * u, 32 * u, sd + 43, t, { w: 4 }) + ' ' + inkPath([[cx - 60 * u, tp], [cx - 70 * u, cyy + cr]], { w: 6, seed: sd + 44, t }) + ' ' + inkPath([[cx + 60 * u, tp], [cx + 70 * u, cyy + cr]], { w: 6, seed: sd + 45, t }));
            if (lt >= hit) { const dy = (1 - cov) * -380 * u;
              const C = [[cx - 135 * u, cyy + 70 * u], [cx - 125 * u, cyy - 80 * u], [cx - 70 * u, cyy - 150 * u], [cx + 20 * u, cyy - 150 * u], [cx + 70 * u, cyy - 80 * u], [cx + 55 * u, cyy + 10 * u], [cx - 10 * u, cyy + 40 * u], [cx - 60 * u, cyy + 90 * u]].map(([x, y]) => [x, y + dy]);
              cloth.setAttribute('d', inkLoop(C, { seed: sd + 46, t, amp: 0.7 }));
              clothR.setAttribute('d', inkPath(C, { w: 5, seed: sd + 47, t, closed: true }));
              stripe.setAttribute('d', [0.3, 0.55].map((q, i) => inkPath([lerpP(C[1], C[7], q), lerpP(C[3], C[5], q)], { w: 10 * u, seed: sd + 48 + i, t })).join(' '));
            } else blank(cloth, clothR, stripe);
            lamp.update(t, 0.97 * W, tp + 4 * u, 0.0);
            LB.forEach(l => l.update(lt, t, cues));
          },
        };
      }
      const mt = mountain(el(root, 'g'), sd);
      const sn = sun(el(root, 'g'), sd + 20);
      const tn = mode === 'end' || mode === 'start' ? tent(el(root, 'g'), sd + 40) : null;
      const wire = inkEl(root);
      const man = mode === 'sun' || mode === 'start' ? caver(el(root, 'g'), sd + 60, { scale: 1.0 * u, beamLen: mode === 'start' ? 300 : 0 }) : null;
      const coil = mode === 'start' ? inkEl(root, mix(INK.paperDark, INK.gold, 0.3)) : null;
      const shade = inkEl(root, INK.ink, { 'fill-opacity': 0.18 });
      const md = meadow(el(root, 'g'), sd + 80);
      const bb = mode === 'sun' ? bubble(el(root, 'g'), sd + 100) : null;
      const clk = mode === 'sun' ? LH.clock(el(root, 'g'), sd + 110) : null;
      const chest = mode === 'sun' ? LH.clock(el(root, 'g'), sd + 120) : null, chestG = mode === 'sun' ? inkEl(root, INK.gold, { 'fill-opacity': 0.3 }) : null;
      const kas = P.kasif ? LH.kasif(el(root, 'g'), Object.assign({ x: 0.5, y: gy / H + 0.06, scale: 1.0, pose: 'wave', face: 'right', emotion: 'happy' }, P.kasif), W, H, seed) : null;
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.4);
          const m = mt.update(t, W, H, gy);
          const rise = mode === 'sun' ? progIO(lt, 0, Math.max(1.2, dur * 0.7)) : 1;
          sn.update(t, (mode === 'sun' ? 0.3 : 0.44) * W, lerp(0.3, 0.2, rise) * H, (mode === 'sun' ? 120 : 80) * u * (1 + 0.04 * punch(lt, hit)), { spin: 0.25 });   // the "field" set has no sun of its own
          if (tn) { tn.update(t, 0.2 * W, gy + 10 * u, 0.6 * u); wire.setAttribute('d', inkPath([[m.mouth[0] - 100 * u, gy + 4 * u], [0.5 * W, gy + 14 * u], [0.2 * W + 140 * u, gy + 8 * u]], { w: 4, seed: sd + 5, t })); }
          else wire.setAttribute('d', '');
          if (man && mode === 'start') {
            const x = lerp(0.42, 0.6, progIO(lt, 0, Math.max(1.2, dur * 0.55))), walking = lt < Math.max(1.2, dur * 0.55);
            const r = man.update(t, walking ? 'walk' : 'point', { x: x * W, y: gy + 40 * u, face: 1, ph: lt * 1.4, since: walking ? lt : lt - dur * 0.55, dir: -10, emotion: 'happy', beam: 0.1 });
            shade.setAttribute('d', '');
            const hp = r.hipW, C = []; for (let i = 0; i < 3; i++) C.push(inkCircle(hp[0] - 50 * u, hp[1] + 10 * u, (40 - i * 9) * u, sd + 7 + i, t, { w: 7, ry: (52 - i * 10) * u }));
            coil.setAttribute('d', C.join(' '));
          } else if (man) {
            const x = lerp(0.68, 0.56, progIO(lt, 0, 1.2)) * W;
            const r = man.update(t, lt < 1.0 ? 'walk' : lt < hit ? 'shock' : 'think', { x, y: gy + 40 * u, face: -1, ph: lt * 1.4, since: lt < 1 ? lt : lt < hit ? lt - 1 : lt - hit, emotion: lt < hit ? 'surprised' : 'worried' });
            shade.setAttribute('d', inkLoop(inkEllipsePts(x + 160 * u, gy + 46 * u, 190 * u, 18 * u, sd + 6, 12, 0, 0.05), { seed: sd + 6, t, amp: 0.4 }));
            const k = spring(lt, hit - 0.1, 0.6), bx = 0.62 * W, by = 0.27 * H;
            bb.update(t, bx, by, 150 * u, k, [r.headW[0] + 10 * u, r.headW[1] - 80 * u]);
            if (k > 0.05) { clk.g.style.display = ''; clk.update(t, bx, by, 110 * u * k, lt * 3.2 + Math.sin(lt * 7) * 0.3); } else clk.g.style.display = 'none';
            const bt = atOr(cues, 'body', 0.3), kb = spring(lt, bt, 0.5);
            if (lt >= bt) { const c = [lerp(r.hipW[0], r.headW[0], 0.45), lerp(r.hipW[1], r.headW[1], 0.45)]; chest.g.style.display = '';
              chestG.setAttribute('d', inkCircle(c[0], c[1], 70 * u * kb * (1 + 0.08 * Math.sin(lt * 6.3)), sd + 121, t, { fill: true }));
              chest.update(t, c[0], c[1], 48 * u * kb, Math.floor(lt) / 60 * 12); } else { chest.g.style.display = 'none'; chestG.setAttribute('d', ''); }
          } else shade.setAttribute('d', '');
          md.update(t, W, H, gy + 40 * u);
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.sf_count
  SH.sf_count = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 911, u = W / 1080, gy = (P.gy ?? 0.6) * H, to = P.to ?? 120, turns = P.turns ?? 5;
      const root = el(svg, 'g');
      const cb = caveBack(el(root, 'g'), sd);
      const lant = lantern(el(root, 'g'), sd + 20);
      const bb = bubble(el(root, 'g'), sd + 30);
      const num = txt(root, { 'font-family': SERIF, 'font-weight': 900, fill: INK.ink });
      const clk = window.LH.clock(el(root, 'g'), sd + 40), crown = inkEl(root, INK.ink), sweep = inkEl(root, INK.red, { 'fill-opacity': 0.28 });
      const tm = txt(root, { 'font-family': SERIF, 'font-weight': 900, fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      const kas = window.LH.kasif(el(root, 'g'), Object.assign({ x: 0.5, y: gy / H + 0.05, scale: 1.0, pose: 'point', face: 'right', dir: 30, emotion: 'happy' }, P.kasif || {}), W, H, seed);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.75), st = atOr(cues, 'count', 0.1);
          cb.update(t, W, H, gy, { glow: [0.86 * W, gy + 50 * u, 260 * u], drip: 2 });
          lant.update(t, 0.91 * W, gy + 50 * u, 0.85 * u);
          const p = clamp01((lt - st) / Math.max(0.8, hit - st));
          // counting bubble (left)
          const bx = 0.27 * W, by = 0.3 * H, k = spring(lt, 0, 0.5);
          bb.update(t, bx, by, 190 * u, k, [0.44 * W, 0.42 * H]);
          const n = Math.max(1, Math.round(1 + (to - 1) * p));
          num.textContent = String(n); num.setAttribute('x', f1(bx)); num.setAttribute('y', f1(by + 58 * u)); num.setAttribute('font-size', f1(170 * u * k * (1 + 0.06 * Math.sin(t * 8))));
          // stopwatch (right): sweeps `turns` minutes while he counts
          const cx = 0.74 * W, cy = 0.29 * H, r = 165 * u * (1 + 0.1 * punch(lt, hit)), a = turns * p;
          clk.update(t, cx, cy, r, a);
          crown.setAttribute('d', inkLoop(rectP(cx - 26 * u, cy - r - 46 * u, cx + 26 * u, cy - r - 8 * u), { seed: sd + 50, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(rectP(cx - 46 * u, cy - r - 70 * u, cx + 46 * u, cy - r - 46 * u), { seed: sd + 51, t, amp: 0.4, smooth: false }));
          const fr = a % 1, SW = [[cx, cy]]; for (let i = 0; i <= 20; i++) { const q = i / 20 * fr * Math.PI * 2; SW.push([cx + Math.sin(q) * r * 0.82, cy - Math.cos(q) * r * 0.82]); }
          sweep.setAttribute('d', fr > 0.01 ? inkLoop(SW, { seed: sd + 52, t, amp: 0.3, smooth: false }) : '');
          const mins = Math.floor(turns * p), secs = Math.floor((turns * p - mins) * 60);
          tm.textContent = `${mins}:${String(secs).padStart(2, '0')}`; tm.setAttribute('x', f1(cx)); tm.setAttribute('y', f1(cy + r + 110 * u)); tm.setAttribute('font-size', f1(100 * u * (1 + 0.15 * punch(lt, hit))));
          kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.sf_calendar
  SH.sf_calendar = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 1111, u = W / 1080, gy = (P.gy ?? 0.62) * H;
      const from = P.from || ['AUGUST', 20], to = P.to || ['SEPTEMBER', 14];
      const d0 = from[1] + (from[0] === 'SEPTEMBER' ? AUG : 0), d1 = to[1] + (to[0] === 'SEPTEMBER' ? AUG : 0), steps = Math.max(1, d1 - d0);
      const root = el(svg, 'g');
      const cb = caveBack(el(root, 'g'), sd);
      const cal = calendar(el(root, 'g'), sd + 30);
      const lant = lantern(el(root, 'g'), sd + 60), ph = phone(el(root, 'g'), sd + 70);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, a = atOr(cues, 'flip', 0.1), end = Math.max(a + 0.5, Math.min(dur * 0.55, a + 1.2));
          cb.update(t, W, H, gy, { glow: [0.08 * W, gy + 40 * u, 220 * u], sides: 0.08, drip: 7 });
          const p = clamp01((lt - a) / (end - a)), e = p * p * (3 - 2 * p), n = Math.round(steps * e), rate = (end - a) / steps;
          const fly = []; for (let i = 0; i < 6; i++) { const k = n - i; fly.push(k >= 1 && lt > a ? (lt - (a + k * rate)) / 0.35 : -1); }
          const [mo, dy] = dateAfter(d0, n);
          const done = n >= steps, pop = done ? 1 + 0.12 * punch(lt, end) : 1;
          cal.update(t, 0.5 * W, 0.14 * H, 660 * u, 760 * u, mo, dy, fly, { leaf: 0.42, pop, dayColor: done ? INK.red : null });
          lant.update(t, 0.08 * W, gy + 40 * u, 0.9 * u);
          ph.update(t, 0.8 * W, gy + 70 * u, 0.8 * u, { crate: true });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
