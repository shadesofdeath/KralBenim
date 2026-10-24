// an_tug: a planted Ottoman tuğ (horse-tail standard: pole, gold finial ball + crescent, a crossbar with swinging
// horse-tail strands) on a small mound; big Fraunces "blows" (words) fly in one after another, hit the pole with a red
// burst, the standard sways and wobbles back upright each time, the word drops away; then a pill verdict ("Devlet
// ayakta") lands. Parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz via _ink.js; pure function of (seed, lt)).
// Written for 02-ankara-savasi-1402 ("Esaret, Bozgun, Kavga… ve devlet ayakta"), parametric.
// P: {x: 0.42 (pole, 0..1 W), ground: 0.8 (0..1 H), blows: [{text, at: cue|sec, from: "right"|"left", size: 120}] (1-4),
//     pill: {text, at, color: "green"|"red"|"blue"},
//     kasif: {x: 0.84, scale: 0.85, pose: "talk", face: -1, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//     cam: {zoom: 1.05}}
// cues: hit (punch), plus whatever names blows / pill / seq use
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rot = (p, o, a) => { const c = Math.cos(a), s = Math.sin(a), dx = p[0] - o[0], dy = p[1] - o[1]; return [o[0] + dx * c - dy * s, o[1] + dx * s + dy * c]; };

  SH.an_tug = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 377, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const px = (P.x ?? (portrait ? 0.5 : 0.42)) * W, gy = (P.ground ?? (portrait ? 0.6 : 0.8)) * H;
      const poleH = (portrait ? 0.42 : 0.6) * H;
      const moundF = inkEl(cam, INK.paperDark), moundR = inkEl(cam);
      const strandsR = inkEl(cam), poleR = inkEl(cam), barR = inkEl(cam);
      const ballF = inkEl(cam, INK.gold), ballR = inkEl(cam), cresF = inkEl(cam, INK.gold), cresR = inkEl(cam);
      const burst = inkEl(cam, INK.red);
      const blows = (P.blows || []).slice(0, 4).map((b, i) => {
        const g = el(cam, 'g'), size = b.size || (portrait ? 110 : 120);
        const sh = el(g, 'text', { x: 6, y: size * 0.36 + 7, 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.paperDark });
        const t = el(g, 'text', { x: 0, y: size * 0.36, 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink });
        sh.textContent = t.textContent = b.text;
        let w = 0; try { w = t.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = b.text.length * size * 0.55;
        return { b, g, size, w, i };
      });
      const PL = P.pill || null;
      let pill = null;
      if (PL) {
        const g = el(cam, 'g'), py = H * (portrait ? 0.24 : 0.17), size = portrait ? 80 : 74;
        const box = inkEl(g, COL[PL.color] || INK.green), ring = inkEl(g);
        const t = el(g, 'text', { x: px, y: py + size * 0.34, 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.paperLight });
        t.textContent = PL.text;
        let w = 0; try { w = t.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = PL.text.length * size * 0.6;
        pill = { g, box, ring, py, w: w + 90, h: size * 1.45 };
      }
      const K = P.kasif === false ? null : Object.assign({ x: portrait ? 0.8 : 0.84, scale: portrait ? 0.95 : 0.85, pose: 'talk', face: -1 }, P.kasif || {});
      const kas = K ? KASIF.create(el(root, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, (P.cam && P.cam.zoom) || 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = px, fy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.4) * 6)} ${f1(fy + Math.cos(lt * 0.3) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // impacts: each blow arrives 0.45 s after its cue
          let sway = Math.sin(t * 1.3) * 0.012, bd = '';
          const impacts = blows.map(B => atOr(cues, B.b.at, 0.4 + B.i * 1.2) + 0.45);
          blows.forEach((B, i) => {
            const a = impacts[i] - 0.45, dirS = (B.b.from === 'left' ? -1 : 1);
            const hitY = gy - poleH * (0.45 + 0.12 * (i % 3));
            if (lt < a) { B.g.setAttribute('opacity', 0); return; }
            const fly = clamp01((lt - a) / 0.45), after = Math.max(0, lt - impacts[i]);
            const x0 = px + dirS * W * 0.5, xi = px + dirS * (B.w / 2 + 30);
            let x = lerp(x0, xi, fly * fly), y = hitY, r = dirS * (1 - fly) * 12, op = 1;
            if (after > 0) { x = xi + dirS * after * 260; y = hitY + after * after * 900; r = dirS * after * 40; op = clamp01(1 - (after - 0.5) / 0.4); }
            B.g.setAttribute('opacity', op);
            const b = boil(sd + 20 + i, t, 1);
            B.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1(r)})`);
            if (after > 0) {
              sway += -dirS * 0.14 * Math.exp(-after * 2.6) * Math.cos(after * 9);
              if (after < 0.35) {
                const k = 1 - after / 0.35, cxp = px, cyp = hitY - 10, n = 9; let pts = [];
                for (let q = 0; q < n * 2; q++) { const ang = q / (n * 2) * Math.PI * 2, rr = (q % 2 ? 26 : 70) * (0.6 + 0.6 * (1 - k)); pts.push([cxp + Math.cos(ang) * rr, cyp + Math.sin(ang) * rr]); }
                bd += inkLoop(pts, { seed: sd + 60 + i, t, amp: 2 }) + ' ';
              }
            }
          });
          burst.setAttribute('d', bd);
          // mound
          const mp = [];
          for (let k = 0; k <= 16; k++) { const u = k / 16, xx = lerp(px - 230, px + 230, u); mp.push([xx, gy - Math.sin(u * Math.PI) * 46]); }
          moundF.setAttribute('d', inkLoop(mp.concat([[px + 230, gy + 6], [px - 230, gy + 6]]), { seed: sd + 1, t, amp: 1 }));
          moundR.setAttribute('d', inkPath(mp, { w: 6, seed: sd + 2, t }) + ' ' + inkPath([[px - 330, gy + 4], [px + 330, gy + 4]], { w: 5, seed: sd + 3, t }));
          // pole (pivot at the foot), crossbar, strands, finial
          const o = [px, gy - 30], top = rot([px, gy - poleH], o, sway), R = q => rot(q, o, sway);
          poleR.setAttribute('d', inkPath([o, R([px, gy - poleH * 0.5]), top], { w: 11, seed: sd + 4, t }));
          const barY = gy - poleH * 0.86, b0 = R([px - 70, barY]), b1 = R([px + 70, barY]);
          barR.setAttribute('d', inkPath([b0, b1], { w: 8, seed: sd + 5, t }));
          let sd2 = '';
          for (let s = 0; s < 7; s++) {
            const sx = px - 60 + s * 20, root0 = R([sx, barY + 4]);
            const swing = -sway * 2.2 + Math.sin(t * 2.2 + s) * 0.05, len = 150 + (s % 3) * 26, pts = [];
            for (let k = 0; k <= 4; k++) { const u = k / 4; pts.push([root0[0] + Math.sin(swing * u * 3) * len * u * 0.5, root0[1] + len * u]); }
            sd2 += inkPath(pts, { w: 6, seed: sd + 30 + s, t, taper: 0.7 }) + ' ';
          }
          strandsR.setAttribute('d', sd2);
          const bc = rot([px, gy - poleH - 34], o, sway);
          const bp = []; for (let k = 0; k < 12; k++) { const ang = k / 12 * Math.PI * 2; bp.push([bc[0] + Math.cos(ang) * 30, bc[1] + Math.sin(ang) * 30]); }
          ballF.setAttribute('d', inkLoop(bp, { seed: sd + 7, t, amp: 0.8 }));
          ballR.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 8, t, closed: true }));
          const cc = rot([px, gy - poleH - 104], o, sway), cp = [];
          for (let k = 0; k <= 10; k++) { const ang = Math.PI * 0.15 + k / 10 * Math.PI * 0.7; cp.push([cc[0] + Math.cos(ang + Math.PI) * 44, cc[1] - Math.sin(ang) * 44 + 40]); }
          for (let k = 10; k >= 0; k--) { const ang = Math.PI * 0.15 + k / 10 * Math.PI * 0.7; cp.push([cc[0] + Math.cos(ang + Math.PI) * 30, cc[1] - Math.sin(ang) * 30 + 30]); }
          cresF.setAttribute('d', inkLoop(cp, { seed: sd + 9, t, amp: 0.6 }));
          cresR.setAttribute('d', inkPath(cp, { w: 4, seed: sd + 10, t, closed: true }));
          if (pill) {
            const a = atOr(cues, PL.at, dur * 0.7), p = lt >= a ? spring(lt, a, 0.6) : 0, pk = punch(lt, a, 0.5);
            const x0 = px - pill.w / 2, rr = pill.h / 2, pts = [];
            for (let k = 0; k <= 10; k++) { const ang = Math.PI / 2 + k * Math.PI / 10; pts.push([x0 + rr + Math.cos(ang) * rr, pill.py + Math.sin(ang) * rr]); }
            for (let k = 0; k <= 10; k++) { const ang = -Math.PI / 2 + k * Math.PI / 10; pts.push([x0 + pill.w - rr + Math.cos(ang) * rr, pill.py + Math.sin(ang) * rr]); }
            pill.box.setAttribute('d', inkLoop(pts, { seed: sd + 40, t, amp: 1 }));
            pill.ring.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 41, t, amp: 1, closed: true }));
            pill.g.setAttribute('opacity', clamp01(p * 3));
            pill.g.setAttribute('transform', `translate(${f1(px)} ${f1(pill.py)}) rotate(${f1(-3 + (1 - p) * -8)}) scale(${f1(lerp(0.4, 1, p) * (1 + 0.08 * pk) * 1000) / 1000}) translate(${f1(-px)} ${f1(-pill.py)})`);
          }
          if (kas) {
            const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
            (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
            const oo = { x: K.x * W, y: H * (K.y ?? (portrait ? 0.6 : 0.86)), face: faceOf(s.face ?? K.face, -1), since, dir: dirOf(s.dir ?? K.dir),
              emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
            if (pv && since < 0.32) { oo.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; oo.mix = since / 0.32; }
            kas.update(t, s.pose || 'idle', oo);
          }
        },
      };
    },
  };
})();
