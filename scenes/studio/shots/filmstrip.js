// filmstrip: a sepia chronophotography plate: two strips of film whose frames develop one by one and show
// a falling cat rolling from upside down to feet-first (front half first, then the rear), with a big year on top.
// P: {year: "1894", name: "Étienne-Jules Marey", frames: 8,
//     rf: [180,150,90,30,0,0,0,0], rr: [180,180,170,130,70,20,0,0]}   (roll per frame, degrees; 0 = feet down)
// cues: hit (camera flash, the year slams in)
'use strict';

SHOTS.filmstrip = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg, defs } = ctx;
    const portrait = H > W, N = P.frames || 8, perRow = Math.ceil(N / 2);
    const bd = backdrop(svg, pal, W, H, 77, { rays: 0.05, cy: H * 0.3 });
    const RF = P.rf || [180, 150, 90, 30, 0, 0, 0, 0], RR = P.rr || [180, 180, 170, 130, 70, 20, 0, 0];
    const SEP0 = '#3a2a1c', SEP1 = '#140d08', CAT = '#f1e4c9', FILM = '#0d0a08';
    const gid = 'fs' + ctx.seed;
    const rg = el(defs, 'radialGradient', { id: gid + 'f', cx: '50%', cy: '45%', r: '65%' });
    el(rg, 'stop', { offset: '0', 'stop-color': SEP0 }); el(rg, 'stop', { offset: '1', 'stop-color': SEP1 });
    const fw = portrait ? 232 : 250, fh = portrait ? 205 : 190, gap = 22, hole = 34, sh = fh + hole * 2 + 10;
    const rowY = portrait ? [H * 0.37, H * 0.52] : [H * 0.42, H * 0.7];
    const year = svgText(svg, P.year || '1894', W / 2, portrait ? H * 0.235 : H * 0.2, portrait ? 230 : 170,
      { fill: pal.accent, 'font-family': 'Anton', 'letter-spacing': 6, style: `filter: drop-shadow(0 0 26px ${rgba(pal.accent, .5)})` });
    const name = svgText(svg, P.name || 'Étienne-Jules Marey', W / 2, (portrait ? H * 0.235 : H * 0.2) + 72, 50, { fill: pal.ink, 'font-weight': 800, opacity: 0.9 });
    const strips = rowY.map((cy, row) => {
      const g = el(svg, 'g');
      const n = perRow + 4, total = n * (fw + gap);
      el(g, 'rect', { x: -total / 2, y: -sh / 2, width: total, height: sh, fill: FILM, rx: 6 });
      for (let i = 0; i < n * 3; i++) for (const s of [-1, 1])
        el(g, 'rect', { x: -total / 2 + i * (total / (n * 3)) + 8, y: s * (sh / 2 - hole / 2 - 4) - 11, width: 26, height: 22, rx: 5, fill: '#e9dcc4', opacity: 0.85 });
      const frames = [];
      for (let i = 0; i < n; i++) {
        const k = i - 2, idx = row * perRow + k;            // two blank frames on each side
        const x = -total / 2 + i * (fw + gap) + gap / 2;
        const fg = el(g, 'g', { transform: `translate(${x + fw / 2} 0)` });
        el(fg, 'rect', { x: -fw / 2, y: -fh / 2, width: fw, height: fh, fill: `url(#${gid}f)` });
        const fr = { fg, idx: k >= 0 && k < perRow && idx < N ? idx : -1 };
        if (fr.idx >= 0) {
          fr.cat = el(fg, 'g');
          fr.flash = el(fg, 'rect', { x: -fw / 2, y: -fh / 2, width: fw, height: fh, fill: '#fff8e8', opacity: 0 });
          fr.num = svgText(fg, String(fr.idx + 1), -fw / 2 + 22, -fh / 2 + 34, 26, { fill: '#e9dcc4', 'font-weight': 800, opacity: 0.6 });
          drawCat(fr.cat, RF[fr.idx] ?? 0, RR[fr.idx] ?? 0, -fh * 0.18 + fh * 0.36 * fr.idx / Math.max(1, N - 1));
          const r = rng(fr.idx + 5);
          fr.grain = Array.from({ length: 10 }, () => el(fg, 'circle', { cx: (r() - 0.5) * fw, cy: (r() - 0.5) * fh, r: 1 + r() * 2, fill: '#f1e4c9', opacity: 0.25 }));
        }
        frames.push(fr);
      }
      return { g, cy, frames, row };
    });
    // pseudo-3D roll: limbs and ears point along cos(roll) (down when 0, up when 180, toward us at 90)
    function drawCat(g, rf, rr, dy) {
      const cf = Math.cos(rf * DEG2), cr = Math.cos(rr * DEG2), s = 0.95;
      const L = (c) => (Math.abs(c) < 0.3 ? 0.3 * Math.sign(c || 1) : c);
      const st = { stroke: CAT, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none' };
      const root = el(g, 'g', { transform: `translate(0 ${dy}) scale(${s})` });
      // tail (streams up while falling)
      el(root, 'path', Object.assign({ d: `M58 ${-4 * cr} Q100 ${-24 - 8 * cr} 92 ${-58 - 6 * cr}`, 'stroke-width': 13 }, st));
      // legs
      for (const [x, c, w] of [[-38, cf, 0], [-24, cf, 1], [32, cr, 0], [46, cr, 1]]) {
        const l = L(c);
        el(root, 'path', Object.assign({ d: `M${x} ${10 * Math.sign(l)} L${x + 6 * w - 3} ${52 * l} L${x + 6 * w - 12 * Math.sign(c >= 0 ? 1 : -1)} ${58 * l}`, 'stroke-width': 13, opacity: Math.abs(c) < 0.3 ? 0.75 : 1 }, st));
      }
      el(root, 'ellipse', { cx: 0, cy: 0, rx: 66, ry: 30, fill: CAT });
      // head + ears
      const hy = -14 * cf;
      el(root, 'circle', { cx: -74, cy: hy, r: 27, fill: CAT });
      const e = L(-cf);
      for (const ex of [-88, -66]) el(root, 'path', { d: `M${ex - 10} ${hy + 14 * e} L${ex} ${hy + 40 * e} L${ex + 10} ${hy + 14 * e} Z`, fill: CAT });
      el(root, 'circle', { cx: -86, cy: hy + 2 * Math.sign(-e), r: 4, fill: SEP1 });
    }
    return {
      update(lt, dur, cues, env) {
        const t = env.t; bd(t);
        const hit = cue(cues, 'hit', dur * 0.5), hp = punch(lt, hit, 0.8);
        const yp = spring(lt, hit - 0.15, 0.6);
        year.setAttribute('opacity', clamp01(yp * 1.4));
        const yy = (portrait ? H * 0.235 : H * 0.2) - 70;
        year.setAttribute('transform', `translate(${W / 2} ${yy}) scale(${lerp(1.6, 1, yp) * (1 + 0.06 * hp)}) translate(${-W / 2} ${-yy})`);
        name.setAttribute('opacity', 0.9 * prog(lt, hit + 0.15, 0.5));
        const step = Math.min(0.24, Math.max(0.12, (dur - 0.6) / (N + 2)));
        strips.forEach(S => {
          const drift = (S.row ? 1 : -1) * (30 * Math.sin(t * 0.35) + 10 * lt);
          const enter = spring(lt, S.row * 0.15, 0.7);
          S.g.setAttribute('transform', `translate(${W / 2 + drift + (1 - enter) * (S.row ? 500 : -500)} ${S.cy}) rotate(${S.row ? 2.5 : -2.5})`);
          S.frames.forEach(fr => {
            if (fr.idx < 0) return;
            const at = 0.25 + fr.idx * step, dev = prog(lt, at, 0.35), fl = punch(lt, at, 0.5) + 0.6 * hp;
            fr.cat.setAttribute('opacity', dev * (0.92 + 0.08 * Math.sin(t * 9 + fr.idx)));
            fr.flash.setAttribute('opacity', Math.min(0.85, fl));
            fr.grain.forEach((g, i) => g.setAttribute('opacity', 0.3 * (0.5 + 0.5 * Math.sin(t * 13 + i * 2.1 + fr.idx))));
          });
        });
      },
    };
  },
};
