// tank_aerial: a village seen from an aeroplane, 1916, parchment ink (BRAND.md §3, §5) — the airman's view of Flers:
// a patchwork of hatched fields cratered by shellfire, a German zig-zag trench line, a main street lined with house
// blocks (pitched roofs, some smashed open), a tank seen from above (tracks ticking, sponsons, a dust trail) driving
// up the street with tiny helmeted soldiers following, flashes from the sponsons at cues, a biplane crossing over the
// village with its shadow sliding on the ground, and labels (e.g. the pilot's message as a note).
// P: {street: 0.55 (y), tank: {from: 0.08, to: 0.7, at, dur: 6, s: 1}, soldiers: 9, fire: [cues] (house hit + puff),
//     plane: {from: [x, y], to: [x, y], at, dur: 4, s: 1.2}, trench_x: 0.25, labels, cast}
// cues: tank.at, fire, plane.at, labels, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tank_aerial = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 971;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const sy = (P.street ?? 0.55) * H;
      const lay = { field: L(INK.paperDark, { 'fill-opacity': 0.5 }), fieldI: L(INK.inkSoft), road: L(INK.paperLight), roadI: L(INK.inkSoft),
        crater: L(INK.inkSoft, { 'fill-opacity': 0.5 }), craterI: L(INK.ink), trench: L(INK.ink),
        roofF: L(INK.paperDark), roofS: L(INK.inkSoft), roofI: L(INK.ink), rubble: L(INK.inkSoft),
        dust: L(INK.paperLight, { 'fill-opacity': 0.85 }), dustI: L(INK.inkSoft),
        trackF: L(INK.inkSoft), hullF: L(INK.paperDark), tankI: L(INK.ink), links: L(INK.ink),
        men: L(INK.inkSoft), menI: L(INK.ink), flash: L(INK.gold), flashI: L(INK.red), puffF: L(INK.inkSoft, { 'fill-opacity': 0.8 }),
        shadow: L(INK.ink, { 'fill-opacity': 0.22 }), planeF: L(INK.paperLight), planeI: L(INK.ink) };
      const labG = el(root, 'g'), castG = el(root, 'g');
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const r = rng(sd + 1);
      const fields = []; for (let k = 0; k < 14; k++) fields.push([r(), r(), 0.12 + r() * 0.16, 0.12 + r() * 0.14, r()]);
      const craters = []; for (let k = 0; k < 26; k++) craters.push([r(), r(), 18 + r() * 34]);
      const houses = []; for (let k = 0; k < 14; k++) { const side = k % 2 ? 1 : -1; houses.push({ x: 0.3 + Math.floor(k / 2) * 0.1 + r() * 0.03, side, w: 0.06 + r() * 0.03, d: 90 + r() * 50, broken: r() < 0.35 }); }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1, w: 4 }, extra || {});
          // fields (hatched patches)
          const FF = [], FI = [];
          fields.forEach((f, k) => { const x = f[0] * W, y = f[1] * H, w = f[2] * W, h = f[3] * H; if (Math.abs(y + h / 2 - sy) < h / 2 + 60) return; if (x < 640 && y < 240) return;
            const p = [[x, y], [x + w, y + 8], [x + w - 10, y + h], [x - 6, y + h - 6]];
            FF.push(inkLoop(p, o(10 + k, { smooth: false }))); FI.push(inkPath(p, o(30 + k, { closed: true, smooth: false, w: 2.5 })));
            for (let j = 1; j < 6; j++) FI.push(inkPath([[x + 10, y + h * j / 6], [x + w - 14, y + h * j / 6 + (f[4] - 0.5) * 30]], o(50 + k * 6 + j, { w: 2 }))); });
          lay.field.setAttribute('d', FF.join(' ')); lay.fieldI.setAttribute('d', FI.join(' '));
          // the street
          const road = [[-30, sy - 52], [W + 30, sy - 40], [W + 30, sy + 52], [-30, sy + 46]];
          lay.road.setAttribute('d', inkLoop(road, o(1, { smooth: false })));
          lay.roadI.setAttribute('d', inkPath([[-30, sy - 52], [W + 30, sy - 40]], o(2, { w: 4 })) + ' ' + inkPath([[-30, sy + 46], [W + 30, sy + 52]], o(3, { w: 4 })));
          // craters
          const CF = [], CI = [];
          craters.forEach((c, k) => { const x = c[0] * W, y = c[1] * H; if (Math.abs(y - sy) < 70) return; if (x < 640 && y < 240) return; const pts = inkEllipsePts(x, y, c[2], c[2] * 0.85, sd + 100 + k, 10);
            CF.push(inkLoop(pts, o(100 + k))); CI.push(inkPath(pts, o(140 + k, { closed: true, w: 3 }))); });
          lay.crater.setAttribute('d', CF.join(' ')); lay.craterI.setAttribute('d', CI.join(' '));
          // zig-zag trench across the fields
          const tx = (P.trench_x ?? 0.24) * W, TZ = [];
          for (let y = 250, k = 0; y < H + 40; y += 46, k++) TZ.push([tx + (k % 2 ? 26 : -26) + Math.sin(y * 0.01) * 30, y]);
          lay.trench.setAttribute('d', inkPath(TZ, o(5, { w: 9, smooth: false })));
          // houses (top-down roofs)
          const RF = [], RS = [], RI = [], RB = [];
          houses.forEach((h, k) => { const x = h.x * W, w = h.w * W, y0 = h.side < 0 ? sy - 70 - h.d : sy + 70, y1 = y0 + h.d;
            const pts = [[x, y0], [x + w, y0], [x + w, y1], [x, y1]];
            if (h.broken) { const br = [[x, y0], [x + w * 0.6, y0], [x + w * 0.4, y0 + h.d * 0.5], [x + w, y0 + h.d * 0.7], [x + w, y1], [x, y1]];
              RF.push(inkLoop(br, o(200 + k, { smooth: false }))); RI.push(inkPath(br, o(220 + k, { closed: true, smooth: false, w: 4 })));
              for (let j = 0; j < 5; j++) RB.push(inkDot(x + w * (0.5 + 0.1 * j), y0 + h.d * (0.2 + 0.1 * j), 7, 6, sd + 240 + k * 5 + j, t)); }
            else { RF.push(inkLoop(pts, o(200 + k, { smooth: false }))); RI.push(inkPath(pts, o(220 + k, { closed: true, smooth: false, w: 4 })), inkPath([[x, (y0 + y1) / 2], [x + w, (y0 + y1) / 2]], o(260 + k, { w: 4 })));
              for (let j = 1; j < 5; j++) RS.push(inkPath([[x + w * j / 5, y0 + 6], [x + w * j / 5, y1 - 6]], o(280 + k * 5 + j, { w: 2 }))); } });
          lay.roofF.setAttribute('d', RF.join(' ')); lay.roofS.setAttribute('d', RS.join(' ')); lay.roofI.setAttribute('d', RI.join(' ')); lay.rubble.setAttribute('d', RB.join(' '));
          // the tank, from above
          const TK = Object.assign({ from: 0.08, to: 0.7, at: 0.2, dur: 6, s: 1 }, P.tank || {});
          const ta = at(TK.at, 0.2), u = progIO(lt, ta, TK.dur), x = lerp(TK.from * W, TK.to * W, u), y = sy + Math.sin(lt * 2) * 3, s = TK.s;
          const len = 260 * s, wid = 120 * s, trw = 34 * s;
          const tr1 = [[x - len / 2, y - wid / 2 - trw], [x + len / 2, y - wid / 2 - trw], [x + len / 2 + 20 * s, y - wid / 2 - trw / 2], [x + len / 2, y - wid / 2], [x - len / 2, y - wid / 2]];
          const tr2 = tr1.map(p => [p[0], 2 * y - p[1]]);
          const hull = [[x - len / 2 + 10, y - wid / 2], [x + len / 2 - 10, y - wid / 2], [x + len / 2 - 10, y + wid / 2], [x - len / 2 + 10, y + wid / 2]];
          const sp1 = [[x - 40 * s, y - wid / 2], [x + 40 * s, y - wid / 2], [x + 30 * s, y - wid / 2 - trw - 26 * s], [x - 34 * s, y - wid / 2 - trw - 26 * s]], sp2 = sp1.map(p => [p[0], 2 * y - p[1]]);
          lay.trackF.setAttribute('d', [tr1, tr2].map((q, k) => inkLoop(q, o(300 + k, { smooth: false }))).join(' '));
          lay.hullF.setAttribute('d', [hull, sp1, sp2].map((q, k) => inkLoop(q, o(310 + k, { smooth: false }))).join(' '));
          const TI = [tr1, tr2, hull, sp1, sp2].map((q, k) => inkPath(q, o(320 + k, { closed: true, smooth: false, w: 5 })));
          TI.push(inkPath([[x + len / 2 - 60 * s, y - 24 * s], [x + len / 2 - 20 * s, y - 24 * s], [x + len / 2 - 20 * s, y + 24 * s], [x + len / 2 - 60 * s, y + 24 * s]], o(330, { closed: true, smooth: false, w: 3.5 })));
          TI.push(inkPath([[x + 30 * s, y - wid / 2 - trw - 26 * s], [x + 110 * s, y - wid / 2 - trw - 30 * s]], o(331, { w: 9 })), inkPath([[x + 30 * s, y + wid / 2 + trw + 26 * s], [x + 110 * s, y + wid / 2 + trw + 30 * s]], o(332, { w: 9 })));
          TI.push(inkDot(x - 20 * s, y, 12 * s, 12 * s, sd + 333, t));
          lay.tankI.setAttribute('d', TI.join(' '));
          const LK = [], ph = (x * 0.9) % (18 * s);
          for (let lx = x - len / 2 + ph; lx < x + len / 2; lx += 18 * s) { LK.push(inkPath([[lx, y - wid / 2 - trw + 3], [lx, y - wid / 2 - 3]], { seed: sd + 400 + Math.round(lx), t, w: 2.2, amp: 0.4 }));
            LK.push(inkPath([[lx, y + wid / 2 + 3], [lx, y + wid / 2 + trw - 3]], { seed: sd + 401 + Math.round(lx), t, w: 2.2, amp: 0.4 })); }
          lay.links.setAttribute('d', LK.join(' '));
          // dust trail behind
          const DU = [], DUI = [];
          for (let k = 0; k < 6; k++) { const age = (lt * 0.8 + k / 6) % 1, dx = x - len / 2 - 30 - age * 220, rr = (20 + age * 50) * s;
            if (u <= 0.001 || u >= 0.999) continue; const pts = inkEllipsePts(dx, y + Math.sin(k * 2) * 30, rr, rr * 0.8, sd + 450 + k, 9); DU.push(inkLoop(pts, o(450 + k))); if (k % 2) DUI.push(inkPath(pts, o(470 + k, { closed: true, w: 2.5 }))); }
          lay.dust.setAttribute('d', DU.join(' ')); lay.dustI.setAttribute('d', DUI.join(' '));
          // soldiers following (top-down helmets)
          const MN = [], MI = [];
          for (let k = 0; k < (P.soldiers ?? 9); k++) { const row = k % 3, col = Math.floor(k / 3), mx = x - len / 2 - 120 - col * 70 - row * 20 + Math.sin(lt * 6 + k) * 3, my = y + (row - 1) * 46;
            if (mx < -30) continue; MN.push(inkDot(mx, my, 15, 15, sd + 500 + k, t)); MI.push(inkPath(inkEllipsePts(mx, my, 22, 22, sd + 520 + k, 9), o(520 + k, { closed: true, w: 3 }))); }
          lay.men.setAttribute('d', MN.join(' ')); lay.menI.setAttribute('d', MI.join(' '));
          // sponson fire at houses
          const FL = [], FLI = [], PU = [];
          (P.fire || []).forEach((fn, k) => { const fa = at(fn, null); if (fa == null || lt < fa) return; const age = lt - fa; const side = k % 2 ? 1 : -1;
            const mx = x + 110 * s, my = y + side * (wid / 2 + trw + 30 * s);
            if (age < 0.3) { const pts = []; for (let j = 0; j < 10; j++) { const an = j / 10 * 6.2832, rr = (j % 2 ? 0.4 : 1) * 46 * (1 - age); pts.push([mx + 40 + Math.cos(an) * rr, my + side * 20 + Math.sin(an) * rr]); }
              FL.push(inkLoop(pts, o(600 + k, { smooth: false }))); FLI.push(inkPath(pts, o(620 + k, { closed: true, smooth: false, w: 3 }))); }
            const hx = mx + 120, hy = my + side * 120, b = T.burst(hx, hy, age, 60, t, sd + 640 + k * 30); PU.push(b.cloud); FLI.push(b.ink); FL.push(b.flash); });
          lay.flash.setAttribute('d', FL.join(' ')); lay.flashI.setAttribute('d', FLI.join(' ')); lay.puffF.setAttribute('d', PU.join(' '));
          // biplane from above + its shadow
          if (P.plane) {
            const PL = Object.assign({ from: [-0.1, 0.15], to: [1.1, 0.3], at: 0.5, dur: 4, s: 1.2 }, P.plane), pa = at(PL.at, 0.5), pu = clamp01((lt - pa) / PL.dur);
            if (pu > 0 && pu < 1) {
              const px = lerp(PL.from[0], PL.to[0], pu) * W, py = lerp(PL.from[1], PL.to[1], pu) * H, ang = Math.atan2((PL.to[1] - PL.from[1]) * H, (PL.to[0] - PL.from[0]) * W), k = PL.s;
              const R = (pts, ox, oy) => pts.map(p => [ox + p[0] * Math.cos(ang) - p[1] * Math.sin(ang), oy + p[0] * Math.sin(ang) + p[1] * Math.cos(ang)]);
              const body = [[-110, -10], [90, -12], [110, 0], [90, 12], [-110, 10]].map(p => [p[0] * k, p[1] * k]);
              const wing = [[-20, -170], [40, -170], [40, 170], [-20, 170]].map(p => [p[0] * k, p[1] * k]);
              const tail = [[-120, -50], [-90, -50], [-90, 50], [-120, 50]].map(p => [p[0] * k, p[1] * k]);
              const shx = px + 90, shy = py + 200;
              lay.shadow.setAttribute('d', [body, wing, tail].map((q, j) => inkLoop(R(q, shx, shy), o(700 + j, { smooth: false }))).join(' '));
              lay.planeF.setAttribute('d', [wing, body, tail].map((q, j) => inkLoop(R(q, px, py), o(710 + j, { smooth: false }))).join(' '));
              const pr = Math.sin(lt * 50) * 40 * k;
              lay.planeI.setAttribute('d', [wing, body, tail].map((q, j) => inkPath(R(q, px, py), o(720 + j, { closed: true, smooth: false, w: 4 }))).join(' ') + ' ' +
                inkPath(R([[118 * k, -pr], [118 * k, pr]], px, py), o(730, { w: 5 })) + ' ' + inkDot(...R([[20 * k, 0]], px, py)[0], 12, 12, sd + 731, t));
            } else { lay.shadow.setAttribute('d', ''); lay.planeF.setAttribute('d', ''); lay.planeI.setAttribute('d', ''); }
          }
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
