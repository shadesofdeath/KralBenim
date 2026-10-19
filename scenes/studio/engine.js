// Studio engine: timeline -> frames. window.init(timeline), window.seek(t), window.cover(c).
// Layers (back to front): art background (canvas) · 3D (WebGL) · 2D shots · 3D labels · light leak ·
// vignette · flash · HUD (kicker, captions, mascot, brand) · cover text.
'use strict';

let D, S = [], W, H, R3, BGX, WORDS = [], glDirty = false;
let PARCH = false, PAPER = null, PCAP = null, PBRAND = null, BG_AT = { i: 0, prev: -1, p: 1 };   // theme "parchment" (parchment-theme.js)
const $ = id => document.getElementById(id);

function makeLabels(container) {
  const box = div(container, 'lblset');
  box.style.cssText = 'position:absolute;inset:0;display:none';
  const svg = el(box, 'svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
  return {
    box,
    add(kind) {
      const d = div(box, 'lbl');
      const ln = el(svg, 'path', { fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0, pathLength: 1 });
      const dot = el(svg, 'circle', { r: 8, fill: '#fff', opacity: 0 });
      return {
        // html at stage px (x, y); anchor = [sx, sy] screen point the leader line points to (layer labels)
        set(html, x, y, alpha, anchor, grow = 1) {
          if (d._h !== html) { d.innerHTML = html; d._h = html; }
          d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.opacity = alpha;
          if (anchor && kind === 'layer') {
            const w = d.offsetWidth / 2 + 14, side = anchor[0] > x ? 1 : -1;
            const sx = x + side * w, sy = y;
            ln.setAttribute('d', `M${sx} ${sy} L${(sx + anchor[0]) / 2} ${sy} L${anchor[0]} ${anchor[1]}`);
            draw(ln, clamp01(grow));
            ln.style.opacity = alpha;
            dot.setAttribute('cx', anchor[0]); dot.setAttribute('cy', anchor[1]);
            dot.setAttribute('opacity', alpha * clamp01(grow * 2 - 1));
          }
        },
      };
    },
  };
}

function makeKicker(sc, pal) {
  if (PARCH) { const pk = PARCHMENT.kicker($('kickers'), W, H, sc.title || {}); return { k: pk.node, words: pk.words, pk }; }
  const k = div($('kickers'), 'kicker');
  const ti = sc.title || {};
  if (!ti.white && !ti.gray) { k.style.display = 'none'; return { k, words: [] }; }
  div(k, 'bar');
  const tx = div(k, 'tx');
  const words = [];
  for (const [cls, txt] of [['w', ti.white || ''], ['g', ti.gray || '']])
    for (const wd of txt.split(/\s+/).filter(Boolean)) {
      const s = document.createElement('span'); s.className = 'wd ' + cls; s.textContent = wd; tx.appendChild(s); words.push(s);
    }
  return { k, words };
}

window.init = async (data) => {
  D = data;
  [W, H] = D.size;
  const root = document.documentElement;
  root.classList.add(D.format || 'short');
  PARCH = D.theme === 'parchment';
  if (PARCH) root.classList.add('parchment');
  $('brand').querySelector('span').textContent = D.channel || '';
  THREE.ColorManagement.enabled = false;

  const bg = $('bg'); bg.width = W / 2; bg.height = H / 2; BGX = bg.getContext('2d');
  if (PARCH) PAPER = PARCHMENT.background(bg, W, H, { scale: 0.5 });
  R3 = new THREE.WebGLRenderer({ canvas: $('gl'), antialias: D.gl_aa !== false, alpha: true, preserveDrawingBuffer: true });
  R3.setPixelRatio(devicePixelRatio * (D.gl_scale || 1));
  R3.setSize(W, H, false);
  R3.setClearColor(0x000000, 0);
  R3.outputColorSpace = THREE.SRGBColorSpace;
  MASCOT.init($('mascot'));
  // shots measure text while building: fonts must be ready first
  await Promise.all(['400 100px Anton', '800 100px Inter', '900 100px Inter', '700 100px Inter',
    '900 100px Fraunces', '800 100px Fraunces', '700 100px Lora', '400 100px "Patrick Hand"'].map(f => document.fonts.load(f, 'AĞİŞÇÖÜ0123')));

  S = D.scenes.map((sc, i) => {
    const shot = SHOTS[sc.type];
    if (!shot) throw new Error('unknown studio shot type: ' + sc.type);
    const P = sc.params || {};
    const pal = PARCH ? Object.assign({}, THEME_PARCHMENT.pal, ((sc.art || D.art || {}).colors) || {}) : palette(sc.art || D.art);
    const o = { sc, i, P, pal, kind: shot.kind, dur: sc.end - sc.start, kick: makeKicker(sc, pal) };
    if (shot.kind === '3d') {
      o.scene = new THREE.Scene();
      o.camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 300);
      o.labels = makeLabels($('labels'));
      o.inst = shot.build({ P, pal, W, H, scene: o.scene, camera: o.camera, labels: o.labels, renderer: R3, seed: i + 1, theme: D.theme });
    } else {
      o.el = div($('shots'), 'shot');
      o.el.style.cssText = 'position:absolute;inset:0;visibility:hidden';   // laid out while building (text measuring)
      o.svg = el(o.el, 'svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` });
      o.svg.style.cssText = 'position:absolute;left:0;top:0';
      const defs = el(o.svg, 'defs');
      o.inst = shot.build({ P, pal, W, H, root: o.el, svg: o.svg, defs, seed: i + 1, theme: D.theme });
      o.el.style.display = 'none'; o.el.style.visibility = '';
    }
    return o;
  });
  // continuity: consecutive 3D shots of the same world continue the camera (match cut)
  S.forEach((o, i) => {
    const prev = S[i - 1];
    const same = prev && prev.kind === '3d' && o.kind === '3d' && prev.sc.type === o.sc.type && (prev.P.preset || '') === (o.P.preset || '');
    o.env = { prevP: same ? prev.P : null, prevCam: same && prev.endCam ? prev.endCam : null };
    o.endCam = o.inst.camAt ? o.inst.camAt(o.dur, o.dur, o.env) : null;
    o.trans = i === 0 ? 'cut' : (o.sc.transition || (same ? 'match' : ['zoom', 'whip', 'flash', 'zoom'][i % 4]));
    // parchment: no zoom/whip/white flash; paper slide or a soft cross-dissolve instead
    if (PARCH && i > 0) o.trans = { zoom: 'slide', whip: 'slide', flash: 'fade' }[o.trans] || o.trans;
    if (PARCH && i > 0 && !o.sc.transition && !same) o.trans = i % 3 === 2 ? 'fade' : 'slide';
    // cue times that belong to this scene (captions colour these words)
    o.cueTimes = Object.values(o.sc.cues || {});
  });
  for (const c of D.captions) for (const w of c.words) WORDS.push(w);
  if (PARCH) {
    const keys = S.flatMap(s => s.cueTimes);
    const groups = D.captions.map(c => ({ start: c.start, end: c.end, words: c.words.map(w => {
      const so = S[sceneAt(w.t)], key = keys.some(kt => Math.abs(kt - w.t) < 0.01);
      return { t: w.t, text: w.text, cue: key ? (so && so.P.caption_color === 'red' ? 'red' : true) : false };
    }) }));
    PCAP = PARCHMENT.captions($('kickers'), W, H, groups);
    PBRAND = PARCHMENT.brand($('kickers'), W, H, D.channel || '');
  }

  await document.fonts.ready;
  await window.seek(0);
  return true;
};

// ------------------------------------------------------------ background art
function drawBg(t, pal) {
  if (PARCH) return PAPER.update(t, BG_AT.i, BG_AT.prev, BG_AT.p);   // parchment-theme.js
  const w = BGX.canvas.width, h = BGX.canvas.height;
  const g = BGX.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, pal.bg[0]); g.addColorStop(1, pal.bg[1]);
  BGX.globalCompositeOperation = 'source-over';
  BGX.fillStyle = g; BGX.fillRect(0, 0, w, h);
  BGX.globalCompositeOperation = 'screen';
  const gx = w * (0.5 + 0.18 * Math.sin(t * 0.21)), gy = h * (0.4 + 0.08 * Math.cos(t * 0.17));
  let rg = BGX.createRadialGradient(gx, gy, 0, gx, gy, Math.max(w, h) * 0.65);
  rg.addColorStop(0, rgba(pal.glow, 0.42)); rg.addColorStop(1, rgba(pal.glow, 0));
  BGX.fillStyle = rg; BGX.fillRect(0, 0, w, h);
  const bx = w * (0.85 - 0.1 * Math.sin(t * 0.13)), by = h * 0.92;
  rg = BGX.createRadialGradient(bx, by, 0, bx, by, Math.max(w, h) * 0.5);
  rg.addColorStop(0, rgba(pal.accent2, 0.16)); rg.addColorStop(1, rgba(pal.accent2, 0));
  BGX.fillStyle = rg; BGX.fillRect(0, 0, w, h);
  // slow light shafts
  BGX.save();
  BGX.translate(w * 0.15, -h * 0.05);
  for (let i = 0; i < 5; i++) {
    const a = 0.5 + i * 0.16 + Math.sin(t * 0.2 + i) * 0.03, L = Math.hypot(w, h) * 1.2, s = 0.035;
    BGX.beginPath(); BGX.moveTo(0, 0);
    BGX.lineTo(Math.cos(a - s) * L, Math.sin(a - s) * L); BGX.lineTo(Math.cos(a + s) * L, Math.sin(a + s) * L); BGX.closePath();
    BGX.fillStyle = rgba(pal.accent2, 0.025 + 0.015 * Math.sin(t * 0.7 + i * 2));
    BGX.fill();
  }
  BGX.restore();
  // bokeh
  const r = rng(77);
  for (let i = 0; i < 22; i++) {
    const x = r() * w, y0 = r() * h, rad = 4 + r() * 22, v = 6 + r() * 16, ph = r() * 6.28;
    const y = ((y0 - t * v) % (h + 60) + h + 60) % (h + 60) - 30;
    const bg2 = BGX.createRadialGradient(x, y, 0, x, y, rad);
    const a = (0.05 + 0.08 * r()) * (0.6 + 0.4 * Math.sin(t + ph));
    bg2.addColorStop(0, rgba(i % 3 ? pal.accent2 : pal.accent, a)); bg2.addColorStop(1, rgba(pal.accent2, 0));
    BGX.fillStyle = bg2; BGX.beginPath(); BGX.arc(x + Math.sin(t * 0.5 + ph) * 8, y, rad, 0, 6.283); BGX.fill();
  }
  BGX.globalCompositeOperation = 'source-over';
}

