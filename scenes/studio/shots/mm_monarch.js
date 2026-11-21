// mm_monarch: the monarch butterfly migration and the 40-year search for its winter home (Stickstory long video
// ag-03-monarch-migration, 2026-11-21) in the parchment ink style (brand/kit/BRAND.md §3, §5; lines boil at 8 Hz via
// _ink.js; everything is a pure function of (seed, lt), no Math.random; palette tokens only). Tuned for 16:9 (1920x1080).
// Uses mcB__lib.js (MCB.cast for the narrator / period figures, MCB.labels for hand-written labels and stamps).
//
// Common P: labels: [MCB label entries {text, x, y (0..1), at, size, color, stamp, arrow}], cast: [MCB cast entries]
//
// SHOTS.mon_forest — oyamel fir forest high in the Mexican mountains, branches heavy with hanging butterfly clusters,
//   monarchs drifting in the air. P.mode "colony" (default) | "snap" (P.branch {x, y, len, dir}: the heavy branch at the
//   top snaps on cue "snap", swings down, the butterflies burst off it and rain onto a pile at the ground) | "discover"
//   (the trees start bare and fill with orange clusters from cue "fill" on) | "search" (bare trees, a trail climbs the
//   slope; cast walks it) | "measure" (a red dashed boundary is drawn around the colony on cue "rope") | "calm".
//   P: {mode, trees: 7, ground: 0.84, fliers: 18, pile: false, branch, cast, labels}   cues: snap, fill, rope, hit
//
// SHOTS.mon_wing — one big monarch seen from above (slow wing beat) over milkweed flowers. P.mode "fly" | "tag" (a
//   white sticker with P.tag text is pressed over the front edge of the right forewing on cue "tag") | "antenna"
//   (the antennae light up gold, a small ticking clock dial appears at the tip on cue "clock") | "paint" (a brush
//   paints the antennae black from cue "paint", then the butterfly turns in confused circles from cue "lost") |
//   "radio" (a tiny solar radio tag on the body, radio arcs pulse from cue "ping") | "scale" (a hand balance: the
//   butterfly on one pan, a paperclip on the other; the beam tips toward the paperclip on cue "tip").
//   P: {mode, tag: ["397", "TORONTO"], x: 0.5, y: 0.5, s: 3.2, labels}   cues: tag, clock, paint, lost, ping, tip
//
// SHOTS.mon_life — a summer milkweed meadow. P.mode "meadow" (monarchs flutter over the milkweed) | "cycle" (egg ->
//   caterpillar -> chrysalis -> butterfly pop in on cues c1..c4 with arrows; the butterfly flies off on cue "go") |
//   "eat" (close: a striped caterpillar chews a milkweed leaf; a small bird swoops in on cue "bird" and veers away) |
//   "gens" (a row of generations: P.gens [{text, at, kind: "old"|"short"|"super"}], short-lived ones fade, the super
//   one glows) | "release" (cast in the meadow; a monarch flies up from P.from on cue "go").   P: {mode, cast, labels}
//
// SHOTS.mon_map — old parchment map of North America (Canada, USA, Mexico). P.mode "routes" (dashed flight lines from
//   the north converge on the winter site, monarchs travel along them from cue "route") | "tags" (red tag-return dots
//   pop along a southwest line from Toronto through Texas; at the border the line stops and a big "?" grows on cue
//   "stop") | "line" (one line from P.from {name, lon, lat} to the winter site, cue "route"; distance label) | "pin"
//   (the winter site gets a red ring + P.site name, Mexico City dot) | "radio" (receiver towers blink, tagged
//   butterflies light up in Mexico, a counter counts to P.count on cue "count").
//   P: {mode, site: {name, lon: -100.3, lat: 19.6}, from, count, labels, kasif}   cues: route, stop, count, site
//
// SHOTS.mon_sun — the sun compass. A monarch flies south over a field (heading arrow); the sun moves along its day
//   arc. P.mode "sun" (sun ray + angle arc between the ray and the heading) | "arc" (the sun sweeps east -> west, a red
//   dashed path shows a butterfly that follows the sun blindly curving away, cue "curve") | "clock" (a clock dial by
//   the butterfly spins with the sun and the angle arc re-sizes so the heading stays south, cue "clock") | "cloud"
//   (clouds slide over the sun from cue "cloud", blue magnetic field lines draw themselves on cue "field", the
//   heading holds).   P: {mode, labels}
//
// SHOTS.mon_desk — interiors. P.mode "lab" (a Toronto study: desk, lamp, a wall map of North America; red pins pop
//   into it on cues P.pins [{x, y, at}]) | "letters" (envelopes fly in and pile up on the desk from cue "mail") |
//   "notice" (a full-frame newspaper page: grey columns and a boxed notice P.notice [lines] typed in red ink on cue
//   "notice") | "call" (an old telephone rings on cue "ring", a speech card types P.quote) .  P: {mode, cast, labels}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const I = INK;
  const FR = 'Fraunces, Georgia, serif';
  const ORANGE = mix(I.red, I.gold, 0.45);           // monarch orange from palette tokens
  const UNDER = mix(ORANGE, I.paperLight, 0.3);      // paler underside (closed wings)
  const LEAF = mix(I.green, I.paper, 0.15);
  const BLOOM = mix(I.red, I.paperLight, 0.55);
  const tc = (cues, v, fb) => v == null ? fb : typeof v === 'number' ? v : (cues && cues[v] != null ? cues[v] : fb);
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const hr = a => { const v = Math.sin(a * 12.9898 + 4.1414) * 43758.5453; return v - Math.floor(v); };
  const rngI = k => { const r = rng(Math.floor(hr(k) * 2147483000) + 1); r(); return r; };
  const ell = (cx, cy, rx, ry, k, n = 14, rot = 0) => inkEllipsePts(cx, cy, rx, ry, k, n, rot, 0.04);
  const TR = (pts, x, y, s, a, fx = 1) => { const c = Math.cos(a), sn = Math.sin(a); return pts.map(([px, py]) => { const X = px * s * fx, Y = py * s; return [x + X * c - Y * sn, y + X * sn + Y * c]; }); };

  // ---------------------------------------------------------------- pooled painter
  function painter(parent) {
    const els = []; let n = 0, T = 0;
    const get = () => { const e = els[n] || (els[n] = el(parent, 'path', { stroke: 'none' })); n++; e.style.display = ''; return e; };
    const P = {
      begin(t) { n = 0; T = t; },
      end() { for (let i = n; i < els.length; i++) els[i].style.display = 'none'; },
      fill(pts, col, k, o = {}) { const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', o.op ?? 1); e.setAttribute('d', inkLoop(pts, { seed: k, t: T, amp: o.amp ?? 1.2, smooth: o.smooth !== false })); },
      line(pts, w, k, o = {}) { const e = get(); e.setAttribute('fill', o.col || I.ink); e.setAttribute('fill-opacity', o.op ?? 1); e.setAttribute('d', inkPath(pts, { w, seed: k, t: T, amp: o.amp ?? 1.4, closed: !!o.closed, smooth: o.smooth !== false })); },
      shape(pts, col, w, k, o = {}) { P.fill(pts, col, k, o); P.line(pts, w, k + 1, Object.assign({}, o, { closed: true, col: o.lc || I.ink, op: o.lop ?? 1 })); },
      dot(x, y, r, col, k, op) { const e = get(); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op ?? 1); e.setAttribute('d', inkDot(x, y, r, r, k, T)); },
      dash(pts, w, k, o = {}) {   // dashed polyline (pts sampled), dash/gap in px
        const d = o.dash ?? 26, g = o.gap ?? 18; let acc = 0, on = true, seg = [pts[0]];
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i - 1], b = pts[i]; let L = Math.hypot(b[0] - a[0], b[1] - a[1]), u0 = 0;
          while (L > 0) {
            const need = (on ? d : g) - acc;
            if (L >= need) { const u = u0 + need / Math.hypot(b[0] - a[0], b[1] - a[1]) * 1; const p = [lerp(a[0], b[0], Math.min(1, u)), lerp(a[1], b[1], Math.min(1, u))];
              if (on) { seg.push(p); if (seg.length > 1) P.line(seg, w, k + i * 3, Object.assign({ smooth: false }, o)); }
              seg = [p]; on = !on; acc = 0; L -= need; u0 = u; }
            else { acc += L; if (on) seg.push(b); L = 0; }
          }
        }
        if (on && seg.length > 1) P.line(seg, w, k + 999, Object.assign({ smooth: false }, o));
      },
    };
    return P;
  }
  // sample a polyline up to fraction u of its length
  function partial(pts, u) {
    if (u <= 0) return [pts[0], pts[0]];
    const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let want = tot * clamp01(u); const out = [pts[0]];
    for (let i = 1; i < pts.length; i++) { if (want >= L[i - 1]) { out.push(pts[i]); want -= L[i - 1]; } else { const f = want / L[i - 1]; out.push([lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]); break; } }
    return out.length > 1 ? out : [pts[0], pts[0]];
  }
  const pointAt = (pts, u) => { const p = partial(pts, u); return p[p.length - 1]; };

  // ---------------------------------------------------------------- the monarch, seen from above (heading up)
  const FW = [[4, -30], [36, -62], [92, -84], [128, -82], [140, -64], [124, -26], [84, -4], [20, 4]];
  const HW = [[10, 4], [66, 2], [106, 28], [112, 66], [88, 98], [48, 106], [16, 72]];
  const VEIN_F = [[[10, -20], [120, -70]], [[12, -14], [130, -50]], [[14, -8], [118, -26]], [[16, -2], [88, -6]]];
  const VEIN_H = [[[14, 8], [100, 36]], [[14, 12], [104, 70]], [[14, 16], [80, 96]], [[12, 18], [44, 100]]];
  const DOTS_F = [[118, -76], [132, -70], [136, -58], [128, -40], [110, -78], [100, -70], [122, -60]];
  const DOTS_H = [[104, 46], [104, 64], [94, 82], [78, 96], [58, 102], [36, 98]];
  function monarch(pt, x, y, s, flap, ang, k, o = {}) {
    // flap: 0..1 (1 = wings fully open); wings foreshorten in x
    const f = 0.18 + 0.82 * flap;
    const op = o.op ?? 1;
    for (const side of [-1, 1]) {
      const fx = side * f;
      const fw = TR(FW, x, y, s, ang, fx), hw = TR(HW, x, y, s, ang, fx);
      pt.shape(hw, ORANGE, Math.max(2.5, 9 * s), k + (side > 0 ? 0 : 40), { op, lop: op, amp: 0.9 });
      pt.shape(fw, ORANGE, Math.max(2.5, 9 * s), k + (side > 0 ? 4 : 44), { op, lop: op, amp: 0.9 });
      if (s > 0.25 && flap > 0.25) {
        // black outer margin + veins + white dots
        pt.line(TR([[124, -26], [140, -64], [128, -82], [92, -84]], x, y, s, ang, fx), 16 * s, k + 8 + side, { op });
        pt.line(TR([[112, 66], [88, 98], [48, 106]], x, y, s, ang, fx), 14 * s, k + 10 + side, { op });
        VEIN_F.concat(VEIN_H).forEach((v, i) => pt.line(TR(v, x, y, s, ang, fx), 3.4 * s, k + 12 + i + side * 20, { op, amp: 0.7 }));
        if (s > 0.5) DOTS_F.concat(DOTS_H).forEach(([dx, dy], i) => { const p = TR([[dx, dy]], x, y, s, ang, fx)[0]; pt.dot(p[0], p[1], 3.4 * s, I.paperLight, k + 60 + i + side * 30, op); });
      }
    }
    // body + antennae
    const body = TR([[0, -40], [7, -26], [8, 10], [5, 58], [0, 66], [-5, 58], [-8, 10], [-7, -26]], x, y, s, ang);
    pt.fill(body, I.ink, k + 30, { op });
    const head = TR([[0, -44]], x, y, s, ang)[0];
    pt.dot(head[0], head[1], 9 * s, I.ink, k + 31, op);
    const ant = o.antenna || {};
    for (const side of [-1, 1]) {
      const a = TR([[side * 4, -48], [side * 18, -86], [side * 30, -118]], x, y, s, ang);
      pt.line(a, Math.max(2, 3.6 * s), k + 32 + side, { col: ant.col || I.ink, op, smooth: true });
      pt.dot(a[2][0], a[2][1], 6.5 * s, ant.col || I.ink, k + 34 + side, op);
      if (ant.glow) pt.dot(a[2][0], a[2][1], 22 * s * ant.glow, I.gold, k + 36 + side, 0.35 * ant.glow);
    }
    return { head, tipL: TR([[-30, -118]], x, y, s, ang)[0], tipR: TR([[30, -118]], x, y, s, ang)[0], fwR: TR([[80, -70]], x, y, s, ang, f)[0], body: TR([[0, 30]], x, y, s, ang)[0] };
  }
  // small resting butterfly with closed wings (side view), hanging; (x, y) = where it holds on
  const CW = [[0, 0], [10, 6], [16, 22], [12, 34], [2, 38], [-6, 30], [-4, 12]];
  function resting(pt, x, y, s, rot, k, o = {}) {
    const pts = TR(CW, x, y, s, rot);
    pt.shape(pts, o.col || UNDER, Math.max(1.6, 3 * s), k, { amp: 0.6, op: o.op ?? 1, lop: o.op ?? 1 });
    if (s > 0.9) pt.line(TR([[2, 6], [8, 30]], x, y, s, rot), 1.6 * s, k + 2, { amp: 0.4, op: o.op ?? 1 });
  }
  // a flying monarch on a looping path
  function flier(pt, i, lt, W, H, k, o = {}) {
    const r = rngI(k + i * 17);
    const x0 = r() * W, y0 = (o.y0 ?? 0.1) * H + r() * ((o.y1 ?? 0.75) - (o.y0 ?? 0.1)) * H;
    const sp = (o.speed ?? 40) * (0.6 + r() * 0.8), dir = r() < 0.5 ? -1 : 1, ph = r() * 6.28;
    let x = x0 + dir * sp * lt + Math.sin(lt * 0.9 + ph) * 60; x = ((x % (W + 200)) + W + 200) % (W + 200) - 100;
    const y = y0 + Math.sin(lt * 1.3 + ph * 2) * 50 + Math.sin(lt * 3.1 + ph) * 12;
    const flap = 0.5 + 0.5 * Math.sin(lt * (9 + r() * 4) + ph);
    const s = (o.s ?? 0.32) * (0.7 + r() * 0.6);
    monarch(pt, x, y, s, flap, dir * 1.2 + Math.sin(lt + ph) * 0.3, k + i * 101, { op: o.op });
  }

  // ---------------------------------------------------------------- trees
  function fir(pt, x, y, h, k, o = {}) {   // oyamel fir; y = foot
    const sw = Math.sin((o.t || 0) * 0.9 + k) * (o.sway ?? 3);
    pt.line([[x, y], [x + sw * 0.3, y - h]], Math.max(6, h * 0.03), k, { col: I.ink });
    const tiers = o.tiers ?? 7, tierPts = [];
    for (let i = 0; i < tiers; i++) {
      const u = i / tiers, ty = y - h * (0.16 + u * 0.82), wd = h * (0.17 - u * 0.022), dx = sw * (0.3 + u);
      pt.shape([[x - wd + dx, ty + h * 0.07], [x + dx, ty - h * 0.1], [x + wd + dx, ty + h * 0.07]], o.fill || mix(I.ink, I.green, 0.4), Math.max(3, h * 0.012), k + 2 + i * 2, { op: o.op ?? 0.88 });
      tierPts.push([x + dx, ty, wd, h * 0.07]);
    }
    return tierPts;
  }
  // a hanging cluster of butterflies under a tier (cx, cy = top centre)
  function cluster(pt, cx, cy, w, hgt, k, dens, t) {
    const r = rngI(k), n = Math.round(8 * dens * (w / 120));
    for (let i = 0; i < n; i++) {
      const u = r(), v = r();
      const x = cx + (u - 0.5) * w * (1 - v * 0.55);
      const y = cy + v * hgt;
      const flick = Math.sin(t * 3 + i * 1.7) > 0.96 ? 0.25 : 0;
      resting(pt, x, y, 0.75 + r() * 0.5, -0.2 + r() * 0.4 + flick, k + i * 7, { col: r() < 0.25 ? ORANGE : UNDER });
    }
  }

  // ---------------------------------------------------------------- shared base
  function base(ctx) {
    const { P, W, H, svg, seed } = ctx;
    const root = el(svg, 'g'), back = el(root, 'g'), mid = el(root, 'g'), rigs = el(root, 'g'), front = el(root, 'g'), top = el(root, 'g');
    const pb = painter(back), pm = painter(mid), pf = painter(front), pt = painter(top);
    const L = window.MCB.labels(el(root, 'g'), P.labels || [], W, H, seed * 31 + 5);
    const C = (P.cast && P.cast.length) ? window.MCB.cast(rigs, P.cast, W, H, seed * 17 + 3) : null;
    return { P, W, H, seed, pb, pm, pf, pt, L, C,
      begin(t) { pb.begin(t); pm.begin(t); pf.begin(t); pt.begin(t); },
      end(lt, t, cues) { pb.end(); pm.end(); pf.end(); pt.end(); L.update(lt, t, cues); if (C) C.update(lt, t, cues); },
    };
  }
  function grass(pt, W, H, y, k, t, n = 40) {
    const r = rngI(k);
    for (let i = 0; i < n; i++) { const x = r() * W, h = 30 + r() * 60, b = Math.sin(t * 1.4 + i) * 6; pt.line([[x, y + 10 + r() * (H - y)], [x + b + 6, y - h + 10 + r() * (H - y) * 0.2]], 4, k + i, { col: I.inkSoft, op: 0.7 }); }
  }
  function milkweed(pt, x, y, h, k, t, o = {}) {   // a milkweed plant: stem, broad paired leaves, a pink umbel on top
    const sw = Math.sin(t * 1.1 + k) * 6;
    pt.line([[x, y], [x + sw * 0.5, y - h * 0.5], [x + sw, y - h]], 7, k, { col: mix(I.green, I.ink, 0.3) });
    for (let i = 0; i < 3; i++) {
      const u = 0.3 + i * 0.22, px = x + sw * u, py = y - h * u;
      for (const sd of [-1, 1]) pt.shape(ell(px + sd * 46, py + 4, 48, 20, k + i * 9 + sd, 12, sd * 0.35), LEAF, 4, k + 20 + i * 4 + sd, {});
    }
    if (o.bloom !== false) { const bx = x + sw, by = y - h - 16; for (let j = 0; j < 9; j++) { const a = j / 9 * 6.28; pt.dot(bx + Math.cos(a) * 24, by + Math.sin(a) * 14, 11, BLOOM, k + 60 + j); } pt.dot(bx, by, 12, BLOOM, k + 70); }
    return [x + sw, y - h - 16];
  }

  // ================================================================ mon_forest
  SH.mon_forest = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'colony', gy = (P.ground ?? 0.84) * H;
      const r = rngI(seed * 13 + 1), nt = P.trees ?? 5;
      const trees = Array.from({ length: nt }, (_, i) => { const x = (i + 0.5) / nt * W + (r() - 0.5) * 120; return [x, gy + 10 + r() * 30, H * (0.78 + r() * 0.2)]; });
      const bare = mode === 'search';
      const br = Object.assign({ x: 0.66, y: 0.22, len: 560, dir: -1 }, P.branch || {});
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt; B.begin(t);
          const { pb, pm, pf, pt } = B;
          // slope / trail for "search"
          if (mode === 'search') {
            const trail = [[W * 0.05, H * 0.98], [W * 0.3, H * 0.86], [W * 0.5, H * 0.8], [W * 0.72, H * 0.7], [W * 0.95, H * 0.6]];
            pb.dash(trail, 6, seed + 5, { col: I.inkSoft, op: 0.8, dash: 30, gap: 22 });
          }
          const fillAt = tc(cues, 'fill', dur * 0.3);
          trees.forEach(([x, y, h], i) => {
            const tiers = fir(pb, x, y, h, seed + 100 + i * 40, { t: lt });
            if (bare) return;
            let dens = 1;
            if (mode === 'discover') dens = sm(lin(lt, fillAt + i * 0.25, 1.6));
            if (dens <= 0.02) return;
            tiers.forEach(([tx, ty, wd, hh], j) => { if (j < 1 || j > 5 || (j + i) % 2) return; cluster(pm, tx, ty + hh * 0.6, wd * 1.1, hh * 1.8 * (0.7 + 0.3 * dens), seed + 500 + i * 70 + j * 9, dens, lt); });
          });
          // ground carpet
          if (!bare) for (let i = 0; i < 26; i++) { const rr = rngI(seed * 3 + i); pm.dot(rr() * W, gy + 20 + rr() * (H - gy - 20), 6 + rr() * 6, ORANGE, seed + 900 + i, 0.75); }
          // the snapping branch
          if (mode === 'snap') {
            const sa = tc(cues, 'snap', dur * 0.35), u = sm(lin(lt, sa, 0.9));
            const px = br.x * W, py = br.y * H;
            const ang = u * 1.15 * -br.dir + (lt > sa && lt < sa + 0.3 ? Math.sin((lt - sa) * 60) * 0.03 : 0);
            const tipX = px + br.dir * br.len * Math.cos(ang), tipY = py + br.len * Math.sin(ang) * -br.dir * 1;
            const drop = sm(lin(lt, sa + 0.5, 1.0)) * (gy - py - 40);
            const A = [px, py + drop], Bp = [tipX, tipY + drop];
            const bpts = [A, [lerp(A[0], Bp[0], 0.5), lerp(A[1], Bp[1], 0.5) + 18], Bp];
            pm.line(bpts, 18, seed + 1200, { col: I.ink });
            for (let j = 0; j < 6; j++) { const q = pointAt(bpts, (j + 0.5) / 6); pm.line([q, [q[0] + br.dir * 40, q[1] - 30]], 6, seed + 1210 + j); }
            if (lt < sa + 0.4) for (let j = 0; j < 7; j++) { const q = pointAt(bpts, (j + 0.5) / 7); cluster(pm, q[0], q[1] + 4, 110, 140, seed + 1300 + j * 9, 1.2, lt); }
            if (lt < sa) pf.line([[px - 30, py - 6], [px + 30, py + 10]], 5, seed + 1290, { col: I.red, op: 0.8 * (0.5 + 0.5 * Math.sin(lt * 9)) });
            // burst + rain
            if (lt >= sa) {
              const e = lt - sa;
              for (let j = 0; j < 70; j++) {
                const rr = rngI(seed * 7 + j), q = pointAt(bpts, rr());
                const vx = (rr() - 0.5) * 420, vy = -120 - rr() * 260, g = 260;
                let xx = q[0] + vx * e + Math.sin(e * 3 + j) * 30, yy = q[1] + vy * e + 0.5 * g * e * e;
                const land = gy + 10 + rr() * 50; const landed = yy > land && rr() < 0.6;
                if (landed) yy = land;
                if (rr() < 0.4 && !landed) monarch(pf, xx, yy, 0.22 + rr() * 0.12, 0.5 + 0.5 * Math.sin(lt * 11 + j), rr() * 6, seed + 1400 + j * 50);
                else resting(pf, xx, yy, 1.1, landed ? 1.4 : e * 3 + j, seed + 1400 + j * 50, { col: rr() < 0.5 ? ORANGE : UNDER });
              }
            }
          }
          if (mode === 'measure') {
            const ra = tc(cues, 'rope', dur * 0.3), u = prog(lt, ra, 2.2);
            const box = [[W * 0.12, H * 0.2], [W * 0.62, H * 0.12], [W * 0.82, H * 0.32], [W * 0.8, H * 0.9], [W * 0.3, H * 0.94], [W * 0.1, H * 0.6], [W * 0.12, H * 0.2]];
            pf.dash(partial(box, u), 9, seed + 1600, { col: I.red, dash: 34, gap: 20 });
          }
          const nf = P.fliers ?? (bare ? 3 : 18);
          for (let i = 0; i < nf; i++) flier(pm, i, lt, W, H, seed + 2000, { s: 0.3, y0: 0.05, y1: 0.7 });   // behind the cast: faces stay clear
          grass(pf, W, H, gy + 40, seed + 3000, lt, 30);
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mon_wing
  SH.mon_wing = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'fly';
      const cx = (P.x ?? 0.5) * W, cy = (P.y ?? 0.52) * H, S = P.s ?? 3.0;
      const tagTxt = P.tag || ['397', 'TORONTO'];
      // sticker (text nodes)
      const tagG = el(ctx.svg, 'g'); const TS = P.tag_size || [56, 34]; const tagT = tagTxt.map((s, i) => svgText(tagG, s, 0, 0, TS[i ? 1 : 0], { 'font-family': FR, 'font-weight': 900, fill: I.ink }));
      tagG.style.display = 'none';
      const clkG = el(ctx.svg, 'g'); clkG.style.display = 'none';
      const cntT = svgText(ctx.svg, '', 0, 0, 110, { 'font-family': FR, 'font-weight': 900, fill: I.ink }); cntT.style.display = 'none';
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt; B.begin(t);
          const { pb, pm, pf, pt } = B;
          // milkweed blooms around the frame
          if (P.floor) {
            // the forest floor: needles, a fallen twig, monarchs lying all around
            const rf = rngI(seed + 77);
            for (let i = 0; i < 90; i++) { const x = rf() * W, y = rf() * H, a = rf() * 6.28, L = 30 + rf() * 40; pb.line([[x, y], [x + Math.cos(a) * L, y + Math.sin(a) * L]], 4, seed + 2000 + i, { col: rf() < 0.5 ? I.inkSoft : mix(I.green, I.ink, 0.4), op: 0.6 }); }
            pb.line([[W * 0.02, H * 0.86], [W * 0.3, H * 0.78], [W * 0.55, H * 0.84]], 16, seed + 2100, { col: I.ink });
            for (let i = 0; i < 44; i++) { const x = rf() * W, y = rf() * H; if (Math.hypot(x - W * 0.5, y - H * 0.5) < 420) continue; const fl = Math.sin(lt * 2 + i * 1.7) > 0.9; if (rf() < 0.35) monarch(pm, x, y, 0.34, fl ? 0.4 : 0.9, rf() * 6.28, seed + 2200 + i * 60); else resting(pm, x, y, 2.2, rf() * 6.28, seed + 2200 + i * 60, { col: rf() < 0.5 ? ORANGE : UNDER }); }
          } else {
            milkweed(pb, W * 0.08, H * 1.08, H * 0.5, seed + 10, lt);
            milkweed(pb, W * 0.93, H * 1.1, H * 0.62, seed + 40, lt);
            milkweed(pb, W * 0.2, H * 1.15, H * 0.3, seed + 70, lt, { bloom: false });
          }
          if (mode === 'cluster') {
            // extreme close-up: two fir boughs across the frame, big resting butterflies hanging from them in bunches
            const boughs = [[[-40, H * 0.16], [W * 0.4, H * 0.2], [W * 0.75, H * 0.14], [W + 40, H * 0.18]], [[-40, H * 0.56], [W * 0.35, H * 0.6], [W * 0.7, H * 0.54], [W + 40, H * 0.6]]];
            boughs.forEach((bp, bi) => {
              const sway = Math.sin(lt * 0.8 + bi) * 6, b2 = bp.map(([x, y]) => [x, y + sway]);
              pb.line(b2, 22, seed + 1000 + bi * 50, { col: I.ink });
              for (let i = 0; i < 26; i++) { const q = pointAt(b2, i / 25); pb.line([q, [q[0] + 40, q[1] - 46]], 6, seed + 1010 + bi * 50 + i, { col: mix(I.ink, I.green, 0.3) }); pb.line([q, [q[0] - 34, q[1] - 40]], 6, seed + 1040 + bi * 50 + i, { col: mix(I.ink, I.green, 0.3) }); }
              const rr = rngI(seed + 1100 + bi);
              for (let i = 0; i < 46; i++) {
                const u = (i + rr()) / 46, q = pointAt(b2, u), row = Math.floor(rr() * 3);
                const flick = Math.sin(lt * 2.2 + i * 1.9) > 0.97;
                resting(pm, q[0] + (rr() - 0.5) * 30, q[1] + 6 + row * 70, 3.2 + rr() * 0.8, -0.25 + rr() * 0.5, seed + 1200 + bi * 400 + i * 7, { col: flick || rr() < 0.3 ? ORANGE : UNDER });
              }
            });
            for (let i = 0; i < 4; i++) flier(pt, i, lt, W, H, seed + 1500, { s: 0.55, y0: 0.3, y1: 0.9, speed: 50 });
            B.end(lt, t, cues); return;
          }
          if (mode === 'scale') {
            // hand balance on a table
            const tip = tc(cues, 'tip', dur * 0.35), u = spring(lt, tip, 1.2) * (lt >= tip ? 1 : 0);
            const a = -0.22 * u + Math.sin(lt * 2) * 0.01, bx = W * 0.5, by = H * 0.34, L = 470;
            pb.fill([[W * 0.1, H * 0.86], [W * 0.9, H * 0.86], [W * 0.92, H * 1.02], [W * 0.08, H * 1.02]], mix(I.paperDark, I.inkSoft, 0.2), seed + 90, { smooth: false });
            pb.line([[W * 0.1, H * 0.86], [W * 0.9, H * 0.86]], 7, seed + 91);
            pm.line([[bx, H * 0.86], [bx, by]], 12, seed + 92);
            pm.shape([[bx - 90, H * 0.86], [bx, H * 0.8], [bx + 90, H * 0.86]], I.paperDark, 6, seed + 93, { smooth: false });
            const lx = bx - L * Math.cos(a), ly = by - L * Math.sin(a) * -1, rx = bx + L * Math.cos(a), ry = by + L * Math.sin(a) * -1;
            const LY = by + L * Math.sin(-a) * -1, RY = by - L * Math.sin(-a) * -1;
            const pans = [[lx, by - L * Math.sin(a)], [rx, by + L * Math.sin(a)]];
            pm.line([pans[0], pans[1]], 10, seed + 94, { smooth: false });
            pm.dot(bx, by, 16, I.ink, seed + 95);
            pans.forEach(([px, py], i) => {
              pm.line([[px, py], [px - 110, py + 200]], 3, seed + 96 + i * 3, { col: I.inkSoft }); pm.line([[px, py], [px + 110, py + 200]], 3, seed + 97 + i * 3, { col: I.inkSoft });
              pm.shape([[px - 150, py + 200], [px + 150, py + 200], [px + 110, py + 236], [px - 110, py + 236]], I.paperLight, 6, seed + 100 + i * 5, { smooth: false });
            });
            // butterfly on the left pan (lighter: rises), paperclip on the right
            monarch(pf, pans[0][0], pans[0][1] + 150, 0.7, 0.75 + 0.25 * Math.sin(lt * 4), 0, seed + 200);
            const px = pans[1][0], py = pans[1][1] + 196;
            pf.line([[px - 70, py], [px + 70, py], [px + 90, py - 18], [px + 70, py - 36], [px - 50, py - 36], [px - 64, py - 22], [px - 50, py - 10], [px + 50, py - 10]], 7, seed + 210, { col: I.inkSoft, smooth: true });
            B.end(lt, t, cues); return;
          }
          // main butterfly
          let ang = Math.sin(lt * 0.5) * 0.04, x = cx, y = cy, beat = mode === 'antenna' || mode === 'paint' ? 0.08 : 0.16;
          let flap = 0.86 + beat * Math.sin(lt * 4.2);
          const lost = tc(cues, 'lost', 1e9);
          if (mode === 'paint' && lt > lost) { const e = lt - lost; ang = e * 2.4; x = cx + Math.sin(e * 1.8) * 160; y = cy + Math.cos(e * 1.3) * 60; flap = 0.6 + 0.4 * Math.sin(lt * 10); }
          let antenna = {};
          if (mode === 'antenna') { const ca = tc(cues, 'clock', dur * 0.4); antenna = { glow: (0.6 + 0.4 * Math.sin(lt * 5)) * prog(lt, ca * 0.3, 0.8), col: I.ink }; }
          let paintU = 0;
          if (mode === 'paint') { const pa = tc(cues, 'paint', dur * 0.2); paintU = prog(lt, pa, 1.4); }
          const geo = monarch(pm, x, y, S, flap, ang, seed + 300, { antenna });
          if (mode === 'paint' && paintU > 0) {
            for (const side of [-1, 1]) {
              const a = TR([[side * 4, -48], [side * 18, -86], [side * 30, -118]], x, y, S, ang);
              pf.line(partial(a, paintU), 12 * S / 3, seed + 400 + side, { col: I.ink });
              pf.dot(a[2][0], a[2][1], 9 * S * paintU, I.ink, seed + 402 + side);
            }
            if (lt < tc(cues, 'paint', dur * 0.2) + 1.8) {   // brush
              const a = TR([[30, -118]], x, y, S, ang)[0], u = paintU, bx = lerp(a[0] - 40, a[0] + 10, u), byy = lerp(a[1] + 220, a[1] - 10, u);
              pf.line([[bx, byy], [bx + 160, byy - 220]], 16, seed + 410, { col: I.inkSoft });
              pf.shape([[bx - 12, byy + 4], [bx + 10, byy - 20], [bx + 4, byy + 30]], I.ink, 4, seed + 412, {});
            }
            if (lt > lost) { const q = prog(lt, lost, 0.6); pf.line([[x + 260, y - 260], [x + 300, y - 300], [x + 340, y - 260], [x + 300, y - 220], [x + 300, y - 190]], 10 * q, seed + 420, { col: I.red }); pf.dot(x + 300, y - 150, 9 * q, I.red, seed + 421); }
          }
          if (mode === 'tag') {
            const ta = tc(cues, 'tag', dur * 0.3), u = spring(lt, ta, 0.7) * (lt >= ta ? 1 : 0);
            if (u > 0) {
              const p = TR([[96, -70]], x, y, S, ang, flap > 0 ? 0.18 + 0.82 * flap : 1)[0];
              const w = (P.tag_w ?? 250) * u, h = (tagTxt.length > 2 ? 150 : 124) * u;
              pf.shape([[p[0] - w / 2, p[1] - h / 2], [p[0] + w / 2, p[1] - h / 2], [p[0] + w / 2, p[1] + h / 2], [p[0] - w / 2, p[1] + h / 2]], I.paperLight, 6, seed + 500, { smooth: false });
              tagG.style.display = ''; tagG.setAttribute('transform', `translate(${inkF1(p[0])} ${inkF1(p[1])}) scale(${inkF1(Math.max(0.01, u) * 100) / 100})`);
              if (tagT.length > 2) tagT.forEach((n, i) => n.setAttribute('y', -34 + i * 38)); else { tagT[0].setAttribute('y', -6); tagT[1].setAttribute('y', 38); }
            } else tagG.style.display = 'none';
          }
          if (mode === 'antenna') {
            const ca = tc(cues, 'clock', dur * 0.4), u = spring(lt, ca, 0.7) * (lt >= ca ? 1 : 0);
            if (u > 0) {
              const tip = geo.tipR, ccx = tip[0] + 190, ccy = tip[1] - 40, R = 80 * u;
              pf.shape(ell(ccx, ccy, R, R, seed + 600), I.paperLight, 7, seed + 601, {});
              for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; pf.line([[ccx + Math.cos(a) * R * 0.78, ccy + Math.sin(a) * R * 0.78], [ccx + Math.cos(a) * R * 0.92, ccy + Math.sin(a) * R * 0.92]], 4, seed + 610 + i); }
              const ha = lt * 1.6, ma = lt * 6;
              pf.line([[ccx, ccy], [ccx + Math.sin(ha) * R * 0.45, ccy - Math.cos(ha) * R * 0.45]], 8, seed + 630);
              pf.line([[ccx, ccy], [ccx + Math.sin(ma) * R * 0.7, ccy - Math.cos(ma) * R * 0.7]], 5, seed + 631, { col: I.red });
              pf.dash([[tip[0] + 10, tip[1] - 6], [ccx - R, ccy]], 4, seed + 640, { col: I.inkSoft, dash: 14, gap: 10 });
            }
          }
          if (mode === 'radio') {
            const pa = tc(cues, 'ping', dur * 0.3);
            const b = geo.body;
            pf.shape([[b[0] - 26, b[1] - 10], [b[0] + 26, b[1] - 10], [b[0] + 26, b[1] + 26], [b[0] - 26, b[1] + 26]], I.blue, 4, seed + 700, { smooth: false });
            for (let i = 0; i < 3; i++) pf.line([[b[0] - 20 + i * 20, b[1] - 8], [b[0] - 20 + i * 20, b[1] + 24]], 2, seed + 702 + i, { col: I.paperLight });
            pf.line([[b[0], b[1] + 26], [b[0] + 40, b[1] + 160], [b[0] + 60, b[1] + 230]], 3, seed + 710, { col: I.ink });
            if (lt > pa) for (let i = 0; i < 3; i++) { const e = ((lt - pa) * 0.9 + i / 3) % 1, R = 40 + e * 260; const arc = []; for (let j = 0; j <= 10; j++) { const a = -0.9 + j / 10 * 1.8; arc.push([b[0] + 60 + Math.cos(a) * R, b[1] + 230 + Math.sin(a) * R]); } pf.line(arc, 6 * (1 - e) + 1, seed + 720 + i, { col: I.red, op: 1 - e }); }
          }
          // a few small companions in the distance
          for (let i = 0; i < (P.fliers ?? 4); i++) flier(pt, i, lt, W, H, seed + 900, { s: 0.22, y0: 0.05, y1: 0.3, op: 0.8 });
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mon_life
  SH.mon_life = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'meadow', gy = (P.ground ?? 0.84) * H;
      const r = rngI(seed + 5);
      const plants = Array.from({ length: P.plants ?? 7 }, (_, i) => [(i + 0.5) / (P.plants ?? 7) * W + (r() - 0.5) * 90, gy + 20 + r() * 40, H * (0.32 + r() * 0.2)]);
      const gens = P.gens || [];
      const gT = gens.map(g => svgText(ctx.svg, g.text || '', 0, 0, 52, { 'font-family': INK_FONT, fill: I.ink }));
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt; B.begin(t);
          const { pb, pm, pf, pt } = B;
          if (mode === 'eat') {
            // close: a big milkweed leaf across the frame, a striped caterpillar chewing its edge
            const leaf = [[W * 0.02, H * 0.72], [W * 0.3, H * 0.42], [W * 0.62, H * 0.36], [W * 0.98, H * 0.46], [W * 0.66, H * 0.74], [W * 0.3, H * 0.84]];
            const bite = prog(lt, 0.2, dur * 0.9);
            pb.shape(leaf, LEAF, 8, seed + 10, {});
            pb.line([[W * 0.02, H * 0.72], [W * 0.5, H * 0.58], [W * 0.98, H * 0.46]], 6, seed + 12, { col: mix(LEAF, I.ink, 0.4) });
            for (let i = 1; i < 7; i++) { const u = i / 7, p = [lerp(W * 0.02, W * 0.98, u), lerp(H * 0.72, H * 0.46, u)]; pb.line([p, [p[0] + 60, p[1] - 110 + u * 20]], 3, seed + 20 + i, { col: mix(LEAF, I.ink, 0.4) }); pb.line([p, [p[0] + 40, p[1] + 110]], 3, seed + 30 + i, { col: mix(LEAF, I.ink, 0.4) }); }
            // bite marks: paper scallops eaten into the upper edge
            for (let j = 0; j < 0; j++) { const q = clamp01(bite * 4 - j); if (q <= 0) continue; const bx = W * (0.42 + j * 0.05), byy = H * 0.38 - j * 4; pm.fill(ell(bx, byy, 46 * q, 34 * q, seed + 40 + j), I.paper, seed + 40 + j, {}); }
            // caterpillar
            const cxp = W * 0.5 + bite * W * 0.12, cyp = H * 0.47;
            for (let i = 0; i < 12; i++) {
              const u = i / 11, xx = cxp - 320 + u * 330, yy = cyp + Math.sin(lt * 4 - u * 5) * 12 + (1 - u) * 30;
              const col = [I.ink, I.paperLight, I.gold][i % 3];
              pm.shape(ell(xx, yy, 34, 40, seed + 60 + i), col, 4, seed + 61 + i * 2, {});
            }
            const hx = cxp + 30, hy = cyp - 10 + Math.sin(lt * 9) * 6;
            pm.shape(ell(hx, hy, 34, 38, seed + 90), I.ink, 4, seed + 91, {});
            pm.line([[cxp - 300, cyp - 20], [cxp - 330, cyp - 80]], 6, seed + 92); pm.line([[cxp + 10, cyp - 40], [cxp - 10, cyp - 100]], 6, seed + 93);
            // bird swoops in and veers off
            const ba = tc(cues, 'bird', dur * 0.6);
            if (lt > ba - 1.2) {
              const e = lt - (ba - 1.2), bxp = W * 1.05 - e * 520 + Math.max(0, e - 1.2) * 1100, byp = H * 0.18 + Math.min(e, 1.2) * 120 - Math.max(0, e - 1.2) * 260;
              const wf = Math.sin(lt * 14) * 40;
              pf.line([[bxp - 90, byp - wf], [bxp, byp], [bxp + 90, byp - wf]], 12, seed + 95, { col: I.ink });
              pf.dot(bxp - 6, byp + 6, 18, I.ink, seed + 96);
            }
            B.end(lt, t, cues); return;
          }
          plants.forEach(([x, y, h], i) => milkweed(pb, x, y, mode === 'gens' ? h * 0.35 : h, seed + 100 + i * 90, lt, { bloom: mode !== 'gens' }));
          if (mode === 'meadow' || mode === 'release') for (let i = 0; i < (P.fliers ?? 7); i++) flier(pt, i, lt, W, H, seed + 700, { s: 0.42, y0: 0.15, y1: 0.55, speed: 30 });
          if (mode === 'release') {
            const ga = tc(cues, 'go', dur * 0.5), f = P.from || [0.36, 0.5];
            if (lt < ga) resting(pf, f[0] * W, f[1] * H, 2.2, 0.1, seed + 800, { col: ORANGE });
            else { const e = lt - ga; monarch(pf, f[0] * W + e * 120 + Math.sin(e * 3) * 40, f[1] * H - e * 150, 0.5, 0.5 + 0.5 * Math.sin(lt * 12), 0.5, seed + 810); }
            // the tag-and-release net
            const nx = (P.net || [0.22, 0.42])[0] * W, ny = (P.net || [0.22, 0.42])[1] * H;
            pf.line([[nx, ny + 260], [nx + 10, ny + 60]], 8, seed + 830, { col: I.inkSoft });
            pf.line(ell(nx + 14, ny, 70, 60, seed + 831, 14, 0.3).concat([ell(nx + 14, ny, 70, 60, seed + 831, 14, 0.3)[0]]), 6, seed + 832, {});
            pf.fill(ell(nx + 24, ny + 70, 52, 80, seed + 833), I.paperLight, seed + 834, { op: 0.6 });
          }
          if (mode === 'cycle') {
            const st = [[0.16, 'c1'], [0.39, 'c2'], [0.62, 'c3'], [0.85, 'c4']];
            const yy = H * 0.5, Z = 1.4;
            st.forEach(([fx, cn], i) => {
              const a = tc(cues, cn, dur * (0.12 + i * 0.2)), u = spring(lt, a, 0.6) * (lt >= a ? 1 : 0);
              if (u <= 0) return;
              const x = fx * W;
              pm.shape(ell(x, yy + 120, 170 * u, 56 * u, seed + 200 + i, 12), LEAF, 5, seed + 201 + i * 3, {});
              if (i === 0) pm.shape(ell(x, yy + 60, 26 * u, 34 * u, seed + 210), I.paperLight, 4, seed + 211, {});
              if (i === 1) for (let j = 0; j < 9; j++) { const xx = x - 130 + j * 32, y2 = yy + 70 + Math.sin(lt * 4 - j) * 10; pm.shape(ell(xx, y2, 22 * u, 28 * u, seed + 220 + j), [I.ink, I.paperLight, I.gold][j % 3], 3, seed + 230 + j * 2, {}); }
              if (i === 2) { pm.line([[x, yy - 160], [x, yy - 90]], 5, seed + 250); pm.shape(ell(x, yy - 10, 48 * u, 86 * u, seed + 251), mix(I.green, I.paperLight, 0.35), 5, seed + 252, {}); for (let j = 0; j < 5; j++) pm.dot(x - 34 + j * 17, yy - 50, 5, I.gold, seed + 254 + j); }
              if (i === 3) { const go = tc(cues, 'go', 1e9), e = Math.max(0, lt - go); monarch(pm, x + e * 120, yy - 10 - e * 140, 0.85 * u, 0.7 + 0.3 * Math.sin(lt * 8), 0.2, seed + 260, { op: 1 - clamp01(e / 3) * 0.8 }); }
              if (i > 0) { const pa = st[i - 1][0] * W; pm.line([[pa + 120, yy - 150], [lerp(pa, x, 0.5), yy - 190], [x - 120, yy - 150]], 6 * u, seed + 290 + i, { col: I.red }); pm.line([[x - 140, yy - 170], [x - 118, yy - 150], [x - 146, yy - 136]], 6 * u, seed + 295 + i, { col: I.red, smooth: false }); }
            });
          }
          if (mode === 'gens') {
            const n = gens.length;
            gens.forEach((g, i) => {
              const a = tc(cues, g.at, dur * (0.1 + i * 0.15)), u = spring(lt, a, 0.6) * (lt >= a ? 1 : 0);
              const x = (i + 0.5) / n * W, y = H * 0.4;
              gT[i].style.display = u > 0 ? '' : 'none';
              if (u <= 0) return;
              let op = 1, s = 0.55;
              if (g.kind === 'short') op = 1 - 0.6 * clamp01((lt - a - 1.6) / 1.2);
              if (g.kind === 'super') { s = 0.8; pm.dot(x, y, 170 * u * (0.95 + 0.05 * Math.sin(lt * 4)), I.gold, seed + 300 + i, 0.35); }
              if (g.kind === 'old') pm.shape(ell(x, y, 150, 150, seed + 320 + i), I.paperLight, 6, seed + 321 + i, { op: 0.9, lc: I.red });
              monarch(pm, x, y + Math.sin(lt * 2 + i) * 8, s * u, 0.82 + 0.18 * Math.sin(lt * 5 + i), 0, seed + 400 + i * 80, { op });
              gT[i].setAttribute('x', x); gT[i].setAttribute('y', H * 0.7); gT[i].setAttribute('fill', g.kind === 'super' || g.kind === 'old' ? I.red : I.ink);
              if (i > 0) pm.line([[x - W / n + 120, H * 0.4], [x - 120, H * 0.4]], 5, seed + 480 + i, { col: I.inkSoft });
            });
          }
          grass(pf, W, H, gy + 30, seed + 3000, lt, 36);
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mon_map
  const NA = [[-135, 70], [-135, 58], [-130, 55], [-127, 50.5], [-124.5, 48.4], [-124, 46], [-124.3, 42], [-122.5, 37.8], [-120.6, 34.6], [-117.2, 32.6],
    [-115.8, 30.4], [-114.2, 28], [-112.4, 25.8], [-110, 23], [-109.6, 23.2], [-111.2, 26.5], [-112.8, 29.6], [-114.6, 31.6], [-113.2, 31.2], [-110.8, 27.8],
    [-109, 25.5], [-106, 23], [-105.4, 20.4], [-103.8, 18.6], [-100, 16.9], [-96.5, 15.7], [-94, 16], [-92.2, 14.6], [-90, 13.6], [-87.5, 13], [-85.8, 11],
    [-85.7, 9.9], [-83.6, 8.5], [-81, 7.6], [-80, 7], [-77.4, 8], [-77.8, 9.2], [-79.6, 9.6], [-81.5, 8.9], [-83.5, 10.9], [-83.7, 13.5], [-83.3, 15],
    [-86, 15.9], [-88.2, 15.8], [-88.3, 17.5], [-87.5, 19.5], [-86.8, 21.4], [-88.5, 21.5], [-90.4, 21], [-90.6, 19.4], [-91.8, 18.5], [-94.5, 18.2],
    [-96, 19.2], [-97.2, 21.4], [-97.7, 24], [-97.2, 27.8], [-94.6, 29.4], [-91.2, 29.3], [-89.4, 29], [-89.2, 30.3], [-87.5, 30.3], [-85.2, 29.7], [-83.6, 29.6],
    [-82.7, 27.6], [-81.2, 25.2], [-80.4, 25.4], [-80.1, 26.8], [-80.8, 29.5], [-81.4, 31.4], [-79.2, 33.1], [-76.4, 34.8], [-75.8, 36.4], [-76.2, 37.4],
    [-75.2, 38.4], [-74, 40.3], [-72, 40.9], [-70.6, 41.5], [-70, 41.8], [-70.6, 42.6], [-70.2, 43.7], [-68.6, 44.3], [-67, 44.7], [-66.1, 44.9], [-64.4, 45.4],
    [-65.6, 43.6], [-63.6, 44.4], [-61.2, 45.4], [-60, 46], [-61.6, 46.3], [-64.5, 46.6], [-64.9, 48.6], [-66.2, 49.2], [-62.5, 50], [-59.3, 50.3],
    [-55.8, 52], [-57.3, 54.6], [-60.5, 56], [-62.4, 57.8], [-64.6, 60.3], [-70, 59], [-74, 62], [-80, 63], [-95, 66], [-120, 70]];
  const BORDER_CA = [[-123.3, 49], [-95.2, 49], [-89.6, 48], [-84.5, 46.5], [-82.4, 45.3], [-82.5, 42.5], [-79, 43.3], [-76.5, 44.2], [-74.7, 45], [-71.5, 45], [-69.2, 47.4], [-67.8, 47.1], [-67.8, 45.6], [-67.1, 45.1]];
  const BORDER_MX = [[-117.1, 32.5], [-114.7, 32.7], [-111, 31.3], [-108.2, 31.3], [-106.5, 31.8], [-104.5, 29.6], [-103, 29], [-101.4, 29.8], [-99.5, 27.5], [-97.2, 25.9]];
  const LAKES = [[-87.5, 47.6, 3.4, 0.8, 0.1], [-87, 43.9, 0.6, 1.8, 0], [-82.4, 44.8, 1.3, 1.1, 0.4], [-81.2, 42.2, 1.9, 0.45, 0.35], [-77.8, 43.6, 1.3, 0.35, 0.1]];
  SH.mon_map = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'routes';
      const V = Object.assign({ lon0: -128, lon1: -56, lat0: 13, lat1: 57 }, P.view || {});
      const kx = W / (V.lon1 - V.lon0), ky = H / (V.lat1 - V.lat0);
      const pr = ([lon, lat]) => [(lon - V.lon0) * kx, (V.lat1 - lat) * ky];
      const site = Object.assign({ name: 'winter forests', lon: -100.3, lat: 19.6 }, P.site || {});
      const S = pr([site.lon, site.lat]);
      const coast = NA.map(pr), bca = BORDER_CA.map(pr), bmx = BORDER_MX.map(pr);
      const names = [['CANADA', -100, 54], ['UNITED STATES', -100, 39.5], ['MEXICO', -104, 24.5]].map(([s, lo, la]) => { const p = pr([lo, la]); return svgText(ctx.svg, s, p[0], p[1], 58, { 'font-family': FR, 'font-weight': 800, fill: I.inkSoft, 'letter-spacing': 8, 'fill-opacity': 0.75 }); });
      const gulf = (() => { const p = pr([-90, 25]); return svgText(ctx.svg, 'Gulf of Mexico', p[0], p[1], 46, { 'font-family': INK_FONT, fill: I.blue }); })();
      const r = rngI(seed + 3);
      const origins = P.origins || [[-93.6, 44.8], [-79.4, 43.7], [-72, 42.5], [-85, 41], [-97, 47], [-89, 38], [-76, 39.5]];
      const routes = origins.map(o => { const a = pr(o), m = [lerp(a[0], S[0], 0.5) + (r() - 0.5) * 80, lerp(a[1], S[1], 0.5) + 40]; return [a, m, S]; });
      const cnt = svgText(ctx.svg, '', W * 0.5, H * 0.94, 64, { 'font-family': FR, 'font-weight': 900, fill: I.red });
      const qm = svgText(ctx.svg, '?', 0, 0, 260, { 'font-family': FR, 'font-weight': 900, fill: I.red }); qm.style.display = 'none';
      const smooth3 = ([a, m, b]) => { const o = []; for (let i = 0; i <= 24; i++) { const u = i / 24; o.push([(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * m[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * m[1] + u * u * b[1]]); } return o; };
      const rp = routes.map(smooth3);
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt; B.begin(t);
          const { pb, pm, pf, pt } = B;
          // sea wash + land
          pb.fill(coast, I.paperLight, seed + 1, { op: 0.95, amp: 0.8 });
          pb.line(coast, 6, seed + 2, { closed: true, amp: 0.8 });
          LAKES.forEach(([lo, la, rx, ry, rot], i) => { const c = pr([lo, la]); pb.shape(ell(c[0], c[1], rx * kx, ry * ky, seed + 10 + i, 12, rot), mix(I.blue, I.paperLight, 0.55), 3, seed + 20 + i * 2, {}); });
          pb.dash(bca, 4, seed + 40, { col: I.inkSoft, dash: 16, gap: 12 });
          pb.dash(bmx, 4, seed + 60, { col: I.inkSoft, dash: 16, gap: 12 });
          for (let i = 0; i < 9; i++) { const y = H * (0.12 + i * 0.1); pb.line([[W * 0.82, y], [W * 0.98, y + 8]], 2.5, seed + 80 + i, { col: I.blue, op: 0.35 }); }
          // compass rose (bottom right)
          const cx = W * 0.9, cy = H * 0.8;
          pb.line([[cx, cy - 80], [cx, cy + 80]], 4, seed + 95); pb.line([[cx - 80, cy], [cx + 80, cy]], 4, seed + 96);
          pb.shape([[cx, cy - 90], [cx + 16, cy], [cx, cy + 10], [cx - 16, cy]], I.red, 3, seed + 97, { smooth: false });
          if (mode === 'routes') {
            const ra = tc(cues, 'route', dur * 0.15), u = prog(lt, ra, 3.2);
            rp.forEach((p, i) => { const pp = partial(p, clamp01(u * 1.15 - i * 0.03)); if (pp.length > 1) pm.dash(pp, 6, seed + 200 + i * 40, { col: I.red, dash: 22, gap: 14 }); });
            rp.forEach((p, i) => { for (let j = 0; j < 2; j++) { const v = ((lt - ra) * 0.18 + j * 0.5 + i * 0.13) % 1; if (lt < ra) continue; const q = pointAt(p, v), q2 = pointAt(p, Math.min(1, v + 0.02)); monarch(pf, q[0], q[1], 0.2, 0.5 + 0.5 * Math.sin(lt * 10 + i + j), Math.atan2(q2[0] - q[0], -(q2[1] - q[1])), seed + 400 + i * 30 + j * 13); } });
            origins.forEach((o, i) => { const p = pr(o); pm.dot(p[0], p[1], 9, I.ink, seed + 300 + i); });
          }
          if (mode === 'tags') {
            const line = [pr([-79.4, 43.7]), pr([-86, 40]), pr([-93, 36]), pr([-97.5, 32]), pr([-99.8, 28.6])];
            const sa = tc(cues, 'stop', dur * 0.75), u = prog(lt, 0.3, Math.max(0.5, sa - 0.5));
            pm.dash(partial(line, u), 6, seed + 500, { col: I.red, dash: 20, gap: 14 });
            for (let i = 0; i < 16; i++) { const v = i / 15; if (v > u) break; const q = pointAt(line, v), rr = rngI(seed + i); pm.dot(q[0] + (rr() - 0.5) * 70, q[1] + (rr() - 0.5) * 70, 10, I.red, seed + 520 + i); }
            const p0 = pr([-79.4, 43.7]); pm.dot(p0[0], p0[1], 14, I.ink, seed + 560);
            if (lt > sa) { const q = spring(lt, sa, 0.7), e = line[line.length - 1]; qm.style.display = ''; qm.setAttribute('x', e[0] + 40); qm.setAttribute('y', e[1] + 230); qm.setAttribute('font-size', Math.max(1, 260 * q)); }
            else qm.style.display = 'none';
          }
          if (mode === 'search') {
            // a wandering dashed search route through the mountains west of Mexico City
            const mc = pr([-99.13, 19.43]), rs = rngI(seed + 640); const path = [mc];
            for (let i = 1; i < 16; i++) { const a = i * 1.9 + rs() * 1.2, rad = 30 + i * 9 + rs() * 30; path.push([mc[0] - 30 - Math.cos(a) * rad - i * 4, mc[1] - 10 + Math.sin(a) * rad * 0.8]); }
            const u = prog(lt, 0.3, Math.max(1, dur - 1.2));
            pm.dash(partial(path, u), 6, seed + 650, { col: I.red, dash: 14, gap: 10 });
            const q = pointAt(path, u);
            [-22, 22].forEach((dx, k) => {   // two small walkers at the head of the route
              const x = q[0] + dx, y = q[1] - 6, sw = Math.sin(lt * 7 + k * 3) * 8;
              pf.line([[x, y - 46], [x, y - 14]], 5, seed + 662 + k * 9);
              pf.line([[x - 10 + sw, y + 10], [x, y - 14], [x + 10 - sw, y + 10]], 5, seed + 663 + k * 9, { smooth: false });
              pf.line([[x - 12 - sw, y - 26], [x, y - 38], [x + 12 + sw, y - 26]], 4, seed + 664 + k * 9, { smooth: false });
              pf.shape(ell(x, y - 58, 12, 12, seed + 665 + k * 9), I.paperLight, 4, seed + 666 + k * 9, {});
            });
            pf.dot(mc[0], mc[1], 10, I.ink, seed + 661);
          }
          if (mode === 'line') {
            const f = Object.assign({ lon: -93.6, lat: 44.8 }, P.from || {}), A = pr([f.lon, f.lat]);
            const ra = tc(cues, 'route', dur * 0.2), u = prog(lt, ra, 2.4);
            pm.dash(partial([A, S], u), 8, seed + 600, { col: I.red, dash: 26, gap: 16 });
            pm.dot(A[0], A[1], 16, I.ink, seed + 610);
            if (u > 0.05 && u < 1) { const q = pointAt([A, S], u); monarch(pf, q[0], q[1], 0.3, 0.5 + 0.5 * Math.sin(lt * 10), Math.atan2(S[0] - A[0], -(S[1] - A[1])), seed + 620); }
          }
          if (mode === 'radio') {
            const ca = tc(cues, 'count', dur * 0.3);
            const towers = [[-97.7, 30.3], [-98.5, 27.5], [-95.4, 29.8], [-99.1, 25.7], [-100.3, 25.6], [-101, 22.2], [-99.2, 19.4], [-100.4, 20.6], [-103.3, 20.7], [-96.8, 32.8], [-97.5, 35.5]];
            towers.forEach((tw, i) => { const p = pr(tw); pm.line([[p[0] - 14, p[1] + 26], [p[0], p[1] - 22], [p[0] + 14, p[1] + 26]], 4, seed + 700 + i, { smooth: false }); const bl = (Math.sin(lt * 4 + i * 1.7) + 1) / 2; pm.dot(p[0], p[1] - 26, 6 + bl * 6, I.red, seed + 720 + i, 0.5 + 0.5 * bl); });
            const n = Math.round((P.count ?? 175) * prog(lt, ca, 2.5));
            for (let i = 0; i < Math.min(60, Math.round(n / 3)); i++) { const rr = rngI(seed + 800 + i); const p = pr([-104 + rr() * 8, 18.5 + rr() * 9]); pf.dot(p[0], p[1], 6, I.gold, seed + 810 + i, 0.9); }
            cnt.textContent = lt >= ca ? `${n} in Mexico` : '';
            cnt.setAttribute('x', S[0] + 380); cnt.setAttribute('y', S[1] - 40);
          } else cnt.textContent = '';
          // winter site ring (always)
          const sa = tc(cues, 'site', mode === 'pin' ? dur * 0.25 : 0), su = spring(lt, sa, 0.7) * (lt >= sa ? 1 : 0);
          if (su > 0 && !P.no_site) { pf.line(ell(S[0], S[1], 40 * su, 40 * su, seed + 900).concat([ell(S[0], S[1], 40 * su, 40 * su, seed + 900)[0]]), 7, seed + 901, { col: I.red }); pf.dot(S[0], S[1], 12, ORANGE, seed + 902); }
          if (mode === 'pin') { const mc = pr([-99.13, 19.43]); pf.dot(mc[0], mc[1], 10, I.ink, seed + 910); }
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mon_sun
  SH.mon_sun = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'sun', gy = (P.ground ?? 0.84) * H;
      const bx = W * 0.5, by = H * 0.52;
      const lab = ['E', 'W'].map((s, i) => svgText(ctx.svg, s, i ? W * 0.94 : W * 0.06, gy - 30, 72, { 'font-family': FR, 'font-weight': 900, fill: I.inkSoft }));
      svgText(ctx.svg, 'SOUTH', bx + 50, by + 220, 56, { 'text-anchor': 'start', 'font-family': FR, 'font-weight': 900, fill: I.green, 'letter-spacing': 6 });
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt; B.begin(t);
          const { pb, pm, pf, pt } = B;
          // the day arc of the sun (dashed), east (left) -> west (right)
          const arc = []; for (let i = 0; i <= 30; i++) { const a = Math.PI - i / 30 * Math.PI; arc.push([W * 0.5 + Math.cos(a) * W * 0.4, gy - 40 - Math.sin(a) * H * 0.62]); }
          pb.dash(arc, 4, seed + 10, { col: I.inkSoft, dash: 16, gap: 16, op: 0.7 });
          let su;
          if (mode === 'sun') su = 0.32 + 0.03 * Math.sin(lt * 0.5);
          else if (mode === 'cloud') su = 0.55;
          else su = clamp01(0.08 + lt / dur * 0.85);
          const sp = pointAt(arc, su);
          const rays = 12;
          for (let i = 0; i < rays; i++) { const a = i / rays * 6.283 + lt * 0.3; pm.line([[sp[0] + Math.cos(a) * 82, sp[1] + Math.sin(a) * 82], [sp[0] + Math.cos(a) * 120, sp[1] + Math.sin(a) * 120]], 6, seed + 20 + i, { col: I.gold }); }
          pm.shape(ell(sp[0], sp[1], 66, 66, seed + 40), I.gold, 6, seed + 41, {});
          // clouds
          if (mode === 'cloud') {
            const ca = tc(cues, 'cloud', dur * 0.15), u = prog(lt, ca, 2.2);
            [[-0.4, 0, 1.2], [0.5, 60, 1], [-1, 110, 0.9]].forEach(([dx, dy, s], i) => {
              const cx = lerp(W * (1.25 + i * 0.1), sp[0] + dx * 120, u), cy = sp[1] + dy - 10;
              const blob = [[-180, 30], [-150, -30], [-80, -70], [0, -90], [90, -60], [170, -20], [190, 34], [0, 50]].map(([x, y]) => [cx + x * s, cy + y * s]);
              pf.shape(blob, mix(I.paperLight, I.inkSoft, 0.15), 6, seed + 60 + i * 3, {});
            });
            const fa = tc(cues, 'field', dur * 0.5), fu = prog(lt, fa, 2.0);
            for (let i = 0; i < 6; i++) { const fl = []; for (let j = 0; j <= 20; j++) { const u2 = j / 20; fl.push([W * 0.05 + u2 * W * 0.9, H * (0.3 + i * 0.1) + Math.sin(u2 * 3.1) * -80 + Math.sin(lt * 0.8 + i) * 4]); } pm.dash(partial(fl, fu), 4, seed + 100 + i * 30, { col: I.blue, dash: 18, gap: 14, op: 0.8 }); }
            if (fu > 0) { const nx = W * 0.8, ny = H * 0.66, R = 70 * spring(lt, fa, 0.6); pf.shape(ell(nx, ny, R, R, seed + 300), I.paperLight, 6, seed + 301, {}); const na = Math.PI + Math.sin(lt * 2) * 0.12; pf.shape([[nx + Math.sin(na) * R * 0.8, ny - Math.cos(na) * R * 0.8], [nx + 10, ny], [nx - Math.sin(na) * R * 0.8, ny + Math.cos(na) * R * 0.8], [nx - 10, ny]], I.red, 3, seed + 302, { smooth: false }); }
          }
          // heading arrow (south = down toward the viewer)
          let hd = Math.PI / 2;   // heading angle in screen space: pointing down
          const curve = mode === 'arc' ? sm(lin(lt, tc(cues, 'curve', dur * 0.3), 4)) : 0;
          const headY = by + 200;
          pm.line([[bx, by + 40], [bx, headY]], 9, seed + 400, { col: I.green });
          pm.shape([[bx - 28, headY - 10], [bx + 28, headY - 10], [bx, headY + 36]], I.green, 4, seed + 401, { smooth: false });
          // sun ray to the butterfly + angle arc
          if (mode !== 'arc') {
            pm.dash([[bx, by], sp], 4, seed + 420, { col: I.gold, dash: 18, gap: 12 });
            const a0 = Math.atan2(sp[1] - by, sp[0] - bx), a1 = hd, R = 130, arcP = [];
            let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
            for (let i = 0; i <= 16; i++) { const a = a0 + d * i / 16; arcP.push([bx + Math.cos(a) * R, by + Math.sin(a) * R]); }
            pm.line(arcP, 6, seed + 430, { col: I.red });
          }
          if (mode === 'arc') {
            // a butterfly that just follows the sun: its path bends away
            const path = []; for (let i = 0; i <= 20; i++) { const u = i / 20 * curve; path.push([bx - Math.sin(u * 2.2) * 420, by + 40 - u * 200 + Math.sin(u * 3) * 60]); }
            if (path.length > 1) pf.dash(path, 6, seed + 450, { col: I.red, dash: 18, gap: 12 });
            const q = path[path.length - 1];
            if (curve > 0.05) monarch(pf, q[0], q[1], 0.26, 0.5 + 0.5 * Math.sin(lt * 10), -1.2, seed + 460, { op: 0.8 });
          }
          if (mode === 'clock') {
            const ca = tc(cues, 'clock', dur * 0.2), u = spring(lt, ca, 0.6) * (lt >= ca ? 1 : 0);
            if (u > 0) { const cx = bx + 330, cy = by - 40, R = 96 * u; pf.shape(ell(cx, cy, R, R, seed + 500), I.paperLight, 7, seed + 501, {}); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; pf.line([[cx + Math.cos(a) * R * 0.78, cy + Math.sin(a) * R * 0.78], [cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92]], 4, seed + 510 + i); } const ha = su * 6.283 * 1.0 - 1.5, ma = lt * 5; pf.line([[cx, cy], [cx + Math.sin(ha) * R * 0.5, cy - Math.cos(ha) * R * 0.5]], 9, seed + 530); pf.line([[cx, cy], [cx + Math.sin(ma) * R * 0.72, cy - Math.cos(ma) * R * 0.72]], 5, seed + 531, { col: I.red }); }
          }
          // the butterfly (seen from above, heading down = south)
          monarch(pf, bx, by + Math.sin(lt * 2) * 6, 0.72, 0.55 + 0.45 * Math.sin(lt * 8), Math.PI, seed + 600);
          grass(pf, W, H, gy + 40, seed + 3000, lt, 26);
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mon_patch
  // SHOTS.mon_patch — the winter forest seen from above (fir crowns), with the area the colonies cover painted orange.
  //   The patch grows to P.big (relative radius) on cue "big", then shrinks to P.small on cue "small"; the old outline
  //   stays as a red dashed line.  P: {big: 0.36, small: 0.145, labels}   cues: big, small
  SH.mon_patch = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const rr = rngI(seed + 9), crowns = [];
      for (let i = 0; i < 150; i++) crowns.push([rr() * (W + 120) - 60, rr() * (H + 120) - 60, 46 + rr() * 34]);
      crowns.sort((a, b) => a[1] - b[1]);
      const cx = W * 0.42, cy = H * 0.52, blob = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * 6.283; return [Math.cos(a) * (1 + 0.12 * Math.sin(i * 2.3)), Math.sin(a) * (0.8 + 0.1 * Math.cos(i * 1.7))]; });
      const shape = r => blob.map(([x, y]) => [cx + x * r * W, cy + y * r * W]);
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt; B.begin(t);
          const { pb, pm, pf } = B;
          pb.fill([[0, 0], [W, 0], [W, H], [0, H]], mix(I.green, I.paper, 0.55), seed + 1, { smooth: false });
          crowns.forEach(([x, y, r], i) => {
            const pts = []; for (let j = 0; j < 10; j++) { const a = j / 10 * 6.283 + i; pts.push([x + Math.cos(a) * r * (j % 2 ? 0.62 : 1), y + Math.sin(a) * r * (j % 2 ? 0.62 : 1)]); }
            pb.shape(pts, mix(I.green, I.ink, 0.35 + (i % 3) * 0.1), 3, seed + 10 + i * 2, { amp: 0.8 });
          });
          const ba = tc(cues, 'big', dur * 0.15), sa = tc(cues, 'small', dur * 0.5);
          const big = P.big ?? 0.36, small = P.small ?? 0.145;
          const r = lt < sa ? big * spring(lt, ba, 0.9) * (lt >= ba ? 1 : 0) : lerp(big, small, progIO(lt, sa, 1.6));
          if (r > 0.01) {
            const sh = shape(r);
            pm.fill(sh, ORANGE, seed + 400, { op: 0.72 });
            pm.line(sh, 7, seed + 401, { closed: true, col: I.ink });
            const rd = rngI(seed + 402);
            for (let i = 0; i < 60; i++) { const a = rd() * 6.283, d = Math.sqrt(rd()) * 0.85; resting(pf, cx + Math.cos(a) * d * r * W, cy + Math.sin(a) * d * r * W * 0.8, 1.4, rd() * 6.28, seed + 410 + i * 5, { col: rd() < 0.5 ? ORANGE : UNDER }); }
          }
          if (lt > sa) { const sh = shape(big); sh.push(sh[0]); pf.dash(sh, 7, seed + 700, { col: I.red, dash: 26, gap: 16 }); }
          B.end(lt, t, cues);
        },
      };
    },
  };

  // ================================================================ mon_desk
  SH.mon_desk = {
    kind: '2d',
    build(ctx) {
      const B = base(ctx), { P, W, H, seed } = B;
      const mode = P.mode || 'lab';
      const dy = (P.desk ?? 0.7) * H;
      const notice = P.notice || ['VOLUNTEERS WANTED', 'monarch butterflies', 'write to Toronto'];
      const nT = notice.map((s, i) => svgText(ctx.svg, '', 0, 0, i ? 56 : 70, { 'font-family': i ? INK_FONT : FR, 'font-weight': i ? 400 : 900, fill: I.red }));
      const quote = P.quote || ['"We have found them."'];
      const qT = quote.map((s, i) => svgText(ctx.svg, '', W * 0.67, H * (0.2 + i * 0.09), 64, { 'font-family': FR, 'font-weight': 800, fill: I.ink, 'font-style': 'italic' }));
      const mast = svgText(ctx.svg, mode === 'notice' ? (P.masthead || 'THE DAILY NEWS') : '', W * 0.5, H * 0.15, 96, { 'font-family': FR, 'font-weight': 900, fill: I.ink, 'letter-spacing': 6 });
      const pins = P.pins || [];
      return {
        update(lt, dur, cues, env) {
          const t = env ? env.t : lt; B.begin(t);
          const { pb, pm, pf, pt } = B;
          if (mode === 'notice') {
            // full-frame newspaper page
            const x0 = W * 0.08, x1 = W * 0.92, y0 = H * 0.04, y1 = H * 1.04;
            pb.shape([[x0, y0], [x1, y0 + 10], [x1 + 10, y1], [x0 - 6, y1]], I.paperLight, 6, seed + 1, { smooth: false });
            pb.line([[x0 + 40, H * 0.2], [x1 - 40, H * 0.2]], 5, seed + 2);
            for (let c = 0; c < 4; c++) for (let l = 0; l < 22; l++) { const cx = x0 + 60 + c * (x1 - x0 - 120) / 4, yy = H * 0.26 + l * 34; if (c >= 1 && c <= 2 && l >= 3 && l <= 16) continue; const rr = rngI(seed + c * 50 + l); pb.line([[cx, yy], [cx + (x1 - x0 - 200) / 4 * (0.7 + rr() * 0.3), yy]], 6, seed + 10 + c * 40 + l, { col: I.inkSoft, op: 0.45, amp: 0.6 }); }
            const na = tc(cues, 'notice', dur * 0.15), u = spring(lt, na, 0.6) * (lt >= na ? 1 : 0);
            const bxl = x0 + 60 + (x1 - x0 - 120) / 4 - 20, bxr = x0 + 60 + 3 * (x1 - x0 - 120) / 4 - 40, byt = H * 0.26 + 3 * 34 - 20, byb = H * 0.26 + 16 * 34;
            if (u > 0) {
              const box = [[bxl, byt], [bxr, byt], [bxr, byb], [bxl, byb], [bxl, byt]];
              pm.line(partial(box, u), 9, seed + 300, { col: I.red, smooth: false });
              pm.shape(ell((bxl + bxr) / 2, byt + 150, 60, 44, seed + 310), mix(I.paperLight, I.gold, 0.2), 0.1, seed + 311, { op: 0 });
              monarch(pm, (bxl + bxr) / 2, byb - 110, 0.45, 0.85 + 0.15 * Math.sin(lt * 4), 0, seed + 320);
            }
            notice.forEach((s, i) => { const ty = na + 0.5 + i * 0.8, n = Math.floor(s.length * clamp01((lt - ty) / 0.8)); nT[i].textContent = s.slice(0, Math.max(0, n)); nT[i].setAttribute('x', (bxl + bxr) / 2); nT[i].setAttribute('y', byt + 90 + i * 80); });
            B.end(lt, t, cues); return;
          }
          // room: back wall, window, desk
          pb.line([[0, dy - 4], [W, dy - 4]], 6, seed + 3);
          pb.fill([[0, dy], [W, dy], [W, H], [0, H]], mix(I.paperDark, I.inkSoft, 0.25), seed + 4, { smooth: false, op: 0.9 });
          for (let i = 0; i < 6; i++) pb.line([[i * W / 5, dy + 20], [i * W / 5 - 60, H]], 3, seed + 6 + i, { col: I.ink, op: 0.35 });
          // wall map of North America with pins
          const mx = W * (P.map_x ?? 0.5), my = H * 0.3, mw = 520, mh = 330;
          pb.shape([[mx - mw / 2, my - mh / 2], [mx + mw / 2, my - mh / 2], [mx + mw / 2, my + mh / 2], [mx - mw / 2, my + mh / 2]], I.paperLight, 6, seed + 30, { smooth: false });
          const mpr = ([lon, lat]) => [mx - mw / 2 + (lon + 128) / 72 * mw, my - mh / 2 + (57 - lat) / 44 * mh];
          pb.line(NA.map(mpr).filter(p => p[0] > mx - mw / 2 - 10 && p[1] < my + mh / 2 + 4 && p[1] > my - mh / 2 - 4), 3.5, seed + 31, { col: I.inkSoft });
          pins.forEach((p, i) => { const a = tc(cues, p.at, dur * (0.2 + i * 0.1)), u = spring(lt, a, 0.5) * (lt >= a ? 1 : 0); if (u <= 0) return; const q = mpr([p.lon, p.lat]); pm.line([[q[0], q[1]], [q[0] + 4, q[1] - 22 * u]], 3, seed + 40 + i); pm.dot(q[0] + 4, q[1] - 24 * u, 9 * u, I.red, seed + 60 + i); });
          if (P.string) { const pts = pins.filter((p, i) => lt >= tc(cues, p.at, dur * (0.2 + i * 0.1))).map(p => mpr([p.lon, p.lat])); if (pts.length > 1) pm.line(pts, 3, seed + 80, { col: I.red, smooth: false }); }
          // desk
          const dx0 = W * 0.18, dx1 = W * 0.82, top = dy + 60;
          pm.shape([[dx0, top], [dx1, top], [dx1 + 40, top + 40], [dx0 - 40, top + 40]], I.paperDark, 6, seed + 100, { smooth: false });
          pm.line([[dx0, top + 40], [dx0, H]], 10, seed + 101); pm.line([[dx1, top + 40], [dx1, H]], 10, seed + 102);
          // lamp
          const lx = W * 0.26, ly = top;
          pm.line([[lx, ly], [lx + 30, ly - 140], [lx + 110, ly - 200]], 8, seed + 110);
          pm.shape([[lx + 70, ly - 230], [lx + 170, ly - 210], [lx + 140, ly - 160], [lx + 80, ly - 180]], I.ink, 5, seed + 111, { smooth: false });
          pm.fill([[lx + 110, ly - 170], [lx + 40, top + 2], [lx + 300, top + 2], [lx + 160, ly - 170]], I.gold, seed + 112, { op: 0.18 + 0.03 * Math.sin(lt * 3), smooth: false });
          // pinned butterflies box on the desk
          pm.shape([[W * 0.62, top - 90], [W * 0.76, top - 90], [W * 0.76, top], [W * 0.62, top]], I.paperLight, 5, seed + 120, { smooth: false });
          for (let i = 0; i < 3; i++) monarch(pm, W * (0.645 + i * 0.045), top - 45, 0.18, 1, 0, seed + 130 + i * 30);
          if (mode === 'letters') {
            const ma = tc(cues, 'mail', dur * 0.1);
            for (let i = 0; i < 18; i++) {
              const a = ma + i * Math.max(0.15, (dur * 0.75 - ma) / 18); if (lt < a) continue;
              const u = prog(lt, a, 0.7), rr = rngI(seed + 200 + i);
              const tx = W * (0.42 + rr() * 0.16), ty = top - 14 - Math.min(i, 12) * 9 - rr() * 6;
              const x = lerp(W * (rr() < 0.5 ? -0.05 : 1.05), tx, u), y = lerp(H * 0.1, ty, u) - Math.sin(u * Math.PI) * 120, rot = lerp(rr() * 4 - 2, rr() * 0.4 - 0.2, u);
              const env2 = TR([[-60, -30], [60, -30], [60, 30], [-60, 30]], x, y, 1, rot);
              pf.shape(env2, I.paperLight, 4, seed + 220 + i * 3, { smooth: false });
              pf.line(TR([[-60, -30], [0, 4], [60, -30]], x, y, 1, rot), 3, seed + 222 + i * 3, { smooth: false });
              pf.dot(TR([[38, -14]], x, y, 1, rot)[0][0], TR([[38, -14]], x, y, 1, rot)[0][1], 8, I.red, seed + 224 + i * 3);
            }
          }
          if (mode === 'call') {
            const ra = tc(cues, 'ring', dur * 0.1), ring = lt > ra && lt < ra + 2.4;
            const px = W * 0.5 + (ring ? Math.sin(lt * 50) * 4 : 0), py = top - 10;
            pf.shape([[px - 90, py], [px + 90, py], [px + 70, py - 70], [px - 70, py - 70]], I.ink, 5, seed + 300, { smooth: false });
            pf.shape(ell(px, py - 60, 34, 22, seed + 301), I.paperLight, 4, seed + 302, {});
            const lift = ring ? 0 : (lt > ra ? 1 : 0);
            pf.line([[px - 100, py - 88 - lift * 60], [px - 40, py - 104 - lift * 60], [px + 40, py - 104 - lift * 60], [px + 100, py - 88 - lift * 60]], 22, seed + 303);
            if (ring) for (let i = 0; i < 3; i++) { const e = ((lt - ra) * 2 + i / 3) % 1; const R = 110 + e * 90; [-1, 1].forEach(sd => { const a2 = []; for (let j = 0; j <= 6; j++) { const a = -0.6 + j / 6 * 1.2; a2.push([px + sd * Math.cos(a) * R, py - 70 + Math.sin(a) * R]); } pf.line(a2, 6 * (1 - e) + 1, seed + 310 + i * 2 + (sd > 0 ? 1 : 0), { col: I.red, op: 1 - e }); }); }
            const qa = tc(cues, 'quote', ra + 1.0);
            quote.forEach((s, i) => { const ty = qa + i * 1.0, n = Math.floor(s.length * clamp01((lt - ty) / 0.9)); qT[i].textContent = s.slice(0, Math.max(0, n)); });
          }
          B.end(lt, t, cues);
        },
      };
    },
  };
})();
