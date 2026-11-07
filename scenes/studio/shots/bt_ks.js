// bt_ks: the mantel clock of the Small (White) Dining Room of the Winter Palace, Petrograd, the night of 25–26 October
// (7–8 November) 1917, belgesel style (docs/BELGESEL.md). The Aurora fires one blank shot at 21.40; the ministers of the
// Provisional Government wait in the dining room and are arrested at about 2.10; the clock's hands stay at 2.10 and it
// is not wound again until 2017 (TASS). Clean still line art, slow natural motion only (candle flames, water, smoke,
// dust in the light, a slow pendulum). Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame
// shows it as a centred column.
//   bt_ks_clock  P: {mode: "hook"|"close"|"wind", dy, text, sub}  cues: hit   the mantel clock (dome case, round dial,
//                pendulum window) in a pool of light, hands at 2.10. hook: on the mantelpiece above a cold fireplace,
//                dust drifting in the light (cover frame; dy lowers it). close: the dial fills the frame, the minute
//                hand creeps the last minute to 2.10 and stops on "hit", the bezel lights up gold. wind: smaller, the
//                pendulum swings again and the hands move on from 2.10; P.text (e.g. "2017") + P.sub above it
//   bt_ks_city   P: {mode: "night"|"dawn", text, sub}  the Winter Palace's long baroque front across the Neva at night,
//                a few lit windows reflected in the water; night: a year in big thin type above (P.text, P.sub);
//                dawn: no text, a wide warm band on the horizon, the sun rising behind the roof, windows dark, a calm river
//   bt_ks_ship   P: {}  cues: hit   the cruiser Aurora side on (three tall funnels, two masts, bow gun) on the dark
//                river at night, funnel smoke; on "hit" one flash at the bow gun's muzzle and a slow cloud of smoke
//   bt_ks_room   P: {mode: "wait"|"empty"|"years", from, to}  cues: hit   the dining room by candlelight.
//                wait: five faceless seated figures behind a long table, a candelabrum, a tall night window, the small
//                clock on the far wall. empty: the same room, chairs pushed back, a glass on its side; on "hit" the
//                candle goes out and a thread of smoke rises. years: the cold fireplace and the clock on the mantel;
//                window light crosses the wall again and again while a year counts from P.from to P.to; hands never move
//   bt_ks_hall   P: {}  a long dark palace corridor in perspective; three faceless figures approach from its far end,
//                the first carrying a lantern whose light slides along the parquet towards us
//   bt_ks_door   P: {note}  cues: hit   a tall double door in a dark wall, a thread of light flickering under it;
//                on "hit" both leaves swing open, light pours out across the floor and one silhouette stands in it
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
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const R = (x0, y0, x1, y1) => `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`;
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

  // dust motes drifting slowly up through a light pool
  function motes(g, seed, n, box) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', C.ink, 0), x: r(), y: r(), s: 1.6 + r() * 2.4, v: 0.012 + r() * 0.02, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt) { for (const q of list) {
      const yy = box[1] + (((q.y - q.v * lt) % 1) + 1) % 1 * h, xx = box[0] + q.x * w + 18 * Math.sin(lt * 0.4 + q.ph);
      q.e.setAttribute('d', BTL.E(xx, yy, q.s, q.s));
      q.e.setAttribute('fill-opacity', (0.22 + 0.2 * Math.sin(lt * 0.7 + q.ph)).toFixed(3));
    } } };
  }
  // calm river: dark water below y0 with slow wave lines
  function river(g, y0, seed, o = {}) {
    const r = rng(seed), n = o.n ?? 9, lines = [];
    P0(g, `M-300 ${y0}L1380 ${y0}L1380 2100L-300 2100Z`, C.paperDark, 1);
    L0(g, `M-300 ${y0}L1380 ${y0}`, C.inkSoft, 2, 0.45);
    for (let i = 0; i < n; i++) {
      const u = (i + 1) / n, y = y0 + (o.depth ?? 900) * Math.pow(u, 1.7);
      lines.push({ e: L0(g, '', C.inkSoft, 1.2 + 2 * u, 0.18 + 0.28 * u), y, a: (o.amp ?? 5) * (0.3 + 1.1 * u), wl: 70 + 150 * u, sp: (o.speed ?? 0.5) * (0.6 + r() * 0.5), ph: r() * TAU });
    }
    return { update(lt) { for (const q of lines) {
      let d = '';
      for (let x = -300; x <= 1380; x += 40) d += (x === -300 ? 'M' : 'L') + x + ' ' + f1(q.y + q.a * Math.sin(x / q.wl + lt * q.sp + q.ph) + 0.4 * q.a * Math.sin(x / (q.wl * 0.4) - lt * q.sp * 1.2));
      q.e.setAttribute('d', d);
    } } };
  }
  function puffs(g, seed, n, o) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), ph: i / n, rx: o.size * (0.7 + r() * 0.6) });
    return { update(lt, x0, y0, on = 1) { for (const q of list) {
      const u = (q.ph + lt * (o.rate || 0.12)) % 1, s = 0.5 + 1.1 * u;
      q.e.setAttribute('d', BTL.E(x0 + o.dx * u, y0 + o.dy * u, q.rx * s, q.rx * s * 0.6));
      q.e.setAttribute('fill-opacity', (on * (o.alpha || 0.2) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ the mantel clock (dial centre at 0,0)
  // hour/minute angles in degrees clockwise from 12. 2.10 -> hour 65, minute 60
  function clock(parent, x, y, k) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y}) scale(${k})` });
    const caseD = 'M-200 300L-200-170C-200-290-110-330 0-330C110-330 200-290 200-170L200 300Z';
    const dark = mix(C.paperLight, C.ink, 0.12);
    P0(g, caseD, dark, 1);
    // pendulum window (behind the case line), its pendulum clipped
    const winD = 'M-62 292L-62 236C-62 200 62 200 62 236L62 292Z';
    P0(g, winD, C.paperDark, 1);
    const cid = 'kswin' + (++UID), cp = el(g, 'clipPath', { id: cid }); el(cp, 'path', { d: winD });
    const pw = el(g, 'g', { 'clip-path': `url(#${cid})` });
    const pend = el(pw, 'g');
    L0(pend, 'M0 120L0 262', C.gold, 3, 0.9);
    P0(pend, BTL.E(0, 264, 20, 20), C.gold, 0.85);
    L0(g, winD, C.ink, 2.5, 0.9);
    L0(g, caseD, C.ink, 3.5, 1);
    // columns, cornice, plinth, finial
    L0(g, 'M-176-150L-176 290M176-150L176 290M-188-150L-164-150M164-150L188-150M-188 290L-164 290M164 290L188 290', C.inkSoft, 2.5, 0.9);
    L0(g, 'M-206-176C-120-190 120-190 206-176', C.inkSoft, 2, 0.7);
    const pl = 'M-236 300L236 300L250 344L-250 344Z';
    P0(g, pl, dark, 1); L0(g, pl, C.ink, 3, 1);
    L0(g, 'M-226 322L226 322', C.inkSoft, 2, 0.6);
    P0(g, BTL.E(0, -350, 18, 22), dark, 1); L0(g, BTL.E(0, -350, 18, 22) + 'M0-372L0-394', C.ink, 3, 1);
    L0(g, 'M-120-286C-80-270-40-266 0-266C40-266 80-270 120-286', C.inkSoft, 2, 0.6);
    // dial: gold bezel, cream face, ticks
    P0(g, BTL.E(0, 0, 172, 172), C.gold, 0.55);
    P0(g, BTL.E(0, 0, 156, 156), mix(C.paperLight, C.ink, 0.78), 1);
    L0(g, BTL.E(0, 0, 172, 172), C.ink, 3, 1);
    L0(g, BTL.E(0, 0, 156, 156), C.paperDark, 2, 0.8);
    let tk = '', tb = '';
    for (let i = 0; i < 60; i++) {
      const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r0 = big ? 118 : 134, r1 = 146;
      const s = `M${f1(Math.sin(a) * r0)} ${f1(-Math.cos(a) * r0)}L${f1(Math.sin(a) * r1)} ${f1(-Math.cos(a) * r1)}`;
      if (big) tb += s; else tk += s;
    }
    L0(g, tk, C.paperDark, 2, 0.7);
    L0(g, tb, C.paperDark, 6, 0.95);
    L0(g, BTL.E(0, 0, 110, 110), C.paperDark, 1.5, 0.35);
    // hands
    // minute hand: thin, dark, reaching the minute ticks; hour hand on top: short (~45 % of the radius), broad, gold
    // with a dark edge, no ring, no tail. At 2.10 they nearly overlap, so colour and width keep them apart.
    const minute = el(g, 'g'), hour = el(g, 'g');
    const mD = 'M-3.5 6L-3-116L0-146L3-116L3.5 6Z', hD = 'M-11 2L-9-52L0-72L9-52L11 2Z';
    P0(minute, mD, C.paperDark, 1);
    P0(hour, hD, C.gold, 1); L0(hour, hD, C.paperDark, 2.5, 1);
    P0(g, BTL.E(0, 0, 10, 10), C.paperDark, 1);
    const ring = L0(g, BTL.E(0, 0, 172, 172), C.gold, 10, 0);   // on cue: the bezel lights up
    return {
      g,
      set(ha, ma) { hour.setAttribute('transform', `rotate(${f1(ha)})`); minute.setAttribute('transform', `rotate(${f1(ma)})`); },
      gold(a) { ring.setAttribute('stroke-opacity', (0.9 * a).toFixed(3)); },
      swing(deg) { pend.setAttribute('transform', `rotate(${f1(deg)} 0 120)`); },
    };
  }
  // the fireplace below a mantel shelf at y (centre x)
  function fireplace(g, x, y, w, h) {
    const sh = `M${x - w / 2 - 30} ${y}L${x + w / 2 + 30} ${y}L${x + w / 2 + 30} ${y + 26}L${x - w / 2 - 30} ${y + 26}Z`;
    const sur = `M${x - w / 2} ${y + 26}L${x + w / 2} ${y + 26}L${x + w / 2} ${y + h}L${x - w / 2} ${y + h}Z`;
    const ow = w * 0.62, oy = y + 26 + h * 0.2;
    const open = `M${x - ow / 2} ${y + h}L${x - ow / 2} ${oy + ow * 0.25}C${x - ow / 2} ${oy - 10} ${x + ow / 2} ${oy - 10} ${x + ow / 2} ${oy + ow * 0.25}L${x + ow / 2} ${y + h}Z`;
    P0(g, sur, C.paperLight, 0.9); P0(g, open, C.paperDark, 1);
    P0(g, sh, mix(C.paperLight, C.ink, 0.1), 1);
    L0(g, sur + open, C.inkSoft, 2.5, 0.8); L0(g, sh, C.ink, 3, 1);
    // a cold grate
    const gy = y + h - 40;
    L0(g, `M${x - ow * 0.32} ${gy}L${x + ow * 0.32} ${gy}M${x - ow * 0.3} ${gy - 46}L${x - ow * 0.3} ${gy}M${x - ow * 0.1} ${gy - 52}L${x - ow * 0.1} ${gy}M${x + ow * 0.1} ${gy - 52}L${x + ow * 0.1} ${gy}M${x + ow * 0.3} ${gy - 46}L${x + ow * 0.3} ${gy}`, C.inkSoft, 2.5, 0.5);
  }
  // panelled wall lines
  function panels(g, y0, y1, step = 260) {
    let d = '';
    for (let x = -130; x < 1200; x += step) d += R(x + 20, y0 + 40, x + step - 20, y1 - 40);
    L0(g, d, C.inkSoft, 1.6, 0.18);
  }

  // ------------------------------------------------------------------ bt_ks_clock
  SH.bt_ks_clock = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', g0 = canvas(svg, W, H), gp = el(g0, 'g');
      bg(gp);
      const g = el(gp, 'g', { transform: `translate(0 ${P.dy || 0})` });
      let CX = 540, CY = 760, K = 0.95;
      if (mode === 'close') { CY = 540; K = 1.75; }
      if (mode === 'wind') { CY = 880; K = 0.82; }
      const shelf = CY + 344 * K;
      P0(g, `M-300-300L1380-300L1380 ${shelf}L-300 ${shelf}Z`, C.paperLight, 0.35);
      if (mode !== 'close') { panels(g, -300, shelf); fireplace(g, CX, shelf, 760, 900); }
      const pool = BTL.glow(svg, defs, CX, CY - 20 * K, 520 * Math.min(1.6, K), C.stain, 0.3, g);
      const M = motes(g, 31, 26, [CX - 460, CY - 520, CX + 460, CY + 380]);
      const ck = clock(g, CX, CY, K);
      const text = P.text ? txt(gp, P.text, 540, 330, 200, { weight: 300 }) : null;
      const sub = P.sub ? txt(gp, P.sub, 540, 420, 64, { font: LO, italic: true, color: C.inkSoft, weight: 400 }) : null;
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.55);
          push(gp, lt, dur, CX, CY, mode === 'close' ? 0.05 : 0.035);
          pool.set(0.28 + 0.04 * Math.sin(lt * 0.6));
          M.update(lt);
          if (mode === 'close') {
            // the last minute creeps by and stops on 2.10
            const p = BTL.ease(lt, 0.2, Math.max(0.6, hit - 0.2));
            const ma = 54 + 6 * p, ha = 60 + 5 + (ma - 60) / 12;
            ck.set(ha, ma);
            ck.gold(BTL.ease(lt, hit, 0.9));
            ck.swing(6 * Math.sin(lt * 2.2) * (1 - p));
          } else if (mode === 'wind') {
            const p = BTL.ease(lt, 0.3, 1.2);
            const ma = 60 + 3 * Math.max(0, lt - 0.3);
            ck.set(65 + (ma - 60) / 12, ma);
            ck.swing(9 * Math.sin(lt * 2.4) * p);
            ck.gold(0.6 * BTL.ease(lt, cue(cues, 'hit', dur * 0.5), 1));
            fade(text, BTL.ease(lt, 0.1, 1.1)); fade(sub, BTL.ease(lt, 0.6, 1.1));
          } else {
            ck.set(65, 60); ck.swing(0);
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the Winter Palace front (horizon at HY)
  function palace(parent, HY, seed) {
    const g = el(parent, 'g', { transform: `translate(540 ${HY}) scale(1.35) translate(-540 ${-HY})` });
    const body = mix(C.paper, C.ink, 0.16), rim = C.inkSoft;
    const blocks = [[-160, 120, 190], [120, 420, 170], [420, 660, 215], [660, 960, 170], [960, 1240, 190]];
    const r = rng(seed); let wins = '', lit = '', cols = '', stat = '';
    for (const [x0, x1, h] of blocks) {
      P0(g, R(x0, HY - h, x1, HY), body, 1);
      L0(g, `M${x0} ${HY}L${x0} ${HY - h}L${x1} ${HY - h}L${x1} ${HY}`, rim, 2, 0.8);
      L0(g, `M${x0} ${HY - h + 14}L${x1} ${HY - h + 14}M${x0} ${HY - h * 0.5}L${x1} ${HY - h * 0.5}`, rim, 1.4, 0.5);
      for (let x = x0 + 14; x < x1 - 12; x += 24) {
        stat += `M${x} ${HY - h}L${x} ${HY - h - 14}` + BTL.E(x, HY - h - 19, 4, 5);
        cols += `M${x + 12} ${HY - h + 20}L${x + 12} ${HY - 6}`;
        for (const [yy, wh] of [[HY - h + 28, h * 0.3], [HY - h * 0.5 + 12, h * 0.3]]) {
          const wd = `M${x - 6} ${f1(yy + wh)}L${x - 6} ${f1(yy + 6)}C${x - 6} ${f1(yy - 2)} ${x + 6} ${f1(yy - 2)} ${x + 6} ${f1(yy + 6)}L${x + 6} ${f1(yy + wh)}Z`;
          if (r() < 0.07) lit += wd; else wins += wd;
        }
      }
      if (x0 === 420) {   // the central pediment
        const pd = `M${x0 + 30} ${HY - h}L540 ${HY - h - 50}L${x1 - 30} ${HY - h}Z`;
        P0(g, pd, body, 1); L0(g, pd, rim, 2, 0.8);
      }
    }
    P0(g, wins, C.paperDark, 0.9);
    const litE = P0(g, lit, C.gold, 0.75);
    L0(g, cols, rim, 1.2, 0.3);
    L0(g, stat, rim, 2, 0.7);
    return { litE, lit };
  }

  // ------------------------------------------------------------------ bt_ks_city
  SH.bt_ks_city = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'night', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const HY = 1010, dawn = mode === 'dawn';
      const st = BTL.stars(g, dawn ? 30 : 110, 17, [-100, 0, 1180, HY - 300]);
      const sky = BTL.glow(svg, defs, 540, HY - 60, 760, C.stain, dawn ? 0.34 : 0.18, g);
      // dawn: a wide warm band on the horizon and the sun slowly rising behind the palace roof
      const band = dawn ? BTL.glow(svg, defs, 540, HY - 200, 1100, C.gold, 0.32, g) : null;
      // the sun stays below the horizon: only a pale glow rises behind the roof
      const sunG = dawn ? BTL.glow(svg, defs, 540, HY, 420, C.gold, 0.3, g) : null;
      const pal = palace(g, HY, 1917);
      if (dawn) pal.litE.setAttribute('fill-opacity', 0);
      const rv = river(g, HY, 7, { amp: dawn ? 3 : 6, speed: dawn ? 0.3 : 0.5 });
      // reflections of the lit windows: soft gold streaks under the palace
      const r = rng(26), refl = [];
      if (!dawn) for (let i = 0; i < 16; i++) { const x = 40 + r() * 1000, y = HY + 30 + r() * 220; refl.push({ e: L0(g, `M${f1(x - 10)} ${f1(y)}L${f1(x + 10)} ${f1(y)}`, C.gold, 3, 0), ph: r() * TAU }); }
      else for (let i = 0; i < 12; i++) { const y = HY + 24 + i * i * 4, w = 60 + i * 14; refl.push({ e: L0(g, `M${f1(540 - w / 2)} ${f1(y)}L${f1(540 + w / 2)} ${f1(y)}`, C.gold, 2.5, 0), ph: r() * TAU }); }
      const yr = P.text ? txt(g, P.text, 540, 400, 230, { weight: 300 }) : null;
      const sub = P.sub ? txt(g, P.sub, 540, 490, 64, { font: LO, italic: true, color: C.inkSoft, weight: 400 }) : null;
      const rule = el(g, 'path', { d: 'M400 535L680 535', stroke: C.gold, 'stroke-width': 2.5, fill: 'none', pathLength: 1 });
      draw(rule, 0);
      if (!P.text) rule.remove();
      return {
        update(lt, dur) {
          push(g, lt, dur, 540, HY, 0.035);
          st.update(lt); rv.update(lt);
          sky.set((dawn ? 0.3 + 0.08 * BTL.ease(lt, 0, Math.max(3, dur)) : 0.18) + 0.02 * Math.sin(lt * 0.7));
          if (dawn) {
            const p = BTL.ease(lt, 0, Math.max(3, dur));
            sunG.e.setAttribute('cy', f1(HY - 120 * p)); sunG.set(0.22 + 0.14 * p);
            band.set(0.28 + 0.12 * p);
          }
          if (!dawn) pal.litE.setAttribute('fill-opacity', (0.7 + 0.08 * Math.sin(lt * 0.9)).toFixed(3));
          for (const q of refl) q.e.setAttribute('stroke-opacity', ((dawn ? 0.3 : 0.4) + 0.25 * Math.sin(lt * 1.2 + q.ph)).toFixed(3));
          if (yr) { fade(yr, BTL.ease(lt, 0.05, 1.1)); fade(sub, BTL.ease(lt, 0.5, 1.1)); draw(rule, BTL.ease(lt, 0.7, 1.2)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ks_ship
  SH.bt_ks_ship = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const WY = 1060;
      const st = BTL.stars(g, 90, 44, [-100, 0, 1180, 640]);
      const sky = BTL.glow(svg, defs, 540, WY - 160, 700, C.stain, 0.18, g);
      // the far bank, a few lights
      P0(g, `M-300 ${WY - 34}L1380 ${WY - 30}L1380 ${WY}L-300 ${WY}Z`, mix(C.paper, C.ink, 0.06), 1);
      const rr = rng(3); let bl = '';
      for (let i = 0; i < 26; i++) { const x = -40 + rr() * 1160, y = WY - 10 - rr() * 16, s = 1.6 + rr() * 1.6; bl += BTL.E(x, y, s, s); }
      P0(g, bl, C.gold, 0.4);
      const rv = river(g, WY, 12, { amp: 5, speed: 0.55, n: 10 });
      const SK = 0.86, sx = x => 540 + SK * (x - 540);
      const ship = el(g, 'g', { transform: `translate(540 ${WY}) scale(${SK}) translate(-540 0)` });
      const body = mix(C.paper, C.ink, 0.22), rim = C.ink;
      // masts and rigging behind
      L0(ship, 'M310-110L310-470M830-100L830-430', rim, 5, 1);
      L0(ship, 'M280-400L340-400M800-370L860-370', rim, 3, 1);
      L0(ship, 'M70-112L310-470L830-430L1010-96', C.inkSoft, 1.4, 0.55);
      // three tall raked funnels
      const funTops = [];
      for (const fx of [450, 560, 670]) {
        const fd = `M${fx - 20} -110L${fx - 6} -360L${fx + 30} -360L${fx + 22} -110Z`;
        P0(ship, fd, mix(C.paper, C.ink, 0.3), 1); L0(ship, fd, rim, 3, 1);
        L0(ship, `M${fx - 14} -320L${fx + 26} -320`, rim, 2, 0.8);
        funTops.push([sx(fx + 12), -362 * SK]);
      }
      // superstructure: bridge forward, deckhouse aft
      const sup = 'M240-110L240-170L380-170L380-110ZM760-110L760-150L900-150L900-110Z';
      P0(ship, sup, body, 1); L0(ship, sup, rim, 2.5, 1);
      L0(ship, 'M230-170L390-170L390-182L230-182Z', rim, 2, 0.9);
      // hull: straight stem on the left (bow), rounded stern on the right
      const hull = 'M60-112L80 0L1000 0C1018-30 1026-64 1030-96L1030-104C700-108 300-108 60-112Z';
      P0(ship, hull, body, 1);
      let ph = ''; for (let i = 0; i < 22; i++) { const x = 130 + i * 40; ph += BTL.E(x, -60, 5, 5); }
      P0(ship, ph, C.gold, 0.5);
      L0(ship, hull, rim, 3, 1);
      L0(ship, 'M70-80L1026-72', C.inkSoft, 1.6, 0.5);
      // bow gun behind a shield, stern gun
      const sh1 = 'M110-112L110-150L170-150L182-112Z';
      P0(ship, sh1, body, 1); L0(ship, sh1, rim, 2.5, 1);
      L0(ship, 'M118-136L30-142', rim, 6, 1);
      const sh2 = 'M930-104L930-138L980-138L990-104Z';
      P0(ship, sh2, body, 1); L0(ship, sh2, rim, 2.5, 1);
      L0(ship, 'M984-124L1050-128', rim, 5, 1);
      const smoke = funTops.map((p, i) => puffs(g, 60 + i, 5, { size: 30, dx: 260, dy: -200, rate: 0.1, alpha: 0.16 }));
      // the shot: flash at the muzzle, a cloud of smoke rolling out
      const MZ = [sx(30), WY - 142 * SK];
      const flash = BTL.glow(svg, defs, MZ[0], MZ[1], 300, C.gold, 0, g);
      const core = P0(g, BTL.E(MZ[0], MZ[1], 26, 18), C.ink, 0);
      const cloud = [0, 1, 2, 3, 4].map(() => P0(g, '', C.inkSoft, 0));
      const wflash = L0(g, `M20 ${WY + 40}L260 ${WY + 40}M50 ${WY + 90}L220 ${WY + 90}`, C.gold, 4, 0);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5) - 0.25;
          push(g, lt, dur, 540, WY - 200, 0.035);
          st.update(lt); rv.update(lt);
          sky.set(0.18 + 0.02 * Math.sin(lt * 0.7));
          funTops.forEach((p, i) => smoke[i].update(lt + i * 1.3, p[0], WY + p[1]));
          const s = lt - hit, on = s >= 0;
          const fl = on ? Math.exp(-s * 1.5) : 0;
          flash.set(0.85 * fl); core.setAttribute('fill-opacity', (0.95 * fl).toFixed(3));
          wflash.setAttribute('stroke-opacity', (0.6 * fl).toFixed(3));
          cloud.forEach((e, i) => {
            if (!on) { e.setAttribute('fill-opacity', 0); return; }
            const u = clamp01(s / 3.5), rx = 40 + 140 * u + i * 16;
            e.setAttribute('d', BTL.E(MZ[0] + 20 + 30 * u + i * 34, MZ[1] - 20 - 120 * u - i * 36 * u, rx, rx * 0.55));
            e.setAttribute('fill-opacity', (0.28 * (1 - u * 0.6) * clamp01(s / 0.3)).toFixed(3));
          });
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ks_room
  function candle(g, x, y, h) {
    L0(g, `M${x} ${y}L${x} ${y - h}`, C.ink, 9, 0.9);
    const fl = P0(g, '', C.gold, 0.95), fc = P0(g, '', C.ink, 0.8);
    return {
      update(lt, k, ph = 0) {
        const w = 0.5 * Math.sin(lt * 2.1 + ph) + 0.3 * Math.sin(lt * 3.4 + ph * 2), ty = y - h - 6, hh = (34 + 4 * w) * k, ww = 11 * k;
        fl.setAttribute('d', k <= 0.01 ? '' : `M${x} ${f1(ty - hh)}C${f1(x + ww)} ${f1(ty - hh * 0.4)} ${f1(x + ww)} ${ty} ${x} ${ty + 4}C${f1(x - ww)} ${ty} ${f1(x - ww)} ${f1(ty - hh * 0.4)} ${x} ${f1(ty - hh)}Z`);
        fc.setAttribute('d', k <= 0.01 ? '' : BTL.E(x, ty - 6, 3.5 * k, 7 * k));
      },
      tip: [x, y - h - 20],
    };
  }
  SH.bt_ks_room = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'wait', g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      if (mode === 'years') {
        const FY = 1420;
        P0(g, `M-300-300L1380-300L1380 ${FY}L-300 ${FY}Z`, C.paperLight, 0.4);
        panels(g, 140, FY);
        // the tall window on the left, night beyond
        const win = 'M-40 300L190 300L190 1120L-40 1120Z';
        P0(g, win, C.paperDark, 1); L0(g, win + 'M75 300L75 1120M-40 570L190 570M-40 840L190 840', C.ink, 3, 0.8);
        const lp = P0(g, '', C.stain, 0);   // window light crossing the wall: days passing
        P0(g, `M-300 ${FY}L1380 ${FY}L1380 2100L-300 2100Z`, C.paperDark, 1);
        L0(g, `M-300 ${FY}L1380 ${FY}`, C.ink, 2.5, 0.5);
        let fl = ''; for (let x = -200; x <= 1300; x += 220) fl += `M540 ${FY}L${x} 2100`;
        L0(g, fl, C.inkSoft, 1.5, 0.18);
        const SY = 900;
        fireplace(g, 600, SY, 520, FY - SY);
        const pool = BTL.glow(svg, defs, 600, SY - 220, 420, C.stain, 0.22, g);
        const ck = clock(g, 600, SY - 344 * 0.62, 0.62); ck.set(65, 60);
        const M = motes(g, 77, 18, [320, 300, 880, SY]);
        const from = P.from ?? 1917, to = P.to ?? 2016;
        const yr = txt(g, String(from), 600, 300, 150, { weight: 300 });
        return {
          update(lt, dur) {
            push(g, lt, dur, 600, 700, 0.035);
            M.update(lt);
            const p = BTL.ease(lt, 0.3, Math.max(1, dur - 0.8));
            yr.textContent = String(Math.round(from + (to - from) * p));
            fade(yr, BTL.ease(lt, 0, 0.6));
            const u = (lt / 2.6) % 1, x = 200 + 1000 * u, a = Math.sin(Math.PI * u);
            lp.setAttribute('d', `M${f1(x)} 420L${f1(x + 170)} 380L${f1(x + 200)} 1180L${f1(x + 30)} 1220Z`);
            lp.setAttribute('fill-opacity', (0.12 * a).toFixed(3));
            pool.set(0.2 + 0.03 * Math.sin(lt * 0.8));
          },
        };
      }
      const FY = 1100, TY = 930;
      P0(g, `M-300-300L1380-300L1380 ${FY}L-300 ${FY}Z`, C.paperLight, 0.35);
      panels(g, 120, FY, 300);
      // a tall arched night window on the left
      const win = 'M70 820L70 420C70 300 330 300 330 420L330 820Z';
      P0(g, win, C.paperDark, 1);
      const sw = el(g, 'g', { 'clip-path': `url(#kswn${++UID})` });
      const cp = el(defs, 'clipPath', { id: 'kswn' + UID }); el(cp, 'path', { d: win });
      const st = BTL.stars(sw, 30, 8, [70, 300, 330, 820]);
      L0(g, win + 'M200 320L200 820M70 560L330 560', C.ink, 3, 0.8);
      // the small clock on the far wall (right), on its mantel
      fireplace(g, 860, 600, 200, 300);
      const ck = clock(g, 860, 600 - 344 * 0.26, 0.26); ck.set(65, 60);
      P0(g, `M-300 ${FY}L1380 ${FY}L1380 2100L-300 2100Z`, C.paperDark, 1);
      L0(g, `M-300 ${FY}L1380 ${FY}`, C.ink, 2.5, 0.5);
      let fl = ''; for (let x = -200; x <= 1300; x += 220) fl += `M540 ${FY}L${x} 2100`;
      L0(g, fl, C.inkSoft, 1.5, 0.16);
      const pool = BTL.glow(svg, defs, 560, 800, 560, C.stain, 0.3, g);
      // figures (wait) or pushed-back chairs (empty) behind the table
      const X = [170, 320, 470, 700, 860];
      const fc = mix(C.paper, C.ink, 0.42);
      if (mode === 'wait') {
        for (const [i, x] of X.entries()) {
          // head, neck and sloping shoulders above the table edge: people, not stones
          const y = TY + 4 + (i % 2) * 6, d = i % 2 ? 4 : -4;
          const sh = `M${x - 84} ${y}L${x - 82} ${y - 46}C${x - 80} ${y - 78} ${x - 56} ${y - 88} ${x - 22} ${y - 94}L${x - 13 + d} ${y - 112}` +
            `L${x + 13 + d} ${y - 112}L${x + 22} ${y - 94}C${x + 56} ${y - 88} ${x + 80} ${y - 78} ${x + 82} ${y - 46}L${x + 84} ${y}Z`;
          P0(g, sh, fc, 1); L0(g, sh, C.ink, 2.5, 0.8);
          L0(g, `M${x - 42} ${y - 86}L${x - 46} ${y - 10}M${x + 42} ${y - 86}L${x + 46} ${y - 10}`, C.paperDark, 2, 0.5);
          const hd = BTL.E(x + d, y - 140, 28, 33);
          P0(g, hd, fc, 1); L0(g, hd, C.ink, 2.5, 0.8);
        }
      } else {
        const rot = [0, -10, 0, 8, -14];
        for (const [i, x] of X.entries()) {
          const cg = el(g, 'g', { transform: `rotate(${rot[i]} ${x} ${TY}) translate(${i % 2 ? 24 : 0} ${i % 2 ? -10 : 0})` });
          // a tall chair back: two posts with finials, a curved top rail, a pierced splat; the room shows through
          L0(cg, `M${x - 44} ${TY}L${x - 44} ${TY - 200}M${x + 44} ${TY}L${x + 44} ${TY - 200}`, C.inkSoft, 7, 1);
          L0(cg, `M${x - 50} ${TY - 186}C${x - 20} ${TY - 206} ${x + 20} ${TY - 206} ${x + 50} ${TY - 186}`, C.inkSoft, 8, 1);
          L0(cg, `M${x - 44} ${TY - 70}L${x + 44} ${TY - 70}`, C.inkSoft, 5, 0.9);
          L0(cg, `M${x} ${TY - 72}C${x - 22} ${TY - 110} ${x - 22} ${TY - 160} ${x} ${TY - 190}C${x + 22} ${TY - 160} ${x + 22} ${TY - 110} ${x} ${TY - 72}`, C.inkSoft, 3, 0.8);
          P0(cg, BTL.E(x - 44, TY - 206, 7, 8) + BTL.E(x + 44, TY - 206, 7, 8), C.inkSoft, 1);
        }
      }
      // the long table, cloth to the floor
      const cloth = `M60 ${TY}L1020 ${TY}L1036 ${FY + 40}L44 ${FY + 40}Z`;
      P0(g, cloth, C.paperLight, 1);
      let fold = ''; for (let x = 120; x < 1000; x += 110) fold += `M${x} ${TY + 20}C${x - 6} ${TY + 80} ${x + 8} ${FY - 20} ${x - 4} ${FY + 36}`;
      L0(g, fold, C.inkSoft, 1.6, 0.4);
      L0(g, cloth + `M60 ${TY}L1020 ${TY}`, C.ink, 3, 0.9);
      // candelabrum (wait: three candles; empty: one) and a glass
      const CX = 590, cands = [];
      L0(g, `M${CX - 40} ${TY}L${CX + 40} ${TY}M${CX} ${TY}L${CX} ${TY - 110}`, C.gold, 5, 0.9);
      if (mode === 'wait') {
        L0(g, `M${CX - 70} ${TY - 120}C${CX - 70} ${TY - 80} ${CX + 70} ${TY - 80} ${CX + 70} ${TY - 120}`, C.gold, 5, 0.9);
        for (const dx of [-70, 0, 70]) cands.push(candle(g, CX + dx, TY - 116 - (dx ? 0 : 10), 70));
      } else cands.push(candle(g, CX, TY - 110, 70));
      const glass = mode === 'empty' ? `M${CX + 200} ${TY - 4}L${CX + 280} ${TY - 18}L${CX + 284} ${TY + 2}L${CX + 204} ${TY + 14}Z` : `M${CX - 230} ${TY}L${CX - 236} ${TY - 70}L${CX - 194} ${TY - 70}L${CX - 200} ${TY}Z`;
      L0(g, glass, C.ink, 2.5, 0.8);
      const cg = BTL.glow(svg, defs, CX, TY - 210, 230, C.gold, 0.4, g);
      const smoke = [0, 1, 2].map(() => L0(g, '', C.inkSoft, 2.2, 0));
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.6);
          push(g, lt, dur, 560, 820, 0.04);
          st.update(lt);
          const out = mode === 'empty' ? BTL.ease(lt, hit - 0.45, 0.6) : 0;
          cands.forEach((c, i) => c.update(lt, 1 - out, i * 1.7));
          const w = 0.04 * Math.sin(lt * 2.1);
          cg.set((0.4 + w) * (1 - out)); pool.set((0.3 + w * 0.5) * (1 - 0.7 * out));
          smoke.forEach((e, i) => {
            if (mode !== 'empty' || lt < hit - 0.3) { e.setAttribute('stroke-opacity', 0); return; }
            const s = lt - hit + 0.3, u = ((s * 0.4) + i / 3) % 1, [x0, y0] = cands[0].tip;
            e.setAttribute('d', `M${x0} ${f1(y0 - 140 * u)}c${f1(16 * Math.sin(lt * 0.9 + i))} -40 ${f1(-16 * Math.sin(lt * 0.9 + i))} -70 0 -110`);
            e.setAttribute('stroke-opacity', (0.5 * Math.sin(Math.PI * u) * clamp01(s / 0.5)).toFixed(3));
          });
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ks_hall
  // a faceless walking silhouette, 100 units tall (feet at 0); the lantern bearer holds one arm forward at chest height
  function walker(parent, lamp, step) {
    const g = el(parent, 'g');
    const J = { head: [0, -90], sh: [0, -77], hip: [0, -47], k1: [-4 - step, -24], f1: [-7 - 2 * step, 0], k2: [5 + step, -24], f2: [8 + 2 * step, 0],
      e1: [-9, -60], h1: [-11, -44], e2: lamp ? [14, -68] : [9, -60], h2: lamp ? [26, -64] : [11, -44] };
    const ln = ks => 'M' + ks.map(k => J[k].join(' ')).join('L');
    const limbs = [[['hip', 'k1', 'f1'], 5.5], [['hip', 'k2', 'f2'], 5.5], [['sh', 'e1', 'h1'], 4.2], [['sh', 'e2', 'h2'], 4.2], [['sh', 'hip'], 12]];
    for (const [ks, w] of limbs) L0(g, ln(ks), C.inkSoft, w + 2, 0.8);
    for (const [ks, w] of limbs) L0(g, ln(ks), C.paperDark, w, 1);
    P0(g, BTL.E(0, -90, 9.3, 9.3), C.inkSoft, 0.8); P0(g, BTL.E(0, -90, 7.8, 7.8), C.paperDark, 1);
    return g;
  }
  SH.bt_ks_hall = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      // one-point perspective: the far end is a 200 x 280 opening around the vanishing point; every edge is a ray from it
      const VX = 540, VY = 760, HX = 100, HY = 140, U = 12;
      const pt = (u, sx, sy) => [VX + sx * HX * u, VY + sy * HY * u];
      const poly = ps => 'M' + ps.map(q => q.map(f1).join(' ')).join('L') + 'Z';
      P0(g, poly([pt(1, -1, -1), pt(U, -1, -1), pt(U, 1, -1), pt(1, 1, -1)]), C.paperDark, 1);       // ceiling
      P0(g, poly([pt(1, -1, -1), pt(U, -1, -1), pt(U, -1, 1), pt(1, -1, 1)]), C.paperLight, 0.85);   // left wall
      P0(g, poly([pt(1, 1, -1), pt(U, 1, -1), pt(U, 1, 1), pt(1, 1, 1)]), C.paperLight, 0.85);       // right wall
      P0(g, poly([pt(1, -1, 1), pt(U, -1, 1), pt(U, 1, 1), pt(1, 1, 1)]), C.paper, 1);               // floor
      P0(g, poly([pt(1, -1, -1), pt(1, 1, -1), pt(1, 1, 1), pt(1, -1, 1)]), C.paperDark, 1);         // the dark far end
      // receding pilasters (walls) and beams (ceiling): frames at growing depth steps
      // each frame is a full archway (pilasters, ceiling beam, threshold) so the planes read as a hall, not as an X
      for (const [j, u] of [1.3, 1.75, 2.4, 3.3, 4.6, 6.4].entries()) {
        const a = pt(u, -1, -1), b = pt(u, 1, 1);
        L0(g, R(f1(a[0]), f1(a[1]), f1(b[0]), f1(b[1])), C.inkSoft, 2 + j * 0.8, 0.55 - j * 0.05);
        L0(g, R(f1(a[0] + 14 * u), f1(a[1] + 14 * u), f1(b[0] - 14 * u), f1(b[1])), C.inkSoft, 1.2 + j * 0.4, 0.22);
      }
      // parquet: rays across the floor
      let pq = ''; for (let i = -4; i <= 4; i++) { const [x0, y0] = [VX + i * 25, VY + HY], [x1, y1] = [VX + i * 25 * U, VY + HY * U]; pq += `M${x0} ${y0}L${f1(x1)} ${f1(y1)}`; }
      L0(g, pq, C.inkSoft, 1.4, 0.2);
      // the four corner edges and the far opening
      let ed = ''; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const a = pt(1, sx, sy), b = pt(U, sx, sy); ed += `M${f1(a[0])} ${f1(a[1])}L${f1(b[0])} ${f1(b[1])}`; }
      L0(g, ed, C.inkSoft, 1.5, 0.3); L0(g, poly([pt(1, -1, -1), pt(1, 1, -1), pt(1, 1, 1), pt(1, -1, 1)]), C.ink, 2.5, 0.7);
      // light pool on the floor and on the walls, moving with the lantern
      const floorLight = P0(g, '', C.gold, 0);
      const pool = BTL.glow(svg, defs, VX, VY, 260, C.stain, 0.25, g);
      // three walkers: two behind, the lantern bearer in front (drawn last)
      const figs = [{ sx: -0.42, lag: 0.16, step: 3 }, { sx: 0.45, lag: 0.1, step: -3 }, { sx: 0.05, lag: 0, step: 2, lamp: true }]
        .map(f => Object.assign(f, { pg: el(g, 'g') }));
      for (const f of figs) walker(f.pg, f.lamp, f.step);
      const lant = el(g, 'g');
      const lg = BTL.glow(svg, defs, 0, 0, 40, C.gold, 0.6, lant);
      P0(lant, 'M-5-6L5-6L4 8L-4 8Z', C.paperLight, 0.5);
      P0(lant, BTL.E(0, 1, 2.4, 4), C.gold, 1);
      L0(lant, 'M-5-6L5-6L4 8L-4 8ZM0-6L0-11', C.ink, 1, 0.9);
      const u0 = 1.0, u1 = 2.15;
      const place = (u, sx) => { const h = 174 * u, fy = VY + HY * u - 6; return { h, fy, x: VX + sx * HX * u * 0.9 }; };
      return {
        update(lt, dur) {
          push(g, lt, dur, VX, VY, 0.03);
          const p0 = clamp01(lt / Math.max(1.5, dur + 0.3));
          for (const f of figs) {
            const u = u0 + (u1 - u0) * clamp01(p0 - f.lag) - (f.lag ? 0.12 : 0), q = place(u, f.sx);
            f.pg.setAttribute('transform', `translate(${f1(q.x)} ${f1(q.fy)}) scale(${(q.h / 100).toFixed(3)})`);
            if (f.lamp) {
              const k = q.h / 100, hx = q.x + 26 * k, hy = q.fy - 64 * k;
              lant.setAttribute('transform', `translate(${f1(hx)} ${f1(hy + 9 * k)}) scale(${k.toFixed(3)})`);
              lg.set(0.55 + 0.08 * Math.sin(lt * 2.3));
              pool.e.setAttribute('cx', f1(hx)); pool.e.setAttribute('cy', f1(hy)); pool.e.setAttribute('r', f1(150 + 60 * u));
              pool.set(0.22 + 0.04 * Math.sin(lt * 2.3));
              floorLight.setAttribute('d', BTL.E(hx, q.fy + 4, 110 * u, 22 * u));
              floorLight.setAttribute('fill-opacity', (0.16 + 0.04 * Math.sin(lt * 2.3)).toFixed(3));
            }
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_ks_door
  SH.bt_ks_door = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      bg(g);
      const FY = 1160, DX0 = 300, DX1 = 780, DY = 320, MID = 540;
      P0(g, `M-300-300L1380-300L1380 ${FY}L-300 ${FY}Z`, C.paperLight, 0.3);
      panels(g, 60, FY, 340);
      P0(g, `M-300 ${FY}L1380 ${FY}L1380 2100L-300 2100Z`, C.paperDark, 1);
      L0(g, `M-300 ${FY}L1380 ${FY}`, C.ink, 2.5, 0.5);
      let fl = ''; for (let x = -200; x <= 1300; x += 200) fl += `M540 ${FY}L${x} 2100`;
      L0(g, fl, C.inkSoft, 1.4, 0.16);
      // architrave and pediment
      const arch = `M${DX0 - 40} ${FY}L${DX0 - 40} ${DY - 40}L${DX1 + 40} ${DY - 40}L${DX1 + 40} ${FY}`;
      L0(g, arch, C.ink, 4, 0.9);
      L0(g, `M${DX0 - 20} ${FY}L${DX0 - 20} ${DY - 20}L${DX1 + 20} ${DY - 20}L${DX1 + 20} ${FY}`, C.inkSoft, 2, 0.6);
      // a flat palace door cornice (entablature), no pediment
      const ped = R(DX0 - 70, DY - 92, DX1 + 70, DY - 40);
      P0(g, ped, mix(C.paperLight, C.ink, 0.06), 1); L0(g, ped, C.ink, 3, 0.9);
      L0(g, `M${DX0 - 82} ${DY - 104}L${DX1 + 82} ${DY - 104}M${DX0 - 60} ${DY - 66}L${DX1 + 60} ${DY - 66}`, C.inkSoft, 2.5, 0.8);
      // the bright opening behind the leaves
      const gap = P0(g, R(DX0, DY, DX1, FY), mix(C.stain, C.ink, 0.35), 0);
      const sil = el(g, 'g', { opacity: 0 });
      BTL.person(sil, 'stand', MID, FY, 560, { face: 1, color: C.paperDark, rim: C.paperDark });
      // the light on the floor stays faint across the subtitle band (y 1170-1330) and opens out below it
      const wid = 'kswd' + (++UID), wg = el(defs, 'linearGradient', { id: wid, gradientUnits: 'userSpaceOnUse', x1: 0, y1: FY, x2: 0, y2: 1920 });
      for (const [y, a] of [[FY, 0.35], [1175, 0.08], [1330, 0.08], [1420, 1], [1920, 0.7]]) el(wg, 'stop', { offset: ((y - FY) / (1920 - FY)).toFixed(3), 'stop-color': C.gold, 'stop-opacity': a });
      const wedge = P0(g, '', `url(#${wid})`, 0);
      const under = L0(g, `M${DX0 + 10} ${FY - 3}L${DX1 - 10} ${FY - 3}`, C.gold, 4, 0.5);
      // the two leaves (each scaled toward its hinge as it swings open toward us)
      const leaf = (hx, dir) => {
        const lg = el(g, 'g');
        const w = (DX1 - DX0) / 2, x0 = dir > 0 ? hx : hx - w, x1 = x0 + w;
        P0(lg, R(x0, DY, x1, FY), mix(C.paperLight, C.ink, 0.1), 1);
        L0(lg, R(x0, DY, x1, FY), C.ink, 3, 1);
        L0(lg, R(x0 + 34, DY + 40, x1 - 34, DY + 470) + R(x0 + 34, DY + 520, x1 - 34, FY - 50), C.inkSoft, 2.5, 0.8);
        L0(lg, R(x0 + 52, DY + 58, x1 - 52, DY + 452) + R(x0 + 52, DY + 538, x1 - 52, FY - 68), C.inkSoft, 1.4, 0.45);
        const kx = dir > 0 ? x1 - 22 : x0 + 22;
        P0(lg, BTL.E(kx, DY + 495, 9, 9), C.gold, 0.9);
        return { set(o) { lg.setAttribute('transform', `translate(${hx} 0) scale(${(1 - 0.72 * o).toFixed(4)} 1) translate(${-hx} 0)`); } };
      };
      const L = leaf(DX0, 1), Rt = leaf(DX1, -1);
      const shine = BTL.glow(svg, defs, MID, FY - 300, 520, C.stain, 0, g);
      const note = P.note ? txt(g, P.note, 540, 170, 72, { font: LO, italic: true, color: C.gold, weight: 400 }) : null;
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5);
          push(g, lt, dur, MID, 820, 0.035);
          const o = BTL.ease(lt, hit - 0.55, 1.1);
          L.set(o); Rt.set(o);
          gap.setAttribute('fill-opacity', (0.95 * clamp01(o * 2)).toFixed(3));
          sil.setAttribute('opacity', clamp01((o - 0.3) / 0.5).toFixed(3));
          const gw = (DX1 - DX0) * 0.72 * o / 2;
          wedge.setAttribute('d', `M${f1(MID - gw)} ${FY}L${f1(MID + gw)} ${FY}L${f1(MID + gw * 2.6 + 160 * o)} 1920L${f1(MID - gw * 2.6 - 160 * o)} 1920Z`);
          wedge.setAttribute('fill-opacity', (0.2 * o).toFixed(3));
          under.setAttribute('stroke-opacity', ((0.35 + 0.3 * Math.sin(lt * 2.6) * Math.sin(lt * 1.3 + 1)) * (1 - o)).toFixed(3));
          shine.set(0.25 * o + 0.05 * (1 - o) * (0.5 + 0.5 * Math.sin(lt * 1.7)));
          if (note) fade(note, BTL.ease(lt, 0.2, 1));
        },
      };
    },
  };
})();
