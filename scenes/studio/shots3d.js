// 3D shots (Three.js r159, SwiftShader in headless Chromium). Each builder gets
// ctx = {P, pal, W, H, scene, camera, labels, seed} and returns {update(lt, dur, cues, env), camAt?(lt, dur)}.
// Everything is a function of lt (scene-local seconds): no clocks, no Math.random.
'use strict';

const SHOTS = window.SHOTS || (window.SHOTS = {});

// ------------------------------------------------------------ GLSL: 3D simplex noise (Ashima Arts / Stefan Gustavson, MIT)
const GLSL_NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float a=0.5,s=0.0;for(int i=0;i<5;i++){s+=a*snoise(p);p*=2.03;a*=0.5;}return s;}
`;

const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const col = h => new THREE.Color(h);
const DEG = Math.PI / 180;

// soft round sprite texture (glows, halos, stars)
let _glowTex;
function glowTexture() {
  if (_glowTex) return _glowTex;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.45)');
  gr.addColorStop(0.6, 'rgba(255,255,255,.08)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  _glowTex = new THREE.CanvasTexture(c);
  return _glowTex;
}
function glowSprite(color, size, opacity = 1) {
  const m = new THREE.SpriteMaterial({ map: glowTexture(), color: col(color), transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false });
  const s = new THREE.Sprite(m); s.scale.set(size, size, 1);
  return s;
}

function starfield(scene, seed, n = 1400, radius = 60) {
  const r = rng(seed), pos = new Float32Array(n * 3), ph = new Float32Array(n), sz = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(a) * s * radius, u * radius, Math.sin(a) * s * radius], i * 3);
    ph[i] = r() * 6.28; sz[i] = 0.6 + Math.pow(r(), 6) * 3.2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('ph', new THREE.BufferAttribute(ph, 1));
  geo.setAttribute('sz', new THREE.BufferAttribute(sz, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 }, uPx: { value: devicePixelRatio } },
    vertexShader: `attribute float ph; attribute float sz; varying float vA; uniform float uT; uniform float uPx;
      void main(){ vA = 0.55 + 0.45 * sin(uT * 1.7 + ph * 3.0); gl_PointSize = sz * uPx * 1.6;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;
      gl_FragColor = vec4(vec3(1.0, 0.97, 0.92), vA * smoothstep(0.5, 0.0, d)); }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return t => { mat.uniforms.uT.value = t; };
}

// camera from {dist, yaw, pitch, tx, ty, tz, fov, shift} (degrees); shift moves the subject on screen (-1..1)
const CAM_DEFAULT = { dist: 3.4, yaw: 40, pitch: 22, tx: 0, ty: 0, tz: 0, fov: 34, sx: 0, sy: 0 };
function camLerp(a, b, p) {
  const o = {};
  for (const k in CAM_DEFAULT) o[k] = lerp(a[k] ?? CAM_DEFAULT[k], b[k] ?? CAM_DEFAULT[k], p);
  return o;
}
function applyCam(camera, c, W, H) {
  const y = c.yaw * DEG, p = c.pitch * DEG;
  camera.fov = c.fov;
  camera.aspect = W / H;
  camera.position.set(c.tx + c.dist * Math.cos(p) * Math.sin(y), c.ty + c.dist * Math.sin(p), c.tz + c.dist * Math.cos(p) * Math.cos(y));
  camera.lookAt(c.tx, c.ty, c.tz);
  // screen-space shift (cover layouts, framing): view offset in pixels
  if (c.sx || c.sy) camera.setViewOffset(W, H, -c.sx * W / 2, c.sy * H / 2, W, H);
  else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
// shot camera: dolly in from `from` (or 25% further out) to `cam`, then a slow drift
function shotCam(P, env, lt, dur) {
  const cam = Object.assign({}, CAM_DEFAULT, P.camera || {});
  const prev = env && env.prevCam;
  const from = prev || Object.assign({}, cam, { dist: cam.dist * 1.28, yaw: cam.yaw - 14, pitch: cam.pitch + 6 });
  const move = (P.camera && P.camera.move) || (prev ? 1.3 : 1.6);
  let c = camLerp(from, cam, progIO(lt, 0, move));
  const drift = (P.camera && P.camera.drift != null) ? P.camera.drift : 2.2;
  c.yaw += drift * Math.max(0, lt - move * 0.5) * 0.6;
  c.dist *= 1 - 0.012 * Math.max(0, lt - move);
  return c;
}

// project a world point to stage pixels
function toScreen(v, camera, W, H) {
  const p = v.clone().project(camera);
  return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z];
}

// ------------------------------------------------------------ planet (with optional cutaway)
// P: {preset: "earth"|"moon"|"mars"|"sun", cut: true, highlight: "mantle", spin: 1,
//     layers: [{name, r, a, b, flow}], labels: [{layer, text, sub, at}], drill: {to, unit, at},
//     camera: {...}, glow: 1}
const PLANET_PRESETS = {
  earth: { surface: 'earth', atmo: '#5aa8ff', glow: '#3d7bff', layers: [
    { name: 'inner', r: 0.19, a: '#fffbe6', b: '#ffd36b', flow: 0, glow: 1.0 },
    { name: 'outer', r: 0.546, a: '#ffb21e', b: '#ff6a00', flow: 2, glow: 0.8 },
    { name: 'mantle', r: 0.975, a: '#c2410c', b: '#7a1f05', flow: 1, glow: 0.45 },
    { name: 'crust', r: 1.0, a: '#7a5a3a', b: '#4a3524', flow: 0, glow: 0.0 }] },
  moon: { surface: 'moon', atmo: null, glow: '#9aa3b5', layers: [
    { name: 'inner', r: 0.2, a: '#ffe7a8', b: '#ffb347', flow: 0, glow: 0.8 },
    { name: 'outer', r: 0.3, a: '#ff9a3c', b: '#d0551a', flow: 2, glow: 0.6 },
    { name: 'mantle', r: 0.97, a: '#8a6a55', b: '#5a4537', flow: 1, glow: 0.1 },
    { name: 'crust', r: 1.0, a: '#9c9c9c', b: '#6e6e6e', flow: 0, glow: 0 }] },
  mars: { surface: 'mars', atmo: '#ff9a6b', glow: '#ff6a3d', layers: [
    { name: 'inner', r: 0.5, a: '#ffcf7a', b: '#ff8a2a', flow: 2, glow: 0.7 },
    { name: 'mantle', r: 0.97, a: '#a8461f', b: '#6b2810', flow: 1, glow: 0.3 },
    { name: 'crust', r: 1.0, a: '#a0522d', b: '#6b3a22', flow: 0, glow: 0 }] },
  sun: { surface: 'sun', atmo: '#ffb347', glow: '#ff9a2a', layers: [
    { name: 'core', r: 0.25, a: '#ffffff', b: '#fff2b0', flow: 0, glow: 1.2 },
    { name: 'radiative', r: 0.7, a: '#ffd36b', b: '#ffb020', flow: 1, glow: 1.0 },
    { name: 'convective', r: 1.0, a: '#ff9a2a', b: '#ff5a10', flow: 2, glow: 1.0 }] },
};


// ------------------------------------------------------------ baked noise (SwiftShader is slow at per-pixel noise:
// every procedural pattern is rendered ONCE into a texture at init, frames only sample textures)
const BAKE_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const _baked = {};
function bake(renderer, key, w, h, fs, wrap) {
  if (_baked[key]) return _baked[key];
  const rt = new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false, depthBuffer: false });
  rt.texture.wrapS = rt.texture.wrapT = wrap || THREE.RepeatWrapping;
  const sc = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: BAKE_VS, fragmentShader: fs, depthTest: false })));
  const prev = renderer.getRenderTarget();
  renderer.setRenderTarget(rt); renderer.render(sc, cam); renderer.setRenderTarget(prev);
  return (_baked[key] = rt.texture);
}
// equirectangular direction for a texel
const BAKE_DIR = `vec3 dirOf(vec2 uv){ float lon = (uv.x - 0.5) * 6.2831853, lat = (uv.y - 0.5) * 3.14159265;
  return vec3(cos(lat) * cos(lon), sin(lat), cos(lat) * sin(lon)); }`;
