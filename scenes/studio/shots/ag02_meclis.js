// ag02_meclis: a 1930s assembly hall in the parchment ink style (brand/kit/BRAND.md §3, §5): back wall with two
// columns and a tall window, a rostrum in the middle, three rows of deputies behind their benches (simple ink
// pictograms, no hats) who raise their hands on a cue, an optional red "KABUL" stamp that slams onto the page, an
// optional red banner that unrolls above the rostrum, a handwritten label/note, and the narrator (Kaşif / fez) big in
// front. No portrait of a real person is drawn.
// P: {vote: cue|sec (hands go up, staggered; omit = hands down), hands: "down"|"up" (start state),
//     stamp: {text: "KABUL", at, x: 0.5, y: 0.42, rot: -12},
//     banner: {text: "Atatürk", at, y: 0.235, size: 150},
//     label: {text: "Kim verdi?", at, y: 0.2, size: 96, color: "ink"|"red"},
//     note: {text, at, x: 0.5, y: 0.31, size: 64, color: "red"},
//     kasif: {x: 0.82, y: 0.6, scale: 0.8, pose: "point", dir, face: -1, emotion, seq: [{at, pose, dir, face, emotion}]} | false,
//     cam: {zoom: 1.07}}
// cues: hit (punch), plus whatever names vote/stamp/banner/label/note/seq use
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const sm = x => { x = clamp01(x); return x * x * (3 - 2 * x); };
  const mk = (parent, fill = INK.ink, extra) => inkEl(parent, fill, extra);
  const FR = 'Fraunces, Georgia, serif';
  const COL = { ink: INK.ink, red: INK.red, blue: INK.blue, soft: INK.inkSoft };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = v => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : (typeof v === 'number' ? v : -1);

  SH.ag02_meclis = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 515, r = rng(seed * 17 + 3);
      const portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');

      // ---------------------------------------------------------------- geometry
      const wallTop = H * (portrait ? 0.17 : 0.12), floorY = H * (portrait ? 0.47 : 0.5);
      const rcx = W * (portrait ? 0.42 : 0.5);
      const rows = portrait ? [H * 0.52, H * 0.58, H * 0.64] : [H * 0.6, H * 0.7, H * 0.8];
      const perRow = portrait ? [7, 6, 5] : [10, 9, 8];
      const rowScale = portrait ? [0.78, 0.9, 1.04] : [0.7, 0.82, 0.95];
      const span = portrait ? [0.04, 0.72] : [0.06, 0.94];
      const deps = [];
      rows.forEach((y, ri) => {
        const n = perRow[ri];
        for (let i = 0; i < n; i++) {
          const x = W * lerp(span[0], span[1], (i + 0.5 + (ri % 2) * 0.35) / (n + 0.35));
          deps.push({ x, y, ri, s: rowScale[ri] * (portrait ? 1.5 : 1), side: (i + ri) % 2 ? 1 : -1, d: r() * 0.7, beard: r() < 0.35, mus: r() < 0.5 });
        }
      });

      const back = el(cam, 'g');
      const wallR = mk(back, INK.inkSoft), colF = mk(back, INK.paperLight), colR = mk(back);
      const winF = mk(back, INK.paperLight), winR = mk(back, INK.inkSoft);
      const rostF = mk(back, INK.paperDark), rostR = mk(back);
      const rowG = rows.map(() => ({ benchF: null, benchR: null, figs: null }));
      const rowsG = el(cam, 'g');
      rows.forEach((_, ri) => {
        rowG[ri].figs = mk(rowsG);
        rowG[ri].benchF = mk(rowsG, INK.paperDark);
        rowG[ri].benchR = mk(rowsG);
      });

      // banner / label / note / stamp
      const ui = el(root, 'g');
      const B = P.banner || null, bannerG = B ? el(ui, 'g') : null;
      let bannerT = null, bannerF = null, bannerR = null;
      if (B) {
        bannerF = mk(bannerG, INK.red); bannerR = mk(bannerG);
        bannerT = el(bannerG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': B.size || (portrait ? 150 : 120), 'text-anchor': 'middle', fill: INK.paperLight });
        bannerT.textContent = B.text;
      }
      const txt = (o, def) => {
        const t = el(ui, 'text', { 'font-family': INK_FONT, 'font-size': o.size || def, 'text-anchor': 'middle', fill: COL[o.color] || (def > 80 ? INK.ink : INK.red),
          style: `paint-order: stroke; stroke: ${INK.paperLight}; stroke-width: 12px; stroke-linejoin: round` });
        t.textContent = o.text; return t;
      };
      const L = P.label || null, labT = L ? txt(L, 96) : null;
      const N = P.note || null, noteT = N ? txt(Object.assign({ color: 'red' }, N), 64) : null, noteU = N ? mk(ui, COL[N.color] || INK.red) : null;
      const S = P.stamp || null, stampG = S ? el(ui, 'g') : null;
      let stampR = null, stampT = null, stampF = null;
      if (S) {
        stampF = mk(stampG, INK.paperLight, { 'fill-opacity': 0.85 }); stampR = mk(stampG, INK.red);
        stampT = el(stampG, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': S.size || (portrait ? 150 : 120), 'text-anchor': 'middle', fill: INK.red, 'letter-spacing': 6 });
        stampT.textContent = S.text || 'KABUL';
      }

      // narrator
      const K = P.kasif === false ? null : Object.assign({ x: portrait ? 0.8 : 0.84, scale: portrait ? 1.4 : 0.62, pose: 'point', dir: 20, face: -1 }, P.kasif || {});
      const kG = el(root, 'g');
      const kas = K ? KASIF.create(el(kG, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      let lastStep = -1, bw = 0, sw = 0, nw = 0;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, step = inkFrame(t), redraw = step !== lastStep;
          lastStep = step;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.7);
          const z = lerp(1, (P.cam && P.cam.zoom) || 1.07, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = rcx, fy = H * (portrait ? 0.46 : 0.5);
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.35) * 5)} ${f1(fy + Math.cos(lt * 0.27) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const O = (k, x) => Object.assign({ seed: sd + k, t, amp: 1.5 }, x);

          if (redraw || lt < 0.05) {
            // wall, columns, window, rostrum
            wallR.setAttribute('d', inkPath([[0, floorY], [W, floorY - 6]], O(1, { w: 5 })) + ' ' + inkPath([[0, wallTop], [W, wallTop + 4]], O(2, { w: 4 })));
            let cf = '', cr = '';
            [0.1, 0.9].forEach((cx, i) => {
              const x = W * cx, w = portrait ? 70 : 60;
              const pts = [[x - w / 2, wallTop + 30], [x + w / 2, wallTop + 30], [x + w / 2, floorY - 4], [x - w / 2, floorY - 4]];
              cf += inkLoop(pts, O(3 + i, { smooth: false })) + ' ';
              cr += inkPath(pts, O(5 + i, { w: 5, closed: true, smooth: false })) + ' ' +
                inkPath([[x - w / 2 - 16, wallTop + 30], [x + w / 2 + 16, wallTop + 30]], O(7 + i, { w: 8 })) + ' ' +
                inkPath([[x - w / 2 - 12, floorY - 6], [x + w / 2 + 12, floorY - 6]], O(9 + i, { w: 7 })) + ' ' +
                inkPath([[x - 8, wallTop + 50], [x - 8, floorY - 24]], O(11 + i, { w: 2.5 })) + ' ' + inkPath([[x + 10, wallTop + 50], [x + 10, floorY - 24]], O(13 + i, { w: 2.5 }));
            });
            colF.setAttribute('d', cf); colR.setAttribute('d', cr);
            const wx = rcx, ww = portrait ? 150 : 160, wt = wallTop + (portrait ? 70 : 50), wb = floorY - (portrait ? 230 : 190);
            const arch = [[wx - ww / 2, wb], [wx - ww / 2, wt + ww / 2], [wx - ww * 0.35, wt + ww * 0.15], [wx, wt], [wx + ww * 0.35, wt + ww * 0.15], [wx + ww / 2, wt + ww / 2], [wx + ww / 2, wb]];
            winF.setAttribute('d', inkLoop(arch, O(15)));
            winR.setAttribute('d', inkPath(arch, O(16, { w: 5, closed: true })) + ' ' + inkPath([[wx, wt + 4], [wx, wb]], O(17, { w: 3.5 })) + ' ' + inkPath([[wx - ww / 2, (wt + wb) / 2 + 20], [wx + ww / 2, (wt + wb) / 2 + 20]], O(18, { w: 3.5 })));
            const rw = portrait ? 300 : 280, rt = floorY - (portrait ? 150 : 130);
            const rost = [[rcx - rw / 2, rt], [rcx + rw / 2, rt], [rcx + rw / 2 - 20, floorY + 10], [rcx - rw / 2 + 20, floorY + 10]];
            rostF.setAttribute('d', inkLoop(rost, O(19, { smooth: false })));
            rostR.setAttribute('d', inkPath(rost, O(20, { w: 6, closed: true, smooth: false })) + ' ' +
              inkPath([[rcx - rw / 2 - 18, rt], [rcx + rw / 2 + 18, rt]], O(21, { w: 9 })) + ' ' +
              inkPath([[rcx - rw * 0.3, rt + 40], [rcx + rw * 0.3, rt + 40], [rcx + rw * 0.3, floorY - 20], [rcx - rw * 0.3, floorY - 20]], O(22, { w: 3, closed: true, smooth: false })) + ' ' +
              inkPath([[rcx - 40, rt], [rcx - 30, rt - 60], [rcx + 30, rt - 60], [rcx + 40, rt]], O(23, { w: 5, smooth: false })));
            // benches
            rows.forEach((y, ri) => {
              const bh = (portrait ? 46 : 40) * rowScale[ri];
              const bp = [[W * 0.01, y - 6], [W * (portrait ? 0.84 : 0.99), y - 10], [W * (portrait ? 0.84 : 0.99), y + bh], [W * 0.01, y + bh + 4]];
              rowG[ri].benchF.setAttribute('d', inkLoop(bp, O(30 + ri, { smooth: false })));
              rowG[ri].benchR.setAttribute('d', inkPath(bp, O(34 + ri, { w: 5, closed: true, smooth: false })));
            });
          }

          // deputies: redrawn every frame (hands move)
          const vAt = atOr(cues, P.vote, null), up0 = P.hands === 'up' ? 1 : 0;
          const parts = rows.map(() => []);
          deps.forEach((d, i) => {
            const u = vAt == null ? up0 : Math.max(up0, sm((lt - vAt - d.d) / 0.35));
            const s = d.s, x = d.x + Math.sin(lt * 1.2 + i) * 1.5, y = d.y - 8;
            const hr = 22 * s, hy = y - 74 * s - Math.abs(Math.sin(lt * 1.6 + i * 0.7)) * 2;
            const sh = y - 46 * s;
            const Q = k => ({ seed: sd + 100 + i * 13 + k, t, amp: 1.1, w: 5 * Math.min(1.1, s) });
            let p = inkCircle(x, hy, hr, sd + 100 + i * 13, t, { w: 4.5 * Math.min(1.1, s), amp: 0.8 }) + ' ';
            p += inkDot(x - hr * 0.35 * d.side * -1 - 6 * s, hy - 2 * s, 3.2 * s, 3.6 * s, sd + 200 + i, t) + ' ' + inkDot(x + 8 * s - hr * 0.1, hy - 2 * s, 3.2 * s, 3.6 * s, sd + 300 + i, t) + ' ';
            if (d.mus) p += inkPath([[x - 9 * s, hy + 9 * s], [x, hy + 6 * s], [x + 9 * s, hy + 9 * s]], Q(1)) + ' ';
            if (d.beard) p += inkLoop([[x - hr * 0.8, hy + hr * 0.3], [x, hy + hr * 1.35], [x + hr * 0.8, hy + hr * 0.3], [x, hy + hr * 0.75]], { seed: sd + 400 + i, t, amp: 0.9 }) + ' ';
            p += inkPath([[x, hy + hr], [x, y + 10]], Q(2)) + ' ';
            p += inkPath([[x - 26 * s, sh + 6 * s], [x, sh], [x + 26 * s, sh + 6 * s]], Q(3)) + ' ';
            // resting arm on the bench vs raised arm (one side), the other rests
            const ax = x + 26 * s * d.side, ay = sh + 6 * s;
            const down = [ax + 10 * s * d.side, y + 2], upP = [ax + 6 * s * d.side, sh - 78 * s];
            const hx = lerp(down[0], upP[0], u), hyy = lerp(down[1], upP[1], u);
            const ex = lerp(ax + 8 * s * d.side, ax + 12 * s * d.side, u), ey = lerp(sh + 34 * s, sh - 30 * s, u);
            p += inkPath([[ax, ay], [ex, ey], [hx, hyy]], Q(4)) + ' ' + inkDot(hx, hyy, 6 * s, 6 * s, sd + 500 + i, t) + ' ';
            p += inkPath([[x - 26 * s * d.side, sh + 6 * s], [x - 34 * s * d.side, y + 2]], Q(5)) + ' ';
            parts[d.ri].push(p);
          });
          rows.forEach((_, ri) => rowG[ri].figs.setAttribute('d', parts[ri].join(' ')));

          // banner unrolls
          if (B) {
            const a = atOr(cues, B.at, 0.2), p = lt >= a ? spring(lt, a, 0.6) : 0;
            if (!bw) { try { bw = bannerT.getComputedTextLength(); } catch (e) { bw = 0; } if (!bw) bw = B.text.length * 80; }
            const by = H * (B.y ?? (portrait ? 0.255 : 0.2)), fs = parseFloat(bannerT.getAttribute('font-size'));
            const bx0 = rcx - bw / 2 - 40, bx1 = rcx + bw / 2 + 40, bt = by - fs * 0.85, bb = by + fs * 0.3;
            const box = [[bx0, bt], [bx1, bt + 4], [bx1 - 6, bb], [bx0 + 4, bb + 4]];
            if (redraw || !bannerF.getAttribute('d')) {
              bannerF.setAttribute('d', inkLoop(box, O(60, { smooth: false })));
              bannerR.setAttribute('d', inkPath(box, O(61, { w: 7, closed: true, smooth: false })) + ' ' +
                inkPath([[bx0 + 30, bt], [bx0 + 10, wallTop - 10]], O(62, { w: 4 })) + ' ' + inkPath([[bx1 - 30, bt], [bx1 - 10, wallTop - 10]], O(63, { w: 4 })));
              const jb = boil(sd + 64, t, 1);
              bannerT.setAttribute('x', f1(rcx + jb[0])); bannerT.setAttribute('y', f1(by + jb[1]));
            }
            const sc = Math.max(0.001, p) * (1 + 0.05 * punch(lt, a, 0.5));
            bannerG.setAttribute('opacity', clamp01(p * 3));
            bannerG.setAttribute('transform', `translate(${f1(rcx)} ${f1(by)}) scale(${sc.toFixed(3)} ${Math.max(0.001, lerp(0.6, 1, p) * (1 + 0.05 * hit)).toFixed(3)}) rotate(-2) translate(${f1(-rcx)} ${f1(-by)})`);
          }
          if (labT) {
            const a = atOr(cues, L.at, 0.2), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 70, t, 1.4);
            labT.setAttribute('opacity', clamp01(p * 2));
            labT.setAttribute('transform', `translate(${f1(W * (L.x ?? 0.45) + b[0])} ${f1(H * (L.y ?? 0.2) + b[1])}) rotate(-3) scale(${lerp(0.5, 1, p).toFixed(3)})`);
          }
          if (noteT) {
            const a = atOr(cues, N.at, dur * 0.6), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 80, t, 1.4);
            const px = W * (N.x ?? 0.45), py = H * (N.y ?? 0.31);
            noteT.setAttribute('opacity', clamp01(p * 2));
            noteT.setAttribute('transform', `translate(${f1(px + b[0])} ${f1(py + b[1])}) rotate(-4) scale(${lerp(0.4, 1, p).toFixed(3)})`);
            if (!nw) { try { nw = noteT.getComputedTextLength(); } catch (e) { nw = 0; } if (!nw) nw = N.text.length * 26; }
            const u = lt >= a ? prog(lt, a + 0.3, 0.4) : 0;
            noteU.setAttribute('d', u > 0.01 ? inkPath([[px - nw / 2, py + 22], [px - nw / 2 + nw * u, py + 14]], { seed: sd + 81, t, w: 7 }) : '');
          }
          if (S) {
            const a = atOr(cues, S.at, dur * 0.6), on = lt >= a;
            const k = on ? sm((lt - a) / 0.16) : 0, pk = on ? punch(lt, a + 0.16, 0.5) : 0;
            const px = W * (S.x ?? 0.45), py = H * (S.y ?? 0.4), fs = parseFloat(stampT.getAttribute('font-size'));
            if (!sw) { try { sw = stampT.getComputedTextLength(); } catch (e) { sw = 0; } if (!sw) sw = (S.text || 'KABUL').length * fs * 0.7; }
            if (redraw || !stampR.getAttribute('d')) {
              const x0 = px - sw / 2 - 36, x1 = px + sw / 2 + 36, y0 = py - fs * 0.8, y1 = py + fs * 0.32;
              const rr = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], rr2 = [[x0 + 14, y0 + 14], [x1 - 14, y0 + 14], [x1 - 14, y1 - 14], [x0 + 14, y1 - 14]];
              stampF.setAttribute('d', inkLoop(rr, O(90, { smooth: false })));
              stampR.setAttribute('d', inkPath(rr, O(91, { w: 10, closed: true, smooth: false })) + ' ' + inkPath(rr2, O(92, { w: 4, closed: true, smooth: false })));
              stampT.setAttribute('x', f1(px)); stampT.setAttribute('y', f1(py));
            }
            const sc = on ? lerp(2.2, 1, k) * (1 + 0.06 * pk) : 0.001;
            stampG.setAttribute('opacity', on ? clamp01(k * 1.5) : 0);
            stampG.setAttribute('transform', `translate(${f1(px)} ${f1(py)}) rotate(${S.rot ?? -12}) scale(${sc.toFixed(3)}) translate(${f1(-px)} ${f1(-py)})`);
          }
          if (kas) {
            const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
            (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            const s = segs[i], p = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
            const o = { x: K.x * W, y: H * (K.y ?? (portrait ? 0.7 : 0.9)), face: faceOf(s.face ?? K.face), since, dir: dirOf(s.dir ?? K.dir),
              emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : null), mouth: 0 };
            if (p && since < 0.32) { o.prev = { pose: p.pose, since: since + 1, dir: dirOf(p.dir ?? K.dir) }; o.mix = since / 0.32; }
            kas.update(t, s.pose, o);
          }
        },
      };
    },
  };
})();
