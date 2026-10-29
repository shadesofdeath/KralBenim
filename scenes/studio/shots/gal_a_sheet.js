// gal_a_sheet: real 1609–1610 documents redrawn in ink (02-galileo-teleskop; no photos reachable, so the sources are
// re-created by hand: they follow the originals' layout, they are not facsimiles). "set": false; frame-filling.
//   mode "harriot": a plastered wall with a large aged sheet pinned on it, on which a crude crescent Moon with a ragged
//     terminator and a few hatched patches draws itself from `draw` (after Thomas Harriot's drawing of 26 July 1609);
//     a hand-written date (date: {text, at}) and a signature (sign); a writing table with quill, ink pot and candle in
//     the foreground; the narrator may stand on the left.
//   mode "plates": an open book seen from above on a wooden table: Latin heading on the left page, wash-drawn Moons
//     (GAL.moon) appearing one by one: plates: [{term, at}] (after the Sidereus Nuncius plates, 1610).
//   mode "log": a notebook page from above: rows written in turn, each a date and a Jupiter circle with its "stars" at
//     moon positions (units left/right of the planet): rows: [{date, moons: [-2, 1, ...], at, ring}] (after Galileo's
//     January 1610 notes); on `orbit.at` a dashed orbit arrow circles in the margin.
// P: {mode, draw, date, sign, plates, heading, rows, orbit: {at}, kasif, labels}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  SH.gal_a_sheet = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 101, mode = P.mode || 'harriot';
      const root = el(svg, 'g');
      const room = mode === 'harriot' ? G.room(el(root, 'g'), sd + 1) : null;
      const wood = mode !== 'harriot' ? inkEl(root, mix(INK.stain, INK.ink, 0.25)) : null, woodL = mode !== 'harriot' ? inkEl(root, INK.ink, { 'fill-opacity': 0.4 }) : null;
      const shadow = inkEl(root, INK.ink, { 'fill-opacity': 0.25 });
      const sheet = inkEl(root, mix(INK.paperLight, INK.stain, 0.12)), sheetSt = inkEl(root, INK.stain, { 'fill-opacity': 0.3 }), sheetL = inkEl(root);
      const page2 = mode === 'plates' ? inkEl(root, mix(INK.paperLight, INK.stain, 0.12)) : null;
      const pin = inkEl(root, INK.red);
      const drawL = inkEl(root, INK.ink), hatch = inkEl(root, INK.inkSoft);
      const plates = mode === 'plates' ? (P.plates || []).map((p, i) => ({ p, m: G.moon(root, sd + 10 + i) })) : [];
      const rowsL = inkEl(root, INK.ink), rowsR = inkEl(root, INK.red), orbL = inkEl(root, INK.red);
      const texts = [];
      const T = (txt, size, font, fill, anchor = 'middle') => { const e = el(root, 'text', { 'font-family': font, 'font-size': size, 'text-anchor': anchor, fill, 'font-weight': font === FR ? 800 : 400 }); e.textContent = txt; texts.push(e); return e; };
      const head = mode === 'plates' ? T(P.heading || 'SIDEREUS NUNCIUS', 52, FR, INK.ink) : null;
      const dateT = P.date ? T(P.date.text, 60, INK_FONT, INK.inkSoft) : null;
      const signT = P.sign ? T(P.sign, 56, INK_FONT, INK.ink) : null;
      const rowT = (P.rows || []).map(r => T(r.date + ' Ocak', 50, INK_FONT, INK.ink, 'start'));
      const kas = P.kasif ? G.person(root, Object.assign({ who: 'kasif' }, P.kasif), sd + 30) : null;
      const table = mode === 'harriot' ? G.table(el(root, 'g'), sd + 2) : null;
      const props = inkEl(root, INK.ink), inkpot = inkEl(root, mix(INK.ink, INK.blue, 0.2)), quill = inkEl(root, INK.paperLight), flame = inkEl(root, INK.gold), cand = inkEl(root, INK.paperLight);
      const labels = (P.labels || []).map((l, i) => G.label(root, l, W, H, sd + 50 + i));
      const q = rng(inkHash(sd, 1)), BLOB = Array.from({ length: 5 }, () => [q() * 0.9 - 0.6, q() * 1.2 - 0.6, 0.1 + q() * 0.12]);
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const sw = Math.sin(t * 0.6) * 0.4;
          let sh;
          if (room) {
            room.update(t, W, H, { gy: 0.8 * H, kind: 'plaster', beams: true });
            sh = [[0.3 * W, 0.1 * H], [0.78 * W, 0.11 * H], [0.79 * W, 0.7 * H], [0.29 * W, 0.71 * H]];
          } else {
            wood.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 3, t, amp: 0.4, smooth: false }));
            let wl = ''; for (let y = 60; y < H; y += 150) wl += G.line([[-40, y], [W * 0.4, y + 8], [W + 40, y - 4]], sd + 4 + y, t, 2.4) + ' ';
            woodL.setAttribute('d', wl);
            sh = mode === 'plates' ? [[0.1 * W, 0.08 * H], [0.5 * W, 0.1 * H], [0.5 * W, 0.92 * H], [0.1 * W, 0.9 * H]] : [[0.24 * W, 0.04 * H], [0.76 * W, 0.05 * H], [0.77 * W, 0.97 * H], [0.23 * W, 0.98 * H]];
          }
          const off = p => p.map(v => [v[0] + 14, v[1] + 18]);
          shadow.setAttribute('d', inkLoop(off(sh), { seed: sd + 5, t, amp: 0.5, smooth: false }) + (page2 ? ' ' + inkLoop(off([[0.5 * W, 0.1 * H], [0.9 * W, 0.08 * H], [0.9 * W, 0.9 * H], [0.5 * W, 0.92 * H]]), { seed: sd + 6, t, amp: 0.5, smooth: false }) : ''));
          sheet.setAttribute('d', inkLoop(sh, { seed: sd + 7, t, amp: 0.5, smooth: false }));
          const p2 = [[0.5 * W, 0.1 * H], [0.9 * W, 0.08 * H], [0.9 * W, 0.9 * H], [0.5 * W, 0.92 * H]];
          if (page2) page2.setAttribute('d', inkLoop(p2, { seed: sd + 8, t, amp: 0.5, smooth: false }));
          sheetSt.setAttribute('d', inkLoop(inkEllipsePts(sh[2][0] - 140, sh[2][1] - 120, 110, 70, sd + 9, 10), { seed: sd + 9, t, amp: 1 }));
          sheetL.setAttribute('d', G.ring(sh, sd + 11, t, 3.5, 0.5) + (page2 ? ' ' + G.ring(p2, sd + 12, t, 3.5, 0.5) + ' ' + G.line([[0.5 * W, 0.1 * H], [0.5 * W, 0.92 * H]], sd + 13, t, 5) : ''));
          pin.setAttribute('d', room ? inkDot((sh[0][0] + sh[1][0]) / 2, sh[0][1] + 24, 14, 14, sd + 14, t) : '');
          let dl = '', hl = '', rl = '', rr = '';
          if (mode === 'harriot') {
            const cx = 0.54 * W, cy = 0.38 * H, R = 0.22 * H, da = G.atOr(cues, P.draw, 0.4), k = clamp01((lt - da) / 1.6);
            // outline drawing itself, then the ragged terminator, then patches
            const n = Math.max(2, Math.round(28 * k)), arc = [];
            for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + i / 28 * Math.PI * 2; arc.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
            if (k > 0) dl += G.line(arc, sd + 20, t, 4, 1.6, 0.2) + ' ';
            const k2 = clamp01((lt - da - 1.4) / 1.0), tm = [];
            for (let i = 0; i <= Math.round(16 * k2); i++) { const v = -1 + i / 8, w = Math.sqrt(Math.max(0, 1 - v * v)); tm.push([cx - R * 0.25 * w + (i % 2 ? 8 : -8), cy + v * R]); }
            if (tm.length > 1) dl += G.line(tm, sd + 21, t, 3.5, 1.6, 0.2) + ' ';
            const k3 = clamp01((lt - da - 2.2) / 1.0);
            for (let j = 0; j < Math.round(14 * k3); j++) { const v = -0.9 + j * 0.13, w = Math.sqrt(Math.max(0, 1 - v * v)); hl += G.line([[cx - R * w * 0.96, cy + v * R], [cx - R * 0.25 * w - 10, cy + v * R + 6]], sd + 200 + j, t, 2.4) + ' '; }
            BLOB.forEach((b, i) => { if (k3 * 5 > i) { const x = cx + b[0] * R * 0.7 + R * 0.25, y = cy + b[1] * R * 0.7, r = b[2] * R; for (let j = -2; j <= 2; j++) hl += G.line([[x - r, y + j * r * 0.3 - r * 0.2], [x + r, y + j * r * 0.3 + r * 0.2]], sd + 30 + i * 5 + j, t, 2.2) + ' '; } });
            if (dateT) { const a = G.atOr(cues, P.date.at, 1.5); dateT.setAttribute('x', 0.64 * W); dateT.setAttribute('y', 0.64 * H); dateT.style.display = lt >= a ? '' : 'none'; dateT.setAttribute('transform', `rotate(-3 ${0.64 * W} ${0.64 * H})`); }
            if (signT) { signT.setAttribute('x', 0.4 * W); signT.setAttribute('y', 0.64 * H); signT.style.display = lt >= da + 2.6 ? '' : 'none'; }
            // table props
            table.update(t, { x0: 0.26 * W, x1: 1.02 * W, y: 0.86 * H, depth: 70, H });
            const tx = 0.84 * W, ty = 0.86 * H - 40, fk = Math.sin(t * 9) * 0.12;
            inkpot.setAttribute('d', inkLoop([[tx - 50, ty], [tx + 50, ty], [tx + 40, ty - 70], [tx - 40, ty - 70]], { seed: sd + 40, t, amp: 0.4 }));
            quill.setAttribute('d', inkLoop([[tx + 10, ty - 60], [tx + 150, ty - 320 + Math.sin(t * 1.2) * 6], [tx + 120, ty - 300], [tx + 4, ty - 66]], { seed: sd + 41, t, amp: 0.6 }));
            const c0 = 0.48 * W;
            cand.setAttribute('d', inkLoop([[c0 - 18, ty - 150], [c0 + 18, ty - 150], [c0 + 18, ty], [c0 - 18, ty]], { seed: sd + 42, t, amp: 0.4, smooth: false }));
            flame.setAttribute('d', inkLoop([[c0, ty - 150 - 70 * (1 + fk)], [c0 + 16, ty - 174], [c0, ty - 154], [c0 - 16, ty - 174]], { seed: sd + 43, t, amp: 0.8 }));
            props.setAttribute('d', G.ring([[tx - 50, ty], [tx + 50, ty], [tx + 40, ty - 70], [tx - 40, ty - 70]], sd + 44, t, 4, 0.4) + ' ' + G.line([[tx + 10, ty - 60], [tx + 150, ty - 320]], sd + 45, t, 3));
          }
          if (mode === 'plates') {
            if (head) { head.setAttribute('x', 0.7 * W); head.setAttribute('y', 0.17 * H); }
            plates.forEach(({ p, m }, i) => {
              const a = G.atOr(cues, p.at, 0.2 + i), k = spring(lt, a, 0.9), cx = (i ? 0.7 : 0.3) * W, cy = (i ? 0.48 : 0.56) * H;
              m.update(t, { x: cx, y: cy, r: 0.27 * H * Math.max(0.01, lt < a ? 0 : k), term: p.term ?? 0, rough: 1, halo: false, shade: 0.75 });
            });
            for (let k = 0; k < 4; k++) { const y = 0.82 * H + k * 0; rl += G.line([[0.54 * W, 0.82 * H + k * 0.02 * H], [0.86 * W, 0.82 * H + k * 0.02 * H]], sd + 66 + k, t, 2) + ' '; void y; }
          }
          if (mode === 'log') {
            const rows = P.rows || [], x0 = 0.3 * W, jx = 0.52 * W, unit = 70;
            rows.forEach((r, i) => {
              const a = G.atOr(cues, r.at, 0.2 + i * 0.8), y = 0.27 * H + i * 0.17 * H, k = clamp01((lt - a) / 0.7);
              const tx = rowT[i]; tx.setAttribute('x', x0 - 70); tx.setAttribute('y', y + 16); tx.style.display = lt >= a ? '' : 'none';
              if (lt < a) return;
              rl += inkCircle(jx, y, 30 * spring(lt, a, 0.6) + 0.1, sd + 70 + i, t, { w: 5 }) + ' ';
              r.moons.forEach((u, j) => {
                if (k * r.moons.length < j + 0.5) return;
                const x = jx + u * unit + (u > 0 ? 10 : -10), s = 13;
                rl += G.line([[x - s, y - s], [x + s, y + s]], sd + 80 + i * 10 + j, t, 4) + ' ' + G.line([[x + s, y - s], [x - s, y + s]], sd + 90 + i * 10 + j, t, 4) + ' ';
              });
              rl += G.line([[x0 - 80, y + 46], [0.72 * W, y + 48]], sd + 100 + i, t, 1.6) + ' ';
              if (r.ring) { const rk = spring(lt, a + 0.6, 0.8); if (lt > a + 0.6) rr += G.ring(inkEllipsePts(jx + 40, y, 330 * rk, 64 * rk, sd + 110 + i, 16), sd + 111 + i, t, 6, 1) + ' '; }
            });
            const oa = G.atOr(cues, (P.orbit || {}).at, null);
            if (oa != null && lt >= oa) {
              const ox = 0.86 * W, oy = 0.5 * H, k = clamp01((lt - oa) / 1.2), pts = [], sp = (lt - oa) * 1.5;
              for (let i = 0; i <= Math.round(24 * k); i++) { const an = sp + i / 24 * Math.PI * 1.7; pts.push([ox + Math.cos(an) * 120, oy + Math.sin(an) * 60]); }
              let od = pts.length > 1 ? G.line(pts, sd + 120, t, 5) : '';
              if (pts.length > 2) { const e = pts[pts.length - 1], b = pts[pts.length - 3], an = Math.atan2(e[1] - b[1], e[0] - b[0]); od += ' ' + G.line([[e[0] - Math.cos(an - 0.5) * 30, e[1] - Math.sin(an - 0.5) * 30], e, [e[0] - Math.cos(an + 0.5) * 30, e[1] - Math.sin(an + 0.5) * 30]], sd + 121, t, 5); }
              od += ' ' + inkCircle(ox, oy, 20, sd + 122, t, { w: 4 });
              orbL.setAttribute('d', od);
            } else orbL.setAttribute('d', '');
          }
          drawL.setAttribute('d', dl); hatch.setAttribute('d', hl); rowsL.setAttribute('d', rl); rowsR.setAttribute('d', rr);
          void sw;
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
