// tank_charge: a Mark I tank seen from the front three-quarters and a low camera, coming at the viewer, in parchment
// ink (BRAND.md §3, §5). The hull is a small 3D model (both rhomboid track frames as extrusions, the hull box between
// them, the driver's cab, the sponsons with the 6-pounder guns, the exhaust) projected with perspective and drawn
// back to front, so the machine looms as it approaches; the track bands carry link lines that roll. Around it: mist
// banks it pushes through, a barbed-wire belt across the foreground that flattens when the nose reaches it, exhaust
// smoke, bullet sparks, a sandbag parapet and figures in the foreground (bb__lib cast with helmets).
// P: {x: 0.62 (screen x of the tank), horizon: 0.42, camH: 70 (cm, low camera), F: 1100,
//     dist: [2600, 1300] (camera distance from / to, cm), at: 0 (start), dur: 8, yaw: 32 (deg; + = shows its right side,
//     negative mirrors), variant: "male"|"female", fire: [cues], sparks: cue,
//     mist: {clear: cue, bands: 6} | false, wire: {d: 1500} (depth of the wire belt, cm) | false,
//     parapet: {y: 0.88} | false, cast: [... + helmet, moustache], labels}
// cues: at, fire, sparks, mist.clear, labels, cast, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const PROF = [[-235, 0], [185, 0], [300, -58], [392, -140], [404, -184], [384, -224], [336, -246], [-300, -246], [-366, -226], [-398, -182], [-386, -118], [-322, -48]];
  const NF = 90;
  SH.tank_charge = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 457;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const hy = (P.horizon ?? 0.42) * H, F = P.F ?? 1300, camH = P.camH ?? 150;
      const sx0 = (P.x ?? 0.62) * W;
      const sky = { planeF: inkEl(cam, INK.paperDark), planeI: inkEl(cam, INK.ink), bC: inkEl(cam, INK.inkSoft), bI: inkEl(cam, INK.ink), bF: inkEl(cam, INK.gold) };
      const back = { mistF: L(INK.paperLight, { 'fill-opacity': 0 }), ground: L(INK.inkSoft), wireF: L(INK.ink), smF: L(INK.paperLight), smI: L(INK.inkSoft) };
      const shadow = inkEl(cam, INK.ink, { 'fill-opacity': 0.2 });
      const tankG = el(cam, 'g');
      const pool = Array.from({ length: NF }, () => ({ f: inkEl(tankG, INK.paperDark), i: inkEl(tankG, INK.ink) }));
      const front = { gun: L(INK.ink), flash: L(INK.gold), flashI: L(INK.red), spark: L(INK.gold), sparkI: L(INK.red), mist2: L(INK.paperLight, { 'fill-opacity': 0 }),
        wireN: L(INK.ink), parF: L(INK.paperDark), parI: L(INK.ink) };
      const castG = el(cam, 'g'), rifle = L(INK.ink), helmF = L(INK.inkSoft), helmI = L(INK.ink);
      const labG = el(root, 'g');
      const cast = B.cast(castG, P.cast, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);
      const yawD = P.yaw ?? 32, mir = yawD < 0 ? -1 : 1, yaw = Math.abs(yawD) * Math.PI / 180;
      const female = P.variant === 'female';

      // model faces: list of {pts3: [[X, Y, Z]...], fill, kind}
      const faces = [];
      [-1, 1].forEach(s => {
        const zi = s * 80, zo = s * 132;
        for (let i = 0; i < PROF.length; i++) { const a = PROF[i], b = PROF[(i + 1) % PROF.length];
          faces.push({ pts3: [[a[0], a[1], zi], [b[0], b[1], zi], [b[0], b[1], zo], [a[0], a[1], zo]], fill: INK.inkSoft, kind: 'band', len: Math.hypot(b[0] - a[0], b[1] - a[1]), s }); }
        faces.push({ pts3: PROF.map(p => [p[0], p[1], zo]), fill: INK.paperDark, kind: 'side', s });
        // sponson on the outside
        const z1 = zo, z2 = s * (female ? 214 : 200);
        const sp = female ? [[-120, -48], [96, -48], [120, -110], [96, -196], [-120, -196]] : [[-110, -58], [70, -58], [104, -120], [70, -186], [-110, -186]];
        faces.push({ pts3: sp.map(p => [p[0], p[1], z2]), fill: INK.paperDark, kind: 'spon', s });
        for (let i = 0; i < sp.length; i++) { const a = sp[i], b = sp[(i + 1) % sp.length];
          faces.push({ pts3: [[a[0], a[1], z1], [b[0], b[1], z1], [b[0], b[1], z2], [a[0], a[1], z2]], fill: INK.paperDark, kind: 'sponE', s }); }
      });
      // hull box between the frames + cab
      const box = (x0, x1, y0, y1, z0, z1, fill, kind) => {
        const V = (x, y, z) => [x, y, z];
        [[V(x1, y0, z0), V(x1, y0, z1), V(x1, y1, z1), V(x1, y1, z0)], [V(x0, y1, z0), V(x1, y1, z0), V(x1, y1, z1), V(x0, y1, z1)],
         [V(x0, y0, z0), V(x1, y0, z0), V(x1, y1, z0), V(x0, y1, z0)], [V(x0, y0, z1), V(x1, y0, z1), V(x1, y1, z1), V(x0, y1, z1)]]
          .forEach(p => faces.push({ pts3: p, fill, kind }));
      };
      box(-300, 330, -40, -232, -80, 80, INK.paperDark, 'hull');
      box(218, 330, -232, -290, -56, 56, INK.paperDark, 'cab');

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.2, w: 5 }, extra || {});
          const a0 = at(P.at, 0), u = progIO(lt, a0, P.dur ?? Math.max(1, dur - a0));
          const [d0, d1] = P.dist || [2600, 1300], D = lerp(d0, d1, u);
          const rock = Math.sin(lt * 2.1) * 1.6 * Math.PI / 180, bob = Math.sin(lt * 3.3) * 4;
          const cy = Math.cos(yaw), sy = Math.sin(yaw);
          const proj = (X, Y, Z) => {          // tank frame (cm) -> screen; pitch rock about the middle of the track run
            const Yr = Y * Math.cos(rock) - X * Math.sin(rock) * 0.6, Xr = X;
            const r = mir * (Xr * sy + Z * cy), tt = Xr * cy - Z * sy, depth = Math.max(200, D - tt);
            return [sx0 + F * r / depth, hy + F * (camH + Yr + bob) / depth, depth];
          };
          const ph = (d0 - D) * 1.0;   // track travel
          // ground hatch lines in perspective
          const GR = [];
          for (let k = 0; k < 46; k++) { const rr = rng(sd + 30 + k), dd = 300 + rr() * 3000, y = hy + F * camH / dd, x = rr() * W, L2 = 60 * 1000 / dd; GR.push(inkPath([[x, y], [x + L2, y + 1]], o(30 + k, { w: 2.4 }))); }
          back.ground.setAttribute('d', GR.join(' '));
          shadow.setAttribute('d', inkLoop([[-420, 0, -230], [430, 0, -230], [430, 0, 230], [-420, 0, 230]].map(q => { const p = proj(q[0], q[1], q[2]); return [p[0], p[1]]; }), o(5, { smooth: true, amp: 1 })));
          // faces -> projected, sorted far to near
          const items = faces.map(f => { const p2 = f.pts3.map(q => proj(q[0], q[1], q[2])); return { f, p2, d: p2.reduce((s, q) => s + q[2], 0) / p2.length }; });
          // cull faces whose screen winding says they look away (keeps the far frame's hidden sides out)
          const vis = items.filter(it => { if (it.f.kind === 'side' || it.f.kind === 'spon') { const z = it.f.s; return (mir * z * -sy + 0.0) < 0.6 || true; } return true; });
          vis.sort((a, b) => b.d - a.d);
          pool.forEach((pe, k) => {
            const it = vis[k];
            if (!it) { pe.f.setAttribute('d', ''); pe.i.setAttribute('d', ''); return; }
            const pts = it.p2.map(q => [q[0], q[1]]);
            pe.f.setAttribute('fill', it.f.fill);
            pe.f.setAttribute('d', inkLoop(pts, o(200 + k, { smooth: false, amp: 0.8 })));
            const sc2 = F / it.d;
            const I = [inkPath(pts, o(300 + k, { closed: true, smooth: false, w: Math.max(2.5, 6 * sc2 * 1.4) }))];
            if (it.f.kind === 'band') {           // links across the band, rolling
              const n = Math.max(1, Math.floor(it.f.len / 40)), off = ((ph / 40) % 1 + 1) % 1;
              for (let j = 0; j < n; j++) { const v = (j + off) / n; const A = it.p2[0], Bp = it.p2[1], C = it.p2[2], Dp = it.p2[3];
                const p1 = [lerp(A[0], Bp[0], v), lerp(A[1], Bp[1], v)], p2 = [lerp(Dp[0], C[0], v), lerp(Dp[1], C[1], v)];
                I.push(inkPath([p1, p2], { seed: sd + 400 + k * 13 + j, t, w: Math.max(1.5, 3 * sc2 * 1.4), amp: 0.5 })); }
            }
            if (it.f.kind === 'side') {           // rivets + hatch on the side plate
              const P2 = PROF.map(p => proj(p[0] * 0.86, p[1] * 0.86 - 18, it.f.s * 133));
              P2.forEach((q, j) => I.push(inkDot(q[0], q[1], 5 * sc2 * 1.4, 5 * sc2 * 1.4, sd + 500 + k * 20 + j, t)));
              for (let j = 0; j < 8; j++) { const x = -260 + j * 70, a = proj(x, -30, it.f.s * 133), b = proj(x + 60, -200, it.f.s * 133); I.push(inkPath([a, b].map(q => [q[0], q[1]]), { seed: sd + 600 + k * 9 + j, t, w: 2, amp: 0.5 })); }
            }
            if (it.f.kind === 'cab') { const A = it.p2[0], C = it.p2[2]; I.push(inkPath([[lerp(A[0], C[0], 0.25), lerp(A[1], C[1], 0.45)], [lerp(A[0], C[0], 0.75), lerp(A[1], C[1], 0.45)]], o(700 + k, { w: 3 }))); }
            pe.i.setAttribute('d', I.join(' '));
          });
          // guns (male: 6-pounders out of the sponson fronts), exhaust
          const G = [], muz = [];
          [-1, 1].forEach(s => { const z = s * (female ? 190 : 176);
            const a = proj(female ? 110 : 96, -122, z), b = proj(female ? 170 : 300, -122, z);
            const ws = F / ((a[2] + b[2]) / 2);
            G.push(inkPath([[a[0], a[1]], [b[0], b[1]]], o(800 + s, { w: Math.max(5, (female ? 10 : 18) * ws * 1.4), taper: 0 }))); muz.push(b); });
          const e1 = proj(-40, -246, 0), e2 = proj(-40, -320, 0);
          G.push(inkPath([[e1[0], e1[1]], [e2[0], e2[1]]], o(810, { w: Math.max(5, 14 * F / e1[2] * 1.4), taper: 0 })));
          front.gun.setAttribute('d', G.join(' '));
          // exhaust smoke
          const SM = []; for (let k = 0; k < 6; k++) { const age = (lt * 0.8 + k / 6) % 1, sc2 = F / e2[2];
            SM.push({ x: e2[0] - mir * age * 160 * sc2 + Math.sin(lt + k) * 5, y: e2[1] - age * 200 * sc2, r: (12 + age * 46) * sc2 * 1.3 }); }
          const pf = T.puffs(SM, t, sd + 900); back.smF.setAttribute('d', pf.fill); back.smI.setAttribute('d', pf.ink);
          // muzzle flash
          let fire = 0; (P.fire || []).forEach(fn => { const fa = at(fn, null); if (fa != null && lt >= fa && lt < fa + 0.35) fire = Math.max(fire, 1 - (lt - fa) / 0.35); });
          if (fire > 0.02) { const FL = [], FI = []; muz.forEach((m, j) => { const r0 = 90 * fire * F / m[2] * 1.4, pts = [];
            for (let k = 0; k < 14; k++) { const an = k / 14 * 6.2832, rr = (k % 2 ? 0.4 : 1) * r0; pts.push([m[0] + Math.cos(an) * rr, m[1] + Math.sin(an) * rr]); }
            FL.push(inkLoop(pts, o(950 + j, { smooth: false }))); FI.push(inkPath(pts, o(960 + j, { closed: true, smooth: false, w: 4 }))); });
            front.flash.setAttribute('d', FL.join(' ')); front.flashI.setAttribute('d', FI.join(' ')); } else { front.flash.setAttribute('d', ''); front.flashI.setAttribute('d', ''); }
          // sparks on the armour
          const sa = P.sparks != null ? at(P.sparks, null) : null, SP = [], SPI = [];
          if (sa != null && lt >= sa) for (let k = 0; k < 5; k++) { const cyc = (lt - sa) * 2.4 + k * 0.29, phs = cyc % 1, rr = rng(sd + 1000 + k + Math.floor(cyc) * 7);
            if (phs > 0.4) continue; const q = proj(-200 + rr() * 520, -60 - rr() * 160, 134 * mir), r = (30 + 40 * phs) * F / q[2] * 1.2;
            SP.push(inkLoop(Array.from({ length: 12 }, (_, j) => { const an = j / 12 * 6.2832 + k, rad = (j % 2 ? 0.35 : 1) * r; return [q[0] + Math.cos(an) * rad, q[1] + Math.sin(an) * rad]; }), o(1000 + k, { smooth: false, amp: 0.5 })));
            SPI.push(inkPath([[q[0], q[1]], [q[0] + 120 * (0.4 + phs), q[1] - 80 * (0.4 + phs)]], o(1020 + k, { w: 4 }))); }
          front.spark.setAttribute('d', SP.join(' ')); front.sparkI.setAttribute('d', SPI.join(' '));
          // barbed-wire belt across the field at depth wd; flattened once the nose has reached it
          if (P.wire !== false) { const wd = (P.wire || {}).d ?? 1500, nose = D - (404 * cy), y = hy + F * camH / wd, sc2 = F / wd, crushed = nose < wd + 60;
            const WI = []; const h = (crushed ? 22 : 90) * sc2;
            for (let x = -40, k = 0; x < W + 40; x += 46 * sc2 * 1.2, k++) { const xc = x + 23 * sc2; const near = Math.abs(xc - sx0) < 420 * F / wd;
              const hh = near && crushed ? 16 * sc2 : 90 * sc2; WI.push(inkPath(inkEllipsePts(xc, y - hh * 0.55, 34 * sc2, hh * 0.5, sd + 1100 + k, 9, 0.3), o(1100 + k, { closed: true, w: Math.max(2, 3.2 * sc2) })));
              if (k % 4 === 0) WI.push(inkPath([[xc - 20 * sc2, y], [xc + 20 * sc2, y - hh - 10 * sc2]], o(1200 + k, { w: Math.max(3, 5 * sc2) }))); }
            void h; (wd < D - 404 * cy - 50 ? front.wireN : back.wireF).setAttribute('d', WI.join(' ')); (wd < D - 404 * cy - 50 ? back.wireF : front.wireN).setAttribute('d', ''); }
          // mist: banks behind and in front of the tank, thinning after `clear`
          if (P.mist) { const M = Object.assign({ bands: 6 }, P.mist === true ? {} : P.mist), ca = at(M.clear, null), thin = ca == null ? 1 : 1 - 0.8 * progIO(lt, ca, 1.6);
            const A = [], Bm = [];
            for (let k = 0; k < M.bands; k++) { const y = hy - 70 + k * 42, drift = ((lt * (16 + k * 5) + k * 190) % 500) - 250, hh = 40 + (k % 3) * 18, pts = [];
              for (let x = -240 + drift; x <= W + 240 + drift; x += 90) pts.push([x, y - hh * (0.6 + 0.4 * Math.sin(x * 0.01 + k))]);
              for (let x = W + 240 + drift; x >= -240 + drift; x -= 90) pts.push([x, y + hh * (0.6 + 0.4 * Math.cos(x * 0.012 + k))]);
              (k % 2 ? Bm : A).push(inkLoop(pts, o(1300 + k, { amp: 2 }))); }
            back.mistF.setAttribute('d', A.join(' ')); back.mistF.setAttribute('fill-opacity', (0.7 * thin).toFixed(3));
            front.mist2.setAttribute('d', Bm.join(' ')); front.mist2.setAttribute('fill-opacity', (0.45 * thin).toFixed(3)); }
          // biplane + distant shell bursts behind
          if (P.plane) { const p2 = P.plane, a2 = at(p2.at, 0), u2 = progIO(lt, a2, p2.dur ?? 5), x = lerp(p2.x * W, (p2.to ?? p2.x) * W, u2), y = (p2.y ?? 0.26) * H + Math.sin(lt * 1.3) * 8;
            const pl = T.plane(x, y, p2.s ?? 0.9, p2.face === -1 ? -1 : 1, t, sd + 2300); sky.planeF.setAttribute('d', pl.fill); sky.planeI.setAttribute('d', pl.ink); }
          const BC = [], BI = [], BF = [];
          (P.bursts || []).forEach((b, i) => { const a2 = at(b.at, 0.4 + i), r2 = T.burst(b.x * W, (b.y ?? (P.horizon ?? 0.34) + 0.02) * H, lt - a2, b.size ?? 70, t, sd + 2400 + i * 40); BC.push(r2.cloud); BI.push(r2.ink); BF.push(r2.flash); });
          sky.bC.setAttribute('d', BC.join(' ')); sky.bI.setAttribute('d', BI.join(' ')); sky.bF.setAttribute('d', BF.join(' '));
          // parapet
          if (P.parapet) { const y0 = (P.parapet.y ?? 0.88) * H, PF = [], PI = [];
            for (let r = 0; r < 3; r++) for (let x = (P.parapet.from ?? 0) * W - 60 + (r % 2) * 60; x < (P.parapet.to ?? 1) * W + 60; x += 124) { const c = y0 + r * 64, k = r * 100 + Math.round(x / 124);
              const pts = inkEllipsePts(x, c, 68, 36, sd + 1400 + k, 10, ((k % 5) - 2) * 0.03, 0.05); PF.push(inkLoop(pts, o(1400 + k, { amp: 0.8 }))); PI.push(inkPath(pts, o(1700 + k, { closed: true, w: 5, amp: 0.8 }))); }
            front.parF.setAttribute('d', PF.join(' ')); front.parI.setAttribute('d', PI.join(' ')); }
          // cast
          const cres = cast.update(lt, t, cues), HF = [], HI = [], RF = [];
          (P.cast || []).forEach((m, i) => { const q = cres[i]; if (!q) return;
            if (m.helmet) { const h = T.helmet(q.head, q.face, q.s, m.helmet, t, sd + 2000 + i * 20); HF.push(h.fill); HI.push(h.ink); }
            if (m.moustache) HI.push(T.moustache(q.head, q.face, q.s, t, sd + 2100 + i * 7));
            if (m.rifle) { const x = q.x + q.face * 40 * q.s / 0.6, y = q.y; RF.push(inkPath([[x - q.face * 30 * q.s / 0.6, y - 120 * q.s / 0.6], [x + q.face * 40 * q.s / 0.6, y - 360 * q.s / 0.6]], o(2200 + i, { w: 7 }))); } });
          helmF.setAttribute('d', HF.join(' ')); helmI.setAttribute('d', HI.join(' ')); rifle.setAttribute('d', RF.join(' '));
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
