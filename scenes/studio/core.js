// Studio engine (parchment theme): shared helpers (easing, svg, colours, the brand palette). No randomness: use rng(seed).
'use strict';

// shot registry: every scenes/studio/shots/<type>.js adds SHOTS.<type> = {kind: '2d'|'3d', build(ctx)}
const SHOTS = window.SHOTS || (window.SHOTS = {});

// text locale of the video ("lang" in the script: tr -> tr-TR, en -> en-US); set by engine.js init before shots build.
// Upper-casing goes through it: 'i' is 'İ' only in Turkish.
let LOCALE = 'tr-TR';

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
function svgText(parent, txt, x, y, size, attrs = {}) {
  const t = el(parent, 'text', Object.assign({ x, y, 'font-size': size, 'text-anchor': 'middle', 'dominant-baseline': 'alphabetic' }, attrs));
  t.textContent = txt;
  return t;
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

// The channel's single fixed sepia palette (brand/kit/BRAND.md §3; every script has "theme": "parchment").
// ctx.pal (bg/glow/accent/accent2/ink) maps onto it; shots should use the tokens directly.
const THEME_PARCHMENT = {
  paper: '#E9DCC0', paperLight: '#F4EAD5', paperDark: '#D3C09A', stain: '#B88F5A', ink: '#2B1D12', inkSoft: '#6B5440',
  blue: '#4A6F94', red: '#A8432F', gold: '#C8922E', green: '#5E7D4B', hat: '#8B5A2B', hatBand: '#4E3218',
};
THEME_PARCHMENT.pal = { bg: [THEME_PARCHMENT.paper, THEME_PARCHMENT.paper], glow: THEME_PARCHMENT.stain, accent: THEME_PARCHMENT.gold,
  accent2: THEME_PARCHMENT.blue, ink: THEME_PARCHMENT.ink, theme: 'parchment' };

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
