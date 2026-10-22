// ag01_rasat: Takiyüddin's Istanbul (Tophane) observatory on its hill (parchment ink, brand/kit/BRAND.md §5):
// a domed hall, a tower with a slowly turning armillary sphere and a mural quadrant; a starry sky with a comet whose
// tail draws itself; optionally the building drawing itself piece by piece, galleys in the sea below firing
// cannon volleys (puff, flash, cannonball arc, impact) and the building collapsing into rubble and dust.
//
// SHOTS.ag01_rasat P: {
//   comet: true | {at: cue|seconds, dur: 1.0, x: 300, y: 430, len: 560, ang: -18, r: 30}   // false = no comet
//   stars: true,                      // twinkling ink stars in the sky
//   build: false | {at: cue, dur: 1.6} // the observatory draws itself piece by piece (else it is standing)
//   ships: 0..2,                      // galleys in the sea, lower left
//   fire: ["cueA", "cueB"] | "cue",   // cannon volleys (each: puffs, flashes, cannonballs flying to the building)
//   hit: "cue",                       // the collapse (pieces fall, dust, debris; camera shake)
//   note: {text, x: 0.5, y: 0.2, at, size: 80, color: "red"|"ink"},
//   ropes: [{cast: 1 (index of the puller in cast), at: cue (taut + pulling)}]  // ropes from the dome to a cast member's hands
//   cam: {zoom: 1.08, focus: [0.55, 0.45]},
//   cast: [{who: "kasif"|name, accessory: "turban", beard: "grey", x: 0.84, y (0..1 H, default ground 0.605),
//           scale: 0.75, pose: "idle", at: cue|seconds, then: "shock", to: 0.7 (walk to x, arriving at "at"),
//           face: "left"|"right", dir: "up"|deg, emotion (after "at"), emotion0 (before), item, text}]
// }
// cues: comet.at, build.at, fire[], hit, note.at, cast[].at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };

  // galley facing +x (same drawing family as halic.js), with a cannon at the bow
  function shipStrokes(s) {
    const P = a => a.map(q => [q[0] * s, q[1] * s]);
    return [
      { p: P([[-1, -0.22], [1.05, -0.3], [0.7, 0.12], [-0.72, 0.12]]), c: 1, f: INK.paperDark, w: 4, sm: 0 },
      { p: P([[0, -0.26], [0, -1.25]]), w: 4 },
      { p: P([[0.06, -1.18], [0.8, -0.42], [0.06, -0.36]]), c: 1, f: INK.paperLight, w: 3.5, sm: 0 },
      { p: P([[0, -1.24], [0.2, -1.2], [0.42, -1.14]]), w: 7, col: INK.red },
      { p: P([[0.62, -0.36], [1.12, -0.5]]), w: 10 },                  // cannon barrel
    ];
  }

  SH.ag01_rasat = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      // layout is authored on the 1080x1920 portrait frame; landscape fits it into the middle
      if (!portrait) root.setAttribute('transform', `translate(${f1(W / 2 - 1080 * 0.5 * 0.62)} ${f1(-170)}) scale(0.62)`);
      const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
      const GY = 870;                      // ground line under the observatory
      const BX = 640;                      // observatory centre
      const sd0 = seed * 1000;

      // ---------- sky
      const starE = mk(cam, INK.inkSoft);
      const sr = rng(seed * 7 + 3), STARS = [];
      for (let i = 0; i < 16; i++) STARS.push([60 + sr() * 960, 300 + sr() * 360, 7 + sr() * 7, sr() * 6]);
      const C = P.comet === false ? null : Object.assign({ x: 300, y: 440, len: 560, ang: -18, dur: 1.0, r: 30 }, typeof P.comet === 'object' ? P.comet : {});
      const cometTail = C ? mk(cam, INK.gold, { 'fill-opacity': 0.95 }) : null;
      const cometInk = C ? mk(cam, INK.inkSoft) : null;
      const cometHeadF = C ? mk(cam, INK.gold) : null, cometHead = C ? mk(cam) : null;

      // ---------- hill + sea
      const hillF = mk(cam, INK.paperDark), hillR = mk(cam), hatch = mk(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      const HILL = [[-30, 1070], [200, 1050], [360, 990], [470, 905], [560, 880], [760, 872], [900, 882], [1110, 905]];
      const nShips = Math.min(2, P.ships || 0);
      const seaF = nShips ? mk(cam, INK.paperLight) : null, seaR = nShips ? mk(cam, INK.inkSoft) : null;

      // ---------- observatory pieces (each in its own group so it can fall)
      const dustF = mk(cam, INK.paperLight), dustR = mk(cam, INK.inkSoft);
      const bldG = el(cam, 'g');
      const piece = (name, pivot, strokes) => {
        const g = el(bldG, 'g');
        const parts = strokes.map(st => ({ st, f: st.f ? mk(g, st.f) : null, r: mk(g, st.col || INK.ink) }));
        return { name, pivot, g, parts };
      };
      const arc = (cx, cy, rx, ry, a0, a1, n = 12) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
      const hallL = piece('hallL', [570, GY], [
        { p: [[490, GY], [490, 742], [640, 742], [640, GY]], c: 1, f: INK.paperLight, w: 6, sm: 0 },
        { p: [[520, 840], [520, 790], ...arc(540, 790, 20, 22, 180, 360, 6).slice(1), [560, 840]], w: 4 },
        { p: [[590, GY], [590, 815], ...arc(615, 815, 25, 30, 180, 270, 4).slice(1)], w: 5 },
      ]);
      const hallR = piece('hallR', [710, GY], [
        { p: [[640, GY], [640, 742], [790, 742], [790, GY]], c: 1, f: INK.paperLight, w: 6, sm: 0 },
        { p: [[720, 840], [720, 790], ...arc(740, 790, 20, 22, 180, 360, 6).slice(1), [760, 840]], w: 4 },
        { p: [[690, GY], [690, 815], ...arc(665, 815, 25, 30, 360, 270, 4).slice(1)], w: 5 },
      ]);
      const dome = piece('dome', [BX, 742], [
        { p: [...arc(BX, 742, 96, 92, 180, 360, 14)], c: 1, f: INK.paperLight, w: 6 },
        { p: [[BX, 650], [BX, 612]], w: 5 },
        { p: arc(BX, 600, 10, 10, 0, 360, 8), c: 1, f: INK.gold, w: 3 },
        { p: [[BX - 60, 700], [BX - 20, 668], [BX + 30, 664]], w: 3, col: INK.inkSoft },
      ]);
      const tower = piece('tower', [450, GY], [
        { p: [[418, GY], [422, 640], [482, 640], [486, GY]], c: 1, f: INK.paperLight, w: 6, sm: 0 },
        { p: [[410, 640], [494, 640]], w: 7 },
        { p: [[440, 700], [440, 668], [464, 668], [464, 700]], w: 4 },
        { p: [[440, 780], [440, 748], [464, 748], [464, 780]], w: 4 },
      ]);
      const sphere = piece('sphere', [452, 600], []);   // rings are rebuilt per frame (turning)
      const sphereR = mk(sphere.g), sphereS = mk(sphere.g);
      const quad = piece('quad', [770, 742], [
        { p: [[770, 742], [770, 620], ...arc(770, 742, 122, 122, 270, 360, 8).slice(1), [770, 742]], c: 1, f: INK.paperLight, w: 5, sm: 0 },
        { p: [[770, 742], [850, 652]], w: 4, col: INK.red },
      ]);
      const quadTicks = mk(quad.g, INK.inkSoft);
      const PIECES = [tower, hallL, hallR, dome, quad, sphere];
      const ropeE = mk(cam, INK.ink);         // in front of the building so the pull reads
      // where each piece flies on the collapse: [dx, dy, rot]
      const FALL = { tower: [-60, 0, -78], hallL: [-30, 0, -14], hallR: [40, 0, 16], dome: [30, 180, 32], quad: [110, 120, 70], sphere: [-120, 260, -40] };

      // ---------- dust, debris, cannon effects
      const debris = mk(cam);
      const shipsG = [];
      for (let k = 0; k < nShips; k++) {
        const g = el(cam, 'g'), parts = shipStrokes(56 - k * 6).map(st => ({ st, f: st.f ? mk(g, st.f) : null, r: mk(g, st.col || INK.ink) }));
        shipsG.push({ k, g, parts, x: 120 + k * 190, y: 1100 - k * 18, s: 56 - k * 6 });
      }
      const puffF = mk(cam, INK.paperLight), puffR = mk(cam, INK.inkSoft), flash = mk(cam, INK.gold), balls = mk(cam);
      const impact = mk(cam, INK.red);

      // ---------- note
      let note = null;
      if (P.note) {
        const N = typeof P.note === 'string' ? { text: P.note } : P.note;
        const g = el(root, 'g'), box = mk(g, INK.paperLight), boxR = mk(g);
        const t = el(g, 'text', { 'font-family': INK_FONT, 'font-size': N.size || 80, 'text-anchor': 'middle', fill: N.color === 'ink' ? INK.ink : INK.red });
        t.textContent = N.text;
        note = { N, g, box, boxR, t };
      }
      // ---------- cast
      const cast = (P.cast || []).map((m, i) => {
        const isK = (m.who || 'kasif') === 'kasif';
        const sc = m.scale ?? (isK ? 0.75 : 0.62);
        return { m, isK, sc, rig: typeof KASIF !== 'undefined' ? KASIF.create(el(isK ? root : cam, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || 'turban'), beard: isK ? null : (m.beard || null), seed: seed + 11 + i * 17 }) : null };
      });

      const fires = [].concat(P.fire || []);
      const FOC = (P.cam && P.cam.focus) ? [P.cam.focus[0] * 1080, P.cam.focus[1] * 1920] : [BX, 800];

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, sd = sd0;
          const hitAt = P.hit != null ? atOr(cues, P.hit, dur * 0.55) : null;
          const fall = hitAt != null ? clamp01((lt - hitAt) / 0.9) : 0;
          // camera: slow push-in + shake on the hit
          const z = lerp(1, (P.cam && P.cam.zoom) || 1.07, progIO(lt, 0, Math.max(1.5, dur)));
          const sh = hitAt != null ? punch(lt, hitAt, 0.7) : 0;
          const shx = Math.sin(t * 60) * 14 * sh, shy = Math.cos(t * 47) * 10 * sh;
          cam.setAttribute('transform', `translate(${f1(FOC[0] + shx)} ${f1(FOC[1] + shy)}) scale(${z.toFixed(4)}) translate(${f1(-FOC[0])} ${f1(-FOC[1])})`);

          // stars
          if (P.stars !== false) {
            let d = '';
            STARS.forEach(([x, y, r, ph], i) => {
              const k = r * (0.75 + 0.35 * Math.sin(t * 2.4 + ph));
              d += inkPath([[x - k, y], [x + k, y]], { seed: sd + 10 + i, t, w: 3.5, amp: 0.6 }) + ' ' + inkPath([[x, y - k], [x, y + k]], { seed: sd + 40 + i, t, w: 3.5, amp: 0.6 }) + ' ';
            });
            starE.setAttribute('d', d);
          }
          // comet: the tail grows from the head, then shimmers
          if (C) {
            const at = atOr(cues, C.at, 0.1), p = prog(lt, at, C.dur), hp = spring(lt, at, 0.5);
            const a = C.ang * Math.PI / 180, ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
            const hx = C.x + Math.sin(t * 0.7) * 4, hy = C.y + Math.cos(t * 0.6) * 3;
            let tail = '', lines = '';
            const kr = C.r / 30;
            [[-34, 0.86], [-17, 1.0], [0, 1.08], [17, 0.95], [34, 0.8]].forEach(([off0, lk], i) => {
              const off = off0 * kr;
              const L = C.len * lk * p * (0.97 + 0.03 * Math.sin(t * 3 + i));
              const spread = off * (1 + 1.6 * lk);
              const pts = [[hx + nx * off * 0.3, hy + ny * off * 0.3], [hx + ux * L * 0.5 + nx * spread * 0.6, hy + uy * L * 0.5 + ny * spread * 0.6], [hx + ux * L + nx * spread, hy + uy * L + ny * spread]];
              if (L > 4) {
                tail += inkPath(pts, { seed: sd + 70 + i, t, w: (i === 2 ? 26 : 16) * C.r / 30, taper: 0.9, vary: 0.25 }) + ' ';
                lines += inkPath(pts.map(q => [q[0] + nx * 9, q[1] + ny * 9]), { seed: sd + 80 + i, t, w: 3 + kr, taper: 0.8 }) + ' ';
              }
            });
            cometTail.setAttribute('d', tail);
            cometInk.setAttribute('d', lines);
            const r = C.r * hp * (1 + 0.06 * Math.sin(t * 5));
            cometHeadF.setAttribute('d', r > 1 ? inkCircle(hx, hy, r, sd + 90, t, { fill: true }) : '');
            // head: ink ring + a highlight arc on the leading side + speed streaks into the tail (no sun rays)
            const fx = -ux, fy = -uy, fa = Math.atan2(fy, fx);
            cometHead.setAttribute('d', r > 1 ? inkCircle(hx, hy, r, sd + 90, t, { w: 6 }) + ' ' +
              inkPath(Array.from({ length: 6 }, (_, j) => { const b = fa - 0.9 + j * 0.36; return [hx + Math.cos(b) * r * 0.62, hy + Math.sin(b) * r * 0.62]; }), { seed: sd + 94, t, w: 4 }) + ' ' +
              [-0.7, 0, 0.7].map((o, j) => inkPath([[hx + ux * r * 1.2 + nx * o * r, hy + uy * r * 1.2 + ny * o * r], [hx + ux * r * (2.4 + j * 0.3) + nx * o * r * 1.3, hy + uy * r * (2.4 + j * 0.3) + ny * o * r * 1.3]], { seed: sd + 95 + j, t, w: 4, taper: 0.8 })).join(' ') : '');
          }
          // hill
          const hill = HILL.concat([[1110, 1160], [-30, 1160]]);
          hillF.setAttribute('d', inkLoop(hill, { seed: sd + 100, t, amp: 1.4 }));
          hillR.setAttribute('d', inkPath(HILL, { seed: sd + 100, t, w: 6, amp: 1.4 }));
          let hd = '';
          for (let i = 0; i < 9; i++) { const x = 380 + i * 80, y = 930 + (i % 3) * 50; hd += inkPath([[x, y], [x + 34, y + 22]], { seed: sd + 110 + i, t, w: 3 }) + ' '; }
          hatch.setAttribute('d', hd);
          if (nShips) {
            const top = [];
            for (let i = 0; i <= 10; i++) top.push([-30 + i * 48, 1092 + Math.sin(t * 1.8 + i * 0.9) * 5]);
            const sea = top.concat([[450, 1160], [-30, 1160]]);
            seaF.setAttribute('d', inkLoop(sea, { seed: sd + 120, t, amp: 1 }));
            let wd = inkPath(top, { seed: sd + 120, t, w: 4, amp: 1 }) + ' ';
            [[60, 1128], [250, 1140], [380, 1122]].forEach(([x, y], i) => { const pts = []; for (let j = 0; j <= 5; j++) pts.push([x + j * 11, y + Math.sin(j * 1.6 + t * 2.2) * 4]); wd += inkPath(pts, { seed: sd + 125 + i, t, w: 3 }) + ' '; });
            seaR.setAttribute('d', wd);
          }

          // observatory: build-in, turning sphere, collapse
          // quadrant arm sweeps slowly (alive even before anything happens)
          quad.parts[1].st.p = [[770, 742], [770 + Math.cos((300 + 25 * Math.sin(t * 0.8)) * Math.PI / 180) * 118, 742 + Math.sin((300 + 25 * Math.sin(t * 0.8)) * Math.PI / 180) * 118]];
          const B = P.build ? Object.assign({ dur: 1.6 }, typeof P.build === 'object' ? P.build : {}) : null;
          const bAt = B ? atOr(cues, B.at, 0.2) : 0;
          const order = ['tower', 'hallL', 'hallR', 'dome', 'quad', 'sphere'];
          PIECES.forEach(pc => {
            let tr = '', op = 1;
            if (B) {
              const i = order.indexOf(pc.name), p = spring(lt, bAt + i * B.dur / order.length, 0.55);
              op = clamp01(p * 3);
              tr = `translate(0 ${f1((1 - p) * 60)}) `;
            }
            if (P.ropes && (pc.name === 'dome' || pc.name === 'sphere') && fall === 0) {
              const ra = atOr(cues, P.ropes[0].at, 0.3), k = prog(lt, ra, 1.2) * (1 + 0.3 * Math.sin(t * 9));
              tr += `rotate(${f1(-6 * k)} ${pc.pivot[0]} ${pc.pivot[1]}) `;
            }
            if (fall > 0) {
              const [dx, dy, rot] = FALL[pc.name], e = fall * fall;   // gravity-like
              const bounce = Math.sin(clamp01((lt - hitAt - 0.9) / 0.35) * Math.PI) * 10 * (fall >= 1 ? 1 : 0);
              tr += `translate(${f1(dx * e)} ${f1(dy * e - bounce)}) rotate(${f1(rot * e)} ${pc.pivot[0]} ${pc.pivot[1]}) `;
            }
            pc.g.setAttribute('transform', tr);
            pc.g.style.opacity = op;
            pc.parts.forEach((pp, i) => {
              const o = { seed: sd + 200 + pc.name.length * 37 + i * 7, t, amp: 1.3, smooth: pp.st.sm !== 0 };
              if (pp.f) pp.f.setAttribute('d', inkLoop(pp.st.p, o));
              pp.r.setAttribute('d', inkPath(pp.st.p, Object.assign({}, o, { w: pp.st.w, closed: !!pp.st.c })));
            });
          });
          // armillary sphere: three rings, the inner ones turning slowly
          {
            const cx = 452, cy = 596, R = 44, spin = t * 0.9;
            const ring = (rx, ry, rot, s) => inkCircle(cx, cy, rx, sd + s, t, { ry, rot, w: 4.5, n: 14 });
            sphereR.setAttribute('d', ring(R, R, 0, 300) + ' ' + ring(R, Math.abs(Math.cos(spin)) * R + 4, 0.3, 301) + ' ' + ring(Math.abs(Math.sin(spin * 0.8)) * R + 4, R, -0.2, 302) + ' ' +
              inkPath([[cx, cy + R], [cx, 640]], { seed: sd + 303, t, w: 6 }));
            sphereS.setAttribute('d', inkDot(cx, cy, 7, 7, sd + 304, t));
          }
          let qd = '';
          for (let i = 1; i < 8; i++) { const a = (270 + i * 90 / 8) * Math.PI / 180; qd += inkPath([[770 + Math.cos(a) * 104, 742 + Math.sin(a) * 104], [770 + Math.cos(a) * 120, 742 + Math.sin(a) * 120]], { seed: sd + 310 + i, t, w: 3 }) + ' '; }
          quadTicks.setAttribute('d', qd);

          // dust + debris after the hit
          if (hitAt != null && lt >= hitAt) {
            const u = lt - hitAt;
            let df = '', dr = '', db = '';
            for (let i = 0; i < 9; i++) {
              const p = clamp01(u / (1.2 + (i % 3) * 0.3)), r = (40 + (i % 4) * 22) * (0.3 + p) * (1 - 0.25 * clamp01((u - 2.5) / 2));
              const x = 430 + i * 50 + Math.sin(i * 2.1) * 30 + (i - 4) * 20 * p, y = GY - 30 - (i % 3) * 40 - 120 * p * (0.4 + (i % 2) * 0.4);
              if (i % 2) continue;                       // fewer, bigger, bumpy clouds (not bubbles)
              const R = r * 1.5, cl = [];
              for (let q = 0; q < 16; q++) { const a = q / 16 * Math.PI * 2, k = 1 + 0.16 * Math.sin(a * 5 + i * 1.7 + u * 1.2); cl.push([x + Math.cos(a) * R * k, y + Math.sin(a) * R * k * 0.72]); }
              df += inkLoop(cl, { seed: sd + 400 + i, t, amp: 1.5 }) + ' ';
              dr += inkPath(cl, { seed: sd + 400 + i, t, closed: true, w: 3.5, amp: 1.5 }) + ' ';
              dr += inkPath([[x - R * 0.5, y - R * 0.1], [x - R * 0.1, y - R * 0.3], [x + R * 0.3, y - R * 0.2]], { seed: sd + 450 + i, t, w: 2.5 }) + ' ';
            }
            for (let i = 0; i < 12; i++) {
              const a = -Math.PI * (0.15 + 0.7 * (i / 11)), v = 360 + (i % 4) * 90, tt = Math.min(u, 1.2);
              const x = BX + Math.cos(a) * v * tt, y = 760 + Math.sin(a) * v * tt + 520 * tt * tt;
              if (y < 1150) db += inkDot(x, y, 8 + (i % 3) * 4, 6 + (i % 2) * 4, sd + 430 + i, t) + ' ';
            }
            dustF.setAttribute('d', df); dustR.setAttribute('d', dr); debris.setAttribute('d', db);
          } else { dustF.setAttribute('d', ''); dustR.setAttribute('d', ''); debris.setAttribute('d', ''); }

          // ships + volleys
          let pf = '', pr = '', fl = '', bl = '', im = '';
          shipsG.forEach(S => {
            const bob = Math.sin(t * 1.6 + S.k * 1.3) * 4, rot = Math.sin(t * 1.2 + S.k) * 3;
            let recoil = 0;
            fires.forEach(fc => { const fa = atOr(cues, fc, null); if (fa != null) recoil += punch(lt, fa + S.k * 0.18, 0.5) * 14; });
            S.g.setAttribute('transform', `translate(${f1(S.x - recoil)} ${f1(S.y + bob)}) rotate(${f1(rot - recoil * 0.4)})`);
            S.parts.forEach((pp, i) => {
              const o = { seed: sd + 500 + S.k * 20 + i, t, amp: 1.2, smooth: pp.st.sm !== 0 };
              if (pp.f) pp.f.setAttribute('d', inkLoop(pp.st.p, o));
              pp.r.setAttribute('d', inkPath(pp.st.p, Object.assign({}, o, { w: pp.st.w, closed: !!pp.st.c })));
            });
            const mx = S.x + 1.16 * S.s, my = S.y - 0.52 * S.s;
            fires.forEach((fc, j) => {
              const fa = atOr(cues, fc, null); if (fa == null) return;
              const f0 = fa + S.k * 0.18, u = lt - f0;
              if (u < 0) return;
              // flash
              if (u < 0.22) { const s = 46 * (1 - u / 0.22) + 10; fl += inkLoop([[mx, my - s * 0.5], [mx + s, my], [mx, my + s * 0.5], [mx + s * 0.35, my]], { seed: sd + 600 + j * 7 + S.k, t, smooth: false }) + ' '; }
              // smoke puffs drifting up
              for (let q = 0; q < 3; q++) {
                const p = clamp01(u / 1.6), r = (18 + q * 10) * (0.4 + p) * (1 - clamp01((u - 2.2) / 1));
                if (r > 1) { const x = mx + 20 + q * 22 + 40 * p, y = my - 10 - q * 12 - 70 * p; pf += inkCircle(x, y, r, sd + 620 + j * 11 + q + S.k * 3, t, { fill: true }) + ' '; pr += inkCircle(x, y, r, sd + 620 + j * 11 + q + S.k * 3, t, { w: 3 }) + ' '; }
              }
              // cannonball arc to the building
              const fly = 0.55, p = u / fly;
              const tx = BX - 90 + S.k * 110 + j * 30, ty = 800 - S.k * 30;
              if (p < 1) {
                const x = lerp(mx, tx, p), y = lerp(my, ty, p) - Math.sin(p * Math.PI) * 220;
                bl += inkDot(x, y, 11, 11, sd + 650 + j + S.k, t) + ' ';
              } else if (p < 1 + 0.35 / fly) {
                const s = 50 * spring(u - fly, 0, 0.25) * (1 - clamp01((u - fly - 0.2) / 0.15));
                if (s > 1) im += [0, 1, 2, 3, 4, 5, 6, 7].map(q => { const a = q / 8 * Math.PI * 2; return inkPath([[tx + Math.cos(a) * s * 0.4, ty + Math.sin(a) * s * 0.4], [tx + Math.cos(a) * s, ty + Math.sin(a) * s]], { seed: sd + 680 + q + j, t, w: 6 }); }).join(' ') + ' ';
              }
            });
          });
          puffF.setAttribute('d', pf); puffR.setAttribute('d', pr); flash.setAttribute('d', fl); balls.setAttribute('d', bl); impact.setAttribute('d', im);

          // note
          if (note) {
            const N = note.N, at = atOr(cues, N.at, Math.max(0.6, dur * 0.5)), p = spring(lt, at, 0.6), pk = punch(lt, at + 0.05, 0.5);
            const nx = (N.x ?? 0.5) * W, ny = (N.y ?? 0.2) * H;
            const tw = note.t.getComputedTextLength ? note.t.getComputedTextLength() : 300, fs = N.size || 80;
            const bp = [[nx - tw / 2 - 28, ny - fs * 0.85], [nx + tw / 2 + 28, ny - fs * 0.88], [nx + tw / 2 + 30, ny + fs * 0.4], [nx - tw / 2 - 26, ny + fs * 0.43]];
            note.box.setAttribute('d', inkLoop(bp, { seed: sd + 700, t, smooth: false }));
            note.boxR.setAttribute('d', inkPath(bp, { seed: sd + 700, t, closed: true, w: 4, smooth: false }));
            note.t.setAttribute('x', nx); note.t.setAttribute('y', ny);
            note.g.style.opacity = clamp01(p * 2.5);
            note.g.setAttribute('transform', `translate(${f1(nx)} ${f1(ny)}) rotate(${f1(-3 + (1 - p) * -6)}) scale(${(lerp(0.7, 1, p) * (1 + 0.1 * pk)).toFixed(3)}) translate(${f1(-nx)} ${f1(-ny)})`);
          }

          // cast
          const words = env.words || (typeof WORDS !== 'undefined' ? WORDS : null);
          cast.forEach(c => {
            if (!c.rig) return;
            const m = c.m, at = atOr(cues, m.at, null);
            const after = at != null && lt >= at;
            let pose = after ? (m.then || 'shock') : (m.pose || 'idle');
            const x0 = (m.x ?? 0.84) * W, y = m.y != null ? m.y * H : 1162;
            let x = x0, face = m.face === 'left' ? -1 : 1;
            const o = {};
            if (m.to != null && (m.pose === 'walk' || m.pose === 'run')) {
              const end = at ?? dur * 0.5, x1 = m.to * W, p = clamp01(lt / Math.max(0.3, end));
              x = lerp(x0, x1, p);
              face = x1 < x0 ? -1 : 1;
              if (!after) o.ph = Math.abs(x - x0) / (KASIF.gait(m.pose) * c.sc);
              if (after) x = x1;
            }
            const dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
            const since = after ? lt - at : lt;
            Object.assign(o, { x, y, face, since, dir, item: m.item, text: m.text,
              emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null),
              mouth: c.isK ? inkTalk(t, words) : 0 });
            if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
            c.rig.update(t, pose, o);
            c.hand = [x + face * 125 * c.sc, y - 290 * c.sc];
          });
          // ropes from the dome top to the pullers' hands; slack before the cue, taut + tugging after, gone once it falls
          if (P.ropes) {
            let rd = '';
            P.ropes.forEach((R, j) => {
              const c = cast[R.cast ?? 0]; if (!c || !c.hand) return;
              const at = atOr(cues, R.at, 0.3), taut = prog(lt, at, 0.4);
              if (fall > 0.35) return;
              const a = j % 2 ? [BX - 50, 690] : [460, 652], b = c.hand;
              const tug = taut * Math.sin(t * 9 + j) * 6;
              const mid = [(a[0] + b[0]) / 2 + tug, (a[1] + b[1]) / 2 + lerp(70, 6, taut)];
              rd += inkPath([a, mid, b], { seed: sd + 800 + j, t, w: 6 }) + ' ';
            });
            ropeE.setAttribute('d', rd);
          }
        },
      };
    },
  };
})();
