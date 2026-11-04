// bt_zigetvar: Szigetvár 1566, the sultan's death kept secret, belgesel style (docs/BELGESEL.md). Clean still line
// art, slow natural motion only (a lamp flame, smoke, water, stars, wheels turning, a column walking). Every type is
// composed on a 1080x1920 vertical canvas (the Short); a wide frame shows the same canvas as a centred column.
//   bt_zg_kavuk  P: {mode: "hook"|"end"}  cues: hit   inside the imperial tent: the sultan's great round turban (kavuk,
//                jewel + plume) resting on a low divan in a pool of lamplight, a hanging oil lamp above, arched tent
//                panels behind. hook: on "hit" a thin gold line draws round the turban's band. end: the light pool slowly
//                narrows and the flame sinks low (it never goes fully out)
//   bt_zg_otag   P: {mode: "night"|"dawn"}  cues: hit   a hill under stars, the sultan's pavilion (otağ): a wide tent with
//                a peaked roof, scalloped valance and a gold finial, the door lit from inside. night: on "hit" the light
//                inside slowly sinks to an ember. dawn: a pale band on the horizon, the door dark, smoke from one fire
//   bt_zg_door   P: {}  cues: hit   the tent's entrance close up: two heavy patterned curtains with a lit gap between;
//                a faceless standing figure in a long kaftan and tall turban beside it; on "hit" the curtains slowly
//                close and the gap of light goes out
//   bt_zg_camp   P: {}  cues: hit   the army camp at night: rows of small conical tents over the hills, many small
//                fires; from "hit" the fires go out one by one from the edges inwards
//   bt_zg_fort   P: {mode: "siege"|"fallen", text, sub}  cues: hit   the fortress on its island in the marsh: low walls
//                with bastions, an inner keep, still water with slow ripples, reeds in front. siege: thin smoke columns,
//                the year in big thin type above (text/sub). fallen: a breach in the wall, a heavy slow smoke plume; on
//                "hit" a horse-tail standard (tuğ) rises on the broken bastion
//   bt_zg_ferman P: {}  cues: hit   a long imperial decree on a dark table in lamplight: lines of script, a reed pen;
//                on "hit" the gold monogram (tuğra) draws itself at the head of the page
//   bt_zg_march  P: {}  cues: hit   night plain under a moon: a long column of small silhouettes walks slowly to the
//                right along a road; in the middle a closed, curtained carriage with turning wheels and a small lantern;
//                on "hit" the lantern's light grows a little
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO, TAU = Math.PI * 2;
  const f1 = v => v.toFixed(1);
  let CLIP = 0;
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1) => el(parent, 'path', { d, fill, 'fill-opacity': a, stroke: 'none' });
  const L0 = (parent, d, stroke, w = 3, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra));
  const LD = (parent, d, stroke, w = 3, a = 1) => { const e = L0(parent, d, stroke, w, a, { pathLength: 1 }); draw(e, 0); return e; };
  const txt = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 300, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }

  // a small flame path (origin = base centre), swaying slowly with lt
  function flameD(x, y, h, lt, ph = 0) {
    const s = Math.sin(lt * 1.7 + ph) * 0.12 + Math.sin(lt * 2.9 + ph * 2) * 0.05, w = h * 0.36;
    const tx = x + s * h, ty = y - h;
    return `M${f1(x - w)} ${f1(y)}C${f1(x - w * 1.1)} ${f1(y - h * 0.45)} ${f1(tx - w * 0.2)} ${f1(y - h * 0.7)} ${f1(tx)} ${f1(ty)}` +
      `C${f1(tx + w * 0.25)} ${f1(y - h * 0.7)} ${f1(x + w * 1.1)} ${f1(y - h * 0.45)} ${f1(x + w)} ${f1(y)}C${f1(x + w * 0.6)} ${f1(y + w * 0.6)} ${f1(x - w * 0.6)} ${f1(y + w * 0.6)} ${f1(x - w)} ${f1(y)}Z`;
  }

  // slowly rising smoke: a few soft puffs drifting up a column
  function smoke(g, x, y, n, seed, o = {}) {
    const r = rng(seed), list = [], hgt = o.h || 420, sz = o.size || 40;
    for (let i = 0; i < n; i++) list.push({ e: P0(g, '', o.color || C.inkSoft, 0), ph: i / n, dx: (r() * 2 - 1) * 18, k: 0.7 + r() * 0.6 });
    return {
      update(lt, on = 1) {
        for (const q of list) {
          const u = ((q.ph + lt * (o.speed || 0.06)) % 1 + 1) % 1;
          const cx = x + q.dx + u * (o.drift || 60) + 10 * Math.sin(lt * 0.5 + q.ph * 6), cy = y - u * hgt, rr = sz * q.k * (0.5 + u * 1.4);
          q.e.setAttribute('d', BTL.E(cx, cy, rr, rr * 0.8));
          q.e.setAttribute('fill-opacity', ((o.alpha || 0.08) * on * Math.sin(Math.PI * u)).toFixed(3));
        }
      },
    };
  }

  // a faceless standing figure in a long kaftan and a tall turban (feet at 0, up = -y)
  function vizier(parent, x, y, h, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y})${o.face === -1 ? ' scale(-1 1)' : ''}` });
    const col = C.paperDark, rim = C.inkSoft, u = v => f1(v * h);
    const robe = `M${u(-0.13)} ${u(-0.76)}C${u(-0.2)} ${u(-0.5)} ${u(-0.24)} ${u(-0.2)} ${u(-0.26)} 0L${u(0.26)} 0C${u(0.24)} ${u(-0.2)} ${u(0.2)} ${u(-0.5)} ${u(0.13)} ${u(-0.76)}C${u(0.06)} ${u(-0.8)} ${u(-0.06)} ${u(-0.8)} ${u(-0.13)} ${u(-0.76)}Z`;
    const head = BTL.E(0, -0.83 * h, 0.065 * h, 0.07 * h);
    // the tall cylindrical turban (kallavi) narrowing at the top
    const tur = `M${u(-0.085)} ${u(-0.86)}C${u(-0.1)} ${u(-0.95)} ${u(-0.09)} ${u(-1.04)} ${u(-0.06)} ${u(-1.08)}C${u(-0.03)} ${u(-1.11)} ${u(0.03)} ${u(-1.11)} ${u(0.06)} ${u(-1.08)}C${u(0.09)} ${u(-1.04)} ${u(0.1)} ${u(-0.95)} ${u(0.085)} ${u(-0.86)}Z`;
    for (const d of [robe, head, tur]) { P0(g, d, col, 1); L0(g, d, rim, 3, 0.85); }
    L0(g, `M${u(-0.08)} ${u(-0.93)}C${u(-0.02)} ${u(-0.9)} ${u(0.04)} ${u(-0.98)} ${u(0.08)} ${u(-0.95)}M${u(-0.08)} ${u(-1.0)}C${u(-0.02)} ${u(-0.97)} ${u(0.04)} ${u(-1.05)} ${u(0.07)} ${u(-1.02)}`, rim, 2, 0.6);
    L0(g, `M0 ${u(-0.74)}L0 ${u(-0.02)}`, rim, 2, 0.5);     // the kaftan's front edge
    return g;
  }

  // ------------------------------------------------------------------ the turban on the divan
  // the sultan's great round turban: a wide bulb wound in diagonal folds, a band at the base, jewel and plume in front
  const KAVUK = { x: 540, y: 880 };   // base centre
  function kavuk(g, x, y, k = 1) {
    const kg = el(g, 'g', { transform: `translate(${x} ${y}) scale(${k})` });
    const cloth = mix(C.paper, C.ink, 0.84), shade = mix(C.paper, C.ink, 0.5), foldC = mix(C.paper, C.ink, 0.42);
    // a wide, rounded bulb of wound white cloth, broadest a little above the band
    const bulb = 'M-170-40C-250-100-262-250-190-330C-130-396 130-396 190-330C262-250 250-100 170-40C100-16-100-16-170-40Z';
    const band = 'M-160-44C-168-16-162 0-150 6C-60 20 60 20 150 6C162 0 168-16 160-44C80-26-80-26-160-44Z';
    P0(kg, bulb, cloth, 1);
    const cid = 'zgkav' + (++CLIP), cp = el(kg, 'clipPath', { id: cid }); el(cp, 'path', { d: bulb });
    const fg = el(kg, 'g', { 'clip-path': `url(#${cid})` });
    // the winding: bands of cloth rising from both sides and crossing at the front centre (a chevron of folds)
    let d = '';
    for (let i = 0; i < 10; i++) {
      const y = -10 - i * 44;
      d += `M-300 ${y + 40}C-200 ${y + 10}-90 ${y - 40} 0 ${y - 90}M300 ${y + 40}C200 ${y + 10} 90 ${y - 40} 0 ${y - 90}`;
    }
    L0(fg, d, foldC, 3.4, 0.9);
    L0(fg, 'M0-30L0-400', foldC, 2.6, 0.7);
    P0(fg, 'M-170-40C-100-16 100-16 170-40L240 40L-240 40Z', shade, 0.6);
    P0(fg, BTL.E(-100, -250, 60, 70), C.ink, 0.12);
    L0(kg, bulb, C.ink, 4, 1);
    P0(kg, band, shade, 1); L0(kg, band, C.ink, 3.5, 1);
    // jewel and the upright plume (sorguç) at the front of the crown
    const jewel = 'M0-300L24-272L0-244L-24-272Z';
    L0(kg, 'M0-300C-2-330 2-350 8-370', C.gold, 3.5, 1);
    const plume = 'M8-366C-24-404-30-456-4-510C22-460 36-410 8-366Z';
    P0(kg, plume, C.ink, 0.9); L0(kg, plume, C.ink, 2.5, 1);
    L0(kg, 'M6-374C2-410 2-450-2-496', C.inkSoft, 1.6, 0.9);
    P0(kg, jewel, C.gold, 1); L0(kg, jewel, C.ink, 2.5, 0.9);
    return { g: kg, band: 'M-160-44C-80-26 80-26 160-44' };
  }

  // dust floating slowly in the light
  function dustIn(g, seed, n, box) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: el(g, 'circle', { cx: 0, cy: 0, r: (1.5 + r() * 2.2).toFixed(1), fill: C.ink, 'fill-opacity': 0 }),
      x: box[0] + r() * (box[2] - box[0]), y0: r(), sp: 28 + r() * 30, ph: r() * TAU, a: 0.35 + r() * 0.4 });
    const hgt = box[3] - box[1];
    return { update(lt, on = 1) { for (const q of list) {
      const yy = ((q.y0 * hgt - q.sp * lt) % hgt + hgt) % hgt, x = q.x + 14 * Math.sin(lt * 0.35 + q.ph);
      q.e.setAttribute('cx', f1(x)); q.e.setAttribute('cy', f1(box[1] + yy));
      q.e.setAttribute('fill-opacity', (q.a * on * Math.sin(Math.PI * yy / hgt)).toFixed(3));
    } } };
  }

  function tentInterior(g, svg, defs) {
    P0(g, 'M-200-100L1280-100L1280 1000L-200 1000Z', C.paper, 1);
    P0(g, 'M-200-100L1280-100L1280 170L-200 170Z', C.paperDark, 1);                      // roof shadow
    // arched panels (the otağ's lining): pointed arches in a row
    let arch = '', fold = '';
    for (let i = 0; i < 6; i++) {
      const x0 = -40 + i * 200, x1 = x0 + 180, xm = (x0 + x1) / 2;
      arch += `M${x0} 980L${x0} 420C${x0} 330 ${xm - 30} 290 ${xm} 250C${xm + 30} 290 ${x1} 330 ${x1} 420L${x1} 980`;
    }
    for (let x = -180; x <= 1260; x += 46) fold += `M${x} 180L${x + 6} 990`;
    L0(g, fold, C.inkSoft, 1.4, 0.12);
    L0(g, arch, C.inkSoft, 2, 0.32);
    L0(g, 'M-200 200L1280 200M-200 214L1280 214', C.inkSoft, 1.6, 0.35);                  // valance band
    // floor: a carpet in perspective, running to the bottom of the frame
    P0(g, 'M-200 1000L1280 1000L1280 1920L-200 1920Z', C.paperDark, 1);
    let cp = '';
    for (const y of [1060, 1150, 1290, 1480, 1740]) cp += `M-200 ${y}L1280 ${y}`;
    for (let i = -5; i <= 5; i++) cp += `M${540 + i * 120} 1000L${540 + i * 420} 1920`;
    L0(g, cp, C.inkSoft, 1.4, 0.14);
    L0(g, 'M120 1040L960 1040L1180 1920M120 1040L-100 1920', C.inkSoft, 2, 0.3);
  }

  function divan(g) {
    const top = 'M150 900C150 880 930 880 930 900L930 940C930 958 150 958 150 940Z';
    const body = 'M170 940L910 940L920 1040L160 1040Z';
    P0(g, body, C.paper, 1); L0(g, body, C.inkSoft, 2.5, 0.9);
    P0(g, top, C.paperLight, 1); L0(g, top, C.ink, 3, 0.9);
    let fr = ''; for (let x = 180; x <= 900; x += 24) fr += `M${x} 1040l0 22`;
    L0(g, fr, C.inkSoft, 2, 0.5);                                                         // fringe
    L0(g, 'M190 990L890 990', C.gold, 2, 0.5);
  }

  // the hanging oil lamp: three chains, a glass bowl, flame inside
  function lamp(g, x, y) {
    L0(g, `M${x} -20L${x} ${y - 120}M${x} ${y - 120}L${x - 60} ${y - 20}M${x} ${y - 120}L${x + 60} ${y - 20}M${x} ${y - 120}L${x} ${y - 20}`, C.inkSoft, 2, 0.8);
    const bowl = `M${x - 70} ${y - 20}C${x - 70} ${y + 40} ${x - 30} ${y + 70} ${x} ${y + 72}C${x + 30} ${y + 70} ${x + 70} ${y + 40} ${x + 70} ${y - 20}Z`;
    P0(g, bowl, C.paperLight, 0.5); L0(g, bowl, C.ink, 3, 0.9);
    L0(g, `M${x - 74} ${y - 20}L${x + 74} ${y - 20}`, C.ink, 3, 0.9);
    L0(g, `M${x} ${y + 72}L${x} ${y + 100}`, C.inkSoft, 2.5, 0.8);
    P0(g, BTL.E(x, y + 104, 6, 6), C.gold, 1);
    const halo = P0(g, BTL.E(x, y + 10, 46, 46), C.gold, 0.18);
    const fl = P0(g, '', C.gold, 0.95), core = P0(g, '', C.ink, 0.85);
    return {
      update(lt, k = 1) {
        fl.setAttribute('d', flameD(x, y + 20, 72 * k, lt * 1.6));
        core.setAttribute('d', flameD(x, y + 18, 34 * k, lt * 1.6, 0.6));
        halo.setAttribute('fill-opacity', (0.18 * k * (0.9 + 0.1 * Math.sin(lt * 2.1))).toFixed(3));
      },
    };
  }

  SH.bt_zg_kavuk = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', g0 = canvas(svg, W, H), g = el(g0, 'g');
      tentInterior(g, svg, defs);
      const pool = BTL.glow(svg, defs, 560, 800, 600, C.stain, 0.34, g);
      const floorPool = P0(g, BTL.E(540, 1060, 470, 70), C.stain, 0.12);
      divan(g);
      const LX = 820, LY = 380;
      const lp = lamp(g, LX, LY);
      const kv = kavuk(g, KAVUK.x, KAVUK.y);
      const ring = LD(kv.g, kv.band, C.gold, 6, 0.95);
      const dust = dustIn(g, 41, 44, [180, 260, 920, 1000]);
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.5);
          const dim = mode === 'end' ? BTL.ease(lt, 0.5, Math.max(2, dur - 0.5)) : 0;
          const zk = 1 + 0.05 * BTL.ease(lt, 0, Math.max(3, dur));
          g.setAttribute('transform', `translate(540 860) scale(${zk.toFixed(4)}) translate(-540 -860)`);
          lp.update(lt, 1 - 0.55 * dim);
          dust.update(lt, 1 - 0.6 * dim);
          pool.set((0.34 + 0.07 * Math.sin(lt * 1.8)) * (1 - 0.55 * dim));
          floorPool.setAttribute('fill-opacity', (0.12 * (1 - 0.5 * dim)).toFixed(3));
          draw(ring, 1);
          ring.setAttribute('stroke-opacity', (mode === 'hook' ? 0.3 + 0.65 * BTL.ease(lt, hit - 0.1, 0.8) : 0.95).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the pavilion on the hill
  function hill(g, y0, seed, fill, a) {
    const r = rng(seed);
    let d = `M-200 ${y0}`;
    for (let x = -200; x <= 1280; x += 80) d += `L${x} ${f1(y0 - 40 * Math.sin((x + 200) / 1480 * Math.PI) - r() * 14)}`;
    d += 'L1280 1920L-200 1920Z';
    P0(g, d, fill, a); L0(g, d.split('L1280 1920')[0], C.inkSoft, 2, 0.6);
  }
  // the otağ: origin = ground centre, width ~ 2*w
  function pavilion(g, x, y, w, defs, svg) {
    const tg = el(g, 'g', { transform: `translate(${x} ${y})` });
    const hgt = w * 0.62, eave = -hgt, peak = -hgt - w * 0.5;
    const wall = `M${-w} 0L${-w} ${eave}L${w} ${eave}L${w} 0Z`;
    const roof = `M${-w - 30} ${eave}C${-w * 0.6} ${eave - w * 0.18} ${-w * 0.2} ${peak + 40} 0 ${peak}C${w * 0.2} ${peak + 40} ${w * 0.6} ${eave - w * 0.18} ${w + 30} ${eave}Z`;
    P0(tg, wall, C.paperLight, 1); P0(tg, roof, C.paperLight, 1);
    // vertical seams and a band of arches on the wall
    let s = '';
    for (let i = -4; i <= 4; i++) s += `M${f1(i * w / 4.5)} ${eave + 40}L${f1(i * w / 4.5)} 0`;
    L0(tg, s, C.inkSoft, 1.6, 0.4);
    let roofs = '';
    for (let i = -3; i <= 3; i++) roofs += `M0 ${peak}C${f1(i * w * 0.12)} ${f1(peak + 60)} ${f1(i * w * 0.3)} ${f1(eave - 40)} ${f1(i * w * 0.36)} ${eave}`;
    L0(tg, roofs, C.inkSoft, 1.6, 0.4);
    // scalloped valance
    let v = `M${-w - 30} ${eave}`;
    const n = 14;
    for (let i = 0; i < n; i++) { const a = -w - 30 + (2 * w + 60) * i / n, b = -w - 30 + (2 * w + 60) * (i + 1) / n; v += `Q${f1((a + b) / 2)} ${eave + 46} ${f1(b)} ${eave}`; }
    P0(tg, v + 'Z', C.paper, 1); L0(tg, v, C.ink, 2.5, 0.9);
    L0(tg, wall, C.ink, 3.5, 1); L0(tg, roof, C.ink, 3.5, 1);
    // finial with a gold ball (alem)
    L0(tg, `M0 ${peak}L0 ${peak - 70}`, C.ink, 3, 1);
    P0(tg, BTL.E(0, peak - 80, 13, 13), C.gold, 1);
    // the door
    const door = `M${-w * 0.16} 0L${-w * 0.16} ${f1(eave * 0.62)}C${-w * 0.16} ${f1(eave * 0.8)} ${w * 0.16} ${f1(eave * 0.8)} ${w * 0.16} ${f1(eave * 0.62)}L${w * 0.16} 0Z`;
    const doorLit = P0(tg, door, C.gold, 0.9);
    const doorDark = P0(tg, door, C.paperDark, 0);
    L0(tg, door, C.ink, 3, 1);
    return { tg, doorLit, doorDark, eave, peak };
  }

  SH.bt_zg_otag = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'night', g = canvas(svg, W, H);
      if (mode === 'dawn') {
        // dawn: the pavilion large in the middle, dark against a paling sky, the sun rising behind it
        const st = BTL.stars(g, 90, 1567, [0, 0, 1080, 560]);
        const sky = BTL.glow(svg, defs, 540, 1000, 900, C.stain, 0.2, g);
        const sky2 = BTL.glow(svg, defs, 540, 900, 380, C.gold, 0.2, g);
        const sun = P0(g, '', C.gold, 0.9);
        const HY = 1060;
        let hz = `M-200 ${HY}`; for (let x = -200; x <= 1280; x += 60) hz += `L${x} ${f1(HY - 14 * Math.sin(x / 210) - 6 * Math.sin(x / 70))}`;
        P0(g, hz + 'L1280 1920L-200 1920Z', C.paperDark, 1); L0(g, hz, C.inkSoft, 2, 0.7);
        const rim = L0(g, `M-200 ${HY - 4}L1280 ${HY - 4}`, C.gold, 2, 0.4);
        const pv = pavilion(g, 540, HY + 6, 230, defs, svg);
        pv.doorLit.setAttribute('fill-opacity', '0'); pv.doorDark.setAttribute('fill-opacity', '0.95');
        const sm = smoke(g, 880, HY + 20, 14, 3, { h: 520, size: 34, alpha: 0.07, drift: -60 });
        const ember = P0(g, BTL.E(880, HY + 22, 10, 5), C.gold, 0.6);
        const rg = rng(29); let gr = '';
        for (let i = 0; i < 80; i++) { const x = -40 + rg() * 1160, b = 1920 - rg() * 520, h = 40 + rg() * 120, l = (rg() * 2 - 1) * 24; gr += `M${f1(x)} ${f1(b)}q${f1(l * 0.3)} ${f1(-h * 0.6)} ${f1(l)} ${f1(-h)}`; }
        L0(g, gr, C.inkSoft, 2.2, 0.38);
        return {
          update(lt, dur) {
            const p = BTL.ease(lt, 0, Math.max(2.5, dur));
            st.update(lt); fade(st.g, 1 - 0.7 * p);
            sky.set(0.22 + 0.16 * p); sky2.set(0.2 + 0.22 * p);
            sun.setAttribute('d', BTL.E(540, HY + 20 - 160 * p, 150, 150));   // rises behind the tent; the ground hides its lower part
            sun.setAttribute('fill-opacity', (0.35 + 0.45 * p).toFixed(3));
            rim.setAttribute('stroke-opacity', (0.3 + 0.4 * p).toFixed(3));
            sm.update(lt);
            ember.setAttribute('fill-opacity', (0.5 + 0.15 * Math.sin(lt * 2)).toFixed(3));
          },
        };
      }
      const st = BTL.stars(g, 120, 1566, [0, 0, 1080, 760]);
      hill(g, 1000, 7, C.paper, 1);
      const inner = BTL.glow(svg, defs, 540, 900, 420, C.stain, 0.32, g);
      const pv = pavilion(g, 540, 1000, 330, defs, svg);
      const spill = P0(g, 'M486 1000L594 1000L700 1300L380 1300Z', C.gold, 0.12);
      hill(g, 1160, 11, C.paperDark, 1);
      { const rg = rng(23); let gr = ''; for (let i = 0; i < 70; i++) { const x = -40 + rg() * 1160, b = 1920 - rg() * 560, h = 40 + rg() * 110, l = (rg() * 2 - 1) * 24; gr += `M${f1(x)} ${f1(b)}q${f1(l * 0.3)} ${f1(-h * 0.6)} ${f1(l)} ${f1(-h)}`; } L0(g, gr, C.inkSoft, 2.2, 0.4); }
      return {
        update(lt, dur, cues) {
          st.update(lt);
          const hit = cue(cues, 'hit', dur * 0.6);
          const out = BTL.ease(lt, hit - 0.1, 1.8);
          const k = 1 - 0.85 * out;
          pv.doorLit.setAttribute('fill-opacity', (0.9 * k * (0.94 + 0.06 * Math.sin(lt * 2.2))).toFixed(3));
          pv.doorDark.setAttribute('fill-opacity', (0.8 * out).toFixed(3));
          inner.set((0.32 + 0.02 * Math.sin(lt * 1.1)) * k);
          spill.setAttribute('fill-opacity', (0.12 * k).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the door and the vizier
  SH.bt_zg_door = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H);
      // tent wall close up
      P0(g, 'M-200-100L1280-100L1280 1080L-200 1080Z', C.paper, 1);
      let seam = ''; for (let x = -160; x <= 1260; x += 140) seam += `M${x} 120L${x} 1080`;
      L0(g, seam, C.inkSoft, 1.6, 0.25);
      P0(g, 'M-200-100L1280-100L1280 160L-200 160Z', C.paperLight, 1);
      let v = 'M-200 160';
      for (let x = -200; x < 1280; x += 90) v += `Q${x + 45} 210 ${x + 90} 160`;
      P0(g, v + 'L1280 -100L-200 -100Z', C.paperLight, 1); L0(g, v, C.ink, 2.5, 0.9);
      L0(g, 'M-200 110L1280 110', C.inkSoft, 2, 0.5);
      // the doorway: a lit gap between two curtains
      const DX = 600, DT = 300, DB = 1080, DW = 300;
      const gapLight = BTL.glow(svg, defs, DX, 700, 380, C.stain, 0.34, g);
      const gap = P0(g, `M${DX - DW / 2} ${DT}L${DX + DW / 2} ${DT}L${DX + DW / 2} ${DB}L${DX - DW / 2} ${DB}Z`, C.gold, 0.6);
      const cL = el(g, 'g'), cR = el(g, 'g');
      const curtain = (cg, side) => {
        const x0 = DX - side * (DW / 2 + 140);
        const d = `M${x0} ${DT - 20}L${DX} ${DT - 20}L${DX} ${DB}L${x0} ${DB}Z`;
        P0(cg, d, C.paperLight, 1);
        let f = ''; for (let i = 1; i < 6; i++) { const x = x0 + (DX - x0) * i / 6; f += `M${f1(x)} ${DT}C${f1(x + side * 8)} ${DT + 300} ${f1(x - side * 8)} ${DT + 500} ${f1(x)} ${DB}`; }
        L0(cg, f, C.inkSoft, 1.8, 0.5);
        // a patterned border along the inner edge
        let b = ''; for (let y = DT + 20; y < DB; y += 60) b += BTL.E(DX - side * 24, y, 10, 14);
        L0(cg, b, C.gold, 2, 0.7);
        L0(cg, `M${DX - side * 48} ${DT - 20}L${DX - side * 48} ${DB}`, C.gold, 2, 0.6);
        L0(cg, d, C.ink, 3, 1);
      };
      curtain(cL, 1); curtain(cR, -1);
      L0(g, `M${DX - DW / 2 - 160} ${DT - 24}L${DX + DW / 2 + 160} ${DT - 24}`, C.ink, 5, 1);   // the rail
      // ground in front, down to the bottom of the frame
      P0(g, 'M-200 1080L1280 1080L1280 1920L-200 1920Z', C.paperDark, 1);
      const spill = P0(g, `M${DX - DW / 2} 1080L${DX + DW / 2} 1080L${DX + 300} 1500L${DX - 300} 1500Z`, C.gold, 0.12);
      let gr = ''; for (const y of [1140, 1260, 1440, 1700]) gr += `M-200 ${y}L1280 ${y}`;
      L0(g, gr, C.inkSoft, 1.4, 0.14);
      L0(g, 'M-200 1080L1280 1080', C.inkSoft, 2.5, 0.7);
      vizier(g, 250, 1120, 640, { face: 1 });
      return {
        update(lt, dur, cues) {
          const hit = cue(cues, 'hit', dur * 0.55);
          const c = BTL.ease(lt, hit - 0.2, Math.max(1.4, dur - hit));
          const sh = c * (DW / 2 + 8);
          cL.setAttribute('transform', `translate(${f1(-(DW / 2) + sh)} 0)`);
          cR.setAttribute('transform', `translate(${f1(DW / 2 - sh)} 0)`);
          const k = 1 - 0.9 * c;
          gap.setAttribute('fill-opacity', (0.6 * k * (0.95 + 0.05 * Math.sin(lt * 2))).toFixed(3));
          gapLight.set(0.34 * k + 0.04);
          spill.setAttribute('fill-opacity', (0.12 * k).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the camp
  // a conical army tent (origin = ground centre): canvas cone, pole tip, guy ropes, a dark door slit
  function campTent(parent, x, y, s, o = {}) {
    const tg = el(parent, 'g', { transform: `translate(${x} ${y})` });
    const cone = `M${f1(-s)} 0C${f1(-s * 0.7)} ${f1(-s * 0.4)} ${f1(-s * 0.25)} ${f1(-s * 0.9)} 0 ${f1(-s * 1.1)}C${f1(s * 0.25)} ${f1(-s * 0.9)} ${f1(s * 0.7)} ${f1(-s * 0.4)} ${f1(s)} 0Z`;
    P0(tg, cone, C.paperLight, 1);
    let seams = ''; for (const k of [-0.6, -0.3, 0.3, 0.6]) seams += `M0 ${f1(-s * 1.1)}C${f1(k * s * 0.3)} ${f1(-s * 0.7)} ${f1(k * s * 0.8)} ${f1(-s * 0.3)} ${f1(k * s)} 0`;
    L0(tg, seams, C.inkSoft, 1.4 + s / 160, 0.5);
    P0(tg, `M${f1(-s * 0.12)} 0L0 ${f1(-s * 0.45)}L${f1(s * 0.12)} 0Z`, C.paperDark, 1);
    L0(tg, cone, C.ink, 1.6 + s / 80, 0.9);
    L0(tg, `M0 ${f1(-s * 1.1)}L0 ${f1(-s * 1.28)}`, C.ink, 1.5 + s / 100, 0.9);
    if (o.ropes) L0(tg, `M${f1(-s * 0.5)} ${f1(-s * 0.55)}L${f1(-s * 1.35)} 0M${f1(s * 0.5)} ${f1(-s * 0.55)}L${f1(s * 1.35)} 0`, C.inkSoft, 1.4, 0.6);
    return tg;
  }
  SH.bt_zg_camp = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H);
      const st = BTL.stars(g, 140, 66, [0, 0, 1080, 600]);
      const r = rng(1566);
      // far, sparse rows in the mist: a few small dim tents with tiny fires
      const far = [];
      [[650, 0.35, 9, C.paper], [740, 0.5, 7, C.paper]].forEach(([y, k, n, fill], ri) => {
        let d = `M-200 ${y + 16}`;
        for (let x = -200; x <= 1280; x += 60) d += `L${x} ${f1(y + 16 - 12 * Math.sin(x / 170 + ri))}`;
        P0(g, d + 'L1280 1920L-200 1920Z', fill, 1); L0(g, d, C.inkSoft, 1.4, 0.4);
        for (let i = 0; i < n; i++) {
          const x = 100 + (880 / (n - 1)) * i + (r() * 2 - 1) * 30;
          const t = campTent(g, x, y, 60 * k); t.setAttribute('opacity', '0.55');
          if (r() < 0.6) far.push({ e: P0(g, BTL.E(x + 70 * k, y + 4, 4 * k + 2, 5 * k + 2), C.gold, 0), ph: r() * TAU });
        }
      });
      const mist = [];
      for (let i = 0; i < 5; i++) mist.push({ e: P0(g, '', C.ink, 0), y: 640 + i * 40, w: 380 + r() * 300, x: r() * 1300 - 150, sp: 6 + r() * 6 });
      // the near ground, running to the bottom of the frame
      let gd = 'M-200 860'; for (let x = -200; x <= 1280; x += 60) gd += `L${x} ${f1(860 - 20 * Math.sin(x / 300))}`;
      P0(g, gd + 'L1280 1920L-200 1920Z', C.paperDark, 1); L0(g, gd, C.inkSoft, 1.8, 0.6);
      // the one fire in front, between the big tents
      const FX = 560, FY = 1100;
      const fireGlow = BTL.glow(svg, defs, FX, FY - 40, 420, C.stain, 0.3, g);
      const groundPool = P0(g, BTL.E(FX, FY + 10, 300, 50), C.gold, 0.1);
      // three big tents, all whole inside the frame
      campTent(g, 230, 1010, 170, { ropes: true });
      campTent(g, 840, 1030, 190, { ropes: true });
      campTent(g, 530, 900, 120, {});
      // logs and the flame
      L0(g, `M${FX - 50} ${FY + 6}L${FX + 46} ${FY - 14}M${FX - 44} ${FY - 14}L${FX + 52} ${FY + 6}`, C.inkSoft, 9, 1);
      const fl = P0(g, '', C.gold, 0.95), core = P0(g, '', C.ink, 0.8);
      const smk = smoke(g, FX, FY - 70, 12, 8, { h: 360, size: 22, alpha: 0.08, drift: 30 });
      const sparks = [];
      for (let i = 0; i < 6; i++) sparks.push({ e: P0(g, '', C.gold, 0), ph: i / 6, dx: (r() * 2 - 1) * 30 });
      const rg = rng(31); let gr = '';
      for (let i = 0; i < 70; i++) { const x = -40 + rg() * 1160, b = 1920 - rg() * 560, h = 40 + rg() * 100, l = (rg() * 2 - 1) * 22; gr += `M${f1(x)} ${f1(b)}q${f1(l * 0.3)} ${f1(-h * 0.6)} ${f1(l)} ${f1(-h)}`; }
      L0(g, gr, C.inkSoft, 2.2, 0.36);
      return {
        update(lt, dur, cues) {
          st.update(lt);
          const hit = cue(cues, 'hit', dur * 0.5);
          const out = BTL.ease(lt, hit, Math.max(1.2, dur - hit - 0.2));   // the fire sinks and goes out
          const k = 1 - out;
          fl.setAttribute('d', flameD(FX, FY - 8, 110 * k + 2, lt)); fl.setAttribute('fill-opacity', (0.95 * Math.min(1, k * 3)).toFixed(3));
          core.setAttribute('d', flameD(FX, FY - 10, 50 * k + 1, lt, 0.7)); core.setAttribute('fill-opacity', (0.8 * Math.min(1, k * 3)).toFixed(3));
          fireGlow.set((0.3 + 0.03 * Math.sin(lt * 2.3)) * k + 0.03);
          groundPool.setAttribute('fill-opacity', (0.1 * k).toFixed(3));
          smk.update(lt, 0.4 + out * 1.2);
          for (const q of sparks) {
            const u = ((q.ph + lt * 0.5) % 1 + 1) % 1;
            q.e.setAttribute('d', BTL.E(FX + q.dx + 14 * Math.sin(lt + q.ph * 9), FY - 90 - u * 260, 3, 3));
            q.e.setAttribute('fill-opacity', (0.8 * k * Math.sin(Math.PI * u)).toFixed(3));
          }
          far.forEach((f, i) => f.e.setAttribute('fill-opacity', ((0.7 + 0.2 * Math.sin(lt * 2 + f.ph)) * (1 - BTL.ease(lt, hit + 0.2 + i * 0.12, 0.5))).toFixed(3)));
          for (const m of mist) { const x = ((m.x + m.sp * lt + 300) % 1700) - 300; m.e.setAttribute('d', BTL.E(x, m.y, m.w / 2, 12)); m.e.setAttribute('fill-opacity', '0.06'); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the fortress in the marsh
  SH.bt_zg_fort = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'siege', g = canvas(svg, W, H);
      const st = BTL.stars(g, 110, 9, [0, 0, 1080, 620]);
      const sky = BTL.glow(svg, defs, 540, 1000, 640, C.stain, mode === 'fallen' ? 0.22 : 0.12, g);
      // far shore
      P0(g, 'M-200 1020L1280 1020L1280 1920L-200 1920Z', C.paperDark, 1);
      let sh = 'M-200 1010'; for (let x = -200; x <= 1280; x += 80) sh += `L${x} ${f1(1010 - 10 * Math.sin(x / 120))}`;
      P0(g, sh + 'L1280 1040L-200 1040Z', C.paper, 1); L0(g, sh, C.inkSoft, 1.6, 0.6);
      // the island fortress: a star of low walls with bastions and the keep
      const FY = 1040;
      const wall = `M150 ${FY}L200 ${FY - 90}L300 ${FY - 70}L340 ${FY - 130}L740 ${FY - 130}L780 ${FY - 70}L880 ${FY - 90}L930 ${FY}Z`;
      const keep = `M480 ${FY - 130}L480 ${FY - 290}L600 ${FY - 290}L600 ${FY - 130}Z`;
      const keepRoof = `M470 ${FY - 290}L540 ${FY - 360}L610 ${FY - 290}Z`;
      const Z = P.zoom ?? (mode === 'siege' ? 2.05 : 1.35);
      const fs = el(g, 'g', { transform: `translate(540 ${FY}) scale(${Z}) translate(-540 ${-FY})` });
      const fg = el(fs, 'g');
      P0(fg, keep, C.paperLight, 1); L0(fg, keep, C.ink, 3, 1);
      P0(fg, keepRoof, C.paperLight, 1); L0(fg, keepRoof, C.ink, 3, 1);
      P0(fg, `M520 ${FY - 220}L540 ${FY - 240}L560 ${FY - 220}L560 ${FY - 180}L520 ${FY - 180}Z`, C.paperDark, 1);
      P0(fg, wall, C.paperLight, 1);
      let cren = ''; for (let x = 352; x < 735; x += 26) cren += `M${x} ${FY - 130}l0-14l12 0l0 14`;
      L0(fg, cren, C.ink, 2.4, 0.9);
      L0(fg, `M150 ${FY}L930 ${FY}M300 ${FY - 70}L300 ${FY}M780 ${FY - 70}L780 ${FY}`, C.inkSoft, 2, 0.6);
      let mas = ''; for (const y of [FY - 100, FY - 66, FY - 32]) mas += `M${y < FY - 90 ? 350 : 200} ${y}L${y < FY - 90 ? 730 : 880} ${y}`;
      L0(fg, mas, C.inkSoft, 1.4, 0.35);
      if (mode === 'fallen') {
        // a breach in the left curtain wall: dark notch + rubble
        P0(fg, `M380 ${FY - 131}L420 ${FY - 70}L470 ${FY - 90}L500 ${FY - 131}Z`, C.paperDark, 1);
        L0(fg, `M380 ${FY - 131}L420 ${FY - 70}L470 ${FY - 90}L500 ${FY - 131}`, C.ink, 2.5, 1);
        L0(fg, `M400 ${FY - 20}l14-10l12 8M440 ${FY - 30}l16-8l8 10M470 ${FY - 14}l12-6`, C.inkSoft, 2, 0.8);
      }
      L0(fg, wall, C.ink, 3.5, 1);
      // water: still, with slow ripples and a reflection of the keep
      P0(g, `M-200 ${FY}L1280 ${FY}L1280 1920L-200 1920Z`, C.paper, 1);
      const refl = P0(g, `M${f1(540 - 60 * Z)} ${FY + 10}L${f1(540 + 60 * Z)} ${FY + 10}L${f1(540 + 60 * Z)} ${f1(FY + 10 + 170 * Z)}L${f1(540 - 60 * Z)} ${f1(FY + 10 + 170 * Z)}Z`, C.paperLight, 0.18);
      const reflRoof = P0(g, `M${f1(540 - 70 * Z)} ${f1(FY + 10 + 160 * Z)}L540 ${f1(FY + 10 + 230 * Z)}L${f1(540 + 70 * Z)} ${f1(FY + 10 + 160 * Z)}Z`, C.paperLight, 0.12);
      const ripples = [];
      for (let i = 0; i < 13; i++) ripples.push({ e: L0(g, '', C.inkSoft, 1.8, 0.4), y: FY + 30 + i * i * 3.6, ph: i * 1.7 });
      // reeds in the foreground
      const rr = rng(4); let reeds = '';
      for (let i = 0; i < 46; i++) { const x = -40 + rr() * 1160, h = 140 + rr() * 260, b = 1920 - rr() * 120, lean = (rr() * 2 - 1) * 40; reeds += `M${f1(x)} ${f1(b)}Q${f1(x + lean * 0.3)} ${f1(b - h * 0.6)} ${f1(x + lean)} ${f1(b - h)}`; }
      P0(g, 'M-200 1700C200 1660 800 1680 1280 1640L1280 1920L-200 1920Z', C.paperDark, 1);
      L0(g, reeds, C.inkSoft, 3, 0.75);
      const smk = mode === 'fallen'
        ? [smoke(fs, 440, FY - 130, 22, 21, { h: 700, size: 80, alpha: 0.075, drift: 140, speed: 0.04 })]
        : [smoke(fs, 380, FY - 140, 12, 5, { h: 260, size: 34, alpha: 0.06, drift: 60 }), smoke(fs, 760, FY - 120, 12, 6, { h: 240, size: 30, alpha: 0.06, drift: 50 })];
      const glowFire = mode === 'fallen' ? P0(fs, BTL.E(440, FY - 110, 70, 30), C.gold, 0.3) : null;
      // the horse-tail standard (tuğ) rising on the breach
      let tug = null;
      if (mode === 'fallen') {
        tug = el(fs, 'g');
        L0(tug, `M440 ${FY - 130}L440 ${FY - 400}`, C.ink, 4, 1);
        P0(tug, BTL.E(440, FY - 410, 13, 13), C.gold, 1);
        const tail = `M428 ${FY - 392}C410 ${FY - 340} 420 ${FY - 280} 404 ${FY - 230}C430 ${FY - 250} 446 ${FY - 250} 470 ${FY - 236}C456 ${FY - 290} 466 ${FY - 340} 452 ${FY - 392}Z`;
        P0(tug, tail, C.paperLight, 1); L0(tug, tail, C.ink, 2.5, 1);
        L0(tug, `M440 ${FY - 384}L436 ${FY - 250}M432 ${FY - 380}L420 ${FY - 260}M448 ${FY - 380}L456 ${FY - 256}`, C.inkSoft, 1.4, 0.7);
      }
      const t = mode === 'siege' && P.text ? txt(g, P.text, 540, 170, 150, { weight: 300 }) : null;
      if (t) BTL.fit(t, 900);
      const sub = mode === 'siege' && P.sub ? txt(g, P.sub, 540, 262, 50, { font: LO, italic: true, color: C.inkSoft, weight: 400 }) : null;
      const rule = t ? LD(g, 'M450 206L630 206', C.gold, 2.5, 1) : null;
      return {
        update(lt, dur, cues) {
          st.update(lt);
          sky.set((mode === 'fallen' ? 0.22 : 0.12) + 0.02 * Math.sin(lt * 0.5));
          for (const s of smk) s.update(lt);
          ripples.forEach((q, i) => {
            const y = q.y, w = 60 + i * 26, x = 540 + 380 * Math.sin(i * 2.3) + 30 * Math.sin(lt * 0.35 + q.ph);
            q.e.setAttribute('d', `M${f1(x - w)} ${f1(y)}L${f1(x + w)} ${f1(y)}`);
            q.e.setAttribute('stroke-opacity', (0.22 + 0.16 * Math.sin(lt * 0.6 + q.ph)).toFixed(3));
          });
          refl.setAttribute('fill-opacity', (0.16 + 0.04 * Math.sin(lt * 0.8)).toFixed(3));
          if (glowFire) glowFire.setAttribute('fill-opacity', (0.26 + 0.06 * Math.sin(lt * 1.9)).toFixed(3));
          if (tug) {
            const hit = cue(cues, 'hit', dur * 0.3);
            const p = BTL.ease(lt, Math.min(hit - 0.1, 0.2), 1.3);
            tug.setAttribute('transform', `translate(0 ${f1((1 - p) * 260)})`);
            fade(tug, p * 1.4);
          }
          if (t) {
            fade(t, BTL.ease(lt, 0.1, 1.2));
            t.setAttribute('transform', `translate(0 ${f1((1 - BTL.ease(lt, 0.1, 1.6)) * 14)})`);
            fade(sub, BTL.ease(lt, 0.5, 1.2));
            draw(rule, BTL.ease(lt, 0.4, 1.2));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the march home
  // a small walking soldier (feet at 0) with a tall felt cap folded back (börk); legs swing slowly with phase ph
  function walker(parent, h) {
    const g = el(parent, 'g'), col = C.paperDark, rim = C.inkSoft, u = v => f1(v * h);
    const body = `M${u(-0.12)} ${u(-0.74)}C${u(-0.16)} ${u(-0.5)} ${u(-0.18)} ${u(-0.3)} ${u(-0.15)} ${u(-0.22)}L${u(0.15)} ${u(-0.22)}C${u(0.18)} ${u(-0.3)} ${u(0.16)} ${u(-0.5)} ${u(0.12)} ${u(-0.74)}Z`;
    const head = BTL.E(0, -0.82 * h, 0.065 * h, 0.07 * h);
    const cap = `M${u(-0.07)} ${u(-0.86)}L${u(-0.05)} ${u(-1.02)}C${u(-0.12)} ${u(-1.0)} ${u(-0.2)} ${u(-0.9)} ${u(-0.22)} ${u(-0.78)}C${u(-0.14)} ${u(-0.84)} ${u(-0.08)} ${u(-0.86)} ${u(-0.07)} ${u(-0.86)}ZM${u(-0.07)} ${u(-0.86)}L${u(0.07)} ${u(-0.86)}L${u(0.05)} ${u(-1.02)}L${u(-0.05)} ${u(-1.02)}Z`;
    const legs = L0(g, '', col, 0.06 * h, 1);
    for (const d of [body, head, cap]) { P0(g, d, col, 1); L0(g, d, rim, 2, 0.8); }
    return { g, set(ph) { const a = Math.sin(ph) * 0.09 * h; legs.setAttribute('d', `M0 ${u(-0.24)}L${f1(a)} 0M0 ${u(-0.24)}L${f1(-a)} 0`); } };
  }
  // a horse in profile facing right (feet at 0), legs swinging slowly
  function horse(parent, x, y, k) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y}) scale(${k})` });
    const body = 'M-70-70C-76-100-40-112 10-110C50-108 70-104 80-98L104-124C112-134 130-136 144-126L156-108C158-100 150-96 142-100L120-104L98-82C88-68 70-62 50-60C10-58-40-56-70-70Z';
    P0(g, body, C.paperDark, 1); L0(g, body, C.inkSoft, 2.2, 0.9);
    L0(g, 'M-70-84C-86-80-92-60-90-40', C.inkSoft, 3, 0.9);    // tail
    const legs = L0(g, '', C.paperDark, 9, 1), legRim = L0(g, '', C.inkSoft, 1.5, 0.6);
    return { set(ph) {
      const a = Math.sin(ph) * 10, b = -a;
      const d = `M-52-66L${f1(-52 + a)} 0M-36-64L${f1(-36 + b)} 0M36-62L${f1(36 + b)} 0M52-64L${f1(52 + a)} 0`;
      legs.setAttribute('d', d); legRim.setAttribute('d', d);
    } };
  }
  // the closed Ottoman carriage: a low box on four small wheels, flat roof with a fringed valance, curtained sides
  function carriage(parent) {
    const cg = el(parent, 'g');
    const box = 'M-170-70L170-70L170-230L-170-230Z';
    const roof = 'M-196-230L196-230L188-256L-188-256Z';
    P0(cg, box, C.paperLight, 1);
    let cur = ''; for (let x = -150; x <= 150; x += 20) cur += `M${x} -224C${x + 4} -180 ${x - 4} -130 ${x} -80`;
    L0(cg, cur, C.inkSoft, 1.8, 0.6);
    L0(cg, 'M-170-150C-120-136-60-136 0-150C60-136 120-136 170-150', C.gold, 2, 0.6);   // the tie-back of the curtains
    L0(cg, box, C.ink, 3, 1);
    P0(cg, roof, C.paperLight, 1); L0(cg, roof, C.ink, 3, 1);
    let v = 'M-196-230'; for (let i = 0; i < 16; i++) v += `Q${f1(-196 + 392 * (i + 0.5) / 16)} -204 ${f1(-196 + 392 * (i + 1) / 16)} -230`;
    P0(cg, v + 'Z', C.paper, 1); L0(cg, v, C.ink, 2, 0.9);
    let fr = ''; for (let x = -190; x <= 190; x += 14) fr += `M${x} -214l0 10`;
    L0(cg, fr, C.gold, 1.6, 0.6);
    L0(cg, 'M-170-70L-170-50M170-70L170-50M-190-50L190-50', C.ink, 3, 1);         // chassis
    L0(cg, 'M190-56L330-60', C.ink, 3, 1);                                          // the shaft
    const wheels = [-130, -50, 50, 130].map(x => {
      const wg = el(cg, 'g', { transform: `translate(${x} -24)` });
      P0(wg, BTL.E(0, 0, 26, 26), C.paperDark, 0.7); L0(wg, BTL.E(0, 0, 26, 26), C.ink, 3, 1);
      const sp = el(wg, 'g');
      let s = ''; for (let i = 0; i < 6; i++) { const a = i * TAU / 6; s += `M0 0L${f1(Math.cos(a) * 24)} ${f1(Math.sin(a) * 24)}`; }
      L0(sp, s, C.inkSoft, 2, 0.9); P0(wg, BTL.E(0, 0, 5, 5), C.ink, 1);
      return sp;
    });
    return { cg, wheels };
  }
  SH.bt_zg_march = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H);
      const st = BTL.stars(g, 130, 31, [0, 0, 1080, 700]);
      const moon = BTL.glow(svg, defs, 820, 300, 200, C.stain, 0.22, g);
      P0(g, BTL.E(820, 300, 46, 46), C.ink, 0.85);
      P0(g, BTL.E(838, 290, 40, 40), C.paper, 1);
      let hl = 'M-200 860'; for (let x = -200; x <= 1280; x += 90) hl += `L${x} ${f1(860 - 40 * Math.sin(x / 260) - 20 * Math.sin(x / 90))}`;
      P0(g, hl + 'L1280 1920L-200 1920Z', C.paper, 1); L0(g, hl, C.inkSoft, 1.6, 0.6);
      P0(g, 'M-200 960L1280 950L1280 1920L-200 1920Z', C.paperDark, 1);
      const RY = 1040;
      L0(g, `M-200 ${RY}L1280 ${RY - 10}`, C.inkSoft, 30, 0.16); L0(g, `M-200 ${RY + 14}L1280 ${RY + 4}`, C.inkSoft, 1.6, 0.4);
      // everything that marches is in one group that slides slowly right
      const mg = el(g, 'g');
      const back = [], front = [];
      const r = rng(7);
      for (let i = 0; i < 16; i++) { const w = walker(mg, 84); back.push({ w, x: -700 + i * 66 + r() * 10, ph: r() * TAU }); }
      const car = carriage(mg);
      const CX = 320, K = 1.4;
      car.cg.setAttribute('transform', `translate(${CX} ${RY}) scale(${K})`);
      const hs = [horse(mg, CX + 300 * K, RY - 4, 1.38), horse(mg, CX + 350 * K, RY + 6, 1.38)];
      for (let i = 0; i < 4; i++) { const w = walker(mg, 120); front.push({ w, x: -900 + i * 110 + r() * 14, ph: r() * TAU }); }
      // a lantern hanging at the carriage's front corner
      const LX = CX + 186 * K, LY = RY - 226 * K;
      const lh = BTL.glow(svg, defs, LX, LY + 40, 140, C.gold, 0.3, mg);
      L0(mg, `M${LX} ${LY - 10}L${LX} ${LY}`, C.ink, 2.5, 1);
      const lan = `M${LX - 14} ${LY}L${LX + 14} ${LY}L${LX + 16} ${LY + 46}L${LX - 16} ${LY + 46}Z`;
      P0(mg, lan, C.gold, 0.8); L0(mg, lan, C.ink, 2, 1);
      // near ground and grass, still (the column moves past it)
      P0(g, 'M-200 1500C200 1460 700 1480 1280 1440L1280 1920L-200 1920Z', C.paperDark, 1);
      const rg = rng(12); let grass = '';
      for (let i = 0; i < 60; i++) { const x = -40 + rg() * 1160, b = 1920 - rg() * 380, h = 40 + rg() * 90, l = (rg() * 2 - 1) * 20; grass += `M${f1(x)} ${f1(b)}l${f1(l)} ${f1(-h)}`; }
      L0(g, grass, C.inkSoft, 2.2, 0.4);
      return {
        update(lt, dur, cues) {
          st.update(lt);
          moon.set(0.22 + 0.02 * Math.sin(lt * 0.5));
          const sp = 10, ox = sp * lt - 10;          // the whole column slides right at 10 px/s
          mg.setAttribute('transform', `translate(${f1(ox)} 0)`);
          const step = lt * 3.2;
          for (const q of back) { q.w.g.setAttribute('transform', `translate(${f1(q.x + 600)} ${RY - 26})`); q.w.set(step + q.ph); }
          for (const q of front) { q.w.g.setAttribute('transform', `translate(${f1(q.x + 600)} ${RY + 70})`); q.w.set(step + q.ph); }
          hs.forEach((h, i) => h.set(step * 1.1 + i * 1.7));
          for (const s of car.wheels) s.setAttribute('transform', `rotate(${f1((lt * 22) % 360)})`);
          const hit = cue(cues, 'hit', dur * 0.5);
          lh.set(0.3 + 0.18 * BTL.ease(lt, hit - 0.1, 1.2) + 0.03 * Math.sin(lt * 2.3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the decree and the tuğra
  // a simplified imperial monogram (origin = baseline centre): three tall shafts with flags, two loops to the left,
  // two long arms to the right, the base script
  const TUGRA = [
    // base script (sere)
    'M-70 10C-40-20-10 10 20-10C40-24 60 4 90-6C120-16 150 6 190-4',
    // three tall shafts (tuğ)
    'M-20-20C-24-160-26-300-20-430', 'M24-20C20-150 18-280 24-410', 'M68-20C64-140 62-260 68-390',
    // flags (zülfe) sweeping down to the right from the shafts
    'M-20-400C30-380 70-350 110-300C80-310 50-306 30-296', 'M24-380C74-360 112-330 150-282C120-292 92-288 72-278', 'M68-360C116-340 152-312 186-266',
    // the two nested loops (beyze) to the left
    'M10-40C-80-190-330-180-330-80C-330 20-150 40-20-14', 'M0-52C-70-150-246-146-246-84C-246-26-130-14-12-34',
    // the two long arms (hançer) to the right
    'M-10-70C100-100 230-130 350-200', 'M-4-40C120-60 250-90 380-140',
  ];

  SH.bt_zg_ferman = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const g = canvas(svg, W, H);
      P0(g, 'M-200-100L1280-100L1280 1920L-200 1920Z', C.paperDark, 1);
      const pool = BTL.glow(svg, defs, 540, 680, 620, C.stain, 0.3, g);
      // the victory decree behind, its gold monogram already there
      const pg = el(g, 'g', { transform: 'rotate(-4 540 600)' });
      const sheet = 'M230 160L850 160L850 1100L230 1100Z';
      P0(pg, sheet, C.paperLight, 1); L0(pg, sheet, C.inkSoft, 2.5, 0.9);
      const r = rng(1566);
      let lines = '';
      for (let i = 0; i < 8; i++) {
        const y = 640 + i * 52, x0 = 290 + r() * 20, x1 = 790 - r() * 30;
        let d = `M${f1(x0)} ${f1(y)}`, x = x0;
        while (x < x1) { const nx = Math.min(x1, x + 30 + r() * 50); d += `Q${f1((x + nx) / 2)} ${f1(y - 10 - r() * 14)} ${f1(nx)} ${f1(y - (nx - x0) * 0.04)}`; x = nx + 8 + r() * 12; if (x < x1) d += `M${f1(x)} ${f1(y - (x - x0) * 0.04)}`; }
        lines += d;
      }
      L0(pg, lines, C.ink, 2.2, 0.55);
      const tg = el(pg, 'g', { transform: 'translate(520 520) scale(0.7)' });
      const strokes = TUGRA.map(d => LD(tg, d, C.gold, 5, 0.85));
      // the secret letter: folded, sealed, slides in over the decree on the cue
      const lg = el(g, 'g');
      const env = 'M260 700L820 700L820 1060L260 1060Z';
      P0(lg, 'M272 714L832 714L832 1074L272 1074Z', C.paperDark, 0.9);
      P0(lg, env, C.paperLight, 1);
      L0(lg, 'M260 700L540 900L820 700', C.inkSoft, 2.5, 0.9);
      L0(lg, env, C.ink, 3, 1);
      const seal = P0(lg, BTL.E(540, 900, 46, 46), C.red, 0.95);
      L0(lg, BTL.E(540, 900, 46, 46), C.ink, 2.5, 0.9);
      L0(lg, 'M528 920C524 896 526 878 530 864M542 920C540 898 541 882 544 870M556 920C554 900 555 888 558 878M520 914C510 904 512 892 524 896', C.gold, 2.5, 0.95);
      const to = txt(lg, 'Şehzade Selim’e', 540, 1010, 50, { font: LO, italic: true, color: C.inkSoft, weight: 400 });
      return {
        update(lt, dur, cues) {
          pool.set(0.3 + 0.03 * Math.sin(lt * 1.3));
          const p0 = BTL.ease(lt, 0, 1.4);
          strokes.forEach((e, i) => draw(e, clamp01((p0 - i / strokes.length * 0.5) / 0.5)));
          const hit = cue(cues, 'hit', dur * 0.3);
          const p = BTL.ease(lt, hit - 0.2, 1.4);
          lg.setAttribute('transform', `translate(0 ${f1((1 - p) * 260)})`);
          fade(lg, p * 1.5);
          seal.setAttribute('fill-opacity', (0.8 + 0.15 * Math.sin(lt * 1.5)).toFixed(3));
          fade(to, BTL.ease(lt, hit + 0.6, 1));
        },
      };
    },
  };
})();
