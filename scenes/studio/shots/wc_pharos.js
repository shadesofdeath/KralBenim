// wc_pharos — topic objects for "Lighthouse of Alexandria" (videos/2026-11-23/ag-04-pharos-of-alexandria.json).
// pharos_stump — the broken square base of the lighthouse after the earthquakes: a tapered stone block with a jagged,
//                broken top, a few dark window slots, cracks, and fallen blocks at its foot. sc 1 ≈ 320 px wide.
//                o: {h: height × (default 1 ≈ 300 px)}
'use strict';
(() => {
  const C = WC.C;
  WC.G.pharos_stump = (sc, o = {}) => {
    const S = [], w = 300 * sc, h = 300 * sc * (o.h ?? 1), tw = w * .86;
    // jagged broken top line from left to right
    const top = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, x = -tw / 2 + t * tw, dip = Math.sin(t * Math.PI * 1.6 + .8) * .16 + WC.rnd(-.07, .07);
      top.push([x, -h * (.78 + dip * (i % 3 === 0 ? 1.4 : 1))]);
    }
    const body = [[-w / 2, 0], ...top, [w / 2, 0]];
    const stone = WC.mixc(C.stone, C.paperLight, .2);
    S.push(WC.washShape(body, stone, .85, 3, 2 * sc));
    // shaded right face and the darker lower courses
    S.push(WC.washShape([[w * .18, 0], ...top.slice(7), [w / 2, 0]], WC.mixc(C.stoneDark, C.stone, .45), .45, 2, 1));
    for (let k = 1; k < 7; k++) {
      const y = -h * k * .11;
      S.push(WC.mk(WC.qcurve(-w / 2 + 6 * sc, y, w / 2 - 6 * sc, y + WC.rnd(-2, 2) * sc, 2, 10), 2.2 * sc, WC.mixc(C.stoneDark, C.stone, .3), { prof: 'even', nb: 3, a: .5 }));
    }
    // window slots (dark) and cracks
    for (const [x, y] of [[-.22, .3], [0, .3], [.22, .3], [-.11, .55], [.11, .55]]) {
      const cx = x * w, cy = -h * y;
      S.push(WC.washShape([[cx - 7 * sc, cy - 16 * sc], [cx + 7 * sc, cy - 16 * sc], [cx + 7 * sc, cy + 16 * sc], [cx - 7 * sc, cy + 16 * sc]], WC.mixc(C.ink, C.stoneDark, .4), .8, 2, .5));
    }
    for (let c = 0; c < 3; c++) {
      let x = WC.rnd(-.3, .3) * w, y = top[3 + c * 2][1] + 6 * sc; const pts = [[x, y]];
      for (let k = 0; k < 5; k++) { x += WC.rnd(-14, 14) * sc; y += WC.rnd(22, 40) * sc; pts.push([x, y]); }
      S.push(WC.mk(WC.along(pts, 12), 2 * sc, C.ink, { prof: 'tip', nb: 0, a: .7 }));
    }
    // ink edges: sides and the broken top
    S.push(...WC.inkLine([[-w / 2, 0], ...top, [w / 2, 0]], 2.6 * sc, C.ink, { step: 2, a: .85 }));
    // fallen blocks at the foot
    for (let b = 0; b < 6; b++) {
      const bx = WC.rnd(-.85, .85) * w, bw = WC.rnd(26, 46) * sc, bh = bw * WC.rnd(.5, .75), r = WC.rnd(-.3, .3);
      const q = [[-bw / 2, 0], [-bw / 2, -bh], [bw / 2, -bh], [bw / 2, 0]].map(([x, y]) => [bx + x * Math.cos(r) - y * Math.sin(r), WC.rnd(2, 10) * sc + x * Math.sin(r) + y * Math.cos(r)]);
      S.push(WC.washShape(q, WC.mixc(C.stone, C.stoneDark, WC.rnd(.1, .4)), .85, 2, 1));
      S.push(...WC.inkLine([...q, q[0]], 1.8 * sc, C.ink, { step: 2, a: .7 }));
    }
    return { S };
  };
})();