// ------------------------------------------------------------ transitions
// returns {show, tf, op, blur} for a shot given its role around the boundary T
function transStyle(kind, role, t, T) {
  const id = { show: true, tf: '', op: 1, blur: 0 };
  if (kind === 'zoom') {
    if (role === 'out') { const p = lin(t, T - 0.16, 0.34); return { show: p < 1, tf: `scale(${1 + 0.45 * p * p})`, op: 1 - p, blur: 18 * p }; }
    const q = lin(t, T - 0.12, 0.4), e = EASE(q); return { show: q > 0, tf: `scale(${lerp(0.78, 1, e)})`, op: clamp01(q * 1.6), blur: (1 - e) * 12 };
  }
  if (kind === 'whip') {
    if (role === 'out') { const p = lin(t, T - 0.14, 0.26); return { show: p < 1, tf: `translateX(${-W * 0.8 * p * p}px)`, op: 1, blur: 34 * p }; }
    const q = lin(t, T - 0.14, 0.34), e = EASE(q); return { show: q > 0, tf: `translateX(${W * 0.8 * (1 - e)}px)`, op: 1, blur: (1 - e) * 34 };
  }
  if (kind === 'slide') {           // parchment: the sheet slides a little while the next one settles in
    if (role === 'out') { const p = lin(t, T - 0.2, 0.42), e = EASE_IO(p); return { show: p < 1, tf: `translateX(${-W * 0.07 * e}px) rotate(${-0.6 * e}deg)`, op: 1 - e, blur: 0 }; }
    const q = lin(t, T - 0.2, 0.5), e = EASE(q); return { show: q > 0, tf: `translateX(${W * 0.09 * (1 - e)}px) rotate(${0.8 * (1 - e)}deg)`, op: clamp01(q * 1.5), blur: 0 };
  }
  if (kind === 'fade') {
    if (role === 'out') { const p = lin(t, T - 0.2, 0.4); return { show: p < 1, tf: '', op: 1 - EASE_IO(p), blur: 0 }; }
    const q = lin(t, T - 0.2, 0.4); return { show: q > 0, tf: `scale(${lerp(1.02, 1, EASE(q))})`, op: EASE_IO(q), blur: 0 };
  }
  // cut / flash / match: hard switch at T (flash adds a white pop, match continues the camera)
  if (role === 'out') return { show: t < T, tf: '', op: 1, blur: 0 };
  return { show: t >= T, tf: kind === 'flash' ? `scale(${lerp(1.1, 1, prog(t, T, 0.45))})` : '', op: 1, blur: 0 };
}
const TRANS_WIN = { zoom: [0.16, 0.18], whip: [0.14, 0.12], flash: [0, 0], cut: [0, 0], match: [0, 0], slide: [0.2, 0.3], fade: [0.2, 0.2] };

