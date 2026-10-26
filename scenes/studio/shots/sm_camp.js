// sm_camp: an Ottoman army camp on campaign, parchment ink style (brand/kit/BRAND.md §3, §5; boils at 8 Hz via _ink.js;
// pure function of (seed, lt), no Math.random). Written for 04-sehzade-mustafa (Kanuni and his sons, viziers coming and
// going), parametric: any scene that needs people in a 16th-century camp instead of a city skyline.
// Back: far hills, a row of small camp tents with waving pennants, an optional tuğ standard; ground line, grass ticks.
// Front: cast (KASIF rigs via sm__lib SMB.cast; sultan: true gives the sultan's tall kavuk with a plume), hand-written
// labels (MCB.labels) and simple signposts (SMB.signs). Slow camera push.
// P: {ground: 0.86 (0..1 H), tents: 6, tug: {x: 0.5} | false, sun: {x: 0.82, y: 0.2} | false,
//     cast: [...SMB cast], labels: [...MCB labels], signs: [{text, x, at, h, size}], cam: {zoom: 1.06, focus: [0.5, 0.55]}}
// cues: hit (punch), plus whatever names cast / labels / signs use. Needs mcB__lib.js (MCB) and sm__lib.js (SMB).
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.sm_camp = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const sd = seed * 1000 + 733;
      const root = el(svg, 'g'), cam = el(root, 'g');
      const gy = (P.ground ?? 0.86) * H, hz = gy - H * 0.3;
      const sunF = inkEl(cam, INK.paperLight), sunR = inkEl(cam, INK.gold);
      const hillF = inkEl(cam, INK.paperDark, { 'fill-opacity': 0.5 }), hillR = inkEl(cam, INK.inkSoft);
      const tentF = inkEl(cam, INK.paperLight), tentR = inkEl(cam, INK.inkSoft), flags = inkEl(cam, INK.red);
      const tugPole = inkEl(cam), tugStr = inkEl(cam), tugBallF = inkEl(cam, INK.gold), tugBall = inkEl(cam);
      const groundR = inkEl(cam), grass = inkEl(cam, INK.inkSoft);
      const signG = el(cam, 'g'), castG = el(cam, 'g'), labG = el(cam, 'g');
      const signs = SMB.signs(signG, (P.signs || []).map(s => Object.assign({ ground: P.ground ?? 0.86 }, s)), W, H, sd + 30);
      const cast = SMB.cast(castG, (P.cast || []).map(c => Object.assign({ y: P.ground ?? 0.86 }, c)), W, H, sd + 50);
      const labels = MCB.labels(labG, P.labels, W, H, sd + 70);
      const r = rng(sd + 3), nT = P.tents ?? 6;
      const tents = Array.from({ length: nT }, (_, k) => [(k + 0.5) / nT * W + (r() - 0.5) * 90, 60 + r() * 40]);
      const gr = Array.from({ length: 30 }, () => [r() * W, gy + 10 + r() * (H - gy) * 0.7, r()]);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const hit = punch(lt, MCB.atOr(cues, 'hit', null), 0.6);
          MCB.camPush(cam, lt, dur, W, H, Object.assign({ zoom: 1.06, focus: [0.5, 0.55] }, P.cam || {}), hit);
          if (P.sun !== false) {
            const s = Object.assign({ x: 0.82, y: 0.2 }, P.sun || {});
            sunF.setAttribute('d', inkCircle(s.x * W, s.y * H, 56, sd + 1, t, { fill: true }));
            sunR.setAttribute('d', inkCircle(s.x * W, s.y * H, 56, sd + 2, t, { w: 5 }));
          }
          const hp = []; for (let k = 0; k <= 24; k++) { const u = k / 24; hp.push([u * W * 1.1 - W * 0.05, hz - 20 - Math.sin(u * 6.3 + 2) * 30 - Math.sin(u * 2.1) * 36]); }
          hillF.setAttribute('d', inkLoop(hp.concat([[W * 1.05, hz + 40], [-W * 0.05, hz + 40]]), { seed: sd + 4, t, amp: 1 }));
          hillR.setAttribute('d', inkPath(hp, { w: 4, seed: sd + 5, t }));
          let tf = '', tr = '', fl = '';
          tents.forEach(([x, h], k) => {
            const b = hz + 30, tri = [[x - h, b], [x - h * 0.15, b - h], [x + h * 0.15, b - h], [x + h, b]];
            tf += inkLoop(tri, { seed: sd + 100 + k, t, amp: 0.8, smooth: false }) + ' ';
            tr += inkPath(tri, { w: 4, seed: sd + 120 + k, t, closed: true, smooth: false }) + ' ' + inkPath([[x, b - h], [x, b - h - 30]], { w: 3, seed: sd + 140 + k, t }) + ' ' +
              inkPath([[x - h * 0.2, b], [x, b - h * 0.55], [x + h * 0.2, b]], { w: 3, seed: sd + 160 + k, t }) + ' ';
            const wv = Math.sin(t * 3 + k) * 6;
            fl += inkLoop([[x, b - h - 30], [x + 30, b - h - 23 + wv], [x, b - h - 16]], { seed: sd + 180 + k, t, amp: 0.6, smooth: false }) + ' ';
          });
          tentF.setAttribute('d', tf); tentR.setAttribute('d', tr); flags.setAttribute('d', fl);
          if (P.tug !== false) {
            const px = (P.tug && P.tug.x != null ? P.tug.x : 0.5) * W, h = H * 0.42, sway = Math.sin(t * 1.3) * 0.03;
            const top = [px + Math.sin(sway) * h, gy - h];
            tugPole.setAttribute('d', inkPath([[px, gy], [px + Math.sin(sway) * h * 0.5, gy - h * 0.5], top], { w: 8, seed: sd + 6, t }));
            tugBallF.setAttribute('d', inkCircle(top[0], top[1] - 16, 16, sd + 7, t, { fill: true }));
            tugBall.setAttribute('d', inkCircle(top[0], top[1] - 16, 16, sd + 8, t, { w: 4 }));
            let sdd = '';
            for (let s = 0; s < 6; s++) {
              const r0 = [top[0] - 30 + s * 12, top[1] + 30], len = 100 + (s % 3) * 18, sw = Math.sin(t * 2.2 + s) * 0.08, pts = [];
              for (let k = 0; k <= 4; k++) { const u = k / 4; pts.push([r0[0] + Math.sin(sw * u * 3) * len * u * 0.5, r0[1] + len * u]); }
              sdd += inkPath(pts, { w: 5, seed: sd + 200 + s, t, taper: 0.7 }) + ' ';
            }
            tugStr.setAttribute('d', sdd);
          }
          groundR.setAttribute('d', inkPath([[-40, gy + 4], [W * 0.5, gy - 3], [W + 40, gy + 4]], { w: 5, seed: sd + 9, t }));
          let gd = '';
          gr.forEach(([x, y, q], k) => { const lean = Math.sin(t * 1.6 + k) * 5; gd += inkPath([[x, y], [x + lean + 4, y - 16 - q * 12]], { w: 3, seed: sd + 300 + k, t }) + ' '; });
          grass.setAttribute('d', gd);
          signs.update(lt, t, cues);
          cast.update(lt, t, cues);
          labels.update(lt, t, cues);
        },
      };
    },
  };
})();
