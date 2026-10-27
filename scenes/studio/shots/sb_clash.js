// sb_clash: an early-medieval battle line at ground level (brand/kit/BRAND.md §3, §5): two lines of stick warriors
// face each other on a field — one side in hatched mail shirts behind kite shields, the other without mail behind
// round shields — the armoured line advances, the other staggers and breaks on a cue (turns and runs). Optional:
// a king (gold circlet) under a raven banner, an arrow that flies in from the edge to him (gold impact star, no
// blood), the king toppling and the banner falling; dropped shields and spears + big grass in the foreground.
// The scene's "set" (field / hills, ground ≈ P.ground * H) paints the world. Uses sb__lib.js (SB) + MCB.labels.
// P: {ground: 0.585,
//     lines: [{side: "nor"|"eng"|"nrm", n: 3, x0: 0.1, x1: 0.4, scale: 0.6, face: "right", mail: false, shield: "round"|"kite",
//              spear: true, axe: false, beard, pose: "idle", advance: {at: cue|s, dx: 0.12, dur: 2.5},
//              stagger: cue, rout: {at: cue|s, dx: -0.6, delay: 0.3, dur: 1.4}, emotion, seq}],
//     king: SB.warrior K (crown: true) | false, banner: {x: 0.3, h: 0.36, fall: cue|s, dir: 1} | false,
//     arrow: {at: cue|s, dur: 0.6, from: [1.05, 0.25] (0..1), arc: 90} | false (target: the king's neck),
//     shields: [{x, y, r, side, rot, tilt, kind}], spears: [{x, y, len, rot}], grass: [{x, y, s, n}], labels: [MCB label entries],
//     kasif: K | false, front: {y: 0.86, n: 4, side, kind} (front rank seen from behind: helmeted heads + raised shields)}
// cues: hit, plus names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.sb_clash = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const SB = window.SB, MCB = window.MCB, atOr = SB.atOr, sd = seed * 1000 + 877;
      const G = P.ground ?? 0.585;
      const root = el(svg, 'g');
      const ban = P.banner ? SB.banner(el(root, 'g'), sd + 1) : null;
      const men = [];
      (P.lines || []).forEach((L, li) => {
        const n = L.n ?? 3;
        for (let i = 0; i < n; i++) {
          const u = n === 1 ? 0.5 : i / (n - 1), x = lerp(L.x0 ?? 0.1, L.x1 ?? 0.4, u);
          const K = { x, y: G + ((L.dy || [])[i] ?? 0), scale: (L.scale ?? 0.6) * (1 - ((L.dy || [])[i] ?? 0) * -0.6), face: L.face || 'right', side: L.side, mail: !!L.mail,
            shield: L.shield ?? (L.mail ? 'kite' : 'round'), spear: L.spear !== false && i % 2 === 0, axe: !!L.axe && i % 2 === 1, beard: L.beard ?? (i % 2 ? 'short' : 'black'),
            pose: L.pose || 'idle', emotion: L.emotion, seq: (L.seq || []).slice() };
          if (L.advance) K.move = { at: L.advance.at, to: x + (L.advance.dx ?? 0.12), dur: L.advance.dur ?? 2.5 };
          if (L.stagger) { K.stagger = L.stagger; K.seq.push({ at: L.stagger, pose: 'shock', emotion: 'surprised' }); }
          if (L.rout) { const R = L.rout; K.move = { at: R.at, delay: (R.delay ?? 0.3) + i * 0.12, to: x + (R.dx ?? -0.6), dur: R.dur ?? 1.4, run: true }; K.seq.push({ at: R.at, emotion: 'worried' }); }
          men.push({ d: SB.warrior(el(root, 'g'), K, sd + 20 + li * 40 + i * 7), li });
        }
      });
      const king = P.king ? SB.warrior(el(root, 'g'), Object.assign({ x: 0.45, y: G, scale: 0.8, face: 'right', crown: true, side: 'nor', shield: false, beard: 'short' }, P.king), sd + 200) : null;
      const kas = P.kasif ? SB.warrior(el(root, 'g'), Object.assign({ who: 'kasif', y: G, scale: 0.7 }, P.kasif), sd + 220) : null;
      const arrow = P.arrow ? SB.arrow(el(root, 'g'), sd + 240) : null, burst = P.arrow ? SB.burst(el(root, 'g'), sd + 250) : null;
      const spears = (P.spears || []).map((q, i) => ({ q, d: SB.spear(el(root, 'g'), sd + 260 + i) }));
      const shields = (P.shields || []).map((q, i) => ({ q, d: SB.shield(el(root, 'g'), sd + 280 + i) }));
      const grass = SB.grass(el(root, 'g'), sd + 300, (P.grass || []).map(g => ({ x: g.x * W, y: g.y * H, s: g.s ?? 1, n: g.n })));
      const labels = MCB.labels(el(root, 'g'), P.labels || [], W, H, sd + 320);
      const groundE = inkEl(root, INK.inkSoft);
      const FR = P.front ? Object.assign({ y: 0.86, n: 4, side: 'eng' }, P.front) : null;
      const front = FR ? Array.from({ length: FR.n }, (_, i) => { const g = el(root, 'g'); return { body: inkEl(g, INK.paperDark), sh: SB.shield(el(g, 'g'), sd + 340 + i), head: inkEl(g, INK.paperLight), helm: inkEl(g, INK.inkSoft), r: inkEl(g) }; }) : [];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          groundE.setAttribute('d', inkPath([[-20, G * H + 6], [W * 0.5, G * H - 2], [W + 20, G * H + 4]], { w: 5, seed: sd + 2, t, amp: 1 }));
          if (ban) { const B = P.banner, fa = atOr(cues, B.fall, null); ban.update(t, { x: (B.x ?? 0.3) * W, y: G * H + 4, h: (B.h ?? 0.36) * H, fall: fa == null ? 0 : progIO(lt, fa, 1.0), dir: B.dir ?? 1 }); }
          men.forEach(m => m.d.update(lt, t, cues, W, H));
          let kp = null;
          if (king) kp = king.update(lt, t, cues, W, H);
          if (kas) kas.update(lt, t, cues, W, H);
          if (arrow && kp) {
            const A = P.arrow, a = atOr(cues, A.at, 0.4), d = A.dur ?? 0.6, p = lt < a ? 0 : (lt - a) / d;
            const from = [(A.from || [1.05, 0.25])[0] * W, (A.from || [1.05, 0.25])[1] * H];
            arrow.update(t, from, kp.neck, p, A.arc ?? 90);
            burst.update(t, kp.neck[0], kp.neck[1], 70, clamp01((lt - a - d) / 0.5));
          }
          spears.forEach(({ q, d }) => d.update(t, { x: q.x * W, y: q.y * H, len: q.len ?? 420, rot: q.rot ?? 0 }));
          shields.forEach(({ q, d }) => d.update(t, { x: q.x * W, y: q.y * H, r: q.r ?? 110, side: q.side, rot: q.rot ?? 0, tilt: q.tilt ?? 0.55, kind: q.kind }));
          grass.update(t);
          front.forEach((c, i) => {
            const x = (i + 0.5) / FR.n * W + (i % 2 ? 40 : -40), base = FR.y * H + (i % 2 ? 70 : 0) + Math.sin(t * 2 + i) * 6, R = 96;
            const bp = [[x - 240, H + 60], [x - 210, base + 150], [x - 120, base + 100], [x, base + 92], [x + 120, base + 100], [x + 210, base + 150], [x + 240, H + 60]];
            c.body.setAttribute('d', inkLoop(bp, { seed: sd + 360 + i, t, amp: 1 }));
            c.head.setAttribute('d', inkLoop(SB.ell(x, base, R, R, 14), { seed: sd + 370 + i, t, amp: 1 }));
            const hp = [[x - R - 4, base + 10], [x - R + 4, base - 40], [x - 40, base - R - 10], [x, base - R - 36], [x + 40, base - R - 10], [x + R - 4, base - 40], [x + R + 4, base + 10], [x, base - 6]];
            c.helm.setAttribute('d', inkLoop(hp, { seed: sd + 380 + i, t, amp: 1 }));
            c.r.setAttribute('d', inkPath(bp, { w: 6, seed: sd + 390 + i, t, amp: 1 }) + ' ' + inkPath(hp, { w: 6, seed: sd + 400 + i, t, closed: true, amp: 1 }));
            c.sh.update(t, { x: x + (i % 2 ? -150 : 150), y: base + 210, r: 140, side: FR.side, rot: i * 17, tilt: 1, kind: FR.kind });
          });
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
