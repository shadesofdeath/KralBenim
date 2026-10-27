// moon_lens: the view through a telescope eyepiece: a round, engraved window onto the lunar world (moon__lib.js), with
// a brass eyepiece ring, rotating scale ticks and crosshairs; the view settles into focus and drifts slowly.
// Use with "set": false (the ring is its own frame). Parchment ink style (BRAND.md §5), palette tokens only.
// P: {lens: {x: 0.5, y: 0.5, r: 0.45 (of H)}, vignette: true (dark surround fills the frame), crosshair: true, focus: 1.2 (s to settle), drift: 0.02 (of W),
//     ...every MOON.world() element (positions 0..1 of W/H, keep them inside the circle), labels (drawn outside the
//     clip, on top), kasif / cast (outside the clip, beside the ring)}
// cues: whatever the elements reference.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  SH.moon_lens = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, defs, seed } = ctx;
      const L = Object.assign({ x: 0.5, y: 0.5, r: 0.45 }, P.lens || {});
      const cx = L.x * W, cy = L.y * H, R = L.r * H;
      const id = 'moonlens' + seed + '_' + Math.floor(cx);
      const cp = el(defs || svg, 'clipPath', { id });
      el(cp, 'circle', { cx, cy, r: R });
      const root = el(svg, 'g');
      const dark = P.vignette === false ? null : inkEl(root, mix(INK.ink, INK.inkSoft, 0.35));
      const outer = inkEl(root, INK.paperDark), outerR = inkEl(root), ticks = inkEl(root, INK.inkSoft);
      const view = el(root, 'g', { 'clip-path': `url(#${id})` });
      const sky = inkEl(view, mix(INK.paperLight, INK.blue, 0.1)), skyH = inkEl(view, INK.inkSoft), mts = inkEl(view, mix(INK.paperDark, INK.blue, 0.25)), mtsR = inkEl(view, INK.inkSoft), land = inkEl(view, mix(INK.paperDark, INK.paperLight, 0.45));
      const inner = el(view, 'g');
      const WP = Object.assign({}, P, { labels: [], kasif: null, cast: [] });
      const w = MOON.world(inner, WP, W, H, seed * 7 + 5);
      const cross = inkEl(view, INK.inkSoft), ring = inkEl(root);
      const top = el(svg, 'g');
      const extra = MOON.world(top, { ground: false, labels: P.labels || [], kasif: P.kasif, cast: P.cast || [] }, W, H, seed * 7 + 9);
      const gy = (P.ground ?? 0.86) * H;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const fs = lerp(1.14, 1, progIO(lt, 0, P.focus ?? 1.2)), dx = Math.sin(lt * 0.35) * (P.drift ?? 0.02) * W;
          inner.setAttribute('transform', `translate(${f1(cx + dx)} ${f1(cy)}) scale(${fs.toFixed(4)}) translate(${f1(-cx)} ${f1(-cy)})`);
          sky.setAttribute('d', `M${cx - R} ${cy - R}h${2 * R}v${2 * R}h${-2 * R}Z`);
          // engraved sky: a few long soft strokes near the top, then distant lunar mountains on the horizon
          let h = ''; for (let i = 0; i < 4; i++) { const y = cy - R * 0.8 + i * 34; h += MOON.line([[cx - R * 0.7 + i * 40, y], [cx + R * 0.5 - i * 30, y + 3]], seed * 3 + i, t, 1.6, 1) + ' '; }
          skyH.setAttribute('d', h);
          const ridge = []; for (let i = 0; i <= 16; i++) { const x = cx - R - 20 + i * (2 * R + 40) / 16; ridge.push([x, gy - 70 - 60 * Math.abs(Math.sin(i * 1.3 + seed)) - (i % 3 === 1 ? 40 : 0)]); }
          mts.setAttribute('d', inkLoop(ridge.concat([[cx + R + 20, gy + 2], [cx - R - 20, gy + 2]]), { seed: seed * 3 + 30, t, amp: 1 }));
          mtsR.setAttribute('d', MOON.line(ridge, seed * 3 + 31, t, 3.5));
          land.setAttribute('d', `M${cx - R - 10} ${gy}h${2 * R + 20}V${cy + R + 10}h${-2 * R - 20}Z`);
          w.update(lt, t, cues);
          // eyepiece: thick brass ring with hatching, scale ticks that turn slowly
          if (dark) { dark.setAttribute('d', `M-20 -20H${W + 20}V${H + 20}H-20Z ` + inkCircle(cx, cy, R + 40, seed * 9 + 5, t, { fill: true })); dark.setAttribute('fill-rule', 'evenodd'); }
          outer.setAttribute('d', inkCircle(cx, cy, R + 44, seed * 9, t, { fill: true }) + ' ' + inkCircle(cx, cy, R, seed * 9 + 1, t, { fill: true }));
          outer.setAttribute('fill-rule', 'evenodd');
          outerR.setAttribute('d', inkCircle(cx, cy, R + 44, seed * 9 + 2, t, { w: 7 }) + ' ' + inkCircle(cx, cy, R + 70, seed * 9 + 3, t, { w: 3 }));
          ring.setAttribute('d', inkCircle(cx, cy, R, seed * 9 + 4, t, { w: 9 }));
          let tk = ''; const rot = lt * 0.12;
          for (let i = 0; i < 48; i++) {
            const a = rot + i / 48 * Math.PI * 2, r0 = R + 10, r1 = R + (i % 4 === 0 ? 36 : 22);
            tk += MOON.line([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], seed * 9 + 10 + i, t, i % 4 === 0 ? 4 : 2.5, 0.6) + ' ';
          }
          ticks.setAttribute('d', tk);
          cross.setAttribute('d', P.crosshair === false ? '' : MOON.line([[cx - R, cy], [cx - 40, cy]], seed * 9 + 70, t, 2.5) + ' ' + MOON.line([[cx + 40, cy], [cx + R, cy]], seed * 9 + 71, t, 2.5) + ' ' +
            MOON.line([[cx, cy - R], [cx, cy - 40]], seed * 9 + 72, t, 2.5) + ' ' + MOON.line([[cx, cy + 40], [cx, cy + R]], seed * 9 + 73, t, 2.5));
          extra.update(lt, t, cues);
        },
      };
    },
  };
})();