function applyStyle(node, st, extraScale = 1) {
  node.style.display = st.show ? '' : 'none';
  node.style.opacity = st.op;
  node.style.transform = (st.tf || '') + (extraScale !== 1 ? ` scale(${extraScale})` : '');
  node.style.filter = st.blur > 0.3 ? `blur(${st.blur.toFixed(1)}px)` : '';
}

// draw one frame. visible = [{o, lt, st}], hook/cover handled by callers
function compose(t, visible, pal, pend, coverTf) {
  drawBg(t, pal);
  document.documentElement.style.setProperty('--accent', pal.accent);
  const gl = $('gl');
  // 3D: only one scene can own the GL canvas; prefer the one that is "in"
  const v3 = visible.filter(v => v.o.kind === '3d' && v.st.show);
  const own = v3.length ? v3[v3.length - 1] : null;
  S.forEach(o => { if (o.labels) o.labels.box.style.display = 'none'; if (o.el && !visible.some(v => v.o === o)) o.el.style.display = 'none'; });
  if (own) {
    const { o, lt, st } = own;
    o.inst.update(lt, o.dur, localCues(o), Object.assign({ t, pal: o.pal }, o.env));
    R3.render(o.scene, o.camera);
    glDirty = true;
    applyStyle(gl, st);
    if (coverTf) gl.style.transform += ' ' + coverTf;
    applyStyle(o.labels.box, st);
    if (coverTf) o.labels.box.style.transform += ' ' + coverTf;
  } else {
    if (glDirty) { R3.clear(); glDirty = false; }
    gl.style.display = 'none';
  }
  for (const v of visible) {
    if (v.o.kind !== '2d') continue;
    const { o, lt, st } = v;
    if (o.inst.pending) { const pr = o.inst.pending(lt); if (pr) pend.push(pr); }
    let pk = 0; for (const c of Object.values(localCues(o))) pk = Math.max(pk, punch(lt, c, 0.5));
    applyStyle(o.el, st, (1 + 0.025 * pk) * lerp(1, 1.035, clamp01(lt / Math.max(o.dur, 1))));
    if (coverTf) o.el.style.transform += ' ' + coverTf;
    if (st.show) o.inst.update(lt, o.dur, localCues(o), Object.assign({ t, pal: o.pal }, o.env));
  }
  if (own && own.st.show) gl.style.display = '';
  if (PARCH) return;
  // light leak
  const lx = 50 + 40 * Math.sin(t * 0.23), ly = 20 + 15 * Math.cos(t * 0.31);
  $('leak').style.background = `radial-gradient(ellipse 60% 40% at ${lx}% ${ly}%, ${rgba(pal.glow, 0.12 + 0.06 * Math.sin(t * 0.9))}, rgba(0,0,0,0) 70%)`;
}

