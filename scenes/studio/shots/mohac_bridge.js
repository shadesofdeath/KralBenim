// mohac_bridge: an army crossing a wide river on a bridge of boats (14-mohac-1526, the Drava at Ösek/Osijek), seen from
// the near bank: moored boats under a plank deck run from the bottom-left corner to the far shore in perspective, a
// steady column of foot, riders and camels marches across (small in the distance), banners on the near bank, and on
// the far shore a few enemy riders turn back. The scene's "set" ("sea": water from the horizon to the near bank)
// paints the river; this shot draws the far shore line, the bridge and the people.
// P: {from: [300, 1080], to: [1280, 590] (bridge ends, stage px), boats: 11, flow: 1 (column speed), horizon: 560,
//     retreat: cue (far-bank riders turn and ride off), near: true (big foreground soldiers stepping onto the bridge),
//     banners: true, cast: [MCB cast]}
// cues: retreat, cast cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_bridge = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const A = P.from || [260, 1080], B = P.to || [1280, 590], HY = P.horizon ?? 560;
      const root = el(svg, 'g');
      const farG = el(root, 'g'), boatG = el(root, 'g'), deckG = el(root, 'g'), crowdG = el(root, 'g'), nearG = el(root, 'g'), castG = el(root, 'g');
      const shoreF = inkEl(farG, mix(INK.paperLight, INK.green, 0.3)), shoreL = inkEl(farG, INK.inkSoft), trees = inkEl(farG, INK.inkSoft);
      const hullF = inkEl(boatG, INK.stain), hullL = inkEl(boatG, INK.ink), wake = inkEl(boatG, INK.blue);
      const deckF = inkEl(deckG, mix(INK.paperLight, INK.stain, 0.45)), deckL = inkEl(deckG, INK.ink), plank = inkEl(deckG, INK.inkSoft);
      const crowdF = inkEl(crowdG, INK.blue), crowdL = inkEl(crowdG, INK.ink);
      const enemyF = inkEl(farG, INK.red), enemyL = inkEl(farG, INK.inkSoft);
      const nearSoldiers = P.near !== false ? [0, 1].map(k => M.soldier(nearG, { hat: k ? 'turban' : 'bork', side: 'ot', pike: !!k, seed: seed * 20 + k })) : [];
      const banners = P.banners !== false ? [0, 1, 2].map(k => M.banner(nearG, { side: 'ot', seed: seed * 30 + k, tail: true })) : [];
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;
      // depth along the bridge: u 0 (near) .. 1 (far); perspective spacing (near boats far apart)
      const ease = u => 1 - Math.pow(1 - u, 1.6);
      const at = u => [lerp(A[0], B[0], ease(u)), lerp(A[1], B[1], ease(u))];
      const scale = u => lerp(1.25, 0.22, ease(u));

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          // far shore: a low green strip with a tree line
          const sh = [[-60, HY + 6], [-60, HY - 60], [500, HY - 74], [1100, HY - 52], [1700, HY - 80], [W + 60, HY - 62], [W + 60, HY + 6]];
          shoreF.setAttribute('d', inkLoop(sh, { seed: seed + 1, t, amp: 0.6 }));
          shoreL.setAttribute('d', inkPath(sh.slice(0, 6).map(p => [p[0], HY + 6]), { w: 3, seed: seed + 2, t }));
          let td = '';
          for (let i = 0; i < 26; i++) { const q = rng(inkHash(seed, i + 20)); const x = q() * W, y = HY - 50 - q() * 14, r = 28 + q() * 26; td += inkPath(inkEllipsePts(x, y - r, r, r * 1.2, seed + 30 + i, 9), { w: 2.4, seed: seed + 60 + i, t, closed: true }) + inkPath([[x, y], [x, y + 10]], { w: 2.4, seed: seed + 90 + i, t }); }
          trees.setAttribute('d', td);
          // boats + deck
          const n = P.boats ?? 11;
          let hf = '', hl = '', wk = '';
          for (let k = n - 1; k >= 0; k--) {
            const u = k / (n - 1), c = at(u), s = scale(u), bob = Math.sin(t * 1.6 + k * 0.9) * 3 * s;
            const hw = 120 * s, hh = 34 * s, y = c[1] + 18 * s + bob;
            const hull = [[c[0] - hw, y - hh * 0.4], [c[0] - hw * 0.7, y + hh * 0.5], [c[0] + hw * 0.7, y + hh * 0.5], [c[0] + hw, y - hh * 0.4]];
            hf += inkLoop(hull, { seed: seed + 100 + k, t, amp: 0.7 });
            hl += inkPath(hull.concat([hull[0]]), { w: Math.max(2, 5 * s), seed: seed + 120 + k, t, amp: 0.7 });
            wk += inkPath([[c[0] - hw * 1.2 - 20 * s * Math.sin(t + k), y + hh * 0.6], [c[0] - hw * 0.4, y + hh * 0.75]], { w: Math.max(1.5, 3.5 * s), seed: seed + 140 + k, t })
              + inkPath([[c[0] + hw * 0.4, y + hh * 0.75], [c[0] + hw * 1.2, y + hh * 0.6]], { w: Math.max(1.5, 3.5 * s), seed: seed + 160 + k, t });
          }
          hullF.setAttribute('d', hf); hullL.setAttribute('d', hl); wake.setAttribute('d', wk);
          const L = [], R = [];
          for (let k = 0; k <= 30; k++) { const u = k / 30, c = at(u), s = scale(u); L.push([c[0] - 95 * s, c[1]]); R.push([c[0] + 95 * s, c[1] + 6 * s]); }
          deckF.setAttribute('d', inkLoop(L.concat(R.slice().reverse()), { seed: seed + 3, t, amp: 0.6, smooth: false }));
          deckL.setAttribute('d', inkPath(L, { w: 4, seed: seed + 4, t }) + inkPath(R, { w: 5, seed: seed + 5, t }));
          let pd = '';
          for (let k = 0; k < 40; k++) { const u = k / 40, c = at(u), s = scale(u); pd += inkPath([[c[0] - 90 * s, c[1] - 1], [c[0] + 90 * s, c[1] + 5 * s]], { w: Math.max(1.2, 2.6 * s), seed: seed + 200 + k, t, amp: 0.5 }); }
          plank.setAttribute('d', pd);
          // the column: a steady stream of figures from near to far
          const flow = P.flow ?? 1, N = 26, items = [];
          for (let k = 0; k < N; k++) {
            const q = rng(inkHash(seed + 400, k)), u = ((k / N + lt * 0.035 * flow) % 1);
            const c = at(u), s = scale(u) * 0.85, lane = (q() - 0.5) * 100 * scale(u);
            const kind = k % 7 === 3 ? 'camel' : k % 3 === 1 ? 'cav' : 'inf';
            items.push([c[0] + lane, c[1] + 4 * s + Math.abs(Math.sin(t * 7 + k)) * -3 * s, s, kind, k]);
          }
          items.sort((a, b) => a[1] - b[1]);
          let cf = '', cl = '';
          items.forEach(([x, y, s, kind, k]) => { const g = M.glyph(kind, x, y, s, seed * 50 + k, t, 1); cf += g.f; cl += g.l; });
          crowdF.setAttribute('d', cf); crowdL.setAttribute('d', cl);
          // enemy riders on the far shore, turning back on "retreat"
          const ra = atOr(cues, P.retreat, null), rt = ra == null ? 0 : Math.max(0, lt - ra);
          let ef = '', el2 = '';
          for (let k = 0; k < 6; k++) {
            const q = rng(inkHash(seed + 500, k)), x = 1420 + k * 70 + q() * 20 + rt * (60 + q() * 30), y = HY - 8 + (k % 2) * 6, s = 0.28;
            const g = M.glyph('cav', x, y, s, seed * 60 + k, t, rt > 0 ? 1 : -1); ef += g.f; el2 += g.l;
          }
          enemyF.setAttribute('d', ef); enemyL.setAttribute('d', el2);
          // near bank: banners and two big soldiers stepping onto the bridge
          banners.forEach((b, k) => b.update(t, { x: 80 + k * 150, y: 1100 - k * 20, h: 420 - k * 50, w: 180 - k * 20, face: 1, sw: 7 }));
          nearSoldiers.forEach((sd, k) => {
            const ph = (lt * 0.12 + k * 0.4) % 1, u = ph * 0.18, c = at(u);
            sd.update(t, { x: c[0] - 40 + k * 70, y: c[1] + 6, s: scale(u) * 1.05, face: 1, aim: 0, kneel: 0 });
          });
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
