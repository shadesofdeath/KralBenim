// wh_whale: shots for the Stickstory Short "The Exploding Whale" (2026-11-06): on 12 November 1970 a dead sperm whale
// (~45 ft, ~8 tons) lay on the beach near Florence, Oregon; the Oregon Highway Division blew it up with half a ton
// (20 cases) of dynamite so seagulls would eat the small pieces. Blubber rained on the spectators, a chunk flattened a
// brand-new car in the parking lot about a quarter mile away, nobody was hurt and most of the whale stayed on the beach;
// the car had come from a dealer whose slogan was "a whale of a deal". Parchment ink style (brand/kit/BRAND.md §3, §5):
// palette tokens only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no
// Math.random. Parametric: any "something big on a beach / blast / falling debris" story. Uses lh__lib.js (LH.kasif,
// LH.label).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = label {text, x, y, at, size, color: ink|red|gold|blue|paper, font: hand|serif, card, rot, underline}
//   gy: ground line 0..1 H; front: top of the foreground sand 0..1 H; whale: [x 0..1, scale, face]
//
// SHOTS.wh_beach — the whale lying on the beach (use the "sea"/"coast" set). P: {mode, gy, front, whale, labels, kasif}
//   "arrive": the whale on the sand, foam washing round it, gulls circling, a local man walks up and stares (cue "hit")
//   "stink":  close on the whale's head: stink lines rise, flies circle; a road-crew worker in a hard hat holds his nose
//             (cue "hit"); a second worker pops up holding a "PLAN" sign at cue "plan"
//   "wait":   wide: the far whale wired up, a crowd on the dune; a worker at the plunger box; Kaşif (K) in front
//   "after":  the whale still lying there with a black hole in its side, smoke wisps, chunks scattered on the sand
//   "end":    Kaşif waves / points (K.seq); the far whale and gulls behind
// SHOTS.wh_crew — dynamite: crates stack up beside the whale one by one (cue "box"), a worker carries one more; gulls
//   swoop in at cue "gulls". P: {gy, front, whale, crates: 8, labels}
// SHOTS.wh_blast — mode "hook": the whale on the beach erupts at cue "hit" into a huge sand-and-blubber plume, chunks
//   fly; mode "rain": blubber chunks rain down from the sky over the spectators on the dune, who run with their arms
//   over their heads (cue "hit": the heavy rain starts). P: {mode, gy, front, whale, labels}
// SHOTS.wh_car — mode "crush": a 1970 parking lot by the dunes; a big chunk arcs in from the left along a dashed track
//   and flattens the roof of the new car at cue "hit" (glass flies, dust); mode "dealer": a car-dealer sign on two posts
//   ("A WHALE OF A DEAL", a smiling whale painted on it) pops up at cue "hit" over a shiny new car under a string of
//   pennants. P: {mode, gy, front, sign, labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const SAND = () => mix(INK.paperLight, INK.gold, 0.32);
  const SAND_M = () => mix(INK.gold, INK.stain, 0.3);
  const SAND_D = () => mix(INK.stain, INK.ink, 0.25);
  const WHALE = () => mix(INK.inkSoft, INK.blue, 0.3);
  const WHALE_D = () => mix(INK.ink, INK.blue, 0.25);
  const WHALE_L = () => mix(INK.inkSoft, INK.paperLight, 0.45);
  const BLUB = () => mix(INK.paperLight, INK.red, 0.28);
  const BLUB_D = () => mix(INK.red, INK.ink, 0.25);
  const SMOKE = () => mix(INK.paperDark, INK.inkSoft, 0.55);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const prof = (W, y, amp, f, ph, step = 40) => { const P = []; for (let x = -60; x <= W + 60; x += step) P.push([x, y - amp * (0.6 * Math.sin(x * f + ph) + 0.4 * Math.sin(x * f * 2.3 + ph * 1.7))]); return P; };

  // ------------------------------------------------------------------ foreground beach (or gravel lot) to the frame bottom
  function sandFront(parent, sd) {
    const fill = inkEl(parent, SAND()), wet = inkEl(parent, mix(SAND(), INK.blue, 0.12)), rip = inkEl(parent, SAND_D()), edge = inkEl(parent);
    const grass = inkEl(parent, mix(INK.green, INK.ink, 0.25)), wood = inkEl(parent, mix(INK.stain, INK.ink, 0.3)), woodR = inkEl(parent), shells = inkEl(parent, INK.paperLight);
    return {
      update(t, W, H, top, o = {}) {
        const u = W / 1080, ph = o.ph ?? sd * 0.37;
        if (o.col) fill.setAttribute('fill', o.col);
        const P1 = prof(W, top, 30 * u, 0.004, ph);
        fill.setAttribute('d', inkLoop(P1.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd, t, amp: 0.8 }));
        wet.setAttribute('d', o.wet === false ? '' : inkLoop(prof(W, top + 26 * u, 10 * u, 0.006, ph + 1).concat([[W + 60, top + 70 * u], [-60, top + 70 * u]]), { seed: sd + 1, t, amp: 0.6 }));
        edge.setAttribute('d', inkPath(P1, { w: 6, seed: sd + 2, t }));
        const R = [];
        for (let i = 0; i < 10; i++) {
          const y = top + 110 * u + i * (H - top - 110 * u) / 10, w = 3.5 + i * 0.35;
          const pts = []; for (let x = -30; x <= W + 30; x += 60) pts.push([x, y + 7 * u * Math.sin(x * 0.014 + i * 1.7 + ph)]);
          if (o.gravel) { for (let j = 0; j < 9; j++) { const x = hn(sd + i, j) * W, yy = y + hn(sd + 40 + i, j) * 40 * u; R.push(inkDot(x, yy, (6 + 6 * hn(sd + 80, i * 9 + j)) * u, (4 + 3 * hn(sd + 90, j)) * u, sd + 100 + i * 9 + j, t)); } }
          else R.push(inkPath(pts, { w, seed: sd + 20 + i, t, amp: 0.8, taper: 0.6 }));
        }
        rip.setAttribute('d', R.join(' '));
        // dune grass tufts swaying at the sides
        const G = [];
        (o.grass ?? [0.06, 0.94]).forEach((q, i) => {
          const x = q * W, y = top + (180 + i * 70) * u;
          for (let j = 0; j < 9; j++) { const a = -Math.PI / 2 + (j - 4) * 0.2, sw = Math.sin(t * 1.6 + i + j * 0.4) * 10 * u, L = (160 + 60 * hn(sd + 7, j + i * 9)) * u;
            G.push(inkPath([[x + (j - 4) * 6 * u, y], [x + Math.cos(a) * L * 0.5 + sw * 0.4, y + Math.sin(a) * L * 0.55], [x + Math.cos(a) * L + sw, y + Math.sin(a) * L]], { w: 6, seed: sd + 50 + i * 10 + j, t, taper: 0.85 })); }
        });
        grass.setAttribute('d', G.join(' '));
        if (o.log !== false) {   // driftwood log across the near sand
          const lx = (o.log ?? 0.62) * W, ly = top + 330 * u, L = [[lx - 260 * u, ly + 10 * u], [lx - 230 * u, ly - 36 * u], [lx + 230 * u, ly - 50 * u], [lx + 262 * u, ly - 8 * u], [lx + 220 * u, ly + 24 * u], [lx - 220 * u, ly + 34 * u]];
          wood.setAttribute('d', inkLoop(L, { seed: sd + 70, t, amp: 0.8 }));
          woodR.setAttribute('d', inkPath(L, { w: 5, seed: sd + 71, t, closed: true }) + ' ' + [0, 1, 2].map(k => inkPath([[lx - 180 * u + k * 130 * u, ly - 14 * u], [lx - 80 * u + k * 130 * u, ly - 20 * u]], { w: 3, seed: sd + 72 + k, t })).join(' ') +
            ' ' + inkCircle(lx + 236 * u, ly - 12 * u, 22 * u, sd + 76, t, { w: 3 }));
        } else blank(wood, woodR);
        const S = [];
        if (!o.gravel) for (let i = 0; i < 7; i++) { const x = hn(sd + 3, i) * W, y = top + 200 * u + hn(sd + 4, i) * (H - top - 300 * u); S.push(inkDot(x, y, 12 * u, 8 * u, sd + 80 + i, t)); }
        shells.setAttribute('d', S.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ the sperm whale lying on the sand (side view)
  // local units: length ~1150 (tail at -620, blunt head at +530), ground y = 0, height ~ 270
  const WB = [[-600, -38], [-470, -70], [-300, -132], [-100, -190], [120, -238], [300, -262], [460, -262], [520, -238], [540, -170], [530, -70], [500, -18], [380, 0], [-120, 0], [-470, -6]];
  function whale(parent, sd) {
    const body = inkEl(parent, WHALE()), belly = inkEl(parent, WHALE_L()), shade = inkEl(parent, WHALE_D()), hole = inkEl(parent, INK.ink), holeR = inkEl(parent, BLUB_D()), lines = inkEl(parent), eye = inkEl(parent, INK.ink), fluke = inkEl(parent, WHALE_D()), shadow = inkEl(parent, SAND_D());
    return {
      update(t, x, gy, s, o = {}) {
        const f = o.face ?? 1, sq = 1 + 0.012 * Math.sin(t * 1.3 + sd) + (o.bulge ?? 0) * 0.08;
        const T = q => [x + q[0] * s * f, gy + q[1] * s * sq];
        shadow.setAttribute('d', inkLoop(inkEllipsePts(x, gy + 6 * s, 620 * s, 30 * s, sd, 14, 0, 0.05), { seed: sd, t, amp: 0.6 }));
        fluke.setAttribute('d', inkLoop([[-560, -40], [-660, -150], [-720, -168], [-690, -110], [-640, -40], [-700, 20], [-730, 30], [-660, 18], [-580, -4]].map(T), { seed: sd + 1, t, amp: 0.8 }));
        body.setAttribute('d', inkLoop(WB.map(T), { seed: sd + 2, t, amp: 0.8 }));
        belly.setAttribute('d', inkLoop([[-420, -14], [-100, -40], [200, -50], [480, -40], [500, -16], [380, -2], [-120, -2]].map(T), { seed: sd + 3, t, amp: 0.6 }));
        shade.setAttribute('d', inkLoop([[-460, -64], [-290, -126], [-90, -184], [120, -230], [300, -254], [300, -222], [110, -200], [-80, -152], [-280, -100]].map(T), { seed: sd + 4, t, amp: 0.6 }));
        if (o.hole) {   // a blast hole in the side
          const hp = inkEllipsePts(...T([-40, -110]), 150 * s * o.hole, 78 * s * o.hole, sd + 5, 12, 0.1, 0.18);
          hole.setAttribute('d', inkLoop(hp, { seed: sd + 5, t, amp: 0.8 }));
          holeR.setAttribute('d', inkPath(hp, { w: 9 * s + 3, seed: sd + 6, t, closed: true }));
        } else blank(hole, holeR);
        const Lns = [inkPath(WB.map(T), { w: 6, seed: sd + 7, t, closed: true }),
          inkPath([[500, -46], [340, -40], [190, -44]].map(T), { w: 4.5, seed: sd + 8, t }),            // the narrow lower jaw
          inkPath([[150, -60], [80, -6], [30, 20], [110, -20]].map(T), { w: 5, seed: sd + 9, t, closed: true }),   // flipper
          inkPath([[-560, -40], [-660, -150], [-720, -168], [-690, -110], [-640, -40], [-700, 20], [-730, 30], [-660, 18], [-580, -4]].map(T), { w: 5, seed: sd + 10, t, closed: true })];
        for (let i = 0; i < 9; i++) { const xx = -380 + i * 80, top = -70 - (xx + 470) * 0.19; Lns.push(inkPath([[xx, top + 26], [xx + 12, top + 60]].map(T), { w: 3, seed: sd + 20 + i, t })); }   // wrinkles
        Lns.push(inkPath([[-440, -40], [-200, -64], [60, -80]].map(T), { w: 3, seed: sd + 40, t }));
        lines.setAttribute('d', Lns.join(' '));
        eye.setAttribute('d', inkPath([T([228, -92]), T([256, -86])], { w: 6 * s + 2, seed: sd + 41, t }));
        return { top: T([380, -262]), head: T([480, -160]), mid: T([-40, -120]), blow: T([500, -262]) };
      },
    };
  }

  // ------------------------------------------------------------------ a gull (flapping M)
  function gulls(parent, sd) {
    const e = inkEl(parent), bod = inkEl(parent, INK.paperLight);
    return {
      update(t, list) {   // list: [[x, y, s, ph]]
        const P = [], B = [];
        list.forEach(([x, y, s, ph], i) => {
          const fl = Math.sin(t * 7 + ph) * 26 * s;
          P.push(inkPath([[x - 70 * s, y - 6 * s - fl], [x - 34 * s, y - 24 * s - fl * 0.4], [x, y], [x + 34 * s, y - 24 * s - fl * 0.4], [x + 70 * s, y - 6 * s - fl]], { w: 6 * Math.max(0.6, s), seed: sd + i, t, taper: 0.3 }));
          B.push(inkDot(x, y + 4 * s, 13 * s, 8 * s, sd + 40 + i, t));
        });
        e.setAttribute('d', P.join(' ')); bod.setAttribute('d', B.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ a hatless person (optional yellow hard hat / coat)
  function person(parent, sd, o = {}) {
    const g = el(parent, 'g'), sc = o.scale ?? 1;
    const vest = inkEl(g, o.vest || mix(INK.red, INK.gold, 0.45)), vestR = inkEl(g);
    const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: false, accessory: null, beard: o.beard ?? null, seed: sd });
    const hat = inkEl(g, mix(INK.gold, INK.paperLight, 0.15)), hatR = inkEl(g), peg = inkEl(g, mix(INK.stain, INK.paperLight, 0.35)), pegR = inkEl(g);
    return {
      g,
      update(t, pose, op, ex = {}) {
        const r = rig.update(t, pose, op), f = op.face ?? 1, Wp = q => [op.x + f * sc * q[0], op.y + sc * q[1]];
        const hip = Wp(r.hip), hd = Wp(r.head), sh = [lerp(hip[0], hd[0], 0.72), lerp(hip[1], hd[1], 0.72)];
        if (o.vest !== false) {
          const V = [[sh[0] - 32 * sc, sh[1] - 4 * sc], [sh[0] + 32 * sc, sh[1] - 4 * sc], [hip[0] + 36 * sc, hip[1] - 4 * sc], [hip[0] - 36 * sc, hip[1] - 4 * sc]];
          vest.setAttribute('d', inkLoop(V, { seed: sd + 1, t, amp: 0.7 }));
          vestR.setAttribute('d', inkPath(V, { w: 4, seed: sd + 2, t, closed: true }) + (o.hard ? ' ' + inkPath([[lerp(sh[0], hip[0], 0.45) - 34 * sc, lerp(sh[1], hip[1], 0.45)], [lerp(sh[0], hip[0], 0.45) + 34 * sc, lerp(sh[1], hip[1], 0.45)]], { w: 7 * sc + 1, seed: sd + 3, t }) : ''));
        } else blank(vest, vestR);
        if (o.hard) {
          const H = [[-84, -16], [-80, -66], [-50, -108], [0, -120], [50, -108], [80, -66], [84, -16]].map(q => Wp([r.head[0] + q[0], r.head[1] + q[1] - 20]));
          const Br = [[-120, -16], [120, -16], [116, 0], [-116, 0]].map(q => Wp([r.head[0] + q[0], r.head[1] + q[1] - 20]));
          hat.setAttribute('d', inkLoop(H, { seed: sd + 4, t, amp: 0.6 }) + ' ' + inkLoop(Br, { seed: sd + 5, t, amp: 0.5, smooth: false }));
          hatR.setAttribute('d', inkPath(H, { w: 4.5, seed: sd + 6, t, closed: true }) + ' ' + inkPath(Br, { w: 4, seed: sd + 7, t, closed: true, smooth: false }) + ' ' + inkPath([[0, -118], [0, -40]].map(q => Wp([r.head[0] + q[0], r.head[1] + q[1] - 20])), { w: 4, seed: sd + 8, t }));
        } else blank(hat, hatR);
        if (ex.peg) {   // a clothes-peg pinching the nose
          const nx = hd[0] + f * 74 * sc, ny = hd[1] + 6 * sc, R = (q, a) => [nx + f * (q[0] * Math.cos(a) - q[1] * Math.sin(a)), ny + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
          const A = [[-8, -64], [10, -64], [10, 40], [-8, 40]].map(q => R(q.map(v => v * sc), -0.35)), B = [[-8, -64], [10, -64], [10, 40], [-8, 40]].map(q => R(q.map(v => v * sc), 0.35));
          peg.setAttribute('d', inkLoop(A, { seed: sd + 9, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(B, { seed: sd + 10, t, amp: 0.4, smooth: false }));
          pegR.setAttribute('d', inkPath(A, { w: 3.5, seed: sd + 11, t, closed: true, smooth: false }) + ' ' + inkPath(B, { w: 3.5, seed: sd + 12, t, closed: true, smooth: false }) + ' ' + inkCircle(nx, ny - 4 * sc, 9 * sc, sd + 13, t, { w: 3 }));
        } else blank(peg, pegR);
        r.headW = hd; r.hipW = hip; r.Wp = Wp;
        return r;
      },
    };
  }

  // ------------------------------------------------------------------ blast plume + flying chunks
  function plume(parent, sd) {
    const back = inkEl(parent, SMOKE()), mid = inkEl(parent, mix(SAND_M(), INK.paperDark, 0.3)), front = inkEl(parent, mix(SAND(), INK.paperLight, 0.1)), rim = inkEl(parent), core = inkEl(parent, BLUB());
    return {
      update(t, x, gy, k, s, fade = 0) {
        if (k <= 0.001 || fade >= 1) { blank(back, mid, front, rim, core); return; }
        const B = [], M = [], F = [], R = [], C = [], hgt = 1000 * s * Math.pow(k, 0.6), wid = 340 * s * (0.4 + 0.8 * k);
        for (let i = 0; i < 9; i++) {
          const q = i / 8, cy = gy - hgt * q - 40 * s, cx = x + Math.sin(i * 1.7 + t * 0.8) * 40 * s * q, r = wid * (0.55 + 0.8 * q) * (1 - fade * 0.3) * (1 + 0.04 * Math.sin(t * 3 + i));
          B.push(inkLoop(inkEllipsePts(cx + 40 * s, cy - 20 * s, r * 1.15, r * 0.8, sd + i, 12, 0, 0.14), { seed: sd + i, t, amp: 1.2 }));
          M.push(inkLoop(inkEllipsePts(cx - 20 * s, cy, r * 0.95, r * 0.7, sd + 20 + i, 12, 0, 0.14), { seed: sd + 20 + i, t, amp: 1.2 }));
          if (i % 2 === 0) F.push(inkLoop(inkEllipsePts(cx - 50 * s, cy + 20 * s, r * 0.6, r * 0.45, sd + 40 + i, 10, 0, 0.14), { seed: sd + 40 + i, t, amp: 1.2 }));
          R.push(inkPath(inkEllipsePts(cx - 20 * s, cy, r * 0.95, r * 0.7, sd + 20 + i, 12, 0, 0.14).slice(1, 7), { w: 4, seed: sd + 60 + i, t }));
          if (i < 4 && fade < 0.5) C.push(inkLoop(inkEllipsePts(cx, cy + 30 * s, r * 0.32, r * 0.22, sd + 80 + i, 9, 0, 0.2), { seed: sd + 80 + i, t, amp: 1 }));
        }
        back.setAttribute('d', B.join(' ')); mid.setAttribute('d', M.join(' ')); front.setAttribute('d', F.join(' ')); rim.setAttribute('d', R.join(' ')); core.setAttribute('d', C.join(' '));
      },
    };
  }
  // chunks: n blubber lumps on ballistic arcs from (x0, y0); dt = seconds since the blast
  function chunks(parent, sd) {
    const fill = inkEl(parent, BLUB()), rim = inkEl(parent), dk = inkEl(parent, BLUB_D());
    return {
      update(t, x0, y0, dt, s, n = 14, o = {}) {
        const Fi = [], Ri = [], Dk = [];
        if (dt > 0) for (let i = 0; i < n; i++) {
          const a = -Math.PI / 2 + (hn(sd, i) - 0.5) * (o.spread ?? 2.2), v = (900 + 900 * hn(sd + 1, i)) * s, g = 900 * s, tt = dt * (0.9 + 0.3 * hn(sd + 2, i));
          const x = x0 + Math.cos(a) * v * tt, y = y0 + Math.sin(a) * v * tt + 0.5 * g * tt * tt;
          if (y > y0 + 40 * s || y < -400) continue;
          const r = (24 + 46 * hn(sd + 3, i)) * s, rot = t * (2 + hn(sd + 4, i) * 3) + i;
          const P = inkEllipsePts(x, y, r * 1.3, r, sd + 10 + i, 9, rot, 0.25);
          Fi.push(inkLoop(P, { seed: sd + 10 + i, t, amp: 0.8 })); Ri.push(inkPath(P, { w: 4, seed: sd + 40 + i, t, closed: true }));
          Dk.push(inkDot(x + r * 0.3, y + r * 0.2, r * 0.45, r * 0.3, sd + 70 + i, t));
        }
        fill.setAttribute('d', Fi.join(' ')); rim.setAttribute('d', Ri.join(' ')); dk.setAttribute('d', Dk.join(' '));
      },
    };
  }
  // raining chunks: lumps falling from the top of the frame, looping
  function rain(parent, sd) {
    const fill = inkEl(parent, BLUB()), rim = inkEl(parent), dk = inkEl(parent, BLUB_D()), trail = inkEl(parent, SMOKE());
    return {
      update(t, W, H, k, u, yEnd) {
        const Fi = [], Ri = [], Dk = [], Tr = [], n = Math.round(22 * k);
        for (let i = 0; i < n; i++) {
          const sp = 0.55 + 0.35 * hn(sd, i), ph = (t * sp + hn(sd + 1, i)) % 1, x = (0.3 + 0.68 * hn(sd + 2, i)) * W + Math.sin(t + i) * 20 * u, y = lerp(-120 * u, yEnd, ph);
          const r = (18 + 40 * hn(sd + 3, i)) * u, P = inkEllipsePts(x, y, r * 1.3, r, sd + 10 + i, 9, t * 2 + i, 0.25);
          Fi.push(inkLoop(P, { seed: sd + 10 + i, t, amp: 0.8 })); Ri.push(inkPath(P, { w: 4, seed: sd + 40 + i, t, closed: true }));
          Dk.push(inkDot(x + r * 0.3, y + r * 0.2, r * 0.45, r * 0.3, sd + 70 + i, t));
          Tr.push(inkPath([[x - 4 * u, y - r * 1.2], [x - 10 * u, y - r * 3.4]], { w: 4, seed: sd + 100 + i, t, taper: 0.8 }));
        }
        fill.setAttribute('d', Fi.join(' ')); rim.setAttribute('d', Ri.join(' ')); dk.setAttribute('d', Dk.join(' ')); trail.setAttribute('d', Tr.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ a 1970 sedan, side view (crush 0..1 flattens the roof)
  function car(parent, sd, col) {
    const body = inkEl(parent, col || mix(INK.blue, INK.paperLight, 0.25)), glass = inkEl(parent, mix(INK.blue, INK.paperLight, 0.6)), chrome = inkEl(parent, INK.paperLight), tyres = inkEl(parent, INK.ink), hubs = inkEl(parent, INK.paperDark), lines = inkEl(parent), shard = inkEl(parent, mix(INK.blue, INK.paperLight, 0.7));
    return {
      update(t, x, gy, s, crush = 0, o = {}) {
        const T = q => [x + q[0] * s, gy + q[1] * s];
        const rf = lerp(0, 92, crush), sh = o.shine ? 0.5 + 0.5 * Math.sin(t * 3) : 0;
        const lower = [[-330, -60], [-320, -128], [-180, -142], [210, -142], [330, -120], [338, -64], [300, -46], [-300, -46]];
        const cab = [[-190, -142], [-120, -232 + rf], [120, -232 + rf], [190, -142]];
        body.setAttribute('d', inkLoop(lower.map(T), { seed: sd, t, amp: 0.6, smooth: false }) + ' ' + inkLoop(cab.map(T), { seed: sd + 1, t, amp: 0.6, smooth: false }));
        const w1 = [[-160, -148], [-108, -220 + rf * 0.95], [-8, -220 + rf * 0.95], [-8, -148]], w2 = [[8, -148], [8, -220 + rf * 0.95], [108, -220 + rf * 0.95], [160, -148]];
        glass.setAttribute('d', crush > 0.5 ? '' : inkLoop(w1.map(T), { seed: sd + 2, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(w2.map(T), { seed: sd + 3, t, amp: 0.5, smooth: false }));
        chrome.setAttribute('d', inkPath([[-334, -80], [342, -80]].map(T), { w: 9 * s + 2, seed: sd + 4, t }) + (sh ? ' ' + inkPath([[-60 + sh * 120, -128], [-20 + sh * 120, -138]].map(T), { w: 6, seed: sd + 5, t }) : ''));
        const wh = [[-205, -46], [205, -46]];
        tyres.setAttribute('d', wh.map((q, i) => inkCircle(...T(q), 58 * s, sd + 6 + i, t, { fill: true })).join(' '));
        hubs.setAttribute('d', wh.map((q, i) => inkCircle(...T(q), 26 * s, sd + 8 + i, t, { fill: true })).join(' '));
        const L = [inkPath(lower.map(T), { w: 5, seed: sd + 10, t, closed: true, smooth: false }), inkPath(cab.map(T), { w: 5, seed: sd + 11, t, closed: true, smooth: false }),
          inkPath([[0, -142], [0, -230 + rf]].map(T), { w: 4, seed: sd + 12, t }), inkPath([[-60, -112], [-30, -112]].map(T), { w: 4, seed: sd + 13, t }), inkPath([[90, -112], [120, -112]].map(T), { w: 4, seed: sd + 14, t }),
          inkPath([[328, -118], [338, -98]].map(T), { w: 8, seed: sd + 15, t })];
        if (crush > 0.5) { L.push(inkPath([[-150, -150], [-90, -176], [-40, -148], [30, -178], [90, -150], [150, -170]].map(T), { w: 4, seed: sd + 16, t, smooth: false })); }
        lines.setAttribute('d', L.join(' '));
        const S = [];
        if (o.shards) for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (hn(sd + 20, i) - 0.5) * 2.6, d = o.shards * (160 + 160 * hn(sd + 21, i)), y0 = -180 + rf; const p = [Math.cos(a) * d, y0 + Math.sin(a) * d + o.shards * o.shards * 300];
          if (o.shards < 1) S.push(inkLoop([[p[0] - 10, p[1]], [p[0] + 8, p[1] - 12], [p[0] + 12, p[1] + 6]].map(T), { seed: sd + 30 + i, t, amp: 0.4, smooth: false })); }
        shard.setAttribute('d', S.join(' '));
        return { roof: T([0, -232 + rf]) };
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.wh_beach
  SH.wh_beach = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 131, u = W / 1080, mode = P.mode || 'arrive';
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.69) * H;
      const root = el(svg, 'g');
      const Wd = Object.assign(mode === 'stink' ? [0.26, 1.15, 1] : mode === 'wait' ? [0.78, 0.36, 1] : mode === 'end' ? [0.74, 0.42, 1] : [0.5, 0.78, 1], P.whale || {});
      const foam = inkEl(root, INK.paperLight), foamR = inkEl(root, mix(INK.blue, INK.paperLight, 0.3));
      const crowd = P.crowd ? Array.from({ length: 7 }, (_, i) => person(el(root, 'g'), sd + 300 + i * 20, { scale: (0.26 + 0.03 * (i % 3)) * u, vest: i % 2 ? mix(INK.blue, INK.ink, 0.2) : mix(INK.green, INK.ink, 0.25), beard: i === 3 ? 'short' : null })) : [];
      const dune = inkEl(root, mix(SAND(), INK.paperDark, 0.3)), duneR = inkEl(root);
      const wire = inkEl(root, INK.red), box = inkEl(root, mix(INK.stain, INK.ink, 0.2)), boxR = inkEl(root);
      const wh = whale(el(root, 'g'), sd + 10);
      const smoke = inkEl(root, SMOKE()), stink = inkEl(root, mix(INK.green, INK.paperLight, 0.25)), flies = inkEl(root, INK.ink);
      const bits = inkEl(root, BLUB()), bitsR = inkEl(root);
      const gl = gulls(el(root, 'g'), sd + 60);
      const local = mode === 'arrive' ? person(el(root, 'g'), sd + 100, { scale: (P.manScale ?? 0.62) * u, vest: mix(INK.stain, INK.ink, 0.2), beard: 'short' }) : null;
      const w1 = mode === 'stink' || mode === 'wait' ? person(el(root, 'g'), sd + 120, { scale: (mode === 'stink' ? 1.05 : 0.5) * u, hard: true }) : null;
      const w2 = mode === 'stink' ? person(el(root, 'g'), sd + 140, { scale: 0.95 * u, hard: true, beard: 'black' }) : null;
      const K = Object.assign({ x: 0.3, y: P.gy ?? 0.6, scale: 1.05, pose: 'wave', face: 'right', emotion: 'happy' }, P.kasif || {});
      const kas = P.kasif ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const front = sandFront(el(root, 'g'), sd + 990);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.45);
          const wx = Wd[0] * W, ws = Wd[1] * u * (mode === 'arrive' ? lerp(0.96, 1, spring(lt, 0, 0.8)) : 1);
          // foam washing round the whale
          const fl = 0.5 + 0.5 * Math.sin(t * 1.4), FP = [];
          for (let i = 0; i < 3; i++) { const yy = gy - (30 - i * 18) * u + fl * 20 * u; const pts = []; for (let x = -40; x <= W + 40; x += 50) pts.push([x, yy + 8 * u * Math.sin(x * 0.02 + t * 2 + i)]); FP.push(inkPath(pts, { w: 5 - i, seed: sd + 70 + i, t, taper: 0.4 })); }
          foam.setAttribute('d', mode === 'stink' ? '' : FP.join(' '));
          foamR.setAttribute('d', '');
          if (P.crowd) {   // a dune ridge on the left with the crowd on it
            const DP = [[-60, gy + 40 * u], [-60, gy - 150 * u], [0.18 * W, gy - 200 * u], [0.4 * W, gy - 150 * u], [0.5 * W, gy - 40 * u], [0.55 * W, gy + 40 * u]];
            dune.setAttribute('d', inkLoop(DP, { seed: sd + 80, t, amp: 0.8 })); duneR.setAttribute('d', inkPath(DP.slice(1, 5), { w: 5, seed: sd + 81, t }));
          } else blank(dune, duneR);
          const wr = wh.update(t, wx, gy + (mode === 'wait' || mode === 'end' ? -60 * u : mode === 'after' ? -50 * u : 0), ws, { face: Wd[2], hole: mode === 'after' || mode === 'end' ? 1 : 0, bulge: mode === 'stink' ? 0.5 + 0.5 * Math.sin(t * 1.1) : 0 });
          // gulls circling (not in stink close-up)
          const GL = [];
          if (mode !== 'stink') for (let i = 0; i < (mode === 'arrive' ? 5 : 3); i++) { const a = t * (0.5 + 0.08 * i) + i * 1.3, rr = (180 + 50 * i) * u; GL.push([wr.top[0] + Math.cos(a) * rr, (0.3 + 0.04 * i) * H + Math.sin(a) * rr * 0.25, (0.55 + 0.1 * (i % 2)) * u, i]); }
          gl.update(t, GL);
          // stink + flies
          if (mode === 'stink' || mode === 'arrive') {
            const S = [], Fl = [], k = mode === 'stink' ? 1 + 0.4 * punch(lt, hit) : 0.6;
            for (let i = 0; i < (mode === 'stink' ? 6 : 3); i++) {
              const ph = (t * 0.35 + hn(sd + 5, i)) % 1, x = lerp(mode === 'stink' ? wr.head[0] - 260 * u : wr.mid[0], wr.head[0] + 60 * u, hn(sd + 6, i)), y = wr.top[1] - 10 * u - ph * (mode === 'stink' ? 520 : 360) * u * k, pts = [];
              for (let j = 0; j <= 9; j++) pts.push([x + Math.sin(j * 1.1 + t * 3 + i) * 26 * u * k, y - j * 30 * u * k]);
              if (ph > 0.05 && ph < 0.9) S.push(inkPath(pts, { w: (mode === 'stink' ? 13 : 7) * Math.sin(ph * Math.PI) * k + 2, seed: sd + 200 + i, t, taper: 0.7 }));
            }
            if (mode === 'stink') for (let i = 0; i < 9; i++) { const a = t * (2.5 + hn(sd + 7, i)) + i, r = (60 + 120 * hn(sd + 8, i)) * u; Fl.push(inkDot(wr.head[0] - 60 * u + Math.cos(a) * r, wr.top[1] - 120 * u + Math.sin(a * 1.3) * r * 0.5, 11 * u, 8 * u, sd + 220 + i, t)); }
            stink.setAttribute('d', S.join(' ')); flies.setAttribute('d', Fl.join(' '));
          } else blank(stink, flies);
          // after: smoke wisps from the hole + chunks on the sand
          if (mode === 'after' || mode === 'end') {
            const S = [], Bt = [], Br = [];
            for (let i = 0; i < 4; i++) { const ph = (t * 0.25 + i * 0.25) % 1, x = wr.mid[0] + (i - 1.5) * 30 * u * ws / u, y = wr.mid[1] - ph * 420 * ws; S.push(inkLoop(inkEllipsePts(x + Math.sin(t + i) * 30 * u, y, (40 + 80 * ph) * ws, (30 + 50 * ph) * ws, sd + 240 + i, 10, 0, 0.15), { seed: sd + 240 + i, t, amp: 1 })); }
            if (mode === 'after') for (let i = 0; i < 9; i++) { const x = hn(sd + 9, i) * W, y = fy + (60 + 200 * hn(sd + 10, i)) * u, r = (16 + 26 * hn(sd + 11, i)) * u, P2 = inkEllipsePts(x, y, r * 1.4, r * 0.8, sd + 260 + i, 9, 0, 0.25); Bt.push(inkLoop(P2, { seed: sd + 260 + i, t, amp: 0.8 })); Br.push(inkPath(P2, { w: 3.5, seed: sd + 280 + i, t, closed: true })); }
            smoke.setAttribute('d', S.join(' ')); bits.setAttribute('d', Bt.join(' ')); bitsR.setAttribute('d', Br.join(' '));
          } else blank(smoke, bits, bitsR);
          if (mode === 'wait') {   // wires from the whale to the plunger box on the dune; the crowd waits on the ridge
            const bx = (P.box ?? 0.44) * W, by = gy - 60 * u;
            wire.setAttribute('d', inkPath([[wr.mid[0], wr.mid[1] + 100 * u], [lerp(wr.mid[0], bx, 0.5), by + 30 * u], [bx, by - 30 * u]], { w: 4, seed: sd + 300, t }));
            const B = [[bx - 44 * u, by - 70 * u], [bx + 44 * u, by - 70 * u], [bx + 44 * u, by - 10 * u], [bx - 44 * u, by - 10 * u]];
            box.setAttribute('d', inkLoop(B, { seed: sd + 301, t, amp: 0.5, smooth: false }));
            const pl = punch(lt, hit) > 0 || lt > hit ? 26 : 0;
            boxR.setAttribute('d', inkPath(B, { w: 4, seed: sd + 302, t, closed: true, smooth: false }) + ' ' + inkPath([[bx, by - 70 * u], [bx, by - (130 - pl) * u]], { w: 6, seed: sd + 303, t }) + ' ' + inkPath([[bx - 34 * u, by - (130 - pl) * u], [bx + 34 * u, by - (130 - pl) * u]], { w: 9, seed: sd + 304, t }));
            w1.update(t, 'point', { x: bx + 90 * u, y: by + 40 * u, face: -1, dir: -38, since: 1 });
            crowd.forEach((c, i) => { const x = (0.03 + i * 0.055) * W, y = gy - (150 + 40 * Math.sin((x / W) * 9)) * u + (i % 2) * 20 * u; c.update(t, i % 3 === 1 ? 'point' : 'idle', { x, y, face: 1, dir: 20, since: 1 + i * 0.3, emotion: lt > hit ? 'surprised' : null }); });
          } else blank(wire, box, boxR);
          if (mode === 'arrive') {
            const mx = lerp(0.1, 0.2, progIO(lt, 0, dur * 0.7)) * W;
            local.update(t, lt < hit ? 'walk' : 'shock', { x: mx, y: gy + 60 * u, face: 1, ph: lt * 0.6, since: Math.max(0, lt - hit), emotion: lt < hit ? null : 'surprised' });
          }
          if (mode === 'stink') {
            const plan = atOr(cues, 'plan', dur * 0.65);
            if (lt < plan || P.w2) w1.update(t, 'think', { x: (P.w1 ?? 0.7) * W, y: gy + 70 * u, face: -1, since: 1, emotion: lt > hit ? 'worried' : null }, { peg: lt > hit });
            else w1.update(t, 'hold', { x: (P.w1 ?? 0.7) * W, y: gy + 70 * u, face: -1, since: lt - plan, text: P.sign || 'PLAN', emotion: 'happy', prev: { pose: 'think', since: 1 }, mix: clamp01((lt - plan) / 0.3) }, { peg: true });
            const k = spring(lt, plan, 0.5);
            if (P.w2 && lt >= plan) { w2.g.setAttribute('transform', ''); w2.update(t, 'hold', { x: lerp(1.15, P.w2, k) * W, y: gy + 70 * u, face: -1, since: lt - plan, text: P.sign || 'PLAN', emotion: 'happy' }); } else w2.g.setAttribute('transform', 'translate(9999 0)');
          }
          if (kas) kas.update(lt, t, cues);
          front.update(t, W, H, fy, { log: mode === 'stink' ? 0.3 : P.log, grass: mode === 'end' ? [0.9] : undefined });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.wh_crew
  SH.wh_crew = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 431, u = W / 1080;
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.69) * H;
      const root = el(svg, 'g');
      const Wd = Object.assign([0.95, 0.9, -1], P.whale || {});
      const wh = whale(el(root, 'g'), sd + 10);
      const crateF = inkEl(root, mix(INK.stain, INK.paperLight, 0.25)), crateR = inkEl(root), tx = el(root, 'g');
      const n = P.crates ?? 6, word = (P.word || 'DYNAMITE').toLocaleUpperCase('en-US');
      const texts = Array.from({ length: n + 1 }, () => { const e = el(tx, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 23 * u, 'text-anchor': 'middle', fill: INK.red }); e.textContent = word; return e; });
      const wk = person(el(root, 'g'), sd + 100, { scale: 0.85 * u, hard: true });
      const gl = gulls(el(root, 'g'), sd + 60);
      const front = sandFront(el(root, 'g'), sd + 990);
      const LB = labels(root, P.labels, W, H);
      const crate = (x, y, w, h, i, t, rot = 0) => {
        const c = Math.cos(rot), s = Math.sin(rot), R = q => [x + q[0] * c - q[1] * s, y + q[0] * s + q[1] * c];
        const B = [[-w / 2, -h], [w / 2, -h], [w / 2, 0], [-w / 2, 0]].map(R);
        return { f: inkLoop(B, { seed: sd + 200 + i, t, amp: 0.5, smooth: false }), r: inkPath(B, { w: 4.5, seed: sd + 230 + i, t, closed: true, smooth: false }) + ' ' + inkPath([[-w / 2, -h * 0.82], [w / 2, -h * 0.82]].map(R), { w: 3, seed: sd + 260 + i, t }) + ' ' + inkPath([[-w / 2, -h * 0.18], [w / 2, -h * 0.18]].map(R), { w: 3, seed: sd + 290 + i, t }), c: R([0, -h * 0.4]), rot };
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, bx = atOr(cues, 'box', 0.2), gT = atOr(cues, 'gulls', dur * 0.6), hit = atOr(cues, 'hit', dur * 0.4);
          const wr = wh.update(t, Wd[0] * W, gy, Wd[1] * u, { face: Wd[2] });
          const cw = 150 * u, ch = 96 * u, F = [], R = [], pos = [];
          // pyramid of crates against the whale's side
          for (let i = 0; i < n; i++) { const row = i < 3 ? 0 : i < 5 ? 1 : 2, col = i < 3 ? i : i < 5 ? i - 3 : 0; pos.push([(P.cx ?? 0.36) * W + col * (cw + 8 * u) + row * cw * 0.55, gy + 30 * u - row * (ch + 4 * u)]); }
          let shown = 0;
          pos.forEach((p, i) => {
            const a = bx + i * Math.max(0.12, (dur * 0.55) / n), k = spring(lt, a, 0.45);
            if (lt < a) { texts[i].setAttribute('x', -999); return; }
            shown++;
            const y = p[1] - (1 - k) * 200 * u, cr = crate(p[0], y, cw, ch, i, t, (1 - k) * 0.3);
            F.push(cr.f); R.push(cr.r);
            texts[i].setAttribute('x', f1(cr.c[0])); texts[i].setAttribute('y', f1(cr.c[1] + 10 * u)); texts[i].setAttribute('transform', '');
          });
          // the worker carries one more crate in from the left
          const wx = lerp(-0.05, 0.12, progIO(lt, 0, dur * 0.9)) * W;
          const r = wk.update(t, 'walk', { x: wx, y: gy + 90 * u, face: 1, since: 1, ph: lt * 0.6 });
          const cc = crate(r.headW[0] + 40 * u, r.headW[1] - 70 * u + Math.sin(lt * 0.6 * Math.PI * 2) * 4 * u, cw * 0.9, ch * 0.9, n, t, 0.08 + Math.sin(t * 2) * 0.04);
          F.push(cc.f); R.push(cc.r);
          texts[n].setAttribute('x', f1(cc.c[0])); texts[n].setAttribute('y', f1(cc.c[1] + 10 * u));
          crateF.setAttribute('d', F.join(' ')); crateR.setAttribute('d', R.join(' '));
          void shown; void hit;
          // gulls: few and high at first, then they swoop in low over the whale
          const GL = [], sw = progIO(lt, gT, 1.2);
          for (let i = 0; i < 6; i++) { const a = t * (0.6 + 0.07 * i) + i * 1.1; GL.push([lerp(0.5 * W + Math.cos(a) * 380 * u, wr.top[0] - 120 * u + Math.cos(a) * 200 * u, sw), lerp(0.2 * H + i * 30 * u, wr.top[1] - (90 + 40 * (i % 3)) * u, sw) + Math.sin(a) * 30 * u, (0.6 + 0.15 * (i % 2)) * u, i]); }
          gl.update(t, GL);
          front.update(t, W, H, fy, { log: 0.7 });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.wh_blast
  SH.wh_blast = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 631, u = W / 1080, mode = P.mode || 'hook';
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.69) * H;
      const root = el(svg, 'g');
      const Wd = Object.assign(mode === 'hook' ? [0.5, 0.78, 1] : [0.7, 0.36, 1], P.whale || {});
      const pl = plume(el(root, 'g'), sd + 20);
      const wh = whale(el(root, 'g'), sd + 10);
      const ch = chunks(el(root, 'g'), sd + 40);
      const dune = inkEl(root, mix(SAND(), INK.paperDark, 0.3)), duneR = inkEl(root);
      const crowd = mode === 'rain' ? Array.from({ length: 5 }, (_, i) => person(el(root, 'g'), sd + 300 + i * 20, { scale: (0.58 + 0.12 * (i % 2)) * u, vest: [mix(INK.blue, INK.ink, 0.2), mix(INK.green, INK.ink, 0.25), mix(INK.stain, INK.ink, 0.2)][i % 3], beard: i === 2 ? 'short' : null })) : [];
      const rn = mode === 'rain' ? rain(el(root, 'g'), sd + 60) : null;
      const front = sandFront(el(root, 'g'), sd + 990);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', mode === 'hook' ? 0.5 : dur * 0.3);
          if (mode === 'hook') {
            const k = clamp01((lt - hit) / 1.4), dt = lt - hit;
            const wg = gy + Math.max(0, punch(lt, hit, 0.8)) * 16 * u;
            const wr0 = [Wd[0] * W, wg];
            pl.update(t, wr0[0] - 40 * u, gy - 60 * u, lt < hit ? 0 : Math.max(0.12, k), u * 1.05);
            const wr = wh.update(t, wr0[0], wg, Wd[1] * u * (1 + 0.06 * punch(lt, hit)), { face: Wd[2], hole: lt > hit ? 0.8 : 0, bulge: lt < hit ? 0.6 : 0 });
            ch.update(t, wr.mid[0], wr.mid[1], dt, u, 16, { spread: 2.6 });
            blank(dune, duneR);
          } else {
            const PL = clamp01(0.75 + lt * 0.1);
            pl.update(t, Wd[0] * W, gy - 120 * u, PL, 0.62 * u, clamp01(lt / (dur * 3)));
            wh.update(t, Wd[0] * W, gy - 120 * u, Wd[1] * u, { face: Wd[2], hole: 1 });
            ch.update(t, Wd[0] * W, gy - 200 * u, 0.6 + (lt % 1.6), 0.5 * u, 10, { spread: 2.4 });
            const DP = [[-60, gy + 80 * u], [-60, gy - 60 * u], [0.25 * W, gy - 110 * u], [0.6 * W, gy - 50 * u], [W + 60, gy - 20 * u], [W + 60, gy + 80 * u]];
            dune.setAttribute('d', inkLoop(DP, { seed: sd + 80, t, amp: 0.8 })); duneR.setAttribute('d', inkPath(DP.slice(1, 5), { w: 5, seed: sd + 81, t }));
            crowd.forEach((c, i) => {
              const x = ((0.86 - i * 0.18) - lt * 0.05) * W, y = gy + (20 + (i % 2) * 70) * u;
              c.update(t, lt < hit ? 'point' : 'run', { x, y, face: -1, dir: 40, ph: lt * 1.6 + i * 0.3, since: 1, emotion: lt < hit ? 'surprised' : 'worried' });
            });
            rn.update(t, W, H, lt < hit ? 0.35 : 1, u, gy + 120 * u);
          }
          front.update(t, W, H, fy, { log: mode === 'hook' ? 0.75 : 0.3 });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.wh_car
  SH.wh_car = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 831, u = W / 1080, mode = P.mode || 'crush';
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.7) * H;
      const root = el(svg, 'g');
      const dunes = inkEl(root, mix(SAND(), INK.paperDark, 0.35)), dunesR = inkEl(root);
      const lot = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.2)), lotR = inkEl(root, INK.paperLight);
      const sign = mode === 'dealer' ? { posts: inkEl(root, mix(INK.stain, INK.ink, 0.3)), board: inkEl(root, INK.paperLight), rim: inkEl(root), wh: inkEl(root, WHALE()), whR: inkEl(root), tx: [0, 1].map(() => el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'text-anchor': 'middle', fill: INK.red })) } : null;
      if (sign) { const S = (P.sign || ['A WHALE', 'OF A DEAL']); sign.tx[0].textContent = S[0]; sign.tx[1].textContent = S[1]; }
      const pen = mode === 'dealer' ? { line: inkEl(root), fl: inkEl(root, INK.red), fl2: inkEl(root, INK.gold) } : null;
      const back = [car(el(root, 'g'), sd + 100, mix(INK.green, INK.paperLight, 0.3)), car(el(root, 'g'), sd + 120, mix(INK.stain, INK.paperLight, 0.3))];
      const track = inkEl(root, INK.red);
      const main = car(el(root, 'g'), sd + 200, mix(INK.blue, INK.paperLight, 0.2));
      const lump = inkEl(root, BLUB()), lumpR = inkEl(root), lumpD = inkEl(root, BLUB_D()), dust = inkEl(root, mix(INK.paperDark, SAND(), 0.4)), tk = inkEl(root, INK.red);
      const front = sandFront(el(root, 'g'), sd + 990);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.55);
          const DP = prof(W, gy - 230 * u, 50 * u, 0.004, 2.1);
          dunes.setAttribute('d', inkLoop(DP.concat([[W + 60, gy], [-60, gy]]), { seed: sd, t, amp: 0.7 })); dunesR.setAttribute('d', inkPath(DP, { w: 4, seed: sd + 1, t }));
          const LP = [[-60, gy - 90 * u], [W + 60, gy - 90 * u], [W + 60, H + 60], [-60, H + 60]];
          lot.setAttribute('d', inkLoop(LP, { seed: sd + 2, t, amp: 0.6, smooth: false }));
          lotR.setAttribute('d', [0.12, 0.42, 0.72, 1.02].map((q, i) => inkPath([[q * W, gy - 80 * u], [q * W - 60 * u, gy + 60 * u]], { w: 6, seed: sd + 3 + i, t })).join(' '));
          if (mode === 'crush') {
            back[0].update(t, 0.12 * W, gy - 70 * u, 0.5 * u, 0); back[1].update(t, 0.42 * W, gy - 70 * u, 0.5 * u, 0);
            const imp = clamp01((lt - hit) / 0.25), crush = imp, cx = 0.6 * W, cgy = gy + 10 * u;
            const shake = punch(lt, hit, 0.6) * Math.sin(lt * 60) * 10 * u;
            const rr = main.update(t, cx + shake, cgy, 1.05 * u, crush, { shards: lt > hit ? clamp01((lt - hit) / 0.9) : 0 });
            // the chunk's arc from the left (dashed track) to the roof
            const p0 = [-0.15 * W, 0.5 * H], p2 = [cx, rr.roof[1] - 30 * u], p1 = [0.2 * W, 0.1 * H];
            const Bz = q => [(1 - q) * (1 - q) * p0[0] + 2 * (1 - q) * q * p1[0] + q * q * p2[0], (1 - q) * (1 - q) * p0[1] + 2 * (1 - q) * q * p1[1] + q * q * p2[1]];
            const fly0 = Math.max(0, hit - 1.6), q = clamp01((lt - fly0) / (hit - fly0 || 1));
            const D = []; for (let i = 0; i < 26; i++) { const a = i / 26, b = (i + 0.5) / 26; if (b <= q) D.push(inkPath([Bz(a), Bz(b)], { w: 5, seed: sd + 40 + i, t })); }
            track.setAttribute('d', D.join(' '));
            const pos = lt < hit ? Bz(q) : [cx, rr.roof[1] - 34 * u], sq = lt < hit ? 1 : 1 - 0.25 * imp, r = 74 * u;
            const LPt = inkEllipsePts(pos[0], pos[1], r * 1.5 / sq, r * sq, sd + 50, 11, lt < hit ? t * 3 : 0, 0.22);
            lump.setAttribute('d', inkLoop(LPt, { seed: sd + 50, t, amp: 0.8 })); lumpR.setAttribute('d', inkPath(LPt, { w: 5, seed: sd + 51, t, closed: true }));
            lumpD.setAttribute('d', inkDot(pos[0] + r * 0.4, pos[1] + r * 0.2, r * 0.6, r * 0.32, sd + 52, t) + ' ' + inkDot(pos[0] - r * 0.6, pos[1] - r * 0.1, r * 0.3, r * 0.2, sd + 53, t));
            const dk = lt > hit ? clamp01((lt - hit) / 1.5) : 0, Ds = [];
            if (dk > 0 && dk < 1) for (let i = 0; i < 6; i++) Ds.push(inkLoop(inkEllipsePts(cx + (i - 2.5) * 110 * u * (0.6 + dk), cgy - 20 * u - dk * 60 * u, (50 + 60 * dk) * u, (30 + 30 * dk) * u, sd + 60 + i, 10, 0, 0.15), { seed: sd + 60 + i, t, amp: 1 }));
            dust.setAttribute('d', Ds.join(' '));
            tk.setAttribute('d', lt > hit && lt < hit + 1.2 ? [-1, 0, 1].map((k, i) => inkPath([[pos[0] + k * 150 * u, pos[1] - 110 * u], [pos[0] + k * 210 * u, pos[1] - 180 * u]], { w: 8, seed: sd + 70 + i, t })).join(' ') : '');
          } else {
            back[0].update(t, 0.14 * W, gy - 60 * u, 0.48 * u, 0); back[1].update(t, 0.86 * W, gy - 60 * u, 0.48 * u, 0);
            // the sign pops up at cue "hit"
            const k = spring(lt, Math.max(0.1, hit - 0.2), 0.6), pu = 1 + 0.08 * punch(lt, hit);
            const cx = 0.5 * W, top = gy - 760 * u + (1 - k) * 120 * u, bw = 860 * u * pu, bh = 480 * u * pu;
            const on = lt >= Math.max(0.1, hit - 0.2);
            [sign.posts, sign.board, sign.rim, sign.wh, sign.whR].forEach(e => e.style.display = on ? '' : 'none'); sign.tx.forEach(e => e.style.display = on ? '' : 'none');
            sign.posts.setAttribute('d', inkPath([[cx - 330 * u, gy - 60 * u], [cx - 330 * u, top + bh * 0.5]], { w: 22, seed: sd + 80, t }) + ' ' + inkPath([[cx + 330 * u, gy - 60 * u], [cx + 330 * u, top + bh * 0.5]], { w: 22, seed: sd + 81, t }));
            const B = [[cx - bw / 2, top], [cx + bw / 2, top + 6 * u], [cx + bw / 2, top + bh], [cx - bw / 2, top + bh - 4 * u]];
            sign.board.setAttribute('d', inkLoop(B, { seed: sd + 82, t, amp: 0.6, smooth: false }));
            sign.rim.setAttribute('d', inkPath(B, { w: 8, seed: sd + 83, t, closed: true, smooth: false }) + ' ' + inkPath(B.map(p => [lerp(p[0], cx, 0.035), lerp(p[1], top + bh / 2, 0.07)]), { w: 3, seed: sd + 84, t, closed: true, smooth: false }));
            // a little smiling whale painted on the board, spouting
            const wx = cx + bw * 0.3, wy = top + bh * 0.93, s = 0.2 * u * pu, T = q => [wx + q[0] * s, wy + q[1] * s];
            sign.wh.setAttribute('d', inkLoop(WB.map(T), { seed: sd + 85, t, amp: 0.6 }));
            const sp = Math.sin(t * 4) * 6;
            sign.whR.setAttribute('d', inkPath(WB.map(T), { w: 4, seed: sd + 86, t, closed: true }) + ' ' + inkPath([[220, -70], [300, -40], [380, -60]].map(T), { w: 4, seed: sd + 87, t }) + ' ' + inkDot(...T([250, -110]), 5, 5, sd + 88, t) +
              ' ' + [-1, 0, 1].map((d, i) => inkPath([T([480, -270]), T([480 + d * 90, -400 - sp * (1 + i)])], { w: 4, seed: sd + 89 + i, t, taper: 0.5 })).join(' '));
            sign.tx.forEach((e, i) => { e.setAttribute('font-size', f1(118 * u * pu)); e.setAttribute('x', f1(cx)); e.setAttribute('y', f1(top + (i ? 300 : 160) * u * pu)); e.setAttribute('transform', `scale(${k > 0.02 ? 1 : 0})`); });
            // pennant string swaying
            const yl = top - 60 * u, Lp = [], Fp = [], Fg = [];
            const sag = x => yl + 60 * u * Math.sin(Math.PI * clamp01(x / W)) + Math.sin(t * 2) * 6 * u;
            for (let x = -20; x <= W + 20; x += 40) Lp.push([x, sag(x)]);
            for (let i = 0; i < 12; i++) { const x = (i + 0.5) / 12 * W, y = sag(x), w = Math.sin(t * 4 + i) * 10 * u; (i % 2 ? Fg : Fp).push(inkLoop([[x - 26 * u, y], [x + 26 * u, y], [x + w, y + 64 * u]], { seed: sd + 100 + i, t, amp: 0.5, smooth: false })); }
            pen.line.setAttribute('d', inkPath(Lp, { w: 4, seed: sd + 98, t })); pen.fl.setAttribute('d', Fp.join(' ')); pen.fl2.setAttribute('d', Fg.join(' '));
            main.update(t, 0.5 * W, gy - 10 * u, 1.1 * u, 0, { shine: true });
            blank(track, lump, lumpR, lumpD, dust, tk);
          }
          front.update(t, W, H, fy, { gravel: true, wet: false, log: false, col: mix(INK.paperDark, INK.inkSoft, 0.15), grass: [0.04, 0.96] });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
