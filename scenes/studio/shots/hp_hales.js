// hp_hales: shots for the "first blood pressure" Short (Stickstory 2026-10-30): in Haemastaticks (1733) the English
// parson Stephen Hales told how he tied down an old mare, fixed a 9-foot glass tube to the artery in her leg, and the
// blood rose 8 feet 3 inches. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line
// boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random. Parametric: any early
// experiment with an animal, a tall tube and a column of liquid (barometers, siphons, pumps).
// Uses td__lib.js (TD.label, TD.figure) at build time; the narrator (fez) comes from params.kasif (TD.figure spec).
//
// Shared specs:
//   K (figure)   = TD.figure spec {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq}
//   HALES        = K + wig: true (18th-century parson: white periwig, black gown, white preaching bands)
//   L (label)    = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
//   TUBE         = {x: 0.25, base: 0.58 (tube foot, 0..1 H), ft: 88 (px per foot), len: 9 (feet), from: 0, to: 8.25 (feet of
//                  blood), at: cue|sec|null (null: already at "to"), dur: 2, pulse: true (heartbeat bob), ruler: true,
//                  mark: cue|false (gold line + tick at the top of the column)}
//   Lines        = [{words: [...], at: [cue...], y, size}] + highlight (giant Fraunces words, highlight in a red box)
//
// SHOTS.hp_barn  — barn floor: the old mare lies on the straw, legs tied to stakes (ropes tighten on cue "ropes"), a
//   brass pipe runs from her hind leg to a tall glass tube on a wooden pole, the parson beside it, a hanging lantern.
//   P: {ground: 0.57, mare: {x: 0.6, y: 0.6, s: 1, face: 1}, ropes: cue|sec|true (taut)|false, tube: TUBE|false,
//       hales: HALES|false, lantern: {x, y}|false, bales: true, labels: [L], kasif: K|false}
// SHOTS.hp_leg   — close-up of the mare's hind thigh: a thread ligature on the artery, a brass pipe into it, the glass
//   tube rising out of frame. pipe.at slides the pipe in, tube.at lowers the tube, untie (cue) pulls the thread bow
//   loose (a lace-cuffed hand tugs it), flow (cue) sends the blood surging up the tube.
//   P: {pipe: {at}, tube: {at}, untie: cue|false, flow: cue|false, hand: true, arrow: {at, x, y0, y1}|false, labels}
// SHOTS.hp_tube  — the tall tube alone with a foot ruler; the blood column climbs from TUBE.from to TUBE.to (cue
//   tube.at); the parson stands beside it for scale (seq: shock when it passes his head); the mare's flank and the
//   brass pipe at the frame bottom.  P: {tube: TUBE, hales: HALES, flank: true, labels}
// SHOTS.hp_book  — the parson writes Haemastaticks by candlelight: desk, big open book (left page: ink sketch of the
//   mare and the tube; right page: lines of writing appear behind the quill), candle flame, bookshelf.
//   P: {hales: HALES, desk: 0.6 (desk top y), write: cue|sec (lines start), labels}
// SHOTS.hp_field — a paddock: the old mare standing (grazes / lifts her head, tail swishes), fence + grass foreground,
//   optional church tower and sunset sun, the narrator, giant words.
//   P: {mare: {x, y, s, face, graze: 0..1, lift: cue}, fence: {y: 0.74}|false, church: {x, y, s}|false,
//       sun: {x, y}|false, kasif: K, lines, highlight, labels}
// SHOTS.hp_cuff  — today: an arm on a table with a blood-pressure cuff, the hand bulb squeezes (cue "pump") and the dial
//   needle climbs and pulses; a ghost of Hales' tall tube stands beside it, a gold dashed arc links its column top to
//   the dial (cue "link").  P: {table: 0.6, dial: {x, y, r}, ghost: TUBE|false, pump: cue, link: cue|false, labels}
// cues: hit (punch), ropes, tube.at, mark, untie, flow, pipe.at, write, pump, link, lift, labels / seq / words "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const FR = 'Fraunces, Georgia, serif';
  const ell = (cx, cy, rx, ry, n = 14) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const fill = (e, pts, sd, t, amp = 1, smooth = true) => e.setAttribute('d', inkLoop(pts, { seed: sd, t, amp, smooth }));
  const ringS = (pts, sd, t, w = 5, amp = 1, smooth = true) => inkPath(pts, { w, seed: sd, t, closed: true, amp, smooth });
  const lineS = (pts, sd, t, w = 5, amp = 1) => inkPath(pts, { w, seed: sd, t, amp });
  const loopS = (pts, sd, t, amp = 1, smooth = true) => inkLoop(pts, { seed: sd, t, amp, smooth });
  const labels = (parent, LS, W, H, sd) => (LS || []).map((L, i) => window.TD.label(el(parent, 'g'), L, W, H, sd + i * 17)).filter(Boolean);
  const HIDE = (...es) => es.forEach(e => e.setAttribute('d', ''));
  const COAT = () => mix(INK.paperLight, INK.paperDark, 0.25);           // the mare: a pale grey-white old horse
  const COAT_D = () => mix(INK.paperDark, INK.inkSoft, 0.35);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25);
  const BRASS = () => mix(INK.gold, INK.ink, 0.18);
  const BLOOD = () => INK.red;
  const STRAW = () => mix(INK.gold, INK.stain, 0.45);
  const GLASS = () => mix(INK.blue, INK.paperLight, 0.72);
  const atNum = (cues, v, fb) => v === false || v == null ? fb : atOr(cues, v, fb);
  // a thick limb as a closed outline: a -> b -> c with widths wa, wb, wc
  const limb = (a, b, c, wa, wb, wc) => {
    const n = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1; return [-dy / L, dx / L]; };
    const na = n(a, b), nb = n(a, c), nc = n(b, c);
    return [[a[0] + na[0] * wa, a[1] + na[1] * wa], [b[0] + nb[0] * wb, b[1] + nb[1] * wb], [c[0] + nc[0] * wc, c[1] + nc[1] * wc],
      [c[0] - nc[0] * wc, c[1] - nc[1] * wc], [b[0] - nb[0] * wb, b[1] - nb[1] * wb], [a[0] - na[0] * wa, a[1] - na[1] * wa]];
  };

  const limbN = (pts, ws) => {
    const L = [], R = [];
    pts.forEach((p, i) => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; L.push([p[0] + nx * ws[i], p[1] + ny * ws[i]]); R.push([p[0] - nx * ws[i], p[1] - ny * ws[i]]); });
    return L.concat(R.reverse());
  };
  // ------------------------------------------------------------------ the mare lying down (head +x, belly on the floor at y 0)
  //   front legs and one hind leg folded under her, the near hind leg stretched out behind along the floor and roped to a
  //   stake, two ropes over her back to stakes in front (ropes 0 = slack on the floor .. 1 = taut over her body)
  function mareLying(parent, sd) {
    const g = el(parent, 'g');
    const shadow = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.22 });
    const legsB = inkEl(g, COAT_D()), tail = inkEl(g, COAT_D()), body = inkEl(g, COAT()), belly = inkEl(g, COAT_D(), { 'fill-opacity': 0.5 });
    const neck = inkEl(g, COAT()), legsF = inkEl(g, COAT()), hoofs = inkEl(g, mix(INK.ink, INK.inkSoft, 0.2));
    const mane = inkEl(g, mix(INK.inkSoft, INK.ink, 0.25)), hair = inkEl(g, INK.inkSoft), r = inkEl(g), face = inkEl(g);
    const stakes = inkEl(g, WOOD()), rope = inkEl(g, mix(INK.stain, INK.ink, 0.25)), ropeR = inkEl(g, mix(INK.stain, INK.ink, 0.6));
    return {
      update(t, o) {
        const s = o.s ?? 1, fc = o.face ?? 1, x = o.x, y = o.y, k = sd * 13;
        const br = 1 + 0.03 * Math.sin(t * 1.9), hb = Math.sin(t * 1.3) * (o.nod ?? 6) + (o.toss ?? 0) * -30;
        const P = p => [x + fc * p[0] * s, y + p[1] * s];
        const B = p => P([p[0], (p[1] + 120) * br - 120]);
        const N = p => P([p[0], p[1] + (p[1] < -200 ? hb * (-(p[1] + 200) / 200) : 0)]);
        fill(shadow, ell(-40, 10, 380, 36, 16).map(P), k + 1, t, 0.8);
        // far legs (folded, darker), drawn behind the body
        const FL = [limb([150, -50], [270, -40], [215, -6], 34, 22, 18), limb([-170, -50], [-70, -24], [-130, -6], 44, 24, 18)];
        legsB.setAttribute('d', FL.map((q, i) => loopS(q.map(P), k + 2 + i, t, 0.6)).join(' '));
        const tw = Math.sin(t * 1.4) * 14;
        tail.setAttribute('d', [lineS([[-285, -160], [-330, -90 + tw * 0.2], [-345 + tw, -5]].map(P), k + 4, t, 34 * s, 1.2), lineS([[-280, -150], [-305, -70], [-310 + tw * 0.6, 0]].map(P), k + 5, t, 20 * s, 1.2)].join(' '));
        // body
        const bp = ell(0, -120, 290, 120, 22).map(B);
        body.setAttribute('d', loopS(bp, k + 6, t, 0.8));
        fill(belly, ell(10, -45, 230, 42, 16).map(B), k + 7, t, 0.8);
        // neck + raised head
        const np = [[140, -200], [220, -310], [295, -385], [345, -350], [300, -260], [275, -150], [250, -60]].map(N);
        const hp = [[290, -395], [335, -410], [415, -345], [455, -292], [446, -266], [405, -266], [345, -312], [296, -352]].map(N);
        neck.setAttribute('d', loopS(np, k + 8, t, 0.8) + ' ' + loopS(hp, k + 9, t, 0.8));
        // near legs: front folded forward, hind stretched out behind
        const NL = [limb([205, -55], [320, -32], [262, -6], 36, 22, 18), limb([-215, -70], [-330, -26], [-420, -8], 50, 26, 18)];
        legsF.setAttribute('d', NL.map((q, i) => loopS(q.map(P), k + 10 + i, t, 0.6)).join(' '));
        const hoofAt = [[215, -6], [-130, -6], [262, -6], [-420, -8]];
        hoofs.setAttribute('d', hoofAt.map((c, i) => loopS([[c[0] - 24, c[1] - 26], [c[0] + 22, c[1] - 26], [c[0] + 26, c[1] + 8], [c[0] - 28, c[1] + 8]].map(P), k + 12 + i, t, 0.5, false)).join(' '));
        const R = [ringS(bp, k + 16, t, 6, 0.8), ringS(np, k + 17, t, 6, 0.8), ringS(hp, k + 18, t, 6, 0.8)];
        NL.forEach((q, i) => R.push(ringS(q.map(P), k + 19 + i, t, 5, 0.6))); FL.forEach((q, i) => R.push(ringS(q.map(P), k + 21 + i, t, 4, 0.6)));
        R.push(lineS([[300, -395], [292, -445], [322, -402]].map(N), k + 23, t, 5));                        // ear
        R.push(lineS([[-240, -170], [-185, -205], [-120, -228]].map(B), k + 24, t, 3, 0.6));                // hip
        R.push(lineS([[160, -175], [140, -120], [150, -60]].map(B), k + 25, t, 3, 0.6));                    // shoulder
        r.setAttribute('d', R.join(' '));
        mane.setAttribute('d', lineS([[140, -205], [215, -318], [290, -395]].map(N), k + 26, t, 18 * s, 1));
        const HH = []; for (let i = 0; i < 5; i++) HH.push(lineS([[-50 + i * 38, -205], [-62 + i * 38, -125]].map(B), k + 30 + i, t, 2.5, 0.5));
        hair.setAttribute('d', HH.join(' '));
        const eye = N([345, -360]), nos = N([440, -282]);
        face.setAttribute('d', [inkDot(eye[0], eye[1], 7 * s, 7 * s, k + 36, t), inkDot(nos[0], nos[1], 5 * s, 5 * s, k + 37, t), lineS([[326, -374], [346, -380], [364, -372]].map(N), k + 38, t, 3)].join(' '));
        // stakes + ropes
        const rp = clamp01(o.ropes == null ? 1 : o.ropes);
        const ST = [], RP = [], RR = [];
        const stake = (sx, sy, i) => { const sp = [[sx - 13, sy - 60], [sx + 13, sy - 60], [sx + 9, sy + 16], [sx - 9, sy + 16]].map(P); ST.push(loopS(sp, k + 40 + i, t, 0.6, false)); RR.push(ringS(sp, k + 44 + i, t, 3.5, 0.6, false)); };
        [[-90, 70], [110, 70]].forEach(([sx, sy], i) => {
          stake(sx, sy, i);
          const slack = [[sx, sy - 50], [sx - 40, sy - 30], [sx - 90, sy - 10], [sx - 150, sy + 10]], taut = [[sx, sy - 50], [sx - 10, -60], [sx - 20, -175], [sx - 30, -238]];
          RP.push(lineS(slack.map((p, j) => [lerp(p[0], taut[j][0], rp), lerp(p[1], taut[j][1], rp)]).map(j => j).map(P), k + 50 + i, t, 11 * s, 0.6));
        });
        stake(-500, 40, 2);
        const lh = [-420, -16], ls = [-500, -15];
        RP.push(lineS([lh, [(lh[0] + ls[0]) / 2, -15 + lerp(40, 2, rp)], ls].map(P), k + 53, t, 10 * s, 0.6));
        RR.push(lineS([[-430, -40], [-410, -4]].map(P), k + 54, t, 8 * s, 0.5));
        stakes.setAttribute('d', ST.join(' ')); rope.setAttribute('d', RP.join(' ')); ropeR.setAttribute('d', RR.join(' '));
        return { thigh: P([-235, -55]), head: N([380, -330]), back: P([0, -240]) };
      },
    };
  }

  // ------------------------------------------------------------------ the mare standing (side view, head +x, hooves at y 0)
  function mareStanding(parent, sd) {
    const g = el(parent, 'g');
    const shadow = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.2 });
    const legsFar = inkEl(g, COAT_D()), tail = inkEl(g, COAT_D()), body = inkEl(g, COAT()), neck = inkEl(g, COAT());
    const legsNear = inkEl(g, COAT()), hoofs = inkEl(g, mix(INK.ink, INK.inkSoft, 0.2)), mane = inkEl(g, mix(INK.inkSoft, INK.ink, 0.25)), r = inkEl(g), face = inkEl(g);
    return {
      update(t, o) {
        const s = o.s ?? 1, fc = o.face ?? 1, x = o.x, y = o.y, k = sd * 13;
        const P = p => [x + fc * p[0] * s, y + p[1] * s];
        const br = Math.sin(t * 1.7) * 3;
        fill(shadow, ell(0, 6, 300, 26, 14).map(P), k + 1, t, 0.6);
        // neck + head rotate down around the withers (graze 0..1)
        const ga = (o.graze ?? 0) * 58 * Math.PI / 180 + Math.sin(t * 0.9) * 0.03, piv = [175, -300];
        const Rn = p => { const dx = p[0] - piv[0], dy = p[1] - piv[1], c = Math.cos(ga), sn = Math.sin(ga); return P([piv[0] + dx * c - dy * sn, piv[1] + dx * sn + dy * c]); };
        // legs: far pair darker, near pair in front; small weight shift
        const sh = Math.sin(t * 1.2) * 4;
        // front: forearm -> knee -> cannon -> fetlock -> hoof; hind: gaskin -> hock (bent back) -> cannon -> fetlock -> hoof
        const front = (hx, d) => limbN([[hx, -215], [hx + 4, -150], [hx + 8, -112], [hx + 4 + d, -34], [hx + 14 + d, -8]], [30, 20, 15, 11, 12]);
        const hind = (hx, d) => limbN([[hx, -225], [hx - 18, -160], [hx - 34, -112], [hx - 22 + d, -34], [hx - 10 + d, -8]], [40, 22, 15, 11, 12]);
        const far = [hind(-140, sh), front(205, -sh)], near = [hind(-175, -sh), front(170, sh)];
        legsFar.setAttribute('d', far.map((q, i) => loopS(q.map(P), k + 2 + i, t, 0.6)).join(' '));
        legsNear.setAttribute('d', near.map((q, i) => loopS(q.map(P), k + 4 + i, t, 0.6)).join(' '));
        const HF = [...far, ...near].map((q, i) => { const m = [(q[4][0] + q[5][0]) / 2, 0]; return loopS([[m[0] - 14, -20], [m[0] + 14, -20], [m[0] + 19, 0], [m[0] - 17, 0]].map(P), k + 6 + i, t, 0.5, false); });
        hoofs.setAttribute('d', HF.join(' '));
        // body with an old sway back
        const bp = [[-245, -265], [-225, -300 + br * 0.3], [-140, -316], [-40, -298], [60, -300], [150, -332], [210, -300], [225, -250], [200, -200], [110, -186 + br * 0.4], [-60, -186 + br * 0.4], [-200, -200], [-245, -230]].map(P);
        body.setAttribute('d', loopS(bp, k + 10, t, 0.8));
        const np = [[140, -330], [210, -372], [270, -440], [300, -470], [330, -440], [300, -380], [240, -300], [215, -250]].map(Rn);
        neck.setAttribute('d', loopS(np, k + 11, t, 0.8));
        const hp = [[292, -478], [330, -488], [385, -430], [425, -380], [420, -352], [380, -350], [330, -400], [290, -440]].map(Rn);
        const hpF = inkLoop(hp, { seed: k + 12, t, amp: 0.8 });
        neck.setAttribute('d', neck.getAttribute('d') + ' ' + hpF);
        // tail swish
        const sw = Math.sin(t * 2.4) * 22;
        tail.setAttribute('d', [lineS([[-240, -290], [-275 - sw * 0.3, -200], [-282 - sw, -110]].map(P), k + 13, t, 30 * s, 1.2), lineS([[-238, -280], [-262 - sw * 0.4, -170], [-262 - sw * 1.2, -95]].map(P), k + 14, t, 18 * s, 1.2)].join(' '));
        const R = [ringS(bp, k + 15, t, 6, 0.8), ringS(np, k + 16, t, 6, 0.8), ringS(hp, k + 17, t, 6, 0.8)];
        near.forEach((q, i) => R.push(ringS(q.map(P), k + 18 + i, t, 5, 0.6)));
        far.forEach((q, i) => R.push(ringS(q.map(P), k + 22 + i, t, 4, 0.6)));
        R.push(lineS([[300, -470], [298, -515], [322, -478]].map(Rn), k + 26, t, 5));     // ear
        R.push(lineS([[-200, -280], [-150, -250], [-140, -200]].map(P), k + 27, t, 3, 0.5)); // hip
        for (let i = 0; i < 4; i++) R.push(lineS([[-20 + i * 34, -280], [-30 + i * 34, -215]].map(P), k + 30 + i, t, 2.5, 0.5));   // ribs
        r.setAttribute('d', R.join(' '));
        mane.setAttribute('d', lineS([[145, -334], [205, -380], [262, -446], [294, -476]].map(Rn), k + 35, t, 18 * s, 1));
        const eye = Rn([340, -444]), nos = Rn([414, -368]);
        face.setAttribute('d', [inkDot(eye[0], eye[1], 7 * s, 7 * s, k + 36, t), inkDot(nos[0], nos[1], 5 * s, 5 * s, k + 37, t), lineS([[318, -458], [338, -462], [356, -454]].map(Rn), k + 38, t, 3)].join(' '));
        return { head: Rn([360, -420]), back: P([0, -320]) };
      },
    };
  }

  // ------------------------------------------------------------------ the parson: wig + gown behind the stick figure, bands in front
  function parson(parent, K, sd) {
    const g = el(parent, 'g');
    const gown = inkEl(g, mix(INK.ink, INK.inkSoft, 0.3)), gownR = inkEl(g), wig = inkEl(g, mix(INK.paperLight, INK.paperDark, 0.15)), wigR = inkEl(g);
    const fig = window.TD.figure(el(g, 'g'), Object.assign({}, K, { hat: false }), sd);
    const bands = inkEl(g, INK.paperLight), bandsR = inkEl(g), quill = inkEl(g, INK.paperLight), quillR = inkEl(g);
    return {
      update(lt, t, cues, W, H) {
        const r = fig.update(lt, t, cues, W, H), sc = K.scale ?? 1, hx = r.head[0], hy = r.head[1], k = sd * 7;
        // wig: a cap behind the head + two falls of curls to the shoulders
        const L = [];
        L.push(loopS(ell(hx, hy - 6 * sc, 84 * sc, 80 * sc, 16), k + 1, t, 0.8));
        [-1, 1].forEach((sg, j) => [[64, 26], [70, 74], [62, 120]].forEach(([dx, dy], i) => L.push(loopS(ell(hx + sg * dx * sc, hy + dy * sc, 34 * sc, 30 * sc, 10), k + 2 + j * 3 + i, t, 0.8))));
        wig.setAttribute('d', L.join(' '));
        const LR = [ringS(ell(hx, hy - 6 * sc, 84 * sc, 80 * sc, 16), k + 10, t, 4)];
        [-1, 1].forEach((sg, j) => [[64, 26], [70, 74], [62, 120]].forEach(([dx, dy], i) => LR.push(ringS(ell(hx + sg * dx * sc, hy + dy * sc, 34 * sc, 30 * sc, 10), k + 12 + j * 3 + i, t, 3.5))));
        wigR.setAttribute('d', LR.join(' '));
        // gown: neck -> just above the ankles
        const nx = hx, ny = hy + 78 * sc, fy = r.y - 40 * sc;
        const gp = [[nx - 52 * sc, ny], [nx + 52 * sc, ny], [nx + 98 * sc, fy], [nx - 98 * sc, fy]];
        gown.setAttribute('d', loopS(gp, k + 20, t, 0.8)); gownR.setAttribute('d', ringS(gp, k + 21, t, 4.5, 0.8));
        // white preaching bands
        const bp = [[nx - 16 * sc, ny + 4 * sc], [nx + 16 * sc, ny + 4 * sc], [nx + 20 * sc, ny + 62 * sc], [nx - 20 * sc, ny + 62 * sc]];
        bands.setAttribute('d', loopS(bp, k + 22, t, 0.5, false)); bandsR.setAttribute('d', [ringS(bp, k + 23, t, 3, 0.5, false), lineS([[nx, ny + 6 * sc], [nx, ny + 60 * sc]], k + 24, t, 2.5)].join(' '));
        if (K.quill) {
          const h = r.hand, qp = [[h[0], h[1]], [h[0] + 30 * sc, h[1] - 90 * sc], [h[0] + 52 * sc, h[1] - 120 * sc], [h[0] + 18 * sc, h[1] - 60 * sc]];
          quill.setAttribute('d', loopS(qp, k + 25, t, 0.6)); quillR.setAttribute('d', [ringS(qp, k + 26, t, 3, 0.6), lineS([[h[0] - 4, h[1] + 12 * sc], [h[0] + 40 * sc, h[1] - 108 * sc]], k + 27, t, 2.5)].join(' '));
        }
        return r;
      },
    };
  }

  // ------------------------------------------------------------------ glass tube on a wooden pole + foot ruler + blood column
  function tube(parent, sd, W, H) {
    const g = el(parent, 'g');
    const pole = inkEl(g, WOOD()), glass = inkEl(g, GLASS(), { 'fill-opacity': 0.75 }), blood = inkEl(g, BLOOD()), shine = inkEl(g, INK.paperLight), r = inkEl(g), ties = inkEl(g, mix(INK.stain, INK.ink, 0.3)), mark = inkEl(g, INK.gold);
    const nums = Array.from({ length: 9 }, (_, i) => { const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': 50, 'text-anchor': 'end', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` }); tx.textContent = String(i + 1); return tx; });
    return {
      update(t, T, feet, opts = {}) {
        const x = T.x * W, base = T.base * H, ft = T.ft ?? 88, len = T.len ?? 9, top = base - len * ft, k = sd * 11, hw = T.w ?? 15;
        const pa = T.pulseAmp ?? 10, pulse = T.pulse === false ? 0 : (Math.pow(Math.max(0, Math.sin(t * 5.2)), 6) * pa - pa * 0.3) * clamp01(feet);
        const lv = base - Math.max(0, feet * ft + pulse), al = T.alpha ?? 1;
        [[pole, 1], [glass, 0.75], [blood, 1], [shine, 1], [r, T.outline ? 1 / al : 1], [ties, 1], [mark, 1]].forEach(([e, o]) => e.setAttribute('fill-opacity', Math.min(1, o * al).toFixed(3)));
        // pole behind the tube (right side) with rope ties
        const px = x + 46, pp = [[px - 14, top - 40], [px + 14, top - 40], [px + 16, base + 40], [px - 16, base + 40]];
        fill(pole, pp, k + 1, t, 0.6, false);
        const gp = [[x - hw, top], [x + hw, top], [x + hw, base], [x - hw, base]];
        fill(glass, gp, k + 2, t, 0.4, false);
        if (feet > 0.01) fill(blood, [[x - hw + 3, lv + 6], [x, lv - 2], [x + hw - 3, lv + 6], [x + hw - 3, base], [x - hw + 3, base]], k + 3, t, 0.4, false); else blood.setAttribute('d', '');
        shine.setAttribute('d', lineS([[x - 6, top + 20], [x - 6, base - 20]], k + 4, t, 4, 0.3));
        const R = [lineS([[x - hw, top], [x - hw, base]], k + 5, t, 4, 0.5), lineS([[x + hw, top], [x + hw, base]], k + 6, t, 4, 0.5), ringS(ell(x, top, hw, 6, 10), k + 7, t, 3.5, 0.4), ringS(pp, k + 8, t, 4, 0.6, false)];
        const TI = [];
        for (let i = 1; i < len; i += 2) { const yy = base - i * ft; TI.push(lineS([[x - hw - 6, yy - 6], [px + 18, yy + 4]], k + 20 + i, t, 7, 0.5), lineS([[x - hw - 6, yy + 8], [px + 18, yy + 18]], k + 40 + i, t, 5, 0.5)); }
        ties.setAttribute('d', TI.join(' '));
        // foot ruler on the left of the tube
        const show = T.ruler !== false;
        nums.forEach((tx, i) => { const yy = base - (i + 1) * ft; tx.setAttribute('opacity', show ? (T.alpha ?? 1) : 0); tx.setAttribute('x', f1(x - hw - 40)); tx.setAttribute('y', f1(yy + 17)); });
        if (show) for (let i = 1; i <= len; i++) { const yy = base - i * ft; R.push(lineS([[x - hw - 30, yy], [x - hw - 2, yy]], k + 60 + i, t, 4, 0.4)); R.push(lineS([[x - hw - 16, yy + ft / 2], [x - hw - 2, yy + ft / 2]], k + 80 + i, t, 2.5, 0.4)); }
        r.setAttribute('d', R.join(' '));
        // gold mark at the top of the column
        const mp = opts.mark ?? 0;
        if (mp > 0.01) { const yy = base - feet * ft, D = []; for (let i = 0; i < 9; i++) { const a0 = i / 9, a1 = (i + 0.55) / 9; if (a0 > mp) break; D.push(lineS([[x + lerp(-110, 230, a0), yy], [x + lerp(-110, 230, Math.min(a1, mp)), yy]], k + 100 + i, t, 7)); } mark.setAttribute('d', D.join(' ')); } else mark.setAttribute('d', '');
        return { top, base, level: lv, x };
      },
    };
  }

  // ------------------------------------------------------------------ straw floor (strokes from y0 to the frame bottom) + hay bales
  function straw(parent, sd, W, H, n = 170) {
    const g = el(parent, 'g'), floor = inkEl(g, mix(INK.stain, INK.paperDark, 0.55), { 'fill-opacity': 0.5 }), st = inkEl(g, STRAW()), dk = inkEl(g, mix(INK.stain, INK.ink, 0.35));
    const R = rng(sd), S = Array.from({ length: n }, () => ({ u: R(), v: R(), a: R() * Math.PI, L: 30 + R() * 50, d: R() < 0.25 }));
    return {
      update(t, y0) {
        const k = sd * 3, A = [], D = [];
        fill(floor, [[-30, y0], [W + 30, y0], [W + 30, H + 30], [-30, H + 30]], k + 1, t, 0.6, false);
        S.forEach((p, i) => { const y = y0 + Math.pow(p.v, 0.85) * (H - y0 + 20), sc = 0.7 + (y - y0) / (H - y0) * 0.9, x = p.u * W, a = p.a + Math.sin(t * 0.8 + i) * 0.04, L = p.L * sc;
          (p.d ? D : A).push(lineS([[x - Math.cos(a) * L / 2, y - Math.sin(a) * L * 0.3], [x + Math.cos(a) * L / 2, y + Math.sin(a) * L * 0.3]], k + 10 + i, t, (p.d ? 3 : 5) * sc, 0.6)); });
        st.setAttribute('d', A.join(' ')); dk.setAttribute('d', D.join(' '));
      },
    };
  }
  function bales(parent, sd) {
    const g = el(parent, 'g'), f = inkEl(g, mix(STRAW(), INK.paperLight, 0.25)), sideF = inkEl(g, mix(STRAW(), INK.ink, 0.15)), r = inkEl(g), tw = inkEl(g, mix(INK.stain, INK.ink, 0.4));
    return {
      update(t, list) {
        const k = sd * 5, F = [], S = [], L = [], T = [];
        list.forEach((b, i) => { const { x, y, w, h } = b, d = w * 0.25;
          const fp = [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]], tp = [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 + d, y - h - d * 0.5], [x - w / 2 + d, y - h - d * 0.5]], sp = [[x + w / 2, y], [x + w / 2 + d, y - d * 0.5], [x + w / 2 + d, y - h - d * 0.5], [x + w / 2, y - h]];
          F.push(loopS(fp, k + i * 9, t, 0.8, false), loopS(tp, k + i * 9 + 1, t, 0.8, false)); S.push(loopS(sp, k + i * 9 + 2, t, 0.8, false));
          L.push(ringS(fp, k + i * 9 + 3, t, 4, 0.8, false), ringS(tp, k + i * 9 + 4, t, 3.5, 0.8, false), ringS(sp, k + i * 9 + 5, t, 3.5, 0.8, false));
          for (let j = 0; j < 6; j++) L.push(lineS([[x - w / 2 + 10 + j * w / 6, y - h + 14], [x - w / 2 + 24 + j * w / 6, y - 12]], k + 300 + i * 9 + j, t, 2, 0.6));
          [0.3, 0.7].forEach((u, j) => T.push(lineS([[x - w / 2 + u * w, y], [x - w / 2 + u * w, y - h], [x - w / 2 + u * w + d, y - h - d * 0.5]], k + 500 + i * 3 + j, t, 5, 0.5))); });
        f.setAttribute('d', F.join(' ')); sideF.setAttribute('d', S.join(' ')); r.setAttribute('d', L.join(' ')); tw.setAttribute('d', T.join(' '));
      },
    };
  }
  // hanging lantern with a flickering glow
  function lantern(parent, sd) {
    const g = el(parent, 'g'), glow = inkEl(g, INK.gold, { 'fill-opacity': 0.22 }), body = inkEl(g, mix(INK.ink, INK.inkSoft, 0.2)), fl = inkEl(g, INK.gold), r = inkEl(g);
    return {
      update(t, x, y) {
        const k = sd * 5, sw = Math.sin(t * 1.1) * 0.05, cx = x + Math.sin(sw) * 260, cy = y, fk = 1 + 0.12 * Math.sin(t * 13) + 0.06 * Math.sin(t * 7.3);
        glow.setAttribute('d', loopS(ell(cx, cy + 40, 170 * fk, 170 * fk, 18), k + 1, t, 1));
        const bp = [[cx - 40, cy], [cx + 40, cy], [cx + 34, cy + 100], [cx - 34, cy + 100]];
        body.setAttribute('d', [loopS([[cx - 50, cy - 10], [cx + 50, cy - 10], [cx + 36, cy - 34], [cx - 36, cy - 34]], k + 2, t, 0.5, false), loopS([[cx - 46, cy + 100], [cx + 46, cy + 100], [cx + 46, cy + 118], [cx - 46, cy + 118]], k + 3, t, 0.5, false)].join(' '));
        fl.setAttribute('d', loopS([[cx - 14, cy + 80], [cx, cy + 30 - 8 * fk], [cx + 14, cy + 80]], k + 4, t, 1.2));
        r.setAttribute('d', [ringS(bp, k + 5, t, 4, 0.5, false), lineS([[x, -40], [cx, cy - 34]], k + 6, t, 4), lineS([[cx, cy], [cx, cy + 100]], k + 7, t, 2.5), ringS(ell(cx, cy - 46, 14, 12, 8), k + 8, t, 3)].join(' '));
      },
    };
  }

  // giant words (Fraunces 900, highlight in a red box)
  function words(parent, P, W, H, sd) {
    const out = [];
    (P.lines || []).forEach((Ln, li) => {
      const size = Ln.size || 130, y = (Ln.y ?? 0.17 + li * 0.09) * H;
      const ts = Ln.words.map(w => { const g = el(parent, 'g'); const box = inkEl(g, INK.red), boxR = inkEl(g); const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` }); tx.textContent = w; return { g, box, boxR, tx, w, hl: w === P.highlight }; });
      const ws = ts.map(o => { let w = 0; try { w = o.tx.getComputedTextLength(); } catch (e) { w = 0; } return w || o.w.length * size * 0.6; });
      const gap = size * 0.32, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1), sc = Math.min(1, (W - 120) / tot);
      let x = W / 2 - tot * sc / 2;
      ts.forEach((o, i) => { o.x = x + ws[i] * sc / 2; o.y = y; o.ww = ws[i]; o.size = size; o.sc = sc; o.at = (Ln.at || [])[i]; o.k = li * 10 + i; x += (ws[i] + gap) * sc; out.push(o); });
    });
    return {
      update(lt, t, cues) {
        out.forEach(o => {
          const a = atOr(cues, o.at, 0.1 + o.k * 0.2), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5), b = boil(sd + 50 + o.k, t, 1.2);
          o.g.setAttribute('opacity', clamp01(p * 3).toFixed(3));
          o.g.setAttribute('transform', `translate(${f1(o.x + b[0])} ${f1(o.y + b[1])}) rotate(${f1((o.hl ? -3 : 0) + (1 - p) * -6)}) scale(${(o.sc * lerp(0.4, 1, p) * (1 + 0.08 * pk)).toFixed(3)})`);
          o.tx.setAttribute('y', f1(o.size * 0.35));
          if (o.hl) {
            o.tx.setAttribute('fill', INK.paperLight); o.tx.setAttribute('style', '');
            const bw = o.ww + 50, bh = o.size * 1.25, pts = [[-bw / 2, -bh / 2], [bw / 2, -bh / 2 - 4], [bw / 2 + 3, bh / 2], [-bw / 2 - 2, bh / 2 + 3]];
            o.box.setAttribute('d', inkLoop(pts, { seed: sd + 60 + o.k, t, smooth: false })); o.boxR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 70 + o.k, t, closed: true, smooth: false }));
          }
        });
      },
    };
  }

  const person = (parent, K, sd) => window.TD.figure(el(parent, 'g'), K, sd);
  // blood level (feet) of a TUBE spec at lt
  const level = (T, lt, cues) => { const to = T.to ?? 8.25, from = T.from ?? 0; if (T.at == null) return to; const a = atNum(cues, T.at, 0); return lt < a ? from : lerp(from, to, prog(lt, a, T.dur ?? 2)); };
  // brass pipe from p0 to p1 (with a joint ring at p1)
  function pipe(parent, sd) {
    const g = el(parent, 'g'), f = inkEl(g, BRASS()), hi = inkEl(g, mix(INK.gold, INK.paperLight, 0.4)), r = inkEl(g);
    return {
      update(t, p0, p1, w = 22) {
        const k = sd * 3, mid = [(p0[0] + p1[0]) / 2, Math.max(p0[1], p1[1]) + 18];
        f.setAttribute('d', lineS([p0, mid, p1], k + 1, t, w, 0.4));
        hi.setAttribute('d', lineS([[p0[0], p0[1] - w * 0.2], [mid[0], mid[1] - w * 0.2], [p1[0], p1[1] - w * 0.2]], k + 2, t, w * 0.22, 0.3));
        r.setAttribute('d', [inkPath([p0, mid, p1], { w: 3.5, seed: k + 3, t, amp: 0.4 }), ringS(ell(p1[0], p1[1], w * 0.75, w, 10), k + 4, t, 4, 0.4)].join(' '));
      },
    };
  }

  // ================================================================== hp_barn
  SH.hp_barn = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3101, top = el(svg, 'g'), root = el(top, 'g');
      const gy = (P.ground ?? 0.57) * H;
      const back = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.5), { 'fill-opacity': 0.0 });
      const wallR = inkEl(root, INK.inkSoft);
      const lan = P.lantern === false ? null : lantern(el(root, 'g'), sd + 1);
      const fl = straw(el(root, 'g'), sd + 2, W, H);
      const bl = P.bales ? bales(el(root, 'g'), sd + 3) : null;
      const TU = P.tube === false ? null : Object.assign({ x: 0.24, base: 0.58, ft: 88 }, P.tube || {});
      const tu = TU ? tube(el(root, 'g'), sd + 4, W, H) : null;
      const hl = P.hales ? parson(el(root, 'g'), P.hales, sd + 5) : null;
      const MA = Object.assign({ x: 0.6, y: 0.6, s: 1, face: 1 }, P.mare || {});
      const ma = mareLying(el(root, 'g'), sd + 6);
      const pp = TU ? pipe(el(root, 'g'), sd + 7) : null;
      const kas = P.kasif ? person(root, P.kasif, sd + 8) : null;
      const motes = P.motes ? inkEl(root, mix(INK.gold, INK.paperLight, 0.45)) : null, MR = rng(sd + 77), MT = Array.from({ length: 24 }, () => [MR(), MR(), MR()]);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5)), k = sd;
          if (motes) { const D = []; MT.forEach(([u, v, w], i) => { const yy = ((v - t * (0.05 + w * 0.06)) % 1 + 1) % 1, x = (0.15 + u * 0.8) * W + Math.sin(t * 1.3 + i) * 30, y = (0.2 + yy * 0.75) * H; D.push(inkDot(x, y, 3 + w * 3, 3 + w * 3, k + 900 + i, t)); }); motes.setAttribute('d', D.join(' ')); }
          // barn wall planks + beams above the floor
          const WR = []; for (let i = 0; i < 9; i++) { const x = (i + 0.5) * W / 8.5; WR.push(lineS([[x, 0], [x + 4, gy - 4]], k + 10 + i, t, 2.5, 0.6)); }
          WR.push(lineS([[-30, gy], [W + 30, gy]], k + 30, t, 6), lineS([[-30, 0.17 * H], [W + 30, 0.165 * H]], k + 31, t, 14));
          wallR.setAttribute('d', WR.join(' ')); back.setAttribute('d', '');
          if (lan) lan.update(t, (P.lantern?.x ?? 0.8) * W, (P.lantern?.y ?? 0.22) * H);
          fl.update(t, gy);
          if (bl) bl.update(t, (P.bales.list || [{ x: 0.1, y: 0.04, w: 260, h: 150 }]).map(b => ({ x: b.x * W, y: gy + b.y * H, w: b.w, h: b.h })));
          const ra = P.ropes === true || P.ropes == null ? null : atNum(cues, P.ropes, null), rp = P.ropes === false ? 0 : ra == null ? 1 : lt >= ra ? progIO(lt, ra, 0.8) : 0;
          const m = ma.update(t, { x: MA.x * W, y: MA.y * H, s: MA.s * (1 + 0.03 * hit), face: MA.face, ropes: rp, nod: MA.nod });
          let tr = null;
          if (tu) { const ft = level(TU, lt, cues), ma2 = TU.mark ? atNum(cues, TU.mark, null) : null; tr = tu.update(t, TU, ft, { mark: ma2 != null && lt >= ma2 ? prog(lt, ma2, 0.6) : 0 }); }
          if (pp && tr) pp.update(t, m.thigh, [tr.x, tr.base]);
          if (hl) hl.update(lt, t, cues, W, H);
          if (kas) kas.update(lt, t, cues, W, H);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hp_leg (close-up)
  SH.hp_leg = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3201, top = el(svg, 'g'), root = el(top, 'g');
      const fl = straw(el(root, 'g'), sd + 1, W, H, 120);
      const tubeG = el(root, 'g'), glass = inkEl(tubeG, GLASS(), { 'fill-opacity': 0.8 }), blood = inkEl(tubeG, BLOOD()), shine = inkEl(tubeG, INK.paperLight), tubeR = inkEl(tubeG);
      const thigh = inkEl(root, COAT()), thighD = inkEl(root, COAT_D(), { 'fill-opacity': 0.6 }), hair = inkEl(root, INK.inkSoft), thR = inkEl(root), hoofE = inkEl(root, mix(INK.ink, INK.inkSoft, 0.2)), stk = inkEl(root, WOOD()), ropeE = inkEl(root, mix(INK.stain, INK.ink, 0.3));
      const art = inkEl(root, mix(BLOOD(), INK.ink, 0.15)), artHi = inkEl(root, mix(BLOOD(), INK.paperLight, 0.35));
      const pp = pipe(el(root, 'g'), sd + 2);
      const thread = inkEl(root, INK.paperLight), threadR = inkEl(root);
      const sleeve = inkEl(root, mix(INK.ink, INK.inkSoft, 0.3)), lace = inkEl(root, INK.paperLight), hand = inkEl(root, INK.paperLight), handR = inkEl(root);
      const arrow = inkEl(root, INK.red);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const J = [Math.round(0.3 * W), Math.round(0.58 * H)];           // pipe/tube joint
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5)), br = Math.sin(t * 1.9) * 6;
          fl.update(t, 0.66 * H);
          // tube: lowered into place on tube.at (from above), blood surges on flow
          const ta = P.tube && P.tube.at != null ? atNum(cues, P.tube.at, 0) : -1, tp = lt >= ta ? prog(lt, ta, 0.9) : 0, drop = (1 - tp) * -700;
          const x = J[0], yb = J[1] + drop, hw = 18 * (1 + 0.04 * hit);
          const tt = (P.tubeTop ?? 0.16) * H + drop, gp = [[x - hw, tt], [x + hw, tt], [x + hw, yb], [x - hw, yb]];
          fill(glass, gp, k + 1, t, 0.4, false);
          const fa = P.flow ? atNum(cues, P.flow, null) : null, fp = fa != null && lt >= fa ? prog(lt, fa, 1.2) : 0;
          if (fp > 0.005) { const lv = lerp(yb, tt + 10, fp), wob = Math.sin(t * 9) * 6; fill(blood, [[x - hw + 3, lv + 8 + wob], [x, lv - 4], [x + hw - 3, lv + 8 - wob], [x + hw - 3, yb], [x - hw + 3, yb]], k + 2, t, 0.4, false); } else blood.setAttribute('d', '');
          shine.setAttribute('d', lineS([[x - 7, tt + 30], [x - 7, yb - 30]], k + 3, t, 5, 0.3));
          tubeR.setAttribute('d', [lineS([[x - hw, tt], [x - hw, yb]], k + 4, t, 5, 0.5), lineS([[x + hw, tt], [x + hw, yb]], k + 5, t, 5, 0.5), ringS(ell(x, tt, hw, 7, 10), k + 6, t, 4, 0.4)].join(' '));
          // belly + flank (upper right) and the near hind leg stretched out to the lower left
          const B = (u, v) => [u * W, v * H + br * (1 - v) * 0.5];
          const bel = [B(0.5, 0.62), B(0.55, 0.44), B(0.68, 0.32), B(0.88, 0.25), B(1.1, 0.22), B(1.1, 0.7), B(0.86, 0.68), B(0.64, 0.66)];
          const lg = limb(B(0.8, 0.63), B(0.44, 0.8), B(0.16, 0.87), 150, 64, 42);
          thigh.setAttribute('d', loopS(bel, k + 10, t, 0.8) + ' ' + loopS(lg, k + 14, t, 0.8));
          fill(thighD, [B(0.56, 0.6), B(0.7, 0.63), B(1.08, 0.64), B(1.08, 0.7), B(0.86, 0.69), B(0.62, 0.66)], k + 11, t, 0.8);
          const hc = B(0.16, 0.87), hf = [[hc[0] - 70, hc[1] - 40], [hc[0] - 10, hc[1] - 50], [hc[0] + 10, hc[1] + 40], [hc[0] - 80, hc[1] + 46]];
          hoofE.setAttribute('d', loopS(hf, k + 15, t, 0.5, false));
          const sx = 0.05 * W, sy = 0.96 * H, sp = [[sx - 18, sy - 110], [sx + 18, sy - 110], [sx + 14, sy + 30], [sx - 14, sy + 30]];
          stk.setAttribute('d', loopS(sp, k + 16, t, 0.6, false));
          ropeE.setAttribute('d', [lineS([[hc[0] + 20, hc[1] - 20], [hc[0] - 40, hc[1] + 40], [sx + 10, sy - 90]], k + 17, t, 14, 0.6), lineS([[hc[0] + 30, hc[1] - 60], [hc[0] + 40, hc[1] + 20]], k + 18, t, 12, 0.5)].join(' '));
          const HR = []; for (let i = 0; i < 12; i++) { const u = 0.62 + (i % 6) * 0.07, v = 0.38 + Math.floor(i / 6) * 0.1; HR.push(lineS([B(u, v), B(u + 0.025, v + 0.045)], k + 20 + i, t, 3, 0.5)); }
          for (let i = 0; i < 6; i++) { const u = 0.3 + i * 0.08, v = 0.8 + (0.86 - 0.8) * (0.6 - i * 0.1); HR.push(lineS([B(u, v), B(u - 0.03, v + 0.03)], k + 40 + i, t, 3, 0.5)); }
          hair.setAttribute('d', HR.join(' '));
          thR.setAttribute('d', [ringS(bel.slice(0, 5).concat([B(1.1, 0.7), B(0.86, 0.68), B(0.64, 0.66)]), k + 12, t, 7, 0.8), ringS(lg, k + 13, t, 6, 0.8), ringS(hf, k + 19, t, 4, 0.5, false), ringS(sp, k + 50, t, 4, 0.6, false), lineS([B(0.42, 0.74), B(0.47, 0.8), B(0.44, 0.86)], k + 51, t, 4, 0.6)].join(' '));
          // the artery: a short red vessel showing in the inner thigh
          const A0 = [0.56 * W, J[1] + 6], A1 = [0.86 * W, J[1] - 70];
          const pulse = 1 + 0.25 * Math.pow(Math.max(0, Math.sin(t * 5.2)), 6);
          art.setAttribute('d', lineS([A0, [0.7 * W, J[1] - 20], A1], k + 30, t, 30 * pulse, 0.5));
          artHi.setAttribute('d', lineS([[A0[0] + 10, A0[1] - 8], [0.7 * W, J[1] - 28], [A1[0] - 10, A1[1] - 8]], k + 31, t, 6, 0.4));
          // brass pipe from the artery to the tube foot (slides in on pipe.at)
          const pa = P.pipe && P.pipe.at != null ? atNum(cues, P.pipe.at, 0) : -1, pq = lt >= pa ? prog(lt, pa, 0.7) : 0;
          if (tp > 0.95 || !P.tube || P.tube.at == null) pp.update(t, [lerp(x + 40, 0.6 * W, pq), J[1]], [x, yb + 0], 30); else pp.update(t, [lerp(x + 40, 0.6 * W, pq), J[1]], [x + 40, J[1]], 30);
          // thread ligature around the artery (tied bow), pulled loose on untie
          const ua = P.untie ? atNum(cues, P.untie, null) : null, up = ua != null && lt >= ua ? prog(lt, ua, 0.7) : 0;
          const tx = 0.68 * W, ty = J[1] - 16, loopA = lerp(1, 0.2, up), pull = up * 220;
          const TH = [ringS(ell(tx, ty, 18 * loopA + 4, 36, 10), k + 40, t, 6, 0.5)];
          TH.push(lineS([[tx + 10, ty - 30], [tx + 40 + pull * 0.6, ty - 90 - pull], [tx + 70 + pull * 0.8, ty - 160 - pull * 1.4]], k + 41, t, 6, 0.6));
          if (up < 0.6) TH.push(ringS(ell(tx + 30, ty - 44, 22 * (1 - up), 12, 8), k + 42, t, 5, 0.5), ringS(ell(tx - 10, ty - 48, 20 * (1 - up), 12, 8), k + 43, t, 5, 0.5));
          threadR.setAttribute('d', TH.join(' ')); thread.setAttribute('d', '');
          // the parson's hand (lace cuff, black sleeve) holding the thread end
          if (P.hand !== false) {
            const hx = tx + 70 + pull * 0.8, hy = ty - 170 - pull * 1.4, sw = Math.sin(t * 2) * 6;
            const sp = [[hx + 40, hy - 30 + sw], [W + 40, hy - 260 + sw], [W + 40, hy - 80 + sw], [hx + 70, hy + 40 + sw]];
            sleeve.setAttribute('d', loopS(sp, k + 50, t, 0.8));
            lace.setAttribute('d', loopS([[hx + 20, hy - 40 + sw], [hx + 70, hy - 50 + sw], [hx + 90, hy + 50 + sw], [hx + 40, hy + 50 + sw]], k + 51, t, 1.4));
            hand.setAttribute('d', loopS(ell(hx, hy + sw * 0.5, 46, 40, 12), k + 52, t, 0.8));
            handR.setAttribute('d', [ringS(ell(hx, hy + sw * 0.5, 46, 40, 12), k + 53, t, 5), ringS([[hx + 20, hy - 40 + sw], [hx + 70, hy - 50 + sw], [hx + 90, hy + 50 + sw], [hx + 40, hy + 50 + sw]], k + 54, t, 3.5, 1.4), lineS([[hx - 30, hy - 8], [hx - 6, hy - 22]], k + 55, t, 4)].join(' '));
          } else HIDE(sleeve, lace, hand, handR);
          // red arrow up the tube ("9 FEET")
          if (P.arrow) { const aa = atNum(cues, P.arrow.at, 0.3), ap = lt >= aa ? prog(lt, aa, 0.8) : 0, ax = (P.arrow.x ?? 0.44) * W, y0 = (P.arrow.y0 ?? 0.5) * H, y1 = (P.arrow.y1 ?? 0.16) * H, ye = lerp(y0, y1, ap);
            arrow.setAttribute('d', ap > 0.01 ? [lineS([[ax, y0], [ax, ye]], k + 60, t, 10), lineS([[ax - 34, ye + 44], [ax, ye], [ax + 34, ye + 44]], k + 61, t, 10)].join(' ') : ''); }
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hp_tube
  SH.hp_tube = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3301, top = el(svg, 'g'), root = el(top, 'g');
      const TU = Object.assign({ x: 0.42, base: 0.6, ft: 92 }, P.tube || {});
      const fl = straw(el(root, 'g'), sd + 1, W, H, 110);
      const wallR = inkEl(root, INK.inkSoft);
      const boxF = inkEl(root, WOOD()), boxR = inkEl(root);
      const hl = P.hales ? parson(el(root, 'g'), P.hales, sd + 2) : null;
      const tu = tube(el(root, 'g'), sd + 3, W, H);
      const fG = el(root, 'g'), flank = inkEl(fG, COAT()), flankD = inkEl(fG, COAT_D(), { 'fill-opacity': 0.6 }), flankR = inkEl(fG);
      const lgG = el(root, 'g'), lgF = inkEl(lgG, COAT()), lgH = inkEl(lgG, mix(INK.ink, INK.inkSoft, 0.2)), lgS = inkEl(lgG, WOOD()), lgRope = inkEl(lgG, mix(INK.stain, INK.ink, 0.3)), lgR = inkEl(lgG), lgTail = inkEl(lgG, COAT_D());
      const pp = pipe(el(root, 'g'), sd + 4);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, gy = TU.base * H;
          const WR = []; for (let i = 0; i < 9; i++) { const x = (i + 0.3) * W / 8.5; WR.push(lineS([[x, 0], [x + 4, gy - 4]], k + 10 + i, t, 2.5, 0.6)); }
          WR.push(lineS([[-30, gy], [W + 30, gy]], k + 30, t, 6));
          wallR.setAttribute('d', WR.join(' '));
          fl.update(t, gy);
          if (P.box) { const bx = P.box.x * W, bt = P.box.y * H, bw = P.box.w ?? 280, bp = [[bx - bw / 2, bt], [bx + bw / 2, bt], [bx + bw / 2, gy + 20], [bx - bw / 2, gy + 20]], tp = [[bx - bw / 2, bt], [bx + bw / 2, bt], [bx + bw / 2 + 40, bt - 26], [bx - bw / 2 + 40, bt - 26]];
            boxF.setAttribute('d', loopS(bp, k + 80, t, 0.6, false) + ' ' + loopS(tp, k + 81, t, 0.6, false));
            boxR.setAttribute('d', [ringS(bp, k + 82, t, 5, 0.6, false), ringS(tp, k + 83, t, 4, 0.6, false), lineS([[bx - bw / 2 + 10, bt + 10], [bx + bw / 2 - 10, gy + 10]], k + 84, t, 4), lineS([[bx - bw / 2, (bt + gy) / 2], [bx + bw / 2, (bt + gy) / 2]], k + 85, t, 3)].join(' ')); }
          if (hl) hl.update(lt, t, cues, W, H);
          const ft = level(TU, lt, cues), mk = TU.mark ? atNum(cues, TU.mark, null) : null;
          const r = tu.update(t, TU, ft, { mark: mk != null && lt >= mk ? prog(lt, mk, 0.6) : 0 });
          if (P.leg) {
            const br = Math.sin(t * 1.9) * 5, A = [W + 80, 0.7 * H + br], Bk = [0.74 * W, 0.84 * H], C = [0.46 * W, 0.9 * H];
            const lp = limb(A, Bk, C, 170, 62, 40);
            const rump = ell(W + 60, 0.7 * H + br, 230, 200, 18);
            lgF.setAttribute('d', loopS(lp, k + 60, t, 0.8) + ' ' + loopS(rump, k + 61, t, 0.8));
            const tw = Math.sin(t * 1.5) * 20;
            lgTail.setAttribute('d', [lineS([[0.94 * W, 0.62 * H + br], [0.8 * W + tw, 0.7 * H], [0.7 * W + tw * 1.4, 0.76 * H]], k + 62, t, 40, 1.2), lineS([[0.95 * W, 0.63 * H + br], [0.84 * W + tw, 0.73 * H], [0.76 * W + tw, 0.79 * H]], k + 63, t, 22, 1.2)].join(' '));
            const hf = [[C[0] - 70, C[1] - 40], [C[0] - 6, C[1] - 52], [C[0] + 12, C[1] + 40], [C[0] - 82, C[1] + 48]];
            lgH.setAttribute('d', loopS(hf, k + 64, t, 0.5, false));
            const sx = 0.3 * W, sy = 0.97 * H, sp = [[sx - 18, sy - 110], [sx + 18, sy - 110], [sx + 14, sy + 30], [sx - 14, sy + 30]];
            lgS.setAttribute('d', loopS(sp, k + 65, t, 0.6, false));
            lgRope.setAttribute('d', lineS([[C[0] - 10, C[1] - 30], [C[0] - 60, C[1] + 30], [sx + 10, sy - 90]], k + 66, t, 14, 0.6));
            const HR = [ringS(lp, k + 67, t, 6, 0.8), ringS(rump, k + 68, t, 6, 0.8), ringS(hf, k + 69, t, 4, 0.5, false), ringS(sp, k + 70, t, 4, 0.6, false), lineS([[0.72 * W, 0.8 * H], [0.77 * W, 0.84 * H], [0.74 * W, 0.88 * H]], k + 71, t, 4, 0.6)];
            for (let i = 0; i < 6; i++) HR.push(lineS([[0.6 * W + i * 0.06 * W, 0.83 * H + (0.06 - i * 0.012) * H], [0.58 * W + i * 0.06 * W, 0.86 * H + (0.06 - i * 0.012) * H]], k + 72 + i, t, 3, 0.5));
            lgR.setAttribute('d', HR.join(' '));
            pp.update(t, [0.86 * W, 0.71 * H + br], [r.x, r.base], 26);
            HIDE(flank, flankD, flankR);
          } else if (P.flank !== false) {
            const br = Math.sin(t * 1.9) * 8, fp = [[-40, H + 40], [-40, 0.78 * H + br], [0.2 * W, 0.73 * H + br], [0.5 * W, 0.72 * H + br], [0.8 * W, 0.75 * H + br], [W + 40, 0.8 * H + br], [W + 40, H + 40]];
            fill(flank, fp, k + 40, t, 0.8); fill(flankD, [[-40, H + 40], [-40, 0.88 * H], [0.5 * W, 0.84 * H + br], [W + 40, 0.9 * H], [W + 40, H + 40]], k + 41, t, 0.8);
            const FR2 = [lineS(fp.slice(1, -1), k + 42, t, 7, 0.8)]; for (let i = 0; i < 10; i++) FR2.push(lineS([[0.08 * W + i * 0.09 * W, 0.8 * H + br], [0.1 * W + i * 0.09 * W, 0.84 * H + br]], k + 43 + i, t, 3, 0.5));
            flankR.setAttribute('d', FR2.join(' '));
            pp.update(t, [0.62 * W, 0.745 * H + br], [r.x, r.base], 26);
          } else HIDE(flank, flankD, flankR);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hp_book
  SH.hp_book = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3401, top = el(svg, 'g'), root = el(top, 'g');
      const dy = (P.desk ?? 0.6) * H;
      const shelf = inkEl(root, WOOD()), booksF = [INK.red, INK.blue, INK.green, INK.stain, INK.inkSoft].map(c => inkEl(root, mix(c, INK.paperDark, 0.25))), shelfR = inkEl(root);
      const hl = P.hales ? parson(el(root, 'g'), Object.assign({ quill: true }, P.hales), sd + 1) : null;
      const deskT = inkEl(root, mix(WOOD(), INK.paperLight, 0.2)), deskF = inkEl(root, mix(WOOD(), INK.ink, 0.12)), deskR = inkEl(root);
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.2 }), candle = inkEl(root, INK.paperLight), holder = inkEl(root, BRASS()), flame = inkEl(root, INK.gold), flameI = inkEl(root, INK.red, { 'fill-opacity': 0.8 }), cR = inkEl(root);
      const pageS = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.25)), page = inkEl(root, INK.paperLight), pageR = inkEl(root), writing = inkEl(root, INK.ink), sketch = inkEl(root, INK.inkSoft), sketchR = inkEl(root, INK.red);
      const ttl = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 40, 'text-anchor': 'middle', fill: INK.ink }); ttl.textContent = P.page || 'Haemastaticks';
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          // bookshelf on the wall, top right
          const sy = 0.3 * H, sx0 = 0.5 * W, sx1 = 1.04 * W, BK = [[], [], [], [], []], SR = [];
          fill(shelf, [[sx0, sy], [sx1, sy], [sx1, sy + 24], [sx0, sy + 24]], k + 1, t, 0.5, false);
          let bx = sx0 + 20; for (let i = 0; bx < sx1 - 40; i++) { const w = 38 + (i * 13) % 26, h = 150 + (i * 37) % 60, lean = i % 6 === 5 ? 18 : 0, pts = [[bx, sy], [bx + w, sy], [bx + w + lean, sy - h], [bx + lean, sy - h]]; BK[i % 5].push(loopS(pts, k + 10 + i, t, 0.5, false)); SR.push(ringS(pts, k + 40 + i, t, 3, 0.5, false), lineS([[bx + 8 + lean * 0.5, sy - h * 0.3], [bx + w - 8 + lean * 0.5, sy - h * 0.3]], k + 70 + i, t, 2.5, 0.4)); bx += w + 4; }
          BK.forEach((b, i) => booksF[i].setAttribute('d', b.join(' ')));
          SR.push(ringS([[sx0, sy], [sx1, sy], [sx1, sy + 24], [sx0, sy + 24]], k + 2, t, 4, 0.5, false));
          shelfR.setAttribute('d', SR.join(' '));
          if (hl) hl.update(lt, t, cues, W, H);
          // desk
          const front = dy + 120;
          fill(deskT, [[-30, dy], [W + 30, dy], [W + 30, front], [-30, front]], k + 3, t, 0.6, false);
          fill(deskF, [[-30, front], [W + 30, front], [W + 30, H + 30], [-30, H + 30]], k + 4, t, 0.6, false);
          const DR = [lineS([[-30, dy], [W + 30, dy]], k + 5, t, 5), lineS([[-30, front], [W + 30, front]], k + 6, t, 6)];
          [[0.06, 0.46], [0.54, 0.94]].forEach(([a, b], i) => { const p = [[a * W, front + 90], [b * W, front + 90], [b * W, front + 330], [a * W, front + 330]]; DR.push(ringS(p, k + 7 + i, t, 4.5, 0.6, false), inkCircle((a + b) / 2 * W, front + 210, 16, k + 9 + i, t)); });
          for (let i = 1; i < 5; i++) DR.push(lineS([[-30, front + 380 + i * 90], [W + 30, front + 384 + i * 90]], k + 12 + i, t, 2.5, 0.5));
          deskR.setAttribute('d', DR.join(' '));
          // candle on the left
          const cx = 0.085 * W, cb = dy + 70, ch = 220, fk = 1 + 0.12 * Math.sin(t * 12) + 0.07 * Math.sin(t * 7.7);
          glow.setAttribute('d', loopS(ell(cx, cb - ch - 40, 170 * fk, 170 * fk, 18), k + 20, t, 1));
          candle.setAttribute('d', loopS([[cx - 26, cb - 20], [cx + 26, cb - 20], [cx + 24, cb - ch], [cx - 24, cb - ch + 6]], k + 21, t, 0.5, false));
          holder.setAttribute('d', loopS(ell(cx, cb - 10, 80, 22, 14), k + 22, t, 0.6));
          flame.setAttribute('d', loopS([[cx - 18, cb - ch - 4], [cx - 12, cb - ch - 50], [cx + Math.sin(t * 9) * 6, cb - ch - 100 * fk], [cx + 12, cb - ch - 50], [cx + 18, cb - ch - 4]], k + 23, t, 1.2));
          flameI.setAttribute('d', loopS([[cx - 7, cb - ch - 6], [cx, cb - ch - 50 * fk], [cx + 7, cb - ch - 6]], k + 24, t, 1));
          cR.setAttribute('d', [ringS([[cx - 26, cb - 20], [cx + 26, cb - 20], [cx + 24, cb - ch], [cx - 24, cb - ch + 6]], k + 25, t, 4, 0.5, false), ringS(ell(cx, cb - 10, 80, 22, 14), k + 26, t, 4), lineS([[cx, cb - ch], [cx + 2, cb - ch - 18]], k + 27, t, 3)].join(' '));
          // open book on the desk (slight perspective), spine at the centre
          const s = 1 + 0.03 * hit, bxC = (P.book?.x ?? 0.47) * W, byT = dy - 20, bw = (P.book?.w ?? 0.27) * W * s, bh = 230 * s;
          const L = [[bxC - bw, byT + 20], [bxC, byT + 40], [bxC, byT + bh], [bxC - bw - 30, byT + bh - 20]], R = [[bxC, byT + 40], [bxC + bw, byT + 20], [bxC + bw + 30, byT + bh - 20], [bxC, byT + bh]];
          pageS.setAttribute('d', loopS([[bxC - bw - 40, byT + 30], [bxC + bw + 40, byT + 30], [bxC + bw + 44, byT + bh + 14], [bxC - bw - 44, byT + bh + 14]], k + 30, t, 0.5, false));
          page.setAttribute('d', [loopS(L, k + 31, t, 0.5, false), loopS(R, k + 32, t, 0.5, false)].join(' '));
          pageR.setAttribute('d', [ringS(L, k + 33, t, 4, 0.5, false), ringS(R, k + 34, t, 4, 0.5, false), lineS([[bxC, byT + 40], [bxC, byT + bh]], k + 35, t, 4)].join(' '));
          ttl.setAttribute('x', f1(bxC + bw / 2 + 10)); ttl.setAttribute('y', f1(byT + 90));
          // writing appears behind the quill on the right page
          const wa = atNum(cues, P.write, 0.2), WT = [];
          for (let i = 0; i < 4; i++) { const y = byT + 125 + i * 28, u = clamp01((lt - wa - i * 0.55) / 0.55); if (u <= 0) break; const x0 = bxC + 40, x1 = bxC + bw - 30, pts = []; for (let j = 0; j <= 12 * u; j++) pts.push([lerp(x0, x1, j / 12), y + Math.sin(j * 2.1 + i) * 5]); if (pts.length > 1) WT.push(lineS(pts, k + 40 + i, t, 3.5, 0.5)); }
          writing.setAttribute('d', WT.join(' '));
          // ink sketch on the left page: the mare lying, the tall tube with a red column
          const qx = bxC - bw / 2 + 30, qy = byT + bh - 50, SK = [ringS(ell(qx + 10, qy - 26, 100, 34, 14), k + 50, t, 3, 0.5), lineS([[qx + 100, qy - 40], [qx + 150, qy - 10]], k + 51, t, 3), ringS(ell(qx + 160, qy - 6, 22, 12, 8), k + 52, t, 2.5)];
          [-60, -20, 30, 70].forEach((dx, i) => SK.push(lineS([[qx + dx, qy - 4], [qx + dx - 10, qy + 34]], k + 53 + i, t, 3)));
          SK.push(lineS([[qx - 100, qy - 18], [qx - 140, qy - 18]], k + 58, t, 3), lineS([[qx - 146, qy - 14], [qx - 146, qy - 200]], k + 59, t, 3), lineS([[qx - 128, qy - 14], [qx - 128, qy - 200]], k + 60, t, 3));
          sketch.setAttribute('d', SK.join(' '));
          const rise = clamp01((lt - 0.2) / 1.6);
          sketchR.setAttribute('d', loopS([[qx - 143, qy - 16], [qx - 131, qy - 16], [qx - 131, qy - 16 - 170 * rise], [qx - 143, qy - 16 - 170 * rise]], k + 61, t, 0.3, false));
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hp_field
  SH.hp_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3501, top = el(svg, 'g'), root = el(top, 'g');
      const glow = P.sun ? inkEl(root, INK.gold, { 'fill-opacity': 0.35 }) : null;
      const chG = el(root, 'g'), chF = inkEl(chG, mix(INK.paperDark, INK.inkSoft, 0.35)), chR = inkEl(chG);
      const MA = Object.assign({ x: 0.62, y: 0.6, s: 1, face: 1, graze: 0 }, P.mare || {});
      const ma = mareStanding(el(root, 'g'), sd + 2);
      const kas = P.kasif ? person(root, P.kasif, sd + 8) : null;
      const grass = inkEl(root, mix(INK.green, INK.ink, 0.25)), flowers = inkEl(root, INK.gold), flowersR = inkEl(root, INK.red);
      const fence = inkEl(root, WOOD()), fenceR = inkEl(root);
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const R0 = rng(sd), GR = Array.from({ length: 90 }, () => [R0(), R0(), R0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          if (glow) { const c = [(P.sun.x ?? 0.8) * W, (P.sun.y ?? 0.4) * H]; glow.setAttribute('d', loopS(ell(c[0], c[1], 120, 120, 16), k + 1, t, 1)); }
          if (P.church) {
            const C = P.church, x = C.x * W, y = C.y * H, s = C.s ?? 1, Q = p => [x + p[0] * s, y + p[1] * s];
            const tw = [[-50, 0], [50, 0], [50, -230], [-50, -230]], sp = [[-58, -230], [58, -230], [0, -360]], nave = [[50, 0], [260, 0], [260, -120], [150, -170], [50, -120]];
            chF.setAttribute('d', [loopS(tw.map(Q), k + 2, t, 0.5, false), loopS(sp.map(Q), k + 3, t, 0.5, false), loopS(nave.map(Q), k + 4, t, 0.5, false)].join(' '));
            chR.setAttribute('d', [ringS(tw.map(Q), k + 5, t, 3.5, 0.5, false), ringS(sp.map(Q), k + 6, t, 3.5, 0.5, false), ringS(nave.map(Q), k + 7, t, 3.5, 0.5, false), lineS([[0, -360], [0, -400]].map(Q), k + 8, t, 3), lineS([[-14, -388], [14, -388]].map(Q), k + 9, t, 3), loopS([[-14, -150], [14, -150], [14, -110], [-14, -110]].map(Q), k + 10, t, 0.4, false)].join(' '));
          } else HIDE(chF, chR);
          const la = P.mare && P.mare.lift != null ? atNum(cues, P.mare.lift, null) : null;
          const gz = la != null ? lerp(MA.graze ?? 0.9, 0, lt >= la ? progIO(lt, la, 0.7) : 0) : MA.graze + Math.sin(t * 0.7) * 0.05;
          ma.update(t, { x: MA.x * W + Math.sin(t * 0.3) * 8, y: MA.y * H, s: MA.s * (1 + 0.03 * hit), face: MA.face, graze: clamp01(gz) });
          if (kas) kas.update(lt, t, cues, W, H);
          // grass + flowers from the ground to the frame bottom
          const gy = MA.y * H - 10, G = [], F = [], FR3 = [];
          GR.forEach(([u, v, w], i) => { const y = gy + Math.pow(v, 0.8) * (H - gy + 20), sc = 0.6 + (y - gy) / (H - gy) * 1.3, x = u * W, sw = Math.sin(t * 1.6 + i) * 6 * sc;
            G.push(lineS([[x, y], [x - 8 * sc + sw, y - 46 * sc]], k + 20 + i, t, 4 * sc, 0.6), lineS([[x + 10 * sc, y], [x + 18 * sc + sw, y - 38 * sc]], k + 120 + i, t, 3.5 * sc, 0.6));
            if (w < 0.18) (i % 2 ? F : FR3).push(loopS(ell(x - 8 * sc + sw, y - 50 * sc, 10 * sc, 10 * sc, 8), k + 220 + i, t, 0.6)); });
          grass.setAttribute('d', G.join(' ')); flowers.setAttribute('d', F.join(' ')); flowersR.setAttribute('d', FR3.join(' '));
          // wooden fence in the foreground
          if (P.fence !== false) {
            const fy = (P.fence?.y ?? 0.74) * H, FF = [], FL = [];
            [0, 1].forEach(j => { const yy = fy + j * 110, p = [[-30, yy], [W + 30, yy - 20], [W + 30, yy + 34 - 20], [-30, yy + 34]]; FF.push(loopS(p, k + 400 + j, t, 0.6, false)); FL.push(ringS(p, k + 402 + j, t, 4.5, 0.6, false)); });
            [0.08, 0.42, 0.78].forEach((u, i) => { const x = u * W, p = [[x - 28, fy - 70], [x + 28, fy - 74], [x + 30, H + 40], [x - 30, H + 40]]; FF.push(loopS(p, k + 410 + i, t, 0.6, false)); FL.push(ringS(p, k + 420 + i, t, 5, 0.6, false), lineS([[x - 14, fy + 40], [x - 10, fy + 300]], k + 430 + i, t, 2.5, 0.5)); });
            fence.setAttribute('d', FF.join(' ')); fenceR.setAttribute('d', FL.join(' '));
          } else HIDE(fence, fenceR);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== hp_cuff
  // P: {table: 0.5, dial: {x, y, r, to: 0.62 (needle share)} | false, ghost: TUBE (+alpha 0.35) | false,
  //     twin: TUBE | false (a second, full-ink column, e.g. today's normal reading), pump: cue, link: cue|false
  //     (gold arc ghost column top -> dial rim), labels}
  SH.hp_cuff = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 3601, top = el(svg, 'g'), root = el(top, 'g');
      const ty = (P.table ?? 0.5) * H;
      const GH = P.ghost === false ? null : Object.assign({ x: 0.88, base: P.table ?? 0.5, ft: 70, ruler: false, pulse: true, alpha: 0.35 }, P.ghost || {});
      const TW = P.twin ? Object.assign({ x: 0.6, base: P.table ?? 0.5, ft: 70, ruler: true, w: 20 }, P.twin) : null;
      const backG = el(root, 'g');
      const link = inkEl(root, INK.gold);
      const cloth = inkEl(root, mix(INK.paperLight, INK.blue, 0.1)), clothR = inkEl(root), legsT = inkEl(root, mix(WOOD(), INK.ink, 0.2));
      const knee = inkEl(root, mix(INK.blue, INK.ink, 0.25)), kneeR = inkEl(root), shoe = inkEl(root, INK.ink);
      const tabT = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.3)), tabR = inkEl(root);
      const steth = inkEl(root, INK.ink);
      const hose = inkEl(root, mix(INK.ink, INK.inkSoft, 0.2));
      const sleeve = inkEl(root, mix(INK.green, INK.paperLight, 0.35)), arm = inkEl(root, INK.paperLight), cuff = inkEl(root, mix(INK.blue, INK.ink, 0.15)), cuffHi = inkEl(root, mix(INK.blue, INK.paperLight, 0.4)), armR = inkEl(root);
      const bulb = inkEl(root, mix(INK.ink, INK.inkSoft, 0.15)), sl2 = inkEl(root, mix(INK.paperLight, INK.blue, 0.25)), hand2 = inkEl(root, INK.paperLight), bulbR = inkEl(root);
      const dialB = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.3)), dialF = inkEl(root, INK.paperLight), dialR = inkEl(root), needle = inkEl(root, INK.red);
      const DN = P.dial && P.dial.numbers ? [0, 60, 120, 180, 240, 300].map(v => { const tx = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 44, 'text-anchor': 'middle', fill: INK.ink }); tx.textContent = String(v); return tx; }) : [];
      const frontG = el(root, 'g');
      const gt = GH ? tube(el(P.front ? frontG : backG, 'g'), sd + 1, W, H) : null;
      const tw = TW ? tube(el(P.front ? frontG : backG, 'g'), sd + 2, W, H) : null;
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          let gr = null; if (gt) gr = gt.update(t, GH, level(GH, lt, cues));
          if (tw) tw.update(t, TW, level(TW, lt, cues), { mark: TW.mark != null && lt >= atNum(cues, TW.mark, 0) ? prog(lt, atNum(cues, TW.mark, 0), 0.6) : 0 });
          // table top, cloth hanging over the front, legs, the patient's knee + shoe below
          const front = ty + 100, hem = ty + 470;
          fill(tabT, [[-30, ty], [W + 30, ty], [W + 30, front], [-30, front]], k + 1, t, 0.5, false);
          const hp = [[-30, front]]; for (let i = 0; i <= 12; i++) hp.push([i * W / 12, hem + (i % 2 ? 26 : 0) + Math.sin(t * 0.8 + i) * 4]); hp.push([W + 30, front]);
          fill(cloth, hp, k + 2, t, 0.6, false);
          const CR = [lineS([[-30, ty], [W + 30, ty]], k + 3, t, 5), lineS([[-30, front], [W + 30, front]], k + 4, t, 5), lineS(hp.slice(1, -1), k + 5, t, 5, 0.6)];
          for (let i = 1; i < 6; i++) CR.push(lineS([[i * W / 6, front + 10], [i * W / 6 + 10, hem - 10]], k + 6 + i, t, 2.5, 0.5));
          tabR.setAttribute('d', CR.slice(0, 2).join(' ')); clothR.setAttribute('d', CR.slice(2).join(' '));
          legsT.setAttribute('d', [lineS([[0.12 * W, hem + 10], [0.12 * W, H + 40]], k + 20, t, 30), lineS([[0.9 * W, hem + 10], [0.9 * W, H + 40]], k + 21, t, 30)].join(' '));
          const kp = [[0.2 * W, hem + 60], [0.62 * W, hem + 90], [0.66 * W, hem + 220], [0.58 * W, H + 40], [0.36 * W, H + 40], [0.36 * W, hem + 240], [0.16 * W, hem + 220]];
          // clinic floor tiles under the table (perspective lines) instead of a figure
          const fy0 = hem + 120, FT = [lineS([[-30, fy0], [W + 30, fy0]], k + 22, t, 4)];
          for (let i = 1; i < 5; i++) { const yy = fy0 + Math.pow(i / 4, 1.4) * (H - fy0); FT.push(lineS([[-30, yy], [W + 30, yy]], k + 23 + i, t, 2.5, 0.5)); }
          for (let i = -4; i <= 4; i++) FT.push(lineS([[W / 2 + i * 120, fy0], [W / 2 + i * 330, H + 30]], k + 30 + i + 4, t, 2.5, 0.5));
          kneeR.setAttribute('d', FT.join(' ')); knee.setAttribute('d', ''); shoe.setAttribute('d', '');
          // stethoscope hanging over the cloth on the right
          const sw = Math.sin(t * 1.2) * 8;
          steth.setAttribute('d', [lineS([[0.78 * W, ty + 40], [0.8 * W, front + 120], [0.76 * W + sw, front + 260]], k + 26, t, 7), inkCircle(0.76 * W + sw, front + 290, 30, k + 27, t, { w: 7 })].join(' '));
          // pump: the hand squeezes the bulb in beats
          const pa = atNum(cues, P.pump, 0.3), on = lt >= pa, sq = on ? Math.pow(Math.max(0, Math.sin((lt - pa) * 6)), 2) : 0;
          const D = P.dial === false ? null : Object.assign({ x: 0.47, y: 0.27, r: 170, to: 0.62 }, P.dial || {});
          const cuffC = [0.27 * W, ty - 20], bulbC = [0.84 * W, ty + 30];
          const HO = P.bulb === false ? [] : [lineS([[cuffC[0] + 110, cuffC[1] - 60], [0.6 * W, ty - 120], [bulbC[0] - 70, bulbC[1] - 30]], k + 30, t, 11, 0.6)];
          if (D) HO.push(lineS([[cuffC[0] + 60, cuffC[1] - 70], [cuffC[0] + 80, D.y * H + D.r + 120], [D.x * W, D.y * H + D.r + 10]], k + 31, t, 11, 0.6));
          hose.setAttribute('d', HO.join(' '));
          // the patient's arm: sleeve at the left edge, upper arm in the cuff, elbow, forearm, hand with fingers
          const ay = ty - 20, ax = P.arm ?? 1, X = v => v * ax;
          sleeve.setAttribute('d', loopS([[-40, ay - 90], [0.08 * W, ay - 96], [0.1 * W, ay + 70], [-40, ay + 70]], k + 40, t, 0.6));
          const ap = [[-30, ay - 70], [X(0.44) * W, ay - 50], [X(0.5) * W, ay - 46], [X(0.66) * W, ay - 30], [X(0.7) * W, ay - 26], [X(0.7) * W, ay + 26], [X(0.66) * W, ay + 30], [X(0.48) * W, ay + 52], [-30, ay + 62]];
          arm.setAttribute('d', loopS(ap, k + 41, t, 0.6) + ' ' + loopS(ell(X(0.74) * W, ay + 4, 52, 40, 12), k + 42, t, 0.6));
          const cw = 1 + 0.05 * sq, cp = [[0.13 * W, ay - 86 * cw], [0.38 * W, ay - 80 * cw], [0.39 * W, ay + 72 * cw], [0.12 * W, ay + 78 * cw]];
          cuff.setAttribute('d', loopS(cp, k + 43, t, 0.5, false));
          cuffHi.setAttribute('d', [lineS([[0.16 * W, ay - 50], [0.36 * W, ay - 46]], k + 44, t, 6, 0.4), lineS([[0.16 * W, ay + 40], [0.36 * W, ay + 44]], k + 45, t, 6, 0.4)].join(' '));
          const AR = [ringS(ap, k + 46, t, 5, 0.6), ringS(cp, k + 47, t, 5, 0.5, false), lineS([[0.26 * W, ay - 82], [0.26 * W, ay + 74]], k + 48, t, 3), ringS(ell(X(0.74) * W, ay + 4, 52, 40, 12), k + 49, t, 5)];
          for (let i = 0; i < 4; i++) AR.push(ringS([[X(0.76) * W, ay - 26 + i * 18], [X(0.76) * W + 0.06 * W, ay - 30 + i * 20], [X(0.76) * W + 0.06 * W, ay - 20 + i * 20], [X(0.76) * W, ay - 14 + i * 18]], k + 50 + i, t, 3.5, 0.5, false));
          AR.push(lineS([[X(0.47) * W, ay - 40], [X(0.5) * W, ay - 10], [X(0.48) * W, ay + 30]], k + 55, t, 3, 0.5));   // elbow crease
          armR.setAttribute('d', AR.join(' '));
          // squeezing hand on the bulb (a second person's hand from the right, blue sleeve)
          if (P.bulb === false) HIDE(bulb, sl2, hand2, bulbR); else {
          const bs = 1 - 0.18 * sq, bp = ell(bulbC[0], bulbC[1], 70 * bs, 52 / Math.max(0.8, bs), 14);
          bulb.setAttribute('d', loopS(bp, k + 60, t, 0.6));
          sl2.setAttribute('d', loopS([[bulbC[0] + 60, bulbC[1] - 60], [W + 40, bulbC[1] - 110], [W + 40, bulbC[1] + 70], [bulbC[0] + 70, bulbC[1] + 50]], k + 61, t, 0.6));
          const hx = bulbC[0] + 30, hw2 = 1 - 0.1 * sq;
          hand2.setAttribute('d', loopS(ell(hx, bulbC[1] - 6, 58 * hw2, 46, 12), k + 62, t, 0.6));
          const BR = [ringS(bp, k + 63, t, 4.5), lineS([[bulbC[0] - 66, bulbC[1] - 10], [bulbC[0] - 110, bulbC[1] - 24]], k + 64, t, 10), ringS(ell(hx, bulbC[1] - 6, 58 * hw2, 46, 12), k + 65, t, 4.5)];
          for (let i = 0; i < 3; i++) BR.push(lineS([[hx - 10 - i * 4, bulbC[1] - 30 + i * 22], [hx - 60 * hw2 - i * 4, bulbC[1] - 26 + i * 24]], k + 66 + i, t, 4, 0.5));
          BR.push(ringS([[bulbC[0] + 60, bulbC[1] - 60], [W + 40, bulbC[1] - 110], [W + 40, bulbC[1] + 70], [bulbC[0] + 70, bulbC[1] + 50]], k + 70, t, 4, 0.6));
          bulbR.setAttribute('d', BR.join(' ')); }
          // dial gauge
          if (D) {
            const dx = D.x * W, dyy = D.y * H, dr = D.r * (1 + 0.04 * hit);
            dialB.setAttribute('d', loopS(ell(dx, dyy, dr + 22, dr + 22, 20), k + 80, t, 0.6));
            dialF.setAttribute('d', loopS(ell(dx, dyy, dr, dr, 20), k + 81, t, 0.6));
            const DRr = [ringS(ell(dx, dyy, dr + 22, dr + 22, 20), k + 82, t, 5), ringS(ell(dx, dyy, dr, dr, 20), k + 83, t, 4)];
            const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
            for (let i = 0; i <= 30; i++) { const a = lerp(a0, a1, i / 30), L = i % 5 ? 0.88 : 0.78; DRr.push(lineS([[dx + Math.cos(a) * dr * L, dyy + Math.sin(a) * dr * L], [dx + Math.cos(a) * dr * 0.95, dyy + Math.sin(a) * dr * 0.95]], k + 90 + i, t, i % 5 ? 2.5 : 5, 0.3)); }
            DRr.push(inkCircle(dx, dyy, 16, k + 130, t, { w: 5 }));
            DN.forEach((tx, i) => { const a = lerp(a0, a1, i / 5), b = boil(k + 400 + i, t, 1); tx.setAttribute('x', f1(dx + Math.cos(a) * dr * 0.58 + b[0])); tx.setAttribute('y', f1(dyy + Math.sin(a) * dr * 0.58 + 15 + b[1])); });
            dialR.setAttribute('d', DRr.join(' '));
            const np = on ? prog(lt, pa, 1.4) : 0, beat = on ? Math.pow(Math.max(0, Math.sin(t * 5.2)), 6) * 0.05 : 0, na = lerp(lerp(a0, a1, D.from ?? 0) + 0.05, lerp(a0, a1, D.to), np) + beat;
            needle.setAttribute('d', lineS([[dx - Math.cos(na) * 30, dyy - Math.sin(na) * 30], [dx + Math.cos(na) * dr * 0.86, dyy + Math.sin(na) * dr * 0.86]], k + 131, t, 8, 0.3));
            // gold dashed arc: old column top -> dial rim
            if (gr && P.link) {
              const la = atNum(cues, P.link, dur * 0.5), u = lt >= la ? clamp01((lt - la) / 0.7) : 0, a = [gr.x - 26, gr.level], b = [dx + dr * 0.72, dyy - dr * 0.72], DD = [];
              for (let i = 0; i < 12; i++) { const a0b = i / 12, a1b = (i + 0.55) / 12; if (a0b > u) break; const mid = v => [lerp(a[0], b[0], v), lerp(a[1], b[1], v) - Math.sin(v * Math.PI) * 120]; DD.push(lineS([mid(a0b), mid(Math.min(a1b, u))], k + 140 + i, t, 8)); }
              if (u >= 1) DD.push(inkCircle(b[0], b[1], 12, k + 160, t, { fill: true }));
              link.setAttribute('d', DD.join(' '));
            } else link.setAttribute('d', '');
          } else { HIDE(dialB, dialF, dialR, needle, link); }
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
