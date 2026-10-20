// tr_c: parchment ink shots for 01-turkiye-50-yil-sonra, chapters "2050'ler: sıcak, su ve 2053" and "2076: aynanın
// öbür yüzü" (brand/kit/BRAND.md §3, §5: every line boils at 8 Hz via _ink.js; pure functions of (seed, lt)).
//
// SHOTS.tr_c_climate — a tall thermometer whose red mercury rises on `hot`, a sun with slowly turning rays, a cloud
//   that first drops a few sparse drops and on `hard` bursts into short heavy slanted rain, dry soil cracks drawn on
//   `dry`. P: {hot_label: "daha sıcak", rain_label: "seyrek, sert", note: "tahmin", cast}   cues: hot, dry, hard
// SHOTS.tr_c_water — a big water drop whose level sinks on `less` (red down arrow + "tahmin"), a pipe from it splits
//   to a field (left, sprouts) and a city (right, houses); water dashes flow along both branches on `share`.
//   P: {label: "kişi başı su", note: "tahmin", cast}   cues: less, share
// SHOTS.tr_c_scale — balance beam: left pan holds a smoke cloud ("salınan"), right pan gets trees on `trees` and a
//   capture machine on `tech`; the beam levels as they arrive. On `law` a pinned scroll "İklim Kanunu · 2025" drops in.
//   P: {left: "salınan", right: "tutulan", law: {title: "İklim Kanunu", year: "2025"}, cast}   cues: trees, tech, law
// SHOTS.tr_c_curve — population curve: solid ink 1976 -> 2026, dashed projection that peaks in the 2050s and falls
//   to 2076; a pen dot draws it; on `fall` the falling part turns red with a down arrow. P: {note: "tahmin", cast}
//   cues: now (solid part done), fall
// SHOTS.tr_c_people — rows of small stick-figure pictograms. mode "third": every third figure turns red, bent and
//   with a cane on `hit`; a big counter on the left (from -> to, e.g. 34 -> 51,5) with a label. mode "half": the
//   left half turns blue on `hit` with a bracket and label above them.
//   P: {mode, rows, cols, big: {from, to, dec, text, at}, label, note: "tahmin", cast}   cues: hit, big.at
// SHOTS.tr_c_mirror — two oval hand mirrors side by side ("iki ayna"): left year in ink, right year in red.
//   mode "kids": left children play with a ball, right elders with canes on a park bench and one child.
//   mode "same": left a pupil with a school bag, right the same person older with a cane.
//   P: {mode, years: ["1976", "2076"], cast}   cues: right (right mirror content), hit
// cast (all): [{who: "kasif"|name, x, y, scale, face: "left"|"right", pose, at, then, dir, emotion, emotion0, text}]
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const FR = 'Fraunces, Georgia, serif';
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const seg = (a, b, n = 6) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
  const partial = (pts, p) => { const n = Math.max(2, Math.round(pts.length * clamp01(p))); return pts.slice(0, n); };
  function text(parent, s, size, font, fill, extra = {}) {
    const t = el(parent, 'text', Object.assign({ 'font-family': font, 'font-size': size, 'text-anchor': 'middle', fill,
      style: `paint-order: stroke; stroke: ${INK.paper}; stroke-width: ${Math.round(size * 0.14)}px; stroke-linejoin: round` }, extra));
    t.textContent = s;
    return t;
  }
  const pop = (node, x, y, sp, rot, b) => {
    node.setAttribute('opacity', clamp01(sp * 2).toFixed(3));
    node.setAttribute('transform', `translate(${f1(x + b[0])} ${f1(y + b[1])}) rotate(${f1(rot)}) scale(${lerp(0.55, 1, clamp01(sp)).toFixed(3)})`);
  };
  const line = (n, pts, o) => n.setAttribute('d', inkPath(pts, o));
  const fillD = (n, pts, o) => n.setAttribute('d', inkLoop(pts, o));

  // ---------------------------------------------------------------- cast
  function castOf(P, parent, seed, defScale) {
    return (P.cast || []).map((m, i) => {
      const isK = (m.who || 'kasif') === 'kasif', sc = (m.scale ?? 1) * defScale;
      return { m, isK, sc, rig: KASIF.create(el(parent, 'g'), { scale: sc, hat: isK, accessory: isK ? null : (m.accessory || null), beard: isK ? null : (m.beard || null), seed: seed + 7 + i * 13 }) };
    });
  }
  function castUpdate(cast, lt, t, cues, W, H, G) {
    cast.forEach(c => {
      const m = c.m, at = atOr(cues, m.at, null), after = at != null && lt >= at;
      const pose = after ? (m.then || 'point') : (m.pose || 'idle');
      const x = (m.x ?? 0.85) * W, y = m.y != null ? m.y * H : G;
      const since = after ? lt - at : lt, dir = typeof m.dir === 'number' ? m.dir : DIRS[m.dir] ?? 25;
      const o = { x, y, face: m.face === 'left' ? -1 : 1, since, dir, text: m.text,
        emotion: after ? (m.emotion || null) : (m.emotion0 || null) };
      if (pose === 'walk') o.ph = lt / 0.9;
      if (after && since < 0.32) { o.prev = { pose: m.pose || 'idle', since: at, dir }; o.mix = since / 0.32; }
      c.rig.update(t, pose, o);
    });
  }
  function cam(root, lt, dur, W, H, pk, zoom = 0.035) {
    const z = (1 + zoom * sm(lt / Math.max(dur, 1))) * (1 + 0.02 * pk);
    root.setAttribute('transform', `translate(${f1(Math.sin(lt * 0.31) * 7 + W / 2)} ${f1(Math.cos(lt * 0.23) * 6 + H / 2)}) scale(${z.toFixed(4)}) translate(${-W / 2} ${-H / 2})`);
  }
  function ground(parent, W, gy, seed) {
    const n = mk(parent), band = mk(parent, INK.paperDark, { 'fill-opacity': 0.35 });
    const pts = []; for (let x = -60; x <= W + 60; x += 120) pts.push([x, gy + 4 + Math.sin(x * 0.013 + seed) * 4]);
    return t => { line(n, pts, { seed: seed + 1, t, w: 6, amp: 1.4 }); fillD(band, [...pts, [W + 60, gy + 46], [-60, gy + 46]], { seed: seed + 2, t, amp: 1, smooth: false }); };
  }
  // red/ink down arrow centred on (x, y)
  function arrowD(x, y, len, sd, t, w = 8) {
    const y0 = y - len / 2, y1 = y + len / 2, h = 28;
    return inkPath(seg([x, y0], [x, y1], 4), { seed: sd, t, w }) + ' ' + inkPath([[x - h, y1 - h], [x, y1], [x + h, y1 - h]], { seed: sd + 1, t, w, smooth: false });
  }

  // ---------------------------------------------------------------- pictogram figure (stroke list, ground point x,y)
  // kind: adult | child | elder | pupil ; h = full height px ; ph = animation phase (s)
  function figure(x, y, h, kind, ph, seed, t, flip = 1) {
    const k = h / 300, out = [];
    const O = (n, x2) => Object.assign({ seed: seed + n, t, w: Math.max(4, 11 * k), amp: 1 }, x2);
    const bent = kind === 'elder' ? 1 : 0;
    const hop = kind === 'child' ? Math.max(0, Math.sin(ph * 6)) * 26 * k : 0;
    const hip = [x, y - 150 * k - hop], sh = [x + flip * bent * 28 * k, y - 250 * k - hop + bent * 16 * k];
    const hr = (kind === 'child' || kind === 'pupil' ? 40 : 34) * k;
    const head = [sh[0] + flip * bent * 14 * k, sh[1] - hr - 8 * k];
    const sw = Math.sin(ph * (kind === 'child' ? 6 : 2.2)) * (bent ? 6 : 18) * k;
    out.push(inkCircle(head[0], head[1], hr, seed + 1, t, { fill: true }));
    out.push(inkPath([sh, hip], O(2)));
    out.push(inkPath([[hip[0] - 4 * k, hip[1]], [x - 34 * k - sw, y]], O(3)));
    out.push(inkPath([[hip[0] + 4 * k, hip[1]], [x + 34 * k + sw, y]], O(4)));
    if (kind === 'elder') {
      const hand = [sh[0] + flip * 62 * k, sh[1] + 86 * k];
      out.push(inkPath([sh, [sh[0] + flip * 30 * k, sh[1] + 50 * k], hand], O(5)));
      out.push(inkPath([sh, [sh[0] - flip * 24 * k, sh[1] + 60 * k], [sh[0] - flip * 20 * k, sh[1] + 110 * k]], O(6)));
      out.push(inkPath([[hand[0] - flip * 14 * k, hand[1] - 16 * k], [hand[0], hand[1] - 14 * k], [hand[0] + flip * 4 * k, y]], O(7, { w: Math.max(3, 8 * k) })));
    } else {
      const up = kind === 'child' ? -60 * k : 0;
      out.push(inkPath([sh, [sh[0] + 46 * k, sh[1] + 50 * k + up * 0.5], [sh[0] + 56 * k + sw * 0.6, sh[1] + 100 * k + up]], O(5)));
      out.push(inkPath([sh, [sh[0] - 46 * k, sh[1] + 50 * k + up * 0.5], [sh[0] - 56 * k - sw * 0.6, sh[1] + 100 * k + up]], O(6)));
    }
    return out.join(' ');
  }
  // pupil's school bag (filled rectangle on the back)
  const bagPts = (x, y, h, flip = 1) => { const k = h / 300; const bx = x - flip * 30 * k, by = y - 240 * k; return [[bx - 26 * k, by], [bx + 10 * k, by], [bx + 10 * k, by + 76 * k], [bx - 26 * k, by + 76 * k]]; };

  // ================================================================ tr_c_climate
  SH.tr_c_climate = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 51, G = P.ground ?? 860;
      const r = rng(seed * 13 + 5);
      const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const gnd = ground(back, W, G, sd);
      const crack = mk(back, INK.inkSoft);
      const sunF = mk(mid, INK.gold, { 'fill-opacity': 0.85 }), sunR = mk(mid);
      const thF = mk(mid, INK.paperLight), thM = mk(mid, INK.red), thR = mk(mid), ticks = mk(mid);
      const cloudF = mk(mid, INK.paperDark), cloudR = mk(mid), rain = mk(mid, INK.blue);
      const hot = text(ui, P.hot_label || 'daha sıcak', 66, INK_FONT, INK.red);
      const rainL = text(ui, P.rain_label || 'seyrek, sert', 60, INK_FONT, INK.blue);
      const note = text(ui, P.note || 'tahmin', 48, INK_FONT, INK.inkSoft);
      const noteU = mk(ui, INK.inkSoft);
      const cast = castOf(P, actors, seed, 0.6);
      const TX = 0.17 * W, TY0 = 230, TY1 = 760;          // thermometer column
      const SX = 0.43 * W, SY = 270;                       // sun
      const CX = 0.66 * W, CY = 250;                       // cloud
      const drops = Array.from({ length: 34 }, () => ({ x: (r() - 0.5) * 380, o: r(), l: 50 + r() * 50 }));
      const cracks = Array.from({ length: 7 }, (_, i) => { const x0 = 0.52 * W + i * 70 + r() * 30; return [[x0, G + 10], [x0 + 18 - r() * 36, G + 24], [x0 + 6, G + 40]]; });
      const cloudPts = inkEllipsePts(CX, CY, 230, 90, sd + 40, 14, 0, 0.12);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const hotAt = atOr(cues, 'hot', dur * 0.2), dryAt = atOr(cues, 'dry', dur * 0.45), hardAt = atOr(cues, 'hard', dur * 0.75);
          const pk = punch(lt, hotAt) + punch(lt, hardAt);
          cam(root, lt, dur, W, H, pk);
          gnd(t);
          // dry cracks
          const cp = prog(lt, dryAt, 1.2);
          crack.setAttribute('d', cp > 0.01 ? cracks.slice(0, Math.ceil(cracks.length * cp)).map((c, i) => inkPath(c, O(60 + i, { w: 4 }))).join(' ') : '');
          // sun with turning rays
          const ss = spring(lt, 0.1, 0.8);
          let rays = '';
          for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283 + lt * 0.25, r0 = 104 * ss, r1 = (150 + (i % 2) * 24) * ss; rays += inkPath([[SX + Math.cos(a) * r0, SY + Math.sin(a) * r0], [SX + Math.cos(a) * r1, SY + Math.sin(a) * r1]], O(10 + i, { w: 6 })) + ' '; }
          sunF.setAttribute('d', inkCircle(SX, SY, 82 * ss + 0.1, sd + 3, t, { fill: true }));
          sunR.setAttribute('d', inkCircle(SX, SY, 82 * ss + 0.1, sd + 3, t, { w: 6 }) + ' ' + rays);
          // thermometer
          const tsp = spring(lt, 0, 0.7), tw = 46, bulbR = 64, by = TY1;
          const tube = [[TX - tw / 2, by - 40], [TX - tw / 2, TY0 + tw / 2], [TX - tw / 4, TY0], [TX + tw / 4, TY0], [TX + tw / 2, TY0 + tw / 2], [TX + tw / 2, by - 40]];
          const tsc = lerp(0.6, 1, tsp);
          mid.setAttribute('opacity', '1');
          fillD(thF, tube, O(20, { smooth: false }));
          const lv = lerp(0.3, 0.86, prog(lt, hotAt, 1.6)) + Math.sin(lt * 2) * 0.006;
          const my = lerp(by - 40, TY0 + 26, lv);
          fillD(thM, [[TX - tw / 2 + 12, by - 30], [TX - tw / 2 + 12, my], [TX + tw / 2 - 12, my], [TX + tw / 2 - 12, by - 30]], O(21, { smooth: false, amp: 1 }));
          thM.setAttribute('d', thM.getAttribute('d') + ' ' + inkCircle(TX, by, (bulbR - 12) * tsc, sd + 22, t, { fill: true }));
          thR.setAttribute('d', inkPath(tube, O(23, { w: 7, smooth: false })) + ' ' + inkCircle(TX, by, bulbR * tsc, sd + 24, t, { w: 7 }));
          let tk = ''; for (let i = 0; i < 6; i++) { const yy = lerp(by - 80, TY0 + 50, i / 5); tk += inkPath([[TX + tw / 2 + 6, yy], [TX + tw / 2 + 30, yy]], O(30 + i, { w: 4 })) + ' '; }
          ticks.setAttribute('d', tk);
          pop(hot, TX + 230, TY0 + 120, spring(lt, hotAt + 0.2, 0.6), -4, boil(sd + 70, t, 1));
          // cloud + rain
          const cs = spring(lt, 0.3, 0.8), dx = Math.sin(lt * 0.4) * 14;
          const cp2 = cloudPts.map(q => [CX + (q[0] - CX) * cs + dx, CY + (q[1] - CY) * cs]);
          fillD(cloudF, cp2, O(41)); line(cloudR, cp2, O(41, { w: 6, closed: true }));
          const hard = lt >= hardAt ? Math.max(0, 1 - Math.max(0, lt - hardAt - 1.6) / 0.6) : 0;
          let rd = '';
          drops.forEach((d, i) => {
            if (!hard && i % 6) return;                                   // sparse: only a few drops
            const sp = hard ? 2.4 : 0.9, u = ((lt * sp + d.o) % 1), y0 = CY + 70 + u * (G - CY - 110);
            const sl = hard ? 0.45 : 0.12, l = hard ? d.l * 1.4 : 26;
            rd += inkPath([[CX + dx + d.x, y0], [CX + dx + d.x - l * sl, y0 + l]], O(80 + i, { w: hard ? 6 : 7, amp: 0.8 })) + ' ';
          });
          rain.setAttribute('d', cs > 0.9 ? rd : '');
          pop(rainL, CX + dx, CY - 140, spring(lt, hardAt + 0.1, 0.6), 3, boil(sd + 71, t, 1));
          // note
          const ns = spring(lt, hotAt + 0.8, 0.6);
          pop(note, SX, SY + 230, ns, -2, boil(sd + 72, t, 1));
          noteU.setAttribute('d', ns > 0.3 ? inkPath([[SX - 70, SY + 248], [SX + 70, SY + 244]], O(73, { w: 4, dash: 1 })) : '');
          castUpdate(cast, lt, t, cues, W, H, G);
        },
      };
    },
  };

  // ================================================================ tr_c_water
  SH.tr_c_water = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 61, G = P.ground ?? 860;
      const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const gnd = ground(back, W, G, sd);
      const pipeF = mk(mid, INK.paperLight), pipeR = mk(mid), flow = mk(mid, INK.blue);
      const clip = el(el(svg, 'defs'), 'clipPath', { id: `trcw${seed}` }), clipP = el(clip, 'path');
      const dropF = mk(mid, INK.paperLight), dropW = mk(mid, INK.blue, { 'fill-opacity': 0.75, 'clip-path': `url(#trcw${seed})` }), dropR = mk(mid), shine = mk(mid, INK.paperLight);
      const field = mk(mid), sprouts = mk(mid, INK.green), houseF = mk(mid, INK.paperDark), houseR = mk(mid), win = mk(mid, INK.gold, { 'fill-opacity': 0.7 });
      const arrow = mk(ui, INK.red);
      const label = text(ui, P.label || 'kişi başı su', 66, INK_FONT, INK.ink);
      const note = text(ui, P.note || 'tahmin', 48, INK_FONT, INK.red);
      const cast = castOf(P, actors, seed, 0.55);
      const DX = W / 2, DY = 270, R = 120;
      const dropPts = (s) => { const p = []; for (let i = 0; i <= 16; i++) { const a = Math.PI * (i / 16); p.push([DX + Math.cos(a) * R * s, DY + Math.sin(a) * R * s]); } p.push([DX - R * 0.62 * s, DY - R * 0.9 * s], [DX, DY - R * 1.75 * s], [DX + R * 0.62 * s, DY - R * 0.9 * s]); return p; };
      const pipeY = 520, LX = 0.2 * W, RX = 0.8 * W;
      const branchL = [[DX, DY + R + 10], [DX, pipeY], [LX, pipeY], [LX, 620]];
      const branchR = [[DX, DY + R + 10], [DX, pipeY], [RX, pipeY], [RX, 600]];
      const resample = (pl, step) => { const out = []; for (let i = 0; i < pl.length - 1; i++) { const n = Math.ceil(Math.hypot(pl[i + 1][0] - pl[i][0], pl[i + 1][1] - pl[i][1]) / step); for (let j = 0; j < n; j++) out.push([lerp(pl[i][0], pl[i + 1][0], j / n), lerp(pl[i][1], pl[i + 1][1], j / n)]); } out.push(pl[pl.length - 1]); return out; };
      const bL = resample(branchL, 20), bR = resample(branchR, 20);
      const houses = [[-170, 230, 1], [-40, 300, 0], [90, 200, 1], [200, 260, 0]];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          const lessAt = atOr(cues, 'less', dur * 0.4), shareAt = atOr(cues, 'share', dur * 0.7);
          cam(root, lt, dur, W, H, punch(lt, lessAt) + punch(lt, shareAt));
          gnd(t);
          // drop
          const ds = spring(lt, 0, 0.8), dp = dropPts(Math.max(0.05, ds));
          fillD(dropF, dp, O(1)); line(dropR, dp, O(1, { w: 8, closed: true }));
          const lv = lerp(0.85, 0.4, prog(lt, lessAt, 1.8));
          const top = DY + R * ds - lv * R * 2.6 * ds, wav = Math.sin(lt * 3) * 6;
          clipP.setAttribute('d', inkLoop(dp, O(1)));
          dropW.setAttribute('d', inkLoop([[DX - R * 1.3, top + wav], [DX - R * 0.4, top - wav], [DX + R * 0.4, top + wav], [DX + R * 1.3, top - wav], [DX + R * 1.3, DY + R + 30], [DX - R * 1.3, DY + R + 30]], O(2, { amp: 1, smooth: false })));
          shine.setAttribute('d', inkPath([[DX - R * 0.55 * ds, DY - R * 0.1], [DX - R * 0.4 * ds, DY - R * 0.6 * ds]], O(3, { w: 12 })));
                    // arrow + note
          const as = spring(lt, lessAt, 0.6);
          arrow.setAttribute('d', as > 0.05 ? arrowD(DX + 250, DY - 10, 200 * as, sd + 4, t) : '');
          pop(note, DX + 250, DY + 150, spring(lt, lessAt + 0.3, 0.6), -3, boil(sd + 5, t, 1));
          pop(label, DX - 350, DY - 40, spring(lt, 0.4, 0.6), -3, boil(sd + 6, t, 1));
          // pipe
          const pp = prog(lt, 0.5, 1.2);
          const pl = partial(bL, pp), pr = partial(bR, pp);
          pipeR.setAttribute('d', inkPath(pl, O(10, { w: 22, smooth: false })) + ' ' + inkPath(pr, O(11, { w: 22, smooth: false })));
          pipeF.setAttribute('d', '');
          // flowing water dashes
          let fd = '';
          if (lt >= shareAt) {
            const u = (lt - shareAt) * 1.2;
            [bL, bR].forEach((b, bi) => { for (let j = 0; j < 7; j++) { const s0 = ((j / 7 + u * 0.35) % 1) * (b.length - 3); const i0 = Math.floor(s0); fd += inkPath([b[i0], b[i0 + 2]], O(20 + bi * 10 + j, { w: 9, amp: 0.6 })) + ' '; } });
          }
          flow.setAttribute('d', fd);
          // field (left)
          const fs = spring(lt, 0.8, 0.8);
          let fl = '', sp = '';
          for (let i = 0; i < 4; i++) { const y = 680 + i * 50; fl += inkPath([[LX - 200 * fs, y], [LX + 200 * fs, y + 6]], O(30 + i, { w: 5 })) + ' ';
            for (let j = 0; j < 6; j++) { const x = LX - 170 + j * 68 + (i % 2) * 30, hh = 34 * fs + Math.sin(lt * 2 + j + i) * 3; sp += inkPath([[x, y], [x + 4, y - hh]], O(40 + i * 6 + j, { w: 5 })) + ' ' + inkDot(x + 12, y - hh * 0.7, 10 * fs + 0.1, 6 * fs + 0.1, sd + 90 + i * 6 + j, t) + ' '; } }
          field.setAttribute('d', fl); sprouts.setAttribute('d', sp);
          // city (right)
          let hf = '', hr = '', wf = '';
          houses.forEach(([dx, h, roof], i) => {
            const hs = spring(lt, 0.9 + i * 0.12, 0.7), x0 = RX + dx - 55, x1 = RX + dx + 55, ty = G - h * hs;
            const pts = roof ? [[x0, G], [x0, ty], [(x0 + x1) / 2, ty - 50 * hs], [x1, ty], [x1, G]] : [[x0, G], [x0, ty], [x1, ty], [x1, G]];
            hf += inkLoop(pts, O(50 + i, { smooth: false })) + ' '; hr += inkPath(pts, O(50 + i, { w: 5, smooth: false })) + ' ';
            if (hs > 0.8) for (let k = 0; k < 2; k++) { const wy = ty + 30 + k * 70; if (wy < G - 50) wf += inkLoop([[x0 + 22, wy], [x0 + 50, wy], [x0 + 50, wy + 34], [x0 + 22, wy + 34]], O(60 + i * 2 + k, { smooth: false, amp: 1 })) + ' '; }
          });
          houseF.setAttribute('d', hf); houseR.setAttribute('d', hr); win.setAttribute('d', wf);
          castUpdate(cast, lt, t, cues, W, H, G);
        },
      };
    },
  };

  // ================================================================ tr_c_scale
  SH.tr_c_scale = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 71, G = P.ground ?? 860;
      const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const gnd = ground(back, W, G, sd);
      const post = mk(mid), beam = mk(mid), strings = mk(mid), panF = mk(mid, INK.paperDark), panR = mk(mid);
      const smokeF = mk(mid, INK.inkSoft, { 'fill-opacity': 0.55 }), smokeR = mk(mid);
      const treeF = mk(mid, INK.green), treeR = mk(mid), mach = mk(mid, INK.paperLight), machR = mk(mid), machA = mk(mid, INK.blue);
      const lL = text(ui, P.left || 'salınan', 58, INK_FONT, INK.ink), lR = text(ui, P.right || 'tutulan', 58, INK_FONT, INK.green);
      const scrollG = el(ui, 'g'), scF = mk(scrollG, INK.paperLight), scR = mk(scrollG), scPin = mk(scrollG, INK.red);
      const law = P.law || { title: 'İklim Kanunu', year: '2025' };
      const scT = text(scrollG, law.title, 62, FR, INK.ink, { 'font-weight': 800 });
      const scY = text(scrollG, law.year, 70, FR, INK.red, { 'font-weight': 900 });
      const cast = castOf(P, actors, seed, 0.55);
      const PX = 0.43 * W, PY = 400, L = 420;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.4 }, x);
          const trAt = atOr(cues, 'trees', dur * 0.3), teAt = atOr(cues, 'tech', dur * 0.45), lawAt = atOr(cues, 'law', dur * 0.7);
          cam(root, lt, dur, W, H, punch(lt, trAt) + punch(lt, teAt) + punch(lt, lawAt));
          gnd(t);
          const wTree = spring(lt, trAt, 0.9), wTech = spring(lt, teAt, 0.9);
          const ang = (14 - 7 * clamp01(wTree) - 7 * clamp01(wTech)) * Math.PI / 180 + Math.sin(lt * 1.6) * 0.006;
          post.setAttribute('d', inkPath([[PX, G], [PX, PY]], O(1, { w: 14 })) + ' ' + inkPath([[PX - 90, G], [PX + 90, G]], O(2, { w: 10 })) + ' ' + inkCircle(PX, PY, 18, sd + 3, t, { w: 7 }));
          const eL = [PX - Math.cos(ang) * L, PY + Math.sin(ang) * L], eR = [PX + Math.cos(ang) * L, PY - Math.sin(ang) * L];
          beam.setAttribute('d', inkPath(seg(eL, eR, 8), O(4, { w: 12 })));
          let st = '', pf = '', pr = '';
          const pans = [eL, eR].map((e, i) => {
            const by = e[1] + 200, pts = [[e[0] - 150, by], [e[0] + 150, by], [e[0] + 110, by + 40], [e[0] - 110, by + 40]];
            st += inkPath([e, [e[0] - 140, by]], O(5 + i * 2, { w: 4 })) + ' ' + inkPath([e, [e[0] + 140, by]], O(6 + i * 2, { w: 4 })) + ' ';
            pf += inkLoop(pts, O(10 + i, { smooth: false })) + ' '; pr += inkPath(pts, O(10 + i, { w: 6, closed: true, smooth: false })) + ' ';
            return [e[0], by];
          });
          strings.setAttribute('d', st); panF.setAttribute('d', pf); panR.setAttribute('d', pr);
          // smoke cloud on the left pan (puffs drift up)
          const [lx, ly] = pans[0];
          let sf = '', sr = '';
          for (let i = 0; i < 5; i++) { const a = i * 1.3, rr = 52 + (i % 3) * 14, x = lx - 90 + i * 45, y = ly - 60 - (i % 2) * 50 + Math.sin(lt * 1.2 + a) * 6;
            sf += inkCircle(x, y, rr, sd + 20 + i, t, { fill: true }) + ' '; sr += inkCircle(x, y, rr, sd + 20 + i, t, { w: 4 }) + ' '; }
          smokeF.setAttribute('d', sf); smokeR.setAttribute('d', sr);
          pop(lL, lx, ly + 110, spring(lt, 0.3, 0.6), -2, boil(sd + 30, t, 1));
          // trees + machine on the right pan
          const [rx, ry] = pans[1];
          let tf = '', tr = '';
          [-100, -20].forEach((dx, i) => { const s = clamp01(wTree) * (i ? 0.85 : 1), x = rx + dx, y = ry;
            if (s < 0.02) return;
            tr += inkPath([[x, y], [x, y - 90 * s]], O(40 + i, { w: 8 })) + ' ';
            const c = inkEllipsePts(x, y - 130 * s, 52 * s, 62 * s, sd + 42 + i, 12, 0, 0.12);
            tf += inkLoop(c, O(42 + i)) + ' '; tr += inkPath(c, O(42 + i, { w: 5, closed: true })) + ' '; });
          treeF.setAttribute('d', tf); treeR.setAttribute('d', tr);
          const ms = clamp01(wTech);
          if (ms > 0.02) {
            const x0 = rx + 40, x1 = rx + 40 + 100 * ms, y1 = ry, y0 = ry - 110 * ms, pts = [[x0, y1], [x0, y0], [x1, y0], [x1, y1]];
            fillD(mach, pts, O(50, { smooth: false })); line(machR, pts, O(50, { w: 6, closed: true, smooth: false }));
            const ay = y0 - 40 - ((lt * 30) % 30);
            machA.setAttribute('d', inkPath([[(x0 + x1) / 2, ay - 40], [(x0 + x1) / 2, ay + 20]], O(51, { w: 6 })) + ' ' + inkPath([[(x0 + x1) / 2 - 16, ay + 6], [(x0 + x1) / 2, ay + 22], [(x0 + x1) / 2 + 16, ay + 6]], O(52, { w: 6, smooth: false })));
          } else { mach.setAttribute('d', ''); machR.setAttribute('d', ''); machA.setAttribute('d', ''); }
          pop(lR, rx, ry + 110, spring(lt, trAt + 0.2, 0.6), 2, boil(sd + 31, t, 1));
          // law scroll (top centre)
          const ls = spring(lt, lawAt, 0.7), sx = PX, sy = 150 - (1 - clamp01(ls)) * 60;
          scrollG.setAttribute('opacity', clamp01(ls * 2).toFixed(3));
          const sw = 330 * clamp01(ls) + 1, spt = [[sx - sw, sy - 70], [sx + sw, sy - 70], [sx + sw + 12, sy + 74], [sx - sw - 8, sy + 70]];
          fillD(scF, spt, O(60, { smooth: false })); line(scR, spt, O(60, { w: 6, closed: true, smooth: false }));
          scPin.setAttribute('d', inkDot(sx, sy - 64, 13, 13, sd + 61, t));
          const b = boil(sd + 62, t, 0.8);
          scT.setAttribute('x', sx - 90 + b[0]); scT.setAttribute('y', sy + 22 + b[1]);
          scY.setAttribute('x', sx + 220 + b[0]); scY.setAttribute('y', sy + 26 + b[1]);
          castUpdate(cast, lt, t, cues, W, H, G);
        },
      };
    },
  };

  // ================================================================ tr_c_curve
  SH.tr_c_curve = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 81;
      const root = el(svg, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const axes = mk(mid), solid = mk(mid), dash = el(mid, 'g'), red = mk(mid, INK.red), dot = mk(mid, INK.red), arrow = mk(ui, INK.red);
      const X0 = 200, X1 = 1500, Y0 = 790, Y1 = 170;
      const yr = y => lerp(X0 + 30, X1 - 20, (y - 1970) / (2100 - 1970));
      const pv = v => lerp(Y0 - 20, Y1 + 40, (v - 30) / (95 - 30));
      // shape only (TÜİK ana senaryo eğilimi): 1976 40 -> 2026 86 -> 2050'ler tepe -> 2076 iniş
      const data = [[1976, 40.3], [1985, 50.7], [1995, 60], [2005, 68.5], [2015, 78.7], [2026, 86.2], [2035, 88.6], [2045, 89.6], [2053, 89.8], [2062, 88], [2070, 85.2], [2076, 82.8], [2088, 79.5], [2100, 77]];
      const fine = [];
      for (let i = 0; i < data.length - 1; i++) for (let j = 0; j < 6; j++) { const u = j / 6; fine.push([lerp(data[i][0], data[i + 1][0], u), lerp(data[i][1], data[i + 1][1], u)]); }
      fine.push(data[data.length - 1]);
      const pts = fine.map(([y, v]) => [yr(y), pv(v)]);
      const nowI = fine.findIndex(q => q[0] >= 2026), peakI = fine.findIndex(q => q[0] >= 2053);
      const dashN = [];
      for (let i = nowI; i < pts.length - 1; i += 2) dashN.push(mk(dash));
      const years = ['1976', '2026', '2076'].map(s => text(ui, s, 54, FR, s === '2076' ? INK.red : INK.ink, { 'font-weight': 800 }));
      const note = text(ui, P.note || 'tahmin', 58, INK_FONT, INK.red);
      const cast = castOf(P, actors, seed, 0.55);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.3 }, x);
          const nowAt = atOr(cues, 'now', dur * 0.3), fallAt = atOr(cues, 'fall', dur * 0.6);
          cam(root, lt, dur, W, H, punch(lt, fallAt));
          axes.setAttribute('d', inkPath([[X0, Y1], [X0, Y0], [X1, Y0]], O(1, { w: 6, smooth: false })) + ' ' +
            [1976, 2026, 2076].map((y, i) => inkPath([[yr(y), Y0 - 12], [yr(y), Y0 + 14]], O(2 + i, { w: 5 }))).join(' '));
          years.forEach((n, i) => { const y = [1976, 2026, 2076][i]; pop(n, yr(y), Y0 + 72, spring(lt, i === 2 ? fallAt : i * 0.3, 0.6), 0, boil(sd + 10 + i, t, 0.8)); });
          // solid part
          const ps = prog(lt, 0.1, Math.max(0.6, nowAt - 0.1));
          const sN = Math.max(2, Math.round(nowI * ps) + 1);
          solid.setAttribute('d', inkPath(pts.slice(0, sN), O(5, { w: 9 })));
          // dashed projection
          const pd = lt < nowAt ? 0 : prog(lt, nowAt, Math.max(0.8, fallAt - nowAt));
          const dN = nowI + Math.round((pts.length - 1 - nowI) * pd);
          dashN.forEach((n, k) => { const i = nowI + k * 2; const fallen = lt >= fallAt && i >= peakI;
            n.setAttribute('d', i + 1 <= dN ? inkPath([pts[i], pts[i + 1]], O(20 + k, { w: 8 })) : '');
            n.setAttribute('fill', fallen ? INK.red : INK.ink); });
          const head = pts[Math.min(pts.length - 1, lt < nowAt ? sN - 1 : dN)];
          dot.setAttribute('d', inkDot(head[0], head[1], 14, 14, sd + 6, t));
          red.setAttribute('d', '');
          const as = spring(lt, fallAt + 0.2, 0.6), ax = yr(2072), ay = pv(86) - 150;
          arrow.setAttribute('d', as > 0.05 ? arrowD(ax + 10, ay, 150 * as, sd + 7, t) : '');
          pop(note, yr(2050), pv(89.8) - 70, spring(lt, nowAt + 0.4, 0.6), -4, boil(sd + 8, t, 1));
          castUpdate(cast, lt, t, cues, W, H, 860);
        },
      };
    },
  };

  // ================================================================ tr_c_people
  SH.tr_c_people = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 91, mode = P.mode || 'third';
      const rows = P.rows ?? 3, cols = P.cols ?? 9;
      const root = el(svg, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const figN = Array.from({ length: rows * cols }, () => mk(mid));
      const brace = mk(ui, INK.blue), divider = mk(ui, INK.inkSoft);
      const B = P.big || {};
      const big = text(ui, '', 190, FR, INK.red, { 'font-weight': 900 });
      const bigL = text(ui, B.text || '', 58, INK_FONT, INK.ink);
      const lab = P.label ? text(ui, P.label, 62, INK_FONT, mode === 'half' ? INK.blue : INK.red) : null;
      const note = text(ui, P.note || 'tahmin', 48, INK_FONT, INK.inkSoft);
      const cast = castOf(P, actors, seed, 0.55);
      const GX0 = P.grid_x0 ?? 640, GX1 = P.grid_x1 ?? 1560, GY0 = P.grid_y0 ?? 330, rowH = P.row_h ?? 190;
      const fh = Math.min(170, rowH * 0.85);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.3 }, x);
          const hitAt = atOr(cues, 'hit', dur * 0.55), bigAt = atOr(cues, B.at, 0.3);
          cam(root, lt, dur, W, H, punch(lt, hitAt) + punch(lt, bigAt));
          figN.forEach((n, i) => {
            const rI = Math.floor(i / cols), cI = i % cols;
            const x = lerp(GX0, GX1, (cI + 0.5) / cols), y = GY0 + rI * rowH + fh;
            const sp = spring(lt, 0.15 + i * 0.03, 0.5);
            const marked = mode === 'third' ? (cI % 3 === (rI + 1) % 3) : (cI < cols / 2);
            const on = marked && lt >= hitAt + (mode === 'third' ? (i % 7) * 0.05 : cI * 0.06);
            const kind = on && mode === 'third' ? 'elder' : 'adult';
            n.setAttribute('d', sp > 0.02 ? figure(x, y + (1 - clamp01(sp)) * 40, fh * lerp(0.4, 1, clamp01(sp)), kind, lt + i * 0.37, sd + i * 20, t) : '');
            n.setAttribute('fill', on ? (mode === 'third' ? INK.red : INK.blue) : (mode === 'half' && lt >= hitAt ? INK.inkSoft : INK.ink));
          });
          if (mode === 'half') {
            const hs = prog(lt, hitAt + 0.3, 0.6), xm = (GX0 + GX1) / 2, yb = GY0 - 20;
            brace.setAttribute('d', hs > 0.02 ? inkPath([[GX0 + 10, yb + 30], [GX0 + 10, yb], [lerp(GX0 + 10, xm - 20, hs), yb]], O(60, { w: 6, smooth: false })) + (hs > 0.9 ? ' ' + inkPath([[xm - 20, yb], [xm - 20, yb + 30]], O(61, { w: 6 })) : '') : '');
            divider.setAttribute('d', lt >= hitAt ? inkPath(seg([xm, GY0 - 10], [xm, GY0 + rows * rowH + 10], 8), O(62, { w: 4, dash: 1 })) : '');
            if (lab) pop(lab, (GX0 + xm) / 2, yb - 40, spring(lt, hitAt + 0.5, 0.6), -2, boil(sd + 63, t, 1));
          } else if (lab) pop(lab, (GX0 + GX1) / 2, GY0 - 50, spring(lt, hitAt + 0.3, 0.6), -2, boil(sd + 63, t, 1));
          // big counter
          if (B.to != null) {
            const bp = prog(lt, bigAt, 1.6), v = lerp(B.from ?? 0, B.to, bp);
            big.textContent = fmtNum(v, B.dec ?? 0);
            pop(big, 330, 520, spring(lt, bigAt, 0.6), 0, boil(sd + 70, t, 1));
            pop(bigL, 330, 610, spring(lt, bigAt + 0.2, 0.6), -2, boil(sd + 71, t, 1));
            pop(note, 330, 690, spring(lt, bigAt + 0.5, 0.6), 2, boil(sd + 72, t, 1));
          } else {
            big.setAttribute('opacity', 0); bigL.setAttribute('opacity', 0);
            pop(note, (GX0 + GX1) / 2, GY0 + rows * rowH + 70, spring(lt, hitAt + 0.8, 0.6), 2, boil(sd + 72, t, 1));
          }
          castUpdate(cast, lt, t, cues, W, H, 860);
        },
      };
    },
  };

  // ================================================================ tr_c_mirror
  SH.tr_c_mirror = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 101, mode = P.mode || 'kids';
      const years = P.years || ['1976', '2076'];
      const root = el(svg, 'g'), mid = el(root, 'g'), actors = el(root, 'g'), ui = el(root, 'g');
      const M = [{ x: 600, col: INK.ink }, { x: 1320, col: INK.red }].map((m, i) => {
        const g = el(mid, 'g');
        return Object.assign(m, { g, handle: mk(g, INK.paperDark), handleR: mk(g), glass: mk(g, INK.paperLight), frame: mk(g), frame2: mk(g, INK.inkSoft),
          scene: mk(g), sceneB: mk(g, INK.blue), sceneR: mk(g, INK.red), bag: mk(g, INK.blue, { 'fill-opacity': 0.8 }),
          year: text(ui, years[i], 84, FR, m.col, { 'font-weight': 900 }) });
      });
      const cast = castOf(P, actors, seed, 0.55);
      const CY = 480, RX = 250, RY = 275;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.3 }, x);
          const rAt = atOr(cues, 'right', dur * 0.45), hitAt = atOr(cues, 'hit', null);
          cam(root, lt, dur, W, H, punch(lt, rAt) + punch(lt, hitAt));
          M.forEach((m, i) => {
            const ap = spring(lt, i ? Math.max(0.2, rAt - 0.35) : 0, 0.8), s = lerp(0.4, 1, clamp01(ap));
            const tilt = (i ? 3 : -3) + Math.sin(lt * 0.7 + i) * 1.2;
            m.g.setAttribute('opacity', clamp01(ap * 2).toFixed(3));
            m.g.setAttribute('transform', `translate(${m.x} ${CY}) rotate(${f1(tilt)}) scale(${s.toFixed(3)}) translate(${-m.x} ${-CY})`);
            const hp = [[m.x - 34, CY + RY - 10], [m.x + 34, CY + RY - 10], [m.x + 26, CY + RY + 150], [m.x - 26, CY + RY + 150]];
            fillD(m.handle, hp, O(1 + i * 50, { smooth: false })); line(m.handleR, hp, O(1 + i * 50, { w: 6, closed: true, smooth: false }));
            const ov = inkEllipsePts(m.x, CY, RX, RY, sd + 2 + i, 26, 0, 0.012);
            fillD(m.glass, ov, O(2 + i * 50, { amp: 1 }));
            line(m.frame, ov, O(3 + i * 50, { w: 16, closed: true }));
            line(m.frame2, inkEllipsePts(m.x, CY, RX - 26, RY - 26, sd + 4 + i, 24, 0, 0.012), O(4 + i * 50, { w: 4, closed: true }));
            pop(m.year, m.x, CY - RY + 135, spring(lt, (i ? rAt : 0.2), 0.6), i ? 3 : -3, boil(sd + 5 + i, t, 1));
            // contents
            const cIn = i ? lt >= rAt - 0.2 : lt >= 0.3;
            const gy = CY + RY * 0.66;
            let d = '', db = '', dr = '', bag = '';
            if (cIn) {
              const k = i ? spring(lt, rAt, 0.7) : spring(lt, 0.3, 0.7), hk = clamp01(k);
              d += inkPath([[m.x - RX + 80, gy], [m.x + RX - 80, gy]], O(10 + i * 50, { w: 5 })) + ' ';
              if (mode === 'kids') {
                if (!i) {
                  [-150, -30, 110].forEach((dx, j) => { d += figure(m.x + dx, gy, 180 * hk + 1, 'child', lt + j * 0.8, sd + 20 + j * 20, t, j === 2 ? -1 : 1) + ' '; });
                  const u = (lt * 0.6) % 1, bx = lerp(m.x - 90, m.x + 50, u), by = gy - 190 - Math.sin(u * Math.PI) * 70;
                  db += inkCircle(bx, by, 22 * hk + 0.1, sd + 30, t, { fill: true });
                } else {
                  const bp = [[m.x - 200, gy - 80], [m.x + 90, gy - 80]];
                  d += inkPath(bp, O(40, { w: 10 })) + ' ' + inkPath([[m.x - 190, gy - 80], [m.x - 190, gy]], O(41, { w: 6 })) + ' ' + inkPath([[m.x + 80, gy - 80], [m.x + 80, gy]], O(42, { w: 6 })) + ' ';
                  dr += figure(m.x - 130, gy, 210 * hk + 1, 'elder', lt, sd + 60, t, 1) + ' ' + figure(m.x + 10, gy, 205 * hk + 1, 'elder', lt + 1, sd + 80, t, -1) + ' ';
                  d += figure(m.x + 170, gy, 130 * hk + 1, 'child', lt + 0.5, sd + 100, t, -1) + ' ';
                  // a tree in the park
                  const tx = m.x - 210;
                  db += inkCircle(tx + 10, gy - 300, 50 * hk + 0.1, sd + 110, t, { fill: true });
                  d += inkPath([[tx + 10, gy - 80], [tx + 10, gy - 260]], O(111, { w: 7 })) + ' ';
                }
              } else {   // same person: pupil -> elder
                if (!i) { d += figure(m.x, gy, 210 * hk + 1, 'adult', lt * 1.2, sd + 20, t, 1) + ' '; bag += inkLoop(bagPts(m.x, gy, 210 * hk + 1), O(21, { smooth: false })); }
                else dr += figure(m.x, gy, 250 * hk + 1, 'elder', lt, sd + 60, t, 1) + ' ';
              }
            }
            m.scene.setAttribute('d', d); m.sceneB.setAttribute('d', db); m.sceneR.setAttribute('d', dr); m.bag.setAttribute('d', bag);
            m.sceneB.setAttribute('fill', mode === 'kids' && i ? INK.green : INK.blue);
          });
          castUpdate(cast, lt, t, cues, W, H, 860);
        },
      };
    },
  };
})();
