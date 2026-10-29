// gal_b_road: a winter road through the Tuscan hills to Rome (02-galileo-teleskop, B4: 1633, the old, ill Galileo is
// summoned). Use over "set": {"name": "hills", "ground": 860}. A muddy road winds from the lower left to the horizon;
// dark cypresses and bare trees line it; a horse-drawn coach creeps along it (`cart.from` -> `cart.to`, wheels turning,
// horse legs walking) with old Galileo's face in its window, coughing little puffs; Rome's domes rise on the horizon
// on `rome.at`; on `questions.at` big ink question marks rain down onto the coach. Snow falls; snowy banks, bushes and a
// milestone fill the foreground to the frame bottom. Parchment ink, palette tokens only, pure function of (seed, lt).
// P: {cart: {from: 0.1, to: 0.62 (0..1 W along the road), at: 0, dur: 6, scale: 1}, rome: {x: 0.86, at},
//     questions: {at, n: 4, lead: 0.9 (s before the cue they start falling)}, galileo: GAL.person overrides (who galileo, age old), horizon: 0.555, snow: true,
//     milestone: "ROMA" | false, labels}
// cues: cart.at, rome.at, questions.at, hit (punch on the coach)
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const bez = (a, b, c, d, u) => { const v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]; };
  SH.gal_b_road = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 621;
      const hz = (P.horizon ?? 0.555) * H;
      const RO = Object.assign({ x: 0.86, at: null }, P.rome || {});
      const A = [-120, 0.9 * H], B = [0.38 * W, 0.86 * H], C = [0.62 * W, 0.66 * H], D = [RO.x * W - 40, hz + 14];
      const road = u => bez(A, B, C, D, u);
      const TAB = Array.from({ length: 201 }, (_, i) => road(i / 200));
      const uAtX = x => { for (let i = 1; i < TAB.length; i++) if (TAB[i][0] >= x) return (i - 1 + (x - TAB[i - 1][0]) / Math.max(1e-6, TAB[i][0] - TAB[i - 1][0])) / 200; return 1; };
      const root = el(svg, 'g');
      const romeG = el(root, 'g'), romeF = inkEl(romeG, mix(INK.inkSoft, INK.paperDark, 0.3)), romeL = inkEl(romeG, INK.inkSoft);
      const snowB = inkEl(root, INK.paperLight), roadF = inkEl(root, mix(INK.stain, INK.inkSoft, 0.4)), roadR = inkEl(root, mix(INK.ink, INK.stain, 0.3)), pud = inkEl(root, mix(INK.paperLight, INK.blue, 0.25)), roadL = inkEl(root, INK.ink);
      const trees = inkEl(root, mix(INK.green, INK.ink, 0.55)), treeL = inkEl(root, INK.ink), bare = inkEl(root, INK.ink);
      const carG = el(root, 'g');
      const CA = Object.assign({ from: 0.1, to: 0.62, at: 0, dur: 6, scale: 1 }, P.cart || {}), cs = CA.scale;
      const gm = Object.assign({ who: 'galileo', age: 'old', robe: 'scholar', cap: 'scholar', scale: 0.4 * cs, face: 'right', pose: 'idle', emotion: 'worried', x: 0.2, y: 0.8 }, P.galileo || {});
      const gal = G.person(carG, gm, sd + 1);
      const coach = { body: inkEl(carG, mix(INK.red, INK.ink, 0.42), { 'fill-rule': 'evenodd' }), trim: inkEl(carG, INK.gold), l: inkEl(carG, INK.ink), wheel: inkEl(carG, INK.ink), hub: inkEl(carG, INK.gold),
        horse: inkEl(carG, mix(INK.stain, INK.ink, 0.5)), horse2: inkEl(carG, mix(INK.stain, INK.ink, 0.68)), hl: inkEl(carG, INK.ink), puffs: inkEl(carG, INK.paperLight), puffL: inkEl(carG, INK.inkSoft) };
      const QS = P.questions ? Object.assign({ n: 4 }, P.questions) : null;
      const qG = el(root, 'g');
      const qT = QS ? Array.from({ length: QS.n }, (_, i) => { const e = el(qG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 120 - (i % 2) * 20, 'text-anchor': 'middle', fill: i % 2 ? INK.ink : INK.red, stroke: INK.paperLight, 'stroke-width': 5, 'paint-order': 'stroke' }); e.textContent = '?'; return e; }) : [];
      const fgF = inkEl(root, INK.paperLight), fgS = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.3)), bush = inkEl(root, mix(INK.green, INK.ink, 0.6)), fgL = inkEl(root, INK.ink);
      const stoneF = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.25)), stoneT = P.milestone === false ? null : el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 48, 'text-anchor': 'middle', fill: INK.ink });
      if (stoneT) stoneT.textContent = P.milestone || 'ROMA';
      const snow = inkEl(root, INK.paperLight), snowL = inkEl(root, INK.inkSoft);
      const labels = (P.labels || []).map((L, i) => G.label(root, L, W, H, sd + 40 + i));
      const q = rng(inkHash(sd, 7));
      const FL = Array.from({ length: 70 }, () => [q(), q(), 0.6 + q() * 0.8, q() * 6]);
      // cypresses and bare trees along the road (u along the road, side, size)
      const CY = [[0.18, -1, 1.1], [0.27, 1, 0.9], [0.45, -1, 0.75], [0.58, 1, 0.6], [0.7, -1, 0.5], [0.8, 1, 0.42], [0.9, -1, 0.34]];
      const BT = [[0.36, 1, 0.8], [0.64, -1, 0.55]];

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const hp = punch(lt, G.atOr(cues, 'hit', null), 0.7);
          // Rome on the horizon
          const ra = G.atOr(cues, RO.at, null), rk = ra == null ? 0 : spring(lt, ra, 0.9);
          if (rk > 0.01) {
            const bx = RO.x * W, by = hz + 6, s = rk;
            const Y = v => by - v * s;
            let rf = '', rl = '';
            const box = (x0, x1, h) => [[x0, by], [x0, Y(h)], [x1, Y(h)], [x1, by]];
            const domeP = (cx, r, h0) => { const p = [[cx - r, Y(h0)]]; for (let k = 1; k < 10; k++) { const a = Math.PI + k / 10 * Math.PI; p.push([cx + Math.cos(a) * r, Y(h0) + Math.sin(a) * r * s]); } p.push([cx + r, Y(h0)]); return p; };
            const parts = [box(bx - 200, bx + 200, 40), box(bx - 70, bx + 70, 100), domeP(bx, 70, 100), box(bx - 14, bx + 14, 205), domeP(bx - 150, 30, 60), domeP(bx + 160, 34, 58), box(bx + 230, bx + 262, 150), box(bx - 260, bx - 230, 120), box(bx - 200, bx - 100, 70)];
            parts.forEach((p, i) => { rf += inkLoop(p, { seed: sd + 2 + i, t, amp: 0.4, smooth: p.length > 6 }) + ' '; rl += G.ring(p, sd + 20 + i, t, 2.5, 0.4) + ' '; });
            romeF.setAttribute('d', rf); romeL.setAttribute('d', rl);
          } else { romeF.setAttribute('d', ''); romeL.setAttribute('d', ''); }
          // road band + snow banks along it
          const Lp = [], Rp = [], ruts = [];
          for (let i = 0; i <= 40; i++) {
            const u = i / 40, p = road(u), p2 = road(Math.min(1, u + 0.01)), dx = p2[0] - p[0], dy = p2[1] - p[1], ln = Math.hypot(dx, dy) || 1, nx = -dy / ln, ny = dx / ln, w = lerp(190, 10, Math.pow(u, 0.7));
            Lp.push([p[0] + nx * w, p[1] + ny * w * 0.55]); Rp.push([p[0] - nx * w, p[1] - ny * w * 0.55]);
            ruts.push([p, nx, ny, w]);
          }
          roadF.setAttribute('d', inkLoop(Lp.concat(Rp.slice().reverse()), { seed: sd + 40, t, amp: 0.6, smooth: false }));
          let rr = '';
          for (const side of [-0.35, 0.35]) rr += G.line(ruts.filter((_, i) => i < 36).map(([p, nx, ny, w]) => [p[0] + nx * w * side, p[1] + ny * w * side * 0.55]), sd + 41 + side * 10, t, 4, 0.6, 0.3) + ' ';
          roadR.setAttribute('d', rr);
          let pd = '';
          [[0.08, 0.2], [0.22, -0.3], [0.4, 0.1]].forEach((c, i) => { const [p, nx, ny, w] = ruts[Math.round(c[0] * 40)]; pd += inkLoop(inkEllipsePts(p[0] + nx * w * c[1], p[1] + ny * w * c[1] * 0.5, w * 0.35, w * 0.08, sd + 45 + i, 10), { seed: sd + 45 + i, t, amp: 0.5 }) + ' '; });
          pud.setAttribute('d', pd);
          roadL.setAttribute('d', G.line(Lp, sd + 50, t, 4, 0.7, 0.4) + ' ' + G.line(Rp, sd + 51, t, 4, 0.7, 0.4));
          let sb = '';
          for (let i = 0; i < 9; i++) { const u = 0.05 + i * 0.1, [p, nx, ny, w] = ruts[Math.round(u * 40)], sgn = i % 2 ? 1 : -1, x = p[0] + nx * w * 1.5 * sgn, y = p[1] + ny * w * 0.8 * sgn; sb += inkLoop(inkEllipsePts(x, y, w * 0.9, w * 0.14, sd + 60 + i, 10), { seed: sd + 60 + i, t, amp: 0.6 }) + ' '; }
          snowB.setAttribute('d', sb);
          // cypresses + bare trees
          let cf = '', cl = '', bt = '';
          CY.forEach((c, i) => {
            const [p, nx, ny, w] = ruts[Math.round(c[0] * 40)], s = c[2], x = p[0] + nx * (w + 70 * s) * c[1], y = p[1] + ny * (w + 40 * s) * c[1] * 0.55 - 6, hgt = 330 * s, sw = Math.sin(t * 0.9 + i) * 5 * s;
            const pts = [[x - 30 * s, y], [x - 44 * s, y - hgt * 0.4], [x - 20 * s + sw, y - hgt * 0.85], [x + sw, y - hgt], [x + 22 * s + sw, y - hgt * 0.8], [x + 44 * s, y - hgt * 0.38], [x + 30 * s, y]];
            cf += inkLoop(pts, { seed: sd + 70 + i, t, amp: 0.8 }) + ' '; cl += G.ring(pts, sd + 80 + i, t, 3.5, 0.8) + ' ' + G.line([[x, y], [x, y + 16 * s]], sd + 90 + i, t, 5) + ' ';
          });
          BT.forEach((c, i) => {
            const [p, nx, ny, w] = ruts[Math.round(c[0] * 40)], s = c[2], x = p[0] + nx * (w + 90 * s) * c[1], y = p[1] + ny * (w + 50 * s) * c[1] * 0.55, sw = Math.sin(t * 1.1 + i) * 4;
            bt += G.line([[x, y], [x + 4, y - 260 * s]], sd + 100 + i, t, 9 * s + 2) + ' ';
            for (let k = 0; k < 5; k++) { const yy = y - (110 + k * 32) * s, d = k % 2 ? 1 : -1; bt += G.line([[x + 2, yy], [x + d * (70 - k * 8) * s + sw, yy - 60 * s], [x + d * (90 - k * 10) * s + sw, yy - 90 * s]], sd + 110 + i * 6 + k, t, 3.5) + ' '; }
          });
          trees.setAttribute('d', cf); treeL.setAttribute('d', cl); bare.setAttribute('d', bt);
          // the coach
          const ca = G.atOr(cues, CA.at, 0), mv = progIO(lt, ca, CA.dur) * 0.85 + clamp01((lt - ca) / CA.dur) * 0.15;
          const u0 = uAtX(CA.from * W), u1 = uAtX(CA.to * W), u = lerp(u0, u1, mv), p = road(u), p2 = road(Math.min(1, u + 0.01));
          const tilt = Math.atan2(p2[1] - p[1], p2[0] - p[0]) * 0.6 + Math.sin(t * 5.5) * 0.012;
          const dist = mv * (u1 - u0) * 1800;
          const bob = Math.abs(Math.sin(dist / 55)) * 4, s = cs * (1 + 0.03 * hp);
          const T = (x, y) => { const c = Math.cos(tilt), sn = Math.sin(tilt), X = x * s, Yv = y * s; return [p[0] + X * c - Yv * sn, p[1] - bob + X * sn + Yv * c]; };
          // Galileo behind the window: his head sits in the window; a cough every ~1.7 s
          const cph = (lt % 1.7) / 1.7, cough = cph < 0.18 ? Math.sin(cph / 0.18 * Math.PI) : 0;
          const wc = T(-15, -200);
          gm.x = wc[0] / W; gm.y = (wc[1] + 400 * gm.scale - 4 + cough * 8) / H;
          gal.update(lt, t, cues, W, H);
          const body = [T(-160, -90), T(-168, -240), T(-120, -290), T(90, -290), T(122, -240), T(116, -90)];
          const win = [T(-70, -250), T(40, -250), T(40, -158), T(-70, -158)];
          coach.body.setAttribute('d', inkLoop(body, { seed: sd + 130, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(win, { seed: sd + 131, t, amp: 0.4, smooth: false }));
          coach.trim.setAttribute('d', G.line([T(-164, -110), T(118, -110)], sd + 132, t, 8) + ' ' + G.line([T(-122, -292), T(92, -292)], sd + 133, t, 8) + ' ' + G.ring(win, sd + 134, t, 6, 0.4));
          coach.l.setAttribute('d', G.ring(body, sd + 135, t, 5, 0.5) + ' ' + G.line([T(116, -120), T(250, -150)], sd + 136, t, 7) + ' ' + G.line([T(-120, -300), T(-90, -330), T(60, -330), T(90, -300)], sd + 137, t, 5) +
            ' ' + G.line([T(-20, -250), T(-20, -158)], sd + 138, t, 4));
          let wl = '', hb = '';
          [[-95, -55, 62], [72, -48, 50]].forEach(([wx, wy, wr], i) => {
            const c = T(wx, wy), r = wr * s, a0 = dist / wr;
            wl += inkCircle(c[0], c[1], r, sd + 140 + i, t, { w: 6 }) + ' ';
            for (let k = 0; k < 6; k++) { const a = a0 + k * Math.PI / 3; wl += G.line([c, [c[0] + Math.cos(a) * r * 0.92, c[1] + Math.sin(a) * r * 0.92]], sd + 142 + i * 6 + k, t, 3.5) + ' '; }
            hb += inkDot(c[0], c[1], 11 * s, 11 * s, sd + 155 + i, t) + ' ';
          });
          coach.wheel.setAttribute('d', wl); coach.hub.setAttribute('d', hb);
          // horses (one behind, one in front), legs walking
          const horse = (ox, oy, F, sdd) => {
            const ph = dist / 70 + ox * 0.01;
            const bd = inkEllipsePts(...T(ox + 330, oy - 175), 118 * s, 48 * s, sdd, 14, tilt);
            const head = [T(ox + 420, oy - 200), T(ox + 470, oy - 290), T(ox + 520, oy - 278), T(ox + 512, oy - 256), T(ox + 470, oy - 235), T(ox + 446, oy - 170)];
            F.setAttribute('d', inkLoop(bd, { seed: sdd, t, amp: 0.6 }) + ' ' + inkLoop(head, { seed: sdd + 1, t, amp: 0.6 }));
            let d = G.ring(bd, sdd + 2, t, 4, 0.6) + ' ' + G.ring(head, sdd + 3, t, 4, 0.6);
            [[250, 0], [290, 0.5], [390, 0.25], [425, 0.75]].forEach(([lx, off], k) => { const sw = Math.sin((ph + off) * G.TAU) * 22, lift = Math.max(0, Math.cos((ph + off) * G.TAU)) * 14; d += ' ' + G.line([T(ox + lx, oy - 150), T(ox + lx + sw * 0.5, oy - 75 - lift), T(ox + lx + sw, oy - lift * 0.5)], sdd + 4 + k, t, 7); });
            d += ' ' + G.line([T(ox + 214, oy - 190), T(ox + 190 + Math.sin(t * 3) * 8, oy - 110)], sdd + 9, t, 6) + ' ' + G.line([T(ox + 470, oy - 285), T(ox + 455, oy - 210)], sdd + 10, t, 3);
            return d;
          };
          const h2 = horse(30, -14, coach.horse2, sd + 160), h1 = horse(0, 0, coach.horse, sd + 180);
          coach.hl.setAttribute('d', h2 + ' ' + h1 + ' ' + G.line([T(250, -150), T(330, -190), T(470, -240)], sd + 200, t, 2.5));
          // cough puffs drifting out of the window
          let pf = '', pl = '';
          for (let k = 0; k < 3; k++) {
            const age = ((lt + k * 0.57) % 1.7) / 1.7, c = T(48 + age * 120, -220 - age * 90), r = (10 + age * 26) * s;
            if (lt < 0.4) continue;
            pf += inkLoop(inkEllipsePts(c[0], c[1], r, r * 0.8, sd + 210 + k, 9, 0, 0.15), { seed: sd + 210 + k, t, amp: 0.8 }) + ' '; pl += inkCircle(c[0], c[1], r, sd + 215 + k, t, { w: 2 }) + ' ';
          }
          coach.puffs.setAttribute('d', pf); coach.puffL.setAttribute('d', pl);
          // question marks raining onto the coach
          if (QS) {
            const qa = G.atOr(cues, QS.at, null);
            qT.forEach((e, i) => {
              const a = qa == null ? null : qa - (QS.lead ?? 0.9) + i * 0.14;
              if (a == null || lt < a) { e.style.visibility = 'hidden'; return; }
              const k = clamp01((lt - a) / 0.45), land = T(-220 + i * 85, -340 - (i % 3) * 70), y = lerp(-80, land[1], k * k) - (k >= 1 ? Math.abs(Math.sin((lt - a - 0.55) * 7)) * Math.exp(-(lt - a - 0.55) * 3) * 40 : 0);
              const rot = (i % 2 ? 1 : -1) * (12 + Math.sin(t * 2 + i) * 6);
              e.setAttribute('x', G.f1(land[0])); e.setAttribute('y', G.f1(y));
              e.setAttribute('transform', `rotate(${G.f1(rot)} ${G.f1(land[0])} ${G.f1(y - 40)})`);
              e.style.visibility = 'visible';
            });
          }
          // foreground: snowy bank (left), dark bushes (right), milestone
          const bank = [[-40, H * 0.9], [W * 0.12, H * 0.87], [W * 0.26, H * 0.92], [W * 0.3, H + 40], [-40, H + 40]];
          fgF.setAttribute('d', inkLoop(bank, { seed: sd + 220, t, amp: 0.6 }));
          fgS.setAttribute('d', inkLoop([[-40, H * 0.96], [W * 0.1, H * 0.95], [W * 0.27, H + 40], [-40, H + 40]], { seed: sd + 221, t, amp: 0.6 }));
          let bs = '';
          for (let k = 0; k < 6; k++) { const cx = W * (0.78 + k * 0.05), cy = H * (0.98 - (k % 2) * 0.03), r = 90 + (k % 3) * 30, sw = Math.sin(t * 0.8 + k) * 4; bs += inkLoop(inkEllipsePts(cx + sw, cy, r, r * 0.75, sd + 230 + k, 10), { seed: sd + 230 + k, t, amp: 1.2 }) + ' '; }
          bush.setAttribute('d', bs);
          const st = [[W * 0.81, H * 0.84], [W * 0.81, H * 0.71], [W * 0.84, H * 0.68], [W * 0.87, H * 0.71], [W * 0.87, H * 0.84]];
          stoneF.setAttribute('d', P.milestone === false ? '' : inkLoop(st, { seed: sd + 240, t, amp: 0.5 }));
          fgL.setAttribute('d', G.line(bank.slice(0, 4), sd + 241, t, 5) + (P.milestone === false ? '' : ' ' + G.ring(st, sd + 242, t, 4.5, 0.5)));
          if (stoneT) { stoneT.setAttribute('x', G.f1(W * 0.84)); stoneT.setAttribute('y', G.f1(H * 0.785)); stoneT.setAttribute('font-size', 44); }
          // falling snow
          let sn = '', sl = '';
          if (P.snow !== false) FL.forEach((f, i) => {
            const y = ((f[1] + lt * 0.06 * f[2]) % 1.05) * H - 20, x = f[0] * W + Math.sin(t * 1.3 + f[3]) * 18, r = 4.5 * f[2];
            sn += inkDot(x, y, r, r, sd + 300 + i, t, 0.4) + ' '; if (i % 2) sl += inkCircle(x, y, r + 1.5, sd + 400 + i, t, { w: 1.4, n: 8 }) + ' ';
          });
          snow.setAttribute('d', sn); snowL.setAttribute('d', sl);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
