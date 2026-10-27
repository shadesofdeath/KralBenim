// moon_scope: telescopes of the 1835 Moon Hoax story (Stickstory ag-14). Three modes, all on the ground line:
//   "real"  — a long reflector tube hung from a tall wooden A-frame mast by ropes (like Herschel's 20-foot reflector at
//             the Cape), sweeping slowly; an observer (MOON.K) on the raised gallery at its mouth.
//   "lens"  — the hoax's impossible lens: a giant glass disc hanging from a wooden derrick, swinging, a glint sweeping
//             across; a dimension arrow across its top ("24 FEET", written on the glass) and a weight tag hanging on its left ("7 TONS") pop in; a tiny figure for scale.
//   "burn"  — the giant lens left facing the Sun: a gold beam converges on a wooden observatory, which starts to smoke
//             and then burns.
// Set: "night" / "hills" / "coast". Parchment ink style, palette tokens only, pure function of (seed, lt).
// P: {mode, x: 0.5, ground: 0.86, size: 1, flip: false (burn: lens on the right, observatory on the left), dim: {text: "24 FEET", at}, tag: {text: "7 TONS", at},
//     fire: {at (smoke), flame (flames)}, beam: {at}, sun: {x, y, r, rays: false} (burn: where the beam comes from; put it
//     on the set's own sun), observer: K, kasif: K, cast: [K], labels: [...]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const TAU = Math.PI * 2;

  SH.moon_scope = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const L = MOON.line, gy = (P.ground ?? 0.86) * H, cx = (P.x ?? 0.5) * W, S = P.size ?? 1, mode = P.mode || 'real';
      const root = el(svg, 'g');
      const ground = inkEl(root), grass = inkEl(root, INK.inkSoft);
      const sunF = inkEl(root, INK.gold), sunR = inkEl(root);
      const beam = inkEl(root, INK.gold), beamR = inkEl(root, INK.gold);
      const woodF = inkEl(root, INK.paperDark), wood = inkEl(root);
      const ropes = inkEl(root, INK.inkSoft);
      const tubeF = inkEl(root, INK.paperLight), tubeR = inkEl(root);
      const lensF = inkEl(root, mix(INK.blue, INK.paperLight, 0.68)), lensR = inkEl(root), glint = inkEl(root, INK.paperLight);
      const hutF = inkEl(root, INK.paperDark), hutR = inkEl(root);
      const smoke = inkEl(root, INK.inkSoft), flameF = inkEl(root, INK.red), flameG = inkEl(root, INK.gold);
      const dimG = el(root, 'g'), dimR = inkEl(dimG, INK.gold), dimTx = el(dimG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink });
      dimTx.textContent = (P.dim && P.dim.text) || '';
      const tagG = el(root, 'g'), tagF = inkEl(tagG, INK.paperLight), tagR = inkEl(tagG), tagTx = el(tagG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: INK.red });
      tagTx.textContent = (P.tag && P.tag.text) || '';
      const cast = [P.observer, P.kasif].concat(P.cast || []).filter(Boolean).map((c, i) => MOON.K(el(root, 'g'), c, seed * 3 + i * 7 + 1));
      const labels = (P.labels || []).map((l, i) => MOON.label(el(root, 'g'), l, W, H, seed * 41 + i * 7));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          ground.setAttribute('d', L([[-40, gy], [W + 40, gy + 4]], seed, t, 6, 1.2, 0.05));
          let gr = ''; const rr = rng(seed * 13);
          for (let i = 0; i < 30; i++) { const x = rr() * W, y = gy + 14 + rr() * (H - gy - 14); gr += L([[x, y], [x + 16 + rr() * 26, y - 2]], seed + 10 + i, t, 3) + ' '; }
          grass.setAttribute('d', gr);
          let wf = '', wd = '', rp = '';
          if (mode === 'real') {
            // A-frame mast
            const mx = cx + 180 * S, top = gy - 720 * S;
            for (const k of [-1, 1]) wd += L([[mx + k * 150 * S, gy], [mx, top]], seed + 20 + k, t, 10, 1, 0.05) + ' ';
            for (let i = 1; i < 6; i++) { const y = lerp(gy, top, i / 6), hw = 150 * S * (1 - i / 6); wd += L([[mx - hw, y], [mx + hw, y]], seed + 30 + i, t, 4) + ' '; }
            wd += L([[mx - 40 * S, top + 10], [mx + 40 * S, top + 10]], seed + 39, t, 8);
            // tube: lower end on a wheeled cart, upper end raised; sweeps slowly
            const ang = (-33 + Math.sin(lt * 0.35) * 2.5) * Math.PI / 180, len = 660 * S, r = 46 * S;
            const b0 = [cx - 360 * S, gy - 90 * S], b1 = [b0[0] + Math.cos(ang) * len, b0[1] + Math.sin(ang) * len];
            const nx = -Math.sin(ang) * r, ny = Math.cos(ang) * r;
            const tube = [[b0[0] + nx, b0[1] + ny], [b1[0] + nx, b1[1] + ny], [b1[0] - nx, b1[1] - ny], [b0[0] - nx, b0[1] - ny]];
            tubeF.setAttribute('d', inkLoop(tube, { seed: seed + 50, t, amp: 0.8, smooth: false }));
            let tr = inkPath(tube, { w: 6, seed: seed + 51, t, amp: 0.8, closed: true, smooth: false }) + ' ';
            for (let i = 1; i < 5; i++) { const q = i / 5, p = [lerp(b0[0], b1[0], q), lerp(b0[1], b1[1], q)]; tr += L([[p[0] + nx, p[1] + ny], [p[0] - nx, p[1] - ny]], seed + 52 + i, t, 4) + ' '; }
            tr += inkCircle(b1[0], b1[1], r * 0.9, seed + 58, t, { w: 5, ry: r * 0.5, rot: ang + Math.PI / 2 });
            tubeR.setAttribute('d', tr);
            wd += inkCircle(b0[0] - 30 * S, gy - 34 * S, 32 * S, seed + 60, t, { w: 6 }) + ' ' + inkCircle(b0[0] + 70 * S, gy - 34 * S, 32 * S, seed + 61, t, { w: 6 }) + ' ' + L([[b0[0] - 70 * S, gy - 66 * S], [b0[0] + 110 * S, gy - 66 * S]], seed + 62, t, 8) + ' ' + L([[b0[0], gy - 66 * S], b0], seed + 63, t, 7);
            // gallery for the observer near the mouth
            const gx = b1[0] - 40 * S, gyy = b1[1] + 150 * S;
            wd += L([[gx - 110 * S, gyy], [gx + 110 * S, gyy]], seed + 64, t, 8) + ' ' + L([[gx - 100 * S, gyy], [gx - 100 * S, gy]], seed + 65, t, 6) + ' ' + L([[gx + 100 * S, gyy], [gx + 100 * S, gy]], seed + 66, t, 6);
            for (let i = 1; i < 6; i++) { const y = lerp(gy, gyy, i / 6); wd += L([[gx - 100 * S, y], [gx - 60 * S, y]], seed + 70 + i, t, 3) + ' '; }
            rp += L([[mx, top + 10], b1], seed + 80, t, 3) + ' ' + L([[mx, top + 10], [lerp(b0[0], b1[0], 0.6), lerp(b0[1], b1[1], 0.6)]], seed + 81, t, 3) + ' ' + L([[mx, top + 10], [mx + 60, gy]], seed + 82, t, 3);
          } else if (mode === 'lens' || mode === 'burn') {
            const R = (mode === 'lens' ? 300 : 210) * S;
            const dirn = P.flip ? -1 : 1, lx = mode === 'lens' ? cx : cx - 300 * S * dirn, ly = mode === 'lens' ? gy - 160 * S - R : gy - 80 * S - R;
            const sw = mode === 'lens' ? Math.sin(lt * 1.1) * 4 * Math.PI / 180 : 0;
            // derrick (lens) or mount (burn)
            let hx = lx, hy = ly;
            if (mode === 'lens') {
              const tx = lx, ty = gy - 160 * S - 2 * R - 190 * S;
              for (const k of [-1, 1]) wd += L([[lx + k * (R + 140 * S), gy], [tx + k * 30, ty]], seed + 90 + k, t, 11, 1, 0.05) + ' ';
              wd += L([[tx - 90, ty], [tx + 90, ty]], seed + 93, t, 12, 1, 0.05) + ' ' + inkCircle(tx, ty + 20, 18, seed + 94, t, { w: 5 });
              const pv = [tx, ty + 30];
              hx = pv[0] + Math.sin(sw) * (ly - pv[1]); hy = pv[1] + Math.cos(sw) * (ly - pv[1]);
              rp += L([pv, [hx - R * 0.6, hy - R * 0.8]], seed + 95, t, 4) + ' ' + L([pv, [hx + R * 0.6, hy - R * 0.8]], seed + 96, t, 4) + ' ' + L([[tx + 30, ty + 10], [lx + R + 160 * S, gy - 10]], seed + 97, t, 3);
            } else {
              wd += L([[lx - 90 * S, gy], [lx, ly + R * 0.6], [lx + 90 * S, gy]], seed + 98, t, 10, 1, 0.05) + ' ' + L([[lx - 120 * S, gy], [lx + 120 * S, gy]], seed + 99, t, 9);
            }
            const tilt = mode === 'burn' ? 0.55 : 1;
            lensF.setAttribute('d', inkLoop(inkEllipsePts(hx, hy, R * tilt, R, seed + 100, 22, sw), { seed: seed + 100, t, amp: 1 }));
            lensF.setAttribute('fill-opacity', 0.85);
            lensR.setAttribute('d', inkPath(inkEllipsePts(hx, hy, R * tilt, R, seed + 100, 22, sw), { w: 12, seed: seed + 101, t, closed: true, amp: 1 }) + ' ' +
              inkPath(inkEllipsePts(hx, hy, R * tilt * 0.88, R * 0.88, seed + 102, 22, sw), { w: 3, seed: seed + 103, t, closed: true, amp: 1 }));
            const gq = ((lt * 0.45) % 1), gx = hx + lerp(-0.7, 0.7, gq) * R * tilt;
            glint.setAttribute('d', inkLoop([[gx - 30 * tilt, hy - R * 0.6], [gx + 10 * tilt, hy - R * 0.6], [gx - 20 * tilt, hy + R * 0.6], [gx - 60 * tilt, hy + R * 0.6]], { seed: seed + 104, t, amp: 1, smooth: false }));
            glint.setAttribute('fill-opacity', 0.7 * Math.sin(gq * Math.PI));
            if (mode === 'lens') {
              const da = MOON.at(cues, P.dim && P.dim.at, 0.6), dp = clamp01((lt - da) / 0.6);
              dimG.style.visibility = P.dim && lt >= da ? 'visible' : 'hidden';
              if (P.dim) {
                const y = hy - R - 24 * S, x0 = hx - R, x1 = hx + R, m = (x0 + x1) / 2, hw = (x1 - x0) / 2 * dp;
                dimR.setAttribute('d', L([[m - hw, y], [m + hw, y]], seed + 110, t, 7) + ' ' + L([[m - hw + 30, y - 22], [m - hw, y], [m - hw + 30, y + 22]], seed + 111, t, 7) + ' ' + L([[m + hw - 30, y - 22], [m + hw, y], [m + hw - 30, y + 22]], seed + 112, t, 7));
                dimTx.setAttribute('x', m); dimTx.setAttribute('y', y + 175 * S); dimTx.style.visibility = dp > 0.6 ? 'visible' : 'hidden';
              }
              const ta = MOON.at(cues, P.tag && P.tag.at, 1.2), tp = spring(lt, ta, 0.8);
              tagG.style.visibility = P.tag && lt >= ta ? 'visible' : 'hidden';
              if (P.tag) {
                const ax = hx - R * 0.95, ay = hy + R * 0.2, swing = Math.sin(lt * 2.2) * 6, ty = ay + 150, tw = 140;
                tagG.setAttribute('transform', `rotate(${swing.toFixed(2)} ${ax} ${ay}) translate(${ax} ${ay}) scale(${Math.max(0.01, tp).toFixed(3)}) translate(${-ax} ${-ay})`);
                const q = [[ax - tw, ty - 50], [ax + tw, ty - 50], [ax + tw, ty + 40], [ax - tw, ty + 40]];
                tagF.setAttribute('d', inkLoop(q, { seed: seed + 120, t, amp: 1, smooth: false }));
                tagR.setAttribute('d', inkPath(q, { w: 6, seed: seed + 121, t, closed: true, amp: 1, smooth: false }) + ' ' + L([[ax, ay], [ax, ty - 50]], seed + 122, t, 4) + ' ' + inkCircle(ax, ty - 38, 7, seed + 123, t, { w: 3 }));
                tagTx.setAttribute('x', ax); tagTx.setAttribute('y', ty + 24);
              }
            } else {
              dimG.style.visibility = 'hidden'; tagG.style.visibility = 'hidden';
              // sun, beam, observatory hut on fire
              const sx = P.sun ? P.sun.x * W : lx - 330 * S * dirn, sy = P.sun ? P.sun.y * H : 250, sr = P.sun ? (P.sun.r ?? 70) : 70, ray = P.sun && P.sun.rays === false ? 0 : 1;
              sunF.setAttribute('d', inkCircle(sx, sy, sr, seed + 130, t, { fill: true }));
              let srr = inkCircle(sx, sy, sr, seed + 131, t, { w: 5 }) + ' ';
              for (let i = 0; i < 14 * ray; i++) { const a = lt * 0.4 + i / 14 * TAU; srr += L([[sx + Math.cos(a) * (sr + 12), sy + Math.sin(a) * (sr + 12)], [sx + Math.cos(a) * (sr + (i % 2 ? 30 : 50)), sy + Math.sin(a) * (sr + (i % 2 ? 30 : 50))]], seed + 132 + i, t, 4) + ' '; }
              sunR.setAttribute('d', srr);
              const ox = cx + 420 * S * dirn, oyy = gy;
              const ba = MOON.at(cues, P.beam && P.beam.at, 0.3), bp = clamp01((lt - ba) / 0.8);
              const fx = lerp(hx, ox - 40 * S * dirn, bp), fy = lerp(hy, oyy - 150 * S, bp);
              beam.setAttribute('d', bp > 0 ? inkLoop([[sx + 40 * dirn, sy + 40], [hx - 20 * dirn, hy - R * 0.9], [hx - 20 * dirn, hy + R * 0.9]], { seed: seed + 140, t, amp: 1.5, smooth: false }) + ' ' + inkLoop([[hx + 20 * dirn, hy - R * 0.85], [fx, fy], [hx + 20 * dirn, hy + R * 0.85]], { seed: seed + 141, t, amp: 1.5, smooth: false }) : '');
              beam.setAttribute('fill-opacity', 0.45);
              beamR.setAttribute('d', bp >= 1 ? inkDot(fx, fy, 16 + Math.sin(lt * 12) * 4, 16, seed + 142, t) : '');
              // observatory: a wooden hut with a little dome
              const hq = [[ox - 150 * S, oyy], [ox - 150 * S, oyy - 230 * S], [ox + 150 * S, oyy - 230 * S], [ox + 150 * S, oyy]];
              const dome = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; dome.push([ox + Math.cos(a) * 120 * S, oyy - 230 * S + Math.sin(a) * 100 * S]); }
              hutF.setAttribute('d', inkLoop(hq, { seed: seed + 150, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(dome, { seed: seed + 151, t, amp: 0.8 }));
              let hr = inkPath(hq, { w: 5, seed: seed + 152, t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkPath(dome, { w: 5, seed: seed + 153, t, closed: true, amp: 0.8 }) + ' ';
              for (let i = 1; i < 6; i++) hr += L([[ox - 150 * S + i * 50 * S, oyy - 226 * S], [ox - 150 * S + i * 50 * S, oyy - 4]], seed + 154 + i, t, 2.5) + ' ';
              hr += inkPath([[ox + 30 * S, oyy], [ox + 30 * S, oyy - 120 * S], [ox + 100 * S, oyy - 120 * S], [ox + 100 * S, oyy]], { w: 5, seed: seed + 160, t, amp: 0.8, smooth: false });
              hutR.setAttribute('d', hr);
              const sa = MOON.at(cues, P.fire && P.fire.at, 1.2), fa = MOON.at(cues, P.fire && P.fire.flame, sa + 0.8);
              const sk = clamp01((lt - sa) / 1.5), fk = clamp01((lt - fa) / 1.2);
              let sm = '';
              if (sk > 0) for (let i = 0; i < 4; i++) {
                const ph = (lt * 0.35 + i / 4) % 1, pts = [];
                for (let j = 0; j <= 8; j++) { const q = j / 8; pts.push([ox - 60 * S + i * 40 * S + Math.sin(q * 5 + lt * 1.5 + i) * (16 + 30 * q) + q * 50, oyy - 300 * S - (ph * 300 + q * 90) * sk]); }
                sm += inkPath(pts, { w: lerp(14, 4, ph) * sk, seed: seed + 170 + i, t, amp: 1.2, taper: 0.6 }) + ' ';
              }
              smoke.setAttribute('d', sm);
              let ff = '', fg = '';
              if (fk > 0) for (let i = 0; i < 5; i++) {
                const bx = ox - 120 * S + i * 60 * S, h = (90 + 60 * Math.sin(lt * 7 + i * 2)) * S * fk, by = oyy - 230 * S - (i % 2) * 40 * S;
                ff += inkLoop([[bx - 34 * S, by], [bx - 10 * S, by - h * 0.6], [bx + Math.sin(lt * 5 + i) * 14, by - h], [bx + 12 * S, by - h * 0.55], [bx + 34 * S, by]], { seed: seed + 180 + i, t, amp: 2 }) + ' ';
                fg += inkLoop([[bx - 14 * S, by], [bx, by - h * 0.5], [bx + 14 * S, by]], { seed: seed + 190 + i, t, amp: 1.5 }) + ' ';
              }
              flameF.setAttribute('d', ff); flameG.setAttribute('d', fg);
            }
          }
          wood.setAttribute('d', wd); woodF.setAttribute('d', wf); ropes.setAttribute('d', rp);
          cast.forEach(c => c.update(lt, t, cues, W, H));
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