// planet albedo (rgb) + land mask (a)
function surfaceMaps(renderer, kind, seed) {
  const albedo = bake(renderer, `alb${kind}_${seed}`, 2048, 1024, `varying vec2 vUv; ${GLSL_NOISE} ${BAKE_DIR}
    void main(){ vec3 o = dirOf(vUv); vec3 p = o + ${seed.toFixed(3)}; float lat = abs(o.y); vec3 c; float land = 0.0;
      if (${kind} == 0) {
        float n = fbm(p * 1.7); land = smoothstep(0.04, 0.09, n);
        vec3 ocean = mix(vec3(0.02, 0.09, 0.24), vec3(0.05, 0.26, 0.48), smoothstep(-0.25, 0.06, n));
        float dry = smoothstep(0.0, 0.5, fbm(p * 3.1 + 7.0) + 0.25 - abs(lat - 0.3));
        vec3 ground = mix(vec3(0.13, 0.30, 0.12), vec3(0.58, 0.47, 0.28), dry);
        ground = mix(ground, vec3(0.32, 0.27, 0.2), smoothstep(0.25, 0.45, n));
        c = mix(ocean, ground, land);
        c = mix(c, vec3(0.92, 0.95, 1.0), smoothstep(0.78, 0.86, lat + 0.05 * snoise(p * 6.0)));
      } else if (${kind} == 1) {
        float mare = smoothstep(0.05, 0.3, fbm(p * 1.3 + 4.0));
        float fine = fbm(p * 9.0) * 0.5 + 0.5;
        float cr = smoothstep(0.78, 0.84, snoise(p * 16.0) * 0.5 + 0.5) - 0.6 * smoothstep(0.84, 0.9, snoise(p * 16.0) * 0.5 + 0.5);
        c = vec3(mix(0.66, 0.34, mare) * (0.85 + 0.25 * fine) + cr * 0.12) * vec3(1.0, 0.99, 0.96);
      } else if (${kind} == 2) {
        float n = fbm(p * 2.0); c = mix(vec3(0.55, 0.22, 0.1), vec3(0.78, 0.42, 0.22), n * 0.5 + 0.5);
        c = mix(c, vec3(0.95), smoothstep(0.86, 0.92, lat));
      } else {
        float g = fbm(p * 5.0); float g2 = snoise(p * 18.0); float spots = smoothstep(0.62, 0.7, fbm(p * 1.4 + 3.0));
        c = mix(vec3(0.95, 0.32, 0.03), vec3(1.0, 0.86, 0.45), clamp(g * 0.8 + 0.5 + g2 * 0.15, 0.0, 1.0)) * (1.0 - spots * 0.6);
      }
      gl_FragColor = vec4(c, land); }`);
  // r = city lights, g = clouds, b = second granulation layer (sun)
  const aux = bake(renderer, `aux${kind}_${seed}`, 2048, 1024, `varying vec2 vUv; ${GLSL_NOISE} ${BAKE_DIR}
    void main(){ vec3 o = dirOf(vUv); vec3 p = o + ${seed.toFixed(3)};
      float city = smoothstep(0.72, 0.95, snoise(p * 60.0) * 0.5 + 0.5) * smoothstep(0.2, 0.6, snoise(p * 9.0) * 0.5 + 0.5) * (1.0 - smoothstep(0.7, 0.8, abs(o.y)));
      float cl = smoothstep(0.08, 0.45, fbm(o * 2.6 + ${seed.toFixed(3)} + 11.0));
      float g = fbm(p * 5.0 + 9.0);
      gl_FragColor = vec4(city, cl, g * 0.5 + 0.5, 1.0); }`);
  return { albedo, aux };
}
// generic 2D fbm noise (4 independent channels, 0..1), mirrored so any offset is seamless
function noiseMap(renderer) {
  return bake(renderer, 'noise2d', 1024, 1024, `varying vec2 vUv; ${GLSL_NOISE}
    void main(){ vec3 p = vec3(vUv * 6.0, 0.0);
      gl_FragColor = vec4(fbm(p), fbm(p + 17.3), fbm(p * 2.0 + 41.7), snoise(p * 3.0 + 5.1)) * 0.5 + 0.5; }`, THREE.MirroredRepeatWrapping);
}
const SPHERE_UV = `vec2 sphUV(vec3 r){ return vec2(atan(r.z, r.x) / 6.2831853 + 0.5, asin(clamp(r.y, -1.0, 1.0)) / 3.14159265 + 0.5); }`;

const SURFACE_FS = `
uniform float uT; uniform float uSpin; uniform float uCut; uniform vec3 uSun; uniform int uKind; uniform float uGain;
uniform sampler2D uMap; uniform sampler2D uAux;
varying vec3 vObj; varying vec3 vN; varying vec3 vView;
${SPHERE_UV}
vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
void main(){
  if (uCut > 0.5 && vObj.x > 0.0 && vObj.y > 0.0 && vObj.z > 0.0) discard;
  vec3 o = normalize(vObj);
  vec2 uv = sphUV(rotY(o, uSpin));
  vec4 alb = texture2D(uMap, uv);
  vec3 N = normalize(vN), V = normalize(vView);
  float diff = max(dot(N, uSun), 0.0);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  vec3 c = alb.rgb;
  if (uKind == 0) {
    vec4 ax = texture2D(uAux, uv);
    float land = alb.a;
    float spec = pow(max(dot(N, normalize(uSun + V)), 0.0), 40.0) * (1.0 - land) * 0.6;
    float night = smoothstep(0.12, -0.12, dot(N, uSun));
    c = c * (0.05 + 1.05 * diff) + spec + night * land * ax.r * vec3(1.0, 0.7, 0.35) * 0.9;
    c += fres * vec3(0.25, 0.5, 1.0) * 0.8;
  } else if (uKind == 3) {
    // sun: two drifting samples of the baked granulation
    vec4 a2 = texture2D(uMap, uv + vec2(uT * 0.004, uT * 0.002));
    float g = texture2D(uAux, uv * 1.7 - vec2(uT * 0.006, 0.0)).b;
    c = mix(alb.rgb, a2.rgb, 0.5) * (0.85 + 0.3 * g);
    c *= mix(0.55, 1.25, 1.0 - fres);
  } else {
    c *= 0.05 + 1.1 * diff;
    if (uKind == 2) c += fres * vec3(1.0, 0.5, 0.3) * 0.35;
  }
  gl_FragColor = vec4(c * uGain, 1.0);
}`;
const SURFACE_VS = `varying vec3 vObj; varying vec3 vN; varying vec3 vView;
void main(){ vObj = position; vN = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(position, 1.0); vView = cameraPosition - w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w; }`;

const CUT_FS = `
uniform float uT; uniform float uR[5]; uniform vec3 uA[5]; uniform vec3 uB[5]; uniform float uFlow[5];
uniform float uGlow[5]; uniform float uLit[5]; uniform int uN; uniform vec3 uLine; uniform float uSeed; uniform float uFace;
uniform sampler2D uNoise;
varying vec3 vObj;
float tn(vec2 p, int ch){ vec4 v = texture2D(uNoise, p * 0.17); return (ch == 0 ? v.r : ch == 1 ? v.g : ch == 2 ? v.b : v.a) * 2.0 - 1.0; }
void main(){
  float r = length(vObj);
  if (r > 1.0) discard;
  int k = 0; float r0 = 0.0, r1 = uR[0];
  for (int i = 0; i < 5; i++) { if (i < uN && r > uR[i]) { k = i + 1; } }
  if (k >= uN) k = uN - 1;
  vec3 a = uA[0], b = uB[0]; float fl = uFlow[0], gl = uGlow[0], lit = uLit[0];
  for (int i = 0; i < 5; i++) { if (i == k) { a = uA[i]; b = uB[i]; fl = uFlow[i]; gl = uGlow[i]; lit = uLit[i]; r1 = uR[i]; } if (i == k - 1) r0 = uR[i]; }
  float u = clamp((r - r0) / max(r1 - r0, 1e-3), 0.0, 1.0);
  vec2 p = vec2(vObj.x + vObj.z, vObj.y + vObj.z * 0.5) * 3.0 + uSeed;
  float n = 0.0;
  if (fl > 1.5) {        // liquid: fast swirling flow (domain-warped, drifting)
    vec2 q = p * 1.6 + vec2(uT * 0.2, uT * 0.35);
    vec2 w = vec2(tn(q * 0.7 + uT * 0.2, 3), tn(q * 0.7 + 4.0 - uT * 0.1, 1));
    n = tn(q + w * 0.8, 0);
  } else if (fl > 0.5) { // convection: slow, large plumes
    n = tn(p * 0.9 + vec2(uT * 0.03, -uT * 0.06), 1);
  } else {
    n = tn(p * 2.5, 2) * 0.4;
  }
  vec3 c = mix(a, b, clamp(u * 0.85 + n * 0.45, 0.0, 1.0));
  c *= (0.75 + 0.35 * n) * (1.0 + gl * 0.6);
  // boundary lines between layers
  float e = 1.0;
  for (int i = 0; i < 5; i++) { if (i < uN - 1) e = min(e, abs(r - uR[i])); }
  float line = smoothstep(0.006, 0.0, e);
  // dim layers keep their hue (darker, desaturated) instead of turning grey
  vec3 dimC = mix(vec3(dot(c, vec3(0.3, 0.5, 0.2))), c, 0.6) * lit;
  c = (lit < 1.0 ? dimC : c * lit) * uFace + line * uLine * 0.9;
  gl_FragColor = vec4(c, 1.0);
}`;

