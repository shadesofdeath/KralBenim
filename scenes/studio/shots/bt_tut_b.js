// bt_tut_b: Tutankhamun's tomb, part 2 (belgesel style; kit window.TUTL from bt_tut.js).
//   bt_tut_shrine  P: {mode: "outer"|"nest"|"coffins"|"gold", label}  cues: n2, n3, n4, hit
//                  outer: one huge gilded shrine nearly wall to wall, a small figure beside it for scale.
//                  nest: the shrine's outline, three smaller shrines appear inside on n2, n3, n4.
//                  coffins: seen from above, a stone sarcophagus; three nested coffin outlines, the inner one gold on "hit".
//                  gold: the solid gold inner coffin from above, crook and flail; label (e.g. "110 kg") on "hit"
//   bt_tut_mask    P: {mode: "lit"|"dark"}   the gold mask, front view, in a pool of light (dark: the light grows slowly)
//   bt_tut_diary   P: {date, line}           an open notebook; the date, then one handwritten line writes itself
//   bt_tut_telegram P: {lines: [..], at: [cue..]}  a telegram form; pasted strips of type appear on cues
//   bt_tut_section P: {mode: "tomb"|"thieves"|"rubble"}  cues: t1, t2, hit   section through the valley floor: the
//                  small tomb (stair, corridor, antechamber, burial chamber). thieves: two gold tunnels on t1, t2, then
//                  the doors re-sealed (gold seals). rubble: a big tomb is cut in the cliff above; on "hit" its spoil
//                  pours down over the stair and huts appear on top
//   bt_tut_lamp    P: {mode: "lit"|"out"}    a night window, a small table with an oil lamp; out: the flame dies slowly
//   bt_tut_paper   P: {mode: "many"|"headline", head, sub}  many: five newspapers in a row, the middle one bordered in
//                  gold; the others fade. headline: one front page with a big headline
'use strict';
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const C = THEME_PARCHMENT, FR = BTL.FR, LO = BTL.LO;
  const { flame, seals, dust, P0, L0, label, fade, f1, rect, candleStand } = window.TUTL;
  // a dark chamber in the light theme: the dark is local (an irregular opening), a candle stands at its lower left,
  // a gold pool of light around the subject
  function chamber(g, svg, defs, cx, cy, rx, ry, seed) {
    P0(g, rect(-200, -200, 2120, 1800), C.paperLight, 1);
    const d = window.TUTL.blob(cx, cy, rx, ry, seed, 30);
    P0(g, d, C.ink, 0.95); L0(g, d, C.paperDark, 26, 0.5); L0(g, d, C.inkSoft, 10, 0.35);
    const c = candleStand(g, cx - rx * 0.78, cy + ry * 0.32, 0.8);
    return { c, pool: BTL.glow(svg, defs, cx, cy, Math.min(rx, ry) * 1.3, C.gold, 0.22, g) };
  }

  // ------------------------------------------------------------------ bt_tut_shrine
  // an anthropoid coffin seen from above, head to the left (origin = centre, ~700 x 220 at k = 1)
  const coffinD = k => {
    const s = (x, y) => `${f1(x * k)} ${f1(y * k)}`;
    return `M${s(-350, 0)}C${s(-350, -70)} ${s(-300, -110)} ${s(-230, -110)}C${s(-170, -110)} ${s(-150, -90)} ${s(-130, -96)}` +
      `C${s(0, -112)} ${s(200, -96)} ${s(310, -60)}C${s(350, -46)} ${s(360, 46)} ${s(310, 60)}C${s(200, 96)} ${s(0, 112)} ${s(-130, 96)}` +
      `C${s(-150, 90)} ${s(-170, 110)} ${s(-230, 110)}C${s(-300, 110)} ${s(-350, 70)} ${s(-350, 0)}Z`;
  };
  SH.bt_tut_shrine = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'outer', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const ch = chamber(g, svg, defs, 960, 480, 900, 430, 41), pool = ch.pool;
      if (mode === 'outer' || mode === 'nest') L0(g, 'M150 840L1770 840', C.inkSoft, 2.5, 0.8);
      const shrine = (G, k, gold) => {
        const x0 = 960 - 400 * k, x1 = 960 + 400 * k, yt = 840 - 560 * k;
        const D = BTL.drawing(G);
        D.f(rect(x0, yt, x1, 840), gold ? C.gold : C.paperLight, gold ? 0.55 : 1);
        D.f(`M${x0 - 30 * k} ${yt}L${x1 + 30 * k} ${yt}L${x1 + 50 * k} ${yt - 60 * k}L${x0 - 50 * k} ${yt - 60 * k}Z`, gold ? C.gold : C.paperLight, gold ? 0.8 : 1);
        D.s(rect(x0, yt, x1, 840), { w: 4 });
        D.s(`M${x0 - 30 * k} ${yt}L${x1 + 30 * k} ${yt}L${x1 + 50 * k} ${yt - 60 * k}L${x0 - 50 * k} ${yt - 60 * k}Z`, { w: 3.5 });
        D.s(`M960 ${yt + 40 * k}L960 840M${960 - 150 * k} ${yt + 40 * k}L${960 + 150 * k} ${yt + 40 * k}L${960 + 150 * k} 840M${960 - 150 * k} ${yt + 40 * k}L${960 - 150 * k} 840`, { w: 3 });
        if (k > 0.7) {
          let pat = ''; for (let y = yt + 70; y < 800; y += 60) for (const x of [x0 + 50, x0 + 110, x1 - 110, x1 - 50]) pat += `M${f1(x)} ${f1(y)}l0 30M${f1(x - 10)} ${f1(y + 8)}l20 0`;
          D.s(pat, { w: 2.5, color: C.ink, alpha: 0.6 });
          D.s(BTL.E(960 - 40 * k, 560, 6, 6) + BTL.E(960 + 40 * k, 560, 6, 6), { w: 3 });
        }
        return D;
      };
      if (mode === 'outer' || mode === 'nest') {
        L0(g, 'M470 120L470 840M1450 120L1450 840', C.inkSoft, 3, 0.7);
        const Ds = [shrine(el(g, 'g'), 1, true)];
        const inner = [0.8, 0.62, 0.45].map(k => { const G = el(g, 'g', { opacity: 0 }); Ds.push(shrine(G, k, false)); return G; });
        if (mode === 'outer') { for (const G of inner) G.remove(); BTL.person(g, 'stand', 1560, 840, 300, { face: -1, color: C.inkSoft, rim: C.paperDark }); }
        return {
          update(lt, dur, cues) {
            Ds[0].reveal(BTL.ease(lt, 0, 2.2)); pool.set(0.24 + 0.03 * Math.sin(lt * 2.1)); ch.c.fl.update(lt, 3, 1);
            if (mode === 'nest') ['n2', 'n3', 'n4'].forEach((c, i) => { const a = BTL.ease(lt, cue(cues, c, 0.8 + i * 1.2), 1); fade(inner[i], a); Ds[i + 1].reveal(a); });
          },
        };
      }
      if (mode === 'coffins') {
        const D = BTL.drawing(g);
        D.f(rect(500, 300, 1420, 760), C.paperLight, 1); D.s(rect(500, 300, 1420, 760), { w: 5 });
        D.s(rect(530, 330, 1390, 730), { w: 2.5, color: C.inkSoft });
        const cs = [1.12, 0.96, 0.8].map((k, i) => {
          const G = el(g, 'g', { transform: 'translate(960 530)', opacity: 0 });
          if (i === 2) var fillE = P0(G, coffinD(k), C.gold, 0);
          L0(G, coffinD(k), i === 2 ? C.gold : C.ink, i === 2 ? 5 : 3.5);
          return { G, fillE };
        });
        return {
          update(lt, dur, cues) {
            D.reveal(BTL.ease(lt, 0, 1.6)); pool.set(0.24 + 0.03 * Math.sin(lt * 2.1)); ch.c.fl.update(lt, 3, 1);
            cs.forEach((c, i) => fade(c.G, BTL.ease(lt, 1.0 + i * 0.9, 1)));
            cs[2].fillE.setAttribute('fill-opacity', (0.6 * BTL.ease(lt, cue(cues, 'hit', dur * 0.65), 1.4)).toFixed(3));
          },
        };
      }
      // gold: the inner coffin, large
      const G = el(g, 'g', { transform: 'translate(960 500) scale(1.25)' });
      const D = BTL.drawing(G);
      D.f(coffinD(1), C.gold, 0.75); D.s(coffinD(1), { w: 4 });
      D.f('M-330-40C-330-90-280-100-230-100L-150-90L-150 90L-230 100C-280 100-330 90-330 40Z', C.blue, 0.35);
      D.s('M-300-40C-280-20-280 20-300 40M-250-70C-210-40-210 40-250 70', { w: 3 });
      D.s('M-60-70C0-40 40 0 60 60M-60 70C0 40 40 0 60-60', { w: 6 });
      D.s('M60 60C80 80 100 70 90 50M60-60C80-90 70-110 50-100', { w: 5, color: C.ink });
      let feathers = ''; for (let x = 100; x < 300; x += 34) feathers += `M${x} -80C${x + 10} -20 ${x + 10} 20 ${x} 80`;
      D.s(feathers, { w: 2, color: C.ink, alpha: 0.6 });
      const gl = BTL.glow(svg, defs, 960, 500, 620, C.gold, 0, g);
      const lab = P.label ? label(g, P.label, 960, 800, 96, { weight: 300, color: C.gold }) : null;
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 2));
          const h = BTL.ease(lt, cue(cues, 'hit', dur * 0.45), 1.4);
          gl.set(0.12 + 0.18 * h); pool.set(0.2); ch.c.fl.update(lt, 3, 1); if (lab) fade(lab, h);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_mask
  SH.bt_tut_mask = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, mode = P.mode || 'lit', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 480 });
      const cx = 960, cy = 470;
      // soft darkness (no hard edge): stacked ink light-pools, a candle on the left
      P0(g, rect(-200, -200, 2120, 1800), C.paperLight, 1);
      BTL.glow(svg, defs, cx, cy - 20, 900, C.ink, 1, g); BTL.glow(svg, defs, cx, cy - 20, 560, C.ink, 0.9, g);
      const ch = { c: candleStand(g, cx - 560, cy + 120, 0.8), pool: BTL.glow(svg, defs, cx, cy, 520, C.gold, 0.2, g) };
      const gl = BTL.glow(svg, defs, cx, cy - 20, 460, C.gold, 0.2, g);
      const G = el(g, 'g', { transform: `translate(${cx} ${cy}) scale(0.95)` });
      const D = BTL.drawing(G);
      // collar: rows of beads in curved bands, behind everything
      const arc = k => `M${-210 - k * 16} ${150 + k * 10}C${-180 - k * 16} ${300 + k * 26} ${180 + k * 16} ${300 + k * 26} ${210 + k * 16} ${150 + k * 10}`;
      D.f(arc(0) + `L${210 + 5 * 16} ${150 + 50}C${180 + 5 * 16} ${300 + 130} ${-180 - 5 * 16} ${300 + 130} ${-210 - 5 * 16} ${150 + 50}Z`, C.gold, 0.85);
      for (let k = 0; k <= 5; k++) D.s(arc(k), { w: k % 2 ? 7 : 3, color: k % 2 ? C.blue : C.ink, alpha: k % 2 ? 0.85 : 1 });
      // nemes: crown and two lappets that narrow towards the chest
      const nem = 'M-108-30L-112 60L-118 190L-178 200C-192 120-200 40-198-10C-196-60-186-96-170-120C-158-170-140-226-118-238C-90-318 90-318 118-238C140-226 158-170 170-120C186-96 196-60 198-10C200 40 192 120 178 200L118 190L112 60L108-30Z';
      D.f(nem, C.gold, 0.9);
      const nid = 'tutnem' + (portrait ? 'p' : 'l'), ncp = el(defs, 'clipPath', { id: nid }); el(ncp, 'path', { d: nem });
      let str = ''; for (let i = -7; i <= 7; i++) str += `M${i * 13} -310L${i * 30} -40`;
      for (let y = -20; y < 210; y += 24) str += `M-210 ${y}L-108 ${y + 4}M108 ${y + 4}L210 ${y}`;
      D.s(str, { w: 6, color: C.blue, alpha: 0.8, parent: el(D.g, 'g', { 'clip-path': `url(#${nid})` }) });
      // face
      const face = 'M-98-206C-104-150-108-60-98 10C-86 80-40 120 0 124C40 120 86 80 98 10C108-60 104-150 98-206C60-224-60-224-98-206Z';
      D.f(face, C.paperLight, 1); D.f(face, C.gold, 0.62);
      // ears
      const ears = 'M-100-104C-126-110-130-48-104-38M100-104C126-110 130-48 104-38';
      // braided, curled beard
      const beard = 'M-20 120L-18 244C-18 264 18 264 18 244L20 120Z';
      D.f(beard, C.gold, 0.9);
      let br = ''; for (let y = 136; y < 248; y += 16) br += `M-17 ${y}L0 ${y + 9}L17 ${y}`;
      D.s(nem.replace('L108-30Z', 'L108-30'), { w: 3.5 }); D.s(face, { w: 3.5 }); D.s(ears, { w: 3 });
      D.s(beard, { w: 3 }); D.s(br, { w: 2, color: C.ink, alpha: 0.8 }); D.s('M18 246C34 248 40 230 28 220', { w: 3 });
      D.s('M-102-200C-50-218 50-218 102-200', { w: 3 });
      // brows, eyes with kohl lines, nose, mouth
      D.s('M-82-104C-64-118-36-118-18-106M18-106C36-118 64-118 82-104', { w: 6, color: C.blue });
      const eyes = 'M-80-76C-64-92-34-92-20-76C-36-62-64-62-80-76ZM20-76C34-92 64-92 80-76C64-62 34-62 20-76Z';
      D.f(eyes, C.paperLight, 1); D.s(eyes, { w: 3 });
      D.f(BTL.E(-50, -77, 10, 10) + BTL.E(50, -77, 10, 10), C.ink, 1);
      D.s('M-80-76L-114-68C-106-62-96-62-88-66M80-76L114-68C106-62 96-62 88-66', { w: 4, color: C.blue });
      D.s('M0-62C-2-30-10-4-12 10C-6 18 6 18 12 10', { w: 2.5 });
      D.s('M-30 54C-12 46 12 46 30 54M-26 56C-10 68 10 68 26 56', { w: 2.5 });
      // vulture and cobra on the brow
      D.f('M-4-214C-6-236 4-252 12-262C18-270 8-280 0-274C-8-268-14-252-12-236Z', C.gold, 1);
      D.s('M-4-214C-6-236 4-252 12-262C18-270 8-280 0-274C-8-268-14-252-12-236Z', { w: 2.5 });
      return {
        update(lt, dur) {
          D.reveal(BTL.ease(lt, 0, 2.6));
          const a = mode === 'dark' ? BTL.ease(lt, 0.3, Math.max(2, dur * 0.6)) : 1;
          gl.set((0.06 + 0.22 * a) * (1 + 0.05 * Math.sin(lt * 0.8))); ch.pool.set(0.08 + 0.14 * a);
          ch.c.fl.update(lt, 3, 1);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_diary
  SH.bt_tut_diary = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 640 : 470;
      BTL.glow(svg, defs, cx, cy, 640, C.stain, 0.25, g);
      const G = el(g, 'g', { transform: `translate(${cx} ${cy})${portrait ? ' scale(0.62)' : ''}` });
      const D = BTL.drawing(G);
      const L = 'M0-280C-150-300-420-300-560-270L-560 300C-420 270-150 270 0 290Z', R = 'M0-280C150-300 420-300 560-270L560 300C420 270 150 270 0 290Z';
      D.f(L, C.paperLight, 1); D.f(R, C.paperLight, 1); D.s(L, { w: 4 }); D.s(R, { w: 4 }); D.s('M0-280L0 290', { w: 2.5, color: C.inkSoft });
      let lines = ''; for (let y = -180; y < 260; y += 56) lines += `M-520 ${y}C-400 ${y - 10} -150 ${y - 10} -40 ${y}M40 ${y}C150 ${y - 10} 400 ${y - 10} 520 ${y}`;
      D.s(lines, { w: 1.5, color: C.blue, alpha: 0.4 });
      const date = label(G, P.date || '', -280, -200, 64, { weight: 400 });
      const id = 'tutdc' + Math.floor(cx), cp = el(defs, 'clipPath', { id }); const cr = el(cp, 'rect', { x: 40, y: -120, width: 0, height: 140 });
      const lg = el(G, 'g', { 'clip-path': `url(#${id})` });
      const line = svgText(lg, P.line || '', 290, -40, 62, { fill: C.ink, 'font-family': LO, 'font-style': 'italic' });
      BTL.fit(line, 470);
      const pen = el(G, 'g');
      L0(pen, 'M0 0L180 -150', C.ink, 10); L0(pen, 'M0 0L12 -10', C.gold, 10);
      return {
        update(lt, dur) {
          D.reveal(BTL.ease(lt, 0, 1.4)); fade(date, BTL.ease(lt, 0.8, 1));
          const p = BTL.ease(lt, 1.4, Math.max(1.5, dur * 0.55));
          cr.setAttribute('width', f1(500 * p));
          pen.setAttribute('transform', `translate(${f1(50 + 470 * p)} ${f1(-40 + 6 * Math.sin(lt * 9) * (p < 1 ? 1 : 0))})`);
          fade(pen, 1 - BTL.ease(lt, 1.4 + Math.max(1.5, dur * 0.55), 0.8));
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_telegram
  SH.bt_tut_telegram = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const portrait = H > W, g = el(svg, 'g'), cx = W / 2, cy = portrait ? 640 : 470;
      BTL.glow(svg, defs, cx, cy, 620, C.stain, 0.25, g);
      const G = el(g, 'g', { transform: `translate(${cx} ${cy})${portrait ? ' scale(0.62)' : ''}` });
      const D = BTL.drawing(G);
      D.f(rect(-560, -300, 560, 320), C.paperLight, 1); D.s(rect(-560, -300, 560, 320), { w: 4 });
      D.s('M-520-190L520-190M-520-170L520-170', { w: 2, color: C.inkSoft });
      const head = label(G, 'TELGRAF', 0, -215, 64, { weight: 600, spacing: '0.3em' });
      let ln = ''; for (let y = -120; y < 300; y += 70) ln += `M-500 ${y}L-300 ${y}`;
      D.s(ln, { w: 1.5, color: C.inkSoft, alpha: 0.5 });
      const strips = (P.lines || []).map((s, i) => {
        const y = -60 + i * 150, sg = el(G, 'g', { opacity: 0 });
        const t = svgText(sg, s, 0, y + 22, 78, { fill: C.ink, 'font-family': FR, 'font-weight': 500, 'letter-spacing': '0.06em' });
        BTL.fit(t, 900);
        el(sg, 'rect', { x: -480, y: y - 52, width: 960, height: 104, fill: C.paper, stroke: C.inkSoft, 'stroke-width': 2 });
        sg.appendChild(t);
        return { sg, at: (P.at || [])[i] };
      });
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.2)); fade(head, BTL.ease(lt, 0.6, 1));
          strips.forEach((s, i) => { const a = BTL.ease(lt, cue(cues, s.at, 1.2 + i * dur * 0.3), 0.9); fade(s.sg, a); s.sg.setAttribute('transform', `translate(0 ${f1((1 - a) * 12)})`); });
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_section (valley floor in section)
  SH.bt_tut_section = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'tomb', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      const GY = 400, r = rng(9);
      const ground = `M-200 ${GY}L1200 ${GY}C1300 ${GY} 1340 300 1400 200C1460 100 1600 60 2120 40L2120 1800L-200 1800Z`;
      P0(g, ground, C.paperDark, 1); L0(g, `M-200 ${GY}L1200 ${GY}C1300 ${GY} 1340 300 1400 200C1460 100 1600 60 2120 40`, C.inkSoft, 3);
      let str = ''; for (let y = GY + 60; y < 1060; y += 55 + r() * 25) str += `M-100 ${f1(y)}C600 ${f1(y + 14)} 1300 ${f1(y - 10)} 2020 ${f1(y + 6)}`;
      L0(g, str, C.inkSoft, 1.5, 0.3);
      const sky = BTL.glow(svg, defs, 700, 160, 600, C.stain, 0.18, g);
      // KV62: stair, corridor, antechamber, burial chamber
      const D = BTL.drawing(g);
      const stair = `M520 ${GY}L640 ${GY + 140}L700 ${GY + 140}L700 ${GY + 60}L640 ${GY}Z`;
      const tomb = stair + rect(700, GY + 80, 900, GY + 140) + rect(900, GY + 40, 1180, GY + 170) + rect(1080, GY + 170, 1300, GY + 330);
      D.f(tomb, C.ink, 0.85); D.s(tomb, { w: 3 });
      let st = ''; for (let i = 0; i < 6; i++) st += `M${540 + i * 18} ${GY + i * 23 + 20}l18 0`;
      D.s(st, { w: 2, color: C.inkSoft });
      const tag = label(g, 'KV62', 1340, GY + 300, 50, { font: LO, italic: true, anchor: 'start' });
      const gold = BTL.glow(svg, defs, 1190, GY + 250, 160, C.gold, 0, g);
      const extra = { t: [], seals: null, spoil: null, huts: null, kv9: null };
      if (mode === 'thieves') {
        extra.t = [`M440 ${GY - 60}C520 ${GY - 20} 600 ${GY + 60} 680 ${GY + 110}L960 ${GY + 110}`, `M380 ${GY - 40}C480 ${GY} 560 ${GY + 90} 690 ${GY + 120}L1060 ${GY + 120}L1160 ${GY + 230}`]
          .map(d => { const e = L0(g, d, C.gold, 5); e.setAttribute('stroke-dasharray', '0.02 0.015'); e.setAttribute('pathLength', 1); return e; });
        extra.seals = el(g, 'g', { opacity: 0 });
        for (const [x, y] of [[700, GY + 110], [900, GY + 105], [1080, GY + 250]]) { P0(extra.seals, BTL.E(x, y, 16, 22), C.gold, 0.95); L0(extra.seals, BTL.E(x, y, 16, 22), C.ink, 2); }
      }
      if (mode === 'rubble') {
        extra.kv9 = el(g, 'g');
        P0(extra.kv9, `M1440 170L2120 300L2120 360L1460 236Z`, C.ink, 0.85); L0(extra.kv9, `M1440 170L2120 300M1460 236L2120 360M1440 170L1460 236`, C.ink, 3);
        extra.spoil = P0(g, '', C.stain, 0.5); extra.spoilL = L0(g, '', C.inkSoft, 2.5);
        extra.chips = P0(g, '', C.inkSoft, 0.4);
        extra.huts = el(g, 'g', { opacity: 0 });
        for (const [x, w] of [[460, 150], [700, 170], [960, 140]]) { const d = `M${x} 0L${x} -60L${x + w * 0.5} -66L${x + w} -52L${x + w} 0`; P0(extra.huts, d + 'Z', C.paperLight, 1); L0(extra.huts, d, C.ink, 3); }
        extra.lab9 = label(g, 'yeni büyük mezar', 1640, 440, 46, { font: LO, italic: true, color: C.ink });
      }
      return {
        update(lt, dur, cues) {
          D.reveal(BTL.ease(lt, 0, 1.6)); fade(tag, BTL.ease(lt, 1, 1)); sky.set(0.17);
          gold.set(0.3 * BTL.ease(lt, 1.2, 1.4));
          if (mode === 'thieves') {
            const a1 = BTL.ease(lt, cue(cues, 't1', dur * 0.2), 1.4), a2 = BTL.ease(lt, cue(cues, 't2', dur * 0.4), 1.4);
            draw(extra.t[0], a1); draw(extra.t[1], a2);
            extra.t[0].setAttribute('stroke-dasharray', '0.02 0.015'); extra.t[1].setAttribute('stroke-dasharray', '0.02 0.015');
            const s = BTL.ease(lt, cue(cues, 'seal', dur * 0.7), 1.2);
            fade(extra.seals, s); extra.t.forEach(e => e.setAttribute('stroke-opacity', (1 - 0.6 * s).toFixed(3)));
          }
          if (mode === 'rubble') {
            fade(extra.lab9, BTL.ease(lt, 0.6, 1));
            const h = BTL.ease(lt, cue(cues, 'hit', dur * 0.3), Math.max(1.6, dur * 0.4));
            const top = GY - 150 * h;
            const d = `M${f1(380 - 60 * h)} ${GY}C${f1(600)} ${f1(top + 30)} ${f1(1100)} ${f1(top - 10)} ${f1(1300 + 140 * (1 - h))} ${f1(GY - 80 - 140 * h)}L1440 ${f1(170 + 60 * (1 - h))}L1460 236L1300 ${GY}Z`;
            extra.spoil.setAttribute('d', h > 0.01 ? d : '');
            extra.spoilL.setAttribute('d', h > 0.01 ? `M${f1(380 - 60 * h)} ${GY}C${f1(600)} ${f1(top + 30)} ${f1(1100)} ${f1(top - 10)} ${f1(1300 + 140 * (1 - h))} ${f1(GY - 80 - 140 * h)}L1440 ${f1(170 + 60 * (1 - h))}` : '');
            let ch = ''; const rr = rng(4);
            for (let i = 0; i < 70; i++) { const x = 420 + rr() * 980, y = GY - rr() * 140 * h + 10; if (h > 0.05) ch += BTL.E(x, y - (x - 420) * 0.12 * h, 4 + rr() * 6, 2 + rr() * 3); }
            extra.chips.setAttribute('d', ch);
            const hu = BTL.ease(lt, cue(cues, 'huts', dur * 0.75), 1.2);
            fade(extra.huts, hu); extra.huts.setAttribute('transform', `translate(0 ${f1(top + 24)})`);
          }
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_lamp
  SH.bt_tut_lamp = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'out', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 520 });
      P0(g, rect(-200, 820, 2120, 1800), C.paperDark, 1);
      L0(g, 'M-50 820L1970 820', C.inkSoft, 2.5, 0.8);
      const D = BTL.drawing(g);
      D.f(rect(1080, 160, 1500, 620), C.ink, 0.9); D.s(rect(1080, 160, 1500, 620) + 'M1290 160L1290 620M1080 390L1500 390', { w: 6, color: C.inkSoft });
      D.s(rect(1060, 140, 1520, 640), { w: 4 });
      const stars = el(g, 'g'); const rr = rng(5);
      for (let i = 0; i < 22; i++) P0(stars, BTL.E(1100 + rr() * 380, 180 + rr() * 420, 2.5, 2.5), C.paperLight, 0.8);
      P0(stars, 'M1420 230C1390 236 1380 280 1410 300C1380 300 1360 270 1370 246C1380 226 1400 222 1420 230Z', C.paperLight, 0.9);
      D.f(rect(560, 600, 900, 630), C.paperLight, 1); D.s(rect(560, 600, 900, 630) + 'M590 630L590 820M870 630L870 820', { w: 4 });
      D.f('M660 600C660 560 700 540 730 540C780 540 820 560 840 580L860 574L850 600Z', C.paperLight, 1);
      D.s('M660 600C660 560 700 540 730 540C780 540 820 560 840 580L860 574L850 600Z', { w: 3.5 });
      const gl = BTL.glow(svg, defs, 860, 520, 520, C.gold, 0.3, g);
      const fl = flame(g, 858, 572, 1.1);
      return {
        update(lt, dur) {
          D.reveal(BTL.ease(lt, 0, 1.4));
          const amp = mode === 'out' ? 1 - 0.92 * BTL.ease(lt, dur * 0.35, dur * 0.55) : 1;
          fl.update(lt, 3, amp); gl.set(0.3 * amp);
        },
      };
    },
  };

  // ------------------------------------------------------------------ bt_tut_paper
  function page(G, x, y, w, h, o = {}) {
    const g = el(G, 'g', { transform: `translate(${x} ${y})` });
    P0(g, rect(-w / 2, -h / 2, w / 2, h / 2), C.paperLight, 1); L0(g, rect(-w / 2, -h / 2, w / 2, h / 2), C.ink, 3);
    L0(g, `M${-w / 2 + 20} ${-h / 2 + 70}L${w / 2 - 20} ${-h / 2 + 70}M${-w / 2 + 20} ${-h / 2 + 78}L${w / 2 - 20} ${-h / 2 + 78}`, C.ink, 2);
    P0(g, rect(-w * 0.32, -h / 2 + 24, w * 0.32, -h / 2 + 52), C.ink, 0.75);
    let cols = ''; const n = o.cols || 3, cw = (w - 40) / n;
    for (let c = 0; c < n; c++) for (let yy = (o.top ?? -h / 2 + 110); yy < h / 2 - 24; yy += 18) cols += `M${f1(-w / 2 + 20 + c * cw + 6)} ${f1(yy)}L${f1(-w / 2 + 20 + (c + 1) * cw - 10)} ${f1(yy)}`;
    L0(g, cols, C.inkSoft, 2, 0.5);
    return g;
  }
  SH.bt_tut_paper = {
    kind: '2d',
    build({ P, W, H, svg, defs }) {
      const mode = P.mode || 'headline', { g } = BTL.stage(svg, W, H, { fx: 960, fy: 480 });
      const pool = BTL.glow(svg, defs, 960, 470, 700, C.stain, 0.26, g);
      if (mode === 'many') {
        const ps = [[300, 520], [630, 500], [960, 470], [1290, 500], [1620, 520]].map(([x, y], i) => {
          const G = el(g, 'g', { opacity: 0 }); page(G, x, y, i === 2 ? 340 : 280, i === 2 ? 480 : 400);
          if (i === 2) L0(G, rect(x - 186, y - 256, x + 186, y + 256), C.gold, 6);
          return G;
        });
        const lab = label(g, 'tek gazete', 960, 830, 52, { font: LO, italic: true, color: C.ink });
        return {
          update(lt, dur, cues) {
            pool.set(0.24);
            const h = BTL.ease(lt, cue(cues, 'hit', dur * 0.45), 1.4);
            ps.forEach((G, i) => fade(G, BTL.ease(lt, 0.2 + Math.abs(i - 2) * 0.35, 1) * (i === 2 ? 1 : 1 - 0.6 * h)));
            fade(lab, h);
          },
        };
      }
      const G = el(g, 'g', { opacity: 0 });
      page(G, 960, 480, 1040, 760, { top: 70, cols: 4 });
      const head = svgText(G, P.head || '', 960, 300, 104, { fill: C.ink, 'font-family': FR, 'font-weight': 700 });
      BTL.fit(head, 960);
      P0(G, rect(450, 330, 1470, 340), C.ink, 0.8);
      const sub = P.sub ? svgText(G, P.sub, 960, 400, 46, { fill: C.inkSoft, 'font-family': LO, 'font-style': 'italic' }) : null;
      return {
        update(lt) {
          pool.set(0.26); fade(G, BTL.ease(lt, 0, 1));
          head.setAttribute('opacity', BTL.ease(lt, 0.8, 1.2).toFixed(3));
          if (sub) sub.setAttribute('opacity', BTL.ease(lt, 1.6, 1.2).toFixed(3));
          G.setAttribute('transform', `translate(960 480) scale(${f1(1 + 0.03 * clamp01(lt / 8))}) translate(-960 -480)`);
        },
      };
    },
  };
})();
// same builders under their own names (coffins seen from above; the spoil of the later tomb in section)
(() => { const SH = window.SHOTS; SH.bt_tut_coffin = { kind: '2d', build: a => SH.bt_tut_shrine.build(a) }; })();
