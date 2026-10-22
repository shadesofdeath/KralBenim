// ag02_defter: a 1934 registry office in the parchment ink style (brand/kit/BRAND.md §3, §5).
// Front: a big open ledger whose "Soyadı" column fills in by hand, one row at a time, while a dip pen moves along the
// line (the left page holds illegible name scribbles). Back: a small queue of villagers shuffling toward a clerk who
// writes at his desk. The narrator (Kaşif / fez) stands beside the ledger and points at it.
// P: {header: "Soyadı", rows: ["Köse", "Hasırcı", "Kayserili"], at: [cue|sec, ...] (row starts, default staggered),
//     write: 0.55 (s per row), red: 2 (row index written in red, -1 none), queue: 3, clerk: true,
//     kasif: {x: 0.85, scale: 0.62, pose: "point", dir: -25, face: -1, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//     cam: {zoom: 1.06}, cover_empty: false (thumbnail shows the surname column still blank)}
// cues: hit (punch the ledger), plus whatever names P.at / kasif.seq use
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };

  function rigSeq(K, lt, cues) {
    const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
    (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
    segs.sort((a, b) => a.at - b.at);
    let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
    return { s: segs[i], p: i > 0 ? segs[i - 1] : null, since: lt - Math.max(0, segs[i].at) };
  }
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : 1);

  SH.ag02_defter = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 202;
      const portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const defs = el(svg, 'defs');
      const rows = P.rows || ['Köse', 'Hasırcı', 'Kayserili'];
      const redRow = P.red ?? rows.length - 1;
      const wr = P.write ?? 0.55;

      // ---------------------------------------------------------------- geometry
      const bx0 = portrait ? W * 0.03 : W * 0.2, bx1 = portrait ? W * 0.72 : W * 0.66;
      const by0 = portrait ? H * 0.41 : H * 0.36, by1 = portrait ? H * 0.635 : H * 0.8;
      const spine = (bx0 + bx1) / 2, bw = bx1 - bx0, bh = by1 - by0;
      const qy = portrait ? H * 0.375 : H * 0.33;            // queue ground line (behind the ledger)
      const rowY = i => by0 + bh * (0.36 + i * 0.205);
      const hdrY = by0 + bh * 0.17;
      const rx0 = spine + bw * 0.06;                          // right-page text x
      const fs = portrait ? 76 : 64;

      // ---------------------------------------------------------------- back plane: wall line, clerk desk, queue
      const back = el(cam, 'g');
      const wallR = mk(back, INK.inkSoft);
      const winF = mk(back, INK.paperLight), winR = mk(back, INK.inkSoft);
      const deskF = mk(back, INK.paperDark), deskR = mk(back);
      const queue = [];
      const nq = P.queue ?? 3;
      for (let i = 0; i < nq; i++) {
        const g = el(back, 'g');
        queue.push({ rig: KASIF.create(g, { scale: portrait ? 0.46 : 0.36, hat: false, seed: sd + 40 + i * 7 }),
          x0: (portrait ? 0.08 : 0.2) + i * (portrait ? 0.15 : 0.11), beard: i === 1 ? 'grey' : null });
      }
      const clerkG = el(back, 'g');
      const clerk = P.clerk === false ? null : KASIF.create(clerkG, { scale: portrait ? 0.46 : 0.36, hat: false, seed: sd + 90 });
      const deskTop = mk(back);                               // desk drawn in front of the seated clerk
      const deskFront = mk(back, INK.paperDark);
      const clerkPaper = mk(back, INK.paperLight), clerkPaperR = mk(back, INK.inkSoft);

      // ---------------------------------------------------------------- ledger
      const book = el(cam, 'g');
      const coverF = mk(book, INK.inkSoft), coverR = mk(book);
      const pageF = mk(book, INK.paperLight), pageR = mk(book);
      const ruleR = mk(book, INK.inkSoft);
      const scrib = mk(book, INK.ink);
      const hdr = el(book, 'text', { 'font-family': INK_FONT, 'font-size': fs, fill: INK.inkSoft, 'text-anchor': 'start' });
      hdr.textContent = P.header || 'Soyadı';
      const rowT = rows.map((s, i) => {
        const id = `ag02-clip-${seed}-${i}`;
        const cp = el(defs, 'clipPath', { id });
        const rect = el(cp, 'rect', { x: 0, y: 0, width: 0, height: H });
        const t = el(book, 'text', { 'font-family': INK_FONT, 'font-size': fs + 10, fill: i === redRow ? INK.red : INK.ink,
          'text-anchor': 'start', 'clip-path': `url(#${id})` });
        t.textContent = s;
        return { t, rect, w: 0 };
      });
      const bigQ = el(book, 'text', { 'font-family': "Fraunces, Georgia, serif", 'font-weight': 900, 'font-size': portrait ? 300 : 240,
        'text-anchor': 'middle', fill: INK.red, style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 14px` });
      bigQ.textContent = '?';
      const penR = mk(book), penNib = mk(book, INK.ink);
      const blot = mk(book, INK.ink, { 'fill-opacity': 0.85 });

      // ---------------------------------------------------------------- narrator
      const K = P.kasif === false ? null : Object.assign({ x: portrait ? 0.85 : 0.8, scale: portrait ? 0.87 : 0.55, pose: 'point', dir: -25, face: -1 }, P.kasif || {});
      const kG = el(root, 'g');
      const kas = K ? KASIF.create(el(kG, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      let lastStep = -1;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const z = lerp(1, (P.cam && P.cam.zoom) || 1.06, progIO(lt, 0, Math.max(1, dur)));
          const fx = W * 0.42, fy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.4) * 5)} ${f1(fy + Math.cos(lt * 0.3) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          // ledger springs in, then breathes with the hit punch
          const bs = spring(lt, 0, 0.7), bscl = lerp(0.85, 1, bs) * (1 + 0.05 * hit);
          const bcx = spine, bcy = (by0 + by1) / 2;
          const CV = P.cover_empty && document.documentElement.classList.contains('cover');
          back.style.display = CV ? 'none' : '';
          if (CV) {   // thumbnail: big ledger, blank surname column with a giant red "?" (queue and clerk hidden)
            const k = P.cover_scale ?? 1.15, cx = W * (P.cover_x ?? 0.42), cy = H * (P.cover_y ?? 0.47);
            book.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(-2.5) scale(${k}) translate(${f1(-bcx)} ${f1(-bcy)})`);
          } else {
            book.setAttribute('transform', `translate(${f1(bcx)} ${f1(bcy + (1 - bs) * 60)}) rotate(-2.5) scale(${bscl.toFixed(4)}) translate(${f1(-bcx)} ${f1(-bcy)})`);
          }
          bigQ.style.display = CV ? '' : 'none';
          if (CV) { const qb = boil(sd + 95, t, 1.5); bigQ.setAttribute('x', f1((spine + bx1) / 2 + qb[0])); bigQ.setAttribute('y', f1(rowY(1) + 90 + qb[1])); }

          // row timings
          const starts = rows.map((_, i) => atOr(cues, (P.at || [])[i], 0.25 + i * Math.max(wr + 0.1, Math.min(0.8, (dur - 0.6) / rows.length))));
          // thumbnail with P.cover_empty: the surname column is still blank (pen poised at the first row)
          const blank = P.cover_empty && document.documentElement.classList.contains('cover');
          let active = -1;
          rowT.forEach((r, i) => {
            if (!r.w) { try { r.w = r.t.getComputedTextLength(); } catch (e) { r.w = 0; } if (!r.w) r.w = rows[i].length * fs * 0.42; }
            const u = blank ? 0 : sm((lt - starts[i]) / wr);
            r.rect.setAttribute('x', f1(rx0 - 10)); r.rect.setAttribute('width', f1(Math.max(0, (r.w + 20) * u)));
            const b = boil(sd + 300 + i, t, 1.1);
            r.t.setAttribute('x', f1(rx0 + b[0])); r.t.setAttribute('y', f1(rowY(i) + b[1]));
            if (lt >= starts[i] - 0.15 && lt < starts[i] + wr + 0.1) active = i;
          });
          // pen: follows the row being written; otherwise rests at the last written row's end
          let px, py;
          if (blank) { active = -1; }
          if (blank) {
            px = rx0 + 110; py = rowY(0) - fs * 0.15;
          } else if (active >= 0) {
            const r = rowT[active], u = sm((lt - starts[active]) / wr);
            px = rx0 + r.w * u; py = rowY(active) - fs * 0.25 + Math.sin(lt * 38) * 6 * (u > 0 && u < 1 ? 1 : 0);
          } else {
            let last = -1; starts.forEach((s, i) => { if (lt >= s) last = i; });
            const r = last >= 0 ? rowT[last] : null;
            px = r ? rx0 + r.w + 30 : rx0 + 40; py = (last >= 0 ? rowY(last) : rowY(0)) - fs * 0.6 + Math.sin(lt * 2) * 6;
          }
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);
          if (blank) { penR.setAttribute('d', ''); penNib.setAttribute('d', ''); } else penR.setAttribute('d', inkPath([[px + 8, py - 16], [px + 170, py - 150]], O(60, { w: 10, taper: 0.1 })));
          if (!blank) penNib.setAttribute('d', inkLoop([[px, py], [px + 16, py - 30], [px + 4, py - 34], [px - 4, py - 10]], O(61, { smooth: false, amp: 0.6 })));

          if (redraw || lt < 0.05) {
            // wall and window behind the queue
            wallR.setAttribute('d', inkPath([[0, qy + 4], [W, qy - 4]], O(1, { w: 5 })));
            const wx = W * (portrait ? 0.6 : 0.5), wy = qy - (portrait ? 360 : 300), ww = portrait ? 120 : 110, wh = portrait ? 150 : 130;
            const wp = [[wx, wy], [wx + ww, wy], [wx + ww, wy + wh], [wx, wy + wh]];
            winF.setAttribute('d', inkLoop(wp, O(2, { smooth: false })));
            winR.setAttribute('d', inkPath(wp, O(3, { w: 5, closed: true, smooth: false })) + ' ' + inkPath([[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], O(4, { w: 4 })) + ' ' + inkPath([[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], O(5, { w: 4 })));
            // clerk desk (right)
            if (clerk) {
              const dx0 = W * (portrait ? 0.7 : 0.62), dx1 = W * (portrait ? 0.95 : 0.78), dt = qy - (portrait ? 105 : 90);
              const top = [[dx0 - 10, dt], [dx1 + 10, dt], [dx1 + 10, dt + 16], [dx0 - 10, dt + 16]];
              deskTop.setAttribute('d', inkPath(top, O(10, { w: 6, closed: true, smooth: false })));
              const front = [[dx0, dt + 16], [dx1, dt + 16], [dx1, qy], [dx0, qy]];
              deskFront.setAttribute('d', inkLoop(front, O(11, { smooth: false })));
              deskR.setAttribute('d', '');
              deskF.setAttribute('d', '');
              const fr = inkPath(front, O(12, { w: 5, closed: true, smooth: false }));
              deskTop.setAttribute('d', deskTop.getAttribute('d') + ' ' + fr);
              const pp = [[dx0 + 30, dt - 4], [dx0 + 120, dt - 10], [dx0 + 126, dt - 2], [dx0 + 36, dt + 4]];
              clerkPaper.setAttribute('d', inkLoop(pp, O(13, { smooth: false })));
              clerkPaperR.setAttribute('d', inkPath(pp, O(14, { w: 3, closed: true, smooth: false })));
            }
            // ledger: cover, pages, rules, scribbles
            const cv = [[bx0 - 16, by0 + 10], [spine, by0 + 22], [bx1 + 16, by0 + 10], [bx1 + 18, by1 + 18], [spine, by1 + 30], [bx0 - 18, by1 + 18]];
            coverF.setAttribute('d', inkLoop(cv, O(20, { smooth: false })));
            coverR.setAttribute('d', inkPath(cv, O(21, { w: 6, closed: true, smooth: false })));
            const lp = [[bx0, by0 + 6], [bx0 + bw * 0.25, by0 - 8], [spine - 6, by0 + 6], [spine - 6, by1 + 8], [bx0 + bw * 0.25, by1 - 4], [bx0, by1 + 4]];
            const rp = [[spine + 6, by0 + 6], [bx1 - bw * 0.25, by0 - 8], [bx1, by0 + 6], [bx1, by1 + 4], [bx1 - bw * 0.25, by1 - 4], [spine + 6, by1 + 8]];
            pageF.setAttribute('d', inkLoop(lp, O(22)) + ' ' + inkLoop(rp, O(23)));
            pageR.setAttribute('d', inkPath(lp, O(24, { w: 5, closed: true })) + ' ' + inkPath(rp, O(25, { w: 5, closed: true })) +
              ' ' + inkPath([[spine, by0 + 4], [spine, by1 + 10]], O(26, { w: 7 })));
            let rules = '';
            for (let i = 0; i <= rows.length; i++) {
              const y = (i === 0 ? hdrY : rowY(i - 1)) + 22;
              rules += inkPath([[bx0 + 24, y], [spine - 24, y + 2]], O(30 + i, { w: 3 })) + ' ' + inkPath([[spine + 24, y + 2], [bx1 - 24, y]], O(40 + i, { w: 3 })) + ' ';
            }
            rules += inkPath([[bx0 + bw * 0.16, by0 + 30], [bx0 + bw * 0.16, by1 - 20]], O(48, { w: 3 }));
            ruleR.setAttribute('d', rules);
            // left page: illegible name scribbles (+ a short scribble for the number column)
            let sc = '';
            const nRows = rows.length;
            sc += inkPath([[bx0 + bw * 0.2, hdrY - 6], [bx0 + bw * 0.27, hdrY - 18], [bx0 + bw * 0.33, hdrY - 4], [bx0 + bw * 0.4, hdrY - 16]], O(49, { w: 5 }));
            for (let i = 0; i < nRows; i++) {
              const y = rowY(i) - 14, x0 = bx0 + bw * 0.2, len = bw * (0.17 + (i % 2) * 0.07);
              const pts = [];
              for (let k = 0; k <= 7; k++) pts.push([x0 + len * k / 7, y + ((k % 2) ? -16 : 4) + (k === 3 ? -10 : 0)]);
              sc += inkPath(pts, O(50 + i, { w: 4.5 })) + ' ';
              sc += inkDot(bx0 + bw * 0.09, y - 4, 7, 7, sd + 70 + i, t) + ' ';
            }
            scrib.setAttribute('d', sc);
            const hb = boil(sd + 80, t, 1.1);
            hdr.setAttribute('x', f1(rx0 + hb[0])); hdr.setAttribute('y', f1(hdrY + hb[1]));
          }
          // an ink blot drips when the red row finishes
          if (redRow >= 0 && redRow < rows.length) {
            const done = blank ? -1 : lt - (starts[redRow] + wr);
            const bl = done > 0 ? sm(done / 0.3) : 0;
            const r = rowT[redRow];
            blot.setAttribute('d', bl > 0.01 ? inkDot(rx0 + r.w + 26, rowY(redRow) + 6, 10 * bl, 8 * bl, sd + 88, t) : '');
          }

          // queue shuffles forward, one step per row written
          queue.forEach((q, i) => {
            const shift = rows.reduce((a, _, j) => a + (portrait ? 0.03 : 0.025) * sm((lt - starts[j] - i * 0.12) / 0.55), 0);
            const moving = rows.some((_, j) => lt > starts[j] + i * 0.12 && lt < starts[j] + i * 0.12 + 0.55);
            const x = (q.x0 + shift) * W;
            const o = { x, y: qy, face: 1, since: lt, mouth: 0, ph: moving ? x / KASIF.gait('walk') / (portrait ? 0.46 : 0.36) : 0, emotion: i === 0 ? 'worried' : 'neutral' };
            q.rig.update(t + i * 0.7, moving ? 'walk' : (i === 0 ? 'hold' : 'idle'), Object.assign(o, i === 0 && !moving ? { item: 'scroll' } : {}));
          });
          if (clerk) clerk.update(t, 'talk', { x: W * (portrait ? 0.86 : 0.72), y: qy, face: -1, since: lt, mouth: 0, emotion: 'neutral' });

          // thumbnail + Shorts hook: the engine draws the big cover narrator, so the shot's own one hides
          kG.style.display = document.documentElement.classList.contains('cover') ? 'none' : '';
          if (kas) {
            const { s, p, since } = rigSeq(K, lt, cues);
            const o = { x: K.x * W, y: H * (K.y ?? (portrait ? 0.68 : 0.9)), face: faceOf(s.face ?? K.face), since, dir: dirOf(s.dir ?? K.dir),
              emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : null), mouth: 0 };
            if (p && since < 0.32) { o.prev = { pose: p.pose, since: since + 1, dir: dirOf(p.dir ?? K.dir) }; o.mix = since / 0.32; }
            kas.update(t, s.pose, o);
          }
        },
      };
    },
  };
})();
