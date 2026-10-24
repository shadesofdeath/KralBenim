// pgb_street: a small 19th-century New England village street in parchment ink (BRAND.md §3, §5; boils at 8 Hz via
// _ink.js; pure function of (seed, lt)). Written for Phineas Gage (Cavendish, Vermont, 1848-49), parametric:
// far hills, a row of clapboard houses / a white church with a steeple / a railroad depot with a door that opens,
// an optional railroad track in front, autumn leaves drifting down, hand-written labels and stamps (window.MCB),
// and the cast (pgb__lib cast: Gage with bandage and eye patch, walking figures).
//   P: {ground: 0.8 (0..1 H), hills: true, leaves: {n: 14, at: 0} | false, rails: {y: 0.9} | false,
//       buildings: [{type: "house"|"church"|"depot"|"store", x: 0.5 (centre, 0..1 W), scale: 1, at (pops in),
//                    text (depot / store board), door: cue (depot door swings open)}],
//       cast: [pgb__lib cast entries], labels: [window.MCB labels], cam: {zoom, focus}, shake: cue}
//   cues: hit (punch), building "at"/"door", cast/label "at" names, shake
// Needs pgb__lib.js (window.PGB) and mcB__lib.js (window.MCB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const FR = 'Fraunces, Georgia, serif';

  // building outlines in px relative to the ground centre (x right, y up negative), scale applied later
  function shape(type) {
    if (type === 'church') return {
      body: [[-120, 0], [-120, -230], [0, -330], [120, -230], [120, 0]],
      tower: [[-46, -250], [-46, -420], [0, -560], [46, -420], [46, -250]],
      fill: INK.paperLight, door: [[-30, 0], [-30, -90], [30, -90], [30, 0]], win: [[-80, -170], [80, -170]],
    };
    if (type === 'depot') return {
      body: [[-200, 0], [-200, -200], [-240, -200], [-170, -290], [170, -290], [240, -200], [200, -200], [200, 0]],
      fill: INK.paperDark, door: [[-44, 0], [-44, -140], [44, -140], [44, 0]], win: [[-140, -120], [140, -120]], board: [-130, -246, 260, 54],
    };
    if (type === 'store') return {
      body: [[-130, 0], [-130, -260], [130, -260], [130, 0]], fill: INK.paperDark,
      door: [[-30, 0], [-30, -110], [30, -110], [30, 0]], win: [[-90, -150], [90, -150]], board: [-110, -236, 220, 50],
    };
    return {   // clapboard house with a gable roof and a chimney
      body: [[-110, 0], [-110, -170], [-130, -170], [0, -290], [130, -170], [110, -170], [110, 0]],
      chim: [[54, -230], [54, -290], [84, -290], [84, -204]], fill: INK.paperLight,
      door: [[-24, 0], [-24, -90], [24, -90], [24, 0]], win: [[-70, -120], [70, -120]],
    };
  }

  SH.pgb_street = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, f1 } = window.PGB, MCB = window.MCB;
      const sd = seed * 1000 + 523;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const GY = (P.ground ?? 0.8) * H;
      const hills = P.hills === false ? null : { f: inkEl(cam, INK.paperDark, { 'fill-opacity': 0.55 }), r: inkEl(cam, INK.inkSoft), t: inkEl(cam, INK.inkSoft) };
      const B = (P.buildings || []).map((b, i) => {
        const g = el(cam, 'g'), S = shape(b.type);
        const o = { b, S, g, f: inkEl(g, S.fill), r: inkEl(g), tw: S.tower ? { f: inkEl(g, INK.paperLight), r: inkEl(g) } : null,
          ch: S.chim ? { f: inkEl(g, INK.hat), r: inkEl(g) } : null, clap: inkEl(g, INK.inkSoft), door: inkEl(g, INK.hatBand), doorR: inkEl(g),
          win: inkEl(g, INK.paperLight), winR: inkEl(g), smoke: S.chim ? inkEl(g, INK.inkSoft) : null };
        if (S.board) {
          o.board = { f: inkEl(g, INK.paperLight), r: inkEl(g) };
          o.btx = el(g, 'text', { x: S.board[0] + S.board[2] / 2, y: S.board[1] + S.board[3] * 0.78, 'font-family': FR, 'font-weight': 900, 'font-size': 44, 'text-anchor': 'middle', fill: INK.ink });
          o.btx.textContent = String(b.text || (b.type === 'depot' ? 'RAILROAD' : 'STORE')).toLocaleUpperCase(LOCALE);
        }
        return o;
      });
      const ground = inkEl(cam), grass = inkEl(cam, INK.inkSoft);
      const RAIL = P.rails ? Object.assign({ y: 0.9 }, P.rails) : null;
      const rails = RAIL ? { ties: inkEl(cam, INK.hat), l: inkEl(cam) } : null;
      const cs = window.PGB.cast(el(cam, 'g'), P.cast, W, H, sd + 200);
      const LV = P.leaves ? Object.assign({ n: 14, at: 0 }, P.leaves) : null;
      const leaves = LV ? Array.from({ length: LV.n }, (_, i) => inkEl(cam, [INK.red, INK.gold, INK.hat][i % 3])) : null;
      const LR = rng(sd + 77), LP = LV ? leaves.map(() => [LR(), LR(), LR(), LR()]) : null;
      const lb = MCB.labels(el(root, 'g'), P.labels, W, H, sd + 400);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          if (hills) {
            const hp = []; for (let x = -60; x <= W + 60; x += 60) hp.push([x, GY - 250 - Math.sin(x * 0.004 + 1) * 70 - Math.sin(x * 0.011) * 26]);
            hills.f.setAttribute('d', inkLoop(hp.concat([[W + 60, GY], [-60, GY]]), { seed: sd + 1, t, amp: 1, smooth: false }));
            hills.r.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 2, t, amp: 1.2 }));
            let td = '';
            for (let k = 0; k < 9; k++) { const x = (k + 0.4) * W / 9, y = GY - 230 - Math.sin(x * 0.004 + 1) * 70 - Math.sin(x * 0.011) * 26 + 30;
              td += inkLoop([[x, y - 60], [x + 22, y], [x - 22, y]], { seed: sd + 3 + k, t, amp: 0.8 }) + ' '; }
            hills.t.setAttribute('d', td);
          }
          B.forEach((o, i) => {
            const b = o.b, s = b.scale || 1, x = b.x * W, a = atOr(cues, b.at, 0), p = spring(lt, a, 0.6);
            o.g.style.display = lt < a ? 'none' : '';
            o.g.setAttribute('transform', `translate(${f1(x)} ${f1(GY)}) scale(${f1(s * 1000) / 1000} ${f1(s * p * 1000) / 1000})`);
            const k = sd + 10 + i * 20, S = o.S;
            o.f.setAttribute('d', inkLoop(S.body, { seed: k, t, amp: 1, smooth: false }));
            o.r.setAttribute('d', inkPath(S.body, { w: 5.5 / s, seed: k + 1, t, amp: 1.2, closed: true, smooth: false }));
            if (o.tw) { o.tw.f.setAttribute('d', inkLoop(S.tower, { seed: k + 2, t, amp: 1, smooth: false })); o.tw.r.setAttribute('d', inkPath(S.tower, { w: 5.5, seed: k + 3, t, amp: 1.2, closed: true, smooth: false })); }
            if (o.ch) {
              o.ch.f.setAttribute('d', inkLoop(S.chim, { seed: k + 4, t, amp: 0.8, smooth: false })); o.ch.r.setAttribute('d', inkPath(S.chim, { w: 4.5, seed: k + 5, t, amp: 1, closed: true, smooth: false }));
              let sm = ''; for (let j = 0; j < 3; j++) { const ph = (lt * 0.35 + j / 3) % 1, yy = -300 - ph * 160, xx = 70 + Math.sin(ph * 6 + j) * 18 + ph * 40;
                sm += inkPath([[xx - 18, yy], [xx, yy - 12], [xx + 18, yy]], { w: 4 * (1 - ph) + 1, seed: k + 6 + j, t, amp: 1 }) + ' '; }
              o.smoke.setAttribute('d', sm);
            }
            // clapboards
            const top = Math.min(...S.body.map(q => q[1])), xs = S.body.map(q => q[0]), xl = Math.min(...xs) + 6, xr = Math.max(...xs) - 6;
            let cd = ''; for (let yy = -24; yy > (b.type === 'church' ? -220 : b.type === 'house' ? -160 : -190); yy -= 34) cd += inkPath([[xl, yy], [xr, yy - 2]], { w: 2, seed: k + 9 + yy, t, amp: 0.8 }) + ' ';
            o.clap.setAttribute('d', cd);
            // door (depot door can swing open: it narrows to a sliver)
            const da = atOr(cues, b.door, null), dp = da != null ? progIO(lt, da, 0.5) : 0;
            const D = S.door.map((q, j) => j === 2 || j === 3 ? [lerp(q[0], S.door[0][0] + 10, dp), q[1]] : q);
            o.door.setAttribute('d', inkLoop(D, { seed: k + 7, t, amp: 0.8, smooth: false }));
            o.doorR.setAttribute('d', inkPath(D, { w: 4, seed: k + 8, t, amp: 1, closed: true, smooth: false }));
            const [w0, w1] = S.win; let wd = '', wr = '';
            for (const wx of [w0[0], w1[0]]) { const wp = [[wx - 26, w0[1] - 30], [wx + 26, w0[1] - 30], [wx + 26, w0[1] + 34], [wx - 26, w0[1] + 34]];
              wd += inkLoop(wp, { seed: k + 12 + wx, t, amp: 0.6, smooth: false }) + ' ';
              wr += inkPath(wp, { w: 4, seed: k + 13 + wx, t, amp: 0.8, closed: true, smooth: false }) + ' ' + inkPath([[wx, w0[1] - 30], [wx, w0[1] + 34]], { w: 3, seed: k + 14 + wx, t, amp: 0.6 }) + ' '; }
            o.win.setAttribute('d', wd); o.winR.setAttribute('d', wr);
            if (o.board) { const [bx, by, bw, bh] = S.board, bp = [[bx, by], [bx + bw, by], [bx + bw, by + bh], [bx, by + bh]];
              o.board.f.setAttribute('d', inkLoop(bp, { seed: k + 16, t, amp: 0.6, smooth: false })); o.board.r.setAttribute('d', inkPath(bp, { w: 4, seed: k + 17, t, amp: 0.8, closed: true, smooth: false })); }
            void top;
          });
          ground.setAttribute('d', inkPath([[-40, GY], [W / 2, GY + 4], [W + 40, GY - 2]], { w: 6, seed: sd + 90, t, amp: 1.4 }));
          let gd = ''; for (let k = 0; k < 22; k++) { const x = (k + 0.5) * W / 22 + Math.sin(k * 3.1) * 20, sw = Math.sin(t * 2 + k) * 4;
            gd += inkPath([[x, GY + 30 + (k % 3) * 22], [x + 6 + sw, GY + 6 + (k % 3) * 22]], { w: 3, seed: sd + 100 + k, t, amp: 0.8 }) + ' '; }
          grass.setAttribute('d', gd);
          if (rails) {
            const y = RAIL.y * H; let td = '';
            for (let k = -1; k < 26; k++) { const x = k * W / 24; td += inkLoop([[x - 10, y - 28], [x + 14, y - 28], [x + 4, y + 30], [x - 22, y + 30]], { seed: sd + 130 + k, t, amp: 0.6, smooth: false }) + ' '; }
            rails.ties.setAttribute('d', td);
            rails.l.setAttribute('d', inkPath([[-40, y - 16], [W + 40, y - 18]], { w: 7, seed: sd + 160, t, amp: 1 }) + ' ' + inkPath([[-40, y + 14], [W + 40, y + 12]], { w: 7, seed: sd + 161, t, amp: 1 }));
          }
          cs.update(lt, t, cues);
          if (leaves) {
            const a = atOr(cues, LV.at, 0);
            leaves.forEach((lf, i) => {
              const [r0, r1, r2, r3] = LP[i], tt = lt - a;
              if (tt < 0) { lf.setAttribute('d', ''); return; }
              const ph = (r0 + tt * (0.12 + r1 * 0.08)) % 1, x = r2 * W + Math.sin(tt * (1.2 + r3) + i) * 60 + ph * 120, y = -40 + ph * (GY + 60);
              const ang = Math.sin(tt * 3 + i) * 1.2;
              lf.setAttribute('d', inkLoop(inkEllipsePts(x, y, 15, 7, sd + 170 + i, 8, ang), { seed: sd + 170 + i, t, amp: 0.6 }));
            });
          }
          const sh = atOr(cues, P.shake, null);
          MCB.camPush(cam, lt, dur, W, H, P.cam, hit, sh != null ? Math.max(0, 1 - (lt - sh) * 3) * (lt >= sh ? 1 : 0) : 0);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
