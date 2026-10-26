// cas_village: an Edo-period Japanese fishing village on the shore, a towering woodblock-style tsunami wave rearing
// over it from the sea side (left), villagers running away, optional burning houses (brand/kit/BRAND.md §3, §5).
// The sky/sea come from the scene's "set" (coast / night); the ground line is P.floor.
// Uses cas__lib.js (CAS) + td__lib.js (TD: figure, label).
// P: {floor: 0.6, houses: [{x: 0.55, s: 0.9, fire: cue|sec|false, wash: cue|sec|false}], pines: [{x, s, face}],
//     wave: {x0: 0.05 (crest x at lt 0, 0..1 W), x1: 0.3 (crest x at the end), h: 760, back: 1100, curl0: 0.4,
//     curl1: 1, at: 0 (start of the advance), dur: 3} | false,
//     flood: {at: cue|sec, dur: 1.6, depth: 90} | false (a water sheet runs over the ground, houses lift + tilt),
//     people: [{x, scale, pose: "run", face: "right", accessory, seq}] (period villagers, no hat),
//     kasif: K | false, labels: [TD.label specs]}
// cues: hit (punch + wave lurch), plus any names used above
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});

  SH.cas_village = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const CAS = window.CAS, TD = window.TD, atOr = CAS.atOr, sd = seed * 1000 + 311;
      const FL = (P.floor ?? 0.6) * H;
      const root = el(svg, 'g');
      const ground = inkEl(root), stones = inkEl(root, INK.inkSoft);
      const pines = (P.pines || [{ x: 0.9, s: 0.9, face: -1 }]).map((p, i) => ({ p, d: CAS.pine(el(root, 'g'), sd + 10 + i) }));
      const houses = (P.houses || [{ x: 0.5 }, { x: 0.8, s: 0.8 }]).map((p, i) => ({ p, d: CAS.house(el(root, 'g'), sd + 20 + i) }));
      const people = (P.people || []).map((K, i) => TD.figure(el(root, 'g'), Object.assign({ y: P.floor ?? 0.6, scale: 0.55, pose: 'run', face: 'right', hat: false }, K), sd + 40 + i));
      const kas = P.kasif ? TD.figure(el(root, 'g'), Object.assign({ x: 0.82, y: P.floor ?? 0.6, scale: 0.8, pose: 'shock', face: 'left' }, P.kasif), sd + 60) : null;
      const flood = CAS.water(el(root, 'g'), sd + 70);
      const wv = P.wave === false ? null : CAS.wave(el(root, 'g'), sd + 80);
      const labels = (P.labels || []).map((L, i) => TD.label(root, L, W, H, sd + 90 + i));
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt, hit = punch(lt, atOr(cues, 'hit', null), 0.6);
          ground.setAttribute('d', inkPath([[-20, FL], [W * 0.5, FL + 4], [W + 20, FL - 2]], { w: 7, seed: sd + 1, t }));
          let st = '';
          for (let k = 0; k < 9; k++) { const x = ((k * 0.137 + 0.05) % 1) * W, y = FL + 30 + (k % 3) * 34; st += inkPath([[x, y], [x + 50 + (k % 4) * 12, y - 2]], { w: 3, seed: sd + 2 + k, t, amp: 1 }) + ' '; }
          stones.setAttribute('d', st);
          const F = P.flood ? P.flood : null, fa = F ? atOr(cues, F.at, null) : null, fp = fa == null ? 0 : prog(lt, fa, F.dur ?? 1.6);
          pines.forEach(({ p, d }) => d.update(t, { x: p.x * W, y: FL, s: p.s ?? 0.9, face: p.face ?? 1, sway: 1 + 2 * fp }));
          houses.forEach(({ p, d }, i) => {
            const fA = p.fire == null || p.fire === false ? null : atOr(cues, p.fire, null), fire = fA == null ? 0 : prog(lt, fA, 0.6);
            const wA = p.wash == null || p.wash === false ? null : atOr(cues, p.wash, null), wp = wA == null ? 0 : progIO(lt, wA, 1.6);
            const xs = p.x * W + wp * W * 0.18 + Math.sin(lt * 3 + i) * 6 * wp, ys = FL - wp * 70 + Math.sin(lt * 2.4 + i) * 8 * wp;
            d.update(t, { x: xs, y: ys, s: p.s ?? 0.9, rot: wp * (i % 2 ? -14 : 11) + Math.sin(lt * 2 + i) * 3 * wp, fire, wet: Math.max(fp, wp) });
          });
          people.forEach(f => f && f.update(lt, t, cues, W, H));
          if (kas) kas.update(lt, t, cues, W, H);
          flood.update(t, -40, W + 40, FL + 30, F ? (F.depth ?? 90) : 0, fp);
          if (wv) {
            const V = P.wave || {}, a = atOr(cues, V.at, 0), p = progIO(lt, a, V.dur ?? Math.max(1, dur - a));
            const x = lerp(V.x0 ?? 0.05, V.x1 ?? 0.3, p) * W + hit * 30;
            wv.update(t, { x, y: FL + 40, h: (V.h ?? 760) * (1 + 0.04 * hit), back: V.back ?? 1100, curl: lerp(V.curl0 ?? 0.4, V.curl1 ?? 1, p) });
          }
          labels.forEach(l => l && l.update(lt, t, cues));
        },
      };
    },
  };
})();
