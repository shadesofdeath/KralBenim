// cs_trial: the Cadaver Synod (Rome, January 897) in the parchment ink style (brand/kit/BRAND.md §3, §5; every line
// boils at 8 Hz via _ink.js, everything is a pure function of (seed, lt), no Math.random). Parametric: any church
// trial / papal hall / prison cell / two-graves moment.
//   setting "hall":  a Lateran-like hall (round arches on columns, red curtain), a raised throne on a two-step dais
//                    with an optional robed corpse in a mitre (pale skull face, hollow eyes, slumped head that sways;
//                    respectful, not gory), a pope (stick figure, hatless, white mitre drawn on top), a deacon who
//                    "speaks" for the corpse (speech bubble with dots), the narrator (Kaşif / fez) and a big label.
//   setting "cell":  a stone prison wall with a small barred window; iron bars drop in front of the pope on a cue.
//   setting "graves": a cypress skyline and two tombstones that rise on cues (name + year carved in Fraunces).
// P: {setting: "hall"|"cell"|"graves", ground: 0.585,
//     throne: {x: 0.64, scale: 1, shake: cue} | false,
//     corpse: {slump: cue (head drops further), sway: 1} | false (empty throne),
//     pope: {x: 0.28, scale: 1, pose: "point", dir, face: 1, emotion: "angry", mitre: true, seq: [{at, pose, dir, face, emotion}]} | false,
//     deacon: {x: 0.86, scale: 0.78, pose: "talk", face: -1, at: cue (bubble appears), seq} | false,
//     kasif: {x: 0.14, scale: 0.9, pose: "talk", dir, face: 1, emotion, seq} | false,
//     bars: {at: cue, x0: 0.36, x1: 0.98} (cell),
//     graves: [{name: "FORMOSUS", year: "896", x: 0.22, at: cue}] (graves),
//     label: {text, x: 0.5, y: 0.2, size: 110, at: cue, color: "red"|"ink", rot: -4, box: false},
//     cam: {zoom: 1.06, focus: [0.5, 0.55]},
//     cover: {zoom: 1.2, focus: [0.5, 0.5], label: false, kasif: false} (thumbnail only: static framing; kasif:false hides
//       the shot's own narrator because the engine adds the big cover Kaşif)}
// cues: hit (punch), plus the names used by seq / at / slump / bars / graves / label
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : fb);
  const COL = c => ({ red: INK.red, gold: INK.gold, blue: INK.blue, soft: INK.inkSoft }[c] || INK.ink);
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);

  // pose sequence -> rig opts (0.35 s blend from the previous pose)
  function seqOpts(S, cues, lt, defFace) {
    const segs = [{ at: -1, pose: S.pose || 'idle', dir: S.dir, face: S.face, emotion: S.emotion }];
    (S.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
    segs.sort((a, b) => a.at - b.at);
    let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
    const s = segs[i], p = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
    const o = { pose: s.pose || 'idle', face: faceOf(s.face ?? S.face, defFace), since, dir: dirOf(s.dir ?? S.dir),
      emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : S.emotion || null), mouth: 0 };
    if (p && since < 0.35) { o.prev = { pose: p.pose || 'idle', since: since + 1, dir: dirOf(p.dir ?? S.dir), emotion: p.emotion }; o.mix = since / 0.35; }
    return o;
  }

  // a white bishop's mitre in head-frame units (head centre at 0,0, head radius ~72)
  const MITRE = [[-60, -50], [-66, -110], [-34, -150], [0, -184], [34, -150], [66, -110], [60, -50]];
  const MITRE_BAND = [[[0, -52], [0, -176]], [[-62, -60], [62, -60]]];

  SH.cs_trial = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 897;
      const setting = P.setting || 'hall';
      const gy = H * (P.ground ?? (portrait ? 0.585 : 0.8));
      const k0 = portrait ? 1 : 0.8;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const back = el(cam, 'g'), mid = el(cam, 'g'), front = el(cam, 'g'), top = el(root, 'g');

      // ---------------------------------------------------------------- background (static geometry, boiled)
      const bgDark = mk(back, INK.paperDark, { 'fill-opacity': 0.5 }), bgRed = mk(back, INK.red, { 'fill-opacity': 0.82 });
      const bgLight = mk(back, INK.paperLight), bgSoft = mk(back, INK.inkSoft), bgInk = mk(back), bgGold = mk(back, INK.gold);
      const B = { dark: [], red: [], light: [], soft: [], ink: [], gold: [], green: [] };   // {pts, w, closed, fill}
      const line = (arr, pts, w = 4, o = {}) => arr.push(Object.assign({ pts, w }, o));
      const fill = (arr, pts, o = {}) => arr.push(Object.assign({ pts, fill: true }, o));
      const T = P.throne === false ? null : Object.assign({ x: 0.64, scale: 1 }, P.throne || {});
      const ts = k0 * (T ? T.scale : 1) * 1.15;
      const tx = T ? T.x * W : 0;
      const daisY = gy - 70 * ts, seatY = daisY - 120 * ts;

      if (setting === 'hall') {
        // arcade: columns + round arches (far plane)
        const cols = [0.02, 0.34, 0.66, 0.98].map(u => u * W), archTop = gy - 760;
        cols.forEach((cx, i) => {
          fill(B.dark, [[cx - 26, gy], [cx - 22, archTop + 150], [cx + 22, archTop + 150], [cx + 26, gy]], { smooth: false });
          line(B.soft, [[cx - 26, gy], [cx - 22, archTop + 150]], 4); line(B.soft, [[cx + 26, gy], [cx + 22, archTop + 150]], 4);
          line(B.soft, [[cx - 40, archTop + 150], [cx + 40, archTop + 146]], 6);
          if (i < cols.length - 1) {
            const a = cx + 22, b = cols[i + 1] - 22, r = (b - a) / 2, c = (a + b) / 2, pts = [];
            for (let k = 0; k <= 12; k++) { const ang = Math.PI * (1 - k / 12); pts.push([c + Math.cos(ang) * r, archTop + 150 - Math.sin(ang) * r * 0.9]); }
            line(B.soft, pts, 5);
            const inner = pts.map(([x, y]) => [lerp(c, x, 0.86), lerp(archTop + 150, y, 0.86) + 10]);
            line(B.soft, inner, 2.5);
          }
        });
        // wall line + dado
        line(B.soft, [[0, gy - 120], [W, gy - 124]], 3);
        // red curtain behind the throne
        if (T) {
          const cw = 230 * ts;
          fill(B.red, [[tx - cw, archTop + 170], [tx + cw, archTop + 166], [tx + cw * 1.06, gy - 4], [tx + cw * 0.5, gy - 30], [tx, gy - 6], [tx - cw * 0.5, gy - 30], [tx - cw * 1.06, gy - 4]]);
          line(B.ink, [[tx - cw, archTop + 170], [tx + cw, archTop + 166]], 5);
          for (let k = -2; k <= 2; k++) line(B.ink, [[tx + k * cw * 0.4, archTop + 190], [tx + k * cw * 0.42 + 6, gy - 40]], 2);
          // gold rod + finials
          line(B.gold, [[tx - cw - 20, archTop + 162], [tx + cw + 20, archTop + 158]], 10);
        }
        // floor tiles (perspective lines)
        line(B.ink, [[0, gy], [W, gy - 3]], 5);
        for (let k = -6; k <= 6; k++) line(B.soft, [[W / 2 + k * 120, gy + 2], [W / 2 + k * 200, H * 0.61 + 60]], 2.5);
        line(B.soft, [[0, gy + 34], [W, gy + 32]], 2.5);
      } else if (setting === 'cell') {
        // stone wall of blocks
        const rows = 9, top0 = gy - 820, rh = 820 / rows;
        for (let r = 0; r < rows; r++) {
          const y = top0 + r * rh, off = (r % 2) * 90;
          line(B.soft, [[0, y], [W, y + ((r * 7) % 5) - 2]], 3);
          for (let x = -off; x < W; x += 180) if (x > 0) line(B.soft, [[x, y], [x + 3, y + rh]], 3);
        }
        fill(B.dark, [[0, top0], [W, top0], [W, gy], [0, gy]], { smooth: false });
        // small barred window, high up on the right
        const wx = W * 0.7, wy = top0 + 120;
        fill(B.light, [[wx - 90, wy], [wx + 90, wy], [wx + 90, wy + 150], [wx - 90, wy + 150]], { smooth: false });
        line(B.ink, [[wx - 90, wy], [wx + 90, wy], [wx + 90, wy + 150], [wx - 90, wy + 150]], 6, { closed: true, smooth: false });
        for (let k = -1; k <= 1; k++) line(B.ink, [[wx + k * 45, wy], [wx + k * 45, wy + 150]], 7);
        line(B.ink, [[0, gy], [W, gy - 3]], 5);
        // straw on the floor
        for (let k = 0; k < 16; k++) { const x = 60 + k * 64, y = gy + 18 + (k % 3) * 10; line(B.gold, [[x, y], [x + 34, y - 8 + (k % 2) * 12]], 3); }
      } else if (setting === 'graves') {
        // cypress trees + a far wall on the horizon
        const hy = gy - 260;
        line(B.soft, [[0, hy], [W, hy - 6]], 3);
        [0.08, 0.42, 0.92].forEach((u, i) => {
          const cx = u * W, h = 330 + i * 40;
          fill(B.soft, [[cx, hy - h], [cx + 34, hy - h * 0.6], [cx + 40, hy - h * 0.2], [cx + 10, hy], [cx - 10, hy], [cx - 40, hy - h * 0.2], [cx - 34, hy - h * 0.6]], { op: 0.7 });
        });
        // dome of a far church
        const dx = W * 0.66;
        line(B.soft, [[dx - 110, hy], [dx - 110, hy - 90], [dx - 80, hy - 150], [dx, hy - 180], [dx + 80, hy - 150], [dx + 110, hy - 90], [dx + 110, hy]], 3);
        line(B.soft, [[dx, hy - 180], [dx, hy - 230]], 3); line(B.soft, [[dx - 18, hy - 212], [dx + 18, hy - 212]], 3);
        line(B.ink, [[0, gy], [W, gy - 3]], 5);
        for (let k = 0; k < 18; k++) { const x = 30 + k * 60, y = gy + 4; line(B.green, [[x, y], [x + 8, y - 26]], 3); line(B.green, [[x + 14, y], [x + 10, y - 20]], 3); }
      }
      const greenE = mk(back, INK.green);
      const drawBack = t => {
        const pd = (arr, k0s) => arr.map((o, i) => o.fill ? inkLoop(o.pts, { seed: sd + k0s + i, t, amp: 1.2, smooth: o.smooth }) :
          inkPath(o.pts, { seed: sd + k0s + i, t, w: o.w, amp: 1.2, closed: o.closed, smooth: o.smooth })).join(' ');
        bgDark.setAttribute('d', pd(B.dark, 10)); bgRed.setAttribute('d', pd(B.red, 60)); bgLight.setAttribute('d', pd(B.light, 90));
        bgSoft.setAttribute('d', pd(B.soft, 120)); bgInk.setAttribute('d', pd(B.ink, 300)); bgGold.setAttribute('d', pd(B.gold, 400));
        greenE.setAttribute('d', pd(B.green, 500));
      };

      // ---------------------------------------------------------------- throne + corpse
      const thr = T && setting === 'hall' ? { f: mk(mid, INK.paperLight), red: mk(mid, INK.red), gold: mk(mid, INK.gold), ink: mk(mid), dais: mk(mid, INK.paperDark) } : null;
      const C = P.corpse === false || !thr ? null : Object.assign({ sway: 1 }, P.corpse || {});
      const cor = C ? { robe: mk(mid, INK.red), robeInk: mk(mid), gold: mk(mid, INK.gold), jaw: mk(mid, INK.paperLight), skull: mk(mid, INK.paperLight), skullInk: mk(mid),
        holes: mk(mid), mitre: mk(mid, INK.paperLight), mitreInk: mk(mid), mitreGold: mk(mid, INK.gold), bone: mk(mid, INK.paperLight), boneInk: mk(mid) } : null;

      // ---------------------------------------------------------------- people
      const rigs = [];
      const addRig = (spec, isK, layer) => {
        if (!spec || typeof KASIF === 'undefined') return null;
        const S = Object.assign({ scale: 1 }, spec);
        const g = el(layer, 'g');
        const r = { S, isK, rig: KASIF.create(el(g, 'g'), { scale: k0 * S.scale, hat: isK, accessory: null, beard: isK ? null : (S.beard || null), seed: sd + rigs.length * 13 + (isK ? 0 : 7) }),
          mitre: !isK && S.mitre !== false && spec.role === 'pope' ? { f: mk(g, INK.paperLight), r: mk(g), gold: mk(g, INK.gold) } : null, g };
        rigs.push(r); return r;
      };
      const pope = P.pope ? addRig(Object.assign({ role: 'pope', x: 0.28, pose: 'point', face: 1, emotion: 'angry' }, P.pope), false, front) : null;
      const deacon = P.deacon ? addRig(Object.assign({ x: 0.86, scale: 0.78, pose: 'talk', face: -1 }, P.deacon), false, mid) : null;
      const bubble = deacon ? { f: mk(mid, INK.paperLight), r: mk(mid), dots: mk(mid) } : null;
      const bars = setting === 'cell' && P.bars ? { ink: mk(front, INK.inkSoft), r: mk(front) } : null;
      const graves = setting === 'graves' ? (P.graves || []).map((G, i) => {
        const g = el(mid, 'g');
        const o = { G, g, f: mk(g, INK.paperDark), r: mk(g), cross: mk(g), moss: mk(g, INK.green, { 'fill-opacity': 0.7 }) };
        o.name = el(g, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': G.size || 50, 'text-anchor': 'middle', fill: INK.ink });
        o.name.textContent = G.name || '';
        o.year = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 76, 'text-anchor': 'middle', fill: G.color ? COL(G.color) : INK.ink });
        o.year.textContent = G.year || '';
        return o;
      }) : [];
      const kas = P.kasif ? addRig(Object.assign({ x: 0.14, scale: 0.9, pose: 'talk', face: 1 }, P.kasif), true, front) : null;

      // ---------------------------------------------------------------- label
      const L = P.label ? Object.assign({ x: 0.5, y: 0.2, size: 110, color: 'red', rot: -4 }, P.label) : null;
      let lab = null;
      if (L) {
        const g = el(top, 'g');
        const box = L.box ? { f: mk(g, INK.red), r: mk(g) } : null;
        const tEl = el(g, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': L.size, 'text-anchor': 'middle', fill: L.box ? INK.paperLight : COL(L.color) });
        tEl.textContent = L.text;
        const ul = L.box ? null : mk(g, COL(L.color));
        lab = { g, tEl, box, ul, w: 0 };
      }

      let lastStep = -1;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step;
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          const isCover = document.documentElement.classList.contains('cover');
          const CV = isCover && P.cover ? P.cover : null;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const CAM = P.cam || {}, foc = CAM.focus || [0.5, 0.55];
          if (CV) {
            const cf = CV.focus || foc, cz = CV.zoom || 1.2;
            cam.setAttribute('transform', `translate(${f1(cf[0] * W)} ${f1(cf[1] * H)}) scale(${cz.toFixed(4)}) translate(${f1(-cf[0] * W)} ${f1(-cf[1] * H)})`);
          } else {
            const z = lerp(1, CAM.zoom || 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
            const fx = foc[0] * W, fy = foc[1] * H;
            cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.35) * 6)} ${f1(fy + Math.cos(lt * 0.27) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          }
          if (redraw || lt < 0.05) drawBack(t);
          const S = k => sd + k;
          const ip = (pts, k, w, o) => inkPath(pts, Object.assign({ seed: S(k), t, w, amp: 1.5 }, o));
          const il = (pts, k, o) => inkLoop(pts, Object.assign({ seed: S(k), t, amp: 1.3 }, o));

          // throne
          if (thr) {
            const shake = T.shake ? punch(lt, atOr(cues, T.shake, null), 0.8) : 0;
            const sx = tx + Math.sin(lt * 40) * 6 * shake;
            const X = u => sx + u * ts, Y = v => seatY + v * ts;
            const dais = [[X(-230), gy], [X(-230), Y(155)], [X(-190), Y(155)], [X(-190), Y(120)], [X(190), Y(120)], [X(190), Y(155)], [X(230), Y(155)], [X(230), gy]];
            thr.dais.setAttribute('d', il(dais, 1, { smooth: false }));
            const backP = [[X(-120), Y(0)], [X(-124), Y(-330)], [X(-90), Y(-400)], [X(0), Y(-430)], [X(90), Y(-400)], [X(124), Y(-330)], [X(120), Y(0)]];
            const seatP = [[X(-150), Y(0)], [X(150), Y(0)], [X(150), Y(40)], [X(-150), Y(40)]];
            const armL = [[X(-150), Y(-10)], [X(-158), Y(-120)], [X(-110), Y(-130)], [X(-112), Y(-10)]];
            const armR = armL.map(([x, y]) => [2 * sx - x, y]);
            thr.f.setAttribute('d', [il(backP, 2), il(seatP, 3, { smooth: false }), il(armL, 4), il(armR, 5)].join(' '));
            const panel = [[X(-82), Y(-30)], [X(-84), Y(-310)], [X(0), Y(-370)], [X(84), Y(-310)], [X(82), Y(-30)]];
            thr.red.setAttribute('d', il(panel, 6));
            thr.gold.setAttribute('d', [ip([[X(0), Y(-430)], [X(0), Y(-500)]], 7, 12), ip([[X(-28), Y(-474)], [X(28), Y(-474)]], 8, 12),
              ip([[X(-118), Y(118)], [X(118), Y(118)]], 9, 6)].join(' '));
            thr.ink.setAttribute('d', [ip(dais, 10, 5, { smooth: false }), ip(backP, 11, 6, { closed: true }), ip(seatP, 12, 5, { closed: true, smooth: false }),
              ip(armL, 13, 5, { closed: true }), ip(armR, 14, 5, { closed: true }), ip(panel, 15, 3, { closed: true }),
              ip([[X(-140), Y(40)], [X(-140), Y(118)]], 16, 7), ip([[X(140), Y(40)], [X(140), Y(118)]], 17, 7)].join(' '));

            // corpse: robed, mitred, slumped (respectful, not gory)
            if (cor) {
              const slumpAt = atOr(cues, C.slump, null), sl = slumpAt != null ? spring(lt, slumpAt, 0.9) : 0;
              const sw = Math.sin(lt * 2.4) * 3 * C.sway;
              const tilt = (14 + sw + sl * 12) * Math.PI / 180;
              const hx = X(4) + sl * 10 * ts, hy = Y(-262) + sl * 22 * ts, hr = 60 * ts;
              const H2 = (x, y) => { const c = Math.cos(tilt), s = Math.sin(tilt); return [hx + (x * c - y * s) * ts, hy + (x * s + y * c) * ts]; };
              // robe (red cope from shoulders over the knees)
              const robe = [[X(-70), Y(-205)], [X(70), Y(-205)], [X(110), Y(-120)], [X(130), Y(10)], [X(150), Y(60)], [X(120), Y(108)], [X(-120), Y(108)], [X(-150), Y(60)], [X(-130), Y(10)], [X(-110), Y(-120)]];
              cor.robe.setAttribute('d', il(robe, 20));
              cor.robeInk.setAttribute('d', [ip(robe, 21, 5, { closed: true }), ip([[X(-40), Y(10)], [X(-50), Y(100)]], 22, 2.5), ip([[X(40), Y(10)], [X(50), Y(100)]], 23, 2.5)].join(' '));
              // gold pallium (Y band) + trim
              cor.gold.setAttribute('d', [ip([[X(-60), Y(-196)], [X(0), Y(-120)], [X(60), Y(-196)]], 24, 12), ip([[X(0), Y(-120)], [X(0), Y(60)]], 25, 12),
                ip([[X(-118), Y(104)], [X(118), Y(104)]], 26, 8)].join(' '));
              // bony hands on the armrests + feet
              const handL = [[X(-128), Y(-128)], [X(-118), Y(-150)], [X(-100), Y(-140)]], handR = handL.map(([x, y]) => [2 * sx - x, y]);
              cor.bone.setAttribute('d', [il(inkEllipsePts(X(-70), Y(114), 26 * ts, 12 * ts, S(27), 8), 27), il(inkEllipsePts(X(70), Y(114), 26 * ts, 12 * ts, S(28), 8), 28)].join(' '));
              cor.boneInk.setAttribute('d', [ip(handL, 29, 5), ip(handR, 30, 5), ip([[X(-120), Y(-146)], [X(-134), Y(-170)]], 31, 4), ip([[X(120), Y(-146)], [X(134), Y(-170)]], 32, 4),
                ip(inkEllipsePts(X(-70), Y(114), 26 * ts, 12 * ts, S(27), 8), 33, 4, { closed: true }), ip(inkEllipsePts(X(70), Y(114), 26 * ts, 12 * ts, S(28), 8), 34, 4, { closed: true }),
                ip([[X(-6), Y(-205)], [hx - 4 * ts, hy + hr * 0.9]], 35, 7)].join(' '));
              // skull
              const skull = inkEllipsePts(0, 0, 58, 64, S(36), 12).map(([x, y]) => H2(x, y));
              const jaw = [[-34, 40], [-30, 76], [0, 86], [30, 76], [34, 40]].map(([x, y]) => H2(x, y));
              cor.jaw.setAttribute('d', il(jaw, 37)); cor.skull.setAttribute('d', il(skull, 36));
              const eyeL = H2(-22, -2), eyeR = H2(22, -2), nose = [H2(-6, 30), H2(0, 18), H2(6, 30)];
              cor.holes.setAttribute('d', [inkDot(eyeL[0], eyeL[1], 15 * ts, 17 * ts, S(38), t), inkDot(eyeR[0], eyeR[1], 15 * ts, 17 * ts, S(39), t), il(nose, 40, { smooth: false })].join(' '));
              const teeth = [-18, -6, 6, 18].map((x, i) => ip([H2(x, 58), H2(x, 76)], 41 + i, 2.5));
              cor.skullInk.setAttribute('d', [ip(skull, 46, 5, { closed: true }), ip(jaw, 47, 4), ip([H2(-30, 60), H2(30, 60)], 48, 3)].concat(teeth).join(' '));
              // mitre on the skull
              const mp = MITRE.map(([x, y]) => H2(x * 0.92, y * 0.92 + 6));
              cor.mitre.setAttribute('d', il(mp, 50, { smooth: false }));
              cor.mitreInk.setAttribute('d', ip(mp, 51, 5, { closed: true, smooth: false }));
              cor.mitreGold.setAttribute('d', MITRE_BAND.map((b, i) => ip(b.map(([x, y]) => H2(x * 0.92, y * 0.92 + 6)), 52 + i, 10)).join(' '));
            }
          }

          // bars (cell): drop from above on a cue
          if (bars) {
            const BR = Object.assign({ x0: 0.36, x1: 0.98 }, P.bars), a = atOr(cues, BR.at, dur * 0.3);
            const p = lt >= a ? spring(lt, a, 0.5) : 0, dy = lerp(-H * 0.6, 0, p), y0 = gy - 760 + dy, y1 = gy + 6 + dy;
            const xs = []; for (let x = BR.x0 * W; x <= BR.x1 * W + 1; x += 78) xs.push(x);
            bars.ink.setAttribute('d', xs.map((x, i) => ip([[x, y0], [x + 2, y1]], 60 + i, 15)).join(' '));
            bars.r.setAttribute('d', [ip([[BR.x0 * W - 30, y0 + 40], [BR.x1 * W + 30, y0 + 36]], 80, 14), ip([[BR.x0 * W - 30, y0 + 380], [BR.x1 * W + 30, y0 + 384]], 81, 12)].join(' '));
          }

          // graves rise on cues
          graves.forEach((o, i) => {
            const G = o.G, a = atOr(cues, G.at, dur * (0.15 + i * 0.3)), p = lt >= a ? spring(lt, a, 0.7) : 0;
            const cx = (G.x ?? (0.22 + i * 0.56)) * W, w = 165, h = 400;
            o.g.setAttribute('transform', `translate(${f1(cx)} ${f1(gy)}) scale(${(0.2 + 0.8 * p).toFixed(3)} ${p.toFixed(3)}) translate(${f1(-cx)} ${f1(-gy)})`);
            o.g.style.opacity = p > 0.01 ? 1 : 0;
            const st = [[cx - w, gy], [cx - w, gy - h + 120], [cx - w * 0.7, gy - h + 30], [cx, gy - h], [cx + w * 0.7, gy - h + 30], [cx + w, gy - h + 120], [cx + w, gy]];
            o.f.setAttribute('d', il(st, 90 + i * 9));
            o.r.setAttribute('d', [ip(st, 91 + i * 9, 6, { closed: true }), ip([[cx - w - 30, gy], [cx + w + 30, gy - 2]], 92 + i * 9, 6)].join(' '));
            o.cross.setAttribute('d', [ip([[cx, gy - h + 50], [cx, gy - h + 130]], 93 + i * 9, 7), ip([[cx - 28, gy - h + 76], [cx + 28, gy - h + 76]], 94 + i * 9, 7)].join(' '));
            o.moss.setAttribute('d', il(inkEllipsePts(cx - w * 0.6, gy - 14, 50, 16, S(95 + i * 9), 9), 95 + i * 9));
            const b = boil(S(96 + i * 9), t, 1);
            o.name.setAttribute('x', f1(cx + b[0])); o.name.setAttribute('y', f1(gy - h + 220 + b[1]));
            o.year.setAttribute('x', f1(cx + b[1])); o.year.setAttribute('y', f1(gy - h + 320 + b[0]));
          });

          // people
          rigs.forEach((r, i) => {
            const Sx = r.S, o = seqOpts(Sx, cues, lt, Sx.face ?? 1);
            let x = Sx.x * W, y = Sx.y != null ? Sx.y * H : gy;
            if (r === kas && isCover && !(CV && CV.kasif)) o.alpha = 0;
            if (r === kas && CV && CV.kasif) {
              const CK = CV.kasif; o.pose = CK.pose || o.pose; o.since = 1.5; o.prev = null; o.mix = null;
              o.emotion = CK.emotion || o.emotion; o.face = CK.face ?? o.face; x = (CK.x ?? Sx.x) * W; y = (CK.y ?? y / H) * H; o.scale = (CK.scale || Sx.scale) / Sx.scale;
            }
            if (r === kas && isCover && CV && CV.kasif === false) o.alpha = 0;
            const res = r.rig.update(t, o.pose, Object.assign({ x, y }, o));
            if (r.mitre && res) {
              const s = k0 * Sx.scale * (o.scale || 1), f = o.face || 1;
              const hc = res.head, hip = res.hip;
              const ang = Math.atan2(hc[0] - hip[0], -(hc[1] - hip[1]));
              const c = Math.cos(ang), sn = Math.sin(ang);
              const toW = ([px, py]) => { const rx = px * c - py * sn, ry = px * sn + py * c; return [x + f * s * (hc[0] + rx), y + s * (hc[1] + ry)]; };
              const mp = MITRE.map(toW);
              r.mitre.f.setAttribute('d', il(mp, 200 + i * 5, { smooth: false }));
              r.mitre.r.setAttribute('d', ip(mp, 201 + i * 5, 5, { closed: true, smooth: false }));
              r.mitre.gold.setAttribute('d', MITRE_BAND.map((b, j) => ip(b.map(toW), 202 + i * 5 + j, 9)).join(' '));
            }
          });

          // deacon's speech bubble
          if (bubble) {
            const D = deacon.S, a = atOr(cues, D.at, dur * 0.3), p = lt >= a ? spring(lt, a, 0.5) : 0;
            const bx = D.x * W - 150 * k0, by = gy - 640 * k0 * D.scale - 70;
            const bp = inkEllipsePts(bx, by, 130 * p + 1, 72 * p + 1, S(300), 12);
            const tail = [[bx + 60 * p, by + 50 * p], [bx + 120 * p, by + 120 * p], [bx + 20 * p, by + 66 * p]];
            bubble.f.setAttribute('d', il(bp, 300) + ' ' + il(tail, 301, { smooth: false }));
            bubble.r.setAttribute('d', ip(bp, 302, 5, { closed: true }));
            const nd = p > 0.6 ? 1 + Math.floor((lt - a) * 3) % 3 : 0;
            let dd = '';
            for (let k = 0; k < nd; k++) dd += inkDot(bx - 50 + k * 50, by + 6, 13, 13, S(310 + k), t) + ' ';
            bubble.dots.setAttribute('d', dd);
          }

          // label
          if (lab) {
            const a = atOr(cues, L.at, dur * 0.4), p = lt >= a ? spring(lt, a, 0.55) : 0, b = boil(S(400), t, 1.6);
            const hide = CV && CV.label === false;
            lab.g.style.opacity = hide ? 0 : clamp01(p * 2);
            const lx = L.x * W, ly = L.y * H;
            lab.g.setAttribute('transform', `translate(${f1(lx + b[0])} ${f1(ly + b[1] + Math.sin(t * 2) * 5)}) rotate(${f1(L.rot + Math.sin(t * 1.3) * 1.5)}) scale(${lerp(0.4, 1, p).toFixed(3)})`);
            lab.tEl.setAttribute('x', 0); lab.tEl.setAttribute('y', L.size * 0.35);
            if (!lab.w) try { lab.w = lab.tEl.getComputedTextLength(); } catch (e) { lab.w = L.text.length * L.size * 0.6; }
            const w = lab.w / 2 + 24;
            if (lab.box) {
              const bp = [[-w, -L.size * 0.55], [w, -L.size * 0.6], [w + 4, L.size * 0.6], [-w + 2, L.size * 0.58]];
              lab.box.f.setAttribute('d', il(bp, 410, { smooth: false }));
              lab.box.r.setAttribute('d', ip(bp, 411, 5, { closed: true, smooth: false }));
            } else if (lab.ul) lab.ul.setAttribute('d', ip([[-w + 10, L.size * 0.55], [w - 10, L.size * 0.5]], 412, 7));
          }
        },
      };
    },
  };
})();
