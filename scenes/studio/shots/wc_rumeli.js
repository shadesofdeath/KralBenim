// wc_rumeli — topic objects for "Rumeli Hisarı" (videos/2026-11-23/02-rumeli-hisari.json).
// stake — a single sharpened wooden stake driven into the ground, leaning slightly (a warning on the shore).
//         o: {h: height × (sc 1 ≈ 300 px), lean: radians (default .06)}
'use strict';
(() => {
  const C = WC.C;
  WC.G.stake = (sc, o = {}) => {
    const S = [], h = 300 * sc * (o.h ?? 1), lean = o.lean ?? .06;
    const top = [Math.sin(lean) * h, -h];
    // shadow on the ground, then the pole (wash body, a darker side, the ink edge), then the cut point and bark marks
    S.push(WC.mk(WC.qcurve(-4 * sc, 2 * sc, 70 * sc, 8 * sc, 2, 8), 16 * sc, WC.mixc(C.ground, C.ink, .35), { prof: 'leaf', nb: 0, a: .35 }));
    const pole = WC.mk(WC.qcurve(0, 0, top[0], top[1] + 34 * sc, WC.rnd(-6, 6) * sc, 14), 15 * sc, WC.mixc(C.wood, C.paperLight, .15), { prof: 'even', nb: 4, a: .95, rib: .95 });
    S.push(pole, WC.edgeOf(pole, 1, 3.2 * sc, C.ink, .85), WC.edgeOf(pole, -1, 1.6 * sc, WC.mixc(C.wood, C.ink, .4), .6));
    const bx = top[0], by = top[1] + 34 * sc;
    S.push(WC.washShape([[bx - 7.5 * sc, by], [bx + 7.5 * sc, by], [top[0] + 1.5 * sc, top[1]]], WC.mixc(C.wood, C.paperLight, .45), .9, 2, 1));
    S.push(...WC.inkLine([[bx + 7.5 * sc, by], [top[0] + 1.5 * sc, top[1]], [bx - 7.5 * sc, by]], 2.2 * sc, C.ink, { step: 1, a: .8 }));
    for (let i = 0; i < 7; i++) {
      const t = WC.rnd(.12, .85), x = Math.sin(lean) * h * t, y = -h * t;
      S.push(WC.mk(WC.qcurve(x - 6 * sc, y, x + 5 * sc, y + WC.rnd(-3, 3) * sc, 2, 4), 2 * sc, WC.mixc(C.wood, C.ink, .45), { prof: 'tip', nb: 0, a: .6 }));
    }
    return { S, top };
  };
})();
