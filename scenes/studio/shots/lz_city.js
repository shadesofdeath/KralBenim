// lz_city: Lisbon, 1 November 1755, in the parchment ink style (brand/kit/BRAND.md §3, §5; every line boils at 8 Hz
// via _ink.js; everything is a pure function of (seed, lt), no Math.random). Written for 05-lizbon-depremi-1755 but
// parametric (any old harbour city struck by a quake / tsunami / fire). Layout tuned for 16:9, works in 9:16.
// Needs mcB__lib.js (window.MCB: cast, labels, camPush).
//
// SHOTS.lz_city P: {
//   mode: "city" | "quake" | "fire" | "church" | "recede" | "wave",
//     city   — river view of the city: far hills with a castle, a row of houses, churches with twin bell towers and a
//              long arcaded palace on the waterfront; the river in front with ships that bob; gulls; bells swing.
//     quake  — same view; the ground shakes from cue `shake` (camera shake + every building sways), buildings listed
//              in `fall` collapse one after another from cue `hit` (they buckle down into a rubble heap, dust clouds
//              billow, stones fall), red ink cracks open across the quay on cue `crack`.
//     fire   — same view, buildings already ruined (ruins: true) or standing; flames start at building `fire.start` on
//              cue `fire.at` and jump building to building (`fire.step` s), smoke columns, embers, red glow streaks on
//              the water, hatched dark sky.
//     church — church interior: arcade of columns, an altar with rows of candles, two chandeliers, a congregation in
//              the pews (backs of heads). Cue `shake`: chandeliers swing wildly + camera shake; cue `topple`: candles
//              fall one by one; cue `fire`: flames climb the altar cloth and curtains; cue `collapse`: ceiling cracks, stones, dust.
//     recede — the harbour from the quay: people on the quay (left), the sea pulls back on cue `recede` (water edge runs
//              from the quay out to `recede_to`), leaving a mud plain with old wrecks, barrels and flapping fish.
//     wave   — the same harbour: a wall of water rises on the horizon on cue `wave` and rolls in to `wave_to`, its
//              curling crest towering over the quay; ships are tossed; optional second wave (`wave2`).
//   houses: 9 (number of buildings), churches: [2, 6] (indices drawn as twin-tower churches), palace: true,
//   fall: [1, 2, 4, 6] (quake: indices that collapse), ruins: false (fire: draw buildings already ruined),
//   ships: 3, gulls: 3, castle: true,
//   fire: {start: 4, at: cue|sec, step: 0.45, size: 1},
//   recede_to: 0.88, wave_to: 0.18, wave_h: 0.5 (0..1 H), wave2: cue|sec,
//   bank: true | {y: 0.91} (river view: a strip of near shore in front for the cast to stand on),
//   cover: {tilt: [3, 5] (buildings shown buckling, no dust), tilt_k: 0.42, crack_w: 1, fire: true, crack: true, wave: {x: 0.62, top: 0.12, h: 0.7}} (thumbnail only, river view: all three
//          disasters at once: the city burning, the quay cracked and a breaker curling in from the right),
//   ruin: true (church mode: roofless gothic arches under the open sky, e.g. Carmo convent), crack_w: 1 (crack width x),
//   days: {at, dur: 3, to: 5, x: 0.5, y: 0.2, size: 130, suffix: ". GÜN"} (big day counter that ticks 1..to),
//   cast: [...MCB cast], labels: [...MCB labels], cam: {zoom: 1.06, focus: [0.5, 0.55]}
// }
// Aliases: SHOTS.lz_church (mode church), SHOTS.lz_sea (mode recede | wave), SHOTS.lz_fire (mode fire), same P.
// cues: shake, hit, crack, fire.at, topple, recede, wave, wave2, plus cast/label "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;

  // flame tongues standing on (cx, base), width w, height h
  function flamePts(cx, base, w, h, t, seed, k = 1) {
    const n = 5, pts = [[cx - w / 2, base]];
    for (let i = 0; i < n; i++) {
      const u0 = (i + 0.15) / n, u1 = (i + 0.5) / n, u2 = (i + 0.85) / n;
      const hh = h * k * (0.55 + 0.45 * Math.abs(Math.sin(seed * 1.7 + i * 2.1))) * (0.85 + 0.15 * Math.sin(t * 9 + i * 1.9 + seed));
      const sway = Math.sin(t * 6 + i + seed) * w * 0.06;
      pts.push([cx - w / 2 + w * u0, base - hh * 0.35]);
      pts.push([cx - w / 2 + w * u1 + sway, base - hh]);
      pts.push([cx - w / 2 + w * u2, base - hh * 0.4]);
    }
    pts.push([cx + w / 2, base]);
    return pts;
  }

  SH.lz_city = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 1755;
      const mode = ctx.forceMode || P.mode || 'city';
      const portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const R = rng(sd + 3);

      // ------------------------------------------------------------ layers
      const sky = { hatch: inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.55 }), sun: inkEl(cam, INK.gold, { 'fill-opacity': 0.8 }), gulls: inkEl(cam) };
      const far = { f: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), r: inkEl(cam, INK.inkSoft), castle: inkEl(cam, INK.inkSoft), backrow: inkEl(cam, INK.inkSoft) };
      const smokeL = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.32 });
      const dustL = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.7 });
      const bld = [], fireL = { red: inkEl(cam, INK.red), gold: inkEl(cam, INK.gold) };
      const quay = { f: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.6 }), r: inkEl(cam), crack: inkEl(cam, INK.red) };
      const mud = { f: inkEl(cam, INK.stain, { 'fill-opacity': 0.45 }), r: inkEl(cam, INK.inkSoft), stuff: inkEl(cam, INK.ink), stuffF: inkEl(cam, INK.hat, { 'fill-opacity': 0.8 }), fish: inkEl(cam, INK.inkSoft) };
      const water = { f: inkEl(cam, INK.blue, { 'fill-opacity': 0.18 }), r: inkEl(cam, INK.inkSoft), hatch: inkEl(cam, INK.inkSoft), glow: inkEl(cam, INK.red, { 'fill-opacity': 0.7 }) };
      const shipsL = { f: inkEl(cam, INK.paperLight), r: inkEl(cam), hull: inkEl(cam, INK.hat) };
      const stones = inkEl(cam, INK.ink);
      const bank = { f: inkEl(cam, INK.paperDark), r: inkEl(cam), h: inkEl(cam, INK.inkSoft) };
      const castG = el(cam, 'g');
      const waveL = { f: inkEl(cam, INK.blue, { 'fill-opacity': 0.34 }), back: inkEl(cam, INK.paperLight), r: inkEl(cam), hatch: inkEl(cam, INK.inkSoft), foam: inkEl(cam, INK.paperLight) };
      const embers = inkEl(cam, INK.gold);
      // church interior layers
      const ch = { wall: inkEl(cam, INK.inkSoft), arch: inkEl(cam), archF: inkEl(cam, INK.paperLight, { 'fill-opacity': 0.6 }), altar: inkEl(cam, INK.paperLight), altarR: inkEl(cam),
        cloth: inkEl(cam, INK.red, { 'fill-opacity': 0.85 }), candles: inkEl(cam, INK.paperLight), candleR: inkEl(cam), flames: inkEl(cam, INK.gold), chand: inkEl(cam), pews: inkEl(cam, INK.hat, { 'fill-opacity': 0.9 }),
        heads: inkEl(cam, INK.inkSoft), crack: inkEl(cam, INK.ink) };
      const cs = cast(castG, P.cast, W, H, sd + 200);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 400);
      const daysT = P.days ? el(root, 'text', { x: (P.days.x ?? 0.5) * W, y: (P.days.y ?? 0.2) * H, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900,
        'font-size': P.days.size ?? 130, 'text-anchor': 'middle', fill: INK.paperLight, stroke: INK.ink, 'stroke-width': 10, 'paint-order': 'stroke' }) : null;

      // ------------------------------------------------------------ city layout (river view)
      const N = P.houses ?? 9, churches = new Set(P.churches || [2, 6]);
      const QY = (portrait ? 0.62 : 0.74) * H;                 // quay / street line
      const left = 0.03 * W, right = (P.palace === false ? 0.97 : 0.97) * W;
      const palaceIdx = P.palace === false ? -1 : N - 1;
      const slots = [];
      {
        let x = left; const unit = (right - left) / (N + (palaceIdx >= 0 ? 1.4 : 0) + 0.5);
        for (let i = 0; i < N; i++) {
          const isC = churches.has(i), isP = i === palaceIdx;
          const w = unit * (isP ? 2.2 : isC ? 1.25 : 0.82 + R() * 0.25);
          const h = isP ? H * 0.17 : isC ? H * (0.36 + R() * 0.04) : H * (0.2 + R() * 0.1);
          slots.push({ i, x, w, h, kind: isP ? 'palace' : isC ? 'church' : 'house', seed: sd + 30 + i * 11 });
          x += w + unit * 0.12;
        }
        const tot = x - left, k = (right - left) / tot;   // stretch to fit
        slots.forEach(s => { s.x = left + (s.x - left) * k; s.w *= k; });
      }
      slots.forEach(() => bld.push({ f: inkEl(cam, INK.paperLight), r: inkEl(cam), win: inkEl(cam, INK.ink) }));
      // move fire + dust + castG above buildings: re-append in order
      [fireL.red, fireL.gold, dustL, quay.f, quay.r, quay.crack, water.f, water.r, water.hatch, water.glow, shipsL.hull, shipsL.f, shipsL.r, stones, bank.f, bank.h, bank.r, castG, waveL.back, waveL.f, waveL.hatch, waveL.r, waveL.foam, embers].forEach(n => cam.appendChild(n));

      // building outline points (local, base at y = 0, x from 0..w), returns {outline, details: [polylines], windows: [rects]}
      function shape(s) {
        const { w, h } = s, out = [], det = [], wins = [];
        if (s.kind === 'house') {
          out.push([0, 0], [0, -h], [w * 0.5, -h - w * 0.32], [w, -h], [w, 0]);
          const rows = Math.max(2, Math.round(h / 70)), cols = 2;
          for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) wins.push([w * (0.22 + c * 0.38), -h + 30 + r * (h - 60) / rows, w * 0.18, 26]);
          det.push([[w * 0.4, 0], [w * 0.4, -46], [w * 0.6, -46], [w * 0.6, 0]]);
        } else if (s.kind === 'church') {
          const tw = w * 0.26, nh = h * 0.62;
          out.push([0, 0], [0, -h], [tw * 0.5, -h - tw * 0.55], [tw, -h], [tw, -nh], [w * 0.5, -nh - w * 0.2], [w - tw, -nh], [w - tw, -h], [w - tw * 0.5, -h - tw * 0.55], [w, -h], [w, 0]);
          det.push([[tw, 0], [tw, -nh]], [[w - tw, 0], [w - tw, -nh]]);
          // door arch
          const dp = []; for (let k = 0; k <= 8; k++) { const a = Math.PI * k / 8; dp.push([w * 0.5 - Math.cos(a) * w * 0.12, -nh * 0.32 - Math.sin(a) * w * 0.12]); }
          det.push([[w * 0.38, 0]].concat(dp).concat([[w * 0.62, 0]]));
          // bell openings
          wins.push([tw * 0.3, -h + 26, tw * 0.4, 46], [w - tw * 0.7, -h + 26, tw * 0.4, 46]);
          s.rose = [w * 0.5, -nh * 0.66, w * 0.09];
        } else {
          out.push([0, 0], [0, -h], [w, -h], [w, 0]);
          det.push([[0, -h * 0.55], [w, -h * 0.55]]);
          const n = Math.max(5, Math.round(w / 70));
          for (let k = 0; k < n; k++) { const x0 = w * (k + 0.18) / n, x1 = w * (k + 0.82) / n, ap = [[x0, 0]];
            for (let j = 0; j <= 6; j++) { const a = Math.PI * j / 6; ap.push([(x0 + x1) / 2 - Math.cos(a) * (x1 - x0) / 2, -h * 0.3 - Math.sin(a) * (x1 - x0) / 2]); }
            ap.push([x1, 0]); det.push(ap); wins.push([x0 + 4, -h + 22, x1 - x0 - 8, 26]); }
        }
        return { out, det, wins };
      }
      slots.forEach(s => { s.sh = shape(s); });

      const ships = Array.from({ length: P.ships ?? 3 }, (_, i) => ({ x: 0.18 + i * 0.3 + (R() - 0.5) * 0.08, s: 0.75 + R() * 0.35, ph: R() * 6 }));
      function shipPts(cx, cy, sc, roll) {
        const c = Math.cos(roll), s = Math.sin(roll), T = p => [cx + (p[0] * c - p[1] * s) * sc, cy + (p[0] * s + p[1] * c) * sc];
        return {
          hull: [[-120, -20], [120, -24], [92, 26], [-96, 26]].map(T),
          mast: [[-10, -24], [-10, -210]].map(T), mast2: [[60, -24], [60, -160]].map(T),
          sail: [[-70, -190], [50, -190], [44, -70], [-64, -70]].map(T), sail2: [[30, -150], [96, -150], [92, -70], [32, -70]].map(T),
        };
      }

      const fall = new Set(P.fall || []);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hitAt = atOr(cues, 'hit', null), hit = punch(lt, hitAt, 0.6);
          const shakeAt = atOr(cues, 'shake', mode === 'quake' ? 0.2 : (mode === 'church' ? null : null));
          let shake = 0;
          if (shakeAt != null && lt >= shakeAt) shake = clamp01((lt - shakeAt) / 0.5) * (0.65 + 0.35 * Math.sin(lt * 2.3));
          if (P.shake_end != null && lt > P.shake_end) shake *= clamp01(1 - (lt - P.shake_end) / 0.6);
          const sx = Math.sin(lt * 47) * 7 * shake;
          let wd = '';

          if (mode === 'church') { church(lt, t, cues, shake, atOr(cues, 'collapse', null)); }
          else if (mode === 'recede' || mode === 'wave') { harbour(lt, t, cues, dur); }
          else { river(lt, t, cues, shake, sx, hitAt); }

          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam, hit, shake);
          lb.update(lt, t, cues);
          if (daysT) {   // day counter 1..to, ticking from cue days.at over days.dur
            const a = atOr(cues, P.days.at, 0.3), n = Math.max(1, Math.min(P.days.to ?? 5, 1 + Math.floor(clamp01((lt - a) / (P.days.dur ?? 3)) * ((P.days.to ?? 5) - 1) + 1e-6)));
            daysT.textContent = (P.days.prefix ?? '') + n + (P.days.suffix ?? '. GÜN');
            const k = 1 + 0.12 * punch(lt, a + (n - 1) * (P.days.dur ?? 3) / Math.max(1, (P.days.to ?? 5) - 1), 0.4);
            const cx = (P.days.x ?? 0.5) * W, cy = (P.days.y ?? 0.2) * H;
            daysT.setAttribute('transform', `translate(${cx} ${cy}) scale(${k.toFixed(3)}) translate(${-cx} ${-cy})`);
            daysT.style.display = lt < a ? 'none' : '';
          }
        },
      };

      // ============================================================ river view (city / quake / fire)
      function river(lt, t, cues, shake, sx, hitAt) {
        const dark = mode === 'fire';
        // sky: hatched + darker when burning / dusty
        let hd = '';
        const nh = dark ? 26 : (mode === 'quake' && hitAt != null && lt > hitAt ? 12 : 0);
        for (let k = 0; k < nh; k++) { const y = 0.04 * H + k * 0.016 * H; hd += inkPath([[-20, y], [W + 20, y + 10]], { w: 2.4, seed: sd + 500 + k, t, amp: 1.2 }) + ' '; }
        sky.hatch.setAttribute('d', hd);
        sky.sun.setAttribute('d', !dark ? inkCircle(0.82 * W, 0.16 * H + Math.sin(lt * 0.3) * 4, 46, sd + 5, t, { fill: true }) : '');
        // gulls
        let gd = '';
        if (!dark) for (let i = 0; i < (P.gulls ?? 3); i++) {
          const gx = ((0.1 + i * 0.28) * W + lt * (40 + i * 12)) % (W + 100) - 50, gy = (0.2 + 0.05 * i) * H + Math.sin(lt * 2 + i) * 8, fl = Math.sin(lt * 7 + i * 2) * 10;
          gd += inkPath([[gx - 26, gy - fl], [gx - 10, gy - 4], [gx, gy + 2], [gx + 10, gy - 4], [gx + 26, gy - fl]], { w: 4, seed: sd + 60 + i, t, amp: 1 }) + ' ';
        }
        sky.gulls.setAttribute('d', gd);
        // far hills + castle + back row of roofs
        const hy = x => QY - H * 0.26 - Math.sin(x / W * Math.PI * 1.3 + 0.4) * H * 0.07;
        const hp = []; for (let x = -40; x <= W + 40; x += 60) hp.push([x + sx * 0.3, hy(x)]);
        far.f.setAttribute('d', inkLoop(hp.concat([[W + 40, QY], [-40, QY]]), { seed: sd + 70, t, amp: 1, smooth: false }));
        far.r.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 71, t, amp: 1.2 }));
        let cd = '';
        if (P.castle !== false) {
          const cx = 0.3 * W + sx * 0.3, cy = hy(0.3 * W);
          const cp = [[cx - 110, cy + 10], [cx - 110, cy - 60], [cx - 90, cy - 60], [cx - 90, cy - 46], [cx - 70, cy - 46], [cx - 70, cy - 60], [cx - 40, cy - 60], [cx - 40, cy - 90], [cx - 10, cy - 90], [cx - 10, cy - 60], [cx + 30, cy - 60], [cx + 30, cy - 46], [cx + 50, cy - 46], [cx + 50, cy - 60], [cx + 110, cy - 60], [cx + 110, cy + 10]];
          cd = inkPath(cp, { w: 4, seed: sd + 72, t, amp: 1.2, smooth: false });
        }
        far.castle.setAttribute('d', cd);
        let bd = '';
        for (let k = 0; k < 16; k++) { const x = (k + 0.3) / 16 * W + sx * 0.5, y = hy(x) + 40 + (k % 3) * 18, w = 60;
          bd += inkPath([[x, y + 40], [x, y], [x + w / 2, y - 22], [x + w, y], [x + w, y + 40]], { w: 3, seed: sd + 80 + k, t, amp: 1, smooth: false }) + ' '; }
        far.backrow.setAttribute('d', bd);

        // buildings
        const fallAt = hitAt;
        const CV = P.cover && document.documentElement.classList.contains('cover') ? P.cover : null;
        const fireP = Object.assign({ start: 4, step: 0.45, size: 1 }, P.fire || {}, CV && CV.fire ? { at: -9, step: 0 } : {});
        const fireAt = mode === 'fire' || (CV && CV.fire) ? atOr(cues, fireP.at, 0.2) : null;
        let fr = '', fg = '', dd = '', sm = '', st = '', em = '';
        let order = 0;
        slots.forEach((s, i) => {
          const B = bld[i];
          let coll = 0;
          if (mode === 'quake' && fall.has(i) && fallAt != null) { const at = fallAt + order * 0.35; order++; coll = progIO(lt, at, 0.9);
            if (lt > at) { const age = lt - at; for (let k = 0; k < 4; k++) { const u = (age * 0.5 + k * 0.25); const r = 50 + age * 70 + k * 22;
              dd += inkCircle(s.x + s.w * (0.2 + 0.2 * k), QY - 20 - age * 40 - k * 24, Math.min(r, 170), s.seed + 300 + k, t, { fill: true, amp: 2 }) + ' '; }
              if (age < 1.6) for (let k = 0; k < 5; k++) { const yy = QY - s.h * (1 - (age * 1.3 + k * 0.15) % 1) ; st += inkDot(s.x + s.w * (0.15 + k * 0.17), yy, 9, 7, s.seed + 400 + k, t) + ' '; } } }
          if (CV && CV.tilt) { coll = CV.tilt.includes(i) ? (CV.tilt_k ?? 0.42) : 0; dd = ''; st = ''; }
          if (mode === 'fire' && P.ruins) coll = fall.size ? (fall.has(i) ? 1 : 0) : (s.kind === 'palace' ? 0.6 : 0.75);
          const sway = shake * Math.sin(lt * 31 + i * 1.3) * 0.02 * (1 - coll);
          const tilt = coll * (i % 2 ? 0.16 : -0.14) + sway;
          const sy = 1 - coll * 0.72;
          const T = p => [s.x + sx + p[0] + (-p[1]) * tilt, QY + p[1] * sy];
          // jagged top for collapsed buildings
          let outPts = s.sh.out.map(T);
          if (coll > 0.05) {
            const jag = []; const n = 7;
            for (let k = 0; k <= n; k++) jag.push([s.w * k / n, -s.h * (0.85 + 0.15 * Math.sin(k * 2.7 + i)) * (k % 2 ? 0.78 : 1)]);
            const mixPts = [[0, 0]].concat(jag).concat([[s.w, 0]]);
            outPts = coll > 0.5 ? mixPts.map(T) : outPts;
          }
          B.f.setAttribute('d', inkLoop(outPts, { seed: s.seed, t, amp: 1, smooth: false }));
          let rd = inkPath(outPts, { w: s.kind === 'house' ? 5 : 6, seed: s.seed + 1, t, amp: 1.4, closed: true, smooth: false });
          if (coll < 0.5) {
            s.sh.det.forEach((d, k) => { rd += ' ' + inkPath(d.map(T), { w: 3.5, seed: s.seed + 2 + k, t, amp: 1.1, smooth: false }); });
            if (s.rose) { const c = T([s.rose[0], s.rose[1]]); rd += ' ' + inkCircle(c[0], c[1], s.rose[2] * Math.max(0.3, sy), s.seed + 9, t, { w: 4 }); }
          } else {
            // rubble heap at the base
            const rp = [[-10, 0]]; for (let k = 0; k <= 6; k++) rp.push([s.w * k / 6, -40 - 30 * Math.abs(Math.sin(k * 1.9 + i))]); rp.push([s.w + 10, 0]);
            rd += ' ' + inkPath(rp.map(p => [s.x + sx + p[0], QY + p[1]]), { w: 4, seed: s.seed + 20, t, amp: 1.4, smooth: false });
          }
          B.r.setAttribute('d', rd);
          let wn = '';
          if (coll < 0.5) s.sh.wins.forEach((r, k) => { const a = T([r[0], r[1]]), b = T([r[0] + r[2], r[1] + r[3]]);
            wn += inkLoop([[a[0], a[1]], [b[0], a[1]], [b[0], b[1]], [a[0], b[1]]], { seed: s.seed + 40 + k, t, amp: 0.7, smooth: false }) + ' '; });
          B.win.setAttribute('d', wn);
          // fire
          if (fireAt != null) {
            const dist = Math.abs(i - fireP.start), at = fireAt + dist * fireP.step;
            if (lt > at) {
              const g = clamp01((lt - at) / 1.0), topY = QY - s.h * sy * (coll > 0.5 ? 0.7 : 1);
              const fw = s.w * 0.95, fh = (90 + s.h * 0.5) * g * fireP.size;
              fr += inkLoop(flamePts(s.x + s.w / 2, topY + 10, fw, fh, t, i + 1), { seed: s.seed + 50, t, amp: 2, smooth: false }) + ' ';
              fg += inkLoop(flamePts(s.x + s.w / 2, topY + 10, fw * 0.6, fh * 0.6, t, i + 3), { seed: s.seed + 51, t, amp: 1.5, smooth: false }) + ' ';
              for (let k = 0; k < 4; k++) { const age = ((lt - at) * 0.35 + k * 0.25) % 1; const r = 40 + age * 120;
                sm += inkCircle(s.x + s.w / 2 + Math.sin(k * 2 + lt * 0.5) * 40 - age * 160, topY - fh - age * H * 0.35, r, s.seed + 60 + k, t, { fill: true, amp: 2 }) + ' '; }
              for (let k = 0; k < 3; k++) { const age = ((lt - at) * 0.6 + k * 0.33) % 1; em += inkDot(s.x + s.w * (0.3 + 0.2 * k) - age * 120, topY - fh * 0.6 - age * 260, 5, 5, s.seed + 70 + k, t) + ' '; }
            }
          }
        });
        fireL.red.setAttribute('d', fr); fireL.gold.setAttribute('d', fg);
        smokeL.setAttribute('d', sm); dustL.setAttribute('d', dd); stones.setAttribute('d', st); embers.setAttribute('d', em);
        // quay + cracks
        const qp = [[-30, QY], [W + 30, QY], [W + 30, QY + 34], [-30, QY + 34]].map(p => [p[0] + sx, p[1]]);
        quay.f.setAttribute('d', inkLoop(qp, { seed: sd + 90, t, amp: 1, smooth: false }));
        quay.r.setAttribute('d', inkPath([[-30 + sx, QY], [W + 30 + sx, QY]], { w: 6, seed: sd + 91, t, amp: 1.3 }) + ' ' + inkPath([[-30 + sx, QY + 34], [W + 30 + sx, QY + 34]], { w: 4, seed: sd + 92, t, amp: 1.3 }));
        const crAt = CV && CV.crack ? -9 : atOr(cues, 'crack', null);
        let crd = '';
        if (crAt != null && lt > crAt) {
          [0.22, 0.5, 0.78].forEach((cx, k) => { const g = progIO(lt, crAt + k * 0.2, 0.5); if (g <= 0) return;
            const pts = []; for (let j = 0; j <= 6; j++) pts.push([cx * W + sx + (j % 2 ? 18 : -18) + j * 6, QY + j / 6 * (H - QY) * 0.85 * g]);
            crd += inkPath(pts, { w: (7 + 6 * g) * ((CV && CV.crack_w) || P.crack_w || 1), seed: sd + 95 + k, t, amp: 1.5, smooth: false }) + ' '; });
        }
        quay.crack.setAttribute('d', crd);
        // river
        const WY = QY + 34;
        const wp = []; for (let x = -40; x <= W + 40; x += 40) wp.push([x, WY + 8 + Math.sin(x * 0.01 + t * 1.5) * 6 * (1 + shake * 2)]);
        water.f.setAttribute('d', inkLoop(wp.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: sd + 100, t, amp: 0.8, smooth: false }));
        water.r.setAttribute('d', inkPath(wp, { w: 4, seed: sd + 101, t, amp: 1.2 }));
        let wh = '';
        for (let k = 0; k < 14; k++) { const yy = WY + 30 + (k % 5) * (H - WY - 40) / 5, xx = ((k * 0.37 % 1) * (W + 300) + t * 22) % (W + 300) - 150;
          wh += inkPath([[xx, yy], [xx + 50, yy - 6], [xx + 110, yy]], { w: 3, seed: sd + 110 + k, t, amp: 1 }) + ' '; }
        water.hatch.setAttribute('d', wh);
        let gl = '';
        if (fireAt != null && lt > fireAt) for (let k = 0; k < 10; k++) { const xx = (k + 0.5) / 10 * W, yy = WY + 40 + (k % 4) * 30;
          gl += inkPath([[xx - 50, yy], [xx + 50 + Math.sin(t * 3 + k) * 20, yy + 2]], { w: 5, seed: sd + 130 + k, t, amp: 1.2 }) + ' '; }
        water.glow.setAttribute('d', gl);
        // ships
        let hd2 = '', sf = '', sr = '';
        ships.forEach((sp, i) => {
          if (WY + 60 > H) return;
          const roll = Math.sin(lt * 1.3 + sp.ph) * 0.05 * (1 + shake * 3), cy = WY + 70 + Math.sin(lt * 1.6 + sp.ph) * 6;
          const S = shipPts(sp.x * W + Math.sin(lt * 0.2 + i) * 20, cy, sp.s * (portrait ? 0.7 : 0.62), roll);
          hd2 += inkLoop(S.hull, { seed: sd + 140 + i, t, amp: 1, smooth: false }) + ' ';
          sf += inkLoop(S.sail, { seed: sd + 150 + i, t, amp: 1 }) + ' ' + inkLoop(S.sail2, { seed: sd + 155 + i, t, amp: 1 }) + ' ';
          sr += inkPath(S.hull, { w: 5, seed: sd + 160 + i, t, amp: 1.2, closed: true, smooth: false }) + ' ' + inkPath(S.mast, { w: 5, seed: sd + 165 + i, t, amp: 1 }) + ' ' +
            inkPath(S.mast2, { w: 4, seed: sd + 166 + i, t, amp: 1 }) + ' ' + inkPath(S.sail, { w: 3.5, seed: sd + 167 + i, t, amp: 1, closed: true }) + ' ' + inkPath(S.sail2, { w: 3.5, seed: sd + 168 + i, t, amp: 1, closed: true }) + ' ';
        });
        shipsL.hull.setAttribute('d', hd2); shipsL.f.setAttribute('d', sf); shipsL.r.setAttribute('d', sr);
        if (CV && CV.wave) drawWave(CV.wave.x * W, CV.wave.top * H, CV.wave.h * H, H + 30, lt, t);
        // near bank (a strip of shore in front, so the narrator stands on land, not on the river)
        if (P.bank) {
          const by = (P.bank.y ?? 0.91) * H, bp = [];
          for (let x = -40; x <= W + 40; x += 80) bp.push([x, by + Math.sin(x * 0.013) * 10]);
          bank.f.setAttribute('d', inkLoop(bp.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: sd + 600, t, amp: 1, smooth: false }));
          bank.r.setAttribute('d', inkPath(bp, { w: 6, seed: sd + 601, t, amp: 1.3 }));
          let bh = ''; for (let k = 0; k < 18; k++) { const x = (k + 0.3) / 18 * W, y = by + 22 + (k % 3) * 14; bh += inkPath([[x, y], [x + 26, y + 18]], { w: 3, seed: sd + 610 + k, t, amp: 1 }) + ' '; }
          bank.h.setAttribute('d', bh);
        }
      }

      // a curling breaker with its front at fx, crest at y = top, height h, running down to y = base
      function drawWave(fx, top, h, base, lt, t) {
        const wob = Math.sin(t * 3) * 8;
          // a curling breaker: back slope -> crest -> lip thrown forward -> hooked tip -> hollow tube -> concave front face
          const face = [[W + 60, base], [W + 60, top + h * 0.35], [fx + h * 0.75, top + h * 0.06], [fx + h * 0.35, top - 6 + wob],
            [fx + h * 0.02, top + h * 0.04], [fx - h * 0.2, top + h * 0.18], [fx - h * 0.27, top + h * 0.34], [fx - h * 0.18, top + h * 0.42],
            [fx - h * 0.08, top + h * 0.36], [fx + h * 0.02, top + h * 0.3], [fx + h * 0.08, top + h * 0.42], [fx + h * 0.02, top + h * 0.7],
            [fx - h * 0.12, top + h * 0.92], [fx - h * 0.35, base]];
          const tube = [[fx - h * 0.02, top + h * 0.3], [fx + h * 0.12, top + h * 0.22], [fx + h * 0.2, top + h * 0.34], [fx + h * 0.1, top + h * 0.5], [fx + h * 0.04, top + h * 0.42]];
          waveL.back.setAttribute('d', inkLoop(face, { seed: sd + 210, t, amp: 1.5 }));
          waveL.f.setAttribute('d', inkLoop(face, { seed: sd + 211, t, amp: 1.5 }) + ' ' + inkLoop(tube, { seed: sd + 213, t, amp: 1.2 }));
          waveL.r.setAttribute('d', inkPath(face, { w: 8, seed: sd + 212, t, amp: 1.8, closed: true }) + ' ' + inkPath(tube.slice(0, 4), { w: 5, seed: sd + 214, t, amp: 1.2 }));
          let hh = '';
          for (let k = 0; k < 12; k++) { const u = (k + 0.5) / 12, y = top + h * 0.45 + u * (base - top - h * 0.45), x0 = fx + h * 0.12 - u * h * 0.25;
            hh += inkPath([[x0, y], [x0 + h * 0.3, y - h * 0.12 - Math.sin(t * 2 + k) * 6], [x0 + h * 0.7, y - h * 0.3], [x0 + h * 1.2, y - h * 0.38]], { w: 4, seed: sd + 220 + k, t, amp: 1.2 }) + ' '; }
          for (let k = 0; k < 5; k++) { const u = (k + 0.5) / 5; hh += inkPath([[fx + h * (0.4 + u * 0.6), top + h * (0.1 + u * 0.05)], [fx + h * (0.6 + u * 0.7), top + h * (0.2 + u * 0.08)]], { w: 3.5, seed: sd + 240 + k, t, amp: 1 }) + ' '; }
          waveL.hatch.setAttribute('d', hh);
          let fo = '';
          for (let k = 0; k < 10; k++) { const u = k / 9; const p = u < 0.5 ? [lerp(fx + h * 0.6, fx + h * 0.02, u * 2), lerp(top + h * 0.04, top + h * 0.02, u * 2)] : [lerp(fx + h * 0.02, fx - h * 0.24, (u - 0.5) * 2), lerp(top + h * 0.04, top + h * 0.34, (u - 0.5) * 2)];
            fo += inkDot(p[0] + Math.sin(t * 5 + k) * 5, p[1] - 6 + Math.cos(t * 6 + k) * 5, 16, 11, sd + 230 + k, t) + ' '; }
          for (let k = 0; k < 6; k++) { const age = (lt * 0.8 + k / 6) % 1; fo += inkDot(fx - h * 0.25 - age * h * 0.3, top + h * 0.38 + age * age * h * 0.5, 9, 7, sd + 250 + k, t) + ' '; }
          waveL.foam.setAttribute('d', fo);
      }

      // ============================================================ harbour from the quay (recede / wave)
      function harbour(lt, t, cues, dur) {
        const HZ = (portrait ? 0.4 : 0.42) * H, QX = 0.34 * W, QYh = (portrait ? 0.62 : 0.7) * H;
        sky.sun.setAttribute('d', inkCircle(0.78 * W, 0.15 * H, 44, sd + 5, t, { fill: true }));
        let gd = '';
        for (let i = 0; i < 3; i++) { const gx = ((0.5 + i * 0.2) * W - lt * (50 + i * 10)) % (W + 100) + 50, gy = (0.12 + 0.04 * i) * H + Math.sin(lt * 2 + i) * 8, fl = Math.sin(lt * 7 + i * 2) * 10;
          gd += inkPath([[gx - 24, gy - fl], [gx - 9, gy - 4], [gx, gy + 2], [gx + 9, gy - 4], [gx + 24, gy - fl]], { w: 4, seed: sd + 60 + i, t, amp: 1 }) + ' '; }
        sky.gulls.setAttribute('d', gd);
        sky.hatch.setAttribute('d', '');
        // far shore line on the horizon (south bank)
        const hp = []; for (let x = QX - 40; x <= W + 40; x += 60) hp.push([x, HZ - 16 - Math.sin(x * 0.004) * 14]);
        far.f.setAttribute('d', ''); far.castle.setAttribute('d', ''); far.backrow.setAttribute('d', '');
        far.r.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 71, t, amp: 1.2 }));
        // the quay (left) with a few buildings
        const qp = [[-30, QYh], [QX, QYh], [QX + 10, H + 20], [-30, H + 20]];
        quay.f.setAttribute('d', inkLoop(qp, { seed: sd + 90, t, amp: 1, smooth: false }));
        let qr = inkPath([[-30, QYh], [QX, QYh], [QX + 10, H + 20]], { w: 6, seed: sd + 91, t, amp: 1.3, smooth: false });
        for (let k = 0; k < 4; k++) qr += ' ' + inkPath([[QX - 8 + k * 3, QYh + 40 + k * 70], [QX - 80, QYh + 40 + k * 70]], { w: 3, seed: sd + 93 + k, t, amp: 1 });
        quay.r.setAttribute('d', qr); quay.crack.setAttribute('d', '');
        // buildings on the quay: an arcaded front
        slots.forEach((s, i) => { const B = bld[i];
          if (i > 2) { B.f.setAttribute('d', ''); B.r.setAttribute('d', ''); B.win.setAttribute('d', ''); return; }
          const x0 = -20 + i * QX * 0.36, w = QX * 0.34, h = (0.2 + 0.05 * (i % 2)) * H;
          const out = [[x0, QYh], [x0, QYh - h], [x0 + w / 2, QYh - h - w * 0.25], [x0 + w, QYh - h], [x0 + w, QYh]];
          B.f.setAttribute('d', inkLoop(out, { seed: s.seed, t, amp: 1, smooth: false }));
          let rd = inkPath(out, { w: 5, seed: s.seed + 1, t, amp: 1.3, closed: true, smooth: false });
          for (let k = 0; k < 2; k++) { const ax = x0 + w * (0.3 + k * 0.4); const ap = [[ax - 26, QYh]]; for (let j = 0; j <= 6; j++) { const a = Math.PI * j / 6; ap.push([ax - Math.cos(a) * 26, QYh - 60 - Math.sin(a) * 26]); } ap.push([ax + 26, QYh]);
            rd += ' ' + inkPath(ap, { w: 3.5, seed: s.seed + 3 + k, t, amp: 1 }); }
          B.r.setAttribute('d', rd);
          let wn = ''; for (let k = 0; k < 2; k++) wn += inkLoop([[x0 + w * (0.22 + k * 0.38), QYh - h + 40], [x0 + w * (0.4 + k * 0.38), QYh - h + 40], [x0 + w * (0.4 + k * 0.38), QYh - h + 70], [x0 + w * (0.22 + k * 0.38), QYh - h + 70]], { seed: s.seed + 9 + k, t, amp: 0.7, smooth: false }) + ' ';
          B.win.setAttribute('d', wn);
        });
        // sea edge
        const recAt = atOr(cues, 'recede', mode === 'recede' ? 0.4 : null);
        const recTo = P.recede_to ?? 0.88;
        let ex = QX + 10, drop = 0;
        if (mode === 'recede' && recAt != null) { const g = progIO(lt, recAt, Math.max(2.2, Math.min(4, dur * 0.5))); ex = lerp(QX + 10, recTo * W, g); drop = g * 0.05 * H; }
        if (mode === 'wave') { ex = recTo * W; drop = 0.05 * H; }
        const SY = HZ + 20 + drop;
        // mud plain between quay and water edge
        if (ex > QX + 20) {
          const mp = [[QX + 10, SY + 10], [ex, SY + 10], [ex - 30, H + 20], [QX + 10, H + 20]];
          mud.f.setAttribute('d', inkLoop(mp, { seed: sd + 170, t, amp: 1, smooth: false }));
          let mr = '';
          for (let k = 0; k < 12; k++) { const yy = SY + 40 + (k % 6) * (H - SY) / 6, xx = QX + 40 + ((k * 0.61) % 1) * (ex - QX - 80);
            if (xx < ex - 40) mr += inkPath([[xx, yy], [xx + 40, yy + 4], [xx + 80, yy]], { w: 3, seed: sd + 171 + k, t, amp: 1 }) + ' '; }
          mud.r.setAttribute('d', mr);
          // wrecks, barrels, fish uncovered
          let sd1 = '', sf1 = '', fd = '';
          const items = [[0.45, 0.82, 'wreck'], [0.6, 0.72, 'barrel'], [0.7, 0.9, 'wreck2'], [0.52, 0.66, 'barrel'], [0.78, 0.76, 'barrel']];
          items.forEach(([u, v, kind], k) => { const x = u * W, y = v * H; if (x > ex - 60) return;
            if (kind.startsWith('wreck')) { const sc = kind === 'wreck' ? 1 : 0.8, rot = kind === 'wreck' ? 0.22 : -0.3, c = Math.cos(rot), s2 = Math.sin(rot);
              const T = p => [x + (p[0] * c - p[1] * s2) * sc, y + (p[0] * s2 + p[1] * c) * sc];
              const hull = [[-130, -10], [130, -30], [100, 30], [-100, 34]].map(T);
              sf1 += inkLoop(hull, { seed: sd + 180 + k, t, amp: 1, smooth: false }) + ' ';
              sd1 += inkPath(hull, { w: 5, seed: sd + 185 + k, t, amp: 1.2, closed: true, smooth: false }) + ' ' + inkPath([T([-10, -16]), T([-30, -170])], { w: 5, seed: sd + 186 + k, t, amp: 1 }) + ' ' +
                inkPath([T([-80, 0]), T([90, -10])], { w: 3, seed: sd + 187 + k, t, amp: 1 }) + ' ';
            } else { const bp = [[x - 26, y - 34], [x + 26, y - 34], [x + 30, y + 30], [x - 30, y + 30]];
              sf1 += inkLoop(bp, { seed: sd + 190 + k, t, amp: 1 }) + ' '; sd1 += inkPath(bp, { w: 4, seed: sd + 191 + k, t, amp: 1, closed: true }) + ' ' + inkPath([[x - 28, y - 4], [x + 28, y - 4]], { w: 3, seed: sd + 192 + k, t, amp: 1 }) + ' '; } });
          for (let k = 0; k < 7; k++) { const x = QX + 80 + ((k * 0.43 + 0.1) % 1) * 0.5 * W, y = SY + 60 + ((k * 0.29 + 0.2) % 1) * (H - SY - 140); if (x > ex - 40) continue;
            const flip = Math.sin(lt * 9 + k * 2), hop = Math.max(0, Math.sin(lt * 4 + k)) * 18, c = Math.cos(flip * 0.6), s2 = Math.sin(flip * 0.6);
            const T = p => [x + p[0] * c - p[1] * s2, y - hop + p[0] * s2 + p[1] * c];
            fd += inkLoop([[-30, 0], [-10, -12], [16, -8], [30, 0], [44, -14], [44, 14], [30, 0], [16, 8], [-10, 12]].map(T), { seed: sd + 200 + k, t, amp: 0.8, smooth: false }) + ' '; }
          mud.stuff.setAttribute('d', sd1); mud.stuffF.setAttribute('d', sf1); mud.fish.setAttribute('d', fd);
        } else { mud.f.setAttribute('d', ''); mud.r.setAttribute('d', ''); mud.stuff.setAttribute('d', ''); mud.stuffF.setAttribute('d', ''); mud.fish.setAttribute('d', ''); }
        // water (right of ex)
        const wp = []; for (let x = ex; x <= W + 40; x += 40) wp.push([x, SY + Math.sin(x * 0.01 + t * 1.5) * 5]);
        water.f.setAttribute('d', inkLoop(wp.concat([[W + 40, H + 20], [ex - 30, H + 20]]), { seed: sd + 100, t, amp: 0.8, smooth: false }));
        water.r.setAttribute('d', inkPath(wp.concat([[ex - 30, H + 20]]), { w: 4, seed: sd + 101, t, amp: 1.2 }));
        let wh = ''; for (let k = 0; k < 10; k++) { const yy = SY + 30 + (k % 5) * (H - SY - 40) / 5, xx = ex + ((k * 0.37 % 1) * (W - ex + 200) + t * 22) % Math.max(60, W - ex + 200) - 100;
          if (xx > ex) wh += inkPath([[xx, yy], [xx + 50, yy - 6], [xx + 110, yy]], { w: 3, seed: sd + 110 + k, t, amp: 1 }) + ' '; }
        water.hatch.setAttribute('d', wh); water.glow.setAttribute('d', '');
        // ships on the far water (wave mode tosses them)
        const wvAt = atOr(cues, 'wave', mode === 'wave' ? 0.4 : null);
        const wTo = (P.wave_to ?? 0.18) * W, WH = (P.wave_h ?? 0.5) * H;
        const wDur = Math.max(2.5, Math.min(5, dur * 0.6));
        const wg = wvAt != null ? progIO(lt, wvAt, wDur) : 0;
        const fx = lerp(W * 1.08, wTo, wg), wh0 = lerp(0.06 * H, WH, clamp01(wg * 1.6));
        let hd2 = '', sf = '', sr = '';
        ships.slice(0, 2).forEach((sp, i) => {
          const bx = (0.62 + i * 0.22) * W;
          let lift = 0, roll = Math.sin(lt * 1.3 + sp.ph) * 0.05;
          if (mode === 'wave' && fx < bx + 200) { const u = clamp01((bx + 200 - fx) / 400); lift = u * WH * 0.75; roll = -0.5 * u + Math.sin(lt * 3) * 0.1; }
          if (mode === 'recede' && bx < ex + 60) { roll = 0.35; }
          const S = shipPts(bx - (mode === 'wave' ? clamp01((bx + 200 - fx) / 400) * 300 : 0), SY + 40 - lift + Math.sin(lt * 1.6 + sp.ph) * 5, 0.55 * sp.s, roll);
          hd2 += inkLoop(S.hull, { seed: sd + 140 + i, t, amp: 1, smooth: false }) + ' ';
          sf += inkLoop(S.sail, { seed: sd + 150 + i, t, amp: 1 }) + ' ';
          sr += inkPath(S.hull, { w: 5, seed: sd + 160 + i, t, amp: 1.2, closed: true, smooth: false }) + ' ' + inkPath(S.mast, { w: 5, seed: sd + 165 + i, t, amp: 1 }) + ' ' + inkPath(S.sail, { w: 3.5, seed: sd + 167 + i, t, amp: 1, closed: true }) + ' ';
        });
        shipsL.hull.setAttribute('d', hd2); shipsL.f.setAttribute('d', sf); shipsL.r.setAttribute('d', sr);
        // the wave wall
        if (mode === 'wave' && wvAt != null && lt >= wvAt - 0.01) {
          drawWave(fx, SY + 40 - wh0, wh0, H + 30, lt, t);
        } else { ['back', 'f', 'r', 'hatch', 'foam'].forEach(k => waveL[k].setAttribute('d', '')); }
        dustL.setAttribute('d', ''); smokeL.setAttribute('d', ''); fireL.red.setAttribute('d', ''); fireL.gold.setAttribute('d', ''); stones.setAttribute('d', ''); embers.setAttribute('d', '');
      }

      // ============================================================ church interior
      function church(lt, t, cues, shake0, hitAt) {
        const shAt = atOr(cues, 'shake', null);
        const shake = shAt != null && lt >= shAt ? clamp01((lt - shAt) / 0.4) : 0;
        const FY = (portrait ? 0.66 : 0.8) * H, CY = 0.16 * H, RU = !!P.ruin;
        // back wall stones
        let wd = '';
        for (let k = 0; k < (RU ? 0 : 9); k++) { const y = CY + 40 + k * (FY - CY) / 9; wd += inkPath([[-20, y], [W + 20, y + 4]], { w: 2, seed: sd + 300 + k, t, amp: 1 }) + ' '; }
        ch.wall.setAttribute('d', wd);
        // arcade: 3 big arches on columns
        let ad = '', af = '';
        const cols = [0.12, 0.37, 0.63, 0.88];
        for (let k = 0; k < 3; k++) { const x0 = cols[k] * W + 40, x1 = cols[k + 1] * W - 40, mid = (x0 + x1) / 2, r = (x1 - x0) / 2, spring0 = CY + 0.36 * H;
          const ap = [[x0, FY]];
          if (RU) {   // gothic pointed (equilateral) arch: two arcs centred on the opposite springs; the middle one is broken
            const Rr = x1 - x0, sp0 = CY + 0.4 * H, A = Math.PI / 3, left = [], right = [];
            for (let j = 0; j <= 8; j++) { const a = A * j / 8; left.push([x1 - Rr * Math.cos(a), sp0 - Rr * Math.sin(a)]); right.push([x0 + Rr * Math.cos(a), sp0 - Rr * Math.sin(a)]); }
            const brk = k === 1 ? 6 : (k === 2 ? 7 : 9);
            ad += inkPath(left.slice(0, k === 1 ? 6 : 9), { w: 12, seed: sd + 316 + k, t, amp: 1.4 }) + ' ' + inkPath(right.slice(0, brk), { w: 12, seed: sd + 317 + k, t, amp: 1.4 }) + ' ';
            ad += inkPath(left.slice(0, k === 1 ? 6 : 9).map(q => [q[0] + 22, q[1] + 22]), { w: 5, seed: sd + 318 + k, t, amp: 1.2 }) + ' ';
            continue;
          } else for (let j = 0; j <= 10; j++) { const a = Math.PI * j / 10; ap.push([mid - Math.cos(a) * r, spring0 - Math.sin(a) * r * 0.9]); }
          ap.push([x1, FY]);
          af += inkLoop(ap, { seed: sd + 310 + k, t, amp: 1 }) + ' '; ad += inkPath(ap, { w: 6, seed: sd + 315 + k, t, amp: 1.4 }) + ' '; }
        if (RU) cols.forEach((c, k) => { const x = c * W, sp0 = CY + 0.4 * H, q = [[x - 46, FY], [x - 40, sp0], [x + 40, sp0], [x + 46, FY]];
          af += inkLoop(q, { seed: sd + 340 + k, t, amp: 1, smooth: false }) + ' ';
          ad += inkPath(q, { w: 7, seed: sd + 344 + k, t, amp: 1.3, closed: true, smooth: false }) + ' ' + inkPath([[x - 60, sp0], [x + 60, sp0]], { w: 10, seed: sd + 348 + k, t, amp: 1 }) + ' ';
          for (let j = 1; j < 6; j++) { const y = lerp(sp0, FY, j / 6); ad += inkPath([[x - 42, y], [x + 42, y + 3]], { w: 3, seed: sd + 352 + k * 7 + j, t, amp: 0.8 }) + ' '; } });
        else cols.forEach((c, k) => { const x = c * W; ad += inkPath([[x - 34, FY], [x - 34, CY + 40]], { w: 6, seed: sd + 320 + k, t, amp: 1.2 }) + ' ' + inkPath([[x + 34, FY], [x + 34, CY + 40]], { w: 6, seed: sd + 324 + k, t, amp: 1.2 }) + ' '; });
        if (!RU) ad += inkPath([[-20, CY + 40], [W + 20, CY + 44]], { w: 7, seed: sd + 330, t, amp: 1.3 });
        else { ad += inkPath([[-20, FY], [W + 20, FY]], { w: 6, seed: sd + 331, t, amp: 1.3 });
          for (let k = 0; k < 14; k++) { const x = (k + 0.4) / 14 * W; ad += ' ' + inkPath([[x - 14, FY], [x - 4, FY - 26 - (k % 3) * 8], [x + 2, FY - 6], [x + 10, FY - 30], [x + 16, FY]], { w: 3, seed: sd + 332 + k, t, amp: 1 }); } }
        ch.arch.setAttribute('d', ad); ch.archF.setAttribute('d', af);
        if (RU) {
          ['altar', 'altarR', 'cloth', 'candles', 'candleR', 'flames', 'chand', 'pews', 'heads', 'crack'].forEach(k => ch[k].setAttribute('d', ''));
          let gd = ''; for (let i = 0; i < 4; i++) { const gx = ((0.1 + i * 0.25) * W + lt * (40 + i * 10)) % (W + 100) - 50, gy = (0.24 + 0.05 * (i % 2)) * H + Math.sin(lt * 2 + i) * 8, fl = Math.sin(lt * 7 + i * 2) * 10;
            gd += inkPath([[gx - 26, gy - fl], [gx - 10, gy - 4], [gx, gy + 2], [gx + 10, gy - 4], [gx + 26, gy - fl]], { w: 4, seed: sd + 60 + i, t, amp: 1 }) + ' '; }
          sky.gulls.setAttribute('d', gd); sky.hatch.setAttribute('d', ''); sky.sun.setAttribute('d', inkCircle(0.5 * W, 0.3 * H, 50, sd + 5, t, { fill: true }));
          ['f', 'r', 'castle', 'backrow'].forEach(k => far[k].setAttribute('d', ''));
          bld.forEach(B => { B.f.setAttribute('d', ''); B.r.setAttribute('d', ''); B.win.setAttribute('d', ''); });
          [quay, water, shipsL].forEach(o => Object.values(o).forEach(n => n.setAttribute('d', '')));
          [smokeL, dustL, stones, embers, fireL.red, fireL.gold].forEach(n => n.setAttribute('d', ''));
          return;
        }
        // altar
        const ax0 = 0.36 * W, ax1 = 0.64 * W, ay = FY - 0.17 * H;
        const alt = [[ax0, FY], [ax0, ay], [ax1, ay], [ax1, FY]];
        ch.altar.setAttribute('d', inkLoop(alt, { seed: sd + 340, t, amp: 1, smooth: false }));
        ch.altarR.setAttribute('d', inkPath(alt, { w: 6, seed: sd + 341, t, amp: 1.3, closed: true, smooth: false }) + ' ' + inkPath([[W * 0.5, ay - 0.3 * H], [W * 0.5, ay - 0.08 * H]], { w: 7, seed: sd + 342, t, amp: 1 }) + ' ' + inkPath([[W * 0.5 - 50, ay - 0.24 * H], [W * 0.5 + 50, ay - 0.24 * H]], { w: 7, seed: sd + 343, t, amp: 1 }));
        // fire on the altar cloth
        const fiAt = atOr(cues, 'fire', null);
        let cl = inkLoop([[ax0 + 20, ay + 10], [ax1 - 20, ay + 10], [ax1 - 30, ay + 0.1 * H], [ax0 + 30, ay + 0.1 * H]], { seed: sd + 344, t, amp: 1, smooth: false });
        ch.cloth.setAttribute('d', cl);
        // candles
        const topAt = atOr(cues, 'topple', null);
        let cd = '', cr = '', fl = '';
        const NC = 9;
        for (let k = 0; k < NC; k++) {
          const x = lerp(ax0 + 30, ax1 - 30, k / (NC - 1)), hgt = 70 + (k % 3) * 22;
          let rot = 0;
          if (topAt != null) { const at = topAt + ((k * 5) % NC) * 0.12; rot = progIO(lt, at, 0.35) * (k % 2 ? 1.35 : -1.35); }
          rot += shake * Math.sin(lt * 23 + k) * 0.08;
          const c = Math.cos(rot), s = Math.sin(rot), T = p => [x + p[0] * c - p[1] * s, ay + p[0] * s + p[1] * c];
          const cp = [[-9, 0], [-9, -hgt], [9, -hgt], [9, 0]].map(T);
          cd += inkLoop(cp, { seed: sd + 350 + k, t, amp: 0.6, smooth: false }) + ' ';
          cr += inkPath(cp, { w: 3, seed: sd + 360 + k, t, amp: 0.8, closed: true, smooth: false }) + ' ';
          const fh = 30 + Math.sin(t * 11 + k) * 5, tip = T([Math.sin(t * 7 + k) * 4, -hgt - fh]);
          fl += inkLoop([T([-8, -hgt - 4]), tip, T([8, -hgt - 4]), T([0, -hgt + 6])], { seed: sd + 370 + k, t, amp: 0.8 }) + ' ';
        }
        // spreading fire
        let fireR = '';
        if (fiAt != null && lt > fiAt) {
          const g = clamp01((lt - fiAt) / 1.6);
          fl += inkLoop(flamePts(W * 0.5, ay + 0.1 * H, (ax1 - ax0) * (0.4 + 0.6 * g), 0.22 * H * g, t, 3), { seed: sd + 380, t, amp: 2, smooth: false }) + ' ';
          [0.2, 0.8].forEach((u, k) => { const gg = clamp01((lt - fiAt - 0.5 - k * 0.3) / 1.4); if (gg > 0) fireR += inkLoop(flamePts(u * W, FY, 0.14 * W, 0.45 * H * gg, t, 5 + k), { seed: sd + 385 + k, t, amp: 2, smooth: false }) + ' '; });
        }
        ch.candles.setAttribute('d', cd); ch.candleR.setAttribute('d', cr); ch.flames.setAttribute('d', fl + fireR);
        fireL.red.setAttribute('d', fireR);
        // chandeliers
        let chd = '', chf = '';
        [0.25, 0.75].forEach((u, k) => {
          const amp = 0.04 + shake * 0.32, ang = Math.sin(lt * (2.2 + shake * 2) + k) * amp;
          const px = u * W, py = CY + 44, L = 0.22 * H, cx = px + Math.sin(ang) * L, cy = py + Math.cos(ang) * L;
          chd += inkPath([[px, py], [cx, cy]], { w: 3, seed: sd + 390 + k, t, amp: 0.8 }) + ' ';
          chd += inkCircle(cx, cy + 20, 70, sd + 392 + k, t, { ry: 18, w: 5 }) + ' ';
          for (let j = 0; j < 5; j++) { const xx = cx - 60 + j * 30, yy = cy + 14 - (j % 2) * 4;
            chd += inkPath([[xx, yy], [xx, yy - 26]], { w: 5, seed: sd + 395 + k * 7 + j, t, amp: 0.6 }) + ' ';
            chf += inkLoop([[xx - 6, yy - 28], [xx + Math.sin(t * 9 + j) * 3, yy - 52], [xx + 6, yy - 28]], { seed: sd + 410 + k * 7 + j, t, amp: 0.8 }) + ' '; }
        });
        ch.chand.setAttribute('d', chd);
        ch.flames.setAttribute('d', fl + fireR + ' ' + chf);
        // pews + heads (congregation from behind)
        let pw = '', hd = '';
        for (let r = 0; r < 2; r++) {
          const y = FY + 30 + r * (portrait ? 70 : 80), h = 30;
          [[0.04, 0.44], [0.56, 0.96]].forEach(([a, b], k) => {
            pw += inkLoop([[a * W, y], [b * W, y], [b * W, y + h], [a * W, y + h]], { seed: sd + 430 + r * 3 + k, t, amp: 1, smooth: false }) + ' ';
            for (let j = 0; j < 6; j++) { const x = lerp(a * W + 50, b * W - 50, j / 5) + r * 20, bob = shake * Math.sin(lt * 17 + j + r) * 10;
              hd += inkCircle(x, y - 34 + bob, 26, sd + 440 + r * 20 + k * 7 + j, t, { fill: true }) + ' ';
              hd += inkLoop([[x - 34, y + 2], [x - 26, y - 10 + bob], [x + 26, y - 10 + bob], [x + 34, y + 2]], { seed: sd + 470 + r * 20 + k * 7 + j, t, amp: 0.8 }) + ' '; }
          });
        }
        ch.pews.setAttribute('d', pw); ch.heads.setAttribute('d', hd);
        // ceiling crack + falling stones
        let crk = '', st = '';
        if (hitAt != null && lt > hitAt) {
          const g = progIO(lt, hitAt, 0.4), pts = [];
          for (let j = 0; j <= 8; j++) pts.push([lerp(0.3 * W, 0.7 * W, j / 8 * g), CY + 44 + (j % 2 ? 40 : 10) + j * 6]);
          crk = inkPath(pts, { w: 8, seed: sd + 500, t, amp: 1.5, smooth: false });
          for (let k = 0; k < 6; k++) { const age = (lt - hitAt - k * 0.15); if (age < 0) continue; const y = CY + 80 + age * age * 900; if (y > FY + 40) continue;
            st += inkLoop(inkEllipsePts(0.34 * W + k * 0.06 * W, y, 22, 16, sd + 510 + k, 7, age * 4, 0.2), { seed: sd + 520 + k, t, amp: 1 }) + ' '; }
          for (let k = 0; k < 3; k++) { const age = lt - hitAt - 0.3 - k * 0.2; if (age > 0) st += ''; }
        }
        ch.crack.setAttribute('d', crk); stones.setAttribute('d', st);
        let dd = '';
        if (hitAt != null && lt > hitAt + 0.4) for (let k = 0; k < 4; k++) { const age = lt - hitAt - 0.4; dd += inkCircle((0.32 + k * 0.12) * W, FY - 20 - age * 30, Math.min(160, 50 + age * 80 + k * 10), sd + 530 + k, t, { fill: true, amp: 2 }) + ' '; }
        dustL.setAttribute('d', dd);
        // clear river-only layers
        ['f', 'r', 'castle', 'backrow'].forEach(k => far[k].setAttribute('d', ''));
        sky.hatch.setAttribute('d', ''); sky.sun.setAttribute('d', ''); sky.gulls.setAttribute('d', '');
        bld.forEach(B => { B.f.setAttribute('d', ''); B.r.setAttribute('d', ''); B.win.setAttribute('d', ''); });
        ['f', 'r', 'crack'].forEach(k => quay[k].setAttribute('d', ''));
        ['f', 'r', 'hatch', 'glow'].forEach(k => water[k].setAttribute('d', ''));
        ['f', 'r', 'hull'].forEach(k => shipsL[k].setAttribute('d', ''));
        smokeL.setAttribute('d', ''); fireL.gold.setAttribute('d', ''); embers.setAttribute('d', '');
        if (shake0 === undefined) return;
      }
    },
  };
  // aliases (same drawing, one mode each) so a video can alternate them: lz_church, lz_sea (recede | wave), lz_fire
  const viaCity = (ctx, m) => SH.lz_city.build(Object.assign({}, ctx, { forceMode: m }));
  SH.lz_church = { kind: '2d', build(ctx) { return viaCity(ctx, 'church'); } };
  SH.lz_sea = { kind: '2d', build(ctx) { return viaCity(ctx, (ctx.P || {}).mode === 'wave' ? 'wave' : 'recede'); } };
  SH.lz_fire = { kind: '2d', build(ctx) { return viaCity(ctx, 'fire'); } };
})();
