// mohac_charge: side view of a heavy-cavalry charge across a muddy plain (14-mohac-1526): rows of armoured knights in
// depth (far rows small and ink-soft, the near row big), lances upright -> couched, gallop with mud and dust; optional
// enemy riders falling back on the right, a gun line whose smoke and flashes swallow the charge, and the charge breaking.
// Draws only a ground line + mud: the scene's "set" (field/hills) paints the world. Ground y 820 (landscape).
// P: {mode: "ready"|"charge"|"break", side: "hu", head: "helm", ground: 820,
//     rows: [{y, s, n, gap, x, soft}] (default 3 rows), go: cue (gallop starts), couch: cue (lances down), speed: 260,
//     hit: cue (break: horses rear, riders thrown, from the right), enemy: {at: cue, n: 4, side: "ot", head: "cap", x: 1500},
//     guns: {at: cue, x: 1780, n: 4} (smoke wall + flashes at the right edge), lead: {x, s, y, at} (one big foreground knight; with at it rides in from the left),
//     banners: [{x, row, side}] , cast: [...MCB cast...]}
// cues: go, couch, hit, enemy.at, guns.at, cast cues
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.mohac_charge = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MHC, { f1, atOr } = M;
      const gy = P.ground ?? 820, mode = P.mode || 'charge';
      const root = el(svg, 'g');
      const groundG = el(root, 'g'), dustBack = el(root, 'g'), farG = el(root, 'g'), enemyG = el(root, 'g'), midG = el(root, 'g'),
        smokeG = el(root, 'g'), nearG = el(root, 'g'), leadG = el(root, 'g'), dustFront = el(root, 'g'), castG = el(root, 'g');
      const ground = inkEl(groundG), mud = inkEl(groundG, INK.inkSoft);
      const rows = P.rows || [
        { y: gy - 150, s: 0.42, n: 9, gap: 170, x: 1150, soft: true },
        { y: gy - 80, s: 0.62, n: 6, gap: 250, x: 1200 },
        { y: gy, s: 0.9, n: 4, gap: 380, x: 1250 },
      ];
      const riders = [];
      rows.forEach((r, ri) => {
        const parent = ri === 0 ? farG : ri === rows.length - 1 ? nearG : midG;
        for (let k = 0; k < r.n; k++) {
          const q = rng(inkHash(seed * 7 + ri, k + 1));
          const head = (P.king && ri === rows.length - 1 && k === 1) ? 'crown' : (P.head || 'helm');
          riders.push({ ri, k, r, q0: q(), q1: q(), q2: q(), rig: M.rider(parent, { side: P.side || 'hu', head, seed: seed * 100 + ri * 20 + k }) });
        }
      });
      const lead = P.lead ? M.rider(leadG, { side: P.side || 'hu', head: P.lead.head || 'helm', seed: seed * 100 + 99 }) : null;
      // enemy riders falling back to the right
      const E = P.enemy ? Object.assign({ n: 4, side: 'ot', head: 'cap', x: 1480 }, P.enemy) : null;
      const enemies = E ? Array.from({ length: E.n }, (_, k) => ({ k, rig: M.rider(enemyG, { side: E.side, head: E.head, barding: false, lance: false, seed: seed * 300 + k }) })) : [];
      // gun line smoke wall at the right
      const G = P.guns ? Object.assign({ x: 1780, n: 4 }, P.guns) : null;
      const smokeF = inkEl(smokeG, INK.paperLight), smokeL = inkEl(smokeG, INK.inkSoft), flashF = inkEl(smokeG, INK.gold), flashR = inkEl(smokeG, INK.red);
      const dustF = inkEl(dustBack, INK.paperDark, { 'fill-opacity': 0.45 }), dustL = inkEl(dustBack, INK.inkSoft);
      const mudF = inkEl(dustFront, INK.stain), mudL = inkEl(dustFront, INK.ink);
      const banners = (P.banners || []).map((b, i) => ({ b, ban: M.banner(rows[b.row ?? 1] ? (b.row === 0 ? farG : midG) : midG, { side: b.side || P.side || 'hu', seed: seed * 50 + i, tail: true }) }));
      const cast = P.cast && window.MCB ? window.MCB.cast(castG, P.cast, W, H, seed * 9) : null;

      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          const go = atOr(cues, P.go, mode === 'ready' ? 1e9 : 0.15), cch = atOr(cues, P.couch, go + 0.5), hit = mode === 'break' ? atOr(cues, P.hit, dur * 0.45) : 1e9;
          const speed = P.speed ?? 150;
          const tau = Math.max(0, Math.min(lt, hit + 0.4) - go), dist = speed * (tau - (1 - Math.exp(-3 * tau)) / 3);
          const gal = clamp01(tau * 2.5) * (mode === 'ready' ? 0 : 1);
          const couch = mode === 'ready' ? 0 : prog(lt, cch, 0.5);
          // ground
          ground.setAttribute('d', inkPath([[-60, gy + 4], [W * 0.3, gy - 2], [W * 0.7, gy + 3], [W + 60, gy]], { w: 6, seed: seed + 1, t }));
          let md = '';
          for (let i = 0; i < 26; i++) { const q = rng(inkHash(seed, i + 300)); const x = q() * W, y = gy + 20 + q() * 200, L = 30 + q() * 90; md += inkPath([[x, y], [x + L, y + (q() - 0.5) * 6]], { w: 3, seed: seed + 400 + i, t, amp: 1 }); }
          mud.setAttribute('d', md);
          // riders
          let dd = '', dl = '', mf = '', ml = '';
          riders.forEach(R0 => {
            const { r, k, q0, q1, q2, rig, ri } = R0;
            const bx = r.x - k * r.gap - q0 * r.gap * 0.3 + dist * (0.8 + 0.2 * r.s + q1 * 0.1);
            const myHit = hit + (W - bx) / 2400 + q2 * 0.25;
            const br = mode === 'break' ? clamp01((lt - myHit) / 0.5) : 0;
            const rear = br * (0.6 + q1 * 0.5) * (q0 > 0.3 ? 1 : 0.4), tum = q0 > 0.55 ? prog(lt, myHit + 0.25, 0.6) : 0;
            const ph = (dist * (0.8 + 0.2 * r.s) + q0 * 400) / (210 * r.s) + (mode === 'ready' ? 0 : 0);
            const x = bx - (br > 0 ? 40 * br * r.s : 0);
            rig.update(t, { x, y: r.y + (q2 - 0.5) * 10 * r.s, s: r.s * (0.94 + q1 * 0.12), face: 1, ph: mode === 'ready' ? 0 : ph, gallop: gal * (1 - br * 0.8),
              couch: Math.max(couch, mode === 'ready' ? 0 : 0) * (1 - tum), rear, tumble: tum, soft: !!r.soft });
            // mud kicked up behind galloping horses
            if (gal > 0.2 && ri > 0) {
              for (let j = 0; j < 2; j++) {
                const age = ((lt * 2.2 + q0 * 3 + j * 0.5) % 1), px = x - 90 * r.s - age * 80 * r.s, py = r.y - age * 50 * r.s + age * age * 60 * r.s;
                mf += inkDot(px, py, 7 * r.s, 5 * r.s, seed + ri * 50 + k * 3 + j, t); ml += '';
              }
              const age = (lt * 0.8 + q1) % 1, cx = x - 130 * r.s - age * 120, cy = r.y - 30 * r.s - age * 40, rr = (30 + age * 40) * r.s;
              dd += M.puff(cx, cy, rr, seed + ri * 70 + k, t);
            }
          });
          dustF.setAttribute('d', dd); dustL.setAttribute('d', dl); mudF.setAttribute('d', mf); mudL.setAttribute('d', ml);
          banners.forEach(({ b, ban }) => {
            const r = rows[b.row ?? 1] || rows[0];
            ban.update(t, { x: b.x + dist * (0.8 + 0.2 * r.s) - 40 * r.s, y: r.y - 150 * r.s, h: 300 * r.s, w: 150 * r.s, face: -1, sw: 5 });
          });
          if (lead) {
            const L = P.lead, la = atOr(cues, L.at, null), enter = la == null ? 1 : progIO(lt, la, 1.6), x = L.x + dist * 0.35 - (1 - enter) * 520;
            const lb = mode === 'break' ? clamp01((lt - (hit + 0.3)) / 0.5) : 0;
            lead.update(t, { x, y: L.y ?? gy + 160, s: L.s ?? 1.5, face: 1, ph: (dist + enter * 520) / (210 * (L.s ?? 1.5)) * 1.4 + 0.3, gallop: Math.max(gal, enter < 1 && enter > 0 ? 0.45 : 0) * (1 - lb * 0.8), couch: couch * (1 - lb), rear: lb * 0.9, tumble: 0 });
          }
          // enemy riders: fall back (gallop away to the right) from their cue
          if (E) {
            const ea = atOr(cues, E.at, dur * 0.4), et = Math.max(0, lt - ea), ed = 300 * (et - (1 - Math.exp(-3 * et)) / 3);
            enemies.forEach(({ k, rig }) => {
              const q = rng(inkHash(seed + 900, k)); const s = 0.5 + q() * 0.15, y = gy - 110 + k * 26;
              const turned = et > 0.05 ? 1 : -1;
              rig.update(t, { x: E.x + k * 90 + ed * (0.9 + q() * 0.3) + (et > 0 ? 0 : Math.sin(t * 3 + k) * 6), y, s, face: turned, ph: ed / (210 * s) + k * 0.3, gallop: et > 0.05 ? 1 : 0.25, couch: 0 });
            });
          }
          // guns: smoke wall rolls in from the right, flashes inside
          if (G) {
            const ga = atOr(cues, G.at, dur * 0.4);
            let sf = '', sl = '', ff = '', fr = '';
            if (lt >= ga) {
              for (let i = 0; i < 9; i++) {
                const q = rng(inkHash(seed + 700, i)), age = lt - ga - q() * 0.5;
                if (age < 0) continue;
                const grow = 1 - Math.exp(-age * 1.6), cx = G.x - grow * (220 + q() * 260), cy = gy - 60 - q() * 260 - age * 12, rr = 60 + grow * (90 + q() * 70);
                sf += M.puff(cx, cy, rr, seed + 720 + i, t); if (i % 3 === 0) sl += inkPath(M.puffPts(cx, cy, rr, seed + 720 + i), { w: 2.5, seed: seed + 740 + i, t, closed: true });
              }
              for (let k = 0; k < G.n; k++) {
                const per = 0.9, ph = ((lt - ga) - k * 0.23) % per;
                if (lt - ga - k * 0.23 >= 0 && ph < 0.16) { const fx = G.x - 40 - k * 20, fy = gy - 60 - k * 70; ff += M.flash(fx, fy, 90 * (1 - ph / 0.16), seed + 760 + k, t, -1); fr += M.flash(fx, fy, 36, seed + 770 + k, t, -1); }
              }
            }
            smokeF.setAttribute('d', sf); smokeL.setAttribute('d', sl); flashF.setAttribute('d', ff); flashR.setAttribute('d', fr);
          }
          if (cast) cast.update(lt, t, cues);
        },
      };
    },
  };
})();
