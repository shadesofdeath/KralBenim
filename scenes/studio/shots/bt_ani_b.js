// bt_ani_b: Ani (part 2), belgesel style (docs/BELGESEL.md); shared helpers from window.ANI (bt_ani.js).
//   bt_an_walls   P: {mode: "siege"|"days"|"breach"|"smoke", label, sub}  cues: hit   the double north wall with
//                 semicircular towers on the steppe. siege: night, camp fires of an army on the plain. days: 25 marks
//                 draw in one after another above the wall. breach: a stretch of the inner wall falls on hit, light
//                 behind. smoke: dark smoke rises slowly behind the wall
//   bt_an_riders  P: {mode: "horizon"|"dust", label}  cues: hit   horsemen on the horizon at low sun, slowly
//                 coming; dust: a huge dust cloud rises on the horizon, tiny riders under it
//   bt_an_caravan P: {mode: "come"|"gate"|"road"|"away", label}  cues: hit   a camel caravan on the steppe road.
//                 come: towards the plateau. gate: through the city gate. road: the empty road, one far camel.
//                 away: the caravan takes another road, the old road to the dim city turns dashed on hit
//   bt_an_city    P: {mode: "lit"|"bazaar"|"dark", label}  cues: a, b, c (dark: lights go out in three groups)
//                 flat-roofed stone houses inside the wall with warm windows; bazaar: an arcade of shops with jars,
//                 sacks and hanging lamps
//   bt_an_line    P: {range: [950, 1350], items: [{year, label, at}], note}  cues: the "at" names
//                 a quiet timeline; marks, years and one-word names appear on cues
//   bt_an_mosque  P: {label, sub}  cues: hit   the octagonal minaret beside the half-ruined prayer hall; its Kufic band
//                 lights gold on hit
//   bt_an_days    P: {label}  cues: hit   close-up of the wall's ashlar: 25 marks scratched in one by one, a thin moon
//   bt_an_quake   P: {label}  cues: hit   cross-section of the ground under the plateau; a crack draws itself up
//                 through the layers on hit, dust rises, the layers to one side sit a little lower
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, TAU = Math.PI * 2;
  const { f1, fade, P0, L0, T, ital, place, stroke } = window.ANI;
  const ANI = window.ANI;
  const stone = () => mix(C.paperDark, C.ink, 0.1);
  // thin wavy lines rising from (cx, y): a blur-free smoke/dust column. dir 'up' (column) or 'wide' (low layers)
  function lineSmoke(g, cx, y, n, o = {}) {
    const ls = []; for (let i = 0; i < n; i++) ls.push(L0(g, '', C.inkSoft, o.w || 1.8, 0));
    return { update(lt, on = 1) { ls.forEach((e, i) => {
      let d = '';
      if (o.wide) {
        const yy = y - i * 26 - 30 * on * (1 + 0.1 * lt), half = (o.half || 200) + i * 30 + 60 * on;
        for (let x = -half; x <= half; x += 20) { const k = 1 - Math.pow(x / half, 2); d += (x === -half ? 'M' : 'L') + f1(cx + x) + ' ' + f1(yy - 24 * k * on - 5 * Math.sin(x / 45 + i + lt * 0.4)); }
      } else {
        const x0 = cx + (i - (n - 1) / 2) * (o.gap || 26), hgt = (o.h || 380) * (0.85 + 0.15 * Math.sin(i * 1.7));
        for (let t = 0; t <= 1.0001; t += 0.05) { const yy = y - t * hgt, xx = x0 + (o.drift || 90) * t * t + 10 * Math.sin(t * 7 + i * 1.3 + lt * 0.5) * t; d += (t === 0 ? 'M' : 'L') + f1(xx) + ' ' + f1(yy); }
      }
      e.setAttribute('d', d); e.setAttribute('stroke-opacity', ((o.alpha || 0.55) * on * (1 - i / (n * 1.6))).toFixed(3));
    }); } };
  }

  // the double wall (elevation), ground at GY: a low outer wall in front, the tall inner wall with round towers
  function wall(g, GY, o = {}) {
    const back = el(g, 'g'), front = el(g, 'g'), towers = [];
    const top = GY - 300;
    P0(back, `M-400 ${GY}L-400 ${top}L2320 ${top}L2320 ${GY}Z`, stone(), 1);
    L0(back, `M-400 ${top}L2320 ${top}`, C.ink, 3, 0.9);
    // crenellations
    let cr = ''; for (let x = -380; x < 2320; x += 56) cr += `M${x} ${top}L${x} ${top - 24}L${x + 30} ${top - 24}L${x + 30} ${top}`;
    L0(back, cr, C.ink, 2.4, 0.8);
    // courses
    let cs = ''; for (let y = top + 50; y < GY; y += 50) cs += `M-400 ${y}L2320 ${y}`;
    L0(back, cs, C.inkSoft, 1.4, 0.35);
    for (const tx of o.towers || [100, 520, 940, 1360, 1780]) {
      const tg = el(back, 'g'), w = 170, tt = top - 60;
      const d = `M${tx - w / 2} ${GY}L${tx - w / 2} ${tt}L${tx + w / 2} ${tt}L${tx + w / 2} ${GY}Z`;
      P0(tg, d, mix(C.paperLight, C.paperDark, 0.5), 1);
      P0(tg, `M${tx + 20} ${GY}L${tx + 20} ${tt}L${tx + w / 2} ${tt}L${tx + w / 2} ${GY}Z`, stone(), 0.8);   // round shading
      L0(tg, d, C.ink, 3, 0.95);
      let tc = ''; for (let x = tx - w / 2 + 6; x < tx + w / 2 - 20; x += 40) tc += `M${x} ${tt}L${x} ${tt - 22}L${x + 22} ${tt - 22}L${x + 22} ${tt}`;
      L0(tg, tc, C.ink, 2.4, 0.85);
      L0(tg, `M${tx - 8} ${tt + 80}L${tx - 8} ${tt + 120}M${tx + 8} ${tt + 80}L${tx + 8} ${tt + 120}`, C.ink, 3, 0.8);
      towers.push({ tg, tx });
    }
    // outer low wall in front
    const fy = GY - 110;
    P0(front, `M-400 ${GY + 40}L-400 ${fy + 40}L2320 ${fy + 40}L2320 ${GY + 40}Z`, mix(C.paperLight, C.paperDark, 0.35), 1);
    L0(front, `M-400 ${fy + 40}L2320 ${fy + 40}`, C.ink, 3, 0.9);
    let fc = ''; for (let x = -380; x < 2320; x += 48) fc += `M${x} ${fy + 40}L${x} ${fy + 22}L${x + 26} ${fy + 22}L${x + 26} ${fy + 40}`;
    L0(front, fc, C.ink, 2.2, 0.75);
    return { back, front, towers, top };
  }

  // ------------------------------------------------------------------ bt_an_walls
  SH.bt_an_walls = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'siege', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.5 });
      const night = mode === 'siege';
      const GY = 700;
      const st = night ? BTL.stars(g, 110, 33, [-200, -100, 2120, 300]) : null;
      const sky = BTL.glow(svg, defs, mode === 'smoke' ? 1200 : 960, 300, 600, C.stain, night ? 0.12 : 0.28, g);
      const smoke = mode === 'smoke' ? [lineSmoke(g, 700, 400, 6, { h: 300, drift: 110 }), lineSmoke(g, 1300, 400, 7, { h: 340, drift: 130 })] : [];
      let light = null;
      const Wl = wall(g, GY, { towers: [100, 520, 1400, 1820] });
      // breach: the stretch between the two middle towers is its own group and falls
      let gap = null, rubble = null, edges = null;
      if (mode === 'breach') {
        gap = el(g, 'g');
        P0(gap, `M790 ${GY - 110}L800 ${Wl.top + 40}L776 ${Wl.top - 4}L790 ${Wl.top - 40}L1136 ${Wl.top - 40}L1150 ${Wl.top + 10}L1130 ${Wl.top + 30}L1140 ${GY - 110}Z`, C.paper, 0);
        light = BTL.glow(svg, defs, 960, Wl.top + 90, 300, C.gold, 0, gap);
        edges = L0(g, `M790 ${GY - 110}L800 ${Wl.top + 40}L776 ${Wl.top - 4}L790 ${Wl.top - 26}M1140 ${GY - 110}L1130 ${Wl.top + 30}L1150 ${Wl.top + 10}L1140 ${Wl.top - 26}`, C.gold, 4, 0);
        rubble = P0(g, '', stone(), 1);
        g.appendChild(Wl.front);
      }
      ANI.ground(g, GY + 40, { seed: 22, n: 26 });
      g.appendChild(Wl.front);
      // the army's camp fires on the plain
      const fires = [];
      if (night) { const r = rng(14); for (let i = 0; i < 16; i++) { const x = -100 + r() * 2120, y = GY + 120 + Math.pow(r(), 1.3) * 300; fires.push({ x, y, s: 0.6 + (y - GY) / 400, e: P0(g, '', C.gold, 0.85), gl: BTL.glow(svg, defs, x, y, 60 * (0.6 + (y - GY) / 400), C.gold, 0.2, g), ph: r() * TAU }); } }
      // the 25 days
      const marks = [];
      if (mode === 'days') for (let i = 0; i < 25; i++) { const grp = Math.floor(i / 5), j = i % 5, x = 520 + grp * 190 + j * 26; marks.push(j === 4 ? L0(g, `M${x - 110} 230L${x + 6} 150`, C.gold, 5, 1) : L0(g, `M${x} 140L${x} 240`, C.ink, 5, 1)); }
      marks.forEach(m => stroke(m, 0));
      const lab = P.label ? T(g, P.label, 960, mode === 'days' ? 320 : 190, mode === 'days' ? 64 : 70, { weight: 300, color: mode === 'days' ? C.gold : C.ink }) : null;
      const sub = P.sub ? ital(g, P.sub, 960, mode === 'days' ? 380 : 256, 46) : null;
      const ds = ANI.dust(g, 9, 28, [-100, GY - 360, 2020, GY + 260], { alpha: 0.32 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); if (st) st.update(lt);
          sky.set((night ? 0.12 : 0.28) + 0.04 * Math.sin(lt * 0.4));
          smoke.forEach(s => s.update(lt));
          fires.forEach(f => { const h = 14 * f.s * (1 + 0.18 * Math.sin(lt * 2.1 + f.ph)); f.e.setAttribute('d', `M${f1(f.x - 7 * f.s)} ${f1(f.y)}Q${f1(f.x)} ${f1(f.y - h * 2)} ${f1(f.x + 7 * f.s)} ${f1(f.y)}Z`); f.gl.set(0.2 + 0.05 * Math.sin(lt * 1.3 + f.ph)); });
          const hit = mode === 'breach' ? Math.min(cue(cues, 'hit', 0.4), 0.4) : cue(cues, 'hit', dur * 0.45);
          if (marks.length) { const span = Math.max(2, Math.min(dur - 1.5, hit + 2) - 0.4); marks.forEach((m, i) => stroke(m, BTL.ease(lt, 0.4 + i * span / 25, 0.35))); }
          if (gap) {
            const q = BTL.ease(lt, hit, 1.8);
            // the inner wall between the middle towers: covered by a light gap shape
            gap.firstChild.setAttribute('fill-opacity', q.toFixed(3));
            edges.setAttribute('stroke-opacity', BTL.ease(lt, hit + 0.8, 1.2).toFixed(3));
            light.set(0.4 * q + 0.05 * q * Math.sin(lt * 0.7));
            const rh = 60 * q;
            rubble.setAttribute('d', q > 0.01 ? `M760 ${GY - 110}Q820 ${f1(GY - 110 - rh)} 900 ${f1(GY - 110 - rh * 1.3)}Q980 ${f1(GY - 110 - rh * 0.9)} 1060 ${f1(GY - 110 - rh * 1.2)}Q1120 ${f1(GY - 110 - rh)} 1170 ${GY - 110}Z` : '');
          }
          if (lab) fade(lab, BTL.ease(lt, mode === 'breach' ? hit + 0.4 : (mode === 'days' ? cue(cues, 'hit', dur * 0.6) : 0.8), 1.2));
          if (sub) fade(sub, BTL.ease(lt, 1.6, 1.2));
        },
      };
    },
  };

  // a horse with its rider, side view, facing right (origin = hooves on the ground), ~150 long at s = 1
  function rider(g, x, y, s, o = {}) {
    const t = place(g, x, y, s);
    const col = o.color || mix(C.paperDark, C.ink, 0.55);
    const horse = 'M-60-58C-70-70-50-84-20-84L30-84C44-96 54-118 66-128L86-124C90-114 84-106 78-100C72-92 70-78 64-66C58-50 40-44 30-44L-50-44C-60-46-62-52-60-58Z';
    P0(t, horse, col, 1);
    L0(t, 'M-44-46L-50 0M-30-46L-24 0M24-46L18 0M40-48L48 0M-60-58C-76-56-84-40-84-24', col, 7, 1);
    // rider
    P0(t, 'M-8-84L-14-130C-14-142 8-142 10-130L14-84Z', col, 1);
    el(t, 'circle', { cx: -2, cy: -152, r: 12, fill: col });
    if (o.spear) L0(t, 'M-30-176L40-100', col, 3, 1);
    if (o.banner) { L0(t, 'M-16-120L-16-230', col, 3, 1); P0(t, 'M-16-230L30-218L-16-204Z', o.bannerColor || col, 1); }
    return t;
  }

  // ------------------------------------------------------------------ bt_an_riders
  SH.bt_an_riders = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'horizon', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560, k: 1.55 });
      const HY = 660;
      const sun = BTL.glow(svg, defs, 1320, 560, 600, C.stain, 0.36, g);
      const disc = P0(g, BTL.E(1320, 600, 70, 70), C.gold, 0.4);
      // dust: a curtain of thin, layered wavy bands rising slowly from the horizon (no blur)
      const curtain = [];
      if (mode === 'dust') for (let i = 0; i < 7; i++) curtain.push({ f: P0(g, '', C.inkSoft, 0.07), l: L0(g, '', C.inkSoft, 1.8, 0.55), i, ph: i * 1.7 });
      const cloud = [{ update(lt) { curtain.forEach(c => {
        const h = (50 + c.i * 34) * (0.75 + 0.25 * BTL.ease(lt, 0, 6)), amp = 10 + c.i * 3;
        let top = ''; for (let x = 40; x <= 1880; x += 40) { const e = Math.pow(Math.sin(Math.PI * (x - 40) / 1840), 0.45); const y = HY - 4 - h * e - amp * e * Math.sin(x / 130 + c.ph + lt * 0.25); top += (x === 40 ? 'M' : 'L') + x + ' ' + y.toFixed(1); }
        c.l.setAttribute('d', top); c.f.setAttribute('d', top + `L1880 ${HY}L40 ${HY}Z`);
      }); } }];
      ANI.ground(g, HY, { seed: 31, n: 34 });
      // far hills
      L0(g, `M-400 ${HY - 4}Q200 ${HY - 60} 600 ${HY - 20}Q1000 ${HY - 70} 1400 ${HY - 14}Q1800 ${HY - 50} 2320 ${HY - 6}`, C.inkSoft, 2, 0.5);
      const row = el(g, 'g');
      const n = mode === 'dust' ? 18 : 11, r = rng(5), R = [];
      for (let i = 0; i < n; i++) {
        const s = mode === 'dust' ? 0.32 + r() * 0.08 : 0.62 + r() * 0.14, x = (mode === 'dust' ? 520 : 300) + i * (mode === 'dust' ? 52 : 120) + r() * 30, y = HY + (mode === 'dust' ? 6 : 14 + r() * 26);
        R.push({ e: rider(row, x, y, s, { banner: i % 4 === 1, spear: i % 3 === 0, bannerColor: C.red }), x, y, s });
      }
      const lab = P.label ? T(g, P.label, 960, 230, 70, { weight: 300 }) : null;
      const ds = ANI.dust(g, 15, 30, [-100, HY - 200, 2020, HY + 300], { alpha: 0.35 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); sun.set(0.36 + 0.04 * Math.sin(lt * 0.4));
          disc.setAttribute('d', BTL.E(1320, 600 + 24 * BTL.ease(lt, 0, Math.max(5, dur)), 70, 70));
          cloud.forEach(c => c.update(lt));
          const k = mode === 'dust' ? 10 : 18;
          row.setAttribute('transform', `translate(${f1(k * lt)} 0)`);
          if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', 0.8), 1.2));
        },
      };
    },
  };

  // a loaded camel, facing right (origin = feet on the ground), ~200 long at s = 1
  function camel(g, x, y, s, o = {}) {
    const t = place(g, x, y, s), col = o.color || mix(C.paperDark, C.ink, 0.5);
    const body = 'M-80-120C-90-150-60-176-24-178C-4-200 30-200 44-176C70-172 86-150 90-128C110-140 124-170 132-196C140-214 166-214 172-200C178-190 168-182 160-180C152-150 136-112 106-100C90-92 70-88 50-88L-60-88C-80-92-84-104-80-120Z';
    P0(t, body, col, 1);
    L0(t, 'M-60-92L-66 0M-40-92L-34 0M40-92L34 0M60-92L68 0M-82-118C-96-110-100-90-98-70', col, 8, 1);
    // pack
    P0(t, 'M-50-176L40-176L46-136L-56-136Z', o.pack || mix(C.paperLight, C.red, 0.3), 1);
    L0(t, 'M-50-176L40-176L46-136L-56-136Z', C.ink, 2, 0.6);
    return t;
  }

  // ------------------------------------------------------------------ bt_an_caravan
  SH.bt_an_caravan = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'come', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560, k: 1.55 });
      const HY = 600;
      const sunX = mode === 'away' ? 1500 : 500, sun = BTL.glow(svg, defs, sunX, 500, 560, C.stain, 0.34, g);
      const disc = P0(g, '', C.gold, 0.4);
      ANI.ground(g, HY, { seed: 41, n: 40 });
      // the city on its plateau, right (come/away/road) — a few silhouettes on a rise
      const city = el(g, 'g', { opacity: mode === 'away' ? 0.45 : 0.9 });
      if (mode !== 'gate') {
        const cx = mode === 'away' ? 360 : 1560;
        P0(city, `M${cx - 330} ${HY}Q${cx - 250} ${HY - 50} ${cx - 120} ${HY - 56}L${cx + 140} ${HY - 60}Q${cx + 260} ${HY - 50} ${cx + 330} ${HY}Z`, mix(C.paperDark, C.ink, 0.1), 1);
        ANI.cathedral(city, cx, HY - 56, 0.2, { ruin: mode === 'away' });
        ANI.church(city, cx - 160, HY - 54, 0.36, { fill: C.paperDark }); ANI.church(city, cx + 150, HY - 58, 0.3, { fill: C.paperDark });
      }
      // roads
      const roadA = mode === 'away' ? `M560 ${HY}Q1000 ${HY + 90} 1400 ${HY + 240}Q1700 ${HY + 360} 2100 ${HY + 400}` : `M-200 ${HY + 360}Q600 ${HY + 220} 1100 ${HY + 80}Q1350 ${HY + 20} 1400 ${HY}`;
      const road = L0(g, roadA, C.inkSoft, 3, 0.6, { 'stroke-dasharray': mode === 'away' ? '14 14' : 'none' });
      const roadN = mode === 'away' ? L0(g, `M-200 ${HY + 330}Q500 ${HY + 250} 1100 ${HY + 140}Q1600 ${HY + 60} 2200 ${HY + 30}`, C.gold, 4, 1) : null;
      if (roadN) stroke(roadN, 0);
      let gateG = null;
      if (mode === 'gate') {
        gateG = el(g, 'g');
        const gx = 1400;
        P0(gateG, `M1000 ${HY}L1000 ${HY - 330}L2320 ${HY - 330}L2320 ${HY}Z`, mix(C.paperDark, C.ink, 0.1), 1);
        L0(gateG, `M1000 ${HY}L1000 ${HY - 330}L2320 ${HY - 330}`, C.ink, 3, 0.9);
        P0(gateG, `M${gx - 90} ${HY}L${gx - 90} ${HY - 160}Q${gx - 90} ${HY - 250} ${gx} ${HY - 250}Q${gx + 90} ${HY - 250} ${gx + 90} ${HY - 160}L${gx + 90} ${HY}Z`, mix(C.paperLight, C.stain, 0.35), 1);
        L0(gateG, `M${gx - 90} ${HY}L${gx - 90} ${HY - 160}Q${gx - 90} ${HY - 250} ${gx} ${HY - 250}Q${gx + 90} ${HY - 250} ${gx + 90} ${HY - 160}L${gx + 90} ${HY}`, C.ink, 3.4, 1);
        let cs = ''; for (let y = HY - 280; y < HY; y += 50) cs += `M1000 ${y}L${gx - 100} ${y}M${gx + 100} ${y}L2320 ${y}`;
        L0(gateG, cs, C.inkSoft, 1.4, 0.35);
        BTL.glow(svg, defs, gx, HY - 100, 160, C.gold, 0.3, gateG);
      }
      const car = el(g, 'g');
      const n = mode === 'road' ? 1 : (mode === 'gate' ? 5 : 6), list = [];
      for (let i = 0; i < n; i++) {
        let x, y, s;
        if (mode === 'road') { x = 1200; y = HY + 40; s = 0.32; }
        else if (mode === 'gate') { x = 300 + i * 200; y = HY + 30; s = 0.9; }
        else if (mode === 'away') { x = 420 + i * 170; y = HY + 262 - i * 170 * 0.17; s = 0.62 - i * 0.03; }
        else { x = 120 + i * 180; y = HY + 250 - i * 34; s = 0.82 - i * 0.07; }
        list.push(camel(car, x, y, s));
      }
      // a walking leader with a staff
      if (mode !== 'road') { const p = BTL.person(car, 'stand', mode === 'gate' ? 1240 : (mode === 'away' ? 1460 : 1240), mode === 'gate' ? HY + 30 : (mode === 'away' ? HY + 262 - 1040 * 0.17 : HY + 46), mode === 'gate' ? 200 : 120, { color: mix(C.paperDark, C.ink, 0.5), rim: mix(C.paperDark, C.ink, 0.6) }); }
      const lab = P.label ? T(g, P.label, 960, 220, 66, { weight: 300 }) : null;
      const ds = ANI.dust(g, 23, 30, [-100, HY - 200, 2020, HY + 360], { alpha: 0.35 });
      const kick = ANI.puffs(g, 6, 8, { defs, x0: mode === 'away' ? 900 : 500, y0: HY + 200, dx: -200, dy: -120, size: 70, spread: 600, alpha: 0.06, rate: 0.07 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); kick.update(lt, mode === 'road' ? 0 : 1); sun.set(0.34 + 0.04 * Math.sin(lt * 0.4));
          disc.setAttribute('d', BTL.E(sunX, 520 + 30 * BTL.ease(lt, 0, Math.max(5, dur)), 56, 56));
          const v = mode === 'road' ? 6 : (mode === 'gate' ? 22 : 16);
          car.setAttribute('transform', mode === 'away' ? `translate(${f1(v * lt)} ${f1(-0.17 * v * lt)})` : `translate(${f1(v * lt)} ${f1(mode === 'come' ? -0.18 * v * lt : 0)})`);
          const hit = cue(cues, 'hit', dur * 0.4);
          if (roadN) { stroke(roadN, BTL.ease(lt, 0.2, 2.4)); road.setAttribute('stroke-opacity', (0.6 * (1 - 0.7 * BTL.ease(lt, hit, 1.6))).toFixed(3)); }
          if (lab) fade(lab, BTL.ease(lt, hit, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_city
  SH.bt_an_city = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'lit', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 540, k: 1.5 });
      const GY = 800, dark = mode === 'dark';
      const st = BTL.stars(g, 120, 51, [-200, -100, 2120, 360]);
      const glow = BTL.glow(svg, defs, 960, 560, 760, C.stain, 0.22, g);
      const lamps = [];
      if (mode === 'bazaar') {
        ANI.ground(g, GY, { seed: 2, n: 14 });
        // an arcade of five shop arches under a long roof
        const D = BTL.drawing(g);
        D.f(`M180 ${GY}L180 360L1740 360L1740 ${GY}Z`, mix(C.paperLight, C.paperDark, 0.5), 1);
        D.s(`M180 ${GY}L180 360L1740 360L1740 ${GY}M160 360L1760 360M160 330L1760 330`, { w: 3.4 });
        for (let i = 0; i < 5; i++) {
          const x0 = 230 + i * 300, x1 = x0 + 250, top = 470;
          const arch = `M${x0} ${GY}L${x0} ${top}Q${x0} ${top - 90} ${(x0 + x1) / 2} ${top - 90}Q${x1} ${top - 90} ${x1} ${top}L${x1} ${GY}Z`;
          D.f(arch, mix(C.paperDark, C.ink, 0.3), 1); D.s(arch, { w: 3 });
          // goods: jars and sacks
          const cx = (x0 + x1) / 2;
          D.f(`M${cx - 80} ${GY}C${cx - 100} ${GY - 50} ${cx - 90} ${GY - 90} ${cx - 60} ${GY - 96}C${cx - 30} ${GY - 90} ${cx - 20} ${GY - 50} ${cx - 40} ${GY}Z`, mix(C.paperLight, C.red, 0.2), 1);
          D.f(`M${cx + 10} ${GY}C${cx} ${GY - 60} ${cx + 20} ${GY - 76} ${cx + 50} ${GY - 76}C${cx + 80} ${GY - 76} ${cx + 96} ${GY - 60} ${cx + 86} ${GY}Z`, mix(C.paperLight, C.paperDark, 0.6), 1);
          D.s(`M${cx - 80} ${GY}C${cx - 100} ${GY - 50} ${cx - 90} ${GY - 90} ${cx - 60} ${GY - 96}C${cx - 30} ${GY - 90} ${cx - 20} ${GY - 50} ${cx - 40} ${GY}M${cx + 10} ${GY}C${cx} ${GY - 60} ${cx + 20} ${GY - 76} ${cx + 50} ${GY - 76}C${cx + 80} ${GY - 76} ${cx + 96} ${GY - 60} ${cx + 86} ${GY}`, { w: 2.4, color: C.inkSoft });
          L0(g, `M${cx} ${top - 90}L${cx} ${top - 30}`, C.ink, 2, 0.8);
          lamps.push({ e: P0(g, BTL.E(cx, top - 16, 12, 16), C.gold, 0.9), gl: BTL.glow(svg, defs, cx, top - 16, 120, C.gold, 0.25, g), ph: i * 1.3, grp: i % 3 });
        }
        g._D = D;
      } else {
        // the wall in front, houses rising behind it on the slope
        const r = rng(61), H0 = [];
        for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) {
          const w = 120 + r() * 70, h = 90 + r() * 60, x = 60 + i * 210 + row * 50 + r() * 30, y = 560 + row * 90;
          H0.push({ x, y, w, h, row });
        }
        for (const q of H0) {
          const d = `M${f1(q.x)} ${f1(q.y)}L${f1(q.x)} ${f1(q.y - q.h)}L${f1(q.x + q.w)} ${f1(q.y - q.h)}L${f1(q.x + q.w)} ${f1(q.y)}Z`;
          P0(g, d, mix(C.paperDark, C.ink, 0.08 + 0.05 * (2 - q.row)), 1); L0(g, d, C.ink, 2.2, 0.75);
          const wx = q.x + q.w * 0.35, wy = q.y - q.h * 0.55;
          lamps.push({ e: P0(g, `M${f1(wx)} ${f1(wy)}h22v30h-22z`, C.gold, 0.9), gl: null, ph: r() * TAU, grp: Math.floor(r() * 3) });
        }
        // the cathedral above the roofs
        ANI.cathedral(g, 1000, 470, 0.36);
        const front = `M-400 ${GY}L-400 650L2320 650L2320 ${GY}Z`;
        P0(g, front, mix(C.paperLight, C.paperDark, 0.45), 1); L0(g, `M-400 650L2320 650`, C.ink, 3, 0.9);
        let cr = ''; for (let x = -380; x < 2320; x += 56) cr += `M${x} 650L${x} 626L${x + 30} 626L${x + 30} 650`;
        L0(g, cr, C.ink, 2.2, 0.8);
        ANI.ground(g, GY, { seed: 6, n: 18 });
      }
      const lab = P.label ? T(g, P.label, 960, 190, 66, { weight: 300 }) : null;
      const smoke = ANI.puffs(g, 2, mode === 'bazaar' ? 0 : 8, { defs, x0: 900, y0: 420, dx: 80, dy: -240, size: 50, spread: 1100, alpha: 0.1, rate: 0.05 });
      return {
        update(lt, dur, cues) {
          st.update(lt);
          if (g._D) g._D.reveal(BTL.ease(lt, 0, 2.2));
          const t3 = ['a', 'b', 'c'].map((k, i) => cue(cues, k, dur * (0.25 + 0.22 * i)));
          let on = 0;
          lamps.forEach(l => {
            const off = dark ? BTL.ease(lt, t3[l.grp], 1.4) : 0, a = (0.78 + 0.14 * Math.sin(lt * 0.9 + l.ph)) * (1 - off);
            l.e.setAttribute('fill-opacity', a.toFixed(3)); if (l.gl) l.gl.set(0.25 * (1 - off)); on += 1 - off;
          });
          glow.set(0.22 * (dark ? 0.3 + 0.7 * on / lamps.length : 1));
          smoke.update(lt, dark ? 1 - BTL.ease(lt, t3[1], 2) : 1);
          if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', 0.8), 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_line
  SH.bt_an_line = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g');
      const [y0, y1] = P.range || [950, 1350], X0 = portrait ? 120 : 220, X1 = portrait ? W - 120 : W - 220, LY = portrait ? 640 : 520;
      const X = y => X0 + (y - y0) / (y1 - y0) * (X1 - X0);
      BTL.glow(svg, defs, W / 2, LY, 700, C.stain, 0.12, g);
      const base = L0(g, `M${X0} ${LY}L${X1} ${LY}`, C.inkSoft, 2.5, 0.9); stroke(base, 0);
      // centuries
      let tk = ''; for (let y = Math.ceil(y0 / 100) * 100; y <= y1; y += 100) tk += `M${f1(X(y))} ${LY - 10}L${f1(X(y))} ${LY + 10}`;
      const ticks = L0(g, tk, C.inkSoft, 2, 0.6);
      const items = (P.items || []).map((it, i) => {
        const x = X(it.year), up = it.up ?? (i % 2 === 0), ig = el(g, 'g', { opacity: 0 });
        L0(ig, `M${f1(x)} ${LY}L${f1(x)} ${up ? LY - 70 : LY + 70}`, C.gold, 3, 1);
        el(ig, 'circle', { cx: x, cy: LY, r: 10, fill: C.gold });
        const yr = T(ig, String(it.year), x, up ? LY - 96 : LY + 140, 64, { weight: 400 }); yr.setAttribute('opacity', 1);
        const lb = it.label ? ital(ig, it.label, x, up ? LY - 170 : LY + 206, 48, { color: C.inkSoft }) : null; if (lb) lb.setAttribute('opacity', 1);
        return { it, ig, i };
      });
      const note = P.note ? ital(g, P.note, W / 2, portrait ? 1000 : 850, 50, { color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          stroke(base, BTL.ease(lt, 0, 1.4));
          ticks.setAttribute('stroke-opacity', (0.6 * BTL.ease(lt, 0.6, 1)).toFixed(3));
          items.forEach(({ it, ig, i }) => {
            const at = cue(cues, it.at, 0.8 + i * dur * 0.2);
            fade(ig, BTL.ease(lt, at - 0.25, 1) * (it.dim ? 0.45 : 1));
            ig.setAttribute('transform', `translate(0 ${f1((1 - BTL.ease(lt, at - 0.25, 1.4)) * 10)})`);
          });
          if (note) fade(note, BTL.ease(lt, cue(cues, 'note', dur * 0.7), 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_mosque
  SH.bt_an_mosque = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 1060, fy: 500, k: 1.4 });
      const GY = 840, mx = 1100;
      const pool = BTL.glow(svg, defs, mx, 420, 560, C.stain, 0.3, g);
      ANI.ground(g, GY, { seed: 17, n: 22 });
      const D = BTL.drawing(g);
      // the half-ruined prayer hall on the left
      const hall = `M420 ${GY}L420 560L560 560L600 520L660 548L720 500L760 540L860 540L860 ${GY}Z`;
      D.f(hall, mix(C.paperLight, C.paperDark, 0.45), 1); D.s(hall, { w: 3.2 });
      D.s(`M480 ${GY}L480 680Q480 620 530 620Q580 620 580 680L580 ${GY}M640 ${GY}L640 680Q640 620 690 620Q740 620 740 680L740 ${GY}`, { w: 2.6, color: C.inkSoft });
      // the octagonal minaret: three visible faces
      const mt = 200, mw = 60;
      const shaft = `M${mx - mw} ${GY}L${mx - mw + 8} ${mt}L${mx + mw - 8} ${mt}L${mx + mw} ${GY}Z`;
      D.f(shaft, mix(C.paperLight, C.paperDark, 0.4), 1);
      D.f(`M${mx + 20} ${GY}L${mx + 18} ${mt}L${mx + mw - 8} ${mt}L${mx + mw} ${GY}Z`, mix(C.paperDark, C.ink, 0.12), 1);
      D.s(shaft, { w: 3.4 }); D.s(`M${mx - 20} ${GY}L${mx - 18} ${mt}M${mx + 20} ${GY}L${mx + 18} ${mt}`, { w: 2, color: C.inkSoft });
      D.s(`M${mx - mw + 8} ${mt}L${mx - mw + 14} ${mt - 30}L${mx + mw - 14} ${mt - 30}L${mx + mw - 8} ${mt}`, { w: 3 });
      // brick courses
      let bc = ''; for (let y = mt + 40; y < GY; y += 38) { const k = (y - mt) / (GY - mt), hw = mw - 8 + 8 * k; bc += `M${f1(mx - hw)} ${y}L${f1(mx + hw)} ${y}`; }
      D.s(bc, { w: 1.4, color: C.inkSoft, alpha: 0.5 });
      // the Kufic band near the top: blocky angular strokes
      const by = mt + 70;
      let ku = ''; for (let i = 0; i < 6; i++) { const x = mx - 46 + i * 17; ku += i % 2 ? `M${x} ${by + 30}L${x} ${by}L${x + 10} ${by}` : `M${x} ${by + 30}L${x} ${by + 8}M${x - 4} ${by + 30}L${x + 12} ${by + 30}`; }
      D.s(`M${mx - 54} ${by - 10}L${mx + 54} ${by - 10}M${mx - 55} ${by + 42}L${mx + 55} ${by + 42}`, { w: 2.4, color: C.ink });
      const kufi = L0(g, ku, C.ink, 3.2, 1);
      const kg = BTL.glow(svg, defs, mx, by + 16, 150, C.gold, 0, g);
      const lab = P.label ? BTL.fit(T(g, P.label, 1270, 380, 60, { weight: 300, anchor: 'start' }), 600) : null;
      const sub = P.sub ? ital(g, P.sub, 1270, 450, 46, { anchor: 'start', color: C.gold }) : null;
      const ds = ANI.dust(g, 37, 24, [300, 160, 1700, GY], { alpha: 0.35 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); pool.set(0.3 + 0.04 * Math.sin(lt * 0.5));
          D.reveal(BTL.ease(lt, 0, 2.4));
          const hit = cue(cues, 'hit', dur * 0.6), q = BTL.ease(lt, hit - 0.2, 1.4);
          kufi.setAttribute('stroke', q > 0.5 ? C.gold : C.ink); kufi.setAttribute('stroke-opacity', (0.6 + 0.4 * BTL.ease(lt, 1.6, 1)).toFixed(3));
          kg.set(0.35 * q + 0.05 * q * Math.sin(lt * 0.8));
          if (lab) fade(lab, BTL.ease(lt, 0.8, 1.2));
          if (sub) fade(sub, BTL.ease(lt, hit, 1.2));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_an_quake
  SH.bt_an_quake = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.4 });
      const SY = 380;
      const pool = BTL.glow(svg, defs, 960, 300, 600, C.stain, 0.26, g);
      // the plateau's skyline on the surface
      const sky = el(g, 'g');
      ANI.cathedral(sky, 960, SY, 0.3); ANI.church(sky, 700, SY, 0.42); ANI.church(sky, 1220, SY, 0.36); ANI.church(sky, 540, SY, 0.3);
      // the ground in cross-section: layers; the right block sinks a little after the crack
      const cut = 1000;
      const L = el(g, 'g'), R = el(g, 'g');
      const layers = [SY, 470, 570, 690, 820, 1900];
      const cols = [0.62, 0.72, 0.58, 0.8, 0.66];
      for (let i = 0; i < 5; i++) {
        const a = layers[i], b = layers[i + 1];
        P0(L, `M-400 ${a}L${cut} ${a}L${cut} ${b}L-400 ${b}Z`, mix(C.paperDark, C.ink, 0.06 + 0.04 * i), cols[i]);
        P0(R, `M${cut} ${a}L2320 ${a}L2320 ${b}L${cut} ${b}Z`, mix(C.paperDark, C.ink, 0.06 + 0.04 * i), cols[i]);
        L0(L, `M-400 ${b}L${cut} ${b}`, C.inkSoft, 2, 0.6); L0(R, `M${cut} ${b}L2320 ${b}`, C.inkSoft, 2, 0.6);
      }
      L0(L, `M-400 ${SY}L${cut} ${SY}`, C.ink, 3, 0.9); L0(R, `M${cut} ${SY}L2320 ${SY}`, C.ink, 3, 0.9);
      // pebbles
      const r = rng(71); let pb = '';
      for (let i = 0; i < 70; i++) { const x = -300 + r() * 2500, y = SY + 20 + r() * 520; pb += BTL.E(Math.round(x), Math.round(y), Math.round(4 + r() * 6), Math.round(3 + r() * 4)); }
      P0(L, pb, C.inkSoft, 0.3);
      g.insertBefore(L, sky); g.insertBefore(R, sky);
      const crack = L0(g, `M${cut + 40} 900L${cut - 10} 820L${cut + 26} 740L${cut - 18} 650L${cut + 14} 560L${cut - 6} 470L${cut + 10} ${SY}`, C.gold, 5, 1); stroke(crack, 0);
      const crack2 = L0(g, `M${cut - 18} 650L${cut - 90} 600L${cut - 130} 610M${cut + 26} 740L${cut + 110} 700`, C.gold, 3, 0.8); stroke(crack2, 0);
      const lab = P.label ? T(g, P.label, 1560, 200, 74, { weight: 300 }) : null;
      const cloud = lineSmoke(g, cut, SY - 10, 4, { wide: true, half: 160 });
      const ds = ANI.dust(g, 43, 24, [200, 100, 1700, SY + 300], { alpha: 0.3, fall: 2 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); pool.set(0.26 + 0.04 * Math.sin(lt * 0.5));
          const hit = cue(cues, 'hit', dur * 0.35);
          stroke(crack, BTL.ease(lt, hit - 0.3, 1.6)); stroke(crack2, BTL.ease(lt, hit + 0.6, 1.4));
          const q = BTL.ease(lt, hit + 0.4, 2.4);
          R.setAttribute('transform', `translate(0 ${f1(16 * q)})`);
          cloud.update(lt, BTL.ease(lt, hit + 0.2, 1.4));
          if (lab) fade(lab, BTL.ease(lt, hit, 1.2));
        },
      };
    },
  };
  // ------------------------------------------------------------------ bt_an_days: close-up of the wall's big ashlar
  // blocks at dusk; 25 marks are scratched into the stone one after another (every fifth one a gold cross stroke),
  // a thin moon slowly rises above the parapet.  P: {label}  cues: hit (label)
  SH.bt_an_days = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520, k: 1.3 });
      const TOP = 260;
      const sky = BTL.glow(svg, defs, 1500, 160, 420, C.stain, 0.3, g);
      const moon = P0(g, '', C.paperLight, 1), moonL = L0(g, '', C.inkSoft, 2, 0.8);
      P0(g, `M-400 ${TOP}L2320 ${TOP}L2320 1900L-400 1900Z`, mix(C.paperLight, C.paperDark, 0.55), 1);
      let cr = ''; for (let x = -380; x < 2320; x += 220) cr += `M${x} ${TOP}L${x} ${TOP - 90}L${x + 130} ${TOP - 90}L${x + 130} ${TOP}`;
      P0(g, cr.replace(/M(-?\d+) (\d+)L(-?\d+) (\d+)L(-?\d+) (\d+)L(-?\d+) (\d+)/g, 'M$1 $2L$3 $4L$5 $6L$7 $8Z'), mix(C.paperLight, C.paperDark, 0.55), 1);
      L0(g, cr, C.ink, 3, 0.9);
      // ashlar courses
      const r = rng(83); let bl = '';
      for (let y = TOP, row = 0; y < 1300; y += 150, row++) {
        bl += `M-400 ${y}L2320 ${y}`;
        for (let x = -400 + (row % 2) * 160 + r() * 40; x < 2320; x += 300 + r() * 60) bl += `M${f1(x)} ${y}L${f1(x)} ${y + 150}`;
      }
      L0(g, bl, C.inkSoft, 2.2, 0.6);
      let pit = ''; for (let i = 0; i < 60; i++) { const x = -200 + r() * 2300, y = TOP + 20 + r() * 1000; pit += BTL.E(Math.round(x), Math.round(y), Math.round(2 + r() * 3), Math.round(2 + r() * 2)); }
      P0(g, pit, C.inkSoft, 0.35);
      const marks = [];
      for (let i = 0; i < 25; i++) {
        const grp = Math.floor(i / 5), j = i % 5, x = 470 + grp * 210 + j * 30;
        marks.push(j === 4 ? L0(g, `M${x - 132} 650L${x + 10} 470`, C.gold, 6, 1) : L0(g, `M${x} 460L${x + 4} 660`, C.ink, 6, 0.85));
      }
      marks.forEach(m => stroke(m, 0));
      const lab = P.label ? T(g, P.label, 960, 820, 70, { weight: 300, color: C.gold }) : null;
      const ds = ANI.dust(g, 29, 22, [-100, 100, 2020, 900], { alpha: 0.3 });
      return {
        update(lt, dur, cues) {
          ds.update(lt); sky.set(0.3 + 0.04 * Math.sin(lt * 0.4));
          const u = BTL.ease(lt, 0, Math.max(5, dur)), mx = 1380 + 160 * u, my = 190 - 60 * u;
          const md = `M${f1(mx)} ${f1(my - 34)}A34 34 0 0 0 ${f1(mx)} ${f1(my + 34)}A20 34 0 0 1 ${f1(mx)} ${f1(my - 34)}Z`;
          moon.setAttribute('d', md); moonL.setAttribute('d', md);
          const span = Math.max(2.5, dur - 1.8);
          marks.forEach((m, i) => stroke(m, BTL.ease(lt, 0.3 + i * span / 25, 0.3)));
          if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', dur * 0.6), 1.2));
        },
      };
    },
  };
})();
