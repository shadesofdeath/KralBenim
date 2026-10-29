// gal_a_tower: Venice, August 1609 (02-galileo-teleskop). Parchment ink, palette tokens only, pure function of (seed, lt).
//   mode "wide": over "set": "coast" (ground ≈ 880): St Mark's campanile (GAL.campanile) draws itself from the ground up,
//     the basilica's domes on its left and the arcaded Doge's palace on its right; a paved quay where the cast walks; the
//     lagoon in the near foreground (moving waves, mooring posts, a gondola) down to the frame bottom.
//   mode "top": "set": false: inside the bell-chamber loggia: brick piers and three big arches open on the lagoon far below
//     (horizon, tiny ships, gulls), a low parapet, a stone floor to the frame bottom, a spyglass on a stand aimed out of
//     the arch; on `reward.at` gold purses drop onto the floor with a "1000 florin" label, on `reward.seal_at` a sealed
//     charter unrolls with its label.
// P: {mode, tower: {x: 0.62, h: 760, build: 0 (cue|sec when it starts drawing; null = standing)}, cast: [GAL.person],
//     kasif, reward: {at, text, seal, seal_at}, labels}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.gal_a_tower = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 91, top = P.mode === 'top';
      const root = el(svg, 'g');
      const back = el(root, 'g');
      const T = Object.assign({ x: 0.62, h: 760 }, P.tower || {});
      const gy = top ? 0.84 * H : 0.815 * H;
      // wide
      const domes = !top ? { f: inkEl(back, mix(INK.paperDark, INK.inkSoft, 0.3)), l: inkEl(back) } : null;
      const tower = !top ? G.campanile(back, sd + 1) : null;
      const pal = !top ? { f: inkEl(back, mix(INK.red, INK.paperLight, 0.62)), a: inkEl(back, mix(INK.inkSoft, INK.paperDark, 0.3)), l: inkEl(back) } : null;
      const quay = inkEl(back, mix(INK.paperDark, INK.inkSoft, 0.2)), quayL = inkEl(back, INK.inkSoft);
      // top
      const view = top ? { sky: inkEl(back, mix(INK.paperLight, INK.blue, 0.2)), sea: inkEl(back, mix(INK.blue, INK.paperDark, 0.4)), wl: inkEl(back, INK.inkSoft), gulls: inkEl(back, INK.ink) } : null;
      const ships = top ? [0, 1, 2].map(i => G.ship(back, sd + 10 + i)) : [];
      const brick = top ? { f: inkEl(back, mix(INK.red, INK.paperDark, 0.5)), l: inkEl(back), t: inkEl(back, INK.ink, { 'fill-opacity': 0.4 }) } : null;
      const para = top ? { f: inkEl(back, mix(INK.paperLight, INK.paperDark, 0.4)), l: inkEl(back) } : null;
      const scope = top ? G.scope(back, sd + 3) : null;
      const castG = el(root, 'g');
      const cast = (P.cast || []).map((m, i) => G.person(castG, Object.assign({ y: top ? 0.9 : gy / H }, m), sd + 20 + i * 7));
      const kas = P.kasif ? G.person(castG, Object.assign({ who: 'kasif', y: top ? 0.9 : gy / H }, P.kasif), sd + 40) : null;
      const fore = el(root, 'g');
      const water = !top ? inkEl(fore, mix(INK.blue, INK.paperDark, 0.42)) : null, waves = !top ? inkEl(fore, INK.paperLight, { 'fill-opacity': 0.8 }) : null;
      const posts = !top ? inkEl(fore, mix(INK.stain, INK.ink, 0.4)) : null, gond = !top ? inkEl(fore, INK.ink) : null, foreL = inkEl(fore);
      const purse = inkEl(fore, INK.gold), purseL = inkEl(fore), charter = inkEl(fore, INK.paperLight), charterL = inkEl(fore), sealF = inkEl(fore, INK.red);
      const R = P.reward || null;
      const rLab = R ? G.label(fore, { text: R.text || '1000 florin', x: 0.62, y: 0.34, at: R.at, size: 90, font: 'serif', box: true }, W, H, sd + 50) : null;
      const sLab = R && R.seal ? G.label(fore, { text: R.seal, x: 0.76, y: 0.5, at: R.seal_at, size: 64, font: 'serif', box: true }, W, H, sd + 51) : null;
      const labels = (P.labels || []).map((l, i) => G.label(root, l, W, H, sd + 60 + i));
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          if (!top) {
            const tx = T.x * W, ba = T.build == null ? null : G.atOr(cues, T.build, 0);
            // basilica domes (left of the tower)
            let df = '', dl = '';
            [[tx - 420, 120], [tx - 260, 150], [tx - 110, 110]].forEach(([x, r], i) => {
              const base = gy - 210, pts = []; for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI; pts.push([x + Math.cos(a) * r * 0.6, base + Math.sin(a) * r * 0.75]); }
              pts.push([x + r * 0.6, base], [x - r * 0.6, base]);
              df += inkLoop(pts, { seed: sd + 70 + i, t, amp: 0.5 }) + ' '; dl += G.ring(pts, sd + 73 + i, t, 4, 0.5) + ' ' + G.line([[x, base - r * 0.75], [x, base - r * 0.75 - 40]], sd + 76 + i, t, 4) + ' ';
            });
            const fac = [[tx - 520, gy], [tx - 520, gy - 210], [tx - 40, gy - 210], [tx - 40, gy]];
            df += inkLoop(fac, { seed: sd + 79, t, amp: 0.5, smooth: false });
            dl += G.ring(fac, sd + 80, t, 4, 0.5);
            for (let i = 0; i < 5; i++) { const x = tx - 500 + i * 92; dl += ' ' + G.line([[x, gy], [x, gy - 110], [x + 40, gy - 150], [x + 80, gy - 110], [x + 80, gy]], sd + 81 + i, t, 3); }
            domes.f.setAttribute('d', df); domes.l.setAttribute('d', dl);
            tower.update(t, { x: tx, gy, h: T.h, w: 130, k: ba == null ? 1 : progIO(lt, ba, 1.8) });
            // Doge's palace (right): two arcades + a pink wall
            const px0 = tx + 130, px1 = W + 60, pf = [[px0, gy], [px0, gy - 330], [px1, gy - 330], [px1, gy]];
            pal.f.setAttribute('d', inkLoop(pf, { seed: sd + 90, t, amp: 0.5, smooth: false }));
            let pa = '', pl = G.ring(pf, sd + 91, t, 4.5, 0.5);
            for (let x = px0 + 20; x < px1 - 40; x += 70) {
              pa += inkLoop([[x, gy], [x, gy - 90], [x + 25, gy - 118], [x + 50, gy - 90], [x + 50, gy]], { seed: sd + 92 + x, t, amp: 0.4, smooth: false }) + ' ';
              pa += inkLoop([[x + 10, gy - 140], [x + 10, gy - 180], [x + 25, gy - 196], [x + 40, gy - 180], [x + 40, gy - 140]], { seed: sd + 93 + x, t, amp: 0.4, smooth: false }) + ' ';
              if ((x / 70 | 0) % 2) pa += inkDot(x + 25, gy - 260, 16, 22, sd + 94 + x, t) + ' ';
            }
            pl += ' ' + G.line([[px0, gy - 130], [px1, gy - 130]], sd + 95, t, 4) + ' ' + G.line([[px0, gy - 205], [px1, gy - 205]], sd + 96, t, 4);
            pal.a.setAttribute('d', pa); pal.l.setAttribute('d', pl);
            // quay
            quay.setAttribute('d', inkLoop([[-40, gy - 6], [W + 40, gy - 6], [W + 40, 0.87 * H], [-40, 0.87 * H]], { seed: sd + 97, t, amp: 0.4, smooth: false }));
            let ql = G.line([[-40, gy - 6], [W + 40, gy - 6]], sd + 98, t, 5) + ' ';
            for (let x = 0; x < W; x += 120) ql += G.line([[x, gy], [x - 30, 0.87 * H]], sd + 99 + x, t, 2) + ' ';
            quayL.setAttribute('d', ql);
          } else {
            // the view through the arches
            const hz = 0.52 * H;
            view.sky.setAttribute('d', inkLoop([[0, 0], [W, 0], [W, hz], [0, hz]], { seed: sd + 100, t, amp: 0.4, smooth: false }));
            view.sea.setAttribute('d', inkLoop([[0, hz], [W, hz], [W, 0.8 * H], [0, 0.8 * H]], { seed: sd + 101, t, amp: 0.4, smooth: false }));
            let wl = G.line([[0, hz], [W, hz]], sd + 102, t, 3) + ' ';
            for (let i = 0; i < 4; i++) { const y = hz + 30 + i * 40, o = (t * 25 + i * 50) % 120; for (let x = -120 + o; x < W; x += 120) wl += G.line([[x, y], [x + 30, y - 6], [x + 60, y]], sd + 103 + i * 20 + Math.floor(x), t, 2) + ' '; }
            view.wl.setAttribute('d', wl);
            ships.forEach((s, i) => s.update(t, (0.2 + i * 0.33) * W + Math.sin(t * 0.2 + i) * 20 + (lt * 6), hz + 6 + i * 8, 0.18 + i * 0.05, i % 2 ? 1 : -1, { flag: i === 1 ? 'red' : 'blue' }));
            let gu = ''; for (let i = 0; i < 4; i++) { const x = (0.3 + i * 0.12) * W + Math.sin(t * 0.7 + i) * 60, y = 0.22 * H + Math.cos(t * 0.9 + i) * 20, f = Math.sin(t * 6 + i) * 10; gu += G.line([[x - 24, y - f], [x, y], [x + 24, y - f]], sd + 110 + i, t, 3.5) + ' '; }
            view.gulls.setAttribute('d', gu);
            // brick piers + arches (an evenodd frame)
            const fr = [[-40, -40], [W + 40, -40], [W + 40, 0.82 * H], [-40, 0.82 * H]];
            let holes = '', bl = '', bt = '';
            for (let i = 0; i < 3; i++) {
              const x0 = (0.07 + i * 0.3) * W, x1 = x0 + 0.26 * W, y0 = 0.2 * H, y1 = 0.82 * H, cx = (x0 + x1) / 2, rr = (x1 - x0) / 2;
              const a = [[x0, y1], [x0, y0 + rr]]; for (let k = 1; k < 10; k++) { const an = Math.PI + k / 10 * Math.PI; a.push([cx + Math.cos(an) * rr, y0 + rr + Math.sin(an) * rr]); } a.push([x1, y0 + rr], [x1, y1]);
              holes += inkLoop(a.slice().reverse(), { seed: sd + 120 + i, t, amp: 0.4, smooth: false }) + ' ';
              bl += G.line(a, sd + 125 + i, t, 6, 0.4) + ' ';
            }
            for (let y = 40; y < 0.82 * H; y += 46) bt += G.line([[-40, y], [W + 40, y + 2]], sd + 130 + y, t, 1.4) + ' ';
            brick.f.setAttribute('d', inkLoop(fr, { seed: sd + 129, t, amp: 0.4, smooth: false }) + ' ' + holes);
            brick.f.setAttribute('fill-rule', 'evenodd');
            brick.l.setAttribute('d', bl); brick.t.setAttribute('d', '');
            // parapet + stone floor
            const py = 0.66 * H;
            para.f.setAttribute('d', inkLoop([[-40, py], [W + 40, py], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 140, t, amp: 0.4, smooth: false }));
            let pl = G.line([[-40, py], [W + 40, py]], sd + 141, t, 6) + ' ' + G.line([[-40, 0.82 * H], [W + 40, 0.82 * H]], sd + 142, t, 5) + ' ';
            for (let k = -8; k <= 8; k++) pl += G.line([[W / 2 + k * 140, 0.82 * H], [W / 2 + k * 300, H + 40]], sd + 143 + k, t, 2.2) + ' ';
            para.l.setAttribute('d', pl);
            scope.update(t, { x: 0.36 * W, y: 0.5 * H, ang: -4 + Math.sin(t * 0.5) * 1.5, len: 420, r: 26, tripod: { gy: 0.9 * H } });
          }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          if (!top) {
            const wy = 0.87 * H;
            water.setAttribute('d', inkLoop([[-40, wy], [W + 40, wy], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 150, t, amp: 0.4, smooth: false }));
            let wv = '';
            for (let i = 0; i < 4; i++) { const y = wy + 24 + i * 34, o = (t * 40 + i * 60) % 180; for (let x = -180 + o; x < W + 40; x += 180) wv += G.line([[x, y], [x + 45, y - 9], [x + 90, y]], sd + 151 + i * 30 + Math.floor(x), t, 4) + ' '; }
            waves.setAttribute('d', wv);
            let po = ''; [0.08, 0.13, 0.86, 0.92].forEach((u, i) => { const x = u * W; po += inkLoop([[x - 14, wy - 120], [x + 14, wy - 120], [x + 16, H + 40], [x - 16, H + 40]], { seed: sd + 160 + i, t, amp: 0.4, smooth: false }) + ' '; });
            posts.setAttribute('d', po);
            const gx = 0.3 * W + Math.sin(t * 0.4) * 30, gyy = wy + 70 + Math.sin(t * 1.3) * 4;
            gond.setAttribute('d', inkLoop([[gx - 260, gyy - 40], [gx - 180, gyy], [gx + 180, gyy], [gx + 270, gyy - 50], [gx + 200, gyy - 14], [gx - 200, gyy - 14]], { seed: sd + 170, t, amp: 0.5 }) + ' ' + G.line([[gx + 150, gyy - 30], [gx + 200, gyy - 170]], sd + 171, t, 5));
            foreL.setAttribute('d', G.line([[-40, wy], [W + 40, wy]], sd + 172, t, 5));
          } else foreL.setAttribute('d', '');
          // reward
          if (R) {
            const ra = G.atOr(cues, R.at, null);
            let pf = '', pl = '';
            if (ra != null && lt >= ra) for (let i = 0; i < 3; i++) {
              const a = ra + i * 0.2, k = clamp01((lt - a) / 0.45), x = (0.56 + i * 0.07) * W, y = lerp(0.2 * H, 0.76 * H, k * k), b = Math.exp(-Math.max(0, lt - a - 0.45) * 6) * Math.sin((lt - a) * 30) * 8;
              if (lt < a) continue;
              const pp = inkEllipsePts(x, y + b, 58, 50, sd + 180 + i, 10);
              pf += inkLoop(pp, { seed: sd + 180 + i, t, amp: 0.6 }) + ' ';
              pl += G.ring(pp, sd + 185 + i, t, 4, 0.6) + ' ' + G.line([[x - 24, y - 44 + b], [x, y - 64 + b], [x + 24, y - 44 + b]], sd + 190 + i, t, 5) + ' ';
            }
            purse.setAttribute('d', pf); purseL.setAttribute('d', pl);
            const sa = G.atOr(cues, R.seal_at, null);
            if (R.seal && sa != null && lt >= sa) {
              const k = progIO(lt, sa, 0.7), x = 0.76 * W, y = 0.66 * H, w = 120, h = 30 + 150 * k;
              const cp = [[x - w, y - h / 2], [x + w, y - h / 2], [x + w, y + h / 2], [x - w, y + h / 2]];
              charter.setAttribute('d', inkLoop(cp, { seed: sd + 200, t, amp: 0.5, smooth: false }));
              charterL.setAttribute('d', G.ring(cp, sd + 201, t, 4, 0.5) + ' ' + G.line([[x - w - 10, y - h / 2], [x + w + 10, y - h / 2]], sd + 202, t, 12) + ' ' + G.line([[x - w - 10, y + h / 2], [x + w + 10, y + h / 2]], sd + 203, t, 12));
              sealF.setAttribute('d', k > 0.6 ? inkDot(x, y + h / 2 - 20, 24, 24, sd + 204, t) : '');
            } else { charter.setAttribute('d', ''); charterL.setAttribute('d', ''); sealF.setAttribute('d', ''); }
            rLab.update(lt, t, cues); if (sLab) sLab.update(lt, t, cues);
          }
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
