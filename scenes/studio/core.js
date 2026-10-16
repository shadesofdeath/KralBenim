// Studio engine: shared helpers (easing, svg, colours, palettes). No randomness: use rng(seed).
'use strict';

function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t;
  return x => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (sx(t) < x) lo = t; else hi = t; }
    return sy(t);
  };
}
const EASE = bezier(.2, .8, .2, 1);
const EASE_IO = bezier(.65, 0, .35, 1);
const clamp01 = v => Math.max(0, Math.min(1, v));
const prog = (t, a, d) => EASE(clamp01((t - a) / d));          // eased 0..1 from a over d seconds
const progIO = (t, a, d) => EASE_IO(clamp01((t - a) / d));
const lin = (t, a, d) => clamp01((t - a) / d);
const lerp = (a, b, p) => a + (b - a) * p;
// springy 0..1 with overshoot (entrances)
const spring = (t, a, d) => { const x = clamp01((t - a) / d); return x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(10 * x); };
// 1 at the hit moment, decaying fast (accents on cue words)
const punch = (t, at, d = 0.6) => (at != null && t >= at && t < at + d) ? Math.exp(-(t - at) * 7) : 0;
// deterministic pseudo-random
function rng(seed) { seed = Math.max(1, Math.floor(seed) % 2147483647); return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
// cue time or fallback (scene-local seconds)
const cue = (cues, name, fb) => (cues && cues[name] != null ? cues[name] : fb);

const NS = 'http://www.w3.org/2000/svg';
function el(parent, tag, attrs = {}) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const path = (p, d, stroke, w = 4, extra = {}) =>
  el(p, 'path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1 }, extra));
function draw(e, p) {               // reveal a pathLength=1 stroke
  e.style.strokeDasharray = '1 1';
  e.style.strokeDashoffset = 1 - p;
  e.style.opacity = p > 0.002 ? 1 : 0;
}
function div(parent, cls, html) {
  const d = document.createElement('div');
  if (cls) d.className = cls;
  if (html != null) d.innerHTML = html;
  if (parent) parent.appendChild(d);
  return d;
}

// ------------------------------------------------------------ colours
function hex2rgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgb2hex = c => '#' + c.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, p) => rgb2hex(hex2rgb(a).map((v, i) => lerp(v, hex2rgb(b)[i], p)));
const rgba = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; };
const shade = (h, k) => mix(h, k < 0 ? '#000000' : '#ffffff', Math.abs(k));

// Art direction presets: every video picks one ("art": {"palette": "magma"}) or defines its own.
// bg = [top, bottom] gradient, glow = soft light colour, accent = highlight, accent2 = secondary.
const PALETTES = {
  space:  { bg: ['#03040a', '#0b1330'], glow: '#3a5bd9', accent: '#ffb347', accent2: '#7fb2ff', ink: '#f5f5f7' },
  magma:  { bg: ['#0d0302', '#2e0b04'], glow: '#ff5a1f', accent: '#ff8a2a', accent2: '#ffd36b', ink: '#fff6ec' },
  ocean:  { bg: ['#010b12', '#053049'], glow: '#1fa3c9', accent: '#4fe0d0', accent2: '#a6ecff', ink: '#f2fbff' },
  sunset: { bg: ['#140818', '#4b1934'], glow: '#ff6a4d', accent: '#ff9a5c', accent2: '#ffd0a8', ink: '#fff4ef' },
  candy:  { bg: ['#16050d', '#43122c'], glow: '#ff4f93', accent: '#ff7eb3', accent2: '#ffd6e6', ink: '#fff5f9' },
  forest: { bg: ['#030c06', '#0f2c1b'], glow: '#3fbf6a', accent: '#a7e35f', accent2: '#f4d871', ink: '#f3fbf2' },
  lab:    { bg: ['#07090c', '#18202a'], glow: '#4a7bd0', accent: '#d9a441', accent2: '#7fd1ff', ink: '#f5f5f7' },
  ice:    { bg: ['#040a12', '#16304a'], glow: '#8fd3ff', accent: '#9fe8ff', accent2: '#ffffff', ink: '#f4fbff' },
  desert: { bg: ['#120a04', '#3d2410'], glow: '#e0913a', accent: '#f2b450', accent2: '#ffe2a8', ink: '#fff8ee' },
  noir:   { bg: ['#050505', '#151517'], glow: '#5a5a66', accent: '#e5484d', accent2: '#f5f5f7', ink: '#f5f5f7' },
};
const RED = '#e5484d', GREEN = '#46c37b';
function palette(a) {
  if (!a) return PALETTES.lab;
  if (typeof a === 'string') return PALETTES[a] || PALETTES.lab;
  const base = PALETTES[a.palette] || PALETTES.lab;
  return Object.assign({}, base, a.colors || {});
}
function mixPal(a, b, p) {
  if (p <= 0) return a;
  if (p >= 1) return b;
  return { bg: [mix(a.bg[0], b.bg[0], p), mix(a.bg[1], b.bg[1], p)], glow: mix(a.glow, b.glow, p),
           accent: mix(a.accent, b.accent, p), accent2: mix(a.accent2, b.accent2, p), ink: mix(a.ink, b.ink, p) };
}

