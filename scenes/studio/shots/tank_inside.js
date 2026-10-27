// tank_inside: cutaway of a Mark I tank (1916) in parchment ink (BRAND.md §3, §5): the rhomboid track frame filling
// the frame, the hull opened like a doll's house: the engine in the middle of the crew space (cylinders pumping,
// flywheel spinning, exhaust pipe through the roof), eight crew in leather caps standing round it (bb__lib cast),
// heat shimmer, drifting fumes, a wall thermometer whose column climbs at a cue, a spanner banged on the engine
// (clang marks), and red rings round the four men it takes to steer.
// P: {cx: 0.5, gy: 0.84 (ground line), sx: 2.0, sy: 2.3 (cm -> px), crew: true | [...cast], heat: cue, fumes: cue,
//     thermo: {at, to: 50, label: "50°C"}, spanner: cue, steer: cue, labels, cast (extra, e.g. Kaşif)}
// cues: heat, fumes, thermo.at, spanner, steer, labels, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const MK1 = [[-235, 0], [185, 0], [300, -58], [392, -140], [404, -184], [384, -224], [336, -246], [-300, -246], [-366, -226], [-398, -182], [-386, -118], [-322, -48]];
  SH.tank_inside = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const B = window.BBL, T = window.TKL, sd = seed * 1000 + 913;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = (fill, extra) => inkEl(cam, fill, extra || {});
      const cx = (P.cx ?? 0.5) * W, gy = (P.gy ?? 0.84) * H, sx = P.sx ?? 2.0, sy = P.sy ?? 2.3;
      const X = (u, v) => [cx + u * sx, gy + v * sy];
      const outer = MK1.map(p => X(p[0], p[1])), inner = T.offsetPoly(MK1, 34).map(p => X(p[0], p[1]));
      const floorY = X(0, -34)[1];
      const lay = {
        track: L(INK.inkSoft), room: L(INK.paperLight), wall: L(INK.paperDark, { 'fill-opacity': 0.55 }), wallI: L(INK.inkSoft),
        heat: L(INK.red, { 'fill-opacity': 0.8 }),
        engF: L(INK.paperDark), engS: L(INK.inkSoft), engI: L(INK.ink), fly: L(INK.ink),
        thF: L(INK.paperLight), thR: L(INK.red), thI: L(INK.ink),
        shell: L(INK.ink),
      };
      const castG = el(cam, 'g');
      const capF = L(INK.inkSoft), capI = L(INK.ink);
      const fumes = L(INK.inkSoft, { 'fill-opacity': 0.0 }), fumesI = L(INK.inkSoft, { 'fill-opacity': 0.0 });
      const span = L(INK.ink), clang = L(INK.gold), clangI = L(INK.red), ring = L(INK.red);
      const labG = el(root, 'g');
      const thT = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 84, fill: INK.red, stroke: INK.paperLight, 'stroke-width': 12, 'paint-order': 'stroke', 'text-anchor': 'start' });
      const crewDef = P.crew === false ? [] : Array.isArray(P.crew) ? P.crew : [
        { u: -330, pose: 'hold', face: 'right' }, { u: -268, pose: 'idle', face: 'right' },         // gearsmen
        { u: -196, pose: 'point', face: 'left', dir: 'forward' }, { u: -146, pose: 'idle', face: 'right' },   // gunners
        { u: 160, pose: 'point', face: 'left', dir: -10, spanner: true }, { u: 214, pose: 'idle', face: 'left' },
        { u: 268, pose: 'look', face: 'right' }, { u: 316, pose: 'sit', face: 'right' },             // driver + commander
      ];
      const crewCast = crewDef.map((c, i) => Object.assign({ who: 'crew' + i, x: (cx + c.u * sx) / W, y: floorY / H, scale: c.scale ?? 0.4, pose: c.pose, face: c.face, dir: c.dir, emotion: c.emotion || 'worried' }, c.extra || {}));
      const all = crewCast.concat(P.cast || []);
      const cast = B.cast(castG, all, W, H, sd + 50);
      const labs = B.labels(labG, P.labels, W, H, sd + 70);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, at = (n, fb) => B.atOr(cues, n, fb);
          const o = (k, extra) => Object.assign({ seed: sd + k, t, amp: 1.2, w: 5 }, extra || {});
          // track band + the opened room
          lay.track.setAttribute('d', inkLoop(outer, o(1, { smooth: false })));
          lay.room.setAttribute('d', inkLoop(inner, o(2, { smooth: false })));
          const WI = [inkPath(outer, o(3, { closed: true, smooth: false, w: 8 })), inkPath(inner, o(4, { closed: true, smooth: false, w: 5 }))];
          const ph = lt * 40;
          for (let k = 0; k < 60; k++) { const f = ((k / 60) + ph / 4000) % 1, i = Math.floor(f * outer.length), j = (i + 1) % outer.length, u = f * outer.length - i;
            const p = [lerp(outer[i][0], outer[j][0], u), lerp(outer[i][1], outer[j][1], u)], q = [lerp(inner[i][0], inner[j][0], u), lerp(inner[i][1], inner[j][1], u)];
            WI.push(inkPath([p, q], o(10 + k, { w: 3, amp: 0.6 }))); }
          // back wall: plates and rivets (shadowed)
          const wallPts = T.offsetPoly(MK1, 46).map(p => X(p[0], p[1]));
          lay.wall.setAttribute('d', inkLoop(wallPts, o(5, { smooth: false })));
          const WS = [];
          for (let u = -300; u <= 300; u += 120) WS.push(inkPath([X(u, -60), X(u, -200)], o(80 + u, { w: 2.4, amp: 0.6 })));
          for (let u = -280; u <= 300; u += 40) WS.push(inkDot(...X(u, -205), 4, 4, sd + 90 + u, t), inkDot(...X(u, -55), 4, 4, sd + 95 + u, t));
          lay.wallI.setAttribute('d', WI.join(' ') + ' ' + WS.join(' '));
          // engine block, cylinders, flywheel, exhaust
          const E0 = X(-110, -40), E1 = X(110, -128);
          const block = [[E0[0], E0[1]], [E1[0], E0[1]], [E1[0], E1[1]], [E0[0], E1[1]]];
          lay.engF.setAttribute('d', inkLoop(block, o(20, { smooth: false })));
          const EI = [inkPath(block, o(21, { closed: true, smooth: false, w: 6 }))], ES = [];
          for (let k = 0; k < 6; k++) {
            const u = -90 + k * 34, up = Math.sin(lt * 14 + k * 2.1) * 12;
            const top = X(u, -128)[1], cxp = X(u + 12, 0)[0];
            EI.push(inkPath([[cxp - 14, top], [cxp - 14, top - 60], [cxp + 14, top - 60], [cxp + 14, top]], o(22 + k, { smooth: false, w: 4 })));
            EI.push(inkPath([[cxp, top - 60 + up - 20], [cxp, top - 60 + up + 6]], o(30 + k, { w: 8 })));
            ES.push(inkLoop([[cxp - 13, top - 4], [cxp + 13, top - 4], [cxp + 13, top - 56], [cxp - 13, top - 56]], o(36 + k, { smooth: false })));
          }
          const fc = X(-150, -84), FR = 70;
          EI.push(inkPath(T.circ(fc[0], fc[1], FR, 16), o(40, { closed: true, w: 7 })));
          const FL = []; for (let k = 0; k < 4; k++) { const an = lt * 6 + k * Math.PI / 2; FL.push(inkPath([[fc[0], fc[1]], [fc[0] + Math.cos(an) * FR * 0.9, fc[1] + Math.sin(an) * FR * 0.9]], o(41 + k, { w: 5 }))); }
          const ex = X(40, -188)[0];
          EI.push(inkPath([[ex, X(0, -188)[1]], [ex, X(0, -232)[1]]], o(46, { w: 18, taper: 0 })));
          lay.engS.setAttribute('d', ES.join(' ')); lay.engI.setAttribute('d', EI.join(' ')); lay.fly.setAttribute('d', FL.join(' '));
          // heat shimmer
          const ha = at(P.heat, 0.4), hk = progIO(lt, ha, 1.2), HT = [];
          if (hk > 0) for (let k = 0; k < 9; k++) { const x0 = lerp(X(-300, 0)[0], X(320, 0)[0], k / 8), y0 = X(0, -150)[1] - 20, rise = (lt * 30 + k * 40) % 120;
            const pts = []; for (let j = 0; j < 5; j++) pts.push([x0 + Math.sin(lt * 3 + j + k) * 10, y0 - rise - j * 26]);
            HT.push(inkPath(pts, o(50 + k, { w: 3.5 * hk, amp: 0.8 }))); }
          lay.heat.setAttribute('d', HT.join(' '));
          // thermometer on the wall
          const TH = P.thermo || null;
          if (TH) {
            const tx = X(-60, 0)[0], ty0 = X(0, -140)[1] - 10, ty1 = X(0, -200)[1] + 6, tw = 15;
            const ta = at(TH.at, 0.8), tp = progIO(lt, ta, 1.8), lev = lerp(0.25, 0.95, tp);
            const tube = [[tx - tw, ty1], [tx + tw, ty1], [tx + tw, ty0], [tx - tw, ty0]];
            lay.thF.setAttribute('d', inkLoop(tube, o(60, { smooth: false })));
            const ly = lerp(ty0, ty1, lev);
            lay.thR.setAttribute('d', inkLoop([[tx - tw * 0.5, ly], [tx + tw * 0.5, ly], [tx + tw * 0.5, ty0 + 10], [tx - tw * 0.5, ty0 + 10]], o(61, { smooth: false, amp: 0.5 })) + ' ' + inkDot(tx, ty0 + 22, 26, 26, sd + 62, t));
            const TI = [inkPath(tube, o(63, { closed: true, smooth: false, w: 4 })), inkPath(T.circ(tx, ty0 + 22, 28, 10), o(64, { closed: true, w: 4 }))];
            for (let k = 1; k < 5; k++) { const y = lerp(ty0, ty1, k / 5); TI.push(inkPath([[tx + tw, y], [tx + tw + 14, y]], o(65 + k, { w: 3 }))); }
            lay.thI.setAttribute('d', TI.join(' '));
            if (lt >= ta + 0.4) { thT.style.display = ''; thT.textContent = fmtNum(Math.round(lerp(18, TH.to ?? 50, tp))) + (TH.unit ?? '°C');
              const b = boil(sd + 70, t, 1.2); thT.setAttribute('transform', `translate(${tx + 40 + b[0]} ${ty1 + 50 + b[1]}) scale(${(spring(lt, ta + 0.4, 0.5) * (1 + 0.1 * punch(lt, ta + 1.8, 0.6))).toFixed(3)})`); }
            else thT.style.display = 'none';
          } else thT.style.display = 'none';
          // crew + caps
          const cres = cast.update(lt, t, cues), CF = [], CI = [];
          all.forEach((m, i) => { const q = cres[i]; if (!q) return; if (i < crewCast.length) { const h = T.helmet(q.head, q.face, q.s, 'flat', t, sd + 200 + i * 20); CF.push(h.fill); CI.push(h.ink); } });
          capF.setAttribute('d', CF.join(' ')); capI.setAttribute('d', CI.join(' '));
          // fumes
          const fa = at(P.fumes, 0.6), fk = progIO(lt, fa, 1.5), FU = [], FUI = [];
          if (fk > 0) for (let k = 0; k < 8; k++) { const u = ((lt * 0.05 + k / 8) % 1), x = lerp(X(-330, 0)[0], X(330, 0)[0], u), y = X(0, -175)[1] + Math.sin(lt + k) * 18, r = 46 + (k % 3) * 18;
            const pts = inkEllipsePts(x, y, r * 1.5, r, sd + 300 + k, 10, 0, 0.12); FU.push(inkLoop(pts, o(300 + k, { amp: 2 }))); if (k % 2) FUI.push(inkPath(pts, o(320 + k, { closed: true, w: 3, amp: 2 }))); }
          fumes.setAttribute('d', FU.join(' ')); fumes.setAttribute('fill-opacity', (0.5 * fk).toFixed(3));
          fumesI.setAttribute('d', FUI.join(' ')); fumesI.setAttribute('fill-opacity', (0.8 * fk).toFixed(3));
          // spanner banged on the engine
          const si = crewDef.findIndex(c => c.spanner), sa = P.spanner != null ? at(P.spanner, null) : null;
          if (si >= 0 && cres[si]) {
            const q = cres[si], sh = [q.head[0] + q.face * 10, q.head[1] + 150 * q.s / 0.6];
            const beat = sa != null && lt >= sa ? Math.abs(Math.sin((lt - sa) * 7)) : 0.3;
            const an = (q.face < 0 ? Math.PI : 0) + (q.face < 0 ? 1 : -1) * (0.2 + beat * 0.7);
            const len = 150, tip = [sh[0] + Math.cos(an) * len, sh[1] + Math.sin(an) * len];
            span.setAttribute('d', inkPath([sh, tip], o(400, { w: 11 })) + ' ' + inkPath(T.circ(tip[0], tip[1], 18, 8), o(401, { closed: true, w: 7 })));
            if (sa != null && lt >= sa && beat > 0.85) {
              const pts = []; for (let k = 0; k < 12; k++) { const a2 = k / 12 * 6.2832, r = (k % 2 ? 0.4 : 1) * 46; pts.push([tip[0] + Math.cos(a2) * r, tip[1] + Math.sin(a2) * r]); }
              clang.setAttribute('d', inkLoop(pts, o(402, { smooth: false })));
              clangI.setAttribute('d', [0, 1, 2, 3].map(k => { const a2 = -2.4 + k * 0.5; return inkPath([[tip[0] + Math.cos(a2) * 60, tip[1] + Math.sin(a2) * 60], [tip[0] + Math.cos(a2) * 100, tip[1] + Math.sin(a2) * 100]], o(403 + k, { w: 6 })); }).join(' '));
            } else { clang.setAttribute('d', ''); clangI.setAttribute('d', ''); }
          }
          // four men to steer
          const ra = P.steer != null ? at(P.steer, null) : null;
          if (ra != null && lt >= ra) {
            const idx = P.steer_crew || [0, 1, 6, 7], R2 = [];
            idx.forEach((i, k) => { const q = cres[i]; if (!q) return; const p = progIO(lt, ra + k * 0.25, 0.5); if (p <= 0) return;
              const pts = inkEllipsePts(q.x, q.y - 120 * q.s / 0.6, 90 * q.s / 0.6, 200 * q.s / 0.6, sd + 500 + i, 14);
              const pp = pts.slice(0, Math.max(2, Math.round(pts.length * p))); R2.push(inkPath(p >= 1 ? pts : pp, o(500 + i, { closed: p >= 1, w: 7 }))); });
            ring.setAttribute('d', R2.join(' '));
          } else ring.setAttribute('d', '');
          const hit = punch(lt, at('hit', null), 0.6);
          cam.setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${(1 + 0.02 * hit).toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
