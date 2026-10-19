// volcano: Vesuvius and the Bay of Naples as one 3D world (79 AD), for any "volcano buries a town" story.
// Terrain (land/sea map + cone) is built once on the CPU; clouds are one Points draw call with a baked puff texture.
// P: {mode: "profile"|"column"|"fall"|"surge", camera: {...},
//     labels: [{target: "vesuvius"|"pompeii"|"herculaneum"|"stabiae"|"misenum"|"naples"|"top"|"column"|"zone"|"chamber"|"ship"|"front",
//               text, sub, at: "hit"|"_start"|<cue>, dx, dy, size, color: "ink"|"red"}]
//  profile: the quiet volcano. {chamber: true (glowing magma chamber seen through the cone, swells at hit),
//           route: ["misenum", "stabiae"] (dashed sea route + ship, ship arrives at hit), zone: true (red danger ring),
//           today: true (modern city lights + sensors pinging on the flanks)}
//  column : Plinian eruption column rising to `height_km` (default 30) with an umbrella / pine-tree top, a km ruler
//           {grow: true (rises from the crater, tops out at hit), ruler: true, marks: [{km: 10, text: "yolcu uçağı"}],
//            counter: {to: "30", prefix: "~", unit: "KM", label: "yükseklik"}}
//  fall   : close-up of the town under the pumice rain; a pale pumice layer rises around the houses.
//           {layer: [from, to] (0..1 of full depth over the scene), collapse: true (roofs cave in one by one from hit),
//            counter: {from: "0", to: "2,5", unit: "M", label: "süngertaşı"}}
//  surge  : the column collapses (collapse: true) and a glowing ground-hugging cloud races down the flanks.
//           {from: 0, to: 3 (front radius in world units; Herculaneum ≈ 2.8, Pompeii ≈ 3.7), reach: "herculaneum"|"pompeii"
//            (sets `to` and flashes that town when the front arrives at hit)}
// cues: hit (see modes)
// Consecutive volcano scenes share one world: the camera glides from one framing to the next (match cut).
'use strict';

const VC = {
  // 1 unit ≈ 2.5 km; x = east, z = south (camera looks north by default)
  towns: { pompeii: [2.0, 3.1], herculaneum: [-2.76, 0.6], stabiae: [1.7, 5.3], misenum: [-11.8, 1.8], naples: [-5.4, -1.2] },
  coast: [[-26, -7], [-12, -4.2], [-5.6, -1.9], [-3.8, 0.0], [-2.9, 0.85], [-1.6, 2.2], [0.2, 3.4], [1.1, 3.9], [1.25, 4.7], [1.2, 5.5],
    [0.4, 6.3], [-1.6, 7.0], [-3.6, 7.7], [-6.5, 8.4], [-9.0, 9.4], [-12.5, 10.2], [-26, 11]],
  // the far shore (Misenum / Campi Flegrei)
  west: [[-30, -6], [-16, -5.4], [-13.4, -3.0], [-12.4, -0.6], [-11.2, 1.0], [-11.4, 2.5], [-12.6, 3.0], [-14.5, 2.4], [-30, 4]],
};
function vcInPoly(x, z, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
}
const VC_LAND = (() => { const c = VC.coast; return c.concat([[-26, 40], [40, 40], [40, -40], [-26, -40]]); })();
function vcIsLand(x, z) { return vcInPoly(x, z, VC_LAND) || vcInPoly(x, z, VC.west); }
// signed distance to the shore (+ on land), so beaches slope smoothly into the sea
function vcSegD(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp01(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz));
  return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t);
}
function vcShore(x, z) {
  let d = 1e9;
  for (const poly of [VC.coast, VC.west]) for (let i = 0; i + 1 < poly.length; i++) d = Math.min(d, vcSegD(x, z, poly[i], poly[i + 1]));
  return vcIsLand(x, z) ? d : -d;
}
const vcSmooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function vcNoise(x, z) {
  return 0.5 * Math.sin(x * 1.3 + Math.sin(z * 0.7) * 1.7) * Math.cos(z * 1.1 - x * 0.4) + 0.3 * Math.sin(x * 3.1 + z * 2.3) * Math.sin(z * 2.9 - x * 1.7)
    + 0.2 * Math.sin(x * 7.3 - z * 5.1) * Math.cos(x * 4.7 + z * 6.3);
}
// terrain height (units): sea floor below 0, land just above, the cone, the Lattari hills to the south
function vcHeight(x, z) {
  const sd = vcShore(x, z);
  if (sd < -0.25) return -0.08;
  const shore = vcSmooth(-0.25, 0.25, sd), inland = vcSmooth(0.0, 0.5, sd);
  const r = Math.hypot(x, z), dp = Math.hypot(x - VC.towns.pompeii[0], z - VC.towns.pompeii[1]);
  let h = lerp(-0.08, 0.035, shore) + 0.02 * (vcNoise(x, z) + 1) * inland * vcSmooth(0.6, 1.8, dp);
  // cone (vertical scale ×1.6) with a crater
  const cone = r < 2.9 ? 1.38 * Math.pow(1 - r / 2.9, 1.3) : 0;
  const ridge = 0.03 * Math.sin(Math.atan2(z, x) * 9 + r * 4) * vcSmooth(0.3, 1.2, r) * (1 - vcSmooth(1.8, 2.9, r));
  h += cone + ridge - 0.2 * (1 - vcSmooth(0.0, 0.28, r));
  // Lattari mountains (Sorrento peninsula) and low hills inland
  h += inland * 0.42 * vcSmooth(6.0, 8.5, z) * (0.6 + 0.4 * vcNoise(x * 0.5, z * 0.5)) * (1 - vcSmooth(10, 14, z));
  h += inland * 0.12 * vcSmooth(6, 12, -z + x * 0.2) * (0.5 + 0.5 * vcNoise(x * 0.4 + 3, z * 0.4));
  if (vcInPoly(x, z, VC.west)) h += 0.1 * (0.6 + 0.4 * vcNoise(x * 0.8, z * 0.8)) * inland;
  return h;
}

