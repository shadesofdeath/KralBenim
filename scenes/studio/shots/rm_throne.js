// rm_throne: a giant palace throne with a tiny boy emperor on it (parchment ink style, brand/kit/BRAND.md §3, §5;
// every line boils at 8 Hz via _ink.js, everything is a pure function of (seed, lt), no Math.random). Written for
// 03-roma-son-imparator (Romulus Augustulus, 475-476), but parametric: any "too small for the throne" moment.
//
// SHOTS.rm_throne — far plane: two palace columns + a draped curtain swag; mid: a stepped dais and an oversized
//   throne (tall rounded back with gold finials and a medallion, curled armrests, red cushion, carved legs);
//   on it an optional small seated figure (KASIF rig, hatless) with a hand-drawn laurel wreath that can slide
//   down over one eye and fall off, rolling to the floor; an optional "puppeteer" (period figure beside the throne
//   holding a control bar with strings to the boy's head and hands; the strings can snap); the usual cast + label.
//   P: {
//     throne: {x: 0.56, scale: 1, seat: 0.43 (seat line, 0..1 H), shake: "cue"} ,
//     floor: 0.58,                       // ground line of the cast (0..1 H)
//     boy: {scale: 0.55, emotion: "worried", then_emotion, at: cue, accessory: null, beard} | false (empty throne),
//     wreath: {on: "head"|"seat"|"floor", slip: cue, fall: cue, x: 0.3 (floor rest x, 0..1 W)} | false,
//     puppeteer: {x: 0.2, accessory: "helmet", beard: "grey", scale: 1, at: cue (strings drawn in), cut: cue
//                 (strings snap and drop), out: cue (figure fades away), emotion} | false,
//     columns: true, curtain: true,
//     cast: [{who, x, y, scale, pose, to, face, at, then, dir, emotion, text, item, accessory, beard, seq: [{at, pose, emotion}]}],
//     label: {text, x, y, size, at, color: "red"|"ink", arrow: [x, y]},
//     cam: {zoom: 1.08, focus: [0.5, 0.45]}
//   }
//   cues: shake, slip, fall, puppeteer at/cut/out, cast/label cues
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = c => ({ red: INK.red, gold: INK.gold, blue: INK.blue, soft: INK.inkSoft }[c] || INK.ink);

  function makeCast(parent, list, seed, baseScale) {
    if (typeof KASIF === 'undefined') return [];
    return (list || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const rig = KASIF.create(el(parent, 'g'), { scale: baseScale * (m.scale || 1), hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + i * 7 + (isK ? 0 : 11) });
      return { m, rig, isK, s: baseScale * (m.scale || 1) };
    });
  }
  function updateCast(cast, lt, dur, cues, t, W, H, GY) {
    cast.forEach(c => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const pose = after ? (m.then || m.pose || 'idle') : (m.pose || 'idle');
      const x0 = (m.x ?? 0.5) * W;
      let x = x0;
      if (m.to != null) {
        if (m.pose === 'walk' || m.pose === 'run') {
          const end = at != null ? at : dur;
          x = lerp(x0, m.to * W, clamp01(lt / Math.max(0.3, end)));
        } else x = m.to * W;
      }
      let since = after ? lt - at : lt, pose2 = pose, sAt = at, sPrev = m.pose || 'idle', sEmo = null;
      for (const q of m.seq || []) {      // later pose changes: [{at, pose, emotion}] (stand-still poses only)
        const qa = atOr(cues, q.at, null);
        if (qa != null && lt >= qa) { sPrev = pose2; pose2 = q.pose; since = lt - qa; sAt = qa; sEmo = q.emotion || null; }
      }
      const seqHit = pose2 !== pose;
      const dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const face = m.face === 'left' ? -1 : m.face === 'right' ? 1 : (typeof m.face === 'number' ? m.face : 1);
      const emo = after ? (m.then_emotion || m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.pre_emotion || m.emotion || null);
      const y = m.y != null ? m.y * H : GY;
      const o = { x, y, face, since, dir, emotion: emo, text: m.text, item: m.item };
      if (pose === 'walk' || pose === 'run') o.ph = (x - x0) / (KASIF.gait(pose) * c.s) + (m.to == null ? t * 0.9 : 0);
      if (seqHit) { if (sEmo) o.emotion = sEmo; if (since < 0.32) { o.prev = { pose: sPrev, since: sAt, dir }; o.mix = since / 0.32; } }
      else if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
      c.rig.update(t, pose2, o);
    });
  }

  SH.rm_throne = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 17;
      const U = portrait ? W / 1080 : H / 1080 * 1.1;          // throne unit scale
      const T = Object.assign({ x: portrait ? 0.56 : 0.52, scale: 1, seat: portrait ? 0.43 : 0.6 }, P.throne || {});
      const TS = T.scale * U;
      const GY = (P.floor ?? (portrait ? 0.58 : 0.86)) * H;
      const root = el(svg, 'g'), world = el(root, 'g');
      const mk = (parent, fill = INK.ink) => inkEl(parent, fill);
      const io = (k, t, extra) => Object.assign({ seed: sd + k, t, amp: 1.6 }, extra);

      // ---- layers back to front
      const colF = mk(world, INK.paperDark), colL = mk(world, INK.inkSoft), colH = mk(world, INK.inkSoft);
      const curF = mk(world, INK.red), curL = mk(world), curH = mk(world, INK.inkSoft);
      const daisF = mk(world, INK.paperDark), daisL = mk(world), floorL = mk(world), floorH = mk(world, INK.inkSoft);
      const pupG = el(world, 'g');
      const backF = mk(world, INK.paperLight), backL = mk(world), backIn = mk(world, INK.inkSoft), finF = mk(world, INK.gold), finL = mk(world);
      const medF = mk(world, INK.gold), medL = mk(world), medIn = mk(world, INK.inkSoft);
      const boyG = el(world, 'g');
      const wreathBack = mk(world, INK.green), wreathBackL = mk(world);
      const armF = mk(world, INK.paperLight), armL = mk(world), armG = mk(world, INK.gold);
      const seatF = mk(world, INK.paperLight), seatL = mk(world), cushF = mk(world, INK.red), cushL = mk(world);
      const frontF = mk(world, INK.paperLight), frontL = mk(world), frontIn = mk(world, INK.inkSoft), legF = mk(world, INK.gold), legL = mk(world);
      const strings = mk(world, INK.inkSoft), barF = mk(world, INK.hatBand), barL = mk(world);
      const wreathF = mk(world, INK.green), wreathL = mk(world, INK.inkSoft), wreathR = mk(world, INK.red);
      const castG = el(world, 'g');
      const labelG = el(root, 'g');

      // ---- throne geometry (in px, around cx; seat line SY)
      const cx = T.x * W, SY = T.seat * H;
      const bw = 210 * TS, bh = 470 * TS;            // back half-width, height above the seat
      const backPts = [[cx - bw, SY], [cx - bw, SY - bh * 0.72], [cx - bw * 0.82, SY - bh * 0.9], [cx - bw * 0.45, SY - bh * 0.99], [cx, SY - bh * 1.03],
        [cx + bw * 0.45, SY - bh * 0.99], [cx + bw * 0.82, SY - bh * 0.9], [cx + bw, SY - bh * 0.72], [cx + bw, SY]];
      const inPts = [[cx - bw * 0.72, SY - 30 * TS], [cx - bw * 0.72, SY - bh * 0.66], [cx - bw * 0.4, SY - bh * 0.83], [cx, SY - bh * 0.88], [cx + bw * 0.4, SY - bh * 0.83], [cx + bw * 0.72, SY - bh * 0.66], [cx + bw * 0.72, SY - 30 * TS]];
      const sw = 285 * TS, sh = 46 * TS;              // seat half-width, slab height
      const FY = Math.min(GY - 46 * TS, SY + 260 * TS); // throne foot line (top of the dais)
      // static scatter
      const r = rng(seed * 37 + 5);
      const tiles = [];
      for (let y = GY + 40; y < H - 20; y += 44) for (let x = r() * 60 - 30; x < W + 40; x += 120 + r() * 40) {
        if (portrait && y > 1150 && y < 1340) continue;
        tiles.push([[x, y], [x + 60, y - 4]]);
      }

      const boyCfg = P.boy === false ? null : Object.assign({ scale: 0.55, emotion: 'worried' }, P.boy || {});
      const boy = boyCfg && typeof KASIF !== 'undefined' ? KASIF.create(boyG, { scale: boyCfg.scale * U * (portrait ? 1.0 : 0.9), hat: false, accessory: boyCfg.accessory || null, beard: boyCfg.beard || null, seed: seed + 51 }) : null;
      const PUP = P.puppeteer ? Object.assign({ x: portrait ? 0.17 : 0.26, accessory: 'helmet', beard: 'grey', scale: 1 }, P.puppeteer) : null;
      const pup = PUP && typeof KASIF !== 'undefined' ? KASIF.create(pupG, { scale: PUP.scale * 0.86 * U, hat: false, accessory: PUP.accessory, beard: PUP.beard, seed: seed + 61 }) : null;
      const cast = makeCast(castG, P.cast, seed, portrait ? 0.82 : 0.62);
      const WR = P.wreath === false ? null : Object.assign({ on: boyCfg ? 'head' : 'floor', x: 0.3 }, P.wreath || {});

      let label = null;
      if (P.label && P.label.text) {
        const L = P.label, size = L.size || (portrait ? 88 : 66);
        const tx = el(labelG, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: COL(L.color),
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
        tx.textContent = L.text;
        label = { L, tx, u: mk(labelG, COL(L.color)), ar: L.arrow ? mk(labelG, COL(L.color)) : null };
      }

      // wreath: two leafy branches on an ellipse (cx, cy, rx, ry, rot deg); returns [fill, ring, berry]
      function wreathD(x, y, rx, ry, rot, t, k) {
        const leaves = [], ring = [];
        const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180);
        const P2 = (u, v) => [x + u * c - v * s, y + u * s + v * c];
        const n = 7;
        for (const side of [-1, 1]) {
          const arc = [];
          for (let i = 0; i <= n; i++) {
            const a = Math.PI * (0.5 + side * (0.08 + i / n * 0.86));
            arc.push(P2(Math.cos(a) * rx, Math.sin(a) * ry));
          }
          ring.push(inkPath(arc, io(k + side, t, { w: 4 })));
          for (let i = 1; i <= n; i++) {
            const a = Math.PI * (0.5 + side * (0.08 + i / n * 0.86)), px = Math.cos(a) * rx, py = Math.sin(a) * ry;
            const tx = -Math.sin(a) * side, ty = Math.cos(a) * side, L = rx * 0.46;
            const out = [px * 1.0 + tx * L * 0.2, py - L * 0.55];
            const pts = [[px, py], [px + tx * L * 0.5 + (out[0] - px) * 0.3, py - L * 0.45], out, [px + tx * L * 0.7, py - L * 0.05]].map(q => P2(q[0], q[1]));
            leaves.push(inkLoop(pts, io(k + 20 + i * 3 + (side > 0 ? 50 : 0), t, { amp: 0.8 })));
            ring.push(inkPath(pts, io(k + 20 + i * 3 + (side > 0 ? 50 : 0), t, { w: 2.2, closed: true, amp: 0.6 })));
          }
        }
        const berry = inkDot(...P2(0, ry), rx * 0.09, rx * 0.09, sd + k + 99, t);
        return [leaves.join(' '), ring.join(' '), berry];
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
          // camera: slow push-in + gentle drift; shake punch on the throne
          const Cm = P.cam || {}, u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, Cm.zoom ?? 1.07, u);
          const fc = Cm.focus || [T.x, T.seat - 0.02], fx = fc[0] * W, fy = fc[1] * H;
          const shAt = atOr(cues, T.shake, null), shk = punch(lt, shAt, 0.7);
          const jx = shk * Math.sin(lt * 70) * 12, jy = shk * Math.cos(lt * 55) * 6;
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 8 + jx)} ${f1(Math.cos(lt * 0.27) * 4 + jy)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);

          // far: columns + curtain
          if (P.columns !== false) {
            let cf = '', cl = '', ch = '';
            const cols = portrait ? [0.07, 0.93] : [0.1, 0.9];
            cols.forEach((q, i) => {
              const x = q * W, w = (portrait ? 62 : 56) * U, top = H * (portrait ? 0.17 : 0.06), bot = GY - 30 * U;
              const pts = [[x - w, bot], [x - w, top + 40 * U], [x - w * 1.35, top + 20 * U], [x - w * 1.35, top], [x + w * 1.35, top], [x + w * 1.35, top + 20 * U], [x + w, top + 40 * U], [x + w, bot]];
              cf += inkLoop(pts, io(10 + i, t, { smooth: false })) + ' ';
              cl += inkPath(pts, io(10 + i, t, { w: 4, closed: true, smooth: false })) + ' ';
              for (let k = -1; k <= 1; k++) ch += inkPath([[x + k * w * 0.5, top + 60 * U], [x + k * w * 0.5, bot - 20 * U]], io(14 + i * 3 + k, t, { w: 3 })) + ' ';
              ch += inkPath([[x - w * 1.3, bot + 4], [x + w * 1.3, bot + 4]], io(20 + i, t, { w: 5 })) + ' ';
            });
            colF.setAttribute('d', cf); colL.setAttribute('d', cl); colH.setAttribute('d', ch);
          }
          if (P.curtain !== false) {
            const y0 = H * (portrait ? 0.19 : 0.04), x0 = W * 0.02, x1 = W * 0.98, n = 3, sag = (portrait ? 46 : 60) * U;
            const top = [], bot = [];
            for (let i = 0; i <= n * 6; i++) {
              const v = i / (n * 6), x = lerp(x0, x1, v), ph = (v * n) % 1;
              top.push([x, y0]);
              bot.push([x, y0 + 26 * U + Math.sin(ph * Math.PI) * sag + Math.sin(lt * 1.3 + v * 6) * 3]);
            }
            curF.setAttribute('d', inkLoop([...top, ...bot.slice().reverse()], io(30, t, { amp: 0.8 })));
            curL.setAttribute('d', inkPath(bot, io(31, t, { w: 5 })) + ' ' + inkPath(top, io(32, t, { w: 5 })));
            let hh = '';
            for (let i = 1; i < n; i++) { const x = lerp(x0, x1, i / n); hh += inkPath([[x, y0], [x, y0 + 40 * U]], io(33 + i, t, { w: 4 })) + ' '; }
            curH.setAttribute('d', hh);
          }

          // dais + floor
          const dw1 = sw * 1.5, dw2 = sw * 1.25;
          const d1 = [[cx - dw1, GY], [cx - dw1, FY + 26 * TS], [cx + dw1, FY + 26 * TS], [cx + dw1, GY]];
          const d2 = [[cx - dw2, FY + 26 * TS], [cx - dw2, FY], [cx + dw2, FY], [cx + dw2, FY + 26 * TS]];
          daisF.setAttribute('d', inkLoop(d1, io(40, t, { smooth: false, amp: 1 })) + ' ' + inkLoop(d2, io(41, t, { smooth: false, amp: 1 })));
          daisL.setAttribute('d', inkPath(d1, io(40, t, { w: 5, smooth: false, amp: 1 })) + ' ' + inkPath(d2, io(41, t, { w: 5, smooth: false, amp: 1 })));
          floorL.setAttribute('d', inkPath([[-40, GY + 2], [W + 40, GY - 2]], io(42, t, { w: 6 })));
          floorH.setAttribute('d', tiles.map((q, i) => inkPath(q, io(300 + i, t, { w: 3, amp: 1 }))).join(' '));

          // throne back
          backF.setAttribute('d', inkLoop(backPts, io(50, t, { amp: 1.2 })));
          backL.setAttribute('d', inkPath(backPts, io(50, t, { w: 7, amp: 1.2 })));
          backIn.setAttribute('d', inkPath(inPts, io(51, t, { w: 4, amp: 1.2 })));
          let ff = '', fl = '';
          for (const sx of [-1, 1]) {
            const x = cx + sx * bw, y = SY - bh * 0.72, rr = 26 * TS;
            const pts = inkEllipsePts(x, y - rr * 1.1, rr, rr * 1.2, sd + 52 + sx, 10);
            ff += inkLoop(pts, io(52 + sx, t, { amp: 0.8 })) + ' ';
            fl += inkPath(pts, io(52 + sx, t, { w: 4, closed: true, amp: 0.8 })) + ' ';
          }
          const tp = inkEllipsePts(cx, SY - bh * 1.03 - 30 * TS, 24 * TS, 30 * TS, sd + 55, 10);
          ff += inkLoop(tp, io(55, t, { amp: 0.8 })); fl += inkPath(tp, io(55, t, { w: 4, closed: true, amp: 0.8 }));
          finF.setAttribute('d', ff); finL.setAttribute('d', fl);
          // medallion (sits above the boy's head)
          const my = SY - bh * 0.7, mr = 48 * TS;
          medF.setAttribute('d', inkCircle(cx, my, mr, sd + 56, t, { fill: true }));
          medL.setAttribute('d', inkCircle(cx, my, mr, sd + 56, t, { w: 5 }));
          let mi = '';
          for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.2; mi += inkPath([[cx + Math.cos(a) * mr * 0.3, my + Math.sin(a) * mr * 0.3], [cx + Math.cos(a) * mr * 0.72, my + Math.sin(a) * mr * 0.72]], io(57 + k, t, { w: 3, amp: 0.8 })) + ' '; }
          medIn.setAttribute('d', mi);

          // boy (seated: rig origin below the seat so the hip sits on the cushion)
          let head = null, hands = null, bs = 0, bx = cx, by = SY;
          if (boy) {
            bs = boyCfg.scale * U * (portrait ? 1.0 : 0.9);
            bx = cx + 8 * bs; by = SY - 30 * TS + 104 * bs;
            const bat = atOr(cues, boyCfg.at, null), after = bat != null && lt >= bat;
            const emo = after ? (boyCfg.then_emotion || boyCfg.emotion) : boyCfg.emotion;
            const res = boy.update(t, 'sit', { x: bx, y: by, face: 1, since: lt, emotion: emo });
            if (res) {
              head = [bx + res.head[0] * bs, by + res.head[1] * bs];
              hands = res.hands.map(h => [bx + h[0] * bs, by + h[1] * bs]);
            }
          }

          // armrests
          let af = '', al = '', ag = '';
          for (const sx of [-1, 1]) {
            const x0 = cx + sx * bw * 0.98, x1 = cx + sx * sw * 1.02, y = SY - 120 * TS;
            const pts = [[x0, SY], [x0, y + 10 * TS], [lerp(x0, x1, 0.5), y], [x1 - sx * 10 * TS, y + 4 * TS], [x1 + sx * 8 * TS, y + 30 * TS], [x1, y + 56 * TS], [x1 - sx * 20 * TS, y + 44 * TS], [x1 - sx * 26 * TS, SY]];
            af += inkLoop(pts, io(60 + sx, t, { amp: 1 })) + ' ';
            al += inkPath(pts, io(60 + sx, t, { w: 6, closed: true, amp: 1 })) + ' ';
            ag += inkDot(x1, y + 28 * TS, 13 * TS, 13 * TS, sd + 63 + sx, t) + ' ';
          }
          armF.setAttribute('d', af); armL.setAttribute('d', al); armG.setAttribute('d', ag);
          // seat slab + cushion
          const sp = [[cx - sw, SY], [cx + sw, SY], [cx + sw * 1.02, SY + sh], [cx - sw * 1.02, SY + sh]];
          seatF.setAttribute('d', inkLoop(sp, io(70, t, { smooth: false, amp: 1 })));
          seatL.setAttribute('d', inkPath(sp, io(70, t, { w: 6, closed: true, smooth: false, amp: 1 })));
          const cp = [[cx - sw * 0.86, SY + 4], [cx - sw * 0.9, SY - 22 * TS], [cx - sw * 0.5, SY - 30 * TS], [cx + sw * 0.5, SY - 30 * TS], [cx + sw * 0.9, SY - 22 * TS], [cx + sw * 0.86, SY + 4]];
          cushF.setAttribute('d', inkLoop(cp, io(71, t, { amp: 1 })));
          cushL.setAttribute('d', inkPath(cp, io(71, t, { w: 4, closed: true, amp: 1 })));
          // front panel + legs
          const fp = [[cx - sw * 0.9, SY + sh], [cx + sw * 0.9, SY + sh], [cx + sw * 0.86, FY - 40 * TS], [cx - sw * 0.86, FY - 40 * TS]];
          frontF.setAttribute('d', inkLoop(fp, io(72, t, { smooth: false, amp: 1 })));
          frontL.setAttribute('d', inkPath(fp, io(72, t, { w: 6, closed: true, smooth: false, amp: 1 })));
          const fi = [[cx - sw * 0.62, SY + sh + 26 * TS], [cx + sw * 0.62, SY + sh + 26 * TS], [cx + sw * 0.6, FY - 66 * TS], [cx - sw * 0.6, FY - 66 * TS]];
          let fin = inkPath(fi, io(73, t, { w: 3.5, closed: true, smooth: false, amp: 1 }));
          fin += ' ' + inkPath([[cx - sw * 0.3, (SY + FY) / 2], [cx, (SY + FY) / 2 - 22 * TS], [cx + sw * 0.3, (SY + FY) / 2]], io(74, t, { w: 3.5 }));
          frontIn.setAttribute('d', fin);
          let lf = '', ll = '';
          for (const sx of [-1, 1]) {
            const x = cx + sx * sw * 0.9, pts = [[x - 24 * TS, SY + sh], [x + 24 * TS, SY + sh], [x + 16 * TS, FY - 28 * TS], [x + 30 * TS, FY], [x - 30 * TS, FY], [x - 16 * TS, FY - 28 * TS]];
            lf += inkLoop(pts, io(75 + sx, t, { amp: 1 })) + ' ';
            ll += inkPath(pts, io(75 + sx, t, { w: 5, closed: true, amp: 1 })) + ' ';
          }
          legF.setAttribute('d', lf); legL.setAttribute('d', ll);

          // puppeteer + strings
          let sd2 = '', bd = '', bl = '', rodD = '';
          if (pup) {
            const pat = atOr(cues, PUP.at, 0.1), cutAt = atOr(cues, PUP.cut, null), outAt = atOr(cues, PUP.out, cutAt);
            const fade = outAt != null ? 1 - prog(lt, outAt + 0.15, 0.6) : 1;
            const px = PUP.x * W, py = GY;
            const res = pup.update(t, 'point', { x: px, y: py, face: 1, since: lt, dir: 48, emotion: PUP.emotion || 'angry', alpha: fade });
            if (res && head && fade > 0.02) {
              const ps = PUP.scale * 0.86 * U;
              const hnd = [px + res.hands[1][0] * ps, py + res.hands[1][1] * ps];
              const bw2 = 150 * U, bcx = head[0] + 10 * U, bcy = head[1] - 190 * U;
              const bar = [[bcx - bw2 / 2, bcy - 4], [bcx + bw2 / 2, bcy + 4]];
              rodD = inkPath([hnd, [lerp(hnd[0], bar[0][0], 0.5), lerp(hnd[1], bar[0][1], 0.5) - 14 * U], bar[0]], io(79, t, { w: 5 }));
              const sw2 = spring(lt, pat, 0.6);
              bd = inkLoop([[bar[0][0], bar[0][1] - 9], [bar[1][0], bar[1][1] - 9], [bar[1][0], bar[1][1] + 9], [bar[0][0], bar[0][1] + 9]], io(80, t, { smooth: false, amp: 0.8 }));
              bl = inkPath([[bar[0][0], bar[0][1] - 9], [bar[1][0], bar[1][1] - 9], [bar[1][0], bar[1][1] + 9], [bar[0][0], bar[0][1] + 9]], io(80, t, { w: 4, closed: true, smooth: false, amp: 0.8 }));
              const anchors = [[0.1, hands[0]], [0.5, [head[0], head[1] - 70 * bs]], [0.9, hands[1]]];
              const cutP = cutAt != null ? prog(lt, cutAt, 0.8) : 0;
              anchors.forEach(([k, tgt], i) => {
                const a = [lerp(bar[0][0], bar[1][0], k), lerp(bar[0][1], bar[1][1], k)];
                const sway = Math.sin(lt * 2.2 + i) * 6;
                const b = [lerp(a[0], tgt[0] + sway, sw2), lerp(a[1], tgt[1], sw2)];
                if (cutP <= 0) {
                  sd2 += inkPath([a, [(a[0] + b[0]) / 2 + sway, (a[1] + b[1]) / 2], b], io(82 + i, t, { w: 3, amp: 0.8 })) + ' ';
                } else {   // snapped: upper half curls up, lower half drops onto the boy
                  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
                  const up = [lerp(m[0], a[0] + 30, cutP * 0.7), lerp(m[1], a[1] + 40, cutP * 0.7)];
                  const dn = [lerp(m[0], b[0] + 26, cutP), lerp(m[1], b[1] + 10, cutP)];
                  sd2 += inkPath([a, up], io(82 + i, t, { w: 3, amp: 0.8 })) + ' ' + inkPath([dn, b], io(85 + i, t, { w: 3, amp: 0.8 })) + ' ';
                }
              });
              strings.setAttribute('fill-opacity', fade.toFixed(2));
              barF.setAttribute('fill-opacity', fade.toFixed(2)); barL.setAttribute('fill-opacity', fade.toFixed(2));
            }
          }
          strings.setAttribute('d', sd2); barF.setAttribute('d', bd); barL.setAttribute('d', bl + ' ' + rodD);

          // wreath
          if (WR) {
            const rx0 = (boy ? 96 * bs : 120 * U), ry0 = rx0 * 0.34;
            let x, y, rot, rx = rx0, ry = ry0, front = true;
            const restX = WR.x * W, restY = GY - ry0 * 0.6;
            const slipAt = atOr(cues, WR.slip, null), fallAt = atOr(cues, WR.fall, null);
            if (WR.on === 'head' && head) {
              const sl = slipAt != null ? prog(lt, slipAt, 0.7) : 0;
              const wob = Math.sin(lt * 3.1) * 2;
              x = head[0] + (2 + sl * 30) * bs; y = head[1] - 50 * bs + sl * 40 * bs; rot = -4 + wob + sl * 22;
              if (fallAt != null && lt >= fallAt) {     // drops off: falls with a spin to the floor, rolls, settles flat
                const u2 = lt - fallAt, g = 2600 * U, fallT = Math.sqrt(Math.max(1, (restY - y)) * 2 / g);
                if (u2 < fallT) { x = lerp(x, restX, u2 / fallT); y = y + 0.5 * g * u2 * u2; rot = rot + u2 * 420; }
                else { const v = u2 - fallT, b = Math.exp(-v * 5) * Math.abs(Math.sin(v * 14)) * 30 * U; x = restX + Math.min(1, v * 2) * 26; y = restY - b; rot = lerp(rot + fallT * 420, 3, clamp01(v * 3)); ry = lerp(ry0 * 1.6, ry0, clamp01(v * 3)); }
              }
            } else if (WR.on === 'seat') { x = cx; y = SY - 34 * TS; rot = 4; }
            else { x = restX + Math.sin(lt * 0.8) * 2; y = restY; rot = 3 + Math.sin(lt * 1.1) * 2; }
            const [lf2, rg, be] = wreathD(x, y, rx, ry, rot, t, 400);
            wreathF.setAttribute('d', lf2); wreathL.setAttribute('d', rg); wreathR.setAttribute('d', '');
          }

          updateCast(cast, lt, dur, cues, t, W, H, GY);

          if (label) {
            const L = label.L, at = atOr(cues, L.at, 0.2), sp2 = spring(lt, at, 0.6), x = (L.x ?? 0.5) * W, y = (L.y ?? (portrait ? 0.2 : 0.14)) * H, b = boil(sd + 800, t, 1.2);
            label.tx.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-3) scale(${lerp(0.6, 1, sp2).toFixed(3)})`);
            label.tx.setAttribute('fill-opacity', clamp01(sp2 * 2).toFixed(2));
            label.tx.style.opacity = clamp01(sp2 * 2);
            const tw = label.tx.getComputedTextLength ? Math.min(W * 0.8, label.tx.getComputedTextLength()) : 300, pu = prog(lt, at + 0.25, 0.5);
            label.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 24], [x - tw / 2 + tw * pu, y + 18]], io(801, t, { w: 6 })) : '');
            if (label.ar) {
              const pa = prog(lt, at + 0.4, 0.5), ax = L.arrow[0] * W, ay = L.arrow[1] * H, sx = x + (ax > x ? tw * 0.3 : -tw * 0.3), sy = y + 40;
              const ex = lerp(sx, ax, pa), ey = lerp(sy, ay, pa);
              const ang = Math.atan2(ey - sy, ex - sx);
              label.ar.setAttribute('d', pa > 0.02 ? inkPath([[sx, sy], [(sx + ex) / 2 + 20, (sy + ey) / 2 - 10], [ex, ey]], io(810, t, { w: 5 })) + ' ' +
                inkPath([[ex - Math.cos(ang - 0.5) * 30, ey - Math.sin(ang - 0.5) * 30], [ex, ey], [ex - Math.cos(ang + 0.5) * 30, ey - Math.sin(ang + 0.5) * 30]], io(811, t, { w: 5 })) : '');
            }
          }
        },
      };
    },
  };
})();
