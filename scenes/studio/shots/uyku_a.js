// uyku_a: Randy Gardner's 1963-64 sleep record (San Diego) in the parchment ink style (brand/kit/BRAND.md §3, §5;
// every line boils at 8 Hz via _ink.js). Two 2D shots:
//
// SHOTS.uyku_a_room — a 1960s teenager's bedroom: back wall, a night/day window, a pinned day-tally sheet whose marks
//   are scratched in one by one ("GÜN" + running count, last mark red), a wall clock whose hands race, a bed (a cast
//   member can sit on its edge), a desk with a lamp and a pinned poster, a door. Cast = Kaşif + hatless period figures
//   with small extras: tie (Randy), glasses + clipboard (Dement), tired eye bags, a name tag, an idea bulb, a "?".
//   P: {
//     window: {x: 0.16, sky: "night"|"day"} | false,
//     tally: {x: 0.6, y: 0.2, n: 11, at: cue|seconds (negative = drawn from the first frame), dur: 2, red_last: true} | false,
//     clock: {x: 0.42, y: 0.2, speed: 1 (hours per second)} | false,
//     bed: {x: 0.5, w: 0.34} | false, desk: {x: 0.8, poster: "BİLİM FUARI"} | false, door: {x: 0.04} | false,
//     cast: [{who, x, to, at, pose, then, face, dir, emotion, scale, sit: "bed" (sits on the bed edge),
//             tie: "red"|"blue", glasses: true, clipboard: true, bags: true, tag: "Randy", tag_at,
//             bulb: cue (idea bulb above the head), q: cue (big red "?" above the head)}],
//     label: {text, x, y, at, size, color, arrow: [x, y] (0..1)}, cam: {zoom: 1.06, focus: [0.5, 0.5]}
//   }   cues: hit (punch), tally/label/cast "at" names
//
// SHOTS.uyku_a_brain — a giant ink profile head (facing right) with the brain inside; the frontal lobe glows gold,
//   then on a cue it dims and flickers (sleep loss hits it first). Handwritten label + arrow, optional Kaşif cast.
//   P: {cx: 0.4, cy: 0.47, r: 0.3 (head radius, 0..1 of H), dim: cue|seconds|false, glow_at: cue|seconds,
//       label: {text: "ön bölge", x, y, at, color, arrow: true}, brake: cue (a small "fren" pedal icon pops by the lobe),
//       cast: [...same as uyku_a_room], cam: {zoom}}
//   cues: glow, dim, hit (punch), label/cast "at" names
// Everything is a pure function of (seed, lt): no Math.random, scrubbing back gives the same frame.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40, 'down-left': -30, 'down-right': -30 };
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, green: INK.green, gold: INK.gold };
  const FR = 'Fraunces, Georgia, serif';
  const NIGHT = mix(INK.inkSoft, INK.ink, 0.25);

  // ---------------------------------------------------------------- cast
  function makeCast(P, parent, seed, portrait, defScale) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif';
      const sc = m.scale ?? defScale;
      const g = el(parent, 'g');
      const rig = KASIF.create(el(g, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 });
      if (m.sit === 'bed') for (let k = 0; k < 6; k++) { const n = rig.node.children[k]; if (n) n.style.display = 'none'; }   // no rock seat / floor shadow
      const over = el(g, 'g');
      const c = { m, isK, sc, rig, g,
        tieF: m.tie ? mk(over, COL[m.tie] || INK.red) : null, tieR: m.tie ? mk(over) : null,
        bags: m.bags ? mk(over, INK.inkSoft) : null, wideF: m.wide ? mk(over, INK.paperLight) : null, wideR: m.wide ? mk(over, INK.ink) : null, wideV: m.wide ? mk(over, INK.red, { 'fill-opacity': 0.7 }) : null,
        glass: m.glasses ? mk(over) : null, glassF: m.glasses ? mk(over, INK.paperLight, { 'fill-opacity': 0.35 }) : null,
        clipF: m.clipboard ? mk(over, INK.paperDark) : null, clipP: m.clipboard ? mk(over, INK.paperLight) : null, clipR: m.clipboard ? mk(over) : null,
        bulbF: m.bulb ? mk(over, INK.gold) : null, bulbR: m.bulb ? mk(over) : null,
        q: null, tag: null, tagU: null };
      if (m.q) {
        c.q = el(over, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': portrait ? 190 : 150, 'text-anchor': 'middle', fill: INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round`, 'fill-opacity': 0 });
        c.q.textContent = '?';
      }
      if (m.tag) {
        c.tag = el(over, 'text', { 'font-family': INK_FONT, 'font-size': m.tag_size || (portrait ? 64 : 56), 'text-anchor': 'middle', fill: INK.ink,
          style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 12px; stroke-linejoin: round`, 'fill-opacity': 0 });
        c.tag.textContent = m.tag;
        c.tagU = mk(over, INK.red);
      }
      return c;
    });
  }
  function updateCast(cast, lt, t, dur, cues, W, H, G, sd) {
    cast.forEach((c, ci) => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const pose = after ? (m.then || 'point') : (m.pose || 'idle');
      const moving = (m.pose === 'walk' || m.pose === 'run') && m.to != null;
      let x = (m.x ?? 0.8) * W;
      if (moving && !after) x = lerp(x, m.to * W, sm(clamp01(lt / Math.max(0.3, at ?? dur)) * 1.08));
      else if (m.to != null) x = m.to * W;
      const y = m.y != null ? m.y * H : G;
      const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 30;
      const face = m.face === 'left' ? -1 : 1;
      const o = { x, y, face, since, dir, text: m.text, item: m.item,
        emotion: after ? (m.emotion || (pose === 'shock' ? 'surprised' : null)) : (m.emotion0 || null) };
      if (pose === 'walk' || pose === 'run') o.ph = moving ? Math.abs(x - (m.x ?? 0.8) * W) / (KASIF.gait(pose) * c.sc) : lt / 0.9;
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir, ph: o.ph }; o.mix = since / 0.32; }
      const r = c.rig.update(t, pose, o) || {};
      const s = c.sc, W2 = q => [x + face * s * q[0], y + s * q[1]];
      const hc = r.head || [0, -440], hip = r.hip || [0, -184];
      const headW = W2(hc);
      const O = (k, xx) => Object.assign({ seed: sd + ci * 300 + k, t, amp: 1 }, xx);
      if (c.tieF) {   // necktie from the collar down the torso
        const nk = [hc[0] + 2, hc[1] + 84], dv = [hip[0] - nk[0], hip[1] - nk[1]], L = Math.hypot(dv[0], dv[1]) || 1;
        const d = [dv[0] / L, dv[1] / L], n = [-d[1], d[0]], len = L * 0.62;
        const at2 = (u, w) => [nk[0] + d[0] * len * u + n[0] * w, nk[1] + d[1] * len * u + n[1] * w];
        const knot = [at2(0, -11), at2(0, 11), at2(0.14, 7), at2(0.14, -7)].map(W2);
        const blade = [at2(0.14, -7), at2(0.14, 7), at2(0.82, 16), at2(1, 0), at2(0.82, -16)].map(W2);
        c.tieF.setAttribute('d', inkLoop(knot, O(1, { smooth: false })) + ' ' + inkLoop(blade, O(2, { smooth: false })));
        c.tieR.setAttribute('d', inkPath(knot, O(1, { w: 3.5, closed: true, smooth: false })) + ' ' + inkPath(blade, O(2, { w: 3.5, closed: true, smooth: false })));
      }
      const eyeW = sd2 => W2([hc[0] + 12 + sd2 * 22, hc[1] + 6]);
      if (c.bags) {
        let bd = '';
        [-1, 1].forEach((sd2, k) => { const e = eyeW(sd2), rr = 13 * s; bd += inkPath([[e[0] - rr, e[1] + 9 * s], [e[0], e[1] + 17 * s], [e[0] + rr, e[1] + 9 * s]], O(10 + k, { w: 3.2, amp: 0.5 })) + ' '; });
        c.bags.setAttribute('d', bd);
      }
      if (c.wideF) {  // wide-open, sleepless eyes: big whites, tiny staring pupils, red veins
        let wf = '', wr = '', wv = '';
        [-1, 1].forEach((sd2, k) => {
          const e = eyeW(sd2), R = 15, pr = 5.5;
          wf += inkCircle(e[0], e[1], R, sd + ci * 300 + 80 + k, t, { fill: true, amp: 0.4 }) + ' ';
          wr += inkCircle(e[0], e[1], R, sd + ci * 300 + 80 + k, t, { w: 1.4, amp: 0.3 }) + ' ' + inkDot(e[0] + face * 1.5, e[1], pr * 1.5, pr * 1.5, sd + ci * 300 + 84 + k, t, 0.3) + ' ';
          wv += inkPath([[e[0] - R * 0.95, e[1] + 2], [e[0] - R * 0.5, e[1] + 4]], O(86 + k, { w: 1.6, amp: 0.3 })) + ' ' + inkPath([[e[0] + R * 0.95, e[1] - 1], [e[0] + R * 0.55, e[1] + 3]], O(88 + k, { w: 1.6, amp: 0.3 })) + ' ';
        });
        c.wideF.setAttribute('d', wf); c.wideR.setAttribute('d', wr); c.wideV.setAttribute('d', wv);
      }
      if (c.glass) {
        let gd = '', gf = '';
        [-1, 1].forEach((sd2, k) => { const e = eyeW(sd2); gd += inkCircle(e[0], e[1], 17 * s, sd + ci * 300 + 20 + k, t, { w: 4 }) + ' '; gf += inkCircle(e[0], e[1], 17 * s, sd + ci * 300 + 20 + k, t, { fill: true }) + ' '; });
        const a = eyeW(-1), b = eyeW(1);
        gd += inkPath([[a[0] + face * 17 * s, a[1] - 2], [b[0] - face * 17 * s, b[1] - 2]], O(23, { w: 3.5, amp: 0.4 })) + ' ';
        gd += inkPath([[a[0] - face * 17 * s, a[1] - 3], W2([hc[0] - 46, hc[1] + 2])], O(24, { w: 3.5, amp: 0.4 }));
        c.glass.setAttribute('d', gd); c.glassF.setAttribute('d', gf);
      }
      if (c.clipF) {  // clipboard held in the front hand
        const hf = (r.hands || [[30, -250], [40, -250]])[1], hp = W2([hf[0] + 10, hf[1] - 6]);
        const bw = 70 * s, bh = 92 * s;
        const box = [[hp[0] - bw / 2, hp[1] - bh / 2], [hp[0] + bw / 2, hp[1] - bh / 2 - 2], [hp[0] + bw / 2 + 2, hp[1] + bh / 2], [hp[0] - bw / 2, hp[1] + bh / 2 + 2]];
        const pap = [[hp[0] - bw / 2 + 8 * s, hp[1] - bh / 2 + 14 * s], [hp[0] + bw / 2 - 8 * s, hp[1] - bh / 2 + 13 * s], [hp[0] + bw / 2 - 8 * s, hp[1] + bh / 2 - 8 * s], [hp[0] - bw / 2 + 8 * s, hp[1] + bh / 2 - 7 * s]];
        c.clipF.setAttribute('d', inkLoop(box, O(30, { smooth: false })));
        c.clipP.setAttribute('d', inkLoop(pap, O(31, { smooth: false })));
        let cr = inkPath(box, O(30, { w: 4, closed: true, smooth: false })) + ' ' + inkPath([[hp[0] - 14 * s, hp[1] - bh / 2 + 2], [hp[0] + 14 * s, hp[1] - bh / 2 + 1]], O(32, { w: 9 }));
        for (let k = 0; k < 4; k++) cr += ' ' + inkPath([[pap[0][0] + 6, pap[0][1] + (16 + k * 15) * s], [pap[1][0] - 10 - (k % 2) * 12, pap[0][1] + (15 + k * 15) * s]], O(33 + k, { w: 2.5, amp: 0.5 }));
        c.clipR.setAttribute('d', cr);
      }
      if (c.bulbF) {  // idea bulb above the head
        const ba = atOr(cues, m.bulb, null);
        if (ba == null || lt < ba) { c.bulbF.setAttribute('d', ''); c.bulbR.setAttribute('d', ''); }
        else {
          const sp = spring(lt, ba, 0.7), R = 46 * sp * (1 + 0.04 * Math.sin(t * 6)), bx = headW[0], by = headW[1] - 175 * s - 30;
          c.bulbF.setAttribute('d', inkCircle(bx, by, R, sd + ci * 300 + 40, t, { fill: true }));
          let bd = inkCircle(bx, by, R, sd + ci * 300 + 40, t, { w: 5 }) + ' ' + inkPath([[bx - R * 0.4, by + R * 0.95], [bx + R * 0.4, by + R * 0.95], [bx + R * 0.36, by + R * 1.35], [bx - R * 0.36, by + R * 1.35]], O(41, { w: 4, closed: true, smooth: false }));
          bd += ' ' + inkPath([[bx - R * 0.28, by + R * 0.2], [bx - R * 0.12, by - R * 0.25], [bx + R * 0.12, by + R * 0.2], [bx + R * 0.28, by - R * 0.25]], O(42, { w: 3.5 }));
          const ray = prog(lt, ba + 0.15, 0.4);
          for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.48, r0 = R * 1.3, r1 = R * (1.3 + 0.5 * ray + 0.08 * Math.sin(t * 5 + k)); if (ray > 0.02) bd += ' ' + inkPath([[bx + Math.cos(a) * r0, by + Math.sin(a) * r0], [bx + Math.cos(a) * r1, by + Math.sin(a) * r1]], O(43 + k, { w: 5 })); }
          c.bulbR.setAttribute('d', bd);
        }
      }
      if (c.q) {
        const qa = atOr(cues, m.q, null);
        if (qa == null || lt < qa) c.q.setAttribute('fill-opacity', 0);
        else {
          const sp = spring(lt, qa, 0.7), b = boil(sd + ci * 300 + 60, t, 2);
          c.q.setAttribute('fill-opacity', 1);
          c.q.setAttribute('transform', `translate(${f1(headW[0] + face * 120 * s + b[0])} ${f1(headW[1] - 110 * s + b[1])}) rotate(${f1(Math.sin(t * 3) * 8)}) scale(${lerp(0.2, 1, sp).toFixed(3)})`);
        }
      }
      if (c.tag) {    // handwritten name above the head
        const ta = atOr(cues, m.tag_at, 0.15), sp = spring(lt, ta, 0.6), b = boil(sd + ci * 300 + 70, t, 1);
        const hx = headW[0], hy = headW[1] - 150 * s - (m.bulb ? 0 : 0);
        c.tag.setAttribute('fill-opacity', 1); c.tag.setAttribute('opacity', clamp01(sp * 2));
        c.tag.setAttribute('transform', `translate(${f1(hx + b[0])} ${f1(hy + b[1])}) rotate(-3) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
        const tw = c.tag.getComputedTextLength ? c.tag.getComputedTextLength() : 200, pu = prog(lt, ta + 0.2, 0.4);
        c.tagU.setAttribute('d', pu > 0.01 ? inkPath([[hx - tw / 2, hy + 18], [hx - tw / 2 + tw * pu, hy + 13]], O(71, { w: 5 })) : '');
      }
    });
  }
  function makeLabel(P, parent, portrait) {
    if (!P.label || !P.label.text) return null;
    const L = P.label;
    const t = el(parent, 'text', { 'font-family': INK_FONT, 'font-size': L.size || (portrait ? 84 : 72), 'text-anchor': 'middle', fill: COL[L.color] || INK.ink,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: 14px; stroke-linejoin: round` });
    t.textContent = L.text;
    return { L, t, u: mk(parent, COL[L.color] || INK.ink), arrow: mk(parent, COL[L.color] || INK.ink) };
  }
  function updateLabel(label, lt, t, cues, W, H, sd, portrait) {
    if (!label) return;
    const Lb = label.L, at = atOr(cues, Lb.at, 0.2), sp = spring(lt, at, 0.6), x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? 0.15) * H, b = boil(sd + 8000, t, 1);
    label.t.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.6, 1, sp).toFixed(3)})`);
    label.t.setAttribute('opacity', clamp01(sp * 2));
    const tw = Math.min(W * 0.85, label.t.getComputedTextLength ? label.t.getComputedTextLength() : 300), pu = prog(lt, at + 0.25, 0.5);
    const O = (k, xx) => Object.assign({ seed: sd + k, t, amp: 1.4 }, xx);
    label.u.setAttribute('d', pu > 0.01 ? inkPath([[x - tw / 2, y + 22], [x - tw / 2 + tw * pu, y + 16]], O(8001, { w: 6 })) : '');
    const A = Lb.arrow;
    if (Array.isArray(A)) {
      const pa = prog(lt, at + 0.35, 0.5);
      if (pa < 0.01) { label.arrow.setAttribute('d', ''); return; }
      const sx = x + (A[0] * W > x ? tw * 0.3 : -tw * 0.3), sy = y + 40, ex = lerp(sx, A[0] * W, pa), ey = lerp(sy, A[1] * H, pa);
      const ang = Math.atan2(ey - sy, ex - sx), hl = 30;
      let d = inkPath([[sx, sy], [(sx + ex) / 2 + 20, (sy + ey) / 2 - 10], [ex, ey]], O(8002, { w: 6 }));
      if (pa > 0.9) d += ' ' + inkPath([[ex - Math.cos(ang - 0.5) * hl, ey - Math.sin(ang - 0.5) * hl], [ex, ey], [ex - Math.cos(ang + 0.5) * hl, ey - Math.sin(ang + 0.5) * hl]], O(8003, { w: 6 }));
      label.arrow.setAttribute('d', d);
    } else label.arrow.setAttribute('d', '');
  }
  const camTf = (P, lt, dur, W, H, pk, def = 1.06) => {
    const Cm = P.cam || {}, u = progIO(lt, 0, Math.max(1, dur)), z = lerp(1, Cm.zoom ?? def, u) * (1 + 0.025 * pk);
    const fx = (Cm.focus ? Cm.focus[0] : 0.5) * W, fy = (Cm.focus ? Cm.focus[1] : 0.5) * H;
    return `translate(${f1(Math.sin(lt * 0.35) * 8)} ${f1(Math.cos(lt * 0.27) * 5)}) translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`;
  };

  // ================================================================ uyku_a_room
  SH.uyku_a_room = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, K = portrait ? 1 : 0.85;
      const sd = seed * 1000 + 41;
      const G = portrait ? 1140 : 920;
      const root = el(svg, 'g'), world = el(root, 'g');
      const wallR = mk(world, INK.inkSoft);
      const winSky = mk(world, NIGHT), winMoon = mk(world, INK.paperLight), winStars = mk(world, INK.paperLight), winR = mk(world), curtF = mk(world, INK.red, { 'fill-opacity': 0.75 }), curtR = mk(world);
      const doorF = mk(world, INK.paperDark), doorR = mk(world);
      const tallyF = mk(world, INK.paperLight), tallyR = mk(world), tallyM = mk(world), tallyRed = mk(world, INK.red), pin = mk(world, INK.red);
      const tallyHd = el(world, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 64 * K, 'text-anchor': 'middle', fill: INK.ink });
      const tallyN = el(world, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 120 * K, 'text-anchor': 'middle', fill: INK.red });
      const clockF = mk(world, INK.paperLight), clockR = mk(world);
      const posterF = mk(world, INK.paperLight), posterR = mk(world), posterB = mk(world, INK.blue);
      const posterT = el(world, 'text', { 'font-family': FR, 'font-weight': 800, 'font-size': 48 * K, 'text-anchor': 'middle', fill: INK.paperLight });
      const deskF = mk(world, INK.paperDark), deskR = mk(world), lampF = mk(world, INK.gold), lampR = mk(world), lampGlow = mk(world, INK.gold, { 'fill-opacity': 0.18 });
      const bedBack = mk(world, INK.paperDark), bedBackR = mk(world);
      const actorG = el(world, 'g');
      const bedF = mk(world, INK.paperLight), blanketF = mk(world, INK.blue, { 'fill-opacity': 0.85 }), bedR = mk(world), pillowF = mk(world, INK.paperLight), pillowR = mk(world);
      const floorR = mk(world, INK.inkSoft);
      const uiG = el(root, 'g');
      const castBehind = el(actorG, 'g'), castFront = el(world, 'g');
      // figures sitting on the bed are drawn in front of the mattress; others behind the bed's front
      const castAll = makeCast(P, castFront, seed, portrait, portrait ? 0.78 : 0.62);
      const label = makeLabel(P, uiG, portrait);
      const Wn = P.window === false ? null : Object.assign({ x: 0.16, y: 0.13, w: 0.17, h: 0.36, sky: 'night' }, P.window || {});
      const Tl = P.tally ? Object.assign({ x: 0.62, y: 0.12, n: 11, at: 0.2, dur: 2, red_last: true }, P.tally) : null;
      const Ck = P.clock === false ? null : Object.assign({ x: 0.42, y: 0.2, speed: 1 }, P.clock || {});
      const Bd = P.bed === false ? null : Object.assign({ x: 0.5, w: 0.34 }, P.bed || {});
      const Dk = P.desk ? Object.assign({ x: 0.8, poster: null }, P.desk) : null;
      const Dr = P.door ? Object.assign({ x: 0.04 }, P.door) : null;
      if (Tl) tallyHd.textContent = 'GÜN';
      if (Dk && Dk.poster) posterT.textContent = Dk.poster;
      const rs = rng(seed * 17 + 3), stars = Array.from({ length: 9 }, () => [rs(), rs(), rs()]);

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          world.setAttribute('transform', camTf(P, lt, dur, W, H, pk));
          // wall: rail + faint wallpaper stripes
          const RY = G - 150 * K;
          let wd = inkPath([[-40, RY], [W + 40, RY - 4]], O(1, { w: 4 }));
          for (let x = 60; x < W; x += 150 * K) wd += ' ' + inkPath([[x, 40], [x + 3, RY - 20]], O(2 + Math.round(x), { w: 2, amp: 1, opacity: 0.4 }));
          wallR.setAttribute('d', wd); wallR.setAttribute('fill-opacity', 0.55);
          // window
          if (Wn) {
            const x0 = Wn.x * W, y0 = Wn.y * H, ww = Wn.w * W, wh = Wn.h * H, rect = [[x0, y0], [x0 + ww, y0 - 2], [x0 + ww + 2, y0 + wh], [x0, y0 + wh + 2]];
            const day = Wn.sky === 'day';
            winSky.setAttribute('fill', day ? mix(INK.paperLight, INK.blue, 0.25) : NIGHT);
            winSky.setAttribute('d', inkLoop(rect, O(10, { smooth: false })));
            if (day) {
              const sx = x0 + ww * 0.62, sy = y0 + wh * 0.32, R = ww * 0.16;
              winMoon.setAttribute('fill', INK.gold);
              let sr = inkCircle(sx, sy, R, sd + 11, t, { fill: true });
              winMoon.setAttribute('d', sr);
              let rays = '';
              for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + t * 0.4, r0 = R * 1.3, r1 = R * 1.7; rays += inkPath([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * r1, sy + Math.sin(a) * r1]], O(12 + k, { w: 4 })) + ' '; }
              winStars.setAttribute('fill', INK.ink); winStars.setAttribute('d', rays);
            } else {
              const mx = x0 + ww * 0.66, my = y0 + wh * 0.28, R = ww * 0.15;
              winMoon.setAttribute('fill', INK.paperLight);
              const outer = inkEllipsePts(mx, my, R, R, sd + 11, 16), inner = inkEllipsePts(mx + R * 0.45, my - R * 0.2, R * 0.85, R * 0.85, sd + 12, 16);
              winMoon.setAttribute('d', inkLoop(outer, O(11, { amp: 1 })));
              let st = inkLoop(inner, O(12, { amp: 1 }));
              winStars.setAttribute('fill', NIGHT);
              // stars twinkle (drawn into the moon path group as paper dots)
              let sp = '';
              stars.forEach((s2, k) => { const tw = 0.6 + 0.4 * Math.sin(t * (2 + s2[2] * 3) + k); sp += inkDot(x0 + 16 + s2[0] * (ww - 32), y0 + 16 + s2[1] * (wh * 0.75), (3 + s2[2] * 3) * tw, (3 + s2[2] * 3) * tw, sd + 20 + k, t, 0.4) + ' '; });
              winStars.setAttribute('d', st);
              winMoon.setAttribute('d', inkLoop(outer, O(11, { amp: 1 })) + ' ' + sp);
            }
            winR.setAttribute('d', inkPath(rect, O(10, { w: 7, closed: true, smooth: false })) + ' ' + inkPath([[x0 + ww / 2, y0], [x0 + ww / 2 + 2, y0 + wh]], O(30, { w: 6 })) + ' ' + inkPath([[x0, y0 + wh / 2], [x0 + ww, y0 + wh / 2 - 2]], O(31, { w: 6 })) +
              ' ' + inkPath([[x0 - 30, y0 + wh + 12], [x0 + ww + 30, y0 + wh + 10]], O(32, { w: 9 })));
            const sw = Math.sin(t * 0.8) * 5;
            const cl = [[x0 - 34, y0 - 20], [x0 + ww * 0.2, y0 - 20], [x0 + ww * 0.12 + sw, y0 + wh * 0.5], [x0 + ww * 0.2 + sw, y0 + wh + 4], [x0 - 34, y0 + wh + 4]];
            const cr = [[x0 + ww + 34, y0 - 20], [x0 + ww * 0.8, y0 - 20], [x0 + ww * 0.88 - sw, y0 + wh * 0.5], [x0 + ww * 0.8 - sw, y0 + wh + 4], [x0 + ww + 34, y0 + wh + 4]];
            curtF.setAttribute('d', inkLoop(cl, O(33, { amp: 1.2 })) + ' ' + inkLoop(cr, O(34, { amp: 1.2 })));
            curtR.setAttribute('d', inkPath(cl, O(33, { w: 4.5, closed: true, amp: 1.2 })) + ' ' + inkPath(cr, O(34, { w: 4.5, closed: true, amp: 1.2 })) + ' ' + inkPath([[x0 - 50, y0 - 22], [x0 + ww + 50, y0 - 24]], O(35, { w: 7 })));
          }
          // door
          if (Dr) {
            const dx0 = Dr.x * W, dx1 = dx0 + 0.15 * W, dy0 = G - 470 * K, dp = [[dx0, G], [dx0, dy0], [dx1, dy0 - 4], [dx1, G]];
            doorF.setAttribute('d', inkLoop(dp, O(40, { smooth: false })));
            doorR.setAttribute('d', inkPath(dp, O(40, { w: 6, closed: true, smooth: false })) + ' ' + inkPath([[dx0 + 22, dy0 + 28], [dx1 - 22, dy0 + 26], [dx1 - 22, dy0 + 170 * K], [dx0 + 22, dy0 + 172 * K]], O(41, { w: 3.5, closed: true, smooth: false })) +
              ' ' + inkDot(dx1 - 28, (dy0 + G) / 2 + 20, 9, 9, sd + 42, t));
          }
          // day tally sheet
          if (Tl) {
            const tx = Tl.x * W, ty = Tl.y * H, tw2 = 470 * K, th = 300 * K;
            const sheet = [[tx - tw2 / 2, ty], [tx + tw2 / 2, ty + 6], [tx + tw2 / 2 - 4, ty + th], [tx - tw2 / 2 + 3, ty + th - 4]];
            tallyF.setAttribute('d', inkLoop(sheet, O(50, { smooth: false })));
            tallyR.setAttribute('d', inkPath(sheet, O(50, { w: 4.5, closed: true, smooth: false })));
            pin.setAttribute('d', inkDot(tx, ty + 14, 11, 11, sd + 51, t));
            tallyHd.setAttribute('x', tx - tw2 * 0.2); tallyHd.setAttribute('y', ty + 92 * K);
            const at = atOr(cues, Tl.at, 0.2), n = Tl.n, start = at < 0 ? -99 : at;
            let md = '', rd = '', shown = 0;
            const gw = 130 * K, sp2 = 24 * K, mx0 = tx - tw2 / 2 + 50 * K, gy = ty + 150 * K, mh = 110 * K;
            for (let i = 0; i < n; i++) {
              const p = prog(lt, start + i * Tl.dur / n, 0.12);
              if (p <= 0.01) continue;
              shown = i + 1;
              const g2 = Math.floor(i / 5), j = i % 5, gx = mx0 + g2 * gw;
              const a = j < 4 ? [gx + j * sp2, gy] : [gx - 14, gy + mh * 0.75];
              const b = j < 4 ? [gx + j * sp2 + 3, gy + mh] : [gx + 3 * sp2 + 16, gy + mh * 0.2];
              const e = [lerp(a[0], b[0], p), lerp(a[1], b[1], p)];
              const dd = inkPath([a, e], O(60 + i, { w: 8, amp: 1 }));
              if (Tl.red_last && i === n - 1) rd += dd + ' '; else md += dd + ' ';
            }
            tallyM.setAttribute('d', md); tallyRed.setAttribute('d', rd);
            tallyN.textContent = String(Math.max(shown, at < 0 ? n : 0));
            const pn = shown ? punch(lt, start + (shown - 1) * Tl.dur / n, 0.4) : 0;
            tallyN.setAttribute('x', tx + tw2 * 0.28); tallyN.setAttribute('y', ty + 104 * K);
            tallyN.setAttribute('transform', around(tx + tw2 * 0.28, ty + 70 * K, `scale(${(1 + 0.25 * pn).toFixed(3)})`));
            tallyN.setAttribute('opacity', shown ? 1 : 0);
          }
          // wall clock: hands race (hours fly by)
          if (Ck) {
            const ckx = Ck.x * W, cky = Ck.y * H, ckr = 70 * K;
            clockF.setAttribute('d', inkCircle(ckx, cky, ckr, sd + 70, t, { fill: true }));
            let cr = inkCircle(ckx, cky, ckr, sd + 70, t, { w: 6 });
            for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; cr += ' ' + inkPath([[ckx + Math.cos(a) * ckr * 0.76, cky + Math.sin(a) * ckr * 0.76], [ckx + Math.cos(a) * ckr * 0.9, cky + Math.sin(a) * ckr * 0.9]], O(71 + i, { w: 3, amp: 0.6 })); }
            const hrs = 2 + lt * Ck.speed, ma = (hrs % 1) * 6.283 - 1.5708, ha = (hrs / 12 % 1) * 6.283 - 1.5708;
            cr += ' ' + inkPath([[ckx, cky], [ckx + Math.cos(ma) * ckr * 0.72, cky + Math.sin(ma) * ckr * 0.72]], O(85, { w: 5, amp: 0.5 }));
            cr += ' ' + inkPath([[ckx, cky], [ckx + Math.cos(ha) * ckr * 0.45, cky + Math.sin(ha) * ckr * 0.45]], O(86, { w: 8, amp: 0.5 }));
            clockR.setAttribute('d', cr);
          }
          // desk + lamp + poster
          if (Dk) {
            const dx = Dk.x * W, dw = 0.2 * W, dy = G - 230 * K;
            const top = [[dx - dw / 2, dy], [dx + dw / 2, dy - 3], [dx + dw / 2, dy + 26 * K], [dx - dw / 2, dy + 28 * K]];
            deskF.setAttribute('d', inkLoop(top, O(90, { smooth: false })));
            let dd = inkPath(top, O(90, { w: 6, closed: true, smooth: false }));
            for (const lx of [dx - dw / 2 + 20, dx + dw / 2 - 20]) dd += ' ' + inkPath([[lx, dy + 28 * K], [lx + 2, G]], O(91 + Math.round(lx), { w: 9 }));
            const bk = [[dx - dw * 0.3, dy], [dx - dw * 0.3, dy - 40 * K], [dx - dw * 0.05, dy - 42 * K], [dx - dw * 0.05, dy]];
            dd += ' ' + inkPath(bk, O(93, { w: 4, closed: true, smooth: false })) + ' ' + inkPath([[dx - dw * 0.3, dy - 20 * K], [dx - dw * 0.05, dy - 21 * K]], O(94, { w: 3 }));
            deskR.setAttribute('d', dd);
            const lx = dx + dw * 0.3, ly = dy;
            const shade = [[lx - 50 * K, ly - 150 * K], [lx + 10 * K, ly - 190 * K], [lx + 40 * K, ly - 150 * K]];
            lampF.setAttribute('d', inkLoop(shade, O(95, { smooth: false })));
            lampR.setAttribute('d', inkPath(shade, O(95, { w: 5, closed: true, smooth: false })) + ' ' + inkPath([[lx, ly], [lx - 20 * K, ly - 80 * K], [lx, ly - 160 * K]], O(96, { w: 6 })) + ' ' + inkPath([[lx - 30 * K, ly], [lx + 30 * K, ly - 1]], O(97, { w: 8 })));
            const gl = 1 + 0.05 * Math.sin(t * 3);
            lampGlow.setAttribute('d', inkLoop([[lx - 50 * K, ly - 150 * K], [lx + 40 * K, ly - 150 * K], [lx + 120 * K * gl, ly], [lx - 150 * K * gl, ly]], O(98, { amp: 1 })));
            if (Dk.poster) {
              const px = dx - dw * 0.05, py = dy - 470 * K, pw = 330 * K, ph = 190 * K;
              const pp = [[px - pw / 2, py], [px + pw / 2, py - 4], [px + pw / 2 + 3, py + ph], [px - pw / 2, py + ph + 3]];
              const band = [[px - pw / 2 + 14, py + 40 * K], [px + pw / 2 - 14, py + 38 * K], [px + pw / 2 - 14, py + 112 * K], [px - pw / 2 + 14, py + 114 * K]];
              posterF.setAttribute('d', inkLoop(pp, O(100, { smooth: false })));
              posterB.setAttribute('d', inkLoop(band, O(101, { smooth: false })));
              let pr = inkPath(pp, O(100, { w: 4.5, closed: true, smooth: false })) + ' ' + inkDot(px - pw / 2 + 14, py + 12, 8, 8, sd + 102, t) + ' ' + inkDot(px + pw / 2 - 14, py + 10, 8, 8, sd + 103, t);
              for (let k = 0; k < 2; k++) pr += ' ' + inkPath([[px - pw * 0.35, py + (140 + k * 22) * K], [px + pw * (0.3 - k * 0.2), py + (139 + k * 22) * K]], O(104 + k, { w: 3, amp: 0.6 }));
              posterR.setAttribute('d', pr);
              posterT.setAttribute('x', px); posterT.setAttribute('y', py + 92 * K);
              fitText(posterT, pw - 50);
            }
          }
          // bed: headboard behind, mattress + blanket in front of the legs
          if (Bd) {
            const bx = Bd.x * W, bw = Bd.w * W, x0 = bx - bw / 2, x1 = bx + bw / 2;
            const top = G - 132 * K, bot = G - 40 * K;
            const hb = [[x0 - 10, G], [x0 - 10, top - 170 * K], [x0 + 26 * K, top - 186 * K], [x0 + 40 * K, top - 160 * K], [x0 + 40 * K, G]];
            bedBack.setAttribute('d', inkLoop(hb, O(110, { smooth: false })));
            bedBackR.setAttribute('d', inkPath(hb, O(110, { w: 6, closed: true, smooth: false })));
            const mat = [[x0 + 30 * K, top], [x1, top + 4], [x1 + 6, bot], [x0 + 30 * K, bot]];
            const blank = [[x0 + bw * 0.38, top - 6], [x1 + 4, top - 2], [x1 + 14, bot + 10], [x0 + bw * 0.4, bot + 12], [x0 + bw * 0.36 - 6, (top + bot) / 2]];
            bedF.setAttribute('d', inkLoop(mat, O(111, { smooth: false })));
            blanketF.setAttribute('d', inkLoop(blank, O(112, { amp: 1.2 })));
            let br = inkPath(mat, O(111, { w: 6, closed: true, smooth: false })) + ' ' + inkPath(blank, O(112, { w: 5, closed: true, amp: 1.2 }));
            for (let k = 0; k < 3; k++) br += ' ' + inkPath([[x0 + bw * (0.5 + k * 0.15), top + 6], [x0 + bw * (0.48 + k * 0.15), bot + 6]], O(113 + k, { w: 3, amp: 0.8 }));
            br += ' ' + inkPath([[x1 - 10, bot], [x1 - 8, G]], O(117, { w: 9 })) + ' ' + inkPath([[x0 + 44 * K, bot], [x0 + 46 * K, G]], O(118, { w: 9 }));
            bedR.setAttribute('d', br);
            const pl = inkEllipsePts(x0 + 110 * K, top - 22 * K, 70 * K, 28 * K, sd + 119, 12);
            pillowF.setAttribute('d', inkLoop(pl, O(119, { amp: 1 })));
            pillowR.setAttribute('d', inkPath(pl, O(119, { w: 5, closed: true, amp: 1 })));
          }
          // floor
          let fd = inkPath([[-40, G + 6], [W + 40, G + 2]], O(130, { w: 5 }));
          for (let i = 0; i < 7; i++) fd += ' ' + inkPath([[W * (0.03 + i * 0.15), G + 20], [W * (0.1 + i * 0.15), G + 20]], O(131 + i, { w: 3, amp: 1 }));
          floorR.setAttribute('d', fd);
          updateCast(castAll, lt, t, dur, cues, W, H, G, sd + 9000);
          updateLabel(label, lt, t, cues, W, H, sd, portrait);
        },
      };
    },
  };
  function fitText(node, maxW) {
    let fs = parseFloat(node.getAttribute('font-size'));
    while (fs > 30 && node.getComputedTextLength && node.getComputedTextLength() > maxW) { fs -= 2; node.setAttribute('font-size', fs); }
  }
  const around = (x, y, tf) => `translate(${f1(x)} ${f1(y)}) ${tf} translate(${f1(-x)} ${f1(-y)})`;

  // ================================================================ uyku_a_brain
  SH.uyku_a_brain = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W;
      const sd = seed * 1000 + 83;
      const CX = (P.cx ?? 0.4) * W, CY = (P.cy ?? 0.47) * H, R = (P.r ?? 0.3) * H;
      const U = (u, v) => [CX + u * R, CY + v * R];
      const root = el(svg, 'g'), world = el(root, 'g');
      const headF = mk(world, INK.paperLight), brainF = mk(world, mix(INK.paperLight, INK.red, 0.12)), lobeF = mk(world, INK.gold), glow = mk(world, INK.gold, { 'fill-opacity': 0.2 });
      const folds = mk(world, INK.inkSoft), headR = mk(world), brainR = mk(world), sulc = mk(world);
      const brakeF = mk(world, INK.red), brakeR = mk(world);
      const actorG = el(world, 'g'), uiG = el(root, 'g');
      const cast = makeCast(P, actorG, seed, portrait, portrait ? 0.78 : 0.6);
      const label = makeLabel(P, uiG, portrait);
      // profile head facing right (unit = R): skull, forehead, nose, lips, chin, neck
      const head = [[-0.95, 0.1], [-0.98, -0.3], [-0.82, -0.68], [-0.45, -0.95], [0.05, -1.02], [0.5, -0.88], [0.8, -0.55], [0.9, -0.2],
        [0.92, 0.0], [1.08, 0.18], [0.95, 0.27], [0.97, 0.38], [1.02, 0.44], [0.96, 0.52], [0.98, 0.58], [0.9, 0.7], [0.66, 0.78], [0.46, 0.76],
        [0.36, 1.1], [-0.3, 1.1], [-0.36, 0.7], [-0.7, 0.52], [-0.9, 0.36]];
      const bcx = -0.04, bcy = -0.42, brx = 0.78, bry = 0.46;
      const brain = Array.from({ length: 28 }, (_, i) => { const a = i / 28 * 6.283, k = 1 + 0.04 * Math.sin(i * 2.7); return [bcx + Math.cos(a) * brx * k, bcy + Math.sin(a) * bry * k * (Math.sin(a) > 0 ? 0.85 : 1)]; });
      // frontal lobe: the front arc from the top (-100°) to the lower front (+40°), closed by the central sulcus
      const arc = []; for (let i = 0; i <= 14; i++) { const a = (-100 + i * 10) * Math.PI / 180; arc.push([bcx + Math.cos(a) * brx * 0.995, bcy + Math.sin(a) * bry * 0.99 * (Math.sin(a) > 0 ? 0.85 : 1)]); }
      const sulcus = [arc[arc.length - 1], [bcx + 0.18, bcy + 0.14], [bcx + 0.06, bcy - 0.12], [bcx + 0.04, bcy - 0.3], arc[0]];
      const lobe = arc.concat(sulcus.slice(1, -1));
      const rr = rng(seed * 13 + 5);
      const foldL = Array.from({ length: 9 }, () => { const u = bcx + (rr() - 0.5) * brx * 1.5, v = bcy + (rr() - 0.5) * bry * 1.2; return Array.from({ length: 4 }, (_, k) => [u + k * 0.07 + (rr() - 0.5) * 0.04, v + Math.sin(k * 1.9 + rr() * 3) * 0.05]); });
      const BR = P.brake ? true : false;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.6 }, x);
          const hitAt = atOr(cues, 'hit', null), pk = punch(lt, hitAt, 0.6);
          world.setAttribute('transform', camTf(P, lt, dur, W, H, pk, P.cam && P.cam.zoom != null ? P.cam.zoom : 1.05));
          const Hp = pts => pts.map(q => U(q[0], q[1]));
          headF.setAttribute('d', inkLoop(Hp(head), O(1, { amp: 1.2 })));
          headR.setAttribute('d', inkPath(Hp(head), O(1, { w: 7, closed: true, amp: 1.2 })));
          brainF.setAttribute('d', inkLoop(Hp(brain), O(2, { amp: 1.2 })));
          brainR.setAttribute('d', inkPath(Hp(brain), O(2, { w: 6, closed: true, amp: 1.2 })));
          let fd = '';
          foldL.forEach((f, k) => { fd += inkPath(Hp(f), O(10 + k, { w: 4, amp: 1 })) + ' '; });
          folds.setAttribute('d', fd);
          // lobe glow -> dim + flicker
          const ga = atOr(cues, P.glow_at ?? 'glow', 0.2), da = P.dim === false ? null : atOr(cues, P.dim ?? 'dim', null);
          const on = prog(lt, ga, 0.6);
          let lvl = on;
          if (da != null && lt >= da) {
            const k = sm((lt - da) / 1.6), fl = (Math.floor(t * 8) % 3 === 0 ? 0.25 : 0) * (1 - k) + (hn(Math.floor(t * 8)) > 0.7 ? 0.15 : 0) * k;
            lvl = lerp(1, 0.18, k) + fl;
          }
          lobeF.setAttribute('fill', mix(INK.paperDark, INK.gold, clamp01(lvl)));
          lobeF.setAttribute('d', inkLoop(Hp(lobe), O(3, { amp: 1.2 })));
          sulc.setAttribute('d', inkPath(Hp(sulcus), O(4, { w: 6, amp: 1.2 })));
          const gr = 1 + 0.06 * Math.sin(t * 3);
          const gpts = lobe.map(q => { const c0 = [bcx + 0.45, bcy - 0.1]; return [c0[0] + (q[0] - c0[0]) * 1.25 * gr, c0[1] + (q[1] - c0[1]) * 1.25 * gr]; });
          glow.setAttribute('d', inkLoop(Hp(gpts), O(5, { amp: 2 })));
          glow.setAttribute('fill-opacity', (0.22 * clamp01(lvl)).toFixed(3));
          // brake pedal icon (the brain's "brake")
          if (BR) {
            const ba = atOr(cues, P.brake, null);
            if (ba == null || lt < ba) { brakeF.setAttribute('d', ''); brakeR.setAttribute('d', ''); }
            else {
              const sp = spring(lt, ba, 0.6), c = U(0.95, -0.95), s = 60 * sp;
              const pad = [[c[0] - s, c[1] - s * 0.5], [c[0] + s, c[1] - s * 0.7], [c[0] + s * 1.05, c[1] + s * 0.35], [c[0] - s * 0.95, c[1] + s * 0.5]];
              brakeF.setAttribute('d', inkLoop(pad, O(30, { smooth: false })));
              let bd = inkPath(pad, O(30, { w: 5, closed: true, smooth: false }));
              for (let k = 0; k < 3; k++) bd += ' ' + inkPath([[c[0] - s * 0.6, c[1] - s * (0.3 - k * 0.3)], [c[0] + s * 0.6, c[1] - s * (0.42 - k * 0.3)]], O(31 + k, { w: 3 }));
              bd += ' ' + inkPath([[c[0], c[1] + s * 0.45], [c[0] - s * 0.3, c[1] + s * 1.6]], O(34, { w: 8 }));
              brakeR.setAttribute('d', bd);
            }
          }
          updateCast(cast, lt, t, dur, cues, W, H, portrait ? 1140 : 920, sd + 9000);
          updateLabel(label, lt, t, cues, W, H, sd, portrait);
        },
      };
    },
  };
  const hn = a => { const v = Math.sin(a * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); };
})();
