// nea_fire: a campfire at night with figures sitting round it on rocks (Neanderthal DNA Short): a slender modern
// human on one side, a stocky Neanderthal on the other; on the child cue a small child springs up between them,
// behind the flames. Flames are layered ink shapes (red, gold, paper-light core) that lick and flicker, sparks rise,
// a soft warm pool of light lies on the ground. The night itself is the scene's "set".
// P: {fire: {x: 0.5, y: 1140, s: 1}, figs: [{kind, x, s, face, sit: 1, arm: "reach"}],
//     child: {at: cue|s, x: 0.4, y: 1160, s: 1.0, face: 1, coat} | false (stands beside the fire, in front), labels: [...MCB labels], kasif: {...} | false}
// cues: child.at, "hit" (fire flares), labels' at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.nea_fire = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, labels, cast } = window.MCB;
      const sd = seed * 1000 + 8100;
      const FI = Object.assign({ x: 0.5, y: 1140, s: 1 }, P.fire || {});
      const fx = FI.x * W, fy = FI.y, fs = FI.s;
      const root = el(svg, 'g');
      const glow = [0, 1, 2].map(() => inkEl(root, INK.gold));
      // ground in front: firelight pool, a ring of stones, a pile of firewood (one wide path per layer)
      const gGlow = inkEl(root, INK.gold), gStoneF = inkEl(root, INK.paperDark), gWoodF = inkEl(root, INK.inkSoft), gL = inkEl(root, INK.ink);
      const rocks = inkEl(root, INK.paperDark), rocksL = inkEl(root, INK.ink);
      const figs = (P.figs || []).map((f, i) => ({ f, fig: NEA.fig(el(root, 'g'), f.kind || 'nean', sd + i * 137) }));
      const logs = inkEl(root, INK.ink), logsI = inkEl(root, INK.inkSoft);
      const flame = [inkEl(root, INK.red), inkEl(root, INK.gold), inkEl(root, INK.paperLight)], flameL = inkEl(root, INK.ink);
      const sparks = inkEl(root, INK.gold);
      // the child stands on the ground beside the fire, in front of everything
      const CH = P.child === false ? null : Object.assign({ at: 'child', x: 0.4, y: 1160, s: 1.0, face: 1 }, P.child || {});
      const childG = el(root, 'g'), child = CH ? NEA.fig(childG, 'child', sd + 90) : null;
      const castG = el(root, 'g');
      const cs = P.kasif ? cast(castG, [Object.assign({ who: 'kasif', x: 0.85, y: 0.6, scale: 0.6, pose: 'point', face: 'left' }, P.kasif)], W, H, sd + 300) : null;
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const R = rng(sd + 5), SP = Array.from({ length: 16 }, () => [R(), R(), R()]);
      const tongue = (h, wd, ph, t) => {   // one flame tongue around (0,0) base, pointing up
        const sw = Math.sin(t * 7 + ph) * 0.18 + Math.sin(t * 13 + ph * 2) * 0.08;
        return [[-wd, 0], [-wd * 0.8, -h * 0.35], [-wd * 0.3 + sw * wd, -h * 0.7], [sw * wd * 2.2, -h], [wd * 0.35 + sw * wd, -h * 0.62], [wd * 0.85, -h * 0.3], [wd, 0], [0, h * 0.08]];
      };
      const at = (pts, x, y, s) => pts.map(q => [x + q[0] * s, y + q[1] * s]);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const flare = 1 + 0.35 * punch(lt, atOr(cues, 'hit', null), 0.9);
          const fl = (1 + 0.08 * Math.sin(t * 11) + 0.05 * Math.sin(t * 17.3)) * flare;
          glow.forEach((g, i) => {
            g.setAttribute('d', inkLoop(inkEllipsePts(fx, fy - 20, (420 - i * 120) * fs * fl, (110 - i * 26) * fs * fl, sd + 10 + i, 18), { seed: sd + 10 + i, t, amp: 1 }));
            g.setAttribute('fill-opacity', (0.12 + i * 0.08).toFixed(3));
          });
          if (child) {
            const ca = atOr(cues, CH.at, null), cp = ca != null ? spring(lt, ca, 0.6) : 0;
            if (cp > 0.01) {
              childG.style.display = '';
              child.draw(t, { x: CH.x * W, y: CH.y, s: CH.s * Math.max(0.05, Math.min(1.08, cp)), face: CH.face, arm: 'wave', coat: CH.coat || 'red', a: clamp01(cp * 2) });
            } else childG.style.display = 'none';
          }
          figs.forEach(({ f, fig }, i) => {
            const x = f.x * W, y = f.y ?? 1150, s = f.s ?? 1;
            fig.draw(t, { x, y, s, face: f.face ?? 1, sit: f.sit ?? 1, arm: f.arm || 'reach', look: 0, coat: f.coat });
          });
          {
            const pool = []; for (let x = -40; x <= W + 40; x += 60) pool.push([x, 1215 + Math.sin(x * 0.009 + 1) * 14]);
            gGlow.setAttribute('d', inkLoop(pool.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: sd + 200, t, amp: 1 }));
            gGlow.setAttribute('fill-opacity', (0.16 + 0.04 * Math.sin(t * 9)).toFixed(3));
            let sf = '', wf = '', gl = inkPath(pool, { w: 3, seed: sd + 201, t, amp: 1 });
            [[0.08, 1330, 60], [0.22, 1420, 46], [0.38, 1360, 54], [0.66, 1400, 50], [0.82, 1340, 64], [0.95, 1430, 44]].forEach(([x, y, r], i) => {
              const pts = inkEllipsePts(x * W, y, r, r * 0.6, sd + 210 + i, 9, 0, 0.15);
              sf += inkLoop(pts, { seed: sd + 210 + i, t, amp: 0.8 }) + ' '; gl += ' ' + inkPath(pts, { w: 5, seed: sd + 220 + i, t, closed: true, amp: 0.8 });
            });
            [[[0.5, 1300], [0.86, 1250]], [[0.48, 1340], [0.9, 1300]], [[0.55, 1270], [0.8, 1215]]].forEach((l, i) => {
              const a = [l[0][0] * W, l[0][1]], b = [l[1][0] * W, l[1][1]];
              wf += inkPath([a, b], { w: 36, seed: sd + 230 + i, t, amp: 0.6, taper: 0.02 }) + ' ';
              gl += ' ' + inkPath([a, b], { w: 5, seed: sd + 235 + i, t, amp: 0.6 }) + ' ' + inkCircle(a[0], a[1], 17, sd + 240 + i, t, { w: 4 });
            });
            gStoneF.setAttribute('d', sf); gWoodF.setAttribute('d', wf); gL.setAttribute('d', gl);
          }
          let rd = '', rl = '';
          figs.forEach(({ f }, i) => {
            const x = f.x * W, s = f.s ?? 1, y = (f.y ?? 1150), pts = inkEllipsePts(x + (f.face ?? 1) * -6 * s, y - 28 * s, 64 * s, 34 * s, sd + 40 + i, 10, 0, 0.12);
            rd += inkLoop(pts, { seed: sd + 40 + i, t, amp: 0.8 }) + ' '; rl += inkPath(pts, { w: 5, seed: sd + 44 + i, t, closed: true, amp: 0.8 }) + ' ';
          });
          rocks.setAttribute('d', rd); rocksL.setAttribute('d', rl);
          // logs (crossed) and flames
          const lg = [[[-110, 0], [100, -40]], [[110, 0], [-100, -40]], [[-60, 8], [70, 8]]];
          logs.setAttribute('d', lg.map((l, i) => inkPath(at(l, fx, fy, fs), { w: 34 * fs, seed: sd + 50 + i, t, amp: 1, taper: 0.02 })).join(' '));
          logsI.setAttribute('d', lg.map((l, i) => inkPath(at(l, fx, fy, fs), { w: 20 * fs, seed: sd + 53 + i, t, amp: 0.8, taper: 0.02 })).join(' '));
          const T1 = [[-50, 150, 46, 0.3], [10, 200, 58, 1.7], [60, 140, 42, 3.1]];
          let f0 = '', f1 = '', f2 = '', fL = '';
          T1.forEach(([dx, h, wd, ph], i) => {
            const base = [fx + dx * fs, fy - 24 * fs];
            const o = tongue(h * fl, wd, ph, t), m = tongue(h * 0.66 * fl, wd * 0.62, ph + 0.6, t), c = tongue(h * 0.36 * fl, wd * 0.34, ph + 1.1, t);
            f0 += inkLoop(at(o, base[0], base[1], fs), { seed: sd + 60 + i, t, amp: 1.2 }) + ' ';
            f1 += inkLoop(at(m, base[0], base[1], fs), { seed: sd + 63 + i, t, amp: 1 }) + ' ';
            f2 += inkLoop(at(c, base[0], base[1], fs), { seed: sd + 66 + i, t, amp: 0.8 }) + ' ';
            fL += inkPath(at(o, base[0], base[1], fs), { w: 5, seed: sd + 69 + i, t, closed: true, amp: 1.2 }) + ' ';
          });
          flame[0].setAttribute('d', f0); flame[1].setAttribute('d', f1); flame[2].setAttribute('d', f2); flameL.setAttribute('d', fL);
          let sp = '';
          SP.forEach((q, i) => {
            const life = 1.6 + q[2], ph = ((t + q[0] * life) % life) / life;
            const x = fx + (q[1] - 0.5) * 160 * fs + Math.sin(t * 3 + i) * 20 * ph, y = fy - 140 * fs - ph * 420 * fs;
            const r = (6 - 4 * ph) * fs;
            if (r > 1) sp += inkDot(x, y, r, r, sd + 80 + i, t, 0.3) + ' ';
          });
          sparks.setAttribute('d', sp);
          if (cs) cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
