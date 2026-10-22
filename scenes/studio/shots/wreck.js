// wreck: sea cross-section in parchment ink (brand/kit/BRAND.md §5): a sponge divers' boat on the surface, a helmet
// diver going down on his hose, and an ancient wreck on the sea floor (broken ribs, amphorae, a marble bust, a lying
// statue) that draws itself in on cue. Made for the Antikythera wreck, usable for any shipwreck find.
//   mode "dive"  — wide view: sky, waves, boat (cast can stand in it), diver descends to the floor; cue "wreck"
//                  draws the wreck in with a punch.
//   mode "floor" — close on the sea floor: statues, amphorae, a small corroded lump in front; the diver kneels and
//                  reaches for it; cue "find" draws a red ink circle round the lump.
// P: {mode: "dive"|"floor", boat: {x: 0.66} (dive), diver: {x: 0.42}, lump: {x: 0.5},
//     label: {text, x: 0.5, y: 0.2, at, size: 80, color: "ink"|"red"},
//     cast: [{who: "kasif"|name, x, y (ground, 0..1 H), scale, pose, at, then, face: "left"|"right", dir, emotion}],
//     bubbles: [cast index...] (bubbles rise from those heads: underwater cast)}
// cues: wreck (dive), find (floor), label "at", cast "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const circ = (cx, cy, r, n = 16) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);

  SH.wreck = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, mode = P.mode || 'dive', sd0 = seed * 1000;
      const mk = (g, fill, extra = {}) => inkEl(g, fill, extra);
      const cam = el(svg, 'g');
      const L = mode === 'dive'
        ? { surf: portrait ? 470 : 300, floor: portrait ? 1010 : 900 }
        : { surf: portrait ? 300 : 150, floor: portrait ? 960 : 860 };
      const water = mk(cam, INK.paperDark, { 'fill-opacity': 0.42 });
      const rays = mk(cam, INK.paperLight, { 'fill-opacity': 0.55 });
      const hatch = mk(cam, INK.inkSoft, { 'fill-opacity': 0.5 });
      const fishE = mk(cam, INK.inkSoft, { 'fill-opacity': 0.85 });
      const surfE = mk(cam);
      const boatG = el(cam, 'g'), boatF = mk(boatG, INK.paperLight), boatI = mk(boatG), sailF = mk(boatG, INK.paperLight), sailI = mk(boatG);
      const floorBack = el(cam, 'g');
      const wreckG = el(cam, 'g'), wreckF = mk(wreckG, INK.paperLight), wreckF2 = mk(wreckG, INK.paperDark), wreckI = mk(wreckG), wreckS = mk(wreckG, INK.inkSoft, { 'fill-opacity': 0.7 });
      const sandF = mk(cam, INK.paperDark), sandI = mk(cam), sandS = mk(cam, INK.inkSoft, { 'fill-opacity': 0.6 });
      const lumpF = mk(cam, INK.paperDark), lumpV = mk(cam, INK.green, { 'fill-opacity': 0.4 }), lumpI = mk(cam);
      const hose = mk(cam, INK.inkSoft);
      const diverG = el(cam, 'g'), diverF = mk(diverG, INK.paperLight), diverM = mk(diverG, INK.gold, { 'fill-opacity': 0.75 }), diverI = mk(diverG);
      const ring = mk(cam, INK.red);
      const castG = el(cam, 'g');
      const bubE = mk(cam, INK.paperLight), bubI = mk(cam, INK.inkSoft);
      const r0 = rng(seed * 13 + 5);
      const fish = Array.from({ length: 5 }, () => ({ x: r0() * W, y: lerp(L.surf + 80, L.floor - 120, r0()), v: (r0() < 0.5 ? -1 : 1) * (30 + r0() * 30), s: 0.7 + r0() * 0.5 }));
      const hlines = Array.from({ length: 14 }, () => ({ x: r0() * W, y: lerp(L.surf + 40, L.floor - 40, r0()), w: 50 + r0() * 90, v: 6 + r0() * 10 }));
      const pebbles = Array.from({ length: 16 }, () => [r0() * W, L.floor + 30 + r0() * 110, 6 + r0() * 10]);

      // label
      let label = null;
      if (P.label && P.label.text) {
        const Lb = P.label, size = Lb.size || (portrait ? 80 : 64), g = el(svg, 'g');
        const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: Lb.color === 'red' ? INK.red : INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        tx.textContent = Lb.text;
        label = { Lb, g, tx, u: mk(g, Lb.color === 'red' ? INK.red : INK.ink) };
      }
      const cast = (P.cast || []).map((c, i) => {
        const isK = (c.who || 'kasif') === 'kasif';
        const rig = KASIF.create(el(castG, 'g'), { scale: c.scale ?? (portrait ? 0.5 : 0.45), hat: isK, accessory: isK ? null : (c.accessory || null), beard: isK ? null : (c.beard || null), seed: seed + i * 7 + 3 });
        return { c, rig, i };
      });

      // wreck pieces in floor coordinates (x px, y up from the floor line)
      function wreckPaths(t, sd, k, wx) {
        const fy = L.floor; let fill = '', fill2 = '', ink = '', soft = '';
        const P2 = (x, y) => [wx + x * k, fy - y * k];
        // broken hull: keel + ribs
        const keel = [P2(-330, 10), P2(-120, 4), P2(120, 6), P2(300, 22)];
        ink += inkPath(keel, { seed: sd + 1, t, w: 9 }) + ' ';
        [-280, -200, -120, -40, 40, 120, 200].forEach((x, i) => {
          const h = 150 - Math.abs(x) * 0.18 - (i % 3 === 1 ? 50 : 0);
          ink += inkPath([P2(x, 6), P2(x - 18, h * 0.6), P2(x - 10, h)], { seed: sd + 10 + i, t, w: 7 }) + ' ';
        });
        ink += inkPath([P2(-300, 90), P2(-120, 112), P2(60, 104)], { seed: sd + 30, t, w: 5 }) + ' ';
        // amphorae (lying)
        [[-230, 26, 0.3], [-60, 22, -0.25], [180, 24, 0.15]].forEach(([x, y, rot], i) => {
          const c = Math.cos(rot), s = Math.sin(rot), Q = (u, v) => P2(x + u * c - v * s, y + u * s + v * c);
          const body = [Q(-70, 0), Q(-50, 26), Q(10, 32), Q(50, 18), Q(70, 8), Q(70, -8), Q(50, -18), Q(10, -32), Q(-50, -26)];
          fill2 += inkLoop(body, { seed: sd + 40 + i, t }) + ' ';
          ink += inkPath(body, { seed: sd + 40 + i, t, closed: true, w: 5 }) + ' ';
          ink += inkPath([Q(70, 0), Q(100, 0)], { seed: sd + 50 + i, t, w: 12 }) + ' ';
          ink += inkPath([Q(52, 16), Q(70, 30), Q(86, 6)], { seed: sd + 55 + i, t, w: 4 }) + ' ';
        });
        // marble bust on its side-plinth
        const bx = 300, by = 0;
        const plinth = [P2(bx - 60, by), P2(bx + 60, by), P2(bx + 50, by + 40), P2(bx - 50, by + 40)];
        fill += inkLoop(plinth, { seed: sd + 60, t, smooth: false }) + ' ';
        ink += inkPath(plinth, { seed: sd + 60, t, closed: true, w: 5, smooth: false }) + ' ';
        const sh = [P2(bx - 80, by + 40), P2(bx - 70, by + 100), P2(bx - 30, by + 122), P2(bx + 30, by + 122), P2(bx + 70, by + 100), P2(bx + 80, by + 40)];
        fill += inkLoop(sh, { seed: sd + 61, t }) + ' ';
        ink += inkPath(sh, { seed: sd + 61, t, closed: true, w: 5 }) + ' ';
        const [hx, hy] = P2(bx, by + 170);
        fill += inkLoop(circ(hx, hy, 46 * k, 14), { seed: sd + 62, t }) + ' ';
        ink += inkPath(circ(hx, hy, 46 * k, 14), { seed: sd + 62, t, closed: true, w: 5 }) + ' ';
        soft += inkPath([[hx - 30 * k, hy - 30 * k], [hx, hy - 52 * k], [hx + 30 * k, hy - 30 * k]], { seed: sd + 63, t, w: 6 }) + ' ';
        soft += inkDot(hx + 12 * k, hy - 6 * k, 5, 4, seed + 1, t) + ' ' + inkDot(hx - 12 * k, hy - 6 * k, 5, 4, seed + 2, t) + ' ';
        // a lying column drum
        const cd = [P2(-420, 0), P2(-340, 0), P2(-340, 70), P2(-420, 70)];
        fill += inkLoop(cd, { seed: sd + 70, t, smooth: false }) + ' ';
        ink += inkPath(cd, { seed: sd + 70, t, closed: true, w: 5, smooth: false }) + ' ';
        for (let j = 1; j < 4; j++) soft += inkPath([P2(-420 + j * 20, 4), P2(-420 + j * 20, 66)], { seed: sd + 71 + j, t, w: 2.5 }) + ' ';
        return { fill, fill2, ink, soft };
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          const z = lerp(1, P.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur)));
          const fx = W * 0.5, fy = mode === 'dive' ? L.floor - 150 : L.floor - 120;
          cam.setAttribute('transform', `translate(${f1(Math.sin(t * 0.31) * 6)} ${f1(Math.cos(t * 0.23) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // water body + surface waves
          const wv = []; for (let i = 0; i <= 24; i++) { const x = -60 + i * (W + 120) / 24; wv.push([x, L.surf + Math.sin(i * 0.9 + t * 2.2) * 9]); }
          water.setAttribute('d', inkLoop(wv.concat([[W + 60, L.floor + 200], [-60, L.floor + 200]]), { seed: sd + 1, t, amp: 1, smooth: false }));
          surfE.setAttribute('d', inkPath(wv, { seed: sd + 2, t, w: 6, amp: 1.2 }));
          let ry = ''; for (let k = 0; k < 4; k++) { const x0 = W * (0.15 + k * 0.24) + Math.sin(t * 0.5 + k) * 20; ry += inkLoop([[x0 - 22, L.surf + 14], [x0 + 22, L.surf + 14], [x0 + 110, L.floor - 40], [x0 + 40, L.floor - 40]], { seed: sd + 5 + k, t, amp: 1, smooth: false }) + ' '; }
          rays.setAttribute('d', ry);
          hatch.setAttribute('d', hlines.map((h, i) => { const x = ((h.x + t * h.v) % (W + 200)) - 100; const pts = []; for (let j = 0; j <= 4; j++) pts.push([x + j * h.w / 4, h.y + Math.sin(j * 1.5 + t) * 5]); return inkPath(pts, { seed: sd + 20 + i, t, w: 3, amp: 0.8 }); }).join(' '));
          fishE.setAttribute('d', fish.map((f, i) => {
            const x = ((f.x + t * f.v) % (W + 200) + W + 200) % (W + 200) - 100, y = f.y + Math.sin(t * 1.3 + i) * 10, s = 26 * f.s, d = f.v > 0 ? 1 : -1;
            return inkLoop([[x + d * s, y], [x, y - s * 0.45], [x - d * s * 0.8, y], [x - d * s * 1.3, y - s * 0.4], [x - d * s * 1.3, y + s * 0.4], [x - d * s * 0.8, y], [x, y + s * 0.45]], { seed: sd + 40 + i, t, amp: 0.6, smooth: false });
          }).join(' '));
          // sea floor
          const sf = []; for (let i = 0; i <= 16; i++) { const x = -60 + i * (W + 120) / 16; sf.push([x, L.floor + Math.sin(i * 1.7) * 14]); }
          sandF.setAttribute('d', inkLoop(sf.concat([[W + 60, H + 50], [-60, H + 50]]), { seed: sd + 60, t, amp: 1.2, smooth: false }));
          sandI.setAttribute('d', inkPath(sf, { seed: sd + 61, t, w: 6, amp: 1.2 }));
          sandS.setAttribute('d', pebbles.map((p, i) => inkDot(p[0], p[1], p[2], p[2] * 0.6, seed + 70 + i, t)).join(' ') + ' ' +
            [0, 1, 2].map(k => inkPath([[80 + k * 340, L.floor + 70 + k * 18], [180 + k * 340, L.floor + 60 + k * 18], [280 + k * 340, L.floor + 72 + k * 18]], { seed: sd + 80 + k, t, w: 3 })).join(' '));

          // boat (dive)
          if (mode === 'dive') {
            const B = P.boat || {}, bx = (B.x ?? 0.66) * W, by = L.surf + Math.sin(t * 2.2 + 1) * 6, rock = Math.sin(t * 1.6) * 2.5;
            boatG.setAttribute('transform', `rotate(${f1(rock)} ${f1(bx)} ${f1(by)})`);
            const hull = [[bx - 210, by - 40], [bx + 230, by - 46], [bx + 170, by + 34], [bx - 160, by + 34]];
            boatF.setAttribute('d', inkLoop(hull, { seed: sd + 100, t, smooth: false }));
            boatI.setAttribute('d', inkPath(hull, { seed: sd + 100, t, closed: true, w: 7, smooth: false }) + ' ' + inkPath([[bx - 190, by - 12], [bx + 200, by - 16]], { seed: sd + 101, t, w: 3 }) + ' ' +
              inkPath([[bx + 120, by - 44], [bx + 120, by - 300]], { seed: sd + 102, t, w: 8 }));
            const sail = [[bx + 126, by - 290], [bx + 126, by - 70], [bx + 250, by - 80]];
            sailF.setAttribute('d', inkLoop(sail, { seed: sd + 103, t, smooth: false }));
            sailI.setAttribute('d', inkPath(sail, { seed: sd + 103, t, closed: true, w: 5, smooth: false }));
          }
          // wreck: drawn in on cue
          const wa = atOr(cues, 'wreck', mode === 'dive' ? dur * 0.55 : -1), pw = mode === 'dive' ? spring(lt, wa, 0.9) : 1, hw = mode === 'dive' ? punch(lt, wa, 0.8) : 0;
          const wx = mode === 'dive' ? W * 0.5 : W * 0.5, k = P.wreck_scale ?? (mode === 'dive' ? 1.15 : 1.2);
          if (pw > 0.01) {
            const wp = wreckPaths(t, sd + 200, k, wx);
            wreckF.setAttribute('d', wp.fill); wreckF2.setAttribute('d', wp.fill2); wreckI.setAttribute('d', wp.ink); wreckS.setAttribute('d', wp.soft);
            const s = pw * (1 + hw * 0.08);
            wreckG.setAttribute('transform', `translate(${f1(wx)} ${f1(L.floor)}) scale(${s.toFixed(4)}) translate(${f1(-wx)} ${f1(-L.floor)})`);
            wreckG.style.display = '';
          } else wreckG.style.display = 'none';

          // diver
          const D = P.diver || {}, dX = (D.x ?? (mode === 'dive' ? 0.3 : 0.27)) * W;
          let dx = dX, dy, kneel = 0;
          if (mode === 'dive') {
            const u = progIO(lt, 0, Math.max(0.5, (wa > 0 ? wa : dur * 0.6) + 0.2));
            dy = lerp(L.surf + 120, L.floor - 90, u) + Math.sin(t * 1.8) * 6;
            dx = dX + Math.sin(t * 0.9) * 10;
          } else { dy = L.floor - 70 + Math.sin(t * 1.4) * 3; kneel = 1; }
          const reach = mode === 'floor' ? spring(lt, atOr(cues, 'find', dur * 0.5) - 0.4, 0.8) : 0;
          {
            const hx = dx, hy = dy - 90, sw = Math.sin(t * 2.4) * 8;
            let f = '', m = '', ink = '';
            // body suit
            const body = [[hx - 38, hy + 30], [hx + 38, hy + 30], [hx + 44, hy + 120], [hx - 44, hy + 120]];
            f += inkLoop(body, { seed: sd + 300, t }) + ' ';
            ink += inkPath(body, { seed: sd + 300, t, closed: true, w: 6 }) + ' ';
            // legs (kneeling on the floor in "floor")
            const lg = kneel ? [[[hx - 22, hy + 118], [hx - 60, hy + 150], [hx - 30, hy + 166]], [[hx + 22, hy + 118], [hx + 40, hy + 166], [hx + 80, hy + 168]]]
              : [[[hx - 20, hy + 118], [hx - 26 + sw, hy + 170], [hx - 30 + sw, hy + 214]], [[hx + 20, hy + 118], [hx + 26 - sw, hy + 170], [hx + 30 - sw, hy + 214]]];
            lg.forEach((l, i) => { ink += inkPath(l, { seed: sd + 310 + i, t, w: 22, amp: 1 }) + ' '; const e = l[2]; m += inkLoop(inkEllipsePts(e[0] + 8, e[1] + 4, 24, 12, seed + i), { seed: sd + 315 + i, t }) + ' '; });
            // arms: one holds the hose / reaches for the lump
            const lx = P.lump ? P.lump.x * W : W * 0.5;
            const arm2 = mode === 'floor' ? [[hx + 30, hy + 44], [lerp(hx + 70, lx - 60, reach * 0.6), lerp(hy + 80, L.floor - 40, reach * 0.6)], [lerp(hx + 90, lx - 30, reach), lerp(hy + 110, L.floor - 22, reach)]]
              : [[hx + 30, hy + 44], [hx + 70, hy + 30 + sw], [hx + 86, hy - 10 + sw]];
            ink += inkPath([[hx - 30, hy + 44], [hx - 64, hy + 80 - sw], [hx - 70, hy + 118 - sw]], { seed: sd + 320, t, w: 18 }) + ' ';
            ink += inkPath(arm2, { seed: sd + 321, t, w: 18 }) + ' ';
            // helmet (brass) with window and bolts
            m += inkLoop(circ(hx, hy, 46, 16), { seed: sd + 330, t }) + ' ';
            ink += inkPath(circ(hx, hy, 46, 16), { seed: sd + 330, t, closed: true, w: 6 }) + ' ';
            f += inkLoop(circ(hx + 8, hy + 2, 22, 12), { seed: sd + 331, t }) + ' ';
            ink += inkPath(circ(hx + 8, hy + 2, 22, 12), { seed: sd + 331, t, closed: true, w: 5 }) + ' ';
            ink += inkPath([[hx - 4, hy + 2], [hx + 20, hy + 2]], { seed: sd + 332, t, w: 3 }) + ' ' + inkPath([[hx + 8, hy - 18], [hx + 8, hy + 22]], { seed: sd + 333, t, w: 3 }) + ' ';
            const coll = [[hx - 48, hy + 26], [hx + 48, hy + 26], [hx + 44, hy + 44], [hx - 44, hy + 44]];
            m += inkLoop(coll, { seed: sd + 334, t, smooth: false }) + ' ';
            ink += inkPath(coll, { seed: sd + 334, t, closed: true, w: 5, smooth: false }) + ' ';
            diverF.setAttribute('d', f); diverM.setAttribute('d', m); diverI.setAttribute('d', ink);
            // hose to the boat (dive) or up out of frame (floor)
            const top = mode === 'dive' ? [((P.boat || {}).x ?? 0.66) * W - 120, L.surf - 20] : [hx - 140, -40];
            const hp = [[hx - 30, hy - 30], [lerp(hx, top[0], 0.3) - 60 + Math.sin(t) * 20, lerp(hy, top[1], 0.3)], [lerp(hx, top[0], 0.7) + 30, lerp(hy, top[1], 0.7)], top];
            hose.setAttribute('d', inkPath(hp, { seed: sd + 340, t, w: 7, amp: 1.2 }));
            // bubbles from the helmet (and from underwater cast)
            let bb = '', bi = '';
            const srcs = [[hx + 40, hy - 40]];
            (P.bubbles || []).forEach(ix => { const c = cast[ix]; if (c) srcs.push([(c.c.x ?? 0.8) * W + 20, (c.c.y ?? 0.6) * H - 560 * (c.c.scale ?? 0.5)]); });
            srcs.forEach(([sx, sy], s) => {
              for (let j = 0; j < 5; j++) {
                const ph = ((t * 0.55 + j / 5 + s * 0.13) % 1), y = sy - ph * 380, x = sx + Math.sin(ph * 9 + j) * 14, r = 6 + ph * 10;
                if (y < L.surf + 10) continue;
                bb += inkLoop(circ(x, y, r, 10), { seed: sd + 360 + j + s * 9, t, amp: 0.6 }) + ' ';
                bi += inkPath(circ(x, y, r, 10), { seed: sd + 360 + j + s * 9, t, closed: true, w: 3, amp: 0.6 }) + ' ';
              }
            });
            bubE.setAttribute('d', bb); bubI.setAttribute('d', bi);
          }
          // the lump (floor) + red circle on "find"
          if (mode === 'floor') {
            const lx = (P.lump ? P.lump.x : 0.5) * W, ly = L.floor - 22, fa = atOr(cues, 'find', dur * 0.5), pf = clamp01((lt - fa) / 0.7), hf = punch(lt, fa);
            const lp = inkEllipsePts(lx, ly, 62 * (1 + hf * 0.15), 40 * (1 + hf * 0.15), seed + 77, 11, 0.2, 0.16);
            lumpF.setAttribute('d', inkLoop(lp, { seed: sd + 400, t }));
            lumpV.setAttribute('d', inkDot(lx - 18, ly - 6, 18, 12, seed + 3, t) + ' ' + inkDot(lx + 24, ly + 8, 14, 9, seed + 4, t));
            lumpI.setAttribute('d', inkPath(lp, { seed: sd + 400, t, closed: true, w: 6 }) + ' ' + inkPath([[lx - 30, ly - 10], [lx, ly + 4], [lx + 20, ly - 14]], { seed: sd + 401, t, w: 3 }));
            if (lt >= fa) {
              const rp = []; const n = 30, a0 = -2.4;
              for (let i = 0; i <= Math.round(n * 1.12 * pf); i++) { const a = a0 + i / n * 6.2832, rr = 1 + i / n * 0.08; rp.push([lx + Math.cos(a) * 120 * rr, ly - 6 + Math.sin(a) * 82 * rr]); }
              ring.setAttribute('d', rp.length > 1 ? inkPath(rp, { seed: sd + 410, t, w: 9, amp: 1.2 }) : '');
            } else ring.setAttribute('d', '');
          } else { lumpF.setAttribute('d', ''); lumpV.setAttribute('d', ''); lumpI.setAttribute('d', ''); ring.setAttribute('d', ''); }

          if (label) {
            const Lb = label.Lb, at = atOr(cues, Lb.at, dur * 0.5), p = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? 0.2) * H;
            label.g.style.display = lt < at ? 'none' : '';
            label.tx.setAttribute('x', x); label.tx.setAttribute('y', y);
            const tw = label.tx.getComputedTextLength ? label.tx.getComputedTextLength() : 300;
            label.u.setAttribute('d', inkPath([[x - tw / 2, y + 18], [x + tw / 2, y + 12]], { seed: sd + 990, t, w: 6 }));
            label.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(-3) scale(${lerp(0.6, 1, p).toFixed(3)}) translate(${f1(-x)} ${f1(-y)})`);
          }
          cast.forEach(({ c, rig }) => {
            const at = atOr(cues, c.at, null);
            let x = (c.x ?? 0.8) * W, y = (c.y ?? 0.6) * H;
            if (mode === 'dive' && c.y == null) y = L.surf - 4;
            if (mode === 'dive' && c.ride) {          // stands in the boat: rock with it
              const B = P.boat || {}, bx = (B.x ?? 0.66) * W, by = L.surf + Math.sin(t * 2.2 + 1) * 6;
              y = by - 10; x = bx + (c.dx ?? -60);
            }
            const after = at != null && lt >= at, pose = after ? (c.then || 'shock') : (c.pose || 'idle');
            const since = after ? lt - at : lt, dir = typeof c.dir === 'number' ? c.dir : DIRS[c.dir] ?? 20;
            const emo = after ? (c.emotion || (pose === 'shock' ? 'surprised' : null)) : (c.emotion0 || null);
            const o = { x, y, face: c.face === 'left' ? -1 : 1, since, dir, emotion: emo };
            if (after && since < 0.32) { o.prev = { pose: c.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
            rig.update(t, pose, o);
          });
        },
      };
    },
  };
})();
