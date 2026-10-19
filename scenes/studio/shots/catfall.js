// catfall: a stylised 3D tabby cat in free fall whose front and rear halves roll separately (righting reflex).
// The body bends in the middle; legs tuck (fold) or stretch out; speed lines stream past; it can land on a floor.
// P: {mode: "fall"|"void"|"bend"|"front"|"rear"|"land", fur: "#e8964a", stripe: "#a8541f",
//     tags: [{part: "front"|"rear"|"head", text, sub, x, y, at}], camera: {...}}
// cues: hit (fall: the twist starts; void: an empty "nothing to grab" pulse; bend: the body bends;
//       front: front legs tuck + front half turns; rear: rear half turns; land: flash, then the cat touches down)
'use strict';

function catFurTex(base, stripe, seed, rings = 7) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d'), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 512, 256);
  // tabby stripes: wavy bands across v (rings around the body axis once the sphere is turned)
  for (let i = 0; i < rings; i++) {
    const v0 = (i + 0.5) / rings * 256;
    g.fillStyle = stripe; g.globalAlpha = 0.55 + r() * 0.25;
    g.beginPath();
    for (let x = 0; x <= 512; x += 16) g.lineTo(x, v0 - 9 - 6 * Math.sin(x / 40 + i) - r() * 3);
    for (let x = 512; x >= 0; x -= 16) g.lineTo(x, v0 + 9 + 6 * Math.sin(x / 47 + i * 2) + r() * 3);
    g.fill();
  }
  g.globalAlpha = 1;
  for (let i = 0; i < 2600; i++) {            // fur grain
    g.fillStyle = r() < 0.5 ? 'rgba(90,40,10,.16)' : 'rgba(255,230,190,.14)';
    g.fillRect(r() * 512, r() * 256, 1 + r() * 2, 3 + r() * 5);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping;
  return t;
}

