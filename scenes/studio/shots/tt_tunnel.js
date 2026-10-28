// tt_tunnel: the Thames Tunnel (1825-1843) in parchment ink (theme "parchment", BRAND.md §3, §5). One type, four modes.
// Built on the bb__lib helpers (window.BBL: cast, labels, camPush). Landscape-first (long video, 1920x1080).
// P.mode:
//  "section" — side cut-away of the river: banks with warehouses, ships drifting on the surface, water, riverbed mud,
//     the access shaft(s) and the tunnel bore crawling under the river towards the shield.
//     P: {surface: 0.30, bed: 0.47, top: 0.62, bottom: 0.80 (0..1 H), shafts: [0.1, 0.9], right_shaft: true,
//         progress: 0.5 | {from, to, at, dur}, drift: false (thin 1807 test passage instead of the brick tunnel),
//         ships: 3 | [{x, s, v}], banks: ["Rotherhithe", "Wapping"] | false,
//         flood: {at, x (0..1 W, default the shield), dur: 2.6}, bell: {at, x}, bags: {at},
//         wall: {at} (bricked-up face), push: {at} (screws push the shield, new brick rings flash),
//         walkers: 0, train: {at} (a train runs through), dark: false}
//  "face"    — the shield seen from the tunnel: an iron frame of 12 columns x 3 storeys = 36 cells, poling boards,
//     one miner per cell, seeping drips, hanging lamps.
//     P: {fill: {at, dur} (cells fill one by one; omitted = all full), counter: {at, x, y} (live "N cells" count),
//         cell: [col, row] + pull: {at, back} (that cell's board slides out, the miner digs, the board goes back),
//         ring: cue (red ring on `cell`), draw: {at, dur} (frame draws itself column by column), heavy: true (new shield)}
//  "worm"    — close cut through ship timber: wood grain, old shell-lined burrows, a shipworm boring forward with two
//     rocking shell plates on its head, sawdust; ghost: {at} lays a red shield grid over the head.
//     P: {holes: [[[x,y],...],...], worm: {path: [[x,y],...] (0..1), at, dur}, ghost: {at}}
//  "room"    — nothing but the overlays below + cast, on the scene's set. Overlays (any mode): sickbed: {x, y, w} (bed + blanket over
//     the sitter), crutch: castIndex, plan: {cross: cue} (drawing board with the tunnel + two cart ramps, red crosses), booth: {x, at, text}
//     (toll booth with a sign and a gold penny), runner (arch): {at, dur, from, to} (miner with a lantern runs at the camera).
//  "arch"    — looking down the brick twin-arch tunnel to the vanishing point: receding rings, wall lamps, walkway.
//     P: {end: "shield"|"wall"|"dark"|"open", dark: {at} (lamps die far to near), flood: {at, dur: 2.2, level: 0.55},
//         table: {at} (banquet table with candles and seated guests), walkers: {n, at, speed}, stalls: true,
//         train: {at, kind: "steam"|"modern", dur: 3}, miners: true (diggers at the far shield), drips: true,
//         crack: {at}, flare: {at} (gas catches fire at a lamp), beam: {at} (a timber falls), rise: {at, to} (water level)}
// All modes: cast: [...] (BBL cast, Kaşif = who "kasif"), labels: [...] (BBL labels), cam: {zoom, focus, pan}, shake: cue.
// cues: whatever the params name; "hit" punches the camera.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const circ = (cx, cy, r, n = 10) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
  const atOf = (B, cues, v, fb) => v == null ? fb : B.atOr(cues, typeof v === 'object' ? v.at : v, fb);

  // tiny stick figure (miners, guests, walkers): returns {head, body} path strings
  function fig(x, yFloor, s, ph, sd, t, o = {}) {
    const hy = yFloor - 175 * s, hip = yFloor - 70 * s, sh = yFloor - 130 * s;
    const sw = Math.sin(ph) * 22 * s, w = Math.max(2.2, 6 * s);
    const P = [];
    P.push(inkPath([[x, sh - 20 * s], [x, hip]], { seed: sd, t, w, amp: 0.5 }));
    if (o.sit) {
      P.push(inkPath([[x, hip], [x + 34 * s * (o.face || 1), hip], [x + 34 * s * (o.face || 1), yFloor]], { seed: sd + 1, t, w, amp: 0.5 }));
    } else {
      P.push(inkPath([[x, hip], [x - 16 * s + sw, yFloor]], { seed: sd + 1, t, w, amp: 0.5 }));
      P.push(inkPath([[x, hip], [x + 16 * s - sw, yFloor]], { seed: sd + 2, t, w, amp: 0.5 }));
    }
    const arm = o.arm != null ? o.arm : -sw;
    P.push(inkPath([[x, sh], [x - 30 * s, sh + 48 * s + arm * 0.5]], { seed: sd + 3, t, w, amp: 0.5 }));
    P.push(inkPath([[x, sh], [x + 30 * s, sh + (o.raise ? -40 * s : 48 * s - arm * 0.5)]], { seed: sd + 4, t, w, amp: 0.5 }));
    const head = inkCircle(x, hy, 26 * s, sd + 5, t, { w, amp: 0.5 });
    const headF = inkCircle(x, hy, 26 * s, sd + 5, t, { fill: true, amp: 0.5 });
    return { head: headF, body: P.join(' ') + ' ' + head };
  }

  // small sailing ship on the surface (x = centre, y = waterline)
  function ship(x, y, s, sd, t, lt) {
    const roll = Math.sin(lt * 1.3 + sd) * 0.04;
    const R = (px, py) => [x + (px * Math.cos(roll) - py * Math.sin(roll)) * s, y + (px * Math.sin(roll) + py * Math.cos(roll)) * s];
    const hull = [R(-120, -36), R(120, -36), R(92, 14), R(-96, 14)];
    const sails = [[R(-40, -46), R(-40, -190), R(-96, -60)], [R(30, -46), R(30, -220), R(-24, -58)], [R(40, -60), R(40, -200), R(96, -66)]];
    return {
      hullF: inkLoop(hull, { seed: sd, t, amp: 0.8, smooth: false }),
      sailF: sails.map((p, k) => inkLoop(p, { seed: sd + 10 + k, t, amp: 0.8, smooth: false })).join(' '),
      ink: [inkPath(hull, { seed: sd + 1, t, w: 4.5, closed: true, smooth: false, amp: 0.8 }),
        inkPath([R(-40, -36), R(-40, -200)], { seed: sd + 2, t, w: 4, amp: 0.6 }),
        inkPath([R(30, -36), R(30, -232)], { seed: sd + 3, t, w: 4, amp: 0.6 }),
        ...sails.map((p, k) => inkPath(p, { seed: sd + 20 + k, t, w: 3, closed: true, smooth: false, amp: 0.6 }))].join(' '),
    };
  }

  SH.tt_tunnel = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, sd = seed * 1000 + 911, mode = P.mode || 'section';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const rs = rng(sd + 3);
      let draw = null;

      // ------------------------------------------------------------------ SECTION
      if (mode === 'section') {
        const lay = { mud: L(INK.paperDark), mudI: L(INK.inkSoft), water: L(INK.blue, { 'fill-opacity': 0.42 }), waterI: L(INK.blue),
          bld: L(INK.paperLight), bldI: L(INK.ink), shipH: L(INK.inkSoft), shipS: L(INK.paperLight), shipI: L(INK.ink),
          shaft: L(INK.paperLight), tun: L(INK.paperLight), tunI: L(INK.inkSoft), lamp: L(INK.gold), flood: L(INK.blue, { 'fill-opacity': 0.85 }),
          floodI: L(INK.paperLight), wall: L(INK.red), shield: L(INK.ink), shieldI: L(INK.paperLight), push: L(INK.red), ink: L(INK.ink),
          bell: L(INK.inkSoft), bags: L(INK.paperDark), fig: L(INK.ink), train: L(INK.red), trainI: L(INK.ink), lab: L(INK.ink) };
        const ys = (P.surface ?? 0.30) * H, yb = (P.bed ?? 0.47) * H, yt = (P.top ?? 0.62) * H, ybt = (P.bottom ?? 0.80) * H;
        const [s0, s1] = P.shafts || [0.1, 0.9], xl = s0 * W, xr = s1 * W, sw = 56;
        const bankY = ys - 26, bx0 = (s0 + 0.05) * W, bx1 = (s1 - 0.05) * W;
        const prof = [[-60, bankY], [bx0, bankY], [bx0 + 0.07 * W, yb - 10], [W * 0.38, yb + 8], [W * 0.55, yb - 4], [W * 0.7, yb + 6], [bx1 - 0.07 * W, yb - 8], [bx1, bankY], [W + 60, bankY]];
        const bedAt = x => { for (let i = 0; i < prof.length - 1; i++) if (x <= prof[i + 1][0]) return lerp(prof[i][1], prof[i + 1][1], (x - prof[i][0]) / (prof[i + 1][0] - prof[i][0])); return bankY; };
        const stones = Array.from({ length: 46 }, () => [rs(), rs(), 5 + rs() * 9]);
        const ships = Array.isArray(P.ships) ? P.ships : Array.from({ length: P.ships ?? 3 }, (_, k) => ({ x: 0.28 + k * 0.22, s: 0.55 + (k % 2) * 0.12, v: (k % 2 ? -1 : 1) * 0.006 }));
        const drift = !!P.drift, dyt = drift ? lerp(yt, ybt, 0.38) : yt, dyb = drift ? lerp(yt, ybt, 0.62) : ybt;
        const bank = P.banks === false ? null : (P.banks || ['Rotherhithe', 'Wapping']);
        const bankT = bank ? bank.map((n, k) => el(root, 'text', { x: k ? bx1 - 40 : bx0 + 40, y: ys + 80, 'font-family': INK_FONT, 'font-size': 50, 'text-anchor': k ? 'end' : 'start',
          fill: INK.ink, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px` })) : [];
        bankT.forEach((tx, k) => { tx.textContent = bank[k]; });
        draw = (lt, t, cues, at) => {
          const o = (s, ex) => Object.assign({ seed: sd + s, t, w: 4, amp: 1 }, ex || {});
          // progress of the dig
          const pr = P.progress == null ? 0.5 : typeof P.progress === 'number' ? P.progress :
            lerp(P.progress.from ?? 0, P.progress.to ?? 1, progIO(lt, at(P.progress.at, 0), P.progress.dur ?? Math.max(1, (P.progress.dur ?? 3))));
          const pushA = P.push ? at(P.push.at, 0.5) : null, nudge = pushA != null ? progIO(lt, pushA, 1.2) * 22 : 0;
          const shX = lerp(xl + sw, xr - sw, pr) + nudge;
          // mud + strata
          const mp = prof.concat([[W + 60, H + 60], [-60, H + 60]]);
          lay.mud.setAttribute('d', inkLoop(mp, o(10, { smooth: false, amp: 0.8 })));
          const MI = [inkPath(prof, o(11, { w: 5, smooth: false }))];
          stones.forEach((s, k) => { const x = s[0] * W, y = lerp(yb + 30, H, s[1]); if (y < bedAt(x) + 14) return; if (x > xl - 80 && x < shX + 30 && y > dyt - 30 && y < dyb + 30) return;
            MI.push(inkPath(inkEllipsePts(x, y, s[2], s[2] * 0.7, sd + 40 + k, 7), o(40 + k, { closed: true, w: 2.4, amp: 0.4 }))); });
          for (let r = 0; r < 3; r++) { const y = lerp(yb + 60, H - 30, r / 2); for (let x = 60 + r * 90; x < W; x += 260) {
            if (x > xl - 90 && x < shX + 60 && y > dyt - 40 && y < dyb + 40) continue; if (y < bedAt(x) + 20) continue;
            MI.push(inkPath([[x, y], [x + 70, y + 5]], o(100 + r * 20 + Math.round(x / 260), { w: 2.2, amp: 0.5 }))); } }
          lay.mudI.setAttribute('d', MI.join(' '));
          // water
          const top = [];
          for (let x = bx0; x <= bx1 + 1; x += 48) top.push([x, ys + Math.sin(x * 0.012 + lt * 1.4) * 5]);
          const bot = prof.filter(p => p[0] > bx0 && p[0] < bx1).slice().reverse();
          lay.water.setAttribute('d', inkLoop(top.concat([[bx1, bankY + 4]], bot, [[bx0, bankY + 4]]), o(200, { smooth: false, amp: 0.6 })));
          const WI = [inkPath(top, o(201, { w: 4 }))];
          for (let r = 0; r < 2; r++) { const y = lerp(ys + 40, yb - 50, r), off = (lt * (18 + r * 6)) % 200;
            for (let x = bx0 + 60 + off; x < bx1 - 120; x += 200) WI.push(inkPath([[x, y], [x + 30, y - 6], [x + 60, y]], o(210 + r * 20 + Math.round((x - off) / 200), { w: 3, amp: 0.6 }))); }
          lay.waterI.setAttribute('d', WI.join(' '));
          // banks: warehouses
          const BF = [], BI = [];
          [[0, xl - 80], [1, xr + 80]].forEach(([k, cx]) => {
            for (let j = 0; j < 2; j++) {
              const x = cx + (j - 0.5) * 150 * (k ? 1 : -1) * 1.0 - 60, w = 120, h = 110 + j * 40;
              const pts = [[x, bankY], [x, bankY - h], [x + w / 2, bankY - h - 50], [x + w, bankY - h], [x + w, bankY]];
              BF.push(inkLoop(pts, o(300 + k * 10 + j, { smooth: false, amp: 0.6 })));
              BI.push(inkPath(pts, o(320 + k * 10 + j, { closed: true, smooth: false, w: 4, amp: 0.6 })));
              BI.push(inkPath(rect(x + w / 2 - 18, bankY - 60, x + w / 2 + 18, bankY), o(340 + k * 10 + j, { closed: true, smooth: false, w: 3, amp: 0.5 })));
            }
          });
          lay.bld.setAttribute('d', BF.join(' ')); lay.bldI.setAttribute('d', BI.join(' '));
          // ships
          const SHH = [], SHS = [], SHI = [];
          ships.forEach((s, k) => { const span = bx1 - bx0 - 200; let x = bx0 + 100 + ((((s.x - s0 - 0.05) / (s1 - s0 - 0.1)) * span + (s.v ?? 0.005) * W * lt) % span + span) % span;
            const r = ship(x, ys, s.s ?? 0.6, sd + 400 + k * 40, t, lt); SHH.push(r.hullF); SHS.push(r.sailF); SHI.push(r.ink); });
          lay.shipH.setAttribute('d', SHH.join(' ')); lay.shipS.setAttribute('d', SHS.join(' ')); lay.shipI.setAttribute('d', SHI.join(' '));
          // shafts
          const SF = [], INKS = [];
          [[xl, true], [xr, P.right_shaft !== false && pr > 0.97]].forEach(([x, on], k) => { if (!on) return;
            const pts = rect(x - sw, bankY, x + sw, ybt + 6);
            SF.push(inkLoop(pts, o(500 + k, { smooth: false, amp: 0.6 })));
            INKS.push(inkPath([[x - sw, bankY], [x - sw, ybt + 6], [x + sw, ybt + 6], [x + sw, bankY]], o(510 + k, { w: 6, smooth: false })));
            for (let y = bankY + 40; y < ybt; y += 46) INKS.push(inkPath([[x - sw + 6, y], [x + sw - 6, y]], o(520 + k * 40 + Math.round(y / 46), { w: 2.4, amp: 0.5 })));
          });
          lay.shaft.setAttribute('d', SF.join(' '));
          // tunnel bore
          const tx0 = xl + sw, TI = [], LG = [];
          if (shX > tx0 + 4) {
            lay.tun.setAttribute('d', inkLoop(rect(tx0, dyt, shX, dyb), o(600, { smooth: false, amp: 0.5 })));
            INKS.push(inkPath([[tx0, dyt], [shX, dyt]], o(601, { w: 6, smooth: false })), inkPath([[tx0, dyb], [shX, dyb]], o(602, { w: 6, smooth: false })));
            if (!drift) {
              let k = 0; const ringA = pushA != null ? pushA + 0.4 : null;
              for (let x = tx0 + 30; x < shX - 10; x += 34, k++) TI.push(inkPath([[x, dyt + 4], [x, dyb - 4]], o(620 + k, { w: 2.2, amp: 0.4 })));
              TI.push(inkPath([[tx0, (dyt + dyb) / 2], [shX - 6, (dyt + dyb) / 2]], o(611, { w: 3, smooth: false, amp: 0.4 })));
              if (P.dark !== true) for (let x = tx0 + 80; x < shX - 40; x += 150) LG.push(inkDot(x, dyt + 26, 8 + Math.sin(lt * 9 + x) * 1.5, null, sd + 700 + Math.round(x), t));
              if (ringA != null && lt > ringA) for (let j = 0; j < 4; j++) { const a = ringA + j * 0.35; if (lt < a) continue; const x = shX - 40 - j * 34;
                LG.push(inkPath([[x, dyt + 4], [x, dyb - 4]], o(760 + j, { w: 9 * spring(lt, a, 0.4), amp: 0.5 }))); }
            } else {
              let k = 0; for (let x = tx0 + 50; x < shX - 20; x += 90, k++) TI.push(inkPath([[x, dyt + 2], [x, dyb - 2]], o(640 + k, { w: 4, amp: 0.4 })));
            }
          } else lay.tun.setAttribute('d', '');
          lay.tunI.setAttribute('d', TI.join(' ')); lay.lamp.setAttribute('d', LG.join(' '));
          // shield (not for the drift)
          if (!drift && shX > tx0 + 4) {
            const sp = rect(shX - 6, dyt - 12, shX + 34, dyb + 12);
            lay.shield.setAttribute('d', inkLoop(sp, o(800, { smooth: false, amp: 0.5 })));
            const SI = [];
            for (let r = 1; r < 3; r++) SI.push(inkPath([[shX, lerp(dyt, dyb, r / 3)], [shX + 28, lerp(dyt, dyb, r / 3)]], o(810 + r, { w: 3, amp: 0.4 })));
            lay.shieldI.setAttribute('d', SI.join(' '));
          } else { lay.shield.setAttribute('d', ''); lay.shieldI.setAttribute('d', ''); }
          // push arrows
          if (pushA != null && lt > pushA) {
            const pul = 1 + 0.15 * Math.sin((lt - pushA) * 7), A = [], y0 = (dyt + dyb) / 2, k = spring(lt, pushA, 0.5);
            [-0.25, 0.25].forEach((dy, j) => { const y = y0 + dy * (dyb - dyt), x1 = shX - 14, x0 = x1 - 110 * k * pul;
              A.push(inkPath([[x0, y], [x1, y]], o(850 + j, { w: 9 })), inkPath([[x1 - 26, y - 20], [x1, y], [x1 - 26, y + 20]], o(860 + j, { w: 9, smooth: false }))); });
            lay.push.setAttribute('d', A.join(' '));
          } else lay.push.setAttribute('d', '');
          // bricked-up face
          const wA = P.wall ? at(P.wall.at, 0.4) : null;
          if (wA != null && lt > wA) {
            const k = spring(lt, wA, 0.5), x = shX - 50, y0 = lerp(dyb, dyt, k);
            lay.wall.setAttribute('d', inkLoop(rect(x, y0, x + 44, dyb), o(870, { smooth: false, amp: 0.5 })));
            const WI2 = []; for (let y = dyb - 22; y > y0; y -= 22) WI2.push(inkPath([[x + 2, y], [x + 42, y]], o(880 + Math.round(y / 22), { w: 2.4, amp: 0.4 })));
            INKS.push(...WI2);
          } else lay.wall.setAttribute('d', '');
          // walkers / train inside the tunnel
          const FG = [];
          if (P.walkers) for (let k = 0; k < P.walkers; k++) { const span = shX - tx0 - 60, u = (((k / P.walkers) + lt * 0.03 * (k % 2 ? -1 : 1)) % 1 + 1) % 1;
            const f = fig(tx0 + 30 + u * span, dyb - 4, 0.32, lt * 6 + k, sd + 900 + k * 9, t); FG.push(f.body, f.head); }
          lay.fig.setAttribute('d', FG.join(' '));
          const trA = P.train ? at(P.train.at, 0.3) : null, TR = [], TRI = [];
          if (trA != null && lt > trA) {
            const x0 = lerp(tx0 - 900, shX + 100, lin(lt, trA, P.train.dur ?? 5)), y0 = dyb - 10, h = (dyb - dyt) * 0.62;
            for (let c = 0; c < 4; c++) { const x = x0 - c * 230; if (x < tx0 - 10 || x - 210 > shX) continue;
              const xa = Math.max(tx0, x - 210), xb = Math.min(shX, x);
              TR.push(inkLoop(rect(xa, y0 - h, xb, y0), o(950 + c, { smooth: false, amp: 0.5 })));
              TRI.push(inkPath(rect(xa, y0 - h, xb, y0), o(960 + c, { closed: true, w: 3.5, smooth: false, amp: 0.5 }))); }
          }
          lay.train.setAttribute('d', TR.join(' ')); lay.trainI.setAttribute('d', TRI.join(' '));
          // flood: breach in the riverbed above, water pours down and fills the bore back to the shaft
          const fA = P.flood ? at(P.flood.at, 0.5) : null;
          if (fA != null && lt > fA) {
            const fx = P.flood.x != null ? P.flood.x * W : shX - 30, k = prog(lt, fA, 0.5), fill = prog(lt, fA + 0.3, P.flood.dur ?? 2.6);
            const bedY = bedAt(fx), w0 = 70 * k, w1 = 26 * k;
            const funnel = [[fx - w0, bedY - 4], [fx + w0, bedY - 4], [fx + w1, dyt + 2], [fx - w1, dyt + 2]];
            const front = lerp(fx, tx0 - (P.flood.shaft === false ? 0 : 0), fill);
            const shaftLvl = lerp(dyb, bankY + 40, prog(lt, fA + 1.6, 3));
            const FP = [inkLoop(funnel, o(1000, { smooth: false, amp: 1.2 })), inkLoop(rect(Math.min(front, fx), dyt + 2, Math.max(fx, Math.min(shX, fx + 40)), dyb - 2), o(1001, { smooth: false, amp: 1 }))];
            if (front <= tx0 + 5) FP.push(inkLoop(rect(xl - sw + 4, shaftLvl, xl + sw - 4, dyb), o(1002, { smooth: false, amp: 0.8 })));
            lay.flood.setAttribute('d', FP.join(' '));
            const FI = [];
            for (let j = 0; j < 6; j++) { const u = ((lt * 2.2 + j / 6) % 1), x = fx + (j - 2.5) * 9 * k, y = lerp(bedY, dyt, u);
              FI.push(inkPath([[x, y], [x + 3, y + 36]], o(1010 + j, { w: 4, amp: 0.4 }))); }
            for (let x = Math.min(front, fx) + 20; x < fx - 20; x += 70) { const y = dyt + 18 + Math.sin(lt * 5 + x * 0.05) * 6;
              FI.push(inkPath([[x, y], [x + 26, y - 6], [x + 52, y]], o(1030 + Math.round(x / 70), { w: 3, amp: 0.5 }))); }
            lay.floodI.setAttribute('d', FI.join(' '));
          } else { lay.flood.setAttribute('d', ''); lay.floodI.setAttribute('d', ''); }
          // diving bell lowered from a boat + clay bags
          const bA = P.bell ? at(P.bell.at, 0.4) : null, BL = [], BG = [];
          if (bA != null && lt > bA) {
            const bxp = P.bell.x != null ? P.bell.x * W : shX - 30, bedY = bedAt(bxp), d = progIO(lt, bA, 1.8), by = lerp(ys + 10, bedY - 60, d);
            const r = ship(bxp + 20, ys, 0.42, sd + 1100, t, lt);
            SHH.push(r.hullF); lay.shipH.setAttribute('d', SHH.join(' ')); SHI.push(inkPath([[bxp, ys - 70], [bxp, by - 50]], o(1110, { w: 3 })));
            lay.shipI.setAttribute('d', SHI.join(' ') + ' ' + r.ink);
            const bell = [[bxp - 34, by - 50], [bxp + 34, by - 50], [bxp + 52, by + 22], [bxp - 52, by + 22]];
            BL.push(inkLoop(bell, o(1120, { amp: 0.8 })));
            INKS.push(inkPath(bell, o(1121, { closed: true, w: 4.5 })));
          }
          const gA = P.bags ? at(P.bags.at, 0.4) : null;
          if (gA != null && lt > gA) {
            const bxp = (P.bell && P.bell.x != null ? P.bell.x * W : shX - 30), bedY = bedAt(bxp);
            for (let j = 0; j < 4; j++) { const a = gA + j * 0.45; if (lt < a) continue; const u = Math.min(1, (lt - a) / 1.1), y = lerp(ys + 10, bedY - 16 - j * 10, u * u), x = bxp + 50 + (j - 1.5) * 26;
              const pts = rect(x - 22, y - 14, x + 22, y + 14); BG.push(inkLoop(pts, o(1150 + j, { amp: 1 }))); INKS.push(inkPath(pts, o(1160 + j, { closed: true, w: 3.5 }))); }
          }
          lay.bell.setAttribute('d', BL.join(' ')); lay.bags.setAttribute('d', BG.join(' '));
          lay.ink.setAttribute('d', INKS.join(' '));
        };
      }

      // ------------------------------------------------------------------ FACE (the shield, 36 cells)
      if (mode === 'face') {
        const lay = { mud: L(INK.paperDark), mudI: L(INK.inkSoft), back: L(INK.inkSoft, { 'fill-opacity': 0.5 }), board: L(INK.paperLight),
          boardI: L(INK.inkSoft), frame: L(INK.ink), lamp: L(INK.gold), drip: L(INK.blue), head: L(INK.paperLight), fig: L(INK.ink), ring: L(INK.red), riv: L(INK.ink) };
        const fx0 = 0.1 * W, fx1 = 0.9 * W, fy0 = 0.15 * H, fy1 = 0.84 * H, cols = 12, rows = 3, cw = (fx1 - fx0) / cols, ch = (fy1 - fy0) / rows;
        const stones = Array.from({ length: 30 }, () => [rs(), rs(), 5 + rs() * 10]);
        const counter = P.counter ? el(root, 'text', { x: (P.counter.x ?? 0.5) * W, y: (P.counter.y ?? 0.08) * H, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900,
          'font-size': P.counter.size || 120, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 16px; stroke-linejoin: round` }) : null;
        const cell = P.cell || [5, 1];
        draw = (lt, t, cues, at) => {
          const o = (s, ex) => Object.assign({ seed: sd + s, t, w: 4, amp: 1 }, ex || {});
          lay.mud.setAttribute('d', inkLoop(rect(-60, -60, W + 60, H + 60), o(1, { smooth: false, amp: 0.5 })));
          const MI = []; stones.forEach((s, k) => { const x = s[0] * W, y = s[1] * H; if (x > fx0 - 20 && x < fx1 + 20 && y > fy0 - 20 && y < fy1 + 20) return;
            MI.push(inkPath(inkEllipsePts(x, y, s[2], s[2] * 0.7, sd + 20 + k, 7), o(20 + k, { closed: true, w: 2.4, amp: 0.4 }))); });
          lay.mudI.setAttribute('d', MI.join(' '));
          const fillA = P.fill ? at(P.fill.at, 0) : null, fillD = P.fill ? (P.fill.dur ?? 3) : 0;
          const drawA = P.draw ? at(P.draw.at, 0) : null, drawD = P.draw ? (P.draw.dur ?? 1.5) : 0;
          const pullA = P.pull ? at(P.pull.at, 0.5) : null, backA = P.pull ? at(P.pull.back, null) : null;
          const BK = [], BD = [], BI = [], FR = [], HD = [], FG = [], RIV = [];
          let shown = 0;
          for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
            const i = c * rows + r, x0 = fx0 + c * cw, y0 = fy0 + r * ch;
            const colOn = drawA == null ? 1 : spring(lt, drawA + c * drawD / cols, 0.45);
            if (colOn <= 0.01) continue;
            BK.push(inkLoop(rect(x0 + 6, y0 + 6, x0 + cw - 6, y0 + ch - 6), o(100 + i, { smooth: false, amp: 0.6 })));
            // poling boards (the top three), the selected one can slide out
            const isSel = c === cell[0] && r === cell[1];
            for (let b = 0; b < 3; b++) {
              let dy = 0; if (isSel && b === 1 && pullA != null && lt > pullA) dy = 54 * progIO(lt, pullA, 0.5) * (backA != null && lt > backA ? 1 - progIO(lt, backA, 0.5) : 1);
              const yb = y0 + 14 + b * 34 + dy, pts = rect(x0 + 12, yb, x0 + cw - 12, yb + 28);
              BD.push(inkLoop(pts, o(200 + i * 4 + b, { smooth: false, amp: 0.5 })));
              BI.push(inkPath(pts, o(300 + i * 4 + b, { closed: true, smooth: false, w: 2.4, amp: 0.4 })));
            }
            // miner
            const on = fillA == null ? 1 : (lt > fillA + (i / (cols * rows)) * fillD ? 1 : 0);
            if (on) { shown++;
              const dig = isSel && pullA != null && lt > pullA + 0.4 && (backA == null || lt < backA);
              const arm = dig ? Math.sin(lt * 9) * 40 : Math.sin(lt * 2.4 + i) * 10;
              const f = fig(x0 + cw / 2, y0 + ch - 10, 0.62, i, sd + 400 + i * 9, t, { arm, raise: dig });
              HD.push(f.head); FG.push(f.body); }
          }
          // iron frame: verticals + storey floors, rivets
          const FW = P.heavy ? 14 : 10;
          for (let c = 0; c <= cols; c++) { const colOn = drawA == null ? 1 : spring(lt, drawA + Math.max(0, c - 1) * drawD / cols, 0.45); if (colOn <= 0.01) continue;
            const x = fx0 + c * cw, y1 = lerp(fy0, fy1, Math.min(1, colOn)); FR.push(inkPath([[x, fy0], [x, y1]], o(500 + c, { w: FW, smooth: false, amp: 0.6 })));
            if (P.heavy) for (let r = 0; r < rows; r++) RIV.push(inkDot(x, fy0 + r * ch + ch / 2, 7, 7, sd + 520 + c * 3 + r, t)); }
          const vis = drawA == null ? 1 : prog(lt, drawA, drawD + 0.4);
          for (let r = 0; r <= rows; r++) FR.push(inkPath([[fx0, fy0 + r * ch], [lerp(fx0, fx1, vis), fy0 + r * ch]], o(540 + r, { w: FW, smooth: false, amp: 0.6 })));
          // screws (jacks) under the frame
          for (let c = 0; c < cols; c += 2) { const x = fx0 + (c + 1) * cw; FR.push(inkPath([[x - 20, fy1 + 8], [x - 20, fy1 + 60], [x + 20, fy1 + 60], [x + 20, fy1 + 8]], o(560 + c, { w: 5, smooth: false, amp: 0.4 }))); }
          lay.back.setAttribute('d', BK.join(' ')); lay.board.setAttribute('d', BD.join(' ')); lay.boardI.setAttribute('d', BI.join(' '));
          lay.head.setAttribute('d', HD.join(' ')); lay.fig.setAttribute('d', FG.join(' ')); lay.frame.setAttribute('d', FR.join(' ')); lay.riv.setAttribute('d', RIV.join(' '));
          // lamps + drips
          const LG = [], DR = [];
          [0.2, 0.5, 0.8].forEach((u, k) => { const x = lerp(fx0, fx1, u) + Math.sin(lt * 1.3 + k) * 4; LG.push(inkDot(x, fy0 - 26, 14 * (1 + 0.12 * Math.sin(lt * 10 + k)), null, sd + 600 + k, t)); });
          for (let j = 0; j < 9; j++) { const u = ((lt * 0.5 + j / 9) % 1), x = lerp(fx0 + 40, fx1 - 40, (j * 0.37) % 1), y = lerp(fy0 - 40, fy0 + ch * 0.7, u);
            DR.push(inkDot(x, y, 6, 9, sd + 620 + j, t)); }
          lay.lamp.setAttribute('d', LG.join(' ')); lay.drip.setAttribute('d', DR.join(' '));
          // red ring on the selected cell
          const rA = P.ring != null ? at(P.ring, null) : null;
          if (rA != null && lt > rA) { const k = spring(lt, rA, 0.5), cx = fx0 + (cell[0] + 0.5) * cw, cy = fy0 + (cell[1] + 0.5) * ch;
            lay.ring.setAttribute('d', inkPath(inkEllipsePts(cx, cy, cw * 0.8 * k, ch * 0.62 * k, sd + 700, 14), o(700, { closed: true, w: 9 })));
          } else lay.ring.setAttribute('d', '');
          if (counter) { const cA = at(P.counter.at, 0); counter.style.display = lt < cA ? 'none' : '';
            counter.textContent = `${fillA == null ? cols * rows : shown}${P.counter.suffix ?? ' cells'}`; }
        };
      }

      // ------------------------------------------------------------------ WORM (shipworm in timber)
      if (mode === 'worm') {
        const lay = { wood: L(INK.paperLight), grain: L(INK.inkSoft), knot: L(INK.inkSoft), holeO: L(INK.ink), holeL: L(INK.paperLight), holeD: L(INK.paperDark),
          body: L(INK.ink), bodyF: L(INK.paperDark), seg: L(INK.inkSoft), plate: L(INK.blue), plateI: L(INK.ink), dust: L(INK.inkSoft), ghost: L(INK.red) };
        const wy0 = 0.06 * H, wy1 = 0.94 * H;
        const holes = (P.holes || [[[0.05, 0.25], [0.3, 0.3], [0.5, 0.22]], [[0.62, 0.86], [0.8, 0.8], [1.02, 0.84]]]).map(h => h.map(p => [p[0] * W, p[1] * H]));
        const WP = P.worm ? (P.worm.path || [[-0.05, 0.6], [0.25, 0.52], [0.45, 0.58], [0.62, 0.5]]).map(p => [p[0] * W, p[1] * H]) : null;
        const lens = []; if (WP) { let a = 0; lens.push(0); for (let i = 1; i < WP.length; i++) { a += Math.hypot(WP[i][0] - WP[i - 1][0], WP[i][1] - WP[i - 1][1]); lens.push(a); } }
        const along = d => { if (!WP) return [0, 0, 0]; d = Math.max(0, Math.min(lens[lens.length - 1], d)); let i = 1; while (i < lens.length - 1 && lens[i] < d) i++;
          const u = (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1), a = WP[i - 1], b = WP[i]; return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), Math.atan2(b[1] - a[1], b[0] - a[0])]; };
        const knots = Array.from({ length: 3 }, () => [0.15 + rs() * 0.7, 0.2 + rs() * 0.6]);
        draw = (lt, t, cues, at) => {
          const o = (s, ex) => Object.assign({ seed: sd + s, t, w: 4, amp: 1 }, ex || {});
          lay.wood.setAttribute('d', inkLoop(rect(-60, wy0, W + 60, wy1), o(1, { smooth: false, amp: 0.6 })));
          const G = [inkPath([[-60, wy0], [W + 60, wy0]], o(2, { w: 6 })), inkPath([[-60, wy1], [W + 60, wy1]], o(3, { w: 6 }))];
          for (let r = 0; r < 14; r++) { const y = lerp(wy0 + 30, wy1 - 30, r / 13), pts = [];
            for (let x = -60; x <= W + 60; x += 120) pts.push([x, y + Math.sin(x * 0.006 + r * 1.7) * 10 + knots.reduce((s, k) => s + 40 * Math.exp(-(((x - k[0] * W) / 160) ** 2 + ((y - k[1] * H) / 70) ** 2)), 0)]);
            G.push(inkPath(pts, o(10 + r, { w: 2.2, amp: 0.6 }))); }
          lay.grain.setAttribute('d', G.join(' '));
          lay.knot.setAttribute('d', knots.map((k, j) => inkPath(inkEllipsePts(k[0] * W, k[1] * H, 46, 22, sd + 40 + j, 12), o(40 + j, { closed: true, w: 3 }))).join(' '));
          const HO = [], HL = [], HDk = [];
          const tube = (pts, s) => { HO.push(inkPath(pts, o(s, { w: 104, amp: 0.8 }))); HL.push(inkPath(pts, o(s + 1, { w: 84, amp: 0.8 }))); HDk.push(inkPath(pts, o(s + 2, { w: 56, amp: 0.8 }))); };
          holes.forEach((h, j) => tube(h, 60 + j * 5));
          let head = null;
          if (WP) {
            const wA = at(P.worm.at, 0), total = lens[lens.length - 1], d = lerp(total * (P.worm.from ?? 0.55), total, lin(lt, wA, P.worm.dur ?? 8));
            const bored = []; for (let k = 0; k <= 30; k++) { const q = along(d * k / 30); bored.push([q[0], q[1]]); }
            tube(bored, 90);
            const body = []; for (let k = 0; k <= 16; k++) { const q = along(d - 34 - k * 40); body.push([q[0] + Math.sin(lt * 3 + k * 0.7) * 3, q[1] + Math.cos(lt * 3 + k * 0.7) * 3]); }
            lay.body.setAttribute('d', inkPath(body, o(120, { w: 62, amp: 0.6, taper: 0.1 })));
            lay.bodyF.setAttribute('d', inkPath(body, o(121, { w: 48, amp: 0.6, taper: 0.1 })));
            const SG = []; body.forEach((p, k) => { if (k % 2 || k === 0) return; const q = along(d - 34 - k * 40), nx = -Math.sin(q[2]), ny = Math.cos(q[2]);
              SG.push(inkPath([[p[0] - nx * 20, p[1] - ny * 20], [p[0] + nx * 20, p[1] + ny * 20]], o(130 + k, { w: 2.4, amp: 0.4 }))); });
            lay.seg.setAttribute('d', SG.join(' '));
            head = along(d);
            const [hx, hy, ha] = head, rock = Math.sin(lt * 7) * 0.35, PL = [], PI = [];
            [-1, 1].forEach(sg => { const a = ha + sg * (0.9 + rock * sg), cx = hx + Math.cos(a) * 22, cy = hy + Math.sin(a) * 22;
              const pts = inkEllipsePts(cx, cy, 42, 26, sd + 150 + sg, 10, a); PL.push(inkLoop(pts, o(150 + sg, { amp: 0.6 }))); PI.push(inkPath(pts, o(155 + sg, { closed: true, w: 4, amp: 0.6 }))); });
            lay.plate.setAttribute('d', PL.join(' ')); lay.plateI.setAttribute('d', PI.join(' '));
            const DU = []; for (let j = 0; j < 10; j++) { const u = (lt * 0.8 + j / 10) % 1, a = ha + (j % 2 ? 1 : -1) * (1.6 + u), r = 50 + u * 90;
              DU.push(inkDot(hx + Math.cos(a) * r, hy + Math.sin(a) * r, 6, 6, sd + 170 + j, t)); }
            lay.dust.setAttribute('d', DU.join(' '));
          }
          lay.holeO.setAttribute('d', HO.join(' ')); lay.holeL.setAttribute('d', HL.join(' ')); lay.holeD.setAttribute('d', HDk.join(' '));
          const gA = P.ghost ? at(P.ghost.at, 1) : null;
          if (gA != null && lt > gA && head) {
            const k = spring(lt, gA, 0.6), cx = head[0] + 90, cy = head[1], w = 380 * k, h = 240 * k, GI = [];
            GI.push(inkPath(rect(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), o(190, { closed: true, w: 7, smooth: false })));
            for (let c = 1; c < 4; c++) GI.push(inkPath([[cx - w / 2 + c * w / 4, cy - h / 2], [cx - w / 2 + c * w / 4, cy + h / 2]], o(191 + c, { w: 4 })));
            for (let r = 1; r < 3; r++) GI.push(inkPath([[cx - w / 2, cy - h / 2 + r * h / 3], [cx + w / 2, cy - h / 2 + r * h / 3]], o(196 + r, { w: 4 })));
            lay.ghost.setAttribute('d', GI.join(' '));
          } else lay.ghost.setAttribute('d', '');
        };
      }

      // ------------------------------------------------------------------ ARCH (inside the tunnel)
      if (mode === 'arch') {
        const lay = { portal: L(INK.paperDark), portalI: L(INK.inkSoft), floor: L(INK.paperDark), inside: L(INK.paperLight), far: L(INK.inkSoft),
          endI: L(INK.ink), endG: L(INK.gold), ring: L(INK.ink), brick: L(INK.inkSoft), stall: L(INK.paperLight), stallR: L(INK.red), stallI: L(INK.ink),
          table: L(INK.paperLight), cloth: L(INK.red), tableI: L(INK.ink), lampG: L(INK.gold), lampI: L(INK.ink), flare: L(INK.red), flareG: L(INK.gold),
          figH: L(INK.paperLight), fig: L(INK.ink), rail: L(INK.inkSoft), train: L(INK.paperLight), trainC: L(INK.red), trainI: L(INK.ink), smoke: L(INK.paperDark),
          beam: L(INK.inkSoft), beamI: L(INK.ink), crack: L(INK.ink), water: L(INK.blue, { 'fill-opacity': 0.82 }), waterI: L(INK.paperLight), drip: L(INK.blue),
          runH: L(INK.paperLight), run: L(INK.ink), runL: L(INK.gold) };
        const cx = W * 0.5, cy = H * (P.vp ?? 0.44), FL = 470, SP = -40, HW = 900, CR = 0.62;
        const N = 9, S = Array.from({ length: N }, (_, k) => 0.98 / (1 + k * 0.62)), sFar = S[N - 1];
        const ringPts = (s, n = 18) => { const p = [[cx - HW * s, cy + FL * s], [cx - HW * s, cy + SP * s]];
          for (let i = 1; i < n; i++) { const a = Math.PI * (1 - i / n); p.push([cx + Math.cos(a) * HW * s, cy + (SP - Math.sin(a) * HW * CR) * s]); }
          p.push([cx + HW * s, cy + SP * s], [cx + HW * s, cy + FL * s]); return p; };
        const P2 = (u, v, s) => [cx + u * s, cy + v * s];
        const halfW = v => v >= SP ? HW : HW * Math.sqrt(Math.max(0, 1 - ((SP - v) / (HW * CR)) ** 2));
        const bricks = Array.from({ length: 70 }, () => [rs(), rs(), rs() < 0.5 ? -1 : 1]);
        const guests = [];
        if (P.table) for (let k = 0; k < 6; k++) guests.push({ s: lerp(0.86, 0.3, k / 5), side: -1 }, { s: lerp(0.86, 0.3, k / 5), side: 1 });
        draw = (lt, t, cues, at) => {
          const o = (s, ex) => Object.assign({ seed: sd + s, t, w: 4, amp: 1 }, ex || {});
          const near = ringPts(S[0], 22);
          // portal brick face around the near ring + walkway in front
          lay.portal.setAttribute('d', inkLoop([[-60, -60], [W + 60, -60], [W + 60, H + 60], [-60, H + 60]], o(1, { smooth: false, amp: 0.5 })) + ' ' + 'M' + near.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L') + ' Z');
          lay.portal.setAttribute('fill-rule', 'evenodd');
          const PI = []; for (let r = 0; r < 12; r++) { const y = 20 + r * 50; for (let x = (r % 2) * 60; x < W; x += 120) { const hw = halfW((y - cy) / S[0]) * S[0];
            if (y < cy + FL * S[0] && Math.abs(x + 30 - cx) < hw + 30) continue; PI.push(inkPath([[x, y], [x + 100, y]], o(10 + r * 20 + Math.round(x / 120), { w: 2.2, amp: 0.5 }))); } }
          lay.portalI.setAttribute('d', PI.join(' '));
          lay.inside.setAttribute('d', inkLoop(near, o(2, { smooth: false, amp: 0.5 })));
          const floor = [P2(-HW, FL, S[0]), P2(HW, FL, S[0]), P2(HW, FL, sFar), P2(-HW, FL, sFar)];
          lay.floor.setAttribute('d', inkLoop([[0, cy + FL * S[0]], [W, cy + FL * S[0]], [W, H + 60], [0, H + 60]], o(3, { smooth: false, amp: 0.5 })) + ' ' + inkLoop(floor, o(4, { smooth: false, amp: 0.5 })));
          // far end
          const far = ringPts(sFar, 14), EI = [], EG = [];
          const end = P.end || 'shield';
          lay.far.setAttribute('d', end === 'open' ? '' : inkLoop(far, o(5, { smooth: false, amp: 0.4 })));
          if (end === 'shield') { const x0 = cx - HW * sFar, x1 = cx + HW * sFar, y0 = cy + (SP - HW * CR) * sFar, y1 = cy + FL * sFar;
            for (let c = 1; c < 6; c++) EI.push(inkPath([[lerp(x0, x1, c / 6), y0 + 10], [lerp(x0, x1, c / 6), y1]], o(30 + c, { w: 3, smooth: false, amp: 0.3 })));
            for (let r = 1; r < 3; r++) EI.push(inkPath([[x0, lerp(y0, y1, r / 3)], [x1, lerp(y0, y1, r / 3)]], o(40 + r, { w: 3, smooth: false, amp: 0.3 })));
            for (let c = 0; c < 6; c++) EG.push(inkDot(lerp(x0, x1, (c + 0.5) / 6), lerp(y0, y1, 0.62), 5 + Math.sin(lt * 8 + c) * 1, null, sd + 50 + c, t)); }
          if (end === 'wall') { const x0 = cx - HW * sFar, x1 = cx + HW * sFar, y0 = cy + (SP - HW * CR) * sFar, y1 = cy + FL * sFar;
            for (let y = y1 - 12, r = 0; y > y0 + 6; y -= 13, r++) EI.push(inkPath([[x0 + 4, y], [x1 - 4, y]], o(60 + r, { w: 1.8, smooth: false, amp: 0.3 }))); }
          lay.endI.setAttribute('d', EI.join(' ')); lay.endG.setAttribute('d', EG.join(' '));
          // rings + converging lines + brick courses
          const RI = [], BR = [];
          S.forEach((s, k) => { RI.push(inkPath(ringPts(s, 18), o(100 + k, { w: Math.max(2, 7 * s), smooth: false, amp: 0.6 }))); if (k < N - 2) RI.push(inkPath(ringPts(s * 0.93, 18), o(120 + k, { w: Math.max(1.5, 3 * s), smooth: false, amp: 0.5 }))); });
          [[-HW, FL], [-HW, SP], [0, SP - HW * CR], [HW, SP], [HW, FL], [-HW * 0.6, FL], [HW * 0.6, FL]].forEach((q, j) => RI.push(inkPath([P2(q[0], q[1], S[0]), P2(q[0], q[1], sFar)], o(140 + j, { w: j > 4 ? 2.4 : 4, smooth: false, amp: 0.5 }))));
          bricks.forEach((b, k) => { const s = lerp(S[0], S[4], b[0]), v = lerp(SP - 20, FL - 40, b[1]), x = cx + b[2] * HW * s, y = cy + v * s, d = 60 * s;
            BR.push(inkPath([[x, y], [x - b[2] * d * 0.6, y - d * 0.05]], o(160 + k, { w: Math.max(1.4, 2.6 * s), amp: 0.4 }))); });
          lay.ring.setAttribute('d', RI.join(' ')); lay.brick.setAttribute('d', BR.join(' '));
          // stalls along the walls
          const ST = [], STR = [], STI = [];
          if (P.stalls) [0.8, 0.5, 0.34].forEach((s, k) => [-1, 1].forEach(sg => { const u = sg * (HW - 150), x = cx + u * s, yF = cy + FL * s, w = 220 * s, h = 300 * s;
            const box = rect(x - w / 2, yF - h * 0.55, x + w / 2, yF), awn = [[x - w * 0.62, yF - h * 0.55], [x + w * 0.62, yF - h * 0.55], [x + w / 2, yF - h * 0.85], [x - w / 2, yF - h * 0.85]];
            ST.push(inkLoop(box, o(200 + k * 2 + sg, { smooth: false, amp: 0.5 }))); STR.push(inkLoop(awn, o(210 + k * 2 + sg, { smooth: false, amp: 0.5 })));
            STI.push(inkPath(box, o(220 + k * 2 + sg, { closed: true, w: 4 * s, smooth: false })), inkPath(awn, o(230 + k * 2 + sg, { closed: true, w: 4 * s, smooth: false })),
              inkPath([[x - w / 2, yF - h * 0.55], [x - w / 2, yF - h * 0.85]], o(240 + k * 2 + sg, { w: 4 * s })), inkPath([[x + w / 2, yF - h * 0.55], [x + w / 2, yF - h * 0.85]], o(250 + k * 2 + sg, { w: 4 * s }))); }));
          lay.stall.setAttribute('d', ST.join(' ')); lay.stallR.setAttribute('d', STR.join(' ')); lay.stallI.setAttribute('d', STI.join(' '));
          // banquet table
          const TB = [], TC = [], TI = [], FG = [], FH = [], LG = [];
          const tA = P.table ? at(P.table.at, 0) : null;
          if (tA != null && lt > tA) {
            const k = spring(lt, tA, 0.6), sN = 0.9, sF = 0.28, tw = 260, th = 330;
            const topP = [P2(-tw, th, sN), P2(tw, th, sN), P2(tw, th, sF), P2(-tw, th, sF)].map(p => [p[0], lerp(cy + FL * 0.9, p[1], k)]);
            TB.push(inkLoop(topP, o(300, { smooth: false, amp: 0.5 })));
            const drape = [topP[0], topP[1], [topP[1][0], topP[1][1] + 90 * sN], [topP[0][0], topP[0][1] + 90 * sN]];
            TC.push(inkLoop(drape, o(301, { smooth: false, amp: 0.5 })));
            TI.push(inkPath(topP, o(302, { closed: true, w: 4, smooth: false })), inkPath(drape, o(303, { closed: true, w: 4, smooth: false })));
            guests.forEach((g, j) => { const x = cx + g.side * (tw + 90) * g.s, yF = cy + FL * g.s, f = fig(x, yF, g.s * 1.7 * k, j, sd + 320 + j * 9, t, { sit: true, face: -g.side, arm: Math.sin(lt * 2 + j) * 14 });
              FG.push(f.body); FH.push(f.head); });
            for (let j = 0; j < 5; j++) { const s = lerp(0.82, 0.32, j / 4), x = cx, y = cy + th * s;
              TI.push(inkPath([[x, y], [x, y - 70 * s]], o(340 + j, { w: Math.max(2, 7 * s) })));
              LG.push(inkDot(x + Math.sin(lt * 9 + j) * 3 * s, y - 86 * s, 11 * s * (1 + 0.15 * Math.sin(lt * 13 + j)), 18 * s, sd + 350 + j, t)); }
          }
          lay.table.setAttribute('d', TB.join(' ')); lay.cloth.setAttribute('d', TC.join(' ')); lay.tableI.setAttribute('d', TI.join(' '));
          // wall lamps (die far to near on `dark`)
          const dA = P.dark ? at(P.dark.at, 1) : null, LI = [];
          S.slice(0, N - 1).forEach((s, k) => [-1, 1].forEach(sg => { const x = cx + sg * (HW - 40) * s, y = cy + (SP - 60) * s;
            LI.push(inkPath([[x, y + 30 * s], [x, y - 10 * s]], o(400 + k * 2 + sg, { w: Math.max(1.5, 4 * s) })));
            const off = dA != null && lt > dA + (N - 2 - k) * 0.22;
            if (!off) LG.push(inkDot(x + Math.sin(lt * 6 + k) * 2 * s, y - 24 * s, 13 * s * (1 + 0.15 * Math.sin(lt * 11 + k * 3 + sg)), 18 * s, sd + 420 + k * 2 + sg, t)); }));
          // gas flare at a lamp
          const flA = P.flare ? at(P.flare.at, 1) : null;
          if (flA != null && lt > flA) { const k = spring(lt, flA, 0.5), s = S[1], x = cx + (HW - 40) * s, y = cy + (SP - 84) * s, F = [], FGd = [];
            for (let j = 0; j < 7; j++) { const a = -Math.PI / 2 + (j - 3) * 0.32, r = (110 + 40 * Math.sin(lt * 14 + j)) * k * s;
              F.push(inkLoop([[x + Math.cos(a - 0.15) * 20 * s, y + Math.sin(a - 0.15) * 20 * s], [x + Math.cos(a) * r, y + Math.sin(a) * r], [x + Math.cos(a + 0.15) * 20 * s, y + Math.sin(a + 0.15) * 20 * s]], o(450 + j, { amp: 1.5 }))); }
            FGd.push(inkDot(x, y, 46 * k * s, 40 * k * s, sd + 470, t));
            lay.flare.setAttribute('d', F.join(' ')); lay.flareG.setAttribute('d', FGd.join(' '));
          } else { lay.flare.setAttribute('d', ''); lay.flareG.setAttribute('d', ''); }
          // walkers (stream away from / towards the camera)
          if (P.walkers) { const n = P.walkers.n ?? 8, wA = at(P.walkers.at, 0), sp = P.walkers.speed ?? 0.09;
            for (let j = 0; j < n; j++) { const ph = ((j * 0.618) % 1), u = ((ph + Math.max(0, lt - wA) * sp) % 1), s = j % 3 === 2 ? lerp(sFar * 1.4, S[0] * 0.62, u) : lerp(S[0] * 0.62, sFar * 1.4, u);
              const lane = ((j * 0.37) % 1) * 2 - 1, x = cx + lane * (HW - 220) * s, f = fig(x, cy + FL * s, s * 1.8, lt * 6 + j, sd + 500 + j * 9, t);
              FG.push(f.body); FH.push(f.head); } }
          // miners at the far shield
          const nM = P.miners === true ? 4 : (P.miners || 0); for (let j = 0; j < nM; j++) { const s = sFar * 1.15, x = cx + (j - (nM - 1) / 2) * 230 * s * (P.miner_scale ?? 2.2) / 2.2, f = fig(x, cy + FL * s, s * (P.miner_scale ?? 2.2), j, sd + 560 + j * 9, t, { arm: Math.sin(lt * 7 + j) * 40, raise: true });
            FG.push(f.body); FH.push(f.head); }
          lay.figH.setAttribute('d', FH.join(' ')); lay.fig.setAttribute('d', FG.join(' '));
          lay.lampG.setAttribute('d', LG.join(' ')); lay.lampI.setAttribute('d', LI.join(' '));
          // train coming towards the camera
          const trA = P.train ? at(P.train.at, 0.3) : null;
          if (trA != null) {
            lay.rail.setAttribute('d', [-170, 170].map((u, j) => inkPath([P2(u, FL, S[0]), P2(u, FL, sFar)], o(600 + j, { w: 5, smooth: false, amp: 0.4 }))).join(' '));
            if (lt > trA) {
              const s = lerp(sFar, P.train.stop ?? 0.78, progIO(lt, trA, P.train.dur ?? 3)), tw = 380, top = P.train.kind === 'steam' ? FL - 600 : FL - 640;
              const body = [P2(-tw, FL - 10, s), P2(-tw, top + 90, s), P2(-tw + 90, top, s), P2(tw - 90, top, s), P2(tw, top + 90, s), P2(tw, FL - 10, s)];
              const TI2 = [inkPath(body, o(620, { closed: true, w: Math.max(2, 7 * s), smooth: false, amp: 0.6 }))], TG = [], TR = [];
              if (P.train.kind === 'steam') {
                TR.push(inkLoop([P2(-tw, FL - 160, s), P2(tw, FL - 160, s), P2(tw, FL - 10, s), P2(-tw, FL - 10, s)], o(621, { smooth: false, amp: 0.5 })));
                TI2.push(inkPath(inkEllipsePts(cx, cy + (FL - 360) * s, 230 * s, 200 * s, sd + 622, 16), o(622, { closed: true, w: Math.max(2, 6 * s) })));
                TI2.push(inkPath([P2(-60, top, s), P2(-60, top - 160, s), P2(60, top - 160, s), P2(60, top, s)], o(623, { w: Math.max(2, 6 * s), smooth: false })));
                TG.push(inkDot(cx, cy + (FL - 360) * s, 60 * s, 60 * s, sd + 624, t));
                const SM = []; for (let j = 0; j < 5; j++) { const u = (lt * 0.7 + j / 5) % 1; SM.push(inkDot(cx + Math.sin(j * 2.1) * 60 * s * u, cy + (top - 180 - u * 260) * s, (40 + u * 60) * s, (34 + u * 50) * s, sd + 630 + j, t)); }
                lay.smoke.setAttribute('d', SM.join(' '));
              } else {
                TR.push(inkLoop([P2(-tw, FL - 200, s), P2(tw, FL - 200, s), P2(tw, FL - 120, s), P2(-tw, FL - 120, s)], o(640, { smooth: false, amp: 0.5 })));
                TI2.push(inkPath([P2(-tw + 60, top + 100, s), P2(tw - 60, top + 100, s), P2(tw - 60, FL - 300, s), P2(-tw + 60, FL - 300, s)], o(641, { closed: true, w: Math.max(2, 6 * s), smooth: false })));
                [-1, 1].forEach(sg => TG.push(inkDot(cx + sg * (tw - 90) * s, cy + (FL - 80) * s, 34 * s, 26 * s, sd + 650 + sg, t)));
                lay.smoke.setAttribute('d', '');
              }
              lay.train.setAttribute('d', inkLoop(body, o(619, { smooth: false, amp: 0.5 }))); lay.trainC.setAttribute('d', TR.join(' '));
              lay.trainI.setAttribute('d', TI2.join(' ')); LG.push(...TG); lay.lampG.setAttribute('d', LG.join(' '));
            } else { lay.train.setAttribute('d', ''); lay.trainC.setAttribute('d', ''); lay.trainI.setAttribute('d', ''); lay.smoke.setAttribute('d', ''); }
          }
          // crack in the crown + drips
          const cA = P.crack ? at(P.crack.at, 0.5) : null;
          if (cA != null && lt > cA) { const k = prog(lt, cA, 0.8), s = S[2], pts = [];
            for (let j = 0; j <= 8; j++) pts.push([cx - 260 * s + j * 65 * s, cy + (SP - HW * CR + 30 + (j % 2 ? 28 : -10)) * s + Math.abs(j - 4) * 20 * s]);
            lay.crack.setAttribute('d', inkPath(pts.slice(0, Math.max(2, Math.round(9 * k))), o(700, { w: 6, smooth: false })));
          } else lay.crack.setAttribute('d', '');
          const DR = [];
          if (P.drips || cA != null) { const n = cA != null && lt > cA ? 14 : 7; for (let j = 0; j < n; j++) { const s = lerp(S[1], S[4], (j * 0.41) % 1), u = (lt * 0.7 + j / n) % 1, x = cx + (((j * 0.29) % 1) * 2 - 1) * 420 * s;
            DR.push(inkDot(x, cy + lerp(SP - HW * CR * 0.8, FL, u) * s, 6 * s + 2, 9 * s + 3, sd + 720 + j, t)); } }
          lay.drip.setAttribute('d', DR.join(' '));
          // falling timber
          const bmA = P.beam ? at(P.beam.at, 1) : null;
          if (bmA != null && lt > bmA) { const u = Math.min(1, (lt - bmA) / 0.7), s = S[1] * 1.1, y = lerp(cy + (SP - 300) * s, cy + (FL - 70) * s, u * u), a = lerp(-0.1, 0.5, u), x = cx + 240 * s;
            const hl = 420 * s, hw = 34 * s, c = Math.cos(a), sn = Math.sin(a), pts = [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]].map(p => [x + p[0] * c - p[1] * sn, y + p[0] * sn + p[1] * c]);
            lay.beam.setAttribute('d', inkLoop(pts, o(760, { smooth: false, amp: 0.6 }))); lay.beamI.setAttribute('d', inkPath(pts, o(761, { closed: true, w: 6, smooth: false })));
          } else { lay.beam.setAttribute('d', ''); lay.beamI.setAttribute('d', ''); }
          // flood: a wall of water rolls from the far end to the camera, then the level keeps rising
          const fA = P.flood ? at(P.flood.at, 0.5) : null;
          const riseA = P.rise ? at(P.rise.at, 0) : null;
          if (fA != null && lt > fA || riseA != null) {
            const lvl0 = P.flood ? (P.flood.level ?? 0.55) : 0;
            let lvl = lvl0; if (riseA != null) lvl = lerp(P.rise.from ?? lvl0, P.rise.to ?? 0.7, progIO(lt, riseA, P.rise.dur ?? 3));
            const vW = FL - lvl * (FL - (SP - HW * CR)), hw = halfW(vW);
            const sFront = fA != null && lt > fA ? lerp(sFar, 1.3, lin(lt, fA, P.flood.dur ?? 2.2) ** 1.6) : (riseA != null ? 1.3 : sFar);
            const WP = [], WI = [];
            if (sFront < 1.25) {
              const sf = sFront, crest = [];
              for (let j = 0; j <= 16; j++) { const u = j / 16 * 2 - 1, v = vW - 40 * Math.abs(Math.sin(lt * 4 + j)) - 30 * (1 - Math.abs(u)); crest.push([cx + u * Math.min(hw, halfW(v)) * sf, cy + v * sf]); }
              WP.push(inkLoop(crest.concat([P2(HW, FL, sf), P2(-HW, FL, sf)]), o(800, { smooth: false, amp: 1.5 })));
              WP.push(inkLoop([P2(-hw, vW, sf), P2(hw, vW, sf), P2(hw, vW, sFar), P2(-hw, vW, sFar)], o(801, { smooth: false, amp: 1 })));
              WI.push(inkPath(crest, o(802, { w: Math.max(3, 9 * sf) })));
              for (let j = 0; j < 12; j++) { const u = (lt * 1.6 + j / 12) % 1, x = cx + (((j * 0.53) % 1) * 2 - 1) * hw * sf, y = cy + (vW - 20) * sf - u * 120 * sf;
                WI.push(inkDot(x, y, 9 * sf + 2, 9 * sf + 2, sd + 810 + j, t)); }
              for (let r = 0; r < 4; r++) { const y = cy + lerp(vW + 60, FL - 40, r / 3) * sf; for (let j = -3; j <= 3; j++) { const x = cx + j * 220 * sf + ((lt * 120 * (r % 2 ? 1 : -1)) % (220 * sf));
                WI.push(inkPath([[x, y], [x + 50 * sf, y - 12 * sf], [x + 100 * sf, y]], o(830 + r * 10 + j, { w: Math.max(2, 4 * sf), amp: 0.6 }))); } }
            } else {
              const yN = cy + vW * S[0];
              WP.push(inkLoop([[-60, yN], [W + 60, yN], [W + 60, H + 60], [-60, H + 60]], o(850, { smooth: false, amp: 1 })));
              for (let r = 0; r < 5; r++) { const y = lerp(yN + 30, H - 20, r / 4); for (let x = -200 + ((lt * 90 * (r % 2 ? 1 : -1)) % 260 + 260) % 260; x < W + 100; x += 260)
                WI.push(inkPath([[x, y], [x + 60, y - 14], [x + 120, y]], o(860 + r * 12 + Math.round(x / 260), { w: 5, amp: 0.7 }))); }
              for (let j = 0; j < 10; j++) { const u = (lt * 1.2 + j / 10) % 1; WI.push(inkDot(((j * 0.37) % 1) * W, yN - u * 90, 10, 10, sd + 880 + j, t)); }
            }
            lay.water.setAttribute('d', WP.join(' ')); lay.waterI.setAttribute('d', WI.join(' '));
          } else { lay.water.setAttribute('d', ''); lay.waterI.setAttribute('d', ''); }
          // a miner running at the camera with a lantern, in front of the water
          const rA = P.runner ? at(P.runner.at, 0) : null;
          if (rA != null && lt > rA - 0.01) {
            const u = lin(lt, rA, P.runner.dur ?? 2.6), s = lerp(P.runner.from ?? 0.3, P.runner.to ?? 0.8, u), x = cx + (P.runner.u ?? 140) * s, yF = cy + FL * s, sc = s * 2.2;
            const f = fig(x, yF, sc, lt * 14, sd + 980, t, { raise: true });
            lay.run.setAttribute('d', f.body); lay.runH.setAttribute('d', f.head);
            lay.runL.setAttribute('d', inkDot(x + 30 * sc, yF - 175 * sc + 20 * sc, 16 * sc * (1 + 0.15 * Math.sin(lt * 12)), 20 * sc, sd + 990, t));
          } else { lay.run.setAttribute('d', ''); lay.runH.setAttribute('d', ''); lay.runL.setAttribute('d', ''); }
        };
      }

      // ---- overlays usable in every mode (mode "room" = only these + cast on the scene's set)
      const OV = { bedF: L(INK.paperLight), bedI: L(INK.ink), planF: L(INK.paperLight), planI: L(INK.ink), planS: L(INK.inkSoft), planX: L(INK.red),
        boothF: L(INK.paperLight), boothR: L(INK.red), boothI: L(INK.ink), coin: L(INK.gold) };
      if (P.booth) { const bx = (P.booth.x ?? 0.17) * W; const tx = el(cam, 'text', { x: bx, y: 0.5 * H, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 52,
        'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink }); tx.textContent = P.booth.text || '1 PENNY'; }
      const castG = el(cam, 'g');
      const OV2 = { blanket: L(INK.blue), blanketI: L(INK.ink), crutch: L(INK.ink) };
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const hit = punch(lt, at('hit', null), 0.6), shA = at(P.shake, null), shk = shA == null ? 0 : punch(lt, shA, 1.0);
          B.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.05, focus: [0.5, 0.5] }, P.cam || {}), hit, shk);
          if (draw) draw(lt, t, cues, at);
          const o = (s2, ex) => Object.assign({ seed: sd + 2000 + s2, t, w: 5, amp: 0.8 }, ex || {});
          if (P.sickbed) { const bx = (P.sickbed.x ?? 0.3) * W, gy = (P.sickbed.y ?? 0.86) * H, bw = (P.sickbed.w ?? 0.36) * W, top = gy - 150;
            const mat = rect(bx - bw / 2, top, bx + bw / 2, top + 70), head = rect(bx - bw / 2 - 20, top - 150, bx - bw / 2 + 10, gy);
            OV.bedF.setAttribute('d', inkLoop(mat, o(1, { smooth: false })) + ' ' + inkLoop(head, o(2, { smooth: false })));
            OV.bedI.setAttribute('d', [inkPath(mat, o(3, { closed: true, smooth: false })), inkPath(head, o(4, { closed: true, smooth: false })),
              inkPath([[bx + bw / 2 - 10, top + 70], [bx + bw / 2 - 10, gy]], o(5)), inkPath([[bx - bw / 2 + 20, top + 70], [bx - bw / 2 + 20, gy]], o(6))].join(' '));
            const bl = [[bx - bw * 0.12, top - 60 + Math.sin(lt * 1.5) * 3], [bx + bw / 2 + 14, top - 10], [bx + bw / 2 + 24, top + 110], [bx - bw * 0.16, top + 100]];
            OV2.blanket.setAttribute('d', inkLoop(bl, o(7, { amp: 1.2 })));
            OV2.blanketI.setAttribute('d', inkPath(bl, o(8, { closed: true })) + ' ' + inkPath([[bx, top - 30], [bx + bw * 0.3, top + 30]], o(9, { w: 3 }))); }
          if (P.plan) { const x0 = 0.3 * W, x1 = 0.8 * W, y0 = 0.16 * H, y1 = 0.62 * H, dk = 0.7 * H;
            const sheet = rect(x0, y0, x1, y1), desk = rect(x0 - 80, dk, x1 + 80, dk + 34);
            OV.planF.setAttribute('d', inkLoop(sheet, o(20, { smooth: false })) + ' ' + inkLoop(desk, o(21, { smooth: false })));
            const PI = [inkPath(sheet, o(22, { closed: true, smooth: false })), inkPath(desk, o(23, { closed: true, smooth: false })),
              inkPath([[x0 - 40, dk + 34], [x0 - 40, 0.86 * H]], o(24, { w: 7 })), inkPath([[x1 + 40, dk + 34], [x1 + 40, 0.86 * H]], o(25, { w: 7 })),
              inkPath([[x0 + 40, y1], [x0 + 20, dk]], o(26, { w: 6 })), inkPath([[x1 - 40, y1], [x1 - 20, dk]], o(27, { w: 6 }))];
            const gy = lerp(y0, y1, 0.3), ty = lerp(y0, y1, 0.75), sxL = lerp(x0, x1, 0.18), sxR = lerp(x0, x1, 0.82);
            PI.push(inkPath([[x0 + 20, gy], [x1 - 20, gy]], o(28, { w: 4 })), inkPath([[sxL, ty], [sxR, ty]], o(29, { w: 8 })),
              inkPath([[sxL, gy], [sxL, ty]], o(30, { w: 6 })), inkPath([[sxR, gy], [sxR, ty]], o(31, { w: 6 })));
            OV.planI.setAttribute('d', PI.join(' '));
            // spiral cart ramps: switchbacks winding down around each shaft
            const SS = []; [[sxL, -1], [sxR, 1]].forEach(([sx, sg], j) => { const pts = [], n = 5;
              for (let k = 0; k <= n; k++) pts.push([sx + sg * 26 + sg * (k % 2 ? 150 : 10), lerp(gy + 6, ty - 6, k / n)]);
              SS.push(inkPath(pts, o(40 + j * 10, { w: 7, smooth: false })), inkPath(pts.map(q => [q[0], q[1] + 18]), o(48 + j * 10, { w: 3, smooth: false }))); });
            OV.planS.setAttribute('d', SS.join(' '));
            const xA = P.plan.cross != null ? at(P.plan.cross, null) : null;
            if (xA != null && lt > xA) { const XX = []; [sxL - 90, sxR + 110].forEach((cxx, j) => { const k = spring(lt, xA + j * 0.25, 0.4), r = 70 * k, cyy = (gy + ty) / 2;
              XX.push(inkPath([[cxx - r, cyy - r], [cxx + r, cyy + r]], o(60 + j, { w: 12 })), inkPath([[cxx + r, cyy - r], [cxx - r, cyy + r]], o(62 + j, { w: 12 }))); });
              OV.planX.setAttribute('d', XX.join(' ')); } else OV.planX.setAttribute('d', ''); }
          if (P.booth) { const bx = (P.booth.x ?? 0.17) * W, w = 0.22 * W, gy = 0.92 * H, top = 0.4 * H;
            const body = rect(bx - w / 2, top, bx + w / 2, gy), roof = [[bx - w / 2 - 30, top], [bx + w / 2 + 30, top], [bx + w / 2, top - 70], [bx - w / 2, top - 70]], win = rect(bx - w / 2 + 30, top + 140, bx + w / 2 - 30, top + 260);
            OV.boothF.setAttribute('d', inkLoop(body, o(70, { smooth: false }))); OV.boothR.setAttribute('d', inkLoop(roof, o(71, { smooth: false })));
            OV.boothI.setAttribute('d', [inkPath(body, o(72, { closed: true, smooth: false })), inkPath(roof, o(73, { closed: true, smooth: false })), inkPath(win, o(74, { closed: true, smooth: false })),
              inkPath([[bx - w / 2, top + 300], [bx + w / 2, top + 300]], o(75, { w: 7 }))].join(' '));
            const ca = P.booth.at != null ? at(P.booth.at, null) : null, cs = ca == null ? 1 : spring(lt, ca, 0.5);
            OV.coin.setAttribute('d', ca != null && lt < ca ? '' : inkDot(bx + 40, top + 280 - 30 * cs, 34 * cs, 34 * cs, sd + 2080, t)); }
          const res = cast.update(lt, t, cues) || [];
          if (P.crutch != null) { const r = res[P.crutch]; if (r) { const S2 = r.s, f = r.face, x = r.x + f * 70 * S2, top = r.y - 330 * S2;
            OV2.crutch.setAttribute('d', inkPath([[x, top], [x + f * 26 * S2, r.y]], o(90, { w: 8 })) + ' ' + inkPath([[x - 34 * S2, top], [x + 34 * S2, top]], o(91, { w: 9 }))); } }
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();

// one scene type per mode (tt_section, tt_face, tt_worm, tt_arch): same parameters as tt_tunnel without "mode"
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const mk = m => ctx => SH.tt_tunnel.build(Object.assign({}, ctx, { P: Object.assign({}, ctx.P, { mode: m }) }));
  SH.tt_section = { kind: '2d', build: mk('section') };
  SH.tt_face = { kind: '2d', build: mk('face') };
  SH.tt_worm = { kind: '2d', build: mk('worm') };
  SH.tt_arch = { kind: '2d', build: mk('arch') };
  SH.tt_room = { kind: '2d', build: mk('room') };
})();
