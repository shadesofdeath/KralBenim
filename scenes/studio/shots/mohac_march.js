// mohac_march: the Ottoman army on the road, at ground level (14-mohac-1526): a road runs from the horizon straight at
// the camera and a column of janissaries, riders and camels marches down it towards us, growing from tiny to life
// size; a big banner bearer and a janissary walk in the foreground; a wooden signpost by the road points the way.
// The scene's "set" (hills/field, ground ≈ 1060, horizon ≈ 470) paints the land; this draws the road and the people.
// P: {horizon: 470, speed: 0.05 (depth per second), n: 22, sign: {text: "Budin", at, x: 1500}, banner: true,
//     front: true (foreground janissary), cast: [MCB cast]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_march = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const HY = P.horizon ?? 470, VX = P.vx ?? 900;
      const root = el(svg, 'g');
      const roadG = el(root, 'g'), colG = el(root, 'g'), signG = el(root, 'g'), frontG = el(root, 'g'), castG = el(root, 'g');
      const roadF = inkEl(roadG, mix(INK.paperLight, INK.stain, 0.4)), roadL = inkEl(roadG, INK.ink), ruts = inkEl(roadG, INK.inkSoft), dustF = inkEl(roadG, INK.paperDark, { 'fill-opacity': 0.5 });
      const N = P.n ?? 22;
      const slots = Array.from({ length: N }, (_, k) => {
        const g = el(colG, 'g'), q = rng(inkHash(seed + 10, k));
        const kind = k % 6 === 2 ? 'rider' : 'foot';
        const fig = kind === 'rider' ? M.rider(g, { side: 'ot', head: 'turban', barding: false, lance: false, seed: seed * 40 + k })
          : M.soldier(g, { hat: k % 3 ? 'bork' : 'turban', side: 'ot', pike: k % 5 === 1, seed: seed * 40 + k });
        return { g, k, kind, fig, lane: (q() - 0.5) * 1.6, off: q() };
      });
      const signPost = inkEl(signG, INK.ink), signF = inkEl(signG, INK.paperLight), signL = inkEl(signG, INK.ink);
      const S = P.sign ? Object.assign({ text: 'Budin', x: 1480 }, P.sign) : null;
      const signT = S ? el(signG, 'text', { 'font-family': INK_FONT, 'font-size': 72, 'text-anchor': 'middle', fill: INK.red }) : null;
      if (signT) signT.textContent = S.text;
      const ban = P.banner !== false ? M.banner(frontG, { side: 'ot', seed: seed * 70, tail: true }) : null;
      const front = P.front !== false ? M.soldier(frontG, { hat: 'bork', side: 'ot', seed: seed * 71 }) : null;
      const front2 = P.front !== false ? M.soldier(frontG, { hat: 'turban', side: 'ot', pike: true, seed: seed * 72 }) : null;
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;
      const depth = u => Math.pow(u, 1.7);
      const at = (u, lane) => { const d = depth(u); return [VX + lane * lerp(30, 900, d), lerp(HY + 6, H + 140, d), lerp(0.08, 1.7, d)]; };

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const L = [], R = [];
          for (let k = 0; k <= 16; k++) { const u = k / 16, d = depth(u), y = lerp(HY + 4, H + 160, d), hw = lerp(16, 1100, d); L.push([VX - hw, y]); R.push([VX + hw, y]); }
          roadF.setAttribute('d', inkLoop(L.concat(R.slice().reverse()), { seed: seed + 1, t, amp: 0.8 }));
          roadL.setAttribute('d', inkPath(L, { w: 5, seed: seed + 2, t }) + inkPath(R, { w: 5, seed: seed + 3, t }));
          let rd = '';
          for (const lane of [-0.35, 0.35]) { const pts = []; for (let k = 0; k <= 12; k++) { const p = at(k / 12, lane); pts.push([p[0], p[1]]); } rd += inkPath(pts, { w: 3, seed: seed + 4 + lane * 10, t }); }
          ruts.setAttribute('d', rd);
          let dd = '';
          for (let k = 0; k < 6; k++) { const q = rng(inkHash(seed + 20, k)), u = ((q() + lt * 0.04) % 1) * 0.7, p = at(u, (q() - 0.5) * 1.4); dd += M.puff(p[0], p[1] - 30 * p[2], 60 * p[2] + 10, seed + 30 + k, t); }
          dustF.setAttribute('d', dd);
          // the column: depth u grows with time, wrapping at the near edge
          const sp = P.speed ?? 0.05, list = slots.map(s => { const u = ((s.k / N) + s.off * 0.02 + lt * sp) % 1; return { s, u }; }).sort((a, b) => a.u - b.u);
          list.forEach(({ s, u }) => {
            colG.appendChild(s.g);
            const p = at(u, s.lane), sc = p[2];
            if (p[1] > H + 120) { s.g.style.display = 'none'; return; }
            s.g.style.display = '';
            if (s.kind === 'rider') s.fig.update(t, { x: p[0], y: p[1], s: sc * 0.62, face: s.lane > 0 ? -1 : 1, ph: lt * 1.3 + s.off, gallop: 0.35, couch: 0, soft: sc < 0.3 });
            else s.fig.update(t, { x: p[0], y: p[1], s: sc * 0.75, face: s.lane > 0 ? -1 : 1, aim: 0, walk: lt * 1.2 + s.off, soft: sc < 0.3 });
          });
          // signpost by the road
          if (S) {
            const sa = atOr(cues, S.at, 0.3), pr = spring(lt, sa, 0.6), x = S.x, gy = H * 0.86, top = gy - 360 * Math.max(0.01, pr);
            signPost.setAttribute('d', inkPath([[x, gy], [x, top]], { w: 12, seed: seed + 40, t }));
            const bw = 300, by = top + 20, board = [[x - 40, by], [x + bw - 40, by], [x + bw + 30, by + 55], [x + bw - 40, by + 110], [x - 40, by + 110]];
            signF.setAttribute('d', lt >= sa ? inkLoop(board, { seed: seed + 41, t, amp: 0.8, smooth: false }) : '');
            signL.setAttribute('d', lt >= sa ? inkPath(board, { w: 6, seed: seed + 42, t, closed: true, smooth: false }) : '');
            signT.setAttribute('x', f1(x + bw / 2 - 20)); signT.setAttribute('y', f1(by + 80)); signT.style.display = lt >= sa ? '' : 'none';
          }
          if (ban) ban.update(t, { x: 230, y: H + 40, h: 760, w: 300, face: 1, sw: 9 });
          if (front) front.update(t, { x: 360, y: H + 30, s: 2.2, face: 1, aim: 0, walk: lt * 1.1 });
          if (front2) front2.update(t, { x: 120, y: H + 60, s: 2.4, face: 1, aim: 0, walk: lt * 1.1 + 0.5 });
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
