// moon_press: an 1830s cylinder printing press at full speed (Stickstory ag-14, Great Moon Hoax). A belt from the
// overhead line shaft turns the flywheel, the crank drives the type bed back and forth under the big impression
// cylinder, a sheet slides down the feed board every cycle and a printed sheet flies onto the delivery stack, which
// grows. Optional bundles of tied papers pop up beside it. Set: "interior". Parchment ink style, palette tokens only.
// P: {x: 0.5 (press centre), ground: 0.86, period: 1.2 (s per sheet), at: cue|sec (press starts; before it, still),
//     stack: {x: 0.17, max: 26, start: 3 (sheets at lt = 0)}, bundles: {n: 5, x: 0.86, at, text: "THE SUN"}, pressman: K (MOON.K, hat: false),
//     kasif: K, labels: [{text, x, y, at, color, arrow}]}
// cues: whatever "at"s reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const TAU = Math.PI * 2;
  const FR = 'Fraunces, Georgia, serif';

  SH.moon_press = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const gy = (P.ground ?? 0.86) * H, cx = (P.x ?? 0.5) * W;
      const L = MOON.line;
      const root = el(svg, 'g');
      const floor = inkEl(root), boards = inkEl(root, INK.inkSoft);
      const shaft = inkEl(root), belt = inkEl(root, INK.inkSoft);
      const frameF = inkEl(root, INK.paperDark), frameR = inkEl(root);
      const bedF = inkEl(root, mix(INK.inkSoft, INK.paperDark, 0.5)), bedR = inkEl(root);
      const cylF = inkEl(root, INK.paperLight), cylR = inkEl(root);
      const rollF = inkEl(root, INK.ink);
      const flyR = inkEl(root), crank = inkEl(root);
      const feedF = inkEl(root, INK.paperLight), feedR = inkEl(root);
      const sheetF = inkEl(root, INK.paperLight), sheetR = inkEl(root);
      const stackF = inkEl(root, INK.paperLight), stackR = inkEl(root), tableR = inkEl(root);
      const flyF = inkEl(root, INK.paperLight), flyRr = inkEl(root);
      const bundles = P.bundles ? Array.from({ length: P.bundles.n ?? 5 }, () => ({ f: inkEl(root, INK.paperLight), r: inkEl(root), s: inkEl(root, INK.red) })) : [];
      const bundleTx = P.bundles ? el(root, 'g') : null;
      const btx = bundles.map(() => { const tx = el(bundleTx, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 46, 'text-anchor': 'middle', fill: INK.ink }); tx.textContent = P.bundles.text ?? 'THE SUN'; return tx; });
      const castG = el(root, 'g');
      const cast = [P.pressman, P.kasif].concat(P.cast || []).filter(Boolean).map((c, i) => MOON.K(el(castG, 'g'), c, seed * 3 + i * 7 + 1));
      const labels = (P.labels || []).map((l, i) => MOON.label(el(root, 'g'), l, W, H, seed * 41 + i * 7));
      const ST = Object.assign({ x: 0.17, max: 26 }, P.stack || {});
      const cyl = [cx - 40, gy - 330], R = 112, fly = [cx + 330, gy - 250], FR_ = 175;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const a0 = MOON.at(cues, P.at, 0), per = P.period ?? 1.2;
          const run = Math.max(0, lt - a0), cyc = run / per, ph = cyc % 1, ang = cyc * TAU;
          // floor planks
          floor.setAttribute('d', L([[-40, gy], [W + 40, gy + 4]], seed, t, 6, 1.2, 0.05));
          let bd = ''; for (let i = 0; i < 14; i++) { const x = i * W / 13 - 60; bd += L([[x, gy + 14], [x - 80, H + 20]], seed + 10 + i, t, 2.5) + ' '; }
          boards.setAttribute('d', bd);
          // line shaft + belt (moving dashes)
          const sh = [cx + 330, 120];
          shaft.setAttribute('d', L([[cx - 260, sh[1]], [W + 40, sh[1]]], seed + 30, t, 9, 1, 0.05) + ' ' + inkCircle(sh[0], sh[1], 40, seed + 31, t, { w: 6 }) +
            ' ' + L([[cx - 200, sh[1]], [cx - 200, 40]], seed + 32, t, 5) + ' ' + L([[cx + 600, sh[1]], [cx + 600, 40]], seed + 33, t, 5));
          let bl = '';
          for (const side of [-1, 1]) {
            const x0 = sh[0] + side * 40, x1 = fly[0] + side * 60;
            for (let i = 0; i < 9; i++) { const q = ((i / 9 + cyc * 0.5 * side) % 1 + 1) % 1, q2 = Math.min(1, q + 0.06); bl += L([[lerp(x0, x1, q), lerp(sh[1], fly[1], q)], [lerp(x0, x1, q2), lerp(sh[1], fly[1], q2)]], seed + 40 + i + side * 20, t, 6) + ' '; }
            bl += L([[x0, sh[1]], [x1, fly[1]]], seed + 70 + side, t, 2) + ' ';
          }
          belt.setAttribute('d', bl);
          // side frame
          const fr = [[cx - 300, gy], [cx - 250, gy - 300], [cx - 120, gy - 470], [cx + 60, gy - 470], [cx + 180, gy - 300], [cx + 240, gy], [cx + 150, gy], [cx + 90, gy - 220], [cx - 160, gy - 220], [cx - 210, gy]];
          frameF.setAttribute('d', inkLoop(fr, { seed: seed + 80, t, amp: 1, smooth: false }));
          frameR.setAttribute('d', inkPath(fr, { w: 6, seed: seed + 81, t, amp: 1, closed: true, smooth: false }) + ' ' + inkCircle(cx - 40, gy - 120, 26, seed + 82, t, { w: 5 }));
          // type bed slides under the cylinder
          const bx = cx - 40 + Math.sin(ang) * 90, by = gy - 216;
          const bed = [[bx - 210, by - 22], [bx + 210, by - 22], [bx + 210, by + 10], [bx - 210, by + 10]];
          bedF.setAttribute('d', inkLoop(bed, { seed: seed + 90, t, amp: 0.8, smooth: false }));
          let br = inkPath(bed, { w: 5, seed: seed + 91, t, amp: 0.8, closed: true, smooth: false }) + ' ';
          for (let i = 0; i < 7; i++) br += L([[bx - 180 + i * 60, by - 14], [bx - 150 + i * 60, by - 14]], seed + 92 + i, t, 3) + ' ';
          bedR.setAttribute('d', br);
          // impression cylinder with spokes
          cylF.setAttribute('d', inkCircle(cyl[0], cyl[1], R, seed + 100, t, { fill: true }));
          let cr = inkCircle(cyl[0], cyl[1], R, seed + 101, t, { w: 7 }) + ' ' + inkCircle(cyl[0], cyl[1], 22, seed + 102, t, { w: 5 }) + ' ';
          for (let i = 0; i < 6; i++) { const a = ang + i / 6 * TAU; cr += L([[cyl[0] + Math.cos(a) * 24, cyl[1] + Math.sin(a) * 24], [cyl[0] + Math.cos(a) * (R - 10), cyl[1] + Math.sin(a) * (R - 10)]], seed + 103 + i, t, 4) + ' '; }
          cylR.setAttribute('d', cr);
          // ink rollers
          let rl = '';
          for (let i = 0; i < 3; i++) { const rx = cx + 130 + i * 52, ry = gy - 262; rl += inkCircle(rx, ry, 20, seed + 110 + i, t, { fill: true }) + ' '; }
          rollF.setAttribute('d', rl);
          // flywheel + crank rod to the bed
          let fw = inkCircle(fly[0], fly[1], FR_, seed + 120, t, { w: 8 }) + ' ' + inkCircle(fly[0], fly[1], FR_ - 18, seed + 121, t, { w: 3 }) + ' ' + inkCircle(fly[0], fly[1], 24, seed + 122, t, { w: 6 }) + ' ';
          for (let i = 0; i < 8; i++) { const a = ang + i / 8 * TAU; fw += L([[fly[0] + Math.cos(a) * 26, fly[1] + Math.sin(a) * 26], [fly[0] + Math.cos(a) * (FR_ - 16), fly[1] + Math.sin(a) * (FR_ - 16)]], seed + 123 + i, t, 5) + ' '; }
          fw += L([[fly[0] - 60, gy], [fly[0], fly[1]], [fly[0] + 60, gy]], seed + 140, t, 9, 1, 0.05);
          flyR.setAttribute('d', fw);
          const cp = [fly[0] + Math.cos(ang) * 90, fly[1] + Math.sin(ang) * 90];
          crank.setAttribute('d', L([cp, [bx + 210, by - 6]], seed + 141, t, 8) + ' ' + inkDot(cp[0], cp[1], 12, 12, seed + 142, t));
          // feed board (top right of cylinder) and the sheet sliding down it
          const fb = [[cyl[0] + 60, cyl[1] - 120], [cyl[0] + 330, cyl[1] - 230], [cyl[0] + 345, cyl[1] - 205], [cyl[0] + 75, cyl[1] - 95]];
          feedF.setAttribute('d', inkLoop(fb, { seed: seed + 150, t, amp: 0.8, smooth: false }));
          feedR.setAttribute('d', inkPath(fb, { w: 5, seed: seed + 151, t, amp: 0.8, closed: true, smooth: false }) + ' ' + L([[cyl[0] + 330, cyl[1] - 218], [cyl[0] + 330, gy - 230]], seed + 152, t, 5));
          const running = lt >= a0;
          const sq = running ? Math.min(1, ph / 0.55) : 0;
          const sp = [lerp(cyl[0] + 300, cyl[0] + 90, sq), lerp(cyl[1] - 210, cyl[1] - 112, sq)];
          const sht = [[sp[0] - 70, sp[1] + 10], [sp[0] + 60, sp[1] - 46], [sp[0] + 76, sp[1] - 20], [sp[0] - 54, sp[1] + 36]];
          sheetF.setAttribute('d', running && ph < 0.6 ? inkLoop(sht, { seed: seed + 160, t, amp: 0.6, smooth: false }) : '');
          sheetR.setAttribute('d', running && ph < 0.6 ? inkPath(sht, { w: 3.5, seed: seed + 161, t, amp: 0.6, closed: true, smooth: false }) : '');
          // delivery: printed sheet flies left onto the stack
          const sx = ST.x * W, n = Math.min(ST.max, (ST.start ?? 3) + Math.floor(cyc)), top = gy - 150 - n * 5;
          const tb = [[sx - 150, gy - 150], [sx + 150, gy - 150]];
          tableR.setAttribute('d', L(tb, seed + 170, t, 8, 1, 0.05) + ' ' + L([[sx - 130, gy - 150], [sx - 130, gy]], seed + 171, t, 7) + ' ' + L([[sx + 130, gy - 150], [sx + 130, gy]], seed + 172, t, 7));
          const stk = [[sx - 120, gy - 150], [sx - 124, top], [sx + 122, top - 2], [sx + 120, gy - 150]];
          stackF.setAttribute('d', inkLoop(stk, { seed: seed + 173, t, amp: 0.6, smooth: false }));
          let sk = inkPath(stk, { w: 4, seed: seed + 174, t, amp: 0.6, closed: true, smooth: false }) + ' ';
          for (let i = 1; i < n; i += 2) sk += L([[sx - 118, gy - 150 - i * 5], [sx + 118, gy - 150 - i * 5]], seed + 175 + i, t, 1.5, 0.4) + ' ';
          stackR.setAttribute('d', sk);
          if (running && ph >= 0.45) {
            const q = progIO(ph, 0.45, 0.55), fx = lerp(cyl[0] - 100, sx, q), fy = lerp(cyl[1] + 40, top - 6, q) - Math.sin(q * Math.PI) * 120, rot = lerp(-30, 0, q) * Math.PI / 180;
            const c = Math.cos(rot), s = Math.sin(rot), T = p => [fx + p[0] * c - p[1] * s, fy + p[0] * s + p[1] * c];
            const fs = [[-120, -8], [120, -8], [120, 8], [-120, 8]].map(T);
            flyF.setAttribute('d', inkLoop(fs, { seed: seed + 180, t, amp: 0.6, smooth: false }));
            flyRr.setAttribute('d', inkPath(fs, { w: 3.5, seed: seed + 181, t, amp: 0.6, closed: true, smooth: false }));
          } else { flyF.setAttribute('d', ''); flyRr.setAttribute('d', ''); }
          // bundles of tied papers
          if (P.bundles) {
            const ba = MOON.at(cues, P.bundles.at, 0.5), bx0 = (P.bundles.x ?? 0.86) * W;
            bundles.forEach((b, i) => {
              const p = spring(lt, ba + i * 0.22, 0.6), row = i % 2, col = Math.floor(i / 2);
              const w = 220 * p, h = 74 * p, x = bx0 + (row ? 118 : -118) + (col % 2 ? 12 : 0), y = gy - col * 80 - h;
              const q = [[x - w / 2, y], [x + w / 2, y], [x + w / 2, y + h], [x - w / 2, y + h]];
              b.f.setAttribute('d', p > 0.02 ? inkLoop(q, { seed: seed + 200 + i, t, amp: 0.8, smooth: false }) : '');
              b.r.setAttribute('d', p > 0.02 ? inkPath(q, { w: 4, seed: seed + 210 + i, t, amp: 0.8, closed: true, smooth: false }) : '');
              b.s.setAttribute('d', p > 0.02 ? L([[x - w * 0.25, y - 2], [x - w * 0.25, y + h + 2]], seed + 220 + i, t, 5) + ' ' + L([[x + w * 0.25, y - 2], [x + w * 0.25, y + h + 2]], seed + 230 + i, t, 5) : '');
              btx[i].setAttribute('x', x); btx[i].setAttribute('y', y + h * 0.66); btx[i].setAttribute('font-size', Math.max(1, 46 * p));
              btx[i].style.visibility = p > 0.3 ? 'visible' : 'hidden';
            });
          }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
