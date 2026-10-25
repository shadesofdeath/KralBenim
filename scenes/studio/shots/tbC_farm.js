// tbC_farm: 1816, the year without a summer, on the ground (Tambora long video, chapter 4). Parchment ink (BRAND §5).
//   tbC_field — a summer cornfield in the cold: two rows of corn stalks, a farmhouse behind, pale sun, falling snow;
//               calendar pages flip on cues (JUNE / JULY / AUGUST), frost crystals creep over the field, the stalks droop
//   tbC_road  — leaving home: farmhouse (a red "SOLD" stamp via labels), far village, dirt road, signpost, a handcart
//               pulled by a walking figure, grey clouds, light snow or rain
//   tbC_riot  — a European town in the rain: gabled houses, a bakery with a price board whose red line shoots up, rotting
//               wheat sheaves, tally marks for the weeks of rain, an angry hungry crowd that marches in with raised fists
// Common P: cast: [...] (TBC.cast entries, see tbC__lib.js), labels: [...] (MCB labels: {text, x, y, at, stamp, color,
//   size, arrow, strike}), cam: {zoom: 1.05, focus: [0.5, 0.55], push: cue (small punch)}, ground: 0.84 (0..1 H),
//   snow: {n: 30, at, size, speed} | false, rain: {n: 60, at} | false, clouds: {n: 5, y: 0.12, dark} | false, shake: cue
// tbC_field P: + rows: [{y: 0.84, n: 8, x0: 0.04, x1: 0.6, h: 300}], frost: {at, dur: 2.5}, droop: {at, dur: 2},
//   house: {x: 0.86, y: 0.62, w: 240, h: 160} | false, sun: {x: 0.6, y: 0.2} | false, calendar: {x: 0.84, y: 0.3, w: 260,
//   pages: [{word: "JULY", at}]}, blanket: {at, dur: 3} (snow blanket on the ground)
// tbC_road P: + house: {x: 0.16, w: 300, h: 210, snow} | false, village: {x0: 0.02, x1: 0.3, y: 0.62} | false,
//   sign: {x: 0.86, text: "WEST", at, dir: 1}, cart: {who: 1 (cast index of the puller), at} (handcart behind him),
//   exodus: {path: [[x, y] 0..1 ...], town: {x, y}, walkers: 10} (winding road to a far town, a line of tiny walkers),
//   granary: {x: 0.15, at (doors swing open on an empty barn)}
// tbC_riot P: + houses: {n: 4} , bakery: {x: 0.74, w: 520}, price: {at (line shoots up), x: 0.74, y: 0.36},
//   tally: {at, n: 9, dur: 2.5, x: 0.43, y: 0.42}, sheaves: {x: 0.08, at (they rot and slump)},
//   crowd: {at (arrive), n: 6, x0: 0.14, x1: 0.56, scale: 0.5, sign: "BREAD!", pump: cue (fists pump from here)}
// cues: whatever the params name (frost.at, pages[].at, cart.at, price.at, crowd.at, ...)
(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const T = () => window.TBC;

  function common(ctx) {
    const { P, W, H, svg, seed } = ctx;
    const camG = el(svg, 'g');
    const bg = T().ink(el(camG, 'g'), seed * 3 + 1);
    const back = T().ink(el(camG, 'g'), seed * 3 + 2);
    const castG = el(camG, 'g');
    const front = T().ink(el(camG, 'g'), seed * 3 + 3);
    const fx = T().ink(el(camG, 'g'), seed * 3 + 4);
    const labG = el(camG, 'g');
    return { P, W, H, seed, camG, bg, back, castG, front, fx, labG };
  }
  function weather(c, lt, cues) {
    const { P, W, H, fx } = c;
    if (P.rain) { const a = T().atOr(cues, P.rain.at, 0); if (lt >= a) T().rain(fx, W, H, P.rain.n ?? 60, lt - a + 3, { y1: H * (P.ground ?? 0.84), seed: c.seed * 7 + 1 }); }
    if (P.snow) { const a = T().atOr(cues, P.snow.at, 0); if (lt >= a) T().snow(fx, W, H, P.snow.n ?? 30, lt - a + 4, { size: P.snow.size, speed: P.snow.speed, y1: H * (P.ground ?? 0.84) + 40, seed: c.seed * 7 + 2 }); }
  }
  function sky(c, lt) {
    const { P, W, H, bg } = c;
    if (P.clouds !== false && P.clouds) T().clouds(bg, W, H * (P.clouds.y ?? 0.12), P.clouds.n ?? 5, lt, { dark: P.clouds.dark, w: P.clouds.w ?? 380, seed: c.seed + 5, x0: W * (P.clouds.x0 ?? 0.36), drift: 6 });
  }
  function ground(c, R, y, sd) {
    const { W } = c;
    R.line([[-60, y], [W * 0.3, y + 4], [W * 0.62, y - 3], [W + 60, y + 2]], { w: 6 });
    for (let i = 0; i < 12; i++) { const x = (i + 0.4) / 12 * W; R.line([[x, y + 22 + (i % 3) * 14], [x + 46, y + 20 + (i % 3) * 14]], { w: 3, c: 'soft', op: 0.8 }); }
  }

  // ------------------------------------------------------------------ tbC_field
  SH.tbC_field = {
    kind: '2d',
    build(ctx) {
      const c = common(ctx), { P, W, H } = c;
      const gy = H * (P.ground ?? 0.84);
      const rows = P.rows || [{ y: 0.74, n: 9, x0: 0.03, x1: 0.62, h: 250 }, { y: 0.86, n: 8, x0: 0.0, x1: 0.6, h: 320 }];
      const cast = T().cast(c.castG, P.cast, W, H, c.seed * 11);
      const labs = T().labels(c.labG, P.labels, W, H, c.seed * 5);
      const hills = T().hillPts(W, H * 0.6, 50, c.seed + 3);
      const crystals = [];
      { const r = rng(c.seed * 13 + 5); for (let i = 0; i < 46; i++) crystals.push([r() * W * 0.7, H * 0.52 + r() * (gy - H * 0.5), 8 + r() * 10, r()]); }
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb);
          const frostAt = P.frost ? A(P.frost.at, dur * 0.3) : null, droopAt = P.droop ? A(P.droop.at, dur * 0.6) : null;
          const fr = frostAt != null ? prog(lt, frostAt, P.frost.dur ?? 2.5) : 0;
          const dr = droopAt != null ? progIO(lt, droopAt, P.droop.dur ?? 2) : 0;
          T().cam(c.camG, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.4, 0.6] }, punch(lt, A(P.cam && P.cam.push, null)), P.shake ? punch(lt, A(P.shake, null), 0.5) : 0);
          const { bg, back, front, fx } = c;
          bg.begin(t); back.begin(t); front.begin(t); fx.begin(t);
          if (P.sun !== false) { const s = P.sun || {}; bg.circle(W * (s.x ?? 0.62), H * (s.y ?? 0.2), 62, { f: INK.paperLight, w: 4, c: 'soft' }); }
          sky(c, lt);
          bg.shape(hills.concat([[W + 60, gy], [-60, gy]]), { f: INK.paperDark, w: 5 });
          if (P.house !== false) { const h = P.house || {}; T().house(bg, W * (h.x ?? 0.86), H * (h.y ?? 0.62), h.w ?? 240, h.h ?? 160, { snow: fr > 0.3 || h.snow, roof: 'red' }); }
          // snow blanket on the ground
          const bl = P.blanket ? prog(lt, A(P.blanket.at, 0), P.blanket.dur ?? 3) : 0;
          ground(c, bg, gy, 1);
          if (bl > 0.01) bg.shape([[-60, gy + 6], [W * 0.25, gy - 16 * bl], [W * 0.55, gy - 8 * bl], [W + 60, gy - 18 * bl], [W + 60, gy + 30], [-60, gy + 30]], { f: INK.paperLight, w: 4 });
          rows.forEach((rw, ri) => {
            const R = ri === 0 ? back : front, n = rw.n ?? 8;
            for (let i = 0; i < n; i++) {
              const x = W * lerp(rw.x0 ?? 0.03, rw.x1 ?? 0.6, n > 1 ? i / (n - 1) : 0.5), y = H * rw.y;
              const d = clamp01(dr * 1.4 - (i / n) * 0.4);
              T().stalk(R, x, y, (rw.h ?? 280) * (0.9 + 0.12 * Math.sin(i * 2.1 + ri)), t, d * 0.8, ri * 31 + i, { dir: 1 });
            }
          });
          // frost crystals: six-armed stars creeping in from the left
          crystals.forEach(([x, y, s, ph], i) => {
            const on = clamp01(fr * 1.5 - x / (W * 0.7));
            if (on <= 0.01) { fx.line(null); fx.line(null); fx.line(null); return; }
            const ss = s * on;
            for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI + ph; fx.line([[x - Math.cos(a) * ss, y - Math.sin(a) * ss], [x + Math.cos(a) * ss, y + Math.sin(a) * ss]], { w: 3.5, c: INK.paperLight, amp: 0.5 }); }
          });
          weather(c, lt, cues);
          if (P.calendar) {
            const C2 = P.calendar, pages = C2.pages || [];
            let cur = null, flip = 1;
            pages.forEach(pg => { const a = A(pg.at, 0); if (lt >= a) { cur = pg; flip = spring(lt, a, 0.5); } });
            if (cur) T().calendar(fx, W * (C2.x ?? 0.84), H * (C2.y ?? 0.3), C2.w ?? 260, cur.word, flip, { size: C2.size });
            else fx.push(''), fx.pop();
          }
          bg.end(); back.end(); front.end(); fx.end();
          cast.update(lt, t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ tbC_road
  SH.tbC_road = {
    kind: '2d',
    build(ctx) {
      const c = common(ctx), { P, W, H } = c;
      const gy = H * (P.ground ?? 0.84);
      const cast = T().cast(c.castG, P.cast, W, H, c.seed * 11);
      const labs = T().labels(c.labG, P.labels, W, H, c.seed * 5);
      const hills = T().hillPts(W, H * 0.58, 70, c.seed + 9);
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb);
          T().cam(c.camG, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.55, 0.6] }, punch(lt, A(P.cam && P.cam.push, null)));
          const { bg, back, front, fx } = c;
          bg.begin(t); back.begin(t); front.begin(t); fx.begin(t);
          sky(c, lt);
          bg.shape(hills.concat([[W + 60, gy], [-60, gy]]), { f: INK.paperDark, w: 5 });
          if (P.village) {
            const V = P.village, n = V.n ?? 4;
            for (let i = 0; i < n; i++) T().house(bg, W * lerp(V.x0 ?? 0.02, V.x1 ?? 0.3, i / Math.max(1, n - 1)), H * (V.y ?? 0.64) + (i % 2) * 14, 120 + (i % 3) * 20, 80 + (i % 2) * 20, { roof: i % 2 ? 'soft' : 'red', windows: 1, chimney: i % 2 === 0, snow: V.snow });
          }
          if (P.exodus) {
            // a winding road that climbs away to a far hill town; a long line of tiny walkers moves along it
            const E = P.exodus, path = (E.path || [[0.4, 0.98], [0.52, 0.8], [0.44, 0.68], [0.56, 0.6], [0.7, 0.53]]).map(q => [q[0] * W, q[1] * H]);
            const at = u => { const f = clamp01(u) * (path.length - 1), i = Math.min(path.length - 2, Math.floor(f)), k = f - i;
              const a = path[Math.max(0, i - 1)], b = path[i], c2 = path[i + 1], d = path[Math.min(path.length - 1, i + 2)];
              const cr = (p0, p1, p2, p3) => 0.5 * (2 * p1 + (-p0 + p2) * k + (2 * p0 - 5 * p1 + 4 * p2 - p3) * k * k + (-p0 + 3 * p1 - 3 * p2 + p3) * k * k * k);
              return [cr(a[0], b[0], c2[0], d[0]), cr(a[1], b[1], c2[1], d[1])]; };
            const L = [], Rr = [];
            for (let i = 0; i <= 24; i++) { const u = i / 24, p = at(u), w = lerp(170, 12, u); L.push([p[0] - w, p[1]]); Rr.push([p[0] + w, p[1]]); }
            bg.shape(L.concat(Rr.reverse()), { f: INK.paper, w: 4 });
            const tx = W * ((E.town && E.town.x) ?? 0.7), ty = H * ((E.town && E.town.y) ?? 0.53);
            for (let k = 0; k < 4; k++) T().house(bg, tx - 60 + k * 50, ty - 4 + (k % 2) * 6, 44, 32, { windows: 0, door: false, chimney: false, roof: k % 2 ? 'soft' : 'red' });
            bg.line([[tx + 40, ty - 30], [tx + 40, ty - 110]], { w: 5 }); bg.shape([[tx + 26, ty - 100], [tx + 40, ty - 150], [tx + 54, ty - 100]], { f: INK.inkSoft, w: 4, smooth: false });
            const n = E.walkers ?? 10;
            for (let i = 0; i < n; i++) {
              const u = ((i / n) * 0.9 + 0.05 + lt * 0.012) % 0.95, p = at(u), sz = lerp(80, 14, u), ph = lt * 3 + i;
              const hy = p[1] - sz, sw = Math.sin(ph) * sz * 0.18;
              bg.circle(p[0], hy - sz * 0.16, Math.max(2, sz * 0.14), { f: INK.paperLight, w: Math.max(2, sz * 0.05) });
              bg.line([[p[0], hy], [p[0], p[1] - sz * 0.45]], { w: Math.max(2, sz * 0.07) });
              bg.line([[p[0] - sw, p[1]], [p[0], p[1] - sz * 0.45], [p[0] + sw, p[1]]], { w: Math.max(2, sz * 0.07), smooth: false });
              bg.dot(p[0] - sz * 0.14, hy + sz * 0.12, Math.max(2, sz * 0.13), { c: INK.paperDark });
            }
          } else {
            // road: a dirt band toward the right
            bg.shape([[-60, gy - 30], [W + 60, gy - 60], [W + 60, gy + 40], [-60, gy + 40]], { f: INK.paper, w: 4 });
            for (let i = 0; i < 10; i++) { const x = (i + 0.5) / 10 * W; bg.line([[x, gy - 10 - i * 2], [x + 60, gy - 12 - i * 2]], { w: 3, c: 'soft', op: 0.7 }); }
          }
          if (P.granary) {
            // empty granary: big open doors, dark empty inside, a few loose straws
            const G = P.granary, gx = W * (G.x ?? 0.15), gw = 380, gh = 260;
            bg.shape([[gx - gw / 2, gy], [gx - gw / 2, gy - gh], [gx, gy - gh - 150], [gx + gw / 2, gy - gh], [gx + gw / 2, gy]], { f: INK.stain, w: 6, smooth: false });
            bg.shape([[gx - 90, gy], [gx - 90, gy - 200], [gx + 90, gy - 200], [gx + 90, gy]], { f: INK.inkSoft, w: 5, smooth: false, fop: 0.9 });
            const op = progIO(lt, T().atOr(cues, G.at, 0.3), 1.2);
            bg.shape([[gx - 90, gy], [gx - 90, gy - 200], [gx - 90 - 80 * op, gy - 186], [gx - 90 - 80 * op, gy + 6]], { f: INK.paperDark, w: 5, smooth: false });
            bg.shape([[gx + 90, gy], [gx + 90, gy - 200], [gx + 90 + 80 * op, gy - 186], [gx + 90 + 80 * op, gy + 6]], { f: INK.paperDark, w: 5, smooth: false });
            for (let k = 0; k < 5; k++) bg.line([[gx - 60 + k * 26, gy - 8], [gx - 44 + k * 26, gy - 18 - (k % 2) * 6]], { w: 3, c: 'gold' });
            bg.line([[gx - 40, gy - gh - 60], [gx + 40, gy - gh - 60]], { w: 5 });
          }
          if (P.house !== false && P.house) { const h = P.house; T().house(bg, W * (h.x ?? 0.16), gy - 30, h.w ?? 300, h.h ?? 210, { snow: h.snow, roof: 'red' }); }
          if (P.sign) {
            const S = P.sign, sx = W * (S.x ?? 0.86), p = spring(lt, A(S.at, 0.2), 0.6), d = S.dir ?? 1;
            bg.line([[sx, gy - 40], [sx, gy - 300]], { w: 9 });
            bg.push(`translate(${T().f1(sx)} ${T().f1(gy - 250)}) scale(${Math.max(0.01, p).toFixed(3)})`);
            bg.shape([[-110 * d, -50], [110 * d, -50], [160 * d, 0], [110 * d, 50], [-110 * d, 50]], { f: INK.paperLight, w: 6, smooth: false });
            bg.text(S.text || 'WEST', 14 * d, 2, { font: 'serif', size: S.size ?? 64 });
            bg.pop();
          }
          weather(c, lt, cues);
          bg.end(); back.end(); fx.end();
          cast.update(lt, t, cues);
          // handcart behind the puller
          front.begin(t);
          if (P.cart && cast.state[P.cart.who ?? 1]) {
            const st = cast.state[P.cart.who ?? 1], f = st.face, s = st.s / 0.6;
            const cx = st.x - f * 230 * s, cy = st.y, wr = 56 * s, rot = st.x / wr;
            front.shape([[cx - 120 * s, cy - 150 * s], [cx + 110 * s, cy - 150 * s], [cx + 96 * s, cy - 70 * s], [cx - 106 * s, cy - 70 * s]], { f: INK.paperDark, w: 5, smooth: false });
            front.circle(cx - 50 * s, cy - 186 * s, 44 * s, { f: INK.paperLight, w: 4 });
            front.circle(cx + 30 * s, cy - 180 * s, 38 * s, { f: INK.stain, w: 4 });
            front.line([[cx + f * 100 * s, cy - 120 * s], st.hands[1]], { w: 6 });
            T().wheel(front, cx, cy - wr, wr, rot * f, { f: INK.paperLight, spokes: 6 });
          }
          front.end();
          labs.update(lt, t, cues);
        },
      };
    },
  };

  // ------------------------------------------------------------------ tbC_riot
  SH.tbC_riot = {
    kind: '2d',
    build(ctx) {
      const c = common(ctx), { P, W, H } = c;
      const gy = H * (P.ground ?? 0.84);
      const CR = P.crowd || null, list = (P.cast || []).slice();
      if (CR) {
        const n = CR.n ?? 6, x0 = CR.x0 ?? 0.14, x1 = CR.x1 ?? 0.56;
        for (let i = 0; i < n; i++) {
          const x = lerp(x0, x1, n > 1 ? i / (n - 1) : 0.5), fem = i % 3 === 1, sign = CR.sign && i === Math.floor(n / 2);
          list.push({ who: 'c' + i, x: x - 0.42, to: x, at: CR.at, walk_dur: 1.8 + (i % 3) * 0.25, pose: 'walk', face: 'right',
            then: sign ? 'hold' : 'point', dir: sign ? null : 'up', text: sign ? CR.sign : null, emotion: 'angry', scale: (CR.scale ?? 0.5) * (i % 2 ? 0.94 : 1),
            y: (P.ground ?? 0.84) + (i % 2 ? -0.02 : 0.01), look: fem ? { hair: 'bun', skirt: ['red', 'green', 'blue'][i % 3], hc: 'soft' } : { hair: i % 2 ? 'short' : 'sideburns', coat: ['soft', 'blue', 'green'][i % 3] } });
        }
      }
      const cast = T().cast(c.castG, list, W, H, c.seed * 11);
      const labs = T().labels(c.labG, P.labels, W, H, c.seed * 5);
      const nh = (P.houses && P.houses.n) ?? 4;
      return {
        update(lt, dur, cues, env) {
          const t = env.t ?? lt, A = (n, fb) => T().atOr(cues, n, fb);
          const priceAt = P.price ? A(P.price.at, dur * 0.4) : null, pk = punch(lt, priceAt);
          T().cam(c.camG, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.5, 0.55] }, pk, P.shake ? punch(lt, A(P.shake, null), 0.6) : 0);
          const { bg, back, front, fx } = c;
          bg.begin(t); back.begin(t); front.begin(t); fx.begin(t);
          sky(c, lt);
          // row of tall gabled town houses
          for (let i = 0; i < nh; i++) {
            const x = W * (0.06 + i * 0.16), w = 230 + (i % 2) * 30, h = 330 + (i % 3) * 50;
            bg.shape([[x - w / 2, gy - 20], [x - w / 2, gy - h], [x, gy - h - 120], [x + w / 2, gy - h], [x + w / 2, gy - 20]], { f: i % 2 ? INK.paperLight : INK.paper, w: 5, smooth: false });
            for (let r = 0; r < 2; r++) for (let k = 0; k < 2; k++) {
              const wx = x + (k ? 1 : -1) * w * 0.22, wy = gy - h * (0.45 + r * 0.34), s = 26;
              bg.shape([[wx - s, wy - s * 1.3], [wx + s, wy - s * 1.3], [wx + s, wy + s * 1.3], [wx - s, wy + s * 1.3]], { f: INK.paperDark, w: 4, smooth: false });
            }
          }
          // tally marks for the weeks of rain on the wall
          if (P.tally) {
            const Tl = P.tally, a = A(Tl.at, 0.2), n = Tl.n ?? 9, d = Tl.dur ?? 2.5, tx = W * (Tl.x ?? 0.43), ty = H * (Tl.y ?? 0.42);
            for (let i = 0; i < n; i++) {
              const on = lt >= a + i * d / n, g5 = Math.floor(i / 5), j = i % 5, bx = tx + g5 * 130;
              if (j < 4) bg.line(on ? [[bx + j * 22, ty - 40], [bx + j * 22 + 4, ty + 40]] : null, { w: 6, c: 'light' });
              else bg.line(on ? [[bx - 14, ty + 26], [bx + 84, ty - 26]] : null, { w: 6, c: 'light' });
            }
          }
          // bakery
          const B = P.bakery || {}, bx = W * (B.x ?? 0.76), bw = B.w ?? 560, bh = 430;
          bg.shape([[bx - bw / 2, gy - 20], [bx - bw / 2, gy - bh], [bx + bw / 2, gy - bh], [bx + bw / 2, gy - 20]], { f: INK.paperLight, w: 6, smooth: false });
          bg.shape([[bx - bw / 2 - 30, gy - bh], [bx + bw / 2 + 30, gy - bh], [bx + bw / 2 + 10, gy - bh - 60], [bx - bw / 2 - 10, gy - bh - 60]], { f: INK.red, w: 5, smooth: false });
          for (let k = 0; k < 6; k++) bg.shape([[bx - bw / 2 - 20 + k * (bw + 40) / 6, gy - bh + 70], [bx - bw / 2 - 20 + (k + 0.5) * (bw + 40) / 6, gy - bh + 100], [bx - bw / 2 - 20 + (k + 1) * (bw + 40) / 6, gy - bh + 70]], { f: k % 2 ? INK.paperLight : INK.red, w: 4, smooth: false });
          // shop window with two loaves + door
          const wx0 = bx - bw * 0.42, wy0 = gy - 260;
          bg.shape([[wx0, wy0], [wx0 + bw * 0.5, wy0], [wx0 + bw * 0.5, gy - 60], [wx0, gy - 60]], { f: INK.paperDark, w: 5, smooth: false });
          for (let k = 0; k < 2; k++) bg.shape(inkEllipsePts(wx0 + 70 + k * 120, gy - 100, 52, 26, 11 + k, 12), { f: INK.gold, w: 4 });
          bg.shape([[bx + bw * 0.16, gy - 20], [bx + bw * 0.16, gy - 250], [bx + bw * 0.38, gy - 250], [bx + bw * 0.38, gy - 20]], { f: INK.stain, w: 5, smooth: false });
          // price board: loaf + line graph that shoots up
          if (P.price) {
            const px = W * (P.price.x ?? 0.76), py = H * (P.price.y ?? 0.3), ww = 300, hh = 190, s = 1 + 0.08 * pk;
            fx.push(`translate(${T().f1(px)} ${T().f1(py)}) scale(${s.toFixed(3)}) rotate(${(2 + Math.sin(lt * 9) * 2 * pk).toFixed(2)})`);
            fx.shape([[-ww / 2, -hh / 2], [ww / 2, -hh / 2], [ww / 2, hh / 2], [-ww / 2, hh / 2]], { f: INK.inkSoft, w: 6, smooth: false });
            fx.shape(inkEllipsePts(-90, 40, 44, 22, 5, 12), { f: INK.gold, w: 4 });
            for (let k = 0; k < 3; k++) fx.line([[-112 + k * 22, 30], [-102 + k * 22, 50]], { w: 3 });
            const up = prog(lt, priceAt, 0.9), pts = [[-30, 50], [20, 46], [60, 40]];
            pts.push([lerp(60, 92, up), lerp(40, -10, up)], [lerp(60, 128, up), lerp(40, -150, up)]);
            fx.line(pts, { w: 9, c: 'red' });
            if (up > 0.6) fx.line([[108, -126], [128, -152], [148, -120]], { w: 8, c: 'red', smooth: false });
            fx.text('PRICE', 30, -60, { size: 48, c: 'light' });
            fx.pop();
          }
          // rotting wheat sheaves (foreground left)
          if (P.sheaves) {
            const S = P.sheaves, rt = prog(lt, A(S.at, 0.5), 1.6);
            for (let k = 0; k < 2; k++) {
              const sx = W * (S.x ?? 0.06) + k * 130, sy = gy + 30, sl = rt * (k ? -14 : 12);
              for (let j = -4; j <= 4; j++) {
                const top = [sx + j * 14 + sl * 3, sy - 230 + Math.abs(j) * 10 + rt * 50];
                front.line([[sx + j * 4, sy], [sx + j * 2, sy - 110], top], { w: 5, c: rt > 0.5 ? INK.inkSoft : INK.gold });
                front.shape(inkEllipsePts(top[0], top[1] - 18, 9, 24, 40 + j + k * 9, 8, 0.2 * j), { f: rt > 0.5 ? INK.paperDark : INK.gold, w: 3 });
              }
              front.line([[sx - 30, sy - 100], [sx + 30, sy - 104]], { w: 7, c: 'soft' });
              for (let d = 0; d < 6; d++) front.dot(sx - 40 + d * 16, sy - 160 - (d % 3) * 26, 7 * rt + 0.01, { c: 'soft' });
            }
          }
          weather(c, lt, cues);
          bg.end(); back.end(); fx.end(); front.end();
          // fists pump once the crowd has arrived
          cast.update(lt + (CR && CR.pump ? 0 : 0), t, cues);
          labs.update(lt, t, cues);
        },
      };
    },
  };
})();
