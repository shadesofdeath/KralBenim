// ag03c_compare: "size vs. method" comparison in the parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz via
// _ink.js; pure function of (seed, lt)). Left: a pinned card with 2-3 big hand-drawn bars (Fraunces labels, ink fill
// that grows; optional handwritten "yaklaşık" header). Right: a pinned card with 2-3 big list rows that get ink ticks.
// The narrator (Kaşif / fez) stands at the right edge. Written for the Malazgirt long video, parametric.
// P: {header: "yaklaşık", bars: [{label: "Bizans", value: 0.9, color: "red"|"blue"|"ink", at}],
//     list: {title: "Sır", items: [{text: "Atlı okçular", at, mark: "check"|"x"}]},
//     kasif: {x: 0.9, scale: 0.8, pose: "talk", face: -1, dir, emotion, seq: [{at, pose, dir, face, emotion}]} | false}
// cues: hit (punch), plus whatever names bars / items / seq use
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const f1 = v => Math.round(v * 10) / 10;
  const FR = 'Fraunces, Georgia, serif', LO = 'Lora, Georgia, serif';
  const COL = { red: INK.red, blue: INK.blue, green: INK.green, ink: INK.ink, gold: INK.gold };
  const DIRS = { up: 70, down: -38, forward: 8, left: 10, right: 10 };
  const dirOf = v => typeof v === 'number' ? v : DIRS[v] ?? 20;
  const faceOf = (v, fb) => v === 'left' || v === -1 ? -1 : v === 'right' || v === 1 ? 1 : fb;
  const rr = (x, y, w, h, r) => { const p = []; const c = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    c.forEach(([cx, cy, a0]) => { for (let k = 0; k <= 4; k++) { const a = (a0 + k * 22.5) * Math.PI / 180; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); return p; };

  SH.ag03c_compare = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 377, portrait = H > W;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const A = portrait ? { x: 70, y: 300, w: 940, h: 380 } : { x: 110, y: 200, w: 820, h: 600 };
      const B = portrait ? { x: 70, y: 720, w: 940, h: 380 } : { x: 990, y: 200, w: 560, h: 600 };
      const mkCard = (R, k) => { const g = el(cam, 'g'); const sh = inkEl(g, INK.ink, { 'fill-opacity': 0.14 }), f = inkEl(g, INK.paperLight), r = inkEl(g); return { g, sh, f, r, R, k }; };
      const cards = [mkCard(A, 0), mkCard(B, 1)];
      // bars
      const bars = (P.bars || []).slice(0, 3);
      let hd = null;
      if (P.header) { hd = el(cards[0].g, 'text', { x: A.x + A.w / 2, y: A.y + 92, 'font-family': INK_FONT, 'font-size': 70, 'text-anchor': 'middle', fill: INK.inkSoft }); hd.textContent = P.header; }
      const bTop = A.y + (P.header ? 150 : 70), bStep = (A.h - (bTop - A.y) - 40) / Math.max(1, bars.length);
      const B2 = bars.map((b, i) => {
        const y = bTop + bStep * i;
        const t = el(cards[0].g, 'text', { x: A.x + 50, y: y + 66, 'font-family': FR, 'font-weight': 900, 'font-size': 66, 'text-anchor': 'start', fill: INK.ink });
        t.textContent = b.label;
        return { b, y: y + 96, track: inkEl(cards[0].g, INK.paperDark), fill: inkEl(cards[0].g, COL[b.color] || INK.blue), ring: inkEl(cards[0].g) };
      });
      // list
      const L = P.list || {}, items = (L.items || []).slice(0, 3);
      let lt0 = null;
      if (L.title) { lt0 = el(cards[1].g, 'text', { x: B.x + B.w / 2, y: B.y + 100, 'font-family': FR, 'font-weight': 900, 'font-size': 76, 'text-anchor': 'middle', fill: INK.blue }); lt0.textContent = L.title; }
      const iTop = B.y + (L.title ? 170 : 70), iStep = (B.h - (iTop - B.y) - 30) / Math.max(1, items.length);
      const I2 = items.map((it, i) => {
        const g = el(cards[1].g, 'g'), y = iTop + iStep * (i + 0.5);
        const t = el(g, 'text', { x: B.x + 140, y: y + 20, 'font-family': LO, 'font-weight': 700, 'font-size': 56, 'text-anchor': 'start', fill: INK.ink });
        t.textContent = it.text;
        let w = 0; try { w = t.getComputedTextLength(); } catch (e) { w = 0; }
        if (w > B.w - 170) t.setAttribute('font-size', Math.max(44, 56 * (B.w - 170) / w));
        return { it, g, y, box: inkEl(g, INK.paper), boxR: inkEl(g, INK.inkSoft), mark: inkEl(g, it.mark === 'x' ? INK.red : INK.blue) };
      });
      const K = P.kasif === false ? null : Object.assign({ x: portrait ? 0.8 : 0.9, scale: portrait ? 0.9 : 0.8, pose: 'talk', face: -1 }, P.kasif || {});
      const kas = K ? KASIF.create(el(root, 'g'), { scale: K.scale, hat: true, seed: sd + 5 }) : null;

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const z = lerp(1, 1.04, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.02 * hit), fx = W * 0.45, fy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(fx + Math.sin(lt * 0.4) * 5)} ${f1(fy + Math.cos(lt * 0.3) * 4)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          cards.forEach(c => {
            const p = spring(lt, 0.05 + c.k * 0.2, 0.6), R = c.R, pts = rr(R.x, R.y, R.w, R.h, 26);
            c.sh.setAttribute('d', inkLoop(pts.map(q => [q[0] + 10, q[1] + 12]), { seed: sd + 1 + c.k, t, amp: 1 }));
            c.f.setAttribute('d', inkLoop(pts, { seed: sd + 3 + c.k, t, amp: 1.2 }));
            c.r.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 5 + c.k, t, amp: 1.2, closed: true }));
            const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
            c.g.setAttribute('opacity', clamp01(p * 2.5));
            c.g.setAttribute('transform', `translate(${f1(cx)} ${f1(cy + (1 - p) * 60)}) rotate(${f1((c.k ? 0.6 : -0.6) + (1 - p) * 3)}) translate(${f1(-cx)} ${f1(-cy)})`);
          });
          B2.forEach((r, i) => {
            const a = atOr(cues, r.b.at, 0.4 + i * 0.5), p = progIO(lt, a, 1.0), pk = punch(lt, a + 0.9, 0.5);
            const x0 = A.x + 50, tw = A.w - 100, th = 44, y = r.y;
            const tr = rr(x0, y, tw, th, th / 2);
            r.track.setAttribute('d', inkLoop(tr, { seed: sd + 20 + i, t, amp: 1 }));
            r.ring.setAttribute('d', inkPath(tr, { w: 3.5, seed: sd + 23 + i, t, amp: 1, closed: true }));
            const fw = Math.max(0, (tw - 12) * clamp01(r.b.value ?? 0.5) * p) * (1 + 0.03 * pk);
            r.fill.setAttribute('d', fw > th ? inkLoop(rr(x0 + 6, y + 6, fw, th - 12, (th - 12) / 2), { seed: sd + 26 + i, t, amp: 0.8 }) : '');
          });
          I2.forEach((r, i) => {
            const a = atOr(cues, r.it.at, 0.8 + i * 0.5), p = lt >= a ? spring(lt, a, 0.55) : 0, mp = lt >= a ? prog(lt, a + 0.2, 0.3) : 0;
            const bx = B.x + 50, s = 60, by = r.y - s / 2;
            const bp = rr(bx, by, s, s, 10);
            r.g.setAttribute('opacity', clamp01(p * 2.5));
            r.g.setAttribute('transform', `translate(${f1((1 - p) * -30)} 0)`);
            r.box.setAttribute('d', inkLoop(bp, { seed: sd + 40 + i, t, amp: 0.8 }));
            r.boxR.setAttribute('d', inkPath(bp, { w: 3.5, seed: sd + 43 + i, t, amp: 0.8, closed: true }));
            if (mp > 0.01) {
              const pts = r.it.mark === 'x' ? [[bx + 8, by + 8], [bx + s - 6, by + s - 6]] : [[bx + 8, by + s * 0.5], [bx + s * 0.4, by + s - 4], [bx + s + 14, by - 18]];
              const n = pts.length - 1, u = mp * n, k = Math.min(n - 1, Math.floor(u)), f = u - k;
              const vis = pts.slice(0, k + 1).concat([[lerp(pts[k][0], pts[k + 1][0], f), lerp(pts[k][1], pts[k + 1][1], f)]]);
              r.mark.setAttribute('d', inkPath(vis, { w: 11, seed: sd + 46 + i, t, amp: 1, smooth: false, taper: 0.2 }));
            } else r.mark.setAttribute('d', '');
          });
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
