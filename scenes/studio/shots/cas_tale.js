// cas_tale: a winter night on the Pacific Northwest coast (brand/kit/BRAND.md §3, §5). An elder in a woven conical
// cedar-bark hat sits by a fire telling a story to two listeners; snow drifts down; the fire's smoke rises and turns
// into the story: a row of plank houses drawn in smoke, and on "sea" a great wave rears up in the smoke and hangs over
// them. The night sky/ground come from the scene's "set" (night / snow).
// Uses cas__lib.js (CAS: flame, wave) + td__lib.js (TD: label, figure).
// P: {floor: 0.6, fire: {x: 0.5}, elder: {x: 0.74, scale: 0.62, pose: "sit", face: "left", seq},
//     listeners: [{x, scale, pose, face, seq}], vision: {y: 0.42, houses: 3, at: 0.3} , sea: cue|sec (the wave rises),
//     kasif: K | false, labels: [TD.label specs]}
// cues: hit (punch), sea, plus names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.cas_tale = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const CAS = window.CAS, TD = window.TD, atOr = CAS.atOr, sd = seed * 1000 + 271;
      const FL = (P.floor ?? 0.6) * H, fx = (P.fire && P.fire.x != null ? P.fire.x : 0.5) * W;
      const root = el(svg, 'g');
      const ground = inkEl(root), snowG = inkEl(root, INK.paperLight, { 'fill-opacity': 0.8 });
      const smoke = inkEl(root, INK.inkSoft), housesE = inkEl(root, INK.inkSoft), housesF = inkEl(root, INK.paperLight, { 'fill-opacity': 0.35 });
      const wv = CAS.wave(el(root, 'g'), sd + 5);
      const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.2 }), logs = inkEl(root, INK.hatBand), logsR = inkEl(root), stones = inkEl(root, INK.paperDark), stonesR = inkEl(root);
      const fire = CAS.flame(el(root, 'g'), sd + 7);
      const E = Object.assign({ x: 0.75, y: P.floor ?? 0.6, scale: 0.62, pose: 'sit', face: 'left', hat: false }, P.elder || {});
      const elder = TD.figure(el(root, 'g'), E, sd + 40);
      const hatF = inkEl(root, INK.stain, { 'fill-opacity': 0.85 }), hatR = inkEl(root), hatW = inkEl(root, INK.hatBand);
      const lis = (P.listeners || [{ x: 0.22, scale: 0.48, pose: 'sit', face: 'right' }, { x: 0.33, scale: 0.42, pose: 'sit', face: 'right' }]).map((K, i) => TD.figure(el(root, 'g'), Object.assign({ y: P.floor ?? 0.6, hat: false }, K), sd + 44 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.9, y: P.floor ?? 0.6, scale: 0.6, pose: 'point', face: 'left' }, P.kasif), sd + 60) : null;
      const snow = inkEl(root, INK.paperLight), snowR = inkEl(root, INK.inkSoft);
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 90 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          ground.setAttribute('d', inkPath([[-20, FL], [W * 0.5, FL + 3], [W + 20, FL - 2]], { w: 7, seed: sd + 1, t }));
          let sg = ''; for (let k = 0; k < 7; k++) { const x = (k / 7) * W + 40; sg += inkLoop([[x - 70, FL + 2], [x - 20, FL - 12 - (k % 3) * 5], [x + 50, FL - 8], [x + 80, FL + 2]], { seed: sd + 2 + k, t }) + ' '; }
          snowG.setAttribute('d', sg);
          // the vision in the smoke
          const V = Object.assign({ y: 0.42, houses: 3, at: 0.2 }, P.vision || {}), va = atOr(cues, V.at, 0.2), vp = prog(lt, va, 0.9);
          const vy = V.y * H;
          let hs = '', hf = '';
          for (let k = 0; k < V.houses; k++) {
            const hx = fx + (k - (V.houses - 1) / 2) * 190, s = vp, bw = 74 * s, bh = 70 * s;
            if (s < 0.02) continue;
            const hp = [[hx - bw, vy], [hx - bw, vy - bh], [hx, vy - bh - 40 * s], [hx + bw, vy - bh], [hx + bw, vy]];
            hf += inkLoop(hp, { seed: sd + 10 + k, t, smooth: false }) + ' ';
            hs += inkPath(hp, { w: 4, seed: sd + 15 + k, t, smooth: false }) + ' ';
            for (let j = -2; j <= 2; j++) hs += inkPath([[hx + j * bw * 0.35, vy], [hx + j * bw * 0.35, vy - bh * 0.92 + Math.abs(j) * 6]], { w: 2.4, seed: sd + 20 + k * 5 + j, t, amp: 0.8 }) + ' ';
          }
          hs += vp > 0.02 ? inkPath([[fx - 330 * vp, vy + 4], [fx + 330 * vp, vy + 6]], { w: 4, seed: sd + 40, t }) : '';
          housesE.setAttribute('d', hs); housesF.setAttribute('d', hf);
          const sa = atOr(cues, P.sea ?? 'sea', null), sp = sa == null ? 0 : (lt >= sa ? spring(lt, sa, 0.9) : 0);
          wv.update(t, { x: fx - 120 + 60 * sp, y: vy + 6, h: (P.wave_h ?? 360) * sp * (1 + 0.04 * hit) + 1, back: 700 * sp + 1, curl: 0.6 + 0.4 * sp });
          // smoke columns from the fire up to the vision
          let sm = '';
          for (let k = 0; k < 4; k++) {
            const pts = [];
            for (let j = 0; j <= 8; j++) { const u = j / 8, y = lerp(FL - 140, vy + 30, u); pts.push([fx + (k - 1.5) * 18 + Math.sin(u * 6 + t * 1.8 + k) * 30 * u, y]); }
            sm += inkPath(pts, { w: 4, seed: sd + 50 + k, t, amp: 1.4, taper: 0.7 }) + ' ';
          }
          smoke.setAttribute('d', sm);
          // fire: stones, logs, flames, glow
          const fl = 1 + 0.06 * Math.sin(t * 9) + 0.04 * Math.sin(t * 15);
          glow.setAttribute('d', inkCircle(fx, FL - 70, 260 * fl, sd + 60, t, { fill: true, ry: 190 * fl, amp: 2 }));
          logs.setAttribute('d', inkLoop([[fx - 110, FL - 6], [fx + 90, FL - 40], [fx + 100, FL - 18], [fx - 100, FL + 10]], { seed: sd + 61, t }) + ' ' + inkLoop([[fx - 90, FL - 40], [fx + 110, FL - 8], [fx + 100, FL + 12], [fx - 100, FL - 18]], { seed: sd + 62, t }));
          logsR.setAttribute('d', inkPath([[fx - 110, FL - 6], [fx + 90, FL - 40]], { w: 5, seed: sd + 63, t }) + ' ' + inkPath([[fx - 90, FL - 40], [fx + 110, FL - 8]], { w: 5, seed: sd + 64, t }));
          let st = '', sr = '';
          for (let k = 0; k < 7; k++) { const x = fx - 150 + k * 50, y = FL + 4; st += inkDot(x, y, 26, 15, sd + 70 + k, t) + ' '; sr += inkCircle(x, y, 26, sd + 80 + k, t, { w: 3.4, ry: 15 }) + ' '; }
          stones.setAttribute('d', st); stonesR.setAttribute('d', sr);
          fire.update(t, fx, FL - 26, 1.0 + 0.1 * hit, 1);
          // people
          const eo = elder.update(lt, t, cues, W, H);
          lis.forEach(f => f && f.update(lt, t, cues, W, H));
          // woven conical cedar-bark hat on the elder
          const hr = 72 * (E.scale ?? 0.62), [hx, hy] = eo.head;
          const hat = [[hx - hr * 1.5, hy - hr * 0.35], [hx - hr * 0.3, hy - hr * 1.35], [hx, hy - hr * 1.5], [hx + hr * 0.3, hy - hr * 1.35], [hx + hr * 1.5, hy - hr * 0.35], [hx, hy - hr * 0.55]];
          hatF.setAttribute('d', inkLoop(hat, { seed: sd + 100, t }));
          hatR.setAttribute('d', inkPath(hat, { w: 5, seed: sd + 101, t, closed: true }));
          let hw = '';
          for (let k = 1; k <= 3; k++) { const u = k / 4; hw += inkPath([[lerp(hx - hr * 1.5, hx, u), lerp(hy - hr * 0.35, hy - hr * 1.5, u)], [lerp(hx + hr * 1.5, hx, u), lerp(hy - hr * 0.35, hy - hr * 1.5, u)]], { w: 3, seed: sd + 102 + k, t, amp: 0.8 }) + ' '; }
          hatW.setAttribute('d', hw);
          if (kas) kas.update(lt, t, cues, W, H);
          // snow
          let sn = '', snr = '';
          for (let k = 0; k < 26; k++) {
            const u = ((k * 0.618) % 1), life = (t * 0.12 + k / 26) % 1, x = u * W + Math.sin(t + k) * 24, y = lerp(H * 0.12, FL, life), r = 7 + (k % 3) * 3;
            sn += inkDot(x, y, r, r, sd + 120 + k, t) + ' '; snr += inkCircle(x, y, r, sd + 150 + k, t, { w: 2, amp: 0.4 }) + ' ';
          }
          snow.setAttribute('d', sn); snowR.setAttribute('d', snr);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
