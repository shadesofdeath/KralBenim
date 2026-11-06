// bt_ertugrul: the Ottoman frigate Ertuğrul (Kii Ōshima, Japan, 16 September 1890) and the 1985 Tehran airlift,
// belgesel style (docs/BELGESEL.md). Clean still line art, slow natural motion only (waves, rain, a sweeping lamp
// beam, smoke, steam, a climbing aircraft). Every type is composed on a 1080x1920 vertical canvas (the Short); a wide
// frame shows it as a centred column. Death is never shown: the sea closes over a broken mast.
//   bt_er_light   P: {mode: "hook"|"climb"|"end", dy}  cues: hit   Kashinozaki: a short white lighthouse on a 40 m cliff
//                 over the sea at night, its beam sweeping slowly. hook: typhoon, rain, rough sea, a tiny frigate rolling
//                 on the horizon. climb: closer on the cliff face; small faceless survivors climb a path towards the light;
//                 on "hit" the lamp burns gold. end: a calm night with stars; the lamp sweeps, a small airliner's light
//                 crosses the sky high above; on "hit" its cabin windows turn gold
//   bt_er_date    P: {mode: "sea"|"city", text, sub, note}  cues: hit (city: the gold note, e.g. a deadline, appears)   a year in big thin type. sea: a stormy sea under rain.
//                 city: Tehran at night, the Azadi tower, the Alborz behind, city lights along the horizon
//   bt_er_ship    P: {}  cues: hit   the frigate side on in the typhoon (three masts, bare yards, one funnel, smoke),
//                 rolling slowly; black rocks in front; on "hit" she lurches onto the rocks and foam rises
//   bt_er_sea     P: {mode: "lost"|"calm"}  cues: hit   lost: a dark sea, only a broken mast still above water, slowly
//                 going down, rings spreading, a few planks drifting. calm: dawn, a flat sea, the sun rising on the horizon
//   bt_er_village P: {}  cues: hit   a fisherman's hut at night: a kneeling villager offers a steaming bowl to a seated
//                 sailor wrapped in a blanket under a hanging lamp; on "hit" the bowl's rim turns gold
//   bt_er_crowd   P: {n, label, still}  cues: hit   a waiting crowd of n tiny faceless figures; they light up gold, the number counts up
//   bt_er_plane   P: {mode: "climb"|"empty", count, label}  cues: hit   night runway (empty: no aircraft, the terminal
//                 with a row of waiting figures, a beacon sweeping; count: a number counts up above the climb), the Alborz behind; a three-engined airliner climbs away, a second one
//                 already far ahead; on "hit" its row of cabin windows turns gold
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => v.toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1) => el(parent, 'path', { d, fill, 'fill-opacity': a, stroke: 'none' });
  const L0 = (parent, d, stroke, w = 3, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra));
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  let UID = 0;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  const push = (g, lt, dur, cx, cy, amt = 0.04, base = 1) => {
    const z = base * (1 + amt * BTL.ease(lt, 0, Math.max(3, dur)));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${z.toFixed(4)}) translate(${-cx} ${-cy})`);
  };
  const bg = g => P0(g, 'M-300-200L1380-200L1380 2100L-300 2100Z', C.paper, 1);

  // ------------------------------------------------------------------ sea: dark water below y0, slow wave lines
  function sea(g, y0, seed, o = {}) {
    const r = rng(seed), amp = o.amp ?? 10, n = o.n ?? 9;
    P0(g, `M-300 ${y0}L1380 ${y0}L1380 2100L-300 2100Z`, o.fill || C.paperDark, 1);
    L0(g, `M-300 ${y0}L1380 ${y0}`, C.inkSoft, 2, o.calm ? 0.5 : 0.35);
    const lines = [];
    for (let i = 0; i < n; i++) {
      const u = (i + 1) / n, y = y0 + (o.depth ?? 900) * Math.pow(u, 1.7);
      lines.push({ e: L0(g, '', C.inkSoft, 1.4 + 2.2 * u, 0.22 + 0.3 * u), y, a: amp * (0.25 + 1.2 * u), wl: 60 + 140 * u, sp: (o.speed ?? 0.8) * (0.6 + r() * 0.5), ph: r() * TAU, ph2: r() * TAU });
    }
    return { update(lt) { for (const q of lines) {
      let d = '';
      for (let x = -300; x <= 1380; x += 30) {
        const y = q.y + q.a * Math.sin(x / q.wl + lt * q.sp + q.ph) + 0.45 * q.a * Math.sin(x / (q.wl * 0.43) - lt * q.sp * 1.3 + q.ph2);
        d += (x === -300 ? 'M' : 'L') + x + ' ' + f1(y);
      }
      q.e.setAttribute('d', d);
    } } };
  }
  // slanted rain falling at a steady, unhurried pace
  function rain(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ x: r(), y: r(), l: 26 + r() * 30, v: 0.18 + r() * 0.1 });
    const e = L0(g, '', C.inkSoft, o.w || 1.6, o.alpha ?? 0.4);
    const w = box[2] - box[0], h = box[3] - box[1], sx = -0.28;
    return { update(lt) {
      let d = '';
      for (const q of list) {
        const yy = box[1] + ((q.y + q.v * lt) % 1) * h, xx = box[0] + ((q.x * w + (yy - box[1]) * sx) % w + w) % w;
        d += `M${f1(xx)} ${f1(yy)}l${f1(q.l * sx)} ${f1(q.l)}`;
      }
      e.setAttribute('d', d);
    } };
  }
  // soft drifting puffs (smoke, spray)
  function puffs(g, seed, n, o) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), ph: i / n, rx: o.size * (0.7 + r() * 0.6) });
    return { update(lt, x0, y0, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.12)) % 1;
      const x = x0 + o.dx * u, y = y0 + o.dy * u, s = 0.5 + 1.1 * u;
      q.e.setAttribute('d', BTL.E(x, y, q.rx * s, q.rx * s * 0.6));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.2) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ the lighthouse (base at 0, lamp at -lampY)
  function lighthouse(parent, x, y, k, svg, defs) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y}) scale(${k})` });
    const wall = mix(C.paper, C.ink, 0.62);
    const body = 'M-46 0L-34-150L34-150L46 0Z';
    P0(g, body, wall, 1); L0(g, body, C.ink, 3, 1);
    L0(g, 'M-40-60L40-60M-37-110L37-110', C.paper, 2, 0.35);
    P0(g, 'M-8-40L8-40L8-14L-8-14Z', C.paper, 0.8);
    const gal = 'M-48-150L48-150L48-160L-48-160Z';
    P0(g, gal, C.paperLight, 1); L0(g, gal, C.ink, 2.5, 1);
    L0(g, 'M-44-160L-44-176M44-160L44-176M-44-176L44-176', C.ink, 2, 0.9);
    const lantern = 'M-26-160L-26-206L26-206L26-160Z';
    P0(g, lantern, C.paperLight, 1);
    const lamp = P0(g, BTL.E(0, -183, 15, 15), C.gold, 0.6);
    const core = P0(g, BTL.E(0, -183, 7, 7), C.ink, 0.9);
    L0(g, lantern + 'M-9-160L-9-206M9-160L9-206', C.ink, 2.5, 1);
    const roof = 'M-32-206C-24-232 24-232 32-206Z';
    P0(g, roof, wall, 1); L0(g, roof, C.ink, 2.5, 1);
    L0(g, 'M0-226L0-242', C.ink, 2.5, 1);
    return { g, lamp, core, lampY: -183 };
  }
  // a beam: a long soft wedge from the lamp, pointing left at angle 0, fading with distance
  function beam(parent, defs, x, y, len, spread, alpha) {
    const id = 'erb' + (++UID);
    const lg = el(defs, 'linearGradient', { id, x1: '1', y1: '0', x2: '0', y2: '0' });
    el(lg, 'stop', { offset: '0', 'stop-color': C.ink, 'stop-opacity': alpha });
    el(lg, 'stop', { offset: '0.5', 'stop-color': C.ink, 'stop-opacity': alpha * 0.35 });
    el(lg, 'stop', { offset: '1', 'stop-color': C.ink, 'stop-opacity': 0 });
    const g = el(parent, 'g');
    P0(g, `M${x} ${y - 4}L${x - len} ${y - spread}L${x - len} ${y + spread}L${x} ${y + 4}Z`, `url(#${id})`, 1);
    return { set(deg) { g.setAttribute('transform', `rotate(${deg.toFixed(2)} ${x} ${y})`); } };
  }

  // ------------------------------------------------------------------ the frigate (side on, bow left; waterline at 0)
  function frigate(parent, k, o = {}) {
    const g = el(parent, 'g', { transform: `scale(${k})` });
    const rim = o.far ? C.inkSoft : C.ink, lw = o.far ? 5 : 3;
    // masts, yards, rigging (behind the hull line)
    const masts = [[-210, -560], [10, -600], [230, -520]];
    let rig = `M-430-120L${masts[0][0]} ${masts[0][1]}`;
    for (const [mx, top] of masts) rig += `M${mx} ${top}L${mx - 120} -100M${mx} ${top}L${mx + 120} -100`;
    rig += `M${masts[0][0]} ${masts[0][1]}L${masts[1][0]} ${masts[1][1]}L${masts[2][0]} ${masts[2][1]}L410 -120`;
    if (!o.far) L0(g, rig, C.inkSoft, 1.4, 0.55);
    let sp = '';
    for (const [mx, top] of masts) {
      sp += `M${mx} -100L${mx} ${top}`;
      const h = -100 - top;
      for (const [f, w] of [[0.3, 130], [0.58, 105], [0.82, 75]]) { const yy = -100 - h * f; sp += `M${mx - w} ${f1(yy)}L${mx + w} ${f1(yy)}`; }
    }
    L0(g, sp, rim, lw * 1.2, 1);
    // furled sails along the yards
    if (!o.far) {
      let fs = '';
      for (const [mx, top] of masts) { const h = -100 - top; for (const [f, w] of [[0.3, 125], [0.58, 100], [0.82, 70]]) { const yy = -100 - h * f + 7; fs += `M${mx - w} ${f1(yy)}Q${mx} ${f1(yy + 12)} ${mx + w} ${f1(yy)}`; } }
      L0(g, fs, mix(C.paper, C.ink, 0.5), 5, 0.9);
    }
    // funnel between fore and main mast
    const fun = 'M-112-100L-112-230L-72-230L-72-100Z';
    P0(g, fun, mix(C.paper, C.ink, 0.15), 1); L0(g, fun, rim, lw, 1);
    // hull: bow (left) with bowsprit, rounded stern (right)
    const hull = 'M-440-120C-420-80-400-20-370 30L360 30C400 0 430-60 440-130L430-138C200-120-200-118-440-120Z';
    P0(g, hull, mix(C.paper, C.ink, 0.1), 1);
    const band = 'M-424-92C-200-88 200-90 432-100L436-74C200-64-200-62-410-66Z';
    P0(g, band, mix(C.paper, C.ink, o.far ? 0.3 : 0.55), 1);
    if (!o.far) { let gp = ''; for (let i = 0; i < 15; i++) { const xx = -360 + i * 50; gp += `M${xx} -88L${xx + 18} -88L${xx + 18} -72L${xx} -72Z`; } P0(g, gp, C.paperDark, 1); }
    L0(g, hull, rim, lw, 1);
    L0(g, 'M-440-120L-560-176', rim, lw * 1.2, 1);
    return { g, funnel: [-92, -230] };
  }

  // ------------------------------------------------------------------ a three-engined airliner, side on, nose right
  function airliner(parent, o = {}) {
    const g = el(parent, 'g');
    const body = mix(C.paper, C.ink, o.far ? 0.35 : 0.55), rim = C.ink;
    const fin = 'M-200-30L-250-170L-212-170L-150-30Z';
    P0(g, fin, body, 1); L0(g, fin, rim, 2.5, 1);
    const tailEng = 'M-262-118L-170-118C-160-118-160-90-170-90L-262-90Z';
    P0(g, tailEng, mix(C.paper, C.ink, 0.35), 1); L0(g, tailEng, rim, 2.5, 1);
    const fus = 'M-262-24C-240-34 160-32 220-28C262-26 280-8 276 4C270 18 240 26 200 26L-200 26C-236 24-262 10-262-24Z';
    P0(g, fus, body, 1); L0(g, fus, rim, 2.5, 1);
    const wing = 'M40 14L-110 64L-80 64L90 18Z';
    P0(g, wing, mix(C.paper, C.ink, 0.35), 1); L0(g, wing, rim, 2.5, 1);
    const eng = 'M-30 34L44 34C54 34 54 56 44 56L-30 56Z';
    P0(g, eng, mix(C.paper, C.ink, 0.3), 1); L0(g, eng, rim, 2.5, 1);
    L0(g, 'M-250-6L-180-14', rim, 2, 0.8);
    L0(g, 'M236-14L256-10', C.paper, 4, 0.9);
    let wd = ''; for (let i = 0; i < 22; i++) { const xx = -170 + i * 17; wd += `M${xx} -8L${xx + 6} -8`; }
    const win = L0(g, wd, C.paper, 5, 0.85);
    const winGold = L0(g, wd, C.gold, 5, 0);
    const nav = P0(g, BTL.E(-250, -172, 6, 6), C.gold, 0);
    return { g, win, winGold, nav };
  }

  // ------------------------------------------------------------------ the cliff and lighthouse place (shared)
  function cape(g, svg, defs, o) {
    const HY = o.HY, top = o.top;
    // cliff: plateau on the right, steep face falling left to the sea
    const face = `M1380 ${top - 20}L760 ${top - 6}L700 ${top + 4}C660 ${top + 60} 640 ${top + 130} 610 ${top + 190}C570 ${top + 260} 560 ${top + 330} 520 ${top + 400}` +
      `C490 ${top + 450} 470 ${HY - 10} 430 ${HY + 30}L400 ${HY + 60}L1380 ${HY + 60}Z`;
    P0(g, face, C.paperLight, 1);
    let strata = '';
    for (let i = 1; i <= 5; i++) { const yy = top + i * 70; strata += `M${700 - i * 30} ${yy}C${800 - i * 10} ${yy - 8} 1000 ${yy + 10} 1380 ${yy - 6}`; }
    L0(g, strata, C.inkSoft, 1.6, 0.3);
    L0(g, face.replace(/L1380 [\d.]+Z$/, ''), C.ink, 3, 0.9);
    // rocks at its foot
    const rocks = `M300 ${HY + 70}L340 ${HY + 20}L380 ${HY + 40}L410 ${HY + 6}L450 ${HY + 50}L470 ${HY + 110}L290 ${HY + 120}Z`;
    P0(g, rocks, C.paperLight, 1); L0(g, rocks, C.ink, 2.5, 0.85);
    return { face };
  }

  // ------------------------------------------------------------------ bt_er_light
  SH.bt_er_light = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', g0 = canvas(svg, W, H), gp = el(g0, 'g');
      bg(gp);
      // P.dy lowers the whole place (the hook/cover frame keeps the top free for the cover title)
      const g = el(gp, 'g', { transform: `translate(0 ${P.dy || 0})` });
      const storm = mode !== 'end';
      const HY = 1000, top = 640, LX = 860, LB = top - 14, K = 1.05;
      const st = mode === 'end' ? BTL.stars(g, 120, 9, [-100, 0, 1180, HY - 40]) : null;
      const sky = BTL.glow(svg, defs, LX, LB - 190 * K, 520, C.stain, storm ? 0.22 : 0.18, g);
      // the frigate far out on the horizon (hook only)
      let far = null;
      if (mode === 'hook') { far = el(g, 'g'); frigate(far, 0.32, { far: true }); }
      const s = sea(g, HY, 4, { amp: mode === 'hook' ? 24 : storm ? 14 : 4, speed: mode === 'hook' ? 1.5 : storm ? 1.1 : 0.45, calm: !storm, n: mode === 'hook' ? 12 : 9 });
      const bm = beam(g, defs, LX, LB - 183 * K, 1300, mode === 'hook' ? 150 : storm ? 120 : 90, mode === 'hook' ? 0.4 : storm ? 0.3 : 0.24);
      cape(g, svg, defs, { HY, top });
      const L = lighthouse(g, LX, LB, K, svg, defs);
      const lampG = BTL.glow(svg, defs, LX, LB - 183 * K, 120, C.gold, 0.5, g);
      const fs = sea(g, HY + 60, 6, { amp: mode === 'hook' ? 26 : storm ? 14 : 4, speed: storm ? 1.1 : 0.45, n: 8, depth: 860 });
      // foam: thin white lines washing against the rocks
      const foam = [0, 1, 2].map(i => L0(g, '', C.ink, 2.2, 0));
      // climbers on the face (climb)
      const path = [[300, HY + 80], [430, HY + 30], [520, top + 400], [560, top + 300], [600, top + 200], [650, top + 90], [710, top + 6], [800, top - 4]];
      const climbers = [];
      if (mode === 'climb') {
        L0(g, 'M' + path.map(p => p.join(' ')).join('L'), C.inkSoft, 2, 0.35, { 'stroke-dasharray': '6 10' });
        for (let i = 0; i < 6; i++) { const pg = el(g, 'g'); climbers.push({ pg, u0: 0.16 + i * 0.12, pose: i % 2 ? 'bend' : 'stand' }); }
      }
      const plane = mode === 'end' ? airliner(el(g, 'g'), { far: true }) : null;
      const rn = storm ? rain(g, 11, mode === 'hook' ? 160 : 70, [-200, -100, 1300, 1920], { alpha: mode === 'hook' ? 0.5 : 0.25 }) : null;
      const segs = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1])), tot = segs.reduce((a, b) => a + b, 0);
      const along = u => { let d = u * tot; for (let i = 0; i < segs.length; i++) { if (d <= segs[i]) { const t = d / segs[i]; return [path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t]; } d -= segs[i]; } return path[path.length - 1]; };
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.55);
          if (mode === 'climb') push(gp, lt, dur, 640, 900, 0.04, 1.3); else push(gp, lt, dur, 640, 760, 0.035);
          s.update(lt); fs.update(lt); if (rn) rn.update(lt); if (st) st.update(lt);
          // the beam sweeps slowly to and fro over the sea
          const ang = mode === 'hook' ? -15 + 14 * Math.sin(lt * 1.3) : mode === 'climb' ? -4 + 6 * Math.sin(lt * 0.45) : -6 + 12 * Math.sin(lt * 0.35);
          bm.set(ang);
          sky.set((storm ? 0.22 : 0.18) + 0.03 * Math.sin(lt * 0.8));
          const gold = mode === 'climb' ? BTL.ease(lt, hit - 0.1, 1) : mode === 'hook' ? 0.8 : 0.5;
          lampG.set(0.35 + 0.35 * gold + 0.05 * Math.sin(lt * 1.3));
          L.lamp.setAttribute('fill-opacity', (0.5 + 0.5 * gold).toFixed(3));
          foam.forEach((e, i) => { const u = (lt * (storm ? 0.5 : 0.25) + i / 3) % 1, y = HY + 50 - 40 * Math.sin(Math.PI * u), w = 60 + 120 * u;
            e.setAttribute('d', `M${f1(380 - w)} ${f1(y + 20)}Q380 ${f1(y - 16)} ${f1(470 + w * 0.4)} ${f1(y + 24)}`); e.setAttribute('stroke-opacity', ((storm ? 0.55 : 0.25) * Math.sin(Math.PI * u)).toFixed(3)); });
          if (far) {
            const roll = 8 * Math.sin(lt * 0.9), bob = 12 * Math.sin(lt * 1.1 + 1);
            far.setAttribute('transform', `translate(${f1(220 + 14 * lt)} ${f1(HY + 8 + bob)}) rotate(${f1(roll)})`);
          }
          for (const c of climbers) {
            const u = Math.min(0.97, c.u0 + 0.035 * lt), [x, y] = along(u);
            c.pg.setAttribute('transform', `translate(${f1(x)} ${f1(y)})`);
            if (!c.pg.firstChild) BTL.person(c.pg, c.pose, 0, 0, 58, { face: 1, color: mix(C.paper, C.ink, 0.6), rim: C.ink });
          }
          if (plane) {
            const x = 120 + 55 * lt, y = 330 - 6 * lt;
            plane.g.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(0.42) rotate(-3)`);
            plane.nav.setAttribute('fill-opacity', (0.5 + 0.5 * Math.sin(lt * 2.2)).toFixed(3));
            plane.winGold.setAttribute('stroke-opacity', (0.95 * BTL.ease(lt, hit - 0.1, 1)).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_er_date
  SH.bt_er_date = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'sea', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const yr = txt(g, P.text || '1890', 540, mode === 'city' ? 330 : 600, 230, { weight: 300 });
      const sub = txt(g, P.sub || '', 540, mode === 'city' ? 420 : 700, 64, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      const rule = el(g, 'path', { d: `M400 ${mode === 'city' ? 460 : 745}L680 ${mode === 'city' ? 460 : 745}`, stroke: C.gold, 'stroke-width': 2.5, fill: 'none', pathLength: 1 });
      draw(rule, 0);
      if (mode === 'city') {
        const HY = 1110;
        const st = BTL.stars(g, 90, 21, [-100, 0, 1180, 760]);
        const sky = BTL.glow(svg, defs, 540, HY - 120, 640, C.stain, 0.22, g);
        // searchlights sweeping the night sky: the war
        const sl = [beam(g, defs, 160, HY - 10, 1100, 60, 0.16), beam(g, defs, 920, HY - 10, 1100, 60, 0.16)];
        // the Alborz far behind
        const mt = `M-300 ${HY}L-100 ${HY - 150}L60 ${HY - 90}L240 ${HY - 230}L420 ${HY - 130}L560 ${HY - 260}L760 ${HY - 120}L900 ${HY - 200}L1100 ${HY - 90}L1380 ${HY - 170}L1380 ${HY}Z`;
        P0(g, mt, C.paperLight, 0.8); L0(g, mt.replace(/L1380 \d+Z$/, ''), C.inkSoft, 2, 0.5);
        P0(g, `M-300 ${HY}L1380 ${HY}L1380 2100L-300 2100Z`, C.paperDark, 1);
        L0(g, `M-300 ${HY}L1380 ${HY}`, C.inkSoft, 2, 0.6);
        // city lights in rows along the horizon
        const r = rng(1985); let dl = '';
        for (let i = 0; i < 160; i++) { const x = -60 + r() * 1200, y = HY + 8 + Math.pow(r(), 1.6) * 56; const s = 1.5 + r() * 2; dl += `M${f1(x - s)} ${f1(y)}a${f1(s)} ${f1(s)} 0 1 0 ${f1(2 * s)} 0a${f1(s)} ${f1(s)} 0 1 0 ${f1(-2 * s)} 0`; }
        const lights = P0(g, dl, C.gold, 0.55);
        let rd = ''; for (const y of [HY + 260, HY + 420, HY + 620]) rd += `M-300 ${y}C200 ${y - 10} 800 ${y + 10} 1380 ${y - 6}`;
        L0(g, rd, C.inkSoft, 1.6, 0.2);
        // the Azadi tower: the inverted Y on four legs, the top block
        const T = el(g, 'g', { transform: `translate(540 ${HY}) scale(0.95)` });
        const tw = 'M-210 0C-180-120-120-290-66-420L-56-500L56-500L66-420C120-290 180-120 210 0L136 0C116-112 64-196 0-252C-64-196-116-112-136 0Z';
        P0(T, tw, mix(C.paper, C.ink, 0.42), 1); L0(T, tw, C.ink, 3, 1);
        L0(T, 'M-56-500L-48-520L48-520L56-500M-34-460L-28-420L28-420L34-460M-10-520L-10-500M10-520L10-500', C.ink, 2.2, 0.9);
        L0(T, 'M-150-60C-110-180-70-300-40-420M150-60C110-180 70-300 40-420', C.paper, 2, 0.4);
        const pool = BTL.glow(svg, defs, 540, HY - 200, 300, C.gold, 0.12, g);
        const note = P.note ? txt(g, P.note, 540, 545, 60, { font: LO, italic: true, color: C.gold, weight: 400 }) : null;
        return {
          update(lt, dur, cues) {
            if (note) fade(note, BTL.ease(lt, cue(cues, 'hit', dur * 0.5) - 0.1, 0.8));
            push(g, lt, dur, 540, 900, 0.035);
            st.update(lt); sky.set(0.22 + 0.03 * Math.sin(lt * 0.7));
            sl[0].set(118 + 16 * Math.sin(lt * 0.5)); sl[1].set(62 - 16 * Math.sin(lt * 0.45 + 1));
            lights.setAttribute('fill-opacity', (0.5 + 0.08 * Math.sin(lt * 0.9)).toFixed(3));
            pool.set(0.12 + 0.03 * Math.sin(lt * 1.1));
            fade(yr, BTL.ease(lt, 0.05, 1.1)); fade(sub, BTL.ease(lt, 0.5, 1.1)); draw(rule, BTL.ease(lt, 0.7, 1.2));
          },
        };
      }
      const HY = 1000;
      const sky = BTL.glow(svg, defs, 540, 640, 620, C.stain, 0.16, g);
      const s = sea(g, HY, 8, { amp: 16, speed: 1.1, n: 11 });
      const rn = rain(g, 5, 110, [-200, -100, 1300, 1920], { alpha: 0.32 });
      return {
        update(lt, dur) {
          push(g, lt, dur, 540, 760, 0.035);
          s.update(lt); rn.update(lt); sky.set(0.16 + 0.03 * Math.sin(lt * 0.8));
          fade(yr, BTL.ease(lt, 0.05, 1.1)); fade(sub, BTL.ease(lt, 0.5, 1.1)); draw(rule, BTL.ease(lt, 0.7, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_er_ship
  SH.bt_er_ship = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const WY = 1060;
      const sky = BTL.glow(svg, defs, 520, 640, 640, C.stain, 0.2, g);
      const back = sea(g, WY - 70, 14, { amp: 12, speed: 1, n: 4, depth: 70 });
      const ship = el(g, 'g');
      const F = frigate(ship, 0.86);
      const smoke = puffs(g, 41, 7, { size: 34, dx: -300, dy: -120, rate: 0.16, alpha: 0.2, color: C.inkSoft });
      // rocks in front, right
      const rk = `M850 ${WY + 40}L870 ${WY - 4}L905 ${WY + 6}L945 ${WY - 60}L990 ${WY - 24}L1035 ${WY - 96}L1090 ${WY - 36}L1140 ${WY - 74}L1200 ${WY - 14}L1200 ${WY + 60}Z`;
      P0(g, rk, C.paperLight, 1); L0(g, rk.replace(/L1200 [\d.]+Z$/, ''), C.ink, 3, 1);
      L0(g, `M960 ${WY - 30}L985 ${WY + 10}M1050 ${WY - 70}L1075 ${WY - 20}M1150 ${WY - 50}L1165 ${WY}`, C.inkSoft, 2, 0.6);
      const front = sea(g, WY + 20, 15, { amp: 14, speed: 1.15, n: 10, depth: 840 });
      const contact = L0(g, `M820 ${WY - 2}C840 ${WY - 20} 868 ${WY - 20} 890 ${WY - 4}`, C.gold, 4, 0);
      const spray = [0, 1, 2, 3].map(() => L0(g, '', C.ink, 2.4, 0));
      const rn = rain(g, 3, 110, [-200, -100, 1300, 1920], { alpha: 0.32 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.55);
          push(g, lt, dur, 540, 860, 0.035);
          sky.set(0.2 + 0.03 * Math.sin(lt * 0.7));
          back.update(lt); front.update(lt); rn.update(lt);
          const lurch = BTL.ease(lt, hit - 0.2, 1.4);
          const roll = 3.5 * Math.sin(lt * 0.8) * (1 - 0.6 * lurch) + 9 * lurch, bob = 8 * Math.sin(lt * 1.0 + 1) * (1 - lurch);
          const x = 360 + 8 * lt + 70 * lurch, y = WY + bob + 16 * lurch;
          contact.setAttribute('stroke-opacity', (0.9 * lurch).toFixed(3));
          ship.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) rotate(${f1(roll)})`);
          const a = roll * Math.PI / 180, fx = F.funnel[0] * 0.86, fy = F.funnel[1] * 0.86;
          smoke.update(lt, x + fx * Math.cos(a) - fy * Math.sin(a), y + fx * Math.sin(a) + fy * Math.cos(a));
          spray.forEach((e, i) => { const u = (lt * 0.55 + i / 4) % 1, h = (60 + 160 * lurch) * Math.sin(Math.PI * u), x0 = 880 + i * 70;
            e.setAttribute('d', `M${f1(x0 - 50)} ${WY - 40}C${f1(x0 - 40)} ${f1(WY - 40 - h)} ${f1(x0 + 40)} ${f1(WY - 40 - h)} ${f1(x0 + 60)} ${WY - 30}`);
            e.setAttribute('stroke-opacity', ((0.25 + 0.5 * lurch) * Math.sin(Math.PI * u)).toFixed(3)); });
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_er_sea
  SH.bt_er_sea = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'lost', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      if (mode === 'calm') {
        const HY = 980;
        const sky = BTL.glow(svg, defs, 540, HY - 40, 760, C.stain, 0.3, g);
        const sun = P0(g, '', C.gold, 0.7);
        const s = sea(g, HY, 22, { amp: 3, speed: 0.4, calm: true });
        const r = rng(7), refl = [];
        for (let i = 0; i < 14; i++) { const y = HY + 20 + i * i * 4.5, w = 40 + r() * 80 + i * 8; refl.push({ e: L0(g, `M${f1(540 - w / 2)} ${f1(y)}L${f1(540 + w / 2)} ${f1(y)}`, C.gold, 3, 0), ph: r() * TAU }); }
        return {
          update(lt, dur) {
            push(g, lt, dur, 540, HY, 0.035);
            const p = BTL.ease(lt, 0, Math.max(3, dur));
            sun.setAttribute('d', `M410 ${HY}A130 130 0 0 1 670 ${HY}Z`);
            sun.setAttribute('transform', `translate(0 ${f1(40 - 50 * p)})`);
            sky.set(0.26 + 0.08 * p);
            s.update(lt);
            for (const q of refl) q.e.setAttribute('stroke-opacity', (0.35 + 0.25 * Math.sin(lt * 1.1 + q.ph)).toFixed(3));
          },
        };
      }
      const HY = 760;
      const sky = BTL.glow(svg, defs, 540, 900, 600, C.stain, 0.16, g);
      const s = sea(g, HY, 27, { amp: 10, speed: 0.8, n: 11, depth: 1100 });
      const MX = 540, MY = 1060;
      const rings = [0, 1, 2].map(() => L0(g, '', C.inkSoft, 2.2, 0));
      const mast = el(g, 'g');
      const mg = el(mast, 'g', { transform: 'rotate(-14)' });
      L0(mg, 'M0 60L0-420', C.ink, 9, 1);
      L0(mg, 'M-120-300L130-310', C.ink, 6, 1);
      L0(mg, 'M-90-170L100-176', C.ink, 5, 1);
      L0(mg, 'M0-420L-10-436L4-450', C.ink, 6, 1);
      L0(mg, 'M-120-300C-130-240-110-180-150-120M130-310C150-250 120-200 160-140M0-420L-90-170', C.inkSoft, 2, 0.7);
      // the water in front hides the foot of the mast
      const water = P0(g, '', C.paperDark, 1);
      const r = rng(5), planks = [];
      for (let i = 0; i < 4; i++) planks.push({ e: el(g, 'g'), x: 160 + i * 230 + r() * 60, y: 1380 + r() * 240, rot: r() * 60 - 30, ph: r() * TAU });
      for (const p of planks) { P0(p.e, 'M-46-7L46-7L46 7L-46 7Z', mix(C.paper, C.ink, 0.25), 1); L0(p.e, 'M-46-7L46-7L46 7L-46 7Z', C.ink, 2, 0.8); }
      const rn = rain(g, 9, 70, [-200, -100, 1300, 1920], { alpha: 0.22 });
      return {
        update(lt, dur, cues) {
          push(g, lt, dur, 540, 900, 0.04);
          sky.set(0.16 + 0.03 * Math.sin(lt * 0.7));
          s.update(lt); rn.update(lt);
          const sink = 160 * BTL.ease(lt, 0.2, Math.max(3, dur + 1));
          mast.setAttribute('transform', `translate(${MX} ${f1(MY + sink + 6 * Math.sin(lt * 0.9))}) rotate(${f1(2 * Math.sin(lt * 0.7))})`);
          let d = `M-300 ${MY}`;
          for (let x = -300; x <= 1380; x += 30) d += `L${x} ${f1(MY + 8 * Math.sin(x / 90 + lt * 0.9) + 4 * Math.sin(x / 37 - lt * 1.2))}`;
          water.setAttribute('d', d + 'L1380 1500L-300 1500Z');
          rings.forEach((e, i) => { const u = (lt * 0.25 + i / 3) % 1; e.setAttribute('d', BTL.E(MX, MY + 4, 60 + 360 * u, (60 + 360 * u) * 0.14)); e.setAttribute('stroke-opacity', (0.5 * (1 - u)).toFixed(3)); });
          for (const p of planks) p.e.setAttribute('transform', `translate(${f1(p.x + 8 * lt)} ${f1(p.y + 6 * Math.sin(lt * 1.1 + p.ph))}) rotate(${f1(p.rot + 4 * Math.sin(lt * 0.8 + p.ph))})`);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_er_village
  SH.bt_er_village = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const FY = 1150;
      // back wall of boards, a paper window with rain beyond, the floor
      P0(g, `M-300 260L1380 260L1380 ${FY}L-300 ${FY}Z`, C.paperLight, 0.55);
      let bd = ''; for (let x = -60; x <= 1140; x += 90) bd += `M${x} 260L${x} ${FY}`;
      L0(g, bd, C.inkSoft, 1.6, 0.25);
      L0(g, `M-300 260L1380 260`, C.inkSoft, 3, 0.5);
      const win = 'M90 380L380 380L380 700L90 700Z';
      P0(g, win, C.paper, 1);
      const wg = el(g, 'g', { 'clip-path': `url(#erwin${++UID})` });
      const cp = el(defs, 'clipPath', { id: 'erwin' + UID }); el(cp, 'path', { d: win });
      const rn = rain(wg, 13, 40, [80, 360, 400, 720], { alpha: 0.45, w: 1.8 });
      L0(g, win + 'M235 380L235 700M90 487L380 487M90 594L380 594', C.ink, 3, 0.85);
      P0(g, `M-300 ${FY}L1380 ${FY}L1380 2100L-300 2100Z`, C.paperDark, 1);
      let fl = ''; for (const y of [FY + 120, FY + 300, FY + 560]) fl += `M-300 ${y}L1380 ${y}`;
      for (let x = -200; x <= 1300; x += 260) fl += `M540 ${FY}L${x} 2100`;
      L0(g, fl, C.inkSoft, 1.6, 0.2);
      L0(g, `M-300 ${FY}L1380 ${FY}`, C.ink, 2.5, 0.6);
      // the hanging oil lamp and its light
      const LX = 560, LY = 470;
      const pool = BTL.glow(svg, defs, LX, LY + 300, 640, C.stain, 0.26, g);
      L0(g, `M${LX} 260L${LX} ${LY - 46}`, C.inkSoft, 2, 0.8);
      const lampBox = `M${LX - 34} ${LY - 46}L${LX + 34} ${LY - 46}L${LX + 28} ${LY + 40}L${LX - 28} ${LY + 40}Z`;
      const lglow = BTL.glow(svg, defs, LX, LY, 110, C.gold, 0.45, g);
      P0(g, lampBox, C.paperLight, 0.5);
      const flame = P0(g, '', C.gold, 0.95);
      L0(g, lampBox + `M${LX - 40} ${LY - 46}L${LX + 40} ${LY - 46}M${LX - 34} ${LY + 40}L${LX + 34} ${LY + 40}`, C.ink, 3, 1);
      // the sailor, seated, a blanket round his shoulders (left, facing right); the villager kneeling (right, facing left)
      const fc = mix(C.paper, C.ink, 0.55);
      P0(g, BTL.E(560, FY + 6, 400, 18), C.ink, 0.12);
      BTL.person(g, 'sit', 330, FY, 470, { face: 1, color: fc, rim: C.ink });
      const blanket = 'M262 858C236 900 226 990 236 1080C280 1090 340 1088 372 1076C380 990 370 900 352 860C326 836 288 836 262 858Z';
      P0(g, blanket, mix(C.paper, C.ink, 0.3), 1); L0(g, blanket, C.ink, 3, 1);
      L0(g, 'M270 900C300 930 340 936 362 920M246 990C284 1010 340 1010 374 996', C.inkSoft, 2, 0.6);
      // the villager kneels upright (seiza), facing left, both arms held out with the bowl
      const VK = { head: [800, 826], sh: [808, 884], hip: [842, 1076], knee: [736, 1124], foot: [870, 1146], el: [756, 956], hand: [670, 950] };
      const seg = (pts, w) => { const d = 'M' + pts.map(k => VK[k].join(' ')).join('L');
        L0(g, d, C.ink, w + 3, 0.8); L0(g, d, fc, w, 1); };
      seg(['hip', 'knee', 'foot'], 26); seg(['sh', 'hip'], 56); seg(['sh', 'el', 'hand'], 20);
      P0(g, BTL.E(VK.head[0], VK.head[1], 38, 38), C.ink, 0.8); P0(g, BTL.E(VK.head[0], VK.head[1], 36, 36), fc, 1);
      const BX = 600, BY = 940;
      const bowl = `M${BX - 62} ${BY}C${BX - 56} ${BY + 50} ${BX + 56} ${BY + 50} ${BX + 62} ${BY}Z`;
      P0(g, bowl, C.paperLight, 1); L0(g, bowl, C.ink, 3, 1);
      const rimE = BTL.E(BX, BY, 62, 12);
      P0(g, rimE, C.paper, 1); const rimL = L0(g, rimE, C.ink, 3, 1);
      const rimGold = L0(g, rimE, C.gold, 5, 0);
      const steam = [0, 1, 2].map(() => L0(g, '', C.ink, 2.5, 0));
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.6);
          push(g, lt, dur, 560, 860, 0.04);
          rn.update(lt);
          const fl2 = Math.sin(lt * 2.1) * 0.5 + Math.sin(lt * 3.3 + 1) * 0.3;
          flame.setAttribute('d', `M${LX} ${f1(LY - 30 - 4 * fl2)}C${f1(LX + 12)} ${LY - 10} ${LX + 12} ${LY + 14} ${LX} ${LY + 18}C${LX - 12} ${LY + 14} ${f1(LX - 12)} ${LY - 10} ${LX} ${f1(LY - 30 - 4 * fl2)}Z`);
          lglow.set(0.42 + 0.06 * fl2); pool.set(0.26 + 0.03 * fl2);
          steam.forEach((e, i) => {
            const u = (lt * 0.35 + i / 3) % 1, x0 = BX - 30 + i * 30, y0 = BY - 20 - 150 * u;
            e.setAttribute('d', `M${f1(x0)} ${f1(y0)}c${f1(14 * Math.sin(lt + i))} -30 ${f1(-14 * Math.sin(lt + i))} -50 0 -80`);
            e.setAttribute('stroke-opacity', (0.55 * Math.sin(Math.PI * u)).toFixed(3));
          });
          const q = BTL.ease(lt, hit - 0.1, 1);
          rimGold.setAttribute('stroke-opacity', (0.95 * q).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_er_plane
  SH.bt_er_plane = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const HY = 1150;
      const st = BTL.stars(g, 90, 33, [-100, 0, 1180, 900]);
      const sky = BTL.glow(svg, defs, 540, HY - 100, 700, C.stain, 0.2, g);
      const mt = `M-300 ${HY}L-60 ${HY - 170}L120 ${HY - 110}L300 ${HY - 250}L480 ${HY - 140}L640 ${HY - 280}L820 ${HY - 150}L980 ${HY - 220}L1380 ${HY - 100}L1380 ${HY}Z`;
      P0(g, mt, C.paperLight, 0.8); L0(g, mt.replace(/L1380 \d+Z$/, ''), C.inkSoft, 2, 0.5);
      P0(g, `M-300 ${HY}L1380 ${HY}L1380 2100L-300 2100Z`, C.paperDark, 1);
      L0(g, `M-300 ${HY}L1380 ${HY}`, C.inkSoft, 2, 0.6);
      // the runway in perspective, edge lights
      L0(g, `M500 ${HY}L80 1920M580 ${HY}L1000 1920`, C.inkSoft, 2.5, 0.6);
      let cl = ''; for (let i = 0; i < 9; i++) { const u0 = Math.pow(i / 9, 1.8), u1 = Math.pow((i + 0.5) / 9, 1.8); cl += `M540 ${f1(HY + u0 * 770)}L540 ${f1(HY + u1 * 770)}`; }
      L0(g, cl, C.inkSoft, 3, 0.5);
      let dl = '';
      for (let i = 0; i < 14; i++) { const u = Math.pow(i / 14, 1.7), y = HY + u * 770, s = 2 + 6 * u; for (const sd of [-1, 1]) { const x = 540 + sd * (40 + 420 * u) + (sd < 0 ? 0 : 0); dl += `M${f1(x - s)} ${f1(y)}a${f1(s)} ${f1(s)} 0 1 0 ${f1(2 * s)} 0a${f1(s)} ${f1(s)} 0 1 0 ${f1(-2 * s)} 0`; } }
      const lights = P0(g, dl, C.gold, 0.7);
      const empty = P.mode === 'empty';
      let beacon = null, crowd = null;
      if (empty) {
        // the terminal on the left of the field: lit windows, a long row of waiting figures in front
        const tg = el(g, 'g', { transform: `translate(-60 ${HY}) scale(1.9) translate(0 ${-HY})` });
        const tb = `M-300 ${HY}L-300 ${HY - 120}L330 ${HY - 120}L360 ${HY - 90}L360 ${HY}Z`;
        P0(tg, tb, C.paperLight, 1); L0(tg, tb, C.inkSoft, 2.5, 0.9);
        let wn = ''; for (let x = -20; x < 330; x += 34) wn += `M${x} ${HY - 92}L${x + 20} ${HY - 92}L${x + 20} ${HY - 62}L${x} ${HY - 62}Z`;
        P0(tg, wn, C.gold, 0.45);
        L0(tg, `M300 ${HY - 120}L300 ${HY - 250}`, C.inkSoft, 3, 0.9);
        P0(tg, `M282 ${HY - 250}L318 ${HY - 250}L314 ${HY - 278}L286 ${HY - 278}Z`, C.paperLight, 1);
        beacon = beam(tg, defs, 300, HY - 264, 1000, 56, 0.3);
        let fg = ''; const rr = rng(48);
        for (let i = 0; i < 46; i++) { const x = -20 + i * 8 + rr() * 4, h = 26 + rr() * 8, y = HY - 2;
          fg += `M${f1(x - 3)} ${f1(y)}L${f1(x - 3)} ${f1(y - h * 0.7)}L${f1(x + 3)} ${f1(y - h * 0.7)}L${f1(x + 3)} ${f1(y)}Z` + BTL.E(x, y - h * 0.82, 3.4, 3.4); }
        crowd = P0(tg, fg, mix(C.paper, C.ink, 0.6), 1);
      }
      const far = empty ? null : airliner(el(g, 'g'), { far: true });
      const pl = empty ? null : airliner(el(g, 'g'));
      const num = P.count ? txt(g, '0', 540, 420, 230, { weight: 300, color: C.gold }) : null;
      const lab = P.count && P.label ? txt(g, P.label, 540, 520, 64, { font: LO, italic: true, color: C.ink, weight: 400 }) : null;
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.55);
          push(g, lt, dur, 540, 900, 0.035);
          st.update(lt); sky.set(0.2 + 0.03 * Math.sin(lt * 0.7));
          lights.setAttribute('fill-opacity', (0.6 + 0.15 * Math.sin(lt * 1.4)).toFixed(3));
          const p = lt / Math.max(3, dur);
          if (num) { num.textContent = String(Math.round(P.count * BTL.ease(lt, 0.1, Math.min(dur - 0.6, 1.8)))); fade(num, BTL.ease(lt, 0, 0.5)); fade(lab, BTL.ease(lt, 0.3, 0.8)); }
          if (empty) { beacon.set(-25 + 55 * Math.sin(lt * 1.0)); return; }
          pl.g.setAttribute('transform', `translate(${f1(330 + 150 * p)} ${f1(820 - 110 * p)}) scale(1.2) rotate(-11)`);
          far.g.setAttribute('transform', `translate(${f1(880 + 30 * p)} ${f1(600 - 20 * p)}) scale(0.32) rotate(-8)`);
          far.nav.setAttribute('fill-opacity', (0.5 + 0.5 * Math.sin(lt * 2.4)).toFixed(3));
          pl.nav.setAttribute('fill-opacity', (0.5 + 0.5 * Math.sin(lt * 2.4 + 1.5)).toFixed(3));
          pl.winGold.setAttribute('stroke-opacity', (0.95 * BTL.ease(lt, hit - 0.1, 1)).toFixed(3));
        },
      };
    },
  };
  // ------------------------------------------------------------------ bt_er_crowd
  // bt_er_crowd  P: {n: 215, label: "Japon"}  cues: hit   a waiting crowd of n tiny faceless figures under a hall light,
  //              rows in perspective; from "hit" they light up gold row by row and the number counts up above them
  SH.bt_er_crowd = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const n = P.n || 215;
      const pool = BTL.glow(svg, defs, 540, 900, 620, C.stain, 0.24, g);
      P0(g, 'M-300 1150L1380 1150L1380 2100L-300 2100Z', C.paperDark, 1);
      L0(g, 'M-300 1150L1380 1150', C.inkSoft, 2, 0.5);
      // rows from back (small) to front (big); every figure = head + shoulders
      const rows = [], r = rng(215);
      let left = n, ri = 0;
      while (left > 0) {
        const u = ri / 9, y = 780 + 370 * Math.pow(u, 1.25), s = 0.5 + 0.9 * u, cols = Math.min(left, Math.round(30 - 12 * u));
        let d = '';
        for (let i = 0; i < cols; i++) {
          const x = 540 + (i - (cols - 1) / 2) * (1040 / 30) * (0.7 + 0.7 * u) + (r() - 0.5) * 10 * s, yy = y + (r() - 0.5) * 8 * s;
          d += `M${f1(x - 15 * s)} ${f1(yy)}C${f1(x - 15 * s)} ${f1(yy - 24 * s)} ${f1(x + 15 * s)} ${f1(yy - 24 * s)} ${f1(x + 15 * s)} ${f1(yy)}Z` +
            `M${f1(x - 8 * s)} ${f1(yy - 32 * s)}a${f1(8 * s)} ${f1(8 * s)} 0 1 0 ${f1(16 * s)} 0a${f1(8 * s)} ${f1(8 * s)} 0 1 0 ${f1(-16 * s)} 0`;
        }
        rows.push({ e: P0(g, d, mix(C.paper, C.ink, 0.5), 1), gold: P0(g, d, C.gold, 0) });
        left -= cols; ri++;
      }
      const num = txt(g, '0', 540, 520, 230, { weight: 300, color: C.gold });
      const lab = txt(g, P.label || '', 540, 620, 64, { font: LO, italic: true, color: C.ink, weight: 400 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.4);
          push(g, lt, dur, 540, 900, 0.04);
          pool.set(0.24 + 0.03 * Math.sin(lt * 0.8));
          const p = BTL.ease(lt, hit - 0.15, 1.4);
          rows.forEach((q, i) => { const a = P.still ? 0 : clamp01(p * rows.length * 1.3 - (rows.length - 1 - i)); q.gold.setAttribute('fill-opacity', (0.9 * a).toFixed(3)); });
          num.textContent = String(Math.round(n * BTL.ease(lt, 0.1, Math.min(dur - 0.6, Math.max(1.2, hit + 0.6)))));
          fade(num, BTL.ease(lt, 0, 0.6)); fade(lab, BTL.ease(lt, 0.4, 0.8));
        },
      };
    },
  };
})();
