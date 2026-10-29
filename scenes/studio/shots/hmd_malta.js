// hmd_malta: the Hamidiye at Malta (February 1913), parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz, pure
// function of (seed, lt)). Valletta's Grand Harbour: honey-stone bastion walls rise straight out of the water on both
// sides, with flat-roofed houses, a big church dome and two bell towers on top; the harbour water runs down to a stone
// quay along the frame bottom. Modes:
//   harbour: the cruiser lies at anchor in the middle of the harbour; a big hand-drawn hourglass hangs in the sky
//            (right) and runs out (`clock` cue starts it; its sand runs over the scene), with P.label ("24 saat") under it.
//   excuse:  on the quay, close: a British harbour officer (white tunic, hatless) holds out a permit paper; the
//            cruiser's commander (dark navy coat, moustache, hatless) answers with a shrug and points back at his ship;
//            on `excuse` one black puff coughs out of the middle funnel, his eyebrow goes up and P.label ("makine
//            arızası") pops between them; the officer leans in to look.
// Leaves the sky to the scene's "set" (coast); water line ≈ P.water.
// P: {mode: "harbour"|"excuse", water: 0.5 (0..1 H), ship: {x, y, s, face}, label: {text, x, y, at, size, color, hit}}
// cues: clock (harbour), excuse (excuse), label.at. Needs hmd__lib.js (HMD).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const STONE = () => mix(INK.gold, INK.paperLight, 0.45);
  function town(parent, seed) {
    const g = el(parent, 'g');
    const wall = inkEl(g, STONE()), shade = inkEl(g, mix(INK.stain, INK.gold, 0.3), { 'fill-opacity': 0.6 }), courses = inkEl(g, INK.inkSoft), houses = inkEl(g, mix(STONE(), INK.paperLight, 0.35)), housesR = inkEl(g), win = inkEl(g, INK.inkSoft), dome = inkEl(g, mix(INK.red, INK.stain, 0.5)), domeR = inkEl(g);
    // o: {x0, x1, top (wall top), base (water), side: 1 (slopes up to the right) | -1, dome: true}
    function update(t, o) {
      const k = seed * 31, { x0, x1, top, base } = o, s = o.u || 1;
      const slope = (o.side ?? 1) * 40 * s;
      const wp = [[x0, base], [x0 + Math.max(0, slope), top], [x1 + Math.min(0, slope), top], [x1, base]];
      wall.setAttribute('d', inkLoop(wp, { seed: k + 1, t, smooth: false, amp: 1 }));
      shade.setAttribute('d', inkLoop([[x0, base], [x0 + Math.max(0, slope), top + (base - top) * 0.55], [x1 + Math.min(0, slope), top + (base - top) * 0.55], [x1, base]], { seed: k + 2, t, smooth: false, amp: 1 }));
      const C = [inkPath(wp, { w: 5, seed: k + 3, t, closed: true, smooth: false })];
      for (let y = top + 40 * s, j = 0; y < base - 10; y += 40 * s, j++) { C.push(inkPath([[x0 + 6, y], [x1 - 6, y]], { w: 2.2, seed: k + 10 + j, t })); for (let x = x0 + ((j % 2) * 40 + 20) * s; x < x1 - 20; x += 80 * s) C.push(inkPath([[x, y - 40 * s], [x, y]], { w: 1.8, seed: k + 50 + j * 13 + Math.round(x), t })); }
      // parapet + embrasures
      for (let x = x0 + 30 * s; x < x1 - 30 * s; x += 70 * s) C.push(inkPath([[x, top], [x, top - 22 * s], [x + 36 * s, top - 22 * s], [x + 36 * s, top]], { w: 4, seed: k + 200 + Math.round(x), t, smooth: false }));
      courses.setAttribute('d', C.join(' '));
      // houses + dome + towers above the wall
      const H1 = [], HR = [], WN = [];
      const rr = rng(seed * 7 + 3);
      for (let x = x0 + 10 * s; x < x1 - 60 * s; ) {
        const w = (70 + rr() * 60) * s, h = (60 + rr() * 110) * s, y = top - 22 * s;
        const hp = [[x, y], [x + w, y], [x + w, y - h], [x, y - h]];
        H1.push(inkLoop(hp, { seed: k + 300 + Math.round(x), t, smooth: false, amp: 0.8 }));
        HR.push(inkPath(hp, { w: 3.5, seed: k + 400 + Math.round(x), t, closed: true, smooth: false }));
        for (let wy = y - h + 18 * s; wy < y - 24 * s; wy += 40 * s) for (let wx = x + 12 * s; wx < x + w - 20 * s; wx += 28 * s) WN.push(inkLoop([[wx, wy], [wx + 12 * s, wy], [wx + 12 * s, wy + 18 * s], [wx, wy + 18 * s]], { seed: k + 500 + Math.round(wx + wy), t, smooth: false, amp: 0.4 }));
        x += w + 4 * s;
      }
      let D = '', DR = '';
      if (o.dome) {
        const cx = lerp(x0, x1, o.domeAt ?? 0.55), dy = top - 150 * s, r = 95 * s;
        const drum = [[cx - r, dy + 70 * s], [cx + r, dy + 70 * s], [cx + r, dy], [cx - r, dy]];
        H1.push(inkLoop(drum, { seed: k + 600, t, smooth: false })); HR.push(inkPath(drum, { w: 4, seed: k + 601, t, closed: true, smooth: false }));
        const dp = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * i / 12; dp.push([cx + Math.cos(a) * r, dy - Math.sin(a) * r * 1.05]); }
        D = inkLoop(dp, { seed: k + 602, t, amp: 0.8 });
        DR = inkPath(dp, { w: 5, seed: k + 603, t, amp: 0.8 }) + ' ' + inkPath([[cx, dy - r * 1.05], [cx, dy - r * 1.5]], { w: 6, seed: k + 604, t }) + ' ' + inkPath([[cx - 14 * s, dy - r * 1.38], [cx + 14 * s, dy - r * 1.38]], { w: 5, seed: k + 605, t });
        [-1, 1].forEach((sg, i) => { const tx = cx + sg * (r + 60 * s), tp = [[tx - 26 * s, top - 22 * s], [tx + 26 * s, top - 22 * s], [tx + 26 * s, top - 260 * s], [tx, top - 300 * s], [tx - 26 * s, top - 260 * s]]; H1.push(inkLoop(tp, { seed: k + 610 + i, t, smooth: false })); HR.push(inkPath(tp, { w: 4, seed: k + 612 + i, t, closed: true, smooth: false })); WN.push(inkLoop([[tx - 9 * s, top - 230 * s], [tx + 9 * s, top - 230 * s], [tx + 9 * s, top - 190 * s], [tx - 9 * s, top - 190 * s]], { seed: k + 614 + i, t, smooth: false })); });
      }
      houses.setAttribute('d', H1.join(' ')); housesR.setAttribute('d', HR.join(' ')); win.setAttribute('d', WN.join(' '));
      dome.setAttribute('d', D); domeR.setAttribute('d', DR);
    }
    return { g, update };
  }
  function quay(parent, seed) {
    const g = el(parent, 'g');
    const crate = inkEl(g, mix(INK.stain, INK.paperLight, 0.3)), crateR = inkEl(g), top = inkEl(g, STONE()), face = inkEl(g, mix(INK.stain, INK.gold, 0.35)), lines = inkEl(g, INK.inkSoft), bol = inkEl(g, INK.ink), rope = inkEl(g, INK.stain), ropeR = inkEl(g);
    function update(t, W, H, y, s, o = {}) {
      const k = seed * 17;
      top.setAttribute('d', `M-20 ${HMD.f1(y)} H${W + 20} V${H + 20} H-20 Z`);
      face.setAttribute('d', inkLoop([[-20, y], [W + 20, y], [W + 20, y + 40 * s], [-20, y + 40 * s]], { seed: k + 1, t, smooth: false }));
      const L = [inkPath([[-20, y], [W + 20, y]], { w: 7, seed: k + 2, t }), inkPath([[-20, y + 40 * s], [W + 20, y + 40 * s]], { w: 4, seed: k + 3, t })];
      for (let yy = y + 120 * s, j = 0; yy < H + 40; j++, yy += (90 + j * 50) * s) { L.push(inkPath([[-20, yy], [W + 20, yy]], { w: 3, seed: k + 10 + j, t })); for (let x = ((j % 2) * 0.5) * (220 + j * 120) * s; x < W; x += (220 + j * 120) * s) L.push(inkPath([[x, yy - (90 + j * 50) * s + 10], [x - 20 * s * (x / W - 0.5) * 4, yy]], { w: 2.5, seed: k + 40 + j * 10 + Math.round(x), t })); }
      lines.setAttribute('d', L.join(' '));
      if (o.bollard !== false) {
        const bx = (o.bx ?? 0.88) * W, by = y + 160 * s;
        const bb = Math.min(H + 30, by + 150 * s);
        bol.setAttribute('d', inkLoop([[bx - 64 * s, bb], [bx - 50 * s, by], [bx - 80 * s, by - 34 * s], [bx + 80 * s, by - 34 * s], [bx + 50 * s, by], [bx + 64 * s, bb]], { seed: k + 90, t, smooth: false }));
        const cp = inkEllipsePts(bx - 230 * s, H - 120 * s, 150 * s, 50 * s, k + 91, 14);
        rope.setAttribute('d', inkLoop(cp, { seed: k + 92, t }));
        ropeR.setAttribute('d', [0, 1, 2].map(i => inkCircle(bx - 230 * s, H - 120 * s, (150 - i * 40) * s, k + 93 + i, t, { ry: (50 - i * 14) * s, w: 5 })).join(' ') + ' ' + inkPath([[bx - 100 * s, H - 130 * s], [bx - 50 * s, by - 10 * s]], { w: 9 * s, seed: k + 97, t }));
      } else HMD.blank(bol, rope, ropeR);
      // wooden crates cropped by the frame bottom (foreground)
      const CF = [], CR = [];
      (o.crates || []).forEach((c, i) => {
        const x = c[0] * W, w = c[1] * s, h = c[2] * s, by = H + 30 - (c[3] || 0) * s, b = [[x - w / 2, by - h], [x + w / 2, by - h], [x + w / 2, by], [x - w / 2, by]];
        CF.push(inkLoop(b, { seed: k + 300 + i, t, smooth: false }));
        CR.push(inkPath(b, { w: 5, seed: k + 310 + i, t, closed: true, smooth: false }), inkPath([[x - w / 2, by - h * 0.5], [x + w / 2, by - h * 0.5]], { w: 3, seed: k + 320 + i, t }), inkPath([[x - w / 2 + 12, by - h + 12], [x + w / 2 - 12, by - h * 0.5 - 8]], { w: 3, seed: k + 330 + i, t }));
      });
      crate.setAttribute('d', CF.join(' ')); crateR.setAttribute('d', CR.join(' '));
      // drawn last = in front
      g.appendChild(crate); g.appendChild(crateR);
    }
    return { g, update };
  }
  SH.hmd_malta = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.HMD, sd = seed * 1000 + 631, mode = P.mode || 'harbour', u = W / 1080;
      const root = el(svg, 'g');
      const wy = (P.water ?? (mode === 'harbour' ? 0.5 : 0.42)) * H;
      const townL = town(el(root, 'g'), sd + 1), townR = town(el(root, 'g'), sd + 2);
      const sea = M.sea(el(root, 'g'), sd + 3);
      const sp = Object.assign(mode === 'harbour' ? { x: 0.5, y: 0.62, s: 0.72, face: -1 } : { x: 0.5, y: 0.5, s: 0.8, face: -1 }, P.ship || {});
      const ship = M.cruiser(el(root, 'g'), sd + 10, { funnels: 3, flag: 'tr' });
      const q = quay(el(root, 'g'), sd + 20);
      const lab = P.label ? M.label(root, P.label, W, H) : null;
      if (mode === 'harbour') {
        const hg = el(root, 'g');
        const glassF = inkEl(hg, INK.paperLight, { 'fill-opacity': 0.85 }), sandT = inkEl(hg, INK.gold), sandB = inkEl(hg, INK.gold), stream = inkEl(hg, INK.gold), frame = inkEl(hg, INK.stain), frameR = inkEl(hg), glassR = inkEl(hg);
        return {
          update(lt, dur, cues, env = {}) {
            const t = env.t ?? lt;
            townL.update(t, { x0: -40, x1: 0.36 * W, top: wy - 260 * u, base: wy + 6, side: -1, u, dome: false });
            townR.update(t, { x0: 0.56 * W, x1: W + 40, top: wy - 200 * u, base: wy + 6, side: 1, u, dome: true, domeAt: 0.42 });
            sea.update(t, W, H, wy, { rows: 8, near: false });
            ship.update(t, sp.x * W, sp.y * H, sp.s * u, { face: sp.face, smoke: 0.3, lights: 0, roll: Math.sin(t * 0.8) * 0.8 });
            q.update(t, W, H, 0.8 * H, u, { bx: 0.88 });
            // hourglass (sky, right)
            const c0 = M.atOr(cues, 'clock', 0.2), run = clamp01((lt - c0) / Math.max(1, dur - c0 + 0.5));
            const ap = spring(lt, 0.05, 0.6) * (1 + 0.1 * punch(lt, c0, 0.7));
            const cx = 0.78 * W, cy = 0.2 * H, s = 1.15 * u * ap, ww = 110 * s, hh = 160 * s, rot = Math.sin(t * 0.9) * 0.04;
            const T = p => [cx + (p[0] * Math.cos(rot) - p[1] * Math.sin(rot)), cy + (p[0] * Math.sin(rot) + p[1] * Math.cos(rot))];
            const gl = [[-ww, -hh], [ww, -hh], [12 * s, -6 * s], [ww, hh], [-ww, hh], [-12 * s, -6 * s]].map(T);
            glassF.setAttribute('d', inkLoop(gl, { seed: sd + 50, t, amp: 0.8 }));
            const topL = lerp(-hh + 20 * s, -14 * s, run), bw = (y) => lerp(ww - 10 * s, 14 * s, (y + hh) / (hh - 6 * s));
            sandT.setAttribute('d', run < 0.98 ? inkLoop([[-bw(topL), topL], [bw(topL), topL], [8 * s, -10 * s], [-8 * s, -10 * s]].map(T), { seed: sd + 51, t, amp: 0.6, smooth: false }) : '');
            const bh = lerp(10 * s, hh * 0.75, run);
            sandB.setAttribute('d', inkLoop([[-ww + 12 * s, hh - 8 * s], [ww - 12 * s, hh - 8 * s], [ww * 0.3, hh - 8 * s - bh], [0, hh - 14 * s - bh * 1.15], [-ww * 0.3, hh - 8 * s - bh]].map(T), { seed: sd + 52, t, amp: 0.6 }));
            stream.setAttribute('d', run > 0.01 && run < 0.98 ? inkPath([T([0, -6 * s]), T([Math.sin(t * 8) * 2, hh - 14 * s - bh])], { w: 5 * s, seed: sd + 53, t, amp: 0.4 }) : '');
            const fr = [[-ww - 24 * s, -hh - 24 * s], [ww + 24 * s, -hh - 24 * s], [ww + 24 * s, -hh], [-ww - 24 * s, -hh]], fb = fr.map(p => [p[0], -p[1]]);
            frame.setAttribute('d', inkLoop(fr.map(T), { seed: sd + 54, t, smooth: false }) + ' ' + inkLoop(fb.map(T), { seed: sd + 55, t, smooth: false }));
            frameR.setAttribute('d', inkPath(fr.map(T), { w: 5, seed: sd + 56, t, closed: true, smooth: false }) + ' ' + inkPath(fb.map(T), { w: 5, seed: sd + 57, t, closed: true, smooth: false }) +
              ' ' + [-1, 1].map((sg, i) => inkPath([T([sg * (ww + 12 * s), -hh]), T([sg * (ww + 12 * s), hh])], { w: 9 * s, seed: sd + 58 + i, t })).join(' '));
            glassR.setAttribute('d', inkPath(gl, { w: 5, seed: sd + 60, t, closed: true, amp: 0.8 }));
            if (lab) lab.update(lt, t, cues);
          },
        };
      }
      // excuse: two men on the quay, the ship behind
      const officer = M.person(el(root, 'g'), sd + 30, { kind: 'white' });
      const rauf = M.person(el(root, 'g'), sd + 40, { kind: 'navy' });
      const paper = inkEl(root, INK.paperLight), paperR = inkEl(root), paperL = inkEl(root, INK.inkSoft);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const ex = M.atOr(cues, 'excuse', dur * 0.5);
          townR.update(t, { x0: 0.5 * W, x1: W + 40, top: wy - 230 * u, base: wy + 6, side: 1, u, dome: true, domeAt: 0.5 });
          townL.update(t, { x0: -40, x1: 0.18 * W, top: wy - 300 * u, base: wy + 6, side: -1, u, dome: false });
          sea.update(t, W, H, wy, { rows: 6, near: false });
          const pf = lt >= ex ? clamp01((lt - ex) / 1.2) : 0;
          const shipRes = ship.update(t, sp.x * W, sp.y * H, sp.s * u, { face: sp.face, smoke: 0.25, lights: 0, puff: pf > 0 && pf < 1 ? pf : 0 });
          const qy = 0.6 * H;
          q.update(t, W, H, qy, u, { bollard: false, crates: [[0.1, 300, 260], [0.9, 340, 300], [0.5, 260, 170]] });
          const gy = 0.72 * H, s = 1.08 * u;
          // officer (left) holds out the permit; leans in after the excuse
          const lean = lt >= ex ? 10 * progIO(lt, ex + 0.3, 0.5) : 0;
          const ox = 0.2 * W;
          const po = officer.update(t, ox, gy, s, { face: 1, lean, armR: [ox + 160 * s, gy - 330 * s + Math.sin(t * 2) * 4], armL: [ox - 30 * s, gy - 210 * s], brow: lt >= ex ? progIO(lt, ex + 0.2, 0.3) : 0 });
          const hp = po.hR, pw = 90 * s, ph = 120 * s;
          const pp = [[hp[0] - 10 * s, hp[1] - ph * 0.8], [hp[0] + pw, hp[1] - ph * 0.85], [hp[0] + pw + 6 * s, hp[1] + ph * 0.2], [hp[0] - 6 * s, hp[1] + ph * 0.2]];
          paper.setAttribute('d', inkLoop(pp, { seed: sd + 70, t, smooth: false }));
          paperR.setAttribute('d', inkPath(pp, { w: 4, seed: sd + 71, t, closed: true, smooth: false }));
          paperL.setAttribute('d', [0, 1, 2, 3].map(i => inkPath([[hp[0] + 8 * s, hp[1] - ph * 0.6 + i * 24 * s], [hp[0] + pw - 14 * s, hp[1] - ph * 0.62 + i * 24 * s]], { w: 3, seed: sd + 72 + i, t })).join(' '));
          // Rauf Bey (right): palms up first, then points straight at the middle funnel of his ship, eyebrow up
          const rx = 0.8 * W, pointing = lt >= ex - 0.5;
          const ft = shipRes.funnelTops[1] || shipRes.bridge, shR = [rx - 40 * s, gy - 386 * s];
          const dv = [ft[0] - shR[0], ft[1] + 20 * u - shR[1]], dl = Math.hypot(dv[0], dv[1]) || 1, reach = 175 * s;
          const armR = pointing ? [shR[0] + dv[0] / dl * reach, shR[1] + dv[1] / dl * reach + Math.sin(t * 3) * 4] : [rx - 150 * s, gy - 300 * s];
          const armL = pointing ? [rx + 60 * s, gy - 240 * s] : [rx + 110 * s, gy - 300 * s];
          rauf.update(t, rx, gy, s, { face: -1, armR, armL, brow: pointing ? 1 : 0.2, lean: pointing ? -3 : 3, bendR: 1 });
          if (lab) lab.update(lt, t, cues);
        },
      };
    },
  };
})();
