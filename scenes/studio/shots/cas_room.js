// cas_room: inside an Edo-period Japanese house at night (brand/kit/BRAND.md §3, §5). A shoji wall at the back with
// a giant wave rearing up behind its paper panels, a paper lantern hanging dead still (a dashed plumb
// line beside its cord shows it does not swing), a tea bowl on a tray with a perfectly flat surface; on "flood" sea
// water slides in under the shoji and spreads across the floor around the bowl, which never trembles.
// The room/floor wash comes from the scene's "set" (interior); the floor line is P.floor.
// Uses cas__lib.js (CAS) + td__lib.js (TD: label, figure).
// P: {floor: 0.58, wall_top: 0.04, shadow: {at, dur, h0: 0.5, h1: 0.85 (wave height, share of the wall)}, bowl: {x: 0.42, s: 1}, lantern: {x: 0.74, y: 0.3, s: 1}, shadow: {at: 0, dur: 2.5} | false,
//     flood: {at: cue|sec, dur: 1.4, depth: 46} | false, plumb: cue|sec|false (dashed still-line), kasif: K | false,
//     labels: [TD.label specs]}
// cues: hit (punch), plus names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.cas_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const CAS = window.CAS, TD = window.TD, atOr = CAS.atOr, ell = CAS.ell, sd = seed * 1000 + 523;
      const FL = (P.floor ?? 0.58) * H;
      const root = el(svg, 'g');
      const panels = inkEl(root, INK.paperLight), shadowE = inkEl(root, INK.blue, { 'fill-opacity': 0.4 }), shadowC = inkEl(root, INK.inkSoft);
      const swv = P.shadow === false ? null : CAS.wave(el(root, 'g'), sd + 7);
      const frame = inkEl(root), floorE = inkEl(root), boards = inkEl(root, INK.inkSoft);
      const trayF = inkEl(root, INK.hatBand, { 'fill-opacity': 0.55 }), trayR = inkEl(root);
      const bowlF = inkEl(root, INK.paperLight), bowlT = inkEl(root, INK.hatBand, { 'fill-opacity': 0.35 }), bowlR = inkEl(root);
      const tea = inkEl(root, INK.green, { 'fill-opacity': 0.7 }), teaR = inkEl(root), refl = inkEl(root, INK.gold);
      const flood = CAS.water(el(root, 'g'), sd + 5);   // in front of the tray: the sea laps round it
      const cord = inkEl(root), plumb = inkEl(root, INK.red), glow = inkEl(root, INK.gold, { 'fill-opacity': 0.22 });
      const lanF = inkEl(root, INK.paperLight), lanT = inkEl(root, INK.red, { 'fill-opacity': 0.3 }), lanR = inkEl(root), lanRib = inkEl(root, INK.inkSoft), flameE = inkEl(root, INK.gold);
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.85, y: P.floor ?? 0.58, scale: 0.7, pose: 'point', face: 'left' }, P.kasif), sd + 60) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 90 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          // shoji wall: frame + panels
          const sx0 = -20, sx1 = W + 20, sy0 = H * (P.wall_top ?? 0.04), sy1 = FL - 6;
          panels.setAttribute('d', inkLoop([[sx0, sy0], [sx1, sy0], [sx1, sy1], [sx0, sy1]], { seed: sd + 1, t, smooth: false }));
          let fr = inkPath([[sx0, sy0], [sx1, sy0]], { w: 14, seed: sd + 2, t }) + ' ';
          for (let k = 0; k <= 6; k++) { const x = lerp(0, W, k / 6); fr += inkPath([[x, sy0], [x, sy1]], { w: k % 3 === 0 ? 12 : 4, seed: sd + 3 + k, t, amp: 1 }) + ' '; }
          for (let k = 1; k < 6; k++) { const y = lerp(sy0, sy1, k / 6); fr += inkPath([[sx0, y], [sx1, y]], { w: 4, seed: sd + 12 + k, t, amp: 1 }) + ' '; }
          frame.setAttribute('d', fr);
          // the wave's moonlit shadow growing on the paper
          const SHd = P.shadow === false ? null : (P.shadow || {}), sa = SHd ? atOr(cues, SHd.at, 0) : 0, sp = SHd ? progIO(lt, sa, SHd.dur ?? 2.5) : 0;
          if (SHd && swv) {   // the wave itself, seen rearing up behind the paper wall
            const hh = (sy1 - sy0) * lerp(SHd.h0 ?? 0.5, SHd.h1 ?? 0.85, sp);
            swv.update(t, { x: lerp(W * 0.05, W * 0.32, sp), y: sy1 + 10, h: hh, back: W * 0.9, curl: lerp(0.4, 0.9, sp) });
          }
          // floor
          floorE.setAttribute('d', inkPath([[-20, FL], [W + 20, FL + 2]], { w: 8, seed: sd + 30, t }));
          let bd = '';
          for (let k = 0; k < 5; k++) { const y = FL + 40 + k * 46; bd += inkPath([[-20, y], [W + 20, y + 3]], { w: 3, seed: sd + 31 + k, t, amp: 1 }) + ' '; }
          boards.setAttribute('d', bd);
          const F = P.flood || null, fa = F ? atOr(cues, F.at, null) : null, fp = fa == null ? 0 : prog(lt, fa, F.dur ?? 1.4);
          // tray + bowl (never trembles: only the boil)
          const B = Object.assign({ x: 0.42, s: 1 }, P.bowl || {}), bx = B.x * W, bs = B.s * (1 + 0.04 * hit);
          const tray = [[bx - 230 * bs, FL - 4], [bx + 230 * bs, FL - 4], [bx + 210 * bs, FL - 34 * bs], [bx - 210 * bs, FL - 34 * bs]];
          trayF.setAttribute('d', inkLoop(tray, { seed: sd + 40, t, smooth: false }));
          trayR.setAttribute('d', inkPath(tray, { w: 6, seed: sd + 41, t, closed: true, smooth: false }));
          const by = FL - 34 * bs, rimY = by - 190 * bs, rw = 170 * bs;
          const bowl = [[bx - rw, rimY], [bx - rw * 0.97, rimY + 80 * bs], [bx - rw * 0.75, rimY + 150 * bs], [bx - rw * 0.4, by - 6], [bx + rw * 0.4, by - 6], [bx + rw * 0.75, rimY + 150 * bs], [bx + rw * 0.97, rimY + 80 * bs], [bx + rw, rimY]];
          bowlF.setAttribute('d', inkLoop(bowl, { seed: sd + 42, t }));
          bowlT.setAttribute('d', inkLoop([[bx - rw * 0.98, rimY + 60 * bs], [bx + rw * 0.98, rimY + 60 * bs], [bx + rw * 0.8, rimY + 140 * bs], [bx + rw * 0.4, by - 8], [bx - rw * 0.4, by - 8], [bx - rw * 0.8, rimY + 140 * bs]], { seed: sd + 43, t }));
          bowlR.setAttribute('d', inkPath(bowl, { w: 7, seed: sd + 44, t }) + ' ' + inkPath([[bx - rw * 0.45, by - 6], [bx - rw * 0.4, by + 6], [bx + rw * 0.4, by + 6], [bx + rw * 0.45, by - 6]], { w: 6, seed: sd + 45, t, smooth: false }));
          const te = ell(bx, rimY, rw, 34 * bs, 18);
          tea.setAttribute('d', inkLoop(te, { seed: sd + 46, t, amp: 0.4 }));
          teaR.setAttribute('d', inkPath(te, { w: 6, seed: sd + 47, t, closed: true, amp: 0.4 }));
          refl.setAttribute('d', inkDot(bx + rw * 0.35, rimY - 4, 22 * bs, 8 * bs, sd + 48, t, 0.3));
          flood.update(t, -40, W + 40, FL + (F ? (F.base ?? 36) : 36), F ? (F.depth ?? 46) : 0, fp);
          // lantern: hangs dead still
          const L = Object.assign({ x: 0.74, y: 0.3, s: 1 }, P.lantern || {}), lx = L.x * W, ly = L.y * H, ls = L.s;
          cord.setAttribute('d', inkPath([[lx, sy0], [lx, ly - 150 * ls]], { w: 4, seed: sd + 50, t, amp: 0.6 }));
          const pa = P.plumb == null || P.plumb === false ? null : atOr(cues, P.plumb, null), pp = pa == null ? 0 : prog(lt, pa, 0.5);
          let pd = '';
          if (pp > 0.01) for (let k = 0; k < 12 * pp; k++) { const y = sy0 + 30 + k * 60; pd += inkPath([[lx + 150 * ls, y], [lx + 150 * ls, y + 30]], { w: 5, seed: sd + 51 + k, t, amp: 0.6 }) + ' '; }
          plumb.setAttribute('d', pd);
          const fl = 1 + 0.08 * Math.sin(t * 11) + 0.05 * Math.sin(t * 17);
          glow.setAttribute('d', inkCircle(lx, ly, 230 * ls * fl, sd + 52, t, { fill: true, amp: 2 }));
          const lan = ell(lx, ly, 100 * ls, 140 * ls, 18);
          lanF.setAttribute('d', inkLoop(lan, { seed: sd + 53, t }));
          lanT.setAttribute('d', inkLoop(ell(lx, ly + 10 * ls, 62 * ls * fl, 90 * ls * fl, 14), { seed: sd + 54, t }));
          let rb = '';
          for (let k = -4; k <= 4; k++) { const y = ly + k * 28 * ls, hw = 100 * ls * Math.sqrt(Math.max(0, 1 - (k * 28 / 140) ** 2)); rb += inkPath([[lx - hw, y], [lx + hw, y]], { w: 3, seed: sd + 60 + k, t, amp: 0.8 }) + ' '; }
          lanRib.setAttribute('d', rb);
          lanR.setAttribute('d', inkPath(lan, { w: 6, seed: sd + 70, t, closed: true }) + ' ' +
            inkPath([[lx - 50 * ls, ly - 140 * ls], [lx + 50 * ls, ly - 140 * ls]], { w: 16, seed: sd + 71, t }) + ' ' + inkPath([[lx - 50 * ls, ly + 140 * ls], [lx + 50 * ls, ly + 140 * ls]], { w: 16, seed: sd + 72, t }));
          flameE.setAttribute('d', inkLoop([[lx - 14 * ls, ly + 30 * ls], [lx, ly - (30 + 10 * Math.sin(t * 13)) * ls], [lx + 14 * ls, ly + 30 * ls]], { seed: sd + 73, t, amp: 1 }));
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
