// bt_uluburun: the Uluburun wreck (Kaş, late 14th century BC; found 1982, excavated 1984-1994), belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; the only motion is slow and natural (light rays, drifting
// marine snow, rising bubbles, a sinking diver, settling sand, waves, rain, a lamp beam). Places are drawn on the
// 1920x1080 stage (BTL.stage frames them for a Short). Shared drawings live in window.ULB (used by bt_uluburun_b.js).
//   bt_ul_sea     P: {mode: "descend"|"find"|"dig"|"scatter"|"settle"|"remain"|"glint"}  cues: hit (find: glow on the
//                 ingots; remain: hull outline fades), keep (remain: what is left turns gold)   under water on the slope
//   bt_ul_section P: {mode: "time"|"slope", label}  cues: hit   cross-section of the cape: surface, depth scale, the
//                 slope. time: a diver at ~50 m and a 20-minute arc. slope: the wreck band from 44 to 61 m
//   bt_ul_ship    P: {mode: "sail"|"night"|"plan"|"cape"|"storm"|"empty"|"museum", label, sub, ask}  cues: hit
//                 a Late Bronze Age merchant ship (high stem and stern posts, one mast, a square sail, wicker rail)
//   bt_ul_hold    P: {mode: "gift"|"world"|"envoys", label}  cues: hit   the ship cut open lengthwise, its hold full of cargo;
//                 gift: cargo fills in, the hull turns gold on hit; world: a thin photo frame closes round it on hit
//   bt_ul_collapse P: {mode: "lit"|"fall"}  cues: a, b, c   three palace silhouettes at night (Hattuşa, Ugarit,
//                 Mycenae); fall: their lights go out one by one
//   bt_ul_map     P: {bounds: [lon0, lat0, lon1, lat1], points: [{lon, lat, label, sub, at, side: "left"|"right"}],
//                 regions: [{lon, lat, text}], routes: [{path: [[lon, lat]...], at, dashed}]}  cues: the "at" names
//                 a quiet, hand-drawn Eastern Mediterranean: smooth coasts, land a shade lighter than the sea
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const ital = (g, s, x, y, size = 46, o = {}) => label(g, s, x, y, size, Object.assign({ font: LO, italic: true, color: C.inkSoft }, o));
  const place = (parent, x, y, s = 1, rot = 0) => el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})` });

  // ------------------------------------------------------------------ shared drawings (origin = centre)
  const ULB = window.ULB = {};
  // oxhide copper ingot: a flat slab with concave sides and four long "ears" at the corners. The outline is defined
  // flat (top view, ~740 x 420) and projected: it lies on the sea floor, seen at 3/4 (y squashed by k, turned by rot).
  const INGOT = [[-230, -150], [-80, -118, 80, -118, 230, -150], [270, -176, 315, -214, 345, -206], [374, -198, 368, -160, 344, -142],
    [305, -112, 268, -50, 268, 0], [268, 50, 305, 112, 344, 142], [368, 160, 374, 198, 345, 206], [315, 214, 270, 176, 230, 150],
    [80, 118, -80, 118, -230, 150], [-270, 176, -315, 214, -345, 206], [-374, 198, -368, 160, -344, 142], [-305, 112, -268, 50, -268, 0],
    [-268, -50, -305, -112, -344, -142], [-368, -160, -374, -198, -345, -206], [-315, -214, -270, -176, -230, -150]];
  const EARS = [[1, 2, 3], [5, 6, 7], [8, 9, 10], [12, 13, 14]];   // segment indices around each ear (end of 1 -> start of 3)
  ULB.proj = (k = 0.58, rot = 0, sc = 1, dy = 0) => {
    const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180);
    return (x, y) => { const X = x * sc, Y = y * sc * k; return f1(X * c - Y * s) + ' ' + f1(X * s + Y * c + dy); };
  };
  ULB.shapeD = (segs, pr) => 'M' + pr(segs[0][0], segs[0][1]) + segs.slice(1).map(q => 'C' + pr(q[0], q[1]) + ' ' + pr(q[2], q[3]) + ' ' + pr(q[4], q[5])).join('') + 'Z';
  ULB.ingotPath = (k, rot, sc = 1, dy = 0) => ULB.shapeD(INGOT, ULB.proj(k, rot, sc, dy));
  ULB.earsPath = (k, rot, sc = 1) => {
    const pr = ULB.proj(k, rot, sc);
    return EARS.map(([a, b, c]) => { const st = INGOT[a].slice(-2); return 'M' + pr(st[0], st[1]) + [INGOT[b], INGOT[c]].map(q => 'C' + pr(q[0], q[1]) + ' ' + pr(q[2], q[3]) + ' ' + pr(q[4], q[5])).join(''); }).join('');
  };
  ULB.ingotD = ULB.ingotPath(1, 0);   // flat, unprojected outline (sketches)
  ULB.ingot = (D, o = {}) => {
    const k = o.k ?? 0.58, rot = o.rot ?? 0, T = o.thick ?? 30;
    const top = ULB.ingotPath(k, rot), side = ULB.ingotPath(k, rot, 1, T);
    D.f(side, C.paperDark, 1); D.f(side, C.red, 0.35);
    D.f(top, C.paperLight, 1); D.f(top, C.red, o.tint ?? 0.62);
    D.f(ULB.ingotPath(k, rot, 0.62, -6), C.gold, 0.14);
    D.s(top, { w: o.w ?? 4, color: o.gold ? C.gold : C.ink });
    // faint casting marks on the top face
    const pr = ULB.proj(k, rot), r = rng(o.seed || 11); let m = '';
    for (let i = 0; i < 9; i++) { const x = -180 + r() * 360, y = -70 + r() * 140, w = 30 + r() * 50; m += 'M' + pr(x, y) + 'C' + pr(x + w * 0.3, y - 8) + ' ' + pr(x + w * 0.7, y - 8) + ' ' + pr(x + w, y); }
    D.s(m, { w: 1.6, color: C.ink, alpha: 0.35 });
  };
  // a small ingot glyph (for stacks, the site and the hold), w ~ 125 * s
  ULB.ingotMini = (g, x, y, s = 1, o = {}) => {
    const t = place(g, x, y, 1), sc = s * 0.17, k = o.k ?? 0.58;
    P0(t, ULB.ingotPath(k, o.rot || 0, sc, 6 * s), C.paperDark, 1);
    P0(t, ULB.ingotPath(k, o.rot || 0, sc), C.paperLight, 1); P0(t, ULB.ingotPath(k, o.rot || 0, sc), C.red, 0.6);
    return L0(t, ULB.ingotPath(k, o.rot || 0, sc), o.color || C.ink, o.w ?? 2.4, 1);
  };
  // Canaanite jar: tall, pointed foot, two small handles on the shoulder (origin = centre, h ~ 2*84*s)
  ULB.jarD = (s = 1) => {
    const k = v => f1(v * s);
    return `M${k(-16)} ${k(-84)}L${k(16)} ${k(-84)}L${k(18)} ${k(-70)}C${k(46)} ${k(-62)} ${k(52)} ${k(-40)} ${k(48)} ${k(-10)}C${k(42)} ${k(30)} ${k(18)} ${k(60)} ${k(4)} ${k(84)}` +
      `L${k(-4)} ${k(84)}C${k(-18)} ${k(60)} ${k(-42)} ${k(30)} ${k(-48)} ${k(-10)}C${k(-52)} ${k(-40)} ${k(-46)} ${k(-62)} ${k(-18)} ${k(-70)}Z`;
  };
  ULB.jar = (g, x, y, s = 1, rot = 0, o = {}) => {
    const t = place(g, x, y, 1, rot);
    P0(t, ULB.jarD(s), C.paperLight, 1);
    L0(t, `M${f1(-44 * s)} ${f1(-46 * s)}C${f1(-60 * s)} ${f1(-44 * s)} ${f1(-58 * s)} ${f1(-24 * s)} ${f1(-46 * s)} ${f1(-22 * s)}M${f1(44 * s)} ${f1(-46 * s)}C${f1(60 * s)} ${f1(-44 * s)} ${f1(58 * s)} ${f1(-24 * s)} ${f1(46 * s)} ${f1(-22 * s)}`, C.inkSoft, 2.4);
    return L0(t, ULB.jarD(s), o.color || C.ink, o.w ?? 3);
  };
  // stone anchor: a tall slab with a rope hole near the top
  ULB.anchor = (g, x, y, s = 1, rot = 0) => {
    const t = place(g, x, y, s, rot);
    const d = 'M-34-60L34-60L46 60L-46 60Z';
    P0(t, d, C.paperLight, 1); L0(t, d, C.ink, 3 / s);
    L0(t, BTL.E(0, -34, 11, 11), C.inkSoft, 3 / s);
    return t;
  };
  // the merchant ship, side on, bow to the right (origin = waterline centre, length ~ 760 * s)
  ULB.ship = (g, s = 1, o = {}) => {
    const t = place(g, 0, 0, s);
    const hull = 'M-380-40C-300 30-120 56 60 56C220 56 320 30 370-30L392-110L376-112L350-46C300-24 200-14 60-14C-100-14-260-20-330-44C-350-70-372-120-360-170L-376-172C-392-120-396-70-380-40Z';
    P0(t, hull, o.fill || C.paperLight, 1);
    L0(t, hull, o.color || C.ink, 3.5 / s);
    // strakes
    L0(t, 'M-344-30C-250 4-100 18 60 18C200 18 300 4 356-34M-360-12C-270 26-110 40 60 40C210 40 306 20 362-14', C.inkSoft, 1.8 / s, 0.8);
    // the wicker fence along the rail
    let wick = 'M-300-46C-200-30-60-24 60-24C190-24 280-30 330-40';
    for (let x = -290; x <= 320; x += 22) wick += `M${x} ${f1(-34 + Math.abs(x) * 0.02)}l0 -30`;
    L0(t, wick + 'M-300-76C-200-60-60-54 60-54C190-54 280-60 330-70', C.inkSoft, 1.6 / s, 0.75);
    if (o.sail !== false) {
      L0(t, 'M10-24L10-470', o.color || C.ink, 4 / s);                       // mast
      const sail = 'M-200-430C-120-418 140-418 220-430L230-150C140-140-120-140-206-150Z';
      P0(t, sail, C.paperLight, o.sailA ?? 0.9);
      L0(t, sail, o.color || C.ink, 3 / s);
      let br = ''; for (let x = -160; x <= 180; x += 56) br += `M${x} -424L${x + 4} -146`;
      L0(t, br, C.inkSoft, 1.6 / s, 0.7);                                       // brailing lines
      L0(t, 'M-230-436L250-436M-226-146L254-146', o.color || C.ink, 3.5 / s);   // yard and boom
      L0(t, 'M10-470L-360-170M10-470L376-112', C.inkSoft, 1.4 / s, 0.6);        // stays
    }
    // steering oar at the stern
    L0(t, 'M-300-70L-370 70', o.color || C.ink, 4 / s);
    P0(t, 'M-362 50L-384 110L-366 112L-352 54Z', C.paperLight, 1); L0(t, 'M-362 50L-384 110L-366 112L-352 54Z', C.inkSoft, 2 / s);
    return t;
  };
  ULB.flame = (parent, x, y, s = 1) => {   // a tiny lamp flame that breathes
    const g = el(parent, 'g');
    const fl = [[C.gold, 1, 0], [C.paperLight, 0.5, 1.7]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.95), k, ph }));
    return { update(lt) { for (const f of fl) { const h = (30 + 3 * Math.sin(lt * 2 + f.ph)) * f.k * s, w = 9 * f.k * s;
      f.e.setAttribute('d', `M${f1(x - w)} ${f1(y)}C${f1(x - w)} ${f1(y - h * 0.5)} ${f1(x)} ${f1(y - h * 0.8)} ${f1(x)} ${f1(y - h)}C${f1(x)} ${f1(y - h * 0.8)} ${f1(x + w)} ${f1(y - h * 0.5)} ${f1(x + w)} ${f1(y)}C${f1(x + w)} ${f1(y + w)} ${f1(x - w)} ${f1(y + w)} ${f1(x - w)} ${f1(y)}Z`); } } };
  };

  // ------------------------------------------------------------------ under water
  const bgFill = (g, col = C.paper) => P0(g, 'M-400-400L2320-400L2320 2200L-400 2200Z', col, 1);
  function water(g, svg, defs, o = {}) {
    bgFill(g, C.paper);
    const rays = (o.rays || [300, 700, 1150, 1600]).map((x, i) => ({ e: P0(g, `M${x - 50} -20L${x + 50} -20L${x + 260 + i * 30} 1100L${x + 40 + i * 30} 1100Z`, C.stain, 0.07), i }));
    const r = rng(o.seed || 5), snow = [];
    let d = '';
    for (let i = 0; i < 70; i++) snow.push({ x: r() * 1920, y: r() * 1100, sp: 4 + r() * 8, s: 1.2 + r() * 2.2, ph: r() * TAU });
    const sn = P0(g, '', C.inkSoft, 0.55);
    void d;
    return {
      update(lt) {
        rays.forEach(q => q.e.setAttribute('fill-opacity', (0.06 + 0.025 * Math.sin(lt * 0.45 + q.i * 1.7)).toFixed(3)));
        let p = '';
        for (const q of snow) { const y = (q.y + lt * q.sp) % 1100, x = q.x + 6 * Math.sin(lt * 0.3 + q.ph); p += `M${f1(x - q.s)} ${f1(y)}a${q.s} ${q.s} 0 1 0 ${f1(2 * q.s)} 0a${q.s} ${q.s} 0 1 0 ${f1(-2 * q.s)} 0`; }
        sn.setAttribute('d', p);
      },
    };
  }
  // the sloping sea floor: higher on the left, falling to the right; returns y(x)
  function floor(g, y0, y1, seed) {
    const Y = x => y0 + (y1 - y0) * (x / 1920) + 10 * Math.sin(x / 160 + seed);
    let top = ''; for (let x = -200; x <= 2120; x += 40) top += (x === -200 ? 'M' : 'L') + f1(x) + ' ' + f1(Y(x));
    P0(g, top + 'L2120 1800L-200 1800Z', C.paperLight, 1);
    L0(g, top, C.inkSoft, 2.4);
    const r = rng(seed * 13 + 1); let rip = '';
    for (let i = 0; i < 40; i++) { const x = r() * 1920, y = Y(x) + 30 + r() * 260, w = 30 + r() * 60; rip += `M${f1(x)} ${f1(y)}c${f1(w * 0.3)} -6 ${f1(w * 0.7)} -6 ${f1(w)} 0`; }
    L0(g, rip, C.inkSoft, 1.5, 0.45);
    return Y;
  }
  function rocks(g, list) {
    for (const [x, y, s] of list) {
      const d = `M${x - 120 * s} ${y}L${x - 90 * s} ${y - 70 * s}L${x - 20 * s} ${y - 110 * s}L${x + 60 * s} ${y - 90 * s}L${x + 120 * s} ${y - 30 * s}L${x + 130 * s} ${y}Z`;
      P0(g, d, C.paperDark, 1); L0(g, d, C.inkSoft, 2.2);
      L0(g, `M${x - 20 * s} ${y - 110 * s}L${x} ${y - 40 * s}L${x + 60 * s} ${y - 90 * s}`, C.inkSoft, 1.5, 0.6);
    }
  }
  function bubbles(g, n, seed) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: el(g, 'circle', { r: 3 + r() * 6, fill: 'none', stroke: C.ink, 'stroke-width': 2 }), ph: r(), dx: (r() - 0.5) * 20, sp: 0.18 + r() * 0.12 });
    return { update(lt, x, y, h = 420) { for (const b of list) { const p = (lt * b.sp + b.ph) % 1;
      b.e.setAttribute('cx', f1(x + b.dx + 10 * Math.sin(lt * 1.3 + b.ph * 9))); b.e.setAttribute('cy', f1(y - p * h)); b.e.setAttribute('stroke-opacity', f1((1 - p) * 0.7)); } } };
  }
  // a swimming diver: a horizontal silhouette with a tank, faceless (origin = chest), facing right
  function diver(g, s = 1, o = {}) {
    const t = el(g, 'g'), col = C.paperDark, rim = C.inkSoft, k = v => f1(v * s);
    const limb = (d, w) => { L0(t, d, rim, w * s + 3, 0.85); L0(t, d, col, w * s, 1); };
    limb(`M${k(-20)} ${k(0)}L${k(-150)} ${k(6)}`, 30);                      // body
    limb(`M${k(-150)} ${k(4)}L${k(-230)} ${k(-6)}L${k(-300)} ${k(4)}`, 14);   // leg 1
    limb(`M${k(-150)} ${k(10)}L${k(-225)} ${k(24)}L${k(-296)} ${k(20)}`, 14); // leg 2
    P0(t, `M${k(-300)} ${k(-6)}L${k(-370)} ${k(-26)}L${k(-366)} ${k(10)}Z`, col, 1);   // fins
    P0(t, `M${k(-296)} ${k(14)}L${k(-366)} ${k(30)}L${k(-350)} ${k(50)}Z`, col, 1);
    const arm = o.reach ? `M${k(-10)} ${k(4)}L${k(50)} ${k(40)}L${k(96)} ${k(70)}` : `M${k(-10)} ${k(4)}L${k(46)} ${k(26)}L${k(96)} ${k(18)}`;
    limb(arm, 11);
    el(t, 'rect', { x: k(-120), y: k(-40), width: k(90), height: k(24), rx: k(12), fill: C.paperLight, stroke: rim, 'stroke-width': 2 });   // tank
    el(t, 'circle', { cx: k(26), cy: k(-4), r: k(22) + 1.5, fill: rim, 'fill-opacity': 0.85 });
    el(t, 'circle', { cx: k(26), cy: k(-4), r: k(22), fill: col });
    return t;
  }

  SH.bt_ul_sea = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'find';
      const { g } = BTL.stage(svg, W, H, { fx: mode === 'descend' ? 900 : 960 });
      const wv = water(g, svg, defs, { seed: 3 + mode.length });
      const items = [];
      let up = () => {};
      if (mode === 'descend') {
        const Y = floor(g, 900, 980, 2);
        rocks(g, [[1500, Y(1500) + 10, 1.3], [260, Y(260) + 8, 0.9]]);
        void Y;
        const dv = el(g, 'g'); BTL.person(dv, 'dive', 0, 0, 230, {});
        const bb = bubbles(g, 7, 9);
        up = (lt, dur) => {
          const p = BTL.ease(lt, 0, Math.max(dur, 6) * 1.1), x = lerp(760, 980, p), y = lerp(150, 470, p);
          dv.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(160)`);
          bb.update(lt, x + 30, y + 200, 360);
        };
      } else if (mode === 'find' || mode === 'glint') {
        const Y = floor(g, 700, 760, 4);
        rocks(g, [[340, Y(340) + 6, 1.4], [1640, Y(1640) + 6, 1.1]]);
        const ig = el(g, 'g');
        const spots = mode === 'glint' ? [[1010, 0.66, -4]] : [[730, 0.3, -10], [1020, 0.36, 6], [1310, 0.28, 14]];
        for (const [x, s, rot] of spots) {
          const D = BTL.drawing(place(ig, x, Y(x) - 26 * s / 0.4, s, 0)); ULB.ingot(D, { seed: x, gold: mode === 'glint', rot, k: 0.66, thick: 24 }); items.push(D);
        }
        // sand drifts over the lower halves
        let sd = '', sl = '';
        for (const [x, s] of spots) {
          const a = `M${f1(x - 440 * s)} ${f1(Y(x) + 50 * s)}C${f1(x - 250 * s)} ${f1(Y(x) + 26 * s)} ${f1(x - 200 * s)} ${f1(Y(x) + 72 * s)} ${f1(x)} ${f1(Y(x) + 72 * s)}C${f1(x + 200 * s)} ${f1(Y(x) + 72 * s)} ${f1(x + 250 * s)} ${f1(Y(x) + 34 * s)} ${f1(x + 440 * s)} ${f1(Y(x) + 56 * s)}`;
          sd += a + `L${f1(x + 440 * s)} ${f1(Y(x) + 400)}L${f1(x - 440 * s)} ${f1(Y(x) + 400)}Z`; sl += a;
        }
        P0(g, sd, C.paperLight, 1); L0(g, sl, C.inkSoft, 1.8, 0.6);
        const gl = BTL.glow(svg, defs, 1010, Y(1010) - 40, 420, C.stain, 0.22, g);
        const hot = BTL.glow(svg, defs, 1010, Y(1010) - 40, 260, C.gold, 0, g);
        let dv = null, bb = null;
        if (mode === 'find') { dv = diver(g, 0.95, { reach: true }); bb = bubbles(g, 6, 21); }
        up = (lt, dur, cues) => {
          items.forEach((D, i) => D.reveal(mode === 'glint' ? 1 : BTL.ease(lt, 0.2 + i * 0.4, 2)));
          const th = cue(cues, 'hit', dur * 0.5), q = BTL.ease(lt, th, 1.6);
          hot.set((mode === 'glint' ? 0.3 + 0.08 * Math.sin(lt * 0.9) : 0.3 * q));
          gl.set(0.2 + 0.03 * Math.sin(lt * 0.6));
          if (dv) {
            const x = lerp(430, 560, BTL.ease(lt, 0, Math.max(dur, 5))), y = 470 + 8 * Math.sin(lt * 0.7);
            dv.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(14)`);
            bb.update(lt, x + 26, y - 30, 420);
          }
        };
      } else if (mode === 'dig') {
        const Y = floor(g, 720, 800, 6);
        // the excavation grid over the cargo
        const grid = el(g, 'g'); let gd = '';
        const x0 = 520, x1 = 1460;
        for (let i = 0; i <= 4; i++) { const x = lerp(x0, x1, i / 4); gd += `M${f1(x)} ${f1(Y(x) - 60)}L${f1(x - 40)} ${f1(Y(x) + 120)}`; }
        gd += `M${x0} ${f1(Y(x0) - 60)}L${x1} ${f1(Y(x1) - 60)}M${x0 - 20} ${f1(Y(x0) + 30)}L${x1 - 20} ${f1(Y(x1) + 30)}M${x0 - 40} ${f1(Y(x0) + 120)}L${x1 - 40} ${f1(Y(x1) + 120)}`;
        for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { const x = 600 + c * 140 + r * 20, y = Y(x) - 30 + r * 50; ULB.ingotMini(grid, x, y, 0.9 + r * 0.05, { w: 2.4 }); }
        const gl2 = L0(g, gd, C.gold, 3, 0.9, { pathLength: 1 }); draw(gl2, 0);
        BTL.glow(svg, defs, 980, 620, 520, C.stain, 0.14, g);
        const d1 = diver(g, 0.8, { reach: true }), d2 = diver(g, 0.7, {});
        const b1 = bubbles(g, 5, 31), b2 = bubbles(g, 5, 37);
        up = (lt, dur) => {
          fade(grid, BTL.ease(lt, 0.2, 1.6)); draw(gl2, BTL.ease(lt, 0.6, 2.4));
          const y1 = 470 + 6 * Math.sin(lt * 0.6), y2 = 300 + 7 * Math.sin(lt * 0.5 + 1);
          const x1 = lerp(780, 840, BTL.ease(lt, 0, Math.max(dur, 5))), x2 = lerp(1500, 1420, BTL.ease(lt, 0, Math.max(dur, 5)));
          d1.setAttribute('transform', `translate(${f1(x1)} ${f1(y1)}) rotate(18)`);
          d2.setAttribute('transform', `translate(${f1(x2)} ${f1(y2)}) scale(-1 1) rotate(8)`);
          b1.update(lt, x1 + 24, y1 - 24, 420); b2.update(lt, x2 - 20, y2 - 20, 300);
        };
      } else {   // scatter | settle | remain: the whole site down the slope
        const Y = floor(g, 560, 900, 8);
        rocks(g, [[150, Y(150) + 4, 1.6], [1820, Y(1820) + 4, 1.2]]);
        const site = el(g, 'g');
        const hull = L0(g, `M420 ${f1(Y(420) - 40)}C700 ${f1(Y(700) + 40)} 1200 ${f1(Y(1200) + 50)} 1560 ${f1(Y(1560) - 30)}`, C.inkSoft, 3, 0.8, { 'stroke-dasharray': '14 12' });
        const keep = [];
        for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 7; c++) { const x = 560 + c * 100 + rr * 18, y = Y(x) - 18 + rr * 34; keep.push(ULB.ingotMini(site, x, y, 0.75, { w: 2.2 })); }
        const jr = rng(17);
        for (let i = 0; i < 8; i++) { const x = 1220 + i * 46 + jr() * 30, y = Y(x) - 20 + jr() * 50; keep.push(ULB.jar(site, x, y, 0.55, 60 + jr() * 50, { w: 2.2 })); }
        for (const [x, rot] of [[470, -70], [1660, 80], [1760, 100]]) { ULB.anchor(site, x, Y(x) - 4, 0.6, rot); }
        // glass discs
        for (const x of [1100, 1150]) { const y = Y(x) - 6; P0(site, BTL.E(x, y, 26, 9), C.blue, 0.7); keep.push(L0(site, BTL.E(x, y, 26, 9), C.ink, 2)); }
        const beamG = el(g, 'g');
        const beam = P0(beamG, 'M0 0L-140 760L140 760Z', C.stain, 0.12);
        const sand = mode === 'settle' ? P0(g, '', C.paperLight, 1) : null, sandL = mode === 'settle' ? L0(g, '', C.inkSoft, 2) : null;
        const fall = mode === 'settle' ? (() => { const r = rng(3), l = []; for (let i = 0; i < 90; i++) l.push({ x: r() * 1920, y: r() * 900, sp: 14 + r() * 16 }); return { e: P0(g, '', C.inkSoft, 0.7), l }; })() : null;
        up = (lt, dur, cues) => {
          fade(site, BTL.ease(lt, 0, 1.4));
          const a = -24 + 48 * BTL.ease(lt, 0, Math.max(dur, 4));
          beamG.setAttribute('transform', `translate(960 -40) rotate(${f1(a)})`);
          beam.setAttribute('fill-opacity', mode === 'scatter' ? 0.12 : 0.06);
          if (mode === 'settle') {
            const p = BTL.ease(lt, 0.4, Math.max(dur, 4)), lift = 70 * p;
            let top = ''; for (let x = -200; x <= 2120; x += 40) top += (x === -200 ? 'M' : 'L') + f1(x) + ' ' + f1(Y(x) - lift + 8 * Math.sin(x / 90));
            sand.setAttribute('d', top + 'L2120 1800L-200 1800Z'); sandL.setAttribute('d', top);
            let pd = ''; for (const q of fall.l) { const y = (q.y + lt * q.sp) % 900; pd += `M${f1(q.x)} ${f1(y)}l0 3`; }
            fall.e.setAttribute('d', pd); fall.e.setAttribute('stroke', C.inkSoft); fall.e.setAttribute('stroke-width', 3); fall.e.setAttribute('stroke-opacity', 0.45);
            fade(hull, 1 - BTL.ease(lt, 0.4, 2));
          } else if (mode === 'remain') {
            const th = cue(cues, 'hit', dur * 0.25), tk = cue(cues, 'keep', dur * 0.6);
            fade(hull, 1 - BTL.ease(lt, th, 2.2));
            const q = BTL.ease(lt, tk, 1.4);
            for (const e of keep) e.setAttribute('stroke', q > 0.5 ? C.gold : C.ink);
          }
        };
      }
      return { update(lt, dur, cues) { wv.update(lt); up(lt, dur, cues); } };
    },
  };

  // ------------------------------------------------------------------ cross-section of the cape
  SH.bt_ul_section = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'time';
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      bgFill(g, C.paper);
      const S = 160, Dm = m => S + m * 12;   // depth (m) -> y : 0 m at 160, 60 m at 880
      P0(g, `M-200 -400L2120 -400L2120 ${S}L-200 ${S}Z`, C.paperDark, 1);
      const surf = L0(g, '', C.inkSoft, 2.5);
      // the cape: rock above water on the right, its slope running down to the left
      const cape = `M2120 -400L1740 -400C1700 -200 1660 40 1600 ${S}C1500 300 1400 520 1180 ${Dm(44)}C1000 ${Dm(50)} 820 ${Dm(57)} 560 ${Dm(62)}C300 ${Dm(66)} 0 ${Dm(68)} -200 ${Dm(69)}L-200 1800L2120 1800Z`;
      P0(g, cape, C.paperLight, 0.9); L0(g, cape, C.inkSoft, 2.5);
      // depth scale
      const sc = el(g, 'g'); let tk = '';
      for (let m = 0; m <= 60; m += 10) { tk += `M300 ${Dm(m)}L330 ${Dm(m)}`; label(sc, `${m} m`, 284, Dm(m) + 14, 40, { anchor: 'end', color: C.inkSoft }).setAttribute('opacity', 1); }
      L0(sc, `M330 ${S}L330 ${Dm(60)}` + tk, C.inkSoft, 2);
      // a small boat on the surface
      const boat = el(g, 'g'); ULB.ship(boat, 0.16, { sail: false });
      let up = () => {};
      if (mode === 'time') {
        const dv = diver(g, 0.8, { reach: true }), bb = bubbles(g, 6, 7);
        const line = L0(g, '', C.inkSoft, 1.6, 0.6, { 'stroke-dasharray': '6 8' });
        const ccx = 1260, ccy = 420, R = 110;
        el(g, 'circle', { cx: ccx, cy: ccy, r: R, fill: 'none', stroke: C.inkSoft, 'stroke-width': 2, 'stroke-opacity': 0.6 });
        const arc = L0(g, '', C.gold, 8);
        const num = label(g, '0', ccx, ccy + 24, 80, { weight: 300 }); num.setAttribute('opacity', 1);
        const lab = ital(g, P.label || 'dakika', ccx, ccy + R + 60, 46, { color: C.ink });
        const dl = ital(g, '≈ 50 m', 560, Dm(50) + 90, 46, { color: C.gold });
        up = (lt, dur, cues) => {
          const x = 760 + 10 * Math.sin(lt * 0.4), y = Dm(48) + 6 * Math.sin(lt * 0.6);
          dv.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(10)`);
          bb.update(lt, x + 20, y - 20, y - S);
          line.setAttribute('d', `M${f1(x + 20)} ${S}L${f1(x + 20)} ${f1(y - 40)}`);
          const th = cue(cues, 'hit', dur * 0.3), p = BTL.ease(lt, th, Math.max(2, dur - th - 0.8));
          const a = p * TAU * 0.999, pt = q => `${f1(ccx + Math.sin(q) * (R - 22))} ${f1(ccy - Math.cos(q) * (R - 22))}`;
          arc.setAttribute('d', p > 0.01 ? `M${pt(0)}A${R - 22} ${R - 22} 0 ${a > Math.PI ? 1 : 0} 1 ${pt(a)}` : '');
          num.textContent = String(Math.round(20 * p));
          fade(lab, BTL.ease(lt, th, 1)); fade(dl, BTL.ease(lt, 0.6, 1.2));
          boat.setAttribute('transform', `translate(${f1(x + 20)} ${f1(S + 2 + 2 * Math.sin(lt * 0.7))})`);
        };
      } else {   // slope: the wreck band from 44 to 61 m
        const band = L0(g, `M1180 ${Dm(44)}C1000 ${Dm(50)} 820 ${Dm(57)} 610 ${Dm(61.3)}`, C.gold, 9, 1, { pathLength: 1 }); draw(band, 0);
        const site = el(g, 'g');
        for (let i = 0; i < 9; i++) { const u = i / 8, x = lerp(1140, 660, u), y = lerp(Dm(44.5), Dm(60.5), Math.pow(u, 0.8)) - 16; ULB.ingotMini(site, x, y, 0.55, { w: 2 }); }
        ULB.jar(site, 900, Dm(53.5) - 20, 0.4, 70);
        const a = label(g, '44 m', 1240, Dm(44) - 30, 50, { color: C.gold, anchor: 'start' });
        const b = label(g, '61 m', 560, Dm(61) + 80, 50, { color: C.gold, anchor: 'middle' });
        const lb = P.label ? ital(g, P.label, 1500, 600, 50, { color: C.ink }) : null;
        const gl = BTL.glow(svg, defs, 900, Dm(53), 360, C.stain, 0, g);
        up = (lt, dur, cues) => {
          const th = cue(cues, 'hit', dur * 0.4);
          draw(band, BTL.ease(lt, th - 0.6, 1.8)); fade(site, BTL.ease(lt, 0.2, 1.4));
          fade(a, BTL.ease(lt, th, 1)); fade(b, BTL.ease(lt, th + 0.8, 1)); if (lb) fade(lb, BTL.ease(lt, th + 1.2, 1.2));
          gl.set(0.12 + 0.04 * Math.sin(lt * 0.7));
          boat.setAttribute('transform', `translate(1150 ${f1(S + 2 + 2 * Math.sin(lt * 0.7))})`);
        };
      }
      return {
        update(lt, dur, cues) {
          let d = ''; for (let x = -200; x <= 1700; x += 40) d += (x === -200 ? 'M' : 'L') + f1(x) + ' ' + f1(S + 4 * Math.sin(x / 120 + lt * 0.7));
          surf.setAttribute('d', d);
          up(lt, dur, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the ship above water
  function seaLines(g, y0, seed, o = {}) {
    const r = rng(seed), lines = [];
    for (let i = 0; i < (o.n || 10); i++) { const u = (i + 1) / (o.n || 10); lines.push({ e: L0(g, '', C.inkSoft, 1.2 + 2 * u, 0.25 + 0.35 * u), y: y0 + 460 * Math.pow(u, 1.6), a: (o.amp || 6) * (0.4 + u), wl: 70 + 120 * u, sp: (o.sp || 0.6) * (0.6 + r() * 0.5), ph: r() * TAU }); }
    return { update(lt) { for (const q of lines) { let d = ''; for (let x = -200; x <= 2120; x += 40) d += (x === -200 ? 'M' : 'L') + f1(x) + ' ' + f1(q.y + q.a * Math.sin(x / q.wl + lt * q.sp + q.ph)); q.e.setAttribute('d', d); } } };
  }
  function capeRock(g, x0, y0, o = {}) {   // a headland from the right edge down into the sea
    const d = `M2120 ${y0 - 520}C1900 ${y0 - 520} ${x0 + 260} ${y0 - 420} ${x0 + 120} ${y0 - 260}C${x0 + 40} ${y0 - 160} ${x0 - 20} ${y0 - 60} ${x0 - 60} ${y0}L2120 ${y0}Z`;
    P0(g, d, o.fill || C.paperDark, 1); L0(g, d, C.inkSoft, 2.4);
    L0(g, `M${x0 + 200} ${y0 - 330}L${x0 + 260} ${y0 - 200}L${x0 + 220} ${y0 - 90}M${x0 + 420} ${y0 - 440}L${x0 + 470} ${y0 - 300}`, C.inkSoft, 1.6, 0.6);
    return d;
  }
  SH.bt_ul_ship = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'sail';
      const { g } = BTL.stage(svg, W, H, { fx: mode === 'cape' ? 1300 : 960 });
      bgFill(g, C.paper);
      let up = () => {};
      const lab = P.label ? label(g, P.label, mode === 'cape' ? 760 : 960, mode === 'plan' ? 830 : (mode === 'museum' ? 800 : 300), mode === 'plan' ? 60 : 84, { weight: 300 }) : null;
      const sub = P.sub ? ital(g, P.sub, mode === 'cape' ? 760 : 960, mode === 'museum' ? 860 : 370, 46) : null;
      if (mode === 'plan') {
        BTL.glow(svg, defs, 960, 520, 700, C.stain, 0.12, g);
        const sg = place(g, 960, 470, 1.3);
        const D = BTL.drawing(sg);
        const hull = 'M-380-40C-300 30-120 56 60 56C220 56 320 30 370-30L392-110L376-112L350-46C300-24 200-14 60-14C-100-14-260-20-330-44C-350-70-372-120-360-170L-376-172C-392-120-396-70-380-40Z';
        D.f(hull, C.paperLight, 1); D.s(hull, { w: 3.5 });
        for (let k = 0; k < 4; k++) D.s(`M${-350 + k * 6} ${-30 + k * 18}C-250 ${4 + k * 14} -100 ${14 + k * 12} 60 ${14 + k * 12}C200 ${14 + k * 12} 300 ${2 + k * 10} ${356 - k * 6} ${-34 + k * 16}`, { w: 1.8, color: C.inkSoft });
        let tn = ''; for (let x = -280; x <= 300; x += 70) tn += `M${x} 0l0 22`;   // mortise-and-tenon pegs
        D.s(tn, { w: 3, color: C.gold });
        D.s('M-396 140L396 140M-396 120L-396 160M396 120L396 160', { w: 2.5, color: C.gold });
        const dim = label(g, '≈ 15 metre', 960, 720, 54, { color: C.gold });
        up = (lt, dur, cues) => {
          D.reveal(BTL.ease(lt, 0, 3));
          fade(dim, BTL.ease(lt, 1.6, 1)); if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', dur * 0.55), 1.2));
        };
        return { update: up };
      }
      if (mode === 'museum') {
        P0(g, 'M-200 690L2120 690L2120 1800L-200 1800Z', C.paperDark, 1);
        L0(g, 'M-200 690L2120 690', C.inkSoft, 2, 0.6);
        P0(g, 'M760 -20L1160 -20L1400 720L520 720Z', C.stain, 0.07);
        BTL.glow(svg, defs, 960, 480, 520, C.stain, 0.16, g);
        P0(g, 'M640 640L1280 640L1300 710L620 710Z', C.paperLight, 1); L0(g, 'M640 640L1280 640L1300 710L620 710Z', C.inkSoft, 2.5);
        const sh = el(g, 'g', { transform: 'translate(960 560)' }); ULB.ship(sh, 0.68, {});
        if (lab) g.appendChild(lab); if (sub) g.appendChild(sub);
        up = (lt) => { fade(sh, BTL.ease(lt, 0, 1.6)); if (lab) fade(lab, BTL.ease(lt, 0.8, 1.2)); if (sub) fade(sub, BTL.ease(lt, 1.4, 1.2)); };
        return { update: up };
      }
      const night = mode === 'night' || mode === 'storm';
      const HY = 640;
      if (night || mode === 'sail') { const st = BTL.stars(g, night ? 200 : 90, 51, [0, 0, 1920, HY - 80]); const u0 = up; up = (lt, d, c) => { st.update(lt); u0(lt, d, c); }; }
      if (!night) {
        const sun = BTL.glow(svg, defs, mode === 'cape' ? 520 : 1400, HY - 60, 380, C.stain, 0.22, g);
        P0(g, BTL.E(mode === 'cape' ? 520 : 1400, HY - 40, 54, 54), C.ink, 0.85);
        void sun;
      }
      P0(g, `M-200 ${HY}L2120 ${HY}L2120 1800L-200 1800Z`, C.paperDark, 1);
      L0(g, `M-200 ${HY}L2120 ${HY}`, C.inkSoft, 2, 0.6);
      const sl = seaLines(g, HY + 10, 7 + mode.length, { amp: mode === 'storm' ? 30 : 6, sp: mode === 'storm' ? 0.9 : 0.55, n: 11 });
      let capeD = null;
      if (mode === 'cape' || mode === 'night' || mode === 'storm') capeD = capeRock(g, mode === 'cape' ? 1040 : 1460, HY + 20);
      const foam = capeD ? L0(g, '', C.ink, 2.2, 0.5) : null;
      const fx0 = mode === 'cape' ? 1000 : 1420;
      let ship = null, lamp = null;
      if (mode === 'sail' || mode === 'night' || mode === 'storm') {
        ship = el(g, 'g'); ULB.ship(ship, 1, { sailA: 0.95 });
        if (mode !== 'sail') lamp = ULB.flame(ship, -330, -190, 1.4);
      }
      const ask = P.ask ? label(g, '?', 960, 250, 200, { weight: 300, color: C.gold }) : null;
      let rain = null;
      if (mode === 'storm') { const r = rng(9), l = []; for (let i = 0; i < 90; i++) l.push({ x: r() * 2200 - 140, y: r() * 1000, sp: 120 + r() * 80 }); rain = { e: L0(g, '', C.inkSoft, 1.6, 0.4), l }; }
      const u1 = up;
      up = (lt, dur, cues) => {
        u1(lt, dur, cues); sl.update(lt);
        if (foam) { const f = 6 * Math.sin(lt * 0.9); foam.setAttribute('d', `M${fx0 - 40} ${HY + 24 + f}C${fx0 + 60} ${HY + 10 - f} ${fx0 + 160} ${HY + 30 + f} ${fx0 + 300} ${HY + 18}`); }
        if (ship) {
          const p = BTL.ease(lt, 0, Math.max(dur, 5) * 1.2);
          const x = mode === 'sail' ? lerp(820, 1000, p) : mode === 'night' ? lerp(560, 760, p) : lerp(900, 1040, p);
          const s = mode === 'sail' ? 0.78 : mode === 'night' ? 0.62 : 0.7;
          const rot = mode === 'storm' ? -13 + 3 * Math.sin(lt * 0.6) : 0.8 * Math.sin(lt * 0.5);
          ship.setAttribute('transform', `translate(${f1(x)} ${f1(HY + 26 + (mode === 'storm' ? 16 : 3) * Math.sin(lt * 0.6))}) rotate(${f1(rot)}) scale(${s})`);
          if (lamp) lamp.update(lt);
        }
        if (ask) fade(ask, BTL.ease(lt, cue(cues, 'hit', dur * 0.6), 1.4));
        if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', 0.8), 1.2)); if (sub) fade(sub, BTL.ease(lt, cue(cues, 'hit', 0.8) + 0.6, 1.2));
        if (rain) { let d = ''; for (const q of rain.l) { const y = (q.y + lt * q.sp) % 1000 - 40; d += `M${f1(q.x + y * 0.25)} ${f1(y)}l12 46`; } rain.e.setAttribute('d', d); }
      };
      return { update: up };
    },
  };

  // ------------------------------------------------------------------ the hold
  SH.bt_ul_hold = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'gift', portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, cy = portrait ? 640 : 470, k = portrait ? 0.62 : 1.1;
      BTL.glow(svg, defs, cx, cy, 760, C.stain, 0.14, g);
      const t = place(g, cx, cy, k);
      const hull = 'M-470-120C-380 80-160 150 40 150C240 150 380 90 450-90L470-170L440-170L420-118C330-100 200-96 40-96C-120-96-300-100-420-126C-436-150-446-190-440-230L-470-232C-484-190-486-150-470-120Z';
      const fillH = P0(t, hull, C.paperLight, 1);
      const out = L0(t, hull, C.ink, 4 / k);
      L0(t, 'M-430-110C-330-94-160-88 40-88C220-88 340-94 425-110', C.inkSoft, 2, 0.8);
      void fillH;
      // cargo glyphs inside, in the order they appear
      const cargo = [];
      const add = (fn, at) => { const gg = el(t, 'g', { opacity: 0 }); fn(gg); cargo.push({ gg, at }); };
      for (let r = 0; r < 3; r++) add(gg => { for (let c = 0; c < 5 - (r === 0 ? 1 : 0); c++) ULB.ingotMini(gg, -250 + c * 62 + r * 8 + (r === 0 ? 30 : 0), 100 - r * 40, 0.42, { w: 2 }); }, r * 0.2);
      add(gg => { for (let i = 0; i < 4; i++) ULB.jar(gg, 120 + i * 50, 40, 0.62, 0); }, 0.8);
      add(gg => { for (let i = 0; i < 3; i++) { P0(gg, BTL.E(-230 + i * 44, -48, 18, 7), C.blue, 0.75); L0(gg, BTL.E(-230 + i * 44, -48, 18, 7), C.ink, 1.6); } }, 1.1);
      add(gg => { L0(gg, 'M-70-40L40-52M-66-24L44-36', C.inkSoft, 9, 1); L0(gg, 'M-70-40L40-52M-66-24L44-36', C.ink, 1.4, 1); }, 1.3);
      add(gg => { for (let i = 0; i < 2; i++) ULB.anchor(gg, 40 + i * 34, 80, 0.32, 0); }, 1.5);
      // envoys: two faceless passengers standing on deck amidships (the two Mycenaeans)
      const env = mode === 'envoys' ? el(t, 'g', { opacity: 0 }) : null;
      if (env) { BTL.person(env, 'stand', -60, -92, 150, {}); BTL.person(env, 'stand', 20, -92, 145, { face: -1 }); }
      const envGl = env ? BTL.glow(svg, defs, cx - 20 * k, cy - 170 * k, 200, C.gold, 0, g) : null;
      const frame = L0(g, `M${cx - 640} ${cy - 330}L${cx + 640} ${cy - 330}L${cx + 640} ${cy + 260}L${cx - 640} ${cy + 260}Z`, C.gold, 3, 1, { pathLength: 1 }); draw(frame, 0);
      const lab = P.label ? ital(g, P.label, cx, cy + 340, 50, { color: C.ink }) : null;
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.55);
          const span = mode === 'gift' ? Math.max(1.5, th - 0.6) : 0.2;   // world / envoys: cargo already there
          for (const c of cargo) fade(c.gg, BTL.ease(lt, 0.3 + c.at * span / 1.5, 0.8));
          out.setAttribute('stroke', mode === 'gift' && lt > th ? C.gold : C.ink);
          if (env) { fade(env, BTL.ease(lt, 0.6, 1.4)); envGl.set(0.22 * BTL.ease(lt, th, 1.6)); }
          if (mode === 'world') draw(frame, BTL.ease(lt, th, 2.2)); else draw(frame, 0);
          if (lab) fade(lab, BTL.ease(lt, th + 0.4, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ three palaces at night
  SH.bt_ul_collapse = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'lit';
      const { g } = BTL.stage(svg, W, H, { fx: 960 });
      bgFill(g, C.paper);
      const st = BTL.stars(g, 180, 63, [0, 0, 1920, 520]);
      const HY = 700;
      P0(g, `M-200 ${HY}C400 ${HY - 10} 1400 ${HY + 8} 2120 ${HY}L2120 1800L-200 1800Z`, C.paperDark, 1);
      L0(g, `M-200 ${HY}C400 ${HY - 10} 1400 ${HY + 8} 2120 ${HY}`, C.inkSoft, 2, 0.7);
      const shapes = [
        // Hattuşa: a gate between two towers
        { x: 420, name: P.a || 'Hattuşa', d: 'M-170 0L-170-240L-90-240L-90-160C-90-230 90-230 90-160L90-240L170-240L170 0L60 0L60-140C60-190-60-190-60-140L-60 0Z', win: [0, -120] },
        // Ugarit: a palace block with a stair and doorways
        { x: 960, name: P.b || 'Ugarit', d: 'M-210 0L-210-180L-60-180L-60-230L130-230L130-180L210-180L210 0Z', win: [-120, -90] },
        // Mycenae: the Lion Gate trilithon with its relief triangle
        { x: 1500, name: P.c || 'Miken', d: 'M-230 0L-230-250L230-250L230 0L56 0L50-150L-50-150L-56 0Z', win: [0, -60],
          // the Lion Gate: two jambs, a huge lintel, the relief triangle above it with two rearing lions at a column
          x2: 'M-72-150L72-150L72-176L-72-176ZM-62-176L0-248L62-176M0-182L0-236M-8-236L8-236M-14-186C-22-206-18-222-8-228M14-186C22-206 18-222 8-228M-120-250L-120-176M120-250L120-176M-230-90L-60-90M60-90L230-90M-150-176L-150-90M150-176L150-90' },
      ].map((s, i) => {
        const sg = el(g, 'g', { transform: `translate(${s.x} ${HY + 4})` });
        const glw = BTL.glow(svg, defs, s.x + s.win[0], HY + s.win[1], 210, C.gold, 0.28, g);
        const body = P0(sg, s.d, C.paperLight, 1);
        const line = L0(sg, s.d + (s.x2 || ''), C.inkSoft, 2.4);
        const lamp = el(sg, 'circle', { cx: s.win[0], cy: s.win[1], r: 10, fill: C.gold });
        const nm = ital(g, s.name, s.x, HY + 100, 48, { color: C.ink });
        return { sg, glw, body, line, lamp, nm, i };
      });
      return {
        update(lt, dur, cues) {
          st.update(lt);
          shapes.forEach(s => {
            fade(s.nm, BTL.ease(lt, 0.4 + s.i * 0.3, 1));
            const at = mode === 'fall' ? cue(cues, 'abc'[s.i], 0.8 + s.i * dur * 0.28) : 1e9;
            const q = BTL.ease(lt, at, 1.8), flick = 0.03 * Math.sin(lt * 1.7 + s.i * 2);
            s.glw.set((0.28 + flick) * (1 - q));
            s.lamp.setAttribute('fill-opacity', (1 - q).toFixed(3));
            s.body.setAttribute('fill-opacity', (1 - 0.6 * q).toFixed(3));
            s.line.setAttribute('stroke-opacity', (1 - 0.5 * q).toFixed(3));
          });
        },
      };
    },
  };
  // ------------------------------------------------------------------ a hand-drawn Eastern Mediterranean
  // coasts in [lon, lat], smoothed with a closed Catmull-Rom spline; big polygons close far outside any frame
  const COAST = [
    // Asia Minor + the Levant + North Africa, as one mass
    [[26.0, 40.6], [26.2, 40.05], [26.6, 39.6], [26.9, 39.45], [26.7, 39.05], [26.9, 38.75], [26.35, 38.62], [26.45, 38.3], [26.9, 38.42],
     [27.15, 38.05], [27.3, 37.75], [27.2, 37.38], [27.55, 37.2], [27.3, 37.02], [27.9, 36.98], [27.55, 36.72], [28.1, 36.78], [28.35, 36.82],
     [28.6, 36.72], [28.95, 36.68], [29.1, 36.62], [29.15, 36.45], [29.25, 36.33], [29.32, 36.27], [29.42, 36.26], [29.55, 36.22],
     [29.63, 36.19], [29.665, 36.155], [29.69, 36.14], [29.73, 36.165], [29.8, 36.19], [29.88, 36.205], [29.98, 36.22], [30.1, 36.27],
     [30.2, 36.3], [30.33, 36.28], [30.41, 36.21], [30.46, 36.3], [30.5, 36.45], [30.57, 36.6], [30.6, 36.75], [30.7, 36.88], [31.0, 36.85], [31.5, 36.68],
     [32.0, 36.52], [32.5, 36.15], [32.85, 36.04], [33.5, 36.15], [34.0, 36.3], [34.6, 36.78], [35.3, 36.6], [35.9, 36.85], [36.15, 36.6],
     [35.85, 36.3], [35.78, 35.75], [35.9, 35.25], [35.95, 34.6], [35.65, 34.1], [35.35, 33.55], [35.15, 33.05], [34.95, 32.5],
     [34.7, 31.85], [34.3, 31.35], [33.7, 31.12], [32.3, 31.25], [31.6, 31.5], [31.0, 31.58], [30.3, 31.42], [29.6, 31.05], [28.6, 30.92],
     [27.4, 31.35], [26.0, 31.55], [25.1, 31.68], [24.1, 32.05], [23.1, 32.6], [22.1, 32.9], [21.0, 32.8], [20.1, 32.2], [19.6, 31.2],
     [19.0, 30.4], [18.0, 30.2], [16.0, 26.0], [52.0, 26.0], [52.0, 44.0], [29.5, 44.0], [29.0, 41.2], [27.5, 40.95]],
    // Greece and the Balkans
    [[26.05, 40.75], [25.2, 40.95], [24.2, 40.8], [23.75, 40.25], [23.35, 40.2], [22.9, 40.55], [22.6, 40.05], [22.95, 39.4], [22.8, 39.0],
     [23.4, 38.6], [24.05, 38.2], [23.95, 37.75], [23.5, 37.95], [23.15, 37.65], [23.2, 37.3], [22.8, 36.95], [23.05, 36.45], [22.55, 36.75],
     [22.35, 36.45], [22.1, 36.9], [21.7, 36.82], [21.6, 37.45], [21.3, 37.8], [21.15, 38.3], [21.7, 38.35], [22.5, 38.12], [21.6, 38.5],
     [20.8, 38.85], [20.2, 39.6], [19.4, 40.4], [19.4, 41.9], [18.5, 43.5], [16.0, 46.0], [30.0, 46.0], [28.0, 42.4], [26.4, 41.3]],
    [[23.55, 35.3], [24.3, 35.36], [25.05, 35.42], [25.8, 35.32], [26.3, 35.28], [26.15, 35.0], [25.05, 34.98], [24.2, 35.15]],   // Crete
    [[32.3, 35.05], [32.9, 35.38], [33.6, 35.35], [34.6, 35.68], [34.05, 35.0], [33.6, 34.95], [33.0, 34.62], [32.42, 34.75]],     // Cyprus
    [[27.72, 36.12], [28.2, 36.45], [28.24, 36.2], [27.95, 35.9]],                                                                    // Rhodes
    [[29.81, 36.183], [29.86, 36.19], [29.91, 36.188], [29.88, 36.176], [29.83, 36.175]],                                                                  // Kekova island
  ];
  const spline = (pts, closed = true) => {
    const n = pts.length, P = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
    }
    return d + (closed ? 'Z' : '');
  };
  SH.bt_ul_map = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(svg, 'g'), [l0, b0, l1, b1] = P.bounds || [21, 30.5, 37, 39.5];
      const portrait = H > W, k = Math.cos((b0 + b1) / 2 * Math.PI / 180), aw = W - (portrait ? 120 : 200), ah = portrait ? 1000 : H - 260;
      const s = Math.min(aw / ((l1 - l0) * k), ah / (b1 - b0));
      const ox = W / 2 - (l1 - l0) * k * s / 2, oy = (portrait ? 640 : (H - 110) / 2) - (b1 - b0) * s / 2;
      const X = lon => ox + (lon - l0) * k * s, Y = lat => oy + (b1 - lat) * s;
      const landD = COAST.map(poly => spline(poly.map(p => [X(p[0]), Y(p[1])]))).join('');
      P0(g, landD, C.paperLight, 0.6);
      const coast = L0(g, landD, C.inkSoft, 2.2, 0.9);
      const regs = (P.regions || []).map(r => { const t = ital(g, r.text, X(r.lon), Y(r.lat), 46, { color: C.inkSoft }); t.setAttribute('letter-spacing', '0.12em'); return t; });
      const routes = (P.routes || []).map(r => {
        const e = L0(g, spline(r.path.map(p => [X(p[0]), Y(p[1])]), false), C.gold, 4, 1, { pathLength: 1 });
        if (r.dashed) e.setAttribute('stroke-opacity', 0.55);
        draw(e, 0); return { e, r };
      });
      const pts = (P.points || []).map(p => {
        const x = X(p.lon), y = Y(p.lat), pg = el(g, 'g', { opacity: 0 });
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 2.5 });
        el(pg, 'circle', { cx: x, cy: y, r: 9, fill: C.gold });
        const left = p.side ? p.side === 'left' : x > W * 0.7, ax = left ? x - 30 : x + 30, an = left ? 'end' : 'start', dy = p.dy || 0;
        const lab = label(pg, p.label || '', ax, y + 16 + dy, 56, { anchor: an, weight: 400 }); lab.setAttribute('opacity', 1);
        const sub = p.sub ? ital(pg, p.sub, ax, y + 66 + dy, 42, { anchor: an }) : null; if (sub) sub.setAttribute('opacity', 1);
        for (const t of [lab, sub]) if (t) { t.setAttribute('stroke', C.paper); t.setAttribute('stroke-width', 10); t.setAttribute('stroke-linejoin', 'round'); t.setAttribute('paint-order', 'stroke'); }
        return { p, pg, ring };
      });
      return {
        update(lt, dur, cues) {
          coast.setAttribute('stroke-opacity', (0.9 * BTL.ease(lt, 0, 1.2)).toFixed(3));
          regs.forEach(t => fade(t, BTL.ease(lt, 0.4, 1.4)));
          routes.forEach(({ e, r }) => draw(e, BTL.ease(lt, cue(cues, r.at, dur * 0.4), r.dur || 1.8)));
          pts.forEach((q, i) => {
            const at = cue(cues, q.p.at, 0.6 + i * 0.8);
            fade(q.pg, BTL.ease(lt, at - 0.3, 1));
            const ph = ((lt - at) % 2.6 + 2.6) % 2.6 / 2.6;
            q.ring.setAttribute('r', f1(14 + 26 * ph)); q.ring.setAttribute('stroke-opacity', f1((1 - ph) * 0.8));
          });
        },
      };
    },
  };
})();
