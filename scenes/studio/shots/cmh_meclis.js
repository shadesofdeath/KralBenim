// cmh_meclis: the small hall of the first Grand National Assembly in Ankara, 1923 (02-cumhuriyetin-ilani-1923), seen
// from the back of the room: wood-panelled walls, tall arched windows (day or night), hanging lamps, the speaker's
// desk on a dais with a red flag behind it, the rostrum, an optional ministers' bench with empty chairs, a wall clock,
// a side door (can be padlocked), and rows of deputies (kalpak, fez, turban) seen from behind who can rise and cheer.
// Use "set": false (the shot paints its own room).
// P: {night: false, rows: 3 (deputy rows), crowd: 1 (density), rise: cue (deputies stand), cheer: cue (arms + hats up),
//     argue: cue (deputies turn and point at each other), clock: {from: "18:00", to: "20:30", at: cue, dur} | false,
//     speaker: {cast entry at the rostrum} | null, chair: {cast entry at the dais} | null, cast: [cast entries],
//     bench: {n: 6, x0: 0.62, x1: 0.95, cards: [{text, at, strike: cue, color}]} (ministers' bench, empty chairs),
//     ballot: {at: cue, count: {to: 158, at: cue, dur: 2.5, of: 158}} (ballot urn + tally),
//     lock: {at: cue, open: cue} (padlock on the side door; opens on `open`, light spills out),
//     paper: cue (the speaker lifts a paper), labels: [MCB label entries]}
// cues: whatever the params reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.cmh_meclis = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CMH, { atOr, f1 } = C;
      const night = !!P.night;
      const root = el(svg, 'g');
      const wallG = el(root, 'g'), chairG = el(root, 'g'), daisG = el(root, 'g'), backCast = el(root, 'g'), frontG = el(root, 'g'), rowsG = el(root, 'g'), castG = el(root, 'g'), labG = el(root, 'g');
      // ---- static-ish room layers (redrawn each frame for the boil, cheap paths)
      const wallF = inkEl(wallG, INK.paperDark, { 'fill-opacity': night ? 0.75 : 0.45 });
      const panelF = inkEl(wallG, INK.stain, { 'fill-opacity': 0.45 });
      const winF = inkEl(wallG, night ? INK.inkSoft : INK.paperLight, { 'fill-opacity': night ? 0.85 : 0.9 });
      const winStars = inkEl(wallG, INK.paperLight);
      const wallL = inkEl(wallG, INK.ink), wallS = inkEl(wallG, INK.inkSoft);
      const flagF = inkEl(wallG, INK.red), flagM = inkEl(wallG, INK.paperLight), flagCut = inkEl(wallG, INK.red), flagL = inkEl(wallG, INK.ink);
      const doorF = inkEl(wallG, INK.stain, { 'fill-opacity': 0.8 }), doorL = inkEl(wallG, INK.ink), doorLight = inkEl(wallG, INK.gold, { 'fill-opacity': 0.3 });
      const lockF = inkEl(wallG, INK.gold), lockL = inkEl(wallG, INK.ink);
      const lamps = [0.3, 0.7].map((u, k) => ({ u, L: C.lamp(wallG, { seed: seed + 60 + k, glow: night ? 0.16 : 0.06, lit: true }) }));
      const clk = P.clock === false ? null : C.clock(wallG, Object.assign({ seed: seed + 70 }, P.clock || { time: night ? '20:30' : '10:00' }));
      const daisF = inkEl(daisG, INK.stain, { 'fill-opacity': 0.9 }), daisL = inkEl(daisG, INK.ink);
      const rostF = inkEl(frontG, INK.stain), rostL = inkEl(frontG, INK.ink);
      const benchF = inkEl(frontG, INK.stain, { 'fill-opacity': 0.85 }), benchL = inkEl(frontG, INK.ink);
      const urnF = inkEl(frontG, INK.paperLight), urnL = inkEl(frontG, INK.ink), slips = inkEl(frontG, INK.paperLight), slipsL = inkEl(frontG, INK.ink);
      const tallyBox = P.ballot && P.ballot.count ? { f: inkEl(frontG, INK.paperLight), l: inkEl(frontG, INK.ink) } : null;
      const tally = P.ballot && P.ballot.count ? el(frontG, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red }) : null;
      const floorL = inkEl(rowsG, INK.inkSoft);
      // ---- people
      const speaker = P.speaker ? C.cast(backCast, [Object.assign({ x: 0.5, y: 0.7, scale: 0.5, pose: 'talk', face: 'right' }, P.speaker)], W, H, seed * 3 + 11) : null;
      const chair = P.chair ? C.cast(chairG, [Object.assign({ x: 0.42, y: 0.55, scale: 0.46, pose: 'idle', face: 'right' }, P.chair)], W, H, seed * 3 + 17) : null;
      const paperF = P.paper ? inkEl(backCast, INK.paperLight) : null, paperL = P.paper ? inkEl(backCast, INK.ink) : null;
      const HATS = ['kalpak', 'fes', 'kalpak', 'sarik', 'fes', 'kalpak', 'fes'];
      const rows = [];
      const nRows = P.rows ?? 3, dens = P.crowd ?? 1;
      for (let r = 0; r < nRows; r++) {
        const k = nRows === 1 ? 1 : r / (nRows - 1);          // 0 = far row, 1 = nearest
        const s = lerp(0.62, 1.3, k), y = lerp(H * 0.74, H * 0.98, k);
        const n = Math.round(lerp(13, 7, k) * dens);
        const g = el(rowsG, 'g');
        const desk = inkEl(g, INK.stain), deskL = inkEl(g, INK.ink);
        const people = [];
        for (let i = 0; i < n; i++) {
          const q = rng(inkHash(seed + r * 31, i + 1));
          const x = W * ((i + 0.5 + (r % 2) * 0.5 + (q() - 0.5) * 0.3) / n) - (r % 2 ? W * 0.5 / n : 0);
          people.push({ x, b: C.bust(g, { hat: HATS[(i * 3 + r * 2 + Math.floor(q() * 3)) % HATS.length], seed: seed * 7 + r * 100 + i * 3 + 1 }), d: q() * 0.5 });
        }
        rows.push({ k, s, y, g, desk, deskL, people });
      }
      // nearest rows are drawn last
      const cast = P.cast ? C.cast(castG, P.cast, W, H, seed * 5 + 3) : null;
      const labels = P.labels ? C.labels(labG, P.labels, W, H, seed * 9) : null;
      const bench = P.bench || null;
      const benchCards = bench && bench.cards ? C.labels(labG, bench.cards.map((c, i) => {
        const n = bench.cards.length, x0 = bench.x0 ?? 0.6, x1 = bench.x1 ?? 0.94;
        return Object.assign({ x: n === 1 ? (x0 + x1) / 2 : lerp(x0 + 0.04, x1 - 0.04, i / (n - 1)), y: 0.46, size: 66, stamp: false, color: 'ink' }, c);
      }), W, H, seed * 11) : null;

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          // ---- walls
          const top = 0, base = H * 0.66;
          wallF.setAttribute('d', inkLoop([[-40, top - 40], [W + 40, top - 40], [W + 40, base], [-40, base]], { seed: seed + 1, t, amp: 1, smooth: false }));
          panelF.setAttribute('d', inkLoop([[-40, H * 0.47], [W + 40, H * 0.47], [W + 40, base], [-40, base]], { seed: seed + 2, t, amp: 1, smooth: false }));
          let wl = inkPath([[-40, H * 0.47], [W + 40, H * 0.47]], { w: 6, seed: seed + 3, t }) + inkPath([[-40, base], [W + 40, base]], { w: 7, seed: seed + 4, t });
          let ws = '';
          for (let k = 0; k < 16; k++) { const x = k * W / 15; ws += inkPath([[x, H * 0.49], [x, base - 6]], { w: 3, seed: seed + 10 + k, t, amp: 1 }); }
          // windows: tall arches, avoid the kicker corner (x > 560)
          const wins = [0.36, 0.64, 0.86].map(u => u * W);
          let wf = '', st = '';
          wins.forEach((x, k) => {
            const w = 150, y0 = H * 0.13, y1 = H * 0.44;
            const pts = [[x - w / 2, y1], [x - w / 2, y0 + w / 2]];
            for (let a = 1; a < 8; a++) { const an = Math.PI + a / 8 * Math.PI; pts.push([x + Math.cos(an) * w / 2, y0 + w / 2 + Math.sin(an) * w / 2]); }
            pts.push([x + w / 2, y0 + w / 2], [x + w / 2, y1]);
            wf += inkLoop(pts, { seed: seed + 30 + k, t, amp: 0.8, smooth: false }) + ' ';
            wl += inkPath(pts, { w: 7, seed: seed + 40 + k, t, closed: true, smooth: false });
            wl += inkPath([[x, y0], [x, y1]], { w: 4, seed: seed + 50 + k, t }) + inkPath([[x - w / 2, (y0 + y1) / 2 + 20], [x + w / 2, (y0 + y1) / 2 + 20]], { w: 4, seed: seed + 55 + k, t });
            if (night) for (let s = 0; s < 3; s++) { const q = rng(seed + 90 + k * 5 + s); st += inkDot(x - 50 + q() * 100, y0 + 60 + q() * 150, 4, 4, seed + 95 + k * 5 + s, t); }
            else for (let s = 0; s < 3; s++) ws += inkPath([[x - 50 + s * 30, y1 - 20], [x - 20 + s * 30, y1 - 70]], { w: 2.5, seed: seed + 120 + k * 3 + s, t });
          });
          winF.setAttribute('d', wf); winStars.setAttribute('d', st);
          // flag behind the dais
          const fx = W * 0.5, fy = H * 0.12, fw = 250, fh = 165, wv = Math.sin(t * 1.4) * 6;
          const fp = [[fx - fw / 2, fy], [fx, fy + wv * 0.5], [fx + fw / 2, fy], [fx + fw / 2, fy + fh], [fx, fy + fh + wv * 0.5], [fx - fw / 2, fy + fh]];
          flagF.setAttribute('d', inkLoop(fp, { seed: seed + 60, t, amp: 0.8 }));
          const mc = [fx - 28, fy + fh / 2], cres = inkEllipsePts(mc[0], mc[1], 44, 44, seed + 61, 14), inner = inkEllipsePts(mc[0] + 14, mc[1], 36, 36, seed + 62, 14);
          flagM.setAttribute('d', inkLoop(cres, { seed: seed + 61, t, amp: 0.5 }) + ' ' + C.star(fx + 44, mc[1], 26, seed + 63, 0));
          flagL.setAttribute('d', inkPath(fp, { w: 5, seed: seed + 64, t, closed: true }));
          flagCut.setAttribute('d', inkLoop(inner, { seed: seed + 62, t, amp: 0.5 }));
          // door on the left wall (x 120..330, below the kicker zone)
          const dx0 = W * 0.075, dx1 = W * 0.2, dy0 = H * 0.26, dy1 = base;
          const lk = P.lock ? atOr(cues, P.lock.open, null) : null, open = lk != null ? prog(lt, lk, 0.8) : 0;
          const door = [[dx0, dy1], [dx0, dy0 + 60], [(dx0 + dx1) / 2, dy0], [dx1, dy0 + 60], [dx1, dy1]];
          doorF.setAttribute('d', inkLoop(door, { seed: seed + 70, t, amp: 0.8, smooth: false }));
          let dl = inkPath(door, { w: 7, seed: seed + 71, t, smooth: false }) + inkPath([[(dx0 + dx1) / 2, dy0 + 6], [(dx0 + dx1) / 2 - open * 60, dy1]], { w: 5, seed: seed + 72, t });
          doorLight.setAttribute('d', open > 0.01 ? inkLoop([[(dx0 + dx1) / 2 - open * 60, dy1], [(dx0 + dx1) / 2, dy0 + 10], [(dx0 + dx1) / 2 + open * 70, dy0 + 40], [dx1 + open * 260, H * 0.95], [dx0 + 40, H * 0.95]], { seed: seed + 73, t, amp: 2 }) : '');
          doorL.setAttribute('d', dl);
          if (P.lock) {
            const la = atOr(cues, P.lock.at, 0), p = spring(lt, la, 0.5), drop = (1 - clamp01(p)) * -260;
            const cx = (dx0 + dx1) / 2, cy = (dy0 + dy1) / 2 + 40 + drop + open * 240, ang = open * 50;
            if (lt >= la) {
              const body = [[cx - 46, cy], [cx + 46, cy], [cx + 46, cy + 80], [cx - 46, cy + 80]];
              lockF.setAttribute('d', inkLoop(body, { seed: seed + 74, t, amp: 0.8, smooth: false }));
              const sh = [[cx - 30, cy], [cx - 30, cy - 40], [cx, cy - 64], [cx + 30, cy - 40], [cx + 30, cy - open * 30]].map(q => {
                const a = -ang * Math.PI / 180, ox = cx - 30, oy = cy; return [ox + (q[0] - ox) * Math.cos(a) - (q[1] - oy) * Math.sin(a), oy + (q[0] - ox) * Math.sin(a) + (q[1] - oy) * Math.cos(a)];
              });
              lockL.setAttribute('d', inkPath(body, { w: 6, seed: seed + 75, t, closed: true, smooth: false }) + inkPath(sh, { w: 11, seed: seed + 76, t }) + inkDot(cx, cy + 36, 9, 13, seed + 77, t));
            } else { lockF.setAttribute('d', ''); lockL.setAttribute('d', ''); }
          }
          wallL.setAttribute('d', wl); wallS.setAttribute('d', ws);
          lamps.forEach(({ u, L }) => L.update(t, { x: u * W, top: -20, len: 210, s: 1.1, swing: 0.03 }));
          if (clk) clk.update(t, lt, cues, { x: W * 0.75, y: H * 0.2, r: 62, dur });
          // dais + speaker's desk
          const dy = H * 0.5;
          const dais = [[W * 0.3, dy + 70], [W * 0.33, dy], [W * 0.67, dy], [W * 0.7, dy + 70]];
          const desk = [[W * 0.4, dy - 10], [W * 0.6, dy - 10], [W * 0.6, dy + 60], [W * 0.4, dy + 60]];
          daisF.setAttribute('d', inkLoop(dais, { seed: seed + 80, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(desk, { seed: seed + 81, t, amp: 0.8, smooth: false }));
          daisL.setAttribute('d', inkPath(dais, { w: 6, seed: seed + 82, t, closed: true, smooth: false }) + inkPath(desk, { w: 6, seed: seed + 83, t, closed: true, smooth: false }));
          // rostrum in front of the dais
          const rx = W * 0.5, ry = H * 0.66;
          const rost = [[rx - 95, ry + 40], [rx - 80, ry - 110], [rx + 80, ry - 110], [rx + 95, ry + 40]];
          rostF.setAttribute('d', inkLoop(rost, { seed: seed + 84, t, amp: 0.8, smooth: false }));
          rostL.setAttribute('d', inkPath(rost, { w: 6, seed: seed + 85, t, closed: true, smooth: false }) + inkPath([[rx - 100, ry - 110], [rx + 100, ry - 110]], { w: 9, seed: seed + 86, t }));
          // ministers' bench (empty chairs)
          if (bench) {
            const n = bench.n ?? 6, x0 = (bench.x0 ?? 0.6) * W, x1 = (bench.x1 ?? 0.94) * W, by = H * 0.68;
            let bf = '', bl = '';
            const tb = [[x0 - 30, by - 40], [x1 + 30, by - 40], [x1 + 30, by], [x0 - 30, by]];
            for (let i = 0; i < n; i++) {
              const x = lerp(x0, x1, n === 1 ? 0.5 : i / (n - 1)), cy = by - 40;
              const back = [[x - 34, cy], [x - 34, cy - 120], [x - 24, cy - 134], [x + 24, cy - 134], [x + 34, cy - 120], [x + 34, cy]];
              bf += inkLoop(back, { seed: seed + 200 + i, t, amp: 0.8 }) + ' ';
              bl += inkPath(back, { w: 5, seed: seed + 220 + i, t, closed: true }) + inkPath([[x - 20, cy - 100], [x + 20, cy - 100]], { w: 3, seed: seed + 240 + i, t });
            }
            bf += inkLoop(tb, { seed: seed + 260, t, amp: 0.8, smooth: false });
            bl += inkPath(tb, { w: 6, seed: seed + 261, t, closed: true, smooth: false });
            benchF.setAttribute('d', bf); benchL.setAttribute('d', bl);
          }
          // ballot urn + tally
          if (P.ballot) {
            const ba = atOr(cues, P.ballot.at, 0), p = spring(lt, ba, 0.6);
            const ux = (P.ballot.x ?? 0.68) * W, uy = H * 0.66, s = clamp01(p);
            if (lt >= ba) {
              const urn = [[ux - 80 * s, uy], [ux - 70 * s, uy - 150 * s], [ux + 70 * s, uy - 150 * s], [ux + 80 * s, uy]];
              urnF.setAttribute('d', inkLoop(urn, { seed: seed + 300, t, amp: 0.8, smooth: false }));
              urnL.setAttribute('d', inkPath(urn, { w: 6, seed: seed + 301, t, closed: true, smooth: false }) + inkPath([[ux - 30 * s, uy - 150 * s], [ux + 30 * s, uy - 150 * s]], { w: 10, seed: seed + 302, t }));
              let sd2 = '', sl = '';
              for (let k = 0; k < 4; k++) {
                const ph = ((lt - ba) * 0.9 + k * 0.25) % 1, x = ux + (k - 1.5) * 40 * (1 - ph), y = uy - 150 * s - 140 * (1 - ph);
                const sp = [[x - 22, y - 14], [x + 22, y - 14], [x + 22, y + 14], [x - 22, y + 14]];
                sd2 += inkLoop(sp, { seed: seed + 310 + k, t, amp: 0.6, smooth: false }) + ' ';
                sl += inkPath(sp, { w: 3, seed: seed + 320 + k, t, closed: true, smooth: false });
              }
              slips.setAttribute('d', sd2); slipsL.setAttribute('d', sl);
            } else { urnF.setAttribute('d', ''); urnL.setAttribute('d', ''); slips.setAttribute('d', ''); slipsL.setAttribute('d', ''); }
            if (tally) {
              const c = P.ballot.count, ca = atOr(cues, c.at, ba), u = prog(lt, ca, c.dur ?? 2.5);
              if (lt >= ca) {
                const n = Math.round((c.to ?? 158) * u), pk = punch(lt, ca + (c.dur ?? 2.5), 0.6);
                tally.textContent = c.of ? `${n} / ${c.of}` : String(n);
                const tx = (c.x ?? 0.84) * W, ty = (c.y ?? 0.36) * H, sc2 = 1 + 0.12 * pk;
                tally.setAttribute('transform', `translate(${f1(tx)} ${f1(ty)}) scale(${sc2.toFixed(3)})`);
                tally.style.display = '';
                const bw = (c.of ? 210 : 120) * sc2, bh = 90 * sc2, bp = [[tx - bw, ty - bh], [tx + bw, ty - bh], [tx + bw, ty + bh], [tx - bw, ty + bh]];
                tallyBox.f.setAttribute('d', inkLoop(bp, { seed: seed + 340, t, amp: 1, smooth: false }));
                tallyBox.l.setAttribute('d', inkPath(bp, { w: 6, seed: seed + 341, t, closed: true, smooth: false }));
              } else { tally.style.display = 'none'; tallyBox.f.setAttribute('d', ''); tallyBox.l.setAttribute('d', ''); }
            }
          }
          // speaker, chair, paper
          if (chair) chair.update(lt, t, cues);
          if (speaker) speaker.update(lt, t, cues);
          if (paperF) {
            const pa = atOr(cues, P.paper, 0), p = prog(lt, pa, 0.5);
            const px = W * 0.5 + 130, py = H * 0.56 - p * 50;
            const sh = [[px - 50, py - 64], [px + 50, py - 60], [px + 46, py + 64], [px - 52, py + 60]];
            paperF.setAttribute('d', lt >= pa ? inkLoop(sh, { seed: seed + 330, t, amp: 0.8, smooth: false }) : '');
            let pl = '';
            if (lt >= pa) { pl = inkPath(sh, { w: 4, seed: seed + 331, t, closed: true, smooth: false }); for (let k = 0; k < 4; k++) pl += inkPath([[px - 34, py - 34 + k * 24], [px + 32, py - 34 + k * 24]], { w: 2.5, seed: seed + 332 + k, t }); }
            paperL.setAttribute('d', pl);
          }
          // floor lines between rows
          let fl = '';
          for (let k = 0; k < 6; k++) { const y = lerp(H * 0.67, H * 1.0, k / 5); fl += inkPath([[-40, y], [W + 40, y + 4]], { w: 3, seed: seed + 400 + k, t }); }
          floorL.setAttribute('d', fl);
          // deputies
          const rA = atOr(cues, P.rise, null), cA = atOr(cues, P.cheer, null), gA = atOr(cues, P.argue, null);
          rows.forEach(({ k, s, y, desk, deskL, people }, r) => {
            const dk = [[-40, y - 30 * s], [W + 40, y - 30 * s], [W + 40, y + 40 * s], [-40, y + 40 * s]];
            people.forEach(({ x, b, d }, i) => {
              const rise = rA != null ? prog(lt, rA + d * 0.6, 0.5) : 0;
              const cheer = cA != null ? prog(lt, cA + d * 0.5, 0.35) : 0;
              const argue = gA != null ? prog(lt, gA + d * 0.6, 0.4) * ((i + r) % 3 === 0 ? 1 : 0) : 0;
              b.update(t, { x, y: y - 40 * s, s, rise: Math.max(rise, cheer), cheer, back: true, argue, argueDir: (i % 2 ? -1 : 1), turn: argue ? (i % 2 ? -1 : 1) : Math.sin(t * 0.6 + i + r) * 0.4 });
            });
            desk.setAttribute('d', inkLoop(dk, { seed: seed + 500 + r, t, amp: 1, smooth: false }));
            deskL.setAttribute('d', inkPath([[-40, y - 30 * s], [W + 40, y - 30 * s]], { w: 6, seed: seed + 510 + r, t }) + inkPath([[-40, y + 40 * s], [W + 40, y + 40 * s]], { w: 4, seed: seed + 520 + r, t }));
            // desks are drawn in front of the busts of their own row
            desk.parentNode.appendChild(desk); deskL.parentNode.appendChild(deskL);
          });
          if (cast) cast.update(lt, t, cues);
          if (labels) labels.update(lt, t, cues);
          if (benchCards) benchCards.update(lt, t, cues);
        },
      };
    },
  };
})();
