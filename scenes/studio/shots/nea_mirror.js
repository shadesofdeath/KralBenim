// nea_mirror: a tall carved standing mirror in a room; the host looks into it and his reflection is a Neanderthal
// wearing his red fez (Neanderthal DNA Short). Before the morph cue the glass shows the host's own round head + fez;
// on the cue a ripple runs over the glass, gold spikes burst round the frame and the reflection becomes a
// Neanderthal bust (ink-wash, heavy brow ridge, beard). Optional wave: the reflection waves back.
// P: {mirror: {x: 0.64, y: 0.4 (0..1, centre of the glass), rx: 230, ry: 330}, ground: 1130 (stage px),
//     morph: cue|s|0 (0 = Neanderthal from the start), wave: cue|s|false (the reflection raises a hand and waves),
//     bust_s: 2.0, bust_dx: 50, rug: true, rug_dy: 150 (rug centre below the ground line), kasif: {...MCB cast entry} | false, labels: [...MCB labels]}
// cues: whatever the params reference (morph, hit, ...); "hit" punches the frame.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.nea_mirror = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const { atOr, labels, cast, rr } = window.MCB;
      const sd = seed * 1000 + 5100;
      const M = Object.assign({ x: 0.64, y: 0.4, rx: 230, ry: 330 }, P.mirror || {});
      const cx = M.x * W, cy = M.y * H, GY = P.ground ?? 1130;
      const root = el(svg, 'g');
      // a patterned rug on the floor in front (fills the lower frame)
      const rugF = inkEl(root, INK.red), rugI = inkEl(root, INK.paperDark), rugL = inkEl(root, INK.ink);
      // stand (behind the frame)
      const standO = inkEl(root, INK.ink), standI = inkEl(root, INK.paperDark), standH = inkEl(root, INK.inkSoft);
      const glass = inkEl(root, INK.paperLight);
      const cid = 'neamir' + seed;
      const clip = el(defs, 'clipPath', { id: cid });
      const clipP = el(clip, 'path', { d: inkLoop(inkEllipsePts(cx, cy, M.rx - 6, M.ry - 6, sd + 1, 28, 0, 0.004), { amp: 0 }) });
      const inner = el(root, 'g', { 'clip-path': `url(#${cid})` });
      const tint = inkEl(inner, INK.paperDark);
      // the host's own reflection (round head + fez), then the Neanderthal bust
      const selfG = el(inner, 'g'), selfHead = inkEl(selfG, INK.paperLight), selfL = inkEl(selfG, INK.ink), selfFez = inkEl(selfG, INK.red), selfFezL = inkEl(selfG, INK.ink), selfBody = inkEl(selfG, INK.ink);
      const bust = NEA.fig(el(inner, 'g'), 'nean', sd + 40);
      const sheen = inkEl(inner, INK.paperLight), ripple = inkEl(inner, INK.inkSoft);
      const frameO = inkEl(root, INK.ink), frameI = inkEl(root, INK.paperDark), frameC = inkEl(root, INK.inkSoft), crest = inkEl(root, INK.paperDark), crestL = inkEl(root, INK.ink);
      const spikes = inkEl(root, INK.gold);
      const castG = el(root, 'g');
      const cs = P.kasif === false ? null : cast(castG, [Object.assign({ who: 'kasif', x: 0.24, y: GY / H, scale: 0.8, pose: 'point', face: 'right', dir: 15 }, P.kasif || {})], W, H, sd + 300);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const ell = (dx, dy, k, n = 28) => inkEllipsePts(cx, cy, M.rx + dx, M.ry + dy, sd + k, n, 0, 0.006);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const mAt = P.morph == null ? 0.8 : atOr(cues, P.morph, 0);
          const mp = prog(lt, mAt, 0.55), pk = punch(lt, mAt, 0.7) + punch(lt, atOr(cues, 'hit', null), 0.6);
          const sc = 1 + 0.03 * pk;
          root.setAttribute('transform', `translate(${NEA.f1(cx)} ${NEA.f1(cy)}) scale(${sc.toFixed(4)}) translate(${NEA.f1(-cx)} ${NEA.f1(-cy)})`);
          if (P.rug !== false) {
            const rcx = W * 0.5, rcy = GY + (P.rug_dy ?? 150), RX = 560, RY = 130;
            rugF.setAttribute('d', inkLoop(inkEllipsePts(rcx, rcy, RX, RY, sd + 180, 24, 0, 0.01), { seed: sd + 180, t, amp: 0.8 }));
            rugF.setAttribute('fill-opacity', 0.55);
            rugI.setAttribute('d', inkLoop(inkEllipsePts(rcx, rcy, RX * 0.8, RY * 0.72, sd + 181, 24, 0, 0.01), { seed: sd + 181, t, amp: 0.8 }));
            let rl = inkPath(inkEllipsePts(rcx, rcy, RX, RY, sd + 182, 24, 0, 0.01), { w: 6, seed: sd + 182, t, closed: true, amp: 0.8 }) + ' ' +
              inkPath(inkEllipsePts(rcx, rcy, RX * 0.8, RY * 0.72, sd + 183, 24, 0, 0.01), { w: 4, seed: sd + 183, t, closed: true, amp: 0.8 });
            for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; rl += ' ' + inkDot(rcx + Math.cos(a) * RX * 0.9, rcy + Math.sin(a) * RY * 0.86, 10, 6, sd + 184 + i, t); }
            rl += ' ' + inkPath([[rcx - RX * 0.45, rcy], [rcx, rcy - RY * 0.45], [rcx + RX * 0.45, rcy], [rcx, rcy + RY * 0.45]], { w: 5, seed: sd + 195, t, closed: true, smooth: false, amp: 0.8 });
            rugL.setAttribute('d', rl);
          }
          // stand: two splayed legs + a cross bar down to the floor
          const legs = [[[cx - M.rx * 0.55, cy + M.ry * 0.8], [cx - M.rx * 0.85, GY]], [[cx + M.rx * 0.55, cy + M.ry * 0.8], [cx + M.rx * 0.85, GY]],
            [[cx - M.rx * 0.74, GY - 120], [cx + M.rx * 0.74, GY - 120]]];
          standO.setAttribute('d', legs.map((l, i) => inkPath(l, { w: 30, seed: sd + 10 + i, t, amp: 1, taper: 0.05 })).join(' '));
          standI.setAttribute('d', legs.map((l, i) => inkPath(l, { w: 18, seed: sd + 13 + i, t, amp: 0.8, taper: 0.05 })).join(' '));
          standH.setAttribute('d', inkLoop(inkEllipsePts(cx, GY + 6, M.rx * 1.2, 14, sd + 16, 14), { seed: sd + 16, t, amp: 0.5 }));
          standH.setAttribute('fill-opacity', 0.35);
          glass.setAttribute('d', inkLoop(ell(0, 0, 2), { seed: sd + 2, t, amp: 0.8 }));
          tint.setAttribute('d', inkLoop([[cx - M.rx, cy + M.ry * 0.2], [cx + M.rx, cy - M.ry * 0.1], [cx + M.rx, cy + M.ry], [cx - M.rx, cy + M.ry]], { seed: sd + 3, t, amp: 1 }));
          tint.setAttribute('fill-opacity', 0.35);
          // reflection A: the host's head with the fez
          const sa = 1 - mp, wob = Math.sin(t * 2.1) * 4;
          if (sa > 0.01) {
            const hx = cx - 10, hy = cy - 40 + wob, r = 120;
            selfHead.setAttribute('d', inkCircle(hx, hy, r, sd + 20, t, { fill: true }));
            selfL.setAttribute('d', inkCircle(hx, hy, r, sd + 21, t, { w: 9 }) + ' ' + inkDot(hx - 52, hy - 4, 11, 11, sd + 22, t) + ' ' + inkDot(hx - 8, hy - 4, 11, 11, sd + 23, t) +
              ' ' + inkPath([[hx - 50, hy + 50], [hx - 10, hy + 50]], { w: 8, seed: sd + 24, t, amp: 0.8 }));
            const fz = [[hx - 70, hy - 96], [hx + 62, hy - 104], [hx + 46, hy - 200], [hx - 46, hy - 196]];
            selfFez.setAttribute('d', inkLoop(fz, { seed: sd + 25, t, amp: 0.8, smooth: false }));
            selfFezL.setAttribute('d', inkPath(fz, { w: 9, seed: sd + 26, t, closed: true, smooth: false, amp: 0.8 }));
            selfBody.setAttribute('d', inkPath([[hx, hy + r], [hx, cy + M.ry]], { w: 14, seed: sd + 27, t, amp: 1 }) + ' ' + inkPath([[hx - 140, cy + M.ry], [hx, hy + r + 60], [hx + 140, cy + M.ry]], { w: 14, seed: sd + 28, t, amp: 1 }));
            for (const e of [selfHead, selfL, selfFez, selfFezL, selfBody]) e.setAttribute('fill-opacity', sa.toFixed(3));
            selfG.style.display = '';
          } else selfG.style.display = 'none';
          // reflection B: the Neanderthal bust, mirrored (faces the host: left)
          const bs = P.bust_s ?? 2.0, wv = P.wave ? atOr(cues, P.wave, null) : null;
          const waving = wv != null && lt >= wv;
          bust.draw(t, { x: cx + (P.bust_dx ?? 50), y: cy - 30 + 316 * bs + wob, s: bs, face: -1, fez: true, a: mp, arm: waving ? 'wave' : 'hang', walk: 0 });
          // sheen + ripple on the morph
          let sh = '';
          for (let i = 0; i < 3; i++) { const o = -M.rx * 0.86 + i * 26; sh += inkPath([[cx + o, cy - M.ry * 0.3 + i * 24], [cx + o + 50, cy - M.ry * 0.52 + i * 24]], { w: 12 - i * 3, seed: sd + 30 + i, t, amp: 0.8 }) + ' '; }
          sheen.setAttribute('d', sh);
          sheen.setAttribute('fill-opacity', 0.9);
          const rp = lt >= mAt ? clamp01((lt - mAt) / 0.6) : 0;
          ripple.setAttribute('d', rp > 0 && rp < 1 ? [0, 1, 2].map(i => { const k = clamp01(rp * 1.4 - i * 0.2); return k > 0 ? inkPath(inkEllipsePts(cx, cy, M.rx * k, M.ry * k, sd + 33 + i, 24), { w: 7 * (1 - k) + 1, seed: sd + 33 + i, t, closed: true, amp: 1 }) : ''; }).join(' ') : '');
          // frame: carved oval ring + crest on top
          frameO.setAttribute('d', inkPath(ell(14, 14, 4), { w: 40, seed: sd + 4, t, closed: true, amp: 1 }));
          frameI.setAttribute('d', inkPath(ell(14, 14, 5), { w: 24, seed: sd + 5, t, closed: true, amp: 0.8 }));
          let fc = inkPath(ell(-2, -2, 6), { w: 5, seed: sd + 6, t, closed: true, amp: 1 });
          for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, x = cx + Math.cos(a) * (M.rx + 14), y = cy + Math.sin(a) * (M.ry + 14);
            fc += ' ' + inkDot(x, y, 4, 4, sd + 50 + i, t); }
          frameC.setAttribute('d', fc);
          const ct = [[cx - 70, cy - M.ry - 14], [cx - 40, cy - M.ry - 60], [cx, cy - M.ry - 84], [cx + 40, cy - M.ry - 60], [cx + 70, cy - M.ry - 14]];
          crest.setAttribute('d', inkLoop(ct, { seed: sd + 7, t, amp: 1 }));
          crestL.setAttribute('d', inkPath(ct, { w: 8, seed: sd + 8, t, closed: true, amp: 1 }) + ' ' + inkCircle(cx, cy - M.ry - 44, 14, sd + 9, t, { w: 6 }));
          // gold spikes round the frame on the morph
          const spk = lt >= mAt ? clamp01((lt - mAt) / 0.7) : 0;
          if (spk > 0 && spk < 1) {
            let d = '';
            for (let i = 0; i < 14; i++) {
              const a = i / 14 * Math.PI * 2 + 0.2, r0x = M.rx + 50 + spk * 40, r0y = M.ry + 50 + spk * 40, L = 70 * Math.sin(spk * Math.PI);
              const p0 = [cx + Math.cos(a) * r0x, cy + Math.sin(a) * r0y], p1 = [cx + Math.cos(a) * (r0x + L), cy + Math.sin(a) * (r0y + L)];
              if (p1[1] > GY - 20) continue;
              d += inkPath([p0, p1], { w: 12, seed: sd + 70 + i, t, amp: 0.8 }) + ' ';
            }
            spikes.setAttribute('d', d);
          } else spikes.setAttribute('d', '');
          if (cs) cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
