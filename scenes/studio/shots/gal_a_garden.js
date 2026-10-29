// gal_a_garden: a rooftop terrace at night (Padua 1609, 02-galileo-teleskop): starry sky, the Moon (GAL.moon), a roofline
// with a campanile and lit windows (GAL.roofs), a balustrade, a tiled terrace floor running to the frame bottom with a
// potted lemon tree in the near foreground; Galileo (or the narrator) at a spyglass on its tripod (GAL.scope).
// Use over "set": "night" (ground ≈ 870). Parchment ink, palette tokens only, pure function of (seed, lt).
// P: {mode: "wide" | "close" (same layout, framed by the scene camera) | "swing" (the scope swings from the sea to the sky),
//     ground: 0.8, roofs: {kind: "padua", lights: 0.4}, dusk: false (stars come out on scope.at),
//     moon: {x, y (0..1), r (px), term, rough, rise: cue (rises from below the roofs)},
//     scope: {x: 0.42 (used when nobody looks through it), ang: -34, ang0 (start angle), at: cue (swings ang0 -> ang),
//             len: 560, tripod: true},
//     badge: {text: "20x", at}, galileo: GAL.person entry (looks through the scope: its eyepiece sits at his eye),
//     kasif: GAL.person entry, cast: [...], labels: [...]}
// cues: scope.at, moon.rise, badge.at, person at/seq cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.gal_a_garden = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 11;
      const gy = (P.ground ?? 0.8) * H;
      const root = el(svg, 'g');
      const skyF = inkEl(root, INK.ink), skyH = inkEl(root, INK.paperLight, { 'fill-opacity': 0.07 });
      const skyG = el(root, 'g'), farG = el(root, 'g'), wallG = el(root, 'g'), floorG = el(root, 'g'), actG = el(root, 'g'), foreG = el(root, 'g'), labG = el(root, 'g');
      const stars = G.stars(skyG, sd + 1, 46);
      const M = P.moon || { x: 0.78, y: 0.24, r: 150 };
      const moon = G.moon(skyG, sd + 2);
      const roofs = G.roofs(farG, sd + 3);
      const parF = inkEl(wallG, mix(INK.paperDark, INK.inkSoft, 0.3)), parL = inkEl(wallG);
      const flF = inkEl(floorG, mix(INK.red, INK.paperDark, 0.55)), flL = inkEl(floorG, INK.inkSoft), flE = inkEl(floorG);
      const SC = P.scope || {};
      const scope = G.scope(actG, sd + 4);
      const gal = P.galileo ? G.person(actG, Object.assign({ y: gy / H }, P.galileo), sd + 5) : null;
      const people = [P.kasif ? Object.assign({ who: 'kasif' }, P.kasif) : null].concat(P.cast || []).filter(Boolean).map((m, i) => G.person(actG, Object.assign({ y: gy / H }, m), sd + 20 + i * 7));
      const potF = inkEl(foreG, mix(INK.red, INK.stain, 0.35)), leafF = inkEl(foreG, mix(INK.green, INK.ink, 0.25)), fruit = inkEl(foreG, INK.gold), foreL = inkEl(foreG);
      const postF = inkEl(foreG, mix(INK.paperDark, INK.inkSoft, 0.45)), postL = inkEl(foreG);
      const badge = P.badge ? G.label(labG, Object.assign({ x: 0.5, y: 0.2, size: 110, font: 'serif', box: true }, P.badge), W, H, sd + 6) : null;
      const labels = (P.labels || []).map((L, i) => G.label(labG, L, W, H, sd + 40 + i));
      const q = rng(inkHash(sd, 9)), LEAVES = Array.from({ length: 16 }, () => [q() * 2 - 1, q(), q()]);
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const sa = G.atOr(cues, SC.at, null);
          const swingK = sa == null ? 1 : progIO(lt, sa, 1.6);
          const starK = P.dusk ? (sa == null ? 1 : clamp01((lt - sa + 0.4) / 2)) : 1;
          // own night sky (opaque, so the set's moon never doubles ours); dusk: lighter until the scope turns up
          skyF.setAttribute('fill', mix(mix(INK.blue, INK.ink, 0.45), mix(INK.blue, INK.paperDark, 0.35), P.dusk ? 1 - starK : 0));
          skyF.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, gy - 100], [-40, gy - 100]], { seed: sd + 7, t, amp: 0.4, smooth: false }));
          let hh = ''; for (let k = 0; k < 9; k++) { const y = 40 + k * 70; hh += G.line([[-40, y], [W * 0.3, y + 6], [W * 0.7, y - 4], [W + 40, y + 3]], sd + 8 + k, t, 2.2) + ' '; }
          skyH.setAttribute('d', hh);
          stars.update(t, 0, 0, W, gy - 330, starK * 0.98 + 0.02);
          const ra = G.atOr(cues, M.rise, null), rise = ra == null ? 1 : progIO(lt, ra - 0.6, 2.2);
          moon.update(t, { x: M.x * W, y: lerp(gy - 200, M.y * H, rise), r: M.r ?? 150, term: M.term ?? 0, rough: M.rough ?? 1, shade: 0.7 });
          const rf = P.roofs || {};
          roofs.update(t, { W, gy: gy - 96, top: gy - 400, kind: rf.kind || 'padua', lights: (rf.lights ?? 0.4) * (0.92 + 0.08 * Math.sin(t * 3)), night: true });
          // balustrade: rail, base and turned balusters
          const py0 = gy - 128, py1 = gy - 8;
          let pf = inkLoop([[-40, py0], [W + 40, py0 - 2], [W + 40, py0 + 22], [-40, py0 + 24]], { seed: sd + 50, t, amp: 0.5, smooth: false }) + ' ' +
            inkLoop([[-40, py1 - 20], [W + 40, py1 - 22], [W + 40, py1 + 4], [-40, py1 + 6]], { seed: sd + 51, t, amp: 0.5, smooth: false });
          let pl = G.line([[-40, py0], [W + 40, py0 - 2]], sd + 52, t, 5) + ' ' + G.line([[-40, py0 + 24], [W + 40, py0 + 22]], sd + 53, t, 4) + ' ' + G.line([[-40, py1 - 20], [W + 40, py1 - 22]], sd + 54, t, 4);
          for (let x = 30, k = 0; x < W; x += 74, k++) {
            const b = [[x - 12, py0 + 24], [x + 12, py0 + 24], [x + 18, py0 + 54], [x + 9, py0 + 70], [x + 16, py1 - 20], [x - 16, py1 - 20], [x - 9, py0 + 70], [x - 18, py0 + 54]];
            pf += ' ' + inkLoop(b, { seed: sd + 60 + k, t, amp: 0.4 });
            pl += ' ' + G.ring(b, sd + 100 + k, t, 3, 0.4);
          }
          parF.setAttribute('d', pf); parL.setAttribute('d', pl);
          // terrace floor: terracotta tiles in perspective down to the frame bottom
          flF.setAttribute('d', inkLoop([[-40, gy - 10], [W + 40, gy - 12], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 140, t, amp: 0.5, smooth: false }));
          let fl = '';
          for (let k = 1; k < 5; k++) { const y = gy + (H - gy) * (k / 5) ** 1.25; fl += G.line([[-40, y], [W + 40, y + 2]], sd + 150 + k, t, 2.2) + ' '; }
          for (let k = -9; k <= 9; k++) fl += G.line([[W / 2 + k * 120, gy - 8], [W / 2 + k * 300, H + 40]], sd + 170 + k, t, 2.2) + ' ';
          flL.setAttribute('d', fl);
          flE.setAttribute('d', G.line([[-40, gy - 10], [W + 40, gy - 12]], sd + 190, t, 6));
          // scope + who looks through it
          let eye = null;
          if (gal) {
            const gm = P.galileo, sc = gm.scale ?? 0.62, fc = gm.face === 'left' ? -1 : 1;
            eye = [(gm.x ?? 0.36) * W + fc * 78 * sc, gy - 418 * sc];
            gal.update(lt, t, cues, W, H);
          }
          const ex = eye ? eye[0] : (SC.x ?? 0.42) * W, ey = eye ? eye[1] : gy - 300;
          // aim: at the Moon's final place unless an angle is given
          const aimA = SC.aim === false ? (SC.ang ?? -34) : Math.atan2(M.y * H - ey, M.x * W - ex) * 180 / Math.PI;
          const ang = lerp(SC.ang0 ?? aimA, aimA, swingK) + Math.sin(t * 0.7) * 0.6;
          scope.update(t, { x: ex + 6, y: ey + 4, ang, len: SC.len ?? 560, r: 30, tripod: SC.tripod === false ? false : { gy: gy + 4 }, glint: ((lt * 0.35) % 1.4) });
          people.forEach(p => p.update(lt, t, cues, W, H));
          // near foreground: potted lemon tree (left) and a cropped balustrade post (right)
          const px = 150, pb = H + 20, pt = gy + 70;
          const pot = [[px - 150, pt], [px + 150, pt], [px + 110, pb], [px - 110, pb]];
          potF.setAttribute('d', inkLoop(pot, { seed: sd + 200, t, amp: 0.6, smooth: false }));
          const sway = Math.sin(t * 0.8) * 8;
          let lf = '', fr = '';
          LEAVES.forEach((l, i) => {
            const cx = px + l[0] * 190 + sway * l[1], cy = pt - 120 - l[1] * 220, r = 44 + l[2] * 26;
            lf += inkLoop(inkEllipsePts(cx, cy, r * 1.3, r, sd + 210 + i, 9, l[0]), { seed: sd + 210 + i, t, amp: 1 }) + ' ';
            if (i % 4 === 0) fr += inkDot(cx + 14, cy + 10, 15, 15, sd + 240 + i, t) + ' ';
          });
          leafF.setAttribute('d', lf); fruit.setAttribute('d', fr);
          foreL.setAttribute('d', G.ring(pot, sd + 201, t, 6, 0.6) + ' ' + G.line([[px - 150, pt + 24], [px + 146, pt + 24]], sd + 202, t, 4) + ' ' + G.line([[px, pt], [px + sway * 0.3, pt - 150]], sd + 203, t, 9));
          const post = [[W - 150, gy - 250], [W + 40, gy - 260], [W + 40, H + 40], [W - 170, H + 40]];
          postF.setAttribute('d', inkLoop(post, { seed: sd + 220, t, amp: 0.6, smooth: false }));
          postL.setAttribute('d', G.ring(post, sd + 221, t, 6, 0.6) + ' ' + G.line([[W - 170, gy - 200], [W + 40, gy - 206]], sd + 222, t, 4) + ' ' + G.line([[W - 160, gy + 60], [W + 40, gy + 56]], sd + 223, t, 4));
          if (badge) badge.update(lt, t, cues);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
