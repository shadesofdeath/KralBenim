// cmb_pigeons: shots for the Stickstory Short "The Big Bang was blamed on pigeons" (2026-11-18): in 1964 Arno Penzias
// and Robert Wilson at Bell Labs (Holmdel, New Jersey) heard a faint hiss in their big horn antenna from every
// direction, day and night; they blamed the pigeons nesting in the horn and cleaned out the droppings, but the hiss
// stayed. Princeton's Robert Dicke, about to search for that very signal, told his team "Boys, we've been scooped."
// It was the cosmic microwave background, the oldest light in the universe (Nobel Prize 1978).
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything a pure function of (seed, lt); no Math.random. Parametric: any radio-astronomy / lab-discovery story.
// Uses lh__lib.js (LH.kasif, LH.label, LH.person, LH.front) and td__lib.js (TD.stars, TD.sun).
//
// Common: L = label {text, x, y, at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}
//   K = Kaşif {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   gy = ground line 0..1 H · grass = top of the foreground grass 0..1 H (false: none)
//
// SHOTS.cmb_horn — the Holmdel horn antenna on its rail turntable (long tapering horn, receiver cab at the throat,
//   bearing ring, dark square mouth). P: {gy, x, s (1 = ~840 px wide), aim (deg), sweep (deg, slow swing),
//   mode: "hook" (pigeons strut on the mouth's lip, hiss squiggles creep in) | "every" (hiss squiggles from every edge,
//   the horn swings, the sun sets and the moon rises on cue "night") | "glow" (the whole sky speckled with a faint gold
//   glow, squiggles everywhere) | "end" (calm), pigeons: [[f along the lip 0..1, face]], kasif: K, grass, labels}
// SHOTS.cmb_room — Bell Labs receiver room: equipment racks with dials, a pen chart recorder on a desk scribbling
//   noise (amplitude jumps on cue "hiss"), two scientists behind the desk. P: {desk (desk top 0..1 H), rec: {x, w},
//   people: true, labels}
// SHOTS.cmb_inside — inside the horn, looking down its throat: four corrugated walls converging, a nest with two
//   pigeons and droppings on the floor; on cue "clean" a broom sweeps the droppings away and the birds flap.
//   P: {vp: [x, y] (0..1 vanishing point), nest: [x, y] (0..1), labels}
// SHOTS.cmb_dicke — Princeton office: blackboard of chalk equations, a desk with a black rotary phone.
//   P: {mode: "ring" (the phone rings and jumps, Kaşif points at it) | "scooped" (Robert Dicke puts the handset down and
//   turns to two colleagues), desk, phone: {x}, kasif: K, labels}
// SHOTS.cmb_map — the cosmic microwave background as an oval all-sky map that fills the night sky blob by blob from cue
//   "reveal", shimmering; the little horn antenna on a hill below. P: {gy, oval: {x, y, rx, ry}, grass, labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const METAL = () => mix(INK.paperLight, INK.inkSoft, 0.16);
  const METAL_D = () => mix(INK.inkSoft, INK.paperDark, 0.4);
  const GREY = () => mix(INK.inkSoft, INK.paperLight, 0.5);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const ellP = (cx, cy, rx, ry, n = 16, a0 = 0) => { const o = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * TAU; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); } return o; };
  const rEll = (cx, cy, rx, ry, rot, n = 14) => { const c = Math.cos(rot), sn = Math.sin(rot); return ellP(0, 0, rx, ry, n).map(p => [cx + p[0] * c - p[1] * sn, cy + p[0] * sn + p[1] * c]); };
  const L2 = (a, b, f) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
  const add = (a, v, k = 1) => [a[0] + v[0] * k, a[1] + v[1] * k];

  // ------------------------------------------------------------------ pigeon (side view, feet at 0,0, facing +x, ~110 long)
  function pigeon(parent, sd) {
    const g = el(parent, 'g'), E = (c, x) => inkEl(g, c, x);
    const legs = E(mix(INK.red, INK.paperLight, 0.25)), tail = E(mix(INK.inkSoft, INK.ink, 0.2)), body = E(GREY()), wing = E(mix(INK.inkSoft, INK.paperLight, 0.3)), bars = E(INK.ink);
    const neck = E(mix(mix(INK.green, INK.blue, 0.5), INK.paperLight, 0.25)), head = E(GREY()), beak = E(INK.ink), eye = E(INK.red), outl = E();
    return {
      update(t, x, y, s, o = {}) {
        const fc = o.face ?? 1, sc = Math.max(0.05, s);
        g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${f1(sc * fc * 100) / 100} ${f1(sc * 100) / 100})`);
        const w = 4.5 / Math.pow(sc, 0.6), P = (pts, k, ex = {}) => inkPath(pts, Object.assign({ w, seed: sd + k, t, amp: 0.8 / sc }, ex));
        const Lp = (pts, k) => inkLoop(pts, { seed: sd + k, t, amp: 0.6 / sc });
        const pk = o.peck || 0, bob = Math.sin(t * 6 + sd) * 5 * (o.bob ?? 1), hx = 30 + bob + pk * 18, hy = -88 + pk * 40;
        const fl = o.flap || 0, wa = Math.sin(t * 22) * fl;
        legs.setAttribute('d', o.fly ? '' : P([[-4, -20], [-6, 0], [4, 1]], 1) + ' ' + P([[8, -20], [12, 0], [22, 1]], 2));
        tail.setAttribute('d', Lp([[-34, -34], [-82, -14], [-78, -2], [-28, -22]], 3));
        const B = rEll(-4, -44, 44, 28, -0.42);
        body.setAttribute('d', Lp(B, 4));
        const N = [[8, -66], [hx - 12, hy + 6], [hx + 10, hy + 10], [32, -50]];
        neck.setAttribute('d', Lp(N, 5));
        const HD = ellP(hx, hy, 16, 15, 10);
        head.setAttribute('d', Lp(HD, 6));
        beak.setAttribute('d', Lp([[hx + 13, hy - 2], [hx + 30, hy + 3], [hx + 13, hy + 6]], 7));
        eye.setAttribute('d', inkDot(hx + 5, hy - 3, 3.6, 3.6, sd + 8, t));
        const WG = fl > 0.01 ? [[-26, -52], [8, -62], [lerp(20, 0, 0.5 + 0.5 * wa), lerp(-66, -140, 0.5 + 0.5 * wa)], [-40, lerp(-56, -130, 0.5 + 0.5 * wa)]] : [[-36, -32], [0, -62], [18, -54], [-8, -26]];
        wing.setAttribute('d', Lp(WG, 9));
        bars.setAttribute('d', fl > 0.01 ? '' : P([[-18, -40], [-2, -50]], 10, { w: w * 1.3 }) + ' ' + P([[-24, -32], [-8, -42]], 11, { w: w * 1.3 }));
        outl.setAttribute('d', P(B, 12, { closed: true }) + ' ' + P(HD, 13, { closed: true }) + ' ' + P(WG, 14, { closed: true }) + ' ' + P([[-34, -34], [-82, -14], [-78, -2], [-28, -22]], 15, { closed: true, smooth: false }));
      },
    };
  }

  // ------------------------------------------------------------------ Holmdel horn antenna (origin: turntable centre on the ground)
  function horn(parent, sd) {
    const g = el(parent, 'g'), E = (c, x) => inkEl(g, c, x);
    const rail = E(), deck = E(METAL_D()), deckL = E(), frame = E(INK.inkSoft), cab = E(INK.paperLight), cabL = E(), win = E(INK.gold);
    const body = E(METAL()), ribs = E(mix(INK.inkSoft, INK.paperLight, 0.25)), ring = E(METAL_D()), ringL = E(), hornL = E(), mouth = E(METAL()), mouthIn = E(mix(INK.ink, INK.inkSoft, 0.25)), glowM = E(INK.gold, { 'fill-opacity': 0 }), bodyL = E();
    return {
      update(t, x, gy, s, aim = 0, o = {}) {
        const P = (pts, k, ex = {}) => inkPath(pts, Object.assign({ w: 6, seed: sd + k, t, amp: 1.2 }, ex));
        const Lp = (pts, k, sm = false) => inkLoop(pts, { seed: sd + k, t, amp: 1, smooth: sm });
        const S = (px, py) => [x + px * s, gy + py * s];
        // rail ring + wheels
        rail.setAttribute('d', P(ellP(x, gy - 4 * s, 400 * s, 34 * s, 28), 1, { closed: true, w: 5 }) + ' ' + [-300, -150, 150, 300].map((px, i) => inkCircle(x + px * s, gy + (i % 3 ? 20 : 8) * s, 16 * s, sd + 2 + i, t, { w: 5 })).join(' '));
        const DK = [S(-340, -14), S(340, -14), S(320, -66), S(-320, -66)];
        deck.setAttribute('d', Lp(DK, 6)); deckL.setAttribute('d', P(DK, 7, { closed: true, smooth: false }));
        // horn axis: throat -> mouth, rotated by aim about the throat
        const th = S(-290, -170), a0 = Math.atan2(-380, 560) + aim * Math.PI / 180, Lh = 680 * s;
        const d = [Math.cos(a0), Math.sin(a0)], n = [-d[1], d[0]], mo = add(th, d, Lh);
        const hT = 34 * s, hM = 190 * s;
        // A-frame supports from the deck to the horn
        const FR = [[S(-200, -66), L2(th, mo, 0.25)], [S(40, -66), L2(th, mo, 0.25)], [S(80, -66), L2(th, mo, 0.62)], [S(300, -66), L2(th, mo, 0.62)]];
        frame.setAttribute('d', FR.map((f, i) => P([f[0], add(f[1], n, hT * 0.4 + (hM - hT) * 0.3)], 10 + i, { w: 9 })).join(' '));
        // receiver cab at the throat
        const CB = [S(-390, -66), S(-220, -66), S(-220, -250), S(-390, -250)];
        cab.setAttribute('d', Lp(CB, 20)); cabL.setAttribute('d', P(CB, 21, { closed: true, smooth: false }) + ' ' + P([S(-390, -250), S(-305, -300), S(-220, -250)], 22, { smooth: false }));
        win.setAttribute('d', Lp([S(-360, -200), S(-300, -200), S(-300, -150), S(-360, -150)], 23));
        // horn body (tapering), cross ribs
        const HB = [add(th, n, -hT), add(mo, n, -hM), add(mo, n, hM), add(th, n, hT)];
        body.setAttribute('d', Lp(HB, 30));
        const RB = []; for (let i = 1; i < 10; i++) { const f = i / 10, c = L2(th, mo, f), h = lerp(hT, hM, f) * 0.97; RB.push(P([add(c, n, -h), add(c, n, h)], 40 + i, { w: 3.5 })); }
        ribs.setAttribute('d', RB.join(' '));
        // bearing ring around the horn
        const rc = L2(th, mo, 0.22), rh = lerp(hT, hM, 0.22) * 1.5, RP = []; for (let i = 0; i < 18; i++) { const b = i / 18 * TAU; RP.push(add(add(rc, d, Math.cos(b) * 24 * s), n, Math.sin(b) * rh)); }
        ring.setAttribute('d', inkPath(RP, { w: 26 * s, seed: sd + 60, t, closed: true, amp: 1 }));
        ringL.setAttribute('d', P(RP, 61, { closed: true, w: 4 }));
        // the mouth: a square box at the end of the horn, its dark aperture facing us
        const hb = hM, BXF = [[mo[0] - hb, mo[1] - hb], [mo[0] + hb, mo[1] - hb], [mo[0] + hb, mo[1] + hb], [mo[0] - hb, mo[1] + hb]];
        const TOP = [BXF[0], BXF[1], add(BXF[1], [-60 * s, -44 * s]), add(BXF[0], [-60 * s, -44 * s])];
        const AP = BXF.map(p => L2(mo, p, 0.74)), ctr = [mo[0], mo[1]];
        mouth.setAttribute('d', Lp(BXF, 70) + ' ' + Lp(TOP, 74));
        mouthIn.setAttribute('d', Lp(AP, 71));
        const gl = clamp01(o.glow || 0);
        glowM.setAttribute('fill-opacity', f1(gl * 7) / 10); glowM.setAttribute('d', gl > 0.01 ? Lp(AP.map(p => L2(ctr, p, 0.55)), 72, true) : '');
        const DEP = []; for (let i = 1; i < 4; i++) { const f = i / 4; DEP.push(P(AP.map(p => L2(ctr, p, 1 - f * 0.6)), 80 + i, { closed: true, smooth: false, w: 2.5 })); }
        hornL.setAttribute('d', P(HB, 31, { closed: true, smooth: false, w: 7 }));
        bodyL.setAttribute('d', P(BXF, 73, { closed: true, smooth: false, w: 7 }) + ' ' + P(TOP, 75, { closed: true, smooth: false, w: 6 }) + ' ' + P(AP, 76, { closed: true, smooth: false, w: 6 }) + ' ' + DEP.join(' '));
        const lipA = AP[3], lipB = AP[2], m1 = BXF[0];
        return { mouth: ctr, lipA, lipB, top: m1, th };
      },
    };
  }

  // gold hiss squiggles flying in from points far away toward a target
  function hiss(parent, sd, n) {
    const a = inkEl(parent, INK.gold), b = inkEl(parent, mix(INK.gold, INK.red, 0.4));
    const r0 = rng(sd), Q = Array.from({ length: n }, () => ({ ang: r0() * TAU, ph: r0(), sp: lerp(0.25, 0.45, r0()) }));
    return {
      update(t, lt, tx, ty, R, k = 1, angs) {
        const A = [], B = [];
        Q.forEach((q, i) => {
          if (k <= 0.01) return;
          const ang = angs ? lerp(angs[0], angs[1], hn(sd + i, 3)) : q.ang;
          const f = (lt * q.sp + q.ph) % 1, d = lerp(R, 60, f), ux = Math.cos(ang), uy = Math.sin(ang), px = -uy, py = ux;
          const pts = []; for (let j = 0; j <= 10; j++) { const dd = d + j * 14, zz = (j % 2 ? 1 : -1) * 16 * (1 - f * 0.5); pts.push([tx + ux * dd + px * zz, ty + uy * dd + py * zz]); }
          (i % 2 ? B : A).push(inkPath(pts, { w: 6 * k * (0.5 + f * 0.6), seed: sd + 10 + i, t, smooth: false, amp: 1 }));
        });
        a.setAttribute('d', A.join(' ')); b.setAttribute('d', B.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.cmb_horn
  SH.cmb_horn = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 211, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'hook';
      const gy = (P.gy ?? 0.62) * H, X = (P.x ?? 0.56) * W, S = (P.s ?? 1) * u;
      const st = (mode === 'glow' || mode === 'every') ? window.TD.stars(el(root, 'g'), sd + 1, W, H, mode === 'glow' ? 60 : 24, 0.04, 0.5) : null;
      const sun = mode === 'every' ? window.TD.sun(el(root, 'g'), sd + 3) : null;
      const moon = mode === 'every' ? inkEl(root, INK.paperLight) : null, moonR = mode === 'every' ? inkEl(root) : null;
      const specks = mode === 'glow' ? inkEl(root, INK.gold, { 'fill-opacity': 0.55 }) : null;
      const hs = hiss(el(root, 'g'), sd + 40, mode === 'every' || mode === 'glow' ? 14 : 10);
      const hn_ = horn(el(root, 'g'), sd + 100);
      const PG = (P.pigeons ?? [[0.3, 1], [0.7, -1]]).map((q, i) => ({ q, b: pigeon(el(root, 'g'), sd + 300 + i * 20) }));
      const KG = el(root, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const grass = P.grass === false ? null : (mode === 'glow' ? nightGrass(el(root, 'g'), sd + 90) : window.LH.front(el(root, 'g'), sd + 90, 'grass'));
      const LB = labels(root, P.labels, W, H);
      const sp = rng(sd + 5), SPK = Array.from({ length: 90 }, () => ({ x: sp(), y: sp() * 0.55, r: lerp(5, 14, sp()), ph: sp() * 6 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null)), ngt = atOr(cues, 'night', dur * 0.55);
          if (st) st.update(t * 2);
          if (sun) {
            const f = clamp01(lt / Math.max(0.5, ngt)), sx = lerp(0.72, 1.05, f) * W, sy = lerp(0.1, 0.3, f) * H;
            sun.update(t, sx, sy, (f < 1 ? 60 : 0) * u);
            const mf = progIO(lt, ngt, 1.2), mx = 0.72 * W, my = lerp(0.5, 0.14, mf) * H, mr = 54 * u * mf;
            const C1 = ellP(mx, my, mr, mr, 14), C2 = ellP(mx + mr * 0.45, my - mr * 0.2, mr * 0.85, mr * 0.85, 14);
            moon.setAttribute('d', mf > 0.02 ? inkLoop(C1, { seed: sd + 7, t }) : '');
            moonR.setAttribute('d', mf > 0.02 ? inkPath(C1, { w: 5, seed: sd + 8, t, closed: true }) + ' ' + inkPath(C2.slice(5, 13), { w: 4, seed: sd + 9, t }) : '');
          }
          if (specks) specks.setAttribute('d', SPK.map((q, i) => inkCircle(q.x * W, q.y * H, q.r * u * (0.6 + 0.4 * Math.sin(t * 2.2 + q.ph)), sd + 500 + i, t, { fill: true })).join(' '));
          const aim = (P.aim ?? 0) + Math.sin(lt * 0.9) * (P.sweep ?? (mode === 'every' ? 9 : mode === 'hook' ? 3.5 : 1.5));
          const o = hn_.update(t, X, gy, S * (1 + 0.03 * hit), aim, { glow: mode === 'glow' ? 0.6 + 0.3 * Math.sin(t * 3) : mode === 'hook' ? 0.25 : 0.15 });
          const R = mode === 'every' || mode === 'glow' ? 1100 * u : 700 * u, angs = mode === 'hook' || mode === 'end' ? [-2.6, -0.6] : null;
          hs.update(t, lt, o.mouth[0], o.mouth[1], R, mode === 'end' ? 0.6 : 1, angs);
          PG.forEach((p, i) => {
            const f = p.q[0] + (mode === 'hook' ? (i % 2 ? -1 : 1) * Math.sin(lt * 1.6) * 0.06 : 0), pos = L2(o.lipA, o.lipB, Math.max(-0.15, Math.min(1.15, f)));
            p.b.update(t, pos[0], pos[1] + 2 * u, (p.q[2] ?? 1.15) * S, { face: p.q[1], peck: Math.max(0, Math.sin(t * 2.3 + i * 1.7)) ** 6, bob: 1 });
          });
          if (kas) kas.update(lt, t, cues);
          if (grass) grass.update(t, W, H, (P.grass ?? 0.82) * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ chart recorder
  function recorder(parent, sd) {
    const g = el(parent, 'g'), E = (c, x) => inkEl(g, c, x);
    const box = E(METAL_D()), boxL = E(), paper = E(INK.paperLight), grid = E(mix(INK.blue, INK.paperLight, 0.55)), trace = E(INK.red), arm = E(INK.ink), knobs = E(INK.paperLight), knobL = E();
    return {
      update(t, lt, x, y, w, amp) {
        const h = w * 0.55, P = (pts, k, ex = {}) => inkPath(pts, Object.assign({ w: 6, seed: sd + k, t, amp: 1 }, ex));
        const BX = [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y - h], [x - w / 2, y - h]];
        box.setAttribute('d', inkLoop(BX, { seed: sd + 1, t, smooth: false, amp: 1 }));
        const p0 = x - w * 0.44, p1 = x + w * 0.2, q0 = y - h * 0.88, q1 = y - h * 0.18, PP = [[p0, q0], [p1, q0], [p1, q1], [p0, q1]];
        paper.setAttribute('d', inkLoop(PP, { seed: sd + 2, t, smooth: false, amp: 0.6 }));
        const scroll = (lt * 60) % 30, GD = [];
        for (let gx = p1 - scroll; gx > p0; gx -= 30) GD.push(P([[gx, q0 + 4], [gx, q1 - 4]], 10 + Math.round(gx), { w: 2.2, amp: 0.4 }));
        for (let k = 1; k < 5; k++) { const yy = lerp(q0, q1, k / 5); GD.push(P([[p0 + 4, yy], [p1 - 4, yy]], 30 + k, { w: 2.2, amp: 0.4 })); }
        grid.setAttribute('d', GD.join(' '));
        const mid = (q0 + q1) / 2, TR = [], N = 60;
        const nz = xx => { const z = (xx + lt * 60) / 9; return (hn(Math.floor(z), 7) - 0.5) * 2; };
        for (let i = 0; i <= N; i++) { const xx = lerp(p0 + 6, p1, i / N); TR.push([xx, mid + nz(p1 - xx) * amp * (q1 - q0) * 0.42]); }
        trace.setAttribute('d', inkPath(TR, { w: 4, seed: sd + 40, t, smooth: false, amp: 0.4 }));
        const tip = TR[TR.length - 1];
        arm.setAttribute('d', P([[x + w * 0.38, mid - h * 0.05], tip], 41, { w: 7 }) + ' ' + inkCircle(tip[0], tip[1], 7, sd + 42, t, { fill: true }));
        const KN = [[x + w * 0.34, y - h * 0.75], [x + w * 0.34, y - h * 0.3]];
        knobs.setAttribute('d', KN.map((k, i) => inkCircle(k[0], k[1], w * 0.05, sd + 50 + i, t, { fill: true })).join(' '));
        knobL.setAttribute('d', KN.map((k, i) => inkCircle(k[0], k[1], w * 0.05, sd + 52 + i, t, { w: 4 }) + ' ' + P([k, [k[0] + Math.cos(t + i) * w * 0.04, k[1] + Math.sin(t + i) * w * 0.04]], 54 + i, { w: 3 })).join(' ') + ' ' + inkPath(BX, { w: 7, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath(PP, { w: 4, seed: sd + 4, t, closed: true, smooth: false }));
        return { pen: tip, paper: [(p0 + p1) / 2, mid] };
      },
    };
  }

  // ------------------------------------------------------------------ night grass (dark blades, no flowers)
  function nightGrass(parent, sd) {
    const dark = inkEl(parent, mix(INK.ink, INK.blue, 0.35)), mid = inkEl(parent, mix(INK.blue, INK.inkSoft, 0.45));
    const r0 = rng(sd), BL = Array.from({ length: 70 }, () => ({ x: r0(), h: lerp(0.5, 1, r0()), k: r0() < 0.5, ph: r0() * 6 }));
    return {
      update(t, W, H, top) {
        const D = [], M = [], u = W / 1080;
        D.push(inkLoop([[-20, top + 60 * u], [W + 20, top + 50 * u], [W + 20, H + 20], [-20, H + 20]], { seed: sd + 1, t, smooth: false, amp: 1 }));
        BL.forEach((b, i) => { const x = b.x * W, y0 = H + 10, L = (H - top + 60 * u) * b.h, sw = Math.sin(t * 1.3 + b.ph) * 14 * u; (b.k ? D : M).push(inkPath([[x - 8 * u, y0], [x + sw * 0.4, y0 - L * 0.5], [x + sw + 10 * u, y0 - L]], { w: 16 * u, seed: sd + 10 + i, t, taper: 0.9 })); });
        dark.setAttribute('d', D.join(' ')); mid.setAttribute('d', M.join(' '));
      },
    };
  }

  // a curling strip of chart paper from (x, y) down past the frame bottom, the red noise trace scrolling along it
  function paperStrip(parent, sd) {
    const sh = inkEl(parent, mix(INK.paperDark, INK.inkSoft, 0.3)), pf = inkEl(parent, INK.paperLight), grid = inkEl(parent, mix(INK.blue, INK.paperLight, 0.55)), tr = inkEl(parent, INK.red), ol = inkEl(parent);
    return {
      update(t, lt, x, y, w, H, amp) {
        const C = [[x, y], [x - w * 0.5, y + 120], [x - w * 0.1, y + 260], [x - w * 0.7, y + 420], [x - w * 1.2, H + 60]];
        const sp = []; for (let i = 0; i <= 40; i++) { const f = i / 40, k = f * (C.length - 1), j = Math.min(C.length - 2, Math.floor(k)), q = k - j; sp.push(L2(C[j], C[j + 1], q)); }
        const half = w * 0.5, Lft = [], Rgt = [], mid = [];
        sp.forEach((p, i) => { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(sp.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l; Lft.push([p[0] + nx * half, p[1] + ny * half]); Rgt.push([p[0] - nx * half, p[1] - ny * half]); mid.push([nx, ny]); });
        const poly = Lft.concat(Rgt.slice().reverse());
        sh.setAttribute('d', inkLoop(poly.map(p => [p[0] + 14, p[1] + 10]), { seed: sd + 1, t, amp: 0.8 }));
        pf.setAttribute('d', inkLoop(poly, { seed: sd + 2, t, amp: 0.8 }));
        const G = []; for (let i = 2; i < sp.length; i += 3) G.push(inkPath([Lft[i], Rgt[i]], { w: 2, seed: sd + 10 + i, t, amp: 0.3 }));
        grid.setAttribute('d', G.join(' '));
        const T = sp.map((p, i) => { const z = Math.floor(i - lt * 12); const v = (hn(z, 5) - 0.5) * 2 * amp * half * 0.8; return [p[0] + mid[i][0] * v, p[1] + mid[i][1] * v]; });
        tr.setAttribute('d', inkPath(T, { w: 4.5, seed: sd + 60, t, smooth: false, amp: 0.4 }));
        ol.setAttribute('d', inkPath(Lft, { w: 4, seed: sd + 61, t }) + ' ' + inkPath(Rgt, { w: 4, seed: sd + 62, t }));
      },
    };
  }

  // desk props: a steaming coffee mug and a spinning tape reel
  function deskProps(parent, sd) {
    const mug = inkEl(parent, INK.paperLight), mugL = inkEl(parent), steam = inkEl(parent, INK.inkSoft), reel = inkEl(parent, mix(INK.inkSoft, INK.paperDark, 0.3)), reelL = inkEl(parent), tape = inkEl(parent, mix(INK.stain, INK.ink, 0.4));
    return {
      update(t, mx, rx, y, u) {
        const M = [[mx - 48 * u, y], [mx + 48 * u, y], [mx + 52 * u, y - 120 * u], [mx - 52 * u, y - 120 * u]];
        mug.setAttribute('d', inkLoop(M, { seed: sd + 1, t, smooth: false }));
        mugL.setAttribute('d', inkPath(M, { w: 6, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + inkPath([[mx + 50 * u, y - 96 * u], [mx + 92 * u, y - 80 * u], [mx + 86 * u, y - 36 * u], [mx + 48 * u, y - 30 * u]], { w: 7, seed: sd + 3, t }));
        const S = []; for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; S.push(inkPath(Array.from({ length: 6 }, (_, j) => [mx + (i - 1) * 26 * u + Math.sin(j * 1.3 + t * 3 + i) * 12 * u, y - 140 * u - ph * 60 * u - j * 22 * u]), { w: 5 * (1 - ph) + 1, seed: sd + 10 + i, t, taper: 0.8 })); }
        steam.setAttribute('d', S.join(' '));
        const r = 95 * u, cy = y - r;
        reel.setAttribute('d', inkCircle(rx, cy, r, sd + 20, t, { fill: true }));
        tape.setAttribute('d', inkCircle(rx, cy, r * 0.75, sd + 21, t, { fill: true }));
        const SP = []; for (let i = 0; i < 3; i++) { const a = t * 2.4 + i * TAU / 3; SP.push(inkCircle(rx + Math.cos(a) * r * 0.42, cy + Math.sin(a) * r * 0.42, r * 0.16, sd + 22 + i, t, { fill: true })); }
        reelL.setAttribute('d', inkCircle(rx, cy, r, sd + 25, t, { w: 6 }) + ' ' + inkCircle(rx, cy, r * 0.22, sd + 26, t, { w: 5 }));
        tape.setAttribute('d', inkCircle(rx, cy, r * 0.75, sd + 21, t, { fill: true }) + ' ' + SP.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.cmb_room
  SH.cmb_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 331, root = el(svg, 'g'), u = W / 1080;
      const dy = (P.desk ?? 0.82) * H, RC = Object.assign({ x: 0.52, w: 460 }, P.rec || {});
      const racks = inkEl(root, METAL_D()), rackL = inkEl(root), dials = inkEl(root, INK.paperLight), dialL = inkEl(root), lamps = inkEl(root, INK.gold);
      const PX = P.px || [0.18, 0.84];
      const PE = P.people === false ? [] : [
        { p: window.LH.person(el(root, 'g'), sd + 11, { kind: 'sweater', col: mix(INK.blue, INK.paperLight, 0.45), hair: 'dark', glasses: true }), x: PX[0], face: 1 },
        { p: window.LH.person(el(root, 'g'), sd + 13, { kind: 'lab', hair: 'dark', glasses: false }), x: PX[1], face: -1 }];
      const desk = window.LH.front(el(root, 'g'), sd + 50, 'desk');
      const props = deskProps(el(root, 'g'), sd + 70);
      const strip = paperStrip(el(root, 'g'), sd + 80);
      const rec = recorder(el(root, 'g'), sd + 60);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hs = atOr(cues, 'hiss', 0.2), amp = lt < hs ? 0.15 : 0.55 + 0.25 * Math.sin(t * 7) + 0.2 * punch(lt, hs, 0.8);
          const RK = [], DL = [], DLL = [], LM = [];
          for (let i = 0; i < 4; i++) {
            const x0 = (0.02 + i * 0.25) * W, x1 = x0 + 0.22 * W, y0 = 0.16 * H, y1 = dy - 0.1 * H;
            RK.push([[x0, y1], [x1, y1], [x1, y0], [x0, y0]]);
            for (let j = 0; j < 4; j++) { const cx = lerp(x0, x1, 0.3 + (j % 2) * 0.4), cy = lerp(y0, y1, 0.12 + j * 0.2); DL.push(inkCircle(cx, cy, 26 * u, sd + 100 + i * 5 + j, t, { fill: true })); DLL.push(inkCircle(cx, cy, 26 * u, sd + 120 + i * 5 + j, t, { w: 4 }) + ' ' + inkPath([[cx, cy], [cx + Math.cos(t * 0.8 + i + j) * 20 * u, cy + Math.sin(t * 0.8 + i + j) * 20 * u]], { w: 3.5, seed: sd + 140 + i * 5 + j, t })); }
            if (Math.sin(t * 3 + i * 1.3) > -0.2) LM.push(inkCircle(lerp(x0, x1, 0.75), lerp(y0, y1, 0.92), 10 * u, sd + 160 + i, t, { fill: true }));
          }
          racks.setAttribute('d', RK.map((r, i) => inkLoop(r, { seed: sd + 170 + i, t, smooth: false, amp: 1 })).join(' '));
          rackL.setAttribute('d', RK.map((r, i) => inkPath(r, { w: 6, seed: sd + 180 + i, t, closed: true, smooth: false })).join(' '));
          dials.setAttribute('d', DL.join(' ')); dialL.setAttribute('d', DLL.join(' ')); lamps.setAttribute('d', LM.join(' '));
          const ps = (P.ps ?? 1.35) * u, hip = dy - 0.12 * H, gy = hip + 190 * ps;
          PE.forEach((q, i) => {
            const x = q.x * W;
            q.p.update(t, x, gy, ps, { face: q.face, lean: 10 + Math.sin(t * 0.7 + i) * 2, brow: lt > hs ? 0.8 : 0, look: [4, 8], armR: i === 0 ? [RC.x * W - RC.w * u * 0.35, dy - 120 * u + Math.sin(t * 2) * 6] : null, armL: i === 1 ? [x - 170 * ps, hip - 330 * u] : null, mouth: lt > hs && i === 1 ? 0.6 : 0 });
          });
          desk.update(t, W, H, dy);
          props.update(t, 0.13 * W, 0.87 * W, dy + 10 * u, u);
          strip.update(t, lt, RC.x * W - RC.w * u * 0.18, dy - 4 * u, RC.w * u * 0.42, H, amp);
          rec.update(t, lt, RC.x * W, dy + 6 * u, RC.w * u, amp);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.cmb_inside
  SH.cmb_inside = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 457, root = el(svg, 'g'), u = W / 1080;
      const VP = [(P.vp ?? [0.5, 0.3])[0] * W, (P.vp ?? [0.5, 0.3])[1] * H], NS = [(P.nest ?? [0.46, 0.55])[0] * W, (P.nest ?? [0.46, 0.55])[1] * H];
      const walls = [inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.35)), inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.15)), inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.25)), inkEl(root, mix(INK.paperLight, INK.paperDark, 0.5))];
      const far = inkEl(root, INK.ink), cor = inkEl(root, INK.inkSoft), edges = inkEl(root);
      const nest = inkEl(root, mix(INK.stain, INK.gold, 0.3)), nestL = inkEl(root, mix(INK.stain, INK.ink, 0.4));
      const drop = inkEl(root, INK.paperLight), dropL = inkEl(root, mix(INK.inkSoft, INK.paperLight, 0.2));
      const birds = [0, 1].map(i => pigeon(el(root, 'g'), sd + 200 + i * 30));
      const handle = inkEl(root, mix(INK.stain, INK.ink, 0.25)), handleL = inkEl(root), bristle = inkEl(root, INK.gold), bristL = inkEl(root), band = inkEl(root, INK.red);
      const LB = labels(root, P.labels, W, H);
      const r0 = rng(sd + 3), DR = [];
      for (let i = 0; i < 30; i++) { const y = i < 8 ? lerp(0.55, 0.62, r0()) : lerp(0.66, 0.89, r0()), fy = clamp01((y * H - VP[1]) / (H - VP[1])), half = lerp(90 * u, W * 0.62, fy); DR.push({ x: W / 2 + (r0() * 2 - 1) * half * 0.85, y: y * H, r: lerp(12, 26, r0()) * u * (0.6 + fy), a: r0() * TAU, k: r0() }); }
      const splat = (q, dx) => { const pts = []; for (let j = 0; j < 9; j++) { const a = j / 9 * TAU, rr = q.r * (0.6 + 0.6 * hn(q.k * 50 + j, 2)); pts.push([q.x + dx + Math.cos(a) * rr * 1.3, q.y + Math.sin(a) * rr * 0.7]); } return pts; };
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, cl = atOr(cues, 'clean', dur * 0.5), hit = punch(lt, atOr(cues, 'hit', null));
          const fw = 90 * u, fh = 90 * u, F = [[VP[0] - fw, VP[1] - fh], [VP[0] + fw, VP[1] - fh], [VP[0] + fw, VP[1] + fh], [VP[0] - fw, VP[1] + fh]];
          const C = [[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]];
          const WL = [[C[0], C[1], F[1], F[0]], [C[1], C[2], F[2], F[1]], [C[3], C[0], F[0], F[3]], [C[2], C[3], F[3], F[2]]];
          WL.forEach((q, i) => walls[i].setAttribute('d', inkLoop(q, { seed: sd + 10 + i, t, smooth: false, amp: 1 })));
          far.setAttribute('d', inkLoop(F, { seed: sd + 20, t, smooth: false, amp: 0.6 }));
          const CR = []; for (let k = 0; k < 7; k++) { const f = ((k + lt * 0.12) % 7) / 7, e = f * f; const R = F.map((p, j) => L2(p, C[j], e)); CR.push(inkPath(R, { w: 2 + 6 * e, seed: sd + 30 + k, t, closed: true, smooth: false, amp: 0.8 })); }
          cor.setAttribute('d', CR.join(' '));
          edges.setAttribute('d', [0, 1, 2, 3].map(j => inkPath([F[j], C[j]], { w: 6, seed: sd + 40 + j, t, smooth: false })).join(' ') + ' ' + inkPath(F, { w: 6, seed: sd + 45, t, closed: true, smooth: false }));
          const NE = ellP(NS[0], NS[1], 190 * u, 50 * u, 16);
          nest.setAttribute('d', inkLoop(NE, { seed: sd + 50, t, amp: 2 }));
          const TW = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI, x = NS[0] + Math.cos(a + 0.2) * 180 * u, y = NS[1] + Math.sin(a) * 30 * u; TW.push(inkPath([[x - 50 * u, y - 8 * u], [x + 50 * u, y + 6 * u]], { w: 4, seed: sd + 60 + i, t, amp: 1 })); }
          nestL.setAttribute('d', TW.join(' ') + ' ' + inkPath(NE, { w: 5, seed: sd + 59, t, closed: true }));
          // broom: sweeps from the right to the left across the lower floor in back-and-forth strokes
          const sw = progIO(lt, cl, Math.max(1, (dur - cl) * 0.9)), on = lt > cl - 0.15;
          const front = lerp(0.88 * W, 0.16 * W, sw), stroke = Math.sin(Math.max(0, lt - cl) * 7) * 70 * u * (sw < 1 ? 1 : 0.3);
          const bx = front + 150 * u + stroke, by = 1530 * u * (H / 1920 / u) + Math.sin(lt * 7) * 12 * u;
          const DD = [], DL = [];
          DR.forEach((q, i) => {
            let dx = 0;
            if (on && q.y > 1260 * H / 1920 && q.x > front) dx = (front - 30 * u - (i % 5) * 18 * u) - q.x;
            const p = splat(q, dx); DD.push(inkLoop(p, { seed: sd + 300 + i, t, amp: 0.8 }));
            DL.push(inkPath(p, { w: 3, seed: sd + 330 + i, t, closed: true }) + ' ' + inkPath([[q.x + dx - q.r * 1.1, q.y - q.r * 0.2], [q.x + dx - q.r * 2.1, q.y + q.r * 0.25]], { w: q.r * 0.45, seed: sd + 360 + i, t, taper: 0.8 }));
          });
          drop.setAttribute('d', DD.join(' ')); dropL.setAttribute('d', DL.join(' '));
          if (on) {
            const hw = 160 * u, HD = [[bx - hw, by - 50 * u], [bx + hw, by - 50 * u], [bx + hw * 1.15, by + 70 * u], [bx - hw * 1.15, by + 70 * u]], top = [bx + 40 * u, by - 50 * u], end = [bx + 420 * u, by - 640 * u];
            handle.setAttribute('d', inkPath([top, end], { w: 26 * u, seed: sd + 400, t, taper: 0 }));
            handleL.setAttribute('d', inkPath([top, end].map(p => [p[0] - 10 * u, p[1]]), { w: 4, seed: sd + 401, t }));
            bristle.setAttribute('d', inkLoop(HD, { seed: sd + 402, t, smooth: false }));
            const BL = []; for (let i = 0; i < 13; i++) { const f = i / 12; BL.push(inkPath([L2(HD[0], HD[1], f), L2(HD[3], HD[2], f)], { w: 3, seed: sd + 410 + i, t })); }
            bristL.setAttribute('d', BL.join(' ') + ' ' + inkPath(HD, { w: 6, seed: sd + 403, t, closed: true, smooth: false }));
            band.setAttribute('d', inkLoop([[bx - hw, by - 50 * u], [bx + hw, by - 50 * u], [bx + hw, by - 28 * u], [bx - hw, by - 28 * u]], { seed: sd + 404, t, smooth: false }));
          } else [handle, handleL, bristle, bristL, band].forEach(e => e.setAttribute('d', ''));
          // birds: sit and peck, then flap up and out of the frame top over ~1.6 s
          birds.forEach((b, i) => {
            const st = cl + 0.15 + i * 0.3, up = progIO(lt, st, 1.7), sx = NS[0] + (i ? 90 : -80) * u, sy = NS[1] - 10 * u;
            const x = sx + up * (i ? 360 : -380) * u + Math.sin(up * 9) * 20 * u, y = sy - up * 1250 * u;
            b.update(t, x, y, (1.55 + up * 0.9) * u * (1 + 0.05 * hit), { face: i ? -1 : 1, flap: lt > st - 0.1 ? 1 : 0, fly: up > 0.03, peck: lt < st ? Math.max(0, Math.sin(t * 2 + i * 2)) ** 6 : 0 });
          });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ rotary phone
  function phone(parent, sd) {
    const g = el(parent, 'g'), cord = inkEl(g, INK.ink), base = inkEl(g, INK.ink), dial = inkEl(g, INK.paperLight), holes = inkEl(g, INK.ink), hand = inkEl(g, mix(INK.ink, INK.inkSoft, 0.15)), hcord = inkEl(g, INK.ink), rings = inkEl(g, INK.red);
    return {
      update(t, x, y, s, o = {}) {
        const rg = o.ring || 0, jump = rg ? Math.abs(Math.sin(t * 28)) * 14 * s * rg : 0, shake = rg ? Math.sin(t * 40) * 4 * s : 0;
        const B = [[x - 110 * s + shake, y], [x + 110 * s + shake, y], [x + 80 * s + shake, y - 110 * s], [x - 80 * s + shake, y - 110 * s]];
        base.setAttribute('d', inkLoop(B, { seed: sd + 1, t, amp: 1 }));
        dial.setAttribute('d', inkCircle(x + shake, y - 52 * s, 44 * s, sd + 2, t, { fill: true }));
        const HL = []; for (let i = 0; i < 10; i++) { const a = -2.4 + i * 0.5; HL.push(inkCircle(x + shake + Math.cos(a) * 30 * s, y - 52 * s + Math.sin(a) * 30 * s, 6 * s, sd + 10 + i, t, { fill: true })); }
        holes.setAttribute('d', HL.join(' '));
        const hy = y - 120 * s - jump, hx = x, rot = rg ? Math.sin(t * 28) * 0.05 : 0;
        const HS = [[-130, 0], [-120, -30], [-70, -14], [70, -14], [120, -30], [130, 0], [100, 14], [-100, 14]].map(p => [hx + (p[0] * Math.cos(rot) - p[1] * Math.sin(rot)) * s, hy + (p[0] * Math.sin(rot) + p[1] * Math.cos(rot)) * s]);
        hand.setAttribute('d', inkLoop(HS, { seed: sd + 30, t, amp: 1 }));
        hcord.setAttribute('d', inkPath(Array.from({ length: 16 }, (_, i) => { const f = i / 15; return [lerp(x + 100 * s, hx + 128 * s, f) + Math.sin(f * 30) * 9 * s, lerp(y - 30 * s, hy + 10 * s, f) + 30 * s * Math.sin(f * Math.PI)]; }), { w: 4, seed: sd + 31, t }));
        cord.setAttribute('d', o.cordTo ? inkPath([[x - 100 * s, y - 10 * s], [x - 170 * s, y + 20 * s], [lerp(x - 170 * s, o.cordTo[0], 0.5), lerp(y, o.cordTo[1], 0.6)], o.cordTo], { w: 7, seed: sd + 32, t }) : '');
        const RG = []; if (rg) for (let k = 0; k < 3; k++) { const ph = (t * 2 + k / 3) % 1; [-1, 1].forEach(sg => RG.push(inkPath(Array.from({ length: 6 }, (_, j) => { const a = -Math.PI / 2 + sg * (0.5 + j * 0.12); return [x + Math.cos(a) * (150 + ph * 120) * s, y - 70 * s + Math.sin(a) * (150 + ph * 120) * s]; }), { w: 7 * (1 - ph) + 1, seed: sd + 40 + k * 2 + (sg > 0 ? 1 : 0), t }))); }
        rings.setAttribute('d', RG.join(' '));
      },
    };
  }

  // two wooden chair backs cropped by the frame bottom
  function chairs(parent, sd) {
    const f = inkEl(parent, mix(INK.stain, INK.ink, 0.3)), l = inkEl(parent);
    return {
      update(t, W, H, xs, top, u) {
        const F = [], Lq = [];
        xs.forEach((cx, i) => {
          const x = cx * W, w = 300 * u, rail = [[x - w / 2, top], [x + w / 2, top - 10 * u], [x + w / 2, top + 60 * u], [x - w / 2, top + 70 * u]];
          F.push(inkLoop(rail, { seed: sd + i * 10, t, smooth: false }));
          [-1, 1].forEach((sg, j) => { const P2 = [[x + sg * w * 0.45 - 18 * u, top + 30 * u], [x + sg * w * 0.45 + 18 * u, top + 30 * u], [x + sg * w * 0.45 + 18 * u, H + 20], [x + sg * w * 0.45 - 18 * u, H + 20]]; F.push(inkLoop(P2, { seed: sd + i * 10 + 1 + j, t, smooth: false })); Lq.push(inkPath(P2, { w: 5, seed: sd + i * 10 + 3 + j, t, closed: true, smooth: false })); });
          for (let k = -1; k <= 1; k++) Lq.push(inkPath([[x + k * w * 0.2, top + 70 * u], [x + k * w * 0.2, H + 20]], { w: 10 * u, seed: sd + i * 10 + 6 + k, t }));
          Lq.push(inkPath(rail, { w: 6, seed: sd + i * 10 + 9, t, closed: true, smooth: false }));
        });
        f.setAttribute('d', F.join(' ')); l.setAttribute('d', Lq.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ SHOTS.cmb_dicke
  SH.cmb_dicke = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 577, root = el(svg, 'g'), u = W / 1080, mode = P.mode || 'ring';
      const dy = (P.desk ?? (mode === 'ring' ? 0.86 : 0.78)) * H, PH = Object.assign({ x: mode === 'ring' ? 0.66 : 0.22, s: mode === 'ring' ? 1.7 : 1.3 }, P.phone || {});
      const board = inkEl(root, mix(INK.green, INK.ink, 0.55)), frame = inkEl(root, mix(INK.stain, INK.ink, 0.25)), chalk = inkEl(root, INK.paperLight);
      const team = mode === 'scooped' ? [
        { p: window.LH.person(el(root, 'g'), sd + 11, { kind: 'sweater', col: mix(INK.paperDark, INK.stain, 0.3), hair: 'dark', glasses: true }), x: 0.4, face: 1, dicke: true },
        { p: window.LH.person(el(root, 'g'), sd + 13, { kind: 'sweater', col: mix(INK.blue, INK.paperLight, 0.4), hair: 'dark', glasses: false }), x: 0.66, face: -1 },
        { p: window.LH.person(el(root, 'g'), sd + 15, { kind: 'lab', hair: 'dark', glasses: true }), x: 0.88, face: -1 }] : [];
      const desk = window.LH.front(el(root, 'g'), sd + 50, 'desk');
      const ph = phone(el(root, 'g'), sd + 90);
      const ch = mode === 'scooped' ? chairs(el(root, 'g'), sd + 120) : null;
      const KG = el(root, 'g'), kas = P.kasif ? window.LH.kasif(KG, P.kasif, W, H, sd + 70) : null;
      const LB = labels(root, P.labels, W, H);
      const r0 = rng(sd + 3), EQ = Array.from({ length: 14 }, (_, i) => ({ x: lerp(0.12, 0.8, (i % 4) / 3 + r0() * 0.05), y: lerp(0.12, 0.36, Math.floor(i / 4) / 3), n: 4 + Math.floor(r0() * 5) }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null)), sc = atOr(cues, 'scooped', dur * 0.6), bo = atOr(cues, 'b', sc - 0.6);
          const BD = [[0.06 * W, 0.08 * H], [0.94 * W, 0.08 * H], [0.94 * W, 0.4 * H], [0.06 * W, 0.4 * H]];
          board.setAttribute('d', inkLoop(BD, { seed: sd + 1, t, smooth: false, amp: 1 }));
          frame.setAttribute('d', inkPath(BD, { w: 16 * u, seed: sd + 2, t, closed: true, smooth: false }));
          const CH = [];
          EQ.forEach((q, i) => { const x0 = q.x * W, y0 = q.y * H; let x = x0; for (let j = 0; j < q.n; j++) { const w = (18 + hn(i, j) * 26) * u; CH.push(inkPath([[x, y0 + 10 * u], [x + w * 0.5, y0 - 16 * u * hn(j, i)], [x + w, y0 + 6 * u]], { w: 4, seed: sd + 10 + i * 10 + j, t, amp: 1 })); x += w + 10 * u; } });
          CH.push(inkCircle(0.84 * W, 0.22 * H, 48 * u, sd + 301, t, { w: 4 }));
          chalk.setAttribute('d', CH.join(' '));
          const ps = 1.3 * u, hip = 0.672 * H, gy = hip + 190 * ps;
          team.forEach((q, i) => {
            const x = q.x * W;
            let pose = { face: q.face, lean: 4, look: [0, 2], brow: lt > bo ? 1 : 0.2, mouth: lt > bo ? 1 : 0 };
            if (q.dicke) {
              const turn = lt > Math.min(bo - 0.3, dur * 0.35);
              pose = { face: turn ? 1 : -1, lean: 4, look: [2, 0], brow: lt > bo ? 0.8 : 0.3, mouth: lt > bo ? 0.7 : 0,
                armL: turn ? null : [PH.x * W + 80 * u, dy - 140 * u], armR: turn ? [x + 230 * ps, hip - 150 * ps + Math.sin(t * 5) * 8 * u] : null };
            }
            q.p.update(t, x, gy, ps, pose);
          });
          desk.update(t, W, H, dy);
          ph.update(t, PH.x * W, dy + 6 * u, PH.s * u * (1 + 0.06 * hit), { ring: mode === 'ring' ? 1 : 0, cordTo: [PH.x * W - 120 * u, H + 30] });
          if (ch) ch.update(t, W, H, [0.28, 0.76], 0.9 * H, u);
          if (kas) kas.update(lt, t, cues);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.cmb_map
  SH.cmb_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 683, root = el(svg, 'g'), u = W / 1080;
      const gy = (P.gy ?? 0.78) * H, OV = Object.assign({ x: 0.5, y: 0.36, rx: 480, ry: 250 }, P.oval || {});
      const cx = OV.x * W, cy = OV.y * H, rx = OV.rx * u, ry = OV.ry * u;
      const st = window.TD.stars(el(root, 'g'), sd + 1, W, H, 40, 0.02, 0.7);
      const fill = inkEl(root, mix(INK.gold, INK.paperLight, 0.45));
      const cols = [INK.red, INK.gold, INK.blue, mix(INK.red, INK.gold, 0.5), mix(INK.blue, INK.paperLight, 0.4)];
      const layers = cols.map(c => inkEl(root, c, { 'fill-opacity': 0.85 }));
      const ring = inkEl(root), beams = inkEl(root, INK.gold);
      const hn_ = horn(el(root, 'g'), sd + 100);
      const grass = P.grass === false ? null : nightGrass(el(root, 'g'), sd + 90);
      const LB = labels(root, P.labels, W, H);
      const r0 = rng(sd + 7), BL = [];
      for (let i = 0; i < 150; i++) { const a = r0() * TAU, rr = Math.sqrt(r0()); BL.push({ x: Math.cos(a) * rr * 0.92, y: Math.sin(a) * rr * 0.9, r: lerp(18, 52, r0()), c: Math.floor(r0() * cols.length), ph: r0() * 6, d: rr }); }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, rv = atOr(cues, 'reveal', 0.1), k = progIO(lt, rv, Math.max(0.8, dur * 0.55)), hit = punch(lt, atOr(cues, 'hit', null));
          st.update(t * 2);
          const OP = ellP(cx, cy, rx * (1 + 0.02 * hit), ry * (1 + 0.02 * hit), 36);
          fill.setAttribute('d', inkLoop(OP, { seed: sd + 2, t, amp: 1 }));
          const parts = cols.map(() => []);
          BL.forEach((b, i) => { if (b.d > k * 1.05) return; const g = clamp01((k * 1.05 - b.d) * 6); parts[b.c].push(inkCircle(cx + b.x * rx, cy + b.y * ry, b.r * u * g * (0.85 + 0.15 * Math.sin(t * 1.6 + b.ph)), sd + 20 + i, t, { fill: true, ry: b.r * u * g * 0.7 })); });
          layers.forEach((l, i) => l.setAttribute('d', parts[i].join(' ')));
          ring.setAttribute('d', inkPath(OP, { w: 8, seed: sd + 3, t, closed: true, amp: 1 }));
          const o = hn_.update(t, (P.hx ?? 0.36) * W, gy, (P.hs ?? 0.55) * u, 4 + Math.sin(lt * 0.8) * 2, { glow: 0.5 + 0.3 * Math.sin(t * 3) });
          const BM = []; for (let i = 0; i < 4; i++) { const f = ((lt * 0.4) + i / 4) % 1, p = L2([cx + (i - 1.5) * 120 * u, cy + ry * 0.95], o.mouth, f); BM.push(inkPath([[p[0] - 30 * u, p[1]], [p[0] - 10 * u, p[1] - 10 * u], [p[0] + 10 * u, p[1] + 10 * u], [p[0] + 30 * u, p[1]]], { w: 6 * (1 - f) + 2, seed: sd + 400 + i, t, smooth: false })); }
          beams.setAttribute('d', k > 0.2 ? BM.join(' ') : '');
          if (grass) grass.update(t, W, H, (P.grass ?? 0.93) * H);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
