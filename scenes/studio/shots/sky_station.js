// sky_station: Skylab in orbit, hand-drawn ink on parchment (brand/kit/BRAND.md §3, §5), made for the Stickstory
// long video "Skylab fell on Esperance" (2026-10-26) but parametric for any space-station moment. Uses sky__lib.js
// (SKY.station / thermo / astro / shuttle) and td__lib.js (TD.stars / earth / sun / label / figure).
// Every line boils at 8 Hz; palette tokens only; everything a pure function of (seed, lt).
//
// SHOTS.sky_station P: {
//   x: 0.5, y: 0.52, scale: 0.78, rot: -6, drift: true,           // station centre (0..1 of frame), size, tilt
//   earth: {y: 1.9, r: 1.2} | false (big limb at the bottom; y = centre, r = radius, both in frame heights),
//   stars: 20, sun: {x: 0.1, y: 0.15, r: 70} | false,
//   station: {shield: 1, upper: 1, lower: 1, strap: false, parasol: 0, csm: true, lights: 1, heat: 0},   // start state
//   events (each at: cue name | seconds):
//     tear: cue        shield panel peels off and flies away (shield -> 0)
//     rip: cue         the upper solar wing is torn away, tumbling off
//     umbrella: cue    the parasol pushes out on its pole and unfolds (2 s)
//     cut: cue         the strap over the folded lower wing is snipped (red ring flash)
//     nudge: cue       the lower wing opens a little and sticks (0 -> 0.25, small shake)
//     open: cue        the lower wing swings fully open (spring)
//     dark: cue        window lights go out
//     leave: cue       the docked Apollo ship backs away and flies off right
//     glow: cue        re-entry: flame tongues grow; breakup: cue -> parts fly apart
//     push: cue        (with shuttle) the station is nudged up + a dashed red arrow "higher"
//   thermo: {x: 0.84, y: 0.62, h: 360, from: 0.25, to: 0.9, at, dur: 2.5, text_from: "20°C", text_to: "54°C", cool: false}
//   eva: [{x: 0.4, y: 0.55, scale: 0.42, pose: "hold", face: 1, rot: 0 (float tilt), seq: [{at, pose, dir}]}]  floating spacesuit figures; with
//        tool: "pole" the first figure holds a long pole to the strap; rope: {at: cue} a rope from the two figures'
//        hands to the wing tip, pulled tight at "open"
//   shuttle: {at: cue, from: [1.2, 0.8], to: [0.78, 0.62], s: 0.6} | false     orbiter flies in on cue
//   house: {x: 0.2, y: 0.8, s: 1, at} | false        a little house outline for size comparison
//   labels: [{text, x, y, at, size, color, font, box, rot}] (TD.label), kasif: K (TD.figure) | false,
//   cam: {zoom: 1.08, fx: 0.5, fy: 0.45}, shake: cue (camera shake 0.5 s)
// }   cues: hit (punch), every event / label / seq name
// SHOTS.sky_eva: the same drawing used as a close-up spacewalk shot (same params; give it a bigger scale, earth: false,
//   eva figures + tool: "pole" / rope) so a repair sequence can alternate between a wide and a close view.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.sky_station = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const TD = window.TD, SKY = window.SKY, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 701;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const st = P.stars === 0 ? null : TD.stars(cam, sd + 1, W, H, P.stars ?? 20, 0.14, 0.7);
      const SU = P.sun ? Object.assign({ x: 0.1, y: 0.15, r: 70 }, P.sun) : null, sun = SU ? TD.sun(cam, sd + 2) : null;
      const E = P.earth === false ? null : Object.assign({ y: 1.9, r: 1.2 }, P.earth || {});
      const earth = E ? TD.earth(cam, defs, sd + 3) : null;
      const HS = P.house ? Object.assign({ x: 0.2, y: 0.8, s: 1 }, P.house) : null, houseG = HS ? el(cam, 'g') : null, housePen = HS ? SKY.mkPen(houseG) : null;
      const SHU = P.shuttle ? Object.assign({ from: [1.25, 0.85], to: [0.78, 0.64], s: 0.6 }, P.shuttle) : null;
      const shut = SHU ? SKY.shuttle(el(cam, 'g'), sd + 4) : null;
      const stG = el(cam, 'g'), sta = SKY.station(stG, sd + 5);
      const evaG = el(cam, 'g'), evaPen = SKY.mkPen(evaG);
      const eva = (P.eva || []).map((A, i) => ({ A, f: SKY.astro(el(cam, 'g'), sd + 20 + i, { scale: A.scale ?? 0.42 }) }));
      const fxG = el(cam, 'g'), fxPen = SKY.mkPen(fxG);
      const TH = P.thermo ? Object.assign({ x: 0.84, y: 0.62, h: 360, from: 0.25, to: 0.9, dur: 2.5, text_from: '20°C', text_to: '54°C' }, P.thermo) : null;
      const th = TH ? SKY.thermo(el(root, 'g'), sd + 6) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 30 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.12, y: 0.92, scale: 0.7, pose: 'point', face: 'right', dir: 30 }, P.kasif), sd + 7) : null;
      const S0 = Object.assign({ shield: 1, upper: 1, lower: 1, strap: false, parasol: 0, csm: true, lights: 1, heat: 0 }, P.station || {});
      const zoom = (P.cam && P.cam.zoom) || 1.08, FX = (P.cam && P.cam.fx) ?? 0.5, FY = (P.cam && P.cam.fy) ?? 0.45;
      const ev = (cues, k) => P[k] == null ? null : atOr(cues, P[k], null);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          let shake = 0;
          for (const k of ['shake', 'tear', 'rip', 'nudge', 'breakup']) { const a = ev(cues, k); if (a != null && lt >= a && lt < a + 0.5) shake += Math.sin(lt * 80) * 9 * (1 - (lt - a) / 0.5); }
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          cam.setAttribute('transform', `translate(${f1(W * FX + shake)} ${f1(H * FY)}) scale(${z.toFixed(4)}) translate(${f1(-W * FX)} ${f1(-H * FY)})`);
          if (st) st.update(t);
          if (sun) sun.update(t, SU.x * W, SU.y * H, SU.r * (1 + 0.04 * Math.sin(t * 2)));
          if (earth) earth.update(t, W * 0.5, E.y * H, E.r * H, true, true);
          // station state over time
          const o = Object.assign({}, S0);
          const tear = ev(cues, 'tear'); if (tear != null) { o.shield_tear = lt >= tear ? clamp01((lt - tear) / 1.6) : 0; if (lt >= tear + 1.6) o.shield = 0; }
          const rip = ev(cues, 'rip'); if (rip != null) o.upper_gone = lt >= rip ? clamp01((lt - rip) / 1.8) : 0;
          const um = ev(cues, 'umbrella'); if (um != null) o.parasol = lt >= um ? clamp01((lt - um) / 2) : 0;
          const cut = ev(cues, 'cut'); if (cut != null) o.strap_cut = lt >= cut ? clamp01((lt - cut) / 0.4) : 0;
          const nud = ev(cues, 'nudge'), opn = ev(cues, 'open');
          let lo = S0.lower;
          if (nud != null && lt >= nud) lo = Math.max(lo, 0.25 * prog(lt, nud, 0.5));
          if (opn != null && lt >= opn) lo = lerp(Math.max(lo, nud != null ? 0.25 : lo), 1, spring(lt, opn, 1.2));
          o.lower = lo;
          const dk = ev(cues, 'dark'); if (dk != null) o.lights = lt >= dk ? 1 - clamp01((lt - dk) / 0.6) : S0.lights;
          const gl = ev(cues, 'glow'); if (gl != null) o.glow = lt >= gl ? clamp01((lt - gl) / 1.2) : 0;
          const bk = ev(cues, 'breakup'); if (bk != null) o.breakup = lt >= bk ? clamp01((lt - bk) / 2.2) : 0;
          o.trail = P.trail ?? 180;
          const lv = ev(cues, 'leave'); if (lv != null && lt >= lv) o.csm = false;
          const dr = P.drift === false ? 0 : 1;
          let X = (P.x ?? 0.5) * W + Math.sin(lt * 0.5) * 16 * dr, Y = (P.y ?? 0.52) * H + Math.cos(lt * 0.7) * 10 * dr;
          const pu = ev(cues, 'push'); if (pu != null && lt >= pu) Y -= 120 * progIO(lt, pu, 2.2);
          const rot = (P.rot ?? -6) + Math.sin(lt * 0.4) * 2 * dr + (gl != null && lt >= gl ? (lt - gl) * 6 : 0);
          const s = (P.scale ?? 0.78);
          const res = sta.update(t, Object.assign(o, { x: X, y: Y, s, rot }));
          // the leaving Apollo ship (drawn separately so it can fly)
          fxPen.begin();
          if (lv != null && lt >= lv) {
            const e = progIO(lt, lv, 2.6), p = res.pt(470 + 700 * e, -80 * e), sc = s * lerp(1, 0.7, e);
            const loc = pts => pts.map(([x, y]) => [p[0] + (x - 470) * sc, p[1] + y * sc]);
            SKY.shape(fxPen, loc([[352, -10], [420, -64], [420, 64], [352, 10]]), INK.paperLight, sd + 60, t);
            SKY.shape(fxPen, loc([[420, -56], [540, -56], [540, 56], [420, 56]]), INK.paperDark, sd + 62, t);
            const fl = loc([[540, -24], [640 + Math.sin(t * 20) * 14, 0], [540, 24]]);
            fxPen.fill(inkLoop(fl, { seed: sd + 64, t, amp: 2 }), INK.gold, 0.9);
          }
          // cut flash + push arrow
          if (cut != null && lt >= cut && lt < cut + 0.8) {
            const p = res.pt(-145, 120), r = 40 + 120 * (lt - cut);
            fxPen.fill(inkPath(SKY.ell(p[0], p[1], r, r, 12), { w: 6, seed: sd + 66, t, closed: true }), INK.red);
          }
          if (pu != null && lt >= pu) {
            const a = progIO(lt, pu, 1), p0 = res.pt(-110, 260), p1 = [p0[0], p0[1] - 260 * a];
            for (let k = 0; k < 5; k++) { const u0 = k / 5, u1 = u0 + 0.12; if (u0 < a) fxPen.fill(inkPath([[p0[0], lerp(p0[1], p1[1], u0 / Math.max(a, 0.01))], [p0[0], lerp(p0[1], p1[1], Math.min(1, u1 / Math.max(a, 0.01)))]], { w: 9, seed: sd + 70 + k, t }), INK.red); }
            if (a > 0.9) fxPen.fill(inkLoop([[p1[0] - 34, p1[1] + 30], [p1[0], p1[1] - 16], [p1[0] + 34, p1[1] + 30]], { seed: sd + 77, t, smooth: false }), INK.red);
          }
          fxPen.end();
          // spacewalkers
          evaPen.begin();
          const hands = eva.map(({ A, f }) => {
            const segs = [{ at: -1, pose: A.pose || 'hold', dir: A.dir, face: A.face ?? 1, emotion: A.emotion }];
            (A.seq || []).forEach(q => { const a = atOr(cues, q.at, null); if (a != null) segs.push(Object.assign({}, q, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            const sg = segs[i], since = lt - Math.max(0, sg.at), face = sg.face ?? A.face ?? 1;
            const x = A.x * W + Math.sin(lt * 0.9 + A.x * 7) * 6, y = A.y * H + Math.sin(lt * 1.3 + A.x * 5) * 10;
            const dirs = { up: 70, down: -38, forward: 8 };
            const r = f.update(t, sg.pose || 'hold', { x, y, face, since, dir: typeof sg.dir === 'number' ? sg.dir : (dirs[sg.dir] ?? 20), emotion: sg.emotion, rot: (A.rot ?? 0) + Math.sin(lt * 0.8 + A.x * 3) * 3 });
            const sc = A.scale ?? 0.42, rr = ((A.rot ?? 0) + Math.sin(lt * 0.8 + A.x * 3) * 3) * Math.PI / 180;
            const hx = face * sc * r.hands[1][0], hy = sc * r.hands[1][1] + 260 * sc;
            return [x + hx * Math.cos(rr) - hy * Math.sin(rr), y - 260 * sc + hx * Math.sin(rr) + hy * Math.cos(rr)];
          });
          if (P.tool === 'pole' && hands[0]) {
            const tip = res.pt(-145, 120), h = hands[0];
            SKY.line(evaPen, [h, tip], sd + 80, t, 7, INK.inkSoft);
            const d = Math.atan2(tip[1] - h[1], tip[0] - h[0]), jaw = (cut != null && lt >= cut) ? 0.1 : 0.5;
            for (const sgn of [-1, 1]) SKY.line(evaPen, [tip, [tip[0] - Math.cos(d + sgn * jaw) * 46, tip[1] - Math.sin(d + sgn * jaw) * 46]], sd + 82 + sgn, t, 6);
          }
          if (P.rope && hands.length) {
            const ra = atOr(cues, P.rope.at, 0), tipW = res.pt(40, 105 + 30 + 270 * o.lower);
            if (lt >= ra) {
              const taut = opn != null && lt >= opn ? 1 : 0.4;
              hands.forEach((h, k) => {
                const mid = [lerp(h[0], tipW[0], 0.5), lerp(h[1], tipW[1], 0.5) + 60 * (1 - taut)];
                SKY.line(evaPen, [h, mid, tipW], sd + 90 + k, t, 4.5, INK.hatBand, { smooth: true });
              });
            }
          }
          evaPen.end();
          // house outline for scale
          if (HS) {
            const a = atOr(cues, HS.at, 0), p = lt >= a ? spring(lt, a, 0.6) : 0;
            houseG.setAttribute('opacity', clamp01(p * 3).toFixed(3));
            const s2 = HS.s * lerp(0.5, 1, p), hx = HS.x * W, hy = HS.y * H;
            houseG.setAttribute('transform', `translate(${f1(hx)} ${f1(hy)}) scale(${s2.toFixed(3)})`);
            housePen.begin();
            SKY.shape(housePen, [[-110, 0], [-110, -130], [0, -220], [110, -130], [110, 0]], INK.paperLight, sd + 100, t, { w: 6 });
            SKY.shape(housePen, [[-30, 0], [-30, -80], [30, -80], [30, 0]], INK.paperDark, sd + 102, t);
            SKY.shape(housePen, [[50, -110], [90, -110], [90, -70], [50, -70]], INK.gold, sd + 104, t, { op: 0.5 });
            housePen.end();
          }
          if (shut) {
            const a = atOr(cues, SHU.at, 0), e = lt >= a ? progIO(lt, a, 2.2) : 0;
            shut.update(t, { x: lerp(SHU.from[0], SHU.to[0], e) * W, y: lerp(SHU.from[1], SHU.to[1], e) * H + Math.sin(lt) * 6, s: SHU.s, rot: -8 });
          }
          if (th) {
            const a = atOr(cues, TH.at, 0.3), p = lt >= a ? progIO(lt, a, TH.dur) : 0;
            const lvl = lerp(TH.from, TH.to, p), hot = TH.cool ? 1 - p : (0.4 + 0.6 * p);
            th.update(t, TH.x * W, TH.y * H, TH.h, lvl + Math.sin(lt * 3) * 0.01, p > 0.5 ? TH.text_to : TH.text_from, hot);
          }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
  SH.sky_eva = { kind: '2d', build: ctx => SH.sky_station.build(ctx) };
})();
