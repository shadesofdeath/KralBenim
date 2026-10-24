// pgb_portrait: one big period figure on a plain parchment page with hand-written tags around it that point at parts
// of the body; tags can be struck out in red (lost) or ticked in green (kept). Parchment ink (BRAND.md §3, §5; boils at
// 8 Hz via _ink.js; pure function of (seed, lt)). Written for Phineas Gage after the accident (what he lost / kept),
// parametric for any "what changed in this person" moment.
//   P: {figure: {pgb__lib cast entry, default {who: "gage", gage: true, x: 0.6, y: 0.86, scale: 1.25, pose: "idle"}},
//       tags: [{text, x, y (0..1), at, to: [x, y] (arrow target, 0..1), mark: "x"|"check", size: 72}],
//       ring: {x, y, r: 70, at, color: "red"} (circle drawn around a point), kasif: pgb__lib cast entry | false,
//       labels: [window.MCB labels], cam}
//   cues: hit (punch), tag/ring "at", cast seq
// Needs pgb__lib.js (window.PGB) and mcB__lib.js (window.MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.pgb_portrait = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1 } = window.PGB, MCB = window.MCB;
      const sd = seed * 1000 + 613;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const F = Object.assign({ who: 'gage', gage: true, x: 0.6, y: 0.86, scale: 1.25, pose: 'idle', face: 'left' }, P.figure || {});
      const plinth = { f: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.6 }), r: inkEl(cam) };
      const rays = inkEl(cam, INK.inkSoft);
      const list = [F].concat(P.kasif ? [Object.assign({ who: 'kasif', x: 0.1, y: 0.88, scale: 0.85, pose: 'talk', face: 'right' }, P.kasif)] : []);
      const cs = window.PGB.cast(el(cam, 'g'), list, W, H, sd + 200);
      const ringE = P.ring ? inkEl(cam, INK[P.ring.color || 'red'] || INK.red) : null;
      const tags = (P.tags || []).map((T, i) => {
        const g = el(cam, 'g'), col = T.mark === 'x' ? INK.red : T.mark === 'check' ? INK.green : INK.ink;
        const tx = el(g, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': T.size || 76, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink });
        tx.textContent = T.text;
        let w = 200; try { w = tx.getComputedTextLength(); } catch (e) {}
        return { T, g, w, col, arrow: inkEl(cam, INK.ink), mark: inkEl(g, col), box: null };
      });
      const lb = MCB.labels(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const fx = F.x * W, gy = F.y * H;
          const pp = inkEllipsePts(fx, gy + 6, 230, 34, sd + 1, 14);
          plinth.f.setAttribute('d', inkLoop(pp, { seed: sd + 1, t, amp: 1 }));
          plinth.r.setAttribute('d', inkPath(pp, { w: 4, seed: sd + 2, t, amp: 1, closed: true }));
          let rd = '';
          for (let k = 0; k < 9; k++) { const a = Math.PI + (k + 0.5) * Math.PI / 9, r0 = 470 + Math.sin(t * 1.6 + k) * 10;
            rd += inkPath([[fx + Math.cos(a) * r0, gy - 330 + Math.sin(a) * r0 * 0.9], [fx + Math.cos(a) * (r0 + 40), gy - 330 + Math.sin(a) * (r0 + 40) * 0.9]], { w: 4, seed: sd + 10 + k, t, amp: 1 }) + ' '; }
          rays.setAttribute('d', rd);
          cs.update(lt, t, cues);
          if (ringE) {
            const R = P.ring, a = atOr(cues, R.at, 0.5), p = prog(lt, a, 0.5);
            const pts = inkEllipsePts(R.x * W, R.y * H, R.r || 70, (R.r || 70) * 0.9, sd + 30, 16);
            const n = Math.max(2, Math.round(pts.length * p));
            ringE.setAttribute('d', p > 0.02 ? inkPath(pts.concat([pts[0]]).slice(0, n + 1), { w: 7, seed: sd + 31, t, amp: 1 }) : '');
          }
          tags.forEach((o, i) => {
            const T = o.T, a = atOr(cues, T.at, 0.3 + i * 0.5);
            if (lt < a) { o.g.style.display = 'none'; o.arrow.setAttribute('d', ''); return; }
            o.g.style.display = '';
            const p = spring(lt, a, 0.5), pk = punch(lt, a, 0.6), x = T.x * W, y = T.y * H, b = boil(sd + 40 + i, t, 1.2);
            o.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${f1(Math.max(0.01, p * (1 + 0.08 * pk)) * 1000) / 1000})`);
            const mp = prog(lt, a + 0.25, 0.35), hw = o.w / 2;
            if (T.mark === 'x') {
              o.mark.setAttribute('d', mp > 0.02 ? inkPath([[-hw - 14, 4], [lerp(-hw - 14, hw + 14, mp), -6]], { w: 10, seed: sd + 50 + i, t, amp: 1 }) : '');
            } else if (T.mark === 'check') {
              const cx = -hw - 56;
              const ck = [[cx - 22, -4], [cx - 4, 18], [cx + 30, -30]];
              o.mark.setAttribute('d', mp > 0.02 ? inkPath(mp < 0.5 ? [ck[0], [lerp(ck[0][0], ck[1][0], mp * 2), lerp(ck[0][1], ck[1][1], mp * 2)]] : [ck[0], ck[1], [lerp(ck[1][0], ck[2][0], mp * 2 - 1), lerp(ck[1][1], ck[2][1], mp * 2 - 1)]], { w: 10, seed: sd + 50 + i, t, amp: 0.8 }) : '');
            } else o.mark.setAttribute('d', '');
            if (T.to) {
              const ap = prog(lt, a + 0.1, 0.4), tx = T.to[0] * W, ty = T.to[1] * H;
              const sx = x + (tx > x ? hw + 24 : -hw - 24), sy = y + 10;
              const ex = lerp(sx, tx, ap), ey = lerp(sy, ty, ap), mx = (sx + ex) / 2, my = (sy + ey) / 2 - 30;
              const ang = Math.atan2(ey - my, ex - mx), hl = 26;
              o.arrow.setAttribute('d', ap > 0.03 ? inkPath([[sx, sy], [mx, my], [ex, ey]], { w: 5, seed: sd + 60 + i, t, amp: 1 }) +
                (ap > 0.7 ? ' ' + inkPath([[ex - Math.cos(ang - 0.5) * hl, ey - Math.sin(ang - 0.5) * hl], [ex, ey], [ex - Math.cos(ang + 0.5) * hl, ey - Math.sin(ang + 0.5) * hl]], { w: 5, seed: sd + 70 + i, t, amp: 0.6, smooth: false }) : '') : '');
            }
          });
          MCB.camPush(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
