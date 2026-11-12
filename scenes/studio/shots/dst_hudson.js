// dst_hudson: who invented daylight saving time (George Vernon Hudson, Wellington 1895; Germany 1916) in parchment ink
// (brand/kit/BRAND.md §3, §5). Written for the Stickstory Short ag-01-daylight-saving-time (2026-11-12), parametric
// enough for any clock / time / insect-collector story. Palette tokens only (INK.*), every line boils at 8 Hz through
// _ink.js, everything is a pure function of (seed, lt); no Math.random. Uses mcB__lib.js (window.MCB: cast, labels).
//
// Common P: kasif: Kaşif cast entry {x, y (ground 0..1 H), scale, pose, face, dir, emotion, seq} (MCB, who "kasif"),
//           cast: [more MCB cast entries], labels: [MCB label entries {text, x, y, at, size, color, stamp, arrow}],
//           zoom: 1.04 (slow internal push), focus: [0.5, 0.5].   cues: hit (punch), label/cast cue names.
//
// SHOTS.dst_clock — a big hand-drawn clock face (rim, ticks, Roman XII/III/VI/IX, hands, red hub).
//   P: {mode: "steal"|"tower"|"jump"|"wall", time: [h, m] (start), to: [h, m] (end time), at: cue (hands move),
//       cx, cy (0..1), r (px)}
//   steal: night bedroom: the clock above, a bearded collector (left) swings his butterfly net and catches a winged
//          "1 HOUR" token that flies out of the clock on cue `at`; a quilt across the bottom (Kaşif sits up in bed).
//   tower: a town clock tower at dark morning (8:00), street lamp, children with satchels walking under it, pavement.
//   jump:  close-up of a wall clock over a post-office counter; on `at` the hands sweep forward (gold arc).
//   wall:  four clocks with city plates (P.cities: ["BERLIN", ...]); from `at` each jumps +1 hour in turn; desk below.
// SHOTS.dst_post — a post-office counter in Wellington: pigeonhole rack full of letters, a window where the sun goes
//   down, a small wall clock at five, the clerk (bearded, bare-headed) stamping letters, then turning to the window.
//   P: {stamp: cue (he starts stamping), look: cue (turns to the window)}
// SHOTS.dst_bugs — the collector outdoors. P: {mode: "hunt"|"lamp", net: cue (net swing), moths: 6, who: false (no
//   collector: lamp mode with Kaşif only)}
//   hunt: dusk meadow, low sun, fern and grass foreground, the collector sweeps his net through fluttering moths.
//   lamp: night, a lantern on a post with moths circling, the collector smiling, a specimen case of pinned moths in front.
// SHOTS.dst_hall — a learned-society lecture room: blackboard with a chalk clock "+2", lectern, the speaker holding his
//   paper; the audience (heads and shoulders, bearded) fills the bottom; on `laugh` they rock with laughter.
//   P: {laugh: cue}
// SHOTS.dst_coal — a 1916 factory town: three smokestacks puffing, a factory clock that jumps forward one hour on `at`,
//   a big coal heap with a shovel filling the bottom, lumps tumbling. P: {at: cue}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const FR = 'Fraunces, Georgia, serif';
  const D2R = Math.PI / 180;

  function extras(root, P, W, H, sd) {
    const M = window.MCB;
    const list = (P.kasif ? [Object.assign({ who: 'kasif' }, P.kasif)] : []).concat(P.cast || []);
    const k = list.length && M ? M.cast(el(root, 'g'), list, W, H, sd + 501) : null;
    const lbG = el(root.ownerSVGElement || root, 'g');
    const lb = M ? M.labels(lbG, P.labels || [], W, H, sd + 601) : null;
    return { update(lt, t, cues) { if (k) k.update(lt, t, cues); if (lb) lb.update(lt, t, cues); } };
  }
  function camOf(g, lt, dur, W, H, focus, zoom, hit) {
    const fx = focus[0] * W, fy = focus[1] * H, z = lerp(1, zoom, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.03 * hit);
    g.setAttribute('transform', `translate(${f1(fx)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
  }
  // a period figure (bare head, beard) whose hands are returned in stage px
  function figure(parent, o) {
    const rig = KASIF.create(el(parent, 'g'), { scale: o.scale, hat: false, accessory: o.acc || null, beard: o.beard === undefined ? 'short' : o.beard, seed: o.seed });
    return {
      update(t, pose, x, y, opts = {}) {
        const r = rig.update(t, pose, Object.assign({ x, y }, opts));
        const f = opts.face ?? 1, s = o.scale;
        const hs = r && r.hands ? r.hands.map(h => [x + f * s * h[0], y + s * h[1]]) : [[x, y - 200 * s], [x, y - 200 * s]];
        hs.head = r && r.head ? [x + f * s * r.head[0], y + s * r.head[1]] : [x, y - 470 * s];
        hs.hr = 72 * s;
        return hs;
      },
    };
  }

  // ------------------------------------------------------------ clock face
  function clock(parent, sd, o = {}) {
    const rimF = inkEl(parent, o.rimFill || INK.paperDark), faceF = inkEl(parent, INK.paperLight), rimR = inkEl(parent);
    const ticks = inkEl(parent), arc = inkEl(parent, INK.gold, { 'fill-opacity': 0.55 });
    const nums = ['XII', 'III', 'VI', 'IX'].map(n => { const tx = el(parent, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink }); tx.textContent = n; return tx; });
    const hourH = inkEl(parent), minH = inkEl(parent), hub = inkEl(parent, INK.red);
    return {
      update(t, cx, cy, R, hh, mm, arcFrom = null) {
        rimF.setAttribute('d', inkCircle(cx, cy, R * 1.1, sd + 1, t, { fill: true }));
        faceF.setAttribute('d', inkCircle(cx, cy, R, sd + 2, t, { fill: true }));
        rimR.setAttribute('d', inkCircle(cx, cy, R * 1.1, sd + 3, t, { w: Math.max(5, R * 0.03) }) + ' ' + inkCircle(cx, cy, R, sd + 4, t, { w: Math.max(4, R * 0.022) }));
        let td = '';
        for (let i = 0; i < 60; i++) {
          const a = i * 6 * D2R, big = i % 5 === 0, r0 = R * (big ? 0.84 : 0.9), r1 = R * 0.96;
          if (!big && R < 160) continue;
          td += inkPath([[cx + Math.sin(a) * r0, cy - Math.cos(a) * r0], [cx + Math.sin(a) * r1, cy - Math.cos(a) * r1]], { w: big ? Math.max(4, R * 0.028) : Math.max(2, R * 0.01), seed: sd + 10 + i, t, amp: 0.6 }) + ' ';
        }
        ticks.setAttribute('d', td);
        nums.forEach((tx, i) => {
          const a = i * 90 * D2R, rr = R * 0.66, b = boil(sd + 80 + i, t, 1);
          tx.setAttribute('x', f1(cx + Math.sin(a) * rr + b[0])); tx.setAttribute('y', f1(cy - Math.cos(a) * rr + b[1]));
          tx.setAttribute('font-size', f1(Math.max(44, R * 0.2)));
          tx.style.display = R < 120 ? 'none' : '';
        });
        const ha = ((hh % 12) + mm / 60) * 30 * D2R, ma = (mm % 60) * 6 * D2R;
        if (arcFrom != null && Math.abs(arcFrom - ha) > 0.01) {     // gold sweep showing how far the hour hand jumped
          const pts = [[cx, cy]], n = 24;
          for (let k = 0; k <= n; k++) { const a = lerp(arcFrom, ha, k / n); pts.push([cx + Math.sin(a) * R * 0.8, cy - Math.cos(a) * R * 0.8]); }
          arc.setAttribute('d', inkLoop(pts, { seed: sd + 90, t, amp: 0.8, smooth: false }));
        } else arc.setAttribute('d', '');
        const hand = (a, L, wd, tail) => {
          const s = Math.sin(a), c = -Math.cos(a), px = -c, py = s;
          return [[cx - s * tail + px * wd * 0.6, cy - c * tail + py * wd * 0.6], [cx + s * L * 0.7 + px * wd, cy + c * L * 0.7 + py * wd], [cx + s * L, cy + c * L],
                  [cx + s * L * 0.7 - px * wd, cy + c * L * 0.7 - py * wd], [cx - s * tail - px * wd * 0.6, cy - c * tail - py * wd * 0.6]];
        };
        hourH.setAttribute('d', inkLoop(hand(ha, R * 0.5, R * 0.06, R * 0.1), { seed: sd + 91, t, amp: 0.8, smooth: false }));
        minH.setAttribute('d', inkLoop(hand(ma, R * 0.78, R * 0.035, R * 0.14), { seed: sd + 92, t, amp: 0.8, smooth: false }));
        hub.setAttribute('d', inkDot(cx, cy, R * 0.06, R * 0.06, sd + 93, t));
      },
    };
  }
  const clockAt = (tm, to, p) => { const a = tm[0] * 60 + tm[1], b = to[0] * 60 + to[1], v = lerp(a, b, p); return [Math.floor(v / 60), v % 60]; };

  // ------------------------------------------------------------ butterfly net (pole from a hand along an angle)
  function net(parent, sd) {
    const pole = inkEl(parent, INK.ink), bag = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.45 }), mesh = inkEl(parent, INK.inkSoft), hoop = inkEl(parent);
    return {
      update(t, hand, ang, L, R, sway = 0) {
        const tx = hand[0] + Math.cos(ang) * L, ty = hand[1] - Math.sin(ang) * L;
        pole.setAttribute('d', inkPath([[hand[0] - Math.cos(ang) * 30, hand[1] + Math.sin(ang) * 30], [tx, ty]], { w: 7, seed: sd + 1, t, amp: 0.8 }));
        const nx = Math.cos(ang), ny = -Math.sin(ang);
        const cx = tx + nx * R, cy = ty + ny * R;
        const hp = inkEllipsePts(cx, cy, R, R * 0.5, sd + 2, 12, Math.atan2(ny, nx) + Math.PI / 2);
        hoop.setAttribute('d', inkPath(hp, { w: 6, seed: sd + 3, t, closed: true, amp: 0.8 }));
        // the bag hangs below the hoop (gravity), swinging a little
        const tip = [cx + sway * R * 0.6, cy + R * 2.1];
        const rim = hp.slice();
        const left = rim.reduce((a, q) => q[0] < a[0] ? q : a), right = rim.reduce((a, q) => q[0] > a[0] ? q : a);
        const mid = (u) => [lerp(left[0], tip[0], u) * 0.5 + lerp(right[0], tip[0], u) * 0.5, lerp(cy, tip[1], u)];
        const bw = (u) => (right[0] - left[0]) / 2 * (1 - u * 0.85) * (1 + 0.15 * Math.sin(u * 3));
        const out = [], back = [];
        for (let k = 0; k <= 8; k++) { const u = k / 8, m = mid(u); out.push([m[0] + bw(u) + sway * 20 * u, m[1]]); back.push([m[0] - bw(u) + sway * 20 * u, m[1]]); }
        bag.setAttribute('d', inkLoop(out.concat(back.reverse()), { seed: sd + 4, t, amp: 1 }));
        let md = inkPath(out, { w: 4, seed: sd + 5, t, amp: 0.8 }) + ' ' + inkPath(back, { w: 4, seed: sd + 6, t, amp: 0.8 }) + ' ';
        for (let k = 1; k < 5; k++) { const u = k / 5; const pts = []; for (let j = 0; j <= 8; j++) { const v = j / 8, m = mid(v); pts.push([m[0] + bw(v) * lerp(-1, 1, u) + sway * 20 * v, m[1]]); } md += inkPath(pts, { w: 2.2, seed: sd + 10 + k, t, amp: 0.6 }) + ' '; }
        for (let k = 1; k < 5; k++) { const u = k / 5, m = mid(u); md += inkPath([[m[0] - bw(u) + sway * 20 * u, m[1]], [m[0] + sway * 20 * u, m[1] + 10], [m[0] + bw(u) + sway * 20 * u, m[1]]], { w: 2.2, seed: sd + 20 + k, t, amp: 0.6 }) + ' '; }
        mesh.setAttribute('d', md);
        return { mouth: [cx, cy], tip, inside: mid(0.45) };
      },
    };
  }

  // ------------------------------------------------------------ moths (top view, flapping)
  function moths(parent, sd, n) {
    const wings = inkEl(parent, INK.paperLight), wingR = inkEl(parent), body = inkEl(parent, INK.ink), spots = inkEl(parent, INK.gold);
    return {
      update(t, list) {   // list: [{x, y, s, ph, rot}]
        let wf = '', wr = '', bd = '', sp = '';
        list.slice(0, n).forEach((m, i) => {
          const k = 0.3 + 0.7 * Math.abs(Math.sin(t * 13 + m.ph)), s = m.s, c = Math.cos(m.rot || 0), sn = Math.sin(m.rot || 0);
          const P = (x, y) => [m.x + (x * c - y * sn) * s, m.y + (x * sn + y * c) * s];
          [-1, 1].forEach(side => {
            const up = [P(0, -4), P(side * 46 * k, -34), P(side * 58 * k, -6), P(side * 10 * k, 4)];
            const lo = [P(0, 2), P(side * 40 * k, 8), P(side * 30 * k, 32), P(side * 6 * k, 18)];
            [up, lo].forEach((w, j) => { wf += inkLoop(w, { seed: sd + i * 9 + j + (side > 0 ? 4 : 0), t, amp: 0.5 }) + ' '; wr += inkPath(w, { w: 3, seed: sd + i * 9 + j + 40, t, closed: true, amp: 0.5 }) + ' '; });
            const q = P(side * 34 * k, -16); sp += inkDot(q[0], q[1], 5 * s * k + 1, 5 * s, sd + i * 3 + 70, t) + ' ';
          });
          const b0 = P(0, -14), b1 = P(0, 26);
          bd += inkPath([b0, b1], { w: 9 * s, seed: sd + i * 5 + 90, t, amp: 0.5 }) + ' ' +
            inkPath([P(0, -14), P(-12, -34)], { w: 2.5, seed: sd + i * 5 + 91, t, amp: 0.5 }) + ' ' + inkPath([P(0, -14), P(12, -34)], { w: 2.5, seed: sd + i * 5 + 92, t, amp: 0.5 }) + ' ';
        });
        wings.setAttribute('d', wf); wingR.setAttribute('d', wr); body.setAttribute('d', bd); spots.setAttribute('d', sp);
      },
    };
  }
  const flutter = (i, t, cx, cy, rx, ry, sp = 0.9) => {
    const r = rng(9137 + i * 31); const a0 = r() * 6.28, sx = 0.6 + r() * 0.8, sy = 0.9 + r() * 1.1;
    return { x: cx + Math.cos(t * sp * sx + a0) * rx * (0.5 + 0.5 * r()) + Math.sin(t * 2.3 + i) * 14, y: cy + Math.sin(t * sp * sy + a0 * 1.3) * ry * (0.5 + 0.5 * r()) + Math.cos(t * 3.1 + i) * 10,
      s: 0.7 + r() * 0.4, ph: i * 1.7, rot: Math.sin(t * 1.3 + i) * 0.5 };
  };

  // ------------------------------------------------------------ foreground bands
  function grassBand(parent, W, H, y0, sd, col = INK.green) {
    const f = inkEl(parent, INK.paperDark), blades = inkEl(parent, col), lines = inkEl(parent, INK.inkSoft);
    const r = rng(sd + 3), B = Array.from({ length: 34 }, () => [r(), r(), r()]);
    return { update(t) {
      const top = []; for (let x = -40; x <= W + 40; x += 60) top.push([x, y0 + Math.sin(x * 0.02) * 14]);
      f.setAttribute('d', inkLoop(top.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 1, t, amp: 1, smooth: false }));
      let bd = '', ld = '';
      B.forEach((b, i) => {
        const x = b[0] * W, base = y0 + 60 + b[1] * (H - y0 - 40), h = 140 + b[2] * 260, sw = Math.sin(t * 1.4 + i) * 24;
        bd += inkPath([[x, base], [x + sw * 0.4 + 10, base - h * 0.5], [x + sw + 20, base - h]], { w: 7 + b[2] * 5, seed: sd + 10 + i, t, amp: 1, taper: 0.8 }) + ' ';
        if (i % 3 === 0) {   // fern frond: a spine with little leaves
          const sp = [[x + 30, base], [x + 60 + sw, base - h * 0.45], [x + 120 + sw * 1.3, base - h * 0.75]];
          ld += inkPath(sp, { w: 4, seed: sd + 60 + i, t, amp: 1 }) + ' ';
          for (let k = 1; k < 6; k++) { const u = k / 6, px = lerp(x + 30, x + 120 + sw * 1.3, u), py = lerp(base, base - h * 0.75, u); ld += inkPath([[px, py], [px - 34 * (1 - u * 0.5), py - 16]], { w: 3, seed: sd + 80 + i * 6 + k, t }) + ' ' + inkPath([[px, py], [px + 30 * (1 - u * 0.5), py - 26]], { w: 3, seed: sd + 120 + i * 6 + k, t }) + ' '; }
        }
      });
      blades.setAttribute('d', bd); lines.setAttribute('d', ld);
    } };
  }

  // ============================================================ dst_clock
  SH.dst_clock = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 211;
      const mode = P.mode || 'jump';
      const root = el(svg, 'g'), cam = el(root, 'g');
      const t0 = P.time || [2, 0], t1 = P.to || [t0[0] + 1, t0[1]];
      const L = {};
      if (mode === 'steal') {
        L.clk = clock(cam, sd + 10);
        L.mo = moths(cam, sd + 45, 3);
        L.fig = figure(cam, { scale: P.fig_scale ?? 1.55, seed: sd + 20 });
        L.net = net(cam, sd + 30);
        // the token is drawn in front of the mesh so its label stays readable (it sits in the bag's mouth)
        L.tokW = moths(cam, sd + 40, 1);
        L.tokF = inkEl(cam, INK.gold); L.tokR = inkEl(cam);
        L.tokT = el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 60, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink }); L.tokT.textContent = P.token || '1 HOUR';
        L.hbF = inkEl(cam, INK.stain); L.hbR = inkEl(cam); L.hbH = inkEl(cam, INK.inkSoft);
        L.pilF = inkEl(cam, INK.paperLight); L.pilR = inkEl(cam);
        L.ex = extras(cam, P, W, H, sd);
        L.bedF = inkEl(cam, INK.blue); L.bedR = inkEl(cam); L.bedP = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.8 });
      } else if (mode === 'tower') {
        L.towF = inkEl(cam, INK.paperDark); L.towR = inkEl(cam); L.towH = inkEl(cam, INK.inkSoft); L.roofF = inkEl(cam, INK.ink);
        L.clk = clock(cam, sd + 10);
        L.lampG = inkEl(cam, INK.gold, { 'fill-opacity': 0.3 }); L.lampF = inkEl(cam, INK.gold); L.lampR = inkEl(cam);
        L.paveF = inkEl(cam, INK.paperDark); L.paveR = inkEl(cam, INK.inkSoft);
        L.ex = extras(cam, P, W, H, sd);
        L.rail = inkEl(cam);
      } else if (mode === 'jump') {
        L.wallH = inkEl(cam, INK.inkSoft);
        L.clk = clock(cam, sd + 10, { rimFill: INK.stain });
        L.ctrF = inkEl(cam, INK.paperDark); L.ctrR = inkEl(cam); L.ctrH = inkEl(cam, INK.inkSoft);
        L.letF = inkEl(cam, INK.paperLight); L.letR = inkEl(cam); L.stampF = inkEl(cam, INK.red);
        L.ex = extras(cam, P, W, H, sd);
      } else {   // wall
        L.clks = [0, 1, 2, 3].map(i => clock(cam, sd + 10 + i * 100, { rimFill: INK.stain }));
        L.plateF = inkEl(cam, INK.paperLight); L.plateR = inkEl(cam);
        L.names = (P.cities || ['BERLIN', 'LONDON', 'PARIS', 'NEW YORK']).slice(0, 4).map(n => { const tx = el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 52, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.ink }); tx.textContent = n; return tx; });
        L.deskF = inkEl(cam, INK.paperDark); L.deskR = inkEl(cam); L.deskH = inkEl(cam, INK.inkSoft); L.papF = inkEl(cam, INK.paperLight); L.papR = inkEl(cam);
        L.ex = extras(cam, P, W, H, sd);
      }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const at = atOr(cues, P.at, dur * 0.4);
          camOf(cam, lt, dur, W, H, P.focus || [0.5, 0.45], P.zoom ?? 1.04, hit);
          if (mode === 'steal') {
            const cx = (P.cx ?? 0.66) * W, cy = (P.cy ?? 0.27) * H, R = P.r ?? 200;
            const jp = progIO(lt, at + 0.2, 0.5);
            const [hh, mm] = clockAt(t0, t1, jp);
            L.clk.update(t, cx + Math.sin(lt * 30) * 5 * punch(lt, at + 0.7, 0.6), cy, R, hh, mm);
            L.mo.update(t, [0, 1, 2].map(i => flutter(i + 3, t, cx - 60, cy - 40, 330, 200, 1.3)));
            // the collector (left) lifts his net; after the catch the bag struggles
            const fx = (P.fig_x ?? 0.22) * W, fy = (P.fig_y ?? 0.67) * H;
            const sw = progIO(lt, at - 0.4, 0.8), caught = clamp01((lt - at - 1.0) / 0.2);
            const hands = L.fig.update(t, 'point', fx, fy, { face: 1, since: lt, dir: lerp(15, 32, sw), emotion: caught > 0 ? 'happy' : 'neutral' });
            const hand = hands[0][0] > hands[1][0] ? hands[0] : hands[1];
            const ang = lerp(14, 26, sw) * D2R + Math.sin(lt * 1.8) * 0.03 + caught * Math.sin(lt * 11) * 0.04;
            const N0 = { ang };
            // the winged hour: flies out of the clock at `at`, loops up and dives into the bag
            const fp = progIO(lt, at, 1.1);
            const p0 = [cx, cy - R * 0.55], p1 = [cx + R * 0.9, cy - R * 1.0], p2 = [cx - R * 1.5, cy - R * 0.8];
            const bz = (u, q) => (1 - u) * (1 - u) * (1 - u) * p0[q] + 3 * (1 - u) * (1 - u) * u * p1[q] + 3 * (1 - u) * u * u * p2[q];
            // net first (to know where the bag is), drawn on top of the token
            const N = L.net.update(t, hand, N0.ang, P.pole ?? 260, P.hoop ?? 95, caught * Math.sin(lt * 9) * 0.5 + Math.sin(lt * 2) * 0.15);
            const tgt = N.inside;
            const x = fp < 1 ? bz(fp, 0) + fp * fp * fp * tgt[0] + caught * Math.sin(lt * 13) * 10 : tgt[0] + Math.sin(lt * 13) * 10;
            const y = fp < 1 ? bz(fp, 1) + fp * fp * fp * tgt[1] : tgt[1] + Math.cos(lt * 11) * 8;
            const vis = lt >= at - 0.05 ? 1 : 0, s = lerp(1, 0.75, fp) * (1 + 0.15 * punch(lt, at, 0.5));
            const TK = P.token_scale ?? 1.4;
            L.tokW.update(t, vis ? [{ x, y: y + 8, s: 3.0 * TK * s, ph: 0, rot: Math.sin(lt * 5) * 0.15 }] : []);
            L.tokF.setAttribute('d', vis ? inkCircle(x, y, 84 * TK * s, sd + 50, t, { fill: true }) : '');
            L.tokR.setAttribute('d', vis ? inkCircle(x, y, 84 * TK * s, sd + 51, t, { w: 7 }) : '');
            L.tokT.setAttribute('x', f1(x)); L.tokT.setAttribute('y', f1(y)); L.tokT.setAttribute('textLength', f1(140 * TK * s)); L.tokT.setAttribute('font-size', f1(44 * TK * s)); L.tokT.setAttribute('lengthAdjust', 'spacingAndGlyphs'); L.tokT.style.display = vis ? '' : 'none';
            // bed (right): headboard with posts and knobs, pillow, Kaşif sitting up, quilt
            const bx0 = (P.bed_x ?? 0.5) * W, by = (P.bed_y ?? 0.8) * H, top = by - 330;
            const hb = [[bx0, by + 60], [bx0, top + 60], [bx0 + 40, top + 10], [(bx0 + W) / 2, top - 30], [W - 20, top + 10], [W + 40, top + 60], [W + 40, by + 60]];
            L.hbF.setAttribute('d', inkLoop(hb, { seed: sd + 140, t, amp: 0.8 }));
            let hr = inkPath(hb.slice(0, 6), { w: 8, seed: sd + 141, t, amp: 1 });
            hr += ' ' + inkPath([[bx0 - 10, by + 80], [bx0 - 10, top - 40]], { w: 16, seed: sd + 142, t }) + ' ' + inkDot(bx0 - 10, top - 64, 26, 24, sd + 143, t);
            L.hbR.setAttribute('d', hr);
            let hs = ''; for (let k = 1; k < 6; k++) { const x0 = bx0 + k * (W - bx0) / 6; hs += inkPath([[x0, top + 60], [x0, by + 20]], { w: 5, seed: sd + 150 + k, t }) + ' '; }
            L.hbH.setAttribute('d', hs);
            const pil = inkEllipsePts((P.pillow_x ?? 0.76) * W, by - 70, 230, 80, sd + 130, 12);
            L.pilF.setAttribute('d', inkLoop(pil, { seed: sd + 131, t }));
            L.pilR.setAttribute('d', inkPath(pil, { w: 6, seed: sd + 132, t, closed: true }) + ' ' + inkPath([[pil[0][0] - 60, by - 90], [pil[0][0] - 20, by - 60]], { w: 4, seed: sd + 133, t }));
            L.ex.update(lt, t, cues);
            const qy = by + 20;
            const qt = []; for (let xx = -40; xx <= W + 40; xx += 80) qt.push([xx, qy + (xx < bx0 ? 60 : 0) + Math.sin(xx * 0.015 + 1) * 18 + Math.sin(lt * 1.2) * 3]);
            L.bedF.setAttribute('d', inkLoop(qt.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 60, t, amp: 1 }));
            let qr = inkPath(qt, { w: 8, seed: sd + 61, t }), pd = '';
            for (let row = 0; row < 3; row++) for (let col = 0; col < 7; col++) {
              const px = col * 170 - 30 + (row % 2) * 85, py = qy + 70 + row * 120;
              if ((row + col) % 2 === 0) pd += inkLoop(rect(px, py, px + 90, py + 70), { seed: sd + 70 + row * 7 + col, t, amp: 1, smooth: false }) + ' ';
              qr += ' ' + inkPath([[px - 20, py + 95], [px + 150, py + 95]], { w: 3, seed: sd + 100 + row * 7 + col, t });
            }
            L.bedP.setAttribute('d', pd); L.bedR.setAttribute('d', qr);
          } else if (mode === 'tower') {
            const cx = (P.cx ?? 0.5) * W, cy = (P.cy ?? 0.27) * H, R = P.r ?? 190, gy = (P.ground ?? 0.6) * H;
            const tw = R * 1.5;
            const body = rect(cx - tw, cy - R * 1.35, cx + tw, gy);
            L.towF.setAttribute('d', inkLoop(body, { seed: sd + 1, t, amp: 1, smooth: false }));
            const roof = [[cx - tw - 30, cy - R * 1.35], [cx, cy - R * 2.6], [cx + tw + 30, cy - R * 1.35]];
            L.roofF.setAttribute('d', inkLoop(roof, { seed: sd + 2, t, amp: 1, smooth: false }));
            let tr = inkPath(body, { w: 7, seed: sd + 3, t, closed: true, smooth: false });
            let th = '';
            for (let y = cy + R * 1.4; y < gy - 20; y += 46) th += inkPath([[cx - tw + 10, y], [cx + tw - 10, y]], { w: 2.5, seed: sd + 10 + Math.round(y), t }) + ' ';
            [[-0.55, 0.62], [0.55, 0.62]].forEach(([u, v], i) => { const wx = cx + u * tw, wy = cy + R * 1.7 + v * 100; const wr = rect(wx - 40, wy - 60, wx + 40, wy + 60); tr += ' ' + inkPath(wr, { w: 5, seed: sd + 30 + i, t, closed: true, smooth: false }); });
            const door = [[cx - 80, gy], [cx - 80, gy - 170], [cx, gy - 230], [cx + 80, gy - 170], [cx + 80, gy]];
            tr += ' ' + inkPath(door, { w: 6, seed: sd + 40, t });
            L.towR.setAttribute('d', tr); L.towH.setAttribute('d', th);
            // dark morning: 7:59 ticking to 8:00
            const mm = 59 + clamp01(lt / Math.max(1, dur * 0.5));
            L.clk.update(t, cx, cy, R, 7, mm);
            // street lamp (left) with a soft gold glow
            const lx = 0.13 * W, ly = gy - 520 + 0;
            L.lampG.setAttribute('d', inkCircle(lx, ly, 120 + Math.sin(lt * 3) * 6, sd + 50, t, { fill: true }));
            L.lampF.setAttribute('d', inkLoop(rect(lx - 34, ly - 40, lx + 34, ly + 40), { seed: sd + 51, t, amp: 0.8, smooth: false }));
            L.lampR.setAttribute('d', inkPath(rect(lx - 34, ly - 40, lx + 34, ly + 40), { w: 6, seed: sd + 52, t, closed: true, smooth: false }) + ' ' +
              inkPath([[lx - 50, ly - 40], [lx, ly - 80], [lx + 50, ly - 40]], { w: 6, seed: sd + 53, t, smooth: false }) + ' ' + inkPath([[lx, ly + 40], [lx, H * 0.86]], { w: 10, seed: sd + 54, t }));
            // pavement down to the bottom
            const py = gy + 10, pave = [[-40, py], [W + 40, py], [W + 40, H + 40], [-40, H + 40]];
            L.paveF.setAttribute('d', inkLoop(pave, { seed: sd + 60, t, amp: 0.8, smooth: false }));
            let pv = '';
            for (let k = 0; k < 7; k++) { const y = py + 40 + k * k * 22; if (y > H) break; pv += inkPath([[-40, y], [W + 40, y]], { w: 3 + k * 0.6, seed: sd + 70 + k, t }) + ' '; }
            for (let k = -6; k <= 6; k++) pv += inkPath([[W / 2 + k * 70, py], [W / 2 + k * 260, H + 20]], { w: 3, seed: sd + 90 + k, t }) + ' ';
            L.paveR.setAttribute('d', pv);
            L.ex.update(lt, t, cues);
            L.rail.setAttribute('d', inkPath([[-20, H * 0.92], [W + 20, H * 0.92]], { w: 9, seed: sd + 120, t }) + ' ' +
              Array.from({ length: 12 }, (_, k) => inkPath([[k * 100 + 10, H * 0.92], [k * 100 + 10, H + 20]], { w: 7, seed: sd + 130 + k, t })).join(' '));
          } else if (mode === 'jump') {
            const cx = (P.cx ?? 0.5) * W, cy = (P.cy ?? 0.34) * H, R = P.r ?? 360;
            let wh = ''; for (let k = 0; k < 14; k++) { const y = 120 + k * 80; wh += inkPath([[-20, y], [W + 20, y + 4]], { w: 2, seed: sd + 1 + k, t, amp: 1 }) + ' '; }
            L.wallH.setAttribute('d', wh);
            const p = progIO(lt, at, 0.9), shake = punch(lt, at + 0.9, 0.5);
            const [hh, mm] = clockAt(t0, t1, p);
            const ha0 = ((t0[0] % 12) + t0[1] / 60) * 30 * D2R;
            L.clk.update(t, cx + Math.sin(lt * 40) * 6 * shake, cy, R, hh, mm, lt > at ? ha0 : null);
            const ty = (P.counter ?? 0.66) * H;
            const ctr = [[-40, ty], [W + 40, ty - 10], [W + 40, H + 40], [-40, H + 40]];
            L.ctrF.setAttribute('d', inkLoop(ctr, { seed: sd + 20, t, amp: 0.8, smooth: false }));
            L.ctrR.setAttribute('d', inkPath([[-40, ty], [W + 40, ty - 10]], { w: 8, seed: sd + 21, t }) + ' ' + inkPath([[-40, ty + 50], [W + 40, ty + 40]], { w: 5, seed: sd + 22, t }));
            let ch = ''; for (let k = 0; k < 4; k++) { const x0 = 40 + k * 260; ch += inkPath(rect(x0, ty + 300, x0 + 220, ty + 640), { w: 5, seed: sd + 30 + k, t, closed: true, smooth: false }) + ' '; }
            L.ctrH.setAttribute('d', ch);
            // letters + a red rubber stamp on the counter
            let lf = '', lr = '';
            [[0.15, -0.02, -0.12], [0.3, -0.035, 0.1], [0.72, -0.03, -0.05]].forEach(([u, v, rot], i) => {
              const x = u * W, y = ty + v * H, c = Math.cos(rot), s = Math.sin(rot), Q = (a, b) => [x + a * c - b * s, y + a * s + b * c];
              const pts = [Q(-110, -60), Q(110, -60), Q(110, 60), Q(-110, 60)];
              lf += inkLoop(pts, { seed: sd + 40 + i, t, amp: 0.6, smooth: false }) + ' ';
              lr += inkPath(pts, { w: 4, seed: sd + 44 + i, t, closed: true, smooth: false }) + ' ' + inkPath([Q(-110, -60), Q(0, 10), Q(110, -60)], { w: 3, seed: sd + 48 + i, t, smooth: false }) + ' ';
            });
            L.letF.setAttribute('d', lf); L.letR.setAttribute('d', lr);
            L.stampF.setAttribute('d', inkLoop(rect(0.86 * W, ty - 120, 0.94 * W, ty - 30), { seed: sd + 60, t, amp: 0.6, smooth: false }) + ' ' + inkDot(0.9 * W, ty - 140, 34, 30, sd + 61, t));
            L.ex.update(lt, t, cues);
          } else {   // wall: four clocks jump +1 hour in turn
            const pos = [[0.28, 0.215], [0.72, 0.215], [0.28, 0.42], [0.72, 0.42]], R = P.r ?? 135;
            let pf = '', pr = '';
            pos.forEach(([u, v], i) => {
              const cx = u * W, cy = v * H, a = at + i * 0.45, p = progIO(lt, a, 0.5);
              const [hh, mm] = clockAt([P.base || 6, 0], [(P.base || 6) + 1, 0], p);
              const sc = 1 + 0.08 * punch(lt, a + 0.5, 0.5);
              L.clks[i].update(t, cx, cy, R * sc, hh + i * 0, mm, lt > a ? ((P.base || 6) % 12) * 30 * D2R : null);
              const plate = rect(cx - 150, cy + R * 1.18, cx + 150, cy + R * 1.18 + 76);
              pf += inkLoop(plate, { seed: sd + 300 + i, t, amp: 0.6, smooth: false }) + ' ';
              pr += inkPath(plate, { w: 5, seed: sd + 310 + i, t, closed: true, smooth: false }) + ' ';
              const b = boil(sd + 320 + i, t, 1);
              L.names[i].setAttribute('x', f1(cx + b[0])); L.names[i].setAttribute('y', f1(cy + R * 1.18 + 40 + b[1]));
              L.names[i].setAttribute('font-size', L.names[i].textContent.length > 7 ? 46 : 52);
            });
            L.plateF.setAttribute('d', pf); L.plateR.setAttribute('d', pr);
            const ty = (P.desk ?? 0.72) * H;
            L.deskF.setAttribute('d', inkLoop([[-40, ty], [W + 40, ty - 8], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 400, t, amp: 0.8, smooth: false }));
            L.deskR.setAttribute('d', inkPath([[-40, ty], [W + 40, ty - 8]], { w: 8, seed: sd + 401, t }) + ' ' + inkPath([[-40, ty + 46], [W + 40, ty + 38]], { w: 5, seed: sd + 402, t }));
            let dh = ''; for (let k = 0; k < 12; k++) { const y = ty + 120 + k * 50; if (y > H) break; dh += inkPath([[-20, y], [W + 20, y + 6]], { w: 2.5, seed: sd + 410 + k, t }) + ' '; }
            L.deskH.setAttribute('d', dh);
            // telegram slips sliding in on the desk
            let ff = '', fr = '';
            for (let i = 0; i < 9; i++) {   // 5 slips already on the desk, 4 more slide in as the clocks jump
              const late = i >= 5, k = late ? i - 5 : i, a = at + k * 0.45, sp = late ? prog(lt, a, 0.5) : 1;
              const x = late ? lerp(-200, 160 + k * 250, sp) : 110 + k * 215, y = late ? ty + 330 + (k % 2) * 150 : ty + 150 + (k % 2) * 330 + Math.sin(k * 2) * 20;
              const pts = rect(x - 100, y - 70, x + 100, y + 70);
              ff += inkLoop(pts, { seed: sd + 420 + i, t, amp: 0.6, smooth: false }) + ' ';
              fr += inkPath(pts, { w: 4, seed: sd + 430 + i, t, closed: true, smooth: false }) + ' ';
              for (let k = 0; k < 3; k++) fr += inkPath([[x - 70, y - 30 + k * 30], [x + 70 - k * 20, y - 30 + k * 30]], { w: 3, seed: sd + 440 + i * 3 + k, t }) + ' ';
            }
            L.papF.setAttribute('d', ff); L.papR.setAttribute('d', fr);
            L.ex.update(lt, t, cues);
          }
        },
      };
    },
  };

  // ============================================================ dst_post
  SH.dst_post = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 433;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const rackF = inkEl(cam, INK.paperDark), rackR = inkEl(cam), letF = inkEl(cam, INK.paperLight), letR = inkEl(cam);
      const winSky = inkEl(cam, INK.gold, { 'fill-opacity': 0.45 }), sun = inkEl(cam, INK.red, { 'fill-opacity': 0.85 }), hillsW = inkEl(cam, INK.blue, { 'fill-opacity': 0.6 }), winR = inkEl(cam);
      const clk = clock(cam, sd + 50, { rimFill: INK.stain });
      const fig = figure(cam, { scale: P.scale ?? 1.35, seed: sd + 60 });
      const stF = inkEl(cam, INK.red), stR = inkEl(cam), env = inkEl(cam, INK.paperLight), envR = inkEl(cam), mark = inkEl(cam, INK.red, { 'fill-opacity': 0.8 });
      const ctrF = inkEl(cam, INK.paperDark), ctrR = inkEl(cam), ctrH = inkEl(cam, INK.inkSoft), grill = inkEl(cam);
      const sackF = inkEl(cam, INK.stain), sackR = inkEl(cam);
      const ex = extras(cam, P, W, H, sd);
      return {
        update(lt, dur, cues, envr = {}) {
          const t = envr.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, lt, dur, W, H, [0.45, 0.45], P.zoom ?? 1.05, hit);
          // pigeonhole rack (left)
          const rx0 = 30, rx1 = 0.5 * W, ry0 = 0.13 * H, ry1 = 0.56 * H;
          rackF.setAttribute('d', inkLoop(rect(rx0, ry0, rx1, ry1), { seed: sd + 1, t, amp: 0.8, smooth: false }));
          let rr = inkPath(rect(rx0, ry0, rx1, ry1), { w: 7, seed: sd + 2, t, closed: true, smooth: false }), lf = '', lr = '';
          const cols = 4, rows = 6, cw = (rx1 - rx0) / cols, chh = (ry1 - ry0) / rows;
          for (let c = 1; c < cols; c++) rr += ' ' + inkPath([[rx0 + c * cw, ry0], [rx0 + c * cw, ry1]], { w: 4, seed: sd + 3 + c, t });
          for (let r = 1; r < rows; r++) rr += ' ' + inkPath([[rx0, ry0 + r * chh], [rx1, ry0 + r * chh]], { w: 4, seed: sd + 10 + r, t });
          for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
            if ((c * 7 + r * 3) % 5 === 0) continue;
            const x = rx0 + c * cw + 14, y = ry0 + r * chh + chh * 0.3, w = cw - 34, h = chh * 0.62, tilt = ((c + r) % 3 - 1) * 6;
            const pts = [[x, y + tilt], [x + w, y - tilt], [x + w, y + h], [x, y + h]];
            lf += inkLoop(pts, { seed: sd + 20 + c * 10 + r, t, amp: 0.5, smooth: false }) + ' ';
            lr += inkPath(pts, { w: 3, seed: sd + 90 + c * 10 + r, t, closed: true, smooth: false }) + ' ';
          }
          rackR.setAttribute('d', rr); letF.setAttribute('d', lf); letR.setAttribute('d', lr);
          // window (right) with the sun going down behind the hills
          const wx0 = 0.6 * W, wx1 = 0.95 * W, wy0 = 0.1 * H, wy1 = 0.4 * H;
          winSky.setAttribute('d', inkLoop(rect(wx0, wy0, wx1, wy1), { seed: sd + 200, t, amp: 0.6, smooth: false }));
          const sy = lerp(wy0 + 170, wy1 - 60, lin(lt, 0, Math.max(1, dur)));
          sun.setAttribute('d', inkCircle((wx0 + wx1) / 2 + 30, sy, 66, sd + 201, t, { fill: true }));
          const hp = []; for (let x = wx0; x <= wx1; x += 30) hp.push([x, wy1 - 70 + Math.sin(x * 0.03) * 26]);
          hillsW.setAttribute('d', inkLoop(hp.concat([[wx1, wy1], [wx0, wy1]]), { seed: sd + 202, t, amp: 0.6, smooth: false }));
          winR.setAttribute('d', inkPath(rect(wx0, wy0, wx1, wy1), { w: 8, seed: sd + 203, t, closed: true, smooth: false }) + ' ' +
            inkPath([[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 5, seed: sd + 204, t }) + ' ' + inkPath([[wx0, (wy0 + wy1) / 2], [wx1, (wy0 + wy1) / 2]], { w: 5, seed: sd + 205, t }));
          // small wall clock at five
          clk.update(t, 0.77 * W, 0.5 * H, 80, 4, 55 + 5 * clamp01(lt / Math.max(1, dur)));
          // the clerk behind the counter: stamps letters, then turns to the window
          const sa = atOr(cues, P.stamp, 0.2), la = atOr(cues, P.look, dur * 0.65);
          const look = lt >= la;
          const stampBeat = !look && lt >= sa ? Math.abs(Math.sin((lt - sa) * 5)) : 0;
          const fx = (P.fx ?? 0.4) * W, fy = (P.fy ?? 0.75) * H;
          const hands = fig.update(t, 'point', fx, fy, { face: 1, since: look ? lt - la : lt, dir: look ? 30 : -30 + stampBeat * 25, emotion: look ? 'happy' : 'neutral', item: null, text: null });
          void hands;
          // an open ledger flat on the counter + a stack of envelopes; the rubber stamp thumps the page
          const ty = 0.66 * H, ex0 = fx + 230, ey0 = ty - 8;
          const book = [[ex0 - 190, ey0], [ex0 + 190, ey0], [ex0 + 160, ey0 - 60], [ex0 - 160, ey0 - 60]];
          let ed = inkLoop(book, { seed: sd + 300, t, amp: 0.6, smooth: false }) + ' ';
          let er = inkPath(book, { w: 5, seed: sd + 301, t, closed: true, smooth: false }) + ' ' + inkPath([[ex0, ey0], [ex0, ey0 - 62]], { w: 4, seed: sd + 302, t }) + ' ';
          for (let k = 0; k < 3; k++) { er += inkPath([[ex0 - 150 + k * 6, ey0 - 16 - k * 14], [ex0 - 30, ey0 - 16 - k * 14]], { w: 2.5, seed: sd + 303 + k, t }) + ' ' + inkPath([[ex0 + 30, ey0 - 16 - k * 14], [ex0 + 150 - k * 6, ey0 - 16 - k * 14]], { w: 2.5, seed: sd + 306 + k, t }) + ' '; }
          for (let k = 0; k < 4; k++) { const x = 0.06 * W + k * 8, y = ey0 - k * 22; const r0 = [[x, y], [x + 190, y - 4], [x + 186, y - 24], [x - 4, y - 20]]; ed += inkLoop(r0, { seed: sd + 320 + k, t, amp: 0.5, smooth: false }) + ' '; er += inkPath(r0, { w: 3.5, seed: sd + 330 + k, t, closed: true, smooth: false }) + ' '; }
          env.setAttribute('d', ed); envR.setAttribute('d', er);
          const shY = ey0 - 70 - stampBeat * 110;
          stF.setAttribute('d', look ? '' : inkLoop(rect(ex0 + 60, shY - 40, ex0 + 130, shY), { seed: sd + 310, t, amp: 0.6, smooth: false }) + ' ' + inkDot(ex0 + 95, shY - 70, 30, 26, sd + 311, t));
          stR.setAttribute('d', look ? '' : inkPath([[ex0 + 95, shY - 40], [ex0 + 95, shY - 60]], { w: 8, seed: sd + 312, t }));
          mark.setAttribute('d', lt >= sa + 0.35 ? inkCircle(ex0 + 95, ey0 - 30, 20, sd + 313, t, { w: 5, ry: 10 }) : '');
          // counter front (planks + panels) and two bulging mail sacks on the floor fill the bottom
          ctrF.setAttribute('d', inkLoop([[-40, ty], [W + 40, ty - 6], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 400, t, amp: 0.8, smooth: false }));
          ctrR.setAttribute('d', inkPath([[-40, ty], [W + 40, ty - 6]], { w: 8, seed: sd + 401, t }) + ' ' + inkPath([[-40, ty + 46], [W + 40, ty + 40]], { w: 5, seed: sd + 402, t }));
          let ch = ''; for (let k = 0; k < 4; k++) { const x0 = 40 + k * 260; ch += inkPath(rect(x0, ty + 110, x0 + 220, ty + 330), { w: 5, seed: sd + 410 + k, t, closed: true, smooth: false }) + ' '; }
          for (let k = 0; k < 9; k++) { const y = ty + 380 + k * 34; ch += inkPath([[-20, y], [W + 20, y + 3]], { w: 2.5, seed: sd + 450 + k, t }) + ' '; }
          let sf = '', sr = '';
          [[0.17, 0], [0.8, 1]].forEach(([u, i]) => {
            const x = u * W, y = 0.88 * H, wob = Math.sin(lt * 1.5 + i) * 4;
            const sack = [[x - 150, H + 40], [x - 170, y + 40], [x - 110, y - 90], [x - 40, y - 150 + wob], [x + 40, y - 150 + wob], [x + 110, y - 90], [x + 170, y + 40], [x + 150, H + 40]];
            sf += inkLoop(sack, { seed: sd + 470 + i, t, amp: 1 }) + ' ';
            sr += inkPath(sack.slice(1, -1), { w: 7, seed: sd + 480 + i, t }) + ' ' + inkPath([[x - 50, y - 150], [x - 30, y - 200], [x + 30, y - 200], [x + 50, y - 150]], { w: 6, seed: sd + 490 + i, t }) + ' ' + inkPath([[x - 60, y - 40], [x + 60, y - 50]], { w: 4, seed: sd + 495 + i, t }) + ' ';
          });
          ctrH.setAttribute('d', ch); sackF.setAttribute('d', sf); sackR.setAttribute('d', sr);
          let gd = ''; for (let k = 0; k < 9; k++) gd += inkPath([[0.02 * W + k * 18, ty - 260], [0.02 * W + k * 18, ty]], { w: 4, seed: sd + 420 + k, t }) + ' ';
          grill.setAttribute('d', gd + inkPath([[0.02 * W - 10, ty - 260], [0.02 * W + 160, ty - 260]], { w: 6, seed: sd + 440, t }));
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ dst_bugs
  SH.dst_bugs = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 557;
      const mode = P.mode || 'hunt', n = P.moths ?? 6;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const sunF = mode === 'hunt' ? inkEl(cam, INK.red, { 'fill-opacity': 0.7 }) : null;
      const glow = mode === 'lamp' ? inkEl(cam, INK.gold, { 'fill-opacity': 0.28 }) : null, glow2 = mode === 'lamp' ? inkEl(cam, INK.gold, { 'fill-opacity': 0.4 }) : null;
      const postR = mode === 'lamp' ? inkEl(cam) : null, lampF = mode === 'lamp' ? inkEl(cam, INK.paperLight) : null, flame = mode === 'lamp' ? inkEl(cam, INK.gold) : null, capF = mode === 'lamp' ? inkEl(cam, INK.ink) : null;
      const clk = P.clock ? clock(cam, sd + 150) : null;
      const fig = P.who === false ? null : figure(cam, { scale: P.scale ?? (mode === 'hunt' ? 1.0 : 0.95), seed: sd + 20 });
      const nt = P.who === false ? null : net(cam, sd + 30);
      const ex = extras(cam, P, W, H, sd);
      const M = moths(cam, sd + 40, n);
      const grass = mode === 'hunt' ? grassBand(cam, W, H, (P.fore ?? 0.66) * H, sd + 60) : null;
      const caseG = mode === 'lamp' ? { f: inkEl(cam, INK.stain), r: inkEl(cam), glass: inkEl(cam, INK.paperLight, { 'fill-opacity': 0.92 }), pins: moths(cam, sd + 80, 12), lab: inkEl(cam, INK.inkSoft) } : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, lt, dur, W, H, P.focus || [0.5, 0.5], P.zoom ?? 1.04, hit);
          const na = atOr(cues, P.net, dur * 0.5);
          if (mode === 'hunt') {
            sunF.setAttribute('d', inkCircle(0.78 * W, (P.sun_y ?? 0.36) * H + lin(lt, 0, Math.max(1, dur)) * 40, 90, sd + 1, t, { fill: true }));
            const fx = (P.fx ?? 0.36) * W, fy = (P.fy ?? 0.64) * H;
            const sw = progIO(lt, na - 0.3, 0.7), back = progIO(lt, na + 0.6, 0.9);
            const ang = (lerp(70, -5, sw) + back * 40) * D2R;
            const hands = fig.update(t, 'point', fx + Math.sin(lt * 1.5) * 10, fy, { face: 1, since: lt, dir: lerp(60, 0, sw) + back * 25, emotion: lt > na ? 'happy' : 'surprised' });
            const hand = hands[0][0] > hands[1][0] ? hands[0] : hands[1];
            const N = nt.update(t, hand, ang, P.pole ?? 210, 72, Math.sin(lt * 3) * 0.4);
            const list = [];
            for (let i = 0; i < n; i++) {
              const m = flutter(i, t, 0.68 * W, 0.4 * H, 260, 220);
              if (i === 0 && lt > na + 0.2) { m.x = N.tip[0] - 10; m.y = N.tip[1] - 30; m.s = 0.8; }   // caught
              list.push(m);
            }
            M.update(t, list);
            ex.update(lt, t, cues);
            grass.update(t);
          } else {
            const lx = (P.lx ?? 0.62) * W, ly = (P.ly ?? 0.3) * H;
            glow.setAttribute('d', inkCircle(lx, ly, 230 + Math.sin(lt * 2.4) * 10, sd + 2, t, { fill: true }));
            glow2.setAttribute('d', inkCircle(lx, ly, 120 + Math.sin(lt * 3.1) * 6, sd + 3, t, { fill: true }));
            // a gas street lamp: tapered glass lantern with a flickering flame, dark cap + finial, post with crossbar, flared foot
            const gl = [[lx - 62, ly - 70], [lx + 62, ly - 70], [lx + 40, ly + 70], [lx - 40, ly + 70]];
            lampF.setAttribute('d', inkLoop(gl, { seed: sd + 4, t, amp: 0.6, smooth: false }));
            const fh = 70 + Math.sin(lt * 17) * 6 + Math.sin(lt * 7) * 4;
            flame.setAttribute('d', inkLoop([[lx, ly + 30 - fh], [lx + 18, ly + 6], [lx + 12, ly + 32], [lx - 12, ly + 32], [lx - 18, ly + 6]], { seed: sd + 9, t, amp: 1.2 }) + ' ' + inkLoop(rect(lx - 26, ly + 34, lx + 26, ly + 54), { seed: sd + 10, t, amp: 0.5, smooth: false }));
            capF.setAttribute('d', inkLoop([[lx - 84, ly - 66], [lx + 84, ly - 66], [lx + 30, ly - 120], [lx - 30, ly - 120]], { seed: sd + 11, t, amp: 0.6, smooth: false }) + ' ' + inkDot(lx, ly - 136, 16, 18, sd + 12, t) + ' ' +
              inkLoop([[lx - 46, ly + 70], [lx + 46, ly + 70], [lx + 24, ly + 100], [lx - 24, ly + 100]], { seed: sd + 13, t, amp: 0.5, smooth: false }));
            const py1 = (P.post_y ?? 0.72) * H;
            postR.setAttribute('d', inkPath(gl, { w: 7, seed: sd + 5, t, closed: true, smooth: false }) + ' ' + inkPath([[lx - 22, ly - 70], [lx - 14, ly + 70]], { w: 4, seed: sd + 6, t }) + ' ' + inkPath([[lx + 22, ly - 70], [lx + 14, ly + 70]], { w: 4, seed: sd + 14, t }) + ' ' +
              inkPath([[lx, ly + 100], [lx, py1]], { w: 16, seed: sd + 7, t }) + ' ' + inkPath([[lx - 70, ly + 200], [lx + 70, ly + 200]], { w: 9, seed: sd + 15, t }) + ' ' +
              inkPath([[lx - 70, py1], [lx - 26, py1 - 60], [lx + 26, py1 - 60], [lx + 70, py1]], { w: 10, seed: sd + 8, t }));
            if (clk) {   // a big clock whose hour hand gets turned back on `clock.at`
              const C = P.clock, ca = atOr(cues, C.at, dur * 0.5), cp = progIO(lt, ca, 0.8);
              const [hh, mm] = clockAt(C.from || [3, 0], C.to || [2, 0], cp);
              clk.update(t, (C.x ?? 0.3) * W, (C.y ?? 0.32) * H, C.r ?? 180, hh, mm, lt > ca ? ((C.from || [3, 0])[0] % 12) * 30 * D2R : null);
            }
            if (fig) {
              const fx = (P.fx ?? 0.27) * W, fy = (P.fy ?? 0.66) * H;
              const sw = progIO(lt, na - 0.2, 0.8);
              const hands = fig.update(t, 'point', fx, fy, { face: 1, since: lt, dir: lerp(15, 45, sw), emotion: 'happy' });   // (lamp mode)
              const hand = hands[0][0] > hands[1][0] ? hands[0] : hands[1];
              nt.update(t, hand, lerp(20, 50, sw) * D2R + Math.sin(lt * 1.4) * 0.05, 230, 64, Math.sin(lt * 2) * 0.3);
            }
            ex.update(lt, t, cues);
            const list = []; for (let i = 0; i < n; i++) list.push(flutter(i, t, lx, ly, 200, 170, 1.6));
            M.update(t, list);
            // specimen case of pinned moths fills the bottom
            const cy0 = (P.case_y ?? 0.74) * H, box = [[30, cy0], [W - 30, cy0 - 10], [W - 10, H + 40], [10, H + 40]];
            caseG.f.setAttribute('d', inkLoop(box, { seed: sd + 90, t, amp: 0.8, smooth: false }));
            const inner = [[70, cy0 + 40], [W - 70, cy0 + 32], [W - 50, H + 40], [50, H + 40]];
            caseG.glass.setAttribute('d', inkLoop(inner, { seed: sd + 91, t, amp: 0.6, smooth: false }));
            let lab = '';
            const pins = [];
            for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
              const x = 170 + c * 250 + (r % 2) * 40, y = cy0 + 130 + r * 150;
              pins.push({ x, y, s: 0.95, ph: 1.4, rot: 0 });
              lab += inkLoop(rect(x - 40, y + 50, x + 40, y + 70), { seed: sd + 100 + r * 4 + c, t, amp: 0.4, smooth: false }) + ' ';
            }
            caseG.pins.update(0.11, pins);   // frozen wings (pinned): fixed phase
            caseG.lab.setAttribute('d', lab);
            caseG.r.setAttribute('d', inkPath(box, { w: 9, seed: sd + 92, t, closed: true, smooth: false }) + ' ' + inkPath(inner, { w: 4, seed: sd + 93, t, closed: true, smooth: false }) + ' ' +
              inkPath([[W * 0.55, cy0 + 50], [W * 0.75, cy0 + 300]], { w: 3, seed: sd + 94, t }));
          }
        },
      };
    },
  };

  // ============================================================ dst_hall
  SH.dst_hall = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 661;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bbF = inkEl(cam, INK.ink, { 'fill-opacity': 0.85 }), bbR = inkEl(cam), chalk = inkEl(cam, INK.paperLight);
      const chalkT = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 120, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.paperLight }); chalkT.textContent = P.chalk || '+2';
      const fig = figure(cam, { scale: P.scale ?? 1.25, seed: sd + 20 });
      const papF = inkEl(cam, INK.paperLight), papR = inkEl(cam);
      const lecF = inkEl(cam, INK.stain), lecR = inkEl(cam);
      const ex = extras(cam, P, W, H, sd);
      const N = 7;
      const aud = Array.from({ length: N }, (_, i) => ({ coat: inkEl(cam, i % 2 ? INK.ink : INK.inkSoft), head: inkEl(cam, INK.paperLight), r: inkEl(cam), beard: inkEl(cam, i % 3 ? INK.ink : INK.inkSoft), strands: inkEl(cam, INK.paperLight, { 'fill-opacity': 0.5 }), mouth: inkEl(cam, INK.paperDark), face: inkEl(cam) }));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, lt, dur, W, H, [0.5, 0.45], P.zoom ?? 1.05, hit);
          const la = atOr(cues, P.laugh, dur * 0.3);
          // blackboard with a chalk clock
          const b = rect(0.08 * W, 0.12 * H, 0.62 * W, 0.4 * H);
          bbF.setAttribute('d', inkLoop(b, { seed: sd + 1, t, amp: 0.8, smooth: false }));
          bbR.setAttribute('d', inkPath(b, { w: 12, seed: sd + 2, t, closed: true, smooth: false }));
          const cx = 0.25 * W, cy = 0.26 * H, cr = 130;
          let cd = inkCircle(cx, cy, cr, sd + 3, t, { w: 6 });
          for (let i = 0; i < 12; i++) { const a = i * 30 * D2R; cd += ' ' + inkPath([[cx + Math.sin(a) * cr * 0.8, cy - Math.cos(a) * cr * 0.8], [cx + Math.sin(a) * cr * 0.92, cy - Math.cos(a) * cr * 0.92]], { w: 5, seed: sd + 10 + i, t }); }
          cd += ' ' + inkPath([[cx, cy], [cx + 70, cy - 40]], { w: 7, seed: sd + 30, t }) + ' ' + inkPath([[cx, cy], [cx, cy - 100]], { w: 5, seed: sd + 31, t });
          const ap = prog(lt, 0.1, 0.8);
          cd += ' ' + inkPath(Array.from({ length: 9 }, (_, k) => { const a = lerp(20, 120, k / 8 * ap) * D2R; return [cx + Math.sin(a) * (cr + 40), cy - Math.cos(a) * (cr + 40)]; }), { w: 6, seed: sd + 32, t });
          chalk.setAttribute('d', cd);
          const bb = boil(sd + 33, t, 1.2); chalkT.setAttribute('x', f1(0.48 * W + bb[0])); chalkT.setAttribute('y', f1(0.25 * H + bb[1]));
          // the speaker at the lectern (right), holding his paper; flinches when they laugh
          const fx = 0.76 * W, fy = 0.66 * H, laughing = lt >= la;
          const hands = fig.update(t, laughing ? 'shrug' : 'talk', fx, fy, { face: -1, since: laughing ? lt - la : lt, emotion: laughing ? 'worried' : 'neutral' });
          const hc = [(hands[0][0] + hands[1][0]) / 2, (hands[0][1] + hands[1][1]) / 2];
          const pp = laughing ? [[hands[0][0] - 50, hands[0][1] - 70], [hands[0][0] + 30, hands[0][1] - 80], [hands[0][0] + 30, hands[0][1] + 20], [hands[0][0] - 50, hands[0][1] + 30]]
            : [[hc[0] - 60, hc[1] - 80], [hc[0] + 60, hc[1] - 80], [hc[0] + 60, hc[1] + 40], [hc[0] - 60, hc[1] + 40]];
          papF.setAttribute('d', inkLoop(pp, { seed: sd + 40, t, amp: 0.6, smooth: false }));
          papR.setAttribute('d', inkPath(pp, { w: 4, seed: sd + 41, t, closed: true, smooth: false }));
          const lec = [[fx - 140, 0.56 * H], [fx + 110, 0.56 * H], [fx + 80, 0.7 * H], [fx - 110, 0.7 * H]];
          lecF.setAttribute('d', inkLoop(lec, { seed: sd + 42, t, amp: 0.8, smooth: false }));
          lecR.setAttribute('d', inkPath(lec, { w: 7, seed: sd + 43, t, closed: true, smooth: false }));
          ex.update(lt, t, cues);
          // the audience: heads and shoulders across the bottom, rocking with laughter after `laugh`
          aud.forEach((a, i) => {
            const row = i < 4 ? 0 : 1, k = row ? i - 4 : i;
            const x = row ? 0.2 * W + k * 0.3 * W : 0.06 * W + k * 0.29 * W, y = row ? 0.8 * H : 0.7 * H;
            const R = row ? 110 : 90;
            const lp = laughing ? Math.abs(Math.sin((lt - la) * 9 + i)) : 0, bob = -lp * 18, tilt = laughing ? Math.sin((lt - la) * 7 + i * 2) * 0.12 : 0;
            const hx = x + Math.sin(tilt) * 30, hy = y + bob;
            const coat = [[x - R * 2, H + 40], [x - R * 1.9, y + R * 1.6], [x - R * 0.6, y + R * 0.9], [x + R * 0.6, y + R * 0.9], [x + R * 1.9, y + R * 1.6], [x + R * 2, H + 40]];
            a.coat.setAttribute('d', inkLoop(coat, { seed: sd + 60 + i, t, amp: 1 }));
            a.head.setAttribute('d', inkCircle(hx, hy, R, sd + 70 + i, t, { fill: true }));
            // a full beard that starts at the cheeks and hangs below the chin (mouth sits in it), plus moustache
            const bt = hy + R * 0.18, bl = hy + R * (1.5 + (i % 3) * 0.15);
            const beard = [[hx - R * 0.98, bt - R * 0.1], [hx - R * 0.8, hy + R * 0.75], [hx - R * 0.45, bl - R * 0.2], [hx, bl], [hx + R * 0.45, bl - R * 0.2], [hx + R * 0.8, hy + R * 0.75], [hx + R * 0.98, bt - R * 0.1],
              [hx + R * 0.55, hy + R * 0.55], [hx + R * 0.2, hy + R * 0.38], [hx - R * 0.2, hy + R * 0.38], [hx - R * 0.55, hy + R * 0.55]];
            a.beard.setAttribute('d', inkLoop(beard, { seed: sd + 80 + i, t, amp: 1 }));
            let st = ''; for (let k = -2; k <= 2; k++) st += inkPath([[hx + k * R * 0.22, hy + R * 0.75], [hx + k * R * 0.18 + Math.sin(lt * 3 + k) * 3, bl - R * 0.3]], { w: 3, seed: sd + 160 + i * 5 + k, t }) + ' ';
            a.strands.setAttribute('d', st);
            let r = inkCircle(hx, hy, R, sd + 90 + i, t, { w: 6 }) + ' ' + inkPath(coat.slice(1, -1), { w: 6, seed: sd + 100 + i, t });
            // faces: eyes squeezed shut + open laughing mouth after `laugh`, polite dots before
            let fd = '', md = '';
            if (laughing) {
              fd += inkPath([[hx - R * 0.45, hy - R * 0.15], [hx - R * 0.3, hy - R * 0.25], [hx - R * 0.15, hy - R * 0.15]], { w: 5, seed: sd + 110 + i, t }) + ' ';
              fd += inkPath([[hx + R * 0.15, hy - R * 0.15], [hx + R * 0.3, hy - R * 0.25], [hx + R * 0.45, hy - R * 0.15]], { w: 5, seed: sd + 120 + i, t }) + ' ';
              const mp = [[hx - R * 0.32, hy + R * 0.42], [hx + R * 0.32, hy + R * 0.42], [hx + R * 0.16, hy + R * (0.72 + lp * 0.18)], [hx - R * 0.16, hy + R * (0.72 + lp * 0.18)]]; md = inkLoop(mp, { seed: sd + 130 + i, t, amp: 0.6 }); fd += inkPath(mp, { w: 5, seed: sd + 135 + i, t, closed: true, amp: 0.6 });
            } else {
              fd += inkDot(hx - R * 0.3, hy - R * 0.15, 7, 8, sd + 140 + i, t) + ' ' + inkDot(hx + R * 0.3, hy - R * 0.15, 7, 8, sd + 150 + i, t);
            }
            a.r.setAttribute('d', r); a.face.setAttribute('d', fd); a.mouth.setAttribute('d', md);
          });
        },
      };
    },
  };

  // ============================================================ dst_coal
  SH.dst_coal = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 773;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const smoke = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.55 }), stF = inkEl(cam, INK.red), stR = inkEl(cam), stB = inkEl(cam, INK.paperLight);
      const facF = inkEl(cam, INK.paperDark), facR = inkEl(cam), facW = inkEl(cam, INK.gold, { 'fill-opacity': 0.7 });
      const clk = clock(cam, sd + 50);
      const ex = extras(cam, P, W, H, sd);
      const heapF = inkEl(cam, INK.ink), lumps = inkEl(cam, INK.inkSoft), shine = inkEl(cam, INK.paperLight, { 'fill-opacity': 0.6 }), shovel = inkEl(cam), blade = inkEl(cam, INK.paperDark);
      const r = rng(sd + 9), LU = Array.from({ length: 40 }, () => [r(), r(), r()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          camOf(cam, lt, dur, W, H, [0.5, 0.4], P.zoom ?? 1.05, hit);
          const at = atOr(cues, P.at, dur * 0.3);
          const gy = (P.ground ?? 0.6) * H;
          // three smokestacks puffing
          let sm = '', sf = '', sr = '', sb = '';
          [0.14, 0.34, 0.86].forEach((u, i) => {
            const x = u * W, top = 0.1 * H + i * 30;
            const st = [[x - 40, gy - 300], [x - 30, top], [x + 30, top], [x + 40, gy - 300]];
            sf += inkLoop(st, { seed: sd + 1 + i, t, amp: 0.8, smooth: false }) + ' ';
            sr += inkPath(st, { w: 6, seed: sd + 4 + i, t, closed: true, smooth: false }) + ' ';
            sb += inkLoop(rect(x - 33, top + 40, x + 33, top + 64), { seed: sd + 7 + i, t, amp: 0.5, smooth: false }) + ' ';
            for (let k = 0; k < 5; k++) {
              const ph = (lt * 0.35 + k / 5 + i * 0.13) % 1, px = x + ph * 160 + Math.sin(lt + k) * 10, py = top - 30 - ph * 260, rad = 30 + ph * 60;
              if (py > 0) sm += inkCircle(px, py, rad, sd + 20 + i * 10 + k, t, { fill: true }) + ' ';
            }
          });
          smoke.setAttribute('d', sm); stF.setAttribute('d', sf); stR.setAttribute('d', sr); stB.setAttribute('d', sb);
          // factory facade with a big clock
          const fac = [[-40, gy], [-40, gy - 320], [0.25 * W, gy - 420], [0.5 * W, gy - 320], [0.75 * W, gy - 420], [W + 40, gy - 320], [W + 40, gy]];
          facF.setAttribute('d', inkLoop(fac, { seed: sd + 30, t, amp: 0.8, smooth: false }));
          let fw = '';
          for (let k = 0; k < 6; k++) { const x = 60 + k * 170; if (Math.abs(x + 50 - W / 2) < 170) continue; fw += inkLoop(rect(x, gy - 200, x + 100, gy - 90), { seed: sd + 40 + k, t, amp: 0.5, smooth: false }) + ' '; }
          facW.setAttribute('d', fw);
          facR.setAttribute('d', inkPath(fac.slice(0, -1).concat([[W + 40, gy]]), { w: 7, seed: sd + 31, t, smooth: false }));
          const p = progIO(lt, at, 0.8);
          const [hh, mm] = clockAt([6, 0], [7, 0], p);
          clk.update(t, W / 2, gy - 250, 150 * (1 + 0.08 * punch(lt, at + 0.8, 0.5)), hh, mm, lt > at ? 180 * D2R : null);
          ex.update(lt, t, cues);
          // the coal heap across the bottom, lumps rolling down its slope
          const hy = (P.heap ?? 0.7) * H;
          const heap = [[-40, H + 40], [-40, hy + 160], [0.25 * W, hy + 30], [0.5 * W, hy - 30], [0.72 * W, hy + 40], [W + 40, hy + 180], [W + 40, H + 40]];
          heapF.setAttribute('d', inkLoop(heap, { seed: sd + 60, t, amp: 1.2 }));
          let ld = '', sh = '';
          LU.forEach((q, i) => {
            const x = q[0] * W, y = hy + 60 + q[1] * (H - hy), rad = 22 + q[2] * 26;
            ld += inkCircle(x, y, rad, sd + 70 + i, t, { w: 4, n: 6 }) + ' ';
            if (i % 3 === 0) sh += inkPath([[x - rad * 0.4, y - rad * 0.5], [x + rad * 0.2, y - rad * 0.6]], { w: 4, seed: sd + 120 + i, t }) + ' ';
          });
          for (let k = 0; k < 4; k++) {   // rolling lumps
            const ph = (lt * 0.5 + k * 0.25) % 1, x = lerp(0.5 * W, (k % 2 ? 0.95 : 0.05) * W, ph), y = lerp(hy - 50, hy + 170, ph) - Math.abs(Math.sin(ph * 12)) * 16;
            ld += inkCircle(x, y, 26, sd + 160 + k, t, { fill: true }) + ' ';
          }
          lumps.setAttribute('d', ld); shine.setAttribute('d', sh);
          const sx = 0.78 * W, sy = hy + 90;
          shovel.setAttribute('d', inkPath([[sx, sy], [sx + 90, sy - 330]], { w: 12, seed: sd + 170, t }) + ' ' + inkPath([[sx + 60, sy - 340], [sx + 120, sy - 320]], { w: 12, seed: sd + 171, t }));
          blade.setAttribute('d', inkLoop([[sx - 50, sy - 10], [sx + 40, sy - 30], [sx + 50, sy + 90], [sx - 30, sy + 110]], { seed: sd + 172, t, amp: 0.8 }));
        },
      };
    },
  };

  // ============================================================ dst_war
  // SH.dst_war — 1914: a column of soldiers in grey steel helmets marches across a muddy field in the rain, rifles
  //   on their shoulders; on `at` an ink lightning bolt cracks the sky; a sandbag parapet fills the bottom.
  //   P: {at: cue, n: 4, scale: 0.95}
  SH.dst_war = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 881;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bolt = inkEl(cam, INK.ink), rain = inkEl(cam, INK.inkSoft, { 'fill-opacity': 0.7 });
      const n = P.n ?? 4, sc = P.scale ?? 0.95;
      const men = Array.from({ length: n }, (_, i) => ({ fig: figure(cam, { scale: sc, seed: sd + i * 17, beard: i % 2 ? 'short' : null }), helm: inkEl(cam, INK.inkSoft), helmR: inkEl(cam), gun: inkEl(cam) }));
      const mud = inkEl(cam, INK.stain), bagF = inkEl(cam, INK.paperDark), bagR = inkEl(cam);
      const gait = KASIF.gait ? KASIF.gait('walk') : 120;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const at = atOr(cues, P.at, dur * 0.4);
          camOf(cam, lt, dur, W, H, [0.5, 0.5], P.zoom ?? 1.05, punch(lt, at, 0.6));
          // rain
          let rd = ''; const r = rng(sd + 5);
          for (let k = 0; k < 40; k++) { const q = [r(), r(), r()], y = ((q[1] * H + lt * (900 + q[2] * 400)) % (H + 100)) - 60, x = q[0] * (W + 200) - 100 - y * 0.25; rd += inkPath([[x, y], [x - 14, y + 60]], { w: 2.4, seed: sd + 10 + k, t, amp: 0.4 }) + ' '; }
          rain.setAttribute('d', rd);
          // lightning
          const bp = clamp01((lt - at) / 0.12), bo = lt >= at && lt < at + 0.6;
          if (bo) { const pts = [[0.7 * W, -20], [0.62 * W, 0.12 * H], [0.7 * W, 0.15 * H], [0.58 * W, 0.3 * H], [0.66 * W, 0.32 * H], [0.55 * W, 0.46 * H]]; bolt.setAttribute('d', inkPath(pts.slice(0, Math.max(2, Math.round(pts.length * bp))), { w: 14, seed: sd + 3, t, smooth: false })); } else bolt.setAttribute('d', '');
          // the column marches left to right
          const gy = (P.ground ?? 0.6) * H, speed = 140;
          men.forEach((m, i) => {
            const x = (0.08 + i * 0.26) * W + lt * speed - 80, ph = (lt * speed) / (gait * sc);
            const hs = m.fig.update(t, 'walk', x, gy, { face: 1, ph, since: lt, emotion: lt > at ? 'worried' : 'neutral' });
            const [hx, hy] = hs.head, hr = hs.hr;
            const helm = [[hx - hr * 1.25, hy - hr * 0.05], [hx - hr * 1.05, hy - hr * 0.7], [hx - hr * 0.4, hy - hr * 1.12], [hx + hr * 0.4, hy - hr * 1.12], [hx + hr * 1.05, hy - hr * 0.7], [hx + hr * 1.3, hy - hr * 0.05], [hx + hr * 1.0, hy + hr * 0.05], [hx - hr * 1.0, hy + hr * 0.05]];
            m.helm.setAttribute('d', inkLoop(helm, { seed: sd + 100 + i, t, amp: 0.8 }));
            m.helmR.setAttribute('d', inkPath(helm, { w: 6, seed: sd + 110 + i, t, closed: true, amp: 0.8 }));
            // rifle slung on the back shoulder, barrel up
            const sx = hx - hr * 0.6, sy = hy + hr * 1.6;
            m.gun.setAttribute('d', inkPath([[sx - 40 * sc, sy + 160 * sc], [sx + 30 * sc, sy - 170 * sc]], { w: 9, seed: sd + 120 + i, t }) + ' ' + inkPath([[sx - 50 * sc, sy + 150 * sc], [sx - 20 * sc, sy + 200 * sc]], { w: 16, seed: sd + 130 + i, t }));
          });
          // mud + sandbag parapet across the bottom
          mud.setAttribute('d', inkLoop([[-40, gy + 10], [W + 40, gy + 4], [W + 40, H + 40], [-40, H + 40]], { seed: sd + 200, t, amp: 0.8, smooth: false }));
          let bf = '', br = '';
          const top = (P.bags ?? 0.74) * H;
          for (let row = 0; row < 6; row++) for (let c = -1; c < 6; c++) {
            const w = 230, h = 105, x = c * w + (row % 2) * w / 2, y = top + row * (h - 10);
            const bag = inkEllipsePts(x + w / 2, y + h / 2, w / 2 - 6, h / 2 - 4, sd + 300 + row * 9 + c, 10);
            bf += inkLoop(bag, { seed: sd + 300 + row * 9 + c, t, amp: 0.8 }) + ' ';
            br += inkPath(bag, { w: 5, seed: sd + 400 + row * 9 + c, t, closed: true, amp: 0.8 }) + ' ' + inkPath([[x + w * 0.3, y + h * 0.3], [x + w * 0.35, y + h * 0.7]], { w: 3, seed: sd + 500 + row * 9 + c, t }) + ' ';
          }
          bagF.setAttribute('d', bf); bagR.setAttribute('d', br);
        },
      };
    },
  };
})();
