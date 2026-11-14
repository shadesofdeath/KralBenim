// bt_kroisos: Croesus (Kroisos, "Karun") of Lydia and the Delphic oracle (Herodotus I.53, I.75-91), belgesel style
// (docs/BELGESEL.md). Clean still line art in the theme's tokens; only slow natural motion (steam, vapour, water, a
// slow ford, smoke, a sinking sun, dust, a glint). Every type is composed on a 1080x1920 vertical canvas (the Short);
// a wide frame shows it as a centred column.
//   bt_kr_tripod P: {mode: "hook"|"pythia"}  cues: hit
//                hook: a bronze Delphic tripod (cauldron with two ring handles on three tall legs) in a pool of light,
//                thin steam rising from the bowl; on "hit" a gold line runs round the rim.
//                pythia: inside a dark temple (two faint columns), a faceless veiled woman sits on the tripod holding a
//                laurel sprig, vapour rises from a cleft in the floor; on "hit" the light pool narrows onto her
//   bt_kr_coin   P: {mode: "gold"|"crack"}  cues: hit
//                one oblong Lydian gold coin (a croeseid: foreparts of a lion and a bull facing each other) in a light
//                pool, a soft glint passes slowly over it. gold: on "hit" its edge is drawn in gold.
//                crack: on "hit" a crack runs through it, the two halves part slowly and the gold drains out
//   bt_kr_river  cues: hit   dusk, a wide river (the Halys) between low banks; a file of faceless spearmen wades across
//                on a diagonal towards the far bank, water lines flow; on "hit" the lead standard turns gold on the far bank
//   bt_kr_sardes cues: hit   the steep eroded acropolis rock of Sardis with walls and towers on top, the lower town at
//                its foot; from "hit" smoke rises behind the walls, a red glow comes up and the light dims
//   bt_kr_map    cues: hit   the Aegean (Greece, the Anatolian coast, islands); Sardis glows, a gold route draws across
//                the sea from the start and reaches Delphi, which pulses, on "hit"
//   bt_kr_ruins  P: {}  Sardis today: two standing Ionic columns of the temple of Artemis on their platform, fallen
//                drums, the acropolis behind, the sun sinking slowly, dust drifting
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const LD = (p, d, stroke, w = 3, a = 1) => { const e = L0(p, d, stroke, w, a, { pathLength: 1 }); draw(e, 0); return e; };
  const SIL = () => mix(C.paper, C.ink, 0.62);
  const WATER = () => mix(C.paperDark, C.inkSoft, 0.3);
  let uid = 0;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  function ground(g, y, o = {}) {
    P0(g, `M-300 ${y}L1380 ${y}L1380 2100L-300 2100Z`, o.color || C.paperDark, o.alpha ?? 0.7);
    L0(g, `M-300 ${y}L1380 ${y}`, C.inkSoft, 2, 0.4);
    L0(g, `M-300 ${y + 120}L1380 ${y + 120}M-300 ${y + 360}L1380 ${y + 360}`, C.inkSoft, 1.5, 0.1);
  }
  function motes(g, seed, n, box, o = {}) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.ink, 0), x: r(), y: r(), s: (o.size || 2.4) * (0.7 + r() * 0.9), v: 0.015 + r() * 0.025, ph: r() * TAU });
    const w = box[2] - box[0], h = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const u = (q.y + q.v * lt + 10) % 1, y = o.up ? box[3] - u * h : box[1] + u * h, x = box[0] + q.x * w + 16 * Math.sin(lt * 0.3 + q.ph);
      q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
      q.e.setAttribute('fill-opacity', (on * (o.alpha ?? 0.4) * Math.sin(Math.PI * u)).toFixed(3));
    } } };
  }
  // rising wisps (steam / vapour / smoke): threads from points, curling slowly upwards
  function wisps(g, pts, o = {}) {
    const list = pts.map(([x, y], i) => ({ x, y, e: L0(g, '', o.color || C.inkSoft, o.w || 3, o.alpha ?? 0.35), ph: i * 1.9 }));
    return { update(lt, on = 1) { for (const q of list) {
      const h = o.h || 380, s1 = (o.amp || 26) * Math.sin(lt * 0.9 + q.ph), s2 = (o.amp || 26) * 1.4 * Math.sin(lt * 0.7 + q.ph + 1.3);
      const rise = (o.drift || 0) * Math.sin(lt * 0.4 + q.ph);
      q.e.setAttribute('d', `M${f1(q.x)} ${f1(q.y)}C${f1(q.x + s1)} ${f1(q.y - h * 0.3)} ${f1(q.x - s2)} ${f1(q.y - h * 0.65)} ${f1(q.x + s2 * 0.8 + rise)} ${f1(q.y - h)}`);
      q.e.setAttribute('stroke-opacity', ((o.alpha ?? 0.35) * on).toFixed(3));
    } } };
  }

  // ------------------------------------------------------------------ the tripod (cx = centre, ry = rim y, s = scale)
  function tripod(g, cx, ry, s = 1, o = {}) {
    const X = v => f1(cx + v * s), Y = v => f1(ry + v * s), dk = !!o.dark;
    const LN = dk ? mix(C.ink, C.gold, 0.5) : C.ink;          // outline
    const bowl = `M${X(-200)} ${Y(0)}C${X(-196)} ${Y(170)} ${X(-110)} ${Y(240)} ${X(0)} ${Y(240)}C${X(110)} ${Y(240)} ${X(196)} ${Y(170)} ${X(200)} ${Y(0)}Z`;
    // three tapered bronze legs, slightly splayed, ending in lion paws
    const leg = (x0, y0, x1, y1, w0, w1) => `M${X(x0 - w0)} ${Y(y0)}L${X(x0 + w0)} ${Y(y0)}L${X(x1 + w1)} ${Y(y1)}L${X(x1 - w1)} ${Y(y1)}Z`;
    const legs = leg(-160, 120, -240, 560, 16, 10) + leg(160, 120, 240, 560, 16, 10) + leg(0, 230, 0, 572, 16, 10);
    const paw = (x, y) => `M${X(x - 34)} ${Y(y + 16)}C${X(x - 34)} ${Y(y - 14)} ${X(x - 14)} ${Y(y - 20)} ${X(x)} ${Y(y - 20)}C${X(x + 14)} ${Y(y - 20)} ${X(x + 34)} ${Y(y - 14)} ${X(x + 34)} ${Y(y + 16)}Z`;
    const paws = paw(-240, 560) + paw(240, 560) + paw(0, 572);
    const toes = [-240, 240, 0].map((x, i) => { const y = i === 2 ? 572 : 560; return `M${X(x - 12)} ${Y(y + 16)}L${X(x - 12)} ${Y(y)}M${X(x + 12)} ${Y(y + 16)}L${X(x + 12)} ${Y(y)}`; }).join('');
    const rim = BTL.E(cx, ry, 200 * s, 38 * s);
    const rings = BTL.E(+X(-110), +Y(-78), 64 * s, 74 * s) + BTL.E(+X(110), +Y(-78), 64 * s, 74 * s);
    let zig = ''; for (let i = 0; i <= 14; i++) { const x = -186 + i * 26.6, y = i % 2 ? 78 : 52; zig += (i ? 'L' : 'M') + X(x * (1 - 0.02 * Math.abs(i - 7))) + ' ' + Y(y); }
    P0(g, BTL.E(cx, ry + 584 * s, 300 * s, 22 * s), C.ink, dk ? 0.5 : 0.14);
    if (dk) P0(g, legs, mix(C.ink, C.gold, 0.3), 1); else P0(g, legs, C.gold, 0.55);
    L0(g, legs, LN, 3 * s);
    P0(g, paws, mix(C.gold, C.ink, dk ? 0.65 : 0.35), 1); L0(g, paws + toes, LN, 2.5 * s);
    L0(g, rings, dk ? mix(C.ink, C.gold, 0.4) : C.ink, 13 * s); L0(g, rings, C.gold, (dk ? 3 : 5) * s, dk ? 0.55 : 0.8);
    if (dk) P0(g, bowl, mix(C.ink, C.gold, 0.38), 1); else { P0(g, bowl, C.paperLight, 1); P0(g, bowl, C.gold, 0.4); }
    L0(g, `M${X(-196)} ${Y(40)}C${X(-100)} ${Y(56)} ${X(100)} ${Y(56)} ${X(196)} ${Y(40)}M${X(-192)} ${Y(90)}C${X(-100)} ${Y(106)} ${X(100)} ${Y(106)} ${X(192)} ${Y(90)}`, dk ? mix(C.ink, C.gold, 0.65) : C.ink, 2.5 * s, 0.8);
    L0(g, zig, dk ? mix(C.ink, C.gold, 0.65) : C.ink, 2.5 * s, 0.75);
    L0(g, `M${X(-168)} ${Y(120)}C${X(-150)} ${Y(170)} ${X(-110)} ${Y(206)} ${X(-60)} ${Y(222)}`, dk ? C.gold : C.paperLight, 6 * s, dk ? 0.35 : 0.7);
    L0(g, bowl, LN, 4 * s);
    P0(g, BTL.E(cx, ry, 186 * s, 30 * s), dk ? C.ink : mix(C.paperDark, C.ink, 0.45), 1);
    L0(g, rim, dk ? C.gold : C.ink, 4.5 * s, dk ? 0.8 : 1);
    const gold = LD(g, rim, C.gold, 8 * s, 1);
    return { gold, rim };
  }
  // the cleft in the temple floor (Delphi's chasm), centred on cx at y
  function cleft(g, cx, y, w = 1) {
    const d = `M${cx - 240 * w} ${y}C${cx - 160 * w} ${y - 14} ${cx - 100 * w} ${y + 12} ${cx - 20 * w} ${y - 6}C${cx + 60 * w} ${y - 20} ${cx + 150 * w} ${y + 8} ${cx + 240 * w} ${y - 4}C${cx + 160 * w} ${y + 22} ${cx + 60 * w} ${y + 14} ${cx - 20 * w} ${y + 26}C${cx - 110 * w} ${y + 34} ${cx - 180 * w} ${y + 18} ${cx - 240 * w} ${y}Z`;
    P0(g, d, C.ink, 0.6); L0(g, d, C.ink, 2, 0.8);
  }

  SH.bt_kr_tripod = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), mode = P.mode || 'hook';
      if (mode === 'pythia') {
        const FY = 1040;
        // two faint columns of the temple and the dark between them
        for (const x of [110, 970]) {
          P0(g, `M${x - 46} 120L${x + 46} 120L${x + 52} ${FY}L${x - 52} ${FY}Z`, C.paperDark, 0.55);
          L0(g, `M${x - 46} 120L${x - 52} ${FY}M${x + 46} 120L${x + 52} ${FY}M${x - 16} 130L${x - 18} ${FY}M${x + 16} 130L${x + 18} ${FY}`, C.inkSoft, 2, 0.5);
        }
        ground(g, FY, { alpha: 0.6 });
        const pool = BTL.glow(svg, defs, 540, 820, 600, C.stain, 0.36, g);
        cleft(g, 540, FY + 46, 1.1);
        const vap = wisps(g, [[400, FY + 46], [470, FY + 50], [610, FY + 44], [690, FY + 46]], { h: 640, amp: 34, alpha: 0.3, w: 5 });
        const RY = 720, s = 0.56;
        tripod(g, 540, RY, s);
        // the seated priestess: veil behind, figure on the rim, a laurel sprig raised in her hand
        const h = 470, fx = 520, fy = RY + 0.24 * h - 14;
        P0(g, `M${fx - 30} ${fy - 0.8 * h}C${fx - 90} ${fy - 0.62 * h} ${fx - 110} ${fy - 0.34 * h} ${fx - 92} ${fy - 0.22 * h}L${fx + 4} ${fy - 0.3 * h}Z`, SIL(), 1, { stroke: C.ink, 'stroke-width': 2.5 });
        BTL.person(g, 'sit', fx, fy, h, { face: 1, color: SIL(), rim: C.ink });
        P0(g, `M${fx - 60} ${fy - 0.24 * h}C${fx + 40} ${fy - 0.26 * h} ${fx + 150} ${fy - 0.08 * h} ${fx + 170} ${fy}L${fx + 70} ${fy + 10}C${fx + 30} ${fy - 0.06 * h} ${fx - 30} ${fy - 0.1 * h} ${fx - 60} ${fy - 0.12 * h}Z`, SIL(), 1, { stroke: C.ink, 'stroke-width': 2.5 });
        const hx = fx + 0.3 * h, hy = fy - 0.48 * h;
        L0(g, `M${hx} ${hy}C${hx + 20} ${hy - 60} ${hx + 50} ${hy - 110} ${hx + 70} ${hy - 160}`, C.ink, 3);
        let lv = '';
        for (let i = 0; i < 6; i++) { const t = 0.15 + i * 0.15, x = hx + 70 * t + 6, y = hy - 160 * t, sd = i % 2 ? 1 : -1;
          lv += `M${f1(x)} ${f1(y)}C${f1(x + 26 * sd)} ${f1(y - 6)} ${f1(x + 34 * sd)} ${f1(y - 22)} ${f1(x + 30 * sd)} ${f1(y - 32)}C${f1(x + 14 * sd)} ${f1(y - 26)} ${f1(x + 2 * sd)} ${f1(y - 12)} ${f1(x)} ${f1(y)}Z`; }
        P0(g, lv, C.green, 0.8, { stroke: C.ink, 'stroke-width': 1.5 });
        const ds = motes(g, 17, 40, [250, 300, 830, FY - 20], { alpha: 0.45, size: 3, up: true });
        return {
          update(lt, dur, cues) {
            const at = cue(cues, 'hit', dur * 0.6), n = BTL.ease(lt, at - 0.2, 1.6);
            pool.e.setAttribute('r', f1(600 - 230 * n));
            pool.set(0.36 + 0.14 * n + 0.04 * Math.sin(lt * 1.2));
            vap.update(lt * 1.4); ds.update(lt * 5);
          },
        };
      }
      // hook: the tripod alone in the dark; the only bright thing is the light rising out of its bowl. The hook is also
      // the Short's cover: while the engine shows it as the cover (html.cover), the cover shade and title take the dark
      // ground and a light ink so the frame reads as one dark picture (inline styles, cleared outside the cover).
      const FY = 1250, RY = 575, S = 1.15, DARK = mix(C.ink, C.paperDark, 0.08);
      el(g, 'rect', { x: -400, y: -600, width: 1880, height: 3000, fill: DARK });
      const floor = BTL.glow(svg, defs, 540, FY + 10, 460, C.stain, 0.16, g);
      const pool = BTL.glow(svg, defs, 540, RY + 120, 420, C.stain, 0.2, g);
      const tint = mix(C.stain, C.paperLight, 0.35);
      const steam = [
        wisps(g, [[528, RY + 6]], { h: 640, amp: 44, alpha: 0.16, w: 70, drift: 110, color: tint }),
        wisps(g, [[512, RY + 4], [566, RY + 6]], { h: 580, amp: 40, alpha: 0.22, w: 40, drift: 90, color: tint }),
        wisps(g, [[540, RY + 2], [520, RY + 6], [560, RY + 4]], { h: 500, amp: 36, alpha: 0.32, w: 18, drift: 70, color: tint }),
      ];
      const T = tripod(g, 540, RY, S, { dark: true });
      const mg = BTL.glow(svg, defs, 540, RY - 20, 330, C.gold, 0.7, g);
      const mouth = P0(g, BTL.E(540, RY, 200, 31), mix(C.gold, C.paperLight, 0.45), 0.95);
      const core = P0(g, BTL.E(540, RY + 2, 120, 16), C.paperLight, 0.6);
      const ds = motes(g, 23, 34, [330, 260, 750, RY - 10], { alpha: 0.5, size: 2.6, up: true, color: tint });
      const root = document.documentElement;
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55), pul = Math.sin(lt * 4.5);
          draw(T.gold, BTL.ease(lt, at - 0.1, 1.4));
          mg.set(0.62 + 0.26 * pul); pool.set(0.2 + 0.1 * pul); mg.e.setAttribute('r', f1(330 + 40 * pul));
          mouth.setAttribute('fill-opacity', (0.85 + 0.12 * pul).toFixed(3));
          core.setAttribute('fill-opacity', (0.5 + 0.2 * pul).toFixed(3));
          steam.forEach((w, i) => w.update(lt * (6 + 1.5 * i)));
          ds.update(lt * 14);
          try {
            const sh = document.getElementById('covershade'), tx = document.getElementById('covertext'), on = root.classList.contains('cover');
            if (sh) sh.style.background = on ? `linear-gradient(180deg, ${DARK} 0%, ${DARK} 36%, transparent 50%)` : '';
            if (tx) { tx.style.color = on ? C.paperLight : ''; tx.style.textShadow = on ? `0 4px 24px ${DARK}` : ''; }
          } catch (e) { /* no cover elements */ }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the coin
  const COIN = 'M-300 0C-300-150-150-232 10-230C180-228 300-140 300-10C300 140 170 230-10 228C-170 226-300 150-300 0Z';
  function coinArt(parent, drain) {
    const g = el(parent, 'g');
    P0(g, COIN, C.paperLight, 1);
    const fill = P0(g, COIN, C.gold, 0.5);
    P0(g, 'M-262 0C-262-128-130-200 8-198C156-196 262-120 262-8C262 120 150 196-8 196C-146 194-262 130-262 0Z', C.gold, 0.18);
    // lion forepart, facing right: mane, open jaws, foreleg
    let mane = ''; for (let i = 0; i <= 9; i++) { const a = -1.75 - i * 0.42, x = -128 + 92 * Math.cos(a), y = -26 + 92 * Math.sin(a), am = a + 0.21;
      mane += i ? `Q${f1(-128 + 124 * Math.cos(am))} ${f1(-26 + 124 * Math.sin(am))} ${f1(x)} ${f1(y)}` : `M${f1(x)} ${f1(y)}`; }
    let tufts = ''; for (let i = 0; i < 8; i++) { const a = -1.9 - i * 0.48; tufts += `M${f1(-128 + 56 * Math.cos(a))} ${f1(-26 + 56 * Math.sin(a))}L${f1(-128 + 80 * Math.cos(a))} ${f1(-26 + 80 * Math.sin(a))}`; }
    const lion = 'M-200-70C-170-104-110-110-70-82C-46-66-30-50-10-44L-2-30L-30-24L-8-8L-4 8L-40 6C-60 22-90 34-120 34C-150 34-180 20-196 0';
    const lleg = 'M-170 30C-160 70-150 110-120 140L-70 146M-130 34C-120 70-104 104-90 120';
    const bull = 'M200-60C170-80 120-82 80-62C60-52 44-36 30-30C16-24 12-6 22 8C34 22 56 26 70 20C100 30 150 30 196 10';
    const horn = 'M140-72C130-118 160-150 206-152M100-66C88-104 64-120 40-118';
    const ear = 'M170-44L226-50L184-26';
    const bleg = 'M170 26C160 70 146 108 120 138L70 146M130 30C122 66 108 100 92 118';
    L0(g, mane, C.ink, 4); L0(g, tufts, C.inkSoft, 2.5, 0.8); L0(g, lion, C.ink, 4); L0(g, lleg, C.ink, 4);
    P0(g, BTL.E(-62, -60, 7, 6), C.ink, 1); P0(g, BTL.E(70, -40, 7, 6), C.ink, 1);
    L0(g, 'M-24-22L-14-18', C.ink, 3);
    L0(g, bull, C.ink, 4); L0(g, horn, C.ink, 4); L0(g, ear, C.ink, 3.5); L0(g, bleg, C.ink, 4);
    L0(g, 'M34-8C40-4 44 4 40 10', C.ink, 2.5);
    L0(g, 'M-280 40C-270 100-210 170-130 200M280-40C270-100 210-170 130-200', C.inkSoft, 2, 0.5);
    L0(g, COIN, C.ink, 5);
    return { g, fill };
  }

  SH.bt_kr_coin = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), mode = P.mode || 'gold', CX = 540, CY = 720, S = 1.18;
      const pool = BTL.glow(svg, defs, CX, CY + 40, 640, C.stain, 0.4, g);
      P0(g, BTL.E(CX + 20, CY + 300, 330, 34), C.ink, 0.1);
      const at0 = el(g, 'g', { transform: `translate(${CX} ${CY}) scale(${S})` });
      const ds = motes(g, 41, 36, [150, 200, 930, 1120], { alpha: 0.35, size: 2.6 });
      if (mode === 'crack') {
        const crack = 'M14-232L-8-150L26-90L-14-20L20 40L-12 110L14 170L-6 230';
        const id1 = 'krL' + (++uid), id2 = 'krR' + uid;
        el(el(defs, 'clipPath', { id: id1 }), 'path', { d: crack.replace('M14-232', 'M-400-240L14-240L14-232') + 'L-6 240L-400 240Z' });
        el(el(defs, 'clipPath', { id: id2 }), 'path', { d: crack.replace('M14-232', 'M400-240L14-240L14-232') + 'L-6 240L400 240Z' });
        const hl = el(at0, 'g', { 'clip-path': `url(#${id1})` }), hr = el(at0, 'g', { 'clip-path': `url(#${id2})` });
        const A = coinArt(el(hl, 'g'), true), B = coinArt(el(hr, 'g'), true);
        const cl = LD(at0, crack, C.ink, 5, 1);
        return {
          update(lt, dur, cues) {
            const at = cue(cues, 'hit', dur * 0.45), c = BTL.ease(lt, at - 0.1, 0.7), sp = BTL.ease(lt, at + 0.5, 2.6);
            draw(cl, c); fade(cl, 1 - sp);
            hl.setAttribute('transform', `translate(${f1(-34 * sp)} ${f1(10 * sp)}) rotate(${f1(-4 * sp)})`);
            hr.setAttribute('transform', `translate(${f1(34 * sp)} ${f1(18 * sp)}) rotate(${f1(5 * sp)})`);
            const gd = 0.5 * (1 - BTL.ease(lt, at + 0.2, 2.2));
            A.fill.setAttribute('fill-opacity', gd.toFixed(3)); B.fill.setAttribute('fill-opacity', gd.toFixed(3));
            pool.set((0.4 - 0.18 * BTL.ease(lt, at, 2.4)) + 0.03 * Math.sin(lt * 1.2));
            ds.update(lt * 4);
          },
        };
      }
      const art = coinArt(at0);
      // a soft glint passing slowly over the coin
      const cid = 'krC' + (++uid);
      el(el(defs, 'clipPath', { id: cid }), 'path', { d: COIN });
      const gl = el(el(at0, 'g', { 'clip-path': `url(#${cid})` }), 'path', { d: 'M-60-300L20-300L-40 300L-120 300Z', fill: C.paperLight, 'fill-opacity': 0.5 });
      const edge = LD(at0, COIN, C.gold, 9, 1);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6);
          draw(edge, BTL.ease(lt, at - 0.1, 1.4));
          const u = ((lt * 0.22) % 1.6) - 0.3;
          gl.setAttribute('transform', `translate(${f1(-360 + u * 600)} 0)`);
          pool.set(0.38 + 0.05 * Math.sin(lt * 1.1));
          at0.setAttribute('transform', `translate(${CX} ${f1(CY + 6 * Math.sin(lt * 0.6))}) scale(${S})`);
          ds.update(lt * 4);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the river crossing
  SH.bt_kr_river = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FAR = 720, NEAR = 1170;
      const sun = BTL.glow(svg, defs, 760, 560, 520, C.stain, 0.42, g);
      P0(g, BTL.E(760, 600, 70, 70), C.stain, 0.55);
      // far hills and bank
      P0(g, `M-300 ${FAR}L-300 640C-80 590 140 560 360 600C540 630 700 560 900 580C1060 596 1200 620 1380 610L1380 ${FAR}Z`, C.paperDark, 0.55);
      L0(g, `M-300 640C-80 590 140 560 360 600C540 630 700 560 900 580C1060 596 1200 620 1380 610`, C.inkSoft, 2, 0.6);
      // water
      P0(g, `M-300 ${FAR}L1380 ${FAR}L1380 ${NEAR}L-300 ${NEAR}Z`, WATER(), 1);
      L0(g, `M-300 ${FAR}C200 ${FAR + 10} 700 ${FAR - 8} 1380 ${FAR + 6}`, C.inkSoft, 2.5, 0.8);
      const r = rng(7), flow = [];
      for (let i = 0; i < 26; i++) { const y = FAR + 30 + r() * (NEAR - FAR - 60), w = 40 + (y - FAR) * 0.25;
        flow.push({ e: L0(g, '', C.paperLight, 2 + (y - FAR) / 160, 0.7), x: r() * 1400, y, w, v: 10 + (y - FAR) * 0.05 }); }
      P0(g, BTL.E(760, FAR + 60, 60, 10) + BTL.E(760, FAR + 110, 90, 10), C.stain, 0.35);
      // near bank
      P0(g, `M-300 ${NEAR}C100 ${NEAR - 20} 600 ${NEAR + 14} 1380 ${NEAR - 10}L1380 2100L-300 2100Z`, C.paperDark, 0.9);
      L0(g, `M-300 ${NEAR}C100 ${NEAR - 20} 600 ${NEAR + 14} 1380 ${NEAR - 10}`, C.ink, 2.5, 0.6);
      let reeds = ''; for (let i = 0; i < 14; i++) { const x = 30 + i * 74 + (i % 3) * 12; reeds += `M${x} ${NEAR + 10}Q${x - 6} ${NEAR - 50} ${x + 10} ${NEAR - 90 - (i % 4) * 18}`; }
      const rd = L0(g, reeds, C.ink, 3, 0.7);
      // the file of spearmen
      const men = [];
      for (let i = 0; i < 7; i++) {
        const og = el(g, 'g');
        BTL.person(og, 'stand', 0, 0, 300, { face: 1, color: SIL(), rim: C.ink });
        L0(og, 'M38-150L60-380', C.ink, 6); P0(og, 'M60-380L52-410L70-382Z', C.ink, 1);
        let flag = null;
        if (i === 0) { L0(og, 'M-36-130L-48-430', C.ink, 6); flag = P0(og, 'M-48-428L40-418L32-350L-44-356Z', SIL(), 1, { stroke: C.ink, 'stroke-width': 3 }); }
        const cover = P0(og, 'M-140-110L140-110L140 20L-140 20Z', WATER(), 1);
        const rip = L0(og, 'M-80-108C-40-118 40-118 80-108', C.paperLight, 4, 0.9);
        men.push({ og, flag, cover, rip });
      }
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.65);
          const u0 = 0.58 + 0.4 * BTL.ease(lt, 0, Math.max(1, at + 0.4));
          men.forEach((m, i) => {
            const u = u0 - i * 0.13, x = lerp(130, 860, u), y = lerp(NEAR + 30, FAR + 12, u), k = lerp(1.0, 0.42, u);
            const dep = u > 0.92 ? 0 : (u < 0.04 ? 0 : 1), on = clamp01((u + 0.1) / 0.14);
            m.og.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${k.toFixed(3)})`);
            m.og.setAttribute('opacity', on.toFixed(3));
            m.cover.setAttribute('fill-opacity', dep); m.rip.setAttribute('stroke-opacity', (0.9 * dep).toFixed(2));
            if (m.flag) m.flag.setAttribute('fill', mix(SIL(), C.gold, BTL.ease(lt, at - 0.1, 1.2)));
          });
          for (const q of flow) { const x = ((q.x + lt * q.v) % 1500) - 200; q.e.setAttribute('d', `M${f1(x)} ${f1(q.y)}l${f1(q.w)} 0`); }
          sun.set(0.4 + 0.04 * Math.sin(lt * 0.8));
          rd.setAttribute('transform', `skewX(${f1(1.5 * Math.sin(lt * 0.9))})`);
        },
      };
    },
  };

  // ------------------------------------------------------------------ Sardis falls
  const ROCK = 'M-120 1000L-120 930C-60 900-20 910 20 870L52 842L70 868L118 790C140 770 150 790 170 760L210 700L226 726L262 640C280 610 300 630 318 590L340 540L352 560L380 486L700 486L716 540L742 520L768 600C790 640 810 620 826 660L862 720L880 700L918 780C950 820 980 800 1010 850L1060 880L1120 870L1200 900L1200 1000Z';
  const NOTCH = [[52, 842], [118, 790], [210, 700], [262, 640], [340, 540], [742, 520], [862, 720], [918, 780], [1060, 880]];
  const WALL = 'M380 478L380 404L410 404L410 420L436 420L436 404L466 404L466 420L492 420L492 362L540 362L540 420L570 420L570 404L600 404L600 420L620 420L620 350L670 350L670 420L700 420L700 478';
  SH.bt_kr_sardes = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FY = 1000;
      const pool = BTL.glow(svg, defs, 550, 560, 620, C.stain, 0.34, g);
      const fire = BTL.glow(svg, defs, 540, 420, 460, C.red, 0, g);
      const fire2 = BTL.glow(svg, defs, 540, 440, 260, C.gold, 0, g);
      const smoke = wisps(g, [[440, 400], [540, 380], [640, 396]], { h: 520, amp: 120, alpha: 0.22, w: 60, drift: 90 });
      const smoke2 = wisps(g, [[480, 400], [600, 390]], { h: 440, amp: 100, alpha: 0.3, w: 30, drift: 70 });
      P0(g, WALL + 'L700 500L380 500Z', C.paperLight, 1);
      L0(g, WALL, C.ink, 3.5);
      P0(g, ROCK, C.paperDark, 1);
      // eroded gullies running down from every notch of the serrated crest, and a few between
      let fl = ''; const r = rng(5);
      for (const [x, y] of NOTCH) fl += `M${x} ${y}C${f1(x - 12)} ${f1(y + 80)} ${f1(x + 10)} ${f1(y + 160)} ${f1(x + (x - 540) * 0.08)} ${FY}`;
      for (let i = 0; i < 9; i++) { const x = 400 + i * 36 + r() * 10, y0 = 500 + r() * 90; fl += `M${f1(x)} ${f1(y0)}C${f1(x - 8)} ${f1(y0 + 160)} ${f1(x + 8)} ${f1(y0 + 320)} ${f1(x + (x - 540) * 0.1)} ${FY}`; }
      L0(g, fl, C.inkSoft, 2.5, 0.55);
      L0(g, ROCK.slice(0, -1), C.ink, 3.5);
      ground(g, FY, { alpha: 0.75 });
      // the lower town: low houses at the foot of the rock
      let hs = ''; for (let i = 0; i < 9; i++) { const x = 40 + i * 118, w = 70 + (i % 3) * 16, h = 46 + (i % 2) * 20, y = FY + 40 + (i % 2) * 34;
        hs += `M${x} ${y}L${x} ${y - h}L${x + w / 2} ${y - h - 24}L${x + w} ${y - h}L${x + w} ${y}Z`; }
      P0(g, hs, C.paperLight, 1); L0(g, hs, C.ink, 2.5, 0.9);
      const dim = P0(g, 'M-300-100L1380-100L1380 2100L-300 2100Z', C.ink, 0);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5), n = BTL.ease(lt, Math.min(at - 0.9, dur * 0.5), 1.4), sm = BTL.ease(lt, 0.1, 1.4);
          smoke.update(lt * 1.2, sm); smoke2.update(lt * 1.5, sm);
          fire.set(0.1 * sm + 0.45 * n + 0.05 * Math.sin(lt * 1.6)); fire2.set(0.5 * n + 0.08 * n * Math.sin(lt * 2.1));
          pool.set(0.34 - 0.16 * n);
          dim.setAttribute('fill-opacity', (0.1 * n).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ Sardis today: two columns of the Artemis temple
  SH.bt_kr_ruins = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FY = 1110;
      const sunGlow = BTL.glow(svg, defs, 800, 620, 520, C.stain, 0.4, g);
      const sun = P0(g, '', C.stain, 0.6);
      // the acropolis behind
      const hill = 'M-300 1000L-300 760C-100 700 60 560 200 520C300 494 380 540 470 600C560 660 700 700 900 760C1100 820 1260 860 1380 880L1380 1000Z';
      P0(g, hill, C.paperDark, 0.6); L0(g, hill.slice(0, hill.lastIndexOf('L1380 1000')), C.inkSoft, 2, 0.6);
      ground(g, FY, { alpha: 0.7 });
      // the platform and fallen drums
      P0(g, `M140 ${FY}L140 ${FY - 30}L940 ${FY - 30}L940 ${FY}Z`, C.paperLight, 1); L0(g, `M140 ${FY}L140 ${FY - 30}L940 ${FY - 30}L940 ${FY}`, C.ink, 3);
      for (const [x, y, w] of [[230, FY + 300, 110], [820, FY + 330, 130], [520, FY + 380, 120]]) {
        P0(g, `M${x - w / 2} ${y - 40}L${x + w / 2} ${y - 40}L${x + w / 2} ${y + 40}L${x - w / 2} ${y + 40}Z`, C.paperLight, 1);
        P0(g, BTL.E(x + w / 2, y, 18, 40), C.paperDark, 1);
        L0(g, `M${x - w / 2} ${y - 40}L${x + w / 2} ${y - 40}M${x - w / 2} ${y + 40}L${x + w / 2} ${y + 40}`, C.ink, 3);
        L0(g, BTL.E(x + w / 2, y, 18, 40) + BTL.E(x - w / 2, y, 18, 40), C.ink, 3);
      }
      // two Ionic columns
      for (const cx of [380, 700]) {
        const top = cx === 380 ? 420 : 460, b = FY - 30;
        P0(g, `M${cx - 40} ${b}L${cx - 34} ${top + 50}L${cx + 34} ${top + 50}L${cx + 40} ${b}Z`, C.paperLight, 1);
        let fl = ''; for (const d of [-20, -8, 4, 16]) fl += `M${cx + d} ${top + 60}L${cx + d * 1.15} ${b - 6}`;
        L0(g, fl, C.inkSoft, 2, 0.6);
        L0(g, `M${cx - 40} ${b}L${cx - 34} ${top + 50}M${cx + 34} ${top + 50}L${cx + 40} ${b}`, C.ink, 3.5);
        for (const y of [top + 220, top + 400]) L0(g, `M${cx - 37} ${y}L${cx + 37} ${y}`, C.inkSoft, 2, 0.6);
        // capital: echinus, volutes, abacus
        P0(g, `M${cx - 80} ${top + 18}L${cx + 80} ${top + 18}L${cx + 80} ${top + 44}L${cx - 80} ${top + 44}Z`, C.paperLight, 1);
        L0(g, `M${cx - 80} ${top + 18}L${cx + 80} ${top + 18}M${cx - 50} ${top + 50}L${cx + 50} ${top + 50}`, C.ink, 3);
        for (const s of [-1, 1]) { const vx = cx + s * 76, vy = top + 40;
          P0(g, BTL.E(vx, vy, 26, 26), C.paperLight, 1);
          L0(g, `M${vx} ${vy - 26}A26 26 0 1 ${s > 0 ? 1 : 0} ${vx} ${vy + 26}A18 18 0 1 ${s > 0 ? 1 : 0} ${vx} ${vy - 10}A9 9 0 1 ${s > 0 ? 1 : 0} ${vx} ${vy + 8}`, C.ink, 3); }
        P0(g, `M${cx - 90} ${top}L${cx + 90} ${top}L${cx + 90} ${top + 18}L${cx - 90} ${top + 18}Z`, C.paperLight, 1);
        L0(g, `M${cx - 90} ${top}L${cx + 90} ${top}L${cx + 90} ${top + 18}L${cx - 90} ${top + 18}Z`, C.ink, 3);
      }
      const ds = motes(g, 53, 50, [100, 300, 980, FY - 20], { alpha: 0.4, size: 2.8 });
      const clouds = [L0(g, '', C.inkSoft, 2.5, 0.45), L0(g, '', C.inkSoft, 2, 0.35)];
      return {
        update(lt) {
          const sy = 560 + 22 * lt;
          sun.setAttribute('d', BTL.E(830, Math.min(sy, 820), 66, 66));
          sunGlow.e.setAttribute('cy', f1(Math.min(sy, 820) + 40));
          sunGlow.set(0.4 + 0.03 * Math.sin(lt));
          const cx = 120 + 14 * lt;
          clouds[0].setAttribute('d', `M${f1(cx)} 300C${f1(cx + 80)} 290 ${f1(cx + 200)} 296 ${f1(cx + 320)} 304`);
          clouds[1].setAttribute('d', `M${f1(cx + 420)} 250C${f1(cx + 480)} 244 ${f1(cx + 560)} 248 ${f1(cx + 640)} 254`);
          ds.update(lt * 5);
        },
      };
    },
  };
  // ------------------------------------------------------------------ the Aegean: Sardis -> Delphi
  // coarse hand-traced coasts (lon, lat), smoothed; land a shade lighter than the sea
  const AEG = [
    [[19.0, 42.0], [26.3, 42.0], [26.0, 40.85], [24.8, 40.9], [23.9, 40.7], [23.6, 40.25], [22.9, 40.55], [22.6, 40.2], [22.9, 39.5], [23.25, 39.1],
     [22.8, 38.9], [23.6, 38.35], [24.05, 37.7], [23.2, 37.95], [23.15, 37.6], [22.85, 37.5], [23.0, 36.5], [22.45, 36.6], [21.7, 36.85], [21.6, 37.6],
     [21.3, 37.95], [21.8, 38.25], [22.85, 38.05], [22.4, 38.4], [21.5, 38.35], [21.0, 38.8], [20.3, 39.5], [19.4, 40.4]],
    [[27.0, 42.0], [32.0, 42.0], [32.0, 35.5], [29.6, 36.2], [28.6, 36.75], [27.5, 36.7], [27.3, 37.1], [27.25, 37.85], [26.4, 38.3], [27.0, 38.55],
     [26.7, 38.95], [26.9, 39.5], [26.1, 39.5], [26.2, 40.1], [26.7, 40.45]],
    [[22.85, 38.85], [23.5, 38.9], [24.2, 38.55], [24.6, 38.15], [24.2, 38.1], [23.4, 38.55]],
    [[23.5, 35.55], [24.3, 35.6], [25.5, 35.38], [26.3, 35.28], [26.05, 35.0], [24.7, 35.05], [23.6, 35.25]],
  ];
  const ISLES = [[26.25, 39.15, 0.3, 0.16], [26.0, 38.38, 0.12, 0.2], [26.75, 37.72, 0.22, 0.07], [28.0, 36.2, 0.14, 0.28], [25.25, 39.9, 0.16, 0.11],
    [25.45, 37.05, 0.12, 0.09], [24.85, 37.85, 0.13, 0.07], [25.4, 36.42, 0.09, 0.05]];
  // corner-cutting smoothing (quadratic through the edge midpoints): never overshoots, so long and short edges mix well
  function smooth(pts) {
    const n = pts.length, m = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const s0 = m(pts[n - 1], pts[0]);
    let d = `M${f1(s0[0])} ${f1(s0[1])}`;
    for (let i = 0; i < n; i++) { const p = pts[i], e = m(p, pts[(i + 1) % n]); d += `Q${f1(p[0])} ${f1(p[1])} ${f1(e[0])} ${f1(e[1])}`; }
    return d + 'Z';
  }
  SH.bt_kr_map = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), LON = 25.05, LAT = 38.1, SC = 192, K = Math.cos(LAT * Math.PI / 180);
      const X = lon => 540 + (lon - LON) * K * SC, Y = lat => 800 - (lat - LAT) * SC;
      const land = AEG.map(poly => smooth(poly.map(([a, b]) => [X(a), Y(b)]))).join('') +
        ISLES.map(([a, b, rx, ry]) => BTL.E(X(a), Y(b), rx * K * SC, ry * SC)).join('');
      P0(g, 'M-300-300L1380-300L1380 2200L-300 2200Z', C.paperDark, 0.55);
      P0(g, land, C.paperLight, 1);
      L0(g, land, C.inkSoft, 2.6, 0.9);
      const sea = svgText(g, 'Ege', X(25.0), Y(38.95), 50, { fill: C.inkSoft, 'font-family': BTL.LO, 'font-style': 'italic', 'letter-spacing': '0.2em', opacity: 0.8 });
      sea.setAttribute('text-anchor', 'middle');
      const [sx, sy] = [X(28.04), Y(38.48)], [dx, dy] = [X(22.5), Y(38.48)];
      const route = LD(g, `M${f1(sx)} ${f1(sy)}C${f1(sx - 180)} ${f1(sy - 160)} ${f1(dx + 220)} ${f1(dy - 170)} ${f1(dx)} ${f1(dy)}`, C.gold, 6, 1);
      route.setAttribute('stroke-dasharray', '0.025 0.015');
      const pin = (x, y, name, lx, ly, anchor) => {
        const pg = el(g, 'g', { opacity: 0 });
        const ring = el(pg, 'circle', { cx: x, cy: y, r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 3 });
        el(pg, 'circle', { cx: x, cy: y, r: 11, fill: C.gold });
        const t = svgText(pg, name, lx, ly, 60, { fill: C.ink, 'font-family': BTL.FR, 'font-weight': 500, stroke: C.paper, 'stroke-width': 12, 'stroke-linejoin': 'round', 'paint-order': 'stroke' });
        t.setAttribute('text-anchor', anchor);
        return { pg, ring };
      };
      const A = pin(sx, sy, 'Sardes', sx + 30, sy + 90, 'end'), B = pin(dx, dy, 'Delfi', dx - 30, dy - 46, 'start');
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6);
          fade(A.pg, BTL.ease(lt, 0, 0.5));
          // the route is drawn from the start and reaches Delphi as its name is spoken
          const rp = BTL.ease(lt, 0.15, Math.max(0.6, at - 0.05));
          route.setAttribute('stroke-dasharray', 'none'); draw(route, rp);
          fade(B.pg, BTL.ease(lt, at - 0.3, 0.5));
          for (const [q, t0] of [[A, 0], [B, at]]) { const ph = (((lt - t0) % 1.6) + 1.6) % 1.6 / 1.6;
            q.ring.setAttribute('r', f1(16 + 30 * ph)); q.ring.setAttribute('stroke-opacity', f1((1 - ph) * 0.9)); }
        },
      };
    },
  };
})();
