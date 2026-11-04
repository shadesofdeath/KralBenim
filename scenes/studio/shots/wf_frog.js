// wf_frog: shots for the Stickstory Short "Wood frog" (2026-11-04): every winter the wood frog (Lithobates sylvaticus)
// freezes solid on the forest floor (heart stops, no breath, up to ~70 % of its body water turns to ice); its liver
// floods the cells with glucose so the ice stays outside the cells; in Alaska it stays frozen for more than six months,
// then thaws in spring and its heart beats again. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only
// (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Parametric: any "animal survives frozen / cold" story. Uses lh__lib.js (LH: kasif, label, person, front, calendar).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = label {text, x, y, at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}
//   frog = {x (0..1), s (scale, ~290 px long at 1), face: 1|-1}; gy: ground line 0..1 H; front: top of the snow bank
//
// SHOTS.wf_forest — snowy spruce forest floor. P: {mode: "hook"|"wide"|"months", gy, front, frog, trees: [[x, h, tone]],
//   kasif: K (hook), block: {w, h} (hook: the frog inside a block of ice), heart: [x, y, r] (hook: a heart over the
//   block that beats, then stops at cue "hit"), freezeAt: cue (wide: frost spreads over the frog), calendar: [x, y]
//   (months: a tear-off calendar nailed to a trunk, months fly off), months: ["NOV", ...], labels}
// SHOTS.wf_freeze — mode "close": a big frozen frog close-up, frost creeping over it, a heart-monitor line above that
//   beats and goes flat at cue "flat", breath puffs from the nostril stop at cue "breath". mode "poke": a hiker
//   crouches and prods the stiff frog with a twig; at cue "tip" it tips over like a stone. P: {mode, gy, front, frog, labels}
// SHOTS.wf_body — the frog as a big cut-away drawing on a lab bench: frost on the skin from cue "ice", the liver glows
//   at cue "liver" and gold sugar dots stream along the veins into the whole body. P: {gy, frog, labels}
// SHOTS.wf_cells — full-frame view through a microscope: round cells fill with gold sugar dots (cue "sugar"); from
//   cue "ice" blue ice crystals grow in the gaps between the cells and stop at the cell walls. P: {cy, r, labels}
// SHOTS.wf_meter — a giant frog-shaped glass standing in the snow; ice rises inside it to the mark (cue "fill"), a big
//   counter runs to the value. P: {gy, front, frog, value: 70, suffix: "%", labels}
// SHOTS.wf_pond — spring at a pond: mode "thaw": the frog's frost melts, its eyes clear, a heart pops above it and
//   beats from cue "heart"; mode "end": Kaşif waves and points, the frog croaks on the bank. P: {mode, gy, frog, kasif, labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const f3 = v => Math.round(v * 1000) / 1000;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const SERIF = 'Fraunces, Georgia, serif';
  const BODY = () => mix(INK.stain, INK.gold, 0.45);
  const BODY_D = () => mix(INK.stain, INK.ink, 0.25);
  const BELLY = () => mix(INK.paperLight, INK.gold, 0.25);
  const MASK = () => mix(INK.ink, INK.stain, 0.12);
  const FROST = () => mix(INK.paperLight, INK.blue, 0.22);
  const ICE = () => mix(INK.paperLight, INK.blue, 0.32);
  const ICE_D = () => mix(INK.blue, INK.ink, 0.3);
  const SNOW = () => mix(INK.paperLight, INK.blue, 0.06);
  const PINE = () => mix(INK.green, INK.ink, 0.45);
  const BARK = () => mix(INK.stain, INK.ink, 0.45);
  const LEAF = [() => mix(INK.stain, INK.red, 0.35), () => mix(INK.stain, INK.gold, 0.5), () => mix(INK.stain, INK.ink, 0.2)];
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));

  // ------------------------------------------------------------------ the wood frog (side view, sitting)
  // local units: face +x, ground y = 0, ~300 long, ~150 tall. Folded hind leg (banded thigh, shin, long webbed foot),
  // front leg with splayed toes, dark mask stripe from the snout through the eye to behind the eardrum, light lip line.
  // st: {face, frost 0..1, rot (deg), dy, sy, sac 0..1, xray: bool, sugar 0..1, glow 0..1, ice 0..1, blink: true, beat}
  const F_BODY = [[-125, -8], [-142, -48], [-120, -98], [-62, -132], [0, -146], [52, -142], [92, -128], [124, -104], [148, -86], [142, -70], [112, -58], [70, -44], [30, -30], [-30, -12], [-90, -4]];
  const F_BELLY = [[-90, -6], [-30, -14], [30, -32], [70, -46], [112, -60], [104, -50], [62, -32], [14, -12], [-48, -2]];
  const F_MASK = [[150, -86], [128, -100], [96, -112], [60, -116], [24, -110], [4, -94], [10, -72], [34, -66], [60, -78], [100, -80], [136, -78]];
  const F_THIGH = [-70, -50, 58, 30, -0.28];
  const F_SHIN = [[-16, -30], [-70, -22], [-114, -14]];
  const F_FOOT = [[-114, -9], [-70, -6], [-26, -4]];
  const F_TOES = [[[-26, -4], [4, -10]], [[-26, -4], [12, -3]], [[-26, -4], [10, 4]], [[-28, -3], [-4, 7]]];
  const F_ARM = [[56, -54], [78, -30], [72, -6]];
  const F_HAND = [[[72, -6], [98, -3]], [[72, -6], [92, 4]], [[70, -5], [58, 5]], [[70, -6], [48, 0]]];
  const F_SPOTS = [[-40, -122], [-92, -96], [10, -130], [-20, -100], [60, -132]];
  const F_SPARK = [[-100, -64], [-60, -112], [0, -132], [50, -124], [110, -100], [-20, -70], [30, -84], [-110, -30], [86, -60], [-60, -24], [20, -44], [-30, -104], [130, -84], [-130, -60]];
  const F_VEINS = [[[10, -70], [60, -86], [104, -104]], [[10, -70], [-30, -100], [-80, -116]], [[10, -70], [-40, -54], [-96, -44]], [[10, -70], [50, -48], [74, -14]], [[10, -70], [-60, -80], [-128, -60]]];
  function star(x, y, r, sd, t, w) {
    return [0, 1, 2, 3].map(i => { const a = i * Math.PI / 4 + 0.2; return inkPath([[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { w, seed: sd + i, t, amp: 0.4, taper: 0.5 }); }).join(' ');
  }
  const thighPts = (k) => inkEllipsePts(F_THIGH[0], F_THIGH[1], F_THIGH[2], F_THIGH[3], k, 12, F_THIGH[4], 0.03);
  // leg tubes in local units: [{pts, w}]
  const LEGS = [{ p: F_SHIN, w: 24 }, { p: F_FOOT, w: 15 }, { p: F_ARM.slice(0, 2), w: 21 }, { p: F_ARM.slice(1), w: 16 }];
  function frog(parent, sd) {
    const g = el(parent, 'g');
    const E = (c, x) => inkEl(g, c, x);
    const body = E(BODY()), belly = E(BELLY()), spots = E(BODY_D()), mask = E(MASK()), tymp = E(mix(INK.stain, INK.ink, 0.25)), lip = E(INK.paperLight);
    const frostB = E(FROST(), { 'fill-opacity': 0 }), lines = E();
    const veins = E(mix(INK.red, INK.stain, 0.3)), liver = E(mix(INK.red, INK.ink, 0.25)), liverG = E(INK.gold, { 'fill-opacity': 0 }), heartE = E(INK.red), dots = E(INK.gold), dotsR = E(INK.ink);
    const legInk = E(INK.ink), legFill = E(BODY()), thigh = E(BODY()), bands = E(BODY_D()), frostL = E(FROST(), { 'fill-opacity': 0 }), legLines = E(), pads = E(BODY_D());
    const eyeW = E(INK.gold), pupil = E(INK.ink), eyeR = E(), sac = E(BELLY()), sacR = E(), spark = E(INK.paperLight), sparkB = E(ICE_D());
    return {
      g,
      update(t, x, gy, s, st = {}) {
        const fc = st.face ?? 1, k = sd, fr = clamp01(st.frost || 0), lw = 5.5 / Math.pow(s, 0.6), amp = 1.3 / Math.sqrt(s);
        g.setAttribute('transform', `translate(${f1(x)} ${f1(gy + (st.dy || 0))}) rotate(${f1((st.rot || 0) * fc)}) scale(${f3(s * fc)} ${f3(s * (st.sy || 1))})`);
        const bodyD = inkLoop(F_BODY, { seed: k + 4, t, amp });
        body.setAttribute('d', bodyD);
        belly.setAttribute('d', inkLoop(F_BELLY, { seed: k + 6, t, amp }));
        spots.setAttribute('d', st.xray ? '' : F_SPOTS.map((q, i) => inkDot(q[0], q[1], 10 + (i % 2) * 4, 6 + (i % 3) * 2, k + 10 + i, t)).join(' '));
        mask.setAttribute('d', inkLoop(F_MASK, { seed: k + 7, t, amp }));
        tymp.setAttribute('d', inkCircle(36, -94, 14, k + 8, t, { fill: true }));
        lip.setAttribute('d', inkPath([[146, -76], [104, -70], [64, -64], [30, -58]], { w: 7, seed: k + 9, t, amp, taper: 0.6 }));
        frostB.setAttribute('fill-opacity', f3(0.55 * fr)); frostB.setAttribute('d', fr > 0.01 ? bodyD : '');
        lines.setAttribute('d', [inkPath(F_BODY, { w: lw, seed: k + 20, t, closed: true, amp }),
          inkPath([[148, -84], [118, -74], [78, -70]], { w: lw * 0.7, seed: k + 26, t, amp }),
          inkPath([[64, -136], [0, -140], [-70, -118], [-118, -82]], { w: lw * 0.5, seed: k + 27, t, amp }),
          inkCircle(36, -94, 14, k + 28, t, { w: lw * 0.6 }), inkDot(144, -92, 3, 2.4, k + 29, t)].join(' '));
        // x-ray organs (inside the body, under the legs)
        if (st.xray) {
          veins.setAttribute('d', F_VEINS.map((v, i) => inkPath(v, { w: 5, seed: k + 50 + i, t, amp })).join(' '));
          liver.setAttribute('d', inkLoop(inkEllipsePts(10, -70, 48, 24, k + 60, 12, -0.15, 0.08), { seed: k + 61, t, amp }));
          liverG.setAttribute('fill-opacity', f3(0.8 * clamp01(st.glow || 0)));
          liverG.setAttribute('d', inkLoop(inkEllipsePts(10, -70, 40, 18, k + 62, 12, -0.15, 0.05), { seed: k + 63, t, amp }));
          const hb = 1 + 0.12 * Math.max(0, Math.sin(t * 7)) * (st.beat ?? 1);
          heartE.setAttribute('d', inkCircle(86, -64, 12 * hb, k + 64, t, { fill: true }));
          const D = [], R = [], sg = clamp01(st.sugar || 0);
          if (sg > 0) {
            F_VEINS.forEach((v, i) => {
              for (let j = 0; j < 4; j++) {
                const f = (t * 0.7 + j / 4 + i * 0.13) % 1;
                if (f > sg) continue;
                const p = f < 0.5 ? [lerp(v[0][0], v[1][0], f * 2), lerp(v[0][1], v[1][1], f * 2)] : [lerp(v[1][0], v[2][0], f * 2 - 1), lerp(v[1][1], v[2][1], f * 2 - 1)];
                D.push(inkDot(p[0], p[1], 9, 9, k + 70 + i * 7 + j, t)); R.push(inkCircle(p[0], p[1], 9, k + 120 + i * 7 + j, t, { w: 2.4 }));
              }
            });
            for (let j = 0; j < 18; j++) {       // sugar settling everywhere in the body
              if (j / 18 > sg * 1.1 - 0.15) continue;
              const q = F_SPARK[j % F_SPARK.length], p = [q[0] + (hn(k, j) - 0.5) * 24, q[1] + (hn(k + 1, j) - 0.5) * 16];
              D.push(inkDot(p[0], p[1], 7, 7, k + 200 + j, t)); R.push(inkCircle(p[0], p[1], 7, k + 230 + j, t, { w: 2 }));
            }
          }
          dots.setAttribute('d', D.join(' ')); dotsR.setAttribute('d', R.join(' '));
        } else blank(veins, liver, liverG, heartE, dots, dotsR);
        // legs: ink tube under a body-coloured tube = outlined limb; banded thigh on top
        const th = thighPts(k + 1);
        legInk.setAttribute('d', LEGS.map((L, i) => inkPath(L.p, { w: L.w + lw * 2, seed: k + 80 + i, t, amp, taper: 0.05 })).join(' ') + ' ' +
          F_TOES.concat(F_HAND).map((p, i) => inkPath(p, { w: 6 + lw * 1.6, seed: k + 90 + i, t, amp, taper: 0.1 })).join(' '));
        legFill.setAttribute('d', LEGS.map((L, i) => inkPath(L.p, { w: L.w, seed: k + 80 + i, t, amp, taper: 0.05 })).join(' ') + ' ' +
          F_TOES.concat(F_HAND).map((p, i) => inkPath(p, { w: 6, seed: k + 90 + i, t, amp, taper: 0.1 })).join(' '));
        thigh.setAttribute('d', inkLoop(th, { seed: k + 5, t, amp }));
        bands.setAttribute('d', [[-104, -1], [-76, 0], [-48, 1]].map((q, i) => inkPath([[q[0] + 8, -76], [q[0] - 4, -24]], { w: 9, seed: k + 100 + i, t, amp, taper: 0.5 })).join(' ') + ' ' +
          [[-50, -30], [-86, -22]].map((q, i) => inkPath([[q[0] + 4, q[1] - 10], [q[0] - 2, q[1] + 10]], { w: 7, seed: k + 104 + i, t, amp, taper: 0.4 })).join(' '));
        frostL.setAttribute('fill-opacity', f3(0.55 * fr));
        frostL.setAttribute('d', fr > 0.01 ? inkLoop(th, { seed: k + 5, t, amp }) + ' ' + LEGS.map((L, i) => inkPath(L.p, { w: L.w, seed: k + 80 + i, t, amp, taper: 0.05 })).join(' ') : '');
        legLines.setAttribute('d', inkPath(th, { w: lw, seed: k + 21, t, closed: true, amp }) + ' ' + inkPath([[-20, -40], [-8, -28], [-18, -18]], { w: lw * 0.7, seed: k + 22, t, amp }));
        pads.setAttribute('d', F_TOES.concat(F_HAND).map((p, i) => inkDot(p[1][0], p[1][1], 5, 4.5, k + 110 + i, t)).join(' '));
        // eye: gold iris + dark horizontal pupil; frozen: cloudy pale eye, no pupil
        const blink = st.blink && ((t + sd * 0.37) % 2.6) < 0.13;
        eyeW.setAttribute('fill', fr > 0.55 ? FROST() : INK.gold);
        eyeW.setAttribute('d', inkCircle(88, -126, 20, k + 40, t, { fill: true }));
        eyeR.setAttribute('d', inkCircle(88, -126, 20, k + 41, t, { w: lw * 0.9 }) + ' ' + inkPath([[66, -136], [88, -150], [110, -136]], { w: lw * 0.8, seed: k + 46, t, amp }));
        pupil.setAttribute('d', blink ? inkPath([[68, -126], [108, -126]], { w: lw, seed: k + 42, t }) : fr > 0.55 ? '' : inkDot(91, -125, 12, 7, k + 43, t));
        // vocal sac (croak)
        const sc = clamp01(st.sac || 0);
        sac.setAttribute('d', sc > 0.05 ? inkCircle(104, -48, 30 * sc + 4, k + 44, t, { fill: true }) : '');
        sacR.setAttribute('d', sc > 0.05 ? inkCircle(104, -48, 30 * sc + 4, k + 45, t, { w: lw * 0.7 }) : '');
        // ice sparkles
        const ice = Math.max(fr, clamp01(st.ice || 0)), n = Math.round(ice * F_SPARK.length), S = [], SB = [];
        for (let i = 0; i < n; i++) {
          const q = F_SPARK[i], tw = 0.75 + 0.25 * Math.sin(t * 3 + i * 1.7), r = (9 + (i % 3) * 4) * tw;
          SB.push(star(q[0], q[1], r + 2, k + 300 + i * 5, t, lw * 0.9)); S.push(star(q[0], q[1], r, k + 300 + i * 5, t, lw * 0.5));
        }
        sparkB.setAttribute('d', SB.join(' ')); spark.setAttribute('d', S.join(' '));
      },
    };
  }
  // the frog silhouette in local units (several subpaths; put each in its own clipPath child)
  const frogClipParts = () => [inkLoop(F_BODY, { seed: 3, t: 0, amp: 0 }), inkLoop(thighPts(4), { seed: 4, t: 0, amp: 0 })].concat(LEGS.map((L, i) => inkPath(L.p, { w: L.w, seed: 5 + i, t: 0, amp: 0, taper: 0.05 })));
  const frogClip = () => frogClipParts().join(' ');

  // ------------------------------------------------------------------ spruce with snow on its tiers
  function spruce(parent, sd, snowy = true) {
    const trunk = inkEl(parent, BARK()), fill = inkEl(parent, PINE()), snow = inkEl(parent, SNOW()), lines = inkEl(parent);
    return {
      update(t, x, gy, h, tone = 0) {
        fill.setAttribute('fill', mix(PINE(), INK.paper, tone)); trunk.setAttribute('fill', mix(BARK(), INK.paper, tone));
        const sw = Math.sin(t * 0.9 + sd) * h * 0.006, n = 5, F = [], S = [], L = [];
        trunk.setAttribute('d', inkLoop(rect(x - h * 0.03, gy - h * 0.25, x + h * 0.03, gy + 6), { seed: sd, t, smooth: false, amp: 0.8 }));
        for (let i = 0; i < n; i++) {
          const yb = gy - h * 0.14 - i * h * 0.17, yt = yb - h * 0.3, wb = h * (0.3 - i * 0.05), dx = sw * (i + 1);
          const tri = [[x - wb + dx * 0.5, yb], [x + dx, yt], [x + wb + dx * 0.5, yb], [x + dx * 0.5, yb - h * 0.03]];
          F.push(inkLoop(tri, { seed: sd + 10 + i, t, smooth: false, amp: 0.9 }));
          L.push(inkPath(tri.slice(0, 3), { w: tone > 0.4 ? 3 : 4.5, seed: sd + 20 + i, t, smooth: false, amp: 0.9 }));
          const cap = [[lerp(x - wb, x, 0.25) + dx * 0.6, lerp(yb, yt, 0.25)], [x + dx, yt + 4], [lerp(x + wb, x, 0.25) + dx * 0.6, lerp(yb, yt, 0.25)], [lerp(x + wb, x, 0.4) + dx * 0.6, lerp(yb, yt, 0.25) + h * 0.03], [x + dx * 0.7, lerp(yb, yt, 0.35)], [lerp(x - wb, x, 0.4) + dx * 0.6, lerp(yb, yt, 0.25) + h * 0.035]];
          if (snowy) S.push(inkLoop(cap, { seed: sd + 30 + i, t, amp: 0.8 }));
        }
        fill.setAttribute('d', F.join(' ')); snow.setAttribute('d', S.join(' ')); lines.setAttribute('d', L.join(' '));
      },
    };
  }

  // falling snow (deterministic flakes)
  function snowfall(parent, sd, n = 40) {
    const f = inkEl(parent, INK.paperLight), r = inkEl(parent, mix(INK.blue, INK.inkSoft, 0.3));
    return {
      update(t, W, top, bot, k = 1) {
        const F = [], R = [];
        for (let i = 0; i < n * k; i++) {
          const sp = 60 + hn(sd, i) * 70, rr = 5 + hn(sd + 1, i) * 6, span = bot - top;
          const y = top + ((hn(sd + 2, i) * span + t * sp) % span), x = hn(sd + 3, i) * W + Math.sin(t * 0.8 + i) * 24;
          F.push(inkCircle(x, y, rr, sd + 10 + i, t, { fill: true, n: 8 })); R.push(inkCircle(x, y, rr, sd + 10 + i, t, { w: 1.6, n: 8 }));
        }
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }

  // brown leaf litter on the ground line
  function litter(parent, sd) {
    const E = LEAF.map(c => inkEl(parent, c())), rib = inkEl(parent);
    return {
      update(t, x0, x1, y, n = 18, sc = 1) {
        const D = [[], [], []], R = [];
        for (let i = 0; i < n; i++) {
          const x = lerp(x0, x1, (i + hn(sd, i) * 0.8) / n), yy = y + (hn(sd + 1, i) - 0.4) * 34 * sc, a = (hn(sd + 2, i) - 0.5) * 1.4 + Math.sin(t * 0.7 + i) * 0.03;
          const l = (34 + hn(sd + 3, i) * 18) * sc, w = l * 0.42, c = Math.cos(a), s = Math.sin(a);
          const P = [[-l, 0], [-l * 0.3, -w], [l * 0.5, -w * 0.7], [l, 0], [l * 0.4, w * 0.8], [-l * 0.4, w * 0.7]].map(q => [x + q[0] * c - q[1] * s, yy + q[0] * s + q[1] * c]);
          D[i % 3].push(inkLoop(P, { seed: sd + 10 + i, t, amp: 0.6 }));
          R.push(inkPath(P, { w: 2.8, seed: sd + 40 + i, t, closed: true, amp: 0.6 }), inkPath([P[0], P[3]], { w: 2, seed: sd + 70 + i, t, amp: 0.5 }));
        }
        E.forEach((e, i) => e.setAttribute('d', D[i].join(' '))); rib.setAttribute('d', R.join(' '));
      },
    };
  }

  // foreground down to the frame bottom: snow bank, a fallen snow-capped log, big leaves, twigs, twinkles
  // o: {log: true, flip: false (log rises to the left instead of the right)}
  function snowFront(parent, sd) {
    const E = (c, x) => inkEl(parent, c, x);
    const far = E(mix(SNOW(), INK.blue, 0.08)), fill = E(SNOW()), hatch = E(mix(INK.blue, INK.paperLight, 0.35));
    const logF = E(mix(BARK(), INK.paperDark, 0.25)), endF = E(mix(INK.stain, INK.paperLight, 0.35)), logL = E(), logCap = E(SNOW()), logCapR = E(mix(INK.blue, INK.inkSoft, 0.3));
    const low = E(mix(SNOW(), INK.paperLight, 0.5)), lowR = E();
    const twigs = E(BARK()), lv = litter(parent, sd + 50), big = litter(parent, sd + 80), edge = E(), tw = E(INK.paperLight), twB = E(ICE_D());
    return {
      update(t, W, H, top, o = {}) {
        const prof = (y0, a, ph) => { const P = []; for (let i = 0; i <= 12; i++) P.push([-40 + i * (W + 80) / 12, y0 + Math.sin(i * 1.3 + ph) * a + hn(sd + ph, i) * a * 0.6]); return P; };
        const P0 = prof(top - 30, 18, 2), P1 = prof(top + 40, 26, 0);
        far.setAttribute('d', inkLoop(P0.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd, t, amp: 0.8 }));
        fill.setAttribute('d', inkLoop(P1.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 1, t, amp: 0.8 }));
        const HC = [];
        for (let i = 0; i < 12; i++) { const x = hn(sd + 2, i) * W, y = top + 90 + hn(sd + 3, i) * 120; HC.push(inkPath([[x - 60, y], [x + 60, y + 6]], { w: 3, seed: sd + 10 + i, t, amp: 0.6 })); }
        hatch.setAttribute('d', HC.join(' '));
        const u = W / 1080, fl = o.flip ? -1 : 1, X = x => o.flip ? W - x : x;
        if (o.log !== false) {
          // fallen log lying across the bank, cut end towards the middle
          const a = [X(-80 * u), top + 300 * u], b = [X(W * 0.7), top + 200 * u], th = 120 * u;
          const dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.hypot(dx, dy), nx = -dy / ln * th / 2, ny = dx / ln * th / 2;
          const body = [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]];
          logF.setAttribute('d', inkLoop(body, { seed: sd + 200, t, smooth: false, amp: 1 }));
          const ring = inkEllipsePts(b[0], b[1], th * 0.28, th * 0.52, sd + 201, 12, Math.atan2(dy, dx), 0.05);
          endF.setAttribute('d', inkLoop(ring, { seed: sd + 202, t, amp: 0.8 }));
          const LL = [inkPath([body[0], body[1]], { w: 6, seed: sd + 203, t }), inkPath([body[3], body[2]], { w: 6, seed: sd + 204, t }), inkPath(ring, { w: 5, seed: sd + 205, t, closed: true })];
          for (let r = 1; r < 3; r++) LL.push(inkPath(inkEllipsePts(b[0], b[1], th * 0.28 * r / 3, th * 0.52 * r / 3, sd + 206 + r, 10, Math.atan2(dy, dx), 0.08), { w: 3, seed: sd + 208 + r, t, closed: true }));
          for (let i = 0; i < 7; i++) { const f = 0.08 + i * 0.12, c = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)], q = (hn(sd + 9, i) - 0.5) * 0.6; LL.push(inkPath([[c[0] + nx * (0.5 + q), c[1] + ny * (0.5 + q)], [c[0] + dx / ln * 70 * u + nx * (0.3 + q), c[1] + dy / ln * 70 * u + ny * (0.3 + q)]], { w: 3.5, seed: sd + 220 + i, t })); }
          const st = [lerp(a[0], b[0], 0.45), lerp(a[1], b[1], 0.45)];
          LL.push(inkPath([[st[0] - nx * 0.8, st[1] - ny * 0.8], [st[0] - nx * 1.6 + fl * 30 * u, st[1] - ny * 1.6 - 30 * u]], { w: 16 * u, seed: sd + 240, t, taper: 0.4 }));
          logL.setAttribute('d', LL.join(' '));
          const cap = []; for (let i = 0; i <= 10; i++) { const f = i / 10 * 0.95; cap.push([lerp(a[0], b[0], f) - nx * 1.02, lerp(a[1], b[1], f) - ny * 1.02 - (14 + Math.sin(i * 1.7) * 8) * u]); }
          const capB = []; for (let i = 10; i >= 0; i--) { const f = i / 10 * 0.95; capB.push([lerp(a[0], b[0], f) - nx * 0.6, lerp(a[1], b[1], f) - ny * 0.6]); }
          logCap.setAttribute('d', inkLoop(cap.concat(capB), { seed: sd + 250, t, amp: 0.8 }));
          logCapR.setAttribute('d', inkPath(cap, { w: 4, seed: sd + 251, t }));
        } else blank(logF, endF, logL, logCap, logCapR);
        // a low snow lip in front of the log, big leaves on it
        const P2 = prof(top + 330 * u, 22, 4);
        low.setAttribute('d', inkLoop(P2.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 260, t, amp: 0.8 }));
        lowR.setAttribute('d', inkPath(P2, { w: 6, seed: sd + 261, t }));
        const TW = [];
        [0.12, 0.42, 0.86].forEach((q, i) => { const x = X(q * W), y = top + 360 * u, sw = Math.sin(t * 1.4 + i) * 8; TW.push(inkPath([[x, y + 60], [x + sw, y - 90], [x + fl * 40 + sw, y - 160]], { w: 9, seed: sd + 30 + i, t }), inkPath([[x + sw * 0.6, y - 40], [x - fl * 50 + sw, y - 100]], { w: 6, seed: sd + 40 + i, t })); });
        twigs.setAttribute('d', TW.join(' '));
        lv.update(t, 0, W, top + 60, 12, 1.4);
        big.update(t, -40, W + 40, H - 220 * u, 7, 2.8);
        edge.setAttribute('d', inkPath(P1, { w: 6, seed: sd + 5, t }) + ' ' + inkPath(P0, { w: 3.5, seed: sd + 6, t }));
        const T = [], TB = [];
        for (let i = 0; i < 7; i++) { const ph = (t * 0.7 + hn(sd + 7, i)) % 1, r = 18 * Math.sin(ph * Math.PI); if (r < 2) continue; const x = hn(sd + 8, i) * W, y = top + 380 * u + hn(sd + 9, i) * (H - top - 560 * u); TB.push(star(x, y, r + 2, sd + 100 + i * 4, t, 6)); T.push(star(x, y, r, sd + 100 + i * 4, t, 3.5)); }
        tw.setAttribute('d', T.join(' ')); twB.setAttribute('d', TB.join(' '));
      },
    };
  }

  // a block of ice (front face + top + side, frost crust, cracks, glint sweeping across), drawn over what it holds
  function iceBlock(parent, sd) {
    const side = inkEl(parent, mix(ICE(), INK.blue, 0.25), { 'fill-opacity': 0.75 }), top = inkEl(parent, mix(ICE(), INK.paperLight, 0.5), { 'fill-opacity': 0.85 }), front = inkEl(parent, ICE(), { 'fill-opacity': 0.36 });
    const glint = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.55 }), hi = inkEl(parent, INK.paperLight), crackW = inkEl(parent, INK.paperLight), crack = inkEl(parent, ICE_D()), crust = inkEl(parent, INK.paperLight), crustR = inkEl(parent, mix(INK.blue, INK.inkSoft, 0.2)), rim = inkEl(parent, ICE_D());
    return {
      update(t, cx, gy, w, h, k = 1) {
        if (k <= 0.01) { blank(side, top, front, glint, hi, crackW, crack, crust, crustR, rim); return; }
        const hh = h * k, x0 = cx - w / 2, x1 = cx + w / 2, y0 = gy - hh, d = w * 0.12;
        const F = rect(x0, y0, x1, gy), T = [[x0, y0], [x1, y0], [x1 + d, y0 - d * 0.8], [x0 + d, y0 - d * 0.8]], S = [[x1, y0], [x1 + d, y0 - d * 0.8], [x1 + d, gy - d * 0.8], [x1, gy]];
        front.setAttribute('d', inkLoop(F, { seed: sd, t, smooth: false, amp: 1 }));
        top.setAttribute('d', inkLoop(T, { seed: sd + 1, t, smooth: false, amp: 1 }));
        side.setAttribute('d', inkLoop(S, { seed: sd + 2, t, smooth: false, amp: 1 }));
        const gp = ((t * 0.35) % 1.4) - 0.2, gx = lerp(x0 - w * 0.2, x1, gp);
        glint.setAttribute('d', gp > -0.1 && gp < 1.1 ? inkLoop([[Math.max(x0, gx), y0 + 4], [Math.min(x1, gx + w * 0.12), y0 + 4], [Math.min(x1, Math.max(x0, gx + w * 0.12 - hh * 0.4)), gy - 4], [Math.max(x0, gx - hh * 0.4), gy - 4]], { seed: sd + 3, t, smooth: false, amp: 0.6 }) : '');
        hi.setAttribute('d', [inkPath([[x0 + w * 0.08, y0 + hh * 0.12], [x0 + w * 0.08, y0 + hh * 0.5]], { w: 8, seed: sd + 4, t }), inkPath([[x0 + w * 0.15, y0 + hh * 0.1], [x0 + w * 0.3, y0 + hh * 0.1]], { w: 6, seed: sd + 5, t }), inkPath([[x1 - w * 0.1, gy - hh * 0.3], [x1 - w * 0.1, gy - hh * 0.12]], { w: 6, seed: sd + 6, t })].join(' '));
        // cracks: a white shine line next to a dark crack
        const C1 = [[x0 + w * 0.62, y0], [x0 + w * 0.68, y0 + hh * 0.16], [x0 + w * 0.6, y0 + hh * 0.3], [x0 + w * 0.7, y0 + hh * 0.44]];
        const C2 = [[x1, y0 + hh * 0.55], [x1 - w * 0.12, y0 + hh * 0.62], [x1 - w * 0.08, y0 + hh * 0.74], [x1 - w * 0.2, y0 + hh * 0.8]];
        const C3 = [[x0, y0 + hh * 0.3], [x0 + w * 0.1, y0 + hh * 0.36], [x0 + w * 0.06, y0 + hh * 0.46]];
        crackW.setAttribute('d', [C1, C2, C3].map((c, i) => inkPath(c.map(p => [p[0] + 5, p[1] + 3]), { w: 6, seed: sd + 30 + i, t, smooth: false, amp: 0.5 })).join(' '));
        crack.setAttribute('d', [C1, C2, C3].map((c, i) => inkPath(c, { w: 4, seed: sd + 33 + i, t, smooth: false, amp: 0.5 })).join(' ') + ' ' + inkPath([C1[2], [C1[2][0] - w * 0.08, C1[2][1] + hh * 0.06]], { w: 3, seed: sd + 36, t, smooth: false }));
        // frost crust: bumpy white along the top edge and the bottom corners
        const CR = [], CRR = [];
        const crustAlong = (pa, pb, n, r0, s0) => { for (let i = 0; i < n; i++) { const f = (i + 0.5) / n, x = lerp(pa[0], pb[0], f), y = lerp(pa[1], pb[1], f), r = r0 * (0.6 + hn(sd + s0, i) * 0.7); CR.push(inkLoop(inkEllipsePts(x, y + (hn(sd + s0 + 1, i) - 0.5) * r, r * 1.3, r * 0.8, sd + s0 + i, 7, hn(sd, i), 0.25), { seed: sd + s0 + i, t, amp: 0.6 })); } };
        crustAlong([x0, y0], [x1, y0], 22, 12, 100); crustAlong([x1, y0], [x1 + d, y0 - d * 0.8], 5, 11, 150); crustAlong([x0, y0], [x0, y0 + hh * 0.25], 6, 10, 170);
        crustAlong([x0, gy], [x0 + w * 0.3, gy], 9, 14, 200); crustAlong([x1 - w * 0.25, gy], [x1 + d, gy - d * 0.8], 9, 13, 250);
        crust.setAttribute('d', CR.join(' ')); crustR.setAttribute('d', '');
        rim.setAttribute('d', [F, T, S].map((p, i) => inkPath(p, { w: 6, seed: sd + 10 + i, t, closed: true, smooth: false, amp: 1 })).join(' '));
      },
    };
  }

  // a hand-drawn heart that beats; dead: 0..1 greys it, cracks it and draws a flatline under it
  function heartIcon(parent, sd) {
    const rays = inkEl(parent, INK.gold), f = inkEl(parent, INK.red), r = inkEl(parent), hl = inkEl(parent, INK.paperLight), fline = inkEl(parent, INK.red);
    const pts = (cx, cy, s) => { const P = []; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2, x = 16 * Math.pow(Math.sin(a), 3), y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a); P.push([cx + x * s, cy - y * s]); } return P; };
    return {
      update(t, cx, cy, size, beat, dead = 0, k = 1, glow = 0, flat = 0) {
        if (k <= 0.01) { blank(rays, f, r, hl, fline); return; }
        const s = size / 16 * k * (1 + 0.14 * beat), P = pts(cx, cy, s);
        f.setAttribute('fill', mix(INK.red, INK.inkSoft, 0.75 * dead));
        f.setAttribute('d', inkLoop(P, { seed: sd, t, amp: 1 }));
        const crack = [[cx + size * 0.02, cy - size * 0.5], [cx - size * 0.16, cy - size * 0.18], [cx + size * 0.14, cy + size * 0.06], [cx - size * 0.08, cy + size * 0.32], [cx + size * 0.02, cy + size * 0.6]];
        r.setAttribute('d', inkPath(P, { w: 6, seed: sd + 1, t, closed: true, amp: 1 }) + (dead > 0.5 ? ' ' + inkPath(crack, { w: size * 0.09, seed: sd + 2, t, smooth: false, amp: 0.6 }) : ''));
        hl.setAttribute('d', dead > 0.5 ? inkPath(crack.map(p => [p[0] + size * 0.06, p[1] + size * 0.02]), { w: size * 0.04, seed: sd + 3, t, smooth: false, amp: 0.6 }) : inkPath([[cx - size * 0.62 * k, cy - size * 0.28 * k], [cx - size * 0.4 * k, cy - size * 0.58 * k]], { w: size * 0.1, seed: sd + 4, t }));
        // flatline: one last beat on the left, then flat
        if (flat > 0.01) {
          const y = cy + size * 1.35, x0 = cx - size * 1.7, x1 = cx + size * 1.7, xe = lerp(x0, x1, clamp01(flat));
          const L = [[x0, y], [x0 + size * 0.3, y], [x0 + size * 0.42, y - size * 0.5], [x0 + size * 0.56, y + size * 0.3], [x0 + size * 0.68, y], [xe, y]].filter(p => p[0] <= xe + 0.1);
          fline.setAttribute('d', inkPath(L, { w: 8, seed: sd + 5, t, smooth: false, amp: 0.5, taper: 0 }) + ' ' + inkDot(xe, y, 10, 10, sd + 6, t));
        } else fline.setAttribute('d', '');
        const RY = [];
        if (glow > 0.01) for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.3, r0 = size * 1.25, r1 = size * (1.45 + 0.35 * glow + 0.1 * beat); RY.push(inkPath([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], { w: 9, seed: sd + 10 + i, t })); }
        rays.setAttribute('d', RY.join(' '));
      },
    };
  }

  // a heart-monitor trace: beats scroll left from the write head; no new beats after `stop`
  function ecg(parent, sd) {
    const band = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.85 }), bandR = inkEl(parent), tr = inkEl(parent, INK.red), head = inkEl(parent, INK.red);
    return {
      update(t, lt, x0, x1, y, amp, stop, period = 0.9) {
        band.setAttribute('d', inkLoop(rect(x0 - 30, y - amp * 1.4, x1 + 30, y + amp * 0.9), { seed: sd, t, smooth: false, amp: 1 }));
        bandR.setAttribute('d', inkPath(rect(x0 - 30, y - amp * 1.4, x1 + 30, y + amp * 0.9), { w: 5, seed: sd + 1, t, closed: true, smooth: false, amp: 1 }));
        const v = 380, P = [[x0, y]], beats = [];
        for (let b = Math.floor((lt - (x1 - x0) / v) / period) - 1; b * period <= lt; b++) { const tb = b * period; if (tb < stop && tb <= lt) beats.push(x1 - (lt - tb) * v); }
        beats.sort((a, b) => a - b).forEach(bx => { if (bx < x0 + 20 || bx > x1 - 10) return; P.push([bx - 22, y], [bx - 10, y - amp * 0.2], [bx, y + amp * 0.35], [bx + 12, y - amp], [bx + 24, y + amp * 0.5], [bx + 34, y]); });
        P.push([x1, y]);
        tr.setAttribute('d', inkPath(P, { w: 7, seed: sd + 2, t, smooth: false, amp: 0.6, taper: 0 }));
        head.setAttribute('d', inkDot(x1, y, 11, 11, sd + 3, t));
      },
    };
  }

  // shock ticks round a head
  const ticks = (cx, cy, sc, sd, t) => [[-1, -0.9], [0, -1.2], [1, -0.9]].map(([u, v], i) => inkPath([[cx + u * 80 * sc, cy + v * 80 * sc], [cx + u * 115 * sc, cy + v * 112 * sc]], { w: 6 * sc, seed: sd + i, t, amp: 0.4 })).join(' ');

  // ------------------------------------------------------------------ SHOTS.wf_forest
  SH.wf_forest = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 211, u = W / 1080, mode = P.mode || 'hook';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.583) * H, fy = (P.front ?? 0.67) * H;
      const TR = P.trees || (mode === 'hook' ? [[0.08, 760, 0.35], [0.95, 820, 0.3], [0.55, 560, 0.6]] : mode === 'wide' ? [[0.06, 820, 0.2], [0.3, 560, 0.55], [0.52, 640, 0.45], [0.75, 520, 0.6], [0.94, 880, 0.15]] : [[0.12, 700, 0.4], [0.45, 520, 0.6], [0.8, 900, 0.1]]);
      const trees = TR.map((q, i) => ({ q, s: spruce(el(root, 'g'), sd + 10 + i * 40) }));
      const fall = snowfall(el(root, 'g'), sd + 300, 36);
      const lit = litter(el(root, 'g'), sd + 330);
      const cal = mode === 'months' ? L.calendar(el(root, 'g'), sd + 360) : null;
      const FR = Object.assign(mode === 'hook' ? { x: 0.33, s: 1.25, face: 1 } : mode === 'wide' ? { x: 0.5, s: 1.15, face: 1 } : { x: 0.34, s: 1.2, face: 1 }, P.frog || {});
      const fg = frog(el(root, 'g'), sd + 400);
      const mound = mode === 'months' ? inkEl(root, SNOW()) : null, moundR = mode === 'months' ? inkEl(root) : null;
      const blk = mode === 'hook' ? iceBlock(el(root, 'g'), sd + 500) : null;
      const ht = mode === 'hook' ? heartIcon(el(root, 'g'), sd + 540) : null;
      const ring = mode === 'wide' ? inkEl(root, ICE_D()) : null, ringW = mode === 'wide' ? inkEl(root, INK.paperLight) : null;
      const K = Object.assign({ x: 0.76, y: 0.64, scale: 1.25, pose: 'shock', face: 'left', emotion: 'surprised' }, P.kasif || {});
      const kas = mode === 'hook' && P.kasif !== false ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const tk = inkEl(root);
      const front = snowFront(el(root, 'g'), sd + 600);
      const LB = labels(root, P.labels, W, H);
      const MONTHS = P.months || ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          trees.forEach(({ q, s }) => s.update(t, q[0] * W, gy + 10 * u, q[1] * u, q[2]));
          fall.update(t, W, 0.08 * H, fy + 60 * u);
          lit.update(t, 0.05 * W, 0.95 * W, gy + 6 * u, 20, 1);
          const hit = atOr(cues, 'hit', dur * 0.4);
          if (mode === 'hook') {
            const B = P.block || {}, bw = (B.w ?? 470) * u, bh = (B.h ?? 320) * u, bx = FR.x * W + 10 * u;
            fg.update(t, FR.x * W, gy, FR.s * u, { face: FR.face, frost: P.frost ?? 0.5 });
            blk.update(t, bx, gy + 4 * u, bw, bh, spring(lt, 0, 0.5));
            const Hh = P.heart || [FR.x + 0.02, 0.4, 72], dead = lt > hit ? 1 : 0;
            const beat = lt < hit ? Math.max(0, Math.sin(lt * 9)) : 0;
            ht.update(t, Hh[0] * W, Hh[1] * H, Hh[2] * u, beat + 0.6 * punch(lt, hit, 0.6), dead, spring(lt, 0.05, 0.5), 0, lt > hit ? 0.25 + 0.75 * progIO(lt, hit, 0.7) : 0);
            const r = kas ? kas.update(lt, t, cues) : null;
            if (r) { const ks = (K.scale ?? 1) * u, kf = K.face === 'left' ? -1 : 1, hd = [K.x * W + kf * ks * r.head[0], K.y * H + ks * r.head[1]]; tk.setAttribute('d', lt > 0.15 ? ticks(hd[0], hd[1] - 20 * ks, ks, sd + 700, t) : ''); }
          } else if (mode === 'wide') {
            const fz = atOr(cues, 'freeze', dur * 0.4), fr = progIO(lt, fz, 1.1);
            fg.update(t, FR.x * W, gy, FR.s * u, { face: FR.face, frost: fr, blink: fr < 0.3 });
            const rr = 300 * u * (0.6 + 0.4 * fr);
            const RG = (w, r0) => Array.from({ length: 9 }, (_, i) => { const a = i / 9 * Math.PI * 2 + 0.2 + t * 0.08, cx = FR.x * W - 10 * u, cy = gy - 90 * u; return star(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.5, r0 * u * fr * (0.85 + 0.15 * Math.sin(t * 3 + i)), sd + 800 + i * 4, t, w); }).join(' ');
            ring.setAttribute('d', fr > 0.02 ? RG(13, 52) : ''); ringW.setAttribute('d', fr > 0.02 ? RG(6, 48) : '');
            tk.setAttribute('d', '');
          } else {
            // months: frozen frog under a growing snow mound; calendar on the right trunk loses its pages
            fg.update(t, FR.x * W, gy, FR.s * u, { face: FR.face, frost: 1 });
            const grow = progIO(lt, 0.2, dur * 0.85), cx = FR.x * W, mw = 260 * u * FR.s, mh = lerp(10, 120, grow) * u * FR.s;
            const MP = []; for (let i = 0; i <= 10; i++) { const f = i / 10, x = cx - mw + f * mw * 2; MP.push([x, gy + 8 * u - Math.sin(f * Math.PI) * mh - Math.sin(f * 9 + 1) * 6 * u]); }
            mound.setAttribute('d', inkLoop(MP.concat([[cx + mw, gy + 30 * u], [cx - mw, gy + 30 * u]]), { seed: sd + 900, t, amp: 0.8 }));
            moundR.setAttribute('d', inkPath(MP, { w: 5, seed: sd + 901, t }));
            const C = P.calendar || [0.76, 0.36], span = dur * 0.86, step = span / MONTHS.length, i = Math.min(MONTHS.length - 1, Math.floor(lt / step)), ph = (lt % step) / step;
            cal.update(t, C[0] * W, C[1] * H, 300 * u, 330 * u, MONTHS[i], i < MONTHS.length - 1 && ph > 0.7 ? (ph - 0.7) / 0.3 * 0.25 : 0);
            tk.setAttribute('d', '');
          }
          front.update(t, W, H, fy, { flip: mode === 'months' });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.wf_freeze
  SH.wf_freeze = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 431, u = W / 1080, mode = P.mode || 'close';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.583) * H, fy = (P.front ?? 0.67) * H;
      const trees = (mode === 'close' ? [[0.1, 900, 0.5], [0.88, 760, 0.55]] : [[0.9, 860, 0.3], [0.6, 560, 0.6]]).map((q, i) => ({ q, s: spruce(el(root, 'g'), sd + 10 + i * 40) }));
      const fall = snowfall(el(root, 'g'), sd + 300, 26);
      const lit = litter(el(root, 'g'), sd + 330);
      const FR = Object.assign(mode === 'close' ? { x: 0.48, s: 1.5, face: 1 } : { x: 0.64, s: 1.05, face: -1 }, P.frog || {});
      const K = Object.assign({ x: 0.3, y: gy / H, scale: 1.1, pose: 'point', dir: 'down', face: 'right', emotion: 'worried', seq: [{ at: 'tip', pose: 'shock', face: 'right', emotion: 'surprised' }] }, P.kasif || {});
      const kas = mode === 'poke' && P.kasif ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const hik = mode === 'poke' && !kas ? L.person(el(root, 'g'), sd + 60, { kind: 'sweater', hair: 'dark', glasses: false, col: mix(INK.blue, INK.inkSoft, 0.3) }) : null;
      const tk = inkEl(root);
      const twig = inkEl(root, BARK());
      const fg = frog(el(root, 'g'), sd + 400);
      const puffs = inkEl(root, INK.paperLight, { 'fill-opacity': 0.8 }), puffR = inkEl(root, mix(INK.inkSoft, INK.blue, 0.3));
      const mon = mode === 'close' ? ecg(el(root, 'g'), sd + 500) : null;
      const front = snowFront(el(root, 'g'), sd + 600);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          trees.forEach(({ q, s }) => s.update(t, q[0] * W, gy + 10 * u, q[1] * u, q[2]));
          fall.update(t, W, 0.08 * H, fy + 60 * u, mode === 'close' ? 0.8 : 1);
          lit.update(t, 0, W, gy + 6 * u, 16, mode === 'close' ? 1.6 : 1);
          if (mode === 'close') {
            const fl = atOr(cues, 'flat', dur * 0.3), br = atOr(cues, 'breath', dur * 0.6);
            fg.update(t, FR.x * W, gy, FR.s * u, { face: FR.face, frost: lerp(0.35, 1, progIO(lt, 0, Math.max(0.8, br))) });
            mon.update(t, lt, 0.24 * W, 0.76 * W, (P.ecgY ?? 0.44) * H, 55 * u, fl);
            // breath puffs from the nostril, none from "breath"
            const nose = [FR.x * W + 150 * FR.s * u * FR.face, gy - 92 * FR.s * u], PF = [], PR = [];
            for (let i = 0; i < 3; i++) { const ts = Math.floor(lt / 0.9) * 0.9 - i * 0.9, f = (lt - ts) / 1.6; if (ts < 0 || ts > br - 0.6 || f > 1) continue; const c = [nose[0] + f * 120 * u * FR.face, nose[1] - f * 70 * u], r = (16 + f * 40) * u; PF.push(inkCircle(c[0], c[1], r, sd + 700 + i, t, { fill: true })); PR.push(inkCircle(c[0], c[1], r, sd + 710 + i, t, { w: 2.5 })); }
            puffs.setAttribute('d', PF.join(' ')); puffR.setAttribute('d', PR.join(' '));
            twig.setAttribute('d', '');
          } else {
            // the hiker crouches and prods the frog with a twig; from "tip" it rolls over stiff, like a stone
            const tip = atOr(cues, 'tip', dur * 0.55), rot = -165 * spring(lt, tip, 0.7), fx = FR.x * W;
            const hx = 0.27 * W, hs = 1.15 * u, prod = Math.max(0, Math.sin(lt * 5)) * (lt < tip + 0.2 ? 1 : 0.2);
            const tipP = [fx - 150 * u + prod * 30 * u, gy - 50 * u], hand = [tipP[0] - 210 * u, tipP[1] - 140 * u];
            if (hik) {
              hik.update(t, hx, gy + 10 * u, hs, { face: 1, seat: gy - 70 * u, lean: 30, armR: hand, armL: [hand[0] - 30 * u, hand[1] + 40 * u], look: [8, 14], brow: lt > tip ? 1 : 0.3, mouth: lt > tip ? 0.8 : 0 });
              twig.setAttribute('d', inkPath([hand, [lerp(hand[0], tipP[0], 0.5), lerp(hand[1], tipP[1], 0.5) - 14 * u], tipP], { w: 10 * u, seed: sd + 800, t, taper: 0.5 }));
            } else {
              // Kaşif prods it with a long twig, then jumps back in shock when it tips
              const r = kas.update(lt, t, cues), ks = (K.scale ?? 1) * u, kf = K.face === 'left' ? -1 : 1, G = q => [K.x * W + kf * ks * q[0], K.y * H + ks * q[1]];
              const hA = G(r.hands[0]), hB = G(r.hands[1]), hd = (hA[0] - hB[0]) * kf > 0 ? hA : hB;
              if (lt < tip) twig.setAttribute('d', inkPath([hd, [lerp(hd[0], tipP[0], 0.5), lerp(hd[1], tipP[1], 0.5) - 20 * u], tipP], { w: 11 * u, seed: sd + 800, t, taper: 0.4 }));
              else twig.setAttribute('d', inkPath([[fx - 330 * u, gy + 4 * u], [fx - 220 * u, gy - 2 * u], [fx - 120 * u, gy + 6 * u]], { w: 11 * u, seed: sd + 801, t, taper: 0.4 }));
              const hc = G(r.head); tk.setAttribute('d', lt > tip + 0.05 ? ticks(hc[0], hc[1] - 20 * ks, ks, sd + 820, t) : '');
            }
            fg.update(t, fx + (lt > tip ? 30 * u * spring(lt, tip, 0.7) : 0), gy, FR.s * u, { face: FR.face, frost: 1, rot, dy: lt > tip ? -(140 * FR.s * u * spring(lt, tip, 0.7) + 40 * u * Math.sin(Math.min(1, (lt - tip) / 0.5) * Math.PI)) : 0 });
            blank(puffs, puffR);
          }
          front.update(t, W, H, fy);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.wf_body
  SH.wf_body = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 613, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const lamp = L.lamp(el(root, 'g'), sd + 1);
      const bench = L.front(el(root, 'g'), sd + 30, 'bench');
      const tray = inkEl(root, mix(INK.paperLight, INK.blue, 0.1)), trayR = inkEl(root);
      const FR = Object.assign({ x: 0.52, s: 2.55, face: 1 }, P.frog || {});
      const fg = frog(el(root, 'g'), sd + 400);
      const arrow = inkEl(root, INK.red), arrowW = inkEl(root, INK.paperLight);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          lamp.update(t, 0.5 * W, 0.1 * H, 1, gy, 300 * u);
          bench.update(t, W, H, gy + 20 * u);
          const tw = 900 * u, ty = gy + 14 * u;
          const TP = [[0.5 * W - tw / 2, ty - 10 * u], [0.5 * W + tw / 2, ty - 10 * u], [0.5 * W + tw / 2 - 30 * u, ty + 30 * u], [0.5 * W - tw / 2 + 30 * u, ty + 30 * u]];
          tray.setAttribute('d', inkLoop(TP, { seed: sd + 2, t, smooth: false, amp: 0.8 })); trayR.setAttribute('d', inkPath(TP, { w: 5, seed: sd + 3, t, closed: true, smooth: false }));
          const ic = atOr(cues, 'ice', dur * 0.2), lv = atOr(cues, 'liver', dur * 0.4), sg = atOr(cues, 'sugar', lv + 0.4);
          fg.update(t, FR.x * W, ty - 10 * u, FR.s * u, { face: FR.face, xray: true, ice: progIO(lt, ic, 0.8) * 0.6, glow: progIO(lt, lv, 0.4) * (0.75 + 0.25 * Math.sin(t * 6)), sugar: progIO(lt, sg, 0.8), beat: 1 });
          // hand-drawn arrow from the LIVER card to the organ
          const A = P.arrow || { from: [0.3, 0.39], at: 'liver' }, aa = atOr(cues, A.at, lv), ap = progIO(lt, aa + 0.1, 0.4);
          const s2 = FR.s * u, to = [FR.x * W + FR.face * 10 * s2, ty - 10 * u - 70 * s2 - 26 * u], fr0 = [A.from[0] * W, A.from[1] * H];
          const mid = [lerp(fr0[0], to[0], 0.5) - 40 * u, lerp(fr0[1], to[1], 0.5) - 30 * u], Q = f => [(1 - f) * (1 - f) * fr0[0] + 2 * f * (1 - f) * mid[0] + f * f * to[0], (1 - f) * (1 - f) * fr0[1] + 2 * f * (1 - f) * mid[1] + f * f * to[1]];
          if (ap > 0.01) {
            const pts = []; for (let i = 0; i <= 10; i++) pts.push(Q(i / 10 * ap));
            const e = Q(ap), b = Q(Math.max(0, ap - 0.1)), an = Math.atan2(e[1] - b[1], e[0] - b[0]), L2 = 40 * u;
            const headP = ap > 0.9 ? ' ' + inkLoop([e, [e[0] - Math.cos(an - 0.5) * L2, e[1] - Math.sin(an - 0.5) * L2], [e[0] - Math.cos(an + 0.5) * L2, e[1] - Math.sin(an + 0.5) * L2]], { seed: sd + 9, t, smooth: false, amp: 0.5 }) : '';
            arrowW.setAttribute('d', inkPath(pts, { w: 20 * u, seed: sd + 7, t, taper: 0.1 }));
            arrow.setAttribute('d', inkPath(pts, { w: 10 * u, seed: sd + 8, t, taper: 0.1 }) + headP);
          } else blank(arrow, arrowW);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.wf_cells
  SH.wf_cells = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 821, u = W / 1080;
      const root = el(svg, 'g');
      const dark = inkEl(root, mix(INK.ink, INK.inkSoft, 0.35)), view = inkEl(root, mix(INK.paperLight, INK.blue, 0.1));
      const iceF = inkEl(root, ICE()), iceR = inkEl(root, ICE_D());
      const cellF = inkEl(root, mix(INK.paperLight, INK.red, 0.14)), cellR = inkEl(root), nuc = inkEl(root, mix(INK.red, INK.stain, 0.4));
      const sugar = inkEl(root, INK.gold), sugarR = inkEl(root, mix(INK.gold, INK.ink, 0.45));
      const rim = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      const cx = 0.5 * W, cy = (P.cy ?? 0.45) * H, R = (P.r ?? 560) * u;
      // cells on a loose hex grid inside the view
      const CELLS = [];
      for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) {
        const x = cx + (i + (j % 2 ? 0.5 : 0)) * 230 * u + (hn(sd, i * 7 + j) - 0.5) * 30 * u, y = cy + j * 200 * u + (hn(sd + 1, i * 7 + j) - 0.5) * 30 * u;
        if (Math.hypot(x - cx, y - cy) < R + 60 * u) CELLS.push([x, y, (88 + hn(sd + 2, i * 7 + j) * 14) * u]);
      }
      const GAPS = [];
      CELLS.forEach((a, i) => CELLS.forEach((b, j) => { if (j <= i) return; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d < 260 * u) GAPS.push([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.atan2(b[1] - a[1], b[0] - a[0])]); }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const circ = inkEllipsePts(cx, cy, R, R, sd + 3, 28);
          dark.setAttribute('d', inkLoop([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], { seed: sd, t, smooth: false, amp: 0 }) + ' ' + inkLoop(circ.slice().reverse(), { seed: sd + 4, t, amp: 0.6 }));
          dark.setAttribute('fill-rule', 'evenodd');
          view.setAttribute('d', inkLoop(circ, { seed: sd + 4, t, amp: 0.6 }));
          const sg = progIO(lt, atOr(cues, 'sugar', dur * 0.1), 1.2), ic = atOr(cues, 'ice', dur * 0.4), ig = progIO(lt, ic, 1.2);
          // ice crystals in the gaps (perpendicular spikes along the gap line, short so they stop at the walls)
          const IF = [], IR = [];
          GAPS.forEach((g, i) => {
            if (Math.hypot(g[0] - cx, g[1] - cy) > R - 30 * u) return;
            const k = clamp01(ig * 1.4 - hn(sd + 5, i) * 0.4); if (k < 0.02) return;
            const n = -Math.sin(g[2]), m = Math.cos(g[2]), l = 64 * u * k, w = 22 * u * k;
            const P4 = [[g[0] - n * l, g[1] - m * l], [g[0] + m * w, g[1] - n * w], [g[0] + n * l, g[1] + m * l], [g[0] - m * w, g[1] + n * w]];
            IF.push(inkLoop(P4, { seed: sd + 100 + i, t, smooth: false, amp: 0.6 }));
            IR.push(inkPath(P4, { w: 4, seed: sd + 200 + i, t, closed: true, smooth: false, amp: 0.6 }), star(g[0], g[1], 30 * u * k, sd + 300 + i * 4, t, 3.5));
          });
          iceF.setAttribute('d', IF.join(' ')); iceR.setAttribute('d', IR.join(' '));
          const CF = [], CR = [], NU = [], SF = [], SR = [];
          CELLS.forEach((c, i) => {
            const br = 1 + 0.025 * Math.sin(t * 2 + i), r = c[2] * br * (1 - 0.04 * ig);
            CF.push(inkCircle(c[0], c[1], r, sd + 400 + i, t, { fill: true, n: 14 })); CR.push(inkCircle(c[0], c[1], r, sd + 450 + i, t, { w: 6, n: 14 }));
            NU.push(inkDot(c[0] - r * 0.2, c[1] - r * 0.15, r * 0.2, r * 0.17, sd + 500 + i, t));
            const n = Math.round(sg * 9);
            for (let j = 0; j < n; j++) { const a = hn(sd + 6, i * 11 + j) * 6.28 + t * 0.6 * (j % 2 ? 1 : -1), d = (0.35 + hn(sd + 7, i * 11 + j) * 0.4) * r; const p = [c[0] + Math.cos(a) * d, c[1] + Math.sin(a) * d]; SF.push(inkDot(p[0], p[1], 9 * u, 9 * u, sd + 600 + i * 11 + j, t)); SR.push(inkCircle(p[0], p[1], 9 * u, sd + 700 + i * 11 + j, t, { w: 2 })); }
          });
          cellF.setAttribute('d', CF.join(' ')); cellR.setAttribute('d', CR.join(' ')); nuc.setAttribute('d', NU.join(' '));
          sugar.setAttribute('d', SF.join(' ')); sugarR.setAttribute('d', SR.join(' '));
          rim.setAttribute('d', inkPath(circ, { w: 14, seed: sd + 8, t, closed: true, amp: 0.6 }) + ' ' + inkCircle(cx, cy, R + 40 * u, sd + 9, t, { w: 4 }));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.wf_meter
  SH.wf_meter = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const sd = seed * 1000 + 977, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.583) * H, fy = (P.front ?? 0.67) * H;
      const trees = [[0.06, 820, 0.4], [0.94, 760, 0.45]].map((q, i) => ({ q, s: spruce(el(root, 'g'), sd + 10 + i * 40) }));
      const fall = snowfall(el(root, 'g'), sd + 300, 24);
      const lit = litter(el(root, 'g'), sd + 330);
      const FR = Object.assign({ x: 0.5, s: 2.5, face: 1 }, P.frog || {});
      const fg = frog(el(root, 'g'), sd + 400);
      // ice rising inside the frog's own silhouette (same transform, clipped to the body)
      const cid = `wfclip${seed}_${sd}`;
      const cp = el(defs || svg, 'clipPath', { id: cid }); frogClipParts().forEach(d => el(cp, 'path', { d }));
      const g = el(root, 'g');
      const inner = el(g, 'g', { 'clip-path': `url(#${cid})` });
      const ice = inkEl(inner, mix(INK.blue, INK.paperLight, 0.35), { 'fill-opacity': 0.78 }), iceL = inkEl(inner, ICE_D()), iceS = inkEl(inner, INK.paperLight);
      const mark = inkEl(root, INK.red);
      const num = el(root, 'text', { 'text-anchor': 'middle', 'font-family': SERIF, 'font-weight': 900, fill: INK.red, stroke: INK.paperLight, 'stroke-width': 14, 'paint-order': 'stroke', 'stroke-linejoin': 'round' });
      const front = snowFront(el(root, 'g'), sd + 600);
      const LB = labels(root, P.labels, W, H);
      const val = P.value ?? 70, suf = P.suffix ?? '%';
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          trees.forEach(({ q, s }) => s.update(t, q[0] * W, gy + 10 * u, q[1] * u, q[2]));
          fall.update(t, W, 0.08 * H, fy + 60 * u);
          lit.update(t, 0, W, gy + 6 * u, 16, 1.2);
          const s = FR.s * u, x = FR.x * W, lw = 5.5 / Math.pow(s, 0.6), amp = 1.2 / Math.sqrt(s);
          const fl = atOr(cues, 'fill', 0.2), p = progIO(lt, fl, Math.max(1.2, dur * 0.55)), top = -150, lvl = lerp(8, top * val / 100, p);
          fg.update(t, x, gy, s, { face: FR.face, frost: 0.2 * p, blink: true });
          g.setAttribute('transform', `translate(${f1(x)} ${f1(gy)}) scale(${f3(s * FR.face)} ${f3(s)})`);
          const wv = []; for (let i = 0; i <= 16; i++) wv.push([-170 + i * 22, lvl - 4 + Math.sin(i * 0.9 + t * 3) * 3]);
          ice.setAttribute('d', inkLoop(wv.concat([[180, 20], [-170, 20]]), { seed: sd + 2, t, amp: amp * 0.6 }));
          const IL = [inkPath(wv, { w: lw, seed: sd + 3, t, amp })], IS = [];
          for (let i = 0; i < 12; i++) { const cx = -130 + hn(sd, i) * 270, cy = lerp(-6, lvl + 10, hn(sd + 1, i)); if (cy < lvl + 8) continue; IL.push(inkPath([[cx - 14, cy + 8], [cx + 14, cy - 8]], { w: lw * 0.5, seed: sd + 10 + i, t })); IS.push(star(cx, cy, 9, sd + 30 + i * 4, t, lw * 0.6)); }
          iceL.setAttribute('d', IL.join(' ')); iceS.setAttribute('d', IS.join(' '));
          // the mark line + counter
          const my = gy + top * val / 100 * s, mx0 = x - 190 * s, mx1 = x + 190 * s, D = [];
          for (let i = 0; i < 16; i++) { const a = lerp(mx0, mx1, i / 16), b = lerp(mx0, mx1, (i + 0.55) / 16); D.push(inkPath([[a, my], [b, my]], { w: 7, seed: sd + 40 + i, t })); }
          mark.setAttribute('d', p > 0.02 ? D.join(' ') : '');
          const k = spring(lt, fl, 0.5);
          num.textContent = Math.round(val * p) + suf;
          num.setAttribute('font-size', f1(230 * u * (0.6 + 0.4 * k) * (1 + 0.1 * punch(lt, atOr(cues, 'hit', null), 0.7))));
          num.setAttribute('x', f1(0.5 * W)); num.setAttribute('y', f1(gy - 450 * u));
          num.setAttribute('transform', `rotate(${f1(-3 + Math.sin(t * 2) * 1)} ${f1(0.5 * W)} ${f1(gy - 520 * u)})`);
          front.update(t, W, H, fy);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.wf_pond
  SH.wf_pond = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 1103, u = W / 1080, mode = P.mode || 'thaw';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.583) * H;
      const trees = (P.trees || [[0.1, 820, 0.45], [0.9, 900, 0.35], [0.6, 560, 0.65]]).map((q, i) => ({ q, s: spruce(el(root, 'g'), sd + 900 + i * 40, false) }));
      const pond = inkEl(root, mix(INK.blue, INK.paperLight, 0.45)), pondR = inkEl(root), rip = inkEl(root, mix(INK.blue, INK.ink, 0.2)), pads = inkEl(root, mix(INK.green, INK.paperLight, 0.15)), padR = inkEl(root);
      const reeds = inkEl(root, mix(INK.green, INK.ink, 0.3)), cat = inkEl(root, BARK());
      const patches = inkEl(root, SNOW()), patchR = inkEl(root, ICE_D());
      const lit = litter(el(root, 'g'), sd + 330);
      const FR = Object.assign(mode === 'thaw' ? { x: 0.42, s: 1.7, face: 1 } : { x: 0.74, s: 1.4, face: -1 }, P.frog || {});
      const fg = frog(el(root, 'g'), sd + 400);
      const drips = inkEl(root, mix(INK.blue, INK.paperLight, 0.3)), dripR = inkEl(root, ICE_D());
      const ht = heartIcon(el(root, 'g'), sd + 540);
      const K = Object.assign({ x: 0.26, y: 0.583, scale: 1.3, pose: 'wave', face: 'right', emotion: 'happy' }, P.kasif || {});
      const kas = mode === 'end' && P.kasif !== false ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const grass = L.front(el(root, 'g'), sd + 30, 'grass');
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          trees.forEach(({ q, s }) => s.update(t, q[0] * W, gy + 10 * u, q[1] * u, q[2]));
          // pond in the middle ground
          const pcx = (P.pond ?? (mode === 'thaw' ? 0.78 : 0.6)) * W, pcy = gy + 40 * u, prx = 330 * u, pry = 70 * u;
          const pe = inkEllipsePts(pcx, pcy, prx, pry, sd + 1, 16, 0, 0.05);
          pond.setAttribute('d', inkLoop(pe, { seed: sd + 2, t, amp: 0.8 })); pondR.setAttribute('d', inkPath(pe, { w: 5, seed: sd + 3, t, closed: true }));
          const RP = []; for (let i = 0; i < 3; i++) { const f = (t * 0.4 + i / 3) % 1; RP.push(inkCircle(pcx - 80 * u, pcy, (30 + f * 160) * u, sd + 10 + i, t, { w: 3 * (1 - f) + 1, ry: (8 + f * 34) * u })); }
          rip.setAttribute('d', RP.join(' '));
          const PD = [], PDR = [];
          [[0.12, 0.2, 1], [0.6, -0.1, 0.8]].forEach((q, i) => { const x = pcx + (q[0] - 0.3) * prx * 2, y = pcy + q[1] * pry, r = 56 * u * q[2]; const pts = inkEllipsePts(x, y, r, r * 0.35, sd + 20 + i, 12); pts.splice(2, 1, [x, y]); PD.push(inkLoop(pts, { seed: sd + 22 + i, t, amp: 0.6 })); PDR.push(inkPath(pts, { w: 4, seed: sd + 24 + i, t, closed: true, amp: 0.6 })); });
          pads.setAttribute('d', PD.join(' ')); padR.setAttribute('d', PDR.join(' '));
          const RD = [], CT = [];
          [0.03, 0.08, 0.95, 0.99].forEach((q, i) => { for (let j = 0; j < 3; j++) { const x = q * W + j * 18 * u, sw = Math.sin(t * 1.3 + i + j) * 14 * u, h = (300 + j * 60) * u; RD.push(inkPath([[x, gy + 60 * u], [x + sw * 0.4, gy - h * 0.5], [x + sw, gy - h]], { w: 6, seed: sd + 40 + i * 3 + j, t })); if (j === 1) CT.push(inkLoop(inkEllipsePts(x + sw * 0.8, gy - h * 0.85, 12 * u, 40 * u, sd + 60 + i, 10, 0.05), { seed: sd + 70 + i, t, amp: 0.6 })); } });
          reeds.setAttribute('d', RD.join(' ')); cat.setAttribute('d', CT.join(' '));
          const melt = mode === 'thaw' ? progIO(lt, 0, Math.max(1.2, dur * 0.55)) : 1;
          const SP = [], SR = [];
          [[0.18, 1], [0.58, 0.8], [0.06, 0.6]].forEach((q, i) => { const r = 120 * u * q[1] * (1 - melt * 0.85); if (r < 6) return; const pts = inkEllipsePts(q[0] * W, gy + 20 * u, r, r * 0.22, sd + 80 + i, 12); SP.push(inkLoop(pts, { seed: sd + 85 + i, t, amp: 0.6 })); SR.push(inkPath(pts, { w: 3, seed: sd + 90 + i, t, closed: true })); });
          patches.setAttribute('d', SP.join(' ')); patchR.setAttribute('d', SR.join(' '));
          lit.update(t, 0.02 * W, 0.6 * W, gy + 10 * u, 12, 1);
          if (mode === 'thaw') {
            const hb = atOr(cues, 'heart', dur * 0.5), fx = FR.x * W, s = FR.s * u;
            fg.update(t, fx, gy, s, { face: FR.face, frost: 1 - melt, blink: melt > 0.6 });
            const DR = [], DRR = [];
            if (melt < 0.95) for (let i = 0; i < 5; i++) { const f = (t * 0.9 + i / 5) % 1, x = fx + (-110 + i * 55) * s, y = gy - (40 + (i % 2) * 40) * s + f * 70 * u; DR.push(inkLoop([[x, y - 14 * u], [x + 8 * u, y + 4 * u], [x, y + 10 * u], [x - 8 * u, y + 4 * u]], { seed: sd + 100 + i, t, amp: 0.4 })); DRR.push(inkPath([[x, y - 14 * u], [x + 8 * u, y + 4 * u], [x, y + 10 * u], [x - 8 * u, y + 4 * u]], { w: 2.5, seed: sd + 110 + i, t, closed: true, amp: 0.4 })); }
            drips.setAttribute('d', DR.join(' ')); dripR.setAttribute('d', DRR.join(' '));
            const beat = lt > hb ? Math.pow(Math.max(0, Math.sin((lt - hb) * 7)), 2) : 0;
            ht.update(t, fx + 10 * u, gy - 520 * u, 110 * u, beat, 0, spring(lt, hb, 0.5), lt > hb ? 1 : 0);
          } else {
            const r = kas ? kas.update(lt, t, cues) : null;
            const croak = Math.max(0, Math.sin(lt * 3.2)) ;
            fg.update(t, FR.x * W, gy, FR.s * u, { face: FR.face, frost: 0, blink: true, sac: croak, sy: 1 + 0.03 * croak });
            ht.update(t, 0, 0, 1, 0, 0, 0);
            blank(drips, dripR);
          }
          grass.update(t, W, H, (P.grass ?? 0.72) * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