function localCues(o) {
  if (!o._cues) { o._cues = {}; for (const k in o.sc.cues) o._cues[k] = o.sc.cues[k] - o.sc.start; }
  return o._cues;
}

// ------------------------------------------------------------ HUD
function hud(t, i, hooking) {
  const o = S[i];
  S.forEach((s, k) => {
    if (s.kick.pk) { s.kick.pk.update(k !== i || hooking ? -1 : t - s.sc.start, 1 - prog(t, s.sc.end - 0.15, 0.15)); return; }
    const node = s.kick.k;
    if (k !== i || hooking || !s.kick.words.length) { node.style.opacity = 0; return; }
    const lt = t - s.sc.start, out = 1 - prog(t, s.sc.end - 0.15, 0.15);
    node.style.opacity = out;
    node.querySelector('.bar').style.transform = `scaleY(${spring(lt, 0, 0.5)})`;
    s.kick.words.forEach((w, j) => {
      const p = spring(lt, 0.05 + j * 0.07, 0.55);
      w.style.opacity = clamp01(p * 1.6);
      w.style.transform = `translateY(${(1 - p) * 40}px)`;
    });
  });
  // captions: 1-3 words, each pops in when spoken; cue words glow in the accent colour
  if (PCAP) PCAP.update(hooking ? -1 : t);
  const cap = $('caption');
  const c = PARCH || hooking ? null : D.captions.find(c => t >= c.start && t < c.end);
  if (c) {
    if (cap._c !== c) {
      cap._c = c; cap.innerHTML = '';
      c.spans = c.words.map(w => { const s = document.createElement('span'); s.textContent = w.text; cap.appendChild(s); return s; });
    }
    const keys = S.flatMap(s => s.cueTimes);
    c.words.forEach((w, k) => {
      const next = k + 1 < c.words.length ? c.words[k + 1].t : c.end;
      const on = t >= w.t, now = on && t < next;
      const key = keys.some(kt => Math.abs(kt - w.t) < 0.01);
      const p = spring(t, w.t, 0.35);
      c.spans[k].style.visibility = on ? 'visible' : 'hidden';
      c.spans[k].style.color = key ? 'var(--accent)' : (now ? '#ffffff' : 'rgba(255,255,255,.92)');
      c.spans[k].style.transform = `translateY(${(1 - p) * 30}px) scale(${lerp(0.6, 1, p) * (now ? 1.06 : 1)})`;
    });
    const pout = 1 - prog(t, c.end - 0.08, 0.08);
    cap.style.opacity = pout;
  } else cap.style.opacity = 0;
  // mascot
  const ms = o.sc.mascot;
  const spec = ms ? (typeof ms === 'string' ? { pose: ms } : ms) : null;
  if (!spec || hooking || PARCH) MASCOT.update({ alpha: 0 });   // parchment: Kaşif replaces the bulb
  else {
    let k = i; while (k > 0 && S[k - 1].sc.mascot && ((S[k - 1].sc.mascot.size || 'small') === (spec.size || 'small'))) k--;
    const big = spec.size === 'big';
    const enter = spring(t, S[k].sc.start, 0.8);
    const nx = S[i + 1] && S[i + 1].sc.mascot;
    const out = nx ? 1 : 1 - prog(t, o.sc.end - 0.2, 0.25);
    const portrait = H > W;
    const pos = big ? [W / 2, H * (portrait ? 0.48 : 0.5)] : portrait ? [spec.side === 'left' ? 190 : W - 180, 430] : [W - 220, H - 300];
    let talk = 0;
    const wi = WORDS.findIndex((w, j) => t >= w.t && (j + 1 >= WORDS.length || t < WORDS[j + 1].t));
    if (wi >= 0) { const w = WORDS[wi], nt = WORDS[wi + 1] ? WORDS[wi + 1].t : w.t + 0.4; const d = Math.min(0.45, nt - w.t); if (t < w.t + d) talk = Math.sin((t - w.t) / d * Math.PI); }
    MASCOT.update({ pose: spec.pose || 'explain', dir: spec.dir, x: pos[0], y: pos[1], scale: big ? (portrait ? 2.0 : 1.6) : (portrait ? 0.82 : 0.75),
      alpha: out, enter, t, lt: t - o.sc.start, talk });
  }
  $('brand').style.opacity = 1;
  $('bar').style.width = (100 * clamp01(t / D.duration)) + '%';
}

