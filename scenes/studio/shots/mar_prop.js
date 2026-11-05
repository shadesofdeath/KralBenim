// mar_prop: one big object close-up in parchment ink (Stickstory "1904 Olympic marathon"), on a wooden table or a
// sun-baked road side: "thermo" (a tall thermometer whose red column climbs to the given degrees, gold sun behind it),
// "bottle" (a small apothecary bottle with a skull label, a cracked egg whose white pours into a cup, optional brandy
// flask that slides in on a cue), "watch" (a gold stopwatch whose hands sweep to the given time). The narrator can join.
// Set: "interior" (table) or "field". Uses mar__lib.js (MAR) + td__lib.js (TD.label).
// P: {item: "thermo"|"bottle"|"watch", x: 0.5, y: 0.5, s: 1, table: true,
//     thermo: {deg: 90, at: cue, unit: "°F", sun: false}, bottle: {label: "STRYCHNINE", pour: cue (a hand tips it over the cup), egg: cue, brandy: cue},
//     watch: {h: 3, m: 28, s: 53, at: cue}, kasif: person spec, labels: [TD.label specs]}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';
  SH.mar_prop = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const M = window.MAR, TD = window.TD, atOr = M.atOr, ell = M.ell, sd = seed * 1000 + 911;
      const root = el(svg, 'g'), cam = el(root, 'g'), topG = el(root, 'g');
      const X = (P.x ?? 0.5) * W, Y = (P.y ?? 0.5) * H, s = P.s ?? 1;
      const tbl = inkEl(cam, INK.paperDark), tblR = inkEl(cam), grain = inkEl(cam, INK.inkSoft);
      const item = P.item || 'thermo';
      const T = text => { const e = el(cam, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink }); e.textContent = text; return e; };
      let upd = () => {};
      if (item === 'thermo') {
        const O = Object.assign({ deg: 90, unit: '°F' }, P.thermo || {});
        const sun = M.sun(cam, sd + 1), body = inkEl(cam, INK.paperLight), bodyR = inkEl(cam), col = inkEl(cam, INK.red), ticks = inkEl(cam);
        const num = T(''); num.setAttribute('font-size', 120 * s); num.setAttribute('fill', INK.red);
        const tks = [40, 60, 80, 100].map(v => { const e = el(cam, 'text', { 'font-family': INK_FONT, 'font-size': 48 * s, fill: INK.inkSoft, 'text-anchor': 'end' }); e.textContent = v; return e; });
        upd = (lt, t, cues) => {
          if (O.sun) sun.update(t, X + 330 * s, Y - 260 * s, 110 * s);
          const top = Y - 380 * s, bot = Y + 280 * s;
          const tube = [[X - 46 * s, top], [X + 46 * s, top], [X + 46 * s, bot - 40 * s], [X + 80 * s, bot + 40 * s], [X, bot + 120 * s], [X - 80 * s, bot + 40 * s], [X - 46 * s, bot - 40 * s]];
          body.setAttribute('d', inkLoop(tube, { seed: sd + 2, t }));
          bodyR.setAttribute('d', inkPath(tube, { w: 7, seed: sd + 3, t, closed: true }));
          const v = (val) => lerp(bot - 40 * s, top + 40 * s, (val - 30) / 80);
          const cur = lerp(50, O.deg, prog(lt, atOr(cues, O.at, 0.3), 2.2)) + Math.sin(t * 3) * 0.3;
          const cy = v(cur);
          col.setAttribute('d', inkLoop([[X - 22 * s, cy], [X + 22 * s, cy], [X + 22 * s, bot], [X + 56 * s, bot + 40 * s], [X, bot + 96 * s], [X - 56 * s, bot + 40 * s], [X - 22 * s, bot]], { seed: sd + 4, t }));
          let td = '';
          for (let k = 40; k <= 100; k += 5) { const yy = v(k), L = k % 20 === 0 ? 50 : 26; td += inkPath([[X - 46 * s, yy], [X - 46 * s - L * s, yy]], { w: 4, seed: sd + 10 + k, t }) + ' '; }
          ticks.setAttribute('d', td);
          tks.forEach((e, k) => { e.setAttribute('x', f1(X - 110 * s)); e.setAttribute('y', f1(v(40 + k * 20) + 16 * s)); });
          num.textContent = Math.round(cur) + O.unit; num.setAttribute('x', f1(X + 320 * s)); num.setAttribute('y', f1(Y + 120 * s));
        };
      } else if (item === 'bottle') {
        // the trainer's hand (sleeve from the top right) lifts the skull bottle and tips it over the cup on "pour";
        // on "egg" a cracked egg lies on the table and its white fills the cup; "brandy" slides a flask in
        const O = Object.assign({ label: 'STRYCHNINE' }, P.bottle || {});
        const cupF = inkEl(cam, INK.paperLight), cupR = inkEl(cam), eggF = inkEl(cam, INK.paperLight), eggR = inkEl(cam), yolk = inkEl(cam, INK.gold), fill = inkEl(cam, INK.paperLight), fillR = inkEl(cam, INK.inkSoft);
        const flF = inkEl(cam, INK.inkSoft), flR = inkEl(cam), flL = inkEl(cam, INK.gold);
        const bG = el(cam, 'g');
        const glass = inkEl(bG, INK.blue, { 'fill-opacity': 0.8 }), glassR = inkEl(bG), cork = inkEl(bG, INK.paperDark), lab = inkEl(bG, INK.paperLight), labR = inkEl(bG), skull = inkEl(bG), shine = inkEl(bG, INK.paperLight);
        const lt1 = el(bG, 'text', { 'font-family': FR, 'font-weight': 900, 'text-anchor': 'middle', fill: INK.ink }); lt1.textContent = O.label;
        const sleeve = inkEl(cam, INK.inkSoft), sleeveR = inkEl(cam), hand = inkEl(cam, INK.paperLight), handR = inkEl(cam), drops = inkEl(cam, INK.blue);
        const flT = T('BRANDY'); flT.setAttribute('font-size', 34 * s); flT.setAttribute('fill', INK.ink);
        upd = (lt, t, cues) => {
          const cx = X + 200 * s, cy = Y + 300 * s;
          const pa = O.pour != null ? atOr(cues, O.pour, null) : null, pu = pa == null ? 0 : progIO(lt, pa, 1.0);
          const lift = O.pour != null ? progIO(lt, 0.1, 0.8) : 0;
          const bx = lerp(X - 260 * s, cx - 170 * s, pu), by = lerp(cy - 60 * s * lift, cy - 520 * s, pu), ang = lerp(-4 * lift, 118, pu) + Math.sin(t * 1.3) * 1.5;
          bG.setAttribute('transform', `translate(${f1(bx)} ${f1(by)}) rotate(${f1(ang)})`);
          const q = (a, b) => [a * s, b * s];
          const bp = [q(-110, 0), q(-120, -300), q(-60, -380), q(-46, -470), q(46, -470), q(60, -380), q(120, -300), q(110, 0)];
          glass.setAttribute('d', inkLoop(bp, { seed: sd + 1, t, smooth: false }));
          glassR.setAttribute('d', inkPath(bp, { w: 7, seed: sd + 2, t, closed: true, smooth: false }));
          cork.setAttribute('d', pu > 0.3 ? '' : inkLoop([q(-40, -466), q(40, -466), q(34, -540), q(-34, -540)], { seed: sd + 3, t, smooth: false }));
          const lp = [q(-96, -250), q(96, -250), q(96, -60), q(-96, -60)];
          lab.setAttribute('d', inkLoop(lp, { seed: sd + 4, t, smooth: false }));
          labR.setAttribute('d', inkPath(lp, { w: 4, seed: sd + 5, t, closed: true, smooth: false }));
          const sk = q(0, -140);
          skull.setAttribute('d', inkCircle(sk[0], sk[1], 30 * s, sd + 6, t, { w: 5 }) + ' ' + inkDot(sk[0] - 11 * s, sk[1] - 4 * s, 7 * s, 8 * s, sd + 7, t) + ' ' + inkDot(sk[0] + 11 * s, sk[1] - 4 * s, 7 * s, 8 * s, sd + 8, t)
            + ' ' + inkPath([[sk[0] - 46 * s, sk[1] + 40 * s], [sk[0] + 46 * s, sk[1] + 64 * s]], { w: 6, seed: sd + 9, t }) + ' ' + inkPath([[sk[0] + 46 * s, sk[1] + 40 * s], [sk[0] - 46 * s, sk[1] + 64 * s]], { w: 6, seed: sd + 10, t }));
          lt1.setAttribute('x', 0); lt1.setAttribute('y', f1(-206 * s)); lt1.setAttribute('font-size', f1(Math.min(44, 300 / Math.max(6, O.label.length)) * s));
          shine.setAttribute('d', inkPath([q(80, -290), q(88, -40)], { w: 9, seed: sd + 11, t }));
          // hand gripping the bottle side + sleeve to the top-right corner
          const a = ang * Math.PI / 180, wp = (lx, ly) => [bx + (lx * Math.cos(a) - ly * Math.sin(a)) * s, by + (lx * Math.sin(a) + ly * Math.cos(a)) * s];
          if (O.pour != null) {
            const hc = wp(118, -200), top = [X + 560 * s, Y - 560 * s];
            const dx = top[0] - hc[0], dy = top[1] - hc[1], dl = Math.hypot(dx, dy) || 1, nx = -dy / dl * 46 * s, ny = dx / dl * 46 * s;
            const slp = [[hc[0] + nx + dx * 0.15, hc[1] + ny + dy * 0.15], [top[0] + nx, top[1] + ny], [top[0] - nx, top[1] - ny], [hc[0] - nx + dx * 0.15, hc[1] - ny + dy * 0.15]];
            sleeve.setAttribute('d', inkLoop(slp, { seed: sd + 30, t, smooth: false })); sleeveR.setAttribute('d', inkPath(slp, { w: 5, seed: sd + 31, t, closed: true, smooth: false }));
            const hp = ell(hc[0], hc[1], 52 * s, 44 * s, 12);
            hand.setAttribute('d', inkLoop(hp, { seed: sd + 32, t })); handR.setAttribute('d', inkPath(hp, { w: 5, seed: sd + 33, t, closed: true }) + ' ' + [0, 1, 2].map(k => inkPath([wp(118 - 30, -230 + k * 26), wp(118 - 62, -226 + k * 26)], { w: 5, seed: sd + 34 + k, t })).join(' '));
          }
          // drops from the neck into the cup
          let dd = '';
          if (pu > 0.9) { const nk = wp(0, -480); for (let k = 0; k < 4; k++) { const u = ((lt * 1.6 + k / 4) % 1); dd += inkDot(lerp(nk[0], cx, u), lerp(nk[1], cy - 170 * s, u), 9 * s, 13 * s, sd + 40 + k, t) + ' '; } }
          drops.setAttribute('d', dd);
          // cup
          const cp = [[cx - 110 * s, cy - 170 * s], [cx + 110 * s, cy - 170 * s], [cx + 80 * s, cy], [cx - 80 * s, cy]];
          cupF.setAttribute('d', inkLoop(cp, { seed: sd + 12, t, smooth: false }));
          cupR.setAttribute('d', inkPath(cp, { w: 6, seed: sd + 13, t, closed: true, smooth: false }) + ' ' + inkPath([[cx + 104 * s, cy - 140 * s], [cx + 160 * s, cy - 120 * s], [cx + 150 * s, cy - 50 * s], [cx + 86 * s, cy - 40 * s]], { w: 6, seed: sd + 14, t }));
          // cracked egg on the table + egg white in the cup
          const ea = O.egg != null ? atOr(cues, O.egg, null) : null;
          if (ea != null && lt >= ea) {
            const u = spring(lt, ea, 0.5), ex = cx + 300 * s, ey = cy - 30 * s;
            const hA = ell(ex - 60 * s, ey, 54 * s, 34 * s, 12).filter(p => p[1] >= ey - 4), hB = ell(ex + 60 * s, ey, 54 * s, 34 * s, 12).filter(p => p[1] >= ey - 4);
            const zig = k => [[ex + (k ? 6 : -114) * s, ey], [ex + (k ? 24 : -96) * s, ey - 12 * s], [ex + (k ? 42 : -78) * s, ey], [ex + (k ? 60 : -60) * s, ey - 12 * s], [ex + (k ? 78 : -42) * s, ey], [ex + (k ? 96 : -24) * s, ey - 12 * s], [ex + (k ? 114 : -6) * s, ey]];
            eggF.setAttribute('d', inkLoop(hA.concat(zig(0).reverse()), { seed: sd + 15, t }) + ' ' + inkLoop(hB.concat(zig(1).reverse()), { seed: sd + 16, t }));
            eggR.setAttribute('d', inkPath(hA.concat(zig(0).reverse()), { w: 5, seed: sd + 17, t, closed: true, smooth: false }) + ' ' + inkPath(hB.concat(zig(1).reverse()), { w: 5, seed: sd + 18, t, closed: true, smooth: false }));
            eggF.setAttribute('transform', `translate(0 ${f1((1 - u) * -80)})`); eggR.setAttribute('transform', `translate(0 ${f1((1 - u) * -80)})`);
            const fp = ell(cx, cy - 168 * s, 100 * s * u, 16 * s * u, 12);
            fill.setAttribute('d', inkLoop(fp, { seed: sd + 19, t })); fillR.setAttribute('d', inkPath(fp, { w: 3, seed: sd + 20, t, closed: true }));
            yolk.setAttribute('d', inkDot(cx + 10 * s, cy - 170 * s, 26 * s * u, 10 * s * u, sd + 21, t));
          } else { eggF.setAttribute('d', ''); eggR.setAttribute('d', ''); fill.setAttribute('d', ''); fillR.setAttribute('d', ''); yolk.setAttribute('d', ''); }
          // brandy flask slides in
          const fa = O.brandy != null ? atOr(cues, O.brandy, null) : null;
          if (fa != null && lt >= fa) {
            const u = spring(lt, fa, 0.6), fx = lerp(W + 200, X + 560 * s, u), fy = Y + 300 * s;
            const fp = [[fx - 80 * s, fy], [fx - 90 * s, fy - 240 * s], [fx - 30 * s, fy - 290 * s], [fx - 26 * s, fy - 360 * s], [fx + 26 * s, fy - 360 * s], [fx + 30 * s, fy - 290 * s], [fx + 90 * s, fy - 240 * s], [fx + 80 * s, fy]];
            flF.setAttribute('d', inkLoop(fp, { seed: sd + 22, t, smooth: false }));
            flR.setAttribute('d', inkPath(fp, { w: 6, seed: sd + 23, t, closed: true, smooth: false }));
            flL.setAttribute('d', inkLoop([[fx - 70 * s, fy - 180 * s], [fx + 70 * s, fy - 180 * s], [fx + 70 * s, fy - 100 * s], [fx - 70 * s, fy - 100 * s]], { seed: sd + 24, t, smooth: false }));
            flT.setAttribute('x', f1(fx)); flT.setAttribute('y', f1(fy - 128 * s)); flT.setAttribute('opacity', 1);
          } else { flF.setAttribute('d', ''); flR.setAttribute('d', ''); flL.setAttribute('d', ''); flT.setAttribute('opacity', 0); }
        };
      } else if (item === 'watch') {
        const O = Object.assign({ h: 3, m: 28, s: 53 }, P.watch || {});
        const chain = inkEl(cam, INK.gold), chainR = inkEl(cam), caseF = inkEl(cam, INK.gold), caseR = inkEl(cam), face = inkEl(cam, INK.paperLight), ticks = inkEl(cam), hands = inkEl(cam), sec = inkEl(cam, INK.red), crown = inkEl(cam, INK.gold);
        const nums = [12, 3, 6, 9].map(v => { const e = T(String(v)); e.setAttribute('font-size', 64 * s); return e; });
        const read = T(''); read.setAttribute('font-size', 110 * s); read.setAttribute('fill', INK.red);
        upd = (lt, t, cues) => {
          const R = 300 * s, cx = X - 200 * s, cy = Y + 30 * s;
          let cd = ''; for (let k = 0; k < 8; k++) { const c = [cx + k * 34 * s + Math.sin(k * 0.9 + t * 1.5) * 4, cy - R - 90 * s - k * 12 * s + k * k * 3 * s]; cd += inkCircle(c[0], c[1], 15 * s, sd + 40 + k, t, { w: 6 }) + ' '; }
          chainR.setAttribute('d', cd);
          crown.setAttribute('d', inkLoop([[cx - 40 * s, cy - R - 10], [cx + 40 * s, cy - R - 10], [cx + 30 * s, cy - R - 70 * s], [cx - 30 * s, cy - R - 70 * s]], { seed: sd + 1, t, smooth: false }));
          caseF.setAttribute('d', inkDot(cx, cy, R + 30 * s, R + 30 * s, sd + 2, t, 1));
          caseR.setAttribute('d', inkCircle(cx, cy, R + 30 * s, sd + 3, t, { w: 8 }) + ' ' + inkCircle(cx, cy, R, sd + 4, t, { w: 5 }));
          face.setAttribute('d', inkDot(cx, cy, R, R, sd + 5, t, 1));
          let td = ''; for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, L = k % 5 === 0 ? 34 : 14; td += inkPath([[cx + Math.sin(a) * (R - 10), cy - Math.cos(a) * (R - 10)], [cx + Math.sin(a) * (R - 10 - L * s), cy - Math.cos(a) * (R - 10 - L * s)]], { w: k % 5 ? 2.5 : 5, seed: sd + 100 + k, t, amp: 0.3 }) + ' '; }
          ticks.setAttribute('d', td);
          nums.forEach((e, k) => { const a = k * Math.PI / 2; e.setAttribute('x', f1(cx + Math.sin(a) * (R - 85 * s))); e.setAttribute('y', f1(cy - Math.cos(a) * (R - 85 * s) + 22 * s)); });
          const u = prog(lt, atOr(cues, O.at, 0.3), 3.0), total = (O.h * 60 + O.m) * u + O.s / 60 * u;   // minutes
          const hh = total / 60, mm = total % 60, ss = (O.s * u + lt * 0) % 60;
          const ha = hh / 12 * Math.PI * 2, ma = mm / 60 * Math.PI * 2, sa = u < 1 ? total * 6 % (Math.PI * 2) : (ss / 60 * Math.PI * 2);
          hands.setAttribute('d', inkPath([[cx, cy], [cx + Math.sin(ha) * R * 0.5, cy - Math.cos(ha) * R * 0.5]], { w: 14 * s, seed: sd + 6, t, taper: 0.4 }) + ' ' + inkPath([[cx, cy], [cx + Math.sin(ma) * R * 0.78, cy - Math.cos(ma) * R * 0.78]], { w: 9 * s, seed: sd + 7, t, taper: 0.4 }));
          sec.setAttribute('d', inkPath([[cx, cy], [cx + Math.sin(sa) * R * 0.86, cy - Math.cos(sa) * R * 0.86]], { w: 4, seed: sd + 8, t }) + ' ' + inkDot(cx, cy, 14 * s, 14 * s, sd + 9, t));
          const H_ = Math.floor(hh), M_ = Math.floor(mm), S_ = Math.floor(O.s * u);
          read.textContent = `${H_}:${String(M_).padStart(2, '0')}:${String(S_).padStart(2, '0')}`;
          read.setAttribute('x', f1(X + 400 * s)); read.setAttribute('y', f1(Y + 60 * s));
        };
      }
      const kas = P.kasif ? M.person(topG, Object.assign({ x: 0.86, y: 0.86, scale: 0.85, pose: 'point', face: 'left', dir: 20 }, P.kasif, { hat: true }), sd + 90) : null;
      const labels = (P.labels || []).map((L, i) => TD.label(topG, L, W, H, sd + 400 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const z = lerp(1, 1.05, progIO(lt, 0, Math.max(1, dur))), cx = W * 0.5, cy = H * 0.5;
          cam.setAttribute('transform', `translate(${f1(cx)} ${f1(cy)}) scale(${z.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          if (P.table !== false) {
            const ty = Y + 300 * s - 4, tp = [[-20, ty], [W + 20, ty - 6], [W + 20, H + 20], [-20, H + 20]];
            tbl.setAttribute('d', inkLoop(tp, { seed: sd + 70, t, smooth: false }));
            tblR.setAttribute('d', inkPath([[-20, ty], [W + 20, ty - 6]], { w: 7, seed: sd + 71, t }));
            let gd = ''; for (let k = 0; k < 4; k++) gd += inkPath([[-20, ty + 50 + k * 50], [W * 0.4, ty + 54 + k * 50], [W + 20, ty + 46 + k * 50]], { w: 3, seed: sd + 72 + k, t }) + ' ';
            grain.setAttribute('d', gd);
          }
          upd(lt, t, cues);
          if (kas) kas.update(lt, t, cues, W, H, {});
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
  const f1 = v => Math.round(v * 10) / 10;
})();
