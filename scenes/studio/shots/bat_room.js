// bat_room: an 18th-century experiment room at night in parchment ink (BRAND.md §3, §5): silk threads hang from a
// ceiling beam, bats weave between them in figure-eights (optionally sending sound arcs: gold = heard, dashed = a sound
// nobody hears), an owl that flies into the dark and hits the wall, a candle that goes out, a baked ink darkness wash with soft light pools
// that closes in, period figures (the priest-scientist) and the narrator. Set: "interior" (or "night" outdoors, n: 0).
// Uses bat__lib.js (BAT).
// P: {floor: 0.84, dark: 0..1 (wash opacity), pools: [[x, y, r px]] extra light pools (0..1 of W/H), cast[].cassock: true | {from, to, at, dur} (darkness falls on a cue),
//     threads: {n: 9, x0: 0.06, x1: 0.94, top: 0.07, len: [0.5, 0.7]} | false,
//     bats: [{x: 0.5, y: 0.4, ax: 0.3, ay: 0.12, sp: 0.35 (loops/s), s: 0.22, ph: 0, blind: cue|false, plugs: cue|false,
//             crash: cue (from then on it bumps into threads/walls: red stars, tumbling)}],
//     sound: "gold"|"ghost"|false, sound_at: cue|sec,
//     owl: {x: 0.2, y: 0.42, to: 0.86, at: 0, dur: 2.4, s: 0.5, crash: cue (hits the wall at "to")},
//     candle: {x: 0.16, out: cue|false} | false,
//     cast: [figure specs (BAT.figure): {x, y, scale, pose, face, beard, accessory, seq, hat: false}], kasif: K,
//     labels: [TD.label specs]}
// cues: hit, plus whatever the "at"s reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.bat_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BAT, TD = window.TD, atOr = B.atOr, f1 = B.f1, sd = seed * 1000 + 311;
      const FL = (P.floor ?? 0.84) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const FLp = (P.floor ?? 0.84) * H;
      const pools = (P.pools || []).map(([x, y, r, k]) => [x * W, y * H, r, k]);
      const washFull = B.wash(cam, W, H, pools);
      const washHole = P.candle ? B.wash(cam, W, H, pools.concat([[P.candle.x * W, FLp - 170, 360]])) : null;
      const glow = inkEl(cam, INK.gold, { 'fill-opacity': 0.18 });
      const TH = P.threads === false ? null : Object.assign({ n: 9, x0: 0.06, x1: 0.94, top: 0.07, len: [0.5, 0.7] }, P.threads || {});
      const thr = TH ? B.threads(cam, sd + 3) : null;
      const candle = P.candle ? Object.assign({ x: 0.16 }, P.candle) : null;
      const cHold = inkEl(cam, INK.paperDark), cHoldR = inkEl(cam), cWax = inkEl(cam, INK.paperLight), cWaxR = inkEl(cam), flame = inkEl(cam, INK.gold), flameR = inkEl(cam, INK.red), smoke = inkEl(cam, INK.inkSoft);
      const castG = el(cam, 'g');
      const cast = [], robes = [];
      (P.cast || []).forEach((K, i) => { robes.push(K.cassock ? B.cassock(el(castG, 'g'), sd + 70 + i) : null); cast.push(B.figure(el(castG, 'g'), Object.assign({ hat: false, y: P.floor ?? 0.84 }, K), sd + 50 + i)); });
      const owlS = P.owl ? Object.assign({ x: 0.2, y: 0.42, to: 0.86, at: 0, dur: 2.4, s: 0.5 }, P.owl) : null;
      const owl = owlS ? B.owl(el(cam, 'g'), sd + 7) : null, owlStar = B.burst(cam, sd + 8);
      const BS = (P.bats || []).map(b => Object.assign({ x: 0.5, y: 0.4, ax: 0.3, ay: 0.12, sp: 0.35, s: 0.22, ph: 0 }, b));
      const arcsL = BS.map((b, i) => B.arcs(cam, sd + 100 + i * 7));
      const bats = BS.map((b, i) => B.bat(el(cam, 'g'), sd + 200 + i * 9));
      const stars = BS.map((b, i) => B.burst(cam, sd + 300 + i * 5));
      const kas = P.kasif ? B.figure(el(root, 'g'), Object.assign({ x: 0.84, y: P.floor ?? 0.84, scale: 0.8, pose: 'point', face: 'left', dir: 30 }, P.kasif), sd + 9) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 400 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit), cx = W * 0.5, cy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          // darkness
          let dk = 0;
          if (typeof P.dark === 'number') dk = P.dark;
          else if (P.dark) { const a = atOr(cues, P.dark.at, 0); dk = lerp(P.dark.from ?? 0, P.dark.to ?? 1, prog(lt, a, P.dark.dur ?? 1.2)); }
          // candle
          let lx = null, ly = null, lr = 0;
          if (candle) {
            const x = candle.x * W, y = FL, oa = candle.out === false || candle.out == null ? null : atOr(cues, candle.out, null);
            const on = oa == null ? 1 : 1 - prog(lt, oa, 0.35);
            const hold = [[x - 60, y], [x + 60, y], [x + 40, y - 24], [x - 40, y - 24]];
            cHold.setAttribute('d', inkLoop(hold, { seed: sd + 20, t, smooth: false })); cHoldR.setAttribute('d', inkPath(hold, { w: 5, seed: sd + 21, t, closed: true, smooth: false }));
            const wax = [[x - 18, y - 24], [x + 18, y - 24], [x + 18, y - 150], [x - 18, y - 150]];
            cWax.setAttribute('d', inkLoop(wax, { seed: sd + 22, t, smooth: false })); cWaxR.setAttribute('d', inkPath(wax, { w: 5, seed: sd + 23, t, closed: true, smooth: false }));
            const fl = Math.sin(t * 11) * 0.12 + Math.sin(t * 7.3) * 0.08, fh = 52 * on * (1 + fl);
            if (on > 0.02) {
              const fp = [[x, y - 158 - fh], [x + 14 * on, y - 166], [x, y - 152], [x - 14 * on, y - 166]];
              flame.setAttribute('d', inkLoop(fp, { seed: sd + 24, t, amp: 0.8 })); flameR.setAttribute('d', inkLoop([[x, y - 162 - fh * 0.5], [x + 6, y - 162], [x, y - 154], [x - 6, y - 162]], { seed: sd + 25, t, amp: 0.5 }));
              lx = x; ly = y - 170; lr = 260 * on;
            } else { flame.setAttribute('d', ''); flameR.setAttribute('d', ''); }
            const sm = oa != null && lt > oa ? clamp01((lt - oa) / 0.4) * (1 - clamp01((lt - oa - 2.5) / 1.5)) : 0;
            smoke.setAttribute('d', sm > 0.02 ? inkPath([0, 1, 2, 3, 4, 5].map(k => [x + Math.sin(k * 1.3 + lt * 2) * 14 * k / 5, y - 160 - k * 26 * sm]), { w: 5 * sm, seed: sd + 26, t, amp: 1 }) : '');
            glow.setAttribute('d', lr > 10 ? inkCircle(lx, ly, lr * 0.8, sd + 27, t, { fill: true, amp: 2 }) : '');
          } else glow.setAttribute('d', '');
          const onC = lx != null ? clamp01(lr / 260) : 0;
          if (washHole) washHole.set(dk * onC);
          washFull.set(dk * (washHole ? 1 - onC : 1));
          const lines = thr ? thr.update(t, { rim: dk > 0.2, n: TH.n, x0: TH.x0 * W, x1: TH.x1 * W, top: TH.top * H, len: [TH.len[0] * H, TH.len[1] * H], beam: TH.beam }) : [];
          cast.forEach((c, i) => { if (!c) return; const o = c.update(lt, t, cues, W, H); if (robes[i]) robes[i].update(t, o, P.cast[i].scale ?? 1); });
          // owl
          if (owl) {
            const a = atOr(cues, owlS.at, 0), ca = owlS.crash == null ? null : atOr(cues, owlS.crash, null);
            const end = ca != null ? ca : a + owlS.dur;
            const u = clamp01((lt - a) / Math.max(0.3, end - a));
            let x = lerp(owlS.x, owlS.to, u) * W, y = (owlS.y + Math.sin(u * Math.PI * 2) * 0.03) * H, rot = Math.sin(lt * 2) * 4, dz = 0, ph = lt * 1.6;
            let sp = 0;
            if (ca != null && lt >= ca) {
              const k = lt - ca;
              x = owlS.to * W - Math.min(1, k * 3) * 60; y = lerp(owlS.y * H, FL - 70 * owlS.s * 2, prog(k, 0, 1.1)); rot = -lerp(0, 70, prog(k, 0, 0.8)); dz = clamp01(k * 2); ph = 0.2 + Math.sin(k * 14) * 0.1 * Math.exp(-k);
              sp = clamp01(1 - (k - 0.6) / 0.8);
              owlStar.update(t, owlS.to * W + 90 * owlS.s * 2, owlS.y * H, 120, k < 1.4 ? clamp01(k / 0.25) : 0);
            } else owlStar.update(t, 0, 0, 0, 0);
            owl.update(t, { x, y, s: owlS.s, rot, ph, dizzy: dz, rim: dk > 0.2 });
          }
          // bats
          const sA = P.sound ? atOr(cues, P.sound_at, 0) : null;
          BS.forEach((b, i) => {
            const ca = b.crash == null ? null : atOr(cues, b.crash, null);
            const w = (lt * b.sp + b.ph) * Math.PI * 2;
            let x = (b.x + b.ax * Math.sin(w)) * W, y = (b.y + b.ay * Math.sin(2 * w)) * H;
            const vx = Math.cos(w) * b.ax, vy = 2 * Math.cos(2 * w) * b.ay;
            let rot = Math.atan2(vy, Math.abs(vx) + 0.001) * 25, starP = 0, sx = x, sy = y;
            if (ca != null && lt >= ca) {
              // bump every ~1.1 s into the nearest thread / wall, tumble and recover a little
              const k = lt - ca + i * 0.37, cyc = k % 1.1, tgt = lines.length ? lines[(i * 3 + Math.floor(k / 1.1)) % lines.length] : { x: W * (i % 2 ? 0.92 : 0.08), y0: 0, y1: H };
              const bx = tgt.x, by = Math.min(tgt.y1 - 40, (b.y + 0.05 * Math.sin(i + Math.floor(k / 1.1))) * H);
              const u = clamp01(cyc / 0.45);
              x = lerp(x, bx, u); y = lerp(y, by, u);
              if (cyc > 0.45) { const r = (cyc - 0.45) / 0.65; x = bx + (i % 2 ? 1 : -1) * 90 * r; y = by + 120 * r * r; rot = (i % 2 ? 1 : -1) * 160 * r; starP = clamp01(1 - r * 1.6); sx = bx; sy = by; }
            }
            const lvl = v => v == null || v === false ? 0 : v === true ? 1 : prog(lt, atOr(cues, v, 0), 0.6);
            const blind = lvl(b.blind), plugs = lvl(b.plugs);
            const call = sA != null && lt >= sA ? 1 : 0, mo = call ? 0.5 + 0.5 * Math.abs(Math.sin(lt * 9 + i)) : 0.15;
            const r = bats[i].update(t, { x, y, s: b.s, rot, ph: lt * 3.2 + i * 0.3, mouth: mo, blind, plugs, rim: dk > 0.2 });
            arcsL[i].update(t + i * 0.2, { x: r.mouth[0], y: r.mouth[1], dir: vx >= 0 ? -10 : 190, p: call * prog(lt, sA ?? 0, 0.4), ghost: P.sound === 'ghost' || P.sound === 'dashgold', color: P.sound === 'dashgold' ? INK.gold : null, range: P.sound === 'dashgold' ? 330 : 230, spread: 30, w: P.sound === 'dashgold' ? 13 : 5, period: 0.6 });
            stars[i].update(t, sx, sy, 60, starP);
          });
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
