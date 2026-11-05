// mar_fair: the 1904 St. Louis World's Fair in parchment ink (Stickstory "1904 Olympic marathon"): a domed exhibition
// palace with colonnade wings on a lagoon, a giant turning observation wheel, waving flags, rippling water and a row of
// visitors' heads (hats, parasols) in the foreground. Set: "city". Uses mar__lib.js (MAR) + td__lib.js (TD.label).
// P: {wheel: {x: 0.8, r: 0.3}, palace: {x: 0.38}, crowd: true, kasif: person spec, labels: [TD.label specs]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mar_fair = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MAR, TD = window.TD, ell = M.ell, f1 = M.f1, sd = seed * 1000 + 377;
      const root = el(svg, 'g');
      const WH = Object.assign({ x: 0.8, r: 0.3 }, P.wheel || {}), PL = Object.assign({ x: 0.38 }, P.palace || {});
      const wheelR = inkEl(root), wheelS = inkEl(root, INK.inkSoft), cars = inkEl(root, INK.red), carsR = inkEl(root);
      const palF = inkEl(root, INK.paperLight), palR = inkEl(root), dome = inkEl(root, INK.gold), domeR = inkEl(root), cols = inkEl(root, INK.inkSoft), flags = inkEl(root, INK.red), poles = inkEl(root);
      const water = inkEl(root, INK.blue, { 'fill-opacity': 0.55 }), ripples = inkEl(root, INK.paperLight);
      const crowdB = inkEl(root, INK.inkSoft), crowdH = inkEl(root, INK.paperLight), crowdR = inkEl(root), hats = inkEl(root, INK.ink), paras = inkEl(root, INK.red);
      const kas = P.kasif ? M.person(root, Object.assign({ x: 0.15, y: 0.86, scale: 0.85, pose: 'point', face: 'right', dir: 30 }, P.kasif, { hat: true }), sd + 90) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 400 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const base = 0.66 * H;
          // observation wheel
          const cx = WH.x * W, R = WH.r * H, cy = base - R - 40;
          let wd = inkCircle(cx, cy, R, sd + 1, t, { w: 6 }) + ' ' + inkCircle(cx, cy, R * 0.92, sd + 2, t, { w: 3 }) + ' ', sp = '', cd = '', cr = '';
          const rot = lt * 0.12;
          for (let k = 0; k < 16; k++) {
            const a = rot + k / 16 * Math.PI * 2, px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
            sp += inkPath([[cx, cy], [px, py]], { w: 2.5, seed: sd + 10 + k, t, amp: 0.5 }) + ' ';
            if (k % 2 === 0) { const cp = [[px - 22, py + 6], [px + 22, py + 6], [px + 20, py + 40], [px - 20, py + 40]]; cd += inkLoop(cp, { seed: sd + 40 + k, t, smooth: false }) + ' '; cr += inkPath(cp, { w: 3, seed: sd + 60 + k, t, closed: true, smooth: false }) + ' '; }
          }
          wd += inkPath([[cx - R * 0.55, base], [cx, cy], [cx + R * 0.55, base]], { w: 8, seed: sd + 3, t }) + ' ' + inkDot(cx, cy, 16, 16, sd + 4, t);
          wheelR.setAttribute('d', wd); wheelS.setAttribute('d', sp); cars.setAttribute('d', cd); carsR.setAttribute('d', cr);
          // palace: domed centre + colonnade wings
          const px = PL.x * W, pw = 0.62 * W, top = base - 0.22 * H;
          const body = [[px - pw / 2, base], [px - pw / 2, top], [px + pw / 2, top], [px + pw / 2, base]];
          const centre = [[px - 150, top], [px - 150, top - 90], [px + 150, top - 90], [px + 150, top]];
          palF.setAttribute('d', inkLoop(body, { seed: sd + 5, t, smooth: false }) + ' ' + inkLoop(centre, { seed: sd + 6, t, smooth: false }));
          palR.setAttribute('d', inkPath(body, { w: 5, seed: sd + 7, t, closed: true, smooth: false }) + ' ' + inkPath(centre, { w: 5, seed: sd + 8, t, closed: true, smooth: false }) + ' ' + inkPath([[px - pw / 2 - 20, top], [px + pw / 2 + 20, top]], { w: 8, seed: sd + 9, t }));
          const dp = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + k / 12 * Math.PI; dp.push([px + Math.cos(a) * 140, top - 90 + Math.sin(a) * 150]); }
          dome.setAttribute('d', inkLoop(dp, { seed: sd + 20, t })); domeR.setAttribute('d', inkPath(dp, { w: 5, seed: sd + 21, t, closed: true }) + ' ' + inkPath([[px, top - 240], [px, top - 300]], { w: 5, seed: sd + 22, t }));
          let cl = ''; for (let x = px - pw / 2 + 30; x < px + pw / 2 - 10; x += 52) cl += inkPath([[x, top + 14], [x, base - 6]], { w: 7, seed: sd + 100 + Math.round(x), t }) + ' ';
          cols.setAttribute('d', cl);
          let fd = '', pd = '';
          for (const fx of [px - pw / 2 + 20, px - 150, px + 150, px + pw / 2 - 20, px]) {
            const fy = fx === px ? top - 300 : (Math.abs(fx - px) < 200 ? top - 90 : top), w = Math.sin(t * 3 + fx) * 8;
            pd += inkPath([[fx, fy], [fx, fy - 70]], { w: 4, seed: sd + 200 + Math.round(fx), t }) + ' ';
            fd += inkLoop([[fx, fy - 70], [fx + 50, fy - 62 + w], [fx, fy - 44]], { seed: sd + 300 + Math.round(fx), t, smooth: false, amp: 0.6 }) + ' ';
          }
          flags.setAttribute('d', fd); poles.setAttribute('d', pd);
          // lagoon
          const wp = [[-20, base], [W + 20, base], [W + 20, base + 0.1 * H], [-20, base + 0.1 * H]];
          water.setAttribute('d', inkLoop(wp, { seed: sd + 30, t, smooth: false }));
          let rd = ''; for (let k = 0; k < 9; k++) { const x = ((k * 230 + lt * 50) % (W + 200)) - 100, y = base + 20 + (k % 3) * 26; rd += inkPath([[x, y], [x + 50, y - 4], [x + 100, y]], { w: 4, seed: sd + 400 + k, t }) + ' '; }
          ripples.setAttribute('d', rd);
          // visitors in front
          if (P.crowd !== false) {
            let b = '', h = '', r = '', ht = '', pa = ''; const Rn = rng(sd + 9), y0 = 0.86 * H;
            for (let k = 0; k < 22; k++) {
              const x = 40 + k * (W - 80) / 21 + (Rn() - 0.5) * 30, bob = Math.sin(lt * 3 + k) * 4, y = y0 + (k % 2) * 30 + bob, hr = 30 + Rn() * 8;
              b += inkLoop([[x - 40, y + 140], [x - 34, y + 34], [x + 34, y + 34], [x + 40, y + 140]], { seed: sd + 500 + k, t, smooth: false }) + ' ';
              h += inkDot(x, y, hr, hr, sd + 600 + k, t) + ' '; r += inkCircle(x, y, hr, sd + 700 + k, t, { w: 3 }) + ' ';
              const kind = Rn();
              if (kind < 0.45) ht += inkLoop([[x - hr - 12, y - hr * 0.5], [x + hr + 12, y - hr * 0.5], [x + hr * 0.6, y - hr * 0.7], [x + hr * 0.55, y - hr * 1.4], [x - hr * 0.55, y - hr * 1.4], [x - hr * 0.6, y - hr * 0.7]], { seed: sd + 800 + k, t, amp: 0.6 }) + ' ';
              else if (kind < 0.62) { const pp = []; for (let q = 0; q <= 8; q++) { const a = Math.PI + q / 8 * Math.PI; pp.push([x + 30 + Math.cos(a) * 70, y - 90 + Math.sin(a) * 40]); } pa += inkLoop(pp, { seed: sd + 900 + k, t }) + ' '; r += inkPath([[x + 30, y - 90], [x + 30, y + 20]], { w: 3, seed: sd + 950 + k, t }) + ' '; }
            }
            crowdB.setAttribute('d', b); crowdH.setAttribute('d', h); crowdR.setAttribute('d', r); hats.setAttribute('d', ht); paras.setAttribute('d', pa);
          }
          if (kas) kas.update(lt, t, cues, W, H, {});
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
