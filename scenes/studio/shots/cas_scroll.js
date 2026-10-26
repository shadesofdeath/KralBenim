// cas_scroll: an old Japanese hand-written record unrolling on a low wooden desk (brand/kit/BRAND.md §3, §5): two
// wooden rollers, the paper, columns of brush characters (abstract brush clusters, read right to left) that appear
// column by column as the scroll opens, a brush vignette of a wave at the top of one column, a red circle drawn round
// the entry about the wave, an optional red seal stamp that slams down. Optional host (Kaşif) beside the desk.
// The desk top is P.floor (the room comes from the scene's "set").
// Uses cas__lib.js (CAS) + td__lib.js (TD: label, figure).
// P: {floor: 0.6, area: {x0: 0.06, x1: 0.94, y0: 0.2}, cols: 9, open: {at: 0, dur: 1.6}, mark: {col: 3, at: cue|sec} |
//     false, vignette: 3 (column index with a little wave drawing) | false,
//     stamp: {text: "1700", at: cue|sec, x: 0.2, y: 0.5 (inside area, 0..1)} | false, kasif: K | false, labels: [...]}
// cues: hit (punch), plus names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.cas_scroll = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const CAS = window.CAS, TD = window.TD, atOr = CAS.atOr, f1 = CAS.f1, sd = seed * 1000 + 733;
      const FL = (P.floor ?? 0.6) * H, A = Object.assign({ x0: 0.06, x1: 0.94, y0: 0.2 }, P.area || {});
      const X0 = A.x0 * W, X1 = A.x1 * W, Y0 = A.y0 * H, Y1 = FL - 70;
      const NC = P.cols ?? 9;
      // characters: per column a list of glyphs, each a few brush strokes in a unit box (fixed per seed)
      const r = rng(sd), glyphs = [];
      for (let c = 0; c < NC; c++) {
        const col = [], n = 5 + Math.floor(r() * 3);
        for (let k = 0; k < n; k++) {
          const strokes = [], m = 3 + Math.floor(r() * 3);
          for (let j = 0; j < m; j++) {
            const kind = r();
            if (kind < 0.4) { const y = r(); strokes.push([[0.1 + r() * 0.2, y], [0.6 + r() * 0.3, y + (r() - 0.5) * 0.1]]); }
            else if (kind < 0.75) { const x = 0.2 + r() * 0.6; strokes.push([[x, 0.05 + r() * 0.2], [x + (r() - 0.5) * 0.1, 0.6 + r() * 0.35]]); }
            else { const x = 0.3 + r() * 0.4, y = 0.2 + r() * 0.4; strokes.push([[x, y], [x + (r() > 0.5 ? 0.3 : -0.3), y + 0.35]]); }
          }
          col.push(strokes);
        }
        glyphs.push(col);
      }
      const root = el(svg, 'g');
      const deskF = inkEl(root, INK.hatBand, { 'fill-opacity': 0.6 }), deskR = inkEl(root), deskG = inkEl(root, INK.inkSoft);
      const paperF = inkEl(root, INK.paperLight), paperS = inkEl(root, INK.stain, { 'fill-opacity': 0.25 }), paperR = inkEl(root);
      const text = inkEl(root), vig = inkEl(root, INK.blue, { 'fill-opacity': 0.5 }), vigR = inkEl(root);
      const rollL = inkEl(root, INK.hatBand), rollR = inkEl(root, INK.hatBand), rollE = inkEl(root);
      const mark = inkEl(root, INK.red), stampF = inkEl(root, INK.red, { 'fill-opacity': 0.88 }), stampR = inkEl(root, INK.red);
      const st = P.stamp ? el(root, 'text', { 'font-family': "'Zilla Slab', Fraunces, Georgia, serif", 'font-weight': 700, 'font-size': 92, 'text-anchor': 'middle', fill: INK.paperLight }) : null;
      if (st) st.textContent = P.stamp.text || '';
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.85, y: P.floor ?? 0.6, scale: 0.7, pose: 'point', face: 'left' }, P.kasif), sd + 60) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 90 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          // desk
          const desk = [[-20, FL - 30], [W + 20, FL - 30], [W + 20, FL + 40], [-20, FL + 40]];
          deskF.setAttribute('d', inkLoop(desk, { seed: sd + 1, t, smooth: false }));
          deskR.setAttribute('d', inkPath([[-20, FL - 30], [W + 20, FL - 28]], { w: 7, seed: sd + 2, t }) + ' ' + inkPath([[-20, FL + 40], [W + 20, FL + 42]], { w: 7, seed: sd + 3, t }) + ' ' +
            [0.1, 0.9].map((x, k) => inkPath([[x * W, FL + 40], [x * W, FL + 230]], { w: 14, seed: sd + 4 + k, t })).join(' '));
          let gr = ''; for (let k = 0; k < 4; k++) gr += inkPath([[k * W / 4 + 30, FL - 8 + k * 9], [k * W / 4 + 200, FL - 4 + k * 9]], { w: 2.6, seed: sd + 8 + k, t, amp: 1 }) + ' ';
          deskG.setAttribute('d', gr);
          // unrolling: the left roller travels from the right roller to X0
          const O = P.open || {}, oa = atOr(cues, O.at, 0), op = prog(lt, oa, O.dur ?? 1.6);
          const xl = lerp(X1 - 60, X0, op), sag = 6;
          const paper = [[xl, Y0 + 10], [X1, Y0], [X1, Y1], [xl, Y1 + sag]];
          paperF.setAttribute('d', inkLoop(paper, { seed: sd + 20, t, smooth: false }));
          paperS.setAttribute('d', op > 0.3 ? inkCircle(lerp(X1, xl, 0.7), lerp(Y0, Y1, 0.75), 70, sd + 21, t, { fill: true, ry: 40 }) : '');
          paperR.setAttribute('d', inkPath([[xl, Y0 + 10], [X1, Y0]], { w: 4, seed: sd + 22, t }) + ' ' + inkPath([[xl, Y1 + sag], [X1, Y1]], { w: 4, seed: sd + 23, t }));
          const roller = (x, sdd) => [[x - 22, Y0 - 34], [x + 22, Y0 - 34], [x + 22, Y1 + 34], [x - 22, Y1 + 34]];
          rollL.setAttribute('d', inkLoop(roller(xl, 1), { seed: sd + 24, t, smooth: false }));
          rollR.setAttribute('d', inkLoop(roller(X1, 2), { seed: sd + 25, t, smooth: false }));
          rollE.setAttribute('d', inkPath(roller(xl), { w: 6, seed: sd + 26, t, closed: true, smooth: false }) + ' ' + inkPath(roller(X1), { w: 6, seed: sd + 27, t, closed: true, smooth: false }) + ' ' +
            [xl, X1].map((x, k) => inkPath([[x - 22, Y0 - 10 + k * 3], [x + 22, Y0 - 12]], { w: 3, seed: sd + 28 + k, t, amp: 0.6 })).join(' '));
          // columns, right to left
          const cw = (X1 - X0 - 80) / NC, gh = Math.min(cw * 0.78, (Y1 - Y0 - 60) / 7.2);
          let tx = '', vg = '', vgr = '';
          for (let c = 0; c < NC; c++) {
            const cx = X1 - 40 - (c + 0.5) * cw;
            if (cx < xl + 30) continue;
            const vis = clamp01((X1 - 40 - cx) / Math.max(1, X1 - xl) * 0 + 1);
            const col = glyphs[c];
            const hasVig = P.vignette === c;
            let y = Y0 + 40;
            if (hasVig) {   // a little brush wave drawing above the text
              const vx = cx, vy = y + gh * 0.8, R = gh * 0.7, b = Math.sin(t * 2) * 3;
              const wv = [[vx - R * 1.3, vy + R * 0.6], [vx - R * 0.6, vy - R * 0.2], [vx, vy - R * 0.8 + b], [vx + R * 0.6, vy - R * 0.5 + b], [vx + R * 0.7, vy - R * 0.05], [vx + R * 0.35, vy - R * 0.2], [vx + R * 0.2, vy + R * 0.6]];
              vg += inkLoop(wv, { seed: sd + 300 + c, t }); vgr += inkPath(wv, { w: 5, seed: sd + 310 + c, t, closed: true });
              y += gh * 1.8;
            }
            for (let k = 0; k < col.length && y + gh < Y1 - 10; k++, y += gh * 1.12) {
              for (let j = 0; j < col[k].length; j++) {
                const s = col[k][j], pts = s.map(q => [cx - gh * 0.5 + q[0] * gh, y + q[1] * gh]);
                tx += inkPath(pts, { w: Math.max(4, gh * 0.11), seed: sd + 1000 + c * 97 + k * 11 + j, t, amp: 1, taper: 0.55, vary: 0.35 }) + ' ';
              }
            }
            if (vis < 0) break;
          }
          text.setAttribute('d', tx); vig.setAttribute('d', vg); vigR.setAttribute('d', vgr);
          // red circle around one entry
          const M = P.mark || null, ma = M ? atOr(cues, M.at, null) : null, mp = ma == null ? 0 : prog(lt, ma, 0.6);
          if (mp > 0.01) {
            const cx = X1 - 40 - ((M.col ?? 3) + 0.5) * cw, cy = (Y0 + Y1) / 2, pts = [];
            const n = Math.max(2, Math.round(26 * mp));
            for (let k = 0; k <= n; k++) { const a = -Math.PI / 2 + k / 26 * Math.PI * 2.15; pts.push([cx + Math.cos(a) * cw * 0.85, cy + Math.sin(a) * (Y1 - Y0) * 0.52]); }
            mark.setAttribute('d', inkPath(pts, { w: 9, seed: sd + 400, t, taper: 0.4 }));
          } else mark.setAttribute('d', '');
          // red seal stamp
          if (P.stamp) {
            const S = P.stamp, sa = atOr(cues, S.at, null), sp = sa == null ? 0 : (lt >= sa ? spring(lt, sa, 0.4) : 0);
            const sx = X0 + (S.x ?? 0.22) * (X1 - X0), sy = Y0 + (S.y ?? 0.5) * (Y1 - Y0), sz = 150 * lerp(1.8, 1, sp) * (1 + 0.06 * hit), on = sp > 0.01;
            const sq = [[sx - sz, sy - sz * 0.75], [sx + sz, sy - sz * 0.78], [sx + sz * 1.02, sy + sz * 0.75], [sx - sz, sy + sz * 0.77]];
            stampF.setAttribute('d', on ? inkLoop(sq, { seed: sd + 500, t, smooth: false }) : '');
            stampR.setAttribute('d', on ? inkPath(sq.map(q => [sx + (q[0] - sx) * 1.12, sy + (q[1] - sy) * 1.15]), { w: 8, seed: sd + 501, t, closed: true, smooth: false }) : '');
            st.setAttribute('opacity', on ? clamp01(sp * 2).toFixed(2) : '0');
            st.setAttribute('transform', `translate(${f1(sx)} ${f1(sy + 32 * lerp(1.8, 1, sp))}) rotate(-6) scale(${lerp(1.8, 1, sp).toFixed(3)})`);
            stampF.setAttribute('transform', `rotate(-6 ${f1(sx)} ${f1(sy)})`); stampR.setAttribute('transform', `rotate(-6 ${f1(sx)} ${f1(sy)})`);
          }
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
