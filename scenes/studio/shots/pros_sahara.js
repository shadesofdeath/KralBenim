// pros_sahara: shots for the Stickstory Short "Mauro Prosperi" (2026-11-05): in 1994 an Italian runner in the
// Marathon des Sables (Morocco) lost the trail in a sandstorm, drank his own urine, sheltered in an empty desert shrine
// and ate the bats living in it raw; after nine days a nomad girl found him in Algeria, ~180 miles off course; later he
// ran the race again. Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at
// 8 Hz via _ink.js, everything a pure function of (seed, lt); no Math.random. Parametric: any "lost in the desert" story.
// Uses lh__lib.js (LH.kasif, LH.label).
//
// Common: K = Kaşif {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]}
//   L = label {text, x, y, at, size, color: ink|red|gold|blue, font: hand|serif, card, rot, underline}
//   man = the runner {x, scale, face} (hatless cast: desert head-wrap, short beard, backpack)
//   gy: ground line 0..1 H; front: top of the foreground dune 0..1 H
//
// SHOTS.pros_desert — open dunes under the sun. P: {mode, gy, front, labels, kasif: K | false, man}
//   "hook":  a big bat flaps over the dunes in front of a small domed shrine, more bats circle the dome (cue "hit")
//   "race":  a line of runners with backpacks crosses a dune ridge between race flags; the man leads
//   "girl":  a nomad girl with goats by two palms; the thin man staggers in from the left; cue "found": she turns + waves
//   "again": a start banner between two poles, runners under it; the man runs through with his arms up (cue "hit")
//   "end":   Kaşif waves / points (K.seq); the runner jogs along the ridge behind him
// SHOTS.pros_storm — a sandstorm (use the "storm" set for the dark sky): a wall of sand billows in from the right,
//   streaks fly, race flags bend and fall; the man walks into the wind; his footprint trail behind him fades at cue
//   "gone". P: {gy, front, man, labels}
// SHOTS.pros_bottle — the man under a huge sun. mode "empty": he holds his bottle upside down over his face, the last
//   drop falls (cue "out"), heat shimmer; mode "drink": he drinks from the bottle (gold liquid), Kaşif recoils (K).
//   P: {mode, gy, front, man, kasif, labels}
// SHOTS.pros_shrine — mode "find": night; a white domed shrine on a dune, the man walks up to the door; from cue
//   "bats" bats pour out of the dome window and circle it. mode "eat": inside the shrine (use the "interior" set):
//   bats hang from a wooden beam, the man sits against the wall holding one up (cue "raw": one fewer on the beam),
//   scratched tally marks count days on the wall. P: {mode, gy, front, man, labels, tally}
// SHOTS.pros_map — a full-frame old map of the desert border: Morocco left, Algeria right, a dashed border, the race
//   route with camp dots; from cue "lost" a red wandering track leaves the route, crosses the border and ends at a
//   red X (cue "x"); P: {labels}
// cues: hit (punch) + the names above + labels "at".
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const f3 = v => Math.round(v * 1000) / 1000;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const blank = (...e) => e.forEach(x => x.setAttribute('d', ''));
  const SAND = () => mix(INK.paperLight, INK.gold, 0.42);
  const SAND_M = () => mix(INK.gold, INK.stain, 0.35);
  const SAND_D = () => mix(INK.stain, INK.ink, 0.22);
  const WALL = () => mix(INK.paperLight, INK.stain, 0.1);
  const WALL_S = () => mix(INK.stain, INK.paperDark, 0.35);
  const PACK = () => mix(INK.blue, INK.ink, 0.15);
  const PALM = () => mix(INK.green, INK.ink, 0.35);
  const BAT = () => mix(INK.ink, INK.inkSoft, 0.15);
  const labels = (parent, LS, W, H) => (LS || []).map(o => window.LH.label(el(parent, 'g'), o, W, H));
  const prof = (W, y, amp, f, ph, step = 40) => { const P = []; for (let x = -60; x <= W + 60; x += step) P.push([x, y - amp * (0.6 * Math.sin(x * f + ph) + 0.4 * Math.sin(x * f * 2.3 + ph * 1.7))]); return P; };

  // ------------------------------------------------------------------ foreground dune down to the frame bottom
  function duneFront(parent, sd) {
    const back = inkEl(parent, SAND_M()), backR = inkEl(parent), fill = inkEl(parent, SAND()), shade = inkEl(parent, mix(SAND_M(), INK.paperLight, 0.3)), rip = inkEl(parent, SAND_D()), edge = inkEl(parent), stones = inkEl(parent, SAND_D()), scrub = inkEl(parent, mix(INK.green, INK.ink, 0.3));
    return {
      update(t, W, H, top, o = {}) {
        const u = W / 1080, ph = o.ph ?? sd * 0.37;
        const P0 = prof(W, top - 30 * u, 26 * u, 0.004, ph + 2);
        back.setAttribute('d', inkLoop(P0.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd, t, amp: 0.8 }));
        backR.setAttribute('d', inkPath(P0, { w: 4, seed: sd + 1, t }));
        const P1 = prof(W, top + 70 * u, 46 * u, 0.0035, ph);
        fill.setAttribute('d', inkLoop(P1.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd + 2, t, amp: 0.8 }));
        // the shadowed slip face of the near dune
        const crest = P1.reduce((a, p) => (p[1] < a[1] ? p : a), P1[0]);
        const SF = [crest, [crest[0] + 260 * u, crest[1] + 120 * u], [crest[0] + 520 * u, H + 60], [crest[0] + 60 * u, H + 60], [crest[0] - 40 * u, crest[1] + 200 * u]];
        shade.setAttribute('d', inkLoop(SF, { seed: sd + 3, t, amp: 0.8 }));
        const R = [];
        for (let i = 0; i < 11; i++) {
          const y = top + 150 * u + i * (H - top - 150 * u) / 11, amp = 8 * u, w = 4 + i * 0.35;
          const pts = []; for (let x = -30; x <= W + 30; x += 60) pts.push([x, y + amp * Math.sin(x * 0.012 + i * 1.3 + ph) + 12 * u * Math.sin(x * 0.003 + i)]);
          R.push(inkPath(pts, { w, seed: sd + 20 + i, t, amp: 0.8, taper: 0.6 }));
        }
        rip.setAttribute('d', R.join(' '));
        edge.setAttribute('d', inkPath(P1, { w: 6, seed: sd + 4, t }));
        const S = [], SC = [];
        for (let i = 0; i < 6; i++) { const x = hn(sd + 5, i) * W, y = top + 260 * u + hn(sd + 6, i) * (H - top - 380 * u), r = (16 + 22 * hn(sd + 7, i)) * u; S.push(inkLoop(inkEllipsePts(x, y, r * 1.5, r, sd + 40 + i, 9, 0, 0.18), { seed: sd + 40 + i, t, amp: 0.8 })); }
        stones.setAttribute('d', S.join(' '));
        (o.scrub ?? [0.08, 0.9]).forEach((q, i) => {
          const x = q * W, y = top + 160 * u + i * 40 * u, sw = Math.sin(t * 1.8 + i) * 5 * u * (o.wind ?? 1);
          for (let j = 0; j < 7; j++) { const a = -Math.PI / 2 + (j - 3) * 0.28; SC.push(inkPath([[x, y], [x + Math.cos(a) * 60 * u + sw, y + Math.sin(a) * 90 * u], [x + Math.cos(a) * 100 * u + sw * 1.6, y + Math.sin(a) * 140 * u]], { w: 5, seed: sd + 60 + i * 10 + j, t, taper: 0.7 })); }
        });
        scrub.setAttribute('d', SC.join(' '));
      },
    };
  }

  // ------------------------------------------------------------------ dune ridges in the middle distance
  function duneMid(parent, sd) {
    const a = inkEl(parent, mix(SAND(), INK.paperLight, 0.35)), aR = inkEl(parent, SAND_M()), b = inkEl(parent, mix(SAND(), INK.gold, 0.15)), bR = inkEl(parent);
    return {
      update(t, W, H, gy, o = {}) {
        const u = W / 1080;
        const PA = prof(W, gy - 120 * u, 40 * u, 0.005, sd * 0.3 + 1, 30);
        a.setAttribute('d', inkLoop(PA.concat([[W + 60, gy + 40], [-60, gy + 40]]), { seed: sd, t, amp: 0.6 }));
        aR.setAttribute('d', inkPath(PA, { w: 3, seed: sd + 1, t }));
        const PB = prof(W, gy - 20 * u, 30 * u, 0.006, sd * 0.3 + 4, 30);
        b.setAttribute('d', inkLoop(PB.concat([[W + 60, gy + 300], [-60, gy + 300]]), { seed: sd + 2, t, amp: 0.6 }));
        bR.setAttribute('d', inkPath(PB, { w: 4.5, seed: sd + 3, t }));
        return { ridge: x => { let best = PB[0]; for (const p of PB) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p; return best[1]; } };
      },
    };
  }

  // ------------------------------------------------------------------ a bat: flying (wings spread) or hanging
  function bat(parent, sd) {
    const wing = inkEl(parent, BAT()), wingR = inkEl(parent), body = inkEl(parent, mix(INK.ink, INK.stain, 0.25)), eyes = inkEl(parent, INK.paperLight), bones = inkEl(parent, mix(INK.inkSoft, INK.paperLight, 0.3));
    return {
      update(t, x, y, s, o = {}) {
        if (o.k != null && o.k <= 0.01) { blank(wing, wingR, body, eyes, bones); return; }
        const k = o.k ?? 1, S = s * k;
        if (o.hang) {
          const sw = Math.sin(t * 1.6 + sd) * 4 * S, P = [];
          const pts = [[0, 0], [22, 18], [30, 60], [24, 110], [0, 130], [-24, 110], [-30, 60], [-22, 18]].map(q => [x + q[0] * S + sw * q[1] / 130, y + q[1] * S]);
          body.setAttribute('d', inkLoop(pts, { seed: sd, t, amp: 0.8 }));
          const hd = [x + sw, y + 130 * S];
          P.push(inkPath([[hd[0] - 14 * S, hd[1] - 6 * S], [hd[0] - 22 * S, hd[1] + 22 * S]], { w: 9 * S, seed: sd + 1, t, taper: 0.8 }), inkPath([[hd[0] + 14 * S, hd[1] - 6 * S], [hd[0] + 22 * S, hd[1] + 22 * S]], { w: 9 * S, seed: sd + 2, t, taper: 0.8 }));
          wing.setAttribute('d', P.join(' '));
          wingR.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 3, t, closed: true }) + ' ' + inkPath([[x - 10 * S, y], [x - 4 * S, y - 16 * S]], { w: 5, seed: sd + 4, t }) + ' ' + inkPath([[x + 10 * S, y], [x + 4 * S, y - 16 * S]], { w: 5, seed: sd + 5, t }));
          bones.setAttribute('d', inkPath([[x - 18 * S + sw * 0.3, y + 40 * S], [x - 6 * S + sw * 0.6, y + 100 * S]], { w: 3, seed: sd + 6, t }) + ' ' + inkPath([[x + 18 * S + sw * 0.3, y + 40 * S], [x + 6 * S + sw * 0.6, y + 100 * S]], { w: 3, seed: sd + 7, t }));
          eyes.setAttribute('d', inkDot(hd[0] - 8 * S, hd[1] + 2 * S, 3.5 * S, 3.5 * S, sd + 8, t) + ' ' + inkDot(hd[0] + 8 * S, hd[1] + 2 * S, 3.5 * S, 3.5 * S, sd + 9, t));
          return;
        }
        const fl = Math.sin((o.ph ?? t * 2.2) * Math.PI * 2), f = o.face ?? 1;
        const W = (side) => {
          const sg = side, up = fl * 70;
          const sh = [0, -10], wr = [sg * 120, -40 - up * 0.9], tip = [sg * 230, -10 - up * 1.4];
          const f1p = [sg * 200, 50 - up * 0.8], f2p = [sg * 130, 70 - up * 0.45], f3p = [sg * 60, 50 - up * 0.15];
          const sc1 = [sg * 205, 20 - up * 1.1], sc2 = [sg * 160, 52 - up * 0.6], sc3 = [sg * 95, 52 - up * 0.3];
          return { outline: [sh, wr, tip, sc1, f1p, sc2, f2p, sc3, f3p, [0, 40]], bones: [[sh, wr, tip], [wr, f1p], [wr, f2p], [wr, f3p]] };
        };
        const T = q => [x + q[0] * S * f, y + q[1] * S];
        const L = W(-1), R = W(1);
        wing.setAttribute('d', [L, R].map((w, i) => inkLoop(w.outline.map(T), { seed: sd + i, t, amp: 0.9, smooth: false })).join(' '));
        wingR.setAttribute('d', [L, R].map((w, i) => inkPath(w.outline.map(T), { w: 3.5, seed: sd + 2 + i, t, closed: true, smooth: false })).join(' '));
        bones.setAttribute('d', [L, R].map((w, i) => w.bones.map((b, j) => inkPath(b.map(T), { w: 2.6, seed: sd + 10 + i * 5 + j, t, smooth: false })).join(' ')).join(' '));
        const bd = [[0, -50], [22, -36], [26, 10], [16, 52], [0, 64], [-16, 52], [-26, 10], [-22, -36]].map(T);
        const ears = [[[-20, -40], [-24, -66], [-14, -72], [-6, -50]], [[20, -40], [24, -66], [14, -72], [6, -50]]].map((e, i) => inkLoop(e.map(T), { seed: sd + 30 + i, t, amp: 0.6, smooth: false }));
        body.setAttribute('d', inkLoop(bd, { seed: sd + 20, t, amp: 0.8 }) + ' ' + ears.join(' '));
        eyes.setAttribute('d', o.eyes === false ? '' : inkDot(...T([-9, -30]), 4.5 * S, 4.5 * S, sd + 40, t) + ' ' + inkDot(...T([9, -30]), 4.5 * S, 4.5 * S, sd + 41, t));
      },
    };
  }

  // ------------------------------------------------------------------ the shrine: whitewashed cube + dome
  function shrine(parent, sd) {
    const side = inkEl(parent, WALL_S()), front = inkEl(parent, WALL()), dome = inkEl(parent, WALL()), domeS = inkEl(parent, WALL_S()), door = inkEl(parent, mix(INK.ink, INK.stain, 0.25)), win = inkEl(parent, mix(INK.ink, INK.stain, 0.25)), lines = inkEl(parent), crack = inkEl(parent, INK.inkSoft), sand = inkEl(parent, SAND());
    return {
      update(t, cx, gy, s, o = {}) {
        const w = 380 * s, h = 270 * s, d = 70 * s, x0 = cx - w / 2, x1 = cx + w / 2, y0 = gy - h;
        const F = rect(x0, y0, x1, gy), SD = [[x1, y0], [x1 + d, y0 - d * 0.5], [x1 + d, gy - d * 0.5], [x1, gy]];
        front.setAttribute('d', inkLoop(F, { seed: sd, t, smooth: false, amp: 1 }));
        side.setAttribute('d', inkLoop(SD, { seed: sd + 1, t, smooth: false, amp: 1 }));
        const dc = [cx + d * 0.35, y0 - d * 0.15], dr = w * 0.36, DP = [];
        for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; DP.push([dc[0] + Math.cos(a) * dr, dc[1] + Math.sin(a) * dr * 1.05 - (i === 8 ? 14 * s : 0)]); }
        dome.setAttribute('d', inkLoop(DP.concat([[dc[0] + dr, dc[1] + 8 * s], [dc[0] - dr, dc[1] + 8 * s]]), { seed: sd + 2, t, amp: 0.8 }));
        const DS = DP.slice(10).concat([[dc[0] + dr, dc[1] + 8 * s], [dc[0] + dr * 0.35, dc[1] + 8 * s], [dc[0] + dr * 0.42, dc[1] - dr * 0.6]]);
        domeS.setAttribute('d', inkLoop(DS, { seed: sd + 3, t, amp: 0.8 }));
        const dw = 74 * s, dh = 140 * s, dx = cx - 40 * s, DR = [[dx - dw / 2, gy], [dx - dw / 2, gy - dh + dw / 2]];
        for (let i = 0; i <= 8; i++) { const a = Math.PI + i / 8 * Math.PI; DR.push([dx + Math.cos(a) * dw / 2, gy - dh + dw / 2 + Math.sin(a) * dw / 2]); }
        DR.push([dx + dw / 2, gy]);
        door.setAttribute('d', inkLoop(DR, { seed: sd + 4, t, amp: 0.6, smooth: false }));
        const wy = dc[1] - dr * 0.55, WN = [[dc[0] - 18 * s, wy + 20 * s], [dc[0] - 18 * s, wy], [dc[0], wy - 16 * s], [dc[0] + 18 * s, wy], [dc[0] + 18 * s, wy + 20 * s]];
        win.setAttribute('d', o.window === false ? '' : inkLoop(WN, { seed: sd + 5, t, amp: 0.5, smooth: false }));
        lines.setAttribute('d', [inkPath(F, { w: 5, seed: sd + 6, t, closed: true, smooth: false }), inkPath(SD, { w: 5, seed: sd + 7, t, closed: true, smooth: false }),
          inkPath(DP, { w: 5, seed: sd + 8, t }), inkPath(DR, { w: 4.5, seed: sd + 9, t, smooth: false }),
          inkPath([[x0 - 8 * s, y0], [x1 + 8 * s, y0]], { w: 7, seed: sd + 10, t }), inkPath([[dc[0], dc[1] - dr * 1.05 - 14 * s], [dc[0], dc[1] - dr * 1.05 - 54 * s]], { w: 5, seed: sd + 11, t }),
          inkDot(dc[0], dc[1] - dr * 1.05 - 58 * s, 8 * s, 8 * s, sd + 12, t)].join(' '));
        crack.setAttribute('d', [inkPath([[x0 + w * 0.7, y0 + 10 * s], [x0 + w * 0.74, y0 + h * 0.25], [x0 + w * 0.68, y0 + h * 0.4]], { w: 3, seed: sd + 13, t, smooth: false }), inkPath([[x0 + w * 0.12, gy - h * 0.3], [x0 + w * 0.2, gy - h * 0.38]], { w: 3, seed: sd + 14, t, smooth: false })].join(' '));
        const SP = [[x0 - 80 * s, gy + 6 * s], [x0 + w * 0.2, gy - 34 * s], [x0 + w * 0.5, gy - 8 * s], [x1 + d + 60 * s, gy - d * 0.4], [x1 + d + 140 * s, gy + 10 * s]];
        sand.setAttribute('d', o.sand === false ? '' : inkLoop(SP.concat([[x1 + d + 140 * s, gy + 30 * s], [x0 - 80 * s, gy + 30 * s]]), { seed: sd + 15, t, amp: 0.8 }));
        return { door: [dx, gy - dh * 0.5], window: [dc[0], wy], top: [dc[0], dc[1] - dr] };
      },
    };
  }

  // ------------------------------------------------------------------ the runner (hatless cast) with a backpack
  function runner(parent, sd, o = {}) {
    const g = el(parent, 'g');
    const pack = inkEl(g, PACK()), packR = inkEl(g), strap = inkEl(g, mix(INK.ink, INK.blue, 0.3));
    const wrapOn = o.accessory === undefined;
    const rig = KASIF.create(el(g, 'g'), { scale: o.scale ?? 1, hat: false, accessory: wrapOn ? null : o.accessory, beard: o.beard ?? 'short', seed: sd });
    const wrapT = inkEl(g, mix(INK.paperLight, INK.stain, 0.18)), wrap = inkEl(g, mix(INK.paperLight, INK.stain, 0.08)), wrapR = inkEl(g);
    const bib = inkEl(g, INK.paperLight), bibR = inkEl(g), item = inkEl(g, o.itemFill || INK.paperLight), itemL = inkEl(g, INK.gold), itemR = inkEl(g);
    const sc = o.scale ?? 1;
    return {
      g,
      update(t, pose, op, ex = {}) {
        const r = rig.update(t, pose, op), f = op.face ?? 1, W = q => [op.x + f * sc * q[0], op.y + sc * q[1]];
        const hip = W(r.hip), hd = W(r.head), sh = [lerp(hip[0], hd[0], 0.72), lerp(hip[1], hd[1], 0.72)];
        if (ex.pack !== false) {
          const bx = lerp(hip[0], sh[0], 0.55) - f * 46 * sc, by = lerp(hip[1], sh[1], 0.55);
          const PK = [[bx - 34 * sc, by - 62 * sc], [bx + 34 * sc, by - 66 * sc], [bx + 40 * sc, by + 58 * sc], [bx - 38 * sc, by + 62 * sc]];
          pack.setAttribute('d', inkLoop(PK, { seed: sd + 1, t, amp: 0.8 }));
          packR.setAttribute('d', inkPath(PK, { w: 5, seed: sd + 2, t, closed: true }) + ' ' + inkPath([[bx - 30 * sc, by - 10 * sc], [bx + 34 * sc, by - 12 * sc]], { w: 3.5, seed: sd + 3, t }));
          strap.setAttribute('d', inkPath([[bx + f * 20 * sc, by - 60 * sc], [sh[0] + f * 10 * sc, sh[1] + 10 * sc], [lerp(hip[0], sh[0], 0.4) + f * 16 * sc, lerp(hip[1], sh[1], 0.4)]], { w: 5, seed: sd + 4, t }));
        } else blank(pack, packR, strap);
        if (ex.bib !== false) {
          const cx = lerp(hip[0], sh[0], 0.45) + f * 6 * sc, cy = lerp(hip[1], sh[1], 0.45), bw = 30 * sc, bh = 26 * sc;
          const B = [[cx - bw, cy - bh], [cx + bw, cy - bh - 2 * sc], [cx + bw, cy + bh], [cx - bw, cy + bh]];
          bib.setAttribute('d', inkLoop(B, { seed: sd + 5, t, smooth: false, amp: 0.6 }));
          bibR.setAttribute('d', inkPath(B, { w: 3.5, seed: sd + 6, t, closed: true, smooth: false }) + ' ' + inkPath([[cx - bw * 0.5, cy], [cx + bw * 0.5, cy]], { w: 6 * sc, seed: sd + 7, t }));
        } else blank(bib, bibR);
        // a plastic bottle in one hand: ex.bottle = {hand: 0|1, rot (deg), fill 0..1, col}
        if (ex.bottle) {
          const B = ex.bottle, hw = W(r.hands[B.hand ?? 1]), a = (B.rot ?? 0) * Math.PI / 180, bw = 26 * sc * (B.s ?? 1), bh = 92 * sc * (B.s ?? 1);
          const R2 = q => [hw[0] + q[0] * Math.cos(a) - q[1] * Math.sin(a), hw[1] + q[0] * Math.sin(a) + q[1] * Math.cos(a)];
          const shape = [[-bw, bh * 0.5], [-bw, -bh * 0.3], [-bw * 0.4, -bh * 0.5], [-bw * 0.4, -bh * 0.62], [bw * 0.4, -bh * 0.62], [bw * 0.4, -bh * 0.5], [bw, -bh * 0.3], [bw, bh * 0.5]];
          item.setAttribute('d', inkLoop(shape.map(R2), { seed: sd + 8, t, smooth: false, amp: 0.6 }));
          const fl = clamp01(B.fill ?? 0);
          if (fl > 0.01) {
            itemL.setAttribute('fill', B.col || INK.blue);
            // liquid stays level: in world space it fills the lowest part of the (rotated) bottle; approximate by the bottle's base end
            const lv = bh * 0.5 - fl * bh * 0.85;
            itemL.setAttribute('d', inkLoop([[-bw + 4, bh * 0.5 - 4], [-bw + 4, lv], [bw - 4, lv], [bw - 4, bh * 0.5 - 4]].map(R2), { seed: sd + 9, t, smooth: false, amp: 0.5 }));
          } else itemL.setAttribute('d', '');
          itemR.setAttribute('d', inkPath(shape.map(R2), { w: 4.5, seed: sd + 10, t, closed: true, smooth: false }) + ' ' + inkPath([[-bw * 0.45, -bh * 0.68], [bw * 0.45, -bh * 0.68]].map(R2), { w: 9, seed: sd + 11, t }));
          r.bottleTop = R2([0, -bh * 0.68]); r.bottleMid = hw;
        } else blank(item, itemL, itemR);
        if (wrapOn) {   // plain pale desert head-wrap with a cloth tail down the back of the neck (no jewel)
          const tl = Math.atan2(r.head[0] - r.hip[0], -(r.head[1] - r.hip[1])) * 0.6;
          const Hh = (x, y) => { const c = Math.cos(tl), sn = Math.sin(tl); return W([r.head[0] + x * c - y * sn, r.head[1] + x * sn + y * c]); };
          const TP = [[-74, -26], [-82, -70], [-56, -118], [0, -138], [56, -118], [82, -70], [74, -26], [0, -40]].map(q => Hh(q[0], q[1]));
          const sw = Math.sin(t * 2.6 + sd) * 8;
          const TL = [[-50, -36], [-76, -22], [-86 + sw * 0.6, 34], [-96 + sw, 82], [-66 + sw * 0.5, 74], [-46, 8]].map(q => Hh(q[0], q[1]));
          wrapT.setAttribute('d', ''); void TL;
          wrap.setAttribute('d', inkLoop(TP, { seed: sd + 21, t, amp: 0.7 }));
          wrapR.setAttribute('d', [inkPath(TP, { w: 5, seed: sd + 22, t, closed: true }),
            inkPath([[-72, -60], [0, -80], [70, -64]].map(q => Hh(q[0], q[1])), { w: 3.5, seed: sd + 24, t }), inkPath([[-60, -98], [0, -112], [56, -100]].map(q => Hh(q[0], q[1])), { w: 3.5, seed: sd + 25, t })].join(' '));
        }
        r.W = W; r.headW = hd; r.hipW = hip;
        return r;
      },
    };
  }

  // a nomad girl: small hatless figure in a long blue dress with a head-scarf
  function girl(parent, sd, sc) {
    const g = el(parent, 'g');
    const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: false, accessory: null, seed: sd });
    const dress = inkEl(g, mix(INK.blue, INK.paperLight, 0.15)), dressR = inkEl(g), scarf = inkEl(g, mix(INK.blue, INK.ink, 0.35)), scarfR = inkEl(g);
    return {
      update(t, pose, op) {
        const r = rig.update(t, pose, op), f = op.face ?? 1, W = q => [op.x + f * sc * q[0], op.y + sc * q[1]];
        const hip = W(r.hip), hd = W(r.head), sh = [lerp(hip[0], hd[0], 0.7), lerp(hip[1], hd[1], 0.7)];
        const D = [[sh[0] - 36 * sc, sh[1]], [sh[0] + 36 * sc, sh[1]], [hip[0] + 70 * sc, op.y - 46 * sc], [hip[0] - 70 * sc, op.y - 46 * sc]];
        dress.setAttribute('d', inkLoop(D, { seed: sd + 1, t, amp: 0.8 }));
        dressR.setAttribute('d', inkPath(D, { w: 5, seed: sd + 2, t, closed: true }) + ' ' + inkPath([[hip[0] - 70 * sc, op.y - 80 * sc], [hip[0] + 70 * sc, op.y - 80 * sc]], { w: 4, seed: sd + 3, t }));
        const hr = 78 * sc, sw = Math.sin(t * 2.4) * 10 * sc, X = (a, b) => [hd[0] + f * a * hr, hd[1] + b * hr];
        const S = [X(0.45, -0.85), X(-0.1, -1.15), X(-0.85, -0.85), X(-1.12, -0.1), X(-1.0, 0.7), [hd[0] - f * hr * 1.4 + sw, hd[1] + hr * 1.5], X(-0.55, 0.55), X(-0.72, -0.2), X(-0.45, -0.7), X(0.2, -0.8)];
        scarf.setAttribute('d', inkLoop(S, { seed: sd + 4, t, amp: 0.8 }));
        scarfR.setAttribute('d', inkPath(S, { w: 4, seed: sd + 5, t, closed: true }));
        return r;
      },
    };
  }

  // a goat: side view, brown with a pale belly, curved horns, floppy ear, beard, tail up; grazes (head dips)
  function goat(parent, sd) {
    const body = inkEl(parent, mix(INK.stain, INK.red, 0.25)), belly = inkEl(parent, mix(INK.paperLight, INK.stain, 0.3)), horn = inkEl(parent, mix(INK.paperDark, INK.ink, 0.2)), lines = inkEl(parent);
    return {
      update(t, x, gy, s, f = 1, graze = 0) {
        const T = q => [x + q[0] * s * f, gy + q[1] * s];
        const dip = graze ? 0.5 + 0.5 * Math.sin(t * 1.4 + sd) : 0, ny = lerp(-190, -110, dip), nx = lerp(130, 150, dip);
        const bd = [[-90, -150], [-40, -172], [50, -172], [96, -152], [108, -104], [88, -66], [-76, -66], [-104, -104]];
        const nk = [[70, -160], [nx - 10, ny - 10], [nx + 20, ny + 10], [100, -120]];
        const hd = [[nx - 22, ny - 34], [nx + 26, ny - 30], [nx + 72, ny + 2], [nx + 74, ny + 24], [nx + 34, ny + 30], [nx - 18, ny + 12]];
        body.setAttribute('d', [bd, nk, hd].map((q, i) => inkLoop(q.map(T), { seed: sd + i, t, amp: 0.7 })).join(' '));
        belly.setAttribute('d', inkLoop([[-66, -92], [70, -92], [80, -70], [-66, -70]].map(T), { seed: sd + 4, t, amp: 0.6 }));
        horn.setAttribute('d', inkPath([[nx - 4, ny - 24], [nx - 24, ny - 62], [nx - 58, ny - 70], [nx - 70, ny - 50]].map(T), { w: 9 * Math.max(0.6, s), seed: sd + 5, t, taper: 0.8 }));
        const L = [];
        [[-78, 0], [-52, 0.5], [62, 0.25], [86, 0.75]].forEach(([lx, ph], i) => { const st = Math.sin(t * 2 + ph * 6.28 + sd) * 4 * graze; L.push(inkPath([T([lx, -70]), T([lx + st, -34]), T([lx + st * 1.2, 0])], { w: 8, seed: sd + 6 + i, t, taper: 0.1 }), inkDot(...T([lx + st * 1.2 + 4, -2]), 7 * s, 5 * s, sd + 12 + i, t)); });
        L.push(inkPath(bd.map(T), { w: 4.5, seed: sd + 20, t, closed: true }), inkPath(hd.map(T), { w: 4, seed: sd + 21, t, closed: true }));
        L.push(inkPath([[nx + 2, ny - 4], [nx - 22, ny + 12], [nx - 26, ny + 34]].map(T), { w: 8, seed: sd + 22, t, taper: 0.7 }));
        L.push(inkPath([[nx + 40, ny + 20], [nx + 38, ny + 48]].map(T), { w: 6, seed: sd + 23, t, taper: 0.8 }));
        L.push(inkPath([[-104, -140], [-122, -178], [-112, -186]].map(T), { w: 7, seed: sd + 24, t, taper: 0.7 }));
        L.push(inkDot(...T([nx + 18, ny - 6]), 4.5 * s, 4.5 * s, sd + 25, t));
        lines.setAttribute('d', L.join(' '));
      },
    };
  }

  // a palm tree
  function palm(parent, sd) {
    const trunk = inkEl(parent, mix(INK.stain, INK.ink, 0.3)), fr = inkEl(parent, PALM()), rim = inkEl(parent);
    return {
      update(t, x, gy, h, lean = 0.12) {
        const top = [x + h * lean, gy - h], mid = [x + h * lean * 0.3, gy - h * 0.5];
        trunk.setAttribute('d', inkPath([[x, gy], mid, top], { w: h * 0.05, seed: sd, t, taper: 0.35 }));
        const F = [], R = [];
        for (let i = 0; i < 7; i++) {
          const a = -Math.PI / 2 + (i - 3) * 0.48 + Math.sin(t * 1.3 + i) * 0.04, L = h * (0.42 + 0.06 * (i % 2));
          const tip = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * 0.55 + L * 0.35 * Math.abs(Math.cos(a))];
          const c = [top[0] + Math.cos(a) * L * 0.5, top[1] + Math.sin(a) * L * 0.5 - L * 0.06];
          F.push(inkPath([top, c, tip], { w: h * 0.07, seed: sd + 10 + i, t, taper: 0.9 }));
          for (let j = 1; j < 5; j++) { const p = [lerp(top[0], tip[0], j / 5), lerp(top[1], tip[1], j / 5) - L * 0.04]; R.push(inkPath([p, [p[0] + Math.cos(a + 1.2) * L * 0.12, p[1] + Math.sin(a + 1.2) * L * 0.12 + L * 0.06]], { w: 3, seed: sd + 40 + i * 5 + j, t })); }
        }
        fr.setAttribute('d', F.join(' '));
        rim.setAttribute('d', R.join(' ') + ' ' + [0.25, 0.45, 0.65, 0.85].map((q, i) => { const p = [lerp(x, top[0], q), lerp(gy, top[1], q)]; return inkPath([[p[0] - h * 0.03, p[1]], [p[0] + h * 0.03, p[1] - 4]], { w: 3, seed: sd + 80 + i, t }); }).join(' '));
      },
    };
  }

  // a race flag on a thin pole (bends in the wind)
  function flag(parent, sd) {
    const cloth = inkEl(parent, INK.red), lines = inkEl(parent);
    return {
      update(t, x, gy, h, wind = 0, fall = 0, dir = -1) {
        if (fall >= 1) { blank(cloth, lines); return; }
        const a = (wind * 0.25 + fall * 1.4) * dir, top = [x + Math.sin(a) * h, gy - Math.cos(a) * h];
        const fw = h * 0.42, wv = Math.sin(t * (6 + 10 * wind) + sd) * h * 0.05 * (1 + wind);
        const C = [top, [top[0] + dir * fw, top[1] + wv + h * 0.06], [top[0] + dir * fw * 0.9, top[1] + h * 0.2 + wv], [top[0] + Math.sin(a) * h * -0.25, top[1] + h * 0.24]];
        cloth.setAttribute('d', inkLoop(C, { seed: sd, t, amp: 0.8 }));
        lines.setAttribute('d', inkPath([[x, gy], top], { w: 5, seed: sd + 1, t }) + ' ' + inkPath(C, { w: 3.5, seed: sd + 2, t, closed: true }));
      },
    };
  }

  // the sun with rays
  function sunDisc(parent, sd) {
    const halo = inkEl(parent, mix(INK.gold, INK.paperLight, 0.45)), disc = inkEl(parent, mix(INK.gold, INK.red, 0.35)), rays = inkEl(parent, mix(INK.gold, INK.red, 0.3));
    return {
      update(t, x, y, r, pulse = 0) {
        halo.setAttribute('d', inkCircle(x, y, r * (1.35 + 0.04 * Math.sin(t * 2)), sd, t, { fill: true }));
        disc.setAttribute('d', inkCircle(x, y, r, sd + 1, t, { fill: true }));
        const R = [];
        for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * 0.15, r0 = r * 1.55, r1 = r * (1.9 + 0.12 * Math.sin(t * 3 + i) + 0.3 * pulse); R.push(inkPath([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 9, seed: sd + 2 + i, t })); }
        rays.setAttribute('d', R.join(' '));
      },
    };
  }

  // heat shimmer: wavy lines rising
  function shimmer(parent, sd) {
    const e = inkEl(parent, mix(INK.paperLight, INK.gold, 0.2));
    return {
      update(t, x0, x1, y, n = 6, u = 1) {
        const P = [];
        for (let i = 0; i < n; i++) {
          const ph = (t * 0.45 + hn(sd, i)) % 1, x = lerp(x0, x1, hn(sd + 1, i)), yy = y - ph * 260 * u, L = [];
          for (let j = 0; j <= 6; j++) L.push([x + Math.sin(j * 1.2 + t * 4 + i) * 10 * u, yy - j * 24 * u]);
          if (ph > 0.05 && ph < 0.9) P.push(inkPath(L, { w: 5 * Math.sin(ph * Math.PI) + 1, seed: sd + 10 + i, t, taper: 0.8 }));
        }
        e.setAttribute('d', P.join(' '));
      },
    };
  }

  // shock ticks round a head
  const ticks = (cx, cy, sc, sd, t) => [[-1, -0.9], [0, -1.2], [1, -0.9]].map(([u, v], i) => inkPath([[cx + u * 80 * sc, cy + v * 80 * sc], [cx + u * 115 * sc, cy + v * 112 * sc]], { w: 6 * sc, seed: sd + i, t, amp: 0.4 })).join(' ');
  // sweat drops
  const sweat = (cx, cy, sc, sd, t) => [0, 1].map(i => { const ph = (t * 0.9 + i * 0.5) % 1, x = cx + (i ? 60 : -64) * sc, y = cy - 30 * sc + ph * 70 * sc; return inkLoop([[x, y - 16 * sc], [x + 9 * sc, y + 4 * sc], [x, y + 12 * sc], [x - 9 * sc, y + 4 * sc]], { seed: sd + i, t, amp: 0.4 }); }).join(' ');

  // ------------------------------------------------------------------ SHOTS.pros_desert
  SH.pros_desert = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 321, u = W / 1080, mode = P.mode || 'hook';
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.7) * H;
      const root = el(svg, 'g');
      const sun = mode === 'girl' || mode === 'hook' ? null : sunDisc(el(root, 'g'), sd + 5);
      const mid = duneMid(el(root, 'g'), sd + 10);
      const sh = mode === 'hook' && P.shrine !== false ? shrine(el(root, 'g'), sd + 30) : null;
      const palms = mode === 'girl' ? [palm(el(root, 'g'), sd + 50), palm(el(root, 'g'), sd + 80)] : [];
      const smallBats = mode === 'hook' && P.flock !== false ? Array.from({ length: 7 }, (_, i) => bat(el(root, 'g'), sd + 100 + i * 50)) : [];
      const flags = mode === 'race' || mode === 'again' ? Array.from({ length: 4 }, (_, i) => flag(el(root, 'g'), sd + 500 + i * 10)) : [];
      const banner = mode === 'again' ? { cloth: inkEl(root, INK.paperLight), r: inkEl(root), tx: el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 84 * u, 'text-anchor': 'middle', fill: INK.red }) } : null;
      if (banner) banner.tx.textContent = (P.banner || 'START').toLocaleUpperCase('en-US');
      const goats = mode === 'girl' ? Array.from({ length: 3 }, (_, i) => goat(el(root, 'g'), sd + 600 + i * 20)) : [];
      const gl = mode === 'girl' ? girl(el(root, 'g'), sd + 700, 0.62 * u) : null;
      const others = mode === 'race' || mode === 'again' ? [0.62, 0.78, 0.92].map((s, i) => runner(el(root, 'g'), sd + 800 + i * 30, { scale: s * 0.62 * u, accessory: i === 1 ? 'beret' : null, beard: i === 2 ? 'black' : null })) : [];
      const M = Object.assign(mode === 'race' ? { x: 0.42, scale: 0.95, face: 1 } : mode === 'girl' ? { x: 0.26, scale: 0.92, face: 1 } : mode === 'again' ? { x: 0.5, scale: 1.0, face: 1 } : { x: 0.7, scale: 0.55, face: 1 }, P.man || {});
      const man = mode === 'hook' ? null : runner(el(root, 'g'), sd + 900, { scale: M.scale * u });
      const big = mode === 'hook' ? bat(el(root, 'g'), sd + 950) : null;
      const K = Object.assign({ x: 0.3, y: P.gy ?? 0.6, scale: 1.05, pose: 'wave', face: 'right', emotion: 'happy' }, P.kasif || {});
      const kas = P.kasif ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const tk = inkEl(root, INK.ink), sw = inkEl(root, INK.blue);
      const front = duneFront(el(root, 'g'), sd + 990);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = atOr(cues, 'hit', dur * 0.45);
          if (sun) sun.update(t, 0.8 * W, 0.24 * H, 70 * u, punch(lt, hit));
          mid.update(t, W, H, gy);
          if (mode === 'hook') {
            const top = sh ? sh.update(t, (P.shrineX ?? 0.24) * W, gy - 40 * u, 0.62 * u).top : [0, 0];
            smallBats.forEach((b, i) => { const a = t * (0.9 + 0.1 * i) + i * 0.9, rr = (130 + 30 * (i % 3)) * u; b.update(t, top[0] + Math.cos(a) * rr * 1.4, top[1] - 60 * u + Math.sin(a) * rr * 0.5, (0.18 + 0.04 * (i % 3)) * u, { ph: t * 2.6 + i * 0.3, face: Math.sin(a) > 0 ? -1 : 1, eyes: false }); });
            const bx = (P.bat?.[0] ?? 0.5) * W + Math.sin(t * 0.9) * 26 * u, by = (P.bat?.[1] ?? 0.5) * H + Math.sin(t * 2.2) * 18 * u;
            big.update(t, bx, by, (P.bat?.[2] ?? 1.35) * u * (spring(lt, 0, 0.6) * (1 + 0.12 * punch(lt, hit))), { ph: t * 1.6 });
            blank(tk, sw);
          } else if (mode === 'race') {
            const Lp = [[-0.1, 0.55], [0.15, 0.7], [0.62, 0.85], [0.9, 1]];
            flags.forEach((f, i) => f.update(t, (0.12 + i * 0.27) * W, gy - (90 - i * 10) * u, (150 + i * 20) * u, 0.2, 0, 1));
            others.forEach((o, i) => { const sc = [0.62, 0.78, 0.92][i], x = ((0.1 + i * 0.22 + lt * 0.018) % 1.1 - 0.05) * W, y = gy - (110 - i * 40) * u;
              o.update(t, 'run', { x: x - 300 * u * (1 - i * 0.3), y, face: 1, ph: lt * 1.6 + i * 0.3 }); });
            const mx = (M.x + lt * 0.012) * W;
            man.update(t, 'run', { x: mx, y: gy + 20 * u, face: 1, ph: lt * 1.5 });
            blank(tk, sw); void Lp;
          } else if (mode === 'girl') {
            palms[0].update(t, 0.82 * W, gy - 70 * u, 470 * u, -0.1);
            palms[1].update(t, 0.95 * W, gy - 30 * u, 380 * u, 0.12);
            const found = atOr(cues, 'found', dur * 0.5);
            (P.goats || [[0.5, 30, 0.8, -1], [0.63, -40, 0.6, 1], [0.93, 40, 0.85, -1]]).forEach((q, i) => goats[i] && goats[i].update(t, q[0] * W, gy + q[1] * u, q[2] * u, q[3], 1));
            gl.update(t, lt < found ? 'idle' : 'wave', { x: (P.girlX ?? 0.78) * W, y: gy + 10 * u, face: lt < found ? 1 : -1, since: Math.max(0, lt - found), emotion: lt < found ? null : 'surprised' });
            const mx = lerp(M.x - 0.12, M.x, progIO(lt, 0, dur * 0.8)) * W;
            const r = man.update(t, 'walk', { x: mx, y: gy + 40 * u, face: 1, ph: lt * 0.55, emotion: 'worried' });
            sw.setAttribute('d', sweat(r.headW[0], r.headW[1], M.scale * u, sd + 40, t)); tk.setAttribute('d', '');
          } else if (mode === 'again') {
            flags.forEach((f, i) => f.update(t, (0.05 + i * 0.3) * W, gy - 80 * u, 150 * u, 0.25, 0, 1));
            const x0 = 0.12 * W, x1 = 0.88 * W, ty = gy - (P.bannerH ?? 720) * u, sag = 16 * u + Math.sin(t * 2) * 6 * u;
            const C = [[x0, ty], [W / 2, ty + sag], [x1, ty], [x1, ty + 120 * u], [W / 2, ty + 120 * u + sag], [x0, ty + 120 * u]];
            banner.cloth.setAttribute('d', inkLoop(C, { seed: sd + 60, t, amp: 0.8 }));
            banner.r.setAttribute('d', inkPath(C, { w: 6, seed: sd + 61, t, closed: true }) + ' ' + inkPath([[x0, gy + 20 * u], [x0, ty - 30 * u]], { w: 11, seed: sd + 62, t }) + ' ' + inkPath([[x1, gy + 20 * u], [x1, ty - 30 * u]], { w: 11, seed: sd + 63, t }));
            banner.tx.setAttribute('x', f1(W / 2)); banner.tx.setAttribute('y', f1(ty + 92 * u + sag * 0.8));
            others.forEach((o, i) => { const x = (0.2 + i * 0.24) * W + Math.sin(lt * 0.8 + i) * 20 * u; o.update(t, 'run', { x, y: gy - (60 - i * 25) * u, face: 1, ph: lt * 1.5 + i * 0.4 }); });
            const r = man.update(t, lt < hit ? 'run' : 'wave', { x: (M.x - 0.06 + lt * 0.02) * W, y: gy + 40 * u, face: 1, ph: lt * 1.5, since: Math.max(0, lt - hit), emotion: 'happy' });
            void r; blank(tk, sw);
          } else {    // end
            const r = man.update(t, 'run', { x: ((0.5 + lt * 0.06) % 1.2) * W, y: gy - 110 * u, face: 1, ph: lt * 1.5 });
            void r; blank(tk, sw);
          }
          if (kas) kas.update(lt, t, cues);
          front.update(t, W, H, fy);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.pros_storm
  SH.pros_storm = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 541, u = W / 1080;
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.72) * H;
      const root = el(svg, 'g');
      const land = inkEl(root, mix(SAND(), INK.inkSoft, 0.25)), landR = inkEl(root);
      const wallB = inkEl(root, mix(SAND_M(), INK.inkSoft, 0.35)), wallF = inkEl(root, mix(SAND_M(), INK.paperLight, 0.15)), wallR = inkEl(root, SAND_D());
      const prints = inkEl(root, mix(INK.ink, INK.stain, 0.35));
      const flags = Array.from({ length: 3 }, (_, i) => flag(el(root, 'g'), sd + 100 + i * 10));
      const M = Object.assign({ x: 0.4, scale: 1.05, face: 1 }, P.man || {});
      const man = runner(el(root, 'g'), sd + 200, { scale: M.scale * u });
      const arm = inkEl(root);
      const streaks = inkEl(root, mix(SAND_M(), INK.paperLight, 0.2)), streaksD = inkEl(root, SAND_D());
      const front = duneFront(el(root, 'g'), sd + 300);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, gone = atOr(cues, 'gone', dur * 0.6), hit = atOr(cues, 'hit', dur * 0.2);
          const LP = prof(W, gy - 60 * u, 30 * u, 0.005, 1.3);
          land.setAttribute('d', inkLoop(LP.concat([[W + 60, H + 60], [-60, H + 60]]), { seed: sd, t, amp: 0.8 }));
          landR.setAttribute('d', inkPath(LP, { w: 4, seed: sd + 1, t }));
          // the sand wall rolls in from the right and covers more and more of the sky
          const adv = progIO(lt, 0, Math.max(0.5, hit + 0.8)), wx = lerp(1.05, 0.15, adv) * W, B = [], F = [], R = [];
          for (let i = 0; i < 9; i++) {
            const cy = (0.12 + i * 0.065) * H, r = (150 + 60 * hn(sd + 2, i)) * u, cx = wx + Math.sin(t * 1.5 + i) * 30 * u + (i % 2) * 80 * u;
            B.push(inkLoop(inkEllipsePts(cx + 60 * u, cy - 30 * u, r * 1.25, r * 0.8, sd + 10 + i, 12, 0, 0.12), { seed: sd + 10 + i, t, amp: 1.2 }));
            F.push(inkLoop(inkEllipsePts(cx, cy, r, r * 0.7, sd + 30 + i, 12, 0, 0.12), { seed: sd + 30 + i, t, amp: 1.2 }));
            R.push(inkPath(inkEllipsePts(cx, cy, r, r * 0.7, sd + 30 + i, 12, 0, 0.12).slice(5, 11), { w: 4, seed: sd + 50 + i, t }));
          }
          B.push(inkLoop([[wx + 100 * u, 0.06 * H], [W + 60, 0.06 * H], [W + 60, gy + 40 * u], [wx + 60 * u, gy + 40 * u]], { seed: sd + 70, t, amp: 1 }));
          wallB.setAttribute('d', B.join(' ')); wallF.setAttribute('d', F.join(' ')); wallR.setAttribute('d', R.join(' '));
          // footprints behind him (to the left), fading after "gone"
          const fade = 1 - progIO(lt, gone, 0.9), FP = [];
          for (let i = 0; i < 9; i++) { const k = fade - i * 0.04; if (k <= 0.05) continue; const x = M.x * W - 80 * u - i * 70 * u, y = gy + 50 * u + (i % 2) * 22 * u + i * 8 * u; FP.push(inkDot(x, y, 28 * u * k, 13 * u * k, sd + 80 + i, t)); }
          prints.setAttribute('d', FP.join(' '));
          flags.forEach((f, i) => f.update(t, (0.12 + i * 0.3) * W, gy - (50 - i * 12) * u, 160 * u, 1, i === 2 ? 0 : progIO(lt, gone - 0.1 + i * 0.2, 0.6) * 1.05, -1));
          const r = man.update(t, 'walk', { x: M.x * W + lt * 6 * u, y: gy + 40 * u, face: 1, ph: lt * 0.7, emotion: 'worried' });
          // forearm raised against the sand
          const hd = r.headW, s = M.scale * u;
          arm.setAttribute('d', inkPath([[hd[0] - 10 * s, hd[1] + 110 * s], [hd[0] + 70 * s, hd[1] + 40 * s], [hd[0] + 50 * s, hd[1] - 10 * s]], { w: 7, seed: sd + 90, t }) + ' ' + inkDot(hd[0] + 50 * s, hd[1] - 12 * s, 11, 10, sd + 91, t));
          const S1 = [], S2 = [];
          for (let i = 0; i < 46; i++) {
            const y = hn(sd + 3, i) * (H * 0.95), sp = 900 + 500 * hn(sd + 4, i), x = W + 100 - ((t * sp + hn(sd + 5, i) * W * 2) % (W * 1.6)), Lx = (80 + 140 * hn(sd + 6, i)) * u;
            if (x > wx + 260 * u) continue;
            (i % 3 ? S1 : S2).push(inkPath([[x, y], [x - Lx, y + 6 * u]], { w: i % 3 ? 4 : 3, seed: sd + 100 + i, t, taper: 0.8 }));
          }
          streaks.setAttribute('d', S1.join(' ')); streaksD.setAttribute('d', S2.join(' '));
          front.update(t, W, H, fy, { wind: 3 });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.pros_bottle
  SH.pros_bottle = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = window.LH, sd = seed * 1000 + 761, u = W / 1080, mode = P.mode || 'empty';
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.7) * H;
      const root = el(svg, 'g');
      const sun = sunDisc(el(root, 'g'), sd + 5);
      const mid = duneMid(el(root, 'g'), sd + 10);
      const shim = shimmer(el(root, 'g'), sd + 20);
      const M = Object.assign(mode === 'empty' ? { x: 0.45, scale: 1.45, face: 1 } : { x: 0.3, scale: 1.15, face: 1 }, P.man || {});
      const man = runner(el(root, 'g'), sd + 100, { scale: M.scale * u });
      const drop = inkEl(root, INK.blue), dropR = inkEl(root);
      const K = Object.assign({ x: 0.74, y: P.gy ?? 0.6, scale: 1.15, pose: 'shock', face: 'left', emotion: 'surprised' }, P.kasif || {});
      const kas = P.kasif ? L.kasif(el(root, 'g'), K, W, H, seed) : null;
      const tk = inkEl(root), sw = inkEl(root, INK.blue);
      const front = duneFront(el(root, 'g'), sd + 300);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, out = atOr(cues, 'out', dur * 0.3), hit = atOr(cues, 'hit', dur * 0.5);
          sun.update(t, 0.74 * W, 0.2 * H, 110 * u, 0.5 + 0.5 * Math.sin(t * 2));
          mid.update(t, W, H, gy);
          shim.update(t, 0.05 * W, 0.95 * W, gy - 40 * u, 7, u);
          if (mode === 'empty') {
            const r = man.update(t, 'point', { x: M.x * W, y: gy + 60 * u, face: 1, dir: 62, since: 1, emotion: 'worried' }, { bottle: { hand: 1, rot: 170 + Math.sin(t * 9) * 6 * (lt > out ? 1 : 0.3), fill: 0 } });
            // the last drop falls from the bottle mouth into his face
            const bt = r.bottleTop, ph = lt < out ? 0 : ((lt - out) % 1.2) / 1.2, dy = ph * ph * 360 * u, ds = (lt < out ? 0.9 : 1) * 20 * u;
            const D = [[bt[0], bt[1] + dy - ds], [bt[0] + ds * 0.7, bt[1] + dy + ds * 0.5], [bt[0], bt[1] + dy + ds], [bt[0] - ds * 0.7, bt[1] + dy + ds * 0.5]];
            drop.setAttribute('d', ph < 0.9 ? inkLoop(D, { seed: sd + 30, t, amp: 0.4 }) : '');
            dropR.setAttribute('d', ph < 0.9 ? inkPath(D, { w: 3.5, seed: sd + 31, t, closed: true }) : '');
            sw.setAttribute('d', sweat(r.headW[0], r.headW[1], M.scale * u, sd + 40, t)); tk.setAttribute('d', '');
          } else {
            const r = man.update(t, 'think', { x: M.x * W, y: gy + 60 * u, face: 1, since: 1, emotion: 'worried' }, { bottle: { hand: 1, rot: -50 + Math.sin(t * 2) * 8, fill: 0.55, col: mix(INK.gold, INK.paperLight, 0.15), s: 1 } });
            blank(drop, dropR);
            sw.setAttribute('d', sweat(r.headW[0], r.headW[1], M.scale * u, sd + 40, t));
            const kr = kas ? kas.update(lt, t, cues) : null;
            if (kr) { const ks = (K.scale ?? 1) * u, kf = K.face === 'left' ? -1 : 1, hd = [K.x * W + kf * ks * kr.head[0], K.y * H + ks * kr.head[1]]; tk.setAttribute('d', lt > hit ? ticks(hd[0], hd[1] - 20 * ks, ks, sd + 50, t) : ''); }
          }
          front.update(t, W, H, fy);
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.pros_shrine
  SH.pros_shrine = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 981, u = W / 1080, mode = P.mode || 'find';
      const gy = (P.gy ?? 0.6) * H, fy = (P.front ?? 0.72) * H;
      const root = el(svg, 'g');
      if (mode === 'find') {
        const sh = shrine(el(root, 'g'), sd + 10);
        const bats = Array.from({ length: 14 }, (_, i) => bat(el(root, 'g'), sd + 100 + i * 50));
        const M = Object.assign({ x: 0.2, scale: 0.85, face: 1 }, P.man || {});
        const man = runner(el(root, 'g'), sd + 900, { scale: M.scale * u });
        const front = duneFront(el(root, 'g'), sd + 990);
        const LB = labels(root, P.labels, W, H);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt, bt = atOr(cues, 'bats', dur * 0.5);
            const S = sh.update(t, 0.56 * W, gy, 1.05 * u, {});
            bats.forEach((b, i) => {
              const at = bt + i * 0.04, k = spring(lt, at, 0.3);
              if (lt < at) { b.update(t, 0, 0, 1, { k: 0 }); return; }
              const life = lt - at, out = prog(life, 0, 0.45), a = life * (1.1 + 0.15 * (i % 4)) + i * 0.45, rr = (150 + 50 * (i % 4)) * u * out;
              const x = S.window[0] + Math.cos(a) * rr * 1.7, y = S.window[1] - 120 * u * out + Math.sin(a) * rr * 0.6;
              b.update(t, x, y, (0.3 + 0.07 * (i % 3)) * u * k, { ph: t * 2.8 + i * 0.37, face: Math.sin(a) > 0 ? -1 : 1, eyes: false });
            });
            const mx = lerp(M.x - 0.08, M.x + 0.06, progIO(lt, 0, bt)) * W;
            man.update(t, lt < bt ? 'walk' : 'shock', { x: mx, y: gy + 60 * u, face: 1, ph: lt * 0.6, since: Math.max(0, lt - bt), dir: 'up', emotion: lt < bt ? 'worried' : 'surprised' });
            front.update(t, W, H, fy, { ph: 2.2 });
            LB.forEach(l => l.update(lt, t, cues));
          },
        };
      }
      // eat: inside — beam, hanging bats, the man sits against the wall holding one up; tally marks on the wall
      const wallE = inkEl(root, mix(INK.paperLight, INK.stain, 0.16)), wallP = inkEl(root, mix(INK.paperLight, INK.stain, 0.3)), arch = inkEl(root, mix(INK.paperLight, INK.gold, 0.45)), archR = inkEl(root), dune = inkEl(root, SAND());
      const tallyE = inkEl(root, mix(INK.ink, INK.stain, 0.3));
      const beam = inkEl(root, mix(INK.stain, INK.ink, 0.35)), beamR = inkEl(root);
      const N = P.hang ?? 6, hang = Array.from({ length: N }, (_, i) => bat(el(root, 'g'), sd + 200 + i * 40));
      const floor = inkEl(root, mix(SAND(), INK.stain, 0.25)), floorR = inkEl(root);
      const light = inkEl(root, mix(INK.paperLight, INK.gold, 0.25), { 'fill-opacity': 0.45 });
      const M = Object.assign({ x: 0.36, scale: 1.25, face: 1 }, P.man || {});
      const man = runner(el(root, 'g'), sd + 900, { scale: M.scale * u });
      const held = bat(el(root, 'g'), sd + 600);
      const LB = labels(root, P.labels, W, H);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, raw = atOr(cues, 'raw', dur * 0.4);
          wallE.setAttribute('d', inkLoop(rect(-40, -40, W + 40, gy + 40 * u), { seed: sd + 60, t, smooth: false, amp: 1 }));
          const PT = []; for (let i = 0; i < 14; i++) { const x = hn(sd + 61, i) * W, y = (0.1 + hn(sd + 62, i) * 0.45) * H, r = (40 + 70 * hn(sd + 63, i)) * u; PT.push(inkLoop(inkEllipsePts(x, y, r * 1.6, r * 0.7, sd + 64 + i, 10, 0, 0.2), { seed: sd + 64 + i, t, amp: 0.8 })); }
          wallP.setAttribute('d', PT.join(' '));
          const ax = (P.door ?? 0.8) * W, aw = 170 * u, ah = 560 * u, AR = [[ax - aw, gy + 30 * u], [ax - aw, gy - ah + aw]];
          for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; AR.push([ax + Math.cos(a) * aw, gy - ah + aw + Math.sin(a) * aw]); }
          AR.push([ax + aw, gy + 30 * u]);
          arch.setAttribute('d', inkLoop(AR, { seed: sd + 80, t, amp: 0.6, smooth: false }));
          dune.setAttribute('d', inkLoop([[ax - aw, gy + 30 * u], [ax - aw, gy - 120 * u], [ax - 30 * u, gy - 170 * u], [ax + aw, gy - 90 * u], [ax + aw, gy + 30 * u]], { seed: sd + 81, t, amp: 0.6 }));
          archR.setAttribute('d', inkPath(AR, { w: 9, seed: sd + 82, t, smooth: false }) + ' ' + inkPath(AR.map(q => [q[0] + (q[0] < ax ? -22 : 22) * u, q[1] - 10 * u]).slice(1, -1), { w: 4, seed: sd + 83, t }));
          const TA = P.tally ?? [0.6, 0.42], nT = Math.min(9, 4 + Math.floor(lt / Math.max(0.3, dur / 6))), TT = [];
          for (let i = 0; i < nT; i++) { const g5 = Math.floor(i / 5), j = i % 5, x = TA[0] * W + g5 * 150 * u + j * 26 * u, y = TA[1] * H; TT.push(j < 4 ? inkPath([[x, y], [x + 4 * u, y + 110 * u]], { w: 7, seed: sd + 20 + i, t, smooth: false }) : inkPath([[x - 112 * u, y + 20 * u], [x + 10 * u, y + 90 * u]], { w: 7, seed: sd + 20 + i, t, smooth: false })); }
          tallyE.setAttribute('d', TT.join(' '));
          const by = 0.2 * H, BM = [[-40, by - 26 * u], [W + 40, by - 34 * u], [W + 40, by + 26 * u], [-40, by + 30 * u]];
          beam.setAttribute('d', inkLoop(BM, { seed: sd + 1, t, smooth: false, amp: 1 }));
          beamR.setAttribute('d', inkPath(BM, { w: 5, seed: sd + 2, t, closed: true, smooth: false }) + ' ' + [0.2, 0.5, 0.8].map((q, i) => inkPath([[q * W, by - 10 * u], [q * W + 120 * u, by - 4 * u]], { w: 3, seed: sd + 3 + i, t })).join(' '));
          hang.forEach((b, i) => { const x = (0.1 + i * 0.16) * W; if (i === 2 && lt > raw) { b.update(t, 0, 0, 1, { k: 0 }); return; } b.update(t, x, by + 24 * u, (0.62 + 0.06 * (i % 2)) * u, { hang: true }); });
          light.setAttribute('d', inkLoop([[ax - aw, gy + 30 * u], [ax + aw, gy + 30 * u], [ax + aw * 0.6, H + 40], [ax - aw * 3.2, H + 40]], { seed: sd + 9, t, amp: 0.6 }));
          const FL = [[-40, gy + 30 * u], [W + 40, gy + 20 * u], [W + 40, H + 40], [-40, H + 40]];
          floor.setAttribute('d', inkLoop(FL, { seed: sd + 10, t, smooth: false, amp: 1 }));
          floorR.setAttribute('d', inkPath(FL.slice(0, 2), { w: 6, seed: sd + 11, t }) + ' ' + Array.from({ length: 8 }, (_, i) => { const y = gy + (90 + i * 90) * u; return inkPath([[-20, y], [W * 0.5, y + 10 * u], [W + 20, y - 6 * u]], { w: 3.5, seed: sd + 12 + i, t, taper: 0.6 }); }).join(' '));
          const r = man.update(t, 'point', { x: M.x * W, y: gy + 40 * u, face: 1, since: 1, dir: P.dir ?? 34, emotion: lt < raw ? 'worried' : 'angry' }, { pack: false });
          // the bat he holds up by its feet, at the hand nearest the mouth
          const hw = r.W(r.hands[1]);
          held.update(t, hw[0] + 40 * u, hw[1] + 50 * u, (P.held ?? 0.5) * u * (1 + 0.1 * punch(lt, raw)) * (lt > raw ? 1 : spring(lt, 0.1, 0.4)), { ph: 0.72 + 0.04 * Math.sin(t * 5), face: -1 });
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };

  // ------------------------------------------------------------------ SHOTS.pros_map
  SH.pros_map = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 1201, u = W / 1080;
      const root = el(svg, 'g');
      const sheet = inkEl(root, mix(INK.paperLight, INK.gold, 0.12)), edge = inkEl(root, INK.paperDark), folds = inkEl(root, INK.paperDark);
      const algeria = inkEl(root, mix(INK.paperLight, INK.stain, 0.22));
      const dunesE = inkEl(root, mix(INK.stain, INK.gold, 0.45)), mtn = inkEl(root, INK.inkSoft);
      const border = inkEl(root, INK.ink), route = inkEl(root, INK.ink), camps = inkEl(root, INK.ink), lost = inkEl(root, INK.red), xmark = inkEl(root, INK.red), head = inkEl(root, INK.red);
      const names = ['MOROCCO', 'ALGERIA'].map((n, i) => { const tx = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 76 * u, 'text-anchor': 'middle', fill: INK.inkSoft, 'letter-spacing': 6 * u }); tx.textContent = (P.names || [])[i] || n; return tx; });
      const rose = inkEl(root, INK.inkSoft), roseN = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 60 * u, 'text-anchor': 'middle', fill: INK.ink });
      roseN.textContent = 'N';
      const LB = labels(root, P.labels, W, H);
      // border: from top-right-ish down to lower-middle; route in the west (Morocco); track wanders east across it
      const BD = [[0.36, 0.1], [0.46, 0.22], [0.5, 0.34], [0.58, 0.44], [0.62, 0.56], [0.7, 0.66], [0.74, 0.8], [0.8, 0.96]];
      const RT = [[0.12, 0.62], [0.2, 0.54], [0.18, 0.44], [0.28, 0.38], [0.34, 0.46], [0.3, 0.56]];
      const LT = [[0.3, 0.46], [0.38, 0.42], [0.36, 0.5], [0.46, 0.46], [0.5, 0.52], [0.56, 0.47], [0.64, 0.5], [0.66, 0.42], [0.74, 0.46], [0.8, 0.4], [0.84, 0.46]];
      const X = q => [q[0] * W, q[1] * H];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, ls = atOr(cues, 'lost', dur * 0.2), xa = atOr(cues, 'x', dur * 0.7);
          sheet.setAttribute('d', inkLoop(rect(-20, -20, W + 20, H + 20), { seed: sd, t, smooth: false, amp: 1 }));
          edge.setAttribute('d', inkPath(rect(30 * u, 30 * u, W - 30 * u, H - 30 * u), { w: 14, seed: sd + 1, t, closed: true, smooth: false }));
          folds.setAttribute('d', inkPath([[W / 2, 0], [W / 2 + 6, H]], { w: 3, seed: sd + 2, t, smooth: false }) + ' ' + inkPath([[0, H / 3], [W, H / 3 + 6]], { w: 3, seed: sd + 3, t, smooth: false }) + ' ' + inkPath([[0, H * 2 / 3], [W, H * 2 / 3 - 4]], { w: 3, seed: sd + 4, t, smooth: false }));
          algeria.setAttribute('d', inkLoop(BD.map(X).concat([[W + 20, H + 20], [W + 20, -20]]), { seed: sd + 5, t, amp: 1 }));
          const DN = [];
          for (let i = 0; i < 26; i++) { const x = hn(sd + 6, i) * W, y = (0.1 + hn(sd + 7, i) * 0.82) * H, s = (26 + 20 * hn(sd + 8, i)) * u; DN.push(inkPath([[x - s, y], [x - s * 0.2, y - s * 0.5], [x + s, y]], { w: 4, seed: sd + 10 + i, t })); }
          dunesE.setAttribute('d', DN.join(' '));
          mtn.setAttribute('d', [[0.12, 0.3], [0.2, 0.26], [0.26, 0.24]].map((q, i) => { const [x, y] = X(q), s = 40 * u; return inkPath([[x - s, y], [x, y - s * 1.1], [x + s, y]], { w: 5, seed: sd + 40 + i, t, smooth: false }); }).join(' '));
          const BP = BD.map(X), BS = [];
          for (let i = 0; i < BP.length - 1; i++) for (let j = 0; j < 3; j++) { const a = j / 3, b = (j + 0.55) / 3; BS.push(inkPath([[lerp(BP[i][0], BP[i + 1][0], a), lerp(BP[i][1], BP[i + 1][1], a)], [lerp(BP[i][0], BP[i + 1][0], b), lerp(BP[i][1], BP[i + 1][1], b)]], { w: 7, seed: sd + 50 + i * 3 + j, t, smooth: false })); }
          border.setAttribute('d', BS.join(' '));
          const RP = RT.map(X), RS = [];
          for (let i = 0; i < RP.length - 1; i++) RS.push(inkPath([RP[i], RP[i + 1]], { w: 5, seed: sd + 80 + i, t }));
          route.setAttribute('d', RS.join(' '));
          camps.setAttribute('d', RP.map((p, i) => inkCircle(p[0], p[1], 16 * u, sd + 90 + i, t, { w: 5 })).join(' '));
          // lost track: drawn progressively from "lost" to "x"
          const pr = clamp01((lt - ls) / Math.max(0.5, xa - ls)), LP = LT.map(X), n = (LP.length - 1) * pr, k = Math.floor(n), pts = LP.slice(0, k + 1);
          if (pr > 0 && k < LP.length - 1) { const f = n - k; pts.push([lerp(LP[k][0], LP[k + 1][0], f), lerp(LP[k][1], LP[k + 1][1], f)]); }
          lost.setAttribute('d', pr > 0 && pts.length > 1 ? inkPath(pts, { w: 9, seed: sd + 100, t, taper: 0.1 }) : '');
          const hp = pts[pts.length - 1];
          head.setAttribute('d', pr > 0 && pr < 1 ? inkDot(hp[0], hp[1], 14 * u, 14 * u, sd + 101, t) : '');
          const xk = spring(lt, xa, 0.5), xp = LP[LP.length - 1], xs = 46 * u * xk * (1 + 0.15 * punch(lt, xa));
          xmark.setAttribute('d', lt > xa ? inkPath([[xp[0] - xs, xp[1] - xs], [xp[0] + xs, xp[1] + xs]], { w: 14, seed: sd + 102, t }) + ' ' + inkPath([[xp[0] + xs, xp[1] - xs], [xp[0] - xs, xp[1] + xs]], { w: 14, seed: sd + 103, t }) : '');
          (P.namePos || [[0.26, 0.68], [0.84, 0.7]]).forEach((q, i) => { const b = boil(sd + 110 + i, t, 1); names[i].setAttribute('x', f1(q[0] * W + b[0])); names[i].setAttribute('y', f1(q[1] * H + b[1])); });
          const rc = [0.82 * W, 0.42 * H], rr = 70 * u, a = Math.sin(t * 0.6) * 0.05;
          rose.setAttribute('d', [0, 1, 2, 3].map(i => { const q = i * Math.PI / 2 + a; return inkLoop([[rc[0] + Math.cos(q - 0.2) * rr * 0.25, rc[1] + Math.sin(q - 0.2) * rr * 0.25], [rc[0] + Math.cos(q) * rr, rc[1] + Math.sin(q) * rr], [rc[0] + Math.cos(q + 0.2) * rr * 0.25, rc[1] + Math.sin(q + 0.2) * rr * 0.25], rc], { seed: sd + 120 + i, t, amp: 0.5, smooth: false }); }).join(' ') + ' ' + inkCircle(rc[0], rc[1], rr * 0.55, sd + 130, t, { w: 3 }));
          roseN.setAttribute('x', f1(rc[0])); roseN.setAttribute('y', f1(rc[1] - rr - 14 * u));
          LB.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