// ------------------------------------------------------------ seek
function sceneAt(t) { let i = 0; while (i + 1 < S.length && t >= S[i + 1].sc.start) i++; return i; }

function renderNormal(t, pend) {
  const i = sceneAt(t), o = S[i];
  const vis = [];
  const T = o.sc.start;
  const prev = S[i - 1];
  if (prev && t < T + TRANS_WIN[o.trans][1] + 0.2) vis.push({ o: prev, lt: t - prev.sc.start, st: transStyle(o.trans, 'out', t, T) });
  vis.push({ o, lt: t - T, st: i === 0 ? { show: true, tf: '', op: 1, blur: 0 } : transStyle(o.trans, 'in', t, T) });
  const nx = S[i + 1];
  if (nx && t >= nx.sc.start - TRANS_WIN[nx.trans][0] - 0.01) {
    vis[vis.length - 1].st = transStyle(nx.trans, 'out', t, nx.sc.start);
    vis.push({ o: nx, lt: t - nx.sc.start, st: transStyle(nx.trans, 'in', t, nx.sc.start) });
  }
  let pal = o.pal;
  if (prev) pal = mixPal(prev.pal, o.pal, prog(t, T - 0.2, 0.8));
  BG_AT = { i, prev: prev ? i - 1 : -1, p: prev ? prog(t, T - 0.2, 0.6) : 1 };
  compose(t, vis, pal, pend);
  const fl = o.trans === 'flash' ? 0.75 * Math.exp(-Math.max(0, t - T) * 9) * (t >= T ? 1 : 0) : 0;
  const hookFlash = D.hook ? 0.6 * Math.exp(-Math.max(0, t - D.hook.end) * 9) * (t >= D.hook.end ? 1 : 0) : 0;
  $('flash').style.opacity = PARCH ? 0 : Math.max(fl, hookFlash);
  hud(t, i, false);
}

