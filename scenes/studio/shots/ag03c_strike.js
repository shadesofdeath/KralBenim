// ag03c_strike: big Fraunces numbers / claims that get struck through with a red ink line (old exaggerated figures,
// myths) + an optional handwritten header, a red pill verdict and the narrator (Kaşif / fez). Parchment ink style
// (brand/kit/BRAND.md §3, §5; boils at 8 Hz via _ink.js; pure function of (seed, lt)). Written for the Malazgirt
// long video ("200.000 / 600.000 -> abartı"), parametric.
// P: {header: {text: "Eski kaynaklar", at, size: 76},
//     items: [{text: "200.000", at: cue|sec (appears), strike: cue|sec (red strike), size: 190}],   (1-3 items)
//     x: 0.44 (centre of the numbers, 0..1 W), pill: {text: "abartı", at, color: "red"|"blue"|"green"},
//     kasif: {x: 0.84, scale: 0.85, pose: "talk", face: -1, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false}
// cues: hit (punch), plus whatever names items / header / pill / seq use
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif';
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;

  SH.ag03c_strike = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 913, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const cx = (P.x ?? (portrait ? 0.5 : 0.44)) * W;
      const items = (P.items || []).slice(0, 3), n = Math.max(1, items.length);
      const top = H * (portrait ? 0.3 : 0.29), bot = H * (portrait ? 0.5 : 0.53);
      const rows = items.map((it, i) => {
        const g = el(cam, 'g'), y = n === 1 ? (top + bot) / 2 : lerp(top, bot, i / (n - 1));
        const size = it.size || (portrait ? 170 : 190);
        const sh = el(g, 'text', { x: cx + 6, y: y + size * 0.36 + 8, 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.paperDark });
        const t = el(g, 'text', { x: cx, y: y + size * 0.36, 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.ink });
        sh.textContent = t.textContent = it.text;
        let w = 0; try { w = t.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = it.text.length * size * 0.55;
        const strike = mk(g);
        return { it, g, y, size, w, strike, t };
      });
      function mk(p, fill = INK.red) { return inkEl(p, fill); }
      const Hd = P.header || null;
      let hd = null, hdU = null, hw = 0;
      if (Hd) {
        hd = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': Hd.size || (portrait ? 84 : 76), 'text-anchor': 'middle', fill: INK.inkSoft });
        hd.textContent = Hd.text; hdU = inkEl(cam, INK.inkSoft);
        try { hw = hd.getComputedTextLength(); } catch (e) { hw = 0; } if (!hw) hw = Hd.text.length * 30;
      }
      const PL = P.pill || null;
      let pill = null;
      if (PL) {
        const g = el(cam, 'g'), py = H * (portrait ? 0.62 : 0.72), size = portrait ? 80 : 74;
        const box = inkEl(g, COL[PL.color] || INK.red), ring = inkEl(g);
        const t = el(g, 'text', { x: cx, y: py + size * 0.34, 'font-family': FR, 'font-weight': 900, 'font-size': size, 'text-anchor': 'middle', fill: INK.paperLight });
        t.textContent = PL.text;
        let w = 0; try { w = t.getComputedTextLength(); } catch (e) { w = 0; } if (!w) w = PL.text.length * size * 0.6;
        pill = { g, box, ring, py, w: w + 90, h: size * 1.45 };
      }
      const K = P.kasif === false ? null : Object.assign({ x: portrait ? 0.8 : 0.84, scale: portrait ? 0.95 : 0.85, pose: 'talk', face: -1 }, P.kasif || {});
      const kas = K ? KASIF.create(el(root, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit);
          const fx = cx, fy = H * 0.46;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.4) * 5)} ${f1(fy + Math.cos(lt * 0.3) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          if (hd) {
            const a = atOr(cues, Hd.at, 0.05), p = lt >= a ? spring(lt, a, 0.6) : 0, b = boil(sd + 3, t, 1.4), y = H * (portrait ? 0.2 : 0.15);
            hd.setAttribute('opacity', clamp01(p * 2));
            hd.setAttribute('transform', `translate(${f1(cx + b[0])} ${f1(y + b[1])}) rotate(-2) scale(${lerp(0.6, 1, p).toFixed(3)})`);
            const u = lt >= a ? prog(lt, a + 0.25, 0.4) : 0;
            hdU.setAttribute('d', u > 0.01 ? inkPath([[cx - hw / 2, y + 22], [cx - hw / 2 + hw * u, y + 16]], { seed: sd + 4, t, w: 5 }) : '');
          }
          rows.forEach((r, i) => {
            const a = atOr(cues, r.it.at, 0.15 + i * 0.3), p = lt >= a ? spring(lt, a, 0.6) : 0;
            const sa = atOr(cues, r.it.strike, null), sp = sa == null ? 0 : prog(lt, sa, 0.35), pk = sa == null ? 0 : punch(lt, sa + 0.3, 0.5);
            const b = boil(sd + 10 + i, t, 1);
            r.g.setAttribute('opacity', clamp01(p * 2));
            r.g.setAttribute('transform', `translate(${f1(cx + b[0])} ${f1(r.y + b[1])}) rotate(${f1((i % 2 ? 1.2 : -1.2) + (1 - p) * 5)}) scale(${f1(lerp(1.3, 1, p) * (1 + 0.06 * pk) * 1000) / 1000}) translate(${f1(-cx)} ${f1(-r.y)})`);
            r.t.setAttribute('fill', sp > 0.5 ? INK.inkSoft : INK.ink);
            if (sp > 0.01) {
              const x0 = cx - r.w / 2 - 30, x1 = cx + r.w / 2 + 30, y0 = r.y + 10, y1 = r.y - 16;
              const xe = lerp(x0, x1, sp), ye = lerp(y0, y1, sp);
              r.strike.setAttribute('d', inkPath([[x0, y0], [lerp(x0, xe, 0.5), lerp(y0, ye, 0.5) - 6], [xe, ye]], { w: 16, seed: sd + 20 + i, t, amp: 1.4, taper: 0.2 }));
            } else r.strike.setAttribute('d', '');
          });
          if (pill) {
            const a = atOr(cues, PL.at, dur * 0.7), p = lt >= a ? spring(lt, a, 0.6) : 0, pk = punch(lt, a, 0.5);
            const x0 = cx - pill.w / 2, y0 = pill.py - pill.h / 2, rr = pill.h / 2, pts = [];
            for (let k = 0; k <= 10; k++) { const ang = Math.PI / 2 + k * Math.PI / 10; pts.push([x0 + rr + Math.cos(ang) * rr, pill.py + Math.sin(ang) * rr]); }
            for (let k = 0; k <= 10; k++) { const ang = -Math.PI / 2 + k * Math.PI / 10; pts.push([x0 + pill.w - rr + Math.cos(ang) * rr, pill.py + Math.sin(ang) * rr]); }
            pill.box.setAttribute('d', inkLoop(pts, { seed: sd + 40, t, amp: 1 }));
            pill.ring.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 41, t, amp: 1, closed: true }));
            pill.g.setAttribute('opacity', clamp01(p * 3));
            pill.g.setAttribute('transform', `translate(${f1(cx)} ${f1(pill.py)}) rotate(${f1(-3 + (1 - p) * -8)}) scale(${f1(lerp(0.4, 1, p) * (1 + 0.08 * pk) * 1000) / 1000}) translate(${f1(-cx)} ${f1(-pill.py)})`);
          }
          if (kas) {
            const segs = [{ at: -1, pose: K.pose || 'idle', dir: K.dir, face: K.face, emotion: K.emotion }];
            (K.seq || []).forEach(s => { const a = atOr(cues, s.at, null); if (a != null) segs.push(Object.assign({}, s, { at: a })); });
            segs.sort((a, b) => a.at - b.at);
            let i = 0; for (let j = 0; j < segs.length; j++) if (lt >= segs[j].at) i = j;
            const s = segs[i], pv = i > 0 ? segs[i - 1] : null, since = lt - Math.max(0, s.at);
            const o = { x: K.x * W, y: H * (K.y ?? (portrait ? 0.6 : 0.86)), face: faceOf(s.face ?? K.face, -1), since, dir: dirOf(s.dir ?? K.dir),
              emotion: s.emotion || (s.pose === 'shock' ? 'surprised' : K.emotion || null), mouth: 0 };
            if (pv && since < 0.32) { o.prev = { pose: pv.pose, since: since + 1, dir: dirOf(pv.dir ?? K.dir) }; o.mix = since / 0.32; }
            kas.update(t, s.pose || 'idle', o);
          }
        },
      };
    },
  };
})();
