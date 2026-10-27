// moon_vista: a "lunar engraving" vista, the world the 1835 Moon Hoax described (Stickstory ag-14). The set ("hills",
// "night", "coast") paints sky and far land; this shot draws the creatures and things on the ground line in front of it.
// Parchment ink style (brand/kit/BRAND.md §5), palette tokens only, pure function of (seed, lt).
// P: everything MOON.world() takes (moon__lib.js): {ground: 0.86, orb, rocket, trees, lake, beach, pyramids, bison,
//    goats, beavers, huts, manbats, temple, city, labels, cast, kasif}; positions 0..1 of W/H, "at" = cue | seconds.
// cues: whatever the elements reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  SH.moon_vista = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const w = MOON.world(el(svg, 'g'), P, W, H, seed * 7 + 3);
      return {
        update(lt, dur, cues, env = {}) { w.update(lt, env.t ?? lt, cues); },
      };
    },
  };
})();
