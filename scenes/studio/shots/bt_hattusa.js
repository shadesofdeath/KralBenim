// bt_hattusa: the end of Hattuša, the Hittite capital (Boğazkale, c. 1200 BC), belgesel style (docs/BELGESEL.md).
// Still line art in the theme's tokens; only slow natural motion (dust, flames, smoke, a rising sun, walking figures,
// light). Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame shows it as a centred column.
//   bt_ht_gate    P: {mode: "hook"|"dawn", dy}   the Lion Gate: huge jamb stones around a parabolic opening in a
//                 cyclopean wall, a lion's forequarters jutting sideways out of each; hook: the empty city dark beyond,
//                 a warm light pool on the threshold, dust drifting. dawn: the sun slowly rising inside the arch
//   bt_ht_city    P: {mode: "ridge"|"walls", label}   ridge: the city wall with towers drawing itself over the hill,
//                 the citadel on top, low sun behind, italic label. walls: a close stretch of the wall (stone socle,
//                 mud-brick upper wall, towers) on its rampart, a slow light passing along it, no one there
//   bt_ht_hall    cues: hit   a pillared palace hall burning (flames along the back wall, charred posts, smoke); on
//                 "hit" the flames sink to embers and a light pool shows the empty floor, empty niches, an empty stand
//   bt_ht_exodus  P: {mode: "leave"|"road"}   leave: a column of faceless figures walking slowly away down a road
//                 into the hills, some with bundles. road: the same road empty; it ends in a fork of three dashed
//                 tracks running to the horizon, which fade one after another
//   bt_ht_archive P: {mode: "rows"|"left"}  cues: hit (rows) · a, b (left)   rows: a storeroom of wooden shelves filling
//                 with clay tablets on "hit". left: one shelf; gold vessels on the left fade to dashed outlines on "a",
//                 the stack of tablets on the right lights gold on "b"
//   bt_ht_tablet  cues: hit, b   one big clay tablet with cuneiform, its lower part unwritten; on "hit" the lines light
//                 gold one after another; on "b" the gold fades and a pale light falls on the blank clay below
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  let UID = 0;
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0, 'text-anchor': 'middle' }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  const push = (g, lt, dur, cx, cy, amt = 0.035, base = 1) => {
    const z = base * (1 + amt * BTL.ease(lt, 0, Math.max(3, dur)));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${z.toFixed(4)}) translate(${-cx} ${-cy})`);
  };
  const bg = g => P0(g, 'M-300-200L1380-200L1380 2100L-300 2100Z', C.paper, 1);
  const ground = (g, y, a = 1) => { P0(g, `M-300 ${y}L1380 ${y}L1380 2100L-300 2100Z`, C.paperDark, a); L0(g, `M-300 ${y}L1380 ${y}`, C.inkSoft, 2, 0.6); };
  const stroke = (e, p) => { e.setAttribute('pathLength', 1); e.setAttribute('stroke-dasharray', '1 1'); e.setAttribute('stroke-dashoffset', f1(1 - clamp01(p))); };

  // slow drifting dust motes inside a box
  function dust(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), x: r(), y: r(), s: 1.6 + r() * 2.6, v: 0.012 + r() * 0.02, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.x + q.v * lt * (o.dir ?? 1) + 10) % 1, x = box[0] + u * w, y = box[1] + q.y * h + 10 * Math.sin(lt * 0.35 + q.ph);
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.45) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  // soft puffs rising (smoke)
  function puffs(g, seed, n, o) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), ph: i / n, rx: o.size * (0.7 + r() * 0.6), x0: o.x0 + (r() - 0.5) * o.spread });
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.08)) % 1, x = q.x0 + o.dx * u, y = o.y0 + o.dy * u, s = 0.5 + 1.2 * u;
      q.e.setAttribute('d', BTL.E(x, y, q.rx * s, q.rx * s * 0.7));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.18) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ cyclopean (polygonal) masonry in a box
  function masonry(seed, x0, x1, yTop, yBot) {
    const r = rng(seed); let d = '';
    let y = yBot, row = 0;
    while (y > yTop + 30) {
      const hgt = 80 + r() * 50, yt = Math.max(yTop, y - hgt);
      d += `M${x0} ${f1(yt)}L${x1} ${f1(yt + (r() - 0.5) * 10)}`;
      let x = x0 + (row % 2 ? 40 : 0) + r() * 60;
      while (x < x1 - 40) { const sl = (r() - 0.5) * 40; d += `M${f1(x)} ${f1(y)}L${f1(x + sl)} ${f1(yt)}`; x += 110 + r() * 110; }
      y = yt; row++;
    }
    return d;
  }
  // a lion's forequarters carved out of a jamb stone, in profile, facing left (dir -1) or right (dir 1).
  // origin = where the chest meets the stone; the head juts out sideways, one front leg stands down to the ground
  function lion(g, x, y, k, dir) {
    const L = el(g, 'g', { transform: `translate(${x} ${y}) scale(${dir * -k} ${k})` });
    const stone = mix(C.paper, C.ink, 0.24), mane = mix(C.paper, C.ink, 0.32);
    // body/chest block emerging from the stone (drawn facing left in local space: -x = outward)
    const chest = 'M0-150C-40-150-70-130-86-100C-100-60-96 0-80 40L-80 200L-40 200L-36 60C-20 40 0 30 0 30Z';
    P0(L, chest, stone, 1); L0(L, chest, C.ink, 3, 1);
    // front leg and paw
    L0(L, 'M-60 70L-62 190M-80 200L-28 200M-74 200L-74 188M-58 200L-58 188M-44 200L-44 188', C.ink, 2.5, 0.9);
    // mane: layered locks around the head
    const mn = 'M-20-190C-60-200-110-180-130-140C-150-100-140-50-110-30C-90-14-60-20-40-40C-20-70-10-110-20-190Z';
    P0(L, mn, mane, 1); L0(L, mn, C.ink, 3, 1);
    L0(L, 'M-50-176C-70-150-74-110-64-80M-86-170C-104-140-108-100-94-64M-116-150C-128-120-126-90-112-60', C.ink, 2, 0.55);
    // head in profile: brow, long muzzle, open jaw
    const head = 'M-110-150C-140-150-170-140-190-120L-206-96C-210-86-204-78-196-78L-170-80L-176-60C-180-48-168-40-156-46L-120-64C-100-80-96-120-110-150Z';
    P0(L, head, stone, 1); L0(L, head, C.ink, 3, 1);
    P0(L, 'M-196-78L-170-80L-176-60C-180-52-174-48-168-50L-150-60C-160-66-176-72-196-78Z', C.ink, 0.85);
    P0(L, 'M-150-124L-136-128L-140-118Z', C.ink, 1);
    L0(L, 'M-160-132Q-146-142-130-134M-200-104L-188-100M-120-150L-110-170L-96-150', C.ink, 2.2, 0.9);
    return L;
  }

  // ------------------------------------------------------------------ bt_ht_gate
  SH.bt_ht_gate = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', g0 = canvas(svg, W, H), gp = el(g0, 'g');
      bg(gp);
      const g = el(gp, 'g', { transform: `translate(0 ${P.dy || 0})` });
      const GY = 1130, cx = 540, dawn = mode === 'dawn';
      // the opening: a true parabola (quadratic curve) between the two great jamb stones
      const open = `M400 ${GY}Q${cx} -110 680 ${GY}Z`;
      const clipId = 'htg' + (++UID) + mode;
      const cp = el(defs, 'clipPath', { id: clipId }); el(cp, 'path', { d: open });
      P0(g, open, dawn ? C.paperLight : mix(C.paper, C.ink, 0.62), 1);
      const inner = el(g, 'g', { 'clip-path': `url(#${clipId})` });
      const pool = BTL.glow(svg, defs, cx, dawn ? GY - 200 : GY + 10, dawn ? 380 : 300, C.stain, dawn ? 0.35 : 0.55, inner);
      const sun = dawn ? P0(inner, '', C.gold, 0.85) : null;
      if (dawn) {
        P0(inner, `M380 ${GY}L380 ${GY - 70}C430 ${GY - 110} 480 ${GY - 80} 520 ${GY - 110}C560 ${GY - 130} 610 ${GY - 90} 700 ${GY - 120}L700 ${GY}Z`, mix(C.paperLight, C.ink, 0.18), 1);
      } else {
        // the empty city beyond: faint outlines of roofs in the dark
        L0(inner, `M430 ${GY - 150}L470 ${GY - 150}L470 ${GY - 200}L530 ${GY - 200}L530 ${GY - 160}L600 ${GY - 160}L600 ${GY - 230}L650 ${GY - 230}`, C.inkSoft, 2, 0.5);
      }
      // the wall either side
      const wallTop = 560;
      const wl = `M-300 ${GY}L-300 ${wallTop + 30}L120 ${wallTop}L300 ${wallTop - 20}L300 ${GY}Z`, wr = `M780 ${GY}L780 ${wallTop - 20}L960 ${wallTop}L1380 ${wallTop + 30}L1380 ${GY}Z`;
      P0(g, wl, mix(C.paper, C.ink, 0.08), 1); P0(g, wr, mix(C.paper, C.ink, 0.08), 1);
      L0(g, masonry(31, -300, 300, wallTop, GY), C.inkSoft, 2, 0.55);
      L0(g, masonry(47, 780, 1380, wallTop, GY), C.inkSoft, 2, 0.55);
      L0(g, `M-300 ${wallTop + 30}L120 ${wallTop}L300 ${wallTop - 20}M780 ${wallTop - 20}L960 ${wallTop}L1380 ${wallTop + 30}`, C.ink, 3, 0.9);
      // jamb stones: each side is a stack of huge rough blocks whose inner faces follow the parabola
      const jl = `M300 ${GY}L292 760C300 600 380 450 ${cx} 410L${cx} 510Q470 510 400 ${GY}Z`;
      const jr = `M780 ${GY}L788 760C780 600 700 450 ${cx} 410L${cx} 510Q610 510 680 ${GY}Z`;
      for (const j of [jl, jr]) { P0(g, j, mix(C.paper, C.ink, 0.16), 1); L0(g, j, C.ink, 3.5, 1); }
      L0(g, `M${cx} 410L${cx} 510M296 720L452 690M786 720L628 690M300 930L432 930M780 930L648 930M330 560L392 610M750 560L688 610`, C.ink, 2.5, 0.8);
      L0(g, `M320 800L360 820M330 1020L380 1000M760 800L720 820M750 1020L700 1000`, C.inkSoft, 2, 0.5);
      // the lions: forequarters jutting sideways out of the outer jamb faces
      lion(g, 300, 900, 0.95, -1); lion(g, 780, 900, 0.95, 1);
      // threshold, road and ground
      ground(g, GY);
      L0(g, `M400 ${GY}L220 2100M680 ${GY}L860 2100`, C.inkSoft, 2, 0.5);
      let st = ''; const r = rng(5);
      for (let i = 0; i < 26; i++) { const x = -250 + r() * 1580, y = GY + 40 + Math.pow(r(), 1.3) * 700; st += `M${f1(x)} ${f1(y)}l${f1(30 + r() * 50)} 0`; }
      L0(g, st, C.inkSoft, 2, 0.3);
      const thr = dawn ? null : BTL.glow(svg, defs, cx, GY + 20, 260, C.stain, 0.5, g);
      const ds = dust(g, 11, 26, [400, 520, 680, GY + 40], { alpha: dawn ? 0.55 : 0.6, color: dawn ? C.inkSoft : C.paperLight });
      const ds2 = dust(g, 23, 30, [-100, GY - 300, 1180, GY + 120], { alpha: 0.3 });
      return {
        update(lt, dur) {
          push(gp, lt, dur, 540, 800, 0.04);
          ds.update(lt); ds2.update(lt);
          if (sun) {
            const y = GY - 40 - 150 * BTL.ease(lt, 0, Math.max(4, dur));
            sun.setAttribute('d', BTL.E(cx, y, 58, 58));
            pool.set(0.25 + 0.2 * BTL.ease(lt, 0, Math.max(4, dur)));
          } else { pool.set(0.55 + 0.06 * Math.sin(lt * 0.7)); thr.set(0.5 + 0.05 * Math.sin(lt * 0.5 + 1)); }
        },
      };
    },
  };
  // ------------------------------------------------------------------ bt_ht_city
  SH.bt_ht_city = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'ridge', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      if (mode === 'walls') {
        const sky = BTL.glow(svg, defs, 900, 420, 520, C.stain, 0.25, g);
        // clouds: two thin drifting lines
        ground(g, 1340);
        // rampart (glacis) slope
        const ram = 'M-300 1060L1380 930L1380 1336L-300 1340Z';
        P0(g, ram, mix(C.paper, C.ink, 0.1), 1); L0(g, 'M-300 1060L1380 930', C.ink, 2.5, 0.8);
        let rs = ''; const r = rng(77);
        for (let i = 0; i < 40; i++) { const x = -260 + r() * 1600, t = (x + 300) / 1680, y = 1060 - 130 * t + 16 + r() * 70; rs += `M${f1(x)} ${f1(y)}l${f1(24 + r() * 30)} ${f1(-3)}`; }
        L0(g, rs, C.inkSoft, 2, 0.4);
        // the wall itself, receding to the right, with towers
        const wtop = x => 600 + 0.12 * (x + 300), wbot = x => 1060 - 0.077 * (x + 300), wsoc = x => wbot(x) - 0.28 * (wbot(x) - wtop(x));
        const wallG = el(g, 'g');
        const body = `M-300 ${f1(wtop(-300))}L1380 ${f1(wtop(1380))}L1380 ${f1(wbot(1380))}L-300 ${f1(wbot(-300))}Z`;
        P0(wallG, body, mix(C.paper, C.ink, 0.14), 1);
        P0(wallG, `M-300 ${f1(wsoc(-300))}L1380 ${f1(wsoc(1380))}L1380 ${f1(wbot(1380))}L-300 ${f1(wbot(-300))}Z`, mix(C.paper, C.ink, 0.24), 1);
        let br = '';
        for (let k = 1; k < 9; k++) { const f = k / 9; br += `M-300 ${f1(wtop(-300) + f * (wsoc(-300) - wtop(-300)))}L1380 ${f1(wtop(1380) + f * (wsoc(1380) - wtop(1380)))}`; }
        L0(wallG, br, C.inkSoft, 1.4, 0.35);
        const towers = [];
        for (const tx of [-120, 330, 720, 1060]) {
          const w = 150 - 0.04 * (tx + 300), top = wtop(tx) - 120 + 0.04 * (tx + 300), bot = wbot(tx) + 6;
          let cr = `M${f1(tx - w / 2)} ${f1(bot)}L${f1(tx - w / 2)} ${f1(top)}`;
          const n = 4, cw = w / (2 * n - 1);
          for (let i = 0; i < 2 * n - 1; i++) { const x0 = tx - w / 2 + i * cw; cr += i % 2 ? `L${f1(x0)} ${f1(top)}L${f1(x0 + cw)} ${f1(top)}` : `L${f1(x0)} ${f1(top - 26)}L${f1(x0 + cw)} ${f1(top - 26)}L${f1(x0 + cw)} ${f1(top)}`; }
          cr += `L${f1(tx + w / 2)} ${f1(bot)}Z`;
          const tg = el(g, 'g', { opacity: 0 });
          P0(tg, cr, mix(C.paper, C.ink, 0.2), 1); L0(tg, cr, C.ink, 3, 1);
          L0(tg, `M${f1(tx - 12)} ${f1(top + 50)}L${f1(tx - 12)} ${f1(top + 90)}L${f1(tx + 12)} ${f1(top + 90)}L${f1(tx + 12)} ${f1(top + 50)}Z`, C.ink, 2.5, 0.8);
          towers.push(tg);
        }
        // crenellations along the wall top
        let cren = `M-300 ${f1(wtop(-300))}`;
        for (let x = -300; x < 1380; x += 56) cren += `L${x} ${f1(wtop(x) - 22)}L${x + 28} ${f1(wtop(x + 28) - 22)}L${x + 28} ${f1(wtop(x + 28))}L${x + 56} ${f1(wtop(x + 56))}`;
        const crenE = L0(g, cren, C.ink, 3, 1); P0(g, cren + `L1380 ${f1(wtop(1380))}Z`, mix(C.paper, C.ink, 0.14), 1);
        const bodyE = L0(g, `M-300 ${f1(wbot(-300))}L1380 ${f1(wbot(1380))}M-300 ${f1(wsoc(-300))}L1380 ${f1(wsoc(1380))}`, C.ink, 3, 0.9);
        // a slow light passing along the wall (a cloud's edge)
        const lightG = BTL.glow(svg, defs, 0, 820, 360, C.paperLight, 0.5, g);
        const ds = dust(g, 41, 22, [-200, 1350, 1280, 1600], { alpha: 0.35 });
        return {
          update(lt, dur) {
            push(g, lt, dur, 540, 860, 0.035);
            stroke(crenE, BTL.ease(lt, 0, 1.6)); stroke(bodyE, BTL.ease(lt, 0, 1.6));
            towers.forEach((t, i) => fade(t, BTL.ease(lt, i * 0.25, 0.7)));
            lightG.e.setAttribute('cx', f1(-200 + 80 * lt));
            sky.set(0.25 + 0.03 * Math.sin(lt * 0.6));
            
            ds.update(lt);
          },
        };
      }
      // ridge: the city on its hill
      const sun = BTL.glow(svg, defs, 640, 640, 560, C.stain, 0.32, g);
      const sunDisc = P0(g, BTL.E(640, 640, 70, 70), C.gold, 0.35);
      const far = 'M-300 820L0 760L260 790L520 730L780 770L1060 720L1380 780L1380 900L-300 900Z';
      P0(g, far, mix(C.paper, C.ink, 0.07), 1); L0(g, far.replace(/L1380 900L-300 900Z$/, ''), C.inkSoft, 2, 0.5);
      const hill = 'M-300 1080C-100 1040 120 940 330 820C430 760 520 700 640 690C760 690 860 760 960 860C1080 960 1220 1010 1380 1040L1380 2100L-300 2100Z';
      P0(g, hill, mix(C.paper, C.ink, 0.13), 1);
      const hillE = L0(g, 'M-300 1080C-100 1040 120 940 330 820C430 760 520 700 640 690C760 690 860 760 960 860C1080 960 1220 1010 1380 1040', C.ink, 3, 0.9);
      let rk = ''; const r = rng(9);
      for (let i = 0; i < 30; i++) { const x = -200 + r() * 1500, y = 1080 + r() * 700; rk += `M${f1(x)} ${f1(y)}l${f1(30 + r() * 60)} ${f1(-4 + r() * 8)}`; }
      L0(g, rk, C.inkSoft, 2, 0.3);
      // the wall following the slope, with towers
      const pts = [[-160, 1060], [60, 990], [240, 890], [400, 790], [520, 740], [640, 728], [760, 742], [880, 800], [1010, 900], [1180, 980], [1300, 1010]];
      const wallD = 'M' + pts.map(p => p.join(' ')).join('L');
      const wallBand = L0(g, wallD, mix(C.paper, C.ink, 0.3), 16, 1, { 'stroke-linecap': 'butt' });
      const wallE = L0(g, wallD.replace(/(-?\d+) (\d+)/g, (m, x, y) => `${x} ${+y - 10}`), C.ink, 3, 1);
      const tw = [];
      for (let i = 0; i < pts.length; i++) {
        const [x, y] = pts[i], s = i === 5 ? 1.4 : 1;
        const d = `M${x - 14 * s} ${y + 6}L${x - 14 * s} ${y - 30 * s}L${x - 7 * s} ${y - 30 * s}L${x - 7 * s} ${y - 38 * s}L${x + 7 * s} ${y - 38 * s}L${x + 7 * s} ${y - 30 * s}L${x + 14 * s} ${y - 30 * s}L${x + 14 * s} ${y + 6}Z`;
        const e = el(g, 'g', { opacity: 0 }); P0(e, d, mix(C.paper, C.ink, 0.25), 1); L0(e, d, C.ink, 2.5, 1); tw.push(e);
      }
      // the citadel on the crest
      const cit = 'M560 700L560 640L600 640L600 620L680 620L680 640L720 640L720 700Z';
      const citG = el(g, 'g', { opacity: 0 }); P0(citG, cit, mix(C.paper, C.ink, 0.28), 1); L0(citG, cit, C.ink, 2.5, 1);
      const lab = txt(g, P.label || 'Hattuşa', 540, 400, 92, { font: LO, italic: true, weight: 400 });
      const rule = L0(g, 'M430 450L650 450', C.gold, 2.5, 1);
      const ds = dust(g, 3, 20, [-100, 1100, 1180, 1500], { alpha: 0.3 });
      return {
        update(lt, dur) {
          push(g, lt, dur, 640, 760, 0.035, 1.25);
          sun.set(0.32 + 0.03 * Math.sin(lt * 0.6));
          sunDisc.setAttribute('d', BTL.E(640, 640 + 12 * lt, 70, 70));
          stroke(hillE, BTL.ease(lt, 0, 1.2));
          const w = BTL.ease(lt, 0.2, 2.4); stroke(wallE, w); stroke(wallBand, w);
          tw.forEach((e, i) => fade(e, clamp01((w * pts.length - i) * 1.2)));
          fade(citG, BTL.ease(lt, 1.4, 1));
          fade(lab, BTL.ease(lt, 0.6, 1.2)); stroke(rule, BTL.ease(lt, 1, 1.2));
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ht_hall
  SH.bt_ht_hall = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      // room: back wall, side walls, floor
      const BL = 150, BR = 930, BT = 420, BB = 900;
      P0(g, `M${BL} ${BT}L${BR} ${BT}L${BR} ${BB}L${BL} ${BB}Z`, mix(C.paper, C.ink, 0.1), 1);
      P0(g, `M-300 2100L-300 1650L${BL} ${BB}L${BR} ${BB}L1380 1650L1380 2100Z`, C.paperDark, 1);
      P0(g, `M-300 -200L1380 -200L${BR} ${BT}L${BL} ${BT}Z`, mix(C.paper, C.ink, 0.26), 1);
      P0(g, `M-300 -200L${BL} ${BT}L${BL} ${BB}L-300 1650Z`, mix(C.paper, C.ink, 0.18), 1);
      P0(g, `M1380 -200L${BR} ${BT}L${BR} ${BB}L1380 1650Z`, mix(C.paper, C.ink, 0.18), 1);
      L0(g, `M-300 -200L${BL} ${BT}L${BR} ${BT}L1380 -200M-300 1650L${BL} ${BB}L${BR} ${BB}L1380 1650M${BL} ${BT}L${BL} ${BB}M${BR} ${BT}L${BR} ${BB}`, C.ink, 3, 0.9);
      // soot on the back wall
      const soot = P0(g, `M${BL} ${BT}L${BR} ${BT}L${BR} 640C800 600 700 660 540 610C380 660 280 600 ${BL} 650Z`, C.inkSoft, 0.3);
      // floor slabs
      let fl = '';
      for (const u of [0.15, 0.36, 0.62]) { const y = BB + (2100 - BB) * u * u * 1.4; fl += `M-300 ${f1(y)}L1380 ${f1(y)}`; }
      for (let i = 1; i < 6; i++) { const x = BL + (BR - BL) * i / 6; fl += `M${f1(x)} ${BB}L${f1(540 + (x - 540) * 1.25)} 1150`; }
      L0(g, fl, C.inkSoft, 1.6, 0.3);
      // three empty niches in the back wall
      let ni = '';
      for (const x of [300, 540, 780]) ni += `M${x - 60} 820L${x - 60} 680Q${x} 610 ${x + 60} 680L${x + 60} 820Z`;
      P0(g, ni, mix(C.paper, C.ink, 0.22), 1); L0(g, ni, C.ink, 2.5, 0.9);
      // the empty stone stand in the middle of the floor
      const stand = 'M450 1060L630 1060L610 1000L470 1000Z M470 1000L470 985L610 985L610 1000';
      P0(g, 'M450 1060L630 1060L610 1000L470 1000Z', C.paperLight, 1); L0(g, stand, C.ink, 3, 1);
      // pillar bases with charred posts (two rows in perspective)
      const posts = [[260, 960, 1.0], [820, 960, 1.0]];
      for (const [x, y, s] of posts) {
        const b = BTL.E(x, y, 60 * s, 18 * s);
        P0(g, b, C.paperLight, 1); L0(g, b, C.ink, 2.5, 1);
        const p = `M${x - 26 * s} ${y}L${x - 26 * s} ${y - 120 * s}L${x - 10 * s} ${y - 150 * s}L${x + 4 * s} ${y - 128 * s}L${x + 18 * s} ${y - 160 * s}L${x + 26 * s} ${y - 110 * s}L${x + 26 * s} ${y}Z`;
        P0(g, p, C.ink, 0.85); L0(g, p, C.ink, 2, 1);
      }
      // the light pool after the fire
      const pool = BTL.glow(svg, defs, 540, 1020, 380, C.stain, 0, g);
      // flames along the back wall and around the posts
      const flames = [], r = rng(61);
      const fsrc = [[220, BB, 1.2], [380, BB, 1.4], [540, BB, 1.6], [700, BB, 1.4], [860, BB, 1.2], [260, 940, 0.8], [820, 940, 0.8]];
      for (const [x, y, s] of fsrc) flames.push({ o: P0(g, '', C.red, 0.55), i: P0(g, '', C.gold, 0.75), x, y, s, ph: r() * TAU, sp: 1.1 + r() * 0.5 });
      const smoke = puffs(g, 19, 10, { x0: 540, spread: 700, y0: 820, dx: 40, dy: -520, size: 60, rate: 0.07, alpha: 0.22 });
      const emb = dust(g, 8, 24, [160, 760, 920, 900], { color: C.red, alpha: 0.6, dir: 0.3 });
      const flame = (x, y, w, h, ph) => `M${f1(x - w)} ${y}C${f1(x - w)} ${f1(y - h * 0.4)} ${f1(x - w * 0.3 + 10 * Math.sin(ph))} ${f1(y - h * 0.7)} ${f1(x + 14 * Math.sin(ph * 0.8))} ${f1(y - h)}C${f1(x + w * 0.3 + 10 * Math.sin(ph + 1))} ${f1(y - h * 0.7)} ${f1(x + w)} ${f1(y - h * 0.4)} ${f1(x + w)} ${y}Z`;
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5);
          push(g, lt, dur, 540, 900, 0.035);
          const on = 1 - BTL.ease(lt, hit - 0.2, 1.4);
          for (const q of flames) {
            const ph = q.ph + lt * q.sp, h = q.s * (150 + 22 * Math.sin(ph * 0.7)) * (0.12 + 0.88 * on), w = q.s * 42 * (0.4 + 0.6 * on);
            q.o.setAttribute('d', flame(q.x, q.y, w, h, ph)); q.i.setAttribute('d', flame(q.x, q.y, w * 0.55, h * 0.62, ph + 0.6));
            q.o.setAttribute('fill-opacity', f1(0.15 + 0.4 * on)); q.i.setAttribute('fill-opacity', (0.2 + 0.55 * on).toFixed(2));
          }
          smoke.update(lt, 0.6 + 0.4 * on); emb.update(lt, 0.5 + 0.5 * on);
          pool.set(0.5 * (1 - on));
          soot.setAttribute('fill-opacity', (0.12 + 0.2 * BTL.ease(lt, 0, 3)).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ht_exodus
  SH.bt_ht_exodus = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'leave', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const HY = 760, VX = 600;
      const haze = BTL.glow(svg, defs, VX, HY - 40, 520, C.stain, 0.32, g);
      const hills = `M-300 ${HY}L-60 ${HY - 70}L180 ${HY - 30}L420 ${HY - 110}L640 ${HY - 50}L860 ${HY - 120}L1100 ${HY - 40}L1380 ${HY - 90}L1380 ${HY}Z`;
      P0(g, hills, mix(C.paper, C.ink, 0.08), 1); L0(g, hills.replace(/L1380 \d+Z$/, ''), C.inkSoft, 2, 0.5);
      ground(g, HY, 0.9);
      // the road: an S curve from the bottom to the vanishing point
      const cl = u => { const y = HY + (1900 - HY) * Math.pow(1 - u, 1.6); const x = VX + (540 - VX) * Math.pow(1 - u, 1.3) + 160 * Math.sin(u * Math.PI * 1.2) * (1 - u); return [x, y]; };
      const half = u => 8 + 360 * Math.pow(1 - u, 2.2);
      let le = '', ri = '';
      const umax = mode === 'road' ? 0.6 : 0.98;
      for (let i = 0; i <= 40; i++) { const u = i / 40 * umax, [x, y] = cl(u), h = half(u); le += (i ? 'L' : 'M') + f1(x - h) + ' ' + f1(y); ri += (i ? 'L' : 'M') + f1(x + h) + ' ' + f1(y); }
      P0(g, le + 'L' + ri.slice(1).split('L').reverse().join('L') + 'Z', mix(C.paper, C.paperLight, 0.5), 1);
      L0(g, le + ri, C.inkSoft, 2, 0.6);
      let gr = ''; const r = rng(17);
      for (let i = 0; i < 40; i++) { const x = -250 + r() * 1580, y = HY + 30 + Math.pow(r(), 1.4) * 1000; gr += `M${f1(x)} ${f1(y)}l${f1(-6)} ${f1(-14 - r() * 16)}M${f1(x + 6)} ${f1(y)}l${f1(4)} ${f1(-12 - r() * 14)}`; }
      L0(g, gr, C.inkSoft, 2, 0.35);
      const forks = [];
      if (mode === 'road') {
        // (forks drawn bold enough to read)
        const [fx, fy] = cl(0.6);
        for (const tx of [-330, 30, 360]) forks.push(L0(g, `M${f1(fx)} ${f1(fy)}C${f1(fx + tx * 0.15)} ${f1(fy - 120)} ${f1(fx + tx * 0.8)} ${f1(HY + 90)} ${f1(fx + tx)} ${f1(HY + 6)}`, C.ink, 4, 0.8, { 'stroke-dasharray': '14 12' }));
      }
      const people = [];
      if (mode === 'leave') {
        for (let i = 0; i < 7; i++) people.push({ pg: el(g, 'g'), u0: 0.45 + i * 0.075, off: (i % 2 ? 1 : -1) * 0.75, pose: 'stand', pack: i % 3 === 0 });
      }
      // the gate jamb at the left edge (we stand inside the city, looking out)
      const ds = dust(g, 29, 24, [200, HY - 120, 1100, HY + 160], { alpha: 0.4 });
      return {
        update(lt, dur) {
          push(g, lt, dur, VX, HY + 200, 0.035);
          haze.set(0.32 + 0.04 * Math.sin(lt * 0.5));
          ds.update(lt);
          for (const p of people) {
            const u = Math.min(0.97, p.u0 + 0.018 * lt), [x, y] = cl(u), h = 620 * Math.pow(1 - u, 1.9) + 10;
            const xx = x + p.off * half(u) * 0.6;
            p.pg.setAttribute('transform', `translate(${f1(xx)} ${f1(y)}) scale(${(h / 100).toFixed(3)})`);
            if (!p.pg.firstChild) {
              BTL.person(p.pg, p.pose, 0, 0, 100, { color: mix(C.paper, C.ink, 0.62), rim: C.ink });
              if (p.pack) { const d = BTL.E(-14, -66, 16, 20); P0(p.pg, d, mix(C.paper, C.ink, 0.4), 1); L0(p.pg, d, C.ink, 2, 1); }
            }
            p.pg.setAttribute('opacity', clamp01((0.97 - u) * 8).toFixed(3));
          }
          forks.forEach((e, i) => e.setAttribute('stroke-opacity', (0.8 * (1 - BTL.ease(lt, 0.5 + i * 0.4, 1.6)) + 0.05).toFixed(3)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ tablets (pillow-shaped, origin = centre)
  function tabletPath(w, h, chip = 0) {
    const x = w / 2, y = h / 2, c = Math.min(w, h) * 0.16;
    return `M${-x + c} ${-y}L${x - c - chip} ${-y}${chip ? `L${x - c * 0.4} ${-y + chip * 0.8}L${x} ${-y + c + chip}` : `Q${x} ${-y} ${x} ${-y + c}`}L${x} ${y - c}Q${x} ${y} ${x - c} ${y}L${-x + c} ${y}Q${-x} ${y} ${-x} ${y - c}L${-x} ${-y + c}Q${-x} ${-y} ${-x + c} ${-y}Z`;
  }
  // cuneiform rows: returns one path string per row
  function wedges(seed, x0, x1, y0, rows, rowH, size) {
    const r = rng(seed), out = [];
    for (let i = 0; i < rows; i++) {
      let d = '', x = x0 + r() * 10; const y = y0 + i * rowH + rowH * 0.5, end = x1 - (i === rows - 1 ? (x1 - x0) * 0.45 : r() * 30);
      while (x < end) {
        const k = r(), s = size * (0.75 + r() * 0.5);
        if (k < 0.55) d += `M${f1(x)} ${f1(y - s * 0.5)}l${f1(s * 0.5)} ${f1(s * 0.25)}l${f1(-s * 0.5)} ${f1(s * 0.25)}Z M${f1(x + s * 0.4)} ${f1(y)}l${f1(s * 1.1)} 0 `;
        else if (k < 0.85) d += `M${f1(x)} ${f1(y - s * 0.6)}l${f1(s * 0.5)} 0l${f1(-s * 0.25)} ${f1(s * 0.4)}Z M${f1(x + s * 0.25)} ${f1(y - s * 0.2)}l0 ${f1(s * 0.9)} `;
        else d += `M${f1(x)} ${f1(y - s * 0.4)}l${f1(s * 0.5)} ${f1(s * 0.4)}l${f1(-s * 0.5)} ${f1(s * 0.4)}Z `;
        x += s * (k < 0.55 ? 1.9 : 1.1) + r() * s * 0.6;
        if (r() < 0.1) x += s * 1.2;
      }
      out.push(d);
    }
    return out;
  }

  // ------------------------------------------------------------------ bt_ht_archive
  SH.bt_ht_archive = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'rows', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const r = rng(mode === 'rows' ? 101 : 202);
      if (mode === 'rows') {
        // storeroom: back wall + floor, a doorway light from the left
        P0(g, 'M-300 -200L1380 -200L1380 1120L-300 1120Z', mix(C.paper, C.ink, 0.08), 1);
        ground(g, 1120);
        const lamp = BTL.glow(svg, defs, 300, 700, 620, C.stain, 0.3, g);
        const shelves = [470, 640, 810, 980], X0 = 110, X1 = 970, items = [];
        // uprights
        L0(g, `M${X0} 330L${X0} 1120M${X1} 330L${X1} 1120M540 330L540 1120`, C.ink, 4, 0.9);
        for (const sy of shelves) {
          P0(g, `M${X0 - 20} ${sy}L${X1 + 20} ${sy}L${X1 + 20} ${sy + 16}L${X0 - 20} ${sy + 16}Z`, mix(C.paper, C.ink, 0.3), 1);
          L0(g, `M${X0 - 20} ${sy}L${X1 + 20} ${sy}M${X0 - 20} ${sy + 16}L${X1 + 20} ${sy + 16}`, C.ink, 2.5, 1);
          let x = X0 + 10;
          while (x < X1 - 30) {
            const w = 30 + r() * 26, h = 70 + r() * 60, lean = (r() - 0.5) * 10;
            if (Math.abs(x + w / 2 - 540) < w / 2 + 6) { x += w + 8; continue; }
            const tg = el(g, 'g', { transform: `translate(${f1(x + w / 2)} ${f1(sy - h / 2)}) rotate(${f1(lean)})`, opacity: 0 });
            const d = tabletPath(w, h);
            P0(tg, d, mix(C.paperLight, C.stain, 0.25), 1); L0(tg, d, C.ink, 2, 1);
            L0(tg, `M${f1(-w * 0.3)} ${f1(-h * 0.25)}L${f1(w * 0.3)} ${f1(-h * 0.25)}M${f1(-w * 0.3)} 0L${f1(w * 0.2)} 0M${f1(-w * 0.3)} ${f1(h * 0.25)}L${f1(w * 0.3)} ${f1(h * 0.25)}`, C.inkSoft, 1.5, 0.6);
            items.push({ tg, k: r() });
            x += w + 4 + r() * 6;
          }
        }
        items.sort((a, b) => a.k - b.k);
        const ds = dust(g, 7, 30, [-100, 380, 760, 1100], { alpha: 0.45 });
        return {
          update(lt, dur, cues) {
            const hit = cue(cues, 'hit', dur * 0.35);
            push(g, lt, dur, 540, 760, 0.035);
            lamp.set(0.3 + 0.04 * Math.sin(lt * 0.7));
            const n = items.length, fill = 0.25 + 0.75 * BTL.ease(lt, hit - 0.2, 2.2);
            items.forEach((it, i) => fade(it.tg, clamp01((fill * n - i) / 6)));
            ds.update(lt);
          },
        };
      }
      // left: one shelf, vessels taken, tablets left
      P0(g, 'M-300 -200L1380 -200L1380 1120L-300 1120Z', mix(C.paper, C.ink, 0.08), 1);
      ground(g, 1120);
      const SY = 900;
      const poolL = BTL.glow(svg, defs, 300, 760, 300, C.stain, 0.22, g);
      const poolR = BTL.glow(svg, defs, 770, 740, 340, C.gold, 0, g);
      P0(g, `M40 ${SY}L1040 ${SY}L1040 ${SY + 26}L40 ${SY + 26}Z`, mix(C.paper, C.ink, 0.3), 1);
      L0(g, `M40 ${SY}L1040 ${SY}M40 ${SY + 26}L1040 ${SY + 26}M90 ${SY + 26}L90 1120M990 ${SY + 26}L990 1120`, C.ink, 3, 1);
      // the vessels (cup, jug, bowl) that are carried away; their dashed ghosts stay
      const ves = [
        `M140 ${SY}L150 ${SY - 30}C120 ${SY - 60} 120 ${SY - 140} 150 ${SY - 170}L250 ${SY - 170}C280 ${SY - 140} 280 ${SY - 60} 250 ${SY - 30}L260 ${SY}Z`,
        `M300 ${SY}C290 ${SY - 80} 300 ${SY - 160} 330 ${SY - 200}L320 ${SY - 260}L380 ${SY - 260}L370 ${SY - 200}C400 ${SY - 160} 410 ${SY - 80} 400 ${SY}Z M400 ${SY - 170}C450 ${SY - 170} 450 ${SY - 90} 398 ${SY - 80}`,
        `M430 ${SY}L470 ${SY - 60}L510 ${SY - 60}L550 ${SY}Z M450 ${SY - 60}C450 ${SY - 110} 530 ${SY - 110} 530 ${SY - 60}`,
      ];
      const solid = el(g, 'g'), ghost = el(g, 'g', { opacity: 0 });
      for (const d of ves) { P0(solid, d, C.gold, 0.8); L0(solid, d, C.ink, 3, 1); L0(ghost, d, C.inkSoft, 2.5, 0.8, { 'stroke-dasharray': '10 10' }); }
      L0(solid, `M160 ${SY - 100}L240 ${SY - 100}M320 ${SY - 120}L380 ${SY - 120}`, C.paperLight, 3, 0.7);
      // the stack of tablets on the right
      const stack = el(g, 'g'), rims = [];
      const tabs = [[650, 140, 180, -4], [800, 150, 200, 3], [935, 110, 160, -2]];
      tabs.forEach(([x, w, h, rot], i) => {
        const yy = i === 3 ? SY - 180 - h / 2 - 2 : SY - h / 2;
        const tg = el(stack, 'g', { transform: `translate(${x} ${f1(yy)}) rotate(${rot})` });
        const d = i === 3 ? tabletPath(w * 1.6, 60) : tabletPath(w, h, i === 1 ? 26 : 0);
        P0(tg, d, mix(C.paperLight, C.stain, 0.25), 1); L0(tg, d, C.ink, 3, 1);
        rims.push(L0(tg, d, C.gold, 5, 0));
        if (i !== 3) wedges(300 + i, -w / 2 + 16, w / 2 - 12, -h / 2 + 14, 6, (h - 28) / 6, 10).forEach(rd => L0(tg, rd, C.inkSoft, 1.5, 0.8, { fill: C.inkSoft, 'fill-opacity': 0.6 }));
      });
      const ds = dust(g, 13, 26, [60, 560, 1040, 900], { alpha: 0.4 });
      return {
        update(lt, dur, cues) {
          const a = cue(cues, 'a', dur * 0.2), b = cue(cues, 'b', dur * 0.6);
          push(g, lt, dur, 540, 880, 0.035, 1.12);
          const gone = BTL.ease(lt, a - 0.2, 1.4);
          fade(solid, 1 - gone); fade(ghost, gone);
          solid.setAttribute('transform', `translate(${f1(-60 * gone)} 0)`);
          poolL.set(0.22 * (1 - 0.6 * gone));
          const lit = BTL.ease(lt, b - 0.2, 1.2);
          poolR.set(0.3 * lit + 0.03 * Math.sin(lt * 0.8) * lit);
          rims.forEach(e => e.setAttribute('stroke-opacity', (0.9 * lit).toFixed(3)));
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ht_tablet
  SH.bt_ht_tablet = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const pool = BTL.glow(svg, defs, 540, 680, 560, C.stain, 0.3, g);
      ground(g, 1130, 0.5);
      const TW = 620, TH = 780, cx = 540, cy = 690;
      const T = el(g, 'g', { transform: `translate(${cx} ${cy}) rotate(-2)` });
      const d = tabletPath(TW, TH, 60);
      P0(T, `M${-TW / 2 + 20} ${TH / 2 + 30}L${TW / 2 + 10} ${TH / 2 + 30}L${TW / 2 - 10} ${TH / 2 - 10}L${-TW / 2 + 10} ${TH / 2 - 10}Z`, C.inkSoft, 0.2);
      P0(T, d, mix(C.paperLight, C.stain, 0.28), 1);
      const outline = L0(T, d, C.ink, 3.5, 1);
      const rows = 13, rowH = (TH - 80) / rows, written = 10;
      let rl = ''; for (let i = 1; i < rows; i++) rl += `M${-TW / 2 + 30} ${f1(-TH / 2 + 40 + i * rowH)}L${TW / 2 - 30} ${f1(-TH / 2 + 40 + i * rowH)}`;
      L0(T, rl, C.inkSoft, 1.2, 0.45);
      const W0 = wedges(1274, -TW / 2 + 40, TW / 2 - 40, -TH / 2 + 40, written, rowH, 22);
      const blank = BTL.glow(svg, defs, 0, -TH / 2 + 40 + rowH * 11.5, 260, C.paperLight, 0, T);
      const base = W0.map(rd => L0(T, rd, C.inkSoft, 2, 0.85, { fill: C.inkSoft, 'fill-opacity': 0.55 }));
      const gold = W0.map(rd => L0(T, rd, C.gold, 3, 0, { fill: C.gold, 'fill-opacity': 0 }));
      L0(T, `M${TW / 2 - 90} ${-TH / 2 + 6}L${TW / 2 - 60} ${-TH / 2 + 40}L${TW / 2 - 8} ${-TH / 2 + 70}`, C.ink, 2, 0.6);
      const ds = dust(g, 37, 26, [140, 260, 940, 1100], { alpha: 0.4 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.2), bb = cue(cues, 'b', dur * 0.6), off = 1 - 0.7 * BTL.ease(lt, bb - 0.1, 1);
          blank.set(0.9 * BTL.ease(lt, bb - 0.1, 1.2));
          push(g, lt, dur, 540, 690, 0.04);
          stroke(outline, BTL.ease(lt, 0, 1.2));
          pool.set(0.3 + 0.1 * BTL.ease(lt, hit, 2) + 0.02 * Math.sin(lt * 0.8));
          gold.forEach((e, i) => { const a = BTL.ease(lt, hit - 0.3 + i * 0.16, 0.5); e.setAttribute('stroke-opacity', (0.95 * a * off).toFixed(3)); e.setAttribute('fill-opacity', (0.8 * a * off).toFixed(3)); });
          base.forEach((e, i) => e.setAttribute('stroke-opacity', (0.85 * (1 - 0.6 * BTL.ease(lt, hit - 0.3 + i * 0.16, 0.5) * off)).toFixed(3)));
          ds.update(lt);
        },
      };
    },
  };
})();
