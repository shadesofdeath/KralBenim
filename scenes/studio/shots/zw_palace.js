// zw_palace: a waterfront palace shelled from the bay, in parchment ink (theme "parchment", brand/kit/BRAND.md §3, §5).
// Written for the Anglo-Zanzibar War (27 August 1896), parametric for any harbour bombardment. Every line boils at
// 8 Hz via _ink.js; everything is a pure function of (seed, lt), no Math.random.
// Far plane: a wide three-storey palace with verandas, arches and a central clock tower (the tower clock shows the
// scene time), a flagpole with a red flag on the roof (lowered on a cue). Mid plane: the bay. Front: warships
// (grey ink cruisers with two funnels and masts) firing broadsides (gold muzzle flash, smoke puff, a shell arcing to
// the palace, a blast where it lands), an optional royal yacht (light hull, one funnel, red pennant) that is hit and
// sinks behind the front water band. Palace fire (red/gold tongues) + smoke columns, a big pocket clock in the sky
// (hands sweep from `from` to `to`, digital time under it), a hand-written label, Kaşif on a foreground ledge.
// P: {
//   palace: {x: 0.5, w: 0.78, base: 0.41 (0..1 H), floor: 108 (px per storey), floors: 3},
//   time: {from: "9:00", to: "9:02", at: cue|s, dur: 1.2} (tower + big clock),
//   clock: {x: 0.8, y: 0.17, r: 118, at, text: true} | false (big clock in the sky),
//   flag: {down: cue (slides down the pole), dur: 1.4} | true | false,
//   fire: cue|seconds (palace starts burning; negative = already burning) | false,
//   ships: [{kind: "cruiser"|"yacht", x: 0.6 (centre), y: 0.53 (waterline, 0..1 H), scale: 1, face: -1 (bow to the
//           left), fire: cue|s (starts firing), every: 0.7 (s between shots), target: [0.5, 0.33] (0..1 frame),
//           hit: cue (yacht: shell lands on it, smoke), sink: cue (goes down), sink_dur: 2.4, depth: 0 (0..1 far)}],
//   ledge: {side: "left", w: 0.4, y: 0.6} | false (foreground rock the cast stands on),
//   label: {text, x: 0.5, y: 0.2, at, size: 96, color: "red"|"ink"},
//   kasif: {x: 0.16, y: 0.6, scale: 0.7, pose: "look", face: "right", at, then, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//   shake: cue, cam: {z0: 1, zoom: 1.06, focus: [0.5, 0.4]}
// }
// cues: time.at, clock.at, flag.down, fire, ships[].fire/hit/sink, label.at, kasif at/seq, shake, hit (punch).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10, 'up-left': 40, 'up-right': 40 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const FR = 'Fraunces, Georgia, serif';
  const toMin = s => { if (typeof s === 'number') return s; const m = String(s || '9:00').split(':'); return (+m[0]) * 60 + (+m[1] || 0); };
  const fmtT = m => { m = Math.round(m); const h = Math.floor(m / 60), mm = m % 60; return h + ':' + (mm < 10 ? '0' : '') + mm; };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const circ = (cx, cy, r, n = 12) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.2832) * r, cy + Math.sin(i / n * 6.2832) * r]);
  function tongue(cx, by, w, h, sway) {
    return [[cx - w / 2, by], [cx - w * 0.46, by - h * 0.3], [cx - w * 0.22 + sway * 0.45, by - h * 0.66], [cx + sway, by - h],
      [cx + w * 0.2 + sway * 0.5, by - h * 0.58], [cx + w * 0.44 + sway * 0.15, by - h * 0.28], [cx + w / 2, by]];
  }

  SH.zw_palace = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const portrait = H > W, sd = seed * 1000 + 377;
      const S = portrait ? W / 1080 : H / 1080;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = n => inkEl(cam, n.fill, n.extra || {});
      const lay = {
        smokeBack: L({ fill: INK.inkSoft, extra: { 'fill-opacity': 0.24 } }),
        palF: L({ fill: INK.paperLight }), palD: L({ fill: INK.paperDark }), palI: L({ fill: INK.ink }),
        flagR: L({ fill: INK.red }), flagI: L({ fill: INK.ink }),
        fireR: L({ fill: INK.red }), fireG: L({ fill: INK.gold }),
        bayF: L({ fill: INK.paperDark, extra: { 'fill-opacity': 0.55 } }), bayI: L({ fill: INK.blue, extra: { 'fill-opacity': 0.7 } }),
        shipF: L({ fill: INK.paperDark }), shipL: L({ fill: INK.paperLight }), shipI: L({ fill: INK.ink }), shipR: L({ fill: INK.red }),
        frontF: L({ fill: INK.paper }), frontI: L({ fill: INK.blue, extra: { 'fill-opacity': 0.75 } }),
        splash: L({ fill: INK.paperLight }), splashI: L({ fill: INK.blue }),
        puff: L({ fill: INK.paperLight }), puffI: L({ fill: INK.inkSoft }),
        smokeFront: L({ fill: INK.inkSoft, extra: { 'fill-opacity': 0.3 } }),
        shell: L({ fill: INK.ink }), blastG: L({ fill: INK.gold }), blastR: L({ fill: INK.red }),
        ledgeF: L({ fill: INK.paperDark }), ledgeI: L({ fill: INK.ink }),
      };
      const castG = el(cam, 'g');
      const clockG = el(root, 'g');
      const ck = { face: inkEl(clockG, INK.paperLight), ink: inkEl(clockG, INK.ink), red: inkEl(clockG, INK.red) };
      const ckText = el(clockG, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.red,
        style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 10px; stroke-linejoin: round` });

      // ---- palace geometry
      const PA = Object.assign({ x: 0.5, w: 0.78, base: portrait ? 0.41 : 0.5, floor: 108, floors: 3 }, P.palace || {});
      const pcx = PA.x * W, pw = PA.w * W, px0 = pcx - pw / 2, px1 = pcx + pw / 2, pby = PA.base * H;
      const fh = PA.floor * S, nf = PA.floors, ptop = pby - fh * nf;
      const tw = 150 * S, tTop = ptop - 190 * S, tcy = ptop - 95 * S, tcr = 46 * S;
      const flagX = px0 + pw * 0.2, flagTop = ptop - 210 * S;
      const FL = P.flag === false ? null : Object.assign({ dur: 1.4 }, P.flag === true ? {} : (P.flag || {}));
      const cols = Math.max(6, Math.round(pw / (64 * S)));

      // ---- ships
      const ships = (P.ships || []).map((s, i) => Object.assign({ kind: 'cruiser', x: 0.6, y: portrait ? 0.53 : 0.75, scale: 1, face: -1, every: 0.7, depth: 0, sink_dur: 2.4, i }, s));
      const WL = Math.max(...ships.map(s => s.y * H), (portrait ? 0.53 : 0.75) * H);   // front water band top
      const LD = P.ledge === false ? null : Object.assign({ side: 'left', w: 0.4, y: portrait ? 0.6 : 0.86 }, P.ledge || {});

      // fire anchors on the palace (fixed per seed)
      const r0 = rng(sd + 11);
      const fires = Array.from({ length: 9 }, (_, k) => ({ x: lerp(px0 + 40 * S, px1 - 40 * S, (k + 0.5) / 9 + (r0() - 0.5) * 0.05),
        y: k % 3 === 0 ? ptop + 4 : ptop + fh * (1 + (k % 2)) + 4, s: 0.7 + r0() * 0.6, d: r0() * 0.9 }));

      // ---- Kaşif
      const K = P.kasif === false || P.kasif == null ? null : Object.assign({ x: 0.16, y: LD ? LD.y : 0.6, scale: portrait ? 0.7 : 0.55, pose: 'look', face: 'right' }, P.kasif);
      const kas = K && typeof KASIF !== 'undefined' ? KASIF.create(el(castG, 'g'), { scale: K.scale * S, hat: true, seed: sd + 5 }) : null;

      // ---- label
      let label = null;
      if (P.label && P.label.text) {
        const Lb = P.label, size = (Lb.size || (portrait ? 96 : 80)) * S, g = el(root, 'g');
        const tx = el(g, 'text', { 'font-family': INK_FONT, 'font-size': size, 'text-anchor': 'middle', fill: Lb.color === 'ink' ? INK.ink : INK.red,
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px; stroke-linejoin: round` });
        tx.textContent = Lb.text;
        label = { Lb, g, tx };
      }

      function shipShape(s, cx, wy, k, face, A) {   // pushes into A {F, Li, I, R}; hull bottom a bit below wy
        const X = u => cx + u * k * face, Y = v => wy + v * k;
        if (s.kind === 'yacht') {
          A.Li.push(inkLoop([[X(-170), Y(-34)], [X(150), Y(-34)], [X(200), Y(-46)], [X(150), Y(18)], [X(-150), Y(18)], [X(-175), Y(-10)]], A.o(1)));
          A.I.push(inkPath([[X(-170), Y(-34)], [X(150), Y(-34)], [X(200), Y(-46)], [X(150), Y(18)], [X(-150), Y(18)], [X(-175), Y(-10)]], A.o(2, { closed: true, w: 5 * k })));
          A.Li.push(inkLoop(rect(X(-80), Y(-34), X(60), Y(-70)), A.o(3)));
          A.I.push(inkPath(rect(X(-80), Y(-34), X(60), Y(-70)), A.o(4, { closed: true, w: 4 * k, smooth: false })));
          A.F.push(inkLoop(rect(X(-20), Y(-70), X(10), Y(-130)), A.o(5)));
          A.I.push(inkPath(rect(X(-20), Y(-70), X(10), Y(-130)), A.o(6, { closed: true, w: 4 * k, smooth: false })));
          A.I.push(inkPath([[X(100), Y(-34)], [X(104), Y(-190)]], A.o(7, { w: 4 * k })));
          A.I.push(inkPath([[X(-120), Y(-34)], [X(-116), Y(-170)]], A.o(8, { w: 4 * k })));
          A.R.push(inkLoop([[X(-116), Y(-170)], [X(-116 - 70), Y(-160)], [X(-116), Y(-146)]], A.o(9)));
          A.I.push(inkPath([[X(-150), Y(-6)], [X(140), Y(-6)]], A.o(10, { w: 3 * k })));
          return;
        }
        const hull = [[X(-230), Y(-30)], [X(200), Y(-30)], [X(240), Y(-40)], [X(205), Y(20)], [X(-215), Y(20)], [X(-240), Y(-22)]];
        A.F.push(inkLoop(hull, A.o(1)));
        A.I.push(inkPath(hull, A.o(2, { closed: true, w: 6 * k })));
        const sup = [[X(-120), Y(-30)], [X(110), Y(-30)], [X(100), Y(-74)], [X(-110), Y(-74)]];
        A.Li.push(inkLoop(sup, A.o(3)));
        A.I.push(inkPath(sup, A.o(4, { closed: true, w: 4 * k, smooth: false })));
        [[-40, 140], [30, 150]].forEach(([u, h], j) => {
          const f = rect(X(u - 18), Y(-74), X(u + 18), Y(-74 - h * 0.62));
          A.F.push(inkLoop(f, A.o(11 + j)));
          A.I.push(inkPath(f, A.o(13 + j, { closed: true, w: 4 * k, smooth: false })));
          A.I.push(inkPath([[X(u - 20), Y(-74 - h * 0.5)], [X(u + 20), Y(-74 - h * 0.5)]], A.o(15 + j, { w: 4 * k })));
        });
        A.I.push(inkPath([[X(150), Y(-30)], [X(154), Y(-200)]], A.o(17, { w: 4 * k })));
        A.I.push(inkPath([[X(-170), Y(-30)], [X(-166), Y(-180)]], A.o(18, { w: 4 * k })));
        A.I.push(inkPath([[X(130), Y(-160)], [X(178), Y(-160)]], A.o(19, { w: 3 * k })));
        A.I.push(inkPath([[X(150), Y(-50)], [X(232), Y(-60)]], A.o(20, { w: 9 * k })));   // fore gun
        A.I.push(inkPath([[X(-160), Y(-50)], [X(-238), Y(-56)]], A.o(21, { w: 8 * k })));  // aft gun
        A.I.push(inkPath([[X(-200), Y(-8)], [X(195), Y(-8)]], A.o(22, { w: 3 * k })));
        for (let p = 0; p < 6; p++) A.I.push(inkDot(X(-150 + p * 58), Y(4), 5 * k, 5 * k, A.sd + 30 + p, A.t));
        // small white ensign at the stern
        A.Li.push(inkLoop(rect(X(-166), Y(-180), X(-166 - 50 * 1), Y(-150)), A.o(23)));
        A.R.push(inkPath([[X(-166), Y(-165)], [X(-216), Y(-165)]], A.o(24, { w: 6 * k })));
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const o = (base) => (n, extra = {}) => Object.assign({ seed: base + n, t, amp: 1.4, w: 5 * S }, extra);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          // camera
          const C = Object.assign({ z0: 1, zoom: 1.06, focus: [0.5, portrait ? 0.4 : 0.5] }, P.cam || {});
          const shA = atOr(cues, P.shake, null), shk = shA == null ? 0 : punch(lt, shA, 0.7);
          const sb = boil(sd + 99, t, 14 * shk);
          const z = lerp(C.z0, C.zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
          const fx = C.focus[0] * W, fy = C.focus[1] * H;
          cam.setAttribute('transform', `translate(${f1(fx + sb[0])} ${f1(fy + sb[1])}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);

          // time
          const TM = Object.assign({ from: '9:00', to: '9:00', dur: 1.2 }, P.time || {});
          const ta = atOr(cues, TM.at, 0.3), mins = lerp(toMin(TM.from), toMin(TM.to), progIO(lt, ta, TM.dur));

          // ---- palace
          const pal = { F: [], D: [], I: [] }, po = o(sd + 100);
          pal.F.push(inkLoop(rect(px0, ptop, px1, pby), po(1, { smooth: false })));
          pal.I.push(inkPath(rect(px0, ptop, px1, pby), po(2, { closed: true, smooth: false, w: 6 * S })));
          for (let f = 1; f < nf; f++) pal.I.push(inkPath([[px0 - 14 * S, ptop + fh * f], [px1 + 14 * S, ptop + fh * f]], po(10 + f, { w: 6 * S })));
          pal.I.push(inkPath([[px0 - 22 * S, ptop], [px1 + 22 * S, ptop]], po(9, { w: 9 * S })));
          for (let f = 0; f < nf; f++) {
            const y0 = ptop + fh * f, y1 = y0 + fh;
            for (let c = 0; c < cols; c++) {
              const xa = lerp(px0, px1, c / cols) + 10 * S, xb = lerp(px0, px1, (c + 1) / cols) - 10 * S, xm = (xa + xb) / 2;
              const ah = (xb - xa) / 2, top = y0 + 16 * S + ah;
              const arch = [[xa, y1 - 6 * S], [xa, top], [xa + ah * 0.3, top - ah * 0.7], [xm, top - ah], [xb - ah * 0.3, top - ah * 0.7], [xb, top], [xb, y1 - 6 * S]];
              pal.D.push(inkLoop(arch, po(20 + f * 40 + c, { amp: 0.8 })));
              pal.I.push(inkPath(arch, po(200 + f * 40 + c, { w: 3.4 * S, amp: 0.8 })));
            }
            pal.I.push(inkPath([[px0, y1 - 26 * S], [px1, y1 - 26 * S]], po(400 + f, { w: 3 * S })));   // veranda rail
          }
          // clock tower
          const tx0 = pcx - tw / 2, tx1 = pcx + tw / 2;
          pal.F.push(inkLoop(rect(tx0, tTop + 40 * S, tx1, ptop), po(500, { smooth: false })));
          pal.I.push(inkPath(rect(tx0, tTop + 40 * S, tx1, ptop), po(501, { closed: true, smooth: false, w: 6 * S })));
          const roofT = [[tx0 - 16 * S, tTop + 40 * S], [pcx, tTop - 40 * S], [tx1 + 16 * S, tTop + 40 * S]];
          pal.D.push(inkLoop(roofT, po(502)));
          pal.I.push(inkPath(roofT, po(503, { closed: true, w: 5 * S, smooth: false })));
          pal.F.push(inkLoop(circ(pcx, tcy, tcr, 14), po(504, { amp: 0.6 })));
          pal.I.push(inkPath(circ(pcx, tcy, tcr, 14), po(505, { closed: true, w: 5 * S, amp: 0.6 })));
          {
            const ma = (mins % 60) / 60 * 6.2832 - 1.5708, ha = ((mins / 60) % 12) / 12 * 6.2832 - 1.5708;
            pal.I.push(inkPath([[pcx, tcy], [pcx + Math.cos(ha) * tcr * 0.5, tcy + Math.sin(ha) * tcr * 0.5]], po(506, { w: 6 * S, amp: 0.5 })));
            pal.I.push(inkPath([[pcx, tcy], [pcx + Math.cos(ma) * tcr * 0.82, tcy + Math.sin(ma) * tcr * 0.82]], po(507, { w: 4 * S, amp: 0.5 })));
          }
          // flagpole + flag
          const fl = { R: [], I: [] };
          if (FL) {
            fl.I.push(inkPath([[flagX, ptop], [flagX, flagTop]], po(600, { w: 6 * S })));
            const da = atOr(cues, FL.down, null), dp = da == null ? 0 : progIO(lt, da, FL.dur);
            const fy0 = lerp(flagTop + 8 * S, ptop - 70 * S, dp), wv = Math.sin(lt * 5) * 10 * S * (1 - dp * 0.8);
            const fw = 130 * S, fhh = 80 * S;
            const flag = [[flagX, fy0], [flagX + fw * 0.5, fy0 + wv * 0.6], [flagX + fw, fy0 + wv], [flagX + fw, fy0 + fhh + wv], [flagX + fw * 0.5, fy0 + fhh + wv * 0.4], [flagX, fy0 + fhh]];
            if (dp < 0.995) {
              fl.R.push(inkLoop(flag, po(601)));
              fl.I.push(inkPath(flag, po(602, { closed: true, w: 4 * S })));
            }
          }
          lay.palF.setAttribute('d', pal.F.join(' '));
          lay.palD.setAttribute('d', pal.D.join(' '));
          lay.palI.setAttribute('d', pal.I.join(' '));
          lay.flagR.setAttribute('d', fl.R.join(' '));
          lay.flagI.setAttribute('d', fl.I.join(' '));

          // ---- palace fire + smoke
          const fa = P.fire === false || P.fire == null ? null : atOr(cues, P.fire, 0.3);
          const FR_ = [], FG = [], SM = [];
          if (fa != null) {
            fires.forEach((f, k) => {
              const g = clamp01((lt - fa - f.d) / 1.2);
              if (g <= 0) return;
              const h = 120 * S * f.s * sm(g), w = 70 * S * f.s * (0.6 + 0.4 * sm(g));
              const sw = Math.sin(lt * 7 + k) * 14 * S;
              FR_.push(inkLoop(tongue(f.x, f.y, w, h * (1 + 0.12 * Math.sin(lt * 9 + k * 2)), sw), { seed: sd + 700 + k, t, amp: 2 }));
              FG.push(inkLoop(tongue(f.x, f.y, w * 0.5, h * 0.55, sw * 0.6), { seed: sd + 740 + k, t, amp: 1.5 }));
              if (k % 2 === 0) for (let j = 0; j < 7; j++) {
                const ph = ((lt - fa) * 0.32 + j / 7 + k * 0.13) % 1;
                const sy = f.y - h - ph * 520 * S, sx = f.x + ph * 120 * S + Math.sin(ph * 6 + k) * 20 * S, sr = (34 + ph * 60) * S * sm(g) * (1 - ph * 0.35);
                if (sy > 40) SM.push(inkLoop(circ(sx, sy, sr, 10), { seed: sd + 800 + k * 8 + j, t, amp: 3 }));
              }
            });
          }
          lay.fireR.setAttribute('d', FR_.join(' '));
          lay.fireG.setAttribute('d', FG.join(' '));

          // ---- bay (between shore and the front band)
          const bay = [], bayI = [];
          bay.push(inkLoop(rect(-60, pby, W + 60, WL + 20), { seed: sd + 900, t, amp: 1, smooth: false }));
          bayI.push(inkPath([[-40, pby], [W + 40, pby]], { seed: sd + 901, t, w: 5 * S }));
          for (let r = 0; r < 4; r++) {
            const y = lerp(pby + 40 * S, WL - 20 * S, r / 3), off = ((lt * 18 + r * 120) % 220) * S;
            for (let x = -220 * S + off; x < W; x += 220 * S) bayI.push(inkPath([[x, y], [x + 40 * S, y - 7 * S], [x + 80 * S, y]], { seed: sd + 910 + r * 20 + Math.round(x), t, w: 3 * S, amp: 1 }));
          }
          lay.bayF.setAttribute('d', bay.join(' '));
          lay.bayI.setAttribute('d', bayI.join(' '));

          // ---- ships, shots, shells, blasts
          const A = { F: [], Li: [], I: [], R: [], o: null, sd: 0, t };
          const PF = [], PI = [], SF = [], SHL = [], BG = [], BR = [], SPL = [], SPI = [];
          ships.forEach((s, i) => {
            const k = s.scale * S * (1 - s.depth * 0.4);
            let cx = s.x * W, wy = s.y * H - s.depth * 40 * S, face = s.face < 0 ? -1 : 1;
            const ska = atOr(cues, s.sink, null), sp = ska == null ? 0 : progIO(lt, ska, s.sink_dur);
            wy += sp * 230 * k + Math.sin(lt * 1.4 + i) * 3 * S;
            A.o = o(sd + 1000 + i * 100); A.sd = sd + 1000 + i * 100;
            const before = { F: A.F.length, Li: A.Li.length, I: A.I.length, R: A.R.length };
            shipShape(s, cx, wy, k, face, A);
            if (sp > 0) {   // tilt the sinking hull: rotate its fresh path strings via a transform-free trick -> shear is skipped; splash instead
              const g = sp < 0.9 ? 1 : 1 - (sp - 0.9) * 10;
              for (let j = 0; j < 5; j++) {
                const ph = (lt * 1.6 + j / 5) % 1, sx = cx + (j - 2) * 70 * k, sy = WL + 6 * S - ph * 90 * k * g;
                SPL.push(inkLoop(circ(sx, sy, (16 + ph * 22) * k * g + 1, 8), { seed: sd + 1500 + i * 10 + j, t, amp: 2 }));
                SPI.push(inkPath(circ(sx, sy, (16 + ph * 22) * k * g + 1, 8), { seed: sd + 1550 + i * 10 + j, t, amp: 2, closed: true, w: 3 * S }));
              }
            }
            // a shell hits the yacht
            const ha = atOr(cues, s.hit, null);
            if (ha != null && lt >= ha && lt < ha + 0.7) {
              const bp = (lt - ha) / 0.7, bx = cx, by = wy - 70 * k, br = (40 + 120 * bp) * k;
              BG.push(inkLoop(circ(bx, by, br * (1 - bp * 0.5), 12), { seed: sd + 1600 + i, t, amp: 6 }));
              BR.push(inkPath(circ(bx, by, br, 12), { seed: sd + 1620 + i, t, amp: 6, closed: true, w: 10 * S * (1 - bp) + 1 }));
            }
            if (ha != null && lt >= ha && sp < 0.95) for (let j = 0; j < 3; j++) {   // smoke from the yacht
              const ph = ((lt - ha) * 0.5 + j / 3) % 1;
              SF.push(inkLoop(circ(cx + ph * 60 * k, wy - 120 * k - ph * 260 * k, (26 + ph * 50) * k, 10), { seed: sd + 1700 + i * 5 + j, t, amp: 3 }));
            }
            // firing
            const fa2 = atOr(cues, s.fire, null);
            if (fa2 != null && s.kind !== 'yacht' && lt >= fa2 && sp < 0.3) {
              const n = Math.floor((lt - fa2) / s.every);
              for (let m = Math.max(0, n - 2); m <= n; m++) {
                const st = fa2 + m * s.every, a = lt - st;
                if (a < 0) continue;
                const fore = (m + i) % 2 === 0;
                const gx = cx + (fore ? 236 : -242) * k * face, gy = wy - 58 * k;
                if (a < 0.16) BG.push(inkLoop(circ(gx + 20 * k * face, gy, 34 * k, 9), { seed: sd + 1800 + i * 50 + m, t, amp: 4 }));
                if (a < 1.6) {   // muzzle smoke
                  const pr = (14 + a * 22) * k * (1 - a / 2.2), px = gx + a * 30 * S, py = gy - a * 40 * S;
                  PF.push(inkLoop(circ(px, py, pr, 10), { seed: sd + 1900 + i * 50 + m, t, amp: 3 }));
                  PI.push(inkPath(circ(px, py, pr, 10), { seed: sd + 1950 + i * 50 + m, t, amp: 3, closed: true, w: 3 * S }));
                }
                // shell flight 0.75 s
                const tg = s.target || [lerp(0.2, 0.8, ((m * 37 + i * 17) % 10) / 10), PA.base - 0.06 - ((m * 13 + i) % 3) * 0.035];
                const tx = tg[0] * W, ty = tg[1] * H, fp = a / 0.75;
                if (fp < 1) {
                  const sx = lerp(gx, tx, fp), sy = lerp(gy, ty, fp) - Math.sin(fp * Math.PI) * 220 * S;
                  SHL.push(inkDot(sx, sy, 9 * S, 9 * S, sd + 2000 + m, t));
                  const fp2 = Math.max(0, fp - 0.08), sx2 = lerp(gx, tx, fp2), sy2 = lerp(gy, ty, fp2) - Math.sin(fp2 * Math.PI) * 220 * S;
                  SHL.push(inkPath([[sx2, sy2], [sx, sy]], { seed: sd + 2050 + m, t, w: 3 * S }));
                } else if (fp < 1.75) {
                  const bp = (fp - 1) / 0.75, br = (36 + 110 * bp) * S;
                  BG.push(inkLoop(circ(tx, ty, br * (1 - bp * 0.6), 12), { seed: sd + 2100 + i * 50 + m, t, amp: 7 }));
                  BR.push(inkPath(circ(tx, ty, br, 12), { seed: sd + 2150 + i * 50 + m, t, amp: 8, closed: true, w: 12 * S * (1 - bp) + 1 }));
                  for (let d = 0; d < 5; d++) {
                    const ang = -0.4 - d * 0.55, dr = br * 1.2;
                    SHL.push(inkDot(tx + Math.cos(ang) * dr, ty + Math.sin(ang) * dr + bp * bp * 80 * S, 6 * S, 6 * S, sd + 2200 + d + m * 7, t));
                  }
                }
              }
            }
          });
          lay.shipF.setAttribute('d', A.F.join(' '));
          lay.shipL.setAttribute('d', A.Li.join(' '));
          lay.shipI.setAttribute('d', A.I.join(' '));
          lay.shipR.setAttribute('d', A.R.join(' '));
          lay.smokeBack.setAttribute('d', SM.join(' '));
          lay.puff.setAttribute('d', PF.join(' '));
          lay.puffI.setAttribute('d', PI.join(' '));
          lay.smokeFront.setAttribute('d', SF.join(' '));
          lay.shell.setAttribute('d', SHL.join(' '));
          lay.blastG.setAttribute('d', BG.join(' '));
          lay.blastR.setAttribute('d', BR.join(' '));
          lay.splash.setAttribute('d', SPL.join(' '));
          lay.splashI.setAttribute('d', SPI.join(' '));

          // ---- front water band (hides what sinks)
          const fr = [], frI = [], bot = H + 80;
          fr.push(inkLoop([[-60, WL + 10 * S], [W * 0.25, WL + 4 * S], [W * 0.5, WL + 12 * S], [W * 0.75, WL + 5 * S], [W + 60, WL + 10 * S], [W + 60, bot], [-60, bot]], { seed: sd + 2300, t, amp: 2 }));
          frI.push(inkPath([[-40, WL + 10 * S], [W * 0.25, WL + 4 * S], [W * 0.5, WL + 12 * S], [W * 0.75, WL + 5 * S], [W + 40, WL + 10 * S]], { seed: sd + 2301, t, w: 5 * S }));
          for (let r = 0; r < 3; r++) {
            const y = WL + (40 + r * 46) * S, off = ((lt * 26 + r * 90) % 240) * S;
            for (let x = -240 * S + off; x < W; x += 240 * S) frI.push(inkPath([[x, y], [x + 50 * S, y - 9 * S], [x + 100 * S, y]], { seed: sd + 2310 + r * 20 + Math.round(x), t, w: 4 * S, amp: 1 }));
          }
          lay.frontF.setAttribute('d', fr.join(' '));
          lay.frontI.setAttribute('d', frI.join(' '));

          // ---- ledge
          if (LD) {
            const ly = LD.y * H, lw = LD.w * W, left = LD.side !== 'right';
            const x0 = left ? -60 : W - lw, x1 = left ? lw : W + 60;
            const pts = left ? [[x0, ly + 4], [x1 * 0.5, ly - 8 * S], [x1 - 20 * S, ly], [x1, ly + 90 * S], [x1 + 30 * S, bot], [x0, bot]]
                             : [[x1, ly + 4], [x0 + lw * 0.5, ly - 8 * S], [x0 + 20 * S, ly], [x0, ly + 90 * S], [x0 - 30 * S, bot], [x1, bot]];
            lay.ledgeF.setAttribute('d', inkLoop(pts, { seed: sd + 2400, t, amp: 1.5 }));
            const li = [inkPath(pts.slice(0, 5), { seed: sd + 2401, t, w: 6 * S })];
            for (let h = 0; h < 6; h++) { const hx = lerp(x0 + 40 * S, x1 - 60 * S, h / 5), hy = ly + (40 + (h % 3) * 50) * S; li.push(inkPath([[hx, hy], [hx + 40 * S, hy + 30 * S]], { seed: sd + 2410 + h, t, w: 3 * S })); }
            lay.ledgeI.setAttribute('d', li.join(' '));
          }

          // ---- big clock
          const CK = P.clock === false || P.clock == null ? null : Object.assign({ x: 0.8, y: portrait ? 0.17 : 0.2, r: 118, text: true }, P.clock);
          if (CK) {
            const ca = atOr(cues, CK.at, 0.05), cp = lt >= ca ? spring(lt, ca, 0.6) : 0, r = CK.r * S, cx = CK.x * W, cy = CK.y * H;
            const pk = punch(lt, ta, 0.5);
            clockG.setAttribute('opacity', clamp01(cp * 3));
            clockG.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(-4 + Math.sin(lt * 2) * 1.5)}) scale(${(lerp(0.5, 1, cp) * (1 + 0.08 * pk)).toFixed(3)}) translate(${f1(-cx)} ${f1(-cy)})`);
            ck.face.setAttribute('d', inkLoop(circ(cx, cy, r, 16), { seed: sd + 2500, t, amp: 1 }));
            const ci = [inkPath(circ(cx, cy, r, 16), { seed: sd + 2501, t, closed: true, w: 9 * S, amp: 1 }),
              inkPath(circ(cx, cy - r - 22 * S, 18 * S, 8), { seed: sd + 2502, t, closed: true, w: 6 * S, amp: 0.6 })];
            for (let h = 0; h < 12; h++) { const a = h / 12 * 6.2832; ci.push(inkPath([[cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78], [cx + Math.cos(a) * r * 0.9, cy + Math.sin(a) * r * 0.9]], { seed: sd + 2510 + h, t, w: (h % 3 ? 4 : 8) * S, amp: 0.6 })); }
            const ma = (mins % 60) / 60 * 6.2832 - 1.5708, ha = ((mins / 60) % 12) / 12 * 6.2832 - 1.5708;
            ci.push(inkPath([[cx, cy], [cx + Math.cos(ha) * r * 0.5, cy + Math.sin(ha) * r * 0.5]], { seed: sd + 2530, t, w: 12 * S, amp: 0.6 }));
            ck.ink.setAttribute('d', ci.join(' '));
            ck.red.setAttribute('d', inkPath([[cx, cy], [cx + Math.cos(ma) * r * 0.8, cy + Math.sin(ma) * r * 0.8]], { seed: sd + 2531, t, w: 8 * S, amp: 0.6 }) + ' ' + inkDot(cx, cy, 10 * S, 10 * S, sd + 2532, t));
            if (CK.text) {
              ckText.textContent = fmtT(mins);
              ckText.setAttribute('font-size', f1(78 * S));
              ckText.setAttribute('text-anchor', 'end'); ckText.setAttribute('x', f1(cx - r - 26 * S)); ckText.setAttribute('y', f1(cy + 28 * S));
            } else ckText.textContent = '';
          } else clockG.setAttribute('opacity', 0);

          // ---- label
          if (label) {
            const Lb = label.Lb, a = atOr(cues, Lb.at, dur * 0.5), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 2600, t, 1.4);
            const x = (Lb.x ?? 0.5) * W, y = (Lb.y ?? 0.2) * H;
            label.g.setAttribute('opacity', clamp01(p * 3));
            label.g.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(-3) scale(${lerp(0.5, 1, p).toFixed(3)})`);
          }

          // ---- Kaşif
          if (kas) {
            const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion || K.emotion0 }];
            const tha = atOr(cues, K.at, null);
            if (tha != null && K.then) segs.push({ at: tha, pose: K.then, dir: K.dir, face: K.face, emotion: K.then === 'shock' ? 'surprised' : K.emotion });
            (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let ix = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) ix = j;
            const s = segs[ix], pv = ix > 0 ? segs[ix - 1] : null, since = lt - Math.max(0, s.at);
            const ko = { x: K.x * W, y: H * K.y, face: faceOf(s.face ?? K.face, 1), since, dir: dirOf(s.dir ?? K.dir),
              emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : null), mouth: 0 };
            if (pv && since < 0.32) { ko.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; ko.mix = since / 0.32; }
            kas.update(t, s.pose || 'idle', ko);
          }
        },
      };
    },
  };
})();
