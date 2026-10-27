// tank_mg: close shot of a 1916 machine-gun nest in parchment ink (BRAND.md §3, §5): a heavy water-cooled machine gun
// (MG 08 type: ribbed water jacket, receiver box, spade grips) on its sledge mount behind a sandbag parapet, the
// cartridge belt running from an ammo box into the gun and jerking through it while it fires, muzzle flashes,
// tracer dashes flying out of frame, spent cases tumbling, steam from the jacket, a gunner (bb__lib cast) in a steel
// helmet, and an optional rounds counter. The set (field/storm) gives the sky behind the parapet.
// P: {x: 0.5 (gun centre), y: 0.6 (barrel height), face: 1 (fires right) | -1, s: 1,
//     fire: [from, to] (cues|s; firing between them) | cue (fires from it to the end),
//     counter: {at, to: 500, text: "dakikada", x, y} (number rolls up), cast: [...] (+ helmet, see tank_field), labels}
// cues: fire, counter.at, labels, cast, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tank_mg = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 377;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const face = P.face === -1 || P.face === 'left' ? -1 : 1, s = P.s ?? 1;
      const gx = (P.x ?? 0.5) * W, gy = (P.y ?? 0.6) * H;
      const castG = el(cam, 'g');
      const helmF = L(INK.inkSoft), helmI = L(INK.ink);
      const lay = {
        tracer: L(INK.red), steam: L(INK.paperLight, { 'fill-opacity': 0.85 }), steamI: L(INK.inkSoft),
        sledF: L(INK.inkSoft), sledI: L(INK.ink),
        jackF: L(INK.paperDark), jackS: L(INK.inkSoft), recF: L(INK.inkSoft), gunI: L(INK.ink),
        boxF: L(INK.paperDark), boxI: L(INK.ink), belt: L(INK.gold), beltI: L(INK.ink),
        cases: L(INK.gold), casesI: L(INK.ink),
        flash: L(INK.gold), flashR: L(INK.red),
        bagF: L(INK.paperDark), bagI: L(INK.ink), bagS: L(INK.inkSoft),
      };
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      const cnt = P.counter ? el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 150, 'text-anchor': 'middle',
        fill: INK.red, stroke: INK.paperLight, 'stroke-width': 14, 'paint-order': 'stroke' }) : null;
      const cntS = P.counter ? el(root, 'text', { 'font-family': INK_FONT, 'font-size': 66, 'text-anchor': 'middle', fill: INK.ink,
        stroke: INK.paperLight, 'stroke-width': 10, 'paint-order': 'stroke' }) : null;
      // gun local -> world (local x forward, cm-ish px at s = 1)
      const Q = (u, v) => [gx + face * u * s, gy + v * s];
      const Qs = pts => pts.map(p => Q(p[0], p[1]));

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.2, w: 5 }, extra || {});
          let f0 = 0.3, f1 = 1e9;
          if (Array.isArray(P.fire)) { f0 = at(P.fire[0], 0.3); f1 = at(P.fire[1], 1e9); } else if (P.fire != null) f0 = at(P.fire, 0.3);
          const firing = lt >= f0 && lt < f1, rate = 9;                    // shots per second shown
          const sh = firing ? (lt * rate) % 1 : 1, kick = firing ? Math.exp(-sh * 6) : 0;
          const rec = -14 * kick;                                         // recoil along the barrel
          // sledge mount
          const sled = Qs([[-260, 150], [-60, 60], [120, 150]]);
          lay.sledI.setAttribute('d', inkPath(sled, o(1, { w: 12 })) + ' ' + inkPath(Qs([[-60, 60], [-60, 10]]), o(2, { w: 16 })) + ' ' +
            inkPath(Qs([[-300, 150], [160, 150]]), o(3, { w: 9 })));
          lay.sledF.setAttribute('d', inkLoop(Qs([[-90, 10], [-30, 10], [-30, 60], [-90, 60]]), o(4, { smooth: false })));
          // receiver + spade grips + water jacket
          const R = u => u + rec;
          const recv = Qs([[R(-220), -50], [R(-20), -50], [R(-20), 40], [R(-220), 40]]);
          const jack = Qs([[R(-20), -44], [R(420), -44], [R(420), 34], [R(-20), 34]]);
          lay.recF.setAttribute('d', inkLoop(recv, o(5, { smooth: false })));
          lay.jackF.setAttribute('d', inkLoop(jack, o(6, { smooth: false })));
          const GI = [inkPath(recv, o(7, { closed: true, smooth: false, w: 7 })), inkPath(jack, o(8, { closed: true, smooth: false, w: 7 })),
            inkPath(Qs([[R(420), -10], [R(520), -10]]), o(9, { w: 22, taper: 0 })), inkPath(Qs([[R(500), -30], [R(500), 10]]), o(10, { w: 8 })),
            inkPath(Qs([[R(-220), -30], [R(-280), -40], [R(-300), -20]]), o(11, { w: 10 })), inkPath(Qs([[R(-220), 20], [R(-280), 30], [R(-300), 12]]), o(12, { w: 10 })),
            inkPath(Qs([[R(-200), -50], [R(-160), -86], [R(-120), -50]]), o(13, { w: 6 }))];
          const JS = [];
          for (let k = 0; k < 9; k++) { const u = 20 + k * 46; JS.push(inkPath(Qs([[R(u), -44], [R(u), 34]]), o(20 + k, { w: 3, amp: 0.6 }))); }
          for (let k = 0; k < 5; k++) JS.push(inkDot(...Q(R(60 + k * 80), -10), 9 * s, 6 * s, sd + 40 + k, t));
          lay.jackS.setAttribute('d', JS.join(' '));
          lay.gunI.setAttribute('d', GI.join(' '));
          // ammo box + belt (cartridges slide into the gun while firing)
          const box = Qs([[-120, 120], [60, 120], [60, 230], [-120, 230]]);
          lay.boxF.setAttribute('d', inkLoop(box, o(50, { smooth: false })));
          lay.boxI.setAttribute('d', inkPath(box, o(51, { closed: true, smooth: false, w: 6 })) + ' ' + inkPath(Qs([[-110, 140], [50, 140]]), o(52, { w: 3 })));
          const beltPath = [[-40, 120], [-60, 60], [-110, 20], [R(-120), 0]];
          const BL = [], BLI = [], adv = firing ? (lt - f0) * rate * 22 : 0;
          for (let k = 0; k < 12; k++) {
            const u = ((k * 22 + adv) % 264) / 264, i = Math.min(2, Math.floor(u * 3)), f = u * 3 - i;
            const a = beltPath[i], b = beltPath[i + 1], p = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
            const c = Q(p[0], p[1]);
            const pts = [[c[0] - 7 * s, c[1] - 18 * s], [c[0] + 7 * s, c[1] - 18 * s], [c[0] + 7 * s, c[1] + 18 * s], [c[0] - 7 * s, c[1] + 18 * s]];
            BL.push(inkLoop(pts, o(60 + k, { smooth: false, amp: 0.5 }))); BLI.push(inkPath(pts, o(80 + k, { closed: true, smooth: false, w: 2.4, amp: 0.5 })));
          }
          lay.belt.setAttribute('d', BL.join(' ')); lay.beltI.setAttribute('d', BLI.join(' ') + ' ' + inkPath(Qs(beltPath), o(99, { w: 3 })));
          // spent cases tumbling down from under the receiver
          const CS = [], CSI = [];
          if (lt >= f0) for (let k = 0; k < 7; k++) {
            const born = f0 + Math.floor(((lt - f0) - k / 7 * 0.8) / 0.8) * 0.8 + k / 7 * 0.8;
            if (born > f1 || born < f0) continue;
            const age = lt - born; if (age < 0 || age > 0.8) continue;
            const c = Q(-100 + age * 120, 50 + age * 140 + age * age * 500), an = age * 14 + k;
            const pts = [[c[0] + Math.cos(an) * 14 * s, c[1] + Math.sin(an) * 14 * s], [c[0] - Math.cos(an) * 14 * s, c[1] - Math.sin(an) * 14 * s]];
            CSI.push(inkPath(pts, o(110 + k, { w: 9 * s, amp: 0.3 })));
          }
          lay.cases.setAttribute('d', CS.join(' ')); lay.casesI.setAttribute('d', CSI.join(' '));
          // muzzle flash + tracers
          if (firing && sh < 0.45) {
            const m = Q(R(530), -10), r0 = 80 * s * (1 - sh), pts = [];
            for (let k = 0; k < 14; k++) { const an = k / 14 * 6.2832, rr = (k % 2 ? 0.4 : 1) * r0; pts.push([m[0] + face * (Math.cos(an) * rr * 1.7 + r0 * 0.6), m[1] + Math.sin(an) * rr]); }
            lay.flash.setAttribute('d', inkLoop(pts, o(120, { smooth: false })));
            lay.flashR.setAttribute('d', inkPath(pts, o(121, { closed: true, smooth: false, w: 4 })));
          } else { lay.flash.setAttribute('d', ''); lay.flashR.setAttribute('d', ''); }
          const TR = [];
          if (firing) for (let k = 0; k < 6; k++) {
            const u = ((lt - f0) * 1.6 + k / 6) % 1, x0 = Q(R(560) + u * 1400, -10 - u * 30)[0];
            const yy = gy - 10 * s - u * 30 + Math.sin(k * 3.1) * 16;
            TR.push(inkPath([[x0, yy], [x0 + face * 90, yy - 2]], o(130 + k, { w: 6, amp: 0.4 })));
          }
          lay.tracer.setAttribute('d', TR.join(' '));
          // steam from the jacket (it boils when firing long)
          const ST = [], STI = [];
          const heat = firing ? clamp01((lt - f0) / 2) : clamp01(1 - (lt - f1) / 2) * (lt > f1 ? 1 : 0);
          for (let k = 0; k < 4; k++) { const age = (lt * 0.7 + k / 4) % 1, c = Q(R(120 + k * 70) - age * 40, -60 - age * 160), r = (12 + age * 30) * s * heat;
            if (r < 2) continue; const pts = inkEllipsePts(c[0], c[1], r, r * 0.8, sd + 140 + k, 9);
            ST.push(inkLoop(pts, o(140 + k))); STI.push(inkPath(pts, o(150 + k, { closed: true, w: 2.5 }))); }
          lay.steam.setAttribute('d', ST.join(' ')); lay.steamI.setAttribute('d', STI.join(' '));
          // sandbag parapet in front (below the barrel)
          const BF = [], BI = [], BS = [];
          const py = gy + 150 * s;
          for (let r = 0; r < 4; r++) for (let x = -80 + (r % 2) * 60; x < W + 80; x += 124) {
            const cy = py + r * 66, k = r * 100 + Math.round(x / 124);
            const pts = inkEllipsePts(x, cy, 68, 36, sd + 200 + k, 10, ((k % 5) - 2) * 0.03, 0.05);
            BF.push(inkLoop(pts, o(200 + k, { amp: 0.8 }))); BI.push(inkPath(pts, o(600 + k, { closed: true, w: 5, amp: 0.8 })));
            BS.push(inkPath([[x - 44, cy + 14], [x + 44, cy + 16]], o(1000 + k, { w: 2.5, amp: 0.5 })));
          }
          lay.bagF.setAttribute('d', BF.join(' ')); lay.bagI.setAttribute('d', BI.join(' ')); lay.bagS.setAttribute('d', BS.join(' '));
          // gunner
          const cres = cast.update(lt, t, cues), HF = [], HI = [];
          (P.cast || []).forEach((m, i) => { const q = cres[i]; if (!q || !m.helmet) return; const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + 300 + i * 20); HF.push(h.fill); HI.push(h.ink); });
          helmF.setAttribute('d', HF.join(' ')); helmI.setAttribute('d', HI.join(' '));
          // counter
          if (cnt) {
            const C = P.counter, ca = at(C.at, 0.5);
            if (lt >= ca) {
              const v = Math.round((C.to ?? 500) * progIO(lt, ca, 1.6)), pk = punch(lt, ca + 1.6, 0.6);
              const x = (C.x ?? 0.78) * W, y = (C.y ?? 0.3) * H, b = boil(sd + 9, t, 1.4);
              cnt.textContent = (C.prefix || '') + fmtNum(v);
              cnt.setAttribute('transform', `translate(${x + b[0]} ${y + b[1]}) scale(${(spring(lt, ca, 0.5) * (1 + 0.1 * pk)).toFixed(3)})`);
              cntS.textContent = C.text || ''; cntS.setAttribute('transform', `translate(${x} ${y + 78}) rotate(-2)`);
              cnt.style.display = ''; cntS.style.display = '';
            } else { cnt.style.display = 'none'; cntS.style.display = 'none'; }
          }
          const hit = punch(lt, at('hit', null), 0.6), jit = firing ? kick * 3 : 0;
          cam.setAttribute('transform', `translate(${(Math.sin(lt * 70) * jit).toFixed(1)} ${(Math.cos(lt * 60) * jit).toFixed(1)}) translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