SHOTS.catfall = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H, labels } = ctx;
    const portrait = H > W, mode = P.mode || 'fall';
    const FUR = P.fur || '#e8964a', STR = P.stripe || '#a8541f', CREAM = '#fbe9d2', PINK = '#f29aa6';
    const furTex = catFurTex(FUR, STR, 5), headTex = catFurTex(FUR, STR, 9, 4);
    const MS = o => new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.82, metalness: 0 }, o));
    const mFurF = MS({ map: furTex, emissive: col(pal.accent), emissiveIntensity: 0 });
    const mFurR = MS({ map: furTex, emissive: col(pal.accent2), emissiveIntensity: 0 });
    const mHead = MS({ map: headTex, emissive: col(pal.accent), emissiveIntensity: 0 });
    const mCreamF = MS({ color: col(CREAM), emissive: col(pal.accent), emissiveIntensity: 0 });
    const mCreamR = MS({ color: col(CREAM), emissive: col(pal.accent2), emissiveIntensity: 0 });
    const mPink = MS({ color: col(PINK), roughness: 0.5 });
    const mIris = MS({ color: col('#7cc75a'), emissive: col('#3d8a22'), emissiveIntensity: 0.35, roughness: 0.25 });
    const mPupil = MS({ color: col('#050505'), roughness: 0.1, metalness: 0.2 });
    const mWhisk = new THREE.MeshBasicMaterial({ color: col('#fffaf0') });
    const S = (r, w = 40, h = 28) => new THREE.SphereGeometry(r, w, h);
    const ell = (mat, rx, ry, rz, x, y, z, parent) => { const m = new THREE.Mesh(S(1), mat); m.scale.set(rx, ry, rz); m.position.set(x, y, z); parent.add(m); return m; };

    const cat = new THREE.Group(); scene.add(cat);
    // halves: bend group (pitch, fixed in the cat frame) > roll group (about the body's long axis, x)
    const half = (sign) => { const b = new THREE.Group(); cat.add(b); const r = new THREE.Group(); b.add(r); return { bend: b, roll: r, sign }; };
    const F = half(1), R = half(-1);
    const waist = new THREE.Group(); cat.add(waist);
    ell(mFurF, 0.37, 0.36, 0.35, 0, 0, 0, waist);
    const mLegF = MS({ map: furTex, emissive: col(pal.accent), emissiveIntensity: 0 }), mLegR = MS({ map: furTex, emissive: col(pal.accent2), emissiveIntensity: 0 });
    const mPawF = MS({ color: col(CREAM), emissive: col(pal.accent), emissiveIntensity: 0 }), mPawR = MS({ color: col(CREAM), emissive: col(pal.accent2), emissiveIntensity: 0 });
    // body = slim capsule per half + rounder chest / hips (a waist), each with a back-face glow shell that lights up per half
    const shells = [];
    const shellOf = (m, glowCol, front, k = 1.1) => {
      const sm = new THREE.MeshBasicMaterial({ color: col(glowCol), side: THREE.BackSide, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
      const sh = new THREE.Mesh(m.geometry, sm); sh.position.copy(m.position); sh.rotation.copy(m.rotation); sh.scale.copy(m.scale).multiplyScalar(k); m.parent.add(sh);
      shells.push({ sm, front });
    };
    const caps = (mat, r, len, x, parent) => {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 12, 36), mat); m.rotation.z = Math.PI / 2; m.position.x = x; parent.add(m); return m;
    };
    // front: chest, belly patch, neck, head, front legs
    shellOf(caps(mFurF, 0.33, 0.6, 0.33, F.roll), pal.accent, true, 1.14);
    shellOf(ell(mFurF, 0.48, 0.44, 0.42, 0.62, 0.02, 0, F.roll), pal.accent, true);
    ell(mCreamF, 0.44, 0.3, 0.3, 0.55, -0.16, 0, F.roll);
    ell(mFurF, 0.25, 0.27, 0.26, 0.98, 0.2, 0, F.roll);
    const head = new THREE.Group(); head.position.set(1.3, 0.36, 0); F.roll.add(head);
    if (P.kitten) head.scale.setScalar(1.3);
    ell(mHead, 0.42, 0.38, 0.43, 0, 0, 0, head);
    for (const s of [-1, 1]) {
      ell(mHead, 0.22, 0.19, 0.2, 0.12, -0.12, s * 0.2, head);                              // cheeks
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.38, 4), mHead); ear.scale.x = 0.42; ear.position.set(-0.04, 0.4, s * 0.22); ear.rotation.x = s * 0.32; head.add(ear);
      const inner = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.26, 4), mPink); inner.scale.x = 0.3; inner.position.set(0.03, 0.37, s * 0.215); inner.rotation.x = s * 0.32; head.add(inner);
      ell(mCreamF, 0.07, 0.125, 0.115, 0.35, 0.07, s * 0.165, head);                      // eye white
      ell(mIris, 0.05, 0.11, 0.1, 0.385, 0.07, s * 0.165, head);
      ell(mPupil, 0.03, 0.085, 0.035, 0.425, 0.07, s * 0.165, head);
      const gl = glowSprite('#ffffff', 0.08, 0.95); gl.position.set(0.46, 0.12, s * 0.15); head.add(gl);
      ell(mCreamF, 0.12, 0.1, 0.11, 0.37, -0.14, s * 0.075, head);                       // muzzle
      for (const k of [-1, 0, 1]) {                                                       // whiskers
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.004, 0.55, 5), mWhisk);
        w.position.set(0.4, -0.14 + k * 0.035, s * 0.35); w.rotation.set(Math.PI / 2 + s * k * 0.12, 0, s * (0.25 + k * 0.05)); head.add(w);
      }
    }
    ell(mCreamF, 0.1, 0.07, 0.1, 0.33, -0.24, 0, head);                                    // chin
    ell(mPink, 0.045, 0.035, 0.065, 0.47, -0.05, 0, head);                                 // nose
    const legs = (grp, x, mat, matPaw, thick, front) => [-1, 1].map(s => {
      const pivot = new THREE.Group(); pivot.position.set(x, -0.22, s * 0.21); grp.add(pivot);
      if (!front) ell(mat, 0.26, 0.24, 0.17, 0, 0.02, 0, pivot);                          // thigh
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(thick, thick * 0.8, 0.52, 16), mat); leg.position.y = -0.26; pivot.add(leg);
      ell(matPaw, 0.16, 0.09, 0.14, 0.03, -0.54, 0, pivot);
      return { pivot, s };
    });
    const legF = legs(F.roll, 0.7, mLegF, mPawF, 0.09, true);
    const legR = legs(R.roll, -0.74, mLegR, mPawR, 0.1, false);
    // rear: hips, belly, tail chain (curling up and over)
    shellOf(caps(mFurR, 0.34, 0.6, -0.33, R.roll), pal.accent2, false, 1.14);
    shellOf(ell(mFurR, 0.5, 0.46, 0.44, -0.64, 0.03, 0, R.roll), pal.accent2, false);
    ell(mCreamR, 0.45, 0.27, 0.3, -0.45, -0.17, 0, R.roll);
    const tail = []; { let parent = new THREE.Group(); parent.position.set(-1.08, 0.18, 0); R.roll.add(parent);
      for (let i = 0; i < 9; i++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.075 - i * 0.004, 0.08 - i * 0.004, 0.2, 12), mFurR);
        seg.position.y = 0.1; parent.add(seg);
        const tip = new THREE.Group(); tip.position.y = 0.2; parent.add(tip);
        tail.push(parent); parent = tip;
      }
      ell(mFurR, 0.075, 0.09, 0.075, 0, 0.02, 0, parent);
      tail[0].rotation.z = 0.95; }
    // spin indicators: an arc arrow wrapped around each half
    const arcs = [F, R].map((h, i) => {
      const m = new THREE.MeshBasicMaterial({ color: col(i ? pal.accent2 : pal.accent), transparent: true, opacity: 0, depthWrite: false });
      const g = new THREE.Group(); g.position.x = i ? -0.5 : 0.5; h.bend.add(g);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.04, 8, 64, 4.4), m); ring.rotation.y = Math.PI / 2; g.add(ring);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.26, 16), m);
      tip.position.set(0, Math.sin(4.4) * 0.78, -Math.cos(4.4) * 0.78); g.add(tip);
      tip.quaternion.setFromUnitVectors(V3(0, 1, 0), V3(0, Math.cos(4.4), Math.sin(4.4)));   // tangent to the ring
      return { g, m, ring };
    });
    // lights + world
    scene.add(new THREE.HemisphereLight(0xfff1e0, 0x1a1020, 1.25));
    const key = new THREE.DirectionalLight(0xffffff, 2.3); key.position.set(3, 5, 4); scene.add(key);
    const rim = new THREE.PointLight(col(pal.accent2), 40, 18); rim.position.set(-3, 1.5, -3); scene.add(rim);
    const rim2 = new THREE.PointLight(col(pal.accent), 25, 14); rim2.position.set(2, -2.5, 2); scene.add(rim2);
    const halo = glowSprite(pal.glow, 9, 0.4); halo.position.set(0, 0, -4); scene.add(halo);
    const stars = starfield(scene, 41, 500, 40);
    const r = rng(17);
    const bokeh = Array.from({ length: 34 }, (_, i) => {
      const s = glowSprite(i % 3 ? pal.glow : pal.accent, 0.4 + r() * 1.3, 0); scene.add(s);
      return { s, x: (r() - 0.5) * 22, y0: r() * 24, z: -7 - r() * 9, v: 0.6 + r() * 1.2, a: 0.25 + r() * 0.4, ph: r() * 6.28 };
    });
    const NL = 70, lineMat = new THREE.MeshBasicMaterial({ color: col('#ffffff'), transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false });
    const lines = new THREE.InstancedMesh(new THREE.BoxGeometry(0.018, 1, 0.018), lineMat, NL); scene.add(lines);
    const lineD = Array.from({ length: NL }, () => { const a = r() * 6.28, d = 1.8 + r() * 5; return { x: Math.cos(a) * d, z: Math.sin(a) * d - 1, y0: r() * 18, len: 0.6 + r() * 1.8, v: 9 + r() * 7 }; });
    // pulse ring ("nothing to hold on to") and landing floor + dust
    const pulseM = new THREE.MeshBasicMaterial({ color: col(pal.accent), transparent: true, opacity: 0, depthWrite: false });
    const pulse = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 8, 96), pulseM); scene.add(pulse);
    const pulse2 = new THREE.Mesh(new THREE.TorusGeometry(1, 0.02, 8, 96), pulseM); scene.add(pulse2);
    let floor = null, dust = [];
    const FLOOR_Y = -0.86;
    if (mode === 'land') {
      const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
      const gr = g.createRadialGradient(256, 256, 10, 256, 256, 256);
      gr.addColorStop(0, rgba(pal.accent2, 0.55)); gr.addColorStop(0.35, rgba(pal.glow, 0.28)); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
      g.strokeStyle = rgba(pal.accent2, 0.25); g.lineWidth = 3;
      for (let k = 1; k < 6; k++) { g.beginPath(); g.arc(256, 256, k * 44, 0, 6.29); g.stroke(); }
      floor = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR_Y; scene.add(floor);
      dust = Array.from({ length: 26 }, (_, i) => { const s = glowSprite(i % 2 ? '#fff4e6' : pal.accent2, 0.3, 0); scene.add(s); return { s, a: i / 26 * 6.28 + r() * 0.2, v: 1.2 + r() * 1.4 }; });
    }
    const shadow = glowSprite('#000000', 2.4, 0); shadow.material.blending = THREE.NormalBlending; shadow.position.y = FLOOR_Y + 0.01; if (floor) scene.add(shadow);
    // tags (layer labels with leader lines)
    const tags = (P.tags || []).map(tg => ({ tg, l: labels.add(tg.line === false ? 'counter' : 'layer') }));
    const camDef = {
      fall: { dist: portrait ? 6.4 : 4.6, yaw: 62, pitch: 8, fov: 34, tx: 0.55, ty: 0.62, drift: 3 },
      void: { dist: portrait ? 9.6 : 6.6, yaw: 120, pitch: 8, fov: 34, ty: -0.27, drift: 6 },
      bend: { dist: portrait ? 11.5 : 5.8, yaw: 50, pitch: 16, fov: 34, ty: 0.2, drift: 2 },
      front: { dist: portrait ? 10.8 : 6.4, yaw: 28, pitch: 12, fov: 34, ty: -0.05, tx: 0.2, drift: 1 },
      rear: { dist: portrait ? 10.8 : 6.4, yaw: 30, pitch: 12, fov: 34, ty: -0.05, tx: 0.2, drift: -1 },
      land: { dist: portrait ? 11.5 : 6.4, yaw: 35, pitch: 12, fov: 34, ty: 0.6, drift: 2 },
    }[mode] || {};
    if (portrait) camDef.sy = camDef.sy ?? 0.08;
    const PP = Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) });
    const camAt = (lt, dur, env) => shotCam(PP, env, lt, dur);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V3(1, 1, 1), pos = V3(0, 0, 0);
    // pose (degrees for rolls/bend, 0..1 for tucks) as a pure function of lt
    function pose(lt, dur, hit, t) {
      const wob = 5 * Math.sin(t * 2.3), o = { rf: 180 + wob, rr: 180 + wob * 0.6, bend: 0, ft: 0, rt: 0, y: 0, tintF: 0, tintR: 0 };
      if (mode === 'fall') {
        const s0 = Math.min(hit - 0.15, 0.3), a = progIO(lt, s0, 1.0), b = progIO(lt, s0 + 0.9, 1.2);
        o.rf -= (160 + wob) * a; o.rr -= 25 * b; o.bend = 20 * prog(lt, hit - 0.3, 0.7); o.ft = 0.8 * prog(lt, hit - 0.3, 0.5);
      } else if (mode === 'void') {
        const a = progIO(lt, 0.0, 1.1), b = progIO(lt, 0.7, 1.2);
        o.rf = lerp(20, 0, a); o.rr = lerp(155 + wob * 0.6, 0, b);
        o.bend = 20 * (1 - progIO(lt, 1.2, 0.8)); o.ft = 0.8 * (1 - prog(lt, 0.7, 0.4)); o.rt = 0.8 * prog(lt, 0.5, 0.4) * (1 - prog(lt, 1.7, 0.4));
        const post = Math.max(0, lt - 2.0); o.rf += 4 * Math.sin(t * 2.1) * clamp01(post); o.rr += 4 * Math.sin(t * 2.1 + 0.5) * clamp01(post);
      } else if (mode === 'bend') {
        const b = spring(lt, hit - 0.1, 0.8); o.bend = 38 * b; o.tintF = o.tintR = prog(lt, hit - 0.1, 0.5);
      } else if (mode === 'front') {
        o.bend = 38; o.tintF = o.tintR = 1;
        const a = progIO(lt, hit + 0.1, 1.3); o.ft = prog(lt, hit - 0.3, 0.45);
        o.rf = lerp(180 + wob * (1 - a), 0, a); o.rr = lerp(180 + wob * 0.6 * (1 - a), 200, a);
      } else if (mode === 'rear') {
        const a = progIO(lt, dur * 0.3, dur * 0.6);
        o.bend = lerp(38, 12, a); o.tintF = o.tintR = 1;
        o.ft = 1 - prog(lt, dur * 0.22, 0.45); o.rt = prog(lt, dur * 0.2, 0.45);
        o.rr = lerp(200, 0, a); o.rf = 3 * Math.sin(t * 1.7) * a;
        o.arc = prog(lt, dur * 0.25, 0.4); o.arcGrow = a;
      } else if (mode === 'land') {
        const a = progIO(lt, 0.05, 0.9), b = progIO(lt, 0.45, 0.9);
        o.rf = lerp(180, 0, a); o.rr = lerp(180, 0, b);
        o.bend = 24 * Math.sin(Math.PI * clamp01(lt / 1.4)); o.ft = 0.8 * Math.sin(Math.PI * clamp01(lt / 0.9)); o.rt = 0.8 * Math.sin(Math.PI * clamp01((lt - 0.4) / 0.9));
        const land = Math.max(1.8, hit + 0.35), fall0 = land - 0.6;
        const f = clamp01((lt - fall0) / 0.6);
        o.y = lt < fall0 ? 0.9 + 0.08 * Math.sin(t * 2) : lt < land ? (0.9 + 0.08 * Math.sin(fall0 * 0 + t * 0)) * (1 - f * f) : 0;
        o.land = land;
      }
      return o;
    }
    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t, hit = cue(cues, 'hit', Math.min(1.0, dur * 0.35));
        applyCam(camera, camAt(lt, dur, env), W, H);
        stars(t);
        const p = pose(lt, dur, hit, t);
        F.roll.rotation.x = p.rf * DEG; R.roll.rotation.x = p.rr * DEG; waist.rotation.x = (p.rf + p.rr) / 2 * DEG;
        F.bend.rotation.z = p.bend / 2 * DEG; R.bend.rotation.z = -p.bend / 2 * DEG;
        const hp = punch(lt, hit, 0.8);
        legF.forEach(l => { l.pivot.rotation.z = lerp(-0.15, 1.45, p.ft) + 0.05 * Math.sin(t * 5 + l.s); l.pivot.rotation.x = l.s * lerp(0.35, 0.05, p.ft); });
        legR.forEach(l => { l.pivot.rotation.z = lerp(0.15, 1.25, p.rt) + 0.05 * Math.sin(t * 5 + l.s + 1); l.pivot.rotation.x = l.s * lerp(0.4, 0.08, p.rt); });
        tail.forEach((s, i) => { s.rotation.x = 0.22 * Math.sin(t * 2.4 - i * 0.55); if (i) s.rotation.z = -0.12 + 0.08 * Math.sin(t * 1.8 - i * 0.4); });
        head.rotation.z = 0.06 * Math.sin(t * 1.6); head.rotation.x = (p.rf > 90 ? 1 : 0) * -0.25 * prog(lt, hit - 0.2, 0.4) * (mode === 'fall' ? 1 : 0);
        // squash on landing
        let sq = 0;
        if (mode === 'land' && lt >= p.land) { const k = lt - p.land; sq = Math.exp(-k * 6) * Math.sin(k * 18) * 0.12; }
        cat.position.y = p.y + (mode === 'land' ? 0 : 0.08 * Math.sin(t * 1.4));
        const ks = P.kitten ? 0.8 : 1; cat.scale.set(ks * (1 + sq * 0.6), ks * (1 - sq), ks * (1 + sq * 0.6));
        const lgF = p.ft * (0.6 + 0.2 * Math.sin(t * 6)), lgR = p.rt * (0.6 + 0.2 * Math.sin(t * 6 + 1));
        mLegF.emissiveIntensity = mPawF.emissiveIntensity = lgF; mLegR.emissiveIntensity = mPawR.emissiveIntensity = lgR;
        cat.rotation.z = (mode === 'land' ? 0 : 0.05 * Math.sin(t * 0.9));
        const tF = p.tintF * (0.1 + 0.03 * Math.sin(t * 4)), tR = p.tintR * (0.12 + 0.03 * Math.sin(t * 4 + 1));
        shells.forEach(sh => { sh.sm.opacity = (sh.front ? p.tintF : p.tintR) * (0.75 + 0.2 * Math.sin(t * 5 + (sh.front ? 0 : 1.5))); });
        [mFurF, mCreamF, mHead].forEach(m => { m.emissiveIntensity = tF; }); mPawF.emissiveIntensity = Math.max(mPawF.emissiveIntensity, 0);
        [mFurR, mCreamR].forEach(m => { m.emissiveIntensity = tR; });
        mIris.emissiveIntensity = 0.35 + 0.8 * hp;
        // spin arcs
        arcs.forEach((a, i) => {
          const on = mode === 'rear' ? (i === 1 ? p.arc * (1 - 0.5 * prog(lt, dur * 0.92, 0.3)) : 0) : (mode === 'front' && i === 0) ? prog(lt, hit, 0.4) * (1 - 0.6 * prog(lt, hit + 1.6, 0.6)) : 0;
          a.m.opacity = 0.9 * on; a.g.visible = on > 0.01;
          a.g.rotation.x = ((i ? p.rr : p.rf) - 180) * DEG * 1.0 - 0.6;
          a.g.scale.setScalar((mode === 'rear' ? 0.7 + 0.5 * (p.arcGrow || 0) : 1) * (1 + 0.06 * Math.sin(t * 6)) + 0.12 * punch(lt, hit, 0.6));
        });
        // falling world: streaks + bokeh move up (the cat falls through them)
        const sp = mode === 'land' ? Math.max(0, 1 - prog(lt, (p.land || 1.6) - 0.3, 0.4)) : 1;
        lineMat.opacity = 0.3 * sp;
        lineD.forEach((d, i) => {
          const y = ((d.y0 + d.v * t) % 18) - 9;
          sc.set(1, d.len * (0.4 + 0.6 * sp), 1); m4.compose(pos.set(d.x, y, d.z), q.identity(), sc); lines.setMatrixAt(i, m4);
        });
        lines.instanceMatrix.needsUpdate = true;
        bokeh.forEach(b => { const y = ((b.y0 + b.v * t * (0.3 + 0.7 * sp)) % 24) - 12; b.s.position.set(b.x + 0.3 * Math.sin(t * 0.5 + b.ph), y, b.z); b.s.material.opacity = b.a * (0.6 + 0.4 * Math.sin(t * 1.3 + b.ph)); });
        halo.material.opacity = 0.35 + 0.1 * Math.sin(t * 1.2) + 0.35 * hp;
        // pulse: empty space around the cat
        const pv = mode === 'void' || P.pulse ? lin(lt, hit - 0.05, 1.3) : 0;
        pulseM.opacity = pv > 0 && pv < 1 ? 0.85 * (1 - pv) : 0;
        pulse.scale.setScalar(1.1 + 0.75 * EASE(pv)); pulse2.scale.setScalar(0.9 + 0.55 * EASE(pv));
        pulse.quaternion.copy(camera.quaternion); pulse2.quaternion.copy(camera.quaternion);
        // landing
        if (floor) {
          const L = p.land, k = lt - L;
          floor.material.opacity = 0.6 + 0.4 * prog(lt, L - 0.8, 0.8) + 0.2 * punch(lt, L, 0.8);
          shadow.material.opacity = 0.55 * clamp01(1 - p.y / 1.6); shadow.scale.setScalar(2.6 - 0.6 * p.y);
          dust.forEach(d => {
            const a = k > 0 ? clamp01(1 - k / 1.4) : 0, rr = 0.6 + d.v * (1 - Math.exp(-k * 2.2));
            d.s.position.set(Math.cos(d.a) * rr, FLOOR_Y + 0.12 + 0.25 * (1 - Math.exp(-k * 3)) * (k > 0 ? 1 : 0), Math.sin(d.a) * rr);
            d.s.material.opacity = 0.7 * a; d.s.scale.setScalar(0.25 + 0.5 * (1 - a));
          });
        }
        // tags
        cat.updateMatrixWorld(true);
        tags.forEach(({ tg, l }) => {
          const at = cue(cues, tg.at || 'hit', hit) + (tg.delay || 0);
          const wp = tg.part === 'rear' ? V3(-0.55, 0.15, 0).applyMatrix4(R.roll.matrixWorld) : tg.part === 'head' ? V3(0, 0.2, 0).applyMatrix4(head.matrixWorld) : V3(0.5, 0.15, 0).applyMatrix4(F.roll.matrixWorld);
          const [sx, sy] = toScreen(wp, camera, W, H);
          const c = tg.part === 'rear' ? pal.accent2 : pal.accent;
          const html = `<b style="font-size:${portrait ? 84 : 64}px;color:${c}">${tg.text}</b>` + (tg.sub ? `<small style="font-size:46px">${tg.sub}</small>` : '');
          l.set(html, (tg.x ?? 0.5) * W, (tg.y ?? 0.25) * H, prog(lt, at, 0.4), [sx, sy], prog(lt, at + 0.1, 0.5));
        });
      },
    };
  },
};
