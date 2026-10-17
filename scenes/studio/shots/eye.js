// eye: a close-up human eye in its lids; irritant gas molecules drift in and the eye reddens, or tears well up and roll down.
// P: {mode: "gas"|"tears", iris: "#5f8a4a", red: 0..1 (vein redness), gas: "#hex", camera: {...}}
// cues: hit (gas: molecules touch the eye, nerves flash, veins redden; tears: the tear gland fires and drops fall)
'use strict';

function eyeTex(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  paint(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4;
  return t;
}
// almond eye opening on a 1024x512 equirect canvas centred on (256, 256); s widens it
function eyeAlmond(g, s = 1) {
  const cx = 256, cy = 256, hw = 150 * s, up = 70 * s, lo = 52 * s;
  g.beginPath();
  for (let i = 0; i <= 40; i++) { const u = -1 + 2 * i / 40; g[i ? 'lineTo' : 'moveTo'](cx + u * hw, cy - up * Math.pow(1 - u * u, 0.75) + 6 * u); }
  for (let i = 40; i >= 0; i--) { const u = -1 + 2 * i / 40; g.lineTo(cx + u * hw, cy + lo * Math.pow(1 - u * u, 0.85) + 6 * u); }
  g.closePath();
}

SHOTS.eye = {
  kind: '3d',
  build(ctx) {
    const { P, scene, camera, pal, W, H } = ctx;
    const portrait = H > W, mode = P.mode || 'gas', r = rng(23);
    const gasCol = P.gas || pal.accent;
    const SKIN = '#c98f72';
    // ---- eyeball texture (sclera + iris) and a vein map for the reddening
    const veins = [];
    { const rv = rng(11);
      for (let i = 0; i < 26; i++) {
        const a = rv() * 6.28, d0 = 230 + rv() * 60, pts = [];
        let x = 256 + Math.cos(a) * d0, y = 256 + Math.sin(a) * d0 * 0.8;
        for (let k = 0; k < 9; k++) { pts.push([x, y]); const ang = Math.atan2(256 - y, 256 - x) + (rv() - 0.5) * 1.2; x += Math.cos(ang) * 16; y += Math.sin(ang) * 16; if (Math.hypot(x - 256, y - 256) < 105) break; }
        veins.push({ pts, w: 1.5 + rv() * 2.5, br: rv() });
      } }
    const drawVeins = (g, colr, alpha) => {
      g.strokeStyle = colr; g.lineCap = 'round';
      veins.forEach(v => { g.globalAlpha = alpha * (0.5 + 0.5 * v.br); g.lineWidth = v.w; g.beginPath(); v.pts.forEach((p, i) => i ? g.lineTo(...p) : g.moveTo(...p)); g.stroke(); });
      g.globalAlpha = 1;
    };
    const iris = P.iris || '#5f8a4a';
    const ball = eyeTex(1024, 512, (g, w, h) => {
      g.fillStyle = '#e9d8d2'; g.fillRect(0, 0, w, h);
      const sg = g.createRadialGradient(256, 256, 90, 256, 256, 320);
      sg.addColorStop(0, '#fbf7f2'); sg.addColorStop(0.6, '#f1e6e0'); sg.addColorStop(1, '#dcbab2');
      g.fillStyle = sg; g.fillRect(0, 0, 640, h);
      drawVeins(g, '#c8574f', 0.45);
      const ig = g.createRadialGradient(256, 256, 30, 256, 256, 96);
      ig.addColorStop(0, '#c9a040'); ig.addColorStop(0.35, iris); ig.addColorStop(0.85, shade(iris, -0.25)); ig.addColorStop(1, '#1d2018');
      g.fillStyle = ig; g.beginPath(); g.arc(256, 256, 96, 0, 6.29); g.fill();
      const ri = rng(3);
      for (let i = 0; i < 220; i++) {
        const a = ri() * 6.283, r0 = 38 + ri() * 8, r1 = 70 + ri() * 24;
        g.strokeStyle = ri() < 0.5 ? 'rgba(255,240,190,.28)' : 'rgba(10,20,5,.3)'; g.lineWidth = 1 + ri() * 1.6;
        g.beginPath(); g.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0); g.lineTo(256 + Math.cos(a + 0.05) * r1, 256 + Math.sin(a + 0.05) * r1); g.stroke();
      }
      g.lineWidth = 8; g.strokeStyle = 'rgba(15,18,12,.85)'; g.beginPath(); g.arc(256, 256, 94, 0, 6.29); g.stroke();
      g.fillStyle = '#050505'; g.beginPath(); g.arc(256, 256, 36, 0, 6.29); g.fill();
    });
    const veinMap = eyeTex(1024, 512, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      const sg = g.createRadialGradient(256, 256, 96, 256, 256, 300); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.25, 'rgba(255,255,255,.22)'); sg.addColorStop(1, 'rgba(255,255,255,.4)');
      g.fillStyle = sg; g.fillRect(0, 0, 640, h);                                   // a general flush of the white
      veins.forEach(v => { v.w *= 2.2; }); drawVeins(g, '#ffffff', 1); veins.forEach(v => { v.w /= 2.2; });
    });
    const mBall = new THREE.MeshStandardMaterial({ map: ball, roughness: 0.18, metalness: 0, emissive: col('#ff1e1e'), emissiveMap: veinMap, emissiveIntensity: 0 });
    const eyeG = new THREE.Group(); scene.add(eyeG);
    const eyeball = new THREE.Mesh(new THREE.SphereGeometry(1, 72, 48), mBall); eyeG.add(eyeball);
    const corneaGeo = new THREE.SphereGeometry(1.025, 48, 16, 0, Math.PI * 2, 0, 0.62); corneaGeo.rotateX(Math.PI / 2);
    const mCornea = new THREE.MeshStandardMaterial({ color: col('#ffffff'), transparent: true, opacity: 0.12, roughness: 0.04, metalness: 0.2, depthWrite: false });
    eyeG.add(new THREE.Mesh(corneaGeo, mCornea));
    // ---- lids: a skin shell with an almond hole, plus the face around it
    const lidTex = eyeTex(1024, 512, (g, w, h) => {
      const lg = g.createLinearGradient(0, 0, 0, h);
      lg.addColorStop(0, shade(SKIN, -0.15)); lg.addColorStop(0.42, SKIN); lg.addColorStop(0.6, shade(SKIN, 0.04)); lg.addColorStop(1, shade(SKIN, -0.12));
      g.fillStyle = lg; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(90,40,30,.35)'; g.lineWidth = 6; g.beginPath(); g.ellipse(256, 236, 190, 110, 0, Math.PI * 1.08, Math.PI * 1.92); g.stroke();   // crease
      g.save(); eyeAlmond(g, 1.06); g.fillStyle = '#9a5446'; g.fill(); g.restore();                                                    // lid margin
      const rl = rng(7);
      g.strokeStyle = '#1a0f0b'; g.lineCap = 'round';
      for (let i = 0; i < 70; i++) {                                                                                             // upper lashes
        const u = -0.95 + 1.9 * i / 69, x = 256 + u * 150 * 1.04, y = 256 - 70 * 1.04 * Math.pow(1 - u * u, 0.75) + 6 * u;
        const L = (18 + rl() * 18) * (1 - 0.5 * u * u), a = -Math.PI / 2 + u * 0.9 + (rl() - 0.5) * 0.3;
        g.lineWidth = 2 + rl() * 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.6, y + Math.sin(a) * L * 0.6, x + Math.cos(a + 0.4 * Math.sign(u || 1)) * L, y + Math.sin(a) * L * 0.9); g.stroke();
      }
      for (let i = 0; i < 34; i++) {                                                                                             // lower lashes
        const u = -0.85 + 1.7 * i / 33, x = 256 + u * 150 * 1.04, y = 256 + 52 * 1.04 * Math.pow(1 - u * u, 0.85) + 6 * u;
        const L = 8 + rl() * 8, a = Math.PI / 2 + u * 0.7;
        g.lineWidth = 1.5 + rl(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke();
      }
      g.globalCompositeOperation = 'destination-out'; eyeAlmond(g, 1); g.fill(); g.globalCompositeOperation = 'source-over';
    });
    const mLid = new THREE.MeshStandardMaterial({ map: lidTex, alphaTest: 0.5, roughness: 0.62, side: THREE.DoubleSide });
    const lids = new THREE.Mesh(new THREE.SphereGeometry(1.06, 72, 48), mLid); scene.add(lids);
    const faceTex = eyeTex(1024, 1024, (g, w, h) => {
      const fg = g.createRadialGradient(512, 512, 40, 512, 512, 512);
      fg.addColorStop(0, shade(SKIN, -0.2)); fg.addColorStop(0.16, SKIN); fg.addColorStop(0.5, shade(SKIN, -0.08)); fg.addColorStop(1, shade(SKIN, -0.45));
      g.fillStyle = fg; g.fillRect(0, 0, w, h);
      const rb = rng(13); g.strokeStyle = '#3a2418'; g.lineCap = 'round';                                                         // brow
      for (let i = 0; i < 160; i++) {
        const u = rb(), x = 512 - 150 + u * 300, y = 512 - 118 - 26 * Math.sin(u * Math.PI) + (rb() - 0.5) * 14;
        g.globalAlpha = 0.5 + rb() * 0.4; g.lineWidth = 2 + rb() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14 + rb() * 10, y - 4 - rb() * 6); g.stroke();
      }
      g.globalAlpha = 1;
      const rp = rng(17);                                                                                                        // skin pores
      for (let i = 0; i < 1800; i++) { g.fillStyle = rp() < 0.5 ? 'rgba(80,35,25,.12)' : 'rgba(255,220,200,.08)'; g.fillRect(rp() * w, rp() * h, 2, 2); }
    });
    const face = new THREE.Mesh(new THREE.RingGeometry(0.86, 9, 96, 1), new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.7 }));
    face.position.z = 0.6; scene.add(face);
    scene.add(new THREE.HemisphereLight(0xfff1e6, 0x2a1410, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-3, 4, 6); scene.add(key);
    const rim = new THREE.PointLight(col(pal.accent2), 25, 14); rim.position.set(3, -2, 3); scene.add(rim);
    const spec = glowSprite('#ffffff', 0.22, 0.9); spec.position.set(-0.28, 0.3, 1.08); scene.add(spec);
    // ---- gas molecules flying in from below-left
    const aG = new THREE.SphereGeometry(1, 16, 12);
    const NM = mode === 'gas' ? 16 : 0;
    const atomC = new THREE.InstancedMesh(aG, new THREE.MeshStandardMaterial({ color: col('#d8d8dc'), roughness: 0.35 }), Math.max(1, NM * 2));
    const atomS = new THREE.InstancedMesh(aG, new THREE.MeshStandardMaterial({ color: col('#ffd23f'), emissive: col('#ffb000'), emissiveIntensity: 0.35, roughness: 0.3 }), Math.max(1, NM));
    const atomO = new THREE.InstancedMesh(aG, new THREE.MeshStandardMaterial({ color: col('#ff4b3a'), emissive: col('#ff2a10'), emissiveIntensity: 0.2, roughness: 0.3 }), Math.max(1, NM));
    if (NM) scene.add(atomC, atomS, atomO);
    const mols = Array.from({ length: NM }, (_, i) => {
      const halo = glowSprite(gasCol, 0.6, 0); scene.add(halo);
      const ping = glowSprite(RED, 0.4, 0); ping.material.blending = THREE.NormalBlending; scene.add(ping);
      const tx = (r() - 0.5) * 1.1, ty = (r() - 0.5) * 0.36;
      return { halo, ping, from: V3(-2.6 + r() * 1.6, -3.4 - r() * 1.6, 1.6 + r() * 1.6), to: V3(tx, ty, Math.sqrt(Math.max(0.1, 1.1 - tx * tx - ty * ty)) + 0.06),
        k: i / NM, ph: r() * 6.28, sp: [r() * 3, r() * 3, r() * 3] };
    });
    // ---- tears
    const NT = mode === 'tears' ? 5 : 0;
    const mTear = new THREE.MeshStandardMaterial({ color: col('#d8f4ff'), transparent: true, opacity: 0.78, roughness: 0.02, metalness: 0.25, emissive: col(pal.accent2), emissiveIntensity: 0.18 });
    const tears = Array.from({ length: NT }, (_, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), mTear); scene.add(m);
      const hl = glowSprite('#ffffff', 0.08, 0); scene.add(hl);
      const u = -0.7 + 1.4 * ((i * 0.618) % 1);
      return { m, hl, x: u * 0.85, k: i, delay: i * 0.4 + r() * 0.15, sz: 0.13 + r() * 0.05 };
    });
    let pool = null, gland = null;
    if (NT) {
      const pts = Array.from({ length: 24 }, (_, i) => { const u = -0.86 + 1.72 * i / 23, x = u * 0.84, y = -0.34 * Math.pow(1 - u * u, 0.85) - 0.02;
        return V3(x, y, Math.sqrt(Math.max(0.05, 1.13 - x * x - y * y)) + 0.01); });
      pool = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.035, 10), mTear); scene.add(pool);
      gland = glowSprite(pal.accent2, 0.9, 0); gland.position.set(0.95, 0.62, 0.62); scene.add(gland);
    }
    const camDef = mode === 'tears' ? { dist: portrait ? 8.0 : 5.6, yaw: 6, pitch: 4, ty: portrait ? -0.75 : -0.3, fov: portrait ? 40 : 34, sy: portrait ? 0.2 : 0, drift: 0.9 } : { dist: portrait ? 6.4 : 4.6, yaw: 6, pitch: 4, ty: portrait ? -0.3 : 0, fov: portrait ? 40 : 34, sy: portrait ? 0.26 : 0, drift: 0.9 };
    const camAt = (lt, dur, env) => shotCam(Object.assign({}, P, { camera: Object.assign({}, camDef, P.camera || {}) }), env, lt, dur);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), eu = new THREE.Euler(), sc = V3(1, 1, 1), pos = V3(0, 0, 0);
    return {
      camAt,
      update(lt, dur, cues, env) {
        const t = env.t, hit = cue(cues, 'hit', Math.min(1.2, dur * 0.4));
        applyCam(camera, camAt(lt, dur, env), W, H);
        // idle saccades; a flinch at the hit
        const fl = punch(lt, hit, 0.8);
        eyeG.rotation.y = 0.12 * Math.sin(t * 0.7) + 0.05 * Math.sin(t * 2.3) + 0.08 * fl;
        eyeG.rotation.x = 0.06 * Math.sin(t * 0.9 + 1) - 0.1 * fl;
        const red0 = P.red ?? (mode === 'tears' ? 0.7 : 0);
        const redden = mode === 'gas' ? prog(lt, hit - 0.2, 0.9) : red0;
        mBall.emissiveIntensity = 1.6 * redden * (0.8 + 0.2 * Math.sin(t * 5)) + 0.6 * fl;
        spec.material.opacity = 0.7 + 0.25 * Math.sin(t * 3);
        if (NM) {
          mols.forEach((m, i) => {
            const arr = hit + (m.k - 0.35) * 0.8, a0 = arr - 1.5;           // fly for 1.5 s, land around the hit word
            const p = progIO(lt, a0, 1.5);
            const x = lerp(m.from.x, m.to.x, p) + 0.15 * Math.sin(t * 1.7 + m.ph) * (1 - p);
            const y = lerp(m.from.y, m.to.y, p) + 0.12 * Math.cos(t * 1.3 + m.ph) * (1 - p);
            const z = lerp(m.from.z, m.to.z, p);
            const s = (1 - 0.6 * prog(lt, arr + 0.2, 0.8)) * clamp01((lt - a0 + 1.2) * 2) * 0.85;
            eu.set(m.sp[0] * t, m.sp[1] * t, m.sp[2] * t); q.setFromEuler(eu);
            const atom = (mesh, idx, ox, oy, oz, rad) => { const v = V3(ox, oy, oz).multiplyScalar(s).applyQuaternion(q); sc.setScalar(Math.max(0.0001, rad * s)); m4.compose(pos.set(x + v.x, y + v.y, z + v.z), q, sc); mesh.setMatrixAt(idx, m4); };
            atom(atomS, i, 0, 0, 0, 0.075); atom(atomO, i, 0.12, 0.07, 0, 0.06);
            atom(atomC, i * 2, -0.13, 0.03, 0.03, 0.065); atom(atomC, i * 2 + 1, -0.22, -0.09, -0.02, 0.065);
            m.halo.position.set(x, y, z); m.halo.scale.setScalar(0.5 * s + 0.08 * Math.sin(t * 3 + m.ph)); m.halo.material.opacity = 0.45 * clamp01(s);
            const pk = lt >= arr ? Math.exp(-(lt - arr) * 2.5) : 0;
            const hp = punch(lt, hit, 1.0);
            m.ping.position.copy(m.to).multiplyScalar(1.04); m.ping.scale.setScalar(0.5 + 0.5 * (1 - pk) + 0.4 * hp);
            m.ping.material.opacity = Math.min(1, 1.0 * pk + 0.8 * hp * (lt >= arr - 0.3 ? 1 : 0));
          });
          for (const mesh of [atomC, atomS, atomO]) mesh.instanceMatrix.needsUpdate = true;
        }
        if (NT) {
          gland.material.opacity = 0.25 + 0.6 * punch(lt, hit, 1.2) + 0.15 * Math.sin(t * 4);
          gland.scale.setScalar(0.9 + 0.8 * punch(lt, hit, 1.2));
          const well = prog(lt, hit - 0.2, 0.6);
          pool.scale.set(1, 1, 1); pool.material.opacity = 0.78;
          pool.visible = well > 0.02;
          mCornea.opacity = 0.12 + 0.18 * well;
          tears.forEach(d => {
            const a = lt - Math.min(hit, 0.5) - d.delay;
            if (a < 0) { d.m.visible = false; d.hl.material.opacity = 0; return; }
            const per = 2.6, aa = a % per, grow = clamp01(aa / 0.4);
            const fall = Math.max(0, aa - 0.5), x = d.x + 0.04 * Math.sin(fall * 3 + d.k);
            const y = -0.36 * Math.pow(1 - (d.x / 0.84) ** 2, 0.85) - 0.08 - 0.7 * fall - 0.2 * fall * fall;
            const z = Math.max(0.66, Math.sqrt(Math.max(0, 1.15 - x * x - y * y)) + 0.04);
            const s = d.sz * (0.35 + 0.65 * grow);
            d.m.visible = y > -1.75; d.m.position.set(x, y, z); d.m.scale.set(s, s * (1 + 0.6 * clamp01(fall * 2)), s * 0.6);
            d.hl.position.set(x - s * 0.3, y + s * 0.4, z + s); d.hl.material.opacity = 0.9; d.hl.scale.setScalar(s * 1.2);
          });
        }
      },
    };
  },
};
