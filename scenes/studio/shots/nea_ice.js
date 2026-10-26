// nea_ice: Ice Age figures in a blizzard (Neanderthal DNA Short): volumetric ink-wash Neanderthals / humans walk,
// shrink into the distance and fade into the snow, or stop and look back over the shoulder. The world behind them is
// the scene's "set" (snow); this shot only adds the figures, wind-blown snow and drifting snow banks in front.
// P: {figs: [{kind: "nean"|"human"|"child", x: 0.5, y: 1130 (ground, stage px), s: 1, face: -1|1, walk: true,
//            arm: "hang"|"spear"|"reach"|"wave"|"hold", to: {x, y, s, a} (where it ends up), at: 0 (cue|s), dur: 3,
//            look: cue|s (turns its head back over the shoulder), stop: cue|s (stops walking), fez: false,
//            arm2: "wave", arm_at: cue|s (switches the arm pose), coat: "blue" (human tunic token)}],
//     snow: 70 (flakes), wind: 1, fore: "snow"|"desert"|false (foreground: drift band, rocks, tracks, grass),
//     tracks: true, sun: {x, y, r} (pale winter sun with cloud streaks), spear_len (per fig), labels: [...MCB labels], kasif: {...} | false}
// cues: whatever the figs/labels reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.nea_ice = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, labels, cast } = window.MCB;
      const sd = seed * 1000 + 4400;
      const root = el(svg, 'g');
      const figG = el(root, 'g');
      const F = (P.figs || [{ kind: 'nean', x: 0.5 }]).map((f, i) => ({ f, fig: NEA.fig(el(figG, 'g'), f.kind || 'nean', sd + i * 211) }));
      // order: the farther (smaller end scale) first is already decided by list order
      const FORE = P.fore ?? (P.drift === false ? false : 'snow');
      const drift = FORE === 'snow' ? { f: inkEl(root, INK.paperLight), l: inkEl(root, INK.inkSoft) } : null;
      // foreground (one wide path per layer: the camera treats it as backdrop): rocks, tracks, grass / scrub
      const fg = FORE ? { band: inkEl(root, FORE === 'snow' ? INK.paperDark : INK.gold), rockF: inkEl(root, INK.inkSoft), cap: inkEl(root, INK.paperLight),
        rockL: inkEl(root, INK.ink), tracks: inkEl(root, INK.inkSoft), grass: inkEl(root, INK.ink) } : null;
      const FR = rng(sd + 77), ROCKS = [[0.06, 1330, 120], [0.3, 1440, 70], [0.86, 1300, 140], [0.62, 1470, 90], [0.97, 1450, 80]].map(r => [r[0], r[1], r[2], FR()]);
      const TUFTS = Array.from({ length: 14 }, (_, i) => [((i * 0.137 + FR() * 0.05) % 1), 1200 + FR() * 300, 20 + FR() * 30]);
      // a pale winter sun behind the blizzard: P.sun {x, y (0..1), r: 110}
      const SUN = P.sun || null, sunF = SUN ? inkEl(root, INK.paperLight) : null, sunL = SUN ? inkEl(root, INK.inkSoft) : null;
      const sn = NEA.snow(el(root, 'g'), W, H, P.snow ?? 70, sd + 7);
      const castG = el(root, 'g');
      const cs = P.kasif ? cast(castG, [Object.assign({ who: 'kasif', x: 0.8, y: 0.59, scale: 0.6, pose: 'point', face: 'left' }, P.kasif)], W, H, sd + 300) : null;
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          F.forEach(({ f, fig }, i) => {
            const a0 = atOr(cues, f.at, 0), d = f.dur ?? Math.max(1, dur - a0);
            const stopAt = atOr(cues, f.stop, null);
            const tm = stopAt != null ? Math.min(lt, stopAt) : lt;
            const p = f.to ? clamp01((tm - a0) / d) : 0;
            const pe = p;
            const y0 = f.y ?? 1130, s0 = f.s ?? 1;
            const x = lerp((f.x ?? 0.5) * W, ((f.to && f.to.x) ?? f.x ?? 0.5) * W, pe);
            const y = lerp(y0, (f.to && f.to.y) ?? y0, pe), s = lerp(s0, (f.to && f.to.s) ?? s0, pe), a = lerp(1, (f.to && f.to.a) ?? 1, pe);
            const walk = f.walk === false ? 0 : stopAt == null ? 1 : 1 - prog(lt, stopAt, 0.3);
            const lk = atOr(cues, f.look, null);
            const look = lk != null ? prog(lt, lk, 0.45) : 0;
            fig.draw(t, { x, y, s, face: f.face ?? -1, walk, ph: lt * 0.9 + i * 0.37, arm: f.arm2 && lt >= atOr(cues, f.arm_at, 1e9) ? f.arm2 : f.arm, a, look, fez: f.fez, coat: f.coat, spearLen: f.spear_len });
          });
          if (drift) {
            const pts = [];
            for (let x = -40; x <= W + 40; x += 60) pts.push([x, 1150 + Math.sin(x * 0.01 + 1.3) * 16 + Math.sin(x * 0.027) * 8]);
            drift.f.setAttribute('d', inkLoop(pts.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: sd + 2, t, amp: 1 }));
            drift.l.setAttribute('d', inkPath(pts, { w: 5, seed: sd + 3, t, amp: 1.2 }));
          }
          if (SUN) {
            const sx = SUN.x * W, sy = SUN.y * H, r = (SUN.r ?? 110) * (1 + 0.03 * Math.sin(t * 1.3));
            sunF.setAttribute('d', inkCircle(sx, sy, r, sd + 200, t, { fill: true })); sunF.setAttribute('fill-opacity', 0.85);
            let d = inkCircle(sx, sy, r, sd + 201, t, { w: 5 });
            for (let i = 0; i < 4; i++) { const yy = sy - r * 0.2 + i * r * 0.28 + Math.sin(t + i) * 6; d += ' ' + inkPath([[sx - r * 1.5 + i * 20, yy], [sx + r * 1.4 - i * 15, yy - 6]], { w: 4, seed: sd + 202 + i, t, amp: 1 }); }
            sunL.setAttribute('d', d);
          }
          if (fg) {
            const sp = [];
            for (let x = -40; x <= W + 40; x += 60) sp.push([x, 1235 + Math.sin(x * 0.008 + 2.1) * 22]);
            fg.band.setAttribute('d', inkLoop(sp.concat([[W + 40, H + 20], [-40, H + 20]]), { seed: sd + 80, t, amp: 1 }));
            fg.band.setAttribute('fill-opacity', FORE === 'snow' ? 0.35 : 0.3);
            let rf = '', rl = '', cp = '';
            ROCKS.forEach(([x, y, r, q], i) => {
              const pts = inkEllipsePts(x * W, y, r, r * 0.55, sd + 90 + i, 9, 0, 0.18).map(p => [p[0], Math.min(p[1], y + r * 0.25)]);
              rf += inkLoop(pts, { seed: sd + 90 + i, t, amp: 1 }) + ' ';
              rl += inkPath(pts, { w: 6, seed: sd + 95 + i, t, closed: true, amp: 1 }) + ' ';
              if (FORE === 'snow') cp += inkLoop([[x * W - r * 0.8, y - r * 0.2], [x * W - r * 0.4, y - r * 0.5], [x * W + r * 0.3, y - r * 0.56], [x * W + r * 0.85, y - r * 0.18], [x * W, y - r * 0.32]], { seed: sd + 100 + i, t, amp: 0.8 }) + ' ';
            });
            // the full-width ground line keeps the whole layer a "backdrop" for the camera
            rl += inkPath(sp, { w: 4, seed: sd + 105, t, amp: 1 });
            fg.rockF.setAttribute('d', rf); fg.rockF.setAttribute('fill-opacity', 0.55); fg.rockL.setAttribute('d', rl); fg.cap.setAttribute('d', cp);
            let td = '';
            if (P.tracks !== false) for (let i = 0; i < 9; i++) {
              const u = i / 8, x = lerp(0.78, 0.5, u) * W + (i % 2 ? 22 : -22) * (1 - u * 0.6), y = lerp(1480, 1165, u), r = lerp(26, 10, u);
              td += inkDot(x, y, r, r * 0.45, sd + 110 + i, t, 0.4) + ' ';
            }
            fg.tracks.setAttribute('d', td); fg.tracks.setAttribute('fill-opacity', 0.6);
            let gd = '';
            TUFTS.forEach(([x, y, h], i) => { for (let k = -1; k <= 1; k++) gd += inkPath([[x * W + k * 6, y], [x * W + k * 14 + Math.sin(t * 1.5 + i) * 4, y - h * (1 - Math.abs(k) * 0.3)]], { w: 3.5, seed: sd + 120 + i * 3 + k, t, amp: 0.5 }) + ' '; });
            gd += inkPath([[-40, 1495], [W + 40, 1495]], { w: 1, seed: sd + 160, t, amp: 0.5 });
            fg.grass.setAttribute('d', gd);
          }
          sn.update(t, 1, P.wind ?? 1);
          if (cs) cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
