// pga_skull: a skull in side profile drawn in ink (museum-plate style, no blood) with the path of an iron rod:
// in under the left cheekbone, behind the left eye, out through the top of the skull (Phineas Gage, 1848).
// Parchment ink (brand/kit/BRAND.md §3, §5), boils at 8 Hz, pure function of (seed, lt). Written for ag-04-phineas-gage
// (cold open + chapter 2), parametric so the other chapters can reuse it (static rod, lobe highlight, wiring, no rod).
// The skull faces left (we see its LEFT side). Skull units: ~600 tall at scale 1, centre of the cranium at (x, y).
// P: {x: 0.5, y: 0.5 (0..1 of W/H), scale: 1 (1 = skull 0.56 H tall),
//     rod: {mode: "fly"|"static"|false, at: cue|s (fly: the rod starts moving), dur: 0.7, through: true (keeps flying
//           out of the top and off the frame after it pierces; false = it stops piercing the skull),
//           out_at: cue (with through: the moment it leaves), len: 2.3 (rod length in skull heights), w: 26},
//     path: cue|false (a red dashed trajectory line draws from entry to exit),
//     marks: {in: cue, eye: cue, out: cue} (red ink rings: entry under the cheekbone, behind the eye, exit on top),
//     lobe: cue|true|false (left frontal lobe hatched in red), brain: true (soft gyri inside the cranium),
//     wiring: cue|false (blue fibre lines from the frontal lobe to the back of the brain; on the cue, red cuts snap them),
//     shake: cue (camera shake), kasif: {x: 0.82, y: 0.9, scale: 0.75, pose, face, emotion, seq, at, then} | false,
//     cast: [...MCB cast], labels: [...MCB labels], cam: {zoom: 1.05, focus: [0.5, 0.5]}}
// cues: whatever names the params reference (in, eye, out, hit, lobe, cut ...); "hit" = punch on rod impact.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  // skull outline pieces in skull units (facing left: nose at -x), centre of cranium near (0, -40)
  const CRANIUM = [[-190, -62], [-206, -150], [-168, -236], [-88, -290], [18, -304], [126, -274], [206, -196], [242, -86], [234, 24], [198, 112], [134, 160], [74, 150]];
  const FACE = [[-190, -62], [-214, -24], [-224, 16], [-208, 48], [-214, 84], [-206, 124], [-198, 140]];
  const UPPER = [[-198, 140], [-150, 146], [-104, 140], [-74, 118], [-40, 106]];
  const JAW = [[-196, 152], [-200, 214], [-186, 252], [-118, 266], [-24, 252], [42, 206], [54, 150], [64, 116]];
  const ZYG = [[-176, 38], [-128, 44], [-70, 40], [-10, 50], [44, 64]];
  const ORBIT = { c: [-142, -14], rx: 42, ry: 40 };
  const NASAL = [[-206, 50], [-186, 30], [-180, 64], [-196, 82]];
  const SUTURE = [[-40, -296], [-30, -270], [-46, -244], [-26, -214], [-40, -186]];
  const LOBE = [[-180, -70], [-192, -150], [-160, -226], [-86, -272], [-6, -282], [-14, -200], [-46, -120], [-80, -78], [-130, -60]];
  const BRAIN = [[-180, -66], [-192, -150], [-158, -228], [-84, -276], [16, -288], [118, -258], [190, -186], [222, -86], [214, 14], [176, 80], [110, 100], [20, 70], [-60, 36], [-130, 4]];
  const ENTRY = [-100, 76], EXIT = [-40, -302];

  SH.pga_skull = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 7100;
      const K = 0.56 * H / 600 * (P.scale ?? 1), CX = (P.x ?? 0.5) * W, CY = (P.y ?? 0.5) * H;
      const S = q => [CX + q[0] * K, CY + (q[1] + 40) * K];
      const Sp = pts => pts.map(S);
      const root = el(svg, 'g'), cam = el(root, 'g');
      const halo = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.75 });
      const brainF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.35 }), gyri = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      const lobeF = inkEl(cam, INK.red, { 'fill-opacity': 0.22 }), lobeH = inkEl(cam, INK.red), lobeR = inkEl(cam, INK.red);
      const wireB = inkEl(cam, INK.blue), wireCut = inkEl(cam, INK.red);
      const bone = inkEl(cam), soft = inkEl(cam, INK.inkSoft), teeth = inkEl(cam, INK.ink), orbitF = inkEl(cam, INK.paperDark);
      const pathL = inkEl(cam, INK.red);
      const speed = inkEl(cam, INK.inkSoft);
      const rodG = el(cam, 'g'), rod = PGA.iron(rodG);
      const rings = inkEl(cam, INK.red);
      const castG = el(cam, 'g');
      const KZ = P.kasif === false ? null : Object.assign({ who: 'kasif', x: 0.82, y: 0.9, scale: 0.75, pose: 'talk', face: 'left' }, P.kasif || {});
      const cs = cast(castG, (P.cast || []).concat(KZ ? [KZ] : []), W, H, sd + 300);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const R = rng(sd + 9), gyr = [];
      for (let i = 0; i < 16; i++) {
        const cx = -150 + R() * 340, cy = -250 + R() * 300, pts = [];
        for (let j = 0; j < 6; j++) pts.push([cx + j * 16, cy + Math.sin(j * 1.9 + i) * 12]);
        if (cx < 200 && cy < 60 && !(cx < -120 && cy > -40)) gyr.push(pts);
      }
      const fibres = [[[-120, -150], [-20, -170], [90, -150], [170, -90]], [[-100, -100], [0, -110], [90, -80], [160, -20]], [[-140, -200], [-40, -230], [60, -210], [140, -160]]];
      const RD = P.rod === false ? null : Object.assign({ mode: 'fly', at: 0.3, dur: 0.7, through: false, len: 2.3, w: 26 }, P.rod || {});

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const rodAt = RD ? atOr(cues, RD.at, 0.3) : null;
          const arrive = RD && RD.mode === 'fly' ? rodAt + RD.dur : 0;
          const hit = Math.max(punch(lt, atOr(cues, 'hit', RD && RD.mode === 'fly' ? arrive : null), 0.6), RD && RD.mode === 'fly' ? punch(lt, arrive, 0.5) : 0);
          const shAt = atOr(cues, P.shake, RD && RD.mode === 'fly' ? arrive : null);
          const shake = shAt != null && lt >= shAt ? Math.exp(-(lt - shAt) * 5) * 0.8 : 0;
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [(P.x ?? 0.5), 0.5] }, hit, shake);
          const app = spring(lt, 0.0, 0.5);
          // skull: draws on (0..0.6 s) then boils
          const dr = clamp01(lt / 0.6);
          const cut = (pts, p) => p >= 1 ? pts : pts.slice(0, Math.max(2, Math.ceil(pts.length * p)));
          halo.setAttribute('d', inkLoop(Sp(CRANIUM.concat([[54, 150], [42, 206], [-24, 252], [-118, 266], [-186, 252], [-200, 214], [-214, 84], [-224, 16], [-214, -24]])), { seed: sd + 1, t, amp: 1 }));
          if (P.brain !== false) {
            brainF.setAttribute('d', inkLoop(Sp(BRAIN), { seed: sd + 2, t, amp: 1 }));
            gyri.setAttribute('d', gyr.map((g, i) => inkPath(Sp(g), { w: 3.5, seed: sd + 30 + i, t, amp: 1 })).join(' '));
          }
          const lobeAt = P.lobe === true ? 0 : P.lobe ? atOr(cues, P.lobe, null) : null;
          const lp = lobeAt != null ? prog(lt, lobeAt, 0.6) : 0;
          if (lp > 0.01) {
            const pk = punch(lt, lobeAt, 0.6), lc = [-100, -170], s = (0.85 + 0.15 * lp) * (1 + 0.06 * pk);
            const lobe = LOBE.map(q => [lc[0] + (q[0] - lc[0]) * s, lc[1] + (q[1] - lc[1]) * s]);
            lobeF.setAttribute('d', inkLoop(Sp(lobe), { seed: sd + 3, t, amp: 1 }));
            lobeR.setAttribute('d', inkPath(Sp(lobe), { w: 6, seed: sd + 4, t, closed: true, amp: 1.2 }));
            let hd = '';
            for (let i = 0; i < 9; i++) { if (i / 9 > lp) break; const x = -190 + i * 22; hd += inkPath(Sp([[x, -70 - i * 4], [x + 60, -220 + i * 6]].map(q => [lc[0] + (q[0] - lc[0]) * 0.8, lc[1] + (q[1] - lc[1]) * 0.8])), { w: 3, seed: sd + 50 + i, t, amp: 1 }) + ' '; }
            lobeH.setAttribute('d', hd);
          } else { lobeF.setAttribute('d', ''); lobeR.setAttribute('d', ''); lobeH.setAttribute('d', ''); }
          if (P.wiring) {
            const wa = atOr(cues, P.wiring === true ? 'wire' : P.wiring, 0.3), cAt = atOr(cues, P.cut ?? 'cut', null);
            const wp = prog(lt, wa, 0.9);
            wireB.setAttribute('d', wp > 0.01 ? fibres.map((fb, i) => inkPath(Sp(cut(inkSpline(fb, false, 12), wp)), { w: 5, seed: sd + 60 + i, t, amp: 1 })).join(' ') : '');
            const cp = cAt != null ? spring(lt, cAt, 0.4) : 0;
            wireCut.setAttribute('d', cp > 0.02 ? fibres.map((fb, i) => { const m = fb[1], r = 26 * cp; return inkPath(Sp([[m[0] - r, m[1] - r], [m[0] + r, m[1] + r]]), { w: 9, seed: sd + 70 + i, t }) + ' ' + inkPath(Sp([[m[0] - r, m[1] + r], [m[0] + r, m[1] - r]]), { w: 9, seed: sd + 74 + i, t }); }).join(' ') : '');
          }
          let bd = inkPath(Sp(cut(CRANIUM, dr)), { w: 8, seed: sd + 10, t, amp: 1.4 }) + ' ' + inkPath(Sp(cut(FACE, dr)), { w: 7, seed: sd + 11, t, amp: 1.2 }) + ' ' +
            inkPath(Sp(cut(JAW, dr)), { w: 7, seed: sd + 12, t, amp: 1.2 }) + ' ' + inkPath(Sp(cut(UPPER, dr)), { w: 6, seed: sd + 13, t, amp: 1 }) + ' ' +
            inkPath(Sp(cut(ZYG, dr)), { w: 7, seed: sd + 14, t, amp: 1.2 });
          const op = inkEllipsePts(ORBIT.c[0], ORBIT.c[1], ORBIT.rx, ORBIT.ry, sd + 15, 12);
          bd += ' ' + inkPath(Sp(op), { w: 7, seed: sd + 16, t, closed: true, amp: 1.2 });
          bone.setAttribute('d', bd);
          orbitF.setAttribute('d', inkLoop(Sp(inkEllipsePts(ORBIT.c[0], ORBIT.c[1], ORBIT.rx * 0.8, ORBIT.ry * 0.8, sd + 17, 10)), { seed: sd + 17, t, amp: 1 }) + ' ' + inkLoop(Sp(NASAL), { seed: sd + 18, t, amp: 1 }));
          let td = '';
          for (let i = 0; i < 7; i++) { const x = -192 + i * 18; td += inkPath(Sp([[x, 140], [x + 2, 156]]), { w: 4, seed: sd + 80 + i, t, amp: 0.6 }) + ' '; }
          teeth.setAttribute('d', td);
          soft.setAttribute('d', inkPath(Sp(SUTURE), { w: 3.5, seed: sd + 19, t, amp: 1 }) + ' ' + inkCircle(...S([80, 66]), 11 * K, sd + 20, t, { w: 4 }) + ' ' +
            inkPath(Sp([[198, 112], [170, 134], [110, 140]]), { w: 3.5, seed: sd + 21, t, amp: 1 }));
          // trajectory + rod
          const ux = EXIT[0] - ENTRY[0], uy = EXIT[1] - ENTRY[1], ul = Math.hypot(ux, uy), u = [ux / ul, uy / ul];
          const pAt = P.path ? atOr(cues, P.path, null) : null, pp = pAt != null ? prog(lt, pAt, 0.8) : 0;
          if (pp > 0.01) {
            let pd = '';
            const a = [ENTRY[0] - u[0] * 60, ENTRY[1] - u[1] * 60], b = [EXIT[0] + u[0] * 60, EXIT[1] + u[1] * 60], L = Math.hypot(b[0] - a[0], b[1] - a[1]) * pp;
            for (let d = 0; d < L; d += 34) { const e = Math.min(L, d + 20); pd += inkPath(Sp([[a[0] + u[0] * d, a[1] + u[1] * d], [a[0] + u[0] * e, a[1] + u[1] * e]]), { w: 6, seed: sd + 90 + d, t, amp: 0.8 }) + ' '; }
            if (pp > 0.95) { const ah = [b[0], b[1]]; pd += inkPath(Sp([[ah[0] - u[0] * 30 - u[1] * 18, ah[1] - u[1] * 30 + u[0] * 18], ah, [ah[0] - u[0] * 30 + u[1] * 18, ah[1] - u[1] * 30 - u[0] * 18]]), { w: 6, seed: sd + 98, t, smooth: false }); }
            pathL.setAttribute('d', pd);
          } else pathL.setAttribute('d', '');
          if (RD) {
            const len = RD.len * 600, below = len * 0.52;           // at rest: 52% of the rod below the entry point
            let off = 0;                                           // along u, skull units (0 = rest)
            if (RD.mode === 'fly') {
              const startOff = -(len + 700);
              off = lt < rodAt ? startOff : lerp(startOff, 0, clamp01((lt - rodAt) / RD.dur));
              if (RD.through) {
                const oa = atOr(cues, RD.out_at, arrive + 0.5);
                if (lt > oa) off += (lt - oa) * 2600;
              }
            }
            const butt = [ENTRY[0] - u[0] * (below - off), ENTRY[1] - u[1] * (below - off)], tip = [butt[0] + u[0] * len, butt[1] + u[1] * len];
            const flying = RD.mode === 'fly' && lt >= rodAt && (lt < arrive || (RD.through && lt > atOr(cues, RD.out_at, arrive + 0.5)));
            rod.draw(t, sd + 100, S(butt), S(tip), RD.w * K / 0.9, lt >= rodAt - 0.01 || RD.mode !== 'fly');
            let sp = '';
            if (flying) for (let i = 0; i < 5; i++) {
              const o2 = (i - 2) * 26, a = [butt[0] - u[0] * (40 + i * 30) - u[1] * o2, butt[1] - u[1] * (40 + i * 30) + u[0] * o2];
              sp += inkPath(Sp([a, [a[0] - u[0] * 220, a[1] - u[1] * 220]]), { w: 5, seed: sd + 110 + i, t, amp: 1 }) + ' ';
            }
            speed.setAttribute('d', sp);
          }
          // marks
          const M = P.marks || {};
          let rd = '';
          [['in', ENTRY, 40], ['eye', [-86, -14], 36], ['out', [EXIT[0] + 4, EXIT[1] + 10], 44]].forEach(([k, q, r], i) => {
            const a = M[k] != null ? atOr(cues, M[k], null) : null;
            if (a == null || lt < a) return;
            const p = spring(lt, a, 0.5), c = S(q);
            rd += inkCircle(c[0], c[1], r * K * 1.15 * Math.max(0.05, p) * (1 + 0.1 * punch(lt, a, 0.5)), sd + 120 + i, t, { w: 7 }) + ' ';
          });
          rings.setAttribute('d', rd);
          root.setAttribute('transform', `translate(0 ${f1((1 - app) * 30)})`);
          cs.update(lt, t, cues);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
