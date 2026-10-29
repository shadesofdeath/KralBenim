// gal_b_book: books of 1610 / 1632 in their own room (02-galileo-teleskop, B3/B4). "set": false: a plastered room
// (GAL.room) with a heavy table whose front runs to the frame bottom (GAL.table, foreground).
//   "sidereus" — a printing shop: a wooden hand press (left) whose platen comes down and up from `press.at`, printed
//                sheets drying on a line; on `book.at` a thin book stands up on the table showing its title page
//                (`book.title`, two lines + `book.sub`), then opens on a Moon plate; on `medici.at` the Medici arms
//                (gold shield, red balls, one blue) spring up above it, four gold stars rise from the page and circle the
//                arms, and `medici.label` is written above.
//   "dialogue" — a study: a big open book on a reading stand, `book.title` / `book.sub` as the page headings; on each
//                page a little stick figure, one holding an Earth-centred circle, the other a Sun-centred one; from
//                `debate.at` they argue in turns; a balance stands over the book, wavering, and on `scale.at` it tips
//                to the Sun side (the Earth pan flies up).
// P: {mode, press: {at, period: 1.6}, book: {at, title, sub, open: 1.4 (s after at)}, medici: {at, label},
//     debate: {at}, scale: {at}, kasif, cast, labels}
// cues: the params above + hit (punch)
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const star5 = (cx, cy, r, rot = 0) => { const p = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; p.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } return p; };
  SH.gal_b_book = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 581, mode = P.mode || 'sidereus', SID = mode === 'sidereus';
      const TY = 0.86 * H, TOP = TY - 44;
      const root = el(svg, 'g');
      const room = G.room(el(root, 'g'), sd + 1);
      const wallG = el(root, 'g');
      const lineL = inkEl(wallG, INK.ink), sheetF = inkEl(wallG, INK.paperLight), sheetL = inkEl(wallG, INK.inkSoft);
      const shelfBooks = inkEl(wallG, mix(INK.red, INK.stain, 0.4)), shelfBooks2 = inkEl(wallG, mix(INK.blue, INK.ink, 0.35));
      // press
      const pr = SID ? { wood: inkEl(root, mix(INK.stain, INK.ink, 0.42)), woodHi: inkEl(root, mix(INK.stain, INK.paperDark, 0.2)), screw: inkEl(root, INK.gold), paper: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink) } : null;
      const table = G.table(el(root, 'g'), sd + 2);
      const bk = { back: inkEl(root, mix(INK.red, INK.ink, 0.35)), pages: inkEl(root, INK.paperLight), pageL: inkEl(root, INK.inkSoft), cover: inkEl(root, INK.paperLight), coverL: inkEl(root, INK.ink), deco: inkEl(root, INK.red),
        moonF: inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.2)), moonL: inkEl(root, INK.ink), stand: inkEl(root, mix(INK.stain, INK.ink, 0.4)), standL: inkEl(root, INK.ink) };
      const T1 = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink });
      const T2 = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink });
      const T3 = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 800, 'text-anchor': 'middle', fill: INK.red });
      const BKP = Object.assign({ title: SID ? 'SIDEREUS NUNCIUS' : 'DİYALOG', sub: SID ? '1610' : '1632' }, P.book || {});
      const tw = BKP.title.split(' ');
      T1.textContent = SID ? tw[0] : BKP.title; T2.textContent = SID ? tw.slice(1).join(' ') : ''; T3.textContent = BKP.sub || '';
      // medici arms + stars
      const md = SID ? { shield: inkEl(root, INK.gold), balls: inkEl(root, INK.red), blue: inkEl(root, INK.blue), lily: inkEl(root, INK.gold), l: inkEl(root, INK.ink), stars: inkEl(root, INK.gold), starL: inkEl(root, INK.ink), trail: inkEl(root, INK.gold, { 'fill-opacity': 0.5 }) } : null;
      const ML = SID && P.medici && P.medici.label ? G.label(root, { text: P.medici.label, x: 0.66, y: 0.11, at: P.medici.at, size: 68, font: 'serif', color: 'red', underline: true }, W, H, sd + 3) : null;
      // dialogue: balance + two page figures + their circles
      const bal = SID ? null : { post: inkEl(root, mix(INK.stain, INK.ink, 0.3)), beam: inkEl(root, INK.gold), l: inkEl(root, INK.ink), pans: inkEl(root, INK.gold), earth: inkEl(root, INK.blue), sun: inkEl(root, INK.gold) };
      const figG = el(root, 'g');
      const cues2 = {};
      const F1 = SID ? null : G.person(figG, { who: 'simplicio', robe: 'scholar', x: 0.38, y: 0.78, scale: 0.26, face: 'right', pose: 'idle', seq: [{ at: '_d0', pose: 'talk' }, { at: '_d1', pose: 'idle' }, { at: '_d2', pose: 'talk' }, { at: '_s', pose: 'shock', emotion: 'surprised' }] }, sd + 10);
      const F2 = SID ? null : G.person(figG, { who: 'salviati', robe: 'scholar', x: 0.62, y: 0.78, scale: 0.26, face: 'left', pose: 'idle', seq: [{ at: '_d1', pose: 'talk' }, { at: '_d2', pose: 'idle' }, { at: '_s', pose: 'point', dir: 'up', emotion: 'happy' }] }, sd + 20);
      const circ = SID ? null : { l: inkEl(root, INK.ink), earth: inkEl(root, INK.blue), sun: inkEl(root, INK.gold) };
      const candle = { f: inkEl(root, INK.paperLight), fl: inkEl(root, INK.gold), l: inkEl(root, INK.ink) };
      const inkpot = { f: inkEl(root, INK.ink), q: inkEl(root, INK.paperLight), l: inkEl(root, INK.ink) };
      const kas = P.kasif ? G.person(el(root, 'g'), Object.assign({ who: 'kasif' }, P.kasif), sd + 30) : null;
      const labels = (P.labels || []).map((L, i) => G.label(root, L, W, H, sd + 40 + i));
      const MI = Array.from({ length: 6 }, (_, i) => [[-0.2, -0.05], [0.25, -0.2], [0.1, 0.25], [-0.3, 0.3], [0.32, 0.15], [-0.05, -0.32]][i]);

      const setText = (T, x, y, size, k, rot = 0) => { T.setAttribute('x', G.f1(x)); T.setAttribute('y', G.f1(y)); T.setAttribute('font-size', size); T.setAttribute('transform', `translate(${G.f1(x)} ${G.f1(y)}) rotate(${rot}) scale(${G.f1(Math.max(0.001, k) * 100) / 100}) translate(${G.f1(-x)} ${G.f1(-y)})`); T.style.visibility = k > 0.02 ? 'visible' : 'hidden'; };

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const hp = punch(lt, G.atOr(cues, 'hit', null), 0.7);
          room.update(t, W, H, { gy: 0.8 * H, kind: SID ? 'wood' : 'plaster', window: SID ? { x: 0.82, y: 0.14, w: 0.12, h: 0.38, view: 'roofs' } : { x: 0.78, y: 0.12, w: 0.14, h: 0.42, view: 'roofs' },
            shelves: SID ? [] : [{ x: 0.04, y: 0.3, w: 0.24 }, { x: 0.04, y: 0.5, w: 0.24 }] });
          // wall: drying line with sheets (press shop) / book rows (study)
          let ll = '', sf = '', sl = '', b1 = '', b2 = '';
          if (SID) {
            const x0 = 0.04 * W, x1 = 0.62 * W, y0 = 0.2 * H;
            ll = G.line([[x0, y0], [lerp(x0, x1, 0.5), y0 + 26], [x1, y0 - 4]], sd + 50, t, 3);
            for (let i = 0; i < 5; i++) {
              const u = 0.14 + i * 0.18, cx = lerp(x0, x1, u), cy = y0 + 26 * Math.sin(u * Math.PI) - 2, sw = Math.sin(t * 1.1 + i * 1.3) * 5 * Math.PI / 180;
              const R = (dx, dy) => [cx + dx * Math.cos(sw) - dy * Math.sin(sw), cy + dx * Math.sin(sw) + dy * Math.cos(sw)];
              const pg = [R(-62, 0), R(62, 0), R(60, 170), R(-60, 172)];
              sf += inkLoop(pg, { seed: sd + 60 + i, t, amp: 0.4, smooth: false }) + ' ';
              sl += G.ring(pg, sd + 70 + i, t, 3, 0.4) + ' ' + inkCircle(...R(0, 66), 34, sd + 80 + i, t, { w: 3 }) + ' ';
              for (let k = 0; k < 3; k++) sl += G.line([R(-44, 116 + k * 16), R(44, 116 + k * 16)], sd + 90 + i * 3 + k, t, 2) + ' ';
              ll += ' ' + G.line([R(-40, -8), R(-40, 10)], sd + 110 + i, t, 4) + ' ' + G.line([R(40, -8), R(40, 10)], sd + 120 + i, t, 4);
            }
          } else {
            for (const sy of [0.3, 0.5]) for (let i = 0; i < 10; i++) { const x = 0.05 * W + i * 42, h = 74 + (i * 37 % 34), p = [[x, sy * H], [x + 34, sy * H], [x + 34, sy * H - h], [x, sy * H - h]]; if (i % 3) b1 += inkLoop(p, { seed: sd + 130 + i + sy * 100, t, amp: 0.4, smooth: false }) + ' '; else b2 += inkLoop(p, { seed: sd + 130 + i + sy * 100, t, amp: 0.4, smooth: false }) + ' '; }
          }
          lineL.setAttribute('d', ll); sheetF.setAttribute('d', sf); sheetL.setAttribute('d', sl); shelfBooks.setAttribute('d', b1); shelfBooks2.setAttribute('d', b2);
          // the hand press
          if (pr) {
            const PS = Object.assign({ at: 'press', period: 1.6 }, P.press || {}), pa = G.atOr(cues, PS.at, 0.3);
            const cx = 0.2 * W, gy = 0.8 * H, xl = cx - 190, xr = cx + 190, topY = 0.2 * H, bedY = 0.6 * H;
            const ph = lt < pa ? 0 : ((lt - pa) / PS.period) % 1, down = lt < pa ? 0 : Math.pow(Math.sin(ph * Math.PI), 2);
            const plY = lerp(bedY - 150, bedY - 34, down);
            const R = (a, b, c, d) => [[a, b], [c, b], [c, d], [a, d]];
            const posts = [R(xl - 34, topY, xl + 14, gy + 10), R(xr - 14, topY, xr + 34, gy + 10)];
            const beams = [R(xl - 60, topY - 40, xr + 60, topY + 10), R(xl, topY + 110, xr, topY + 150), R(xl - 70, bedY, xr + 120, bedY + 46)];
            const platen = R(cx - 130, plY - 34, cx + 130, plY);
            pr.wood.setAttribute('d', posts.concat(beams).map((p, i) => inkLoop(p, { seed: sd + 140 + i, t, amp: 0.5, smooth: false })).join(' ') + ' ' + inkLoop(platen, { seed: sd + 150, t, amp: 0.5, smooth: false }));
            pr.woodHi.setAttribute('d', inkLoop(R(xl - 60, topY - 40, xr + 60, topY - 26), { seed: sd + 151, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(R(xl - 70, bedY, xr + 120, bedY + 12), { seed: sd + 152, t, amp: 0.4, smooth: false }));
            // the screw and the bar (the bar swings as the platen goes down)
            let sw = ''; for (let k = 0; k < 6; k++) { const y = lerp(topY + 150, plY - 40, k / 6); sw += G.line([[cx - 22, y], [cx + 22, y + 10]], sd + 160 + k, t, 4) + ' '; }
            const ba = -0.5 + down * 1.4, by = topY + 200 + down * 30;
            pr.screw.setAttribute('d', inkLoop(R(cx - 16, topY + 150, cx + 16, plY - 34), { seed: sd + 170, t, amp: 0.4, smooth: false }) + ' ' + G.line([[cx, by], [cx + Math.cos(ba) * 260, by + Math.sin(ba) * 90]], sd + 171, t, 12));
            const sheet = R(cx - 110, bedY - 10, cx + 110, bedY);
            pr.paper.setAttribute('d', inkLoop(sheet, { seed: sd + 172, t, amp: 0.4, smooth: false }));
            pr.l.setAttribute('d', posts.concat(beams, [platen, sheet]).map((p, i) => G.ring(p, sd + 180 + i, t, 4.5, 0.5)).join(' ') + ' ' + sw + ' ' + inkDot(cx + Math.cos(ba) * 260, by + Math.sin(ba) * 90, 18, 18, sd + 190, t));
          }
          table.update(t, { x0: (SID ? 0.4 : 0.06) * W, x1: (SID ? 1.04 : 0.96) * W, y: TY, depth: 84, H });
          // candle + inkpot on the table
          const cX = SID ? 0.93 * W : 0.86 * W, fk = Math.sin(t * 9) * 0.12 + Math.sin(t * 14) * 0.08;
          candle.f.setAttribute('d', inkLoop([[cX - 18, TOP - 150], [cX + 18, TOP - 150], [cX + 20, TOP], [cX - 20, TOP]], { seed: sd + 200, t, amp: 0.4, smooth: false }));
          candle.fl.setAttribute('d', inkLoop([[cX, TOP - 150 - 72 * (1 + fk)], [cX + 17, TOP - 172], [cX, TOP - 152], [cX - 17, TOP - 172]], { seed: sd + 201, t, amp: 0.8 }));
          candle.l.setAttribute('d', G.ring([[cX - 18, TOP - 150], [cX + 18, TOP - 150], [cX + 20, TOP], [cX - 20, TOP]], sd + 202, t, 4, 0.4));
          const ix = SID ? 0.47 * W : 0.14 * W;
          inkpot.f.setAttribute('d', inkLoop(inkEllipsePts(ix, TOP - 34, 44, 38, sd + 203, 10), { seed: sd + 203, t, amp: 0.5 }));
          inkpot.q.setAttribute('d', inkLoop([[ix + 6, TOP - 66], [ix + 70, TOP - 250 + Math.sin(t * 1.5) * 6], [ix + 52, TOP - 236], [ix + 14, TOP - 64]], { seed: sd + 204, t, amp: 0.5 }));
          inkpot.l.setAttribute('d', G.ring(inkEllipsePts(ix, TOP - 34, 44, 38, sd + 205, 10), sd + 206, t, 4, 0.5) + ' ' + G.line([[ix + 10, TOP - 70], [ix + 66, TOP - 244]], sd + 207, t, 3));
          for (const e of Object.values(bk)) e.setAttribute('d', '');
          if (SID) {
            // the thin book standing on the table: title page, then it opens on a Moon plate
            const ba = G.atOr(cues, BKP.at, 0.5), k = spring(lt, ba, 0.8), oa = ba + (BKP.open ?? 1.4), ok = progIO(lt, oa, 0.9);
            const bx = 0.66 * W, bw = 280 * k, bh = 380 * k, x0 = bx - bw / 2, y1 = TOP - 6, y0 = y1 - bh;
            if (lt >= ba) {
              // stand
              bk.stand.setAttribute('d', inkLoop([[bx - 170, y1 - 6], [bx + 170, y1 - 6], [bx + 190, y1 + 12], [bx - 190, y1 + 12]], { seed: sd + 210, t, amp: 0.4, smooth: false }));
              // right page (under the cover) with a Moon plate
              const page = [[x0, y0], [x0 + bw, y0 + 6], [x0 + bw, y1], [x0, y1]];
              bk.pages.setAttribute('d', inkLoop(page, { seed: sd + 211, t, amp: 0.4, smooth: false }) + (ok > 0 ? ' ' + inkLoop([[x0, y0], [x0 - bw * ok, y0 + 6], [x0 - bw * ok, y1], [x0, y1]], { seed: sd + 212, t, amp: 0.4, smooth: false }) : ''));
              let pl = G.ring(page, sd + 213, t, 4, 0.4);
              if (ok > 0) {
                const mx = x0 + bw / 2, my = y0 + bh * 0.42, mr = bw * 0.34;
                bk.moonF.setAttribute('d', inkLoop(inkEllipsePts(mx, my, mr, mr, sd + 214, 16), { seed: sd + 214, t, amp: 0.4 }) + ' ' + inkLoop([[mx - mr * 0.1, my - mr], [mx - mr, my], [mx - mr * 0.1, my + mr], [mx - mr * 0.3, my]], { seed: sd + 215, t, amp: 0.4 }));
                let mlines = G.ring(inkEllipsePts(mx, my, mr, mr, sd + 216, 16), sd + 217, t, 3.5, 0.4);
                [[0.3, -0.3, 0.16], [0.2, 0.35, 0.2], [0.45, 0.05, 0.1]].forEach((c, i) => { mlines += ' ' + inkCircle(mx + c[0] * mr, my + c[1] * mr, c[2] * mr, sd + 218 + i, t, { w: 2.5 }); });
                for (let j = 0; j < 4; j++) mlines += ' ' + G.line([[x0 + bw * 0.15, y1 - 80 + j * 16], [x0 + bw * 0.85, y1 - 80 + j * 16]], sd + 222 + j, t, 2);
                bk.moonL.setAttribute('d', mlines);
                pl += ' ' + G.ring([[x0, y0], [x0 - bw * ok, y0 + 6], [x0 - bw * ok, y1], [x0, y1]], sd + 226, t, 4, 0.4);
                for (let j = 0; j < 9; j++) pl += ' ' + G.line([[x0 - bw * ok * 0.85, y0 + 50 + j * 30], [x0 - bw * ok * 0.15, y0 + 50 + j * 30]], sd + 227 + j, t, 2);
              }
              bk.pageL.setAttribute('d', pl);
              // the cover swings open about the spine (x-scale 1 -> -1)
              const cs = 1 - 2 * ok;
              if (cs > -0.98 && ok < 0.5) {
                const cv = [[x0, y0], [x0 + bw * cs, y0 + 6], [x0 + bw * cs, y1], [x0, y1]];
                bk.cover.setAttribute('d', inkLoop(cv, { seed: sd + 240, t, amp: 0.4, smooth: false }));
                bk.coverL.setAttribute('d', G.ring(cv, sd + 241, t, 5, 0.4) + ' ' + G.ring([[x0 + 16 * cs, y0 + 18], [x0 + (bw - 16) * cs, y0 + 22], [x0 + (bw - 16) * cs, y1 - 16], [x0 + 16 * cs, y1 - 16]], sd + 242, t, 2.5, 0.4));
                bk.deco.setAttribute('d', G.line([[x0 + bw * 0.25 * cs, y0 + bh * 0.62], [x0 + bw * 0.75 * cs, y0 + bh * 0.62]], sd + 243, t, 5) + ' ' + inkLoop(star5(x0 + bw * 0.5 * cs, y0 + bh * 0.78, 24 * k), { seed: sd + 244, t, amp: 0.3, smooth: false }));
              }
              const tk = ok < 0.5 ? k * Math.max(0, cs) : 0;
              setText(T1, x0 + bw / 2 * cs, y0 + bh * 0.26, 46, tk); setText(T2, x0 + bw / 2 * cs, y0 + bh * 0.4, 46, tk); setText(T3, x0 + bw / 2 * cs, y0 + bh * 0.56, 52, tk);
            } else { setText(T1, 0, 0, 46, 0); setText(T2, 0, 0, 46, 0); setText(T3, 0, 0, 46, 0); }
            // Medici arms above the book, four stars circling them
            const ma = P.medici ? G.atOr(cues, P.medici.at, null) : null;
            for (const e of Object.values(md)) e.setAttribute('d', '');
            if (ma != null && lt >= ma) {
              const mk = spring(lt, ma, 0.8) * (1 + 0.05 * hp), ax = 0.66 * W, ay = 0.34 * H, sw = 120 * mk, sh = 150 * mk;
              const shield = [[ax - sw, ay - sh], [ax + sw, ay - sh], [ax + sw, ay + sh * 0.2], [ax + sw * 0.6, ay + sh * 0.75], [ax, ay + sh], [ax - sw * 0.6, ay + sh * 0.75], [ax - sw, ay + sh * 0.2]];
              md.shield.setAttribute('d', inkLoop(shield, { seed: sd + 250, t, amp: 0.5 }));
              let bl = '';
              MI.forEach((m, i) => { if (i === 5) return; bl += inkCircle(ax + m[0] * sw * 1.6, ay + m[1] * sh * 1.4 + sh * 0.12, 22 * mk, sd + 251 + i, t, { fill: true }) + ' '; });
              md.balls.setAttribute('d', bl);
              md.blue.setAttribute('d', inkCircle(ax, ay - sh * 0.62, 30 * mk, sd + 257, t, { fill: true }));
              md.lily.setAttribute('d', inkLoop(star5(ax, ay - sh * 0.62, 16 * mk), { seed: sd + 258, t, amp: 0.3, smooth: false }));
              md.l.setAttribute('d', G.ring(shield, sd + 259, t, 5, 0.5));
              let st = '', sl2 = '', tr = '';
              for (let i = 0; i < 4; i++) {
                const s0 = ma + 0.25 + i * 0.22, u = progIO(lt, s0, 1.0); if (lt < s0) continue;
                const a = i * Math.PI / 2 + (lt - ma) * 0.9, ox = ax + Math.cos(a) * 250, oy = ay + Math.sin(a) * 120;
                const fx = 0.66 * W + (i - 1.5) * 50, fy = TOP - 220;
                const x = lerp(fx, ox, u), y = lerp(fy, oy, u) - Math.sin(u * Math.PI) * 60, r = 26 * (1 + 0.15 * Math.sin(t * 4 + i));
                const sp = star5(x, y, r, t * 0.8 + i);
                st += inkLoop(sp, { seed: sd + 260 + i, t, amp: 0.3, smooth: false }) + ' '; sl2 += G.ring(sp, sd + 270 + i, t, 2.5, 0.3) + ' ';
                if (u < 1) tr += G.line([[lerp(fx, x, 0.6), lerp(fy, y, 0.6) + 20], [x, y]], sd + 280 + i, t, 4, 0.4, 0.8) + ' ';
              }
              md.stars.setAttribute('d', st); md.starL.setAttribute('d', sl2); md.trail.setAttribute('d', tr);
            }
            if (ML) ML.update(lt, t, cues);
          } else {
            // the open Dialogue on its reading stand
            const cx = 0.5 * W, y1 = TOP - 10, pw = 400, ph = 330, y0 = y1 - ph;
            const ba = G.atOr(cues, BKP.at, 0), k = spring(lt, ba, 0.8);
            const curl = u => Math.sin(u * Math.PI) * 18;
            const left = [], right = [];
            for (let j = 0; j <= 8; j++) { const u = j / 8; left.push([cx - pw * u, y0 + 14 - curl(u) + u * 6]); right.push([cx + pw * u, y0 + 14 - curl(u) + u * 6]); }
            const L = left.concat([[cx - pw, y1], [cx, y1 + 12]]), Rr = right.concat([[cx + pw, y1], [cx, y1 + 12]]);
            bk.stand.setAttribute('d', inkLoop([[cx - 300, y1 + 6], [cx + 300, y1 + 6], [cx + 340, y1 + 30], [cx - 340, y1 + 30]], { seed: sd + 300, t, amp: 0.4, smooth: false }));
            bk.back.setAttribute('d', inkLoop([[cx - pw - 18, y0 + 30], [cx + pw + 18, y0 + 30], [cx + pw + 18, y1 + 18], [cx, y1 + 28], [cx - pw - 18, y1 + 18]], { seed: sd + 301, t, amp: 0.4, smooth: false }));
            bk.pages.setAttribute('d', inkLoop(L, { seed: sd + 302, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(Rr, { seed: sd + 303, t, amp: 0.4, smooth: false }));
            let pl = G.ring(L, sd + 304, t, 4, 0.4) + ' ' + G.ring(Rr, sd + 305, t, 4, 0.4) + ' ' + G.line([[cx, y0 + 14], [cx, y1 + 12]], sd + 306, t, 4);
            for (let j = 0; j < 3; j++) { pl += ' ' + G.line([[cx - pw * 0.88, y1 - 40 - j * 18], [cx - pw * 0.12, y1 - 40 - j * 18]], sd + 307 + j, t, 2) + ' ' + G.line([[cx + pw * 0.12, y1 - 40 - j * 18], [cx + pw * 0.88, y1 - 40 - j * 18]], sd + 310 + j, t, 2); }
            bk.pageL.setAttribute('d', pl);
            setText(T1, cx - pw / 2, y0 + 82, 54, k); setText(T3, cx + pw / 2, y0 + 82, 54, k); setText(T2, 0, 0, 10, 0);
            T3.setAttribute('fill', INK.ink);
            // the debate
            const da = G.atOr(cues, (P.debate || {}).at, 0.4), sa = G.atOr(cues, (P.scale || {}).at, null);
            Object.assign(cues2, cues, { _d0: da, _d1: da + 1.1, _d2: da + 2.2, _s: sa ?? 1e9 });
            const r1 = F1.update(lt, t, cues2, W, H), r2 = F2.update(lt, t, cues2, W, H);
            // their circles: held up beside each head
            let cl = '', ce = '', cs = '';
            [[r1, 'geo', -1], [r2, 'helio', 1]].forEach(([r, kind, sgn], i) => {
              if (!r) return;
              const hx = r.head[0] - sgn * 120, hy = r.head[1] + 10 + Math.sin(t * 2 + i) * 4, cr = 54;
              cl += inkCircle(hx, hy, cr, sd + 320 + i, t, { w: 3.5 }) + ' ' + G.line([r.hands[0] || [hx, hy + cr], [hx, hy + cr]], sd + 322 + i, t, 3) + ' ';
              const a = lt * 1.4 + i;
              const c = [hx, hy], o = [hx + Math.cos(a) * cr, hy + Math.sin(a) * cr];
              if (kind === 'geo') { ce += inkCircle(c[0], c[1], 14, sd + 324, t, { fill: true }) + ' '; cs += inkCircle(o[0], o[1], 11, sd + 325, t, { fill: true }) + ' '; }
              else { cs += inkCircle(c[0], c[1], 17, sd + 326, t, { fill: true }) + ' '; ce += inkCircle(o[0], o[1], 9, sd + 327, t, { fill: true }) + ' '; }
            });
            circ.l.setAttribute('d', cl); circ.earth.setAttribute('d', ce); circ.sun.setAttribute('d', cs);
            // the balance over the book
            const px = cx, py = 0.27 * H, tilt = sa != null && lt >= sa ? lerp(Math.sin(sa * 2.2) * 3, 17, spring(lt, sa, 0.9)) : Math.sin(lt * 2.2) * 3;
            const a = tilt * Math.PI / 180, bl = 250, e1 = [px - Math.cos(a) * bl, py - Math.sin(a) * bl], e2 = [px + Math.cos(a) * bl, py + Math.sin(a) * bl];
            bal.post.setAttribute('d', inkLoop([[px - 12, py], [px + 12, py], [px + 14, y0 + 20], [px - 14, y0 + 20]], { seed: sd + 330, t, amp: 0.4, smooth: false }));
            bal.beam.setAttribute('d', G.line([e1, e2], sd + 331, t, 12, 0.5, 0.1));
            const fly = sa != null && lt >= sa ? Math.sin(clamp01((lt - sa) / 0.7) * Math.PI) * 60 : 0;
            const pan = (e, s) => { const y = e[1] + 100; return [[e[0] - 74, y], [e[0] + 74, y], [e[0] + 48, y + 26], [e[0] - 48, y + 26]]; };
            const p1 = pan(e1), p2 = pan(e2);
            bal.pans.setAttribute('d', inkLoop(p1, { seed: sd + 332, t, amp: 0.4 }) + ' ' + inkLoop(p2, { seed: sd + 333, t, amp: 0.4 }));
            bal.l.setAttribute('d', G.ring(p1, sd + 334, t, 3.5, 0.4) + ' ' + G.ring(p2, sd + 335, t, 3.5, 0.4) + ' ' +
              [[e1, p1], [e2, p2]].map(([e, p], i) => G.line([e, p[0]], sd + 336 + i, t, 2.5) + ' ' + G.line([e, p[1]], sd + 338 + i, t, 2.5)).join(' ') + ' ' + inkDot(px, py, 16, 16, sd + 340, t) + ' ' + G.line([[px, py - 40], [px, py]], sd + 341, t, 6));
            bal.earth.setAttribute('d', inkCircle(e1[0], e1[1] + 76 - fly, 22, sd + 342, t, { fill: true }));
            bal.sun.setAttribute('d', inkCircle(e2[0], e2[1] + 72, 28 * (1 + 0.1 * hp), sd + 343, t, { fill: true }));
          }
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
