// kaime_press: a wooden hand press printing paper money faster and faster (war-time kaime issues, 1854 / 1876-77),
// parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure function of (seed, lt)). A pressman in fez (ink-wash
// silhouette) swings the bar, the platen comes down on the bed, and each pull throws a fresh banknote onto the stacks on
// the right, which grow taller and taller (each stack can carry a year tag and start growing on its own cue). The
// press speeds up over the scene (`rate` -> `rate_end`); on `hit` it jolts. Leaves the room to the "set" (interior).
// P: {gy: 0.6, x: 0.4 (press centre), rate: 0.8, rate_end: 2 (pulls per second), stacks: [{x: 0.8, label: "1854",
//     at: cue|sec, max: 520}], label: {text, x, y, at, size, color}, kasif: K | false}
// P.chest: true (a chest full of fresh notes on the floor in front), chest_x: 0.27
// cues: hit (jolt + punch), stacks[].at, label.at. Needs kaime__lib.js (KMA).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.kaime_press = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 613, M = window.KMA;
      const root = el(svg, 'g');
      const gy = (P.gy ?? 0.6) * H, px = (P.x ?? 0.45) * W;
      const foreL = P.fore === false ? null : M.fore(root, 'floor', sd + 7);
      // a wooden chest full of fresh kaime on the floor in front (P.chest: false hides it)
      const chest = P.chest === false ? null : { f: inkEl(root, INK.stain), r: inkEl(root), band: inkEl(root, INK.inkSoft), lid: inkEl(root, INK.stain), lidR: inkEl(root), notes: inkEl(root, INK.paperLight), notesR: inkEl(root), seals: inkEl(root, INK.red) };
      const ground = inkEl(root);
      const stacksDef = (P.stacks || [{ x: 0.78, label: '1854', at: 0 }, { x: 0.92, label: '1877', at: 1.5 }]);
      const stG = el(root, 'g');
      const stacks = stacksDef.map((s, i) => ({ s, body: inkEl(stG, INK.paperLight), lines: inkEl(stG, INK.inkSoft), rim: inkEl(stG), top: M.note(el(stG, 'g'), sd + 20 + i),
        tagF: inkEl(stG, INK.paperLight), tagR: inkEl(stG), tagS: inkEl(stG), tx: el(stG, 'text', { 'font-family': INK_FONT, 'font-size': 54, 'text-anchor': 'middle', fill: INK.red }) }));
      stacks.forEach(s => { s.tx.textContent = s.s.label || ''; });
      const pressG = el(root, 'g');
      const wood = () => ({ f: inkEl(pressG, INK.stain), r: inkEl(pressG) });
      const legL = wood(), legR = wood(), postL = wood(), postR = wood(), head = wood(), bed = wood(), platen = wood(), screw = { f: inkEl(pressG, INK.inkSoft), r: inkEl(pressG), th: inkEl(pressG) }, bar = { f: inkEl(pressG, INK.ink), knob: inkEl(pressG, INK.ink) };
      const sheetIn = M.note(el(pressG, 'g'), sd + 5);
      const flyG = el(root, 'g'), fly = [0, 1, 2].map(i => M.note(el(flyG, 'g'), sd + 30 + i));
      const man = M.fig(el(root, 'g'), sd + 40, { beard: true });
      const kas = P.kasif ? M.kasif(el(root, 'g'), Object.assign({ x: 0.1, y: P.gy ?? 0.6, scale: 0.7, pose: 'point', face: 1 }, P.kasif), W, H, seed) : null;
      const lab = P.label ? M.label(root, P.label, W, H) : null;
      const box = (o, pts, k, t, w = 5) => { o.f.setAttribute('d', inkLoop(pts, { seed: sd + k, t, smooth: false, amp: 1 })); o.r.setAttribute('d', inkPath(pts, { w, seed: sd + k + 1, t, closed: true, smooth: false, amp: 1 })); };
      const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const r0 = P.rate ?? 0.8, r1 = P.rate_end ?? 2;
          const n = r0 * lt + (r1 - r0) * lt * lt / (2 * Math.max(1, dur));     // pulls so far (accelerating)
          const ph = n % 1, ci = Math.floor(n);
          const hitAt = M.atOr(cues, 'hit', null), jolt = punch(lt, hitAt, 0.5);
          const pull = ph < 0.45 ? EASE_IO(ph / 0.45) : ph < 0.6 ? 1 : 1 - EASE_IO((ph - 0.6) / 0.4);
          const shake = Math.sin(t * 60) * 6 * jolt;
          pressG.setAttribute('transform', `translate(${M.f1(shake)} 0)`);
          if (foreL) foreL.update(t, W, H, gy);
          if (chest) {
            const cx2 = (P.chest_x ?? 0.27) * W, cy2 = gy + 0.25 * H, cw = 210, ch2 = 150;
            const bx = [[cx2 - cw, cy2 - ch2], [cx2 + cw, cy2 - ch2], [cx2 + cw - 10, cy2 + ch2], [cx2 - cw + 10, cy2 + ch2]];
            const lid = [[cx2 - cw, cy2 - ch2], [cx2 + cw, cy2 - ch2], [cx2 + cw - 30, cy2 - ch2 - 120], [cx2 - cw + 30, cy2 - ch2 - 120]];
            chest.lid.setAttribute('d', inkLoop(lid, { seed: sd + 300, t, smooth: false })); chest.lidR.setAttribute('d', inkPath(lid, { w: 5, seed: sd + 301, t, closed: true, smooth: false }));
            const nb = [], nr = [], sl = [];
            for (let i = 0; i < 7; i++) {
              const nx = cx2 - cw + 50 + i * 52 + Math.sin(i * 2.7) * 10, ny = cy2 - ch2 - 18 - (i % 3) * 14 + Math.sin(t * 2 + i) * 2, a = (i - 3) * 0.12;
              const pts = [[-70, -26], [70, -26], [70, 26], [-70, 26]].map(p => { const v = M.R(p, a); return [nx + v[0], ny + v[1]]; });
              nb.push(inkLoop(pts, { seed: sd + 310 + i, t, smooth: false })); nr.push(inkPath(pts, { w: 3.5, seed: sd + 320 + i, t, closed: true, smooth: false }));
              sl.push(inkDot(nx + 30 * Math.cos(a), ny + 30 * Math.sin(a), 9, 9, sd + 330 + i, t));
            }
            chest.notes.setAttribute('d', nb.join(' ')); chest.notesR.setAttribute('d', nr.join(' ')); chest.seals.setAttribute('d', sl.join(' '));
            chest.f.setAttribute('d', inkLoop(bx, { seed: sd + 302, t, smooth: false })); chest.r.setAttribute('d', inkPath(bx, { w: 6, seed: sd + 303, t, closed: true, smooth: false }));
            chest.band.setAttribute('d', [-0.55, 0.55].map((u, j) => inkLoop([[cx2 + u * cw - 18, cy2 - ch2], [cx2 + u * cw + 18, cy2 - ch2], [cx2 + u * cw * 0.96 + 18, cy2 + ch2], [cx2 + u * cw * 0.96 - 18, cy2 + ch2]], { seed: sd + 304 + j, t, smooth: false })).join(' '));
          }
          ground.setAttribute('d', inkPath([[-20, gy], [W + 20, gy + 2]], { w: 5, seed: sd + 1, t, amp: 1.5 }));
          // frame
          const pw = 165, top = gy - 0.4 * H, bedY = gy - 0.2 * H;
          box(postL, rect(px - pw - 30, top, px - pw + 30, gy), 100, t);
          box(postR, rect(px + pw - 30, top, px + pw + 30, gy), 102, t);
          box(head, rect(px - pw - 60, top - 20, px + pw + 60, top + 80), 104, t);
          box(legL, rect(px - pw - 70, bedY + 40, px - pw - 40, gy), 106, t);
          box(legR, rect(px + pw + 40, bedY + 40, px + pw + 70, gy), 108, t);
          box(bed, rect(px - pw - 80, bedY, px + pw + 70, bedY + 44), 110, t);
          // screw + platen
          const py = lerp(bedY - 150, bedY - 40, pull);
          screw.f.setAttribute('d', inkLoop(rect(px - 22, top + 80, px + 22, py), { seed: sd + 112, t, smooth: false }));
          screw.r.setAttribute('d', inkPath(rect(px - 22, top + 80, px + 22, py), { w: 4, seed: sd + 113, t, closed: true, smooth: false }));
          const th = []; for (let y = top + 96; y < py - 6; y += 22) { const o = (n * 66) % 22; th.push(inkPath([[px - 22, y + o * 0.3], [px + 22, y + 10 + o * 0.3]], { w: 3, seed: sd + 114 + y % 7, t, amp: 0.5 })); }
          screw.th.setAttribute('d', th.join(' ')); screw.th.setAttribute('fill', INK.paperLight);
          box(platen, rect(px - pw + 40, py, px + pw - 40, py + 40), 116, t);
          // bar: swings around the screw (foreshortened), its end held by the pressman
          const by = top + 150, ang = lerp(-0.9, 0.9, pull);
          const end = [px - Math.cos(ang) * 270, by + Math.sin(ang) * 46];
          bar.f.setAttribute('d', inkPath([[px + Math.cos(ang) * 40, by - Math.sin(ang) * 8], end], { w: 14, seed: sd + 118, t, amp: 0.8, taper: 0 }));
          bar.knob.setAttribute('d', inkDot(end[0], end[1], 16, 16, sd + 119, t));
          // the sheet under the platen
          sheetIn.g.setAttribute('transform', `translate(${M.f1(px)} ${M.f1(bedY - 6)}) scale(0.62 0.16)`);
          sheetIn.update(t, { seal: 1, value: '100' });
          // pressman
          man.update(t, px - pw - 190, gy, 0.82, { face: 1, lean: lerp(4, -10, pull), armR: [end[0] - 6, end[1] + 4], armL: [end[0] - 30, end[1] + 16] });
          // stacks grow with the pulls since their cue
          let fi = 0;
          stacks.forEach((s, i) => {
            const a = M.atOr(cues, s.s.at, i * 1.5), nn = Math.max(0, n - r0 * Math.max(0, a)), x = (s.s.x ?? 0.8) * W;
            const show = lt >= a;
            const h = show ? Math.min(s.s.max ?? 0.27 * H, 20 + nn * 34) : 0, w = 130;
            if (!show) { for (const e of [s.body, s.lines, s.rim, s.tagF, s.tagR, s.tagS]) e.setAttribute('d', ''); s.tx.setAttribute('opacity', 0); s.top.g.setAttribute('transform', 'scale(0)'); return; }
            const sp = [[x - w / 2, gy], [x + w / 2, gy], [x + w / 2 + 2, gy - h], [x - w / 2 - 2, gy - h]];
            s.body.setAttribute('d', inkLoop(sp, { seed: sd + 200 + i, t, smooth: false }));
            s.rim.setAttribute('d', inkPath(sp, { w: 4.5, seed: sd + 201 + i, t, closed: true, smooth: false }));
            const ls = []; for (let y = gy - 12; y > gy - h + 6; y -= 12) ls.push(inkPath([[x - w / 2 + 4, y], [x + w / 2 - 4, y + 1]], { w: 1.6, seed: sd + 210 + i * 50 + Math.round(y) % 40, t, amp: 0.6 }));
            s.lines.setAttribute('d', ls.join(' '));
            s.top.g.setAttribute('transform', `translate(${M.f1(x)} ${M.f1(gy - h)}) scale(0.36 0.1)`);
            s.top.update(t, { seal: 1, value: '100' });
            // year tag hanging on a string
            const tg = [x, gy - h - 110], sw = Math.sin(t * 2 + i) * 4;
            s.tagS.setAttribute('d', inkPath([[x, gy - h - 6], [tg[0] + sw, tg[1] + 36]], { w: 3, seed: sd + 230 + i, t }));
            const tb = [[tg[0] - 70 + sw, tg[1] - 40], [tg[0] + 70 + sw, tg[1] - 40], [tg[0] + 70 + sw, tg[1] + 36], [tg[0] - 70 + sw, tg[1] + 36]];
            const sp2 = spring(lt, a, 0.5);
            s.tagF.setAttribute('d', inkLoop(tb, { seed: sd + 240 + i, t, smooth: false }));
            s.tagR.setAttribute('d', inkPath(tb, { w: 4, seed: sd + 241 + i, t, closed: true, smooth: false }));
            s.tx.setAttribute('x', M.f1(tg[0] + sw)); s.tx.setAttribute('y', M.f1(tg[1] + 18)); s.tx.setAttribute('opacity', clamp01(sp2));
            // flying sheets: the last pulls' sheets travel to the newest active stack
            void fi;
          });
          const active = stacks.filter(s => lt >= M.atOr(cues, s.s.at, 0));
          fly.forEach((f, j) => {
            const k = ci - j, u = (n - k - 0.6) / 0.7;          // sheet k leaves at phase 0.6 of pull k
            if (k < 0 || u < 0 || u > 1 || !active.length) { f.g.setAttribute('transform', 'scale(0)'); return; }
            const tgt = active[k % active.length], tx = (tgt.s.x ?? 0.8) * W, nn = Math.max(0, n - r0 * Math.max(0, M.atOr(cues, tgt.s.at, 0)));
            const th2 = Math.min(tgt.s.max ?? 0.27 * H, 20 + nn * 34);
            const x = lerp(px + pw, tx, EASE(u)), y = lerp(bedY - 20, gy - th2 - 10, u) - Math.sin(u * Math.PI) * 220;
            f.g.setAttribute('transform', `translate(${M.f1(x)} ${M.f1(y)}) rotate(${M.f1(lerp(-30, 0, u) + Math.sin(u * 9) * 12)}) scale(${M.f1(lerp(0.42, 0.36, u) * 100) / 100} ${M.f1(lerp(0.42, 0.1, u * u) * 100) / 100})`);
            f.update(t, { seal: 1, value: '100' });
          });
          if (kas) kas.update(lt, t, cues);
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
