// tank_count: an attrition tally drawn as tank glyphs, parchment ink (BRAND.md §3, §5): N small Mark I silhouettes in
// rows (tracks ticking), a big counter; at each step cue the losers fall out one after another: they tip, go grey,
// get a red cross and a puff of black smoke, and the counter rolls down (49 -> 32 -> 18 at Flers, 1916).
// P: {n: 49, cols: 10, steps: [{to: 32, at: cue, label: "başlangıçta"}, {to: 18, at: cue, label: "savaşta"}],
//     label0: "ayrıldı", area: [0.06, 0.2, 0.66, 0.9] (x0, y0, x1, y1 of the grid), counter: [0.82, 0.42] (x, y),
//     kasif: {...} (optional), source}
// cues: step "at" names, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const GLY = [[-235, 0], [185, 0], [300, -58], [392, -140], [404, -184], [384, -224], [336, -246], [-300, -246], [-366, -226], [-398, -182], [-386, -118], [-322, -48]];
  SH.tank_count = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, sd = seed * 1000 + 127;
      const root = el(svg, 'g');
      const L = (fill, extra) => inkEl(root, fill, extra || {});
      const n = P.n ?? 49, cols = P.cols ?? 7, rows = Math.ceil(n / cols);
      const [ax0, ay0, ax1, ay1] = (P.area || [0.05, 0.2, 0.64, 0.86]).map((v, i) => v * (i % 2 ? H : W));
      const cw = (ax1 - ax0) / cols, ch = (ay1 - ay0) / rows, gs = Math.min(cw / 900, ch / 330);
      const lay = { liveF: L(INK.paperDark), deadF: L(INK.inkSoft, { 'fill-opacity': 0.4 }), ink: L(INK.ink), deadI: L(INK.inkSoft), cross: L(INK.red), smoke: L(INK.inkSoft, { 'fill-opacity': 0.75 }) };
      // which glyph falls at which step: deterministic shuffle
      const order = Array.from({ length: n }, (_, i) => i); const r = rng(sd + 1);
      for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const steps = P.steps || [{ to: 32, at: 1.5 }, { to: 18, at: 3.5 }];
      const fallStep = new Array(n).fill(-1), fallIdx = new Array(n).fill(0);
      let cur = n, pos = 0;
      steps.forEach((s, si) => { const k = cur - s.to; for (let j = 0; j < k; j++) { fallStep[order[pos]] = si; fallIdx[order[pos]] = j; pos++; } cur = s.to; });
      const num = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 300, 'text-anchor': 'middle', fill: INK.ink });
      const sub = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 72, 'text-anchor': 'middle', fill: INK.red });
      const [cx, cy] = (P.counter || [0.82, 0.5]).map((v, i) => v * (i ? H : W));
      const castG = el(root, 'g');
      const cast = B.cast(castG, P.kasif ? [Object.assign({ who: 'kasif', scale: 0.5, y: 0.93, x: 0.9 }, P.kasif)] : [], W, H, sd + 50);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (nm, fb) => B.atOr(cues, nm, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 0.9, w: 3.5 }, extra || {});
          const LF = [], DF = [], IN = [], DI = [], CR = [], SM = [];
          let count = n;
          steps.forEach((s, si) => { const a = at(s.at, 1.5 + si * 2), k = n - (si ? steps[si - 1].to : 0); const prev = si ? steps[si - 1].to : n;
            const lost = prev - s.to, done = Math.min(lost, Math.max(0, Math.floor((lt - a) / 0.05) + 1)); if (lt >= a) count = prev - done; void k; });
          for (let i = 0; i < n; i++) {
            const c = i % cols, rI = Math.floor(i / cols), x = ax0 + cw * (c + 0.5), y = ay0 + ch * (rI + 0.8);
            const pop = spring(lt, 0.05 + i * 0.012, 0.4);
            const si = fallStep[i]; let f = 0;
            if (si >= 0) { const a = at(steps[si].at, 1.5 + si * 2) + fallIdx[i] * 0.05; f = clamp01((lt - a) / 0.35); }
            const tilt = f * 0.5 * (i % 2 ? 1 : -1), roll = lt * 3 + i;
            const pts = GLY.map(p => { const px = p[0] * gs * pop, py = p[1] * gs * pop; return [x + px * Math.cos(tilt) - py * Math.sin(tilt), y + px * Math.sin(tilt) + py * Math.cos(tilt) + f * 8]; });
            const bump = f < 1 ? Math.abs(Math.sin(roll)) * 1.5 : 0;
            const pp = pts.map(p => [p[0], p[1] - bump]);
            if (f > 0) { DF.push(inkLoop(pp, o(i, { smooth: false }))); DI.push(inkPath(pp, o(100 + i, { closed: true, smooth: false }))); }
            else { LF.push(inkLoop(pp, o(i, { smooth: false }))); IN.push(inkPath(pp, o(100 + i, { closed: true, smooth: false })), inkPath([[x - 110 * gs, y - 58 * gs - bump], [x + 70 * gs, y - 58 * gs - bump], [x + 70 * gs, y - 186 * gs - bump], [x - 110 * gs, y - 186 * gs - bump]], o(200 + i, { w: 2.5, closed: true, smooth: false }))); }
            if (f > 0.4) { const k2 = (f - 0.4) / 0.6, R = 70 * gs * 1.6;
              CR.push(inkPath([[x - R * k2, y - 120 * gs - R * k2 * 0.7], [x + R * k2, y - 120 * gs + R * k2 * 0.7]], o(300 + i, { w: 5 })), inkPath([[x + R * k2, y - 120 * gs - R * k2 * 0.7], [x - R * k2, y - 120 * gs + R * k2 * 0.7]], o(400 + i, { w: 5 })));
              const age = (lt * 0.6 + i * 0.13) % 1, sr = (10 + age * 26) * gs * 3; SM.push(inkLoop(inkEllipsePts(x - age * 30, y - 260 * gs - age * 60, sr, sr * 0.8, sd + 500 + i, 8), o(500 + i))); }
          }
          lay.liveF.setAttribute('d', LF.join(' ')); lay.deadF.setAttribute('d', DF.join(' ')); lay.ink.setAttribute('d', IN.join(' '));
          lay.deadI.setAttribute('d', DI.join(' ')); lay.cross.setAttribute('d', CR.join(' ')); lay.smoke.setAttribute('d', SM.join(' '));
          // counter
          let si2 = -1; steps.forEach((s, k) => { if (lt >= at(s.at, 1.5 + k * 2)) si2 = k; });
          const lastA = si2 >= 0 ? at(steps[si2].at, 0) : 0, pk = punch(lt, lastA + 0.2, 0.6), b = boil(sd + 9, t, 1.4);
          num.textContent = fmtNum(count); num.setAttribute('fill', si2 >= 0 ? INK.red : INK.ink);
          num.setAttribute('transform', `translate(${cx + b[0]} ${cy + b[1]}) scale(${(spring(lt, 0.1, 0.5) * (1 + 0.1 * pk)).toFixed(3)})`);
          sub.textContent = si2 >= 0 ? (steps[si2].label || '') : (P.label0 || '');
          sub.setAttribute('transform', `translate(${cx} ${cy + 110}) rotate(-2)`);
          cast.update(lt, t, cues);
        },
      };
    },
  };
})();
