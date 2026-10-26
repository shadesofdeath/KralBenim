// ce_sky: a night landscape under a hand-drawn aurora (red curtains, gold rays, green hem) on parchment, for the
// Carrington Event Short (Stickstory 2026-10-26); parametric for any "night sky lit up" moment. Uses ce__lib.js (CE)
// and td__lib.js (TD: stars, label). BRAND.md §3/§5: palette tokens only, boil 8 Hz, pure function of (seed, lt).
// P: {
//   sky: {top: 0.14, tone: 0.4 (0 = paper-dark, 1 = stain; opaque token mix)} | false (night wash: paper-dark sky with hatching from `top` down to the ground),
//   ground: 0.6,                                   // ground line (0..1 H); hatched earth below it
//   aurora: {y: 0.3, h: 0.17, at: cue|sec (rises + sweeps in), dur: 1.4, amp: 36, tilt: 0, back: true} | false,
//   flare_at: cue                                  // aurora flares brighter, small camera shake
//   stars: 18, moon: {x: 0.84, y: 0.2, r: 46} | false,
//   ridge: {y: 0.5, h: 0.16, n: 4, snow: false, sharp: true} | false,   // far mountains / hills (parallax)
//   town: {x0: 0.0, x1: 1.0, y (default ground), s: 1} | false,
//   camp: {tent: {x: 0.2, s: 0.8}, fire: {x: 0.55, s: 0.8}, pan: 0 (index of the cast member holding the pan) | false},
//   poles: {n: 4, x0: 0.12, x1: 0.95, h: 0.22, current_at: cue (gold strikes from the aurora into the wires, pulses run)},
//   cast: [{who: "man", accessory, beard, x, y, scale, pose, face, dir, emotion, seq, bob}], kasif: K | false,
//   labels: [{text, x, y, at, size, color, font, box, underline}], stamp: {text, at, x, y, size} | false,
//   cam: {zoom: 1.06}
// }   cues: hit (punch), flare_at, aurora.at, poles.current_at, label/seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.ce_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const CE = window.CE, TD = window.TD, f1 = CE.f1, atOr = CE.atOr, sd = seed * 1000 + 611;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const GY = (P.ground ?? 0.6) * H;
      const nightG = el(cam, 'g'), farG = el(cam, 'g'), skyG = el(cam, 'g');
      const SK = P.sky === false ? null : Object.assign({ top: 0.14 }, P.sky || {});
      const skyF = SK ? inkEl(nightG, mix(INK.paperDark, INK.stain, SK.tone ?? 0.4)) : null, skyH = SK ? inkEl(nightG, INK.inkSoft, { 'fill-opacity': 0.55 }) : null, skyE = SK ? inkEl(nightG, INK.stain, { 'fill-opacity': 0.5 }) : null;
      const st = P.stars === 0 ? null : TD.stars(skyG, sd + 1, W, H, P.stars ?? 18, 0.15, 0.42);
      const MO = P.moon === false ? null : Object.assign({ x: 0.84, y: 0.2, r: 46 }, P.moon || {}), moon = MO ? CE.moon(skyG, sd + 2) : null;
      const A = P.aurora === false ? null : Object.assign({ y: 0.3, h: 0.17, at: 0, dur: 1.4, amp: 36, tilt: 0, back: true }, P.aurora || {});
      const auB = A && A.back ? CE.aurora(skyG, sd + 3) : null, auF = A ? CE.aurora(skyG, sd + 4) : null;
      const RG = P.ridge === false ? null : Object.assign({ y: 0.5, h: 0.16, n: 4, sharp: true }, P.ridge || {});
      const ridge = RG ? CE.ridge(farG, sd + 5, { x0: -80, x1: W + 80, y: RG.y * H, h: RG.h * H, n: RG.n, sharp: RG.sharp, snow: RG.snow, depth: GY - RG.y * H + 10, fill: INK.paper }) : null;
      const midG = el(cam, 'g');
      const TW = P.town ? Object.assign({ x0: 0, x1: 1, s: 1 }, P.town) : null;
      const town = TW ? CE.town(midG, sd + 6, { x0: TW.x0 * W, x1: TW.x1 * W, y: (TW.y ?? (P.ground ?? 0.6)) * H, s: TW.s }) : null;
      const groundF = inkEl(midG, INK.paper), groundR = inkEl(midG), groundH = inkEl(midG, INK.inkSoft);
      const CP = P.camp || null;
      const tent = CP && CP.tent ? CE.tent(midG, sd + 7) : null, fire = CP && CP.fire ? CE.fire(midG, sd + 8) : null;
      const PO = P.poles ? Object.assign({ n: 4, x0: 0.12, x1: 0.95, h: 0.22 }, P.poles) : null;
      const poleG = el(midG, 'g'), wireG = el(midG, 'g'), strikeG = el(midG, 'g');
      const poles = PO ? Array.from({ length: PO.n }, (_, i) => CE.pole(poleG, sd + 20 + i)) : [];
      const wires = PO ? Array.from({ length: (PO.n - 1) * 2 + 2 }, (_, i) => CE.wire(wireG, sd + 40 + i)) : [];
      const strikes = PO ? [inkEl(strikeG, INK.gold), inkEl(strikeG, INK.red, { 'fill-opacity': 0.8 })] : null;
      const castG = el(root, 'g');
      const cast = (P.cast || []).map((K, i) => CE.fig(castG, Object.assign({ who: 'man', scale: 0.8, pose: 'idle' }, K), sd + 60 + i * 13));
      const panI = CP && CP.pan !== false && CP.pan != null ? CP.pan : null, pan = panI != null ? CE.pan(castG, sd + 9) : null;
      const kas = P.kasif ? CE.fig(castG, Object.assign({ x: 0.2, y: P.ground ?? 0.6, scale: 0.9, pose: 'look', face: 'right' }, P.kasif), sd + 90) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      const STP = P.stamp ? Object.assign({ x: 0.5, y: 0.25, size: 130, rot: -6, box: true, font: 'serif', color: 'red', underline: false }, P.stamp) : null;
      const stamp = STP ? TD.label(root, STP, W, H, sd + 130) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const fa = atOr(cues, P.flare_at, null), flare = fa == null ? 0 : (lt >= fa ? Math.max(0.35, Math.exp(-(lt - fa) * 2)) : 0);
          let shake = 0;
          if (fa != null && lt >= fa && lt < fa + 0.4) shake = Math.sin(lt * 80) * 7 * (1 - (lt - fa) / 0.4);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
          const fx = W * 0.5, fy = H * 0.45;
          cam.setAttribute('transform', `translate(${f1(fx + shake)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          farG.setAttribute('transform', `translate(${f1(-lt * 7)} 0)`);
          skyG.setAttribute('transform', `translate(${f1(-lt * 3)} 0)`);
          if (SK) {   // night: a paper-dark sky wash with a soft torn top edge, stain edge and ink-soft night hatching
            const ty = SK.top * H, pts = [];
            for (let k = 0; k <= 10; k++) pts.push([lerp(-80, W + 80, k / 10), ty + Math.sin(k * 1.9 + 0.4) * 16]);
            skyF.setAttribute('d', inkLoop(pts.concat([[W + 80, GY + 20], [-80, GY + 20]]), { seed: sd + 70, t, amp: 1.5 }));
            skyE.setAttribute('d', inkPath(pts, { w: 14, seed: sd + 71, t, amp: 1.5, taper: 0.2 }));
            const r = rng(sd + 72); let hd = '';
            for (let k = 0; k < 34; k++) { const x = r() * (W + 160) - 80, y = ty + 30 + r() * (GY - ty - 120) * 0.55; hd += inkPath([[x, y], [x + 34, y - 22]], { w: 3.2, seed: sd + 80 + k, t, amp: 0.8 }) + ' '; }
            skyH.setAttribute('d', hd);
          }
          if (st) st.update(t);
          if (moon) moon.update(t, MO.x * W, MO.y * H, MO.r);
          if (A) {
            const a = atOr(cues, A.at, 0), rp = lt >= a ? progIO(lt, a, A.dur) : 0;
            if (auB) auB.update(t, { x0: -60, x1: W + 120, y: (A.y - 0.06) * H, h: A.h * H * 0.8, amp: A.amp * 0.8, p: rp, rise: lerp(0.3, 1, rp), k: 0.8, tilt: -A.tilt * 0.5, bright: flare });
            auF.update(t, { x0: -80, x1: W + 80, y: A.y * H, h: A.h * H, amp: A.amp, p: clamp01(rp * 1.15), rise: lerp(0.2, 1, rp), k: 1.1, tilt: A.tilt, bright: flare + 0.3 * hit });
          }
          if (ridge) ridge.update(t);
          if (town) town.update(t);
          // ground: a gentle line with hatching below (kept light so the caption band stays clean)
          const gp = []; for (let k = 0; k <= 8; k++) gp.push([lerp(-60, W + 60, k / 8), GY + Math.sin(k * 1.3 + 0.5) * 10]);
          groundF.setAttribute('d', inkLoop(gp.concat([[W + 60, H + 40], [-60, H + 40]]), { seed: sd + 11, t, amp: 1, smooth: true }));
          groundR.setAttribute('d', inkPath(gp, { w: 6, seed: sd + 12, t, amp: 1.2 }));
          let gh = '';
          for (let k = 0; k < 9; k++) { const x = 60 + k * 120 + (k % 2) * 30, y = GY + 40 + (k % 3) * 34; gh += inkPath([[x, y], [x + 46, y - 6]], { w: 3.5, seed: sd + 13 + k, t, amp: 0.8 }) + ' '; }
          groundH.setAttribute('d', gh);
          if (tent) tent.update(t, CP.tent.x * W, GY + 8, CP.tent.s ?? 0.8);
          if (fire) fire.update(t, CP.fire.x * W, GY + 14, CP.fire.s ?? 0.8);
          if (PO) {
            const tops = [];
            for (let i = 0; i < PO.n; i++) {
              const u = PO.n > 1 ? i / (PO.n - 1) : 0, s = lerp(1, 0.5, u), x = lerp(PO.x0, PO.x1, u) * W, y = GY + 12 - u * 40;
              tops.push(poles[i].update(t, x, y, PO.h * H * s, s));
            }
            const ca = atOr(cues, PO.current_at, null), cp = ca == null ? 0 : (lt >= ca ? clamp01((lt - ca) / 0.4) : 0);
            let w = 0;
            for (let i = 0; i < PO.n - 1; i++) for (let j = 0; j < 2; j++) wires[w++].update(t, tops[i][j], tops[i + 1][j], 26, cp, 2, 4);
            // wires running off the left edge
            for (let j = 0; j < 2; j++) wires[w++].update(t, [-40, tops[0][j][1] + 40], tops[0][j], 30, cp, 2, 4.5);
            let sg = '', sr = '';
            if (cp > 0.01 && A) for (let i = 0; i < PO.n; i++) {
              if ((inkFrame(t) + i) % 3 === 0) continue;                   // strikes flicker
              const top = tops[i][i % 2], from = [top[0] + Math.sin(i * 2.1) * 60, A.y * H + 30];
              const pts = []; for (let k = 0; k <= 5; k++) { const u = k / 5; pts.push([lerp(from[0], top[0], u) + (k % 2 ? 1 : -1) * (k && k < 5 ? 22 : 0), lerp(from[1], top[1] - 8, u * cp)]); }
              sg += inkPath(pts, { w: 5, seed: sd + 50 + i, t, amp: 1, smooth: false, taper: 0.4 }) + ' ';
              sr += inkPath(pts, { w: 12, seed: sd + 55 + i, t, amp: 1, smooth: false, taper: 0.4 }) + ' ';
            }
            strikes[0].setAttribute('d', sg); strikes[1].setAttribute('d', sr);
          }
          const outs = cast.map(c => c.update(lt, t, cues, W, H));
          if (pan && outs[panI]) { const o = outs[panI]; pan.update(t, o.hand[0], o.hand[1], cast[panI].K.scale ?? 0.8, o.face); }
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
          if (stamp) stamp.update(lt, t, cues);
        },
      };
    },
  };
})();
