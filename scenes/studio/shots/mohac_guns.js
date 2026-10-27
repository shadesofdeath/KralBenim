// mohac_guns: the Ottoman gun line at Mohács (14-mohac-1526), seen from the side and receding into depth: field guns on
// wheeled carriages chained wheel to wheel, kneeling janissaries with long muskets behind them, a gunner with a lit
// linstock, and the enemy charge small on the far plain (coming from the left). On cues the guns fire one after
// another (flash, recoil, smoke rolling towards the enemy) and the janissaries fire a volley.
// No sky/ground of its own: the scene's "set" (hills/field) paints the world; ground y ≈ 820.
// P: {guns: [{x, y, s, jan}] (jan: janissaries behind this gun) (default 4, near right -> far left), chain: true, chain_at: cue (chain glints red),
//     fire: cue, volley: cue, janissaries: 2 (per gun), enemy: true (far charge), enemy_at: cue (it starts moving),
//     gunner: true, reveal: cue (guns hidden until then, then rise into view), labels: [MCB label entries], cast: [MCB cast]}
// cues: chain_at, fire, volley, enemy_at, label/cast cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_guns = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const root = el(svg, 'g');
      const gl = el(root, 'g'), farG = el(root, 'g'), smokeBack = el(root, 'g'), unitsG = el(root, 'g'), smokeFront = el(root, 'g'), labG = el(root, 'g'), castG = el(root, 'g');
      const ground = inkEl(gl), ruts = inkEl(gl, INK.inkSoft);
      const guns = (P.guns || [{ x: 1430, y: 960, s: 1.3 }, { x: 1010, y: 850, s: 0.95 }, { x: 700, y: 770, s: 0.7 }, { x: 470, y: 712, s: 0.52 }])
        .slice().sort((a, b) => a.y - b.y);   // far first (drawn behind)
      const units = guns.map((G, i) => {
        const g = el(unitsG, 'g');
        const jans = Array.from({ length: G.jan ?? P.janissaries ?? 2 }, (_, k) => M.soldier(g, { hat: 'bork', side: 'ot', seed: seed * 40 + i * 5 + k }));
        const cn = M.cannon(g, { seed: seed * 60 + i });
        return { G, i, g, jans, cn };
      });
      const near = guns[guns.length - 1];
      const gunner = P.gunner !== false ? M.soldier(unitsG, { hat: 'turban', side: 'ot', gun: false, seed: seed * 70 }) : null;
      const linF = inkEl(unitsG, INK.gold), linL = inkEl(unitsG, INK.ink);
      const chainL = inkEl(unitsG, INK.ink), chainR = inkEl(unitsG, INK.red);
      const smF = inkEl(smokeFront, INK.paperLight), smL = inkEl(smokeFront, INK.inkSoft), smB = inkEl(smokeBack, INK.paperDark);
      const enemy = P.enemy !== false ? Array.from({ length: 7 }, (_, k) => M.rider(farG, { side: 'hu', head: 'helm', seed: seed * 90 + k })) : [];
      const labels = P.labels && window.MCB ? window.MCB.labels(labG, P.labels, W, H, seed * 3) : null;
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          ground.setAttribute('d', inkPath([[-60, 822], [W * 0.4, 816], [W * 0.75, 824], [W + 60, 818]], { w: 6, seed: seed + 1, t }));
          let rd = '';
          for (let i = 0; i < 18; i++) { const q = rng(inkHash(seed, i + 50)); const x = q() * W, y = 840 + q() * 220; rd += inkPath([[x, y], [x + 40 + q() * 80, y + 4]], { w: 3, seed: seed + 60 + i, t }); }
          ruts.setAttribute('d', rd);
          const fire = atOr(cues, P.fire, null), volley = atOr(cues, P.volley, null);
          // far enemy charge (left horizon), approaching to the right
          const ea = atOr(cues, P.enemy_at, 0), et = Math.max(0, lt - ea);
          enemy.forEach((rig, k) => {
            const q = rng(inkHash(seed + 300, k)), s = 0.24 + q() * 0.06;
            rig.update(t, { x: 40 + k * 70 + et * 45 + q() * 30, y: 660 + (k % 3) * 14, s, face: 1, ph: et * 2.2 + k * 0.3, gallop: 1, couch: 1, soft: true });
          });
          // guns + janissaries (optionally hidden until "reveal", then they rise out of the smoke-line)
          const rv = atOr(cues, P.reveal, null);
          if (rv != null) { const pr = spring(lt, rv, 0.7); unitsG.style.display = lt < rv ? 'none' : ''; unitsG.setAttribute('transform', `translate(0 ${f1((1 - pr) * 120)})`); chainL.style.display = unitsG.style.display; chainR.style.display = unitsG.style.display; }
          const muzz = [];
          units.forEach(({ G, i, jans, cn }) => {
            const order = guns.length - 1 - i;            // the near gun fires first
            const fa = fire != null ? fire + order * 0.28 : null, ft = fa != null ? lt - fa : -1;
            const fl = ft >= 0 && ft < 0.22 ? 1 - ft / 0.22 : 0, rc = ft >= 0 ? Math.exp(-ft * 5) * clamp01(ft * 30) : 0;
            jans.forEach((jr, k) => {
              const vt = volley != null ? lt - volley - k * 0.12 - order * 0.08 : -1;
              const vf = vt >= 0 && vt < 0.18 ? 1 - vt / 0.18 : 0;
              const r = jr.update(t, { x: G.x + G.s * (260 + k * 120), y: G.y - G.s * (k * 26 + 30), s: G.s * 0.95, face: -1, aim: 1, kneel: k === 0 ? 1 : 0, fire: vf });
              if (vt >= 0) muzz.push({ x: r.muzzle[0], y: r.muzzle[1], age: vt, s: G.s * 0.45, sd: i * 10 + k });
            });
            const r = cn.update(t, { x: G.x, y: G.y, s: G.s, face: -1, recoil: rc, fire: fl, spin: 0 });
            G._axle = r.axle;
            if (ft >= 0) muzz.push({ x: r.muzzle[0], y: r.muzzle[1], age: ft, s: G.s, sd: 100 + i });
          });
          // chain between neighbouring guns' axles (sagging, link by link)
          const chainAt = atOr(cues, P.chain_at, null);
          let cd = '', cr = '';
          if (P.chain !== false) {
            for (let i = 0; i + 1 < guns.length; i++) {
              const a = guns[i]._axle, b = guns[i + 1]._axle, n = Math.max(6, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 26));
              const sag = 30 + 0.05 * Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.sin(t * 2 + i) * 3;
              for (let k = 0; k < n; k++) {
                const u = (k + 0.5) / n, x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u) + sag * 4 * u * (1 - u);
                const s = lerp(guns[i].s, guns[i + 1].s, u), ang = Math.atan2(b[1] - a[1], b[0] - a[0]) + (k % 2 ? 0 : 0.2);
                const pts = inkEllipsePts(x, y, 15 * s, (k % 2 ? 6 : 9) * s, seed + i * 50 + k, 8, ang, 0.05);
                const glint = chainAt != null && lt > chainAt + u * 0.6 && lt < chainAt + u * 0.6 + 0.8;
                const p = inkPath(pts, { w: 4.5, seed: seed + i * 50 + k, t, closed: true, amp: 0.8 });
                if (glint) cr += p; else cd += p;
              }
            }
          }
          chainL.setAttribute('d', cd); chainR.setAttribute('d', cr);
          // gunner with a lit linstock beside the near gun
          if (gunner) {
            const lean = fire != null ? prog(lt, fire - 0.6, 0.5) : 0;
            const r = gunner.update(t, { x: near.x + near.s * 120, y: near.y + 10, s: near.s * 0.95, face: -1, aim: 0.2 + lean * 0.5, kneel: 0, fire: 0 });
            const hx = r.head[0] - near.s * 40, hy = r.head[1] + near.s * 60;
            const tip = [hx - near.s * (90 + lean * 50), hy - near.s * (110 - lean * 70)];
            linL.setAttribute('d', inkPath([[hx + near.s * 20, hy + near.s * 40], tip], { w: 5, seed: seed + 5, t }));
            const fl = 1 + 0.25 * Math.sin(t * 17);
            linF.setAttribute('d', inkLoop(inkEllipsePts(tip[0], tip[1] - 8 * fl, 9 * near.s * fl, 15 * near.s * fl, seed + 6, 8), { seed: seed + 6, t, amp: 1 }));
          }
          // smoke from every muzzle that fired: billows towards the enemy (left) and up
          let sf = '', sl = '', sb = '';
          muzz.forEach(m => {
            for (let j = 0; j < 4; j++) {
              const age = m.age - j * 0.12;
              if (age < 0) continue;
              const grow = 1 - Math.exp(-age * 1.4), cx = m.x - grow * (150 + j * 70) * m.s - age * 20, cy = m.y - grow * (30 + j * 35) * m.s - age * 10, r = (30 + grow * (70 + j * 18)) * m.s;
              sf += M.puff(cx, cy, r, seed + m.sd * 13 + j, t);
              sb += M.puff(cx + r * 0.25, cy + r * 0.25, r * 0.9, seed + m.sd * 13 + j + 5, t);
              if (j === 0) sl += inkPath(M.puffPts(cx, cy, r, seed + m.sd * 13 + j), { w: 2.5, seed: seed + m.sd * 13 + 9, t, closed: true });
            }
          });
          smF.setAttribute('d', sf); smL.setAttribute('d', sl); smB.setAttribute('d', sb);
          if (labels) labels.update(lt, t, cues);
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
