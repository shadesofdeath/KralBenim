// bb_pier: an empty river before the bridge exists: far city shore, gulls, and a wooden pier on posts the cast stands on
// (the bb_bridge drawing with no towers, cables or deck; theme "parchment", BRAND.md §3, §5).
// P: same as bb_bridge (cast, labels, cam, water, ghost...), defaults: towers false, cables false, deck false,
//   pier {from: 0, to: 0.7}. cues: labels, cast, hit.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.bb_pier = {
    kind: '2d',
    build(ctx) {
      const P = Object.assign({ towers: false, cables: false, deck: false, pier: { from: 0, to: 0.7 } }, ctx.P || {});
      return SH.bb_bridge.build(Object.assign({}, ctx, { P }));
    },
  };
})();
