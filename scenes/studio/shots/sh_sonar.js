// sh_sonar: a 1940s ship's sonar room in parchment ink (brand/kit/BRAND.md §3, §5): wall with a porthole and pipes,
// a console with a round scope (dark ink screen, range rings, a turning gold sweep, one target blip that glows as the
// sweep passes). On "noise" the screen fills with flickering crackle specks, the blip is lost, the operator (a crew
// member wearing headphones, no hat) flinches and crackle zig-zags burst from his ears. Labels and the narrator.
// Uses td__lib.js (TD) + sh__lib.js (SHR).
// P: {floor: 0.6, scope: {x: 0.36, y: 0.33, r: 200}, blip: [0.5, -0.35] (polar offset in r: [dist, angle rad]),
//     noise: cue|sec | false, operator: {x: 0.7, scale: 0.75, pose: "idle", seq} | false, kasif: K | false,
//     labels: [TD.label specs]}
// cues: hit (punch), noise / labels / seq names
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.sh_sonar = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const TD = window.TD, SHR = window.SHR, f1 = SHR.f1, atOr = TD.atOr, sd = seed * 1000 + 877;
      const FL = P.floor ?? 0.6, SC = Object.assign({ x: 0.36, y: 0.33, r: 200 }, P.scope || {});
      const root = el(svg, 'g'), cam = el(root, 'g');
      const wall = inkEl(cam, INK.inkSoft), pipes = inkEl(cam), port = inkEl(cam, INK.paperLight), portR = inkEl(cam), sea = inkEl(cam, INK.blue, { 'fill-opacity': 0.5 });
      const consF = inkEl(cam, INK.paperDark), consR = inkEl(cam), knobs = inkEl(cam);
      const screen = inkEl(cam, INK.ink), ringsE = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), sweep = inkEl(cam, INK.gold), blipE = inkEl(cam, INK.gold);
      const specks = inkEl(cam, INK.gold), specks2 = inkEl(cam, INK.paperLight), bezel = inkEl(cam);
      const op = P.operator === false ? null : TD.figure(el(root, 'g'), Object.assign({ x: 0.72, y: FL, scale: 0.75, pose: 'idle', face: 'left', hat: false }, P.operator || {}), sd + 9);
      const phones = inkEl(root), zig = inkEl(root, INK.red);
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 20 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.14, y: FL, scale: 0.7, pose: 'point', face: 'right', dir: 30 }, P.kasif), sd + 8) : null;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const na = P.noise === false ? null : atOr(cues, P.noise ?? 'noise', null);
          const nz = na == null ? 0 : (lt >= na ? prog(lt, na, 0.25) : 0);
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6), np = punch(lt, na, 0.5);
          const z = lerp(1, 1.06, progIO(lt, 0, Math.max(1, dur))) * (1 + 0.025 * hit);
          const fx = SC.x * W, fy = SC.y * H, shake = np * Math.sin(lt * 80) * 8;
          cam.setAttribute('transform', `translate(${f1(fx + shake)} ${f1(fy)}) scale(${z.toFixed(4)}) translate(${f1(-fx)} ${f1(-fy)})`);
          const fy0 = FL * H;
          // room
          wall.setAttribute('d', inkPath([[0, fy0], [W, fy0]], { w: 7, seed: sd + 1, t }) + ' ' +
            [0.08, 0.6, 0.94].map((x, k) => inkPath([[x * W, 0.15 * H], [x * W, fy0]], { w: 3.4, seed: sd + 2 + k, t, amp: 1 })).join(' ') + ' ' +
            [0, 1, 2, 3, 4, 5].map(k => inkPath([[k * W / 5 + 20, fy0 + 30], [k * W / 5 + 90, fy0 + 26]], { w: 3.4, seed: sd + 10 + k, t, amp: 1 })).join(' '));
          pipes.setAttribute('d', inkPath([[0, 0.17 * H], [W * 0.62, 0.17 * H], [W * 0.66, 0.2 * H], [W, 0.2 * H]], { w: 9, seed: sd + 20, t }) + ' ' +
            inkPath([[0, 0.19 * H], [W * 0.6, 0.19 * H]], { w: 4, seed: sd + 21, t }));
          const px = 0.84 * W, py = 0.3 * H, pr = 72;
          port.setAttribute('d', inkCircle(px, py, pr, sd + 22, t, { fill: true }));
          let sd2 = '';
          for (let k = 0; k < 3; k++) { const yy = py + 8 + k * 20 + Math.sin(lt * 2 + k) * 4; sd2 += inkPath([[px - pr * 0.75, yy], [px + pr * 0.75, yy - 4]], { w: 5, seed: sd + 30 + k, t, amp: 1 }) + ' '; }
          sea.setAttribute('d', sd2);
          portR.setAttribute('d', inkCircle(px, py, pr, sd + 23, t, { w: 9 }) + ' ' + inkCircle(px, py, pr + 18, sd + 24, t, { w: 4 }));
          // console + scope
          const sx = SC.x * W, sy = SC.y * H, r = SC.r;
          const cons = [[sx - r - 70, sy - r - 60], [sx + r + 70, sy - r - 60], [sx + r + 80, fy0], [sx - r - 80, fy0]];
          consF.setAttribute('d', inkLoop(cons, { seed: sd + 40, t, smooth: false }));
          consR.setAttribute('d', inkPath(cons, { w: 7, seed: sd + 41, t, closed: true, smooth: false }));
          let kd = '';
          [-0.6, -0.2, 0.2, 0.6].forEach((u, k) => { const kx = sx + u * r * 1.2, ky = sy + r + 70; kd += inkCircle(kx, ky, 20, sd + 50 + k, t, { w: 5 }) + ' ' + inkPath([[kx, ky], [kx + Math.cos(lt * (k + 1) * 0.7) * 16, ky + Math.sin(lt * (k + 1) * 0.7) * 16]], { w: 4, seed: sd + 55 + k, t, amp: 0.6 }) + ' '; });
          knobs.setAttribute('d', kd);
          screen.setAttribute('d', inkCircle(sx, sy, r, sd + 60, t, { fill: true, amp: 0.8 }));
          bezel.setAttribute('d', inkCircle(sx, sy, r + 14, sd + 61, t, { w: 16, amp: 0.8 }));
          ringsE.setAttribute('d', [0.33, 0.66, 0.95].map((u, k) => inkCircle(sx, sy, r * u, sd + 62 + k, t, { w: 3, amp: 0.6 })).join(' ') + ' ' +
            inkPath([[sx - r * 0.95, sy], [sx + r * 0.95, sy]], { w: 2.6, seed: sd + 66, t, amp: 0.5 }) + ' ' + inkPath([[sx, sy - r * 0.95], [sx, sy + r * 0.95]], { w: 2.6, seed: sd + 67, t, amp: 0.5 }));
          const sa = lt * 2.4;
          const wedge = [[sx, sy]];
          for (let k = 0; k <= 5; k++) { const a = sa - k * 0.09; wedge.push([sx + Math.cos(a) * r * 0.93, sy + Math.sin(a) * r * 0.93]); }
          sweep.setAttribute('d', inkLoop(wedge, { seed: sd + 70, t, amp: 0.6, smooth: false }) + ' ' + inkPath([[sx, sy], [sx + Math.cos(sa) * r * 0.93, sy + Math.sin(sa) * r * 0.93]], { w: 7, seed: sd + 71, t, amp: 0.6 }));
          const B = P.blip || [0.5, -0.7], bxp = sx + Math.cos(B[1]) * B[0] * r, byp = sy + Math.sin(B[1]) * B[0] * r;
          const since = (((sa - B[1]) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2), glow = Math.exp(-since * 1.2) * (1 - nz);
          blipE.setAttribute('d', glow > 0.05 ? inkDot(bxp, byp, 10 + 12 * glow, 10 + 12 * glow, sd + 72, t) : '');
          // crackle specks after "noise"
          let s1 = '', s2 = '';
          if (nz > 0.01) {
            const rr = rng(inkHash(sd + 80, inkFrame(t))), n = Math.round(60 * nz);
            for (let k = 0; k < n; k++) {
              const a = rr() * Math.PI * 2, d = Math.sqrt(rr()) * r * 0.9, x = sx + Math.cos(a) * d, y = sy + Math.sin(a) * d, s = 3 + rr() * 6;
              if (k % 3) s1 += inkDot(x, y, s, s, sd + 90 + k, t) + ' '; else s2 += inkDot(x, y, s * 0.8, s * 0.8, sd + 90 + k, t) + ' ';
            }
          }
          specks.setAttribute('d', s1); specks2.setAttribute('d', s2);
          // operator with headphones
          let hp = '', zz = '';
          if (op) {
            const o = op.update(lt, t, cues, W, H), sc = op.K.scale ?? 0.75, hr = 72 * sc, [hx, hy] = o.head;
            const band = [];
            for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; band.push([hx + Math.cos(a) * hr * 1.12, hy + Math.sin(a) * hr * 1.12]); }
            hp = inkPath(band, { w: 9, seed: sd + 100, t, amp: 0.8 }) + ' ' + inkDot(hx - hr * 1.08, hy + hr * 0.05, hr * 0.26, hr * 0.36, sd + 101, t) + ' ' + inkDot(hx + hr * 1.08, hy + hr * 0.05, hr * 0.26, hr * 0.36, sd + 102, t);
            hp += ' ' + inkPath([[hx + o.face * hr * 1.08, hy + hr * 0.4], [hx + o.face * hr * 0.6, hy + hr * 2.2], [sx + r + 70, sy + r * 0.6]], { w: 4, seed: sd + 103, t, amp: 1 });
            if (nz > 0.01) for (const side of [-1, 1]) for (let k = 0; k < 2; k++) {
              const x0 = hx + side * hr * (1.5 + k * 0.5), y0 = hy - hr * 0.3 + k * 26, pts = [];
              for (let q = 0; q <= 4; q++) pts.push([x0 + side * q * 14, y0 + (q % 2 ? -14 : 14)]);
              zz += inkPath(pts, { w: 6 * nz, seed: sd + 110 + k + (side + 1) * 3, t, amp: 1.2, smooth: false }) + ' ';
            }
          }
          phones.setAttribute('d', hp); zig.setAttribute('d', zz);
          labels.forEach(l => l && l.update(lt, t, cues));
          if (kas) kas.update(lt, t, cues, W, H);
        },
      };
    },
  };
})();
