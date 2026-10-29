// gal_b_hall: three period rooms of the Galileo affair (02-galileo-teleskop, B3/B4). "set": false: every room fills the
// frame (back wall, floor to the frame bottom, a cropped foreground element). Parchment ink, palette tokens only.
//   room "palace" — a Florentine palace hall: an arcade of three round arches on columns, a red Medici tapestry in the
//                   middle arch, a gold-trimmed throne, a chequered floor with a red runner, a big cropped column in
//                   front on the right; on `shade.at` the hall darkens. Cast members with `hide_until` (or `back: true`)
//                   stand behind the columns, in the shadow of the left arch.
//   room "office" — a dim stone room in Rome: barred window, a desk with papers and a candle, a red curtain cropped on
//                   the right; a wall calendar whose leaves fly off from `calendar.at` to `calendar.end`, counting
//                   `from` -> `to` (the last year in red).
//   room "trial"  — the Minerva hall: stone arches, a raised judges' bench draped in red with `judges` cardinals behind
//                   it (red cassock + biretta), candles; the cast in front; `paper.text` appears on a big sheet in the
//                   first cast member's hand on `paper.at`; `bubble` = speech balloon by his head on `bubble.at` with a
//                   red `stamp` slammed over it on `stamp_at`; dark pew ends cropped in the lower corners.
// P: {room, shade: {at}, calendar: {from, to, at, end}, judges: 7, paper: {text, at}, bubble: {text, at, stamp, stamp_at},
//     cast: [GAL.person + bow: cue (bows), unbow: cue (straightens up), rise: cue|sec (a kneeling figure stands up),
//            back: true], kasif: GAL.person, labels}
// cues: the params above + hit (punch)
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.gal_b_hall = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 601, kind = P.room || 'palace';
      const gy = 0.8 * H;
      const root = el(svg, 'g');
      const room = kind === 'palace' ? null : G.room(el(root, 'g'), sd + 1);
      // palace shell
      const PW = kind === 'palace' ? { wall: inkEl(root), recess: inkEl(root), tap: inkEl(root, INK.red), tapB: inkEl(root, INK.gold), tapL: inkEl(root, INK.ink),
        floor: inkEl(root), tile: inkEl(root), runner: inkEl(root, mix(INK.red, INK.ink, 0.2)), runL: inkEl(root, INK.gold), wallL: inkEl(root, INK.inkSoft) } : null;
      const backG = el(root, 'g');
      const colG = el(root, 'g');
      const CO = kind === 'palace' ? { f: inkEl(colG, INK.paperLight), sh: inkEl(colG, mix(INK.paperDark, INK.inkSoft, 0.2)), l: inkEl(colG, INK.ink), arch: inkEl(colG, INK.ink),
        thr: inkEl(colG, mix(INK.red, INK.ink, 0.25)), thrG: inkEl(colG, INK.gold), thrL: inkEl(colG, INK.ink) } : null;
      // office / trial furniture behind the cast
      const furn = { f: inkEl(root, mix(INK.stain, INK.ink, 0.4)), f2: inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.35)), paper: inkEl(root, INK.paperLight), red: inkEl(root, INK.red), gold: inkEl(root, INK.gold), l: inkEl(root, INK.ink), soft: inkEl(root, INK.inkSoft) };
      const cal = kind === 'office' ? { board: inkEl(root, mix(INK.stain, INK.ink, 0.35)), sheet: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink), fly: el(root, 'g') } : null;
      let calT = null, flyF = null, flyL = null, flyT = null;
      if (cal) {
        calT = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 112, 'text-anchor': 'middle', fill: INK.ink });
        flyF = inkEl(cal.fly, INK.paperLight); flyL = inkEl(cal.fly, INK.ink);
        flyT = el(cal.fly, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 112, 'text-anchor': 'middle', fill: INK.ink });
      }
      const judgeG = el(root, 'g');
      const NJ = kind === 'trial' ? (P.judges ?? 7) : 0;
      const judges = Array.from({ length: NJ }, (_, i) => {
        const u = NJ > 1 ? i / (NJ - 1) : 0.5;
        return G.person(judgeG, { who: 'kardinal' + i, robe: 'cardinal', cap: i % 3 === 1 ? 'zucchetto' : 'biretta', beard: i % 2 ? 'grey' : null, x: lerp(0.17, 0.83, u), y: 0.6, scale: 0.5,
          face: u < 0.5 ? 'right' : 'left', pose: i === (NJ >> 1) ? 'talk' : 'idle', emotion: i % 3 === 0 ? 'angry' : 'neutral' }, sd + 100 + i * 7);
      });
      const bench = kind === 'trial' ? { top: inkEl(root, mix(INK.stain, INK.ink, 0.35)), cloth: inkEl(root, INK.red), fringe: inkEl(root, INK.gold), l: inkEl(root, INK.ink), cand: inkEl(root, INK.paperLight), flame: inkEl(root, INK.gold) } : null;
      // cast: wrapper groups so we can bow / straighten / stand up
      const castG = el(root, 'g');
      const mk = (m, i, parent) => {
        const w = el(parent, 'g'), mm = Object.assign({ y: 0.86 }, m);
        const extra = { bow: mm.bow, unbow: mm.unbow, rise: mm.rise };
        delete mm.bow; delete mm.unbow; delete mm.rise;
        return { m: mm, extra, w, p: G.person(w, mm, sd + 20 + i * 9) };
      };
      const cast = (P.cast || []).map((m, i) => mk(m, i, (m.hide_until || m.back) && kind === 'palace' ? backG : castG));
      const propG = el(root, 'g');
      const sheet = P.paper ? { f: inkEl(propG, INK.paperLight), l: inkEl(propG, INK.ink), t: el(propG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 52, 'text-anchor': 'middle', fill: INK.ink }) } : null;
      if (sheet) sheet.t.textContent = P.paper.text || '';
      const bub = P.bubble ? { f: inkEl(propG, INK.paperLight), l: inkEl(propG, INK.ink), t: el(propG, 'text', { 'font-family': INK_FONT, 'font-size': 66, 'text-anchor': 'middle', fill: INK.ink }),
        sg: el(propG, 'g'), } : null;
      if (bub) {
        bub.t.textContent = P.bubble.text || '';
        bub.sf = inkEl(bub.sg, INK.red); bub.st = el(bub.sg, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 92, 'text-anchor': 'middle', fill: INK.red });
        bub.st.textContent = P.bubble.stamp || '';
      }
      const kas = P.kasif ? mk(Object.assign({ who: 'kasif' }, P.kasif), 9, castG) : null;
      const fg = { f: inkEl(root, INK.paperLight), sh: inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.25)), d: inkEl(root, mix(INK.ink, INK.stain, 0.25)), red: inkEl(root, mix(INK.red, INK.ink, 0.15)), l: inkEl(root, INK.ink) };
      const labels = (P.labels || []).map((L, i) => G.label(root, L, W, H, sd + 40 + i));
      const COLS = [0.1, 0.37, 0.63, 0.9];

      const updCast = (c, lt, t, cues) => {
        const r = c.p.update(lt, t, cues, W, H);
        if (!r) return null;
        const sc = c.m.scale ?? 0.62, fc = r.face;
        let tf = '';
        const ra = G.atOr(cues, c.extra.rise, null);
        if (ra != null && c.m.kneel != null) tf += `translate(0 ${G.f1(-110 * sc * progIO(lt, ra, 0.9))}) `;
        const ba = G.atOr(cues, c.extra.bow, null), ua = G.atOr(cues, c.extra.unbow, null);
        const bw = (ba == null ? 0 : progIO(lt, ba, 0.6)) * (ua == null ? 1 : 1 - progIO(lt, ua, 0.6));
        if (bw > 0) tf += `rotate(${G.f1(fc * 17 * bw)} ${G.f1(r.x)} ${G.f1(r.y - 184 * sc)})`;
        c.w.setAttribute('transform', tf);
        return r;
      };

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const hp = punch(lt, G.atOr(cues, 'hit', null), 0.7);
          for (const e of Object.values(furn)) e.setAttribute('d', '');
          for (const e of Object.values(fg)) e.setAttribute('d', '');
          let rw = null;
          if (kind === 'palace') {
            const sa = P.shade ? G.atOr(cues, P.shade.at, null) : null, sk = sa == null ? 0 : progIO(lt, sa, 1.3);
            const dk = c => mix(c, mix(INK.inkSoft, INK.ink, 0.3), sk * 0.55);
            PW.wall.setAttribute('fill', dk(mix(INK.paper, INK.paperDark, 0.35)));
            PW.wall.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, gy], [-40, gy]], { seed: sd + 2, t, amp: 0.4, smooth: false }));
            // arch recesses (the depth behind the arcade)
            PW.recess.setAttribute('fill', dk(mix(INK.paperDark, INK.inkSoft, 0.32)));
            let rc = '', al = '';
            for (let i = 0; i < 3; i++) {
              const xa = COLS[i] * W + 40, xb = COLS[i + 1] * W - 40, sy = 0.38 * H, rr = (xb - xa) / 2, pts = [[xa, gy], [xa, sy]];
              for (let k = 1; k < 12; k++) { const a = Math.PI + k / 12 * Math.PI; pts.push([xa + rr + Math.cos(a) * rr, sy + Math.sin(a) * rr * 0.9]); }
              pts.push([xb, sy], [xb, gy]);
              rc += inkLoop(pts, { seed: sd + 3 + i, t, amp: 0.5 }) + ' ';
              al += G.line(pts.slice(1, -1), sd + 6 + i, t, 6, 0.6, 0) + ' ';
            }
            PW.recess.setAttribute('d', rc);
            // tapestry in the middle arch
            const tx0 = 0.42 * W, tx1 = 0.58 * W, ty0 = 0.26 * H, ty1 = 0.66 * H, sw = Math.sin(t * 0.8) * 6;
            const tp = [[tx0, ty0], [tx1, ty0], [tx1 + sw, ty1], [(tx0 + tx1) / 2 + sw, ty1 + 30], [tx0 + sw, ty1]];
            PW.tap.setAttribute('fill', dk(INK.red));
            PW.tap.setAttribute('d', inkLoop(tp, { seed: sd + 10, t, amp: 0.5, smooth: false }));
            let tb = '';
            for (let k = 0; k < 6; k++) { const m = [[0.5, 0.25], [0.3, 0.42], [0.7, 0.42], [0.3, 0.58], [0.7, 0.58], [0.5, 0.74]][k]; tb += inkCircle(lerp(tx0, tx1, m[0]) + sw * m[1], lerp(ty0, ty1, m[1]), 20, sd + 11 + k, t, { fill: true }) + ' '; }
            tb += G.line([[tx0 + 14, ty0 + 14], [tx1 - 14, ty0 + 14]], sd + 18, t, 6) + ' ' + G.line([[tx0 + 14 + sw, ty1 - 14], [tx1 - 14 + sw, ty1 - 14]], sd + 19, t, 6);
            PW.tapB.setAttribute('d', tb);
            PW.tapL.setAttribute('d', G.ring(tp, sd + 20, t, 4, 0.5) + ' ' + G.line([[tx0 - 30, ty0], [tx1 + 30, ty0]], sd + 21, t, 9));
            // chequered floor + red runner
            PW.floor.setAttribute('fill', dk(mix(INK.paperDark, INK.paper, 0.3)));
            PW.floor.setAttribute('d', inkLoop([[-40, gy], [W + 40, gy], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 22, t, amp: 0.4, smooth: false }));
            PW.tile.setAttribute('fill', dk(mix(INK.inkSoft, INK.paperDark, 0.45)));
            let tl = '';
            const rows = [0, 0.16, 0.36, 0.62, 1];
            for (let r = 0; r < 4; r++) {
              const y0 = gy + (H - gy) * rows[r], y1 = gy + (H - gy) * rows[r + 1];
              for (let c = -10; c <= 10; c++) {
                if ((c + r) % 2) continue;
                const xa = k => W / 2 + c * lerp(120, 300, k), xb = k => W / 2 + (c + 1) * lerp(120, 300, k), k0 = rows[r], k1 = rows[r + 1];
                tl += inkLoop([[xa(k0), y0], [xb(k0), y0], [xb(k1), y1], [xa(k1), y1]], { seed: sd + 30 + r * 30 + c, t, amp: 0.4, smooth: false }) + ' ';
              }
            }
            PW.tile.setAttribute('d', tl);
            const run = [[W * 0.56, gy], [W * 0.66, gy], [W * 0.82, H + 40], [W * 0.5, H + 40]];
            PW.runner.setAttribute('d', inkLoop(run, { seed: sd + 90, t, amp: 0.4, smooth: false }));
            PW.runL.setAttribute('d', G.line([[W * 0.57, gy + 4], [W * 0.53, H + 40]], sd + 91, t, 5) + ' ' + G.line([[W * 0.65, gy + 4], [W * 0.79, H + 40]], sd + 92, t, 5));
            PW.wallL.setAttribute('d', G.line([[-40, gy], [W + 40, gy + 2]], sd + 93, t, 6) + ' ' + G.line([[-40, 0.08 * H], [W + 40, 0.08 * H + 3]], sd + 94, t, 4));
            // throne in the right arch
            const thx = 0.74 * W, thy = gy + 6;
            const back = [[thx - 90, thy - 120], [thx - 90, thy - 420], [thx, thy - 470], [thx + 90, thy - 420], [thx + 90, thy - 120]];
            const seat = [[thx - 120, thy - 120], [thx + 120, thy - 120], [thx + 110, thy], [thx - 110, thy]];
            CO.thr.setAttribute('fill', dk(mix(INK.red, INK.ink, 0.25)));
            CO.thr.setAttribute('d', inkLoop(back, { seed: sd + 95, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(seat, { seed: sd + 96, t, amp: 0.5, smooth: false }));
            CO.thrG.setAttribute('d', G.ring(back, sd + 97, t, 12, 0.5) + ' ' + inkCircle(thx, thy - 470, 22, sd + 98, t, { fill: true }) + ' ' + G.line([[thx - 120, thy - 120], [thx + 120, thy - 120]], sd + 99, t, 12));
            CO.thrL.setAttribute('d', G.ring(seat, sd + 100, t, 4, 0.5));
            // columns of the arcade
            let cf = '', cs = '', cl = '';
            COLS.forEach((cx0, i) => {
              const cx = cx0 * W, w = 46, top = 0.36 * H;
              const sh = [[cx - w, top + 30], [cx + w, top + 30], [cx + w, gy - 40], [cx - w, gy - 40]], cap = [[cx - w - 26, top], [cx + w + 26, top], [cx + w + 10, top + 32], [cx - w - 10, top + 32]], base = [[cx - w - 20, gy - 42], [cx + w + 20, gy - 42], [cx + w + 30, gy + 4], [cx - w - 30, gy + 4]];
              cf += [sh, cap, base].map((p, j) => inkLoop(p, { seed: sd + 110 + i * 3 + j, t, amp: 0.4, smooth: false })).join(' ') + ' ';
              cs += inkLoop([[cx + w * 0.35, top + 32], [cx + w, top + 32], [cx + w, gy - 42], [cx + w * 0.35, gy - 42]], { seed: sd + 130 + i, t, amp: 0.4, smooth: false }) + ' ';
              cl += [sh, cap, base].map((p, j) => G.ring(p, sd + 140 + i * 3 + j, t, 4, 0.4)).join(' ') + ' ';
              for (let k = -1; k <= 1; k++) cl += G.line([[cx + k * w * 0.45, top + 40], [cx + k * w * 0.45, gy - 50]], sd + 160 + i * 3 + k, t, 2) + ' ';
            });
            CO.f.setAttribute('fill', dk(INK.paperLight));
            CO.f.setAttribute('d', cf); CO.sh.setAttribute('d', cs); CO.l.setAttribute('d', cl); CO.arch.setAttribute('d', al);
            // big cropped column in front, right edge (foreground)
            const fx = W - 90;
            fg.f.setAttribute('d', inkLoop([[fx - 70, -40], [W + 60, -40], [W + 60, H + 40], [fx - 70, H + 40]], { seed: sd + 170, t, amp: 0.5, smooth: false }));
            fg.sh.setAttribute('d', inkLoop([[fx + 40, -40], [W + 60, -40], [W + 60, H + 40], [fx + 40, H + 40]], { seed: sd + 171, t, amp: 0.5, smooth: false }));
            fg.l.setAttribute('d', G.line([[fx - 70, -40], [fx - 70, H + 40]], sd + 172, t, 6) + ' ' + G.line([[fx - 20, -40], [fx - 20, H + 40]], sd + 173, t, 2.5) + ' ' + G.line([[fx + 30, -40], [fx + 30, H + 40]], sd + 174, t, 2.5) + ' ' +
              G.line([[fx - 100, H * 0.9], [W + 60, H * 0.9]], sd + 175, t, 5) + ' ' + G.line([[fx - 100, H * 0.9 + 26], [W + 60, H * 0.9 + 26]], sd + 176, t, 4));
          } else if (kind === 'office') {
            rw = room.update(t, W, H, { gy, kind: 'stone', dark: true, beams: true, floor: 'planks', window: { x: 0.07, y: 0.17, w: 0.11, h: 0.34, bars: true } });
            // desk behind Bellarmino with papers + candle
            const dx0 = 0.74 * W, dx1 = 0.92 * W, dy = 0.62 * H;
            furn.f.setAttribute('d', inkLoop([[dx0, dy], [dx1, dy], [dx1 - 10, gy + 6], [dx0 + 10, gy + 6]], { seed: sd + 200, t, amp: 0.4, smooth: false }));
            furn.paper.setAttribute('d', inkLoop([[dx0 + 30, dy - 6], [dx0 + 160, dy - 14], [dx0 + 170, dy], [dx0 + 40, dy + 4]], { seed: sd + 201, t, amp: 0.4, smooth: false }) + ' ' + inkLoop([[dx1 - 60, dy - 120], [dx1 - 40, dy - 120], [dx1 - 38, dy], [dx1 - 62, dy]], { seed: sd + 202, t, amp: 0.4, smooth: false }));
            const fk = Math.sin(t * 9) * 0.12 + Math.sin(t * 13) * 0.08;
            furn.gold.setAttribute('d', inkLoop([[dx1 - 50, dy - 120 - 62 * (1 + fk)], [dx1 - 36, dy - 140], [dx1 - 50, dy - 124], [dx1 - 64, dy - 140]], { seed: sd + 203, t, amp: 0.8 }));
            furn.l.setAttribute('d', G.ring([[dx0, dy], [dx1, dy], [dx1 - 10, gy + 6], [dx0 + 10, gy + 6]], sd + 204, t, 4.5, 0.4) + ' ' + G.line([[dx0 + 20, dy + 40], [dx1 - 20, dy + 40]], sd + 205, t, 3));
            // the wall calendar: leaves fly off, the year counts up
            const C = Object.assign({ from: 1616, to: 1632 }, P.calendar || {});
            const ca = G.atOr(cues, C.at, 0.8), ce = Math.max(ca + 0.5, G.atOr(cues, C.end, ca + 2.5));
            const u = lt < ca ? 0 : clamp01((lt - ca) / (ce - ca)), yf = lerp(C.from, C.to, u), cur = lt >= ce ? C.to : Math.floor(yf), lk = yf - Math.floor(yf);
            const cx = 0.5 * W, cy = 0.33 * H, bw = 190, bh = 210, pe = punch(lt, ce, 0.7);
            const brd = [[cx - bw, cy - bh], [cx + bw, cy - bh], [cx + bw, cy + bh], [cx - bw, cy + bh]];
            const sh = [[cx - bw + 22, cy - bh + 60], [cx + bw - 22, cy - bh + 60], [cx + bw - 22, cy + bh - 22], [cx - bw + 22, cy + bh - 22]];
            cal.board.setAttribute('d', inkLoop(brd, { seed: sd + 210, t, amp: 0.4, smooth: false }));
            cal.sheet.setAttribute('d', inkLoop(sh, { seed: sd + 211, t, amp: 0.4, smooth: false }));
            cal.l.setAttribute('d', G.ring(brd, sd + 212, t, 4.5, 0.4) + ' ' + G.ring(sh, sd + 213, t, 3.5, 0.4) + ' ' + G.line([[cx - 60, cy - bh], [cx, cy - bh - 60], [cx + 60, cy - bh]], sd + 214, t, 3) + ' ' + inkDot(cx, cy - bh - 60, 9, 9, sd + 215, t) +
              ' ' + [-0.6, -0.2, 0.2, 0.6].map((k, i) => inkCircle(cx + k * bw, cy - bh + 34, 10, sd + 216 + i, t, { w: 3 })).join(' '));
            const s2 = 1 + 0.1 * pe;
            calT.textContent = String(cur);
            calT.setAttribute('fill', lt >= ce ? INK.red : INK.ink);
            calT.setAttribute('x', G.f1(cx)); calT.setAttribute('y', G.f1(cy + 60));
            calT.setAttribute('transform', `translate(${G.f1(cx)} ${G.f1(cy + 20)}) scale(${G.f1(s2 * 100) / 100}) translate(${G.f1(-cx)} ${G.f1(-cy - 20)})`);
            // the leaf flying off
            if (lt >= ca && lt < ce && cur > C.from) {
              const fx = cx - lk * 260, fy = cy - lk * 330, rot = -lk * 50, sc = 1 - lk * 0.55;
              cal.fly.setAttribute('transform', `translate(${G.f1(fx)} ${G.f1(fy)}) rotate(${G.f1(rot)}) scale(${G.f1(sc * 100) / 100}) translate(${G.f1(-cx)} ${G.f1(-cy)})`);
              flyF.setAttribute('d', inkLoop(sh, { seed: sd + 217, t, amp: 0.4, smooth: false }));
              flyL.setAttribute('d', G.ring(sh, sd + 218, t, 3.5, 0.4));
              flyT.textContent = String(cur - 1); flyT.setAttribute('x', G.f1(cx)); flyT.setAttribute('y', G.f1(cy + 60));
              cal.fly.style.display = '';
            } else cal.fly.style.display = 'none';
            // red curtain cropped on the right edge (foreground)
            const sw = Math.sin(t * 0.7) * 8;
            fg.red.setAttribute('d', inkLoop([[W - 170, -40], [W + 60, -40], [W + 60, H + 40], [W - 120 + sw, H + 40], [W - 200 + sw, H * 0.7], [W - 150, H * 0.3]], { seed: sd + 220, t, amp: 0.6 }));
            fg.l.setAttribute('d', [0, 1, 2].map(k => G.line([[W - 130 + k * 50, -40], [W - 140 + k * 50 + sw * 0.5, H * 0.5], [W - 110 + k * 50 + sw, H + 40]], sd + 221 + k, t, 2.5)).join(' ') + ' ' +
              G.line([[W - 150, -40], [W - 150, H * 0.3], [W - 200 + sw, H * 0.7], [W - 120 + sw, H + 40]], sd + 225, t, 5));
          } else {
            rw = room.update(t, W, H, { gy, kind: 'stone', dark: false, beams: false, floor: 'tiles', floorColor: 'stone' });
            // three stone arches on the back wall + a plain cross
            let ar = '', af = '';
            for (let i = 0; i < 3; i++) {
              const xa = (0.04 + i * 0.32) * W, xb = xa + 0.28 * W, sy = 0.32 * H, rr = (xb - xa) / 2, pts = [[xa, 0.56 * H], [xa, sy]];
              for (let k = 1; k < 12; k++) { const a = Math.PI + k / 12 * Math.PI; pts.push([xa + rr + Math.cos(a) * rr, sy + Math.sin(a) * rr * 0.75]); }
              pts.push([xb, sy], [xb, 0.56 * H]);
              af += inkLoop(pts, { seed: sd + 230 + i, t, amp: 0.5 }) + ' ';
              ar += G.line(pts, sd + 233 + i, t, 7, 0.6, 0) + ' ';
              for (let k = 2; k < 11; k += 2) { const a = Math.PI + k / 12 * Math.PI; ar += G.line([[xa + rr + Math.cos(a) * rr, sy + Math.sin(a) * rr * 0.75], [xa + rr + Math.cos(a) * (rr + 46), sy + Math.sin(a) * (rr + 46) * 0.75]], sd + 236 + i * 10 + k, t, 3) + ' '; }
            }
            furn.f2.setAttribute('d', af); furn.soft.setAttribute('d', ar);
            const cxr = 0.5 * W, cyr = 0.2 * H;
            furn.f.setAttribute('d', inkLoop([[cxr - 9, cyr - 80], [cxr + 9, cyr - 80], [cxr + 9, cyr + 90], [cxr - 9, cyr + 90]], { seed: sd + 260, t, amp: 0.4, smooth: false }) + ' ' + inkLoop([[cxr - 50, cyr - 40], [cxr + 50, cyr - 40], [cxr + 50, cyr - 24], [cxr - 50, cyr - 24]], { seed: sd + 261, t, amp: 0.4, smooth: false }));
          }
          // cast behind the columns (palace), judges behind the bench (trial)
          judges.forEach(j => j.update(lt, t, cues, W, H));
          if (bench) {
            const by = 0.58 * H, bf = 0.73 * H, x0 = 0.08 * W, x1 = 0.92 * W;
            bench.top.setAttribute('d', inkLoop([[x0 + 30, by - 30], [x1 - 30, by - 30], [x1, by], [x0, by]], { seed: sd + 270, t, amp: 0.4, smooth: false }));
            const cl = [[x0, by], [x1, by]];
            for (let k = 0; k <= 16; k++) cl.push([lerp(x1, x0, k / 16), bf + (k % 2 ? 16 : 0) + Math.sin(t * 0.8 + k) * 2]);
            bench.cloth.setAttribute('d', inkLoop(cl, { seed: sd + 271, t, amp: 0.5, smooth: false }));
            let fr = G.line([[x0, by + 34], [x1, by + 34]], sd + 272, t, 10);
            for (let k = 0; k < 40; k++) { const x = lerp(x0 + 10, x1 - 10, k / 39); fr += ' ' + G.line([[x, bf - 4], [x, bf + 18]], sd + 273 + k, t, 3); }
            bench.fringe.setAttribute('d', fr);
            let bl = G.ring(cl, sd + 320, t, 4.5, 0.5);
            for (let k = 1; k < 6; k++) { const x = lerp(x0, x1, k / 6); bl += ' ' + G.line([[x, by + 40], [x + 6, bf]], sd + 321 + k, t, 2.4); }
            bench.l.setAttribute('d', bl);
            let cd = '', fl = '';
            [0.173, 0.827].forEach((u, i) => { const x = lerp(x0, x1, u), fk = Math.sin(t * 9 + i) * 0.12; cd += inkLoop([[x - 12, by - 100], [x + 12, by - 100], [x + 14, by - 28], [x - 14, by - 28]], { seed: sd + 330 + i, t, amp: 0.4, smooth: false }) + ' '; fl += inkLoop([[x, by - 100 - 50 * (1 + fk)], [x + 12, by - 118], [x, by - 102], [x - 12, by - 118]], { seed: sd + 333 + i, t, amp: 0.8 }) + ' '; });
            bench.cand.setAttribute('d', cd); bench.flame.setAttribute('d', fl);
          }
          // the cast
          const res = cast.map(c => updCast(c, lt, t, cues));
          // paper with the abjuration word, in the first figure's front hand
          if (sheet) {
            const r = res[0], pa = G.atOr(cues, P.paper.at, 0.8);
            if (r && lt >= pa && r.hands.length) {
              const k = spring(lt, pa, 0.7), fh = r.hands.slice().sort((a, b) => r.face * (b[0] - a[0]))[0];
              const lift = cast[0].w.getAttribute('transform') || '';
              const dy = /translate\(0 (-?[\d.]+)\)/.exec(lift); const oy = dy ? parseFloat(dy[1]) : 0;
              const cx = fh[0] + r.face * 170, cy = fh[1] + oy - 10, w = 140 * k, h = 96 * k, rot = r.face * -6 + Math.sin(t * 1.3) * 1.5;
              const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), R = (u, v) => [cx + u * c - v * s, cy + u * s + v * c];
              const pg = [R(-w, -h), R(w, -h), R(w, h), R(-w, h)];
              sheet.f.setAttribute('d', inkLoop(pg, { seed: sd + 340, t, amp: 0.4, smooth: false }));
              let sl = G.ring(pg, sd + 341, t, 4, 0.4);
              for (let j = 0; j < 3; j++) sl += ' ' + G.line([R(-w * 0.75, h * (0.2 + j * 0.22)), R(w * 0.75, h * (0.2 + j * 0.22))], sd + 342 + j, t, 2.4);
              sheet.l.setAttribute('d', sl);
              sheet.t.setAttribute('x', G.f1(cx)); sheet.t.setAttribute('y', G.f1(cy - h * 0.22));
              sheet.t.setAttribute('transform', `rotate(${G.f1(rot)} ${G.f1(cx)} ${G.f1(cy)}) translate(${G.f1(cx)} ${G.f1(cy)}) scale(${G.f1(Math.max(0.001, k) * 100) / 100}) translate(${G.f1(-cx)} ${G.f1(-cy)})`);
              sheet.t.style.visibility = 'visible';
            } else { sheet.f.setAttribute('d', ''); sheet.l.setAttribute('d', ''); sheet.t.style.visibility = 'hidden'; }
          }
          // speech balloon + stamp
          if (bub) {
            const r = res[0], ba = G.atOr(cues, P.bubble.at, 0.8);
            if (r && lt >= ba) {
              const k = spring(lt, ba, 0.7), lift = cast[0].w.getAttribute('transform') || '', dy = /translate\(0 (-?[\d.]+)\)/.exec(lift), oy = dy ? parseFloat(dy[1]) : 0;
              const hx = r.head[0], hy = r.head[1] + oy, cx = hx + r.face * 360, cy = hy - 170, w = 310 * k, h = 82 * k;
              const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * G.TAU; pts.push([cx + Math.cos(a) * w, cy + Math.sin(a) * h]); }
              const tail = [[cx - r.face * w * 0.55, cy + h * 0.6], [hx + r.face * 70, hy - 40], [cx - r.face * w * 0.3, cy + h * 0.85]];
              bub.f.setAttribute('d', inkLoop(pts, { seed: sd + 350, t, amp: 0.8 }) + ' ' + inkLoop(tail, { seed: sd + 351, t, amp: 0.6, smooth: false }));
              bub.l.setAttribute('d', G.ring(pts, sd + 352, t, 4.5, 0.8) + ' ' + G.line([tail[0], tail[1], tail[2]], sd + 353, t, 4.5));
              bub.t.setAttribute('x', G.f1(cx)); bub.t.setAttribute('y', G.f1(cy + 22));
              bub.t.setAttribute('transform', `translate(${G.f1(cx)} ${G.f1(cy)}) scale(${G.f1(Math.max(0.001, k) * 100) / 100}) translate(${G.f1(-cx)} ${G.f1(-cy)})`);
              bub.t.style.visibility = 'visible';
              const sa = G.atOr(cues, P.bubble.stamp_at, null);
              if (sa != null && lt >= sa && P.bubble.stamp) {
                const sk = lt - sa < 0.18 ? lerp(1.8, 1, (lt - sa) / 0.18) : 1 + 0.08 * punch(lt, sa + 0.18, 0.6);
                const sx = cx + 40, sy = cy - 6;
                bub.sg.setAttribute('transform', `translate(${G.f1(sx)} ${G.f1(sy)}) rotate(-11) scale(${G.f1(sk * 100) / 100}) translate(${G.f1(-sx)} ${G.f1(-sy)})`);
                bub.st.setAttribute('x', G.f1(sx)); bub.st.setAttribute('y', G.f1(sy + 32));
                bub.sf.setAttribute('d', G.ring([[sx - 230, sy - 66], [sx + 230, sy - 70], [sx + 232, sy + 56], [sx - 228, sy + 60]], sd + 354, t, 9, 0.8));
                bub.sg.style.display = '';
              } else bub.sg.style.display = 'none';
            } else { bub.f.setAttribute('d', ''); bub.l.setAttribute('d', ''); bub.t.style.visibility = 'hidden'; bub.sg.style.display = 'none'; }
          }
          if (kas) updCast(kas, lt, t, cues);
          // trial foreground: dark pew ends cropped in the lower corners
          if (kind === 'trial') {
            const pew = (x0, x1, top) => [[x0, top + 20], [lerp(x0, x1, 0.2), top - 30], [lerp(x0, x1, 0.8), top - 30], [x1, top + 20], [x1, H + 40], [x0, H + 40]];
            const pa = pew(-60, 230, H * 0.84), pb = pew(W - 230, W + 60, H * 0.84);
            fg.d.setAttribute('d', inkLoop(pa, { seed: sd + 360, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(pb, { seed: sd + 361, t, amp: 0.5, smooth: false }));
            fg.l.setAttribute('d', G.ring(pa, sd + 362, t, 5, 0.5) + ' ' + G.ring(pb, sd + 363, t, 5, 0.5) + ' ' + inkCircle(85, H * 0.84 + 50, 30, sd + 364, t, { w: 3.5 }) + ' ' + inkCircle(W - 85, H * 0.84 + 50, 30, sd + 365, t, { w: 3.5 }));
          }
          labels.forEach(l => l.update(lt, t, cues));
          void rw; void hp;
        },
      };
    },
  };
})();