// soft cloud puff (alpha) painted once
let _vcPuff;
function vcPuffTex() {
  if (_vcPuff) return _vcPuff;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = rng(311);
  for (let i = 0; i < 34; i++) {
    const a = r() * 6.28, d = r() * 22, x = 64 + Math.cos(a) * d, y = 64 + Math.sin(a) * d, rad = 12 + r() * (58 - 12 - d);
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, 'rgba(255,255,255,0.6)'); gr.addColorStop(0.55, 'rgba(255,255,255,0.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  }
  _vcPuff = new THREE.CanvasTexture(c);
  return _vcPuff;
}
// one Points cloud with per-point size / colour / alpha (CPU-updated, one draw call)
function vcCloud(scene, n, pxScale, blending) {
  const pos = new Float32Array(n * 3), size = new Float32Array(n), colr = new Float32Array(n * 3), alpha = new Float32Array(n);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  geo.setAttribute('tint', new THREE.BufferAttribute(colr, 3));
  geo.setAttribute('alpha', new THREE.BufferAttribute(alpha, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { uMap: { value: vcPuffTex() }, uScale: { value: pxScale } },
    vertexShader: `attribute float size; attribute vec3 tint; attribute float alpha; varying vec3 vC; varying float vA; uniform float uScale;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vC = tint; vA = alpha;
        gl_PointSize = min(420.0, size * uScale / max(0.1, -mv.z)); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D uMap; varying vec3 vC; varying float vA;
      void main(){ float a = texture2D(uMap, gl_PointCoord).a; gl_FragColor = vec4(vC, a * vA); }`,
    transparent: true, depthWrite: false, blending: blending || THREE.NormalBlending,
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);
  const c = new THREE.Color();
  return {
    n, set(i, x, y, z, s, hex, a) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; size[i] = s; alpha[i] = a;
      c.set(hex); colr[i * 3] = c.r; colr[i * 3 + 1] = c.g; colr[i * 3 + 2] = c.b;
    },
    setRGB(i, x, y, z, s, rr, gg, bb, a) {
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; size[i] = s; alpha[i] = a;
      colr[i * 3] = rr; colr[i * 3 + 1] = gg; colr[i * 3 + 2] = bb;
    },
    flush() { for (const k of ['position', 'size', 'tint', 'alpha']) geo.attributes[k].needsUpdate = true; },
  };
}

SHOTS.volcano = {
  kind: '3d',
  build(ctx) {
    const { P, pal, W, H, scene, camera, labels } = ctx;
    const mode = P.mode || 'profile', portrait = H > W;
    const pxScale = H * 0.9;
    // ---------------------------------------------------------------- terrain
    const SZ = 72, SEG = 380;
    const geo = new THREE.PlaneGeometry(SZ, SZ, SEG, SEG); geo.rotateX(-Math.PI / 2);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) pa.setY(i, vcHeight(pa.getX(i), pa.getZ(i)));
    geo.computeVertexNormals();
    const S = 1024, map = (() => {
      const c = document.createElement('canvas'); c.width = c.height = S;
      const g = c.getContext('2d'), r = rng(57);
      const px = x => (x + SZ / 2) / SZ * S, pz = z => (z + SZ / 2) / SZ * S;
      g.fillStyle = '#123c52'; g.fillRect(0, 0, S, S);
      const poly = pts => { g.beginPath(); pts.forEach(([x, z], k) => (k ? g.lineTo : g.moveTo).call(g, px(x), pz(z))); g.closePath(); };
      g.save(); poly(VC_LAND); g.clip(); g.fillStyle = '#6f7a3e'; g.fillRect(0, 0, S, S);
      for (let i = 0; i < 520; i++) {           // fields and vineyards
        const x = r() * S, y = r() * S, rad = 8 + r() * 34;
        g.fillStyle = ['#7e8a44', '#5f6d33', '#9a8a4e', '#86783e', '#6a7a3a', '#a89458'][i % 6]; g.globalAlpha = 0.55;
        g.beginPath(); g.ellipse(x, y, rad * (1 + r()), rad, r() * 3, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
      // the cone: darker, ash-grey towards the top, radial gullies
      const cx = px(0), cz = pz(0), cr = 2.9 / SZ * S;
      const gr = g.createRadialGradient(cx, cz, 0, cx, cz, cr * 1.1);
      gr.addColorStop(0, '#7a6a58'); gr.addColorStop(0.3, '#8f7c62'); gr.addColorStop(0.65, '#86884e'); gr.addColorStop(1, 'rgba(107,106,60,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cz, cr * 1.1, 0, 7); g.fill();
      g.strokeStyle = 'rgba(60,44,30,.18)'; g.lineWidth = 2;
      for (let i = 0; i < 60; i++) { const a = r() * 6.28, a2 = a + (r() - 0.5) * 0.2; g.beginPath(); g.moveTo(cx + Math.cos(a) * cr * 0.12, cz + Math.sin(a) * cr * 0.12); g.lineTo(cx + Math.cos(a2) * cr * (0.6 + 0.4 * r()), cz + Math.sin(a2) * cr * (0.6 + 0.4 * r())); g.stroke(); }
      g.restore();
      g.save(); poly(VC.west); g.fillStyle = '#6a7240'; g.fill(); g.restore();
      // beaches
      g.strokeStyle = '#c9b27a'; g.lineWidth = 3; poly(VC.coast.slice(1, -1).concat([])); g.beginPath();
      VC.coast.forEach(([x, z], k) => (k ? g.lineTo : g.moveTo).call(g, px(x), pz(z))); g.stroke();
      const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
    })();
    const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map, roughness: 0.95, metalness: 0 }));
    scene.add(ground);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(SZ, SZ), new THREE.MeshStandardMaterial({ color: col('#1a5a78'), roughness: 0.28, metalness: 0.2, transparent: true, opacity: 0.88 }));
    sea.rotation.x = -Math.PI / 2; sea.position.y = 0.0; scene.add(sea);
    const camD = (P.camera && P.camera.dist) || { profile: 12.5, column: 34, fall: 2.6, surge: 12 }[mode] || 12;
    scene.fog = new THREE.Fog(col(pal.bg[1]), camD * (mode === 'fall' ? 0.9 : 0.55), camD + (mode === 'fall' ? 4 : 30));
    const dark = mode === 'fall' || mode === 'surge', night = !!P.today;
    const sunL = new THREE.DirectionalLight(0xfff0d8, mode === 'fall' ? 0.45 : dark ? 1.1 : night ? 0.55 : 2.4); sunL.position.set(-6, 9, 8); scene.add(sunL);
    scene.add(new THREE.HemisphereLight(0xbfd4ff, 0x3a2a18, mode === 'fall' ? 0.35 : dark ? 0.45 : night ? 0.35 : 0.8));
    if (mode === 'fall' || night) ground.material.color.set(mode === 'fall' ? 0x8a8580 : 0x7a8098);
    if (P.autumn) {          // low, warm autumn sun: long shadows of light, golden fields
      sunL.color.set(0xffb26a); sunL.intensity = 2.0; sunL.position.set(-12, 3.5, 5);
      ground.material.color.set(0xf0c890);
    }
    const warm = new THREE.PointLight(col(pal.glow), dark ? 14 : 0, 14); warm.position.set(0, 2.2, 1.5); scene.add(warm);
    const H0 = (x, z) => Math.max(0, vcHeight(x, z));
    // ---------------------------------------------------------------- towns (houses with roofs) + markers
    const r = rng(7 + (P.seed || 0));
    const houses = [];
    const mWall = new THREE.MeshStandardMaterial({ color: col('#d8c6a2'), roughness: 0.9 });
    const mRoof = new THREE.MeshStandardMaterial({ color: col('#a8492e'), roughness: 0.8 });
    const townDef = { pompeii: [9, 0.075], herculaneum: [5, 0.06], stabiae: [4, 0.05], misenum: [4, 0.06], naples: [6, 0.06] };
    const markers = {};
    for (const [name, [tx, tz]] of Object.entries(VC.towns)) {
      const [n, s] = townDef[name];
      for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
        if (r() < 0.22) continue;
        const w = s * (0.7 + 0.6 * r()), d = s * (0.7 + 0.6 * r()), h = s * (mode === 'fall' && name === 'pompeii' ? 0.9 + 0.5 * r() : 0.5 + 0.5 * r());
        const x = tx + (a - n / 2) * s * 1.35, z = tz + (b - n / 2) * s * 1.35, y = H0(x, z);
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mWall); wall.position.set(x, y + h / 2, z); scene.add(wall);
        const roof = new THREE.Mesh(new THREE.BoxGeometry(w * 1.08, h * 0.22, d * 1.08), P.collapse ? mRoof.clone() : mRoof);
        if (P.chamber && z > 0) { wall.visible = false; roof.visible = false; } roof.position.set(x, y + h + h * 0.11, z); scene.add(roof);
        if (P.ruins && name === 'pompeii') roof.visible = false;               // roofs long gone, only wall stubs
        houses.push({ name, roof, y0: roof.position.y, base: y, h, ord: r(), tilt: (r() - 0.5) * 0.9 });
      }
      const m = glowSprite(pal.accent, name === 'pompeii' ? 0.9 : 0.6, 0.55); m.position.set(tx, H0(tx, tz) + 0.15, tz); scene.add(m);
      if (mode === 'fall' || (P.chamber && tz > 0)) m.visible = false;
      markers[name] = m;
    }
    // a pulsing target ring around one town (P.ring: "pompeii")
    let ring = null;
    if (P.ring && VC.towns[P.ring]) {
      const [x, z] = VC.towns[P.ring];
      ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.62, 64), new THREE.MeshBasicMaterial({ color: col(pal.accent), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, depthTest: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, H0(x, z) + 0.06, z); scene.add(ring);
    }
    // ---------------------------------------------------------------- crater glow, chamber, zone, route, city lights, sensors
    const crater = glowSprite(pal.glow, 1.2, 0.3); crater.position.set(0, 1.25, 0); scene.add(crater);
    let chamber = null, bubbles = [];
    const CH_Y = -1.9;
    if (P.chamber) {
      // cutaway: everything in front of the z = 0 plane is clipped, a painted rock section fills the cut
      if (ctx.renderer) ctx.renderer.localClippingEnabled = true;
      const clip = [new THREE.Plane(V3(0, 0, -1), 0)];
      ground.material.clippingPlanes = clip; sea.material.clippingPlanes = clip;
      const X0 = -7, X1 = 7, Y0 = -3.4, Y1 = 1.7, CW = 1400, CH = 510;
      const cx = x => (x - X0) / (X1 - X0) * CW, cy = y => (Y1 - y) / (Y1 - Y0) * CH;
      const c = document.createElement('canvas'); c.width = CW; c.height = CH;
      const g = c.getContext('2d'), rr = rng(71);
      g.beginPath(); g.moveTo(0, CH);
      for (let i = 0; i <= 200; i++) { const x = X0 + (X1 - X0) * i / 200; g.lineTo(cx(x), cy(vcHeight(x, 0))); }
      g.lineTo(CW, CH); g.closePath(); g.save(); g.clip();
      const strata = ['#5a4636', '#6b5440', '#4a3a2e', '#7a6048', '#3e3128', '#5e4a3a', '#332a24'];
      for (let k = 0; k < 14; k++) {
        const y0 = 1.2 - k * 0.34; g.fillStyle = strata[k % strata.length]; g.beginPath();
        for (let i = 0; i <= 60; i++) { const x = X0 + (X1 - X0) * i / 60; g.lineTo(cx(x), cy(y0 - 0.06 * Math.sin(x * 1.3 + k) - 0.25 * Math.exp(-x * x / 6))); }
        g.lineTo(CW, CH); g.lineTo(0, CH); g.closePath(); g.fill();
      }
      for (let i = 0; i < 260; i++) { g.fillStyle = rr() < 0.5 ? 'rgba(0,0,0,.18)' : 'rgba(255,230,200,.08)'; g.fillRect(rr() * CW, rr() * CH, 2 + rr() * 6, 2 + rr() * 4); }
      // conduit + chamber
      g.fillStyle = '#ff7a24'; g.beginPath(); g.moveTo(cx(-0.07), cy(1.2)); g.lineTo(cx(0.07), cy(1.2)); g.lineTo(cx(0.18), cy(CH_Y + 0.3)); g.lineTo(cx(-0.18), cy(CH_Y + 0.3)); g.closePath(); g.fill();
      const gr = g.createRadialGradient(cx(0), cy(CH_Y), 0, cx(0), cy(CH_Y), cx(1.7) - cx(0));
      gr.addColorStop(0, '#fff1b0'); gr.addColorStop(0.35, '#ffb347'); gr.addColorStop(0.75, '#e2450f'); gr.addColorStop(1, '#7a1a06');
      g.fillStyle = gr; g.beginPath(); g.ellipse(cx(0), cy(CH_Y), cx(1.7) - cx(0), cy(CH_Y - 0.5) - cy(CH_Y), 0, 0, 7); g.fill();
      g.restore();
      g.strokeStyle = 'rgba(255,240,220,.7)'; g.lineWidth = 4; g.beginPath();
      for (let i = 0; i <= 200; i++) { const x = X0 + (X1 - X0) * i / 200; g.lineTo(cx(x), cy(vcHeight(x, 0))); } g.stroke();
      const sec = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Y1 - Y0), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, fog: false }));
      sec.position.set((X0 + X1) / 2, (Y0 + Y1) / 2, 0.001); scene.add(sec);
      const mk = (c2, s, o) => { const sp = glowSprite(c2, s, o); sp.position.set(0, CH_Y, 0.08); scene.add(sp); return sp; };
      chamber = [mk('#ff4a1a', 3.6, 0.45), mk('#ffd27a', 1.6, 0.7)];
      bubbles = Array.from({ length: 5 }, (_, k) => { const b = glowSprite('#ffe2a8', 0.22, 0.9); b.position.z = 0.06; scene.add(b); return b; });
    }
    let zone = null;
    if (P.zone) {
      zone = new THREE.Mesh(new THREE.RingGeometry(3.3, 3.55, 96), new THREE.MeshBasicMaterial({ color: col(RED), transparent: true, opacity: 0.0, side: THREE.DoubleSide, depthWrite: false }));
      zone.rotation.x = -Math.PI / 2; zone.position.y = 0.12; scene.add(zone);
      zone.fill = new THREE.Mesh(new THREE.CircleGeometry(3.3, 96), new THREE.MeshBasicMaterial({ color: col(RED), transparent: true, opacity: 0.0, depthWrite: false }));
      zone.fill.rotation.x = -Math.PI / 2; zone.fill.position.y = 0.11; scene.add(zone.fill);
    }
    let route = null;
    if (P.route) {
      const [a, b] = P.route.map(n => VC.towns[n]);
      const A = V3(a[0] + 0.5, 0.05, a[1]), B = V3(b[0] - 0.4, 0.05, b[1]), M = V3((a[0] + b[0]) / 2, 0.05, Math.max(a[1], b[1]) + 2.2);
      const curve = new THREE.QuadraticBezierCurve3(A, M, B), ptsR = curve.getPoints(120);
      const lg = new THREE.BufferGeometry().setFromPoints(ptsR);
      const line = new THREE.Line(lg, new THREE.LineDashedMaterial({ color: col(pal.accent2), dashSize: 0.25, gapSize: 0.18, transparent: true, opacity: 0.95 }));
      line.computeLineDistances(); scene.add(line);
      const ship = new THREE.Group();
      const hs = new THREE.Shape(); hs.moveTo(-0.36, 0.05); hs.quadraticCurveTo(-0.3, -0.06, -0.12, -0.07); hs.lineTo(0.2, -0.07); hs.quadraticCurveTo(0.34, -0.05, 0.42, 0.09); hs.lineTo(-0.36, 0.05);
      const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.1, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: col('#6b3f22'), roughness: 0.7, emissive: col('#3a1e0c'), emissiveIntensity: 0.6 }));
      hull.position.z = -0.05; ship.add(hull);
      const mast = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.32, 0.015), new THREE.MeshStandardMaterial({ color: col('#4a2e18') })); mast.position.y = 0.2; ship.add(mast);
      const sail = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.18), new THREE.MeshStandardMaterial({ color: col('#efe2c4'), side: THREE.DoubleSide, emissive: col('#5a4a30'), emissiveIntensity: 0.5 })); sail.position.set(0, 0.24, 0); sail.rotation.y = Math.PI / 2; ship.add(sail);
      const oarM = new THREE.MeshStandardMaterial({ color: col('#d9c49a') });
      for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) { const o = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.2), oarM); o.position.set(-0.2 + k * 0.08, -0.03, sd * 0.12); o.rotation.x = sd * 0.5; ship.add(o); }
      ship.scale.setScalar(1.6);
      const wake = glowSprite(pal.accent2, 0.9, 0.5); scene.add(wake);
      scene.add(ship); ship.wake = wake;
      route = { curve, line, ship, n: ptsR.length };
    }
    let lights = null;
    if (P.today) {
      const n = 1400, pos = new Float32Array(n * 3), rr = rng(23); let k = 0;
      while (k < n) {
        const x = -14 + rr() * 22, z = -6 + rr() * 14;
        if (!vcIsLand(x, z) || Math.hypot(x, z) < 1.6) continue;
        const near = Math.min(...VC.coast.map(([cx, cz]) => Math.hypot(cx - x, cz - z)));
        if (near > 2.2 && rr() < 0.75) continue;                 // towns crowd the coast
        pos.set([x, H0(x, z) + 0.03, z], k * 3); k++;
      }
      // three interleaved sets that twinkle out of phase (a living night city)
      lights = [0, 1, 2].map(k => {
        const sub = pos.filter((_, i) => Math.floor(i / 3) % 3 === k);
        const lgeo = new THREE.BufferGeometry(); lgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(sub), 3));
        const pts = new THREE.Points(lgeo, new THREE.PointsMaterial({ color: col(['#ffd38a', '#ffe9c0', '#ffb45a'][k]), map: glowTexture(), size: 0.13, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
        scene.add(pts); return pts;
      });
    }
    const sensors = P.today ? [[0.9, 0.6], [-1.0, 0.9], [0.3, -1.1], [1.6, -0.2]].map(([x, z]) => {
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.25, 48), new THREE.MeshBasicMaterial({ color: col(GREEN), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2; ring.position.set(x, H0(x, z) + 0.03, z); scene.add(ring);
      const dot = glowSprite(GREEN, 0.45, 0.9); dot.position.set(x, H0(x, z) + 0.08, z); scene.add(dot);
      ring.dot = dot; return ring;
    }) : [];
    // ---------------------------------------------------------------- eruption: column / umbrella / surge clouds
    const KM = 1 / 2.5, colH = (P.height_km || 30) * KM;
    const erupting = mode !== 'profile';
    const NC = erupting ? 380 : 0, NS = mode === 'surge' ? 760 : 0;
    const cloud = erupting ? vcCloud(scene, NC + NS, pxScale) : null;
    const rc = rng(91), puffs = Array.from({ length: NC }, (_, i) => ({
      u: rc(), ph: rc(), a: rc() * 6.28, rad: rc(), sz: 0.6 + rc() * 0.8, shade: rc(), top: i > NC * 0.62 }));
    const surgeP = Array.from({ length: NS }, () => ({ a: rc() * 6.28, u: rc(), ph: rc(), sz: 0.5 + rc() * 0.7, lift: rc() }));
    const glowFront = mode === 'surge' ? glowSprite('#ff7a2a', 3, 0) : null; if (glowFront) scene.add(glowFront);
    // pumice rain + rising layer (fall)
    let rain = null, layer = null;
    if (mode === 'fall') {
      const n = 2400, pos = new Float32Array(n * 3), rr = rng(5), seeds = [];
      for (let i = 0; i < n; i++) seeds.push([VC.towns.pompeii[0] + (rr() - 0.5) * 3.2, VC.towns.pompeii[1] + (rr() - 0.5) * 3.2, rr(), 0.5 + rr() * 0.6]);
      const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      rain = { pts: new THREE.Points(rg, new THREE.PointsMaterial({ color: col('#d9d2c4'), map: glowTexture(), size: 0.035, transparent: true, opacity: 0.95, depthWrite: false })), pos, seeds, rg };
      scene.add(rain.pts);
      if (P.ruins) rain.pts.visible = false;            // centuries later: no more pumice rain
      const lt0 = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), rr2 = rng(13);
        g.fillStyle = '#cfc6b4'; g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1600; i++) { g.fillStyle = ['#e8e0cf', '#a99f8c', '#bdb39f', '#f2ecdf'][i % 4]; g.globalAlpha = 0.8; g.beginPath(); g.arc(rr2() * 256, rr2() * 256, 1 + rr2() * 3.5, 0, 7); g.fill(); }
        const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t; })();
      const [tx, tz] = VC.towns.pompeii;
      layer = new THREE.Mesh(new THREE.BoxGeometry(7, 1, 7), new THREE.MeshStandardMaterial({ map: lt0, roughness: 1, emissive: col('#2a2620'), emissiveIntensity: 0.4 }));
      layer.position.set(tx, H0(tx, tz), tz); layer.base = H0(tx, tz) - 0.004; scene.add(layer);
    }
    // vineyards and fields that grow over the buried town (fall mode, P.fields)
    let fields = null;
    if (P.fields && layer) {
      const c = document.createElement('canvas'); c.width = c.height = 1024;
      const g = c.getContext('2d'), rr = rng(17);
      g.fillStyle = '#8a7a48'; g.fillRect(0, 0, 1024, 1024);
      for (let i = 0; i < 24; i++) {          // field patches
        g.fillStyle = ['#9a8a4e', '#6f7a3a', '#a8945a', '#7e8a44'][i % 4];
        g.fillRect(rr() * 1024 - 100, rr() * 1024 - 100, 160 + rr() * 260, 120 + rr() * 220);
      }
      g.strokeStyle = '#3f5a22'; g.lineWidth = 9; g.lineCap = 'round';
      for (let y = 30; y < 1024; y += 34) {      // vine rows
        g.setLineDash([14 + rr() * 6, 8]); g.beginPath(); g.moveTo(0, y + rr() * 4); g.lineTo(1024, y + rr() * 4); g.stroke();
      }
      g.setLineDash([]);
      const tex = new THREE.CanvasTexture(c); tex.anisotropy = 4;
      fields = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0, roughness: 0.95 }));
      fields.rotation.x = -Math.PI / 2; scene.add(fields);
    }
    // ---------------------------------------------------------------- ruler (column)
    const rulerX = 3.4, rulerZ = 0.6;
    let ruler = null;
    if (mode === 'column' && P.ruler !== false) {
      const top = Math.ceil((P.height_km || 30) / 10) * 10;
      const pts = [V3(rulerX, 0.05, rulerZ), V3(rulerX, top * KM, rulerZ)];
      for (let k = 10; k <= top; k += 10) pts.push(V3(rulerX, k * KM, rulerZ), V3(rulerX + 0.35, k * KM, rulerZ));
      const lg = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: col(pal.ink), transparent: true, opacity: 0.0 }));
      // LineSegments pairs: the first segment is the pole
      scene.add(line);
      ruler = { line, ticks: [] };
      for (let k = 10; k <= top; k += 10) ruler.ticks.push({ km: k, el: labels.add('counter') });
      ruler.marks = (P.marks || []).map(m => ({ m, el: labels.add('counter') }));
    }
    const cnt = P.counter ? labels.add('counter') : null;
    const dust = P.collapse && mode === 'fall' ? vcCloud(scene, 90, pxScale) : null;
    // ---------------------------------------------------------------- labels
    const lbls = (P.labels || []).map(L => ({ L, el: labels.add('layer') }));
    const wv = new THREE.Vector3();
    const scrV = v => toScreen(v, camera, W, H);
    const lblHTML = L => {
      const c = L.color === 'ink' ? pal.ink : L.color === 'red' ? RED : (L.color || pal.accent);
      return `<b style="font-size:${L.size || 60}px;color:${c}">${L.text || ''}</b>` + (L.sub ? `<small style="font-size:44px;color:${pal.ink}">${L.sub}</small>` : '');
    };
    const state = { colTop: colH, front: 0, ship: null };
    const anchorOf = tg => {
      if (VC.towns[tg]) { const [x, z] = VC.towns[tg]; return scrV(V3(x, H0(x, z) + 0.08, z)); }
      if (tg === 'vesuvius') return scrV(V3(0, 1.25, 0));
      if (tg === 'chamber') return scrV(V3(0.9, CH_Y + 0.15, 0.05));
      if (tg === 'top') return scrV(V3(0, 1.2 + state.colTop, 0));
      if (tg === 'column') return scrV(V3(0.25, 1.2 + state.colTop * 0.45, 0));
      if (tg === 'umbrella') return scrV(V3(2.5, 1.2 + state.colTop * 0.98, 0.5));
      if (tg === 'zone') return scrV(V3(-2.3, 0.12, 2.5));
      if (tg === 'ship') return state.ship ? scrV(state.ship) : null;
      if (tg === 'front') { const f = Math.max(0.5, state.front); return scrV(V3(f * 0.55, H0(f * 0.55, f * 0.83) + 0.1, f * 0.83)); }
      return null;
    };
    const showLabel = (o, lt, cues, fb) => {
      const L = o.L, at = L.at === '_start' ? 0.3 : (L.at ? cue(cues, L.at, fb) : fb);
      const anchor = anchorOf(L.target);
      if (!anchor || anchor[2] > 1) { o.el.set('', 0, 0, 0); return; }
      const half = Math.max((L.text || '').length * (L.size || 60) * 0.26, (L.sub || '').length * 44 * 0.27) + 30;
      let x = Math.max(half, Math.min(W - half, anchor[0] + (L.dx ?? 0))), y = Math.max(portrait ? 300 : 200, Math.min(portrait ? 1100 : 790, anchor[1] + (L.dy ?? -150)));
      if (!portrait && x < 1000 && y < 300) y = 300;                // keep the kicker (top left) clear
      const a = spring(lt, at, 0.6);
      o.el.set(lblHTML(L), x, y, clamp01(a * 1.5) * (lt >= at - 0.01 ? 1 : 0), [anchor[0], anchor[1]], prog(lt, at, 0.5));
    };
    // ---------------------------------------------------------------- cameras (one world, mode only changes the default framing)
    const CAMS = {
      profile: { dist: 12.5, yaw: -16, pitch: 22, tx: 0.2, ty: 0.9, tz: 1.6, fov: 34, drift: 1.4 },
      column: { dist: 34, yaw: -22, pitch: 7, tx: 1.0, ty: 6.4, tz: 0.4, fov: 34, drift: 1.0 },
      fall: { dist: 2.6, yaw: -28, pitch: 20, tx: 2.0, ty: 0.25, tz: 3.1, fov: 34, drift: 2.4 },
      surge: { dist: 12, yaw: -12, pitch: 24, tx: 0.3, ty: 0.6, tz: 1.8, fov: 34, drift: 1.2 },
    };
    const camDef = Object.assign({}, CAMS[mode]);
    if (portrait) camDef.dist *= 1.7;
    const PP = Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) });
    const camAt = (lt, dur, env) => {
      const c = shotCam(PP, env, lt, dur);
      if (P.pullback) c.dist *= lerp(P.pullback, 1, progIO(lt, 0, dur));   // slow reveal: start close, end at camera.dist
      return c;
    };
    const lerpC = (a, b, p) => [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
    const ASH_LO = [0.42, 0.38, 0.35], ASH_HI = [0.74, 0.70, 0.66], HOT = hex2rgb('#ff8a3a').map(v => v / 255), GLOW = hex2rgb(pal.glow).map(v => v / 255);

    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t;
        applyCam(camera, camAt(lt, dur, env), W, H); camera.updateMatrixWorld();
        const hit = cue(cues, 'hit', dur * 0.5), pk = punch(lt, hit, 1.0);
        crater.material.opacity = (erupting ? 0.75 : 0.22) + 0.12 * Math.sin(t * 2.3) + 0.3 * pk;
        crater.scale.setScalar(erupting ? 2.2 : 1.2);
        sea.position.y = 0.004 * Math.sin(t * 0.8);
        Object.entries(markers).forEach(([name, m], k) => { m.material.opacity = (lbls.some(o => o.L.target === name) ? 0.75 : 0.35) + 0.15 * Math.sin(t * 2 + k); });
        if (chamber) {
          const sw = 1 + 0.08 * Math.sin(t * 2.2) + 0.3 * prog(lt, hit - 0.2, 1.2) + 0.2 * pk;
          chamber[0].scale.setScalar(3.6 * sw); chamber[1].scale.setScalar(1.6 * sw);
          chamber[0].material.opacity = 0.3 + 0.25 * prog(lt, 0.2, 1) + 0.25 * pk;
          const speed = 0.35 + 0.5 * prog(lt, hit, 1);
          bubbles.forEach((b, k) => { const ph = (t * speed + k / bubbles.length) % 1; b.position.set(0.04 * Math.sin(t * 3 + k), lerp(CH_Y + 0.4, 1.15, ph), 0.06); b.material.opacity = 0.9 * Math.sin(ph * Math.PI); });
        }
        if (zone) {
          const z = spring(lt, hit, 0.8);
          zone.material.opacity = (0.6 + 0.25 * Math.sin(t * 3)) * clamp01(z);
          zone.fill.material.opacity = 0.16 * clamp01(z);
          zone.scale.setScalar(lerp(0.15, 1, z) * (1 + 0.03 * Math.sin(t * 3))); zone.fill.scale.setScalar(lerp(0.15, 1, z));
        }
        if (route) {
          const p = progIO(lt, 0.3, Math.max(0.6, hit - 0.3));
          route.line.geometry.setDrawRange(0, Math.max(2, Math.floor(route.n * p)));
          state.ship = route.curve.getPoint(Math.min(1, p));
          route.ship.position.copy(state.ship).add(V3(0, 0.06 + 0.02 * Math.sin(t * 3), 0));
          const tg = route.curve.getTangent(Math.min(0.999, Math.max(0.001, p)));
          route.ship.rotation.y = Math.atan2(-tg.z, tg.x); route.ship.rotation.x = 0.04 * Math.sin(t * 2.4);
          route.ship.wake.position.copy(state.ship).add(V3(0, 0.03, 0)); route.ship.wake.material.opacity = 0.35 + 0.1 * Math.sin(t * 4);
        }
        if (ring) { ring.material.opacity = 0.9 * prog(lt, 0.1, 0.4) * (1 - 0.6 * prog(lt, hit + 0.3, 0.6)); ring.scale.setScalar(1 + 0.08 * Math.sin(t * 4)); }
        if (lights) lights.forEach((l, k) => { l.material.opacity = 0.55 + 0.4 * Math.sin(t * 2.3 + k * 2.1); });
        sensors.forEach((s, k) => {
          const ph = (t * 0.9 + k * 0.27) % 1; s.scale.setScalar(1 + ph * 4); s.material.opacity = 0.9 * (1 - ph);
          s.dot.scale.setScalar(0.45 * (1 + 0.5 * Math.pow(1 - ph, 3))); s.dot.material.opacity = 0.6 + 0.4 * (1 - ph);
        });
        // ---- column + umbrella
        if (cloud) {
          let hF = 1;                                               // column height factor
          if (mode === 'column' && P.grow) hF = prog(lt, 0.15, Math.max(1, hit - 0.15));
          const collapsing = mode === 'surge';
          if (collapsing) hF = (P.collapse ? lerp(1, 0.32, progIO(lt, hit - 0.4, 2.2)) : 0.32);
          const top = colH * Math.max(0.03, hF); state.colTop = top;
          const umb = mode === 'column' && P.grow ? prog(lt, hit - 0.6, 2.0) : 1;
          const ashDark = mode === 'fall' ? 0.75 : 1;
          puffs.forEach((p, i) => {
            const flow = (p.ph + t * 0.05) % 1;
            if (!p.top) {
              // column body: puffs rise up the stem, wider with height
              const y = top * ((p.u + t * 0.04) % 1);
              const w = 0.25 + 0.55 * (y / colH) + 0.15 * Math.sin(t * 0.7 + i);
              const x = Math.cos(p.a + t * 0.3) * w * p.rad, z = Math.sin(p.a + t * 0.3) * w * p.rad;
              const k = y / colH, c = lerpC(lerpC(ASH_LO, ASH_HI, k * 0.6 + p.shade * 0.4), GLOW, (1 - k) * 0.35);
              const a = (hF > 0.04 ? 0.85 : 0) * clamp01(y * 3) * ashDark;
              cloud.setRGB(i, x, 1.2 + y, z, (0.9 + 1.4 * k) * p.sz * 1.4, c[0] * ashDark, c[1] * ashDark, c[2] * ashDark, a);
            } else {
              // umbrella: spreads out sideways from the top, drifting south-east with the wind
              const R = (1.2 + 7.5 * flow * p.rad) * umb;
              const y = 1.2 + top * (0.86 + 0.12 * Math.sin(p.a * 3) * (1 - flow)) - 0.25 * flow * colH * 0.15;
              const x = Math.cos(p.a) * R + flow * 2.6 * umb, z = Math.sin(p.a) * R * 0.75 + flow * 1.8 * umb;
              const c = lerpC(ASH_HI, ASH_LO, flow * 0.6 + p.shade * 0.3);
              const a = 0.8 * umb * (1 - flow * 0.55) * (collapsing ? hF * 1.2 : 1) * ashDark;
              cloud.setRGB(i, x, y, z, (1.6 + 2.6 * flow) * p.sz * 1.5, c[0] * ashDark, c[1] * ashDark, c[2] * ashDark, a);
            }
          });
          // ---- pyroclastic surge: a glowing ground-hugging front
          if (NS) {
            let to = P.to ?? 3;
            if (P.reach && VC.towns[P.reach]) { const [x, z] = VC.towns[P.reach]; to = Math.hypot(x, z) + 0.35; }
            const from = P.from ?? 0;
            const arrive = P.reach ? hit : dur * 0.85;
            const front = lerp(from, to, progIO(lt, 0.15, Math.max(0.6, arrive - 0.15))) + 0.12 * Math.max(0, lt - arrive);
            state.front = front;
            surgeP.forEach((q, j) => {
              // puffs stream outward through a band behind the front (they visibly roll down the slopes)
              const band = Math.min(front, 1.5), ph = (q.u + t * 0.22) % 1;
              const lobe = 1 + 0.12 * Math.sin(q.a * 5 + 1.3) + 0.08 * Math.sin(q.a * 11);   // uneven, finger-like front
              const rr = Math.max(0.15, (front - band * (1 - ph)) * lobe);
              const x = Math.cos(q.a) * rr, z = Math.sin(q.a) * rr;
              const edge = clamp01(1 - (front * lobe - rr) / Math.max(0.2, band));          // 1 at the front
              const y = H0(x, z) + 0.03 + q.lift * 0.16 * (0.3 + edge) + 0.02 * Math.sin(t * 2 + j);
              const heat = clamp01(edge * 1.3 - 0.25) * (0.75 + 0.25 * Math.sin(t * 3 + j));
              const c = lerpC(ASH_LO, HOT, heat);
              const fadeIn = clamp01(ph * 5) * clamp01(front * 2);
              cloud.setRGB(NC + j, x, y, z, (0.5 + 0.55 * edge) * q.sz, c[0], c[1], c[2], 0.9 * fadeIn);
            });
            const fx = front * 0.55, fz = front * 0.83;
            glowFront.position.set(fx, H0(fx, fz) + 0.15, fz);
            glowFront.material.opacity = 0.3 + 0.35 * pk + 0.1 * Math.sin(t * 4);
            glowFront.scale.setScalar(1.4 + front * 0.3);
            warm.position.set(fx, 1.2, fz); warm.intensity = 16 + 20 * pk;
            if (P.reach && markers[P.reach]) { markers[P.reach].material.opacity = 0.6 + 1.2 * pk; markers[P.reach].scale.setScalar(0.8 + 2.5 * pk); }
          }
          cloud.flush();
        }
        // ---- pumice fall
        if (rain) {
          for (let i = 0; i < rain.seeds.length; i++) {
            const [x, z, ph, v] = rain.seeds[i], y = 2.2 - ((ph + t * v * 0.45) % 1) * 2.2;
            rain.pos[i * 3] = x + 0.05 * Math.sin(t + i); rain.pos[i * 3 + 1] = y; rain.pos[i * 3 + 2] = z;
          }
          rain.rg.attributes.position.needsUpdate = true;
          const L = P.layer || [0, 1], depth = 0.045 * lerp(L[0], L[1], prog(lt, 0.1, Math.max(1, dur - 0.3)));
          layer.scale.y = Math.max(0.001, depth); layer.position.y = layer.base + depth / 2;
          if (fields) {
            const fa = cue(cues, 'fields', dur * 0.6), fp = prog(lt, fa, 1.0);
            fields.material.opacity = fp; fields.position.set(layer.position.x, layer.base + depth + 0.002 + 0.06 * (1 - fp), layer.position.z);
          }
        }
        if (P.collapse && mode === 'fall') {
          const order = houses.filter(h => h.name === 'pompeii').sort((a, b) => a.ord - b.ord);
          if (dust) for (let i = 0; i < dust.n; i++) dust.set(i, 0, -5, 0, 0, '#000000', 0);
          order.forEach((h, k) => {
            const p = prog(lt, hit + k * (Math.max(0.8, dur - hit - 0.6) / order.length), 0.35);
            h.roof.position.y = lerp(h.y0, h.base + h.h * 0.7, p);
            h.roof.rotation.z = h.tilt * 1.3 * p; h.roof.rotation.x = h.tilt * 0.7 * p;
            h.roof.material.color.set(mix('#a8492e', '#b9b2a4', p * 0.8));
            if (dust) { const q = lin(lt, hit + k * (Math.max(0.8, dur - hit - 0.6) / order.length), 1.2), sp = Math.min(dust.n - 1, k);
              dust.set(sp, h.roof.position.x, h.base + h.h * (0.9 + q * 0.8), h.roof.position.z, 0.06 + 0.18 * q, '#d8d0c0', q > 0 && q < 1 ? 0.7 * (1 - q) : 0); }
          });
        }
        if (dust) dust.flush();
        // ---- ruler + counter
        if (ruler) {
          const a = prog(lt, 0.3, 0.6);
          ruler.line.material.opacity = 0.75 * a;
          ruler.ticks.forEach(o => {
            const s = scrV(V3(rulerX + 0.45, o.km * KM, rulerZ)), on = state.colTop >= o.km * KM * 0.98 ? 1 : 0.45;
            o.el.set(`<b style="font-size:48px;color:${pal.ink}">${o.km} km</b>`, s[0] + 80, s[1], a * on);
          });
          ruler.marks.forEach(o => {
            const s = scrV(V3(rulerX + 0.45, o.m.km * KM, rulerZ));
            o.el.set(`<small style="font-size:44px;color:${pal.accent2}">${o.m.text}</small>`, s[0] + 430, s[1], prog(lt, cue(cues, o.m.at || '_', 0.8), 0.5));
          });
        }
        if (cnt) {
          const C = P.counter, to = parseNum(C.to), from = parseNum(C.from || 0), dec = String(C.to).includes(',') ? 1 : 0;
          let v;
          if (mode === 'column') v = (P.height_km || 30) * (state.colTop / colH) * (to / (P.height_km || 30));
          else v = lerp(from, to, prog(lt, 0.3, Math.max(0.8, hit - 0.3)));
          const pkc = punch(lt, hit, 0.8);
          const [cx, cy] = C.pos || [W * 0.8, portrait ? 520 : 330];
          cnt.set(`<b style="font-size:${150 * (1 + 0.1 * pkc)}px;color:${pal.accent}">${C.prefix || ''}${fmtNum(v, dec)}${C.suffix || ''} ${C.unit || ''}</b>` + (C.label ? `<small style="font-size:46px">${C.label}</small>` : ''),
            cx, cy, prog(lt, 0.15, 0.4));
        }
        scene.updateMatrixWorld();
        lbls.forEach((o, k) => showLabel(o, lt, cues, 0.3 + k * 0.5));
      },
    };
  },
};
