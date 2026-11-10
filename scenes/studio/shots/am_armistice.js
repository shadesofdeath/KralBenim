// am_armistice: shots for the Stickstory Short "The last minutes of World War One" (2026-11-10): the Armistice was
// signed at about 5 a.m. on 11 November 1918 in a railway dining car in the Forest of Compiègne, to take effect at
// 11 a.m.; fighting went on for six hours (2,738 men died on the last day, Persico); Henry Gunther (US 313th Infantry)
// was killed at 10:59. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils
// at 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random. Parametric: any clock-against-time,
// signing-room or remembrance moment. Uses lh__lib.js (LH.kasif, LH.label), bb__lib.js (BBL.cast) and tank__lib.js
// (TKL.helmet / moustache).
//
// Common: labels [{text, x, y, at, size, color, font, card, rot}] (LH.label), kasif {x, y, scale, pose, face, dir,
//   emotion, seq} (LH.kasif).
//
// SHOTS.am_watch — a trench close-up: a brass pocket watch hangs on its chain from a nail on a timber post in front of a
//   plank revetment wall topped with sandbags (the set's dawn sky above it), duckboards, a mud puddle and sandbags in
//   the foreground. The watch sways a little, the second hand ticks, a glint slides over the glass, far gun flashes
//   blink on the horizon and smoke drifts over the parapet.
//   P: {from: [h, m, s] (time at lt 0), to: [h, m, s], spin: cue|s (hands run from `from` to `to`), spin_dur: 2,
//       mark: 11 (numeral circled in red at cue `mark`), x: 0.5, y: 0.36, r: 0.3 (of W), flashes: true,
//       quiet: cue (flashes stop, smoke thins, from then on), wall: 0.47 (top of the revetment, 0..1 H),
//       bursts: [{x, y (0..1, default the wall top), at, size: 1}] (big shell bursts over the parapet), labels, kasif}
//   cues: spin, mark, quiet, hit (punch), labels, kasif seq.
// SHOTS.am_carriage — inside the railway dining car before dawn: arched ceiling, a row of night windows with dark
//   forest outside, brass wall lamps that flicker, a long table with a green cloth (front hangs to the floor), the
//   armistice document in the middle where signatures write themselves one after another from cue `sign`, chair backs
//   in the foreground, and the delegates standing behind the table (BBL.cast + helmet "cap" = kepi, moustache).
//   P: {sign: cue|s, sigs: 4, lamp: true, lamp_x: 0.18, cast: [... + helmet, moustache, glasses], labels}
//   cues: sign, stamp (red seal on the document), hit, labels, cast.
// SHOTS.am_field — remembrance landscapes under the set's sky.
//   P: {mode: "crosses"|"marker"|"poppies", horizon: 0.44, count: {to: 2738, at, dur: 2, x: 0.5, y: 0.2, size: 170},
//       grow: 2.4 (seconds for the rows of crosses to rise, far to near), rows: 9, labels, kasif}
//   "crosses": rows of white wooden crosses rise row by row towards the viewer; a big number rolls up (count); mist
//     drifts; poppies sway in the foreground.
//   "marker": one rifle stuck bayonet-down in the mud with a soldier's helmet on its butt, poppies opening around it
//     (at cue `bloom`), mist drifting; the far field of crosses small behind.
//   "poppies": a poppy field rolling to the horizon, big poppies in the foreground; Kaşif (P.kasif) stands in it.
//   cues: count.at, bloom, hit, labels, kasif seq.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const SERIF = 'Fraunces, Georgia, serif';
  const labelsOf = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.3), WOOD_D = () => mix(INK.stain, INK.ink, 0.4);
  const BRASS = () => mix(INK.gold, INK.paperLight, 0.12), BRASS_D = () => mix(INK.gold, INK.ink, 0.35);
  const BAG = () => mix(INK.paperDark, INK.stain, 0.35), MUD = () => mix(INK.inkSoft, INK.stain, 0.35);
  const POPPY = () => INK.red, LEAF = () => mix(INK.green, INK.ink, 0.25);

  // ------------------------------------------------------------------ shared pieces
  function sandbag(cx, cy, w, h, sd, t, rot = 0) {
    const pts = inkEllipsePts(cx, cy, w / 2, h / 2, sd, 12, rot, 0.06);
    return { fill: inkLoop(pts, { seed: sd, t, amp: 0.8 }), ink: inkPath(pts, { seed: sd + 1, t, w: 4.5, closed: true, amp: 0.8 }) +
      ' ' + inkPath([[cx - w * 0.3, cy - h * 0.05], [cx - w * 0.1, cy + h * 0.08], [cx + w * 0.2, cy - h * 0.02]], { seed: sd + 2, t, w: 2.2, amp: 0.6 }) };
  }
  function poppy(x, y, r, sd, t, open = 1) {     // a poppy head: 4 red petals + a dark centre, on a stem down to y + r*4
    const P = [], I = [];
    if (open <= 0.02) return { petals: '', ink: '', centre: '' };
    const rr = r * open;
    for (let q = 0; q < 4; q++) {
      const a = q / 4 * Math.PI * 2 + 0.4 + Math.sin(t * 0.8 + sd) * 0.05;
      const pts = inkEllipsePts(x + Math.cos(a) * rr * 0.55, y + Math.sin(a) * rr * 0.45, rr * 0.62, rr * 0.5, sd + q, 9, a, 0.08);
      P.push(inkLoop(pts, { seed: sd + q, t, amp: 0.7 }));
      I.push(inkPath(pts, { seed: sd + 10 + q, t, w: Math.max(2, r * 0.07), closed: true, amp: 0.7 }));
    }
    return { petals: P.join(' '), ink: I.join(' '), centre: inkDot(x, y, rr * 0.28, rr * 0.24, sd + 20, t) };
  }
  function stem(x, y, len, sd, t, sway) {
    return inkPath([[x, y], [x + sway * 0.5, y + len * 0.5], [x + sway * 0.2, y + len]], { seed: sd, t, w: Math.max(2.5, len * 0.03), amp: 0.6 });
  }
  function smoke(lt, t, W, y0, sd, n, thin = 1) {        // drifting smoke wisps across a band
    const out = [];
    for (let k = 0; k < n; k++) {
      const sp = 18 + hn(sd + k) * 22, x = ((hn(sd + k, 2) * (W + 600) + lt * sp) % (W + 600)) - 300, y = y0 + hn(sd + k, 3) * 160;
      const w = (220 + hn(sd + k, 4) * 260) * thin, h = (40 + hn(sd + k, 5) * 40) * thin;
      if (w < 10) continue;
      out.push(inkLoop(inkEllipsePts(x, y + Math.sin(lt * 0.6 + k) * 10, w / 2, h / 2, sd + k * 7, 12, 0, 0.12), { seed: sd + k * 7, t, amp: 1.2 }));
    }
    return out.join(' ');
  }

  // ------------------------------------------------------------------ am_watch
  SH.am_watch = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 613, u = W / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const wallTop = (P.wall ?? 0.47) * H, floorY = H * 0.74;
      const lay = {
        flash: L(INK.gold, { 'fill-opacity': 0.85 }), flashR: L(INK.red, { 'fill-opacity': 0.6 }),
        smoke: L(INK.inkSoft, { 'fill-opacity': 0.32 }),
        bCloud: L(mix(INK.inkSoft, INK.paperDark, 0.35)), bCloudI: L(INK.inkSoft), bGlow: L(INK.gold), bCore: L(INK.red), bDirt: L(INK.ink),
        bagF: L(BAG()), bagI: L(INK.ink), wallF: L(WOOD()), wallI: L(WOOD_D()), wallE: L(INK.ink),
        postF: L(WOOD()), postI: L(INK.ink),
        floorF: L(MUD()), floorI: L(INK.ink), slatF: L(WOOD()), slatI: L(INK.ink), pud: L(mix(INK.blue, INK.paperLight, 0.45)), pudI: L(INK.inkSoft),
        fbagF: L(BAG()), fbagI: L(INK.ink),
        chain: L(BRASS_D()),
        caseF: L(BRASS()), caseD: L(BRASS_D()), caseI: L(INK.ink), face: L(INK.paperLight), faceI: L(INK.inkSoft), ticks: L(INK.ink),
        markR: L(INK.red), hands: L(INK.ink), secR: L(INK.red), glint: L(INK.paperLight, { 'fill-opacity': 0.75 }),
      };
      const numG = el(cam, 'g');
      const nums = Array.from({ length: 12 }, (_, i) => el(numG, 'text', { 'font-family': SERIF, 'font-weight': 900, fill: INK.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' }));
      nums.forEach((n, i) => { n.textContent = String(i === 0 ? 12 : i); });
      const topG = el(cam, 'g');
      const handsTop = inkEl(topG, INK.ink), secTop = inkEl(topG, INK.red), pin = inkEl(topG, BRASS_D());
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const labs = labelsOf(el(root, 'g'), P.labels, W, H);
      const toS = a => (a[0] || 0) * 3600 + (a[1] || 0) * 60 + (a[2] || 0);
      const T0 = toS(P.from || [5, 0, 0]), T1 = P.to ? toS(P.to) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1, w: 5 }, extra || {});
          const quiet = at(P.quiet ?? 'quiet', null), q = quiet == null ? 0 : prog(lt, quiet, 1.2);
          // far gun flashes over the parapet
          const FL = [], FR = [];
          if (P.flashes !== false) for (let k = 0; k < 4; k++) {
            const per = 1.3 + hn(sd + k) * 1.1, ph = ((lt + hn(sd + k, 1) * per) % per) / per, x = (0.12 + k * 0.25 + hn(sd + k, 2) * 0.08) * W;
            if (quiet != null && lt + 0 > quiet && (lt - (ph * per)) > quiet - 0.01) continue;
            if (ph < 0.22) { const k2 = 1 - ph / 0.22, r = (50 + hn(sd + k, 3) * 40) * u * (0.5 + k2);
              FL.push(inkLoop(inkEllipsePts(x, wallTop - 40 * u, r * 1.6, r * 0.7, sd + k * 5 + Math.floor(lt / per), 10, 0, 0.2), o(30 + k, { amp: 1.5 })));
              FR.push(inkDot(x, wallTop - 34 * u, r * 0.5, r * 0.25, sd + 40 + k, t)); }
          }
          lay.flash.setAttribute('d', FL.join(' ')); lay.flashR.setAttribute('d', FR.join(' '));
          lay.smoke.setAttribute('d', smoke(lt, t, W, wallTop - 360 * u, sd + 60, 5, 1 - q * 0.85));
          // big shell bursts over the parapet: P.bursts [{x (0..1), y (0..1, base), at (cue|s), size: 1}]
          const BC = [], BCI = [], BG = [], BR = [], BD = [];
          (P.bursts || []).forEach((b, k) => {
            const a0 = at(b.at, 0.2), age = lt - a0; if (age < 0) return;
            const bx = b.x * W, by = (b.y ?? (P.wall ?? 0.47)) * H, z = (b.size ?? 1) * u;
            if (age < 0.6) { const f = 1 - age / 0.6;
              const sp = []; for (let j = 0; j < 14; j++) { const an = j / 14 * Math.PI * 2, rr = (j % 2 ? 90 : 210) * z * (0.6 + 0.4 * f); sp.push([bx + Math.cos(an) * rr * 1.2, by - 120 * z + Math.sin(an) * rr]); }
              BG.push(inkLoop(sp, o(700 + k, { smooth: false, amp: 2 })));
              BR.push(inkLoop(inkEllipsePts(bx, by - 110 * z, 90 * z * f + 20 * z, 70 * z * f + 16 * z, sd + 710 + k, 10, 0, 0.2), o(711 + k, { amp: 1.5 }))); }
            const grow = clamp01(age / 1.4), rise = age * 60 * z;
            for (let j = 0; j < 7; j++) { const an = -Math.PI * (0.1 + 0.8 * j / 6), rr = (120 + 90 * grow) * z,
                cx = bx + Math.cos(an) * rr * 0.9, cy = by - 150 * z - rise + Math.sin(an) * rr * 0.8, r = (70 + 60 * grow + hn(k, j) * 30) * z;
              const pts = inkEllipsePts(cx, cy, r, r * 0.85, sd + 720 + k * 10 + j, 10, 0, 0.12);
              BC.push(inkLoop(pts, o(720 + k * 10 + j, { amp: 1.2 }))); BCI.push(inkPath(pts, o(740 + k * 10 + j, { closed: true, w: 2.5, amp: 1.2 }))); }
            const core = inkEllipsePts(bx, by - 120 * z - rise * 0.5, (110 + 50 * grow) * z, (90 + 40 * grow) * z, sd + 760 + k, 10, 0, 0.12);
            BC.push(inkLoop(core, o(761 + k, { amp: 1.2 })));
            for (let j = 0; j < 8; j++) { const an = -Math.PI * (0.15 + 0.7 * j / 7), d = (100 + age * 520) * z, g = age * age * 420 * z;
              if (age < 1.2) BD.push(inkDot(bx + Math.cos(an) * d, by - 100 * z + Math.sin(an) * d + g, 10 * z, 8 * z, sd + 780 + j, t)); }
          });
          lay.bCloud.setAttribute('d', BC.join(' ')); lay.bCloudI.setAttribute('d', BCI.join(' '));
          lay.bGlow.setAttribute('d', BG.join(' ')); lay.bCore.setAttribute('d', BR.join(' ')); lay.bDirt.setAttribute('d', BD.join(' '));
          // sandbag parapet on top of the wall
          const BF = [], BI = [];
          for (let r = 0; r < 2; r++) for (let x = -60 + r * 70; x < W + 120; x += 150 * u) {
            const b = sandbag(x, wallTop - 30 * u - r * 54 * u, 160 * u, 64 * u, sd + 100 + r * 40 + Math.round(x), t, hn(x, r) * 0.2 - 0.1);
            BF.push(b.fill); BI.push(b.ink);
          }
          lay.bagF.setAttribute('d', BF.join(' ')); lay.bagI.setAttribute('d', BI.join(' '));
          // plank revetment wall
          lay.wallF.setAttribute('d', inkLoop([[-30, wallTop], [W + 30, wallTop], [W + 30, floorY], [-30, floorY]], o(1, { smooth: false, amp: 0.6 })));
          const WL = [], WE = [];
          for (let y = wallTop + 70 * u, i = 0; y < floorY - 20; y += 78 * u, i++) {
            WE.push(inkPath([[-20, y], [W * 0.5, y + 4 * Math.sin(i)], [W + 20, y - 2]], o(10 + i, { w: 4 })));
            for (let k = 0; k < 3; k++) { const gx = hn(i, k) * W; WL.push(inkPath([[gx, y - 40 * u], [gx + 120 * u, y - 38 * u]], o(50 + i * 3 + k, { w: 2 }))); }
          }
          [0.08, 0.92].forEach((x, k) => WE.push(inkPath([[x * W, wallTop - 10], [x * W, floorY]], o(20 + k, { w: 9 }))));
          lay.wallI.setAttribute('d', WL.join(' ')); lay.wallE.setAttribute('d', WE.join(' '));
          // the timber post with the nail (watch hangs from it)
          const cx0 = (P.x ?? 0.5) * W, cy0 = (P.y ?? 0.36) * H, R = (P.r ?? 0.3) * W;
          const nailY = cy0 - R - 230 * u;
          const post = [[cx0 - 70 * u, nailY - 520 * u], [cx0 + 70 * u, nailY - 520 * u], [cx0 + 76 * u, floorY + 10], [cx0 - 76 * u, floorY + 10]];
          lay.postF.setAttribute('d', inkLoop(post, o(25, { smooth: false, amp: 0.6 })));
          lay.postI.setAttribute('d', inkPath(post, o(26, { closed: true, smooth: false, w: 7 })) + ' ' +
            [0.3, 0.55, 0.8].map((v, k) => inkPath([[cx0 - 40 * u + k * 20 * u, lerp(nailY - 480 * u, floorY, v)], [cx0 - 20 * u + k * 20 * u, lerp(nailY - 480 * u, floorY, v) + 140 * u]], o(27 + k, { w: 2.5 }))).join(' ') +
            ' ' + inkDot(cx0, nailY, 12 * u, 12 * u, sd + 29, t));
          // floor: mud + duckboards + puddle
          lay.floorF.setAttribute('d', inkLoop([[-30, floorY], [W + 30, floorY], [W + 30, H + 30], [-30, H + 30]], o(2, { smooth: false, amp: 0.6 })));
          lay.floorI.setAttribute('d', inkPath([[-20, floorY], [W + 20, floorY + 3]], o(3, { w: 6 })));
          const SF = [], SI = [];
          const bx0 = W * 0.18, bx1 = W * 0.82;
          for (let k = 0; k < 7; k++) {
            const y0 = floorY + 30 * u + Math.pow(k / 7, 1.25) * (H - floorY), y1 = y0 + (34 + k * 12) * u, sp = 1 + k * 0.12;
            const sl = [[W / 2 - (W / 2 - bx0) * sp, y0], [W / 2 + (bx1 - W / 2) * sp, y0], [W / 2 + (bx1 - W / 2) * sp + 10, y1], [W / 2 - (W / 2 - bx0) * sp - 10, y1]];
            SF.push(inkLoop(sl, o(70 + k, { smooth: false, amp: 0.7 }))); SI.push(inkPath(sl, o(80 + k, { closed: true, smooth: false, w: 4 })));
          }
          SI.push(inkPath([[bx0, floorY + 30 * u], [bx0 - 160 * u, H + 20]], o(90, { w: 7 })), inkPath([[bx1, floorY + 30 * u], [bx1 + 160 * u, H + 20]], o(91, { w: 7 })));
          lay.slatF.setAttribute('d', SF.join(' ')); lay.slatI.setAttribute('d', SI.join(' '));
          const pcx = W * 0.82, pcy = H * 0.86;
          lay.pud.setAttribute('d', inkLoop(inkEllipsePts(pcx, pcy, 200 * u, 50 * u, sd + 92, 12, 0, 0.1), o(92)));
          const RP = []; for (let k = 0; k < 3; k++) { const ph = ((lt * 0.5 + k / 3) % 1); RP.push(inkPath(inkEllipsePts(pcx, pcy, 40 * u + ph * 150 * u, (10 + ph * 36) * u, sd + 93 + k, 12), o(93 + k, { closed: true, w: 3 * (1 - ph) + 0.5 }))); }
          lay.pudI.setAttribute('d', RP.join(' '));
          // foreground sandbags in the corners
          const FB = [], FI = [];
          [[0.06, 0.95, 300, 120], [0.2, 1.0, 280, 110], [0.02, 0.89, 260, 100], [0.98, 0.97, 300, 120], [0.84, 1.02, 280, 110]].forEach(([x, y, w, h], k) => {
            const b = sandbag(x * W, y * H, w * u, h * u, sd + 300 + k * 9, t, (k % 2 ? 0.12 : -0.1)); FB.push(b.fill); FI.push(b.ink); });
          lay.fbagF.setAttribute('d', FB.join(' ')); lay.fbagI.setAttribute('d', FI.join(' '));
          // time
          const spinA = at(P.spin ?? 'spin', null), sdur = P.spin_dur ?? 2;
          let T, ticking = true;
          if (spinA != null && T1 != null) {
            if (lt < spinA) T = T0 + lt;
            else if (lt < spinA + sdur) { T = lerp(T0 + spinA, T1, progIO(lt, spinA, sdur)); ticking = false; }
            else T = T1 + (lt - spinA - sdur);
          } else T = T0 + lt;
          // the watch swings a little on its chain
          const sw = Math.sin(lt * 1.3) * 0.035 + punch(lt, at('hit', null), 0.8) * 0.05;
          const chainL = cy0 - R - 40 * u - nailY;
          const cx = cx0 + Math.sin(sw) * (chainL + R), cy = nailY + Math.cos(sw) * (chainL + R);
          const bow = [cx - Math.sin(sw) * (R + 40 * u), cy - Math.cos(sw) * (R + 40 * u)];
          const CH = []; const nL = 9;
          for (let k = 0; k <= nL; k++) { const v = k / nL, px = lerp(cx0, bow[0], v), py = lerp(nailY, bow[1], v) + Math.sin(v * Math.PI) * 18 * u;
            CH.push(inkCircle(px, py, 12 * u, sd + 400 + k, t, { w: 4, ry: 8 * u, rot: (k % 2) * 1.4 })); }
          lay.chain.setAttribute('d', CH.join(' '));
          // case: crown + bow + body
          lay.caseD.setAttribute('d', inkCircle(cx + 10 * u, cy + 14 * u, R * 1.13, sd + 410, t, { fill: true }) + ' ' +
            inkLoop([[bow[0] - 34 * u, bow[1] + 10 * u], [bow[0] + 34 * u, bow[1] + 10 * u], [bow[0] + 30 * u, bow[1] + 56 * u], [bow[0] - 30 * u, bow[1] + 56 * u]], o(411, { smooth: false })));
          lay.caseF.setAttribute('d', inkCircle(cx, cy, R * 1.12, sd + 412, t, { fill: true }));
          lay.caseI.setAttribute('d', inkCircle(cx, cy, R * 1.12, sd + 413, t, { w: 8 }) + ' ' + inkCircle(cx, cy, R * 1.01, sd + 414, t, { w: 4 }) + ' ' +
            inkPath([[bow[0] - 34 * u, bow[1] + 10 * u], [bow[0] + 34 * u, bow[1] + 10 * u], [bow[0] + 30 * u, bow[1] + 56 * u], [bow[0] - 30 * u, bow[1] + 56 * u]], o(415, { closed: true, smooth: false, w: 5 })) + ' ' +
            inkCircle(bow[0], bow[1] - 6 * u, 34 * u, sd + 416, t, { w: 7 }));
          lay.face.setAttribute('d', inkCircle(cx, cy, R, sd + 420, t, { fill: true }));
          lay.faceI.setAttribute('d', inkCircle(cx, cy, R * 0.66, sd + 421, t, { w: 2.5 }));
          const TK = [];
          for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, big = i % 5 === 0, r0 = R * (big ? 0.86 : 0.91);
            TK.push(inkPath([[cx + Math.sin(a) * r0, cy - Math.cos(a) * r0], [cx + Math.sin(a) * R * 0.96, cy - Math.cos(a) * R * 0.96]], { seed: sd + 430 + i, t, w: big ? 6 : 2.6, amp: 0.3 })); }
          lay.ticks.setAttribute('d', TK.join(' '));
          const ns = R * 0.19;
          nums.forEach((n, i) => { const a = i / 12 * Math.PI * 2, b = boil(sd + 500 + i, t, 0.8);
            n.setAttribute('x', f1(cx + Math.sin(a) * R * 0.72 + b[0])); n.setAttribute('y', f1(cy - Math.cos(a) * R * 0.72 + b[1])); n.setAttribute('font-size', f1(ns)); });
          // red circle on a numeral
          const ma = at('mark', null), mk = P.mark ?? 11;
          if (ma != null && lt >= ma) {
            const a = (mk % 12) / 12 * Math.PI * 2, mx = cx + Math.sin(a) * R * 0.72, my = cy - Math.cos(a) * R * 0.72, mp = prog(lt, ma, 0.6);
            const pts = inkEllipsePts(mx, my, ns * 0.95, ns * 0.8, sd + 520, 14, -0.3, 0.06);
            const nn = Math.max(2, Math.round(pts.length * mp)); const ring = pts.slice(0, nn); if (mp >= 1) ring.push(pts[0], pts[1]);
            lay.markR.setAttribute('d', inkPath(ring, { seed: sd + 521, t, w: 9, amp: 0.8 }));
            nums[mk % 12].setAttribute('fill', INK.red);
          } else { lay.markR.setAttribute('d', ''); nums[mk % 12].setAttribute('fill', INK.ink); }
          // hands
          const tS = ticking ? Math.floor(T) : T;
          const ah = (T % 43200) / 43200 * Math.PI * 2, am = (T % 3600) / 3600 * Math.PI * 2, as = (tS % 60) / 60 * Math.PI * 2;
          const hand = (a, len, back, w, k) => inkPath([[cx - Math.sin(a) * back, cy + Math.cos(a) * back], [cx + Math.sin(a) * len, cy - Math.cos(a) * len]], { seed: sd + k, t, w, amp: 0.3, taper: 0.5 });
          const spade = (a, r0, s) => { const px = cx + Math.sin(a) * r0, py = cy - Math.cos(a) * r0; return inkLoop(inkEllipsePts(px, py, s * 0.6, s, sd + 540, 8, a, 0.02), { seed: sd + 541, t, amp: 0.3 }); };
          handsTop.setAttribute('d', hand(ah, R * 0.5, R * 0.08, 16 * u, 550) + ' ' + spade(ah, R * 0.42, 22 * u) + ' ' + hand(am, R * 0.8, R * 0.1, 10 * u, 551) + ' ' + spade(am, R * 0.68, 16 * u));
          secTop.setAttribute('d', hand(as, R * 0.88, R * 0.2, 4.5 * u, 552) + ' ' + inkDot(cx - Math.sin(as) * R * 0.17, cy + Math.cos(as) * R * 0.17, 12 * u, 12 * u, sd + 553, t));
          pin.setAttribute('d', inkDot(cx, cy, 16 * u, 16 * u, sd + 554, t));
          lay.hands.setAttribute('d', ''); lay.secR.setAttribute('d', '');
          // glint
          const gp = (lt * 0.25) % 1, ga = -2.3 + gp * 1.2;
          const GL = []; for (let k = 0; k < 6; k++) { const a = ga + k * 0.09; GL.push([cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86]); }
          for (let k = 5; k >= 0; k--) { const a = ga + k * 0.09; GL.push([cx + Math.cos(a) * R * 0.74, cy + Math.sin(a) * R * 0.74]); }
          lay.glint.setAttribute('d', inkLoop(GL, o(560, { amp: 0.4 })));
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.03 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          if (kas) kas.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ am_carriage
  SH.am_carriage = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 271, u = W / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const lay = {
        ceilF: L(mix(INK.paperDark, INK.stain, 0.25)), ceilI: L(INK.ink),
        wallF: L(mix(WOOD(), INK.paperDark, 0.35)), wallI: L(WOOD_D()),
        winF: L(mix(INK.ink, INK.blue, 0.45)), trees: L(mix(INK.ink, INK.green, 0.15)), moon: L(INK.paperLight), winI: L(INK.ink),
        lampG: L(INK.gold, { 'fill-opacity': 0.35 }), lampF: L(BRASS()), lampI: L(INK.ink),
      };
      const castG = el(cam, 'g');
      const capF = inkEl(cam, INK.inkSoft), capI = inkEl(cam, INK.ink);
      const L2 = (fill, extra) => inkEl(cam, fill, extra || {});
      const tab = { topF: L2(mix(INK.green, INK.paperDark, 0.45)), topI: L2(INK.ink), clothF: L2(mix(INK.green, INK.ink, 0.2)), clothI: L2(INK.ink),
        docF: L2(INK.paperLight), docI: L2(INK.ink), lines: L2(INK.inkSoft), sig: L2(INK.ink), seal: L2(INK.red),
        inkpot: L2(INK.ink), lampF: L2(BRASS()), lampI: L2(INK.ink), lampG: L2(INK.gold, { 'fill-opacity': 0.5 }),
        floorF: L2(mix(INK.red, INK.ink, 0.55)), floorI: L2(mix(INK.gold, INK.ink, 0.3)),
        chairF: L2(WOOD()), chairI: L2(INK.ink), seatF: L2(mix(INK.red, INK.ink, 0.3)) };
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = labelsOf(el(root, 'g'), P.labels, W, H);
      const ty0 = H * 0.565, ty1 = H * 0.62, cl1 = H * 0.79;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1, w: 5 }, extra || {});
          // arched ceiling
          const arc = []; for (let k = 0; k <= 12; k++) { const v = k / 12; arc.push([v * (W + 80) - 40, H * 0.09 - Math.sin(v * Math.PI) * 60 * u]); }
          lay.ceilF.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40]].concat(arc.slice().reverse()), o(1, { amp: 0.6 })));
          lay.ceilI.setAttribute('d', inkPath(arc, o(2, { w: 7 })) + ' ' + inkPath(arc.map(p => [p[0], p[1] + 34 * u]), o(3, { w: 3 })) + ' ' +
            [0.2, 0.5, 0.8].map((x, k) => inkPath([[x * W, -20], [x * W, H * 0.09 - Math.sin(x * Math.PI) * 60 * u]], o(4 + k, { w: 4 }))).join(' '));
          // wall panelling
          lay.wallF.setAttribute('d', inkLoop([[-40, H * 0.1], [W + 40, H * 0.1], [W + 40, ty1], [-40, ty1]], o(8, { smooth: false, amp: 0.6 })));
          // windows: night forest outside
          const WF = [], TR = [], WI = [], MO = [];
          const wins = [0.17, 0.5, 0.83], ww = 250 * u, wy0 = H * 0.16, wy1 = H * 0.37;
          wins.forEach((wx, k) => {
            const x0 = wx * W - ww / 2, x1 = wx * W + ww / 2;
            const fr = [[x0, wy0 + 30 * u], [x0 + 30 * u, wy0], [x1 - 30 * u, wy0], [x1, wy0 + 30 * u], [x1, wy1], [x0, wy1]];
            WF.push(inkLoop(fr, o(10 + k, { smooth: false, amp: 0.6 })));
            for (let j = 0; j < 4; j++) { const tx = x0 + (j + 0.3 + hn(k, j) * 0.4) / 4 * ww, th = (180 + hn(j, k) * 150) * u, sw = Math.sin(lt * 0.7 + j + k) * 5 * u, base = wy1 + 4;
              TR.push(inkLoop([[tx - 46 * u, base], [tx - 26 * u, base - th * 0.45], [tx - 34 * u, base - th * 0.45], [tx + sw, base - th], [tx + 34 * u, base - th * 0.45], [tx + 26 * u, base - th * 0.45], [tx + 46 * u, base]], o(20 + k * 5 + j, { smooth: false, amp: 0.8 }))); }
            WI.push(inkPath(fr, o(40 + k, { closed: true, smooth: false, w: 9 })), inkPath([[x0, (wy0 + wy1) / 2 - 20 * u], [x1, (wy0 + wy1) / 2 - 20 * u]], o(45 + k, { w: 4 })));
            if (k === 2) MO.push(inkCircle(x1 - 60 * u, wy0 + 70 * u, 26 * u, sd + 50, t, { fill: true }));
          });
          lay.winF.setAttribute('d', WF.join(' ')); lay.trees.setAttribute('d', TR.join(' ')); lay.winI.setAttribute('d', WI.join(' ')); lay.moon.setAttribute('d', MO.join(' '));
          const WL = [];
          [0.335, 0.665].forEach((x, k) => WL.push(inkPath([[x * W, H * 0.12], [x * W, ty0 - 10]], o(60 + k, { w: 4 }))));
          WL.push(inkPath([[-20, H * 0.415], [W + 20, H * 0.415]], o(63, { w: 5 })), inkPath([[-20, H * 0.43], [W + 20, H * 0.43]], o(64, { w: 2.5 })));
          // panel outlines (thin strokes)
          const PN = []; for (let x = 40 * u, k = 0; x < W; x += 180 * u, k++) PN.push(inkPath([[x, H * 0.45], [x + 140 * u, H * 0.45], [x + 140 * u, ty0 - 20 * u], [x, ty0 - 20 * u]], o(80 + k, { closed: true, smooth: false, w: 3 })));
          lay.wallI.setAttribute('d', WL.join(' ') + ' ' + PN.join(' '));
          // wall lamps between the windows (flicker)
          const LG = [], LF = [], LI = [];
          [0.335, 0.665].forEach((x, k) => { const lx = x * W, ly = H * 0.3, fl = 1 + Math.sin(lt * 9 + k * 2) * 0.05 + Math.sin(lt * 23 + k) * 0.03;
            LG.push(inkCircle(lx, ly - 10 * u, 70 * u * fl, sd + 90 + k, t, { fill: true }));
            const gl = [[lx - 26 * u, ly + 20 * u], [lx - 32 * u, ly - 40 * u], [lx, ly - 64 * u], [lx + 32 * u, ly - 40 * u], [lx + 26 * u, ly + 20 * u]];
            LF.push(inkLoop(gl, o(92 + k, { amp: 0.5 })));
            LI.push(inkPath(gl, o(94 + k, { closed: true, w: 4 })), inkPath([[lx - 36 * u, ly + 24 * u], [lx + 36 * u, ly + 24 * u]], o(96 + k, { w: 8 })), inkPath([[lx, ly + 24 * u], [lx, ly + 70 * u]], o(98 + k, { w: 6 }))); });
          lay.lampG.setAttribute('d', LG.join(' ')); lay.lampF.setAttribute('d', LF.join(' ')); lay.lampI.setAttribute('d', LI.join(' '));
          // cast (behind the table) + kepis / moustaches
          const cres = cast.update(lt, t, cues), CF = [], CI = [];
          (P.cast || []).forEach((m, i) => { const q = cres[i]; if (!q) return;
            if (m.helmet) { const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + 200 + i * 20); CF.push(h.fill); CI.push(h.ink); }
            if (m.moustache) CI.push(T.moustache(q.head, q.face, q.s, t, sd + 260 + i * 7));
            if (m.glasses) { const r = 13 * q.s, gx = q.head[0] + q.face * 30 * q.s, gy = q.head[1] - 4 * q.s;
              CI.push(inkCircle(gx - r * 1.1, gy, r, sd + 280 + i, t, { w: 3, n: 8 }), inkCircle(gx + r * 1.1, gy, r, sd + 281 + i, t, { w: 3, n: 8 })); } });
          capF.setAttribute('d', CF.join(' ')); capI.setAttribute('d', CI.join(' '));
          // table
          const tx0 = -40, tx1 = W + 40;
          const top = [[tx0 + 80 * u, ty0], [tx1 - 80 * u, ty0], [tx1, ty1], [tx0, ty1]];
          tab.topF.setAttribute('d', inkLoop(top, o(100, { smooth: false, amp: 0.6 })));
          tab.topI.setAttribute('d', inkPath(top, o(101, { closed: true, smooth: false, w: 6 })));
          const fold = []; for (let k = 0; k <= 14; k++) fold.push([lerp(tx0, tx1, k / 14), cl1 + Math.sin(k * 1.7 + lt * 0.6) * 6 * u]);
          tab.clothF.setAttribute('d', inkLoop([[tx0, ty1], [tx1, ty1]].concat(fold.slice().reverse()), o(102, { amp: 0.6 })));
          const CL = [inkPath(fold, o(103, { w: 6 }))]; for (let k = 1; k < 9; k++) { const x = k / 9 * W; CL.push(inkPath([[x, ty1 + 10], [x + 6 * u, cl1 - 10]], o(104 + k, { w: 2.5 }))); }
          tab.clothI.setAttribute('d', CL.join(' '));
          // the document + signatures
          const dcx = W * 0.5, dcy = (ty0 + ty1) / 2, dw = 300 * u, dh = 96 * u;
          const doc = [[dcx - dw / 2 + 20 * u, dcy - dh / 2], [dcx + dw / 2 + 10 * u, dcy - dh / 2 - 4 * u], [dcx + dw / 2 - 6 * u, dcy + dh / 2], [dcx - dw / 2, dcy + dh / 2 + 4 * u]];
          tab.docF.setAttribute('d', inkLoop(doc, o(120, { smooth: false, amp: 0.5 })));
          tab.docI.setAttribute('d', inkPath(doc, o(121, { closed: true, smooth: false, w: 3.5 })));
          const LN = []; for (let k = 0; k < 3; k++) LN.push(inkPath([[dcx - dw * 0.38, dcy - dh * 0.3 + k * 18 * u], [dcx + dw * 0.38, dcy - dh * 0.3 + k * 18 * u]], o(122 + k, { w: 2 })));
          tab.lines.setAttribute('d', LN.join(' '));
          const sa = at(P.sign ?? 'sign', 0.6), nS = P.sigs ?? 4, SG = [];
          for (let k = 0; k < nS; k++) {
            const p = clamp01((lt - sa - k * 0.55) / 0.5); if (p <= 0) continue;
            const x0 = dcx - dw * 0.42 + k * dw * 0.22, y0 = dcy + dh * 0.28, pts = [];
            for (let j = 0; j <= 10; j++) { const v = j / 10; pts.push([x0 + v * dw * 0.18, y0 - Math.sin(v * 9 + k) * 9 * u - v * 6 * u]); }
            SG.push(inkPath(pts.slice(0, Math.max(2, Math.round(pts.length * p))), { seed: sd + 130 + k, t, w: 3.2, amp: 0.4 }));
          }
          tab.sig.setAttribute('d', SG.join(' '));
          const st = at('stamp', null), sp = st == null ? 0 : spring(lt, st, 0.4);
          tab.seal.setAttribute('d', sp > 0 ? inkCircle(dcx + dw * 0.38, dcy - dh * 0.1, 26 * u * (1.6 - 0.6 * sp), sd + 140, t, { fill: true }) : '');
          tab.inkpot.setAttribute('d', inkLoop([[dcx + dw * 0.75, dcy - 6 * u], [dcx + dw * 0.75 + 50 * u, dcy - 6 * u], [dcx + dw * 0.75 + 44 * u, dcy - 50 * u], [dcx + dw * 0.75 + 6 * u, dcy - 50 * u]], o(141, { smooth: false, amp: 0.5 })) + ' ' +
            inkPath([[dcx + dw * 0.75 + 26 * u, dcy - 50 * u], [dcx + dw * 0.75 + 60 * u, dcy - 120 * u]], o(142, { w: 4 })));
          // a table lamp (P.lamp: false hides it)
          const lx = W * (P.lamp_x ?? 0.18), ly = ty0 + 10 * u, fl = 1 + Math.sin(lt * 11) * 0.04;
          tab.lampG.setAttribute('d', inkCircle(lx, ly - 130 * u, 60 * u * fl, sd + 150, t, { fill: true }));
          const shade = [[lx - 70 * u, ly - 100 * u], [lx - 34 * u, ly - 170 * u], [lx + 34 * u, ly - 170 * u], [lx + 70 * u, ly - 100 * u]];
          tab.lampF.setAttribute('d', inkLoop(shade, o(151, { smooth: false, amp: 0.5 })) + ' ' + inkLoop([[lx - 40 * u, ly], [lx + 40 * u, ly], [lx + 24 * u, ly - 20 * u], [lx - 24 * u, ly - 20 * u]], o(152, { smooth: false })));
          tab.lampI.setAttribute('d', inkPath(shade, o(153, { closed: true, smooth: false, w: 5 })) + ' ' + inkPath([[lx, ly - 20 * u], [lx, ly - 100 * u]], o(154, { w: 7 })));
          if (P.lamp === false) [tab.lampG, tab.lampF, tab.lampI].forEach(e => e.setAttribute('d', ''));
          // floor + chair backs in the foreground
          tab.floorF.setAttribute('d', inkLoop([[-40, cl1], [W + 40, cl1], [W + 40, H + 40], [-40, H + 40]], o(160, { smooth: false, amp: 0.5 })));
          const FI = []; for (let k = 0; k < 5; k++) { const y = cl1 + 40 * u + k * 90 * u; FI.push(inkPath([[-20, y], [W + 20, y + 3]], o(161 + k, { w: 2.5 }))); }
          tab.floorI.setAttribute('d', FI.join(' '));
          const CHF = [], CHI = [], CSF = [];
          [0.2, 0.8].forEach((x, k) => { const cx = x * W, cyT = H * 0.83, cw = 300 * u;
            const back = [[cx - cw / 2, H + 40], [cx - cw / 2 + 10 * u, cyT + 40 * u], [cx - cw / 2 + 40 * u, cyT], [cx + cw / 2 - 40 * u, cyT], [cx + cw / 2 - 10 * u, cyT + 40 * u], [cx + cw / 2, H + 40]];
            CHF.push(inkLoop(back, o(170 + k, { amp: 0.6 })));
            CSF.push(inkLoop([[cx - cw / 2 + 40 * u, cyT + 50 * u], [cx + cw / 2 - 40 * u, cyT + 50 * u], [cx + cw / 2 - 30 * u, H + 40], [cx - cw / 2 + 30 * u, H + 40]], o(172 + k, { smooth: false, amp: 0.6 })));
            CHI.push(inkPath(back, o(174 + k, { w: 8 })), inkPath([[cx - cw / 2 + 40 * u, cyT + 50 * u], [cx + cw / 2 - 40 * u, cyT + 50 * u]], o(176 + k, { w: 4 }))); });
          tab.chairF.setAttribute('d', CHF.join(' ')); tab.seatF.setAttribute('d', CSF.join(' ')); tab.chairI.setAttribute('d', CHI.join(' '));
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ am_field
  SH.am_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const T = window.TKL, sd = seed * 1000 + 997, u = W / 1080, mode = P.mode || 'crosses';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const hz = (P.horizon ?? 0.44) * H;
      const lay = {
        mist: L(INK.paperLight, { 'fill-opacity': 0.45 }),
        ground: L(mix(INK.green, INK.paperDark, 0.55)), groundI: L(mix(INK.green, INK.ink, 0.4)),
        crossS: L(INK.ink, { 'fill-opacity': 0.18 }), crossF: L(INK.paperLight), crossI: L(INK.ink),
        mud: L(MUD()), mudI: L(INK.ink), rifleF: L(WOOD()), rifleI: L(INK.ink), steel: L(mix(INK.inkSoft, INK.paperLight, 0.3)),
        helmF: L(mix(INK.green, INK.inkSoft, 0.5)), helmI: L(INK.ink),
        stems: L(LEAF()), petalsFar: L(POPPY()), petals: L(POPPY()), pInk: L(INK.ink), pCtr: L(INK.ink),
      };
      const kas = P.kasif ? window.LH.kasif(el(root, 'g'), P.kasif, W, H, seed) : null;
      const front = { stems: inkEl(root, LEAF()), leaves: inkEl(root, LEAF()), petals: inkEl(root, POPPY()), pInk: inkEl(root, INK.ink), pCtr: inkEl(root, INK.ink) };
      const cntG = el(root, 'g');
      const cntCard = P.count ? inkEl(cntG, INK.paperLight) : null, cntR = P.count ? inkEl(cntG, INK.ink) : null;
      const cntT = P.count ? el(cntG, 'text', { 'font-family': SERIF, 'font-weight': 900, fill: INK.red, 'text-anchor': 'middle', 'dominant-baseline': 'central' }) : null;
      const labs = labelsOf(el(root, 'g'), P.labels, W, H);
      const rows = P.rows ?? 9, grow = P.grow ?? 2.4;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1, w: 5 }, extra || {});
          // ground plane with gentle rolls
          const gl = []; for (let x = -40; x <= W + 40; x += 60) gl.push([x, hz + Math.sin(x * 0.004 + 1) * 14 * u]);
          lay.ground.setAttribute('d', inkLoop(gl.concat([[W + 40, H + 40], [-40, H + 40]]), o(1, { amp: 0.6, smooth: false })));
          const GI = [inkPath(gl, o(2, { w: 4 }))];
          for (let k = 0; k < 7; k++) { const y = hz + Math.pow((k + 1) / 8, 1.7) * (H - hz); for (let j = 0; j < 4; j++) { const x = hn(k, j) * W; GI.push(inkPath([[x, y], [x + (60 + k * 20) * u, y - 2]], o(3 + k * 4 + j, { w: 1.5 + k * 0.4 }))); } }
          lay.groundI.setAttribute('d', GI.join(' '));
          // crosses in perspective rows (far -> near)
          const CS = [], CF = [], CI = [];
          const crossAt = (x, y, s, k, rise) => {
            if (rise <= 0) return;
            const h = 150 * s * rise, w = 18 * s, bw = 92 * s, by = y - h * 0.72;
            const post = [[x - w / 2, y], [x - w / 2, y - h], [x + w / 2, y - h], [x + w / 2, y]];
            const bar = [[x - bw / 2, by - w / 2], [x + bw / 2, by - w / 2], [x + bw / 2, by + w / 2], [x - bw / 2, by + w / 2]];
            CS.push(inkLoop([[x - w / 2, y], [x + w / 2, y], [x + 60 * s, y + 18 * s], [x + 40 * s, y + 22 * s]], { seed: sd + k, t, amp: 0.4, smooth: false }));
            CF.push(inkLoop(post, { seed: sd + k + 1, t, amp: 0.4, smooth: false }), inkLoop(bar, { seed: sd + k + 2, t, amp: 0.4, smooth: false }));
            const ww = Math.max(1.6, 3.6 * s);
            CI.push(inkPath(post, { seed: sd + k + 3, t, w: ww, closed: true, amp: 0.4, smooth: false }), inkPath(bar, { seed: sd + k + 4, t, w: ww, closed: true, amp: 0.4, smooth: false }));
          };
          if (mode === 'crosses' || mode === 'marker') {
            const nR = mode === 'marker' ? 4 : rows, t0 = at(P.grow_at, 0.1);
            for (let r = 0; r < nR; r++) {
              const v = (r + 1) / (nR + 1), y = hz + 20 * u + Math.pow(v, mode === 'marker' ? 2.6 : 1.9) * (H * (mode === 'marker' ? 0.5 : 0.98) - hz), s = (0.22 + Math.pow(v, 1.9) * 2.2) * u * (mode === 'marker' ? 0.45 : 1);
              const gap = 150 * s, off = (r % 2) * gap * 0.5;
              const rise = mode === 'marker' ? 1 : spring(lt, t0 + r / nR * grow, 0.6);
              for (let x = -gap + off; x < W + gap; x += gap) crossAt(x, y, s, r * 100 + Math.round(x), rise);
            }
          }
          lay.crossS.setAttribute('d', CS.join(' ')); lay.crossF.setAttribute('d', CF.join(' ')); lay.crossI.setAttribute('d', CI.join(' '));
          // the rifle marker
          if (mode === 'marker') {
            const mx = (P.x ?? 0.5) * W, my = H * 0.66, sc = 1.25 * u;
            lay.mud.setAttribute('d', inkLoop(inkEllipsePts(mx, my + 10 * sc, 220 * sc, 40 * sc, sd + 600, 12, 0, 0.12), o(600)));
            lay.mudI.setAttribute('d', inkPath(inkEllipsePts(mx, my + 10 * sc, 220 * sc, 40 * sc, sd + 600, 12, 0, 0.12), o(601, { closed: true, w: 4 })));
            const lean = 0.05 + Math.sin(lt * 0.5) * 0.004;
            const R = (a, b) => [mx + a * Math.cos(lean) - b * Math.sin(lean), my + a * Math.sin(lean) + b * Math.cos(lean)];
            const RS = (pts) => pts.map(([a, b]) => R(a * sc, b * sc));
            const wood = RS([[-34, -640], [34, -640], [30, -600], [14, -480], [16, -440], [18, -130], [-18, -130], [-16, -440], [-14, -480], [-30, -600]]);
            const metal = RS([[-9, -130], [9, -130], [8, 0], [-8, 0]]);
            lay.rifleF.setAttribute('d', inkLoop(wood, o(610, { smooth: false, amp: 0.5 })));
            lay.steel.setAttribute('d', inkLoop(metal, o(611, { smooth: false, amp: 0.4 })) + ' ' + inkLoop(RS([[-20, -470], [20, -470], [20, -420], [-20, -420]]), o(615, { smooth: false, amp: 0.4 })));
            lay.rifleI.setAttribute('d', inkPath(wood, o(612, { closed: true, smooth: false, w: 5 })) + ' ' + inkPath(metal, o(613, { closed: true, smooth: false, w: 4 })) + ' ' +
              inkPath(RS([[-20, -470], [20, -470], [20, -420], [-20, -420]]), o(616, { closed: true, smooth: false, w: 4 })) + ' ' +
              inkPath(RS([[20, -455], [52, -470], [58, -486]]), o(614, { w: 5 })) + ' ' + inkPath(RS([[16, -410], [34, -390], [16, -372]]), o(617, { w: 4 })) + ' ' +
              inkPath(RS([[-18, -300], [18, -300]]), o(618, { w: 3 })) + ' ' + inkPath(RS([[-18, -200], [18, -200]]), o(619, { w: 3 })));
            const hs = 0.6 * sc * 2.1, hR = 72 * hs, top = R(0, -640 * sc);
            const hm = T.helmet([top[0], top[1] + 0.42 * hR], 1, hs, 'brodie', t, sd + 620);
            lay.helmF.setAttribute('d', hm.fill); lay.helmI.setAttribute('d', hm.ink);
          }
          // poppies on the field (far ones small)
          const bl = at('bloom', 0.2), ST = [], PF = [], PN = [], PI = [], PC = [];
          const nFar = mode === 'poppies' ? 70 : mode === 'marker' ? 26 : 14;
          for (let k = 0; k < nFar; k++) {
            const v = mode === 'marker' ? 0.55 + hn(k, 1) * 0.3 : (0.15 + hn(k, 1) * 0.85), y = hz + 30 * u + Math.pow(v, 1.7) * (H * 0.92 - hz), r = (6 + Math.pow(v, 1.7) * 34) * u;
            const x = mode === 'marker' ? (P.x ?? 0.5) * W + (hn(k, 2) - 0.5) * 900 * u * v : hn(k, 2) * W;
            const op = mode === 'marker' ? clamp01((lt - bl - hn(k, 3) * 1.6) / 0.6) : 1, sw = Math.sin(t * 1.4 + k) * r * 0.4;
            ST.push(stem(x, y, r * 3, sd + 700 + k, t, sw));
            const p = poppy(x + sw * 0.2, y, r, sd + 800 + k * 31, t, op); (v < 0.5 ? PF : PN).push(p.petals); if (r > 14 * u) PI.push(p.ink); PC.push(p.centre);
          }
          lay.stems.setAttribute('d', ST.join(' ')); lay.petalsFar.setAttribute('d', PF.join(' ')); lay.petals.setAttribute('d', PN.join(' '));
          lay.pInk.setAttribute('d', PI.join(' ')); lay.pCtr.setAttribute('d', PC.join(' '));
          // mist
          lay.mist.setAttribute('d', smoke(lt, t, W, hz - 60 * u, sd + 900, 5, 1));
          // foreground: big poppies + leaves down to the bottom
          const FS = [], FL = [], FP = [], FI = [], FC = [];
          const nF = mode === 'poppies' ? 9 : 7;
          for (let k = 0; k < nF; k++) {
            const x = (k + 0.3 + hn(k, 7) * 0.4) / nF * W, y = H * (0.8 + hn(k, 8) * 0.12), r = (50 + hn(k, 9) * 30) * u, sw = Math.sin(t * 1.2 + k * 1.3) * 16 * u;
            const op = mode === 'marker' ? clamp01((lt - bl - 0.2 - hn(k, 4) * 1.2) / 0.6) : 1;
            FS.push(stem(x + sw, y, H - y + 40, sd + 950 + k, t, -sw));
            FL.push(inkLoop([[x, H + 30], [x - 70 * u + sw * 0.3, y + 170 * u], [x - 20 * u, y + 120 * u]], o(960 + k, { amp: 0.7 })), inkLoop([[x + 10 * u, H + 30], [x + 80 * u + sw * 0.3, y + 220 * u], [x + 26 * u, y + 180 * u]], o(980 + k, { amp: 0.7 })));
            const p = poppy(x + sw, y, r, sd + 1000 + k * 37, t, op); FP.push(p.petals); FI.push(p.ink); FC.push(p.centre);
          }
          front.stems.setAttribute('d', FS.join(' ')); front.leaves.setAttribute('d', FL.join(' ')); front.petals.setAttribute('d', FP.join(' '));
          front.pInk.setAttribute('d', FI.join(' ')); front.pCtr.setAttribute('d', FC.join(' '));
          // counter
          if (P.count) {
            const C = P.count, ca = at(C.at, 0.3), cp = progIO(lt, ca, C.dur ?? 2), val = Math.round((C.to ?? 2738) * cp), sz = (C.size ?? 170) * u;
            if (lt < ca) cntG.setAttribute('transform', 'scale(0)');
            else {
              const s = spring(lt, ca, 0.5) * (1 + 0.1 * punch(lt, ca + (C.dur ?? 2), 0.6)), cx = (C.x ?? 0.5) * W, cy = (C.y ?? 0.2) * H;
              cntG.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(-3) scale(${s.toFixed(3)})`);
              cntT.textContent = val.toLocaleString('en-US'); cntT.setAttribute('font-size', f1(sz)); cntT.setAttribute('x', 0); cntT.setAttribute('y', 0);
              const w = 0.33 * sz * String(C.to ?? 2738).replace(/\d{3}(?=\d)/, '$&,').length + 40 * u;
              const bx = [[-w, -sz * 0.62], [w, -sz * 0.66], [w + 6, sz * 0.6], [-w - 4, sz * 0.64]];
              cntCard.setAttribute('d', inkLoop(bx, o(1100, { smooth: false })));
              cntR.setAttribute('d', inkPath(bx, o(1101, { closed: true, smooth: false, w: 7 })));
            }
          }
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.025 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          if (kas) kas.update(lt, t, cues);
          labs.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
