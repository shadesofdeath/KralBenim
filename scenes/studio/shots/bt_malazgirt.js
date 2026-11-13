// bt_malazgirt: Malazgirt, 26 August 1071 — the captive emperor Romanos IV Diogenes, spared by Sultan Alparslan and
// blinded by his own court a year later. Belgesel style (docs/BELGESEL.md): clean still line art in the theme's tokens,
// slow natural motion only (dust in a light beam, a cloak edge, horse-tail standard and tent flaps in the wind, a slow
// walk, a candle flame, smoke). Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame shows
// it as a centred column. No violence is shown: the blinding is a candle that goes out.
//   bt_mlz_captive P: {}  cues: hit   a battlefield at dusk, low hills; one faceless captive kneeling in a pool of light,
//                  head bowed, wrists bound in front with a rope, cloak moving slowly; his crown lies tipped over on the ground before him; on "hit" a gold line runs
//                  round the crown
//   bt_mlz_tent    P: {}  cues: hit   a round felt tent (otağ) with its door flaps open; a seated figure inside the
//                  door, a standing faceless captive before it; a horse-tail standard sways beside the tent; on "hit" a
//                  short chain draws in between the captive's hands and the light falls on him
//   bt_mlz_sword   P: {}  cues: hit   one straight sword, point down, drawing itself in a light pool; on "hit" a gold
//                  line runs down the edge of the blade; a soft glint travels slowly along it
//   bt_mlz_road    P: {}  cues: hit   dusk, a long road to the western horizon, low sun; a small rider walks slowly
//                  away along it; a broken chain lies across the road in the foreground, on "hit" its open link turns gold
//   bt_mlz_throne  P: {}  cues: hit   a Byzantine apse with a gold arch, a high-backed throne on a two-step dais, dust in
//                  a beam; empty at first, on "hit" a seated faceless figure fades in on it, a gold crown on his head
//   bt_mlz_oath    P: {}  cues: hit   a written sheet (a guarantee) whose lines write themselves; on "hit" a gold seal on a
//                  red cord appears under it and swings very slowly
//   bt_mlz_isle    P: {}  dusk over a calm sea, a small low island (Prote) with a tiny chapel, the sun low beside it
//   bt_mlz_map     P: {}  cues: hit   Anatolia between the Black Sea and the Mediterranean, Konstantinopolis in the west, a
//                  dotted march east to Malazgirt (north of Lake Van), which pulses with its name and the year
//   bt_mlz_candle  P: {mode: "out"|"smoke"}  cues: hit   one tall candle on a holder. out: the flame burns softly, on
//                  "hit" it shrinks and goes out, the light pool fades and a thin smoke thread rises. smoke: already out,
//                  only the smoke curling slowly upwards in a dim light
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
  const SIL = () => mix(C.paper, C.ink, 0.62);     // silhouette fill on light and dark themes

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }
  // ground from y down to the bottom of the frame, with a few faint far lines
  function ground(g, y, o = {}) {
    P0(g, `M-300 ${y}L1380 ${y}L1380 2100L-300 2100Z`, o.color || C.paperDark, o.alpha ?? 0.7);
    L0(g, `M-300 ${y}L1380 ${y}`, C.inkSoft, 2, 0.4);
    L0(g, `M-300 ${y + 120}L1380 ${y + 120}M-300 ${y + 360}L1380 ${y + 360}`, C.inkSoft, 1.5, 0.1);
  }
  function hills(g, y, a = 0.5) {
    const d = `M-300 ${y}L-300 ${y - 30}C-100 ${y - 70} 120 ${y - 90} 300 ${y - 60}C460 ${y - 36} 600 ${y - 110} 800 ${y - 96}C960 ${y - 84} 1120 ${y - 50} 1380 ${y - 60}L1380 ${y}Z`;
    P0(g, d, C.paperDark, a * 0.6); L0(g, d.replace(/L1380 [\d.]+Z$/, ''), C.inkSoft, 2, a);
  }
  // slow motes drifting inside a box
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
  // thin smoke threads rising from far points on the horizon
  function smokes(g, pts) {
    const list = pts.map(([x, y], i) => ({ x, y, e: L0(g, '', C.inkSoft, 4, 0.3), ph: i * 1.7 }));
    return { update(lt) { for (const q of list) {
      const s1 = 24 * Math.sin(lt * 1.6 + q.ph), s2 = 36 * Math.sin(lt * 1.3 + q.ph + 1), h = 340;
      q.e.setAttribute('d', `M${q.x} ${q.y}C${f1(q.x + s1)} ${f1(q.y - h * 0.35)} ${f1(q.x - s2)} ${f1(q.y - h * 0.7)} ${f1(q.x + s2 + 30)} ${f1(q.y - h)}`);
    } } };
  }
  // a closed crown (Byzantine stemma: band, arches, small cross), origin at the middle of the bottom of the band
  function crownD(s = 1) {
    const band = `M${-70 * s} 0L${70 * s} 0L${74 * s} ${-44 * s}L${-74 * s} ${-44 * s}Z`;
    const arch = `M${-74 * s} ${-44 * s}C${-70 * s} ${-110 * s} ${70 * s} ${-110 * s} ${74 * s} ${-44 * s}M0 ${-44 * s}L0 ${-96 * s}`;
    const cross = `M0 ${-96 * s}L0 ${-130 * s}M${-14 * s} ${-116 * s}L${14 * s} ${-116 * s}`;
    const gems = BTL.E(-40 * s, -22 * s, 7 * s, 7 * s) + BTL.E(0, -22 * s, 9 * s, 9 * s) + BTL.E(40 * s, -22 * s, 7 * s, 7 * s);
    const pend = `M${-62 * s} 0l0 ${26 * s}M${62 * s} 0l0 ${26 * s}`;
    return { band, arch, cross, gems, pend };
  }
  function crown(g, x, y, s, rot = 0, o = {}) {
    const cg = el(g, 'g', { transform: `translate(${x} ${y}) rotate(${rot})` }), d = crownD(s);
    P0(cg, d.band, o.fill || C.paperLight, 1);
    P0(cg, `${d.arch.split('M0')[0]}Z`, o.fill || C.paperLight, 0.85);
    L0(cg, d.arch, o.line || C.ink, 3); L0(cg, d.band, o.line || C.ink, 3.5); L0(cg, d.cross, o.line || C.ink, 3);
    P0(cg, d.gems, C.gold, 0.9);
    const gold = el(cg, 'path', { d: d.band + d.arch + d.cross, fill: 'none', stroke: C.gold, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1 });
    draw(gold, 0);
    return { g: cg, gold };
  }

  // a filled silhouette from custom joints (units of the figure height, feet at 0, up is -y), like BTL.person but with
  // its own poses (bound captive) and a width factor k for a heavier body
  const J = {
    bound: { head: [0.105, -0.61], sh: [0, -0.58], hip: [-0.03, -0.3], k1: [0.15, -0.05], f1: [-0.2, -0.02], k2: [0.11, -0.04], f2: [-0.25, 0],
      e1: [0.07, -0.43], h1: [0.15, -0.36], e2: [0.05, -0.44], h2: [0.15, -0.35] },
    standBound: { head: [0.02, -0.9], sh: [0, -0.77], hip: [0, -0.47], k1: [-0.03, -0.24], f1: [-0.05, 0], k2: [0.04, -0.24], f2: [0.06, 0],
      e1: [0.07, -0.6], h1: [0.13, -0.5], e2: [0.05, -0.6], h2: [0.13, -0.49] },
    throne: { head: [0.03, -0.73], sh: [0, -0.6], hip: [-0.03, -0.25], k1: [0.2, -0.26], f1: [0.22, 0], k2: [0.24, -0.25], f2: [0.27, 0],
      e1: [0.1, -0.42], h1: [0.24, -0.36], e2: [0.12, -0.41], h2: [0.26, -0.34] },
  };
  function figure(parent, pose, x, y, h, o = {}) {
    const P = J[pose], fc = o.face ?? 1, col = o.color || SIL(), rim = o.rim || C.ink, k = o.k || 1;
    const g = el(parent, 'g', { transform: `translate(${x} ${y})` });
    const pt = n => [P[n][0] * h * fc, P[n][1] * h];
    const line = ks => 'M' + ks.map(n => pt(n).map(f1).join(' ')).join('L');
    const limbs = [[['hip', 'k1', 'f1'], 0.06], [['hip', 'k2', 'f2'], 0.06], [['sh', 'hip'], 0.14], [['sh', 'e1', 'h1'], 0.045], [['sh', 'e2', 'h2'], 0.045]];
    for (const [ks, w] of limbs) L0(g, line(ks), rim, w * h * k + 3, 0.8);
    for (const [ks, w] of limbs) L0(g, line(ks), col, w * h * k, 1);
    const [hx, hy] = pt('head');
    el(g, 'circle', { cx: hx, cy: hy, r: 0.08 * h + 1.5, fill: rim, 'fill-opacity': 0.8 });
    el(g, 'circle', { cx: hx, cy: hy, r: 0.08 * h, fill: col });
    return { g, pt };
  }
  // a rope wound round two wrists: a few dark turns and a loose end hanging down
  function rope(g, x, y, s, len = 120) {
    L0(g, `M${f1(x - 18 * s)} ${f1(y - 14 * s)}l${f1(36 * s)} ${f1(10 * s)}M${f1(x - 20 * s)} ${f1(y)}l${f1(40 * s)} ${f1(10 * s)}M${f1(x - 18 * s)} ${f1(y + 14 * s)}l${f1(36 * s)} ${f1(10 * s)}`, C.ink, 5 * s, 1);
    return L0(g, '', C.ink, 3 * s, 0.8);
  }

  // ------------------------------------------------------------------ bt_mlz_captive
  SH.bt_mlz_captive = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FY = 1060;
      hills(g, 900, 0.45);
      ground(g, FY);
      const beam = P0(g, 'M380-200L700-200L900 1100L180 1100Z', C.stain, 0.06);
      const pool = BTL.glow(svg, defs, 560, 860, 620, C.stain, 0.34, g);
      P0(g, BTL.E(560, FY + 6, 330, 30), C.ink, 0.12);
      // the cloak behind him, its hem lifting slowly
      const h = 640, x = 430, fc = 1;
      const cloak = P0(g, '', SIL(), 1, { stroke: C.ink, 'stroke-width': 2.5, 'stroke-opacity': 0.8 });
      const F = figure(g, 'bound', x, FY, h, { face: fc, k: 1.15 });
      const [wx, wy] = F.pt('h1');
      const rp = rope(F.g, wx, wy, 1.2);
      const cr = crown(g, 790, FY - 2, 1.25, -6);
      const ds = motes(g, 31, 64, [160, 200, 940, FY - 30], { alpha: 0.6, size: 3.4 });
      
      // a leaning spear stuck in the ground behind him, a torn pennant moving in the wind
      L0(g, `M960 ${FY - 2}L900 420`, C.ink, 5, 0.85);
      const pen = P0(g, '', SIL(), 0.9, { stroke: C.ink, 'stroke-width': 2, 'stroke-opacity': 0.7 });
      return {
        update(lt, dur, cues) {
          const sw = 40 * Math.sin(lt * 1.8), sw2 = 34 * Math.sin(lt * 1.8 + 1.1);
          const sx = x, sy = FY - 0.58 * h, hx = x - 0.03 * h, hy = FY - 0.3 * h;
          const r1 = 8 * Math.sin(lt * 1.4);
          rp.setAttribute('d', `M${f1(wx + 4)} ${f1(wy + 14)}C${f1(wx + 4 + r1 * 0.5)} ${f1(wy + 50)} ${f1(wx - 6)} ${f1(wy + 80)} ${f1(wx + 14 + r1)} ${f1(wy + 96)}C${f1(wx + 40)} ${f1(wy + 110)} ${f1(wx + 30)} ${f1(wy + 70)} ${f1(wx + 12)} ${f1(wy + 60)}`);
          cloak.setAttribute('d', `M${f1(sx)} ${f1(sy)}C${f1(sx - 120)} ${f1(sy + 40)} ${f1(hx - 150 + sw)} ${f1(hy + 40)} ${f1(hx - 190 + sw2)} ${FY - 6}` +
            `L${f1(hx + 40)} ${FY - 4}C${f1(hx + 10)} ${f1(hy + 60)} ${f1(sx - 30)} ${f1(sy + 60)} ${f1(sx)} ${f1(sy)}Z`);
          draw(cr.gold, 1); fade(cr.gold, BTL.ease(lt, cue(cues, 'hit', dur * 0.6) - 0.2, 1.2));
          pool.set(0.32 + 0.06 * Math.sin(lt * 1.4));
          beam.setAttribute('fill-opacity', (0.06 + 0.015 * Math.sin(lt * 0.5)).toFixed(3));
          ds.update(lt * 6);
          const a = 34 * Math.sin(lt * 3.4), b = 48 * Math.sin(lt * 3.4 + 1.2), c = 30 * Math.sin(lt * 3.4 + 2.1);
          pen.setAttribute('d', `M903 448C850 ${f1(440 + a)} 790 ${f1(450 + b)} 730 ${f1(452 + b)}L770 ${f1(490 + c)}L720 ${f1(526 + b)}C800 ${f1(520 + a)} 850 ${f1(530 + c)} 896 530Z`);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mlz_tent
  SH.bt_mlz_tent = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FY = 1080;
      hills(g, 820, 0.35);
      ground(g, FY);
      const pool = BTL.glow(svg, defs, 520, 820, 620, C.stain, 0.26, g);
      const spot = BTL.glow(svg, defs, 800, 860, 300, C.stain, 0, g);
      // the tent: drum wall and conical roof, door opening in the middle
      const TX = 470, wall = `M150 ${FY}L150 640L790 640L790 ${FY}Z`;
      const roof = 'M110 650L${TX} 360L830 650Z'.replace('${TX}', TX);
      P0(g, BTL.E(TX, FY + 8, 360, 26), C.ink, 0.1);
      P0(g, wall, C.paperLight, 1); P0(g, roof, C.paperLight, 1);
      L0(g, 'M150 640C320 668 620 668 790 640', C.inkSoft, 2.5, 0.8);
      let seams = ''; for (const sx of [230, 310, 630, 710]) seams += `M${sx} 664L${sx} ${FY}`;
      for (const rx of [200, 290, 650, 740]) seams += `M${TX} 372L${rx} 652`;
      L0(g, seams, C.inkSoft, 1.6, 0.45);
      L0(g, 'M150 700L790 700', C.gold, 3, 0.7);   // woven band
      L0(g, wall, C.ink, 3.5); L0(g, roof, C.ink, 3.5);
      L0(g, `M${TX} 360L${TX} 316`, C.ink, 3); P0(g, BTL.E(TX, 310, 9, 9), C.gold, 1);
      // door: dark opening, seated figure inside
      const door = `M380 ${FY}L380 720C400 690 540 690 560 720L560 ${FY}Z`;
      P0(g, door, mix(C.paperDark, C.ink, 0.25), 1);
      P0(g, BTL.E(TX, FY - 8, 110, 18), C.paperLight, 0.5);   // cushion
      BTL.person(g, 'sit', TX - 26, FY - 18, 300, { face: 1, color: SIL(), rim: C.ink });
      L0(g, door, C.ink, 3);
      // door flaps tied back, moving slowly
      const flL = P0(g, '', C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 }), flR = P0(g, '', C.paperLight, 1, { stroke: C.ink, 'stroke-width': 3 });
      // the horse-tail standard (tuğ) on the left
      L0(g, `M88 ${FY}L88 470`, C.ink, 4); P0(g, BTL.E(88, 462, 12, 12), C.gold, 1);
      const tug = P0(g, '', SIL(), 1, { stroke: C.ink, 'stroke-width': 2, 'stroke-opacity': 0.7 });
      // the captive, standing before the tent, facing it
      const CX = 830, CH = 470;
      P0(g, BTL.E(CX, FY + 6, 90, 12), C.ink, 0.15);
      const CF = figure(g, 'standBound', CX, FY, CH, { face: -1, k: 1.1 });
      const [cwx, cwy] = CF.pt('h1');
      // the chain: big links hanging from the bound wrists, drawn in on "hit"
      const chg = el(CF.g, 'g', { opacity: 0 });
      let lk = '';
      for (let i = 0; i < 6; i++) { const yy = cwy + 26 + i * 34, xx = cwx + (i % 2 ? 4 : -4); lk += i % 2 ? BTL.E(xx, yy, 7, 17) : BTL.E(xx, yy, 15, 18); }
      L0(chg, lk, C.ink, 9, 1); L0(chg, lk, C.gold, 4, 1);
      L0(chg, `M${f1(cwx - 22)} ${f1(cwy - 12)}L${f1(cwx + 22)} ${f1(cwy - 4)}M${f1(cwx - 22)} ${f1(cwy + 8)}L${f1(cwx + 22)} ${f1(cwy + 16)}`, C.ink, 10, 1);
      const ds = motes(g, 47, 18, [160, 300, 960, FY - 30], { alpha: 0.35 });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5), q = BTL.ease(lt, th - 0.2, 1.4);
          fade(chg, q);
          spot.set(0.3 * q); pool.set(0.26 + 0.03 * Math.sin(lt * 0.6));
          const a = 8 * Math.sin(lt * 0.7), b = 8 * Math.sin(lt * 0.7 + 1.3);
          flL.setAttribute('d', `M380 720C350 760 ${f1(330 + a)} 900 ${f1(352 + a)} ${FY}L380 ${FY}Z`);
          flR.setAttribute('d', `M560 720C590 760 ${f1(610 + b)} 900 ${f1(588 + b)} ${FY}L560 ${FY}Z`);
          const t1 = 16 * Math.sin(lt * 0.9), t2 = 22 * Math.sin(lt * 0.9 + 0.8);
          tug.setAttribute('d', `M76 476C70 520 ${f1(60 + t1)} 580 ${f1(66 + t2)} 650C${f1(86 + t2)} 640 ${f1(100 + t1)} 600 ${f1(104 + t1 * 0.5)} 476Z`);
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mlz_sword
  SH.bt_mlz_sword = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), X = 540;
      const pool = BTL.glow(svg, defs, X, 700, 560, C.stain, 0.22, g);
      const D = BTL.drawing(g);
      const blade = `M${X - 34} 470L${X + 34} 470L${X + 30} 980L${X} 1100L${X - 30} 980Z`;
      const guard = `M${X - 190} 440C${X - 150} 426 ${X + 150} 426 ${X + 190} 440L${X + 196} 466C${X + 150} 476 ${X - 150} 476 ${X - 196} 466Z`;
      const grip = `M${X - 22} 300L${X + 22} 300L${X + 26} 432L${X - 26} 432Z`;
      const pommel = BTL.E(X, 276, 40, 34);
      D.f(blade, C.paperLight, 1); D.f(guard, C.paperLight, 1); D.f(grip, C.paperDark, 1); D.f(pommel, C.paperLight, 1);
      D.s(blade, { w: 4 }); D.s(`M${X} 476L${X} 1060`, { w: 2, color: C.inkSoft });
      D.s(guard, { w: 4 }); D.s(grip, { w: 4 }); D.s(pommel, { w: 4 });
      D.s(`M${X - 22} 330L${X + 22} 344M${X - 22} 362L${X + 22} 376M${X - 22} 394L${X + 22} 408`, { w: 2.5, color: C.inkSoft });
      const edge = LD(g, `M${X + 34} 470L${X + 30} 980L${X} 1100`, C.gold, 5, 1);
      const glint = P0(g, '', C.paperLight, 0);
      const ds = motes(g, 59, 16, [300, 260, 780, 1100], { alpha: 0.3 });
      return {
        update(lt, dur, cues) {
          D.reveal(clamp01(0.35 + BTL.ease(lt, 0, 1.8)));
          draw(edge, BTL.ease(lt, cue(cues, 'hit', dur * 0.55) - 0.2, 1.2));
          const u = ((lt * 0.22) % 1), y = 500 + u * 520;
          glint.setAttribute('d', `M${X - 18} ${f1(y)}L${X + 18} ${f1(y - 30)}L${X + 18} ${f1(y - 6)}L${X - 18} ${f1(y + 24)}Z`);
          glint.setAttribute('fill-opacity', (0.8 * Math.sin(Math.PI * u) * BTL.ease(lt, 1, 1)).toFixed(3));
          pool.set(0.22 + 0.03 * Math.sin(lt * 0.7));
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mlz_road
  // a small rider (horse facing left), origin at the hooves; legs swing slowly
  function rider(g) {
    const rg = el(g, 'g'), m = el(rg, 'g', { transform: 'scale(-1 1)' }), col = SIL();
    const legs = [[-52, -66], [-34, -66], [56, -66], [72, -66]].map(([x, y], i) => ({ x, y, e: L0(m, '', col, 10, 1), ph: [0, Math.PI, Math.PI, 0][i] }));
    const tail = P0(m, '', col, 1, { stroke: C.ink, 'stroke-width': 2 });
    const body = 'M-72-74C-82-108-46-116 0-112L44-112C62-114 74-122 84-134L112-176C118-186 130-186 134-176L156-140C160-132 154-124 144-128L122-138' +
      'C110-118 98-98 88-80C82-68 72-64 60-64L-52-64C-64-64-70-68-72-74Z';
    P0(m, body, col, 1, { stroke: C.ink, 'stroke-width': 2.5 });
    P0(m, 'M118-180L116-198L130-184Z', col, 1, { stroke: C.ink, 'stroke-width': 2 });
    L0(m, 'M86-132C96-150 104-164 112-176', C.ink, 6, 0.8);   // mane
    const cloak = P0(m, '', col, 1, { stroke: C.ink, 'stroke-width': 2 });
    P0(m, 'M-12-112L-4-172L16-172L20-112Z', col, 1, { stroke: C.ink, 'stroke-width': 2.5 });
    P0(m, BTL.E(6, -188, 14, 15), col, 1, { stroke: C.ink, 'stroke-width': 2.5 });
    L0(m, 'M14-150L40-128', C.ink, 7, 1);   // arm to the reins
    return {
      g: rg,
      update(lt) {
        const w = lt * 2.2;
        for (const L of legs) { const a = 10 * Math.sin(w + L.ph); L.e.setAttribute('d', `M${L.x} ${L.y}L${f1(L.x + a)} 0`); }
        const t = 6 * Math.sin(lt * 1.3);
        tail.setAttribute('d', `M-70-104C-96-98 ${f1(-104 - t)}-62 ${f1(-98 - t)}-26C-88-48-80-80-68-90Z`);
        const c = 8 * Math.sin(lt * 1.1);
        cloak.setAttribute('d', `M-4-168C-24-156 ${f1(-44 - c)}-128 ${f1(-52 - c)}-104L-10-112Z`);
      },
    };
  }
  SH.bt_mlz_road = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), HZ = 700;
      const sun = BTL.glow(svg, defs, 170, HZ - 90, 640, C.stain, 0.4, g);
      P0(g, BTL.E(170, HZ - 90, 52, 52), C.paperLight, 0.9, { stroke: C.gold, 'stroke-width': 3 });
      hills(g, HZ + 10, 0.5);
      ground(g, HZ + 10, { alpha: 0.75 });
      // the road: from the bottom of the frame, curving away to the western horizon
      const road = `M600 2100C600 1500 720 1100 560 940C460 840 360 760 330 ${HZ + 12}L346 ${HZ + 12}C400 760 520 840 660 940C860 1100 820 1500 940 2100Z`;
      P0(g, road, C.paperLight, 0.85);
      L0(g, `M600 2100C600 1500 720 1100 560 940C460 840 360 760 330 ${HZ + 12}M346 ${HZ + 12}C400 760 520 840 660 940C860 1100 820 1500 940 2100`, C.inkSoft, 2.5, 0.7);
      // the rider, small, walking away
      const R = rider(g);
      // the opened cuff lying on the road in the foreground
      // a broken chain lying across the road: four whole links, then one link split open, its other half apart
      const cuff = el(g, 'g', { transform: 'translate(800 1030) rotate(-12)' });
      let ch = '';
      for (let i = 0; i < 4; i++) { const cx = -250 + i * 62; ch += i % 2 ? `M${cx - 34} 0L${cx + 34} 0` : BTL.E(cx, 0, 40, 22); }
      const open = 'M50-6C40-30 0-28-2 0C0 28 40 30 50 6', half = 'M88-16C110-34 150-28 152 0C150 22 120 30 100 20';
      for (const [d, w] of [[ch, 16], [open, 16], [half, 16]]) L0(cuff, d, C.ink, w, 1);
      for (const [d, w] of [[ch, 8], [open, 8], [half, 8]]) L0(cuff, d, C.paperDark, w, 1);
      P0(cuff, BTL.E(-60, 34, 260, 12), C.ink, 0.1);
      const gold = el(cuff, 'path', { d: open + half, fill: 'none', stroke: C.gold, 'stroke-width': 6, 'stroke-linecap': 'round', pathLength: 1 }); draw(gold, 0);
      const ds = motes(g, 71, 16, [100, 400, 980, HZ + 300], { alpha: 0.3 });
      return {
        update(lt, dur, cues) {
          const p = BTL.ease(lt, 0, Math.max(4, dur + 1)) * 0.6 + lt * 0.02;
          const x = lerp(560, 430, clamp01(p)), y = lerp(900, 800, clamp01(p)), s = lerp(1.15, 0.75, clamp01(p));
          R.g.setAttribute('transform', `translate(${f1(x)} ${f1(y + 2 * Math.abs(Math.sin(lt * 2.2)))}) scale(${s.toFixed(3)})`);
          R.update(lt);
          draw(gold, BTL.ease(lt, cue(cues, 'hit', dur * 0.6) - 0.2, 1.4));
          sun.set(0.4 + 0.03 * Math.sin(lt * 0.5));
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mlz_throne
  SH.bt_mlz_throne = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), FY = 1100, X = 540;
      ground(g, FY, { alpha: 0.6 });
      // the apse: a tall round arch with a gold rim and a faint mosaic band
      const apse = `M150 ${FY}L150 560A390 390 0 0 1 930 560L930 ${FY}Z`;
      P0(g, apse, C.paperDark, 0.45);
      L0(g, `M150 ${FY}L150 560A390 390 0 0 1 930 560L930 ${FY}`, C.ink, 3.5, 0.9);
      L0(g, 'M190 560A350 350 0 0 1 890 560', C.gold, 3, 0.8);
      let tess = ''; for (let a = 0; a <= 24; a++) { const u = Math.PI * (1 - a / 24), r1 = 350, r2 = 320; tess += `M${f1(X + Math.cos(u) * r1)} ${f1(560 - Math.sin(u) * r1)}L${f1(X + Math.cos(u) * r2)} ${f1(560 - Math.sin(u) * r2)}`; }
      L0(g, tess, C.gold, 2, 0.45);
      const beam = P0(g, 'M400 170L680 170L840 1100L240 1100Z', C.stain, 0.07);
      const pool = BTL.glow(svg, defs, X, 820, 520, C.stain, 0.3, g);
      // dais (two steps) and throne
      const st1 = `M260 ${FY}L260 1050L820 1050L820 ${FY}Z`, st2 = 'M320 1050L320 1004L760 1004L760 1050Z';
      P0(g, st1, C.paperLight, 1); P0(g, st2, C.paperLight, 1); L0(g, st1, C.ink, 3); L0(g, st2, C.ink, 3);
      const back = `M${X - 150} 1004L${X - 150} 600C${X - 150} 520 ${X + 150} 520 ${X + 150} 600L${X + 150} 1004Z`;
      const seat = `M${X - 190} 860L${X + 190} 860L${X + 190} 900L${X - 190} 900Z`;
      const legs = `M${X - 180} 900L${X - 180} 1004L${X - 150} 1004L${X - 150} 900ZM${X + 150} 900L${X + 150} 1004L${X + 180} 1004L${X + 180} 900Z`;
      const arms = `M${X - 190} 860L${X - 190} 780L${X - 150} 780M${X + 190} 860L${X + 190} 780L${X + 150} 780`;
      P0(g, back, C.paperLight, 1); P0(g, seat, C.paperLight, 1); P0(g, legs, C.paperLight, 1);
      L0(g, `M${X - 110} 980L${X - 110} 620C${X - 110} 570 ${X + 110} 570 ${X + 110} 620L${X + 110} 980`, C.gold, 2.5, 0.8);
      L0(g, back, C.ink, 3.5); L0(g, seat, C.ink, 3.5); L0(g, legs, C.ink, 3); L0(g, arms, C.ink, 4);
      P0(g, BTL.E(X - 190, 772, 12, 12) + BTL.E(X + 190, 772, 12, 12), C.gold, 1);
      P0(g, `M${X - 170} 860C${X - 170} 836 ${X + 170} 836 ${X + 170} 860Z`, C.paper, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
      // the other man who now sits there
      const fig = el(g, 'g', { opacity: 0 });
      const TF = figure(fig, 'throne', X - 40, 1004, 470, { face: 1, k: 1.45 });
      // a heavy robe (loros) from the shoulders over the lap
      const [sx0, sy0] = TF.pt('sh'), [kx0, ky0] = TF.pt('k1');
      P0(TF.g, `M${f1(sx0 - 40)} ${f1(sy0 + 10)}L${f1(sx0 + 40)} ${f1(sy0 + 10)}L${f1(kx0 + 26)} ${f1(ky0 - 6)}L${f1(kx0 + 20)} ${f1(ky0 + 40)}L${f1(sx0 - 50)} ${f1(ky0 + 40)}Z`, SIL(), 1, { stroke: C.ink, 'stroke-width': 3, 'stroke-opacity': 0.8 });
      L0(TF.g, `M${f1(sx0 + 6)} ${f1(sy0 + 14)}L${f1(sx0 + 14)} ${f1(ky0 + 30)}`, C.gold, 5, 0.9);
      const [hx0, hy0] = TF.pt('head');
      const cr = crown(TF.g, f1(hx0), f1(hy0 - 0.06 * 470), 0.5, 0, { fill: C.gold, line: C.ink });
      const ds = motes(g, 83, 22, [300, 240, 780, 1060], { alpha: 0.35 });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5);
          fade(fig, BTL.ease(lt, th - 0.3, 1.4));
          draw(cr.gold, BTL.ease(lt, th + 0.4, 1));
          pool.set(0.3 + 0.03 * Math.sin(lt * 0.7));
          beam.setAttribute('fill-opacity', (0.07 + 0.015 * Math.sin(lt * 0.5)).toFixed(3));
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mlz_candle
  SH.bt_mlz_candle = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'out', g = el(canvas(svg, W, H), 'g'), X = 540, TOP = 640;
      const pool = BTL.glow(svg, defs, X, 600, 640, C.stain, mode === 'smoke' ? 0.1 : 0.4, g);
      // a plain table edge low in the frame so the lower picture is not empty
      ground(g, 1110, { alpha: 0.55 });
      P0(g, BTL.E(X, 1104, 260, 22), C.ink, 0.12);
      // holder: dish + short stem
      const dish = `M${X - 210} 1060C${X - 200} 1100 ${X + 200} 1100 ${X + 210} 1060Z`;
      P0(g, dish, C.paperLight, 1); L0(g, dish, C.ink, 3.5);
      L0(g, `M${X - 210} 1060C${X - 150} 1046 ${X + 150} 1046 ${X + 210} 1060`, C.inkSoft, 2.5);
      const stem = `M${X - 70} 1056L${X - 60} 1000L${X + 60} 1000L${X + 70} 1056Z`;
      P0(g, stem, C.paperLight, 1); L0(g, stem, C.ink, 3);
      // the candle with a few wax drips
      const body = `M${X - 52} 1000L${X - 52} ${TOP + 8}C${X - 52} ${TOP - 4} ${X + 52} ${TOP - 4} ${X + 52} ${TOP + 8}L${X + 52} 1000Z`;
      P0(g, body, C.paperLight, 1);
      L0(g, `M${X - 52} ${TOP + 8}C${X - 52} ${TOP + 20} ${X - 30} ${TOP + 30} ${X - 30} ${TOP + 70}C${X - 30} ${TOP + 96} ${X - 52} ${TOP + 96} ${X - 52} ${TOP + 110}` +
        `M${X + 22} ${TOP + 14}C${X + 22} ${TOP + 40} ${X + 34} ${TOP + 44} ${X + 34} ${TOP + 70}`, C.inkSoft, 2.5, 0.7);
      L0(g, body, C.ink, 3.5);
      L0(g, `M${X} ${TOP + 4}L${X + 2} ${TOP - 26}`, C.ink, 4);   // wick
      const glow = BTL.glow(svg, defs, X, TOP - 90, 220, C.gold, 0.5, g);
      const fl = [[C.gold, 1, 0], [C.red, 0.0, 0], [C.paperLight, 0.5, 1.4]].filter(f => f[1] > 0).map(([col, k, ph]) => ({ e: P0(g, '', col, 0.95), k, ph }));
      const flRim = L0(g, '', C.ink, 2, 0.5);
      const smoke = [0, 1, 2].map(i => ({ e: L0(g, '', C.inkSoft, 2.5 - i * 0.5, 0), ph: i * 1.9 }));
      return {
        update(lt, dur, cues) {
          const th = mode === 'smoke' ? -10 : cue(cues, 'hit', dur * 0.55);
          const out = BTL.ease(lt, th - 0.5, 1.0);
          const h0 = (130 + 8 * Math.sin(lt * 1.7) + 4 * Math.sin(lt * 2.9)) * (1 - out);
          fl.forEach((f, i) => {
            const h = h0 * f.k, w = 30 * f.k * (1 - out * 0.6), lean = 5 * Math.sin(lt * 1.1 + f.ph), y = TOP - 24;
            f.e.setAttribute('d', h < 1 ? '' : `M${f1(X - w)} ${y}C${f1(X - w)} ${f1(y - h * 0.4)} ${f1(X - w * 0.2 + lean)} ${f1(y - h * 0.7)} ${f1(X + lean)} ${f1(y - h)}C${f1(X + w * 0.2 + lean)} ${f1(y - h * 0.7)} ${f1(X + w)} ${f1(y - h * 0.4)} ${f1(X + w)} ${y}C${f1(X + w)} ${f1(y + 18)} ${f1(X - w)} ${f1(y + 18)} ${f1(X - w)} ${y}Z`);
            if (i === 0) flRim.setAttribute('d', f.e.getAttribute('d'));
          });
          glow.set(0.5 * (1 - out) + 0.04 * Math.sin(lt * 1.5) * (1 - out));
          pool.set(mode === 'smoke' ? 0.1 + 0.02 * Math.sin(lt * 0.5) : 0.4 - 0.3 * out);
          // smoke: rises once the flame is gone (smoke mode: from the start)
          const on = mode === 'smoke' ? 1 : BTL.ease(lt, th + 0.6, 1.2);
          smoke.forEach((s, i) => {
            const t = lt * 0.35 + s.ph, y0 = TOP - 30, len = 520 + 60 * i;
            const a = 26 * Math.sin(t), b = 40 * Math.sin(t * 0.8 + 1), c = 60 * Math.sin(t * 0.6 + 2);
            s.e.setAttribute('d', `M${X + 2} ${y0}C${f1(X + a)} ${f1(y0 - len * 0.3)} ${f1(X - b)} ${f1(y0 - len * 0.6)} ${f1(X + c)} ${f1(y0 - len)}`);
            s.e.setAttribute('stroke-opacity', (on * (0.55 - i * 0.14)).toFixed(3));
          });
        },
      };
    },
  };
  // ------------------------------------------------------------------ bt_mlz_map
  // Anatolia, simplified: Konstantinopolis in the west, Malazgirt north of Lake Van in the east, a dotted march between
  // land is the whole frame; the seas are cut out of it (Black Sea with Azov, Aegean + eastern Mediterranean, Marmara)
  const BLACK = [[29.1, 41.2], [28.0, 42.0], [27.7, 42.7], [28.6, 43.7], [28.8, 44.5], [29.7, 45.2], [30.5, 46.4], [31.5, 46.6], [33, 46], [33.6, 44.5],
    [35.5, 45.2], [36.6, 45.4], [38, 47], [39.3, 47.1], [38.3, 46.1], [37.5, 45.4], [37.8, 44.6], [39.5, 43.6], [41.5, 42.4], [41.6, 41.5], [40, 41],
    [38, 40.9], [36.5, 41.3], [35, 42], [33, 42], [31.4, 41.3], [30, 41.1]];
  const MED = [[10, 25], [10, 40.6], [22.9, 40.4], [23.9, 40.7], [24.4, 40.9], [26, 40.8], [26.2, 40.3], [26.2, 40.1], [26.1, 39.5], [26.9, 39.4],
    [26.8, 38.6], [26.4, 38.3], [27.2, 37.9], [27.4, 37], [28.2, 36.7], [29.6, 36.2], [30.5, 36.5], [31, 36.8], [32.5, 36.1], [33.6, 36.2],
    [34.6, 36.8], [35.8, 36.8], [35.9, 36.6], [35.9, 35.5], [35.9, 34.5], [35.2, 33], [34.6, 31.5], [34.2, 31.3], [32.3, 31.2], [31.2, 31.5], [29.9, 31.2], [27.5, 31.2], [25, 31.7], [10, 31.7]];
  const MARMARA = [[26.4, 40.25], [26.7, 40.45], [27.5, 40.4], [29, 40.4], [29.4, 40.75], [28.9, 40.98], [27.5, 40.95], [26.8, 40.65]];
  const ISLES = [[[32.3, 35], [33.2, 35.4], [34.6, 35.7], [34, 34.98], [33, 34.6], [32.4, 34.7]],
    [[23.5, 35.6], [24.5, 35.4], [26.3, 35.3], [25.8, 35], [24.5, 35.2], [23.6, 35.2]]];
  const VAN = [[42.3, 38.75], [42.6, 38.95], [42.95, 38.95], [43.25, 38.75], [43.6, 38.6], [43.4, 38.35], [43.0, 38.35], [42.6, 38.45]];
  SH.bt_mlz_map = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g');
      const k = Math.cos(39 * Math.PI / 180), s = 56, X = lon => 540 + (lon - 35.3) * k * s, Y = lat => 610 - (lat - 39) * s;
      const poly = pts => 'M' + pts.map(q => f1(X(q[0])) + ' ' + f1(Y(q[1]))).join('L') + 'Z';
      let grat = '';
      for (let lon = 20; lon <= 50; lon += 5) grat += `M${f1(X(lon))} 120L${f1(X(lon))} 1060`;
      for (let lat = 34; lat <= 44; lat += 2) grat += `M-100 ${f1(Y(lat))}L1180 ${f1(Y(lat))}`;
      // land = one even-odd shape: a big field with the seas cut out (islands and Lake Van flip back), so the seas
      // show the theme's own background, the same tone as every other scene
      const seas = poly(BLACK) + poly(MED) + poly(MARMARA), isles = ISLES.map(poly).join('');
      const field = `M${f1(X(0))} ${f1(Y(60))}L${f1(X(70))} ${f1(Y(60))}L${f1(X(70))} ${f1(Y(10))}L${f1(X(0))} ${f1(Y(10))}Z`;
      P0(g, field + seas + isles + poly(VAN), mix(C.paper, C.paperDark, 0.75), 1, { 'fill-rule': 'evenodd' });
      L0(g, grat, C.inkSoft, 1.5, 0.12);
      const coast = L0(g, seas + isles, C.inkSoft, 2.5, 0);
      L0(g, poly(VAN), C.inkSoft, 2, 0.8);
      const A = [X(28.98), Y(41.01)], B = [X(42.53), Y(39.14)];
      const route = el(g, 'path', { d: `M${f1(A[0])} ${f1(A[1])}C${f1(A[0] + 200)} ${f1(A[1] + 60)} ${f1(B[0] - 260)} ${f1(B[1] - 30)} ${f1(B[0])} ${f1(B[1])}`,
        fill: 'none', stroke: C.gold, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-dasharray': '2 14', opacity: 0 });
      const aDot = P0(g, BTL.E(A[0], A[1], 9, 9), C.ink, 0);
      const aLab = svgText(g, 'Konstantinopolis', 70, A[1] + 120, 58, { fill: C.ink, 'font-family': BTL.LO, 'font-style': 'italic', 'font-weight': 500, 'text-anchor': 'start', opacity: 0 });
      const ring = el(g, 'circle', { cx: B[0], cy: B[1], r: 18, fill: 'none', stroke: C.gold, 'stroke-width': 3, opacity: 0 });
      const bDot = P0(g, BTL.E(B[0], B[1], 11, 11), C.gold, 0);
      const bLab = svgText(g, 'Malazgirt', 990, B[1] - 150, 76, { fill: C.ink, 'font-family': BTL.FR, 'font-weight': 400, 'text-anchor': 'end', opacity: 0 });
      const bSub = svgText(g, '1071', 990, B[1] - 76, 60, { fill: C.gold, 'font-family': BTL.FR, 'font-weight': 400, 'text-anchor': 'end', opacity: 0 });
      for (const t of [aLab, bLab, bSub]) { t.setAttribute('stroke', C.paper); t.setAttribute('stroke-width', 10); t.setAttribute('paint-order', 'stroke'); t.setAttribute('stroke-linejoin', 'round'); }
      return {
        update(lt, dur, cues) {
          coast.setAttribute('stroke-opacity', (0.9 * BTL.ease(lt, 0, 0.8)).toFixed(3));
          fade(aDot, BTL.ease(lt, 0, 0.6)); fade(aLab, BTL.ease(lt, 0.1, 0.8));
          // the march: dashes appear from west to east
          fade(route, BTL.ease(lt, 0.1, 0.8));
          route.setAttribute('stroke-dashoffset', f1(-lt * 18));   // the dashes march slowly east
          const tb = Math.min(cue(cues, 'hit', 0.5), 0.6);
          fade(bDot, BTL.ease(lt, tb, 0.5)); fade(bLab, BTL.ease(lt, tb, 0.7)); fade(bSub, BTL.ease(lt, tb, 0.7));
          const ph = ((lt - tb) % 2.2 + 2.2) % 2.2 / 2.2;
          ring.setAttribute('r', f1(16 + 40 * ph)); ring.setAttribute('opacity', lt < tb ? 0 : ((1 - ph) * 0.9).toFixed(3));
        },
      };
    },
  };
  // ------------------------------------------------------------------ bt_mlz_oath
  SH.bt_mlz_oath = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), X = 540;
      const pool = BTL.glow(svg, defs, X, 640, 600, C.stain, 0.24, g);
      const doc = el(g, 'g', { transform: `rotate(-3 ${X} 640)` });
      const sheet = `M${X - 260} 270L${X + 260} 270L${X + 260} 960L${X - 260} 960Z`;
      P0(doc, `M${X - 248} 290L${X + 276} 286L${X + 276} 980L${X - 248} 984Z`, C.ink, 0.1);   // its shadow
      P0(doc, sheet, C.paperLight, 1); L0(doc, sheet, C.ink, 3.5);
      L0(doc, `M${X - 230} 300L${X + 230} 300L${X + 230} 930L${X - 230} 930Z`, C.gold, 2, 0.6);
      L0(doc, `M${X} 330L${X} 380M${X - 22} 348L${X + 22} 348`, C.ink, 3);   // a small cross at the head
      const lines = [];
      for (let i = 0; i < 11; i++) {
        const y = 430 + i * 44, w = i === 10 ? 220 : 380 - (i % 3) * 30;
        let d = `M${X - 200} ${y}`;
        for (let x = 0; x < w; x += 20) d += `q5 ${(i + x) % 2 ? -7 : 6} 10 0t10 0`;
        lines.push(LD(doc, d, C.inkSoft, 2.5, 0.9));
      }
      // the cord and the hanging gold seal (it swings very slowly)
      const sg = el(doc, 'g', { opacity: 0 }), sw = el(sg, 'g');
      L0(sw, `M${X - 16} 960L${X - 4} 1040M${X + 16} 960L${X + 4} 1040`, C.red, 4, 0.9);
      P0(sw, BTL.E(X, 1080, 46, 46), C.gold, 1); L0(sw, BTL.E(X, 1080, 46, 46), C.ink, 3);
      L0(sw, BTL.E(X, 1080, 32, 32), C.paperLight, 2, 0.7);
      L0(sw, `M${X} 1062L${X} 1098M${X - 12} 1074L${X + 12} 1074`, C.ink, 3, 0.8);
      const sl = BTL.glow(svg, defs, X, 1080, 160, C.gold, 0, sg);
      const ds = motes(g, 97, 16, [260, 240, 820, 1080], { alpha: 0.3 });
      return {
        update(lt, dur, cues) {
          lines.forEach((e, i) => draw(e, BTL.ease(lt, 0.1 + i * 0.16, 0.7)));
          const th = cue(cues, 'hit', dur * 0.5), q = BTL.ease(lt, th - 0.3, 1);
          fade(sg, q); sl.set(0.35 * q);
          sw.setAttribute('transform', `rotate(${f1(3 * Math.sin(lt * 1.2))} ${X} 960)`);
          pool.set(0.24 + 0.03 * Math.sin(lt * 0.7));
          ds.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_mlz_isle
  // dusk over a calm sea: a small low island (Prote) with a tiny chapel on its hill, the sun low beside it
  SH.bt_mlz_isle = {
    kind: '2d',
    build({ W, H, svg, defs }) {
      const g = el(canvas(svg, W, H), 'g'), HZ = 860;
      const sky = BTL.glow(svg, defs, 780, HZ - 40, 760, C.stain, 0.42, g);
      const sun = P0(g, '', C.paperLight, 0.95, { stroke: C.gold, 'stroke-width': 3 });
      P0(g, `M-300 ${HZ}L1380 ${HZ}L1380 2100L-300 2100Z`, C.paperDark, 0.7);
      L0(g, `M-300 ${HZ}L1380 ${HZ}`, C.inkSoft, 2, 0.6);
      // the island and its reflection
      const isle = `M120 ${HZ}C200 ${HZ - 40} 280 ${HZ - 90} 380 ${HZ - 120}C450 ${HZ - 140} 520 ${HZ - 138} 580 ${HZ - 110}C660 ${HZ - 80} 720 ${HZ - 40} 820 ${HZ}Z`;
      P0(g, isle, SIL(), 1); L0(g, isle.replace(/Z$/, ''), C.ink, 3, 0.9);
      const ch = `M436 ${HZ - 132}L436 ${HZ - 176}L496 ${HZ - 176}L496 ${HZ - 134}Z`;
      P0(g, ch, SIL(), 1); L0(g, ch, C.ink, 2.5);
      P0(g, `M444 ${HZ - 176}C446 ${HZ - 206} 486 ${HZ - 206} 488 ${HZ - 176}Z`, SIL(), 1, { stroke: C.ink, 'stroke-width': 2.5 });
      L0(g, `M466 ${HZ - 200}L466 ${HZ - 222}M458 ${HZ - 214}L474 ${HZ - 214}`, C.ink, 2.5);
      P0(g, `M120 ${HZ}C220 ${HZ + 26} 700 ${HZ + 26} 820 ${HZ}Z`, SIL(), 0.35);
      // slow water strokes and the sun's broken reflection
      const r = rng(61), rows = [];
      for (let i = 0; i < 14; i++) {
        const y = HZ + 30 + Math.pow(i / 14, 1.4) * 260, segs = [];
        for (let j = 0; j < 8; j++) segs.push({ x: r() * 1500 - 200, w: 30 + r() * 80 * (1 + i * 0.1), ph: r() * TAU });
        rows.push({ y, segs, sp: 5 + i * 1.2, e: L0(g, '', C.inkSoft, 1.6 + i * 0.1, 0.3) });
      }
      const glint = L0(g, '', C.gold, 6, 0.9);
      return {
        update(lt, dur) {
          const sy = HZ - 80 + 56 * BTL.ease(lt, 0, Math.max(3, dur + 1));
          sun.setAttribute('d', BTL.E(780, sy, 48, 48));
          for (const q of rows) { let d = ''; for (const sg of q.segs) { const x = ((sg.x + lt * q.sp) % 1500 + 1500) % 1500 - 200, y = q.y + 2 * Math.sin(lt * 0.7 + sg.ph);
            d += `M${f1(x)} ${f1(y)}c${f1(sg.w * 0.3)} -4 ${f1(sg.w * 0.7)} -4 ${f1(sg.w)} 0`; } q.e.setAttribute('d', d); }
          let d = '';
          for (let i = 0; i < 12; i++) { const y = HZ + 22 + i * 26, w = Math.max(10, 110 - i * 7 + 30 * Math.sin(lt * 1.6 + i * 1.3)); d += `M${f1(780 - w / 2 + 16 * Math.sin(lt * 1.1 + i * 2))} ${y}l${f1(w)} 0`; }
          glint.setAttribute('d', d);
          sky.set(0.42 + 0.03 * Math.sin(lt * 0.5));
        },
      };
    },
  };
})();
