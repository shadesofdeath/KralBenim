// sm_hurrem: a palace hall with a woman of the court, parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz via
// _ink.js; pure function of (seed, lt), no Math.random). Written for 04-sehzade-mustafa (Hürrem Sultan beside Süleyman,
// then beside Rüstem Paşa), parametric: any scene that needs a 16th-century Ottoman lady in the stick-figure style.
// Back: an arcade of round arches on columns (ink-soft), a red curtain swag in the middle arch, tiled floor lines.
// The woman: same head and face as the KASIF rigs (round head, dot eyes, brows carry the emotion, fixed mouth), a
// small tall cap (hotoz) with a gold band and a red jewel, a veil that flows back and sways, a long bell-shaped dress
// (palette colour, gold belt) whose hem swings; she can glide in, gesture (point / wave), clasp her hands (hold) or turn.
// Men and the narrator come from MCB.cast; an optional red ink heart springs up between two figures on a cue.
// P: {woman: {x: 0.3, to, at (arrive), walk_at, walk_dur: 1.6, scale: 0.8, face: "right", pose: "idle",
//             emotion, dir, color: "red"|"blue"|"green"|"gold", name: "Hürrem" (label above, at name_at),
//             seq: [{at, pose, dir, face, emotion}]},
//     heart: {at: cue, x: 0.45, y: 0.4, size: 70},
//     floor: 0.88 (0..1 H), arches: 5, curtain: false (true: red swag in the middle arch),
//     cast: [...MCB cast], labels: [...MCB labels], cam: {zoom: 1.05, focus: [0.5, 0.55]}}
// (round 2) woman.silhouette: true (drawn as a flat ink-soft shape with no face: a hidden figure), drapes: true (two
//   tied-back curtains in the middle arch), cast entries take sultan: true (SMB kavuk).
// cues: hit (punch), woman.at / walk_at / name_at / seq, heart.at, cast/labels names. Needs mcB__lib.js (MCB), sm__lib.js (SMB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const COLS = () => ({ red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold });

  SH.sm_hurrem = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 617, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const gy = (P.floor ?? (portrait ? 0.66 : 0.88)) * H;
      const back = el(cam, 'g');
      const colR = inkEl(back, INK.inkSoft), archR = inkEl(back, INK.inkSoft), floorR = inkEl(back, INK.inkSoft);
      const curF = inkEl(back, INK.red, { 'fill-opacity': 0.85 }), curR = inkEl(back);
      const heartF = inkEl(cam, INK.red), heartR = inkEl(cam);
      const WM = Object.assign({ x: 0.3, scale: portrait ? 0.7 : 0.8, face: 'right', pose: 'idle', color: 'red' }, P.woman || {});
      const wg = el(cam, 'g');
      const w = {
        veilF: inkEl(wg, INK.paperLight), veilR: inkEl(wg, INK.inkSoft), dressF: inkEl(wg, COLS()[WM.color] || INK.red), dressR: inkEl(wg),
        belt: inkEl(wg, INK.gold), arms: inkEl(wg), hands: inkEl(wg), headF: inkEl(wg, INK.paperLight), head: inkEl(wg),
        capF: inkEl(wg, INK.paperLight), capR: inkEl(wg), band: inkEl(wg, INK.gold), jewel: inkEl(wg, INK.red), face: inkEl(wg),
      };
      if (WM.silhouette) ['veilF', 'dressF', 'belt', 'headF', 'capF', 'band', 'jewel'].forEach(k => w[k].setAttribute('fill', INK.inkSoft));
      const drL = inkEl(cam, INK.red, { 'fill-opacity': 0.9 }), drR = inkEl(cam, INK.red, { 'fill-opacity': 0.9 }), drInk = inkEl(cam);
      const castG = el(cam, 'g'), labG = el(cam, 'g');
      const cast = SMB.cast(castG, P.cast, W, H, sd + 50);
      const lab = (P.labels || []).slice();
      if (WM.name) lab.push({ text: WM.name, x: (WM.to ?? WM.x), y: (gy - 600 * WM.scale) / H, at: WM.name_at ?? 0.4, size: 62, color: 'red' });
      const labels = MCB.labels(labG, lab, W, H, sd + 70);
      const nA = P.arches ?? 5;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          MCB.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.05, focus: [0.5, 0.55] }, P.cam || {}), hit);
          // arcade
          const x0 = W * 0.03, x1 = W * 0.97, top = gy - H * (portrait ? 0.4 : 0.6), span = (x1 - x0) / nA, colW = 26;
          let cd = '', ad = '';
          for (let k = 0; k <= nA; k++) {
            const x = x0 + k * span, cap = top + span / 2;
            cd += inkPath([[x - colW / 2, gy], [x - colW / 2, cap]], { w: 4, seed: sd + 10 + k, t }) + ' ' + inkPath([[x + colW / 2, gy], [x + colW / 2, cap]], { w: 4, seed: sd + 30 + k, t }) + ' ' +
              inkPath([[x - colW, cap], [x + colW, cap]], { w: 5, seed: sd + 50 + k, t }) + ' ';
          }
          for (let k = 0; k < nA; k++) {
            const cx = x0 + (k + 0.5) * span, rr = span / 2 - colW / 2, cap = top + span / 2, pts = [];
            for (let j = 0; j <= 12; j++) { const a = Math.PI + j / 12 * Math.PI; pts.push([cx + Math.cos(a) * rr, cap + Math.sin(a) * rr]); }
            ad += inkPath(pts, { w: 4.5, seed: sd + 80 + k, t }) + ' ';
            const rr2 = rr + 22, pts2 = [];
            for (let j = 0; j <= 12; j++) { const a = Math.PI + j / 12 * Math.PI; pts2.push([cx + Math.cos(a) * rr2, cap + Math.sin(a) * rr2]); }
            ad += inkPath(pts2, { w: 3, seed: sd + 100 + k, t }) + ' ';
          }
          ad += inkPath([[x0 - 30, top - 40], [x1 + 30, top - 40]], { w: 5, seed: sd + 120, t });
          colR.setAttribute('d', cd); archR.setAttribute('d', ad);
          let fd = inkPath([[-20, gy], [W + 20, gy]], { w: 6, seed: sd + 130, t }) + ' ';
          for (let k = -6; k < 14; k++) { const x = W * 0.5 + k * 160; fd += inkPath([[x, gy + 6], [x - 260 + (k - 4) * 30, H + 20]], { w: 3, seed: sd + 140 + k + 6, t }) + ' '; }
          floorR.setAttribute('d', fd);
          if (P.curtain === true) {
            const k = Math.floor(nA / 2), cx = x0 + (k + 0.5) * span, rr = span / 2 - colW / 2, cap = top + span / 2, sw = Math.sin(t * 1.4) * 8;
            const swag = [[cx - rr, cap - rr * 0.3], [cx - rr * 0.5, cap - rr * 0.95], [cx + rr * 0.5, cap - rr * 0.95], [cx + rr, cap - rr * 0.3], [cx + rr * 0.8 + sw, gy - 40], [cx + rr * 0.55 + sw, gy - 40], [cx + rr * 0.4, cap + 20], [cx - rr * 0.4, cap + 20], [cx - rr * 0.55 + sw, gy - 40], [cx - rr * 0.8 + sw, gy - 40]];
            curF.setAttribute('d', inkLoop(swag, { seed: sd + 160, t, amp: 1 }));
            curR.setAttribute('d', inkPath(swag, { w: 4, seed: sd + 161, t, closed: true }));
          }
          // heart
          if (P.heart) {
            const a = atOr(cues, P.heart.at, null);
            if (a != null && lt >= a) {
              const p = spring(lt, a, 0.6), beat = 1 + 0.08 * Math.max(0, Math.sin((lt - a) * 7)), s = (P.heart.size || 70) * p * beat;
              const hx = (P.heart.x ?? 0.45) * W, hy = (P.heart.y ?? 0.4) * H - (lt - a) * 14, pts = [];
              for (let j = 0; j <= 24; j++) { const u = j / 24 * Math.PI * 2; pts.push([hx + s * 0.06 * 16 * Math.pow(Math.sin(u), 3), hy - s * 0.06 * (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u))]); }
              heartF.setAttribute('d', inkLoop(pts, { seed: sd + 170, t, amp: 1 }));
              heartR.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 171, t, closed: true }));
            } else { heartF.setAttribute('d', ''); heartR.setAttribute('d', ''); }
          }
          if (P.drapes) {
            const k = Math.floor(nA / 2), cx = x0 + (k + 0.5) * span, rr = span / 2 - colW / 2, cap = top + span / 2, sw = Math.sin(t * 1.2) * 6;
            const tie = gy - (gy - cap) * 0.45;
            const L = [[cx - rr, cap - rr * 0.55], [cx - rr * 0.35 + sw, cap - rr * 0.9], [cx - rr * 0.55 + sw, tie], [cx - rr * 0.7 + sw, gy - 6], [cx - rr, gy - 6]];
            const R = L.map(([x, y]) => [2 * cx - x, y]);
            drL.setAttribute('d', inkLoop(L, { seed: sd + 162, t, amp: 0.8 }));
            drR.setAttribute('d', inkLoop(R, { seed: sd + 163, t, amp: 0.8 }));
            drInk.setAttribute('d', inkPath(L, { w: 4, seed: sd + 164, t, closed: true }) + ' ' + inkPath(R, { w: 4, seed: sd + 165, t, closed: true }));
          }
          // the woman
          const s = WM.scale;
          let x = WM.x * W, face = faceOf(WM.face, 1), moving = 0;
          const segs = [{ at: -1, pose: WM.pose, dir: WM.dir, face: WM.face, emotion: WM.emotion }];
          (WM.seq || []).forEach(q => { const a = atOr(cues, q.at, null); if (a != null) segs.push(Object.assign({}, q, { at: a })); });
          segs.sort((a, b) => a.at - b.at);
          let si = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) si = j;
          const sg = segs[si], since = lt - Math.max(0, sg.at);
          face = faceOf(sg.face, face);
          if (WM.to != null) {
            const wd = WM.walk_dur ?? 1.6, arrive = WM.walk_at != null ? atOr(cues, WM.walk_at, 0) + wd : atOr(cues, WM.at, wd);
            const start = Math.max(0, arrive - wd), u = progIO(lt, start, Math.max(0.1, arrive - start));
            x = lerp(WM.x, WM.to, u) * W;
            if (lt >= start && lt < arrive) { moving = 1; face = WM.to > WM.x ? 1 : -1; }
          }
          const pose = moving ? 'walk' : (sg.pose || 'idle'), emo = sg.emotion || null;
          const bob = moving ? Math.abs(Math.sin(lt * 6)) * -8 * s : Math.sin(t * 1.6) * 3 * s;
          const U = (ux, uy) => [x + ux * s * face, gy + uy * s + bob * (uy < -100 ? 1 : 0)];
          const hem = Math.sin(t * (moving ? 6 : 1.8)) * (moving ? 14 : 5);
          const dress = [U(-12, -330), U(12, -330), U(46, -300), U(50, -200), U(100 + hem, -30), U(116 + hem, 0), U(-116 + hem, 0), U(-100 + hem, -30), U(-50, -200), U(-46, -300)];
          w.dressF.setAttribute('d', inkLoop(dress, { seed: sd + 200, t, amp: 0.8 }));
          w.dressR.setAttribute('d', inkPath(dress, { w: 6, seed: sd + 201, t, closed: true }) + ' ' + inkPath([U(0, -196), U(6 + hem * 0.4, -6)], { w: 3, seed: sd + 202, t }));
          w.belt.setAttribute('d', inkLoop([U(-52, -214), U(52, -214), U(52, -192), U(-52, -192)], { seed: sd + 203, t, amp: 0.6, smooth: false }));
          // arms by pose
          const dir = dirOf(sg.dir ?? WM.dir ?? 20) * Math.PI / 180, sh = U(0, -300);
          let hF, hB;
          if (pose === 'point' || pose === 'wave') {
            const len = 150, ang = pose === 'wave' ? 1.15 + Math.sin(lt * 8) * 0.25 : dir;
            hF = U(Math.cos(ang) * len, -300 - Math.sin(ang) * len); hB = U(-36, -170);
          } else if (pose === 'hold') { hF = U(26, -200); hB = U(10, -196); }
          else if (pose === 'think') { hF = U(40, -390); hB = U(24, -220); }
          else { const sw = moving ? Math.sin(lt * 6) * 30 : Math.sin(t * 1.6) * 4; hF = U(44 + sw, -170); hB = U(-40 - sw, -172); }
          const elb = (h, k) => [(sh[0] + h[0]) / 2 + k * 14 * face, (sh[1] + h[1]) / 2 + 14 * s];
          w.arms.setAttribute('d', inkPath([sh, elb(hF, 1), hF], { w: 7 * s / 0.62, seed: sd + 210, t }) + ' ' + inkPath([sh, elb(hB, -1), hB], { w: 7 * s / 0.62, seed: sd + 211, t }));
          w.hands.setAttribute('d', inkDot(hF[0], hF[1], 12 * s, 12 * s, sd + 212, t) + ' ' + inkDot(hB[0], hB[1], 12 * s, 12 * s, sd + 213, t));
          // head + face (same language as KASIF: dots, brows, fixed mouth)
          const hc = U(0, -404), hr = 70 * s;
          w.headF.setAttribute('d', inkCircle(hc[0], hc[1], hr, sd + 220, t, { fill: true }));
          w.head.setAttribute('d', inkCircle(hc[0], hc[1], hr, sd + 221, t, { w: 6 }));
          const ex = hc[0] + face * hr * 0.28, ey = hc[1] - hr * 0.05;
          const brow = emo === 'surprised' ? -12 : emo === 'angry' ? 4 : emo === 'worried' ? -4 : emo === 'happy' ? -6 : -2;
          const tilt = emo === 'angry' ? 1 : emo === 'worried' ? -1 : 0;
          let fd2 = inkDot(ex - hr * 0.18, ey, 6 * s / 0.62, 6 * s / 0.62, sd + 222, t) + ' ' + inkDot(ex + hr * 0.18, ey, 6 * s / 0.62, 6 * s / 0.62, sd + 223, t);
          fd2 += ' ' + inkPath([[ex - hr * 0.3, ey - hr * 0.26 + brow * s - tilt * 4], [ex - hr * 0.08, ey - hr * 0.26 + brow * s + tilt * 4]], { w: 3.5, seed: sd + 224, t }) +
            ' ' + inkPath([[ex + hr * 0.08, ey - hr * 0.26 + brow * s + tilt * 4], [ex + hr * 0.3, ey - hr * 0.26 + brow * s - tilt * 4]], { w: 3.5, seed: sd + 225, t });
          fd2 += ' ' + (emo === 'surprised' ? inkCircle(ex, ey + hr * 0.36, 7 * s / 0.62, sd + 226, t, { w: 3 }) : inkPath([[ex - hr * 0.12, ey + hr * 0.36 + (emo === 'happy' ? -2 : 0)], [ex, ey + hr * 0.38 + (emo === 'happy' ? 3 : 0)], [ex + hr * 0.12, ey + hr * 0.36 + (emo === 'happy' ? -2 : 0)]], { w: 3.5, seed: sd + 227, t }));
          w.face.setAttribute('d', WM.silhouette ? '' : fd2);
          // hotoz cap + veil flowing back
          const capB = hc[1] - hr * 0.78, capT = capB - 84 * s, cxp = hc[0] - face * 6 * s;
          const capPts = [[cxp - 40 * s, capB + 4 * s], [cxp + 40 * s, capB + 4 * s], [cxp + 30 * s, capT], [cxp - 30 * s, capT]];
          w.capF.setAttribute('d', inkLoop(capPts, { seed: sd + 230, t, amp: 0.6, smooth: false }));
          w.capR.setAttribute('d', inkPath(capPts, { w: 5, seed: sd + 231, t, closed: true, smooth: false }));
          w.band.setAttribute('d', inkLoop([[cxp - 40 * s, capB - 2 * s], [cxp + 40 * s, capB - 2 * s], [cxp + 38 * s, capB - 20 * s], [cxp - 38 * s, capB - 20 * s]], { seed: sd + 232, t, amp: 0.5, smooth: false }));
          w.jewel.setAttribute('d', inkDot(cxp, capB - 46 * s, 10 * s, 13 * s, sd + 233, t));
          const vs = Math.sin(t * 1.5) * 10 * s + (moving ? -face * 26 * s : 0);
          const veil = [[cxp + 26 * s * face, capT + 6 * s], [cxp - face * 70 * s, capT + 30 * s], [hc[0] - face * (hr + 40 * s) + vs, hc[1] + 40 * s], [hc[0] - face * (hr + 60 * s) + vs * 1.4, hc[1] + 150 * s], [hc[0] - face * 30 * s, hc[1] + 110 * s], [hc[0] - face * hr * 0.6, hc[1] - hr * 0.2]];
          w.veilF.setAttribute('d', inkLoop(veil, { seed: sd + 234, t, amp: 1 }));
          w.veilR.setAttribute('d', inkPath(veil, { w: 4, seed: sd + 235, t, closed: true }));
          void pose;
          cast.update(lt, t, cues);
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
