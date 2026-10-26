// hc_hacova: an Ottoman army camp seen from the side, in the parchment ink style (brand/kit/BRAND.md §3, §5; every
// line boils at 8 Hz via _ink.js, everything is a pure function of (seed, lt), no Math.random). Written for
// 01-hacova-savasi (Haçova / Mezőkeresztes, 26 October 1596: the enemy breaks into the camp and starts plundering,
// the camp servants — cooks, grooms, camel drivers — grab whatever they can and drive the plunderers off), parametric.
//
// SHOTS.hc_camp  — wide shot: far row of small conical tents with pennants, a big sultan's pavilion (otağ) with a gold
//   finial and a red flag, treasure chests (open lids, gold coins that fountain out while they are being looted),
//   a steaming cauldron, cast members (KASIF rigs: hatless period figures with one accessory, an optional cook's apron
//   and a hand tool — ladle, pitchfork, tent pole, pan — that follows the hand and waves while they charge), dust puffs
//   behind runners, hand-written labels with optional red ring, camera push-in + shake.
// SHOTS.hc_close — the same world framed close (bigger cast, the pavilion and tents pushed back): for the hook frame.
// SHOTS.hc_field — SHOTS.ag03_battle plus a drawn marsh (P.marsh, see below).
//
// P: {ground: 0.6 (cast feet, 0..1 H), horizon: 0.44 (far tent row), tents: {n: 7, scale: 0.55} | false,
//     otag: {x: 0.5, scale: 1, flag: true} | false,
//     chests: [{x, y (default ground), scale: 1, loot: {from: cue|sec, to: cue|sec} (coins fly out), gold: true}],
//     cauldron: {x: 0.14, scale: 1} | false,
//     cast: [{who: "kasif"|name, accessory, beard, apron: true, tool: "ladle"|"fork"|"pole"|"pan", x, y, scale,
//             face: "left"|"right", pose: "idle", emotion, dir, item, text, swing: true (tool waves on point),
//             seq: [{at, pose, to (x, 0..1), dur: 0.8, then, face, emotion, dir, item}]}],
//     labels: [{text, x, y, at, size: 64, color: "ink"|"red"|"blue", ring: true, rot: -4, on: cast "who" (sits just above
//              that figure's head and follows it; dx, dy nudge in 0..1)}], clash: {at, x: 0.55, y: 0.42, r: 190, text} (red burst),
//     cam: {zoom: 1.06, focus: [0.5, 0.55]}, shake: cue, hit: cue (camera punch)}
// cues: whatever names the seq / chests / labels use, plus hit and shake.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const COL = { red: INK.red, blue: INK.blue, ink: INK.ink, gold: INK.gold, green: INK.green };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };

  function build(ctx, close) {
    const { P, W, H, svg, seed } = ctx;
    const sd = seed * 1000 + 611, portrait = H > W;
    const root = el(svg, 'g'), cam = el(root, 'g');
    const gy = (P.ground ?? (portrait ? (close ? 0.6 : 0.59) : 0.84)) * H;
    const hy = (P.horizon ?? (portrait ? (close ? 0.47 : 0.44) : 0.6)) * H;
    const baseS = (portrait ? 0.78 : 0.62) * (close ? 1.3 : 1);

    // ---------- far plane: ground line, tent row
    const farF = inkEl(cam, INK.paperLight), farR = inkEl(cam), farPen = inkEl(cam, INK.red), farSoft = inkEl(cam, INK.inkSoft);
    const TN = P.tents === false ? null : Object.assign({ n: portrait ? 6 : 9, scale: close ? 0.45 : 0.55 }, P.tents || {});
    const tents = [];
    if (TN) {
      const r = rng(sd + 3);
      for (let i = 0; i < TN.n; i++) {
        const u = (i + 0.5) / TN.n, x = (u * 1.08 - 0.04) * W + (r() - 0.5) * 40;
        tents.push({ x, s: TN.scale * (0.85 + r() * 0.3) * (portrait ? 1 : 0.8), ph: r() * 6 });
      }
    }
    // ---------- mid plane: pavilion (otağ)
    const OT = P.otag === false ? null : Object.assign({ x: 0.5, scale: 1, flag: true }, P.otag || {});
    const otF = inkEl(cam, INK.paperLight), otV = inkEl(cam, INK.red), otR = inkEl(cam), otG = inkEl(cam, INK.gold), otFlag = inkEl(cam, INK.red);
    // ground line + grass ticks
    const groundR = inkEl(cam), grassR = inkEl(cam, INK.inkSoft);
    // cauldron
    const CA = P.cauldron ? Object.assign({ x: 0.14, scale: 1 }, P.cauldron) : null;
    const caF = inkEl(cam, INK.inkSoft), caR = inkEl(cam), caFire = inkEl(cam, INK.red), caGold = inkEl(cam, INK.gold), steamR = inkEl(cam, INK.inkSoft);
    // chests
    const chests = (P.chests || []).map((c, i) => ({ c, i, body: inkEl(cam, INK.paperDark), gold: inkEl(cam, INK.gold), lid: inkEl(cam, INK.paperDark), r: inkEl(cam) }));
    const coinF = inkEl(cam, INK.gold), coinR = inkEl(cam);
    // dust
    const dustF = inkEl(cam, INK.paperDark), dustR = inkEl(cam, INK.inkSoft);
    // cast
    const castG = el(cam, 'g');
    const CL = P.clash || null;
    const clash = CL ? { f: inkEl(cam, INK.red), r: inkEl(cam), m: inkEl(cam), g: el(cam, 'g') } : null;
    if (clash && CL.text) {
      const size = CL.size || 110;
      clash.t = el(clash.g, 'text', { x: 0, y: size * 0.34, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.paperLight });
      clash.t.textContent = CL.text;
    }
    const cast = (P.cast || []).map((m, i) => {
      const isK = m.who === 'kasif';
      const g = el(castG, 'g');
      const rig = KASIF.create(g, { scale: baseS * (m.scale || 1), hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: sd + i * 13 + 5 });
      // apron + tool live inside the rig node (same transform: rig units)
      const apron = m.apron ? { f: inkEl(rig.node, INK.paperLight), r: inkEl(rig.node) } : null;
      const tool = m.tool ? { f: inkEl(rig.node, m.tool === 'pan' ? INK.inkSoft : INK.paperDark), r: inkEl(rig.node) } : null;
      return { m, i, isK, rig, apron, tool };
    });
    // labels
    const labels = (P.labels || []).map((L, i) => {
      const g = el(cam, 'g'), size = L.size || 64;
      const ring = L.ring ? inkEl(g, INK.red) : null;
      const t = el(g, 'text', { x: 0, y: size * 0.34, 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: COL[L.color] || INK.ink });
      t.textContent = L.text;
      let w = 0; try { w = t.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = L.text.length * size * 0.45;
      return { L, g, ring, size, w };
    });

    // tool shapes in a local frame: origin = grip, +y = along the handle away from the hand
    function toolShape(kind) {
      switch (kind) {
        case 'fork': return { handle: [[0, -40], [0, 230]], head: [[-34, 230], [34, 230]], tines: [[[-34, 230], [-34, 300]], [[0, 230], [0, 306]], [[34, 230], [34, 300]]] };
        case 'pole': return { handle: [[0, -90], [0, 260]], head: null, tines: [] };
        case 'pan': return { handle: [[0, -20], [0, 120]], pan: [0, 175, 58] };
        default: return { handle: [[0, -30], [0, 190]], bowl: [0, 222, 42] };   // ladle (kepçe)
      }
    }
    const TOOLS = {};

    return {
      update(lt, dur, cues, env = {}) {
        const t = env.t ?? lt;
        root.setAttribute('opacity', Math.floor(t * 30) % 2 ? '0.999' : '0.998');
        const Cm = P.cam || {}, u = progIO(lt, 0, Math.max(1, dur)), hit = punch(lt, atOr(cues, P.hit || 'hit', null), 0.6);
        const z = lerp(1, Cm.zoom ?? 1.06, u) * (1 + 0.025 * hit);
        const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : gy / H * 0.9) * H;
        const shA = atOr(cues, P.shake, null), shk = shA != null && lt >= shA ? Math.exp(-(lt - shA) * 4) : 0;
        const sx = Math.sin(lt * 0.35) * 8 + Math.sin(t * 41) * 10 * shk, sy = Math.cos(lt * 0.27) * 4 + Math.cos(t * 37) * 8 * shk;
        cam.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);

        // ---- tents
        let tf = '', tr = '', tp = '', ts = '';
        tents.forEach((T, i) => {
          const s = T.s * (portrait ? 1 : 1.2), x = T.x, b = hy, hh = 210 * s, ww = 150 * s;
          const shape = [[x - ww, b], [x - ww * 0.8, b - hh * 0.35], [x - ww * 0.25, b - hh * 0.85], [x, b - hh], [x + ww * 0.25, b - hh * 0.85], [x + ww * 0.8, b - hh * 0.35], [x + ww, b]];
          tf += inkLoop(shape, { seed: sd + 20 + i, t, amp: 0.8 }) + ' ';
          tr += inkPath(shape.concat([[x - ww, b]]), { w: 4, seed: sd + 40 + i, t, amp: 1 }) + ' ';
          ts += inkPath([[x, b - hh], [x - ww * 0.12, b]], { w: 2.5, seed: sd + 60 + i, t, amp: 0.8 }) + ' ';
          ts += inkPath([[x - ww * 0.18, b], [x - ww * 0.1, b - hh * 0.32], [x + ww * 0.02, b]], { w: 2.5, seed: sd + 70 + i, t, amp: 0.8 }) + ' ';
          // pole + pennant
          const top = [x, b - hh - 46 * s];
          tr += inkPath([[x, b - hh], top], { w: 3.5, seed: sd + 80 + i, t }) + ' ';
          const wv = Math.sin(t * 3 + T.ph) * 8 * s;
          tp += inkLoop([top, [top[0] + 50 * s, top[1] + 8 * s + wv], [top[0] + 44 * s, top[1] + 18 * s + wv * 0.6], [top[0] + 4, top[1] + 26 * s]], { seed: sd + 90 + i, t, amp: 0.8, smooth: false }) + ' ';
        });
        farF.setAttribute('d', tf); farR.setAttribute('d', tr); farPen.setAttribute('d', tp); farSoft.setAttribute('d', ts);

        // ---- pavilion (otağ)
        if (OT) {
          const s = OT.scale * (portrait ? (close ? 0.9 : 1.05) : 0.9), x = OT.x * W, b = hy + 40 * s;
          const w = 260 * s, wallH = 170 * s, roofH = 190 * s, top = b - wallH;
          const wall = [[x - w, b], [x - w, top], [x + w, top], [x + w, b]];
          const roof = [[x - w - 30 * s, top], [x - w * 0.7, top - roofH * 0.5], [x - w * 0.3, top - roofH * 0.88], [x, top - roofH], [x + w * 0.3, top - roofH * 0.88], [x + w * 0.7, top - roofH * 0.5], [x + w + 30 * s, top]];
          otF.setAttribute('d', inkLoop(wall, { seed: sd + 101, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(roof, { seed: sd + 102, t, amp: 0.8 }));
          // scalloped red valance under the roof
          const val = [[x - w - 30 * s, top]];
          const nS = 7;
          for (let k = 0; k <= nS; k++) { const xx = lerp(x - w - 30 * s, x + w + 30 * s, k / nS); val.push([xx, top + 6]); if (k < nS) val.push([xx + (2 * w + 60 * s) / nS / 2, top + 44 * s]); }
          val.push([x + w + 30 * s, top]);
          otV.setAttribute('d', inkLoop(val, { seed: sd + 103, t, amp: 0.8, smooth: false }));
          let od = inkPath(wall.concat([[x - w, b]]), { w: 5, seed: sd + 104, t, smooth: false });
          od += ' ' + inkPath(roof, { w: 5, seed: sd + 105, t }) + ' ' + inkPath(val, { w: 3.5, seed: sd + 106, t, smooth: false });
          // door flap + stripes
          od += ' ' + inkPath([[x - 60 * s, b], [x - 50 * s, top + 60 * s], [x, top + 50 * s], [x + 50 * s, top + 60 * s], [x + 60 * s, b]], { w: 4, seed: sd + 107, t });
          for (const k of [-0.7, -0.4, 0.4, 0.7]) od += ' ' + inkPath([[x + k * w, top + 50 * s], [x + k * w, b]], { w: 2.5, seed: sd + 108 + k * 10, t });
          const pole = [x, top - roofH - 70 * s];
          od += ' ' + inkPath([[x, top - roofH], pole], { w: 5, seed: sd + 112, t });
          otR.setAttribute('d', od);
          otG.setAttribute('d', inkCircle(x, top - roofH - 14 * s, 18 * s, sd + 113, t, { fill: true }));
          if (OT.flag) {
            const wv = Math.sin(t * 2.6) * 12 * s, fl = [];
            for (let k = 0; k <= 5; k++) fl.push([pole[0] + k * 26 * s, pole[1] + Math.sin(k * 1.1 - t * 4) * 6 * s + (k / 5) * wv * 0.4]);
            for (let k = 5; k >= 0; k--) fl.push([pole[0] + k * 26 * s, pole[1] + 62 * s + Math.sin(k * 1.1 - t * 4) * 6 * s + (k / 5) * wv * 0.4]);
            otFlag.setAttribute('d', inkLoop(fl, { seed: sd + 114, t, amp: 0.8 }));
          }
        }

        // ---- ground
        groundR.setAttribute('d', inkPath([[-40, gy + 4], [W * 0.3, gy + 1], [W * 0.7, gy + 6], [W + 40, gy + 3]], { w: 6, seed: sd + 120, t }) + ' ' +
          inkPath([[-40, hy + 2], [W * 0.5, hy - 3], [W + 40, hy + 3]], { w: 3.5, seed: sd + 121, t }));
        let gd = '';
        for (let k = 0; k < 14; k++) {
          const x = (k + 0.3) / 14 * W, y = gy + 34 + (k % 3) * 26, sw = Math.sin(t * 1.6 + k) * 4;
          gd += inkPath([[x, y], [x + 6 + sw, y - 22]], { w: 3, seed: sd + 130 + k, t, amp: 0.6 }) + ' ' + inkPath([[x + 14, y], [x + 22 + sw, y - 16]], { w: 3, seed: sd + 150 + k, t, amp: 0.6 }) + ' ';
        }
        grassR.setAttribute('d', gd);

        // ---- cauldron + fire + steam
        if (CA) {
          const s = CA.scale * (portrait ? 0.9 : 0.75) * (close ? 1.25 : 1), x = CA.x * W, b = gy;
          const rx = 110 * s, top = b - 150 * s;
          const pot = [[x - rx, top], [x - rx * 1.05, top + 60 * s], [x - rx * 0.8, b - 40 * s], [x, b - 24 * s], [x + rx * 0.8, b - 40 * s], [x + rx * 1.05, top + 60 * s], [x + rx, top]];
          caF.setAttribute('d', inkLoop(pot, { seed: sd + 160, t, amp: 1 }));
          let cr = inkPath(pot.concat([pot[0]]), { w: 6, seed: sd + 161, t }) + ' ' + inkCircle(x, top, rx, sd + 162, t, { ry: 22 * s, w: 5 });
          cr += ' ' + inkPath([[x - rx * 0.6, b - 30 * s], [x - rx * 0.8, b]], { w: 6, seed: sd + 163, t }) + ' ' + inkPath([[x + rx * 0.6, b - 30 * s], [x + rx * 0.8, b]], { w: 6, seed: sd + 164, t });
          caR.setAttribute('d', cr);
          caGold.setAttribute('d', inkCircle(x, top + 2, rx * 0.86, sd + 165, t, { ry: 15 * s, fill: true }));
          let fd = '';
          for (let k = 0; k < 4; k++) {
            const fxp = x - 50 * s + k * 33 * s, fh = (38 + 18 * Math.sin(t * 9 + k * 2)) * s;
            fd += inkLoop([[fxp - 16 * s, b - 4], [fxp - 4 * s, b - fh * 0.6], [fxp, b - fh], [fxp + 6 * s, b - fh * 0.5], [fxp + 16 * s, b - 4]], { seed: sd + 170 + k, t, amp: 1.5 }) + ' ';
          }
          caFire.setAttribute('d', fd);
          let st = '';
          for (let k = 0; k < 3; k++) {
            const ph = ((t * 0.55 + k / 3) % 1), y0 = top - 20 - ph * 260 * s, x0 = x + (k - 1) * 46 * s, pts = [];
            for (let j = 0; j <= 6; j++) pts.push([x0 + Math.sin(j * 1.2 + t * 2 + k) * 18 * s, y0 - j * 26 * s]);
            if (ph < 0.92) st += inkPath(pts, { w: 4 * (1 - ph * 0.6), seed: sd + 180 + k, t, amp: 0.8, taper: 0.8 }) + ' ';
          }
          steamR.setAttribute('d', st);
        }

        // ---- chests + coins
        let cfd = '', crd = '';
        chests.forEach(C => {
          const c = C.c, s = (c.scale || 1) * (portrait ? 0.9 : 0.75) * (close ? 1.2 : 1), x = c.x * W, b = (c.y != null ? c.y * H : gy);
          const w = 120 * s, h = 96 * s, top = b - h;
          const body = [[x - w, b], [x - w, top], [x + w, top], [x + w, b]];
          C.body.setAttribute('d', inkLoop(body, { seed: sd + 200 + C.i, t, amp: 0.8, smooth: false }));
          // gold heap
          const gh = [[x - w * 0.92, top + 4], [x - w * 0.6, top - 26 * s], [x - w * 0.2, top - 40 * s], [x + w * 0.25, top - 34 * s], [x + w * 0.7, top - 20 * s], [x + w * 0.92, top + 4]];
          C.gold.setAttribute('d', c.gold === false ? '' : inkLoop(gh, { seed: sd + 210 + C.i, t, amp: 1 }));
          // open lid tilted back
          const lid = [[x - w, top], [x - w - 26 * s, top - 96 * s], [x + w - 26 * s, top - 110 * s], [x + w, top]];
          C.lid.setAttribute('d', inkLoop(lid, { seed: sd + 220 + C.i, t, amp: 0.8, smooth: false }));
          let rd = inkPath(body.concat([body[0]]), { w: 5, seed: sd + 230 + C.i, t, smooth: false }) + ' ' + inkPath(lid, { w: 5, seed: sd + 240 + C.i, t, smooth: false });
          rd += ' ' + inkPath([[x - w, top + h * 0.45], [x + w, top + h * 0.45]], { w: 4, seed: sd + 250 + C.i, t }) + ' ' + inkPath([[x - w * 0.4, top], [x - w * 0.4, b]], { w: 3.5, seed: sd + 255 + C.i, t }) + ' ' + inkPath([[x + w * 0.4, top], [x + w * 0.4, b]], { w: 3.5, seed: sd + 258 + C.i, t });
          if (c.gold !== false) rd += ' ' + inkPath(gh, { w: 3.5, seed: sd + 260 + C.i, t });
          C.r.setAttribute('d', rd);
          // coins fountain while looted
          if (c.loot) {
            const a = atOr(cues, c.loot.from, 0), e = atOr(cues, c.loot.to, dur + 5), gap = 0.11, life = 0.95;
            const r0 = rng(sd + 270 + C.i);
            const nMax = Math.ceil((Math.min(e, lt) - a) / gap);
            for (let k = Math.max(0, nMax - 10); k < nMax; k++) {
              const born = a + k * gap, age = lt - born;
              if (age < 0 || age > life) continue;
              const rr = rng(inkHash(sd + 280 + C.i, k)); rr(); r0();
              const vx = (rr() * 2 - 1) * 340 * s, vy = -(560 + rr() * 300) * s;
              const px = x + (rr() * 2 - 1) * w * 0.5 + vx * age, py = top - 30 * s + vy * age + 1500 * s * age * age;
              if (py > b + 10) continue;
              const sp = Math.cos(age * 14 + k);
              cfd += inkLoop(inkEllipsePts(px, py, 17 * s * Math.max(0.25, Math.abs(sp)), 17 * s, sd + 290 + k, 8), { seed: sd + 290 + k, t, amp: 0.4 }) + ' ';
              crd += inkPath(inkEllipsePts(px, py, 17 * s * Math.max(0.25, Math.abs(sp)), 17 * s, sd + 290 + k, 8), { w: 3, closed: true, seed: sd + 300 + k, t, amp: 0.4 }) + ' ';
            }
          }
        });
        coinF.setAttribute('d', cfd); coinR.setAttribute('d', crd);

        // ---- cast
        let dfd = '', drd = '';
        const heads = {};
        cast.forEach(C => {
          const m = C.m, s = baseS * (m.scale || 1);
          const segs = [{ at: -1, pose: m.pose || 'idle', face: m.face, emotion: m.emotion, dir: m.dir, item: m.item, text: m.text }];
          (m.seq || []).forEach(q => { const a = atOr(cues, q.at, null); if (a != null) segs.push(Object.assign({}, q, { at: a })); });
          segs.sort((p, q) => p.at - q.at);
          let x = m.x * W, face = faceOf(m.face, 1), pose = m.pose || 'idle', since = lt + 1, emo = m.emotion, dir = m.dir, item = m.item, text = m.text, dist = 0, moving = false;
          let prev = null, prevSince = 0, curStart = -1;
          for (const q of segs) {
            if (q.at > lt) break;
            const before = { pose, dir };
            if (q.to != null) {
              const x0 = x, x1 = q.to * W, d = q.dur || 0.8, uu = clamp01((lt - q.at) / d);
              x = lerp(x0, x1, uu); dist = Math.abs(x1 - x0) * uu;
              if (q.face == null) face = x1 >= x0 ? 1 : -1;
              moving = uu < 1;
              if (moving) { pose = q.pose || 'walk'; curStart = q.at; }
              else { pose = q.then || 'idle'; curStart = q.at + d; }
            } else { pose = q.pose || pose; curStart = q.at; moving = false; }
            if (q.face != null) face = faceOf(q.face, face);
            if (q.emotion) emo = q.emotion;
            if (q.dir != null) dir = q.dir;
            if (q.item !== undefined) item = q.item;
            if (q.text !== undefined) text = q.text;
            if (before.pose !== pose) { prev = before; prevSince = lt - curStart; }
          }
          since = curStart < 0 ? lt + 1 : lt - curStart;
          const y = (m.y != null ? m.y * H : gy);
          let dd = dirOf(dir);
          if (pose === 'point' && m.swing !== false && m.tool) dd += Math.sin(t * 9 + C.i * 1.7) * 15;   // shaking the tool
          const o = { x, y, face, since, dir: dd, emotion: emo || (pose === 'shock' ? 'surprised' : null), item, text, mouth: 0 };
          if (pose === 'walk' || pose === 'run') o.ph = dist / (KASIF.gait(pose) * s) + C.i * 0.21;
          if (prev && since < 0.3) { o.prev = { pose: prev.pose, since: since + 1, dir: dirOf(prev.dir) }; o.mix = since / 0.3; }
          const R = C.rig.update(t, pose, o);
          if (R) heads[m.who] = [x + face * s * R.head[0], y + s * (R.head[1] - 72 - (m.accessory || C.isK ? 70 : 0))];
          // apron (rig units: hip -> chest)
          if (C.apron && R) {
            const hp = R.hip, hc = R.head;
            const cx = (hp[0] * 0.75 + hc[0] * 0.25), ch = [lerp(hp[0], hc[0], 0.42), lerp(hp[1], hc[1], 0.42)];
            const ap = [[ch[0] - 30, ch[1]], [ch[0] + 30, ch[1]], [cx + 52, hp[1] + 96], [cx - 40, hp[1] + 100]];
            C.apron.f.setAttribute('d', inkLoop(ap, { seed: sd + 400 + C.i, t, amp: 1.2, smooth: false }));
            C.apron.r.setAttribute('d', inkPath(ap.concat([ap[0]]), { w: 5, seed: sd + 410 + C.i, t, smooth: false }));
          }
          // tool: extends from the front hand away from the hip
          if (C.tool && R) {
            const hnd = R.hands[1], hp = [R.hip[0] + 8, R.hip[1] - 118];   // ~shoulder: the tool continues the arm
            let vx = hnd[0] - hp[0], vy = hnd[1] - hp[1]; const ln = Math.hypot(vx, vy) || 1; vx /= ln; vy /= ln;
            const T = TOOLS[m.tool] || (TOOLS[m.tool] = toolShape(m.tool));
            const P2 = q => [hnd[0] + vx * q[1] - vy * q[0], hnd[1] + vy * q[1] + vx * q[0]];
            let tr2 = inkPath(T.handle.map(P2), { w: 8, seed: sd + 420 + C.i, t }), tf2 = '';
            if (T.head) tr2 += ' ' + inkPath(T.head.map(P2), { w: 7, seed: sd + 430 + C.i, t });
            (T.tines || []).forEach((q, k) => { tr2 += ' ' + inkPath(q.map(P2), { w: 6, seed: sd + 440 + C.i * 5 + k, t, taper: 0.6 }); });
            if (T.bowl || T.pan) {
              const B = T.bowl || T.pan, c0 = P2([B[0], B[1]]);
              tf2 = inkCircle(c0[0], c0[1], B[2], sd + 450 + C.i, t, { fill: true });
              tr2 += ' ' + inkCircle(c0[0], c0[1], B[2], sd + 460 + C.i, t, { w: 6 });
            }
            C.tool.f.setAttribute('d', tf2); C.tool.r.setAttribute('d', tr2);
          }
          // dust puffs behind runners
          if (pose === 'run' || (pose === 'walk' && moving)) {
            for (let k = 0; k < 3; k++) {
              const ph2 = ((o.ph || 0) * 1 + k / 3) % 1, rr = (16 + ph2 * 40) * s * (pose === 'run' ? 1 : 0.6);
              const px = x - face * (40 + ph2 * 120) * s, py = y - 10 - ph2 * 30 * s;
              if (ph2 > 0.9) continue;
              dfd += inkCircle(px, py, rr, sd + 500 + C.i * 7 + k, t, { fill: true }) + ' ';
              drd += inkCircle(px, py, rr, sd + 520 + C.i * 7 + k, t, { w: 3 }) + ' ';
            }
          }
        });
        dustF.setAttribute('d', dfd); dustR.setAttribute('d', drd);

        // ---- clash: jagged red burst + speed lines (+ optional big word) on the cue
        if (clash) {
          const a = atOr(cues, CL.at, dur * 0.7), p = lt >= a ? spring(lt, a, 0.5) : 0;
          const cx = (CL.x ?? 0.55) * W, cy = (CL.y ?? 0.42) * H, R0 = (CL.r || 190) * p * (1 + 0.05 * Math.sin(t * 14));
          if (p > 0.01) {
            const pts = [], n = 11;
            for (let q = 0; q < n * 2; q++) { const ang = q / (n * 2) * Math.PI * 2 + 0.2, rr = R0 * (q % 2 ? 0.55 : 1) * (0.9 + 0.1 * ((q * 7) % 3)); pts.push([cx + Math.cos(ang) * rr * 1.25, cy + Math.sin(ang) * rr]); }
            clash.f.setAttribute('d', inkLoop(pts, { seed: sd + 700, t, amp: 2, smooth: false }));
            clash.r.setAttribute('d', inkPath(pts, { w: 6, seed: sd + 701, t, amp: 2, smooth: false, closed: true }));
            let md = '';
            for (let q = 0; q < 8; q++) { const ang = q / 8 * Math.PI * 2 + 0.4, r1 = R0 * 1.45, r2 = R0 * 1.85; md += inkPath([[cx + Math.cos(ang) * r1 * 1.2, cy + Math.sin(ang) * r1], [cx + Math.cos(ang) * r2 * 1.2, cy + Math.sin(ang) * r2]], { w: 6, seed: sd + 710 + q, t }) + ' '; }
            clash.m.setAttribute('d', md);
            clash.g.setAttribute('opacity', 1);
            clash.g.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(-6) scale(${(p * (1 + 0.06 * Math.sin(t * 14))).toFixed(3)})`);
          } else { clash.f.setAttribute('d', ''); clash.r.setAttribute('d', ''); clash.m.setAttribute('d', ''); clash.g.setAttribute('opacity', 0); }
        }

        // ---- labels
        labels.forEach((B, i) => {
          const L = B.L, a = atOr(cues, L.at, 0), p = lt >= a ? spring(lt, a, 0.55) : 0, pk = punch(lt, a, 0.5);
          const hd = L.on && heads[L.on];
          const x = hd ? Math.max(B.w / 2 + 30, Math.min(W - B.w / 2 - 30, hd[0] + (L.dx || 0) * W)) : (L.x ?? 0.5) * W, y = hd ? hd[1] - B.size * 0.55 + (L.dy || 0) * H : (L.y ?? 0.2) * H, b = boil(sd + 600 + i, t, 1.2);
          B.g.setAttribute('opacity', clamp01(p * 3));
          B.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1(L.rot ?? -4)}) scale(${(lerp(0.5, 1, p) * (1 + 0.08 * pk)).toFixed(3)})`);
          if (B.ring) {
            const rx = B.w / 2 + 34, ry = B.size * 0.75;
            const dr = sm((lt - a - 0.15) / 0.5);
            const pts = inkEllipsePts(0, 0, rx, ry, sd + 610 + i, 16, -0.05);
            const n = Math.max(2, Math.round(pts.length * dr) + 1), arc = pts.concat([pts[0], pts[1]]).slice(0, n + 1);
            B.ring.setAttribute('d', dr > 0.02 ? inkPath(arc, { w: 6, seed: sd + 620 + i, t }) : '');
          }
        });
      },
    };
  }

  SH.hc_camp = { kind: '2d', build: ctx => build(ctx, false) };
  // SHOTS.hc_field — SHOTS.ag03_battle (bird's-eye battlefield, all its params) plus a drawn marsh on the terrain:
  //   P.marsh: {x: 0.45, y: 0.5, rx: 0.32 (of W), ry: 0.1 (of H), at: cue (springs in; omit = there from the start)}
  //   (reed tufts sway, water ripples drift; drawn under the units so fleeing dots run into it)
  SH.hc_field = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 977;
      const before = svg.lastChild;
      const inner = SH.ag03_battle.build(ctx);
      const root = before ? before.nextSibling : svg.firstChild;
      const terr = root && root.firstChild && root.firstChild.firstChild ? root.firstChild.firstChild : root;
      // ag03_battle draws every block red; Ottoman ("sel") blocks here are blue, including their fleeing dots
      try {
        const unitsG = root.firstChild.children[1];
        (P.units || []).forEach((u, i) => {
          if (u.side !== 'sel' || (u.kind || 'riders') !== 'block') return;
          const g = unitsG.children[i];
          if (g) Array.from(g.children).forEach(e => { if (e.getAttribute('fill') === INK.red) e.setAttribute('fill', INK.blue); });
        });
      } catch (e) { /* keep defaults */ }
      const M = P.marsh ? Object.assign({ x: 0.45, y: 0.5, rx: 0.32, ry: 0.1 }, P.marsh) : null;
      const mk = fill => inkEl(terr, fill);
      const mF = M ? mk(INK.paperDark) : null, mR = M ? mk(INK.inkSoft) : null, mW = M ? mk(INK.blue) : null, mReed = M ? mk(INK.ink) : null, mHead = M ? mk(INK.inkSoft) : null;
      const reeds = [];
      if (M) {
        const r = rng(sd + 5);
        for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + r() * 0.3, k = 0.75 + r() * 0.35; reeds.push([Math.cos(a) * k, Math.sin(a) * k, r() * 6, 0.8 + r() * 0.5]); }
        for (let i = 0; i < 6; i++) reeds.push([(r() - 0.5) * 1.1, (r() - 0.5) * 0.7, r() * 6, 0.7 + r() * 0.4]);
      }
      return {
        update(lt, dur, cues, env = {}) {
          inner.update(lt, dur, cues, env);
          if (!M) return;
          const t = env.t ?? lt, a = M.at != null ? atOr(cues, M.at, 0) : -1, p = a < 0 ? 1 : (lt >= a ? spring(lt, a, 0.7) : 0);
          const cx = M.x * W, cy = M.y * H, rx = M.rx * W * p, ry = M.ry * H * p;
          if (p < 0.01) { [mF, mR, mW, mReed, mHead].forEach(e => e.setAttribute('d', '')); return; }
          const blob = inkEllipsePts(cx, cy, rx, ry, sd + 10, 18, 0.03, 0.12);
          mF.setAttribute('d', inkLoop(blob, { seed: sd + 11, t, amp: 1.5 }));
          mF.setAttribute('fill-opacity', 0.8);
          mR.setAttribute('d', inkPath(blob, { w: 5, seed: sd + 12, t, closed: true }) + ' ' + inkPath(inkEllipsePts(cx, cy, rx * 0.8, ry * 0.75, sd + 13, 16, 0.03, 0.1), { w: 2.5, seed: sd + 14, t, closed: true }));
          let wd = '';
          for (let i = 0; i < 9; i++) {
            const u = ((i * 0.37 + lt * 0.06) % 1) - 0.5, v = ((i * 0.61) % 1) - 0.5, x0 = cx + u * rx * 1.3, y0 = cy + v * ry * 1.1, pts = [];
            for (let j = 0; j <= 4; j++) pts.push([x0 + j * 16, y0 + Math.sin(j * 1.6 + t * 2.4 + i) * 5]);
            wd += inkPath(pts, { w: 4, seed: sd + 20 + i, t, amp: 0.6 }) + ' ';
          }
          mW.setAttribute('d', wd);
          let rd = '', hd = '';
          reeds.forEach((q, i) => {
            const bx = cx + q[0] * rx, by = cy + q[1] * ry, h = 70 * q[3] * p;
            for (let k = -1; k <= 1; k++) {
              const sw = Math.sin(t * 1.8 + q[2] + k) * 8, tip = [bx + k * 12 + sw, by - h + Math.abs(k) * 14];
              rd += inkPath([[bx + k * 5, by], [bx + k * 8 + sw * 0.4, by - h * 0.5], tip], { w: 3.5, seed: sd + 40 + i * 3 + k, t, amp: 0.6, taper: 0.6 }) + ' ';
              if (k === 0) hd += inkLoop(inkEllipsePts(tip[0], tip[1] + 6, 6, 15, sd + 90 + i, 8), { seed: sd + 90 + i, t, amp: 0.5 }) + ' ';
            }
          });
          mReed.setAttribute('d', rd); mHead.setAttribute('d', hd);
        },
      };
    },
  };
  SH.hc_close = { kind: '2d', build: ctx => build(ctx, true) };
})();
