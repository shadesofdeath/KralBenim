// an_cage: a "rumour cloud" (parchment ink, brand/kit/BRAND.md §3, §5; every line boils at 8 Hz via _ink.js; pure
// function of (seed, lt), no Math.random). Written for 02-ankara-savasi-1402 (the iron-cage legend of Bayezid), but
// parametric: any "is this story true?" moment. 16:9 first; portrait scales the same layout. Needs mcB__lib.js (MCB).
// A big scalloped cloud outlined with marching dashes (ink-soft) and filled paper-light, thought bubbles rising to it
// from the narrator's head; inside: an ox walking in place pulling a cart (wheels turn, ground ticks scroll, the cart
// sways) with an iron-barred cage on it and a seated period figure behind the bars.
//   cue `q`: a big red "?" rubber stamp (ring + Fraunces "?") slams onto the cloud's top-right edge (camera punch).
//   cue `fade` (optional): the dashes scatter outwards and the cloud contents shrink away.
// P: {cloud: {x: 0.55, y: 0.48, w: 0.62, h: 0.62} (0..1 of W/H), cart: true, ox: true,
//     figure: {accessory: "turban", beard: "black", emotion: "worried"} | false,
//     q: cue (default "q"), fade: cue | false, label: {text: "rivayet", at, color: "soft"|"ink"|"red", size: 66} | false,
//     bubbles: true (thought bubbles from the narrator to the cloud),
//     kasif: {x: 0.12, y: 0.82, scale: 0.62, pose: "think", face: "right", at, then, emotion, seq} (MCB cast entry) | false,
//     cast: [...MCB cast], labels: [...MCB labels], cam: {zoom: 1.05, focus: [0.5, 0.5]}}
// cues: q, fade, plus label/kasif/cast "at" names.
'use strict';