// Turkish number formatting: 6400 -> "6.400", 3.5 -> "3,5"
function fmtNum(v, dec = 0) {
  const s = Math.abs(v).toFixed(dec).split('.');
  s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (v < 0 ? '−' : '') + s.join(',');
}
// "6.400" / "5,5" -> number
const parseNum = s => parseFloat(String(s).replace(/\./g, '').replace(',', '.'));

// fit a single-line text element into maxW by shrinking font-size
function fitText(node, maxW, start, min = 40) {
  let fs = start;
  node.style.fontSize = fs + 'px';
  while (fs > min && node.scrollWidth > maxW) { fs -= 4; node.style.fontSize = fs + 'px'; }
  return fs;
}

const ICONS = {
  bulb: 'M50 10 C28 10 18 28 18 42 C18 56 30 62 34 72 H66 C70 62 82 56 82 42 C82 28 72 10 50 10 Z M36 80 H64 M40 88 H60 M44 96 H56',
  brain: 'M48 20 C38 10 20 16 22 30 C10 34 10 52 20 56 C14 68 26 82 38 76 C42 88 56 88 52 76 M52 20 C62 10 80 16 78 30 C90 34 90 52 80 56 C86 68 74 82 62 76 C58 88 44 88 48 76 M50 20 V82',
  eye: 'M8 50 C24 24 76 24 92 50 C76 76 24 76 8 50 Z M50 34 A16 16 0 1 1 49.9 34',
  clock: 'M50 10 A40 40 0 1 1 49.9 10 M50 26 V50 L66 60',
  globe: 'M50 10 A40 40 0 1 1 49.9 10 M10 50 H90 M50 10 C30 30 30 70 50 90 M50 10 C70 30 70 70 50 90',
  warning: 'M50 10 L92 86 H8 Z M50 38 V60 M50 70 V72',
  heart: 'M50 86 C20 64 8 46 14 30 C20 14 42 12 50 30 C58 12 80 14 86 30 C92 46 80 64 50 86 Z',
  drop: 'M50 8 C38 30 22 46 22 62 C22 80 36 92 50 92 C64 92 78 80 78 62 C78 46 62 30 50 8 Z',
  fire: 'M50 92 C26 92 18 72 24 56 C30 42 40 38 38 18 C56 28 62 44 58 56 C66 52 68 44 66 36 C80 48 84 70 74 82 C68 88 60 92 50 92 Z',
  snow: 'M50 8 V92 M14 29 L86 71 M14 71 L86 29',
  bolt: 'M58 8 L22 56 H48 L40 92 L78 40 H52 Z',
  check: 'M14 52 L38 76 L86 26',
  x: 'M18 18 L82 82 M82 18 L18 82',
  star: 'M50 8 L62 38 L94 40 L70 60 L78 92 L50 74 L22 92 L30 60 L6 40 L38 38 Z',
  moon: 'M66 12 C42 16 26 38 30 62 C34 82 54 94 76 88 C52 82 40 60 46 40 C50 26 58 18 66 12 Z',
  sun: 'M50 30 A20 20 0 1 1 49.9 30 M50 6 V18 M50 82 V94 M6 50 H18 M82 50 H94 M19 19 L27 27 M73 73 L81 81 M81 19 L73 27 M27 73 L19 81',
  rocket: 'M50 8 C68 22 72 46 64 70 H36 C28 46 32 22 50 8 Z M50 34 A8 8 0 1 1 49.9 34 M36 60 L22 76 L34 78 M64 60 L78 76 L66 78 M42 76 L50 92 L58 76',
  atom: 'M50 46 A4 4 0 1 1 49.9 46 M50 50 m-42 0 a42 16 0 1 0 84 0 a42 16 0 1 0 -84 0',
  question: 'M32 34 C32 18 44 10 52 10 C66 10 74 20 74 32 C74 46 60 50 54 58 C52 62 52 66 52 70 M52 84 V88',
  leaf: 'M18 82 C18 40 46 14 88 12 C86 54 62 82 18 82 Z M18 82 C38 62 54 46 70 30',
  gear: 'M50 30 A20 20 0 1 1 49.9 30 M50 8 V20 M50 80 V92 M8 50 H20 M80 50 H92 M20 20 L28 28 M72 72 L80 80 M80 20 L72 28 M28 72 L20 80',
  hand: 'M34 92 C22 80 16 66 16 56 L20 44 C24 40 30 42 32 48 V24 C32 16 42 16 42 24 V44 V18 C42 10 54 10 54 18 V44 V22 C54 14 66 14 66 22 V46 V32 C66 24 78 24 78 32 V62 C78 80 66 92 52 92 Z',
  sound: 'M14 38 H30 L52 20 V80 L30 62 H14 Z M64 34 C72 42 72 58 64 66 M74 24 C88 38 88 62 74 76',
  drill: 'M40 8 H60 V30 H40 Z M44 30 H56 L56 70 L50 92 L44 70 Z M44 44 L56 50 M44 56 L56 62',
  arrowDown: 'M50 10 V86 M24 62 L50 88 L76 62',
};
