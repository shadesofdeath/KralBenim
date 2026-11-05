// bt_panipat: the Second Battle of Panipat, 5 November 1556, belgesel style (docs/BELGESEL.md). Clean still line art,
// slow natural motion only (dust drifting, a banner in the wind, a trunk swaying, grass, a slowly gliding arrow).
// Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame shows it as a centred column.
// Violence is never shown: the arrow reaches a faceless silhouette, the rider slowly sinks out of sight.
//   bt_pn_arrow    P: {mode: "hook"|"ground"}  cues: hit   hook: one long arrow glides slowly across a hazy plain, a
//                  war elephant tiny on the horizon; on "hit" a thin gold line runs along the arrowhead. ground: dusk,
//                  the same arrow stuck in the empty plain, low sun, grass moving, dust settling
//   bt_pn_plain    P: {mode: "date"|"rout", text, sub}  cues: hit   the Panipat plain. date: two far armies on the
//                  horizon under dust, the year in big thin type above. rout: an elephant with an empty howdah far off,
//                  small figures scattering away from it into the dust; from "hit" they spread faster
//   bt_pn_elephant P: {}  cues: hit   an armoured war elephant side on, a howdah with a canopy on its back, a faceless
//                  rider inside, a banner on a pole; trunk, ear and tail sway slowly; on "hit" the banner turns gold
//   bt_pn_howdah   P: {mode: "hook"|"arrow"|"fall"}  cues: hit   close-up of the howdah and its rider. hook: slow motion,
//                  the arrow hangs in the air short of the rider and creeps towards him (never arrives). arrow: it flies in
//                  from the left and reaches the rider's head exactly on "hit", the rider tilts back. fall: the rider
//                  (arrow with him) slowly sinks below the rail on "hit"; the howdah stays empty
//   bt_pn_camp     P: {}  cues: hit   far behind the line: a round tent on a low rise, a tall man and a child beside it
//                  looking left to a small dust cloud on the horizon; on "hit" a dotted gold line runs to the dust
//   bt_pn_line     P: {from: 1556, to: 1605, text: "49 yıl", sub}  cues: hit   the arrow lies flat over the plain, its tip
//                  at the first year; a heavy timeline runs on to the last year (both there from the first frame), the
//                  span in big gold type comes in early, a small light travels the span; sub fades in by "hit"
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => v.toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1) => el(parent, 'path', { d, fill, 'fill-opacity': a, stroke: 'none' });
  const L0 = (parent, d, stroke, w = 3, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra));
  const LD = (parent, d, stroke, w = 3, a = 1, extra = {}) => { const e = L0(parent, d, stroke, w, a, Object.assign({ pathLength: 1 }, extra)); draw(e, 0); return e; };
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  // slow push-in of the whole composition about (cx, cy)
  const push = (g, lt, dur, cx, cy, amt = 0.04) => {
    const z = 1 + amt * BTL.ease(lt, 0, Math.max(3, dur));
    g.setAttribute('transform', `translate(${cx} ${cy}) scale(${z.toFixed(4)}) translate(${-cx} ${-cy})`);
  };

  // ------------------------------------------------------------------ ground, dust, grass
  function ground(g, y0, seed, o = {}) {
    const r = rng(seed);
    let d = `M-200 ${y0}`;
    for (let x = -200; x <= 1280; x += 60) d += `L${x} ${f1(y0 - (o.rise || 0) * Math.max(0, (x - 500) / 780) - r() * 5)}`;
    P0(g, d + 'L1280 1920L-200 1920Z', o.fill || C.paperDark, 1);
    L0(g, d, C.inkSoft, 2, 0.7);
    // a few long furrows in perspective so the lower frame is not empty
    let fr = '';
    for (const y of [y0 + 90, y0 + 230, y0 + 430, y0 + 700]) fr += `M-200 ${y}C200 ${y - 8} 800 ${y + 8} 1280 ${y - 4}`;
    L0(g, fr, C.inkSoft, 1.6, 0.18);
  }
  // soft dust: wide flat puffs drifting slowly sideways (wrap around a box)
  function haze(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), x: r(), y: box[1] + r() * (box[3] - box[1]),
      rx: (o.size || 120) * (0.6 + r() * 0.8), sp: (o.speed || 8) * (0.6 + r() * 0.8), a: (o.alpha || 0.07) * (0.6 + r() * 0.6), ph: r() * TAU });
    const w = box[2] - box[0];
    return { update(lt, on = 1) { for (const q of list) {
      const xx = box[0] + ((q.x * w + q.sp * lt) % w + w) % w, edge = Math.sin(Math.PI * (xx - box[0]) / w);
      q.e.setAttribute('d', BTL.E(xx, q.y - 6 * Math.sin(lt * 0.3 + q.ph), q.rx, q.rx * 0.32));
      q.e.setAttribute('fill-opacity', (q.a * on * edge).toFixed(3));
    } } };
  }
  // grass tufts swaying very slowly
  function grass(g, seed, n, box) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ x: box[0] + r() * (box[2] - box[0]), y: box[1] + r() * (box[3] - box[1]), h: 30 + r() * 70, l: (r() * 2 - 1) * 14, ph: r() * TAU });
    list.sort((a, b) => a.y - b.y);
    const e = L0(g, '', C.inkSoft, 2.2, 0.5);
    return { update(lt) {
      let d = '';
      for (const q of list) { const s = q.l + 6 * Math.sin(lt * 0.7 + q.ph), k = q.h / 100;
        d += `M${f1(q.x)} ${f1(q.y)}q${f1(s * 0.3)} ${f1(-q.h * 0.6)} ${f1(s)} ${f1(-q.h)}M${f1(q.x + 6 * k)} ${f1(q.y)}q${f1(s * 0.5 + 6)} ${f1(-q.h * 0.4)} ${f1(s + 14 * k)} ${f1(-q.h * 0.7)}`; }
      e.setAttribute('d', d);
    } };
  }

  // ------------------------------------------------------------------ the arrow (tail at 0, tip at L, along +x)
  function arrow(parent, L, o = {}) {
    const g = el(parent, 'g'), w = o.w || 4, q = o.fs || 1, n = v => f1(v * q);
    L0(g, `M4 0L${f1(L - 34 * q)} 0`, C.ink, w, 1);
    const head = `M${L} 0L${f1(L - 50 * q)} -${n(15)}L${f1(L - 38 * q)} 0L${f1(L - 50 * q)} ${n(15)}Z`;
    P0(g, head, C.ink, 1);
    const glint = LD(g, `M${f1(L - 48 * q)} -${n(12)}L${f1(L - 2 * q)} 0`, C.gold, 3 * Math.max(0.6, q), 0.95);
    for (const s of [-1, 1]) {
      const fe = `M${n(10)} 0L${n(36)} ${n(22 * s)}L${n(104)} ${n(22 * s)}L${n(84)} 0Z`;
      P0(g, fe, C.gold, 0.85); L0(g, fe, C.ink, 2 * Math.max(0.6, q), 0.9);
      L0(g, `M${n(44)} ${n(14 * s)}L${n(56)} ${n(4 * s)}M${n(62)} ${n(16 * s)}L${n(74)} ${n(5 * s)}`, C.ink, 1.5, 0.5);
    }
    L0(g, `M0 -${n(7)}L${n(8)} 0L0 ${n(7)}`, C.ink, 2.5 * Math.max(0.6, q), 0.9);
    return { g, glint };
  }
  const placeArrow = (a, tx, ty, deg, L) => a.g.setAttribute('transform', `translate(${f1(tx)} ${f1(ty)}) rotate(${deg.toFixed(2)}) translate(${-L} 0)`);

  // ------------------------------------------------------------------ the war elephant (faces left; feet at 0)
  // units: body ~700 wide, back at -410, howdah canopy to -780, banner to -840
  function elephant(parent, x, y, k, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${f1(x)} ${f1(y)}) scale(${k})` });
    const skin = mix(C.paper, C.ink, o.far ? 0.42 : o.light ? 0.03 : 0.1), far = mix(C.paper, C.ink, o.far ? 0.5 : 0.24);
    const cap = mix(C.paper, C.ink, o.far ? 0.5 : o.light ? 0.06 : 0.2), rim = o.far ? C.inkSoft : C.ink, lw = o.far ? 6 : 3.5;
    const farLegs = 'M-150-140L-142 0L-82 0L-86-130ZM196-140L206 0L262 0L268-150Z';
    P0(g, farLegs, far, 1); L0(g, farLegs, rim, lw * 0.8, 0.8);
    // tail (swings slowly)
    const tail = L0(g, '', rim, lw, 1);
    const body = 'M300-250C310-350 220-405 80-410C-40-414-140-405-200-420C-250-470-360-470-395-400C-415-350-405-290-380-260' +
      'C-360-222-320-196-270-184L-262 0L-180 0L-176-130C-80-112 70-112 150-130L160 0L242 0L250-150C282-180 298-215 300-250Z';
    P0(g, body, skin, 1); L0(g, body, rim, lw, 1);
    if (!o.far) L0(g, 'M-262-10L-180-10M160-10L242-10M-200-160C-205-120-210-60-212-10M200-160C196-120 198-60 202-10', C.inkSoft, 2, 0.45);
    // caparison (armour cloth) over the back, scalloped hem with a gold border
    let hem = '';
    const n = 9;
    for (let i = 0; i < n; i++) { const a = 262 - 448 * i / n, b = 262 - 448 * (i + 1) / n; hem += `Q${f1((a + b) / 2)} -178 ${f1(b)} -206`; }
    const capD = 'M-188-416C-60-428 120-426 244-386L262-206' + hem + 'Z';
    P0(g, capD, cap, 1); L0(g, capD, rim, lw * 0.85, 1);
    if (!o.far) {
      L0(g, 'M-176-232C-40-238 120-238 252-232', C.gold, 3, 0.9);
    }
    if (!o.far && !o.plain) {
      let st = ''; for (let i = 0; i < 7; i++) { const cx = -130 + i * 58; st += `M${cx} -330l12 -14l12 14l-12 14Z`; }
      L0(g, st, C.gold, 2.2, 0.8);
    }
    // head armour plate
    const plate = 'M-392-398C-376-446-298-458-246-424L-266-338C-306-334-350-322-384-304Z';
    P0(g, plate, cap, 1); L0(g, plate, rim, lw * 0.85, 1);
    if (!o.far) L0(g, 'M-376-392C-350-424-300-432-262-414M-370-330C-340-338-310-344-276-346', C.gold, 2.5, 0.85);
    // ear (sways a little)
    const ear = el(g, 'g');
    const earD = 'M-250-410C-190-415-160-340-175-270C-185-230-225-225-255-255C-270-300-275-370-250-410Z';
    P0(ear, earD, mix(skin, C.ink, 0.06), 1); L0(ear, earD, rim, lw * 0.85, 1);
    if (!o.far) L0(ear, 'M-232-380C-210-350-200-310-212-270', C.inkSoft, 2, 0.5);
    // eye and tusk
    P0(g, BTL.E(-322, -352, 7, 6), C.ink, o.far ? 0 : 0.9);
    // trunk (sways slowly about its root)
    const trunkG = el(g, 'g');
    const trunk = 'M-392-300C-402-200-396-110-402-30C-404-4-386 6-372-8C-362-90-352-190-332-252Z';
    P0(trunkG, trunk, skin, 1); L0(trunkG, trunk, rim, lw, 1);
    if (!o.far) L0(trunkG, 'M-392-220l22 4M-394-170l22 3M-396-120l22 3M-398-70l22 2', C.inkSoft, 1.8, 0.45);
    L0(g, 'M-352-238C-346-204-318-186-282-192', rim, lw * 2 + 2, 1);
    L0(g, 'M-352-238C-346-204-318-186-282-192', C.paperLight, lw * 2 - 2, 1);

    // howdah: platform, back pillars, rider, rail, front pillars, canopy
    const hw = el(g, 'g');
    const plat = 'M-104-414L194-414L200-442L-110-442Z';
    P0(hw, plat, cap, 1); L0(hw, plat, rim, lw * 0.85, 1);
    L0(hw, 'M-20-505L-20-640M100-505L100-640', C.inkSoft, lw, 0.6);
    const riderClip = 'pnrc' + (++CLIP);
    const cp = el(hw, 'clipPath', { id: riderClip }); el(cp, 'path', { d: 'M-900-1200L196-1200L196-504L-900-504Z' });
    const riderWrap = el(hw, 'g', { 'clip-path': `url(#${riderClip})` });
    const rider = el(riderWrap, 'g');
    if (o.rider !== false) {
      const rc = mix(C.paper, C.ink, o.far ? 0.6 : 0.62);
      const torso = 'M-6-500C-6-540 8-556 32-558C56-556 70-540 70-500Z';
      P0(rider, torso, rc, 1); L0(rider, torso, rim, lw * 0.7, 1);
      P0(rider, BTL.E(30, -580, 21, 23), rc, 1); L0(rider, BTL.E(30, -580, 21, 23), rim, lw * 0.7, 1);
      const tur = 'M6-588C2-612 16-628 32-628C50-628 62-612 56-588C42-596 20-596 6-588Z';
      P0(rider, tur, mix(C.paper, C.ink, 0.15), 1); L0(rider, tur, rim, lw * 0.7, 1);
      P0(rider, BTL.E(34, -630, 5, 5), C.gold, 1);
    }
    const rail = 'M-100-442L190-442L190-505L-100-505Z';
    P0(hw, rail, mix(C.paper, C.ink, o.far ? 0.4 : 0.08), 1); L0(hw, rail, rim, lw * 0.85, 1);
    if (!o.far) { L0(hw, 'M-92-474L182-474', C.gold, 2.5, 0.9); let dm = ''; for (let i = 0; i < 6; i++) dm += `M${-74 + i * 48} -474l10 -12l10 12l-10 12Z`; L0(hw, dm, C.ink, 1.8, 0.6); }
    L0(hw, 'M-92-505L-92-640M182-505L182-640', rim, lw * 1.2, 1);
    const canopy = 'M-122-640C-112-738 202-738 212-640Z';
    P0(hw, canopy, mix(C.paper, C.ink, o.far ? 0.4 : 0.04), 1); L0(hw, canopy, rim, lw, 1);
    L0(hw, 'M45-726L45-772', rim, lw * 0.8, 1);
    P0(hw, BTL.E(45, -782, 11, 11), C.gold, 1);
    const fringe = o.far ? null : L0(hw, '', C.inkSoft, 2, 0.8);
    // banner on its own pole at the back of the howdah
    L0(hw, 'M204-505L204-850', rim, lw * 0.9, 1);
    const flag = P0(hw, '', mix(C.paper, C.ink, 0.25), 1), flagLine = L0(hw, '', rim, lw * 0.7, 1);
    const flagGold = P0(hw, '', C.gold, 0);
    return {
      g, rider, ear, trunkG,
      update(lt, o2 = {}) {
        const sw = Math.sin(lt * 0.55);
        trunkG.setAttribute('transform', `rotate(${f1(2.2 * sw)} -362 -270)`);
        ear.setAttribute('transform', `rotate(${f1(1.6 * Math.sin(lt * 0.8 + 1))} -250 -400)`);
        const tw = 10 * Math.sin(lt * 0.7 + 2);
        tail.setAttribute('d', `M296-262C320-230 ${f1(320 + tw * 0.5)} -180 ${f1(312 + tw)} -138M${f1(312 + tw)} -138l-6 22M${f1(312 + tw)} -138l6 22`);
        if (fringe) { let d = ''; for (let i = 0; i <= 15; i++) { const fx = -116 + i * 21.5, s = 3 * Math.sin(lt * 1.1 + i * 0.6); d += `M${f1(fx)} -640l${f1(s)} 22`; } fringe.setAttribute('d', d); }
        const wind = o2.wind ?? 1;
        let top = '', bot = '';
        const N = 8, len = o.flagLen || 170;
        const pt = (i, base) => { const u = i / N; return [204 + u * len, base + wind * 9 * Math.sin(lt * 1.8 - i * 0.75) * u + (1 - wind) * u * 60]; };
        for (let i = 0; i <= N; i++) { const p = pt(i, -846); top += (i ? 'L' : 'M') + f1(p[0]) + ' ' + f1(p[1]); }
        const e1 = pt(N, -846), e2 = pt(N, -776), mid = [(e1[0] + e2[0]) / 2 - 34, (e1[1] + e2[1]) / 2];
        for (let i = N; i >= 0; i--) { const p = pt(i, -776); bot += 'L' + f1(p[0]) + ' ' + f1(p[1]); }
        const d = top + `L${f1(mid[0])} ${f1(mid[1])}L${f1(e2[0])} ${f1(e2[1])}` + bot.slice(bot.indexOf('L', 1)) + 'Z';
        flag.setAttribute('d', d); flagLine.setAttribute('d', d); flagGold.setAttribute('d', d);
        flagGold.setAttribute('fill-opacity', (0.9 * (o2.gold || 0)).toFixed(3));
      },
    };
  }
  let CLIP = 0;

  // ------------------------------------------------------------------ bt_pn_arrow
  SH.bt_pn_arrow = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', g0 = canvas(svg, W, H), g = el(g0, 'g');
      P0(g, 'M-200-100L1280-100L1280 1920L-200 1920Z', C.paper, 1);
      if (mode === 'ground') {
        const HY = 1060;
        const sun = BTL.glow(svg, defs, 300, HY - 20, 620, C.stain, 0.34, g);
        const disc = P0(g, BTL.E(300, HY, 110, 110), C.gold, 0.35);
        ground(g, HY, 5);
        L0(g, `M-200 ${HY}L1280 ${HY}`, C.gold, 2, 0.25);
        const dust = haze(g, 17, 10, [-100, HY - 120, 1180, HY + 60], { size: 160, alpha: 0.06, speed: 5 });
        // a long soft shadow of the arrow on the ground, away from the low sun
        const shadow = P0(g, '', C.ink, 0.1);
        const motes = haze(g, 18, 14, [-100, 700, 1180, 1100], { size: 10, alpha: 0.5, speed: 12, color: C.gold });
        const ag = el(g, 'g');
        const L = 640, a = arrow(ag, L, { w: 8, fs: 1.5 });
        placeArrow(a, 590, 1170, 72, L);   // tip buried a little in the soil at (590, 1170)
        P0(g, BTL.E(590, 1172, 46, 9), C.paperDark, 1);
        L0(g, 'M548 1172C566 1162 612 1162 632 1172', C.inkSoft, 2.5, 0.8);
        const gr = grass(g, 41, 70, [-100, HY + 40, 1180, 1900]);
        return {
          update(lt, dur) {
            push(g, lt, dur, 590, 900, 0.035);
            const p = BTL.ease(lt, 0, Math.max(3, dur));
            sun.set(0.34 - 0.08 * p);
            disc.setAttribute('d', BTL.E(300, HY - 10 + 80 * p, 110, 110));
            dust.update(lt, 1 - 0.4 * p); gr.update(lt); motes.update(lt);
            const sl = 300 + 260 * p;                   // the shadow lengthens as the sun goes down
            shadow.setAttribute('d', `M590 1164L${f1(590 + sl)} ${f1(1172 + sl * 0.05)}L${f1(590 + sl)} ${f1(1184 + sl * 0.05)}L590 1178Z`);
            draw(a.glint, 1); a.glint.setAttribute('stroke-opacity', (0.5 + 0.3 * Math.sin(lt * 0.9)).toFixed(3));
            shadow.setAttribute('fill-opacity', (0.1 + 0.04 * p).toFixed(3));
          },
        };
      }
      // hook: the lone arrow over a hazy plain, the elephant tiny on the far horizon it points to
      const HY = 1260;
      const pool = BTL.glow(svg, defs, 540, 860, 640, C.stain, 0.3, g);
      ground(g, HY, 3);
      const el2 = elephant(g, 860, HY + 8, 0.36, { far: true });
      const dust = haze(g, 9, 14, [-100, HY - 160, 1180, HY + 80], { size: 150, alpha: 0.08, speed: 7 });
      const streaks = L0(g, '', C.inkSoft, 2, 0.5);
      const ag = el(g, 'g');
      const L = 760, a = arrow(ag, L, { w: 8, fs: 1.5 });
      const ang = 30, ca = Math.cos(ang * Math.PI / 180), sa = Math.sin(ang * Math.PI / 180);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.4);
          pool.set(0.3 + 0.04 * Math.sin(lt * 0.9));
          el2.update(lt); dust.update(lt);
          const s = 26 * lt;                        // glides slowly forward, towards the howdah far off
          const tx = 430 + L / 2 * ca + s * ca, ty = 780 + L / 2 * sa + s * sa;
          placeArrow(a, tx, ty, ang, L);
          const tail = [tx - L * ca, ty - L * sa];
          let d = '';
          for (let i = 0; i < 4; i++) { const off = (i - 1.5) * 26, len = 140 + 60 * Math.sin(lt * 1.3 + i * 1.7), gap = 30 + i * 18;
            const x0 = tail[0] - gap * ca - off * -sa, y0 = tail[1] - gap * sa - off * ca;
            d += `M${f1(x0)} ${f1(y0)}L${f1(x0 - len * ca)} ${f1(y0 - len * sa)}`; }
          streaks.setAttribute('d', d);
          draw(a.glint, BTL.ease(lt, hit - 0.1, 0.9));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pn_plain
  SH.bt_pn_plain = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'date', g0 = canvas(svg, W, H), g = el(g0, 'g');
      P0(g, 'M-200-100L1280-100L1280 1920L-200 1920Z', C.paper, 1);
      const HY = mode === 'rout' ? 930 : 1030;
      const sky = BTL.glow(svg, defs, 540, HY - 60, 760, C.stain, 0.26, g);
      ground(g, HY, 13);
      if (mode === 'date') {
        // two armies far apart on the horizon: a line of tiny elephants and a fringe of marks under dust
        const left = el(g, 'g'), right = el(g, 'g');
        const els = [];
        for (let i = 0; i < 5; i++) els.push(elephant(right, 640 + i * 78, HY + 8 + (i % 2) * 6, 0.075, { far: true, rider: true }));
        let m1 = '', m2 = '';
        const r = rng(1556);
        for (let i = 0; i < 70; i++) { const x = 40 + r() * 400, y = HY + 4 + r() * 16; m1 += `M${f1(x)} ${f1(y)}l0 -${f1(10 + r() * 10)}`; }
        for (let i = 0; i < 50; i++) { const x = 600 + r() * 440, y = HY + 10 + r() * 18; m2 += `M${f1(x)} ${f1(y)}l0 -${f1(8 + r() * 8)}`; }
        L0(left, m1, C.inkSoft, 2.4, 0.8); L0(right, m2, C.inkSoft, 2.4, 0.7);
        const dust = haze(g, 21, 16, [-100, HY - 130, 1180, HY + 30], { size: 140, alpha: 0.08, speed: 6 });
        const gr = grass(g, 7, 60, [-100, HY + 120, 1180, 1900]);
        const year = txt(g, P.text || '1556', 540, 520, 230, { weight: 300 });
        const sub = txt(g, P.sub || 'Panipat', 540, 630, 70, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
        const rule = LD(g, 'M400 680L680 680', C.gold, 2.5, 0.9);
        return {
          update(lt, dur) {
            push(g, lt, dur, 540, HY, 0.04);
            sky.set(0.26 + 0.03 * Math.sin(lt * 0.7));
            els.forEach(e => e.update(lt)); dust.update(lt); gr.update(lt);
            fade(year, BTL.ease(lt, 0.05, 1.2)); fade(sub, BTL.ease(lt, 0.7, 1.2)); draw(rule, BTL.ease(lt, 0.9, 1.4));
          },
        };
      }
      // rout: the elephant far off with its empty howdah, the army scattering away from it
      P0(g, BTL.E(540, HY + 42, 200, 14), C.ink, 0.1);
      const E = elephant(g, 540, HY + 40, 0.52, { rider: false });
      const r = rng(77), men = [];
      for (let i = 0; i < 24; i++) {
        const side = i % 2 ? 1 : -1, depth = r(), y = HY + 70 + depth * 170, h = 80 + depth * 90;
        const x = 540 + side * (70 + r() * 170);
        const pg = el(g, 'g');
        BTL.person(pg, 'stand', 0, 0, h, { face: side, color: mix(C.paper, C.ink, 0.55), rim: C.ink });
        men.push({ pg, x, y, side, v: 40 + r() * 40 + depth * 50 });
      }
      men.sort((a, b) => a.y - b.y).forEach(m => g.appendChild(m.pg));
      const dust = haze(g, 31, 18, [-100, HY - 120, 1180, HY + 300], { size: 170, alpha: 0.09, speed: 10 });
      const gr = grass(g, 13, 40, [-100, HY + 200, 1180, 1900]);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5);
          push(g, lt, dur, 540, HY + 60, 0.06);
          E.update(lt, { wind: 0.6 }); dust.update(lt, 1 + 0.8 * BTL.ease(lt, hit, 1.5)); gr.update(lt);
          const run = 0.6 * lt + 1.4 * Math.max(0, lt - hit) * BTL.ease(lt, hit, 1);
          for (const m of men) {
            const x = m.x + m.side * m.v * run, edge = Math.abs(x - 540);
            m.pg.setAttribute('transform', `translate(${f1(x)} ${f1(m.y)})`);
            m.pg.setAttribute('opacity', clamp01((660 - edge) / 160).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pn_elephant
  SH.bt_pn_elephant = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      P0(g, 'M-200-100L1280-100L1280 1920L-200 1920Z', C.paper, 1);
      const HY = 900;
      const pool = BTL.glow(svg, defs, 560, 720, 700, C.stain, 0.3, g);
      ground(g, HY, 23);
      const back = haze(g, 51, 12, [-100, HY - 140, 1180, HY + 40], { size: 160, alpha: 0.08, speed: 6 });
      P0(g, BTL.E(600, 1146, 470, 26), C.ink, 0.1);
      const E = elephant(g, 600, 1146, 1.22);
      const front = haze(g, 52, 8, [-100, 1080, 1180, 1200], { size: 150, alpha: 0.06, speed: 9 });
      const gr = grass(g, 19, 60, [-100, 1180, 1180, 1900]);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.55);
          push(g, lt, dur, 600, 700, 0.04);
          pool.set(0.3 + 0.03 * Math.sin(lt * 0.8));
          E.update(lt, { gold: BTL.ease(lt, hit - 0.1, 1.2) });
          back.update(lt); front.update(lt); gr.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pn_howdah (close-up)
  SH.bt_pn_howdah = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'arrow', g0 = canvas(svg, W, H), g = el(g0, 'g');
      P0(g, 'M-200-100L1280-100L1280 1920L-200 1920Z', C.paper, 1);
      // hook: a smaller howdah right of centre (whole canopy and banner in frame) so the arrow has the left third
      const hk = mode === 'hook', K = hk ? 1.5 : 2.3, CX = hk ? 560 : 560, CY = hk ? 700 : 760;
      const OX = CX - K * 45, OY = CY + K * 560;
      const pool = BTL.glow(svg, defs, CX, CY - 20, hk ? 520 : 600, C.stain, 0.32, g);
      const dust = haze(g, 61, 12, [-100, CY + 160, 1180, CY + 760], { size: 200, alpha: 0.07, speed: 8 });
      const E = elephant(g, OX, OY, K, { plain: true, light: hk, flagLen: hk ? 120 : 170 });
      // dust rising in front of the elephant's back keeps the lower frame light in the hook
      const veil = hk ? haze(g, 62, 9, [-100, CY + 330, 1180, CY + 1100], { size: 280, alpha: 0.7, speed: 14, color: C.paper }) : null;
      // the arrow lives in the rider's frame so that it moves with him once it has struck
      const L = hk ? 175 : 190, a = arrow(E.rider, L, { w: hk ? 5 : 4.5, fs: hk ? 0.8 : 0.7 });
      const streaks = L0(g, '', C.inkSoft, 2.5, 0.5);
      const TIP = [10, -574], ANG = 9;                 // eye level on the faceless head (it faces left)
      const T0 = P.t0 ?? 1.6;                          // hook: the cover moment (cover.t) the opening starts from
      const ca = Math.cos(ANG * Math.PI / 180), sa = Math.sin(ANG * Math.PI / 180);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', mode === 'arrow' ? dur * 0.7 : dur * 0.3);
          push(g, lt, dur, CX, CY, 0.035);
          // the opening plays the hook at a third of real speed: ambient motion is sped up to read as natural
          const at = hk ? lt * 3 : lt;
          pool.set(0.32 + 0.03 * Math.sin(at * 0.9));
          dust.update(at); if (veil) veil.update(at);
          E.update(at);
          let back = 0, sink = 0, along = 0;
          if (mode === 'hook') {
            // slow motion: the arrow hangs in the air short of the rider and creeps towards him; it never arrives
            // starts in the left third at the cover moment and visibly closes ~15 % of the frame during the opening
            along = Math.max(15, 125 - 160 * (lt - T0));
            const sx = OX + K * (TIP[0] - along * ca - L * ca), sy = OY + K * (TIP[1] - along * sa - L * sa);
            let d = '';
            for (let i = 0; i < 3; i++) { const off = (i - 1) * 16, len = 170 + 50 * Math.sin(at * 1.2 + i * 2); d += `M${f1(sx - 10)} ${f1(sy + off)}L${f1(sx - 10 - len * ca)} ${f1(sy + off - len * sa)}`; }
            streaks.setAttribute('d', d);
            draw(a.glint, 1);
          } else if (mode === 'arrow') {
            const fl = clamp01((lt - (hit - 0.75)) / 0.75);   // flight: last 0.75 s before the cue
            along = (1 - fl) * 900;                             // distance still to travel (elephant units)
            back = 11 * BTL.ease(lt, hit, 1.1);
            fade(a.g, lt > hit - 0.8 ? 1 : 0);
            let d = '';
            if (fl > 0 && fl < 1) {
              const sx = OX + K * (TIP[0] - along * ca - L * ca), sy = OY + K * (TIP[1] - along * sa - L * sa);
              for (let i = 0; i < 3; i++) { const off = (i - 1) * 18, len = 220; d += `M${f1(sx)} ${f1(sy + off)}L${f1(sx - len * ca)} ${f1(sy + off - len * sa)}`; }
            }
            streaks.setAttribute('d', d);
          } else {
            back = 11 + 14 * BTL.ease(lt, hit, 2.0);
            sink = 260 * BTL.ease(lt, hit + 0.1, 2.0);
            fade(a.g, 1 - BTL.ease(lt, hit + 0.6, 1.2));
          }
          placeArrow(a, TIP[0] - along * ca, TIP[1] - along * sa, ANG, L);
          if (mode !== 'hook') draw(a.glint, 1);
          E.rider.setAttribute('transform', `translate(0 ${f1(sink)}) rotate(${f1(back)} 32 -504)`);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pn_camp
  SH.bt_pn_camp = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      P0(g, 'M-200-100L1280-100L1280 1920L-200 1920Z', C.paper, 1);
      const HY = 860;
      const sky = BTL.glow(svg, defs, 700, 820, 620, C.stain, 0.26, g);
      ground(g, HY, 29, { rise: 160 });
      // the far battle: a small dust cloud on the left horizon
      const far = haze(g, 71, 9, [20, HY - 90, 300, HY + 10], { size: 70, alpha: 0.16, speed: 4 });
      let fm = ''; const r = rng(12);
      for (let i = 0; i < 30; i++) { const x = 60 + r() * 200; fm += `M${f1(x)} ${f1(HY + 2 + r() * 6)}l0 -${f1(5 + r() * 5)}`; }
      L0(g, fm, C.inkSoft, 2, 0.7);
      // the tent on the rise: round walls, domed roof, dark door, a pennant
      const T = el(g, 'g', { transform: 'translate(780 1130) scale(1.15)' });
      const wall = 'M-170 0L-170-170L170-170L170 0Z', roof = 'M-196-166C-170-300 170-300 196-166Z';
      P0(T, wall, C.paperLight, 1); P0(T, roof, C.paperLight, 1);
      let seams = ''; for (let i = -3; i <= 3; i++) seams += `M${i * 48} -168L${i * 48} 0M0 -282C${i * 20} -250 ${i * 52} -200 ${i * 56} -168`;
      L0(T, seams, C.inkSoft, 1.6, 0.4);
      let val = 'M-196-166'; for (let i = 0; i < 12; i++) { const a = -196 + 392 * i / 12, b = -196 + 392 * (i + 1) / 12; val += `Q${f1((a + b) / 2)} -136 ${f1(b)} -166`; }
      P0(T, val + 'Z', C.paper, 1); L0(T, val, C.ink, 2.5, 0.9);
      L0(T, wall, C.ink, 3.5, 1); L0(T, roof, C.ink, 3.5, 1);
      const door = 'M-40 0L-40-100C-40-130 40-130 40-100L40 0Z';
      P0(T, door, mix(C.paper, C.ink, 0.6), 1); L0(T, door, C.ink, 3, 1);
      L0(T, 'M0-284L0-420', C.ink, 3, 1);
      const pen = P0(T, '', C.gold, 0.85);
      P0(g, BTL.E(780, 1132, 260, 20), C.ink, 0.08);
      // the regent and the boy, looking left towards the dust
      const fc = mix(C.paper, C.ink, 0.62);
      const fig = (x, h) => {
        BTL.person(g, 'stand', x, 1150, h, { face: -1, color: fc, rim: C.ink });
        const ty = 1150 - 0.9 * h - 0.075 * h;
        const t = `M${f1(x - 0.1 * h)} ${f1(ty + 0.03 * h)}C${f1(x - 0.11 * h)} ${f1(ty - 0.06 * h)} ${f1(x + 0.11 * h)} ${f1(ty - 0.06 * h)} ${f1(x + 0.1 * h)} ${f1(ty + 0.03 * h)}Z`;
        P0(g, t, mix(C.paper, C.ink, 0.12), 1); L0(g, t, C.ink, 2.5, 1);
      };
      P0(g, BTL.E(470, 1152, 150, 12), C.ink, 0.1);
      fig(500, 440); fig(360, 260);
      // the distance back to the fighting: a dotted gold line along the ground
      const B = [[330, 1170], [300, 1080], [220, HY + 40], [150, HY + 8]], dots = [];
      for (let i = 0; i <= 26; i++) {
        const u = i / 26, v = 1 - u, bx = v * v * v * B[0][0] + 3 * v * v * u * B[1][0] + 3 * v * u * u * B[2][0] + u * u * u * B[3][0];
        const by = v * v * v * B[0][1] + 3 * v * v * u * B[1][1] + 3 * v * u * u * B[2][1] + u * u * u * B[3][1];
        dots.push(el(g, 'circle', { cx: f1(bx), cy: f1(by), r: f1(6 - 3 * u), fill: C.gold, 'fill-opacity': 0 }));
      }
      const gr = grass(g, 33, 55, [-100, 1180, 1180, 1900]);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.6);
          push(g, lt, dur, 520, 950, 0.04);
          sky.set(0.26 + 0.03 * Math.sin(lt * 0.6));
          far.update(lt, 1 + 0.3 * Math.sin(lt * 0.8)); gr.update(lt);
          let d = 'M0-420'; for (let i = 1; i <= 6; i++) d += `L${i * 18} ${f1(-420 + 5 * Math.sin(lt * 1.7 - i * 0.8) * i / 6 + i * 1.5)}`;
          d += `L0 -384Z`; pen.setAttribute('d', d);
          const p = BTL.ease(lt, hit - 0.1, 1.8);
          dots.forEach((e, i) => e.setAttribute('fill-opacity', (0.9 * clamp01((p * dots.length - i) / 2)).toFixed(3)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_pn_line
  SH.bt_pn_line = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g0 = canvas(svg, W, H), g = el(g0, 'g');
      P0(g, 'M-200-100L1280-100L1280 1920L-200 1920Z', C.paper, 1);
      const y0 = 900, from = P.from || 1556, to = P.to || 1605, xa = 470, xb = 930;
      const pool = BTL.glow(svg, defs, 540, 760, 640, C.stain, 0.22, g);
      // the plain under the timeline so the lower frame is not empty
      const HY = 1110;
      ground(g, HY, 37);
      const dust = haze(g, 81, 12, [-100, HY - 90, 1180, HY + 160], { size: 170, alpha: 0.07, speed: 8 });
      const gr = grass(g, 53, 60, [-100, HY + 60, 1180, 1900]);
      // the arrow lies flat, its tip at the first year; the line runs on from it (both there from the first frame)
      const L = 320, a = arrow(g, L, { w: 8, fs: 1.4 });
      placeArrow(a, xa, y0, 0, L);
      const X = yr => xa + (yr - from) / (to - from) * (xb - xa);
      L0(g, `M${xa} ${y0}L${xb} ${y0}`, C.ink, 7, 1);
      let tk = '';
      for (let yr = Math.ceil((from + 1) / 10) * 10; yr < to; yr += 10) tk += `M${f1(X(yr))} ${y0 - 16}L${f1(X(yr))} ${y0 + 16}`;
      L0(g, tk, C.inkSoft, 3, 0.8);
      L0(g, `M${xb} ${y0 - 34}L${xb} ${y0 + 34}`, C.ink, 7, 1);
      const t0 = txt(g, String(from), xa, y0 + 92, 66, { weight: 400 }); t0.setAttribute('opacity', 1);
      const t1 = txt(g, String(to), xb, y0 + 92, 66, { weight: 400 }); t1.setAttribute('opacity', 1);
      const big = txt(g, P.text || '49 yıl', 700, y0 - 210, 190, { weight: 300, color: C.gold });
      const sub = P.sub ? txt(g, P.sub, 700, y0 - 120, 54, { font: LO, italic: true, color: C.inkSoft, weight: 400 }) : null;
      const brace = LD(g, `M${xa} ${y0 - 34}C${xa} ${y0 - 60} ${xa + 20} ${y0 - 64} ${xa + 70} ${y0 - 64}L${xb - 70} ${y0 - 64}C${xb - 20} ${y0 - 64} ${xb} ${y0 - 60} ${xb} ${y0 - 40}`, C.gold, 4, 0.9);
      // a small light travels the span: the years passing
      const halo = P0(g, '', C.gold, 0.25), dot = P0(g, '', C.gold, 1);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5);
          push(g, lt, dur, 540, y0, 0.035);
          pool.set(0.22 + 0.03 * Math.sin(lt * 0.8));
          dust.update(lt); gr.update(lt);
          draw(a.glint, 1); a.glint.setAttribute('stroke-opacity', (0.55 + 0.35 * Math.sin(lt * 1.1)).toFixed(3));
          const q = BTL.ease(lt, 0.1, Math.max(2, dur - 0.2)), x = xa + (xb - xa) * q;
          dot.setAttribute('d', BTL.E(x, y0, 12, 12)); halo.setAttribute('d', BTL.E(x, y0, 34, 34));
          fade(big, BTL.ease(lt, 0.25, 0.8));
          big.setAttribute('transform', `translate(0 ${f1(10 * (1 - BTL.ease(lt, 0.25, 1.2)))})`);
          draw(brace, BTL.ease(lt, 0.3, 1.2));
          if (sub) fade(sub, BTL.ease(lt, Math.min(hit, 1.2), 1));
        },
      };
    },
  };
})();
