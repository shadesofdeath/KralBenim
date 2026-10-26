// ce_wire: a 19th-century telegraph office: desk, Morse key, sounder, a row of glass battery jars and the line wire
// running out through the wall to a pole. mode "spark": the key and sounder throw sparks, the paper tape catches
// fire; mode "unplug": the battery lead is pulled off (red cross over the jars) and the key keeps working, gold
// pulses run down the line toward a sign. Carrington Event Short (Stickstory 2026-10-26), parametric.
// Uses ce__lib.js (CE) and td__lib.js (TD.label). Palette tokens only, boil 8 Hz, pure function of (seed, lt).
// P: {
//   mode: "spark" | "unplug",
//   spark_at: cue (spark mode: bursts start), unplug_at: cue (lead pops off the battery), flow_at: cue (pulses start),
//   desk: {x: 0.47, y: 0.52, w: 840, s: 1.3 (instrument scale)}, sign: {text: "PORTLAND", at: cue, x: 0.62, y} | false,
//   cross_r: 100 (red X radius over the jars),
//   clock: {x: 0.26, y: 0.27, r: 105} | false (wall clock, minute hand sweeps),
//   cast: [{who: "man", ...}] (operator), kasif: K | false, labels: [...], stamp: {text, at, ...}, cam: {zoom: 1.06}
// }   cues: hit (punch), spark_at, unplug_at, flow_at, seq / label names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.ce_wire = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const CE = window.CE, TD = window.TD, f1 = CE.f1, atOr = CE.atOr, sd = seed * 1000 + 877;
      const mode = P.mode || 'spark';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const DK = Object.assign({ x: 0.47, y: 0.52, w: 840, s: 1.3 }, P.desk || {}), IS = DK.s;
      const wallR = inkEl(cam), winF = inkEl(cam, INK.paperLight), winR = inkEl(cam);
      const poleO = CE.pole(cam, sd + 1), lineOut = CE.wire(cam, sd + 2), lineIn = CE.wire(cam, sd + 3);
      const CL = P.clock === false ? null : Object.assign({ x: 0.26, y: 0.27, r: 105 }, P.clock || {});
      const clkF = CL ? inkEl(cam, INK.paperLight) : null, clkR = CL ? inkEl(cam) : null;
      const dsk = CE.desk(cam, sd + 4);
      const tapeF = inkEl(cam, INK.paperLight), tapeR = inkEl(cam), dashes = inkEl(cam, INK.ink);
      const flame = inkEl(cam, INK.red, { 'fill-opacity': 0.85 }), flameG = inkEl(cam, INK.gold);
      const snd = CE.sounder(cam, sd + 5), ky = CE.key(cam, sd + 6), bat = CE.battery(cam, sd + 7);
      const lead = inkEl(cam), cross = inkEl(cam, INK.red);
      const sp = [CE.spark(cam, sd + 8), CE.spark(cam, sd + 9), CE.spark(cam, sd + 10)];
      const SG = P.sign ? Object.assign({ text: 'PORTLAND' }, P.sign) : null;
      const signF = SG ? inkEl(cam, INK.paperLight) : null, signR = SG ? inkEl(cam) : null;
      const signT = SG ? el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 54, 'text-anchor': 'middle', fill: INK.ink }) : null;
      if (signT) signT.textContent = SG.text;
      const castG = el(root, 'g');
      const cast = (P.cast || []).map((K, i) => CE.fig(castG, Object.assign({ who: 'man', scale: 0.8, pose: 'point', face: 'right', dir: -30 }, K), sd + 40 + i * 13));
      const kas = P.kasif ? CE.fig(castG, Object.assign({ x: 0.86, y: 0.6, scale: 0.75, pose: 'point', face: 'left' }, P.kasif), sd + 80) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 100 + i));
      const STP = P.stamp ? Object.assign({ x: 0.5, y: 0.2, size: 110, rot: -6, box: true, font: 'serif', color: 'red', underline: false }, P.stamp) : null;
      const stamp = STP ? TD.label(root, STP, W, H, sd + 130) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const sa = atOr(cues, P.spark_at, mode === 'spark' ? 0.3 : null), spk = sa == null ? 0 : (lt >= sa ? 1 : 0);
          const ua = atOr(cues, P.unplug_at, null), un = ua == null ? 0 : (lt >= ua ? spring(lt, ua, 0.5) : 0);
          const fa = atOr(cues, P.flow_at, mode === 'unplug' ? (ua ?? 0.5) + 0.3 : null), flow = fa == null ? 0 : (lt >= fa ? clamp01((lt - fa) / 0.3) : 0);
          let shake = 0;
          if (sa != null && lt >= sa && lt < sa + 0.4) shake = Math.sin(lt * 90) * 8 * (1 - (lt - sa) / 0.4);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
          const fx = DK.x * W, fy = DK.y * H;
          cam.setAttribute('transform', `translate(${f1(fx + shake)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const GY = 0.6 * H, dx = DK.x * W, dy = DK.y * H;
          // wall + window with the pole outside
          const wx = 0.74 * W, wy = 0.27 * H, ww = 280, wh = 300, WR = CE.rect(wx - ww / 2, wy - wh / 2, ww, wh);
          wallR.setAttribute('d', inkPath([[-40, GY + 4], [W + 40, GY - 4]], { w: 6, seed: sd + 11, t }));
          winF.setAttribute('d', inkLoop(WR, { seed: sd + 12, t, amp: 1, smooth: false }));
          const tops = poleO.update(t, wx + 60, wy + wh / 2 - 20, 250, 0.7);
          winR.setAttribute('d', inkPath(WR, { w: 8, seed: sd + 13, t, closed: true, amp: 1, smooth: false }) + ' ' + inkPath([[wx, wy - wh / 2], [wx, wy + wh / 2]], { w: 5, seed: sd + 14, t }));
          if (CL) {   // wall clock: the minute hand sweeps (night shift)
            const cx = CL.x * W, cy = CL.y * H, r = CL.r, C = CE.ell(cx, cy, r, r, 18);
            clkF.setAttribute('d', inkLoop(C, { seed: sd + 60, t, amp: 1 }));
            const am = -Math.PI / 2 + lt * 1.2, ah = -Math.PI / 2 + 0.6 + lt * 0.1;
            let d = inkPath(C, { w: 7, seed: sd + 61, t, closed: true, amp: 1 }) + ' ' + inkPath([[cx, cy], [cx + Math.cos(am) * r * 0.78, cy + Math.sin(am) * r * 0.78]], { w: 6, seed: sd + 62, t }) + ' ' +
              inkPath([[cx, cy], [cx + Math.cos(ah) * r * 0.5, cy + Math.sin(ah) * r * 0.5]], { w: 8, seed: sd + 63, t }) + ' ' + inkDot(cx, cy, 9, 9, sd + 64, t);
            for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; d += ' ' + inkPath([[cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8], [cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92]], { w: k % 3 ? 3 : 6, seed: sd + 70 + k, t, amp: 0.6 }); }
            d += ' ' + inkPath([[cx, cy - r], [cx, cy - r - 40]], { w: 4, seed: sd + 85, t });
            clkR.setAttribute('d', d);
          }
          // desk and instruments
          dsk.update(t, dx, dy, DK.w, GY - dy - 34);
          const press = mode === 'unplug' ? (Math.sin(lt * 9) > 0.2 ? 1 : 0) : (lt < (sa ?? 0) ? (Math.sin(lt * 8) > 0.3 ? 1 : 0) : 0);
          const K = ky.update(t, dx - DK.w * 0.2, dy, 0.9 * IS, press);
          snd.update(t, dx + DK.w * 0.1, dy, 0.8 * IS, press);
          const B = bat.update(t, dx + DK.w * 0.36, dy, 0.6 * IS, 2);
          // paper tape with dashes
          const tx0 = dx - DK.w * 0.47, ty = dy - 14;
          const TP = CE.rect(tx0, ty - 20, 150, 20);
          tapeF.setAttribute('d', inkLoop(TP, { seed: sd + 15, t, amp: 0.6, smooth: false }));
          tapeR.setAttribute('d', inkPath(TP, { w: 3, seed: sd + 16, t, closed: true, amp: 0.6, smooth: false }));
          let dd = ''; for (let k = 0; k < 5; k++) { const x = tx0 + 14 + k * 27; dd += inkDot(x, ty - 10, k % 2 ? 9 : 4, 3.5, sd + 17 + k, t) + ' '; }
          dashes.setAttribute('d', dd);
          if (mode === 'spark' && spk) {
            const pts = []; for (let i = 0; i < 6; i++) { const u = i / 5; pts.push([tx0 + 10 + u * 130 + Math.sin(t * 10 + i) * 6, ty - 20 - Math.sin(u * Math.PI) * (90 + 30 * CE.hz(i, t, sd)) * clamp01((lt - sa) / 0.6)]); }
            flame.setAttribute('d', inkLoop([[tx0 + 4, ty - 18]].concat(pts, [[tx0 + 148, ty - 18]]), { seed: sd + 20, t, amp: 2 }));
            flameG.setAttribute('d', inkLoop([[tx0 + 40, ty - 18]].concat(pts.slice(1, 5).map(([a, b]) => [a, lerp(ty - 18, b, 0.55)]), [[tx0 + 112, ty - 18]]), { seed: sd + 21, t, amp: 2 }));
          } else { flame.setAttribute('d', ''); flameG.setAttribute('d', ''); }
          // lead from the battery to the key (pops off in unplug mode) and the line from the sounder out the window
          const term = B.last, post = K.post;
          const end = [lerp(term[0], term[0] + 70, un), lerp(term[1], term[1] - 120, un) + un * Math.sin(lt * 6) * 6];
          lead.setAttribute('d', inkPath([post, [lerp(post[0], end[0], 0.5), Math.max(post[1], end[1]) + 40], end], { w: 5, seed: sd + 22, t, amp: 0.8 }) +
            (un > 0.05 ? ' ' + inkDot(end[0], end[1], 10, 10, sd + 23, t) : ''));
          const cpx = un > 0.02 ? 1 : 0;
          cross.setAttribute('d', cpx ? (() => { const cx = dx + DK.w * 0.36, cy = dy - 70 * IS, R = (P.cross_r ?? 100) * Math.min(1, un * 1.4); return inkPath([[cx - R, cy - R * 0.8], [cx + R, cy + R * 0.8]], { w: 16, seed: sd + 24, t, taper: 0.3 }) + ' ' + inkPath([[cx + R, cy - R * 0.8], [cx - R, cy + R * 0.8]], { w: 16, seed: sd + 25, t, taper: 0.3 }); })() : '');
          const sx = dx + DK.w * 0.1 + 56 * IS, sy = dy - 150 * IS;
          lineIn.update(t, [sx, sy], [wx - ww / 2 + 10, wy + 40], 60, flow, 3, 5);
          lineOut.update(t, [wx - ww / 2 + 10, wy + 40], tops[0], 20, flow, 2, 4);
          if (mode === 'spark') {
            const pk = spk ? 1 : 0;
            sp[0].update(t, K.contact[0], K.contact[1] - 10, 1.8, pk * (0.7 + 0.3 * Math.sin(t * 20)));
            sp[1].update(t, sx, sy - 10, 1.6, pk * (0.7 + 0.3 * Math.sin(t * 17 + 1)));
            sp[2].update(t, wx - ww / 2 + 10, wy + 40, 1.2, pk * (0.6 + 0.4 * Math.sin(t * 23 + 2)));
          } else sp.forEach(s => s.update(t, 0, 0, 1, 0));
          if (SG) {
            const a = atOr(cues, SG.at, 0.3), p = lt >= a ? spring(lt, a, 0.5) : 0;
            const cx = (SG.x ?? 0.62) * W, cy = (SG.y != null ? SG.y * H : wy - wh / 2 - 70), sw = 340 * p, sh = 84 * p;
            const R = CE.rect(cx - sw / 2, cy - sh / 2, sw, sh);
            signF.setAttribute('d', p > 0.02 ? inkLoop(R, { seed: sd + 30, t, amp: 0.8, smooth: false }) : '');
            signR.setAttribute('d', p > 0.02 ? inkPath(R, { w: 5, seed: sd + 31, t, closed: true, amp: 0.8, smooth: false }) + ' ' + inkPath([[cx + sw / 2 + 10, cy], [cx + sw / 2 + 50, cy - 10], [cx + sw / 2 + 36, cy + 14]], { w: 5, seed: sd + 32, t, smooth: false }) : '');
            signT.setAttribute('x', f1(cx)); signT.setAttribute('y', f1(cy + 18)); signT.setAttribute('opacity', clamp01(p * 2).toFixed(3));
          }
          cast.forEach(c => c.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          labels.forEach(l => l && l.update(lt, t, cues));
          if (stamp) stamp.update(lt, t, cues);
        },
      };
    },
  };
})();
