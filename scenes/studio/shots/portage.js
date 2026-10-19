// portage: a galley hauled overland up a hill on greased planks and log rollers (theme "parchment",
// brand/kit/BRAND.md §5 ink style, everything boils at 8 Hz). Turbaned haulers lean into a rope over their
// shoulders, a water buffalo leads, the ship rolls up the slope; optional crescent moon (night work) and Kaşif.
//
// SHOTS.portage P: {
//   from: 0.26, to: 0.33,        // ship centre x (fraction of W) at the start / end of the scene (it climbs the whole time)
//   haulers: 3, ox: true,        // rope team in front of the ship
//   grease: true,                // gold grease glints on the planks (flare on cue "grease")
//   night: true,                 // crescent moon + a few stars
//   scale: 1,                    // everything (ship, team, spacing) bigger/smaller
//   skyline: true,               // thin Constantinople skyline on the far ridge (second plane)
//   foreground: true,            // slope hatching to the frame bottom (caption band kept clear) + a log pile
//   label: {text, x, y, at},     // hand-written caption (Patrick Hand)
//   kasif: {x: 0.1, pose: "walk"|"point"|..., at: cue|seconds, then: "shock", dir: "up-right", face: "right", scale: 0.62, emotion}
// }
// cues: hit (ship jolts, team heaves), grease, label.at, kasif.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mul = (a, k) => [a[0] * k, a[1] * k];
  // two-bone IK, joint bent toward hint side
  function ik(a, b, l1, l2, bendSign) {
    let dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
    const mx = l1 + l2 - 0.5;
    if (d > mx) { dx *= mx / d; dy *= mx / d; d = mx; }
    d = Math.max(d, 1);
    const base = Math.atan2(dy, dx), al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const ang = base + bendSign * al;
    return [a[0] + Math.cos(ang) * l1, a[1] + Math.sin(ang) * l1];
  }

  SH.portage = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W;
      const G0 = portrait ? 1165 : 900, X0 = portrait ? 140 : 300, K = portrait ? 0.42 : 0.33;
      const gy = x => x < X0 ? G0 : G0 - (x - X0) * K;
      const slope = Math.atan(K), ca = Math.cos(slope), sa = Math.sin(slope);
      const SC = (portrait ? 1 : 0.85) * (P.scale ?? 1);  // figure / ship scale
      const root = el(svg, 'g'), world = el(root, 'g');
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const sd = seed * 1000;
      // layers
      const sky = el(world, 'g'), moonF = mk(sky, INK.paperLight), moonR = mk(sky), moonCut = mk(sky, INK.paper), moonR2 = mk(sky, INK.inkSoft), stars = mk(sky, INK.inkSoft);
      const far = mk(world, INK.inkSoft, { opacity: 0.55 }), farTowerF = mk(world, INK.paperDark), farTower = mk(world, INK.inkSoft);
      const skyF = mk(world, INK.paperDark, { opacity: 0.6 }), skyR = mk(world, INK.inkSoft, { opacity: 0.8 });
      const gBand = mk(world, INK.paperDark, { opacity: 0.45 }), gLine = mk(world), hatch = mk(world, INK.inkSoft, { opacity: 0.55 }), logsF = mk(world, INK.paperDark), logs = mk(world);
      const planksF = mk(world, INK.paperDark), planks = mk(world), glints = mk(world, INK.gold);
      const ropeE = mk(world, INK.inkSoft);
      const shipG = el(world, 'g');
      const S = {
        yard: null, hullF: mk(shipG, INK.paperDark), hull: mk(shipG), rail: mk(shipG), oars: mk(shipG), mast: mk(shipG),
        sailF: mk(shipG, INK.paperDark), sail: mk(shipG), pen: mk(shipG, INK.red), rollF: mk(shipG, INK.paperLight), roll: mk(shipG),
      };
      const dust = mk(world, INK.inkSoft, { opacity: 0.6 });
      const nH = P.haulers ?? 3;
      const haulers = Array.from({ length: nH }, (_, i) => {
        const g = el(world, 'g');
        return { i, legs: mk(g), body: mk(g), headF: mk(g, INK.paperLight), head: mk(g), turF: mk(g, INK.paperLight), tur: mk(g), jewel: mk(g, INK.red), face: mk(g), arms: mk(g) };
      });
      const ox = P.ox !== false ? { legs: mk(world), bodyF: mk(world, INK.inkSoft), body: mk(world), headF: mk(world, INK.inkSoft), head: mk(world), horns: mk(world), eye: mk(world, INK.paperLight), yoke: mk(world) } : null;
      // label
      let label = null;
      if (P.label && P.label.text) {
        const t = el(root, 'text', { 'font-family': INK_FONT, 'font-size': P.label.size || (portrait ? 70 : 60), 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = P.label.text;
        label = { L: P.label, t, u: mk(root) };
      }
      let kas = null;
      if (P.kasif && typeof KASIF !== 'undefined') kas = { K: P.kasif, rig: KASIF.create(el(world, 'g'), { scale: P.kasif.scale ?? (portrait ? 0.62 : 0.55), hat: true, seed: seed + 5 }) };
      // static scatter
      const r = rng(seed * 17 + 3);
      const starPts = Array.from({ length: 9 }, () => [60 + r() * (W - 120), (portrait ? 330 : 120) + r() * (portrait ? 260 : 200)]);
      const plankXs = []; for (let x = X0 - 120; x < W + 80; x += 62 * SC) plankXs.push(x);
      const farPts = []; for (let x = -40; x <= W + 40; x += 90) farPts.push([x, (portrait ? 640 : 380) + Math.sin(x * 0.007 + 1) * 34 + Math.sin(x * 0.019) * 14]);

      // skyline on the far ridge: domes, towers and crenellated walls (static shapes, they boil when drawn)
      const skyLine = [], skyDomes = [];
      if (P.skyline !== false) {
        const sr = rng(seed * 23 + 1), ry = x => { let k = 0; while (k < farPts.length - 2 && farPts[k + 1][0] < x) k++; const a = farPts[k], b = farPts[k + 1]; return lerp(a[1], b[1], (x - a[0]) / (b[0] - a[0])); };
        let x = W * 0.22; const xe = W * 0.7;
        skyLine.push([x, ry(x)]);
        while (x < xe) {
          const r = sr(), by = ry(x);
          if (r < 0.25) { const R = 26 + sr() * 16; skyLine.push([x, by - 14]); skyDomes.push([[x, by - 14], [x + R * 0.12, by - 14 - R * 0.7], [x + R, by - 14 - R], [x + R * 1.88, by - 14 - R * 0.7], [x + 2 * R, by - 14]]); x += 2 * R; skyLine.push([x, by - 14]); }
          else if (r < 0.45) { const tw = 18 + sr() * 10, th = 50 + sr() * 30; skyLine.push([x, by - th], [x + tw, by - th]); x += tw; skyLine.push([x, by - 12]); }
          else { for (let i = 0; i < 3; i++) { skyLine.push([x, by - 20], [x + 9, by - 20], [x + 9, by - 12], [x + 18, by - 12]); x += 18; } }
        }
        skyLine.push([x, ry(Math.min(x, W))]);
      }
      const hatchSegs = [];
      if (P.foreground !== false) {
        const hr = rng(seed * 41 + 3), bands = portrait ? [[0, 1165], [1330, 1530]] : [[0, H - 10]];
        for (let y = G0 - 380; y < H; y += 38) for (let x = hr() * 60; x < W + 40; x += 64 + hr() * 40) {
          if (y < gy(x) + 34 || !bands.some(([a, b]) => y > a && y < b)) continue;
          hatchSegs.push([[x, y + 12], [x + 24, y - 8]]);
        }
      }
      const pileX = W * (P.pile_x ?? 0.8), pileY = portrait ? 1158 : H - 30, logR = 24 * SC;
      const logC = [[0, 0], [2, 0], [4, 0], [1, 1], [3, 1], [2, 2]].map(([i, j]) => [pileX + (i - 2) * logR + 0, pileY - logR - j * logR * 1.72]);
      // local (slope frame, x uphill, y down) -> world
      const L2W = (o, q) => [o[0] + q[0] * ca + q[1] * sa, o[1] - q[0] * sa + q[1] * ca];

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, inkO = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.6 }, extra);
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 8)} ${f1(Math.cos(lt * 0.27) * 5)})`);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          // sky
          if (P.night !== false) {
            const mx = W * 0.8, my = portrait ? 420 : 170, mr = 62;
            // crescent: outer arc of the moon disc + inner arc of an offset disc, between their intersections
            const ox2 = 30, oy2 = -22, r2 = mr * 0.86, d = Math.hypot(ox2, oy2), base = Math.atan2(oy2, ox2);
            const h1 = Math.acos(Math.max(-1, Math.min(1, (mr * mr + d * d - r2 * r2) / (2 * mr * d))));
            const p1 = [mx + mr * Math.cos(base + h1), my + mr * Math.sin(base + h1)], p2 = [mx + mr * Math.cos(base - h1), my + mr * Math.sin(base - h1)];
            const cr = [];
            for (let i = 0; i <= 10; i++) { const a2 = base + h1 + (2 * Math.PI - 2 * h1) * i / 10; cr.push([mx + mr * Math.cos(a2), my + mr * Math.sin(a2)]); }
            const c2 = [mx + ox2, my + oy2], b1 = Math.atan2(p2[1] - c2[1], p2[0] - c2[0]), b2 = Math.atan2(p1[1] - c2[1], p1[0] - c2[0]);
            let e2 = b2; while (e2 > b1) e2 -= 2 * Math.PI;
            for (let i = 1; i < 6; i++) { const a2 = b1 + (e2 - b1) * i / 6; cr.push([c2[0] + r2 * Math.cos(a2), c2[1] + r2 * Math.sin(a2)]); }
            moonF.setAttribute('d', inkLoop(cr, inkO(1, { amp: 1 })));
            moonR.setAttribute('d', inkPath(cr, inkO(1, { w: 5, closed: true, amp: 1 })));
            moonCut.setAttribute('d', ''); moonR2.setAttribute('d', '');
            stars.setAttribute('d', starPts.map((p, i) => { const s = 9 + 4 * Math.sin(t * 2 + i); return inkPath([[p[0] - s, p[1]], [p[0] + s, p[1]]], inkO(10 + i, { w: 3, amp: 0.6 })) + ' ' + inkPath([[p[0], p[1] - s], [p[0], p[1] + s]], inkO(30 + i, { w: 3, amp: 0.6 })); }).join(' '));
          }
          far.setAttribute('d', inkPath(farPts, inkO(50, { w: 4 })));
          // far Galata tower on the ridge
          const tx = W * 0.12, ty = farPts[2][1] + 6;
          const tw = [[tx - 22, ty], [tx - 18, ty - 120], [tx - 26, ty - 126], [tx, ty - 176], [tx + 26, ty - 126], [tx + 18, ty - 120], [tx + 22, ty]];
          farTowerF.setAttribute('d', inkLoop(tw, inkO(51, { smooth: false })));
          farTower.setAttribute('d', inkPath(tw, inkO(51, { w: 4, closed: true, smooth: false })));
          // ground
          const gp = []; for (let x = -60; x <= W + 60; x += 70) gp.push([x, gy(x) + 4]);
          gLine.setAttribute('d', inkPath(gp, inkO(60, { w: 6 })));
          gBand.setAttribute('d', inkLoop([...gp, [W + 60, H + 50], [-60, H + 50]], inkO(61, { smooth: false, amp: 0 })));
          if (skyLine.length) {
            skyF.setAttribute('d', inkLoop([...skyLine, [skyLine[skyLine.length - 1][0], skyLine[skyLine.length - 1][1] + 30], [skyLine[0][0], skyLine[0][1] + 30]], inkO(70, { smooth: false, amp: 1 })) + ' ' + skyDomes.map((q, i) => inkLoop(q, inkO(71 + i, { amp: 1 }))).join(' '));
            skyR.setAttribute('d', inkPath(skyLine, inkO(90, { w: 3, smooth: false, amp: 1 })) + ' ' + skyDomes.map((q, i) => inkPath(q, inkO(91 + i, { w: 3, amp: 1 }))).join(' '));
          }
          hatch.setAttribute('d', hatchSegs.map((q, i) => inkPath(q, inkO(1000 + i, { w: 3, amp: 1 }))).join(' '));
          if (P.foreground !== false && pileX > 0) {
            logsF.setAttribute('d', logC.map((c, i) => inkCircle(c[0], c[1], logR, sd + 1500 + i, t, { fill: true })).join(' '));
            logs.setAttribute('d', logC.map((c, i) => inkCircle(c[0], c[1], logR, sd + 1500 + i, t, { w: 4 }) + ' ' + inkCircle(c[0], c[1], logR * 0.45, sd + 1520 + i, t, { w: 2.5 })).join(' '));
          }
          // planks (crosswise sleepers seen end-on) + grease glints
          const gAt = atOr(cues, 'grease', null), gk = punch(lt, gAt, 0.9);
          let pf = '', pr = '', gl = '';
          plankXs.forEach((x, i) => {
            const o = [x, gy(x) + 2], q = [[-24 * SC, -14 * SC], [24 * SC, -14 * SC], [24 * SC, 0], [-24 * SC, 0]].map(v => L2W(o, v));
            pf += inkLoop(q, inkO(100 + i, { smooth: false, amp: 1 })) + ' ';
            pr += inkPath(q, inkO(100 + i, { w: 4, closed: true, smooth: false, amp: 1 })) + ' ';
            if (P.grease !== false && i % 2 === 0) {
              const sh = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7) + gk;
              if (sh > 0.6) gl += inkPath([L2W(o, [-14 * SC, -20 * SC]), L2W(o, [6 * SC, -22 * SC])], inkO(200 + i, { w: 5 * Math.min(1.6, sh), amp: 0.8 })) + ' ';
            }
          });
          planksF.setAttribute('d', pf); planks.setAttribute('d', pr); glints.setAttribute('d', gl);
          // ship: climbs from -> to during the scene
          const u = clamp01(lt / Math.max(0.5, dur));
          const sx = lerp(P.from ?? 0.26, P.to ?? 0.33, u) * W;
          const dist = (sx - (P.from ?? 0.26) * W) / ca;
          const bob = Math.sin(dist * 0.12) * 2.5 - pk * 14;
          const so = [sx, gy(sx)];
          const s = 0.8 * SC, Lc = v => L2W([so[0], so[1] + bob], mul(v, s));
          const hull = [[-232, -168], [-200, -110], [-150, -48], [-60, -34], [80, -34], [170, -50], [218, -100], [250, -160], [180, -116], [0, -112], [-170, -110]].map(Lc);
          S.hullF.setAttribute('d', inkLoop(hull, inkO(300)));
          S.hull.setAttribute('d', inkPath(hull, inkO(300, { w: 6, closed: true })) + ' ' + inkPath([[-232, -168], [-250, -196], [-232, -206]].map(Lc), inkO(301, { w: 6 })));
          S.rail.setAttribute('d', inkPath([[-180, -84], [0, -78], [200, -86]].map(Lc), inkO(302, { w: 3.5 })));
          let od = '';
          for (let k = 0; k < 7; k++) { const c = Lc([-138 + k * 46, -62]); od += inkDot(c[0], c[1], 7, 7, sd + 310 + k, t) + ' '; }
          S.oars.setAttribute('d', od);
          S.mast.setAttribute('d', inkPath([[10, -96], [10, -400]].map(Lc), inkO(320, { w: 8 })) + ' ' + inkPath([[-170, -300], [190, -470]].map(Lc), inkO(321, { w: 7 })));
          // furled lateen sail: a thin bundle hanging under the slanted yard, lashed with ties
          const yA = [-150, -300], yB = [175, -454], nrm = [0.43, 0.9];      // along / below the yard
          const bun = [], bun2 = [];
          for (let i = 0; i <= 8; i++) { const u = i / 8, px = lerp(yA[0], yB[0], u), py = lerp(yA[1], yB[1], u), sag = 14 + 10 * Math.sin(Math.PI * u); bun.push([px + nrm[0] * 4, py + nrm[1] * 4]); bun2.unshift([px + nrm[0] * sag * 1.6, py + nrm[1] * sag * 1.6]); }
          const furl = bun.concat(bun2).map(Lc);
          S.sailF.setAttribute('d', inkLoop(furl, inkO(322)));
          let ties = '';
          for (let i = 1; i < 6; i++) { const u = i / 6, px = lerp(yA[0], yB[0], u), py = lerp(yA[1], yB[1], u), sag = 14 + 10 * Math.sin(Math.PI * u); ties += inkPath([[px - 6, py - 6], [px + nrm[0] * sag * 1.7 + 6, py + nrm[1] * sag * 1.7 + 2]].map(Lc), inkO(325 + i, { w: 3.5 })) + ' '; }
          S.sail.setAttribute('d', inkPath(furl, inkO(322, { w: 4, closed: true })) + ' ' + ties);
          const fl = Math.sin(t * 6) * 10;
          S.pen.setAttribute('d', inkPath([[10, -400], [50, -410 + fl * 0.3], [90, -400 + fl]].map(Lc), inkO(323, { w: 8 })));
          let rf = '', rr = '';
          [-110, 0, 110].forEach((x, k) => {
            const c = Lc([x, -18]), rad = 18 * s, a = -dist / rad;
            rf += inkCircle(c[0], c[1], rad, sd + 330 + k, t, { fill: true }) + ' ';
            rr += inkCircle(c[0], c[1], rad, sd + 330 + k, t, { w: 4 }) + ' ' + inkPath([[c[0] - Math.cos(a) * rad * 0.8, c[1] - Math.sin(a) * rad * 0.8], [c[0] + Math.cos(a) * rad * 0.8, c[1] + Math.sin(a) * rad * 0.8]], inkO(340 + k, { w: 3 })) + ' ';
          });
          S.rollF.setAttribute('d', rf); S.roll.setAttribute('d', rr);
          // dust curls behind the rollers
          let dd = '';
          for (let k = 0; k < 3; k++) {
            const ph = (t * 1.3 + k / 3) % 1, b = Lc([-170 - ph * 90, -10 - ph * 40]), rr2 = 8 + ph * 16;
            if (ph < 0.85) dd += inkPath([[b[0] - rr2, b[1]], [b[0], b[1] - rr2], [b[0] + rr2, b[1]]], inkO(350 + k, { w: 3, amp: 0.8 })) + ' ';
          }
          dust.setAttribute('d', dd);
          // haulers + ox
          const bow = Lc([246, -150]);
          const rope = [bow];
          const hh = 250 * SC, stride = 0.26 * hh;
          haulers.forEach((h, i) => {
            const x = sx + (230 + i * 112) * SC, ph = dist / (2 * stride) + i * 0.37;
            const heave = Math.sin(t * 3.1 + i) * 2 + pk * 6;
            const lean = (30 + heave) * Math.PI / 180, uv = [Math.sin(lean), -Math.cos(lean)];
            const hip = [x - 0.03 * hh, gy(x) - 0.43 * hh];
            const feet = [0, 1].map(j => { const a = 2 * Math.PI * ph + j * Math.PI, fx = x + 0.15 * hh * Math.sin(a); return [fx, gy(fx) - Math.max(0, Math.cos(a)) * 0.07 * hh]; });
            const knees = feet.map(f => ik(hip, f, 0.23 * hh, 0.23 * hh, -1));
            const sho = add(hip, mul(uv, 0.36 * hh)), neck = add(hip, mul(uv, 0.41 * hh)), hc = add(hip, mul(uv, 0.53 * hh)), hr = 0.105 * hh;
            const grip = add(sho, [0.17 * hh, 0.02 * hh]), grip2 = add(grip, [0.05 * hh, 0.035 * hh]);
            const el1 = ik(sho, grip, 0.15 * hh, 0.15 * hh, 1), el2 = ik(sho, grip2, 0.15 * hh, 0.15 * hh, 1);
            const k0 = 400 + i * 40;
            h.legs.setAttribute('d', [0, 1].map(j => inkPath([hip, knees[j], feet[j]], inkO(k0 + j, { w: 7 })) + ' ' + inkDot(feet[j][0] + 8, feet[j][1] - 4, 15, 8, sd + k0 + 2 + j, t)).join(' '));
            h.body.setAttribute('d', inkPath([hip, add(hip, mul(uv, 0.2 * hh)), neck], inkO(k0 + 4, { w: 7 })));
            const hp = inkEllipsePts(hc[0], hc[1], hr, hr * 0.97, sd + k0 + 5, 12);
            h.headF.setAttribute('d', inkLoop(hp, inkO(k0 + 5, { amp: 1.2 })));
            h.head.setAttribute('d', inkPath(hp, inkO(k0 + 5, { w: 5, closed: true, amp: 1.2 })));
            const tc = add(hc, mul(uv, 0.07 * hh)), tp = inkEllipsePts(tc[0], tc[1], hr * 1.18, hr * 0.62, sd + k0 + 6, 12, lean);
            h.turF.setAttribute('d', inkLoop(tp, inkO(k0 + 6)));
            h.tur.setAttribute('d', inkPath(tp, inkO(k0 + 6, { w: 5, closed: true })) + ' ' + inkPath([add(tc, [-hr * 0.8, hr * 0.15]), add(tc, [0, -hr * 0.1]), add(tc, [hr * 0.9, -hr * 0.05])], inkO(k0 + 7, { w: 3 })));
            const jw = add(tc, [hr * 0.95, 0]);
            h.jewel.setAttribute('d', inkDot(jw[0], jw[1], 7, 8, sd + k0 + 8, t));
            const eye = add(hc, [hr * 0.45, hr * 0.05]);
            h.face.setAttribute('d', inkDot(eye[0], eye[1], 5, 5.5, sd + k0 + 9, t) + ' ' +
              inkPath([add(eye, [-10, -16]), add(eye, [10, -10])], inkO(k0 + 10, { w: 3.5 })) + ' ' +
              inkPath([add(hc, [hr * 0.25, hr * 0.55]), add(hc, [hr * 0.7, hr * 0.5])], inkO(k0 + 11, { w: 3.5 })));
            h.arms.setAttribute('d', inkPath([sho, el1, grip], inkO(k0 + 12, { w: 7 })) + ' ' + inkPath([sho, el2, grip2], inkO(k0 + 13, { w: 7 })) + ' ' +
              inkDot(grip[0], grip[1], 10, 10, sd + k0 + 14, t) + ' ' + inkDot(grip2[0], grip2[1], 10, 10, sd + k0 + 15, t));
            rope.push(grip);
          });
          if (ox) {
            const x = sx + (230 + nH * 112 + 80) * SC, o = [x, gy(x)], ph = dist / (0.6 * hh);
            const O = v => L2W(o, mul(v, SC));
            const nod = Math.sin(ph * 2 * Math.PI) * 3;
            const body = [[-128, -150], [-70, -162], [30, -164], [92, -156], [114, -128], [112, -76], [84, -58], [-92, -58], [-126, -72], [-134, -112]].map(O);
            const legs = [[-96, 0], [-72, 0.5], [62, 0.25], [86, 0.75]].map(([lx, off], k) => {
              const a = 2 * Math.PI * (ph + off), fx = lx + 16 * Math.sin(a), lift = Math.max(0, Math.cos(a)) * 12;
              return inkPath([O([lx, -66]), O([lx + (fx - lx) * 0.5 + 4, -30]), O([fx, -lift])], inkO(610 + k, { w: 17 })) + ' ' + inkDot(...O([fx + 4, -lift - 3]), 12, 7, sd + 615 + k, t);
            });
            ox.legs.setAttribute('d', legs.join(' '));
            ox.bodyF.setAttribute('d', inkLoop(body, inkO(600, { smooth: false })));
            ox.body.setAttribute('d', inkPath(body, inkO(600, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([O([-132, -120]), O([-150, -86]), O([-144, -54])], inkO(620, { w: 5 })) + ' ' +
              inkPath([O([-40, -146]), O([-20, -126]), O([0, -144])], inkO(621, { w: 3.5 })) + ' ' + inkPath([O([40, -78]), O([70, -70])], inkO(622, { w: 3.5 })));
            const H2 = q => O([q[0], q[1] + nod]);
            const head = [[100, -138], [128, -130], [156, -106], [180, -76], [176, -54], [150, -50], [124, -72], [102, -104]].map(H2);
            ox.headF.setAttribute('d', inkLoop(head, inkO(630)));
            const muz = inkEllipsePts(168, -62 + nod, 15, 12, sd + 632, 8).map(q => O(q));
            ox.head.setAttribute('d', inkPath(head, inkO(630, { w: 5, closed: true })) + ' ' + inkLoop(muz, inkO(632)) + ' ' +
              inkPath([[110, -122], [88, -112], [104, -104]].map(H2), inkO(634, { w: 5 })));
            // wide water-buffalo horns spreading sideways and up
            ox.horns.setAttribute('d', inkPath([[118, -132], [92, -150], [64, -170], [52, -196], [60, -214]].map(H2), inkO(640, { w: 13, taper: 0.8 })) + ' ' +
              inkPath([[130, -134], [156, -152], [184, -168], [198, -194], [192, -212]].map(H2), inkO(641, { w: 13, taper: 0.8 })));
            const e = H2([140, -102]);
            ox.eye.setAttribute('d', inkDot(e[0], e[1], 5.5, 5.5, sd + 650, t));
            // yoke on the neck: a beam seen end-on with two pegs
            const yk = [[70, -184], [108, -184], [108, -166], [70, -166]].map(O);
            ox.yoke.setAttribute('d', inkPath(yk, inkO(660, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([O([76, -166]), O([74, -124])], inkO(661, { w: 6 })) + ' ' + inkPath([O([102, -166]), O([104, -128])], inkO(662, { w: 6 })));
            rope.push(O([89, -176]));
          }
          ropeE.setAttribute('d', rope.length > 1 ? inkPath(rope, inkO(700, { w: 5, smooth: false, amp: 1 })) : '');
          if (label) {
            const Lb = label.L, at = atOr(cues, Lb.at, 0.15), sp = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? (portrait ? 0.29 : 0.18)) * H, b = boil(sd + 800, t, 1);
            label.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.7, 1, sp).toFixed(3)})`);
            label.t.style.opacity = clamp01(sp * 2);
            const tw2 = label.t.getComputedTextLength ? Math.min(W * 0.8, label.t.getComputedTextLength()) : 300, pu = prog(lt, at + 0.25, 0.5);
            label.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw2 / 2, y + 20], [x - tw2 / 2 + tw2 * pu, y + 14]], inkO(801, { w: 6 })) : '');
          }
          if (kas) {
            const Kk = kas.K, at = atOr(cues, Kk.at, null), after = at != null && lt >= at;
            const pose = after ? (Kk.then || 'point') : (Kk.pose || 'idle');
            let x = (Kk.x ?? 0.1) * W;
            if (Kk.to != null && !after && (Kk.pose === 'walk')) x = lerp(x, Kk.to * W, clamp01(lt / Math.max(0.3, at ?? dur)));
            else if (Kk.to != null) x = Kk.to * W;
            const since = after ? lt - at : lt, dir = typeof Kk.dir === 'number' ? Kk.dir : DIRS[Kk.dir] ?? 30;
            const words = env.words || (typeof WORDS !== 'undefined' ? WORDS : null);
            const o = { x, y: gy(x), face: Kk.face === 'left' ? -1 : 1, since, dir, emotion: after ? (Kk.emotion || (pose === 'shock' ? 'surprised' : null)) : null, mouth: inkTalk(t, words) };
            if (pose === 'walk') o.ph = (x - (Kk.x ?? 0.1) * W) / (KASIF.gait('walk') * (Kk.scale ?? 0.62));
            if (after && since < 0.32) { o.prev = { pose: Kk.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
            kas.rig.update(t, pose, o);
          }
        },
      };
    },
  };
})();
