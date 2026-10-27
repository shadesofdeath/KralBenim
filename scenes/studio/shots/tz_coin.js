// tz_coin: the Byzantine gold coin of John I Tzimiskes (histamenon, Mary crowns the emperor), parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)). Needs tz__lib.js (TZ) and mcB__lib.js (MCB).
//   mode "hold": a rocky shore — the giant coin rises dripping out of the sea on the left, Kaşif stands on the rocks on
//     the right (cast); the sea band and the rock run down to the frame bottom (no empty paper under the captions).
//   mode "face": a museum table close-up — the coin stands on a little stand on red velvet; on `crown` Mary's hand
//     lowers the crown onto the emperor's head. The table front fills the frame bottom.
// P: {mode: "hold"|"face", coin: {x: 0.34, y: 0.37, r: 230} (0..1 W/H, px), rise: cue|s (hold: the coin rises from the
//   water; default 0), sea: 0.57 (hold: water top, 0..1 H), rock: {x: 0.56, y: 0.6} (hold: where the rocks begin, top),
//   crown: cue|s (face: crown lowers; default dur*0.35; "done" = already on), glint: cue|s, gy: 0.6 (face: table top),
//   cast: [MCB cast], labels: [MCB labels]}
// cues: rise, crown, glint, hit (punch), plus any cast/label cue names.
// Close-up targets (portrait 1080x1920, face mode defaults): coin centre [540, 700], emperor's head ≈ [645, 590].
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tz_coin = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const T = window.TZ, M = window.MCB, sd = seed * 1000 + 977;
      const root = el(svg, 'g');
      const mode = P.mode || 'hold', face = mode === 'face';
      const sh = T.Shapes();
      const C = Object.assign(face ? { x: 0.5, y: 0.365, r: 370 } : { x: 0.34, y: 0.37, r: 230 }, P.coin || {});
      const gy = (P.gy ?? 0.6) * H;
      let coinG, water, splash, drops, cast, labs;
      const backG = el(root, 'g');
      if (face) {
        // table top + velvet + table front to the bottom edge
        sh.add(backG, T.rect(-30, gy - 70, W + 30, gy + 10), { fill: INK.stain, fop: 0.95, stroke: INK.ink, w: 6 });
        sh.add(backG, T.rect(-30, gy + 10, W + 30, H + 30), { fill: mix(INK.stain, INK.ink, 0.25), fop: 0.95 });
        for (let i = 0; i < 6; i++) sh.add(backG, [[-20, gy + 60 + i * 110], [W * 0.5, gy + 66 + i * 110], [W + 20, gy + 58 + i * 110]], { stroke: INK.ink, w: 2, closed: false, smooth: true });
        [[0.08, 0.44], [0.56, 0.92]].forEach(([a, b], i) => {
          sh.add(backG, T.rect(a * W, gy + 260, b * W, gy + 560), { stroke: INK.ink, w: 6 });
          sh.add(backG, inkEllipsePts((a + b) / 2 * W, gy + 410, 22, 22, sd + 5 + i, 10), { fill: INK.gold, stroke: INK.ink, w: 4 });
        });
        const vel = [[W * 0.12, gy - 66], [W * 0.88, gy - 66], [W * 0.92, gy + 6], [W * 0.86, gy + 190], [W * 0.7, gy + 150], [W * 0.5, gy + 210], [W * 0.3, gy + 150], [W * 0.14, gy + 190], [W * 0.08, gy + 6]];
        sh.add(backG, vel, { fill: INK.red, fop: 0.75, stroke: INK.ink, w: 5, smooth: true });
        for (const u of [0.3, 0.5, 0.7]) sh.add(backG, [[W * u, gy + 10], [W * u + 6, gy + 140]], { stroke: INK.ink, w: 3, closed: false, smooth: true });
        // stand
        const cx = C.x * W, cy = C.y * H;
        sh.add(backG, [[cx - 40, cy + C.r * 0.6], [cx - 150, gy - 40]], { stroke: INK.ink, w: 12, closed: false });
        sh.add(backG, [[cx + 40, cy + C.r * 0.6], [cx + 150, gy - 40]], { stroke: INK.ink, w: 12, closed: false });
        sh.add(backG, T.rect(cx - 190, gy - 52, cx + 190, gy - 30), { fill: INK.inkSoft, stroke: INK.ink, w: 4 });
      }
      coinG = el(root, 'g');
      const coin = T.coin(coinG, sd + 7);
      if (!face) water = T.water(el(root, 'g'), sd + 3);
      const frontG = el(root, 'g');
      if (!face) {
        splash = { a: inkEl(frontG, INK.paperLight), b: inkEl(frontG, INK.blue, { 'fill-opacity': 0.8 }) };
        drops = T.drops(el(frontG, 'g'), sd + 11);
        // rocks on the right, down to the frame bottom
        const rx = (P.rock?.x ?? 0.56) * W, ry = (P.rock?.y ?? 0.6) * H;
        const rock = [[rx, ry + 110], [rx + 70, ry + 20], [rx + 180, ry - 4], [W * 0.82, ry + 6], [W + 30, ry - 20], [W + 30, H + 30], [rx - 60, H + 30], [rx - 90, ry + 420], [rx - 40, ry + 260]];
        sh.add(frontG, rock, { fill: mix(INK.paperDark, INK.inkSoft, 0.35), fop: 1, stroke: INK.ink, w: 6, smooth: true });
        for (let i = 0; i < 8; i++) { const y = ry + 70 + i * 90, x0 = rx + 40 - i * 8; sh.add(frontG, [[x0, y], [x0 + 160 + (i % 3) * 60, y + 26]], { stroke: INK.ink, w: 3, closed: false, smooth: true }); }
        sh.add(frontG, [[rx + 260, ry + 150], [rx + 230, ry + 380], [rx + 300, ry + 600]], { stroke: INK.ink, w: 4, closed: false, smooth: true });
        sh.add(frontG, inkEllipsePts(W * 0.12, H * 0.83, 130, 60, sd + 40, 12), { fill: mix(INK.paperDark, INK.inkSoft, 0.5), stroke: INK.ink, w: 5, smooth: true });
      }
      const castG = el(root, 'g'), labG = el(root, 'g');
      cast = M.cast(castG, P.cast || [], W, H, sd + 900);
      labs = M.labels(labG, P.labels || [], W, H, sd + 950);
      const seaY = (P.sea ?? 0.57) * H;
      let dropsAdded = false;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hitAt = T.atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          const glA = T.atOr(cues, P.glint ?? 'glint', hitAt);
          const glint = glA != null ? Math.max(0, Math.exp(-Math.max(0, lt - glA) * 2.5) * (lt >= glA ? 1 : 0)) + 0.25 * Math.max(0, Math.sin(t * 2.2)) : 0.25 * Math.max(0, Math.sin(t * 2.2));
          let cx = C.x * W, cy = C.y * H;
          if (face) {
            const ca = P.crown === 'done' ? -10 : T.atOr(cues, P.crown ?? 'crown', dur * 0.35);
            const cr = progIO(lt, ca - 0.3, 0.45);
            coin.update(t, cx, cy + Math.sin(t * 1.2) * 4, C.r * (1 + 0.04 * pk), { crown: cr, glint, tilt: 1 });
          } else {
            const ra = T.atOr(cues, P.rise ?? 'rise', 0);
            const up = spring(lt, ra, 1.2), bob = Math.sin(t * 2.4) * 26;
            cx += Math.sin(t * 1.7) * 22;
            cy = lerp(seaY + C.r * 1.4, C.y * H, up) + bob;
            const rot = Math.sin(t * 1.9) * 9;
            coin.update(t, cx, cy, C.r * (1 + 0.05 * pk), { crown: 1, glint, tilt: 0.9 + 0.1 * Math.cos(t * 2.6), rot, wet: up });
            water.update(t, W, H, seaY, { rough: 1.5 });
            // splash ring where the coin broke the surface
            const su = lt - ra - 0.15;
            if (su > 0 && su < 1.1) {
              const R = 60 + su * 260, pts = inkEllipsePts(cx, seaY + 6, R, R * 0.18, sd + 50, 14);
              splash.a.setAttribute('d', inkPath(pts, { w: 12 * (1 - su / 1.1), seed: sd + 51, t, closed: true, amp: 1 }));
              splash.b.setAttribute('d', inkPath(pts.slice(8, 14).map(([x, y]) => [x, y - 30 * (1 - su)]), { w: 6, seed: sd + 52, t, amp: 1 }));
            } else { splash.a.setAttribute('d', ''); splash.b.setAttribute('d', ''); }
            if (!dropsAdded) {
              dropsAdded = true;
              for (let i = 0; i < 40; i++) drops.add({ x: C.x * W + ((i * 37) % 9 - 4) * C.r * 0.12, y: C.y * H + C.r * 0.9, vx: 0, vy: 0, g: 1500, at: Math.max(ra, -2) + 0.1 + i * 0.16, size: 0.8 + (i % 3) * 0.2, floor: seaY + 10 });
            }
            drops.update(lt, t);
          }
          sh.update(t, lt);
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
