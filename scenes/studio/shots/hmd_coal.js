// hmd_coal: coal, the Hamidiye's real enemy (1913 raid), parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz,
// pure function of (seed, lt)). Two modes:
//   stokehold: inside the ship: two riveted boiler fronts fill the upper frame, each with two furnace doors glowing
//              through their grates and a pressure gauge whose needle sinks; a sooty stoker (hatless, sleeveless vest)
//              shovels coal from the bunker pile (right) into the furnace (left), again and again; the pile shrinks;
//              from `low` the fire dims and on `empty` the shovel scrapes bare floor plates and P.label pops. Riveted
//              floor plates with scattered lumps run to the frame bottom. Made for a close-up camera.
//   load:      coaling in a harbour: the cruiser's dark hull side fills the upper left (deck rail, one funnel with smoke,
//              an open coaling port); a gangway plank runs down to a coal lighter in the foreground whose black heap
//              reaches the frame bottom; porters carry sacks up the plank in a loop and tip them into the port. In the
//              sky the sun races across three times (three days pass, `days` cue starts it) and a hand-drawn calendar
//              leaf flips "1. gün" -> "2. gün" -> "3. gün".
// Leaves the background to the scene's "set" (interior / coast).
// P: {mode: "stokehold"|"load", gy: 0.6 (floor line, 0..1 H), pile: 1 (start size 0..1), label: {text, x, y, at, size, color},
//     day_label: "gün", days: 3, cal: [0.81, 0.37] (calendar centre, 0..1), prefix: null ("+" shows "+1", "+2", "+3" instead of "1.", "2.", "3.")}
// cues: low (fire dims), empty (bare shovel), days (load: the sun starts its runs), label.at. Needs hmd__lib.js (HMD).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const COAL = () => mix(INK.ink, INK.inkSoft, 0.15);
  // a heap of coal lumps: base polygon + lump outlines (k: 0..1 size)
  function heap(parent, seed) {
    const g = el(parent, 'g');
    const body = inkEl(g, COAL()), lumps = inkEl(g, mix(INK.inkSoft, INK.ink, 0.3)), shine = inkEl(g, INK.paperLight, { 'fill-opacity': 0.5 });
    const r = rng(inkHash(seed, 5)), J = Array.from({ length: 200 }, () => r());
    function update(t, cx, by, w, h, k) {
      if (k <= 0.01) { HMD.blank(body, lumps, shine); return; }
      const hh = h * k, ww = w * (0.45 + 0.55 * k);
      const pts = [[cx - ww / 2, by]];
      for (let i = 1; i < 10; i++) { const u = i / 10, y = by - Math.sin(u * Math.PI) * hh * (0.85 + 0.15 * J[i]); pts.push([cx - ww / 2 + u * ww, y]); }
      pts.push([cx + ww / 2, by]);
      body.setAttribute('d', inkLoop(pts, { seed, t, amp: 1, smooth: false }));
      const L = [], S = [];
      const n = Math.round(10 + 22 * k);
      for (let i = 0; i < n; i++) {
        const u = J[i * 3 % 200], v = J[(i * 3 + 1) % 200], x = cx - ww / 2 + ww * (0.08 + u * 0.84), top = by - Math.sin((x - cx + ww / 2) / ww * Math.PI) * hh * 0.85;
        const y = lerp(top + 14, by - 8, v), rr = 9 + J[(i * 3 + 2) % 200] * 14;
        L.push(inkLoop(inkEllipsePts(x, y, rr, rr * 0.75, seed + 10 + i, 6, J[i % 200] * 3), { seed: seed + 10 + i, t, amp: 0.6, smooth: false }));
        if (i % 3 === 0) S.push(inkDot(x - rr * 0.3, y - rr * 0.3, 3, 2, seed + 80 + i, t));
      }
      lumps.setAttribute('d', L.join(' ')); shine.setAttribute('d', S.join(' '));
    }
    return { g, update };
  }
  SH.hmd_coal = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.HMD, sd = seed * 1000 + 521, mode = P.mode || 'stokehold', u = W / 1080;
      const root = el(svg, 'g');
      const Q = (g, fill, extra) => inkEl(g, fill, extra);
      let lab = null;
      const mkLab = () => { lab = P.label ? M.label(root, P.label, W, H) : null; };
      if (mode === 'stokehold') {
        const gy = (P.gy ?? 0.6) * H;
        const boilG = el(root, 'g');
        const boilers = [0, 1].map(() => ({ f: Q(boilG, mix(INK.inkSoft, INK.paperDark, 0.25)), r: Q(boilG), riv: Q(boilG, INK.ink), glow: Q(boilG, INK.gold, { 'fill-opacity': 0.4 }), fire: Q(boilG, INK.red), fireHi: Q(boilG, INK.gold), door: Q(boilG, INK.ink), gauge: Q(boilG, INK.paperLight), gaugeR: Q(boilG), needle: Q(boilG, INK.red) }));
        const pipes = Q(root, mix(INK.inkSoft, INK.ink, 0.25));
        const floor = Q(root, mix(INK.inkSoft, INK.paperDark, 0.5)), floorL = Q(root, INK.ink), rivets = Q(root, INK.ink);
        const bunker = Q(root, mix(INK.ink, INK.inkSoft, 0.4)), bunkerR = Q(root);
        const pile = heap(el(root, 'g'), sd + 30);
        const lumpsFloor = Q(root, COAL());
        const stoker = M.person(el(root, 'g'), sd + 40, { kind: 'stoker' });
        const shovel = Q(root, mix(INK.stain, INK.ink, 0.3)), blade = Q(root, mix(INK.inkSoft, INK.ink, 0.4)), load = Q(root, COAL()), flying = Q(root, COAL()), sparks = Q(root, INK.gold);
        const pile0 = P.pile ?? 1;
        mkLab();
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt, k = sd;
            const low = M.atOr(cues, 'low', dur * 0.4), empty = M.atOr(cues, 'empty', dur * 0.7);
            const fireK = 1 - 0.65 * progIO(lt, low, Math.max(0.6, empty - low));
            // boilers
            boilers.forEach((b, i) => {
              const cx = (0.27 + i * 0.5) * W, top = 0.17 * H, bot = gy - 10 * u, w = 0.46 * W;
              const pts = [[cx - w / 2, bot], [cx - w / 2, top + 120 * u], [cx - w * 0.35, top + 20 * u], [cx, top], [cx + w * 0.35, top + 20 * u], [cx + w / 2, top + 120 * u], [cx + w / 2, bot]];
              b.f.setAttribute('d', inkLoop(pts, { seed: k + 10 + i, t, amp: 1 }));
              b.r.setAttribute('d', inkPath(pts, { w: 6, seed: k + 12 + i, t, closed: true, amp: 1 }) + ' ' + inkPath([[cx - w / 2, top + 330 * u], [cx + w / 2, top + 330 * u]], { w: 4, seed: k + 14 + i, t }));
              const R = [];
              for (let j = 0; j < 9; j++) R.push(inkDot(cx - w / 2 + 26 * u + j * (w - 52 * u) / 8, top + 345 * u, 5 * u, 5 * u, k + 100 + i * 20 + j, t));
              for (let j = 0; j < 7; j++) R.push(inkDot(cx - w / 2 + 22 * u, top + 140 * u + j * 70 * u, 5 * u, 5 * u, k + 140 + i * 20 + j, t), inkDot(cx + w / 2 - 22 * u, top + 140 * u + j * 70 * u, 5 * u, 5 * u, k + 160 + i * 20 + j, t));
              b.riv.setAttribute('d', R.join(' '));
              // two furnace doors with glowing grates
              const D = [], F = [], FH = [], G = [];
              [-1, 1].forEach((sgn, j) => {
                const dx = cx + sgn * w * 0.22, dy = top + 520 * u, dw = 150 * u, dh = 170 * u;
                const fl = fireK * (0.75 + 0.25 * Math.sin(t * 9 + i * 2 + j * 3) * Math.sin(t * 5.3 + j));
                G.push(inkCircle(dx, dy, dw * 0.95 * (0.7 + 0.3 * fl), k + 200 + i * 4 + j, t, { fill: true, n: 14 }));
                F.push(inkLoop([[dx - dw / 2, dy - dh / 2], [dx + dw / 2, dy - dh / 2], [dx + dw / 2, dy + dh / 2], [dx - dw / 2, dy + dh / 2]], { seed: k + 210 + i * 4 + j, t, smooth: false }));
                for (let q = 0; q < 3; q++) { const fx = dx - dw * 0.3 + q * dw * 0.3, fh = dh * (0.25 + 0.45 * fl * (0.6 + 0.4 * Math.sin(t * 11 + q * 2 + j))); FH.push(inkLoop([[fx - 20 * u, dy + dh / 2], [fx, dy + dh / 2 - fh], [fx + 20 * u, dy + dh / 2]], { seed: k + 220 + i * 10 + j * 3 + q, t, amp: 1.5 })); }
                const bars = []; for (let q = 0; q < 5; q++) { const bx = dx - dw / 2 + (q + 0.5) * dw / 5; bars.push(inkPath([[bx, dy - dh / 2], [bx, dy + dh / 2]], { w: 9 * u, seed: k + 240 + i * 10 + j * 5 + q, t })); }
                D.push(inkPath([[dx - dw / 2, dy - dh / 2], [dx + dw / 2, dy - dh / 2], [dx + dw / 2, dy + dh / 2], [dx - dw / 2, dy + dh / 2]], { w: 8, seed: k + 260 + i * 4 + j, t, closed: true, smooth: false }), ...bars);
              });
              b.glow.setAttribute('fill-opacity', (0.42 * fireK).toFixed(3));
              b.glow.setAttribute('d', G.join(' '));
              b.fire.setAttribute('d', F.join(' ')); b.fire.setAttribute('fill', mix(INK.ink, INK.red, 0.35 + 0.65 * fireK));
              b.fireHi.setAttribute('d', FH.join(' '));
              b.door.setAttribute('d', D.join(' '));
              // pressure gauge (needle sinks with the fire)
              const gc = [cx, top + 210 * u], gr = 62 * u;
              b.gauge.setAttribute('d', inkCircle(gc[0], gc[1], gr, k + 280 + i, t, { fill: true }));
              const TK = []; for (let q = 0; q < 7; q++) { const a = (210 - q * 40) * Math.PI / 180; TK.push(inkPath([[gc[0] + Math.cos(a) * gr * 0.7, gc[1] - Math.sin(a) * gr * 0.7], [gc[0] + Math.cos(a) * gr * 0.9, gc[1] - Math.sin(a) * gr * 0.9]], { w: 3, seed: k + 290 + i * 10 + q, t })); }
              b.gaugeR.setAttribute('d', inkCircle(gc[0], gc[1], gr, k + 284 + i, t, { w: 6 }) + ' ' + TK.join(' '));
              const na = (lerp(200, -10, fireK) + Math.sin(t * 7 + i) * 3) * Math.PI / 180;
              b.needle.setAttribute('d', inkPath([[gc[0], gc[1]], [gc[0] + Math.cos(na) * gr * 0.8, gc[1] - Math.sin(na) * gr * 0.8]], { w: 6, seed: k + 296 + i, t }) + ' ' + inkDot(gc[0], gc[1], 9, 9, k + 298 + i, t));
            });
            pipes.setAttribute('d', inkPath([[-20, 0.12 * H], [W + 20, 0.12 * H]], { w: 40 * u, seed: k + 300, t }) + ' ' + inkPath([[0.52 * W, 0.12 * H], [0.52 * W, 0.2 * H]], { w: 30 * u, seed: k + 301, t }));
            // floor plates
            floor.setAttribute('d', `M-20 ${M.f1(gy)} H${W + 20} V${H + 20} H-20 Z`);
            const FL = [inkPath([[-20, gy], [W + 20, gy]], { w: 7, seed: k + 310, t })], RV = [];
            for (let i = -6; i <= 6; i++) FL.push(inkPath([[W / 2 + i * W * 0.1, gy], [W / 2 + i * W * 0.42, H + 20]], { w: 3, seed: k + 320 + i, t }));
            for (let y = gy + 70 * u, j = 0; y < H; j++, y += 70 * u + (y - gy) * 0.35) { FL.push(inkPath([[-10, y], [W + 10, y]], { w: 3, seed: k + 340 + j, t })); for (let i = 0; i < 9; i++) RV.push(inkDot(i * W / 8, y - 10 * u, 4 * u + j, 4 * u + j, k + 360 + j * 10 + i, t)); }
            floorL.setAttribute('d', FL.join(' ')); rivets.setAttribute('d', RV.join(' '));
            // coal bunker opening (right) + pile
            const bx = 0.8 * W;
            bunker.setAttribute('d', inkLoop([[bx, gy - 6], [bx + 30 * u, 0.47 * H], [W + 20, 0.47 * H], [W + 20, gy - 6]], { seed: k + 380, t, smooth: false }));
            bunkerR.setAttribute('d', inkPath([[bx, gy - 6], [bx + 30 * u, 0.47 * H], [W + 20, 0.47 * H]], { w: 7, seed: k + 381, t, smooth: false }));
            const pk = pile0 * (1 - 0.9 * progIO(lt, 0, Math.max(0.6, empty)));
            pile.update(t, 0.86 * W, gy + 140 * u, 0.5 * W, 380 * u, pk);
            const LF = []; [[0.12, 0.8], [0.3, 0.9], [0.58, 0.84], [0.76, 0.95], [0.46, 0.74], [0.9, 0.78]].forEach((p, i) => LF.push(inkLoop(inkEllipsePts(p[0] * W, p[1] * H, 22 * u, 15 * u, k + 400 + i, 6, i), { seed: k + 400 + i, t, smooth: false, amp: 0.6 })));
            lumpsFloor.setAttribute('d', LF.join(' '));
            // the stoker's shovel cycle: scoop at the pile -> swing -> throw at the left furnace door of boiler 2
            const cyc = 1.5, ph = ((lt + 0.2) % cyc) / cyc, isEmpty = lt >= empty;
            const scoop = [0.76 * W, gy + 110 * u], door = [0.668 * W, 0.17 * H + 560 * u];
            let tip, q;
            if (isEmpty) { q = (lt - empty) % 0.8 / 0.8; tip = [lerp(0.68 * W, 0.84 * W, Math.sin(q * Math.PI)), gy + 130 * u]; }
            else if (ph < 0.35) { q = ph / 0.35; tip = [lerp(0.7 * W, scoop[0], q), lerp(gy + 100 * u, scoop[1], q)]; }
            else if (ph < 0.65) { q = progIO(ph, 0.35, 0.3); tip = [lerp(scoop[0], door[0], q), lerp(scoop[1], door[1], q) - Math.sin(q * Math.PI) * 80 * u]; }
            else { q = (ph - 0.65) / 0.35; tip = [lerp(door[0], 0.7 * W, q), lerp(door[1], gy + 100 * u, q)]; }
            const sx = 0.4 * W, sgy = gy + 150 * u, ss = 1.05 * u;
            const H0 = [sx + 10 * u, sgy - 300 * ss], dv = [tip[0] - H0[0], tip[1] - H0[1]];
            const pr = stoker.update(t, sx, sgy, ss, { face: 1, lean: 14 + (tip[1] - gy) * 0.02, armL: [H0[0] + dv[0] * 0.04, H0[1] + dv[1] * 0.04], armR: [H0[0] + dv[0] * 0.38, H0[1] + dv[1] * 0.38] });
            const dl = Math.hypot(dv[0], dv[1]) || 1, nd = [dv[0] / dl, dv[1] / dl];
            const hEnd = [H0[0] - nd[0] * 30 * u, H0[1] - nd[1] * 30 * u];
            shovel.setAttribute('d', inkPath([hEnd, tip], { w: 12 * u, seed: k + 420, t }));
            const nn = [-nd[1], nd[0]], bw = 46 * u, bl = 70 * u;
            const bp = [[tip[0] + nn[0] * bw, tip[1] + nn[1] * bw], [tip[0] + nd[0] * bl + nn[0] * bw * 0.8, tip[1] + nd[1] * bl + nn[1] * bw * 0.8], [tip[0] + nd[0] * bl - nn[0] * bw * 0.8, tip[1] + nd[1] * bl - nn[1] * bw * 0.8], [tip[0] - nn[0] * bw, tip[1] - nn[1] * bw]];
            blade.setAttribute('d', inkLoop(bp, { seed: k + 421, t, smooth: false }) + ' ' + inkPath(bp, { w: 4, seed: k + 422, t, closed: true, smooth: false }));
            const loaded = !isEmpty && ph >= 0.3 && ph < 0.6;
            const bc = [tip[0] + nd[0] * bl * 0.5, tip[1] + nd[1] * bl * 0.5 - 18 * u];
            load.setAttribute('d', loaded ? [0, 1, 2, 3].map(i => inkLoop(inkEllipsePts(bc[0] + (i - 1.5) * 18 * u, bc[1] - (i % 2) * 12 * u, 16 * u, 12 * u, k + 430 + i, 6, i), { seed: k + 430 + i, t, smooth: false, amp: 0.5 })).join(' ') : '');
            // lumps flying into the door + sparks
            const fq = isEmpty ? -1 : (ph - 0.6) / 0.12;
            flying.setAttribute('d', fq > 0 && fq < 1 ? [0, 1, 2].map(i => inkLoop(inkEllipsePts(lerp(door[0] + 60 * u, door[0], fq) + i * 16 * u, lerp(door[1] - 20 * u, door[1], fq) + i * 10 * u, 14 * u, 10 * u, k + 440 + i, 6, i), { seed: k + 440 + i, t, smooth: false })).join(' ') : '');
            const SP = [];
            if (fq > 0.8 && fq < 3) for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.35, d = (fq - 0.8) * 60 * u; SP.push(inkDot(door[0] + Math.cos(a) * d, door[1] - 60 * u + Math.sin(a) * d, 5 * u, 5 * u, k + 450 + i, t)); }
            sparks.setAttribute('d', SP.join(' '));
            if (lab) lab.update(lt, t, cues);
          },
        };
      }
      // ------------------------------------------------------------------ load: coaling in harbour
      const gy = (P.gy ?? 0.5) * H;
      const sunE = Q(root, INK.gold), sunR = Q(root, INK.gold, { 'fill-opacity': 0.35 }), moonE = Q(root, INK.paperLight);
      const sea = M.sea(el(root, 'g'), sd + 5);
      const smk = M.smoke(el(root, 'g'), sd + 6);
      const funnel = Q(root, mix(INK.inkSoft, INK.paperDark, 0.25)), funnelR = Q(root), funBand = Q(root, INK.ink);
      const hull = Q(root, mix(INK.inkSoft, INK.paperDark, 0.3)), hullR = Q(root), hullTop = Q(root, INK.paperDark), portE = Q(root, INK.ink), portR = Q(root), riv = Q(root, INK.ink), boot = Q(root, mix(INK.red, INK.ink, 0.25));
      const rail = Q(root, INK.ink);
      const plank = Q(root, INK.stain), plankR = Q(root);
      const portersG = el(root, 'g');
      const porters = [0, 1, 2].map(i => ({ p: M.person(el(portersG, 'g'), sd + 60 + i * 9, { kind: 'stoker' }), sack: Q(portersG, mix(INK.stain, INK.paperDark, 0.4)), sackR: Q(portersG) }));
      const barge = Q(root, mix(INK.stain, INK.ink, 0.45)), bargeR = Q(root);
      const coalHeap = heap(el(root, 'g'), sd + 80);
      const calG = el(root, 'g');
      const cal = Q(calG, INK.paperLight), calR = Q(calG), calTop = Q(calG, INK.red), curl = Q(calG, INK.paperDark);
      const calTx = el(calG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 120, 'text-anchor': 'middle', fill: INK.ink });
      const calSub = el(calG, 'text', { 'font-family': INK_FONT, 'font-size': 72, 'text-anchor': 'middle', fill: INK.red });
      calSub.textContent = P.day_label || 'gün';
      const nDays = P.days ?? 3;
      mkLab();
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, k = sd;
          const d0 = M.atOr(cues, 'days', 0.3), dayLen = Math.max(0.6, (dur - d0 - 0.3) / nDays);
          const dq = Math.max(0, (lt - d0) / dayLen), day = Math.min(nDays, 1 + Math.floor(dq));
          // sun races over the sky: one arc per day; a moon between
          const ph = dq % 1, run = lt >= d0 && dq < nDays + 0.999;
          const sxp = lerp(0.62, 1.04, ph) * W, syp = 0.27 * H - Math.sin(ph * Math.PI) * 0.17 * H;
          sunE.setAttribute('d', run ? inkCircle(sxp, syp, 42 * u, k + 1, t, { fill: true }) : inkCircle(0.82 * W, 0.15 * H, 42 * u, k + 1, t, { fill: true }));
          sunR.setAttribute('d', run ? inkCircle(sxp, syp, 70 * u, k + 2, t, { w: 10 }) : '');
          moonE.setAttribute('d', '');
          sea.update(t, W, H, gy, { rows: 8, near: false });
          // ship hull side (upper left), funnel with smoke
          const hx1 = 0.66 * W, deckY = 0.27 * H, wl = gy + 40 * u, roll = Math.sin(t * 0.9) * 3 * u;
          const fx = 0.5 * W, ftop = 0.15 * H;
          smk.update(t, fx - 18 * u, ftop + roll, 0.7, -1, 7, 1.2 * u);
          const fp = [[fx - 52 * u, deckY + roll], [fx + 52 * u, deckY + roll], [fx + 30 * u, ftop + roll], [fx - 74 * u, ftop + roll]];
          funnel.setAttribute('d', inkLoop(fp, { seed: k + 10, t, smooth: false }));
          funnelR.setAttribute('d', inkPath(fp, { w: 6, seed: k + 11, t, closed: true, smooth: false }));
          funBand.setAttribute('d', inkLoop([[fx - 70 * u, ftop + roll + 40 * u], [fx + 33 * u, ftop + roll + 40 * u], [fx + 30 * u, ftop + roll], [fx - 74 * u, ftop + roll]], { seed: k + 12, t, smooth: false }));
          const hp = [[-30, deckY + roll], [hx1, deckY + roll], [hx1 - 20 * u, wl + roll], [-30, wl + roll]];
          hull.setAttribute('d', inkLoop(hp, { seed: k + 13, t, smooth: false }));
          hullTop.setAttribute('d', inkLoop([[-30, deckY + roll], [hx1, deckY + roll], [hx1 - 2 * u, deckY + roll + 26 * u], [-30, deckY + roll + 26 * u]], { seed: k + 14, t, smooth: false }));
          boot.setAttribute('d', inkLoop([[-30, wl + roll - 40 * u], [hx1 - 16 * u, wl + roll - 40 * u], [hx1 - 20 * u, wl + roll], [-30, wl + roll]], { seed: k + 15, t, smooth: false }));
          hullR.setAttribute('d', inkPath(hp, { w: 7, seed: k + 16, t, closed: true, smooth: false }));
          const RV = []; for (let i = 0; i < 12; i++) RV.push(inkDot(i * 0.056 * W, deckY + roll + 46 * u, 5 * u, 5 * u, k + 20 + i, t), inkDot(i * 0.056 * W, wl + roll - 60 * u, 5 * u, 5 * u, k + 40 + i, t));
          for (let i = 0; i < 6; i++) RV.push(inkCircle(0.06 * W + i * 0.06 * W, deckY + roll + 110 * u, 12 * u, k + 60 + i, t, { fill: true }));
          riv.setAttribute('d', RV.join(' '));
          const port = [0.5 * W, deckY + roll + 170 * u], pw = 120 * u;
          const pp = [[port[0] - pw / 2, port[1] - pw / 2], [port[0] + pw / 2, port[1] - pw / 2], [port[0] + pw / 2, port[1] + pw / 2], [port[0] - pw / 2, port[1] + pw / 2]];
          portE.setAttribute('d', inkLoop(pp, { seed: k + 70, t, smooth: false }));
          portR.setAttribute('d', inkPath(pp, { w: 6, seed: k + 71, t, closed: true, smooth: false }));
          const RL = [inkPath([[-30, deckY + roll - 60 * u], [hx1, deckY + roll - 60 * u]], { w: 5, seed: k + 72, t })];
          for (let i = 0; i < 9; i++) RL.push(inkPath([[i * 0.08 * W, deckY + roll - 60 * u], [i * 0.08 * W, deckY + roll]], { w: 4, seed: k + 73 + i, t }));
          rail.setAttribute('d', RL.join(' '));
          // gangway plank: from the lighter (bottom right) up to the port
          const p0 = [0.92 * W, 0.73 * H], p1 = [port[0] + pw * 0.4, port[1] + pw * 0.45];
          const nrm = [0, 1], pt = [[p0[0], p0[1]], [p1[0], p1[1]], [p1[0], p1[1] + 22 * u], [p0[0], p0[1] + 26 * u]];
          plank.setAttribute('d', inkLoop(pt, { seed: k + 80, t, smooth: false }));
          const PR = [inkPath(pt, { w: 4, seed: k + 81, t, closed: true, smooth: false })];
          for (let i = 1; i < 8; i++) { const q = i / 8, x = lerp(p0[0], p1[0], q), y = lerp(p0[1], p1[1], q); PR.push(inkPath([[x, y], [x, y + 24 * u]], { w: 3, seed: k + 82 + i, t })); }
          plankR.setAttribute('d', PR.join(' '));
          // porters walk up in a loop
          porters.forEach((po, i) => {
            const f = ((lt * 0.28 + i / 3) % 1), x = lerp(p0[0] - 20 * u, p1[0] + 20 * u, f), y = lerp(p0[1], p1[1], f) + 4 * u, s = 0.62 * u;
            const step = Math.sin(lt * 7 + i * 2);
            const r = po.p.update(t, x, y, s, { face: -1, lean: 14, armL: [x + 60 * s, y - 400 * s], armR: [x + 40 * s, y - 330 * s], legs: true });
            const sk = [r.hc[0] + 80 * s, r.hc[1] + 70 * s], sw = 70 * s, sh = 55 * s, tip = f > 0.92;
            const pts = [[sk[0] - sw, sk[1] - sh * 0.7], [sk[0] + sw * 0.8, sk[1] - sh], [sk[0] + sw, sk[1] + sh * 0.6], [sk[0] - sw * 0.8, sk[1] + sh * 0.7]];
            po.sack.setAttribute('d', tip ? '' : inkLoop(pts, { seed: k + 100 + i, t, amp: 1.2 }));
            po.sackR.setAttribute('d', tip ? '' : inkPath(pts, { w: 4, seed: k + 110 + i, t, closed: true, amp: 1.2 }));
            void step;
          });
          // coal lighter (foreground) with its heap down to the frame bottom
          const by = 0.76 * H;
          const bp = [[0.28 * W, by], [W + 30, by - 20 * u], [W + 30, H + 30], [0.36 * W, H + 30]];
          barge.setAttribute('d', inkLoop(bp, { seed: k + 120, t, smooth: false }));
          bargeR.setAttribute('d', inkPath(bp, { w: 7, seed: k + 121, t, closed: true, smooth: false }) + ' ' + inkPath([[0.3 * W, by + 40 * u], [W + 30, by + 20 * u]], { w: 4, seed: k + 122, t }));
          coalHeap.update(t, 0.7 * W, H + 60 * u, 0.9 * W, 420 * u, 1 - 0.25 * clamp01(dq / nDays));
          // calendar leaf (top right): flips day by day
          const cx = (P.cal ? P.cal[0] : 0.81) * W, cy = (P.cal ? P.cal[1] : 0.37) * H, cw = 230 * u, chh = 250 * u;
          const flip = lt >= d0 ? punch(lt, d0 + (day - 1) * dayLen, 0.6) : 0;
          const ap = spring(lt, 0.05, 0.5);
          calG.setAttribute('transform', `translate(${M.f1(cx)} ${M.f1(cy)}) rotate(${M.f1(4 + Math.sin(t * 1.2) * 1.5)}) scale(${M.f1(ap * (1 + 0.14 * flip) * 100) / 100})`);
          const box = [[-cw / 2, -chh / 2], [cw / 2, -chh / 2], [cw / 2, chh / 2], [-cw / 2, chh / 2]];
          cal.setAttribute('d', inkLoop(box, { seed: k + 130, t, smooth: false }));
          calR.setAttribute('d', inkPath(box, { w: 6, seed: k + 131, t, closed: true, smooth: false }));
          calTop.setAttribute('d', inkLoop([[-cw / 2, -chh / 2], [cw / 2, -chh / 2], [cw / 2, -chh / 2 + 50 * u], [-cw / 2, -chh / 2 + 50 * u]], { seed: k + 132, t, smooth: false }));
          curl.setAttribute('d', flip > 0.05 ? inkLoop([[cw / 2, chh / 2 - 80 * u * flip], [cw / 2, chh / 2], [cw / 2 - 90 * u * flip, chh / 2]], { seed: k + 133, t, smooth: false }) : '');
          calTx.textContent = P.prefix ? P.prefix + String(lt < d0 ? 1 : day) : String(lt < d0 ? 1 : day) + '.';
          calTx.setAttribute('x', 0); calTx.setAttribute('y', M.f1(30 * u)); calTx.setAttribute('font-size', M.f1(120 * u));
          calSub.setAttribute('x', 0); calSub.setAttribute('y', M.f1(104 * u)); calSub.setAttribute('font-size', M.f1(72 * u));
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
