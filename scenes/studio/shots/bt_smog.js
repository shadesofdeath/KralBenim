// bt_smog: the Great Smog of London (5–9 December 1952), belgesel style (docs/BELGESEL.md). Still line art in the
// theme's tokens; the only motion is slow and natural: banks of fog drifting, smoke rising, a gas flame breathing,
// a torch swinging gently, a curtain coming down. Fog = a few large soft gradient ellipses (one shared gradient, no
// blur, no blend modes). Every type is composed on a 1080x1920 vertical canvas (the Short); a wide frame shows it as a
// centred column.
//   bt_smog_lamp    P: {mode: "hook"|"end"}  cues: hit   a gas street lamp in the fog, its light pool on the pavement,
//                   a terrace of houses and two far lamps dissolving behind. hook: on "hit" the fog closes in and the
//                   far lamps go out (the cover frame). end: the fog slowly thins, stars come out over the lamp
//   bt_smog_city    P: {label: "Londra", sub: "Aralık 1952", lid: false}  cues: hit   the Thames, the Houses of Parliament and the
//                   clock tower; on "hit" a lid of warm air comes down over the city and the fog gathers beneath it
//   bt_smog_chimney P: {label: "ılık hava"}  cues: warm, hit   roofs, chimney stacks and house fronts; smoke rises from the pots, meets a still ceiling and spreads
//                   flat under it; on "warm" the label appears above the ceiling, on "hit" the ceiling line turns gold
//   bt_smog_walk    P: {label: "birkaç metre"}  cues: hit   a man walks away down a street and dissolves into the fog
//                   a few metres away; on "hit" a gold measuring line runs from the kerb to him with the label
//   bt_smog_bus     cues: hit   a double-decker bus front-on, headlights in the fog; in front of it a conductor walks
//                   with a flare held out; on "hit" the flare flames up gold
//   bt_smog_opera   P: {label: "La Traviata"}  cues: hit   a theatre stage: one singer in a spotlight, rows of heads; fog
//                   drifts across the stage and swallows the singer; on "hit" the curtain slowly comes down
//   bt_smog_count   P: {n: 4000, label: "kişi", note: "en az", sub, marks: false}  cues: hit   4000 small marks fill the frame
//                   row by row while the number counts up
//   bt_smog_act     P: {title: ["Temiz Hava", "Yasası"], year: "1956"}  cues: hit   a parliamentary act on a desk of light;
//                   the fog around it clears; on "hit" its seal and year turn gold
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, TAU = Math.PI * 2;
  const f1 = v => (+v).toFixed(1);
  const fade = (e, a) => e && e.setAttribute('opacity', clamp01(a).toFixed(3));
  const P0 = (p, d, fill, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill, 'fill-opacity': a, stroke: 'none' }, x));
  const L0 = (p, d, stroke, w = 3, a = 1, x = {}) => el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w,
    'stroke-opacity': a, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, x));
  const txt = (g, s, x, y, size, o = {}) => {
    const e = svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || BTL.FR,
      'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}));
    e.setAttribute('text-anchor', o.anchor || 'middle');
    if (o.spacing) e.setAttribute('letter-spacing', o.spacing);
    return e;
  };
  const FOG = () => mix(C.inkSoft, C.gold, 0.22);     // a pea-souper: grey with a sickly yellow cast
  const SIL = () => C.paperDark;
  const STONE = () => mix(C.paperLight, C.ink, 0.06);
  let uid = 0;

  function canvas(svg, W, H) {
    if (H > W) return el(svg, 'g');
    const k = H / 1920;
    return el(svg, 'g', { transform: `translate(${f1((W - 1080 * k) / 2)} 0) scale(${k.toFixed(4)})` });
  }

  // banks of fog: large soft ellipses sharing one gradient, drifting slowly sideways (no flicker)
  function fog(g, defs, seed, banks) {
    const id = 'smf' + (++uid), rg = el(defs, 'radialGradient', { id });
    el(rg, 'stop', { offset: '0', 'stop-color': FOG(), 'stop-opacity': 1 });
    el(rg, 'stop', { offset: '0.55', 'stop-color': FOG(), 'stop-opacity': 0.55 });
    el(rg, 'stop', { offset: '1', 'stop-color': FOG(), 'stop-opacity': 0 });
    const r = rng(seed), list = banks.map(([x, y, rx, ry, a]) => ({
      e: el(g, 'ellipse', { cx: x, cy: y, rx, ry, fill: `url(#${id})`, 'fill-opacity': a }), a,
      amp: 60 + r() * 90, sp: 0.07 + r() * 0.09, ph: r() * TAU, dir: r() < 0.5 ? -1 : 1 }));
    return {
      update(lt, k = 1) { for (const q of list) {
        q.e.setAttribute('transform', `translate(${f1(q.dir * q.amp * Math.sin(lt * q.sp + q.ph))} ${f1(8 * Math.sin(lt * q.sp * 0.7 + q.ph))})`);
        q.e.setAttribute('fill-opacity', Math.max(0, q.a * k).toFixed(3));
      } },
    };
  }
  // a wide band of fog banks across y0..y1
  const band = (seed, y0, y1, n, a, rx = 520, ry = 220) => {
    const r = rng(seed), out = [];
    for (let i = 0; i < n; i++) out.push([-120 + r() * 1320, y0 + r() * (y1 - y0), rx * (0.7 + r() * 0.6), ry * (0.7 + r() * 0.6), a * (0.7 + r() * 0.5)]);
    return out;
  };

  // a London gas lamp: post with a ladder bar, a four-sided lantern with a cap and a finial. origin = foot of the post
  function lamp(parent, svg, defs, x, y, s = 1, o = {}) {
    const g = el(parent, 'g', { transform: `translate(${x} ${y}) scale(${s})` });
    const glow = BTL.glow(svg, defs, x, y - 790 * s, 460 * s, C.gold, o.glow ?? 0.32, parent);
    parent.insertBefore(glow.e, g);
    const D = BTL.drawing(g);
    const post = 'M-34 0L34 0L26-40L16-60L14-640L22-660L22-680L-22-680L-22-660L-14-640L-16-60L-26-40Z';
    D.f(post, SIL(), 1); D.s(post, { w: 3, color: C.inkSoft });
    D.s('M-70-610L70-610M-60-610L-60-596M60-610L60-596', { w: 5, color: C.inkSoft });
    const glass = 'M-74-860L74-860L52-700L-52-700Z';
    D.f(glass, mix(C.paperLight, C.gold, 0.35), 0.55);
    D.f('M-62-690L62-690L52-700L-52-700Z', SIL(), 1);
    D.s(glass, { w: 3.5, color: C.ink });
    D.s('M-24-860L-17-700M24-860L17-700', { w: 2, color: C.inkSoft });
    D.s('M-62-690L62-690L52-700L-52-700Z', { w: 3, color: C.ink });
    const cap = 'M-92-860L92-860L0-936Z';
    D.f(cap, SIL(), 1); D.s(cap, { w: 3.5, color: C.ink });
    D.s('M0-936L0-966M-10-966L10-966', { w: 3, color: C.ink });
    const flame = P0(g, BTL.E(0, -770, 14, 26), C.gold, 0.95);
    const core = P0(g, BTL.E(0, -766, 6, 12), C.ink, 0.9);
    return { g, D, glow, base: o.glow ?? 0.32, update(lt, k = 1) {
      const b = 1 + 0.05 * Math.sin(lt * 1.3) + 0.03 * Math.sin(lt * 2.1 + 1);
      flame.setAttribute('d', BTL.E(0, -770, 14 * b, 26 * b)); core.setAttribute('d', BTL.E(0, -766, 6, 12 * b));
      glow.set(this.base * k * (0.94 + 0.06 * Math.sin(lt * 0.9)));
      fade(flame, k); fade(core, k);
    } };
  }

  // a terrace of London houses (chimneys, sash windows), drawn faint behind the fog
  function terrace(g, y, o = {}) {
    let d = '', win = '', x = -40;
    const r = rng(o.seed || 3);
    while (x < 1120) {
      const w = 170 + r() * 50, h = 380 + r() * 90, top = y - h;
      d += `M${f1(x)} ${y}L${f1(x)} ${f1(top)}L${f1(x + w * 0.22)} ${f1(top)}L${f1(x + w * 0.22)} ${f1(top - 70)}L${f1(x + w * 0.38)} ${f1(top - 70)}L${f1(x + w * 0.38)} ${f1(top)}L${f1(x + w)} ${f1(top)}L${f1(x + w)} ${y}Z`;
      for (let fl = 0; fl < 3; fl++) for (const u of [0.22, 0.62]) { const wx = x + w * u, wy = top + 60 + fl * 110; win += `M${f1(wx)} ${f1(wy)}h44v70h-44Z`; }
      x += w + 4;
    }
    P0(g, d, mix(C.paper, C.paperDark, 0.55), o.alpha ?? 0.8);
    L0(g, d, C.inkSoft, 2, (o.alpha ?? 0.8) * 0.5);
    L0(g, win, C.inkSoft, 1.6, (o.alpha ?? 0.8) * 0.35);
  }
  // pavement + kerb + cobbles running on down to 1920
  function street(g, y, o = {}) {
    P0(g, `M-60 ${y}L1140 ${y}L1140 2200L-60 2200Z`, mix(C.paper, C.paperLight, 0.5), 1);
    L0(g, `M-60 ${y}L1140 ${y}`, C.inkSoft, 2.5, 0.8);
    L0(g, `M-60 ${y + 120}L1140 ${y + 150}`, C.inkSoft, 2.5, 0.55);
    let c = ''; const r = rng(o.seed || 5);
    for (let row = 0; row < 11; row++) { const yy = y + 190 + row * (36 + row * 6), step = 70 + row * 14;
      for (let x = -40 + (row % 2) * step / 2; x < 1120; x += step) c += `M${f1(x)} ${f1(yy)}q${f1(step * 0.4)} -6 ${f1(step * 0.8)} 0`; }
    L0(g, c, C.inkSoft, 1.6, 0.25);
    let p = ''; for (let x = 0; x < 1120; x += 160) p += `M${x} ${y + 4}L${x - 20} ${y + 118}`;
    L0(g, p, C.inkSoft, 1.6, 0.3);
  }

  // ------------------------------------------------------------------ the lamp in the fog (hook, end)
  SH.bt_smog_lamp = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'hook', root = el(canvas(svg, W, H), 'g');
      const sky = el(root, 'g');
      const stars = mode === 'end' ? BTL.stars(sky, 70, 19, [0, 60, 1080, 700]) : null;
      if (stars) fade(stars.g, 0);
      const back = el(root, 'g');
      terrace(back, 1380, { seed: 4, alpha: 0.75 });
      const far = [lamp(back, svg, defs, 170, 1380, 0.42, { glow: 0.22 }), lamp(back, svg, defs, 900, 1380, 0.3, { glow: 0.18 })];
      far.forEach(l => l.D.reveal(1));
      const fogB = fog(root, defs, 11, band(11, 500, 1250, 7, 0.32));
      street(root, 1380);
      const pool = BTL.glow(svg, defs, 600, 1430, 330, C.gold, 0.16, root);
      const L = lamp(root, svg, defs, 600, 1400, 1);
      L.D.reveal(1);
      const fogF = fog(root, defs, 23, band(23, 650, 1500, 6, 0.26, 460, 200));
      // the halo the fog makes around the lantern + soot motes drifting through its light
      const halo = BTL.glow(svg, defs, 600, 630, 330, C.gold, 0.2, root);
      const mr = rng(29), motes = [];
      for (let i = 0; i < 40; i++) motes.push({ e: P0(root, '', C.ink, 0), x: mr(), y: mr(), s: 1.6 + mr() * 2.2, v: 0.02 + mr() * 0.03, ph: mr() * TAU });
      const moteUp = (lt, k) => { for (const q of motes) {
        const u = (q.x + q.v * lt) % 1, x = 300 + u * 600, y = 380 + q.y * 520 + 14 * Math.sin(lt * 0.4 + q.ph);
        const d = Math.hypot(x - 600, (y - 630) * 1.2) / 330;
        q.e.setAttribute('d', BTL.E(x, y, q.s, q.s));
        q.e.setAttribute('fill-opacity', (k * 0.55 * Math.max(0, 1 - d) * Math.sin(Math.PI * u)).toFixed(3));
      } };
      return {
        update(lt, dur, cues) {
          const fast = mode === 'hook' ? lt * 3 : lt;   // the hook plays slowed under the cover text
          if (mode === 'hook') {
            const at = cue(cues, 'hit', 1.2), n = BTL.ease(lt, Math.min(at, 1.4) - 0.3, 1.4);
            const th = BTL.ease(lt, 0, dur + 1); fogB.update(fast, 0.8 + 0.3 * n + 0.3 * th); fogF.update(fast, 0.6 + 0.4 * n + 0.5 * th);
            far[0].update(fast, 1 - 0.85 * n); far[1].update(fast, 1 - n);
            const rc = document.documentElement.classList, thumb = rc.contains('cover') && !rc.contains('hook');
            far.forEach(l => { l.g.setAttribute('display', thumb ? 'none' : 'inline'); l.glow.e.setAttribute('display', thumb ? 'none' : 'inline'); });
            fade(back, 1 - 0.45 * n);
            L.update(fast, 1); pool.set(0.16 + 0.04 * Math.sin(fast * 0.9));
            halo.set(0.2 + 0.06 * n + 0.03 * Math.sin(fast * 0.7)); moteUp(fast * 4, 1.4);
          } else {
            const k = BTL.ease(lt, 0.3, Math.max(2, dur - 0.5));
            fogB.update(fast, 1.1 - 0.8 * k); fogF.update(fast, 1 - 0.85 * k);
            far.forEach(l => l.update(fast, 0.3 + 0.5 * k));
            fade(back, 0.55 + 0.25 * k);
            fade(stars.g, k); stars.update(lt * 2);
            L.update(fast, 1); pool.set(0.16 + 0.03 * Math.sin(lt * 0.8));
            halo.set(0.2 - 0.08 * k + 0.03 * Math.sin(lt * 0.7)); moteUp(lt, 1 - 0.7 * k);
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ the city under a lid of warm air
  SH.bt_smog_city = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), RY = 1120;
      const lab = txt(root, P.label || 'Londra', 540, 250, 104, { weight: 400 });
      const sub = txt(root, P.sub || 'Aralık 1952', 540, 330, 52, { font: BTL.LO, italic: true, color: C.gold });
      // the lid: a soft band of warm air with a firm lower edge and slow arrows pressing down
      const lid = el(root, 'g');
      const lidBand = fog(lid, defs, 5, [[260, 0, 640, 90, 0.35], [820, 10, 640, 90, 0.35]]);
      const edge = L0(lid, 'M-60 70C200 58 400 78 540 70C700 62 880 80 1140 68', C.gold, 3.5, 0.9, { pathLength: 1 });
      let ar = ''; for (const x of [180, 420, 660, 900]) ar += `M${x} -30L${x} 40M${x - 14} 24L${x} 42L${x + 14} 24`;
      const arrows = L0(lid, ar, C.inkSoft, 3, 0.9);
      // skyline: Houses of Parliament + the clock tower
      const city = el(root, 'g'), D = BTL.drawing(city);
      let parl = `M60 ${RY}L60 960`;
      for (let x = 60; x < 640; x += 58) parl += `L${x} 960L${x} 930L${x + 12} 930L${x + 12} 960L${x + 58} 960`;
      parl += `L700 960L700 ${RY}Z`;
      const vt = `M90 ${RY}L90 760L120 730L150 760L150 ${RY}Z`;     // a far turret
      const tower = `M730 ${RY}L730 600L716 600L716 560L812 560L812 600L798 600L798 ${RY}Z`;
      const belfry = 'M724 560L724 470L804 470L804 560Z';
      const spire = 'M716 470L764 360L812 470Z';
      D.f(parl + vt, SIL(), 1); D.f(tower + belfry + spire, SIL(), 1);
      D.s(parl + vt, { w: 2.5, color: C.inkSoft }); D.s(tower + belfry + spire, { w: 3, color: C.inkSoft });
      let mul = ''; for (let x = 100; x < 680; x += 46) mul += `M${x} 990L${x} ${RY - 20}`;
      D.s(mul, { w: 1.6, color: C.inkSoft, alpha: 0.5 });
      D.s(BTL.E(764, 515, 26, 26), { w: 3, color: C.ink });
      D.s('M764 515L764 498M764 515L776 520', { w: 2.5, color: C.ink });
      D.s(`M820 ${RY}L820 1020L860 1020L860 980L880 980L880 1020L1000 1020L1000 ${RY}`, { w: 2, color: C.inkSoft, alpha: 0.6 });
      // the river: dark water, slow light strokes
      P0(root, `M-60 ${RY}L1140 ${RY}L1140 1960L-60 1960Z`, mix(C.paperDark, C.paper, 0.4), 1);
      L0(root, `M-60 ${RY}L1140 ${RY}`, C.inkSoft, 2.5, 0.7);
      const glints = []; const r = rng(9);
      for (let i = 0; i < 16; i++) glints.push({ e: L0(root, '', C.inkSoft, 2, 0), x: r() * 1000 + 40, y: RY + 40 + r() * 700, w: 30 + r() * 80, ph: r() * TAU });
      const under = fog(root, defs, 31, band(31, 700, 1150, 7, 0.34, 520, 170));
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55);
          D.reveal(BTL.ease(lt, 0, 1.6));
          fade(lab, BTL.ease(lt, 0.2, 1)); fade(sub, BTL.ease(lt, 0.7, 1));
          const p = BTL.ease(lt, at - 0.6, 2.2);
          lid.setAttribute('transform', `translate(0 ${f1(380 + 230 * p)})`);
          fade(lid, P.lid === false ? 0 : BTL.ease(lt, at - 0.9, 0.8));
          draw(edge, BTL.ease(lt, at - 0.7, 1.2));
          arrows.setAttribute('transform', `translate(0 ${f1(10 * Math.sin(lt * 1.2))})`);
          lidBand.update(lt, 1);
          under.update(lt, 0.25 + 0.9 * BTL.ease(lt, at, 2.4));
          fade(city, 1 - 0.3 * BTL.ease(lt, at + 0.4, 2.4));
          for (const q of glints) { const a = 0.15 + 0.35 * Math.sin(lt * 0.5 + q.ph) ** 2; q.e.setAttribute('d', `M${f1(q.x)} ${f1(q.y)}l${f1(q.w)} 0`); q.e.setAttribute('stroke-opacity', a.toFixed(3)); }
        },
      };
    },
  };

  // ------------------------------------------------------------------ chimney smoke flattening under a still ceiling
  SH.bt_smog_chimney = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), CEIL = 450;
      // the lid of warm air above the city: a faint warm band, its lower edge the ceiling the smoke cannot pass
      const warm = BTL.glow(svg, defs, 540, CEIL - 170, 700, C.gold, 0.08, root);
      const ceil = L0(root, `M-60 ${CEIL}C300 ${CEIL - 10} 700 ${CEIL + 10} 1140 ${CEIL}`, C.inkSoft, 4, 0.7, { 'stroke-dasharray': '18 16' });
      const wl = txt(root, P.label || 'ılık hava', 540, CEIL - 60, 50, { font: BTL.LO, italic: true, color: C.gold });
      const spread = fog(root, defs, 41, band(41, CEIL + 50, CEIL + 220, 6, 0.4, 480, 110));
      // smoke: a dense chain of soft puffs per pot, rising in a column, flattening under the ceiling
      const stacks = [[200, 880], [470, 790], [760, 830], [960, 920]];
      const puffs = []; const r = rng(17);
      const sm = el(root, 'g'), pid = 'smp' + (++uid), pg = el(defs, 'radialGradient', { id: pid });
      el(pg, 'stop', { offset: '0', 'stop-color': FOG(), 'stop-opacity': 1 });
      el(pg, 'stop', { offset: '0.6', 'stop-color': FOG(), 'stop-opacity': 0.45 });
      el(pg, 'stop', { offset: '1', 'stop-color': FOG(), 'stop-opacity': 0 });
      stacks.forEach(([x, y]) => { for (let i = 0; i < 26; i++) puffs.push({ e: P0(sm, '', `url(#${pid})`, 0), x, y: y - 70, ph: (i / 26 + r() * 0.02), side: (i % 2 ? 1 : -1) * (0.6 + r() * 0.8), s: 40 + r() * 14 }); });
      // roofs + stacks, house fronts below down to the bottom of the frame
      const D = BTL.drawing(root);
      const RL = 'M-60 1060L120 950L330 950L420 1030L560 900L780 900L900 1010L1140 990';
      D.f(RL + 'L1140 2200L-60 2200Z', SIL(), 1);
      D.s(RL, { w: 3, color: C.inkSoft });
      let sd = '', pots = '';
      for (const [x, y] of stacks) {
        sd += `M${x - 60} ${y + 220}L${x - 60} ${y}L${x + 60} ${y}L${x + 60} ${y + 220}Z`;
        sd += `M${x - 68} ${y}L${x + 68} ${y}L${x + 68} ${y - 18}L${x - 68} ${y - 18}Z`;
        pots += `M${x - 40} ${y - 18}L${x - 34} ${y - 70}L${x - 14} ${y - 70}L${x - 8} ${y - 18}ZM${x + 8} ${y - 18}L${x + 14} ${y - 64}L${x + 34} ${y - 64}L${x + 40} ${y - 18}Z`;
      }
      D.f(sd + pots, mix(C.paperLight, C.stain, 0.1), 1);
      D.s(sd + pots, { w: 3, color: C.ink });
      let br = ''; for (const [x, y] of stacks) for (let k = 1; k < 8; k++) br += `M${x - 60} ${y + k * 28}L${x + 60} ${y + k * 28}`;
      D.s(br, { w: 1.6, color: C.inkSoft, alpha: 0.6 });
      let fr = '', win = '', lw = '';
      for (const x of [300, 640, 880]) fr += `M${x} 1080L${x} 1960`;
      [1330, 1500, 1680, 1850].forEach((y, ri) => { for (let x = 50; x < 1080; x += 132) {
        const w = `M${x} ${y}h56v96h-56Z`; if ((x / 132 + ri * 3) % 5 < 1) lw += w; else win += w; } });
      D.s(fr, { w: 2, color: C.inkSoft, alpha: 0.35 });
      D.s(win, { w: 1.8, color: C.inkSoft, alpha: 0.4 });
      const lit = P0(root, lw, C.gold, 0.35);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.6);
          D.reveal(1);
          for (const q of puffs) {
            const u = (q.ph + lt * 0.08) % 1, top = q.y - CEIL - 50;
            const rise = Math.min(1, u / 0.6), side = Math.max(0, (u - 0.5) / 0.5);
            const y = q.y - top * (0.25 * rise + 0.75 * (1 - (1 - rise) ** 1.3)), x = q.x + q.side * (10 * rise + 340 * side * side);
            const s = q.s * (0.6 + 0.75 * u);
            q.e.setAttribute('d', BTL.E(x, y, s * (1 + 1.5 * side), s * (1 - 0.3 * side)));
            q.e.setAttribute('fill-opacity', (0.5 * clamp01(u * 25) * (1 - 0.6 * u)).toFixed(3));
          }
          const aw = cue(cues, 'warm', at); fade(wl, BTL.ease(lt, aw - 0.3, 0.8)); warm.set(0.06 + 0.06 * BTL.ease(lt, aw - 0.3, 1));
          spread.update(lt, 0.5 + 0.6 * BTL.ease(lt, 0, dur));
          const n = BTL.ease(lt, at - 0.2, 0.9);
          ceil.setAttribute('stroke', n > 0.5 ? C.gold : C.inkSoft);
          ceil.setAttribute('stroke-opacity', (0.7 + 0.3 * n).toFixed(3));
          lit.setAttribute('fill-opacity', (0.3 + 0.05 * Math.sin(lt * 0.7)).toFixed(3));
        },
      };
    },
  };

  // ------------------------------------------------------------------ a man vanishing a few metres away
  SH.bt_smog_walk = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), GY = 960;
      const back = fog(root, defs, 51, band(51, 300, 1150, 8, 0.42, 560, 260));
      // the street in perspective: the kerb and railings run to a point lost in the fog
      P0(root, `M-60 ${GY}L1140 ${GY}L1140 1960L-60 1960Z`, mix(C.paper, C.paperLight, 0.45), 1);
      L0(root, `M-60 1560L470 ${GY}M1140 1500L640 ${GY}`, C.inkSoft, 3, 0.7);
      let rails = ''; for (let i = 0; i < 9; i++) { const u = i / 9, x = 1140 - 500 * (1 - (1 - u) ** 1.6), y = 1500 - 540 * (1 - (1 - u) ** 1.6), h = 260 * (1 - 0.8 * (1 - (1 - u) ** 1.6)); rails += `M${f1(x)} ${f1(y)}L${f1(x)} ${f1(y - h)}`; }
      L0(root, rails + 'M1140 1240L640 930', C.inkSoft, 2.5, 0.45);
      const man = el(root, 'g');
      BTL.person(man, 'stand', 0, 0, 420, { color: SIL(), rim: C.inkSoft });
      // hat brim + coat line
      P0(man, 'M-40 -398L40 -398L30 -412L22 -440L-22 -440L-30 -412Z', SIL(), 1);
      L0(man, 'M-40 -398L40 -398', C.inkSoft, 2, 0.8);
      const front = fog(root, defs, 57, band(57, 500, 1150, 6, 0.3, 480, 220));
      const meas = L0(root, 'M548 1140L555 960', C.gold, 3.5, 0.9, { pathLength: 1 });
      const ticks = L0(root, 'M524 1140L572 1140M535 960L575 960', C.gold, 3.5, 0);
      const lab = txt(root, P.label || 'birkaç metre', 720, 1060, 52, { font: BTL.LO, italic: true, color: C.gold });
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.5);
          const p = BTL.ease(lt, 0, dur + 1);
          const s = 0.95 - 0.3 * p, y = GY - 30 * p, sway = 0;
          man.setAttribute('transform', `translate(${f1(555 + sway)} ${f1(y)}) scale(${s.toFixed(3)})`);
          fade(man, 1 - 0.8 * BTL.ease(lt, 0.6, dur));
          back.update(lt, 1); front.update(lt, 0.7 + 0.5 * p);
          const n = BTL.ease(lt, at - 0.3, 0.7);
          draw(meas, n); ticks.setAttribute('stroke-opacity', (0.9 * n).toFixed(3)); fade(lab, BTL.ease(lt, at, 0.6));
        },
      };
    },
  };

  // ------------------------------------------------------------------ the bus and the conductor with a flare
  SH.bt_smog_bus = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(el(canvas(svg, W, H), 'g'), 'g', { transform: 'translate(0 -250)' }), GY = 1330;
      const back = fog(root, defs, 61, band(61, 300, 1100, 7, 0.36, 560, 240));
      street(root, GY, { seed: 8 });
      const bus = el(root, 'g'), D = BTL.drawing(bus);
      // front of a double-decker, centred at 600
      const body = `M370 ${GY - 10}L370 560C370 520 400 500 440 500L760 500C800 500 830 520 830 560L830 ${GY - 10}Z`;
      D.f(body, mix(C.paperLight, C.paper, 0.3), 1);
      D.s(body, { w: 4, color: C.ink });
      D.f('M400 560L800 560L800 640L400 640Z', SIL(), 1); D.s('M400 560L800 560L800 640L400 640Z', { w: 2.5, color: C.inkSoft });   // destination blind
      D.f('M400 670L590 670L590 830L400 830ZM610 670L800 670L800 830L610 830Z', SIL(), 1);
      D.s('M400 670L590 670L590 830L400 830ZM610 670L800 670L800 830L610 830Z', { w: 3, color: C.ink });
      D.s('M370 880L830 880', { w: 3, color: C.inkSoft });
      D.f('M400 910L800 910L800 1060L400 1060Z', SIL(), 1); D.s('M400 910L800 910L800 1060L400 1060Z', { w: 3, color: C.ink });
      D.s('M600 910L600 1060', { w: 2.5, color: C.inkSoft });
      D.f('M520 1100L680 1100L680 1220L520 1220Z', SIL(), 1);
      let gr = ''; for (let x = 532; x < 680; x += 16) gr += `M${x} 1106L${x} 1214`;
      D.s('M520 1100L680 1100L680 1220L520 1220Z', { w: 3, color: C.ink }); D.s(gr, { w: 1.6, color: C.inkSoft });
      D.s(`M380 ${GY - 10}L820 ${GY - 10}M350 1250L850 1250`, { w: 4, color: C.ink });
      const lights = [BTL.glow(svg, defs, 430, 1160, 190, C.gold, 0.4, root), BTL.glow(svg, defs, 770, 1160, 190, C.gold, 0.4, root)];
      const lamps = P0(root, BTL.E(430, 1160, 30, 30) + BTL.E(770, 1160, 30, 30), C.ink, 0.9);
      const mid = fog(root, defs, 67, band(67, 600, 1250, 5, 0.3, 460, 200));
      // the conductor in front, walking towards us with a flare held out to the side
      const man = el(root, 'g');
      BTL.person(man, 'stand', 0, 0, 460, { color: SIL(), rim: C.inkSoft });
      P0(man, 'M-42 -432L42 -432L32 -446L26 -470L-26 -470L-32 -446Z', SIL(), 1);   // cap
      const arm = el(man, 'g');
      L0(arm, 'M0 -350L100 -330L150 -390', SIL(), 22);
      L0(arm, 'M150 -390L158 -450', C.inkSoft, 7, 1);
      const fl = BTL.glow(svg, defs, 0, 0, 160, C.gold, 0.4, arm);
      fl.e.setAttribute('cx', 158); fl.e.setAttribute('cy', -470);
      const flame = P0(arm, '', C.gold, 0.95);
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.4);
          D.reveal(1);
          const p = BTL.ease(lt, 0, dur + 0.6);
          fade(bus, 0.45 + 0.45 * p);
          const ls = 0.45 + 0.4 * p; lights.forEach(l => l.set(0.32 * ls)); lamps.setAttribute('fill-opacity', (0.5 + 0.4 * p).toFixed(3));
          back.update(lt, 1); mid.update(lt, 1 - 0.4 * p);
          const s = 0.92 + 0.12 * p;
          man.setAttribute('transform', `translate(330 ${f1(GY + 40 + 40 * p)}) scale(${s.toFixed(3)})`);
          const n = BTL.ease(lt, at - 0.2, 0.9), b = 1 + 0.08 * Math.sin(lt * 2.3);
          flame.setAttribute('d', `M158 -450C${f1(136 - 6 * n)} -470 ${f1(148)} ${f1(-500 - 30 * n * b)} 158 ${f1(-520 - 46 * n * b)}C${f1(168)} ${f1(-500 - 30 * n * b)} ${f1(180 + 6 * n)} -470 158 -450Z`);
          fl.set(0.2 + 0.4 * n * b);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the opera stopped by fog in the hall
  SH.bt_smog_opera = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), SX0 = 140, SX1 = 940, TOP = 330, FLOOR = 1060;
      const lab = txt(root, P.label || 'La Traviata', 540, 100, 58, { font: BTL.LO, italic: true, color: C.inkSoft });
      // the stage box
      P0(root, `M${SX0} ${TOP}L${SX1} ${TOP}L${SX1} ${FLOOR}L${SX0} ${FLOOR}Z`, mix(C.paper, C.paperDark, 0.5), 1);
      const spot = BTL.glow(svg, defs, 540, 900, 300, C.gold, 0.3, root);
      P0(root, `M470 ${TOP}L610 ${TOP}L700 ${FLOOR}L380 ${FLOOR}Z`, C.gold, 0.06);
      const singer = el(root, 'g');
      BTL.person(singer, 'stand', 540, FLOOR - 10, 300, { color: SIL(), rim: C.inkSoft });
      // a long gown
      P0(singer, `M520 ${FLOOR - 160}L560 ${FLOOR - 160}L600 ${FLOOR - 8}L480 ${FLOOR - 8}Z`, SIL(), 1);
      L0(singer, `M520 ${FLOOR - 160}L480 ${FLOOR - 8}M560 ${FLOOR - 160}L600 ${FLOOR - 8}`, C.inkSoft, 2, 0.8);
      const stageFog = fog(root, defs, 71, [[180, 700, 460, 260, 0.5], [900, 820, 460, 260, 0.5], [540, 600, 520, 240, 0.4], [400, 980, 440, 160, 0.4], [700, 480, 420, 200, 0.4]]);
      // the curtain: falls on the cue (clipped to the stage box)
      const cid = 'smo' + (++uid); el(el(defs, 'clipPath', { id: cid }), 'path', { d: `M${SX0} ${TOP}L${SX1} ${TOP}L${SX1} ${FLOOR}L${SX0} ${FLOOR}Z` });
      const cw = el(root, 'g', { 'clip-path': `url(#${cid})` });
      const curtain = el(cw, 'g');
      let folds = ''; for (let x = SX0 + 50; x < SX1; x += 70) folds += `M${x} ${TOP - 760}L${x} ${TOP - 30}`;
      P0(curtain, `M${SX0} ${TOP - 760}L${SX1} ${TOP - 760}L${SX1} ${TOP}C${SX1 - 200} ${TOP + 14} ${SX0 + 200} ${TOP + 14} ${SX0} ${TOP}Z`, mix(C.paperLight, C.inkSoft, 0.35), 1);
      L0(curtain, folds, C.paperDark, 3, 0.45);
      L0(curtain, `M${SX0} ${TOP}C${SX1 - 200 - 400} ${TOP + 14} ${SX0 + 200 + 400} ${TOP + 14} ${SX1} ${TOP}`, C.gold, 3, 0.8);
      // proscenium: arch, columns, valance
      const D = BTL.drawing(root);
      const frame = `M60 1120L60 330C60 190 280 140 540 140C800 140 1020 190 1020 330L1020 1120L${SX1} 1120L${SX1} ${TOP}C${SX1} 250 760 220 540 220C320 220 ${SX0} 250 ${SX0} ${TOP}L${SX0} 1120Z`;
      D.f(frame, mix(C.paperLight, C.paper, 0.2), 1);
      D.s(frame, { w: 3.5, color: C.ink });
      D.s(`M100 1120L100 340M980 1120L980 340M${SX0 - 20} ${FLOOR}L${SX1 + 20} ${FLOOR}`, { w: 2, color: C.inkSoft });
      D.s('M480 160C500 140 580 140 600 160', { w: 3, color: C.gold });
      // audience: rows of heads down to the bottom of the frame
      let heads = '', shoulders = '';
      for (let row = 0; row < 7; row++) {
        const y = 1170 + row * 110, rr = 30 + row * 5, step = 92 + row * 16;
        for (let x = (row % 2) * step / 2 - 20; x < 1120; x += step) { heads += BTL.E(x, y, rr, rr * 1.15); shoulders += `M${f1(x - rr * 2.2)} ${f1(y + rr * 2.6)}C${f1(x - rr * 2)} ${f1(y + rr * 0.8)} ${f1(x + rr * 2)} ${f1(y + rr * 0.8)} ${f1(x + rr * 2.2)} ${f1(y + rr * 2.6)}Z`; }
      }
      P0(root, shoulders + heads, SIL(), 1);
      L0(root, heads, C.inkSoft, 1.4, 0.18);
      const hall = fog(root, defs, 79, band(79, 1150, 1700, 4, 0.22, 500, 160));
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.55);
          D.reveal(1); fade(lab, BTL.ease(lt, 0.1, 1));
          const p = BTL.ease(lt, 0, dur);
          stageFog.update(lt * 1.6, 0.25 + 1.0 * p);
          hall.update(lt, 0.5 + 0.6 * p);
          fade(singer, 1 - 0.75 * BTL.ease(lt, 0.4, dur * 0.9));
          spot.set(0.3 - 0.12 * p);
          const c = BTL.ease(lt, at, Math.max(1.4, dur - at));
          curtain.setAttribute('transform', `translate(0 ${f1(c * 730)})`);
        },
      };
    },
  };

  // ------------------------------------------------------------------ 4000 marks
  SH.bt_smog_count = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), n = P.n || 4000, cols = 80, rows = Math.ceil(n / cols);
      const x0 = 86, y0 = 590, sx = 11.4, sy = 10.4;
      const nm = P.marks === false, ny = nm ? 800 : 420;
      BTL.glow(svg, defs, 540, nm ? 760 : 520, 560, C.stain, nm ? 0.12 : 0.08, root);
      const note = txt(root, P.note || 'en az', 540, nm ? 560 : 230, 56, { font: BTL.LO, italic: true, color: C.inkSoft });
      const num = txt(root, '0', 540, ny, nm ? 260 : 190, { weight: 300, color: C.gold });
      const lab = txt(root, P.label || 'kişi', 540, ny + (nm ? 110 : 80), 60, { font: BTL.LO, italic: true });
      let d = '';
      for (let i = 0; i < n; i++) { const x = x0 + (i % cols) * sx, y = y0 + Math.floor(i / cols) * sy; d += `M${f1(x)} ${f1(y + 4)}l3 -7`; }
      const cid = 'smc' + (++uid), rect = el(el(defs, 'clipPath', { id: cid }), 'rect', { x: 0, y: y0 - 12, width: 1080, height: 0 });
      const marks = el(nm ? el(defs, 'g') : root, 'path', { d, stroke: C.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round', fill: 'none', 'stroke-opacity': 0.75, 'clip-path': `url(#${cid})` });
      const sub = P.sub ? txt(root, P.sub, 540, nm ? ny + 200 : y0 + rows * sy + 70, 46, { font: BTL.LO, italic: true, color: C.inkSoft }) : null;
      const haze = fog(root, defs, 83, nm ? band(83, 300, 1300, 7, 0.26, 520, 200) : band(83, 620, 1100, 5, 0.18, 500, 160));
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.3);
          fade(note, BTL.ease(lt, 0, 0.8));
          const p = BTL.ease(lt, at - 0.3, Math.max(0.8, 0.65 * dur - (at - 0.3)));   // reaches the total at ~65% of the shot
          rect.setAttribute('height', f1(p * (rows * sy + 20)));
          const v = Math.round(n * p);
          num.textContent = v >= 1000 ? `${Math.floor(v / 1000)}.${String(v % 1000).padStart(3, '0')}` : String(v);
          fade(num, BTL.ease(lt, at - 0.4, 0.6)); fade(lab, BTL.ease(lt, at, 0.8));
          if (sub) fade(sub, BTL.ease(lt, at + 1, 1));
          marks.setAttribute('stroke-opacity', (0.75 + 0.1 * Math.sin(lt * 0.6)).toFixed(3));
          haze.update(lt, 1);
        },
      };
    },
  };

  // ------------------------------------------------------------------ the act: the air clears
  SH.bt_smog_act = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const root = el(canvas(svg, W, H), 'g'), cx = 540;
      const light = BTL.glow(svg, defs, cx, 700, 600, C.stain, 0.12, root);
      const page = el(root, 'g', { transform: `translate(${cx} 700) rotate(-2)` });
      const D = BTL.drawing(page);
      const sheet = 'M-300 -430L300 -430L300 430L-300 430Z';
      D.f(sheet, C.paperLight, 1); D.s(sheet, { w: 3, color: C.ink });
      D.s('M-250 -380L250 -380M-250 -370L250 -370', { w: 1.6, color: C.inkSoft });
      // crown-like crest at the top
      D.s('M-40 -300L-30 -340L-14 -318L0 -350L14 -318L30 -340L40 -300Z', { w: 2.5, color: C.inkSoft });
      const T = P.title || ['Temiz Hava', 'Yasası'];
      const t1 = BTL.fit(txt(page, T[0], 0, -180, 92, { weight: 500 }), 520), t2 = BTL.fit(txt(page, T[1] || '', 0, -80, 92, { weight: 500 }), 520);
      const yr = txt(page, P.year || '1956', 0, 40, 76, { weight: 400, color: C.inkSoft });
      let lines = ''; for (let i = 0; i < 8; i++) { const y = 110 + i * 34, w = i === 7 ? 260 : 500; lines += `M${-250} ${y}L${-250 + w} ${y}`; }
      D.s(lines, { w: 2, color: C.inkSoft, alpha: 0.55 });
      const seal = L0(page, BTL.E(190, 360, 46, 46) + BTL.E(190, 360, 34, 34), C.inkSoft, 3, 0.9);
      const sealF = P0(page, BTL.E(190, 360, 46, 46), C.gold, 0);
      const clear = fog(root, defs, 91, band(91, 200, 1400, 9, 0.42, 520, 240));
      return {
        update(lt, dur, cues) {
          const at = cue(cues, 'hit', dur * 0.35);
          D.reveal(BTL.ease(lt, 0, 1.6));
          fade(t1, BTL.ease(lt, 0.5, 1)); fade(t2, BTL.ease(lt, 0.7, 1)); fade(yr, BTL.ease(lt, 0.9, 1));
          const n = BTL.ease(lt, at - 0.2, 1);
          yr.setAttribute('fill', n > 0.5 ? C.gold : C.inkSoft);
          seal.setAttribute('stroke', n > 0.5 ? C.gold : C.inkSoft); sealF.setAttribute('fill-opacity', (0.35 * n).toFixed(3));
          clear.update(lt, 1 - 0.9 * BTL.ease(lt, 0, dur + 0.5));
          light.set(0.12 + 0.08 * BTL.ease(lt, at, dur));
        },
      };
    },
  };
})();
