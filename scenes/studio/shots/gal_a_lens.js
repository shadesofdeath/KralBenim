// gal_a_lens: the view through Galileo's spyglass (02-galileo-teleskop): a big round field with a brass ring (GAL.lens)
// set in a frame-filling dark-paper surround (radial hatching like the inside of a tube). Inside: the Moon (smooth pearl
// -> cratered real Moon on a cue), a ship on the horizon, or Jupiter with its "stars". Optional small naked-eye circle
// beside it (same view, the ship only a dot), labels and the narrator on a strip of floor. Use with "set": false.
// P: {lens: {x: 0.5, y: 0.47, r: 0.4 (of H)}, view: "moon" | "ship" | "jupiter",
//     moon: {r: 0.32 (of H), term: 0, rough0: rough, rough: 1, at: cue (rough0 -> rough over 1.4 s)},
//     ship: {at: cue (sails in), s: 0.9, flag: "red"}, naked: {x, y, r (0..1 / of H), text: "çıplak göz"},
//     jupiter: {r: 50, moons: [{dx (px), dy, at: cue}]}, labels: [GAL.label], kasif: GAL.person}
// cues: moon.at, ship.at, jupiter moons[].at, label / person cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.gal_a_lens = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 21;
      const L = Object.assign({ x: 0.5, y: 0.47, r: 0.4 }, P.lens || {});
      const cx = L.x * W, cy = L.y * H, R = L.r * H, view = P.view || 'moon';
      const root = el(svg, 'g');
      const sur = inkEl(root, mix(INK.paperDark, INK.inkSoft, 0.38)), surH = inkEl(root, INK.ink, { 'fill-opacity': 0.35 });
      const flF = P.kasif ? inkEl(root, mix(INK.stain, INK.paperDark, 0.4)) : null, flL = P.kasif ? inkEl(root, INK.inkSoft) : null;
      const nk = P.naked && view === 'ship' ? P.naked : null;
      const nkLens = nk ? G.lens(root, defs, sd + 70) : null;
      const lens = G.lens(root, defs, sd + 1);
      const V = lens.view;
      // view contents
      const skyF = inkEl(V, view === 'ship' ? mix(INK.paperLight, INK.blue, 0.18) : mix(INK.ink, INK.blue, 0.3));
      const stars = view !== 'ship' ? G.stars(V, sd + 2, 30) : null;
      const moon = view === 'moon' ? G.moon(V, sd + 3) : null;
      const jup = view === 'jupiter' ? G.jupiter(V, sd + 4) : null;
      const seaF = view === 'ship' ? inkEl(V, mix(INK.blue, INK.paperDark, 0.45)) : null, seaL = view === 'ship' ? inkEl(V, INK.inkSoft) : null;
      const ship = view === 'ship' ? G.ship(V, sd + 5) : null;
      let nkSea = null, nkDot = null;
      if (nkLens) { nkSea = inkEl(nkLens.view, mix(INK.blue, INK.paperDark, 0.45)); nkDot = inkEl(nkLens.view, INK.ink); }
      const nkLab = nk ? G.label(root, { text: nk.text || 'çıplak göz', x: nk.x, y: nk.y + nk.r + 0.12, at: 0, size: 54 }, W, H, sd + 71) : null;
      const kas = P.kasif ? G.person(root, Object.assign({ who: 'kasif', y: 0.86 }, P.kasif), sd + 30) : null;
      const labels = (P.labels || []).map((l, i) => G.label(root, l, W, H, sd + 40 + i));
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          // surround: dark paper with radial hatching toward the ring
          sur.setAttribute('d', inkLoop([[-40, -40], [W + 40, -40], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 6, t, amp: 0.4, smooth: false }));
          let hh = '';
          for (let i = 0; i < 48; i++) {
            const a = i / 48 * Math.PI * 2 + 0.03 * Math.sin(t * 0.5 + i), r0 = R * 1.14, r1 = R * (1.5 + (i % 3) * 0.35);
            hh += G.line([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], sd + 100 + i, t, 2.4, 0.6) + ' ';
          }
          for (let k = 0; k < 3; k++) hh += inkCircle(cx, cy, R * (1.22 + k * 0.16 + 0.01 * Math.sin(t + k)), sd + 160 + k, t, { w: 2.6 }) + ' ';
          surH.setAttribute('d', hh);
          if (flF) {
            const fy = 0.86 * H;
            flF.setAttribute('d', inkLoop([[-40, fy], [W + 40, fy], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 7, t, amp: 0.4, smooth: false }));
            let fl = G.line([[-40, fy], [W + 40, fy + 2]], sd + 8, t, 6) + ' ';
            for (let k = -10; k <= 10; k++) fl += G.line([[W / 2 + k * 110, fy], [W / 2 + k * 220, H + 40]], sd + 9 + k, t, 2.2) + ' ';
            flL.setAttribute('d', fl);
          }
          const drift = [Math.sin(t * 0.3) * 6, Math.cos(t * 0.23) * 4];
          lens.update(t, cx, cy, R, { k: clamp01(lt / 0.5) });
          skyF.setAttribute('d', inkLoop(inkEllipsePts(cx, cy, R * 1.05, R * 1.05, sd + 10, 20), { seed: sd + 10, t, amp: 0.4 }));
          if (stars) stars.update(t, cx - R, cy - R, cx + R, cy + R, 1);
          if (moon) {
            const M = P.moon || {}, a = G.atOr(cues, M.at, null), r1 = M.rough ?? 1, r0 = M.rough0 ?? r1, t1 = M.term ?? 0, t0 = M.term0 ?? t1;
            const k = a == null ? 1 : progIO(lt, a, 1.4), hit = punch(lt, a, 0.6);
            moon.update(t, { x: cx + drift[0], y: cy + drift[1], r: (M.r ?? 0.32) * H * (1 + hit * 0.05), term: lerp(t0, t1, k), rough: lerp(r0, r1, k), halo: false, spin: 0.4 });
          }
          if (jup) {
            const J = P.jupiter || {};
            jup.update(t, { x: cx + drift[0], y: cy + drift[1], r: J.r ?? 50, moons: (J.moons || []).map(m => { const a = G.atOr(cues, m.at, 0); return { dx: m.dx, dy: m.dy ?? 0, r: m.r ?? 11, k: lt < a ? 0 : clamp01((lt - a) / 0.5) }; }) });
          }
          if (ship) {
            const S = P.ship || {}, hy = cy + R * 0.12, a = G.atOr(cues, S.at, 0), k = spring(lt, a, 0.9);
            seaF.setAttribute('d', inkLoop([[cx - R * 1.1, hy], [cx + R * 1.1, hy], [cx + R * 1.1, cy + R * 1.1], [cx - R * 1.1, cy + R * 1.1]], { seed: sd + 11, t, amp: 0.4, smooth: false }));
            let wv = G.line([[cx - R, hy], [cx + R, hy]], sd + 12, t, 4) + ' ';
            for (let i = 0; i < 6; i++) { const y = hy + 40 + i * 48, o = (t * 40 + i * 70) % 160; for (let x = cx - R - 160 + o; x < cx + R; x += 160) wv += G.line([[x, y], [x + 40, y - 10], [x + 80, y]], sd + 20 + i * 13 + Math.floor(x), t, 2.6) + ' '; }
            seaL.setAttribute('d', wv);
            ship.update(t, cx + lerp(R * 0.5, 0, prog(lt, a, 2.2)), hy + 6, (S.s ?? 0.9) * Math.max(0.01, k), -1, { flag: S.flag });
          }
          if (nkLens) {
            const nx = nk.x * W, ny = nk.y * H, nr = nk.r * H;
            nkLens.update(t, nx, ny, nr, { dark: false, ticks: false });
            nkSea.setAttribute('d', inkLoop([[nx - nr, ny + nr * 0.12], [nx + nr, ny + nr * 0.12], [nx + nr, ny + nr], [nx - nr, ny + nr]], { seed: sd + 72, t, amp: 0.3, smooth: false }));
            nkDot.setAttribute('d', inkDot(nx + Math.sin(t) * 2, ny + nr * 0.1, 4, 3, sd + 73, t) + ' ' + G.line([[nx - nr, ny + nr * 0.12], [nx + nr, ny + nr * 0.12]], sd + 74, t, 3));
            nkLab.update(lt, t, cues);
          }
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
