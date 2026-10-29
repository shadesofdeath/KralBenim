// gal_a_portrait: a lecture hall at the University of Padua (02-galileo-teleskop): stone wall, a gilt oval frame with an
// ink portrait bust of the sitter (a GAL.person clipped to the oval, breathing), a brass name plate, two flickering wall
// candles, a red IOU note pinned to the frame corner that swings on a cue, and rows of wooden student benches plus a
// lectern in the near foreground (down to the frame bottom). Use with "set": false.
// P: {room: "lecture", frame: {x: 0.5, y: 0.4, rx: 300, ry: 340}, sitter: GAL.person (galileo by default),
//     plate: {text, at}, bill: {at, text: "BORÇ"}, labels}
// cues: plate.at, bill.at
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  let clipN = 0;
  SH.gal_a_portrait = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const G = window.GAL, sd = seed * 1000 + 71;
      const F = Object.assign({ x: 0.5, y: 0.36, rx: 250, ry: 290 }, P.frame || {});
      const fx = F.x * W, fy = F.y * H;
      const root = el(svg, 'g');
      const room = G.room(el(root, 'g'), sd + 1);
      const id = 'galport' + seed + '_' + (clipN++);
      const cp = el(defs || svg, 'clipPath', { id });
      el(cp, 'ellipse', { cx: fx, cy: fy, rx: F.rx, ry: F.ry });
      const bgF = inkEl(root, mix(INK.stain, INK.ink, 0.45));
      const inner = el(root, 'g', { 'clip-path': `url(#${id})` });
      const varn = inkEl(inner, mix(INK.stain, INK.ink, 0.25));
      const sc = 1.55, sitter = G.person(inner, Object.assign({ who: 'galileo', age: 'young', x: F.x, y: (fy + 330 * sc) / H, scale: sc, face: 'right', pose: 'idle' }, P.sitter || {}, { scale: sc }), sd + 2);
      const goldF = inkEl(root, INK.gold), goldL = inkEl(root), goldD = inkEl(root, mix(INK.gold, INK.ink, 0.35));
      const plateF = inkEl(root, mix(INK.gold, INK.paperLight, 0.3)), plateL = inkEl(root);
      const ptx = el(root, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 800, 'font-size': 52, 'text-anchor': 'middle', fill: INK.ink });
      ptx.textContent = (P.plate && P.plate.text) || 'Galileo Galilei';
      const candF = inkEl(root, INK.paperLight), flame = inkEl(root, INK.gold), flameR = inkEl(root, INK.red), candL = inkEl(root);
      const billG = el(root, 'g'), billF = inkEl(billG, INK.red), billL = inkEl(billG);
      const btx = el(billG, 'text', { 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': 50, 'text-anchor': 'middle', fill: INK.paperLight });
      btx.textContent = (P.bill && P.bill.text) || 'BORÇ';
      const benchF = inkEl(root, mix(INK.stain, INK.ink, 0.38)), benchT = inkEl(root, mix(INK.stain, INK.paperDark, 0.2)), benchL = inkEl(root);
      const lectF = inkEl(root, mix(INK.stain, INK.ink, 0.3)), lectL = inkEl(root);
      const labels = (P.labels || []).map((l, i) => G.label(root, l, W, H, sd + 50 + i));
      return {
        update(lt, dur, cues, env) {
          const t = env.t;
          room.update(t, W, H, { gy: 0.8 * H, kind: 'stone' });
          const op = spring(lt, 0, 0.8);
          const ring = inkEllipsePts(fx, fy, F.rx, F.ry, sd + 3, 26, 0, 0.004);
          bgF.setAttribute('d', inkLoop(ring, { seed: sd + 3, t, amp: 0.4 }));
          let vn = ''; for (let k = 0; k < 7; k++) vn += G.line([[fx - F.rx, fy - F.ry + k * 110], [fx + F.rx, fy - F.ry + k * 110 + 40]], sd + 4 + k, t, 10, 1) + ' ';
          varn.setAttribute('d', vn);
          sitter.update(lt, t, cues, W, H);
          const outer = inkEllipsePts(fx, fy, F.rx + 54, F.ry + 54, sd + 5, 26, 0, 0.004);
          goldF.setAttribute('d', inkLoop(outer, { seed: sd + 5, t, amp: 0.4 }) + ' ' + inkLoop(ring.slice().reverse(), { seed: sd + 3, t, amp: 0.4 }));
          goldF.setAttribute('fill-rule', 'evenodd');
          let gd = ''; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, x = fx + Math.cos(a) * (F.rx + 27), y = fy + Math.sin(a) * (F.ry + 27); gd += inkDot(x, y, 7, 7, sd + 10 + i, t) + ' '; }
          goldD.setAttribute('d', gd);
          goldL.setAttribute('d', G.ring(outer, sd + 6, t, 5, 0.4) + ' ' + G.ring(ring, sd + 7, t, 5, 0.4));
          // name plate
          const pa = P.plate ? G.atOr(cues, P.plate.at, 0) : 0, pk = spring(lt, pa, 0.7), py = fy + F.ry + 110;
          const pw = 460 * pk, pp = [[fx - pw / 2, py - 44], [fx + pw / 2, py - 44], [fx + pw / 2, py + 30], [fx - pw / 2, py + 30]];
          plateF.setAttribute('d', lt >= pa ? inkLoop(pp, { seed: sd + 40, t, amp: 0.4, smooth: false }) : '');
          plateL.setAttribute('d', lt >= pa ? G.ring(pp, sd + 41, t, 4, 0.4) : '');
          ptx.setAttribute('x', fx); ptx.setAttribute('y', py + 10); ptx.style.display = pk > 0.7 ? '' : 'none';
          // wall candles
          let cf = '', fl = '', fr = '', cl = '';
          [0.2, 0.8].forEach((u, i) => {
            const x = u * W, y = 0.36 * H, fk = Math.sin(t * 9 + i * 2) * 0.12 + Math.sin(t * 13 + i) * 0.08;
            const c = [[x - 16, y], [x + 16, y], [x + 16, y + 110], [x - 16, y + 110]];
            cf += inkLoop(c, { seed: sd + 60 + i, t, amp: 0.4, smooth: false }) + ' ';
            cl += G.ring(c, sd + 62 + i, t, 3.5, 0.4) + ' ' + G.line([[x - 50, y + 120], [x + 50, y + 120]], sd + 64 + i, t, 7) + ' ' + G.line([[x, y + 120], [x, y + 190]], sd + 66 + i, t, 6) + ' ';
            fl += inkLoop([[x, y - 70 * (1 + fk)], [x + 16, y - 24], [x, y - 4], [x - 16, y - 24]], { seed: sd + 68 + i, t, amp: 0.8 }) + ' ';
            fr += inkLoop([[x, y - 40 * (1 + fk)], [x + 7, y - 16], [x, y - 6], [x - 7, y - 16]], { seed: sd + 70 + i, t, amp: 0.6 }) + ' ';
          });
          candF.setAttribute('d', cf); flame.setAttribute('d', fl); flameR.setAttribute('d', fr); candL.setAttribute('d', cl);
          // IOU note pinned to the frame corner, swings in on its cue
          const ba = P.bill ? G.atOr(cues, P.bill.at, null) : null;
          if (ba != null && lt >= ba) {
            const k = spring(lt, ba, 0.8), sw = Math.sin((lt - ba) * 5) * 18 * Math.exp(-(lt - ba) * 1.2) + Math.sin(t * 1.4) * 3;
            const bx = fx + F.rx * 0.78, by = fy + F.ry * 0.62;
            billG.style.display = '';
            billG.setAttribute('transform', `translate(${G.f1(bx)} ${G.f1(by)}) rotate(${G.f1(sw + 8)}) scale(${G.f1(k * 100) / 100})`);
            const b = [[-90, 0], [90, -6], [96, 120], [-84, 126]];
            billF.setAttribute('d', inkLoop(b, { seed: sd + 80, t, amp: 0.5, smooth: false }));
            billL.setAttribute('d', G.ring(b, sd + 81, t, 4, 0.5) + ' ' + inkDot(0, 6, 9, 9, sd + 82, t) + ' ' + G.line([[-60, 96], [60, 92]], sd + 83, t, 3));
            btx.setAttribute('x', 4); btx.setAttribute('y', 72);
          } else billG.style.display = 'none';
          // student benches (two rows) + lectern in the foreground
          let bf = '', bt = '', bl = '';
          [[0.9, 0.86], [1.0, 1.0]].forEach(([v, s], r) => {
            const y = v * H, x0 = -60, x1 = W + 60, d = 46 * s;
            const top = [[x0, y - d], [x1, y - d], [x1, y], [x0, y]], front = [[x0, y], [x1, y], [x1, y + 120 * s], [x0, y + 120 * s]];
            bt += inkLoop(top, { seed: sd + 90 + r, t, amp: 0.4, smooth: false }) + ' ';
            bf += inkLoop(front, { seed: sd + 92 + r, t, amp: 0.4, smooth: false }) + ' ';
            bl += G.ring(top, sd + 94 + r, t, 4, 0.4) + ' ';
            for (let x = 120; x < W; x += 260) bl += G.line([[x + r * 80, y + 10], [x + r * 80, y + 110 * s]], sd + 96 + r * 20 + x, t, 2.4) + ' ';
          });
          benchF.setAttribute('d', bf); benchT.setAttribute('d', bt); benchL.setAttribute('d', bl);
          const lp = [[0.04 * W, 0.6 * H], [0.16 * W, 0.58 * H], [0.15 * W, 0.84 * H], [0.06 * W, 0.84 * H]];
          void lp;
          void op;
          labels.forEach(l => l.update(lt, t, cues));
        },
      };
    },
  };
})();
