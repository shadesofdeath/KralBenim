// ky_kyrenia: shots for the Stickstory Short "Kyrenia ship" (2026-11-20). A small Greek merchant ship sank off Kyrenia,
// Cyprus, about 2,300 years ago (radiocarbon: most likely 286-272 BC, Manning et al., PLOS ONE 2024); a sponge diver,
// Andreas Cariolou, found her in 1965; Michael Katzev's team raised her in 1967-69. Cargo: about 400 amphorae (mostly
// wine) and over 9,000 almonds; the cabin ware came in fours (cups, oil jugs, spoons, salt dishes) -> a crew of four;
// iron spear points were found stuck in the hull (a possible attack). The hull stands in Kyrenia Castle today.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*, mixed), every line boils at 8 Hz via
// _ink.js, everything is a pure function of (seed, lt); no Math.random. Uses lh__lib.js (LH.kasif, LH.label) read-only.
// Laid out for portrait 1080x1920 (Shorts); landscape scales by W/1080 and is not tuned.
//
// Common P: labels: [{text, x, y (0..1), at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}]
//   kasif: {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | absent
//
// SHOTS.ky_sea — underwater cross-section (draws its own water: use "set": false). Sand floor with rocks, sponges and
//   sea grass, light rays, fish, the wreck mound (a heap of lying amphorae over a half-buried hull with ribs).
//   P: {mode: "hook" (close on the mound: a broken hull timber in front with a big iron spearhead stuck in it; cue
//        "hit" rings it in red and makes it glint) | "dive" (sea surface at P.surface with a sponge boat; a diver swims
//        down to the mound and finds it on cue "found") | "spear" (close on the hull planks and lead sheathing; iron
//        spearheads appear stuck in the wood one by one from cue "spear" (or P.spear_at s; negative = already there),
//        a red ring on cue "ring"),
//       floor: 0..1 H, surface: 0.2 (dive), mound: {x: 0.5, k: 1}, labels, kasif}
// SHOTS.ky_chart — full-frame old sea chart of the eastern Mediterranean (Anatolian coast, Levant, Egypt, big Cyprus);
//   cue "city" pins Kyrenia, cue "down" makes the little ship off Kyrenia heel over and sink with ripple rings.
//   P: {labels, cyprus: "CYPRUS"}
// SHOTS.ky_ship — the Kyrenia merchant ship in side view (single square sail, steering oar, eye on the bow) at sea.
//   P: {mode: "hold" (the hull side is cut away: amphorae stacked in the hold; cue "jars" pops them in, cue "almonds"
//        opens a big lens full of almonds) | "crew" (four sailors on deck; numbers 1-4 pop over them from cue "four"),
//       x: 0.5, wl: 0.55 (waterline 0..1 H), s: 1, labels, kasif}
// SHOTS.ky_cabin — the ship's cabin: a beam ceiling with a swinging lamp, a wooden table; rows of four cups, four
//   spoons and four oil jugs appear on cues "cups", "spoons", "jugs". P: {labels}
// SHOTS.ky_museum — Kyrenia Castle museum: the reassembled hull on its scaffold behind, a glass case with the four cups
//   in front. P: {ghosts: {at, fade} (four ghost sailors (blue outlines) stand behind the case and fade out on cue "fade") |
//   absent, labels, kasif}
// SHOTS.ky_pirate — a shore at sea: the trader on the water, a dark galley with sweeping oars rows in from the right
//   towards her (P.galley: {from: 1.25, to: 0.66, at, dur}); the host stands on the beach. Use "set": "sea".
//   P: {labels, kasif}
// cues: hit (punch) + the names above + labels "at" + kasif seq "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const TAU = Math.PI * 2;
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const ellP = (cx, cy, rx, ry, n = 16, rot = 0) => { const o = [], c = Math.cos(rot), s = Math.sin(rot); for (let i = 0; i < n; i++) { const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry; o.push([cx + x * c - y * s, cy + x * s + y * c]); } return o; };
  const XF = (x, y, s, rot = 0, fx = 1) => { const c = Math.cos(rot), sn = Math.sin(rot); return (u, v) => { u *= fx; return [x + (u * c - v * sn) * s, y + (u * sn + v * c) * s]; }; };
  const mapP = (T, pts) => pts.map(p => T(p[0], p[1]));

  // palette-derived colours (computed at build time: the video's palette is loaded by then)
  const COL = () => ({
    clay: mix(mix(INK.stain, INK.red, 0.32), INK.paperDark, 0.2),
    clayL: mix(mix(INK.stain, INK.red, 0.25), INK.paperLight, 0.4),
    clayD: mix(INK.stain, INK.ink, 0.35),
    wood: mix(INK.stain, INK.paperDark, 0.3),
    woodL: mix(INK.stain, INK.paperLight, 0.45),
    woodD: mix(INK.stain, INK.ink, 0.4),
    iron: mix(INK.ink, INK.red, 0.28),
    rust: mix(INK.red, INK.gold, 0.3),
    lead: mix(INK.inkSoft, INK.paperLight, 0.45),
    w1: mix(INK.paper, INK.blue, 0.26),
    w2: mix(INK.paper, INK.blue, 0.38),
    w3: mix(INK.paper, INK.blue, 0.5),
    sand: mix(INK.paperDark, INK.stain, 0.3),
    sandD: mix(INK.stain, INK.paperDark, 0.35),
    rock: mix(INK.inkSoft, INK.paperDark, 0.45),
    sponge: mix(INK.gold, INK.stain, 0.4),
    weed: mix(INK.green, INK.paperDark, 0.25),
    glaze: mix(INK.ink, INK.inkSoft, 0.35),
    sail: mix(INK.paperLight, INK.stain, 0.18),
    sea: mix(INK.paperLight, INK.blue, 0.2),
    land: mix(INK.paperDark, INK.stain, 0.25),
    almond: mix(INK.paperLight, INK.gold, 0.45),
    almondD: mix(INK.stain, INK.ink, 0.25),
    ghost: mix(INK.blue, INK.ink, 0.1),
    dark: mix(INK.ink, INK.inkSoft, 0.25),
    darkSail: mix(INK.red, INK.ink, 0.45),
  });

  // a set of filled paths; each frame: L.f.d(...) etc. Returns {add(name, d), flush()}
  function layers(parent, spec) {
    const L = {};
    spec.forEach(([k, fill, extra]) => { L[k] = { e: inkEl(parent, fill, extra || {}), d: [] }; });
    return {
      L,
      add(k, d) { if (!L[k]) throw new Error('ky layer missing: ' + k); if (d) L[k].d.push(d); },
      flush() { for (const k in L) { L[k].e.setAttribute('d', L[k].d.join(' ')); L[k].d = []; } },
    };
  }

  // ------------------------------------------------------------------ amphora (upright, toe at 0,0, ~244 units tall)
  const AMPH = [[0, 0], [-9, -22], [-30, -70], [-44, -130], [-40, -170], [-26, -190], [-13, -200], [-12, -236], [-17, -244], [17, -244], [12, -236], [13, -200], [26, -190], [40, -170], [44, -130], [30, -70], [9, -22]];
  function amphora(Lr, T, sd, t, fillK = 'clay', inkK = 'ink') {
    const body = mapP(T, AMPH);
    Lr.add(fillK, inkLoop(body, { seed: sd, t }));
    Lr.add(inkK, inkPath(body, { seed: sd, t, closed: true, w: 5 }));
    Lr.add(inkK, inkPath(mapP(T, [[-12, -230], [-32, -228], [-34, -206], [-27, -190]]), { seed: sd + 1, t, w: 4.5 }));
    Lr.add(inkK, inkPath(mapP(T, [[12, -230], [32, -228], [34, -206], [27, -190]]), { seed: sd + 2, t, w: 4.5 }));
    Lr.add('soft', inkPath(mapP(T, [[-34, -150], [-26, -100], [-14, -50]]), { seed: sd + 3, t, w: 3 }));
  }

  // ------------------------------------------------------------------ iron spearhead (tip at 0,-170; socket end at 0,40)
  function spearhead(Lr, T, sd, t, o = {}) {
    const bend = o.bend || 0, buried = !!o.buried;
    const B = (u, v) => { if (v < -110 && bend) { const a = bend * (-110 - v) / 70, c = Math.cos(a), s = Math.sin(a), dv = v + 110; return [u * c - dv * s, -110 + u * s + dv * c]; } return [u, v]; };
    // leaf-shaped blade: narrow neck at the socket, widest a third of the way up, long point (only the very tip buried)
    const half = [[-7, 0], [-16, -18], [-32, -52], [-36, -80], [-30, -112], [-18, -142], [-8, -164]];
    const raw = (buried ? half : half.concat([[0, -182]])).concat(half.slice().reverse().map(p => [-p[0], p[1]]));
    const blade = raw.map(p => B(p[0], p[1]));
    const sock = [[-9, 0], [-13, 46], [13, 46], [9, 0]];
    if (o.shaft !== false) {   // broken wooden shaft stub in the socket
      const sh = [[-12, 44], [12, 44], [13, 90], [4, 82], [-3, 98], [-13, 88]];   // short stub, one jagged break
      Lr.add('stub', inkLoop(mapP(T, sh), { seed: sd + 9, t, smooth: false, amp: 0.6 }));
      Lr.add('ink', inkPath(mapP(T, sh), { seed: sd + 9, t, closed: true, w: 4, smooth: false }));
    }
    Lr.add('iron', inkLoop(mapP(T, blade), { seed: sd, t, smooth: false, amp: 0.8 }));
    Lr.add('iron', inkLoop(mapP(T, sock), { seed: sd + 1, t, smooth: false, amp: 0.8 }));
    // facets: a bright midrib and two bevel lines towards the point
    Lr.add('hi', inkPath(mapP(T, [[0, -6], [0, -90], [0, -160]].map(p => B(p[0], p[1]))), { seed: sd + 2, t, w: 5 }));
    Lr.add('bevel', inkPath(mapP(T, [[-6, -10], [-18, -80], [-5, -158]].map(p => B(p[0], p[1]))), { seed: sd + 12, t, w: 2.5 }) + ' ' + inkPath(mapP(T, [[6, -10], [18, -80], [5, -158]].map(p => B(p[0], p[1]))), { seed: sd + 13, t, w: 2.5 }));
    Lr.add('ink', inkPath(mapP(T, blade), { seed: sd, t, closed: true, w: 5, smooth: false }));
    Lr.add('ink', inkPath(mapP(T, sock), { seed: sd + 1, t, closed: true, w: 5, smooth: false }));
    Lr.add('ink', inkPath(mapP(T, [[-12, 16], [12, 16]]), { seed: sd + 14, t, w: 3 }) + ' ' + inkPath(mapP(T, [[-13, 32], [13, 32]]), { seed: sd + 15, t, w: 3 }));
    Lr.add('rust', inkDot(...T(14, -48), 8, 5, sd + 3, t) + ' ' + inkDot(...T(-12, -96), 7, 5, sd + 4, t) + ' ' + inkDot(...T(4, 26), 5, 4, sd + 5, t));
    if (buried) { const e = B(0, -164); Lr.add('ink', inkPath(mapP(T, [[e[0] - 30, e[1] + 2], [e[0] - 10, e[1]], [e[0], e[1] - 4], [e[0] + 10, e[1] + 1], [e[0] + 32, e[1] - 2]]), { seed: sd + 6, t, w: 4 }) + ' ' +
      inkPath(mapP(T, [[e[0] - 24, e[1]], [e[0] - 46, e[1] - 12]]), { seed: sd + 7, t, w: 3 }) + ' ' + inkPath(mapP(T, [[e[0] + 22, e[1]], [e[0] + 46, e[1] - 10]]), { seed: sd + 8, t, w: 3 })); }
  }

  // ------------------------------------------------------------------ sea floor pieces
  function fishPaths(fish, t, W, sd) {
    return fish.map((f, i) => {
      const span = W + 260, x = ((f.x + t * f.v) % span + span) % span - 130, y = f.y + Math.sin(t * 1.3 + i) * 10, s = 26 * f.s, d = f.v > 0 ? 1 : -1;
      return inkLoop([[x + d * s, y], [x, y - s * 0.45], [x - d * s * 0.8, y], [x - d * s * 1.3, y - s * 0.4], [x - d * s * 1.3, y + s * 0.4], [x - d * s * 0.8, y], [x, y + s * 0.45]], { seed: sd + i, t, amp: 0.6, smooth: false });
    }).join(' ');
  }

  // the wreck mound: half-buried hull with ribs + heap of lying amphorae; (cx, fy) = centre on the floor line
  function moundList(sd, rows) {
    const r = rng(sd), J = [];
    (rows || [[-380, 380, -26, 8], [-300, 300, -86, 6], [-200, 200, -142, 5], [-90, 90, -192, 3]]).forEach(([x0, x1, y, n]) => {
      for (let i = 0; i < n; i++) { const u = n > 1 ? i / (n - 1) : 0.5; J.push({ x: lerp(x0, x1, u) + (r() - 0.5) * 30, y: y + (r() - 0.5) * 12, rot: (r() < 0.5 ? 1 : -1) * (Math.PI / 2 + (r() - 0.5) * 0.7), s: 0.8 + r() * 0.15 }); }
    });
    return J.reverse();   // top rows first (behind), bottom row last (in front)
  }
  // Lr: hull layers (wood, woodD, ink, soft, rock, gold); JL: one layer set per jar (clay, soft, ink) so each jar hides the ones behind it
  function mound(Lr, JL, cx, fy, k, t, sd, J, glow = 0) {
    const T = XF(cx, fy, k);
    // hull shell: two curved strakes and ribs sticking out at both ends
    Lr.add('wood', inkLoop(mapP(T, [[-520, 10], [-470, -50], [-300, -78], [0, -86], [300, -78], [480, -54], [530, 10], [0, 40]]), { seed: sd + 1, t }));
    Lr.add('ink', inkPath(mapP(T, [[-520, 10], [-470, -50], [-300, -78], [0, -86], [300, -78], [480, -54], [530, 10]]), { seed: sd + 2, t, w: 7 }));
    Lr.add('soft', inkPath(mapP(T, [[-500, -14], [-300, -44], [0, -50], [300, -44], [500, -18]]), { seed: sd + 3, t, w: 4 }));
    [-480, -430, -380, 380, 430, 480].forEach((x, i) => {
      const h = 120 - Math.abs(Math.abs(x) - 430) * 0.6;
      Lr.add('woodD', inkPath(mapP(T, [[x, -40], [x + (x < 0 ? -14 : 14), -40 - h * 0.6], [x + (x < 0 ? -6 : 6), -40 - h]]), { seed: sd + 10 + i, t, w: 14, taper: 0.5 }));
    });
    // amphorae
    J.forEach((j, i) => amphora(JL[i], XF(...T(j.x, j.y), k * j.s, j.rot), sd + 40 + i * 7, t));
    // millstone at one end
    Lr.add('rock', inkLoop(ellP(...T(-420, -18), 54 * k, 30 * k, 14), { seed: sd + 30, t }));
    Lr.add('ink', inkPath(ellP(...T(-420, -18), 54 * k, 30 * k, 14), { seed: sd + 30, t, closed: true, w: 5 }) + ' ' + inkDot(...T(-420, -20), 10 * k, 6 * k, sd + 31, t));
    if (glow > 0) {
      const [gx, gy] = T(0, -120);
      Lr.add('gold', inkPath(ellP(gx, gy, 480 * k * (0.9 + glow * 0.1), 210 * k * (0.9 + glow * 0.1), 26), { seed: sd + 32, t, closed: true, w: 7 * glow }));
    }
  }

  // diver (free swimmer with mask and fins); x, y = head; ang = heading (0 = head up), s scale
  function diver(Lr, x, y, ang, s, t, sd) {
    const T = XF(x, y, s, ang), k = Math.sin(t * 5) * 22;
    const body = [[-24, 24], [24, 24], [22, 120], [-22, 120]];
    Lr.add('suit', inkLoop(mapP(T, body), { seed: sd, t }));
    Lr.add('ink', inkPath(mapP(T, body), { seed: sd, t, closed: true, w: 5 }));
    Lr.add('ink', inkPath(mapP(T, [[-12, 116], [-18 + k * 0.3, 170], [-16 + k, 220]]), { seed: sd + 1, t, w: 16 }) + ' ' + inkPath(mapP(T, [[12, 116], [18 - k * 0.3, 170], [16 - k, 220]]), { seed: sd + 2, t, w: 16 }));
    Lr.add('dark', inkLoop(mapP(T, [[-16 + k - 14, 214], [-16 + k + 14, 214], [-16 + k + 22, 280], [-16 + k - 20, 280]]), { seed: sd + 3, t, smooth: false }) + ' ' +
      inkLoop(mapP(T, [[16 - k - 14, 214], [16 - k + 14, 214], [16 - k + 22, 280], [16 - k - 20, 280]]), { seed: sd + 4, t, smooth: false }));
    const sw = Math.sin(t * 2.2) * 14;
    Lr.add('ink', inkPath(mapP(T, [[-20, 34], [-40, -10 + sw], [-30, -60 + sw]]), { seed: sd + 5, t, w: 14 }) + ' ' + inkPath(mapP(T, [[20, 34], [40, -10 - sw], [30, -60 - sw]]), { seed: sd + 6, t, w: 14 }));
    Lr.add('skin', inkLoop(ellP(...T(0, 0), 26 * s, 28 * s, 14), { seed: sd + 7, t }));
    Lr.add('ink', inkPath(ellP(...T(0, 0), 26 * s, 28 * s, 14), { seed: sd + 7, t, closed: true, w: 5 }));
    Lr.add('glass', inkLoop(mapP(T, [[-18, -14], [18, -14], [16, 6], [-16, 6]]), { seed: sd + 8, t, smooth: false }));
    Lr.add('ink', inkPath(mapP(T, [[-18, -14], [18, -14], [16, 6], [-16, 6]]), { seed: sd + 8, t, closed: true, w: 4, smooth: false }));
    // sponge net bag at the hip
    Lr.add('sponge', inkLoop(ellP(...T(-34, 100), 20 * s, 26 * s, 10), { seed: sd + 9, t }));
    Lr.add('ink', inkPath(ellP(...T(-34, 100), 20 * s, 26 * s, 10), { seed: sd + 9, t, closed: true, w: 3 }));
  }

  // ------------------------------------------------------------------ the merchant ship (bow at +x when face = 1)
  // T = XF(x, wl, s, rot, face); waterline at v = 0; deck ~ -100; masthead ~ -640
  const HULL_UP = [[-470, -150], [-430, -118], [-300, -104], [0, -98], [300, -106], [440, -132], [478, -168]];
  const HULL_DN = [[478, -168], [470, -120], [452, -40], [410, 24], [220, 62], [-200, 64], [-390, 34], [-452, -40], [-470, -150]];
  function ship(Lr, T, t, sd, o = {}, C) {
    const sail = o.sail ?? 1, bil = Math.sin(t * 1.7) * 8;
    const above = HULL_UP.concat([[478, -168], [470, -120], [462, -60], [458, 0], [-458, 0], [-462, -60], [-470, -150]]);
    const full = HULL_UP.concat(HULL_DN);
    const hull = o.full ? full : above;
    // mast, yard, sail
    if (sail > 0) {
      const sw = 260 * sail;
      const top = -600, bot = lerp(-600, -230, sail);
      const sp = [[40 - sw, top + 4], [40 + sw + 40, top - 4], [40 + sw + 30 + bil, bot], [40, bot + 16 + bil * 0.5], [40 - sw + 10 + bil, bot]];
      Lr.add('sail', inkLoop(mapP(T, sp), { seed: sd + 1, t }));
      Lr.add('ink', inkPath(mapP(T, sp), { seed: sd + 1, t, closed: true, w: 5 }));
      for (let i = 1; i < 6; i++) { const u = i / 6, x = lerp(40 - sw, 40 + sw + 40, u); Lr.add('soft', inkPath(mapP(T, [[x, top + 4], [x + bil * 0.6, lerp(top, bot, 0.5)], [x + bil, bot - 4]]), { seed: sd + 2 + i, t, w: 2.5 })); }
      Lr.add('woodD', inkPath(mapP(T, [[40 - sw - 30, top], [40 + sw + 70, top - 8]]), { seed: sd + 9, t, w: 11 }));
    }
    Lr.add('woodD', inkPath(mapP(T, [[40, -96], [40, -640]]), { seed: sd + 10, t, w: 14, taper: 0.1 }));
    // stays
    Lr.add('soft', inkPath(mapP(T, [[40, -630], [470, -170]]), { seed: sd + 11, t, w: 2.5 }) + ' ' + inkPath(mapP(T, [[40, -630], [-440, -140]]), { seed: sd + 12, t, w: 2.5 }));
    // hull
    Lr.add('wood', inkLoop(mapP(T, hull), { seed: sd + 20, t }));
    Lr.add('ink', inkPath(mapP(T, hull), { seed: sd + 20, t, closed: true, w: 7 }));
    Lr.add('woodD', inkPath(mapP(T, [[-462, -78], [-300, -66], [0, -62], [300, -68], [462, -92]]), { seed: sd + 21, t, w: 8 }));
    Lr.add('soft', inkPath(mapP(T, [[-458, -36], [-300, -30], [0, -28], [300, -32], [458, -48]]), { seed: sd + 22, t, w: 3 }));
    // stern post curl + bow stem
    Lr.add('ink', inkPath(mapP(T, [[-470, -150], [-498, -200], [-520, -250], [-506, -292], [-480, -296], [-476, -270]]), { seed: sd + 23, t, w: 10 }));
    Lr.add('ink', inkPath(mapP(T, [[478, -168], [496, -210]]), { seed: sd + 24, t, w: 10 }));
    // eye on the bow
    Lr.add('paper', inkLoop(ellP(...T(392, -122), 24 * (o.s || 1), 15 * (o.s || 1), 12), { seed: sd + 25, t }));
    Lr.add('ink', inkPath(ellP(...T(392, -122), 24 * (o.s || 1), 15 * (o.s || 1), 12), { seed: sd + 25, t, closed: true, w: 4 }) + ' ' + inkDot(...T(396, -122), 8 * (o.s || 1), 8 * (o.s || 1), sd + 26, t));
    // steering oar
    const so = Math.sin(t * 0.9) * 0.05;
    Lr.add('woodD', inkPath(mapP(T, [[-360, -170], [-420 - so * 300, -40], [-450 - so * 400, o.full ? 70 : 6]]), { seed: sd + 27, t, w: 10 }));
    if (o.full) Lr.add('wood', inkLoop(mapP(T, [[-430, 10], [-470, 14], [-486, 90], [-450, 96]]), { seed: sd + 28, t, smooth: false }));
  }

  // galley (pirate ship): long, low and dark; ram at the bow (+x when face = 1); oars sweep
  function galley(Lr, T, t, sd) {
    const hull = [[-540, -150], [-500, -84], [-300, -66], [0, -64], [300, -70], [500, -88], [560, -40], [600, -6], [540, 2], [-470, 2], [-520, -60]];
    for (let i = 0; i < 11; i++) {
      const x = -380 + i * 76, ph = t * 3 + i * 0.25, sw = Math.sin(ph) * 40;
      Lr.add('ink', inkPath(mapP(T, [[x, -58], [x - 40 + sw, 40], [x - 50 + sw * 1.2, 64]]), { seed: sd + 40 + i, t, w: 6 }));
    }
    Lr.add('dark', inkLoop(mapP(T, hull), { seed: sd + 1, t }));
    Lr.add('ink', inkPath(mapP(T, hull), { seed: sd + 1, t, closed: true, w: 6 }));
    Lr.add('red', inkPath(mapP(T, [[-480, -52], [0, -40], [520, -50]]), { seed: sd + 2, t, w: 5 }));
    Lr.add('ink', inkPath(mapP(T, [[-540, -150], [-560, -200], [-530, -226]]), { seed: sd + 3, t, w: 9 }));
    Lr.add('ink', inkPath(mapP(T, [[0, -64], [0, -470]]), { seed: sd + 4, t, w: 12 }));
    const b = Math.sin(t * 1.5) * 8;
    const sp = [[-200, -450], [220, -456], [210 + b, -180], [-190 + b, -176]];
    Lr.add('dsail', inkLoop(mapP(T, sp), { seed: sd + 5, t }));
    Lr.add('ink', inkPath(mapP(T, sp), { seed: sd + 5, t, closed: true, w: 5 }));
    Lr.add('paper', inkLoop(ellP(...T(470, -60), 20, 12, 10), { seed: sd + 6, t }));
    Lr.add('ink', inkDot(...T(474, -60), 7, 7, sd + 7, t));
  }

  // sailor (hatless crew figure, side view) via the Kaşif rig with an accessory
  // -------------------------------------------------------------------------------------------- SHOTS.ky_sea
  SH.ky_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = COL(), u = W / 1080, mode = P.mode || 'hook', sd = seed * 1000 + 71;
      const Fy = (P.floor ?? (mode === 'dive' ? 0.66 : mode === 'spear' ? 0.62 : 0.58)) * H;
      const Sy = mode === 'dive' ? (P.surface ?? 0.2) * H : -100;
      const back = el(svg, 'g');
      const Lb = layers(back, [
        ['sky', mix(INK.paperLight, INK.blue, 0.1)], ['w1', C.w1], ['w2', C.w2], ['w3', C.w3],
        ['rays', INK.paperLight, { 'fill-opacity': 0.35 }], ['hatch', INK.inkSoft, { 'fill-opacity': 0.45 }], ['fish', INK.inkSoft, { 'fill-opacity': 0.8 }],
        ['sand', C.sand], ['sandD', C.sandD], ['weed', C.weed], ['rock', C.rock], ['sponge', C.sponge], ['soft', INK.inkSoft], ['ink', INK.ink]]);
      const moundG = el(svg, 'g');
      const Lm = layers(el(moundG, 'g'), [['wood', C.wood], ['woodD', C.woodD], ['soft', INK.inkSoft], ['rock', C.rock], ['ink', INK.ink], ['gold', INK.gold]]);
      const root = el(svg, 'g');
      const Lr = layers(root, [
        ['wood', C.wood], ['woodD', C.woodD], ['clay', C.clay], ['soft', INK.inkSoft], ['rock', C.rock], ['gold', INK.gold],
        ['plank', C.woodL], ['lead', C.lead], ['grain', INK.inkSoft], ['pegs', C.woodD], ['tacks', INK.ink], ['seam', INK.ink], ['stub', C.woodD], ['iron', C.iron], ['hi', mix(INK.paperLight, INK.inkSoft, 0.25)], ['bevel', INK.inkSoft], ['rust', C.rust],
        ['sand', C.sand], ['sandD', C.sandD], ['weed', C.weed], ['sponge', C.sponge],
        ['suit', C.dark], ['skin', mix(INK.paperLight, INK.stain, 0.35)], ['glass', mix(INK.blue, INK.paperLight, 0.45)], ['dark', INK.ink],
        ['paper', INK.paperLight], ['bub', INK.paperLight], ['ink', INK.ink], ['red', INK.red],
      ]);
      const top = el(svg, 'g');
      const KG = el(svg, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const LB = labels(svg, P.labels, W, H);
      const r0 = rng(sd + 3);
      const fish = Array.from({ length: mode === 'spear' ? 4 : 6 }, () => ({ x: r0() * W, y: lerp(Math.max(Sy, 0) + 120, Fy - 160, r0()), v: (r0() < 0.5 ? -1 : 1) * (30 + r0() * 30), s: 0.7 + r0() * 0.6 }));
      const hl = Array.from({ length: 16 }, () => ({ x: r0() * W, y: lerp(Math.max(Sy, 0) + 40, Fy - 40, r0()), w: 50 + r0() * 90, v: 6 + r0() * 10 }));
      const rocks = Array.from({ length: 7 }, (_, i) => ({ x: (i + 0.3 + r0() * 0.4) / 7 * W, y: Fy + 120 + r0() * (H - Fy - 260), r: 40 + r0() * 60 }));
      const weeds = Array.from({ length: 12 }, (_, i) => ({ x: (i + r0()) / 12 * W, y: Fy + 20 + r0() * (H - Fy - 120), h: 90 + r0() * 120 }));
      const pebbles = Array.from({ length: 26 }, () => [r0() * W, Fy + 40 + r0() * (H - Fy - 60), 5 + r0() * 9]);
      const J = moundList(sd + 9, mode === 'hook' ? [[-400, 400, -26, 6], [-260, 260, -90, 4], [-110, 110, -150, 2]] : null);
      const JL = J.map(() => layers(el(moundG, 'g'), [['clay', C.clay], ['soft', INK.inkSoft], ['ink', INK.ink]]));
      const M = P.mound || {}, mx = (M.x ?? 0.5) * W;
      const spears = (P.spears || (mode === 'spear'
        ? [{ x: 0.3, y: 0.38, rot: -0.5, s: 1.6, bend: 0.35 }, { x: 0.64, y: 0.47, rot: 0.35, s: 1.5 }, { x: 0.8, y: 0.31, rot: -0.15, s: 1.3, bend: -0.3 }]
        : [{ x: 0.68, y: 0.33, rot: 0.55, s: 2.1, bend: 0.2 }]));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null));
          // water body, darker with depth (opaque bands)
          if (mode === 'dive') {
            Lb.add('sky', inkLoop([[-20, -20], [W + 20, -20], [W + 20, Sy + 10], [-20, Sy + 10]], { seed: sd, t, smooth: false, amp: 0.5 }));
          }
          const wave = []; for (let i = 0; i <= 24; i++) { const x = -60 + i * (W + 120) / 24; wave.push([x, Sy + Math.sin(i * 0.9 + t * 2.2) * 9]); }
          const band = (y0, k) => { const pts = []; for (let i = 0; i <= 12; i++) { const x = -60 + i * (W + 120) / 12; pts.push([x, y0 + Math.sin(i * 1.3 + t * 0.6 + k) * 10]); } return pts; };
          Lb.add('w1', inkLoop(wave.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 1, t, amp: 1, smooth: false }));
          const yA = lerp(Math.max(Sy, 0), Fy, 0.38), yB = lerp(Math.max(Sy, 0), Fy, 0.72);
          Lb.add('w2', inkLoop(band(yA, 1).concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 2, t, amp: 1, smooth: false }));
          Lb.add('w3', inkLoop(band(yB, 2).concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 3, t, amp: 1, smooth: false }));
          if (mode === 'dive') Lb.add('ink', inkPath(wave, { seed: sd + 4, t, w: 6, amp: 1.2 }));
          let ry = ''; for (let k = 0; k < 4; k++) { const x0 = W * (0.12 + k * 0.25) + Math.sin(t * 0.5 + k) * 24; ry += inkLoop([[x0 - 26, Math.max(Sy, -40) + 14], [x0 + 26, Math.max(Sy, -40) + 14], [x0 + 150, Fy - 30], [x0 + 50, Fy - 30]], { seed: sd + 5 + k, t, amp: 1, smooth: false }) + ' '; }
          Lb.add('rays', ry);
          Lb.add('hatch', hl.map((h, i) => { const x = ((h.x + t * h.v) % (W + 200)) - 100, pts = []; for (let j = 0; j <= 4; j++) pts.push([x + j * h.w / 4, h.y + Math.sin(j * 1.5 + t) * 5]); return inkPath(pts, { seed: sd + 20 + i, t, w: 3, amp: 0.8 }); }).join(' '));
          Lb.add('fish', fishPaths(fish, t, W, sd + 40));

          // dive: the sponge boat on the surface, a man in it looking down
          if (mode === 'dive') {
            const bx = (P.boat_x ?? 0.3) * W, by = Sy + Math.sin(t * 2.2 + 1) * 6, rk = Math.sin(t * 1.6) * 0.04;
            const T = XF(bx, by, u, rk);
            const hp = [[-200, -50], [210, -56], [170, 30], [-160, 30]];
            Lr.add('wood', inkLoop(mapP(T, hp), { seed: sd + 60, t, smooth: false }));
            Lr.add('ink', inkPath(mapP(T, hp), { seed: sd + 60, t, closed: true, w: 7, smooth: false }) + ' ' + inkPath(mapP(T, [[-180, -18], [190, -22]]), { seed: sd + 61, t, w: 3 }));
            Lr.add('woodD', inkPath(mapP(T, [[150, -50], [260, 60]]), { seed: sd + 62, t, w: 9 }));
            // rope down to the diver
          }

          // wreck mound
          const fa = atOr(cues, 'found', dur * 0.62);
          if (mode !== 'spear') {
            const k = (M.k ?? (mode === 'hook' ? 0.92 : 0.72)) * u;
            const glow = mode === 'dive' ? clamp01((lt - fa) / 0.4) * (0.6 + 0.4 * Math.sin(t * 5)) : 0;
            mound(Lm, JL, mx, Fy + 8 * u, k * (1 + (mode === 'dive' ? punch(lt, fa) * 0.06 : 0)), t, sd + 100, J, glow);
          }
          // hook: a broken hull timber lying in front with the big spearhead stuck in it
          if (mode === 'hook' || mode === 'spear') {
            if (mode === 'hook') {
              const pl = [[40, Fy - 150], [W - 30, Fy - 260], [W - 14, Fy - 170], [60, Fy - 64]];
              Lr.add('plank', inkLoop(pl, { seed: sd + 200, t, smooth: false }));
              Lr.add('ink', inkPath(pl, { seed: sd + 200, t, closed: true, w: 7, smooth: false }));
              for (let i = 0; i < 4; i++) Lr.add('grain', inkPath([[100 + i * 40, Fy - 126 + i * 18], [W * 0.5, Fy - 186 + i * 18 + Math.sin(i) * 6], [W - 100 + i * 20, Fy - 236 + i * 18]], { seed: sd + 201 + i, t, w: 2.5 }));
              [[0.25, 0], [0.55, 0], [0.82, 0]].forEach(([q], i) => Lr.add('tacks', inkDot(lerp(70, W - 30, q), lerp(Fy - 106, Fy - 214, q), 9, 9, sd + 210 + i, t)));
            } else {
              // close-up: the outside of the hull: wooden strakes with grain, caulked seams and rows of treenails where the
              // frames sit behind; two strakes of lead sheathing with tack rows at the bottom; a jar half in the sand below
              const y0 = 0.17 * H, y1 = Fy - 30, NS = 6;
              const edge = i => { const y = lerp(y0, y1, i / NS); const pts = []; for (let k = 0; k <= 8; k++) pts.push([-40 + k * (W + 80) / 8, y + Math.sin(k * 0.8 + i * 1.9) * 8 + (k - 4) * (i - 3) * 1.5]); return pts; };
              for (let i = 0; i < NS; i++) {
                const A = edge(i), Bn = edge(i + 1), isLead = i >= NS - 2;
                Lr.add(isLead ? 'lead' : 'plank', inkLoop(A.concat(Bn.slice().reverse()), { seed: sd + 220 + i, t, smooth: false, amp: 0.8 }));
                Lr.add('seam', inkPath(Bn, { seed: sd + 230 + i, t, w: 6 }));
                const a0 = A[4][1], b0 = Bn[4][1];
                if (!isLead) {
                  for (let j = 0; j < 5; j++) { const q = (j + 0.7) / 6, ph = i * 1.3 + j; const pts = []; for (let k = 0; k <= 10; k++) pts.push([-30 + k * (W + 60) / 10, lerp(a0, b0, q) + Math.sin(k * 0.7 + ph) * 5]); Lr.add('grain', inkPath(pts, { seed: sd + 240 + i * 6 + j, t, w: 2.2 })); }
                  if (i % 2 === 0) { const kx = W * (0.2 + 0.25 * i % 0.7), ky = lerp(a0, b0, 0.5); Lr.add('grain', inkPath(ellP(kx, ky, 34, 12, 12), { seed: sd + 300 + i, t, closed: true, w: 2.5 })); }
                  [0.16, 0.5, 0.84].forEach((q, j) => Lr.add('pegs', inkDot(q * W + (i % 2) * 14, lerp(a0, b0, 0.5), 11, 11, sd + 320 + i * 3 + j, t)));
                } else {
                  for (let j = 0; j < 11; j++) Lr.add('tacks', inkDot(30 + j * 100 + (i % 2) * 50, lerp(a0, b0, 0.3), 5, 5, sd + 340 + i * 11 + j, t) + ' ' + inkDot(30 + j * 100 + (i % 2) * 50, lerp(a0, b0, 0.75), 5, 5, sd + 360 + i * 11 + j, t));
                  [0.33, 0.71].forEach((q, j) => Lr.add('seam', inkPath([[q * W, a0 + 4], [q * W + 6, b0 - 4]], { seed: sd + 380 + i * 2 + j, t, w: 3 })));
                }
              }
              Lr.add('seam', inkPath(edge(0), { seed: sd + 250, t, w: 8 }));
              amphora(Lr, XF(W * 0.08, Fy + 70 * u, 1.3 * u, 1.45), sd + 390, t);
            }
            const s0 = atOr(cues, 'spear', mode === 'spear' ? (P.spear_at ?? 0.5) : -1);
            spears.forEach((S, i) => {
              const a = mode === 'spear' ? s0 + i * 0.45 : -1, p = mode === 'spear' ? spring(lt, a, 0.5) : 1;
              if (p <= 0.001) return;
              const ph = mode === 'spear' ? punch(lt, a) : hit;
              const T = XF(S.x * W, S.y * H, S.s * u * p * (1 + ph * 0.1), S.rot + Math.PI);   // tip points into the wood (down)
              spearhead(Lr, T, sd + 300 + i * 20, t, { buried: true, bend: S.bend || 0 });
            });
            // red ring around the first spearhead
            const ra = atOr(cues, mode === 'spear' ? 'ring' : 'hit', mode === 'spear' ? s0 + 1.6 : dur * 0.5);
            if (lt >= ra) {
              const S = spears[0], pr = clamp01((lt - ra) / 0.6), cxr = S.x * W - Math.sin(S.rot) * 85 * S.s * u, cyr = S.y * H + Math.cos(S.rot) * 85 * S.s * u, R = 82 * S.s * u;
              const rp = []; const n = 30; for (let i = 0; i <= Math.round(n * 1.1 * pr); i++) { const aa = -2.2 + i / n * TAU, rr = 1 + i / n * 0.08; rp.push([cxr + Math.cos(aa) * R * rr, cyr + Math.sin(aa) * R * 1.25 * rr]); }
              if (rp.length > 1) Lr.add('red', inkPath(rp, { seed: sd + 400, t, w: 10, amp: 1.2 }));
              // glint
              const gl = 0.5 + 0.5 * Math.sin(t * 6);
              const [gx, gy] = [S.x * W + Math.sin(S.rot) * 60 * S.s, S.y * H - Math.cos(S.rot) * 60 * S.s];
              Lr.add('gold', inkPath([[gx - 40 * gl, gy], [gx + 40 * gl, gy]], { seed: sd + 401, t, w: 6 }) + ' ' + inkPath([[gx, gy - 40 * gl], [gx, gy + 40 * gl]], { seed: sd + 402, t, w: 6 }));
            }
          }

          // sea floor (fills the lower frame)
          const sf = []; for (let i = 0; i <= 16; i++) { const x = -60 + i * (W + 120) / 16; sf.push([x, Fy + Math.sin(i * 1.7) * 14]); }
          Lb.add('sand', inkLoop(sf.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 500, t, amp: 1.2, smooth: false }));
          Lb.add('ink', inkPath(sf, { seed: sd + 501, t, w: 6, amp: 1.2 }));
          for (let k = 0; k < 6; k++) { const y = Fy + 70 + k * (H - Fy) / 6.5; Lb.add('sandD', inkPath([[40 + (k % 2) * 200, y], [300 + (k % 2) * 200, y - 8], [560 + (k % 2) * 200, y + 4]], { seed: sd + 510 + k, t, w: 3 })); }
          Lb.add('sandD', pebbles.map((p, i) => inkDot(p[0], p[1], p[2], p[2] * 0.6, sd + 520 + i, t)).join(' '));
          weeds.forEach((w, i) => { const sw = Math.sin(t * 1.2 + i) * 18; Lb.add('weed', inkPath([[w.x, w.y], [w.x + sw * 0.5, w.y - w.h * 0.5], [w.x + sw, w.y - w.h]], { seed: sd + 560 + i, t, w: 9 })); });
          rocks.forEach((r, i) => {
            const rp = inkEllipsePts(r.x, r.y, r.r * 1.3, r.r * 0.7, sd + 600 + i, 10, 0, 0.2);
            Lb.add('rock', inkLoop(rp, { seed: sd + 600 + i, t }));
            Lb.add('ink', inkPath(rp, { seed: sd + 600 + i, t, closed: true, w: 5 }));
            if (i % 2 === 0) { const sp = inkEllipsePts(r.x + r.r * 0.3, r.y - r.r * 0.75, r.r * 0.45, r.r * 0.38, sd + 620 + i, 10, 0, 0.2); Lb.add('sponge', inkLoop(sp, { seed: sd + 620 + i, t })); Lb.add('ink', inkPath(sp, { seed: sd + 620 + i, t, closed: true, w: 4 }) + ' ' + inkDot(r.x + r.r * 0.25, r.y - r.r * 0.8, 6, 6, sd + 640 + i, t) + ' ' + inkDot(r.x + r.r * 0.45, r.y - r.r * 0.68, 5, 5, sd + 660 + i, t)); }
          });
          // front sand lip over the bottom of the mound
          if (mode !== 'spear') {
            const lip = []; for (let i = 0; i <= 10; i++) lip.push([mx - 600 * u + i * 120 * u, Fy + 6 + Math.sin(i * 2.1) * 10]);
            Lr.add('sand', inkLoop(lip.concat([[mx + 600 * u, Fy + 60], [mx - 600 * u, Fy + 60]]), { seed: sd + 700, t, amp: 1 }));
          }

          // dive: diver swims down to the mound
          if (mode === 'dive') {
            const pd = progIO(lt, 0, Math.max(0.6, fa + 0.1));
            const x0 = (P.boat_x ?? 0.3) * W + 60 * u, y0 = Sy + 110, x1 = mx - 210 * u, y1 = Fy - 280 * u;
            const dx = lerp(x0, x1, pd) + Math.sin(t * 1.1) * 10, dy = lerp(y0, y1, pd) + Math.sin(t * 1.8) * 6;
            const ang = lerp(Math.PI * 0.85, Math.PI * 0.6, pd);
            diver(Lr, dx, dy, ang, 1.05 * u, t, sd + 800);
            // bubbles
            let bb = ''; for (let j = 0; j < 6; j++) { const ph = (t * 0.6 + j / 6) % 1, y = dy - 30 - ph * 300, x = dx + 20 + Math.sin(ph * 9 + j) * 14, r = 6 + ph * 10; if (y < Sy + 10) continue; bb += inkPath(ellP(x, y, r, r, 10), { seed: sd + 850 + j, t, closed: true, w: 3, amp: 0.6 }) + ' '; }
            Lr.add('soft', bb);
          } else {
            let bb = ''; for (let j = 0; j < 5; j++) { const ph = (t * 0.35 + j / 5) % 1, y = Fy - 200 - ph * (Fy - 300), x = W * (0.2 + j * 0.15) + Math.sin(ph * 7 + j) * 16, r = 5 + ph * 8; bb += inkPath(ellP(x, y, r, r, 10), { seed: sd + 870 + j, t, closed: true, w: 3, amp: 0.6 }) + ' '; }
            Lr.add('soft', bb);
          }
          Lb.flush(); Lm.flush(); JL.forEach(l => l.flush()); Lr.flush();
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // -------------------------------------------------------------------------------------------- SHOTS.ky_chart
  const ANAT_LEV = [[28.5, 41], [28.5, 36.8], [29.1, 36.6], [29.6, 36.2], [30.15, 36.3], [30.45, 36.25], [30.6, 36.6], [30.7, 36.88], [31.4, 36.75], [32.0, 36.54],
    [32.5, 36.1], [32.8, 36.02], [33.4, 36.15], [33.9, 36.3], [34.3, 36.6], [34.6, 36.8], [35.0, 36.75], [35.4, 36.6], [35.9, 36.85], [36.2, 36.6], [35.95, 36.3],
    [35.8, 35.9], [35.78, 35.52], [35.92, 35.2], [35.87, 34.9], [35.83, 34.43], [35.5, 33.9], [35.2, 33.27], [34.98, 32.82], [34.77, 32.08], [34.45, 31.5],
    [33.8, 31.13], [32.3, 31.26], [31.8, 31.5], [30.9, 31.45], [29.9, 31.2], [28.5, 30.9], [28.5, 27], [38.5, 27], [38.5, 41]];
  const CYPRUS = [[32.27, 35.08], [32.37, 34.92], [32.4, 34.76], [32.62, 34.67], [32.88, 34.66], [32.95, 34.57], [33.05, 34.7], [33.3, 34.71], [33.62, 34.82],
    [33.64, 34.93], [33.9, 34.96], [34.08, 34.98], [33.95, 35.08], [33.93, 35.3], [34.25, 35.47], [34.59, 35.69], [34.3, 35.58], [34.0, 35.47], [33.62, 35.36],
    [33.32, 35.35], [33.0, 35.36], [32.92, 35.4], [32.86, 35.2], [32.7, 35.18], [32.55, 35.17], [32.42, 35.05]];
  SH.ky_chart = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = COL(), sd = seed * 1000 + 133, u = W / 1080;
      const LC = P.center || [33.2, 35.4], SC = (P.scale ?? 230) * u, KX = Math.cos(35.2 * Math.PI / 180), CY = (P.cy ?? 0.34) * H;
      const PX = q => [W / 2 + (q[0] - LC[0]) * KX * SC, CY - (q[1] - LC[1]) * SC];
      const root = el(svg, 'g');
      const Lr = layers(root, [['sea', C.sea], ['grat', INK.inkSoft, { 'fill-opacity': 0.35 }], ['wav', INK.inkSoft, { 'fill-opacity': 0.7 }], ['land', C.land], ['hatch', INK.inkSoft, { 'fill-opacity': 0.4 }],
        ['cyp', mix(INK.paperDark, INK.gold, 0.25)], ['serp', mix(INK.green, INK.paperDark, 0.3)], ['soft', INK.inkSoft], ['ripple', INK.blue], ['wood', C.wood], ['woodD', C.woodD], ['sail', C.sail], ['paper', INK.paperLight], ['ink', INK.ink], ['red', INK.red]]);
      const tg = el(svg, 'g');
      const mkT = (size, col, fam, wt) => el(tg, 'text', { 'font-family': fam, 'font-weight': wt, 'font-size': size, fill: col, 'text-anchor': 'middle', style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
      const cyT = mkT(84 * u, INK.ink, 'Fraunces, Georgia, serif', 900); cyT.textContent = P.cyprus || 'CYPRUS';
      const kyT = mkT(84 * u, INK.red, INK_FONT, 400); kyT.textContent = P.city || 'Kyrenia';
      const seaT = mkT(52 * u, INK.inkSoft, INK_FONT, 400); seaT.textContent = P.sea ?? ''; seaT.setAttribute('letter-spacing', '0.06em');
      const LB = labels(svg, P.labels, W, H);
      const land = ANAT_LEV.map(PX), cyp = CYPRUS.map(PX);
      const [kx, ky] = PX([33.32, 35.34]), [sx, sy] = PX(P.wreck || [33.36, 35.5]);
      const waves = [[30.5, 34.5], [31.4, 33.2], [34.8, 34.2], [31.0, 35.8], [34.9, 35.9], [33.0, 32.6], [30.2, 32.6], [32.0, 34.0]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          Lr.add('sea', inkLoop([[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]], { seed: sd, t, smooth: false, amp: 0.5 }));
          for (let i = -2; i < 9; i++) { const [gx] = PX([28 + i * 1.5, 0]); Lr.add('grat', inkPath([[gx, -20], [gx + 4, H + 20]], { seed: sd + 1 + i, t, w: 2 })); }
          for (let i = -2; i < 12; i++) { const [, gy] = PX([0, 28 + i * 1.5]); Lr.add('grat', inkPath([[-20, gy], [W + 20, gy + 4]], { seed: sd + 20 + i, t, w: 2 })); }
          waves.forEach(([lo, la], i) => { const [x0, y0] = PX([lo, la]), d = Math.sin(t * 1.2 + i) * 8, pts = []; for (let k = 0; k <= 8; k++) pts.push([x0 - 46 + k * 11.5 + d, y0 + Math.sin(k * 1.6 + t * 2) * 7]); Lr.add('wav', inkPath(pts, { seed: sd + 40 + i, t, w: 3.5 })); });
          Lr.add('land', inkLoop(land, { seed: sd + 60, t, smooth: false, amp: 1.4 }));
          Lr.add('ink', inkPath(land, { seed: sd + 60, t, closed: true, w: 5, amp: 1.4, smooth: false }));
          // coast hatching just inside the land (short strokes along the coast)
          for (let i = 1; i < land.length - 4; i++) { const a = land[i], b = land[i + 1]; if (a[1] > H + 40 || b[1] > H + 40 || a[0] < -40 || a[0] > W + 40) continue; const mxp = (a[0] + b[0]) / 2, myp = (a[1] + b[1]) / 2; Lr.add('hatch', inkPath([[mxp, myp - 6], [mxp + 10, myp - 40]], { seed: sd + 80 + i, t, w: 3 })); }
          const cp = punch(lt, atOr(cues, 'cyprus', null));
          Lr.add('cyp', inkLoop(cyp, { seed: sd + 120, t, amp: 1.2 }));
          Lr.add('ink', inkPath(cyp, { seed: sd + 120, t, closed: true, w: 6, amp: 1.2 }));
          // Kyrenia pin
          const ca = atOr(cues, 'city', dur * 0.3), pc = spring(lt, ca, 0.5);
          if (pc > 0.01) {
            Lr.add('paper', inkLoop(ellP(kx, ky, 18 * pc, 18 * pc, 12), { seed: sd + 130, t }));
            Lr.add('red', inkPath(ellP(kx, ky, 18 * pc, 18 * pc, 12), { seed: sd + 130, t, closed: true, w: 6 }) + ' ' + inkDot(kx, ky, 7 * pc, 7 * pc, sd + 131, t));
          }
          // the little ship off Kyrenia: sails, then heels and sinks on "down"
          const da = atOr(cues, 'down', dur * 0.6), pdn = clamp01((lt - da) / 1.4), bob = Math.sin(t * 2) * 3;
          const sink = EASE_IO(pdn);
          if (sink < 0.98) {
            const T = XF(sx + (1 - clamp01(lt / Math.max(0.5, da))) * -40 * u, sy + bob + sink * 70 * u, 0.2 * u * (1 - sink * 0.5), sink * 0.7);
            ship(Lr, T, t, sd + 140, { sail: 1, s: 0.2 }, C);
          }
          if (lt >= da) {
            for (let j = 0; j < 3; j++) { const ph = clamp01((lt - da - j * 0.35) / 1.6); if (ph <= 0) continue; const R = (20 + ph * 110) * u; Lr.add('ripple', inkPath(ellP(sx, sy + 40 * u, R, R * 0.35, 18), { seed: sd + 160 + j, t, closed: true, w: 5 * (1 - ph) + 1 })); }
          }
          // compass rose (bottom right, over the sea)
          const rcx = W * 0.3, rcy = H * 0.7, R = 110 * u;
          Lr.add('paper', inkLoop(ellP(rcx, rcy, R * 0.7, R * 0.7, 16), { seed: sd + 170, t }));
          Lr.add('soft', inkPath(ellP(rcx, rcy, R * 0.7, R * 0.7, 16), { seed: sd + 170, t, closed: true, w: 3 }));
          const rot = Math.sin(t * 0.6) * 0.03;
          for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4 - Math.PI / 2 + rot, L = q % 2 ? R * 0.6 : R; Lr.add(q % 2 ? 'soft' : 'ink', inkLoop([[rcx + Math.cos(a - 1.57) * R * 0.14, rcy + Math.sin(a - 1.57) * R * 0.14], [rcx + Math.cos(a) * L, rcy + Math.sin(a) * L], [rcx + Math.cos(a + 1.57) * R * 0.14, rcy + Math.sin(a + 1.57) * R * 0.14]], { seed: sd + 180 + q, t, smooth: false, amp: 0.6 })); }
          // rhumb lines from the compass rose + a sea serpent coiling in the open sea (old-chart decoration)
          for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4 + 0.2; Lr.add('grat', inkPath([[rcx, rcy], [rcx + Math.cos(a) * W * 1.2, rcy + Math.sin(a) * W * 1.2]], { seed: sd + 190 + q, t, w: 2 })); }
          {
            const bx = W * 0.66, by = H * 0.64, sw = t * 1.6, pts = [];
            for (let i = 0; i <= 14; i++) pts.push([bx + i * 22 * u, by + Math.sin(i * 0.8 - sw) * 26 * u * (i > 0 ? 1 : 0)]);
            [[2, 5], [7, 10]].forEach(([i0, i1], k) => { const seg = pts.slice(i0, i1 + 1); Lr.add('serp', inkPath(seg, { seed: sd + 200 + k, t, w: 22 * u })); Lr.add('ink', inkPath(seg, { seed: sd + 202 + k, t, w: 4 })); });
            const [hx, hy] = pts[0]; Lr.add('serp', inkLoop(ellP(hx - 10 * u, hy - 20 * u, 26 * u, 18 * u, 12, -0.4), { seed: sd + 205, t })); Lr.add('ink', inkPath(ellP(hx - 10 * u, hy - 20 * u, 26 * u, 18 * u, 12, -0.4), { seed: sd + 205, t, closed: true, w: 4 }) + ' ' + inkDot(hx - 20 * u, hy - 26 * u, 4, 4, sd + 206, t));
            Lr.add('wav', inkPath([[bx - 30 * u, by + 30 * u], [bx + 330 * u, by + 30 * u]], { seed: sd + 207, t, w: 3 }));
          }
          Lr.flush();
          const [cxp, cyp2] = PX([33.2, 34.62]);
          cyT.setAttribute('x', f1(cxp)); cyT.setAttribute('y', f1(cyp2 + 30 * u)); cyT.setAttribute('transform', `rotate(${f1(-4 + Math.sin(t) * 0.5)} ${f1(cxp)} ${f1(cyp2)}) translate(${f1(cxp * -cp * 0.08)} ${f1(cyp2 * -cp * 0.08)}) scale(${(1 + cp * 0.08).toFixed(3)})`);
          kyT.style.display = pc > 0.01 ? '' : 'none';
          kyT.setAttribute('x', f1(kx - 34 * u)); kyT.setAttribute('y', f1(ky + 18 * u)); kyT.setAttribute('text-anchor', 'end'); kyT.setAttribute('font-size', f1(84 * u * Math.max(0.65, pc)));
          const [sxp, syp] = PX([32.6, 32.8]); seaT.setAttribute('x', f1(sxp)); seaT.setAttribute('y', f1(syp));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // -------------------------------------------------------------------------------------------- SHOTS.ky_ship
  SH.ky_ship = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = COL(), u = W / 1080, mode = P.mode || 'hold', sd = seed * 1000 + 211;
      const X0 = (P.x ?? 0.5) * W, WL = (P.wl ?? 0.55) * H, S = (P.s ?? 1) * u;
      const root = el(svg, 'g');
      const Lr = layers(root, [['wav', INK.inkSoft, { 'fill-opacity': 0.6 }], ['sail', C.sail], ['soft', INK.inkSoft], ['wood', C.wood], ['woodD', C.woodD], ['paper', INK.paperLight],
        ['hold', mix(INK.paperDark, INK.stain, 0.45)], ['clay', C.clay], ['under', INK.blue, { 'fill-opacity': 0.16 }], ['ink', INK.ink], ['gold', INK.gold]]);
      const crewG = el(svg, 'g');
      const front = el(svg, 'g');
      const Lf = layers(front, [['sea1', mix(INK.paper, INK.blue, 0.32)], ['sea2', mix(INK.paper, INK.blue, 0.42)], ['sea3', mix(INK.paper, INK.blue, 0.52)], ['wood', C.wood], ['rock', C.rock], ['rockD', INK.inkSoft], ['foam', INK.paperLight], ['wav', INK.inkSoft], ['lensF', INK.paperLight], ['clay', C.clayD], ['alm', C.almond], ['almD', C.almondD], ['ink', INK.ink], ['gold', INK.gold]]);
      const numG = el(svg, 'g');
      const KG = el(svg, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const LB = labels(svg, P.labels, W, H);
      const sailors = mode === 'crew' ? [
        { x: -360, pose: 'idle', face: 1, acc: null, beard: 'black' },
        { x: -40, pose: 'point', face: 1, dir: 30, acc: null, beard: 'short' },
        { x: 170, pose: 'talk', face: -1, acc: null, beard: null },
        { x: 330, pose: 'point', face: 1, dir: 5, acc: null, beard: 'grey' },
      ].map((c, i) => Object.assign(c, { rig: KASIF.create(el(crewG, 'g'), { scale: (P.crew_scale ?? 0.4) * u, hat: false, accessory: c.acc, beard: c.beard, seed: sd + i * 7 }) })) : [];
      const nums = sailors.map((c, i) => { const tx = el(numG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 78 * u, fill: INK.red, 'text-anchor': 'middle', style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px` }); tx.textContent = String(i + 1); return tx; });
      // hold: jar slots inside the cut-away (ship units)
      const slots = [];
      if (mode === 'hold') { for (let i = 0; i < 10; i++) slots.push({ x: -330 + i * 72, v: 46, s: 0.5 }); for (let i = 0; i < 9; i++) slots.push({ x: -294 + i * 72, v: -12, s: 0.44 }); }
      const ar = rng(sd + 5), almonds = Array.from({ length: 46 }, () => { const a = ar() * TAU, rr = Math.sqrt(ar()); return [Math.cos(a) * rr, Math.sin(a) * rr, ar() * TAU, 0.8 + ar() * 0.4]; });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const bob = Math.sin(t * 1.6) * 6 * u, roll = Math.sin(t * 1.1) * 0.018;
          const T = XF(X0, WL + bob, S, roll);
          // sea surface hatching behind (moving)
          for (let k = 0; k < 7; k++) { const y = WL - 60 * u + k * 70 * u, off = (t * (30 + k * 6)) % 240; const pts = []; for (let i = 0; i <= 10; i++) pts.push([-120 + off + i * 130 * u, y + Math.sin(i * 1.7 + t * 1.5 + k) * 6]); Lr.add('wav', inkPath(pts, { seed: sd + 10 + k, t, w: 2.5 })); }
          ship(Lr, T, t, sd + 20, { sail: mode === 'hold' ? 0.75 : 1, full: mode === 'hold', s: S }, C);
          if (mode === 'hold') {
            // cut-away window in the hull side
            const cut = [[-380, -92], [380, -96], [400, 18], [220, 52], [-200, 54], [-370, 26]];
            Lr.add('hold', inkLoop(mapP(T, cut), { seed: sd + 40, t }));
            Lr.add('ink', inkPath(mapP(T, cut), { seed: sd + 40, t, closed: true, w: 6 }));
            for (let i = 0; i < 9; i++) Lr.add('soft', inkPath(mapP(T, [[-340 + i * 85, -90], [-344 + i * 85, 40]]), { seed: sd + 41 + i, t, w: 3 }));
            const ja = atOr(cues, 'jars', 0.4);
            slots.forEach((sl, i) => {
              const p = spring(lt, ja + i * 0.05, 0.4); if (p <= 0.01) return;
              const [jx, jy] = T(sl.x, sl.v);
              amphora(Lr, XF(jx, jy, S * sl.s * p, roll), sd + 60 + i * 7, t);
            });
            // under-water tint on the lower hull + waterline
            Lr.add('under', inkLoop(mapP(T, [[-470, 0], [470, 0], [452, -10], [410, 24], [220, 62], [-200, 64], [-390, 34], [-452, 0]]), { seed: sd + 45, t, smooth: false, amp: 0.6 }));
          }
          Lr.flush();
          // waterline + foam in front of the hull
          const wl = []; for (let i = 0; i <= 18; i++) { const x = X0 - 560 * S + i * 1120 * S / 18; wl.push([x, WL + Math.sin(i * 0.9 + t * 2.4) * 7]); }
          Lf.add('wav', inkPath(wl, { seed: sd + 80, t, w: 5 }));
          for (let k = 0; k < 4; k++) { const x = X0 + (-420 + k * 260) * S + Math.sin(t * 1.3 + k) * 20; Lf.add('foam', inkLoop(ellP(x, WL + 6, 40 * S, 10 * S, 10), { seed: sd + 90 + k, t })); }
          // lower frame: wave crests rolling across in front (fills y 1320-1920)
          for (let k = 0; k < 5; k++) {
            const y = WL + (200 + k * 150) * u; if (y > H + 40) break;
            const off = (t * (40 + k * 12) + k * 90) % (300 * u), pts = [];
            for (let i = 0; i <= 12; i++) pts.push([-200 * u + off + i * 120 * u, y + Math.sin(i * 1.3 + t * 1.8 + k) * (8 + k * 3)]);
            Lf.add('wav', inkPath(pts, { seed: sd + 100 + k, t, w: 3 + k * 0.8 }));
          }
          // foreground (fills y 1320-1920): rolling swells or a rocky shore
          const FG = P.fore || (mode === 'hold' ? 'rocks' : 'swell');
          if (FG === 'swell') {
            for (let k = 0; k < 3; k++) {
              const y0 = H * (0.74 + k * 0.09), amp = 22 + k * 12, off = t * (30 + k * 14) + k * 120, pts = [];
              for (let i = 0; i <= 14; i++) { const x = -80 + i * (W + 160) / 14; pts.push([x, y0 + Math.sin(i * 0.9 + off / 90) * amp]); }
              Lf.add(k === 2 ? 'sea3' : k === 1 ? 'sea2' : 'sea1', inkLoop(pts.concat([[W + 80, H + 60], [-80, H + 60]]), { seed: sd + 140 + k, t, smooth: false, amp: 1 }));
              Lf.add('ink', inkPath(pts, { seed: sd + 150 + k, t, w: 4 + k }));
              for (let i = 1; i < 14; i += 3) { const [x, y] = pts[i]; Lf.add('foam', inkLoop(ellP(x, y - 4, 38 + k * 10, 9 + k * 2, 10), { seed: sd + 160 + k * 5 + i, t })); }
            }
            // a drifting oar in the near swell
            const ox = W * 0.62 + Math.sin(t * 0.5) * 30, oy = H * 0.85 + Math.sin(t * 1.4) * 10, ro = -0.25 + Math.sin(t * 0.9) * 0.05;
            const O = XF(ox, oy, u, ro);
            Lf.add('wood', inkLoop(mapP(O, [[-260, -7], [150, -7], [160, -26], [290, -22], [300, 0], [290, 22], [160, 26], [150, 7], [-260, 7]]), { seed: sd + 170, t, smooth: false }));
            Lf.add('ink', inkPath(mapP(O, [[-260, -7], [150, -7], [160, -26], [290, -22], [300, 0], [290, 22], [160, 26], [150, 7], [-260, 7]]), { seed: sd + 170, t, closed: true, w: 4, smooth: false }));
          } else if (FG === 'rocks') {
            const rk = [[0.0, 0.8, 0.26, 0.11], [0.2, 0.9, 0.2, 0.08], [0.83, 0.78, 0.24, 0.13], [0.62, 0.93, 0.22, 0.07], [0.4, 0.98, 0.3, 0.06]];
            for (let k = 0; k < 2; k++) { const y0 = H * (0.76 + k * 0.08), pts = []; for (let i = 0; i <= 12; i++) pts.push([-60 + i * (W + 120) / 12, y0 + Math.sin(i * 1.1 + t * 1.4 + k) * 10]); Lf.add('foam', inkPath(pts, { seed: sd + 175 + k, t, w: 7 })); }
            rk.forEach(([x, y, w, h], i) => {
              const cxr = x * W, cyr = y * H, pts = [[cxr - w * W * 0.6, cyr + h * H], [cxr - w * W * 0.5, cyr - h * H * 0.3], [cxr - w * W * 0.2, cyr - h * H * 0.8], [cxr + w * W * 0.15, cyr - h * H], [cxr + w * W * 0.45, cyr - h * H * 0.5], [cxr + w * W * 0.6, cyr + h * H]];
              Lf.add('rock', inkLoop(pts, { seed: sd + 180 + i, t, amp: 1.2 }));
              Lf.add('ink', inkPath(pts, { seed: sd + 180 + i, t, closed: true, w: 6 }));
              for (let j = 0; j < 4; j++) Lf.add('rockD', inkPath([[cxr - w * W * 0.3 + j * w * W * 0.18, cyr - h * H * 0.5 + j * 10], [cxr - w * W * 0.38 + j * w * W * 0.18, cyr + h * H * 0.4]], { seed: sd + 190 + i * 4 + j, t, w: 3 }));
              const sp = (t * 0.7 + i * 0.37) % 1; if (sp < 0.5) Lf.add('foam', inkLoop(ellP(cxr - w * W * 0.3, cyr - h * H * 0.7 - sp * 80, 30 + sp * 50, 12 + sp * 16, 10), { seed: sd + 200 + i, t }));
            });
          }
          // almonds lens (hold, cue "almonds")
          if (mode === 'hold') {
            const aa = atOr(cues, 'almonds', dur * 0.6), pa = spring(lt, aa, 0.6);
            if (pa > 0.01) {
              const L = P.lens || {}, lx = (L.x ?? 0.3) * W, ly = (L.y ?? 0.3) * H, R = (L.r ?? 210) * u * pa;
              const [jx, jy] = T(-42, -110);
              Lf.add('ink', inkPath([[jx, jy], [lerp(jx, lx, 0.5), lerp(jy, ly, 0.5) + 20], [lx + R * 0.3, ly + R * 0.9]], { seed: sd + 120, t, w: 4 }));
              Lf.add('lensF', inkLoop(ellP(lx, ly, R, R, 24), { seed: sd + 121, t }));
              // jar mouth seen from above, full of almonds
              Lf.add('clay', inkLoop(ellP(lx, ly + R * 0.05, R * 0.82, R * 0.62, 20), { seed: sd + 122, t }));
              almonds.forEach(([ax, ay, rot, s], i) => {
                const x = lx + ax * R * 0.66, y = ly + R * 0.05 + ay * R * 0.48, sh = 1 + punch(lt, aa + 0.1 + i * 0.01) * 0.2;
                const pp = ellP(x, y, 22 * u * s * pa * sh, 12 * u * s * pa * sh, 10, rot);
                Lf.add('alm', inkLoop(pp, { seed: sd + 130 + i, t, amp: 0.8 }));
                Lf.add('almD', inkPath(pp, { seed: sd + 130 + i, t, closed: true, w: 2.5, amp: 0.8 }));
              });
              Lf.add('ink', inkPath(ellP(lx, ly + R * 0.05, R * 0.82, R * 0.62, 20), { seed: sd + 122, t, closed: true, w: 5 }));
              Lf.add('ink', inkPath(ellP(lx, ly, R, R, 24), { seed: sd + 121, t, closed: true, w: 9 }));
              Lf.add('ink', inkPath([[lx + R * 0.72, ly + R * 0.72], [lx + R * 1.12, ly + R * 1.12]], { seed: sd + 123, t, w: 22 }));
            }
          }
          Lf.flush();
          // crew on deck
          const fa = atOr(cues, 'four', dur * 0.3);
          sailors.forEach((c, i) => {
            const [x, y] = T(c.x, -100 - 2);
            const o = { x, y, face: c.face, since: lt, dir: c.dir ?? 20, emotion: null };
            c.rig.update(t, c.pose, o);
            const na = fa + i * (P.stagger ?? 0.16), pn = spring(lt, na, 0.35);
            nums[i].style.display = lt < na ? 'none' : '';
            nums[i].setAttribute('x', f1(x)); nums[i].setAttribute('y', f1(y - (P.crew_scale ?? 0.4) * u * 600 - 20 * u));
            nums[i].setAttribute('transform', `translate(${f1(x)} ${f1(y - 260 * u)}) scale(${pn.toFixed(3)}) translate(${f1(-x)} ${f1(-(y - 260 * u))})`);
          });
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // cups, spoons, jugs ----------------------------------------------------------------
  function kantharos(Lr, x, y, s, t, sd) {   // y = foot
    const T = XF(x, y, s);
    const bowl = [[-48, -100], [48, -100], [44, -62], [26, -40], [10, -32], [-10, -32], [-26, -40], [-44, -62]];
    Lr.add('glaze', inkLoop(mapP(T, bowl), { seed: sd, t }));
    Lr.add('glaze', inkLoop(mapP(T, [[-22, 0], [22, 0], [10, -14], [8, -34], [-8, -34], [-10, -14]]), { seed: sd + 1, t, smooth: false }));
    Lr.add('ink', inkPath(mapP(T, bowl), { seed: sd, t, closed: true, w: 4 }) + ' ' + inkPath(mapP(T, [[-22, 0], [22, 0]]), { seed: sd + 2, t, w: 4 }));
    Lr.add('ink', inkPath(mapP(T, [[-46, -96], [-74, -128], [-82, -96], [-40, -60]]), { seed: sd + 3, t, w: 5 }) + ' ' + inkPath(mapP(T, [[46, -96], [74, -128], [82, -96], [40, -60]]), { seed: sd + 4, t, w: 5 }));
    Lr.add('hi', inkPath(mapP(T, [[-30, -88], [-22, -54]]), { seed: sd + 5, t, w: 4 }));
    Lr.add('paper', inkLoop(mapP(T, [[-48, -100], [48, -100], [44, -92], [-44, -92]]), { seed: sd + 6, t, smooth: false }));
  }
  function spoon(Lr, x, y, s, t, sd, rot = -0.15) {
    const T = XF(x, y, s, rot);
    const bw = mapP(T, [[-30, 0], [-50, -14], [-78, -16], [-96, -6], [-96, 6], [-78, 16], [-50, 14]]);
    Lr.add('woodL', inkLoop(bw, { seed: sd, t }));
    Lr.add('ink', inkPath(bw, { seed: sd, t, closed: true, w: 4 }));
    const hd = mapP(T, [[-32, -4], [60, -6], [130, -7], [134, 0], [130, 7], [60, 6], [-32, 4]]);
    Lr.add('wood', inkLoop(hd, { seed: sd + 1, t, smooth: false }));
    Lr.add('ink', inkPath(hd, { seed: sd + 1, t, closed: true, w: 3.5, smooth: false }));
    Lr.add('soft', inkPath(mapP(T, [[-56, 4], [-80, 6]]), { seed: sd + 2, t, w: 3 }));
  }
  function guttus(Lr, x, y, s, t, sd) {   // y = foot
    const T = XF(x, y, s);
    const body = ellP(...T(0, -46), 50 * s, 42 * s, 16);
    Lr.add('glaze', inkLoop(body, { seed: sd, t }));
    Lr.add('ink', inkPath(body, { seed: sd, t, closed: true, w: 4 }));
    Lr.add('glaze', inkLoop(mapP(T, [[34, -62], [74, -86], [80, -78], [42, -48]]), { seed: sd + 1, t, smooth: false }));
    Lr.add('ink', inkPath(mapP(T, [[34, -62], [74, -86], [80, -78], [42, -48]]), { seed: sd + 1, t, closed: true, w: 3.5, smooth: false }));
    Lr.add('ink', inkPath(ellP(...T(0, -102), 22 * s, 18 * s, 12), { seed: sd + 2, t, closed: true, w: 6 }));
    Lr.add('hi', inkPath(mapP(T, [[-28, -64], [-30, -40]]), { seed: sd + 3, t, w: 4 }));
    Lr.add('red', inkPath(mapP(T, [[-46, -44], [0, -40], [46, -44]]), { seed: sd + 4, t, w: 3 }));
  }

  // -------------------------------------------------------------------------------------------- SHOTS.ky_cabin
  SH.ky_cabin = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = COL(), u = W / 1080, sd = seed * 1000 + 307;
      const root = el(svg, 'g');
      const Lr = layers(root, [['beam', C.woodD], ['woodL', C.woodL], ['wood', C.wood], ['woodD', C.woodD], ['clay', C.clay], ['lamp', C.clay], ['glow', INK.gold, { 'fill-opacity': 0.25 }], ['flame', INK.gold], ['shadow', INK.ink, { 'fill-opacity': 0.12 }],
        ['glaze', C.glaze], ['hi', INK.paperLight], ['soft', INK.inkSoft], ['paper', INK.paperLight], ['red', INK.red], ['ink', INK.ink]]);
      const LB = labels(svg, P.labels, W, H);
      const KG = el(svg, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const yB = 0.39 * H, yF = 0.58 * H, gy = (P.ground ?? 0.78) * H;
      const rows = [
        { cue: 'cups', y: yB + 120 * u, x0: 0.26, x1: 0.74, s: 0.95, fn: 'cup' },
        { cue: 'spoons', y: yB + 230 * u, x0: 0.22, x1: 0.78, s: 1.0, fn: 'spoon' },
        { cue: 'jugs', y: yF - 30 * u, x0: 0.2, x1: 0.8, s: 1.05, fn: 'jug' },
      ];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // ceiling beams (ship's cabin) + hanging lamp
          Lr.add('beam', inkLoop([[-20, 0.06 * H], [W + 20, 0.07 * H], [W + 20, 0.12 * H], [-20, 0.115 * H]], { seed: sd, t, smooth: false }));
          Lr.add('ink', inkPath([[-20, 0.115 * H], [W + 20, 0.12 * H]], { seed: sd + 1, t, w: 6 }));
          Lr.add('beam', inkLoop([[0.08 * W, 0.11 * H], [0.14 * W, 0.11 * H], [0.12 * W, gy], [0.05 * W, gy]], { seed: sd + 2, t, smooth: false }));
          Lr.add('beam', inkLoop([[0.86 * W, 0.11 * H], [0.92 * W, 0.11 * H], [0.95 * W, gy], [0.88 * W, gy]], { seed: sd + 3, t, smooth: false }));
          Lr.add('ink', inkPath([[0.14 * W, 0.11 * H], [0.12 * W, gy]], { seed: sd + 4, t, w: 5 }) + ' ' + inkPath([[0.86 * W, 0.11 * H], [0.88 * W, gy]], { seed: sd + 5, t, w: 5 }));
          const sw = Math.sin(t * 1.3) * 0.12, px = W * 0.62, py = 0.115 * H, L = 0.13 * H;
          const lx = px + Math.sin(sw) * L, ly = py + Math.cos(sw) * L;
          Lr.add('ink', inkPath([[px, py], [lx, ly - 20]], { seed: sd + 6, t, w: 4 }));
          Lr.add('glow', inkLoop(ellP(lx, ly + 10, 170 * u, 150 * u, 18), { seed: sd + 7, t }));
          Lr.add('lamp', inkLoop([[lx - 60 * u, ly], [lx + 50 * u, ly], [lx + 80 * u, ly + 14 * u], [lx + 40 * u, ly + 34 * u], [lx - 60 * u, ly + 30 * u]], { seed: sd + 8, t }));
          Lr.add('ink', inkPath([[lx - 60 * u, ly], [lx + 50 * u, ly], [lx + 80 * u, ly + 14 * u], [lx + 40 * u, ly + 34 * u], [lx - 60 * u, ly + 30 * u]], { seed: sd + 8, t, closed: true, w: 4 }));
          const fl = 1 + Math.sin(t * 9) * 0.15;
          Lr.add('flame', inkLoop([[lx + 74 * u, ly + 10 * u], [lx + 92 * u, ly - 30 * u * fl], [lx + 100 * u, ly + 8 * u]], { seed: sd + 9, t, amp: 1 }));
          // table: top, front apron, legs
          const top = [[0.14 * W, yB], [0.86 * W, yB], [0.96 * W, yF], [0.04 * W, yF]];
          Lr.add('woodL', inkLoop(top, { seed: sd + 10, t, smooth: false }));
          Lr.add('ink', inkPath(top, { seed: sd + 10, t, closed: true, w: 6, smooth: false }));
          for (let i = 1; i < 5; i++) Lr.add('soft', inkPath([[lerp(0.14, 0.04, 0) * W + 20, lerp(yB, yF, i / 5)], [W * 0.5, lerp(yB, yF, i / 5) + 4], [lerp(0.86, 0.96, i / 5) * W - 20, lerp(yB, yF, i / 5)]], { seed: sd + 11 + i, t, w: 2.5 }));
          const ap = [[0.04 * W, yF], [0.96 * W, yF], [0.96 * W, yF + 60 * u], [0.04 * W, yF + 60 * u]];
          Lr.add('wood', inkLoop(ap, { seed: sd + 20, t, smooth: false }));
          Lr.add('ink', inkPath(ap, { seed: sd + 20, t, closed: true, w: 6, smooth: false }));
          [[0.08, 0], [0.88, 0]].forEach(([q], i) => { const lg = [[q * W, yF + 60 * u], [(q + 0.05) * W, yF + 60 * u], [(q + 0.045) * W, gy], [(q + 0.005) * W, gy]]; Lr.add('woodD', inkLoop(lg, { seed: sd + 22 + i, t, smooth: false })); Lr.add('ink', inkPath(lg, { seed: sd + 22 + i, t, closed: true, w: 5, smooth: false })); });
          // floor planks (lower frame)
          for (let k = 0; k < 6; k++) { const y = gy + 30 * u + k * 80 * u; Lr.add('soft', inkPath([[-20, y], [W + 20, y + 6]], { seed: sd + 30 + k, t, w: 3 })); }
          for (let k = 0; k < 8; k++) { const x = (k + 0.5) / 8 * W; Lr.add('soft', inkPath([[x, gy + 10], [x + (k - 4) * 40 * u, H + 20]], { seed: sd + 40 + k, t, w: 2 })); }
          // a sack and an amphora on the floor (lower frame)
          amphora(Lr, XF(0.24 * W, H * 0.97, 1.25 * u, -0.05), sd + 50, t);
          amphora(Lr, XF(0.78 * W, H * 0.98, 1.3 * u, 0.06), sd + 58, t);
          // the four-sets
          rows.forEach((r, ri) => {
            const a = atOr(cues, r.cue, 0.4 + ri * 0.8);
            for (let i = 0; i < 4; i++) {
              const st = P.stagger ?? 0.08, p = spring(lt, a + i * st, 0.35); if (p <= 0.01) continue;
              const x = lerp(r.x0, r.x1, i / 3) * W, s = r.s * u * p * (1 + punch(lt, a + i * st) * 0.12);
              Lr.add('shadow', inkLoop(ellP(x + 10, r.y + 4, 60 * s, 14 * s, 12), { seed: sd + 60 + ri * 4 + i, t }));
              if (r.fn === 'cup') kantharos(Lr, x, r.y, s, t, sd + 100 + i * 10);
              else if (r.fn === 'spoon') spoon(Lr, x - 10 * u, r.y - 10 * u, s, t, sd + 150 + i * 10, -0.12);
              else guttus(Lr, x, r.y, s, t, sd + 200 + i * 10);
            }
          });
          Lr.flush();
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // -------------------------------------------------------------------------------------------- SHOTS.ky_museum
  SH.ky_museum = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = COL(), u = W / 1080, sd = seed * 1000 + 401;
      const root = el(svg, 'g');
      const Lr = layers(root, [['arch', mix(INK.paperDark, INK.stain, 0.2)], ['stone', INK.inkSoft, { 'fill-opacity': 0.35 }], ['beam', INK.paperLight, { 'fill-opacity': 0.4 }], ['wood', C.wood], ['woodD', C.woodD], ['soft', INK.inkSoft],
        ['ghost', C.ghost], ['case', mix(INK.paperLight, INK.blue, 0.12)], ['plinth', C.woodD], ['glaze', C.glaze], ['hi', INK.paperLight], ['paper', INK.paperLight], ['red', INK.red], ['ink', INK.ink]]);
      const LB = labels(svg, P.labels, W, H);
      const KG = el(svg, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const gy = (P.ground ?? 0.78) * H, cx = (P.case_x ?? 0.62) * W, cw = 540 * u, cTop = (P.case_top ?? 0.3) * H, shelf = (P.shelf ?? 0.49) * H;
      const plq = el(svg, 'text', { 'font-family': INK_FONT, 'font-size': 50 * u, fill: INK.ink, 'text-anchor': 'middle' }); plq.textContent = P.plaque || '';
      const G = P.ghosts || null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          // castle vault: a stone arch over the room
          const arch = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; arch.push([W / 2 + Math.cos(a) * W * 0.62, 0.36 * H + Math.sin(a) * 0.28 * H]); }
          Lr.add('ink', inkPath(arch, { seed: sd, t, w: 7 }));
          for (let i = 1; i < 10; i++) { const a = Math.PI + i / 10 * Math.PI; Lr.add('soft', inkPath([[W / 2 + Math.cos(a) * W * 0.62, 0.36 * H + Math.sin(a) * 0.28 * H], [W / 2 + Math.cos(a) * W * 0.7, 0.36 * H + Math.sin(a) * 0.33 * H]], { seed: sd + 1 + i, t, w: 3 })); }
          // spotlight beam on the hull (slowly breathing)
          const bl = 0.9 + Math.sin(t * 0.8) * 0.1;
          Lr.add('beam', inkLoop([[W * 0.44, 0.06 * H], [W * 0.56, 0.06 * H], [W * (0.5 + 0.42 * bl), 0.44 * H], [W * (0.5 - 0.42 * bl), 0.44 * H]], { seed: sd + 15, t, smooth: false }));
          // the reassembled hull on its scaffold (background)
          const hk = 0.98 * u, hx = W * 0.5, hy = 0.33 * H;
          const T = XF(hx, hy, hk);
          const keel = [[-500, -120], [-420, -10], [-200, 50], [0, 64], [200, 50], [420, -14], [510, -130]];
          Lr.add('wood', inkLoop(keel.concat([[400, -150], [0, -120], [-400, -144]]), { seed: sd + 20, t }));
          Lr.add('ink', inkPath(keel, { seed: sd + 21, t, w: 9 }));
          for (let i = 0; i < 15; i++) { const x = -440 + i * 63, yb = 60 - Math.pow(Math.abs(x) / 500, 2) * 160; Lr.add('woodD', inkPath(mapP(T, [[x, yb], [x - 6, yb - 90], [x + 4, yb - 200 - Math.sin(i) * 10]]), { seed: sd + 30 + i, t, w: 9 })); }
          for (let k = 0; k < 3; k++) Lr.add('soft', inkPath(mapP(T, [[-470, -100 + k * 30], [-200, 10 + k * 24], [0, 26 + k * 22], [200, 10 + k * 24], [480, -104 + k * 30]]), { seed: sd + 50 + k, t, w: 3 }));
          // scaffold
          for (let i = 0; i < 6; i++) { const x = -420 + i * 170; Lr.add('soft', inkPath(mapP(T, [[x, 40 - Math.pow(Math.abs(x) / 500, 2) * 120], [x, (gy - hy) / hk]]), { seed: sd + 60 + i, t, w: 4 })); }
          Lr.add('soft', inkPath(mapP(T, [[-460, 160], [460, 160]]), { seed: sd + 70, t, w: 4 }));
          // ghosts (outlined sailors standing behind the case, fading on "fade")
          if (G) {
            const ga = atOr(cues, G.at, 0.3), fa = atOr(cues, G.fade || 'fade', dur * 0.6);
            const op = clamp01((lt - ga) / 0.8) * (1 - clamp01((lt - fa) / 1.2)), rise = clamp01((lt - fa) / 1.2) * 60 * u;
            if (op > 0.01) {
              Lr.L.ghost.e.setAttribute('fill-opacity', f1(op * 0.85 * 100) / 100);
              for (let i = 0; i < 4; i++) {
                const x = cx - cw * 0.36 + i * cw * 0.24, y = cTop + 40 * u - rise + Math.sin(t * 1.2 + i) * 6, s = 1.05 * u, sw = Math.sin(t * 0.9 + i * 1.3) * 6;
                const head = ellP(x, y - 300 * s, 34 * s, 38 * s, 14);
                const body = [[x - 30 * s, y - 250 * s], [x + 30 * s, y - 250 * s], [x + 62 * s, y - 210 * s], [x + 54 * s, y - 60 * s], [x + 30 * s + sw, y], [x - 30 * s + sw, y], [x - 54 * s, y - 60 * s], [x - 62 * s, y - 210 * s]];
                Lr.add('ghost', inkPath(head, { seed: sd + 80 + i * 4, t, closed: true, w: 6 }) + ' ' + inkPath(body, { seed: sd + 81 + i * 4, t, closed: true, w: 6 }) + ' ' +
                  inkPath([[x - 50 * s, y - 200 * s], [x - 70 * s, y - 120 * s], [x - 56 * s, y - 70 * s]], { seed: sd + 82 + i * 4, t, w: 5 }) + ' ' +
                  inkDot(x - 11 * s, y - 304 * s, 5 * s, 6 * s, sd + 83 + i * 4, t) + ' ' + inkDot(x + 11 * s, y - 304 * s, 5 * s, 6 * s, sd + 84 + i * 4, t));
              }
            }
          }
          // display case + plinth
          const cs = [[cx - cw / 2, cTop], [cx + cw / 2, cTop], [cx + cw / 2, shelf], [cx - cw / 2, shelf]];
          Lr.add('case', inkLoop(cs, { seed: sd + 200, t, smooth: false, amp: 0.8 }));
          Lr.add('ink', inkPath(cs, { seed: sd + 200, t, closed: true, w: 6, smooth: false }));
          Lr.add('paper', inkPath([[cx - cw * 0.4, cTop + 30 * u], [cx - cw * 0.2, cTop + 120 * u]], { seed: sd + 201, t, w: 8 }) + ' ' + inkPath([[cx + cw * 0.28, cTop + 30 * u], [cx + cw * 0.4, cTop + 90 * u]], { seed: sd + 202, t, w: 6 }));
          const pl = [[cx - cw / 2 - 20 * u, shelf], [cx + cw / 2 + 20 * u, shelf], [cx + cw / 2, gy], [cx - cw / 2, gy]];
          Lr.add('plinth', inkLoop(pl, { seed: sd + 210, t, smooth: false }));
          Lr.add('ink', inkPath(pl, { seed: sd + 210, t, closed: true, w: 6, smooth: false }));
          if (P.plaque) {
            const py = shelf + 60 * u, pq = [[cx - 220 * u, py], [cx + 220 * u, py], [cx + 220 * u, py + 84 * u], [cx - 220 * u, py + 84 * u]];
            Lr.add('paper', inkLoop(pq, { seed: sd + 211, t, smooth: false }));
            Lr.add('ink', inkPath(pq, { seed: sd + 211, t, closed: true, w: 4, smooth: false }));
            plq.setAttribute('x', f1(cx)); plq.setAttribute('y', f1(py + 58 * u));
          }
          // the four cups on the shelf
          const ca = atOr(cues, 'cups', 0.2);
          for (let i = 0; i < 4; i++) {
            const p = spring(lt, ca + i * 0.1, 0.45); if (p <= 0.01) continue;
            kantharos(Lr, cx - cw * 0.36 + i * cw * 0.24, shelf - 8 * u, 0.95 * u * p * (1 + punch(lt, atOr(cues, 'hit', null)) * 0.1), t, sd + 300 + i * 10);
          }
          // floor (lower frame): stone flags
          for (let k = 0; k < 6; k++) { const y = gy + 20 * u + k * 70 * u; Lr.add('soft', inkPath([[-20, y], [W + 20, y + 4]], { seed: sd + 400 + k, t, w: 3 })); }
          for (let k = 0; k < 10; k++) { const x = (k + 0.5) / 10 * W; Lr.add('soft', inkPath([[x, gy + 8], [x + (k - 5) * 50 * u, H + 20]], { seed: sd + 410 + k, t, w: 2.5 })); }
          Lr.flush();
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // -------------------------------------------------------------------------------------------- SHOTS.ky_pirate
  SH.ky_pirate = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = COL(), u = W / 1080, sd = seed * 1000 + 503;
      const root = el(svg, 'g');
      const Lr = layers(root, [['wav', INK.inkSoft, { 'fill-opacity': 0.6 }], ['sail', C.sail], ['soft', INK.inkSoft], ['wood', C.wood], ['woodD', C.woodD], ['paper', INK.paperLight], ['dark', C.dark], ['dsail', C.darkSail], ['red', INK.red], ['ink', INK.ink], ['foam', INK.paperLight]]);
      const KG = el(svg, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const LB = labels(svg, P.labels, W, H);
      const Tr = P.trader || {}, Ga = P.galley || {};
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const twl = (Tr.wl ?? 0.56) * H, gwl = (Ga.wl ?? 0.6) * H;
          for (let k = 0; k < 6; k++) { const y = twl - 40 * u + k * 60 * u, off = (t * (24 + k * 6)) % 200; const pts = []; for (let i = 0; i <= 10; i++) pts.push([-120 + off + i * 130 * u, y + Math.sin(i * 1.7 + t * 1.5 + k) * 5]); Lr.add('wav', inkPath(pts, { seed: sd + 10 + k, t, w: 2.5 })); }
          // the trader (far, left), sailing slowly away
          const tx = (Tr.x ?? 0.26) * W + lt * 6 * u;
          ship(Lr, XF(tx, twl + Math.sin(t * 1.6) * 4, (Tr.s ?? 0.42) * u, Math.sin(t * 1.1) * 0.02), t, sd + 20, { sail: 1, s: (Tr.s ?? 0.42) * u }, C);
          // the galley rows in from the right
          const ga = atOr(cues, Ga.at, 0), pg = progIO(lt, ga, Ga.dur ?? Math.max(1, dur - ga));
          const gx = lerp(Ga.from ?? 1.3, Ga.to ?? 0.66, pg) * W;
          galley(Lr, XF(gx, gwl + Math.sin(t * 1.9) * 5, (Ga.s ?? 0.55) * u, Math.sin(t * 1.3) * 0.015, -1), t, sd + 60);
          for (let k = 0; k < 3; k++) Lr.add('foam', inkLoop(ellP(gx - (300 - k * 60) * (Ga.s ?? 0.55) * u, gwl + 8, 40 * u, 9 * u, 10), { seed: sd + 120 + k, t }));
          Lr.add('ink', inkPath([[gx - 360 * (Ga.s ?? 0.55) * u, gwl + 4], [gx + 360 * (Ga.s ?? 0.55) * u, gwl + 6]], { seed: sd + 130, t, w: 4 }));
          Lr.flush();
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
