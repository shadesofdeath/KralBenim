// "Ampul": the channel mascot (the logo's light bulb with a question mark), drawn in SVG.
// Scenes opt in with "mascot": "think" | "shock" | "happy" | "point" | "explain" | "sad"
// or {"pose": "shock", "size": "big"|"small", "side": "right"|"left", "dir": "left"|"right"|"down"}.
// The mouth flaps with the narration (word start times), eyes blink, the body bobs.
'use strict';

const MASCOT = (() => {
  let svg, root, body, glass, qmark, qdot, eyes, pupils, lids, arcs, mouth, cheeks, rays, armL, armR, handL, handR, halo;
  const AMBER = '#d9a441', WHITE = '#f5f5f7';

  function init(node) {
    svg = node;
    const defs = el(svg, 'defs');
    const g1 = el(defs, 'radialGradient', { id: 'mGlow', cx: '50%', cy: '42%', r: '60%' });
    el(g1, 'stop', { offset: '0', 'stop-color': AMBER, 'stop-opacity': '.55' });
    el(g1, 'stop', { offset: '.6', 'stop-color': AMBER, 'stop-opacity': '.12' });
    el(g1, 'stop', { offset: '1', 'stop-color': AMBER, 'stop-opacity': '0' });
    const g2 = el(defs, 'radialGradient', { id: 'mHalo', cx: '50%', cy: '50%', r: '50%' });
    el(g2, 'stop', { offset: '0', 'stop-color': AMBER, 'stop-opacity': '.35' });
    el(g2, 'stop', { offset: '1', 'stop-color': AMBER, 'stop-opacity': '0' });
    root = el(svg, 'g');
    halo = el(root, 'circle', { cx: 0, cy: -30, r: 170, fill: 'url(#mHalo)' });
    rays = el(root, 'g', { stroke: AMBER, 'stroke-width': 11, 'stroke-linecap': 'round' });
    for (const a of [-158, -122, -90, -58, -22]) {
      const r = a * Math.PI / 180;
      el(rays, 'line', { x1: Math.cos(r) * 138, y1: -30 + Math.sin(r) * 138, x2: Math.cos(r) * 166, y2: -30 + Math.sin(r) * 166 });
    }
    body = el(root, 'g');
    armL = el(body, 'path', { fill: 'none', stroke: WHITE, 'stroke-width': 10, 'stroke-linecap': 'round' });
    armR = el(body, 'path', { fill: 'none', stroke: WHITE, 'stroke-width': 10, 'stroke-linecap': 'round' });
    handL = el(body, 'circle', { r: 11, fill: WHITE });
    handR = el(body, 'circle', { r: 11, fill: WHITE });
    el(body, 'rect', { x: -46, y: 76, width: 92, height: 22, rx: 10, fill: '#8d8d93' });
    el(body, 'rect', { x: -40, y: 103, width: 80, height: 20, rx: 9, fill: '#8d8d93' });
    el(body, 'path', { d: 'M -20 127 H 20 L 12 141 H -12 Z', fill: '#5d5d63' });
    const G = 'M -46 70 C -50 50 -60 40 -72 26 C -96 -2 -100 -46 -78 -80 C -58 -112 -26 -124 0 -124 C 26 -124 58 -112 78 -80 C 100 -46 96 -2 72 26 C 60 40 50 50 46 70 Z';
    el(body, 'path', { d: G, fill: '#121216' });
    glass = el(body, 'path', { d: G, fill: 'url(#mGlow)' });
    el(body, 'path', { d: G, fill: 'none', stroke: WHITE, 'stroke-width': 13, 'stroke-linejoin': 'round' });
    el(body, 'path', { d: 'M -58 -66 C -48 -88 -30 -100 -12 -104', fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 6, 'stroke-linecap': 'round' });
    qmark = el(body, 'path', { d: 'M -24 -62 C -24 -84 -8 -96 6 -96 C 24 -96 36 -84 36 -68 C 36 -52 24 -44 14 -38 C 6 -33 4 -26 4 -14',
      fill: 'none', stroke: AMBER, 'stroke-width': 13, 'stroke-linecap': 'round', style: `filter: drop-shadow(0 0 8px ${AMBER})` });
    qdot = el(body, 'circle', { cx: 4, cy: 4, r: 8, fill: AMBER, style: `filter: drop-shadow(0 0 8px ${AMBER})` });
    cheeks = [el(body, 'ellipse', { cx: -56, cy: 30, rx: 13, ry: 7, fill: '#e07a6c', opacity: .6 }),
              el(body, 'ellipse', { cx: 56, cy: 30, rx: 13, ry: 7, fill: '#e07a6c', opacity: .6 })];
    eyes = [el(body, 'ellipse', { cx: -40, cy: 8, rx: 10, ry: 15, fill: WHITE }),
            el(body, 'ellipse', { cx: 40, cy: 8, rx: 10, ry: 15, fill: WHITE })];
    pupils = [el(body, 'circle', { cx: -40, cy: 8, r: 6, fill: '#121216' }), el(body, 'circle', { cx: 40, cy: 8, r: 6, fill: '#121216' })];
    arcs = [el(body, 'path', { d: 'M -52 12 Q -40 -4 -28 12', fill: 'none', stroke: WHITE, 'stroke-width': 7, 'stroke-linecap': 'round' }),
            el(body, 'path', { d: 'M 28 12 Q 40 -4 52 12', fill: 'none', stroke: WHITE, 'stroke-width': 7, 'stroke-linecap': 'round' })];
    mouth = el(body, 'path', { fill: '#121216', stroke: WHITE, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  }

  const POSES = {
    idle:    { eye: 'oval', mouth: 'smile', arms: 'down' },
    explain: { eye: 'oval', mouth: 'talk', arms: 'open' },
    think:   { eye: 'look', mouth: 'flat', arms: 'chin' },
    shock:   { eye: 'wide', mouth: 'o', arms: 'up' },
    happy:   { eye: 'arc', mouth: 'grin', arms: 'wave' },
    point:   { eye: 'oval', mouth: 'smile', arms: 'point' },
    sad:     { eye: 'oval', mouth: 'frown', arms: 'down' },
  };

  // st: {pose, x, y, scale, alpha, t, lt, enter, talk, dir}
  function update(st) {
    if (!svg) return;
    svg.style.opacity = st.alpha;
    if (st.alpha <= 0.001) return;
    const P = POSES[st.pose] || POSES.idle, t = st.t, lt = st.lt;
    const sz = 300 * st.scale;
    svg.style.width = svg.style.height = sz + 'px';
    const en = st.enter;
    // entrance: pop + drop in, then idle bob; shock jumps & shakes, happy bounces
    let bob = Math.sin(t * 2.4) * 6, rot = Math.sin(t * 1.3) * 3, sq = 1;
    if (st.pose === 'shock') { const j = punch(lt, 0.15, 0.9); bob -= 40 * j; rot += Math.sin(lt * 60) * 6 * j; sq = 1 + 0.12 * j; }
    if (st.pose === 'happy') { const b = Math.abs(Math.sin(lt * 7)); bob -= 18 * b; sq = 1 + 0.05 * b; }
    if (st.pose === 'think') rot += 8;
    svg.style.left = (st.x - sz / 2) + 'px';
    svg.style.top = (st.y - sz / 2 + (1 - en) * 160) + 'px';
    root.setAttribute('transform', `translate(0 ${bob}) rotate(${rot} 0 40) scale(${lerp(0.3, 1, en) / sq} ${lerp(0.3, 1, en) * sq})`);
    // light: glows with speech, flares on shock
    const talk = st.talk || 0, flare = st.pose === 'shock' ? punch(lt, 0.15, 1.2) : 0;
    glass.style.opacity = 0.65 + 0.35 * Math.sin(t * 3) * 0.5 + talk * 0.3 + flare;
    halo.setAttribute('r', 150 + 20 * Math.sin(t * 2) + 60 * flare);
    rays.style.opacity = 0.55 + 0.45 * Math.sin(t * 4) + flare;
    rays.setAttribute('transform', `translate(0 -30) scale(${1 + 0.06 * Math.sin(t * 4) + 0.25 * flare}) translate(0 30)`);
    qmark.style.opacity = qdot.style.opacity = st.pose === 'think' ? 0.6 + 0.4 * Math.sin(t * 6) : 1;
    // eyes
    const blink = (t % 3.3) < 0.11 ? 0.1 : 1;
    const wide = P.eye === 'wide';
    const look = P.eye === 'look' ? [8, -8] : st.dir === 'left' ? [-5, 0] : st.dir === 'right' ? [5, 0] : [0, 0];
    eyes.forEach((e, i) => {
      e.style.display = P.eye === 'arc' ? 'none' : '';
      e.setAttribute('rx', wide ? 16 : 10);
      e.setAttribute('ry', (wide ? 18 : 15) * blink);
      pupils[i].style.display = (P.eye === 'arc' || blink < 1) ? 'none' : '';
      pupils[i].setAttribute('r', wide ? 5 : 6);
      pupils[i].setAttribute('cx', (i ? 40 : -40) + look[0]);
      pupils[i].setAttribute('cy', 8 + look[1]);
      arcs[i].style.display = P.eye === 'arc' ? '' : 'none';
    });
    cheeks.forEach(c => c.setAttribute('opacity', P.eye === 'arc' ? 0.85 : 0.55));
    // mouth
    let m;
    const open = P.mouth === 'talk' || talk > 0 ? 4 + 14 * talk : 0;
    if (P.mouth === 'o') m = 'M -12 36 C -12 22 12 22 12 36 C 12 50 -12 50 -12 36 Z';
    else if (P.mouth === 'grin') m = 'M -24 30 Q 0 30 24 30 Q 20 52 0 52 Q -20 52 -24 30 Z';
    else if (P.mouth === 'flat') m = `M -12 ${36 + open * 0.2} Q 0 ${34 + open * 0.6} 12 ${36 + open * 0.2}`;
    else if (P.mouth === 'frown') m = 'M -14 42 Q 0 30 14 42';
    else if (open > 1) m = `M -16 32 Q 0 ${36 + open * 0.3} 16 32 Q 12 ${34 + open} 0 ${34 + open} Q -12 ${34 + open} -16 32 Z`;
    else m = 'M -16 32 Q 0 46 16 32';
    mouth.setAttribute('d', m);
    mouth.setAttribute('fill', /Z$/.test(m) ? '#121216' : 'none');
    // arms (shoulders at ±78, 4)
    const wv = Math.sin(lt * 9) * 18;
    const A = {
      down:  [[-110, 60, -118, 76], [110, 60, 118, 76]],
      open:  [[-128, 10 + Math.sin(t * 3) * 8, -136, 0], [128, 10 - Math.sin(t * 3) * 8, 136, 0]],
      chin:  [[-110, 60, -118, 76], [70, 70, 30, 56]],
      up:    [[-122, -70, -128, -88], [122, -70, 128, -88]],
      wave:  [[-110, 60, -118, 76], [124, -50 + wv, 130, -68 + wv]],
      point: st.dir === 'left' ? [[-150, -10, -168, -14], [110, 60, 118, 76]]
           : st.dir === 'down' ? [[-110, 60, -118, 76], [100, 120, 106, 140]] : [[-110, 60, -118, 76], [150, -10, 168, -14]],
    }[P.arms];
    const [l, r] = A;
    armL.setAttribute('d', `M -76 6 Q ${(l[0] - 76) / 2 - 10} ${l[1] / 2 + 14} ${l[2]} ${l[3]}`);
    armR.setAttribute('d', `M 76 6 Q ${(r[0] + 76) / 2 + 10} ${r[1] / 2 + 14} ${r[2]} ${r[3]}`);
    handL.setAttribute('cx', l[2]); handL.setAttribute('cy', l[3]);
    handR.setAttribute('cx', r[2]); handR.setAttribute('cy', r[3]);
  }
  return { init, update };
})();
