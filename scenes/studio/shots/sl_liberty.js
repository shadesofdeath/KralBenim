// sl_liberty: shots for the Statue of Liberty Short (Stickstory 2026-10-29): a copper giant two pennies thick, built in
// Paris, shipped in 214 crates, held up from inside by Gustave Eiffel's iron pylon.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any colossal statue / "how it was built" story.
// Uses td__lib.js (TD.label, TD.figure) at build time; the narrator (fez) comes from params.kasif (TD.figure spec).
//
// Shared drawing: the statue (front view, feet at y = 0, torch flame tip at y ~ -1060 units), optionally on her
//   pedestal and star fort. S = {x, y (feet, 0..1 H), s (px per unit, 1 = ~1060 px tall), patina: 0 (copper) .. 1
//   (green), pedestal: false, tilt: 0 (deg), wobble: {at, amp: 3} (sways on the wind from cue), xray: cue|s|false
//   (skin fades to a ghost and Eiffel's iron pylon + struts draw in), hollow: false (empty shell, thin double skin)}
// K (figure) = TD.figure spec {x, y (ground 0..1), scale, pose, face, dir, emotion, seq}
// L (label)  = TD.label spec {text, x, y, at, size, color, font: "hand"|"serif", box, rot}
// Lines      = [{words: [...], at: [cue...], y, size}] + highlight (giant Fraunces words, highlight in a red box)
//
// SHOTS.sl_skin — a workshop bench: the statue's huge copper bust rises behind the bench (her lower body hidden by it),
//   a copper sheet lies on the bench overhanging its front edge, two stacked pennies beside it, an optional caliper
//   whose jaw slides down onto the sheet edge (cue "cal"), a gold dashed "same height" line (cue "eq").
//   P: {bench: 0.66 (bench top y), bust: S (+ drift: 0.012 slow sway/zoom) | false, sheet: {x: 0.3, w: 0.42, th: 30} | false, coins: {x: 0.78, s: 1},
//       caliper: {at} | false, eq: cue | false, labels: [L], kasif: K | false}
// SHOTS.sl_harbor — New York harbor: the statue on her pedestal and star fort on the island, steamboats with flags
//   and smoke (salute puffs on cue "salute"), a cheering crowd of hats and flags along the bottom (or none), giant words.
//   P: {statue: S (pedestal true), boats: [{x, y, s, face, at}], salute: cue, crowd: {y: 0.8, rows: 3} | false,
//       sun: false, kasif: K, labels, lines, highlight}
// SHOTS.sl_paris — Paris rooftops: rows of mansard roofs with chimney smoke fill the lower frame, the copper giant rises
//   behind them in her scaffolding, tiny workers hammer (gold sparks).  P: {statue: S, roofs: [{y, s}], scaffold: 0.55
//   (height share), workers: 4, labels}
// SHOTS.sl_crates — the quay at Rouen: the transport ship on the water, a derrick lowers a crate (cue "drop"), stacks
//   of crates to the frame bottom, one open crate with the copper face peeking out, a big counter.
//   P: {horizon: 0.45, ship: {x: 0.66, y: 0.47, s: 0.55}, counter: {to: 214, x: 0.5, y: 0.25, at, dur: 1.4, size: 230},
//       labels}
// SHOTS.sl_xray — the statue alone on top of her pedestal: hollow shell / wobble in the wind / x-ray reveal of the pylon.
//   P: {statue: S, wind: false | {at}, q: {x, y, at} | false (big red "?"), labels}
// SHOTS.sl_tower — the x-rayed statue at the left, the Eiffel Tower drawing itself up at the right (cue "tower"),
//   the two lattices linked by a dashed gold line, Paris roofs in front, the narrator. P: {statue: S, tower: {x: 0.74,
//   base: 0.62, h: 0.5, at}, roofs, kasif: K, labels, lines, highlight}
// cues: hit (punch), cal, eq, salute, drop, counter.at, xray, wind/wobble.at, q.at, tower, labels / seq / words "at".
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
  const COPPER = () => mix(mix(INK.gold, INK.red, 0.42), INK.ink, 0.1);
  const PATINA = () => mix(INK.green, INK.paperLight, 0.32);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25);
  const atNum = (cues, v, fb) => v === false || v == null ? fb : atOr(cues, v, fb);

  // ------------------------------------------------------------------ the statue (front view, feet at 0)
  const BODY = [[-175, 0], [-168, -120], [-152, -260], [-138, -400], [-124, -520], [-112, -578], [-78, -606], [-34, -622], [34, -622], [82, -604], [118, -566], [142, -500], [158, -400], [170, -260], [182, -120], [190, 0], [120, 12], [40, 4], [-40, 12], [-110, 4]];
  const SHADE = [[60, -604], [118, -566], [142, -500], [158, -400], [170, -260], [182, -120], [190, 0], [120, 12], [96, -200], [84, -420]];
  const ARM = [[-122, -566], [-138, -660], [-148, -780], [-150, -895], [-104, -900], [-100, -780], [-92, -670], [-72, -604]];
  const HEAD = ell(0, -684, 46, 58, 16);
  const CROWN = [[-52, -712], [52, -712], [49, -738], [-49, -738]];
  const TABLET = (() => { const c = [150, -440], a = -12 * Math.PI / 180, w = 36, h = 86; return [[-w, -h], [w, -h], [w, h], [-w, h]].map(p => [c[0] + p[0] * Math.cos(a) - p[1] * Math.sin(a), c[1] + p[0] * Math.sin(a) + p[1] * Math.cos(a)]); })();
  const CUP = [[-162, -965], [-88, -965], [-98, -992], [-152, -992]];
  const FLAME = [[-150, -992], [-140, -1030], [-124, -1062], [-108, -1030], [-100, -992]];
  const FOLDS = [
    [[-70, -580], [-82, -380], [-96, -180], [-110, 0]], [[-10, -600], [-14, -400], [-8, -200], [-14, 6]], [[40, -560], [56, -360], [70, -160], [84, 6]],
    [[-100, -548], [-50, -515], [10, -492]],
  ];
  const SPIKES = Array.from({ length: 7 }, (_, i) => { const a = (200 + i * 140 / 6) * Math.PI / 180, L = i === 0 || i === 6 ? 92 : 118, b = [0, -730]; const nx = -Math.sin(a), ny = Math.cos(a); return [[b[0] + Math.cos(a) * 44 + nx * 11, b[1] + Math.sin(a) * 44 + ny * 11], [b[0] + Math.cos(a) * (44 + L), b[1] + Math.sin(a) * (44 + L)], [b[0] + Math.cos(a) * 44 - nx * 11, b[1] + Math.sin(a) * 44 - ny * 11]]; });
  // skin x-extent at a height (for the armature struts)
  const sideAt = y => { const L = [[0, -175], [-120, -168], [-260, -152], [-400, -138], [-520, -124], [-578, -112]], R = [[0, 190], [-120, 182], [-260, 170], [-400, 158], [-520, 142], [-566, 118]]; const f = T => { for (let i = 0; i < T.length - 1; i++) if (y <= T[i][0] && y >= T[i + 1][0]) return lerp(T[i][1], T[i + 1][1], (y - T[i][0]) / (T[i + 1][0] - T[i][0])); return T[T.length - 1][1]; }; return [f(L), f(R)]; };
  // pedestal + star fort below the feet (units, y down)
  const PED = { cap: [[-200, 0], [200, 0], [206, 34], [-206, 34]], shaft: [[-176, 34], [176, 34], [214, 520], [-214, 520]], base: [[-262, 520], [262, 520], [272, 600], [-272, 600]] };
  const FORT = Array.from({ length: 22 }, (_, i) => { const a = i / 22 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 470 : 600; return [Math.cos(a) * r, 640 + Math.sin(a) * r * 0.13]; });

  function statue(parent, sd) {
    const g = el(parent, 'g');
    const glow = inkEl(g, INK.gold, { 'fill-opacity': 0.28 });
    const fort = inkEl(g, mix(INK.paperDark, INK.stain, 0.3)), fortW = inkEl(g, mix(INK.paperDark, INK.inkSoft, 0.25)), ped = inkEl(g, mix(INK.paperLight, INK.paperDark, 0.55)), pedD = inkEl(g, mix(INK.inkSoft, INK.ink, 0.3)), pedR = inkEl(g);
    const arm = inkEl(g), body = inkEl(g), inner = inkEl(g), shade = inkEl(g), head = inkEl(g), crown = inkEl(g), tablet = inkEl(g), cup = inkEl(g), flame = inkEl(g, INK.gold), flameI = inkEl(g, INK.red, { 'fill-opacity': 0.8 });
    const folds = inkEl(g, INK.inkSoft), skel2 = inkEl(g, INK.inkSoft), skel = inkEl(g, INK.ink), skelHi = inkEl(g, INK.red), r = inkEl(g), face = inkEl(g);
    return {
      update(t, o, lt = t, cues = {}) {
        const s = o.s ?? 1, x = o.x, y = o.y, k = sd * 11;
        const wa = o.wobble ? atNum(cues, o.wobble.at, 0) : null;
        const tilt = (o.tilt || 0) + (wa != null && lt >= wa ? Math.sin((lt - wa) * 3.2) * (o.wobble.amp ?? 3) * clamp01((lt - wa) * 2) : 0);
        const ca = Math.cos(tilt * Math.PI / 180), sa = Math.sin(tilt * Math.PI / 180);
        const P = p => [x + s * (p[0] * ca - p[1] * sa), y + s * (p[0] * sa + p[1] * ca)];
        const Q = p => [x + s * p[0], y + s * p[1]];          // pedestal does not tilt
        const pat = clamp01(o.patina || 0), skin = mix(COPPER(), PATINA(), pat), dark = mix(skin, INK.ink, 0.28), light = mix(skin, INK.paperLight, 0.3);
        const xa = o.xray === false || o.xray == null ? null : atNum(cues, o.xray, 0), xr = xa == null ? 0 : (lt >= xa ? progIO(lt, xa, 1.1) : 0);
        const hol = o.hollow ? 1 : 0, ghost = Math.max(xr, hol * 0.55);
        const parts = o.parts || 'all', all = parts === 'all';
        // pedestal + fort
        if (o.pedestal) {
          fill(fort, FORT.map(Q), k + 1, t, 1, false);
          fortW.setAttribute('d', loopS(FORT.filter(p => p[1] >= 640).map(Q).concat(FORT.filter(p => p[1] >= 640).reverse().map(p => Q([p[0], p[1] + 70]))), k + 2, t, 1, false));
          ped.setAttribute('d', [loopS(PED.cap.map(Q), k + 3, t, 0.8, false), loopS(PED.shaft.map(Q), k + 4, t, 0.8, false), loopS(PED.base.map(Q), k + 5, t, 0.8, false)].join(' '));
          const D = [];
          [-110, -30, 50].forEach((cx, i) => D.push(loopS([[cx, 80], [cx + 60, 80], [cx + 60, 180], [cx, 180]].map(Q), k + 6 + i, t, 0.6, false)));
          D.push(loopS([[-80, 300], [80, 300], [84, 330], [-84, 330]].map(Q), k + 9, t, 0.6, false));
          pedD.setAttribute('d', D.join(' '));
          const R = [ringS(PED.cap.map(Q), k + 10, t, 4, 1, false), ringS(PED.shaft.map(Q), k + 11, t, 4, 1, false), ringS(PED.base.map(Q), k + 12, t, 4, 1, false), ringS(FORT.map(Q), k + 13, t, 4, 1, false)];
          [230, 262].forEach((yy, i) => R.push(lineS([[-190 - yy * 0.03, yy], [190 + yy * 0.03, yy]].map(Q), k + 14 + i, t, 3)));
          for (let i = 0; i < 9; i++) R.push(lineS([[-560 + i * 140, 650 + (i % 2) * 8], [-560 + i * 140, 705]].map(Q), k + 20 + i, t, 2.5));
          pedR.setAttribute('d', R.join(' '));
        } else { fort.setAttribute('d', ''); fortW.setAttribute('d', ''); ped.setAttribute('d', ''); pedD.setAttribute('d', ''); pedR.setAttribute('d', ''); }
        // torch glow
        const fc = P([-124, -1010]), gl = 1 + 0.08 * Math.sin(t * 6);
        glow.setAttribute('d', all ? loopS(ell(fc[0], fc[1], 120 * s * gl, 120 * s * gl, 14), k + 30, t, 1) : '');
        // skin
        const op = (1 - 0.8 * (hol ? 0 : ghost)).toFixed(3), hollowIn = mix(INK.ink, INK.inkSoft, 0.35);
        [arm, body, head, crown, cup].forEach(e => { e.setAttribute('fill', skin); e.setAttribute('fill-opacity', op); });
        if (hol) { const dk = mix(skin, INK.ink, 0.6); body.setAttribute('fill', dk); arm.setAttribute('fill', dk); }
        shade.setAttribute('fill', hol ? mix(skin, INK.ink, 0.22) : dark); shade.setAttribute('fill-opacity', hol ? 1 : op);
        tablet.setAttribute('fill', light); tablet.setAttribute('fill-opacity', op);
        if (all) {
          fill(arm, ARM.map(P), k + 31, t); fill(body, BODY.map(P), k + 32, t); fill(shade, (hol ? BODY.map(p => [p[0] * 0.8 + 6, p[1] * 0.97 - 8]) : SHADE).map(P), k + 33, t);
          fill(tablet, TABLET.map(P), k + 34, t, 0.8, false); fill(cup, CUP.map(P).concat([P([-136, -965]), P([-136, -930]), P([-114, -930]), P([-114, -965])]), k + 35, t, 0.8, false);
          const fl = FLAME.map((p, i) => i === 2 ? [p[0] + Math.sin(t * 9) * 6, p[1] + Math.sin(t * 7) * 6] : p);
          fill(flame, fl.map(P), k + 36, t, 1.2);
          fill(flameI, [[-136, -994], [-124, -1030 + Math.sin(t * 8) * 5], [-112, -994]].map(P), k + 37, t, 1);
        } else { [arm, body, shade, tablet, cup, flame, flameI].forEach(e => e.setAttribute('d', '')); }
        fill(head, HEAD.map(P).concat([]), k + 38, t);
        crown.setAttribute('d', [loopS(CROWN.map(P), k + 39, t, 0.8, false)].concat(SPIKES.map((q, i) => loopS(q.map(P), k + 40 + i, t, 0.6, false))).join(' '));
        // hollow: dark inside behind a thin double skin
        inner.setAttribute('fill', skin);
        inner.setAttribute('d', '');
        // outlines
        const R = [];
        if (all) {
          R.push(ringS(BODY.map(P), k + 60, t, 6), ringS(ARM.map(P), k + 61, t, 6), ringS(TABLET.map(P), k + 62, t, 4.5, 1, false), ringS(CUP.map(P), k + 63, t, 4.5, 1, false));
          R.push(loopS(ell(...P([-127, -912]), 30 * s, 24 * s, 12), k + 64, t, 0.8), ringS(ell(...P([-127, -912]), 30 * s, 24 * s, 12), k + 65, t, 4.5));
          R.push(ringS([[-136, -965], [-136, -930], [-114, -930], [-114, -965]].map(P), k + 66, t, 4, 1, false), ringS(FLAME.map(P), k + 67, t, 4.5, 1.2));
          R.push(lineS([[-26, -622], [-24, -642]].map(P), k + 68, t, 4.5), lineS([[26, -622], [24, -642]].map(P), k + 69, t, 4.5));
          R.push(lineS([[118, -560], [146, -480], [128, -378]].map(P), k + 70, t, 4.5));
          for (let i = 0; i < 3; i++) R.push(lineS([[-22 + i * 2, -14 - i * 22 - 40], [22 + i * 2, -14 - i * 22 - 46]].map(p => [p[0] * 1.2 + 150, p[1] - 380]).map(P), k + 71 + i, t, 2.5));
          if (hol) {
            const IN = BODY.map(p => [p[0] * 0.94, p[1] * 0.99 - 4]), IA = ARM.map(p => [(p[0] + 110) * 0.8 - 110, p[1] * 0.995]);
            inner.setAttribute('d', [ringS(BODY.map(P), k + 50, t, 18), ringS(ARM.map(P), k + 51, t, 16)].join(' '));
            R.push(ringS(IA.map(P), k + 75, t, 3));
            // jagged cut edge of the opening
            const J = IN.map((p, i) => [p[0] * (i % 2 ? 0.97 : 1.0), p[1] + (i % 2 ? 8 : -6)]);
            R.push(ringS(J.map(P), k + 76, t, 4, 1, false));
            // seams + rivets on the back wall
            [-90, -190, -290, -390, -490].forEach((yy, i) => { const [L0, R0] = sideAt(yy), a = L0 * 0.72, b = R0 * 0.72, pts = []; for (let j = 0; j <= 8; j++) pts.push([lerp(a, b, j / 8), yy + Math.sin(j / 8 * Math.PI) * 14]); R.push(lineS(pts.map(P), k + 140 + i, t, 2.5, 0.5)); for (let j = 1; j < 8; j += 1) { const c = P([lerp(a, b, j / 8), yy + Math.sin(j / 8 * Math.PI) * 14 - 12]); R.push(inkCircle(c[0], c[1], 3.2 * s, k + 150 + i * 8 + j, t)); } });
            [-60, 40].forEach((xx, i) => R.push(lineS([[xx, -40], [xx * 0.95, -300], [xx * 0.85, -540]].map(P), k + 200 + i, t, 2.5, 0.5)));
          }
        }
        R.push(ringS(HEAD.map(P), k + 77, t, 6), ringS(CROWN.map(P), k + 78, t, 4.5, 1, false));
        SPIKES.forEach((q, i) => R.push(ringS(q.map(P), k + 80 + i, t, 4, 0.6, false)));
        if (!all) R.push(lineS([[-30, -630], [-34, -560]].map(P), k + 88, t, 5), lineS([[30, -630], [34, -560]].map(P), k + 89, t, 5));
        r.setAttribute('d', R.join(' '));
        folds.setAttribute('d', all && !hol ? FOLDS.map((q, i) => lineS(q.map(P), k + 90 + i, t, 3)).join(' ') : '');
        // face: calm classical (eyes with lids, straight nose, closed mouth, hair waves)
        const F = [
          lineS([[-32, -692], [-19, -699], [-6, -692]].map(P), k + 100, t, 3.5), lineS([[6, -692], [19, -699], [32, -692]].map(P), k + 101, t, 3.5),
          lineS([[-34, -707], [-19, -713], [-5, -708]].map(P), k + 102, t, 3), lineS([[5, -708], [19, -713], [34, -707]].map(P), k + 103, t, 3),
          lineS([[-1, -704], [-5, -664], [6, -660]].map(P), k + 104, t, 3), lineS([[-13, -645], [0, -642], [13, -645]].map(P), k + 105, t, 3.5),
          lineS([[-46, -700], [-52, -672], [-44, -650], [-50, -628]].map(P), k + 106, t, 3), lineS([[46, -700], [52, -672], [44, -650], [50, -628]].map(P), k + 107, t, 3),
        ];
        const e1 = P([-19, -693]), e2 = P([19, -693]);
        F.push(inkCircle(e1[0], e1[1], 3.5 * s, k + 108, t), inkCircle(e2[0], e2[1], 3.5 * s, k + 109, t));
        face.setAttribute('d', F.join(' '));
        // Eiffel's skeleton: central pylon (4 legs seen as 2, cross-braced) + flat-bar struts out to the skin + arm truss
        if (xr > 0.001 && all) {
          const yTop = -600 * Math.min(1, xr * 1.25), S1 = [], S2 = [], n = 8;
          const lx = yy => lerp(-72, -32, yy / -600), rx = yy => lerp(72, 32, yy / -600);
          S1.push(lineS([[-72, 0], [lx(yTop), yTop]].map(P), k + 120, t, 8), lineS([[72, 0], [rx(yTop), yTop]].map(P), k + 121, t, 8));
          for (let i = 0; i < n; i++) {
            const y0 = -i * 75, y1 = -(i + 1) * 75; if (y1 < yTop - 1) break;
            S1.push(lineS([[lx(y0), y0], [rx(y1), y1]].map(P), k + 122 + i, t, 4), lineS([[rx(y0), y0], [lx(y1), y1]].map(P), k + 140 + i, t, 4), lineS([[lx(y1), y1], [rx(y1), y1]].map(P), k + 160 + i, t, 4.5));
          }
          const sp = clamp01((xr - 0.45) / 0.55);
          if (sp > 0) {
            [-80, -200, -320, -440, -540].forEach((yy, i) => { const [L, Rr] = sideAt(yy); S2.push(lineS([[lx(yy), yy], [lerp(lx(yy), L * 0.96, sp), yy - 10]].map(P), k + 180 + i, t, 3.5), lineS([[rx(yy), yy], [lerp(rx(yy), Rr * 0.96, sp), yy - 14]].map(P), k + 190 + i, t, 3.5)); });
            const a0 = [-46, -580], a1 = [-128, -900], b0 = [-22, -600], b1 = [-112, -900];
            const A = [a0, [lerp(a0[0], a1[0], sp), lerp(a0[1], a1[1], sp)]], B = [b0, [lerp(b0[0], b1[0], sp), lerp(b0[1], b1[1], sp)]];
            S1.push(lineS(A.map(P), k + 200, t, 5), lineS(B.map(P), k + 201, t, 5));
            for (let i = 1; i < 6 * sp; i++) { const u = i / 6, v = (i + 0.5) / 6; S2.push(lineS([[lerp(a0[0], a1[0], u), lerp(a0[1], a1[1], u)], [lerp(b0[0], b1[0], v), lerp(b0[1], b1[1], v)]].map(P), k + 210 + i, t, 3)); }
            S2.push(lineS([[0, -600], [0, -600 - 80 * sp]].map(P), k + 220, t, 4));
          }
          skel.setAttribute('d', S1.join(' ')); skel2.setAttribute('d', S2.join(' '));
          const hp = o.hiAt != null && lt >= o.hiAt ? 0.5 + 0.5 * Math.sin((lt - o.hiAt) * 6) : 0;
          skelHi.setAttribute('d', hp > 0.05 ? [lineS([[-72, 0], [lx(yTop), yTop]].map(P), k + 230, t, 4 * hp), lineS([[72, 0], [rx(yTop), yTop]].map(P), k + 231, t, 4 * hp)].join(' ') : '');
        } else { skel.setAttribute('d', ''); skel2.setAttribute('d', ''); skelHi.setAttribute('d', ''); }
        return { head: P([0, -684]), torch: P([-124, -1030]), chest: P([0, -480]), feet: [x, y] };
      },
    };
  }

  // ------------------------------------------------------------------ two stacked pennies (3/4 view), ground y
  function coins(parent, sd) {
    const g = el(parent, 'g'), parts = [0, 1].map(() => ({ side: inkEl(g, mix(COPPER(), INK.ink, 0.3)), top: inkEl(g, mix(COPPER(), INK.paperLight, 0.22)), r: inkEl(g) }));
    const head = inkEl(g);
    return {
      update(t, x, y, s, n = 2, lift = 0) {
        const R = 118 * s, ry = 40 * s, th = 17 * s, gap = 5 * s, k = sd * 3;
        let yt = y;
        for (let i = 0; i < n; i++) {
          const cx = x + i * 22 * s, yb = y - i * (th + gap) - (i === n - 1 ? lift : 0), ytop = yb - th, P = parts[i];
          const band = []; for (let j = 0; j <= 16; j++) { const a = Math.PI * j / 16; band.push([cx + Math.cos(a) * R, yb + Math.sin(a) * ry]); }
          for (let j = 16; j >= 0; j--) { const a = Math.PI * j / 16; band.push([cx + Math.cos(a) * R, ytop + Math.sin(a) * ry]); }
          P.side.setAttribute('d', loopS(band, k + i, t, 0.5));
          P.top.setAttribute('d', loopS(ell(cx, ytop, R, ry, 24), k + 20 + i, t, 0.5));
          const L = [ringS(band, k + 10 + i, t, 4, 0.5), ringS(ell(cx, ytop, R, ry, 24), k + 22 + i, t, 4, 0.5), ringS(ell(cx, ytop, R * 0.84, ry * 0.84, 22), k + 24 + i, t, 2, 0.5)];
          for (let j = 1; j < 14; j++) { const a = Math.PI * j / 14; L.push(lineS([[cx + Math.cos(a) * R, yb + Math.sin(a) * ry - 3], [cx + Math.cos(a) * R, ytop + Math.sin(a) * ry + 3]], k + 30 + i * 14 + j, t, 1.5, 0.3)); }
          P.r.setAttribute('d', L.join(' '));
          yt = ytop; if (i === n - 1) { const hx = cx, hy = ytop, Q = p => [hx + p[0] * s, hy + p[1] * s * 0.34];
            head.setAttribute('d', [lineS([[-28, -70], [-6, -86], [16, -76], [24, -52], [36, -34], [26, -24], [30, -6], [22, 10], [24, 30], [4, 44], [-6, 70]].map(Q), k + 60, t, 3, 0.4), lineS([[-28, -70], [-40, -30], [-34, 10], [-20, 40]].map(Q), k + 61, t, 3, 0.4)].join(' ')); }
        }
        return { top: yt, h: n * th + (n - 1) * gap, x1: x + (n - 1) * 22 * s + R };
      },
    };
  }

  // ------------------------------------------------------------------ workbench (top y, to the frame bottom)
  function bench(parent, sd, W, H) {
    const g = el(parent, 'g'), topF = inkEl(g, mix(WOOD(), INK.paperLight, 0.2)), front = inkEl(g, mix(WOOD(), INK.ink, 0.12)), r = inkEl(g), tools = inkEl(g, mix(INK.inkSoft, INK.ink, 0.3));
    return {
      update(t, y) {
        const k = sd * 5, d = 110;
        fill(topF, [[-30, y], [W + 30, y], [W + 30, y + d], [-30, y + d]], k + 1, t, 0.8, false);
        fill(front, [[-30, y + d], [W + 30, y + d], [W + 30, H + 30], [-30, H + 30]], k + 2, t, 0.8, false);
        const R = [lineS([[-30, y], [W + 30, y]], k + 3, t, 5), lineS([[-30, y + d], [W + 30, y + d]], k + 4, t, 6)];
        for (let i = 1; i < 4; i++) R.push(lineS([[-30, y + i * d / 4], [W + 30, y + i * d / 4 + 3]], k + 10 + i, t, 2, 0.6));
        for (let i = 1; i < 5; i++) { const yy = y + d + i * (H - y - d) / 5; R.push(lineS([[-30, yy], [W + 30, yy + 4]], k + 20 + i, t, 3)); }
        [0.2, 0.55, 0.85].forEach((u, i) => R.push(inkCircle(u * W, y + d + (H - y - d) * 0.25, 12, k + 30 + i, t)));
        r.setAttribute('d', R.join(' '));
        // hammers + rivets hanging on the front rail
        const T = [];
        [[0.12, 0.62], [0.42, 0.66], [0.7, 0.6]].forEach(([u, v], i) => { const hx = u * W, hy = y + d + (H - y - d) * v * 0.6, sw = Math.sin(t * 1.4 + i) * 0.06; T.push(lineS([[hx, hy - 120], [hx + 140 * sw, hy + 40]], k + 40 + i, t, 12), loopS([[hx - 60 + 140 * sw, hy + 40], [hx + 60 + 140 * sw, hy + 40], [hx + 60 + 140 * sw, hy + 90], [hx - 60 + 140 * sw, hy + 90]], k + 50 + i, t, 0.6, false)); });
        tools.setAttribute('d', T.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ foreground shelf with repousse tools (y = shelf top)
  function props(parent, sd, W, H) {
    const g = el(parent, 'g'), plank = inkEl(g, mix(WOOD(), INK.paperLight, 0.12)), form = inkEl(g, mix(WOOD(), INK.stain, 0.4)), formIn = inkEl(g, mix(WOOD(), INK.ink, 0.3)),
      metal = inkEl(g, mix(INK.inkSoft, INK.paperLight, 0.2)), handle = inkEl(g, mix(INK.stain, INK.ink, 0.15)), cu = inkEl(g, COPPER()), r = inkEl(g);
    return {
      update(t, y) {
        const k = sd * 5, R = [];
        const pl = [[-30, y], [W + 30, y - 8], [W + 30, H + 30], [-30, H + 30]];
        fill(plank, pl, k + 1, t, 0.6, false); R.push(lineS([[-30, y], [W + 30, y - 8]], k + 2, t, 6), lineS([[-30, y + 70], [W + 30, y + 62]], k + 3, t, 3));
        for (let i = 1; i < 4; i++) R.push(lineS([[-30, y + 70 + i * (H - y) / 4], [W + 30, y + 64 + i * (H - y) / 4]], k + 4 + i, t, 2.5, 0.6));
        // wooden repousse form (block with a carved hollow: a giant curl of hair)
        const fx = 0.2 * W, fy = y + 150, fp = [[fx - 170, fy + 120], [fx + 170, fy + 110], [fx + 150, fy - 90], [fx - 150, fy - 80]];
        fill(form, fp, k + 10, t, 0.6, false); R.push(ringS(fp, k + 11, t, 5, 0.6, false));
        const hp = []; for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI * 3, rr = 90 - i * 4.4; hp.push([fx + Math.cos(a) * rr, fy + 10 + Math.sin(a) * rr * 0.6]); }
        formIn.setAttribute('d', lineS(hp, k + 12, t, 14, 0.6));
        // mallet (wooden barrel head) + planishing hammer (iron head), lying across the plank; heads sit across the handle end
        const tool = (p0, p1, hl, hw, kk) => { const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux, c = p0;
          return [[c[0] + nx * hl - ux * hw, c[1] + ny * hl - uy * hw], [c[0] + nx * hl + ux * hw, c[1] + ny * hl + uy * hw], [c[0] - nx * hl + ux * hw, c[1] - ny * hl + uy * hw], [c[0] - nx * hl - ux * hw, c[1] - ny * hl - uy * hw]]; };
        const sw = Math.sin(t * 1.1) * 3;
        const m0 = [0.47 * W, y + 120], m1 = [0.47 * W + 330, y + 260 + sw], h0 = [0.8 * W, y + 360], h1 = [0.8 * W - 260, y + 470];
        const mhead = tool(m0, m1, 95, 55), hhead = tool(h0, h1, 80, 26);
        handle.setAttribute('d', [lineS([m0, m1], k + 20, t, 24), lineS([h0, h1], k + 21, t, 20), inkLoop(mhead, { seed: k + 25, t, smooth: true, amp: 0.5 })].join(' '));
        metal.setAttribute('d', loopS(hhead, k + 22, t, 0.4, false));
        R.push(ringS(hhead, k + 23, t, 4, 0.4, false), ringS(mhead, k + 24, t, 4.5, 0.5, true), lineS([m0, m1], k + 26, t, 3), lineS([h0, h1], k + 27, t, 3));
        // copper offcuts (curls) + rivets
        const C = [];
        [[0.42, 0.62], [0.62, 0.78], [0.9, 0.62], [0.35, 0.9]].forEach(([u, v], i) => { const cx = u * W, cy = y + v * (H - y), pts = []; for (let j = 0; j <= 14; j++) { const a = j / 14 * Math.PI * 2.2 + i, rr = 60 - j * 3; pts.push([cx + Math.cos(a) * rr * 1.4, cy + Math.sin(a) * rr * 0.5]); } C.push(lineS(pts, k + 30 + i, t, 12, 0.5)); R.push(lineS(pts, k + 40 + i, t, 2.5, 0.5)); });
        cu.setAttribute('d', C.join(' '));
        const mhF = inkLoop(mhead, { seed: k + 25, t, smooth: true, amp: 0.5 });
        form.setAttribute('d', [loopS(fp, k + 10, t, 0.6, false), mhF].join(' '));
        for (let i = 0; i < 7; i++) { const c = [0.55 * W + i * 34, y + 470 + (i % 2) * 20]; R.push(inkCircle(c[0], c[1], 9, k + 50 + i, t)); }
        r.setAttribute('d', R.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ copper sheet lying on the bench, overhanging the front
  function sheet(parent, sd) {
    const g = el(parent, 'g'), top = inkEl(g, mix(COPPER(), INK.paperLight, 0.12)), edge = inkEl(g, mix(COPPER(), INK.ink, 0.4)), r = inkEl(g), ham = inkEl(g, mix(COPPER(), INK.paperLight, 0.55));
    return {
      update(t, x0, x1, y, th, over = 60) {
        const k = sd * 7, dep = 90;
        const tp = [[x0 + 40, y - dep], [x1 + 40, y - dep - 6], [x1, y + over * 0.2], [x0, y + over * 0.2]];
        fill(top, tp, k + 1, t, 0.8, false);
        const ep = [[x0, y + over * 0.2], [x1, y + over * 0.2], [x1, y + over * 0.2 + th], [x0, y + over * 0.2 + th]];
        fill(edge, ep, k + 2, t, 0.5, false);
        const H = []; const R = rng(sd); for (let i = 0; i < 9; i++) { const u = R(), v = 0.15 + R() * 0.7, cx = lerp(x0 + 40, x1, u) - v * 30, cy = y - dep + v * (dep + over * 0.2); H.push(lineS([[cx - 30, cy + 4], [cx, cy - 3], [cx + 30, cy + 4]], k + 10 + i, t, 2, 0.4)); }
        H.push(lineS([[x0 + 4, y + over * 0.2 + 3], [x1 - 4, y + over * 0.2 + 3]], k + 30, t, 2.5, 0.3));
        ham.setAttribute('d', H.join(' '));
        r.setAttribute('d', [ringS(tp, k + 3, t, 4, 0.8, false), ringS(ep, k + 4, t, 3.5, 0.5, false)].join(' '));
        return { edgeTop: y + over * 0.2, edgeBot: y + over * 0.2 + th, x1 };
      },
    };
  }

  // ------------------------------------------------------------------ caliper (vertical bar, jaws pointing left)
  function caliper(parent, sd) {
    const g = el(parent, 'g'), body = inkEl(g, mix(INK.paperLight, INK.inkSoft, 0.25)), r = inkEl(g), tk = inkEl(g, INK.ink);
    return {
      update(t, x, yBot, yTop, p) {
        const k = sd * 5, gap = lerp(170, 0, p), top = yTop - gap;
        const bar = [[x, top - 170], [x + 34, top - 170], [x + 34, yBot + 40], [x, yBot + 40]];
        const lo = [[x - 150, yBot], [x + 34, yBot], [x + 34, yBot + 40], [x - 150, yBot + 14]];
        const hi = [[x - 150, top], [x + 50, top], [x + 50, top - 70], [x - 10, top - 70], [x - 10, top - 14], [x - 150, top - 14]];
        body.setAttribute('d', [loopS(bar, k + 1, t, 0.5, false), loopS(lo, k + 2, t, 0.5, false), loopS(hi, k + 3, t, 0.5, false)].join(' '));
        r.setAttribute('d', [ringS(bar, k + 4, t, 4, 0.5, false), ringS(lo, k + 5, t, 4, 0.5, false), ringS(hi, k + 6, t, 4, 0.5, false)].join(' '));
        const T = []; for (let i = 0; i < 14; i++) { const yy = yBot + 30 - i * 26; if (yy < top - 160) break; T.push(lineS([[x + 6, yy], [x + (i % 5 ? 18 : 28), yy]], k + 10 + i, t, 2.5, 0.4)); }
        tk.setAttribute('d', T.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ steamboat (side view, bow +x, waterline y = 0)
  function steamer(parent, sd) {
    const g = el(parent, 'g'), smoke = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.3 }), hull = inkEl(g, mix(INK.ink, INK.inkSoft, 0.25)), cab = inkEl(g, INK.paperLight), fun = inkEl(g, INK.red), flg = inkEl(g, INK.blue), flg2 = inkEl(g, INK.red), r = inkEl(g);
    return {
      update(t, x, y, s, face = 1, puff = null) {
        const k = sd * 9, P = p => [x + face * p[0] * s, y + p[1] * s + Math.sin(t * 1.6 + sd) * 3 * s];
        const hp = [[-220, -40], [230, -46], [280, -80], [240, 10], [-200, 12], [-240, -20]];
        fill(hull, hp.map(P), k + 1, t);
        const cp = [[-150, -40], [120, -44], [120, -100], [-150, -96]];
        fill(cab, cp.map(P), k + 2, t, 0.8, false);
        fill(fun, [[-20, -100], [20, -100], [16, -200], [-16, -200]].map(P), k + 3, t, 0.8, false);
        const ph = Math.sin(t * 4 + sd) * 10;
        fill(flg, [[-200, -190], [-130, -184 + ph * 0.5], [-200, -150]].map(P), k + 4, t, 0.6, false);
        fill(flg2, [[200, -170], [250, -164 + ph * 0.5], [200, -140]].map(P), k + 5, t, 0.6, false);
        const R = [ringS(hp.map(P), k + 6, t, 4.5), ringS(cp.map(P), k + 7, t, 4, 1, false), ringS([[-20, -100], [20, -100], [16, -200], [-16, -200]].map(P), k + 8, t, 4, 1, false), lineS([[-200, -40], [-200, -200]].map(P), k + 9, t, 4), lineS([[200, -44], [200, -180]].map(P), k + 10, t, 4)];
        for (let i = 0; i < 6; i++) R.push(inkCircle(...P([-120 + i * 42, -72]), 9 * s, k + 20 + i, t));
        r.setAttribute('d', R.join(' '));
        const SM = []; for (let i = 0; i < 5; i++) { const u = (t * 0.35 + i / 5) % 1, c = P([-u * 200, -220 - u * 160]); SM.push(loopS(ell(c[0], c[1], (22 + u * 55) * s, (16 + u * 32) * s, 10), k + 30 + i, t, 1.2)); }
        if (puff != null && t >= 0) { for (let i = 0; i < 4; i++) { const u = clamp01((puff - i * 0.05) / 1.6); if (puff > i * 0.05 && u < 1) { const c = P([280 + u * 120 + i * 30, -70 - u * 80]); SM.push(loopS(ell(c[0], c[1], (30 + u * 80) * s, (24 + u * 50) * s, 10), k + 40 + i, t, 1.5)); } } }
        smoke.setAttribute('d', SM.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ cheering crowd (rows of hats, waving flags)
  function crowd(parent, sd, W, H, C) {
    const g = el(parent, 'g'), body = inkEl(g, mix(INK.inkSoft, INK.ink, 0.35)), headF = inkEl(g, INK.paperLight), hats = inkEl(g, INK.ink), fl = inkEl(g, INK.red), flB = inkEl(g, INK.blue), r = inkEl(g);
    const R = rng(sd), rows = C.rows ?? 3, y0 = (C.y ?? 0.78) * H;
    const ppl = []; for (let i = 0; i < rows; i++) { const s = 0.7 + i * 0.45, y = y0 + i * (H - y0) / rows * 1.15, n = Math.ceil(W / (120 * s)) + 1; for (let j = 0; j < n; j++) ppl.push({ x: (j + 0.3 * (i % 2) + R() * 0.3) * W / (n - 1), y, s, ph: R() * 6, hat: R() < 0.5 ? 'top' : 'bowler', flag: R() < 0.3, arm: R() < 0.55 }); }
    return {
      update(t, lt) {
        const k = sd * 3, B = [], Hd = [], Ht = [], F = [], FB = [], L = [];
        ppl.forEach((p, i) => {
          const s = p.s, bob = Math.abs(Math.sin(t * 3 + p.ph)) * 10 * s, x = p.x, y = p.y - bob, hr = 34 * s;
          B.push(loopS([[x - 60 * s, y + 200 * s], [x - 50 * s, y + 40 * s], [x, y + 20 * s], [x + 50 * s, y + 40 * s], [x + 60 * s, y + 200 * s]], k + i, t, 0.8));
          Hd.push(loopS(ell(x, y - 10 * s, hr, hr * 1.05, 10), k + 200 + i, t, 0.6)); L.push(ringS(ell(x, y - 10 * s, hr, hr * 1.05, 10), k + 400 + i, t, 3.5 * Math.min(1.3, s), 0.6));
          if (p.hat === 'top') Ht.push(loopS([[x - 44 * s, y - 34 * s], [x + 44 * s, y - 34 * s], [x + 30 * s, y - 40 * s], [x + 30 * s, y - 100 * s], [x - 30 * s, y - 100 * s], [x - 30 * s, y - 40 * s]], k + 600 + i, t, 0.6, false));
          else Ht.push(loopS([[x - 46 * s, y - 32 * s], [x + 46 * s, y - 32 * s], [x + 32 * s, y - 40 * s], [x + 28 * s, y - 70 * s], [x, y - 80 * s], [x - 28 * s, y - 70 * s], [x - 32 * s, y - 40 * s]], k + 600 + i, t, 0.6));
          if (p.arm) {
            const sw = Math.sin(t * 5 + p.ph) * 0.4, hx = x + 50 * s + Math.sin(sw) * 60 * s, hy = y - 110 * s - Math.cos(sw) * 30 * s;
            L.push(lineS([[x + 40 * s, y + 50 * s], [x + 60 * s, y - 20 * s], [hx, hy]], k + 800 + i, t, 6 * Math.min(1.3, s)));
            if (p.flag) {
              const fx = hx, fy = hy - 10 * s, w = 70 * s, h = 46 * s, wv = Math.sin(t * 6 + p.ph) * 6 * s;
              L.push(lineS([[fx, fy + 40 * s], [fx, fy - h]], k + 900 + i, t, 3.5));
              F.push(loopS([[fx, fy - h], [fx + w, fy - h + wv], [fx + w, fy + wv], [fx, fy]], k + 1000 + i, t, 0.5, false));
              FB.push(loopS([[fx, fy - h], [fx + w * 0.45, fy - h + wv * 0.45], [fx + w * 0.45, fy - h * 0.45 + wv * 0.45], [fx, fy - h * 0.45]], k + 1100 + i, t, 0.4, false));
              for (let j = 1; j < 3; j++) L.push(lineS([[fx + w * 0.45, fy - h + j * h / 3 + wv * 0.5], [fx + w, fy - h + j * h / 3 + wv]], k + 1200 + i * 3 + j, t, 4 * s, 0.4));
            }
          }
        });
        body.setAttribute('d', B.join(' ')); headF.setAttribute('d', Hd.join(' ')); hats.setAttribute('d', Ht.join(' '));
        fl.setAttribute('d', F.join(' ')); flB.setAttribute('d', FB.join(' ')); r.setAttribute('d', L.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ Paris rooftops (rows back -> front)
  function roofs(parent, sd, W, H, rows) {
    const g = el(parent, 'g');
    const R = rng(sd);
    const RW = rows.map((rw, ri) => {
      const s = rw.s ?? 1, y = rw.y * H, out = []; let x = -40 - R() * 60;
      while (x < W + 40) { const w = (180 + R() * 120) * s; out.push({ x, w, rh: (80 + R() * 40) * s, chim: R() < 0.7, dorm: 1 + Math.floor(R() * 2), ph: R() * 6 }); x += w + 4 * s; }
      return { y, s, b: out, wall: inkEl(g, mix(INK.paperLight, INK.paperDark, 0.35 + ri * 0.1)), roof: inkEl(g, mix(INK.inkSoft, INK.blue, 0.25)), win: inkEl(g, mix(INK.ink, INK.inkSoft, 0.3)), smoke: inkEl(g, INK.inkSoft, { 'fill-opacity': 0.25 }), r: inkEl(g) };
    });
    return {
      update(t) {
        RW.forEach((rw, ri) => {
          const k = sd * 7 + ri * 500, s = rw.s, WL = [], RF = [], WN = [], SM = [], L = [];
          rw.b.forEach((b, i) => {
            const x0 = b.x, x1 = b.x + b.w, y = rw.y, bot = H + 40;
            const wall = [[x0, y], [x1, y], [x1, bot], [x0, bot]], roof = [[x0 - 6 * s, y], [x1 + 6 * s, y], [x1 - 22 * s, y - b.rh], [x0 + 22 * s, y - b.rh]];
            WL.push(loopS(wall, k + i, t, 0.6, false)); RF.push(loopS(roof, k + 50 + i, t, 0.6, false));
            L.push(ringS(roof, k + 100 + i, t, 3.5, 0.6, false), lineS([[x0, y], [x0, Math.min(bot, y + 600 * s)]], k + 150 + i, t, 3));
            for (let d = 0; d < b.dorm; d++) { const dx = x0 + (d + 0.5) * b.w / b.dorm, dp = [[dx - 18 * s, y - 14 * s], [dx + 18 * s, y - 14 * s], [dx + 18 * s, y - 56 * s], [dx, y - 70 * s], [dx - 18 * s, y - 56 * s]]; RF.push(''); WN.push(loopS(dp, k + 200 + i * 3 + d, t, 0.4, false)); }
            for (let row = 0; row < 4; row++) for (let c = 0; c < 3; c++) { const wx = x0 + (c + 0.5) * b.w / 3, wy = y + (50 + row * 120) * s; if (wy > H) continue; WN.push(loopS([[wx - 16 * s, wy], [wx + 16 * s, wy], [wx + 16 * s, wy + 56 * s], [wx - 16 * s, wy + 56 * s]], k + 300 + i * 12 + row * 3 + c, t, 0.4, false)); }
            if (b.chim) {
              const cx = x0 + b.w * 0.72, cp = [[cx - 16 * s, y - b.rh + 10 * s], [cx + 16 * s, y - b.rh + 10 * s], [cx + 16 * s, y - b.rh - 50 * s], [cx - 16 * s, y - b.rh - 50 * s]];
              WL.push(loopS(cp, k + 450 + i, t, 0.5, false)); L.push(ringS(cp, k + 470 + i, t, 3, 0.5, false));
              for (let j = 0; j < 3; j++) { const u = (t * 0.25 + j / 3 + b.ph) % 1, c2 = [cx - u * 60 * s + Math.sin(u * 6 + b.ph) * 10, y - b.rh - 60 * s - u * 170 * s]; SM.push(loopS(ell(c2[0], c2[1], (10 + u * 26) * s, (8 + u * 16) * s, 9), k + 490 + i * 3 + j, t, 1)); }
            }
          });
          rw.wall.setAttribute('d', WL.join(' ')); rw.roof.setAttribute('d', RF.filter(Boolean).join(' ')); rw.win.setAttribute('d', WN.join(' ')); rw.smoke.setAttribute('d', SM.join(' ')); rw.r.setAttribute('d', L.join(' '));
        });
      },
    };
  }

  // ------------------------------------------------------------------ wooden crate (front + top + side), base y
  function crates(parent, sd) {
    const g = el(parent, 'g'), front = inkEl(g, WOOD()), topF = inkEl(g, mix(WOOD(), INK.paperLight, 0.3)), sideF = inkEl(g, mix(WOOD(), INK.ink, 0.2)), r = inkEl(g), mark = inkEl(g, INK.red, { 'fill-opacity': 0.85 });
    return {
      update(t, list) {
        const k = sd * 5, F = [], T = [], S = [], L = [], M = [];
        list.forEach((c, i) => {
          const { x, y, w, h } = c, d = w * 0.28;
          const fp = [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]];
          const tp = [[x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2 + d, y - h - d * 0.6], [x - w / 2 + d, y - h - d * 0.6]];
          const sp = [[x + w / 2, y], [x + w / 2 + d, y - d * 0.6], [x + w / 2 + d, y - h - d * 0.6], [x + w / 2, y - h]];
          F.push(loopS(fp, k + i * 7, t, 0.5, false)); if (!c.open) T.push(loopS(tp, k + i * 7 + 1, t, 0.5, false)); S.push(loopS(sp, k + i * 7 + 2, t, 0.5, false));
          L.push(ringS(fp, k + i * 7 + 3, t, 4, 0.5, false), ringS(sp, k + i * 7 + 4, t, 3.5, 0.5, false));
          if (!c.open) L.push(ringS(tp, k + i * 7 + 5, t, 3.5, 0.5, false));
          L.push(lineS([[x - w / 2, y - h * 0.15], [x + w / 2, y - h * 0.15]], k + i * 7 + 6, t, 3), lineS([[x - w / 2, y - h * 0.85], [x + w / 2, y - h * 0.85]], k + 2000 + i, t, 3));
          L.push(lineS([[x - w / 2 + 10, y - h * 0.15], [x + w / 2 - 10, y - h * 0.85]], k + 3000 + i, t, 3.5));
          if (c.mark) M.push(loopS(Array.from({ length: 10 }, (_, j) => { const a = j / 10 * Math.PI * 2 - Math.PI / 2, rr = (j % 2 ? 0.4 : 1) * h * 0.16; return [x - w * 0.22 + Math.cos(a) * rr, y - h * 0.5 + Math.sin(a) * rr]; }), k + 4000 + i, t, 0.4, false));
        });
        front.setAttribute('d', F.join(' ')); topF.setAttribute('d', T.join(' ')); sideF.setAttribute('d', S.join(' ')); r.setAttribute('d', L.join(' ')); mark.setAttribute('d', M.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ transport ship (side view, bow +x, waterline y = 0)
  function transport(parent, sd) {
    const g = el(parent, 'g'), smoke = inkEl(g, INK.inkSoft, { 'fill-opacity': 0.3 }), hull = inkEl(g, mix(INK.ink, INK.inkSoft, 0.3)), band = inkEl(g, INK.paperLight), sails = inkEl(g, INK.paperLight), fl = inkEl(g, INK.blue), fl2 = inkEl(g, INK.red), r = inkEl(g);
    return {
      update(t, x, y, s) {
        const k = sd * 9, P = p => [x + p[0] * s, y + p[1] * s + Math.sin(t * 1.2) * 3 * s];
        const hp = [[-330, -80], [330, -84], [380, -120], [330, 14], [-310, 16], [-350, -50]];
        fill(hull, hp.map(P), k + 1, t);
        fill(band, [[-326, -60], [334, -64], [330, -46], [-326, -42]].map(P), k + 2, t, 0.6, false);
        const masts = [-200, -10, 180], S = [], R = [ringS(hp.map(P), k + 3, t, 5)];
        masts.forEach((mx, i) => { R.push(lineS([[mx, -84], [mx, -470]].map(P), k + 10 + i, t, 6)); for (let j = 0; j < 3; j++) { const yy = -180 - j * 100, w = 110 - j * 26; S.push(loopS([[mx - w, yy], [mx + w, yy], [mx + w * 0.85, yy + 26], [mx - w * 0.85, yy + 26]].map(P), k + 20 + i * 3 + j, t, 0.6)); R.push(lineS([[mx - w, yy], [mx + w, yy]].map(P), k + 40 + i * 3 + j, t, 4)); } });
        R.push(lineS([[-340, -70], [-200, -470], [-10, -480], [180, -470], [380, -120]].map(P), k + 60, t, 2.5));
        R.push(loopS([[60, -84], [64, -230], [110, -230], [114, -84]].map(P), k + 61, t, 0.8, false));
        sails.setAttribute('d', S.join(' '));
        const ph = Math.sin(t * 4) * 8;
        fill(fl, [[-200, -470], [-200 + 40, -468 + ph * 0.3], [-200 + 40, -440 + ph * 0.3], [-200, -442]].map(P), k + 70, t, 0.5, false);
        fill(fl2, [[-200 + 80, -466 + ph * 0.6], [-200 + 120, -464 + ph], [-200 + 120, -436 + ph], [-200 + 80, -438 + ph * 0.6]].map(P), k + 71, t, 0.5, false);
        R.push(ringS([[-200, -470], [-80, -464 + ph], [-80, -436 + ph], [-200, -442]].map(P), k + 72, t, 3, 0.5, false), lineS([[-160, -469], [-160, -440]].map(P), k + 73, t, 2.5), lineS([[-120, -467 + ph * 0.6], [-120, -437 + ph * 0.6]].map(P), k + 74, t, 2.5));
        r.setAttribute('d', R.join(' '));
        const SM = []; for (let i = 0; i < 5; i++) { const u = (t * 0.3 + i / 5) % 1, c = P([86 - u * 280, -250 - u * 150]); SM.push(loopS(ell(c[0], c[1], (22 + u * 55) * s, (16 + u * 32) * s, 10), k + 80 + i, t, 1.2)); }
        smoke.setAttribute('d', SM.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ Eiffel Tower (draws itself bottom -> top, p 0..1)
  function tower(parent, sd) {
    const g = el(parent, 'g'), body = inkEl(g, mix(INK.stain, INK.inkSoft, 0.35)), r = inkEl(g), lat = inkEl(g, INK.inkSoft);
    return {
      update(t, x, base, h, p) {
        const k = sd * 9, top = base - h * p;
        const half = v => { const u = v; return lerp(0.5, 0.035, Math.pow(u, 0.55)) * h * 0.62; };   // half width at height share v
        const clipY = y => Math.max(y, top);
        const ptsL = [], ptsR = []; for (let i = 0; i <= 20; i++) { const v = i / 20, y = base - v * h * 0.92; if (y < top) break; ptsL.push([x - half(v), y]); ptsR.push([x + half(v), y]); }
        if (ptsL.length < 2) { body.setAttribute('d', ''); r.setAttribute('d', ''); lat.setAttribute('d', ''); return; }
        const outline = ptsL.concat(ptsR.slice().reverse());
        fill(body, outline, k + 1, t, 0.6);
        const R = [lineS(ptsL, k + 2, t, 6), lineS(ptsR, k + 3, t, 6)];
        // arch + platforms
        const v1 = 0.17, v2 = 0.38, v3 = 0.86;
        if (base - v1 * h <= clipY(base - v1 * h) + 1 && top <= base - v1 * h) {
          const ay = base - v1 * h * 0.92, aw = half(v1 * 0.92) * 0.8, A = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * i / 12; A.push([x - Math.cos(a) * aw, base - Math.sin(a) * (base - ay) * 0.75]); }
          R.push(lineS(A, k + 4, t, 5));
        }
        [v1, v2, v3].forEach((v, i) => { const y = base - v * h * 0.92; if (y >= top) { const w = half(v) + 26 - i * 8; R.push(loopS([[x - w, y], [x + w, y], [x + w, y + 22 - i * 4], [x - w, y + 22 - i * 4]], k + 10 + i, t, 0.5, false)); R.push(ringS([[x - w, y], [x + w, y], [x + w, y + 22 - i * 4], [x - w, y + 22 - i * 4]], k + 14 + i, t, 3.5, 0.5, false)); } });
        if (p > 0.95) R.push(lineS([[x, base - h * 0.92], [x, base - h]], k + 20, t, 5));
        r.setAttribute('d', R.join(' '));
        // lattice X's
        const L = []; for (let i = 0; i < 18; i++) { const v0 = i / 18 * 0.9, v1b = (i + 1) / 18 * 0.9, y0 = base - v0 * h * 0.92, y1 = base - v1b * h * 0.92; if (y1 < top) break; [-1, 1].forEach(sg => { const a0 = x + sg * half(v0), a1 = x + sg * half(v1b), b0 = x + sg * half(v0) * 0.55, b1 = x + sg * half(v1b) * 0.55; L.push(lineS([[a0, y0], [b1, y1]], k + 30 + i * 4 + (sg + 1), t, 2.5, 0.6), lineS([[b0, y0], [a1, y1]], k + 31 + i * 4 + (sg + 1), t, 2.5, 0.6)); }); }
        lat.setAttribute('d', L.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ giant words (Fraunces 900, highlight in a red box)
  function words(parent, P, W, H, sd) {
    const out = [];
    (P.lines || []).forEach((Ln, li) => {
      const size = Ln.size || 130, y = (Ln.y ?? 0.17 + li * 0.09) * H;
      const ts = Ln.words.map(w => { const g = el(parent, 'g'); const box = inkEl(g, INK.red), boxR = inkEl(g); const tx = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` }); tx.textContent = w; return { g, box, boxR, tx, w, hl: w === P.highlight }; });
      const ws = ts.map(o => { let w = 0; try { w = o.tx.getComputedTextLength(); } catch (e) { w = 0; } return w || o.w.length * size * 0.6; });
      const gap = size * 0.32, tot = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
      const sc = Math.min(1, (W - 120) / tot);
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

  // big counter (Fraunces, gold with paper halo)
  function counter(parent, C, W, H) {
    const tx = el(parent, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': C.size || 230, 'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 18px; stroke-linejoin: round` });
    return {
      update(lt, t, cues, sd) {
        const a = atOr(cues, C.at, 0.2), d = C.dur ?? 1.4, p = lt >= a ? prog(lt, a, d) : 0, v = Math.round(lerp(C.from ?? 0, C.to ?? 214, p)), sp = lt >= a ? spring(lt, a, 0.5) : 0, pk = punch(lt, a + d, 0.5), b = boil(sd, t, 1.2);
        tx.textContent = String(v) + (C.suffix || '');
        tx.setAttribute('opacity', clamp01(sp * 3).toFixed(3));
        tx.setAttribute('transform', `translate(${f1((C.x ?? 0.5) * W + b[0])} ${f1((C.y ?? 0.25) * H + b[1])}) scale(${(lerp(0.5, 1, sp) * (1 + 0.1 * pk)).toFixed(3)})`);
      },
    };
  }

  // figure helper (narrator or period figure)
  const person = (parent, K, sd, narrator) => window.TD.figure(el(parent, 'g'), Object.assign({}, K, narrator ? {} : { hat: false }), sd);
  const Sdef = (S, d) => Object.assign({}, d, S || {});
  const place = (S, W, H) => Object.assign({}, S, { x: (S.x ?? 0.5) * W, y: (S.y ?? 0.6) * H });

  // ================================================================== sl_skin
  SH.sl_skin = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2101, top = el(svg, 'g'), root = el(top, 'g');
      const by = (P.bench ?? 0.66) * H;
      const BU = P.bust === false ? null : Sdef(P.bust, { x: 0.5, y: 0.95, s: 1.3 });
      const st = BU ? statue(el(root, 'g'), sd + 1) : null;
      const bn = bench(el(root, 'g'), sd + 2, W, H);
      const SHT = P.sheet === false ? null : Object.assign({ x: 0.06, w: 0.5, th: 44 }, P.sheet || {});
      const sh = SHT ? sheet(el(root, 'g'), sd + 3) : null;
      const CO = Object.assign({ x: 0.76, s: 1 }, P.coins || {});
      const co = coins(el(root, 'g'), sd + 4);
      const cal = P.caliper ? caliper(el(root, 'g'), sd + 5) : null;
      const pr = P.props ? props(el(root, 'g'), sd + 6, W, H) : null;
      const eqE = inkEl(root, INK.gold), spk = inkEl(root, INK.gold);
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          if (st) { const dr = BU.drift ?? 0.012, pl = place(BU, W, H); st.update(t, Object.assign(pl, { x: pl.x + Math.sin(t * 1.3) * 400 * dr, s: BU.s * (1 + dr * lt) }), lt, cues); }
          bn.update(t, by);
          let lift = 0, land = null;
          if (P.hop) { const h0 = atOr(cues, P.hop.at, 0.5), per = P.hop.every ?? 1.0, u = lt - h0; if (u >= 0) { const ph = u % per; lift = ph < 0.5 ? Math.sin(ph / 0.5 * Math.PI) * (P.hop.h ?? 150) : 0; land = ph - 0.5; } }
          const cs = CO.s * (1 + 0.07 * hit), cr = co.update(t, CO.x * W, by + 70, cs, 2, lift);
          if (land != null && land >= 0 && land < 0.35) { const c = [CO.x * W + 22 * cs, cr.top + lift], SP = []; for (let i = 0; i < 8; i++) { const a = Math.PI + i / 7 * Math.PI, r0 = 130 * cs + land * 120, r1 = r0 + 50; SP.push(lineS([[c[0] + Math.cos(a) * r0, c[1] + Math.sin(a) * r0 * 0.45], [c[0] + Math.cos(a) * r1, c[1] + Math.sin(a) * r1 * 0.45]], sd + 600 + i, t, 6)); } spk.setAttribute('d', SP.join(' ')); } else spk.setAttribute('d', '');
          let se = null;
          if (sh) se = sh.update(t, SHT.x * W, (SHT.x + SHT.w) * W, by + 40, cr.h, 70);
          if (cal && se) { const a = atOr(cues, P.caliper.at, dur * 0.3); cal.update(t, se.x1 + 90, se.edgeBot, se.edgeTop, lt >= a ? progIO(lt, a, 0.8) : 0); }
          const ea = P.eq ? atOr(cues, P.eq, dur * 0.5) : null;
          if (ea != null && se && lt >= ea) {
            const u = progIO(lt, ea, 0.6), x0 = SHT.x * W, x1 = CO.x * W + 150 * cs, yy = cr.top, D = [];
            for (let i = 0; i < 14; i++) { const a0 = i / 14, a1 = (i + 0.55) / 14; if (a0 > u) break; D.push(lineS([[lerp(x0, x1, a0), yy - 2 + (se.edgeTop - yy) * (1 - a0) * 0], [lerp(x0, x1, Math.min(a1, u)), yy - 2]], sd + 400 + i, t, 7)); }
            eqE.setAttribute('d', D.join(' '));
          } else eqE.setAttribute('d', '');
          if (pr) pr.update(t, (P.props.y ?? 0.76) * H);
          if (kas) kas.update(lt, t, cues, W, H);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== sl_harbor
  SH.sl_harbor = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2201, top = el(svg, 'g'), root = el(top, 'g');
      const S = Sdef(P.statue, { x: 0.55, y: 0.42, s: 0.5, pedestal: true });
      const glow = P.sun ? inkEl(root, INK.gold, { 'fill-opacity': 0.35 }) : null;
      const water = inkEl(root, INK.inkSoft);
      const st = statue(el(root, 'g'), sd + 1);
      const BT = (P.boats || []).map((b, i) => ({ b, d: steamer(el(root, 'g'), sd + 10 + i) }));
      const cr = P.crowd ? crowd(el(root, 'g'), sd + 3, W, H, P.crowd) : null;
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      const R = rng(sd); const WV = Array.from({ length: 22 }, () => [R(), R()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          if (glow) { const c = [(P.sun.x ?? 0.82) * W, (P.sun.y ?? 0.3) * H]; glow.setAttribute('d', loopS(ell(c[0], c[1], 110, 110, 16), sd + 5, t, 1)); }
          const fy = S.y * H + 640 * S.s, wy0 = fy + 40;
          water.setAttribute('d', WV.map(([u, v], i) => { const y = wy0 + Math.pow(v, 1.3) * (H - wy0), sc = 0.6 + (y - wy0) / (H - wy0) * 1.6, x0 = u * W + Math.sin(t * 1.1 + i) * 10, pts = []; for (let j = 0; j <= 6; j++) pts.push([x0 - 50 * sc + j * 16 * sc, y + Math.sin(j * 1.5 + t * 2 + i) * 5 * sc]); return lineS(pts, sd + 30 + i, t, 2.5 * Math.min(1.5, sc)); }).join(' '));
          st.update(t, Object.assign(place(S, W, H), { s: S.s * (1 + 0.04 * hit) }), lt, cues);
          const sa = P.salute ? atOr(cues, P.salute, null) : null;
          BT.forEach(({ b, d }, i) => d.update(t, (b.x + (b.vx ?? 0.01) * lt * (b.face ?? 1)) * W, b.y * H, b.s ?? 0.5, b.face ?? 1, sa != null && lt >= sa + i * 0.25 ? lt - sa - i * 0.25 : null));
          if (cr) cr.update(t, lt);
          if (kas) kas.update(lt, t, cues, W, H);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== sl_paris
  SH.sl_paris = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2301, root = el(svg, 'g');
      const S = Sdef(P.statue, { x: 0.56, y: 0.7, s: 0.9 });
      const st = statue(el(root, 'g'), sd + 1);
      const scaf = inkEl(root, mix(INK.stain, INK.ink, 0.35)), boards = inkEl(root, WOOD()), wk = inkEl(root), sparks = inkEl(root, INK.gold);
      const rf = roofs(el(root, 'g'), sd + 3, W, H, P.roofs || [{ y: 0.64, s: 0.7 }, { y: 0.74, s: 1 }, { y: 0.86, s: 1.4 }]);
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      const SC = P.scaffold ?? 0.5, NW = P.workers ?? 5;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5)), k = sd;
          const x = S.x * W, y = S.y * H, s = S.s * (1 + 0.03 * hit);
          st.update(t, { x, y, s, patina: S.patina || 0 }, lt, cues);
          const h = 1000 * SC, xs = [-260, -150, 160, 270], lv = [];
          for (let i = 1; i * 110 < h; i++) lv.push(-i * 110);
          const Pp = p => [x + p[0] * s, y + p[1] * s], A = [], B = [], WK = [], SP = [];
          xs.forEach((px, i) => A.push(lineS([[px, 40], [px, -h - 30]].map(Pp), k + 10 + i, t, 7)));
          lv.forEach((ly, j) => {
            B.push(loopS([[-290, ly], [-120, ly], [-120, ly + 14], [-290, ly + 14]].map(Pp), k + 30 + j, t, 0.5, false), loopS([[130, ly], [300, ly], [300, ly + 14], [130, ly + 14]].map(Pp), k + 50 + j, t, 0.5, false));
            A.push(lineS([[-260, ly + 110], [-150, ly]].map(Pp), k + 70 + j, t, 3.5), lineS([[160, ly], [270, ly + 110]].map(Pp), k + 90 + j, t, 3.5));
          });
          scaf.setAttribute('d', A.join(' ')); boards.setAttribute('d', B.join(' '));
          for (let i = 0; i < NW; i++) {
            const side = i % 2 ? 1 : -1, ly = lv[Math.min(lv.length - 1, Math.floor(i / 2) * 2 + 1)] ?? -110, wx = side > 0 ? 200 + (i % 3) * 30 : -230 + (i % 3) * 30;
            const f = Pp([wx, ly]), sc = s * 0.9, sw = Math.sin(t * 9 + i * 1.7);
            const hd = [f[0], f[1] - 92 * sc], hand = [f[0] - side * (34 + 10 * sw) * sc, f[1] - 70 * sc - 26 * sw * sc];
            WK.push(lineS([[f[0] - 14 * sc, f[1]], [f[0], f[1] - 40 * sc], [f[0] + 14 * sc, f[1]]], k + 200 + i, t, 4), lineS([[f[0], f[1] - 40 * sc], [f[0], f[1] - 76 * sc]], k + 210 + i, t, 4), lineS([[f[0], f[1] - 68 * sc], hand], k + 220 + i, t, 4), inkCircle(hd[0], hd[1], 14 * sc, k + 230 + i, t), lineS([hand, [hand[0] - side * 16 * sc, hand[1] - 14 * sc]], k + 240 + i, t, 7));
            if (sw < -0.75) { const c = [f[0] - side * 50 * sc, f[1] - 50 * sc]; for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2 + t; SP.push(lineS([[c[0] + Math.cos(a) * 8, c[1] + Math.sin(a) * 8], [c[0] + Math.cos(a) * 24, c[1] + Math.sin(a) * 24]], k + 250 + i * 5 + j, t, 3)); } }
          }
          wk.setAttribute('d', WK.join(' ')); sparks.setAttribute('d', SP.join(' '));
          rf.update(t);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== sl_crates
  SH.sl_crates = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2401, root = el(svg, 'g');
      const hz = (P.horizon ?? 0.45) * H;
      const SP = Object.assign({ x: 0.66, y: 0.5, s: 0.55 }, P.ship || {});
      const shp = transport(el(root, 'g'), sd + 1);
      const quay = inkEl(root, mix(INK.paperDark, INK.stain, 0.35)), quayR = inkEl(root);
      const der = inkEl(root, mix(INK.stain, INK.ink, 0.4)), rope = inkEl(root, INK.ink);
      const crBack = crates(el(root, 'g'), sd + 3), crHang = crates(el(root, 'g'), sd + 4);
      const face = statue(el(root, 'g'), sd + 5);
      const crFront = crates(el(root, 'g'), sd + 6);
      const ctr = P.counter ? counter(el(svg, 'g'), P.counter, W, H) : null;
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      const qy = (P.quay ?? 0.62) * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          shp.update(t, SP.x * W - lt * 4, SP.y * H, SP.s);
          fill(quay, [[-30, qy], [W + 30, qy - 10], [W + 30, H + 30], [-30, H + 30]], k + 1, t, 0.8, false);
          const Q = [lineS([[-30, qy], [W + 30, qy - 10]], k + 2, t, 6)]; for (let i = 0; i < 12; i++) Q.push(lineS([[i * W / 11 - 40, qy + 8], [i * W / 11 - 200, H + 20]], k + 10 + i, t, 2.5, 0.6));
          quayR.setAttribute('d', Q.join(' '));
          // derrick: mast at the left, boom to the right, rope down to a swinging crate
          const mx = 0.1 * W, bt = [0.34 * W, 0.3 * H], da = atOr(cues, 'drop', dur * 0.3), dp = lt >= da ? progIO(lt, da, 1.4) : 0;
          der.setAttribute('d', [lineS([[mx, qy + 20], [mx, 0.22 * H]], k + 30, t, 14), lineS([[mx, qy - 80], bt], k + 31, t, 10), lineS([[mx, 0.22 * H], bt], k + 32, t, 4)].join(' '));
          const sw = Math.sin(t * 1.8) * 0.04, ry = lerp(0.4, 0.5, dp) * H, cx = bt[0] + Math.sin(sw) * (ry - bt[1]);
          rope.setAttribute('d', [lineS([bt, [cx, ry - 120]], k + 33, t, 4), lineS([[cx, ry - 120], [cx - 70, ry - 90]], k + 34, t, 3), lineS([[cx, ry - 120], [cx + 70, ry - 90]], k + 35, t, 3)].join(' '));
          crHang.update(t, [{ x: cx, y: ry + 30, w: 180, h: 120, mark: true }]);
          crBack.update(t, [{ x: 0.78 * W, y: qy + 30, w: 200, h: 140 }, { x: 0.95 * W, y: qy + 40, w: 180, h: 130, mark: true }, { x: 0.82 * W, y: qy - 110, w: 170, h: 120 }, { x: 0.32 * W, y: qy + 40, w: 190, h: 130, mark: true }]);
          // open crate with the copper face peeking out, big crates in front down to the frame bottom
          const OP = Object.assign({ x: 0.64, y: 0.66, w: 460, h: 250, s: 1.5 }, P.open || {}), ox = OP.x * W, oy = OP.y * H;
          const fs = OP.s * (1 + 0.04 * hit), rise = lt >= da ? 0 : 0;
          face.update(t, { x: ox, y: oy - OP.h - 45 * fs + 684 * fs + rise, s: fs, parts: 'head' }, lt, cues);
          crFront.update(t, [{ x: ox, y: oy, w: OP.w, h: OP.h, open: true }, { x: 0.16 * W, y: 0.86 * H, w: 380, h: 260, mark: true }, { x: 0.86 * W, y: 0.88 * H, w: 360, h: 270 }, { x: 0.5 * W, y: H + 60, w: 420, h: 280, mark: true }, { x: 0.05 * W, y: H + 80, w: 360, h: 220 }, { x: 0.98 * W, y: H + 80, w: 380, h: 230 }]);
          if (ctr) ctr.update(lt, t, cues, sd + 500);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== sl_xray
  SH.sl_xray = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2501, root = el(svg, 'g');
      const S = Sdef(P.statue, { x: 0.58, y: 0.63, s: 0.9 });
      const ped = inkEl(root, mix(INK.paperLight, INK.paperDark, 0.55)), pedD = inkEl(root, mix(INK.inkSoft, INK.ink, 0.3)), pedR = inkEl(root);
      const st = statue(el(root, 'g'), sd + 1);
      const wind = inkEl(root, INK.inkSoft);
      const SEA = P.sea ? Object.assign({ y: 0.78 }, P.sea) : null;
      const seaG = el(root, 'g'), seaF = inkEl(seaG, mix(INK.blue, INK.inkSoft, 0.45)), seaF2 = inkEl(seaG, mix(INK.blue, INK.paperLight, 0.35)), rock = inkEl(seaG, mix(INK.inkSoft, INK.ink, 0.45)), foam = inkEl(seaG, INK.paperLight), seaR = inkEl(seaG);
      const qT = el(root, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 300, 'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 18px; stroke-linejoin: round` });
      const Q = P.q ? Object.assign({ x: 0.26, y: 0.4, at: 'q' }, P.q) : null; qT.textContent = Q ? '?' : '';
      const labs = labels(el(svg, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const x = S.x * W, y = S.y * H, s = S.s;
          // pedestal top filling the frame below the feet
          const Pp = p => [x + p[0] * s * 1.6, y + p[1] * s * 1.6];
          const cap = [[-200, 0], [200, 0], [206, 34], [-206, 34]], shaft = [[-176, 34], [176, 34], [230, 700], [-230, 700]];
          if (P.pedestal !== false) {
            ped.setAttribute('d', [loopS(cap.map(Pp), k + 1, t, 0.8, false), loopS(shaft.map(Pp), k + 2, t, 0.8, false)].join(' '));
            pedD.setAttribute('d', [-110, -30, 50].map((cx, i) => loopS([[cx, 90], [cx + 60, 90], [cx + 60, 230], [cx, 230]].map(Pp), k + 3 + i, t, 0.6, false)).join(' '));
            const PR = [ringS(cap.map(Pp), k + 6, t, 4, 1, false), ringS(shaft.map(Pp), k + 7, t, 4, 1, false)]; [290, 320].forEach((yy, i) => PR.push(lineS([[-200, yy], [200, yy]].map(Pp), k + 8 + i, t, 3)));
            pedR.setAttribute('d', PR.join(' '));
          }
          const o = Object.assign({}, S, { x, y, s: s * (1 + 0.03 * hit), hiAt: S.hi != null ? atOr(cues, S.hi, null) : null });
          st.update(t, o, lt, cues);
          if (P.wind) {
            const wa = atOr(cues, P.wind.at, 0), wp = lt >= wa ? clamp01((lt - wa) * 2) : 0, L = [];
            for (let i = 0; i < 8; i++) { const yy = (0.2 + i * 0.07) * H, u = ((t * 0.9 + i * 0.37) % 1), x0 = lerp(-200, W + 100, u), len = 220 * wp; if (len < 5) continue; const pts = []; for (let j = 0; j <= 6; j++) pts.push([x0 + j * len / 6, yy + Math.sin(j * 0.9 + t * 3 + i) * 10]); L.push(lineS(pts, k + 20 + i, t, 4)); }
            wind.setAttribute('d', L.join(' '));
          }
          if (SEA) {
            const y0 = SEA.y * H, F1 = [], F2 = [], RK = [], FO = [], L = [];
            [0, 1, 2].forEach(i => { const yy = y0 + i * (H - y0) / 3, amp = 26 + i * 16, pts = [[-40, H + 40]]; for (let x = -40; x <= W + 40; x += 30) pts.push([x, yy + Math.sin(x * 0.012 + t * (1.6 + i * 0.4) + i * 2) * amp - Math.max(0, Math.sin(x * 0.006 - t * 1.2 + i)) * amp * 1.2]); pts.push([W + 40, H + 40]); (i % 2 ? F2 : F1).push(loopS(pts, k + 300 + i, t, 1)); L.push(lineS(pts.slice(1, -1), k + 310 + i, t, 4)); });
            [[0.06, 1.0, 230], [0.94, 0.98, 260], [0.75, 1.03, 160]].forEach(([u, v, r], i) => { const cx = u * W, cy = v * H, pts = [[cx - r, cy + 40], [cx - r * 0.8, cy - r * 0.5], [cx - r * 0.2, cy - r * 0.8], [cx + r * 0.5, cy - r * 0.6], [cx + r, cy + 40]]; RK.push(loopS(pts, k + 320 + i, t, 0.8, false)); L.push(ringS(pts, k + 330 + i, t, 5, 0.8, false)); });
            for (let i = 0; i < 18; i++) { const u = ((t * 0.7 + i * 0.13) % 1), sx = (0.05 + (i * 0.29) % 0.9) * W, sy = y0 + 40 - u * 220, rr = 8 + 10 * (1 - u); if (u > 0.05) FO.push(loopS(ell(sx + u * 60, sy, rr, rr, 7), k + 340 + i, t, 0.8)); }
            seaF.setAttribute('d', F1.join(' ')); seaF2.setAttribute('d', F2.join(' ')); rock.setAttribute('d', RK.join(' ')); foam.setAttribute('d', FO.join(' ')); seaR.setAttribute('d', L.join(' '));
          }
          if (Q) { const qa = atOr(cues, Q.at, dur * 0.5), qp = lt >= qa ? spring(lt, qa, 0.6) : 0, b = boil(k + 70, t, 1.5); qT.setAttribute('opacity', clamp01(qp * 3).toFixed(3)); qT.setAttribute('transform', `translate(${f1(Q.x * W + b[0])} ${f1(Q.y * H + b[1])}) rotate(${f1(-8 + Math.sin(t * 2) * 4)}) scale(${(lerp(0.3, 1, qp) * (1 + 0.1 * punch(lt, qa, 0.5))).toFixed(3)})`); qT.setAttribute('y', 100); }
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ================================================================== sl_tower
  SH.sl_tower = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 2601, top = el(svg, 'g'), root = el(top, 'g');
      const S = Sdef(P.statue, { x: 0.27, y: 0.6, s: 0.55, xray: 0 });
      const TW = Object.assign({ x: 0.74, base: 0.62, h: 0.5, at: 'tower' }, P.tower || {});
      const tw = tower(el(root, 'g'), sd + 2);
      const st = statue(el(root, 'g'), sd + 1);
      const link = inkEl(root, INK.gold);
      const rf = roofs(el(root, 'g'), sd + 3, W, H, P.roofs || [{ y: 0.62, s: 0.7 }, { y: 0.72, s: 1.0 }]);
      const kas = P.kasif ? person(root, P.kasif, sd + 8, true) : null;
      const wd = words(el(top, 'g'), P, W, H, sd + 300);
      const labs = labels(el(top, 'g'), P.labels, W, H, sd + 200);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, cue(cues, 'hit', dur * 0.5));
          const ta = atOr(cues, TW.at, dur * 0.3), tp = lt >= ta ? progIO(lt, ta, 1.3) : 0.04;
          tw.update(t, TW.x * W, TW.base * H, TW.h * H * (1 + 0.04 * hit), tp);
          st.update(t, place(S, W, H), lt, cues);
          if (tp > 0.9) {
            const a = [S.x * W + 10, S.y * H - 300 * S.s], b = [TW.x * W - 40, TW.base * H - TW.h * H * 0.4], la = P.link != null ? atOr(cues, P.link, ta + 1.2) : ta + 1.2, u = clamp01((lt - la) / 0.6), D = [];
            for (let i = 0; i < 10; i++) { const a0 = i / 10, a1 = (i + 0.5) / 10; if (a0 > u) break; const mid = v => [lerp(a[0], b[0], v), lerp(a[1], b[1], v) - Math.sin(v * Math.PI) * 120]; D.push(lineS([mid(a0), mid(Math.min(a1, u))], sd + 50 + i, t, 7)); }
            link.setAttribute('d', D.join(' '));
          } else link.setAttribute('d', '');
          rf.update(t);
          if (kas) kas.update(lt, t, cues, W, H);
          wd.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
