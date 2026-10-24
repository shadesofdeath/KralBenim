// pgb_room: a 19th-century sickroom in parchment ink (BRAND.md §3, §5; boils at 8 Hz via _ink.js; pure function of
// (seed, lt)). Written for Phineas Gage (Cavendish, Vermont, autumn 1848), parametric: a back wall with plank lines,
// a window with a swaying curtain, a wooden bed with a patient lying under a blanket, a bedside table with a candle,
// a tear-off wall calendar whose pages fly off, fever lines over the pillow, small fragments that hop into a dish,
// a coffin that is leaned against the wall, a doctor's bag, and the cast (pgb__lib cast: Gage marks, lying figures).
//   P: {floor: 0.84 (0..1 H), window: {x: 0.16, y: 0.16, w: 0.15, h: 0.3} | false,
//       bed: {x0: 0.36, x1: 0.7, y: 0.66, cover: 0.36 (blanket starts at this fraction of the bed)} | false, bag: {x: 0.79} | false, candle: {x: 0.3} | false,
//       calendar: {x: 0.5, y: 0.14, pages: ["SEP", "OCT"], at: cue, until: cue (pages flip between), w: 150} | false,
//       fever: {at: cue, x: 0.42, y: 0.56, until: cue (fades out)} | false,
//       bones: {at: cue, from: [0.42, 0.6], to: [0.32, 0.62], n: 3, gap: 0.45} | false (dish drawn at `to`),
//       coffin: {at: cue, x: 0.88, scale: 1} | false,
//       cast: [pgb__lib cast entries; lying ones (lie) are drawn under the blanket, the rest in front], labels: [window.MCB labels], cam: {zoom, focus}}
//   cues: hit (punch), calendar.at/until, fever.at, bones.at, coffin.at, cast/label "at" names
// Needs pgb__lib.js (window.PGB) and mcB__lib.js (window.MCB: labels, camPush).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.pgb_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1 } = window.PGB, MCB = window.MCB;
      const sd = seed * 1000 + 811;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const FY = (P.floor ?? 0.84) * H;
      const wall = inkEl(cam, INK.inkSoft), floor = { f: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), r: inkEl(cam) };
      const WIN = P.window === false ? null : Object.assign({ x: 0.24, y: 0.24, w: 0.13, h: 0.26 }, P.window || {});
      const win = WIN ? { f: inkEl(cam, INK.paperLight), r: inkEl(cam), cur: inkEl(cam, INK.red, { 'fill-opacity': 0.8 }), curR: inkEl(cam), moon: inkEl(cam, INK.gold) } : null;
      const CAL = P.calendar ? Object.assign({ x: 0.5, y: 0.14, pages: ['SEP', 'OCT'], w: 150 }, P.calendar) : null;
      const cal = CAL ? (() => {
        const g = el(cam, 'g');
        const back = { f: inkEl(g, INK.paperLight), r: inkEl(g), ring: inkEl(g, INK.red) };
        const pages = CAL.pages.slice().reverse().map((s, j) => {
          const i = CAL.pages.length - 1 - j;
          const pg = el(g, 'g'), f = inkEl(pg, INK.paperLight), r = inkEl(pg);
          const tx = el(pg, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: i === CAL.pages.length - 1 ? INK.red : INK.ink });
          tx.textContent = String(s).toLocaleUpperCase(LOCALE);
          return { pg, f, r, tx };
        }).reverse();   // DOM: last page first (bottom); array: index 0 = first page = top
        return { g, back, pages };
      })() : null;
      const COF = P.coffin ? Object.assign({ x: 0.88, scale: 1 }, P.coffin) : null;
      const cof = COF ? { f: inkEl(cam, INK.hat), r: inkEl(cam), d: inkEl(cam, INK.hatBand) } : null;
      const BED = P.bed === false ? null : Object.assign({ x0: 0.36, x1: 0.7, y: 0.66 }, P.bed || {});
      const bed = BED ? { frame: inkEl(cam, INK.hat), frameR: inkEl(cam), mat: inkEl(cam, INK.paperLight), matR: inkEl(cam), pil: inkEl(cam, INK.paperLight), pilR: inkEl(cam) } : null;
      const tableE = P.candle === false ? null : { f: inkEl(cam, INK.hat), r: inkEl(cam), c: inkEl(cam, INK.paperLight), cR: inkEl(cam), glow: inkEl(cam, INK.gold, { 'fill-opacity': 0.22 }), fl: inkEl(cam, INK.gold) };
      const BAG = P.bag === false ? null : Object.assign({ x: 0.79 }, P.bag || {});
      const bag = BAG ? { f: inkEl(cam, INK.hatBand), r: inkEl(cam), h: inkEl(cam) } : null;
      const lying = (P.cast || []).filter(m => m.lie), standing = (P.cast || []).filter(m => !m.lie);
      const csL = window.PGB.cast(el(cam, 'g'), lying, W, H, sd + 200);
      // blanket over the lying patient (drawn after the cast)
      const blanket = BED ? { f: inkEl(cam, INK.blue, { 'fill-opacity': 0.85 }), r: inkEl(cam), h: inkEl(cam, INK.paperLight, { 'fill-opacity': 0.6 }) } : null;
      const cs = window.PGB.cast(el(cam, 'g'), standing, W, H, sd + 300);
      const BON = P.bones ? Object.assign({ from: [0.42, 0.6], to: [0.32, 0.62], n: 3, gap: 0.45 }, P.bones) : null;
      const bones = BON ? { dish: inkEl(cam, INK.paperLight), dishR: inkEl(cam), bits: Array.from({ length: BON.n }, () => inkEl(cam, INK.paperLight)), bitsR: inkEl(cam) } : null;
      const FEV = P.fever ? Object.assign({ x: 0.42, y: 0.56 }, P.fever) : null;
      const fever = FEV ? [0, 1, 2].map(() => inkEl(cam, INK.red)) : null;
      const lb = MCB.labels(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          // wall planks + floor
          let wd = '';
          for (let k = 1; k < 9; k++) wd += inkPath([[k * W / 9, -20], [k * W / 9 + 3, FY]], { w: 2.5, seed: sd + 1 + k, t, amp: 1 }) + ' ';
          wall.setAttribute('d', wd + inkPath([[-20, FY - 40], [W + 20, FY - 44]], { w: 3, seed: sd + 12, t, amp: 1 }));
          const fp = [[-20, FY], [W + 20, FY - 4], [W + 20, H + 20], [-20, H + 20]];
          floor.f.setAttribute('d', inkLoop(fp, { seed: sd + 13, t, amp: 1, smooth: false }));
          let fl = inkPath([[-20, FY], [W + 20, FY - 4]], { w: 6, seed: sd + 14, t, amp: 1.2 });
          for (let k = 0; k < 7; k++) fl += ' ' + inkPath([[k * W / 6 - 40, FY + 18], [k * W / 6 - 160, H + 10]], { w: 2.5, seed: sd + 15 + k, t, amp: 1 });
          floor.r.setAttribute('d', fl);
          // window
          if (win) {
            const x = WIN.x * W, y = WIN.y * H, w = WIN.w * W, h = WIN.h * H;
            const wp = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
            win.f.setAttribute('d', inkLoop(wp, { seed: sd + 20, t, amp: 1, smooth: false }));
            win.r.setAttribute('d', inkPath(wp, { w: 7, seed: sd + 21, t, amp: 1.2, closed: true, smooth: false }) + ' ' +
              inkPath([[x + w / 2, y], [x + w / 2, y + h]], { w: 4, seed: sd + 22, t, amp: 1 }) + ' ' + inkPath([[x, y + h / 2], [x + w, y + h / 2]], { w: 4, seed: sd + 23, t, amp: 1 }));
            win.moon.setAttribute('d', inkCircle(x + w * 0.72, y + h * 0.26, 22, sd + 24, t, { fill: true }));
            const sw = Math.sin(t * 1.3) * 14;
            const cp = [[x - 30, y - 20], [x + w * 0.32, y - 20], [x + w * 0.22 + sw, y + h * 0.5], [x + w * 0.3 + sw * 1.3, y + h + 20], [x - 30, y + h + 20]];
            win.cur.setAttribute('d', inkLoop(cp, { seed: sd + 25, t, amp: 1 }));
            win.curR.setAttribute('d', inkPath(cp, { w: 4, seed: sd + 26, t, amp: 1, closed: true }) + ' ' + inkPath([[x - 50, y - 24], [x + w + 30, y - 24]], { w: 7, seed: sd + 27, t, amp: 1 }));
          }
          // calendar (pages fly off between at and until)
          if (cal) {
            const cx = CAL.x * W, cy = CAL.y * H, w = CAL.w, h = w * 0.95;
            const bp = [[cx - w / 2, cy], [cx + w / 2, cy], [cx + w / 2, cy + h], [cx - w / 2, cy + h]];
            cal.back.f.setAttribute('d', inkLoop(bp, { seed: sd + 30, t, amp: 0.8, smooth: false }));
            cal.back.r.setAttribute('d', inkPath(bp, { w: 4, seed: sd + 31, t, amp: 1, closed: true, smooth: false }));
            cal.back.ring.setAttribute('d', inkPath([[cx - w / 2, cy + 22], [cx + w / 2, cy + 20]], { w: 12, seed: sd + 32, t, amp: 0.8 }));
            const a = atOr(cues, CAL.at, 0.6), u = atOr(cues, CAL.until, a + 2.5), n = cal.pages.length;
            cal.pages.forEach((pg, i) => {   // i = 0 is the top page
              const k = i, flipAt = n > 1 ? lerp(a, u, k / Math.max(1, n - 1)) : a;
              const last = k === n - 1;
              const p = last ? 0 : prog(lt, flipAt, 0.7);
              const pp = [[cx - w / 2 + 6, cy + 34], [cx + w / 2 - 6, cy + 34], [cx + w / 2 - 6, cy + h - 6], [cx - w / 2 + 6, cy + h - 6]];
              pg.f.setAttribute('d', inkLoop(pp, { seed: sd + 33 + k, t, amp: 0.8, smooth: false }));
              pg.r.setAttribute('d', inkPath(pp, { w: 3.5, seed: sd + 36 + k, t, amp: 0.8, closed: true, smooth: false }));
              pg.tx.setAttribute('x', cx); pg.tx.setAttribute('y', cy + h * 0.68);
              pg.pg.style.display = p >= 0.99 ? 'none' : '';
              pg.pg.setAttribute('transform', `translate(${f1(p * 260)} ${f1(-p * 120 + p * p * 420)}) rotate(${f1(p * 70)} ${f1(cx)} ${f1(cy + 34)})`);
            });
          }
          // coffin leaned against the wall
          if (cof) {
            const a = atOr(cues, COF.at, 0.5), p = spring(lt, a, 0.7), s = (COF.scale || 1) * (1 + 0.06 * punch(lt, a, 0.6));
            const x = COF.x * W + (1 - p) * 400, y = FY - 6;
            const C = [[0, 0], [-62, -30], [-80, -300], [-50, -420], [50, -420], [80, -300], [62, -30]].map(q => [x + q[0] * s + q[1] * s * -0.05, y + q[1] * s]);
            cof.f.setAttribute('d', p > 0.01 ? inkLoop(C, { seed: sd + 40, t, amp: 1, smooth: false }) : '');
            cof.r.setAttribute('d', p > 0.01 ? inkPath(C, { w: 6, seed: sd + 41, t, amp: 1.2, closed: true, smooth: false }) : '');
            const crs = [[x - 4 * s + 15 * s, y - 330 * s], [x + 15 * s, y - 230 * s]], crs2 = [[x - 35 * s + 12 * s, y - 300 * s], [x + 35 * s + 12 * s, y - 302 * s]];
            cof.d.setAttribute('d', p > 0.01 ? inkPath(crs, { w: 8, seed: sd + 42, t, amp: 0.8 }) + ' ' + inkPath(crs2, { w: 8, seed: sd + 43, t, amp: 0.8 }) : '');
          }
          // bed
          if (bed) {
            const x0 = BED.x0 * W, x1 = BED.x1 * W, y = BED.y * H;
            const fr = [[x0 - 30, FY], [x0 - 30, y - 150], [x0 - 4, y - 160], [x0 + 4, y + 40], [x1 - 4, y + 40], [x1, y - 60], [x1 + 24, y - 64], [x1 + 24, FY], [x1, FY], [x1, y + 70], [x0, y + 70], [x0, FY]];
            bed.frame.setAttribute('d', inkLoop(fr, { seed: sd + 50, t, amp: 1, smooth: false }));
            bed.frameR.setAttribute('d', inkPath(fr, { w: 5.5, seed: sd + 51, t, amp: 1.2, closed: true, smooth: false }));
            const mp = [[x0, y], [x1, y - 4], [x1 + 6, y + 40], [x0, y + 42]];
            bed.mat.setAttribute('d', inkLoop(mp, { seed: sd + 52, t, amp: 1 }));
            bed.matR.setAttribute('d', inkPath(mp, { w: 4.5, seed: sd + 53, t, amp: 1, closed: true }));
            const pl = inkEllipsePts(x0 + 70, y - 14, 70, 24, sd + 54, 12);
            bed.pil.setAttribute('d', inkLoop(pl, { seed: sd + 54, t, amp: 1 }));
            bed.pilR.setAttribute('d', inkPath(pl, { w: 4, seed: sd + 55, t, amp: 1, closed: true }));
          }
          // bedside table + candle
          if (tableE) {
            const x = (P.candle && P.candle.x != null ? P.candle.x : 0.29) * W, ty = FY - 170;
            const tp = [[x - 60, ty], [x + 60, ty], [x + 52, FY], [x + 40, FY], [x + 40, ty + 26], [x - 40, ty + 26], [x - 40, FY], [x - 52, FY]];
            tableE.f.setAttribute('d', inkLoop(tp, { seed: sd + 60, t, amp: 1, smooth: false }));
            tableE.r.setAttribute('d', inkPath(tp, { w: 5, seed: sd + 61, t, amp: 1, closed: true, smooth: false }));
            const cp = [[x - 14, ty], [x - 14, ty - 80], [x + 14, ty - 82], [x + 14, ty]];
            tableE.c.setAttribute('d', inkLoop(cp, { seed: sd + 62, t, amp: 0.6, smooth: false }));
            tableE.cR.setAttribute('d', inkPath(cp, { w: 4, seed: sd + 63, t, amp: 0.8, closed: true, smooth: false }));
            const fw = Math.sin(t * 11) * 4 + Math.sin(t * 7.3) * 3;
            tableE.glow.setAttribute('d', inkCircle(x, ty - 110, 70 + Math.sin(t * 4) * 5, sd + 64, t, { fill: true }));
            tableE.fl.setAttribute('d', inkLoop([[x - 11, ty - 86], [x + fw, ty - 140], [x + 11, ty - 86], [x, ty - 80]], { seed: sd + 65, t, amp: 1.2 }));
          }
          // doctor's bag
          if (bag) {
            const x = BAG.x * W, y = FY - 4;
            const bp = [[x - 80, y], [x - 70, y - 90], [x + 70, y - 92], [x + 80, y]];
            bag.f.setAttribute('d', inkLoop(bp, { seed: sd + 70, t, amp: 1 }));
            bag.r.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 71, t, amp: 1, closed: true }) + ' ' + inkPath([[x - 76, y - 50], [x + 76, y - 52]], { w: 3.5, seed: sd + 72, t, amp: 1 }));
            bag.h.setAttribute('d', inkPath([[x - 30, y - 90], [x - 24, y - 126], [x + 24, y - 126], [x + 30, y - 92]], { w: 6, seed: sd + 73, t, amp: 1 }));
          }
          csL.update(lt, t, cues);
          // blanket over the patient
          if (blanket) {
            const x0 = BED.x0 * W, x1 = BED.x1 * W, y = BED.y * H, br = Math.sin(t * 2.1) * 3;
            const bx = x0 + (BED.cover ?? 0.36) * (x1 - x0);
            const bp = [[bx + 20, y - 44 + br], [bx + 110, y - 54 + br], [x1 - 40, y - 40], [x1 + 12, y - 30], [x1 + 18, y + 64], [bx, y + 66], [bx, y + 10]];
            blanket.f.setAttribute('d', inkLoop(bp, { seed: sd + 80, t, amp: 1 }));
            blanket.r.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 81, t, amp: 1.2, closed: true }));
            let hd = '';
            for (let k = 0; k < 6; k++) { const xx = bx + 50 + k * (x1 - bx - 50) / 6; hd += inkPath([[xx, y - 30], [xx + 30, y + 50]], { w: 4, seed: sd + 82 + k, t, amp: 1 }) + ' '; }
            blanket.h.setAttribute('d', hd);
          }
          cs.update(lt, t, cues);
          // bone fragments hop into a dish
          if (bones) {
            const a = atOr(cues, BON.at, 0.6), [fx, fy] = [BON.from[0] * W, BON.from[1] * H], [tx, ty] = [BON.to[0] * W, BON.to[1] * H];
            const dp = inkEllipsePts(tx, ty, 54, 16, sd + 90, 10);
            bones.dish.setAttribute('d', inkLoop(dp, { seed: sd + 90, t, amp: 0.8 }));
            bones.dishR.setAttribute('d', inkPath(dp, { w: 4.5, seed: sd + 91, t, amp: 1, closed: true }));
            let rd = '';
            bones.bits.forEach((b, i) => {
              const p = prog(lt, a + i * BON.gap, 0.55);
              if (lt < a + i * BON.gap) { b.setAttribute('d', ''); return; }
              const x = lerp(fx, tx + (i - 1) * 18, p), y = lerp(fy, ty - 8, p) - Math.sin(p * Math.PI) * 120;
              const bp = inkEllipsePts(x, y, 10, 7, sd + 92 + i, 6, i);
              b.setAttribute('d', inkLoop(bp, { seed: sd + 92 + i, t, amp: 0.6 }));
              rd += inkPath(bp, { w: 3, seed: sd + 95 + i, t, amp: 0.6, closed: true }) + ' ';
            });
            bones.bitsR.setAttribute('d', rd);
          }
          // fever lines rising over the pillow
          if (fever) {
            const a = atOr(cues, FEV.at, 0.5), u = atOr(cues, FEV.until, null);
            const on = clamp01((lt - a) / 0.4) * (u != null ? 1 - clamp01((lt - u) / 0.6) : 1);
            fever.forEach((f, i) => {
              if (on <= 0.02) { f.setAttribute('d', ''); return; }
              const x = FEV.x * W + (i - 1) * 46, y0 = FEV.y * H, ph = (lt * 0.9 + i * 0.33) % 1, yy = y0 - ph * 90;
              const pts = []; for (let k = 0; k < 6; k++) pts.push([x + Math.sin(k * 1.4 + lt * 6 + i) * 12, yy - k * 18 * on]);
              f.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 100 + i, t, amp: 1, taper: 0.5 }));
            });
          }
          MCB.camPush(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
