// tank_track: extreme close-up of a Mark I tank's front horn rolling over barbed wire, parchment ink (BRAND.md §3, §5).
// The frame is filled by the track: heavy pressed-steel track plates with grousers sliding round the front idler,
// rollers and the riveted side plate behind them, mud clods flicking off the links, barbed-wire coils and a picket
// being pressed flat under the plates, and bullets sparking off the armour (red-gold stars + ricochet streaks).
// P: {dir: -1 (track moves towards the left) | 1, speed: 60 (px/s), ground: 0.84, sparks: cue, crush: cue (wire
//     flattens from this cue), labels}
// cues: sparks, crush, labels, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.tank_track = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, sd = seed * 1000 + 331;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const dir = P.dir === 1 ? 1 : -1, gy = (P.ground ?? 0.84) * H;
      const lay = { ground: L(INK.ink), mud: L(INK.inkSoft), wireI: L(INK.ink), plateF: L(INK.paperDark), plateS: L(INK.inkSoft, { 'fill-opacity': 0.8 }), plateI: L(INK.ink),
        rivet: L(INK.ink), trackF: L(INK.inkSoft), trackI: L(INK.ink), links: L(INK.ink), roll: L(INK.paperDark), rollI: L(INK.ink),
        clod: L(INK.inkSoft), clodI: L(INK.ink), spark: L(INK.gold), sparkI: L(INK.red) };
      const labG = el(root, 'g');
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      // geometry (stage px): the horn's outer track path, front of the tank on the left when dir = -1
      const fx = dir < 0 ? W * 0.18 : W * 0.82, sgn = dir < 0 ? 1 : -1;   // sgn: +1 = body extends to the right
      const X = u => fx + sgn * u;
      const R = 210, cy = gy - R;                                   // front idler radius / centre
      const outer = [];                                             // top run -> around the idler -> bottom run
      for (let u = W * 1.1; u >= 0; u -= 40) outer.push([X(u + R), cy - R - u * 0.18]);
      for (let a = -90; a <= 90; a += 12) { const r = a * Math.PI / 180; outer.push([X(R - Math.cos(r) * R * 1.0) , cy + Math.sin(r) * R]); }
      for (let u = 0; u <= W * 1.1; u += 40) outer.push([X(R + u), gy]);
      const seg = [0]; for (let i = 1; i < outer.length; i++) seg.push(seg[i - 1] + Math.hypot(outer[i][0] - outer[i - 1][0], outer[i][1] - outer[i - 1][1]));
      const tot = seg[seg.length - 1];
      const at2 = s => { s = ((s % tot) + tot) % tot; let i = 1; while (i < seg.length - 1 && seg[i] < s) i++; const u = (s - seg[i - 1]) / (seg[i] - seg[i - 1] || 1);
        const a = outer[i - 1], b = outer[i]; const dx = b[0] - a[0], dy = b[1] - a[1], ln = Math.hypot(dx, dy) || 1; return { p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u)], n: [dy / ln, -dx / ln] }; };

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.3, w: 5 }, extra || {});
          const speed = P.speed ?? 60, shift = lt * speed;
          // ground + mud
          lay.ground.setAttribute('d', inkPath([[-30, gy + 4], [W + 30, gy + 4]], o(1, { w: 7 })));
          const MU = []; for (let k = 0; k < 26; k++) { const x = ((k * 97 + shift * (dir < 0 ? 0 : 0)) % (W + 100)) - 50, y = gy + 24 + (k % 5) * 30; MU.push(inkPath([[x, y], [x + 40 + (k % 3) * 20, y + 3]], o(10 + k, { w: 3 }))); }
          lay.mud.setAttribute('d', MU.join(' '));
          // barbed wire being pressed flat in front of / under the horn
          const ca = at(P.crush, 0.4), cp = progIO(lt, ca, 2.5), WI = [];
          const wx0 = dir < 0 ? -40 : X(R) - 40, wx1 = dir < 0 ? X(R) + 380 * cp : W + 40;
          for (let x = (dir < 0 ? -40 : W * 0.3); x < (dir < 0 ? W * 0.7 : W + 40); x += 46) {
            const under = dir < 0 ? x > X(R * 0.2) - 40 * 0 && x < X(R) + 600 * cp : false, h = under ? 18 : 110 * (1 - 0.6 * clamp01((X(R * 0.1) - x) / 300 < 0 ? 1 : 0));
            const y = gy - h * 0.55, k = Math.round(x / 46);
            WI.push(inkPath(inkEllipsePts(x + 23, y, 34, h * 0.5, sd + 100 + k, 9, 0.3), o(100 + k, { closed: true, w: 3.4, amp: 0.8 })));
            if (k % 2 === 0) WI.push(inkPath([[x + 14, y - h * 0.5 - 6], [x + 24, y - h * 0.5 + 8]], o(200 + k, { w: 3.4 })));
          }
          const px = X(R + 160 + 500 * (1 - cp)), pAng = cp * 70;   // a picket being pushed over
          WI.push(inkPath([[px, gy], [px + sgn * Math.sin(pAng * Math.PI / 180) * 160, gy - Math.cos(pAng * Math.PI / 180) * 160]], o(300, { w: 9 })));
          lay.wireI.setAttribute('d', WI.join(' '));
          void wx0; void wx1;
          // side plate behind the track (riveted) with hatch shading
          const plate = [[X(R * 0.9), cy - R * 0.6], [X(R * 0.9), cy + R * 0.75], [X(W * 1.2), cy + R * 0.75], [X(W * 1.2), cy - R - W * 0.18]];
          const plateIn = []; for (let u = W * 1.1; u >= 60; u -= 40) plateIn.push([X(u + R), cy - R - u * 0.18 + 70]);
          for (let a = -70; a <= 70; a += 14) { const r = a * Math.PI / 180; plateIn.push([X(R - Math.cos(r) * (R - 70)), cy + Math.sin(r) * (R - 70)]); }
          for (let u = 60; u <= W * 1.1; u += 40) plateIn.push([X(R + u), gy - 70]);
          lay.plateF.setAttribute('d', inkLoop(plateIn, o(400, { smooth: false })));
          const PS = []; for (let x = -80; x < W + 80; x += 30) PS.push(inkPath([[x, gy - 60], [x + 120, cy - R * 0.5]], o(410 + x, { w: 2.2, amp: 0.6 })));
          lay.plateS.setAttribute('d', '');
          lay.plateI.setAttribute('d', inkPath(plateIn, o(401, { closed: true, smooth: false, w: 6 })));
          const RV = []; for (let k = 0; k < plateIn.length; k += 1) { const p = plateIn[k]; const q = [lerp(p[0], X(R + 400), 0.12), lerp(p[1], cy, 0.12)]; RV.push(inkDot(q[0], q[1], 9, 9, sd + 500 + k, t)); }
          lay.rivet.setAttribute('d', RV.join(' '));
          void plate; void PS;
          // rollers inside (visible through the track gap)
          const RL = [], RLI = []; for (let k = 0; k < 4; k++) { const rx = X(R + 260 + k * 300), ry = gy - 100, an = shift / 50 * dir;
            const c = inkEllipsePts(rx, ry, 64, 64, sd + 600 + k, 14); RL.push(inkLoop(c, o(600 + k))); RLI.push(inkPath(c, o(610 + k, { closed: true, w: 6 })));
            for (let j = 0; j < 3; j++) { const a2 = an + j * 2.094; RLI.push(inkPath([[rx, ry], [rx + Math.cos(a2) * 54, ry + Math.sin(a2) * 54]], o(620 + k * 3 + j, { w: 5 }))); } }
          lay.roll.setAttribute('d', RL.join(' ')); lay.rollI.setAttribute('d', RLI.join(' '));
          // the track band: outer path offset inward by 70 px
          const band = outer.map((p, i) => { const q = at2(seg[i]); return [p[0] + q.n[0] * -70 * sgn, p[1] + q.n[1] * -70 * sgn]; });
          const bandPoly = outer.concat(band.slice().reverse());
          lay.trackF.setAttribute('d', inkLoop(bandPoly, o(700, { smooth: false, amp: 1 })));
          lay.trackI.setAttribute('d', inkPath(outer, o(701, { w: 8 })) + ' ' + inkPath(band, o(702, { w: 5 })));
          // links + grousers rolling (the band moves opposite to the tank's travel at the ground)
          const LK = [], step = 74, off = ((shift * (dir < 0 ? -1 : 1)) % step + step) % step;
          for (let s = off; s < tot; s += step) { const q = at2(s), p = q.p, n = q.n.map(v => v * -sgn);
            const p2 = [p[0] + n[0] * 70, p[1] + n[1] * 70], g1 = [p[0] - n[0] * 16, p[1] - n[1] * 16];
            LK.push(inkPath([p, p2], { seed: sd + 800 + Math.round(s), t, w: 5, amp: 0.6 }));
            const q2 = at2(s + 26).p; LK.push(inkPath([g1, [q2[0] - n[0] * 16, q2[1] - n[1] * 16]], { seed: sd + 900 + Math.round(s), t, w: 7, amp: 0.6 }));
            LK.push(inkDot(p[0] + n[0] * 35, p[1] + n[1] * 35, 6, 6, sd + 1000 + Math.round(s), t)); }
          lay.links.setAttribute('d', LK.join(' '));
          // clods flicking off the idler
          const CL = [], CLI = []; for (let k = 0; k < 7; k++) { const age = (lt * 0.9 + k / 7) % 1, a0 = -1.2 + k * 0.08, v = 520 + (k % 3) * 120;
            const x = X(R - Math.cos(a0) * R) - sgn * v * Math.cos(0.9) * age, y = cy + Math.sin(a0) * R - v * Math.sin(0.9) * age + 900 * age * age;
            if (y > gy) continue; const pts = inkEllipsePts(x, y, 12 + (k % 3) * 5, 9 + (k % 2) * 4, sd + 1100 + k, 7); CL.push(inkLoop(pts, o(1100 + k))); CLI.push(inkPath(pts, o(1120 + k, { closed: true, w: 3 }))); }
          lay.clod.setAttribute('d', CL.join(' ')); lay.clodI.setAttribute('d', CLI.join(' '));
          // bullets sparking off the plate
          const sa = P.sparks != null ? at(P.sparks, null) : null, SP = [], SPI = [];
          if (sa != null && lt >= sa) for (let k = 0; k < 5; k++) { const cyc = (lt - sa) * 2.2 + k * 0.31, ph = cyc % 1, rr = rng(sd + 1200 + k + Math.floor(cyc) * 11);
            if (ph > 0.4) continue; const x = X(R + 200 + rr() * W * 0.55), y = cy - R * 0.5 + rr() * R * 0.9, r = 26 + 40 * ph;
            SP.push(inkLoop(Array.from({ length: 12 }, (_, j) => { const an = j / 12 * 6.2832 + k, rad = (j % 2 ? 0.35 : 1) * r; return [x + Math.cos(an) * rad, y + Math.sin(an) * rad]; }), o(1200 + k, { smooth: false, amp: 0.6 })));
            SPI.push(inkPath([[x, y], [x - sgn * 140 * (0.4 + ph), y - 90 * (0.4 + ph)]], o(1220 + k, { w: 4 }))); }
          lay.spark.setAttribute('d', SP.join(' ')); lay.sparkI.setAttribute('d', SPI.join(' '));
          const hit = punch(lt, at('hit', null), 0.6), shk = Math.sin(lt * 31) * 2;
          cam.setAttribute('transform', `translate(0 ${shk.toFixed(1)}) translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
