// mt_battle: the ag03_battle bird's-eye battlefield (parchment ink, brand/kit/BRAND.md §3, §5) plus a top-down walled
// hill town drawn on the sheet (Mdina, Malta 1565): a boiling ring wall with round towers and crenel ticks, a gate gap,
// rooftops and a church dome inside, and an optional hand label. Every line boils at 8 Hz; pure function of (seed, lt).
// P: {...every ag03_battle param (units, volleys, camp, hills, labels, pill, kasif, cam)...,
//     town: {x: 0.16, y: 0.45 (0..1), r: 130 (px), at: cue|s (springs in), gate: 0 (deg, 0 = right), label: "Mdina"}}
// cues: those of ag03_battle + town.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;

  SH.mt_battle = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const inner = SH.ag03_battle ? SH.ag03_battle.build(ctx) : null;
      const T = Object.assign({ x: 0.16, y: 0.45, r: 130, at: 0, gate: 0 }, P.town || {});
      const S = H > W ? W / 1080 : H / 1080, sd = seed * 1000 + 777;
      const g = el(svg, 'g');
      const ground = inkEl(g, INK.paperDark, { 'fill-opacity': 0.55 }), wallF = inkEl(g, INK.paperLight), wallI = inkEl(g, INK.ink);
      const roofF = inkEl(g, INK.red), roofI = inkEl(g, INK.ink), dome = inkEl(g, INK.paperLight);
      let lab = null;
      if (T.label) {
        lab = el(g, 'text', { 'font-family': INK_FONT, 'font-size': f1(64 * S), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.blue });
        lab.textContent = T.label;
      }
      const r0 = rng(sd + 3), houses = Array.from({ length: 9 }, () => [r0() * 2 - 1, r0() * 2 - 1, r0()]).filter(h => Math.hypot(h[0], h[1]) < 0.75);
      return {
        update(lt, dur, cues, env = {}) {
          if (inner) inner.update(lt, dur, cues, env);
          const t = env.t ?? lt, o = (n, ex = {}) => Object.assign({ seed: sd + n, t, amp: 1.2, w: 5 * S }, ex);
          const a = atOr(cues, T.at, 0), p = lt >= a ? spring(lt, a, 0.6) : 0;
          const cx = T.x * W, cy = T.y * H, R = T.r * S * Math.max(0.01, p);
          if (p <= 0) { [ground, wallF, wallI, roofF, roofI, dome].forEach(e => e.setAttribute('d', '')); if (lab) lab.setAttribute('opacity', 0); return; }
          ground.setAttribute('d', inkLoop(inkEllipsePts(cx, cy, R * 1.45, R * 1.3, sd + 1, 14), o(1)));
          // ring wall as a thick band with a gate gap
          const ga = T.gate * Math.PI / 180, outer = [], innerR = [];
          for (let k = 0; k <= 28; k++) {
            const u = ga + 0.3 + k / 28 * (Math.PI * 2 - 0.6);
            outer.push([cx + Math.cos(u) * R, cy + Math.sin(u) * R * 0.92]);
            innerR.push([cx + Math.cos(u) * R * 0.86, cy + Math.sin(u) * R * 0.86 * 0.92]);
          }
          const band = outer.concat(innerR.slice().reverse());
          wallF.setAttribute('d', inkLoop(band, o(2, { smooth: false, amp: 0.8 })));
          const D = [inkPath(outer, o(3, { w: 6 * S })), inkPath(innerR, o(4, { w: 4 * S }))];
          for (let k = 0; k < 7; k++) {     // round towers
            const u = ga + 0.3 + (k + 0.5) / 7 * (Math.PI * 2 - 0.6), tx = cx + Math.cos(u) * R * 0.94, ty = cy + Math.sin(u) * R * 0.94 * 0.92;
            D.push(inkCircle(tx, ty, R * 0.13, sd + 10 + k, t, { w: 4.5 * S }));
          }
          for (let k = 0; k < 20; k++) {    // crenel ticks
            const u = ga + 0.35 + k / 20 * (Math.PI * 2 - 0.7);
            D.push(inkPath([[cx + Math.cos(u) * R, cy + Math.sin(u) * R * 0.92], [cx + Math.cos(u) * R * 1.07, cy + Math.sin(u) * R * 1.07 * 0.92]], o(30 + k, { w: 3.5 * S })));
          }
          wallI.setAttribute('d', D.join(' '));
          const RF = [], RI = [];
          houses.forEach(([hx, hy, hz], i) => {
            const x = cx + hx * R * 0.7, y = cy + hy * R * 0.65, s = (14 + hz * 10) * S * p;
            const pts = [[x - s, y - s * 0.7], [x + s, y - s * 0.7], [x + s, y + s * 0.7], [x - s, y + s * 0.7]];
            RF.push(inkLoop(pts, o(60 + i, { smooth: false, amp: 0.6 }))); RI.push(inkPath(pts, o(80 + i, { w: 3 * S, smooth: false, closed: true })));
          });
          roofF.setAttribute('d', RF.join(' '));
          dome.setAttribute('d', inkCircle(cx + R * 0.1, cy - R * 0.1, R * 0.2, sd + 99, t, { fill: true }));
          roofI.setAttribute('d', RI.join(' ') + ' ' + inkCircle(cx + R * 0.1, cy - R * 0.1, R * 0.2, sd + 99, t, { w: 4 * S }) +
            ' ' + inkPath([[cx + R * 0.1, cy - R * 0.3], [cx + R * 0.1, cy - R * 0.45]], o(98, { w: 4 * S })));
          if (lab) {
            const b = boil(sd + 7, t, 1.2);
            lab.setAttribute('opacity', clamp01(p * 3).toFixed(3));
            lab.setAttribute('x', f1(cx + b[0])); lab.setAttribute('y', f1(cy - R * 1.32 - 20 * S + b[1]));
          }
        },
      };
    },
  };
})();
