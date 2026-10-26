// ra_secret: a secret recipe on a parchment scroll (theme "parchment", brand/kit/BRAND.md §3, §5). Made for the
// Byzantine "Rum ateşi" (Greek fire), parametric for any lost formula / state secret:
//   · an unrolled scroll (paper-light sheet, two paper-dark rollers) with a Fraunces heading and hand-written lines that
//     write themselves in on cues; a line can carry a blue check, or be an unknown: an ink scribble with a red "?";
//   · roll: the bottom roller travels up and the scroll closes; seal: a red wax seal slams onto the closed roll;
//     chain: ink chain links wrap across it (a state secret, locked away);
//   · fade: the writing vanishes line by line (ink dust drifts off the page) until the sheet is blank;
//     stamp: a red boxed word ("KAYBOLDU") slams on at an angle;
//   · cast: Kaşif and period figures beside the scroll (KASIF rig; seq of poses on cues).
// Every line boils at 8 Hz via _ink.js; pure function of (seed, lt); colours only from INK tokens.
//
// SHOTS.ra_secret P: {
//   x: 0.5, top: 0.2, bottom: 0.56 (0..1 of H: the open sheet), w: 0.6 (share of W), tilt: -2 (deg),
//   heading: "Rum ateşi" | null, heading_at: 0,
//   lines: [{text: "Petrol", at: cue|s, mark: "check"|"q"|null, unknown: false (scribble + red ?)}],
//   roll: cue|s, seal: cue|s, chain: cue|s, fade: cue|s, fade_dur: 1.4,
//   stamp: {text: "KAYBOLDU", at: cue|s, x: 0.5, y: 0.4 (0..1 of W / H), size: 120} | null,
//   cast: [{who: "kasif"|name, accessory, beard, x: 0.2, y: 0.62 (ground, 0..1 H), scale: 0.6, pose: "idle", face: 1|-1,
//           dir, emotion, item, seq: [{at, pose, dir, face, emotion, item}]}],
//   zoom: 1.06, focus: [0.5, 0.45]
// }
// cues: lines[].at, roll, seal, chain, fade, stamp.at, cast seq at.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  // one fill path holds many shapes: give every loop the same winding, or overlaps cancel into holes (nonzero rule)
  const orient = pts => { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a < 0 ? pts.slice().reverse() : pts; };
  const loop = (pts, o) => inkLoop(orient(pts), o);
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : 1;
  const FR = 'Fraunces, Georgia, serif';

  SH.ra_secret = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, S = portrait ? W / 1080 : H / 1080, sd = seed * 1000 + 271;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sheetG = el(cam, 'g');
      const shadowE = inkEl(sheetG, INK.paperDark, { 'fill-opacity': 0.55 });
      const sheetE = inkEl(sheetG, INK.paperLight), sheetI = inkEl(sheetG, INK.ink), ruleE = inkEl(sheetG, INK.inkSoft);
      const textG = el(sheetG, 'g');
      const markE = inkEl(sheetG, INK.blue), qE = inkEl(sheetG, INK.red), scribE = inkEl(sheetG, INK.inkSoft);
      const dustE = inkEl(sheetG, INK.inkSoft);
      const rollF = inkEl(sheetG, INK.paperDark), rollI = inkEl(sheetG, INK.ink);
      const chainE = inkEl(sheetG, INK.ink);
      const sealF = inkEl(sheetG, INK.red), sealI = inkEl(sheetG, INK.ink), sealL = inkEl(sheetG, INK.paperLight, { 'fill-opacity': 0.7 });
      const stampG = el(cam, 'g'), stampE = inkEl(stampG, INK.red);
      let stampT = null;
      const castG = el(cam, 'g');

      const cx = (P.x ?? 0.5) * W, top0 = (P.top ?? 0.2) * H, bot0 = (P.bottom ?? 0.56) * H, sw = (P.w ?? 0.6) * W;
      const lineH = 92 * S, fs = 76 * S;
      // heading
      let head = null;
      if (P.heading) {
        head = el(textG, 'text', { x: f1(cx), y: f1(top0 + 120 * S), 'font-family': FR, 'font-weight': 900, 'font-size': f1(84 * S), 'text-anchor': 'middle', fill: INK.ink });
        head.textContent = P.heading;
        try { const tw = head.getComputedTextLength(); if (tw > sw - 80 * S) head.setAttribute('font-size', f1(84 * S * (sw - 80 * S) / tw)); } catch (e) { /* no layout */ }
      }
      const y0 = top0 + (P.heading ? 240 : 140) * S;
      const lines = (P.lines || []).map((Ln, i) => {
        const y = y0 + i * lineH;
        let tx = null;
        if (!Ln.unknown && Ln.text) {
          tx = el(textG, 'text', { x: f1(cx - sw / 2 + 90 * S), y: f1(y), 'font-family': INK_FONT, 'font-size': f1(fs), fill: INK.ink });
          tx.textContent = Ln.text;
        }
        return { Ln, y, tx, w: tx && tx.getComputedTextLength ? (() => { try { return tx.getComputedTextLength(); } catch (e) { return 200 * S; } })() : 0 };
      });
      if (P.stamp) {
        const st = P.stamp, size = (st.size ?? 120) * S;
        stampT = el(stampG, 'text', { x: 0, y: f1(size * 0.36), 'font-family': FR, 'font-weight': 900, 'font-size': f1(size), 'text-anchor': 'middle', fill: INK.red, 'letter-spacing': '0.03em' });
        stampT.textContent = st.text || '';
        try { const tw = stampT.getComputedTextLength(); if (tw > W - 220 * S) stampT.setAttribute('font-size', f1(size * (W - 220 * S) / tw)); } catch (e) { /* no layout */ }
      }
      const cast = (P.cast || []).map((c, i) => {
        const isK = (c.who || 'kasif') === 'kasif';
        return { c, rig: KASIF.create(el(castG, 'g'), { scale: c.scale ?? 0.6, hat: isK, accessory: isK ? null : (c.accessory || null), beard: isK ? null : (c.beard || null), seed: seed + i * 7 + 3 }) };
      });

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur)));
          const fo = P.focus || [0.5, 0.45], fx = fo[0] * W, fy = fo[1] * H;
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const sway = (P.tilt ?? -2) + Math.sin(t * 0.8) * 0.8;
          const ent = spring(lt, 0, 0.6);
          sheetG.setAttribute('transform', `translate(${f1(cx)} ${f1((top0 + bot0) / 2 + (1 - ent) * 60 * S)}) rotate(${sway.toFixed(2)}) translate(${f1(-cx)} ${f1(-(top0 + bot0) / 2)})`);

          // roll: bottom roller travels up to the top one
          const rA = atOr(cues, P.roll, null), rp = rA != null ? progIO(lt, rA, 0.7) : 0;
          const top = top0, bot = lerp(bot0, top0 + 62 * S, rp);
          const xl = cx - sw / 2, xr = cx + sw / 2;
          const edge = (y0e, y1e, x) => Array.from({ length: 7 }, (_, k) => [x + Math.sin(k * 1.9 + seed) * 4 * S, lerp(y0e, y1e, k / 6)]);
          const sheet = [[xl, top + 20 * S]].concat(edge(top + 20 * S, bot - 20 * S, xl).slice(1), [[xr, bot - 20 * S]], edge(bot - 20 * S, top + 20 * S, xr).slice(1));
          shadowE.setAttribute('d', loop(sheet.map(p => [p[0] + 14 * S, p[1] + 16 * S]), { seed: sd + 1, t, amp: 1 }));
          sheetE.setAttribute('d', loop(sheet, { seed: sd + 2, t, amp: 1.2 }));
          sheetI.setAttribute('d', inkPath([[xl, top + 20 * S]].concat(edge(top + 20 * S, bot - 20 * S, xl).slice(1)), { w: 4 * S, seed: sd + 3, t, amp: 1.2 }) + ' ' +
            inkPath([[xr, top + 20 * S]].concat(edge(top + 20 * S, bot - 20 * S, xr).slice(1)), { w: 4 * S, seed: sd + 4, t, amp: 1.2 }));
          // rollers
          let rd = '', ri = '';
          [top, bot].forEach((ry, k) => {
            const pts = [[xl - 36 * S, ry - 26 * S], [xr + 36 * S, ry - 26 * S], [xr + 44 * S, ry], [xr + 36 * S, ry + 26 * S], [xl - 36 * S, ry + 26 * S], [xl - 44 * S, ry]];
            rd += loop(pts, { seed: sd + 10 + k, t, amp: 1 }) + ' ';
            ri += inkPath(pts, { w: 5 * S, seed: sd + 12 + k, t, closed: true, amp: 1 }) + ' ';
            ri += inkPath([[xl - 10 * S, ry - 8 * S], [xr + 10 * S, ry - 10 * S]], { w: 2.5 * S, seed: sd + 14 + k, t, amp: 0.8 }) + ' ';
            [xl - 44 * S, xr + 44 * S].forEach((ex, q) => { rd += inkDot(ex, ry, 16 * S, 20 * S, sd + 16 + k * 2 + q, t) + ' '; ri += inkCircle(ex, ry, 16 * S, sd + 20 + k * 2 + q, t, { w: 4 * S, ry: 20 * S }) + ' '; });
          });
          rollF.setAttribute('d', rd); rollI.setAttribute('d', ri);

          // writing
          const fA = atOr(cues, P.fade, null), fd = P.fade_dur ?? 1.4, nL = lines.length + (head ? 1 : 0);
          const fadeOf = k => fA == null ? 1 : 1 - prog(lt, fA + k / Math.max(1, nL) * fd, 0.45);
          const bo = boil(sd + 30, t, 1.2);
          textG.setAttribute('transform', `translate(${f1(bo[0])} ${f1(bo[1])})`);
          if (head) {
            const a = spring(lt, atOr(cues, P.heading_at, 0), 0.5), o = Math.min(1, a * 2) * fadeOf(0) * (head.getAttribute('y') < bot - 30 * S ? 1 : 0);
            head.setAttribute('fill-opacity', o.toFixed(3));
          }
          let md = '', qd = '', sc = '', dust = '';
          lines.forEach((L, i) => {
            const a0 = atOr(cues, L.Ln.at, 0.3 + i * 0.4), p = prog(lt, a0, 0.5), vis = L.y < bot - 40 * S;
            const o = p * fadeOf(i + (head ? 1 : 0)) * (vis ? 1 : 0);
            if (L.tx) {
              L.tx.setAttribute('fill-opacity', o.toFixed(3));
              L.tx.setAttribute('transform', `translate(${f1((1 - p) * -30 * S)} 0)`);
            }
            const x0 = cx - sw / 2 + 90 * S;
            if (L.Ln.unknown && o > 0.02) {   // scribble: a wavy ink line drawn left to right + red ?
              const len = Math.min(sw - 260 * S, 380 * S) * p, pts = [];
              for (let k = 0; k <= 10; k++) pts.push([x0 + len * k / 10, L.y - 22 * S + Math.sin(k * 2.2 + i) * 12 * S]);
              if (fadeOf(i + (head ? 1 : 0)) > 0.5) sc += inkPath(pts, { w: 6 * S, seed: sd + 40 + i, t, amp: 1.2 }) + ' ';
            }
            if (o > 0.5 && (L.Ln.mark || L.Ln.unknown)) {
              const mx = L.Ln.unknown ? x0 + Math.min(sw - 260 * S, 380 * S) + 70 * S : x0 + L.w + 60 * S, my = L.y - 26 * S, k = spring(lt, a0 + 0.25, 0.4) * (1 + 0.2 * punch(lt, a0 + 0.25, 0.4));
              if (L.Ln.mark === 'check') md += inkPath([[mx - 24 * S * k, my], [mx - 4 * S * k, my + 22 * S * k], [mx + 30 * S * k, my - 30 * S * k]], { w: 9 * S, seed: sd + 60 + i, t, amp: 1 }) + ' ';
              else {   // red question mark
                const q = [[mx - 22 * S, my - 26 * S], [mx - 10 * S, my - 46 * S], [mx + 12 * S, my - 46 * S], [mx + 22 * S, my - 28 * S], [mx + 8 * S, my - 8 * S], [mx, my + 8 * S]].map(pq => [mx + (pq[0] - mx) * k, my + (pq[1] - my) * k]);
                qd += inkPath(q, { w: 9 * S, seed: sd + 70 + i, t, amp: 1 }) + ' ' + inkDot(mx, my + 30 * S * k, 7 * S * k, 7 * S * k, sd + 80 + i, t) + ' ';
              }
            }
            // ink dust drifting off while the line fades
            if (fA != null) {
              const ls = fA + (i + (head ? 1 : 0)) / Math.max(1, nL) * fd, u = lt - ls;
              if (u > 0 && u < 1.3 && vis) for (let q = 0; q < 7; q++) {
                const r0 = rng(sd + 100 + i * 13 + q), px = x0 + r0() * Math.max(160 * S, L.w || 300 * S), py = L.y - r0() * 50 * S;
                const rr = (5 - u * 3) * S; if (rr > 0.8) dust += inkDot(px + u * (60 + r0() * 80) * S, py - u * (90 + r0() * 60) * S, rr, rr, sd + 120 + q, t) + ' ';
              }
            }
          });
          markE.setAttribute('d', md); qE.setAttribute('d', qd); scribE.setAttribute('d', sc); dustE.setAttribute('d', dust);
          // faint ruled lines on the sheet
          let rl = '';
          for (let k = 0; k < 6; k++) { const y = y0 + 18 * S + k * lineH; if (y < bot - 40 * S) rl += inkPath([[xl + 60 * S, y], [xr - 60 * S, y + 2]], { w: 2 * S, seed: sd + 140 + k, t, amp: 0.8 }) + ' '; }
          ruleE.setAttribute('d', rl);

          // chain across the closed roll
          const cA = atOr(cues, P.chain, null);
          let ch = '';
          if (cA != null && lt >= cA) {
            const n = 9, pr = prog(lt, cA, 0.6), my = (top + bot) / 2;
            for (let k = 0; k < n * pr; k++) {
              const u = k / (n - 1), x = lerp(xl - 70 * S, xr + 70 * S, u), y = my + Math.sin(u * 3.1) * 16 * S - 6 * S;
              ch += inkCircle(x, y, 26 * S, sd + 160 + k, t, { w: 7 * S, ry: (k % 2 ? 12 : 24) * S }) + ' ';
            }
          }
          chainE.setAttribute('d', ch);
          // wax seal
          const sA = atOr(cues, P.seal, null);
          if (sA != null && lt >= sA) {
            const k = lerp(1.8, 1, prog(lt, sA, 0.25)) * (1 + 0.1 * punch(lt, sA + 0.25, 0.4)), sx = cx, sy = (top + bot) / 2 + 4 * S, r = 64 * S * k;
            const blob = inkEllipsePts(sx, sy, r, r, sd + 180, 14, 0, 0.12);
            const rib = [[sx - 20 * S, sy + r * 0.6], [sx - 46 * S, sy + r * 2.1], [sx - 20 * S, sy + r * 1.8], [sx - 4 * S, sy + r * 0.7]];
            const rib2 = rib.map(p => [2 * sx - p[0], p[1]]);
            sealF.setAttribute('d', loop(rib, { seed: sd + 181, t, amp: 1 }) + ' ' + loop(rib2, { seed: sd + 182, t, amp: 1 }) + ' ' + loop(blob, { seed: sd + 183, t, amp: 1 }));
            sealI.setAttribute('d', inkPath(blob, { w: 5 * S, seed: sd + 184, t, closed: true, amp: 1 }) + ' ' + inkCircle(sx, sy, r * 0.62, sd + 185, t, { w: 4 * S }) + ' ' +
              inkPath([[sx, sy - r * 0.42], [sx, sy + r * 0.42]], { w: 5 * S, seed: sd + 186, t, amp: 0.6 }) + ' ' + inkPath([[sx - r * 0.42, sy], [sx + r * 0.42, sy]], { w: 5 * S, seed: sd + 187, t, amp: 0.6 }));
            sealL.setAttribute('d', inkDot(sx - r * 0.35, sy - r * 0.38, r * 0.14, r * 0.08, sd + 188, t));
          } else { sealF.setAttribute('d', ''); sealI.setAttribute('d', ''); sealL.setAttribute('d', ''); }

          // stamp
          if (P.stamp && stampT) {
            const st = P.stamp, a = atOr(cues, st.at, null);
            if (a != null && lt >= a) {
              const k = lerp(2.2, 1, prog(lt, a, 0.22)) * (1 + 0.08 * punch(lt, a + 0.22, 0.5)), y = (st.y ?? 0.4) * H;
              stampG.style.display = '';
              let tw = 400 * S; try { tw = stampT.getComputedTextLength(); } catch (e) { /* no layout */ }
              const fsz = parseFloat(stampT.getAttribute('font-size')), bw = tw / 2 + 40 * S, bh = fsz * 0.62;
              const box = [[-bw, -bh], [bw, -bh], [bw, bh], [-bw, bh]];
              stampE.setAttribute('d', inkPath(box, { w: 12 * S, seed: sd + 200, t, closed: true, amp: 1.5, smooth: false }));
              stampG.setAttribute('transform', `translate(${f1((st.x ?? 0.5) * W)} ${f1(y)}) rotate(-8) scale(${k.toFixed(3)})`);
            } else stampG.style.display = 'none';
          }

          // cast
          cast.forEach(({ c, rig }) => {
            const ev = (c.seq || []).map(s => Object.assign({}, s, { at: atOr(cues, s.at, null) })).filter(e => e.at != null && lt >= e.at).sort((a, b) => a.at - b.at);
            const cur = ev[ev.length - 1], prev = ev[ev.length - 2];
            const pose = cur ? cur.pose || c.pose || 'idle' : c.pose || 'idle', since = cur ? lt - cur.at : lt;
            const o = { x: (c.x ?? 0.2) * W, y: (c.y ?? 0.62) * H, face: faceOf(cur && cur.face != null ? cur.face : c.face), since,
              dir: dirOf(cur && cur.dir != null ? cur.dir : c.dir), emotion: cur && cur.emotion ? cur.emotion : (pose === 'shock' ? 'surprised' : c.emotion || null),
              item: cur && cur.item !== undefined ? cur.item : c.item };
            if (cur && since < 0.32) { o.prev = { pose: prev ? prev.pose || c.pose || 'idle' : c.pose || 'idle', since: prev ? cur.at - prev.at : cur.at, dir: dirOf(prev && prev.dir != null ? prev.dir : c.dir) }; o.mix = since / 0.32; }
            rig.update(t, pose, o);
          });
        },
      };
    },
  };
})();
