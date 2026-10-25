// td_space + td_orbit: open space on parchment (ink stars, Earth, Sun) for the tardigrades-in-space Short
// (Stickstory 2026-10-25), parametric. Uses td__lib.js (window.TD). BRAND.md §3/§5: palette tokens only, boil 8 Hz,
// pure function of (seed, lt).
//
// SHOTS.td_space P: {
//   stars: 26,                                             // number of stars (0 = none)
//   earth: {x: 0.5, y: 1.08, r: 0.9 (fraction of W), land: true, fill: true (false = horizon arc + hatching only)} | false,   // big globe; y = centre (0..1 H), often below the frame
//   sun: {x: 0.82, y: 0.2, r: 90} | false,
//   bear: {x: 0.5, y: 0.42, s: 1.1, rot: -8, face: 1, dry: 0, dry_at: cue (curls into a tun), at: cue|sec (floats in), drift: true, drift_k: 1 (drift speed), drift_amp: 1} | false,
//   button: {x: 0.33, y: 0.6, r: 60, at: cue (pressed: sinks), icon: "power"|"pause"} | false,
//   sat: {x: 0.32, y: 0.36, s: 0.5, rot: 0, tuns: 6, strap_at: cue (straps run over the tray), lid: 1,
//         drift: true, at} | false,
//   uv: {at: cue, n: 3} (zig-zag UV rays from the sun to the satellite tray; tuns flash red) | false,
//   stamp: {text: "FIRST", at: cue, x: 0.5, y: 0.25, size: 150, rot: -8} (red box stamp that slams in) | false,
//   labels: [{text, x, y, at, size, color, font: "hand"|"serif", box, underline}],
//   kasif: {x, y (ground, 0..1 H), scale, pose, face, dir, emotion, seq} | false,
//   cam: {zoom: 1.06}
// }   cues: hit (punch), strap_at / uv.at / stamp.at / labels / seq names
//
// SHOTS.td_orbit P: {
//   earth: {x: 0.5, y: 0.47, r: 230}, orbit: {rx: 380, ry: 120, tilt: -10, speed: 0.45 (laps per second)},
//   sat_s: 0.2, days: {from: 1, to: 10, at: cue|sec, dur: 3, x: 0.5, y: 0.2, label: "DAY"} (Fraunces day counter +
//   tally marks), stars: 22, labels: [...], kasif: K | false
// }   cues: hit, days.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.td_space = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const TD = window.TD, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 401;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const st = P.stars === 0 ? null : TD.stars(cam, sd + 1, W, H, P.stars ?? 26, 0.16, 0.62);
      const SU = P.sun ? Object.assign({ x: 0.82, y: 0.2, r: 90 }, P.sun) : null, sun = SU ? TD.sun(cam, sd + 2) : null;
      const E = P.earth === false ? null : Object.assign({ x: 0.5, y: 1.08, r: 0.9 }, P.earth || {});
      const earth = E ? TD.earth(cam, defs, sd + 3) : null;
      const SA = P.sat ? Object.assign({ x: 0.32, y: 0.36, s: 0.5, rot: 0, tuns: 6, lid: 1, drift: true }, P.sat) : null;
      const sat = SA ? TD.sat(el(cam, 'g'), sd + 4) : null;
      const UV = P.uv || null, bolts = UV ? Array.from({ length: UV.n || 3 }, (_, i) => TD.bolt(cam, sd + 10 + i)) : [];
      const B = P.bear ? Object.assign({ x: 0.5, y: 0.42, s: 1.1, rot: -8, face: 1, dry: 0, drift: true }, P.bear) : null;
      const bear = B ? TD.bear(el(cam, 'g'), sd + 5) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(cam, L, W, H, sd + 30 + i));
      const STP = P.stamp ? Object.assign({ text: 'FIRST', x: 0.5, y: 0.25, size: 150, rot: -8, box: true, font: 'serif', color: 'red', underline: false }, P.stamp) : null;
      const stamp = STP ? TD.label(cam, STP, W, H, sd + 50) : null;
      const BT = P.button ? Object.assign({ x: 0.33, y: 0.6, r: 60, icon: 'power' }, P.button) : null, btn = BT ? TD.button(cam, sd + 60) : null;
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.2, y: 0.6, scale: 0.8, pose: 'look', face: 'right' }, P.kasif), sd + 6) : null;
      const zoom = (P.cam && P.cam.zoom) || 1.06;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = W * 0.5, fy = H * 0.42;
          let shake = 0;
          if (STP) { const a = atOr(cues, STP.at, null); if (a != null && lt >= a && lt < a + 0.35) shake = Math.sin(lt * 90) * 8 * (1 - (lt - a) / 0.35); }
          cam.setAttribute('transform', `translate(${f1(fx + shake)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          if (st) st.update(t);
          if (sun) sun.update(t, SU.x * W, SU.y * H, SU.r * (1 + 0.03 * Math.sin(t * 2)));
          if (earth) earth.update(t, E.x * W, E.y * H, E.r * W, E.land !== false, E.fill !== false);
          let tray = null, glow = 0;
          if (UV) { const a = atOr(cues, UV.at, dur * 0.4); glow = lt >= a ? clamp01((lt - a) / 0.3) * (0.6 + 0.4 * Math.sin(lt * 18)) : 0; }
          if (sat) {
            const a = atOr(cues, SA.at, null), pin = a == null ? 1 : (lt >= a ? spring(lt, a, 0.7) : 0);
            const sa = atOr(cues, SA.strap_at, null), strap = sa == null ? 1 : prog(lt, sa, 0.45);
            const dx = SA.drift ? Math.sin(lt * 0.7) * 14 : 0, dy = SA.drift ? Math.cos(lt * 0.9) * 10 : 0;
            const r = sat.update(t, { x: SA.x * W + dx + (1 - pin) * W * 0.5, y: SA.y * H + dy, s: SA.s * (1 + 0.05 * punch(lt, sa, 0.5)), rot: SA.rot + (SA.drift ? Math.sin(lt * 0.5) * 3 : 0), tuns: SA.tuns, strap, glow, lid: SA.lid });
            tray = r.tray;
          }
          if (UV && sun && tray) {
            const a = atOr(cues, UV.at, dur * 0.4);
            bolts.forEach((b, i) => {
              const d = a + i * 0.12, p = lt >= d ? prog(lt, d, 0.35) : 0;
              const from = [SU.x * W - SU.r * 0.6, SU.y * H + SU.r * 0.5 + i * 18], to = [tray[0] + (i - 1) * 50, tray[1] + (i - 1) * 16];
              b.update(t, from, to, p);
            });
          }
          if (bear) {
            const a = atOr(cues, B.at, null), pin = a == null ? 1 : (lt >= a ? spring(lt, a, 0.8) : 0);
            const dk = B.drift_k ?? 1, da = B.drift_amp ?? 1;
            const dx = B.drift ? Math.sin(lt * 0.8 * dk) * 18 * da : 0, dy = B.drift ? Math.sin(lt * 1.1 * dk) * 16 * da : 0;
            const dA = atOr(cues, B.dry_at, null), dry = dA == null ? B.dry : lerp(B.dry, 1, lt >= dA ? progIO(lt, dA, 0.9) : 0);
            bear.update(t, { x: B.x * W + dx, y: B.y * H + dy + (1 - pin) * -H * 0.3, s: B.s * lerp(0.5, 1, pin), rot: B.rot + (B.drift ? Math.sin(lt * 0.6 * dk) * 6 * da * (1 - dry) : 0), face: B.face, paddle: dry < 0.5, dry, glow: 0 });
          }
          labels.forEach(l => l && l.update(lt, t, cues));
          if (stamp) stamp.update(lt, t, cues);
          if (btn) { const a = atOr(cues, BT.at, null), pr = a == null ? 0 : (lt >= a ? Math.max(punch(lt, a, 0.5), lt < a + 0.5 ? 1 - (lt - a) / 0.5 : 0) : 0); btn.update(t, BT.x * W, BT.y * H, BT.r, pr, BT.icon); }
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };

  SH.td_orbit = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed, defs } = ctx;
      const TD = window.TD, f1 = TD.f1, atOr = TD.atOr, sd = seed * 1000 + 457;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const st = P.stars === 0 ? null : TD.stars(cam, sd + 1, W, H, P.stars ?? 22, 0.16, 0.62);
      const E = Object.assign({ x: 0.5, y: 0.47, r: 230 }, P.earth || {});
      const O = Object.assign({ rx: 380, ry: 120, tilt: -10, speed: 0.45 }, P.orbit || {});
      const back = el(cam, 'g'), orbitBack = inkEl(back, INK.inkSoft), satBack = TD.sat(el(back, 'g'), sd + 4);
      const earth = TD.earth(cam, defs, sd + 3);
      const front = el(cam, 'g'), orbitFront = inkEl(front, INK.inkSoft), satFront = TD.sat(el(front, 'g'), sd + 4);
      const D = Object.assign({ from: 1, to: 10, at: 0.2, dur: 3, x: 0.5, y: 0.2, label: 'DAY' }, P.days || {});
      const dayG = el(cam, 'g');
      const dayT = el(dayG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 150, 'text-anchor': 'middle', fill: INK.ink });
      const tally = inkEl(dayG, INK.red);
      const labels = (P.labels || []).map((L, i) => TD.label(cam, L, W, H, sd + 30 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.84, y: 0.6, scale: 0.7, pose: 'point', face: 'left', dir: 50 }, P.kasif), sd + 6) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = W * 0.5, fy = H * 0.45;
          cam.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          if (st) st.update(t);
          const cx = E.x * W, cy = E.y * H, tr = O.tilt * Math.PI / 180;
          const P2 = a => { const x = Math.cos(a) * O.rx, y = Math.sin(a) * O.ry; return [cx + x * Math.cos(tr) - y * Math.sin(tr), cy + x * Math.sin(tr) + y * Math.cos(tr)]; };
          // dashed orbit: back half (behind Earth) and front half
          let ob = '', of = '';
          for (let k = 0; k < 28; k++) {
            const a0 = k / 28 * Math.PI * 2 + lt * 0.4, a1 = a0 + 0.13;
            const d = inkPath([P2(a0), P2((a0 + a1) / 2), P2(a1)], { w: 5, seed: sd + 40 + k, t, amp: 0.8 }) + ' ';
            if (Math.sin(a0) < 0) ob += d; else of += d;
          }
          orbitBack.setAttribute('d', ob); orbitFront.setAttribute('d', of);
          earth.update(t, cx, cy, E.r);
          const a = lt * O.speed * Math.PI * 2, p = P2(a), behind = Math.sin(a) < 0;
          const s = (P.sat_s ?? 0.2) * lerp(0.85, 1.1, (Math.sin(a) + 1) / 2);
          satBack.update(t, { x: p[0], y: p[1], s, rot: Math.cos(a) * 15 });
          satFront.update(t, { x: p[0], y: p[1], s, rot: Math.cos(a) * 15 });
          back.children[1].style.display = behind ? '' : 'none';
          front.children[1].style.display = behind ? 'none' : '';
          // day counter
          const da = atOr(cues, D.at, 0.2), dp = lt >= da ? clamp01((lt - da) / D.dur) : 0;
          const day = Math.round(lerp(D.from, D.to, dp)), pk = punch(lt, da + D.dur, 0.6);
          const txt = `${D.label} ${day}`;
          if (dayT.textContent !== txt) dayT.textContent = txt;
          const b = boil(sd + 9, t, 1.2), in0 = lt >= da - 0.3 ? spring(lt, da - 0.3, 0.5) : 0;
          dayG.setAttribute('opacity', clamp01(in0 * 3).toFixed(3));
          dayG.setAttribute('transform', `translate(${f1(D.x * W + b[0])} ${f1(D.y * H + b[1])}) scale(${(lerp(0.5, 1, in0) * (1 + 0.1 * pk)).toFixed(3)})`);
          dayT.setAttribute('y', 50);
          let td = '';
          for (let k = 0; k < day; k++) {
            const x = -230 + k * 52 + (k >= 5 ? 26 : 0), y = 110;
            td += inkPath([[x, y], [x + 4, y + 66]], { w: 8, seed: sd + 60 + k, t, amp: 1 }) + ' ';
            if (k === 4 || k === 9) td += inkPath([[x - 220, y + 50], [x + 22, y + 14]], { w: 7, seed: sd + 80 + k, t, amp: 1 }) + ' ';
          }
          tally.setAttribute('d', td);
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
