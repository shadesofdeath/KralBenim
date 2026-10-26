// ce_storm: why a solar storm makes current in long wires, as one parchment diagram: the Sun (upper left) throws a
// stream of charged particles (gold / red dots) at Earth (upper right); Earth's magnetic field lines (dashed blue
// loops) get squeezed and shake when it hits; below, a telegraph line between two poles lights up and gold current
// pulses race along it. Carrington Event Short (Stickstory 2026-10-26), parametric. Uses ce__lib.js (CE) and
// td__lib.js (TD: sun, earth, label). Palette tokens only, boil 8 Hz, pure function of (seed, lt).
// P: {
//   sun: {x: 0.2, y: 0.27, r: 150}, earth: {x: 0.78, y: 0.3, r: 150},
//   at: cue|sec (particles leave the Sun; they reach Earth after ~1 s), current_at: cue (pulses run along the wire),
//   wire: {y: 0.5, x0: 0.28, x1: 0.98},
//   kasif: K | false, labels: [...]
// }   cues: hit (punch), at, current_at, label / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.ce_storm = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const CE = window.CE, TD = window.TD, f1 = CE.f1, atOr = CE.atOr, sd = seed * 1000 + 919;
      const SU = Object.assign({ x: 0.2, y: 0.27, r: 150 }, P.sun || {}), EA = Object.assign({ x: 0.78, y: 0.3, r: 150 }, P.earth || {});
      const WI = Object.assign({ y: 0.5, x0: 0.28, x1: 0.98 }, P.wire || {});
      const root = el(svg, 'g'), cam = el(root, 'g');
      const field = inkEl(cam, INK.inkSoft);
      const sun = TD.sun(cam, sd + 1), earth = TD.earth(cam, defs, sd + 2);
      const partR = inkEl(cam, INK.red, { 'fill-opacity': 0.85 }), partG = inkEl(cam, INK.gold);
      const ground = inkEl(cam);
      const p1 = CE.pole(cam, sd + 3), p2 = CE.pole(cam, sd + 4), w1 = CE.wire(cam, sd + 5), w2 = CE.wire(cam, sd + 6);
      const glow = inkEl(cam, INK.gold, { 'fill-opacity': 0.35 });
      const kas = P.kasif ? CE.fig(el(root, 'g'), Object.assign({ x: 0.13, y: 0.6, scale: 0.8, pose: 'point', face: 'right' }, P.kasif), sd + 80) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      const r0 = rng(sd + 7), parts = Array.from({ length: 34 }, () => ({ off: r0(), lane: r0() * 2 - 1, sz: 6 + r0() * 7, red: r0() < 0.45 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
          cam.setAttribute('transform', `translate(${f1(W / 2)} ${f1(H * 0.4)}) scale(${z.toFixed(4)}) translate(${f1(-W / 2)} ${f1(-H * 0.4)})`);
          const sx = SU.x * W, sy = SU.y * H, ex = EA.x * W, ey = EA.y * H;
          const a0 = atOr(cues, P.at, 0.1), arrive = a0 + 1.0, imp = lt >= arrive ? Math.exp(-(lt - arrive) * 2.2) : 0, flow = lt >= a0 ? 1 : 0;
          sun.update(t, sx, sy, SU.r * (1 + 0.04 * Math.sin(t * 2.5)));
          earth.update(t, ex, ey, EA.r, true, true);
          // dipole field lines, squeezed on the Sun side once the storm arrives
          let fd = '';
          const squeeze = lt >= arrive ? 0.3 + 0.08 * Math.sin(lt * 6) * imp : 0.12;
          for (const L of [1.45, 1.85, 2.3, 2.8]) {
            for (const side of [-1, 1]) {
              const pts = [];
              for (let k = 0; k <= 14; k++) {
                const th = 0.25 + k / 14 * (Math.PI - 0.5), rr = EA.r * L * Math.sin(th) ** 2;
                let x = side * rr * Math.sin(th), y = -rr * Math.cos(th);
                if (side < 0) x *= 1 - squeeze; else x *= 1 + squeeze * 1.6;
                pts.push([ex + x, ey + y]);
              }
              fd += inkPath(pts, { w: 6.5, seed: sd + 20 + Math.round(L * 10) + side * 3, t, amp: 1, taper: 0.5 }) + ' ';
            }
          }
          field.setAttribute('d', fd);
          // particle stream
          let pr = '', pg = '';
          if (flow) parts.forEach((q, i) => {
            const u = ((lt - a0) * 0.75 + q.off) % 1, born = (lt - a0) * 0.75 >= q.off * 0.6 ? 1 : 0;
            if (!born) return;
            const lane = q.lane * (40 + 50 * Math.sin(u * Math.PI));
            const stop = 1 - (EA.r * (2.2 - squeeze * 1.6)) / Math.hypot(ex - sx, ey - sy);
            if (u > stop) return;
            const x = lerp(sx + SU.r, ex, u), y = lerp(sy, ey, u) + lane + Math.sin(lt * 3 + i) * 6;
            const d = inkDot(x, y, q.sz, q.sz * 0.8, sd + 200 + i, t) + ' ';
            if (q.red) pr += d; else pg += d;
          });
          partR.setAttribute('d', pr); partG.setAttribute('d', pg);
          // telegraph line below
          const gy = 0.6 * H, wy = WI.y * H;
          ground.setAttribute('d', inkPath([[-40, gy + 6], [W / 2, gy - 4], [W + 40, gy + 8]], { w: 6, seed: sd + 8, t }));
          const ta = p1.update(t, WI.x0 * W + 40, gy, gy - wy + 24, 0.95), tb = p2.update(t, WI.x1 * W - 40, gy, gy - wy + 24, 0.95);
          const ca = atOr(cues, P.current_at, null), cp = ca == null ? 0 : (lt >= ca ? clamp01((lt - ca) / 0.3) : 0);
          w1.update(t, ta[0], tb[0], 60, cp, 5, 6); w2.update(t, ta[1], tb[1], 60, cp, 5, 6);
          glow.setAttribute('d', cp > 0.01 ? inkLoop([[ta[0][0], ta[0][1] - 16], [W / 2, wy + 20], [tb[1][0], tb[1][1] - 16], [tb[1][0], tb[1][1] + 16], [W / 2, wy + 60], [ta[0][0], ta[0][1] + 16]], { seed: sd + 9, t, amp: 2 }) : '');
          glow.setAttribute('fill-opacity', (0.3 * cp * (0.7 + 0.3 * Math.sin(lt * 9))).toFixed(3));
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
