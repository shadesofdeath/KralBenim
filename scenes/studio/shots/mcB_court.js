// mcB_court: a 19th-century British courtroom in parchment ink (BRAND.md §3, §5; boils at 8 Hz via _ink.js; pure
// function of (seed, lt)). Written for the Mary Celeste salvage hearing in Gibraltar (1873) and Captain Parker's
// trial, parametric: panelled wall with a royal coat of arms, a raised judge's bench (the judge sits behind it), an
// exhibits table with an old sword and a piece of the ship's rail (cut marks, dark stains), an optional dock, a
// magnifying glass that sweeps over the stains on a cue. Needs mcB__lib.js (window.MCB).
// P: {bench: {x: 0.72, w: 0.34} | false, arms: true, table: {x: 0.36, w: 0.3} | false, sword: true, rail: true,
//     stains: true, cuts_at: cue (red rings round the cut marks), stains_at: cue (red rings round the stains),
//     glass: {at: cue, dur: 2} (magnifier sweeps over the stains), clean: cue (stains fade to plain wood),
//     dock: {x: 0.16, w: 0.18} | false,
//     cast: [...MCB cast entries + layer: "back" (behind the bench: the judge) | "dock" (inside the dock) | "front"],
//     labels: [...MCB labels], cam: {zoom: 1.05, focus: [0.5, 0.55]}}
// cues: hit (punch), cuts_at, stains_at, glass.at, clean, labels/cast "at" names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.mcB_court = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1, rr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 523;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const FY = 0.86 * H;                        // floor line
      const castAll = P.cast || [];
      const pick = l => castAll.filter(c => (c.layer || 'front') === l);
      const wall = { panels: inkEl(cam, INK.inkSoft), dado: inkEl(cam), floor: inkEl(cam, INK.inkSoft), win: inkEl(cam, INK.paperLight), winR: inkEl(cam) };
      const arms = P.arms !== false && P.bench !== false ? { f: inkEl(cam, INK.gold), r: inkEl(cam), c: inkEl(cam, INK.gold), cr: inkEl(cam), lion: inkEl(cam, INK.red) } : null;
      const back = cast(el(cam, 'g'), pick('back'), W, H, sd + 100);
      const bench = P.bench !== false ? { f: inkEl(cam, INK.paperDark), r: inkEl(cam), top: inkEl(cam, INK.inkSoft), pan: inkEl(cam, INK.inkSoft) } : null;
      const dockCast = cast(el(cam, 'g'), pick('dock'), W, H, sd + 300);
      const dockFront = P.dock ? { f: inkEl(cam, INK.paperDark), r: inkEl(cam), rail: inkEl(cam) } : null;
      const table = P.table !== false ? { f: inkEl(cam, INK.paperDark), r: inkEl(cam), legs: inkEl(cam) } : null;
      const rail = table && P.rail !== false ? { f: inkEl(cam, INK.hat), r: inkEl(cam), grain: inkEl(cam, INK.hatBand), cuts: inkEl(cam, INK.ink) } : null;
      const sword = table && P.sword !== false ? { blade: inkEl(cam, INK.paperLight), r: inkEl(cam), hilt: inkEl(cam, INK.gold), hr: inkEl(cam) } : null;
      const stains = table && P.stains !== false ? inkEl(cam, INK.hatBand) : null;
      const rings = inkEl(cam, INK.red);
      const glass = P.glass ? { lens: inkEl(cam, INK.paperLight, { 'fill-opacity': 0.35 }), r: inkEl(cam), h: inkEl(cam, INK.hatBand) } : null;
      const front = cast(el(cam, 'g'), pick('front'), W, H, sd + 500);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 700);
      const B = Object.assign({ x: 0.72, w: 0.34 }, P.bench || {}), T = Object.assign({ x: 0.36, w: 0.3 }, P.table || {});
      const D = Object.assign({ x: 0.16, w: 0.18 }, P.dock || {});
      // exhibit geometry (stage px)
      const TY = 0.7 * H, tx0 = (T.x - T.w / 2) * W, tx1 = (T.x + T.w / 2) * W;
      const railPts = [[tx0 + 40, TY - 6], [tx0 + 40, TY - 150], [tx1 - 40, TY - 170], [tx1 - 40, TY - 6]];
      const cutsX = [0.3, 0.42, 0.55].map(u => lerp(tx0 + 40, tx1 - 40, u));
      const stainP = [[0.66, 0.55], [0.8, 0.4], [0.2, 0.65]].map(([u, v]) => [lerp(tx0 + 40, tx1 - 40, u), lerp(TY - 6, TY - 160, v)]);
      const bladeY = TY - 26, bx0 = tx0 + 70, bx1 = tx1 - 120;
      const swordStain = [lerp(bx0, bx1, 0.55), bladeY];

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          // wall panels + floor
          let pd = '';
          for (let k = 0; k <= 8; k++) { const x = k * W / 8; pd += inkPath([[x, 0.12 * H], [x + 2, FY]], { w: 3, seed: sd + 10 + k, t, amp: 1 }) + ' '; }
          for (let k = 0; k < 8; k++) { const x = k * W / 8 + 40; pd += inkPath(rr(x, 0.64 * H, W / 8 - 80, 0.17 * H, 10), { w: 2.5, seed: sd + 30 + k, t, amp: 1, closed: true }) + ' '; }
          wall.panels.setAttribute('d', pd);
          wall.dado.setAttribute('d', inkPath([[-20, 0.62 * H], [W + 20, 0.62 * H]], { w: 5, seed: sd + 2, t, amp: 1.2 }) + ' ' + inkPath([[-20, FY], [W + 20, FY]], { w: 6, seed: sd + 3, t, amp: 1.2 }));
          let fd = '';
          for (let k = -6; k <= 14; k++) { const x = k * W / 8; fd += inkPath([[x, FY], [x + (x - W / 2) * 0.5, H + 20]], { w: 2.5, seed: sd + 50 + k + 6, t, amp: 1 }) + ' '; }
          wall.floor.setAttribute('d', fd);
          const wp = rr(0.08 * W, 0.18 * H, 0.14 * W, 0.34 * H, 60);
          wall.win.setAttribute('d', P.bench === false ? '' : inkLoop(wp, { seed: sd + 4, t, amp: 1 }));
          wall.winR.setAttribute('d', P.bench === false ? '' : inkPath(wp, { w: 5, seed: sd + 5, t, amp: 1.2, closed: true }) + ' ' + inkPath([[0.15 * W, 0.18 * H], [0.15 * W, 0.52 * H]], { w: 4, seed: sd + 6, t, amp: 1 }) + ' ' + inkPath([[0.08 * W, 0.36 * H], [0.22 * W, 0.36 * H]], { w: 4, seed: sd + 7, t, amp: 1 }));
          if (arms) {
            const cx = B.x * W, cy = 0.24 * H, s = 1 + 0.02 * Math.sin(lt * 2);
            const sh = [[-70, -70], [70, -70], [70, 10], [40, 60], [0, 80], [-40, 60], [-70, 10]].map(q => [cx + q[0] * s, cy + q[1] * s]);
            arms.f.setAttribute('d', inkLoop(sh, { seed: sd + 60, t, amp: 1 })); arms.r.setAttribute('d', inkPath(sh, { w: 5, seed: sd + 61, t, amp: 1.2, closed: true }));
            const cr = [[-50, -76], [-56, -126], [-28, -100], [0, -136], [28, -100], [56, -126], [50, -76]].map(q => [cx + q[0], cy + q[1]]);
            arms.c.setAttribute('d', inkLoop(cr, { seed: sd + 62, t, amp: 1 })); arms.cr.setAttribute('d', inkPath(cr, { w: 4, seed: sd + 63, t, amp: 1, closed: true }));
            arms.lion.setAttribute('d', inkPath([[cx, cy - 62], [cx, cy + 66]], { w: 16, seed: sd + 64, t, amp: 1 }) + ' ' + inkPath([[cx - 62, cy - 14], [cx + 62, cy - 14]], { w: 16, seed: sd + 65, t, amp: 1 }));
          }
          back.update(lt, t, cues);
          if (bench) {
            const x0 = (B.x - B.w / 2) * W, x1 = (B.x + B.w / 2) * W, top = 0.5 * H;
            const pts = [[x0, FY], [x0, top], [x1, top], [x1, FY]];
            bench.f.setAttribute('d', inkLoop(pts, { seed: sd + 70, t, amp: 1, smooth: false }));
            bench.r.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 71, t, amp: 1.3, closed: true, smooth: false }));
            bench.top.setAttribute('d', inkLoop([[x0 - 26, top - 4], [x1 + 26, top - 4], [x1 + 26, top + 24], [x0 - 26, top + 24]], { seed: sd + 72, t, amp: 1, smooth: false }));
            let p = '';
            for (let k = 0; k < 3; k++) { const px = lerp(x0 + 30, x1 - 30, k / 3), w = (x1 - x0 - 60) / 3 - 24; p += inkPath(rr(px + 12, top + 60, w, FY - top - 100, 12), { w: 3.5, seed: sd + 73 + k, t, amp: 1, closed: true }) + ' '; }
            bench.pan.setAttribute('d', p);
          }
          if (P.dock) dockCast.update(lt, t, cues);
          if (dockFront) {
            const x0 = (D.x - D.w / 2) * W, x1 = (D.x + D.w / 2) * W, top = 0.64 * H;
            const pts = [[x0, FY], [x0, top], [x1, top], [x1, FY]];
            dockFront.f.setAttribute('d', inkLoop(pts, { seed: sd + 80, t, amp: 1, smooth: false }));
            dockFront.r.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 81, t, amp: 1.3, closed: true, smooth: false }));
            let r = inkPath([[x0 - 10, top - 70], [x1 + 10, top - 70]], { w: 7, seed: sd + 82, t, amp: 1 });
            for (let k = 0; k <= 4; k++) r += ' ' + inkPath([[lerp(x0, x1, k / 4), top - 70], [lerp(x0, x1, k / 4), top]], { w: 5, seed: sd + 83 + k, t, amp: 1 });
            dockFront.rail.setAttribute('d', r);
          }
          if (table) {
            const pts = [[tx0 - 20, TY], [tx1 + 20, TY], [tx1 + 20, TY + 26], [tx0 - 20, TY + 26]];
            table.f.setAttribute('d', inkLoop(pts, { seed: sd + 90, t, amp: 1, smooth: false }));
            table.r.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 91, t, amp: 1.2, closed: true, smooth: false }));
            table.legs.setAttribute('d', inkPath([[tx0 + 10, TY + 26], [tx0 + 14, FY]], { w: 8, seed: sd + 92, t, amp: 1 }) + ' ' + inkPath([[tx1 - 10, TY + 26], [tx1 - 14, FY]], { w: 8, seed: sd + 93, t, amp: 1 }));
          }
          const clean = 1 - prog(lt, atOr(cues, P.clean, 1e9), 1.0);
          if (rail) {
            rail.f.setAttribute('d', inkLoop(railPts, { seed: sd + 100, t, amp: 1, smooth: false }));
            rail.r.setAttribute('d', inkPath(railPts, { w: 5, seed: sd + 101, t, amp: 1.2, closed: true, smooth: false }));
            let g = '';
            for (let k = 0; k < 4; k++) g += inkPath([[tx0 + 60, TY - 30 - k * 34], [lerp(tx0, tx1, 0.5), TY - 36 - k * 36], [tx1 - 60, TY - 40 - k * 36]], { w: 2.5, seed: sd + 102 + k, t, amp: 1 }) + ' ';
            rail.grain.setAttribute('d', g);
            rail.cuts.setAttribute('d', cutsX.map((x, k) => { const y = lerp(TY - 150, TY - 170, (x - tx0) / (tx1 - tx0)); return inkLoop([[x - 16, y - 2], [x + 14, y - 3], [x + 2, y + 44]], { seed: sd + 106 + k, t, amp: 0.8, smooth: false }); }).join(' '));
          }
          if (stains) {
            const pts = stainP.concat([swordStain]);
            stains.setAttribute('d', clean > 0.02 ? pts.map(([x, y], k) => inkLoop(inkEllipsePts(x, y, (k === 3 ? 26 : 34) * clean, (k === 3 ? 12 : 22) * clean, sd + 110 + k, 9, 0.3, 0.25), { seed: sd + 110 + k, t, amp: 1.2 })).join(' ') : '');
          }
          if (sword) {
            const bl = [[bx0, bladeY - 12], [bx1, bladeY - 10], [bx1 + 50, bladeY], [bx1, bladeY + 10], [bx0, bladeY + 12]];
            sword.blade.setAttribute('d', inkLoop(bl, { seed: sd + 120, t, amp: 0.8, smooth: false }));
            sword.r.setAttribute('d', inkPath(bl, { w: 4, seed: sd + 121, t, amp: 1, closed: true, smooth: false }) + ' ' + inkPath([[bx0 + 20, bladeY], [bx1, bladeY]], { w: 2, seed: sd + 122, t, amp: 0.8 }));
            const hilt = [[bx0 - 10, bladeY - 46], [bx0 + 4, bladeY - 46], [bx0 + 4, bladeY + 46], [bx0 - 10, bladeY + 46]];
            sword.hilt.setAttribute('d', inkLoop(hilt, { seed: sd + 123, t, amp: 0.8, smooth: false }) + ' ' + inkLoop([[bx0 - 90, bladeY - 9], [bx0 - 10, bladeY - 9], [bx0 - 10, bladeY + 9], [bx0 - 90, bladeY + 9]], { seed: sd + 124, t, amp: 0.8, smooth: false }) + ' ' + inkCircle(bx0 - 100, bladeY, 15, sd + 125, t, { fill: true }));
            sword.hr.setAttribute('d', inkPath(hilt, { w: 3.5, seed: sd + 126, t, amp: 0.8, closed: true, smooth: false }));
          }
          // red rings on cues
          let rd = '';
          const ring = (x, y, r, at, k) => { if (at == null || lt < at) return; const p = prog(lt, at, 0.5); rd += inkPath(inkEllipsePts(x, y, r * 1.1, r * 0.8, sd + 130 + k, 14).slice(0, Math.max(2, Math.round(14 * p))), { w: 7, seed: sd + 140 + k, t, amp: 1.2 }) + ' '; };
          const ca = atOr(cues, P.cuts_at, null), sa = atOr(cues, P.stains_at, null);
          if (rail) cutsX.forEach((x, k) => ring(x, lerp(TY - 150, TY - 170, (x - tx0) / (tx1 - tx0)) + 14, 44, ca == null ? null : ca + k * 0.15, k));
          if (stains) stainP.concat([swordStain]).forEach(([x, y], k) => ring(x, y, k === 3 ? 50 : 56, sa == null ? null : sa + k * 0.15, k + 4));
          rings.setAttribute('d', rd);
          if (glass) {
            const ga = atOr(cues, P.glass.at, 0.5), gd = P.glass.dur ?? 2.2, u = progIO(lt, ga, gd), on = lt >= ga - 0.3;
            const pts = stainP.concat([swordStain]);
            const seg = u * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(seg)), f = seg - k;
            const gx = lerp(pts[k][0], pts[k + 1][0], f), gy = lerp(pts[k][1], pts[k + 1][1], f) - 10 + Math.sin(lt * 3) * 6;
            const s = on ? spring(lt, ga - 0.3, 0.5) : 0;
            glass.lens.setAttribute('d', s > 0.01 ? inkCircle(gx, gy, 70 * s, sd + 150, t, { fill: true }) : '');
            glass.r.setAttribute('d', s > 0.01 ? inkCircle(gx, gy, 70 * s, sd + 151, t, { w: 9 }) : '');
            glass.h.setAttribute('d', s > 0.01 ? inkPath([[gx + 50 * s, gy + 50 * s], [gx + 130 * s, gy + 130 * s]], { w: 20, seed: sd + 152, t, amp: 1 }) : '');
          }
          front.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