SHOTS.planet = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels, renderer } = ctx;
    const pre = PLANET_PRESETS[P.preset || 'earth'] || PLANET_PRESETS.earth;
    const layers = (P.layers || pre.layers).slice(0, 5);
    const kind = { earth: 0, moon: 1, mars: 2, sun: 3 }[pre.surface] ?? 0;
    const seed = (P.seed ?? 3) * 1.37;
    const cut = P.cut !== false && P.cut != null;
    const sun = V3(-0.6, 0.55, 0.7).normalize();
    const stars = starfield(scene, 7 + (P.seed || 0));

    const halo = glowSprite(P.glow_color || pre.glow, 3.6, 0.35 * (P.glow ?? 1));
    halo.position.set(0, 0, -0.6);
    scene.add(halo);
    const group = new THREE.Group(); scene.add(group);

    const maps = surfaceMaps(renderer, kind, seed), NOISE = noiseMap(renderer);
    const surfU = { uT: { value: 0 }, uSpin: { value: 0 }, uCut: { value: cut ? 1 : 0 }, uSun: { value: sun }, uKind: { value: kind },
                    uMap: { value: maps.albedo }, uAux: { value: maps.aux }, uGain: { value: 1 } };
    const surf = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 120),
      new THREE.ShaderMaterial({ uniforms: surfU, vertexShader: SURFACE_VS, fragmentShader: SURFACE_FS, side: THREE.FrontSide }));
    group.add(surf);

    // clouds + atmosphere (earth-like presets)
    let clouds = null, atmo = null;
    if (kind === 0) {
      clouds = new THREE.Mesh(new THREE.SphereGeometry(1.012, 128, 96), new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uSpin: { value: 0 }, uCut: surfU.uCut, uSun: surfU.uSun, uAux: surfU.uAux },
        vertexShader: SURFACE_VS,
        fragmentShader: `uniform float uT; uniform float uSpin; uniform float uCut; uniform vec3 uSun; uniform sampler2D uAux;
          varying vec3 vObj; varying vec3 vN; varying vec3 vView; ${SPHERE_UV}
          void main(){ if (uCut > 0.5 && vObj.x > 0.0 && vObj.y > 0.0 && vObj.z > 0.0) discard;
            vec3 o = normalize(vObj); float a = uSpin * 1.15;
            vec3 r = vec3(cos(a)*o.x + sin(a)*o.z, o.y, -sin(a)*o.x + cos(a)*o.z);
            float m = texture2D(uAux, sphUV(r)).g;
            float d = max(dot(normalize(vN), uSun), 0.0);
            gl_FragColor = vec4(vec3(1.0) * (0.08 + d), m * 0.85); }`,
        transparent: true, depthWrite: false,
      }));
      group.add(clouds);
    }
    if (pre.atmo) {
      atmo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 96, 64), new THREE.ShaderMaterial({
        uniforms: { uC: { value: col(pre.atmo) }, uSun: surfU.uSun, uCut: surfU.uCut },
        vertexShader: SURFACE_VS,
        fragmentShader: `uniform vec3 uC; uniform vec3 uSun; uniform float uCut; varying vec3 vObj; varying vec3 vN; varying vec3 vView;
          void main(){ if (uCut > 0.5 && vObj.x > 0.0 && vObj.y > 0.0 && vObj.z > 0.0) discard;
            float f = pow(1.0 - max(dot(normalize(vN), normalize(vView)), 0.0), 3.0);
            float d = 0.35 + 0.65 * max(dot(normalize(vN), uSun) + 0.3, 0.0);
            gl_FragColor = vec4(uC * f * d * 1.6, f * d); }`,
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      group.add(atmo);
    }

    // cutaway faces: three quarter discs closing the removed octant (x>0, y>0, z>0)
    const cutU = {
      uT: { value: 0 }, uN: { value: layers.length }, uSeed: { value: seed },
      uR: { value: layers.map(l => l.r).concat([1, 1, 1, 1, 1]).slice(0, 5) },
      uA: { value: layers.map(l => col(l.a)).concat(Array(5).fill(col('#000'))).slice(0, 5) },
      uB: { value: layers.map(l => col(l.b)).concat(Array(5).fill(col('#000'))).slice(0, 5) },
      uFlow: { value: layers.map(l => l.flow || 0).concat([0, 0, 0, 0, 0]).slice(0, 5) },
      uGlow: { value: layers.map(l => l.glow || 0).concat([0, 0, 0, 0, 0]).slice(0, 5) },
      uLit: { value: [1, 1, 1, 1, 1] },
      uLine: { value: col(pal.accent2) }, uNoise: { value: NOISE },
    };
    const cutMat = new THREE.ShaderMaterial({ uniforms: cutU, side: THREE.DoubleSide,
      vertexShader: `varying vec3 vObj; void main(){ vObj = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: CUT_FS });
    if (cut) {
      // each face gets its own light level so the notch reads as a 3D corner
      const quad = (rotate, face) => {
        const g = new THREE.PlaneGeometry(1, 1, 1, 1); g.translate(0.5, 0.5, 0); rotate(g);
        const m = new THREE.ShaderMaterial({ uniforms: Object.assign({}, cutU, { uFace: { value: face } }), side: THREE.DoubleSide,
          vertexShader: cutMat.vertexShader, fragmentShader: CUT_FS });
        group.add(new THREE.Mesh(g, m));
      };
      quad(g => {}, 1.0);                          // z = 0 plane, x>0 y>0
      quad(g => g.rotateY(-Math.PI / 2), 0.62);    // x = 0 plane, z>0 y>0
      quad(g => g.rotateX(Math.PI / 2), 0.8);      // y = 0 plane, x>0 z>0
      const eg = new THREE.BufferGeometry().setFromPoints([V3(0, 0, 0), V3(1.001, 0, 0), V3(0, 0, 0), V3(0, 1.001, 0), V3(0, 0, 0), V3(0, 0, 1.001)]);
      group.add(new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: col(pal.ink), transparent: true, opacity: 0.55 })));
    }
    // solid inner ball poking into the notch
    let core = null;
    if (cut && layers.length) {
      const L = layers[0];
      core = new THREE.Mesh(new THREE.SphereGeometry(L.r, 64, 48), new THREE.ShaderMaterial({
        uniforms: { uA: { value: col(L.a) }, uB: { value: col(L.b) }, uT: cutU.uT, uLit: { value: 1 }, uNoise: { value: NOISE } },
        vertexShader: SURFACE_VS,
        fragmentShader: `uniform vec3 uA; uniform vec3 uB; uniform float uT; uniform float uLit; uniform sampler2D uNoise; varying vec3 vObj; varying vec3 vN; varying vec3 vView;
          void main(){ if (vObj.x < 0.0 || vObj.y < 0.0 || vObj.z < 0.0) discard;
            float f = pow(1.0 - max(dot(normalize(vN), normalize(vView)), 0.0), 1.5);
            vec3 o = normalize(vObj);
            float facets = abs(texture2D(uNoise, (o.xy + o.z * 0.6) * 1.4).a * 2.0 - 1.0); float glint = pow(1.0 - facets, 14.0) * (0.6 + 0.4 * sin(uT * 3.0 + vObj.x * 40.0));
            vec3 c = mix(uA, uB, f) * (1.1 + 0.25 * sin(uT * 2.0)) + glint * 0.8;
            c = uLit < 1.0 ? mix(uB * 0.5, c, clamp((uLit - 0.3) / 0.7, 0.0, 1.0)) * max(uLit, 0.55) : c * uLit;
            gl_FragColor = vec4(c, 1.0); }`,
      }));
      group.add(core);
    }
    const coreGlow = cut ? glowSprite(layers[0] ? layers[0].b : '#ffd36b', 0.9, 0.0) : null;
    if (coreGlow) { coreGlow.position.set(0.12, 0.12, 0.12); group.add(coreGlow); }
    let corona = null;
    if (kind === 3) { corona = glowSprite('#ffb347', 3.4, 0.8); corona.position.set(0, 0, -0.2); scene.add(corona); }

    // drill: a glowing shaft from the north pole down the notch edge to the centre
    let drill = null, tip = null, drillLbl = null;
    if (P.drill) {
      drill = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 12, 1), new THREE.MeshBasicMaterial({ color: col(pal.accent) }));
      drill.geometry.translate(0, -0.5, 0);
      drill.position.set(0, 1.0, 0); group.add(drill);
      tip = glowSprite(pal.accent, 0.35, 1); group.add(tip);
      drillLbl = labels.add('counter');
    }
    const lbls = (P.labels || []).map(L => ({ L, el: labels.add('layer') }));
    const hlIndex = name => layers.findIndex(l => l.name === name);
    const hl = hlIndex(P.highlight);

    return {
      camAt: (lt, dur, env) => shotCam(P, env, lt, dur),
      update(lt, dur, cues, env) {
        const t = env.t;
        stars(t);
        const spin = (P.spin ?? (cut ? 0.06 : 0.12)) * t;
        surfU.uT.value = t; surfU.uSpin.value = spin;
        // P.fade: the body switches off at the "hit" cue (e.g. "if the Sun went out")
        const gain = P.fade ? lerp(1, 0.06, progIO(lt, cue(cues, 'hit', dur * 0.5), 0.6)) : 1;
        surfU.uGain.value = gain;
        if (corona) corona.material.opacity = 0.8 * gain;
        if (clouds) { clouds.material.uniforms.uSpin.value = spin; clouds.material.uniforms.uT.value = t; }
        cutU.uT.value = t;
        if (!cut) group.rotation.y = 0;
        group.rotation.z = (P.tilt || 0) * DEG;
        // layer highlight: chosen layer stays lit, others dim; eased in at scene start / cue
        const hp = prog(lt, cue(cues, 'hit', 0.25), 0.6);
        const prevHl = env.prevP ? hlIndex(env.prevP.highlight) : -1;
        const pk = punch(lt, cue(cues, 'hit', 0.25), 0.9);
        const lit = layers.map((_, i) => {
          const was = prevHl < 0 ? 1 : (i === prevHl ? 1.25 : 0.32);
          const now = hl < 0 ? 1 : (i === hl ? 1.25 + 0.15 * Math.sin(t * 4) + 0.5 * pk : 0.32);
          return lerp(was, now, hp);
        });
        cutU.uLit.value = lit.concat([1, 1, 1, 1, 1]).slice(0, 5);
        if (core) core.material.uniforms.uLit.value = lit[0];
        if (coreGlow) coreGlow.material.opacity = 0.35 * lit[0] + 0.25 * Math.sin(t * 3) * 0.3;
        halo.material.opacity = 0.32 * (P.glow ?? 1) * (0.9 + 0.1 * Math.sin(t * 1.3)) * surfU.uGain.value;
        const c = shotCam(P, env, lt, dur);
        applyCam(camera, c, W, H);
        halo.position.copy(camera.position.clone().normalize().multiplyScalar(-0.8));
        if (drill) {
          const a = cue(cues, 'drill', 0.3), dp = progIO(lt, a, Math.max(1.2, Math.min(dur - a - 0.4, 2.6)));
          drill.scale.set(1, Math.max(dp, 0.001), 1);
          tip.position.set(0, 1 - dp, 0);
          tip.material.opacity = dp > 0 ? 0.9 + 0.1 * Math.sin(t * 20) : 0;
          const s = toScreen(tip.position.clone().applyMatrix4(group.matrixWorld), camera, W, H);
          const val = fmtNum(Math.round(dp * (P.drill.to ?? 6371) / (P.drill.round ?? 1)) * (P.drill.round ?? 1));
          drillLbl.set(`<b style="font-size:96px;color:${pal.accent}">${val}</b><small style="font-size:40px">${P.drill.unit || 'km'}</small>`,
            s[0] + (P.drill.dx ?? -210), s[1] + (P.drill.dy ?? 0), dp > 0.01 ? 1 : 0, s);
        }
        lbls.forEach(({ L, el }, k) => {
          const i = hlIndex(L.layer);
          const r0 = i > 0 ? layers[i - 1].r : 0, r1 = i >= 0 ? layers[i].r : 0.5;
          const rm = (r0 + r1) / 2, ang = (L.angle ?? 35) * DEG;
          const anchor = V3(Math.cos(ang) * rm, Math.sin(ang) * rm, 0);   // on the z=0 cut face
          const s = toScreen(anchor.applyMatrix4(group.matrixWorld), camera, W, H);
          const at = cue(cues, L.at, 0.5 + k * 0.4), a = spring(lt, at, 0.7);
          el.set(`<b style="font-size:${L.size || 84}px;color:${L.color || pal.ink}">${L.text}</b>` + (L.sub ? `<small style="font-size:40px">${L.sub}</small>` : ''),
            s[0] + (L.dx ?? -250), s[1] + (L.dy ?? -40), clamp01(a * 1.4), s, a);
        });
      },
    };
  },
};

// ------------------------------------------------------------ orbs: 1-3 spheres side by side with counters
// P: {items: [{label, value, unit, prefix, material: "sun"|"core"|"earth"|"moon"|"metal"|"rock"|"ice"|"lava", size}]}
SHOTS.orbs = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels, renderer } = ctx;
    const items = (P.items || []).slice(0, 3);
    const NOISE = noiseMap(renderer);
    const stars = starfield(scene, 21);
    const sun = V3(-0.5, 0.5, 0.8).normalize();
    const portrait = H > W;
    const n = items.length, maxS = Math.max(...items.map(i => i.size || 1));
    const objs = items.map((it, i) => {
      const s = (it.size || 1) / maxS;
      const m = it.material || 'rock';
      const mk = { sun: 3, earth: 0, moon: 1, mars: 2 }[m];
      let mesh;
      if (mk != null) {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), new THREE.ShaderMaterial({
          uniforms: (() => { const m2 = surfaceMaps(renderer, mk, 3 + i); return { uT: { value: 0 }, uSpin: { value: 0 }, uCut: { value: 0 }, uSun: { value: sun }, uKind: { value: mk }, uMap: { value: m2.albedo }, uAux: { value: m2.aux }, uGain: { value: 1 } }; })(),
          vertexShader: SURFACE_VS, fragmentShader: SURFACE_FS }));
      } else {
        const C = { core: ['#fff6d6', '#ffb020', 1.0], lava: ['#ffb347', '#d0300a', 0.8], metal: ['#e8e8ee', '#6f7380', 0.0],
                    rock: ['#a08f80', '#4a4038', 0.0], ice: ['#e8fbff', '#7fc8ff', 0.15] }[m] || ['#ddd', '#555', 0];
        mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), new THREE.ShaderMaterial({
          uniforms: { uA: { value: col(C[0]) }, uB: { value: col(C[1]) }, uE: { value: C[2] }, uT: { value: 0 }, uSun: { value: sun }, uSeed: { value: i * 5.0 }, uNoise: { value: NOISE } },
          vertexShader: SURFACE_VS,
          fragmentShader: `uniform vec3 uA; uniform vec3 uB; uniform float uE; uniform float uT; uniform vec3 uSun; uniform float uSeed; uniform sampler2D uNoise;
            varying vec3 vObj; varying vec3 vN; varying vec3 vView; ${SPHERE_UV}
            void main(){ vec3 N = normalize(vN), V = normalize(vView);
              float f = pow(1.0 - max(dot(N, V), 0.0), 2.0);
              vec2 uv = sphUV(normalize(vObj)) * vec2(2.0, 1.0) + vec2(uSeed * 0.13, uT * 0.01 * uE);
              float n = texture2D(uNoise, uv).r * 2.0 - 1.0 + (texture2D(uNoise, uv * 2.3 - uT * 0.008 * uE).b - 0.5);
              float d = max(dot(N, uSun), 0.0);
              vec3 base = mix(uA, uB, clamp(0.5 + n * 0.8 + f * 0.6, 0.0, 1.0));
              vec3 lit = base * (0.12 + 1.0 * d) + pow(max(dot(N, normalize(uSun + V)), 0.0), 50.0) * 0.6;
              vec3 hot = base * (1.15 + 0.2 * n) + f * uA * 0.6;
              gl_FragColor = vec4(mix(lit, hot, uE), 1.0); }` }));
      }
      scene.add(mesh);
      const hot = m === 'sun' || m === 'core' || m === 'lava';
      const glow = glowSprite(hot ? (m === 'sun' ? '#ffb347' : '#ffcf6b') : pal.glow, 3.2, hot ? 0.9 : 0.25);
      scene.add(glow);
      return { it, s, mesh, glow, hot, lbl: labels.add('orb') };
    });
    // layout: row (landscape or 2 small) / column (portrait with 3)
    const gap = 2.6;
    return {
      update(lt, dur, cues, env) {
        const t = env.t;
        stars(t);
        const cam = Object.assign({ dist: portrait ? 7.2 : 6, yaw: 0, pitch: 4, fov: 34 }, P.camera || {});
        const c = camLerp(Object.assign({}, cam, { dist: cam.dist * 1.2 }), cam, progIO(lt, 0, 1.4));
        c.yaw += Math.sin(t * 0.3) * 4;
        applyCam(camera, c, W, H);
        objs.forEach((o, i) => {
          const off = (i - (n - 1) / 2) * gap;
          const at = cue(cues, 'o' + i, 0.25 + i * 0.5), sp = spring(lt, at, 0.9);
          // portrait: small spheres in a row in the upper half, labels under them (captions stay clear)
          const x = portrait ? (i - (n - 1) / 2) * (n > 2 ? 0.82 : 1.2) : off * 1.2, y = portrait ? (n === 1 ? 1.0 : 0.8) : 0.05;
          const r = o.s * (portrait ? (n > 2 ? 0.36 : n === 1 ? 0.62 : 0.5) : 0.92) * Math.max(sp, 0.001) * (1 + 0.04 * punch(lt, cue(cues, 'v' + i, at + 0.8)));
          o.mesh.position.set(x, y, 0); o.mesh.scale.setScalar(r);
          o.mesh.rotation.y = t * 0.15;
          if (o.mesh.material.uniforms.uT) o.mesh.material.uniforms.uT.value = t;
          if (o.mesh.material.uniforms.uSpin) o.mesh.material.uniforms.uSpin.value = t * 0.1;
          o.glow.position.set(x, y, -0.3); o.glow.scale.setScalar(r * (o.hot ? 3.6 + 0.2 * Math.sin(t * 2 + i) : 2.6));
          const vs = cue(cues, 'v' + i, at + 0.5), vp = prog(lt, vs, 1.4);
          const v = o.it.value != null ? parseNum(o.it.value) : null;
          const dec = String(o.it.value || '').includes(',') ? 1 : 0;
          const vt = v == null ? '' : (o.it.prefix || '') + fmtNum(v * vp, dec) + (o.it.suffix || '') + (o.it.unit ? `<span style="font-size:.5em"> ${o.it.unit}</span>` : '');
          const s = toScreen(V3(x, y - r - 0.15, 0), camera, W, H);
          const fs = portrait ? (n > 2 ? 64 : 88) : 84;
          o.lbl.set(v == null ? `<b style="font-size:${portrait ? 64 : 58}px;color:${o.hot ? pal.accent : pal.ink}">${o.it.label || ''}</b>`
                     : `<b style="font-size:${fs}px;color:${o.hot ? pal.accent : pal.ink}">${vt}</b><small style="font-size:${portrait ? 38 : 36}px">${o.it.label || ''}</small>`,
            s[0], s[1] + fs * 0.75, clamp01(sp * 1.3));
        });
      },
    };
  },
};

// ------------------------------------------------------------ lattice: atoms in a crystal, squeezed / heated / melting
// P: {mode: "squeeze"|"heat"|"melt", n: 5, color: "#c9ccd6", hot: 0..1, counter: {to, prefix, suffix, label}}
SHOTS.lattice = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels } = ctx;
    const n = P.n || 5, N = n * n * n, r = rng(17);
    const geo = new THREE.SphereGeometry(0.2, 32, 24);
    const mat = new THREE.MeshStandardMaterial({ color: col(P.color || '#c9ccd6'), metalness: P.metal === false ? 0.05 : 0.85, roughness: P.metal === false ? 0.3 : 0.28,
      emissive: col(pal.accent), emissiveIntensity: 0 });
    const atoms = new THREE.InstancedMesh(geo, mat, N);
    scene.add(atoms);
    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x1a0a05, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(col(pal.accent), 30, 20); rim.position.set(3, -2, -3); scene.add(rim);
    const ph = Array.from({ length: N }, () => [r() * 6.28, r() * 6.28, r() * 6.28, r() * 2 - 1, r() * 2 - 1, r() * 2 - 1]);
    // bonds as thin lines between neighbours
    const bondPos = [];
    const idx = (i, j, k) => (i * n + j) * n + k;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
      if (i + 1 < n) bondPos.push(idx(i, j, k), idx(i + 1, j, k));
      if (j + 1 < n) bondPos.push(idx(i, j, k), idx(i, j + 1, k));
      if (k + 1 < n) bondPos.push(idx(i, j, k), idx(i, j, k + 1));
    }
    const bgeo = new THREE.BufferGeometry();
    const barr = new Float32Array(bondPos.length * 3);
    bgeo.setAttribute('position', new THREE.BufferAttribute(barr, 3));
    const bonds = new THREE.LineSegments(bgeo, new THREE.LineBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: 0.35 }));
    scene.add(bonds);
    // six pressure arrows pushing inwards
    const arrows = [];
    const dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
    if (P.mode !== 'melt' && P.arrows !== false) for (const d of dirs) {
      const g = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 16), new THREE.MeshBasicMaterial({ color: col(pal.accent) }));
      shaft.position.y = 0.75;
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.36, 24), new THREE.MeshBasicMaterial({ color: col(pal.accent) }));
      head.rotation.x = Math.PI; head.position.y = 0.18;
      g.add(shaft, head);
      g.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(...d));
      scene.add(g);
      arrows.push({ g, d });
    }
    const glow = glowSprite(pal.glow, 9, 0.25); glow.position.set(0, 0, -2); scene.add(glow);
    const lbl = P.counter ? labels.add('counter') : null;
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V3(1, 1, 1), pos = V3(0, 0, 0);
    return {
      update(lt, dur, cues, env) {
        const t = env.t;
        const sq = P.mode === 'squeeze' ? progIO(lt, cue(cues, 'hit', 0.6), 1.4) : 0;
        const heat = (P.hot ?? (P.mode === 'heat' || P.mode === 'squeeze' ? 0.6 : 0.3));
        const melt = P.mode === 'melt' ? (P.melt_at ? prog(lt, cue(cues, 'hit', 0.6), 2.0) : 1) : 0;
        const spacing = lerp(P.spacing || 0.62, 0.47, sq);
        const amp = 0.05 * heat * (1 - 0.65 * sq);
        const enter = spring(lt, 0, 1.0);
        const half = (n - 1) / 2;
        const P3 = [];
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
          const a = idx(i, j, k), f = ph[a];
          const x = (i - half) * spacing + Math.sin(t * 13 + f[0]) * amp + melt * Math.sin(t * 0.9 + f[0]) * 0.5 * f[3];
          const y = (j - half) * spacing + Math.sin(t * 11 + f[1]) * amp + melt * (Math.sin(t * 0.7 + f[1]) * 0.5 * f[4] - 0.4);
          const z = (k - half) * spacing + Math.sin(t * 12 + f[2]) * amp + melt * Math.sin(t * 0.8 + f[2]) * 0.5 * f[5];
          pos.set(x * enter, y * enter, z * enter); P3.push(pos.x, pos.y, pos.z);
          sc.setScalar(Math.max(0.001, spring(lt, 0.1 + (i + j + k) * 0.03, 0.7)));
          m4.compose(pos, q, sc); atoms.setMatrixAt(a, m4);
        }
        atoms.instanceMatrix.needsUpdate = true;
        for (let b = 0; b < bondPos.length; b++) barr.set(P3.slice(bondPos[b] * 3, bondPos[b] * 3 + 3), b * 3);
        bgeo.attributes.position.needsUpdate = true;
        bonds.material.opacity = 0.4 * (1 - melt);
        mat.emissiveIntensity = 0.04 + 0.08 * heat + 0.3 * punch(lt, cue(cues, 'hit', 0.6), 1);
        const ext = half * spacing + 0.35;
        arrows.forEach(({ g, d }, i) => {
          const push = Math.sin(t * 5 + i) * 0.06 + (1 - sq) * 0.25;
          const a = prog(lt, 0.3 + i * 0.06, 0.6);
          g.position.set(...d.map(v => v * (ext + push + (1 - a) * 2)));
          g.children.forEach(c => { c.material.transparent = true; c.material.opacity = a; });
        });
        const cam = Object.assign({ dist: H > W ? 15 : 9, yaw: 32, pitch: 24, fov: 30, sy: H > W ? -0.08 : 0 }, P.camera || {});
        cam.yaw += t * 6;
        applyCam(camera, camLerp(Object.assign({}, cam, { dist: cam.dist * 1.25 }), cam, progIO(lt, 0, 1.4)), W, H);
        if (lbl) {
          const C = P.counter, at = cue(cues, 'count', 0.6), cp = prog(lt, at, 1.6);
          const v = fmtNum(Math.round(parseNum(C.to) * cp / (C.round || 1)) * (C.round || 1));
          lbl.set(`<b style="font-size:${H > W ? 150 : 110}px;color:${pal.accent}">${C.prefix || ''}${v}${C.suffix || ''}</b><small style="font-size:44px">${C.label || ''}</small>`,
            W / 2, H > W ? H * 0.2 : H * 0.18, clamp01(spring(lt, at, 0.6) * 1.3));
        }
      },
    };
  },
};

// ------------------------------------------------------------ shared bodies for system shots
// textured sphere (earth / moon / mars / sun) with day-night lighting; returns {mesh, set(t, spin)}
function bodyMesh(renderer, kind, seed, sun, segs = 96) {
  const maps = surfaceMaps(renderer, kind, seed);
  const U = { uT: { value: 0 }, uSpin: { value: 0 }, uCut: { value: 0 }, uSun: { value: sun }, uKind: { value: kind },
              uMap: { value: maps.albedo }, uAux: { value: maps.aux }, uGain: { value: 1 } };
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, segs, Math.round(segs * 0.75)),
    new THREE.ShaderMaterial({ uniforms: U, vertexShader: SURFACE_VS, fragmentShader: SURFACE_FS }));
  return { mesh, set(t, spin) { U.uT.value = t; U.uSpin.value = spin; } };
}
// molten world: dark crust plates with glowing seams (texture noise, cheap); heat 0..1
function lavaMesh(renderer, sun, seed = 1) {
  const U = { uT: { value: 0 }, uHeat: { value: 0.5 }, uSun: { value: sun }, uNoise: { value: noiseMap(renderer) }, uSeed: { value: seed } };
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 72), new THREE.ShaderMaterial({ uniforms: U, vertexShader: SURFACE_VS,
    fragmentShader: `uniform float uT; uniform float uHeat; uniform vec3 uSun; uniform sampler2D uNoise; uniform float uSeed;
      varying vec3 vObj; varying vec3 vN; varying vec3 vView; ${SPHERE_UV}
      void main(){ vec3 N = normalize(vN), V = normalize(vView); vec2 uv = sphUV(normalize(vObj)) * vec2(3.0, 1.5) + uSeed * 0.31;
        float n = texture2D(uNoise, uv + vec2(uT * 0.004, 0.0)).r, m = texture2D(uNoise, uv * 2.1 - vec2(0.0, uT * 0.006)).b;
        float seam = smoothstep(0.06, 0.0, abs(n - 0.5)) + 0.6 * smoothstep(0.05, 0.0, abs(m - 0.5));
        float d = max(dot(N, uSun), 0.0), f = pow(1.0 - max(dot(N, V), 0.0), 2.0);
        vec3 crust = mix(vec3(0.10, 0.06, 0.05), vec3(0.28, 0.16, 0.10), m) * (0.15 + 0.9 * d);
        vec3 glow = mix(vec3(1.0, 0.35, 0.05), vec3(1.0, 0.85, 0.4), seam * 0.6);
        vec3 c = mix(crust, glow, clamp(seam * (0.4 + uHeat) + uHeat * 0.35, 0.0, 1.0)) + f * vec3(1.0, 0.4, 0.1) * (0.3 + uHeat * 0.6);
        gl_FragColor = vec4(c, 1.0); }` }));
  return { mesh, U };
}

// ------------------------------------------------------------ collision: a planet-sized impact and what comes after
// P: {stage: "approach"|"impact"|"disk"|"moon", target: {size: 1}, impactor: {size: 0.53, name: "Theia"},
//     labels: {target: "Proto-Dünya", impactor: "Theia"}, camera: {...}}   cues: hit (impact moment / coalescing)
SHOTS.collision = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels, renderer } = ctx;
    const sun = V3(-0.6, 0.5, 0.65).normalize();
    const stars = starfield(scene, 33);
    const stage = P.stage || 'approach';
    const earth = lavaMesh(renderer, sun, 1); scene.add(earth.mesh);
    const ts = (P.target && P.target.size) || 1, is = (P.impactor && P.impactor.size) || 0.53;
    earth.mesh.scale.setScalar(ts);
    const theia = lavaMesh(renderer, sun, 7); scene.add(theia.mesh);
    theia.mesh.scale.setScalar(is);
    const halo = glowSprite('#ff7a2a', 4 * ts, 0.35); scene.add(halo);
    const flash = glowSprite('#fff1c4', 6, 0); scene.add(flash);
    // debris: instanced rocks, each with a launch direction, then an orbit in the disk plane
    const N = 900, r = rng(91);
    const rock = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.03, 0),
      new THREE.MeshBasicMaterial({ color: col('#ffb057') }), N);
    scene.add(rock);
    const D = Array.from({ length: N }, () => {
      const u = r() * 2 - 1, a = r() * 6.283, s = Math.sqrt(1 - u * u);
      return { dir: V3(Math.cos(a) * s, u * 0.6, Math.sin(a) * s).normalize(), sp: 0.6 + r() * 1.6, R: ts * (1.5 + r() * 2.2),
               a0: r() * 6.283, y: (r() - 0.5) * 0.12, sz: 0.5 + r() * 1.5, k: r() };
    });
    const moon = bodyMesh(renderer, 1, 5, sun, 64); scene.add(moon.mesh);
    const lblE = labels.add('counter'), lblT = labels.add('counter');
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V3(1, 1, 1), pos = V3(0, 0, 0);
    const MOON_R = ts * 3.2, MOON_A = 0.6;
    return {
      update(lt, dur, cues, env) {
        const t = env.t; stars(t);
        const hit = cue(cues, 'hit', stage === 'impact' ? Math.min(1.6, dur * 0.4) : 0.8);
        const cam = Object.assign({ dist: H > W ? 11 : 8.5, yaw: 18, pitch: 16, fov: 34 }, P.camera || {});
        cam.yaw += t * 1.5;
        applyCam(camera, camLerp(Object.assign({}, cam, { dist: cam.dist * 1.15 }), cam, progIO(lt, 0, 1.5)), W, H);
        earth.U.uT.value = theia.U.uT.value = t;
        earth.mesh.rotation.y = t * 0.08;
        // theia path: from upper right towards a grazing hit
        let tp = 0, show = stage === 'approach' || stage === 'impact';
        if (stage === 'approach') tp = lin(lt, 0, dur) * 0.55;
        if (stage === 'impact') tp = Math.min(1, 0.55 + 0.45 * EASE_IO(clamp01(lt / hit)));
        const start = H > W ? V3(2.2 * ts, 2.8 * ts, 0) : V3(4.4 * ts, 0.8 * ts, 0.3), end = V3((ts + is) * 0.72, (ts + is) * 0.45, 0);
        theia.mesh.position.copy(start.clone().lerp(end, tp));
        theia.mesh.visible = show && !(stage === 'impact' && lt > hit + 0.15);
        theia.mesh.rotation.y = -t * 0.2;
        const boom = stage === 'impact' ? clamp01((lt - hit) / 2.5) : 0;
        earth.U.uHeat.value = stage === 'impact' ? lerp(0.35, 1.0, clamp01((lt - hit) * 2)) : stage === 'approach' ? 0.35 : stage === 'disk' ? 0.8 : 0.6;
        const fp = stage === 'impact' ? punch(lt, hit, 1.6) : 0;
        flash.material.opacity = fp; flash.scale.setScalar(4 + 8 * fp);
        flash.position.copy(end);
        halo.material.opacity = 0.3 + 0.4 * earth.U.uHeat.value * 0.5;
        // debris
        const ex = boom, disk = stage === 'disk' ? 1 : stage === 'moon' ? 1 : 0;
        const gather = stage === 'moon' ? progIO(lt, hit - 0.5, Math.max(1.5, dur - hit)) : 0;
        const ma = MOON_A + t * 0.12;
        const mpos = V3(Math.cos(ma) * MOON_R, 0, Math.sin(ma) * MOON_R);
        for (let i = 0; i < N; i++) {
          const d = D[i];
          let x = 0, y = 0, z = 0, s = 0;
          if (stage === 'impact' && lt > hit) {
            const dist = (ts + 0.1) + d.sp * Math.pow(ex, 0.6) * 2.4;
            const p = end.clone().normalize().multiplyScalar(ts * 0.9).add(d.dir.clone().multiplyScalar(dist - ts * 0.9 + 0.2));
            x = p.x; y = p.y; z = p.z; s = d.sz * (1 - 0.3 * ex);
          } else if (disk) {
            const a = d.a0 + t * (0.9 / Math.pow(d.R / ts, 1.5));
            x = Math.cos(a) * d.R; y = d.y * (1 - gather); z = Math.sin(a) * d.R; s = d.sz * 0.8;
            if (gather > 0) {
              const g = clamp01(gather * (1.2 - d.k * 0.4));
              x = lerp(x, mpos.x, g); y = lerp(y, 0, g); z = lerp(z, mpos.z, g); s *= 1 - g;
            }
          }
          pos.set(x, y, z); sc.setScalar(Math.max(s, 0.0001));
          m4.compose(pos, q, sc); rock.setMatrixAt(i, m4);
        }
        rock.instanceMatrix.needsUpdate = true;
        rock.visible = (stage === 'impact' && lt > hit) || disk > 0;
        moon.mesh.visible = stage === 'moon';
        if (stage === 'moon') { moon.mesh.position.copy(mpos); moon.mesh.scale.setScalar(Math.max(0.001, 0.27 * ts * gather)); moon.set(t, t * 0.05); }
        // labels
        const L = P.labels || {};
        const se = toScreen(V3(0, -ts - 0.35, 0), camera, W, H);
        lblE.set(L.target ? `<b style="font-size:${H > W ? 64 : 52}px">${L.target}</b>` : '', se[0], se[1] + 30, L.target ? prog(lt, 0.3, 0.6) : 0);
        const st = toScreen(theia.mesh.position.clone().add(V3(0, is + 0.3, 0)), camera, W, H);
        lblT.set(L.impactor ? `<b style="font-size:${H > W ? 64 : 52}px;color:${pal.accent}">${L.impactor}</b>` : '', st[0], st[1] - 20,
          L.impactor && theia.mesh.visible ? prog(lt, 0.5, 0.6) : 0);
      },
    };
  },
};

// ------------------------------------------------------------ orbit3d: a planet with its moon on an orbit ring
// P: {center: "earth", satellite: "moon", sat_size: 0.27, dist: 3.2, label: "384.400 km", recede: "+3,8 cm/yıl",
//     laser: true, tides: true, camera: {...}}   cues: hit (laser fires / recede label)
SHOTS.orbit3d = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels, renderer } = ctx;
    const sun = V3(-0.8, 0.35, 0.5).normalize();
    const stars = starfield(scene, 55);
    const kinds = { earth: 0, moon: 1, mars: 2, sun: 3 };
    const A = bodyMesh(renderer, kinds[P.center || 'earth'] ?? 0, 3 * 1.37, sun); scene.add(A.mesh);
    const B = bodyMesh(renderer, kinds[P.satellite || 'moon'] ?? 1, 5, sun, 64); scene.add(B.mesh);
    const ss = P.sat_size ?? 0.27, R0 = P.dist ?? 3.2;
    B.mesh.scale.setScalar(ss);
    const halo = glowSprite(pal.glow, 3.4, 0.3); scene.add(halo);
    const ringGeo = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 181 }, (_, i) => V3(Math.cos(i / 180 * 6.283), 0, Math.sin(i / 180 * 6.283))));
    const ring = new THREE.Line(ringGeo, new THREE.LineDashedMaterial({ color: col(pal.accent2), dashSize: 0.04, gapSize: 0.03, transparent: true, opacity: 0.5 }));
    ring.computeLineDistances(); scene.add(ring);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8, 1), new THREE.MeshBasicMaterial({ color: col('#ff3b3b'), transparent: true }));
    scene.add(beam);
    const spot = glowSprite('#ff4b4b', 0.25, 0); scene.add(spot);
    let tide = null;
    if (P.tides) {
      tide = new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 48), new THREE.MeshBasicMaterial({ color: col('#4aa3ff'), transparent: true, opacity: 0.32, depthWrite: false }));
      scene.add(tide);
    }
    const lblD = labels.add('counter'), lblR = labels.add('counter');
    const up = V3(0, 1, 0);
    const meas = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V3(0, 0, 0), V3(1, 0, 0)]),
      new THREE.LineBasicMaterial({ color: col(pal.accent), transparent: true, opacity: 0 }));
    scene.add(meas);
    return {
      update(lt, dur, cues, env) {
        const t = env.t; stars(t);
        const hit = cue(cues, 'hit', Math.min(1.2, dur * 0.4));
        const cam = Object.assign({ dist: H > W ? 10.5 : 2.2 + R0 * 1.6, yaw: 0, pitch: 22, fov: 34, tx: R0 * 0.5 }, P.camera || {});
        applyCam(camera, camLerp(Object.assign({}, cam, { dist: cam.dist * 1.15, yaw: cam.yaw - 8 }), cam, progIO(lt, 0, 1.6)), W, H);
        A.set(t, t * 0.12);
        const R = R0 * (1 + (P.recede ? 0.12 * progIO(lt, hit, Math.max(1, dur - hit)) : 0));
        ring.scale.setScalar(R);
        const ang = (P.angle ?? 0.25) - lt * (P.orbit_speed ?? 0.04);
        const mp = V3(Math.cos(ang) * R, 0, Math.sin(ang) * R);
        B.mesh.position.copy(mp); B.set(t, -ang);   // tidally locked: same face to the planet
        halo.position.set(0, 0, 0);
        // laser: Earth -> Moon, pulses after the cue
        const lp = P.laser ? prog(lt, hit, 0.6) : 0;
        if (lp > 0) {
          const from = mp.clone().normalize().multiplyScalar(1.0), to = mp.clone().sub(mp.clone().normalize().multiplyScalar(ss));
          const len = from.distanceTo(to) * lp;
          beam.position.copy(from.clone().add(to.clone().sub(from).normalize().multiplyScalar(len / 2)));
          beam.scale.set(1, Math.max(len, 0.001), 1);
          beam.quaternion.setFromUnitVectors(up, to.clone().sub(from).normalize());
          beam.material.opacity = 0.65 + 0.35 * Math.sin(t * 30);
          spot.position.copy(to); spot.material.opacity = lp >= 1 ? 0.9 + 0.1 * Math.sin(t * 25) : 0;
        }
        beam.visible = lp > 0;
        if (tide) {
          const k = 1 + 0.2 * prog(lt, hit, 1.0);
          tide.scale.set(k * 1.03, 1.0, 1.03);
          tide.rotation.y = -ang;
        }
        // measuring line from the planet's surface to the moon, label above its middle
        const a0 = mp.clone().normalize().multiplyScalar(1.08), a1 = mp.clone().sub(mp.clone().normalize().multiplyScalar(ss * 1.2));
        meas.geometry.setFromPoints([a0.clone().add(V3(0, -0.02, 0)), a1.clone().add(V3(0, -0.02, 0))]);
        meas.material.opacity = P.label ? 0.85 * prog(lt, 0.3, 0.6) : 0;
        const mid = toScreen(a0.clone().lerp(a1, 0.5).add(V3(0, 0.3, 0)), camera, W, H);
        lblD.set(P.label ? `<b style="font-size:${H > W ? 80 : 64}px;color:${pal.accent}">${P.label}</b>` : '', mid[0], mid[1], P.label ? prog(lt, 0.4, 0.6) : 0);
        const ms = toScreen(mp.clone().add(V3(0, ss + 0.45, 0)), camera, W, H);
        lblR.set(P.recede ? `<b style="font-size:${H > W ? 72 : 56}px;color:${pal.ink}">${P.recede}</b>` : '', ms[0], ms[1], P.recede ? prog(lt, hit, 0.6) : 0);
      },
    };
  },
};

// ------------------------------------------------------------ owl: a stylised 3D owl on a branch; the head swivels, x-ray shows the neck
// P: {turn: 270 (degrees the head swivels at the cue; + = to its left), arc: true (swept-angle ring + degree counter),
//     xray: true (body fades, neck vertebrae light up one by one), vertebrae: 14, counter: {label: "boyun omuru"},
//     eyes: true (pulsing rings around the eyes), camera: {...}}   cues: hit (turn / x-ray start)
function featherTexture(base, dark, light, seed) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++) {           // small chevron-shaped feather marks
    const x = r() * 512, y = r() * 512, s = 6 + r() * 12;
    g.strokeStyle = r() < 0.6 ? dark : light; g.globalAlpha = 0.25 + r() * 0.45; g.lineWidth = 2 + r() * 2.5;
    g.beginPath(); g.moveTo(x - s, y - s * 0.5); g.lineTo(x, y + s * 0.3); g.lineTo(x + s, y - s * 0.5); g.stroke();
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2);
  return t;
}
SHOTS.owl = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels } = ctx;
    const portrait = H > W;
    const mats = [];
    const M = (o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0, transparent: true }, o)); mats.push(m); return m; };
    const feather = featherTexture('#8a6440', '#3b2614', '#d9bf94', 7);
    const belly = featherTexture('#e3cfa8', '#7a5532', '#fff4dc', 9);
    const mBody = M({ map: feather }), mBelly = M({ map: belly }), mFace = M({ color: col('#efe2c6'), roughness: 0.95 });
    const mWing = M({ map: feather, color: col('#b89a7a') }), mBeak = M({ color: col('#4a3a2a'), roughness: 0.5 });
    const mIris = M({ color: col('#ffb21f'), emissive: col('#ff8a00'), emissiveIntensity: 0.35, roughness: 0.3 });
    const mPupil = new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.15, metalness: 0.2, transparent: true }); mats.push(mPupil);
    const mFoot = M({ color: col('#c99a4a') }), mBranch = M({ color: col('#4a3020'), roughness: 1 });
    const S = (r, w = 48, h = 36) => new THREE.SphereGeometry(r, w, h);
    const owl = new THREE.Group(); scene.add(owl);
    const body = new THREE.Mesh(S(1), mBody); body.scale.set(0.95, 1.25, 0.82); body.position.set(0, -0.95, 0); owl.add(body);
    const bel = new THREE.Mesh(S(1), mBelly); bel.scale.set(0.7, 1.0, 0.5); bel.position.set(0, -1.05, 0.38); owl.add(bel);
    for (const s of [-1, 1]) {
      const w = new THREE.Mesh(S(1), mWing); w.scale.set(0.32, 1.05, 0.62); w.position.set(s * 0.82, -1.0, -0.05); w.rotation.z = s * 0.12; owl.add(w);
      for (let k = -1; k <= 1; k++) {
        const f = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 12), mFoot); f.position.set(s * 0.32 + k * 0.08, -2.2, 0.32); f.rotation.x = 1.9; owl.add(f);
      }
    }
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 6, 20), mBranch); branch.rotation.z = Math.PI / 2 + 0.06; branch.position.set(0.3, -2.33, 0.1); owl.add(branch);
    // head on a pivot so it swivels around the neck axis
    const head = new THREE.Group(); head.position.set(0, 0.35, 0); owl.add(head);
    const skull = new THREE.Mesh(S(0.88), mBody); skull.scale.set(1.12, 0.92, 0.95); skull.position.y = 0.42; head.add(skull);
    const eyes = [];
    for (const s of [-1, 1]) {
      const disc = new THREE.Mesh(S(0.44), mFace); disc.scale.set(1, 1.05, 0.38); disc.position.set(s * 0.34, 0.46, 0.62); head.add(disc);
      const iris = new THREE.Mesh(S(0.2, 32, 24), mIris); iris.scale.z = 0.55; iris.position.set(s * 0.34, 0.5, 0.79); head.add(iris);
      const pup = new THREE.Mesh(S(0.115, 24, 18), mPupil); pup.scale.z = 0.5; pup.position.set(s * 0.34, 0.5, 0.87); head.add(pup);
      const glint = glowSprite('#ffffff', 0.12, 0.9); glint.position.set(s * 0.34 - 0.05, 0.56, 0.95); head.add(glint);
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.5, 16), mBody); tuft.position.set(s * 0.55, 1.15, 0.12); tuft.rotation.z = -s * 0.45; head.add(tuft);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.018, 8, 48), new THREE.MeshBasicMaterial({ color: col(pal.accent), transparent: true, opacity: 0 }));
      ring.position.set(s * 0.34, 0.5, 0.9); head.add(ring); eyes.push(ring);
    }
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 16), mBeak); beak.position.set(0, 0.24, 0.86); beak.rotation.x = Math.PI + 0.5; head.add(beak);
    // x-ray neck: vertebrae along a gentle S-curve from the shoulders into the head
    const nv = P.vertebrae || 14, verts = [];
    const vMat = new THREE.MeshStandardMaterial({ color: col('#f4efe6'), emissive: col(pal.accent), emissiveIntensity: 0.6, roughness: 0.4, transparent: true, opacity: 0 });
    const neckPt = u => V3(0, lerp(-0.75, 0.6, u), -0.12 + 0.12 * Math.sin(u * Math.PI * 1.6));
    for (let i = 0; i < nv; i++) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, (1.35 / nv) * 0.62, 20), vMat.clone());
      v.position.copy(neckPt((i + 0.5) / nv)); owl.add(v); verts.push(v);
    }
    // artery up the neck + two blood pockets under the head (x-ray)
    let artery = null; const pockets = [];
    if (P.artery) {
      const curve = new THREE.CatmullRomCurve3(Array.from({ length: 9 }, (_, i) => neckPt(i / 8).add(V3(0.17, 0, 0.05))));
      const aMat = new THREE.MeshStandardMaterial({ color: col('#ff2a2a'), emissive: col('#ff1a1a'), emissiveIntensity: 0.8, roughness: 0.4, transparent: true, opacity: 0 });
      artery = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.05, 10), aMat); owl.add(artery);
      for (const s of [-1, 1]) {
        const pk = new THREE.Mesh(S(0.14, 24, 18), aMat.clone()); pk.position.set(s * 0.22, 0.62, 0.02); owl.add(pk); pockets.push(pk);
      }
    }
    // swept-angle ring around the neck
    let arc = null, tip = null;
    const arcMat = new THREE.MeshBasicMaterial({ color: col(pal.accent), transparent: true });
    if (P.arc) { tip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 16), arcMat); owl.add(tip); }
    scene.add(new THREE.HemisphereLight(0xfff1dc, 0x1a120a, 1.3));
    const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-3, 4, 5); scene.add(key);
    const rim = new THREE.PointLight(col(pal.accent2), 40, 20); rim.position.set(2.5, 1.5, -3); scene.add(rim);
    const glow = glowSprite(pal.glow, 8, 0.35); glow.position.set(0, -0.3, -2.5); scene.add(glow);
    const lbl = labels.add('counter');
    const turn = P.turn || 0;
    return {
      update(lt, dur, cues, env) {
        const t = env.t;
        const hit = cue(cues, 'hit', Math.min(1.0, dur * 0.35));
        const enter = spring(lt, 0, 0.9);
        owl.scale.setScalar(0.85 + 0.15 * enter);
        owl.position.y = 0.03 * Math.sin(t * 2.1);
        body.scale.y = 1.25 * (1 + 0.012 * Math.sin(t * 3.2));                  // breathing
        const tp = turn ? progIO(lt, hit, P.turn_dur || 1.8) : 0;
        const look = turn ? 0 : 0.18 * Math.sin(t * 0.9);                          // idle glance when not turning
        head.rotation.y = turn * DEG * tp + look;
        head.rotation.z = 0.06 * Math.sin(t * 1.3) * (1 - tp * 0.5);
        const blink = (Math.sin(t * 0.8) > 0.985) ? 0.15 : 1;
        mIris.emissiveIntensity = 0.35 + 0.6 * punch(lt, hit, 0.8);
        eyes.forEach(r => { r.scale.y = blink; });
        eyes.forEach((r, i) => { const a = P.eyes ? prog(lt, hit, 0.4) : 0; r.material.opacity = a * (0.6 + 0.4 * Math.sin(t * 6 + i)); r.scale.setScalar(1 + 0.15 * Math.sin(t * 6 + i)); });
        // x-ray
        const xr = P.vert_all ? prog(lt, 0, 0.5) : P.xray ? progIO(lt, hit, 0.8) : 0;
        mats.forEach(m => { if (m !== vMat) { m.opacity = 1 - 0.8 * xr; m.depthWrite = xr < 0.5; } });
        if (artery) {
          const ap = prog(lt, hit - 0.6, 0.6), sw = spring(lt, hit, 0.9);
          artery.material.opacity = ap; artery.material.emissiveIntensity = 0.6 + 0.4 * Math.sin(t * 7);
          pockets.forEach((pk, i) => { pk.material.opacity = ap; pk.scale.setScalar(0.5 + 0.9 * sw + 0.08 * Math.sin(t * 7 + i)); pk.material.emissiveIntensity = 0.7 + 0.8 * punch(lt, hit, 0.8); });
        }
        const shown = P.vert_all ? nv : P.xray ? Math.min(nv, Math.floor(lin(lt, hit + 0.4, P.count_dur || 1.6) * nv + 0.0001)) : 0;
        verts.forEach((v, i) => {
          const on = i < shown ? 1 : 0, ap = P.vert_all ? 0.7 * prog(lt, 0.2, 0.5) : on ? prog(lt, hit + 0.4 + (i / nv) * (P.count_dur || 1.6), 0.35) : 0;
          v.material.opacity = ap; v.scale.setScalar(0.6 + 0.4 * spring(lt, P.vert_all ? 0.2 : hit + 0.4 + (i / nv) * (P.count_dur || 1.6), 0.5));
          v.material.emissiveIntensity = 0.45 + 0.4 * Math.sin(t * 4 + i * 0.6);
        });
        // arc
        if (P.arc) {
          const ang = Math.max(0.001, Math.abs(turn) * DEG * tp);
          if (arc) { owl.remove(arc); arc.geometry.dispose(); }
          arc = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.05, 10, Math.max(8, Math.round(ang * 30)), ang), arcMat);
          arc.rotation.x = Math.PI / 2; arc.rotation.z = Math.PI / 2; arc.scale.y = -Math.sign(turn || 1);   // starts in front (+z), sweeps with the head
          arc.position.y = 0.6; owl.add(arc);
          const a = Math.sign(turn || 1) * ang;
          tip.position.set(Math.sin(a) * 1.32, 0.6, Math.cos(a) * 1.32);
          tip.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(Math.cos(a) * Math.sign(turn || 1), 0, -Math.sin(a) * Math.sign(turn || 1)));
          arcMat.opacity = tp > 0.01 ? 0.95 : 0; tip.visible = tp > 0.02;
        }
        const cam = Object.assign({ dist: portrait ? 12.5 : 8.5, yaw: 0, pitch: 24, fov: 32, ty: portrait ? -0.75 : -0.6, tx: portrait ? 0 : -1.2 }, P.camera || {});
        const c = camLerp(Object.assign({}, cam, { dist: cam.dist * 1.2, yaw: cam.yaw + 10 }), cam, progIO(lt, 0, 1.5));
        c.yaw += (P.camera && P.camera.drift != null ? P.camera.drift : 1.5) * lt;
        applyCam(camera, c, W, H);
        // counter: degrees for the turn, vertebra count for x-ray
        let html = '', alpha = 0;
        if (P.arc) { html = `<b style="font-size:${portrait ? 170 : 120}px;color:${pal.accent}">${Math.round(Math.abs(turn) * tp)}°</b><small style="font-size:46px">${(P.counter && P.counter.label) || ''}</small>`; alpha = prog(lt, hit, 0.4); }
        else if (P.xray && !P.vert_all) { html = `<b style="font-size:${portrait ? 170 : 120}px;color:${pal.accent}">${shown}</b><small style="font-size:46px">${(P.counter && P.counter.label) || ''}</small>`; alpha = prog(lt, hit + 0.3, 0.4); }
        lbl.set(P.counter ? html : '', portrait ? W * 0.8 : W * 0.75, portrait ? H * 0.36 : H * 0.4, P.counter ? alpha : 0);
        glow.material.opacity = 0.3 + 0.15 * Math.sin(t * 1.5) + 0.3 * punch(lt, hit, 0.8);
      },
    };
  },
};
