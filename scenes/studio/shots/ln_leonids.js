// ln_leonids: the great Leonid meteor storm of 12-13 November 1833 over America ("the night the stars fell"),
// Denison Olmsted's reports and the radiant in Leo, comet dust. Written for the Stickstory Short
// ag-02-night-the-stars-fell (2026-11-13); parametric enough for any meteor-storm / radiant / comet-dust story.
// Parchment ink style (brand/kit/BRAND.md §3, §5): palette tokens only (INK.*), every line boils at 8 Hz via _ink.js,
// everything is a pure function of (seed, lt); no Math.random. Uses mcB__lib.js (window.MCB: cast, labels).
// The sky itself comes from the set ("night", "hills"); ln_chart / ln_space / ln_comet are full-frame (no set).
//
// Common P: radiant: [x, y] (0..1; all streaks fly away from this point), rate: 0.9 (share of meteor slots alive),
//   meteors: 46 (slots), ramp: cue (rate climbs from 0.25 to `rate` there), kasif: MCB cast entry (who "kasif"),
//   cast: [MCB cast entries: period figures], labels: [MCB label entries {text, x, y, at, size, color, stamp, font}]
//   cues: hit (punch) + the names referenced below.
//
// SHOTS.ln_sky    — outdoors under the storm. P: {mode: "farm"|"town"|"dawn", gy: 0.6 (ground line 0..1 H),
//   house: {x: 0.76, s: 1} | false (wooden farmhouse, lit window), front: "fence"|"boardwalk" (foreground layer down to
//   the frame bottom), town: {n: 7} (row of wooden houses + a church steeple on the horizon, town mode)}
//   dawn: no meteors (or a last few), a low sun is left to the "hills" set, grass + fence foreground.
// SHOTS.ln_pray   — a family kneels in the grass by their farmhouse, hands folded, a lantern glowing between them, the
//   sky full of streaks. P: {figs: [{x, s, face}], at: cue (heads bow), house, lantern: [x, y]}
// SHOTS.ln_desk   — a candle-lit 1833 college study: a big sash window full of falling streaks, a desk with papers,
//   inkwell and quill; the professor (bare head, behind the desk) looks out. P: {mode: "ask"|"letters",
//   look: cue (turns to the window), ask: cue (a big red "?" pops), win: [x0, y0, x1, y1] (0..1)}
//   letters: envelopes fly in through the window and pile up on the desk from cue `pour`.
// SHOTS.ln_chart  — a full-frame hand-drawn star chart (no set): Leo (sickle + triangle) among faint stars, meteor
//   streaks drawn as ink arrows all over the sheet; at `back` red dashed lines run back from each streak and meet in
//   one spot, at `leo` a red ring pulses on that spot. Kaşif can stand in front (P.kasif). P: {rad: [0.46, 0.3]}
// SHOTS.ln_space  — full frame: dark space above the curved Earth and its thin atmosphere; dust grains fly in, all
//   parallel, and flash into streaks when they hit the air. P: {at: cue (rate rises)}
// SHOTS.ln_comet  — full frame: a comet (nucleus, coma, tail) up right leaves a river of dust across the sky; the Earth
//   runs along its dashed orbit into the river at cue `cross` and sparks fly. P: {cross: cue}
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const atOr = (cues, name, fb) => typeof name === 'number' ? name : (name != null && cues && cues[name] != null) ? cues[name] : fb;
  const hn = (a, b = 0) => { const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return v - Math.floor(v); };
  const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const set = (e, d) => e.setAttribute('d', d || '');
  const NIGHT = () => mix(INK.ink, INK.blue, 0.3);
  const NIGHT2 = () => mix(INK.ink, INK.blue, 0.5);
  const WOOD = () => mix(INK.stain, INK.paperDark, 0.25);
  const WOOD_D = () => mix(INK.stain, INK.ink, 0.35);
  const D2R = Math.PI / 180;

  function extras(root, P, W, H, sd) {
    const M = window.MCB;
    const list = (P.kasif ? [Object.assign({ who: 'kasif' }, P.kasif)] : []).concat(P.cast || []);
    const k = list.length && M ? M.cast(el(root, 'g'), list, W, H, sd + 501) : null;
    const lb = M ? M.labels(el(root, 'g'), P.labels || [], W, H, sd + 601) : null;
    return { update(lt, t, cues) { if (k) k.update(lt, t, cues); if (lb) lb.update(lt, t, cues); } };
  }

  // ------------------------------------------------------------ meteor storm: thin fast streaks from one radiant
  // o: {R: [x, y] px, rate 0..1, box: [x0, y0, x1, y1] (heads stay inside), d0: [min, max] start distance from R,
  //     len: [min, max], arc: [deg0, deg1] (directions, 90 = straight down), dur: 0.55, w: 1 (width scale)}
  function storm(parent, sd, n) {
    const glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.6 });
    const tails = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.95 });
    const heads = inkEl(parent, INK.paperLight);
    return {
      update(lt, t, o) {
        const G = [], T = [], Hd = [], R = o.R, box = o.box, arc = o.arc || [0, 360], d0 = o.d0 || [60, 900], len = o.len || [140, 380];
        const dur = o.dur ?? 0.55, ws = o.w ?? 1, gk = o.glow ?? 1;
        for (let i = 0; i < n; i++) {
          const per = 0.9 + hn(sd, i) * 1.3, ph = hn(sd + 1, i) * per, k = Math.floor((lt + ph) / per);
          const u = ((lt + ph) - k * per) / dur;
          if (u > 1 || u < 0) continue;
          if (hn(sd + k * 7.31, i + 3) > o.rate) continue;
          const a = lerp(arc[0], arc[1], hn(sd + k * 3.7, i + 11)) * D2R, dx = Math.cos(a), dy = Math.sin(a);
          const dist = lerp(d0[0], d0[1], Math.pow(hn(sd + k * 1.9, i + 17), 0.8)), L = lerp(len[0], len[1], hn(sd + k * 5.3, i + 23)) * (0.5 + dist / (d0[1] || 900) * 0.6);
          const hd = dist + L * u, tl = L * Math.min(1, u * 2.2) * (u > 0.75 ? 1 - (u - 0.75) / 0.25 * 0.6 : 1);
          const hx = R[0] + dx * hd, hy = R[1] + dy * hd;
          if (box && (hx < box[0] || hx > box[2] || hy < box[1] || hy > box[3])) continue;
          const tx = hx - dx * tl, ty = hy - dy * tl;
          const fade = u > 0.8 ? 1 - (u - 0.8) / 0.2 : 1, w = (3.5 + hn(sd + k, i + 31) * 5) * ws * fade;
          const nx = -dy, ny = dx;
          T.push(inkLoop([[tx, ty], [hx + nx * w, hy + ny * w], [hx + dx * w * 0.8, hy + dy * w * 0.8], [hx - nx * w, hy - ny * w]], { seed: sd + i, t, amp: 0.3, smooth: false }));
          const gx = hx - dx * tl * 0.45, gy = hy - dy * tl * 0.45;
          if (gk > 0) G.push(inkLoop([[gx, gy], [hx + nx * w * 2.6 * gk, hy + ny * w * 2.6 * gk], [hx + dx * w * 2 * gk, hy + dy * w * 2 * gk], [hx - nx * w * 2.6 * gk, hy - ny * w * 2.6 * gk]], { seed: sd + i + 400, t, amp: 0.3, smooth: false }));
          Hd.push(inkDot(hx, hy, w * 1.3 + 1, w * 1.3 + 1, sd + i + 800, t, 0.2));
        }
        set(glow, G.join(' ')); set(tails, T.join(' ')); set(heads, Hd.join(' '));
      },
    };
  }
  const stormRate = (P, lt, cues) => {
    const r = P.rate ?? 0.9, ra = atOr(cues, P.ramp, null);
    return ra == null ? r : lerp(0.25, r, progIO(lt, ra - 0.2, 0.8));
  };

  // ------------------------------------------------------------ deep night sky over the set (opaque) + dark hill line
  function darkSky(sky, hill, hillR, t, sd, W, gy) {
    const hy = gy - 150;
    const pts = []; for (let x = -40; x <= W + 40; x += 40) pts.push([x, hy - 40 - 50 * (0.5 + 0.5 * Math.sin(x * 0.006 + sd)) - 20 * Math.sin(x * 0.019 + sd * 2)]);
    set(sky, inkLoop([[-40, -40], [W + 40, -40]].concat(pts.slice().reverse().map(p => [p[0], p[1] + 30])).reverse(), { seed: sd + 901, t, amp: 0.4, smooth: false }));
    set(hill, inkLoop(pts.concat([[W + 40, gy + 30], [-40, gy + 30]]), { seed: sd + 902, t, amp: 0.6, smooth: false }));
    set(hillR, inkPath(pts, { w: 4, seed: sd + 903, t, amp: 0.8 }));
  }

  // ------------------------------------------------------------ twinkling stars (dots)
  function stars(parent, sd, n, x0, y0, x1, y1, col) {
    const e = inkEl(parent, col || INK.paperLight), r = rng(sd), S = [];
    for (let i = 0; i < n; i++) S.push([lerp(x0, x1, r()), lerp(y0, y1, r()), 2 + r() * 3.5, r() * 6.28, 1.2 + r() * 2.4]);
    return { update(t) { set(e, S.map(([x, y, s, ph, sp], i) => { const q = s * (0.6 + 0.4 * Math.sin(t * sp + ph)); return inkDot(x, y, q, q, sd + i, t, 0.3); }).join(' ')); } };
  }

  // ------------------------------------------------------------ wooden farmhouse (gable, planks, lit window, chimney)
  function house(parent, sd) {
    const wall = inkEl(parent, WOOD()), roof = inkEl(parent, INK.inkSoft), glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.3 });
    const win = inkEl(parent, INK.gold), door = inkEl(parent, WOOD_D()), lines = inkEl(parent), thin = inkEl(parent, INK.ink);
    const smoke = inkEl(parent, INK.paperLight, { 'fill-opacity': 0.5 });
    return {
      update(t, lt, x, gy, s, o = {}) {
        const w = 230 * s, h = 250 * s, rh = 170 * s, f = o.flip ? -1 : 1;
        const wl = rect(x - w, gy - h, x + w, gy);
        set(wall, inkLoop(wl, { seed: sd + 1, t, amp: 0.8, smooth: false }));
        const rf = [[x - w - 34 * s, gy - h + 6 * s], [x, gy - h - rh], [x + w + 34 * s, gy - h + 6 * s]];
        set(roof, inkLoop(rf, { seed: sd + 2, t, amp: 0.8, smooth: false }) + ' ' + inkLoop(rect(x + f * 110 * s, gy - h - rh * 0.9, x + f * 160 * s, gy - h - rh * 0.35), { seed: sd + 3, t, amp: 0.6, smooth: false }));
        const wx = x - f * 110 * s, wy = gy - h * 0.62, ww = 52 * s, wh = 62 * s, fl = 0.85 + 0.15 * Math.sin(lt * 9 + sd) * Math.sin(lt * 3.3);
        set(glow, inkCircle(wx, wy, 120 * s * fl, sd + 4, t, { fill: true }));
        set(win, inkLoop(rect(wx - ww, wy - wh, wx + ww, wy + wh), { seed: sd + 5, t, amp: 0.5, smooth: false }));
        const dx = x + f * 70 * s;
        set(door, inkLoop(rect(dx - 46 * s, gy - 170 * s, dx + 46 * s, gy), { seed: sd + 6, t, amp: 0.5, smooth: false }));
        let L = inkPath(wl, { w: 6, seed: sd + 7, t, closed: true, smooth: false }) + ' ' + inkPath(rf, { w: 7, seed: sd + 8, t, smooth: false }) + ' ' +
          inkPath(rect(wx - ww, wy - wh, wx + ww, wy + wh), { w: 5, seed: sd + 9, t, closed: true, smooth: false }) + ' ' +
          inkPath(rect(dx - 46 * s, gy - 170 * s, dx + 46 * s, gy), { w: 5, seed: sd + 10, t, closed: true, smooth: false });
        let th = inkPath([[wx, wy - wh], [wx, wy + wh]], { w: 4, seed: sd + 11, t }) + ' ' + inkPath([[wx - ww, wy], [wx + ww, wy]], { w: 4, seed: sd + 12, t });
        for (let k = 1; k < 7; k++) { const yy = gy - h + k * h / 7; th += ' ' + inkPath([[x - w + 6, yy], [x + w - 6, yy + 2]], { w: 2.4, seed: sd + 20 + k, t, amp: 1 }); }
        th += ' ' + inkDot(dx + f * 28 * s, gy - 86 * s, 6 * s, 6 * s, sd + 30, t);
        set(lines, L); set(thin, th);
        // chimney smoke puffs drifting up
        const S = [];
        for (let i = 0; i < 4; i++) { const u = ((lt * 0.35 + i / 4) % 1); const cx = x + f * 135 * s + u * 60 * s, cy = gy - h - rh * 0.95 - u * 220 * s, r = (16 + u * 34) * s; if (u < 0.95) S.push(inkCircle(cx, cy, r, sd + 40 + i, t, { fill: true })); }
        set(smoke, o.smoke === false ? '' : S.join(' '));
      },
    };
  }

  // ------------------------------------------------------------ town row on the horizon: wooden houses + church
  function town(parent, sd, n) {
    const fill = inkEl(parent, NIGHT2()), wins = inkEl(parent, INK.gold), line = inkEl(parent, INK.ink);
    const r = rng(sd + 3), B = [];
    let x = -40;
    for (let i = 0; i < n; i++) { const w = 120 + r() * 70, h = 150 + r() * 110; B.push({ x, w, h, church: i === Math.floor(n / 2) }); x += w + 10 + r() * 20; }
    const sc = 1120 / x;
    return {
      update(t, lt, gy) {
        const F = [], Wn = [], L = [];
        B.forEach((b, i) => {
          const x0 = b.x * sc, w = b.w * sc, h = b.church ? b.h * 1.25 : b.h, top = gy - h;
          const pts = b.church ? [[x0, gy], [x0, top], [x0 + w * 0.5, top - 70], [x0 + w, top], [x0 + w, gy]] : [[x0, gy], [x0, top], [x0 + w * 0.5, top - 60], [x0 + w, top], [x0 + w, gy]];
          F.push(inkLoop(pts, { seed: sd + i, t, amp: 0.7, smooth: false }));
          L.push(inkPath(pts, { w: 5, seed: sd + 40 + i, t, smooth: false }));
          if (b.church) {   // steeple with a cross
            const sx = x0 + w * 0.5, st = [[sx - 30, top - 50], [sx - 30, top - 200], [sx, top - 330], [sx + 30, top - 200], [sx + 30, top - 50]];
            F.push(inkLoop(st, { seed: sd + 90, t, amp: 0.6, smooth: false }));
            L.push(inkPath(st, { w: 5, seed: sd + 91, t, smooth: false }), inkPath([[sx, top - 330], [sx, top - 390]], { w: 5, seed: sd + 92, t }), inkPath([[sx - 20, top - 370], [sx + 20, top - 370]], { w: 5, seed: sd + 93, t }));
          }
          const nw = b.church ? 1 : 2;
          for (let k = 0; k < nw; k++) {
            const wx = x0 + w * (nw === 1 ? 0.5 : 0.3 + k * 0.4), wy = top + h * 0.45, on = hn(sd + i, k) > 0.25 ? 1 : 0;
            if (on) Wn.push(inkLoop(rect(wx - 16, wy - 22, wx + 16, wy + 22), { seed: sd + 60 + i * 3 + k, t, amp: 0.4, smooth: false }));
          }
        });
        set(fill, F.join(' ')); set(wins, Wn.join(' ')); set(line, L.join(' '));
      },
    };
  }

  // ------------------------------------------------------------ foreground layer down to the frame bottom
  function front(parent, sd, kind, W, H) {
    const dark = kind === 'grass-day' ? mix(INK.green, INK.ink, 0.35) : NIGHT();
    const ground = inkEl(parent, dark), posts = inkEl(parent, kind === 'boardwalk' ? WOOD_D() : WOOD()), line = inkEl(parent), blades = inkEl(parent, kind === 'grass-day' ? mix(INK.green, INK.ink, 0.15) : mix(INK.ink, INK.green, 0.25));
    const extra = inkEl(parent, WOOD());
    return {
      update(t, top) {
        const g = []; for (let x = -40; x <= W + 40; x += 60) g.push([x, top + Math.sin(x * 0.011 + sd) * 14]);
        set(ground, inkLoop(g.concat([[W + 40, H + 40], [-40, H + 40]]), { seed: sd + 1, t, amp: 1, smooth: false }));
        let L = inkPath(g, { w: 5, seed: sd + 2, t, amp: 1.2 }), Pd = '', Ex = '';
        if (kind === 'fence' || kind === 'grass-day') {
          const fy = top + 60;
          for (let i = 0; i < 6; i++) { const x = 40 + i * 200 + (i % 2) * 14; const q = rect(x - 16, fy - 230, x + 16, fy + 120); Pd += inkLoop(q, { seed: sd + 10 + i, t, amp: 0.6, smooth: false }) + ' '; L += ' ' + inkPath(q, { w: 4.5, seed: sd + 20 + i, t, closed: true, smooth: false }); }
          for (const ry of [fy - 190, fy - 90]) { const q = [[-20, ry], [W + 20, ry + 12], [W + 20, ry + 34], [-20, ry + 22]]; Pd += inkLoop(q, { seed: sd + 30 + ry, t, amp: 0.8, smooth: false }) + ' '; L += ' ' + inkPath(q, { w: 4, seed: sd + 31 + ry, t, closed: true, smooth: false }); }
        } else if (kind === 'boardwalk') {
          const by = top + 40;
          const q = [[-20, by], [W + 20, by - 6], [W + 20, H + 40], [-20, H + 40]];
          Pd += inkLoop(q, { seed: sd + 40, t, amp: 0.8, smooth: false });
          for (let k = 0; k < 9; k++) { const yy = by + 40 + k * k * 9 + k * 30; if (yy < H) L += ' ' + inkPath([[-20, yy], [W + 20, yy - 4]], { w: 3 + k * 0.5, seed: sd + 41 + k, t }); }
          // a barrel and a hitching rail
          const bx = W * 0.82, byy = by + 260;
          const rx = W * 0.18; Ex += ' ' + inkLoop(rect(rx - 14, by - 150, rx + 14, by + 60), { seed: sd + 64, t, amp: 0.5, smooth: false }) + ' ' + inkLoop(rect(rx + 250, by - 150, rx + 278, by + 60), { seed: sd + 65, t, amp: 0.5, smooth: false }) + ' ' + inkLoop([[rx - 20, by - 150], [rx + 290, by - 156], [rx + 290, by - 130], [rx - 20, by - 124]], { seed: sd + 66, t, amp: 0.5, smooth: false });
        }
        // grass blades sway along the ground edge
        let B = '';
        for (let i = 0; i < 26; i++) {
          const x = (i + 0.5) * W / 26 + (hn(sd, i) - 0.5) * 20, y = top + 120 + hn(sd + 1, i) * (H - top - 160), hgt = 60 + hn(sd + 2, i) * 90, sw = Math.sin(t * 1.4 + i) * 12;
          B += inkLoop([[x - 10, y], [x + sw, y - hgt], [x + 10, y]], { seed: sd + 100 + i, t, amp: 0.6, smooth: false }) + ' ';
        }
        set(posts, Pd); set(line, L); set(blades, B); set(extra, Ex);
      },
    };
  }

  // ------------------------------------------------------------ hanging lantern on the ground (glow flickers)
  function lantern(parent, sd) {
    const glow = inkEl(parent, INK.gold, { 'fill-opacity': 0.25 }), glow2 = inkEl(parent, INK.gold, { 'fill-opacity': 0.4 });
    const body = inkEl(parent, INK.paperLight), flame = inkEl(parent, INK.gold), line = inkEl(parent);
    return { update(t, lt, x, y, s = 1) {
      const fl = 1 + 0.08 * Math.sin(lt * 13) + 0.05 * Math.sin(lt * 5.1);
      set(glow, inkCircle(x, y - 60 * s, 230 * s * fl, sd + 1, t, { fill: true }));
      set(glow2, inkCircle(x, y - 60 * s, 110 * s * fl, sd + 2, t, { fill: true }));
      const gl = rect(x - 34 * s, y - 110 * s, x + 34 * s, y - 14 * s);
      set(body, inkLoop(gl, { seed: sd + 3, t, amp: 0.5, smooth: false }));
      const fh = 40 * s * fl;
      set(flame, inkLoop([[x, y - 30 * s - fh], [x + 12 * s, y - 40 * s], [x, y - 24 * s], [x - 12 * s, y - 40 * s]], { seed: sd + 4, t, amp: 0.8 }));
      set(line, inkPath(gl, { w: 5, seed: sd + 5, t, closed: true, smooth: false }) + ' ' + inkPath([[x - 44 * s, y - 110 * s], [x, y - 140 * s], [x + 44 * s, y - 110 * s]], { w: 6, seed: sd + 6, t, smooth: false }) + ' ' +
        inkPath([[x - 20 * s, y - 150 * s], [x, y - 176 * s], [x + 20 * s, y - 150 * s]], { w: 5, seed: sd + 7, t }) + ' ' + inkLoop(rect(x - 44 * s, y - 14 * s, x + 44 * s, y), { seed: sd + 8, t, amp: 0.5, smooth: false }));
    } };
  }

  // ------------------------------------------------------------ kneeling, praying figure (bare head, hands folded)
  function kneeler(parent, sd) {
    const body = inkEl(parent), head = inkEl(parent, INK.paperLight), headR = inkEl(parent), face = inkEl(parent), hands = inkEl(parent);
    const shawl = inkEl(parent, INK.blue, { 'fill-opacity': 0.85 });
    return { update(t, x, gy, s, F, bow, o = {}) {
      const br = Math.sin(t * 2 + sd) * 2 * s;
      const hip = [x, gy - 96 * s], knee = [x + 64 * s * F, gy - 10 * s], foot = [x - 70 * s * F, gy - 8 * s];
      const neck = [x + (8 + bow * 22) * s * F, gy - 232 * s + bow * 12 * s + br];
      const hc = [neck[0] + (8 + bow * 30) * s * F, neck[1] - 74 * s + bow * 20 * s];
      const sh = [neck[0], neck[1] + 18 * s], hand = [neck[0] + 60 * s * F, neck[1] + 50 * s - bow * 6 * s];
      const elbow = [neck[0] + 22 * s * F, neck[1] + 110 * s];
      let B = inkPath([hip, knee, foot], { w: 7 * s + 1, seed: sd + 1, t }) + ' ' + inkPath([[hip[0] - 8 * s * F, hip[1]], [knee[0] - 18 * s * F, knee[1] + 2], [foot[0] + 10 * s * F, foot[1]]], { w: 7 * s + 1, seed: sd + 2, t }) + ' ' +
        inkPath([hip, [lerp(hip[0], neck[0], 0.5), lerp(hip[1], neck[1], 0.5)], neck], { w: 7 * s + 1, seed: sd + 3, t }) + ' ' +
        inkPath([sh, elbow, hand], { w: 7 * s + 1, seed: sd + 4, t }) + ' ' + inkPath([[sh[0] - 6 * s * F, sh[1]], [elbow[0] - 10 * s * F, elbow[1] + 4 * s], [hand[0] - 4 * s * F, hand[1] + 4 * s]], { w: 7 * s + 1, seed: sd + 5, t });
      B += ' ' + inkLoop(inkEllipsePts(foot[0] - 8 * s * F, foot[1] - 2, 20 * s, 9 * s, sd + 6, 8), { seed: sd + 6, t, amp: 0.6 });
      set(body, B);
      set(shawl, o.shawl ? inkLoop([[sh[0] - 44 * s, sh[1] - 4 * s], [sh[0] + 44 * s, sh[1] - 4 * s], [sh[0] + 30 * s, sh[1] + 90 * s], [sh[0] - 30 * s, sh[1] + 96 * s]], { seed: sd + 7, t, amp: 0.8 }) : '');
      const r = 60 * s;
      set(head, inkCircle(hc[0], hc[1], r, sd + 8, t, { fill: true }));
      set(headR, inkCircle(hc[0], hc[1], r, sd + 9, t, { w: 5 * s + 1 }) + (o.hair ? ' ' + inkLoop([[hc[0] - r * 1.02 * F, hc[1] + r * 0.2], [hc[0] - r * 0.9 * F, hc[1] - r * 0.7], [hc[0] - r * 0.1 * F, hc[1] - r * 1.04], [hc[0] + r * 0.7 * F, hc[1] - r * 0.76], [hc[0] + r * 0.2 * F, hc[1] - r * 0.6], [hc[0] - r * 0.6 * F, hc[1] - r * 0.1]], { seed: sd + 10, t, amp: 0.6 }) : ''));
      const ex = hc[0] + 24 * s * F, ey = hc[1] - 4 * s;
      set(face, inkPath([[ex - 9 * s, ey], [ex, ey + 5 * s], [ex + 9 * s, ey]], { w: 3.5 * s + 0.5, seed: sd + 11, t, amp: 0.4 }) + ' ' + inkPath([[ex - 12 * s, ey - 18 * s], [ex + 10 * s, ey - 22 * s]], { w: 3 * s + 0.5, seed: sd + 12, t, amp: 0.4 }) + ' ' +
        inkPath([[hc[0] + 14 * s * F, hc[1] + 26 * s], [hc[0] + 30 * s * F, hc[1] + 25 * s]], { w: 3 * s + 0.5, seed: sd + 13, t, amp: 0.4 }));
      // folded hands: two palms pressed together, fingertips up
      set(hands, inkLoop([[hand[0] - 10 * s, hand[1] + 10 * s], [hand[0] + 2 * s * F, hand[1] - 34 * s], [hand[0] + 12 * s, hand[1] + 10 * s]], { seed: sd + 14, t, amp: 0.5 }));
    } };
  }

  // ============================================================ ln_sky
  SH.ln_sky = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 313;
      const mode = P.mode || 'farm', gy = (P.gy ?? 0.6) * H;
      const root = el(svg, 'g');
      const dark = mode !== 'dawn' && P.dark !== false;
      const dSky = dark ? inkEl(root, NIGHT()) : null, dHill = dark ? inkEl(root, NIGHT2()) : null, dHillR = dark ? inkEl(root, mix(INK.blue, INK.paperLight, 0.3)) : null;
      const st = mode === 'dawn' ? null : stars(root, sd + 5, 40, 0, 80, W, gy * 0.8);
      const sky = el(root, 'g');
      const S = storm(sky, sd + 10, P.meteors ?? 46);
      const tw = mode === 'town' ? town(root, sd + 20, (P.town && P.town.n) || 7) : null;
      const hs = P.house === false || mode === 'town' ? null : house(root, sd + 30);
      let ex, fr;
      const mkF = () => { fr = front(root, sd + 60, P.front || (mode === 'town' ? 'boardwalk' : mode === 'dawn' ? 'grass-day' : 'fence'), W, H); };
      if (P.cast_front) { mkF(); ex = extras(root, P, W, H, sd); } else { ex = extras(root, P, W, H, sd); mkF(); }
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          if (dark) darkSky(dSky, dHill, dHillR, t, sd, W, gy);
          if (st) st.update(t);
          const R = [(P.radiant || [0.55, 0.06])[0] * W, (P.radiant || [0.55, 0.06])[1] * H];
          S.update(lt, t, { R, rate: mode === 'dawn' ? (P.rate ?? 0.08) : stormRate(P, lt, cues), box: [-60, -60, W + 60, gy - 40], d0: P.d0 || [40, gy * 0.95], len: P.len || [150, 360], arc: P.arc || [10, 170], w: P.mw ?? 1, dur: P.mdur ?? 0.55, glow: P.mglow ?? 1 });
          if (tw) tw.update(t, lt, gy);
          if (hs) { const Hs = P.house || {}; hs.update(t, lt, (Hs.x ?? 0.76) * W, gy, Hs.s ?? 1, { flip: Hs.flip }); }
          ex.update(lt, t, cues);
          fr.update(t, (P.front_y ?? 0.68) * H);
        },
      };
    },
  };

  // ============================================================ ln_pray
  SH.ln_pray = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 727;
      const gy = (P.gy ?? 0.62) * H;
      const root = el(svg, 'g');
      const dSky = inkEl(root, NIGHT()), dHill = inkEl(root, NIGHT2()), dHillR = inkEl(root, mix(INK.blue, INK.paperLight, 0.3));
      const st = stars(root, sd + 5, 26, 0, 80, W, gy * 0.6);
      const S = storm(el(root, 'g'), sd + 10, P.meteors ?? 40);
      const hs = P.house === false ? null : house(root, sd + 30);
      const figs = (P.figs || [{ x: 0.2, s: 1.1, face: 1, hair: true }, { x: 0.43, s: 0.95, face: 1, shawl: true, hair: true }, { x: 0.6, s: 0.7, face: 1, hair: true }]).map((f, i) => ({ f, k: kneeler(el(root, 'g'), sd + 50 + i * 20) }));
      const ex = extras(root, P, W, H, sd);
      const fr = front(root, sd + 60, 'grass', W, H);
      const ln = lantern(root, sd + 40);
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          darkSky(dSky, dHill, dHillR, t, sd, W, gy);
          st.update(t);
          const R = [(P.radiant || [0.6, 0.05])[0] * W, (P.radiant || [0.6, 0.05])[1] * H];
          S.update(lt, t, { R, rate: stormRate(P, lt, cues), box: [-60, -60, W + 60, gy - 260], d0: [40, gy * 0.8], len: [150, 340], arc: [10, 170] });
          if (hs) { const Hs = P.house || {}; hs.update(t, lt, (Hs.x ?? 0.92) * W, gy, Hs.s ?? 1.05, {}); }
          const L = P.lantern || [0.33, 0.66];
          ln.update(t, lt, L[0] * W, L[1] * H, P.lantern_s ?? 1.1);
          const ba = atOr(cues, P.at, dur * 0.3);
          figs.forEach(({ f, k }, i) => k.update(t, f.x * W, (f.y ?? 0.66) * H, f.s ?? 1, f.face ?? 1, progIO(lt, ba + i * 0.15, 0.7) * 0.9 + 0.05 * Math.sin(lt * 1.6 + i), f));
          ex.update(lt, t, cues);
          fr.update(t, (P.front_y ?? 0.7) * H);
        },
      };
    },
  };

  // ============================================================ ln_desk (+ ln_letters)
  function deskShot(defMode) {
    return {
      kind: '2d',
      build(ctx) {
        const { P, W, H, svg, defs, seed } = ctx, sd = seed * 1000 + 911;
        const mode = P.mode || defMode;
        const win = (P.win || [0.5, 0.12, 0.94, 0.5]).map((v, i) => v * (i % 2 ? H : W));
        const root = el(svg, 'g');
        const id = 'lnclip' + seed + '_' + sd;
        const cp = el(defs, 'clipPath', { id }); el(cp, 'rect', { x: win[0], y: win[1], width: win[2] - win[0], height: win[3] - win[1] });
        const winBg = inkEl(root, NIGHT());
        const inner = el(root, 'g', { 'clip-path': `url(#${id})` });
        const st = stars(inner, sd + 3, 14, win[0], win[1], win[2], win[3]);
        const roofs = inkEl(inner, NIGHT2());
        const S = storm(inner, sd + 10, P.meteors ?? 30);
        const frame = inkEl(root, WOOD()), frameR = inkEl(root);
        const curtain = inkEl(root, INK.red, { 'fill-opacity': 0.8 }), curtainR = inkEl(root);
        const shelf = inkEl(root, WOOD_D()), books = [INK.blue, INK.red, INK.green, INK.inkSoft, INK.gold].map(c => inkEl(root, c)), shelfR = inkEl(root);
        const glow = inkEl(root, INK.gold, { 'fill-opacity': 0.22 });
        const prof = KASIF.create(el(root, 'g'), { scale: P.scale ?? 1.35, hat: false, beard: null, seed: sd + 20 });
        const deskTop = inkEl(root, WOOD()), deskFront = inkEl(root, WOOD_D()), deskR = inkEl(root), deskH = inkEl(root, INK.ink);
        const papers = inkEl(root, INK.paperLight), papersR = inkEl(root), scrib = inkEl(root, INK.inkSoft);
        const candle = inkEl(root, INK.paperLight), flame = inkEl(root, INK.gold), candleR = inkEl(root);
        const well = inkEl(root, INK.ink), quill = inkEl(root, INK.paperLight), quillR = inkEl(root);
        const pile = inkEl(root, INK.paperLight), pileR = inkEl(root), seals = inkEl(root, INK.red);
        const fly = inkEl(root, INK.paperLight), flyR = inkEl(root), flyS = inkEl(root, INK.red);
        const ex = extras(root, P, W, H, sd);
        const env = (x, y, w, h, rot) => { const c = Math.cos(rot), s = Math.sin(rot), Q = [[-w, -h], [w, -h], [w, h], [-w, h]].map(([a, b]) => [x + a * c - b * s, y + a * s + b * c]); return Q; };
        return {
          update(lt, dur, cues, envr = {}) {
            const t = envr.t ?? lt;
            const dy = (P.desk_y ?? 0.56) * H;
            // window with the storm outside
            set(winBg, inkLoop(rect(win[0], win[1], win[2], win[3]), { seed: sd + 1, t, amp: 0.4, smooth: false }));
            st.update(t);
            const rp = []; for (let x = win[0] - 20; x <= win[2] + 20; x += 40) rp.push([x, win[3] - 70 - (Math.floor((x - win[0]) / 120) % 2) * 40 - Math.abs(Math.sin(x * 0.02)) * 30]);
            set(roofs, inkLoop(rp.concat([[win[2] + 20, win[3] + 20], [win[0] - 20, win[3] + 20]]), { seed: sd + 2, t, amp: 0.6, smooth: false }));
            S.update(lt, t, { R: [win[0] + (win[2] - win[0]) * 0.45, win[1] - 60], rate: P.rate ?? 0.95, box: [win[0] - 40, win[1] - 200, win[2] + 40, win[3] - 60], d0: [60, 520], len: [90, 220], arc: [25, 155], w: 0.8 });
            const fw = 26, outer = rect(win[0] - fw, win[1] - fw, win[2] + fw, win[3] + fw);
            set(frame, inkPath(outer, { w: fw * 1.6, seed: sd + 4, t, closed: true, smooth: false, amp: 0.6, taper: 0 }) + ' ' +
              inkPath([[(win[0] + win[2]) / 2, win[1]], [(win[0] + win[2]) / 2, win[3]]], { w: 14, seed: sd + 5, t, taper: 0 }) + ' ' + inkPath([[win[0], (win[1] + win[3]) / 2], [win[2], (win[1] + win[3]) / 2]], { w: 14, seed: sd + 6, t, taper: 0 }));
            set(frameR, inkPath(outer, { w: 5, seed: sd + 7, t, closed: true, smooth: false }) + ' ' + inkPath(rect(win[0], win[1], win[2], win[3]), { w: 4, seed: sd + 8, t, closed: true, smooth: false }));
            const sway = Math.sin(lt * 0.9) * 8;
            const cu = [[win[2] + 10, win[1] - 50], [win[2] + 70, win[1] - 50], [win[2] + 66 + sway, win[3] + 60], [win[2] - 4 + sway * 1.4, win[3] + 70], [win[2] + 30 + sway, (win[1] + win[3]) / 2]];
            set(curtain, inkLoop(cu, { seed: sd + 9, t, amp: 0.8 })); set(curtainR, inkPath(cu, { w: 4, seed: sd + 10, t, closed: true }));
            // bookshelf on the left wall
            const sx0 = 40, sx1 = W * 0.38, sy0 = H * 0.13, sy1 = H * 0.33;
            set(shelf, inkLoop(rect(sx0, sy0, sx1, sy1), { seed: sd + 11, t, amp: 0.5, smooth: false }));
            const BK = books.map(() => []);
            let SR = inkPath(rect(sx0, sy0, sx1, sy1), { w: 5, seed: sd + 12, t, closed: true, smooth: false });
            for (let row = 0; row < 2; row++) {
              const by1 = sy0 + (row + 1) * (sy1 - sy0) / 2 - 8, by0 = by1 - (sy1 - sy0) / 2 + 26;
              let x = sx0 + 16, i = 0;
              while (x < sx1 - 40) { const w = 26 + hn(sd + row, i) * 22, h = (by1 - by0) * (0.7 + 0.3 * hn(sd + 5 + row, i)); BK[(i + row * 2) % 5].push(inkLoop(rect(x, by1 - h, x + w, by1), { seed: sd + 100 + row * 40 + i, t, amp: 0.4, smooth: false })); x += w + 4; i++; }
              SR += ' ' + inkPath([[sx0, by1 + 6], [sx1, by1 + 6]], { w: 8, seed: sd + 13 + row, t });
            }
            books.forEach((b, i) => set(b, BK[i].join(' '))); set(shelfR, SR);
            // candle glow
            const cx = W * 0.2, fl = 1 + 0.07 * Math.sin(lt * 11) + 0.05 * Math.sin(lt * 4.3);
            set(glow, inkCircle(cx, dy - 120, 330 * fl, sd + 14, t, { fill: true }));
            // the professor behind the desk
            const la = atOr(cues, P.look, dur * 0.25), aa = atOr(cues, P.ask, null), pa = atOr(cues, P.pour, dur * 0.2);
            let pose = 'think', dir = 20, emo = 'neutral', face = 1;
            if (mode === 'ask') { if (lt > la) { pose = 'point'; dir = 35; emo = 'surprised'; } if (aa != null && lt > aa) { pose = 'think'; emo = 'worried'; } }
            else { pose = lt > pa + 1.2 ? 'point' : 'shock'; dir = -25; emo = lt > pa + 1.2 ? 'happy' : 'surprised'; }
            const px = (P.prof_x ?? 0.4) * W;
            prof.update(t, pose, { x: px, y: dy + (P.prof_dy ?? 250), face, since: Math.max(0, lt - (mode === 'ask' ? la : pa)), dir, emotion: emo, mouth: 0 });
            // desk: top (slight perspective) + front panel with drawers down to the frame bottom
            const top = [[-30, dy], [W + 30, dy - 10], [W + 30, dy + 70], [-30, dy + 80]];
            set(deskTop, inkLoop(top, { seed: sd + 15, t, amp: 0.6, smooth: false }));
            const frt = [[-30, dy + 80], [W + 30, dy + 70], [W + 30, H + 40], [-30, H + 40]];
            set(deskFront, inkLoop(frt, { seed: sd + 16, t, amp: 0.6, smooth: false }));
            let DR = inkPath(top, { w: 6, seed: sd + 17, t, closed: true, smooth: false }) + ' ' + inkPath([[-30, dy + 80], [W + 30, dy + 70]], { w: 6, seed: sd + 18, t });
            let DH = '';
            for (const [x0, x1] of [[60, 500], [580, 1020]]) {
              const y0 = dy + 230, y1 = dy + 470;
              DR += ' ' + inkPath(rect(x0, y0, x1, y1), { w: 5, seed: sd + 19 + x0, t, closed: true, smooth: false });
              DH += inkDot((x0 + x1) / 2, (y0 + y1) / 2, 16, 12, sd + 20 + x0, t) + ' ';
              DR += ' ' + inkPath(rect(x0, y1 + 90, x1, y1 + 330), { w: 5, seed: sd + 21 + x0, t, closed: true, smooth: false });
              DH += inkDot((x0 + x1) / 2, y1 + 210, 16, 12, sd + 22 + x0, t) + ' ';
            }
            for (let k = 0; k < 5; k++) DR += ' ' + inkPath([[-30, dy + 120 + k * 22], [W + 30, dy + 112 + k * 22]], { w: 1.8, seed: sd + 30 + k, t, amp: 1 });
            set(deskR, DR); set(deskH, DH);
            // papers + scribbles, candle, inkwell + quill
            const pp = env(W * 0.62, dy + 34, 120, 34, -0.05), pq = env(W * 0.5, dy + 44, 100, 30, 0.08);
            set(papers, inkLoop(pq, { seed: sd + 40, t, amp: 0.4, smooth: false }) + ' ' + inkLoop(pp, { seed: sd + 41, t, amp: 0.4, smooth: false }));
            set(papersR, inkPath(pq, { w: 3.5, seed: sd + 42, t, closed: true, smooth: false }) + ' ' + inkPath(pp, { w: 3.5, seed: sd + 43, t, closed: true, smooth: false }));
            let SC = ''; for (let k = 0; k < 3; k++) SC += inkPath([[W * 0.62 - 90, dy + 22 + k * 12], [W * 0.62 + 60 - k * 20, dy + 18 + k * 12]], { w: 2.4, seed: sd + 44 + k, t }) + ' ';
            set(scrib, SC);
            set(candle, inkLoop(rect(cx - 22, dy - 110, cx + 22, dy + 20), { seed: sd + 50, t, amp: 0.4, smooth: false }));
            const fh = 46 * fl;
            set(flame, inkLoop([[cx, dy - 110 - fh], [cx + 14, dy - 124], [cx, dy - 108], [cx - 14, dy - 124]], { seed: sd + 51, t, amp: 0.8 }));
            set(candleR, inkPath(rect(cx - 22, dy - 110, cx + 22, dy + 20), { w: 4, seed: sd + 52, t, closed: true, smooth: false }) + ' ' + inkLoop(inkEllipsePts(cx, dy + 24, 60, 14, sd + 53, 10), { seed: sd + 53, t, amp: 0.4 }));
            const wx = W * 0.86;
            set(well, inkLoop([[wx - 34, dy + 30], [wx - 30, dy - 20], [wx + 30, dy - 20], [wx + 34, dy + 30]], { seed: sd + 54, t, amp: 0.4 }));
            const qa = Math.sin(lt * 1.3) * 0.04;
            const qp = [[wx - 6, dy - 16], [wx + 60 + qa * 200, dy - 170], [wx + 92 + qa * 200, dy - 214], [wx + 70 + qa * 200, dy - 150]];
            set(quill, inkLoop(qp, { seed: sd + 55, t, amp: 0.6 })); set(quillR, inkPath(qp, { w: 3.5, seed: sd + 56, t, closed: true }) + ' ' + inkPath([[wx - 6, dy - 16], [wx + 88 + qa * 200, dy - 208]], { w: 3, seed: sd + 57, t }));
            // letters: they fly in through the window and pile up on the desk
            if (mode === 'letters') {
              const n = 18, FL = [], FS = [], PL = [], PS = [];
              let landed = 0;
              for (let i = 0; i < n; i++) {
                const a0 = pa + i * 0.16, u = (lt - a0) / 0.75;
                const px0 = W * 0.6 + (hn(sd, i) - 0.5) * 200, py0 = H * 0.28 + (hn(sd + 1, i) - 0.5) * 160;
                const tx = W * 0.66 + (hn(sd + 2, i) - 0.5) * 300, tyy = dy - 10;
                if (u <= 0) continue;
                if (u < 1) {
                  const e = EASE(u), x = lerp(px0, tx, e), y = lerp(py0, tyy, e) - Math.sin(e * Math.PI) * 140, rot = (1 - e) * (hn(sd + 3, i) - 0.5) * 3 + Math.sin(lt * 9 + i) * 0.2 * (1 - e);
                  const q = env(x, y, 54, 34, rot); FL.push(inkLoop(q, { seed: sd + 60 + i, t, amp: 0.4, smooth: false }));
                  FS.push(inkPath([q[0], [x, y + 4], q[1]], { w: 3, seed: sd + 90 + i, t, smooth: false }) + ' ' + inkPath(q, { w: 3.5, seed: sd + 120 + i, t, closed: true, smooth: false }));
                } else landed++;
              }
              // the pile grows with each landed letter
              for (let i = 0; i < landed; i++) {
                const x = W * 0.68 + (hn(sd + 7, i) - 0.5) * 280, y = dy + 14 - Math.floor(i / 3) * 22 - (i % 3) * 6, rot = (hn(sd + 8, i) - 0.5) * 0.5;
                const q = env(x, y, 56, 30, rot);
                PL.push(inkLoop(q, { seed: sd + 200 + i, t, amp: 0.4, smooth: false }));
                PS.push(inkPath(q, { w: 3.5, seed: sd + 230 + i, t, closed: true, smooth: false }) + ' ' + inkPath([q[0], [x, y + 6], q[1]], { w: 2.6, seed: sd + 260 + i, t, smooth: false }));
              }
              set(pile, PL.join(' ')); set(pileR, PS.join(' '));
              set(seals, ''); set(fly, FL.join(' ')); set(flyR, FS.join(' ')); set(flyS, '');
            }
            ex.update(lt, t, cues);
          },
        };
      },
    };
  }
  SH.ln_desk = { kind: '2d', build(ctx) { return deskShot('ask').build(ctx); } };
  SH.ln_letters = { kind: '2d', build(ctx) { return deskShot('letters').build(ctx); } };

  // ============================================================ ln_chart
  // Leo (approximate chart positions, unit box): the Sickle (a backwards question mark) + the hind triangle
  const LEO = {
    stars: { reg: [0.30, 0.66, 1.4], eta: [0.33, 0.52, 0.8], alg: [0.40, 0.40, 1.1], zet: [0.42, 0.26, 0.8], mu: [0.33, 0.16, 0.7], eps: [0.24, 0.20, 0.9],
      chr: [0.66, 0.50, 0.8], zos: [0.70, 0.38, 0.9], den: [0.88, 0.48, 1.1] },
    lines: [['reg', 'eta', 'alg', 'zet', 'mu', 'eps'], ['alg', 'zos', 'den', 'chr', 'reg'], ['chr', 'zos']],
  };
  SH.ln_chart = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 133;
      const root = el(svg, 'g');
      const cb = [24, (P.chart_t ?? 0.035) * H, W - 24, (P.chart_b ?? 0.76) * H];
      const sheet = inkEl(root, NIGHT()), grid = inkEl(root, INK.inkSoft, { 'fill-opacity': 0.9 }), border = inkEl(root, INK.gold);
      const faint = stars(root, sd + 2, 70, cb[0] + 20, cb[1] + 20, cb[2] - 20, cb[3] - 20, mix(INK.paperLight, INK.blue, 0.3));
      const conL = inkEl(root, mix(INK.paperLight, INK.blue, 0.25)), conS = inkEl(root, INK.paperLight), conG = inkEl(root, INK.gold, { 'fill-opacity': 0.35 });
      const arrows = inkEl(root, INK.paperLight), arrowH = inkEl(root, INK.gold);
      const dash = inkEl(root, INK.red), ring = inkEl(root, INK.red), ringG = inkEl(root, INK.gold, { 'fill-opacity': 0.4 });
      const name = el(root, 'text', { 'font-family': INK_FONT, 'font-size': 84, 'text-anchor': 'middle', fill: INK.paperLight }); name.textContent = P.name || 'LEO';
      const floor = inkEl(root, WOOD()), floorR = inkEl(root);
      const ex = extras(root, P, W, H, sd);
      // streaks: positions around the radiant (angle, start dist, length) in chart px
      const NS = P.streaks ?? 14, SK = [];
      for (let i = 0; i < NS; i++) SK.push({ a: (i / NS) * 360 + hn(sd, i) * 20, d: 120 + hn(sd + 1, i) * 200, L: 110 + hn(sd + 2, i) * 90, at: 0.1 + i * 0.1 });
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const box = rect(cb[0], cb[1], cb[2], cb[3]);
          set(sheet, inkLoop(box, { seed: sd + 1, t, amp: 0.6, smooth: false }));
          let G = '';
          for (let k = 1; k < 6; k++) { const x = lerp(cb[0], cb[2], k / 6); G += inkPath([[x, cb[1] + 10], [x + 30, (cb[1] + cb[3]) / 2], [x, cb[3] - 10]], { w: 2, seed: sd + 10 + k, t, amp: 0.6 }) + ' '; }
          for (let k = 1; k < 6; k++) { const y = lerp(cb[1], cb[3], k / 6); G += inkPath([[cb[0] + 10, y], [W / 2, y - 26], [cb[2] - 10, y]], { w: 2, seed: sd + 20 + k, t, amp: 0.6 }) + ' '; }
          set(grid, G);
          set(border, inkPath(box, { w: 8, seed: sd + 3, t, closed: true, smooth: false }) + ' ' + inkPath(rect(cb[0] + 16, cb[1] + 16, cb[2] - 16, cb[3] - 16), { w: 3, seed: sd + 4, t, closed: true, smooth: false }));
          faint.update(t);
          // Leo
          const LX = (P.leo || [0.1, 0.12, 0.9, 0.6]), lx = v => lerp(LX[0] * W, LX[2] * W, v), ly = v => lerp(LX[1] * H, LX[3] * H, v);
          const SP = k => [lx(LEO.stars[k][0]), ly(LEO.stars[k][1])];
          const cl = prog(lt, 0, 1.2);
          set(conL, LEO.lines.map((ln, i) => { const pts = ln.map(SP); const m = Math.max(2, Math.ceil(pts.length * cl)); return inkPath(pts.slice(0, m), { w: 4, seed: sd + 30 + i, t, smooth: false, amp: 0.8 }); }).join(' '));
          set(conS, Object.keys(LEO.stars).map((k, i) => { const [x, y] = SP(k), r = 9 * LEO.stars[k][2] * (0.85 + 0.15 * Math.sin(t * 2 + i)); return inkDot(x, y, r, r, sd + 40 + i, t, 0.4); }).join(' '));
          set(conG, Object.keys(LEO.stars).map((k, i) => { const [x, y] = SP(k); return inkCircle(x, y, 22 * LEO.stars[k][2], sd + 50 + i, t, { fill: true }); }).join(' '));
          const [rx, ry] = P.rad ? [P.rad[0] * W, P.rad[1] * H] : [lerp(SP('alg')[0], SP('zet')[0], 0.4) - 20, lerp(SP('alg')[1], SP('zet')[1], 0.5)];
          const nmP = P.name_at || [0.62, 0.17]; name.setAttribute('x', f1(nmP[0] * W)); name.setAttribute('y', f1(nmP[1] * H)); name.setAttribute('opacity', prog(lt, 0.6, 0.6).toFixed(2));
          // streaks appear one by one (arrows flying away from the radiant)
          const ba = atOr(cues, P.back, dur * 0.45), la = atOr(cues, P.leo_at || 'leo', dur * 0.7);
          const A = [], AH = [], D = [];
          SK.forEach((s, i) => {
            const p = prog(lt, s.at, 0.35); if (p <= 0) return;
            const a = s.a * D2R, dx = Math.cos(a), dy = Math.sin(a);
            const t0 = [rx + dx * s.d, ry + dy * s.d], t1 = [t0[0] + dx * s.L * p, t0[1] + dy * s.L * p];
            if (t1[1] > cb[3] - 30 || t1[1] < cb[1] + 30 || t1[0] < cb[0] + 30 || t1[0] > cb[2] - 30) return;
            const w = 6, nx = -dy * w, ny = dx * w;
            A.push(inkLoop([t0, [t1[0] + nx, t1[1] + ny], [t1[0] + dx * w, t1[1] + dy * w], [t1[0] - nx, t1[1] - ny]], { seed: sd + 60 + i, t, amp: 0.4, smooth: false }));
            AH.push(inkDot(t1[0], t1[1], 9, 9, sd + 80 + i, t, 0.3));
            // dashed red line back to the radiant
            const bp = prog(lt, ba + i * 0.05, 0.6);
            if (bp > 0) {
              const segs = 9;
              for (let k = 0; k < segs; k++) {
                const u0 = k / segs, u1 = u0 + 0.55 / segs; if (u0 > bp) break;
                const q0 = [lerp(t0[0], rx, u0), lerp(t0[1], ry, u0)], q1 = [lerp(t0[0], rx, Math.min(u1, bp)), lerp(t0[1], ry, Math.min(u1, bp))];
                D.push(inkPath([q0, q1], { w: 5, seed: sd + 100 + i * 10 + k, t, amp: 0.5 }));
              }
            }
          });
          if (P.trace) {   // the presenter traces one line back to the radiant
            const tp = prog(lt, atOr(cues, P.trace.at, ba) - 0.2, 0.9), f0 = [P.trace.from[0] * W, P.trace.from[1] * H];
            for (let k = 0; k < 12; k++) { const u0 = k / 12, u1 = u0 + 0.6 / 12; if (u0 > tp) break; D.push(inkPath([[lerp(f0[0], rx, u0), lerp(f0[1], ry, u0)], [lerp(f0[0], rx, Math.min(u1, tp)), lerp(f0[1], ry, Math.min(u1, tp))]], { w: 8, seed: sd + 400 + k, t, amp: 0.5 })); }
          }
          set(arrows, A.join(' ')); set(arrowH, AH.join(' ')); set(dash, D.join(' '));
          const rp = spring(lt, la, 0.6), pul = 1 + 0.08 * Math.sin(lt * 5);
          set(ring, lt > la ? inkCircle(rx, ry, 64 * rp * pul, sd + 120, t, { w: 9 }) : '');
          set(ringG, lt > la ? inkCircle(rx, ry, 44 * rp * pul, sd + 121, t, { fill: true }) : '');
          // a wooden floor under the presenter
          const fl = [[-20, cb[3] + 10], [W + 20, cb[3] + 4], [W + 20, H + 40], [-20, H + 40]];
          set(floor, inkLoop(fl, { seed: sd + 130, t, amp: 0.6, smooth: false }));
          let FR = inkPath([[-20, cb[3] + 10], [W + 20, cb[3] + 4]], { w: 6, seed: sd + 131, t });
          for (let k = 0; k < 7; k++) { const y = cb[3] + 40 + k * k * 10 + k * 30; if (y < H) FR += ' ' + inkPath([[-20, y], [W + 20, y - 4]], { w: 3, seed: sd + 132 + k, t }); }
          set(floorR, FR);
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ ln_space
  SH.ln_space = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 557;
      const root = el(svg, 'g');
      const sky = inkEl(root, NIGHT());
      const st = stars(root, sd + 2, 60, 0, 0, W, H * 0.7);
      const air = inkEl(root, mix(INK.blue, INK.paperLight, 0.35), { 'fill-opacity': 0.75 }), airL = inkEl(root, INK.paperLight, { 'fill-opacity': 0.7 });
      const earth = inkEl(root, mix(INK.blue, INK.ink, 0.15)), land = inkEl(root, mix(INK.green, INK.ink, 0.2)), earthR = inkEl(root), hatch = inkEl(root, mix(INK.blue, INK.paperLight, 0.3));
      const grainT = inkEl(root, INK.gold, { 'fill-opacity': 0.45 }), grains = inkEl(root, INK.gold), burn = inkEl(root, INK.paperLight), burnG = inkEl(root, INK.gold, { 'fill-opacity': 0.5 });
      const ex = extras(root, P, W, H, sd);
      const N = 70;
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          set(sky, inkLoop(rect(-20, -20, W + 20, H + 20), { seed: sd + 1, t, amp: 0.4, smooth: false }));
          st.update(t);
          const ec = [W * 0.5, (P.earth_y ?? 0.62) * H + 1500], er = 1500, ar = er + 150;
          const ring = (r, n = 90) => { const pts = []; for (let k = 0; k <= n; k++) { const a = lerp(-150, -30, k / n) * D2R; pts.push([ec[0] + Math.cos(a) * r, ec[1] + Math.sin(a) * r]); } return pts; };
          const outer = ring(ar), inner = ring(er);
          set(air, inkLoop(outer.concat(inner.slice().reverse()), { seed: sd + 3, t, amp: 0.6, smooth: false }));
          set(airL, inkPath(outer, { w: 6, seed: sd + 4, t, amp: 0.8 }));
          set(earth, inkLoop(inner.concat([[W + 400, H + 40], [-400, H + 40]]), { seed: sd + 5, t, amp: 0.6, smooth: false }));
          // continents drift slowly (the Earth turns)
          const sh = (lt * 14) % 900;
          const L = [];
          for (let i = 0; i < 4; i++) {
            const bx = ((i * 300 + sh) % 1200) - 100, by = ec[1] - er + 120 + (i % 2) * 220 + 40 * Math.abs(bx - W / 2) / W;
            L.push(inkLoop(inkEllipsePts(bx, by + 60, 150 + i * 20, 60 + (i % 2) * 30, sd + 10 + i, 10, 0.2, 0.18), { seed: sd + 10 + i, t, amp: 1 }));
          }
          set(land, L.join(' '));
          set(earthR, inkPath(inner, { w: 7, seed: sd + 6, t, amp: 0.8 }));
          let HT = ''; for (let k = 0; k < 6; k++) { const y = ec[1] - er + 420 + k * 70; HT += inkPath([[-20, y], [W + 20, y + 10]], { w: 2.5, seed: sd + 20 + k, t, amp: 1.2 }) + ' '; }
          set(hatch, HT);
          // grains fly in parallel (from up-left), burn up as they hit the air
          const ra = atOr(cues, P.at, dur * 0.3), rate = lerp(0.8, 1, progIO(lt, ra - 0.3, 0.8));
          const dir = [0.42, 0.91], GR = [], GT = [], BU = [], BG = [];
          for (let i = 0; i < N; i++) {
            const per = 1.0 + hn(sd, i) * 0.7, ph = hn(sd + 1, i) * per, k = Math.floor((lt + ph) / per), u = ((lt + ph) - k * per) / per;
            if (hn(sd + k * 3.1, i + 5) > rate) continue;
            const ex0 = -200 + hn(sd + k * 2.3, i + 7) * (W + 200), ey0 = -60;
            // where the path meets the air ring (approx.): solve along the ray
            let hitS = 0; for (let s = 0; s < 2600; s += 20) { const x = ex0 + dir[0] * s, y = ey0 + dir[1] * s; if (Math.hypot(x - ec[0], y - ec[1]) < ar) { hitS = s; break; } }
            if (!hitS) continue;
            const s = u * (hitS + 140), x = ex0 + dir[0] * s, y = ey0 + dir[1] * s;
            if (s < hitS) { const r0 = 9 + hn(sd + 4, i) * 6, nx = -dir[1] * r0, ny = dir[0] * r0; GR.push(inkDot(x, y, r0, r0, sd + 30 + i, t, 0.3)); GT.push(inkLoop([[x - dir[0] * r0 * 7, y - dir[1] * r0 * 7], [x + nx, y + ny], [x - nx, y - ny]], { seed: sd + 140 + i, t, amp: 0.3, smooth: false })); }
            else {
              const b = (s - hitS) / 140, L2 = 260 * (1 - b * 0.4), w = 11 * (1 - b);
              const tx = x - dir[0] * L2, ty = y - dir[1] * L2, nx = -dir[1] * w, ny = dir[0] * w;
              BU.push(inkLoop([[tx, ty], [x + nx, y + ny], [x + dir[0] * w, y + dir[1] * w], [x - nx, y - ny]], { seed: sd + 60 + i, t, amp: 0.3, smooth: false }));
              BG.push(inkCircle(x, y, 26 * (1 - b) + 4, sd + 90 + i, t, { fill: true }));
            }
          }
          set(grains, GR.join(' ')); set(grainT, GT.join(' ')); set(burn, BU.join(' ')); set(burnG, BG.join(' '));
          ex.update(lt, t, cues);
        },
      };
    },
  };

  // ============================================================ ln_comet
  SH.ln_comet = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx, sd = seed * 1000 + 991;
      const root = el(svg, 'g');
      const sky = inkEl(root, NIGHT());
      const st = stars(root, sd + 2, 60, 0, 0, W, H);
      const sunG = inkEl(root, INK.gold, { 'fill-opacity': 0.35 }), sunF = inkEl(root, INK.gold), sunR = inkEl(root, INK.red);
      const river = inkEl(root, INK.gold, { 'fill-opacity': 0.3 }), river2 = inkEl(root, INK.gold, { 'fill-opacity': 0.3 }), dust = inkEl(root, INK.paperLight), dust2 = inkEl(root, INK.gold);
      const orbit = inkEl(root, INK.paperLight);
      const tail = inkEl(root, mix(INK.gold, INK.paperLight, 0.4), { 'fill-opacity': 0.75 }), tail2 = inkEl(root, mix(INK.blue, INK.paperLight, 0.4), { 'fill-opacity': 0.7 });
      const coma = inkEl(root, INK.gold, { 'fill-opacity': 0.5 }), nuc = inkEl(root, INK.paperLight), nucR = inkEl(root);
      const earth = inkEl(root, INK.blue), land = inkEl(root, INK.green), earthR = inkEl(root);
      const sparks = inkEl(root, INK.paperLight), sparkG = inkEl(root, INK.gold, { 'fill-opacity': 0.5 });
      const ex = extras(root, P, W, H, sd);
      // the dust river: a band from the comet (up right) down to the lower left
      const A = [W * 0.6, H * 0.24], B = [-W * 0.15, H * 0.9];
      const bandAt = u => [lerp(A[0], B[0], u), lerp(A[1], B[1], u) + Math.sin(u * 3) * 40];
      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          set(sky, inkLoop(rect(-20, -20, W + 20, H + 20), { seed: sd + 1, t, amp: 0.4, smooth: false }));
          st.update(t);
          // river band
          const up = [], dn = [];
          const up2 = [], dn2 = [];
          for (let k = 0; k <= 20; k++) { const u = k / 20, p = bandAt(u), w = 70 + u * 230; up2.push([p[0] + w * 0.3, p[1] - w * 0.4]); dn2.push([p[0] - w * 0.3, p[1] + w * 0.4]); up.push([p[0] + w * 0.6, p[1] - w * 0.8]); dn.push([p[0] - w * 0.6, p[1] + w * 0.8]); }
          set(river, inkLoop(up.concat(dn.reverse()), { seed: sd + 3, t, amp: 1 })); set(river2, inkLoop(up2.concat(dn2.reverse()), { seed: sd + 4, t, amp: 1 }));
          const sx = -60, sy = H + 40, sr = 260 + Math.sin(lt * 2) * 6; set(sunG, inkCircle(sx, sy, sr * 1.7, sd + 5, t, { fill: true })); set(sunF, inkCircle(sx, sy, sr, sd + 6, t, { fill: true }));
          let SRr = ''; for (let k = 0; k < 7; k++) { const a = -1.5 + k * 0.24 + Math.sin(lt * 0.8) * 0.03; SRr += inkPath([[sx + Math.cos(a) * (sr * 1.15), sy + Math.sin(a) * (sr * 1.15)], [sx + Math.cos(a) * (sr * 1.5), sy + Math.sin(a) * (sr * 1.5)]], { w: 9, seed: sd + 7 + k, t }) + ' '; } set(sunR, SRr);
          const DD = [], D2 = [];
          for (let i = 0; i < 220; i++) {
            const u = (hn(sd, i) + lt * 0.04) % 1, p = bandAt(u), w = 70 + u * 230, off = (hn(sd + 1, i) - 0.5) * 2;
            const x = p[0] + off * w * 0.6, y = p[1] - off * w * 0.8, r = (3 + hn(sd + 2, i) * 5) * (0.75 + 0.25 * Math.sin(lt * 4 + i));
            (i % 3 ? D2 : DD).push(inkDot(x, y, r, r, sd + 10 + i, t, 0.3));
          }
          set(dust, DD.join(' ')); set(dust2, D2.join(' '));
          // Earth's orbit (dashed arc) and the Earth moving along it into the river
          const oc = [-357, 1815], orR = 1100;
          const oPt = a => [oc[0] + Math.cos(a) * orR, oc[1] + Math.sin(a) * orR];
          let O = '';
          for (let k = 0; k < 30; k++) { const a0 = lerp(-1.75, -0.2, k / 30), a1 = a0 + 0.025; O += inkPath([oPt(a0), oPt(a1)], { w: 5, seed: sd + 200 + k, t, amp: 0.5 }) + ' '; }
          set(orbit, O);
          const ca = atOr(cues, P.cross, dur * 0.55);
          // crossing point: where the orbit meets the band (found once by search)
          let aC = -2.6, best = 1e9;
          for (let a = -1.6; a < -0.3; a += 0.01) { const p = oPt(a); for (let u = 0; u <= 1; u += 0.02) { const q = bandAt(u), d = Math.hypot(p[0] - q[0], p[1] - q[1]); if (d < best) { best = d; aC = a; } } }
          const ea = aC + (lt - ca) * 0.06;
          const E = oPt(ea), er = 145;
          set(earth, inkCircle(E[0], E[1], er, sd + 20, t, { fill: true }));
          set(land, inkLoop(inkEllipsePts(E[0] - 30 + Math.sin(lt * 0.5) * 14, E[1] - 16, 72, 52, sd + 21, 9, 0.4, 0.2), { seed: sd + 21, t, amp: 0.8 }) + ' ' + inkLoop(inkEllipsePts(E[0] + 62, E[1] + 60, 40, 30, sd + 22, 8, 0, 0.2), { seed: sd + 22, t, amp: 0.8 }));
          set(earthR, inkCircle(E[0], E[1], er, sd + 23, t, { w: 6 }));
          // sparks when inside the river
          const inR = lt > ca - 0.3, SPk = [], SG = [];
          if (inR) {
            for (let i = 0; i < 14; i++) {
              const per = 0.5 + hn(sd + 5, i) * 0.4, u = ((lt + hn(sd + 6, i) * per) % per) / per, a = hn(sd + 7, i + Math.floor((lt + hn(sd + 6, i) * per) / per)) * 6.28;
              const r0 = er + 10 + u * 120, x = E[0] + Math.cos(a) * r0, y = E[1] + Math.sin(a) * r0, L = 50 * (1 - u), w = 5 * (1 - u) + 1;
              const dx = Math.cos(a), dy = Math.sin(a);
              SPk.push(inkLoop([[x - dx * L, y - dy * L], [x - dy * w, y + dx * w], [x + dx * w, y + dy * w], [x + dy * w, y - dx * w]], { seed: sd + 300 + i, t, amp: 0.3, smooth: false }));
              SG.push(inkCircle(x, y, 12 * (1 - u) + 2, sd + 330 + i, t, { fill: true }));
            }
          }
          set(sparks, SPk.join(' ')); set(sparkG, SG.join(' '));
          // the comet (heading up right, tail pointing away from the lower-left Sun)
          const cx = A[0] + 20 + Math.sin(lt * 0.5) * 6, cy = A[1] - 20, ang = 2.214, c = Math.cos(ang), s = Math.sin(ang);
          const Pt = (a, b) => [cx + c * a - s * b, cy + s * a + c * b];
          const sw = Math.sin(lt * 1.4) * 14;
          set(tail, inkLoop([Pt(0, -24), Pt(-170, -56), Pt(-330, -56 + sw), Pt(-330, 66 + sw), Pt(-170, 46), Pt(0, 24)], { seed: sd + 40, t, amp: 1 }));
          set(tail2, inkLoop([Pt(0, -14), Pt(-190, -90), Pt(-370, -130 + sw), Pt(-360, -96 + sw), Pt(-190, -54), Pt(0, 10)], { seed: sd + 41, t, amp: 1 }));
          set(coma, inkCircle(cx, cy, 70 + Math.sin(lt * 3) * 4, sd + 42, t, { fill: true }));
          set(nuc, inkCircle(cx, cy, 30, sd + 43, t, { fill: true }));
          set(nucR, inkCircle(cx, cy, 30, sd + 44, t, { w: 5 }));
          ex.update(lt, t, cues);
        },
      };
    },
  };
})();
