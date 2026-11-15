// km_meat: shots for the Stickstory Short "Kentucky meat shower" (2026-11-15). On 3 March 1876, near Olympia Springs in
// Bath County, Kentucky, Mrs. Crouch was making soap in her yard under a clear sky when flakes of red meat fell around
// her for a few minutes. Two men tasted it (mutton or venison?); microscopists found lung tissue, cartilage and muscle;
// the best guess (Kastenbine, 1876) is a flock of vultures throwing up. Parchment ink style (brand/kit/BRAND.md §3, §5):
// palette tokens only (INK.*), every line boils at 8 Hz via _ink.js, everything a pure function of (seed, lt); no
// Math.random. Parametric: any "strange thing falls on a farm / lab finding / birds overhead" story.
// Uses bb__lib.js (BBL.cast, BBL.labels) and lh__lib.js (LH.kasif, LH.person) read-only.
//
// Common P: labels: [{text, x, y (0..1), at, size, color, font: "hand"|"serif", rot, arrow, stamp}] (BBL.labels),
//   kasif: {x, y (ground 0..1), scale, pose, face, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | absent,
//   flakes: {n: 40, at: cue|sec (first flake leaves the sky; negative = already falling), span: 3 (s over which they
//   start), size: 1, ymin: 0.62, ymax: 0.95 (landing band, 0..1 H), rail: 0.2 (share that lands on the fence rail)} | false
//
// SHOTS.km_yard — an 1876 Kentucky farm yard: log farmhouse with a stone chimney (left), split-rail fence behind,
//   a black soap kettle hung from a pole tripod over a wood fire (steam, bubbling soap), a woodpile, a bucket and big
//   grass in the foreground (down to the frame bottom). Meat flakes flutter down and stay where they land.
//   P: {mode: "rain"|"soap"|"taste"|"end", gy: 0.6, house: true, kettle: {x: 0.7, s: 1} | false, lady: {x: 0.46, s: 0.95,
//   face: "right", look: "kettle"|"up" , up: cue (she looks up and recoils)} | false, chunk: {at, x} (one big piece
//   lands in front with a splat; fall: 0.7 s, r: 64), men: {x: 0.3, s: 1.05} (taste: two bearded farmers, the left one holds up a bitten flake and chews),
//   bubbles: [{at, kind: "sheep"|"deer", x, y, r, text}] (thought bubbles), flakes, labels, kasif}
// SHOTS.km_sky — looking up into the clear sky over the farm: a ring of vultures circling, or meat flakes drifting down
//   toward the viewer; treetops and fence posts frame the bottom. P: {mode: "fall"|"circle"|"vomit", birds: 5,
//   ring: {x: 0.5, y: 0.34, rx: 0.34, ry: 0.1}, sun: [x, y (0..1), r] | absent, lady: true | {x: 0.5, y: 0.82, s: 1.8}
//   (fall: Mrs. Crouch big, waist-up; recoils in shock at cue "hit"), big: {x: 0.5, y: 0.38, s: 1.6} (vomit: one big
//   vulture crossing, throws up at cue "throw", flaps hard and climbs away at cue "fly"; + drift: 40 px/s, climb: 200,
//   climbX: 120, stream: 22 chunks every gap: 0.08 s, xmin/xmax: 0..1 clamp), ring.s: 0.3 (bird size), ring.span/spread: 1,
//   yard: {y: 0.55 (ground line), kettle: 0.82 | null, ks: 0.7, n: 46} (the meat-strewn yard below the sky: back fence,
//   kettle, meat lying around; vomited meat lands in it), front: 0.78 (a near fence across the frame at that y, meat on
//   its rails; hides the legs), flakes (+ stay: true, targets: [[x, y], ...] landing spots for the first flakes),
//   labels, kasif}
// SHOTS.km_scope — a cluttered 1876 laboratory: shelves of jars, a window, a wooden table with a brass microscope, an
//   oil lamp, a jar of red sample; a white-haired scientist bends to the eyepiece and jerks back at cue "found".
//   P: {jar: "SAMPLE", found: false (no jolt), labels}
// SHOTS.km_lens — extreme close-up through the eyepiece: a bright round field of tissue (lung air sacs on one side,
//   cartilage cells on the other) drifting slowly in a brass ring; cues "lung" / "cart" outline each tissue.
//   Drawn in screen coordinates for the close-up given in P.view {focus, zoom} (= the scene's camera). P: {view, labels}
// cues: hit, fall, up, found, lung, cart, throw + label/cast/bubble "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const fr = v => v - Math.floor(v);
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  // colours (tokens only)
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.35);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const LOG = () => mix(INK.stain, INK.paperDark, 0.15);
  const IRON = () => mix(INK.ink, INK.inkSoft, 0.25);
  const MEAT = () => mix(INK.red, INK.stain, 0.12);
  const MEAT_D = () => mix(INK.red, INK.ink, 0.35);
  const FAT = () => mix(INK.paperLight, INK.red, 0.18);
  const GRASS = () => mix(INK.green, INK.paperDark, 0.25);
  const GRASS_D = () => mix(INK.green, INK.ink, 0.3);
  const BIRD = () => mix(INK.ink, INK.inkSoft, 0.18);
  const BIRD_L = () => mix(INK.inkSoft, INK.paperLight, 0.45);
  const BRASS = () => mix(INK.gold, INK.stain, 0.3);
  const BRASS_D = () => mix(INK.gold, INK.ink, 0.4);
  const TISSUE = () => mix(INK.red, INK.paperLight, 0.62);
  const TISSUE_W = () => mix(INK.red, INK.paperLight, 0.25);
  const CART = () => mix(INK.blue, INK.paperLight, 0.72);
  const CART_C = () => mix(INK.blue, INK.ink, 0.25);

  // ------------------------------------------------------------------ a pen: ordered pool of filled paths
  function pen(parent, seed) {
    const g = el(parent, 'g'), pool = [];
    let i = 0, t = 0, k = 0;
    const get = () => { if (i >= pool.length) pool.push(el(g, 'path', { stroke: 'none' })); return pool[i++]; };
    const P = {
      g,
      begin(tt) { i = 0; t = tt; k = seed; },
      end() { for (let j = i; j < pool.length; j++) pool[j].setAttribute('d', ''); },
      raw(d, col, op = 1) { const e = get(); e.setAttribute('d', d); e.setAttribute('fill', col); e.setAttribute('fill-opacity', op); },
      fill(pts, col, o = {}) { k += 3; P.raw(inkLoop(pts, { seed: k, t, smooth: !!o.smooth, amp: o.amp ?? 1 }), col, o.op ?? 1); },
      line(pts, w, col = INK.ink, o = {}) { k += 3; P.raw(inkPath(pts, { w, seed: k, t, closed: !!o.closed, smooth: o.smooth ?? true, amp: o.amp ?? 1, taper: o.taper }), col, o.op ?? 1); },
      shape(pts, col, o = {}) { P.fill(pts, col, o); if ((o.w ?? 5) > 0) P.line(pts, o.w ?? 5, o.line || INK.ink, { closed: true, smooth: !!o.smooth, amp: o.amp }); },
      circ(cx, cy, r, col, o = {}) { k += 3; if (col) P.raw(inkCircle(cx, cy, r, k, t, { fill: true, ry: o.ry }), col, o.op ?? 1); if ((o.w ?? 5) > 0) P.raw(inkCircle(cx, cy, r, k + 1, t, { w: o.w ?? 5, ry: o.ry }), o.line || INK.ink); },
      dot(cx, cy, rx, ry, col = INK.ink, op = 1) { k += 3; P.raw(inkDot(cx, cy, rx, ry, k, t), col, op); },
      get t() { return t; },
    };
    return P;
  }
  const labelsOf = (root, list, W, H, sd) => window.BBL ? window.BBL.labels(el(root, 'g'), list || [], W, H, sd) : { update() {} };
  const kasifOf = (root, K, W, H, sd) => K && window.LH ? window.LH.kasif(el(root, 'g'), K, W, H, sd) : null;
  const rotP = (p, a) => [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a)];

  // ------------------------------------------------------------------ one piece of meat (irregular, with a fat streak)
  function meat(pn, cx, cy, r, rot, seed, o = {}) {
    if (r < 2) return;
    const ry = o.flat ? r * 0.5 : r * 0.78;
    if (r >= 40) {   // a big raw chunk: kidney-shaped steak with a white fat cap and marbling
      const T = q => { const v = rotP([q[0] * r, q[1] * ry], rot); return [cx + v[0], cy + v[1]]; };
      const out = [[-1, -0.25], [-0.72, -0.72], [-0.1, -0.88], [0.52, -0.74], [0.95, -0.32], [1, 0.16], [0.72, 0.62], [0.22, 0.72], [-0.18, 0.5], [-0.6, 0.66], [-0.96, 0.34]].map(T);
      pn.fill(out, FAT(), { smooth: true, amp: 0.8 });
      const inn = [[-0.84, -0.12], [-0.6, -0.5], [-0.08, -0.62], [0.46, -0.5], [0.8, -0.2], [0.86, 0.14], [0.64, 0.5], [0.22, 0.58], [-0.16, 0.38], [-0.56, 0.52], [-0.84, 0.28]].map(T);
      pn.fill(inn, MEAT(), { smooth: true, amp: 0.8 });
      pn.fill([[-0.3, -0.1], [0.1, -0.35], [0.55, -0.2], [0.5, 0.25], [0.05, 0.3]].map(T), MEAT_D(), { smooth: true, amp: 0.6, op: 0.75 });
      [[[-0.6, 0.05], [-0.25, -0.15], [0.1, 0.0]], [[0.2, -0.35], [0.45, -0.1], [0.65, 0.05]], [[-0.1, 0.25], [0.25, 0.15], [0.5, 0.35]]]
        .forEach(L => pn.line(L.map(T), Math.max(3, r * 0.05), FAT(), { amp: 0.6 }));
      pn.line(out, Math.max(4, r * 0.06), INK.ink, { closed: true, amp: 0.8 });
      return;
    }
    const pts = inkEllipsePts(cx, cy, r, ry, seed, 9, rot, 0.22);
    pn.fill(pts, MEAT(), { smooth: true, amp: 0.8 });
    pn.fill(inkEllipsePts(cx + r * 0.15, cy + ry * 0.2, r * 0.55, ry * 0.42, seed + 3, 8, rot, 0.2), MEAT_D(), { smooth: true, amp: 0.6, op: 0.7 });
    const a = rotP([-r * 0.5, -ry * 0.1], rot), b = rotP([r * 0.1, -ry * 0.35], rot), c = rotP([r * 0.5, -ry * 0.15], rot);
    if (r > 9) pn.line([[cx + a[0], cy + a[1]], [cx + b[0], cy + b[1]], [cx + c[0], cy + c[1]]], Math.max(2.5, r * 0.16), FAT(), { amp: 0.6 });
    pn.line(pts, Math.max(2.4, Math.min(5, r * 0.12)), INK.ink, { closed: true, amp: 0.8 });
  }

  // ------------------------------------------------------------------ falling flakes: spawn, flutter, land, stay
  // spec: {n, at, span, size, ymin, ymax, rail, railY(x) -> y | null, toward: false (sky: grow as they come close)}
  function flakeSet(spec, W, H, seed) {
    const n = spec.n ?? 40, list = [];
    for (let i = 0; i < n; i++) {
      const tg = spec.targets && spec.targets[i];
      if (tg) { list.push({ x: tg[0] * W, ly: tg[1] * H, rail: false, t0: 0.15 + 0.7 * hn(i, seed + 3), fd: 1.2, r: 0.9 + 0.3 * hn(i, seed + 5), sp: 2, ph: hn(i, seed + 8) * 6.3, i }); continue; }
      const x = (0.03 + 0.94 * hn(i, seed + 1)) * W;
      const onRail = spec.railY && hn(i, seed + 6) < (spec.rail ?? 0.2) ? spec.railY(x) : null;
      const ly = onRail != null ? onRail : lerp(spec.ymin ?? 0.62, spec.ymax ?? 0.95, Math.pow(hn(i, seed + 2), 0.8)) * H;
      list.push({ x, ly, rail: onRail != null, t0: hn(i, seed + 3), fd: 1.0 + hn(i, seed + 4) * 0.9, r: 0.6 + 0.8 * hn(i, seed + 5), sp: (hn(i, seed + 7) - 0.5) * 6, ph: hn(i, seed + 8) * 6.3, i });
    }
    return {
      draw(pn, lt, at, gyTop) {
        const span = spec.span ?? 3, size = spec.size ?? 1;
        list.forEach(f => {
          const ts = at + f.t0 * span, u = (lt - ts) / f.fd;
          if (u < 0) return;
          const persp = spec.toward ? 1 : 0.55 + 0.75 * clamp01((f.ly - gyTop) / (H - gyTop + 1));
          const r = 17 * f.r * size * persp;
          if (u < 1) {
            if (spec.toward) {   // seen from below: start tiny high up, grow and drift down toward the viewer
              const q = u * u;
              const y = lerp(-0.02 * H, f.ly, u), rr = lerp(r * 0.25, r * 2.2, q);
              meat(pn, f.x + Math.sin(lt * 3 + f.ph) * 26 * (1 - u), y, rr, lt * f.sp, 4000 + f.i);
            } else {
              const y = lerp(-60, f.ly, u), sway = Math.sin(lt * 4 + f.ph) * 22 * (1 - u * 0.6);
              meat(pn, f.x + sway, y, r, lt * f.sp + f.ph, 4000 + f.i);
            }
          } else if (spec.toward && spec.stay) {   // landed (ground, shoulders, apron): stays, flattened
            const d = (u - 1) * f.fd;
            meat(pn, f.x, f.ly, r * 1.7 * (d < 0.12 ? 1.15 - d : 1), f.ph, 4000 + f.i, { flat: true });
          } else if (!spec.toward) {
            const d = (u - 1) * f.fd, sq = d < 0.12 ? 1 - d / 0.12 * 0.5 : 0.5;
            meat(pn, f.x, f.ly, r * (1 + (1 - sq) * 0.3), f.ph, 4000 + f.i, { flat: true });
            if (d < 0.3) for (let j = 0; j < 3; j++) { const a = -Math.PI * (0.2 + 0.3 * j), L = r * (1.2 + d * 6); pn.line([[f.x + Math.cos(a) * r, f.ly + Math.sin(a) * r * 0.5], [f.x + Math.cos(a) * L * 1.3, f.ly + Math.sin(a) * L * 0.7]], 3, INK.ink, { op: 1 - d / 0.3 }); }
          }
        });
      },
    };
  }

  // ------------------------------------------------------------------ Mrs. Crouch: hatless rig + hair bun + long dress + apron
  function lady(parent, sd) {
    const g = el(parent, 'g');
    const back = el(g, 'g'), rg = el(g, 'g'), front = el(g, 'g');
    const bunF = inkEl(back, INK.inkSoft), bunR = inkEl(back);
    const rig = KASIF.create(rg, { scale: 1, hat: false, seed: sd });
    const dressF = inkEl(front, INK.blue), dressR = inkEl(front), apronF = inkEl(front, INK.paperLight), apronR = inkEl(front);
    function update(t, x, y, S, pose, o = {}) {
      const face = o.face ?? 1;
      const res = rig.update(t, pose, Object.assign({ x, y, face, scale: S, since: o.since ?? 1, dir: o.dir ?? 0, emotion: o.emotion || null, mouth: 0 }, o.extra || {})) || {};
      const W2 = q => [x + face * S * q[0], y + S * q[1]];
      const hc = res.head ? W2(res.head) : [x, y - 400 * S];
      const bx = hc[0] - face * 58 * S, by = hc[1] - 40 * S, bp = inkEllipsePts(bx, by, 44 * S, 40 * S, sd + 1, 10);
      bunF.setAttribute('d', inkLoop(bp, { seed: sd + 1, t, amp: 0.9 }));
      bunR.setAttribute('d', inkPath(bp, { seed: sd + 2, t, w: 5, closed: true, amp: 0.9 }) + ' ' +
        inkPath([[hc[0] - 70 * S * face, hc[1] - 6 * S], [hc[0] - 34 * S * face, hc[1] - 66 * S], [hc[0] + 24 * S * face, hc[1] - 74 * S]], { seed: sd + 3, t, w: 7, amp: 0.6 }));
      const hp = res.hip ? W2(res.hip) : [x, y - 184 * S];
      const wv = Math.sin(t * 1.3) * 3 * S, top = hp[1] - 74 * S, bot = y - 22 * S;
      const pts = [[hp[0] - 36 * S, top], [hp[0] + 36 * S, top], [hp[0] + 46 * S, hp[1] - 8 * S], [hp[0] + 100 * S + wv, bot], [hp[0] - 100 * S + wv, bot], [hp[0] - 46 * S, hp[1] - 8 * S]];
      dressF.setAttribute('d', inkLoop(pts, { seed: sd + 5, t, amp: 1, smooth: false }));
      dressR.setAttribute('d', inkPath(pts, { seed: sd + 6, t, w: 6, closed: true, amp: 1, smooth: false }));
      const ax = hp[0] + face * 16 * S, ap = [[ax - 30 * S, hp[1] - 6 * S], [ax + 30 * S, hp[1] - 6 * S], [ax + 52 * S + wv, bot - 30 * S], [ax - 52 * S + wv, bot - 30 * S]];
      apronF.setAttribute('d', inkLoop(ap, { seed: sd + 7, t, amp: 0.8, smooth: false }));
      apronR.setAttribute('d', inkPath(ap, { seed: sd + 8, t, w: 4, closed: true, amp: 0.8, smooth: false }) + ' ' +
        inkPath([[hp[0] - 44 * S, hp[1] - 8 * S], [hp[0] + 44 * S, hp[1] - 8 * S]], { seed: sd + 9, t, w: 5, amp: 0.8 }));
      const hands = (res.hands || []).map(W2);
      return { head: hc, hands, hip: hp };
    }
    return { update };
  }

  // ------------------------------------------------------------------ yard pieces
  function cabin(pn, x0, x1, gy, t) {
    const w = x1 - x0, top = gy - 420, roofY = top - 6, peak = gy - 600;
    pn.shape([[x0 + w * 0.68, peak + 30], [x0 + w * 0.8, peak + 30], [x0 + w * 0.8, roofY], [x0 + w * 0.68, roofY]], mix(INK.paperDark, INK.inkSoft, 0.35), { w: 5, smooth: false });
    for (let i = 0; i < 4; i++) pn.line([[x0 + w * 0.68, peak + 60 + i * 34], [x0 + w * 0.8, peak + 58 + i * 34]], 2.5, INK.inkSoft);
    for (let i = 0; i < 4; i++) {   // chimney smoke
      const q = fr(t * 0.18 + i / 4), cx = x0 + w * 0.74 + Math.sin(q * 5 + i) * 26 + q * 90, cy = peak + 10 - q * 330;
      pn.circ(cx, cy, 26 + q * 50, mix(INK.paperLight, INK.paperDark, 0.3), { w: 3, line: INK.inkSoft, op: 1 - q * 0.6 });
    }
    pn.shape(rect(x0, top, x1, gy), LOG(), { w: 6, smooth: false });
    for (let i = 1; i < 10; i++) { const y = top + i * 42; pn.line([[x0 + 4, y], [x1 - 4, y + (i % 2 ? 2 : -2)]], 3.5, WOOD_D()); pn.circ(x0 + 6, y - 20, 14, WOOD(), { w: 3 }); }
    pn.shape([[x0 - 36, top + 10], [x1 + 36, top + 10], [x1 - w * 0.08, peak], [x0 + w * 0.08, peak]], mix(INK.stain, INK.inkSoft, 0.3), { w: 6, smooth: false });
    for (let i = 1; i < 6; i++) { const y = lerp(peak, top + 10, i / 6); pn.line([[lerp(x0 + w * 0.08, x0 - 36, i / 6), y], [lerp(x1 - w * 0.08, x1 + 36, i / 6), y]], 3, INK.ink, { op: 0.6 }); }
    // door + window + porch step
    const dx = x0 + w * 0.2;
    pn.shape(rect(dx, gy - 250, dx + 120, gy), WOOD_D(), { w: 5, smooth: false });
    pn.line([[dx + 60, gy - 248], [dx + 60, gy - 2]], 3, INK.ink); pn.dot(dx + 98, gy - 120, 7, 7, INK.gold);
    const wx = x0 + w * 0.62, wy = gy - 300;
    pn.shape(rect(wx, wy, wx + 110, wy + 100), mix(INK.paperLight, INK.gold, 0.25), { w: 5, smooth: false });
    pn.line([[wx + 55, wy], [wx + 55, wy + 100]], 4); pn.line([[wx, wy + 50], [wx + 110, wy + 50]], 4);
    pn.shape(rect(dx - 30, gy - 22, dx + 150, gy + 6), WOOD(), { w: 4, smooth: false });
  }
  // split-rail fence (zig-zag), returns railY(x) for flakes that stick to the top rail
  function fence(pn, x0, x1, gy, k = 1) {
    const step = 170 * k, posts = [];
    for (let x = x0; x <= x1 + step; x += step) posts.push(x);
    const hs = [46, 96, 146].map(v => v * k);
    posts.forEach((x, i) => { if (i) hs.forEach((h, j) => { const a = posts[i - 1], z = (i + j) % 2 ? 6 : -6; pn.shape([[a, gy - h - 9 + z], [x, gy - h - 9 - z], [x, gy - h + 9 - z], [a, gy - h + 9 + z]], WOOD(), { w: 4, smooth: false }); }); });
    posts.forEach(x => pn.shape(rect(x - 11 * k, gy - 176 * k, x + 11 * k, gy + 4), WOOD_D(), { w: 4, smooth: false }));
    return x => (x >= x0 && x <= x1) ? gy - hs[2] - 10 : null;
  }
  // soap kettle on a pole tripod over a fire; returns the rim centre
  function kettle(pn, cx, gy, s, t, lt, o = {}) {
    const apex = [cx, gy - 520 * s];
    [[-230, 16], [210, 22], [30, 40]].forEach(([dx, dy]) => pn.line([apex, [cx + dx * s, gy + dy * s]], 13 * s, WOOD_D()));
    pn.line([[apex[0] - 20 * s, apex[1] + 6], [apex[0] + 20 * s, apex[1] - 6]], 8 * s, INK.ink);
    // fire: logs + flames
    pn.line([[cx - 130 * s, gy + 8], [cx + 120 * s, gy - 18 * s]], 26 * s, WOOD_D());
    pn.line([[cx - 110 * s, gy - 20 * s], [cx + 140 * s, gy + 6]], 24 * s, WOOD());
    for (let i = 0; i < 5; i++) {
      const fx = cx + (i - 2) * 40 * s, hgt = (80 + 40 * Math.sin(t * 9 + i * 1.7) + 20 * hn(i, 3)) * s;
      const fl = [[fx - 26 * s, gy - 14 * s], [fx - 14 * s, gy - 14 * s - hgt * 0.6], [fx + Math.sin(t * 13 + i) * 10 * s, gy - 14 * s - hgt], [fx + 14 * s, gy - 14 * s - hgt * 0.6], [fx + 26 * s, gy - 14 * s]];
      pn.fill(fl, i % 2 ? INK.gold : mix(INK.red, INK.gold, 0.4), { smooth: true });
    }
    // chain + bail
    const rimY = gy - 250 * s, botY = gy - 90 * s, R = 130 * s;
    pn.line([apex, [cx, rimY - 120 * s]], 5, INK.ink);
    pn.line([[cx - R, rimY], [cx - R * 0.6, rimY - 110 * s], [cx, rimY - 120 * s], [cx + R * 0.6, rimY - 110 * s], [cx + R, rimY]], 6, INK.ink);
    // pot body
    const body = [[cx - R, rimY], [cx - R * 1.08, rimY + 60 * s], [cx - R * 0.9, botY - 10 * s], [cx - R * 0.5, botY + 16 * s], [cx + R * 0.5, botY + 16 * s], [cx + R * 0.9, botY - 10 * s], [cx + R * 1.08, rimY + 60 * s], [cx + R, rimY]];
    pn.shape(body, IRON(), { w: 6, smooth: true });
    pn.line([[cx - R * 0.7, rimY + 40 * s], [cx - R * 0.8, botY - 30 * s]], 6 * s, INK.inkSoft, { op: 0.8 });
    [-1, 1].forEach(sd => pn.line([[cx + sd * R * 0.5, botY + 10 * s], [cx + sd * R * 0.6, botY + 46 * s]], 9 * s, INK.ink));
    // rim + soap surface + bubbles
    pn.circ(cx, rimY, R, INK.ink, { ry: 30 * s, w: 0 });
    pn.circ(cx, rimY + 2, R * 0.86, mix(INK.paperLight, INK.gold, 0.3), { ry: 22 * s, w: 3 });
    for (let i = 0; i < 4; i++) { const q = fr(t * 0.8 + i * 0.27), bx = cx + (hn(i, 9) - 0.5) * R * 1.3; pn.circ(bx, rimY + 2, (6 + q * 10) * s, null, { w: 2.5, line: INK.inkSoft }); }
    // steam
    for (let i = 0; i < 3; i++) { const q = fr(t * 0.35 + i / 3), x = cx + (i - 1) * 40 * s + Math.sin(q * 6 + i) * 24 * s; pn.line([[x, rimY - 20 * s - q * 200 * s], [x + 16 * s, rimY - 60 * s - q * 200 * s], [x - 6 * s, rimY - 100 * s - q * 200 * s]], 5, INK.paperLight, { op: 0.9 * (1 - q) }); }
    return { rim: [cx, rimY], R };
  }
  function woodpile(pn, x, y, s) {
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) {
      const cx = x + (i + r * 0.5) * 92 * s, cy = y - r * 80 * s;
      pn.circ(cx, cy, 44 * s, WOOD(), { w: 5 });
      pn.circ(cx, cy, 24 * s, null, { w: 2.5, line: WOOD_D() });
      pn.dot(cx, cy, 5 * s, 5 * s, WOOD_D());
    }
  }
  function bucket(pn, x, y, s) {
    pn.shape([[x - 70 * s, y - 140 * s], [x + 70 * s, y - 140 * s], [x + 56 * s, y], [x - 56 * s, y]], WOOD(), { w: 5, smooth: false });
    [0.25, 0.75].forEach(q => pn.line([[x - lerp(70, 56, q) * s, y - 140 * s * (1 - q)], [x + lerp(70, 56, q) * s, y - 140 * s * (1 - q)]], 7 * s, IRON()));
    pn.circ(x, y - 140 * s, 70 * s, mix(INK.blue, INK.paperLight, 0.5), { ry: 16 * s, w: 4 });
    pn.line([[x - 70 * s, y - 140 * s], [x, y - 230 * s], [x + 70 * s, y - 140 * s]], 4, INK.ink);
  }
  function grass(pn, W, H, y0, t, seed, n = 26) {
    for (let i = 0; i < n; i++) {
      const x = (i + hn(i, seed) * 0.8) / n * (W + 60) - 30, h = (110 + hn(i, seed + 1) * 150), y = H + 20 - hn(i, seed + 2) * (H - y0) * 0.25;
      const sw = Math.sin(t * 1.4 + i) * 10;
      for (let j = -1; j <= 1; j++) pn.fill([[x + j * 18 - 9, y], [x + j * 30 + sw + j * 20, y - h * (1 - Math.abs(j) * 0.25)], [x + j * 18 + 9, y]], j ? GRASS() : GRASS_D(), { smooth: true });
    }
  }
  // thought bubble with a sheep or a deer
  function bubble(pn, B, from, p, t) {
    const cx = B.x, cy = B.y, r = (B.r ?? 150) * p;
    if (r < 4) return;
    const lumps = []; for (let i = 0; i < 18; i++) { const q = i / 18 * Math.PI * 2, k = 1 + 0.08 * Math.sin(i * 2.7 + 1); lumps.push([cx + Math.cos(q) * r * 1.25 * k, cy + Math.sin(q) * r * k]); }
    pn.shape(lumps, INK.paperLight, { w: 6, smooth: true });
    [[0.35, 22], [0.18, 14]].forEach(([q, rr]) => pn.circ(lerp(from[0], cx, q), lerp(from[1], cy + r, q), rr * p, INK.paperLight, { w: 4 }));
    const s = r / 150, bob = Math.sin(t * 2.4) * 4 * s, y = cy + 40 * s + bob;
    if (B.kind === 'deer') {
      pn.line([[cx - 60 * s, y], [cx - 64 * s, y + 70 * s]], 9 * s); pn.line([[cx + 54 * s, y], [cx + 60 * s, y + 70 * s]], 9 * s);
      pn.shape(inkEllipsePts(cx, y - 10 * s, 86 * s, 40 * s, 77, 10), mix(INK.stain, INK.red, 0.15), { w: 5, smooth: true });
      pn.line([[cx + 60 * s, y - 20 * s], [cx + 92 * s, y - 80 * s]], 22 * s, mix(INK.stain, INK.red, 0.15));
      pn.shape(inkEllipsePts(cx + 104 * s, y - 92 * s, 30 * s, 20 * s, 78, 8, 0.3), mix(INK.stain, INK.red, 0.15), { w: 4, smooth: true });
      pn.line([[cx + 96 * s, y - 108 * s], [cx + 84 * s, y - 160 * s], [cx + 66 * s, y - 180 * s]], 5); pn.line([[cx + 86 * s, y - 150 * s], [cx + 110 * s, y - 170 * s]], 5);
      pn.line([[cx + 108 * s, y - 108 * s], [cx + 120 * s, y - 158 * s], [cx + 140 * s, y - 172 * s]], 5);
      pn.dot(cx + 112 * s, y - 96 * s, 4 * s + 1, 4 * s + 1);
    } else {
      pn.line([[cx - 50 * s, y + 10 * s], [cx - 52 * s, y + 70 * s]], 9 * s); pn.line([[cx + 44 * s, y + 10 * s], [cx + 46 * s, y + 70 * s]], 9 * s);
      for (let i = 0; i < 7; i++) { const q = i / 6; pn.circ(cx - 70 * s + q * 140 * s, y - 14 * s - Math.sin(q * Math.PI) * 30 * s + (i % 2) * 10 * s, 34 * s, INK.paperLight, { w: 4 }); }
      pn.fill(inkEllipsePts(cx, y - 6 * s, 70 * s, 34 * s, 79, 10), INK.paperLight, { smooth: true });
      pn.shape(inkEllipsePts(cx + 92 * s, y - 34 * s, 28 * s, 22 * s, 80, 8, 0.4), INK.ink, { w: 0, smooth: true });
      pn.dot(cx + 100 * s, y - 40 * s, 4 * s + 1, 4 * s + 1, INK.paperLight);
    }
    if (B.text) {}   // words go in labels (one place for on-screen text)
  }

  // ================================================================== km_yard
  SH.km_yard = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 3301;
      const mode = P.mode || 'rain', gy = (P.gy ?? 0.6) * H;
      const back = pen(el(root, 'g'), sd), mid = pen(el(root, 'g'), sd + 100);
      const castG = el(root, 'g');
      const ladyR = P.lady === false ? null : lady(castG, sd + 7);
      const men = P.men && window.BBL ? window.BBL.cast(el(root, 'g'), [
        { who: 'farmer', beard: 'black', x: P.men.x ?? 0.3, y: P.gy ?? 0.6, scale: P.men.s ?? 1.05, pose: 'point', dir: 40, face: 'right', emotion: 'neutral', seq: P.men.seq1 || [] },
        { who: 'farmer2', beard: 'grey', x: (P.men.x ?? 0.3) + (P.men.gap ?? 0.4), y: P.gy ?? 0.6, scale: P.men.s ?? 1.05, pose: 'idle', face: 'left', emotion: 'neutral', seq: P.men.seq2 || [] },
      ], W, H, sd + 50) : null;
      const kas = kasifOf(root, P.kasif, W, H, sd + 9);
      const fall = pen(el(root, 'g'), sd + 200), fg = pen(el(root, 'g'), sd + 300), bub = pen(el(root, 'g'), sd + 400);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const K = Object.assign({ x: 0.7, s: 1 }, P.kettle || {});
      const L = Object.assign({ x: 0.44, s: 0.95, face: 'right' }, P.lady || {});
      let railY = null;
      const F = P.flakes === false ? null : Object.assign({ n: 44, at: mode === 'rain' ? -2.5 : 0.4, span: mode === 'rain' ? 6 : 2.6, ymin: 0.63, ymax: 0.97, rail: 0.18 }, P.flakes || {});
      const flk = F ? flakeSet(Object.assign({}, F, { railY: x => railY ? railY(x) : null }), W, H, sd % 97 + 11) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); mid.begin(t); fall.begin(t); fg.begin(t); bub.begin(t);
          const hit = punch(lt, atOr(cues, 'hit', null));
          // far: cabin + fence
          if (P.house !== false) cabin(back, 40, 430, gy - 6, t);
          railY = fence(back, P.house !== false ? 470 : -40, W + 40, gy - 30, 0.95);
          // kettle
          const kx = K.x * W;
          const kt = mode === 'taste' || P.kettle === false ? null : kettle(mid, kx, gy + 10, K.s, t, lt);
          // Mrs. Crouch
          if (ladyR && mode !== 'taste') {
            const up = atOr(cues, L.up, null), looking = up != null && lt >= up;
            const face = faceOf(L.face, 1);
            const stir = Math.sin(t * 3.2);
            const pose = looking ? 'shock' : 'point';
            const r = ladyR.update(t, L.x * W, gy, L.s, pose, { face, dir: looking ? 0 : -34 + stir * 9, since: looking ? lt - up : 1, emotion: looking ? 'surprised' : 'neutral' });
            if (kt && !looking && r.hands && r.hands.length) {   // the soap paddle from her front hand into the pot
              const hd = r.hands.reduce((a, b) => (b[0] - a[0]) * face > 0 ? b : a);
              const tip = [kt.rim[0] - face * kt.R * 0.25 + stir * 26, kt.rim[1] + 40 * K.s];
              const dx = tip[0] - hd[0], dy = tip[1] - hd[1], ln = Math.hypot(dx, dy) || 1;
              mid.line([[hd[0] - dx / ln * 60, hd[1] - dy / ln * 60], tip], 12, WOOD_D());
            }
          }
          if (men) {
            const heads = men.update(lt, t, cues) || [];
            const h1 = heads[0];
            if (h1 && h1.head) {   // the first farmer holds up a bitten flake in front of his face, chewing
              const ms = P.men.s ?? 1.05, ch = Math.sin(t * 7) * 3;
              const hx = h1.head[0] + 118 * ms, hy = h1.head[1] + 40 * ms + ch;
              meat(fg, hx, hy, 34, -0.3, sd + 61);
              fg.circ(hx + 30, hy - 18, 12, mix(INK.paperLight, INK.paperDark, 0.2), { w: 0 });   // the bite
              for (let j = 0; j < 3; j++) fg.line([[h1.head[0] + 50 * ms, h1.head[1] + (30 + j * 12) * ms], [h1.head[0] + (62 + 6 * Math.sin(t * 7 + j)) * ms, h1.head[1] + (30 + j * 12) * ms]], 3, INK.ink, { op: 0.6 });
            }
            (P.bubbles || []).forEach((B, i) => {
              const a = atOr(cues, B.at, 0.4 + i * 1.2), p = spring(lt, a, 0.5);
              const hh = heads[B.from ?? i];
              if (lt >= a && hh && hh.head) bubble(bub, { x: B.x * W, y: B.y * H, r: B.r, kind: B.kind }, [hh.head[0], hh.head[1] - 80], p, t);
            });
          }
          // the big chunk
          if (P.chunk) {
            const ca = atOr(cues, P.chunk.at, dur * 0.4), cx = (P.chunk.x ?? 0.5) * W, cyL = (P.chunk.y ?? 0.8) * H;
            const fd = P.chunk.fall ?? 0.7, cr = P.chunk.r ?? 64;
            const q = clamp01((lt - (ca - fd)) / fd);
            if (lt >= ca - fd) {
              if (lt < ca) meat(fall, cx + (1 - q) * 60, lerp(-120, cyL, fd > 1 ? q : q * q), cr, lt * (fd > 1 ? 1.6 : 2), sd + 71);
              else {
                meat(fall, cx, cyL, cr * 1.12, 0.3, sd + 71, { flat: true });
                const d = lt - ca;
                if (d < 0.5) for (let j = 0; j < 6; j++) { const a = -Math.PI * (0.08 + j * 0.17); fall.line([[cx + Math.cos(a) * 80, cyL + Math.sin(a) * 40], [cx + Math.cos(a) * (120 + d * 300), cyL + Math.sin(a) * (60 + d * 200)]], 5, INK.ink, { op: 1 - d * 2 }); }
              }
            }
          }
          // foreground: woodpile, bucket, big grass (bottom of the frame)
          woodpile(fg, 30, H - 120, 1.25);
          bucket(fg, W - 150, H - 150, 1.15);
          if (flk) flk.draw(fall, lt, atOr(cues, F.at, F.at ?? 0), gy);
          grass(fg, W, H, gy, t, sd % 13 + 1);
          if (kas) kas.update(lt, t, cues);
          back.end(); mid.end(); fall.end(); fg.end(); bub.end();
          lbs.update(lt, t, cues);
          root.setAttribute('transform', hit ? `translate(${W / 2} ${H / 2}) scale(${f1((1 + 0.04 * hit) * 1000) / 1000}) translate(${-W / 2} ${-H / 2})` : '');
        },
      };
    },
  };

  // ------------------------------------------------------------------ turkey vulture seen from below, head toward +x
  // (local units, half-span ~380); o: {flap: 0..1 phase, heave: 0..1 (head jerks down and forward)}
  function vulture(pn, x, y, s, ang, o = {}) {
    const c = Math.cos(ang), sn = Math.sin(ang), t = pn.t;
    const T = p => [x + (p[0] * c - p[1] * sn) * s, y + (p[0] * sn + p[1] * c) * s], TT = ps => ps.map(T);
    const fl = 0.78 + 0.22 * Math.cos((o.flap ?? 0) * Math.PI * 2), spr = o.spread ?? 1;
    [-1, 1].forEach(sd => {
      const sp = 380 * fl * (o.span ?? 1), k = v => [v[0], sd * v[1] * fl];
      // wing: dark coverts + pale flight feathers + fingered tip
      const lead = [[30, 22], [10, 140], [-20, 260], [-40, sp - 30]], trail = [[-60, sp - 50], [-90, 250], [-90, 130], [-70, 26]];
      pn.shape(TT(lead.concat(trail).map(k)), BIRD_L(), { w: 5, smooth: true });
      pn.fill(TT([[30, 22], [10, 140], [-20, 260], [-44, 300], [-50, 240], [-48, 120], [-40, 26]].map(k)), BIRD(), { smooth: true });
      for (let i = 0; i < 6; i++) { const b = [-30 - i * 9, sp - 50 - i * 6], e = [-18 - i * 17 * spr + Math.sin(t * 3 + i) * 3, sp + 60 * spr - i * 12]; pn.line(TT([k(b), k(e)]), 13, BIRD()); }
    });
    pn.shape(TT([[-60, -30], [-170, -44], [-180, 0], [-170, 44], [-60, 30]]), BIRD(), { w: 5, smooth: true });
    pn.shape(TT(inkEllipsePts(0, 0, 90, 36, 61, 10)), BIRD(), { w: 5, smooth: true });
    const hv = o.heave ?? 0, hx = 112 + hv * 22, hy = hv * 10;
    pn.line(TT([[70, 0], [hx - 10, hy]]), 26, BIRD());
    pn.circ(...T([hx, hy]), 28 * s, INK.red, { w: 4 });
    pn.shape(TT([[hx + 16, hy - 8], [hx + 44, hy + 2 + hv * 6], [hx + 34, hy + 14 + hv * 8], [hx + 14, hy + 10]]), INK.paperLight, { w: 3.5, smooth: false });
    pn.dot(...T([hx + 4, hy - 8]), 4 * s + 1, 4 * s + 1, INK.ink);
    return { beak: T([hx + 40, hy + 8]) };
  }
  function treeline(pn, W, H, y0, t, seed) {
    for (let i = 0; i < 6; i++) {
      const side = i % 2 ? 1 : -1, x = side < 0 ? 40 + i * 40 : W - 40 - (i - 1) * 40, y = y0 + 60 + hn(i, seed) * 120, r = 170 + hn(i, seed + 1) * 70;
      const sw = Math.sin(t * 0.9 + i) * 6;
      const lumps = []; for (let j = 0; j < 14; j++) { const a = j / 14 * Math.PI * 2, k = 1 + 0.12 * Math.sin(j * 2.3 + i); lumps.push([x + sw + Math.cos(a) * r * k, y + Math.sin(a) * r * 0.9 * k]); }
      pn.shape(lumps, i < 2 ? GRASS_D() : GRASS(), { w: 5, smooth: true });
      for (let j = 0; j < 4; j++) pn.line([[x - r * 0.4 + j * r * 0.25, y - r * 0.2], [x - r * 0.3 + j * r * 0.25, y + r * 0.1]], 3, INK.ink, { op: 0.5 });
    }
  }

  // ================================================================== km_sky
  SH.km_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 3501;
      const mode = P.mode || 'circle';
      const birds = pen(el(root, 'g'), sd), yard = pen(el(root, 'g'), sd + 50), fg = pen(el(root, 'g'), sd + 200);
      const castG = el(root, 'g');
      const ladyR = mode === 'fall' && P.lady !== false ? lady(castG, sd + 7) : null;
      const front = pen(el(root, 'g'), sd + 250), fall = pen(el(root, 'g'), sd + 100);
      const kas = kasifOf(root, P.kasif, W, H, sd + 9);
      const fg2 = pen(el(root, 'g'), sd + 300);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const RG = Object.assign({ x: 0.5, y: 0.34, rx: 0.34, ry: 0.1, s: 0.3 }, P.ring || {});
      const BG = Object.assign({ x: 0.5, y: 0.38, s: 1.6 }, P.big || {});
      const Y = P.yard ? Object.assign({ y: 0.55, kettle: 0.82, ks: 0.7, n: 46 }, P.yard) : null;
      const nB = P.birds ?? 5;
      const F = P.flakes === false ? null : Object.assign(mode === 'fall' ? { n: 34, at: -0.6, span: 3.6, ymin: 0.2, ymax: 1.0, toward: true }
        : { n: 0 }, P.flakes || {});
      const flk = F && F.n ? flakeSet(F, W, H, sd % 89 + 5) : null;
      // meat already lying in the yard (fixed spots, bigger toward the viewer)
      const lying = Y ? Array.from({ length: Y.n }, (_, i) => { const y = lerp(Y.y * H + 30, H - 40, Math.pow(hn(i, 21), 0.9)); return [hn(i, 22) * W, y, (8 + 14 * hn(i, 23)) * (0.6 + 1.2 * (y - Y.y * H) / (H - Y.y * H))]; }) : [];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          birds.begin(t); yard.begin(t); fall.begin(t); fg.begin(t); fg2.begin(t); front.begin(t);
          const hit = punch(lt, atOr(cues, 'hit', null));
          if (P.sun) {   // a bright sun in the clear sky (right half; the top-left belongs to the kicker)
            const sx = P.sun[0] * W, sy = P.sun[1] * H, sr = P.sun[2] ?? 90;
            for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + lt * 0.15; birds.line([[sx + Math.cos(a) * sr * 1.25, sy + Math.sin(a) * sr * 1.25], [sx + Math.cos(a) * sr * 1.6, sy + Math.sin(a) * sr * 1.6]], 7, INK.gold); }
            birds.circ(sx, sy, sr, mix(INK.gold, INK.paperLight, 0.3), { w: 6, line: INK.gold });
          }
          if (mode === 'circle' || mode === 'vomit') {
            for (let i = 0; i < nB; i++) {   // the ring, drifting slowly round; each bird heads along the ellipse
              const a = lt * 0.32 + i / nB * Math.PI * 2;
              const x = RG.x * W + Math.cos(a) * RG.rx * W, y = RG.y * H + Math.sin(a) * RG.ry * H;
              const s = RG.s * (1 + 0.25 * Math.sin(a));
              vulture(birds, x, y, s, Math.atan2(Math.cos(a) * RG.ry * H * 0.6, -Math.sin(a) * RG.rx * W), { flap: fr(t * 0.15 + i * 0.3), span: RG.span ?? 1, spread: RG.spread ?? 1 });
            }
          }
          let v = null, th = 0;
          if (mode === 'vomit') {
            th = atOr(cues, 'throw', dur * 0.45);
            const fly = atOr(cues, 'fly', th + 0.8), up = progIO(lt, fly, 1.4);
            const bx = BG.x * W + (lt - dur / 2) * (BG.drift ?? 40) + up * (BG.climbX ?? 120), by = BG.y * H + Math.sin(t * 1.1) * 14 - up * (BG.climb ?? 200);
            const hv = lt >= th ? Math.max(0, Math.sin(Math.min(1, (lt - th) / 0.5) * Math.PI)) : 0;
            v = vulture(fg, bx, by, BG.s * (1 - up * 0.15), -0.08 - up * 0.25, { flap: fr(t * (0.35 + 1.4 * up) + up * 2), heave: hv });
          }
          // the yard on the ground: back fence, steaming kettle, meat lying everywhere
          if (Y) {
            const gy = Y.y * H;
            fence(yard, -40, W + 40, gy + 4, 0.8);
            if (Y.kettle != null) kettle(yard, Y.kettle * W, gy + 60, Y.ks, t, lt);
            lying.forEach(([x, y, r], i) => meat(yard, x, y, r, i, sd + 200 + i, { flat: true }));
          }
          if (v && lt >= th - 0.05) {   // the lunch comes out and rains down onto the yard
            const floor = Y ? Y.y * H + 40 : H + 100;
            const nS = BG.stream ?? 22, gap = BG.gap ?? 0.08, X0 = (BG.xmin ?? 0) * W, X1 = (BG.xmax ?? 1) * W;
            for (let i = 0; i < nS; i++) {
              const ts = th + i * gap, d = lt - ts;
              if (d < 0) continue;
              const x0 = Math.max(X0, Math.min(X1, v.beak[0] + (hn(i, 3) - 0.3) * 140 * d + Math.sin(d * 4 + i) * 16));
              const land = floor + hn(i, 5) * 260, yy = v.beak[1] + 60 * d + 520 * d * d;
              const rr = (12 + hn(i, 4) * 16) * (1 + Math.min(d, 1.2) * 0.4);
              if (yy < land) meat(fall, x0, yy, rr, d * 3 + i, sd + 80 + i);
              else meat(fg, x0, land, rr * 1.2, i, sd + 80 + i, { flat: true });
            }
          }
          if (ladyR) {   // Mrs. Crouch waist-up behind the front fence, looking up (recoils in shock on "hit")
            const ha = atOr(cues, 'hit', null), rec = ha != null && lt >= ha;
            const LY = Object.assign({ x: 0.5, y: 0.82, s: 1.8 }, typeof P.lady === 'object' ? P.lady : {});
            ladyR.update(t, LY.x * W, LY.y * H, LY.s, rec ? 'shock' : 'idle', { face: 1, since: rec ? lt - ha : 1, emotion: rec ? 'surprised' : 'neutral' });
          }
          if (P.front) {   // a near fence across the frame (hides the legs: waist-up shot) + meat on the rails
            const fy = P.front * H;
            const ry = fence(front, -60, W + 60, fy, 1.35);
            for (let i = 0; i < 7; i++) { const x = 60 + i * 160 + hn(i, 31) * 40; meat(front, x, ry(x) + 6, 22 + hn(i, 32) * 10, i, sd + 300 + i, { flat: true }); }
          }
          if (mode === 'fall' && flk) flk.draw(fall, lt, atOr(cues, F.at, F.at), 0);
          if (Y || P.front) grass(fg2, W, H, (P.front || Y.y) * H, t, sd % 13 + 1, 22);
          else treeline(fg2, W, H, (P.tree_y ?? 0.8) * H, t, sd % 17 + 2);
          if (kas) kas.update(lt, t, cues);
          birds.end(); yard.end(); fall.end(); fg.end(); fg2.end(); front.end();
          lbs.update(lt, t, cues);
          root.setAttribute('transform', hit ? `translate(${W / 2} ${H / 2}) scale(${f1((1 + 0.04 * hit) * 1000) / 1000}) translate(${-W / 2} ${-H / 2})` : '');
        },
      };
    },
  };

  // ================================================================== km_scope
  SH.km_scope = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const root = el(ctx.svg, 'g'), sd = seed * 1000 + 3701;
      const back = pen(el(root, 'g'), sd);
      const sci = window.LH ? window.LH.person(el(root, 'g'), 3, { kind: 'sweater', col: mix(INK.ink, INK.blue, 0.35), hair: 'white', glasses: true }) : null;
      const desk = pen(el(root, 'g'), sd + 100), fg = pen(el(root, 'g'), sd + 200);
      const jarT = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 52, 'text-anchor': 'middle', fill: INK.ink });
      jarT.textContent = P.jar || 'SAMPLE';
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      const gy = 0.6 * H, top = 1000;   // table top (front edge)
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          back.begin(t); desk.begin(t); fg.begin(t);
          const fd = P.found === false ? 1e9 : atOr(cues, 'found', dur * 0.6), jolt = lt >= fd ? spring(lt, fd, 0.45) : 0;
          // back wall: shelves with jars + a window with light
          [520, 760].forEach((y, r) => {
            back.shape(rect(30, y, 560, y + 22), WOOD(), { w: 4, smooth: false });
            for (let i = 0; i < 5; i++) { const x = 70 + i * 100, h = 90 + hn(i, r) * 60; back.shape(rect(x - 30, y - h, x + 30, y), mix(INK.paperLight, [INK.green, INK.blue, INK.stain][(i + r) % 3], 0.3), { w: 4, smooth: false }); back.shape(rect(x - 20, y - h - 22, x + 20, y - h), WOOD_D(), { w: 3, smooth: false }); }
          });
          back.shape(rect(700, 380, 1000, 760), mix(INK.paperLight, INK.gold, 0.2), { w: 7, smooth: false });
          back.line([[850, 380], [850, 760]], 6); back.line([[700, 570], [1000, 570]], 6);
          for (let i = 0; i < 3; i++) back.line([[730 + i * 80, 400 + Math.sin(t + i) * 4], [700 + i * 80, 740]], 3, INK.gold, { op: 0.5 });
          // the scientist leans to the eyepiece (stands behind the table)
          const mx = 0.66 * W, eye = [mx - 110, top - 520];
          if (sci) {
            const lean = lerp(lerp(4, 22, progIO(lt, 0.1, 0.9)), 2, jolt) + Math.sin(t * 1.3) * 1.5;
            sci.update(t, 0.34 * W - jolt * 30, gy + 60, 1.25, { face: 1, lean, brow: jolt, mouth: jolt * 0.9, look: [6, 2],
              armR: jolt > 0.3 ? [0.34 * W + 120, top - 420] : [mx - 20, top - 230], armL: [mx - 150, top - 120] });
          }
          // table
          desk.shape([[-40, top - 70], [W + 40, top - 70], [W + 40, top + 10], [-40, top + 10]], WOOD(), { w: 6, smooth: false });
          desk.shape(rect(-40, top + 10, W + 40, H + 40), WOOD_D(), { w: 6, smooth: false });
          for (let i = 0; i < 5; i++) desk.line([[-20, top + 120 + i * 150], [W + 20, top + 126 + i * 150]], 3, INK.ink, { op: 0.45 });
          // microscope (brass): horseshoe foot, pillar, stage, tilted tube, mirror, knob
          const foot = top - 70;
          desk.shape([[mx - 150, foot], [mx - 110, foot - 40], [mx + 110, foot - 40], [mx + 150, foot]], BRASS_D(), { w: 5, smooth: false });
          desk.shape(rect(mx - 22, foot - 260, mx + 22, foot - 40), BRASS(), { w: 5, smooth: false });
          desk.shape(rect(mx - 130, foot - 250, mx + 110, foot - 220), BRASS_D(), { w: 5, smooth: false });
          desk.shape(rect(mx - 70, foot - 262, mx + 50, foot - 250), mix(INK.paperLight, INK.blue, 0.2), { w: 3, smooth: false });
          desk.circ(mx - 10, foot - 256, 12, MEAT(), { ry: 5, w: 2 });
          desk.circ(mx - 10, foot - 150, 46, mix(INK.paperLight, INK.gold, 0.4), { ry: 18, w: 4 });
          const tb = [[mx - 40, foot - 290], [mx + 10, foot - 300], [eye[0] + 60, eye[1] + 40], [eye[0] + 20, eye[1] + 60]];
          desk.shape(tb, BRASS(), { w: 6, smooth: false });
          desk.shape([[eye[0] + 10, eye[1] + 70], [eye[0] - 14, eye[1] + 30], [eye[0] + 40, eye[1] - 4], [eye[0] + 70, eye[1] + 34]], BRASS_D(), { w: 5, smooth: false });
          desk.circ(mx + 40, foot - 330, 28, BRASS_D(), { w: 5 });
          desk.line([[mx + 40 + Math.cos(t * 2) * 18, foot - 330 + Math.sin(t * 2) * 18], [mx + 40, foot - 330]], 4, INK.paperLight);
          // oil lamp
          const lx = 0.9 * W;
          desk.shape([[lx - 60, foot], [lx + 60, foot], [lx + 40, foot - 70], [lx - 40, foot - 70]], BRASS(), { w: 5, smooth: false });
          desk.shape([[lx - 36, foot - 70], [lx + 36, foot - 70], [lx + 50, foot - 170], [lx + 24, foot - 230], [lx - 24, foot - 230], [lx - 50, foot - 170]], mix(INK.paperLight, INK.gold, 0.15), { w: 5, smooth: true, op: 0.9 });
          const fh = 60 + Math.sin(t * 11) * 8;
          desk.fill([[lx - 12, foot - 100], [lx, foot - 100 - fh], [lx + 12, foot - 100]], INK.gold, { smooth: true });
          // foreground: open notebook, a jar of red sample, slides
          fg.shape([[60, 1420], [500, 1390], [520, 1700], [80, 1740]], INK.paperLight, { w: 6, smooth: false });
          fg.line([[290, 1404], [300, 1720]], 4);
          for (let i = 0; i < 6; i++) { fg.line([[110, 1450 + i * 40], [260 - (i % 2) * 40, 1446 + i * 40]], 3, INK.inkSoft); fg.line([[330, 1440 + i * 40], [480 - (i % 3) * 30, 1436 + i * 40]], 3, INK.inkSoft); }
          const jx = 0.74 * W, jy = 1700;
          fg.shape([[jx - 150, jy], [jx - 160, jy - 320], [jx + 160, jy - 320], [jx + 150, jy]], mix(INK.paperLight, INK.blue, 0.18), { w: 6, smooth: false, op: 0.92 });
          for (let i = 0; i < 6; i++) meat(fg, jx - 90 + (i % 3) * 90, jy - 60 - Math.floor(i / 3) * 70 + Math.sin(t * 1.5 + i) * 4, 34, i, sd + 90 + i);
          fg.shape(rect(jx - 170, jy - 370, jx + 170, jy - 320), WOOD_D(), { w: 5, smooth: false });
          fg.shape(rect(jx - 110, jy - 240, jx + 110, jy - 170), INK.paperLight, { w: 4, smooth: false });
          jarT.setAttribute('x', f1(jx)); jarT.setAttribute('y', f1(jy - 188));
          for (let i = 0; i < 3; i++) fg.shape(rect(560 + i * 20, 1760 - i * 60, 760 + i * 20, 1800 - i * 60), mix(INK.paperLight, INK.blue, 0.3), { w: 3, smooth: false, op: 0.9 });
          back.end(); desk.end(); fg.end();
          lbs.update(lt, t, cues);
        },
      };
    },
  };

  // ================================================================== km_lens
  SH.km_lens = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, seed } = ctx;
      const V = P.view || { focus: [W / 2, H / 2], zoom: 1 };
      const z = V.zoom || 1, A = [W / 2, (300 + 1150) / 2];
      const root = el(ctx.svg, 'g', { transform: `translate(${f1(V.focus[0])} ${f1(V.focus[1])}) scale(${f1(1000 / z) / 1000}) translate(${f1(-A[0])} ${f1(-A[1])})` });
      const sd = seed * 1000 + 3901;
      const C = [W / 2, 720], R = 440;
      const cid = 'kmclip' + seed;
      const cp = el(ctx.defs || ctx.svg, 'clipPath', { id: cid });
      el(cp, 'circle', { cx: C[0], cy: C[1], r: R });
      const dark = pen(el(root, 'g'), sd);
      const inner = el(root, 'g', { 'clip-path': `url(#${cid})` });
      const tis = pen(el(inner, 'g'), sd + 100);
      const ring = pen(el(root, 'g'), sd + 200);
      const lbs = labelsOf(root, P.labels, W, H, sd + 500);
      // tissue layout (fixed): lung sacs in the upper left, cartilage cells in the lower right
      const sacs = [], cells = [];
      for (let i = 0; i < 46; i++) { const x = C[0] - R - 80 + hn(i, 1) * (R * 2 + 160), y = C[1] - R - 80 + hn(i, 2) * (R * 2 + 160); if ((x - C[0]) + (y - C[1]) * 0.9 < 40) sacs.push([x, y, 60 + hn(i, 3) * 45]); }
      for (let i = 0; i < 40; i++) { const x = C[0] - R + hn(i, 5) * R * 2.2, y = C[1] - R + hn(i, 6) * R * 2.2; if ((x - C[0]) + (y - C[1]) * 0.9 > 90) cells.push([x, y, 26 + hn(i, 7) * 16, hn(i, 8) * 3]); }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          dark.begin(t); tis.begin(t); ring.begin(t);
          const la = atOr(cues, 'lung', dur * 0.3), ca = atOr(cues, 'cart', dur * 0.65);
          // the dark inside of the tube around the bright field
          dark.fill(rect(-80, -80, W + 80, H + 80), mix(INK.ink, INK.inkSoft, 0.2), { amp: 0 });
          for (let i = 0; i < 9; i++) dark.line([[-40, 1380 + i * 60], [W + 40, 1360 + i * 60]], 3, INK.inkSoft, { op: 0.35 });
          // field: drifting + gentle focus breathing
          const dx = Math.sin(lt * 0.5) * 22 + lt * 8, dy = Math.cos(lt * 0.4) * 14, bz = 1 + 0.02 * Math.sin(lt * 1.7);
          const M = p => [C[0] + (p[0] - C[0] + dx) * bz, C[1] + (p[1] - C[1] + dy) * bz];
          tis.fill(rect(C[0] - R - 20, C[1] - R - 20, C[0] + R + 20, C[1] + R + 20), mix(INK.paperLight, INK.red, 0.12), { amp: 0 });
          // cartilage: blue-grey matrix + cells in their lacunae
          const edge = []; for (let i = 0; i <= 10; i++) { const u = i / 10; edge.push(M([C[0] - R * 1.1 + u * R * 2.4, C[1] + R * 1.1 - u * R * 2.4 + 60 + Math.sin(u * 7) * 30])); }
          tis.fill(edge.concat([M([C[0] + R * 1.4, C[1] + R * 1.4])]), CART(), { smooth: true });
          const cOn = lt >= ca ? spring(lt, ca, 0.5) : 0;
          cells.forEach(([x, y, r, a], i) => { const p = M([x, y]); tis.circ(p[0], p[1], r * 1.35, mix(CART(), INK.paperLight, 0.4), { ry: r, w: 3, line: CART_C() }); tis.dot(p[0] + 4, p[1], r * 0.45, r * 0.4, CART_C()); if (cOn && i % 3 === 0) tis.circ(p[0], p[1], r * 1.35 + 10 * cOn, null, { ry: r + 10 * cOn, w: 5, line: INK.blue }); });
          // lung: thin pink walls of air sacs
          const lOn = lt >= la ? spring(lt, la, 0.5) : 0;
          sacs.forEach(([x, y, r], i) => {
            const p = M([x, y]);
            tis.circ(p[0], p[1], r, TISSUE(), { w: 7, line: TISSUE_W() });
            tis.dot(p[0] - r * 0.6, p[1] + r * 0.5, 6, 5, MEAT_D());
            if (lOn && i % 4 === 0) tis.circ(p[0], p[1], r + 8 * lOn, null, { w: 6, line: INK.red });
          });
          // a few red blood cells drifting
          for (let i = 0; i < 10; i++) { const p = M([C[0] - R + fr(hn(i, 11) + lt * 0.03) * R * 2, C[1] - R * 0.8 + hn(i, 12) * R * 1.2]); tis.circ(p[0], p[1], 13, MEAT(), { ry: 9, w: 2.5 }); }
          // brass eyepiece ring
          ring.circ(C[0], C[1], R + 34, null, { w: 64, line: BRASS() });
          ring.circ(C[0], C[1], R + 4, null, { w: 10, line: INK.ink });
          ring.circ(C[0], C[1], R + 68, null, { w: 8, line: INK.ink });
          for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + 0.05; ring.line([[C[0] + Math.cos(a) * (R + 14), C[1] + Math.sin(a) * (R + 14)], [C[0] + Math.cos(a) * (R + 52), C[1] + Math.sin(a) * (R + 52)]], 3, BRASS_D()); }
          ring.line([[C[0] - R * 0.7, C[1] - R * 0.5], [C[0] - R * 0.35, C[1] - R * 0.85]], 14, INK.paperLight, { op: 0.35 });
          // below the eyepiece: the brass stage with the glass slide under its two clips, a notebook with a sketch
          const sy = 1330;
          ring.shape([[-60, sy + 40], [W + 60, sy], [W + 60, H + 60], [-60, H + 60]], BRASS(), { w: 7, smooth: false });
          ring.shape([[-60, sy + 90], [W + 60, sy + 50], [W + 60, sy + 74], [-60, sy + 114]], BRASS_D(), { w: 0, smooth: false });
          ring.circ(W * 0.5, sy + 260, 120, mix(INK.ink, INK.inkSoft, 0.3), { ry: 46, w: 5 });
          ring.shape([[150, sy + 180], [930, sy + 160], [940, sy + 330], [160, sy + 350]], mix(INK.paperLight, INK.blue, 0.22), { w: 5, smooth: false, op: 0.92 });
          ring.fill(inkEllipsePts(W * 0.5 + Math.sin(lt * 0.5) * 6, sy + 256, 120, 50, sd + 41, 12, 0.1, 0.18), MEAT(), { smooth: true, op: 0.85 });
          ring.line([[190, sy + 190], [300, sy + 186]], 6, INK.paperLight, { op: 0.7 });
          [[230, -0.35], [850, 0.35]].forEach(([x, a]) => {
            ring.shape([[x - 50, sy + 120], [x + 50, sy + 116], [x + 40 + a * 60, sy + 240], [x - 40 + a * 60, sy + 244]], mix(INK.paperLight, INK.inkSoft, 0.35), { w: 5, smooth: false });
            ring.circ(x, sy + 130, 28, BRASS_D(), { w: 5 });
          });
          const nb = [[40, 1660], [520, 1600], [560, 1960], [60, 1990]];
          ring.shape(nb, INK.paperLight, { w: 6, smooth: false });
          for (let i = 0; i < 5; i++) ring.line([[90, 1700 + i * 44], [480, 1646 + i * 44]], 3, INK.inkSoft);
          for (let i = 0; i < 4; i++) ring.circ(160 + i * 70, 1716 + (i % 2) * 40 - i * 8, 26, null, { w: 4, line: INK.red });
          for (let i = 0; i < 3; i++) ring.circ(380 + i * 50, 1800 - i * 8, 18, null, { w: 4, ry: 12, line: INK.blue });
          const pen0 = [880 + Math.sin(lt * 2) * 8, 1700];
          ring.line([pen0, [pen0[0] + 160, pen0[1] + 260]], 22, INK.ink);
          ring.line([pen0, [pen0[0] - 18, pen0[1] - 30]], 8, INK.gold);
          dark.end(); tis.end(); ring.end();
          lbs.update(lt, t, cues);
        },
      };
    },
  };
})();
