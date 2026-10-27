// sb_ships: longships at a river bank or a beach (brand/kit/BRAND.md §3, §5). Two uses in one parametric type:
//   "moored" (Riccall 1066): ships rock on the water behind a bank where mail shirts hang from a wooden pole rack
//     under a hot sun — the armour the army left behind; shirts can drop onto the rack one by one on cues.
//   "landing" (Pevensey 1066): ships with striped sails run in from the sea and ground on the beach; mailed
//     soldiers with kite shields step ashore; surf washes in.
// The scene's "set" (sea / coast, ground ≈ P.bank * H) gives sky and land; this draws the water band, ships and props.
// Uses sb__lib.js (SB) + mcB__lib.js (MCB.labels, MCB.sea).
// P.kasif.carry: {at: cue|s (lifts it), s: 0.7, dx, lift: 60, rot} — the host holds up a mail shirt.
// P: {water: 0.47 (top of the water band, 0..1 H), bank: 0.585 (near shore / feet line),
//     ships: [{x, y (waterline 0..1), s: 0.8, face: 1, sail: 1, stripes: "red"|"blue"|"gold", oars: false,
//              move: {at: cue|s, from (x), dur: 2.5}, beach: cue|s (tilts as it grounds)}],
//     rack: {x: 0.32, w: 0.42, h: 0.27} | false, byrnies: [{x (0..1), s: 1, rot, at: cue|s (drops in from above)}],
//     pile: {x, y, n} | false (mail shirts heaped on the ground), sun: {x, y, r} | false, heat: true,
//     warriors: [SB.warrior K], kasif: K | false, shields: [...], spears: [...], grass: [...], surf: false,
//     labels: [MCB label entries]}
// cues: hit, plus names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.sb_ships = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const SB = window.SB, MCB = window.MCB, atOr = SB.atOr, sd = seed * 1000 + 457;
      const WY = (P.water ?? 0.47) * H, BY = (P.bank ?? 0.585) * H;
      const root = el(svg, 'g');
      const sun = P.sun ? SB.sun(el(root, 'g'), sd + 1) : null;
      const sea = MCB.sea(el(root, 'g'), W, H, WY, sd + 5, { bottom: BY + 30, hatch: 16, amp: 6 });
      const ships = (P.ships || []).map((q, i) => ({ q, d: SB.longship(el(root, 'g'), sd + 20 + i) }));
      const surf = inkEl(root, INK.paperLight), surfR = inkEl(root, INK.blue);
      const bank = inkEl(root, INK.paperDark), bankR = inkEl(root), pebbles = inkEl(root, INK.inkSoft);
      const heat = SB.heat(el(root, 'g'), sd + 7);
      const rack = P.rack ? SB.rack(el(root, 'g'), sd + 9) : null;
      const shirts = (P.byrnies || []).map((q, i) => ({ q, d: SB.byrnie(el(root, 'g'), sd + 40 + i) }));
      const heap = P.pile ? Array.from({ length: P.pile.n ?? 3 }, (_, i) => SB.byrnie(el(root, 'g'), sd + 60 + i)) : [];
      const spears = (P.spears || []).map((q, i) => ({ q, d: SB.spear(el(root, 'g'), sd + 70 + i) }));
      const men = (P.warriors || []).map((K, i) => SB.warrior(el(root, 'g'), Object.assign({ y: P.bank ?? 0.585 }, K), sd + 80 + i * 7));
      const kas = P.kasif ? SB.warrior(el(root, 'g'), Object.assign({ who: 'kasif', y: P.bank ?? 0.585, scale: 0.7 }, P.kasif), sd + 150) : null;
      const carried = P.kasif && P.kasif.carry ? SB.byrnie(el(root, 'g'), sd + 155) : null;   // the host holds up a mail shirt
      const shields = (P.shields || []).map((q, i) => ({ q, d: SB.shield(el(root, 'g'), sd + 160 + i) }));
      const grass = SB.grass(el(root, 'g'), sd + 180, (P.grass || []).map(g => ({ x: g.x * W, y: g.y * H, s: g.s ?? 1, n: g.n })));
      const labels = MCB.labels(el(root, 'g'), P.labels || [], W, H, sd + 300);
      const r0 = rng(sd + 3), peb = Array.from({ length: 14 }, () => [r0(), r0(), r0()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          if (sun) { const S = P.sun; sun.update(t, (S.x ?? 0.8) * W, (S.y ?? 0.2) * H, (S.r ?? 70) * (1 + 0.1 * hit)); }
          sea.update(t);
          ships.forEach(({ q, d }) => {
            let x = q.x * W;
            if (q.move) { const a = atOr(cues, q.move.at, 0), u = progIO(lt, a, q.move.dur ?? 2.5); x = lerp((q.move.from ?? q.x) * W, q.x * W, u); }
            const ba = q.beach == null ? null : atOr(cues, q.beach, null), bp = ba == null ? 0 : progIO(lt, ba, 0.8);
            d.update(t, { x, y: (q.y ?? 0.5) * H - bp * 14, s: q.s ?? 0.8, face: q.face ?? 1, sail: q.sail ?? 1, stripes: q.stripes || 'red', oars: !!q.oars, rock: 1 - bp * 0.8, beached: bp * (q.face ?? 1) });
          });
          // near shore: a sand/earth band from the waterline edge down; wavy top line
          const top = []; for (let x = -40; x <= W + 40; x += 60) top.push([x, BY + Math.sin(x * 0.009 + 2) * 10]);
          bank.setAttribute('d', inkLoop(top.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 10, t, amp: 1, smooth: false }));
          bankR.setAttribute('d', inkPath(top, { w: 6, seed: sd + 11, t, amp: 1 }));
          let pd = '';
          peb.forEach((q, i) => { const x = q[0] * W, y = BY + 60 + q[1] * (H - BY - 80); pd += inkLoop(SB.ell(x, y, 10 + q[2] * 16, 6 + q[2] * 8, 8), { seed: sd + 12 + i, t, amp: 0.8 }) + ' '; });
          pebbles.setAttribute('d', pd);
          if (P.surf) {
            const u = (Math.sin(t * 1.3) + 1) / 2, y = BY - 6 + u * 26, sp = [];
            for (let x = -40; x <= W + 40; x += 50) sp.push([x, y + Math.sin(x * 0.03 + t * 2) * 8]);
            surf.setAttribute('d', inkLoop(sp.concat(sp.slice().reverse().map(p => [p[0], p[1] - 22])), { seed: sd + 13, t, amp: 1, smooth: false }));
            surfR.setAttribute('d', inkPath(sp, { w: 4, seed: sd + 14, t, amp: 1 }));
          }
          if (P.heat !== false && P.sun) heat.update(t, [0.2, 0.45, 0.7, 0.9].map((x, i) => ({ x: x * W, y: WY - 40 - (i % 2) * 60 })));
          if (rack) {
            const R = P.rack, x = (R.x ?? 0.32) * W, w = (R.w ?? 0.42) * W, h = (R.h ?? 0.27) * H;
            rack.update(t, { x, y: BY + 40, w, h });
            shirts.forEach(({ q, d }, i) => {
              const a = atOr(cues, q.at, 0), p = lt >= a ? spring(lt, a, 0.6) : 0;
              const yTop = BY + 40 - h - 20;
              d.update(t, { x: q.x * W, y: lerp(yTop - 500, yTop, p), s: q.s ?? 0.9, rot: q.rot ?? 0, sway: 1.5 + 4 * punch(lt, a + 0.4, 0.8) });
            });
          }
          heap.forEach((d, i) => { const Q = P.pile; d.update(t, { x: Q.x * W + (i - 1) * 120, y: Q.y * H - i * 30, s: Q.s ?? 0.7, rot: 90 + i * 30, sway: 0.5 }); });
          spears.forEach(({ q, d }) => d.update(t, { x: q.x * W, y: q.y * H, len: q.len ?? 420, rot: q.rot ?? 0 }));
          men.forEach(m => m.update(lt, t, cues, W, H));
          const kp = kas ? kas.update(lt, t, cues, W, H) : null;
          if (carried && kp) { const C = P.kasif.carry, a = atOr(cues, C.at, 0), u = lt < a ? 0 : spring(lt, a, 0.6); carried.update(t, { x: kp.hand[0] + (C.dx ?? -30), y: kp.hand[1] - 30 - u * (C.lift ?? 60), s: C.s ?? 0.7, rot: C.rot ?? -6, sway: 2 }); }
          shields.forEach(({ q, d }) => d.update(t, { x: q.x * W, y: q.y * H, r: q.r ?? 110, side: q.side, rot: q.rot ?? 0, tilt: q.tilt ?? 0.55, kind: q.kind }));
          grass.update(t);
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
