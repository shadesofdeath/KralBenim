// uyku_b_night: two night scenes in the parchment ink style (brand/kit/BRAND.md §3, §5; 8 Hz boil via _ink.js),
// written for 04-uykusuz-kalsak (chapter "Beyin kendini kapatıyor").
//
// SHOTS.uyku_b_street — a night street: hatched sky with a moon, faint houses, a street lamp with a pale light cone and a
//   signpost. On the `morph` cue the signpost's outline melts into a trembling human silhouette (head, shoulders, legs)
//   while a handwritten question appears; cast members (Kaşif + period figures) react.
//   P: {post_x: 0.56, lamp_x: 0.4, text: "İNSAN?", sub: "aslında tabela", cast: [...], cam: {zoom: 1.06}}
//   cues: morph (silhouette), hit (punch), sub, cast "at" names
//
// SHOTS.uyku_b_road — micro-sleep at the wheel, seen from the driver's seat: a night road converging to the horizon,
//   rushing dashed lane marks and roadside posts, pale headlight beams, a big steering wheel with two ink hands.
//   On `close` the eyelids (ink) fall from top and bottom and stay shut for `blackout` seconds while the car drifts
//   across the lane; a handwritten line on the lids says the brain is off; then they snap open.
//   P: {open: {text: "gözler açık", at}, off: {text: "beyin kapalı"}, blackout: 2.0, drift: 1}
//   cues: open, close, hit
// Everything is a pure function of (seed, lt): no Math.random, scrubbing back gives the same frame.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const NIGHT = mix(INK.paperDark, INK.inkSoft, 0.35);
  const hand = (parent, size, color, fr) => el(parent, 'text', { 'font-family': fr ? 'Fraunces, Georgia, serif' : INK_FONT, 'font-weight': fr ? 900 : 400,
    'font-size': size, 'text-anchor': 'middle', fill: color, style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });

  function castOf(P, parent, seed, defScale) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', sc = m.scale ?? defScale;
      return { m, isK, sc, rig: KASIF.create(el(parent, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), seed: seed + 7 + i * 13 }) };
    });
  }
  function castUpdate(cast, lt, t, dur, cues, W, H, G) {
    cast.forEach(c => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const pose = after ? (m.then || 'point') : (m.pose || 'idle');
      const x = (m.x ?? 0.8) * W, y = m.y != null ? m.y * H : G;
      const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const o = { x, y, face: m.face === 'left' ? -1 : 1, since, dir, text: m.text,
        emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null) };
      if (pose === 'walk' || pose === 'run') o.ph = lt / 0.9;
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
      c.rig.update(t, pose, o);
    });
  }

  // ================================================================ uyku_b_street
  SH.uyku_b_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 41, G = P.ground ?? 900;
      const r = rng(seed * 17 + 9);
      const root = el(svg, 'g'), world = el(root, 'g');
      const skyF = mk(world, NIGHT, { 'fill-opacity': 0.55 }), hatchR = mk(world, INK.inkSoft, { 'fill-opacity': 0.5 });
      const moonF = mk(world, INK.paperLight), moonR = mk(world);
      const houseF = mk(world, INK.paperDark), houseR = mk(world, INK.inkSoft), winF = mk(world, INK.gold, { 'fill-opacity': 0.7 });
      const coneF = mk(world, INK.paperLight, { 'fill-opacity': 0.75 });
      const groundF = mk(world, INK.paperDark, { 'fill-opacity': 0.5 }), groundR = mk(world);
      const lampR = mk(world), lampF = mk(world, INK.gold), postR = mk(world), signF = mk(world, INK.paperLight);
      const ghostF = mk(world, INK.inkSoft, { 'fill-opacity': 0 }), ghostR = mk(world);
      const castG = el(world, 'g');
      const uiG = el(root, 'g');
      const q = hand(uiG, 130, INK.red, false); q.textContent = P.text || 'İNSAN?';
      const qU = mk(uiG, INK.red);
      const sub = P.sub ? hand(uiG, 60, INK.inkSoft, false) : null; if (sub) sub.textContent = P.sub;
      const cast = castOf(P, castG, seed, 0.72);
      const PX = (P.post_x ?? 0.56) * W, LX = (P.lamp_x ?? 0.38) * W;
      const houses = Array.from({ length: 6 }, (_, i) => ({ x: i * W / 5.2 - 60 + r() * 60, w: 220 + r() * 120, h: 200 + r() * 160, roof: r() < 0.6 }));
      const hatch = Array.from({ length: 46 }, () => ({ x: r() * W, y: r() * (G - 420), l: 40 + r() * 70 }));
      // signpost: pole + board (closed outline) and the person it turns into (same point count: they morph)
      const S = 1.0;
      const postPts = [[-14, 0], [-14, -300], [-110, -300], [-110, -440], [-40, -440], [0, -440], [40, -440], [110, -440], [110, -300], [14, -300], [14, 0]].map(p => [p[0] * S, p[1] * S]);
      const personPts = [[-30, 0], [-36, -210], [-80, -250], [-74, -350], [-24, -372], [0, -376], [24, -372], [74, -350], [80, -250], [36, -210], [30, 0]].map(p => [p[0] * S, p[1] * S]);
      const lerpPts = (a, b, u) => a.map((p, i) => [lerp(p[0], b[i][0], u), lerp(p[1], b[i][1], u)]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          const mAt = atOr(cues, 'morph', dur * 0.55), mo = lt >= mAt ? sm((lt - mAt) / 0.9) : 0;
          const Cm = P.cam || {}, z = lerp(1, Cm.zoom ?? 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * (pk + punch(lt, mAt, 0.6)));
          const fx = PX, fy = G - 300;
          world.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.35) * 8)} ${f1(Math.cos(lt * 0.27) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // sky: darker band + hand hatching, moon
          skyF.setAttribute('d', inkLoop([[-60, -60], [W + 60, -60], [W + 60, G - 330], [-60, G - 300]], O(1, { smooth: false, amp: 2 })));
          hatchR.setAttribute('d', hatch.map((h, i) => inkPath([[h.x, h.y], [h.x + h.l, h.y - h.l * 0.35]], O(10 + i, { w: 3, amp: 1.2 }))).join(' '));
          const mx = W * 0.83, my = 170;
          moonF.setAttribute('d', inkCircle(mx, my, 70, sd + 3, t, { fill: true }));
          moonR.setAttribute('d', inkCircle(mx, my, 70, sd + 3, t, { w: 5 }) + ' ' + inkDot(mx - 18, my - 10, 12, 10, sd + 4, t) + ' ' + inkDot(mx + 22, my + 20, 8, 7, sd + 5, t));
          // houses
          let hf = '', hr = '', wf = '';
          houses.forEach((h, i) => {
            const by = G - 10, ty = by - h.h, pts = h.roof ? [[h.x, by], [h.x, ty], [h.x + h.w / 2, ty - 80], [h.x + h.w, ty], [h.x + h.w, by]] : [[h.x, by], [h.x, ty], [h.x + h.w, ty + 4], [h.x + h.w, by]];
            hf += inkLoop(pts, O(40 + i, { smooth: false })) + ' ';
            hr += inkPath(pts, O(40 + i, { w: 4, smooth: false })) + ' ';
            if (i % 2 === 0) { const wx = h.x + h.w * 0.3, wy = ty + 50; wf += inkLoop([[wx, wy], [wx + 50, wy], [wx + 50, wy + 60], [wx, wy + 60]], O(60 + i, { smooth: false, amp: 1 })) + ' '; }
          });
          houseF.setAttribute('d', hf); houseR.setAttribute('d', hr); winF.setAttribute('d', wf);
          // lamp light cone (flickers), ground
          const fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.7 + 1);
          const ly = G - 520;
          coneF.setAttribute('d', inkLoop([[LX - 30, ly + 30], [LX + 30, ly + 30], [LX + 260 * fl, G + 4], [LX - 260 * fl, G + 4]], O(70, { smooth: false, amp: 2 })));
          coneF.setAttribute('fill-opacity', f1(0.6 * fl * 10) / 10);
          groundF.setAttribute('d', inkLoop([[-60, G], [W + 60, G - 4], [W + 60, G + 70], [-60, G + 70]], O(71, { smooth: false })));
          groundR.setAttribute('d', inkPath([[-60, G + 2], [W * 0.5, G - 3], [W + 60, G + 1]], O(72, { w: 6 })));
          // lamp post + lantern
          lampR.setAttribute('d', inkPath([[LX, G], [LX + 2, ly + 40]], O(80, { w: 12 })) + ' ' + inkPath([[LX - 44, ly + 40], [LX + 44, ly + 40], [LX + 30, ly - 40], [LX - 30, ly - 40]], O(81, { w: 6, closed: true, smooth: false })) +
            ' ' + inkPath([[LX - 40, ly - 40], [LX, ly - 70], [LX + 40, ly - 40]], O(82, { w: 6, smooth: false })));
          lampF.setAttribute('d', inkLoop([[LX - 28, ly + 30], [LX + 28, ly + 30], [LX + 20, ly - 30], [LX - 20, ly - 30]], O(83, { smooth: false, amp: 1 })));
          lampF.setAttribute('fill-opacity', f1(fl * 10) / 10);
          // signpost -> person (trembles more while it is the "person")
          const tr = mo * (3 + 2 * Math.sin(t * 7));
          const pts = lerpPts(postPts, personPts, mo).map((p, i) => { const b = boil(sd + 200 + i, t, tr); return [PX + p[0] + b[0], G + p[1] + b[1]]; });
          signF.setAttribute('d', mo < 0.5 ? inkLoop(pts, O(90, { smooth: false })) : '');
          signF.setAttribute('fill-opacity', f1((1 - mo * 2) * 10) / 10);
          const hb = boil(sd + 97, t, tr), hx = PX + hb[0], hy = G - 432 + hb[1], hdR = 52 * sm((mo - 0.4) / 0.6);
          ghostF.setAttribute('d', mo > 0.01 ? inkLoop(pts, O(91, { smooth: false })) + (hdR > 1 ? ' ' + inkCircle(hx, hy, hdR, sd + 98, t, { fill: true }) : '') : '');
          ghostF.setAttribute('fill-opacity', f1(mo * 0.45 * 10) / 10);
          postR.setAttribute('d', inkPath(pts, O(92, { w: 7, closed: true, smooth: false })));
          // the head and its dark eye dots once it is a "person"
          ghostR.setAttribute('d', hdR > 1 ? inkCircle(hx, hy, hdR, sd + 98, t, { w: 7 }) + (mo > 0.8 ? ' ' + inkDot(hx - 16, hy - 4, 7, 7, sd + 95, t) + ' ' + inkDot(hx + 16, hy - 4, 7, 7, sd + 96, t) : '') : '');
          castUpdate(cast, lt, t, dur, cues, W, H, G);
          // the question
          const qs = lt >= mAt ? spring(lt, mAt + 0.2, 0.6) : 0, b = boil(sd + 300, t, 1.5);
          const qx = PX + 230, qy = G - 560;
          q.setAttribute('opacity', clamp01(qs * 2));
          q.setAttribute('transform', `translate(${f1(qx + b[0])} ${f1(qy + b[1])}) rotate(-5) scale(${lerp(0.4, 1, qs).toFixed(3)})`);
          const tw = q.getComputedTextLength ? q.getComputedTextLength() : 300, pu = lt >= mAt ? prog(lt, mAt + 0.5, 0.4) : 0;
          qU.setAttribute('d', pu > 0.01 ? inkPath([[qx - tw / 2, qy + 26], [qx - tw / 2 + tw * pu, qy + 18]], O(301, { w: 7 })) : '');
          if (sub) {
            const sa = atOr(cues, 'sub', mAt + 1.4), ss = lt >= sa ? spring(lt, sa, 0.6) : 0;
            sub.setAttribute('opacity', clamp01(ss * 2));
            sub.setAttribute('transform', `translate(${f1(qx + 10)} ${f1(qy + 90)}) rotate(-3) scale(${lerp(0.5, 1, ss).toFixed(3)})`);
          }
        },
      };
    },
  };

  // ================================================================ uyku_b_road
  SH.uyku_b_road = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 53;
      const HY = H * 0.4;
      const root = el(svg, 'g'), world = el(root, 'g');
      const skyF = mk(world, NIGHT, { 'fill-opacity': 0.65 }), hatchR = mk(world, INK.inkSoft, { 'fill-opacity': 0.55 }), hillsF = mk(world, INK.inkSoft, { 'fill-opacity': 0.5 });
      const roadF = mk(world, INK.paperDark), beamF = mk(world, INK.paperLight, { 'fill-opacity': 0.7 }), edgeR = mk(world), dashF = mk(world, INK.paperLight), dashR = mk(world);
      const postsF = mk(world, INK.paperLight), postsR = mk(world), refl = mk(world, INK.red);
      const cab = el(root, 'g');
      const dashB = mk(cab, INK.inkSoft), dashBR = mk(cab), wheelR = mk(cab), armsR = mk(cab), handsF = mk(cab, INK.paperLight), handsR = mk(cab);
      const lidG = el(root, 'g');
      const lidT = mk(lidG), lidB = mk(lidG), lash = mk(lidG, INK.ink);
      const uiG = el(root, 'g');
      const oT = hand(uiG, 76, INK.green, false); oT.textContent = (P.open && P.open.text) || 'gözler açık';
      const offT = el(uiG, 'text', { 'font-family': INK_FONT, 'font-size': 110, 'text-anchor': 'middle', fill: INK.paperLight }); offT.textContent = (P.off && P.off.text) || 'beyin kapalı';
      const offU = mk(uiG, INK.red);
      const r = rng(seed * 23 + 1);
      const hatch = Array.from({ length: 40 }, () => ({ x: r() * W, y: r() * (HY - 30), l: 40 + r() * 60 }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const cAt = atOr(cues, 'close', dur * 0.45), bo = P.blackout ?? 2.0;
          const close = lt < cAt ? 0 : lt < cAt + bo ? sm((lt - cAt) / 0.5) : 1 - sm((lt - cAt - bo) / 0.18);
          // drift: the car slides to the left while the eyes are shut, then the jolt back
          const dr = (P.drift ?? 1) * (lt < cAt ? 0 : lt < cAt + bo ? sm((lt - cAt) / bo) : 1 - sm((lt - cAt - bo) / 0.8));
          const shake = lt > cAt + bo && lt < cAt + bo + 0.6 ? Math.sin(lt * 50) * 10 * (1 - (lt - cAt - bo) / 0.6) : 0;
          const VX = W / 2 + 260 * dr + Math.sin(lt * 0.5) * 12, tilt = -4 * dr;
          world.setAttribute('transform', `rotate(${f1(tilt)} ${W / 2} ${H}) translate(${f1(shake)} 0)`);
          skyF.setAttribute('d', inkLoop([[-200, -60], [W + 200, -60], [W + 200, HY], [-200, HY]], O(1, { smooth: false, amp: 2 })));
          hatchR.setAttribute('d', hatch.map((h, i) => inkPath([[h.x, h.y], [h.x + h.l, h.y - h.l * 0.3]], O(10 + i, { w: 3, amp: 1 }))).join(' '));
          hillsF.setAttribute('d', inkLoop([[-200, HY + 2], [-200, HY - 50], [W * 0.2, HY - 90], [W * 0.45, HY - 40], [W * 0.7, HY - 110], [W + 200, HY - 60], [W + 200, HY + 2]], O(5, { amp: 2 })));
          // road (perspective), headlight beams
          const roadL = VX - W * 1.1, roadR = VX + W * 1.1;
          roadF.setAttribute('d', inkLoop([[VX - 30, HY], [VX + 30, HY], [roadR, H + 40], [roadL, H + 40]], O(20, { smooth: false, amp: 1 })));
          beamF.setAttribute('d', inkLoop([[W * 0.5 - 420, H], [VX - 40, HY + 60], [VX + 40, HY + 60], [W * 0.5 + 420, H]], O(21, { smooth: false, amp: 2 })));
          beamF.setAttribute('fill-opacity', f1(lerp(0.7, 0.4, dr) * 10) / 10);
          edgeR.setAttribute('d', inkPath([[VX - 30, HY], [roadL, H + 40]], O(22, { w: 7 })) + ' ' + inkPath([[VX + 30, HY], [roadR, H + 40]], O(23, { w: 7 })) + ' ' + inkPath([[-200, HY], [W + 200, HY]], O(24, { w: 4 })));
          // dashed centre line rushing towards the driver (z from 1 at the horizon to 0 at the bottom)
          const P2 = (z, side) => { const y = HY + (H + 40 - HY) * Math.pow(1 - z, 2.2); const k = (y - HY) / (H + 40 - HY); return [VX + side * k * W * 1.1, y, k]; };
          let df = '', drr = '';
          const sp = 0.55;
          for (let i = 0; i < 9; i++) {
            const z0 = ((i / 9) - lt * sp) % 1, za = z0 < 0 ? z0 + 1 : z0, zb = Math.max(0, za - 0.045);
            const a = P2(za, 0), bb = P2(zb, 0), wa = 3 + a[2] * 40, wb = 3 + bb[2] * 40;
            const pts = [[a[0] - wa, a[1]], [a[0] + wa, a[1]], [bb[0] + wb, bb[1]], [bb[0] - wb, bb[1]]];
            df += inkLoop(pts, O(30 + i, { smooth: false, amp: 1 })) + ' ';
            drr += inkPath(pts, O(30 + i, { w: 3, closed: true, smooth: false, amp: 1 })) + ' ';
          }
          dashF.setAttribute('d', df); dashR.setAttribute('d', drr);
          // roadside posts with red reflectors
          let pf = '', pr = '', rf = '';
          for (let i = 0; i < 6; i++) for (const side of [-1, 1]) {
            const z0 = ((i / 6) - lt * sp + (side > 0 ? 0.08 : 0)) % 1, za = z0 < 0 ? z0 + 1 : z0;
            const a = P2(za, side * 0.92), hgt = 8 + a[2] * 300, w = 3 + a[2] * 30;
            if (a[1] > H + 300) continue;
            const pts = [[a[0] - w, a[1]], [a[0] + w, a[1]], [a[0] + w, a[1] - hgt], [a[0] - w, a[1] - hgt]];
            pf += inkLoop(pts, O(50 + i * 2 + (side > 0), { smooth: false, amp: 0.8 })) + ' ';
            pr += inkPath(pts, O(50 + i * 2 + (side > 0), { w: 2 + a[2] * 4, closed: true, smooth: false, amp: 0.8 })) + ' ';
            rf += inkLoop([[a[0] - w * 0.7, a[1] - hgt * 0.85], [a[0] + w * 0.7, a[1] - hgt * 0.85], [a[0] + w * 0.7, a[1] - hgt * 0.72], [a[0] - w * 0.7, a[1] - hgt * 0.72]], O(70 + i, { smooth: false, amp: 0.5 })) + ' ';
          }
          postsF.setAttribute('d', pf); postsR.setAttribute('d', pr); refl.setAttribute('d', rf);
          // cabin: dashboard edge, wheel (turns a little with the drift), arms + hands
          const wx = W / 2, wy = H + 10, wr = 380, rot = -0.25 * dr + Math.sin(lt * 0.8) * 0.03;
          dashB.setAttribute('d', inkLoop([[-60, H + 60], [-60, H - 120], [W * 0.3, H - 150], [W * 0.7, H - 150], [W + 60, H - 120], [W + 60, H + 60]], O(80, { amp: 1.5 })));
          dashBR.setAttribute('d', inkPath([[-60, H - 120], [W * 0.3, H - 150], [W * 0.7, H - 150], [W + 60, H - 120]], O(81, { w: 6 })));
          const ring = inkEllipsePts(wx, wy, wr, wr * 0.8, sd + 82, 30, rot, 0.004);
          const sp1 = (a) => [wx + Math.cos(a + rot) * wr, wy + Math.sin(a + rot) * wr * 0.8];
          wheelR.setAttribute('d', inkPath(ring, O(82, { w: 26, closed: true, amp: 1 })) + ' ' + inkPath([[wx, wy], sp1(-Math.PI / 2)], O(83, { w: 18 })) + ' ' +
            inkPath([[wx, wy], sp1(-Math.PI * 0.12)], O(84, { w: 16 })) + ' ' + inkPath([[wx, wy], sp1(-Math.PI * 0.88)], O(85, { w: 16 })));
          const hl = sp1(-Math.PI * 0.8), hr2 = sp1(-Math.PI * 0.2);
          armsR.setAttribute('d', inkPath([[-40, H + 40], [hl[0] - 140, hl[1] + 120], hl], O(86, { w: 9 })) + ' ' + inkPath([[W + 40, H + 40], [hr2[0] + 140, hr2[1] + 120], hr2], O(87, { w: 9 })));
          handsF.setAttribute('d', inkDot(hl[0], hl[1], 30, 26, sd + 88, t) + ' ' + inkDot(hr2[0], hr2[1], 30, 26, sd + 89, t));
          handsR.setAttribute('d', inkCircle(hl[0], hl[1], 30, sd + 90, t, { w: 5, ry: 26 }) + ' ' + inkCircle(hr2[0], hr2[1], 30, sd + 91, t, { w: 5, ry: 26 }));
          // eyelids: ink shapes closing from top and bottom with a hand-drawn lash edge
          if (close > 0.001) {
            const ty = lerp(-30, H / 2 + 20, close), by = lerp(H + 30, H / 2 - 20, close), sag = 120 * (1 - close * 0.6);
            const top = [[-80, -80], [W + 80, -80], [W + 80, ty - sag * 0.4]]; for (let i = 8; i >= 0; i--) top.push([W * i / 8, ty + Math.sin(i / 8 * Math.PI) * sag]); top.push([-80, ty - sag * 0.4]);
            const bot = [[-80, H + 80], [W + 80, H + 80], [W + 80, by + sag * 0.4]]; for (let i = 8; i >= 0; i--) bot.push([W * i / 8, by - Math.sin(i / 8 * Math.PI) * sag * 0.6]); bot.push([-80, by + sag * 0.4]);
            lidT.setAttribute('d', inkLoop(top, O(100, { amp: 2 })));
            lidB.setAttribute('d', inkLoop(bot, O(101, { amp: 2 })));
            let ls = '';
            for (let i = 1; i < 16; i++) { const x = W * i / 16, y = ty + Math.sin(i / 16 * Math.PI) * sag; ls += inkPath([[x, y - 4], [x + 8, y + 26 * (1 - close * 0.5)]], O(110 + i, { w: 5 })) + ' '; }
            lash.setAttribute('d', ls);
          } else { lidT.setAttribute('d', ''); lidB.setAttribute('d', ''); lash.setAttribute('d', ''); }
          // texts: "eyes open" before, "brain off" on the closed lids
          const oa = atOr(cues, P.open && P.open.at || 'open', 0.3), os = lt >= oa ? spring(lt, oa, 0.6) * (1 - sm((lt - cAt) / 0.3)) : 0, b = boil(sd + 120, t, 1.2);
          oT.setAttribute('opacity', clamp01(os * 2));
          oT.setAttribute('transform', `translate(${f1(W * 0.5 + b[0])} ${f1(HY - 150 + b[1])}) rotate(-3) scale(${lerp(0.5, 1, Math.max(0, os)).toFixed(3)})`);
          const fs = close > 0.85 ? spring(lt, cAt + 0.4, 0.6) * (1 - sm((lt - cAt - bo + 0.1) / 0.15)) : 0;
          offT.setAttribute('opacity', clamp01(fs * 2));
          offT.setAttribute('transform', `translate(${f1(W / 2 + b[1])} ${f1(H * 0.48 + b[0])}) rotate(-2) scale(${lerp(0.5, 1, Math.max(0, fs)).toFixed(3)})`);
          const tw = offT.getComputedTextLength ? offT.getComputedTextLength() : 500, pu = fs > 0.3 ? prog(lt, cAt + 0.7, 0.4) : 0;
          offU.setAttribute('d', pu > 0.01 ? inkPath([[W / 2 - tw / 2, H * 0.48 + 30], [W / 2 - tw / 2 + tw * pu, H * 0.48 + 22]], O(130, { w: 8 })) : '');
        },
      };
    },
  };
})();
