// tz_shore: a small boat on the Bosphorus / Sea of Marmara, parchment ink style (brand/kit/BRAND.md §3, §5; boils at
// 8 Hz, pure function of (seed, lt)). Needs tz__lib.js (TZ) and mcB__lib.js (MCB.labels). The sea band runs to the
// frame bottom in front of the boat's keel; use with "set": "storm" (night) or "sea" (day).
//   mode "night": a seaside palace on the right (sea wall, arcades, dome, lit windows); a boat with a hooded figure and
//     a rower crosses through rough water, rain streaks; an ink lightning bolt on `flash`.
//   mode "exile": an island on the right (green hill, small monastery); the boat carries a robed woman (red robe,
//     veil) and a rower away towards it; gulls.
// P: {mode: "night"|"exile", sea: 0.5 (water top, 0..1 H), boat: {from: 0.12, to: 0.42, y: 0.63, s: 1.25},
//   arrive: cue|s (boat reaches `to`; default dur), flash: cue|s, labels: [MCB labels]}
// cues: arrive, flash, hit (punch).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tz_shore = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const T = window.TZ, M = window.MCB, sd = seed * 1000 + 521;
      const root = el(svg, 'g');
      const night = (P.mode || 'night') === 'night';
      const sh = T.Shapes();
      const seaY = (P.sea ?? 0.5) * H;
      const farG = el(root, 'g');
      const lights = [];
      if (night) {
        // palace on the right: sea wall, two storeys of arcades, a dome and a tower
        const x0 = W * 0.5, base = seaY + 10, STONE = mix(INK.paperDark, INK.inkSoft, 0.55);
        sh.add(farG, [[x0, base], [x0, base - 150], [W + 30, base - 170], [W + 30, base]], { fill: STONE, stroke: INK.ink, w: 5 });
        for (let i = 0; i < 7; i++) sh.add(farG, [[x0 + 10 + i * 90, base - 150 + i * 2], [x0 + 10 + i * 90, base - 176], [x0 + 50 + i * 90, base - 178], [x0 + 50 + i * 90, base - 152]], { fill: STONE, stroke: INK.ink, w: 3 });
        const hall = [[x0 + 60, base - 176], [x0 + 60, base - 440], [W + 30, base - 460], [W + 30, base - 178]];
        sh.add(farG, hall, { fill: mix(INK.paperDark, INK.inkSoft, 0.35), stroke: INK.ink, w: 5 });
        for (let row = 0; row < 2; row++) for (let i = 0; i < 4; i++) {
          const ax = x0 + 110 + i * 110, ay = base - 200 - row * 130;
          const a = [[ax, ay], [ax, ay - 70], [ax + 30, ay - 100], [ax + 60, ay - 70], [ax + 60, ay]];
          const lit = (i + row) % 2 === 0;
          const e = sh.add(farG, a, { fill: lit ? INK.gold : INK.ink, fop: lit ? 0.95 : 0.7, stroke: INK.ink, w: 3, smooth: false });
          if (lit) lights.push({ ax: ax + 30, ay: ay - 40 });
        }
        sh.add(farG, T.arc(x0 + 330, base - 450, 150, 120, Math.PI, Math.PI * 2, 14).concat([[x0 + 480, base - 450]]), { fill: mix(INK.paperDark, INK.inkSoft, 0.5), stroke: INK.ink, w: 5, smooth: true });
        sh.add(farG, [[x0 + 330, base - 570], [x0 + 330, base - 640]], { stroke: INK.ink, w: 5, closed: false });
        sh.add(farG, [[x0 + 305, base - 615], [x0 + 355, base - 615]], { stroke: INK.ink, w: 5, closed: false });
        sh.add(farG, T.rect(x0 + 60, base - 560, x0 + 140, base - 440), { fill: STONE, stroke: INK.ink, w: 4 });
        // a sea gate (the palace's water door) at the wall foot
        sh.add(farG, [[x0 + 180, base], [x0 + 180, base - 90], [x0 + 230, base - 125], [x0 + 280, base - 90], [x0 + 280, base]], { fill: INK.ink, fop: 0.85, smooth: true });
      } else {
        // island on the right: hill + monastery + trees
        const base = seaY + 6;
        sh.add(farG, [[W * 0.42, base], [W * 0.55, base - 110], [W * 0.7, base - 210], [W * 0.86, base - 190], [W + 30, base - 120], [W + 30, base]], { fill: mix(INK.green, INK.paper, 0.35), stroke: INK.ink, w: 5, smooth: true });
        sh.add(farG, [[W * 0.5, base - 40], [W * 0.62, base - 120], [W * 0.75, base - 150], [W + 30, base - 80]], { stroke: mix(INK.green, INK.ink, 0.4), w: 3, closed: false, smooth: true });
        const mx = W * 0.73, my = base - 205;
        sh.add(farG, T.rect(mx - 60, my - 70, mx + 60, my), { fill: INK.paperLight, stroke: INK.ink, w: 4 });
        sh.add(farG, T.arc(mx, my - 70, 40, 34, Math.PI, Math.PI * 2, 10), { fill: INK.red, fop: 0.7, stroke: INK.ink, w: 4, smooth: true });
        sh.add(farG, [[mx, my - 104], [mx, my - 140]], { stroke: INK.ink, w: 4, closed: false });
        sh.add(farG, [[mx - 14, my - 126], [mx + 14, my - 126]], { stroke: INK.ink, w: 4, closed: false });
        for (let i = 0; i < 5; i++) { const tx = W * (0.58 + i * 0.08), ty = base - 120 - (i % 2) * 40; sh.add(farG, inkEllipsePts(tx, ty, 22, 34, sd + 30 + i, 9), { fill: mix(INK.green, INK.ink, 0.3), stroke: INK.ink, w: 3, smooth: true }); }
      }
      const glowG = el(root, 'g'), glow = inkEl(glowG, INK.gold, { 'fill-opacity': 0.25 });
      // boat + crew
      const B = Object.assign({ from: 0.12, to: 0.42, y: 0.63, s: 1.25 }, P.boat || {});
      const boatObj = T.boat(root, sd + 40);
      const crewG = el(root, 'g');
      boatObj.g.appendChild(boatObj.front);
      root.insertBefore(crewG, boatObj.g);
      const rower = T.person(crewG, sd + 41, { scale: 0.62 * B.s, accessory: night ? null : 'helmet_byz', robe: false });
      const passenger = night ? null : T.person(crewG, sd + 42, { scale: 0.66 * B.s, accessory: null, robe: false });
      const hood = night ? { f: inkEl(crewG, mix(INK.ink, INK.inkSoft, 0.4)), r: inkEl(crewG), face: inkEl(crewG, INK.paperDark), eyes: inkEl(crewG) } : null;
      const veil = night ? null : { f: inkEl(crewG, INK.red), r: inkEl(crewG) };
      const oarG = el(root, 'g'), oar = { l: inkEl(oarG), b: inkEl(oarG, INK.stain) };
      const water = T.water(el(root, 'g'), sd + 50);
      const rainG = el(root, 'g'), rain = night ? inkEl(rainG, INK.inkSoft, { 'fill-opacity': 0.7 }) : null, bolt = night ? inkEl(rainG, INK.gold) : null, boltR = night ? inkEl(rainG) : null;
      const gulls = night ? [] : [0, 1, 2].map(i => ({ e: inkEl(rainG), x: W * (0.2 + i * 0.22), y: H * (0.2 + (i % 2) * 0.05), v: 30 + i * 12 }));
      const labs = M.labels(el(root, 'g'), P.labels || [], W, H, sd + 950);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const arrive = T.atOr(cues, P.arrive ?? 'arrive', dur), pk = punch(lt, T.atOr(cues, 'hit', null), 0.6);
          sh.update(t, lt);
          glow.setAttribute('d', lights.map((L, i) => inkCircle(L.ax, L.ay, 46 + Math.sin(t * 5 + i) * 6, sd + 60 + i, t, { fill: true })).join(' '));
          const u = progIO(lt, 0, Math.max(0.5, arrive)), bx = lerp(B.from, B.to, u) * W, by = B.y * H + Math.sin(t * 2.1) * (night ? 14 : 6);
          const rows = (lt * (night ? 0.9 : 0.6)) % 1;
          const bo = boatObj.update(t, bx, by, B.s * (1 + 0.04 * pk), { oar: null, rateAmp: 1, rockAmp: night ? 7 : 3, rate: night ? 2.4 : 1.6 });
          const R = bo.R;
          // crew: rower at the stern (left), passenger forward
          const rp = R([-90, 30]);
          rower.update(t, 'idle', { x: rp[0], y: rp[1], face: 1, since: 1 });
          { // the oar in the rower's hands: handle swings, the blade dips behind the stern
            const sw = Math.sin(rows * Math.PI * 2), hd = [rp[0] + 40 * B.s + sw * 36 * B.s, rp[1] - 150 * B.s + Math.cos(rows * Math.PI * 2) * 10 * B.s];
            const pv = R([-170, -48]), dx = pv[0] - hd[0], dy = pv[1] - hd[1], L = Math.hypot(dx, dy) || 1, tip = [pv[0] + dx / L * 230 * B.s, pv[1] + dy / L * 230 * B.s];
            oar.l.setAttribute('d', inkPath([hd, pv, tip], { w: 8, seed: sd + 77, t, amp: 0.6 }));
            oar.b.setAttribute('d', inkLoop(inkEllipsePts(tip[0], tip[1], 16 * B.s, 40 * B.s, sd + 78, 8, Math.atan2(dy, dx) - Math.PI / 2), { seed: sd + 78, t, amp: 0.6 }));
          }
          if (night) {
            const hp = R([80, 20]), s = B.s;
            const cl = [[hp[0] - 70 * s, hp[1]], [hp[0] - 40 * s, hp[1] - 230 * s], [hp[0] - 10 * s, hp[1] - 300 * s], [hp[0] + 40 * s, hp[1] - 310 * s], [hp[0] + 70 * s, hp[1] - 250 * s], [hp[0] + 80 * s, hp[1]]];
            hood.f.setAttribute('d', inkLoop(cl, { seed: sd + 70, t, amp: 1.2 }));
            hood.r.setAttribute('d', inkPath(cl, { w: 5, seed: sd + 71, t, closed: true, amp: 1.2 }));
            hood.face.setAttribute('d', inkLoop(inkEllipsePts(hp[0] + 34 * s, hp[1] - 240 * s, 30 * s, 38 * s, sd + 72, 8), { seed: sd + 72, t, amp: 0.8 }));
            hood.eyes.setAttribute('d', inkDot(hp[0] + 30 * s, hp[1] - 246 * s, 4 * s, 5 * s, sd + 75, t) + ' ' + inkDot(hp[0] + 50 * s, hp[1] - 246 * s, 4 * s, 5 * s, sd + 76, t) + ' ' + inkPath([[hp[0] + 20 * s, hp[1] - 262 * s], [hp[0] + 36 * s, hp[1] - 256 * s]], { w: 3, seed: sd + 79, t, amp: 0.4 }) + ' ' + inkPath([[hp[0] + 44 * s, hp[1] - 256 * s], [hp[0] + 60 * s, hp[1] - 262 * s]], { w: 3, seed: sd + 80, t, amp: 0.4 }));
          } else {
            const pp = R([90, 30]);
            passenger.update(t, 'think', { x: pp[0], y: pp[1], face: -1, since: 1, emotion: 'worried' });
            const s = 0.66 * B.s, hx = pp[0] + 6 * s, hy = pp[1] - 470 * s;
            const vl = [[hx - 70 * s, hy - 40 * s], [hx, hy - 95 * s], [hx + 70 * s, hy - 40 * s], [hx + 95 * s, hy + 150 * s], [hx + 40 * s, hy + 170 * s], [hx + 60 * s, hy + 20 * s], [hx - 60 * s, hy + 20 * s], [hx - 40 * s, hy + 170 * s], [hx - 95 * s, hy + 150 * s]];
            veil.f.setAttribute('d', inkLoop(vl, { seed: sd + 73, t, amp: 1 }));
            veil.r.setAttribute('d', inkPath(vl, { w: 4, seed: sd + 74, t, closed: true, amp: 1 }));
          }
          water.update(t, W, H, B.y * H + 18 * B.s, { rough: night ? 1.8 : 0.8, dark: night });
          if (night) {
            const RN = [];
            for (let i = 0; i < 46; i++) { const x = ((i * 97) % W + lt * 60) % W, y = ((i * 211) % H + lt * 1400) % (H * 0.9); RN.push(inkPath([[x, y], [x - 14, y + 60]], { w: 2.5, seed: sd + 80 + i, t, amp: 0.4 })); }
            rain.setAttribute('d', RN.join(' '));
            const fa = T.atOr(cues, P.flash ?? 'flash', null), fu = fa != null ? lt - fa : -1;
            if (fu >= 0 && fu < 0.5) {
              const bp = [[W * 0.3, 0], [W * 0.27, H * 0.08], [W * 0.33, H * 0.1], [W * 0.26, H * 0.2], [W * 0.31, H * 0.21], [W * 0.24, H * 0.3]];
              bolt.setAttribute('d', inkPath(bp, { w: 14, seed: sd + 90, t, smooth: false, amp: 1 }));
              boltR.setAttribute('d', inkPath(bp, { w: 4, seed: sd + 91, t, smooth: false, amp: 1 }));
            } else { bolt.setAttribute('d', ''); boltR.setAttribute('d', ''); }
          } else {
            gulls.forEach((g, i) => { const x = (g.x + lt * g.v) % (W + 100), y = g.y + Math.sin(lt * 2 + i) * 10, f = Math.sin(lt * 7 + i) * 14;
              g.e.setAttribute('d', inkPath([[x - 40, y + f], [x - 16, y - 10], [x, y + 4], [x + 16, y - 10], [x + 40, y + f]], { w: 5, seed: sd + 95 + i, t, amp: 0.6 })); });
          }
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
