// hmd_halic: the Hamidiye comes home to İstanbul (September 1913), parchment ink style (brand/kit/BRAND.md §3, §5; boils
// at 8 Hz, pure function of (seed, lt)). Across the water the old city's skyline: a great mosque with four minarets on
// its hill, smaller domes, houses down to the shore and, on the far right, the Galata Tower. The cruiser steams in
// (three funnels, smoke, red crescent ensign) with rowing boats (kayık) around her. Modes:
//   crowd: a crowd seen from behind fills the bottom of the frame (heads, shoulders, raised arms) waving red crescent
//          flags and handkerchiefs; on `cheer` every arm goes up at once and the flags punch.
//   end:   the cruiser at anchor; Kaşif stands on the quay (P.kasif) and points at her, then waves on his cue; a few
//          backs of heads along the bottom edge.
// Leaves the sky to the scene's "set" (city / hills); water line ≈ P.water.
// P: {mode: "crowd"|"end", water: 0.44 (0..1 H), quay: 0.66|0.7 (quay edge, 0..1 H), ship: {x, to, y, s, face}, boats: 3, crowd: {top: 0.66, n: 7},
//     kasif: {x, y, scale, pose, face, dir, seq} | false, label: {text, x, y, at, size, color}}
// cues: cheer (crowd), kasif seq names, label.at. Needs hmd__lib.js (HMD).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  function skyline(parent, seed) {
    const g = el(parent, 'g');
    const hill = inkEl(g, mix(INK.green, INK.paper, 0.5)), houses = inkEl(g, mix(INK.paperLight, INK.stain, 0.25)), housesR = inkEl(g, INK.inkSoft), mosque = inkEl(g, mix(INK.paperDark, INK.blue, 0.2)), mosqueR = inkEl(g), tower = inkEl(g, mix(INK.paperDark, INK.stain, 0.3)), towerR = inkEl(g), roof = inkEl(g, mix(INK.inkSoft, INK.blue, 0.3));
    function update(t, W, base, s) {
      const k = seed * 23;
      const hp = [[-30, base], [-30, base - 120 * s], [0.12 * W, base - 170 * s], [0.34 * W, base - 230 * s], [0.52 * W, base - 210 * s], [0.68 * W, base - 140 * s], [0.78 * W, base - 90 * s], [0.8 * W, base]];
      hill.setAttribute('d', inkLoop(hp, { seed: k + 1, t, amp: 1 }));
      const HS = [], HR = [];
      const rr = rng(seed * 5 + 1);
      for (let i = 0; i < 26; i++) {
        const x = rr() * 0.8 * W - 20, hy = lerp(base - 20 * s, base - 160 * s * (1 - Math.abs(x / W - 0.36) * 1.6), rr()), w = (30 + rr() * 30) * s, h = (24 + rr() * 26) * s;
        if (hy > base - 8) continue;
        const p = [[x, hy], [x + w, hy], [x + w, hy - h], [x + w / 2, hy - h - 14 * s], [x, hy - h]];
        HS.push(inkLoop(p, { seed: k + 10 + i, t, smooth: false, amp: 0.6 })); HR.push(inkPath(p, { w: 2.5, seed: k + 40 + i, t, closed: true, smooth: false }));
      }
      houses.setAttribute('d', HS.join(' ')); housesR.setAttribute('d', HR.join(' '));
      // the great mosque on the hill: main dome, half domes, four minarets
      const mx = 0.34 * W, my = base - 225 * s, r = 80 * s;
      const M = [], MR = [];
      const body = [[mx - 150 * s, my], [mx + 150 * s, my], [mx + 150 * s, my - 60 * s], [mx - 150 * s, my - 60 * s]];
      M.push(inkLoop(body, { seed: k + 80, t, smooth: false })); MR.push(inkPath(body, { w: 4, seed: k + 81, t, closed: true, smooth: false }));
      const domeAt = (cx, cy, rr2, sd2) => { const d = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * i / 12; d.push([cx + Math.cos(a) * rr2, cy - Math.sin(a) * rr2 * 0.9]); } M.push(inkLoop(d, { seed: sd2, t, amp: 0.6 })); MR.push(inkPath(d, { w: 4, seed: sd2 + 1, t, amp: 0.6 })); };
      domeAt(mx - 110 * s, my - 60 * s, 34 * s, k + 82); domeAt(mx + 110 * s, my - 60 * s, 34 * s, k + 84);
      domeAt(mx, my - 60 * s, r, k + 86);
      MR.push(inkPath([[mx, my - 60 * s - r * 0.9], [mx, my - 60 * s - r * 1.3]], { w: 4, seed: k + 88, t }));
      [-185, -160, 160, 185].map(v => v * s).forEach((dx, i) => {
        const h = (i === 1 || i === 2 ? 230 : 190) * s, x = mx + dx;
        const p = [[x - 9 * s, my + 4], [x + 9 * s, my + 4], [x + 9 * s, my - h], [x, my - h - 40 * s], [x - 9 * s, my - h]];
        M.push(inkLoop(p, { seed: k + 90 + i, t, smooth: false, amp: 0.5 })); MR.push(inkPath(p, { w: 3.5, seed: k + 95 + i, t, closed: true, smooth: false }) + ' ' + inkPath([[x - 15 * s, my - h * 0.7], [x + 15 * s, my - h * 0.7]], { w: 4, seed: k + 100 + i, t }));
      });
      mosque.setAttribute('d', M.join(' ')); mosqueR.setAttribute('d', MR.join(' '));
      // Galata Tower on the far right shore
      const gx = 0.9 * W, gb = base, gh = 300 * s, gw = 44 * s;
      const tp = [[gx - gw, gb], [gx + gw, gb], [gx + gw * 0.85, gb - gh], [gx - gw * 0.85, gb - gh]];
      tower.setAttribute('d', inkLoop(tp, { seed: k + 110, t, smooth: false }) + ' ' + inkLoop([[0.82 * W, gb], [W + 30, gb], [W + 30, gb - 80 * s], [0.84 * W, gb - 50 * s]], { seed: k + 111, t, amp: 1 }));
      roof.setAttribute('d', inkLoop([[gx - gw, gb - gh], [gx + gw, gb - gh], [gx, gb - gh - 110 * s]], { seed: k + 112, t, smooth: false }));
      const TR = [inkPath(tp, { w: 4.5, seed: k + 113, t, closed: true, smooth: false }), inkPath([[gx - gw, gb - gh], [gx + gw, gb - gh], [gx, gb - gh - 110 * s]], { w: 4, seed: k + 114, t, closed: true, smooth: false })];
      for (let j = 0; j < 3; j++) TR.push(inkPath([[gx - 6 * s, gb - gh * (0.3 + j * 0.2)], [gx + 6 * s, gb - gh * (0.3 + j * 0.2)]], { w: 8 * s, seed: k + 115 + j, t }));
      towerR.setAttribute('d', TR.join(' '));
    }
    return { g, update };
  }
  function kayik(parent, seed) {
    const g = el(parent, 'g');
    const hull = inkEl(g, mix(INK.stain, INK.red, 0.25)), hullR = inkEl(g), oars = inkEl(g), man = inkEl(g, INK.inkSoft), head = inkEl(g, INK.paperDark), headR = inkEl(g);
    function update(t, x, y, s, face = 1) {
      const k = seed * 9, b = Math.sin(t * 1.6 + seed) * 3 * s;
      const hp = [[x - 90 * s * face, y - 22 * s + b], [x + 100 * s * face, y - 30 * s + b], [x + 70 * s * face, y + 6 * s + b], [x - 70 * s * face, y + 6 * s + b]];
      hull.setAttribute('d', inkLoop(hp, { seed: k + 1, t, amp: 0.8 }));
      hullR.setAttribute('d', inkPath(hp, { w: 4, seed: k + 2, t, closed: true, amp: 0.8 }));
      const ph = Math.sin(t * 3.2 + seed);
      const sh = [x, y - 70 * s + b];
      oars.setAttribute('d', inkPath([[sh[0] + 10 * s * face, sh[1] + 20 * s], [x + (60 + ph * 50) * s * face, y + 20 * s]], { w: 5 * s + 1, seed: k + 3, t }) + ' ' + inkPath([[x + (60 + ph * 50) * s * face, y + 20 * s], [x + (75 + ph * 50) * s * face, y + 24 * s]], { w: 14 * s, seed: k + 4, t }));
      man.setAttribute('d', inkLoop([[sh[0] - 22 * s, y - 24 * s + b], [sh[0] + 22 * s, y - 24 * s + b], [sh[0] + 18 * s, sh[1]], [sh[0] - 18 * s, sh[1]]], { seed: k + 5, t, smooth: false }));
      head.setAttribute('d', inkCircle(sh[0], sh[1] - 22 * s, 22 * s, k + 6, t, { fill: true }));
      headR.setAttribute('d', inkCircle(sh[0], sh[1] - 22 * s, 22 * s, k + 7, t, { w: 3.5 }));
    }
    return { g, update };
  }
  function crowd(parent, seed, n) {
    const g = el(parent, 'g');
    const P = (fill, extra) => inkEl(g, fill, extra);
    const backs = P(mix(INK.inkSoft, INK.paperDark, 0.3)), backs2 = P(mix(INK.blue, INK.inkSoft, 0.5)), arms = P(mix(INK.inkSoft, INK.paperDark, 0.15)), hands = P(INK.paperDark), heads = P(mix(INK.ink, INK.inkSoft, 0.15)), outl = P(), hank = P(INK.paperLight), hankR = P(), poles = P(INK.ink);
    const flags = Array.from({ length: 4 }, (_, i) => HMD.flag(g, seed * 11 + i * 7));
    const r0 = rng(inkHash(seed, 3)), J = Array.from({ length: 60 }, () => r0());
    function update(t, lt, W, H, top, cheer) {
      const k = seed * 50, S1 = [], S2 = [], A = [], Hn = [], Hd = [], O = [], HK = [], HKR = [], PL = [], FL = [];
      const ch = cheer != null && lt >= cheer ? 1 : 0, cp = punch(lt, cheer, 0.8);
      for (let i = 0; i < n; i++) {
        const row = i % 2, x = ((i + 0.5) / n) * W + (J[i] - 0.5) * 40, rr = (row ? 70 : 82) * (W / 1080), y = top + (row ? 60 : 0) * (W / 1080) + J[i + 10] * 30 + Math.sin(t * 2.2 + i * 1.3) * 5;
        const sh = [[x - rr * 2.2, H + 40], [x - rr * 2, y + rr * 1.5], [x - rr, y + rr * 1.05], [x + rr, y + rr * 1.05], [x + rr * 2, y + rr * 1.5], [x + rr * 2.2, H + 40]];
        (i % 3 === 1 ? S2 : S1).push(inkLoop(sh, { seed: k + i, t }));
        O.push(inkPath(sh.slice(1, 5), { w: 5, seed: k + 20 + i, t }));
        Hd.push(inkCircle(x, y, rr * 0.9, k + 40 + i, t, { fill: true }));
        O.push(inkCircle(x, y, rr * 0.9, k + 60 + i, t, { w: 5 }));
        // one arm up, waving (two arms at the cheer)
        const wv = Math.sin(t * (5 + J[i + 20] * 2) + i * 2), up = ch ? 1 : (i % 2 ? 1 : 0.65);
        const armsN = ch ? 2 : 1;
        for (let a = 0; a < armsN; a++) {
          const sg = a ? -1 : 1, s0 = [x + sg * rr * 1.1, y + rr * 1.2], hx = x + sg * rr * (1.6 + wv * 0.35), hy = y - rr * (2.6 * up + cp * 0.6);
          A.push(inkPath([s0, [x + sg * rr * 1.9, y - rr * 0.3], [hx, hy]], { w: 26 * (W / 1080), seed: k + 80 + i * 2 + a, t }));
          Hn.push(inkDot(hx, hy, 15 * (W / 1080), 15 * (W / 1080), k + 120 + i * 2 + a, t));
          const fi = (i + a) % 3;
          if (fi === 0 && FL.length < flags.length) { PL.push(inkPath([[hx, hy + 20], [hx, hy - rr * 1.5]], { w: 6, seed: k + 160 + i, t })); FL.push([hx, hy - rr * 1.5, rr]); }
          else if (fi === 1) { const hk = [[hx, hy - 10], [hx + sg * rr * (0.9 + wv * 0.2), hy - rr * 0.5 + wv * 10], [hx + sg * rr * 0.7, hy + rr * 0.3], [hx + 4, hy + 8]]; HK.push(inkLoop(hk, { seed: k + 180 + i * 2 + a, t })); HKR.push(inkPath(hk, { w: 3.5, seed: k + 200 + i * 2 + a, t, closed: true })); }
        }
      }
      backs.setAttribute('d', S1.join(' ')); backs2.setAttribute('d', S2.join(' ')); arms.setAttribute('d', A.join(' ')); hands.setAttribute('d', Hn.join(' '));
      heads.setAttribute('d', Hd.join(' ')); outl.setAttribute('d', O.join(' ')); hank.setAttribute('d', HK.join(' ')); hankR.setAttribute('d', HKR.join(' ')); poles.setAttribute('d', PL.join(' '));
      flags.forEach((f, i) => { const q = FL[i]; if (!q) { f.update(t, 0, 0, 0, 0); return; } const sz = q[2] * (0.95 + cp * 0.3); f.update(t, q[0], q[1], sz * 1.5, sz, 'tr', -1); });
    }
    return { g, update };
  }
  SH.hmd_halic = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.HMD, sd = seed * 1000 + 733, mode = P.mode || 'crowd', u = W / 1080;
      const root = el(svg, 'g');
      const wy = (P.water ?? 0.44) * H;
      const sky = skyline(el(root, 'g'), sd + 1);
      const sea = M.sea(el(root, 'g'), sd + 2);
      const sp = Object.assign(mode === 'crowd' ? { x: 0.3, to: 0.5, y: 0.555, s: 0.85, face: 1 } : { x: 0.58, to: 0.6, y: 0.53, s: 0.82, face: -1 }, P.ship || {});
      const ship = M.cruiser(el(root, 'g'), sd + 10, { funnels: 3, flag: 'tr' });
      const nb = P.boats ?? 3;
      const boats = Array.from({ length: nb }, (_, i) => kayik(el(root, 'g'), sd + 20 + i * 3));
      const quayG = el(root, 'g');
      const quayF = inkEl(quayG, mix(INK.gold, INK.paperLight, 0.45)), quayL = inkEl(quayG, INK.inkSoft);
      const kas = P.kasif ? M.kasif(el(root, 'g'), Object.assign({ x: 0.28, y: 0.7, scale: 1.0, pose: 'point', face: 1, dir: 'forward' }, P.kasif), W, H, seed) : null;
      const cr = Object.assign(mode === 'crowd' ? { top: 0.73, n: 7 } : { top: 0.9, n: 6 }, P.crowd || {});
      const people = crowd(el(root, 'g'), sd + 40, cr.n);
      const lab = P.label ? M.label(root, P.label, W, H) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          sky.update(t, W, wy + 4, u);
          sea.update(t, W, H, wy, { rows: 8, near: false });
          const pr = progIO(lt, 0, dur + 0.5), sx = lerp(sp.x, sp.to ?? sp.x, pr) * W;
          ship.update(t, sx, sp.y * H, sp.s * u, { face: sp.face, smoke: 0.55, lights: 0, wake: mode === 'crowd' ? 0.7 : 0.1 });
          const BP = mode === 'crowd' ? [[0.12, 0.6], [0.74, 0.585], [0.9, 0.61]] : [[0.16, 0.6], [0.88, 0.59], [0.4, 0.61]];
          boats.forEach((b, i) => { const p = BP[i % BP.length]; b.update(t, (p[0] + Math.sin(t * 0.3 + i) * 0.01) * W + (mode === 'crowd' ? lt * 14 * u : 0), p[1] * H, 0.8 * u, i % 2 ? -1 : 1); });
          // quay stones under the crowd / Kaşif
          const qy = (P.quay ?? (mode === 'crowd' ? 0.66 : 0.7)) * H;
          quayF.setAttribute('d', inkLoop([[-30, qy], [W + 30, qy], [W + 30, H + 30], [-30, H + 30]], { seed: sd + 60, t, smooth: false }));
          const QL = [inkPath([[-30, qy], [W + 30, qy]], { w: 7, seed: sd + 61, t })];
          for (let y = qy + 60 * u, j = 0; y < H; j++, y += (60 + j * 40) * u) { QL.push(inkPath([[-30, y], [W + 30, y]], { w: 3, seed: sd + 62 + j, t })); for (let x = (j % 2) * 90 * u; x < W; x += (180 + j * 60) * u) QL.push(inkPath([[x, y - (60 + j * 40) * u + 6], [x, y]], { w: 2.5, seed: sd + 80 + j * 10 + Math.round(x), t })); }
          quayL.setAttribute('d', QL.join(' '));
          if (kas) kas.update(lt, t, cues);
          people.update(t, lt, W, H, cr.top * H, M.atOr(cues, 'cheer', null));
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
