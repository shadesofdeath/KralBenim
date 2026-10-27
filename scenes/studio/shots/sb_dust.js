// sb_dust: "then dust rose on the road" (brand/kit/BRAND.md §3, §5): a far ridge with a pale road winding over it;
// on a cue a dust cloud boils up behind the crest and grows, spear points glint gold inside it and a row of tiny
// helmets and spears rises over the ridge; a lookout on a near rise points at it; the foreground is the backs of
// resting warriors (helmeted heads and shoulders, cropped by the bottom edge) who turn and rise on the cue.
// The scene's "set" (hills / field, horizon ≤ 1/3 H) paints the sky and land behind; this draws the ridge and people.
// Uses sb__lib.js (SB) + mcB__lib.js (MCB.labels).
// P: {ridge: 0.42 (crest y at the road, 0..1 H), road: {x: 0.62} (where the road crosses the crest),
//     dust: {at: cue|s, dur: 2.5, w: 0.55, h: 0.15}, column: {at: cue|s, n: 9} | false, glints: true,
//     lookout: SB.warrior K | false, crowd: {y: 0.8, n: 5, rise: cue} | false, labels: [MCB label entries]}
// cues: hit, dust.at, column.at, crowd.rise
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.sb_dust = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const SB = window.SB, MCB = window.MCB, atOr = SB.atOr, sd = seed * 1000 + 733;
      const RY = (P.ridge ?? 0.42) * H, RX = ((P.road || {}).x ?? 0.62) * W;
      const root = el(svg, 'g');
      const dustG = el(root, 'g'), dust = SB.dust(dustG, sd + 1);
      const colE = inkEl(root), colT = inkEl(root, INK.ink), colH = inkEl(root, INK.ink);
      const glint = inkEl(root, INK.gold);
      const ridgeF = inkEl(root, INK.paperDark), ridgeR = inkEl(root), ridgeH = inkEl(root, INK.inkSoft);
      const road = inkEl(root, INK.paperLight), roadR = inkEl(root, INK.inkSoft);
      const look = P.lookout ? SB.warrior(el(root, 'g'), Object.assign({ x: 0.22, y: 0.6, scale: 0.6, pose: 'point', dir: 20, face: 'right', side: 'nor' }, P.lookout), sd + 20) : null;
      const C = P.crowd === false ? null : Object.assign({ y: 0.8, n: 5 }, P.crowd || {});
      const crowd = C ? Array.from({ length: C.n }, (_, i) => { const g = el(root, 'g'); const body = inkEl(g, INK.paperDark), shield = SB.shield(el(g, 'g'), sd + 40 + i); return { body, shield, head: inkEl(g, INK.paperLight), helm: inkEl(g, INK.inkSoft), r: inkEl(g) }; }) : [];
      const labels = MCB.labels(el(root, 'g'), P.labels || [], W, H, sd + 300);
      const D = Object.assign({ at: 0.5, dur: 2.5, w: 0.55, h: 0.15 }, P.dust || {});
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const da = atOr(cues, D.at, 0.5), dp = lt < da ? 0 : prog(lt, da, D.dur);
          dust.update(t, { x: RX + Math.sin(t * 0.7) * 10, y: RY + 20, w: D.w * W * (1 + 0.08 * hit), h: D.h * H, p: dp });
          // column of tiny helmets + spears rising over the crest
          let cd = '', ct = '', ch = '', gd = '';
          if (P.column !== false) {
            const ca = atOr(cues, (P.column || {}).at, da + 0.6), n = (P.column || {}).n ?? 9;
            const cs = (P.column || {}).s ?? 1.8;
            for (let i = 0; i < n; i++) {
              const u = lt < ca ? 0 : prog(lt, ca + i * 0.08, 0.9), x = RX + (i - (n - 1) / 2) * 34 * cs, y = RY + 26 * cs - u * 46 * cs + Math.abs(Math.sin(t * 5 + i)) * 3;
              if (u <= 0.01) continue;
              const X = v => x + v * cs, Y = v => y + v * cs;
              cd += inkPath([[X(8), Y(10)], [X(12), Y(-80)]], { w: 4, seed: sd + 50 + i, t, amp: 0.5 }) + ' ';
              ct += inkLoop([[X(7), Y(-80)], [X(12), Y(-102)], [X(17), Y(-80)]], { seed: sd + 70 + i, t, amp: 0.3, smooth: false }) + ' ';
              ch += inkLoop([[X(-13), Y(0)], [X(-10), Y(-14)], [X(0), Y(-24)], [X(10), Y(-14)], [X(13), Y(0)]], { seed: sd + 90 + i, t, amp: 0.4 }) + ' ';
              if (P.glints !== false && Math.floor(t * 4 + i * 1.7) % 3 === 0) gd += inkLoop([[X(12), Y(-122)], [X(16), Y(-106)], [X(30), Y(-102)], [X(16), Y(-98)], [X(12), Y(-84)], [X(8), Y(-98)], [X(-6), Y(-102)], [X(8), Y(-106)]], { seed: sd + 110 + i, t, amp: 0.3, smooth: false }) + ' ';
            }
          }
          colE.setAttribute('d', cd); colT.setAttribute('d', ct); colH.setAttribute('d', ch); glint.setAttribute('d', gd);
          // ridge: hill shape from left to right, crest at the road, filled down past the bottom of the frame
          const rp = [[-40, RY + 110], [W * 0.2, RY + 60], [RX - 140, RY + 8], [RX, RY], [RX + 160, RY + 14], [W + 40, RY + 90]];
          ridgeF.setAttribute('d', inkLoop(rp.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 3, t, amp: 1, smooth: false }));
          ridgeR.setAttribute('d', inkPath(rp, { w: 6, seed: sd + 4, t, amp: 1 }));
          let hd = '';
          for (let k = 0; k < 16; k++) { const x = (k * 0.071 + 0.02) * W, y = RY + 140 + (k % 4) * 90 + (k * 37 % 50); hd += inkPath([[x, y], [x + 46, y - 4]], { w: 3, seed: sd + 130 + k, t, amp: 0.8 }) + ' '; }
          ridgeH.setAttribute('d', hd);
          // the road: a pale band from the crest down towards the viewer, widening
          const rl = [[RX - 14, RY + 2], [RX - 60, RY + 160], [RX - 10, RY + 340], [RX - 160, RY + 620], [RX - 330, H + 40]];
          const rr = [[RX + 14, RY + 2], [RX + 10, RY + 160], [RX + 90, RY + 340], [RX + 70, RY + 620], [RX + 60, H + 40]];
          road.setAttribute('d', inkLoop(rl.concat(rr.slice().reverse()), { seed: sd + 5, t, amp: 1 }));
          roadR.setAttribute('d', inkPath(rl, { w: 4, seed: sd + 6, t, amp: 1 }) + ' ' + inkPath(rr, { w: 4, seed: sd + 7, t, amp: 1 }));
          if (look) look.update(lt, t, cues, W, H);
          // foreground crowd: backs of helmeted heads + shoulders, shields on backs; they rise on the cue
          if (C) {
            const ra = atOr(cues, C.rise, null), rise = ra == null ? 0 : progIO(lt, ra, 0.7);
            crowd.forEach((c, i) => {
              const x = (i + 0.5) / C.n * W + (i % 2 ? 30 : -30), base = C.y * H + (i % 2 ? 90 : 0) - rise * (60 + (i % 3) * 25) + Math.sin(t * 1.4 + i) * 4;
              const R = 92 - (i % 2) * 6, turn = rise * (i % 2 ? 1 : -1) * 10;
              const bp = [[x - 230, H + 60], [x - 200, base + 150], [x - 120, base + 100], [x, base + 90], [x + 120, base + 100], [x + 200, base + 150], [x + 230, H + 60]];
              c.body.setAttribute('d', inkLoop(bp, { seed: sd + 200 + i, t, amp: 1 }));
              c.head.setAttribute('d', inkLoop(SB.ell(x + turn, base, R, R, 14), { seed: sd + 210 + i, t, amp: 1 }));
              const hp = [[x + turn - R - 4, base + 10], [x + turn - R + 4, base - 40], [x + turn - 40, base - R - 10], [x + turn, base - R - 36], [x + turn + 40, base - R - 10], [x + turn + R - 4, base - 40], [x + turn + R + 4, base + 10], [x + turn, base - 6]];
              c.helm.setAttribute('d', inkLoop(hp, { seed: sd + 220 + i, t, amp: 1 }));
              c.r.setAttribute('d', inkPath(bp, { w: 6, seed: sd + 230 + i, t, amp: 1 }) + ' ' + inkPath(hp, { w: 6, seed: sd + 240 + i, t, closed: true, amp: 1 }) + ' ' + inkPath([[x + turn - R - 2, base + 6], [x + turn, base - 2], [x + turn + R + 2, base + 6]], { w: 4, seed: sd + 250 + i, t, amp: 0.8 }));
              c.shield.update(t, { x: x + (i % 2 ? 120 : -120), y: base + 260, r: 120, side: 'nor', rot: i * 23, tilt: 1 });
            });
          }
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
