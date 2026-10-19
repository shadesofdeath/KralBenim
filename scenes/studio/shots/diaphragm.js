// diaphragm: an x-ray cutaway of the human chest: two lungs, the trachea, faint ribs and spine, and under the lungs the
// dome-shaped diaphragm muscle (two domes, radial fibres). Works for breathing, hiccups, the phrenic nerve and the stomach.
// P: {mode: "spasm"|"breathe"|"nerve"|"stomach"|"reflex",
//     labels: [{at: "diaphragm"|"lungs"|"nerve"|"stomach"|"brain"|"larynx", text, sub, cue, dx, dy}],
//     every: 1.3 (seconds between repeated hiccups), camera: {...}}
//   spasm   — the diaphragm jerks down hard at the cue (red flash, body jolt, air rushes in, the larynx snaps shut), then again
//   breathe — calm rhythmic breathing; at the cue a downward arrow shows the diaphragm descending
//   nerve   — signals run down the phrenic nerves; at the cue a bright pulse arrives and the diaphragm jerks
//   stomach — the stomach under the left dome inflates (bubbles) and pushes the dome up; a hiccup follows
//   reflex  — wide: brain stem + vagus nerve (up) + phrenic nerve (down) form a glowing loop, hiccups repeat
// cues: hit (see modes), label cues by name (labels[].cue). Consecutive scenes share one world (match cut).
'use strict';

function diaTex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  return t;
}

