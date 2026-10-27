// tank_bells: an English parish church tower ringing its bells for a victory, parchment ink (BRAND.md §3, §5; the
// "city"/"hills" set gives the village behind). Stone tower with coursed blocks, a clock face, battlements and corner
// pinnacles, two belfry arches with bells swinging on their headstocks (clappers lagging), sound arcs rolling out,
// birds bursting off the roof, and a cheering crowd at the foot (bb__lib cast + helmet "top"|"flat"|"cap").
// P: {x: 0.5, ground: 0.86, w: 300, top: 0.08, ring: cue (bells start swinging; before it they hang still),
//     birds: cue, cast: [...], labels: [...]}
// cues: ring, birds, labels, cast, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tank_bells = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 683;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const cx = (P.x ?? 0.42) * W, gy = (P.ground ?? 0.86) * H, tw = P.w ?? 300, top = (P.top ?? 0.34) * H;
      const lay = { towerF: L(INK.paperLight), towerS: L(INK.inkSoft), towerI: L(INK.ink), arch: L(INK.ink, { 'fill-opacity': 0.8 }), bellF: L(INK.gold), bellI: L(INK.ink),
        clockF: L(INK.paperLight), clockI: L(INK.ink), sound: L(INK.ink), soundG: L(INK.gold), birds: L(INK.ink) };
      const castG = el(cam, 'g'), capF = L(INK.inkSoft), capI = L(INK.ink);
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      const x0 = cx - tw / 2, x1 = cx + tw / 2, by0 = top + 120, by1 = top + 300;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.1, w: 5 }, extra || {});
          // tower body with battlements + pinnacles
          const body = [[x0 - 20, gy], [x0, top + 60], [x1, top + 60], [x1 + 20, gy]];
          
          const TI = [inkPath(body, o(2, { smooth: false, w: 7 }))], TS = [];
          // pointed spire on the tower
          const spire = [[x0 - 24, top + 64], [cx, top - 270], [x1 + 24, top + 64]];
          lay.clockF.setAttribute('d', '');
          TI.push(inkPath(spire.concat([spire[0]]), o(3, { smooth: false, w: 7 })), inkPath([[cx, top - 270], [cx, top - 330]], o(6, { w: 6 })), inkPath([[cx - 24, top - 306], [cx + 24, top - 306]], o(7, { w: 6 })));
          for (let k = 1; k < 6; k++) { const yy = lerp(top - 270, top + 64, k / 6), hw2 = lerp(0, tw / 2 + 24, k / 6); TS.push(inkPath([[cx - hw2, yy], [cx + hw2, yy]], o(8 + k, { w: 2.4, amp: 0.6 }))); }
          // church nave beside the tower: pitched roof, arched windows
          const nx0 = x1 + 10, nx1 = x1 + 560, nh = 250, nave = [[nx0, gy], [nx0, gy - nh], [nx0 + 30, gy - nh - 150], [nx1 - 30, gy - nh - 150], [nx1, gy - nh], [nx1, gy]];
          lay.towerF.setAttribute('d', inkLoop(body, o(1, { smooth: false })) + ' ' + inkLoop(nave, o(90, { smooth: false })) + ' ' + inkLoop(spire, o(5, { smooth: false })));
          TI.push(inkPath(nave, o(91, { smooth: false, w: 6 })), inkPath([[nx0, gy - nh], [nx1, gy - nh]], o(92, { w: 4 })));
          for (let k = 0; k < 4; k++) { const wx = lerp(nx0 + 80, nx1 - 80, k / 3); TI.push(inkPath([[wx - 26, gy - 60], [wx - 26, gy - 170], [wx, gy - 200], [wx + 26, gy - 170], [wx + 26, gy - 60]], o(93 + k, { w: 5 }))); }
          for (let k = 0; k < 7; k++) TS.push(inkPath([[nx0 + 40 + k * 70, gy - nh - 140], [nx0 + 10 + k * 76, gy - nh - 6]], o(100 + k, { w: 2.2 })));
          for (let y = top + 90, r = 0; y < gy; y += 42, r++) { TS.push(inkPath([[x0 + 4 - (y - top) * 0.02, y], [x1 - 4 + (y - top) * 0.02, y]], o(10 + r, { w: 2.2, amp: 0.6 })));
            for (let xx = x0 + (r % 2 ? 30 : 60); xx < x1 - 10; xx += 70) TS.push(inkPath([[xx, y], [xx, y + 42]], o(40 + r * 7 + Math.round(xx), { w: 2, amp: 0.5 }))); }
          lay.towerS.setAttribute('d', TS.join(' '));
          // belfry arches (dark) + bells
          const AR = [], BF = [], BI = [];
          const ra = P.ring != null ? at(P.ring, 0.3) : 0.3;
          [[cx - tw * 0.22], [cx + tw * 0.22]].forEach(([ax], k) => {
            const aw = tw * 0.32, arch = [[ax - aw / 2, by1], [ax - aw / 2, by0 + aw / 2], [ax - aw * 0.35, by0 + aw * 0.12], [ax, by0], [ax + aw * 0.35, by0 + aw * 0.12], [ax + aw / 2, by0 + aw / 2], [ax + aw / 2, by1]];
            AR.push(inkLoop(arch, o(60 + k)));
            TI.push(inkPath(arch, o(62 + k, { w: 5 })));
            const amp = lt < ra ? 0 : Math.min(1, (lt - ra) / 0.8) * 1.0, sw = Math.sin((lt - ra) * 3.4 + k * Math.PI) * amp;   // radians
            const pv = [ax, by0 + 40], R = 70;
            const rot = (p, a) => [pv[0] + (p[0] - pv[0]) * Math.cos(a) - (p[1] - pv[1]) * Math.sin(a), pv[1] + (p[0] - pv[0]) * Math.sin(a) + (p[1] - pv[1]) * Math.cos(a)];
            const bell = [[ax - 20, pv[1] + 6], [ax + 20, pv[1] + 6], [ax + 34, pv[1] + 50], [ax + 50, pv[1] + R + 16], [ax - 50, pv[1] + R + 16], [ax - 34, pv[1] + 50]].map(p => rot(p, sw));
            BF.push(inkLoop(bell, o(70 + k)));
            BI.push(inkPath(bell, o(72 + k, { closed: true, w: 5 })), inkPath([rot([ax - 40, pv[1]], sw), rot([ax + 40, pv[1]], sw)], o(74 + k, { w: 9 })));
            const cl = rot([ax, pv[1] + 20], sw), ca = sw * 0.45, cle = [cl[0] + Math.sin(-ca) * 60, cl[1] + Math.cos(ca) * 60];
            BI.push(inkPath([cl, cle], o(76 + k, { w: 5 })), inkDot(cle[0], cle[1], 9, 9, sd + 78 + k, t));
          });
          lay.arch.setAttribute('d', AR.join(' ')); lay.bellF.setAttribute('d', BF.join(' ')); lay.bellI.setAttribute('d', BI.join(' '));
          lay.clockI.setAttribute('d', '');
          // door
          TI.push(inkPath([[cx - 50, gy], [cx - 50, gy - 120], [cx, gy - 160], [cx + 50, gy - 120], [cx + 50, gy]], o(97, { w: 6 })));
          lay.towerI.setAttribute('d', TI.join(' '));
          // sound arcs
          const SO = [], SG = [];
          if (lt >= ra) for (let k = 0; k < 4; k++) { const age = ((lt - ra) * 0.7 + k / 4) % 1, R = 220 + age * 520;
            [-1, 1].forEach(side => { const pts = []; for (let j = -3; j <= 3; j++) { const an = (side < 0 ? Math.PI : 0) + j * 0.16; pts.push([cx + Math.cos(an) * R, by0 + 80 + Math.sin(an) * R * 0.8]); }
              (k % 2 ? SG : SO).push(inkPath(pts, o(100 + k * 2 + (side + 1), { w: 7 * (1 - age) + 1 }))); }); }
          lay.sound.setAttribute('d', SO.join(' ')); lay.soundG.setAttribute('d', SG.join(' '));
          // birds
          const ba = P.birds != null ? at(P.birds, null) : ra + 0.3, BD = [];
          if (ba != null && lt >= ba) for (let k = 0; k < 9; k++) { const age = lt - ba, rr = rng(sd + 200 + k), vx = (rr() - 0.5) * 500, vy = -120 - rr() * 160;
            const bx = cx + (rr() - 0.5) * tw + vx * age, byy = top + 40 + vy * age, fl = Math.sin(lt * 14 + k) * 14;
            if (byy < -40) continue; BD.push(inkPath([[bx - 26, byy - fl], [bx, byy + 6], [bx + 26, byy - fl]], o(200 + k, { w: 4 }))); }
          lay.birds.setAttribute('d', BD.join(' '));
          const cres = cast.update(lt, t, cues), CF = [], CI2 = [];
          (P.cast || []).forEach((m, i) => { const q = cres[i]; if (!q) return; if (m.helmet) { const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + 300 + i * 20); CF.push(h.fill); CI2.push(h.ink); } });
          capF.setAttribute('d', CF.join(' ')); capI.setAttribute('d', CI2.join(' '));
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
