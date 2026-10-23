// lz_fault: an undersea thrust fault as a hand-drawn cross-section on parchment (brand/kit/BRAND.md §3, §5; every line
// boils at 8 Hz via _ink.js; pure function of (seed, lt), no Math.random). Written for 05-lizbon-depremi-1755 (the
// Atlantic quake south-west of Lisbon) but parametric. 16:9 first. Needs mcB__lib.js (window.MCB).
// The sea (surface line, wave hatching, a small ship) over the sea bed; below it two crust blocks with layered strata
// meeting on a dipping fault line; the coast with a tiny city on the right.
//   cue `push`: red arrows press the two blocks together (strain: the strata bend a little more every second);
//   cue `hit`: the fault slips — the right block jumps up, a gold flash + ink shock rings burst from the focus, the
//              sea surface bulges above the step and splits into two waves that run left and right (the right one
//              reaches the coast and the city).
// P: {rings: true (shock rings at the focus), wave_amp: 70 (px), slip: true, ship: true, city: {text: "Lizbon"} | false, push: true, cast: [...MCB cast], labels: [...MCB labels],
//     cam: {zoom: 1.06, focus: [0.5, 0.5]}}
// cues: push, hit, plus cast/label "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.lz_fault = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 1111;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const SY = 0.24 * H, BY = 0.47 * H, FX = 0.5 * W, CX = 0.84 * W;
      const L = {
        water: inkEl(cam, INK.blue, { 'fill-opacity': 0.2 }), surf: inkEl(cam, INK.inkSoft), hatch: inkEl(cam, INK.inkSoft),
        blockL: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.75 }), blockR: inkEl(cam, INK.stain, { 'fill-opacity': 0.55 }), strata: inkEl(cam, INK.inkSoft),
        edge: inkEl(cam), fault: inkEl(cam, INK.red), arrows: inkEl(cam, INK.red), flash: inkEl(cam, INK.gold, { 'fill-opacity': 0.85 }), rings: inkEl(cam),
        coast: inkEl(cam, INK.paperDark), coastR: inkEl(cam), city: inkEl(cam, INK.ink), ship: inkEl(cam, INK.paperLight), shipR: inkEl(cam),
      };
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hitAt = atOr(cues, 'hit', P.slip === false ? null : Math.min(dur * 0.45, 2.5));
          const pushAt = atOr(cues, 'push', P.push === false ? null : 0.2);
          const hit = punch(lt, hitAt, 0.6);
          const slip = hitAt != null ? spring(lt, hitAt, 0.35) : 0, up = slip * 46;
          const strain = pushAt != null ? clamp01((lt - pushAt) / 2.5) * (1 - slip) : 0;
          const age = hitAt != null && lt > hitAt ? lt - hitAt : -1;
          // sea surface: bulge + two travelling waves
          const surf = x => {
            let y = SY + Math.sin(x * 0.01 + t * 1.4) * 5;
            if (age >= 0) {
              const sp = 260, a0 = (P.wave_amp ?? 70) * Math.exp(-age * 0.25);
              const bulge = Math.exp(-((x - FX) ** 2) / (2 * 120 ** 2)) * 60 * Math.exp(-age * 2.5) * (age < 0.3 ? age / 0.3 : 1);
              const wl = Math.exp(-((x - (FX - age * sp)) ** 2) / (2 * 90 ** 2)) * a0, wr = Math.exp(-((x - (FX + age * sp)) ** 2) / (2 * 90 ** 2)) * a0;
              y -= bulge + wl + wr;
            }
            return y;
          };
          const sp = []; for (let x = -40; x <= W + 40; x += 30) sp.push([x, Math.min(surf(x), x > CX ? BY : 9999)]);
          L.water.setAttribute('d', inkLoop(sp.concat([[W + 40, BY], [-40, BY]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
          L.surf.setAttribute('d', inkPath(sp, { w: 5, seed: sd + 2, t, amp: 1.2 }));
          let hd = '';
          for (let k = 0; k < 10; k++) { const yy = SY + 30 + (k % 4) * (BY - SY - 40) / 4, xx = ((k * 0.37 % 1) * (W + 300) + t * 20) % (W + 300) - 150;
            if (xx < CX - 80) hd += inkPath([[xx, yy], [xx + 50, yy - 5], [xx + 100, yy]], { w: 3, seed: sd + 3 + k, t, amp: 1 }) + ' '; }
          L.hatch.setAttribute('d', hd);
          // crust blocks: fault from (FX, BY) dipping down-left to (FX - 0.2W, H)
          const fb = [FX - 0.2 * W, H + 20];
          const bend = strain * 26;
          const lb0 = [[-40, BY], [FX, BY], fb, [-40, H + 20]];
          const rb0 = [[FX, BY - up], [CX, BY - up], [CX + 40, BY - 90 - up * 0.3], [W + 40, BY - 110 - up * 0.3], [W + 40, H + 20], [fb[0], H + 20 - up]];
          L.blockL.setAttribute('d', inkLoop(lb0, { seed: sd + 20, t, amp: 1, smooth: false }));
          L.blockR.setAttribute('d', inkLoop(rb0, { seed: sd + 21, t, amp: 1, smooth: false }));
          let st = '';
          for (let k = 1; k <= 4; k++) { const y = BY + k * (H - BY) / 5;
            const xf = lerp(FX, fb[0], (y - BY) / (H - BY));
            const lp = []; for (let x = -40; x <= xf - 6; x += 60) lp.push([x, y + Math.sin(x * 0.006) * 8 - bend * Math.max(0, 1 - (xf - x) / 500)]);
            if (lp.length > 1) st += inkPath(lp, { w: 3, seed: sd + 30 + k, t, amp: 1 }) + ' ';
            const rp = []; for (let x = xf + 6; x <= W + 40; x += 60) rp.push([x, y - up + Math.sin(x * 0.006 + 1) * 8 + bend * Math.max(0, 1 - (x - xf) / 500)]);
            if (rp.length > 1) st += inkPath(rp, { w: 3, seed: sd + 40 + k, t, amp: 1 }) + ' '; }
          L.strata.setAttribute('d', st);
          L.edge.setAttribute('d', inkPath([[-40, BY], [FX, BY]], { w: 6, seed: sd + 50, t, amp: 1.2 }) + ' ' + inkPath([[FX, BY - up], [CX, BY - up], [CX + 40, BY - 90 - up * 0.3], [W + 40, BY - 110 - up * 0.3]], { w: 6, seed: sd + 51, t, amp: 1.2, smooth: false }));
          L.fault.setAttribute('d', inkPath([[FX, BY - up * 0.5], [lerp(FX, fb[0], 0.5), lerp(BY, H, 0.5)], fb], { w: 8 + 4 * hit, seed: sd + 52, t, amp: 1.4 }));
          // push arrows
          let ad = '';
          if (pushAt != null && lt > pushAt && slip < 0.9) {
            const g = spring(lt, pushAt, 0.5), y = BY + (H - BY) * 0.55, pul = Math.sin(lt * 6) * 8;
            const arr = (x0, x1) => { const hx = x1 > x0 ? -1 : 1;
              return inkPath([[x0, y], [x1, y]], { w: 12, seed: sd + 60 + x0, t, amp: 1 }) + ' ' + inkPath([[x1 + hx * 34, y - 30], [x1, y], [x1 + hx * 34, y + 30]], { w: 12, seed: sd + 61 + x0, t, amp: 1, smooth: false }); };
            ad = arr(0.08 * W, (0.08 + 0.12 * g) * W + pul) + ' ' + arr(0.92 * W, (0.92 - 0.12 * g) * W - pul);
          }
          L.arrows.setAttribute('d', ad);
          // flash + rings at the focus
          const foc = [lerp(FX, fb[0], 0.42), lerp(BY, H, 0.42)];
          let fl = '', rg = '';
          if (age >= 0) {
            if (age < 1.2) { const r = 40 + age * 60; const pts = []; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, rr = k % 2 ? r * 0.45 : r * (1 - age * 0.5); pts.push([foc[0] + Math.cos(a) * rr, foc[1] + Math.sin(a) * rr]); }
              fl = inkLoop(pts, { seed: sd + 70, t, amp: 1.5, smooth: false }); }
            for (let k = 0; k < (P.rings === false ? 0 : 3); k++) { const a2 = age - k * 0.35; if (a2 > 0 && a2 < 2.6) rg += inkCircle(foc[0], foc[1], 50 + a2 * 260, sd + 80 + k, t, { w: Math.max(2, 7 - a2 * 2) }) + ' '; }
          }
          L.flash.setAttribute('d', fl); L.rings.setAttribute('d', rg);
          // coast + city
          if (P.city !== false) {
            const cp = [[CX - 10, BY - up], [CX + 40, BY - 90 - up * 0.3], [W + 40, BY - 110 - up * 0.3], [W + 40, BY - up + 20], [CX - 10, BY - up + 20]];
            let cd = '';
            for (let k = 0; k < 5; k++) { const x = CX + 70 + k * 46, y = BY - 100 - up * 0.3, h = 40 + (k % 3) * 22;
              cd += inkLoop([[x, y], [x, y - h], [x + 18, y - h - 16], [x + 36, y - h], [x + 36, y]], { seed: sd + 90 + k, t, amp: 0.8, smooth: false }) + ' '; }
            L.city.setAttribute('d', cd);
          }
          // ship riding the waves
          if (P.ship !== false) {
            const x = 0.24 * W, y = surf(x), sl = (surf(x + 30) - surf(x - 30)) / 60, rot = Math.atan(sl);
            const c = Math.cos(rot), s = Math.sin(rot), T = p => [x + p[0] * c - p[1] * s, y + p[0] * s + p[1] * c];
            const hull = [[-70, -10], [70, -12], [52, 16], [-54, 16]].map(T), sail = [[-30, -110], [30, -110], [26, -24], [-26, -24]].map(T);
            L.ship.setAttribute('d', inkLoop(sail, { seed: sd + 100, t, amp: 1 }) + ' ' + inkLoop(hull, { seed: sd + 101, t, amp: 1, smooth: false }));
            L.shipR.setAttribute('d', inkPath(hull, { w: 4, seed: sd + 102, t, amp: 1, closed: true, smooth: false }) + ' ' + inkPath(sail, { w: 3.5, seed: sd + 103, t, amp: 1, closed: true }) + ' ' + inkPath([T([0, -12]), T([0, -124])], { w: 4, seed: sd + 104, t, amp: 1 }));
          }
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit, age >= 0 && age < 1 ? 1 - age : 0);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