function renderSolo(t, idx, lt, pend, coverTf) {
  const o = S[idx];
  BG_AT = { i: idx, prev: -1, p: 1 };
  compose(t, [{ o, lt, st: { show: true, tf: '', op: 1, blur: 0 } }], o.pal, pend, coverTf);
  $('flash').style.opacity = 0;
}

function buildCoverText(c) {
  const hl = (c.highlight || []).map(w => w.toLocaleUpperCase('tr-TR'));
  const box = $('covertext');
  box.innerHTML = '';
  for (const ln of c.lines || []) {
    const row = document.createElement('span'); row.className = 'line';
    for (const w of ln.split(/\s+/)) {
      const sp = document.createElement('span');
      sp.textContent = w + ' ';
      if (hl.includes(w.toLocaleUpperCase('tr-TR').replace(/[?!.,:]/g, ''))) sp.className = 'hl';
      row.appendChild(sp);
    }
    box.appendChild(row);
  }
  box.style.fontSize = '';
  let fs = parseFloat(getComputedStyle(box).fontSize);
  while (fs > 70 && [...box.querySelectorAll('.line')].some(l => l.scrollWidth > box.clientWidth + 2 || l.offsetHeight > fs * 1.5)) {
    fs -= 6; box.style.fontSize = fs + 'px';
  }
  return box;
}
// parchment cover: a big Kaşif (shock/point) next to the title when the Kaşif module (shots/kasif.js) is loaded.
// cover.kasif: false | "shock" | {pose, x, y (ground point, stage px), scale, face: 1|-1, emotion, dir}
function coverKasif(c, lt) {
  const node = $('kasifcover');
  node.innerHTML = '';
  if (!PARCH || c.kasif === false || typeof KASIF === 'undefined' || !KASIF || typeof KASIF.create !== 'function') return;
  node.setAttribute('width', W); node.setAttribute('height', H); node.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const portrait = H > W, k = typeof c.kasif === 'object' ? c.kasif : { pose: c.kasif };
  const pose = k.pose || 'shock';
  try {
    const g = el(node, 'g');
    const rig = KASIF.create(g, { scale: k.scale ?? (portrait ? 1.15 : 0.95), seed: 7 });
    rig.update(2 + lt, pose, { x: k.x ?? (portrait ? W * 0.74 : W * 0.47), y: k.y ?? (portrait ? H * 0.97 : H * 0.985),
      face: k.face ?? -1, since: 1.5, emotion: k.emotion || (pose === 'shock' ? 'surprised' : 'happy'), dir: k.dir ?? 40, mouth: 0.6 });
  } catch (e) { console.error('Kaşif cover failed', e); node.innerHTML = ''; }
}
const coverShift = () => D.format === 'long' ? `translateX(${W * 0.2}px) scale(1.12)` : `translateY(${H * (PARCH ? 0.17 : 0.1)}px)`;

