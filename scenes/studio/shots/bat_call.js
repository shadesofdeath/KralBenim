// bat_call: close-up of one bat in flight in parchment ink (BRAND.md §3, §5): big ears, wing bones, sound arcs that
// leave its mouth (gold = loud call, dashed = a sound nobody hears, slow wide waves from the wings = Maxim's guess),
// optional moth that sends blue echo arcs back, wax plugs that go into the ears, a soft blindfold, flour speckles,
// silk threads behind, a hand that holds the bat (folded wings) up to a microphone. Uses bat__lib.js (BAT).
// P: {x: 0.5, y: 0.5, s: 0.9, bob: 1, flap: 0.9 (cycles/s), fold: 0 (1 = wings folded, held),
//     call: cue|sec|false (gold arcs + open mouth from then), loud: false (more, thicker, longer arcs), ghost: false,
//     low: cue|false (slow wide arcs from both wings), dir: 0 (deg, call direction), range: 520,
//     moth: {x: 0.84, y: 0.42, s: 0.8, at: cue (echo arcs return from it after the call reaches it)} | false,
//     plugs: cue|true, blind: cue|true, flour: cue|true, threads: {n, x0, x1, top, len} | false,
//     hand: false | {x: 0.5, y: 0.66} (a big ink hand from the bottom holding the bat),
//     kasif: K, labels: [TD.label specs]}
// cues: hit, + the "at"s referenced.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.bat_call = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BAT, ell = window.BAT.ell, TD = window.TD, atOr = B.atOr, f1 = B.f1, sd = seed * 1000 + 523;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const washD = B.wash(cam, W, H, [[(P.x ?? 0.5) * W, (P.y ?? 0.5) * H, P.pool ?? 520]].concat((P.pools || []).map(([x, y, r, k]) => [x * W, y * H, r, k])));
      const TH = P.threads ? Object.assign({ n: 7, x0: 0.05, x1: 0.95, top: 0.04, len: [0.45, 0.75] }, P.threads) : null;
      const thr = TH ? B.threads(cam, sd + 2) : null;
      const lowA = [B.arcs(cam, sd + 30), B.arcs(cam, sd + 31)];
      const callA = B.arcs(cam, sd + 10), callB = B.arcs(cam, sd + 11), echoA = B.arcs(cam, sd + 12);
      const mothD = P.moth ? B.moth(el(cam, 'g'), sd + 40) : null;
      const sleeve = inkEl(cam, INK.inkSoft), sleeveR = inkEl(cam);
      const bat = B.bat(el(cam, 'g'), sd + 50);
      const burstE = inkEl(cam, INK.gold), burstR = inkEl(cam, INK.red);
      const handF = inkEl(cam, INK.paperLight), handR = inkEl(cam);
      const handF2 = inkEl(cam, INK.paperLight), handR2 = inkEl(cam);
      const kas = P.kasif ? B.figure(el(root, 'g'), Object.assign({ x: 0.86, y: 0.92, scale: 0.7, pose: 'point', face: 'left', dir: 30 }, P.kasif), sd + 9) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      const lvl = (v, cues, lt) => v == null || v === false ? 0 : v === true ? 1 : prog(lt, atOr(cues, v, 0), 0.7);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit), cx = W * 0.5, cy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          washD.set(P.dark ?? 0);
          if (thr) thr.update(t, { rim: (P.dark ?? 0) > 0.2, n: TH.n, x0: TH.x0 * W, x1: TH.x1 * W, top: TH.top * H, len: [TH.len[0] * H, TH.len[1] * H], beam: TH.beam });
          const fold = P.fold ?? 0, bob = (P.bob ?? 1) * (1 - fold);
          const X = (P.x ?? 0.5) * W + Math.sin(lt * 0.9) * 18 * bob, Y = (P.y ?? 0.5) * H + Math.sin(lt * 1.8) * 14 * bob;
          const ca = P.call === false || P.call == null ? null : atOr(cues, P.call, 0);
          const calling = ca != null && lt >= ca;
          const mo = calling ? 0.55 + 0.45 * Math.abs(Math.sin(lt * 8)) : 0.1;
          const r = bat.update(t, { x: X, y: Y, s: P.s ?? 0.9, rot: Math.sin(lt * 1.1) * 3 * bob, ph: lt * (P.flap ?? 0.9) * (1 - fold), fold,
            mouth: mo, plugs: lvl(P.plugs, cues, lt), blind: lvl(P.blind, cues, lt), flour: lvl(P.flour, cues, lt), rim: (P.dark ?? 0) > 0.2 });
          // hand holding the bat (big simple ink hand from below, thumb over the front)
          if (P.hand) {
            const k = (P.s ?? 0.9), hx = X, hy = Y + 60 * k;
            const sl = [[hx - 70 * k, hy + 60 * k], [hx + 70 * k, hy + 60 * k], [hx + 110 * k, H + 40], [hx - 30 * k, H + 40]];
            sleeve.setAttribute('d', inkLoop(sl, { seed: sd + 58, t, smooth: false })); sleeveR.setAttribute('d', inkPath(sl, { w: 6, seed: sd + 59, t, closed: true, smooth: false }));
            const fist = ell(hx, hy + 20 * k, 112 * k, 70 * k, 16);
            handF.setAttribute('d', inkLoop(fist, { seed: sd + 60, t }));
            let fr = inkPath(fist, { w: 6, seed: sd + 61, t, closed: true });
            for (let q = 0; q < 3; q++) { const yy = hy - 10 * k + q * 26 * k; fr += ' ' + inkPath([[hx - 20 * k, yy], [hx + 50 * k, yy - 4 * k], [hx + 104 * k, yy + 8 * k]], { w: 4, seed: sd + 64 + q, t, amp: 0.8 }); }
            handR.setAttribute('d', fr);
            const th = [[hx - 116 * k, hy + 30 * k], [hx - 100 * k, hy - 28 * k], [hx - 34 * k, hy - 34 * k], [hx - 30 * k, hy - 6 * k], [hx - 70 * k, hy + 34 * k]];
            handF2.setAttribute('d', inkLoop(th, { seed: sd + 62, t })); handR2.setAttribute('d', inkPath(th, { w: 5, seed: sd + 63, t, closed: true }));
          }
          const dir = P.dir ?? 0, range = (P.range ?? 520) * (P.loud ? 1.25 : 1);
          const cp = calling ? prog(lt, ca, 0.3) : 0;
          callA.update(t, { x: r.mouth[0], y: r.mouth[1], dir, p: cp, ghost: !!P.ghost, n: P.loud ? 5 : 3, range, spread: P.loud ? 40 : 30, w: P.loud ? 20 : 9, period: P.loud ? 0.55 : 0.8 });
          if (P.burst && cp > 0.01) {
            const k = (P.s ?? 0.9), pul = 1 + 0.2 * Math.sin(lt * 18), r0 = 30 * k, r1 = (70 + 14 * pul) * k * cp, mx = r.mouth[0], my = r.mouth[1] + 4 * k;
            let sp = '', tip = '';
            for (let m = 0; m < 10; m++) {
              const a = m * Math.PI / 5 + 0.3, w = 0.16, ra = m % 2 ? r1 * 0.75 : r1;
              const tri = [[mx + Math.cos(a - w) * r0, my + Math.sin(a - w) * r0], [mx + Math.cos(a) * ra, my + Math.sin(a) * ra], [mx + Math.cos(a + w) * r0, my + Math.sin(a + w) * r0]];
              sp += inkLoop(tri, { seed: sd + 90 + m, t, smooth: false, amp: 0.8 }) + ' ';
              tip += inkDot(mx + Math.cos(a) * ra, my + Math.sin(a) * ra, 5 * k, 5 * k, sd + 110 + m, t) + ' ';
            }
            burstE.setAttribute('d', sp); burstR.setAttribute('d', tip);
          } else { burstE.setAttribute('d', ''); burstR.setAttribute('d', ''); }
          callB.update(t + 0.3, { x: r.mouth[0], y: r.mouth[1], dir: dir + 180, p: P.loud ? cp : 0, n: 4, range: range * 0.8, spread: 40, w: 18, period: 0.55 });
          // Maxim's guess: slow, wide waves from the wings
          const la = P.low ? atOr(cues, P.low, 0) : null, lp = la != null ? prog(lt, la, 0.5) : 0;
          [-1, 1].forEach((side, i) => lowA[i].update(t * 0.45 + i * 0.3, { x: X + side * 280 * (P.s ?? 0.9), y: Y - 20, dir: side < 0 ? 180 : 0, p: lp, n: 2, range: 420, spread: 55, w: 16, period: 1.6, color: INK.blue }));
          if (mothD) {
            const M = P.moth, mx = (M.x ?? 0.84) * W + Math.sin(lt * 2.3) * 22, my = (M.y ?? 0.42) * H + Math.cos(lt * 1.7) * 18;
            const ma = atOr(cues, M.at, 0), mp = prog(lt, ma, 0.5);
            mothD.update(t, { x: mx, y: my, s: (M.s ?? 0.8) * mp, ph: lt * 5 });
            const back = calling ? clamp01((lt - ca - 0.5) / 0.4) * mp : 0;
            const ang = Math.atan2(r.mouth[1] - my, r.mouth[0] - mx) * 180 / Math.PI;
            echoA.update(t + 0.25, { x: mx, y: my, dir: ang, p: back, n: 3, range: Math.hypot(r.mouth[0] - mx, r.mouth[1] - my) * 0.8, spread: 22, w: 7, period: 0.8, color: INK.blue });
          }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
