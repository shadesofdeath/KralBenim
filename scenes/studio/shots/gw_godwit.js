// gw_godwit: shots for the Stickstory Short "The godwit that flew 11 days nonstop" (2026-11-08): in October 2022 a
// five-month-old bar-tailed godwit (satellite tag 234684) left Alaska and flew about 13,560 km (8,400+ miles) nonstop
// to Ansons Bay, Tasmania, in 11 days and 1 hour (Guinness World Records). Before migrating godwits get extremely fat
// and their digestive organs (gizzard, liver, gut) shrink (Piersma & Gill 1998, USGS). Parchment ink style
// (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure
// function of (seed, lt); no Math.random. Parametric: any "bird on a long flight" story. Uses lh__lib.js (LH.kasif,
// LH.label).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = label {text, x, y, at, size, color: ink|red|gold|blue|paper, font: hand|serif, card, rot, underline}
//   bird = {x, y (0..1), s (scale; ~400 px long at 1), face: 1|-1, fat: 0..1}; gy: ground line 0..1 H
//
// SHOTS.gw_sky — the godwit flying over open water (sets "ocean" / "storm"). P: {mode: "hook"|"none"|"storm", bird,
//   sea: top of the foreground swell 0..1 H, icons: [x, y, r] row (none: worm / water drop / bed, each pops on cue
//   i0/i1/i2 and is crossed out red), labels}. storm: a big wave crest rears up under the bird at cue "sea", the bird
//   pulls up; rain streaks.
// SHOTS.gw_flat — an Alaska mudflat (set "coast"). P: {mode: "takeoff"|"feast", gy, bird, kasif (feast), labels}
//   takeoff: the bird pecks, crouches, takes off at cue "go" and climbs out to the right. feast: the bird pulls worms
//   from the mud and swells round from cue "fat"; Kaşif (K) watches with binoculars, thinks, points.
// SHOTS.gw_body — the godwit as a big cut-away drawing on the mudflat: gold fat swells under the skin (cue "room"),
//   the stomach and liver shrink (cues "stomach", "liver"). P: {gy, bird, labels}
// SHOTS.gw_map — old ink map of the Pacific (no set): Alaska top right, Australia / Tasmania bottom left, NZ, islands,
//   Antarctica's coast at the bottom; a dashed route draws Alaska → Tasmania with a small bird at its head, a card
//   counter runs to P.value (8400) + P.unit ("MILES"). P: {value, unit, counter: [x, y], route: [[lon, lat]...], labels}
// SHOTS.gw_beach — a Tasmanian beach (set "sea"). P: {mode: "land"|"end", gy, bird, kasif (end), labels}
//   land: the thin bird drops in from the sky and lands at cue "land", wobbles; at cue "half" a red dashed ghost of its
//   old fat body appears round it. end: Kaşif waves / points, the bird pecks beside him.
// SHOTS.gw_medal — the bird on the beach and a big gold rosette (text P.lines) that swings down at cue "hit"; the bird
//   lifts its bill proudly, sparkles. P: {gy, bird, rosette: [x, y, r], lines: ["WORLD", "RECORD"], labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const f3 = v => Math.round(v * 1000) / 1000;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const SERIF = 'Fraunces, Georgia, serif';
  const BODY = () => mix(INK.stain, INK.gold, 0.35);
  const BACK = () => mix(INK.stain, INK.ink, 0.38);
  const WING = () => mix(INK.stain, INK.ink, 0.28);
  const WING_D = () => mix(INK.stain, INK.ink, 0.5);
  const BELLY = () => mix(INK.paperLight, INK.stain, 0.35);
  const BILL = () => mix(INK.red, INK.paperLight, 0.35);
  const MUD = () => mix(INK.stain, INK.inkSoft, 0.4);
  const MUD_L = () => mix(INK.stain, INK.paperLight, 0.35);
  const POOL = () => mix(INK.blue, INK.paperLight, 0.45);
  const SAND = () => mix(INK.gold, INK.paperLight, 0.45);
  const SAND_D = () => mix(INK.gold, INK.stain, 0.5);
  const SEDGE = () => mix(INK.green, INK.ink, 0.3);
  const FAT = () => mix(INK.gold, INK.paperLight, 0.15);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const rotP = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];
  function star(x, y, r, sd, t, w) {
    return [0, 1, 2, 3].map(i => { const a = i * Math.PI / 4 + 0.2; return inkPath([[x - Math.cos(a) * r, y - Math.sin(a) * r], [x + Math.cos(a) * r, y + Math.sin(a) * r]], { w, seed: sd + i, t, amp: 0.4, taper: 0.5 }); }).join(' ');
  }
  // dashed version of a closed loop: every other run of points
  function dashed(pts, w, sd, t, on = 3) {
    const out = [], n = pts.length;
    for (let i = 0; i < n; i += on * 2) { const seg = []; for (let j = 0; j <= on; j++) seg.push(pts[(i + j) % n]); out.push(inkPath(seg, { w, seed: sd + i, t, amp: 0.8, taper: 0.2 })); }
    return out.join(' ');
  }

  // ------------------------------------------------------------------ the bar-tailed godwit (side view)
  // local units: face +x. stand: ground y = 0, ~400 long (tail -155 .. bill tip +245), head top ≈ -240.
  // fly: body centre at (0, 0). st: {pose: "stand"|"fly", face, ph (flap phase in cycles), fat 0..1, peck 0..1,
  //   lift 0..1 (bill up, proud), crouch 0..1, rot (deg), tag: true, legs: 0..1 (fly: legs down for landing)}
  // returns {head: [x, y] stage, inner: group in local units drawn over the body (x-ray)}
  function godwit(parent, sd) {
    const g = el(parent, 'g');
    const E = (c, x) => inkEl(g, c, x);
    const wingFarF = E(WING_D()), wingFarL = E();
    const legs = E(INK.ink), toes = E(INK.ink);
    const outline = E(INK.ink), tail = E(BACK()), body = E(BODY()), belly = E(BELLY()), neck = E(BODY()), head = E(BODY());
    const inner = el(g, 'g');
    const fold = E(WING()), mott = E(BACK()), foldL = E(), tailL = E();
    const cap = E(BACK()), brow = E(INK.paperLight), billD = E(mix(INK.ink, INK.stain, 0.25)), billP = E(BILL()), eye = E(INK.ink), eyeHi = E(INK.paperLight);
    const tag = E(INK.inkSoft), tagL = E(), ant = E(INK.ink);
    const wingF = E(WING()), wingM = E(BACK()), wingL = E();
    let last = { x: 0, y: 0, s: 1, fc: 1, rot: 0 };
    return {
      g, inner,
      toStage(p) { const q = rotP(p, last.rot); return [last.x + q[0] * last.s * last.fc, last.y + q[1] * last.s]; },
      update(t, x, y, s, st = {}) {
        const fc = st.face ?? 1, k = sd, fat = clamp01(st.fat ?? 0.5), lw = 5.5 / Math.pow(s, 0.6), amp = 1.3 / Math.sqrt(s);
        const fly = st.pose === 'fly', rot = (st.rot || 0) * Math.PI / 180;
        last = { x, y, s, fc, rot };
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${f3(s * fc)} ${f3(s)}) rotate(${f1(st.rot || 0)})`);
        const rx = 96 * (0.92 + 0.14 * fat), ry = (fly ? 40 : 50) * (0.74 + 0.52 * fat);
        const cr = clamp01(st.crouch || 0), C = fly ? [0, 0] : [0, -135 + 30 * cr];
        const bodyP = inkEllipsePts(C[0], C[1], rx, ry, k + 1, 16, fly ? 0.03 : -0.12, 0.03);
        const top = C[1] - ry, lift = (ry - 50) * 0.7;
        // head, neck, bill
        const pk = clamp01(st.peck || 0), up = clamp01(st.lift || 0);
        const H0 = fly ? [110, -18] : [100, -214 + 30 * cr], H1 = [150, -92];
        const hc = [lerp(H0[0], H1[0], pk), lerp(H0[1], H1[1], pk) - up * 10];
        const ba = fly ? -0.04 : lerp(-0.06, 1.25, pk) - up * 0.45;     // bill angle (rad, + = down)
        const dir = [Math.cos(ba), Math.sin(ba)], nrm = [Math.sin(ba), -Math.cos(ba)];   // nrm points "up" of the bill
        const b0 = [hc[0] + dir[0] * 20, hc[1] + dir[1] * 20 + 3], bl = 130;
        const BP = [b0, [b0[0] + dir[0] * bl * 0.5 + nrm[0] * 1, b0[1] + dir[1] * bl * 0.5 + nrm[1] * 1], [b0[0] + dir[0] * bl + nrm[0] * 9, b0[1] + dir[1] * bl + nrm[1] * 9]];
        const nb = fly ? [62, -6] : [62, C[1] - ry * 0.35], NK = [nb, [lerp(nb[0], hc[0], 0.55), lerp(nb[1], hc[1], 0.6) + (fly ? 0 : -6)], hc];
        // legs
        const LG = [], TO = [];
        if (!fly) {
          [[0, 0], [-26, 4]].forEach(([dx, dy], i) => {
            const hip = [8 + dx, C[1] + ry * 0.7], ank = [2 + dx - cr * 18, -50 + cr * 22], ft = [8 + dx, 0 + dy * 0];
            LG.push(inkPath([hip, ank, ft], { w: 7.5, seed: k + 30 + i, t, amp, smooth: false, taper: 0.1 }));
            TO.push(inkPath([ft, [ft[0] + 30, ft[1] + 2]], { w: 5, seed: k + 34 + i, t, amp }), inkPath([ft, [ft[0] - 16, ft[1] + 1]], { w: 4.5, seed: k + 36 + i, t, amp }), inkPath([ft, [ft[0] + 18, ft[1] + 8]], { w: 4.5, seed: k + 38 + i, t, amp }));
          });
        } else {
          const ld = clamp01(st.legs || 0);
          [[0, 0], [12, 8]].forEach(([dx, dy], i) => {
            const hip = [-30 + dx, 22 + dy * 0.3], end = [lerp(-195, -10, ld) + dx, lerp(30, 150, ld) + dy];
            LG.push(inkPath([hip, [lerp(-110, -30, ld) + dx, lerp(26, 90, ld) + dy], end], { w: 6.5, seed: k + 30 + i, t, amp, taper: 0.1 }));
            if (ld > 0.3) TO.push(inkPath([end, [end[0] + 26, end[1] + 4]], { w: 4.5, seed: k + 34 + i, t, amp }), inkPath([end, [end[0] - 14, end[1] + 2]], { w: 4, seed: k + 36 + i, t, amp }));
          });
        }
        legs.setAttribute('d', LG.join(' ')); toes.setAttribute('d', TO.join(' '));
        // tail (barred)
        const TP = fly ? [[-86, -10], [-160, -8], [-164, 8], [-86, 14]] : [[-78, C[1] - 6], [-152, C[1] + 6], [-154, C[1] + 22], [-78, C[1] + 26]];
        // outline (ink tubes behind the fills)
        outline.setAttribute('d', [inkPath(bodyP, { w: lw * 2.2, seed: k + 2, t, closed: true, amp }), inkPath(NK, { w: 34 + lw * 2.2, seed: k + 3, t, amp, taper: 0 }),
          inkCircle(hc[0], hc[1], 25 + lw, k + 4, t, { fill: true, amp }), inkPath(TP, { w: lw * 2, seed: k + 5, t, closed: true, smooth: false, amp })].join(' '));
        tail.setAttribute('d', inkLoop(TP, { seed: k + 6, t, smooth: false, amp }));
        tailL.setAttribute('d', [0.3, 0.55, 0.8].map((f, i) => inkPath([[lerp(TP[0][0], TP[1][0], f), lerp(TP[0][1], TP[1][1], f)], [lerp(TP[3][0], TP[2][0], f), lerp(TP[3][1], TP[2][1], f)]], { w: lw * 0.7, seed: k + 7 + i, t, amp })).join(' '));
        body.setAttribute('d', inkLoop(bodyP, { seed: k + 8, t, amp }));
        belly.setAttribute('d', inkLoop(inkEllipsePts(C[0] + 14, C[1] + ry * 0.38, rx * 0.72, ry * 0.5, k + 9, 12, fly ? 0.03 : -0.12, 0.04), { seed: k + 10, t, amp }));
        neck.setAttribute('d', inkPath(NK, { w: 34, seed: k + 3, t, amp, taper: 0 }));
        head.setAttribute('d', inkCircle(hc[0], hc[1], 25, k + 4, t, { fill: true, amp }));
        cap.setAttribute('d', inkLoop([[hc[0] - 24, hc[1] - 4], [hc[0] - 10, hc[1] - 24], [hc[0] + 14, hc[1] - 22], [hc[0] + 4, hc[1] - 14]], { seed: k + 11, t, amp }));
        brow.setAttribute('d', inkPath([[hc[0] - 10, hc[1] - 11], [hc[0] + 20, hc[1] - 10]], { w: 5, seed: k + 12, t, amp }));
        billD.setAttribute('d', inkPath(BP, { w: 13, seed: k + 13, t, amp, taper: 0.55 }));
        billP.setAttribute('d', inkPath(BP.slice(0, 2), { w: 8, seed: k + 14, t, amp, taper: 0.2 }));
        const blink = ((t + sd * 0.29) % 3.1) < 0.12;
        eye.setAttribute('d', blink ? inkPath([[hc[0] + 2, hc[1] - 4], [hc[0] + 14, hc[1] - 4]], { w: 3.5, seed: k + 15, t }) : inkDot(hc[0] + 8, hc[1] - 4, 5.5, 5.5, k + 15, t));
        eyeHi.setAttribute('d', blink ? '' : inkDot(hc[0] + 10, hc[1] - 6, 1.6, 1.6, k + 16, t, 0.2));
        // folded wing (stand) / flapping wings (fly)
        if (!fly && st.xray) blank(fold, foldL, mott, wingF, wingM, wingL, wingFarF, wingFarL);
        else if (!fly) {
          const FP = [[-120, C[1] + 8], [-60, top + 14 - lift * 0.1], [10, top + 2], [62, top + 14], [40, C[1] + 10], [-40, C[1] + ry * 0.45]];
          fold.setAttribute('d', inkLoop(FP, { seed: k + 17, t, amp }));
          foldL.setAttribute('d', inkPath(FP, { w: lw * 0.8, seed: k + 18, t, closed: true, amp }) + ' ' + [0, 1, 2].map(i => inkPath([[-100 + i * 12, C[1] + 10 - i * 2], [-30 + i * 22, top + 24 + i * 12]], { w: lw * 0.6, seed: k + 19 + i, t, amp })).join(' '));
          const M = []; for (let i = 0; i < 9; i++) { const q = [lerp(-70, 40, hn(k, i)), lerp(top + 18, C[1] + 4, hn(k + 1, i))]; M.push(inkPath([[q[0] - 9, q[1]], [q[0], q[1] + 6], [q[0] + 9, q[1]]], { w: 4, seed: k + 40 + i, t, amp: 0.6 })); }
          mott.setAttribute('d', M.join(' '));
          blank(wingF, wingM, wingL, wingFarF, wingFarL);
        } else {
          blank(fold, foldL);
          const M = []; for (let i = 0; i < 7; i++) { const q = [lerp(-70, 50, hn(k, i)), lerp(-ry + 8, 4, hn(k + 1, i))]; M.push(inkPath([[q[0] - 8, q[1]], [q[0], q[1] + 5], [q[0] + 8, q[1]]], { w: 3.6, seed: k + 40 + i, t, amp: 0.6 })); }
          mott.setAttribute('d', M.join(' '));
          const u = Math.sin((st.ph || 0) * Math.PI * 2);
          const wing = (dx, dy, sc) => {
            const wr = [-6 + dx, -18 + dy - 130 * u * sc], tp = [-125 + dx, -10 + dy - 230 * u * sc + 14];
            const tr = [-60 + dx, lerp(-16, wr[1], 0.5) + 30 + 20 * (1 - Math.abs(u))];
            return [[44 + dx, -16 + dy], wr, tp, [tp[0] + 10, tp[1] + 16], tr, [-36 + dx, -12 + dy]];
          };
          const WF = wing(22, -8, 0.92), WN = wing(0, 0, 1);
          wingFarF.setAttribute('d', inkLoop(WF, { seed: k + 50, t, amp }));
          wingFarL.setAttribute('d', inkPath(WF, { w: lw * 0.9, seed: k + 51, t, closed: true, amp }));
          wingF.setAttribute('d', inkLoop(WN, { seed: k + 52, t, amp }));
          wingM.setAttribute('d', inkLoop([WN[1], WN[2], WN[3], [lerp(WN[1][0], WN[3][0], 0.5), lerp(WN[1][1], WN[3][1], 0.5) + 10]], { seed: k + 53, t, amp }));
          wingL.setAttribute('d', inkPath(WN, { w: lw, seed: k + 54, t, closed: true, amp }) + ' ' + [0.3, 0.55, 0.8].map((f, i) => inkPath([[lerp(WN[1][0], WN[2][0], f), lerp(WN[1][1], WN[2][1], f)], [lerp(WN[1][0], WN[2][0], f) + 14, lerp(WN[1][1], WN[2][1], f) + 30 * (u >= 0 ? 1 : -1) * 0.6 + 12]], { w: lw * 0.6, seed: k + 55 + i, t, amp })).join(' '));
        }
        // satellite tag with its antenna (on the rump / lower back)
        if (st.tag !== false) {
          const tc = fly ? [-42, -ry + 4] : [-48, top + 16], TG = [[tc[0] - 17, tc[1] - 9], [tc[0] + 17, tc[1] - 11], [tc[0] + 18, tc[1] + 7], [tc[0] - 16, tc[1] + 9]];
          tag.setAttribute('d', inkLoop(TG, { seed: k + 60, t, smooth: false, amp: amp * 0.6 }));
          tagL.setAttribute('d', inkPath(TG, { w: lw * 0.7, seed: k + 61, t, closed: true, smooth: false, amp: amp * 0.6 }));
          const sw = Math.sin(t * 6) * 4;
          ant.setAttribute('d', inkPath([[tc[0] - 12, tc[1] - 4], [tc[0] - 60, tc[1] - 22 + sw * 0.5], [tc[0] - 110, tc[1] - 40 + sw]], { w: 3.4, seed: k + 62, t, amp: 0.6, taper: 0.4 }));
        } else blank(tag, tagL, ant);
        const hs = this.toStage(hc);
        return { head: hs, body: this.toStage(C), bodyPts: bodyP, C, rx, ry };
      },
    };
  }

  // ------------------------------------------------------------------ clouds drifting left (the bird flies right)
  function clouds(parent, sd, n = 5) {
    const f = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.9 }), r = inkEl(parent, mix(INK.inkSoft, INK.blue, 0.4));
    return {
      update(t, W, y0, y1, sp = 60, dark = 0) {
        f.setAttribute('fill', mix(INK.paperLight, INK.inkSoft, dark));
        const F = [], R = [];
        for (let i = 0; i < n; i++) {
          const w = (180 + hn(sd, i) * 200) * (W / 1080), span = W + w * 2 + 200, x = ((hn(sd + 1, i) * span - t * sp * (0.7 + hn(sd + 2, i) * 0.6)) % span + span) % span - w - 100;
          const y = lerp(y0, y1, hn(sd + 3, i)), P = [];
          for (let j = 0; j <= 6; j++) { const a = Math.PI + j / 6 * Math.PI, bump = 1 + 0.25 * Math.sin(j * 2.3 + i); P.push([x + Math.cos(a) * w * 0.5, y + Math.sin(a) * w * 0.22 * bump]); }
          P.push([x + w * 0.5, y + 8], [x - w * 0.5, y + 8]);
          F.push(inkLoop(P, { seed: sd + 10 + i, t, amp: 1 })); R.push(inkPath(P.slice(0, 7), { w: 3, seed: sd + 30 + i, t, amp: 1 }));
        }
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }
  // wind streaks streaming back from a point
  function streaks(parent, sd) {
    const e = inkEl(parent, mix(INK.inkSoft, INK.blue, 0.3));
    return {
      update(t, x, y, s, fc = 1, n = 7, k = 1) {
        const D = [];
        for (let i = 0; i < n; i++) {
          const ph = (t * 1.6 + hn(sd, i)) % 1, yy = y + (hn(sd + 1, i) - 0.5) * 260 * s, x0 = x - fc * (180 + ph * 520) * s, L = (120 + hn(sd + 2, i) * 120) * s * Math.sin(ph * Math.PI) * k;
          if (L < 10) continue;
          D.push(inkPath([[x0, yy], [x0 - fc * L, yy + 4]], { w: 5, seed: sd + 10 + i, t, amp: 0.6, taper: 0.6 }));
        }
        e.setAttribute('d', D.join(' '));
      },
    };
  }
  // rows of swell down to the frame bottom; o: {rough: 0..1, dark: 0..1, rows: 5}
  function swell(parent, sd, rows = 5) {
    const R = Array.from({ length: rows }, () => ({ f: inkEl(parent, INK.blue), l: inkEl(parent), foam: inkEl(parent, INK.paperLight) }));
    return {
      update(t, W, H, top, o = {}) {
        const rough = o.rough ?? 0.3, dark = o.dark ?? 0;
        R.forEach((r, i) => {
          const fi = i / (rows - 1), y0 = top + (H - top) * Math.pow(fi, 1.25) * 0.9, A = (14 + 46 * fi) * (1 + rough * 1.4), kx = (0.008 - fi * 0.004), v = 1.2 + fi * 1.4, ph = hn(sd, i) * 6;
          const P = [];
          for (let x = -60; x <= W + 60; x += 30) P.push([x, y0 - A * Math.pow(0.5 + 0.5 * Math.sin(x * kx + t * v + ph), 1.6) + A * 0.3 * Math.sin(x * kx * 2.7 - t * v * 0.6)]);
          r.f.setAttribute('fill', mix(mix(INK.blue, INK.paperLight, 0.42 - fi * 0.3), INK.ink, dark * (0.25 + fi * 0.25)));
          r.f.setAttribute('d', inkLoop(P.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 10 + i, t, amp: 0.8, smooth: false }));
          r.l.setAttribute('d', inkPath(P, { w: 3 + fi * 4, seed: sd + 20 + i, t, amp: 0.8 }));
          const FO = [];
          for (let j = 1; j < P.length - 1; j++) if (P[j][1] < P[j - 1][1] && P[j][1] <= P[j + 1][1]) FO.push(inkPath([[P[j][0] - 26 - fi * 20, P[j][1] + 8], [P[j][0], P[j][1] + 2], [P[j][0] + 22 + fi * 16, P[j][1] + 10]], { w: 4 + fi * 5, seed: sd + 40 + i * 50 + j, t, amp: 0.6, taper: 0.5 }));
          r.foam.setAttribute('d', FO.join(' '));
        });
      },
    };
  }
  // mudflat foreground: wet mud bands, shining puddles with ripples, worm casts, sedge tufts at the sides, bird tracks
  function mudFront(parent, sd) {
    const E = (c, x) => inkEl(parent, c, x);
    const band = E(MUD_L()), band2 = E(MUD()), pools = E(POOL()), glint = E(INK.paperLight), rip = E(mix(INK.blue, INK.ink, 0.2)), casts = E(mix(INK.stain, INK.ink, 0.45)), tracks = E(mix(INK.stain, INK.ink, 0.5)), edge = E(), sedge = E(SEDGE()), sedgeL = E();
    return {
      update(t, W, H, top, o = {}) {
        const u = W / 1080;
        const prof = (y0, a, ph) => { const P = []; for (let i = 0; i <= 12; i++) P.push([-40 + i * (W + 80) / 12, y0 + Math.sin(i * 1.1 + ph) * a]); return P; };
        const P0 = prof(top, 6, 1), P1 = prof(top + 230 * u, 14, 3);
        band.setAttribute('d', inkLoop(P0.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd, t, amp: 0.8 }));
        band2.setAttribute('d', inkLoop(P1.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 1, t, amp: 0.8 }));
        edge.setAttribute('d', inkPath(P0, { w: 4, seed: sd + 2, t }) + ' ' + inkPath(P1, { w: 5, seed: sd + 3, t }) +
          ' ' + Array.from({ length: 10 }, (_, i) => { const x = hn(sd + 4, i) * W, y = top + 280 * u + hn(sd + 5, i) * (H - top - 300 * u); return inkPath([[x - 70 * u, y], [x + 70 * u, y + 4]], { w: 3, seed: sd + 60 + i, t, amp: 0.6 }); }).join(' '));
        const PL = o.pools || [[0.2, 0.06, 150, 34], [0.62, 0.12, 200, 40], [0.86, 0.3, 170, 46], [0.3, 0.42, 260, 60]], PF = [], G = [], RP = [];
        PL.forEach((q, i) => {
          const cx = q[0] * W, cy = top + q[1] * (H - top), rx = q[2] * u, ry = q[3] * u;
          PF.push(inkLoop(inkEllipsePts(cx, cy, rx, ry, sd + 70 + i, 12, 0, 0.08), { seed: sd + 80 + i, t, amp: 0.8 }));
          G.push(inkPath([[cx - rx * 0.5, cy - ry * 0.2], [cx + rx * 0.1, cy - ry * 0.35]], { w: 5, seed: sd + 90 + i, t, amp: 0.5 }));
          const ph = (t * 0.5 + hn(sd + 6, i)) % 1;
          RP.push(inkCircle(cx + rx * 0.2, cy + ry * 0.1, rx * 0.15 + ph * rx * 0.6, sd + 100 + i, t, { w: 3 * (1 - ph) + 0.6, ry: (ry * 0.15 + ph * ry * 0.6) }));
        });
        pools.setAttribute('d', PF.join(' ')); glint.setAttribute('d', G.join(' ')); rip.setAttribute('d', RP.join(' '));
        const CS = [];
        for (let i = 0; i < 9; i++) { const x = hn(sd + 7, i) * W, y = top + 40 * u + hn(sd + 8, i) * (H - top - 100 * u), r = (10 + (y - top) / (H - top) * 22) * u; CS.push(inkPath([[x - r, y], [x - r * 0.3, y - r * 0.8], [x + r * 0.5, y - r * 0.2], [x, y + r * 0.3], [x + r, y]], { w: 4 + r * 0.2, seed: sd + 110 + i, t, amp: 0.6 })); }
        casts.setAttribute('d', CS.join(' '));
        const TR = [];
        for (let i = 0; i < 6; i++) { const x = (0.38 + i * 0.09) * W, y = top + (60 + (i % 2) * 40 + i * 30) * u, r = 22 * u; TR.push(inkPath([[x, y], [x + r, y - r * 0.6]], { w: 3.5, seed: sd + 130 + i, t }), inkPath([[x, y], [x + r * 1.1, y + r * 0.1]], { w: 3.5, seed: sd + 140 + i, t }), inkPath([[x, y], [x + r * 0.7, y + r * 0.7]], { w: 3.5, seed: sd + 150 + i, t })); }
        tracks.setAttribute('d', o.tracks === false ? '' : TR.join(' '));
        const SF = [], SL = [];
        [[0.03, 1.2], [0.12, 0.8], [0.93, 1.1], [0.99, 1.4]].forEach((q, i) => {
          const bx = q[0] * W, by = H - 60 * u - (i % 2) * 140 * u, h = 380 * u * q[1];
          for (let j = 0; j < 7; j++) {
            const a = (j - 3) * 0.16 + Math.sin(t * 1.3 + i + j * 0.4) * 0.05, L = h * (0.6 + hn(sd + 9, i * 7 + j) * 0.5), tip = [bx + Math.sin(a) * L, by - Math.cos(a) * L], mid = [bx + Math.sin(a) * L * 0.5 + a * 20, by - Math.cos(a) * L * 0.5];
            SF.push(inkPath([[bx, by], mid, tip], { w: 13 * u, seed: sd + 170 + i * 7 + j, t, amp: 0.8, taper: 0.85 }));
          }
        });
        sedge.setAttribute('d', SF.join(' ')); sedgeL.setAttribute('d', SL.join(' '));
      },
    };
  }
  // sandy beach foreground: foam edge washing in and out, wet sand, shells, seaweed, pebbles, marram grass at the sides
  function sandFront(parent, sd) {
    const E = (c, x) => inkEl(parent, c, x);
    const wet = E(mix(SAND(), INK.blue, 0.18)), foam = E(INK.paperLight), foamL = E(mix(INK.blue, INK.ink, 0.2)), dry = E(SAND()), ripples = E(SAND_D()), shells = E(INK.paperLight), shellL = E(), weed = E(mix(INK.green, INK.stain, 0.4)), peb = E(mix(INK.inkSoft, INK.paper, 0.3)), grass = E(SEDGE()), edge = E();
    return {
      update(t, W, H, top, o = {}) {
        const u = W / 1080, wash = 0.5 + 0.5 * Math.sin(t * 1.1), prof = (y0, a, ph) => { const P = []; for (let i = 0; i <= 14; i++) P.push([-40 + i * (W + 80) / 14, y0 + Math.sin(i * 1.4 + ph + t * 0.8) * a]); return P; };
        const PW = prof(top - 4, 4, 0), PF = prof(top + 30 * u + wash * 40 * u, 9, 2), PD = prof(top + 200 * u, 12, 4).map(p => [p[0], p[1] - Math.sin(t * 0.8 + p[0]) * 0]);
        wet.setAttribute('d', inkLoop(PW.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd, t, amp: 0.8 }));
        foam.setAttribute('d', inkLoop(PW.concat(PF.slice().reverse()), { seed: sd + 1, t, amp: 0.8 }));
        foamL.setAttribute('d', inkPath(PF, { w: 4, seed: sd + 2, t }) + ' ' + inkPath(PW, { w: 3, seed: sd + 3, t }));
        dry.setAttribute('d', inkLoop(PD.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 4, t, amp: 0.8 }));
        edge.setAttribute('d', inkPath(PD, { w: 5, seed: sd + 5, t }));
        const RP = [];
        for (let i = 0; i < 14; i++) { const x = hn(sd + 6, i) * W, y = top + 240 * u + hn(sd + 7, i) * (H - top - 260 * u), L = (40 + (y - top) / (H - top) * 90) * u; RP.push(inkPath([[x - L, y], [x, y - 6 * u], [x + L, y]], { w: 3 + (y - top) / (H - top) * 3, seed: sd + 20 + i, t, amp: 0.6 })); }
        ripples.setAttribute('d', RP.join(' '));
        const SH_ = [], SL = [], PB = [];
        for (let i = 0; i < 6; i++) {
          const x = (0.12 + hn(sd + 8, i) * 0.76) * W, y = top + 300 * u + hn(sd + 9, i) * (H - top - 420 * u), r = (16 + (y - top) / (H - top) * 26) * u;
          const S = [[x - r, y], [x - r * 0.6, y - r * 0.9], [x, y - r * 1.1], [x + r * 0.6, y - r * 0.9], [x + r, y], [x, y + r * 0.25]];
          SH_.push(inkLoop(S, { seed: sd + 40 + i, t, amp: 0.6 })); SL.push(inkPath(S, { w: 3.5, seed: sd + 50 + i, t, closed: true, amp: 0.6 }), inkPath([[x, y + r * 0.2], [x, y - r]], { w: 2.5, seed: sd + 60 + i, t }), inkPath([[x, y + r * 0.2], [x - r * 0.6, y - r * 0.8]], { w: 2.5, seed: sd + 65 + i, t }), inkPath([[x, y + r * 0.2], [x + r * 0.6, y - r * 0.8]], { w: 2.5, seed: sd + 68 + i, t }));
          PB.push(inkDot(x + r * 2.5, y + r, r * 0.5, r * 0.35, sd + 70 + i, t));
        }
        shells.setAttribute('d', SH_.join(' ')); shellL.setAttribute('d', SL.join(' ')); peb.setAttribute('d', PB.join(' '));
        const WD = [];
        for (let i = 0; i < 3; i++) { const x = (0.25 + i * 0.27) * W, y = top + (110 + i * 60) * u; WD.push(inkPath([[x - 90 * u, y], [x - 30 * u, y - 18 * u + Math.sin(t + i) * 4], [x + 40 * u, y + 6 * u], [x + 100 * u, y - 10 * u]], { w: 10 * u, seed: sd + 80 + i, t, amp: 0.8, taper: 0.6 })); }
        weed.setAttribute('d', WD.join(' '));
        const GF = [];
        [[0.02, 1.3], [0.1, 0.9], [0.92, 1.0], [1.0, 1.4]].forEach((q, i) => {
          const bx = q[0] * W, by = H - 40 * u - (i % 2) * 120 * u, h = 360 * u * q[1];
          for (let j = 0; j < 8; j++) { const a = (j - 3.5) * 0.17 + Math.sin(t * 1.5 + i + j * 0.5) * 0.06, L = h * (0.55 + hn(sd + 10, i * 8 + j) * 0.5); GF.push(inkPath([[bx, by], [bx + Math.sin(a) * L * 0.5 + a * 24, by - Math.cos(a) * L * 0.5], [bx + Math.sin(a) * L + a * 40, by - Math.cos(a) * L]], { w: 11 * u, seed: sd + 100 + i * 8 + j, t, amp: 0.8, taper: 0.85 })); }
        });
        grass.setAttribute('d', o.grass === false ? '' : GF.join(' '));
      },
    };
  }
  // a wriggling worm (mudflat prey); lift 0..1 pulls it out of the mud
  function worms(parent, sd) {
    const f = inkEl(parent, mix(INK.red, INK.paperLight, 0.3)), r = inkEl(parent);
    return {
      update(t, list) {
        const F = [], R = [];
        list.forEach((q, i) => {
          const [x, y, s, lift] = q, n = 6, P = [];
          for (let j = 0; j < n; j++) { const f_ = j / (n - 1); P.push([x + Math.sin(t * 6 + j + i) * 8 * s + f_ * 10 * s, y - f_ * (24 + 50 * lift) * s]); }
          F.push(inkPath(P, { w: 13 * s, seed: sd + i, t, amp: 0.6, taper: 0.3 })); R.push(inkPath([P[n - 2], P[n - 1]], { w: 3, seed: sd + 20 + i, t }));
        });
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }
  // pop-in icon in a paper disc + red cross: kind "worm"|"drop"|"bed"
  function icon(parent, sd, kind) {
    const E = (c, x) => inkEl(parent, c, x);
    const disc = E(INK.paperLight), ring = E(), fill = E(kind === 'drop' ? mix(INK.blue, INK.paperLight, 0.2) : kind === 'worm' ? mix(INK.red, INK.paperLight, 0.3) : mix(INK.stain, INK.paperLight, 0.4)), lines = E(), pil = E(INK.paperLight), cross = E(INK.red);
    return {
      update(t, x, y, r, k, x_) {
        if (k <= 0.01) { blank(disc, ring, fill, lines, pil, cross); return; }
        const R = r * k;
        disc.setAttribute('d', inkCircle(x, y, R, sd, t, { fill: true }));
        ring.setAttribute('d', inkCircle(x, y, R, sd + 1, t, { w: 6 }));
        const s = R / 100;
        if (kind === 'worm') {
          const P = []; for (let j = 0; j < 7; j++) P.push([x - 55 * s + j * 18 * s, y + Math.sin(j * 1.3 + t * 5) * 14 * s]);
          fill.setAttribute('d', inkPath(P, { w: 22 * s, seed: sd + 2, t, amp: 0.6, taper: 0.3 }));
          lines.setAttribute('d', [1, 2, 3, 4].map(j => inkPath([[P[j][0], P[j][1] - 9 * s], [P[j][0], P[j][1] + 9 * s]], { w: 2.5, seed: sd + 10 + j, t })).join(' ') + ' ' + inkDot(P[6][0] - 2 * s, P[6][1] - 3 * s, 3 * s, 3 * s, sd + 15, t));
          pil.setAttribute('d', '');
        } else if (kind === 'drop') {
          const P = []; for (let j = 0; j <= 14; j++) { const a = j / 14 * Math.PI * 2, rr = 42 * s; P.push([x + Math.sin(a) * rr * (1 - 0.0 * Math.cos(a)), y + 12 * s - Math.cos(a) * rr * (Math.cos(a) > 0 ? 1.8 : 1)]); }
          fill.setAttribute('d', inkLoop(P, { seed: sd + 2, t, amp: 0.8 }));
          lines.setAttribute('d', inkPath(P, { w: 5, seed: sd + 3, t, closed: true, amp: 0.8 }));
          pil.setAttribute('d', inkPath([[x - 16 * s, y + 10 * s], [x - 20 * s, y + 30 * s]], { w: 7 * s, seed: sd + 4, t }));
        } else {
          const B = [[x - 60 * s, y + 10 * s], [x + 60 * s, y + 10 * s], [x + 60 * s, y + 34 * s], [x - 60 * s, y + 34 * s]];
          fill.setAttribute('d', inkLoop(B, { seed: sd + 2, t, smooth: false, amp: 0.8 }));
          lines.setAttribute('d', [inkPath(B, { w: 5, seed: sd + 3, t, closed: true, smooth: false }), inkPath([[x - 60 * s, y + 50 * s], [x - 60 * s, y - 30 * s]], { w: 7, seed: sd + 4, t }), inkPath([[x + 60 * s, y + 50 * s], [x + 60 * s, y + 4 * s]], { w: 7, seed: sd + 5, t })].join(' '));
          pil.setAttribute('d', inkLoop(inkEllipsePts(x - 36 * s, y - 2 * s, 20 * s, 12 * s, sd + 6, 10), { seed: sd + 6, t, amp: 0.6 }));
        }
        const c = clamp01(x_ || 0), L = r * 0.62;
        cross.setAttribute('d', c > 0 ? [inkPath([[x - L, y - L], [lerp(x - L, x + L, c), lerp(y - L, y + L, c)]], { w: 9, seed: sd + 20, t, taper: 0.2 }), c > 0.5 ? inkPath([[x + L, y - L], [lerp(x + L, x - L, (c - 0.5) * 2), lerp(y - L, y + L, (c - 0.5) * 2)]], { w: 9, seed: sd + 21, t, taper: 0.2 }) : ''].join(' ') : '');
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.gw_sky
  SH.gw_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 313, u = W / 1080, mode = P.mode || 'hook';
      const root = el(svg, 'g');
      const cl = clouds(el(root, 'g'), sd + 10, mode === 'storm' ? 7 : 5);
      const rain = mode === 'storm' ? inkEl(root, mix(INK.inkSoft, INK.blue, 0.3)) : null;
      const crestF = mode === 'storm' ? inkEl(root, mix(INK.blue, INK.ink, 0.35)) : null, crestL = mode === 'storm' ? inkEl(root) : null, crestFo = mode === 'storm' ? inkEl(root, INK.paperLight) : null, spray = mode === 'storm' ? inkEl(root, INK.paperLight) : null;
      const sw = swell(el(root, 'g'), sd + 50);
      const BU = P.buoy || null;
      const buoyF = BU ? inkEl(root, INK.red) : null, buoyS = BU ? inkEl(root, INK.paperLight) : null, buoyD = BU ? inkEl(root, mix(INK.stain, INK.ink, 0.35)) : null, buoyL = BU ? inkEl(root) : null, buoyFo = BU ? inkEl(root, INK.paperLight) : null;
      const st = streaks(el(root, 'g'), sd + 80);
      const B = Object.assign(mode === 'hook' ? { x: 0.58, y: 0.4, s: 1.75, face: 1, fat: 0.55, ph0: 0.8 } : mode === 'none' ? { x: 0.5, y: 0.53, s: 1.35, face: 1, fat: 0.5 } : { x: 0.48, y: 0.4, s: 1.15, face: 1, fat: 0.4 }, P.bird || {});
      const bd = godwit(el(root, 'g'), sd + 100);
      const IC = mode === 'none' ? ['worm', 'drop', 'bed'].map((k, i) => icon(el(root, 'g'), sd + 200 + i * 30, k)) : [];
      const LB = labels(root, P.labels, W, H);
      const seaTop = (P.sea ?? (mode === 'storm' ? 0.56 : 0.6)) * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          cl.update(t, W, 0.12 * H, (mode === 'storm' ? 0.4 : 0.45) * H, mode === 'storm' ? 140 : 80, mode === 'storm' ? 0.35 : 0);
          if (rain) { const D = []; for (let i = 0; i < 60; i++) { const ph = (t * 1.8 + hn(sd + 5, i)) % 1, x = hn(sd + 6, i) * (W + 300) - 150 + ph * 120, y = ph * H * 1.1 - 100; D.push(inkPath([[x, y], [x - 40 * u, y + 110 * u]], { w: 3, seed: sd + 300 + i, t, amp: 0.4, taper: 0.5 })); } rain.setAttribute('d', D.join(' ')); }
          sw.update(t, W, H, seaTop, mode === 'storm' ? { rough: 1, dark: 0.7 } : { rough: 0.3 });
          if (BU) {
            // a striped can buoy with a flat deck (top centre at BU[0], BU[1]), bobbing; foam ring at the waterline
            const bxc = BU[0] * W, ty = BU[1] * H + Math.sin(t * 1.7) * 5 * u, bw = (BU[2] ?? 260) * u, bh = bw * 0.75, tilt = Math.sin(t * 1.3) * 0.03;
            const Q = (dx, dy) => [bxc + dx * Math.cos(tilt) - dy * Math.sin(tilt), ty + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
            const body = [Q(-bw * 0.5, 0), Q(bw * 0.5, 0), Q(bw * 0.42, bh), Q(-bw * 0.42, bh)];
            buoyF.setAttribute('d', inkLoop(body, { seed: sd + 900, t, smooth: false, amp: 1 }));
            buoyS.setAttribute('d', inkLoop([Q(-bw * 0.47, bh * 0.3), Q(bw * 0.47, bh * 0.3), Q(bw * 0.45, bh * 0.55), Q(-bw * 0.45, bh * 0.55)], { seed: sd + 901, t, smooth: false, amp: 1 }));
            const deck = [Q(-bw * 0.6, -bh * 0.12), Q(bw * 0.6, -bh * 0.12), Q(bw * 0.6, 0), Q(-bw * 0.6, 0)];
            buoyD.setAttribute('d', inkLoop(deck, { seed: sd + 902, t, smooth: false, amp: 1 }));
            buoyL.setAttribute('d', [inkPath(body, { w: 6, seed: sd + 903, t, closed: true, smooth: false }), inkPath(deck, { w: 6, seed: sd + 904, t, closed: true, smooth: false })].join(' '));
            const fy = ty + bh * 0.85, FO = []; for (let i = 0; i < 7; i++) { const a = i / 6, x = bxc - bw * 0.75 + a * bw * 1.5, y = fy + Math.sin(t * 3 + i) * 6 * u + (Math.abs(a - 0.5) * 20) * u; FO.push(inkPath([[x - 34 * u, y + 6 * u], [x, y - 6 * u], [x + 34 * u, y + 6 * u]], { w: 10 * u, seed: sd + 910 + i, t, taper: 0.5 })); }
            buoyFo.setAttribute('d', FO.join(' '));
          }
          const hit = atOr(cues, 'hit', dur * 0.5);
          let bx = B.x * W, by = B.y * H + Math.sin(t * 2.2) * 14 * u, rot = Math.sin(t * 1.1) * 3, ph = t * 2.3 + (B.ph0 || 0);
          if (mode === 'storm') {
            // the bird dips toward the crest, then pulls up hard at "sea"
            const sea = atOr(cues, 'sea', dur * 0.45), dip = progIO(lt, 0, sea) * (1 - progIO(lt, sea, 0.9));
            by += dip * 0.1 * H; rot = 12 * dip - 14 * prog(lt, sea, 0.5) * (1 - prog(lt, sea + 0.7, 1.2)); ph = t * (lt > sea ? 3.4 : 2.3);
            const cx = 0.5 * W, ch = (0.12 + 0.2 * Math.sin(Math.PI * clamp01((lt - sea + 0.9) / 2.6))) * H, base = seaTop + 0.05 * H, CW = 0.62 * W;
            const CP = [[cx - CW, base], [cx - CW * 0.45, base - ch * 0.55], [cx - CW * 0.05, base - ch], [cx + CW * 0.22, base - ch * 0.95], [cx + CW * 0.34, base - ch * 0.7], [cx + CW * 0.2, base - ch * 0.62], [cx + CW * 0.36, base - ch * 0.35], [cx + CW, base], [cx + CW, H + 40], [cx - CW, H + 40]];
            crestF.setAttribute('d', inkLoop(CP, { seed: sd + 400, t, amp: 1.2 }));
            crestL.setAttribute('d', inkPath(CP.slice(0, 8), { w: 7, seed: sd + 401, t, amp: 1.2 }) + ' ' + [0.3, 0.5, 0.7].map((f, i) => inkPath([[cx - CW * (0.6 - f), base - ch * (0.3 + f * 0.4) + 30], [cx - CW * (0.5 - f), base - ch * (0.2 + f * 0.3) + 90]], { w: 4, seed: sd + 402 + i, t })).join(' '));
            crestFo.setAttribute('d', inkPath(CP.slice(1, 7), { w: 16, seed: sd + 410, t, amp: 1.2, taper: 0.5 }));
            const SP = []; for (let i = 0; i < 16; i++) { const f_ = (t * 0.9 + hn(sd + 7, i)) % 1, px = cx + CW * (0.1 + hn(sd + 8, i) * 0.3) + f_ * 120 * u, py = base - ch * 0.9 - f_ * 180 * u + f_ * f_ * 220 * u; SP.push(inkDot(px, py, (10 - f_ * 6) * u, (10 - f_ * 6) * u, sd + 420 + i, t)); }
            spray.setAttribute('d', SP.join(' '));
          }
          bd.update(t, bx, by, B.s * u, { pose: 'fly', face: B.face, ph, fat: B.fat, rot: rot * (1 + 0.15 * punch(lt, hit, 0.6)) });
          st.update(t, bx, by, B.s * u, B.face, mode === 'storm' ? 10 : 7, mode === 'hook' ? 1.2 : 1);
          if (IC.length) {
            const row = P.icons || [0.5, 0.3, 120, 0.3], names = ['i0', 'i1', 'i2'];
            IC.forEach((ic, i) => {
              const a = atOr(cues, names[i], dur * (0.1 + i * 0.25)), x = (row[0] + (i - 1) * (row[3] ?? 0.27)) * W, y = row[1] * H + Math.sin(t * 1.6 + i) * 6;
              ic.update(t, x, y, row[2] * u, spring(lt, a, 0.5), lin(lt, a + 0.4, 0.3));
            });
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.gw_flat
  SH.gw_flat = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 517, u = W / 1080, mode = P.mode || 'takeoff';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const cl = clouds(el(root, 'g'), sd + 10, 4);
      const flock = inkEl(root, mix(INK.inkSoft, INK.blue, 0.3));
      const front = mudFront(el(root, 'g'), sd + 40);
      const wm = worms(el(root, 'g'), sd + 70);
      const K = Object.assign({ x: 0.24, y: gy / H + 0.005, scale: 1.0, pose: 'look', face: 'right', emotion: 'surprised', seq: [{ at: 'how', pose: 'think', face: 'right', emotion: 'worried' }, { at: 'fat', pose: 'point', dir: 0, face: 'right', emotion: 'surprised' }] }, P.kasif || {});
      const kas = mode === 'feast' && P.kasif !== false ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const B = Object.assign(mode === 'takeoff' ? { x: 0.42, s: 1.35, face: 1, fat: 0.6 } : { x: 0.66, s: 1.3, face: 1, fat: 0.2 }, P.bird || {});
      const bd = godwit(el(root, 'g'), sd + 100);
      const st = streaks(el(root, 'g'), sd + 80);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          cl.update(t, W, 0.15 * H, 0.38 * H, 30);
          // a few far birds over the horizon
          const FL = []; for (let i = 0; i < 5; i++) { const x = ((0.6 + i * 0.07) * W + t * 30 * u) % W, y = (0.33 + hn(sd + 1, i) * 0.06) * H, a = Math.sin(t * 6 + i) * 10 * u; FL.push(inkPath([[x - 22 * u, y - a], [x, y], [x + 22 * u, y - a]], { w: 4, seed: sd + 20 + i, t, amp: 0.4 })); }
          flock.setAttribute('d', FL.join(' '));
          front.update(t, W, H, gy + 8 * u, { tracks: mode === 'takeoff' });
          if (mode === 'takeoff') {
            const go = atOr(cues, 'go', dur * 0.55), fl = lt - go;
            if (fl < 0) {
              const crouch = progIO(lt, go - 0.45, 0.4), pk = lt < go - 0.6 ? Math.max(0, Math.sin(lt * 3.2)) ** 2 : 0;
              bd.update(t, B.x * W, gy, B.s * u, { pose: 'stand', face: B.face, fat: B.fat, peck: pk, crouch });
              st.update(t, 0, -9999, 1, 1, 0);
            } else {
              const p = fl, x = B.x * W + p * 170 * u + p * p * 25 * u, y = gy - 120 * u - p * 150 * u - p * p * 12 * u;
              bd.update(t, x, y, B.s * u, { pose: 'fly', face: B.face, fat: B.fat, ph: t * 3, rot: -14 * clamp01(1 - p * 0.4), legs: clamp01(1 - p * 2) });
              st.update(t, x, y, B.s * u, B.face, 6, clamp01(p * 2));
            }
            wm.update(t, []);
          } else {
            const fa = atOr(cues, 'fat', dur * 0.6), fat = lerp(B.fat, 1, spring(lt, fa, 0.8)), cyc = (lt * 0.8) % 1, pk = Math.sin(Math.min(1, cyc / 0.5) * Math.PI);
            const r = bd.update(t, B.x * W, gy, B.s * u * (1 + 0.06 * punch(lt, fa, 0.7)), { pose: 'stand', face: B.face, fat, peck: pk });
            const wx = B.x * W + 200 * B.s * u * B.face, wy = gy + 14 * u;
            wm.update(t, [[wx, wy, B.s * u * 0.9, cyc < 0.5 ? cyc * 2 : 0], [wx + 120 * u, wy + 60 * u, u * 1.1, 0.2 + 0.2 * Math.sin(t * 2)], [B.x * W - 260 * u, gy + 120 * u, u * 1.3, 0.3]]);
            if (kas) kas.update(lt, t, cues);
            st.update(t, 0, -9999, 1, 1, 0);
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.gw_body (cut-away)
  SH.gw_body = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 719, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const cl = clouds(el(root, 'g'), sd + 10, 3);
      const front = mudFront(el(root, 'g'), sd + 40);
      const B = Object.assign({ x: 0.43, s: 2.3, face: 1, fat: 1 }, P.bird || {});
      const bd = godwit(el(root, 'g'), sd + 100);
      const X = bd.inner, E = (c, x) => inkEl(X, c, x);
      const fatF = E(FAT()), skinIn = E(mix(INK.paperLight, INK.red, 0.08)), dots = E(mix(INK.gold, INK.stain, 0.3)), gut = E(mix(INK.red, INK.stain, 0.45)), liver = E(mix(INK.red, INK.ink, 0.3)), stom = E(mix(INK.red, INK.stain, 0.2)), heart = E(INK.red), lines = E(), arrows = E(INK.red);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          cl.update(t, W, 0.12 * H, 0.3 * H, 25);
          front.update(t, W, H, gy + 8 * u, { tracks: false });
          const sa = atOr(cues, 'stomach', dur * 0.25), la = atOr(cues, 'liver', dur * 0.45), ra = atOr(cues, 'room', dur * 0.75);
          const fat = lerp(0.55, 1, progIO(lt, 0, ra + 0.4));
          const r = bd.update(t, B.x * W, gy, B.s * u, { pose: 'stand', face: B.face, fat, xray: true, lift: 0.2 + 0.1 * Math.sin(t * 1.3) });
          const C = r.C, k = sd + 500, lw = 5.5 / Math.pow(B.s * u, 0.6);
          // fat: gold layer = body, inner cavity shrinks as the fat grows
          const th = lerp(0.84, 0.6, progIO(lt, 0, ra + 0.4));
          fatF.setAttribute('d', inkLoop(r.bodyPts, { seed: k, t, amp: 0.8 }));
          const IN = inkEllipsePts(C[0] + 8, C[1] + 4, r.rx * th, r.ry * th, k + 1, 14, -0.12, 0.04);
          skinIn.setAttribute('d', inkLoop(IN, { seed: k + 2, t, amp: 0.8 }));
          const D = []; for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2 + 0.2, rr = lerp(th, 1, 0.45 + 0.3 * hn(k, i)); D.push(inkDot(C[0] + Math.cos(a) * r.rx * rr, C[1] + Math.sin(a) * r.ry * rr, 4.5, 4.5, k + 10 + i, t)); }
          dots.setAttribute('d', D.join(' '));
          // organs (shrink on their cues), heart beats
          const sS = lerp(1, 0.45, progIO(lt, sa, 0.9)), lS = lerp(1, 0.45, progIO(lt, la, 0.9));
          const sc = [C[0] - 18, C[1] + 6], lc = [C[0] + 38, C[1] - 6], hc = [C[0] + 62, C[1] + 6];
          stom.setAttribute('d', inkLoop(inkEllipsePts(sc[0], sc[1], 34 * sS, 26 * sS, k + 40, 12, 0.3, 0.06), { seed: k + 41, t, amp: 0.8 }));
          liver.setAttribute('d', inkLoop([[lc[0] - 26 * lS, lc[1] - 4 * lS], [lc[0] - 6 * lS, lc[1] - 18 * lS], [lc[0] + 22 * lS, lc[1] - 14 * lS], [lc[0] + 16 * lS, lc[1] + 10 * lS], [lc[0] - 16 * lS, lc[1] + 14 * lS]], { seed: k + 42, t, amp: 0.8 }));
          const GP = []; for (let i = 0; i < 7; i++) GP.push([C[0] - 50 + i * 9 * sS, C[1] + 14 + Math.sin(i * 1.7) * 9 * sS]);
          gut.setAttribute('d', inkPath(GP, { w: 7 * sS, seed: k + 43, t, amp: 0.6 }));
          const hb = 1 + 0.15 * Math.max(0, Math.sin(t * 8));
          heart.setAttribute('d', inkCircle(hc[0], hc[1], 10 * hb, k + 44, t, { fill: true }));
          lines.setAttribute('d', [inkPath(IN, { w: lw * 0.6, seed: k + 45, t, closed: true, amp: 0.8 }), inkPath(inkEllipsePts(sc[0], sc[1], 34 * sS, 26 * sS, k + 40, 12, 0.3, 0.06), { w: lw * 0.6, seed: k + 46, t, closed: true, amp: 0.6 })].join(' '));
          // squeeze arrows from the fat towards the shrinking organs
          const AR = [], aw = progIO(lt, sa, 0.5) * (0.6 + 0.4 * Math.sin(t * 5));
          if (aw > 0.02) [[sc[0] - 70, sc[1] + 40, 0.6], [lc[0] + 20, lc[1] + 66, -1.75]].forEach(([x, y, a], i) => { const L = 26, d = [Math.cos(a), Math.sin(a)], p0 = [x - d[0] * L, y - d[1] * L], p1 = [x + d[0] * L * aw, y + d[1] * L * aw]; AR.push(inkPath([p0, p1], { w: 4, seed: k + 50 + i, t }), inkPath([p1, [p1[0] - d[0] * 10 + d[1] * 8, p1[1] - d[1] * 10 - d[0] * 8]], { w: 4, seed: k + 52 + i, t }), inkPath([p1, [p1[0] - d[0] * 10 - d[1] * 8, p1[1] - d[1] * 10 + d[0] * 8]], { w: 4, seed: k + 54 + i, t })); });
          arrows.setAttribute('d', AR.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.gw_map (old Pacific map)
  const ALASKA = [[200, 75], [199, 71], [195, 68.5], [194.5, 66.5], [197, 65.3], [194, 64.3], [195, 62.5], [194.5, 60.5], [197, 59], [199, 58.5], [196, 56.3], [192, 55.2], [197, 55.6], [202, 57.4], [205, 59.3], [208, 60.2], [212, 60], [216, 59.6], [221, 58.5], [224, 57], [228, 54], [230, 51], [235, 48.5], [236, 45], [236, 75]];
  const ASIA = [[100, 75], [190, 75], [190, 66], [186, 64.5], [181, 62.5], [177, 62], [173, 60.5], [166, 60], [163.5, 57], [162.5, 55], [160, 53], [156.7, 51], [156, 56], [158.5, 58], [161, 61], [155, 59.5], [150, 59.4], [143, 59.2], [138, 56.5], [140.5, 53], [141.5, 50], [140, 47.5], [136, 43.5], [132, 42.8], [129.5, 41], [129.3, 35.2], [126.5, 34.5], [126, 37.5], [124.5, 39.8], [121, 40.6], [119, 39], [120.5, 36.5], [119.5, 34.8], [121.8, 31], [121.5, 28.5], [119.6, 25.5], [116, 22.8], [112, 21.6], [109.5, 18.5], [100, 18]];
  const JAPAN = [[140.6, 41.3], [141.6, 40.2], [141.8, 38.5], [140.9, 36.9], [140.6, 35.2], [138.8, 34.6], [136.6, 34.2], [135.2, 33.6], [132, 33.2], [130.9, 31.2], [129.8, 33.4], [132.5, 35.3], [135.6, 35.6], [137.3, 36.9], [139.8, 38.3], [140, 40]];
  const HOKKAIDO = [[140, 42], [141.3, 45.4], [142.2, 44.5], [145.5, 43.4], [143.4, 42], [141.5, 41.6]];
  const NEWGUINEA = [[131, -1.1], [134.2, -0.9], [135.5, -3.4], [138, -1.6], [141, -2.6], [144.6, -3.9], [147.5, -6], [150.8, -10.6], [147, -10.1], [143.5, -9], [141, -9.2], [138, -8.4], [137.6, -5.4], [134.5, -4], [132, -2.9]];
  const AUSTRALIA = [[100, -12], [125, -14], [128.5, -15], [130, -12.4], [132.4, -11.2], [136.6, -12], [135.7, -15], [139.5, -17.5], [141.5, -12.5], [142.5, -10.7], [143.6, -14], [145.4, -15], [146.3, -19], [149.3, -21.8], [153.1, -25.3], [153.6, -28.5], [153, -31.5], [151.2, -33.9], [150, -37.5], [146.5, -39], [144.3, -38.2], [141, -38.1], [138.5, -35.6], [137.7, -33], [136, -34.9], [134.2, -32.6], [131.2, -31.5], [126, -32.3], [123, -34], [100, -34]];
  const TASMANIA = [[144.7, -40.7], [146.6, -41.1], [148.3, -40.9], [148.3, -42.2], [147.8, -43.2], [146.8, -43.6], [145.3, -42.2]];
  const NZN = [[172.7, -34.4], [174.5, -36.1], [175.9, -37.5], [178.5, -37.7], [177.9, -39.2], [176.8, -40], [175.2, -41.6], [174.6, -41.2], [175, -39.6], [173.8, -39.2], [174.6, -37.4]];
  const NZS = [[172.7, -40.5], [174.3, -41.7], [173, -43.5], [171.2, -44.5], [170.6, -45.9], [168.4, -46.6], [166.5, -46], [168.2, -44], [170.5, -43], [172, -41.4]];
  const ISLES = [[204.5, 19.6, 0.9], [202.7, 20.9, 0.5], [201.8, 21.4, 0.45], [165.6, -21.4, 1.4], [167.5, -15.8, 0.7], [168.3, -17.6, 0.5], [178.2, -17.6, 0.9], [173, 1.4, 0.4], [172.9, 0.4, 0.35], [159.9, -9.5, 0.9], [150.6, -5.6, 1], [176, -13.3, 0.35], [171.7, 7.1, 0.35], [151.6, 7.4, 0.35], [134.5, 7.5, 0.5], [124, 11, 1.4], [121.5, 16.3, 1.4], [121, 23.6, 0.9]];
  const ALEUT = [[187.5, 53.2, 0.9], [184, 52.2, 0.8], [181, 51.8, 0.7], [178, 51.8, 0.7], [174, 52.2, 0.6], [186, 52.6, 0.5], [192.5, 54.5, 0.8]];
  const ROUTE = [[197.4, 61], [192, 57.5], [186.5, 54.4], [181, 50], [178, 42], [176.5, 30], [175, 16], [173.6, 2], [171.5, -10], [167.5, -18.5], [162, -26], [156.5, -32], [152, -37.5], [148.3, -41]];
  SH.gw_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 911, u = W / 1080;
      const lon0 = 115, kx = 9 * u, lat0 = 67, ky = 8.4 * u, y0 = 170 * (H / 1920);
      const M = q => [(q[0] - lon0) * kx, y0 + (lat0 - q[1]) * ky];
      const root = el(svg, 'g');
      const E = (c, x) => inkEl(root, c, x);
      const sea = E(mix(INK.paperLight, INK.blue, 0.1)), hatch = E(mix(INK.blue, INK.paperLight, 0.35)), grid = E(mix(INK.inkSoft, INK.paperLight, 0.45));
      const land = E(mix(INK.paperDark, INK.green, 0.22)), ice = E(mix(INK.paperLight, INK.blue, 0.2)), coast = E(INK.inkSoft), isl = E(mix(INK.paperDark, INK.green, 0.22)), islL = E(INK.inkSoft);
      const rose = E(), roseF = E(INK.red), roseG = E(INK.gold), frame = E();
      const routeE = E(INK.red), dot0 = E(INK.red), dot1 = E(INK.gold), dot1L = E();
      const bd = godwit(el(root, 'g'), sd + 100);
      const card = E(INK.paperLight), cardL = E();
      const num = el(root, 'text', { 'font-family': SERIF, 'font-weight': 900, 'font-size': 96 * u, fill: INK.red, 'text-anchor': 'middle' });
      const unit = el(root, 'text', { 'font-family': SERIF, 'font-weight': 900, 'font-size': 60 * u, fill: INK.ink, 'text-anchor': 'middle' });
      const LB = labels(root, P.labels, W, H);
      const RT = (P.route || ROUTE).map(M), segL = [], n = RT.length; let tot = 0;
      for (let i = 1; i < n; i++) { const d = Math.hypot(RT[i][0] - RT[i - 1][0], RT[i][1] - RT[i - 1][1]); segL.push(d); tot += d; }
      const at = f => { let d = f * tot; for (let i = 1; i < n; i++) { if (d <= segL[i - 1]) { const q = d / segL[i - 1]; return [lerp(RT[i - 1][0], RT[i][0], q), lerp(RT[i - 1][1], RT[i][1], q), Math.atan2(RT[i][1] - RT[i - 1][1], RT[i][0] - RT[i - 1][0])]; } d -= segL[i - 1]; } return [RT[n - 1][0], RT[n - 1][1], 0]; };
      const value = P.value ?? 8400, CT = P.counter || [0.74, 0.47];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          sea.setAttribute('d', inkLoop([[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]], { seed: sd, t, smooth: false, amp: 0 }));
          const HT = []; for (let i = 0; i < 46; i++) { const x = hn(sd + 1, i) * W + Math.sin(t * 0.7 + i) * 10, y = hn(sd + 2, i) * H, L = 34 * u; HT.push(inkPath([[x - L, y], [x - L * 0.5, y - 7 * u], [x, y], [x + L * 0.5, y - 7 * u], [x + L, y]], { w: 3, seed: sd + 10 + i, t, amp: 0.5 })); }
          hatch.setAttribute('d', HT.join(' '));
          const GR = []; for (let la = 60; la >= -60; la -= 20) GR.push(inkPath([M([lon0, la]), M([lon0 + 120, la])], { w: 1.6, seed: sd + 100 + la, t, amp: 0.4, smooth: false })); for (let lo = 120; lo <= 230; lo += 20) GR.push(inkPath([M([lo, 75]), M([lo, -75])], { w: 1.6, seed: sd + 200 + lo, t, amp: 0.4, smooth: false }));
          grid.setAttribute('d', GR.join(' '));
          const LANDS = [ALASKA, ASIA, JAPAN, HOKKAIDO, NEWGUINEA, AUSTRALIA, TASMANIA, NZN, NZS];
          land.setAttribute('d', LANDS.map((L, i) => inkLoop(L.map(M), { seed: sd + 300 + i, t, amp: 1 })).join(' '));
          const AN = []; for (let lo = 100; lo <= 240; lo += 7) AN.push([lo, -69 + Math.sin(lo * 0.21) * 1.6]);
          const ANp = AN.map(M); ice.setAttribute('d', inkLoop(ANp.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 320, t, amp: 1 }));
          coast.setAttribute('d', LANDS.map((L, i) => inkPath(L.map(M), { w: 4, seed: sd + 340 + i, t, closed: true, amp: 1 })).join(' ') + ' ' + inkPath(ANp, { w: 4, seed: sd + 360, t, amp: 1 }) +
            ' ' + Array.from({ length: 16 }, (_, i) => { const x = hn(sd + 3, i) * W, y = ANp[0][1] + 60 * u + hn(sd + 4, i) * (H - ANp[0][1] - 80 * u); return inkPath([[x - 50 * u, y], [x + 50 * u, y]], { w: 2.5, seed: sd + 370 + i, t }); }).join(' '));
          const IS = ISLES.concat(ALEUT);
          isl.setAttribute('d', IS.map((q, i) => { const p = M(q); return inkDot(p[0], p[1], q[2] * 7 * u + 3, q[2] * 4 * u + 3, sd + 400 + i, t); }).join(' '));
          islL.setAttribute('d', IS.map((q, i) => { const p = M(q); return inkCircle(p[0], p[1], q[2] * 7 * u + 4, sd + 440 + i, t, { w: 2.2, ry: q[2] * 4 * u + 4 }); }).join(' '));
          // compass rose on the southern ocean (lower frame)
          const rc = [0.8 * W, 0.8 * H], rr = 120 * u, spin = Math.sin(t * 0.6) * 0.05;
          const RS = [], RF = [];
          for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + spin, L = i % 2 ? rr * 0.55 : rr, b = a + Math.PI / 2, w = rr * 0.12; const tip = [rc[0] + Math.sin(a) * L, rc[1] - Math.cos(a) * L], s1 = [rc[0] + Math.sin(b) * w, rc[1] - Math.cos(b) * w], s2 = [rc[0] - Math.sin(b) * w, rc[1] + Math.cos(b) * w]; RS.push(inkPath([s1, tip, s2], { w: 4, seed: sd + 500 + i, t, smooth: false })); if (i === 0) RF.push(inkLoop([s1, tip, rc], { seed: sd + 510, t, smooth: false })); }
          rose.setAttribute('d', RS.join(' ') + ' ' + inkCircle(rc[0], rc[1], rr * 0.7, sd + 520, t, { w: 3 }));
          roseF.setAttribute('d', RF.join(' ')); roseG.setAttribute('d', inkDot(rc[0], rc[1], 10 * u, 10 * u, sd + 521, t));
          frame.setAttribute('d', inkPath([[24 * u, 24 * u], [W - 24 * u, 24 * u], [W - 24 * u, H - 24 * u], [24 * u, H - 24 * u]], { w: 6, seed: sd + 530, t, closed: true, smooth: false }) + ' ' + inkPath([[40 * u, 40 * u], [W - 40 * u, 40 * u], [W - 40 * u, H - 40 * u], [40 * u, H - 40 * u]], { w: 2.5, seed: sd + 531, t, closed: true, smooth: false }));
          // route: dashed red, drawn up to the bird
          const dn = atOr(cues, 'done', dur * 0.8), p = progIO(lt, 0.1, Math.max(0.8, dn - 0.1)), RD = [];
          const nd = 70; for (let i = 0; i < nd; i++) { const a = i / nd, b = (i + 0.55) / nd; if (a > p) break; const A = at(a), Bq = at(Math.min(b, p)); RD.push(inkPath([[A[0], A[1]], [Bq[0], Bq[1]]], { w: 7, seed: sd + 600 + i, t, amp: 0.6, taper: 0.1 })); }
          routeE.setAttribute('d', RD.join(' '));
          const s0 = M(ROUTE[0]), s1 = M(ROUTE[ROUTE.length - 1]);
          dot0.setAttribute('d', inkCircle(s0[0], s0[1], 13 * u, sd + 610, t, { fill: true }));
          dot1.setAttribute('d', p > 0.98 ? inkCircle(s1[0], s1[1], 16 * u * (1 + 0.4 * punch(lt, dn, 0.8)), sd + 611, t, { fill: true }) : '');
          dot1L.setAttribute('d', p > 0.98 ? inkCircle(s1[0], s1[1], 16 * u, sd + 612, t, { w: 4 }) : '');
          const hd = at(p), bs = 0.5 * u, fc = Math.cos(hd[2]) >= 0 ? 1 : -1;
          bd.update(t, hd[0], hd[1] - 30 * u, bs, { pose: 'fly', face: fc, ph: t * 3, fat: lerp(0.6, 0.1, p), rot: (hd[2] * 180 / Math.PI) * 0.35 * fc, tag: false });
          // counter card
          const cx = CT[0] * W, cy = CT[1] * H, cw = 210 * u, ch = 100 * u, ck = spring(lt, 0.15, 0.5);
          const CB = [[cx - cw, cy - ch], [cx + cw, cy - ch * 1.04], [cx + cw * 1.02, cy + ch * 0.9], [cx - cw * 0.98, cy + ch * 0.92]].map(q => [cx + (q[0] - cx) * ck, cy + (q[1] - cy) * ck]);
          card.setAttribute('d', inkLoop(CB, { seed: sd + 700, t, smooth: false, amp: 1 })); cardL.setAttribute('d', inkPath(CB, { w: 6, seed: sd + 701, t, closed: true, smooth: false, amp: 1 }));
          const v = Math.round(value * p / 100) * 100;
          num.textContent = ck > 0.6 ? v.toLocaleString('en-US') + (p > 0.995 && P.plus !== false ? '+' : '') : ''; num.setAttribute('x', f1(cx)); num.setAttribute('y', f1(cy + 4 * u));
          unit.textContent = ck > 0.6 ? (P.unit || 'MILES') : ''; unit.setAttribute('x', f1(cx)); unit.setAttribute('y', f1(cy + 70 * u));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.gw_beach
  SH.gw_beach = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 613, u = W / 1080, mode = P.mode || 'land';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const cl = clouds(el(root, 'g'), sd + 10, 4);
      const front = sandFront(el(root, 'g'), sd + 40);
      const shadow = inkEl(root, mix(INK.stain, INK.ink, 0.15), { 'fill-opacity': 0.35 });
      const K = Object.assign({ x: 0.3, y: gy / H + 0.01, scale: 1.05, pose: 'wave', face: 'right', emotion: 'happy', seq: [{ at: 's2', pose: 'point', dir: 0, face: 'right', emotion: 'happy' }] }, P.kasif || {});
      const kas = mode === 'end' && P.kasif !== false ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const B = Object.assign(mode === 'land' ? { x: 0.52, s: 1.45, face: 1, fat: 0 } : { x: 0.72, s: 1.15, face: -1, fat: 0.3 }, P.bird || {});
      const bd = godwit(el(root, 'g'), sd + 100);
      const ghost = inkEl(root, INK.red), sweat = inkEl(root, mix(INK.blue, INK.paperLight, 0.3));
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          cl.update(t, W, 0.12 * H, 0.35 * H, 35);
          front.update(t, W, H, gy + 6 * u);
          if (mode === 'land') {
            const ld = atOr(cues, 'land', dur * 0.3), hf = atOr(cues, 'half', dur * 0.65);
            let r;
            if (lt < ld) {
              const p = clamp01(lt / ld), x = lerp(W * 0.95, B.x * W, EASE(p)), y = lerp(0.22 * H, gy - 70 * B.s * u, progIO(lt, 0, ld));
              r = bd.update(t, x, y, B.s * u, { pose: 'fly', face: B.face, ph: t * 2.4, fat: 0, rot: 8, legs: clamp01(p * 1.6) });
              shadow.setAttribute('d', inkLoop(inkEllipsePts(x, gy + 6 * u, 120 * u * p, 18 * u * p, sd + 5, 10), { seed: sd + 5, t, amp: 0.5 }));
            } else {
              const w = Math.exp(-(lt - ld) * 2.2) * Math.sin((lt - ld) * 11), sag = Math.min(1, (lt - ld) * 3);
              r = bd.update(t, B.x * W, gy, B.s * u, { pose: 'stand', face: B.face, fat: 0, rot: w * 9, crouch: 0.6 * Math.exp(-(lt - ld) * 4) + 0.15 * sag, peck: 0.12 * sag });
              shadow.setAttribute('d', inkLoop(inkEllipsePts(B.x * W, gy + 6 * u, 130 * u, 18 * u, sd + 5, 10), { seed: sd + 5, t, amp: 0.5 }));
            }
            // the dashed red ghost of its old fat body
            const gk = progIO(lt, hf, 0.5);
            if (gk > 0.01) { const gp = inkEllipsePts(B.x * W - 6 * B.s * u, gy - 140 * B.s * u, 96 * 1.3 * B.s * u * (1 + 0.03 * Math.sin(t * 3)), 50 * 1.7 * B.s * u * lerp(0.55, 1, gk), sd + 7, 40, -0.12, 0.02); ghost.setAttribute('d', dashed(gp, 9, sd + 8, t, 2)); }
            else ghost.setAttribute('d', '');
            const SW = []; if (lt > ld + 0.3) for (let i = 0; i < 2; i++) { const ph = (t * 0.9 + i * 0.5) % 1, hh = r.head; SW.push(inkLoop(inkEllipsePts(hh[0] - 40 * u - i * 20 * u, hh[1] - 50 * u + ph * 70 * u, 7 * u, 11 * u, sd + 9 + i, 8), { seed: sd + 9 + i, t, amp: 0.4 })); }
            sweat.setAttribute('d', SW.join(' '));
          } else {
            const pk = Math.max(0, Math.sin(lt * 2.6)) ** 2;
            bd.update(t, B.x * W, gy, B.s * u, { pose: 'stand', face: B.face, fat: B.fat, peck: pk });
            shadow.setAttribute('d', inkLoop(inkEllipsePts(B.x * W, gy + 6 * u, 110 * u, 16 * u, sd + 5, 10), { seed: sd + 5, t, amp: 0.5 }));
            if (kas) kas.update(lt, t, cues);
            ghost.setAttribute('d', ''); sweat.setAttribute('d', '');
          }
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.gw_medal
  SH.gw_medal = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 811, u = W / 1080;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H;
      const cl = clouds(el(root, 'g'), sd + 10, 4);
      const front = sandFront(el(root, 'g'), sd + 40);
      const B = Object.assign({ x: 0.33, s: 1.5, face: 1, fat: 0.1 }, P.bird || {});
      const bd = godwit(el(root, 'g'), sd + 100);
      const RO = P.rosette || [0.68, 0.4, 150];
      const g = el(root, 'g'), E = (c, x) => inkEl(g, c, x);
      const string = E(INK.inkSoft), tailR = E(INK.red), tailB = E(INK.blue), tailL = E(), pet = E(mix(INK.gold, INK.paperLight, 0.35)), petL = E(), disc = E(INK.gold), discL = E(), inner = E(INK.paperLight);
      const T1 = el(g, 'text', { 'font-family': SERIF, 'font-weight': 900, 'font-size': 36 * u, fill: INK.ink, 'text-anchor': 'middle' });
      const T2 = el(g, 'text', { 'font-family': SERIF, 'font-weight': 900, 'font-size': 36 * u, fill: INK.ink, 'text-anchor': 'middle' });
      const lines = P.lines || ['WORLD', 'RECORD'];
      const spark = inkEl(root, INK.gold), sparkL = inkEl(root);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          cl.update(t, W, 0.12 * H, 0.35 * H, 30);
          front.update(t, W, H, gy + 6 * u, { grass: true });
          const hit = atOr(cues, 'hit', dur * 0.45), dp = spring(lt, hit - 0.5, 0.8), up = progIO(lt, hit, 0.5);
          bd.update(t, B.x * W, gy, B.s * u * (1 + 0.04 * punch(lt, hit, 0.6)), { pose: 'stand', face: B.face, fat: B.fat, lift: up * (0.8 + 0.2 * Math.sin(t * 3)) });
          const cx = RO[0] * W, cyT = RO[1] * H, r = RO[2] * u, cy = lerp(-r * 3, cyT, dp), sw = Math.sin(lt * 3.2) * 9 * Math.exp(-Math.max(0, lt - hit) * 0.9) + Math.sin(t * 1.4) * 2.5;
          g.setAttribute('transform', `rotate(${f1(sw)} ${f1(cx)} ${f1(cy - r * 2.2)})`);
          string.setAttribute('d', inkPath([[cx, -20], [cx, cy - r]], { w: 4, seed: sd + 200, t }));
          const TR = [[cx - r * 0.45, cy + r * 0.3], [cx - r * 0.1, cy + r * 0.3], [cx - r * 0.3, cy + r * 1.75], [cx - r * 0.5, cy + r * 1.55], [cx - r * 0.7, cy + r * 1.7]];
          const TB = TR.map(q => [cx * 2 - q[0], q[1]]);
          tailR.setAttribute('d', inkLoop(TR, { seed: sd + 201, t, smooth: false, amp: 1 })); tailB.setAttribute('d', inkLoop(TB, { seed: sd + 202, t, smooth: false, amp: 1 }));
          tailL.setAttribute('d', inkPath(TR, { w: 4.5, seed: sd + 203, t, closed: true, smooth: false }) + ' ' + inkPath(TB, { w: 4.5, seed: sd + 204, t, closed: true, smooth: false }));
          const PP = []; for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2, rr = r * (i % 2 ? 0.94 : 1.1); PP.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
          pet.setAttribute('d', inkLoop(PP, { seed: sd + 205, t, smooth: false, amp: 1 })); petL.setAttribute('d', inkPath(PP, { w: 4.5, seed: sd + 206, t, closed: true, smooth: false }));
          disc.setAttribute('d', inkCircle(cx, cy, r * 0.82, sd + 207, t, { fill: true })); discL.setAttribute('d', inkCircle(cx, cy, r * 0.82, sd + 208, t, { w: 5 }) + ' ' + inkCircle(cx, cy, r * 0.7, sd + 209, t, { w: 3 }));
          inner.setAttribute('d', inkCircle(cx, cy, r * 0.66, sd + 210, t, { fill: true }));
          T1.textContent = lines[0] || ''; T2.textContent = lines[1] || '';
          T1.setAttribute('x', f1(cx)); T1.setAttribute('y', f1(cy - 4 * u)); T2.setAttribute('x', f1(cx)); T2.setAttribute('y', f1(cy + 36 * u));
          const S = [], SL = [];
          if (lt > hit) for (let i = 0; i < 7; i++) { const ph = (t * 0.8 + hn(sd + 1, i)) % 1, rr = 26 * u * Math.sin(ph * Math.PI); if (rr < 3) continue; const a = i / 7 * Math.PI * 2 + 0.4, x = cx + Math.cos(a) * r * 1.25, y = cy + Math.sin(a) * r * 1.3; SL.push(star(x, y, rr + 3, sd + 300 + i * 4, t, 8)); S.push(star(x, y, rr, sd + 300 + i * 4, t, 4.5)); }
          sparkL.setAttribute('d', SL.join(' ')); spark.setAttribute('d', S.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
