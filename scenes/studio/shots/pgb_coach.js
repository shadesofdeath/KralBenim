// pgb_coach: a six-horse stagecoach on a winding mountain road in parchment ink (BRAND.md §3, §5; boils at 8 Hz via
// _ink.js; pure function of (seed, lt)). Written for Phineas Gage in Chile (Valparaíso-Santiago road, 1850s),
// parametric: far snow-capped peaks with a switchback road climbing them, mid hills, cacti / rocks by the road, a
// road band with ruts, the coach (luggage on the roof, spoked wheels that turn, a driver on the box with reins and a
// whip that cracks on a cue), 1-3 pairs of galloping horses, dust puffs, parallax camera follow, two signposts with
// place names, an optional note card and the narrator (standing by the road or riding on the roof).
//   P: {dir: 1 (1 = left to right, -1 = right to left), from: 0.12, to: 0.6 (coach centre x, 0..1 W, over the scene),
//       pairs: 3 (horse pairs), scale: 0.85, road: 0.8 (0..1 H, wheel ground), peaks: true, switchback: true,
//       driver: {gage: true, accessory, beard, emotion}, whip: cue (crack) | [cues],
//       signs: [{text: "VALPARAÍSO", x: 0.06, at}, {text: "SANTIAGO", x: 0.94, at}], note: {text, at, x, y} (window.MCB label),
//       kasif: {ride: true, pose: "sit"|"wave"|"look", seq} | {x: 0.85, pose: "wave", face, seq} | false,
//       labels: [window.MCB labels], speed: 1 (gallop rate), cam: {zoom, focus}}
//   cues: hit (punch), whip, sign/note/label "at", kasif seq
// Needs pgb__lib.js (window.PGB) and mcB__lib.js (window.MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';

  SH.pgb_coach = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1 } = window.PGB, MCB = window.MCB;
      const sd = seed * 1000 + 947;
      const dir = P.dir === -1 ? -1 : 1, S = P.scale ?? 0.85, RY = (P.road ?? 0.8) * H, pairs = Math.max(1, Math.min(3, P.pairs ?? 3));
      const root = el(svg, 'g');
      const far = el(root, 'g'), mid = el(root, 'g'), near = el(root, 'g');
      const peaks = P.peaks === false ? null : { f: inkEl(far, INK.paperDark, { 'fill-opacity': 0.7 }), r: inkEl(far, INK.inkSoft), snow: inkEl(far, INK.paperLight), sw: inkEl(far, INK.inkSoft) };
      const hills = { f: inkEl(mid, INK.paperDark), r: inkEl(mid), cacti: inkEl(mid, INK.green), cR: inkEl(mid) };
      const road = { f: inkEl(near, INK.paperLight, { 'fill-opacity': 0.7 }), r: inkEl(near), ruts: inkEl(near, INK.inkSoft) };
      const signs = (P.signs || []).map((s, i) => {
        const g = el(near, 'g'), post = inkEl(g, INK.hat), r = inkEl(g), board = inkEl(g, INK.paperLight);
        const tx = el(g, 'text', { x: 0, y: -232, 'font-family': FR, 'font-weight': 900, 'font-size': 46, 'text-anchor': 'middle', fill: INK.ink });
        tx.textContent = String(s.text).toLocaleUpperCase(LOCALE);
        let w = 240; try { w = tx.getComputedTextLength(); } catch (e) {}
        return { s, g, post, r, board, w };
      });
      // the rig: [coach + horses] in one group (drawn facing right, mirrored for dir -1)
      const rig = el(near, 'g'), rigIn = el(rig, 'g');
      const dust = Array.from({ length: 8 }, () => inkEl(rigIn, INK.paperDark, { 'fill-opacity': 0.8 }));
      const dustR = inkEl(rigIn, INK.inkSoft);
      const horses = [];
      for (let p = 0; p < pairs; p++) for (const nearH of [false, true]) {
        const hg = el(rigIn, 'g');
        horses.push({ p, nearH, h: window.PGB.horse(hg, sd + 300 + p * 20 + (nearH ? 10 : 0), nearH), hg });
      }
      const coach = { body: inkEl(rigIn, INK.hat), bodyR: inkEl(rigIn), win: inkEl(rigIn, INK.paperLight), winR: inkEl(rigIn), trim: inkEl(rigIn, INK.gold),
        lug: inkEl(rigIn, INK.paperDark), lugR: inkEl(rigIn), box: inkEl(rigIn, INK.hatBand), wheels: [0, 1].map(() => ({ r: inkEl(rigIn), sp: inkEl(rigIn) })) };
      const reins = inkEl(rigIn), whip = inkEl(rigIn), crack = inkEl(rigIn, INK.red);
      const drv = Object.assign({ who: 'gage', gage: true, emotion: 'happy' }, P.driver || {});
      const drvC = window.PGB.cast(el(rigIn, 'g'), [Object.assign({ x: 0, y: 0, scale: 0.5, pose: 'sit', face: 'right' }, drv)], 1, 1, sd + 500);
      const KR = P.kasif && P.kasif.ride ? Object.assign({ who: 'kasif', x: 0, y: 0, scale: 0.42, pose: 'sit', face: 'right' }, P.kasif) : null;
      const kRide = KR ? window.PGB.cast(el(rigIn, 'g'), [KR], 1, 1, sd + 600) : null;
      const KS = P.kasif && !P.kasif.ride ? Object.assign({ who: 'kasif', x: 0.86, y: 0.95, scale: 0.62, pose: 'wave', face: dir > 0 ? 'left' : 'right' }, P.kasif) : null;
      const kStand = KS ? window.PGB.cast(el(root, 'g'), [KS], W, H, sd + 700) : null;
      const lb = MCB.labels(el(root, 'g'), (P.labels || []).concat(P.note ? [Object.assign({ x: 0.5, y: 0.14, size: 76, color: 'red', font: 'hand' }, P.note)] : []), W, H, sd + 400);
      const CL = 330, HP = 230;   // coach length, horse pair spacing (rig units)
      const R = rng(sd + 9), DP = dust.map(() => [R(), R(), R()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const u = progIO(lt, 0, Math.max(1, dur)), cx = lerp(P.from ?? 0.12, P.to ?? 0.6, u) * W;
          const travel = (lt * 140) * (P.speed ?? 1);        // parallax drift (px)
          const zoom = (P.cam && P.cam.zoom) || 1.04, z = lerp(1, zoom, u) * (1 + 0.025 * hit);
          const camX = -dir * (cx - W / 2) * 0.25;
          [[far, 0.15], [mid, 0.45], [near, 1]].forEach(([g, k]) => g.setAttribute('transform', `translate(${f1(W / 2 + camX * k)} ${f1(H * 0.6)}) scale(${z.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.6)})`));
          // far peaks + switchback road
          if (peaks) {
            const off = -dir * travel * 0.05, pk = [];
            for (let k = -1; k < 8; k++) { const x = k * 300 + off % 300; pk.push([x, RY - 300], [x + 150, RY - 560 - (k % 3) * 70]); }
            pk.push([2700, RY - 300]);
            const pts = pk.concat([[2700, RY], [-400, RY]]);
            peaks.f.setAttribute('d', inkLoop(pts, { seed: sd + 1, t, amp: 1, smooth: false }));
            peaks.r.setAttribute('d', inkPath(pk, { w: 4, seed: sd + 2, t, amp: 1.2, smooth: false }));
            let sn = '';
            for (let k = -1; k < 8; k++) { const x = k * 300 + off % 300 + 150, y = RY - 560 - (((k % 3) + 3) % 3) * 70;
              sn += inkLoop([[x, y], [x + 52, y + 90], [x + 22, y + 74], [x, y + 96], [x - 24, y + 76], [x - 52, y + 90]], { seed: sd + 3 + k, t, amp: 0.8 }) + ' '; }
            peaks.snow.setAttribute('d', sn);
            if (P.switchback !== false) {
              const k0 = 3, px = k0 * 300 + off % 300 + 150, py = RY - 560 - (k0 % 3) * 70, zz = [];
              for (let k = 0; k < 7; k++) { const yy = RY - 300 - k * (RY - 300 - py - 110) / 6, hw = 120 * (1 - k / 7) + 14;
                zz.push([px + (k % 2 ? hw : -hw) * 0.9, yy]); }
              peaks.sw.setAttribute('d', inkPath(zz, { w: 3.5, seed: sd + 12, t, amp: 0.8 }));
            }
          }
          // mid hills + cacti
          {
            const off = (-dir * travel * 0.35) % 480, hp = [];
            for (let x = -480; x <= W + 960; x += 80) hp.push([x + off, RY - 150 - Math.sin((x) * 0.0131) * 40 - Math.sin(x * 0.005) * 30]);
            hills.f.setAttribute('d', inkLoop(hp.concat([[W + 960 + off, RY], [-480 + off, RY]]), { seed: sd + 20, t, amp: 1, smooth: false }));
            hills.r.setAttribute('d', inkPath(hp, { w: 4.5, seed: sd + 21, t, amp: 1.2 }));
            let cf = '', cr = '';
            for (let k = 0; k < 6; k++) { const x = (k * 480 + 200 + off * 2.2) % (W + 600) - 200, y = RY - 40;
              const cp = [[x - 14, y], [x - 14, y - 130], [x, y - 146], [x + 14, y - 130], [x + 14, y]];
              const arm = [[x + 14, y - 70], [x + 46, y - 70], [x + 46, y - 110]];
              cf += inkLoop(cp, { seed: sd + 30 + k, t, amp: 0.8 }) + ' ';
              cr += inkPath(cp, { w: 4, seed: sd + 36 + k, t, amp: 1, closed: true }) + ' ' + inkPath(arm, { w: 12, seed: sd + 42 + k, t, amp: 0.8 }) + ' '; }
            hills.cacti.setAttribute('d', cf); hills.cR.setAttribute('d', cr);
          }
          // road band with ruts
          {
            const top = [], bot = [];
            for (let x = -300; x <= W + 300; x += 80) { const wv = Math.sin(x * 0.004 + 1) * 14; top.push([x, RY - 40 + wv]); bot.push([x, RY + 70 + wv * 0.5]); }
            road.f.setAttribute('d', inkLoop(top.concat(bot.slice().reverse()), { seed: sd + 50, t, amp: 1, smooth: false }));
            road.r.setAttribute('d', inkPath(top, { w: 5, seed: sd + 51, t, amp: 1.2 }) + ' ' + inkPath(bot, { w: 5, seed: sd + 52, t, amp: 1.2 }));
            const off = (-dir * travel) % 160; let rd = '';
            for (let k = -2; k < 16; k++) { const x = k * 160 + off; rd += inkPath([[x, RY + 20], [x + 70, RY + 22]], { w: 3, seed: sd + 53 + k, t, amp: 0.8 }) + ' '; }
            road.ruts.setAttribute('d', rd);
          }
          // signposts (fixed to the road)
          signs.forEach((g, i) => {
            const s = g.s, a = atOr(cues, s.at, 0), p = lt >= a ? spring(lt, a, 0.5) : 0;
            g.g.style.display = p > 0.01 ? '' : 'none';
            const x = s.x * W, w = g.w + 50;
            g.g.setAttribute('transform', `translate(${f1(x)} ${f1(RY - 30)}) scale(1 ${f1(p * 1000) / 1000})`);
            const pp = [[-8, 0], [-8, -200], [8, -200], [8, 0]];
            g.post.setAttribute('d', inkLoop(pp, { seed: sd + 70 + i, t, amp: 0.6, smooth: false }));
            const bp = [[-w / 2, -280], [w / 2, -282], [w / 2 + (s.x > 0.5 ? 26 : 0), -246], [w / 2, -206], [-w / 2, -204], [-w / 2 - (s.x > 0.5 ? 0 : 26), -244]];
            g.board.setAttribute('d', inkLoop(bp, { seed: sd + 72 + i, t, amp: 0.8, smooth: false }));
            g.r.setAttribute('d', inkPath(bp, { w: 4.5, seed: sd + 74 + i, t, amp: 1, closed: true, smooth: false }) + ' ' + inkPath(pp, { w: 4, seed: sd + 76 + i, t, amp: 0.8, closed: true, smooth: false }));
          });
          // the rig
          const bounce = Math.abs(Math.sin(lt * 7.5)) * 6;
          rig.setAttribute('transform', `translate(${f1(cx)} ${f1(RY)}) scale(${f1(dir * S * 1000) / 1000} ${S})`);
          const gal = lt * 1.9 * (P.speed ?? 1);
          // dust behind the wheels
          let dr = '';
          dust.forEach((d, i) => {
            const [r0, r1, r2] = DP[i], ph = (r0 + lt * 0.8) % 1, x = -CL / 2 - 40 - ph * 260, y = -20 - ph * 70 - r1 * 30, r = 24 + ph * 40 + r2 * 10;
            const pts = inkEllipsePts(x, y, r, r * 0.7, sd + 80 + i, 10);
            d.setAttribute('d', ph < 0.92 ? inkLoop(pts, { seed: sd + 80 + i, t, amp: 1 }) : '');
            if (i % 2 === 0 && ph < 0.92) dr += inkPath(pts, { w: 3, seed: sd + 90 + i, t, amp: 1, closed: true }) + ' ';
          });
          dustR.setAttribute('d', dr);
          // horses (far horse of each pair slightly higher and behind; near horse in front)
          horses.forEach(({ p, nearH, h, hg }) => {
            const hx = CL / 2 + 180 + p * HP + (nearH ? 0 : 26), hy = nearH ? 0 : -18;
            hg.setAttribute('transform', `translate(${f1(hx)} ${f1(hy)}) scale(0.95)`);
            h.update(t, gal + p * 0.17 + (nearH ? 0.08 : 0));
          });
          // coach body
          const by = -78 - bounce;
          const body = [[-CL / 2, by], [-CL / 2 - 10, by - 150], [-CL / 2 + 20, by - 196], [CL / 2 - 20, by - 196], [CL / 2 + 10, by - 150], [CL / 2, by], [CL / 2 - 30, by + 20], [-CL / 2 + 30, by + 20]];
          coach.body.setAttribute('d', inkLoop(body, { seed: sd + 100, t, amp: 1 }));
          coach.bodyR.setAttribute('d', inkPath(body, { w: 6, seed: sd + 101, t, amp: 1.2, closed: true }));
          const wins = [[-110, -10], [10, 110]].map(([a, b]) => [[a, by - 170], [b, by - 170], [b, by - 90], [a, by - 90]]);
          coach.win.setAttribute('d', wins.map((w, i) => inkLoop(w, { seed: sd + 102 + i, t, amp: 0.6, smooth: false })).join(' '));
          coach.winR.setAttribute('d', wins.map((w, i) => inkPath(w, { w: 4, seed: sd + 104 + i, t, amp: 0.8, closed: true, smooth: false })).join(' '));
          coach.trim.setAttribute('d', inkPath([[-CL / 2 + 6, by - 60], [CL / 2 - 6, by - 60]], { w: 9, seed: sd + 106, t, amp: 0.8 }));
          const lg = [[-120, by - 196], [-110, by - 250], [60, by - 252], [70, by - 196]];
          coach.lug.setAttribute('d', inkLoop(lg, { seed: sd + 107, t, amp: 1, smooth: false }));
          coach.lugR.setAttribute('d', inkPath(lg, { w: 4.5, seed: sd + 108, t, amp: 1, closed: true, smooth: false }) + ' ' + inkPath([[-30, by - 196], [-26, by - 252]], { w: 4, seed: sd + 109, t, amp: 0.8 }));
          const bx = [[CL / 2 - 10, by - 150], [CL / 2 + 80, by - 150], [CL / 2 + 70, by - 110], [CL / 2, by - 100]];
          coach.box.setAttribute('d', inkLoop(bx, { seed: sd + 110, t, amp: 0.8, smooth: false }));
          // wheels (spokes turn)
          const rot = lt * 6 * (P.speed ?? 1);
          coach.wheels.forEach((w, i) => {
            const wx = i ? CL / 2 - 60 : -CL / 2 + 60, wy = -62, r = 62;
            w.r.setAttribute('d', inkPath(inkEllipsePts(wx, wy, r, r, sd + 120 + i, 16), { w: 7, seed: sd + 120 + i, t, amp: 1, closed: true }));
            let sp = ''; for (let k = 0; k < 4; k++) { const a = rot + k * Math.PI / 4; sp += inkPath([[wx - Math.cos(a) * r, wy - Math.sin(a) * r], [wx + Math.cos(a) * r, wy + Math.sin(a) * r]], { w: 4, seed: sd + 124 + k + i * 4, t, amp: 0.6 }) + ' '; }
            w.sp.setAttribute('d', sp + inkDot(wx, wy, 10, 10, sd + 132 + i, t));
          });
          // driver on the box (cast in rig units: x/y are absolute because W = H = 1)
          const dX = CL / 2 + 40, dY = by - 150;
          const di = drvC.items[0]; di.m.x = dX; di.m.y = dY;
          const wa = [].concat(P.whip || []).map(c => atOr(cues, c, null)).filter(v => v != null);
          const lastW = wa.filter(v => v <= lt).pop();
          di.m.pose = lastW != null && lt - lastW < 0.6 ? 'point' : 'sit'; di.m.dir = 60;
          drvC.update(lt, t, cues);
          if (kRide) { const ki = kRide.items[0]; ki.m.x = -40; ki.m.y = by - 250; kRide.update(lt, t, cues); }
          // reins to the first horse pair, whip (short stock, lash cracks forward on the cue)
          const hand = [dX + 46, dY - 104];
          const lead = CL / 2 + 170 + 128;
          reins.setAttribute('d', inkPath([hand, [lerp(hand[0], lead, 0.5), lerp(hand[1], -190, 0.5) + 14 + Math.sin(lt * 7) * 6], [lead, -190]], { w: 3, seed: sd + 140, t, amp: 0.8 }));
          const wp = lastW != null ? prog(lt, lastW, 0.25) * (1 - prog(lt, lastW + 0.3, 0.4)) : 0;
          const top = [hand[0] + 24, hand[1] - 110];
          const tip = [top[0] + 70 + wp * 110, top[1] - 30 + wp * 70 + Math.sin(lt * 3) * 6];
          whip.setAttribute('d', inkPath([hand, top], { w: 5, seed: sd + 141, t, amp: 0.8 }) + ' ' +
            inkPath([top, [lerp(top[0], tip[0], 0.5), Math.min(top[1], tip[1]) - 26], tip], { w: 3, seed: sd + 142, t, amp: 0.8, taper: 0.7 }));
          let cd = '';
          if (lastW != null && lt - lastW < 0.45 && lt - lastW > 0.12) for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5 + 0.3, r0 = 18, r1 = 46;
            cd += inkPath([[tip[0] + Math.cos(a) * r0, tip[1] + Math.sin(a) * r0], [tip[0] + Math.cos(a) * r1, tip[1] + Math.sin(a) * r1]], { w: 5, seed: sd + 150 + k, t, amp: 0.6 }) + ' '; }
          crack.setAttribute('d', cd);
          if (kStand) kStand.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
