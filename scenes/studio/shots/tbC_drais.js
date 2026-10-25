// tbC_drais: horses, oats and Karl Drais's running machine (Tambora long video, chapter 4). Parchment ink (BRAND §5).
//   mode "oats" — a barn wall, a thin horse (ribs showing) beside an empty trough, a sack of oats with a swinging price
//                 tag and a red arrow that jumps up on a cue
//   mode "ride" — a town street; a rider on the wooden two-wheeled running machine (Laufmaschine, 1817) glides across,
//                 pushing off the ground with alternate feet, dust puffs; optional faint dashed bicycle outline appears
// P: {mode: "oats"|"ride", ground: 0.86, cast (TBC.cast entries), labels (MCB labels), cam: {zoom, focus, push},
//   horse: {x: 0.36, s: 1.25}, trough: {x: 0.6}, sack: {x: 0.8, at (arrow jumps)},
//   ride: {x0: 0.08, x1: 0.62, at: 0, dur (default: scene), s: 1}, rider: {hair: "sideburns", coat: "green"},
//   bike: {at, x: 0.84, y: 0.5, s: 0.7} (dashed modern bicycle outline), houses: true}
// cues: sack.at, ride.at, bike.at, labels/cast cues
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const T = () => window.TBC;
  SH.tbC_drais = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const camG = el(svg, 'g');
      const bg = T().ink(el(camG, 'g'), seed * 3 + 1);
      const horseG = el(camG, 'g');
      const mid = T().ink(el(camG, 'g'), seed * 3 + 2);
      const castG = el(camG, 'g');
      const front = T().ink(el(camG, 'g'), seed * 3 + 3);
      const labG = el(camG, 'g');
      const gy = H * (P.ground ?? 0.86), mode = P.mode || 'ride';
      const cast = T().cast(castG, P.cast, W, H, seed * 11);
      const labs = T().labels(labG, P.labels, W, H, seed * 5);
      const HS = P.horse || {};
      const horse = mode === 'oats' && window.PGB ? window.PGB.horse(horseG, seed * 7 + 3, true) : null;
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb), f1 = T().f1;
          T().cam(camG, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.5, 0.6] }, punch(lt, A(P.cam && P.cam.push, null)));
          bg.begin(t); mid.begin(t); front.begin(t);
          if (mode === 'oats') {
            // barn wall of planks
            bg.shape([[-60, gy], [-60, H * 0.22], [W + 60, H * 0.2], [W + 60, gy]], { f: INK.paperDark, w: 5, smooth: false });
            for (let i = 0; i < 13; i++) bg.line([[i * W / 12, H * 0.21], [i * W / 12 + 3, gy]], { w: 4, c: 'soft' });
            bg.line([[-60, gy], [W + 60, gy - 2]], { w: 7 });
            for (let i = 0; i < 18; i++) { const x = i * 110 + 20; bg.line([[x, gy + 4], [x + 18, gy - 26 - (i % 3) * 8]], { w: 4, c: 'gold' }); }
            // trough (empty)
            const tx = W * ((P.trough && P.trough.x) ?? 0.6);
            mid.shape([[tx - 150, gy - 120], [tx + 150, gy - 120], [tx + 120, gy - 40], [tx - 120, gy - 40]], { f: INK.stain, w: 6, smooth: false });
            mid.line([[tx - 100, gy - 40], [tx - 110, gy]], { w: 8 }); mid.line([[tx + 100, gy - 40], [tx + 110, gy]], { w: 8 });
            // sack of oats + price tag
            const S = P.sack || {}, sx = W * (S.x ?? 0.82), sa = A(S.at, dur * 0.4), jp = spring(lt, sa, 0.6), pk = punch(lt, sa);
            mid.shape([[sx - 110, gy], [sx - 120, gy - 170], [sx - 70, gy - 250], [sx - 30, gy - 280], [sx + 40, gy - 276], [sx + 80, gy - 248], [sx + 120, gy - 160], [sx + 110, gy]], { f: INK.paperLight, w: 6 });
            mid.line([[sx - 50, gy - 262], [sx + 50, gy - 262]], { w: 6 });
            mid.text('OATS', sx, gy - 130, { font: 'serif', size: 64 });
            const sw = Math.sin(lt * 2.4) * 8 + pk * 14;
            mid.push(`translate(${f1(sx + 70)} ${f1(gy - 262)}) rotate(${sw.toFixed(1)})`);
            mid.line([[0, 0], [60, 60]], { w: 3 });
            mid.shape([[40, 50], [120, 50], [140, 90], [120, 130], [40, 130]], { f: INK.gold, w: 4, smooth: false });
            mid.circle(64, 90, 18, { w: 4 });
            mid.line([[96, 116 - 0 * jp], [96, lerp(116, 64, jp)]], { w: 7, c: 'red' });
            if (jp > 0.3) mid.line([[84, lerp(116, 78, jp)], [96, lerp(116, 60, jp)], [108, lerp(116, 78, jp)]], { w: 6, c: 'red', smooth: false }); else mid.line(null);
            mid.pop();
            // the horse + ribs
            if (horse) {
              const hx = W * (HS.x ?? 0.34), s = HS.s ?? 1.3;
              horseG.setAttribute('transform', `translate(${f1(hx)} ${f1(gy)}) scale(${s})`);
              horse.update(t, 0.08 + Math.sin(lt * 0.9) * 0.02);
              front.push(`translate(${f1(hx)} ${f1(gy)}) scale(${s})`);
              for (let k = 0; k < 4; k++) front.line([[-20 + k * 22, -164], [-28 + k * 22, -140], [-24 + k * 22, -118]], { w: 3.5, c: 'soft' });
              front.pop();
            }
          } else {
            // town street
            bg.line([[-60, gy], [W + 60, gy - 2]], { w: 7 });
            bg.shape([[-60, gy], [W + 60, gy - 2], [W + 60, H + 30], [-60, H + 30]], { f: INK.paperDark, w: 0.1 });
            if (P.houses !== false) for (let i = 0; i < 6; i++) T().house(bg, W * (0.08 + i * 0.17), gy - 140 - (i % 2) * 10, 200 + (i % 3) * 20, 170 + (i % 2) * 40, { roof: i % 2 ? 'soft' : 'red', windows: 2, door: true });
            for (let i = 0; i < 9; i++) bg.line([[i * 230 + 30, gy + 30], [i * 230 + 120, gy + 30]], { w: 3, c: 'soft' });
            // rider on the running machine
            const R = P.ride || {}, ra = A(R.at, 0), rd = R.dur ?? Math.max(2, dur - ra - 0.3), s = R.s ?? 1;
            const u = progIO(lt, ra, rd), x = W * lerp(R.x0 ?? 0.08, R.x1 ?? 0.62, u);
            const vel = (W * ((R.x1 ?? 0.62) - (R.x0 ?? 0.08)) / rd) * (lt > ra && lt < ra + rd ? 1 : 0.15);
            const wr = 78 * s, rot = x / wr;
            const fw = [x + 150 * s, gy - wr], rw = [x - 150 * s, gy - wr];
            // dust puffs behind
            for (let k = 0; k < 4; k++) {
              const ph = ((lt * 1.6 + k / 4) % 1), on = lt > ra && lt < ra + rd + 0.4;
              front.circle(rw[0] - 40 - ph * 160, gy - 16 - ph * 30, (10 + ph * 26) * (on ? 1 : 0.01), { w: 3, c: 'soft', op: 1 - ph });
            }
            T().wheel(front, rw[0], rw[1], wr, rot, { f: INK.paperLight, spokes: 10 });
            T().wheel(front, fw[0], fw[1], wr, rot, { f: INK.paperLight, spokes: 10 });
            // frame: beam from rear hub over the saddle to the fork, handlebar
            const beamY = gy - wr * 1.9;
            front.shape([[rw[0] - 10, beamY + 4], [fw[0] - 10, beamY - 4], [fw[0] - 6, beamY + 18], [rw[0] - 10, beamY + 22]], { f: INK.stain, w: 5, smooth: false });
            front.line([[rw[0], rw[1]], [rw[0] + 6, beamY + 14]], { w: 7 });
            front.line([[fw[0], fw[1]], [fw[0] - 14, beamY - 70 * s]], { w: 7 });
            front.line([[fw[0] - 50 * s, beamY - 74 * s], [fw[0] + 10 * s, beamY - 70 * s]], { w: 8 });
            front.shape([[x - 70 * s, beamY - 6], [x + 20 * s, beamY - 6], [x + 20 * s, beamY + 6], [x - 70 * s, beamY + 6]], { f: INK.red, w: 4, smooth: false });
            // rider: hip on the saddle, leaning forward, hands on the bar, feet push off in turn
            const fs = 0.82 * s, hip = [x - 26 * s, beamY - 12], lean = 0.32, tl = 150 * fs;
            const sho = [hip[0] + Math.sin(lean) * tl, hip[1] - Math.cos(lean) * tl];
            const hc = [sho[0] + 26 * fs, sho[1] - 92 * fs];
            const bar = [fw[0] - 30 * s, beamY - 72 * s];
            const elb = [(sho[0] + bar[0]) / 2 - 6 * fs, (sho[1] + bar[1]) / 2 + 30 * fs];
            const RC = P.rider || {};
            const leg = (ph) => {
              const c = ((ph % 1) + 1) % 1, stance = c < 0.55;
              const fx0 = stance ? lerp(hip[0] + 70 * s, hip[0] - 90 * s, c / 0.55) : lerp(hip[0] - 90 * s, hip[0] + 70 * s, (c - 0.55) / 0.45);
              const fy0 = stance ? gy : gy - Math.sin((c - 0.55) / 0.45 * Math.PI) * 40 * s;
              const knee = [(hip[0] + fx0) / 2 + 40 * s, (hip[1] + fy0) / 2 - 10 * s];
              return [hip, knee, [fx0, fy0]];
            };
            const gph = (x / (W * 0.16));
            const L1 = leg(gph), L2 = leg(gph + 0.5);
            mid.line(L2, { w: 7 }); mid.dot(L2[2][0] + 9, L2[2][1] - 4, 18, { ry: 9 });
            if (RC.coat !== false) front.shape([[hip[0] - 10 * fs, hip[1] + 10], [sho[0] - 30 * fs, sho[1] + 10 * fs], [sho[0] + 18 * fs, sho[1] + 4 * fs], [hip[0] + 30 * fs, hip[1]], [hip[0] - 60 * fs, hip[1] + 40 * fs]], { f: T().col(RC.coat, INK.green), w: 5 });
            front.line([hip, sho, [hc[0] - 10 * fs, hc[1] + 70 * fs]], { w: 7 });
            front.line(L1, { w: 7 }); front.dot(L1[2][0] + 9, L1[2][1] - 4, 18, { ry: 9 });
            front.line([sho, elb, bar], { w: 7 }); front.dot(bar[0], bar[1], 11);
            front.circle(hc[0], hc[1], 72 * fs, { f: INK.paperLight, w: 6 });
            front.shape([[hc[0] - 70 * fs, hc[1]], [hc[0] - 74 * fs, hc[1] - 34 * fs], [hc[0] - 50 * fs, hc[1] - 64 * fs], [hc[0] - 6 * fs, hc[1] - 78 * fs], [hc[0] + 40 * fs, hc[1] - 66 * fs], [hc[0] + 64 * fs, hc[1] - 42 * fs], [hc[0] + 30 * fs, hc[1] - 46 * fs], [hc[0] - 30 * fs, hc[1] - 36 * fs], [hc[0] - 48 * fs, hc[1] - 6 * fs]], { f: INK.inkSoft, w: 5 });
            front.line([[hc[0] - 38 * fs, hc[1] - 26 * fs], [hc[0] - 34 * fs, hc[1] + 20 * fs]], { w: 12 * fs, c: 'soft' });
            front.dot(hc[0] + 18 * fs, hc[1] - 6 * fs, 6.5 * fs); front.dot(hc[0] + 46 * fs, hc[1] - 6 * fs, 6.5 * fs);
            front.line([[hc[0] + 14 * fs, hc[1] - 26 * fs], [hc[0] + 30 * fs, hc[1] - 30 * fs]], { w: 4 }); front.line([[hc[0] + 42 * fs, hc[1] - 30 * fs], [hc[0] + 56 * fs, hc[1] - 26 * fs]], { w: 4 });
            front.line([[hc[0] + 22 * fs, hc[1] + 26 * fs], [hc[0] + 44 * fs, hc[1] + 22 * fs]], { w: 4 });
            // speed lines
            for (let k = 0; k < 3; k++) front.line(vel > 100 ? [[rw[0] - 120 - k * 30, beamY - 60 + k * 50], [rw[0] - 220 - k * 30, beamY - 60 + k * 50]] : null, { w: 4, c: 'soft' });
            // faint dashed modern bicycle
            if (P.bike) {
              const Bk = P.bike, ba = A(Bk.at, dur * 0.7), bp = prog(lt, ba, 0.8), bx = W * (Bk.x ?? 0.84), by = H * (Bk.y ?? 0.5), bs = Bk.s ?? 0.7;
              const dash = (a, b) => { const pts = []; for (let k = 0; k < 6; k++) { const u0 = k / 6, u1 = u0 + 0.09; pts.push([[lerp(a[0], b[0], u0), lerp(a[1], b[1], u0)], [lerp(a[0], b[0], u1), lerp(a[1], b[1], u1)]]); } return pts; };
              const B = (q) => [bx + q[0] * bs, by + q[1] * bs];
              const segs = [[[-110, 40], [0, 40]], [[0, 40], [60, -50]], [[-110, 40], [-40, -50]], [[-40, -50], [60, -50]], [[0, 40], [-40, -50]], [[60, -50], [110, 40]], [[-40, -50], [-50, -80]], [[60, -50], [56, -90]]];
              segs.forEach(([a, b]) => dash(B(a), B(b)).forEach(d => front.line(bp > 0.1 ? d : null, { w: 4, c: 'soft', op: bp })));
              front.circle(bx - 110 * bs, by + 40 * bs, 74 * bs * Math.max(0.01, bp), { w: 4, c: 'soft', op: bp });
              front.circle(bx + 110 * bs, by + 40 * bs, 74 * bs * Math.max(0.01, bp), { w: 4, c: 'soft', op: bp });
            }
          }
          bg.end(); mid.end(); front.end();
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