SHOTS.diaphragm = {
  kind: '3d',
  build(ctx) {
    const { P, pal, W, H, scene, camera, labels } = ctx;
    const portrait = H > W, mode = P.mode || 'breathe', r = rng(P.seed || 19);
    const body = new THREE.Group(); scene.add(body);
    // ---- x-ray body shell (fresnel rim only: cheap, no noise)
    const fres = (c, k, a) => new THREE.ShaderMaterial({
      uniforms: { uC: { value: col(c) }, uA: { value: a } },
      vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 uC; uniform float uA; varying vec3 vN; varying vec3 vV;
        void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), ${k.toFixed(1)}); gl_FragColor = vec4(uC, f * uA); }`,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    });
    const prof = [[0.42, 3.0], [0.44, 2.55], [0.9, 2.3], [1.45, 2.1], [1.72, 1.7], [1.74, 0.9], [1.62, 0], [1.46, -0.9], [1.44, -1.5], [1.4, -1.9]];
    const shellGeo = new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 64); shellGeo.scale(1, 1, 0.62);
    const mShell = fres(pal.accent2, 2.6, 0.55);
    body.add(new THREE.Mesh(shellGeo, mShell));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.78, 48, 32), fres(pal.accent2, 2.4, 0.5));
    head.scale.set(0.92, 1.12, 1); head.position.set(0, 3.75, 0.05); head.visible = mode === 'reflex'; body.add(head);
    // ---- ribs + spine (faint)
    const mBone = new THREE.MeshBasicMaterial({ color: col(pal.ink), transparent: true, opacity: 0.13, depthWrite: false });
    for (let k = 0; k < 8; k++) {
      const y = 2.0 - k * 0.3, rx = 1.0 + 0.6 * Math.sin(Math.min(1, 0.35 + k * 0.16) * Math.PI / 2), rz = 0.62 * rx;
      const pts = [];
      for (let i = 0; i <= 28; i++) {
        const a = -Math.PI * 0.92 + i / 28 * Math.PI * 1.84;                 // gap at the front (sternum)
        pts.push(V3(Math.sin(a) * rx, y - 0.32 * (1 - Math.cos(a)) * 0.5, -Math.cos(a) * rz));
      }
      body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 5), mBone));
    }
    for (let k = 0; k < 16; k++) {
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.2, 0.22), mBone);
      v.position.set(0, 2.5 - k * 0.27, -0.95); body.add(v);
    }
    // ---- lungs (lathe, concave base resting on the domes) with a mottled texture
    const lungTex = diaTex(512, 512, (g, w, h) => {
      const lg = g.createLinearGradient(0, 0, 0, h); lg.addColorStop(0, '#f2a19a'); lg.addColorStop(1, '#d9706e');
      g.fillStyle = lg; g.fillRect(0, 0, w, h);
      const rl = rng(5);
      for (let i = 0; i < 900; i++) { g.fillStyle = rl() < 0.5 ? 'rgba(120,30,40,.16)' : 'rgba(255,220,215,.18)'; g.beginPath(); g.arc(rl() * w, rl() * h, 2 + rl() * 7, 0, 6.29); g.fill(); }
      g.strokeStyle = 'rgba(150,40,50,.35)'; g.lineCap = 'round';
      for (let i = 0; i < 14; i++) { let x = rl() * w, y = 0; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (rl() - 0.5) * 50; y += h / 8; g.lineTo(x, y); } g.stroke(); }
    });
    const lp = [[0.001, 1.15], [0.24, 1.07], [0.44, 0.78], [0.6, 0.2], [0.69, -0.42], [0.64, -0.7], [0.4, -0.6], [0.001, -0.5]];
    const lungGeo = new THREE.LatheGeometry(lp.map(p => new THREE.Vector2(p[0], p[1])), 48); lungGeo.scale(1, 1, 0.74);
    const mLung = new THREE.MeshStandardMaterial({ map: lungTex, roughness: 0.6, emissive: col('#4a1018'), emissiveIntensity: 0.6 });
    const lungs = [-1, 1].map(s => { const m = new THREE.Mesh(lungGeo, mLung); m.position.set(s * 0.8, 0.82, 0); body.add(m); return m; });
    // ---- trachea + bronchi
    const mAir = new THREE.MeshStandardMaterial({ color: col('#f1d2c4'), roughness: 0.5, emissive: col('#3a2420'), emissiveIntensity: 0.5 });
    const trachea = new THREE.CatmullRomCurve3([V3(0, 2.95, 0.08), V3(0, 2.4, 0.08), V3(0, 1.85, 0.06)]);
    body.add(new THREE.Mesh(new THREE.TubeGeometry(trachea, 24, 0.11, 12), mAir));
    for (const s of [-1, 1]) body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0, 1.88, 0.06), V3(s * 0.3, 1.62, 0.06), V3(s * 0.62, 1.3, 0.04)]), 16, 0.075, 10), mAir));
    const larynxP = V3(0, 2.62, 0.12);
    const larynx = glowSprite(pal.accent, 0.5, 0); larynx.position.copy(larynxP); body.add(larynx);
    const larynxRing = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.035, 8, 24), new THREE.MeshStandardMaterial({ color: col('#f6ddd0'), emissive: col(pal.accent), emissiveIntensity: 0.2 }));
    larynxRing.rotation.x = Math.PI / 2; larynxRing.position.copy(larynxP); body.add(larynxRing);
    // ---- stomach (under the left dome = viewer's right)
    const stomP = V3(0.6, -0.86, 0.12);
    // J-shaped stomach: a tube along a curve whose radius swells in the middle (fundus/body) and narrows at both ends
    const stomCurve = new THREE.CatmullRomCurve3([V3(-0.32, 0.38, 0), V3(-0.02, 0.36, 0), V3(0.24, 0.12, 0), V3(0.2, -0.24, 0), V3(-0.12, -0.36, 0), V3(-0.5, -0.24, 0)]);
    const stomGeo = new THREE.TubeGeometry(stomCurve, 48, 1, 24, false);
    { const sp = stomGeo.attributes.position, nTub = 49, nRad = 25;
      for (let i = 0; i < nTub; i++) {
        const u = i / 48, rad = 0.1 + 0.26 * Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.15)), 0.7) * (u < 0.15 ? 0.6 + u * 2.6 : 1) + 0.04;
        const c = stomCurve.getPointAt(u);
        for (let j = 0; j < nRad; j++) { const k = i * nRad + j; const v = V3(sp.getX(k), sp.getY(k), sp.getZ(k)).sub(c); v.normalize().multiplyScalar(rad); sp.setXYZ(k, c.x + v.x, c.y + v.y, c.z + v.z * 0.85); }
      }
      stomGeo.computeVertexNormals(); }
    const stomTex = diaTex(512, 256, (g, w, h) => {
      g.fillStyle = '#e48e7a'; g.fillRect(0, 0, w, h);
      const rs = rng(21); g.strokeStyle = 'rgba(150,50,45,.35)'; g.lineCap = 'round';
      for (let i = 0; i < 22; i++) { const y = rs() * h; g.lineWidth = 3 + rs() * 3; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + 10 * Math.sin(x * 0.05 + i)); g.stroke(); }
    });
    const mStom = new THREE.MeshStandardMaterial({ map: stomTex, roughness: 0.45, emissive: col('#5a2410'), emissiveIntensity: 0.5 });
    const stomach = new THREE.Mesh(stomGeo, mStom); stomach.position.copy(stomP); body.add(stomach);
    const liver = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshStandardMaterial({ color: col('#8e3b30'), roughness: 0.4, emissive: col('#2a0a06'), emissiveIntensity: 0.6 }));
    liver.scale.set(0.82, 0.36, 0.5); liver.position.set(-0.55, -0.62, 0.05); liver.rotation.z = -0.25; body.add(liver);
    { const ri = rng(77), pts = [];
      for (let row = 0; row < 5; row++) { const y = -1.4 - row * 0.12; for (let k = 0; k <= 6; k++) { const u = row % 2 ? 1 - k / 6 : k / 6; pts.push(V3(-1.0 + 2.0 * u + (ri() - 0.5) * 0.12, y + 0.06 * Math.sin(k * 2.1 + row), 0.15 + (ri() - 0.5) * 0.3)); } }
      const mGut = new THREE.MeshStandardMaterial({ color: col('#6b4a52'), roughness: 0.7, emissive: col('#1a0c10'), emissiveIntensity: 0.3, transparent: true, opacity: 0.3, depthWrite: false });
      body.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.1, 10), mGut)); }
    const gutGlow = glowSprite(pal.accent2, 3.4, 0.0); gutGlow.position.set(0, -1.4, 0.6); body.add(gutGlow);
    const eso = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0.22, 0.2, -0.05), V3(0.3, -0.1, 0.0), V3(0.38, -0.44, 0.1)]), 16, 0.06, 8), mAir); body.add(eso);
    const bubbles = Array.from({ length: mode === 'stomach' ? 14 : 0 }, (_, i) => { const b = glowSprite('#ffffff', 0.12, 0); body.add(b); return { b, x: (r() - 0.5) * 0.7, z: (r() - 0.3) * 0.5, ph: r(), sp: 0.5 + r() * 0.5 }; });
    // ---- diaphragm: a double-domed sheet (ring grid), radial muscle fibres + pale central tendon
    const diaTexMap = diaTex(512, 512, (g, w, h) => {
      g.fillStyle = '#b5402f'; g.fillRect(0, 0, w, h);
      const rd = rng(9); g.lineCap = 'round';
      for (let i = 0; i < 420; i++) {
        const a = rd() * 6.283, r0 = 60 + rd() * 30, r1 = 240 + rd() * 20;
        g.strokeStyle = rd() < 0.5 ? 'rgba(255,170,120,.32)' : 'rgba(90,15,10,.38)'; g.lineWidth = 2 + rd() * 3;
        g.beginPath(); g.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0); g.lineTo(256 + Math.cos(a + 0.02) * r1, 256 + Math.sin(a + 0.02) * r1); g.stroke();
      }
      g.fillStyle = 'rgba(245,225,200,.85)';                                        // trefoil central tendon
      for (const a of [-1.57, 0.5, 2.6]) { g.beginPath(); g.ellipse(256 + Math.cos(a) * 40, 256 + Math.sin(a) * 40, 70, 40, a, 0, 6.29); g.fill(); }
    });
    const dGeo = new THREE.RingGeometry(0.001, 1, 72, 26);
    const dPos = dGeo.attributes.position, NV = dPos.count, base = new Float32Array(NV * 2);
    for (let i = 0; i < NV; i++) { base[i * 2] = dPos.getX(i); base[i * 2 + 1] = dPos.getY(i); }
    const mDia = new THREE.MeshStandardMaterial({ map: diaTexMap, roughness: 0.42, side: THREE.DoubleSide, emissive: col(pal.accent), emissiveIntensity: 0.15 });
    const dia = new THREE.Mesh(dGeo, mDia); body.add(dia);
    const DX = 1.45, DZ = 0.9, Y0 = -0.1;
    const shapeDia = (descend, flat, push) => {
      for (let i = 0; i < NV; i++) {
        const u = base[i * 2], w = base[i * 2 + 1], x = u * DX, z = w * DZ, s = Math.max(0, 1 - u * u - w * w);
        const lobes = 0.78 + 0.3 * (Math.exp(-((x + 0.62) ** 2) / 0.3) + 0.82 * Math.exp(-((x - 0.62) ** 2) / 0.3)) - 0.14 * Math.exp(-x * x / 0.06);
        const h = -0.42 + 0.82 * Math.pow(s, 0.45) * lobes;
        const y = Y0 + h * (1 - 0.55 * flat) - descend * Math.pow(s, 0.4) + push * 0.5 * Math.exp(-((x - 0.6) ** 2 + z * z) / 0.45) * Math.pow(s, 0.3);
        dPos.setXYZ(i, x, y, z);
      }
      dPos.needsUpdate = true; dGeo.computeVertexNormals();
    };
    shapeDia(0, 0, 0);
    const redGlow = glowSprite(RED, 4.2, 0); redGlow.material.blending = THREE.NormalBlending; redGlow.position.set(0, -0.2, -0.6); body.add(redGlow);
    const diaGlow = glowSprite(pal.accent, 3.4, 0.18); diaGlow.position.set(0, 0.0, 0.2); body.add(diaGlow);
    // down arrow (breathe)
    const arrow = new THREE.Group(); body.add(arrow);
    const mArrow = new THREE.MeshBasicMaterial({ color: col(pal.accent), transparent: true, opacity: 0, depthWrite: false });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.34, 24), mArrow); cone.rotation.x = Math.PI; arrow.add(cone);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 12), mArrow); shaft.position.y = 0.4; arrow.add(shaft);
    arrow.position.set(-0.62, -0.75, 1.05);
    const mPull = new THREE.MeshBasicMaterial({ color: col('#ff2a2a'), transparent: true, opacity: 0, depthWrite: false });
    const pulls = [-0.62, 0.62].map(x => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 20), mPull); c.rotation.x = Math.PI; g.add(c);
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.45, 10), mPull); sh.position.y = 0.36; g.add(sh); g.position.set(x, -0.75, 1.0); body.add(g); return g; });
    // ---- nerves: phrenic (neck -> diaphragm), vagus (stomach -> brain stem), brain stem node
    const showNerve = mode === 'nerve' || mode === 'reflex' || mode === 'spasm';
    const mNerve = new THREE.MeshBasicMaterial({ color: col('#ffe27a'), transparent: true, opacity: showNerve ? 0.75 : 0.0, blending: THREE.AdditiveBlending, depthWrite: false });
    const phrenic = [-1, 1].map(s => new THREE.CatmullRomCurve3([V3(s * 0.2, 3.2, 0.2), V3(s * 0.26, 2.5, 0.3), V3(s * 0.4, 1.6, 0.58), V3(s * 0.46, 0.75, 0.6), V3(s * 0.56, 0.22, 0.5)]));
    phrenic.forEach(c => body.add(new THREE.Mesh(new THREE.TubeGeometry(c, 48, 0.03, 6), mNerve)));
    const vagus = new THREE.CatmullRomCurve3([V3(0.7, -0.6, 0.5), V3(0.42, 0.1, 0.62), V3(0.18, 1.2, 0.5), V3(0.12, 2.3, 0.35), V3(0.06, 3.35, 0.15)]);
    const mVagus = new THREE.MeshBasicMaterial({ color: col(pal.accent2), transparent: true, opacity: mode === 'reflex' ? 0.7 : 0, blending: THREE.AdditiveBlending, depthWrite: false });
    body.add(new THREE.Mesh(new THREE.TubeGeometry(vagus, 48, 0.026, 6), mVagus));
    const brainP = V3(0, 3.42, 0.1);
    const brain = glowSprite(pal.accent, 1.2, 0); brain.position.copy(brainP); body.add(brain);
    const mStem = new THREE.MeshStandardMaterial({ color: col(pal.accent), emissive: col(pal.accent), emissiveIntensity: 1.2 });
    const stem = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.34, 6, 16), mStem); stem.position.copy(brainP).add(V3(0, 0.12, 0)); stem.visible = mode === 'reflex'; body.add(stem);
    const nPulse = Array.from({ length: 6 }, (_, i) => { const g = glowSprite('#fff6c8', 0.42, 0); body.add(g); return g; });
    const vPulse = Array.from({ length: 3 }, () => { const g = glowSprite(pal.accent2, 0.42, 0); body.add(g); return g; });
    // ---- air particles rushing down the trachea at each hiccup
    const air = Array.from({ length: 10 }, (_, i) => { const g = glowSprite(pal.accent2, 0.22, 0); body.add(g); return { g, k: i / 10, s: r() < 0.5 ? -1 : 1 }; });
    // ---- light + atmosphere
    scene.add(new THREE.HemisphereLight(0xfff1ea, 0x1a1420, 1.0));
    const key = new THREE.DirectionalLight(0xffffff, 2.0); key.position.set(-3, 4, 6); scene.add(key);
    const rim = new THREE.PointLight(col(pal.accent2), 30, 14); rim.position.set(3, 1, -3); scene.add(rim);
    const haze = glowSprite(pal.glow, 18, 0.22); haze.position.set(0, 0.8, -6); scene.add(haze);
    const dust = starfield(scene, 31, 600, 18);
    // ---- labels
    const AT = { diaphragm: V3(-0.62, 0.32, 0.4), lungs: V3(-0.95, 1.2, 0.5), nerve: V3(-0.4, 1.6, 0.58), stomach: V3(0.95, -0.9, 0.4), brain: brainP, larynx: larynxP };
    const lbls = (P.labels || []).map(L => ({ L, el: labels.add('layer') }));
    const camDef = {
      spasm: { dist: portrait ? 6.4 : 5.2, yaw: 16, pitch: 12, ty: portrait ? -0.25 : 0.3, fov: 40, sy: portrait ? 0.1 : 0, drift: 1.0 },
      breathe: { dist: portrait ? 9.6 : 7.4, yaw: -12, pitch: 8, ty: portrait ? -0.67 : 0.8, fov: 40, sy: 0, drift: 1.4 },
      nerve: { dist: portrait ? 9.6 : 7.2, yaw: 14, pitch: 6, ty: portrait ? -0.62 : 1.0, fov: 40, sy: 0, drift: 1.2 },
      stomach: { dist: portrait ? 7.6 : 5.6, yaw: -22, pitch: 16, tx: 0.3, ty: portrait ? -0.74 : -0.2, fov: 40, sy: portrait ? 0.16 : 0, drift: 1.2 },
      reflex: { dist: portrait ? 12.6 : 9.0, yaw: 10, pitch: 4, ty: portrait ? 1.3 : 1.4, fov: 40, sy: portrait ? 0.24 : 0, drift: 1.6 },
    }[mode] || {};
    const camAt = (lt, dur, env) => shotCam(Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) }), env, lt, dur);
    const jerk = d => d < 0 ? 0 : d < 0.07 ? d / 0.07 : Math.exp(-(d - 0.07) * 5);
    const every = P.every || 1.3;
    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t, hit = cue(cues, 'hit', Math.min(1.0, dur * 0.4));
        applyCam(camera, camAt(lt, dur, env), W, H);
        dust(t);
        // hiccup events (scene-local seconds)
        let ev = [];
        if (mode === 'spasm' || mode === 'nerve') { if (mode === 'spasm' && hit > 0.9) ev.push(0.12); for (let e = hit; e < dur + 1; e += every) ev.push(e); }
        else if (mode === 'reflex') for (let e = 0.5; e < dur + 1; e += 1.6) ev.push(e);
        else if (mode === 'stomach') ev.push(hit + 1.0);
        let J = 0, shake = 0, last = -1e9;
        for (const e of ev) { const d = lt - e; J = Math.max(J, jerk(d) * (e === ev[0] || e === hit ? 1 : 0.8)); if (d >= 0) { shake += Math.exp(-d * 7) * Math.sin(d * 42); last = e; } }
        const breath = mode === 'breathe' || mode === 'stomach' ? 0.5 - 0.5 * Math.cos(lt * Math.PI * 2 / 3.0) : 0.5 - 0.5 * Math.cos(t * 1.2);
        const inflate = mode === 'stomach' ? prog(lt, hit - 0.3, 1.1) : 0;
        const descend = 0.16 * breath + 0.38 * J;
        shapeDia(descend, 0.25 * breath + 0.55 * J, 0.9 * inflate);
        body.position.set(0.05 * shake, -0.04 * Math.abs(shake), 0);
        body.rotation.y = 0.05 * Math.sin(t * 0.35);
        // lungs: inhale = taller and wider; a jolt at every hiccup
        const ls = 1 + 0.05 * breath + 0.08 * J;
        lungs.forEach((m, i) => { m.scale.set((i ? 0.95 : 1.05) * ls, ls * (1 + 0.04 * breath), ls); m.position.y = 0.82 - 0.05 * descend; });
        mLung.emissiveIntensity = 0.55 + 0.4 * J;
        const hp = punch(lt, hit, 0.8);
        mDia.emissive.set(J > 0.02 ? mix(pal.accent, '#ff1a1a', clamp01(J * 2)) : pal.accent);
        mDia.color.set(mix('#ffffff', '#ff6a5a', clamp01(J * 1.5)));
        mDia.emissiveIntensity = 0.12 + 0.45 * J + 0.3 * hp + (mode === 'breathe' ? 0.25 * prog(lt, cue(cues, 'label', hit), 0.6) : 0);
        redGlow.material.opacity = Math.min(0.9, 1.0 * J);
        redGlow.scale.setScalar(4.2 + 3 * J);
        diaGlow.material.opacity = 0.14 + 0.1 * Math.sin(t * 2) + 0.25 * hp;
        // air rushes in, then the larynx snaps shut (bright flash)
        air.forEach(a => {
          const d = lt - last - a.k * 0.12;
          if (last < -1e8 || d < 0 || d > 0.45) { a.g.material.opacity = 0; return; }
          const p = clamp01(d / 0.4), y = lerp(3.1, 1.5, p);
          a.g.position.set(y < 1.85 ? a.s * (1.85 - y) * 0.9 : 0, y, 0.2); a.g.material.opacity = 0.9 * Math.sin(Math.PI * p);
        });
        const shut = last > -1e8 ? Math.exp(-Math.max(0, lt - last - 0.1) * 5) * (lt > last + 0.1 ? 1 : 0) : 0;
        larynx.material.opacity = 0.15 + 0.95 * shut; larynx.scale.setScalar(0.5 + 1.1 * shut);
        larynxRing.material.emissiveIntensity = 0.2 + 2 * shut;
        // nerve signals
        if (showNerve) {
          mNerve.opacity = (mode === 'spasm' ? 0.35 : 0.7) + 0.2 * Math.sin(t * 3);
          nPulse.forEach((g, i) => {
            const side = i % 2, k = Math.floor(i / 2);
            const e = ev.find(x => x > lt - 0.05 - k * 0.06 && x < lt + 0.7) ?? null;
            let u = -1;
            if (e != null) u = 1 - (e - (lt - k * 0.06)) / 0.6;
            if (u < 0 || u > 1.05) { g.material.opacity = 0; return; }
            g.position.copy(phrenic[side].getPoint(clamp01(u)));
            g.material.opacity = (mode === 'spasm' ? 0.6 : 1) * (1 - 0.3 * k);
            g.scale.setScalar(0.5 - 0.1 * k);
          });
          brain.material.opacity = mode === 'spasm' ? 0 : Math.min(1, 0.35 + 0.5 * Math.max(...ev.map(e => Math.exp(-Math.abs(lt - (e - 0.6)) * 4)), 0) + (mode === 'reflex' ? 0.3 + 0.7 * hp : 0));
          brain.scale.setScalar(1.2 + (mode === 'reflex' ? 0.4 * Math.sin(t * 4) + 1.6 * hp : 0));
          stem.scale.setScalar(1 + 0.6 * hp); mStem.emissiveIntensity = 1.0 + 0.4 * Math.sin(t * 4) + 2 * hp;
        }
        if (mode === 'reflex') {
          vPulse.forEach((g, i) => { const u = ((lt * 0.7 + i / 3) % 1); g.position.copy(vagus.getPoint(u)); g.material.opacity = 0.9 * Math.sin(Math.PI * u); });
          mVagus.opacity = 0.5 + 0.2 * Math.sin(t * 2.4);
        }
        // stomach inflates, bubbles rise
        const ss = 1 + 0.45 * inflate + 0.03 * Math.sin(t * 2);
        stomach.scale.set(1 + 0.3 * inflate, ss, ss); stomach.position.set(stomP.x, stomP.y - 0.22 * (ss - 1), stomP.z);
        mStom.emissiveIntensity = 0.5 + 0.5 * inflate + 0.3 * hp;
        bubbles.forEach(b => {
          const u = (lt * b.sp + b.ph) % 1;
          b.b.position.set(stomach.position.x + b.x * ss * 0.7, stomach.position.y - 0.3 * ss + u * 0.6 * ss, stomach.position.z + 0.35 * ss + b.z * 0.2);
          b.b.material.opacity = 0.75 * Math.sin(Math.PI * u) * clamp01(inflate * 1.5); b.b.scale.setScalar(0.08 + 0.1 * u);
        });
        mPull.opacity = (mode === 'spasm' || mode === 'nerve') ? Math.min(1, 1.6 * J) : 0;
        pulls.forEach((g, i) => { g.position.y = -0.62 - 0.4 * (1 - J); g.scale.setScalar(0.9 + 0.3 * J); });
        // breathing arrow
        if (mode === 'breathe') {
          const a = prog(lt, hit - 0.15, 0.4);
          mArrow.opacity = 0.95 * a;
          arrow.position.y = -0.65 - 0.35 * ((lt - hit) > 0 ? ((lt - hit) * 0.8) % 1 : 0);
          arrow.scale.setScalar(0.8 + 0.3 * punch(lt, hit, 0.8));
        }
        // labels
        body.updateMatrixWorld(); camera.updateMatrixWorld();
        lbls.forEach(({ L, el }) => {
          const at = cue(cues, L.cue || 'label', L.cue === 'hit' ? hit : (cues && cues.label != null ? cues.label : 0.35));
          const a = prog(lt, at, 0.4);
          const wp = (AT[L.at] || AT.diaphragm).clone().applyMatrix4(body.matrixWorld);
          const sp = toScreen(wp, camera, W, H);
          const x = Math.max(W * 0.22, Math.min(W * 0.78, sp[0] + (L.dx ?? (portrait ? -170 : -260))));
          const y = Math.max(H * (portrait ? 0.2 : 0.18), Math.min(H * (portrait ? 0.56 : 0.78), sp[1] + (L.dy ?? (portrait ? -170 : -120))));
          const fs = Math.round((L.size || (portrait ? 96 : 72)) * (1 + 0.08 * punch(lt, at, 0.6)));
          el.set(`<b style="font-size:${fs}px;color:${L.color || pal.accent}">${L.text}</b>` + (L.sub ? `<small style="font-size:44px">${L.sub}</small>` : ''), x, y, a, [sp[0], sp[1]], prog(lt, at, 0.6));
        });
      },
    };
  },
};
