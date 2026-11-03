// bat_hall + bat_sea: two places for the bat echolocation long video (Stickstory 2026-11-03), parchment ink
// (BRAND.md §3, §5; palette tokens only, boils at 8 Hz, pure function of (seed, lt)). Uses bat__lib.js (BAT) and TD.label.
//
// SHOTS.bat_hall — an academy lecture hall: tall arched windows and columns on the back wall, a pinned poster on the
//   wall, a wooden lectern with the speaker behind it, two rows of audience heads + shoulders in the foreground (bottom
//   of the frame) that shake with laughter from a cue, "ha!" notes popping over them.
//   P: {floor: 0.78, lectern: {x: 0.5}, speaker: K (BAT.figure, hat false), poster: {x: 0.2, y: 0.3, title: "HEARING?",
//       strike: cue} | false, laugh: cue|false, rows: 2, labels: [TD.label], kasif: K}
//   cues: hit, laugh, poster.strike, + "at"s
//
// SHOTS.bat_sea — a 1912 harbour: sea to the horizon, a two-funnel steamship with smoke steaming across, an iceberg
//   (white tip, huge pale underwater part), a stone quay in the left foreground with a figure on it; optionally sound
//   arcs from the ship's bow to the iceberg and a blue echo coming back.
//   P: {sea: 0.66 (water line 0..1 H), ship: {x: 0.5, to: 0.56, s: 1}, berg: {x: 0.84, s: 1} | false,
//       ping: cue|false (arcs + echo from then), quay: {w: 0.3} | false, figure: K (stands on the quay),
//       labels: [TD.label], kasif: K}
//   cues: hit, ping, + "at"s
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.bat_hall = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BAT, TD = window.TD, atOr = B.atOr, f1 = B.f1, sd = seed * 1000 + 911;
      const FL = (P.floor ?? 0.78) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const wall = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), wins = inkEl(cam, INK.blue, { 'fill-opacity': 0.25 }), winR = inkEl(cam), cols = inkEl(cam, INK.paperLight), colR = inkEl(cam);
      const PO = P.poster === false ? null : Object.assign({ x: 0.2, y: 0.3, title: 'HEARING?' }, P.poster || {});
      const posF = inkEl(cam, INK.paperLight), posR = inkEl(cam), posStrike = inkEl(cam, INK.red);
      const posT = PO ? el(cam, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink }) : null;
      if (posT) posT.textContent = PO.title;
      const spk = P.speaker ? B.figure(el(cam, 'g'), Object.assign({ hat: false, x: 0.5, y: P.floor ?? 0.78, scale: 0.85, pose: 'talk', face: 'right' }, P.speaker), sd + 5) : null;
      const lecF = inkEl(cam, INK.hatBand), lecR = inkEl(cam), lecTop = inkEl(cam, INK.paperDark);
      const rows = P.rows ?? 2, heads = [];
      for (let r = 0; r < rows; r++) for (let k = 0; k < 9 - r; k++) heads.push({ r, k, f: inkEl(cam, r ? INK.inkSoft : INK.ink), sh: inkEl(cam, r ? INK.paperDark : INK.inkSoft), ring: inkEl(cam) });
      const kas = P.kasif ? B.figure(el(root, 'g'), Object.assign({ x: 0.86, y: P.floor ?? 0.78, scale: 0.8, pose: 'point', face: 'left' }, P.kasif), sd + 9) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const la = P.laugh ? atOr(cues, P.laugh, null) : null, lp = la != null && lt >= la ? prog(lt, la, 0.3) : 0;
          const hit = punch(lt, atOr(cues, 'hit', la), 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit), cx = W * 0.5, cy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          // back wall: wainscot band, arched windows, columns
          wall.setAttribute('d', inkLoop([[-20, FL - 60], [W + 20, FL - 60], [W + 20, FL + 10], [-20, FL + 10]], { seed: sd + 1, t, smooth: false }));
          let wd = '', wr = '', cd = '', cr = '';
          [0.36, 0.64, 0.92].forEach((u, i) => {
            const x = u * W, w = 150, y0 = 0.12 * H, y1 = FL - 120, arch = [];
            for (let q = 0; q <= 8; q++) { const a = Math.PI + q / 8 * Math.PI; arch.push([x + Math.cos(a) * w / 2, y0 + w / 2 + Math.sin(a) * w / 2]); }
            const pts = [[x - w / 2, y1], ...arch, [x + w / 2, y1]];
            wd += inkLoop(pts, { seed: sd + 10 + i, t, amp: 1 }) + ' ';
            wr += inkPath(pts, { w: 6, seed: sd + 14 + i, t, closed: true, amp: 1 }) + ' ' + inkPath([[x, y0 + 10], [x, y1]], { w: 4, seed: sd + 18 + i, t }) + ' ' + inkPath([[x - w / 2, (y0 + y1) / 2 + 30], [x + w / 2, (y0 + y1) / 2 + 30]], { w: 4, seed: sd + 22 + i, t });
          });
          [0.06, 0.5, 0.78].forEach((u, i) => {
            const x = u * W, pts = [[x - 34, 0.08 * H], [x + 34, 0.08 * H], [x + 34, FL - 60], [x - 34, FL - 60]];
            cd += inkLoop(pts, { seed: sd + 30 + i, t, smooth: false }) + ' ';
            cr += inkPath(pts, { w: 5, seed: sd + 34 + i, t, closed: true, smooth: false }) + ' ' + inkPath([[x - 50, 0.08 * H], [x + 50, 0.08 * H]], { w: 9, seed: sd + 38 + i, t }) + ' ' + inkPath([[x - 50, FL - 60], [x + 50, FL - 60]], { w: 9, seed: sd + 42 + i, t }) + ' ';
            for (let q = -1; q <= 1; q++) cr += inkPath([[x + q * 16, 0.1 * H], [x + q * 16, FL - 66]], { w: 2.6, seed: sd + 46 + i * 3 + q, t, amp: 0.8 }) + ' ';
          });
          wins.setAttribute('d', wd); winR.setAttribute('d', wr); cols.setAttribute('d', cd); colR.setAttribute('d', cr);
          // poster
          if (PO) {
            const px = PO.x * W, py = PO.y * H, pw = 360, ph = 230;
            const pts = [[px - pw / 2, py - ph / 2], [px + pw / 2, py - ph / 2 - 6], [px + pw / 2 + 4, py + ph / 2], [px - pw / 2 - 2, py + ph / 2 + 4]];
            posF.setAttribute('d', inkLoop(pts, { seed: sd + 50, t, smooth: false }));
            posR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 51, t, closed: true, smooth: false }) + ' ' + inkDot(px, py - ph / 2 + 6, 9, 9, sd + 52, t));
            posT.setAttribute('x', f1(px)); posT.setAttribute('y', f1(py + 22));
            const sa = PO.strike == null ? null : atOr(cues, PO.strike, null), sp = sa == null ? 0 : prog(lt, sa, 0.35);
            posStrike.setAttribute('d', sp > 0.01 ? inkPath([[px - pw / 2 + 10, py + 50], [px - pw / 2 + 10 + (pw - 20) * sp, py - 40 * sp + 50 * (1 - sp)]], { w: 14, seed: sd + 53, t, taper: 0.2 }) : '');
          }
          // speaker + lectern
          if (spk) spk.update(lt, t, cues, W, H);
          const lx = (P.lectern?.x ?? 0.5) * W + 70;
          const lec = [[lx - 90, FL - 220], [lx + 90, FL - 220], [lx + 70, FL], [lx - 70, FL]];
          lecF.setAttribute('d', inkLoop(lec, { seed: sd + 60, t, smooth: false }));
          lecR.setAttribute('d', inkPath(lec, { w: 6, seed: sd + 61, t, closed: true, smooth: false }) + ' ' + inkPath([[lx - 40, FL - 150], [lx + 40, FL - 150]], { w: 4, seed: sd + 62, t }));
          lecTop.setAttribute('d', inkLoop([[lx - 110, FL - 240], [lx + 110, FL - 250], [lx + 100, FL - 218], [lx - 100, FL - 214]], { seed: sd + 63, t, smooth: false }));
          // audience: two rows of heads + shoulders filling the bottom of the frame
          heads.forEach((h, i) => {
            const row = h.r, n = 9 - row, x = ((h.k + 0.5 + row * 0.5) / (n + row * 0.5)) * W * 1.04 - W * 0.02;
            const by = H + 40 - (row ? 150 : 0), r = row ? 52 : 66;
            const shake = lp * Math.sin(lt * 18 + i * 1.7) * 6, tilt = lp * Math.sin(lt * 9 + i) * 10;
            const hx = x + shake, hy = by - r * 2.2 - Math.abs(Math.sin(lt * 9 + i)) * 10 * lp;
            const sh = [[x - r * 1.7, H + 60], [x - r * 1.4, by - r * 0.9], [x, by - r * 1.25], [x + r * 1.4, by - r * 0.9], [x + r * 1.7, H + 60]];
            h.sh.setAttribute('d', inkLoop(sh, { seed: sd + 70 + i, t }));
            const hp = B.ell(hx, hy, r, r * 1.05, 14).map(([px, py]) => { const a = tilt * Math.PI / 180; return [hx + (px - hx) * Math.cos(a) - (py - hy) * Math.sin(a), hy + (px - hx) * Math.sin(a) + (py - hy) * Math.cos(a)]; });
            h.f.setAttribute('d', inkLoop(hp, { seed: sd + 90 + i, t }));
            h.ring.setAttribute('d', inkPath(sh.slice(1, 4), { w: 5, seed: sd + 110 + i, t, amp: 1 }) + ' ' + inkPath(hp, { w: 4, seed: sd + 130 + i, t, closed: true, amp: 1 }));
          });
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  SH.bat_sea = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BAT, TD = window.TD, atOr = B.atOr, f1 = B.f1, sd = seed * 1000 + 977;
      const SEA = (P.sea ?? 0.66) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bergU = inkEl(cam, INK.blue, { 'fill-opacity': 0.22 }), bergUR = inkEl(cam, INK.inkSoft), bergF = inkEl(cam, INK.paperLight), bergR = inkEl(cam), bergH = inkEl(cam, INK.blue, { 'fill-opacity': 0.35 });
      const smoke = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.75 }), hullF = inkEl(cam, INK.ink), hullStripe = inkEl(cam, INK.red), supF = inkEl(cam, INK.paperLight), supR = inkEl(cam), funF = inkEl(cam, INK.gold), funR = inkEl(cam), masts = inkEl(cam), portE = inkEl(cam, INK.paperLight);
      const waves = inkEl(cam, INK.blue), ping = B.arcs(cam, sd + 30), echo = B.arcs(cam, sd + 31);
      const quayF = inkEl(cam, INK.paperDark), quayR = inkEl(cam), stones = inkEl(cam, INK.inkSoft);
      const fig = P.figure ? B.figure(el(cam, 'g'), Object.assign({ hat: false, x: 0.14, scale: 0.9, pose: 'idle', face: 'right' }, P.figure), sd + 5) : null;
      const kas = P.kasif ? B.figure(el(root, 'g'), Object.assign({ x: 0.1, scale: 0.8, pose: 'point', face: 'right' }, P.kasif), sd + 9) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const pa = P.ping ? atOr(cues, P.ping, null) : null;
          const hit = punch(lt, atOr(cues, 'hit', pa), 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit), cx = W * 0.5, cy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          // iceberg: tip above, big ghost below
          let bx = 0, by = 0;
          if (P.berg !== false) {
            const G = Object.assign({ x: 0.84, s: 1 }, P.berg || {}), s = G.s, x = G.x * W;
            const tip = [[x - 190 * s, SEA], [x - 120 * s, SEA - 120 * s], [x - 60 * s, SEA - 110 * s], [x - 10 * s, SEA - 230 * s], [x + 50 * s, SEA - 150 * s], [x + 110 * s, SEA - 170 * s], [x + 200 * s, SEA]];
            const under = [[x - 190 * s, SEA], [x - 300 * s, SEA + 120 * s], [x - 220 * s, SEA + 300 * s], [x + 40 * s, SEA + 360 * s], [x + 280 * s, SEA + 260 * s], [x + 300 * s, SEA + 90 * s], [x + 200 * s, SEA]];
            bergU.setAttribute('d', inkLoop(under, { seed: sd + 1, t }));
            bergUR.setAttribute('d', inkPath(under, { w: 3, seed: sd + 2, t, closed: true }));
            bergF.setAttribute('d', inkLoop(tip, { seed: sd + 3, t, smooth: false }));
            bergR.setAttribute('d', inkPath(tip, { w: 6, seed: sd + 4, t, closed: true, smooth: false }));
            bergH.setAttribute('d', inkLoop([[x - 10 * s, SEA - 230 * s], [x + 50 * s, SEA - 150 * s], [x + 110 * s, SEA - 170 * s], [x + 200 * s, SEA], [x + 40 * s, SEA]], { seed: sd + 5, t, smooth: false }));
            bx = x - 190 * s; by = SEA - 80 * s;
          }
          // steamship (side view, facing right)
          const S = Object.assign({ x: 0.5, to: 0.56, s: 1 }, P.ship || {}), s = S.s;
          const x = lerp(S.x, S.to, lin(lt, 0, Math.max(1, dur))) * W, y = SEA + 18 + Math.sin(lt * 1.4) * 4;
          const hull = [[x - 330 * s, y - 70 * s], [x + 330 * s, y - 80 * s], [x + 300 * s, y + 10 * s], [x - 300 * s, y + 10 * s]];
          hullF.setAttribute('d', inkLoop(hull, { seed: sd + 10, t, smooth: false }));
          hullStripe.setAttribute('d', inkLoop([[x - 304 * s, y - 6 * s], [x + 304 * s, y - 6 * s], [x + 300 * s, y + 10 * s], [x - 300 * s, y + 10 * s]], { seed: sd + 11, t, smooth: false }));
          const sup = [[x - 230 * s, y - 70 * s], [x + 200 * s, y - 72 * s], [x + 190 * s, y - 130 * s], [x - 220 * s, y - 128 * s]];
          supF.setAttribute('d', inkLoop(sup, { seed: sd + 12, t, smooth: false }));
          supR.setAttribute('d', inkPath(sup, { w: 5, seed: sd + 13, t, closed: true, smooth: false }));
          let pd = ''; for (let k = 0; k < 9; k++) pd += inkDot(x - 190 * s + k * 44 * s, y - 40 * s, 7 * s, 7 * s, sd + 20 + k, t) + ' ';
          portE.setAttribute('d', pd);
          let fd = '', fr = '', sm = '';
          [-60, 70].forEach((u, i) => {
            const fx = x + u * s, f = [[fx - 34 * s, y - 128 * s], [fx + 34 * s, y - 128 * s], [fx + 40 * s, y - 270 * s], [fx - 28 * s, y - 270 * s]];
            fd += inkLoop(f, { seed: sd + 30 + i, t, smooth: false }) + ' ';
            fr += inkPath(f, { w: 5, seed: sd + 32 + i, t, closed: true, smooth: false }) + ' ' + inkPath([[fx - 30 * s, y - 240 * s], [fx + 37 * s, y - 240 * s]], { w: 14 * s, seed: sd + 34 + i, t }) + ' ';
            for (let k = 0; k < 4; k++) {
              const u2 = ((lt * 0.35 + k / 4 + i * 0.13) % 1), r = (24 + u2 * 60) * s;
              sm += inkDot(fx + 6 * s - u2 * 260 * s, y - 290 * s - u2 * 120 * s, r, r * 0.8, sd + 40 + i * 4 + k, t) + ' ';
            }
          });
          funF.setAttribute('d', fd); funR.setAttribute('d', fr); smoke.setAttribute('d', sm);
          masts.setAttribute('d', inkPath([[x - 250 * s, y - 128 * s], [x - 250 * s, y - 330 * s]], { w: 5, seed: sd + 50, t }) + ' ' + inkPath([[x + 250 * s, y - 130 * s], [x + 250 * s, y - 330 * s]], { w: 5, seed: sd + 51, t }) + ' ' +
            inkPath([[x - 250 * s, y - 320 * s], [x + 250 * s, y - 320 * s]], { w: 2.4, seed: sd + 52, t, amp: 1 }));
          // waves
          let wv = ''; for (let k = 0; k < 14; k++) { const wx = ((k * 157 + lt * 30) % (W + 200)) - 100, wy = SEA + 40 + (k % 4) * 70; wv += inkPath([[wx, wy], [wx + 30, wy - 10], [wx + 60, wy]], { w: 4, seed: sd + 60 + k, t, amp: 0.8 }) + ' '; }
          waves.setAttribute('d', wv);
          // ping + echo
          if (pa != null && P.berg !== false) {
            const bow = [x + 330 * s, y - 60 * s], p = lt >= pa ? prog(lt, pa, 0.4) : 0, back = lt >= pa + 0.8 ? prog(lt, pa + 0.8, 0.4) : 0;
            const dist = Math.max(80, bx - bow[0]);
            ping.update(t, { x: bow[0], y: bow[1], dir: 0, p, n: 3, range: dist, spread: 24, w: 8, period: 1.0 });
            echo.update(t + 0.4, { x: bx, y: by, dir: 180, p: back, n: 3, range: dist * 0.9, spread: 20, w: 7, period: 1.0, color: INK.blue });
          } else { ping.update(t, { p: 0 }); echo.update(t, { p: 0 }); }
          // quay
          if (P.quay !== false) {
            const qw = (P.quay?.w ?? 0.3) * W, qy = (P.figure?.y ?? 0.84) * H;
            const q = [[-20, qy], [qw, qy], [qw + 40, H + 20], [-20, H + 20]];
            quayF.setAttribute('d', inkLoop(q, { seed: sd + 80, t, smooth: false }));
            quayR.setAttribute('d', inkPath(q, { w: 6, seed: sd + 81, t, closed: true, smooth: false }));
            let st = ''; for (let k = 0; k < 6; k++) st += inkPath([[k * qw / 6 + 10, qy + 40 + (k % 2) * 50], [k * qw / 6 + 80, qy + 40 + (k % 2) * 50]], { w: 3.4, seed: sd + 82 + k, t }) + ' ';
            stones.setAttribute('d', st);
          }
          if (fig) fig.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