(() => {
  const SH = window.SHOTS || (window.SHOTS = {});
  const f1 = v => Math.round(v * 10) / 10;
  const COLS = { soft: INK.inkSoft, ink: INK.ink, red: INK.red, blue: INK.blue, gold: INK.gold };

  // closed polyline -> list of dash polylines (arc-length dashes, offset marches along the outline)
  function dashes(pts, dash, gap, off) {
    const n = pts.length, cum = [0];
    for (let i = 1; i <= n; i++) { const a = pts[i - 1], b = pts[i % n]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
    const L = cum[n], per = dash + gap, out = [];
    const at = d => {
      d = ((d % L) + L) % L;
      let lo = 0, hi = n;
      while (lo < hi - 1) { const m = (lo + hi) >> 1; if (cum[m] <= d) lo = m; else hi = m; }
      const a = pts[lo], b = pts[(lo + 1) % n], u = (d - cum[lo]) / Math.max(1e-6, cum[lo + 1] - cum[lo]);
      return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
    };
    const s0 = ((off % per) + per) % per;
    for (let s = s0 - per; s < L - 1; s += per) {
      const a = Math.max(0, s), b = Math.min(L - 1, s + dash);
      if (b - a < 6) continue;
      const k = Math.max(2, Math.ceil((b - a) / 10)), seg = [];
      for (let j = 0; j <= k; j++) seg.push(at(lerp(a, b, j / k)));
      out.push({ seg, mid: (a + b) / 2 / L });
    }
    return out;
  }

  SH.an_cage = {
    kind: '2d',
    build(ctx) {
      const { P, W, H, svg, seed } = ctx;
      const { atOr, cast, labels, camPush } = window.MCB;
      const sd = seed * 1000 + 5150, portrait = H > W;
      const CL = Object.assign(portrait ? { x: 0.5, y: 0.42, w: 0.9, h: 0.36 } : { x: 0.55, y: 0.48, w: 0.62, h: 0.62 }, P.cloud || {});
      const CX = CL.x * W, CY = CL.y * H, RX = CL.w * W / 2, RY = CL.h * H / 2;
      const k = Math.min(RY / 335, RX / 595 * 1.15);       // content scale (1 at the 16:9 default)
      const root = el(svg, 'g'), cam = el(root, 'g');
      const bubG = el(cam, 'g'), cloudG = el(cam, 'g');
      const L = {
        fill: inkEl(cloudG, INK.paperLight), dash: inkEl(cloudG, INK.inkSoft),
        bubF: inkEl(bubG, INK.paperLight), bub: inkEl(bubG, INK.inkSoft),
      };
      const inner = el(cloudG, 'g');
      const ground = inkEl(inner, INK.inkSoft);
      const oxF = inkEl(inner, INK.paperDark), oxL = inkEl(inner), oxD = inkEl(inner, INK.ink);
      const sway = el(inner, 'g');
      const cageBack = inkEl(sway, INK.paperDark, { 'fill-opacity': 0.55 });
      const figG = el(sway, 'g');
      const bars = inkEl(sway, INK.ink), frameF = inkEl(sway, INK.inkSoft), frameL = inkEl(sway);
      const platF = inkEl(sway, INK.hat), platL = inkEl(sway), pole = inkEl(sway);
      const wheels = inkEl(inner, INK.ink), hubs = inkEl(inner, INK.paperLight);
      const castG = el(cam, 'g');
      const stampG = el(root, 'g'), stampRing = inkEl(stampG, INK.red);
      const stampTx = el(stampG, 'text', { x: 0, y: 0, 'font-family': 'Fraunces, Georgia, serif', 'font-weight': 900, 'font-size': Math.round(250 * k),
        'text-anchor': 'middle', 'dominant-baseline': 'central', fill: INK.red });
      stampTx.textContent = '?';
      let lab = null;
      if (P.label !== false) {
        const LB = Object.assign({ text: 'rivayet', size: 66, color: 'soft' }, P.label || {});
        const tx = el(cloudG, 'text', { x: 0, y: 0, 'font-family': INK_FONT, 'font-size': Math.max(44, LB.size), 'text-anchor': 'middle', fill: COLS[LB.color] || INK.inkSoft });
        tx.textContent = LB.text;
        lab = { LB, tx, u: inkEl(cloudG, COLS[LB.color] || INK.inkSoft) };
      }
      // figure in the cage (period figure, hatless)
      const FIG = P.figure === false ? null : Object.assign({ accessory: 'turban', beard: 'black', emotion: 'worried' }, P.figure || {});
      const fig = FIG ? KASIF.create(figG, { scale: 0.5 * k, hat: false, accessory: FIG.accessory || null, beard: FIG.beard || null, seed: seed + 77 }) : null;
      // narrator + cast
      const castList = (P.cast || []).slice();
      if (P.kasif !== false) castList.push(Object.assign({ who: 'kasif', x: portrait ? 0.16 : 0.12, y: portrait ? 0.86 : 0.82, scale: portrait ? 0.8 : 0.62, pose: 'think', face: 'right' }, P.kasif || {}));
      const cs = cast(castG, castList, W, H, sd + 300);
      const lb = labels(el(root, 'g'), P.labels, W, H, sd + 500);
      const KZ = castList.find(m => (m.who || 'kasif') === 'kasif');

      // scalloped cloud outline (fixed shape per seed)
      const NB = 15, cloudPts = [];
      const r0 = rng(sd + 3);
      const bumpK = Array.from({ length: NB }, () => 0.85 + r0() * 0.35);
      for (let i = 0; i < 240; i++) {
        const a = i / 240 * Math.PI * 2, bi = Math.floor((a / (Math.PI * 2)) * NB) % NB;
        const r = 1 - 0.07 + 0.09 * bumpK[bi] * Math.abs(Math.sin(a * NB / 2));
        cloudPts.push([Math.cos(a) * RX * r, Math.sin(a) * RY * r]);
      }

      return {
        update(lt, dur, cues, env = {}) {
          const t = env.t ?? lt;
          const qAt = atOr(cues, P.q ?? 'q', null);
          const fadeAt = P.fade ? atOr(cues, P.fade, null) : null;
          const hit = punch(lt, qAt, 0.6);
          const fd = fadeAt != null ? progIO(lt, fadeAt, 1.0) : 0;
          // cloud appears (spring), content shrinks on fade
          const app = spring(lt, 0.05, 0.6), sc = lerp(0.82, 1, app) * (1 + 0.025 * hit);
          cloudG.setAttribute('transform', `translate(${f1(CX)} ${f1(CY + Math.sin(lt * 0.9) * 4)}) scale(${sc.toFixed(4)})`);
          L.fill.setAttribute('d', fd < 0.98 ? inkLoop(cloudPts.map(p => [p[0] * (1 - fd), p[1] * (1 - fd)]), { seed: sd + 1, t, amp: 1.2 }) : '');
          let dd = '';
          dashes(cloudPts, 36, 22, lt * 26).forEach((d, i) => {
            const m = d.seg[(d.seg.length >> 1)], push = fd * 160;
            const nx = m[0] / RX, ny = m[1] / RY, nl = Math.hypot(nx, ny) || 1;
            const seg = fd > 0 ? d.seg.map(p => [p[0] + nx / nl * push, p[1] + ny / nl * push]) : d.seg;
            if (fd < 0.95) dd += inkPath(seg, { w: 6.5 * (1 - fd * 0.6), seed: sd + 20 + i, t, amp: 1.2 }) + ' ';
          });
          L.dash.setAttribute('d', dd);
          // content (cloud-local coords, origin = cloud centre)
          inner.setAttribute('transform', `scale(${Math.max(0.01, 1 - fd).toFixed(3)})`);
          const GL = 0.52 * RY, cartX = -0.12 * RX, oxX = 0.42 * RX, wr = 62 * k, ax = GL - wr;
          const platTop = ax - 34 * k, cg0 = cartX - 165 * k, cg1 = cartX + 135 * k, cgTop = platTop - 300 * k;
          // ground ticks scroll left (the cart rolls on)
          const gw = RX * 0.84; let gd = inkPath([[-gw, GL], [gw, GL]], { w: 4, seed: sd + 40, t, amp: 1 }) + ' ';
          for (let i = 0; i < 12; i++) {
            const x = ((i * 0.083 * 2 * gw - lt * 70 * k) % (2 * gw) + 2 * gw) % (2 * gw) - gw;
            gd += inkPath([[x, GL + 16 * k], [x + 34 * k, GL + 14 * k]], { w: 3, seed: sd + 41 + i, t, amp: 0.8 }) + ' ';
          }
          ground.setAttribute('d', P.cart === false ? '' : gd);
          // ox: walks in place
          if (P.ox !== false && P.cart !== false) {
            const by = GL - 118 * k, bob = Math.sin(lt * 10) * 3 * k;
            const body = [[oxX - 110 * k, by - 50 * k + bob], [oxX - 20 * k, by - 66 * k + bob], [oxX + 80 * k, by - 58 * k + bob], [oxX + 112 * k, by - 18 * k + bob],
              [oxX + 100 * k, by + 40 * k + bob], [oxX - 10 * k, by + 52 * k + bob], [oxX - 112 * k, by + 38 * k + bob], [oxX - 126 * k, by - 8 * k + bob]];
            const hx = oxX + 150 * k, hy = by - 6 * k + bob + Math.sin(lt * 5) * 4 * k;
            const head = [[hx - 40 * k, hy - 40 * k], [hx + 22 * k, hy - 34 * k], [hx + 52 * k, hy + 16 * k], [hx + 40 * k, hy + 44 * k], [hx - 6 * k, hy + 40 * k], [hx - 44 * k, hy + 6 * k]];
            oxF.setAttribute('d', inkLoop(body, { seed: sd + 50, t, amp: 1.2 }) + ' ' + inkLoop(head, { seed: sd + 51, t, amp: 1 }));
            let ol = inkPath(body, { w: 6 * k, seed: sd + 52, t, amp: 1.4, closed: true }) + ' ' + inkPath(head, { w: 5.5 * k, seed: sd + 53, t, amp: 1.2, closed: true });
            // horns + ear + tail
            ol += ' ' + inkPath([[hx - 22 * k, hy - 36 * k], [hx - 34 * k, hy - 70 * k], [hx - 8 * k, hy - 88 * k]], { w: 6 * k, seed: sd + 54, t, amp: 1 });
            ol += ' ' + inkPath([[hx + 6 * k, hy - 38 * k], [hx + 10 * k, hy - 74 * k], [hx + 36 * k, hy - 86 * k]], { w: 6 * k, seed: sd + 55, t, amp: 1 });
            ol += ' ' + inkPath([[hx - 44 * k, hy - 10 * k], [hx - 70 * k, hy - 18 * k]], { w: 5 * k, seed: sd + 56, t, amp: 1 });
            const tw = Math.sin(lt * 3.1) * 16 * k;
            ol += ' ' + inkPath([[oxX - 122 * k, by - 20 * k + bob], [oxX - 150 * k, by + 20 * k + bob], [oxX - 146 * k + tw, by + 64 * k + bob]], { w: 4.5 * k, seed: sd + 57, t, amp: 1 });
            // legs: walk cycle in place
            [[-80, 0], [-50, 0.5], [55, 0.25], [85, 0.75]].forEach(([dx, ph], i) => {
              const s = Math.sin((lt * 1.6 + ph) * Math.PI * 2), x0 = oxX + dx * k, y0 = by + 40 * k + bob;
              const knee = [x0 + s * 14 * k, y0 + 38 * k], foot = [x0 + s * 30 * k, GL - Math.max(0, Math.cos((lt * 1.6 + ph) * Math.PI * 2)) * 10 * k];
              ol += ' ' + inkPath([[x0, y0], knee, foot], { w: 9 * k, seed: sd + 60 + i, t, amp: 1 });
            });
            oxL.setAttribute('d', ol);
            oxD.setAttribute('d', inkDot(hx + 18 * k, hy - 8 * k, 6 * k, 6 * k, sd + 70, t) + ' ' + inkDot(hx + 40 * k, hy + 30 * k, 4 * k, 4 * k, sd + 71, t));
            pole.setAttribute('d', inkPath([[cg1 + 10 * k, platTop + 14 * k], [oxX - 60 * k, by - 10 * k + bob], [oxX + 70 * k, by - 62 * k + bob]], { w: 8 * k, seed: sd + 72, t, amp: 1 }));
          } else { oxF.setAttribute('d', ''); oxL.setAttribute('d', ''); oxD.setAttribute('d', ''); pole.setAttribute('d', ''); }
          // cart sways a little around the axle
          const rot = Math.sin(lt * 2.3) * 1.4 + Math.sin(lt * 5.1) * 0.5, bob2 = Math.abs(Math.sin(lt * 4.6)) * -4 * k;
          sway.setAttribute('transform', `translate(0 ${f1(bob2)}) rotate(${rot.toFixed(2)} ${f1(cartX)} ${f1(ax)})`);
          if (P.cart !== false) {
            const plat = [[cg0 - 18 * k, platTop], [cg1 + 18 * k, platTop], [cg1 + 12 * k, platTop + 30 * k], [cg0 - 12 * k, platTop + 30 * k]];
            platF.setAttribute('d', inkLoop(plat, { seed: sd + 80, t, amp: 1, smooth: false }));
            platL.setAttribute('d', inkPath(plat, { w: 6 * k, seed: sd + 81, t, amp: 1.2, closed: true, smooth: false }));
            const back = [[cg0, platTop], [cg0, cgTop + 20 * k], [cartX - 15 * k, cgTop - 22 * k], [cg1, cgTop + 20 * k], [cg1, platTop]];
            cageBack.setAttribute('d', inkLoop(back, { seed: sd + 82, t, amp: 1 }));
            let bd = '';
            const nb = 8;
            for (let i = 0; i <= nb; i++) {
              const x = lerp(cg0, cg1, i / nb), topY = cgTop + 20 * k - Math.sin(i / nb * Math.PI) * 42 * k;
              bd += inkPath([[x, platTop], [x, topY]], { w: (i === 0 || i === nb ? 9 : 6.5) * k, seed: sd + 90 + i, t, amp: 1.2 }) + ' ';
            }
            bars.setAttribute('d', bd);
            const roof = []; for (let i = 0; i <= 10; i++) roof.push([lerp(cg0 - 10 * k, cg1 + 10 * k, i / 10), cgTop + 20 * k - Math.sin(i / 10 * Math.PI) * 42 * k]);
            const mid = [[cg0, platTop - 150 * k], [cg1, platTop - 150 * k]];
            frameF.setAttribute('d', '');
            frameL.setAttribute('d', inkPath(roof, { w: 10 * k, seed: sd + 100, t, amp: 1.2 }) + ' ' + inkPath(mid, { w: 5 * k, seed: sd + 101, t, amp: 1 }) + ' ' +
              inkCircle(cartX - 15 * k, cgTop - 34 * k, 14 * k, sd + 102, t, { w: 5 * k }));
            // wheels (turn clockwise: the cart rolls to the right)
            let wd = '', hd = '';
            [cartX - 110 * k, cartX + 100 * k].forEach((wx, j) => {
              const wy = ax + Math.sin(lt * 4.6) * 1.5;
              wd += inkCircle(wx, wy, wr, sd + 110 + j, t, { w: 8 * k }) + ' ';
              for (let s = 0; s < 6; s++) { const a = lt * 2.2 + s / 6 * Math.PI * 2; wd += inkPath([[wx, wy], [wx + Math.cos(a) * wr * 0.92, wy + Math.sin(a) * wr * 0.92]], { w: 4.5 * k, seed: sd + 120 + j * 10 + s, t, amp: 0.8 }) + ' '; }
              hd += inkCircle(wx, wy, 11 * k, sd + 140 + j, t, { fill: true }) + ' ';
              wd += inkCircle(wx, wy, 11 * k, sd + 142 + j, t, { w: 4 * k }) + ' ';
            });
            wheels.setAttribute('d', wd); hubs.setAttribute('d', hd);
          }
          if (fig) fig.update(t, 'sit', { x: cartX - 10 * k, y: platTop, face: 1, since: lt, emotion: FIG.emotion || 'worried' });
          // thought bubbles from the narrator's head to the cloud
          if (P.bubbles !== false && KZ) {
            const kx = KZ.x * W + (KZ.face === 'left' ? -40 : 50), ky = (KZ.y ?? 0.82) * H - (KZ.scale ?? 0.62) * 560;
            const ex = CX - RX * 0.93, ey = CY + RY * 0.22;
            let bf = '', bl = '';
            [0.2, 0.5, 0.8].forEach((u, i) => {
              const p = spring(lt, 0.1 + i * 0.15, 0.4); if (p < 0.02) return;
              const r = (12 + i * 9) * p * (1 + 0.06 * Math.sin(lt * 3 + i)), x = lerp(kx, ex, u), y = lerp(ky, ey, u) - Math.sin(u * Math.PI) * 40;
              bf += inkCircle(x, y, r, sd + 150 + i, t, { fill: true }) + ' ';
              bl += inkCircle(x, y, r, sd + 155 + i, t, { w: 4.5 }) + ' ';
            });
            L.bubF.setAttribute('d', fd > 0.5 ? '' : bf); L.bub.setAttribute('d', fd > 0.5 ? '' : bl);
          }
          if (lab) {
            const a = atOr(cues, lab.LB.at, 0.5), p = spring(lt, a, 0.5);
            lab.tx.style.display = lt < a ? 'none' : '';
            const lx = -0.62 * RX, ly = -0.42 * RY, b = boil(sd + 160, t, 1);
            lab.tx.setAttribute('transform', `translate(${f1(lx + b[0])} ${f1(ly + b[1])}) rotate(-6) scale(${Math.max(0.01, p).toFixed(3)})`);
            let w = 200; try { w = lab.tx.getComputedTextLength(); } catch (e) {}
            lab.u.setAttribute('d', lt < a + 0.2 ? '' : inkPath([[lx - w / 2, ly + 22], [lx - w / 2 + w * prog(lt, a + 0.2, 0.4), ly + 16]].map(q => {
              const c = Math.cos(-6 * Math.PI / 180), s = Math.sin(-6 * Math.PI / 180), dx = q[0] - lx, dy = q[1] - ly; return [lx + dx * c - dy * s, ly + dx * s + dy * c]; }), { w: 4, seed: sd + 161, t, amp: 1 }));
          }
          // red "?" rubber stamp
          if (qAt != null && lt >= qAt) {
            stampG.style.display = '';
            const p = spring(lt, qAt, 0.45), s = lerp(1.9, 1, clamp01(p)) * (1 + 0.08 * hit);
            const sx = CX + 0.66 * RX * sc, sy = CY - 0.78 * RY * sc;
            stampG.setAttribute('transform', `translate(${f1(sx)} ${f1(sy)}) rotate(-9) scale(${s.toFixed(3)})`);
            stampG.setAttribute('opacity', clamp01(p * 3).toFixed(3));
            stampRing.setAttribute('d', inkCircle(0, 0, 150 * k, sd + 170, t, { w: 11 * k }) + ' ' + inkCircle(0, 0, 128 * k, sd + 171, t, { w: 4.5 * k }));
            stampTx.setAttribute('x', f1(boil(sd + 172, t, 1)[0])); stampTx.setAttribute('y', f1(10 * k));
          } else stampG.style.display = 'none';
          cs.update(lt, t, cues);
          camPush(cam, lt, dur, W, H, P.cam || { zoom: 1.05, focus: [0.5, 0.5] }, hit);
          lb.update(lt, t, cues);
        },
      };
    },
  };
})();
