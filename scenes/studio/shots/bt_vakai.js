// bt_vakai: the Auspicious Incident (Vaka-i Hayriye, June 1826), the end of the Janissary corps, belgesel style
// (docs/BELGESEL.md). Still line art in the theme's tokens; the only motion is slow and natural (steam, flames, smoke,
// a slow march, light). Places are drawn on the 1920x1080 stage (BTL.stage frames them for a Short).
// Shared kit for bt_vakai_b.js too: window.VHL (kettle, flame, smoke, skyline, P0, L0, label, fade).
//   bt_vh_city   P: {mode: "night"|"smoke"|"torches"}  cues: hit   (torches: on "hit" the torch lights spread out over the city) Istanbul's old city skyline over the water at night (domes,
//                minarets, a few lit windows); night: torch light gathers in the middle; smoke: a dark smoke column
//                rises from the middle of the city, fire glow under it (stronger on "hit")
//   bt_vh_kazan  P: {mode: "row"|"out"|"one"|"tip"|"fallen", labels: [{text, at, x, y}], cold}  cues: hit
//                row: a night square before a long barracks wall, five copper kettles; on "hit" they tip one by one
//                out: the same square; the kettles are carried out one after another and stand still
//                one: one big kettle over a low fire, steam (+ labels on cues). tip: the same; on "hit" it tips over
//                fallen: the kettle lies on its side, the spill on the ground, the last steam (cold: no steam, no fire)
//   bt_vh_bork   P: {mode: "one"|"many"|"fez", label}  cues: hit   one: the Janissary felt cap with the spoon at the
//                front; on "hit" the spoon turns gold. many: a row of seven caps, on "hit" one turns gold (+ label).
//                fez: the cap fades back on the left, a plain fez draws itself on the right
//   bt_vh_saray  P: {mode: "window"|"gate"|"roof"}  cues: hit   the palace at night (walls, domes, cone chimneys).
//                window: one lit window with a standing figure. gate: the two-towered gate; its light dies on "hit"
//                (raid: true: instead, on "hit" torch-bearing silhouettes close in on the gate from both sides).
//                roof: a small figure crosses the roofline slowly from left to right
//   bt_vh_throne P: {mode: "lit"|"fade"}   an empty throne on a dais under a beam of light; fade: the light goes out
//   bt_vh_dukkan P: {}                     a small shop at dusk: awning, counter with pots, a seated figure, a lamp
//   bt_vh_drill  P: {n, hat: "cap"|"fez", label}  cues: hit  a straight row of soldier silhouettes with muskets on the
//                shoulder; they draw in one by one and move slowly forward (+ label above on "hit")
//   bt_vh_tree   P: {mode: "fall"|"one"}  cues: m, hit   the dynasty: a long chain of ancestors, three last princes
//                (Selim, Mustafa, Mahmud). fall: Selim dark, Mustafa goes dark on "m". one: only Mahmud is left, on
//                "hit" he and the whole chain above him turn gold
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const f1 = v => v.toFixed(1);
  const fade = (e, a) => e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (parent, d, fill, a = 1, extra = {}) => el(parent, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, extra));
  const L0 = (parent, d, stroke, w = 3, a = 1) => el(parent, 'path', { d, fill: 'none', stroke, 'stroke-width': w, 'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));

  // ------------------------------------------------------------------ shared pieces
  // a flame: three nested tongues whose heights breathe smoothly (no jitter); origin = base centre
  function flame(parent, x, y, s = 1, ph0 = 0) {
    const g = el(parent, 'g');
    const fl = [[C.red, 1, 0], [C.gold, 0.7, 1.3], [C.ink, 0.38, 2.1]].map(([col, k, ph]) => ({ e: P0(g, '', col, 0.92), k, ph: ph + ph0 }));
    return {
      g,
      update(lt, amp = 1) {
        for (const f of fl) {
          const h = (120 + 14 * Math.sin(lt * 2.1 + f.ph) + 8 * Math.sin(lt * 3.3 + f.ph * 2)) * f.k * s * amp, w = 46 * f.k * s * Math.max(0.3, amp), lean = 6 * Math.sin(lt * 1.1 + f.ph) * s;
          f.e.setAttribute('d', `M${f1(x - w)} ${y}C${f1(x - w)} ${f1(y - h * 0.45)} ${f1(x - w * 0.2 + lean)} ${f1(y - h * 0.7)} ${f1(x + lean)} ${f1(y - h)}C${f1(x + w * 0.2 + lean)} ${f1(y - h * 0.7)} ${f1(x + w)} ${f1(y - h * 0.45)} ${f1(x + w)} ${y}Z`);
        }
      },
    };
  }
  // rising smoke: soft puffs that rise, widen and thin out; deterministic
  let smokeId = 0;
  function smoke(parent, x, y, o = {}) {
    const n = o.n || 9, hgt = o.h || 520, g = el(parent, 'g'), list = [];
    let fill = o.color || C.inkSoft;
    if (o.defs) {   // soft puffs: a radial gradient instead of a flat disc
      const id = 'vhsm' + (++smokeId), rg = el(o.defs, 'radialGradient', { id });
      el(rg, 'stop', { offset: '0', 'stop-color': fill, 'stop-opacity': 1 });
      el(rg, 'stop', { offset: '0.55', 'stop-color': fill, 'stop-opacity': 0.5 });
      el(rg, 'stop', { offset: '1', 'stop-color': fill, 'stop-opacity': 0 });
      fill = `url(#${id})`;
    }
    for (let i = 0; i < n; i++) list.push({ e: el(g, 'circle', { cx: x, cy: y, r: 10, fill, 'fill-opacity': 0 }), i });
    return {
      g,
      update(lt, amp = 1) {
        for (const p of list) {
          const ph = ((lt * (o.sp || 0.07) + p.i / n) % 1), r = (o.r0 || 40) + ph * (o.r1 || 150);
          p.e.setAttribute('cx', f1(x + ph * (o.drift ?? 160) + 20 * Math.sin(p.i * 2.3)));
          p.e.setAttribute('cy', f1(y - ph * hgt));
          p.e.setAttribute('r', f1(r));
          p.e.setAttribute('fill-opacity', (Math.sin(ph * Math.PI) * (o.a || 0.2) * amp).toFixed(3));
        }
      },
    };
  }
  // steam threads over a pot
  function steam(parent, x, y, n = 3, w = 110) {
    const list = [];
    for (let i = 0; i < n; i++) list.push(L0(parent, '', C.inkSoft, 3, 0));
    return {
      update(lt, amp = 1) {
        list.forEach((e, i) => {
          const ph = ((lt * 0.2 + i / n) % 1), xx = x + (i - (n - 1) / 2) * w / Math.max(1, n - 1), yy = y - ph * 170, sw = 14 * Math.sin(lt * 0.8 + i * 2);
          e.setAttribute('d', `M${f1(xx)} ${f1(yy)}C${f1(xx + sw)} ${f1(yy - 30)} ${f1(xx - sw)} ${f1(yy - 60)} ${f1(xx + sw * 0.5)} ${f1(yy - 100)}`);
          e.setAttribute('stroke-opacity', (Math.sin(ph * Math.PI) * 0.55 * amp).toFixed(3));
        });
      },
    };
  }

  // the Janissary kettle (origin = bottom centre, ~400 wide, ~300 tall): a round-bellied copper cauldron with a broad
  // rim, two ring handles and two bands; drawn into a BTL.drawing
  const KET = {
    body: 'M-170-262C-205-190-205-80-130-16C-90 6 90 6 130-16C205-80 205-190 170-262Z',
    rim: 'M-196-286L196-286C204-286 206-262 196-262L-196-262C-206-262-204-286-196-286Z',
    bands: 'M-192-200C-60-186 60-186 192-200M-178-110C-60-96 60-96 178-110',
    handles: BTL.E(-212, -214, 30, 34) + BTL.E(212, -214, 30, 34),
    shine: 'M-130-230C-160-170-158-100-118-50',
    feet: 'M-90 0L-100 14M90 0L100 14M0 6L0 18',
  };
  function kettle(D, o = {}) {
    D.f(KET.body, C.paperLight, 1);
    D.f(KET.rim, C.paperLight, 1);
    D.f('M-150-250C-120-240 120-240 150-250C140-180 120-120 90-80C40-60-40-60-90-80C-120-120-140-180-150-250Z', C.stain, 0.12);
    D.s(KET.body, { w: 4 });
    D.s(KET.rim, { w: 4 });
    D.s(KET.handles, { w: 4, color: o.gold ? C.gold : C.ink });
    D.s(KET.bands, { w: 2.5, color: o.gold ? C.gold : C.inkSoft });
    D.s(KET.shine, { w: 3, color: C.inkSoft, alpha: 0.7 });
    D.s(KET.feet, { w: 4 });
    if (o.open) {   // the opening seen from above / tipped towards us: dark mouth inside the rim
      const m = BTL.E(0, -276, 176, o.open);
      D.f(m, C.paperDark, 1); D.s(m, { w: 3.5 });
      D.s(`M-150 ${-276 + o.open * 0.45}C-80 ${-276 + o.open * 0.9} 80 ${-276 + o.open * 0.9} 150 ${-276 + o.open * 0.45}`, { w: 2, color: o.gold ? C.gold : C.inkSoft, alpha: 0.8 });
    }
  }
  // the old city skyline: domes and minarets (origin: waterline y = 0, x 0..1920)
  function skyline() {
    let body = 'M-60 0L-60-60', mins = '';
    const r = rng(1826);
    const dome = (x, w, h, base) => { body += `L${x - w} ${-base}C${x - w} ${-base - h * 1.1} ${x + w} ${-base - h * 1.1} ${x + w} ${-base}`; };
    let x = -60;
    const domes = [[220, 46, 40, 70], [430, 70, 58, 96], [700, 96, 84, 120], [1010, 120, 104, 130], [1300, 84, 74, 112], [1560, 60, 50, 90], [1780, 44, 36, 70]];
    for (const [cx, w, h, base] of domes) {
      body += `L${x} ${-40 - r() * 20}L${cx - w - 40} ${-50 - r() * 30}L${cx - w - 40} ${-base}`;
      dome(cx, w, h, base); body += `L${cx + w + 40} ${-base}L${cx + w + 40} ${-50 - r() * 20}`;
      x = cx + w + 40;
      for (const dx of [-w - 30, w + 30]) {
        const mx = cx + dx, top = base + h + 60 + r() * 60;
        mins += `M${f1(mx - 7)} 0L${f1(mx - 7)} ${f1(-top)}L${f1(mx)} ${f1(-top - 46)}L${f1(mx + 7)} ${f1(-top)}L${f1(mx + 7)} 0Z`;
        mins += `M${f1(mx - 12)} ${f1(-top * 0.72)}L${f1(mx + 12)} ${f1(-top * 0.72)}L${f1(mx + 12)} ${f1(-top * 0.72 + 6)}L${f1(mx - 12)} ${f1(-top * 0.72 + 6)}Z`;
      }
    }
    body += 'L1980 -40L1980 0Z';
    return { body, mins };
  }
  window.VHL = { flame, smoke, steam, kettle, KET, skyline, P0, L0, label, fade, f1 };

  // ------------------------------------------------------------------ bt_vh_city
  SH.bt_vh_city = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'night', { g } = BTL.stage(svg, W, H, { fx: 960 });
      const WL = 700;
      const st = BTL.stars(g, 90, 18, [0, -200, 1920, 380]);
      const gl = BTL.glow(svg, defs, 900, WL - 120, mode === 'smoke' ? 420 : 300, mode === 'smoke' ? C.red : C.gold, 0, g);
      const sm = mode === 'smoke' ? smoke(g, 880, WL - 150, { n: 16, h: 620, r0: 50, r1: 220, a: 0.22, sp: 0.05, drift: 220, defs }) : null;
      const S = skyline(), city = el(g, 'g', { transform: `translate(0 ${WL})` });
      const D = BTL.drawing(city);
      D.f(S.body + S.mins, C.paperDark, 1);
      D.s(S.body.replace(/Z$/, ''), { w: 2.5, color: C.inkSoft });
      D.s(S.mins, { w: 2, color: C.inkSoft });
      const r = rng(77), wins = [];
      for (let i = 0; i < 14; i++) wins.push({ e: el(city, 'rect', { x: f1(140 + r() * 1640), y: f1(-30 - r() * 20), width: 6, height: 8, fill: C.gold, 'fill-opacity': 0 }), ph: r() * 6.28 });
      // torches gathering in the middle (night)
      const torches = [];
      if (mode === 'night') for (let i = 0; i < 9; i++) torches.push({ e: el(city, 'circle', { cx: f1(820 + (i % 5) * 34 + (i > 4 ? 16 : 0)), cy: f1(-14 - (i > 4 ? 10 : 0)), r: 4.5, fill: C.gold, 'fill-opacity': 0 }), i });
      const spread = [];
      if (mode === 'torches') { const rr = rng(615); for (let i = 0; i < 22; i++) {
        const x0 = 840 + (i % 6) * 26, y0 = -14 - Math.floor(i / 6) * 9, x1 = 120 + rr() * 1680, y1 = -10 - rr() * 40;
        spread.push({ e: el(city, 'circle', { cx: x0, cy: y0, r: 5, fill: C.gold, 'fill-opacity': 0.8 }), x0, y0, x1, y1, d: rr() * 0.8, i }); } }
      P0(g, `M0 ${WL}L1920 ${WL}L1920 1800L0 1800Z`, C.paperDark, 0.65);
      L0(g, `M0 ${WL}L1920 ${WL}`, C.inkSoft, 2, 0.5);
      const rip = [];
      for (let i = 0; i < 10; i++) rip.push({ e: L0(g, '', mode === 'smoke' ? C.red : C.gold, 2, 0.28 - i * 0.02), y: WL + 18 + i * i * 3.4 + i * 12, len: 50 + i * 20, ph: i * 1.7 });
      return {
        update(lt, dur, cues) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 1.8));
          const hit = cue(cues, 'hit', dur * 0.45), k = 0.6 + 0.4 * BTL.ease(lt, hit, 2);
          for (const w of wins) w.e.setAttribute('fill-opacity', (BTL.ease(lt, 0.8, 1.5) * (0.5 + 0.25 * Math.sin(lt * 0.5 + w.ph))).toFixed(3));
          for (const t of torches) t.e.setAttribute('fill-opacity', (BTL.ease(lt, 0.6 + t.i * 0.35, 1) * (0.75 + 0.2 * Math.sin(lt * 1.3 + t.i))).toFixed(3));
          for (const s of spread) {
            const p = BTL.ease(lt, hit + s.d, Math.max(2, dur - hit - 1));
            s.e.setAttribute('cx', f1(s.x0 + (s.x1 - s.x0) * p)); s.e.setAttribute('cy', f1(s.y0 + (s.y1 - s.y0) * p));
            s.e.setAttribute('fill-opacity', ((0.6 + 0.25 * Math.sin(lt * 1.3 + s.i)) * BTL.ease(lt, 0.2, 0.8)).toFixed(3));
          }
          if (mode === 'smoke') { gl.set((0.18 + 0.04 * Math.sin(lt * 0.9)) * k * BTL.ease(lt, 0.2, 1.5)); sm.update(lt, k * BTL.ease(lt, 0, 1.2)); }
          else if (mode === 'torches') gl.set(0.22 * (1 - 0.6 * BTL.ease(lt, hit, 3)));
          else gl.set((0.12 + 0.1 * BTL.ease(lt, 1, 3)) * (1 + 0.08 * Math.sin(lt * 1.2)));
          for (const p of rip) { const dx = 14 * Math.sin(lt * 0.5 + p.ph); p.e.setAttribute('d', `M${f1(900 - p.len / 2 + dx)} ${f1(p.y)}L${f1(900 + p.len / 2 + dx)} ${f1(p.y)}`); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_kazan
  // a long low barracks wall behind the square (night), regular windows
  function barracksWall(g, y0) {
    P0(g, `M120 ${y0}L120 ${y0 - 190}L1800 ${y0 - 190}L1800 ${y0}Z`, C.paperDark, 1);
    P0(g, `M90 ${y0 - 190}L960 ${y0 - 250}L1830 ${y0 - 190}Z`, C.paperDark, 1);
    L0(g, `M120 ${y0}L120 ${y0 - 190}L1800 ${y0 - 190}L1800 ${y0}M90 ${y0 - 190}L960 ${y0 - 250}L1830 ${y0 - 190}`, C.inkSoft, 2, 0.5);
    let w = ''; for (let x = 180; x < 1760; x += 92) w += `M${x} ${y0 - 120}L${x + 30} ${y0 - 120}L${x + 30} ${y0 - 70}L${x} ${y0 - 70}Z`;
    L0(g, w, C.inkSoft, 1.5, 0.35);
  }
  SH.bt_vh_kazan = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'one', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 600 });
      const GR = 800;
      if (mode === 'row' || mode === 'out') {
        const st = BTL.stars(g, 70, 26, [0, -200, 1920, 360]);
        barracksWall(g, 640);
        P0(g, `M0 640L1920 640L1920 1800L0 1800Z`, C.paperLight, 0.5);
        L0(g, 'M0 640L1920 640', C.inkSoft, 2, 0.5);
        const gl = BTL.glow(svg, defs, 960, 720, 640, C.stain, 0.2, g);
        const fls = [flame(g, 260, 630, 0.32, 0), flame(g, 1660, 630, 0.32, 2)];
        L0(g, 'M260 640L260 600M1660 640L1660 600', C.inkSoft, 4, 0.8);
        const n = 5, ks = [];
        for (let i = 0; i < n; i++) {
          const x = 520 + i * 220, y = 800 - Math.abs(i - 2) * 6, s = 0.52;
          const outer = el(g, 'g', { transform: `translate(${x} ${y})` }), inner = el(outer, 'g');
          const spill = P0(outer, `M-90 0C-150-6-250 2-290 14C-230 30-140 28-80 12Z`, C.gold, 0);
          const k = el(inner, 'g', { transform: `scale(${s})` }), D = BTL.drawing(k); kettle(D, { open: 30 });
          ks.push({ outer, inner, D, spill, i, s });
        }
        return {
          update(lt, dur, cues) {
            st.update(lt); fls.forEach(f => f.update(lt)); gl.set(0.18 + 0.02 * Math.sin(lt * 1.1));
            const hit = cue(cues, 'hit', dur * 0.55);
            for (const k of ks) {
              const at = mode === 'out' ? 0.2 + k.i * Math.min(0.7, dur / 8) : 0.1 + k.i * 0.12;
              k.D.reveal(BTL.ease(lt, at - 0.3, 0.9)); fade(k.outer, BTL.ease(lt, at, 0.8));
              if (mode === 'out') {
                const p = BTL.ease(lt, at, 1.6);
                k.outer.setAttribute('transform', `translate(${520 + k.i * 220} ${f1(800 - Math.abs(k.i - 2) * 6 - (1 - p) * 40)})`);
              } else {
                const tp = BTL.ease(lt, hit + k.i * 0.32, 0.9);
                k.inner.setAttribute('transform', `translate(${f1(220 * k.s / 1.18 * tp)} ${f1(-139 * k.s / 1.18 * tp)}) rotate(${f1(-62 * tp)})`);
                k.spill.setAttribute('fill-opacity', (0.35 * BTL.ease(lt, hit + k.i * 0.32 + 0.5, 1.4)).toFixed(3));
              }
            }
          },
        };
      }
      // one big kettle
      const cx = 960, gl = BTL.glow(svg, defs, cx, 600, 560, C.stain, 0.26, g);
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.75);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.5);
      el(g, 'path', { d: BTL.E(cx, GR + 30, 520, 60), fill: C.stain, 'fill-opacity': 0.1 });
      const fallen = mode === 'fallen', cold = !!P.cold;
      const fire = !fallen && !cold ? flame(g, cx, GR - 4, 0.75) : null;
      const embers = fallen && !cold ? flame(g, cx + 250, GR - 2, 0.16, 1) : null;
      if (!fallen) L0(g, `M${cx - 200} ${GR - 70}L${cx - 240} ${GR}M${cx + 200} ${GR - 70}L${cx + 240} ${GR}`, C.inkSoft, 5, 0.9);
      // tipped: the kettle rolls back on its belly (-62 deg), its dark mouth turned up towards us, soup pouring out
      const TIP = [220, -139, -62];
      const outer = el(g, 'g', { transform: `translate(${cx} ${fallen || mode === 'tip' ? GR : GR - 70})` }), inner = el(outer, 'g');
      const spill = P0(outer, `M-170 0C-330-12-560 4-660 28C-530 62-280 54-150 26Z`, C.gold, 0);
      const pour = el(outer, 'path', { d: 'M-188-92C-214-70-226-36-232 0', fill: 'none', stroke: C.gold, 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-opacity': 0 });
      const k = el(inner, 'g', { transform: 'scale(1.18)' }), D = BTL.drawing(k);
      kettle(D, { gold: fallen, open: fallen || mode === 'tip' ? 58 : 24 });
      if (fallen) inner.setAttribute('transform', `translate(${TIP[0]} ${TIP[1]}) rotate(${TIP[2]})`);
      else if (mode === 'tip') inner.setAttribute('transform', 'translate(0 -70)');
      const stm = !cold ? steam(g, fallen ? cx - 140 : cx, fallen ? GR - 120 : GR - 420, 3, fallen ? 160 : 220) : null;
      const labs = (P.labels || []).map((l, i) => ({ l, e: label(g, l.text, l.x ?? (i ? 1450 : 470), l.y ?? 470, l.size || 64, { italic: true, font: LO, color: l.accent ? C.gold : C.ink }) }));
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6));
          gl.set(0.24 + 0.03 * Math.sin(lt * 1.2));
          if (fire) fire.update(lt);
          if (embers) embers.update(lt, 0.8);
          if (mode === 'tip') {
            const hit = cue(cues, 'hit', dur * 0.5), tp = BTL.ease(lt, hit, 1.1);
            inner.setAttribute('transform', `translate(${f1(TIP[0] * tp)} ${f1(-70 + (TIP[1] + 70) * tp)}) rotate(${f1(TIP[2] * tp)})`);
            spill.setAttribute('fill-opacity', (0.32 * BTL.ease(lt, hit + 0.6, 1.6)).toFixed(3));
            pour.setAttribute('stroke-opacity', (0.7 * BTL.ease(lt, hit + 0.7, 0.6) * (1 - 0.6 * BTL.ease(lt, hit + 2.5, 2))).toFixed(3));
            if (fire) fire.update(lt, 1 - 0.85 * BTL.ease(lt, hit + 0.5, 1.6));
            if (stm) stm.update(lt, 1 - BTL.ease(lt, hit, 0.8));
          } else if (fallen) {
            spill.setAttribute('fill-opacity', (0.26 + 0.04 * Math.sin(lt * 0.7)).toFixed(3));
            pour.setAttribute('stroke-opacity', (cold ? 0.15 : 0.35 + 0.05 * Math.sin(lt * 0.9)).toFixed(3));
            if (stm) stm.update(lt, 0.6);
          } else if (stm) stm.update(lt);
          labs.forEach(({ l, e }, i) => fade(e, BTL.ease(lt, cue(cues, l.at, 0.8 + i * 1.2), 1)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_bork
  // the börk (origin = bottom centre of the band, ~ 420 tall): a tall felt cap whose long flap falls down the back
  // (to the right), a metal sheath at the front holding a spoon
  const BORK = {
    flap: 'M50-420C140-420 190-330 200-200C208-80 214 80 236 250L178 250C160 90 150-60 128-200C118-280 96-340 60-380Z',
    flapFold: 'M120-380C160-320 176-240 180-150C184-40 192 90 206 240',
    body: 'M-96 0L-72-404C-66-436 40-446 72-414L98 0Z',
    crease: 'M-40-30L-30-380M44-30L38-390',
    band: 'M-108 0L110 0L104-48L-102-48Z',
    sheath: 'M-20-48L-16-232L16-232L20-48Z',
    spoonBowl: 'M0-298C-22-302-26-346-19-364C-11-382 11-382 19-364C26-346 22-302 0-298Z',
    spoon: 'M0-222L0-298',
    head: BTL.E(0, 70, 78, 82),
    shoulders: 'M-56 140C-70 180-200 196-240 262L-262 340L262 340L240 262C200 196 70 180 56 140Z',
  };
  function headShoulders(D) {
    D.f(BORK.shoulders, C.paperDark, 1); D.f(BORK.head, C.paperDark, 1);
    D.s(BORK.shoulders.replace(/Z$/, ''), { w: 3, color: C.inkSoft }); D.s(BORK.head, { w: 3, color: C.inkSoft });
  }
  function bork(D, o = {}) {
    D.f(BORK.flap, C.paperLight, 1); D.s(BORK.flap, { w: 3.5 }); D.s(BORK.flapFold, { w: 2, color: C.inkSoft });
    if (o.head) headShoulders(D);
    D.f(BORK.body, C.paperLight, 1); D.s(BORK.body, { w: 4 }); D.s(BORK.crease, { w: 2, color: C.inkSoft, alpha: 0.7 });
    D.f(BORK.band, C.paperDark, 1); D.s(BORK.band, { w: 3.5, color: o.gold ? C.gold : C.ink });
    D.f(BORK.sheath, C.paperLight, 1); D.s(BORK.sheath, { w: 3, color: C.inkSoft });
    D.f(BORK.spoonBowl, C.paperLight, 1);
    D.s(BORK.spoon + BORK.spoonBowl, { w: 4, color: C.ink });
  }
  SH.bt_vh_bork = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'one', portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, cy = portrait ? 720 : 520;
      const gl = BTL.glow(svg, defs, cx, cy - 120, 560, C.stain, 0.24, g);
      const SPOON = BORK.spoon + BORK.spoonBowl;
      if (mode === 'many') {
        const n = 7, items = [], hit = P.hit ?? 3, gap = portrait ? 140 : 230, s = portrait ? 0.3 : 0.46;
        for (let i = 0; i < n; i++) {
          const x = cx + (i - 3) * gap;
          const k = el(g, 'g', { transform: `translate(${x} ${cy + 120}) scale(${s})` }), D = BTL.drawing(k);
          bork(D, { head: true });
          const gold = el(k, 'path', { d: BORK.body + BORK.flap, fill: 'none', stroke: C.gold, 'stroke-width': 7, opacity: 0 });
          items.push({ k, D, i, gold });
        }
        const lab = P.label ? label(g, P.label, cx + (hit - 3) * gap, cy - 140, 64, { italic: true, font: LO, color: C.gold }) : null;
        return {
          update(lt, dur, cues) {
            const h = cue(cues, 'hit', dur * 0.5);
            gl.set(0.2 + 0.02 * Math.sin(lt));
            for (const it of items) {
              it.D.reveal(BTL.ease(lt, 0.1 + it.i * 0.15, 1.4));
              const on = it.i === hit;
              fade(it.gold, on ? BTL.ease(lt, h, 1) : 0);
              fade(it.k, on ? 1 : 1 - 0.55 * BTL.ease(lt, h, 1.4));
            }
            if (lab) fade(lab, BTL.ease(lt, h + 0.3, 1));
          },
        };
      }
      if (mode === 'fez') {
        const sc = portrait ? 0.62 : 0.72, bx = cx - (portrait ? 230 : 340), fx = cx + (portrait ? 230 : 340), y = cy + 120;
        const kb = el(g, 'g', { transform: `translate(${bx} ${y}) scale(${sc})` }), Db = BTL.drawing(kb); bork(Db, { head: true });
        const kf = el(g, 'g', { transform: `translate(${fx} ${y}) scale(${sc})` }), Df = BTL.drawing(kf);
        headShoulders(Df);
        const FEZ = 'M-92 0L96 0L80-190C50-204-50-204-78-190Z';
        Df.f(FEZ, C.red, 0.85); Df.s(FEZ, { w: 4 });
        Df.s('M-92 0C-30 10 30 10 96 0', { w: 2.5, color: C.inkSoft });
        const tas = Df.s('M4-198C24-170 50-130 74-80M4-198C30-176 62-146 90-100', { w: 3, color: C.gold });
        const gl2 = BTL.glow(svg, defs, fx, y - 60, 360, C.stain, 0, g);
        return {
          update(lt, dur, cues) {
            const h = cue(cues, 'hit', dur * 0.4);
            Db.reveal(BTL.ease(lt, 0, 1.2)); fade(kb, 1 - 0.65 * BTL.ease(lt, h, 2));
            Df.reveal(BTL.ease(lt, h, 1.8)); fade(kf, BTL.ease(lt, h - 0.1, 0.3)); gl2.set(0.22 * BTL.ease(lt, h, 2));
            gl.set(0.2 * (1 - 0.5 * BTL.ease(lt, h, 2)));
            tas.setAttribute('transform', `rotate(${f1(2.5 * Math.sin(lt * 0.6))} 4 -198)`);
          },
        };
      }
      const sc = portrait ? 1.0 : 0.85, ox = cx - 40, oy = cy + 80;
      const k = el(g, 'g', { transform: `translate(${ox} ${oy}) scale(${sc})` }), D = BTL.drawing(k);
      bork(D, { head: true });
      const spG = el(k, 'path', { d: SPOON, fill: 'none', stroke: C.gold, 'stroke-width': 6, 'stroke-linecap': 'round', opacity: 0 });
      const spGl = BTL.glow(svg, defs, ox, oy - 320 * sc, 170, C.gold, 0, g);
      return {
        update(lt, dur, cues) {
          const h = cue(cues, 'hit', dur * 0.45);
          D.reveal(BTL.ease(lt, 0, 1.6)); gl.set(0.22 + 0.02 * Math.sin(lt * 0.9));
          fade(spG, BTL.ease(lt, h, 1)); spGl.set(0.32 * BTL.ease(lt, h, 1.2) * (1 + 0.1 * Math.sin(lt * 1.4)));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_saray
  function palace(g, GR) {
    // wall + roofs + domes + cone chimneys of the old palace (silhouette), x 260..1660
    let d = `M260 ${GR}L260 ${GR - 220}L520 ${GR - 220}L560 ${GR - 270}L760 ${GR - 270}L800 ${GR - 220}L1000 ${GR - 220}`;
    d += `L1000 ${GR - 260}C1000 ${GR - 360} 1180 ${GR - 360} 1180 ${GR - 260}L1180 ${GR - 220}L1300 ${GR - 220}L1340 ${GR - 280}L1560 ${GR - 280}L1600 ${GR - 220}L1660 ${GR - 220}L1660 ${GR}Z`;
    let dm = '';
    for (const [x, w] of [[400, 46], [640, 56], [1440, 52]]) dm += `M${x - w} ${GR - 240}C${x - w} ${GR - 240 - w * 1.3} ${x + w} ${GR - 240 - w * 1.3} ${x + w} ${GR - 240}Z`;
    let ch = '';
    for (const x of [860, 910, 960, 1240]) ch += `M${x - 16} ${GR - 220}L${x - 12} ${GR - 330}L${x} ${GR - 370}L${x + 12} ${GR - 330}L${x + 16} ${GR - 220}Z`;
    return { body: d, domes: dm, chim: ch };
  }
  SH.bt_vh_saray = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'window', { g } = BTL.stage(svg, W, H, { fx: mode === 'gate' ? 960 : 1000, fy: 560 });
      const GR = 780;
      const st = BTL.stars(g, 110, 33, [0, -200, 1920, 420]);
      const moonG = BTL.glow(svg, defs, 1560, 210, 160, C.stain, 0.18, g);
      el(g, 'circle', { cx: 1560, cy: 210, r: 34, fill: C.ink, 'fill-opacity': 0.75 });
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.85);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.45);
      const D = BTL.drawing(g);
      if (mode === 'gate') {
        // two octagonal towers with tall cone roofs, an arched gate between
        const T = (x) => `M${x - 90} ${GR}L${x - 90} ${GR - 300}L${x + 90} ${GR - 300}L${x + 90} ${GR}Z`;
        const R = (x) => `M${x - 110} ${GR - 300}L${x} ${GR - 560}L${x + 110} ${GR - 300}Z`;
        const wall = `M520 ${GR}L520 ${GR - 200}L1400 ${GR - 200}L1400 ${GR}Z`;
        D.f(wall, C.paperDark, 1); D.f(T(760) + T(1160), C.paperLight, 1); D.f(R(760) + R(1160), C.paperDark, 1);
        const arch = `M890 ${GR}L890 ${GR - 160}C890 ${GR - 240} 1030 ${GR - 240} 1030 ${GR - 160}L1030 ${GR}`;
        D.s(wall.replace(/Z$/, ''), { w: 2.5, color: C.inkSoft }); D.s(T(760) + T(1160), { w: 3 }); D.s(R(760) + R(1160), { w: 3 });
        D.s(arch, { w: 3.5 });
        const light = P0(g, `M890 ${GR}L890 ${GR - 160}C890 ${GR - 240} 1030 ${GR - 240} 1030 ${GR - 160}L1030 ${GR}Z`, C.gold, 0);
        const pool = el(g, 'path', { d: BTL.E(960, GR + 60, 260, 50), fill: C.gold, 'fill-opacity': 0 });
        const raid = [];
        if (P.raid) { const rr = rng(1826); for (let i = 0; i < 14; i++) {
          const side = i % 2 ? 1 : -1, x1 = 960 + side * (60 + rr() * 300), y1 = GR + 30 + rr() * 90, x0 = 960 + side * (900 + rr() * 300);
          const tg = el(g, 'g'), s = 0.7 + (y1 - GR) / 300;
          BTL.person(tg, 'stand', 0, 0, 150 * s, { color: C.paperDark, rim: C.inkSoft });
          L0(tg, `M${f1(14 * s)} ${f1(-70 * s)}L${f1(26 * s)} ${f1(-170 * s)}`, C.inkSoft, 4);
          const fl = flame(tg, 26 * s, -170 * s, 0.22 * s, i);
          raid.push({ tg, fl, x0, x1, y1, d: rr() * 1.2 }); } }
        const raidGl = BTL.glow(svg, defs, 960, GR + 60, 520, C.gold, 0, g);
        return {
          update(lt, dur, cues) {
            st.update(lt); D.reveal(BTL.ease(lt, 0, 1.6));
            const h = P.raid ? 1e9 : cue(cues, 'hit', dur * 0.55), a = BTL.ease(lt, 0.6, 1.2) * (1 - BTL.ease(lt, h, 1.8));
            light.setAttribute('fill-opacity', (0.55 * a * (1 + 0.05 * Math.sin(lt * 2))).toFixed(3));
            pool.setAttribute('fill-opacity', (0.12 * a).toFixed(3));
            moonG.set(0.16 + 0.02 * Math.sin(lt * 0.4));
            if (P.raid) {
              const hh = cue(cues, 'hit', 0.3);
              raidGl.set(0.22 * BTL.ease(lt, hh, 2.5));
              for (const r of raid) {
                const p = BTL.ease(lt, hh + r.d, 3.2);
                r.tg.setAttribute('transform', `translate(${f1(r.x0 + (r.x1 - r.x0) * p)} ${f1(r.y1)})`);
                fade(r.tg, BTL.ease(lt, hh + r.d, 0.8)); r.fl.update(lt);
              }
            }
          },
        };
      }
      const S = palace(g, GR);
      D.f(S.body + S.domes + S.chim, C.paperLight, 1);
      D.s(S.body.replace(/Z$/, ''), { w: 3 }); D.s(S.domes, { w: 3 }); D.s(S.chim, { w: 2.5, color: C.inkSoft });
      let wins = ''; for (let x = 300; x < 1640; x += 80) if (x < 980 || x > 1200) wins += `M${x} ${GR - 150}L${x + 26} ${GR - 150}L${x + 26} ${GR - 96}L${x} ${GR - 96}Z`;
      D.s(wins, { w: 1.5, color: C.inkSoft, alpha: 0.6 });
      if (mode === 'window') {
        const wx = 1090, wy = GR - 210;
        const win = P0(g, `M${wx - 50} ${wy + 150}L${wx - 50} ${wy}C${wx - 50} ${wy - 60} ${wx + 50} ${wy - 60} ${wx + 50} ${wy}L${wx + 50} ${wy + 150}Z`, C.gold, 0);
        const wg = BTL.glow(svg, defs, wx, wy + 60, 260, C.gold, 0, g);
        const fig = BTL.person(g, 'stand', wx, wy + 150, 150, { color: C.paperDark, rim: C.paperDark });
        return {
          update(lt) {
            st.update(lt); D.reveal(BTL.ease(lt, 0, 1.6));
            const a = BTL.ease(lt, 0.8, 1.6);
            win.setAttribute('fill-opacity', (0.6 * a).toFixed(3)); wg.set(0.22 * a * (1 + 0.06 * Math.sin(lt * 1.7)));
            fade(fig, BTL.ease(lt, 1.6, 1.6));
            moonG.set(0.16 + 0.02 * Math.sin(lt * 0.4));
          },
        };
      }
      // roof: a small figure crossing the roofline, slowly
      const fig = BTL.person(g, 'bend', 0, 0, 150, { color: C.paperDark, rim: C.ink });
      const lamp = BTL.glow(svg, defs, 420, GR - 120, 200, C.gold, 0, g);
      return {
        update(lt, dur) {
          st.update(lt); D.reveal(BTL.ease(lt, 0, 1.4));
          lamp.set(0.22 * BTL.ease(lt, 0.5, 1) * (1 - BTL.ease(lt, dur * 0.6, 2)));
          const p = clamp01((lt - 0.8) / Math.max(2, dur - 1)), x = 580 + p * 380, y = GR - 270;
          fig.setAttribute('transform', `translate(${f1(x)} ${y})`); fade(fig, BTL.ease(lt, 0.6, 1));
          moonG.set(0.16 + 0.02 * Math.sin(lt * 0.4));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_throne
  SH.bt_vh_throne = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'lit', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 800, cx = 960;
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.9);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.4);
      let fl = ''; for (let i = -6; i <= 6; i++) fl += `M${cx + i * 90} ${GR}L${cx + i * 360} 1500`;
      L0(g, fl, C.inkSoft, 1.5, 0.12);
      const beam = P0(g, `M${cx - 90} -100L${cx + 90} -100L${cx + 330} ${GR}L${cx - 330} ${GR}Z`, C.stain, 0.06);
      const pool = BTL.glow(svg, defs, cx, GR - 160, 460, C.stain, 0.3, g);
      const D = BTL.drawing(g);
      const dais = `M${cx - 340} ${GR}L${cx - 340} ${GR - 40}L${cx + 340} ${GR - 40}L${cx + 340} ${GR}ZM${cx - 280} ${GR - 40}L${cx - 280} ${GR - 80}L${cx + 280} ${GR - 80}L${cx + 280} ${GR - 40}Z`;
      const back = `M${cx - 250} ${GR - 220}L${cx - 250} ${GR - 380}C${cx - 170} ${GR - 390} ${cx - 60} ${GR - 420} ${cx} ${GR - 480}C${cx + 60} ${GR - 420} ${cx + 170} ${GR - 390} ${cx + 250} ${GR - 380}L${cx + 250} ${GR - 220}Z`;
      const seat = `M${cx - 330} ${GR - 80}L${cx - 330} ${GR - 220}L${cx + 330} ${GR - 220}L${cx + 330} ${GR - 80}Z`;
      const cush = `M${cx - 220} ${GR - 220}C${cx - 220} ${GR - 260} ${cx + 220} ${GR - 260} ${cx + 220} ${GR - 220}Z`;
      D.f(dais, C.paperLight, 0.8); D.f(back, C.paperLight, 1); D.f(seat, C.paperLight, 1); D.f(cush, C.red, 0.6);
      D.s(dais, { w: 3, color: C.inkSoft }); D.s(back, { w: 4 }); D.s(seat, { w: 4 }); D.s(cush, { w: 3 });
      D.s(`M${cx} ${GR - 480}L${cx} ${GR - 530}` + BTL.E(cx, GR - 544, 12, 12), { w: 3, color: C.gold });
      const arms = `M${cx - 250} ${GR - 220}L${cx - 330} ${GR - 220}C${cx - 370} ${GR - 220} ${cx - 370} ${GR - 300} ${cx - 320} ${GR - 300}L${cx - 250} ${GR - 300}M${cx + 250} ${GR - 220}L${cx + 330} ${GR - 220}C${cx + 370} ${GR - 220} ${cx + 370} ${GR - 300} ${cx + 320} ${GR - 300}L${cx + 250} ${GR - 300}`;
      D.s(arms, { w: 3.5 });
      D.s(`M${cx - 160} ${GR - 160}C${cx - 120} ${GR - 120} ${cx - 80} ${GR - 120} ${cx - 40} ${GR - 160}M${cx + 40} ${GR - 160}C${cx + 80} ${GR - 120} ${cx + 120} ${GR - 120} ${cx + 160} ${GR - 160}`, { w: 2.5, color: C.inkSoft });
      D.s(BTL.E(cx, GR - 340, 40, 40), { w: 3, color: C.gold });
      const r = rng(5), dust = [];
      for (let i = 0; i < 18; i++) dust.push({ e: el(g, 'circle', { cx: 0, cy: 0, r: 2 + r() * 2, fill: C.ink, 'fill-opacity': 0 }), x: cx - 200 + r() * 400, y: 100 + r() * 600, ph: r() });
      return {
        update(lt, dur) {
          D.reveal(BTL.ease(lt, 0, 1.8));
          const off = mode === 'fade' ? BTL.ease(lt, dur * 0.35, dur * 0.5) : 0;
          beam.setAttribute('fill-opacity', (0.06 * (1 - off)).toFixed(3));
          pool.set((0.28 + 0.02 * Math.sin(lt * 0.8)) * (1 - 0.85 * off));
          for (const d of dust) {
            const ph = (d.ph + lt * 0.03) % 1;
            d.e.setAttribute('cx', f1(d.x + 20 * Math.sin(lt * 0.3 + d.ph * 6))); d.e.setAttribute('cy', f1(d.y - ph * 160));
            d.e.setAttribute('fill-opacity', (0.35 * Math.sin(ph * Math.PI) * (1 - off)).toFixed(3));
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_dukkan
  SH.bt_vh_dukkan = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 800, cx = 960;
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperDark, 0.8);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.45);
      let cob = ''; for (let y = GR + 40; y < 1100; y += 50) cob += `M0 ${y}L1920 ${y}`;
      L0(g, cob, C.inkSoft, 1.2, 0.12);
      const D = BTL.drawing(g);
      const front = `M${cx - 460} ${GR}L${cx - 460} ${GR - 470}L${cx + 460} ${GR - 470}L${cx + 460} ${GR}Z`;
      const open = `M${cx - 360} ${GR - 120}L${cx - 360} ${GR - 400}L${cx + 360} ${GR - 400}L${cx + 360} ${GR - 120}Z`;
      const awn = `M${cx - 520} ${GR - 470}L${cx + 520} ${GR - 470}L${cx + 600} ${GR - 380}L${cx - 600} ${GR - 380}Z`;
      const counter = `M${cx - 380} ${GR}L${cx - 380} ${GR - 120}L${cx + 380} ${GR - 120}L${cx + 380} ${GR}Z`;
      D.f(front, C.paperLight, 0.9); D.f(open, C.paperDark, 1); D.f(awn, C.paperLight, 1); D.f(counter, C.paperLight, 1);
      D.s(front, { w: 3, color: C.inkSoft }); D.s(open, { w: 3 }); D.s(awn, { w: 3.5 }); D.s(counter, { w: 3.5 });
      let slats = ''; for (let i = -5; i <= 5; i++) slats += `M${cx + i * 95} ${GR - 470}L${cx + i * 110} ${GR - 380}`;
      D.s(slats, { w: 2, color: C.inkSoft });
      // pots on the counter
      for (const [x, s] of [[-250, 0.16], [-150, 0.12], [200, 0.14], [290, 0.1]]) {
        const k = el(g, 'g', { transform: `translate(${cx + x} ${GR - 120}) scale(${s})` }); const Dk = BTL.drawing(k); kettle(Dk); D.items.push(...Dk.items);
      }
      const lampG = BTL.glow(svg, defs, cx + 120, GR - 300, 330, C.gold, 0, g);
      D.s(`M${cx + 120} ${GR - 400}L${cx + 120} ${GR - 330}`, { w: 2, color: C.inkSoft });
      const lamp = P0(g, BTL.E(cx + 120, GR - 312, 16, 20), C.gold, 0);
      const fig = BTL.person(g, 'sit', cx - 40, GR - 120, 230, { color: C.paperDark, rim: C.inkSoft });
      return {
        update(lt) {
          D.reveal(BTL.ease(lt, 0, 1.8));
          const a = BTL.ease(lt, 0.8, 1.4);
          lampG.set(0.24 * a * (1 + 0.07 * Math.sin(lt * 1.9))); lamp.setAttribute('fill-opacity', (0.9 * a).toFixed(3));
          fade(fig, BTL.ease(lt, 1.2, 1.4));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_drill
  SH.bt_vh_drill = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const GR = 800, n = P.n || 7, hat = P.hat || 'cap';
      const sky = BTL.glow(svg, defs, 960, GR - 60, 900, C.stain, 0.16, g);
      P0(g, `M0 ${GR}L1920 ${GR}L1920 1800L0 1800Z`, C.paperLight, 0.45);
      L0(g, `M0 ${GR}L1920 ${GR}`, C.inkSoft, 2, 0.5);
      let lines = ''; for (let i = 1; i < 6; i++) lines += `M0 ${GR + i * i * 9}L1920 ${GR + i * i * 9}`;
      L0(g, lines, C.inkSoft, 1.2, 0.15);
      const row = el(g, 'g'), men = [];
      for (let i = 0; i < n; i++) {
        const dir = P.dir || 1, x = 960 + (i - (n - 1) / 2) * (P.gap || 170), h = P.h || 330;
        const m = el(row, 'g');
        BTL.person(m, 'stand', x, GR, h, { color: C.paperDark, rim: C.ink, face: dir });
        // musket on the right shoulder, slanting up
        L0(m, `M${x + 34 * dir} ${GR - 0.44 * h}L${x + 10 * dir} ${GR - 1.12 * h}`, C.ink, 5, 0.9);
        const hy = GR - 0.9 * h;
        if (hat === 'fez') P0(m, `M${x - 24} ${hy - 18}L${x + 24} ${hy - 18}L${x + 19} ${hy - 58}L${x - 19} ${hy - 58}Z`, C.red, 0.9);
        else P0(m, `M${x - 28} ${hy - 16}C${x - 28} ${hy - 50} ${x + 28} ${hy - 50} ${x + 28} ${hy - 16}Z`, C.inkSoft, 1);
        el(m, 'path', { d: BTL.E(x, GR + 4, 50, 8), fill: C.paperDark, 'fill-opacity': 0.5 });
        men.push({ m, i });
      }
      const lab = P.label ? label(g, P.label, 960, 250, 72, { italic: true, font: LO, color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          sky.set(0.15 + 0.02 * Math.sin(lt * 0.6));
          for (const it of men) fade(it.m, BTL.ease(lt, 0.15 + it.i * 0.22, 0.9));
          row.setAttribute('transform', `translate(${f1((P.dir || 1) * (-40 + 7 * lt))} 0)`);
          if (lab) fade(lab, BTL.ease(lt, cue(cues, 'hit', dur * 0.5), 1));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_vh_tree
  SH.bt_vh_tree = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'fall', portrait = H > W, g = el(svg, 'g');
      const cx = W / 2, top = portrait ? 260 : 120, split = portrait ? 700 : 440, ny = portrait ? 1000 : 640;
      const xs = portrait ? [cx - 330, cx, cx + 330] : [cx - 460, cx, cx + 460];
      BTL.glow(svg, defs, cx, (top + ny) / 2, 620, C.stain, 0.08, g);
      // the ancestors: a long chain of faint nodes
      const N = 12, chain = [];
      for (let i = 0; i < N; i++) chain.push([cx, top + (split - 90 - top) * i / (N - 1)]);
      const chainLine = L0(g, `M${cx} ${top}L${cx} ${split}`, C.inkSoft, 2, 0.5);
      const chainGold = el(g, 'path', { d: `M${cx} ${top}L${cx} ${split}`, stroke: C.gold, 'stroke-width': 3, fill: 'none', pathLength: 1 });
      const dots = chain.map(([x, y]) => el(g, 'circle', { cx: x, cy: y, r: 7, fill: C.inkSoft, 'fill-opacity': 0.7 }));
      // two parents (unlabelled), then the three princes: Selim (son of Mustafa III); Mustafa and Mahmud (sons of Abdülhamid I)
      const pa = [xs[0], split + 60], pb = [(xs[1] + xs[2]) / 2, split + 60];
      const br = `M${cx} ${split}L${pa[0]} ${pa[1]}M${cx} ${split}L${pb[0]} ${pb[1]}M${pa[0]} ${pa[1]}L${xs[0]} ${ny - 36}M${pb[0]} ${pb[1]}L${xs[1]} ${ny - 36}M${pb[0]} ${pb[1]}L${xs[2]} ${ny - 36}`;
      const brL = el(g, 'path', { d: br, stroke: C.inkSoft, 'stroke-width': 2, fill: 'none', 'stroke-opacity': 0.6, pathLength: 1 });
      const brGold = el(g, 'path', { d: `M${cx} ${split}L${pb[0]} ${pb[1]}L${xs[2]} ${ny - 36}`, stroke: C.gold, 'stroke-width': 3, fill: 'none', pathLength: 1 });
      for (const [x, y] of [pa, pb]) el(g, 'circle', { cx: x, cy: y, r: 7, fill: C.inkSoft, 'fill-opacity': 0.7 });
      const names = ['Selim', 'Mustafa', 'Mahmud'];
      const nodes = xs.map((x, i) => {
        const ng = el(g, 'g');
        const ring = el(ng, 'circle', { cx: x, cy: ny, r: 34, fill: C.paperLight, stroke: C.ink, 'stroke-width': 3 });
        const t = svgText(ng, names[i], x, ny + 110, portrait ? 58 : 64, { fill: C.ink, 'font-family': FR, 'font-weight': 400 });
        return { ng, ring, t, x };
      });
      const halo = BTL.glow(svg, defs, xs[2], ny, 220, C.gold, 0, g);
      return {
        update(lt, dur, cues) {
          draw(brL, BTL.ease(lt, 0.3, 1.4)); chainLine.setAttribute('stroke-opacity', (0.5 * BTL.ease(lt, 0, 1)).toFixed(3));
          dots.forEach((d, i) => d.setAttribute('fill-opacity', (0.7 * BTL.ease(lt, i * 0.06, 0.8)).toFixed(3)));
          const m = cue(cues, 'm', dur * 0.55), h = cue(cues, 'hit', dur * 0.5);
          nodes.forEach((n, i) => {
            let dark = 0;
            if (mode === 'fall') dark = i === 0 ? 1 : i === 1 ? BTL.ease(lt, m, 1.4) : 0;
            else dark = i < 2 ? 1 : 0;
            fade(n.ng, BTL.ease(lt, 0.5 + i * 0.25, 1) * (1 - 0.72 * dark));
          });
          const gp = mode === 'one' ? BTL.ease(lt, h, 2) : 0;
          draw(chainGold, gp); draw(brGold, BTL.ease(lt, h + 0.8, 1.2) * (mode === 'one' ? 1 : 0));
          nodes[2].ring.setAttribute('stroke', gp > 0.3 ? C.gold : C.ink);
          nodes[2].t.setAttribute('fill', gp > 0.3 ? C.gold : C.ink);
          halo.set(0.3 * BTL.ease(lt, (mode === 'one' ? h : 1.5), 1.6) * (1 + 0.08 * Math.sin(lt * 1.1)));
        },
      };
    },
  };
  // ------------------------------------------------------------------ bt_vh_road
  // bt_vh_road  P: {}  cues: hit   dusk; one dirt road runs to the horizon; a file of small faceless figures walks
  //             slowly away along it, shrinking into the distance
  SH.bt_vh_road = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const { g } = BTL.stage(svg, W, H, { fx: 960, fy: 560 });
      const HZ = 470, cx = 960;
      const sky = BTL.glow(svg, defs, cx, HZ, 820, C.stain, 0.22, g);
      const st = BTL.stars(g, 60, 101, [0, -200, 1920, 300]);
      P0(g, `M0 ${HZ}L1920 ${HZ}L1920 1800L0 1800Z`, C.paperDark, 0.85);
      L0(g, `M0 ${HZ}C400 ${HZ - 18} 700 ${HZ - 6} 960 ${HZ}C1300 ${HZ + 6} 1600 ${HZ - 14} 1920 ${HZ}`, C.inkSoft, 2, 0.6);
      P0(g, `M${cx - 14} ${HZ}L${cx + 14} ${HZ}L${cx + 380} 1100L${cx - 380} 1100Z`, C.paperLight, 0.55);
      L0(g, `M${cx - 14} ${HZ}L${cx - 380} 1100M${cx + 14} ${HZ}L${cx + 380} 1100`, C.inkSoft, 2.5, 0.8);
      const n = 9, men = [];
      for (let i = 0; i < n; i++) men.push({ e: BTL.person(g, 'stand', 0, 0, 100, { color: C.paperDark, rim: C.ink }), i });
      return {
        update(lt, dur, cues) {
          st.update(lt); sky.set(0.2 - 0.06 * BTL.ease(lt, 0, dur));
          for (const m of men) {
            const q = clamp01(0.04 + m.i * 0.1 + lt * 0.02), depth = 1 - q;   // 0 = far, 1 = near
            const y = HZ + 30 + depth * depth * 330, s = 0.7 + depth * depth * 2.4, x = cx + (m.i % 2 ? 16 : -16) * s;
            m.e.setAttribute('transform', `translate(${f1(x)} ${f1(y)}) scale(${s.toFixed(3)})`);
            fade(m.e, BTL.ease(lt, 0.2 + (n - m.i) * 0.12, 0.8));
          }
        },
      };
    },
  };
})();
