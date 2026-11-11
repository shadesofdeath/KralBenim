// ef_fitz: the loss of the SS Edmund Fitzgerald (Lake Superior, 10 November 1975) in parchment ink (brand/kit/BRAND.md
// §3, §5). Written for the Stickstory Short ag-01-edmund-fitzgerald (2026-11-11), parametric for any Great Lakes freighter
// / storm / radar / wreck story. Palette tokens only (INK.*), every line boils at 8 Hz through _ink.js, everything is a
// pure function of (seed, lt); no Math.random. Needs mcB__lib.js (window.MCB: cast, labels) at build time.
//
// Common: K = Kaşif {x, y (ground, 0..1 H), scale, pose, face, dir, emotion, seq} (MCB cast entry, who "kasif").
//         labels = [MCB label entries {text, x, y, at, size, color, font, stamp, rot, arrow}].
//
// SHOTS.ef_lake — a long Great Lakes ore freighter, side view (pilothouse at the bow, engine house + funnel at the stern,
//   a long low deck of hatch covers between), in a storm: rolling swells, rain, spray bursting over the deck.
//   Use "set": {"name": "storm", "horizon": ...}.
//   P: {mode: "storm"|"dive"|"empty"|"theory", x: 0.5, y: 0.56 (waterline, 0..1 H), L: 0.94 (length, of W),
//       measure: {at, text: "729 FT", dy: -250} (red dimension arrow bow to stern), dive: cue (mode dive: the bow
//       plunges and the ship goes under the waves, lights out), boat: {x: 0.5, y} (mode empty: a swamped lifeboat
//       drifts), shoal: {at} / wave: {at} (mode theory: rocks rise under the hull / a huge wave rears up at the left),
//       kasif: K, labels}
//   cues: hit (punch), measure.at, dive, shoal.at, wave.at, label names.
// SHOTS.ef_deck — cutaway close-up of the deck: three hatch coamings with their covers and clamps, green water washing
//   across the deck; below, the cargo hold with a pile of iron-ore pellets. On cue "leak" water streams in through the
//   cover seams and the water in the hold rises. P: {deck: 0.46, leak: cue, labels}   cues: hit, leak
// SHOTS.ef_radio — a pilothouse at night: three storm windows (waves, rain), a console across the bottom, a radio set
//   with a speaker grille, a dial, a red lamp and a handset on a coiled cord.
//   P: {mode: "talk"|"silent", quote: {text, at, y: 0.29} (talk: hand-written words type in, gold sound arcs from the
//       speaker), kasif: K, labels}   silent: the handset dangles off the desk on its cord, only faint static.
//   cues: hit, quote.at, label names
// SHOTS.ef_radar — close-up of a ship's radar scope: range rings, a turning gold sweep, sea clutter round the centre
//   (own ship), the shoreline echo, and one target blip that lights up as the sweep passes. On cue "gone" the blip stops
//   coming back; a red dashed ring marks the empty spot. P: {blip: [0.5, -2.1] (dist of r, angle rad), gone: cue, name:
//   "FITZGERALD" (hand label at the blip, hides on gone), labels}   cues: hit, gone
// SHOTS.ef_wreck — the lake bed far below the storm: light rays, silt, the bow section standing upright in the mud and
//   the stern section lying upside down (keel, rudder, propeller up), ore pellets and torn plates between, a red depth
//   arrow from the surface. P: {bed: 0.8, depth: {at, text: "530 FT", x: 0.9}, split: cue (red crack marks punch on the
//   broken ends), labels}   cues: hit, split, depth.at
// SHOTS.ef_shore — night on the north shore: a lighthouse on a high cliff (right) sweeping its beam over the dark lake,
//   waves below, a near rock ledge for the narrator. P: {kasif: K, labels, beam: 1}   cues: hit, label/seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const tf = (x, y, r = 0, s = 1) => `translate(${f1(x)} ${f1(y)}) rotate(${(r || 0).toFixed(3)}) scale(${s.toFixed(4)})`;

  function extras(root, P, W, H, sd) {
    const M = window.MCB;
    const k = P.kasif && M ? M.cast(el(root, 'g'), [Object.assign({ who: 'kasif' }, P.kasif)], W, H, sd + 501) : null;
    const lb = M ? M.labels(el(root, 'g'), P.labels || [], W, H, sd + 601) : null;
    return { update(lt, t, cues) { if (k) k.update(lt, t, cues); if (lb) lb.update(lt, t, cues); } };
  }
  function camOf(g, lt, dur, W, H, focus, zoom, hit) {
    const fx = focus[0] * W, fy = focus[1] * H, z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
    g.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }

  // ------------------------------------------------------------ the freighter (local units: length 1000, bow to +x,
  // waterline y = 0, deck y ≈ -60). Returns {g, update(t, lights)}.
  function freighter(parent, sd) {
    const g = el(parent, 'g');
    const hullF = inkEl(g, INK.red), hullR = inkEl(g), deckL = inkEl(g, INK.ink);
    const houseF = inkEl(g, INK.paperLight), houseR = inkEl(g), stack = inkEl(g, INK.ink), band = inkEl(g, INK.paperLight);
    const win = inkEl(g, INK.ink), lit = inkEl(g, INK.gold), hatch = inkEl(g, INK.inkSoft), rig = inkEl(g);
    const HULL = [[-505, -50], [-200, -54], [200, -56], [470, -64], [512, -76], [476, 30], [-470, 30], [-512, 6]];
    const FWD = rect(352, -64, 478, -106), PH = rect(378, -106, 458, -150), AFT = rect(-492, -52, -320, -112), AFT2 = rect(-470, -112, -360, -140);
    const STK = [[-440, -140], [-392, -140], [-385, -212], [-432, -212]];
    return {
      g,
      update(t, lights = 1) {
        hullF.setAttribute('d', inkLoop(HULL, { seed: sd + 1, t, amp: 1, smooth: false }));
        hullR.setAttribute('d', inkPath(HULL, { w: 6, seed: sd + 2, t, amp: 1.2, closed: true, smooth: false }));
        deckL.setAttribute('d', inkPath([[-505, -42], [200, -46], [470, -54]], { w: 4, seed: sd + 3, t, amp: 1 }) +
          ' ' + inkPath([[-480, 4], [480, 4]], { w: 3, seed: sd + 4, t, amp: 1 }));
        houseF.setAttribute('d', [FWD, PH, AFT, AFT2].map((p, i) => inkLoop(p, { seed: sd + 5 + i, t, amp: 0.8, smooth: false })).join(' '));
        houseR.setAttribute('d', [FWD, PH, AFT, AFT2].map((p, i) => inkPath(p, { w: 5, seed: sd + 10 + i, t, amp: 1, closed: true, smooth: false })).join(' '));
        stack.setAttribute('d', inkLoop(STK, { seed: sd + 15, t, amp: 0.8, smooth: false }));
        band.setAttribute('d', inkLoop([[-437, -192], [-388, -192], [-387, -180], [-436, -180]], { seed: sd + 16, t, amp: 0.5, smooth: false }));
        // pilothouse windows + portholes (lit gold while the lights are on)
        let wd = '';
        for (let i = 0; i < 4; i++) wd += inkLoop(rect(386 + i * 18, -140, 398 + i * 18, -120), { seed: sd + 20 + i, t, amp: 0.4, smooth: false }) + ' ';
        for (let i = 0; i < 6; i++) wd += inkDot(-475 + i * 26, -82, 6, 6, sd + 30 + i, t) + ' ';
        for (let i = 0; i < 4; i++) wd += inkDot(368 + i * 28, -86, 5, 5, sd + 40 + i, t) + ' ';
        lit.setAttribute('d', lights > 0.5 ? wd : '');
        win.setAttribute('d', lights > 0.5 ? '' : wd);
        let hd = '';
        for (let i = 0; i < 21; i++) { const x0 = -312 + i * 31.5, y0 = -50 - (x0 + 312) / 660 * 6; hd += inkLoop(rect(x0, y0 - 8, x0 + 22, y0), { seed: sd + 50 + i, t, amp: 0.4, smooth: false }) + ' '; }
        hatch.setAttribute('d', hd);
        rig.setAttribute('d', inkPath([[418, -150], [418, -222]], { w: 5, seed: sd + 80, t }) + ' ' + inkPath([[396, -206], [440, -206]], { w: 5, seed: sd + 81, t }) +
          ' ' + inkPath([[-300, -54], [-300, -150]], { w: 4, seed: sd + 82, t }) + ' ' + inkPath([[418, -222], [100, -60]], { w: 2.5, seed: sd + 83, t, amp: 0.8 }) +
          ' ' + inkPath([[-300, -150], [-60, -56]], { w: 2.5, seed: sd + 84, t, amp: 0.8 }));
      },
    };
  }

  // rolling water band in front: fill + foam crests; top(x, t) is the surface
  function swell(parent, W, H, y0, sd, o = {}) {
    const fill = inkEl(parent, INK.blue, { 'fill-opacity': o.op ?? 0.62 }), deep = inkEl(parent, INK.ink, { 'fill-opacity': 0.35 });
    const crest = inkEl(parent, INK.paperLight), line = inkEl(parent, INK.ink);
    const A = o.amp ?? 34, bottom = o.bottom ?? H + 30;
    const top = (x, t) => y0 + Math.sin(x * 0.0085 - t * 1.5) * A + Math.sin(x * 0.021 + t * 2.1) * A * 0.35;
    return {
      top,
      update(t) {
        const pts = [];
        for (let x = -60; x <= W + 60; x += 30) pts.push([x, top(x, t)]);
        fill.setAttribute('d', inkLoop(pts.concat([[W + 60, bottom], [-60, bottom]]), { seed: sd + 1, t, amp: 0.8, smooth: false }));
        const pts2 = pts.map(([x, y]) => [x, y + 90 + Math.sin(x * 0.013 + t) * 14]);
        deep.setAttribute('d', inkLoop(pts2.concat([[W + 60, bottom], [-60, bottom]]), { seed: sd + 2, t, amp: 0.8, smooth: false }));
        line.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 3, t, amp: 1.2 }));
        let cd = '';
        for (let k = 0; k < 7; k++) {   // foam caps riding the crests
          const x = ((k * 197 + t * 60) % (W + 200)) - 100, y = top(x, t);
          cd += inkPath([[x - 50, y + 4], [x - 10, y - 8], [x + 30, y - 2], [x + 55, y + 8]], { w: 7, seed: sd + 10 + k, t, amp: 1 }) + ' ';
          cd += inkPath([[x - 80, y + 40], [x + 40, y + 34]], { w: 3.5, seed: sd + 20 + k, t, amp: 1 }) + ' ';
        }
        if (o.hatch !== false) for (let k = 0; k < 18; k++) {   // deeper swell lines down to the frame bottom
          const yy = y0 + 150 + (k % 9) * ((Math.min(bottom, H) - y0 - 150) / 9) + Math.floor(k / 9) * 40;
          if (yy > Math.min(bottom, H) - 10) continue;
          const x = ((k * 263 + t * (25 + (k % 4) * 9)) % (W + 400)) - 200, Lw = 120 + (k % 5) * 50, a = 10 + (k % 3) * 6;
          cd += inkPath([[x, yy], [x + Lw * 0.35, yy - a - 4 * Math.sin(t * 1.7 + k)], [x + Lw * 0.7, yy - 2], [x + Lw, yy + 6]], { w: 3 + (yy - y0) / H * 6, seed: sd + 40 + k, t, amp: 1 }) + ' ';
        }
        crest.setAttribute('d', cd);
      },
    };
  }
  function rain(parent, W, H, sd, n = 46, y1 = H) {
    const p = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.7 }), r = rng(sd + 77), R = Array.from({ length: n }, () => [r(), r(), r()]);
    return { update(t) {
      let d = '';
      R.forEach((q, i) => { const sp = 900 + q[2] * 500, y = ((q[1] * y1 + t * sp) % (y1 + 100)) - 60, x = q[0] * (W + 200) - 100 - (y * 0.32); const L = 40 + q[2] * 40;
        d += inkPath([[x, y], [x - L * 0.32, y + L]], { w: 2.6, seed: sd + 100 + i, t, amp: 0.4, taper: 0.6 }) + ' '; });
      p.setAttribute('d', d);
    } };
  }
  function spray(parent, sd) {   // foam bursts, drawn in world coords around given points
    const p = inkEl(parent, INK.paperLight), o = inkEl(parent, INK.inkSoft);
    return { update(t, pts) {
      let d = '', od = '';
      pts.forEach(([x, y, per, ph, s], j) => {
        const u = ((t + ph) % per) / per; if (u > 0.55) return;
        const v = u / 0.55, r = rng(sd + j * 31);
        for (let i = 0; i < 14; i++) {
          const a = -Math.PI * (0.15 + 0.7 * r()), sp = (120 + 220 * r()) * s;
          const px = x + Math.cos(a) * sp * v, py = y + Math.sin(a) * sp * v + 260 * s * v * v;
          const rad = (6 + 12 * r()) * s * (1 - v * 0.6);
          d += inkDot(px, py, rad, rad * 0.85, sd + j * 50 + i, t) + ' ';
        }
        od += inkPath([[x - 70 * s, y], [x - 20 * s, y - 60 * s * (1 - v)], [x + 30 * s, y - 70 * s * (1 - v)], [x + 80 * s, y]], { w: 4, seed: sd + j * 7 + 400, t, amp: 1 }) + ' ';
      });
      p.setAttribute('d', d); o.setAttribute('d', od);
    } };
  }

  // ============================================================ ef_lake
  SH.ef_lake = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 311;
      const mode = P.mode || 'storm';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const theory = mode === 'theory';
      const WY = (P.y ?? (theory ? 0.4 : 0.45)) * H, L = (P.L ?? (theory ? 0.8 : 0.86)) * W, S = L / 1000, X = (P.x ?? 0.5) * W, YS = P.ys ?? (theory ? 1.2 : 1.45);
      const back = swell(cam, W, H, WY - 70, sd + 1, { amp: 22, op: 0.35, bottom: WY + 40, hatch: false });
      const bigWave = theory ? { f: inkEl(cam, INK.blue, { 'fill-opacity': 0.8 }), r: inkEl(cam), foam: inkEl(cam, INK.paperLight) } : null;
      const rocks = theory ? { f: inkEl(cam, INK.paperDark), r: inkEl(cam), h: inkEl(cam, INK.inkSoft) } : null;
      const ship = mode === 'empty' ? null : freighter(cam, sd + 10);
      const boat = mode === 'empty' ? { f: inkEl(cam, INK.paperLight), r: inkEl(cam), w: inkEl(cam, INK.blue, { 'fill-opacity': 0.7 }) } : null;
      const front = swell(cam, W, H, WY + 26, sd + 2, { amp: 30, op: theory ? 0.4 : 0.62, hatch: !theory });
      const near = (P.near === false || theory) ? null : swell(cam, W, H, (P.near_y ?? 0.76) * H, sd + 5, { amp: 55, op: 0.7 });
      const nearSp = near ? spray(cam, sd + 6) : null;
      const deck = P.deck ? { f: inkEl(cam, P.deck.kind === 'rock' ? INK.paperDark : INK.red), r: inkEl(cam), w: inkEl(cam, P.deck.kind === 'rock' ? INK.inkSoft : INK.paperLight) } : null;
      const sp = spray(cam, sd + 3), rn = rain(cam, W, H, sd + 4);
      const meas = P.measure ? { a: inkEl(root, INK.red), t: el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-size': P.measure.size || 96, 'font-weight': 900, fill: INK.red, 'text-anchor': 'middle' }) } : null;
      if (meas) meas.t.textContent = P.measure.text || '729 FT';
      const bub = inkEl(cam, INK.paperLight);
      const ex = extras(cam, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, lt, dur, W, H, [0.5, WY / H], P.zoom ?? 1.05, hit);
          back.update(t);
          // theory: the giant wave behind / rocks under the hull
          if (rocks) {
            const ra = atOr(cues, P.shoal && P.shoal.at, 0.3), rp = spring(lt, ra, 0.8);
            const base = H + 30, peak = WY + 120 + (1 - clamp01(rp)) * 500;
            const pts = [[-40, base], [-40, base - 140], [W * 0.18, base - 210], [W * 0.32, peak + 90], [W * 0.46, peak], [W * 0.56, peak + 30], [W * 0.66, peak + 120], [W * 0.84, base - 230], [W + 40, base - 160], [W + 40, base]];
            rocks.f.setAttribute('d', inkLoop(pts, { seed: sd + 60, t, amp: 1.2, smooth: false }));
            rocks.r.setAttribute('d', inkPath(pts.slice(1, -1), { w: 7, seed: sd + 61, t, amp: 1.4, smooth: false }));
            let hd = ''; for (let i = 0; i < 12; i++) { const x = W * (0.1 + i * 0.075), y = Math.max(peak + 60, base - 160) + (i % 3) * 50; hd += inkPath([[x, y], [x + 50, y + 26]], { w: 4, seed: sd + 70 + i, t }) + ' '; }
            rocks.h.setAttribute('d', hd);
          }
          if (bigWave) {
            const wa = atOr(cues, P.wave && P.wave.at, 1.2), wp = prog(lt, wa, 1.6);
            const top = WY - 40 - wp * 470, x0 = -60, cx = W * (0.08 + 0.18 * wp);
            const pts = [[x0, WY + 60], [x0, top + 80], [cx - 120, top], [cx + 20, top - 30], [cx + 120, top + 40], [cx + 90, top + 110], [cx + 160, WY - 20], [cx + 360, WY + 60]];
            bigWave.f.setAttribute('d', wp > 0.01 ? inkLoop(pts, { seed: sd + 80, t, amp: 1.5 }) : '');
            bigWave.r.setAttribute('d', wp > 0.01 ? inkPath(pts.slice(1, -1), { w: 7, seed: sd + 81, t, amp: 1.5 }) : '');
            let fd = ''; if (wp > 0.2) for (let i = 0; i < 9; i++) { const a = i / 8, x = cx - 100 + a * 220 + Math.sin(t * 3 + i) * 10, y = top - 20 + Math.sin(a * 3) * 30 + Math.cos(t * 4 + i) * 8; fd += inkDot(x, y, 14 - i * 0.6, 11, sd + 90 + i, t) + ' '; }
            bigWave.foam.setAttribute('d', fd);
          }
          // the ship
          let lights = 1, sx = X, sy = WY, rot = 2.4 * Math.sin(t * 1.05), sink = 0;
          sy += 9 * Math.sin(t * 1.3);
          if (mode === 'plunge') {   // held mid-plunge (hook / cover): bow under, stern up, lights still on
            const q = P.plunge || {}; rot = (q.rot ?? 13) + 1.2 * Math.sin(t * 1.05); sy = WY + (q.sink ?? 40) + 6 * Math.sin(t * 1.3);
          }
          if (mode === 'dive') {
            const da = atOr(cues, P.dive ?? "dive", dur * 0.5), u = progIO(lt, da, P.dive_dur ?? 2.4);
            rot += 24 * u; sink = 460 * Math.pow(Math.max(0, (u - 0.45) / 0.55), 2); sy += sink; if (lt >= da + 0.2) lights = 0;
          }
          if (ship) {
            ship.g.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(${rot.toFixed(3)}) scale(${S.toFixed(4)} ${(S * YS).toFixed(4)})`);
            ship.update(t, lights);
            ship.g.style.display = sink > 380 ? 'none' : '';
          }
          if (boat) {   // a swamped lifeboat drifting in the swell
            const bx = (P.boat && P.boat.x != null ? P.boat.x : 0.5) * W + Math.sin(lt * 0.4) * 30 + lt * 12, by = front.top(bx, t) + 6;
            const br = Math.atan2(front.top(bx + 20, t) - front.top(bx - 20, t), 40) * 57.3;
            const B = [[-120, -40], [120, -44], [150, -62], [110, 22], [-100, 22], [-150, -56]].map(([x, y]) => {
              const a = br * Math.PI / 180; return [bx + x * Math.cos(a) - y * Math.sin(a), by + x * Math.sin(a) + y * Math.cos(a)]; });
            boat.f.setAttribute('d', inkLoop(B, { seed: sd + 120, t, amp: 1 }));
            boat.r.setAttribute('d', inkPath(B, { w: 7, seed: sd + 121, t, closed: true }) + ' ' + inkPath([B[0], [ (B[0][0] + B[1][0]) / 2, (B[0][1] + B[1][1]) / 2 + 26], B[1]], { w: 4, seed: sd + 122, t }));
            const wl = [[B[5][0] + 30, by - 30], [bx, by - 26 + Math.sin(t * 3) * 6], [B[2][0] - 30, by - 32]];
            boat.w.setAttribute('d', inkLoop(wl.concat([[B[3][0], by + 10], [B[4][0], by + 10]]), { seed: sd + 123, t, amp: 1 }));
          }
          front.update(t);
          if (near) { near.update(t); const ny = (P.near_y ?? 0.76) * H; nearSp.update(t, [[W * 0.22, near.top(W * 0.22, t), 2.6, 0.4, 1.3], [W * 0.78, near.top(W * 0.78, t), 3.1, 1.7, 1.2]]); }
          if (deck && P.deck.kind === 'rock') {   // the narrator's foreground: a rock breakwater
            const dy = (P.deck.y ?? 0.84) * H, x0 = (P.deck.x0 ?? -0.05) * W, x1 = (P.deck.x1 ?? 0.62) * W;
            const B = [[x0, dy - 60], [x0 + (x1 - x0) * 0.25, dy - 95], [x0 + (x1 - x0) * 0.5, dy - 80], [x0 + (x1 - x0) * 0.75, dy - 110], [x1, dy - 40], [x1 + 70, dy + 120], [x1 + 110, H + 40], [x0, H + 40]];
            deck.f.setAttribute('d', inkLoop(B, { seed: sd + 170, t, amp: 1.2, smooth: false }));
            deck.r.setAttribute('d', inkPath(B.slice(0, 7), { w: 8, seed: sd + 171, t, amp: 1.4, smooth: false }) + ' ' +
              inkPath([[x0 + 60, dy + 40], [x0 + 200, dy + 20], [x0 + 260, dy + 120]], { w: 5, seed: sd + 172, t, smooth: false }) + ' ' +
              inkPath([[x1 - 160, dy + 10], [x1 - 60, dy + 60], [x1 - 90, dy + 200]], { w: 5, seed: sd + 173, t, smooth: false }));
            let hd = ''; for (let k = 0; k < 12; k++) { const x = x0 + 40 + (k * 83) % Math.max(100, x1 - x0 - 40), y = dy + 50 + (k % 4) * 70; hd += inkPath([[x, y], [x + 50, y + 22]], { w: 4, seed: sd + 175 + k, t }) + ' '; }
            const fy = dy - 60 + Math.sin(t * 2.4) * 10; for (let k = 0; k < 6; k++) { const u = (t * 0.8 + k / 6) % 1; hd += inkDot(x1 + 20 + k * 22, fy - 50 * Math.sin(u * Math.PI), 9 * (1 - u) + 3, 7 * (1 - u) + 3, sd + 190 + k, t) + ' '; }
            deck.w.setAttribute('d', hd);
          } else if (deck) {   // the narrator's foreground: the bow rail of the ship he watches from
            const dy = (P.deck.y ?? 0.84) * H, x0 = (P.deck.x0 ?? -0.05) * W, x1 = (P.deck.x1 ?? 0.62) * W, bob = 6 * Math.sin(t * 1.2);
            const B = [[x0, dy - 70 + bob], [x1 - 40, dy - 90 + bob], [x1 + 30, dy - 140 + bob], [x1 + 60, H + 40], [x0, H + 40]];
            deck.f.setAttribute('d', inkLoop(B, { seed: sd + 170, t, smooth: false }));
            let rd = inkPath(B.slice(0, 4), { w: 7, seed: sd + 171, t, smooth: false }) + ' ' + inkPath([[x0, dy - 160 + bob], [x1 - 40, dy - 180 + bob], [x1 + 30, dy - 230 + bob]], { w: 7, seed: sd + 172, t, smooth: false });
            for (let k = 0; k <= 6; k++) { const u = k / 6, x = lerp(x0 + 30, x1 + 10, u), y0 = lerp(dy - 72, dy - 110, u * u) + bob; rd += ' ' + inkPath([[x, y0], [x, y0 - 92]], { w: 5, seed: sd + 173 + k, t }); }
            deck.r.setAttribute('d', rd);
            deck.w.setAttribute('d', inkPath([[x0, dy - 30 + bob], [x1, dy - 50 + bob]], { w: 6, seed: sd + 181, t }));
          }
          if (ship && mode === 'plunge') sp.update(t, [[sx + 230 * S, WY - 10, 1.6, 0.2, 1.4], [sx + 120 * S, WY, 2.1, 1.0, 1.1]]);
          else if (ship && mode !== 'dive') sp.update(t, [[sx + 300 * S, sy - 40, 2.2, 0.3, 1.1], [sx - 60 * S, sy - 30, 2.9, 1.5, 0.9]].concat(theory ? [] : [[sx + 120 * S, sy - 40, 3.4, 2.4, 0.8]]));
          else if (mode === 'dive') {
            const da = atOr(cues, P.dive ?? 'dive', dur * 0.5);
            sp.update(t, lt > da ? [[sx + 300 * S, WY - 20, 1.4, 0, 1.3], [sx, WY - 10, 1.9, 0.6, 1.1]] : [[sx + 300 * S, sy - 40, 2.2, 0.3, 1.1]]);
            let bd = ''; if (lt > da + 1.2) for (let i = 0; i < 10; i++) { const u = ((lt - da) * 0.6 + i * 0.13) % 1; bd += inkCircle(sx + 200 * S + Math.sin(i * 2.3) * 160, WY + 200 - u * 200, 6 + (i % 3) * 3, sd + 140 + i, t, { w: 3 }) + ' '; }
            bub.setAttribute('d', bd);
          } else sp.update(t, []);
          rn.update(t);
          if (meas) {
            const ma = atOr(cues, P.measure.at, 0.4), mp = prog(lt, ma, 0.7), y = WY + (P.measure.dy ?? -260);
            const x0 = X - L / 2, x1 = X + L / 2, cx = X;
            const a0 = lerp(cx, x0, mp), a1 = lerp(cx, x1, mp);
            meas.a.setAttribute('d', mp > 0.01 ? inkPath([[a0, y], [a1, y]], { w: 7, seed: sd + 150, t }) + ' ' +
              inkPath([[a0 + 34, y - 22], [a0, y], [a0 + 34, y + 22]], { w: 7, seed: sd + 151, t, smooth: false }) + ' ' +
              inkPath([[a1 - 34, y - 22], [a1, y], [a1 - 34, y + 22]], { w: 7, seed: sd + 152, t, smooth: false }) + ' ' +
              inkPath([[x0, y - 40], [x0, y + 40]], { w: 5, seed: sd + 153, t }) + ' ' + inkPath([[x1, y - 40], [x1, y + 40]], { w: 5, seed: sd + 154, t }) : '');
            const sc = spring(lt, ma + 0.3, 0.6) * (1 + 0.08 * punch(lt, ma + 0.3, 0.6)), b = boil(sd + 155, t, 1.2);
            meas.t.setAttribute('transform', `translate(${f1(cx + b[0])} ${f1(y - 34 + b[1])}) scale(${Math.max(0.01, sc).toFixed(3)})`);
          }
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ ef_deck
  SH.ef_deck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 523;
      const DY = (P.deck ?? 0.46) * H;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const holdF = inkEl(cam, INK.paperDark), water = inkEl(cam, INK.blue, { 'fill-opacity': 0.75 }), waterL = inkEl(cam, INK.paperLight);
      const ore = inkEl(cam, INK.inkSoft), oreR = inkEl(cam), ribs = inkEl(cam, INK.inkSoft);
      const streams = inkEl(cam, INK.blue), drops = inkEl(cam, INK.paperLight);
      const deckF = inkEl(cam, INK.red), deckR = inkEl(cam), coamF = inkEl(cam, INK.paperLight), coamR = inkEl(cam), clamps = inkEl(cam);
      const green = inkEl(cam, INK.blue, { 'fill-opacity': 0.85 }), greenL = inkEl(cam, INK.paperLight);
      const rn = rain(cam, W, H, sd + 4, 34, DY);
      const HX = [0.18, 0.5, 0.82];
      const r = rng(sd + 9), PEL = Array.from({ length: 170 }, () => [r(), r(), r()]);
      const ex = extras(root, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const la = atOr(cues, P.leak ?? 'leak', dur * 0.35), lp = lt >= la ? prog(lt, la, 0.5) : 0, lk = punch(lt, la, 0.6);
          camOf(cam, lt, dur, W, H, [0.5, 0.5], 1.05, hit + lk);
          const roll = 1.4 * Math.sin(t * 1.1);
          cam.setAttribute('transform', cam.getAttribute('transform') + ` rotate(${roll.toFixed(3)} ${W / 2} ${DY})`);
          const bot = H + 40;
          const hold = [[-40, DY + 30], [W + 40, DY + 30], [W + 40, bot], [-40, bot]];
          holdF.setAttribute('d', inkLoop(hold, { seed: sd + 1, t, smooth: false }));
          let rb = ''; for (let i = 0; i < 6; i++) { const x = W * (i + 0.5) / 6; rb += inkPath([[x, DY + 40], [x, bot]], { w: 4, seed: sd + 10 + i, t }) + ' '; }
          rb += inkPath([[-40, DY + 260], [W + 40, DY + 262]], { w: 3, seed: sd + 17, t });
          ribs.setAttribute('d', rb);
          // ore pellet pile (a long hump)
          const pileTop = x => H * 0.8 - 140 * Math.exp(-Math.pow((x - W * 0.5) / (W * 0.42), 2));
          const pp = []; for (let x = -40; x <= W + 40; x += 60) pp.push([x, pileTop(x)]);
          ore.setAttribute('d', inkLoop(pp.concat([[W + 40, bot], [-40, bot]]), { seed: sd + 20, t, amp: 1, smooth: false }));
          let od = inkPath(pp, { w: 5, seed: sd + 21, t }) + ' ';
          PEL.forEach((q, i) => { const x = q[0] * W, y = pileTop(x) + 20 + q[1] * (bot - pileTop(x)); od += inkCircle(x, y, 7 + q[2] * 6, sd + 30 + i, t, { w: 3, amp: 0.5 }) + ' '; });
          oreR.setAttribute('d', od);
          // water rising in the hold
          const lvl = H * 0.97 - lp * 0 - clamp01((lt - la) / Math.max(1, dur - la)) * H * 0.22;
          if (lt > la + 0.4) {
            const wp = []; for (let x = -40; x <= W + 40; x += 40) wp.push([x, lvl + Math.sin(x * 0.01 + t * 2.2) * 10]);
            water.setAttribute('d', inkLoop(wp.concat([[W + 40, bot], [-40, bot]]), { seed: sd + 40, t, amp: 0.8, smooth: false }));
            waterL.setAttribute('d', inkPath(wp, { w: 5, seed: sd + 41, t }));
          } else { water.setAttribute('d', ''); waterL.setAttribute('d', ''); }
          // leaking streams through the cover seams
          let sd2 = '', dd = '';
          if (lp > 0) HX.forEach((hx, j) => [-1, 1].forEach((side, s) => {
            const x = hx * W + side * W * 0.11, y0 = DY + 34, y1 = lerp(y0, lvl, lp);
            const pts = []; for (let k = 0; k <= 6; k++) { const v = k / 6; pts.push([x + Math.sin(v * 5 + t * 6 + j) * 8 * v, lerp(y0, y1, v)]); }
            sd2 += inkPath(pts, { w: 14 - v0(j, s), seed: sd + 50 + j * 2 + s, t, amp: 1, taper: 0.2 }) + ' ';
            for (let k = 0; k < 3; k++) { const u = ((t * 1.6 + k / 3 + j * 0.2 + s * 0.5) % 1); dd += inkDot(x + 4, lerp(y0, y1, u), 5, 8, sd + 60 + j * 6 + s * 3 + k, t) + ' '; }
          }));
          streams.setAttribute('d', sd2); drops.setAttribute('d', dd);
          // deck plating + hatch coamings + covers + clamps
          const deck = [[-40, DY - 10], [W + 40, DY - 10], [W + 40, DY + 30], [-40, DY + 30]];
          deckF.setAttribute('d', inkLoop(deck, { seed: sd + 70, t, smooth: false }));
          deckR.setAttribute('d', inkPath([[-40, DY - 10], [W + 40, DY - 10]], { w: 7, seed: sd + 71, t }) + ' ' + inkPath([[-40, DY + 30], [W + 40, DY + 30]], { w: 6, seed: sd + 72, t }));
          let cf = '', cr = '', cl = '';
          HX.forEach((hx, j) => {
            const x0 = hx * W - W * 0.12, x1 = hx * W + W * 0.12, lift = lp * (j === 1 ? 10 : 6) * (0.5 + 0.5 * Math.sin(t * 7 + j));
            const co = rect(x0, DY - 80, x1, DY - 10), cv = rect(x0 - 12, DY - 104 - lift, x1 + 12, DY - 80 - lift);
            cf += inkLoop(co, { seed: sd + 80 + j, t, smooth: false }) + ' ' + inkLoop(cv, { seed: sd + 85 + j, t, smooth: false }) + ' ';
            cr += inkPath(co, { w: 6, seed: sd + 90 + j, t, closed: true, smooth: false }) + ' ' + inkPath(cv, { w: 6, seed: sd + 95 + j, t, closed: true, smooth: false }) + ' ';
            for (let k = 0; k < 4; k++) { const cx = lerp(x0 + 20, x1 - 20, k / 3); cl += inkPath([[cx, DY - 96 - lift], [cx + 10, DY - 70], [cx, DY - 52]], { w: 5, seed: sd + 100 + j * 4 + k, t, smooth: false }) + ' '; }
          });
          coamF.setAttribute('d', cf); coamR.setAttribute('d', cr); clamps.setAttribute('d', cl);
          // green water sweeping across the deck
          const gx = ((t * 260) % (W + 900)) - 450, gp = [];
          for (let x = -40; x <= W + 40; x += 30) { const d = Math.exp(-Math.pow((x - gx) / 260, 2)); gp.push([x, DY - 12 - 30 * d - 120 * d * (0.6 + 0.4 * Math.sin(t * 3))]); }
          green.setAttribute('d', inkLoop(gp.concat([[W + 40, DY - 8], [-40, DY - 8]]), { seed: sd + 120, t, amp: 1, smooth: false }));
          greenL.setAttribute('d', inkPath(gp, { w: 6, seed: sd + 121, t }));
          rn.update(t);
          ex.update(lt, t, cues);
        },
      };
      function v0(j, s) { return (j + s) % 2 ? 4 : 0; }
    },
  };

  // ============================================================ ef_radio
  SH.ef_radio = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 733;
      const mode = P.mode || 'talk';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const WY0 = 0.13 * H, WY1 = 0.4 * H, CT = 0.6 * H;
      const out = inkEl(cam, INK.inkSoft), outW = inkEl(cam, INK.paperLight), outRain = rain(cam, W, H, sd + 3, 30, WY1);
      const mull = inkEl(cam);
      const radF = inkEl(cam, INK.paperLight), radR = inkEl(cam), grill = inkEl(cam, INK.ink), dial = inkEl(cam, INK.paperDark), needle = inkEl(cam, INK.red), lamp = inkEl(cam, INK.red);
      const arcs = inkEl(cam, INK.gold), stat = inkEl(cam, INK.inkSoft);
      const kas = P.kasif && window.MCB ? window.MCB.cast(el(cam, 'g'), [Object.assign({ who: 'kasif' }, P.kasif)], W, H, sd + 501) : null;
      const consF = inkEl(cam, INK.paperDark), consR = inkEl(cam), knobs = inkEl(cam), cord = inkEl(cam), hsF = inkEl(cam, INK.ink);
      const Q = P.quote || null, qg = Q ? el(root, 'g') : null;
      const qF = Q ? inkEl(qg, INK.paperLight) : null, qR = Q ? inkEl(qg) : null;
      const qT = Q ? el(qg, 'text', { 'font-family': INK_FONT, 'font-size': Q.size || 70, fill: INK.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' }) : null;
      const words = Q ? String(Q.text).split(' ') : [];
      let qw = 0; if (qT) { qT.textContent = Q.text; try { qw = qT.getComputedTextLength(); } catch (e) { qw = Q.text.length * 30; } }
      const lb = window.MCB ? window.MCB.labels(el(root, 'g'), P.labels || [], W, H, sd + 601) : null;
      const RX0 = 0.08 * W, RX1 = 0.64 * W, RY0 = 0.43 * H, RY1 = CT;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, lt, dur, W, H, [0.4, 0.5], P.zoom ?? 1.06, hit);
          // storm windows
          const wins = [[0.03, 0.33], [0.35, 0.65], [0.67, 0.97]].map(([a, b]) => rect(a * W, WY0, b * W, WY1));
          out.setAttribute('d', wins.map((p, i) => inkLoop(p, { seed: sd + 1 + i, t, smooth: false, amp: 0.6 })).join(' '));
          let wd = '';
          for (let k = 0; k < 9; k++) { const y = WY1 - 40 - (k % 3) * 46, x = ((k * 211 + t * 80) % (W + 200)) - 100, a = 22 + Math.sin(t * 2 + k) * 10;
            if (y < WY0 + 20) continue; wd += inkPath([[x - 70, y + 10], [x - 20, y - a], [x + 40, y], [x + 80, y + 14]], { w: 5, seed: sd + 10 + k, t }) + ' '; }
          outW.setAttribute('d', wd);
          outRain.update(t);
          mull.setAttribute('d', wins.map((p, i) => inkPath(p, { w: 14, seed: sd + 20 + i, t, closed: true, smooth: false })).join(' ') + ' ' +
            inkPath([[0, WY0 - 20], [W, WY0 - 20]], { w: 8, seed: sd + 24, t }) + ' ' + inkPath([[0, WY1 + 20], [W, WY1 + 20]], { w: 6, seed: sd + 25, t }));
          // radio set
          const rb = rect(RX0, RY0, RX1, RY1);
          radF.setAttribute('d', inkLoop(rb, { seed: sd + 30, t, smooth: false }));
          const gx = RX0 + 140, gy = (RY0 + RY1) / 2, gr = 100;
          let gd = inkPath(rb, { w: 7, seed: sd + 31, t, closed: true, smooth: false }) + ' ' + inkCircle(gx, gy, gr, sd + 32, t, { w: 7 });
          let gl = ''; for (let k = -3; k <= 3; k++) { const y = gy + k * 24, hw = Math.sqrt(Math.max(0, gr * gr - (k * 24) * (k * 24))) * 0.82; gl += inkPath([[gx - hw, y], [gx + hw, y]], { w: 6, seed: sd + 33 + k, t, amp: 0.6 }) + ' '; }
          grill.setAttribute('d', gl);
          const dx0 = RX0 + 280, dx1 = RX1 - 40, dy0 = RY0 + 40, dy1 = RY0 + 120;
          dial.setAttribute('d', inkLoop(rect(dx0, dy0, dx1, dy1), { seed: sd + 40, t, smooth: false }));
          gd += ' ' + inkPath(rect(dx0, dy0, dx1, dy1), { w: 5, seed: sd + 41, t, closed: true, smooth: false });
          for (let k = 0; k < 9; k++) { const x = lerp(dx0 + 20, dx1 - 20, k / 8); gd += ' ' + inkPath([[x, dy1 - 10], [x, dy1 - (k % 2 ? 26 : 40)]], { w: 3, seed: sd + 42 + k, t, amp: 0.5 }); }
          for (let k = 0; k < 2; k++) { const kx = dx0 + 60 + k * 150, ky = RY1 - 70; gd += ' ' + inkCircle(kx, ky, 34, sd + 55 + k, t, { w: 6 }) + ' ' + inkPath([[kx, ky], [kx + Math.cos(t * 0.5 + k) * 26, ky + Math.sin(t * 0.5 + k) * 26]], { w: 5, seed: sd + 57 + k, t }); }
          radR.setAttribute('d', gd);
          const nx = lerp(dx0 + 40, dx1 - 40, 0.55 + 0.04 * Math.sin(t * 3.1));
          needle.setAttribute('d', inkPath([[nx, dy0 + 6], [nx, dy1 - 6]], { w: 5, seed: sd + 60, t }));
          const blink = (Math.floor(t * 2) % 2) ? 1 : 0;
          lamp.setAttribute('d', (mode === 'talk' || blink) ? inkDot(dx1 - 26, RY1 - 70, 18, 18, sd + 61, t) : '');
          // sound arcs (talk) or faint static (silent)
          let ad = '', st = '';
          if (mode === 'talk') {
            const qa = Q ? atOr(cues, Q.at, 0.2) : 0.2;
            if (lt > qa) for (let k = 0; k < 3; k++) { const u = ((lt - qa) * 1.1 + k / 3) % 1, rr = gr + 20 + u * 140;
              const pts = []; for (let a = -0.9; a <= 0.9; a += 0.15) pts.push([gx + Math.cos(a - Math.PI / 2) * rr, gy + Math.sin(a - Math.PI / 2) * rr]);
              ad += inkPath(pts, { w: 9 * (1 - u) + 2, seed: sd + 70 + k, t, amp: 1 }) + ' '; }
          } else {
            for (let k = 0; k < 2; k++) { const y = gy - gr - 60 - k * 40, pts = []; for (let i = 0; i <= 8; i++) pts.push([gx - 80 + i * 20, y + ((i + inkFrame(t) + k) % 2 ? -10 : 10)]);
              st += inkPath(pts, { w: 4, seed: sd + 80 + k, t, smooth: false }) + ' '; }
          }
          arcs.setAttribute('d', ad); stat.setAttribute('d', st);
          if (kas) kas.update(lt, t, cues);
          // console
          const cons = [[-40, CT], [W + 40, CT], [W + 40, H + 40], [-40, H + 40]];
          consF.setAttribute('d', inkLoop(cons, { seed: sd + 90, t, smooth: false }));
          let cd = inkPath([[-40, CT], [W + 40, CT]], { w: 8, seed: sd + 91, t }) + ' ' + inkPath([[-40, CT + 40], [W + 40, CT + 40]], { w: 4, seed: sd + 92, t });
          for (let k = 0; k < 2; k++) cd += ' ' + inkPath(rect(W * (0.08 + k * 0.48), CT + 120, W * (0.44 + k * 0.48), H * 0.98), { w: 5, seed: sd + 93 + k, t, closed: true, smooth: false });
          consR.setAttribute('d', cd);
          let kd = ''; for (let k = 0; k < 6; k++) { const kx = W * (0.14 + k * 0.145), ky = CT + 210; kd += inkCircle(kx, ky, 26, sd + 100 + k, t, { w: 5 }) + ' ' + inkPath([[kx, ky], [kx + Math.cos(t * (0.3 + k * 0.1)) * 20, ky + Math.sin(t * (0.3 + k * 0.1)) * 20]], { w: 4, seed: sd + 110 + k, t }) + ' '; }
          for (let k = 0; k < 2; k++) { const gx2 = W * (0.26 + k * 0.48), gy2 = CT + 380; kd += inkCircle(gx2, gy2, 70, sd + 120 + k, t, { w: 6 }) + ' ' + inkPath([[gx2, gy2], [gx2 + Math.cos(-2 + Math.sin(t * 1.3 + k) * 0.5) * 56, gy2 + Math.sin(-2 + Math.sin(t * 1.3 + k) * 0.5) * 56]], { w: 5, seed: sd + 125 + k, t }) + ' '; }
          knobs.setAttribute('d', kd);
          // handset: on its hook (talk) or dangling off the desk edge on the cord (silent)
          const hx0 = RX1 + 10, hy0 = RY0 + 90;
          let hx, hy, ha;
          if (mode === 'silent') { const sw = Math.sin(t * 1.7) * 0.28 * Math.exp(-lt * 0.05); const len = 330; hx = W * 0.74 + Math.sin(sw) * len; hy = CT + 60 + Math.cos(sw) * len; ha = 90 + sw * 57; }
          else { hx = RX1 + 90; hy = RY0 + 70; ha = 0; }
          const cs = [], ax = mode === 'silent' ? W * 0.74 : hx0, ay = mode === 'silent' ? CT + 10 : hy0 + 40;
          cs.push([hx0, RY1 - 40]);
          const n = 22; for (let i = 1; i <= n; i++) { const v = i / n; const x = lerp(mode === 'silent' ? ax : hx0, hx, v), y = lerp(mode === 'silent' ? ay : RY1 - 40, hy + 20, v); cs.push([x + Math.cos(i * 1.9) * 14, y + Math.sin(i * 1.9) * 14]); }
          let cdd = inkPath(cs, { w: 4, seed: sd + 130, t, amp: 0.8 });
          if (mode === 'silent') cdd += ' ' + inkPath([[hx0, RY1 - 40], [ax, ay]], { w: 4, seed: sd + 131, t });
          cord.setAttribute('d', cdd);
          const a = ha * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
          const HS = [[-80, -20], [-40, -26], [40, -26], [80, -20], [92, 18], [54, 22], [40, 0], [-40, 0], [-54, 22], [-92, 18]].map(([x, y]) => [hx + x * ca - y * sa, hy + x * sa + y * ca]);
          hsF.setAttribute('d', inkLoop(HS, { seed: sd + 140, t, amp: 0.8 }));
          // the hand-written words
          if (Q) {
            const qa = atOr(cues, Q.at, 0.2), y = (Q.y ?? 0.29) * H;
            const nW = Math.min(words.length, Math.floor(clamp01((lt - qa) / Math.max(0.6, Q.dur ?? 1.8)) * words.length + (lt >= qa ? 1 : 0)));
            qg.style.display = lt >= qa ? '' : 'none';
            qT.textContent = words.slice(0, Math.max(1, nW)).join(' ');
            const p = spring(lt, qa, 0.5), b = boil(sd + 150, t, 1.2), box = rect(-qw / 2 - 40, -60, qw / 2 + 40, 60);
            qg.setAttribute('transform', `translate(${f1(W / 2 + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${Math.max(0.01, p).toFixed(3)})`);
            qF.setAttribute('d', inkLoop(box, { seed: sd + 151, t, smooth: false }));
            qR.setAttribute('d', inkPath(box, { w: 6, seed: sd + 152, t, closed: true, smooth: false }));
            qT.setAttribute('x', 0); qT.setAttribute('y', 4);
            qT.setAttribute('text-anchor', 'start'); qT.setAttribute('x', f1(-qw / 2));
          }
          if (lb) lb.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ ef_radar
  SH.ef_radar = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 941;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const CX = 0.5 * W, CY = (P.cy ?? 0.37) * H, R = P.r ?? 400;
      const consF = inkEl(cam, INK.paperDark), consR = inkEl(cam), knobs = inkEl(cam);
      const bez = inkEl(cam, INK.inkSoft), scr = inkEl(cam, INK.ink), rings = inkEl(cam, INK.inkSoft);
      const shore = inkEl(cam, INK.gold), clutter = inkEl(cam, INK.gold), sweep = inkEl(cam, INK.gold), trail = inkEl(cam, INK.gold, { 'fill-opacity': 0.28 });
      const blip = inkEl(cam, INK.gold), own = inkEl(cam, INK.paperLight), ring = inkEl(cam, INK.red), bezR = inkEl(cam);
      const nm = P.name === false ? null : el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 52, fill: INK.paperLight, 'text-anchor': 'middle' });
      if (nm) nm.textContent = P.name || 'FITZGERALD';
      const B = P.blip || [0.55, -2.0], bx = CX + Math.cos(B[1]) * B[0] * R, by = CY + Math.sin(B[1]) * B[0] * R;
      const r = rng(sd + 3), CL = Array.from({ length: 70 }, () => [r(), r(), r()]);
      const ex = extras(root, P, W, H, sd);
      const PER = P.period ?? 2.2;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const ga = atOr(cues, P.gone ?? 'gone', dur * 0.45), gk = punch(lt, ga, 0.6);
          camOf(cam, lt, dur, W, H, [0.5, CY / H], 1.06, hit + gk);
          // console around the scope, filling the frame
          const cons = [[-40, CY - R - 120], [W + 40, CY - R - 120], [W + 40, H + 40], [-40, H + 40]];
          consF.setAttribute('d', inkLoop(cons, { seed: sd + 1, t, smooth: false }));
          let cd = inkPath([[-40, CY - R - 120], [W + 40, CY - R - 120]], { w: 7, seed: sd + 2, t }) + ' ' + inkPath(rect(W * 0.06, CY + R + 260, W * 0.94, H * 0.97), { w: 6, seed: sd + 4, t, closed: true, smooth: false });
          for (let k = 0; k < 4; k++) { const sx = W * (0.08 + k * 0.28); cd += ' ' + inkDot(sx, CY - R - 60, 10, 10, sd + 5 + k, t); }
          consR.setAttribute('d', cd);
          let kd = ''; for (let k = 0; k < 5; k++) { const kx = W * (0.16 + k * 0.17), ky = CY + R + 400; kd += inkCircle(kx, ky, 40, sd + 10 + k, t, { w: 6 }) + ' ' + inkPath([[kx, ky], [kx + Math.cos(t * 0.4 + k) * 32, ky + Math.sin(t * 0.4 + k) * 32]], { w: 5, seed: sd + 16 + k, t }) + ' '; }
          for (let k = 0; k < 3; k++) { const kx = W * (0.25 + k * 0.25), ky = CY + R + 150; kd += inkPath(rect(kx - 60, ky - 30, kx + 60, ky + 30), { w: 5, seed: sd + 22 + k, t, closed: true, smooth: false }) + ' '; }
          if (P.shelf) {   // a chart-table top for the narrator to stand behind / lean on
            const y = P.shelf * H; kd += inkPath([[W * 0.56, y], [W + 40, y]], { w: 8, seed: sd + 300, t }) + ' ' + inkPath([[W * 0.56, y + 26], [W + 40, y + 26]], { w: 4, seed: sd + 301, t }) + ' ';
          }
          // toggle switches, a logbook and a handset on the lower panel
          const py = CY + R + 300;
          for (let k = 0; k < 6; k++) { const x = W * (0.12 + k * 0.075), on = ((k + Math.floor(t * 0.7)) % 3) === 0; kd += inkCircle(x, py, 13, sd + 310 + k, t, { w: 4 }) + ' ' + inkPath([[x, py], [x + (on ? 14 : -14), py - 34]], { w: 6, seed: sd + 320 + k, t }) + ' '; }
          const bx0 = W * 0.12, by0 = H * 0.86;
          kd += inkPath([[bx0, by0], [bx0 + 150, by0 - 16], [bx0 + 300, by0], [bx0 + 300, by0 + 110], [bx0 + 150, by0 + 94], [bx0, by0 + 110]], { w: 5, seed: sd + 330, t, closed: true, smooth: false }) + ' ' + inkPath([[bx0 + 150, by0 - 16], [bx0 + 150, by0 + 94]], { w: 4, seed: sd + 331, t }) + ' ';
          for (let k = 0; k < 4; k++) { kd += inkPath([[bx0 + 20, by0 + 22 + k * 20], [bx0 + 130, by0 + 14 + k * 20]], { w: 3, seed: sd + 332 + k, t }) + ' ' + inkPath([[bx0 + 170, by0 + 14 + k * 20], [bx0 + (k === 3 ? 230 : 280), by0 + 22 + k * 20]], { w: 3, seed: sd + 336 + k, t }) + ' '; }
          const hx = W * 0.56, hy = H * 0.885;
          kd += inkPath([[hx - 90, hy], [hx - 60, hy - 20], [hx + 60, hy - 20], [hx + 90, hy]], { w: 14, seed: sd + 340, t }) + ' ';
          for (let k = 0; k < 7; k++) kd += inkCircle(hx + 110 + k * 16, hy + 20 + Math.sin(k) * 6, 11, sd + 345 + k, t, { w: 3 }) + ' ';
          knobs.setAttribute('d', kd);
          bez.setAttribute('d', inkCircle(CX, CY, R + 50, sd + 30, t, { fill: true }));
          scr.setAttribute('d', inkCircle(CX, CY, R, sd + 31, t, { fill: true, amp: 0.6 }));
          let rd = ''; for (let k = 1; k <= 3; k++) rd += inkCircle(CX, CY, R * k / 4, sd + 32 + k, t, { w: 3, amp: 0.5 }) + ' ';
          rd += inkPath([[CX - R, CY], [CX + R, CY]], { w: 2.5, seed: sd + 37, t, amp: 0.4 }) + ' ' + inkPath([[CX, CY - R], [CX, CY + R]], { w: 2.5, seed: sd + 38, t, amp: 0.4 });
          rings.setAttribute('d', rd);
          bezR.setAttribute('d', inkCircle(CX, CY, R + 50, sd + 39, t, { w: 8 }) + ' ' + inkCircle(CX, CY, R, sd + 40, t, { w: 6 }));
          // sweep
          const ang = -Math.PI / 2 + (lt / PER) * Math.PI * 2, ex2 = CX + Math.cos(ang) * R * 0.98, ey2 = CY + Math.sin(ang) * R * 0.98;
          sweep.setAttribute('d', inkPath([[CX, CY], [ex2, ey2]], { w: 7, seed: sd + 41, t, amp: 0.6 }));
          const tp = [[CX, CY]]; for (let k = 0; k <= 8; k++) { const a = ang - k * 0.08; tp.push([CX + Math.cos(a) * R * 0.97, CY + Math.sin(a) * R * 0.97]); }
          trail.setAttribute('d', inkLoop(tp, { seed: sd + 42, t, amp: 0.5, smooth: false }));
          const since = a0 => { let d = (ang - a0) % (Math.PI * 2); if (d < 0) d += Math.PI * 2; return d / (Math.PI * 2) * PER; };
          // shoreline echo (upper right arc) + sea clutter around the centre
          let sh = ''; for (let k = 0; k < 26; k++) { const a = -1.25 + k * 0.045, rr = R * (0.78 + 0.06 * Math.sin(k * 1.7)); const x = CX + Math.cos(a) * rr, y = CY + Math.sin(a) * rr; const f = Math.exp(-since(a) * 1.2);
            sh += inkDot(x, y, 4 + 7 * f, 4 + 7 * f, sd + 50 + k, t) + ' '; }
          shore.setAttribute('d', sh);
          let cl = ''; CL.forEach((q, i) => { const a = q[0] * Math.PI * 2, rr = R * (0.04 + 0.26 * q[1] * q[1]); const f = Math.exp(-since(a) * 1.6); if (f < 0.15) return;
            cl += inkDot(CX + Math.cos(a) * rr, CY + Math.sin(a) * rr, 3 + 5 * f * q[2], 3 + 5 * f * q[2], sd + 80 + i, t) + ' '; });
          clutter.setAttribute('d', cl);
          own.setAttribute('d', inkDot(CX, CY, 12, 12, sd + 150, t));
          // the target blip
          const ba = Math.atan2(by - CY, bx - CX), fb = Math.exp(-since(ba) * 1.1);
          const lastPass = lt - since(ba);   // when the sweep last crossed the blip
          const alive = lastPass < ga;
          blip.setAttribute('d', alive ? inkDot(bx, by, 10 + 16 * fb, 9 + 14 * fb, sd + 151, t) : '');
          if (nm) { nm.setAttribute('x', f1(bx)); nm.setAttribute('y', f1(by - 44)); nm.style.display = lt < ga ? '' : 'none'; }
          // red dashed ring where it was
          let rg = '';
          if (lt >= ga) { const p = prog(lt, ga, 0.6), rr = 70 * (1 + 0.15 * gk);
            for (let k = 0; k < 12; k++) { const a0 = k / 12 * Math.PI * 2 + lt * 0.3, a1 = a0 + 0.3 * p; rg += inkPath([[bx + Math.cos(a0) * rr, by + Math.sin(a0) * rr], [bx + Math.cos((a0 + a1) / 2) * rr, by + Math.sin((a0 + a1) / 2) * rr], [bx + Math.cos(a1) * rr, by + Math.sin(a1) * rr]], { w: 7, seed: sd + 160 + k, t, amp: 0.6 }) + ' '; } }
          ring.setAttribute('d', rg);
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ ef_wreck
  SH.ef_wreck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 157;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const BED = (P.bed ?? 0.8) * H, SURF = (P.surface ?? 0.12) * H;
      const rays = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.14 });
      const silt = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.6 });
      const bowF = inkEl(cam, INK.red), bowH = inkEl(cam, INK.paperLight), bowR = inkEl(cam), bowW = inkEl(cam, INK.ink);
      const sternF = inkEl(cam, INK.red), sternH = inkEl(cam, INK.paperLight), sternR = inkEl(cam);
      const debris = inkEl(cam, INK.ink), plates = inkEl(cam);
      const bedF = inkEl(cam, INK.paperDark), bedR = inkEl(cam), bedH = inkEl(cam, INK.inkSoft);
      const crack = inkEl(cam, INK.red), bubbles = inkEl(cam, INK.paperLight);
      const arrow = P.depth ? inkEl(root, INK.red) : null;
      const dT = P.depth ? el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-size': P.depth.size || 92, 'font-weight': 900, fill: INK.red, 'text-anchor': 'middle' }) : null;
      if (dT) dT.textContent = P.depth.text || '530 FT';
      const r = rng(sd + 5), DB = Array.from({ length: 60 }, () => [r(), r(), r()]), SL = Array.from({ length: 40 }, () => [r(), r(), r()]);
      const ex = extras(root, P, W, H, sd);
      // bow section (upright), bow to the left, broken end on the right. local: waterline (bed) y=0
      const S = (P.scale ?? 0.82) * W / 1080;
      const BOWX = (P.bow_x ?? 0.33) * W, STX = (P.stern_x ?? 0.76) * W;
      const BOW = [[-300, -40], [-330, -230], [-280, -236], [120, -214], [140, -180], [112, -150], [150, -110], [118, -70], [140, -30], [110, 0], [-290, 0]];
      const BH = [rect(-290, -236, -150, -300), rect(-270, -300, -170, -360)];
      const STERN = [[-150, -10], [-120, -60], [-150, -110], [-112, -150], [-140, -200], [230, -210], [290, -150], [280, -40], [230, 0], [-130, 0]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const spA = atOr(cues, P.split ?? 'split', null), spk = punch(lt, spA, 0.6);
          camOf(cam, lt, dur, W, H, [0.5, 0.62], P.zoom ?? 1.06, hit + spk);
          let rd = ''; for (let k = 0; k < 4; k++) { const x = W * (0.12 + k * 0.26) + Math.sin(t * 0.3 + k) * 30; rd += inkLoop([[x - 30, SURF], [x + 30, SURF], [x + 140, BED - 100], [x + 40, BED - 100]], { seed: sd + 1 + k, t, amp: 0.5, smooth: false }) + ' '; }
          rays.setAttribute('d', rd);
          let sl = ''; SL.forEach((q, i) => { const x = ((q[0] * W + t * (8 + 10 * q[2])) % W), y = SURF + 80 + q[1] * (BED - SURF - 100) + Math.sin(t + i) * 10; sl += inkDot(x, y, 3 + q[2] * 3, 3 + q[2] * 3, sd + 10 + i, t) + ' '; });
          silt.setAttribute('d', sl);
          const xf = (cx, pts, flip) => pts.map(([x, y]) => [cx + x * S, BED + 20 + (flip ? y : y) * S]);
          const bow = xf(BOWX, BOW), bh = BH.map(p => xf(BOWX, p));
          bowF.setAttribute('d', inkLoop(bow, { seed: sd + 50, t, amp: 1, smooth: false }));
          bowH.setAttribute('d', bh.map((p, i) => inkLoop(p, { seed: sd + 51 + i, t, smooth: false })).join(' '));
          bowR.setAttribute('d', inkPath(bow, { w: 7, seed: sd + 53, t, closed: true, smooth: false }) + ' ' + bh.map((p, i) => inkPath(p, { w: 6, seed: sd + 54 + i, t, closed: true, smooth: false })).join(' ') +
            ' ' + inkPath(xf(BOWX, [[-220, -360], [-220, -430]]), { w: 5, seed: sd + 57, t }) + ' ' + inkPath(xf(BOWX, [[-290, -150], [110, -150]]), { w: 4, seed: sd + 58, t, amp: 1.2 }) +
            ' ' + [-180, -80, 20].map((x, k) => inkPath(xf(BOWX, [[x, -226], [x, -10]]), { w: 3, seed: sd + 120 + k, t, amp: 1 })).join(' ') +
            ' ' + inkPath(xf(BOWX, [[-300, -120], [-286, -100], [-300, -80]]), { w: 6, seed: sd + 125, t, smooth: false }));
          let wd = ''; for (let i = 0; i < 4; i++) wd += inkLoop(xf(BOWX, rect(-262 + i * 24, -345, -248 + i * 24, -320)), { seed: sd + 60 + i, t, smooth: false }) + ' ';
          for (let i = 0; i < 6; i++) wd += inkDot(...xf(BOWX, [[-240 + i * 60, -190]])[0], 7 * S, 7 * S, sd + 64 + i, t) + ' ';
          bowW.setAttribute('d', wd);
          const st = xf(STX, STERN);
          sternF.setAttribute('d', inkLoop(st, { seed: sd + 70, t, amp: 1, smooth: false }));
          // upturned stern: keel up with rudder + propeller sticking up
          const rud = xf(STX, [[250, -210], [262, -300], [300, -300], [290, -200]]);
          let shd = '';   // portholes on the upturned stern house (now under the hull) + hatch stubs on the bow deck
          for (let i = 0; i < 5; i++) shd += inkDot(...xf(STX, [[-60 + i * 55, -40]])[0], 7 * S, 7 * S, sd + 230 + i, t) + ' ';
          for (let i = 0; i < 4; i++) shd += inkLoop(xf(BOWX, rect(-130 + i * 60, -232, -90 + i * 60, -222)), { seed: sd + 240 + i, t, smooth: false }) + ' ';
          sternH.setAttribute('d', shd);
          const pa = t * 0.15;
          sternR.setAttribute('d', inkPath(st, { w: 7, seed: sd + 71, t, closed: true, smooth: false }) + ' ' + inkPath(rud, { w: 6, seed: sd + 72, t, closed: true, smooth: false }) +
            ' ' + inkPath(xf(STX, [[200, -210], [200, -250]]), { w: 6, seed: sd + 73, t }) +
            ' ' + [0, 1, 2].map(k => { const a = pa + k * 2.09; return inkPath(xf(STX, [[200, -250], [200 + Math.cos(a) * 50, -250 + Math.sin(a) * 16]]), { w: 9, seed: sd + 74 + k, t }); }).join(' ') +
            ' ' + inkPath(xf(STX, [[-120, -100], [270, -100]]), { w: 4, seed: sd + 78, t, amp: 1.2 }) + ' ' + inkPath(xf(STX, [[-120, -160], [260, -170]]), { w: 4, seed: sd + 79, t, amp: 1.2 }) +
            ' ' + [-40, 60, 160].map((x, k) => inkPath(xf(STX, [[x, -205], [x, -5]]), { w: 3, seed: sd + 250 + k, t, amp: 1 })).join(' ') +
            ' ' + [[-150, -40], [-130, -90], [-150, -150]].map(([x, y], k) => inkPath(xf(STX, [[x, y], [x - 50, y - 18 + k * 10], [x - 80, y + 6]]), { w: 5, seed: sd + 255 + k, t, smooth: false })).join(' ') +
            ' ' + [[140, -60], [150, -130], [130, -190]].map(([x, y], k) => inkPath(xf(BOWX, [[x, y], [x + 50, y - 14 + k * 8], [x + 76, y + 8]]), { w: 5, seed: sd + 260 + k, t, smooth: false })).join(' ') +
            ' ' + inkPath(xf(BOWX, [[-300, 4], [-200, -30], [-60, -14], [60, -30], [150, 6]]), { w: 9, seed: sd + 265, t }) + ' ' + inkPath(xf(STX, [[-150, 4], [0, -26], [150, -18], [290, 6]]), { w: 9, seed: sd + 266, t }));
          // debris field + torn plates between the halves
          let dd = ''; DB.forEach((q, i) => { const x = lerp(BOWX + 120 * S, STX - 150 * S, q[0]), y = BED + 10 + q[1] * 30; dd += inkDot(x, y, 5 + q[2] * 6, 4 + q[2] * 4, sd + 90 + i, t) + ' '; });
          debris.setAttribute('d', dd);
          plates.setAttribute('d', inkPath([[BOWX + 170 * S, BED + 10], [BOWX + 200 * S, BED - 50 * S], [BOWX + 240 * S, BED - 20 * S]], { w: 6, seed: sd + 160, t, smooth: false }) + ' ' +
            inkPath([[STX - 260 * S, BED + 14], [STX - 230 * S, BED - 40 * S], [STX - 200 * S, BED - 30 * S]], { w: 6, seed: sd + 161, t, smooth: false }));
          // lake bed
          const bp = []; for (let x = -40; x <= W + 40; x += 60) bp.push([x, BED + 20 + Math.sin(x * 0.011) * 14]);
          bedF.setAttribute('d', inkLoop(bp.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 170, t, smooth: false }));
          bedR.setAttribute('d', inkPath(bp, { w: 7, seed: sd + 171, t }));
          let hd = ''; for (let i = 0; i < 26; i++) { const x = (i * 97) % W, y = BED + 70 + (i % 5) * 60; hd += inkPath([[x, y], [x + 60, y + 6]], { w: 4, seed: sd + 180 + i, t }) + ' '; }
          DB.forEach((q, i) => { const x = q[2] * W + (i % 2) * 37, y = BED + 90 + q[0] * (H - BED - 110); hd += inkDot(x, y, 6 + q[1] * 9, 5 + q[1] * 6, sd + 300 + i, t) + ' '; });
          for (let k = 0; k < 4; k++) { const x = W * (0.12 + k * 0.24), y = BED + 160 + (k % 2) * 140; hd += inkPath([[x, y], [x + 40, y - 34], [x + 90, y - 8], [x + 120, y - 40]], { w: 6, seed: sd + 380 + k, t, smooth: false }) + ' '; }
          bedH.setAttribute('d', hd);
          // broken-end crack marks
          let cr = '';
          if (spA != null && lt >= spA) { const p = prog(lt, spA, 0.4);
            [[BOWX + 150 * S, BED - 120 * S], [STX - 160 * S, BED - 110 * S]].forEach(([x, y], j) => {
              for (let k = 0; k < 3; k++) { const a = -0.6 + k * 0.6 + (j ? Math.PI : 0); cr += inkPath([[x, y], [x + Math.cos(a) * 60 * p, y + Math.sin(a) * 60 * p], [x + Math.cos(a + 0.4) * 110 * p, y + Math.sin(a + 0.4) * 110 * p]], { w: 7, seed: sd + 190 + j * 3 + k, t, smooth: false }) + ' '; } }); }
          crack.setAttribute('d', cr);
          let bb = ''; for (let i = 0; i < 8; i++) { const u = (t * 0.25 + i / 8) % 1; bb += inkCircle(BOWX - 200 * S + (i % 2) * 30 + Math.sin(u * 8 + i) * 12, BED - 400 * S - u * (BED - SURF - 400 * S), 6 + (i % 3) * 3, sd + 200 + i, t, { w: 3 }) + ' '; }
          bubbles.setAttribute('d', bb);
          if (arrow) {
            const da = atOr(cues, P.depth.at, 0.3), dp = prog(lt, da, 0.9), x = (P.depth.x ?? 0.9) * W, y0 = SURF + 20, y1 = lerp(y0, BED - 10, dp);
            arrow.setAttribute('d', dp > 0.01 ? inkPath([[x, y0], [x, y1]], { w: 8, seed: sd + 210, t }) + ' ' + inkPath([[x - 26, y0 + 30], [x, y0], [x + 26, y0 + 30]], { w: 7, seed: sd + 211, t, smooth: false }) +
              ' ' + inkPath([[x - 26, y1 - 30], [x, y1], [x + 26, y1 - 30]], { w: 7, seed: sd + 212, t, smooth: false }) : '');
            const sc = spring(lt, da + 0.4, 0.6) * (1 + 0.1 * punch(lt, da + 0.4, 0.6)), b = boil(sd + 213, t, 1.2);
            dT.setAttribute('transform', `translate(${f1(x - 10 + b[0] - (P.depth.dx ?? 190))} ${f1((y0 + BED) / 2 + b[1])}) rotate(-4) scale(${Math.max(0.01, sc).toFixed(3)})`);
          }
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ ef_shore
  SH.ef_shore = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 389;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const SEA = (P.sea ?? 0.56) * H, TOP = (P.top ?? 0.4) * H, LX = (P.lx ?? 0.8) * W, TS = P.tower_scale ?? 1.25;
      const beam = inkEl(cam, INK.gold, { 'fill-opacity': 0.42 });
      const waves = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.8 }), glint = inkEl(cam, INK.gold);
      const cliffF = inkEl(cam, INK.paperDark), cliffR = inkEl(cam), cliffH = inkEl(cam, INK.inkSoft);
      const towF = inkEl(cam, INK.paperLight), towR = inkEl(cam), lampF = inkEl(cam, INK.gold), houseF = inkEl(cam, INK.paperLight), houseR = inkEl(cam), houseW = inkEl(cam, INK.gold);
      const ledgeF = inkEl(cam, INK.paperDark), ledgeR = inkEl(cam), ledgeH = inkEl(cam, INK.inkSoft), foam = inkEl(cam, INK.paperLight);
      const ex = extras(cam, P, W, H, sd);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, lt, dur, W, H, [0.5, 0.5], P.zoom ?? 1.05, hit);
          const ly = TOP - 265 * TS, lx = LX;
          // beam: swings slowly across the lake, brightest when pointing at the viewer (narrow -> wide)
          const ph = Math.sin(t * 0.9), spread = 0.07 + 0.05 * (1 - Math.abs(ph)), a = Math.PI + 0.12 + ph * 0.28;
          const len = W * 1.6;
          beam.setAttribute('d', inkLoop([[lx, ly], [lx + Math.cos(a - spread) * len, ly + Math.sin(a - spread) * len], [lx + Math.cos(a + spread) * len, ly + Math.sin(a + spread) * len]], { seed: sd + 1, t, amp: 0.5, smooth: false }));
          let wd = ''; for (let k = 0; k < 16; k++) { const y = SEA + 20 + (k % 8) * 48 + Math.floor(k / 8) * 22, x = ((k * 173 + t * (30 + (k % 3) * 12)) % (W + 300)) - 150, L = 60 + (k % 4) * 30;
            wd += inkPath([[x, y], [x + L * 0.5, y - 8 - 4 * Math.sin(t * 2 + k)], [x + L, y]], { w: 4 + (k % 8) * 0.5, seed: sd + 10 + k, t }) + ' '; }
          waves.setAttribute('d', wd);
          // glints where the beam crosses the water
          let gd = ''; for (let k = 0; k < 6; k++) { const yy = SEA + 40 + k * 50, dx = (yy - ly) / Math.tan(a) ; const x = lx + dx + Math.sin(t * 3 + k) * 20; if (x > -20 && x < W) gd += inkPath([[x - 40, yy], [x + 40, yy - 3]], { w: 5, seed: sd + 30 + k, t }) + ' '; }
          glint.setAttribute('d', gd);
          // cliff (right)
          const cl = [[W * 0.5, H * 0.8], [W * 0.56, SEA + 30], [W * 0.6, TOP + 160], [W * 0.64, TOP + 40], [W * 0.68, TOP], [W + 40, TOP - 10], [W + 40, H * 0.8]];
          cliffF.setAttribute('d', inkLoop(cl, { seed: sd + 40, t, amp: 1.2, smooth: false }));
          cliffR.setAttribute('d', inkPath(cl.slice(0, 6), { w: 7, seed: sd + 41, t, amp: 1.4, smooth: false }));
          let ch = ''; for (let k = 0; k < 14; k++) { const y = TOP + 40 + k * 46, x = W * (0.66 + (k % 4) * 0.08) - (y > SEA ? 30 : 0); ch += inkPath([[x, y], [x + 50, y + 24]], { w: 4, seed: sd + 50 + k, t }) + ' '; }
          cliffH.setAttribute('d', ch);
          // lighthouse: octagonal tower, gallery, lantern, dome + keeper's house
          const tw = 46 * TS, tb = 58 * TS, th = 230 * TS;
          const tower = [[lx - tb, TOP], [lx - tw, TOP - th], [lx + tw, TOP - th], [lx + tb, TOP]];
          const lan = rect(lx - 40 * TS, TOP - th - 70 * TS, lx + 40 * TS, TOP - th);
          towF.setAttribute('d', inkLoop(tower, { seed: sd + 60, t, smooth: false }));
          const pulse = 0.75 + 0.25 * Math.sin(t * 5.8);
          lampF.setAttribute('d', inkLoop(lan, { seed: sd + 61, t, smooth: false }) + ' ' + inkDot(lx, ly, 26 * pulse + 8, 26 * pulse + 8, sd + 62, t));
          towR.setAttribute('d', inkPath(tower, { w: 6, seed: sd + 63, t, closed: true, smooth: false }) + ' ' + inkPath(lan, { w: 6, seed: sd + 64, t, closed: true, smooth: false }) +
            ' ' + inkPath([[lx - 64 * TS, TOP - th], [lx + 64 * TS, TOP - th]], { w: 8, seed: sd + 65, t }) + ' ' + inkPath([[lx - 46 * TS, TOP - th - 70 * TS], [lx, TOP - th - 112 * TS], [lx + 46 * TS, TOP - th - 70 * TS]], { w: 7, seed: sd + 66, t }) +
            ' ' + inkPath([[lx, TOP - th - 112 * TS], [lx, TOP - th - 136 * TS]], { w: 5, seed: sd + 67, t }) + ' ' + inkPath([[lx - 16 * TS, TOP - th - 40 * TS], [lx + 16 * TS, TOP - th - 40 * TS]], { w: 4, seed: sd + 68, t }) +
            ' ' + inkPath([[lx - tw + 6, TOP - th * 0.55], [lx + tw - 6, TOP - th * 0.55]], { w: 4, seed: sd + 69, t }));
          const hs = [[lx - 220, TOP], [lx - 220, TOP - 90], [lx - 170, TOP - 140], [lx - 120, TOP - 90], [lx - 120, TOP]];
          houseF.setAttribute('d', inkLoop(hs, { seed: sd + 70, t, smooth: false }));
          houseR.setAttribute('d', inkPath(hs, { w: 6, seed: sd + 71, t, closed: true, smooth: false }));
          houseW.setAttribute('d', inkLoop(rect(lx - 188, TOP - 80, lx - 152, TOP - 44), { seed: sd + 72, t, smooth: false }));
          // near ledge (bottom), with surf at its edge
          const lg = [[-40, H * 0.79], [W * 0.2, H * 0.77], [W * 0.46, H * 0.785], [W * 0.66, H * 0.8], [W + 40, H * 0.82], [W + 40, H + 40], [-40, H + 40]];
          ledgeF.setAttribute('d', inkLoop(lg, { seed: sd + 80, t, amp: 1, smooth: false }));
          ledgeR.setAttribute('d', inkPath(lg.slice(0, 5), { w: 8, seed: sd + 81, t, smooth: false }));
          let lh = ''; for (let k = 0; k < 16; k++) { const x = (k * 131) % W, y = H * 0.83 + (k % 4) * 60; lh += inkPath([[x, y], [x + 70, y + 10]], { w: 4, seed: sd + 90 + k, t }) + ' '; }
          ledgeH.setAttribute('d', lh);
          let fd = ''; for (let k = 0; k < 8; k++) { const u = (t * 0.7 + k / 8) % 1, x = W * (0.05 + k * 0.12), y = H * 0.775 - 30 * Math.sin(u * Math.PI); fd += inkDot(x, y, 10 * (1 - u) + 4, 8 * (1 - u) + 3, sd + 110 + k, t) + ' '; }
          foam.setAttribute('d', fd);
          ex.update(lt, t, cues);
        },
      };
    },
  };
})();