function coverMoment(c) {
  const idx = Math.min(c.scene ?? 0, S.length - 1), o = S[idx];
  return { idx, lt: Math.min(c.t ?? o.dur * 0.85, o.dur - 0.2) };
}

window.seek = (t) => {
  const pend = [], root = document.documentElement, h = D.hook;
  const run = () => {
    pend.length = 0;
    if (h && t < h.end) {
      if (!root.classList.contains('hook')) { root.classList.add('cover', 'hook'); buildCoverText(h); coverKasif(h, 0); }
      const m = coverMoment(h);
      renderSolo(t, m.idx, m.lt + t * 0.35, pend, coverShift());
      const box = $('covertext');
      box.style.opacity = 1;
      box.style.transform = `scale(${lerp(1.08, 1, prog(t, 0, 0.4))})`;
      $('covershade').style.opacity = 1;
      hud(t, sceneAt(t), true);
      return;
    }
    if (root.classList.contains('hook')) root.classList.remove('cover', 'hook');
    renderNormal(t, pend);
  };
  run();
  if (pend.length) return Promise.all(pend).then(() => { run(); return true; });
  return true;
};

// thumbnail: cover text + the chosen shot frozen at its most dramatic moment
window.cover = (c) => {
  const pend = [];
  const root = document.documentElement;
  root.classList.add('cover');
  root.classList.remove('hook');
  buildCoverText(c);
  $('covertext').style.transform = '';
  $('covertext').style.opacity = 1;
  const m = coverMoment(c);
  const t = S[m.idx].sc.start + m.lt;
  coverKasif(c, m.lt);
  const run = () => { renderSolo(t, m.idx, m.lt, pend, coverShift()); hud(t, m.idx, true); };
  run();
  if (pend.length) return Promise.all(pend).then(() => { run(); return true; });
  return true;
};
