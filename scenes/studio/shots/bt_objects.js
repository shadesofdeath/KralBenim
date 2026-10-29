// Belgesel style object shots (docs/BELGESEL.md): one thing in the middle of a dark (or light) frame, drawn in once.
//   bt_object  P: {obj: "<BTL.OBJ name>", scale: 1, rot: 0, x, y, label, sub, glow: true, opts: {...}}   cues: show
//   bt_relic   P: {obj, scale, label, sub, extras: [{obj, x, y, scale, rot, at}], opts}   museum plinth + spotlight
//   bt_compare P: {mode: "length"|"profile", left: {label}, right: {label}}               two variants side by side
//   bt_trade   P: {n: 3}  cues: eq, one, two, three                                       a stone = three spoons
//   bt_lineup  P: {items: [{obj, at, scale, rot}]}                                         objects appear in a row on cues
//   bt_grid    P: {cols: 11, rows: 5}  cues: hit                                           many identical spoons, one lights up
//   bt_egg     cues: hit                                                                   a spoon's point pierces an empty egg shell
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const label = (g, s, x, y, size, o = {}) => svgText(g, s, x, y, size, Object.assign({ fill: o.color || C.ink, 'font-family': o.font || FR,
    'font-weight': o.weight || 400, opacity: 0 }, o.italic ? { 'font-style': 'italic' } : {}, o.anchor ? { 'text-anchor': o.anchor } : {}));
  const fade = (e, a) => e.setAttribute('opacity', clamp01(a).toFixed(3));
  const place = (parent, x, y, s, rot = 0) => el(parent, 'g', { transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` });

  SH.bt_object = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), x = P.x ?? W / 2, y = P.y ?? (portrait ? 620 : H * 0.45), ly = portrait ? 1000 : H * 0.73;
      const gl = P.glow === false ? null : BTL.glow(svg, defs, x, y, 520 * (P.scale || 1), C.stain, 0.16, g);
      const D = BTL.drawing(place(g, x, y, P.scale || 1, P.rot || 0));
      BTL.OBJ[P.obj || 'bonespoon'](D, P.opts || {});
      const drops = P.obj === 'hands' ? [0, 1, 2].map(i => el(g, 'path', { fill: C.blue, 'fill-opacity': 0 })) : [];
      const lab = P.label ? label(g, P.label, W / 2, ly, portrait ? 60 : 52, {}) : null;
      const sub = P.sub ? label(g, P.sub, W / 2, ly + (portrait ? 64 : 54), portrait ? 46 : 40, { font: LO, italic: true, color: C.inkSoft }) : null;
      return {
        update(lt, dur, cues) {
          const t0 = cue(cues, 'show', 0);
          D.reveal(BTL.ease(lt, t0, Math.min(3.2, Math.max(1.6, dur * 0.45))));
          if (gl) gl.set(0.16 * BTL.ease(lt, t0, 2));
          drops.forEach((e, i) => {   // a drop slips through the fingers now and then
            const T = 2.8, ph = ((lt - 1.2 - i * 0.93) % T + T) % T / T, s = P.scale || 1;
            const dx = x + (-200 + i * 40) * s, dy = y + (70 + ph * 220) * s;
            e.setAttribute('d', BTL.E(dx, dy, 6 * s, 9 * s));
            e.setAttribute('fill-opacity', lt < 1.2 ? 0 : (0.7 * (1 - ph)).toFixed(3));
          });
          if (lab) fade(lab, BTL.ease(lt, t0 + 1.2, 1.2));
          if (sub) fade(sub, BTL.ease(lt, t0 + 1.8, 1.2));
        },
      };
    },
  };

  SH.bt_relic = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = portrait ? W / 2 : W * (P.cx ?? 0.4), py = portrait ? 900 : H * 0.72, oy = portrait ? 640 : H * 0.5;
      const beam = el(g, 'path', { d: `M${cx - 70} 0L${cx + 70} 0L${cx + 430} ${py + 40}L${cx - 430} ${py + 40}Z`, fill: C.stain, 'fill-opacity': 0 });
      const gl = BTL.glow(svg, defs, cx, oy, 460, C.stain, 0, g);
      const ped = el(g, 'g');
      el(ped, 'path', { d: `M${cx - 330} ${py}L${cx + 330} ${py}L${cx + 300} ${py + 34}L${cx - 300} ${py + 34}Z`, fill: C.paperLight, stroke: C.inkSoft, 'stroke-width': 2 });
      el(ped, 'path', { d: `M${cx - 300} ${py + 34}L${cx + 300} ${py + 34}L${cx + 300} ${H + 20}L${cx - 300} ${H + 20}Z`, fill: C.paperDark, stroke: C.inkSoft, 'stroke-width': 2 });
      el(ped, 'path', { d: BTL.E(cx, py + 6, 260, 16), fill: C.paperDark, 'fill-opacity': 0.8 });
      const D = BTL.drawing(place(g, cx + (P.dx || 0), oy + (P.dy || 0), P.scale || 0.9, P.rot || 0));
      BTL.OBJ[P.obj || 'pot'](D, P.opts || {});
      const ex = (P.extras || []).map(x => { const d = BTL.drawing(place(g, cx + x.x, oy + x.y, x.scale || 0.4, x.rot || 0)); BTL.OBJ[x.obj](d, x.opts || {}); return { x, d }; });
      // the museum label: beside the object on a wide frame, above it on a vertical one
      const right = P.labelSide !== 'left', lx = portrait ? W / 2 : right ? cx + 400 : cx - 400, an = portrait ? 'middle' : right ? 'start' : 'end';
      const ly = portrait ? 230 : H * 0.36, r0 = portrait ? lx - 90 : lx, r1 = portrait ? lx + 90 : lx + (right ? 180 : -180);
      const lab = P.label ? label(g, P.label, lx, ly, portrait ? 62 : 54, { anchor: an }) : null;
      const sub = P.sub ? label(g, P.sub, lx, ly + (portrait ? 64 : 58), portrait ? 44 : 40, { font: LO, italic: true, color: C.inkSoft, anchor: an }) : null;
      if (portrait) for (const t of [lab, sub]) if (t) BTL.fit(t, W - 100);
      const rule = P.label ? el(g, 'path', { d: `M${r0} ${ly + (portrait ? 100 : 88)}L${r1} ${ly + (portrait ? 100 : 88)}`, stroke: C.gold, 'stroke-width': 2, pathLength: 1, fill: 'none' }) : null;
      return {
        update(lt, dur, cues) {
          beam.setAttribute('fill-opacity', (0.07 * BTL.ease(lt, 0, 1.6)).toFixed(3));
          gl.set(0.2 * BTL.ease(lt, 0.2, 1.8));
          D.reveal(BTL.ease(lt, 0.2, Math.min(3, Math.max(1.6, dur * 0.4))));
          ex.forEach(({ x, d }, i) => d.reveal(BTL.ease(lt, cue(cues, x.at, 1.4 + i * 0.8), 1.6)));
          if (lab) fade(lab, BTL.ease(lt, 1, 1.2));
          if (sub) fade(sub, BTL.ease(lt, 1.5, 1.2));
          if (rule) draw(rule, BTL.ease(lt, 1.2, 1.2));
        },
      };
    },
  };

  SH.bt_compare = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      // side by side on a wide frame, one above the other on a vertical one
      const portrait = H > W, g = el(svg, 'g'), xs = portrait ? [W / 2, W / 2] : [W * 0.29, W * 0.71], ys = portrait ? [360, 800] : [H * 0.42, H * 0.42];
      BTL.glow(svg, defs, W / 2, portrait ? 600 : ys[0], 700, C.stain, 0.1, g);
      const sides = [P.left || {}, P.right || {}].map((sd, i) => {
        const gg = place(g, xs[i], ys[i], portrait && P.mode === 'profile' ? 0.85 : 1), D = BTL.drawing(gg);
        if (P.mode === 'profile') {   // side view of the bowl: deep with liquid vs flat with mash
          if (i === 0) {
            D.f('M-260-40C-240 80-120 130 0 130C120 130 240 80 260-40Z', C.paperLight, 1);
            D.f('M-232 0C-180 20 180 20 232 0C220 70 120 110 0 112C-120 110-220 70-232 0Z', C.blue, 0.45);
            D.s('M-260-40C-240 80-120 130 0 130C120 130 240 80 260-40', { w: 4 });
            D.s('M-232 0C-180 20 180 20 232 0', { w: 2.5, color: C.blue });
          } else {
            D.f('M-280 40C-200 70 200 70 280 40C220 96 120 108 0 108C-120 108-220 96-280 40Z', C.paperLight, 1);
            D.f('M-150 52C-120-20-40-40 0-40C50-40 120-20 150 52Z', C.gold, 0.55);
            D.s('M-280 40C-200 70 200 70 280 40C220 96 120 108 0 108C-120 108-220 96-280 40Z', { w: 4 });
            D.s('M-150 52C-120-20-40-40 0-40C50-40 120-20 150 52', { w: 3, color: C.gold });
          }
        } else {                       // same spoon, long handle vs short handle
          const sp = portrait ? place(gg, i === 0 ? 0 : -60, 0, 0.75, 0) : place(gg, 0, i === 0 ? 0 : 60, 0.85, -90);
          const d2 = BTL.drawing(sp);
          if (i === 0) BTL.OBJ.bonespoon(d2, {});
          else {
            d2.f('M-330 0C-330-60-250-78-170-70C-130-66-100-40-80-26C-20-24 20-22 60-24C80-34 110-30 112-4C114 20 84 30 62 22C20 22-20 24-80 26C-100 40-130 66-170 70C-250 78-330 60-330 0Z', C.paperLight, 1);
            d2.s('M-330 0C-330-60-250-78-170-70C-130-66-100-40-80-26C-20-24 20-22 60-24C80-34 110-30 112-4C114 20 84 30 62 22C20 22-20 24-80 26C-100 40-130 66-170 70C-250 78-330 60-330 0Z', { w: 4 });
            d2.s('M-305 0C-305-40-250-52-185-48C-140-44-112-24-112 0C-112 24-140 44-185 48C-250 52-305 40-305 0Z', { w: 2.5, color: C.inkSoft });
          }
          D.items.push(...d2.items);
        }
        const lab = sd.label ? label(g, sd.label, xs[i], portrait ? ys[i] + (P.mode === 'profile' ? 170 : 120) : H * 0.82, portrait ? 52 : 48, { font: LO, italic: true }) : null;
        return { D, lab };
      });
      return {
        update(lt, dur, cues) {
          sides.forEach((s, i) => {
            const t0 = cue(cues, i ? 'right' : 'left', i * dur * 0.4);
            s.D.reveal(BTL.ease(lt, t0, 2));
            if (s.lab) fade(s.lab, BTL.ease(lt, t0 + 0.8, 1));
          });
        },
      };
    },
  };

  SH.bt_trade = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      // stone = spoons: left to right on a wide frame, top to bottom on a vertical one
      const portrait = H > W, g = el(svg, 'g'), y = H * 0.44;
      const sx = portrait ? W / 2 : W * 0.27, sy = portrait ? 340 : y, ex = portrait ? W / 2 : W * 0.5, ey = portrait ? 590 : y;
      const gl = BTL.glow(svg, defs, sx, sy, 380, C.gold, 0, g);
      const S = BTL.drawing(place(g, sx, sy, 0.95, -6)); BTL.OBJ.stone(S);
      const eq = el(g, 'path', { d: `M${ex - 58} ${ey - 18}L${ex + 58} ${ey - 18}M${ex - 58} ${ey + 18}L${ex + 58} ${ey + 18}`, stroke: C.inkSoft, 'stroke-width': 4, pathLength: 1, fill: 'none', 'stroke-linecap': 'round' });
      const spoons = [0, 1, 2].slice(0, P.n || 3).map(i => { const D = BTL.drawing(place(g, portrait ? W / 2 : W * 0.73, portrait ? 780 + i * 115 : y - 120 + i * 120, 0.42, 0)); BTL.OBJ.woodspoon(D); return D; });
      return {
        update(lt, dur, cues) {
          S.reveal(BTL.ease(lt, 0, 1.8)); gl.set(0.18 * BTL.ease(lt, 0.5, 2));
          draw(eq, BTL.ease(lt, cue(cues, 'eq', dur * 0.35), 1));
          const names = ['one', 'two', 'three'], base = cue(cues, 'three', dur * 0.55);
          spoons.forEach((D, i) => D.reveal(BTL.ease(lt, cue(cues, names[i], base - 0.9 + i * 0.45), 1.4)));
        },
      };
    },
  };

  SH.bt_lineup = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      // a row on a wide frame, a 2 x 2 grid on a vertical one
      const portrait = H > W, g = el(svg, 'g'), L = P.items || [], n = L.length, y = H * 0.44, step = (W - 640) / Math.max(1, n - 1);
      const at = i => portrait ? [W * (i % 2 ? 0.73 : 0.27), 380 + Math.floor(i / 2) * 430] : [320 + i * step, y];
      BTL.glow(svg, defs, W / 2, portrait ? 600 : y, 800, C.stain, 0.08, g);
      const base = el(g, 'path', { d: portrait ? '' : `M120 ${y + 170}L${W - 120} ${y + 170}`, stroke: C.inkSoft, 'stroke-width': 2, pathLength: 1, fill: 'none', 'stroke-opacity': 0.6 });
      const items = L.map((it, i) => { const D = BTL.drawing(place(g, at(i)[0], at(i)[1], (it.scale || 0.42) * (portrait ? 1.05 : 1), it.rot || 0)); BTL.OBJ[it.obj](D, it.opts || {}); return { it, D }; });
      return {
        update(lt, dur, cues) {
          draw(base, BTL.ease(lt, 0, 2.4));
          items.forEach(({ it, D }, i) => D.reveal(BTL.ease(lt, cue(cues, it.at, 0.4 + i * dur * 0.2) - 0.2, 1.6)));
        },
      };
    },
  };

  SH.bt_grid = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cols = portrait ? 5 : P.cols || 11, rows = portrait ? 8 : P.rows || 5;
      const sx = (W - 260) / (cols - 1), sy = portrait ? 900 / (rows - 1) : (H * 0.72 - 150) / (rows - 1);
      const spoon = 'M-320 0C-320-62-268-86-206-86C-150-86-112-52-100-24C-40-16 120-14 280-22C320-24 344-10 344 0C344 10 320 24 280 22C120 14-40 16-100 24C-112 52-150 86-206 86C-268 86-320 62-320 0Z';
      const ci = Math.floor(rows / 2) * cols + Math.floor(cols / 2);
      const gl = BTL.glow(svg, defs, W / 2, 130 + Math.floor(rows / 2) * sy, 300, C.gold, 0, g);
      const all = el(g, 'g');
      for (let i = 0; i < cols * rows; i++) {
        if (i === ci) continue;
        el(all, 'path', { d: spoon, transform: `translate(${130 + (i % cols) * sx} ${130 + Math.floor(i / cols) * sy}) rotate(-30) scale(0.2)`, fill: 'none', stroke: C.inkSoft, 'stroke-width': 14 });
      }
      const one = el(g, 'path', { d: spoon, transform: `translate(${130 + (ci % cols) * sx} ${130 + Math.floor(ci / cols) * sy}) rotate(-30) scale(0.2)`, fill: C.paperLight, 'fill-opacity': 0, stroke: C.inkSoft, 'stroke-width': 14 });
      return {
        update(lt, dur, cues) {
          const th = cue(cues, 'hit', dur * 0.5), q = BTL.ease(lt, th, 2);
          fade(all, BTL.ease(lt, 0, 1.6) * (1 - 0.45 * q));
          one.setAttribute('stroke', q > 0.3 ? C.gold : C.inkSoft); one.setAttribute('fill-opacity', (0.9 * q).toFixed(3));
          gl.set(0.35 * q);
        },
      };
    },
  };

  SH.bt_egg = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W * (portrait ? 0.4 : 0.44), cy = portrait ? 600 : H * 0.42;
      const gl = BTL.glow(svg, defs, cx, cy, 460, C.stain, 0, g);
      const E0 = BTL.drawing(place(g, cx, cy, 1.05)); BTL.OBJ.egg(E0, {});
      const hole = BTL.drawing(place(g, cx, cy, 1.05)); hole.f(BTL.E(52, 130, 14, 18), C.paperDark, 1);
      hole.s('M52 112L64 86L58 70M66 140L94 152L104 172M38 142L18 166', { w: 2.5, color: C.inkSoft });
      const sp = el(g, 'g'), SP = BTL.drawing(place(sp, 0, 0, 0.9, 0)); BTL.OBJ.romanspoon(SP);   // scale 0.9 = sc below
      return {
        update(lt, dur, cues) {
          E0.reveal(BTL.ease(lt, 0, 2)); gl.set(0.16 * BTL.ease(lt, 0, 2));
          const th = cue(cues, 'hit', dur * 0.55), p = BTL.ease(lt, th - 1.6, 1.6);
          // the spoon comes in from the upper right along its own axis; its point stops in the shell
          const tipX = cx + 52 * 1.05, tipY = cy + 130 * 1.05, phi = 150, r = phi * Math.PI / 180, sc = 0.9;
          const off = 346 * sc + (1 - p) * 260;
          sp.setAttribute('transform', `translate(${(tipX - Math.cos(r) * off).toFixed(1)} ${(tipY - Math.sin(r) * off).toFixed(1)}) rotate(${phi})`);
          SP.reveal(BTL.ease(lt, 0.4, 1.6));
          hole.reveal(BTL.ease(lt, th, 0.8));
        },
      };
    },
  };
})();
