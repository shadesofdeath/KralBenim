// bt_laika: Laika and Sputnik 2, 3 November 1957, belgesel style (docs/BELGESEL.md). Clean still line art, slow natural
// motion only (stars breathing, the Earth turning under a limb, drizzle, a flame, a rocket rising, a trace scrolling).
// Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame shows the same canvas as a centred column.
// Nothing in the top-left corner, nothing important in the subtitle band (y 1170-1320) or below y 1500.
//   bt_lk_capsule P: {mode: "window"|"dark"}  cues: hit   Laika's pressurised cabin (a riveted cylinder with a domed top
//                 and two antennas) floating above the Earth's limb; through its round porthole, in a warm pool of light,
//                 the silhouette of a dog's head in profile. window: on "hit" a thin gold ring draws round the porthole.
//                 dark: the light behind the porthole slowly goes out and the head fades into the dark
//   bt_lk_street  P: {}  cues: hit   a Moscow street at night in light drizzle: a row of dark buildings (one onion dome),
//                 wet cobbles, one street lamp; a small stray dog stands in the pool of lamp light, the lamp's reflection
//                 shimmers on the wet stones; on "hit" the pool of light slowly widens round the dog
//   bt_lk_launch  P: {}  cues: hit   night steppe, an R-7 rocket (core + strap-on boosters) on its pad; flames light at
//                 its base, smoke rolls out along the ground and the rocket rises slowly out of the top of the frame
//   bt_lk_vitals  P: {mode: "claim"|"heat", label}  cues: hit
//                 claim: a round oscilloscope screen with a steady heartbeat trace; under it a day counter that ticks
//                 "1. gün" ... "6. gün" from "hit" (the official story); label above (default "Resmî açıklama").
//                 heat: one tall glass thermometer in a pool of light, heat rising off it; from "hit" the red column climbs
//                 to the top and a red glow grows round the bulb
//   bt_lk_file    P: {cover: "1957", page: "2002", stamp: "GİZLİ"}  cues: hit   a closed dossier in a pool of light on a dark
//                 desk, stamped GİZLİ, dust drifting; on "hit" the cover swings open on its hinge and the inside page shows
//                 the year in gold
//   bt_lk_orbit   P: {mode: "tomb"|"burn", days: 162, label}  cues: hit
//                 tomb: the Earth seen from far away; the capsule (a small light) circles it again and again, each pass
//                 leaving a faint orbit line, a day counter climbs to 162; on "hit" the capsule's warm light turns cold.
//                 burn: the Earth's limb; a small gold streak slides down into the atmosphere, flares and goes out;
//                 label above (e.g. "14 Nisan 1958")
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => v.toFixed(1);
  let UID = 0;
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, extra));
  const L0 = (parent, d, stroke, w = 3, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra));
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const circ = (cx, cy, r) => BTL.E(cx, cy, r, r);

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  function clip(parent, d) {
    const id = 'btlk' + (++UID), cp = el(parent, 'clipPath', { id });
    el(cp, 'path', { d });
    return el(parent, 'g', { 'clip-path': `url(#${id})` });
  }

  // ------------------------------------------------------------------ the dog
  // a dog's head in profile, facing right: rounded forehead, short muzzle, two upright ears set a little apart, a
  // harness strap round the neck (origin ~ skull centre, ~210 units tall)
  const HEAD = 'M-70 90C-78 50-78 10-70-18C-66-34-62-46-58-56L-62-102C-62-112-54-116-48-108L-16-68' +
    'C-2-74 16-72 28-62C38-54 46-42 54-34C66-26 78-22 86-16C94-10 94 2 88 8C78 16 64 18 52 22C40 26 30 34 20 44C12 56 8 72 8 90Z';
  const EAR2 = 'M-30-64L-18-106C-14-114-6-112-4-104L6-62Z';
  function dogHead(parent, x, y, k, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y}) scale(${k * (o.face ?? 1)} ${k})` });
    const col = o.color || C.paperDark, rim = o.rim || C.inkSoft;
    P0(g, EAR2, col, 1, { stroke: rim, 'stroke-width': 3 / k, 'stroke-opacity': 0.8 });
    P0(g, HEAD, col, 1, { stroke: rim, 'stroke-width': 3.5 / k, 'stroke-opacity': 0.9 });
    L0(g, 'M-52-92C-48-80-42-72-34-68', rim, 2 / k, 0.5);                 // inner ear line
    P0(g, circ(26, -32, 5.5), C.ink, 0.6);                                 // eye glint
    P0(g, circ(88, -3, 6), rim, 0.6);                                      // nose
    L0(g, 'M-76 62C-50 74-14 76 14 62', rim, 10 / k, 0.9);                 // harness strap
    P0(g, circ(-30, 72, 5), C.gold, 0.85);                                 // its buckle
    return g;
  }
  // a small stray dog standing, side view, facing right; feet at (x, y), h = height to the ear tips
  function dog(parent, x, y, h, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y})${o.face === -1 ? ' scale(-1 1)' : ''}` });
    const col = C.paperDark, rim = C.inkSoft, u = v => f1(v * h);
    const legs = `M${u(-0.3)} ${u(-0.42)}L${u(-0.33)} ${u(-0.2)}L${u(-0.3)} 0M${u(-0.19)} ${u(-0.42)}L${u(-0.2)} ${u(-0.2)}L${u(-0.17)} 0` +
      `M${u(0.24)} ${u(-0.42)}L${u(0.25)} 0M${u(0.34)} ${u(-0.42)}L${u(0.35)} 0`;
    const tail = `M${u(-0.38)} ${u(-0.56)}C${u(-0.56)} ${u(-0.7)} ${u(-0.5)} ${u(-0.92)} ${u(-0.36)} ${u(-0.84)}C${u(-0.3)} ${u(-0.8)} ${u(-0.32)} ${u(-0.72)} ${u(-0.38)} ${u(-0.72)}`;
    const torso = BTL.E(0, -0.5 * h, 0.42 * h, 0.15 * h);
    const lw = 0.075 * h;
    L0(g, legs, rim, lw + 5, 0.85); L0(g, tail, rim, lw + 5, 0.85);
    P0(g, torso, rim, 0.85, { stroke: rim, 'stroke-width': 5 });
    L0(g, legs, col, lw, 1); L0(g, tail, col, lw, 1);
    P0(g, torso, col, 1);
    const k = 0.0026 * h;
    const hd = el(g, 'g', { transform: `translate(${u(0.37)} ${u(-0.86)}) scale(${k.toFixed(4)})` });
    P0(hd, EAR2, col, 1, { stroke: rim, 'stroke-width': 5 / k * 0.6, 'stroke-opacity': 0.85 });
    P0(hd, HEAD, col, 1, { stroke: rim, 'stroke-width': 5 / k * 0.6, 'stroke-opacity': 0.85 });
    P0(g, torso.replace(/^M/, 'M'), col, 1);   // cover the neck seam
    return g;
  }

  // ------------------------------------------------------------------ the Earth
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * clamp01(t)).toString(16).padStart(2, '0')).join(''); };
  // one landmass with an irregular coast: a wobbly closed curve round (x, y)
  function landmass(r, x, y, w, h) {
    const n = 22, ph = [r() * TAU, r() * TAU, r() * TAU], pts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU;
      const k = 1 + 0.22 * Math.sin(3 * a + ph[0]) + 0.14 * Math.sin(5 * a + ph[1]) + 0.08 * Math.sin(9 * a + ph[2]) + (r() - 0.5) * 0.12;
      pts.push([x + Math.cos(a) * w * k, y + Math.sin(a) * h * k]);
    }
    let d = '';
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
      d += (i ? '' : `M${f1((pts[n - 1][0] + p[0]) / 2)} ${f1((pts[n - 1][1] + p[1]) / 2)}`) + `Q${f1(p[0])} ${f1(p[1])} ${f1(m[0])} ${f1(m[1])}`;
    }
    return d + 'Z';
  }
  // a disc of Earth (cx, cy, R); lands = [[x, y, w, h], ...] relative to the centre in units of R; drift px/s
  function earthDisc(parent, svg, defs, cx, cy, R, seed, o = {}) {
    const g = el(parent, 'g'), r = rng(seed);
    const halo = BTL.glow(svg, defs, cx, cy, R * (o.haloK || 1.16), C.blue, 0.4, g);
    P0(g, circ(cx, cy, R), C.paperDark, 1);
    P0(g, circ(cx, cy, R), C.blue, 0.2);
    P0(g, circ(cx, cy, R), C.inkSoft, 0.08);
    const cg = clip(g, circ(cx, cy, R)), land = el(cg, 'g');
    let d = '';
    for (const [lx, ly, lw, lh] of o.lands) d += landmass(r, cx + lx * R, cy + ly * R, lw * R, lh * R);
    P0(land, d, C.green, 0.42);
    L0(land, d, C.green, 2, 0.55);
    let cl = '';
    for (let i = 0; i < (o.clouds ?? 6); i++) {
      const y = cy + (o.cloudY0 ?? -0.8) * R + i * (o.cloudStep ?? 0.28) * R + r() * 0.06 * R, x0 = cx - R * 1.2 + r() * R * 0.8;
      cl += `M${f1(x0)} ${f1(y)}C${f1(x0 + 0.5 * R)} ${f1(y - 0.03 * R)} ${f1(x0 + R)} ${f1(y + 0.02 * R)} ${f1(x0 + (1.3 + r() * 0.5) * R)} ${f1(y - 0.01 * R)}`;
    }
    L0(land, cl, C.ink, Math.max(4, R * 0.012), 0.12);
    if (o.night) P0(cg, `M${cx + R * 0.3} ${cy - R - 10}C${cx + R * 0.86} ${cy - R * 0.4} ${cx + R * 0.86} ${cy + R * 0.4} ${cx + R * 0.3} ${cy + R + 10}L${cx + R + 20} ${cy + R + 10}L${cx + R + 20} ${cy - R - 10}Z`, C.paperDark, 0.6);
    L0(g, circ(cx, cy, R + 3), C.blue, 6, 0.55);
    L0(g, circ(cx, cy, R), C.ink, 2, 0.45);
    return { g, halo, update(lt) { land.setAttribute('transform', `translate(${f1(lt * (o.drift ?? 6))} 0)`); halo.set(0.38 + 0.04 * Math.sin(lt * 0.5)); } };
  }
  // the Earth's limb: a huge disc whose top edge sits at y = top
  const LIMB_LANDS = [[-0.5, -0.86, 0.16, 0.05], [-0.18, -0.9, 0.12, 0.04], [0.08, -0.82, 0.2, 0.07], [0.4, -0.88, 0.13, 0.05], [-0.36, -0.74, 0.1, 0.05], [0.26, -0.74, 0.08, 0.04], [0.62, -0.78, 0.12, 0.06]];
  const limb = (parent, svg, defs, top, R, seed) => earthDisc(parent, svg, defs, 540, top + R, R, seed,
    { lands: LIMB_LANDS, drift: 10, haloK: 1.05, clouds: 6, cloudY0: -0.99, cloudStep: 0.035 });
  const GLOBE_LANDS = [[-0.42, -0.36, 0.3, 0.26], [-0.28, 0.32, 0.17, 0.32], [0.28, -0.42, 0.36, 0.2], [0.22, 0.12, 0.2, 0.3], [0.62, 0.48, 0.14, 0.1], [-0.95, 0.0, 0.25, 0.3], [0.95, -0.1, 0.22, 0.26]];
  const globe = (parent, svg, defs, cx, cy, R, seed, o = {}) => earthDisc(parent, svg, defs, cx, cy, R, seed, Object.assign({ lands: GLOBE_LANDS, drift: 6, night: true }, o));
  // lands kept below ~-0.3 R so nothing bright sits behind the subtitle band
  const LOW_LANDS = [[-0.42, 0.02, 0.28, 0.2], [-0.28, 0.52, 0.17, 0.26], [0.3, 0.06, 0.32, 0.18], [0.2, 0.46, 0.2, 0.24], [0.62, 0.62, 0.14, 0.1], [-0.92, 0.25, 0.22, 0.26], [0.92, 0.2, 0.2, 0.24]];

  // ------------------------------------------------------------------ the capsule with the porthole
  SH.bt_lk_capsule = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'window', g = canvas(svg, W, H);
      const st = BTL.stars(g, 170, 1957, [0, 0, 1080, 1920]);
      const earth = limb(g, svg, defs, mode === 'window' ? 1000 : 1330, 2200, 11);
      const sun = BTL.glow(svg, defs, 980, 380, 520, C.stain, 0.12, g);
      const capUp = el(g, 'g', { transform: mode === 'window' ? 'translate(540 480) scale(0.8) translate(-540 -480) translate(0 -100)' : 'translate(0 -100)' }), cap = el(capUp, 'g');
      const body = 'M300 560C300 380 400 330 540 330C680 330 780 380 780 560L780 1060C780 1090 760 1110 730 1110L350 1110C320 1110 300 1090 300 1060Z';
      L0(cap, 'M470 352L380 190M610 352L700 200', C.inkSoft, 4, 0.9);                 // antennas
      P0(cap, circ(380, 190, 7) + circ(700, 200, 7), C.inkSoft, 0.9);
      P0(cap, body, C.paperLight, 1);
      P0(cap, 'M690 380C750 420 780 480 780 560L780 1060C780 1090 760 1110 730 1110L700 1110L700 400Z', C.paperDark, 0.35);   // shade
      L0(cap, body, C.ink, 4, 1);
      L0(cap, 'M300 560L780 560M300 960L780 960M300 1010L780 1010', C.inkSoft, 2.5, 0.8);
      let rv = '';
      for (let x = 330; x <= 760; x += 36) rv += circ(x, 540, 3) + circ(x, 985, 3);
      P0(cap, rv, C.inkSoft, 0.8);
      L0(cap, 'M300 560C300 380 400 330 540 330', C.gold, 3, 0.35);                 // a rim of sunlight
      const px = 540, py = 760, pr = 165;
      P0(cap, circ(px, py, pr + 26), C.paper, 1);
      L0(cap, circ(px, py, pr + 26), C.ink, 4, 1);
      let bolts = '';
      for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; bolts += circ(px + Math.cos(a) * (pr + 13), py + Math.sin(a) * (pr + 13), 3.2); }
      P0(cap, bolts, C.inkSoft, 0.9);
      const win = clip(cap, circ(px, py, pr));
      P0(win, circ(px, py, pr), C.paperDark, 1);
      const warm = BTL.glow(svg, defs, px - 10, py - 30, pr * 1.5, C.gold, 0.55, win);
      const hotG = BTL.glow(svg, defs, px, py + 60, pr * 1.4, C.red, 0, win);
      const head = dogHead(win, px - 30, py + 70, 1.0);
      L0(win, `M${px - 120} ${py - 110}C${px - 80} ${py - 140} ${px - 30} ${py - 150} ${px + 10} ${py - 146}`, C.ink, 3, 0.18);   // glass glint
      L0(cap, circ(px, py, pr), C.ink, 3.5, 1);
      const ring = L0(cap, circ(px, py, pr + 44), C.gold, 3, 0.9, { pathLength: 1 });
      draw(ring, 0);
      return {
        update(lt, dur, cues) {
          st.update(lt); earth.update(lt);
          sun.set(0.11 + 0.02 * Math.sin(lt * 0.5));
          cap.setAttribute('transform', `rotate(${f1(-0.8 + lt * 0.12)} 540 720)`);
          const hit = cue(cues, 'hit', dur * 0.5);
          if (mode === 'dark') {
            const th = cue(cues, 'heat', 0.4), hot = BTL.ease(lt, th - 0.3, 1.2);
            hotG.set(0.5 * hot * (1 - BTL.ease(lt, hit, Math.max(1.6, dur - hit - 0.2))));
            const out = BTL.ease(lt, hit, Math.max(1.6, dur - hit - 0.2));
            warm.set((0.55 + 0.04 * Math.sin(lt * 1.3)) * (1 - out) * (1 - 0.6 * hot));
            head.setAttribute('opacity', (1 - 0.8 * out).toFixed(3));
          } else {
            warm.set(0.55 + 0.05 * Math.sin(lt * 1.3));
            draw(ring, BTL.ease(lt, hit - 0.2, 1.4));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ Moscow street at night
  SH.bt_lk_street = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), HZ = 1000;
      // buildings
      const r = rng(1957);
      let b = '', wins = '', x = -60;
      while (x < 1140) {
        const w = 120 + r() * 140, top = 520 + r() * 240;
        b += `M${f1(x)} ${HZ}L${f1(x)} ${f1(top)}L${f1(x + w)} ${f1(top)}L${f1(x + w)} ${HZ}Z`;
        for (let wy = top + 40; wy < HZ - 60; wy += 70) for (let wx = x + 22; wx < x + w - 30; wx += 46) if (r() < 0.07) wins += `M${f1(wx)} ${f1(wy)}h18v28h-18Z`;
        x += w + 6;
      }
      // an onion dome on a drum, far right
      const dome = 'M820 640C780 600 800 560 850 530C860 520 868 500 870 480C872 500 880 520 890 530C940 560 960 600 920 640Z';
      P0(g, `M830 ${HZ}L830 640L910 640L910 ${HZ}Z`, C.paperDark, 1);
      P0(g, dome, C.paperDark, 1); L0(g, dome, C.inkSoft, 2, 0.5);
      L0(g, 'M870 480L870 440M856 456L884 456', C.inkSoft, 3, 0.6);
      P0(g, b, C.paperDark, 1);
      L0(g, b, C.inkSoft, 1.6, 0.35);
      const winE = P0(g, wins, C.gold, 0.55);
      // the street: wet ground with cobble rows in perspective
      P0(g, `M-100 ${HZ}L1180 ${HZ}L1180 1920L-100 1920Z`, C.paperLight, 0.85);
      let cb = '';
      for (let i = 0; i < 16; i++) { const y = HZ + 14 * Math.pow(1.24, i) - 10; if (y > 1920) break; cb += `M-100 ${f1(y)}L1180 ${f1(y)}`; }
      for (let i = -12; i <= 12; i++) cb += `M${f1(540 + i * 40)} ${HZ}L${f1(540 + i * 230)} 1920`;
      L0(g, cb, C.inkSoft, 1.5, 0.22);
      // lamp light on the ground
      const pool = el(g, 'g', { transform: 'translate(500 1130) scale(1 0.38)' });
      const pg = BTL.glow(svg, defs, 0, 0, 520, C.gold, 0.32, pool);
      const air = BTL.glow(svg, defs, 420, 560, 260, C.gold, 0.3, g);
      // reflection of the lamp on the wet stones
      const refl = [];
      for (let i = 0; i < 9; i++) refl.push(L0(g, '', C.gold, 6 - i * 0.4, 0));
      // the lamp
      L0(g, `M300 1160L300 560C300 520 320 505 360 505L420 505`, C.inkSoft, 10, 1);
      L0(g, `M300 1160L300 560C300 520 320 505 360 505L420 505`, C.paperDark, 6, 1);
      P0(g, 'M395 505L445 505L460 545L380 545Z', C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 3 });
      P0(g, BTL.E(420, 552, 26, 10), C.gold, 1);
      P0(g, 'M286 1160L314 1160L320 1180L280 1180Z', C.paperDark, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
      // the dog
      dog(g, 600, 1150, 210, { face: -1 });
      // drizzle
      const rr = rng(77), drops = [];
      for (let i = 0; i < 70; i++) drops.push({ x: rr() * 1200 - 60, y: rr() * 1900, l: 18 + rr() * 22, sp: 260 + rr() * 120 });
      const rain = L0(g, '', C.inkSoft, 1.6, 0.35);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5), wide = BTL.ease(lt, hit - 0.3, 2.2);
          pg.set(0.3 + 0.03 * Math.sin(lt * 0.9) + 0.12 * wide);
          pool.setAttribute('transform', `translate(500 1130) scale(${f1(1 + 0.25 * wide)} ${(0.38 + 0.08 * wide).toFixed(3)})`);
          air.set(0.28 + 0.03 * Math.sin(lt * 0.9 + 1));
          winE.setAttribute('fill-opacity', (0.5 + 0.05 * Math.sin(lt * 0.4)).toFixed(3));
          refl.forEach((e, i) => {
            const y = 1240 + i * 32 + 4 * Math.sin(lt * 0.8 + i), wv = 6 * Math.sin(lt * 0.7 + i * 1.7), half = 34 - i * 2.4;
            e.setAttribute('d', `M${f1(420 - half + wv)} ${f1(y)}L${f1(420 + half + wv)} ${f1(y)}`);
            e.setAttribute('stroke-opacity', (0.36 - i * 0.03).toFixed(3));
          });
          let d = '';
          for (const p of drops) { const y = ((p.y + lt * p.sp) % 1920), x0 = p.x - y * 0.12; d += `M${f1(x0)} ${f1(y)}l${f1(-p.l * 0.12)} ${f1(p.l)}`; }
          rain.setAttribute('d', d);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the launch
  SH.bt_lk_launch = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H), HZ = 1040;
      const st = BTL.stars(g, 150, 3, [0, 0, 1080, 900]);
      P0(g, `M-100 ${HZ}L1180 ${HZ}L1180 1920L-100 1920Z`, C.paperDark, 1);
      L0(g, `M-100 ${HZ}L1180 ${HZ}`, C.inkSoft, 2, 0.6);
      let gr = ''; for (const y of [1090, 1160, 1260, 1400, 1580, 1800]) gr += `M-100 ${y}L1180 ${y}`;
      L0(g, gr, C.inkSoft, 1.5, 0.18);
      // the pad: a wide concrete deck in perspective, the flame pit under the rocket
      P0(g, `M120 ${HZ}L960 ${HZ}L1180 1330L-100 1330Z`, C.paperLight, 0.9);
      L0(g, `M120 ${HZ}L960 ${HZ}L1180 1330L-100 1330Z`, C.inkSoft, 2.5, 0.7);
      let pj = ''; for (const y of [1080, 1140, 1220]) { const k = (y - HZ) / 290; pj += `M${f1(120 - 220 * k)} ${y}L${f1(960 + 220 * k)} ${y}`; }
      for (let i = 1; i < 8; i++) { const x = 120 + i * 105; pj += `M${x} ${HZ}L${f1(540 + (x - 540) * 1.53)} 1330`; }
      L0(g, pj, C.inkSoft, 1.5, 0.3);
      P0(g, `M440 ${HZ + 4}L640 ${HZ + 4}L690 1100L390 1100Z`, C.paperDark, 1);
      P0(g, `M-100 1330L1180 1330L1180 1350L-100 1350Z`, C.paperDark, 0.9);
      // steppe beyond the pad, a few tufts of grass
      const rt = rng(31); let tf = '';
      for (let i = 0; i < 46; i++) { const x = rt() * 1080, y = 1380 + rt() * 520, h = 10 + rt() * 14; tf += `M${f1(x)} ${f1(y)}l-4 ${f1(-h)}M${f1(x)} ${f1(y)}l2 ${f1(-h * 1.2)}M${f1(x)} ${f1(y)}l7 ${f1(-h * 0.8)}`; }
      L0(g, tf, C.inkSoft, 2, 0.35);
      const base = BTL.glow(svg, defs, 540, HZ - 20, 760, C.gold, 0, g);
      // two lattice service towers that swing away from the rocket
      const tower = (x0, side) => {
        const t = el(g, 'g'); let d = `M${x0} 1080L${x0} 560M${x0 + 60 * side} 1080L${x0 + 60 * side} 600`;
        for (let y = 1080; y > 600; y -= 60) d += `M${x0} ${y}L${x0 + 60 * side} ${y - 60}M${x0 + 60 * side} ${y}L${x0} ${y - 60}M${x0} ${y}L${x0 + 60 * side} ${y}`;
        d += `M${x0} 600L${x0 - 70 * side} 640`;   // the arm that held the rocket
        L0(t, d, C.inkSoft, 4, 0.95);
        return t;
      };
      const tw = [tower(420, -1), tower(660, 1)];
      // smoke rolling out over the pad and the steppe
      const rs = rng(57), smoke = [];
      for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1; smoke.push({ side, d: 0.1 + rs() * 0.9, r: 80 + rs() * 110, y: HZ + 10 + (i / 16) * 520 + rs() * 40, e: P0(g, '', C.inkSoft, 0) }); }
      // the rocket
      const rk = el(g, 'g'), B = HZ - 40;
      const plume = P0(rk, '', C.gold, 0);
      const core = P0(rk, '', C.ink, 0);
      const boost = (x0, x1, top) => `M${(x0 + x1) / 2 - 8} ${top}C${(x0 + x1) / 2 - 22} ${top + 70} ${x0 + 4} ${top + 160} ${x0} ${B}L${x1} ${B}C${x1 - 4} ${top + 160} ${(x0 + x1) / 2 + 22} ${top + 70} ${(x0 + x1) / 2 + 8} ${top}Z`;
      const coreD = `M540 200C556 220 572 260 574 320L574 ${B}L506 ${B}L506 320C508 260 524 220 540 200Z`;
      for (const d of [boost(420, 500, 640), boost(580, 660, 640)]) { P0(rk, d, C.paperLight, 1); L0(rk, d, C.ink, 3.5, 1); }
      P0(rk, coreD, C.paperLight, 1); L0(rk, coreD, C.ink, 4, 1);
      const fb = boost(496, 584, 670);
      P0(rk, fb, C.paperLight, 1); L0(rk, fb, C.ink, 3.5, 1);
      L0(rk, `M506 340L574 340M506 580L574 580M506 640L574 640M440 900L480 900M600 900L640 900M512 920L568 920`, C.inkSoft, 2.5, 0.85);
      L0(rk, 'M552 220C562 250 568 280 570 320L570 ' + B, C.paperDark, 5, 0.4);
      return {
        update(lt, dur, cues) {
          st.update(lt);
          const ign = BTL.ease(lt, 0.2, 0.8);
          const p = clamp01((lt - 0.7) / Math.max(2.5, dur + 0.6)), lift = -1150 * p * p;
          rk.setAttribute('transform', `translate(0 ${f1(lift)})`);
          base.set(0.45 * ign * (1 - 0.6 * p) + 0.04 * Math.sin(lt * 3.1) * ign);
          const fl = Math.max(0, Math.min((130 + 22 * Math.sin(lt * 4.3) + 10 * Math.sin(lt * 7.1) + 900 * p) * ign, 1110 - (B + lift)));
          const fy = B + 2;
          plume.setAttribute('d', `M436 ${fy}C430 ${f1(fy + fl * 0.4)} 500 ${f1(fy + fl * 0.8)} 540 ${f1(fy + fl)}C580 ${f1(fy + fl * 0.8)} 650 ${f1(fy + fl * 0.4)} 644 ${fy}Z`);
          plume.setAttribute('fill-opacity', (0.85 * ign).toFixed(3));
          core.setAttribute('d', `M492 ${fy}C490 ${f1(fy + fl * 0.3)} 520 ${f1(fy + fl * 0.6)} 540 ${f1(fy + fl * 0.75)}C560 ${f1(fy + fl * 0.6)} 590 ${f1(fy + fl * 0.3)} 588 ${fy}Z`);
          core.setAttribute('fill-opacity', (0.9 * ign).toFixed(3));
          const open = BTL.ease(lt, 0.3, 1.8);
          tw[0].setAttribute('transform', `rotate(${f1(-11 * open)} 420 1080)`);
          tw[1].setAttribute('transform', `rotate(${f1(11 * open)} 660 1080)`);
          for (const s of smoke) {
            const q = clamp01((lt - 0.4 - s.d * 0.8) / 4.5);
            const sp = (s.y - HZ) / 560, x = 540 + s.side * (80 + q * (260 + s.r * 2 + 200 * sp)), rr = s.r * (0.45 + 1.1 * q) * (1 + sp * 0.6);
            s.e.setAttribute('d', BTL.E(x, s.y - q * 20, rr * 1.35, rr * 0.62));
            s.e.setAttribute('fill-opacity', ((0.09 - 0.03 * sp) * Math.min(1, q * 3) * ign).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ heartbeat screen / thermometer
  const ecg = u => {   // one beat per unit
    const t = ((u % 1) + 1) % 1;
    if (t < 0.1) return 0;
    if (t < 0.16) return -18 * Math.sin((t - 0.1) / 0.06 * Math.PI);
    if (t < 0.22) return 0;
    if (t < 0.25) return 26 * (t - 0.22) / 0.03;
    if (t < 0.29) return 26 - 176 * (t - 0.25) / 0.04;
    if (t < 0.33) return -150 + 186 * (t - 0.29) / 0.04;
    if (t < 0.36) return 36 - 36 * (t - 0.33) / 0.03;
    if (t < 0.5) return 0;
    if (t < 0.64) return -34 * Math.sin((t - 0.5) / 0.14 * Math.PI);
    return 0;
  };
  SH.bt_lk_vitals = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'claim', g = canvas(svg, W, H);
      if (mode === 'heat') {
        BTL.glow(svg, defs, 540, 740, 560, C.stain, 0.12, g);
        const red = BTL.glow(svg, defs, 540, 1060, 260, C.red, 0, g);
        const tube = 'M500 1000L500 330C500 300 518 284 540 284C562 284 580 300 580 330L580 1000';
        const glass = tube + `A80 80 0 1 1 500 1000Z`;
        P0(g, glass, C.paperLight, 1);
        L0(g, glass, C.ink, 4, 1);
        P0(g, circ(540, 1068, 58), C.red, 0.95);
        const col = P0(g, '', C.red, 0.95);
        let tk = '';
        for (let i = 0; i <= 14; i++) { const y = 960 - i * 46; tk += `M600 ${y}L${i % 2 ? 628 : 650} ${y}`; }
        L0(g, tk, C.inkSoft, 2.5, 0.85);
        L0(g, 'M516 340L516 980', C.ink, 3, 0.2);
        const waves = [];
        for (let i = 0; i < 6; i++) waves.push({ e: L0(g, '', C.gold, 3, 0), x: i < 3 ? 330 + i * 48 : 650 + (i - 3) * 48 + 60, ph: i * 1.3 });
        return {
          update(lt, dur, cues) {
            const hit = cue(cues, 'hit', dur * 0.3);
            const lv = 0.32 + 0.6 * BTL.ease(lt, hit - 0.3, Math.max(2.2, dur - hit - 0.2)) + 0.01 * Math.sin(lt * 0.8);
            const yTop = 1000 - lv * 680;
            col.setAttribute('d', `M524 1030L524 ${f1(yTop)}C524 ${f1(yTop - 14)} 556 ${f1(yTop - 14)} 556 ${f1(yTop)}L556 1030Z`);
            const heat = clamp01((lv - 0.32) / 0.6);
            red.set(0.08 + 0.4 * heat);
            for (const w of waves) {
              let d = '';
              for (let k = 0; k <= 20; k++) { const y = 1000 - k * 30, x = w.x + 12 * Math.sin(k * 0.55 - lt * 1.6 + w.ph); d += (k ? 'L' : 'M') + f1(x) + ' ' + y; }
              w.e.setAttribute('d', d);
              w.e.setAttribute('stroke-opacity', (0.1 + 0.3 * heat).toFixed(3));
            }
          },
        };
      }
      // claim: an oscilloscope with a steady heartbeat, a day counter under it
      const cx = 540, cy = 740, R = 240;
      BTL.glow(svg, defs, cx, 1000, 760, C.stain, 0.12, g);
      const panel = 'M150 440L930 440C950 440 960 450 960 470L960 1760L120 1760L120 470C120 450 130 440 150 440Z';
      P0(g, panel, C.paperLight, 1); L0(g, panel, C.ink, 4, 1);
      L0(g, 'M150 480L930 480', C.inkSoft, 2, 0.5);
      P0(g, circ(160, 520, 7) + circ(920, 520, 7) + circ(160, 1720, 7) + circ(920, 1720, 7), C.inkSoft, 0.9);
      // the counter window, two knobs and a small dial under the subtitle band
      P0(g, 'M330 1030L750 1030L750 1150L330 1150Z', C.paperDark, 1); L0(g, 'M330 1030L750 1030L750 1150L330 1150Z', C.ink, 3, 1);
      const knob = (x, a) => { P0(g, circ(x, 1450, 56), C.paper, 1); L0(g, circ(x, 1450, 56), C.ink, 3.5, 1); L0(g, `M${x} 1450L${f1(x + Math.cos(a) * 44)} ${f1(1450 + Math.sin(a) * 44)}`, C.ink, 5, 1);
        let tk = ''; for (let i = 0; i < 9; i++) { const b = Math.PI * (0.75 + i * 0.1875); tk += `M${f1(x + Math.cos(b) * 66)} ${f1(1450 + Math.sin(b) * 66)}L${f1(x + Math.cos(b) * 78)} ${f1(1450 + Math.sin(b) * 78)}`; } L0(g, tk, C.inkSoft, 2.5, 0.8); };
      knob(250, -2.2); knob(830, -0.9);
      P0(g, 'M440 1500A100 100 0 0 1 640 1500Z', C.paper, 1); L0(g, 'M440 1500A100 100 0 0 1 640 1500Z', C.ink, 3, 1);
      let dt = ''; for (let i = 0; i <= 8; i++) { const b = Math.PI * (1 + i / 8); dt += `M${f1(540 + Math.cos(b) * 78)} ${f1(1500 + Math.sin(b) * 78)}L${f1(540 + Math.cos(b) * 92)} ${f1(1500 + Math.sin(b) * 92)}`; }
      L0(g, dt, C.inkSoft, 2.5, 0.9);
      const needle = L0(g, '', C.gold, 4, 1);
      P0(g, circ(cx, cy, R + 34), C.paperLight, 1);
      L0(g, circ(cx, cy, R + 34), C.ink, 4, 1);
      P0(g, circ(cx, cy, R), C.paperDark, 1);
      const sc = clip(g, circ(cx, cy, R));
      let grid = '';
      for (let i = -5; i <= 5; i++) grid += `M${cx + i * 60} ${cy - R}L${cx + i * 60} ${cy + R}M${cx - R} ${cy + i * 60}L${cx + R} ${cy + i * 60}`;
      L0(sc, grid, C.inkSoft, 1.5, 0.25);
      const scr = BTL.glow(svg, defs, cx, cy, R, C.green, 0.12, sc);
      const tr = L0(sc, '', C.green, 4.5, 1);
      const dot = P0(sc, '', C.green, 1);
      L0(g, circ(cx, cy, R), C.ink, 3, 1);
      const label = txt(g, P.label || 'Resmî açıklama', cx, 380, 56, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      const day = txt(g, '1. gün', cx, 1125, 96, { color: C.gold });
      return {
        update(lt, dur, cues) {
          const sp = 300, head = cx + R - 40;
          let d = '';
          for (let x = cx - R; x <= head; x += 4) d += (x === cx - R ? 'M' : 'L') + x + ' ' + f1(cy + ecg((x - head) / sp + lt * 0.9));
          tr.setAttribute('d', d);
          dot.setAttribute('d', circ(head, cy + ecg(lt * 0.9), 7));
          scr.set(0.11 + 0.03 * Math.sin(lt * 1.2));
          const na = Math.PI * (1.62 + 0.04 * Math.sin(lt * 0.9));
          needle.setAttribute('d', `M540 1500L${f1(540 + Math.cos(na) * 74)} ${f1(1500 + Math.sin(na) * 74)}`);
          fade(label, BTL.ease(lt, 0.1, 1));
          const hit = cue(cues, 'hit', dur * 0.3);
          const n = 1 + Math.min(5, Math.floor(Math.max(0, lt - hit) / Math.max(0.3, (dur - hit - 0.6) / 5)));
          day.textContent = `${n}. gün`;
          fade(day, BTL.ease(lt, hit - 0.3, 0.6));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the dossier
  SH.bt_lk_file = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H);
      // the desk
      P0(g, 'M-100 240L1180 240L1180 1920L-100 1920Z', C.paperLight, 0.55);
      let wd = ''; const r = rng(45);
      for (let i = 0; i < 18; i++) { const y = 260 + i * 92 + r() * 30; wd += `M-100 ${f1(y)}C300 ${f1(y - 10 + r() * 20)} 700 ${f1(y + 12)} 1180 ${f1(y - 6)}`; }
      L0(g, wd, C.inkSoft, 1.5, 0.15);
      const pool = BTL.glow(svg, defs, 540, 760, 640, C.stain, 0.28, g);
      const X0 = 250, X1 = 830, Y0 = 360, Y1 = 1100;
      // the back of the folder + the page inside
      P0(g, `M${X0 - 6} ${Y0 + 10}L${X1 + 14} ${Y0 + 10}L${X1 + 14} ${Y1 + 14}L${X0 - 6} ${Y1 + 14}Z`, C.paperDark, 0.8);
      P0(g, `M${X0} ${Y0}L${X1} ${Y0}L${X1} ${Y1}L${X0} ${Y1}Z`, C.paper, 1);
      L0(g, `M${X0} ${Y0}L${X1} ${Y0}L${X1} ${Y1}L${X0} ${Y1}Z`, C.ink, 3, 0.8);
      const page = el(g, 'g', { opacity: 0 });
      P0(page, `M${X0 + 40} ${Y0 + 30}L${X1 - 30} ${Y0 + 30}L${X1 - 30} ${Y1 - 30}L${X0 + 40} ${Y1 - 30}Z`, C.ink, 0.1);
      L0(page, `M${X0 + 40} ${Y0 + 30}L${X1 - 30} ${Y0 + 30}L${X1 - 30} ${Y1 - 30}L${X0 + 40} ${Y1 - 30}Z`, C.inkSoft, 2, 0.8);
      let ln = '';
      for (let i = 0; i < 9; i++) { const y = Y0 + 380 + i * 34; ln += `M${X0 + 90} ${y}L${f1(X1 - 80 - (i * 53 % 160))} ${y}`; }
      L0(page, ln, C.inkSoft, 4, 0.5);
      const yr = svgText(page, P.page || '2002', 545, Y0 + 280, 190, { fill: C.gold, 'font-family': FR, 'font-weight': 300 });
      void yr;
      // the cover, hinged on its left edge
      const cov = el(g, 'g');
      const covD = `M${X0} ${Y0 - 10}L${X0 + 200} ${Y0 - 10}L${X0 + 230} ${Y0 - 40}L${X0 + 380} ${Y0 - 40}L${X0 + 400} ${Y0 - 10}L${X1 + 10} ${Y0 - 10}L${X1 + 10} ${Y1 + 4}L${X0} ${Y1 + 4}Z`;
      const covF = P0(cov, covD, C.paperLight, 1);
      L0(cov, covD, C.ink, 4, 1);
      const front = el(cov, 'g');
      L0(front, `M${X0 + 70} ${Y1 - 120}L${X1 - 60} ${Y1 - 120}M${X0 + 70} ${Y1 - 80}L${X0 + 330} ${Y1 - 80}`, C.inkSoft, 3, 0.6);
      const stamp = el(front, 'g', { transform: 'rotate(-8 545 640)' });
      L0(stamp, 'M330 560L760 560L760 720L330 720Z', C.red, 6, 0.9);
      svgText(stamp, P.stamp || 'GİZLİ', 545, 683, 124, { fill: C.red, 'fill-opacity': 0.92, 'font-family': FR, 'font-weight': 700, 'letter-spacing': '0.06em' });
      svgText(front, P.cover || '1957', 545, 880, 84, { fill: C.inkSoft, 'font-family': LO, 'font-style': 'italic' });
      // dust in the light
      const rd = rng(9), dust = [];
      for (let i = 0; i < 26; i++) dust.push({ e: P0(g, '', C.ink, 0), x: 240 + rd() * 600, y: 300 + rd() * 800, r: 1.6 + rd() * 2.2, sp: 6 + rd() * 10, ph: rd() * TAU });
      return {
        update(lt, dur, cues) {
          pool.set(0.27 + 0.03 * Math.sin(lt * 0.6));
          const hit = cue(cues, 'hit', 0.2), o = BTL.ease(lt, hit + 0.9, 1.2);
          const sx = 1 - 1.32 * o;
          cov.setAttribute('transform', `translate(${X0} 0) scale(${sx.toFixed(4)} 1) translate(${-X0} 0)`);
          front.setAttribute('opacity', sx > 0.05 ? '1' : '0');
          covF.setAttribute('fill', sx > 0 ? C.paperLight : C.paperDark);
          page.setAttribute('opacity', clamp01((o - 0.35) / 0.5).toFixed(3));
          for (const d of dust) {
            const y = d.y - ((lt * d.sp) % 260), x = d.x + 14 * Math.sin(lt * 0.4 + d.ph);
            d.e.setAttribute('d', circ(x, y, d.r));
            d.e.setAttribute('fill-opacity', (0.35 * (0.5 + 0.5 * Math.sin(lt * 0.7 + d.ph))).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ orbits: the tomb, the burn
  SH.bt_lk_orbit = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'tomb', g = canvas(svg, W, H);
      const st = BTL.stars(g, 200, 1958, [0, 0, 1080, 1920]);
      if (mode === 'burn') {
        const LT = 1100, LR = 1700, LCY = LT + LR;
        const earth = limb(g, svg, defs, LT, LR, 23);
        const label = P.label ? txt(g, P.label, 540, 420, 64, { font: LO, italic: true, color: C.inkSoft, weight: 400 }) : null;
        // where the streak meets the atmosphere: a point just above the limb
        const ex = 380, ey = LCY - Math.sqrt(LR * LR - (ex - 540) * (ex - 540)) - 18;
        const sx = 980, sy = 520;
        const path = u => [sx + (ex - sx) * u, sy + (ey - sy) * u - 60 * u * (1 - u)];
        const air = L0(g, `M${ex - 260} ${f1(LCY - Math.sqrt(LR * LR - (ex - 260 - 540) ** 2) - 6)}A${LR + 6} ${LR + 6} 0 0 1 ${ex + 260} ${f1(LCY - Math.sqrt(LR * LR - (ex + 260 - 540) ** 2) - 6)}`, C.gold, 10, 0);
        const glow = BTL.glow(svg, defs, ex, ey, 160, C.gold, 0, g);
        const tail = [];
        for (let i = 0; i < 14; i++) tail.push(L0(g, '', C.gold, 12 - i * 0.6, 0));
        const head = P0(g, '', C.ink, 0);
        return {
          update(lt, dur, cues) {
            st.update(lt); earth.update(lt);
            fade(label, BTL.ease(lt, 0.2, 1.2));
            const T = 0.3 + Math.max(1.8, dur * 0.5), u = clamp01((lt - 0.3) / (T - 0.3));
            const flare = BTL.ease(lt, T - 0.15, 0.5), gone = BTL.ease(lt, T + 0.5, 1.4);
            const [x, y] = path(u), a = BTL.ease(lt, 0.2, 0.6) * (1 - gone);
            for (let i = 0; i < tail.length; i++) {
              const [x0, y0] = path(Math.max(0, u - (i + 1) * 0.03)), [x1, y1] = path(Math.max(0, u - i * 0.03));
              tail[i].setAttribute('d', `M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}`);
              tail[i].setAttribute('stroke-opacity', (a * (0.35 + 0.5 * u) * (1 - i / tail.length) * (1 - flare * 0.7)).toFixed(3));
            }
            head.setAttribute('d', circ(x, y, 8 + 10 * flare));
            head.setAttribute('fill-opacity', a.toFixed(3));
            glow.e.setAttribute('cx', f1(x)); glow.e.setAttribute('cy', f1(y));
            glow.e.setAttribute('r', f1(70 + 170 * flare));
            glow.set(a * (0.2 + 0.6 * flare));
            air.setAttribute('stroke-opacity', (0.35 * flare * (1 - gone)).toFixed(3));
          },
        };
      }
      // tomb: a big Earth low in the frame, the capsule's orbit arching over it
      const cx = 540, cy = 1440, R = 380, ox = 430, oy = 115, TILT = -29, ocy = 1300;
      const backG = el(g, 'g');
      const earth = globe(g, svg, defs, cx, cy, R, 7, { lands: LOW_LANDS, cloudY0: -0.25, clouds: 4 });
      const frontG = el(g, 'g');
      const label = txt(g, P.label || 'yörüngede', cx, 640, 52, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      const num = txt(g, '0 gün', cx, 570, 110, { color: C.gold });
      const pt = (deg, t) => { const a = deg * Math.PI / 180, px = Math.cos(t) * ox, py = Math.sin(t) * oy; return [cx + px * Math.cos(a) - py * Math.sin(a), ocy + px * Math.sin(a) + py * Math.cos(a)]; };
      const arc = (deg, t0, t1) => { let d = ''; for (let k = 0; k <= 48; k++) { const p = pt(deg, t0 + (t1 - t0) * k / 48); d += (k ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); } return d; };
      // earlier passes: very faint, slightly turned (the orbit drifted); the far half hides behind the disc
      const N = 9, old = [];
      for (let i = 0; i < N; i++) { const deg = TILT - 2 + i * 2.2; old.push(L0(backG, arc(deg, Math.PI, TAU), C.inkSoft, 1.5, 0), L0(frontG, arc(deg, 0, Math.PI), C.inkSoft, 1.5, 0)); }
      L0(backG, arc(TILT + 9, Math.PI, TAU), C.inkSoft, 3, 0.75);
      L0(frontG, arc(TILT + 9, 0, Math.PI), C.inkSoft, 3, 0.75);
      const capB = el(backG, 'g'), capF = el(g, 'g');
      const mk = (parent) => { const gl = BTL.glow(svg, defs, 0, 0, 90, C.gold, 0.55, parent); gl.e.setAttribute('cx', 0); gl.e.setAttribute('cy', 0); return { gl, c: P0(parent, circ(0, 0, 12), C.gold, 1) }; };
      const KB = mk(capB), KF = mk(capF);
      return {
        update(lt, dur, cues) {
          st.update(lt); earth.update(lt);
          const hit = cue(cues, 'hit', dur * 0.6), cold = BTL.ease(lt, hit - 0.1, 0.8);
          const passes = lt / 1.9;
          old.forEach((e, i) => e.setAttribute('stroke-opacity', (0.12 * BTL.ease(passes, (i >> 1) * 0.35, 0.4)).toFixed(3)));
          const th = passes * TAU + 2.2, [x, y] = pt(TILT + 9, th);
          const far = Math.sin(th) < 0;   // upper half: behind the planet where it overlaps the disc
          const K = far ? KB : KF, Ko = far ? KF : KB;
          (far ? capB : capF).setAttribute('transform', `translate(${f1(x)} ${f1(y)})`);
          Ko.c.setAttribute('fill-opacity', '0'); Ko.gl.set(0);
          const col = mix(C.gold, C.inkSoft, cold);
          K.c.setAttribute('fill', col); K.c.setAttribute('fill-opacity', '1');
          K.c.setAttribute('d', circ(0, 0, 12 - 3 * cold));
          K.gl.e.setAttribute('r', f1(90 - 50 * cold));
          K.gl.set(0.55 * (1 - 0.75 * cold));
          const days = Math.round((P.days || 162) * BTL.ease(lt, 0.3, Math.max(2.5, dur - 0.8)));
          num.textContent = `${days} gün`;
          fade(num, BTL.ease(lt, 0.1, 0.8)); fade(label, BTL.ease(lt, 0.4, 1));
        },
      };
    },
  };
})();
