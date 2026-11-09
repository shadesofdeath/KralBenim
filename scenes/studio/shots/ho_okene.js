// ho_okene: shots for the Stickstory Short "Harrison Okene's Air Pocket" (2026-11-09): on 26 May 2013 the tugboat
// Jascon-4 capsized in heavy swell off Nigeria and sank upside down to the seabed, about 30 m down. The ship's cook,
// Harrison Okene, survived about 60 hours in a pocket of air trapped in the upturned hull, in the dark, until divers
// sent to recover the crew found him: the diver reached for a hand and the hand grabbed him. Parchment ink style
// (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure
// function of (seed, lt); no Math.random. Parametric: any capsized ship / trapped-air / underwater rescue moment.
// Uses lh__lib.js (window.LH.label, LH.kasif) at build time.
//
// Common: L = labels [{text, x, y (0..1), at, size, color: ink|red|gold|blue|paper, font: hand|serif, card, rot,
//   underline, halo: "ink"}] (LH.label). K = Kaşif {x, y (0..1 ground), scale, pose, face, dir, emotion, seq}.
//
// SHOTS.ho_hand — full-frame dark water inside a sunken hull, a diver's torch beam from the top right with drifting
//   specks. P: {mode: "hook"|"reveal", labels}
//   "hook": a limp bare hand and forearm reach out of a dark doorway; the diver's gloved hand (red drysuit sleeve)
//     comes in along the beam and closes on it at cue "grab"; at cue "hit" the bare fingers close round the glove.
//   "reveal": inside the air pocket (lit air above, dark water below): the cook (chest-deep, left) and the diver
//     (gold helmet, torch, right) clasp hands in the middle; bubbles rise from the helmet. cue "hit" punches the clasp.
//   "face": the clasp held from the start (no reach), and behind it in the dark doorway the cook's face lit gold by
//     the torch: eyes wide, brows up, mouth open (stunned, scared); cue "hit" punches.
// SHOTS.ho_pocket — the pocket of air alone, big and still under the riveted keel plates, slow gold rings, bubbles
//   drifting up from the dark water, the old ceiling as the floor. P: {water: 0.46, labels}  cue: hit (stronger pulse)
// SHOTS.ho_tug — the tug on the open sea. P: {mode: "capsize"|"end", labels, kasif}
//   "capsize": end-on view of the tug (fenders, wheelhouse, mast) rolling in a heavy swell; at cue "flip" it rolls
//     over to keel-up, spray flies and the swell grows; near swell fills the bottom of the frame.
//   "end": calm sea, the dive support ship side-on with Kaşif (P.kasif) on its after deck; a thin string of gold
//     bubbles rises to the surface beside it.
// SHOTS.ho_section — cross-section of the sea: surface at the top, water darkening with depth, light rays, fish,
//   the seabed (sand, rocks, seagrass) down to the frame bottom, a red depth arrow. The tug lies upside down on the bed.
//   P: {mode: "sink"|"bubble"|"divers"|"alive", arrow: true (depth arrow), arrowFrom: [0.78, 0.395] (AIR arrow start), labels}
//   "sink": the keel-up tug sinks from the surface to the bed (lands at ~85 % of the scene; silt puff); the depth
//     arrow draws itself; cue "hit" pops the depth label.
//   "bubble": cut-away hull: one compartment shows a gold pocket of air over dark water with the cook's head in it;
//     cue "hit" pulses the air and pops an AIR label with an arrow.
//   "divers": the support ship on the surface; two divers with torches descend on their hoses to the hull.
//   "alive": cut-away pocket glows, a diver at the compartment shines his torch in; at cue "hit" gold rings pulse out.
// SHOTS.ho_hull — inside the upturned cabin: floor planks on the ceiling, the door and the washbasin upside down,
//   a bunk hanging overhead, a porthole; dark water up to the cook's chest, he holds on to the basin.
//   P: {mode: "dark"|"wait", hours: 60, labels}
//   "dark": a floating torch throws a flickering beam that dies at cue "dark"; the room sinks into darkness.
//   "wait": a counter climbs 0 -> P.hours with HOURS under it, the water creeps up, his breath mists.
// SHOTS.ho_glass — kitchen-table demo: a glass bowl of water; Kaşif (P.kasif) pushes an upside-down glass down into
//   it and the air stays trapped inside (gold); at cue "hit" an AIR label pops. Table front fills the frame bottom.
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
  const ease = p => { p = clamp01(p); return p * p * (3 - 2 * p); };

  const W_SH = () => mix(INK.blue, INK.paperLight, 0.4), W_MID = () => mix(INK.blue, INK.ink, 0.12);
  const W_DEEP = () => mix(INK.blue, INK.ink, 0.42), W_DARK = () => mix(INK.blue, INK.ink, 0.62);
  const SAND = () => mix(INK.stain, INK.paperDark, 0.35), SAND_D = () => mix(INK.stain, INK.ink, 0.3), SAND_DD = () => mix(INK.stain, INK.ink, 0.55);
  const HULL = () => INK.red, HULL_D = () => mix(INK.red, INK.ink, 0.4);
  const SKIN = () => mix(mix(INK.red, INK.gold, 0.45), INK.ink, 0.5), GLOVE = () => mix(INK.inkSoft, INK.paperDark, 0.35);
  const SUIT = () => mix(INK.red, INK.inkSoft, 0.3), HELM = () => INK.gold;
  const ROOM = () => mix(INK.inkSoft, INK.ink, 0.35), ROOM_L = () => mix(INK.inkSoft, INK.paperDark, 0.3), ROOM_D = () => mix(INK.ink, INK.blue, 0.2);
  const AIR = () => mix(INK.gold, INK.paperLight, 0.45);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25), WOOD_D = () => mix(INK.stain, INK.ink, 0.35);

  // ------------------------------------------------------------------ tug, side view (local: waterline y = 0, bow at +x)
  function tugSide(parent, sd) {
    const g = el(parent, 'g');
    const hull = inkEl(g, HULL()), stripe = inkEl(g, HULL_D()), cab = inkEl(g, INK.paperLight), fun = inkEl(g, INK.paperDark), band = inkEl(g, INK.red);
    const win = inkEl(g, INK.inkSoft), port = inkEl(g, INK.paperLight), rim = inkEl(g), tyres = inkEl(g), lamp = inkEl(g, INK.gold);
    const HP = [[-285, -40], [150, -50], [250, -78], [302, -102], [286, -42], [238, 30], [160, 92], [-220, 92], [-278, 22]];
    const CB = [[-140, -46], [120, -50], [110, -172], [-130, -172]], WH = [[-60, -172], [100, -172], [90, -252], [-50, -252]];
    const FN = [[-128, -172], [-82, -172], [-88, -256], [-122, -256]];
    return {
      g,
      update(t, x, y, s, ang = 0, o = {}) {
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)}) scale(${f1(s * 100) / 100})`);
        hull.setAttribute('d', inkLoop(HP, { seed: sd, t, amp: 0.8 }));
        stripe.setAttribute('d', inkPath([[-268, 40], [236, 40]], { w: 14, seed: sd + 1, t, amp: 0.6 }));
        cab.setAttribute('d', inkLoop(CB, { seed: sd + 2, t, amp: 0.6, smooth: false }) + ' ' + inkLoop(WH, { seed: sd + 3, t, amp: 0.6, smooth: false }));
        fun.setAttribute('d', inkLoop(FN, { seed: sd + 4, t, amp: 0.5, smooth: false }));
        band.setAttribute('d', inkLoop(rectP(-124, -238, -86, -218), { seed: sd + 5, t, amp: 0.4, smooth: false }));
        const WN = []; for (let i = 0; i < 5; i++) WN.push(inkLoop(rectP(-112 + i * 50, -146, -84 + i * 50, -112), { seed: sd + 10 + i, t, amp: 0.4, smooth: false }));
        for (let i = 0; i < 3; i++) WN.push(inkLoop(rectP(-36 + i * 44, -236, -6 + i * 44, -200), { seed: sd + 20 + i, t, amp: 0.4, smooth: false }));
        win.setAttribute('d', WN.join(' '));
        port.setAttribute('d', [-190, -120, -50].map((px, i) => inkCircle(px, 14, 13, sd + 30 + i, t, { fill: true })).join(' '));
        rim.setAttribute('d', inkPath(HP, { w: 7, seed: sd + 40, t, closed: true }) + ' ' + inkPath(CB, { w: 5, seed: sd + 41, t, closed: true, smooth: false }) + ' ' +
          inkPath(WH, { w: 5, seed: sd + 42, t, closed: true, smooth: false }) + ' ' + inkPath(FN, { w: 4, seed: sd + 43, t, closed: true, smooth: false }) + ' ' +
          inkPath([[-285, -40], [150, -50], [302, -102]], { w: 14, seed: sd + 44, t }) + ' ' + inkPath([[20, -252], [20, -362]], { w: 7, seed: sd + 45, t }) + ' ' +
          inkPath([[-10, -330], [52, -330]], { w: 5, seed: sd + 46, t }) + ' ' + inkPath([[-70, -254], [110, -254]], { w: 8, seed: sd + 47, t }) + ' ' +
          [-190, -120, -50].map((px, i) => inkCircle(px, 14, 14, sd + 50 + i, t, { w: 4 })).join(' ') + ' ' + inkPath([[-250, -40], [-250, -78], [-200, -78]], { w: 5, seed: sd + 48, t }));
        tyres.setAttribute('d', [-230, -150, -70, 10, 90, 170].map((px, i) => inkCircle(px, -16, 17, sd + 60 + i, t, { w: 9, ry: 22 })).join(' '));
        const bl = 0.6 + 0.4 * Math.sin(t * 4);
        lamp.setAttribute('d', o.lights === false ? '' : inkDot(20, -366, 10 * bl + 4, 10 * bl + 4, sd + 70, t));
      },
    };
  }
  // local point of tugSide -> world, for a given transform
  const tugW = (x, y, s, ang, p) => { const a = ang * Math.PI / 180, c = Math.cos(a), sn = Math.sin(a); return [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s]; };

  // ------------------------------------------------------------------ tug, end-on view (local: waterline y = 0)
  function tugEnd(parent, sd) {
    const g = el(parent, 'g');
    const hull = inkEl(g, HULL()), keel = inkEl(g, HULL_D()), cab = inkEl(g, INK.paperLight), win = inkEl(g, INK.inkSoft), rim = inkEl(g), tyres = inkEl(g), lamp = inkEl(g, INK.gold);
    const HP = [[-235, -72], [235, -72], [218, 12], [150, 84], [-150, 84], [-218, 12]];
    const CB = [[-140, -72], [140, -72], [130, -192], [-130, -192]], WH = [[-112, -192], [112, -192], [96, -282], [-96, -282]];
    return {
      g,
      update(t, x, y, s, ang = 0) {
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)}) scale(${f1(s * 100) / 100})`);
        hull.setAttribute('d', inkLoop(HP, { seed: sd, t, amp: 0.8 }));
        keel.setAttribute('d', inkLoop([[-200, 30], [200, 30], [150, 84], [-150, 84]], { seed: sd + 1, t, amp: 0.6 }));
        cab.setAttribute('d', inkLoop(CB, { seed: sd + 2, t, amp: 0.6, smooth: false }) + ' ' + inkLoop(WH, { seed: sd + 3, t, amp: 0.6, smooth: false }));
        const WN = []; for (let i = 0; i < 4; i++) WN.push(inkLoop(rectP(-100 + i * 54, -160, -64 + i * 54, -118), { seed: sd + 10 + i, t, amp: 0.4, smooth: false }));
        for (let i = 0; i < 3; i++) WN.push(inkLoop(rectP(-78 + i * 56, -266, -36 + i * 56, -214), { seed: sd + 20 + i, t, amp: 0.4, smooth: false }));
        win.setAttribute('d', WN.join(' '));
        rim.setAttribute('d', inkPath(HP, { w: 8, seed: sd + 30, t, closed: true }) + ' ' + inkPath(CB, { w: 6, seed: sd + 31, t, closed: true, smooth: false }) + ' ' +
          inkPath(WH, { w: 6, seed: sd + 32, t, closed: true, smooth: false }) + ' ' + inkPath([[-130, -286], [130, -286]], { w: 9, seed: sd + 33, t }) + ' ' +
          inkPath([[0, -286], [0, -430]], { w: 8, seed: sd + 34, t }) + ' ' + inkPath([[-64, -392], [64, -392]], { w: 6, seed: sd + 35, t }) + ' ' +
          inkPath([[-46, -312], [46, -312]], { w: 5, seed: sd + 36, t }) + ' ' + inkPath([[-235, -72], [235, -72]], { w: 12, seed: sd + 37, t }));
        tyres.setAttribute('d', [-172, -86, 0, 86, 172].map((px, i) => inkCircle(px, -36, 28, sd + 40 + i, t, { w: 12 })).join(' '));
        const bl = 0.6 + 0.4 * Math.sin(t * 4);
        lamp.setAttribute('d', inkDot(-64, -396, 9 * bl + 4, 9 * bl + 4, sd + 50, t) + ' ' + inkDot(64, -396, 9 * bl + 4, 9 * bl + 4, sd + 51, t));
      },
    };
  }

  // ------------------------------------------------------------------ hand in close-up (local: wrist at 0,0, pointing +x)
  // back group: sleeve + palm; front group: fingers + thumb (so a gripping hand can wrap over another one)
  function hand(backP, frontP, sd, o = {}) {
    const gb = el(backP, 'g'), gf = el(frontP, 'g');
    const sleeveO = inkEl(gb), sleeve = inkEl(gb, o.sleeve || SKIN()), cuff = inkEl(gb, o.cuff || INK.ink), palm = inkEl(gb, o.skin || SKIN()), palmR = inkEl(gb), knk = inkEl(gb, mix(o.skin || SKIN(), INK.paperLight, 0.3));
    const fO = inkEl(gf), fF = inkEl(gf, o.skin || SKIN());
    const PALM = [[0, -34], [50, -44], [100, -34], [116, -6], [110, 28], [64, 40], [16, 38], [0, 30]];
    const FING = [[106, -26, 80], [114, -8, 88], [112, 10, 82], [102, 27, 66]];
    return {
      update(t, x, y, ang, s, curl = 0, op = {}) {
        const tf = `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)}) scale(${f1(s * 100) / 100} ${f1((op.flip ? -s : s) * 100) / 100})`;
        gb.setAttribute('transform', tf); gf.setAttribute('transform', tf);
        const sl = o.sleeveLen ?? 420, sw = o.sleeveW ?? 74;
        const SLV = [[-sl, 0], [-sl * 0.5, 2], [-8, 0]];
        sleeveO.setAttribute('d', inkPath(SLV, { w: sw + 12, seed: sd, t, taper: 0, amp: 0.6 }));
        sleeve.setAttribute('d', inkPath(SLV, { w: sw, seed: sd + 1, t, taper: 0, amp: 0.6 }));
        cuff.setAttribute('d', o.cuffAt ? inkPath([[-o.cuffAt, -sw * 0.52], [-o.cuffAt - 4, sw * 0.52]], { w: 22, seed: sd + 2, t, taper: 0 }) : '');
        palm.setAttribute('d', inkLoop(PALM, { seed: sd + 3, t, amp: 0.6 }));
        palmR.setAttribute('d', inkPath(PALM, { w: 6, seed: sd + 4, t, closed: true, amp: 0.6 }));
        knk.setAttribute('d', inkPath([[40, -30], [92, -24]], { w: 6, seed: sd + 5, t, amp: 0.5 }));
        const O = [], F = [];
        FING.forEach(([bx, by, L], i) => {
          const c = clamp01(curl + (i === 3 ? 0.08 : 0)), a1 = c * 1.25, a2 = c * 2.5;
          const p1 = [bx + Math.cos(a1) * L * 0.5, by + Math.sin(a1) * L * 0.5];
          const p2 = [p1[0] + Math.cos(a2) * L * 0.5, p1[1] + Math.sin(a2) * L * 0.5];
          const P3 = [[bx - 12, by], [bx, by], p1, p2];
          O.push(inkPath(P3, { w: 31, seed: sd + 10 + i, t, taper: 0.1, amp: 0.5 }));
          F.push(inkPath(P3, { w: 21, seed: sd + 20 + i, t, taper: 0.1, amp: 0.5 }));
        });
        const ct = clamp01(curl), th = [[22, -30], [62, -50 + ct * 18], [96 + ct * 6, -58 + ct * 46]];
        O.push(inkPath(th, { w: 33, seed: sd + 30, t, taper: 0.1, amp: 0.5 })); F.push(inkPath(th, { w: 23, seed: sd + 31, t, taper: 0.1, amp: 0.5 }));
        fO.setAttribute('d', O.join(' ')); fF.setAttribute('d', F.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ diver: hatless rig + drysuit, gold helmet, tank, torch beam
  function diver(parent, sd, o = {}) {
    const g = el(parent, 'g');
    const beam = inkEl(g, INK.gold, { 'fill-opacity': 0.22 }), beam2 = inkEl(g, INK.paperLight, { 'fill-opacity': 0.16 });
    const tank = inkEl(g, INK.paperDark), tankR = inkEl(g), suit = inkEl(g, SUIT()), suitR = inkEl(g);
    const rig = KASIF.create(el(g, 'g'), { scale: 1, hat: false, seed: sd });
    const helm = inkEl(g, HELM()), helmR = inkEl(g), glass = inkEl(g, mix(INK.blue, INK.paperLight, 0.55)), hose = inkEl(g, INK.inkSoft), lampD = inkEl(g, INK.paperLight);
    return {
      g,
      // op: {x, y (ground point), s, face, pose, dir, since, emotion, beam: angle (rad, world; null = none), beamLen, hoseTo: [x, y]}
      update(t, op) {
        const s = op.s ?? 1, f = op.face ?? 1;
        const r = rig.update(t, op.pose || 'idle', { x: op.x, y: op.y, scale: s, face: f, since: op.since ?? 1, dir: op.dir, emotion: op.emotion || 'neutral', mouth: 0 });
        const Wp = q => [op.x + f * s * q[0], op.y + s * q[1]];
        const hip = Wp(r.hip), hd = Wp(r.head), sh = [lerp(hip[0], hd[0], 0.66), lerp(hip[1], hd[1], 0.66)];
        const TK = [[sh[0] - f * 40 * s, sh[1] - 6 * s], [sh[0] - f * 92 * s, sh[1] + 4 * s], [hip[0] - f * 88 * s, hip[1] - 10 * s], [hip[0] - f * 40 * s, hip[1] - 14 * s]];
        tank.setAttribute('d', inkLoop(TK, { seed: sd + 1, t, amp: 0.6 }));
        tankR.setAttribute('d', inkPath(TK, { w: 4, seed: sd + 2, t, closed: true }));
        const V = [[sh[0] - 38 * s, sh[1] - 6 * s], [sh[0] + 38 * s, sh[1] - 6 * s], [hip[0] + 42 * s, hip[1] + 16 * s], [hip[0] - 42 * s, hip[1] + 16 * s]];
        suit.setAttribute('d', inkLoop(V, { seed: sd + 3, t, amp: 0.7 }));
        suitR.setAttribute('d', inkPath(V, { w: 4, seed: sd + 4, t, closed: true }) + ' ' + inkPath([[hip[0] - 40 * s, hip[1] - 4 * s], [hip[0] + 40 * s, hip[1] - 4 * s]], { w: 6, seed: sd + 5, t }));
        const HP = inkEllipsePts(hd[0], hd[1] - 4 * s, 92 * s, 96 * s, sd + 6, 14, 0, 0.03);
        helm.setAttribute('d', inkLoop(HP, { seed: sd + 6, t, amp: 0.6 }));
        const gc = [hd[0] + f * 30 * s, hd[1] + 2 * s];
        glass.setAttribute('d', inkLoop(inkEllipsePts(gc[0], gc[1], 50 * s, 44 * s, sd + 7, 12, 0, 0.02), { seed: sd + 7, t, amp: 0.4 }));
        const lp = [hd[0] + f * 20 * s, hd[1] - 92 * s];
        helmR.setAttribute('d', inkPath(HP, { w: 6, seed: sd + 8, t, closed: true }) + ' ' + inkCircle(gc[0], gc[1], 50 * s, sd + 9, t, { w: 5, ry: 44 * s }) + ' ' +
          inkLoop(rectP(lp[0] - 22 * s, lp[1] - 16 * s, lp[0] + 22 * s, lp[1] + 14 * s), { seed: sd + 10, t, amp: 0.4, smooth: false }));
        lampD.setAttribute('d', inkDot(lp[0] + f * 22 * s, lp[1], 9 * s, 9 * s, sd + 11, t));
        if (op.beam != null) {
          const a = op.beam, L = (op.beamLen ?? 700) * s, sp = 0.24, fl = 1 + 0.03 * Math.sin(t * 6), b0 = [lp[0] + f * 22 * s, lp[1]];
          beam.setAttribute('d', inkLoop([b0, [b0[0] + Math.cos(a - sp) * L * fl, b0[1] + Math.sin(a - sp) * L * fl], [b0[0] + Math.cos(a + sp) * L * fl, b0[1] + Math.sin(a + sp) * L * fl]], { seed: sd + 12, t, amp: 0.6 }));
          beam2.setAttribute('d', inkLoop([b0, [b0[0] + Math.cos(a - sp * 0.45) * L * 0.8, b0[1] + Math.sin(a - sp * 0.45) * L * 0.8], [b0[0] + Math.cos(a + sp * 0.45) * L * 0.8, b0[1] + Math.sin(a + sp * 0.45) * L * 0.8]], { seed: sd + 13, t, amp: 0.6 }));
        } else blank(beam, beam2);
        if (op.hoseTo) { const h0 = [lp[0] - f * 30 * s, lp[1] + 10 * s], h1 = op.hoseTo, P = [];
          for (let i = 0; i <= 12; i++) { const q = i / 12; P.push([lerp(h0[0], h1[0], q) + Math.sin(q * Math.PI) * 60 * Math.sin(t * 0.8 + sd), lerp(h0[1], h1[1], q)]); }
          hose.setAttribute('d', inkPath(P, { w: 4, seed: sd + 14, t })); } else hose.setAttribute('d', '');
        return { head: hd, helmetTop: lp, hip, hands: r.hands.map(Wp) };
      },
    };
  }

  // ------------------------------------------------------------------ rising bubbles (deterministic)
  function bubbles(parent, sd, col) {
    const p = inkEl(parent, 'none'), r = inkEl(parent, col || INK.paperLight, { 'fill-opacity': 0.75 });
    return {
      update(t, src, n, rise, spread, size, life = 2.2) {
        const R = [];
        for (let i = 0; i < n; i++) {
          const q = ((t / life) + hn(sd, i)) % 1, [sx, sy] = src(i);
          const x = sx + Math.sin(q * 9 + i) * spread + (hn(sd + 1, i) - 0.5) * spread, y = sy - q * rise, rr = size * (0.5 + hn(sd + 2, i)) * (0.6 + q * 0.6);
          R.push(inkCircle(x, y, rr, sd + 10 + i, t, { w: 3 }));
        }
        r.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ the cook (hatless rig) with a dark T-shirt
  function cook(parent, sd, o = {}) {
    const g = el(parent, 'g');
    const shirt = inkEl(g, o.col || mix(INK.blue, INK.paperDark, 0.35)), shirtR = inkEl(g);
    const rig = KASIF.create(el(g, 'g'), { scale: 1, hat: false, seed: sd });
    return {
      g,
      update(t, op) {
        const s = op.s ?? 1, f = op.face ?? 1;
        const r = rig.update(t, op.pose || 'idle', { x: op.x, y: op.y, scale: s, face: f, since: op.since ?? 1, dir: op.dir, emotion: op.emotion || 'worried', mouth: 0 });
        const Wp = q => [op.x + f * s * q[0], op.y + s * q[1]];
        const hip = Wp(r.hip), hd = Wp(r.head), sh = [lerp(hip[0], hd[0], 0.66), lerp(hip[1], hd[1], 0.66)];
        const V = [[sh[0] - 36 * s, sh[1] - 4 * s], [sh[0] + 36 * s, sh[1] - 4 * s], [hip[0] + 38 * s, hip[1] + 6 * s], [hip[0] - 38 * s, hip[1] + 6 * s]];
        shirt.setAttribute('d', inkLoop(V, { seed: sd + 1, t, amp: 0.7 }));
        shirtR.setAttribute('d', inkPath(V, { w: 4, seed: sd + 2, t, closed: true }));
        return { head: hd, hip, hands: r.hands.map(Wp) };
      },
    };
  }

  // =================================================================== SHOTS.ho_hand
  SH.ho_hand = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 71, u = W / 1080, mode = P.mode || 'hook';
      const root = el(svg, 'g');
      const bg = inkEl(root, W_DARK()), ribs = inkEl(root, mix(W_DARK(), INK.ink, 0.45)), ribsL = inkEl(root, mix(W_DARK(), INK.paperDark, 0.18));
      const door = inkEl(root, ROOM_L()), doorO = inkEl(root, mix(INK.ink, INK.blue, 0.12)), doorR = inkEl(root);
      const airBg = inkEl(root, mix(ROOM_L(), INK.gold, 0.22)), airGlow = inkEl(root, AIR(), { 'fill-opacity': 0.5 }), plates = inkEl(root, ROOM_L());
      const beamA = inkEl(root, INK.gold, { 'fill-opacity': 0.16 }), beamB = inkEl(root, INK.paperLight, { 'fill-opacity': 0.12 });
      const specks = inkEl(root, INK.paperLight, { 'fill-opacity': 0.7 }), specksD = inkEl(root, INK.paperLight, { 'fill-opacity': 0.22 });
      const hk = mode === 'hook' || mode === 'face', fm = mode === 'face';
      const fGlow = fm ? inkEl(root, INK.gold, { 'fill-opacity': 0.28 }) : null, fShirt = fm ? inkEl(root, mix(INK.blue, INK.paperDark, 0.35)) : null, fShirtR = fm ? inkEl(root) : null;
      const fHead = fm ? inkEl(root, SKIN()) : null, fHeadR = fm ? inkEl(root) : null, fEye = fm ? inkEl(root, INK.paperLight) : null, fFace = fm ? inkEl(root) : null;
      const back = el(root, 'g'), front = el(root, 'g');
      const bare = hk ? hand(back, front, sd + 100, { skin: SKIN(), sleeve: SKIN(), sleeveLen: 520, sleeveW: 70 }) : null;
      const glove = hk ? hand(el(root, 'g'), el(root, 'g'), sd + 200, { skin: GLOVE(), sleeve: SUIT(), sleeveLen: 560, sleeveW: 96, cuffAt: 40, cuff: INK.ink }) : null;
      const bareF = hk ? el(root, 'g') : null;
      if (bareF) bareF.appendChild(front);
      const ck = mode === 'reveal' ? cook(el(root, 'g'), sd + 300, {}) : null;
      const dv = mode === 'reveal' ? diver(el(root, 'g'), sd + 400) : null;
      const water = inkEl(root, W_DARK()), waterL = inkEl(root, mix(W_DARK(), INK.paperLight, 0.3)), clasp = inkEl(root, SKIN()), claspR = inkEl(root);
      const bub = bubbles(root, sd + 500);
      const shock = inkEl(root, INK.paperLight);
      const front2 = inkEl(root, mix(INK.ink, W_DARK(), 0.4)), front2R = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          bg.setAttribute('d', inkLoop(rectP(-60, -60, W + 60, H + 60), { seed: sd, t, amp: 0, smooth: false }));
          if (hk) {
            const grab = fm ? -1 : atOr(cues, 'grab', dur * 0.35), hit = atOr(cues, 'hit', fm ? 0.3 : dur * 0.7), pk = punch(lt, hit, 0.8);
            // hull ribs (diagonal beams) + doorway
            const RB = [], RL = [];
            for (let i = 0; i < 5; i++) { const x0 = (-0.2 + i * 0.34) * W; RB.push(inkPath([[x0, -60], [x0 + 0.5 * W, H + 60]], { w: 70 * u, seed: sd + 10 + i, t, taper: 0, amp: 1 }));
              RL.push(inkPath([[x0 - 30 * u, -60], [x0 + 0.5 * W - 30 * u, H + 60]], { w: 8 * u, seed: sd + 20 + i, t, taper: 0, amp: 1 })); }
            ribs.setAttribute('d', RB.join(' ')); ribsL.setAttribute('d', RL.join(' '));
            const D = rectP(0.02 * W, 0.24 * H, 0.33 * W, 0.66 * H), DI = rectP(0.06 * W, 0.27 * H, 0.29 * W, 0.64 * H);
            door.setAttribute('d', inkLoop(D, { seed: sd + 30, t, amp: 0.6, smooth: false }));
            doorO.setAttribute('d', inkLoop(DI, { seed: sd + 31, t, amp: 0.6, smooth: false }));
            doorR.setAttribute('d', inkPath(D, { w: 7, seed: sd + 32, t, closed: true, smooth: false }) + ' ' + inkPath(DI, { w: 5, seed: sd + 33, t, closed: true, smooth: false }) +
              ' ' + inkCircle(0.31 * W, 0.3 * H, 12 * u, sd + 34, t, { w: 5 }));
            blank(airBg, airGlow, plates, water, waterL, clasp, claspR);
            // torch beam from the top right (the diver is just off-frame)
            const b0 = [1.06 * W, 0.16 * H], tgt = fm ? [0.3 * W, 0.42 * H] : [0.42 * W, 0.47 * H], a = Math.atan2(tgt[1] - b0[1], tgt[0] - b0[0]), L = 1.25 * W, fl = 1 + 0.025 * Math.sin(t * 5.3);
            const cone = sp => [b0, [b0[0] + Math.cos(a - sp) * L * fl, b0[1] + Math.sin(a - sp) * L * fl], [b0[0] + Math.cos(a + sp) * L * fl, b0[1] + Math.sin(a + sp) * L * fl]];
            beamA.setAttribute('d', inkLoop(cone(0.25), { seed: sd + 40, t, amp: 0.8 }));
            beamB.setAttribute('d', inkLoop(cone(0.1), { seed: sd + 41, t, amp: 0.8 }));
            const SA = [], SD = [];
            for (let i = 0; i < 46; i++) { const x = ((hn(sd + 1, i) * W + t * (8 + 14 * hn(sd + 2, i)) * u) % W), y = ((hn(sd + 3, i) * H - t * (6 + 10 * hn(sd + 4, i)) * u) % H + H) % H;
              const ang = Math.atan2(y - b0[1], x - b0[0]), inC = Math.abs(ang - a) < 0.25;
              (inC ? SA : SD).push(inkDot(x, y, (2 + 3 * hn(sd + 5, i)) * u, (2 + 3 * hn(sd + 5, i)) * u, sd + 50 + i, t, 0.3)); }
            specks.setAttribute('d', SA.join(' ')); specksD.setAttribute('d', SD.join(' '));
            // the two hands
            const s = 1.6 * u * (1 + 0.05 * pk), jerk = lt >= hit ? Math.sin((lt - hit) * 30) * 10 * u * Math.exp(-(lt - hit) * 4) : 0;
            const sway = Math.sin(t * 1.3) * 6 * u;
            const bx = 0.36 * W - (lt >= hit ? 18 * u * ease((lt - hit) / 0.3) : 0) + jerk, by = 0.47 * H + sway;
            const bc = fm ? 0.95 : lt >= hit ? lerp(0.22, 0.95, ease((lt - hit) / 0.22)) : 0.22;
            if (fm) {   // his face in the torch light behind the clasp: stunned, scared
              const hx = 0.19 * W + Math.sin(t * 0.9) * 4 * u, hy = 0.33 * H + Math.sin(t * 1.2) * 4 * u, hr = 118 * u * (1 + 0.04 * pk);
              fGlow.setAttribute('d', inkCircle(hx, hy, hr * 1.9 * (1 + 0.03 * Math.sin(t * 3)), sd + 600, t, { fill: true }));
              const SHp = [[0.0 * W, 0.6 * H], [0.03 * W, 0.43 * H], [0.19 * W, 0.4 * H], [0.36 * W, 0.44 * H], [0.38 * W, 0.6 * H]];
              fShirt.setAttribute('d', inkLoop(SHp, { seed: sd + 601, t, amp: 0.6 })); fShirtR.setAttribute('d', inkPath(SHp, { w: 5, seed: sd + 602, t, closed: true }));
              fHead.setAttribute('d', inkCircle(hx, hy, hr, sd + 603, t, { fill: true }));
              const blink = (t % 3.7) < 0.12 ? 0.2 : 1;
              fEye.setAttribute('d', inkDot(hx + 6 * u, hy - 18 * u, 28 * u, 24 * u * blink, sd + 604, t) + ' ' + inkDot(hx + 78 * u, hy - 18 * u, 26 * u, 23 * u * blink, sd + 605, t));
              fHeadR.setAttribute('d', inkCircle(hx, hy, hr, sd + 606, t, { w: 7 }));
              fFace.setAttribute('d', inkDot(hx + 12 * u, hy - 16 * u, 10 * u, 11 * u * blink, sd + 607, t) + ' ' + inkDot(hx + 82 * u, hy - 16 * u, 10 * u, 11 * u * blink, sd + 608, t) +
                ' ' + inkPath([[hx - 22 * u, hy - 58 * u], [hx + 22 * u, hy - 76 * u]], { w: 7, seed: sd + 609, t }) + ' ' + inkPath([[hx + 62 * u, hy - 78 * u], [hx + 104 * u, hy - 62 * u]], { w: 7, seed: sd + 610, t }) +
                ' ' + inkLoop(inkEllipsePts(hx + 48 * u, hy + 48 * u, 16 * u, 22 * u, sd + 611, 10, 0, 0.08), { seed: sd + 611, t, amp: 0.4 }));
            }
            bare.update(t, bx, by, 6, s, bc);
            const gp = fm ? 1 : ease((lt - 0.05) / Math.max(0.4, grab - 0.05)), gx = lerp(1.32 * W, 0.78 * W, gp) + jerk, gyy = lerp(0.36 * H, 0.465 * H, gp) + sway * 0.6;
            const gc = fm ? 0.75 : lt >= grab ? lerp(0.1, 0.75, ease((lt - grab) / 0.25)) : 0.1;
            glove.update(t, gx, gyy, 186, s, gc, { flip: true });
            // shock strokes around the clasp at "hit"
            if (!fm && lt >= hit && lt < hit + 0.9) { const q = (lt - hit) / 0.9, cx = 0.58 * W, cy = 0.47 * H, S = [];
              for (let i = 0; i < 9; i++) { const an = i / 9 * Math.PI * 2 + 0.3, r0 = (150 + 120 * q) * u, r1 = r0 + 70 * u * (1 - q);
                S.push(inkPath([[cx + Math.cos(an) * r0, cy + Math.sin(an) * r0], [cx + Math.cos(an) * r1, cy + Math.sin(an) * r1]], { w: 9 * u * (1 - q) + 2, seed: sd + 80 + i, t })); }
              shock.setAttribute('d', S.join(' ')); } else shock.setAttribute('d', '');
            bub.update(t, i => [0.82 * W + 40 * u * (i % 3), 0.5 * H], 7, 0.5 * H, 30 * u, 9 * u, 2.6);
            // foreground: wreck debris down to the bottom
            const FR = [[-60, H + 60], [-60, 0.8 * H], [0.18 * W, 0.76 * H], [0.36 * W, 0.83 * H], [0.6 * W, 0.79 * H], [0.86 * W, 0.84 * H], [W + 60, 0.78 * H], [W + 60, H + 60]];
            front2.setAttribute('d', inkLoop(FR, { seed: sd + 90, t, amp: 0.8 }));
            front2R.setAttribute('d', inkPath(FR.slice(1, 7), { w: 6, seed: sd + 91, t }) + ' ' + [0.1, 0.32, 0.55, 0.78].map((q, i) => inkPath([[q * W, 0.86 * H], [q * W + 120 * u, 0.98 * H]], { w: 18 * u, seed: sd + 92 + i, t })).join(' '));
          } else {
            // reveal: inside the air pocket
            const hit = atOr(cues, 'hit', dur * 0.4), pk = punch(lt, hit, 0.8), wy = 0.53 * H;
            blank(ribs, ribsL, door, doorO, doorR, specks, specksD, shock);
            airBg.setAttribute('d', inkLoop(rectP(-60, -60, W + 60, wy + 20), { seed: sd + 1, t, amp: 0, smooth: false }));
            const gl = 0.85 + 0.15 * Math.sin(t * 2.1);
            airGlow.setAttribute('d', inkLoop(inkEllipsePts(0.42 * W, 0.4 * H, 0.2 * W * gl, 0.07 * H * gl, sd + 2, 16, 0, 0.04), { seed: sd + 2, t, amp: 0.6 }));
            airGlow.setAttribute('fill-opacity', '0.35');
            const PL = []; for (let i = 0; i < 6; i++) { const y = (0.06 + i * 0.055) * H; PL.push(inkPath([[-40, y], [W + 40, y + 8 * u]], { w: 5, seed: sd + 3 + i, t }));
              for (let j = 0; j < 7; j++) PL.push(inkDot((0.07 + j * 0.15) * W, y + 22 * u, 5 * u, 5 * u, sd + 20 + i * 7 + j, t)); }
            plates.setAttribute('d', PL.join(' '));
            const b0 = [0.74 * W, 0.37 * H], a = Math.PI + 0.12, L = 0.8 * W;
            const cone = sp => [b0, [b0[0] + Math.cos(a - sp) * L, b0[1] + Math.sin(a - sp) * L], [b0[0] + Math.cos(a + sp) * L, b0[1] + Math.sin(a + sp) * L]];
            blank(beamA, beamB);
            const s = 1.15 * u, gyy = wy + 190 * u;
            const rc = ck.update(t, { x: 0.33 * W, y: gyy, s, face: 1, pose: 'point', dir: 4, since: 2, emotion: lt < hit ? 'surprised' : 'happy' });
            const rd = dv.update(t, { x: 0.69 * W, y: gyy + 10 * u, s, face: -1, pose: 'point', dir: 2, since: 2, emotion: 'happy', beam: Math.PI + 0.32, beamLen: 620 });
            const cx = lerp(rc.hands[1][0], rd.hands[1][0], 0.5), cy = lerp(rc.hands[1][1], rd.hands[1][1], 0.5), k = 1 + 0.3 * pk;
            clasp.setAttribute('d', inkDot(cx, cy, 30 * u * k, 24 * u * k, sd + 60, t));
            claspR.setAttribute('d', inkCircle(cx, cy, 30 * u * k, sd + 61, t, { w: 5, ry: 24 * u * k }));
            const WP = [[-60, wy]]; for (let i = 0; i <= 12; i++) WP.push([i / 12 * W, wy + Math.sin(i * 1.1 + t * 1.8) * 10 * u]);
            WP.push([W + 60, wy], [W + 60, H + 60], [-60, H + 60]);
            water.setAttribute('d', inkLoop(WP, { seed: sd + 70, t, amp: 0.6 }));
            const WL = [inkPath(WP.slice(0, 14), { w: 6, seed: sd + 71, t })];
            for (let i = 0; i < 6; i++) { const y = wy + (70 + i * 120) * u; WL.push(inkPath([[(0.05 + 0.1 * (i % 3)) * W, y], [(0.4 + 0.1 * (i % 2)) * W, y + 6 * u]], { w: 4, seed: sd + 72 + i, t }), inkPath([[(0.58 + 0.05 * (i % 2)) * W, y + 30 * u], [0.95 * W, y + 24 * u]], { w: 4, seed: sd + 80 + i, t })); }
            for (const hx of [rc.head[0], rd.head[0]]) { const q = (t * 0.7) % 1; WL.push(inkCircle(hx, wy + 6 * u, (60 + 90 * q) * u, sd + 90, t, { w: 4 * (1 - q) + 1, ry: (12 + 14 * q) * u })); }
            waterL.setAttribute('d', WL.join(' '));
            bub.update(t, i => [rd.helmetTop[0] - 20 * u, rd.helmetTop[1]], 5, 0.28 * H, 20 * u, 9 * u, 2.0);
            blank(front2, front2R);
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ swell band (opaque water from y to the frame bottom)
  function swell(parent, sd, col, foam) {
    const w = inkEl(parent, col), f = inkEl(parent, foam || INK.paperLight), r = inkEl(parent);
    return {
      update(t, W, H, y, amp, speed = 1.6, u = 1) {
        const P = [[-80, H + 80]];
        for (let x = -80; x <= W + 80; x += 40) P.push([x, y + amp * Math.sin(x * 0.0075 + t * speed + sd) + amp * 0.45 * Math.sin(x * 0.019 - t * speed * 1.4)]);
        P.push([W + 80, H + 80]);
        w.setAttribute('d', inkLoop(P, { seed: sd, t, amp: 0.8, smooth: false }));
        const top = P.slice(1, -1), F = [], R = [inkPath(top, { w: 6, seed: sd + 1, t })];
        for (let i = 0; i < 8; i++) { const j = 2 + i * 4; if (!top[j + 2]) continue; F.push(inkPath([top[j], top[j + 1], top[j + 2]].map(([a, b]) => [a, b + 14 * u]), { w: 10 * u, seed: sd + 2 + i, t })); }
        for (let i = 0; i < 5; i++) { const yy = y + (90 + i * 110) * u; if (yy > H) break; R.push(inkPath([[(0.05 + 0.18 * (i % 3)) * W, yy], [(0.35 + 0.18 * (i % 3)) * W, yy + 10 * u]], { w: 4, seed: sd + 20 + i, t })); }
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }

  // =================================================================== SHOTS.ho_tug
  SH.ho_tug = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 271, u = W / 1080, mode = P.mode || 'capsize';
      const root = el(svg, 'g');
      const far = swell(el(root, 'g'), sd + 10, mode === 'end' ? W_SH() : W_MID());
      const tug = mode === 'capsize' ? tugEnd(el(root, 'g'), sd + 100) : tugSide(el(root, 'g'), sd + 100);
      const kas = mode === 'end' && P.kasif ? window.LH.kasif(el(root, 'g'), Object.assign({ x: 0.4, y: 0.5, scale: 0.85, pose: 'wave', face: 'right', emotion: 'happy' }, P.kasif), W, H, seed) : null;
      const spray = inkEl(root, INK.paperLight);
      const mid = swell(el(root, 'g'), sd + 30, mode === 'end' ? W_MID() : W_DEEP());
      const near = swell(el(root, 'g'), sd + 50, mode === 'end' ? W_DEEP() : W_DARK());
      const bub = bubbles(root, sd + 60, INK.gold);
      const glint = inkEl(root, INK.gold, { 'fill-opacity': 0.5 });
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          if (mode === 'capsize') {
            const flip = atOr(cues, 'flip', dur * 0.45), q = ease((lt - flip) / 1.3), pk = punch(lt, flip + 1.0, 0.8);
            const wl = 0.55 * H, amp = lerp(34, 60, q) * u;
            far.update(t, W, H, 0.47 * H, 22 * u, 1.1, u);
            const roll = lt < flip ? 9 * Math.sin(t * 2.1) + 6 * Math.sin(t * 3.3) : lerp(9 * Math.sin(flip * 2.1), 180, q) + 4 * Math.sin(t * 1.7) * q;
            const yy = wl + 30 * u * Math.sin(t * 2.1 + 0.6) + q * 70 * u;
            tug.update(t, 0.5 * W, yy, 1.2 * u * (1 + 0.04 * pk), roll);
            if (lt >= flip && lt < flip + 1.6) { const p = (lt - flip) / 1.6, S = [];
              for (let i = 0; i < 18; i++) { const an = -Math.PI * (0.1 + 0.8 * hn(sd + 3, i)), v = (300 + 400 * hn(sd + 4, i)) * u;
                const x = 0.5 * W + Math.cos(an) * v * p, y = wl - 40 * u + Math.sin(an) * v * p + 700 * u * p * p, r = (8 + 10 * hn(sd + 5, i)) * u * (1 - p * 0.6);
                S.push(inkDot(x, y, r, r, sd + 70 + i, t)); }
              spray.setAttribute('d', S.join(' ')); } else spray.setAttribute('d', '');
            mid.update(t, W, H, wl + 60 * u, amp, 1.8, u);
            near.update(t, W, H, 0.74 * H, amp * 1.3, 1.5, u);
            bub.update(t, i => [0.5 * W + (i - 3) * 50 * u, wl + 120 * u], lt > flip + 0.6 ? 7 : 0, 140 * u, 20 * u, 8 * u, 1.4);
            glint.setAttribute('d', '');
          } else {
            const wl = 0.56 * H;
            far.update(t, W, H, 0.5 * H, 8 * u, 0.6, u);
            const bob = Math.sin(t * 1.2) * 5 * u, rk = Math.sin(t * 0.9) * 1.2;
            tug.update(t, 0.56 * W, wl + bob, 1.25 * u, rk, {});
            if (kas) kas.update(lt, t, cues);
            spray.setAttribute('d', '');
            mid.update(t, W, H, wl + 30 * u, 10 * u, 0.8, u);
            near.update(t, W, H, 0.78 * H, 14 * u, 0.7, u);
            bub.update(t, i => [0.88 * W + (i % 2) * 14 * u, 0.98 * H], 8, 0.4 * H, 16 * u, 9 * u, 3.2);
            const G = []; for (let i = 0; i < 6; i++) { const q = (t * 0.4 + hn(sd + 7, i)) % 1, x = (0.6 + 0.3 * hn(sd + 8, i)) * W, y = (0.6 + 0.12 * hn(sd + 9, i)) * H, s = Math.sin(q * Math.PI) * 40 * u;
              G.push(inkPath([[x - s, y], [x + s, y + 2 * u]], { w: 6 * u, seed: sd + 90 + i, t })); }
            glint.setAttribute('d', G.join(' '));
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // =================================================================== SHOTS.ho_section
  SH.ho_section = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 471, u = W / 1080, mode = P.mode || 'sink';
      const S = (P.surface ?? 0.2) * H, B = (P.bed ?? 0.56) * H;
      const root = el(svg, 'g');
      const NB = 5, bands = []; for (let i = 0; i < NB; i++) bands.push(inkEl(root, mix(W_SH(), W_DEEP(), i / (NB - 1))));
      const rays = inkEl(root, INK.paperLight, { 'fill-opacity': 0.1 }), surf = inkEl(root);
      const fish = inkEl(root, INK.inkSoft), fishR = inkEl(root);
      const ship = mode === 'divers' ? tugSide(el(root, 'g'), sd + 600) : null;
      const shipW = mode === 'divers' ? inkEl(root, W_SH()) : null;
      const divers = mode === 'divers' ? [diver(el(root, 'g'), sd + 700), diver(el(root, 'g'), sd + 800)] : mode === 'alive' ? [diver(el(root, 'g'), sd + 700)] : [];
      const tug = tugSide(el(root, 'g'), sd + 100);
      const cut = inkEl(root, ROOM_D()), cutW = inkEl(root, W_DARK()), cutA = inkEl(root, AIR()), cutR = inkEl(root), head = inkEl(root, INK.paperLight), headR = inkEl(root);
      const rings = inkEl(root, INK.gold);
      const bub = bubbles(root, sd + 300);
      const bed = inkEl(root, SAND()), bedD = inkEl(root, SAND_D()), bedDD = inkEl(root, SAND_DD()), bedR = inkEl(root), rocks = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.3)), rocksR = inkEl(root);
      const grass = inkEl(root, mix(INK.green, INK.ink, 0.15)), silt = inkEl(root, SAND(), { 'fill-opacity': 0.7 });
      const arrow = inkEl(root, INK.red);
      const airL = inkEl(root, INK.gold);
      const LB = labels(root, P.labels, W, H);
      const ts = 1.6 * u, restY = B + 30 * u - 50 * ts;   // hull centre when the inverted deck sits just in the bed
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5), pk = punch(lt, hit, 0.8);
          // water bands
          for (let i = 0; i < NB; i++) { const y0 = lerp(S, B + 80 * u, i / NB), Pp = [[-60, H + 60], [-60, y0]];
            for (let x = 0; x <= W; x += W / 8) Pp.push([x, y0 + (i ? Math.sin(x * 0.006 + i * 2 + t * 0.4) * 14 * u : Math.sin(x * 0.01 + t * 1.6) * 10 * u)]);
            Pp.push([W + 60, y0], [W + 60, H + 60]); bands[i].setAttribute('d', inkLoop(Pp, { seed: sd + i, t, amp: 0.5, smooth: false })); }
          const SP = []; for (let x = -40; x <= W + 40; x += 30) SP.push([x, S + Math.sin(x * 0.01 + t * 1.6) * 10 * u]);
          surf.setAttribute('d', inkPath(SP, { w: 7, seed: sd + 10, t }));
          const RY = []; for (let i = 0; i < 4; i++) { const x = (0.12 + 0.24 * i) * W + Math.sin(t * 0.5 + i) * 20 * u;
            RY.push(inkLoop([[x, S], [x + 70 * u, S], [x + 230 * u, B - 60 * u], [x + 110 * u, B - 60 * u]], { seed: sd + 20 + i, t, amp: 0.6 })); }
          rays.setAttribute('d', RY.join(' '));
          // fish
          const FI = [], FR = [];
          for (let i = 0; i < 3; i++) { const dirn = i % 2 ? -1 : 1, sp = (30 + 20 * i) * u, x = dirn > 0 ? ((t * sp + hn(sd, i) * W) % (W + 200)) - 100 : W + 100 - ((t * sp + hn(sd, i) * W) % (W + 200)), y = (0.3 + 0.08 * i) * H + Math.sin(t * 1.5 + i) * 10 * u, s = (0.7 + 0.2 * i) * u;
            const body = inkEllipsePts(x, y, 46 * s, 18 * s, sd + 30 + i, 10, 0, 0.03), tail = [[x - dirn * 40 * s, y], [x - dirn * 74 * s, y - 20 * s], [x - dirn * 74 * s, y + 20 * s]];
            FI.push(inkLoop(body, { seed: sd + 30 + i, t, amp: 0.4 }), inkLoop(tail, { seed: sd + 40 + i, t, amp: 0.4 }));
            FR.push(inkPath(body, { w: 3, seed: sd + 50 + i, t, closed: true }), inkDot(x + dirn * 26 * s, y - 4 * s, 4 * s, 4 * s, sd + 60 + i, t)); }
          fish.setAttribute('d', FI.join(' ')); fishR.setAttribute('d', FR.join(' '));
          // the tug
          let hx = 0.5 * W, hy = restY, ang = 180, land = 1;
          if (mode === 'sink') {
            const t0 = 0.15, t1 = Math.max(t0 + 1, dur * 0.85); land = clamp01((lt - t0) / (t1 - t0));
            const e = land * land * (3 - 2 * land);
            hy = lerp(S + 70 * u, restY, e); ang = 180 + (1 - e) * 10 * Math.sin(t * 1.4); hx = 0.5 * W + (1 - e) * 30 * u * Math.sin(t * 0.9);
          } else ang = 180 + 0.6 * Math.sin(t * 0.7);
          tug.update(t, hx, hy, ts, ang, { lights: false });
          const L2W = p => tugW(hx, hy, ts, ang, p);
          // cut-away compartment with the pocket of air
          if (mode === 'bubble' || mode === 'alive') {
            const C = [[-210, 6], [-20, 6], [-20, 86], [-210, 86]].map(L2W);
            const top = Math.min(...C.map(p => p[1])), bot = Math.max(...C.map(p => p[1])), x0 = Math.min(...C.map(p => p[0])), x1 = Math.max(...C.map(p => p[0]));
            const glow = 1 + 0.06 * Math.sin(t * 3) + 0.12 * pk, wl = top + (bot - top) * 0.55 + Math.sin(t * 1.6) * 3 * u;
            cut.setAttribute('d', inkLoop(C, { seed: sd + 70, t, amp: 0.4, smooth: false }));
            cutA.setAttribute('d', inkLoop(rectP(x0 + 8 * u, top + 8 * u, x1 - 8 * u, wl), { seed: sd + 71, t, amp: 0.5, smooth: false }));
            cutA.setAttribute('fill-opacity', f1(Math.min(1, 0.8 * glow) * 100) / 100);
            const WW = [[x0 + 8 * u, wl]]; for (let i = 0; i <= 8; i++) WW.push([lerp(x0 + 8 * u, x1 - 8 * u, i / 8), wl + Math.sin(i * 1.4 + t * 2) * 3 * u]);
            WW.push([x1 - 8 * u, bot - 8 * u], [x0 + 8 * u, bot - 8 * u]);
            cutW.setAttribute('d', inkLoop(WW, { seed: sd + 72, t, amp: 0.4, smooth: false }));
            cutR.setAttribute('d', inkPath(C, { w: 6, seed: sd + 73, t, closed: true, smooth: false }) + ' ' + inkPath(WW.slice(0, 10), { w: 3, seed: sd + 74, t }));
            const hc = [lerp(x0, x1, 0.42), wl - 20 * u + Math.sin(t * 1.6) * 3 * u], hr = 20 * u;
            head.setAttribute('d', inkCircle(hc[0], hc[1], hr, sd + 75, t, { fill: true }));
            headR.setAttribute('d', inkCircle(hc[0], hc[1], hr, sd + 76, t, { w: 4 }) + ' ' + inkDot(hc[0] + 6 * u, hc[1] - 3 * u, 2.6 * u, 2.6 * u, sd + 77, t) + ' ' + inkDot(hc[0] + 14 * u, hc[1] - 3 * u, 2.6 * u, 2.6 * u, sd + 78, t) +
              ' ' + inkPath([[hc[0] - 30 * u, wl + 4 * u], [hc[0], wl - 2 * u], [hc[0] + 30 * u, wl + 4 * u]], { w: 5, seed: sd + 79, t }));
            if (mode === 'alive') {
              const RG = []; for (let i = 0; i < 3; i++) { const q = ((lt - hit) * 0.6 + i / 3) % 1; if (lt < hit) break;
                RG.push(inkCircle(hc[0], hc[1], (60 + q * 420) * u, sd + 80 + i, t, { w: 8 * (1 - q) + 1 })); }
              rings.setAttribute('d', RG.join(' '));
              const dvP = [x1 - 10 * u, top - 70 * u];
              divers[0].update(t, { x: dvP[0] + Math.sin(t * 0.8) * 6 * u, y: dvP[1] + Math.sin(t * 1.1) * 6 * u, s: 0.48 * u, face: -1, pose: 'point', dir: -30, since: 2, beam: Math.PI * 0.68, beamLen: 520, hoseTo: [dvP[0] + 60 * u, S] });
              bub.update(t, i => [dvP[0] + 10 * u, dvP[1] - 290 * u], 6, 0.4 * H, 22 * u, 8 * u, 2.4);
              airL.setAttribute('d', '');
            } else {
              rings.setAttribute('d', '');
              const k = spring(lt, hit, 0.5);
              const af = P.arrowFrom || [0.78, 0.395]; airL.setAttribute('d', lt >= hit ? inkPath([[af[0] * W, af[1] * H], [lerp(af[0] * W, x1 - 20 * u, k), lerp(af[1] * H, top + 30 * u, k)]], { w: 7, seed: sd + 90, t }) +
                (k > 0.9 ? ' ' + inkLoop([[x1 - 20 * u, top + 30 * u], [x1 + 14 * u, top - 12 * u], [x1 + 24 * u, top + 26 * u]], { seed: sd + 91, t, amp: 0.4 }) : '') : '');
              bub.update(t, i => [lerp(x0, x1, 0.2 + 0.15 * i), top - 4 * u], 4, 0.18 * H, 14 * u, 7 * u, 3.0);
            }
          } else {
            blank(cut, cutW, cutA, cutR, head, headR, rings, airL);
            if (mode === 'sink') bub.update(t, i => L2W([-200 + i * 70, -40]), land < 1 ? 7 : 3, 0.3 * H, 24 * u, 10 * u, 1.6);
            else bub.update(t, i => [0.3 * W + i * 120 * u, B - 40 * u], 3, 0.25 * H, 16 * u, 7 * u, 3.0);
          }
          // divers coming down on their hoses
          if (mode === 'divers') {
            const sx = 0.76 * W; ship.update(t, sx, S + Math.sin(t * 1.2) * 4 * u, 0.62 * u, Math.sin(t * 0.9) * 1.5, {});
            const SWp = [[-60, S + 4 * u]]; for (let x = 0; x <= W; x += W / 10) SWp.push([x, S + 14 * u + Math.sin(x * 0.01 + t * 1.6) * 10 * u]); SWp.push([W + 60, S + 4 * u], [W + 60, S + 60 * u], [-60, S + 60 * u]);
            shipW.setAttribute('d', inkLoop(SWp, { seed: sd + 610, t, amp: 0.5, smooth: false }));
            const desc = ease(lt / Math.max(1, dur * 0.9));
            const D = [[0.62 * W, lerp(S + 260 * u, restY - 200 * u, desc), 0.34], [0.86 * W, lerp(S + 160 * u, restY - 140 * u, desc * 0.95), 0.6]];
            D.forEach(([x, y, a], i) => divers[i].update(t, { x: x + Math.sin(t * 0.9 + i) * 10 * u, y, s: 0.5 * u, face: -1, pose: 'idle', since: 2, beam: Math.PI / 2 + a, beamLen: 620, hoseTo: [sx - (60 - i * 50) * u, S + 20 * u] }));
          }
          // seabed down to the frame bottom
          const BP = [[-60, H + 60], [-60, B]]; for (let x = 0; x <= W; x += W / 12) BP.push([x, B + Math.sin(x * 0.012 + 1.3) * 16 * u]); BP.push([W + 60, B], [W + 60, H + 60]);
          bed.setAttribute('d', inkLoop(BP, { seed: sd + 200, t, amp: 0.5, smooth: false }));
          const lay = (y, k) => { const Q = [[-60, H + 60], [-60, y]]; for (let x = 0; x <= W; x += W / 10) Q.push([x, y + Math.sin(x * 0.009 + k) * 22 * u]); Q.push([W + 60, y], [W + 60, H + 60]); return Q; };
          const L1 = lay(B + 0.17 * H, 0.4), L2 = lay(B + 0.33 * H, 2.2);
          bedD.setAttribute('d', inkLoop(L1, { seed: sd + 201, t, amp: 0.5, smooth: false }));
          bedDD.setAttribute('d', inkLoop(L2, { seed: sd + 202, t, amp: 0.5, smooth: false }));
          const BR = [inkPath(BP.slice(1, -1), { w: 6, seed: sd + 203, t }), inkPath(L1.slice(1, -1), { w: 4, seed: sd + 204, t }), inkPath(L2.slice(1, -1), { w: 4, seed: sd + 205, t })];
          for (let i = 0; i < 14; i++) { const x = hn(sd + 6, i) * W, y = B + (0.05 + 0.4 * hn(sd + 7, i)) * H; BR.push(inkPath([[x, y], [x + 30 * u, y + 4 * u]], { w: 3, seed: sd + 210 + i, t })); }
          bedR.setAttribute('d', BR.join(' '));
          const RK = [], RR = [];
          [[0.08, 0.02, 90], [0.9, 0.03, 110], [0.22, 0.24, 70], [0.74, 0.26, 80], [0.5, 0.4, 100], [0.12, 0.42, 60], [0.88, 0.4, 75]].forEach(([x, y, r], i) => {
            const pts = inkEllipsePts(x * W, B + y * H + 20 * u, r * u, r * 0.55 * u, sd + 220 + i, 10, 0, 0.12);
            RK.push(inkLoop(pts, { seed: sd + 220 + i, t, amp: 0.5 })); RR.push(inkPath(pts, { w: 5, seed: sd + 230 + i, t, closed: true })); });
          rocks.setAttribute('d', RK.join(' ')); rocksR.setAttribute('d', RR.join(' '));
          const GR = []; for (let i = 0; i < 10; i++) { const x = (0.03 + 0.1 * i + 0.03 * hn(sd + 8, i)) * W, y = B + 10 * u + (i % 3) * 0.1 * H, L = (90 + 60 * hn(sd + 9, i)) * u, sw = Math.sin(t * 1.2 + i) * 18 * u;
            GR.push(inkPath([[x, y], [x + sw * 0.5, y - L * 0.5], [x + sw, y - L]], { w: 9 * u, seed: sd + 240 + i, t }), inkPath([[x + 14 * u, y], [x + 14 * u + sw * 0.7, y - L * 0.4], [x + 18 * u + sw * 1.2, y - L * 0.75]], { w: 7 * u, seed: sd + 250 + i, t })); }
          grass.setAttribute('d', GR.join(' '));
          if (mode === 'sink' && land >= 1) { const q = clamp01((lt - Math.max(1.15, dur * 0.85)) / 1.2), SL = [];
            for (let i = 0; i < 6; i++) { const x = hx + (i - 2.5) * 150 * u, r = (40 + 50 * q) * u; SL.push(inkCircle(x, B - 10 * u - q * 30 * u, r, sd + 260 + i, t, { fill: true, ry: r * 0.5 })); }
            silt.setAttribute('d', q < 1 ? SL.join(' ') : ''); silt.setAttribute('fill-opacity', f1((1 - q) * 70) / 100); } else silt.setAttribute('d', '');
          // depth arrow (right edge)
          if (P.arrow !== false) {
            const ax = 0.92 * W, a0 = S + 24 * u, a1 = B - 20 * u, k = mode === 'sink' ? ease(lt / Math.max(0.8, dur * 0.85)) : 1, ye = lerp(a0, a1, k);
            arrow.setAttribute('d', inkPath([[ax, a0], [ax, ye]], { w: 7, seed: sd + 270, t }) + ' ' + inkPath([[ax - 22 * u, a0 + 26 * u], [ax, a0], [ax + 22 * u, a0 + 26 * u]], { w: 7, seed: sd + 271, t }) +
              (k > 0.98 ? ' ' + inkPath([[ax - 22 * u, a1 - 26 * u], [ax, a1], [ax + 22 * u, a1 - 26 * u]], { w: 7, seed: sd + 272, t }) : '') + ' ' + inkPath([[ax - 30 * u, a0 - 8 * u], [ax + 30 * u, a0 - 8 * u]], { w: 5, seed: sd + 273, t }));
          } else arrow.setAttribute('d', '');
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // =================================================================== SHOTS.ho_hull
  SH.ho_hull = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 671, u = W / 1080, mode = P.mode || 'dark';
      const root = el(svg, 'g');
      const wall = inkEl(root, ROOM()), panel = inkEl(root, mix(ROOM(), INK.ink, 0.3));
      const ceil = inkEl(root, WOOD_D()), planks = inkEl(root);
      const door = inkEl(root, ROOM_L()), doorR = inkEl(root), bunk = inkEl(root, ROOM_L()), mat = inkEl(root, mix(INK.blue, INK.paperDark, 0.45)), bunkR = inkEl(root);
      const port = inkEl(root, W_DARK()), portR = inkEl(root), portB = inkEl(root, INK.paperLight, { 'fill-opacity': 0.6 });
      const basin = inkEl(root, INK.paperLight), basinR = inkEl(root);
      const beam = inkEl(root, INK.gold, { 'fill-opacity': 0.2 }), beam2 = inkEl(root, INK.paperLight, { 'fill-opacity': 0.14 });
      const num = txt(root, { 'font-family': SERIF, 'font-weight': 900, fill: INK.gold, style: `paint-order: stroke; stroke: ${INK.ink}; stroke-width: 14px; stroke-linejoin: round` });
      const unit = txt(root, { 'font-family': SERIF, 'font-weight': 900, fill: INK.paperLight, 'letter-spacing': '6', style: `paint-order: stroke; stroke: ${INK.ink}; stroke-width: 10px; stroke-linejoin: round` });
      const ck = cook(el(root, 'g'), sd + 100, {});
      const mist = inkEl(root, INK.paperLight, { 'fill-opacity': 0.4 });
      const water = inkEl(root, W_DARK()), waterL = inkEl(root, mix(W_DARK(), INK.paperLight, 0.3)), refl = inkEl(root, INK.gold, { 'fill-opacity': 0.35 });
      const sub = inkEl(root, mix(W_DARK(), INK.paperDark, 0.16)), subR = inkEl(root, mix(W_DARK(), INK.paperLight, 0.3)), subB = bubbles(root, sd + 130, mix(W_DARK(), INK.paperLight, 0.4));
      const torch = inkEl(root, INK.inkSoft), torchL = inkEl(root, INK.gold), torchR = inkEl(root), debris = inkEl(root, WOOD()), debrisR = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6);
          const darkAt = atOr(cues, 'dark', dur * 0.65);
          const dark = mode === 'dark' ? ease((lt - darkAt) / 0.5) : 1;
          const flick = mode === 'dark' && lt < darkAt ? (lt > darkAt - 0.9 ? (hn(sd, Math.floor(lt * 14)) > 0.4 ? 1 : 0.15) : 1) : 0;
          wall.setAttribute('fill', mix(ROOM(), INK.ink, 0.15 + 0.45 * dark));
          wall.setAttribute('d', inkLoop(rectP(-60, -60, W + 60, H + 60), { seed: sd, t, amp: 0, smooth: false }));
          const PN = []; for (let i = 0; i < 6; i++) { const x = (0.04 + i * 0.19) * W; PN.push(inkPath([[x, 0.1 * H], [x + 4 * u, 0.6 * H]], { w: 10 * u, seed: sd + 1 + i, t })); }
          panel.setAttribute('d', PN.join(' '));
          // the old floor, now the ceiling
          ceil.setAttribute('d', inkLoop(rectP(-60, -60, W + 60, 0.1 * H), { seed: sd + 10, t, amp: 0.6, smooth: false }));
          const PK = [inkPath([[-40, 0.1 * H], [W + 40, 0.1 * H + 6 * u]], { w: 8, seed: sd + 11, t })];
          for (let i = 0; i < 7; i++) PK.push(inkPath([[(0.05 + i * 0.15) * W, 0], [(0.05 + i * 0.15) * W + 6 * u, 0.1 * H]], { w: 4, seed: sd + 12 + i, t }));
          planks.setAttribute('d', PK.join(' '));
          // door, upside down (handle high, panel), bunk hanging overhead, porthole
          const D = rectP(0.05 * W, 0.13 * H, 0.3 * W, 0.62 * H);
          door.setAttribute('d', inkLoop(D, { seed: sd + 20, t, amp: 0.6, smooth: false }));
          doorR.setAttribute('d', inkPath(D, { w: 7, seed: sd + 21, t, closed: true, smooth: false }) + ' ' + inkPath(rectP(0.09 * W, 0.3 * H, 0.26 * W, 0.58 * H), { w: 4, seed: sd + 22, t, closed: true, smooth: false }) +
            ' ' + inkPath([[0.25 * W, 0.2 * H], [0.25 * W, 0.24 * H]], { w: 12, seed: sd + 23, t }) + ' ' + inkCircle(0.25 * W, 0.19 * H, 14 * u, sd + 24, t, { w: 6 }));
          const BK = rectP(0.56 * W, 0.115 * H, 1.02 * W, 0.16 * H), MT = rectP(0.58 * W, 0.16 * H, 1.02 * W, 0.19 * H);
          bunk.setAttribute('d', inkLoop(BK, { seed: sd + 30, t, amp: 0.6, smooth: false }));
          const sag = Math.sin(t * 0.8) * 4 * u;
          mat.setAttribute('d', inkLoop([[0.58 * W, 0.16 * H], [1.02 * W, 0.16 * H], [1.02 * W, 0.19 * H + sag], [0.8 * W, 0.2 * H + sag * 1.5], [0.58 * W, 0.19 * H + sag]], { seed: sd + 31, t, amp: 0.6 }));
          bunkR.setAttribute('d', inkPath(BK, { w: 6, seed: sd + 32, t, closed: true, smooth: false }) + ' ' + inkPath([[0.6 * W, 0.1 * H], [0.6 * W, 0.115 * H]], { w: 10, seed: sd + 33, t }) +
            ' ' + inkPath([[0.58 * W, 0.19 * H + sag], [0.8 * W, 0.2 * H + sag * 1.5], [1.02 * W, 0.19 * H + sag]], { w: 4, seed: sd + 34, t }));
          const pc = [0.86 * W, 0.42 * H], pr = 80 * u;
          port.setAttribute('d', inkCircle(pc[0], pc[1], pr, sd + 40, t, { fill: true }));
          portR.setAttribute('d', inkCircle(pc[0], pc[1], pr, sd + 41, t, { w: 14 }) + ' ' + inkCircle(pc[0], pc[1], pr + 22 * u, sd + 42, t, { w: 5 }) +
            [0, 1, 2, 3, 4, 5].map(i => { const a = i / 6 * Math.PI * 2; return ' ' + inkDot(pc[0] + Math.cos(a) * (pr + 11 * u), pc[1] + Math.sin(a) * (pr + 11 * u), 5 * u, 5 * u, sd + 43 + i, t); }).join(''));
          const PB = []; for (let i = 0; i < 4; i++) { const q = (t * 0.5 + i / 4) % 1; PB.push(inkCircle(pc[0] - 30 * u + i * 20 * u, pc[1] + pr * 0.7 - q * pr * 1.4, 6 * u, sd + 50 + i, t, { w: 3 })); }
          portB.setAttribute('d', PB.join(' '));
          // the water level
          const wy = (mode === 'wait' ? lerp(0.525, 0.505, ease(lt / Math.max(1, dur))) : 0.525) * H;
          // the cook holding the upturned basin
          const s = 1.15 * u, gy = wy + 250 * u, cx = 0.5 * W + Math.sin(t * 0.9) * 4 * u;
          const rc = ck.update(t, { x: cx, y: gy + Math.sin(t * 1.3) * 4 * u, s, face: 1, pose: 'point', dir: 68, since: 2, emotion: 'worried' });
          const hb = rc.hands[1], bcx = hb[0] + 10 * u, bty = hb[1] - 8 * u;
          const BS = [[bcx - 130 * u, bty], [bcx + 130 * u, bty], [bcx + 108 * u, bty - 70 * u], [bcx + 50 * u, bty - 96 * u], [bcx - 50 * u, bty - 96 * u], [bcx - 108 * u, bty - 70 * u]];
          basin.setAttribute('d', inkLoop(BS, { seed: sd + 60, t, amp: 0.6 }));
          basinR.setAttribute('d', inkPath(BS, { w: 6, seed: sd + 61, t, closed: true }) + ' ' + inkPath([[bcx - 140 * u, bty + 4 * u], [bcx + 140 * u, bty + 4 * u]], { w: 10, seed: sd + 62, t }) +
            ' ' + inkPath([[bcx, bty - 96 * u], [bcx, 0.1 * H]], { w: 16 * u, seed: sd + 63, t, taper: 0 }) + ' ' + inkPath([[bcx - 40 * u, bty - 150 * u], [bcx - 40 * u, bty - 190 * u], [bcx + 40 * u, bty - 190 * u]], { w: 10 * u, seed: sd + 64, t }));
          // breath mist
          const MS = []; if (mode === 'wait') for (let i = 0; i < 2; i++) { const q = (t / 1.8 + i * 0.5) % 1; MS.push(inkCircle(rc.head[0] + (70 + q * 120) * u, rc.head[1] + (10 - q * 50) * u, (16 + q * 40) * u, sd + 70 + i, t, { fill: true })); }
          mist.setAttribute('d', MS.join(' ')); mist.setAttribute('fill-opacity', '0.3');
          // water up to his chest
          const WP = [[-60, wy]]; for (let i = 0; i <= 12; i++) WP.push([i / 12 * W, wy + Math.sin(i * 1.3 + t * 1.5) * 9 * u]);
          WP.push([W + 60, wy], [W + 60, H + 60], [-60, H + 60]);
          water.setAttribute('d', inkLoop(WP, { seed: sd + 80, t, amp: 0.6 }));
          const WL = [inkPath(WP.slice(0, 14), { w: 6, seed: sd + 81, t })];
          for (let i = 0; i < 7; i++) { const y = wy + (60 + i * 120) * u; WL.push(inkPath([[(0.04 + 0.12 * (i % 3)) * W, y], [(0.42 + 0.06 * (i % 2)) * W, y + 8 * u]], { w: 4, seed: sd + 82 + i, t }), inkPath([[(0.6 + 0.05 * (i % 2)) * W, y + 40 * u], [0.96 * W, y + 30 * u]], { w: 4, seed: sd + 90 + i, t })); }
          for (let i = 0; i < 2; i++) { const q = (t * 0.6 + i * 0.5) % 1; WL.push(inkCircle(rc.head[0], wy + 8 * u, (70 + 140 * q) * u, sd + 100 + i, t, { w: 4 * (1 - q) + 1, ry: (14 + 16 * q) * u })); }
          waterL.setAttribute('d', WL.join(' '));
          // under the water: the old ceiling is now the floor; an upturned table, a ceiling lamp lying on it
          const fy = 0.93 * H, TS = rectP(0.05 * W, 0.84 * H, 0.4 * W, 0.865 * H), lc = [0.76 * W, fy];
          const LMP = [[lc[0] - 120 * u, fy], [lc[0] - 100 * u, fy - 60 * u], [lc[0] - 40 * u, fy - 90 * u], [lc[0] + 40 * u, fy - 90 * u], [lc[0] + 100 * u, fy - 60 * u], [lc[0] + 120 * u, fy]];
          sub.setAttribute('d', inkLoop(rectP(-60, fy, W + 60, H + 60), { seed: sd + 131, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(TS, { seed: sd + 132, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(LMP, { seed: sd + 133, t, amp: 0.5 }));
          const lcw = Math.sin(t * 0.8) * 20 * u, SR = [inkPath([[-40, fy], [W + 40, fy + 4 * u]], { w: 6, seed: sd + 134, t }), inkPath(TS, { w: 4, seed: sd + 135, t, closed: true, smooth: false }), inkPath(LMP, { w: 4, seed: sd + 136, t, closed: true }),
            inkPath([[0.09 * W, 0.84 * H], [0.09 * W, 0.74 * H]], { w: 14 * u, seed: sd + 137, t }), inkPath([[0.36 * W, 0.84 * H], [0.36 * W, 0.74 * H]], { w: 14 * u, seed: sd + 138, t }),
            inkPath([[lc[0], fy - 90 * u], [lc[0] + lcw, fy - 180 * u], [lc[0] - lcw * 0.6, fy - 260 * u]], { w: 5, seed: sd + 139, t })];
          for (let i = 0; i < 8; i++) SR.push(inkPath([[(0.06 + i * 0.12) * W, fy + 30 * u], [(0.06 + i * 0.12) * W + 40 * u, H + 20]], { w: 3, seed: sd + 140 + i, t }));
          subR.setAttribute('d', SR.join(' '));
          subB.update(t, i => [lc[0] + (i - 2) * 30 * u, fy - 100 * u], 5, 0.14 * H, 14 * u, 7 * u, 2.6);
          // floating torch (dark mode) + debris
          if (mode === 'dark') {
            const tx = 0.2 * W + Math.sin(t * 0.7) * 10 * u, ty = wy - 6 * u + Math.sin(t * 1.5) * 6 * u, ta = -0.18 + Math.sin(t * 1.1) * 0.05;
            const c = Math.cos(ta), sn = Math.sin(ta), R = (x, y) => [tx + x * c - y * sn, ty + x * sn + y * c];
            const TB = [R(-70, -18), R(40, -18), R(40, 18), R(-70, 18)], HD = [R(40, -26), R(80, -32), R(80, 32), R(40, 26)];
            torch.setAttribute('d', inkLoop(TB, { seed: sd + 110, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(HD, { seed: sd + 111, t, amp: 0.4, smooth: false }));
            torchR.setAttribute('d', inkPath(TB, { w: 4, seed: sd + 112, t, closed: true, smooth: false }) + ' ' + inkPath(HD, { w: 4, seed: sd + 113, t, closed: true, smooth: false }));
            const b0 = R(80, 0), a = ta - 0.32, L = 1.0 * W, on = flick * (1 - dark);
            torchL.setAttribute('d', inkLoop([R(80, -28), R(88, -30), R(88, 30), R(80, 28)], { seed: sd + 114, t, amp: 0.3, smooth: false }));
            torchL.setAttribute('fill', on > 0.5 ? INK.gold : INK.inkSoft);
            if (on > 0.05) { const cone = sp => [b0, [b0[0] + Math.cos(a - sp) * L, b0[1] + Math.sin(a - sp) * L], [b0[0] + Math.cos(a + sp) * L, b0[1] + Math.sin(a + sp) * L]];
              beam.setAttribute('d', inkLoop(cone(0.3), { seed: sd + 115, t, amp: 0.8 })); beam2.setAttribute('d', inkLoop(cone(0.12), { seed: sd + 116, t, amp: 0.8 }));
              beam.setAttribute('fill-opacity', f1(0.2 * on * 100) / 100); beam2.setAttribute('fill-opacity', f1(0.14 * on * 100) / 100);
              refl.setAttribute('d', inkLoop(inkEllipsePts(0.55 * W, wy + 20 * u, 220 * u, 18 * u, sd + 117, 12, 0, 0.05), { seed: sd + 117, t, amp: 0.6 }));
            } else blank(beam, beam2, refl);
          } else blank(torch, torchL, torchR, beam, beam2, refl);
          const dx = (0.8 + 0.04 * Math.sin(t * 0.6)) * W, dyy = wy + 4 * u + Math.sin(t * 1.4 + 1) * 6 * u, DB = [[dx - 110 * u, dyy - 14 * u], [dx + 110 * u, dyy - 20 * u], [dx + 116 * u, dyy + 10 * u], [dx - 104 * u, dyy + 16 * u]];
          debris.setAttribute('d', inkLoop(DB, { seed: sd + 120, t, amp: 0.5, smooth: false }));
          debrisR.setAttribute('d', inkPath(DB, { w: 4, seed: sd + 121, t, closed: true, smooth: false }));
          // hour counter (wait mode)
          if (mode === 'wait') {
            const hrs = P.hours ?? 60, st = atOr(cues, 'count', 0.1), en = Math.max(st + 0.8, atOr(cues, 'hit', dur * 0.75)), p = clamp01((lt - st) / (en - st));
            const n = Math.round(hrs * ease(p)), k = spring(lt, 0, 0.5), pk = punch(lt, en, 0.7);
            num.textContent = String(n); num.setAttribute('x', f1(0.81 * W)); num.setAttribute('y', f1(0.285 * H)); num.setAttribute('font-size', f1(220 * u * k * (1 + 0.12 * pk)));
            unit.textContent = 'HOURS'; unit.setAttribute('x', f1(0.81 * W)); unit.setAttribute('y', f1(0.285 * H + 78 * u)); unit.setAttribute('font-size', f1(64 * u * k));
          } else { num.textContent = ''; unit.textContent = ''; }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // =================================================================== SHOTS.ho_glass
  SH.ho_glass = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 871, u = W / 1080;
      const top = (P.table ?? 0.6) * H;
      const root = el(svg, 'g');
      const bowlBack = inkEl(root, mix(INK.blue, INK.paperLight, 0.75)), bowlW = inkEl(root, mix(INK.blue, INK.paperLight, 0.45));
      const K = Object.assign({ x: 0.3, scale: 1.3, emotion: 'happy' }, P.kasif || {});
      const kas = KASIF.create(el(root, 'g'), { scale: K.scale * u, seed: seed * 3 + 1 });
      const glassA = inkEl(root, INK.paperLight, { 'fill-opacity': 0.4 }), glassW = inkEl(root, mix(INK.blue, INK.paperLight, 0.35)), glassR = inkEl(root, INK.inkSoft), glassH = inkEl(root, INK.paperLight);
      const bowlFront = inkEl(root, mix(INK.blue, INK.paperLight, 0.45), { 'fill-opacity': 0.0 }), bowlR = inkEl(root), surfL = inkEl(root, INK.paperLight);
      const tbl = inkEl(root, WOOD()), tblD = inkEl(root, WOOD_D()), tblR = inkEl(root), knob = inkEl(root, INK.gold);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.6), pk = punch(lt, hit, 0.7);
          // bowl on the table
          const bx0 = 0.38 * W, bx1 = 0.96 * W, rimY = top - 290 * u, sY = top - 220 * u + Math.sin(t * 2.2) * 3 * u;
          const BW = [[bx0, rimY], [bx1, rimY], [bx1 - 30 * u, top - 60 * u], [bx1 - 90 * u, top - 6 * u], [bx0 + 90 * u, top - 6 * u], [bx0 + 30 * u, top - 60 * u]];
          bowlBack.setAttribute('d', inkLoop(BW, { seed: sd, t, amp: 0.6 }));
          // Kaşif pushes the glass down: hand height follows the arm angle
          const pp = ease((lt - 0.15) / Math.max(1, Math.min(dur * 0.75, hit + 0.2) - 0.15)), dir = lerp(22, -38, pp);
          const kx = K.x * W, ky = top + 2 * u, s = K.scale * u;
          const r = kas.update(t, 'point', { x: kx, y: ky, face: 1, since: 2, dir, emotion: lt >= hit ? 'surprised' : K.emotion, mouth: 0 });
          const hw = [kx + s * r.hands[1][0], ky + s * r.hands[1][1]];
          const gw = 160 * u, gh = 230 * u, gx = hw[0] + 70 * u, gt = hw[1] + 14 * u, gm = gt + gh;
          const inner = gm > sY ? Math.max(gt + gh * 0.55, gm - (gm - sY) * 0.32) : gm;   // water barely rises into the glass
          const WWp = []; for (let i = 0; i <= 10; i++) WWp.push([lerp(bx0 + 6 * u, bx1 - 6 * u, i / 10), sY + Math.sin(i * 1.5 + t * 2.2) * 4 * u]);
          bowlW.setAttribute('d', inkLoop([...WWp, [bx1 - 30 * u, top - 60 * u], [bx1 - 90 * u, top - 10 * u], [bx0 + 90 * u, top - 10 * u], [bx0 + 30 * u, top - 60 * u]], { seed: sd + 1, t, amp: 0.5 }));
          const G = [[gx - gw / 2 + 14 * u, gt], [gx + gw / 2 - 14 * u, gt], [gx + gw / 2 + 8 * u, gm], [gx - gw / 2 - 8 * u, gm]];
          glassA.setAttribute('d', inkLoop([[gx - gw / 2 + 6 * u, gt + 8 * u], [gx + gw / 2 - 6 * u, gt + 8 * u], [gx + gw / 2 + 2 * u, inner], [gx - gw / 2 - 2 * u, inner]], { seed: sd + 2, t, amp: 0.4, smooth: false }));
          glassA.setAttribute('fill-opacity', f1((0.4 + 0.3 * pk) * 100) / 100);
          glassW.setAttribute('d', inner < gm - 2 ? inkLoop([[gx - gw / 2 - 2 * u, inner], [gx + gw / 2 + 2 * u, inner], [gx + gw / 2 + 7 * u, gm], [gx - gw / 2 - 7 * u, gm]], { seed: sd + 3, t, amp: 0.4, smooth: false }) : '');
          glassR.setAttribute('d', inkPath(G, { w: 6, seed: sd + 4, t, closed: true, smooth: false }) + ' ' + inkPath([[gx - gw / 2 - 2 * u, inner], [gx + gw / 2 + 2 * u, inner]], { w: 5, seed: sd + 5, t }) +
            ' ' + inkLoop(rectP(gx - gw / 2 + 14 * u, gt, gx + gw / 2 - 14 * u, gt + 22 * u), { seed: sd + 11, t, amp: 0.3, smooth: false }) + ' ' + inkCircle(gx, gm, gw / 2 + 8 * u, sd + 12, t, { w: 4, ry: 12 * u }));
          glassH.setAttribute('d', inkPath([[gx - gw / 2 + 24 * u, gt + 30 * u], [gx - gw / 2 + 30 * u, gm - 40 * u]], { w: 8 * u, seed: sd + 6, t }));
          bowlR.setAttribute('d', inkPath(BW, { w: 7, seed: sd + 7, t, closed: true }) + ' ' + inkPath([[bx0 - 10 * u, rimY], [bx1 + 10 * u, rimY]], { w: 10, seed: sd + 8, t }) + ' ' + inkPath(WWp, { w: 4, seed: sd + 9, t }));
          const RP = []; if (gm > sY) for (let i = 0; i < 2; i++) { const q = (t * 0.8 + i * 0.5) % 1; RP.push(inkCircle(gx, sY + 4 * u, gw * 0.6 + q * 120 * u, sd + 10 + i, t, { w: 3 * (1 - q) + 1, ry: (8 + 8 * q) * u })); }
          surfL.setAttribute('d', RP.join(' '));
          // table front down to the frame bottom
          tbl.setAttribute('d', inkLoop(rectP(-60, top, W + 60, H + 60), { seed: sd + 20, t, amp: 0.4, smooth: false }));
          tblD.setAttribute('d', inkLoop(rectP(-60, top, W + 60, top + 34 * u), { seed: sd + 21, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(rectP(0.1 * W, top + 0.12 * H, 0.9 * W, top + 0.27 * H), { seed: sd + 22, t, amp: 0.4, smooth: false }));
          const TR = [inkPath([[-40, top], [W + 40, top]], { w: 8, seed: sd + 23, t }), inkPath(rectP(0.1 * W, top + 0.12 * H, 0.9 * W, top + 0.27 * H), { w: 6, seed: sd + 24, t, closed: true, smooth: false })];
          for (let i = 0; i < 5; i++) TR.push(inkPath([[-40, top + (70 + i * 150) * u], [0.08 * W, top + (72 + i * 150) * u]], { w: 3, seed: sd + 25 + i, t }), inkPath([[0.92 * W, top + (60 + i * 150) * u], [W + 40, top + (64 + i * 150) * u]], { w: 3, seed: sd + 30 + i, t }));
          tblR.setAttribute('d', TR.join(' '));
          knob.setAttribute('d', inkDot(0.5 * W, top + 0.195 * H, 22 * u, 22 * u, sd + 40, t));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // =================================================================== SHOTS.ho_pocket
  // the pocket of air alone, big and still: steel keel plates overhead, a glowing gold dome of air trapped under them,
  // a calm waterline, dark water below with hull ribs and bubbles drifting up into the air; slow gold rings pulse out.
  // P: {water: 0.46 (waterline, 0..1 H), labels}  cues: hit (one stronger pulse)
  SH.ho_pocket = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 971, u = W / 1080, wy = (P.water ?? 0.46) * H;
      const root = el(svg, 'g');
      const bg = inkEl(root, W_DARK()), ribs = inkEl(root, mix(W_DARK(), INK.ink, 0.4)), ribsL = inkEl(root, mix(W_DARK(), INK.paperLight, 0.18));
      const plates = inkEl(root, ROOM()), platesR = inkEl(root);
      const air = inkEl(root, AIR()), core = inkEl(root, INK.paperLight, { 'fill-opacity': 0.35 }), rings = inkEl(root, INK.gold), airR = inkEl(root);
      const shirt = inkEl(root, mix(INK.blue, INK.paperDark, 0.35)), shirtR = inkEl(root), head = inkEl(root, SKIN()), headR = inkEl(root), face = inkEl(root);
      const waterF = inkEl(root, W_DARK());
      const marks = []; for (let i = 0; i < 11; i++) marks.push(inkEl(root, INK.gold));
      const surf = inkEl(root, mix(W_DARK(), INK.paperLight, 0.45)), refl = inkEl(root, INK.gold, { 'fill-opacity': 0.12 });
      const bub = bubbles(root, sd + 50, mix(W_DARK(), INK.paperLight, 0.5));
      const deck = inkEl(root, mix(W_DARK(), INK.paperDark, 0.16)), deckR = inkEl(root, mix(W_DARK(), INK.paperLight, 0.3));
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.5), pk = punch(lt, hit, 1.2) + (lt >= hit ? 0.25 * Math.exp(-(lt - hit) * 0.8) : 0), gone = atOr(cues, 'gone', 0.2);
          bg.setAttribute('d', inkLoop(rectP(-60, -60, W + 60, H + 60), { seed: sd, t, amp: 0, smooth: false }));
          const RB = [], RL = [];
          for (let i = 0; i < 6; i++) { const x = (0.02 + i * 0.19) * W; RB.push(inkPath([[x, wy], [x + 10 * u, H + 40]], { w: 46 * u, seed: sd + 1 + i, t, taper: 0 })); RL.push(inkPath([[x - 20 * u, wy], [x - 12 * u, H + 40]], { w: 5 * u, seed: sd + 10 + i, t, taper: 0 })); }
          ribs.setAttribute('d', RB.join(' ')); ribsL.setAttribute('d', RL.join(' '));
          // keel plates overhead (the upturned bottom of the hull)
          const PT = [[-60, -60], [W + 60, -60], [W + 60, 0.2 * H], [0.9 * W, 0.15 * H], [0.5 * W, 0.13 * H], [0.1 * W, 0.15 * H], [-60, 0.2 * H]];
          plates.setAttribute('d', inkLoop(PT, { seed: sd + 20, t, amp: 0.5 }));
          const PR = [inkPath(PT.slice(2), { w: 7, seed: sd + 21, t })];
          for (let i = 0; i < 6; i++) { const x = (0.08 + i * 0.17) * W; PR.push(inkPath([[x, -40], [x, 0.15 * H - Math.abs(x - 0.5 * W) * -0.05]], { w: 4, seed: sd + 22 + i, t }));
            for (let j = 0; j < 3; j++) PR.push(inkDot(x + 22 * u, (0.03 + j * 0.04) * H, 5 * u, 5 * u, sd + 30 + i * 3 + j, t)); }
          platesR.setAttribute('d', PR.join(' '));
          // the dome of air
          const br = 1 + 0.025 * Math.sin(t * 1.6) + 0.08 * pk;
          const D = [[-60, 0.2 * H], [0.1 * W, 0.15 * H], [0.5 * W, 0.13 * H], [0.9 * W, 0.15 * H], [W + 60, 0.2 * H], [W + 60, wy], [-60, wy]];
          air.setAttribute('d', inkLoop(D, { seed: sd + 40, t, amp: 0.5 }));
          air.setAttribute('fill-opacity', f1(Math.min(1, 0.72 * br) * 100) / 100);
          core.setAttribute('d', inkCircle(0.5 * W, wy - 170 * u, 230 * u * br, sd + 41, t, { fill: true }));
          core.setAttribute('fill-opacity', f1(Math.min(0.8, 0.35 + 0.5 * pk) * 100) / 100);
          const RG = []; for (let i = 0; i < 3; i++) { const q = ((lt * 0.42) + i / 3) % 1; RG.push(inkCircle(0.5 * W, 0.31 * H, (120 + q * 520) * u, sd + 42 + i, t, { w: 11 * (1 - q) + 2, ry: (60 + q * 260) * u })); }
          rings.setAttribute('d', RG.join(' '));
          // the cook, head and shoulders above the water, breathing slowly
          const bth = 1.6 * Math.sin(t * 1.4), hx = 0.5 * W + Math.sin(t * 0.8) * 16 * u, hy = wy - 175 * u - bth * 6 * u, hr = 100 * u;
          const SHp = [[hx - 230 * u, wy + 60 * u], [hx - 200 * u, wy - 40 * u - bth * 5 * u], [hx - 60 * u, wy - 80 * u - bth * 6 * u], [hx + 60 * u, wy - 80 * u - bth * 6 * u], [hx + 200 * u, wy - 40 * u - bth * 5 * u], [hx + 230 * u, wy + 60 * u]];
          shirt.setAttribute('d', inkLoop(SHp, { seed: sd + 70, t, amp: 0.5 })); shirtR.setAttribute('d', inkPath(SHp, { w: 6, seed: sd + 71, t, closed: true }));
          head.setAttribute('d', inkCircle(hx, hy, hr, sd + 72, t, { fill: true }));
          headR.setAttribute('d', inkCircle(hx, hy, hr, sd + 73, t, { w: 7 }));
          const lid = 0.45 + 0.1 * Math.sin(t * 0.7);   // tired, half-closed eyes looking up at the air
          face.setAttribute('d', inkDot(hx - 34 * u, hy - 14 * u, 14 * u, 11 * u * lid, sd + 74, t) + ' ' + inkDot(hx + 34 * u, hy - 14 * u, 14 * u, 11 * u * lid, sd + 75, t) +
            ' ' + inkPath([[hx - 54 * u, hy - 40 * u], [hx - 16 * u, hy - 50 * u]], { w: 6, seed: sd + 76, t }) + ' ' + inkPath([[hx + 16 * u, hy - 50 * u], [hx + 54 * u, hy - 40 * u]], { w: 6, seed: sd + 77, t }) +
            ' ' + inkPath([[hx - 20 * u, hy + 40 * u], [hx + 20 * u, hy + 38 * u]], { w: 6, seed: sd + 78, t }));
          const SP = []; for (let x = -40; x <= W + 40; x += 30) SP.push([x, wy + Math.sin(x * 0.008 + t * 1.8) * 13 * u]);
          waterF.setAttribute('d', inkLoop([...SP, [W + 40, H + 60], [-40, H + 60]], { seed: sd + 79, t, amp: 0.4, smooth: false }));
          const RP = []; for (let i = 0; i < 3; i++) { const q = (t * 0.45 + i / 3) % 1; RP.push(inkCircle(hx, wy + 10 * u, (240 + q * 300) * u, sd + 80 + i, t, { w: 5 * (1 - q) + 1, ry: (18 + 24 * q) * u })); }
          airR.setAttribute('d', RP.join(' '));
          airR.setAttribute('fill', mix(W_DARK(), INK.paperLight, 0.4));
          // eleven small lights sink and go out in the dark water
          marks.forEach((m, i) => { const st = gone + i * 0.12, q = (lt - st) / 2.6;
            if (q <= 0 || q >= 1) { m.setAttribute('d', ''); return; }
            const x = (0.1 + 0.8 * ((i * 0.37 + hn(sd + 90, i) * 0.3) % 1)) * W, y = wy + (50 + 150 * hn(sd + 91, i)) * u + q * 110 * u, r = (10 + 4 * hn(sd + 92, i)) * u * (1 - 0.5 * q);
            m.setAttribute('d', inkCircle(x, y, r, sd + 93 + i, t, { fill: true }));
            m.setAttribute('fill-opacity', f1(Math.sin(Math.min(1, q * 4) * Math.PI / 2) * (1 - q) * 85) / 100); });
          surf.setAttribute('d', inkPath(SP, { w: 8, seed: sd + 50, t }) + ' ' + [0, 1, 2].map(i => inkPath([[(0.15 + i * 0.28) * W, wy + (40 + i * 18) * u], [(0.32 + i * 0.28) * W, wy + (44 + i * 18) * u]], { w: 4, seed: sd + 51 + i, t })).join(' '));
          refl.setAttribute('d', inkLoop(inkEllipsePts(0.5 * W, wy + 40 * u, 0.36 * W * br, 24 * u, sd + 55, 14, 0, 0.05), { seed: sd + 55, t, amp: 0.6 }));
          bub.update(t, i => [(0.12 + 0.08 * i) * W, 0.9 * H], 12, 0.9 * H - wy, 40 * u, 14 * u, 2.2);
          // the old ceiling, now the floor, at the bottom
          const fy = 0.9 * H;
          deck.setAttribute('d', inkLoop(rectP(-60, fy, W + 60, H + 60), { seed: sd + 60, t, amp: 0.5, smooth: false }));
          const DR = [inkPath([[-40, fy], [W + 40, fy + 4 * u]], { w: 6, seed: sd + 61, t })];
          for (let i = 0; i < 9; i++) DR.push(inkPath([[(0.04 + i * 0.11) * W, fy + 20 * u], [(0.04 + i * 0.11) * W + 30 * u, H + 20]], { w: 3, seed: sd + 62 + i, t }));
          deckR.setAttribute('d', DR.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
