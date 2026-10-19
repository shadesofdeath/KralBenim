// catxray: 2D x-ray views of a cat.
//   mode "ear":   giant front-view cat head turning from upside down to upright while the inner-ear balance organ
//                 (semicircular canals) glows and a world-fixed arrow keeps pointing UP.
//   mode "bones": side-view cat silhouette whose body follows a flexing spine; the vertebrae light up one by one,
//                 then a small free-floating collarbone (not joined to the skeleton) glows and wiggles.
// P: {mode, up: "YUKARI", label: "İÇ KULAK", sub: "denge organı", spine: "ESNEK OMURGA", clavicle: "SERBEST KÖPRÜCÜK",
//     fur: "#e8964a", stripe: "#a8541f", rot0: 160, kitten: true (ear mode: big-eyed kitten head bobbing, no x-ray, label only)}
// cues: ear: hit (organ lights), turn (head rights itself); bones: left (spine), right (collarbone)
'use strict';

SHOTS.catxray = {
  kind: '2d',
  build(ctx) {
    const { P, pal, W, H, svg, defs } = ctx;
    const mode = P.mode || 'ear', portrait = H > W;
    const FUR = P.fur || '#e8964a', STR = P.stripe || '#a8541f', CREAM = '#fbe9d2', PINK = '#f29aa6';
    const bd = backdrop(svg, pal, W, H, 57, { rays: 0.06, cy: H * 0.36 });
    const gid = 'cx' + ctx.seed;
    const glow = el(defs, 'filter', { id: gid + 'g', x: '-50%', y: '-50%', width: '200%', height: '200%' });
    el(glow, 'feGaussianBlur', { stdDeviation: 7, result: 'b' });
    const fm = el(glow, 'feMerge'); el(fm, 'feMergeNode', { in: 'b' }); el(fm, 'feMergeNode', { in: 'SourceGraphic' });
    const T = (node, s) => node.setAttribute('transform', s);
    if (mode === 'ear') return earMode();
    return bonesMode();

    function earMode() {
      const cx = W / 2, cy = (portrait ? H * 0.295 : H * 0.5) + (P.kitten ? 80 : 0), R = (portrait ? 240 : 230) * (P.kitten ? 0.85 : 1);
      const rg = el(defs, 'radialGradient', { id: gid + 'h', cx: '45%', cy: '40%', r: '70%' });
      el(rg, 'stop', { offset: '0', 'stop-color': shade(FUR, 0.18) }); el(rg, 'stop', { offset: '1', 'stop-color': shade(FUR, -0.25) });
      // world-fixed "up" guide (behind the head)
      const guide = el(svg, 'line', { x1: cx, x2: cx, y1: cy + R * 1.3, y2: cy - R * 1.5, stroke: pal.accent2, 'stroke-width': 4, 'stroke-dasharray': '14 18', opacity: 0.35 });
      const head = el(svg, 'g');
      const ears = [-1, 1].map(s => {
        const g = el(head, 'g');
        el(g, 'path', { d: `M${s * R * 0.25} ${-R * 0.75} L${s * R * 0.95} ${-R * 1.3} L${s * R * 0.92} ${-R * 0.35} Z`, fill: shade(FUR, -0.08), 'stroke-linejoin': 'round', stroke: shade(FUR, -0.08), 'stroke-width': 30 });
        el(g, 'path', { d: `M${s * R * 0.42} ${-R * 0.72} L${s * R * 0.86} ${-R * 1.12} L${s * R * 0.83} ${-R * 0.5} Z`, fill: PINK, 'stroke-linejoin': 'round', stroke: PINK, 'stroke-width': 14 });
        return g;
      });
      el(head, 'ellipse', { cx: 0, cy: 0, rx: R * 1.05, ry: R * 0.92, fill: `url(#${gid}h)` });
      for (const [x, w] of [[-0.18, 1], [0, 1.2], [0.18, 1]]) path(head, `M${x * R} ${-R * 0.88} L${x * R * 0.8} ${-R * 0.5}`, STR, 22 * w, { opacity: 0.8 });
      for (const s of [-1, 1]) { path(head, `M${s * R * 1.02} ${-R * 0.1} L${s * R * 0.72} ${-R * 0.02}`, STR, 18, { opacity: 0.7 }); path(head, `M${s * R * 1.0} ${R * 0.14} L${s * R * 0.74} ${R * 0.14}`, STR, 16, { opacity: 0.6 }); }
      const eyes = [-1, 1].map(s => {
        const g = el(head, 'g', { transform: `translate(${s * R * (P.kitten ? 0.42 : 0.4)} ${-R * (P.kitten ? 0.05 : 0.12)}) scale(${P.kitten ? 1.6 : 1})` });
        el(g, 'ellipse', { rx: R * 0.25, ry: R * 0.2, fill: '#fff8ea' });
        el(g, 'ellipse', { rx: R * 0.19, ry: R * 0.19, fill: '#7cc75a' });
        const pup = el(g, 'ellipse', { rx: R * 0.06, ry: R * 0.16, fill: '#080808' });
        el(g, 'circle', { cx: -R * 0.06, cy: -R * 0.08, r: R * 0.05, fill: '#fff' });
        return { g, pup };
      });
      for (const s of [-1, 1]) el(head, 'ellipse', { cx: s * R * 0.16, cy: R * 0.33, rx: R * 0.2, ry: R * 0.15, fill: CREAM });
      el(head, 'path', { d: `M${-R * 0.1} ${R * 0.16} L${R * 0.1} ${R * 0.16} L0 ${R * 0.28} Z`, fill: PINK, stroke: PINK, 'stroke-width': 10, 'stroke-linejoin': 'round' });
      path(head, `M${-R * 0.16} ${R * 0.42} Q${-R * 0.08} ${R * 0.5} 0 ${R * 0.36} Q${R * 0.08} ${R * 0.5} ${R * 0.16} ${R * 0.42}`, '#5a2a1a', 7);
      for (const s of [-1, 1]) for (const k of [-1, 0, 1]) path(head, `M${s * R * 0.3} ${R * (0.32 + k * 0.06)} L${s * R * 1.25} ${R * (0.22 + k * 0.16)}`, '#fffaf0', 4, { opacity: 0.85 });
      // x-ray inner ear (right side of the head)
      const ox = R * 0.9, oy = -R * 0.33;
      const xr = el(head, 'g', { transform: `translate(${ox} ${oy})` });
      const xrBg = el(xr, 'circle', { r: R * 0.31, fill: rgba(pal.bg[0], 0.55), stroke: pal.accent2, 'stroke-width': 3, opacity: 0.0 });
      const organ = el(xr, 'g', { filter: `url(#${gid}g)`, transform: 'scale(0.82)' });

      const canals = [
        el(organ, 'ellipse', { cx: -R * 0.02, cy: -R * 0.13, rx: R * 0.13, ry: R * 0.16, fill: 'none', stroke: pal.accent, 'stroke-width': 11 }),
        el(organ, 'ellipse', { cx: R * 0.12, cy: -R * 0.02, rx: R * 0.16, ry: R * 0.07, fill: 'none', stroke: pal.accent, 'stroke-width': 11, transform: 'rotate(-20)' }),
        el(organ, 'ellipse', { cx: -R * 0.12, cy: R * 0.02, rx: R * 0.07, ry: R * 0.15, fill: 'none', stroke: pal.accent, 'stroke-width': 11, transform: 'rotate(25)' }),
      ];
      el(organ, 'circle', { cx: 0, cy: R * 0.04, r: R * 0.07, fill: pal.accent });
      const coch = path(organ, (() => { let d = ''; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 4.2, rr = R * (0.12 - 0.025 * i / 10); d += (i ? 'L' : 'M') + (R * 0.13 + Math.cos(a) * rr) + ' ' + (R * 0.2 + Math.sin(a) * rr); } return d; })(), pal.accent2, 9);
      // fluid sparkles inside the canals
      const dots = canals.map((c, i) => el(organ, 'circle', { r: 10, fill: '#fff' }));
      // world-fixed UP arrow from the organ
      const arrow = el(svg, 'g');
      const aHead = el(arrow, 'path', { fill: pal.accent, stroke: shade(pal.accent, -0.5), 'stroke-width': 4, 'stroke-linejoin': 'round', filter: `url(#${gid}g)` });
      const aTxt = svgText(arrow, P.up || 'YUKARI', 0, 0, 66, { fill: pal.ink, 'font-family': 'Anton', 'letter-spacing': 3 });
      if (P.kitten) { xr.remove(); arrow.remove(); guide.remove(); }
      const lab = el(svg, 'g');
      const lbT = svgText(lab, (P.label || 'İÇ KULAK').toLocaleUpperCase('tr-TR'), W / 2, portrait ? H * 0.585 : H * 0.88, portrait ? 92 : 70, { fill: pal.accent, 'font-family': 'Anton', 'letter-spacing': 2 });
      const lbS = svgText(lab, P.sub || 'denge organı', W / 2, (portrait ? H * 0.585 : H * 0.88) - (portrait ? 118 : 90), 48, { fill: pal.ink, 'font-weight': 800, opacity: 0.85 });
      if (portrait) { lbS.setAttribute('y', 1000); lbT.setAttribute('y', 945); }
      const rot0 = P.rot0 ?? 160;
      return {
        update(lt, dur, cues, env) {
          const t = env.t; bd(t);
          const hit = cue(cues, 'hit', dur * 0.35), turn = cue(cues, 'turn', hit + 0.5);
          const lit = prog(lt, hit - 0.1, 0.4), hp = punch(lt, hit, 0.7);
          const rp = progIO(lt, Math.min(hit - 0.1, 0.1), 1.1);
          const rot = P.kitten ? 0 : lerp(rot0, 0, rp) + 4 * Math.sin(t * 2.2) * (1 - 0.6 * rp);
          const enter = spring(lt, 0, 0.8), sc = (0.82 + 0.18 * enter) * (1 + 0.04 * hp) * (1 + 0.015 * Math.sin(t * 1.5));
          T(head, P.kitten ? `translate(${cx + 14 * Math.sin(t * 1.7)} ${cy - 18 * Math.abs(Math.sin(t * 2.6))}) scale(${sc})` : `translate(${cx} ${cy}) rotate(${rot}) scale(${sc})`);
          ears.forEach((e, i) => T(e, `rotate(${(i ? 1 : -1) * (P.kitten ? 6 : 3) * Math.sin(t * 3 + i)})`));
          eyes.forEach(e => { const bl = Math.sin(t * 1.1) > 0.97 ? 0.15 : 1; T(e.pup, `scale(1 ${bl})`); });
          xrBg.setAttribute('opacity', 0.9 * lit);
          organ.setAttribute('opacity', 0.25 + 0.75 * lit);
          canals.forEach((c, i) => c.setAttribute('stroke-width', 11 + 4 * hp + 2 * Math.sin(t * 5 + i)));
          coch.style.strokeDasharray = 'none'; coch.style.opacity = 0.3 + 0.7 * lit;
          dots.forEach((d, i) => {
            const c = canals[i], a = t * 3 + i * 2, rx = +c.getAttribute('rx'), ry = +c.getAttribute('ry');
            const tr = c.getAttribute('transform'), ang = tr ? parseFloat(tr.slice(7)) * DEG2 : 0;
            const px = +c.getAttribute('cx') + Math.cos(a) * rx, py = +c.getAttribute('cy') + Math.sin(a) * ry;
            d.setAttribute('cx', px * Math.cos(ang) - py * Math.sin(ang)); d.setAttribute('cy', px * Math.sin(ang) + py * Math.cos(ang));
            d.setAttribute('opacity', lit * (0.6 + 0.4 * Math.sin(t * 6 + i)));
          });
          // organ position on screen -> arrow straight up (world up), never rotating with the head
          const a = rot * DEG2, s = sc;
          const px = cx + (ox * Math.cos(a) - oy * Math.sin(a)) * s, py = cy + (ox * Math.sin(a) + oy * Math.cos(a)) * s;
          const ap = clamp01(lin(lt, turn - 0.05, 0.15)), gr = spring(lt, turn, 0.7) * (1 + 0.08 * punch(lt, turn + 0.5, 0.6));
          const ax = Math.min(W - 110, cx + R * 1.18 * s), y1 = py - R * 0.1 * s, ty = Math.min(y1 - 60, Math.max(portrait ? 300 : 140, y1 - 330 * gr));
          const sw = 22 * gr, hw = 62 * gr, hh = 90 * gr;
          aHead.setAttribute('d', `M${px} ${py - sw} Q${ax - sw} ${py - sw} ${ax - sw} ${y1 - 40} L${ax - sw} ${ty + hh} L${ax - hw} ${ty + hh} L${ax} ${ty} L${ax + hw} ${ty + hh} L${ax + sw} ${ty + hh} L${ax + sw} ${y1 - 40} Q${ax + sw} ${py + sw} ${px} ${py + sw} Z`);
          arrow.setAttribute('opacity', P.kitten ? 0 : ap);
          const tx = Math.min(W - 170, Math.max(170, ax));
          aTxt.setAttribute('x', tx); aTxt.setAttribute('y', ty - 20); aTxt.setAttribute('font-size', 66 * Math.max(0.3, gr));
          guide.setAttribute('x1', ax); guide.setAttribute('x2', ax); guide.setAttribute('opacity', P.kitten ? 0 : 0.35 * ap);
          guide.setAttribute('stroke-dashoffset', -t * 40);
          lab.setAttribute('opacity', prog(lt, hit, 0.5));
          T(lab, `translate(0 ${(1 - spring(lt, hit, 0.6)) * 40})`);
        },
      };
    }

    function bonesMode() {
      const y0 = portrait ? H * 0.37 : H * 0.5, x0 = portrait ? 250 : 560, LEN = portrait ? 560 : 640;
      const BODY = mix(pal.bg[1], pal.ink, 0.14);
      const rim = el(svg, 'g', { opacity: 0.55 }), body = el(svg, 'g');
      const mk = (g, pad, c) => ({
        torso: el(g, 'path', { fill: 'none', stroke: c, 'stroke-width': 230 + pad, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
        chest: el(g, 'circle', { r: 135 + pad / 2, fill: c }), hips: el(g, 'circle', { r: 125 + pad / 2, fill: c }),
        head: el(g, 'circle', { r: 108 + pad / 2, fill: c }),
        ears: [0, 1].map(() => el(g, 'path', { fill: c, stroke: c, 'stroke-width': 24 + pad, 'stroke-linejoin': 'round' })),
        legs: [0, 1, 2, 3].map(() => el(g, 'path', { fill: 'none', stroke: c, 'stroke-width': 58 + pad, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),
        tail: el(g, 'path', { fill: 'none', stroke: c, 'stroke-width': 44 + pad, 'stroke-linecap': 'round' }),
      });
      const shR = mk(rim, 18, pal.accent2), shB = mk(body, 0, BODY);
      const ribs = el(svg, 'g', { opacity: 0.45 });
      const ribP = Array.from({ length: 6 }, () => path(ribs, 'M0 0', pal.ink, 8));
      const NV = 20, verts = Array.from({ length: NV }, () => el(svg, 'rect', { width: 30, height: 40, rx: 10, fill: pal.ink }));
      const NT = 10, tverts = Array.from({ length: NT }, (_, i) => el(svg, 'rect', { width: 22 - i, height: 24 - i, rx: 7, fill: pal.ink }));
      const skull = el(svg, 'ellipse', { rx: 70, ry: 55, fill: 'none', stroke: pal.ink, 'stroke-width': 9, opacity: 0.6 });
      const eye = el(svg, 'ellipse', { rx: 16, ry: 22, fill: '#7cc75a' });
      const clav = el(svg, 'g', { filter: `url(#${gid}g)` });
      const clavB = path(clav, 'M-40 10 Q0 -14 40 10', pal.ink, 16);
      const clavR = el(clav, 'circle', { r: 64, fill: 'none', stroke: pal.accent2, 'stroke-width': 5, 'stroke-dasharray': '10 12' });
      const scap = el(svg, 'path', { fill: 'none', stroke: pal.ink, 'stroke-width': 9, opacity: 0.55 });
      const mkLabel = (txt, c) => {
        const g = el(svg, 'g');
        const ln = el(g, 'path', { fill: 'none', stroke: c, 'stroke-width': 5, 'stroke-linecap': 'round' });
        const dot = el(g, 'circle', { r: 11, fill: c });
        const tx = svgText(g, txt.toLocaleUpperCase('tr-TR'), 0, 0, portrait ? 84 : 66, { fill: c, 'font-family': 'Anton', 'letter-spacing': 2 });
        return { g, ln, dot, tx };
      };
      const lS = mkLabel(P.spine || 'Esnek omurga', pal.accent), lC = mkLabel(P.clavicle || 'Serbest köprücük', pal.accent2);
      const spineAt = (u, A, t) => {
        const x = x0 + LEN * u, y = y0 - A * Math.sin(Math.PI * u) + 18 * Math.sin(t * 1.3 + u * 3);
        return [x, y];
      };
      return {
        update(lt, dur, cues, env) {
          const t = env.t; bd(t);
          const cl = cue(cues, 'left', dur * 0.3), cr = cue(cues, 'right', dur * 0.65);
          // flex: arch up and down; stronger after the spine cue
          const flex = 0.35 + 0.65 * prog(lt, cl, 0.6);
          const A = flex * 110 * Math.sin(t * 1.9) + 20;
          const pts = Array.from({ length: 13 }, (_, i) => spineAt(i / 12, A, t));
          const dTorso = 'M' + pts.slice(1, 12).map(p => p.join(' ')).join(' L');
          const P0 = spineAt(0.1, A, t), P1 = spineAt(0.92, A, t), Pe = spineAt(1.0, A, t);
          const hx = x0 - 105, hy = P0[1] - 95 + 6 * Math.sin(t * 2);
          const tail = `M${Pe[0] + 20} ${Pe[1] - 20} Q${Pe[0] + 190} ${Pe[1] - 30 + 30 * Math.sin(t * 2)} ${Pe[0] + 150 + 30 * Math.sin(t * 1.7)} ${Pe[1] - 230}`;
          const legs = [[P0[0] - 10, P0[1], -1], [P0[0] + 50, P0[1], 1], [P1[0] - 40, P1[1], -1], [P1[0] + 15, P1[1], 1]];
          for (const [sh, pad] of [[shR, 18], [shB, 0]]) {
            sh.torso.setAttribute('d', dTorso);
            sh.chest.setAttribute('cx', P0[0] + 30); sh.chest.setAttribute('cy', P0[1] + 25);
            sh.hips.setAttribute('cx', P1[0]); sh.hips.setAttribute('cy', P1[1] + 15);
            sh.head.setAttribute('cx', hx); sh.head.setAttribute('cy', hy);
            sh.ears.forEach((e, i) => { const ex = hx - 50 + i * 70; e.setAttribute('d', `M${ex - 30} ${hy - 70} L${ex - 10 + i * 10} ${hy - 165} L${ex + 40} ${hy - 80} Z`); });
            sh.legs.forEach((l, i) => { const [lx, ly, s] = legs[i], sw = 14 * Math.sin(t * 2.4 + i * 1.3); l.setAttribute('d', `M${lx} ${ly + 40} L${lx + sw + s * 8} ${ly + 230} L${lx + sw + s * 8 - 32} ${ly + 262}`); });
            sh.tail.setAttribute('d', tail);
          }
          eye.setAttribute('cx', hx - 45); eye.setAttribute('cy', hy - 12);
          skull.setAttribute('cx', hx - 6); skull.setAttribute('cy', hy - 4);
          // vertebrae light up head -> tail at the spine cue
          verts.forEach((v, i) => {
            const u = 0.02 + 0.98 * i / (NV - 1), [x, y] = spineAt(u, A, t), [x2, y2] = spineAt(u + 0.01, A, t);
            const ang = Math.atan2(y2 - y, x2 - x) / DEG2;
            const on = prog(lt, cl + i * 0.035, 0.25), pk = punch(lt, cl + i * 0.035, 0.5);
            v.setAttribute('transform', `translate(${x} ${y - 30}) rotate(${ang}) scale(${1 + 0.35 * pk}) translate(-15 -20)`);
            v.setAttribute('fill', mix(pal.ink, pal.accent, on)); v.setAttribute('opacity', 0.55 + 0.45 * on);
            if (on > 0.5) v.setAttribute('filter', `url(#${gid}g)`); else v.removeAttribute('filter');
          });
          const tp = shB.tail, TL = tp.getTotalLength();
          tverts.forEach((v, i) => { const p = tp.getPointAtLength((i + 0.5) / NT * TL); v.setAttribute('x', p.x - 11); v.setAttribute('y', p.y - 12); v.setAttribute('fill', mix(pal.ink, pal.accent, prog(lt, cl + 0.7 + i * 0.03, 0.25))); v.setAttribute('opacity', 0.6); });
          ribP.forEach((r, i) => { const [x, y] = spineAt(0.16 + i * 0.07, A, t); r.setAttribute('d', `M${x} ${y - 20} Q${x + 40} ${y + 60} ${x + 10} ${y + 130}`); r.style.strokeDasharray = 'none'; r.style.opacity = 1; });
          scap.setAttribute('d', `M${P0[0] + 10} ${P0[1] - 50} L${P0[0] + 70} ${P0[1] - 30} L${P0[0] + 40} ${P0[1] + 70} Z`);
          // free collarbone: floats in front of the shoulder, unattached, and wobbles
          const ccx = P0[0] - 55 + 14 * Math.sin(t * 3.1) * (0.4 + prog(lt, cr, 0.4)), ccy = P0[1] + 85 + 10 * Math.cos(t * 2.6);
          const con = prog(lt, cr - 0.1, 0.4), cpk = punch(lt, cr, 0.7);
          clav.setAttribute('transform', `translate(${ccx} ${ccy}) rotate(${-20 + 18 * Math.sin(t * 2.8)}) scale(${1 + 0.3 * cpk + 0.2 * con})`);
          clavB.style.strokeDasharray = 'none'; clavB.style.opacity = 1; clavB.setAttribute('stroke', mix(pal.ink, pal.accent2, con));
          clavR.setAttribute('opacity', con * (0.7 + 0.3 * Math.sin(t * 5))); clavR.setAttribute('transform', `rotate(${t * 40})`);
          const enter = spring(lt, 0, 0.8);
          [rim, body].forEach(g => g.setAttribute('opacity', (g === rim ? 0.55 : 1) * clamp01(enter * 1.5)));
          // labels
          const place = (L, at, ax, ay, lx, ly) => {
            const a = prog(lt, at, 0.4), g = prog(lt, at + 0.1, 0.5);
            L.g.setAttribute('opacity', a);
            L.tx.setAttribute('x', lx); L.tx.setAttribute('y', ly);
            const yy = ly + (ly < ay ? 22 : -78);
            L.ln.setAttribute('d', `M${lx} ${yy} L${lerp(lx, ax, g)} ${lerp(yy, ay, g)}`);
            L.dot.setAttribute('cx', ax); L.dot.setAttribute('cy', ay); L.dot.setAttribute('opacity', g);
          };
          const sm = spineAt(0.55, A, t);
          place(lS, cl, sm[0], sm[1] - 30, W / 2 - 80, portrait ? y0 - 300 : y0 - 300);
          place(lC, cr, ccx, ccy + 20, W / 2, portrait ? y0 + 395 : y0 + 330);
        },
      };
    }
  },
};
