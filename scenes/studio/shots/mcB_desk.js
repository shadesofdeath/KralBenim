// mcB_desk: two small interiors in parchment ink (BRAND.md §3, §5; boils at 8 Hz via _ink.js; pure function of (seed, lt)).
// Written for the Mary Celeste long video (Conan Doyle's 1884 story and the "warm tea" myth), parametric.
//
//   mcB_desk — a writer's desk: a big sheet of paper on the right with a Fraunces title, hand-written lines that write
//     themselves while a quill follows the line end, an ink pot and an oil lamp; optional name line where a word is
//     struck out in red and a new word is written above it.
//     P: {title: ["Line one", "line two"] (Fraunces, 64 px), title_at: cue, write: {at: 0.3, dur: 5} (scribble lines),
//         name: {text: "MARY", rest: "CELESTE", strike: cue, fix: "MARIE", fix_at: cue}, cast: [...MCB cast],
//         labels: [...MCB labels], cam}
//     cues: hit, title_at, name.strike, name.fix_at, labels/cast "at"
//
//   mcB_table — a ship's cabin table: steaming tea cups, a teapot, a plate with a half-eaten loaf, chairs pushed back,
//     a hanging lamp that swings. P: {steam: true, cast, labels, cam}   cues: hit, labels/cast "at"
// Needs mcB__lib.js (window.MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.mcB_desk = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1, FR, rr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 271;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const DY = 0.84 * H, PX0 = 0.44 * W, PX1 = 0.92 * W, PY0 = 0.12 * H, PY1 = 0.8 * H;
      const wall = inkEl(cam, INK.inkSoft), desk = { f: inkEl(cam, INK.hat), r: inkEl(cam) };
      const lamp = { f: inkEl(cam, INK.paperLight), r: inkEl(cam), glow: inkEl(cam, INK.gold, { 'fill-opacity': 0.25 }), fl: inkEl(cam, INK.gold) };
      const pot = { f: inkEl(cam, INK.ink), r: inkEl(cam) };
      const sheet = { sh: inkEl(cam, INK.ink, { 'fill-opacity': 0.12 }), f: inkEl(cam, INK.paperLight), r: inkEl(cam) };
      const titles = (P.title || []).map((s, i) => { const tx = el(cam, 'text', { x: (PX0 + PX1) / 2, y: PY0 + 110 + i * 78, 'font-family': FR, 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink }); tx.textContent = s; return tx; });
      const nTitle = titles.length;
      const lines = inkEl(cam, INK.inkSoft);
      const nm = P.name ? (() => {
        const y = PY1 - 120, g = el(cam, 'g');
        const a = el(g, 'text', { x: 0, y, 'font-family': FR, 'font-weight': 900, 'font-size': 80, 'text-anchor': 'end', fill: INK.ink }); a.textContent = P.name.text;
        const b = el(g, 'text', { x: 0, y, 'font-family': FR, 'font-weight': 900, 'font-size': 80, 'text-anchor': 'start', fill: INK.ink }); b.textContent = P.name.rest || '';
        const fx = el(g, 'text', { x: 0, y: y - 110, 'font-family': INK_FONT, 'font-size': 92, 'text-anchor': 'middle', fill: INK.red }); fx.textContent = P.name.fix || '';
        let wa = 200, wb = 300; try { wa = a.getComputedTextLength(); wb = b.getComputedTextLength(); } catch (e) {}
        const cx = (PX0 + PX1) / 2 - (wb - wa) / 2;
        wa += 14;
        a.setAttribute('x', cx - 14); b.setAttribute('x', cx + 14); fx.setAttribute('x', cx - wa / 2);
        return { g, a, b, fx, wa, cx, y, strike: inkEl(cam, INK.red), caret: inkEl(cam, INK.red) };
      })() : null;
      const quill = { f: inkEl(cam, INK.paperLight), r: inkEl(cam), sp: inkEl(cam) };
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      const nL = P.name ? 3 : 6, lineY = k => PY0 + 110 + nTitle * 78 + 30 + k * 62;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let wd = '';
          for (let k = 0; k < 6; k++) wd += inkPath([[k * W / 5, 0], [k * W / 5 + 4, DY]], { w: 2.5, seed: sd + 1 + k, t, amp: 1 }) + ' ';
          wall.setAttribute('d', wd);
          const dp = [[-20, DY], [W + 20, DY], [W + 20, DY + 50], [-20, DY + 50]];
          desk.f.setAttribute('d', inkLoop(dp, { seed: sd + 10, t, amp: 1, smooth: false }));
          desk.r.setAttribute('d', inkPath(dp, { w: 6, seed: sd + 11, t, amp: 1.2, closed: true, smooth: false }));
          // oil lamp (left of the sheet)
          const lx = 0.36 * W, fl = Math.sin(t * 9) * 4;
          lamp.glow.setAttribute('d', inkCircle(lx, DY - 230, 120 + Math.sin(t * 3) * 6, sd + 20, t, { fill: true }));
          const lp = [[lx - 60, DY], [lx - 40, DY - 90], [lx - 30, DY - 130], [lx - 34, DY - 270], [lx + 34, DY - 270], [lx + 30, DY - 130], [lx + 40, DY - 90], [lx + 60, DY]];
          lamp.f.setAttribute('d', inkLoop(lp, { seed: sd + 21, t, amp: 1 }));
          lamp.r.setAttribute('d', inkPath(lp, { w: 5, seed: sd + 22, t, amp: 1.2, closed: true }));
          lamp.fl.setAttribute('d', inkLoop([[lx - 14, DY - 160], [lx + fl, DY - 236], [lx + 14, DY - 160]], { seed: sd + 23, t, amp: 1.5 }));
          // ink pot
          const ip = rr(PX0 - 120, DY - 70, 70, 70, 16);
          pot.f.setAttribute('d', inkLoop(ip, { seed: sd + 30, t, amp: 0.8 })); pot.r.setAttribute('d', '');
          // sheet
          const sp = spring(lt, 0, 0.6), sh = [[PX0, PY0 + (1 - sp) * 80], [PX1, PY0 + 8 + (1 - sp) * 80], [PX1 - 6, PY1], [PX0 + 4, PY1 + 6]];
          sheet.sh.setAttribute('d', inkLoop(sh.map(q => [q[0] + 12, q[1] + 14]), { seed: sd + 40, t, amp: 1, smooth: false }));
          sheet.f.setAttribute('d', inkLoop(sh, { seed: sd + 41, t, amp: 1, smooth: false }));
          sheet.r.setAttribute('d', inkPath(sh, { w: 4, seed: sd + 42, t, amp: 1.2, closed: true, smooth: false }));
          const ta = atOr(cues, P.title_at, 0.3);
          titles.forEach((tx, i) => { const p = spring(lt, ta + i * 0.25, 0.5); tx.setAttribute('opacity', clamp01(p * 2).toFixed(3));
            tx.setAttribute('transform', `translate(0 ${f1((1 - p) * 20)})`); });
          // scribble lines writing themselves
          const wr = Object.assign({ at: 0.4, dur: Math.max(2, dur - 1) }, P.write || {});
          const wa = atOr(cues, wr.at, 0.4), u = clamp01((lt - wa) / wr.dur) * nL;
          let ld = '', qx = PX0 + 80, qy = lineY(0);
          for (let k = 0; k < nL; k++) {
            const f = clamp01(u - k); if (f <= 0) break;
            const x0 = PX0 + 60, x1 = PX1 - 60 - (k % 3) * 60, xe = lerp(x0, x1, f), y = lineY(k), pts = [];
            for (let x = x0; x <= xe; x += 22) pts.push([x, y + Math.sin(x * 0.11 + k) * 8 - (Math.floor(x / 22) % 3 === 0 ? 10 : 0)]);
            if (pts.length > 1) ld += inkPath(pts, { w: 3.5, seed: sd + 50 + k, t, amp: 0.8 }) + ' ';
            qx = xe; qy = y;
          }
          lines.setAttribute('d', ld);
          // quill (tip at the end of the line being written)
          const bob = Math.sin(lt * 14) * 6, qx2 = qx, qy2 = qy + bob;
          const qp = [[qx2, qy2], [qx2 + 40, qy2 - 60], [qx2 + 150, qy2 - 250], [qx2 + 110, qy2 - 150], [qx2 + 20, qy2 - 40]];
          quill.f.setAttribute('d', inkLoop(qp, { seed: sd + 60, t, amp: 1 }));
          quill.r.setAttribute('d', inkPath(qp, { w: 4, seed: sd + 61, t, amp: 1, closed: true }) + ' ' + inkPath([[qx2, qy2], [qx2 + 140, qy2 - 230]], { w: 3, seed: sd + 62, t, amp: 1 }));
          if (nm) {
            const sa = atOr(cues, P.name.strike, null), fa = atOr(cues, P.name.fix_at, sa != null ? sa + 0.6 : null);
            const s = sa != null ? prog(lt, sa, 0.35) : 0, x0 = nm.cx - nm.wa - 14;
            nm.strike.setAttribute('d', s > 0.01 ? inkPath([[x0, nm.y - 26], [x0 + (nm.wa + 28) * s, nm.y - 34]], { w: 12, seed: sd + 70, t, amp: 1.2 }) : '');
            const fp = fa != null ? spring(lt, fa, 0.5) : 0;
            nm.fx.setAttribute('opacity', clamp01(fp * 2).toFixed(3));
            nm.fx.setAttribute('transform', `rotate(-4 ${f1(nm.cx - nm.wa / 2)} ${f1(nm.y - 110)})`);
            nm.caret.setAttribute('d', fp > 0.05 ? inkPath([[nm.cx - nm.wa / 2 - 30, nm.y - 70], [nm.cx - nm.wa / 2, nm.y - 92], [nm.cx - nm.wa / 2 + 30, nm.y - 70]], { w: 6, seed: sd + 71, t, amp: 1 }) : '');
            nm.g.setAttribute('transform', `translate(0 ${f1((1 - sp) * 80)})`);
          }
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };

  SH.mcB_table = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, rr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 659;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const TY = 0.62 * H, TX0 = 0.22 * W, TX1 = 0.78 * W, FY = 0.88 * H;
      const wall = inkEl(cam, INK.inkSoft), port = { f: inkEl(cam, INK.paperLight), r: inkEl(cam) };
      const chairs = [0, 1].map(() => ({ f: inkEl(cam, INK.hat), r: inkEl(cam) }));
      const table = { f: inkEl(cam, INK.hat), r: inkEl(cam), cloth: inkEl(cam, INK.paperLight), clothR: inkEl(cam) };
      const cups = [0.33, 0.45, 0.66].map(() => ({ f: inkEl(cam, INK.paperLight), r: inkEl(cam), tea: inkEl(cam, INK.hat), steam: inkEl(cam, INK.inkSoft) }));
      const potE = { f: inkEl(cam, INK.blue), r: inkEl(cam) };
      const plate = { f: inkEl(cam, INK.paperLight), r: inkEl(cam), bread: inkEl(cam, INK.gold), br: inkEl(cam) };
      const lamp = { r: inkEl(cam), f: inkEl(cam, INK.paperLight), fl: inkEl(cam, INK.gold) };
      const cs = cast(el(cam, 'g'), P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let wd = '';
          for (let k = 0; k < 12; k++) wd += inkPath([[-20, 0.08 * H + k * 0.07 * H], [W + 20, 0.08 * H + k * 0.07 * H + 4]], { w: 2.5, seed: sd + 1 + k, t, amp: 1 }) + ' ';
          wall.setAttribute('d', wd + inkPath([[-20, FY], [W + 20, FY]], { w: 6, seed: sd + 20, t, amp: 1.2 }));
          port.f.setAttribute('d', inkCircle(0.86 * W, 0.3 * H, 80, sd + 21, t, { fill: true }));
          port.r.setAttribute('d', inkCircle(0.86 * W, 0.3 * H, 80, sd + 22, t, { w: 12 }) + ' ' + inkPath([[0.86 * W - 70, 0.3 * H + 14 + Math.sin(t) * 10], [0.86 * W + 70, 0.3 * H + 10 - Math.sin(t) * 10]], { w: 3, seed: sd + 23, t, amp: 1 }));
          // chairs pushed back (tilted)
          [[0.14, -14], [0.86, 18]].forEach(([cx, rot], i) => {
            const x = cx * W, a = rot * Math.PI / 180, R = q => [x + q[0] * Math.cos(a) - q[1] * Math.sin(a), FY + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
            const pts = [[-60, 0], [-60, -300], [-44, -300], [-44, -150], [60, -150], [60, 0], [46, 0], [46, -130], [-44, -130], [-44, 0]].map(R);
            chairs[i].f.setAttribute('d', inkLoop(pts, { seed: sd + 30 + i, t, amp: 1, smooth: false }));
            chairs[i].r.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 32 + i, t, amp: 1, closed: true, smooth: false }));
          });
          const top = [[TX0, TY], [TX1, TY], [TX1, TY + 30], [TX0, TY + 30]];
          table.f.setAttribute('d', inkLoop(top, { seed: sd + 40, t, amp: 1, smooth: false }) + ' ' + inkLoop(rr(TX0 + 30, TY + 30, 26, FY - TY - 30, 6), { seed: sd + 41, t, amp: 1 }) + ' ' + inkLoop(rr(TX1 - 56, TY + 30, 26, FY - TY - 30, 6), { seed: sd + 42, t, amp: 1 }));
          table.r.setAttribute('d', inkPath(top, { w: 5, seed: sd + 43, t, amp: 1.2, closed: true, smooth: false }));
          const cl = [[TX0 + 20, TY - 2], [TX1 - 20, TY - 2], [TX1 - 40, TY + 80], [lerp(TX0, TX1, 0.7), TY + 66], [lerp(TX0, TX1, 0.4), TY + 84], [TX0 + 40, TY + 70]];
          table.cloth.setAttribute('d', inkLoop(cl, { seed: sd + 44, t, amp: 1 }));
          table.clothR.setAttribute('d', inkPath(cl, { w: 3.5, seed: sd + 45, t, amp: 1, closed: true }));
          // cups with steam
          [0.33, 0.45, 0.66].forEach((u, i) => {
            const x = u * W, y = TY - 4, p = spring(lt, 0.1 + i * 0.2, 0.5), c = cups[i];
            const cp = [[x - 46, y - 80 * p], [x + 46, y - 80 * p], [x + 36, y], [x - 36, y]];
            c.f.setAttribute('d', inkLoop(cp, { seed: sd + 50 + i, t, amp: 0.8, smooth: false }));
            c.r.setAttribute('d', inkPath(cp, { w: 4.5, seed: sd + 53 + i, t, amp: 0.9, closed: true, smooth: false }) + ' ' + inkPath([[x + 44, y - 64 * p], [x + 74, y - 50 * p], [x + 40, y - 26 * p]], { w: 5, seed: sd + 56 + i, t, amp: 0.8 }));
            c.tea.setAttribute('d', p > 0.5 ? inkLoop(inkEllipsePts(x, y - 78 * p, 40, 8, sd + 59 + i, 8), { seed: sd + 59 + i, t, amp: 0.6 }) : '');
            let st = '';
            if (P.steam !== false) for (let k = 0; k < 2; k++) {
              const ph = (lt * 0.6 + k * 0.5 + i * 0.3) % 1, yy = y - 100 - ph * 140, xx = x - 14 + k * 28;
              st += inkPath([[xx, yy + 60], [xx + 14 * Math.sin(lt * 2 + k), yy + 30], [xx - 10, yy], [xx + 8, yy - 30]], { w: 4 * (1 - ph) + 1, seed: sd + 60 + i * 3 + k, t, amp: 1 }) + ' ';
            }
            c.steam.setAttribute('d', st);
          });
          // teapot
          const tx = 0.56 * W, tp = [[tx - 60, TY - 4], [tx - 74, TY - 70], [tx - 40, TY - 120], [tx + 40, TY - 120], [tx + 74, TY - 70], [tx + 60, TY - 4]];
          potE.f.setAttribute('d', inkLoop(tp, { seed: sd + 70, t, amp: 1 }));
          potE.r.setAttribute('d', inkPath(tp, { w: 5, seed: sd + 71, t, amp: 1, closed: true }) + ' ' + inkPath([[tx + 70, TY - 70], [tx + 130, TY - 120], [tx + 150, TY - 130]], { w: 9, seed: sd + 72, t, amp: 1 }) + ' ' + inkPath([[tx - 70, TY - 100], [tx - 110, TY - 70], [tx - 70, TY - 40]], { w: 7, seed: sd + 73, t, amp: 1 }) + ' ' + inkCircle(tx, TY - 128, 12, sd + 74, t, { w: 5 }));
          // plate + half-eaten loaf (bite marks on the right)
          const px = 0.27 * W, py = TY - 8;
          plate.f.setAttribute('d', inkLoop(inkEllipsePts(px, py, 90, 16, sd + 80, 12), { seed: sd + 80, t, amp: 0.8 }));
          plate.r.setAttribute('d', inkPath(inkEllipsePts(px, py, 90, 16, sd + 80, 12), { w: 4, seed: sd + 81, t, amp: 0.8, closed: true }));
          const bp = [[px - 64, py - 10], [px - 60, py - 56], [px - 20, py - 76], [px + 20, py - 70], [px + 30, py - 56], [px + 14, py - 46], [px + 30, py - 32], [px + 16, py - 22], [px + 24, py - 10]];
          plate.bread.setAttribute('d', inkLoop(bp, { seed: sd + 82, t, amp: 0.8 }));
          plate.br.setAttribute('d', inkPath(bp, { w: 4, seed: sd + 83, t, amp: 0.8, closed: true }) + ' ' + inkPath([[px - 44, py - 52], [px - 24, py - 60]], { w: 3, seed: sd + 84, t, amp: 0.8 }));
          // swinging lamp
          const sw = Math.sin(t * 1.4) * 0.12, lx0 = 0.5 * W, ly0 = -10, L = 0.24 * H, lx = lx0 + Math.sin(sw) * L, ly = ly0 + Math.cos(sw) * L;
          lamp.r.setAttribute('d', inkPath([[lx0, ly0], [lx, ly]], { w: 4, seed: sd + 90, t, amp: 1 }) + ' ' + inkPath(rr(lx - 34, ly, 68, 90, 14), { w: 5, seed: sd + 91, t, amp: 1, closed: true }));
          lamp.f.setAttribute('d', inkLoop(rr(lx - 34, ly, 68, 90, 14), { seed: sd + 92, t, amp: 1 }));
          lamp.fl.setAttribute('d', inkLoop([[lx - 10, ly + 70], [lx + Math.sin(t * 9) * 3, ly + 24], [lx + 10, ly + 70]], { seed: sd + 93, t, amp: 1.2 }));
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
