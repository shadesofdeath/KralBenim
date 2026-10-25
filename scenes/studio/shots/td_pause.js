// td_pause: "life on pause" — a dried tardigrade tun sits in the middle, a heart-monitor frame above it shows a beating
// trace that flattens into rare tiny blips, and the narrator presses a big red pause button on a cue (button sinks,
// a "PAUSED" box stamps in). Stickstory 2026-10-25 tardigrades Short, parametric (any dormancy / hibernation idea).
// Uses td__lib.js (window.TD). BRAND.md §3/§5: palette tokens only, boil 8 Hz, pure function of (seed, lt).
// P: {bear: {x: 0.4, y: 0.6 (ground), s: 0.9, dry: 1}, monitor: {y: 0.25, h: 0.13}, button: {x: 0.66, y: 0.47, r: 82},
//     pause: cue|sec (press; the trace flattens), label: {text: "PAUSED", ...TD.label}, kasif: K}
// cues: hit, pause, label/seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.td_pause = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 631;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const M = Object.assign({ y: 0.25, h: 0.13 }, P.monitor || {});
      const monF = inkEl(cam, INK.paperLight), monR = inkEl(cam), grid = inkEl(cam, INK.paperDark), trace = inkEl(cam, INK.red), heart = inkEl(cam, INK.red), heartR = inkEl(cam);
      const ground = inkEl(cam, INK.inkSoft), shadow = inkEl(cam, INK.paperDark);
      const B = Object.assign({ x: 0.4, y: 0.6, s: 0.9, dry: 1 }, P.bear || {});
      const bear = TD.bear(el(cam, 'g'), sd + 5);
      const zz = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 70, fill: INK.inkSoft, 'text-anchor': 'middle' }); zz.textContent = 'z';
      const BT = Object.assign({ x: 0.66, y: 0.47, r: 82 }, P.button || {});
      const baseF = inkEl(cam, INK.hatBand), btnF = inkEl(cam, INK.red), btnR = inkEl(cam), bars = inkEl(cam, INK.paperLight);
      const LB = P.label ? Object.assign({ text: 'PAUSED', x: 0.42, y: 0.4, size: 96, box: true, font: 'serif', color: 'blue', at: P.pause }, P.label) : null;
      const label = LB ? TD.label(cam, LB, W, H, sd + 40) : null;
      const kas = P.kasif === false ? null : TD.figure(el(root, 'g'), Object.assign({ x: 0.86, y: 0.6, scale: 0.8, pose: 'point', face: 'left', dir: 15 }, P.kasif || {}), sd + 6);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const pa = atOr(cues, P.pause, dur * 0.45), off = lt >= pa ? progIO(lt, pa, 1.2) : 0, press = punch(lt, pa, 0.5);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = W * 0.5, fy = H * 0.45;
          cam.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // monitor + trace (beats every 0.7 s, after the press only a tiny blip every ~2.5 s)
          const x0 = W * 0.1, x1 = W * 0.9, y0 = M.y * H - M.h * H / 2, y1 = y0 + M.h * H, ym = (y0 + y1) / 2;
          const box = [[x0, y0], [x1, y0 - 4], [x1 + 3, y1], [x0 - 2, y1 + 3]];
          monF.setAttribute('d', inkLoop(box, { seed: sd + 1, t, smooth: false }));
          monR.setAttribute('d', inkPath(box, { w: 6, seed: sd + 2, t, closed: true, smooth: false }));
          let gd = '';
          for (let k = 1; k < 6; k++) gd += inkPath([[lerp(x0, x1, k / 6), y0 + 8], [lerp(x0, x1, k / 6), y1 - 8]], { w: 3, seed: sd + 10 + k, t, amp: 0.6 }) + ' ';
          grid.setAttribute('d', gd);
          const pts = [], n = 70, speed = 260;
          for (let i = 0; i <= n; i++) {
            const x = lerp(x0 + 20, x1 - 20, i / n), tt = lt - (x1 - 20 - x) / speed;     // time at that point of the trace
            const after = tt >= pa ? progIO(tt, pa, 1.2) : 0;
            const per = lerp(0.7, 2.6, after), ph = ((tt % per) + per) % per;
            const amp = lerp(1, 0.12, after) * M.h * H * 0.38;
            let y = 0;
            if (ph < 0.05) y = -amp * ph / 0.05; else if (ph < 0.1) y = -amp + amp * 1.6 * (ph - 0.05) / 0.05; else if (ph < 0.15) y = amp * 0.6 * (1 - (ph - 0.1) / 0.05);
            pts.push([x, ym + y]);
          }
          trace.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 20, t, amp: 0.8, smooth: false, taper: 0.1 }));
          // heart icon (left of the monitor) beats, then slows down
          const per = lerp(0.7, 2.6, off), hb = 1 + 0.12 * Math.exp(-((lt % per) / 0.12));
          const hx = x0 + 60, hy = y0 - 46, hs = 26 * hb, hp = [];
          for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; hp.push([hx + hs * 16 * Math.pow(Math.sin(a), 3) / 16, hy - hs * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); }
          heart.setAttribute('d', inkLoop(hp, { seed: sd + 21, t, amp: 0.8 }));
          heartR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 22, t, closed: true, amp: 0.8 }));
          // ground + tun
          const gy = B.y * H;
          ground.setAttribute('d', inkPath([[W * 0.05, gy + 4], [W * 0.95, gy]], { w: 5, seed: sd + 30, t }));
          shadow.setAttribute('d', inkLoop(TD.ell(B.x * W, gy + 6, 170 * B.s, 16, 12), { seed: sd + 31, t, amp: 0.8 }));
          const breathe = 1 + 0.03 * (1 - off) * Math.sin(lt * 5);
          bear.update(t, { x: B.x * W, y: gy, s: B.s * breathe, dry: B.dry, rot: 0 });
          const zt = (lt * 0.6) % 1;
          zz.setAttribute('x', f1(B.x * W + 120 + zt * 40)); zz.setAttribute('y', f1(gy - 230 * B.s - zt * 90));
          zz.setAttribute('opacity', (off * (1 - zt)).toFixed(3));
          // pause button
          const bx = BT.x * W, by = BT.y * H, r = BT.r, sink = 10 * press;
          baseF.setAttribute('d', inkLoop(TD.ell(bx, by + 26, r * 1.12, r * 0.55, 14), { seed: sd + 50, t }));
          const cp = TD.ell(bx, by + sink, r, r * 0.8, 16);
          btnF.setAttribute('d', inkLoop(cp, { seed: sd + 51, t }));
          btnR.setAttribute('d', inkPath(cp, { w: 6, seed: sd + 52, t, closed: true }) + ' ' + inkPath(TD.ell(bx, by + 26, r * 1.12, r * 0.55, 14), { w: 5, seed: sd + 53, t, closed: true }));
          const bw = r * 0.18, bh = r * 0.8;
          bars.setAttribute('d', [-1, 1].map((s, k) => inkLoop([[bx + s * r * 0.26 - bw, by + sink - bh / 2], [bx + s * r * 0.26 + bw, by + sink - bh / 2], [bx + s * r * 0.26 + bw, by + sink + bh / 2], [bx + s * r * 0.26 - bw, by + sink + bh / 2]], { seed: sd + 54 + k, t, smooth: false, amp: 0.8 })).join(' '));
          if (label) label.update(lt, t, cues);
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
