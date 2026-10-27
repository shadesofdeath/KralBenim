// cmh_telgraf: the news of 29 October 1923 travelling by telegraph (02-cumhuriyetin-ilani-1923).
//   "office" — a telegraph office at night: a clerk at the desk taps the brass key, the sounder clicks, a paper tape
//              with dots and dashes runs off the desk, the wire leaves through the window carrying sparks.
//   "map"    — an old map of Anatolia and Thrace (1923 borders, hand drawn): from Ankara telegraph lines with little
//              poles run to the cities one by one; a spark travels along each line and a salute flash bursts on arrival.
// Use "set": false. P: {mode: "office"|"map", at: cue (tapping / lines start), tape: {text, at} (word printed on the
//   tape), cities: [{name, lon, lat, at, label: true}], cast: [CMH cast entries], labels: [MCB label entries]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  // rough 1923 outline (lon, lat): Anatolia + Thrace, without Hatay
  const ANA = [[26.1, 40.0], [26.7, 40.4], [27.6, 40.35], [28.9, 40.4], [29.4, 40.75], [29.1, 41.2], [30.3, 41.2], [31.4, 41.3], [32.3, 41.75], [33.3, 42.0],
    [34.9, 42.05], [35.2, 41.7], [36.1, 41.65], [36.6, 41.3], [37.6, 41.1], [38.4, 40.95], [39.5, 41.05], [40.3, 40.95], [41.5, 41.5], [42.6, 41.55],
    [43.4, 41.1], [43.6, 40.3], [44.6, 39.8], [44.4, 39.2], [44.1, 38.4], [44.6, 37.4], [44.2, 37.2], [42.4, 37.15], [41.2, 37.1], [40.0, 36.8], [38.6, 36.75],
    [37.2, 36.7], [36.6, 36.85], [36.15, 36.65], [35.6, 36.6], [34.7, 36.8], [34.0, 36.3], [32.9, 36.05], [32.0, 36.5], [31.0, 36.85], [30.6, 36.6], [30.4, 36.2],
    [29.6, 36.2], [28.6, 36.75], [27.6, 36.7], [27.3, 37.3], [27.2, 37.9], [26.4, 38.25], [26.8, 38.75], [26.9, 39.1], [26.15, 39.45], [26.1, 40.0]];
  const THR = [[26.0, 40.6], [26.6, 40.6], [27.5, 40.95], [28.6, 41.05], [29.05, 41.1], [28.1, 41.6], [27.9, 41.95], [27.2, 42.05], [26.6, 41.9], [26.3, 41.7], [26.6, 41.3], [26.0, 40.6]];
  const MAR = [[27.5, 40.55], [28.2, 40.45], [29.0, 40.6], [28.8, 40.85], [28.0, 40.95], [27.4, 40.8]];
  SH.cmh_telgraf = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const C = window.CMH, { atOr, f1 } = C;
      const mode = P.mode || 'office';
      const root = el(svg, 'g');
      const backG = el(root, 'g'), castG = el(root, 'g'), frontG = el(root, 'g'), labG = el(root, 'g');
      const cast = P.cast ? C.cast(castG, P.cast, W, H, seed * 3 + 9) : null;
      const labels = P.labels ? C.labels(labG, P.labels, W, H, seed * 9) : null;
      if (mode === 'map') {
        const lon0 = 25.4, lon1 = 45.2, lat0 = 35.6, lat1 = 42.4;
        const sx = 1560 / (lon1 - lon0), sy = sx * 1.27;
        const ox = (W - (lon1 - lon0) * sx) / 2, oy = 190 + (lat1 - lat0) * sy;
        const M = (lon, lat) => [ox + (lon - lon0) * sx, oy - (lat - lat0) * sy];
        const sheet = inkEl(backG, INK.paperLight, { 'fill-opacity': 0.5 });
        const sea = inkEl(backG, INK.blue, { 'fill-opacity': 0.12 });
        const land = inkEl(backG, INK.paperLight), marF = inkEl(backG, INK.blue, { 'fill-opacity': 0.25 }), coast = inkEl(backG, INK.ink);
        const lines = inkEl(backG, INK.ink), poles = inkEl(backG, INK.ink), sparks = inkEl(frontG, INK.gold), bursts = inkEl(frontG, INK.red), dots = inkEl(frontG, INK.red), dotsL = inkEl(frontG, INK.ink);
        const cities = (P.cities || []).map(c => {
          const tx = c.label === false ? null : el(labG, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': c.size || 58, 'text-anchor': 'middle', fill: INK.ink });
          if (tx) tx.textContent = c.name;
          return { c, tx };
        });
        const ank = el(labG, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: INK.red });
        ank.textContent = P.center_name || 'Ankara';
        const A = M(32.86, 39.93);
        return {
          update(lt, dur, cues, env) {
            const t = env.t;
            const sb = [[ox - 40, 165], [W - ox + 40, 165], [W - ox + 40, oy + 40], [ox - 40, oy + 40]];
            sheet.setAttribute('d', inkLoop(sb, { seed: seed + 1, t, amp: 1, smooth: false }));
            sea.setAttribute('d', inkLoop(sb, { seed: seed + 2, t, amp: 1, smooth: false }));
            const ap = ANA.map(p => M(...p)), tp = THR.map(p => M(...p)), mp = MAR.map(p => M(...p));
            land.setAttribute('d', inkLoop(ap, { seed: seed + 3, t, amp: 1.2 }) + ' ' + inkLoop(tp, { seed: seed + 4, t, amp: 1.2 }));
            marF.setAttribute('d', inkLoop(mp, { seed: seed + 5, t, amp: 1 }));
            coast.setAttribute('d', inkPath(ap, { w: 5, seed: seed + 6, t, closed: true }) + inkPath(tp, { w: 5, seed: seed + 7, t, closed: true }) + inkPath(mp, { w: 3, seed: seed + 8, t, closed: true })
              + inkPath(sb, { w: 6, seed: seed + 9, t, closed: true, smooth: false }));
            const a0 = atOr(cues, P.at, 0.3);
            let ld = '', pd = '', sp = '', bd = '', dd = '', dl = '';
            cities.forEach(({ c, tx }, i) => {
              const B = M(c.lon, c.lat), st = atOr(cues, c.at, a0 + i * 0.6), u = progIO(lt, st, c.dur ?? 0.9);
              if (lt >= st) {
                const mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2 + 30];
                const path = []; for (let k = 0; k <= 12; k++) { const s = k / 12 * u; path.push([lerp(lerp(A[0], mid[0], s), lerp(mid[0], B[0], s), s), lerp(lerp(A[1], mid[1], s), lerp(mid[1], B[1], s), s)]); }
                ld += inkPath(path, { w: 4, seed: seed + 20 + i, t, amp: 0.8 });
                for (let k = 2; k < path.length - 1; k += 3) { const q = path[k]; pd += inkPath([[q[0], q[1] + 4], [q[0], q[1] - 22]], { w: 4, seed: seed + 40 + i * 9 + k, t, amp: 0.5 }) + inkPath([[q[0] - 9, q[1] - 18], [q[0] + 9, q[1] - 18]], { w: 3, seed: seed + 60 + i * 9 + k, t, amp: 0.5 }); }
                const e = path[path.length - 1];
                if (u < 1) sp += C.star(e[0], e[1], 22, seed + 80 + i, t) + ' ';
                const arr = st + (c.dur ?? 0.9), age = lt - arr;
                if (age >= 0) {
                  if (age < 0.5) bd += C.star(B[0], B[1], 40 + age * 120, seed + 100 + i, t) + ' ';
                  dd += inkDot(B[0], B[1], 13, 13, seed + 120 + i, t) + ' ';
                  dl += inkPath(inkEllipsePts(B[0], B[1], 13, 13, seed + 130 + i, 8), { w: 3.5, seed: seed + 140 + i, t, closed: true });
                  if (tx) { tx.style.display = ''; tx.setAttribute('x', f1(B[0] + (c.dx || 0))); tx.setAttribute('y', f1(B[1] + (c.dy ?? -30))); }
                } else if (tx) tx.style.display = 'none';
              } else if (tx) tx.style.display = 'none';
            });
            lines.setAttribute('d', ld); poles.setAttribute('d', pd); sparks.setAttribute('d', sp); bursts.setAttribute('d', bd);
            dots.setAttribute('d', dd + C.star(A[0], A[1], 30 + Math.sin(t * 5) * 3, seed + 150, t)); dotsL.setAttribute('d', dl);
            ank.setAttribute('x', f1(A[0])); ank.setAttribute('y', f1(A[1] + 80));
            if (cast) cast.update(lt, t, cues);
            if (labels) labels.update(lt, t, cues);
          },
        };
      }
      // ---------------- office
      const wallF = inkEl(backG, INK.paperDark, { 'fill-opacity': 0.75 }), wallL = inkEl(backG, INK.ink), winF = inkEl(backG, INK.inkSoft, { 'fill-opacity': 0.9 }), starsF = inkEl(backG, INK.paperLight);
      const wireL = inkEl(backG, INK.ink), spark = inkEl(backG, INK.gold);
      const lmp = C.lamp(backG, { seed: seed + 30, glow: 0.16 });
      const clk = C.clock(backG, Object.assign({ seed: seed + 31, case: false }, P.clock || { time: '21:10' }));
      const deskF = inkEl(frontG, INK.stain), deskL = inkEl(frontG, INK.ink);
      const keyF = inkEl(frontG, INK.gold), keyL = inkEl(frontG, INK.ink), tapeF = inkEl(frontG, INK.paperLight), tapeL = inkEl(frontG, INK.ink), tapeD = inkEl(frontG, INK.ink);
      const tapeT = P.tape ? el(frontG, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red }) : null;
      if (tapeT) tapeT.textContent = P.tape.text.toLocaleUpperCase(LOCALE);
      const clerk = C.bust(backG, { hat: P.clerk_hat || 'fes', seed: seed + 400, coat: INK.inkSoft });
      const hand = inkEl(frontG, INK.ink);
      // morse rhythm (deterministic): 1 = down
      const r0 = rng(seed + 77), pat = Array.from({ length: 64 }, () => r0() < 0.55 ? 1 : 0);
      return {
        update(lt, dur, cues, env) {
          const t = env.t, base = H * 0.56;
          wallF.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, base], [-40, base]], { seed: seed + 1, t, amp: 1, smooth: false }));
          const wx0 = W * 0.62, wx1 = W * 0.84, wy0 = 120, wy1 = base - 110;
          winF.setAttribute('d', inkLoop([[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]], { seed: seed + 2, t, amp: 0.8, smooth: false }));
          starsF.setAttribute('d', [0, 1, 2, 3, 4].map(k => { const q = rng(seed + 10 + k); return inkDot(wx0 + 30 + q() * (wx1 - wx0 - 60), wy0 + 30 + q() * (wy1 - wy0 - 60), 4, 4, seed + 11 + k, t); }).join(' '));
          let wl = inkPath([[wx0, wy0], [wx1, wy0], [wx1, wy1], [wx0, wy1]], { w: 7, seed: seed + 3, t, closed: true, smooth: false }) + inkPath([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 5, seed: seed + 4, t })
            + inkPath([[-40, base], [W + 40, base]], { w: 7, seed: seed + 5, t });
          wallL.setAttribute('d', wl);
          // wire: from the desk sounder up the wall and out of the window, sparks running along it
          const wp = [[W * 0.5, H * 0.62], [W * 0.52, H * 0.4], [W * 0.58, H * 0.3], [wx0 + 40, wy0 + 120], [W + 60, wy0 + 60]];
          wireL.setAttribute('d', inkPath(wp, { w: 5, seed: seed + 20, t }));
          const a0 = atOr(cues, P.at, 0.2);
          let sd = '';
          if (lt >= a0) for (let k = 0; k < 3; k++) { const u = ((lt - a0) * 0.6 + k / 3) % 1, sg = Math.min(3, Math.floor(u * 4)), f = u * 4 - sg, A = wp[sg], B = wp[sg + 1];
            sd += C.star(lerp(A[0], B[0], f), lerp(A[1], B[1], f), 22, seed + 21 + k, t) + ' '; }
          spark.setAttribute('d', sd);
          lmp.update(t, { x: W * 0.4, top: -20, len: 220, s: 1.1, swing: 0.03 });
          clk.update(t, lt, cues, { x: W * 0.92, y: H * 0.2, r: 58, dur });
          if (cast) cast.update(lt, t, cues);
          // desk
          const dy = H * 0.66, dk = [[-60, dy], [W + 60, dy], [W + 60, H + 40], [-60, H + 40]];
          deskF.setAttribute('d', inkLoop(dk, { seed: seed + 40, t, amp: 0.8, smooth: false }));
          let dl = inkPath([[-60, dy], [W + 60, dy]], { w: 8, seed: seed + 41, t });
          for (let k = 0; k < 4; k++) dl += inkPath([[-40, dy + 60 + k * 90], [W + 40, dy + 70 + k * 90]], { w: 2.5, seed: seed + 42 + k, t });
          deskL.setAttribute('d', dl);
          // key: lever presses with the morse pattern
          const tapping = lt >= a0, idx = Math.floor((lt - a0) * 7), down = tapping ? pat[((idx % 64) + 64) % 64] : 0;
          const kx = W * 0.42, ky = dy + 40, lev = down ? 10 : 0;
          const base2 = [[kx - 120, ky + 50], [kx + 120, ky + 50], [kx + 110, ky + 20], [kx - 110, ky + 20]];
          const lever = [[kx - 100, ky + 6 + lev * 0.3], [kx + 90, ky - 4 + lev], [kx + 90, ky + 10 + lev], [kx - 100, ky + 18 + lev * 0.3]];
          keyF.setAttribute('d', inkLoop(base2, { seed: seed + 50, t, amp: 0.6, smooth: false }) + ' ' + inkLoop(lever, { seed: seed + 51, t, amp: 0.6, smooth: false }));
          keyL.setAttribute('d', inkPath(base2, { w: 5, seed: seed + 52, t, closed: true, smooth: false }) + inkPath(lever, { w: 5, seed: seed + 53, t, closed: true, smooth: false })
            + inkPath(inkEllipsePts(kx + 96, ky - 10 + lev, 26, 14, seed + 54, 10), { w: 6, seed: seed + 55, t, closed: true })
            + inkPath([[W * 0.5, dy + 60], [W * 0.5, H * 0.62]], { w: 5, seed: seed + 56, t }) + inkPath([[W * 0.47, dy + 70], [W * 0.53, dy + 70], [W * 0.53, dy + 20], [W * 0.47, dy + 20]], { w: 5, seed: seed + 57, t, closed: true, smooth: false }));
          // the clerk's hand on the key (from the left edge)
          const cx = W * 0.3, cyy = dy - 40, s2 = 1.7;
          clerk.update(t, { x: cx, y: cyy, s: s2, back: false, turn: 0.3 + Math.sin(t * 0.5) * 0.1 });
          hand.setAttribute('d', inkPath([[cx + 52 * s2, cyy + 10 * s2], [cx + 120 * s2, dy + 10], [kx + 86, ky - 22 + lev]], { w: 11, seed: seed + 58, t }) + inkDot(kx + 92, ky - 24 + lev, 22, 16, seed + 59, t));
          // tape running from the sounder to the right edge, dots/dashes moving
          const ty = dy + 170, tx0 = W * 0.55, tp = [[tx0, ty - 34], [W + 60, ty - 30], [W + 60, ty + 34], [tx0, ty + 30]];
          tapeF.setAttribute('d', inkLoop(tp, { seed: seed + 60, t, amp: 0.6, smooth: false }));
          tapeL.setAttribute('d', inkPath(tp, { w: 4, seed: seed + 61, t, closed: true, smooth: false }));
          let td = '';
          const off = tapping ? (lt - a0) * 140 : 0;
          for (let k = 0; k < 30; k++) { const x = tx0 + 30 + ((k * 46 + off) % (W - tx0)); const dash = pat[k % 64]; if (x > W - 10) continue;
            td += dash ? inkLoop([[x - 16, ty - 5], [x + 16, ty - 5], [x + 16, ty + 5], [x - 16, ty + 5]], { seed: seed + 70 + k, t, amp: 0.4, smooth: false }) + ' ' : inkDot(x, ty, 6, 6, seed + 70 + k, t) + ' '; }
          if (tapeT) {
            const ta = atOr(cues, P.tape.at, 1e9);
            if (lt >= ta) { const p = spring(lt, ta, 0.5); tapeT.style.display = ''; tapeT.setAttribute('transform', `translate(${f1(W * 0.7)} ${f1(ty - 110)}) scale(${Math.max(0.01, p).toFixed(3)})`); }
            else tapeT.style.display = 'none';
          }
          tapeD.setAttribute('d', td);
          if (labels) labels.update(lt, t, cues);
        },
      };
    },
  };
})();
