// ep_penguin: shots for the Stickstory Short "Emperor penguin dads" (2026-11-17): in the Antarctic winter the male
// emperor penguin keeps the single egg on his feet under a fold of belly skin (brood pouch) for about two months
// while the female feeds at sea; he fasts for almost four months and loses nearly half his weight. Thousands pack
// into a huddle that shuffles a few centimetres in travelling waves (every 30-60 s, Zitterbart et al. 2011), so the
// birds slowly take turns on the cold windward edge. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens
// only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random.
// Parametric: any penguin / polar-colony story. Uses lh__lib.js (LH.kasif, LH.label).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}],
//   scarf: true (a wind-blown scarf: he is bundled up against the cold)}
//   L = label {text, x, y, at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}
//   hero = {x (0..1), s (scale; ~420 px tall at 1), face: 1|-1, egg: 0..1, pouch: 0..1, tuck: 0..1}
//   gy: ground line 0..1 H (default 0.73; stand on it); front: top of the foreground snow 0..1 H; wind: 0..1 (blowing snow)
//
// SHOTS.ep_colony — side view on the sea ice. P: {mode, gy, front, wind, hero, kasif: K, rows: [[y, s, n, tone]],
//   labels}. mode "hook": one big dad with the egg on his feet in a blizzard, a far colony behind;
//   "storm": a line of hunched dads, heads tucked, a thermometer whose red column drops on cue "cold" (P.thermo
//   {x, y, h}); "ask": Kaşif in a scarf shivers and thinks, points at the colony on cue "how"; "huddle": a dense
//   huddle seen from the side (rows of penguins), steam rising, edge birds frosted on the windward side;
//   "warm": the huddle at night, the gold-ringed bird now in the middle, warm air rising gold on cue "hit";
//   "end": Kaşif waves next to a dad with his egg, the huddle behind.
// SHOTS.ep_feet — close-up of the dad's feet: the egg rests on them, the belly fold slides down over it on cue
//   "cover", a warm glow round the egg; snow streaming past. P: {gy, front, hero, labels}
// SHOTS.ep_sea — the edge of the sea ice: the mother waddles to the edge and dives on cue "sea" (splash rings,
//   bubbles), the dad with his egg stays far back on the ice. P: {gy, edge (0..1 W), mom: {x, s}, dad: {x, s}, labels}
// SHOTS.ep_weight — the dad under the polar night, standing on an old platform scale: a dashed gold ghost of his plump
//   autumn body stays while he slims from cue "loses" (P.thin, 0.7 = 30 % narrower) and the dial needle swings down out
//   of the red "heavy" zone. P: {gy, front, hero, thin, backs, labels}
// Foreground (ep_colony, ep_feet, ep_weight): P.backs [[x 0..1, scale]] = frosted penguin backs cropped by the frame
//   bottom (default two in the corners), plus snow banks and pressure-ice blocks.
// SHOTS.ep_huddle — the huddle from straight above on the ice, wind arrow from the left. mode "wave": every
//   P.period s a wave runs from the downwind front to the back and each bird steps forward as it passes (cue
//   "wave" starts it); mode "turn": the whole mass slowly circulates, frost marks whoever is on the windward edge,
//   and one gold-ringed bird spirals in from the edge to the warm middle. P: {mode, cx, cy, rx, ry, gap, period,
//   step, labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const SNOW = () => mix(INK.paperLight, INK.blue, 0.07);
  const SNOW_D = () => mix(INK.paperLight, INK.blue, 0.22);
  const FROST = () => mix(INK.paperLight, INK.blue, 0.3);
  const ICE = () => mix(INK.paperLight, INK.blue, 0.38);
  const ICE_D = () => mix(INK.blue, INK.ink, 0.25);
  const BACK = () => mix(INK.ink, INK.blue, 0.12);
  const BELLY = () => INK.paperLight;
  const CHEST = () => mix(INK.paperLight, INK.gold, 0.35);
  const EAR = () => INK.gold;
  const BILL = () => mix(INK.gold, INK.red, 0.45);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));

  // ------------------------------------------------------------------ penguin geometry (side view, facing +x, feet y = 0, ~420 tall)
  const P_BODY = [[-20, -4], [-58, -40], [-80, -110], [-86, -200], [-74, -280], [-50, -330], [-22, -356], [14, -358], [40, -338], [56, -300], [70, -230], [78, -150], [72, -80], [52, -30], [24, -6]];
  const P_BELLY = [[22, -8], [50, -32], [68, -82], [74, -150], [66, -230], [52, -292], [38, -322], [22, -332], [14, -300], [16, -220], [12, -120], [8, -40]];
  const P_CHEST = [[38, -322], [52, -292], [60, -258], [28, -256], [18, -296], [22, -332]];
  const P_FLIP = [[-8, -292], [-26, -220], [-34, -150], [-26, -112]];
  const P_FEET = [[[-6, -3], [70, 1]], [[8, -1], [84, 4]]];
  const P_TOES = [[[70, 0], [94, 4]], [[78, 2], [100, 9]], [[66, 3], [88, 11]]];
  const EGG = [58, -36, 28, 34];
  // transform local points: x + p.x * s * face * sx, y + p.y * s * sy (rot in rad about the feet)
  function tf(pts, o) {
    const c = Math.cos(o.rot || 0), sn = Math.sin(o.rot || 0), sx = o.sx || 1, sy = o.sy || 1;
    return pts.map(p => { const px = p[0] * sx, py = p[1] * sy, rx = px * c - py * sn, ry = px * sn + py * c; return [o.x + rx * o.s * o.face, o.y + ry * o.s]; });
  }
  // head parts relative to the head centre, rotated down by the tuck
  function headParts(tuck) {
    const hc = [18 + 16 * tuck, -374 + 40 * tuck], a = 0.12 + tuck * 0.55, c = Math.cos(a), s = Math.sin(a);
    const R = pts => pts.map(p => [hc[0] + p[0] * c - p[1] * s, hc[1] + p[0] * s + p[1] * c]);
    return {
      hc,
      head: inkEllipsePts(hc[0], hc[1], 47, 42, 5, 12, a * 0.5, 0.02),
      bill: R([[22, -16], [92, 6], [88, 13], [24, 8]]),
      stripe: R([[30, 2], [82, 10], [30, 8]]),
      ear: [[hc[0] - 8, hc[1] + 12], [hc[0] + 10, hc[1] + 20], [hc[0] + 16, hc[1] + 42], [hc[0] + 8, hc[1] + 64], [hc[0] - 4, hc[1] + 44]],
      eye: [hc[0] + 18, hc[1] - 8], tip: R([[92, 6]])[0],
    };
  }

  // detailed penguin. st: {face, egg 0..1, pouch 0..1, tuck 0..1, sx (thin), rot, frost 0..1, ring 0..1 (gold ring), flap}
  function penguin(parent, sd) {
    const g = el(parent, 'g'), E = (c, x) => inkEl(g, c, x);
    const ring = E(INK.gold), feet = E(mix(INK.ink, INK.inkSoft, 0.3)), body = E(BACK()), belly = E(BELLY()), chest = E(CHEST()), bodyL = E(), head = E(BACK()), headL = E();
    const ear = E(EAR()), bill = E(INK.ink), stripe = E(BILL()), eye = E(INK.paperLight), flip = E(BACK()), flipL = E(mix(INK.inkSoft, INK.paperLight, 0.3));
    const eggF = E(mix(INK.paperLight, INK.gold, 0.3)), eggH = E(INK.paperLight), eggR = E(), toes = E(mix(INK.ink, INK.inkSoft, 0.3)), pouchS = E(mix(INK.inkSoft, INK.ink, 0.3)), pouch = E(mix(BACK(), INK.paperLight, 0.28)), pouchF = E(mix(INK.inkSoft, INK.paperLight, 0.35)), pouchR = E(), frost = E(FROST(), { 'fill-opacity': 0 }), frostT = E(INK.paperLight), lines = E();
    return {
      update(t, x, y, s, st = {}) {
        const fc = st.face ?? 1, O = { x, y, s, face: fc, sx: st.sx || 1, rot: (st.rot || 0) * fc }, k = sd, lw = 5.5 / Math.pow(s, 0.25) / s, amp = 1.2 / s;
        const ink = (pts, w, i, ex = {}) => inkPath(tf(pts, O), Object.assign({ w: w * s, seed: k + i, t, amp: amp * s }, ex));
        const loop = (pts, i) => inkLoop(tf(pts, O), { seed: k + i, t, amp: amp * s });
        const hp = headParts(st.tuck || 0);
        ring.setAttribute('d', (st.ring || 0) > 0.01 ? inkPath(tf(inkEllipsePts(0, -10, 120, 30, k + 90, 14), O), { w: 9 * s * st.ring, seed: k + 91, t, closed: true, amp: 1 }) : '');
        feet.setAttribute('d', P_FEET.map((f, i) => ink(f, 15, 1 + i, { taper: 0.2 })).join(' '));
        body.setAttribute('d', loop(P_BODY, 2));
        head.setAttribute('d', loop(hp.head, 3));
        belly.setAttribute('d', loop(P_BELLY, 4));
        chest.setAttribute('d', loop(P_CHEST, 5));
        ear.setAttribute('d', loop(hp.ear, 6));
        bill.setAttribute('d', loop(hp.bill, 7));
        stripe.setAttribute('d', loop(hp.stripe, 8));
        const ep = tf([hp.eye], O)[0];
        eye.setAttribute('d', inkDot(ep[0], ep[1], 4.5 * s, 4 * s, k + 9, t));
        const fl = (st.flap || 0), FP = P_FLIP.map((p, i) => [p[0] - fl * i * 10, p[1] + fl * i * 4]);
        flip.setAttribute('d', ink(FP, 26, 10, { taper: 0.55 }));
        flipL.setAttribute('d', ink(FP.map(p => [p[0] + 6, p[1]]), 4, 11, { taper: 0.6 }));
        // egg on the feet + the belly fold over it
        const eg = clamp01(st.egg || 0), po = clamp01(st.pouch || 0);
        if (eg > 0.01) {
          const ept = inkEllipsePts(EGG[0], EGG[1], EGG[2] * eg, EGG[3] * eg, k + 12, 12);
          eggF.setAttribute('d', loop(ept, 12)); eggR.setAttribute('d', inkPath(tf(ept, O), { w: lw * s * 0.9, seed: k + 13, t, closed: true, amp: amp * s }));
          eggH.setAttribute('d', ink([[EGG[0] + 12 * eg, EGG[1] - 4 * eg], [EGG[0] + 14 * eg, EGG[1] + 12 * eg]], 6, 17, { taper: 0.5 }));
          toes.setAttribute('d', P_TOES.map((f, i) => ink(f, 9, 40 + i, { taper: 0.4 })).join(' '));
        } else blank(eggF, eggR, eggH, toes);
        // brood fold: a feathered flap of belly skin that bulges out and curls down over the egg
        const PP = [[30, -138], [76, -130], [98, lerp(-104, -80, po)], [100, lerp(-88, -48, po)], [86, lerp(-74, -30, po)], [58, lerp(-74, -32, po)], [34, lerp(-84, -44, po)], [22, -112]];
        pouchS.setAttribute('d', po > 0.01 ? ink([PP[3], PP[4], PP[5], PP[6]].map(p => [p[0] - 2, p[1] + 5]), 4, 18, { taper: 0.5 }) : '');
        pouch.setAttribute('d', po > 0.01 ? loop(PP, 14) : '');
        const FF = [];
        if (po > 0.01) for (let i = 0; i < 6; i++) { const f = i / 5, a = PP[3], b = PP[6], x = lerp(a[0], b[0], f), y = lerp(a[1], b[1], f) - 6 + Math.sin(f * Math.PI) * 6; FF.push(ink([[x + 4, y - 22], [x - 2, y - 6], [x - 8, y]], 4, 50 + i, { taper: 0.5 })); }
        pouchF.setAttribute('d', FF.join(' '));
        pouchR.setAttribute('d', po > 0.01 ? ink([PP[1], PP[2], PP[3], PP[4], PP[5], PP[6]], lw, 15) : '');
        const fr = clamp01(st.frost || 0);
        frost.setAttribute('fill-opacity', (0.5 * fr).toFixed(3)); frost.setAttribute('d', fr > 0.01 ? loop(P_BODY.slice(0, 8), 16) : '');
        const FT = [];
        if (fr > 0.01) for (let i = 0; i < 9; i++) { const q = P_BODY[1 + (i % 6)], d = -18 - (i % 3) * 6; FT.push(ink([[q[0] + 4, q[1] - i * 3], [q[0] + d, q[1] - 6 - i * 3]], 6 * fr, 30 + i, { taper: 0.5 })); }
        frostT.setAttribute('d', FT.join(' '));
        bodyL.setAttribute('d', ink(P_BODY, lw, 20, { closed: true }) + ' ' + ink(P_BELLY.slice(0, 9), lw * 0.6, 22));
        headL.setAttribute('d', inkPath(tf(hp.head, O), { w: lw * s, seed: k + 21, t, closed: true, amp: amp * s }));
        lines.setAttribute('d', ink(hp.bill, lw * 0.7, 23, { closed: true }));
        return { tip: tf([hp.tip], O)[0], egg: tf([[EGG[0], EGG[1]]], O)[0], top: tf([[16, -420]], O)[0] };
      },
    };
  }

  // a row of simple penguins (crowds): back, belly, gold ear+bill, outline as 4 shared paths
  function crowdRow(parent, sd) {
    const back = inkEl(parent, BACK()), belly = inkEl(parent, BELLY()), gold = inkEl(parent, EAR()), frost = inkEl(parent, INK.paperLight), lines = inkEl(parent);
    return {
      // o: {x0, x1, y, s, n, tone 0..1 (towards paper = distance), face, tuck, frostL: 0..1 (windward birds frosted), shuffle, ringAt: index}
      update(t, o) {
        const B = [], BL = [], G = [], F = [], L = [], n = o.n;
        back.setAttribute('fill', mix(BACK(), INK.paper, o.tone || 0)); belly.setAttribute('fill', mix(BELLY(), INK.paper, (o.tone || 0) * 0.5));
        gold.setAttribute('fill', mix(EAR(), INK.paper, o.tone || 0)); lines.setAttribute('fill', mix(INK.ink, INK.paper, (o.tone || 0) * 0.8));
        for (let i = 0; i < n; i++) {
          const fx = n > 1 ? i / (n - 1) : 0.5, jit = (hn(sd, i) - 0.5) * 0.6 / Math.max(1, n - 1);
          const sh = o.shuffle ? Math.max(0, Math.sin(t * 2.4 - fx * 6 + sd)) * 6 * o.s : 0;
          const x = lerp(o.x0, o.x1, fx + jit) + sh, y = o.y + (hn(sd + 1, i) - 0.5) * 10 * o.s, s = o.s * (0.9 + hn(sd + 2, i) * 0.2);
          const face = o.face ?? (hn(sd + 3, i) > 0.35 ? 1 : -1), tuck = (o.tuck ?? 0.3) + hn(sd + 4, i) * 0.3;
          const O = { x, y, s, face, rot: Math.sin(t * 1.3 + i * 1.7) * 0.02 };
          const hp = headParts(Math.min(1, tuck)), amp = 1.1;
          B.push(inkLoop(tf(P_BODY, O), { seed: sd + 10 + i, t, amp }), inkLoop(tf(hp.head, O), { seed: sd + 200 + i, t, amp }));
          BL.push(inkLoop(tf(P_BELLY, O), { seed: sd + 400 + i, t, amp }));
          G.push(inkLoop(tf(hp.ear, O), { seed: sd + 600 + i, t, amp: 0.6 }), inkLoop(tf(hp.stripe, O), { seed: sd + 650 + i, t, amp: 0.5 }));
          L.push(inkPath(tf(P_BODY, O), { w: Math.max(2.5, 6 * s), seed: sd + 800 + i, t, closed: true, amp }));
          const fr = (o.frostL || 0) * clamp01(1 - fx * 3.5);
          if (fr > 0.05) for (let j = 0; j < 5; j++) { const q = tf([P_BODY[1 + j]], O)[0]; F.push(inkPath([[q[0], q[1]], [q[0] - face * 22 * s, q[1] - 8 * s]], { w: 7 * s * fr, seed: sd + 900 + i * 7 + j, t, taper: 0.5 })); }
        }
        back.setAttribute('d', B.join(' ')); belly.setAttribute('d', BL.join(' ')); gold.setAttribute('d', G.join(' ')); frost.setAttribute('d', F.join(' ')); lines.setAttribute('d', L.join(' '));
      },
    };
  }

  // blowing snow: flakes and streaks moving downwind (left -> right)
  function blowing(parent, sd, n = 40) {
    const st = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.35)), f = inkEl(parent, INK.paperLight), r = inkEl(parent, mix(INK.blue, INK.inkSoft, 0.35));
    return {
      update(t, W, y0, y1, wind = 0.6, k = 1) {
        const S = [], F = [], R = [];
        for (let i = 0; i < n * k; i++) {
          const vx = 120 + wind * 620 * (0.7 + hn(sd, i) * 0.6), vy = 30 + hn(sd + 1, i) * 50, span = W + 240;
          const x = ((hn(sd + 2, i) * span + t * vx) % span) - 120, y = y0 + ((hn(sd + 3, i) * (y1 - y0) + t * vy) % (y1 - y0)) + Math.sin(t * 2 + i) * 8;
          const rr = 4 + hn(sd + 4, i) * 6, L = 20 + wind * 90 * hn(sd + 5, i);
          if (wind > 0.2 && i % 2 === 0) S.push(inkPath([[x - L, y - L * vy / vx], [x, y]], { w: 2.5, seed: sd + 10 + i, t, amp: 0.4, taper: 0.7 }));
          F.push(inkCircle(x, y, rr, sd + 100 + i, t, { fill: true, n: 8 })); R.push(inkCircle(x, y, rr, sd + 100 + i, t, { w: 1.5, n: 8 }));
        }
        st.setAttribute('d', S.join(' ')); f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }

  // foreground snow down to the frame bottom: drift profile, sastrugi ridges, cropped ice blocks, ground drift
  function iceFront(parent, sd) {
    const E = (c, x) => inkEl(parent, c, x);
    const far = E(SNOW_D()), fill = E(SNOW()), hatch = E(mix(INK.blue, INK.paperLight, 0.45)), blkS = E(ICE()), blkT = E(mix(ICE(), INK.paperLight, 0.6)), blkL = E(ICE_D()), drift = E(mix(INK.paperLight, INK.blue, 0.15)), edge = E();
    const saF = E(SNOW_D()), saH = E(mix(INK.blue, INK.paperLight, 0.4)), saL = E();
    const bkF = E(BACK()), bkG = E(EAR()), bkW = E(INK.paperLight), bkL = E();
    return {
      update(t, W, H, top, o = {}) {
        const u = W / 1080, prof = (y0, a, ph) => { const P = []; for (let i = 0; i <= 12; i++) P.push([-40 + i * (W + 80) / 12, y0 + Math.sin(i * 1.1 + ph) * a + hn(sd + ph, i) * a * 0.5]); return P; };
        const P0 = prof(top, 14, 1), P1 = prof(top + 90 * u, 22, 3);
        far.setAttribute('d', inkLoop(P0.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd, t, amp: 0.8 }));
        fill.setAttribute('d', inkLoop(P1.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 1, t, amp: 0.8 }));
        const HC = [];
        for (let i = 0; i < 9; i++) { const y = top + 160 * u + i * 70 * u, x0 = hn(sd + 2, i) * W * 0.5 - 60, L = 260 + hn(sd + 3, i) * 320; HC.push(inkPath([[x0, y], [x0 + L * 0.5, y - 14 * u], [x0 + L, y + 4]], { w: 3.2, seed: sd + 10 + i, t, amp: 0.6 })); }
        hatch.setAttribute('d', HC.join(' '));
        // two cropped pressure-ice blocks in the corners
        const BL = o.blocks !== false ? [[-60 * u, top + 300 * u, 300 * u, 230 * u, -0.12], [W - 250 * u, top + 380 * u, 320 * u, 260 * u, 0.1]] : [];
        const S = [], T = [], L = [];
        BL.forEach((b, i) => {
          const [x, y, w, h, a] = b, d = w * 0.22;
          const F = [[x, y + h * a], [x + w, y - h * a], [x + w, y + h], [x, y + h]], TP = [[x, y + h * a], [x + d, y + h * a - d * 0.7], [x + w + d, y - h * a - d * 0.7], [x + w, y - h * a]];
          S.push(inkLoop(F, { seed: sd + 40 + i, t, smooth: false, amp: 0.9 })); T.push(inkLoop(TP, { seed: sd + 44 + i, t, smooth: false, amp: 0.9 }));
          L.push(inkPath(F, { w: 6, seed: sd + 48 + i, t, closed: true, smooth: false }), inkPath(TP, { w: 5, seed: sd + 52 + i, t, closed: true, smooth: false }),
            inkPath([[x + w * 0.3, y + h * 0.2], [x + w * 0.42, y + h * 0.45], [x + w * 0.36, y + h * 0.7]], { w: 3.5, seed: sd + 56 + i, t, smooth: false }));
        });
        blkS.setAttribute('d', S.join(' ')); blkT.setAttribute('d', T.join(' ')); blkL.setAttribute('d', L.join(' '));
        // ground drift: low streaks racing along the surface
        const wind = o.wind ?? 0.5, D = [];
        for (let i = 0; i < 14; i++) { const span = W + 400, x = ((hn(sd + 60, i) * span + t * (200 + wind * 700)) % span) - 200, y = top + 40 * u + hn(sd + 61, i) * (H - top - 120 * u), L = 120 + hn(sd + 62, i) * 160; D.push(inkPath([[x, y], [x + L * 0.5, y - 6], [x + L, y + 2]], { w: 7, seed: sd + 70 + i, t, amp: 0.5, taper: 0.8 })); }
        drift.setAttribute('d', D.join(' '));
        edge.setAttribute('d', inkPath(P1, { w: 6, seed: sd + 5, t }) + ' ' + inkPath(P0, { w: 3.5, seed: sd + 6, t }));
        // wind-sculpted ridges (sastrugi): long crescent drifts with a sharp windward lip
        const SF = [], SH_ = [], SL = [];
        if (o.sastrugi) for (let i = 0; i < 4; i++) {
          const y = top + (150 + i * 105) * u, x0 = (hn(sd + 500, i) * 0.6 - 0.3) * W, L = (520 + hn(sd + 501, i) * 380) * u, hgt = (36 + i * 10) * u, TP = [], BT = [];
          for (let j = 0; j <= 10; j++) { const f = j / 10; TP.push([x0 + f * L, y - Math.sin(Math.pow(f, 0.6) * Math.PI) * hgt]); BT.push([x0 + f * L, y + Math.sin(f * Math.PI) * hgt * 0.25]); }
          SF.push(inkLoop(TP.concat(BT.reverse()), { seed: sd + 510 + i, t, amp: 0.8 }));
          for (let j = 1; j < 6; j++) { const f = j / 6, x = x0 + f * L, yy = y - Math.sin(Math.pow(f, 0.6) * Math.PI) * hgt; SH_.push(inkPath([[x, yy + 6], [x + 26 * u, y]], { w: 3, seed: sd + 520 + i * 7 + j, t })); }
          SL.push(inkPath(TP, { w: 5, seed: sd + 540 + i, t }));
        }
        saF.setAttribute('d', SF.join(' ')); saH.setAttribute('d', SH_.join(' ')); saL.setAttribute('d', SL.join(' '));
        // a row of frosted penguin backs, cropped by the frame bottom (o.backs: [[x 0..1, scale]])
        const F = [], G = [], Wt = [], LL = [];
        (o.backs || []).forEach((b, i) => {
          const sc = b[1] * u, x = b[0] * W + Math.sin(t * 1.2 + i * 2) * 6 * sc, bt = H + 120 * sc, hy = H - 215 * sc + Math.sin(t * 1.5 + i) * 4 * sc;
          const body = inkEllipsePts(x, bt, 150 * sc, 300 * sc, sd + 300 + i, 14), head = inkEllipsePts(x + 6 * sc, hy, 80 * sc, 74 * sc, sd + 310 + i, 12);
          F.push(inkLoop(body, { seed: sd + 320 + i, t, amp: 1 }), inkLoop(head, { seed: sd + 330 + i, t, amp: 1 }));
          G.push(inkLoop(inkEllipsePts(x - 70 * sc, hy + 50 * sc, 16 * sc, 34 * sc, sd + 340 + i, 8, 0.3), { seed: sd + 341 + i, t, amp: 0.6 }),
            inkLoop(inkEllipsePts(x + 82 * sc, hy + 50 * sc, 16 * sc, 34 * sc, sd + 342 + i, 8, -0.3), { seed: sd + 343 + i, t, amp: 0.6 }));
          for (let j = 0; j < 7; j++) { const a = -Math.PI * (0.2 + 0.6 * j / 6), r = j % 2 ? 74 : 150, cy = j % 2 ? hy : bt, ry = j % 2 ? 70 : 296; const px = x + Math.cos(a) * r * sc, py = cy + Math.sin(a) * ry * sc; Wt.push(inkPath([[px - 18 * sc, py + 6 * sc], [px + 18 * sc, py - 2 * sc]], { w: 9 * sc, seed: sd + 350 + i * 9 + j, t, taper: 0.5 })); }
          LL.push(inkPath(body, { w: 6, seed: sd + 380 + i, t, closed: true }), inkPath(head, { w: 6, seed: sd + 390 + i, t, closed: true }));
        });
        bkF.setAttribute('d', F.join(' ')); bkG.setAttribute('d', G.join(' ')); bkW.setAttribute('d', Wt.join(' ')); bkL.setAttribute('d', LL.join(' '));
      },
    };
  }

  // breath puffs from a beak / mouth, drifting downwind
  function breath(parent, sd) {
    const f = inkEl(parent, INK.paperLight), r = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.2));
    return {
      update(t, p, k = 1, dir = 1) {
        if (!p) { blank(f, r); return; }
        const F = [], R = [];
        for (let i = 0; i < 3; i++) {
          const ph = (t * 0.6 + i / 3) % 1, rr = (8 + ph * 26) * k * Math.sin(Math.PI * Math.min(1, ph * 1.3)); if (rr < 2) continue;
          const x = p[0] + dir * (10 + ph * 90) * k + ph * 40 * k, y = p[1] - ph * 30 * k;
          F.push(inkCircle(x, y, rr, sd + i, t, { fill: true, n: 9 })); R.push(inkCircle(x, y, rr, sd + i, t, { w: 2.5, n: 9 }));
        }
        f.setAttribute('d', F.join(' ')); r.setAttribute('d', R.join(' '));
      },
    };
  }

  // Kaşif bundled up: LH.kasif + a wind-blown scarf + shiver + breath
  function coldKasif(parent, K, W, H, seed) {
    const L = window.LH, g = el(parent, 'g');
    const kas = L.kasif(el(g, 'g'), K, W, H, seed);
    const sc = inkEl(g, INK.blue), scS = inkEl(g, INK.gold), scR = inkEl(g), br = breath(g, seed * 7 + 3);
    return {
      update(lt, t, cues) {
        const r = kas.update(lt, t, cues);
        const ks = (K.scale ?? 0.8) * (W / 1080), kf = K.face === 'left' || K.face === -1 ? -1 : 1;
        if (!r || K.scarf === false) { blank(sc, scR, scS); return; }
        const hd = [K.x * W + kf * ks * r.head[0], K.y * H + ks * r.head[1]], n = [hd[0], hd[1] + 76 * ks];
        const fl = Math.sin(t * 7) * 10 * ks, fl2 = Math.sin(t * 7 + 1.4) * 14 * ks;
        const wrap = inkEllipsePts(n[0], n[1], 46 * ks, 17 * ks, seed + 4, 12);
        const tail = [[n[0] + 10 * ks, n[1] + 6 * ks], [n[0] + 50 * ks, n[1] + 22 * ks + fl], [n[0] + 96 * ks, n[1] + 30 * ks + fl2], [n[0] + 138 * ks, n[1] + 26 * ks + fl]];
        sc.setAttribute('d', inkLoop(wrap, { seed: seed + 5, t, amp: 1 }) + ' ' + inkPath(tail, { w: 30 * ks, seed: seed + 6, t, taper: 0.2 }));
        scS.setAttribute('d', [0.3, 0.6].map((f, i) => { const a = tail[1 + i]; return inkPath([[a[0] - 6 * ks, a[1] - 12 * ks], [a[0] + 4 * ks, a[1] + 12 * ks]], { w: 6 * ks, seed: seed + 7 + i, t, taper: 0.2 }); }).join(' '));
        scR.setAttribute('d', inkPath(wrap, { w: 5 * ks, seed: seed + 9, t, closed: true }) + ' ' + inkPath(tail.slice(1), { w: 4 * ks, seed: seed + 10, t, amp: 1 }));
        br.update(t, [hd[0] + kf * 70 * ks, hd[1] + 10 * ks], ks * 1.2, kf);
      },
    };
  }

  // thermometer: tube, bulb, red column; level 0..1
  function thermo(parent, sd) {
    const tubeF = inkEl(parent, INK.paperLight), col = inkEl(parent, INK.red), ticks = inkEl(parent), rim = inkEl(parent);
    return {
      update(t, x, y, h, level) {
        const w = h * 0.12, br = w * 1.15, by = y + h;
        tubeF.setAttribute('d', inkLoop(rect(x - w / 2, y, x + w / 2, by), { seed: sd, t, smooth: false, amp: 0.8 }) + ' ' + inkCircle(x, by + br * 0.6, br, sd + 1, t, { fill: true }));
        const top = lerp(by, y + w * 0.4, clamp01(level));
        col.setAttribute('d', inkLoop(rect(x - w * 0.22, top, x + w * 0.22, by + 4), { seed: sd + 2, t, smooth: false, amp: 0.6 }) + ' ' + inkCircle(x, by + br * 0.6, br * 0.72, sd + 3, t, { fill: true }));
        const T = []; for (let i = 1; i < 8; i++) { const yy = lerp(by, y, i / 8); T.push(inkPath([[x + w / 2, yy], [x + w / 2 + (i % 2 ? 18 : 30), yy]], { w: 4, seed: sd + 10 + i, t })); }
        ticks.setAttribute('d', T.join(' '));
        rim.setAttribute('d', inkPath([[x - w / 2, by + br * 0.1], [x - w / 2, y + w / 2], [x, y - w * 0.05], [x + w / 2, y + w / 2], [x + w / 2, by + br * 0.1]], { w: 6, seed: sd + 4, t }) + ' ' + inkCircle(x, by + br * 0.6, br, sd + 5, t, { w: 6 }));
      },
    };
  }

  // rising wavy air lines (steam from the huddle / warm air), gold when warm
  function steam(parent, sd) {
    const e = inkEl(parent, mix(INK.paperLight, INK.inkSoft, 0.15)), r = inkEl(parent);
    return {
      update(t, x0, x1, y, h, n = 6, col = null) {
        e.setAttribute('fill', col || mix(INK.inkSoft, INK.paperLight, 0.25));
        const S = [];
        for (let i = 0; i < n; i++) {
          const x = lerp(x0, x1, (i + 0.5) / n), ph = (t * 0.5 + hn(sd, i)) % 1, yy = y - ph * h * 0.4, P = [];
          for (let j = 0; j <= 6; j++) P.push([x + Math.sin(j * 1.2 + t * 2 + i) * 16, yy - j * h / 10]);
          S.push(inkPath(P, { w: 7 * Math.sin(Math.PI * ph) + 1, seed: sd + 10 + i, t, amp: 0.6, taper: 0.6 }));
        }
        e.setAttribute('d', S.join(' ')); r.setAttribute('d', '');
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.ep_colony
  SH.ep_colony = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 317, u = W / 1080, mode = P.mode || 'hook';
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.73) * H, fy = (P.front ?? 0.77) * H, BK = P.backs ?? [[0.04, 1], [0.97, 1.1]], wind = P.wind ?? (mode === 'storm' || mode === 'hook' ? 0.85 : 0.45);
      const ROWS = P.rows || (mode === 'hook' ? [[0.565, 0.32, 16, 0.6], [0.58, 0.42, 11, 0.4]]
        : mode === 'storm' ? [[0.56, 0.3, 14, 0.62]]
        : mode === 'ask' || mode === 'end' ? [[0.52, 0.28, 12, 0.5], [0.535, 0.36, 9, 0.3]]
        : [[0.43, 0.38, 13, 0.45], [0.47, 0.5, 11, 0.3], [0.515, 0.64, 9, 0.15], [0.56, 0.8, 8, 0.05], [0.6, 0.98, 6, 0]]);
      const rows = ROWS.map((r, i) => ({ r, c: crowdRow(el(root, 'g'), sd + 40 + i * 37) }));
      const st = (mode === 'huddle' || mode === 'warm') ? steam(el(root, 'g'), sd + 300) : null;
      const blowBack = blowing(el(root, 'g'), sd + 330, 22);
      const th = mode === 'storm' ? thermo(el(root, 'g'), sd + 360) : null;
      const HERO = mode === 'hook' ? [{ x: 0.52, s: 1.55, face: 1, egg: 1, pouch: 0.55, tuck: 0.15 }]
        : mode === 'storm' ? [{ x: 0.12, s: 0.95, face: 1, egg: 1, pouch: 0.9, tuck: 0.8 }, { x: 0.38, s: 1.08, face: 1, egg: 1, pouch: 0.9, tuck: 0.85 }, { x: 0.64, s: 1.0, face: 1, egg: 1, pouch: 0.9, tuck: 0.75 }]
        : mode === 'end' ? [{ x: 0.68, s: 1.15, face: -1, egg: 1, pouch: 0.5, tuck: 0.1 }]
        : mode === 'warm' ? [{ x: 0.5, s: 1.05, face: 1, egg: 0, pouch: 1, tuck: 0.2, ring: 1 }] : [];
      const heroes = (P.hero ? [].concat(P.hero) : HERO).map((h, i) => ({ h: Object.assign({}, HERO[i] || {}, h), p: penguin(el(root, 'g'), sd + 400 + i * 50), b: breath(el(root, 'g'), sd + 600 + i * 9) }));
      const K = Object.assign({ x: 0.3, y: P.gy ?? 0.73, scale: 1.0, pose: 'think', face: 'right', emotion: 'worried', scarf: true }, P.kasif || {});
      const kas = (mode === 'ask' || mode === 'end' || P.kasif) && P.kasif !== false ? coldKasif(el(root, 'g'), K, W, H, seed) : null;
      const front = iceFront(el(root, 'g'), sd + 700);
      const blowFront = blowing(el(root, 'g'), sd + 760, mode === 'hook' || mode === 'storm' ? 34 : 18);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.45);
          blowBack.update(t, W, 0.14 * H, gy, wind, 1);
          const warm = mode === 'warm' ? progIO(lt, hit - 0.3, 1.2) : 0;
          if (st) st.update(t, 0.12 * W, 0.88 * W, gy + (ROWS[0][0] - 0.6) * H - 150 * u, 420 * u, 8, warm > 0.05 ? mix(INK.gold, INK.paperLight, 0.3 * (1 - warm)) : null);
          rows.forEach(({ r, c }, i) => {
            const n = r[2], s = r[1] * u, span = (mode === 'huddle' || mode === 'warm') ? 0.5 + i * 0.1 : 1.1;
            c.update(t, { x0: W * (0.5 - span / 2), x1: W * (0.5 + span / 2), y: gy + (r[0] - 0.6) * H, s, n, tone: r[3], tuck: mode === 'storm' || mode === 'hook' ? 0.6 : 0.25,
              shuffle: mode === 'huddle' || mode === 'warm', frostL: mode === 'huddle' ? 1 : mode === 'warm' ? 0.6 : 0, face: mode === 'huddle' || mode === 'warm' ? undefined : 1 });
          });
          if (th) {
            const T = P.thermo || {}, cold = atOr(cues, 'cold', dur * 0.5);
            th.update(t, (T.x ?? 0.84) * W, (T.y ?? 0.17) * H, (T.h ?? 0.26) * H, lerp(0.75, 0.08, progIO(lt, cold - 0.6, 1.2)) + 0.02 * Math.sin(t * 5));
          }
          heroes.forEach(({ h, p, b }, i) => {
            const walk = mode === 'storm' ? t * 1.6 + i : 0, wad = mode === 'storm' ? Math.sin(walk * Math.PI * 2) * 0.06 : Math.sin(t * 1.7 + i) * 0.015;
            const x = h.x * W + (mode === 'storm' ? (t * 16 + Math.max(0, Math.sin(walk * Math.PI * 2)) * 4) * u : 0);
            const ps = mode === 'hook' ? 1 + 0.05 * punch(lt, hit, 0.6) : 1;
            const r = p.update(t, x, gy + (h.dy || 0) * u, h.s * u * ps, { face: h.face, egg: h.egg, pouch: h.pouch, tuck: h.tuck, rot: wad, frost: mode === 'storm' || mode === 'hook' ? 0.8 : 0.3, ring: (h.ring || 0) * spring(lt, 0.1, 0.6), flap: mode === 'end' ? Math.max(0, Math.sin(t * 4)) * 0.6 : 0 });
            b.update(t, h.tuck > 0.6 ? null : r.tip, h.s * u, h.face);
          });
          if (kas) kas.update(lt, t, cues);
          front.update(t, W, H, fy, { wind, backs: BK, blocks: P.blocks, sastrugi: P.sastrugi });
          blowFront.update(t, W, 0.2 * H, H, wind, 1);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.ep_feet
  SH.ep_feet = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 523, u = W / 1080, root = el(svg, 'g');
      const gy = (P.gy ?? 0.73) * H, fy = (P.front ?? 0.77) * H, BK = P.backs ?? [[0.04, 1], [0.97, 1.1]];
      const HR = Object.assign({ x: 0.42, s: 1.8, face: 1 }, P.hero || {});
      const blowB = blowing(el(root, 'g'), sd + 10, 24);
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0 }), rays = inkEl(root, INK.gold);
      const p = penguin(el(root, 'g'), sd + 100);
      const front = iceFront(el(root, 'g'), sd + 200), blowF = blowing(el(root, 'g'), sd + 260, 20);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, cov = atOr(cues, 'cover', dur * 0.35), po = lerp(0.15, 1, progIO(lt, cov - 0.2, 1.0)), hit = atOr(cues, 'hit', cov);
          blowB.update(t, W, 0.1 * H, gy, 0.6);
          const s = HR.s * u, ex = HR.x * W + 46 * s * HR.face, ey = gy - 36 * s, g = 0.5 + 0.2 * Math.sin(t * 3) + 0.4 * punch(lt, hit, 0.8);
          glow.setAttribute('fill-opacity', (0.28 * g).toFixed(3));
          glow.setAttribute('d', inkCircle(ex, ey, 70 * s * (0.9 + 0.1 * g), sd + 30, t, { fill: true }));
          const R = []; for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 8), r0 = 52 * s, r1 = (68 + 12 * g) * s; R.push(inkPath([[ex + Math.cos(a) * r0, ey + Math.sin(a) * r0], [ex + Math.cos(a) * r1, ey + Math.sin(a) * r1]], { w: 8, seed: sd + 40 + i, t })); }
          rays.setAttribute('d', lt < cov + 0.4 ? R.join(' ') : '');
          p.update(t, HR.x * W, gy, s, { face: HR.face, egg: 1, pouch: po, tuck: 0.2, rot: Math.sin(t * 1.4) * 0.012, frost: 0.4 });
          front.update(t, W, H, fy, { wind: 0.6, backs: BK, blocks: P.blocks, sastrugi: P.sastrugi });
          blowF.update(t, W, 0.25 * H, H, 0.6);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.ep_sea
  SH.ep_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 611, u = W / 1080, root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, ex = (P.edge ?? 0.6) * W;
      const MOM = Object.assign({ x: 0.4, s: 0.95 }, P.mom || {}), DAD = Object.assign({ x: 0.12, s: 0.6 }, P.dad || {});
      const E = (c, x) => inkEl(root, c, x);
      const water = E(mix(INK.blue, INK.paperLight, 0.3)), ripple = E(mix(INK.blue, INK.ink, 0.2)), floe = E(ICE()), floeR = E();
      const dad = penguin(el(root, 'g'), sd + 50);
      const shelfF = E(SNOW()), shelfS = E(ICE()), shelfH = E(mix(INK.blue, INK.paperLight, 0.4)), shelfL = E();
      const mom = penguin(el(root, 'g'), sd + 100);
      const splash = E(INK.paperLight), splashR = E(mix(INK.blue, INK.ink, 0.3)), bub = E();
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sea = Math.min(atOr(cues, 'sea', dur * 0.4), P.dive ?? dur * 0.4);
          // open water to the right of the ice edge, down to the frame bottom
          water.setAttribute('d', inkLoop([[ex - 40, gy + 40 * u], [W + 40, gy + 30 * u], [W + 40, H + 40], [ex - 40, H + 40]], { seed: sd, t, smooth: false, amp: 1 }));
          const RP = []; for (let i = 0; i < 12; i++) { const y = gy + 90 * u + i * 62 * u, x0 = ex + hn(sd + 1, i) * (W - ex) * 0.5, ph = Math.sin(t * 1.5 + i) * 14; RP.push(inkPath([[x0 + ph, y], [x0 + 60 + ph, y - 8], [x0 + 130 + ph, y]], { w: 4, seed: sd + 10 + i, t, amp: 0.6 })); }
          ripple.setAttribute('d', RP.join(' '));
          const FL = (P.floes || [[0.86, 0.66, 120], [0.95, 0.78, 90]]).map((f, i) => { const x = f[0] * W + Math.sin(t * 0.8 + i) * 8, y = f[1] * H + Math.sin(t * 1.1 + i) * 5; return inkEllipsePts(x, y, f[2] * u, f[2] * 0.3 * u, sd + 20 + i, 10); });
          floe.setAttribute('d', FL.map((p, i) => inkLoop(p, { seed: sd + 22 + i, t, amp: 0.8 })).join(' '));
          floeR.setAttribute('d', FL.map((p, i) => inkPath(p, { w: 5, seed: sd + 24 + i, t, closed: true })).join(' '));
          dad.update(t, DAD.x * W, gy - 10 * u, DAD.s * u, { face: 1, egg: 1, pouch: 0.8, tuck: 0.1, rot: Math.sin(t * 1.5) * 0.01 });
          // the ice shelf: top surface + its blue edge face dropping into the water
          const top = [[-40, gy - 14 * u], [ex * 0.5, gy - 6 * u], [ex, gy]], face = [[ex, gy], [ex + 40 * u, gy + 60 * u], [ex + 10 * u, H + 40], [-40, H + 40], [-40, gy - 14 * u]];
          shelfF.setAttribute('d', inkLoop(top.concat([[ex - 30 * u, H + 40], [-40, H + 40]]), { seed: sd + 30, t, smooth: false, amp: 0.8 }));
          shelfS.setAttribute('d', inkLoop([[ex - 30 * u, gy + 10 * u], [ex, gy], [ex + 40 * u, gy + 60 * u], [ex + 10 * u, H + 40], [ex - 40 * u, H + 40]], { seed: sd + 31, t, smooth: false, amp: 0.8 }));
          const HC = []; for (let i = 0; i < 8; i++) { const y = gy + 120 * u + i * 80 * u, L = 200 + hn(sd + 32, i) * 220; HC.push(inkPath([[20 + hn(sd + 33, i) * 200, y], [20 + L, y - 10]], { w: 3.2, seed: sd + 34 + i, t })); }
          shelfH.setAttribute('d', HC.join(' '));
          shelfL.setAttribute('d', inkPath(top, { w: 6, seed: sd + 40, t }) + ' ' + inkPath([[ex, gy], [ex + 40 * u, gy + 60 * u], [ex + 10 * u, H]], { w: 6, seed: sd + 41, t, smooth: false }) + ' ' +
            inkPath([[ex - 14 * u, gy + 80 * u], [ex + 14 * u, gy + 200 * u], [ex - 4 * u, gy + 330 * u]], { w: 3.5, seed: sd + 42, t, smooth: false }));
          // mom waddles to the edge, then dives in an arc
          const s = MOM.s * u, x0 = MOM.x * W, xe = ex - 30 * u, walk = clamp01(lt / Math.max(0.3, sea - 0.15)), dv = clamp01((lt - (sea - 0.15)) / 0.55);
          let mx = lerp(x0, xe, walk), my = gy, rot = Math.sin(lt * 10) * 0.06 * (1 - dv), show = dv < 1;
          if (dv > 0) { mx = xe + dv * 170 * u; my = gy - Math.sin(dv * Math.PI) * 80 * u + dv * dv * 220 * u; rot = dv * 1.9; }
          if (show) mom.update(t, mx, my, s, { face: 1, egg: 0, pouch: 0, tuck: 0.05, rot, flap: 0.4 + 0.4 * Math.max(0, Math.sin(lt * 10)) });
          else mom.update(t, -4000, -4000, s, {});
          const sp = clamp01((lt - (sea + 0.35)) / 1.2), cx = xe + 190 * u, cy = gy + 150 * u, S = [], SR = [];
          if (sp > 0 && sp < 1) {
            for (let i = 0; i < 7; i++) { const a = -Math.PI * (0.15 + 0.7 * i / 6), r = (40 + 120 * sp) * u, h = Math.sin(sp * Math.PI); const p = [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9 * h]; S.push(inkCircle(p[0], p[1], 12 * u * (1 - sp * 0.6), sd + 60 + i, t, { fill: true })); SR.push(inkCircle(p[0], p[1], 12 * u * (1 - sp * 0.6), sd + 60 + i, t, { w: 3 })); }
          }
          const RR = []; if (lt > sea + 0.35) for (let i = 0; i < 3; i++) { const ph = ((lt - sea - 0.35) * 0.7 + i / 3) % 1; RR.push(inkPath(inkEllipsePts(cx, cy, (30 + ph * 220) * u, (8 + ph * 50) * u, sd + 70 + i, 14), { w: 5 * (1 - ph) + 1, seed: sd + 74 + i, t, closed: true })); }
          splash.setAttribute('d', S.join(' ')); splashR.setAttribute('d', SR.concat(RR).join(' '));
          const B = []; if (lt > sea + 0.4) for (let i = 0; i < 6; i++) { const ph = ((lt - sea) * 0.8 + i / 6) % 1; B.push(inkCircle(cx + 40 * u + Math.sin(i * 2 + t * 3) * 20, cy + 380 * u - ph * 300 * u, (6 + i % 3 * 3) * u, sd + 80 + i, t, { w: 3 })); }
          bub.setAttribute('d', B.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.ep_weight
  SH.ep_weight = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 731, u = W / 1080, root = el(svg, 'g');
      const gy = (P.gy ?? 0.73) * H, fy = (P.front ?? 0.77) * H, BK = P.backs ?? [[0.04, 1], [0.97, 1.1]];
      const HR = Object.assign({ x: 0.45, s: 1.9, face: 1 }, P.hero || {});
      const blowB = blowing(el(root, 'g'), sd + 10, 18);
      const scS = inkEl(root, mix(INK.stain, INK.ink, 0.25)), scT = inkEl(root, mix(INK.stain, INK.paperLight, 0.45)), scL = inkEl(root);
      const ghostF = inkEl(root, INK.gold, { 'fill-opacity': 0.12 }), ghost = inkEl(root, INK.gold);
      const p = penguin(el(root, 'g'), sd + 100), b = breath(el(root, 'g'), sd + 140);
      const dF = inkEl(root, INK.paperLight), dT = inkEl(root), dN = inkEl(root, INK.red), dR = inkEl(root, INK.red, { 'fill-opacity': 0.85 });
      const front = iceFront(el(root, 'g'), sd + 200);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, ls = atOr(cues, 'loses', dur * 0.3), k = progIO(lt, ls - 0.1, Math.max(0.8, dur * 0.55)), thin = lerp(1, P.thin ?? 0.7, k);
          blowB.update(t, W, 0.12 * H, gy, 0.35);
          const s = HR.s * u, x = HR.x * W;
          // an old platform scale on the ice: he stands on it, the dial on its front face
          const sw = 380 * u, bh = 130 * u, sx = x + 30 * s * HR.face, d = 40 * u, py = gy - bh;
          const front_ = rect(sx - sw / 2, py, sx + sw / 2, gy), top = [[sx - sw / 2, py], [sx - sw / 2 + d, py - d * 0.6], [sx + sw / 2 + d, py - d * 0.6], [sx + sw / 2, py]];
          scS.setAttribute('d', inkLoop(front_, { seed: sd + 30, t, smooth: false, amp: 0.8 }));
          scT.setAttribute('d', inkLoop(top, { seed: sd + 31, t, smooth: false, amp: 0.8 }));
          scL.setAttribute('d', inkPath(front_, { w: 6, seed: sd + 32, t, closed: true, smooth: false }) + ' ' + inkPath(top, { w: 5, seed: sd + 33, t, closed: true, smooth: false }) + ' ' +
            [0.2, 0.8].map((f, i) => inkPath([[sx - sw / 2 + sw * f - 20 * u, gy], [sx - sw / 2 + sw * f - 20 * u, gy + 18 * u], [sx - sw / 2 + sw * f + 20 * u, gy + 18 * u], [sx - sw / 2 + sw * f + 20 * u, gy]], { w: 5, seed: sd + 34 + i, t, smooth: false })).join(' '));
          // dashed ghost of the plump body (wider than the original)
          const G = tf(P_BODY, { x, y: py - d * 0.3, s, face: HR.face, sx: 1.14 }), D = [];
          const gs = inkSpline(G, true, 9);
          for (let i = 0; i < gs.length - 2; i += 6) D.push(inkPath([gs[i], gs[i + 1], gs[i + 2]], { w: 6, seed: sd + 20 + i, t, amp: 0.6, taper: 0.2 }));
          ghost.setAttribute('d', lt > ls - 0.2 ? D.join(' ') : '');
          ghostF.setAttribute('d', lt > ls - 0.2 ? inkLoop(G, { seed: sd + 19, t, amp: 0.8 }) : '');
          const r = p.update(t, x, py - d * 0.3, s, { face: HR.face, egg: 1, pouch: 1, tuck: 0.25 * k, sx: thin, rot: Math.sin(t * 1.3) * 0.012, frost: 0.3 });
          b.update(t, r.tip, s, HR.face);
          // the dial: the needle swings down from "heavy" as he slims (wobbling as it settles)
          const dc = [sx, py + bh * 0.5], dr = 50 * u, ang = lerp(0.95, -0.35, k) + 0.06 * Math.sin(t * 9) * (1 - k * 0.6);
          dF.setAttribute('d', inkCircle(dc[0], dc[1], dr, sd + 40, t, { fill: true }));
          const TT = [inkCircle(dc[0], dc[1], dr, sd + 41, t, { w: 5 })];
          for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + lerp(-1.1, 1.1, i / 6); TT.push(inkPath([[dc[0] + Math.cos(a) * dr * 0.72, dc[1] + Math.sin(a) * dr * 0.72], [dc[0] + Math.cos(a) * dr * 0.92, dc[1] + Math.sin(a) * dr * 0.92]], { w: 3, seed: sd + 42 + i, t })); }
          dT.setAttribute('d', TT.join(' '));
          const na = -Math.PI / 2 + ang;
          dN.setAttribute('d', inkPath([[dc[0], dc[1]], [dc[0] + Math.cos(na) * dr * 0.85, dc[1] + Math.sin(na) * dr * 0.85]], { w: 6, seed: sd + 50, t, taper: 0.4 }) + ' ' + inkDot(dc[0], dc[1], 7 * u, 7 * u, sd + 51, t));
          dR.setAttribute('d', inkPath(Array.from({ length: 7 }, (_, i) => { const a = -Math.PI / 2 + lerp(0.6, 1.1, i / 6); return [dc[0] + Math.cos(a) * dr * 0.82, dc[1] + Math.sin(a) * dr * 0.82]; }), { w: 7, seed: sd + 52, t, taper: 0 }));
          front.update(t, W, H, fy, { wind: 0.3, backs: BK, blocks: P.blocks, sastrugi: P.sastrugi });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.ep_huddle (top view)
  SH.ep_huddle = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 853, u = W / 1080, root = el(svg, 'g'), mode = P.mode || 'wave';
      const cx = (P.cx ?? 0.52) * W, cy = (P.cy ?? 0.42) * H, rx = (P.rx ?? 0.36) * W, ry = (P.ry ?? 0.16) * H, gap = (P.gap ?? 64) * u;
      const E = (c, x) => inkEl(root, c, x);
      const ice = E(SNOW()), iceH = E(mix(INK.blue, INK.paperLight, 0.45)), streak = E(mix(INK.paperLight, INK.blue, 0.18));
      const warmG = E(INK.gold, { 'fill-opacity': 0 }), shadow = E(mix(INK.blue, INK.paperLight, 0.55));
      const bodyE = E(BACK()), goldE = E(EAR()), billE = E(BILL()), frostE = E(INK.paperLight), frostR = E(ICE_D()), lineE = E(), waveE = E(INK.gold), tagE = E(INK.gold), pathE = E(INK.gold);
      const arrowF = E(INK.red), arrowL = E(), walkB = E(BACK()), walkL = E();
      // hex-packed positions inside the ellipse
      const pts = [];
      for (let j = -12; j <= 12; j++) for (let i = -12; i <= 12; i++) {
        const x = (i + (j % 2 ? 0.5 : 0)) * gap, y = j * gap * 0.86;
        if ((x / rx) ** 2 + (y / ry) ** 2 <= 1) pts.push([x + (hn(sd, i * 31 + j) - 0.5) * 8 * u, y + (hn(sd + 1, i * 17 + j) - 0.5) * 8 * u]);
      }
      const LB = labels(root, P.labels, W, H);
      const top = (x, y, s, a, sdd, t) => {   // one penguin from above: back ellipse + head + bill, facing angle a
        const c = Math.cos(a), sn = Math.sin(a), R = p => [x + p[0] * c - p[1] * sn, y + p[0] * sn + p[1] * c];
        return { body: inkEllipsePts(x, y, 30 * s, 22 * s, sdd, 10, a), head: R([18 * s, 0]), bill: [R([30 * s, -4 * s]), R([46 * s, 0]), R([30 * s, 4 * s])], ear: [R([16 * s, -12 * s]), R([16 * s, 12 * s])] };
      };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          ice.setAttribute('d', inkLoop(rect(-40, -40, W + 40, H + 40), { seed: sd + 2, t, smooth: false, amp: 0 }));
          const HC = []; for (let i = 0; i < 26; i++) { const y = hn(sd + 3, i) * H, x0 = hn(sd + 4, i) * W - 200, L = 220 + hn(sd + 5, i) * 360; HC.push(inkPath([[x0, y], [x0 + L * 0.5, y - 12], [x0 + L, y + 6]], { w: 3, seed: sd + 6 + i, t, amp: 0.5 })); }
          iceH.setAttribute('d', HC.join(' '));
          const ST = []; for (let i = 0; i < 22; i++) { const span = W + 400, x = ((hn(sd + 7, i) * span + t * 520) % span) - 200, y = hn(sd + 8, i) * H, L = 100 + hn(sd + 9, i) * 140; ST.push(inkPath([[x, y], [x + L, y + 6]], { w: 6, seed: sd + 40 + i, t, amp: 0.4, taper: 0.8 })); }
          streak.setAttribute('d', ST.join(' '));
          // warm core
          const wk = 0.18 + 0.06 * Math.sin(t * 2);
          warmG.setAttribute('fill-opacity', wk.toFixed(3));
          warmG.setAttribute('d', inkLoop(inkEllipsePts(cx + 20 * u, cy, rx * 0.45, ry * 0.45, sd + 60, 14), { seed: sd + 61, t, amp: 1 }));
          shadow.setAttribute('d', inkLoop(inkEllipsePts(cx + 30 * u, cy + 24 * u, rx * 1.08, ry * 1.12, sd + 62, 16), { seed: sd + 63, t, amp: 1 }));
          const wv = atOr(cues, 'wave', 0.3), per = P.period ?? 1.7, step = (P.step ?? 26) * u, rot = mode === 'turn' ? (lt * 0.22) : 0;
          const B = [], G = [], BI = [], F = [], FR = [], LN = [], WV = [];
          pts.forEach((q, i) => {
            let x = q[0], y = q[1];
            if (rot) { const c = Math.cos(rot), s = Math.sin(rot); const nx = x * c - (y * rx / ry) * s, ny = (x * s + (y * rx / ry) * c) * ry / rx; x = nx; y = ny; }
            let dx = 0, near = 0;
            if (mode === 'wave' && lt > wv) {
              // waves run from the downwind front (right) to the back; each bird steps forward as the wave passes
              const el2 = lt - wv, xf = (rx - x) / (2 * rx);
              const k = Math.floor(el2 / per), ph = (el2 % per) / per;
              const passed = ph > xf * 0.8 ? 1 : 0, sm = clamp01((ph - xf * 0.8) / 0.12);
              dx = (k + passed * sm) * step; near = Math.exp(-(((ph - xf * 0.8) / 0.06) ** 2));
            }
            const X = cx + x + dx, Y = cy + y, s = u * (0.95 + hn(sd + 9, i) * 0.12), a = 0.05 * Math.sin(t * 1.3 + i);
            const p = top(X, Y, s, a, sd + 100 + i, t);
            B.push(inkLoop(p.body, { seed: sd + 100 + i, t, amp: 0.8 }), inkCircle(p.head[0], p.head[1], 15 * s, sd + 300 + i, t, { fill: true, n: 8 }));
            G.push(inkDot(p.ear[0][0], p.ear[0][1], 5 * s, 4 * s, sd + 500 + i, t), inkDot(p.ear[1][0], p.ear[1][1], 5 * s, 4 * s, sd + 520 + i, t));
            BI.push(inkLoop(p.bill, { seed: sd + 540 + i, t, smooth: false, amp: 0.3 }));
            LN.push(inkPath(p.body, { w: 3, seed: sd + 700 + i, t, closed: true, amp: 0.6 }));
            // frost on the windward (left) edge
            const ex = (x / rx) ** 2 + (y / ry) ** 2, fr = x < 0 ? clamp01((ex - 0.55) / 0.3) * clamp01(-x / rx * 2) : 0;
            if (fr > 0.05) for (let j = 0; j < 3; j++) { const a2 = Math.PI * (0.75 + j * 0.25), px = X + Math.cos(a2) * 26 * s, py = Y + Math.sin(a2) * 18 * s; F.push(inkPath([[px, py], [px - 16 * s * fr, py + (j - 1) * 8 * s]], { w: 9 * s, seed: sd + 900 + i * 3 + j, t, taper: 0.4 })); FR.push(inkPath([[px, py], [px - 16 * s * fr, py + (j - 1) * 8 * s]], { w: 3 * s, seed: sd + 1200 + i * 3 + j, t, taper: 0.4 })); }
            if (near > 0.2) WV.push(inkPath(inkEllipsePts(X, Y, 36 * s, 28 * s, sd + 1500 + i, 10), { w: 6 * near, seed: sd + 1600 + i, t, closed: true }));
          });
          bodyE.setAttribute('d', B.join(' ')); goldE.setAttribute('d', G.join(' ')); billE.setAttribute('d', BI.join(' '));
          frostR.setAttribute('d', FR.join(' ')); frostE.setAttribute('d', F.join(' ')); lineE.setAttribute('d', LN.join(' ')); waveE.setAttribute('d', WV.join(' '));
          // turn: one gold-ringed bird spirals from the windward edge to the middle
          if (mode === 'turn') {
            const k = progIO(lt, 0.2, dur * 0.85), A = [], path = [];
            for (let j = 0; j <= 30; j++) { const f = j / 30, a = Math.PI + f * Math.PI * 1.3, r = 1 - f * 0.9; path.push([cx + Math.cos(a) * rx * r * 0.98, cy + Math.sin(a) * ry * r * 0.98]); }
            const D = []; for (let j = 0; j < 30; j += 2) if (j / 30 >= k - 0.02) D.push(inkPath([path[j], path[j + 1]], { w: 6, seed: sd + 1800 + j, t, amp: 0.5 }));
            pathE.setAttribute('d', D.join(' '));
            const idx = Math.min(29.999, k * 30), j0 = Math.floor(idx), f = idx - j0, P0 = [lerp(path[j0][0], path[j0 + 1][0], f), lerp(path[j0][1], path[j0 + 1][1], f)];
            const p = top(P0[0], P0[1], u * 1.05, 0, sd + 2000, t);
            A.push(inkPath(inkEllipsePts(P0[0], P0[1], 48 * u, 40 * u, sd + 2001, 12), { w: 9, seed: sd + 2002, t, closed: true }));
            tagE.setAttribute('d', A.join(' ') + ' ' + inkCircle(P0[0], P0[1], 30 * u, sd + 2003, t, { fill: true, n: 10 }));
          } else blank(pathE, tagE);
          // wind arrow from the left
          const ay = cy, ax0 = 26 * u, ax1 = cx - rx - 20 * u, pulse = 1 + 0.06 * Math.sin(t * 4);
          arrowF.setAttribute('d', inkLoop([[ax0, ay - 16 * u], [ax1 - 40 * u * pulse, ay - 16 * u], [ax1 - 46 * u, ay - 44 * u], [ax1, ay], [ax1 - 46 * u, ay + 44 * u], [ax1 - 40 * u * pulse, ay + 16 * u], [ax0, ay + 16 * u]], { seed: sd + 2100, t, smooth: false, amp: 0.8 }));
          arrowL.setAttribute('d', inkPath([[ax0, ay - 16 * u], [ax1 - 40 * u * pulse, ay - 16 * u], [ax1 - 46 * u, ay - 44 * u], [ax1, ay], [ax1 - 46 * u, ay + 44 * u], [ax1 - 40 * u * pulse, ay + 16 * u], [ax0, ay + 16 * u]], { w: 5, seed: sd + 2101, t, closed: true, smooth: false }));
          // latecomers walking in from the bottom (fills the lower frame)
          const WB = [], WL = [];
          for (let i = 0; i < 5; i++) {
            const bx = (0.15 + i * 0.18) * W + Math.sin(i * 3) * 30 * u, by = 0.78 * H + hn(sd + 2200, i) * 0.14 * H - ((t * 26 + i * 40) % 140) * u, ph = Math.sin(t * 8 + i) * 0.12;
            const p = top(bx, by, u * 1.0, -Math.PI / 2 + ph, sd + 2300 + i, t);
            WB.push(inkLoop(p.body, { seed: sd + 2300 + i, t, amp: 0.8 }), inkCircle(p.head[0], p.head[1], 15 * u, sd + 2320 + i, t, { fill: true, n: 8 }));
            WL.push(inkPath(p.body, { w: 3, seed: sd + 2340 + i, t, closed: true }));
            const fa = Math.sin(t * 8 + i) * 0.3;
            WB.push(inkPath([[bx - 24 * u, by + 4 * u], [bx - 44 * u, by + (26 + fa * 20) * u]], { w: 11 * u, seed: sd + 2400 + i, t, taper: 0.5 }), inkPath([[bx + 24 * u, by + 4 * u], [bx + 44 * u, by + (26 - fa * 20) * u]], { w: 11 * u, seed: sd + 2420 + i, t, taper: 0.5 }));
          }
          walkB.setAttribute('d', WB.join(' ')); walkL.setAttribute('d', WL.join(' '));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
