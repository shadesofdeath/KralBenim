// pgb_twogage: "old Gage / new Gage" split page in parchment ink (BRAND.md §3, §5; boils at 8 Hz via _ink.js; pure
// function of (seed, lt)). Two framed halves with a torn dashed divider; the left half holds the calm "before" figure
// (bows / waves, a gold halo of calm lines), the right half the "after" figure: hidden behind a dashed silhouette with a
// big "?" until it is revealed, then a red scribble cloud of swear symbols, sheets of plans that pop up and drop torn
// to the floor, a toy block (a child's toy) and red flame strokes of temper; optional small narrator in the middle.
// Written for Phineas Gage (Harlow's account, 1848-1868), parametric for any before/after personality change.
//   P: {left: {label: "OLD GAGE", pose: "wave", emotion: "happy", gage: {cap: true, bandage: false, patch: false} (default) | false, dim: cue (fades)},
//       right: {label: "NEW GAGE", gage: true, reveal: cue|false (until then a dashed "?" silhouette; false = hidden all
//               scene), swear: cue, plans: cue, drop: cue, child: cue, passion: cue, pose: "point", emotion: "angry"},
//       kasif: {x: 0.08, y: 0.86, pose: "talk", face: "right", scale: 0.72, seq: [...]} | false, panels: [[0.17, 0.565], [0.595, 0.98]], labels: [window.MCB labels], cam}
//   cues: hit (punch), right.* cues, left.dim, kasif seq
// Needs pgb__lib.js (window.PGB) and mcB__lib.js (window.MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';

  SH.pgb_twogage = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1 } = window.PGB, MCB = window.MCB;
      const sd = seed * 1000 + 337;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const L = Object.assign({ label: 'OLD GAGE', pose: 'wave', emotion: 'happy' }, P.left || {});
      const R = Object.assign({ label: 'NEW GAGE', gage: true, pose: 'point', emotion: 'angry' }, P.right || {});
      const GY = 0.8 * H, PN = P.panels || [[0.17, 0.565], [0.595, 0.98]];
      const LX = (PN[0][0] + PN[0][1]) / 2 * W, RX = (PN[1][0] + PN[1][1]) / 2 * W, DX = (PN[0][1] + PN[1][0]) / 2 * W;
      const panels = [0, 1].map(() => ({ f: inkEl(cam, INK.paperLight), r: inkEl(cam) }));
      const divider = inkEl(cam, INK.inkSoft);
      const floorL = inkEl(cam);
      const halo = inkEl(cam, INK.gold);
      const tags = [L, R].map((S, i) => {
        const g = el(cam, 'g'), box = { f: inkEl(g, i ? INK.red : INK.blue), r: inkEl(g) };
        const tx = el(g, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': 58, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.paperLight });
        tx.textContent = String(S.label).toLocaleUpperCase(LOCALE);
        let w = 300; try { w = tx.getComputedTextLength(); } catch (e) {}
        return { g, box, tx, w };
      });
      const sil = { r: inkEl(cam, INK.inkSoft), q: el(cam, 'text', { x: RX, y: GY - 252, 'font-family': FR, 'font-weight': 900, 'font-size': 110, 'text-anchor': 'middle', fill: INK.inkSoft }) };
      sil.q.textContent = '?';
      const flames = inkEl(cam, INK.red, { 'fill-opacity': 0.85 });
      const sheets = [0, 1, 2].map(() => ({ f: inkEl(cam, INK.paperLight), r: inkEl(cam) }));
      const block = { f: inkEl(cam, INK.gold), r: inkEl(cam), tx: el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'font-size': 64, 'text-anchor': 'middle', fill: INK.ink }) };
      block.tx.textContent = 'A';
      const castList = [Object.assign({ who: 'old', x: LX / W, y: GY / H, scale: 0.84, face: 'right', pose: L.pose, emotion: L.emotion, gage: L.gage ?? { bandage: false, patch: false, cap: true } }, L.cast || {}),
        Object.assign({ who: 'new', x: RX / W, y: GY / H, scale: 0.84, face: 'left', pose: 'idle', emotion: R.emotion, gage: R.gage, shake: R.passion,
          seq: [R.swear && { at: R.swear, pose: 'shock', emotion: 'angry' }, R.plans && { at: R.plans, pose: 'hold', emotion: 'angry', item: 'scroll' },
            R.drop && { at: R.drop, pose: 'shrug', emotion: 'angry' }, R.child && { at: R.child, pose: 'sit', emotion: 'happy' }, R.passion && { at: R.passion, pose: 'point', dir: 60, emotion: 'angry' }].filter(Boolean) }, R.cast || {})];
      const cs = window.PGB.cast(el(cam, 'g'), castList, W, H, sd + 200);
      const swear = el(cam, 'g'), swF = inkEl(swear, INK.paperLight), swR = inkEl(swear, INK.red);
      const swT = el(swear, 'text', { x: 0, y: 0, 'font-family': FR, 'font-weight': 900, 'font-size': 80, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red });
      swT.textContent = '#@!%';
      const K = P.kasif === false ? null : Object.assign({ who: 'kasif', x: 0.09, y: 0.86, scale: 0.72, pose: 'talk', face: 'right' }, P.kasif || {});
      const ks = K ? window.PGB.cast(el(cam, 'g'), [K], W, H, sd + 600) : null;
      const lb = MCB.labels(el(root, 'g'), P.labels, W, H, sd + 400);
      const oldRig = cs.items[0], newRig = cs.items[1];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          const reveal = R.reveal === false ? Infinity : atOr(cues, R.reveal, 0);
          const rv = lt >= reveal ? spring(lt, reveal, 0.6) : 0;
          // panels
          PN.forEach(([a, b], i) => {
            const pp = [[a * W, 0.15 * H], [b * W, 0.15 * H + (i ? 4 : -3)], [b * W + 3, 0.86 * H], [a * W - 2, 0.86 * H + 3]];
            panels[i].f.setAttribute('d', inkLoop(pp, { seed: sd + 1 + i, t, amp: 1, smooth: false }));
            panels[i].r.setAttribute('d', inkPath(pp, { w: 5, seed: sd + 3 + i, t, amp: 1.2, closed: true, smooth: false }));
          });
          const dv = []; for (let y = 0.12 * H; y <= 0.9 * H; y += 40) dv.push([DX + Math.sin(y * 0.07) * 8, y]);
          divider.setAttribute('d', inkPath(dv, { w: 4, seed: sd + 5, t, amp: 1.4 }));
          floorL.setAttribute('d', inkPath([[(PN[0][0] + 0.02) * W, GY], [(PN[0][1] - 0.02) * W, GY + 2]], { w: 5, seed: sd + 6, t, amp: 1 }) + ' ' + inkPath([[(PN[1][0] + 0.02) * W, GY], [(PN[1][1] - 0.02) * W, GY - 2]], { w: 5, seed: sd + 7, t, amp: 1 }));
          // tags
          tags.forEach((g, i) => {
            const cx = i ? RX : LX, cy = 0.22 * H, a = i ? reveal : 0.1, p = lt >= a ? spring(lt, a, 0.55) : 0;
            g.g.style.display = p <= 0.01 ? 'none' : '';
            const bp = [[-g.w / 2 - 30, -42], [g.w / 2 + 30, -44], [g.w / 2 + 32, 42], [-g.w / 2 - 28, 44]];
            g.box.f.setAttribute('d', inkLoop(bp, { seed: sd + 10 + i, t, amp: 1, smooth: false }));
            g.box.r.setAttribute('d', inkPath(bp, { w: 4, seed: sd + 12 + i, t, amp: 1, closed: true, smooth: false }));
            g.g.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) rotate(${i ? 3 : -3}) scale(${f1(Math.max(0.01, p) * 1000) / 1000})`);
          });
          // calm halo around the old figure
          const dim = atOr(cues, L.dim, null), dimP = dim != null ? prog(lt, dim, 0.6) : 0;
          oldRig.m.alpha = 1 - 0.55 * dimP;
          let hd = '';
          if (dimP < 0.9) for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.36, r0 = 280 + Math.sin(t * 2 + k) * 8;
            hd += inkPath([[LX + Math.cos(a) * r0, GY - 250 + Math.sin(a) * r0], [LX + Math.cos(a) * (r0 + 46), GY - 250 + Math.sin(a) * (r0 + 46)]], { w: 6, seed: sd + 20 + k, t, amp: 1 }) + ' '; }
          halo.setAttribute('d', hd);
          // hidden "after" figure: dashed silhouette + "?"
          newRig.m.hide_until = R.reveal === false ? 1e9 : reveal;
          const silA = 1 - rv;
          sil.q.style.display = silA > 0.05 ? '' : 'none';
          sil.q.setAttribute('transform', `translate(0 ${f1(Math.sin(lt * 2.4) * 10)})`);
          sil.r.setAttribute('d', silA > 0.05 ? inkPath(inkEllipsePts(RX, GY - 290, 60, 58, sd + 30, 12), { w: 5, seed: sd + 30, t, amp: 1.4, closed: true }) + ' ' +
            inkPath([[RX, GY - 232], [RX + 4, GY - 130], [RX - 36, GY], [RX + 4, GY - 130], [RX + 40, GY]], { w: 5, seed: sd + 31, t, amp: 1.4 }) : '');
          cs.update(lt, t, cues);
          // swear cloud
          const sa = atOr(cues, R.swear, null), sp = sa != null && lt >= sa ? spring(lt, sa, 0.5) : 0;
          swear.style.display = sp > 0.01 ? '' : 'none';
          if (sp > 0.01) {
            const cx = RX + 140, cy = 0.36 * H, jig = Math.sin(lt * 30) * 3;
            const cl = []; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, r = (k % 2 ? 92 : 112); cl.push([Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.8]); }
            swF.setAttribute('d', inkLoop(cl, { seed: sd + 40, t, amp: 1.5 }));
            swR.setAttribute('d', inkPath(cl, { w: 6, seed: sd + 41, t, amp: 1.5, closed: true }));
            swear.setAttribute('transform', `translate(${f1(cx + jig)} ${f1(cy)}) scale(${f1(sp * 1000) / 1000}) rotate(${f1(Math.sin(lt * 9) * 3)})`);
          }
          // plans: sheets pop up, then fall torn to the floor
          const pa = atOr(cues, R.plans, null), da = atOr(cues, R.drop, pa != null ? pa + 1 : null);
          sheets.forEach((s, i) => {
            if (pa == null || lt < pa + i * 0.15) { s.f.setAttribute('d', ''); s.r.setAttribute('d', ''); return; }
            const up = spring(lt, pa + i * 0.15, 0.5), fall = da != null ? prog(lt, da + i * 0.12, 0.8) : 0;
            const x0 = RX - 190 + i * 70, y0 = 0.3 * H + i * 30, x = x0 + fall * (i - 1) * 90, y = lerp(y0 + (1 - up) * 80, GY - 20 - i * 6, fall);
            const rot = fall * (i - 1) * 50 + Math.sin(lt * 3 + i) * 3, w = 110, h = 140;
            const c = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180);
            const pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [fall > 0.5 ? 0 : -w / 2, fall > 0.5 ? h / 3 : h / 2], [-w / 2, h / 2]]
              .map(([a, b]) => [x + a * c - b * sn, y + a * sn + b * c]);
            s.f.setAttribute('d', inkLoop(pts, { seed: sd + 50 + i, t, amp: 1, smooth: false }));
            let lines = '';
            for (let k = 0; k < 3; k++) { const yy = -40 + k * 30; lines += ' ' + inkPath([[-36, yy], [36, yy]].map(([a, b]) => [x + a * c - b * sn, y + a * sn + b * c]), { w: 3, seed: sd + 55 + i * 3 + k, t, amp: 0.6 }); }
            s.r.setAttribute('d', inkPath(pts, { w: 4, seed: sd + 60 + i, t, amp: 1, closed: true, smooth: false }) + lines);
          });
          // toy block (child)
          const ca = atOr(cues, R.child, null), cp = ca != null && lt >= ca ? spring(lt, ca, 0.5) : 0;
          if (cp > 0.01) {
            const bx = RX + 170, by = GY, s = 64 * cp, bp = [[bx - s, by], [bx - s, by - 2 * s], [bx + s, by - 2 * s], [bx + s, by]];
            block.f.setAttribute('d', inkLoop(bp, { seed: sd + 70, t, amp: 0.8, smooth: false }));
            block.r.setAttribute('d', inkPath(bp, { w: 5, seed: sd + 71, t, amp: 1, closed: true, smooth: false }));
            block.tx.setAttribute('x', bx); block.tx.setAttribute('y', by - s + 22 * cp); block.tx.setAttribute('font-size', f1(80 * cp)); block.tx.style.display = '';
          } else { block.f.setAttribute('d', ''); block.r.setAttribute('d', ''); block.tx.style.display = 'none'; }
          // flames of temper
          const fa = atOr(cues, R.passion, null), fp = fa != null && lt >= fa ? prog(lt, fa, 0.4) : 0;
          let fd = '';
          if (fp > 0.01) for (let k = 0; k < 7; k++) {
            const x = RX - 170 + k * 56, hgt = (90 + 60 * Math.abs(Math.sin(lt * 7 + k * 1.7))) * fp, w = 26;
            fd += inkLoop([[x - w, GY], [x - w * 0.6, GY - hgt * 0.5], [x + Math.sin(lt * 9 + k) * 10, GY - hgt], [x + w * 0.6, GY - hgt * 0.45], [x + w, GY]], { seed: sd + 80 + k, t, amp: 1.2 }) + ' ';
          }
          flames.setAttribute('d', fd);
          if (ks) ks.update(lt, t, cues);
          MCB.camPush(cam, lt, dur, W, H, P.cam, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
