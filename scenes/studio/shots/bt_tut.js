// bt_tut: Tutankhamun's tomb (KV62), found 4 Nov 1922, belgesel style (docs/BELGESEL.md). Still line art in the theme's
// tokens; the only motion is slow and natural (a candle flame, falling sand, drifting dust, light). Places are drawn on
// the 1920x1080 stage (BTL.stage frames them for a Short). Shared kit for bt_tut_b.js: window.TUTL.
//   bt_tut_hole      P: {mode: "wall"|"candle"|"flame"|"glint"|"corridor"}  cues: hole, hit
//                    wall: a plastered, sealed doorway at the end of a rock-cut passage. candle: the same; a breach opens
//                    in its top-left corner ("hole") and a hand pushes a candle into it. flame: close-up of the breach,
//                    the candle flame leans out (hot air escaping). glint: through the breach, darkness; gold glints
//                    come up out of it on "hit". corridor: a passage filled with stone chips that clears to a second
//                    sealed door ("hit")
//   bt_tut_valley    P: {mode: "wide"|"dig"|"huts"|"night", glow}  the Valley of the Kings: cliffs, the peak behind.
//                    dig: small figures carry baskets past spoil heaps. huts: ruined stone huts on the spoil at the foot
//                    of a big tomb door (glow: a faint gold step under one hut on "hit"). night: stars and a moon
//   bt_tut_stairs    P: {mode: "first"|"down"|"full"|"refill"}  cues: hit   section of the rock-cut stair under the huts:
//                    first: one step shows out of the fill. down: the steps clear one by one to a sealed door (12).
//                    full: 16 steps, the door; on "hit" a gold name cartouche on its lower part. refill: fill runs back in
//   bt_tut_seal      P: {}                     the necropolis seal: a jackal lying over nine bound captives, on plaster
//   bt_tut_cartouche P: {mode: "name"|"erase", label}  cues: hit   the king's name ring; name: label appears on "hit";
//                    erase: the signs fade out one by one from "hit", the empty ring stays
//   bt_tut_door      P: {mode: "resealed"|"guards"}  cues: hit   resealed: the sealed door, on "hit" a re-plastered
//                    patch with other seals outlined in red in its top corner. guards: two black guardian statues with
//                    gold kilts and staffs flank a sealed door, candle light from the left
//   bt_tut_room      P: {mode: "first"|"all"}  cues: a, b, hit   the antechamber seen in the candle light: a gilded
//                    animal-headed couch; all: chariot wheels on "a", stacked boxes on "b", gold glints on "hit"
//   bt_tut_hourglass P: {label}               an hourglass in a light pool, sand running out
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const f1 = v => v.toFixed(1);
  const fade = (e, a) => e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, extra));
  const L0 = (parent, d, stroke, w = 3, a = 1) => el(parent, 'path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}, o.spacing ? { 'letter-spacing': o.spacing } : {}));
  const rect = (x0, y0, x1, y1) => `M${x0} ${y0}L${x1} ${y0}L${x1} ${y1}L${x0} ${y1}Z`;

  // a candle flame: three nested tongues that breathe smoothly and lean (lean > 0: to the right); origin = wick
  function flame(parent, x, y, s = 1) {
    const g = el(parent, 'g');
    const fl = [[C.red, 1, 0], [C.gold, 0.72, 1.1], [C.paperLight, 0.4, 2.3]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.95), k, ph }));
    return {
      g,
      update(lt, lean = 0, amp = 1) {
        for (const f of fl) {
          const h = (70 + 7 * Math.sin(lt * 2.3 + f.ph) + 4 * Math.sin(lt * 3.7 + f.ph * 2)) * f.k * s * amp;
          const w = 17 * f.k * s * Math.max(0.25, amp), ln = (lean + 4 * Math.sin(lt * 1.3 + f.ph)) * s * f.k;
          f.e.setAttribute('d', `M${f1(x - w)} ${f1(y)}C${f1(x - w)} ${f1(y - h * 0.4)} ${f1(x - w * 0.2 + ln * 0.6)} ${f1(y - h * 0.72)} ${f1(x + ln)} ${f1(y - h)}` +
            `C${f1(x + w * 0.2 + ln * 0.6)} ${f1(y - h * 0.72)} ${f1(x + w)} ${f1(y - h * 0.4)} ${f1(x + w)} ${f1(y)}C${f1(x + w)} ${f1(y + w * 0.9)} ${f1(x - w)} ${f1(y + w * 0.9)} ${f1(x - w)} ${f1(y)}Z`);
        }
      },
    };
  }
  // a tapered wax candle with drips (origin = wick); drawn into parent
  function candleBody(g, x, y, s = 1) {
    const X = v => f1(x + v * s), Y = v => f1(y + v * s);
    const body = `M${X(-11)} ${Y(8)}L${X(11)} ${Y(8)}L${X(15)} ${Y(170)}L${X(-15)} ${Y(170)}Z`;
    P0(g, body, C.paperLight, 1);
    const drip = `M${X(6)} ${Y(8)}C${X(14)} ${Y(12)} ${X(15)} ${Y(38)} ${X(12)} ${Y(48)}C${X(9)} ${Y(55)} ${X(5)} ${Y(46)} ${X(6)} ${Y(32)}Z` +
      `M${X(-9)} ${Y(8)}C${X(-15)} ${Y(14)} ${X(-15)} ${Y(26)} ${X(-12)} ${Y(30)}C${X(-9)} ${Y(33)} ${X(-7)} ${Y(24)} ${X(-7)} ${Y(14)}Z`;
    P0(g, drip, C.paperLight, 1);
    L0(g, body, C.ink, 2.5); L0(g, drip, C.ink, 2);
    L0(g, BTL.E(x, y + 8 * s, 11 * s, 3.5 * s), C.inkSoft, 2);
    L0(g, `M${X(0)} ${Y(8)}L${X(0)} ${Y(-4)}`, C.ink, 3);
  }
  // a candle standing on a small dish (origin = wick)
  function candleStand(parent, x, y, s = 1) {
    const g = el(parent, 'g');
    const dish = `M${f1(x - 60 * s)} ${f1(y + 170 * s)}C${f1(x - 50 * s)} ${f1(y + 196 * s)} ${f1(x + 50 * s)} ${f1(y + 196 * s)} ${f1(x + 60 * s)} ${f1(y + 170 * s)}Z`;
    P0(g, dish, C.paperDark, 1); L0(g, dish, C.inkSoft, 2.5);
    candleBody(g, x, y, s);
    return { g, fl: flame(g, x, y - 4 * s, s) };
  }
  // a candle held in a hand: fingers wrap the candle, the forearm runs off down to the right (origin = wick)
  function candle(parent, x, y, s = 1) {
    const g = el(parent, 'g');
    const X = v => f1(x + v * s), Y = v => f1(y + v * s);
    const arm = `M${X(50)} ${Y(126)}C${X(200)} ${Y(118)} ${X(460)} ${Y(140)} ${X(1500)} ${Y(150)}L${X(1500)} ${Y(232)}C${X(460)} ${Y(222)} ${X(200)} ${Y(204)} ${X(40)} ${Y(194)}Z`;
    P0(g, arm, C.inkSoft, 1); L0(g, arm, C.ink, 2.5);
    L0(g, `M${X(230)} ${Y(124)}C${X(240)} ${Y(150)} ${X(240)} ${Y(190)} ${X(232)} ${Y(214)}`, C.ink, 2, 0.6);   // cuff
    candleBody(g, x, y, s);
    const fist = `M${X(-26)} ${Y(112)}C${X(-40)} ${Y(116)} ${X(-42)} ${Y(186)} ${X(-24)} ${Y(190)}L${X(44)} ${Y(194)}C${X(74)} ${Y(186)} ${X(76)} ${Y(124)} ${X(46)} ${Y(112)}Z`;
    P0(g, fist, C.inkSoft, 1); L0(g, fist, C.ink, 2.5);
    L0(g, `M${X(-38)} ${Y(132)}L${X(16)} ${Y(132)}M${X(-40)} ${Y(152)}L${X(14)} ${Y(152)}M${X(-38)} ${Y(172)}L${X(16)} ${Y(172)}`, C.ink, 2, 0.7);
    const th = `M${X(-6)} ${Y(116)}C${X(14)} ${Y(96)} ${X(42)} ${Y(98)} ${X(50)} ${Y(116)}C${X(40)} ${Y(124)} ${X(20)} ${Y(126)} ${X(6)} ${Y(124)}Z`;
    P0(g, th, C.inkSoft, 1); L0(g, th, C.ink, 2.5);
    const fl = flame(g, x, y - 4 * s, s);
    return { g, fl };
  }
  // seal stamps scattered over a plastered door face
  function seals(x0, y0, x1, y1, seed, dx = 74, dy = 92) {
    const r = rng(seed); let d = '';
    for (let y = y0 + 50; y < y1 - 30; y += dy) for (let x = x0 + 46 + ((y / dy) % 2) * dx / 2; x < x1 - 30; x += dx) {
      const cx = x + (r() - 0.5) * 18, cy = y + (r() - 0.5) * 18;
      d += BTL.E(cx, cy, 20, 27) + `M${f1(cx - 9)} ${f1(cy - 8)}L${f1(cx + 9)} ${f1(cy - 8)}M${f1(cx - 7)} ${f1(cy + 6)}L${f1(cx + 7)} ${f1(cy + 6)}`;
    }
    return d;
  }
  // a dark, rough-edged opening (the view into the dark): irregular closed path around cx, cy
  function blob(cx, cy, rx, ry, seed, n = 22) {
    const r = rng(seed), pts = [];
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 0.9 + r() * 0.12; pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
    return 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
  }
  // rising dust motes in a light beam
  function dust(parent, n, seed, box, col = C.ink) {
    const r = rng(seed), list = [];
    for (let i = 0; i < n; i++) list.push({ e: el(parent, 'circle', { cx: 0, cy: 0, r: 1.6 + r() * 2.2, fill: col, 'fill-opacity': 0 }), x: box[0] + r() * (box[2] - box[0]), y: box[1] + r() * (box[3] - box[1]), ph: r() });
    return {
      update(lt, a = 1) {
        for (const d of list) {
          const ph = (d.ph + lt * 0.035) % 1;
          d.e.setAttribute('cx', f1(d.x + 18 * Math.sin(lt * 0.3 + d.ph * 6))); d.e.setAttribute('cy', f1(d.y - ph * 140));
          d.e.setAttribute('fill-opacity', (0.4 * Math.sin(ph * Math.PI) * a).toFixed(3));
        }
      },
    };
  }
  window.TUTL = { flame, candle, candleStand, candleBody, seals, blob, dust, P0, L0, label, fade, f1, rect };

  // ------------------------------------------------------------------ bt_tut_hole
  SH.bt_tut_hole = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'wall', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const r = rng(1922);
      if (mode === 'wall' || mode === 'candle') {
        // rock all round, the doorway in the middle, floor below
        P0(g, rect(-200, -200, 2120, 1800), C.paperDark, 1);
        let strata = ''; for (let y = 60; y < 900; y += 70 + r() * 30) strata += `M-50 ${f1(y)}C500 ${f1(y + 20 * r())} 1300 ${f1(y - 20 * r())} 1980 ${f1(y + 10)}`;
        L0(g, strata, C.inkSoft, 1.5, 0.3);
        P0(g, rect(-200, 860, 2120, 1800), C.paper, 1);
        L0(g, 'M-50 860L1970 860', C.inkSoft, 2.5, 0.8);
        const pool = BTL.glow(svg, defs, 960, 520, 620, C.stain, 0.3, g);
        const D = BTL.drawing(g);
        D.f(rect(640, 120, 1280, 160), C.paper, 1); D.s(rect(640, 120, 1280, 160), { w: 3, color: C.inkSoft });
        D.f(rect(700, 160, 1220, 860), C.paperLight, 1);
        D.s(rect(700, 160, 1220, 860), { w: 4 });
        D.s(seals(700, 160, 1220, 860, 7), { w: 2, color: C.inkSoft, alpha: 0.75 });
        const hole = P0(g, 'M760 210L842 198L872 232L860 300L800 318L752 286Z', C.ink, 0);
        const rim = L0(g, 'M760 210L842 198L872 232L860 300L800 318L752 286Z', C.inkSoft, 3, 0);
        let cd = null;
        if (mode === 'candle') { cd = candle(g, 0, 0, 1); }
        const gd = BTL.glow(svg, defs, 0, 0, 220, C.gold, 0, g);
        return {
          update(lt, dur, cues) {
            D.reveal(BTL.ease(lt, 0, 1.6));
            pool.set(0.26 + 0.02 * Math.sin(lt * 0.7));
            if (!cd) return;
            const th = cue(cues, 'hole', 0.6), a = BTL.ease(lt, th, 1.0);
            hole.setAttribute('fill-opacity', (0.92 * a).toFixed(3)); rim.setAttribute('stroke-opacity', a.toFixed(3));
            const k = BTL.ease(lt, th + 0.4, Math.max(1.5, dur * 0.55)), cx = 900 + 420 * (1 - k), cy = 300 + 60 * (1 - k);
            cd.g.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)})`);
            cd.fl.update(lt, -10 - 10 * k, 1);
            gd.e.setAttribute('cx', f1(cx)); gd.e.setAttribute('cy', f1(cy - 40)); gd.set(0.35 * BTL.ease(lt, th, 1));
          },
        };
      }
      if (mode === 'flame') {
        P0(g, rect(-200, -200, 2120, 1800), C.paperLight, 1);
        let cracks = ''; for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28 + 0.3, x = 960 + Math.cos(a) * 420, y = 470 + Math.sin(a) * 300; cracks += `M${f1(x)} ${f1(y)}l${f1(Math.cos(a) * 90 + (r() - 0.5) * 40)} ${f1(Math.sin(a) * 70 + (r() - 0.5) * 40)}`; }
        L0(g, cracks, C.inkSoft, 2, 0.5);
        L0(g, seals(-100, -50, 2020, 900, 9, 160, 190), C.inkSoft, 2, 0.35);
        const hd = blob(960, 470, 400, 290, 3);
        P0(g, hd, C.ink, 0.94); L0(g, hd, C.inkSoft, 4);
        const gl = BTL.glow(svg, defs, 930, 470, 420, C.gold, 0.35, g);
        const c = candle(g, 930, 520, 1.6);
        return {
          update(lt) {
            const lean = 46 + 14 * Math.sin(lt * 0.9) + 6 * Math.sin(lt * 2.1);
            c.fl.update(lt, lean, 1.1);
            gl.set(0.3 + 0.05 * Math.sin(lt * 2.3));
          },
        };
      }
      if (mode === 'glint') {
        P0(g, rect(-200, -200, 2120, 1800), C.paperLight, 1);
        const hd = blob(960, 470, 800, 400, 5, 28);
        P0(g, hd, C.ink, 0.96); L0(g, hd, C.inkSoft, 4);
        const gl = BTL.glow(svg, defs, 980, 470, 600, C.gold, 0, g);
        // gold shapes in the dark: an animal-headed couch end, a wheel, a box edge, sparkles
        const gold = el(g, 'g', { opacity: 0 });
        L0(gold, 'M560 640L560 470C560 430 600 410 640 420C660 380 700 380 712 410C740 400 760 420 750 450L700 470L700 520L1180 520L1180 640M600 520L600 640M1140 520L1140 640', C.gold, 4);
        L0(gold, 'M630 420C610 380 620 350 650 340M712 410C730 372 760 360 790 368', C.gold, 3);
        L0(gold, BTL.E(1360, 520, 120, 120) + 'M1240 520L1480 520M1360 400L1360 640M1275 435L1445 605M1275 605L1445 435', C.gold, 3);
        L0(gold, rect(820, 380, 1080, 470) + 'M820 410L1080 410', C.gold, 3);
        const sp = [];
        for (let i = 0; i < 14; i++) { const x = 380 + r() * 1200, y = 280 + r() * 380, s = 8 + r() * 10; sp.push({ e: P0(g, `M${f1(x)} ${f1(y - s)}L${f1(x + s * 0.25)} ${f1(y)}L${f1(x)} ${f1(y + s)}L${f1(x - s * 0.25)} ${f1(y)}Z`, C.gold, 0), ph: r() * 6.28 }); }
        return {
          update(lt, dur, cues) {
            const h = cue(cues, 'hit', dur * 0.4), a = 0.35 * BTL.ease(lt, 0.4, 1.4) + 0.65 * BTL.ease(lt, h - 0.6, 1.2);
            fade(gold, 0.9 * a); gl.set(0.32 * a);
            for (const s of sp) s.e.setAttribute('fill-opacity', (a * (0.45 + 0.45 * Math.sin(lt * 1.2 + s.ph))).toFixed(3));
          },
        };
      }
      // corridor: one-point perspective, filled with stone chips that clear away
      const vx = 960, vy = 470;
      P0(g, rect(-200, -200, 2120, 1800), C.paperDark, 1);
      P0(g, 'M300 60L1620 60L1110 340L810 340Z', C.paper, 1);
      P0(g, 'M300 1800L1620 1800L1620 960L1110 610L810 610L300 960Z', C.paper, 1);
      L0(g, 'M300 60L810 340M1620 60L1110 340M300 960L810 610M1620 960L1110 610M300 60L300 960M1620 60L1620 960', C.inkSoft, 3);
      const pool = BTL.glow(svg, defs, vx, vy, 360, C.stain, 0.2, g);
      const D = BTL.drawing(g);
      D.f(rect(810, 340, 1110, 610), C.paperLight, 1); D.s(rect(810, 340, 1110, 610), { w: 3.5 });
      D.s(seals(810, 340, 1110, 610, 13, 54, 66), { w: 1.5, color: C.inkSoft, alpha: 0.8 });
      const chips = [];
      for (let i = 0; i < 220; i++) {
        const t = r(), u = r(), y = 960 - t * 350 - u * (620 - t * 360), xw = 660 - t * 510, x = vx + (r() - 0.5) * 2 * xw * (0.4 + 0.6 * (y - 300) / 660);
        chips.push({ e: P0(g, BTL.E(x, y, 22 - t * 14, 14 - t * 8), C.paperLight, 1, { stroke: C.inkSoft, 'stroke-width': 1.5 }), t });
      }
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0.2, 1.6));
          const h = cue(cues, 'hit', dur * 0.5), clr = BTL.ease(lt, 0.3, Math.max(1.5, h));
          for (const c of chips) fade(c.e, 1 - clamp01((clr - (1 - c.t) * 0.7) / 0.3));
          pool.set(0.18 + 0.12 * BTL.ease(lt, h, 1.4));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_valley
  function valley(g, svg, defs, o = {}) {
    const r = rng(1323);
    P0(g, 'M260 620L960 150L1680 620Z', C.paperDark, 0.6);
    L0(g, 'M260 620L960 150L1680 620', C.inkSoft, 2.5, 0.8);
    let left = 'M-200 220', right = 'M2120 260';
    for (let i = 0; i <= 12; i++) left += `L${f1(-200 + i * 70)} ${f1(220 + i * i * 3.3 + (r() - 0.5) * 30)}`;
    left += 'L660 760L-200 760Z';
    for (let i = 0; i <= 12; i++) right += `L${f1(2120 - i * 66)} ${f1(260 + i * i * 3.1 + (r() - 0.5) * 30)}`;
    right += 'L1300 760L2120 760Z';
    P0(g, left, C.paperDark, 1); L0(g, left, C.inkSoft, 3);
    P0(g, right, C.paperDark, 1); L0(g, right, C.inkSoft, 3);
    let str = ''; for (let y = 330; y < 740; y += 55) str += `M-160 ${y}L${f1(380 + (y - 300) * 0.45)} ${y + 8}M2080 ${y + 20}L${f1(1540 - (y - 300) * 0.4)} ${y + 26}`;
    L0(g, str, C.inkSoft, 1.5, 0.35);
    P0(g, rect(-200, 740, 2120, 1800), C.paper, 1);
    L0(g, 'M-200 745C400 735 1500 755 2120 742', C.inkSoft, 2.5);
    let pebbles = ''; for (let i = 0; i < 60; i++) { const x = r() * 1920, y = 770 + r() * 160; pebbles += BTL.E(x, y, 4 + r() * 6, 2 + r() * 3); }
    P0(g, pebbles, C.inkSoft, 0.35);
  }
  SH.bt_tut_valley = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'wide', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      let st = null, moon = null;
      if (mode === 'night') {
        st = BTL.stars(g, 120, 33, [0, 0, 1920, 520]);
        moon = el(g, 'g');
        P0(moon, BTL.E(1500, 150, 46, 46), C.paperLight, 1); L0(moon, BTL.E(1500, 150, 46, 46), C.ink, 3);
      }
      const sun = mode === 'night' ? null : BTL.glow(svg, defs, 960, 220, 520, C.stain, 0.22, g);
      if (mode !== 'huts') valley(g, svg, defs);
      const r = rng(77), figs = [], extra = el(g, 'g');
      let dst = null, stepGlow = null, step = null;
      if (mode === 'dig') {
        const heaps = [[340, 760, 190, 70], [1520, 770, 230, 86], [980, 790, 150, 50]];
        for (const [x, y, w, h] of heaps) { const d = `M${x - w} ${y}C${x - w * 0.5} ${y - h} ${x + w * 0.4} ${y - h * 1.05} ${x + w} ${y}Z`; P0(extra, d, C.paperDark, 1); L0(extra, d, C.inkSoft, 2.5); }
        for (let i = 0; i < 7; i++) {
          const pg = el(g, 'g'), x0 = 420 + i * 170, y = 800 + (i % 3) * 22, face = i % 2 ? 1 : -1;
          BTL.person(pg, i % 3 === 1 ? 'bend' : 'stand', 0, 0, 170, { face });
          P0(pg, BTL.E(0, -172, 28, 16), C.paperLight, 1, { stroke: C.inkSoft, 'stroke-width': 2 });
          figs.push({ pg, x0, y, sp: (8 + r() * 10) * face });
        }
        dst = dust(g, 26, 9, [200, 520, 1700, 820]);
      }
      if (mode === 'huts') {
        P0(g, 'M960 100L2120 40L2120 900L1100 900Z', C.paperDark, 1);
        L0(g, 'M960 100L2120 40M960 100L1100 900', C.inkSoft, 3);
        let str = ''; for (let y = 160; y < 860; y += 60) str += `M${f1(970 + (y - 100) * 0.17)} ${y}L2100 ${y - 30}`;
        L0(g, str, C.inkSoft, 1.5, 0.35);
        P0(g, rect(1370, 300, 1650, 640), C.ink, 0.9); L0(g, rect(1370, 300, 1650, 640) + 'M1340 300L1680 300', C.ink, 4);
        P0(g, 'M-200 700C300 640 900 600 1380 640L1700 900L-200 900Z', C.paper, 1);
        L0(g, 'M-200 700C300 640 900 600 1380 640L1700 900', C.inkSoft, 3);
        P0(g, rect(-200, 880, 2120, 1800), C.paper, 1);
        let ch = ''; for (let i = 0; i < 90; i++) { const x = r() * 1500, y = 690 + r() * 190 - x * 0.04; ch += BTL.E(x, y, 5 + r() * 7, 3 + r() * 3); }
        P0(g, ch, C.inkSoft, 0.4);
        const D = BTL.drawing(g);
        const huts = [[240, 700, 200, 90], [520, 680, 170, 80], [800, 660, 220, 96], [1080, 650, 160, 72]];
        for (const [x, y, w, h] of huts) {
          const d = `M${x} ${y}L${x} ${y - h}L${x + w * 0.5} ${y - h - 6}L${x + w * 0.55} ${y - h + 18}L${x + w} ${y - h + 10}L${x + w} ${y}`;
          D.f(d + 'Z', C.paperLight, 1); D.s(d, { w: 3.5 });
          let st2 = ''; for (let yy = y - h + 26; yy < y; yy += 24) for (let xx = x + 10 + ((yy / 24) % 2) * 18; xx < x + w - 20; xx += 40) st2 += `M${xx} ${yy}l26 0`;
          D.s(st2, { w: 2, color: C.inkSoft, alpha: 0.7 });
        }
        if (P.glow) { stepGlow = BTL.glow(svg, defs, 900, 740, 240, C.gold, 0, g); step = L0(g, 'M800 742L1000 742M820 772L1000 772', C.gold, 5, 0); }
        dst = dust(g, 18, 4, [300, 400, 1300, 700]);
        return {
          update(lt, dur, cues) {
            D.reveal(BTL.ease(lt, 0, 1.8)); dst.update(lt);
            if (step) { const a = BTL.ease(lt, cue(cues, 'hit', dur * 0.5), 1.6); stepGlow.set(0.4 * a); step.setAttribute('stroke-opacity', (0.9 * a).toFixed(3)); }
          },
        };
      }
      return {
        update(lt) {
          if (st) st.update(lt);
          if (sun) sun.set(0.2 + 0.03 * Math.sin(lt * 0.5));
          for (const f of figs) f.pg.setAttribute('transform', `translate(${f1(f.x0 + f.sp * lt)} ${f.y})`);
          if (dst) dst.update(lt);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_stairs (section)
  SH.bt_tut_stairs = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'down', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const GY = 250, X0 = 520, SW = 46, SR = 32, N = 16, r = rng(62);
      const sx = i => X0 + i * SW, sy = i => GY + i * SR;
      const XD = sx(N), YB = sy(N);
      // rock
      P0(g, rect(-200, GY, 2120, 1800), C.paperDark, 1);
      let str = ''; for (let y = GY + 70; y < 1060; y += 60 + r() * 30) str += `M-100 ${f1(y)}C600 ${f1(y + 16)} 1300 ${f1(y - 12)} 2020 ${f1(y + 6)}`;
      L0(g, str, C.inkSoft, 1.5, 0.3);
      // the cut (open stair well) and the passage beyond the door
      let cut = `M${X0} ${GY}`; for (let i = 0; i < N; i++) cut += `L${sx(i)} ${sy(i + 1)}L${sx(i + 1)} ${sy(i + 1)}`;
      cut += `L${XD} ${GY}Z`;
      P0(g, cut, C.paper, 1);
      const pass = P0(g, rect(XD + 34, YB - 230, 1820, YB), C.ink, mode === 'first' ? 0 : 0.88);
      // surface and huts on it
      L0(g, `M-200 ${GY}L${X0} ${GY}M${XD} ${GY}L2120 ${GY}`, C.inkSoft, 3);
      const huts = el(g, 'g');
      for (const [x, w] of [[180, 220], [1420, 260]]) { const d = `M${x} ${GY}L${x} ${GY - 80}L${x + w * 0.5} ${GY - 88}L${x + w} ${GY - 70}L${x + w} ${GY}`; P0(huts, d + 'Z', C.paperLight, 1); L0(huts, d, C.inkSoft, 3); }
      const sky = BTL.glow(svg, defs, 960, 120, 520, C.stain, 0.16, g);
      // steps outline (drawn), door
      let sp = `M${X0} ${GY}`; for (let i = 0; i < N; i++) sp += `L${sx(i)} ${sy(i + 1)}L${sx(i + 1)} ${sy(i + 1)}`;
      const steps = L0(g, sp, C.ink, 4); steps.setAttribute('pathLength', 1);
      const door = el(g, 'g');
      P0(door, rect(XD, YB - 260, XD + 34, YB), C.paperLight, 1); L0(door, rect(XD, YB - 260, XD + 34, YB), C.ink, 3.5);
      let sd = ''; for (let y = YB - 230; y < YB - 10; y += 34) sd += BTL.E(XD + 17, y, 8, 11);
      L0(door, sd, C.inkSoft, 1.6, 0.9);
      L0(door, `M${XD - 10} ${YB - 262}L${XD + 50} ${YB - 262}`, C.ink, 4);
      const cart = el(g, 'g', { opacity: 0 });
      P0(cart, BTL.E(XD + 17, YB - 90, 15, 62), C.gold, 1); L0(cart, BTL.E(XD + 17, YB - 90, 15, 62), C.ink, 2.5); L0(cart, BTL.E(XD + 17, YB - 90, 30, 80), C.gold, 4);
      const cg = BTL.glow(svg, defs, XD + 17, YB - 90, 280, C.gold, 0, g);
      const lab = label(g, 'Tutankamon', XD + 80, YB - 70, 64, { font: LO, italic: true, anchor: 'start', color: C.gold });
      // fill (debris) over the steps beyond step k
      const fill = P0(g, '', C.stain, 0.55); const fillL = L0(g, '', C.inkSoft, 2, 0.8);
      const fillD = k => {
        const i0 = Math.floor(k), fx = sx(Math.min(N, k));
        let d = `M${f1(fx)} ${GY}L${f1(fx)} ${f1(sy(Math.min(N, i0 + 1)))}`;
        for (let i = i0 + 1; i < N; i++) d += `L${sx(i)} ${sy(i)}L${sx(i)} ${sy(i + 1)}`;
        d += `L${XD} ${YB}L${XD} ${GY}Z`;
        return d;
      };
      const tg = BTL.glow(svg, defs, sx(0) + 30, sy(1), 200, C.gold, 0, g);
      const top = L0(g, `M${sx(0)} ${GY}L${sx(0)} ${sy(1)}L${sx(1) + 10} ${sy(1)}`, C.gold, 9, 0);
      return {
        update(lt, dur, cues) {
          const h = cue(cues, 'hit', dur * 0.5);
          sky.set(0.15 + 0.02 * Math.sin(lt * 0.6));
          let k;
          if (mode === 'first') k = 0.9 + 0.1 * BTL.ease(lt, 0.3, 1.5);
          else if (mode === 'down') k = 1 + 11 * BTL.ease(lt, 0.4, Math.max(2, dur * 0.75));
          else if (mode === 'full') k = 16;
          else k = 12 - 12 * BTL.ease(lt, h, Math.max(2, dur - h - 0.5));
          draw(steps, mode === 'first' ? 0.06 + 0.02 * BTL.ease(lt, 0.3, 1.5) : Math.min(1, (k + 0.5) / N));
          if (k >= N - 0.01) { fill.setAttribute('d', ''); fillL.setAttribute('d', ''); }
          else { const d = fillD(k); fill.setAttribute('d', d); fillL.setAttribute('d', d); }
          const ta = mode === 'first' ? BTL.ease(lt, Math.min(h - 0.6, 0.8), 0.8) : 0; top.setAttribute('stroke-opacity', (0.95 * ta).toFixed(3)); tg.set(0.45 * ta);
          fade(door, mode === 'first' ? 0 : 1);
          if (mode === 'full') { const a = BTL.ease(lt, Math.min(h, dur * 0.5), 1.0); fade(cart, a); cg.set(0.45 * a); fade(lab, a); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_seal
  SH.bt_tut_seal = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 640 : 470;
      const pool = BTL.glow(svg, defs, cx, cy, 560, C.stain, 0.28, g);
      const D = BTL.drawing(el(g, 'g', { transform: `translate(${cx} ${cy})` }));
      D.f(blob(0, 0, 360, 340, 8, 30), C.paperLight, 1);
      D.s(blob(0, 0, 360, 340, 8, 30), { w: 2.5, color: C.inkSoft });
      D.s(BTL.E(0, 0, 200, 300), { w: 5 }); D.s(BTL.E(0, 0, 184, 284), { w: 2, color: C.inkSoft });
      // the jackal lying on top
      D.f('M-120-150C-120-176-60-182 20-176L70-180L84-222L96-188L108-226L116-184C150-176 158-150 136-140L90-140L-100-138C-130-136-150-146-160-160C-150-150-128-146-120-150Z', C.ink, 0.85);
      D.s('M-118-140L-118-126M80-140L80-126', { w: 3 });
      // nine bound captives in three rows
      let cap = '';
      for (let row = 0; row < 3; row++) for (let i = 0; i < 3; i++) {
        const x = -96 + i * 96, y = -40 + row * 106;
        cap += BTL.E(x, y - 30, 11, 11) + `M${x} ${y - 19}C${x - 4} ${y} ${x - 4} ${y + 22} ${x + 8} ${y + 34}L${x - 22} ${y + 36}M${x - 2} ${y - 6}C${x + 14} ${y + 2} ${x + 18} ${y + 12} ${x + 10} ${y + 20}`;
      }
      D.s(cap, { w: 3.5 });
      const lab = label(g, 'krallar mezarlığının mührü', cx, cy + (portrait ? 470 : 420), 44, { font: LO, italic: true, color: C.inkSoft });
      return {
        update(lt, dur) {
          D.reveal(BTL.ease(lt, 0, 2.4)); fade(lab, BTL.ease(lt, 1.6, 1.2));
          pool.e.setAttribute('cx', f1(cx - 120 + 240 * clamp01(lt / Math.max(1, dur)))); pool.set(0.26);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_cartouche
  SH.bt_tut_cartouche = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 620 : 450, mode = P.mode || 'name';
      const pool = BTL.glow(svg, defs, cx, cy, 520, C.stain, 0.22, g);
      const G = el(g, 'g', { transform: `translate(${cx} ${cy})` });
      const D = BTL.drawing(G);
      const ring = 'M-120-250C-120-300 120-300 120-250L120 250C120 300-120 300-120 250Z';
      D.f(ring, C.paperLight, 1); D.s(ring, { w: 5 }); D.s('M-150 316L150 316M-120 300L-150 316M120 300L150 316', { w: 5 });
      const signs = [];
      const sg = (d, fill) => { const e = el(G, 'g'); if (fill) P0(e, d, C.gold, 0.85); L0(e, d, C.ink, 3.5); signs.push(e); };
      sg('M-80-230L80-230L80-196L-80-196ZM-60-230L-60-196M-30-230L-30-196M0-230L0-196M30-230L30-196M60-230L60-196', true);   // board
      sg('M-80-160L-60-176L-40-160L-20-176L0-160L20-176L40-160L60-176L80-160');                                              // water
      sg('M-40-60C-40-110 40-110 40-60Z', true);                                                                           // loaf
      sg('M0-40L0 80M-44-6L44-6M0-40C-30-46-34-90 0-96C34-90 30-46 0-40', true);                                              // ankh
      sg('M-20 210L-20 110C-20 90 20 90 22 112', false);                                                                    // crook
      sg('M30 220L30 120M18 120L42 120M18 220L42 220', false);
      for (const e of signs) fade(e, 0);
      const lab = label(g, P.label || 'Tutankamon', cx, cy + (portrait ? 430 : 410), 60, { font: LO, italic: true });
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6));
          const h = cue(cues, 'hit', mode === 'erase' ? dur * 0.35 : dur * 0.5);
          signs.forEach((e, i) => {
            const on = BTL.ease(lt, 0.8 + i * 0.25, 0.9);
            const off = mode === 'erase' ? BTL.ease(lt, h + i * 0.45, 1.2) : 0;
            fade(e, on * (1 - off));
          });
          fade(lab, mode === 'erase' ? BTL.ease(lt, 0.5, 1) * (1 - BTL.ease(lt, h + 2.4, 1.2)) : BTL.ease(lt, h, 1.2));
          pool.set(0.2 + 0.03 * Math.sin(lt * 0.7));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_door
  SH.bt_tut_door = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'resealed', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      P0(g, rect(-200, -200, 2120, 1800), C.paperDark, 1);
      P0(g, rect(-200, 860, 2120, 1800), C.paper, 1);
      L0(g, 'M-50 860L1970 860', C.inkSoft, 2.5, 0.8);
      if (mode === 'resealed') {
        const pool = BTL.glow(svg, defs, 960, 500, 640, C.stain, 0.28, g);
        const D = BTL.drawing(g);
        D.f(rect(660, 110, 1260, 860), C.paperLight, 1); D.s(rect(660, 110, 1260, 860), { w: 4 });
        D.s(seals(660, 110, 1260, 860, 21), { w: 2, color: C.inkSoft, alpha: 0.7 });
        const patch = el(g, 'g', { opacity: 0 });
        const pd = 'M664 114L1000 114L1010 200L960 300L860 350L740 380L664 400Z';
        P0(patch, pd, C.paper, 1);
        let ps = ''; for (const [x, y] of [[720, 170], [810, 160], [900, 170], [760, 260], [850, 250], [720, 340]]) ps += BTL.E(x, y, 30, 22) + `M${x - 14} ${y}L${x + 14} ${y}`;
        L0(patch, ps, C.ink, 2.5, 0.8);
        L0(patch, pd, C.red, 5);
        return {
          update(lt, dur, cues) {
            D.reveal(BTL.ease(lt, 0, 1.6)); pool.set(0.26 + 0.02 * Math.sin(lt * 0.7));
            fade(patch, BTL.ease(lt, cue(cues, 'hit', dur * 0.45), 1.4));
          },
        };
      }
      // guards
      const pool = BTL.glow(svg, defs, 520, 640, 900, C.stain, 0.3, g);
      const D = BTL.drawing(g);
      D.f(rect(820, 240, 1100, 860), C.paperLight, 1); D.s(rect(820, 240, 1100, 860), { w: 4 });
      D.s(seals(820, 240, 1100, 860, 31, 62, 78), { w: 1.8, color: C.inkSoft, alpha: 0.7 });
      const statue = (x, face) => {
        const s = face;
        const body = `M${x - 44} 300C${x - 92} 304 ${x - 104} 360 ${x - 96} 400L${x - 70} 400L${x - 62} 560L${x - 74} 790L${x - 30} 790L${x - 10} 610L${x + 10} 610L${x + 30} 790L${x + 74} 790L${x + 62} 560L${x + 70} 400L${x + 96} 400C${x + 104} 360 ${x + 92} 304 ${x + 44} 300C${x + 40} 230 ${x - 40} 230 ${x - 44} 300Z`;
        D.f(body, C.ink, 0.95);
        D.f(`M${x - 66} 560L${x + 66} 560L${x + 82} 660L${x - 82} 660Z`, C.gold, 0.9);
        D.f(`M${x - 80} 300L${x + 80} 300L${x + 60} 250C${x + 40} 214 ${x - 40} 214 ${x - 60} 250Z`, C.gold, 0.85);
        D.s(`M${x + s * 120} 360L${x + s * 120} 800`, { w: 6, color: C.gold });
        D.s(`M${x + s * 96} 400L${x + s * 120} 420`, { w: 8, color: C.ink });
        D.f(rect(x - 110, 790, x + 110, 840), C.paperDark, 1); D.s(rect(x - 110, 790, x + 110, 840), { w: 3, color: C.inkSoft });
      };
      statue(640, -1); statue(1280, 1);
      const c = candleStand(g, 220, 640, 0.9);
      return {
        update(lt) { D.reveal(BTL.ease(lt, 0, 2)); c.fl.update(lt, 4, 1); pool.set(0.28 + 0.03 * Math.sin(lt * 2.1)); },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_room (antechamber in candle light)
  SH.bt_tut_room = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'first', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 500 });
      P0(g, rect(-200, -200, 2120, 1800), C.paperLight, 1);
      const hd = blob(960, 480, 880, 420, 17, 30);
      P0(g, hd, C.ink, 0.95); L0(g, hd, C.inkSoft, 4);
      const gl = BTL.glow(svg, defs, 640, 600, 760, C.gold, 0.22, g);
      const grp = (d, w = 3.5) => { const e = el(g, 'g', { opacity: 0 }); L0(e, d, C.gold, w); return e; };
      const couch = el(g, 'g', { opacity: 0 });
      P0(couch, 'M330 600L1010 600L1010 640L330 640Z', C.gold, 0.3);
      L0(couch, 'M330 640L330 600L1010 600L1010 640L330 640M360 640L340 760M980 640L1000 760M350 760L330 760M990 760L1010 760', C.gold, 4);
      L0(couch, 'M330 600L310 420C300 380 330 350 360 360C350 320 370 296 400 300C430 290 440 320 430 350C470 350 480 390 450 410L400 430L380 600', C.gold, 4);
      L0(couch, BTL.E(385, 395, 12, 9) + 'M380 300C360 260 370 240 392 232M420 300C440 262 432 240 410 230', C.gold, 3);
      L0(couch, 'M1010 600C1050 590 1060 560 1040 540', C.gold, 3);
      const wheels = grp(BTL.E(1360, 560, 130, 130) + BTL.E(1360, 560, 18, 18) + 'M1360 430L1360 690M1247 495L1473 625M1247 625L1473 495' +
        BTL.E(1560, 600, 110, 110) + BTL.E(1560, 600, 15, 15) + 'M1560 490L1560 710M1465 545L1655 655M1465 655L1655 545');
      const boxes = grp(rect(760, 430, 980, 560) + 'M760 460L980 460' + rect(800, 330, 960, 430) + 'M800 356L960 356' + rect(1020, 470, 1180, 590) + 'M1020 500L1180 500');
      const r = rng(26), sp = [];
      for (let i = 0; i < 16; i++) { const x = 300 + r() * 1350, y = 250 + r() * 420, s = 7 + r() * 9; sp.push({ e: P0(g, `M${f1(x)} ${f1(y - s)}L${f1(x + s * 0.25)} ${f1(y)}L${f1(x)} ${f1(y + s)}L${f1(x - s * 0.25)} ${f1(y)}Z`, C.gold, 0), ph: r() * 6.28 }); }
      const c = candleStand(g, 170, 700, 0.8);
      return {
        update(lt, dur, cues) {
          fade(couch, 0.95 * BTL.ease(lt, 0.4, 2.4));
          const a = mode === 'all' ? BTL.ease(lt, cue(cues, 'a', 0.6), 1.4) : 0;
          const b = mode === 'all' ? BTL.ease(lt, cue(cues, 'b', 1.6), 1.4) : 0;
          const h = mode === 'all' ? BTL.ease(lt, cue(cues, 'hit', dur * 0.7), 1.6) : 0.3 * BTL.ease(lt, 1.5, 2);
          fade(wheels, 0.9 * a); fade(boxes, 0.9 * b);
          for (const s of sp) s.e.setAttribute('fill-opacity', (h * (0.45 + 0.45 * Math.sin(lt * 1.1 + s.ph))).toFixed(3));
          gl.set(0.2 + 0.04 * Math.sin(lt * 2.2) + 0.1 * h);
          c.fl.update(lt, 6, 1);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_hourglass
  SH.bt_tut_hourglass = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 620 : 450;
      const pool = BTL.glow(svg, defs, cx, cy, 520, C.stain, 0.25, g);
      const G = el(g, 'g', { transform: `translate(${cx} ${cy})` });
      const D = BTL.drawing(G);
      const glass = 'M-130-290C-130-150-20-60-14 0C-20 60-130 150-130 290L130 290C130 150 20 60 14 0C20-60 130-150 130-290Z';
      D.f(glass, C.paperLight, 0.9);
      const sandTop = P0(G, '', C.stain, 0.9), sandBot = P0(G, '', C.stain, 0.9), stream = L0(G, '', C.stain, 4, 0.9);
      D.s(glass, { w: 4 });
      D.f(rect(-170, -330, 170, -290), C.paperDark, 1); D.s(rect(-170, -330, 170, -290), { w: 4 });
      D.f(rect(-170, 290, 170, 330), C.paperDark, 1); D.s(rect(-170, 290, 170, 330), { w: 4 });
      D.s('M-150-290L-150 290M150-290L150 290', { w: 5, color: C.inkSoft });
      const lab = P.label ? label(g, P.label, cx, cy + (portrait ? 470 : 420), 50, { font: LO, italic: true, color: C.inkSoft }) : null;
      const halfW = y => { const t = Math.abs(y) / 290; return 14 + 116 * Math.pow(t, 0.8); };
      return {
        update(lt, dur) {
          D.reveal(BTL.ease(lt, 0, 1.4)); if (lab) fade(lab, BTL.ease(lt, 1.2, 1));
          const k = 0.35 + 0.5 * clamp01(lt / Math.max(1, dur));
          const yt = -20 - (1 - k) * 220;   // top sand surface
          let d = `M${f1(-halfW(yt))} ${f1(yt)}L${f1(halfW(yt))} ${f1(yt)}`;
          for (let y = yt; y <= -8; y += 12) d += `L${f1(halfW(y))} ${f1(y)}`;
          for (let y = -8; y >= yt; y -= 12) d += `L${f1(-halfW(y))} ${f1(y)}`;
          sandTop.setAttribute('d', d + 'Z');
          const hb = 30 + k * 180, yb = 286 - hb;
          sandBot.setAttribute('d', `M${f1(-halfW(286))} 286L${f1(halfW(286))} 286L${f1(halfW(yb + hb * 0.5) * 0.98)} ${f1(yb + hb * 0.4)}L0 ${f1(yb)}L${f1(-halfW(yb + hb * 0.5) * 0.98)} ${f1(yb + hb * 0.4)}Z`);
          stream.setAttribute('d', `M0 -6L0 ${f1(yb)}`);
          pool.set(0.24 + 0.02 * Math.sin(lt * 0.6));
        },
      };
    },
  };
})();
// same builders under their own names (different compositions: breach close-ups, coffins, spoil section)
(() => { const SH = window.SHOTS; SH.bt_tut_breach = { kind: '2d', build: a => SH.bt_tut_hole.build(a) }; })();

// bt_tut_nile: a plain map of Egypt: the Mediterranean and Red Sea coasts, the Nile in blue with its delta; one place
// lights up in gold.  P: {place: "luksor"|"kahire"}  cues: hit
(() => {
  const SH = window.SHOTS, C = THEME_PARCHMENT, { P0, L0, label, fade, f1 } = window.TUTL, LO = BTL.LO;
  const X = lon => 980 + (lon - 31.8) * 118, Y = lat => 150 + (31.6 - lat) * 86;
  const pts = a => 'M' + a.map(([lo, la]) => f1(X(lo)) + ' ' + f1(Y(la))).join('L');
  const MED = [[24, 33.5], [24, 31.6], [25.2, 31.55], [27.2, 31.35], [29.9, 31.2], [30.4, 31.45], [31.0, 31.6], [31.8, 31.42], [32.3, 31.26], [33.2, 31.1], [34.4, 31.5], [34.8, 32.1], [35.1, 33.0], [35.2, 33.5]];
  const RED = [[32.55, 29.97], [32.7, 29.8], [33.2, 28.6], [34.25, 27.73], [34.6, 28.0], [35.0, 29.5], [35.1, 28.0], [36.5, 26.0], [38.5, 24.0], [40, 21.5], [36.6, 21.5], [35.5, 23.9], [34.9, 25.07], [33.8, 27.25], [32.6, 29.0]];
  const NILE = [[32.9, 24.1], [32.75, 25.0], [32.64, 25.7], [32.72, 26.16], [32.24, 26.05], [31.7, 26.6], [31.18, 27.18], [30.75, 28.1], [31.1, 29.07], [31.23, 30.04]];
  const DELTA = [[[31.23, 30.04], [30.8, 30.8], [30.4, 31.45]], [[31.23, 30.04], [31.5, 30.8], [31.8, 31.42]]];
  const PL = { luksor: { lon: 32.6, lat: 25.74, label: 'Krallar Vadisi', sub: 'Luksor', anchor: 'end' }, kahire: { lon: 31.23, lat: 30.04, label: 'Kahire', sub: '', anchor: 'end' } };
  SH.bt_tut_nile = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 1000, fy: 520 });
      P0(g, `M-200 -200L2120 -200L2120 1800L-200 1800Z`, C.paperLight, 1);
      const med = pts(MED) + 'L2120 -200L-200 -200Z', red = pts(RED) + 'Z';
      P0(g, pts(MED) + 'L1500 -200L-200 -200L-200 ' + f1(Y(31.6)) + 'Z', C.paper, 1);
      P0(g, red, C.paper, 1);
      L0(g, pts(MED), C.inkSoft, 2.5); L0(g, red, C.inkSoft, 2.5);
      const r = rng(31); let st = '';
      for (let i = 0; i < 160; i++) { const x = r() * 1900, y = 220 + r() * 820; st += BTL.E(x, y, 2, 2); }
      P0(g, st, C.stain, 0.35);
      const nile = L0(g, pts(NILE), C.blue, 5); nile.setAttribute('pathLength', 1);
      const del = DELTA.map(d => { const e = L0(g, pts(d), C.blue, 3.5); e.setAttribute('pathLength', 1); return e; });
      const nl = label(g, 'Nil', X(31.0) - 50, Y(27.4), 48, { font: LO, italic: true, color: C.blue, anchor: 'end' });
      const sea = label(g, 'Akdeniz', X(28.0), Y(32.3), 46, { font: LO, italic: true, color: C.inkSoft });
      const p = PL[P.place || 'luksor'], px = X(p.lon), py = Y(p.lat);
      const gl = BTL.glow(svg, defs, px, py, 200, C.gold, 0, g);
      const ring = el(g, 'circle', { cx: px, cy: py, r: 20, fill: 'none', stroke: C.gold, 'stroke-width': 3, opacity: 0 });
      const dot = el(g, 'circle', { cx: px, cy: py, r: 10, fill: C.gold, opacity: 0 });
      const lab = label(g, p.label, px - 40, py + 16, 58, { anchor: 'end' });
      const sub = p.sub ? label(g, p.sub, px - 40, py + 74, 44, { font: LO, italic: true, color: C.inkSoft, anchor: 'end' }) : null;
      return {
        update(lt, dur, cues) {
          draw(nile, BTL.ease(lt, 0, 2.2)); del.forEach(e => draw(e, BTL.ease(lt, 1.6, 1.2)));
          fade(nl, BTL.ease(lt, 1.2, 1)); fade(sea, BTL.ease(lt, 0.4, 1));
          const h = BTL.ease(lt, Math.min(cue(cues, 'hit', dur * 0.5), dur * 0.6), 1);
          fade(dot, h); fade(lab, h); if (sub) fade(sub, h);
          fade(ring, h * (0.5 + 0.5 * Math.sin(lt * 1.6))); ring.setAttribute('r', f1(20 + 6 * Math.sin(lt * 1.6)));
          gl.set(0.35 * h);
        },
      };
    },
  };
})();

// bt_tut_plans: two ground plans side by side: a long royal tomb (corridors, halls, pillared burial hall) and the small
// KV62 (stair, corridor, four rooms), which turns gold on "hit".  cues: hit
(() => {
  const SH = window.SHOTS, C = THEME_PARCHMENT, { P0, L0, label, fade, f1, rect } = window.TUTL, LO = BTL.LO;
  SH.bt_tut_plans = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 480 });
      const pool = BTL.glow(svg, defs, 1400, 500, 420, C.gold, 0, g);
      BTL.glow(svg, defs, 960, 470, 760, C.stain, 0.18, g);
      const A = BTL.drawing(g), B = BTL.drawing(g);
      // royal tomb: a long straight axis down to a pillared hall (left)
      let big = rect(170, 200, 230, 260);
      for (let i = 0; i < 6; i++) big += rect(184, 260 + i * 70, 216, 320 + i * 70);
      big += rect(130, 680, 270, 760) + rect(110, 760, 290, 880);
      let pil = ''; for (const x of [150, 200, 250]) for (const y of [790, 840]) pil += rect(x - 8, y - 8, x + 8, y + 8);
      A.f(big, C.ink, 0.12); A.s(big, { w: 3 }); A.s(pil, { w: 2, color: C.inkSoft });
      // KV62 (right), drawn larger: stair, corridor, antechamber, annex, burial chamber, treasury
      const T = (x, y) => `${x + 1240} ${y + 330}`;
      const kv = `M${T(0, 0)}L${T(40, 0)}L${T(40, 120)}L${T(0, 120)}Z` + `M${T(4, 120)}L${T(36, 120)}L${T(36, 190)}L${T(4, 190)}Z` +
        `M${T(-60, 190)}L${T(200, 190)}L${T(200, 290)}L${T(-60, 290)}Z` + `M${T(-60, 290)}L${T(20, 290)}L${T(20, 350)}L${T(-60, 350)}Z` +
        `M${T(200, 170)}L${T(330, 170)}L${T(330, 300)}L${T(200, 300)}Z` + `M${T(330, 190)}L${T(420, 190)}L${T(420, 280)}L${T(330, 280)}Z`;
      B.f(kv, C.ink, 0.12); B.s(kv, { w: 3.5 });
      const kvg = P0(g, kv, C.gold, 0);
      const la = label(g, 'büyük kraliyet mezarı', 200, 960 - 20 - 20 - 20 + 0, 44, { font: LO, italic: true, color: C.inkSoft, anchor: 'start' });
      la.setAttribute('x', 330); la.setAttribute('y', 520);
      const lb = label(g, 'Tutankamon', 1420, 760, 56, { font: LO, italic: true });
      return {
        update(lt, dur, cues) {
          A.reveal(BTL.ease(lt, 0, 2)); B.reveal(BTL.ease(lt, 0.8, 1.8));
          fade(la, BTL.ease(lt, 1, 1)); fade(lb, BTL.ease(lt, 1.8, 1));
          const h = BTL.ease(lt, Math.min(cue(cues, 'hit', dur * 0.6), dur * 0.7), 1.2);
          kvg.setAttribute('fill-opacity', (0.55 * h).toFixed(3)); pool.set(0.3 * h);
        },
      };
    },
  };
})();
